# Bảo mật Mạng & Kiểm tra Lưu lượng Tập trung

Domain 4 (**Network Security, Compliance, and Governance – 24%**) đòi hỏi bạn nắm vững các mẫu kiến trúc kiểm tra lưu lượng tập trung (Centralized Inspection), bảo mật lớp biên (Edge Protection), bảo mật DNS và mã hóa lưu lượng trên đường truyền Hybrid.

---

## 1. AWS Network Firewall & Gateway Load Balancer (GWLB)

### AWS Network Firewall
Là dịch vụ Stateful Managed Firewall triển khai qua **Firewall Endpoints** (dựa trên công nghệ GWLB ngầm bên dưới):
- **Stateless Rule Engine**: Đánh giá gói tin độc lập (5-tuple), tốc độ cao; hỗ trợ action `Pass`, `Drop`, hoặc `Forward to stateful rule groups`.
- **Stateful Rule Engine** (dựa trên **Suricata**):
  - **5-tuple rules**, **Domain list filtering** (lọc HTTP `Host` header và HTTPS **TLS SNI** — không cần giải mã TLS), và **Suricata-compatible IPS signatures**.
  - **TLS Inspection**: Hỗ trợ giải mã, kiểm tra và mã hóa lại lưu lượng TLS (Inbound bằng ACM certificate, Outbound bằng Private CA).
  - **Rule Evaluation Order**: **Default Action Order** (Pass → Drop → Alert) hoặc **Strict Order** (đánh giá tuần tự theo priority số nhỏ trước).

### Gateway Load Balancer (GWLB)
Dùng khi doanh nghiệp muốn triển khai **Third-Party Virtual Appliances** (Palo Alto, Fortinet, Cisco, Check Point) có khả năng tự động mở rộng (Auto Scaling) và HA:
- Hoạt động ở **Layer 3 (Gateway) + Layer 4 (Load Balancer)**, trong suốt (bump-in-the-wire) không làm thay đổi IP gốc.
- Đóng gói lưu lượng gửi tới appliance bằng giao thức **GENEVE (UDP port 6081)** — appliance phải hỗ trợ GENEVE.
- Kết hợp **GWLB Endpoint (GWLBE)** để chèn (insert) vào Route Table của VPC nguồn/đích (Ingress Routing từ IGW hoặc Centralized Inspection VPC).

### Mẫu Kiến trúc Kiểm tra Tập trung (Centralized Inspection Architecture)
1. **East-West (VPC-to-VPC) & Hybrid Inspection**:
   - Spoke VPCs gắn vào TGW → Spoke TGW Route Table có default route `0.0.0.0/0` trỏ về **Inspection VPC Attachment**.
   - **BẮT BUỘC bật TGW Appliance Mode** trên Inspection VPC Attachment để đảm bảo gói tin đi và về luôn qua cùng 1 AZ.
   - Route Table của **TGW Subnet** trong Inspection VPC trỏ `0.0.0.0/0` tới **Firewall Endpoint / GWLBE** trong cùng AZ.
   - Route Table của **Firewall Subnet** trỏ traffic nội bộ (RFC 1918) quay lại **TGW** (nếu East-West) hoặc tới **NAT Gateway** (nếu Egress Internet).
2. **North-South (Ingress Inspection)**:
   - Bật **Edge Association** (IGW Route Table) để chuyển hướng traffic từ Internet vào VPC tới **Firewall Endpoint / GWLBE** trước khi đến ALB/Public Subnet!

> **Exam Tip**: Khi câu hỏi yêu cầu lọc outbound HTTPS theo tên miền (FQDN) mà **không cần quản lý hạ tầng firewall bên thứ ba** → chọn **AWS Network Firewall** (Stateful Domain List với SNI inspection). Khi yêu cầu sử dụng **third-party NGFW appliance (Palo Alto/Fortinet)** với Auto Scaling và duy trì source IP → chọn **Gateway Load Balancer (GWLB) + GWLBE**.

---

## 2. Bảo mật Lớp Biên: AWS WAF, Shield Advanced & Firewall Manager

