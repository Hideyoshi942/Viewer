# Domain 4: Quản lý Danh tính & Kiểm soát Truy cập (16%)

Domain 4 trong **SCS-C02** kiểm tra rất sâu về logic đánh giá chính sách (IAM Policy Evaluation Logic), phân quyền đa tài khoản, mô hình ABAC, Federation (SAML 2.0 / OIDC / IAM Identity Center) và phòng chống leo thang đặc quyền (Privilege Escalation).

## 1. IAM Policy Evaluation Logic (Quy tắc đánh giá quyền)

Quy tắc vàng trên AWS: **Mặc định là Implicit Deny. Một Explicit Deny ở BẤT KỲ policy nào sẽ luôn thắng mọi Allow.**

### So sánh Trong cùng tài khoản (Same-Account) vs. Xuyên tài khoản (Cross-Account)

| Loại chính sách | Phạm vi áp dụng | Trong cùng tài khoản (Same-Account) | Xuyên tài khoản (Cross-Account) |
| :--- | :--- | :--- | :--- |
| **Explicit Deny** (bất kỳ đâu) | Mọi nơi | **Chặn tuyệt đối** | **Chặn tuyệt đối** |
| **Organizations SCP / RCP** | Member Accounts (không ảnh hưởng Management Account & Service-Linked Roles) | Bắt buộc phải có **Allow** | Bắt buộc phải có **Allow** ở cả 2 phía (nếu áp dụng) |
| **Resource-based Policy** (S3, KMS, SQS, SNS, Lambda...) | Tài nguyên cụ thể | Nếu **Resource Policy Allow** → ĐƯỢC PHÉP ngay cả khi Identity Policy không Allow (trừ trường hợp có Permissions Boundary / Session Policy) | **BẮT BUỘC** phải có Allow ở **CẢ** Identity Policy (tài khoản gọi) **VÀ** Resource Policy (tài khoản sở hữu) |
| **Permissions Boundary** | Giới hạn trần quyền tối đa cho IAM User/Role | Chỉ định mức trần (không tự cấp quyền); phải có **Allow** ở cả Identity Policy VÀ Boundary | Phải có **Allow** ở Identity Policy, Boundary, VÀ Resource Policy |
| **Session Policy** | Truyền vào `AssumeRole` / `GetFederationToken` | Giao (intersection) giữa Identity Policy và Session Policy | Giao giữa Identity Policy, Session Policy VÀ Resource Policy |

> **Exam Tip**: **KMS Key Policy** là một ngoại lệ cực kỳ hay ra thi! Khác với S3 hay EC2, **chỉ riêng Identity-based Policy KHÔNG đủ** để truy cập một KMS Key — trừ khi KMS Key Policy có statement ủy quyền cho root của tài khoản (`"Principal": {"AWS": "arn:aws:iam::ACCOUNT-ID:root"}`), khi đó IAM Policies mới có hiệu lực.

## 2. Permissions Boundaries & Phòng chống Leo thang Đặc quyền

