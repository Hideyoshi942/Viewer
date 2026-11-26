# Cheatsheet 2: Kiến trúc Mạng & Hybrid Cloud (SAA-C03 Domain 2)

## 1. VPC Core & Security Group vs NACL
- **5 Reserved IPs mỗi Subnet**: `.0` (Network), `.1` (Router), `.2` (DNS), `.3` (Future), `.255` (Broadcast). Subnet `/28` (16 IP) → chỉ dùng được **11 IP**.
- **Security Group**: Cấp ENI, **Stateful**, chỉ có **Allow**, tham chiếu được SG khác.
- **Network ACL (NACL)**: Cấp Subnet, **Stateless** (phải mở cả Inbound + Outbound **Ephemeral `1024-65535`**), có **Allow & Deny** (dùng để **chặn IP cụ thể**).
- **NAT Gateway**: Nằm ở Public Subnet trong **1 AZ**. Cần HA → Tạo **1 NAT Gateway mỗi AZ**.
- **IPv6 Outbound-only cho Private Subnet**: **Egress-Only Internet Gateway**.

---

## 2. Gateway VPC Endpoint vs Interface VPC Endpoint (PrivateLink)
| Tiêu chí | Gateway Endpoint | Interface Endpoint (PrivateLink) |
| :--- | :--- | :--- |
| **Dịch vụ hỗ trợ** | **CHỈ S3 và DynamoDB** | Hầu hết dịch vụ AWS + Dịch vụ riêng qua **NLB** |
| **Chi phí** | **$0 (Miễn phí 100%)** | Tính phí theo giờ + GB |
| **Truy cập từ On-Premises (VPN/DX)** | **KHÔNG** | **CÓ** (có Private IP từ ENI trong Subnet) |
| **Trùng CIDR giữa 2 VPC** | Không dùng được | **Dùng được** (PrivateLink không cần Peering) |

---

## 3. Kết nối nhiều VPC & Hybrid Cloud
- **VPC Peering**: Point-to-point, **KHÔNG bắc cầu (Non-transitive)**. Tốt cho 2 VPC, không giới hạn băng thông, không tốn phí tạo.
- **AWS Transit Gateway**: Hub-and-Spoke cho **nhiều VPC + VPN + Direct Connect**. Hỗ trợ **ECMP** cộng gộp nhiều VPN tunnels.
- **Site-to-Site VPN**: Qua Internet, mã hóa **IPsec sẵn**, tối đa **1.25 Gbps/tunnel**, tạo trong vài phút.
- **AWS Direct Connect (DX)**: Cáp quang riêng (1–100 Gbps), **KHÔNG mã hóa mặc định** (muốn mã hóa chạy **VPN over DX Public VIF**), triển khai mất nhiều tuần/tháng.
  - **Private VIF** → VGW (vào 1 VPC).
  - **Public VIF** → AWS Public Services (S3, DynamoDB).
  - **Transit VIF** → Direct Connect Gateway → Transit Gateway (nhiều VPC).

---

## 4. Route 53 Routing Policies & Global Edge
- **Latency**: Tới Region có độ trễ thấp nhất.
- **Geolocation**: Theo quốc gia/châu lục (dùng cho **Compliance / Bản quyền / GDPR**).
- **Geoproximity**: Theo khoảng cách + **Bias** điều chỉnh vùng phủ.
- **Weighted**: Chia % traffic (**Blue/Green, Canary**).
- **Failover**: Active-Passive dựa trên Health Check.
- **Alias Record vs CNAME**: Chỉ **Alias** tạo được ở **Zone Apex (`example.com`)** và **miễn phí query** khi trỏ tới AWS resources.
- **CloudFront vs Global Accelerator**:
  - **CloudFront**: Cache HTTP/HTTPS tại Edge, IP động, dùng **OAC** khóa chặt S3 Origin.
  - **Global Accelerator**: Không cache, cấp **2 Anycast Static IP**, hỗ trợ **TCP & UDP** (Gaming/IoT/VoIP), failover **< 1 phút** (không dính DNS cache).

---

[Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md)
