# Bài tập tình huống — AWS Organizations, Control Tower & Delegated Administrator

> AWS Organizations OU & SCP Guardrails, AWS Control Tower, Delegated Administrator cho Security Services, AWS RAM và Account Root Protection.
> **Số câu hỏi:** 8 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A security team attaches a Service Control Policy (SCP) to the Root of an AWS Organization to deny all actions in unapproved AWS Regions (such as ap-south-1) and to deny disabling CloudTrail. After testing, the team notices that (1) an IAM administrator in the Management Account can still launch EC2 instances in ap-south-1, and (2) an AWS service-linked role in a member account can still perform actions in ap-south-1. Why is this happening?

- **A.** SCPs attached to the Organization Root only take effect after 24 hours of propagation across accounts.
- **B.** SCPs NEVER apply to users or roles in the Organizations Management Account, and SCPs do NOT restrict AWS service-linked roles.
- **C.** SCPs only restrict IAM users and do not apply to IAM roles assumed via STS in member accounts.
- **D.** The aws:RequestedRegion condition key is not supported inside AWS Organizations SCPs for EC2 actions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm bảo mật gắn một Service Control Policy (SCP) vào Root của một AWS Organization để từ chối tất cả hành động trong các AWS Region chưa được phê duyệt (như ap-south-1) và từ chối việc tắt CloudTrail. Sau khi kiểm thử, nhóm nhận thấy rằng (1) một quản trị viên IAM trong Management Account vẫn có thể khởi chạy các EC2 instance tại ap-south-1, và (2) một AWS service-linked role trong một tài khoản thành viên vẫn có thể thực hiện các hành động tại ap-south-1. Tại sao điều này xảy ra?

**Đáp án đúng:** **B**

Ghi nhớ bảng phạm vi tác động của **SCP** cho bài thi SCS-C02: SCP **CÓ** áp dụng lên member accounts (bao gồm cả **root user** của member account, IAM users, IAM roles). SCP **KHÔNG** áp dụng lên: (1) **Management Account**, (2) **AWS Service-Linked Roles**, và (3) các thực thể bên ngoài Organization gọi vào tài nguyên qua resource-based policy.

- **A:** SCP có hiệu lực gần như ngay lập tức (vài giây), không phải chờ 24 giờ.
- **B (Đúng):** Chính xác! Đây là 2 giới hạn thiết kế quan trọng nhất của AWS Organizations SCP: (1) SCP KHÔNG BAO GIỜ áp dụng lên Management Account (kể cả khi gắn vào Organization Root), và (2) SCP KHÔNG giới hạn các AWS Service-Linked Roles (cũng như resource-based policies của các dịch vụ AWS).
- **C:** SCP áp dụng lên TẤT CẢ các IAM users, IAM roles (kể cả assumed roles) và thậm chí cả root user của các **member accounts**.
- **D:** aws:RequestedRegion là condition key cực kỳ phổ biến và được hỗ trợ đầy đủ trong SCP (nhưng nhớ loại trừ các global services như IAM, STS, CloudFront, Route 53, Organizations khi chặn Region).

</details>

### Câu 2 `hard`

An enterprise with 200 AWS accounts in AWS Organizations wants to eliminate all long-term root user passwords, access keys, and MFA devices across every member account, while still allowing authorized security administrators to perform rare privileged root-only tasks (such as unlocking an S3 bucket with a misconfigured Deny-all bucket policy) in a member account using temporary, task-scoped credentials. Which AWS feature should the enterprise enable?

