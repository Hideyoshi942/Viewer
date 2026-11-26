# Cheatsheet: Bảo mật Mạng & Biên (Network & Edge Security Matrix)

Tài liệu tra cứu nhanh giúp phân biệt chính xác 8 dịch vụ bảo mật mạng trọng tâm trong Domain 3 (**Infrastructure Security — 20%**) của kỳ thi **AWS Certified Security - Specialty (SCS-C02)**.

---

## 1. Ma trận so sánh nhanh 8 dịch vụ Network & Edge Security

| Dịch vụ | Lớp OSI & Phạm vi | Trạng thái (State) | Hành động hỗ trợ | Tài nguyên gắn kèm | Use Case kinh điển trong đề thi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Security Groups (SG)** | L3/L4 — Cấp **ENI** (Instance, ALB, RDS, Lambda ENI) | **Stateful** (tự động cho phép return traffic) | **Chỉ `Allow`** (mặc định implicit Deny) | ENI trong VPC | Kiểm soát chặt giữa các tầng ứng dụng (ALB SG → App SG → DB SG); hỗ trợ tham chiếu SG ID khác |
| **Network ACL (NACL)** | L3/L4 — Cấp **Subnet** | **Stateless** (phải mở cả Inbound + Outbound & Ephemeral ports `1024-65535`) | **`Allow` và `Deny`** (đánh giá theo thứ tự Rule # từ nhỏ đến lớn) | Subnet trong VPC | Chặn nhanh một dải IP tấn công cụ thể (`Explicit Deny`) ở cấp Subnet |
| **AWS Network Firewall** | L3–L7 — Cấp **VPC** (triển khai qua Gateway Load Balancer Endpoint) | Cả **Stateless** và **Stateful** (Suricata IPS rules) | Pass, Drop, Alert, Reject | VPC (thường đặt trong **Inspection VPC** kết nối Transit Gateway) | **Egress Filtering theo tên miền (FQDN / SNI)**, IPS/IDS dựa trên Suricata, chặn giao thức bất thường ở mức VPC |
| **AWS WAF** | **L7 (HTTP/HTTPS)** — Edge & Regional | Stateless (kèm Rate-based tracking) | Allow, Block, Count, CAPTCHA, Challenge | **CloudFront, ALB, API Gateway, AppSync, Cognito, Verified Access, App Runner** *(KHÔNG gắn lên NLB/EC2!)* | Chặn **SQLi, XSS**, Bot Control, Geo-blocking, **Rate-based rule** chống HTTP Flood (L7 DDoS) |
| **AWS Shield Standard / Advanced** | L3/L4 (Standard) & L3/L4/L7 (Advanced) | Managed DDoS Protection | Tự động giảm thiểu SYN Flood, UDP Reflection, L7 HTTP Flood (với WAF) | Standard: tự động miễn phí mọi tài khoản. Advanced: **CloudFront, Route 53, Global Accelerator, ALB, NLB, EIP** | **Shield Advanced**: cần **24/7 SRT (Shield Response Team)**, **DDoS Cost Protection**, tự động tạo/áp dụng WAF rate-based rule (Automatic L7 Mitigation) |
| **AWS Firewall Manager** | **Quản trị tập trung đa tài khoản** (AWS Organizations) | Policy Orchestrator | Tự động triển khai & cưỡng chế (Auto-remediate) cấu hình bảo mật | **WAF, Shield Advanced, VPC Security Groups, AWS Network Firewall, Route 53 Resolver DNS Firewall** | Ép buộc toàn bộ tài khoản trong Organization (kể cả tài khoản tạo mới) tự động gắn WAF Web ACL, audit Security Groups mở `0.0.0.0/0` |
| **AWS Verified Access** | **L7 Zero Trust** (không cần VPN) | Per-request evaluation (Cedar Policy) | Allow / Deny theo **Identity (IdP)** + **Device Posture (CrowdStrike/Jamf)** | Ứng dụng nội bộ (HTTP/HTTPS) trên ALB / ENI / RDS | Thay thế VPN truyền thống cho nhân viên làm việc từ xa truy cập ứng dụng web nội bộ theo mô hình Zero Trust |
| **Route 53 Resolver DNS Firewall** | **DNS Layer** (Outbound DNS queries từ VPC) | Domain-list based | Allow, Block (`NODATA`/`NXDOMAIN`/`OVERRIDE`), Alert | **VPC** (áp dụng cho Amazon Route 53 Resolver `.2`) | Chặn **DNS Exfiltration / C2 Beaconing** tới tên miền độc hại (AWS Managed Domain Lists cho Malware/Botnet) |

---

## 2. Quy tắc "Chọn nhanh" cho các tình huống đề thi SCS-C02

| Yêu cầu trong câu hỏi | Đáp án chuẩn xác |
| :--- | :--- |
| Chặn tấn công **SQL Injection / XSS / HTTP Flood theo IP** vào ALB hoặc CloudFront | **AWS WAF** (với Managed Rule Groups + Rate-based Rule) |
| Bảo vệ **NLB hoặc Elastic IP** khỏi DDoS quy mô lớn + cần **hoàn tiền chi phí scale** khi bị DDoS | **AWS Shield Advanced** (+ tích hợp Global Accelerator / Route 53) |
| Chặn traffic **Outbound HTTPS từ VPC** dựa trên **tên miền (FQDN)** (ví dụ chỉ cho phép `*.amazonaws.com`, chặn tất cả domain khác) | **AWS Network Firewall** (Stateful Domain List Rule Group đọc TLS SNI / HTTP Host) |
| Chặn **truy vấn DNS** từ EC2 trong VPC gửi tới domain độc hại / đào coin (C2) | **Route 53 Resolver DNS Firewall** |
| Tự động áp dụng WAF / Shield / Network Firewall / DNS Firewall & kiểm tra SG trên **hàng trăm tài khoản AWS** | **AWS Firewall Manager** |
| Chặn ngay 1 IP cụ thể truy cập vào EC2 khi chưa có WAF và không muốn sửa ứng dụng | **Network ACL (NACL)** với Rule `DENY` có số thứ tự nhỏ hơn rule `ALLOW` |
| Cho phép nhân viên truy cập app nội bộ **không dùng VPN**, kiểm tra đồng thời danh tính Okta/IAM Identity Center **VÀ trạng thái thiết bị** | **AWS Verified Access** |

> **Exam Tip — Điều kiện tiên quyết BẮT BUỘC của AWS Firewall Manager**:
> 1. Bật **AWS Organizations** ở chế độ **All Features** (không phải Consolidated Billing only).
> 2. Chỉ định một **Member Account** làm **Delegated Administrator** cho Firewall Manager.
> 3. Bật **AWS Config** trên **tất cả các tài khoản thành viên** thuộc phạm vi quản lý. *(Nếu quên bật AWS Config → Firewall Manager không thể phát hiện và tự động gắn policy!)*

---

## 3. Checklist Bảo mật VPC Endpoint Policy & AWS PrivateLink

Khi thiết kế kết nối nội bộ không đi qua Internet bằng **Gateway Endpoints (S3, DynamoDB)** và **Interface Endpoints (AWS PrivateLink)**:

1. **Phân biệt chiều kiểm soát**:
   - **VPC Endpoint Policy** kiểm soát **tài nguyên nào được phép truy cập TỪ VPC đó** (chặn Data Exfiltration ra tài khoản ngoài bằng `aws:ResourceOrgID`).
   - **Resource-based Policy** (ví dụ S3 Bucket Policy) kiểm soát **ai/VPC nào được phép truy cập VÀO tài nguyên đó** (khóa chặt bằng `aws:SourceVpce` hoặc `aws:SourceVpc`).
2. **Bảo mật Interface Endpoint (PrivateLink)**:
   - Interface Endpoint sử dụng **ENI trong Subnet** → BẮT BUỘC gắn **Security Group** chặt chẽ (chỉ mở TCP `443` từ CIDR hoặc SG của ứng dụng nguồn).
   - Bật **Private DNS** (`EnableDnsHostnames` + `EnableDnsSupport` trên VPC) để SDK tự động phân giải domain mặc định (ví dụ `kms.us-east-1.amazonaws.com`) sang Private IP của ENI mà không cần sửa code.
3. **Bảo mật Gateway Endpoint (S3 / DynamoDB)**:
   - **KHÔNG dùng Security Group**; kiểm soát thông qua **Route Table** (prefix list `pl-xxxx`) và **VPC Endpoint Policy**.
   - Nếu cần khóa chặt S3 chỉ nhận kết nối từ VPC Endpoint, luôn nhớ ngoại lệ **`"aws:ViaAWSService": "false"`** và **`"aws:PrincipalIsAWSService": "false"`** nếu có dịch vụ AWS (Athena, CloudTrail, Config) cần đọc/ghi bucket đó.
4. **Cung cấp dịch vụ nội bộ qua PrivateLink (Endpoint Service)**:
   - Bật **Acceptance Required** trên Endpoint Service để duyệt thủ công các VPC Endpoint từ tài khoản khác trước khi kết nối.
   - Sử dụng **Allowed Principals** để giới hạn chỉ những AWS Account/Role hoặc `arn:aws:iam::*:root` thuộc cùng Organization mới được phép tạo kết nối tới dịch vụ của bạn.

---

[Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md)
