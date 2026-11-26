# Cheatsheet 2: Network Security, Inspection & Troubleshooting Matrix

Tài liệu tóm lược các mô hình kiểm tra lưu lượng (Inspection), mã hóa đường truyền Hybrid và công cụ xử lý sự cố trong Domain 3 & Domain 4 của **ANS-C01**.

---

## 1. Ma trận Bảo mật Mạng & Inspection

| Nhu cầu bảo mật | Dịch vụ AWS tối ưu | Cơ chế / Ghi chú thi cử |
| :--- | :--- | :--- |
| **Lọc Outbound HTTPS theo FQDN (SNI)** không cần quản lý appliance | **AWS Network Firewall** | Stateful Domain List kiểm tra TLS SNI / HTTP Host |
| **Triển khai Firewall bên thứ 3** (Palo Alto, Fortinet) có Auto Scaling & HA | **Gateway Load Balancer (GWLB)** | Đóng gói **GENEVE (UDP 6081)**, chèn qua **GWLB Endpoint** |
| **Chặn DNS Exfiltration / Domain độc hại** từ VPC | **Route 53 Resolver DNS Firewall** | Lọc Outbound DNS query; hỗ trợ `ALLOW`/`ALERT`/`BLOCK` (`NXDOMAIN`/`OVERRIDE`) |
| **Chống tấn công Layer 7** (SQLi, XSS, Bot, Rate Limit) | **AWS WAF** | Gắn vào CloudFront, ALB, API Gateway, AppSync, Cognito |
| **Chống DDoS L3/4/7 + 24/7 SRT + Cost Protection** | **AWS Shield Advanced** | Bảo vệ CloudFront, Global Accelerator, Route 53, ALB, NLB, EIP |
| **Quản trị tập trung WAF / Network Firewall / DNS Firewall đa Account** | **AWS Firewall Manager** | Tích hợp AWS Organizations, tự động áp dụng policy cho account mới |
| **Mã hóa Layer 2 trên Direct Connect** không giảm băng thông | **Direct Connect MACsec** | IEEE 802.1AE, yêu cầu cổng **≥ 10 Gbps** (point-to-point tới DX Router) |
| **Mã hóa End-to-End IPsec qua Direct Connect** | **Site-to-Site VPN over DX** | Qua **Public VIF** (hoặc **Private IP VPN** qua Private/Transit VIF tới TGW) |

> **Exam Tip**: Luôn nhớ **2 quy tắc bắt buộc** khi thiết kế Centralized Inspection VPC trên TGW:
> 1. Bật **Appliance Mode = Enable** trên Inspection VPC Attachment (tránh asymmetric routing giữa các AZ).
> 2. Trong Inspection VPC, **TGW Subnet** và **Firewall Endpoint Subnet** phải tách biệt Route Table để tránh routing loop!

---

## 2. Ma trận Công cụ Giám sát & Troubleshooting

| Bài toán chẩn đoán | Công cụ chuẩn AWS | Không nhầm lẫn với |
| :--- | :--- | :--- |
| Kiểm tra đường đi từ **EC2 A → RDS B** xem bị chặn ở SG, NACL hay Route Table | **VPC Reachability Analyzer** | Không gửi packet thật (static analysis) |
| Xác minh **Compliance** (không có traffic nào đi qua Internet bỏ qua Firewall) | **VPC Network Access Analyzer** | Không dùng cho debug 1 cặp IP cụ thể |
| Xem log metadata L3/L4 (`ACCEPT`/`REJECT`, `tcp-flags`, `pkt-srcaddr`) | **VPC Flow Logs / TGW Flow Logs** | Không chứa Layer 7 payload |
| Chụp **Full Packet Payload (L2–L7)** để phân tích IDS/IPS/DPI | **VPC Traffic Mirroring** | Đóng gói VXLAN (UDP 4789), chỉ hỗ trợ Nitro |
| Đo **RTT & Packet Loss** chủ động từ VPC về On-Premises qua DX/VPN | **CloudWatch Network Monitor** | Khác với Internet Monitor (chỉ đo Internet công cộng) |
| Theo dõi sự cố ISP/độ trễ từ End-User Internet tới ALB/CloudFront | **CloudWatch Internet Monitor** | Không đo lưu lượng trên Direct Connect |
| Mô phỏng TGW Routing & phát hiện **Asymmetric Route / Blackhole** | **TGW Network Manager Route Analyzer** | Hoạt động ở cấp TGW / Cloud WAN |
| Debug lỗi phân giải tên miền (`NXDOMAIN`, `SERVFAIL`) từ VPC | **Route 53 Resolver Query Logging** | VPC Flow Logs bỏ qua DNS gửi tới `.2` |

---

## 3. Checklist Xử lý Sự cố Nhanh trong Phòng thi

1. **TCP kết nối được nhưng truyền dữ liệu lớn bị treo**: Kiểm tra **PMTUD Blackhole** → mở `ICMP Type 3 Code 4` hoặc bật **TCP MSS Clamping** (`1379` trên VPN).
2. **Flow Logs thấy chiều đi `ACCEPT`, chiều về `REJECT` ở port cao (49152-65535)**: **NACL Stateless** thiếu rule cho Ephemeral Ports.
3. **BGP trên Direct Connect liên tục reset**: Kiểm tra số lượng prefix quảng bá (giới hạn **100 routes** trên Private/Transit VIF) → áp dụng **Route Summarization**.
4. **EC2 trong Private Subnet bị lỗi DNS intermittent `SERVFAIL`**: Vượt giới hạn **1024 pps/ENI** tới AWS VPC DNS (`.2`) → cài local DNS cache hoặc giảm query rate.
5. **Inbound traffic từ IGW đi thẳng tới ALB bỏ qua Network Firewall**: Thiếu **Ingress Routing (IGW Edge Association Route Table)** trỏ subnet CIDR của ALB sang Firewall Endpoint.

---

[Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md)