- **A.** Enable Centralized Root Access Management, delete member root credentials, and use task-scoped sts:AssumeRoot.
- **B.** Attach a Service Control Policy (SCP) denying all actions for the root user across all accounts, including the management account.
- **C.** Store all 200 member account root passwords in AWS Secrets Manager and rotate them weekly with a Lambda function.
- **D.** Use AWS IAM Identity Center to assign the root user of each member account to the Security Admins group.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp với 200 tài khoản AWS trong AWS Organizations muốn loại bỏ tất cả mật khẩu root user dài hạn, access key và thiết bị MFA trên mọi tài khoản thành viên, trong khi vẫn cho phép các quản trị viên bảo mật được ủy quyền thực hiện các tác vụ hiếm gặp chỉ dành cho root (như mở khóa một S3 bucket có bucket policy Deny-all bị cấu hình sai) trong tài khoản thành viên bằng thông tin xác thực tạm thời có phạm vi theo tác vụ. Doanh nghiệp nên bật tính năng AWS nào?

**Đáp án đúng:** **A**

**AWS Organizations Centralized Root Access Management** giúp loại bỏ hoàn toàn thông tin đăng nhập root dài hạn trên các member account và thay thế bằng cơ chế cấp phiên ngắn hạn **`sts:AssumeRoot`** kèm các AWS-managed task policies (như `S3UnlockBucketPolicy`, `SQSUnlockQueuePolicy`, `IAMAuditRootUserCredentials`).

- **A (Đúng):** Chính xác! AWS Organizations Centralized Root Access Management cho phép xóa bỏ hoàn toàn mật khẩu, access key và MFA của root user trên mọi member account (không thể đăng nhập root trực tiếp nữa), và khi cần thao tác đặc quyền như gỡ S3 bucket policy lỗi thì quản trị viên được ủy quyền gọi `sts:AssumeRoot` với task policy ngắn hạn (tối đa 15 phút).
- **B:** SCP không thể áp dụng cho Management Account và không có cơ chế xóa bỏ root credentials hay cung cấp phiên `AssumeRoot` tạm thời theo từng tác vụ cụ thể như Centralized Root Access Management.
- **C:** Lưu trữ mật khẩu root dài hạn của 200 tài khoản vẫn vi phạm yêu cầu loại bỏ hoàn toàn root passwords và tăng bề mặt tấn công.
- **D:** IAM Identity Center tạo và quản lý IAM Roles trong các member account, không thể cấp quyền đăng nhập trực tiếp với tư cách root user.

</details>

### Câu 3 `hard`

A security architect wants to establish an organization-wide data perimeter in AWS Organizations ensuring that NO external AWS account outside the company's Organization can access any Amazon S3 bucket or AWS KMS key owned by member accounts—even if a developer mistakenly attaches an overly permissive resource-based policy granting Principal: "*" to a bucket. Service Control Policies (SCPs) do not apply to external principals calling into member accounts. Which AWS Organizations policy type directly solves this?

- **A.** Attach a Service Control Policy (SCP) to the Root OU denying s3:GetObject when aws:PrincipalOrgID does not match the company's Organization ID.
- **B.** Attach a Resource Control Policy (RCP) denying S3/KMS access when aws:PrincipalOrgID mismatches (exempting AWS services).
- **C.** Attach an IAM Permissions Boundary to all IAM roles in the member accounts.
- **D.** Create a Tag Policy in AWS Organizations requiring every S3 bucket to have an OrgID tag.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiến trúc sư bảo mật muốn thiết lập vành đai dữ liệu trên toàn tổ chức trong AWS Organizations đảm bảo rằng KHÔNG một tài khoản AWS bên ngoài nào nằm ngoài Organization của công ty có thể truy cập vào bất kỳ Amazon S3 bucket hoặc AWS KMS key nào thuộc sở hữu của các tài khoản thành viên—ngay cả khi nhà phát triển vô tình gắn một resource-based policy quá rộng cấp Principal: "*" cho một bucket. Service Control Policies (SCPs) không áp dụng cho các principal bên ngoài gọi vào tài khoản thành viên. Loại policy nào của AWS Organizations giải quyết trực tiếp vấn đề này?

**Đáp án đúng:** **B**

