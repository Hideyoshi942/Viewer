# DevSecOps: GuardDuty, Inspector, Security Hub, Macie, KMS & Secrets Manager

Trong Domain 6 (Security and Compliance) của DOP-C02, DevOps Engineer cần tích hợp bảo mật vào mọi giai đoạn của SDLC (Shift-Left Security), tự động phát hiện lỗ hổng/mối đe dọa trên hạ tầng và quản lý bí mật (Secrets) cũng như khóa mã hóa (KMS) an toàn ở quy mô đa tài khoản.

---

## 1. Bản đồ Dịch vụ Bảo mật & Phát hiện Mối đe dọa

| Dịch vụ | Chức năng cốt lõi | Nguồn dữ liệu / Phạm vi |
| :--- | :--- | :--- |
| **Amazon GuardDuty** | Phát hiện mối đe dọa bằng ML & Threat Intelligence | CloudTrail, VPC Flow Logs, DNS Logs, EKS Audit Logs, S3 Data Events, Lambda, RDS |
| **Amazon Inspector** | Quét lỗ hổng phần mềm (CVE) & Network Reachability liên tục | EC2 (qua SSM Agent hoặc agentless), ECR Container Images, AWS Lambda functions |
| **AWS Security Hub** | Tổng hợp, chuẩn hóa (ASFF) findings & chấm điểm tuân thủ (CIS, FSBP, PCI-DSS) | GuardDuty, Inspector, Macie, Config, IAM Access Analyzer, Firewall Manager |
| **Amazon Macie** | Phát hiện dữ liệu nhạy cảm (PII, Credit Card, AWS Keys) bằng ML | Amazon S3 buckets |

> [!TIP]
> **Exam Tip:**
> - Cần quét **Docker image trong ECR** trước hoặc ngay khi push, hoặc quét **EC2 CVE** -> **Amazon Inspector**.
> - Cần phát hiện **cryptocurrency mining, port scanning, IAM credential bị đánh cắp** -> **Amazon GuardDuty**.
> - Cần phát hiện **PII / dữ liệu nhạy cảm bị lộ trong S3** -> **Amazon Macie**.
> - Cần **một bảng điều khiển duy nhất (Single Pane of Glass)** gom findings từ tất cả dịch vụ trên đa tài khoản -> **AWS Security Hub (Delegated Administrator)**.

---

## 2. Quản lý Secrets & Parameter Store trong CI/CD

| Tiêu chí | AWS Secrets Manager | Systems Manager Parameter Store |
| :--- | :--- | :--- |
| **Tự động xoay vòng (Rotation)** | **Native Auto-Rotation** qua Lambda (RDS, Redshift, DocumentDB, custom) | Không có native rotation (phải tự viết Lambda + EventBridge) |
| **Mã hóa** | Luôn mã hóa bằng KMS | Tùy chọn `SecureString` (KMS) hoặc `String` |
| **Cross-Account Access** | Hỗ trợ **Resource Policy** trực tiếp | Không hỗ trợ Resource Policy (phải AssumeRole) |
| **Chi phí** | Trả phí theo từng secret/tháng + API calls | Standard tier **miễn phí** (Advanced tier có phí) |

```bash
# Ví dụ lấy Secret động trong CodeBuild buildspec.yml (không hardcode credentials)
env:
  secrets-manager:
    DOCKERHUB_USER: "prod/dockerhub:username"
    DOCKERHUB_PASS: "prod/dockerhub:password"
```

---

## 3. AWS KMS & Bảo mật Dữ liệu Đa tài khoản

- **AWS Managed Key (`aws/s3`, `aws/rds`):** Không thể chỉnh sửa Key Policy -> **không thể chia sẻ cross-account** (ví dụ Cross-Account CodePipeline hoặc chia sẻ AMI/RDS Snapshot mã hóa).
- **Customer Managed Key (CMK):** Cho phép chỉnh sửa Key Policy để cấp quyền cho tài khoản khác (`kms:Decrypt`, `kms:CreateGrant`).
- **KMS Key Policy vs IAM Policy:** Khác với các dịch vụ AWS khác, với KMS, **Key Policy bắt buộc phải cho phép** (ít nhất là `Enable IAM User Permissions` để ủy quyền cho IAM Policy); nếu Key Policy không cho phép tài khoản sở hữu dùng IAM, thì IAM Policy `AdministratorAccess` cũng không thể truy cập KMS key đó.
- **Bảo mật CI/CD Pipeline:** Dùng **IAM Roles** (OIDC cho GitHub Actions / CodeBuild Service Role) thay cho IAM User Access Keys; bật **CodeBuild privileged mode** chỉ khi build Docker image; quét secrets bị lộ trong repo bằng git-secrets/CodeGuru Security trước khi merge.

---

## 4. Checklist Ôn thi Nhanh DevSecOps (DOP-C02)

- **CodeBuild + Docker:** Bật `privilegedMode: true` trong BuildEnvironment và cấp quyền ECR (`ecr:GetAuthorizationToken`, `ecr:BatchCheckLayerAvailability`, `ecr:PutImage`).
- **ECR Image Scanning:** Bật **Enhanced Scanning** (tích hợp Amazon Inspector) để tự động quét liên tục OS packages và programming language packages (Python, Node, Java) mỗi khi có CVE mới.
- **Secrets Rotation:** Dùng Secrets Manager cho DB credentials cần xoay vòng tự động (30–90 ngày) mà không làm gián đoạn ứng dụng nhờ cơ chế **Alternating Users** hoặc **Single User** rotation Lambda.

---

[← Bài trước](14-devsecops-compliance-automation.md) | [Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/14-security-devsecops-secrets.md)
