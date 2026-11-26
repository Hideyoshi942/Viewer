# Bài tập tình huống — IAM Policy Evaluation Logic, Permissions Boundaries & Data Perimeter

> Luồng đánh giá Explicit Deny/SCP/Resource Policy/Permissions Boundary/Session Policy, Confused Deputy (aws:SourceArn/SourceAccount) và Data Perimeter.
> **Số câu hỏi:** 5 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A company has several on-premises Linux servers that need to upload nightly backups to an Amazon S3 bucket. The security policy strictly prohibits storing long-lived IAM user access keys on on-premises servers. The company already operates an internal Public Key Infrastructure (PKI) that issues X.509 client certificates to each server. Which AWS solution allows these servers to obtain temporary AWS credentials using their existing X.509 certificates?

- **A.** Import the internal CA into AWS IAM Identity Center and assign the Linux servers to a SAML 2.0 application.
- **B.** Upload the X.509 certificates to Amazon Cognito Identity Pools and exchange them for STS credentials.
- **C.** Attach an IAM instance profile directly to the on-premises Linux servers after connecting them via AWS Site-to-Site VPN.
- **D.** Configure IAM Roles Anywhere (Trust Anchor for the CA, Profile for the S3 role) and use `aws_signing_helper`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có nhiều máy chủ Linux tại chỗ (on-premises) cần tải các bản sao lưu hàng đêm lên một Amazon S3 bucket. Chính sách bảo mật nghiêm cấm lưu trữ access key dài hạn của IAM user trên các máy chủ tại chỗ. Công ty đã vận hành một Hạ tầng Khóa Công khai (PKI) nội bộ cấp chứng chỉ máy khách X.509 cho từng máy chủ. Giải pháp AWS nào cho phép các máy chủ này lấy thông tin xác thực AWS tạm thời bằng chứng chỉ X.509 hiện có của chúng?

**Đáp án đúng:** **D**

**AWS IAM Roles Anywhere** giải quyết bài toán loại bỏ long-lived IAM access keys cho workload on-premises bằng cách tin cậy vào **X.509 certificates** từ PKI nội bộ hoặc ACM Private CA thông qua 3 thành phần: **Trust Anchor**, **Profile** (liên kết IAM Role), và credential helper (`aws_signing_helper`).

- **A:** IAM Identity Center thiết kế cho danh tính con người (workforce users) đăng nhập SSO qua SAML/OIDC, không dùng để cấp phát credentials dựa trên chứng chỉ X.509 cho máy chủ on-premises.
- **B:** Amazon Cognito Identity Pools hỗ trợ danh tính người dùng ứng dụng web/mobile (OIDC, SAML, Cognito User Pools), không hỗ trợ xác thực trực tiếp bằng chứng chỉ X.509 PKI nội bộ cho máy chủ.
- **C:** IAM instance profile chỉ gắn được cho Amazon EC2 instances, không thể gắn trực tiếp cho máy chủ on-premises dù có VPN.
- **D (Đúng):** Chính xác! AWS IAM Roles Anywhere cho phép các workload bên ngoài AWS (on-premises) sử dụng chứng chỉ X.509 do CA nội bộ (hoặc ACM Private CA) cấp để xác thực thông qua Trust Anchor và Profile, dùng công cụ `aws_signing_helper` để đổi lấy temporary credentials từ IAM role mà không cần IAM user access keys.

</details>

### Câu 2 `hard`

An IAM role named AppDeveloperRole in a member account has an identity-based policy allowing s3:*, ec2:*, and rds:*. The role has an IAM Permissions Boundary attached allowing s3:* and ec2:*. The member account's OU has an AWS Organizations SCP allowing s3:*, rds:*, and dynamodb:*. A developer assumes AppDeveloperRole and passes an inline Session Policy allowing s3:GetObject and ec2:RunInstances. Assuming no resource-based policies apply, which action is ALLOWED for this session?

- **A.** Both s3:GetObject and ec2:RunInstances
- **B.** s3:GetObject only
- **C.** s3:* and rds:*
- **D.** s3:*, ec2:*, and rds:*

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một IAM role tên là AppDeveloperRole trong một tài khoản thành viên có identity-based policy cho phép s3:*, ec2:* và rds:*. Role này có gắn một IAM Permissions Boundary cho phép s3:* và ec2:*. OU của tài khoản thành viên có một AWS Organizations SCP cho phép s3:*, rds:* và dynamodb:*. Một nhà phát triển assume AppDeveloperRole và truyền một inline Session Policy cho phép s3:GetObject và ec2:RunInstances. Giả sử không có resource-based policy nào áp dụng, hành động nào ĐƯỢC PHÉP đối với phiên này?

**Đáp án đúng:** **B**

Quy tắc vàng **IAM Policy Evaluation Logic** (cùng tài khoản, không có resource-based policy): Quyền thực tế = **Identity Policy ∩ Permissions Boundary ∩ SCP ∩ Session Policy** (và bất kỳ **Explicit Deny** nào ở bất kỳ lớp nào đều thắng tuyệt đối).