Khi bạn muốn ủy quyền cho một Developer (hoặc CI/CD pipeline) tự tạo IAM Role mới cho ứng dụng, nhưng không muốn họ tự tạo Role có quyền `AdministratorAccess`:
1. Tạo một Managed Policy làm **Permissions Boundary** (ví dụ `AppRoleBoundary` chỉ cho phép S3, DynamoDB, SQS và Deny `iam:*`).
2. Trong Identity Policy của Developer, bắt buộc điều kiện `iam:PermissionsBoundary` khi gọi `iam:CreateRole` / `iam:CreateUser`, đồng thời chặn họ xóa hoặc sửa Boundary (`iam:DeleteRolePermissionsBoundary`, `iam:PutRolePermissionsBoundary`).

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["iam:CreateRole", "iam:AttachRolePolicy"],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "iam:PermissionsBoundary": "arn:aws:iam::111122223333:policy/AppRoleBoundary"
        }
      }
    }
  ]
}
```

## 3. Attribute-Based Access Control (ABAC) & Condition Keys

ABAC sử dụng **Tags** gắn trên Principal (`aws:PrincipalTag/key`) và Resource (`aws:ResourceTag/key`) để kiểm soát quyền linh hoạt mà không phải sửa IAM Policy mỗi khi có dự án hoặc nhân sự mới.

- **Các Condition Keys kinh điển trong đề thi SCS-C02**:
  - `aws:PrincipalOrgID`: Chỉ cho phép các tài khoản trong cùng AWS Organization truy cập tài nguyên (dùng trong S3 Bucket Policy, KMS Key Policy, VPC Endpoint Policy).
  - `aws:ResourceOrgID`: Ngăn nhân viên trong công ty upload dữ liệu ra S3 bucket cá nhân bên ngoài Organization (chống Data Exfiltration).
  - `aws:SourceVpc` / `aws:SourceVpce`: Bắt buộc truy cập đi qua VPC Endpoint cụ thể.
  - `aws:MultiFactorAuthPresent`: Yêu cầu xác thực MFA (chú ý dùng `BoolIfExists` cẩn thận khi kết hợp với `Deny`).
  - `aws:ViaAWSService` & `aws:CalledVia`: Cho phép dịch vụ AWS (như Athena, CloudFormation) thay mặt người dùng gọi dịch vụ khác (S3, KMS) ngay cả khi bucket policy chặn truy cập theo IP (`aws:SourceIp`).
  - **Confused Deputy Prevention**: Luôn sử dụng `aws:SourceArn` và `aws:SourceAccount` trong Resource Policy / Trust Policy cho AWS Services; sử dụng **`sts:ExternalId`** trong Trust Policy khi cấp quyền Cross-Account cho bên thứ 3 (3rd-party SaaS).

## 4. Federation: IAM Identity Center vs. SAML 2.0 vs. OIDC / Cognito

| Mô hình Federation | Use Case chuẩn trong đề thi |
| :--- | :--- |
| **AWS IAM Identity Center (trước là AWS SSO)** | **Lựa chọn ưu tiên số 1** cho quản lý truy cập Workforce (nhân viên) đa tài khoản AWS Organizations; đồng bộ tự động qua **SCIM** từ Okta, Entra ID, Ping Identity; gán quyền bằng **Permission Sets** |
| **IAM SAML 2.0 Provider (`AssumeRoleWithSAML`)** | Khi không dùng AWS Organizations hoặc cần tích hợp trực tiếp 1 tài khoản độc lập với ADFS/IdP nội bộ |
| **IAM OIDC Provider (`AssumeRoleWithWebIdentity`)** | Xác thực cho **GitHub Actions / GitLab CI** (không cần lưu IAM Access Key dài hạn!) hoặc **EKS IRSA** (IAM Roles for Service Accounts) |
| **Amazon Cognito Identity Pools** | Xác thực cho hàng triệu người dùng cuối (Customer Mobile/Web App) qua Google/Facebook/Apple/Cognito User Pools để đổi lấy STS temporary credentials |

## 5. IAM Access Analyzer

- **External Access Analyzer**: Sử dụng suy luận toán học (Automated Reasoning / Zelkova) để phát hiện tài nguyên (S3, IAM Roles, KMS Keys, Lambda, SQS, Secrets Manager, EBS/RDS Snapshots) đang bị chia sẻ công khai hoặc chia sẻ ra ngoài **Zone of Trust** (Account hoặc Organization).
- **Unused Access Analyzer**: Phát hiện IAM Role, Access Key, Password và quyền (permissions) không được sử dụng trong khoảng thời gian cấu hình (ví dụ 90 ngày) để thực thi **Least Privilege**.
- **Policy Validation & Policy Generation**:
  - Kiểm tra cú pháp và cảnh báo bảo mật cho IAM policy trước khi deploy (tích hợp CI/CD).
  - Tự động **tạo Least-Privilege IAM Policy** dựa trên lịch sử hoạt động thực tế trong **CloudTrail** (tối đa 90 ngày).

> **Exam Tip**: Khi đề thi hỏi về lỗi *"S3 Bucket Policy có `Deny` nếu `aws:SourceIp` không thuộc văn phòng, khiến Amazon Athena / CloudTrail / AWS Config không thể đọc/ghi bucket"*, hãy thêm điều kiện `"Bool": {"aws:ViaAWSService": "false"}` vào statement Deny để miễn trừ các lời gọi đi qua AWS Service!

---

[← Bài trước](07-container-serverless-workload-security.md) | [Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/08-iam-policy-evaluation-boundaries.md) | [Bài tiếp →](09-iam-identity-center-verified-access-zero-trust.md)
