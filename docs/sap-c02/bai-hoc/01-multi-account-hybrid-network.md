# Multi-Account Governance & Hybrid Networking Quy Mô Doanh Nghiệp

Trong kỳ thi **AWS Certified Solutions Architect - Professional (SAP-C02)**, Domain 1 chiếm tới **26%** tổng số điểm và tập trung vào bài toán mà mọi doanh nghiệp lớn đều gặp phải: quản trị hàng trăm AWS accounts cùng hạ tầng mạng hybrid kết nối đa trung tâm dữ liệu (on-premises) với nhiều VPC và nhiều Region.

---

## 1. Chiến lược Multi-Account: AWS Organizations, Control Tower & SCP

Việc gom toàn bộ workload vào một AWS account duy nhất tạo ra rủi ro blast radius lớn, khó phân bổ chi phí và dễ chạm giới hạn service quotas. AWS khuyến nghị mô hình **Multi-Account Landing Zone**.

### Cấu trúc Organizational Units (OUs) chuẩn AWS

| OU | Mục đích & Tài khoản tiêu biểu | Guardrails / SCP điển hình |
| :--- | :--- | :--- |
| **Security OU** | Log Archive (lưu tập trung CloudTrail, Config), Security Tooling (GuardDuty, Security Hub delegated admin) | Chặn xóa S3 bucket log, chặn tắt CloudTrail/GuardDuty |
| **Infrastructure OU** | Network Account (Transit Gateway, Direct Connect, Inspection VPC), Shared Services (AD, DNS) | Hạn chế tạo IGW ngoài Network Account |
| **Workloads OU** | Tách con thành `Prod OU` và `Non-Prod OU` (Dev/Staging) | Giới hạn Region được phép (Region Deny SCP), ép mã hóa EBS/S3 |
| **Sandbox OU** | Môi trường thử nghiệm của developer | Giới hạn instance types đắt tiền (chặn GPU/metal), budget alerts |

### Nguyên tắc cốt lõi của Service Control Policies (SCP)

