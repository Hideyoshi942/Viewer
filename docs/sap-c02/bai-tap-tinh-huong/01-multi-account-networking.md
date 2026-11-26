# Bài tập tình huống — Chủ đề 1: Multi-Account Governance — AWS Organizations, SCPs, IAM Identity Center & Cross-Account Access

> Thiết kế cấu trúc OU, Service Control Policies (SCP), IAM Permission Boundaries, IAM Identity Center (SSO) và Cross-Account STS AssumeRole.
> **Số câu hỏi:** 5 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A holding company with 100 AWS accounts inside AWS Organizations hosts a centralized Amazon S3 bucket in a Shared Data account containing proprietary market research. All IAM principals in any member account within the Organization must be able to read objects from this bucket, except principals in the Sandbox OU, which must be strictly blocked from accessing the bucket even if an administrator in a Sandbox account grants full s3:* permissions. Which combination of policies achieves this with the LEAST administrative overhead?

- **A.** Attach an IAM Permissions Boundary to every IAM role in AWS Organizations allowing S3 bucket access, except for roles created inside the Sandbox OU.
- **B.** Configure the S3 bucket for public read access without authentication and rely solely on an SCP in the Sandbox OU to block unauthorized downloads.
- **C.** List all 100 AWS account IDs in the S3 bucket policy Principal element and manually remove Sandbox account IDs whenever new Sandbox accounts are provisioned.
- **D.** Add an S3 bucket policy allowing s3:GetObject with Condition aws:PrincipalOrgID, and attach an SCP to the Sandbox OU denying s3:GetObject on that bucket.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tập đoàn với 100 AWS account trong AWS Organizations lưu trữ một Amazon S3 bucket tập trung trong tài khoản Shared Data chứa nghiên cứu thị trường độc quyền. Tất cả IAM principal trong bất kỳ member account nào thuộc Organization phải có thể đọc các object từ bucket này, ngoại trừ các principal trong Sandbox OU phải bị chặn nghiêm ngặt không cho truy cập bucket ngay cả khi quản trị viên trong tài khoản Sandbox cấp toàn quyền s3:*. Sự kết hợp chính sách nào đạt được điều này với chi phí quản trị THẤP NHẤT?

**Đáp án đúng:** **D**

Kết hợp điều kiện **`aws:PrincipalOrgID`** (hoặc `aws:PrincipalOrgPaths`) trong **Resource-Based Policy** (S3 bucket policy) để cấp quyền quy mô toàn Organization và **SCP Explicit Deny** trên OU cụ thể để chặn tuyệt đối là mô hình chuẩn mực tối ưu vận hành.

- **A:** IAM Permissions Boundary không tự cấp quyền (chỉ giới hạn quyền tối đa) và việc quản lý Permissions Boundary trên từng role ở 100 tài khoản tốn rất nhiều công sức so với S3 bucket policy + SCP.
- **B:** Mở công khai bucket chứa dữ liệu độc quyền là lỗ hổng bảo mật nghiêm trọng vì người dùng bên ngoài Internet có thể tải dữ liệu.
- **C:** Liệt kê thủ công 100 Account ID dễ vượt giới hạn kích thước S3 bucket policy (20 KB) và tạo gánh nặng vận hành mỗi khi thêm/xóa tài khoản.
- **D (Đúng):** Chính xác. Điều kiện aws:PrincipalOrgID trong S3 bucket policy tự động cho phép tất cả 100 tài khoản hiện tại và tương lai trong Organization mà không cần liệt kê từng Account ID. Đồng thời, gắn SCP explicit Deny trên Sandbox OU đảm bảo không bất kỳ IAM principal nào trong Sandbox (kể cả Admin) có thể truy cập bucket đó vì Explicit Deny trong SCP luôn thắng.

</details>

### Câu 2 `hard`

An enterprise with 90 AWS accounts uses AWS IAM Identity Center integrated with Okta via SAML 2.0 and SCIM. Currently, the security team creates a separate Permission Set and IAM role for every project team (over 150 project teams), quickly hitting IAM role and Permission Set complexity limits. Management wants a scalable access control strategy where developers can only start, stop, or terminate EC2 instances belonging to their own project without creating a new Permission Set whenever a new project is added. How should the Solutions Architect redesign access control?

