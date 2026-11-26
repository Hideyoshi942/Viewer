# IAM Identity Center, AWS Verified Access (Zero Trust) & S3 Access Grants

Trong kỳ thi **AWS Certified Security - Specialty (SCS-C02)** mới nhất, các câu hỏi về quản lý danh tính tập trung và kiến trúc **Zero Trust** ngày càng chiếm tỷ trọng lớn. Trọng tâm bao gồm **AWS IAM Identity Center** (kế thừa AWS SSO), **AWS Verified Access** (truy cập ứng dụng nội bộ không cần VPN bằng ngôn ngữ **Cedar**), và **Amazon S3 Access Grants**.

---

## 1. AWS IAM Identity Center — Quản trị truy cập Multi-Account tập trung

**AWS IAM Identity Center** là dịch vụ khuyến nghị hàng đầu của AWS để quản lý Single Sign-On (SSO) cho nhân sự truy cập vào nhiều **AWS Accounts** (trong AWS Organizations) và các **Cloud Applications** (Salesforce, Jira, Grafana, QuickSight...).

### Các thành phần & Cơ chế cốt lõi

1. **Identity Sources (Nguồn danh tính)**:
   - **Identity Center Directory** (mặc định, quản lý user/group trực tiếp trên AWS).
   - **Active Directory** (AWS Managed Microsoft AD hoặc AD Connector).
   - **External IdP** (Okta, Microsoft Entra ID / Azure AD, Ping Identity, Google Workspace) qua **SAML 2.0**.
2. **SCIM (System for Cross-domain Identity Management)**:
   - SAML 2.0 chỉ xử lý đăng nhập (authentication). Để **tự động đồng bộ (provision/deprovision)** users và groups từ External IdP (Okta/Entra ID) sang IAM Identity Center theo thời gian thực -> Bắt buộc bật **SCIM provisioning**.
3. **Permission Sets**:
   - Là mẫu định nghĩa quyền (role template) được tạo tập trung tại IAM Identity Center và tự động triển khai thành **IAM Roles** (`AWSReservedSSO_...`) bên trong từng target AWS account.
   - Hỗ trợ tối đa **4 loại policy** gắn vào một Permission Set:
     1. **AWS Managed Policies** (ví dụ `ReadOnlyAccess`)
     2. **Customer Managed Policies** (Policy tự viết, **phải tồn tại cùng tên và đường dẫn** trong tất cả target accounts mà Permission Set được gán!)
     3. **Inline Policy** (nhúng trực tiếp vào Permission Set)
     4. **Permissions Boundary** (giới hạn quyền tối đa, có thể dùng AWS Managed hoặc Customer Managed Policy)
   - **Session Duration**: Cấu hình thời lượng phiên làm việc từ **1 giờ đến 12 giờ** (mặc định 1 giờ).
4. **ABAC (Attribute-Based Access Control) với Access Control Attributes**:
   - Đồng bộ các thuộc tính của user (ví dụ `Department`, `CostCenter`) từ External IdP/SCIM vào IAM Identity Center để dùng trong IAM Policy condition `${aws:PrincipalTag/Department}`.

### Trusted Identity Propagation (Tính năng trọng tâm mới!)

Trước đây, khi nhân viên đăng nhập qua SSO và dùng các dịch vụ phân tích dữ liệu (như Amazon Athena, Redshift, EMR, QuickSight, S3 Access Grants), quyền truy cập dữ liệu chỉ gắn với IAM Role dùng chung chứ không biết chính xác **ai** là người dùng cuối đang truy vấn.

**Trusted Identity Propagation** cho phép danh tính người dùng thực sự (user identity từ IAM Identity Center) được **truyền xuyên suốt** qua chuỗi gọi dịch vụ (ví dụ: QuickSight -> Redshift -> Lake Formation -> S3 Access Grants). Nhờ đó:
- Áp dụng được **row-level / column-level security** theo từng cá nhân.
- **CloudTrail** ghi nhận được chính xác **user identity** nào đã truy cập dữ liệu nào (audit trail đầy đủ).

> **Exam Tip**:
> - Đề bài nói: *"Công ty dùng Okta/Entra ID làm IdP. Khi nhân viên nghỉ việc trên Okta, tài khoản trên AWS phải tự động bị vô hiệu hóa ngay lập tức mà không cần đợi họ đăng nhập lại"* -> Bật **SCIM automatic provisioning** trên IAM Identity Center.
> - Đề bài nói: *"Gắn Customer Managed Policy vào Permission Set trên IAM Identity Center bị lỗi khi gán sang Account B"* -> Nguyên nhân: **Customer Managed Policy có cùng tên (và path) chưa được tạo sẵn trong Account B** (có thể dùng CloudFormation StackSets để đẩy policy đó sang các member accounts trước).
> - Cần audit chính xác nhân viên nào đã chạy query dữ liệu thông qua các dịch vụ analytics -> Dùng **IAM Identity Center Trusted Identity Propagation**.

---

## 2. AWS Verified Access — Kiến trúc Zero Trust không cần VPN

**AWS Verified Access** cho phép nhân viên làm việc từ xa truy cập an toàn vào các **ứng dụng web nội bộ (corporate HTTP/HTTPS applications)** mà **KHÔNG cần sử dụng VPN**.

### Nguyên lý Zero Trust của AWS Verified Access

