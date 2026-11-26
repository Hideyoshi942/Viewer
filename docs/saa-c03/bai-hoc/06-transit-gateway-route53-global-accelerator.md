# Định tuyến Toàn cầu & Mạng Phức hợp (SAA-C03 Domain 2)

Khi hệ thống mở rộng từ vài VPC lên hàng chục/hàng trăm VPC và phục vụ người dùng toàn cầu, việc chọn đúng kiến trúc định tuyến (Transit Gateway vs Peering) và tối ưu hóa đường truyền toàn cầu (Route 53 vs CloudFront vs Global Accelerator) là chìa khóa đạt điểm tối đa ở Domain 2 và Domain 3.

---

## 1. AWS Transit Gateway (TGW) vs VPC Peering

| Tiêu chí | VPC Peering | AWS Transit Gateway (TGW) |
| :--- | :--- | :--- |
| **Mô hình kết nối** | Point-to-Point (1-1). 10 VPC cần `10*9/2 = 45` kết nối! | **Hub-and-Spoke** (10 VPC chỉ cần 10 attachments) |
| **Transitive Routing (Bắc cầu)** | **Không** | **Có** (A ↔ TGW ↔ B ↔ On-Premises) |
| **Hỗ trợ Overlapping CIDR** | **Không** (Trùng IP là không tạo được) | **Không** (Dùng PrivateLink nếu trùng CIDR) |
| **Cross-Region** | Có (hỗ trợ Inter-Region Peering) | Có (Inter-Region TGW Peering) |
| **Băng thông** | Không giới hạn cứng ở mức kết nối | Lên tới **50 Gbps** mỗi VPC attachment (có thể burst) |
| **ECMP cho VPN** | Không (chỉ 1.25 Gbps/tunnel) | **Có** (Cộng gộp nhiều VPN tunnels để tăng băng thông lên hàng chục Gbps) |
| **Chi phí** | **Miễn phí** tạo kết nối; chỉ trả phí Data Transfer ($0.01–$0.02/GB) | Trả phí **$0.05/giờ/attachment** + **$0.02/GB** xử lý dữ liệu |

> **Exam Tip**: Chỉ có **2 VPC** muốn giao tiếp băng thông cực lớn với chi phí thấp nhất → **VPC Peering**. Có **nhiều VPC (≥ 3) + kết nối On-Premises VPN/Direct Connect tập trung** → **AWS Transit Gateway**.

---

## 2. Amazon Route 53 Routing Policies

Đề thi SAA-C03 cực kỳ thích hỏi cách chọn **Routing Policy** phù hợp với tình huống kinh doanh:

| Routing Policy | Cơ chế hoạt động | Kịch bản sử dụng thực tế |
| :--- | :--- | :--- |
| **Simple** | Trả về 1 hoặc nhiều IP ngẫu nhiên (không hỗ trợ Health Check) | Website đơn giản, 1 tài nguyên duy nhất. |
| **Weighted** | Phân chia traffic theo tỷ lệ trọng số (ví dụ: 90% bản cũ, 10% bản mới) | **Blue/Green Deployment, Canary Testing**, A/B testing. |
| **Latency-based** | Định tuyến người dùng tới Region có **độ trễ mạng thấp nhất** | Ứng dụng đa Region phục vụ người dùng toàn cầu muốn tối ưu tốc độ. |
| **Failover** | **Active-Passive**: Luôn gửi về Primary; chỉ chuyển sang Secondary khi Primary **trượt Health Check** | **Disaster Recovery** (chuyển sang S3 Static Website bảo trì hoặc Region dự phòng). |
| **Geolocation** | Định tuyến dựa trên **vị trí địa lý chính xác** (Quốc gia/Châu lục) của người dùng | **Tuân thủ pháp lý / Bản quyền nội dung** (ví dụ: chỉ người dùng ở Đức mới vào server EU, chặn quốc gia khác). |
| **Geoproximity** | Định tuyến dựa trên khoảng cách địa lý + tham số **Bias** (mở rộng/thu hẹp vùng phủ sóng của 1 Region) | Cần điều chỉnh lưu lượng thủ công giữa các Region dựa trên tải thực tế. |
| **IP-based** | Định tuyến dựa trên **dải IP nguồn (CIDR)** của client | Tối ưu cho ISP hoặc khách hàng doanh nghiệp có IP cố định. |
| **Multivalue Answer** | Trả về tối đa **8 bản ghi IP khỏe mạnh (Healthy)** ngẫu nhiên | Thay thế đơn giản cho Load Balancer ở tầng DNS (có Health Check). |