Phân biệt cốt lõi trong **Data Perimeter**: **SCP (Service Control Policy)** đặt trần quyền cho **identities (principals)** thuộc Organization của bạn; còn **RCP (Resource Control Policy)** đặt trần quyền cho **resources** (S3, KMS, SQS, Secrets Manager, STS) thuộc Organization của bạn—ngăn chặn hiệu quả cả **external principals** ngay cả khi resource policy bị cấu hình sai.

- **A:** SCP chỉ kiểm soát các IAM principals thuộc chính AWS Organization của bạn; SCP hoàn toàn KHÔNG được đánh giá khi một external principal từ tài khoản AWS khác gọi vào S3 bucket của bạn.
- **B (Đúng):** Chính xác! **AWS Organizations Resource Control Policies (RCPs)** đặt giới hạn quyền tối đa lên chính các tài nguyên (S3, KMS, STS, SQS, Secrets Manager) trong member accounts—áp dụng cho cả **external principals** ngoài Organization, khắc phục khoảng trống của SCP (SCP chỉ áp dụng cho danh tính bên trong Organization).
- **C:** Permissions Boundary chỉ giới hạn quyền của các IAM entity nội bộ trong tài khoản, không chặn được external principal truy cập qua resource policy bị cấu hình sai.
- **D:** Tag Policy chỉ chuẩn hóa cú pháp/giá trị của tag, không thực thi kiểm soát truy cập đối với tài nguyên.

</details>

### Câu 4 `hard`

A European company must enforce data residency across all member accounts in AWS Organizations so that engineers can ONLY provision AWS resources in eu-central-1 and eu-west-1. A junior engineer attaches an SCP with Effect: Deny, Action: "*", Resource: "*", and StringNotEquals on aws:RequestedRegion for ["eu-central-1", "eu-west-1"]. Immediately afterward, users in member accounts report that IAM console operations, Amazon CloudFront distributions, and Amazon Route 53 DNS updates are all failing with AccessDenied. How should the SCP be corrected?

- **A.** Add us-east-1 to the allowed aws:RequestedRegion list so that engineers can deploy EC2 and RDS instances in us-east-1.
- **B.** Change the SCP Effect from Deny to Allow and remove the aws:RequestedRegion condition key from the policy statement.
- **C.** Attach the Region-restriction SCP directly to the AWS Organizations management account instead of the member account OUs.
- **D.** Replace Action: "*" with NotAction listing global services (iam:*, sts:*, route53:*, cloudfront:*) while keeping aws:RequestedRegion.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty châu Âu phải thực thi lưu trú dữ liệu trên tất cả tài khoản thành viên trong AWS Organizations sao cho các kỹ sư CHỈ có thể khởi tạo tài nguyên AWS tại eu-central-1 và eu-west-1. Một kỹ sư mới gắn một SCP với Effect: Deny, Action: "*", Resource: "*" và StringNotEquals trên aws:RequestedRegion cho ["eu-central-1", "eu-west-1"]. Ngay sau đó, người dùng trong các tài khoản thành viên báo cáo rằng các thao tác bảng điều khiển IAM, Amazon CloudFront distribution và cập nhật DNS Amazon Route 53 đều bị lỗi AccessDenied. Nên sửa SCP như thế nào?

**Đáp án đúng:** **D**

Một mẫu SCP kinh điển của đề thi SCS-C02: khi giới hạn Region bằng **`StringNotEquals: { "aws:RequestedRegion": [...] }`**, phải luôn dùng **`NotAction`** để loại trừ các **Global Services** (IAM, STS, CloudFront, Route 53, Organizations, Support, Global Accelerator...) vì control plane của chúng nằm tại `us-east-1`.

