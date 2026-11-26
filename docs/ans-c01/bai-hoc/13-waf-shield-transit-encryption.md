# AWS WAF, Shield Advanced, Direct Connect MACsec & Transit Encryption

Domain 4 (**Network Security, Compliance, and Governance – 24%**) không chỉ kiểm tra Firewall nội bộ VPC mà còn đòi hỏi nắm vững bảo vệ biên chống DDoS (**AWS Shield**, **AWS WAF**) và các cơ chế **mã hóa đường truyền (Encryption in Transit)** trên Direct Connect và Transit Gateway.

---

## 1. Bảo vệ Biên: AWS WAF vs. AWS Shield Standard vs. Shield Advanced

| Dịch vụ | Lớp bảo vệ | Tính năng cốt lõi |
| :--- | :--- | :--- |
| **AWS Shield Standard** | Layer 3 / 4 | Tự động bật **miễn phí** cho mọi tài khoản AWS; chống SYN/UDP flood ở biên |
| **AWS Shield Advanced** | Layer 3 / 4 / 7 | Bảo vệ nâng cao cho CloudFront, Route 53, Global Accelerator, ALB, EIP; **24/7 SRT (Shield Response Team)**; **DDoS Cost Protection**; tự động tạo WAF rule chống L7 flood |
| **AWS WAF** | Layer 7 (HTTP/HTTPS) | Gắn vào **CloudFront, ALB, API Gateway, AppSync, Cognito**; Rate-based rules, Geo-blocking, SQLi/XSS Managed Rules, Bot Control |

> **Exam Tip**:
> - Muốn **bảo vệ tài chính (DDoS Cost Protection)** khi bị tấn công làm tăng chi phí auto-scaling hoặc cần **SRT hỗ trợ trực tiếp** $\rightarrow$ **AWS Shield Advanced**.
> - Muốn **quản lý tập trung WAF rules, Network Firewall policies và Shield Advanced** trên nhiều tài khoản trong AWS Organizations $\rightarrow$ **AWS Firewall Manager**.

---

## 2. Mã hóa Đường truyền trên Direct Connect (MACsec vs. IPsec)

Direct Connect mặc định **không mã hóa** dữ liệu trên cáp quang vật lý. Khi yêu cầu tuân thủ (PCI-DSS, HIPAA) bắt buộc mã hóa đầu-cuối:

| Cơ chế | Tầng OSI | Băng thông & Độ trễ | Yêu cầu hạ tầng |
| :--- | :--- | :--- | :--- |
| **DX MACsec** | **Layer 2** (Point-to-point giữa router bạn & AWS DX router) | Tốc độ wire-speed (**10 Gbps / 100 Gbps**), độ trễ cực thấp | Chỉ hỗ trợ **Dedicated** (hoặc Hosted tương thích) **≥ 10 Gbps**; dùng CKN/CAK lưu trong Secrets Manager |
| **IPsec VPN over DX Public VIF** | **Layer 3** (End-to-end tới VGW hoặc TGW) | Giới hạn **1.25 Gbps / tunnel** (dùng TGW + **ECMP** để scale nhiều tunnel) | Hoạt động trên mọi tốc độ DX (1G, 10G...); hỗ trợ cả Hosted Connection |
| **Site-to-Site VPN over Internet** | **Layer 3** | Giới hạn 1.25 Gbps / tunnel | Kết nối dự phòng (backup) cho Direct Connect |

```bash
# Liên kết Secret Key (CKN/CAK) để bật MACsec trên Direct Connect Connection
aws directconnect associate-mac-sec-key \
  --connection-id dxcon-ffre0ec3 \
  --secret-arn arn:aws:secretsmanager:us-east-1:123456789012:secret:dx-macsec-key \
  --ckn 0123456789ABCDEF0123456789ABCDEF
```

---

## 3. Mã hóa Nội bộ AWS (In-Transit Encryption)

- **Nitro-based EC2 Instances**: Tự động mã hóa ở lớp phần cứng (AES-256) mọi lưu lượng **VPC-to-VPC** (kể cả qua TGW, VPC Peering) giữa các instance Nitro thế hệ mới trong cùng Region và Inter-Region.
- **Cross-Region Transit Gateway Peering**: Luôn được mã hóa tự động trên AWS Backbone.
- **Egress Control với AWS Network Firewall**: Có thể kết hợp **TLS Inspection** (dùng ACM Private CA) để giải mã, kiểm tra payload HTTPS đi ra Internet và mã hóa lại trước khi gửi đi.

---

## 4. Tự động hóa Bảo mật với AWS Firewall Manager & WAF

Khi doanh nghiệp có hàng chục hoặc hàng trăm tài khoản AWS trong **AWS Organizations**, việc cấu hình thủ công từng Web ACL hoặc Network Firewall là không khả thi:

1. **AWS Firewall Manager**: Chỉ định một **Delegated Administrator Account** để triển khai đồng loạt AWS WAF, Shield Advanced, Security Groups, AWS Network Firewall và Route 53 Resolver DNS Firewall dựa trên **Account / Tag / OU scope**.
2. **WAF Rate-Based Rules**: Tự động chặn IP vượt quá ngưỡng request trong 5 phút (ví dụ > 2,000 requests/5 phút) để chống HTTP Flood và Brute-Force.
3. **Shield Advanced Health-Based Detection**: Gắn **Route 53 Health Check** vào tài nguyên được bảo vệ bởi Shield Advanced để phát hiện DDoS nhanh hơn dựa trên trạng thái suy giảm của ứng dụng.

> **Exam Tip**: Khi đề bài yêu cầu *"enforce baseline WAF rules and Shield Advanced protections automatically on all newly created accounts and ALBs across AWS Organizations"* $\rightarrow$ chọn **AWS Firewall Manager**.

---

[← Bài trước](12-network-security-inspection.md) | [Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/13-waf-shield-encryption.md)