### Route 53 Resolver (Hybrid DNS)
- **Inbound Endpoint**: Cho phép máy chủ **On-premises** phân giải tên miền nội bộ nằm trong **Route 53 Private Hosted Zone** trên AWS.
- **Outbound Endpoint**: Cho phép **EC2 trên AWS** phân giải tên miền nội bộ nằm ở **DNS Server On-premises** (ví dụ `corp.internal`) thông qua Forwarding Rules.

---

## 3. Amazon CloudFront vs AWS Global Accelerator

Đây là cặp dịch vụ hay gây nhầm lẫn nhất trong kỳ thi SAA-C03:

| Tiêu chí | Amazon CloudFront | AWS Global Accelerator |
| :--- | :--- | :--- |
| **Bản chất** | **CDN (Content Delivery Network)** — Cache nội dung tại > 600 Edge Locations | **Network Layer Optimizer** — Đưa traffic vào mạng trục (AWS Global Backbone) ngay tại Edge gần nhất |
| **Giao thức hỗ trợ** | Chỉ **HTTP / HTTPS** (và WebSockets) | **TCP và UDP** (tất cả port, không cần HTTP) |
| **Địa chỉ IP** | IP động (thay đổi liên tục) | **2 địa chỉ Anycast Static IP cố định** toàn cầu |
| **Caching** | **Có** (Cache ảnh, video, JS, API response) | **Không** (Mọi request đều đi thẳng về Origin) |
| **Failover** | Mất vài chục giây đến vài phút (do DNS TTL) | **Dưới 1 phút** (không phụ thuộc DNS caching của client!) |
| **Origin** | S3, ALB, API Gateway, Custom HTTP server | ALB, NLB, EC2 Instances, Elastic IP |
| **Khi nào chọn?** | Tăng tốc Web/Video/API động & tĩnh, cần **WAF/OAC**, giảm tải cho S3/Origin | **Gaming, IoT (MQTT/UDP), VoIP**, hoặc khách hàng yêu cầu **IP cố định để whitelist firewall**, hoặc cần **failover tức thì không qua DNS**. |

### Bảo mật Origin với CloudFront
- **S3 Origin**: Dùng **Origin Access Control (OAC)** (phiên bản mới thay thế OAI) để chặn hoàn toàn người dùng truy cập trực tiếp S3 URL, bắt buộc phải đi qua CloudFront. *(OAC hỗ trợ cả SSE-KMS, trong khi OAI cũ không hỗ trợ tốt)*.
- **ALB Origin**: Dùng **CloudFront Custom Header** (ví dụ `X-Origin-Verify: secret`) + cấu hình **ALB Listener Rule** chỉ cho phép request có header này, hoặc dùng **AWS Managed Prefix List for CloudFront** trong Security Group của ALB!

---

## 4. Bẫy đề thi SAA-C03 (Exam Traps)
1. **Geolocation vs Latency**: Đề bài nói *"Tuân thủ luật GDPR, dữ liệu người dùng ở Châu Âu phải xử lý tại Region `eu-central-1`"* → **Geolocation** (KHÔNG dùng Latency vì có thể người dùng ở biên giới sẽ bị route sang Region khác nhanh hơn!).
2. **Static IP + Non-HTTP (UDP/TCP)**: Thấy *"2 static IP addresses for firewall whitelisting"* hoặc *"UDP gaming traffic across multiple Regions"* → **AWS Global Accelerator**.
3. **Alias Record vs CNAME trong Route 53**:
   - **CNAME**: Không tạo được ở **Zone Apex** (`example.com`), chỉ tạo được cho subdomain (`www.example.com`), và tốn phí DNS query khi trỏ tới AWS resource.
   - **Alias Record** (tính năng độc quyền của Route 53): Tạo được ở **Zone Apex (`example.com`)**, trỏ trực tiếp tới ALB, CloudFront, S3 Website, API Gateway, và **Miễn phí DNS queries**!

---

[← Bài trước](05-vpc-hybrid-networking.md) | [Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/06-transit-gateway-dns-global.md) | [Bài tiếp →](07-ec2-elb-asg-decoupling.md)
