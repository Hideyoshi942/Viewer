# Thiết kế Bảo mật Đa tài khoản & Các Dịch vụ Bảo vệ trên AWS (SAA-C03 Domain 1)

Domain 1 (*Design Secure Architectures*) chiếm **30% tổng số điểm** của kỳ thi SAA-C03 — tỷ trọng lớn nhất trong 4 domain. Trọng tâm không chỉ nằm ở IAM Policy đơn lẻ mà là **kiến trúc bảo mật đa tài khoản (Multi-Account Security)**, **phòng vệ theo chiều sâu (Defense in Depth)** và chọn đúng dịch vụ bảo mật quản lý (Managed Security Services).

---

## 1. AWS Organizations, OU & Service Control Policies (SCP)

Trong mô hình doanh nghiệp trên AWS, bạn không nên gom mọi workload (Dev, Staging, Prod, Security, Logging) vào một AWS Account duy nhất. **AWS Organizations** giúp quản lý tập trung nhiều tài khoản dưới dạng cây phân cấp gồm **Root → Organizational Units (OU) → Member Accounts**.

### Cơ chế đánh giá quyền khi có SCP (Policy Evaluation Logic)
Một hành động API chỉ được phép thực thi khi **TẤT CẢ** các tầng đều cho phép (Intersection):
`Effective Permissions = (IAM Identity Policy ∩ Permissions Boundary ∩ SCP) + Resource-based Policy` (và không có `Explicit Deny` ở bất kỳ tầng nào).