- **A.** Create individual IAM Users with long-term access keys in each of the 90 member accounts and group them by project team using IAM Groups.
- **B.** Use AWS Organizations Service Control Policies (SCPs) to grant project-specific EC2 start, stop, and terminate permissions directly to Okta groups.
- **C.** Adopt ABAC in IAM Identity Center by passing Okta's Project attribute as a session tag (aws:PrincipalTag/Project), matching aws:ResourceTag/Project in one Permission Set.
- **D.** Grant all developers PowerUserAccess across all 90 AWS accounts and rely on AWS CloudTrail EventBridge alerts to detect unauthorized EC2 instance terminations.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp có 90 AWS account sử dụng AWS IAM Identity Center tích hợp với Okta qua SAML 2.0 và SCIM. Hiện tại, nhóm bảo mật tạo một Permission Set và IAM role riêng cho mỗi nhóm dự án (hơn 150 nhóm dự án), nhanh chóng chạm giới hạn phức tạp của IAM role và Permission Set. Ban quản lý muốn một chiến lược kiểm soát truy cập có khả năng mở rộng, trong đó lập trình viên chỉ có thể khởi động, dừng hoặc chấm dứt các EC2 instance thuộc dự án của riêng họ mà không cần tạo Permission Set mới mỗi khi thêm dự án mới. Solutions Architect nên thiết kế lại việc kiểm soát truy cập như thế nào?

**Đáp án đúng:** **C**

Khi tổ chức có nhiều tài khoản và hàng trăm dự án, **ABAC (Attribute-Based Access Control)** trong **IAM Identity Center** (so khớp `aws:PrincipalTag` từ IdP với `aws:ResourceTag` trên tài nguyên) là giải pháp chuẩn để mở rộng quy mô phân quyền mà không làm bùng nổ số lượng Permission Sets và IAM roles.

- **A:** Tạo IAM Users tĩnh ở 90 tài khoản phá vỡ mô hình quản trị danh tính tập trung (SSO) và tạo rủi ro bảo mật lớn từ long-lived credentials.
- **B:** SCP không cấp quyền (grant) và không nhận diện trực tiếp các nhóm người dùng trong Okta.
- **C (Đúng):** Chính xác. Mô hình ABAC (Attribute-Based Access Control) trong IAM Identity Center sử dụng thuộc tính từ IdP (Okta) truyền qua session tag `aws:PrincipalTag/Project` và so khớp động với tag tài nguyên `aws:ResourceTag/Project`. Chỉ cần 1 Permission Set duy nhất cho hàng trăm dự án, loại bỏ hoàn toàn tình trạng bùng nổ IAM roles (role sprawl).
- **D:** Cấp PowerUserAccess vi phạm nguyên tắc least privilege và chỉ phát hiện sau khi sự cố đã xảy ra (detective) thay vì ngăn chặn (preventive).

</details>

### Câu 3 `medium`

A financial services company wants to retire its legacy corporate VPN appliances used by 3,000 remote employees to access internal HR, payroll, and analytics web applications hosted on private Application Load Balancers in AWS. Security requires evaluating every HTTP request in real time based on both user identity from Okta (OIDC) and device security posture from CrowdStrike before allowing access to each specific application. Which AWS service should the Solutions Architect recommend?

- **A.** Deploy AWS Client VPN endpoints in each application VPC and configure SAML 2.0 authentication with Okta for all 3,000 remote employees.
- **B.** Configure AWS Verified Access with Okta (OIDC) and CrowdStrike trust providers, define Cedar policies per application, and target the private ALBs.
- **C.** Migrate the internal Application Load Balancers to public subnets and enable Amazon Cognito user pool authentication on the ALB HTTPS listeners.
- **D.** Use AWS Systems Manager Session Manager port forwarding with IAM Identity Center for all 3,000 employees to tunnel HTTP traffic to the internal ALBs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty dịch vụ tài chính muốn loại bỏ các thiết bị VPN doanh nghiệp kế thừa được 3.000 nhân viên làm việc từ xa sử dụng để truy cập các ứng dụng web nội bộ về nhân sự, bảng lương và phân tích được lưu trữ trên các Application Load Balancer riêng tư trong AWS. Bộ phận bảo mật yêu cầu đánh giá mọi HTTP request theo thời gian thực dựa trên cả danh tính người dùng từ Okta (OIDC) và trạng thái bảo mật thiết bị từ CrowdStrike trước khi cho phép truy cập vào từng ứng dụng cụ thể. Solutions Architect nên đề xuất dịch vụ AWS nào?

