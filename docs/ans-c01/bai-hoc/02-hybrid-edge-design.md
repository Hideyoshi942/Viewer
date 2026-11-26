# Thiết kế Mạng Hybrid, Multi-Region & Edge

Domain 1 (**Network Design – 30%**) là trọng tâm lớn nhất của kỳ thi **ANS-C01**. Các câu hỏi thường đặt bạn vào tình huống kiến trúc doanh nghiệp đa tài khoản (multi-account), đa Region (multi-Region) và kết nối Hybrid về Data Center với yêu cầu nghiêm ngặt về độ trễ, băng thông, khả năng chịu lỗi (resiliency) và tối ưu chi phí.

---

## 1. AWS Transit Gateway (TGW) vs. AWS Cloud WAN

Cả hai dịch vụ đều giải quyết bài toán kết nối Hub-and-Spoke quy mô lớn, nhưng khác nhau về phạm vi quản trị và mô hình định tuyến.

| Tiêu chí | AWS Transit Gateway (TGW) | AWS Cloud WAN |
| :--- | :--- | :--- |
| **Phạm vi** | Regional resource (cần **Inter-Region TGW Peering** giữa các Region) | **Global** managed WAN (quản lý tập trung 1 Core Network toàn cầu) |
| **Phân đoạn mạng** | TGW Route Tables (Association & Propagation) | **Segments** (ví dụ: `prod`, `dev`, `shared`) tự động cách ly toàn cầu |
| **Định tuyến** | Static routes + Dynamic BGP (VPN/DXGW/TGW Connect) | Policy-based (**Core Network Policy** JSON), tự động sinh route toàn cầu |
| **Service Insertion** | Cấu hình thủ công Inspection VPC Route Table + Appliance Mode | Hỗ trợ native **Network Function Groups (NFG)** cho Centralized Inspection |
| **Tích hợp TGW** | Native | Hỗ trợ **Transit Gateway Route Table Attachment** (federation) |
| **Khi nào chọn?** | Single-Region hoặc ít Region, kiểm soát chi tiết từng Route Table | Multi-Region toàn cầu, SD-WAN branch offices, quản trị policy tập trung |

> **Exam Tip**: Khi đề bài nhắc tới *"centralized global policy"*, *"automatic segmentation across multiple AWS Regions"*, hoặc *"SD-WAN integration via Connect attachment"* mà muốn giảm thiểu vận hành thủ công Inter-Region Peering → chọn **AWS Cloud WAN**. Nếu chỉ 1 Region hoặc cần tùy chỉnh multicast (IGMPv2) → chọn **Transit Gateway** (Cloud WAN không hỗ trợ IP Multicast).

### Transit Gateway Multicast & Appliance Mode
- **TGW Multicast**: Chỉ hỗ trợ trong cùng 1 Region, hỗ trợ **Static** hoặc **Dynamic (IGMPv2)** cho UDP multicast (ứng dụng tài chính/market data).
- **TGW Appliance Mode**: Bắt buộc bật trên Inspection VPC attachment khi lưu lượng đi qua Stateful Firewall (như AWS Network Firewall hoặc GWLB) để đảm bảo **flow symmetry** (cả chiều đi và chiều về đều đi qua cùng 1 AZ, tránh bị asymmetric routing drop packet).

---

## 2. AWS Direct Connect (DX) Resiliency Models

ANS-C01 kiểm tra rất sâu về thiết kế SLA và độ sẵn sàng của Direct Connect:

| Mô hình Resiliency | Số lượng DX Location | Số kết nối DX | SLA | Trường hợp sử dụng |
| :--- | :--- | :--- | :--- | :--- |
| **Development & Test** | 1 Location | 1 Connection (Single/Hosted) | Không có SLA 99.9%+ | Môi trường Dev/Test, chấp nhận downtime |
| **High Resiliency (99.9%)** | **2 Locations** | 2 Connections (1 mỗi location, 2 thiết bị riêng) | **99.9%** | Production tiêu chuẩn, chịu lỗi 1 location hoặc 1 device |
| **Maximum Resiliency (99.99%)** | **2 Locations** | **4 Connections** (2 mỗi location trên 2 router khác nhau) | **99.99%** | Mission-critical, chịu lỗi toàn bộ 1 DX location + 1 thiết bị |

### Dedicated Connection vs. Hosted Connection
- **Dedicated Connection** (1G, 10G, 100G, 400G): Cổng vật lý riêng của bạn trên router AWS; hỗ trợ tạo **nhiều VIF** (lên đến 50 Private/Public VIF + 1 Transit VIF) và **LAG (Link Aggregation Group)** (tối đa 4 cổng 1G/10G/100G cùng tốc độ tại 1 DX Location, dùng LACP).
- **Hosted Connection** (50 Mbps đến 10 Gbps hoặc 25G/100G tùy Partner): Cấp bởi AWS Direct Connect Delivery Partner; **chỉ hỗ trợ 1 VIF duy nhất** (Private, Public, hoặc Transit — lưu ý Transit VIF yêu cầu Hosted Connection ≥ 1 Gbps); **không hỗ trợ LAG**; hỗ trợ MACsec trên kết nối ≥ 10 Gbps (Dedicated hoặc Hosted tương thích).