- SCP định nghĩa **ranh giới quyền tối đa (maximum available permissions)** cho các member accounts, **không tự cấp quyền** (vẫn cần IAM policy `Allow`).
- SCP **không áp dụng cho Management Account** và **không ảnh hưởng đến Service-Linked Roles**.
- Luôn tuân theo logic giao (intersection): `Effective Permission = SCP Allow ∩ IAM Allow - (SCP Deny ∪ IAM Deny)`.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyOutsideApprovedRegions",
      "Effect": "Deny",
      "NotAction": [
        "iam:*",
        "organizations:*",
        "route53:*",
        "cloudfront:*",
        "sts:*",
        "support:*"
      ],
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "aws:RequestedRegion": ["ap-southeast-1", "us-east-1"]
        },
        "ArnNotLike": {
          "aws:PrincipalARN": "arn:aws:iam::*:role/OrganizationAccountAccessRole"
        }
      }
    }
  ]
}
```

> **Exam Tip**: Khi đề bài yêu cầu *ngăn chặn triển khai tài nguyên ngoài các Region được duyệt* nhưng vẫn cho phép dùng các dịch vụ global (IAM, CloudFront, Route 53, STS), đáp án bắt buộc phải dùng `NotAction` kết hợp điều kiện `aws:RequestedRegion` trong SCP. Đừng quên ngoại lệ cho role quản trị nếu cần.

### AWS Control Tower & AWS RAM

- **AWS Control Tower**: Tự động dựng Landing Zone chuẩn best-practice (Organizations + IAM Identity Center + Account Factory + Preventive Guardrails qua SCP + Detective Guardrails qua AWS Config). Dùng **Account Factory for Terraform (AFT)** hoặc **Customizations for Control Tower (CfCT)** khi cần tự động hóa provisioning tài khoản mới kèm cấu hình mạng/bảo mật tùy chỉnh.
- **AWS Resource Access Manager (RAM)**: Chia sẻ tài nguyên xuyên account mà không cần nhân bản:
  - **Shared Subnets (VPC Sharing)**: Network Account sở hữu VPC/Subnets, chia sẻ subnet cho Workload Accounts. Giảm lãng phí IP, không tốn phí data transfer xuyên VPC peering/TGW giữa các account cùng VPC.
  - **Transit Gateway, Route 53 Resolver Rules, License Manager, Network Firewall Rule Groups**.

---

## 2. Kiến trúc Hybrid Networking Quy Mô Lớn

### Transit Gateway (TGW) & Centralized Inspection VPC

Khi số lượng VPC vượt quá 5-10, mô hình VPC Peering (không có tính bắc cầu - non-transitive) trở nên không thể quản trị ($N(N-1)/2$ kết nối). **AWS Transit Gateway** đóng vai trò Regional Hub với routing phân tách qua nhiều **TGW Route Tables**.

Mô hình **Centralized Egress & East-West Inspection** với **AWS Network Firewall**:
1. Tạo một **Inspection VPC** tập trung với 2 lớp subnet: `TGW Attachment Subnet` và `Firewall Endpoint Subnet` (mỗi AZ một endpoint).
2. Bật chế độ **Appliance Mode** trên TGW Attachment của Inspection VPC để đảm bảo traffic đi và về (symmetric routing) luôn qua cùng một AZ firewall endpoint, tránh bị drop packet do asymmetric routing.
3. Gắn Spoke VPCs vào `Spoke-RT` có default route `0.0.0.0/0 -> Inspection VPC Attachment`.
4. Gắn Inspection VPC vào `Inspection-RT` chứa routes cụ thể trả về các Spoke VPCs và Direct Connect.

### AWS Direct Connect (DX) & Direct Connect Gateway (DXGW)

| Thành phần | Chức năng chính | Lưu ý thi SAP-C02 |
| :--- | :--- | :--- |
| **Private VIF** | Kết nối trực tiếp vào 1 VGW hoặc DXGW (tối đa 20 VGW/DXGW) | Dùng cho traffic private vào VPC (EC2, RDS) |
| **Public VIF** | Truy cập các AWS Public Endpoints (S3, DynamoDB, SQS) qua đường truyền DX | Có thể kết hợp **Site-to-Site VPN qua Public VIF** để mã hóa IPsec cho traffic đi qua DX |
| **Transit VIF** | Kết nối DXGW tới tối đa **6 Transit Gateways** trên toàn cầu | Bắt buộc dùng **Transit VIF** khi tích hợp DX với Transit Gateway |
| **Direct Connect Resiliency** | Maximum Resiliency: ≥ 2 DX locations, ≥ 2 connections mỗi location (4 connections tổng) | Khi cần SLA 99.99% và tránh SPOF tại cả thiết bị lẫn DX location |

> **Exam Tip**: Direct Connect **không tự động mã hóa** dữ liệu trên đường truyền (trừ MACsec trên cổng 10Gbps/100Gbps Dedicated Connection). Nếu đề bài yêu cầu mã hóa end-to-end từ on-premises vào VPC qua Direct Connect với chi phí thấp hoặc cổng 1Gbps, hãy chọn **AWS Site-to-Site VPN chạy đè lên Direct Connect Public VIF** (hoặc Transit VIF + IPsec).

### Hybrid DNS với Route 53 Resolver Endpoints

Để phân giải tên miền hai chiều giữa On-Premises DNS và Amazon Route 53 Private Hosted Zones (PHZ):
- **Inbound Endpoint**: Tạo ENI trong VPC nhận DNS queries **từ On-Premises gửi vào AWS** (cần cấu hình conditional forwarder trên DNS server on-prem trỏ về IP của Inbound Endpoint).
- **Outbound Endpoint + Forwarding Rules**: Gửi DNS queries **từ AWS ra On-Premises** cho domain nội bộ (ví dụ `corp.local`). Chia sẻ Forwarding Rules cho toàn bộ member accounts thông qua **AWS RAM** để chỉ cần triển khai Outbound Endpoint duy nhất tại Shared Services/Network Account.

---

## 3. Tóm tắt nguyên tắc chọn kiến trúc Domain 1

- **Giảm chi phí data transfer & đơn giản hóa IP giữa nhiều account cùng tổ chức**: Ưu tiên **VPC Sharing (AWS RAM)** thay vì tạo nhiều VPC rồi nối qua TGW.
- **Cần cách ly mạng chặt chẽ & kiểm soát traffic East-West/North-South tập trung**: Dùng **Transit Gateway + Inspection VPC (AWS Network Firewall với Appliance Mode)**.
- **Kết nối đa Region từ On-Premises**: Dùng **Direct Connect + Transit VIF + Direct Connect Gateway** kết nối tới nhiều Transit Gateway ở các Region khác nhau (kèm TGW Inter-Region Peering cho giao tiếp giữa các Region).

---

[Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/01-multi-account-networking.md) | [Bài tiếp →](02-control-tower-cfct-service-catalog.md)