**Đáp án đúng:** **B**

**AWS Verified Access** là dịch vụ Zero Trust chuyên dụng giúp loại bỏ VPN truyền thống cho các ứng dụng doanh nghiệp nội bộ, kết hợp đánh giá **User Identity** (Okta/IAM Identity Center) và **Device Trust** (CrowdStrike/Jamf) cho từng yêu cầu bằng **Cedar policies**.

- **A:** AWS Client VPN vẫn là mô hình VPN cấp mạng (network-level VPN), không đánh giá bảo mật theo từng HTTP request (per-request Zero Trust) dựa trên kết hợp danh tính + trạng thái thiết bị (CrowdStrike device posture) cho từng ứng dụng cụ thể.
- **B (Đúng):** Chính xác. AWS Verified Access triển khai kiến trúc Zero Trust không cần VPN (VPN-less) cho các ứng dụng nội bộ, đánh giá từng request theo thời gian thực dựa trên cả user identity (IAM Identity Center/OIDC như Okta) và device posture (CrowdStrike/Jamf) bằng ngôn ngữ chính sách Cedar.
- **C:** Đưa ALB nội bộ ra public subnet làm lộ hạ tầng ra Internet, và ALB + Cognito không có tích hợp sẵn để đánh giá trạng thái bảo mật thiết bị (device posture) từ CrowdStrike.
- **D:** SSM Session Manager dành cho kỹ sư vận hành quản trị máy chủ (EC2/on-prem), không phù hợp để 3.000 nhân viên văn phòng truy cập các ứng dụng web nội bộ như HR/payroll và không hỗ trợ tích hợp device trust CrowdStrike.

</details>

### Câu 4 `medium`

A manufacturing company runs 500 Linux servers in on-premises factories that upload telemetry archives to Amazon S3 every hour. Currently, the servers use long-lived IAM user access keys, which failed a recent security audit. The company already operates an internal PKI using AWS Private Certificate Authority (AWS Private CA) that issues X.509 certificates to every factory server. How can the company transition these servers to short-lived temporary AWS credentials with the LEAST operational effort?

- **A.** Install the AWS Systems Manager Agent (SSM Agent) on all 500 Linux servers and rotate IAM user access keys every 24 hours using a local cron job.
- **B.** Create an Amazon Cognito Identity Pool integrated with SAML and issue static username/password pairs to each of the 500 factory Linux servers.
- **C.** Configure IAM Roles Anywhere with a trust anchor to AWS Private CA, create a profile with an S3 upload role, and run the credential helper on factory servers.
- **D.** Migrate all 500 factory servers to Amazon EC2 instances so they can use EC2 Instance Profiles.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty sản xuất vận hành 500 máy chủ Linux tại các nhà máy on-premises thực hiện tải lên kho lưu trữ đo từ xa lên Amazon S3 mỗi giờ. Hiện tại, các máy chủ sử dụng khóa truy cập IAM user dài hạn, vốn đã không đạt trong một cuộc kiểm toán bảo mật gần đây. Công ty đã vận hành hệ thống PKI nội bộ sử dụng AWS Private Certificate Authority (AWS Private CA) để cấp chứng chỉ X.509 cho mọi máy chủ nhà máy. Công ty có thể chuyển đổi các máy chủ này sang thông tin xác thực AWS tạm thời ngắn hạn với nỗ lực vận hành ÍT NHẤT bằng cách nào?

**Đáp án đúng:** **C**

**AWS IAM Roles Anywhere** là giải pháp chuẩn để cấp **temporary IAM credentials** cho máy chủ on-premises/hybrid bằng cách tận dụng **X.509 certificates** từ **AWS Private CA** hoặc PKI doanh nghiệp, chấm dứt hoàn toàn việc dùng long-lived IAM user access keys.