> **Exam Tip**: Cần **Site-to-Site VPN backup** cho Direct Connect? Hãy nhớ: Site-to-Site VPN chạy qua Internet công cộng (hoặc qua Public VIF nếu muốn mã hóa trên DX), và AWS mặc định ưu tiên route từ **Direct Connect** hơn **Site-to-Site VPN** khi cùng prefix length (do BGP path selection của VGW/TGW). Để kiểm soát băng thông trên VPN vượt quá giới hạn 1.25 Gbps/tunnel, hãy dùng **TGW + ECMP (Equal-Cost Multi-Path)** trên nhiều VPN connections.

---

## 3. Edge Networking: Amazon CloudFront vs. AWS Global Accelerator

| Đặc điểm | Amazon CloudFront | AWS Global Accelerator |
| :--- | :--- | :--- |
| **Layer hoạt động** | **Layer 7** (HTTP/HTTPS, WebSocket, gRPC) | **Layer 4** (TCP, UDP) |
| **Cơ chế tối ưu** | Caching nội dung tĩnh/động tại Edge Locations & Regional Edge Caches | Định tuyến lưu lượng qua **AWS Global Network** từ Edge gần nhất (Anycast) |
| **Địa chỉ IP** | Thay đổi (hoặc dùng Managed Prefix List cho Origin SG) | **2 Static Anycast IPv4** (hoặc Dual-Stack IPv6) cố định |
| **Failover** | Origin Groups (HTTP status code failover) | Health check nhanh (< 30 giây), chuyển hướng ngay không phụ thuộc DNS TTL |
| **Custom Routing** | Không | Hỗ trợ **Custom Routing Accelerator** (ánh xạ port-to-destination cho Gaming/VoIP) |

> **Exam Tip**: Nếu bài toán yêu cầu **non-HTTP protocols (TCP/UDP, MQTT, Gaming, VoIP)**, **static IP whitelisting** ở firewall khách hàng, hoặc **instant multi-Region failover không bị ảnh hưởng bởi DNS caching** → chọn **AWS Global Accelerator**. Nếu cần cache nội dung, tối ưu TLS termination kèm **Lambda@Edge / CloudFront Functions** và giảm tải Origin → chọn **CloudFront**.

---

## 4. Thiết kế IPv6, Dual-Stack & Amazon VPC IPAM

Khi không gian địa chỉ IPv4 cạn kiệt (RFC 1918 overlap giữa các công ty M&A hoặc hàng trăm VPC), ANS-C01 thường đưa ra các giải pháp:

1. **VPC IPv6 & Dual-Stack**:
   - AWS cấp phát `/56` IPv6 CIDR cho VPC và `/64` cho mỗi Subnet (cố định, không thay đổi prefix size).
   - Mọi địa chỉ IPv6 trong VPC đều **globally unique (GUA)** → **không có NAT Gateway** cho IPv6. Thay vào đó dùng **Egress-Only Internet Gateway (EIGW)** để cho phép outbound IPv6 mà chặn inbound từ Internet.
   - **IPv6-only Subnets** kết hợp **DNS64** (tổng hợp bản ghi AAAA từ A) và **NAT64** (trên NAT Gateway) giúp workload IPv6-only giao tiếp với dịch vụ IPv4-only.
2. **Amazon VPC IPAM (IP Address Manager)**:
   - Tự động lập kế hoạch, phân bổ và giám sát CIDR IPv4/IPv6 trên toàn **AWS Organizations**.
   - Phát hiện **overlapping CIDR**, theo dõi lịch sử gán IP (auditing) lên đến 3 năm, hỗ trợ **BYOIP (Bring Your Own IP)** và tự động cấp CIDR khi tạo VPC qua Terraform/CloudFormation.
3. **Xử lý Overlapping CIDR giữa các VPC / On-Premises**:
   - **AWS PrivateLink**: Expose dịch vụ qua Interface Endpoint (chỉ cần định tuyến 1 chiều Consumer → Provider, không quan tâm CIDR trùng lặp).
   - **NAT Gateway + Transit Gateway (Private NAT Gateway)**: Thực hiện SNAT sang một dải IP không trùng lặp (ví dụ RFC 6598 `100.64.0.0/10`) trước khi định tuyến qua TGW/DX.

```json
{
  "Example": "Cloud WAN Core Network Policy Segment Isolation",
  "segments": [
    { "name": "production", "require-attachment-acceptance": true, "isolate-attachments": false },
    { "name": "sandbox", "require-attachment-acceptance": false, "isolate-attachments": true }
  ]
}
```

---

[← Bài trước](01-vpc-architecture-ram-peering.md) | [Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/02-tgw-cloud-wan.md) | [Bài tiếp →](03-dx-lag-macsec-resiliency-tgw-multicast.md)