- **A:** Thêm `us-east-1` vào danh sách Region được phép sẽ cho phép kỹ sư tạo EC2/RDS/S3 tại Mỹ, vi phạm trực tiếp yêu cầu data residency tại châu Âu.
- **B:** Bỏ điều kiện `aws:RequestedRegion` sẽ làm mất hoàn toàn cơ chế giới hạn Region.
- **C:** SCP không có tác dụng lên Management Account và không giải quyết lỗi chặn global services ở member accounts.
- **D (Đúng):** Chính xác! Các dịch vụ toàn cầu (global services) như IAM, STS, Route 53, CloudFront, Organizations, Support luôn gửi API endpoint về `us-east-1`. Do đó khi viết SCP giới hạn Region bằng `aws:RequestedRegion`, bắt buộc phải dùng **`NotAction`** để miễn trừ các dịch vụ global này, nếu không toàn bộ thao tác IAM/Route 53/CloudFront sẽ bị chặn.

</details>

### Câu 5 `hard`

A regulated enterprise wants application developers to self-service provision pre-approved, encrypted Amazon RDS databases and hardened EC2 stacks—WITHOUT granting developers direct IAM permissions to call rds:CreateDBInstance, ec2:RunInstances, or kms:CreateKey directly in the AWS account. Which AWS Service Catalog feature enforces this least-privilege self-service model?

- **A.** Configure a Service Catalog Launch Constraint with a dedicated IAM launch role, and grant developers only Service Catalog end-user permissions.
- **B.** Attach an AWS Service Catalog TagUpdate Constraint to the portfolio so developers can launch RDS instances without direct IAM permissions.
- **C.** Grant developers AdministratorAccess via IAM Identity Center and instruct them to deploy only approved CloudFormation templates manually.
- **D.** Use AWS Config Remediation with SSM Automation to delete any RDS instance created by developers outside of AWS Service Catalog.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp được quản lý chặt chẽ muốn các nhà phát triển ứng dụng tự phục vụ khởi tạo các cơ sở dữ liệu Amazon RDS được mã hóa và các EC2 stack đã được hardening được phê duyệt trước—MÀ KHÔNG cấp cho nhà phát triển quyền IAM trực tiếp để gọi rds:CreateDBInstance, ec2:RunInstances hoặc kms:CreateKey trực tiếp trong tài khoản AWS. Tính năng AWS Service Catalog nào thực thi mô hình tự phục vụ đặc quyền tối thiểu này?

**Đáp án đúng:** **A**

**AWS Service Catalog Launch Constraints** là mô hình chuẩn cho **Self-Service Least Privilege**: developer chỉ có quyền khởi chạy sản phẩm đã phê duyệt trong Service Catalog, còn toàn bộ quyền `rds:*`, `ec2:*`, `kms:*` nằm trên **Launch Role** do đội bảo mật kiểm soát.

- **A (Đúng):** Chính xác! **AWS Service Catalog Launch Constraint** chỉ định một IAM Role chuyên biệt để CloudFormation thay mặt Service Catalog khởi tạo tài nguyên theo đúng template đã duyệt, nên developer chỉ cần quyền cơ bản của Service Catalog end-user mà không cần bất kỳ quyền trực tiếp nào đối với EC2, RDS hay KMS.
- **B:** TagUpdate Constraint chỉ cho phép người dùng cuối cập nhật tag sau khi provision sản phẩm, không cấp quyền khởi tạo tài nguyên thay mặt developer.
- **C:** Cấp `AdministratorAccess` vi phạm nghiêm trọng yêu cầu không cấp quyền trực tiếp cho developer tạo RDS/EC2/KMS.
- **D:** Đây chỉ là cơ chế phát hiện/xóa hậu kiểm (detective/remediation) và vẫn đòi hỏi cấp quyền tạo RDS cho developer, không phải giải pháp self-service least-privilege.

</details>

### Câu 6 `hard`

A company manages 600 Linux and Windows servers spanning both Amazon EC2 and on-premises data centers. Security policy requires automatically approving and installing critical OS security patches 7 days after release during an approved Sunday 02:00 UTC window, while reporting patch compliance status centrally without opening inbound SSH or RDP ports. Which AWS Systems Manager configuration satisfies these requirements?