- **A:** Vẫn sử dụng IAM user access keys (dù có xoay vòng) không phải best practice so với temporary credentials và đòi hỏi cài đặt quản lý hybrid activations cho 500 máy chủ.
- **B:** Cognito Identity Pool hướng tới ứng dụng web/mobile cho người dùng cuối; việc cấp username/password cho 500 máy chủ Linux tạo thêm gánh nặng quản lý bí mật thay vì tận dụng hạ tầng X.509 PKI sẵn có.
- **C (Đúng):** Chính xác. AWS IAM Roles Anywhere cho phép các workload bên ngoài AWS (máy chủ on-premises, container, thiết bị edge) dùng chứng chỉ X.509 từ PKI nội bộ hoặc AWS Private CA để đổi lấy temporary credentials (STS) từ IAM Role thông qua credential helper, loại bỏ hoàn toàn long-lived access keys.
- **D:** Di chuyển 500 máy chủ nhà máy đang chạy on-premises lên EC2 chỉ để lấy credential là không khả thi và tốn kém công sức cực lớn.

</details>

### Câu 5 `hard`

A large enterprise uses AWS IAM Identity Center integrated with Microsoft Entra ID (Azure AD) for 4,000 engineers working across 300 distinct software projects in 50 AWS accounts. Currently, the IAM team creates a separate IAM Permission Set and IAM policy for every new project so engineers can only manage EC2, RDS, and S3 resources belonging to their assigned project. This has caused policy sprawl and frequent delays when engineers switch projects. How can the security architect scale fine-grained project isolation using a single reusable Permission Set?

- **A.** Grant AdministratorAccess to all 4,000 engineers in a single Permission Set and rely on AWS CloudTrail audits to detect unauthorized cross-project modifications.
- **B.** Create 300 separate IAM Groups in each of the 50 AWS accounts and synchronize project memberships nightly via a custom Lambda script.
- **C.** Use AWS Organizations Service Control Policies (SCPs) to create 300 project-specific IAM allow rules attached directly to the Root OU.
- **D.** Enable ABAC in IAM Identity Center to pass Entra ID's ProjectCode as a session tag, matching aws:ResourceTag/ProjectCode in one Permission Set.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp lớn sử dụng AWS IAM Identity Center tích hợp với Microsoft Entra ID (Azure AD) cho 4.000 kỹ sư làm việc trên 300 dự án phần mềm khác nhau tại 50 AWS account. Hiện tại, nhóm IAM tạo một IAM Permission Set và IAM policy riêng cho mỗi dự án mới để kỹ sư chỉ có thể quản lý tài nguyên EC2, RDS và S3 thuộc dự án được phân công. Điều này gây ra tình trạng phình to số lượng policy và thường xuyên chậm trễ khi kỹ sư chuyển dự án. Kiến trúc sư bảo mật có thể mở rộng khả năng cô lập dự án chi tiết bằng một Permission Set tái sử dụng duy nhất như thế nào?

**Đáp án đúng:** **D**

Khi gặp bài toán **hàng trăm dự án / hàng nghìn nhân sự thường xuyên luân chuyển** bị phình to số lượng IAM Role/Policy (RBAC sprawl), đáp án chuẩn mực luôn là **ABAC (Attribute-Based Access Control)** trong **IAM Identity Center** so khớp `aws:ResourceTag` với `aws:PrincipalTag`.

- **A:** Cấp AdministratorAccess cho toàn bộ 4.000 kỹ sư vi phạm nghiêm trọng nguyên tắc đặc quyền tối thiểu (Least Privilege) và không cô lập được tài nguyên giữa 300 dự án.
- **B:** Tạo 300 x 50 = 15.000 IAM Group (vượt giới hạn mặc định 300 IAM Groups/account và bỏ qua mô hình liên kết SSO tập trung) còn làm tình trạng phình to quản trị (sprawl) tồi tệ hơn.
- **C:** SCP có giới hạn tối đa 5 policy gắn vào mỗi OU và kích thước 5.120 ký tự; SCP không dùng để thay thế phân quyền chi tiết theo từng nhân sự/dự án như ABAC.
- **D (Đúng):** Chính xác. Attribute-Based Access Control (ABAC) trong IAM Identity Center cho phép truyền thuộc tính người dùng (ProjectCode) từ Entra ID sang AWS dưới dạng session tag (aws:PrincipalTag). Nhờ đó chỉ cần DUY NHẤT một Permission Set kiểm tra điều kiện aws:ResourceTag/ProjectCode == aws:PrincipalTag/ProjectCode — khi kỹ sư đổi dự án trên Entra ID, quyền trên AWS tự động cập nhật ngay lập tức mà không cần sửa IAM policy.

</details>

---

[Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md)
