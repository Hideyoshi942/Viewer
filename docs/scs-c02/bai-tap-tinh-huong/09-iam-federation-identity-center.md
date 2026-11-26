# Bài tập tình huống — IAM Identity Center, SAML/OIDC Federation & AWS Verified Access

> IAM Identity Center Permission Sets, SAML 2.0 & OIDC Federation, STS AssumeRole, ABAC Session Tags và AWS Verified Access (Zero Trust).
> **Số câu hỏi:** 6 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

An enterprise implements Attribute-Based Access Control (ABAC) using AWS IAM Identity Center. Users receive a session tag Project from the corporate IdP, and their IAM policy allows managing EC2 instances only when aws:ResourceTag/Project matches aws:PrincipalTag/Project. During a security review, a red team member demonstrates privilege escalation by changing the Project tag on a production EC2 instance to match their own Project tag, and then stopping that production instance. How should the security architect fix this vulnerability?

- **A.** Replace aws:ResourceTag/Project with aws:RequestTag/Project in the ec2:StopInstances statement.
- **B.** Restrict ec2:CreateTags/DeleteTags on the Project key using aws:TagKeys, and require matching aws:RequestTag/Project on RunInstances.
- **C.** Move the Project tag from IAM Identity Center session tags to an S3 bucket policy.
- **D.** Enable AWS CloudTrail Insights to block unauthorized ec2:CreateTags API calls in real time.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp triển khai Kiểm soát Truy cập Dựa trên Thuộc tính (ABAC) bằng AWS IAM Identity Center. Người dùng nhận một session tag Project từ IdP doanh nghiệp, và IAM policy của họ chỉ cho phép quản lý EC2 instance khi aws:ResourceTag/Project khớp với aws:PrincipalTag/Project. Trong một đợt đánh giá bảo mật, một thành viên red team chứng minh khả năng leo thang đặc quyền bằng cách đổi tag Project trên một EC2 instance production để khớp với tag Project của chính họ, và sau đó dừng EC2 instance production đó. Kiến trúc sư bảo mật nên khắc phục lỗ hổng này như thế nào?

**Đáp án đúng:** **B**

Khi triển khai **ABAC** trên AWS, luôn phải bảo vệ tính toàn vẹn của các tag dùng để phân quyền bằng 3 condition keys: `aws:PrincipalTag` (tag trên danh tính), `aws:ResourceTag` (tag đã có trên tài nguyên), `aws:RequestTag` (tag truyền vào khi tạo mới) và `aws:TagKeys` (chặn sửa/xóa các tag nhạy cảm như `Project` hoặc `Environment` trên tài nguyên đã tồn tại).

- **A:** Hành động ec2:StopInstances không nhận tham số tag mới trong request nên không có context key aws:RequestTag; để kiểm tra tag của EC2 instance đang tồn tại bắt buộc phải dùng aws:ResourceTag.
- **B (Đúng):** Chính xác! Trong mô hình ABAC, lỗ hổng leo thang đặc quyền phổ biến nhất là cho phép người dùng tự ý sửa tag (CreateTags/DeleteTags) trên tài nguyên hiện có. Bắt buộc phải chặn sửa đổi tag khóa Project trên tài nguyên đã tồn tại (dùng aws:TagKeys hoặc ec2:CreateAction=RunInstances) và ép tag lúc tạo mới phải khớp aws:RequestTag/Project == aws:PrincipalTag/Project.
- **C:** S3 bucket policy không kiểm soát hành động EC2 và không giải quyết lỗ hổng sửa tag trên EC2.
- **D:** CloudTrail Insights chỉ là công cụ phát hiện bất thường (detective), không có khả năng ngăn chặn (prevent) lời gọi API ec2:CreateTags.

</details>

### Câu 2 `hard`

A company uses AWS IAM Identity Center integrated with an external SAML 2.0 identity provider for 500 developers across 40 AWS accounts. Rather than creating dozens of separate permission sets for every project team, the security team wants to use a single permission set that grants developers access ONLY to Amazon EC2 and S3 resources tagged with the same Project value as the user's department attribute from the identity provider. How should the team implement this?

- **A.** Enable ABAC in IAM Identity Center, map department to a Project session tag, and match aws:PrincipalTag/Project to aws:ResourceTag/Project.
- **B.** Attach an AWS Organizations SCP to each OU that dynamically matches the user's IdP email domain to resource tags.
- **C.** Create an IAM user for each developer in every AWS account and tag each IAM user with their Project name.
- **D.** Use IAM Access Analyzer to automatically generate separate inline policies per project whenever a developer logs in.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty sử dụng AWS IAM Identity Center tích hợp với nhà cung cấp danh tính SAML 2.0 bên ngoài cho 500 nhà phát triển trên 40 tài khoản AWS. Thay vì tạo hàng chục permission set riêng biệt cho từng nhóm dự án, nhóm bảo mật muốn sử dụng một permission set duy nhất CHỈ cấp cho nhà phát triển quyền truy cập vào các tài nguyên Amazon EC2 và S3 được gắn thẻ có giá trị Project giống với thuộc tính department của người dùng từ nhà cung cấp danh tính. Nhóm nên triển khai việc này như thế nào?

