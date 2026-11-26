# Master Service Decision Guide & Exam Cram — AWS SCS-C02

Bảng quyết định nhanh mọi dịch vụ bảo mật AWS và các quy tắc sống còn theo phong cách ôn thi thực chiến **Stephane Maarek** cho **AWS Certified Security - Specialty (SCS-C02)**.

## 1. Bản đồ Chọn Nhanh Dịch Vụ Bảo Mật (Security Service Selector)

| Từ khóa trong đề thi | Dịch vụ đáp án chuẩn | Khác biệt cốt lõi |
| :--- | :--- | :--- |
| Phát hiện mối đe dọa bằng ML (Crypto mining, Tor IP, EC2 bị chiếm quyền, S3/EKS/RDS bất thường) | **Amazon GuardDuty** | Không cần cài agent (trừ Runtime Monitoring). Phân tích CloudTrail, VPC Flow Logs, DNS Logs. |
| Quét lỗ hổng phần mềm (**CVE**) & cấu hình mạng mở trên **EC2, ECR, Lambda** | **Amazon Inspector** | Tự động quét liên tục khi push image lên ECR hoặc deploy Lambda. |
| Quét dữ liệu nhạy cảm (**PII, thẻ tín dụng, hộ chiếu**) bên trong **Amazon S3** | **Amazon Macie** | Chỉ quét S3; hỗ trợ Custom Data Identifiers (Regex). |
| Điều tra gốc rễ (**Root Cause / Forensics**) bằng đồ thị liên kết hành vi | **Amazon Detective** | Tự động thu thập findings từ GuardDuty, CloudTrail, VPC Flow Logs. |
| Bảng điều khiển tập trung gom Findings từ GuardDuty, Inspector, Macie + chấm điểm **CIS / PCI-DSS / FSBP** | **AWS Security Hub** | Chuẩn hóa định dạng **ASFF** (AWS Security Finding Format), kết nối EventBridge để Auto-Remediate. |
| Chuẩn hóa & lưu trữ log bảo mật đa nguồn theo chuẩn mở **OCSF** vào S3 | **Amazon Security Lake** | Dễ truy vấn bằng Athena hoặc tích hợp SIEM bên thứ 3. |
| Quản lý tập trung **WAF, Shield Advanced, Security Groups, Network Firewall, DNS Firewall** trên toàn Organization | **AWS Firewall Manager** | Yêu cầu: AWS Organizations (All Features) + AWS Config bật ở mọi Account + Delegated Admin. |
| Kiểm tra tài nguyên chia sẻ công khai/cross-account & xác thực chính sách IAM trước khi deploy | **IAM Access Analyzer** | Hỗ trợ Unused Access Analyzer & Policy Generation từ CloudTrail. |
| Báo cáo tuân thủ của AWS (**SOC 2, ISO 27001, PCI-DSS, BAA**) | **AWS Artifact** | Tải tài liệu chứng nhận tuân thủ của AWS, không quét tài khoản khách hàng. |
| Thu thập bằng chứng kiểm toán liên tục tự động cho Auditor | **AWS Audit Manager** | Map trực tiếp dữ liệu CloudTrail, Config, Security Hub vào khung tiêu chuẩn. |

## 2. IAM Policy Evaluation & Condition Keys Phải Thuộc Lòng

```text
Thứ tự đánh giá quyền (Short-Circuit):
1. Explicit DENY ở BẤT KỲ tầng nào (SCP / RCP / Identity / Resource / Boundary / Session) → DENY ngay lập tức!
2. Kiểm tra AWS Organizations SCP (phải có Allow).
3. Kiểm tra Resource-based Policy (nếu cùng Account và có Explicit Allow → ALLOW ngay cả khi Identity Policy không ghi; khác Account phải có Allow ở CẢ 2 phía).
4. Kiểm tra Permissions Boundary (nếu gắn) & Session Policy (nếu AssumeRole có truyền).
5. Kiểm tra Identity-based Policy → nếu không có Explicit Allow → Implicit DENY.
```

| Condition Key | Ý nghĩa & Ứng dụng đề thi |
| :--- | :--- |
| `aws:PrincipalOrgID` | Chỉ cho phép các Principal thuộc đúng AWS Organization ID của công ty truy cập S3/KMS/SQS. |
| `aws:SourceArn` + `aws:SourceAccount` | Chống tấn công **Cross-Service Confused Deputy** trên Resource-based Policy (S3, SNS, KMS). |
| `sts:ExternalId` | Chống **Confused Deputy** khi cấp Cross-Account IAM Role cho đối tác bên thứ 3 (SaaS). |
| `aws:SecureTransport: false` (với `Deny`) | Bắt buộc mọi kết nối tới S3/SQS phải dùng **HTTPS/TLS**. |
| `aws:SourceVpce` / `aws:SourceVpc` | Khóa S3 Bucket chỉ cho phép truy cập đi qua đúng VPC Endpoint nội bộ. |
| `aws:PrincipalTag` vs `aws:ResourceTag` | Triển khai **ABAC** (Attribute-Based Access Control) giảm số lượng IAM Policy phải duy trì. |
| `kms:ViaService` | Chỉ cho phép dùng KMS Key khi gọi thông qua một dịch vụ cụ thể (vd: `s3.ap-southeast-1.amazonaws.com`). |

## 3. KMS, CloudHSM & Mã hóa Dữ liệu (Exam Traps)

1. **KMS Key Policy là bắt buộc**: Khác với mọi dịch vụ AWS khác, IAM Policy **KHÔNG đủ** để dùng KMS CMK nếu Key Policy không chứa statement `Enable IAM User Permissions` (`arn:aws:iam::ACCOUNT:root`).
2. **KMS Rotation**:
   - AWS Managed Key: xoay tự động mỗi **1 năm** (không tắt được).
   - Customer Managed Key (AWS-generated): tùy chọn xoay tự động (mặc định 1 năm, tùy chỉnh 90–2560 ngày).
   - **Imported Key Material** & **Custom Key Store (CloudHSM / XKS)**: **KHÔNG hỗ trợ** xoay tự động; phải tự tạo key mới và đổi Alias.
3. **KMS Deletion**: Thời gian chờ tối thiểu **7 ngày**, tối đa **30 ngày** (không thể xóa ngay lập tức!).
4. **S3 Object Lock**:
   - **Compliance Mode**: Ngay cả **Root User** cũng không xóa/sửa được trước thời hạn retention.
   - **Governance Mode**: User có quyền `s3:BypassGovernanceRetention` vẫn xóa/rút ngắn thời hạn được.
5. **EC2 Compromised Incident Response Playbook (Đúng thứ tự)**:
   1. **Isolate**: Gắn Security Group cách ly (chặn toàn bộ inbound/outbound trừ IP Forensics) + gỡ khỏi Auto Scaling Group / Target Group (`detach-instances`). **KHÔNG Stop/Terminate** nếu cần thu thập RAM (Volatile Memory)!
   2. **Preserve**: Snapshot EBS Volume (copy sang Security/Forensics Account mã hóa bằng CMK riêng) + thu thập RAM dump qua SSM Run Command.
   3. **Revoke**: Thu hồi IAM Role temporary credentials (thêm `Deny` với `aws:TokenIssueTime`).
   4. **Analyze**: Phân tích log CloudTrail, VPC Flow Logs, GuardDuty, Detective.

---

[Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md)
