# IPv6 Dual-Stack, IPv6-Only, VPC IPAM & Prefix Lists

Khi hạ tầng cloud mở rộng đa tài khoản và đa Region, bài toán cạn kiệt IPv4 RFC 1918 và quản lý dải địa chỉ tập trung trở thành trọng tâm trong kỳ thi **ANS-C01**. Bài học này phân tích sâu kiến trúc IPv6 trên AWS, cơ chế chuyển tiếp NAT64/DNS64, quản trị IP tự động với **Amazon VPC IPAM** và tối ưu bảng định tuyến/Security Group bằng **Prefix Lists**.

## 1. IPv6 Dual-Stack vs. IPv6-Only Subnets

Mỗi VPC có thể gán tối đa 5 IPv4 CIDR và tối đa 5 IPv6 `/56` CIDR (subnet mặc định là `/64`). Tất cả địa chỉ IPv6 trên AWS đều là **publicly routable** (GUA — Global Unicast Address) và không có khái niệm NAT cho IPv6-to-IPv6.

| Tiêu chí | Dual-Stack Subnet | IPv6-Only Subnet |
| :--- | :--- | :--- |
| **Địa chỉ trên ENI** | Cả IPv4 và IPv6 | Chỉ IPv6 (không có private IPv4) |
| **Giao tiếp tới IPv4-only endpoints** | Dùng trực tiếp IPv4 qua IGW hoặc NAT Gateway | Phải bật **DNS64** + đi qua **NAT64** trên NAT Gateway |
| **Egress IPv6 ra Internet** | Internet Gateway (IGW) hoặc **Egress-Only IGW (EIGW)** | IGW hoặc EIGW (tùy Public/Private subnet) |
| **Yêu cầu Nitro** | Mọi EC2 instance | Bắt buộc Nitro-based EC2 instances |

### Egress-Only Internet Gateway (EIGW)
- **EIGW** hoạt động giống NAT Gateway nhưng dành riêng cho **IPv6**: cho phép instance trong private subnet khởi tạo kết nối IPv6 **outbound** ra Internet nhưng **chặn toàn bộ kết nối inbound** khởi tạo từ Internet.
- Route table trong private subnet trỏ `::/0` -> `eigw-xxxx` (không dùng `igw-xxxx`).

> **Exam Tip**: Nếu đề bài yêu cầu instance trong private subnet chỉ được phép gửi traffic IPv6 ra ngoài (outbound-only) mà không nhận kết nối từ Internet, chọn **Egress-Only Internet Gateway (EIGW)** — không phải NAT Gateway (NAT Gateway không NAT IPv6 sang IPv6).

## 2. Cơ chế NAT64 và DNS64 cho IPv6-Only Workloads

Khi workload chạy trong **IPv6-only subnet** cần gọi tới dịch vụ chỉ hỗ trợ IPv4 (on-premises legacy, AWS S3/DynamoDB endpoints cũ, hoặc đối tác ngoài Internet):

1. **DNS64 (trên Route 53 Resolver)**: Khi EC2 IPv6-only truy vấn bản ghi `AAAA` cho domain chỉ có bản ghi `A` (IPv4), DNS64 tổng hợp địa chỉ IPv6 bằng cách ghép tiền tố chuẩn **`64:ff9b::/96`** với 32-bit IPv4 đích (ví dụ `198.51.100.1` -> `64:ff9b::198.51.100.1`).
2. **NAT64 (trên NAT Gateway)**: Subnet IPv6-only có route `64:ff9b::/96` trỏ tới **NAT Gateway** nằm trong dual-stack subnet. NAT Gateway dịch gói tin IPv6 sang IPv4 và gửi tới đích (qua IGW, TGW hoặc Direct Connect).

```bash
# Bật DNS64 trên subnet IPv6-only và kiểm tra route NAT64
aws ec2 modify-subnet-attribute --subnet-id subnet-0abc1234 --enable-dns64
aws ec2 create-route --route-table-id rtb-0ipv6only \
  --destination-ipv6-cidr-block 64:ff9b::/96 --nat-gateway-id nat-0dualstack
```