**Đáp án đúng:** **A**

**ABAC (Attribute-Based Access Control)** trong **IAM Identity Center** cho phép ánh xạ thuộc tính người dùng từ IdP thành session tags (`aws:PrincipalTag/<key>`), giúp thu gọn số lượng Permission Sets bằng cách viết policy đối chiếu `aws:ResourceTag/Project` với `${aws:PrincipalTag/Project}`.

- **A (Đúng):** Chính xác! Bật ABAC trong IAM Identity Center cho phép truyền thuộc tính từ IdP vào phiên làm việc dưới dạng session tag (`aws:PrincipalTag/Project`), sau đó một permission set duy nhất có thể so sánh động `aws:ResourceTag/Project` với `${aws:PrincipalTag/Project}` để phân quyền chi tiết mà không cần tạo hàng chục permission set.
- **B:** SCP chỉ là rào chắn giới hạn quyền tối đa (guardrail), KHÔNG cấp quyền (grant permissions), và không thể tự động lấy thuộc tính IdP nếu chưa cấu hình ABAC session tags.
- **C:** Tạo IAM user tĩnh trên 40 tài khoản đi ngược lại kiến trúc liên kết tập trung của IAM Identity Center và gây gánh nặng vận hành cực lớn.
- **D:** IAM Access Analyzer dùng để phát hiện truy cập bên ngoài/quyền dư thừa và sinh policy từ CloudTrail lịch sử, không tự động sinh policy động theo từng lần đăng nhập.

</details>

### Câu 3 `hard`

A data processing pipeline uses role chaining: an authenticated user assumes RoleA with a session tag CostCenter=Finance, and then RoleA assumes RoleB in another AWS account to read an encrypted S3 bucket whose policy requires aws:PrincipalTag/CostCenter to equal Finance. Currently, requests made by RoleB fail with AccessDenied because the CostCenter tag is missing when RoleB is assumed. What must be configured to ensure the CostCenter tag persists across the role chain?

- **A.** Add the CostCenter tag directly to the S3 bucket's resource policy as a Principal condition key.
- **B.** Include CostCenter in TransitiveTagKeys when assuming RoleA, and grant sts:TagSession to RoleA on RoleB.
- **C.** Enable IAM Session Policies on RoleB to automatically copy all session tags from RoleA during assumption.
- **D.** Replace sts:AssumeRole with sts:GetSessionToken when RoleA switches to RoleB in the target account.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một pipeline xử lý dữ liệu sử dụng chuỗi role (role chaining): một người dùng đã xác thực assume RoleA với session tag CostCenter=Finance, và sau đó RoleA assume RoleB trong một tài khoản AWS khác để đọc một S3 bucket được mã hóa mà policy của nó yêu cầu aws:PrincipalTag/CostCenter phải bằng Finance. Hiện tại, các request do RoleB thực hiện bị lỗi AccessDenied vì tag CostCenter bị thiếu khi RoleB được assume. Phải cấu hình gì để đảm bảo tag CostCenter được duy trì xuyên suốt chuỗi role?

**Đáp án đúng:** **B**

Khi thực hiện **STS Role Chaining** với **Session Tags**, để một tag tiếp tục tồn tại ở các role tiếp theo, tag key đó bắt buộc phải được liệt kê trong **`TransitiveTagKeys`** và role thực hiện chuyển tiếp phải có quyền **`sts:TagSession`** trong cả identity policy và trust policy của role đích.

- **A:** S3 bucket policy đã kiểm tra `aws:PrincipalTag/CostCenter`; vấn đề nằm ở việc session tag bị mất trong quá trình role chaining từ RoleA sang RoleB.
- **B (Đúng):** Chính xác! Trong role chaining, session tags mặc định KHÔNG tự động truyền sang role tiếp theo. Cần khai báo key đó trong tham số `TransitiveTagKeys` khi assume RoleA, đồng thời cấp quyền `sts:TagSession` cho RoleA (trong cả identity policy của RoleA và trust policy của RoleB) để tag được chuyển tiếp hợp lệ.
- **C:** Session policy chỉ có tác dụng thu hẹp phạm vi quyền của phiên, không có chức năng tự động sao chép session tags giữa các role.
- **D:** `sts:GetSessionToken` dùng cho IAM user (ví dụ xác thực MFA), không dùng để assume một IAM role khác trong role chaining.

</details>

