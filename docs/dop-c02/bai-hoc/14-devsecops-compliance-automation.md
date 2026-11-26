# DevSecOps, Bảo mật Đa tài khoản & Tuân thủ Tự động

Domain 6 (**Security and Compliance** - **17%**) là trọng tâm của DevSecOps: nhúng bảo mật vào mọi giai đoạn của SDLC (Shift-Left Security), thiết lập rào chắn phòng ngừa (Preventive Guardrails) và phát hiện/khắc phục tự động (Detective & Responsive Controls) trên toàn bộ AWS Organizations.

## 1. Kiến trúc Quản trị Đa tài khoản: Organizations, SCP & Control Tower

### Preventive vs Detective Guardrails
- **Preventive Guardrails (SCP - Service Control Policies)**:
  - Áp dụng ở cấp Root, OU hoặc Account trong AWS Organizations.
  - Định nghĩa **giới hạn quyền tối đa** (không tự cấp quyền; vẫn cần IAM Policy cấp quyền).
  - Không áp dụng cho **Management Account** và **Service-Linked Roles**.
  - Ví dụ kinh điển: Chặn tắt CloudTrail/GuardDuty, chặn tạo tài nguyên ngoài các Region được phép (`aws:RequestedRegion`), chặn rời Organization, buộc mã hóa EBS/S3.
- **Detective Guardrails (AWS Config Rules & Conformance Packs)**:
  - Phát hiện cấu hình sai lệch so với chuẩn (PCI-DSS, HIPAA, CIS) theo thời gian thực (Configuration Change) hoặc định kỳ.
  - Hỗ trợ **Auto-Remediation** trực tiếp thông qua **AWS Systems Manager Automation Runbooks** (VD: tự động bật S3 Block Public Access hoặc gỡ rule `0.0.0.0/0` trên port 22 của Security Group).
  - **AWS Config Aggregator**: Gom trạng thái tuân thủ từ nhiều Account và nhiều Region về một tài khoản tập trung.
- **AWS Control Tower**: Tự động thiết lập Landing Zone chuẩn với **Account Factory**, kết hợp sẵn Preventive Controls (SCP), Detective Controls (Config) và **Proactive Controls** (CloudFormation Hooks chặn triển khai tài nguyên vi phạm ngay trước khi tạo!).

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyUnapprovedRegions",
      "Effect": "Deny",
      "NotAction": [
        "iam:*",
        "organizations:*",
        "sts:*",
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

> **Exam Tip**: Khi đề bài yêu cầu **ngăn chặn tuyệt đối** việc tạo tài nguyên vi phạm (VD: không cho tạo EC2 ngoài `us-east-1`, không cho tắt CloudTrail) ở mọi Member Account kể cả với Admin, hãy chọn **AWS Organizations SCP**. Khi cần **phát hiện và tự động sửa** cấu hình sai đã tồn tại, hãy chọn **AWS Config Rules + SSM Automation Remediation**.

## 2. Hệ sinh thái Phát hiện Mối đe dọa & Lỗ hổng

| Dịch vụ | Nguồn dữ liệu / Cơ chế | Trường hợp sử dụng chính trong DOP-C02 |
| :--- | :--- | :--- |
| **Amazon GuardDuty** | CloudTrail, VPC Flow Logs, DNS Logs, EKS Audit, S3 Data Events, RDS Login, Malware Scan | Phát hiện mối đe dọa thông minh (crypto-mining, credential compromise, truy cập từ IP độc hại, malware trên EBS/S3). |
| **Amazon Inspector** | SSM Agent (EC2), ECR Container Images, Lambda Functions & Layers | Quét liên tục lỗ hổng phần mềm (CVE) và network reachability. Tích hợp vào CI/CD để chặn image có lỗ hổng Critical. |
| **Amazon Macie** | S3 Objects (ML & pattern matching) | Tự động khám phá, phân loại dữ liệu nhạy cảm (PII, thẻ tín dụng, credentials) trong S3 và cảnh báo bucket public. |
| **AWS Security Hub** | Tổng hợp từ GuardDuty, Inspector, Macie, Config, Firewall Manager, IAM Access Analyzer | Bảng điều khiển bảo mật tập trung (ASFF format), chấm điểm tuân thủ (AWS Foundational Security Best Practices, CIS), kích hoạt EventBridge Auto-Remediation. |
| **IAM Access Analyzer** | Resource Policies, CloudTrail Logs | Phát hiện tài nguyên chia sẻ ra ngoài Zone of Trust (External Access), phát hiện quyền thừa (Unused Access), và **tự động sinh Least-Privilege Policy** từ lịch sử CloudTrail. |

## 3. Shift-Left Security trong CI/CD Pipeline

1. **Pre-commit / Source Stage**: Quét secret bị commit nhầm (git-secrets, CodeGuru Security), quét mã nguồn tĩnh (SAST).
2. **Build Stage (CodeBuild)**:
   - Chạy **`cfn-guard` / `cfn-nag` / `Checkov`** để kiểm tra CloudFormation/Terraform template trước khi deploy.
   - Đẩy Docker Image lên **Amazon ECR** có bật **Enhanced Scanning (Amazon Inspector)**; chặn pipeline promote sang Prod nếu phát hiện lỗ hổng `CRITICAL` hoặc `HIGH`.
   - Ký số container image và Lambda deployment package bằng **AWS Signer** (Code Signing Config) để đảm bảo chỉ code đã được ký hợp lệ mới được phép chạy trên Lambda/EKS.
3. **Secrets & Encryption Management**:
   - **AWS Secrets Manager**: Lưu DB credentials/API keys, hỗ trợ **Automatic Rotation** tích hợp sẵn cho RDS, Aurora, Redshift, DocumentDB (hoặc custom Lambda rotation), hỗ trợ Multi-Region Replication.
   - **SSM Parameter Store (SecureString)**: Lưu cấu hình nhạy cảm chi phí thấp (mã hóa bằng KMS), không có built-in rotation tự động như Secrets Manager.
   - **AWS KMS**: Phân biệt **Customer Managed Key (CMK)** (kiểm soát Key Policy, hỗ trợ cross-account, automatic key rotation 1 năm hoặc custom 90-2560 ngày) và **AWS Managed Key** (không chỉnh được policy, không share cross-account).

## 4. Audit Logging & Bảo vệ Tính toàn vẹn Log

- **AWS CloudTrail (Organization Trail)**: Tạo một Trail duy nhất tại Management Account (hoặc Delegated Admin) để ghi lại toàn bộ Management Events (và Data Events cho S3/Lambda/DynamoDB nếu cần) của mọi account trong Org.
- **Bảo vệ Log chống giả mạo**:
  - Đẩy log về S3 Bucket tại **Log Archive Account** riêng biệt.
  - Bật **CloudTrail Log File Validation** (SHA-256 hash chain) để phát hiện nếu file log bị sửa đổi hoặc xóa sau khi ghi.
  - Bật **S3 Object Lock (Compliance Mode)** + **MFA Delete** + **KMS CMK Encryption** để đảm bảo tính bất biến (immutability) đáp ứng kiểm toán nghiêm ngặt.

> **Exam Tip**: Để đảm bảo chỉ những Lambda function package đã qua quy trình build và kiểm duyệt chính thức mới được phép triển khai lên Production, hãy dùng **AWS Signer** kết hợp **Lambda Code Signing Configuration** (chế độ `Enforce`).

---

[← Bài trước](13-auto-remediation-incident-manager.md) | [Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/13-security-governance-config.md) | [Bài tiếp →](15-devsecops-threat-secrets-kms.md)