- **A.** Use Amazon Inspector to automatically download and install Critical OS patches on both EC2 and on-premises servers every Sunday.
- **B.** Configure AWS Config to run yum update and Windows Update directly on on-premises servers every Sunday at 02:00 UTC.
- **C.** Register hybrid managed nodes, create Patch Baselines with a 7-day auto-approval delay for Critical patches, and use Maintenance Windows.
- **D.** Deploy an AWS Lambda function that connects via SSH and RDP to all 600 servers every Sunday at 02:00 UTC to apply updates.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty quản lý 600 máy chủ Linux và Windows trải rộng trên cả Amazon EC2 và các trung tâm dữ liệu tại chỗ. Chính sách bảo mật yêu cầu tự động phê duyệt và cài đặt các bản vá bảo mật OS quan trọng sau 7 ngày kể từ khi phát hành trong khung giờ Chủ Nhật 02:00 UTC đã phê duyệt, đồng thời báo cáo trạng thái tuân thủ bản vá tập trung mà không cần mở cổng SSH hoặc RDP đi vào. Cấu hình AWS Systems Manager nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **C**

**AWS Systems Manager Patch Manager** (kết hợp **Custom Patch Baselines**, **Maintenance Windows**, **Hybrid Activations** và **SSM Compliance**) là giải pháp quản lý vá lỗi tập trung, an toàn (không mở SSH/RDP) cho cả EC2 và máy chủ on-premises.

- **A:** Amazon Inspector chỉ phát hiện và báo cáo lỗ hổng (CVE), KHÔNG có chức năng cài đặt bản vá hệ điều hành.
- **B:** AWS Config không phải công cụ quản lý bản vá OS hay thực thi lệnh vá lỗi định kỳ theo Maintenance Window trên máy chủ on-premises.
- **C (Đúng):** Chính xác! **AWS Systems Manager Patch Manager** quản lý đồng nhất cả EC2 và máy chủ on-premises (hybrid activations / managed nodes) qua kết nối outbound HTTPS (không mở SSH/RDP). **Custom Patch Baseline** đặt độ trễ phê duyệt 7 ngày cho bản vá Critical, kết hợp **Maintenance Windows** để cài đặt đúng khung giờ Chủ Nhật 02:00 UTC và báo cáo tuân thủ qua SSM Compliance.
- **D:** Mở SSH/RDP và tự viết Lambda quản lý vá lỗi 600 máy chủ vừa vi phạm yêu cầu không mở port SSH/RDP, vừa có giới hạn timeout 15 phút của Lambda và gánh nặng vận hành cao.

</details>

### Câu 7 `hard`

A security architect attaches a Service Control Policy (SCP) to the Production OU in AWS Organizations to restrict all workloads to the us-east-1 and eu-west-1 Regions using a Deny statement with 'Action': '*' and 'Condition': { 'StringNotEquals': { 'aws:RequestedRegion': ['us-east-1', 'eu-west-1'] } }. Immediately after deployment, administrators report that IAM, Route 53, and CloudFront console operations fail in all Production accounts. Why did this happen and how should the SCP be fixed?

- **A.** Global services run in us-east-1; replace 'Action': '*' with 'NotAction' exempting global services (iam:*, route53:*, cloudfront:*, sts:*).
- **B.** SCPs cannot use the aws:RequestedRegion condition key; move the restriction to an IAM Permissions Boundary instead.
- **C.** The SCP was attached to the Production OU instead of the Management Account; attach the SCP only to the Management Account.
- **D.** Change 'Effect': 'Deny' to 'Effect': 'Allow' and remove the FullAWSAccess SCP from the Production OU.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiến trúc sư bảo mật gắn một Service Control Policy (SCP) vào Production OU trong AWS Organizations để giới hạn tất cả workload chỉ chạy trong các Region us-east-1 và eu-west-1 bằng một câu lệnh Deny với 'Action': '*' và 'Condition': { 'StringNotEquals': { 'aws:RequestedRegion': ['us-east-1', 'eu-west-1'] } }. Ngay sau khi triển khai, các quản trị viên báo cáo rằng các thao tác bảng điều khiển IAM, Route 53 và CloudFront đều thất bại trong tất cả các tài khoản Production. Tại sao điều này xảy ra và nên sửa SCP như thế nào?