### Câu 4 `hard`

A large enterprise uses AWS IAM Identity Center to manage access across 80 AWS accounts. A permission set needs to reference an existing customer-managed IAM policy named FinanceAuditPolicy that is deployed with identical names in each member account, and the security team also wants to delegate day-to-day IAM Identity Center administration to the Security Tooling account so the management account is rarely used. Which TWO statements accurately describe how to achieve these goals? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Attach FinanceAuditPolicy by name/path in the permission set, ensuring it already exists in each target member account.
- **B.** IAM Identity Center automatically replicates the JSON body of FinanceAuditPolicy from the management account to all member accounts during provisioning.
- **C.** Once delegated administration is enabled, the Security Tooling account can create and modify permission sets assigned directly to the AWS Organizations management account.
- **D.** Customer managed policies cannot be attached to IAM Identity Center permission sets; all custom permissions must be placed inside a single inline policy.
- **E.** Register Security Tooling as delegated admin for IAM Identity Center to manage permission sets for member accounts.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp lớn sử dụng AWS IAM Identity Center để quản lý quyền truy cập trên 80 tài khoản AWS. Một permission set cần tham chiếu tới một customer-managed IAM policy hiện có tên là FinanceAuditPolicy được triển khai với tên giống hệt nhau trong mỗi tài khoản thành viên, và nhóm bảo mật cũng muốn ủy quyền quản trị IAM Identity Center hàng ngày cho tài khoản Security Tooling để management account ít khi phải sử dụng. HAI phát biểu nào mô tả chính xác cách đạt được các mục tiêu này? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, E**

Hai điểm thi trọng tâm của **IAM Identity Center**: (1) **Customer Managed Policies** trong Permission Set yêu cầu policy cùng tên và path phải được tạo sẵn trong mọi member account (thường dùng StackSets); (2) **Delegated Administrator** quản lý được toàn bộ member accounts nhưng **không** được phép chỉnh sửa assignment/permission set áp dụng cho Management Account.

- **A (Đúng):** Chính xác! IAM Identity Center hỗ trợ gắn Customer Managed Policy (tối đa 20 policy) vào Permission Set theo tên và đường dẫn (path); điều kiện bắt buộc là chính sách IAM có cùng tên và path phải tồn tại sẵn trong từng member account mục tiêu trước khi gán (provision).
- **B:** IAM Identity Center KHÔNG tự sao chép nội dung Customer Managed Policy sang các member account; người quản trị phải triển khai sẵn policy đó (ví dụ bằng CloudFormation StackSets) ở từng member account.
- **C:** Theo nguyên tắc bảo mật của AWS, Delegated Administrator của IAM Identity Center KHÔNG được phép tạo hoặc chỉnh sửa permission sets hay assignments gán cho Management Account (phải thực hiện trực tiếp từ Management Account).
- **D:** IAM Identity Center hỗ trợ gắn cả AWS Managed Policies, Customer Managed Policies, Inline Policy và Permissions Boundary vào Permission Set.
- **E (Đúng):** Chính xác! Đăng ký tài khoản Security Tooling làm Delegated Administrator cho IAM Identity Center giúp giảm tối đa việc truy cập vào Management Account, trong khi vẫn quản lý được permission sets và assignments cho toàn bộ member accounts (trừ việc quản lý quyền truy cập trực tiếp vào chính Management Account).

</details>

### Câu 5 `hard`

A data lake team stores datasets for 2,000 internal business analysts in a single Amazon S3 bucket organized by department prefixes. The team tried managing prefix-level permissions using an S3 bucket policy, but quickly hit the 20 KB S3 bucket policy size limit. The company uses AWS IAM Identity Center synced with Microsoft Entra ID and wants to map corporate directory groups directly to S3 prefixes with auditable, temporary prefix-scoped credentials. Which AWS feature should the team adopt?

- **A.** Create 2,000 separate S3 bucket policies and attach all of them to the same S3 bucket.
- **B.** Enable S3 Access Control Lists (ACLs) on every prefix and grant READ permission to Entra ID email addresses.
- **C.** Request an AWS Support quota increase to raise the S3 bucket policy size limit from 20 KB to 5 MB.
- **D.** Configure Amazon S3 Access Grants with IAM Identity Center to map directory groups to S3 buckets and prefixes.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm data lake lưu trữ các tập dữ liệu cho 2.000 chuyên viên phân tích kinh doanh nội bộ trong một Amazon S3 bucket duy nhất được sắp xếp theo tiền tố (prefix) phòng ban. Nhóm đã thử quản lý quyền cấp độ tiền tố bằng S3 bucket policy, nhưng nhanh chóng chạm giới hạn kích thước S3 bucket policy 20 KB. Công ty sử dụng AWS IAM Identity Center đồng bộ với Microsoft Entra ID và muốn ánh xạ trực tiếp các nhóm thư mục doanh nghiệp tới các tiền tố S3 với thông tin xác thực tạm thời có phạm vi theo tiền tố và có thể kiểm toán được. Nhóm nên áp dụng tính năng AWS nào?