### 5 Quy tắc sống còn của SCP trong đề thi SAA-C03
1. **SCP KHÔNG cấp quyền (Does NOT grant permissions)**: Ngay cả khi SCP có `Allow *`, một IAM User vẫn không làm được gì nếu không có IAM Policy cho phép bên trong Member Account.
2. **SCP KHÔNG áp dụng cho Management Account (Master Account)**: Mọi SCP gắn ở Root OU đều bị bỏ qua đối với Management Account.
3. **SCP CÓ áp dụng cho Root User của Member Accounts**: Ví dụ, dùng SCP để cấm Root User của tài khoản con rời khỏi Organization (`organizations:LeaveOrganization`) hoặc tắt CloudTrail (`cloudtrail:StopLogging`).
4. **Hành động từ AWS Service-Linked Roles**: Một số Service-Linked Role không bị SCP chặn, nhưng các IAM Role thông thường đều chịu tác động của SCP.
5. **Chiến lược viết SCP**:
   - **Deny List Strategy** (Mặc định có `FullAWSAccess` ở Root OU, chỉ thêm các rule `Deny` cụ thể như chặn Region ngoài `ap-southeast-1`, chặn tắt GuardDuty/CloudTrail). Ít gây đứt gãy vận hành nhất.
   - **Allow List Strategy** (Gỡ `FullAWSAccess`, chỉ `Allow` một số dịch vụ được duyệt). Kiểm soát chặt nhưng dễ làm lỗi các dịch vụ phụ thuộc.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyRegionsOutsideAllowed",
      "Effect": "Deny",
      "NotAction": [
        "iam:*",
        "organizations:*",
        "sts:*",
        "cloudfront:*",
        "route53:*",
        "support:*"
      ],
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "aws:RequestedRegion": ["ap-southeast-1", "us-east-1"]
        }
      }
    }
  ]
}
```
> **Exam Tip**: Lưu ý `NotAction` cho các dịch vụ Global (`iam`, `cloudfront`, `route53`, `sts`) vì control plane của chúng nằm ở `us-east-1`! Nếu quên loại trừ, bạn sẽ vô tình khóa luôn quyền tạo IAM Role trên toàn hệ thống.

---

## 2. IAM Identity Center (AWS SSO), IAM Roles & Cross-Account Access

### Khi nào dùng gì để cấp quyền truy cập?
| Kịch bản truy cập | Giải pháp chuẩn SAA-C03 | Lý do kiến trúc |
| :--- | :--- | :--- |
| Nhân viên công ty dùng **Active Directory / Okta / Google Workspace** đăng nhập vào nhiều AWS Accounts | **AWS IAM Identity Center (AWS SSO)** | Quản lý tập trung Permission Sets theo OU/Account, hỗ trợ SAML 2.0, SCIM sync user tự động. |
| Ứng dụng di động / Web App (hàng triệu người dùng cuối) đăng nhập qua Facebook, Google, Email/Password | **Amazon Cognito** (User Pools + Identity Pools) | User Pools xác thực người dùng; Identity Pools đổi JWT lấy **STS Temporary Credentials** để gọi S3/DynamoDB. |
| Ứng dụng chạy trên **EC2 / ECS / Lambda** cần gọi S3, DynamoDB, SQS | **IAM Role (Instance Profile / Execution Role)** | Tuyệt đối KHÔNG lưu Access Key/Secret Key trong code hoặc biến môi trường. |
| Tài khoản Partner (bên thứ 3) cần đọc dữ liệu từ S3 bucket của công ty bạn | **Cross-Account IAM Role + `ExternalId`** | Dùng `sts:AssumeRole` kèm điều kiện `sts:ExternalId` để chống tấn công **Confused Deputy**. |
| Cấp quyền tạm thời cho một tác vụ cần truy cập S3 object cụ thể trong 15 phút | **S3 Pre-signed URL** | Không cần tạo IAM User; người dùng tải lên/xuống trực tiếp qua HTTPS URL có chữ ký thời hạn. |

### IAM Permissions Boundary vs SCP
- **Permissions Boundary**: Gắn vào **từng IAM User hoặc IAM Role** trong một Account. Dùng để giới hạn quyền tối đa cho một Developer tự tạo Role mới (ví dụ: Dev được phép tạo Lambda Execution Role, nhưng Role đó không bao giờ có quyền Admin).
- **SCP**: Gắn ở cấp **AWS Organizations (OU / Account)** để giới hạn toàn bộ Account.

---

## 3. Phòng vệ Biên & Phát hiện Mối đe dọa (Edge & Threat Detection)

### Bảng so sánh AWS WAF vs AWS Shield Standard vs AWS Shield Advanced
| Tiêu chí | AWS WAF | AWS Shield Standard | AWS Shield Advanced |
| :--- | :--- | :--- | :--- |
| **Tầng OSI** | Layer 7 (HTTP/HTTPS) | Layer 3 / Layer 4 (SYN Flood, UDP Reflection) | Layer 3 / 4 / 7 (kết hợp WAF miễn phí) |
| **Tài nguyên bảo vệ** | CloudFront, ALB, API Gateway, AppSync, Cognito, Verified Access | Tự động bật miễn phí cho mọi dịch vụ AWS | CloudFront, Route 53, Global Accelerator, ALB, NLB, Elastic IP |
| **Tính năng nổi bật** | Chặn **SQLi, XSS**, **Geo-blocking**, **Rate-based rules** (chặn IP gửi > X req/5 phút) | Bảo vệ DDoS cơ bản mặc định | Hỗ trợ **AWS Shield Response Team (SRT/DRT) 24/7**, **DDoS Cost Protection** (hoàn tiền nếu bill EC2/CloudFront tăng vọt do DDoS) |
| **Chi phí** | Trả theo Web ACL + Rules + Requests | **Miễn phí** | **$3,000/tháng** (cam kết 1 năm) |

### Bản đồ chọn nhanh Dịch vụ Security & Compliance trong SAA-C03
| Từ khóa trong đề bài | Dịch vụ đáp án chuẩn | Cơ chế hoạt động |
| :--- | :--- | :--- |
| Phát hiện **PII, thẻ tín dụng, hộ chiếu** trong **S3 bucket** | **Amazon Macie** | Dùng ML & pattern matching quét nội dung object trong S3. |
| Phát hiện **hành vi bất thường, đào coin (crypto mining), IP độc hại** từ logs | **Amazon GuardDuty** | Phân tích liên tục **CloudTrail, VPC Flow Logs, DNS Logs, S3/EKS/RDS logs** (không cần cài agent). |
| **Điều tra nguyên nhân gốc rễ (Root Cause / Forensics)** sau khi GuardDuty báo động | **Amazon Detective** | Tự động dựng đồ thị liên kết hành vi (Behavioral Graph) trong 1 năm. |
| Quét lỗ hổng phần mềm (**CVE**) trên **EC2, ECR Container Images, Lambda** | **Amazon Inspector** | Dùng SSM Agent trên EC2 hoặc quét trực tiếp Image trong ECR/Lambda code. |
| Kiểm tra tuân thủ cấu hình (**Compliance drift**), ví dụ "S3 không được public, EBS phải mã hóa" | **AWS Config** | Ghi nhận lịch sử thay đổi cấu hình + **AWS Config Rules** + Auto-Remediation bằng **SSM Automation**. |
| Gom toàn bộ cảnh báo bảo mật về 1 dashboard duy nhất theo chuẩn **CIS / PCI-DSS** | **AWS Security Hub** | Tổng hợp findings từ GuardDuty, Inspector, Macie, Firewall Manager theo định dạng ASFF. |
| Quản lý tập trung **WAF, Shield, Security Groups, Network Firewall** trên nhiều tài khoản | **AWS Firewall Manager** | Bắt buộc bật AWS Config; tự động áp dụng WAF/SG baseline cho mọi account mới trong Organization. |

---

## 4. Kiến trúc Hybrid & Zero-Trust Network Security

- **AWS Network Firewall**: Tường lửa Stateful Layer 3-7 đặt trong VPC (dùng **Gateway Load Balancer Endpoint**), hỗ trợ lọc theo **FQDN (Domain name)**, Suricata IDS/IPS rules. Khác với Security Group (chỉ lọc IP/Port, không lọc được domain).
- **S3 Block Public Access**: Luôn bật ở cấp **Account** hoặc **Bucket** để vô hiệu hóa mọi ACL hoặc Bucket Policy vô tình mở `public-read`.
- **VPC Flow Logs**: Ghi lại metadata lưu lượng IP (Accept/Reject) ở cấp VPC, Subnet hoặc ENI, đẩy về CloudWatch Logs hoặc S3 (hoặc Kinesis Data Firehose). *Lưu ý: Flow Logs không ghi lại payload gói tin và không ghi traffic tới Amazon DNS nội bộ (`169.254.169.253`) hoặc Instance Metadata (`169.254.169.254`).*

---

## 5. Bẫy đề thi SAA-C03 (Exam Traps)
1. **Nhầm lẫn GuardDuty vs Inspector vs Macie**:
   - Quét **lỗ hổng hệ điều hành / package (CVE)** = **Inspector**.
   - Phát hiện **tấn công / hành vi bất thường từ log** = **GuardDuty**.
   - Quét **dữ liệu nhạy cảm (PII) trong S3** = **Macie**.
2. **Quên AWS Config khi dùng Firewall Manager**: AWS Firewall Manager yêu cầu bật **AWS Organizations** (All Features) và **AWS Config** trên tất cả các tài khoản thành viên.
3. **IAM Policy vs Resource Policy**: Với S3 hoặc KMS, nếu truy cập **cùng Account**, chỉ cần IAM Policy HOẶC Resource Policy cho phép (trừ KMS yêu cầu Key Policy phải cho phép IAM). Nếu truy cập **Cross-Account**, **CẢ HAI** (IAM Policy ở tài khoản nguồn VÀ Resource Policy ở tài khoản đích) đều phải cho phép!

---

[← Bài trước](01-iam-basics-ec2-placement-userdata.md) | [Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/02-iam-organizations-security.md) | [Bài tiếp →](03-kms-cloudhsm-secrets-acm.md)
