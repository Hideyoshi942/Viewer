# Bảo mật VPC Chuyên sâu: Security Groups, NACLs, AWS Network Firewall & Traffic Mirroring

Domain 3 (Infrastructure Security) chiếm 20% điểm số của SCS-C02 — tỷ trọng cao nhất kỳ thi. Bài học này đi sâu vào bảo mật lớp mạng bên trong VPC: **Security Groups vs NACLs**, **AWS Network Firewall**, **VPC Traffic Mirroring** và **AWS PrivateLink**.

---

## 1. Security Groups vs Network ACLs (NACL)

| Tiêu chí | Security Group (SG) | Network ACL (NACL) |
| :--- | :--- | :--- |
| **Cấp độ áp dụng** | Instance / ENI | Subnet |
| **Trạng thái (State)** | **Stateful** (Cho phép Inbound -> tự động cho phép Outbound trả về) | **Stateless** (Phải cấu hình cả Inbound và Outbound, bao gồm **Ephemeral Ports 1024-65535**) |
| **Rules** | Chỉ có **Allow** rules (mặc định Deny all) | Có cả **Allow** và **Deny** rules (đánh giá theo thứ tự Rule Number từ thấp đến cao) |
| **Khi nào dùng Deny?** | Không thể chặn một IP cụ thể bằng SG | **Chặn (Deny) một dải IP tấn công cụ thể** ở cấp Subnet |

---

## 2. AWS Network Firewall & Gateway Load Balancer (GWLB)

**AWS Network Firewall** là dịch vụ tường lửa mạng được quản lý toàn phần (Layer 3–7), triển khai qua **Firewall Endpoints** (dựa trên Gateway Load Balancer Endpoint - GWLBE):
- **Stateless Rule Engine:** Đánh giá nhanh theo IP, port, protocol (5-tuple).
- **Stateful Rule Engine (Suricata-compatible IPS):**
  - Lọc theo **Domain Name (SNI/HTTP Host)** — ví dụ chỉ cho phép egress tới `*.amazonaws.com` và `*.github.com`.
  - **Intrusion Prevention System (IPS)** với Suricata rules phát hiện chữ ký tấn công trong payload.
  - **TLS Inspection:** Giải mã và kiểm tra lưu lượng HTTPS (inbound/outbound) bằng chứng chỉ từ ACM.
- **Centralized Inspection VPC:** Dùng **AWS Transit Gateway** định tuyến toàn bộ traffic East-West và North-South đi qua Inspection VPC chứa AWS Network Firewall.

```text
# Ví dụ Suricata Rule chặn lưu lượng tới domain độc hại trong AWS Network Firewall
drop tls any any -> any any (tls.sni; content:"malicious-c2.example.com"; sid:100001; rev:1;)
```

---

## 3. VPC Traffic Mirroring & AWS PrivateLink

- **VPC Traffic Mirroring:** Sao chép toàn bộ gói tin mạng (Layer 2-7 payload) từ ENI của EC2 (hỗ trợ Nitro-based instances) gửi tới thiết bị phân tích IDS/IPS (như Zeek, Suricata) đặt sau NLB hoặc GWLB để **Deep Packet Inspection (DPI)** mà không làm tăng độ trễ của luồng traffic chính.
- **VPC Endpoints (Gateway vs Interface / PrivateLink):**
  - **Gateway Endpoint:** Miễn phí, chỉ hỗ trợ **S3** và **DynamoDB** (cập nhật Route Table).
  - **Interface Endpoint (PrivateLink):** Tạo ENI với Private IP trong subnet, hỗ trợ hầu hết dịch vụ AWS và dịch vụ tự build sau NLB; hỗ trợ **VPC Endpoint Policy** để giới hạn tài khoản/bucket được phép truy cập (chống Data Exfiltration).

---

## 4. So sánh Nhanh các Lớp Bảo vệ Mạng VPC (Exam Cram)

| Nhu cầu bảo mật trong đề thi | Giải pháp chuẩn SCS-C02 |
| :--- | :--- |
| Chặn nhanh 1 IP tấn công cụ thể ở lớp Subnet | **Network ACL (NACL)** Deny Rule (rule number nhỏ hơn Allow) |
| Kiểm soát egress theo Domain Name (SNI/FQDN) + IPS Suricata | **AWS Network Firewall** (Stateful Rule Group) |
| Phân tích Deep Packet Inspection (DPI) out-of-band không tăng latency | **VPC Traffic Mirroring** -> NLB/GWLB + Suricata/Zeek |
| Ngăn EC2 trong private subnet ghi dữ liệu ra S3 bucket của kẻ tấn công | **S3 Gateway Endpoint + VPC Endpoint Policy** (`aws:ResourceOrgID`) |
| Kiểm tra kết nối mạng có bị SG/NACL/Route Table chặn không (không cần gửi gói tin thật) | **VPC Reachability Analyzer** |

---

[← Bài trước](05-infrastructure-edge-security.md) | [Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/06-infra-vpc-network-firewall.md) | [Bài tiếp →](07-container-serverless-workload-security.md)