> **Exam Tip**: Để IPv6-only EC2 kết nối tới dịch vụ IPv4 nội bộ qua Transit Gateway hoặc Direct Connect, đặt NAT Gateway ở **dual-stack subnet** có route tới TGW/VGW và cấu hình `64:ff9b::/96 -> nat-gw`.

## 3. Amazon VPC IPAM (IP Address Manager)

**VPC IPAM** tự động hóa việc lập kế hoạch, cấp phát và giám sát CIDR across AWS Organizations (hỗ trợ cả IPv4, IPv6 và BYOIP).

- **IPAM Scope**: Ranh giới không gian IP không chồng lấn. Mặc định có **Private Scope** (RFC 1918) và **Public Scope** (BYOIP/AWS-provided IPv6). Có thể tạo thêm Custom Private Scope cho môi trường tách biệt (ví dụ M&A có IP trùng lặp).
- **IPAM Pool**: Phân cấp theo cây: **Top-level Pool** (tổng dải, ví dụ `10.0.0.0/8`) -> **Regional Pool** (`10.10.0.0/16` cho `us-east-1`) -> **Environment Pool** (Prod/Dev).
- **Allocation Rules**: Thiết lập min/max/default netmask length và tag/RAM share để các member account tự động request CIDR khi tạo VPC mà không lo xung đột.
- **IPAM Resource Discovery & Monitoring**: Theo dõi tỷ lệ sử dụng IP, phát hiện **overlapping CIDRs** và lịch sử cấp phát IP cho audit.

> **Exam Tip**: Khi câu hỏi nhắc đến *"prevent overlapping CIDR blocks across hundreds of accounts in AWS Organizations"* hoặc *"automate CIDR allocation with minimum netmask enforcement"*, đáp án chuẩn là **Amazon VPC IPAM** kết hợp **AWS RAM** để share Pool.

## 4. Managed Prefix Lists (Customer-Managed & AWS-Managed)

**Prefix List** là tập hợp một hoặc nhiều CIDR blocks được gom thành một object duy nhất để tham chiếu trong **Security Groups**, **VPC Route Tables**, **Subnet Network ACLs** (không hỗ trợ trực tiếp trong NACL — chỉ SG và Route Table) và **Transit Gateway Route Tables**.

| Loại Prefix List | Đặc điểm chính | Hạn mức (Quota) |
| :--- | :--- | :--- |
| **AWS-Managed Prefix List** | Do AWS quản lý & tự động cập nhật (S3, DynamoDB, CloudFront Origin-facing, Route 53 Health Checkers) | Dùng trực tiếp trong SG và Route Table; mỗi entry chỉ tính **1 rule** (hoặc weight theo max entries tùy service) |
| **Customer-Managed Prefix List** | Do bạn tạo, hỗ trợ versioning, có thể chia sẻ qua **AWS RAM** cho các account khác | Có thuộc tính **`MaxEntries`** (cố định khi tạo, không đổi được sau khi tạo) — tính vào SG/Route Table quota bằng đúng `MaxEntries` |

```json
{
  "PrefixListName": "corp-branch-cidrs",
  "MaxEntries": 20,
  "AddressFamily": "IPv4",
  "Entries": [
    { "Cidr": "10.20.0.0/16", "Description": "HCM Branch" },
    { "Cidr": "10.30.0.0/16", "Description": "HN Branch" }
  ]
}
```

> **Exam Tip**:
> 1. Nếu bạn muốn giới hạn ALB/EC2 Security Group chỉ nhận traffic từ **Amazon CloudFront** mà không phải tự cập nhật IP list, dùng AWS-managed prefix list `com.amazonaws.global.cloudfront.origin-facing`.
> 2. **MaxEntries** của Customer-Managed Prefix List **không thể thay đổi** sau khi tạo; nếu đặt quá lớn sẽ tiêu tốn quota rule của Security Group (mặc định 60 rules/SG).

---

[← Bài trước](04-edge-cloudfront-global-accelerator.md) | [Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/05-ipv6-ipam-prefix.md) | [Bài tiếp →](06-routing-bgp-implementation.md)