- **A:** `ec2:RunInstances` bị chặn bởi SCP của OU (vì SCP chỉ cho phép `s3:*`, `rds:*`, và `dynamodb:*`, không có `ec2:*`).
- **B (Đúng):** Chính xác! Trong IAM Policy Evaluation Logic (khi không có resource policy), quyền hiệu lực là **phần giao (intersection)** của TẤT CẢ các lớp áp dụng: Identity Policy (`s3:*, ec2:*, rds:*`) ∩ Permissions Boundary (`s3:*, ec2:*`) ∩ SCP (`s3:*, rds:*, dynamodb:*`) ∩ Session Policy (`s3:GetObject, ec2:RunInstances`). Chỉ có duy nhất `s3:GetObject` được cho phép ở cả 4 lớp!
- **C:** `rds:*` bị chặn bởi cả Permissions Boundary lẫn Session Policy; các hành động S3 khác ngoài `s3:GetObject` bị chặn bởi Session Policy.
- **D:** Identity-based policy không thể vượt qua giới hạn của Permissions Boundary, SCP hay Session Policy.

</details>

### Câu 3 `hard`

A mobile fitness application has 2 million consumer users who sign in using Sign in with Apple, Google, or email/password. After authenticating, the mobile app needs temporary, scoped AWS credentials so each user can upload workout videos directly to their own private prefix in an Amazon S3 bucket (s3://fitness-bucket/users/${cognito-identity.amazonaws.com:sub}/*) without routing large video files through backend servers. Which architecture should the security architect implement?

- **A.** Use an Amazon Cognito User Pool alone and attach an S3 bucket policy directly referencing Cognito User Pool JWT tokens for uploads.
- **B.** Provision 2 million AWS IAM Identity Center users in the directory and assign each consumer user a dedicated S3 permission set.
- **C.** Use Cognito User Pool for sign-in and federation, paired with a Cognito Identity Pool issuing STS credentials scoped via cognito-identity.amazonaws.com:sub.
- **D.** Create 2 million IAM users programmatically via AWS SDK and embed each IAM user's static access key inside the mobile application.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng thể dục di động có 2 triệu người dùng tiêu dùng đăng nhập bằng Sign in with Apple, Google hoặc email/mật khẩu. Sau khi xác thực, ứng dụng di động cần thông tin xác thực AWS tạm thời có phạm vi giới hạn để mỗi người dùng có thể tải video tập luyện trực tiếp lên tiền tố riêng tư của họ trong một Amazon S3 bucket (s3://fitness-bucket/users/${cognito-identity.amazonaws.com:sub}/*) mà không cần định tuyến các tệp video lớn qua máy chủ backend. Kiến trúc sư bảo mật nên triển khai kiến trúc nào?

**Đáp án đúng:** **C**

Phân biệt rõ trong **Amazon Cognito**: **User Pools** = Authentication (đăng ký/đăng nhập, cấp JWT tokens); **Identity Pools** = Authorization vào dịch vụ AWS (đổi token từ User Pool/Google/Apple sang **temporary AWS STS credentials** với biến `${cognito-identity.amazonaws.com:sub}` để cô lập dữ liệu từng người dùng trên S3/DynamoDB).

- **A:** Cognito User Pool chỉ cấp OIDC JWT token, KHÔNG cấp AWS IAM/STS credentials; Amazon S3 không xác thực trực tiếp bằng Cognito User Pool JWT mà cần Cognito Identity Pool để đổi sang STS credentials.
- **B:** IAM Identity Center thiết kế cho nhân sự nội bộ (workforce identities), không dùng cho hàng triệu người dùng ứng dụng tiêu dùng (B2C consumer users).
- **C (Đúng):** Chính xác! **Cognito User Pool** xử lý xác thực người dùng (email/password, Apple, Google) và cấp JWT token; **Cognito Identity Pool (Federated Identities)** đổi token đó lấy temporary AWS STS credentials cho IAM role có policy giới hạn theo biến `${cognito-identity.amazonaws.com:sub}` giúp mỗi người dùng chỉ truy cập đúng prefix S3 của mình.
- **D:** AWS giới hạn mặc định 5.000 IAM users mỗi tài khoản, và nhúng long-lived IAM access keys trong ứng dụng di động là rủi ro bảo mật nghiêm trọng.

</details>

### Câu 4 `hard`

A developer role has permissions to launch Amazon EC2 instances and create AWS Lambda functions, and it currently holds iam:PassRole on Resource: "*". A penetration test demonstrates that the developer can escalate privileges to AdministratorAccess by launching an EC2 instance attached to an existing AdminEC2Role and retrieving its credentials from IMDS. Which TWO IAM policy changes eliminate this privilege escalation vector while allowing the developer to launch EC2 instances with approved application roles? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Replace iam:PassRole with iam:AttachRolePolicy on Resource: "*" so developers can customize roles safely.
- **B.** Restrict the Resource element of the iam:PassRole statement to ONLY the specific ARNs of approved low-privilege application roles.
- **C.** Remove ec2:RunInstances from AdminEC2Role's identity policy to stop developers from passing AdminEC2Role.
- **D.** Add an explicit Deny statement for sts:GetCallerIdentity and sts:DecodeAuthorizationMessage on the developer IAM role.
- **E.** Add a StringEquals condition on iam:PassedToService limiting iam:PassRole to ec2.amazonaws.com and lambda.amazonaws.com.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer role có quyền khởi chạy Amazon EC2 instance và tạo AWS Lambda function, và hiện đang nắm giữ iam:PassRole trên Resource: "*". Một đợt kiểm thử xâm nhập chứng minh rằng nhà phát triển có thể leo thang đặc quyền lên AdministratorAccess bằng cách khởi chạy một EC2 instance gắn với AdminEC2Role hiện có và lấy thông tin xác thực của nó từ IMDS. HAI thay đổi IAM policy nào loại bỏ vector leo thang đặc quyền này trong khi vẫn cho phép nhà phát triển khởi chạy EC2 instance với các application role đã phê duyệt? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, E**

Lỗ hổng leo thang đặc quyền kinh điển **`iam:PassRole` trên `Resource: "*"`**: luôn phải khóa chặt bằng 2 lớp: (1) Giới hạn **`Resource`** chỉ vào danh sách ARN/path của các role được phép; (2) Dùng điều kiện **`iam:PassedToService`** để giới hạn đúng dịch vụ AWS được nhận role đó.

- **A:** Cấp `iam:AttachRolePolicy` trên `*` còn nguy hiểm hơn vì cho phép developer tự gắn trực tiếp `AdministratorAccess` vào chính role của họ.
- **B (Đúng):** Chính xác! Giới hạn `Resource` của `iam:PassRole` chỉ vào các ARN cụ thể của application roles được phê duyệt (thay vì `*`) sẽ chặn hoàn toàn khả năng developer gắn `AdminEC2Role` vào EC2 hoặc Lambda mới tạo.
- **C:** Quyền `ec2:RunInstances` trên `AdminEC2Role` không quyết định việc developer có thể truyền role đó hay không; quyền truyền role nằm ở `iam:PassRole` trên chính role của developer.
- **D:** Chặn `sts:GetCallerIdentity` không hề ngăn được hành vi leo thang đặc quyền qua `iam:PassRole` + `ec2:RunInstances`.
- **E (Đúng):** Chính xác! Điều kiện `iam:PassedToService` đảm bảo role chỉ có thể được truyền cho đúng dịch vụ AWS được phép (`ec2.amazonaws.com`, `lambda.amazonaws.com`), ngăn chặn việc lạm dụng role sang dịch vụ khác.

</details>

### Câu 5 `hard`

A development team needs permission to create IAM roles for their Lambda functions in a shared sandbox account. However, the security team must ensure that developers cannot escalate their privileges by creating a role with AdministratorAccess and assuming it. What is the MOST secure and scalable way to enforce this?

- **A.** Attach a Service Control Policy (SCP) to the sandbox account that denies iam:CreateRole for all principals.
- **B.** Allow developers to call iam:CreateRole without restrictions, and configure an AWS Config rule to send an email alert if a role has AdministratorAccess.
- **C.** Use an IAM Session Policy during developer console login to restrict the policies that newly created roles can have.
- **D.** Create a Permissions Boundary policy and require iam:PermissionsBoundary on iam:CreateRole while denying boundary edits.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm phát triển cần quyền tạo IAM role cho các Lambda function của họ trong một tài khoản sandbox dùng chung. Tuy nhiên, nhóm bảo mật phải đảm bảo các nhà phát triển không thể leo thang đặc quyền bằng cách tạo một role có AdministratorAccess rồi assume nó. Cách BẢO MẬT NHẤT và có khả năng mở rộng nhất để thực thi điều này là gì?

**Đáp án đúng:** **D**

Ủy quyền tạo IAM User/Role mà không gây leo thang đặc quyền (Delegated Administration without Privilege Escalation) là use case số 1 của **IAM Permissions Boundaries** kết hợp Condition key `iam:PermissionsBoundary`.

- **A:** Chặn hoàn toàn iam:CreateRole sẽ khiến đội ngũ phát triển không thể tạo role cho Lambda function theo yêu cầu đề bài.
- **B:** Đây chỉ là biện pháp phát hiện muộn (detective); kẻ tấn công hoặc developer đã kịp assume role AdministratorAccess và gây thiệt hại trước khi đội bảo mật đọc email.
- **C:** Session Policy chỉ giới hạn quyền trong phiên hiện tại của developer, không tự động gắn trần quyền lên các IAM Role mới mà họ tạo ra.
- **D (Đúng):** Chính xác! Permissions Boundary đặt trần quyền tối đa cho bất kỳ IAM Role nào mà developer tạo ra. Kết hợp điều kiện iam:PermissionsBoundary khi gọi iam:CreateRole và chặn xóa/sửa boundary sẽ triệt tiêu hoàn toàn nguy cơ leo thang đặc quyền (Privilege Escalation).

</details>

---

[Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md)
