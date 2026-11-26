# Bảo mật Nâng cao, Mã hóa Đa vùng & Tự động hóa Triển khai Multi-Account

Trong môi trường doanh nghiệp trên AWS, bảo mật không thể vận hành thủ công mà phải được tích hợp sâu vào kiến trúc danh tính (Identity), mã hóa dữ liệu (Cryptography) và quy trình triển khai tự động (IaC & CI/CD Multi-Account).

---

## 1. Quản trị Danh tính Tập trung & Cross-Account Access

### AWS IAM Identity Center (kế nhiệm AWS SSO)
- Là giải pháp chuẩn của AWS cho workforce authentication xuyên nhiều AWS accounts và ứng dụng SaaS.
- Tích hợp trực tiếp với **AWS Organizations**, đồng bộ người dùng/nhóm từ **External IdP** (Okta, Entra ID / Azure AD, Ping Identity) qua giao thức **SAML 2.0** (đăng nhập) và **SCIM** (tự động cấp phát & thu hồi user/group).
- Quản lý quyền qua **Permission Sets** (tự động tạo IAM Roles tương ứng trong các member accounts). Hỗ trợ **Attribute-Based Access Control (ABAC)** để giảm số lượng policy khi tổ chức mở rộng.

### Cross-Account IAM Role & STS Security Best Practices
- **Confused Deputy Problem**: Khi một dịch vụ bên thứ ba (SaaS partner) hoặc AWS service assume role trong tài khoản của bạn, luôn yêu cầu `sts:ExternalId` (với 3rd party) hoặc `aws:SourceAccount` / `aws:SourceArn` (với AWS services) trong **Trust Policy**.
- **IAM Permission Boundaries**: Giới hạn quyền tối đa mà một IAM user/role có thể có, đặc biệt quan trọng khi trao quyền cho developer tự tạo IAM role cho Lambda/ECS (`iam:CreateRole`) nhưng không cho phép leo thang đặc quyền (privilege escalation).
- **Session Policies & Tag-based Conditions**: Dùng `aws:PrincipalTag/Department` khớp với `aws:ResourceTag/Department` để thực thi ABAC động.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "AWS": "arn:aws:iam::999988887777:root" },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "partner-unique-secret-id-2026"
        }
      }
    }
  ]
}
```

> **Exam Tip**: Khi đề bài mô tả tình huống *nhà cung cấp SaaS bên thứ 3 cần truy cập tài khoản AWS của khách hàng để audit hoặc thu thập metrics*, luôn chọn **IAM Role + ExternalId** (không bao giờ dùng IAM User Access Keys lâu dài).

---

## 2. Mã hóa Dữ liệu Nâng cao: AWS KMS Multi-Region Keys & CloudHSM

### KMS Multi-Region Keys (MRK)
- Là tập hợp các khóa KMS liên kết ở nhiều Region khác nhau nhưng có **cùng Key ID (bắt đầu bằng `mrk-...`) và cùng key material**.
- **Lợi ích cốt lõi**: Dữ liệu được mã hóa tại `us-east-1` có thể được giải mã cục bộ tại `eu-west-1` **mà không cần gọi API xuyên Region** và **không cần mã hóa lại (re-encrypt)**.
- Cực kỳ lý tưởng cho **DynamoDB Global Tables (client-side encryption)**, **Aurora Global Database**, **S3 CRR**, và hệ thống backup đa vùng.

### So sánh AWS KMS vs AWS CloudHSM

| Tiêu chí | AWS KMS | AWS CloudHSM |
| :--- | :--- | :--- |
| **Mô hình phần cứng** | Multi-tenant HSM (AWS quản lý) | **Single-tenant dedicated HSM** nằm trong VPC của khách hàng |
| **Tiêu chuẩn FIPS** | FIPS 140-3 Level 3 (tùy Region) | **FIPS 140-2 / 140-3 Level 3** chuyên biệt |
| **Quyền kiểm soát khóa** | AWS quản lý vận hành HSM, hỗ trợ Imported Key Material & Custom Key Store | Khách hàng kiểm soát độc quyền khóa; **AWS không thể truy cập hoặc khôi phục khóa** |
| **Tích hợp AWS Services** | Tích hợp native sâu với hầu hết AWS services | Tích hợp qua PKCS#11, JCE, CNG hoặc làm **Custom Key Store** cho KMS |

- **AWS Secrets Manager**: Hỗ trợ **automatic secret rotation** (native cho RDS, Redshift, DocumentDB; tùy chỉnh bằng Lambda cho dịch vụ khác) và **Multi-Region Secret Replication** (tự động đồng bộ bản sao read-only sang DR Region).

---

## 3. Tự động hóa Triển khai Đa Tài khoản (IaC & Multi-Account CI/CD)

### AWS CloudFormation StackSets
- Triển khai, cập nhật và xóa CloudFormation stacks đồng thời trên **nhiều Accounts và nhiều Regions** từ một template duy nhất.
- **Service-Managed Permissions** (tích hợp AWS Organizations): Tự động triển khai stack ngay khi một tài khoản mới được thêm vào OU (Auto-deployment), hỗ trợ **Delegated Administrator** để không cần chạy từ Management Account.
- **Drift Detection**: Phát hiện cấu hình thực tế bị thay đổi thủ công ngoài CloudFormation.

### AWS Service Catalog
- Cho phép đội ngũ Platform/Cloud Center of Excellence (CCoE) đóng gói các kiến trúc chuẩn (CloudFormation/Terraform templates) thành **Products** trong **Portfolios** và chia sẻ qua AWS Organizations.
- Sử dụng **Launch Constraints (IAM Role)**: Người dùng cuối (developer) có thể tự khởi tạo hạ tầng phức tạp (RDS, EKS, VPC) mà **không cần được cấp quyền trực tiếp** trên các dịch vụ đó — đảm bảo tuân thủ nguyên tắc Least Privilege tuyệt đối.

### Kiến trúc Multi-Account CI/CD Pipeline

```text
[Shared Services / Tooling Account]
  CodeCommit / GitHub -> CodePipeline -> CodeBuild (Build & Security Scan)
        |                                       |
        | (Artifact Bucket mã hóa bằng KMS CMK) |
        v                                       v
  Assume Role (Deploy)                   Assume Role (Deploy)
        |                                       |
        v                                       v
  [Dev/Staging Account]                 [Production Account]
  (Automated Tests + Manual Approval)   (Blue/Green via CodeDeploy)