**Đáp án đúng:** **D**

**Amazon S3 Access Grants** giải quyết bài toán phân quyền dữ liệu ở quy mô lớn (hàng nghìn user/group từ Entra ID/Okta thông qua **IAM Identity Center** truy cập theo từng prefix của data lake) mà không bị vướng giới hạn 20 KB của S3 bucket policy, đồng thời ghi vết danh tính người dùng cuối vào CloudTrail.

- **A:** Mỗi S3 bucket chỉ có thể gắn duy nhất một bucket policy với kích thước tối đa 20 KB.
- **B:** S3 ACL là cơ chế cũ (AWS khuyến nghị tắt ACL), không hỗ trợ phân quyền theo prefix và không tích hợp trực tiếp với nhóm Entra ID / IAM Identity Center.
- **C:** Giới hạn 20 KB của S3 bucket policy là giới hạn cứng (hard limit), không thể xin tăng lên 5 MB.
- **D (Đúng):** Chính xác! **Amazon S3 Access Grants** được thiết kế chuyên biệt để ánh xạ quy mô lớn danh tính từ corporate directory (qua IAM Identity Center) hoặc IAM principals tới các S3 bucket và prefix cụ thể (hỗ trợ hàng trăm nghìn grant, vượt xa giới hạn 20 KB của bucket policy) và tự động cấp temporary prefix-scoped credentials, ghi nhận đầy đủ danh tính cuối trong CloudTrail.

</details>

### Câu 6 `hard`

A company partners with a third-party SaaS security vendor that needs read-only access to resources across the company's AWS accounts. Additionally, the company wants its internal GitHub Actions CI/CD pipelines to deploy infrastructure to AWS without storing long-term IAM user access keys. Which TWO mechanisms follow AWS security best practices? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Create a dedicated IAM user for the third-party vendor and rotate its access keys every 90 days using AWS Secrets Manager.
- **B.** Use Amazon Cognito Identity Pools to authenticate GitHub Actions runners with SAML 2.0 assertions.
- **C.** Create an IAM role for the vendor trusting their account ID with a unique sts:ExternalId condition in the trust policy.
- **D.** Add the aws:SourceArn condition to the third-party vendor's trust policy instead of sts:ExternalId.
- **E.** Configure an IAM OIDC provider for GitHub Actions allowing sts:AssumeRoleWithWebIdentity scoped to the repo and branch.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty hợp tác với một nhà cung cấp SaaS bảo mật bên thứ ba cần quyền truy cập chỉ đọc tới các tài nguyên trên các tài khoản AWS của công ty. Ngoài ra, công ty muốn các CI/CD pipeline GitHub Actions nội bộ của mình triển khai hạ tầng lên AWS mà không cần lưu trữ access key dài hạn của IAM user. HAI cơ chế nào tuân theo các thực tiễn tốt nhất về bảo mật của AWS? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Ghi nhớ hai nguyên tắc Federation & Cross-Account quan trọng trong Domain 4: (1) Chia sẻ quyền cho 3rd-Party SaaS → IAM Role + **`sts:ExternalId`** (chống Confused Deputy); (2) CI/CD như GitHub Actions / GitLab → **IAM OIDC Provider** (`sts:AssumeRoleWithWebIdentity`) thay vì tạo IAM Access Key tĩnh.

- **A:** Dùng IAM user access keys dài hạn cho bên thứ 3 là anti-pattern; AWS luôn khuyến nghị dùng Cross-Account IAM Role + ExternalId.
- **B:** Cognito Identity Pools dành cho ứng dụng end-user (mobile/web), không phải giải pháp chuẩn cho CI/CD GitHub Actions (vốn hỗ trợ trực tiếp IAM OIDC Provider).
- **C (Đúng):** Chính xác! Khi cấp quyền Cross-Account IAM Role cho đối tác 3rd-party SaaS, bắt buộc phải dùng điều kiện sts:ExternalId trong Trust Policy để ngăn chặn tấn công Confused Deputy.
- **D:** aws:SourceArn dùng để chống Confused Deputy cho các AWS Services (như CloudTrail, S3, SNS), còn với đối tác 3rd-party AWS Account thì phải dùng sts:ExternalId.
- **E (Đúng):** Chính xác! Dùng OIDC Federation (AssumeRoleWithWebIdentity) cho GitHub Actions giúp cấp STS temporary credentials ngắn hạn, loại bỏ hoàn toàn rủi ro lộ IAM Access Key dài hạn.

</details>

---

[Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md)
