# Cheatsheet: Ma trận Đánh giá IAM Policy & Condition Keys

## 1. Quy trình Đánh giá Quyền (Policy Evaluation Decision Flow)

1. **Explicit Deny ở BẤT KỲ policy nào** (Identity, Resource, SCP, RCP, Permissions Boundary, Session Policy, VPC Endpoint Policy) → **DENY ngay lập tức**.
2. **Organizations SCP / RCP** (nếu áp dụng cho Member Account): Không có Allow → **IMPLICIT DENY**.
3. **Resource-Based Policy** (Same-Account):
   - Nếu Resource Policy có **Allow** cho principal (trừ KMS Key nếu không chỉ định rõ) → **ALLOW** (kể cả khi Identity Policy không Allow, miễn không bị chặn bởi Boundary/Session Policy).
4. **Permissions Boundary** (nếu có gắn trên User/Role): Phải có **Allow** ở cả Identity Policy **VÀ** Permissions Boundary.
5. **Session Policy** (nếu gọi qua STS `AssumeRole`/`GetFederationToken`): Phải có **Allow** ở cả Identity Policy **VÀ** Session Policy.
6. **Cross-Account Access**: Phải có **Allow** ở **CẢ HAI PHÍA** (Identity Policy của tài khoản gọi **VÀ** Resource Policy / Role Trust Policy của tài khoản đích).

| Kịch bản | Identity Policy | Resource Policy | SCP | Permissions Boundary | Kết quả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Same-Account S3 | Không có Allow | Allow cụ thể User A | Allow | Không gắn | **ALLOW** |
| Same-Account S3 | Allow | Không có | Allow | Không có Allow | **DENY** |
| Same-Account KMS | Allow | Chỉ cho phép Admin (không ủy quyền `:root`) | Allow | Không gắn | **DENY** |
| Cross-Account S3 | Allow | Không có Allow | Allow | Không gắn | **DENY** |
| Cross-Account S3 | Không có Allow | Allow Account B | Allow | Không gắn | **DENY** |
| Management Account | Allow | Không có | Deny `*` | Không gắn | **ALLOW** (SCP không áp dụng cho Management Account) |

## 2. Bảng Condition Keys Trọng tâm SCS-C02

| Condition Key | Ý nghĩa & Ứng dụng trong đề thi |
| :--- | :--- |
| `aws:PrincipalOrgID` | Chỉ cho phép các tài khoản thuộc AWS Organization cụ thể truy cập tài nguyên (S3, KMS, SQS, SNS). |
| `aws:ResourceOrgID` | Gắn trong SCP hoặc VPC Endpoint Policy để **chặn Data Exfiltration** ra S3 bucket cá nhân ngoài công ty. |
| `aws:PrincipalAccount` | Giới hạn theo Account ID của người gọi. |
| `aws:SourceArn` & `aws:SourceAccount` | **Bắt buộc** dùng trong Resource Policy / Trust Policy để chống **Cross-Service Confused Deputy**. |
| `sts:ExternalId` | **Bắt buộc** dùng trong IAM Role Trust Policy khi chia sẻ quyền cho đối tác **3rd-Party SaaS** (chống Confused Deputy). |
| `aws:ViaAWSService` | Trả về `true` khi request do một dịch vụ AWS (Athena, CloudFormation, CloudTrail) gọi thay mặt người dùng. Dùng `"Bool": {"aws:ViaAWSService": "false"}` trong `Deny` theo IP/VPC. |
| `aws:SourceVpce` / `aws:SourceVpc` | Chỉ cho phép truy cập tài nguyên từ một VPC Endpoint hoặc VPC cụ thể (chú ý: chỉ có hiệu lực khi traffic đi qua VPC Endpoint). |
| `aws:SecureTransport` | Dùng `"Bool": {"aws:SecureTransport": "false"}` với `Effect: Deny` để bắt buộc **HTTPS/TLS** (encryption in transit). |
| `aws:TokenIssueTime` | Dùng với `DateLessThan` và `Effect: Deny` để **thu hồi toàn bộ phiên STS tạm thời** đã cấp trước một mốc thời gian. |
| `aws:PrincipalTag/<key>` & `aws:ResourceTag/<key>` | Cốt lõi của **ABAC** (Attribute-Based Access Control) — so khớp tag giữa người dùng và tài nguyên. |
| `iam:PermissionsBoundary` | Bắt buộc Developer phải gắn đúng Permissions Boundary khi gọi `iam:CreateRole` / `iam:CreateUser`. |

## 3. So sánh nhanh: Khi nào dùng loại Federation nào?

- **Nhân viên nội bộ (Workforce) truy cập nhiều tài khoản AWS**: **AWS IAM Identity Center** + SCIM (Okta / Entra ID).
- **CI/CD (GitHub Actions, GitLab) hoặc Pod trên EKS**: **IAM OIDC Identity Provider** (`AssumeRoleWithWebIdentity` / EKS IRSA) — không dùng Access Key tĩnh.
- **Hàng triệu khách hàng (Mobile/Web App)**: **Amazon Cognito Identity Pools** (đổi JWT/Social login lấy STS credentials).
- **Truy cập 1 tài khoản độc lập không có Organizations từ ADFS**: **IAM SAML 2.0 Identity Provider** (`AssumeRoleWithSAML`).

> **Exam Tip**: Khi dùng `StringNotEquals` kết hợp `Effect: Deny` với các key không phải lúc nào cũng tồn tại (như `aws:SourceVpce` hay `aws:PrincipalOrgID`), hãy dùng **`StringNotEqualsIfExists`** hoặc kiểm tra kèm `aws:PrincipalIsAWSService` để tránh vô tình khóa luôn các dịch vụ nội bộ của AWS!

---

[Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md)