```

> **Exam Tip**: Để CodePipeline ở Tooling Account triển khai sang Production Account thành công, bạn **bắt buộc** phải cấu hình 3 yếu tố:
> 1. **KMS Customer Managed Key (CMK)** mã hóa S3 Artifact Bucket (không dùng AWS-managed key `aws/s3` vì không chỉnh sửa được Key Policy cho cross-account!).
> 2. **S3 Bucket Policy** và **KMS Key Policy** cấp quyền đọc/giải mã cho Deployment Role của Production Account.
> 3. **Cross-Account IAM Role** ở Production Account tin tưởng (trust) Tooling Account để CodePipeline assume.

---

## 4. Giám sát Bảo mật Tập trung (Security Hub, GuardDuty, Macie, Config)

- Kích hoạt **Delegated Administrator** tại **Security Tooling Account** cho:
  - **Amazon GuardDuty**: Phát hiện mối đe dọa liên tục từ CloudTrail, VPC Flow Logs, DNS Logs, EKS Audit Logs, S3 Data Events, RDS Login Activity.
  - **AWS Security Hub**: Tổng hợp findings theo chuẩn **ASFF** (AWS Security Finding Format), chấm điểm tuân thủ (CIS, PCI-DSS, FSBP).
  - **AWS Config Aggregator**: Thu thập trạng thái tuân thủ và lịch sử cấu hình xuyên toàn bộ Organization; kết hợp **Systems Manager Automation** để **Auto-Remediation** (tự động đóng public S3 bucket hoặc thu hồi Security Group mở `0.0.0.0/0` port 22).
  - **Amazon Macie**: Quét và phát hiện dữ liệu nhạy cảm (PII, thẻ tín dụng) trong S3 buckets bằng Machine Learning.

---

[← Bài trước](06-edge-hybrid-outposts-local-zones-licensing.md) | [Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/07-security-compliance-deployment.md) | [Bài tiếp →](08-iac-stacksets-cicd-automation.md)