Thay vì tin tưởng người dùng chỉ dựa vào việc họ đã kết nối vào mạng VPN công ty, Verified Access đánh giá **mọi HTTP/HTTPS request theo thời gian thực** dựa trên 2 nhóm **Trust Providers**:

| Loại Trust Provider | Nguồn dữ liệu đánh giá | Ví dụ thuộc tính kiểm tra |
| :--- | :--- | :--- |
| **User Identity Trust Provider** | OIDC IdP (IAM Identity Center, Okta, Entra ID...) | User email, Group membership, Department, trạng thái MFA |
| **Device Trust Provider** | Endpoint security / MDM (CrowdStrike Falcon, Jamf Pro, JumpCloud) | Thiết bị có được công ty quản lý không, OS patch level, có bật mã hóa ổ đĩa không, điểm rủi ro thiết bị (`risk score`) |

### Ngôn ngữ chính sách Cedar (Cedar Policy Language)

AWS Verified Access sử dụng **Cedar** (ngôn ngữ policy mã nguồn mở do AWS phát triển) để viết các quy tắc cho phép/từ chối truy cập gắn ở cấp **Verified Access Group** hoặc **Verified Access Endpoint**:

```cedar
permit(
  principal,
  action,
  resource
) when {
  context.identity.email_verified == true &&
  context.identity.groups.contains("Finance-Team") &&
  context.crowdstrike.overall >= 80
};
```

### Luồng hoạt động & Bảo mật kết nối Backend

1. User truy cập `https://payroll.internal.corp.com` -> DNS trỏ tới **AWS Verified Access Endpoint** (TLS termination tại đây với ACM certificate).
2. Nếu chưa đăng nhập, Verified Access redirect user sang Identity Provider (OIDC) để xác thực.
3. Verified Access kiểm tra **Device Trust Provider** (qua client agent/browser/MDM signal).
4. **Cedar Policy Engine** đánh giá cả Identity + Device context.
5. Nếu `permit`, request mới được chuyển tiếp vào **ALB** hoặc **Network Interface (ENI)** nằm trong **Private Subnet** của VPC (không cần mở port ra Internet cho ALB!).
6. Mọi quyết định Allow/Deny đều được ghi chi tiết vào **CloudWatch Logs, S3, hoặc Kinesis Data Firehose** để phục vụ audit.

> **Exam Tip**:
> - Đề bài: *"Công ty muốn loại bỏ Client VPN truyền thống, cho phép nhân viên truy cập các ứng dụng web nội bộ dựa trên nguyên tắc Zero Trust: kiểm tra cả danh tính từ IdP lẫn trạng thái bảo mật thiết bị (CrowdStrike/Jamf) trước khi cho phép request đi vào Private ALB"* -> Đáp án chuẩn là **AWS Verified Access**.
> - Phân biệt: **AWS Verified Access** chỉ hỗ trợ **HTTP/HTTPS applications** (Layer 7). Nếu cần truy cập SSH/RDP/TCP non-HTTP tới các server nội bộ theo mô hình Zero Trust -> dùng **AWS Systems Manager Session Manager** (cho SSH/RDP) hoặc **Amazon VPC Lattice / AWS Client VPN**.

---

## 3. Amazon S3 Access Grants

Trong các Data Lake quy mô lớn, việc quản lý hàng nghìn quyền truy cập thư mục/prefix trên S3 bằng **IAM Policies** hoặc **S3 Bucket Policies** rất dễ chạm giới hạn kích thước policy (20 KB cho Bucket Policy, 10 KB cho Role Policy) và khó ánh xạ trực tiếp với các nhóm người dùng trong Active Directory/Okta.

**Amazon S3 Access Grants** giải quyết bài toán này bằng cách tách biệt lớp phân quyền truy cập dữ liệu:

- Ánh xạ trực tiếp **Corporate Directory Identities (Users/Groups từ IAM Identity Center)** hoặc **IAM Principals** tới các **S3 Locations** cụ thể (`s3://bucket/prefix/*`) với quyền `READ`, `WRITE`, hoặc `READWRITE`.
- Quy mô cực lớn: Hỗ trợ tới hàng trăm nghìn grants (vượt xa giới hạn số lượng statement của S3 Bucket Policy).
- Tích hợp **Trusted Identity Propagation** và tự động ghi log vào CloudTrail với danh tính user thực tế.
- Ứng dụng/SDK gọi API `GetDataAccess` từ S3 Access Grants để nhận **temporary credentials** giới hạn đúng prefix được cấp phép.

```
[Okta / Entra ID Group: "Data-Scientists"] 
        | (IAM Identity Center + Trusted Identity Propagation)
        v
[S3 Access Grants Instance] ---> Cấp quyền READ cho s3://datalake-prod/curated/ml/*
```

> **Exam Tip**: Khi đề bài nêu vấn đề *"Data Lake trên S3 có hàng nghìn phòng ban/nhóm người dùng trong Active Directory/Okta cần phân quyền đọc/ghi theo từng S3 prefix khác nhau, nhưng S3 Bucket Policy bị đầy dung lượng (20 KB limit) và khó quản trị"* -> Đáp án chuẩn là **Amazon S3 Access Grants** kết hợp với **IAM Identity Center**.

---

[← Bài trước](08-iam-policy-evaluation-federation.md) | [Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/09-iam-federation-identity-center.md) | [Bài tiếp →](10-advanced-iam-abac-sts-confused-deputy.md)
