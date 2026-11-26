# Route 53 DNSSEC, Split-Horizon DNS, PrivateLink DNS & ARC Zonal Shift

Độ tin cậy và bảo mật của tầng DNS cùng khả năng điều hướng lưu lượng khi xảy ra sự cố cấp Availability Zone (AZ) là mảng kiến thức quan trọng trong Domain 2 và Domain 3 của **ANS-C01**. Bài học này tổng hợp cơ chế **DNSSEC**, **Split-Horizon DNS**, **PrivateLink Private DNS** và **Route 53 Profiles / ARC Zonal Shift**.

## 1. Route 53 DNSSEC Signing & Resolver Validation

DNSSEC (DNS Security Extensions) bảo vệ client khỏi tấn công **DNS Cache Poisoning / Spoofing** bằng chữ ký số bất đối xứng (không mã hóa nội dung DNS query).

### Hai thành phần khi bật DNSSEC Signing trên Public Hosted Zone
1. **KSK (Key-Signing Key)**: Dùng **AWS KMS asymmetric CMK** (`ECC_NIST_P256` đặt tại **`us-east-1`** — bắt buộc đối với Route 53 bất kể workload ở Region nào). KSK ký lên ZSK.
2. **ZSK (Zone-Signing Key)**: Do Route 53 tự quản lý và xoay vòng (rotate) tự động. ZSK ký lên các bản ghi DNS (`A`, `AAAA`, `MX`, v.v.) tạo ra `RRSIG`.
3. **DS Record (Delegation Signer)**: Sau khi bật DNSSEC trên Hosted Zone, bạn phải lấy **DS record** từ Route 53 và cấu hình tại **Domain Registrar** (Parent Zone, ví dụ `.com`) để hoàn tất **Chain of Trust**.

### Route 53 Resolver DNSSEC Validation
- Mặc định, Route 53 Resolver (`.2` trong VPC) **không** kiểm tra chữ ký DNSSEC.
- Bạn phải bật **DNSSEC Validation** cho từng VPC (`enable-dnssec-validation`): khi đó nếu chữ ký không hợp lệ (`BOGUS`), Resolver trả về **`SERVFAIL`**; nếu hợp lệ trả về cờ **`AD` (Authenticated Data)**.

> **Exam Tip**:
> - KSK cho Route 53 Public Hosted Zone bắt buộc phải là **Customer Managed Key (ECC_NIST_P256)** tạo ở **`us-east-1`**.
> - Private Hosted Zone **không hỗ trợ** DNSSEC signing.

## 2. Split-Horizon DNS & Route 53 Profiles

**Split-Horizon (Split-View) DNS** sử dụng **cùng một tên miền** (ví dụ `app.corp.internal` hoặc `api.example.com`) cho cả **Public Hosted Zone** và **Private Hosted Zone**:
- Người dùng từ Internet truy vấn `api.example.com` -> nhận Public IP của CloudFront/ALB từ Public Hosted Zone.
- Workload trong VPC (liên kết với Private Hosted Zone) truy vấn `api.example.com` -> nhận Private IP nội bộ (ALB internal hoặc PrivateLink).
- **Quy tắc ưu tiên của Route 53 Resolver**: Trong VPC, **Private Hosted Zone luôn được ưu tiên** nếu khớp domain/subdomain; nếu không tìm thấy bản ghi cụ thể trong Private Hosted Zone (ví dụ hỏi `blog.example.com` chỉ có ở Public), Resolver **không fallback** ra Public nếu `example.com` đã tồn tại ở Private (trả về `NXDOMAIN`)!

### Amazon Route 53 Profiles
**Route 53 Profiles** cho phép đóng gói tập hợp cấu hình DNS chuẩn hóa gồm:
- Private Hosted Zones (PHZ)
- Route 53 Resolver Rules (Forwarding rules về on-premises)
- Route 53 Resolver DNS Firewall Rule Groups
- DNSSEC Validation settings
Sau đó chia sẻ Profile qua **AWS RAM** và **associate** vào hàng trăm VPC trên nhiều tài khoản chỉ với 1 bước, thay thế việc associate thủ công từng rule/PHZ cho từng VPC.

> **Exam Tip**: Khi cần áp dụng đồng nhất Private Hosted Zones + Resolver Forwarding Rules + DNS Firewall cho hàng trăm VPC mới tạo trong AWS Organizations, chọn **Route 53 Profiles + AWS RAM**.

## 3. PrivateLink Private DNS Name Verification

Khi Service Provider tạo **VPC Endpoint Service (PrivateLink)** và muốn Service Consumer truy cập bằng tên miền thân thiện (ví dụ `api.saas-provider.com`) thay vì tên DNS mặc định dài của endpoint (`vpce-xxxx.vpce-svc-yyyy.amazonaws.com`):

| Bước | Hành động của Service Provider | Hành động của Service Consumer |
| :--- | :--- | :--- |
| **1** | Cấu hình **Private DNS name** (`api.saas-provider.com`) trên Endpoint Service | Tạo Interface VPC Endpoint trỏ tới Service Name |
| **2** | Lấy **TXT verification record** từ AWS và thêm vào Public DNS của `saas-provider.com` | Bật tùy chọn **`Enable Private DNS Name`** trên Interface Endpoint |
| **3** | Đợi AWS xác minh quyền sở hữu domain (**Domain Ownership Verification**) | Route 53 tự tạo Private Hosted Zone ẩn trỏ `api.saas-provider.com` về ENI của Interface Endpoint |

> **Exam Tip**: Nếu Consumer báo lỗi không thể bật **Private DNS Name** trên Interface Endpoint hoặc traffic vẫn đi ra Internet, nguyên nhân thường gặp nhất là: (1) Provider chưa hoàn tất xác minh bản ghi **TXT** trên Public DNS, hoặc (2) VPC của Consumer chưa bật **`enableDnsHostnames`** và **`enableDnsSupport`**.

## 4. Application Recovery Controller (ARC) — Zonal Shift & Zonal Autoshift

Khi một **Availability Zone (AZ)** gặp sự cố cục bộ (gray failure, packet loss, power degradation) mà Health Check thông thường chưa kịp cắt bỏ hoàn toàn:
- **Zonal Shift**: Cho phép bạn **chủ động** chuyển 100% traffic của ALB, NLB, EC2 Auto Scaling Group hoặc EKS ra khỏi AZ đang lỗi chỉ trong vài giây (bằng cách ngừng trả về IP của node/LB tại AZ đó trong DNS và rút khỏi target group).
- **Zonal Autoshift**: AWS tự động phát hiện sự cố AZ dựa trên telemetry nội bộ và tự động dịch chuyển traffic giúp bạn (bạn chỉ cần cấu hình Practice Run để kiểm chứng capacity các AZ còn lại).

```bash
# Kích hoạt Zonal Shift đẩy traffic khỏi us-east-1a trong 2 giờ
aws arc-zonal-shift start-zonal-shift \
  --resource-identifier arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/my-alb/12345 \
  --away-from use1-az1 --expires-in 2h --comment "Packet loss in AZ1"
```

> **Exam Tip**: Để sử dụng **ARC Zonal Shift** với ALB/NLB, **Cross-Zone Load Balancing** phải được **TẮT** (đối với NLB) hoặc kiến trúc ứng dụng phải có đủ capacity ở các AZ còn lại để gánh traffic khi 1 AZ bị loại khỏi DNS/routing.

---

[← Bài trước](06-routing-bgp-implementation.md) | [Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/07-dns-route53-hybrid.md) | [Bài tiếp →](08-privatelink-vpc-lattice-elb.md)