| Dịch vụ | Chức năng chính | Tài nguyên hỗ trợ |
| :--- | :--- | :--- |
| **AWS WAF** | Chống tấn công **Layer 7** (SQLi, XSS, Bot Control, Rate-based rules, Geo-blocking) | CloudFront, ALB, API Gateway, AppSync, Cognito, Verified Access |
| **AWS Shield Standard** | Miễn phí, tự động chống DDoS **Layer 3/4** (SYN flood, UDP reflection) | Mọi dịch vụ AWS (mặc định) |
| **AWS Shield Advanced** | Chống DDoS chuyên sâu L3/4/7, **24/7 SRT (Shield Response Team)**, **Cost Protection**, **Automatic Application Layer DDoS Mitigation** | CloudFront, Global Accelerator, Route 53, ALB, NLB, Elastic IP |
| **AWS Firewall Manager** | Quản trị tập trung policy bảo mật xuyên **AWS Organizations** (tự động áp dụng cho account/resource mới) | WAF, Shield Advanced, VPC Security Groups, AWS Network Firewall, Route 53 Resolver DNS Firewall |

---

## 3. Bảo mật DNS: Route 53 Resolver DNS Firewall

- Kiểm soát truy vấn **Outbound DNS** phát sinh từ VPC (chống **DNS Exfiltration** và kết nối tới domain C2/Malware).
- Hỗ trợ **AWS Managed Domain Lists** (Malware, Botnet) và Custom Domain Lists.
- Hành động: `ALLOW`, `ALERT`, `BLOCK` (trả về `NODATA`, `NXDOMAIN`, hoặc `OVERRIDE` sang một IP sinkhole/honeypot).
- **Fail-Open vs. Fail-Closed**: Mặc định **Fail-Open** (nếu DNS Firewall gặp sự cố thì vẫn phân giải bình thường để ưu tiên availability); môi trường bảo mật cao có thể chuyển sang **Fail-Closed**.

---

## 4. Mã hóa Lưu lượng trên Đường truyền Hybrid (Encryption in Transit)

AWS Direct Connect mặc định **KHÔNG mã hóa** lưu lượng ở Layer 2/Layer 3. Để đáp ứng yêu cầu tuân thủ (PCI-DSS, HIPAA), bạn có 3 mô hình chuẩn trong kỳ thi ANS-C01:

1. **AWS Direct Connect MACsec (IEEE 802.1AE)**:
   - Mã hóa **Layer 2 point-to-point** trực tiếp giữa router On-Premises/Colocation và router AWS tại DX Location.
   - Yêu cầu cổng **10 Gbps hoặc 100 Gbps** (Dedicated hoặc Hosted tương thích); **không làm giảm băng thông** và không ảnh hưởng MTU đáng kể.
   - *Lưu ý*: Chỉ mã hóa chặng giữa router của bạn và thiết bị AWS tại DX Location (không phải end-to-end tới VPC, nhưng lưu lượng bên trong AWS backbone đã được mã hóa tự động ở tầng vật lý).
2. **IPsec Site-to-Site VPN over Direct Connect Public VIF**:
   - Tạo **Public VIF** trên DX → thiết lập **IPsec VPN Tunnel** (Layer 3) đi bên trong đường truyền DX tới VGW hoặc TGW.
   - Đảm bảo **End-to-End IPsec encryption** mà vẫn giữ độ trễ thấp, ổn định của DX (không đi qua Internet công cộng).
   - Giới hạn: 1.25 Gbps/tunnel → kết hợp **TGW + ECMP** để mở rộng băng thông.
3. **Private IP VPN (Site-to-Site VPN over Direct Connect Private/Transit VIF)**:
   - Tạo VPN với **Outside IP là Private IP** đi qua DX Private/Transit VIF tới Transit Gateway (không cần Public IP/Public VIF).

```json
{
  "Example": "Route 53 Resolver DNS Firewall Rule Group Strategy",
  "FailOpen": false,
  "Rules": [
    { "Priority": 100, "Action": "ALLOW", "DomainList": "approved-corp-domains" },
    { "Priority": 200, "Action": "BLOCK", "BlockResponse": "NXDOMAIN", "DomainList": "AWSManagedDomainsMalwareDomainList" }
  ]
}
```

---

[← Bài trước](11-gwlb-geneve-centralized-inspection.md) | [Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/12-network-firewall-dns-fw.md) | [Bài tiếp →](13-waf-shield-transit-encryption.md)