**Đáp án đúng:** **A**

Lỗi kinh điển khi viết **Region Restriction SCP** trong Domain 6: luôn phải dùng **`NotAction`** để miễn trừ các **Global Services** (`iam:*`, `sts:*`, `route53:*`, `cloudfront:*`, `organizations:*`, `support:*`, `budgets:*`).

- **A (Đúng):** Chính xác! Khi viết SCP giới hạn Region, bắt buộc phải dùng NotAction để miễn trừ các Global Services (iam, sts, route53, cloudfront, organizations, waf, support...), nếu không các thao tác quản trị toàn cầu sẽ bị Deny.
- **B:** aws:RequestedRegion là condition key chuẩn xác và được khuyến nghị dùng trực tiếp trong SCP để thực thi giới hạn Region.
- **C:** SCP hoàn toàn không có hiệu lực lên Management Account; gắn vào Production OU là đúng vị trí, lỗi chỉ nằm ở việc thiếu miễn trừ Global Services.
- **D:** Nếu chỉ Allow 2 Region đó mà bỏ FullAWSAccess, các Global Services vẫn sẽ bị chặn nếu không được liệt kê cho phép rõ ràng.

</details>

### Câu 8 `hard`

A company using AWS Organizations wants to eliminate standing root user credentials across all 120 member accounts to reduce the risk of root account compromise, while still allowing authorized security administrators to perform emergency privileged tasks (such as unlocking a misconfigured S3 bucket policy) when necessary. What is the MOST secure and AWS-recommended approach?

- **A.** Store all 120 member account root passwords and TOTP MFA seeds in a shared AWS Secrets Manager secret accessible to the security team.
- **B.** Attach a Service Control Policy (SCP) to the Root OU that denies all actions for the Management Account root user.
- **C.** Enable Centralized Root Access Management, delete member root credentials, and use task-scoped AssumeRoot sessions.
- **D.** Create IAM access keys for each member account root user and rotate them monthly via AWS Lambda.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty sử dụng AWS Organizations muốn loại bỏ thông tin xác thực root user thường trực trên tất cả 120 tài khoản thành viên để giảm thiểu rủi ro bị xâm phạm tài khoản root, trong khi vẫn cho phép các quản trị viên bảo mật được ủy quyền thực hiện các tác vụ đặc quyền khẩn cấp (như mở khóa một S3 bucket policy bị cấu hình sai) khi cần thiết. Cách tiếp cận BẢO MẬT NHẤT và được AWS khuyến nghị là gì?

**Đáp án đúng:** **C**

**Centralized Root Access Management** trong AWS Organizations là best practice hiện đại nhất của AWS để bảo vệ Root User trên quy mô đa tài khoản: loại bỏ hoàn toàn standing root credentials và thay bằng phiên **AssumeRoot** ngắn hạn, có phạm vi tác vụ cụ thể (task-scoped) và ghi log đầy đủ trên CloudTrail.

- **A:** Lưu trữ tập trung cả mật khẩu lẫn MFA seed của 120 tài khoản Root trong một chỗ tạo ra điểm lỗi đơn cực kỳ nguy hiểm (single point of catastrophic compromise).
- **B:** SCP không bao giờ áp dụng cho Management Account và cũng không xóa bỏ được standing root credentials ở các member account.
- **C (Đúng):** Chính xác! Centralized Root Access Management cho phép xóa bỏ hoàn toàn mật khẩu/MFA/access keys của Root user trên các member accounts, và khi cần xử lý sự cố (như mở khóa S3 bucket policy bị Deny all) chỉ cấp phiên AssumeRoot ngắn hạn giới hạn đúng tác vụ cụ thể.
- **D:** Tạo Access Keys cho Root user là hành vi vi phạm nghiêm trọng AWS Security Best Practices.

</details>

---

[Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md)
