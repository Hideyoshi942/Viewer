# Bài tập tình huống — Chủ đề 1: IAM, AWS CLI & SDK Fundamentals

> Quản lý danh tính IAM Users, Groups, Roles, Policies, cấu hình AWS CLI, SDK Credentials Chain và STS AssumeRole.
> **Số câu hỏi:** 9 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A developer is creating an AWS Lambda function that needs an IAM execution role (`lambda-s3-read-role`) to access Amazon S3. When the developer runs `aws lambda create-function --role arn:aws:iam::111122223333:role/lambda-s3-read-role`, the command fails with an `AccessDeniedException` stating the user is not authorized to perform `iam:PassRole`. Which IAM permission must be added to the developer's IAM user or role?

- **A.** Add the developer's IAM user ARN as a principal in the Trust Policy of `lambda-s3-read-role`.
- **B.** Grant `sts:AssumeRole` on `lambda-s3-read-role` to the developer's IAM user or role so it can assume the execution role directly.
- **C.** Attach the `AmazonS3ReadOnlyAccess` managed policy directly to the developer's IAM user in the IAM console.
- **D.** Grant `iam:PassRole` on the resource `arn:aws:iam::111122223333:role/lambda-s3-read-role` to the developer's IAM identity.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer đang tạo một hàm AWS Lambda cần một IAM execution role (`lambda-s3-read-role`) để truy cập Amazon S3. Khi developer chạy lệnh `aws lambda create-function --role arn:aws:iam::111122223333:role/lambda-s3-read-role`, lệnh thất bại với lỗi `AccessDeniedException` thông báo người dùng không được phép thực hiện `iam:PassRole`. Quyền IAM nào phải được thêm vào IAM user hoặc role của developer?

**Đáp án đúng:** **D**

Quyền **`iam:PassRole`** là câu hỏi kinh điển trong Domain Security:
- Bất cứ khi nào bạn gán một IAM Role cho dịch vụ AWS (EC2 Instance Profile, Lambda Execution Role, ECS Task Role, CodeBuild Service Role), bạn phải có quyền **`iam:PassRole`** trên role đó.
- Nên giới hạn `Resource` chỉ định đúng Role ARN cần thiết (kèm Condition `iam:PassedToService` nếu cần) để tránh leo thang đặc quyền (privilege escalation).

- **A:** Sai vì Trust Policy chỉ định ai được phép `AssumeRole` (ở đây là `lambda.amazonaws.com`), không thay thế được quyền `iam:PassRole`.
- **B:** Sai vì developer không tự assume role đó; dịch vụ Lambda mới là bên assume role thông qua Trust Policy (`lambda.amazonaws.com`).
- **C:** Sai vì lỗi xảy ra do thiếu quyền `iam:PassRole` khi tạo hàm Lambda, không phải do thiếu quyền đọc S3.
- **D (Đúng):** Đúng! Khi một user truyền (pass) một IAM Role cho dịch vụ AWS (như Lambda, EC2, ECS, CloudFormation, CodePipeline) sử dụng, user đó phải có quyền `iam:PassRole` đối với ARN của role được truyền.

</details>

### Câu 2 `medium`

A backend AWS Lambda function generates an Amazon S3 pre-signed URL for a private PDF report using its IAM execution role and returns the URL to an authenticated user. However, when the user clicks the URL 10 minutes later, S3 returns `403 AccessDenied` (`Request has expired` or `Access Denied`) even though the expiration was set to 1 hour. Which two common causes should the developer investigate?

- **A.** The Lambda execution role lacks `s3:GetObject` on that key, or Lambda's temporary STS credentials expired before the 1-hour URL.
- **B.** The S3 bucket does not have Static Website Hosting enabled with a public index document configured.
- **C.** The S3 bucket has Block Public Access enabled, which automatically invalidates all S3 pre-signed URLs.
- **D.** Amazon S3 pre-signed URLs only support `PUT` object uploads and cannot be generated for `GET` object downloads from private buckets.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm AWS Lambda ở backend tạo một Amazon S3 pre-signed URL cho một báo cáo PDF riêng tư bằng IAM execution role của nó và trả URL về cho người dùng đã xác thực. Tuy nhiên, khi người dùng nhấp vào URL 10 phút sau đó, S3 trả về `403 AccessDenied` (`Request has expired` hoặc `Access Denied`) mặc dù thời gian hết hạn được đặt là 1 giờ. Hai nguyên nhân phổ biến nào mà developer nên điều tra?

**Đáp án đúng:** **A**

Lưu ý bẫy thi **S3 Pre-signed URL**:
1. Người dùng sử dụng URL sẽ có **đúng quyền của IAM identity đã tạo URL**.
2. Thời hạn tối đa của Pre-signed URL phụ thuộc vào loại credentials tạo ra nó: IAM User (tối đa **7 ngày** qua SigV4), **IAM Role / STS temporary credentials** (hết hạn ngay khi **STS token hết hạn** — mặc dù mặc định truyền `ExpiresIn` lớn hơn, URL vẫn chết khi STS token hết hạn).

- **A (Đúng):** Đúng! Pre-signed URL kế thừa **đúng quyền của IAM identity đã ký ra nó** (thiếu `s3:GetObject` -> `AccessDenied`), VÀ thời hạn sống thực tế của Pre-signed URL **không thể vượt quá thời hạn còn lại của STS temporary token** (ví dụ IAM Role của Lambda/EC2) đã ký URL đó.
- **B:** Sai vì Pre-signed URL hoạt động trực tiếp qua S3 REST API endpoint, không cần Static Website Hosting.
- **C:** Sai vì S3 Block Public Access **không** chặn Pre-signed URLs (vì Pre-signed URL có chữ ký xác thực tạm thời chứ không phải truy cập công khai vô danh).
- **D:** Sai vì S3 Pre-signed URLs hỗ trợ cả `GetObject` (tải xuống) và `PutObject` (tải lên).

</details>

### Câu 3 `hard`

A platform team wants to allow application developers to create new IAM roles for their Lambda functions independently. However, to prevent privilege escalation, any IAM role created by a developer must never have permissions exceeding a predefined set of allowed AWS services (e.g., S3, DynamoDB, SQS) — even if the developer attaches `AdministratorAccess` to the new role. Which IAM feature should the platform team enforce?

- **A.** Attach an AWS Organizations Service Control Policy (SCP) directly to the developer's IAM Role to cap maximum service permissions.
- **B.** Add an explicit `iam:PassRole` deny statement to the developer's IAM User policy for all AWS Lambda execution role ARNs.
- **C.** Require developers to attach a specific IAM Permissions Boundary policy to every IAM role they create using `iam:PermissionsBoundary`.
- **D.** Use an IAM Trust Policy (`AssumeRolePolicyDocument`) to restrict which AWS services the newly created Lambda execution role is allowed to invoke.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm nền tảng muốn cho phép các developer ứng dụng tự tạo các IAM role mới cho các hàm Lambda của họ một cách độc lập. Tuy nhiên, để ngăn ngừa leo thang đặc quyền (privilege escalation), bất kỳ IAM role nào do developer tạo ra không bao giờ được có quyền vượt quá một tập hợp các dịch vụ AWS được phép định sẵn (ví dụ: S3, DynamoDB, SQS) — ngay cả khi developer gắn `AdministratorAccess` vào role mới. Nhóm nền tảng nên thực thi tính năng IAM nào?

**Đáp án đúng:** **C**

**IAM Permissions Boundary**:
- Là một Managed Policy dùng để **giới hạn quyền tối đa** của IAM User hoặc IAM Role.
- Kết hợp với điều kiện `iam:PermissionsBoundary` trong policy của developer để bắt buộc mọi role do developer tạo đều phải gắn Boundary đó -> **chống leo thang đặc quyền (Privilege Escalation)**.

- **A:** Sai vì SCP thuộc AWS Organizations và chỉ gắn vào Organization Root, OU, hoặc AWS Account — không thể gắn vào từng IAM Role riêng lẻ.
- **B:** Sai vì chặn `iam:PassRole` sẽ ngăn developer gán bất kỳ role nào cho Lambda, không giải quyết bài toán tự tạo role có giới hạn quyền.
- **C (Đúng):** Đúng! **IAM Permissions Boundary** đặt mức trần quyền tối đa cho một IAM entity (User/Role). Quyền thực tế là phần **giao (intersection)** giữa Identity-based Policy và Permissions Boundary, nên dù developer gắn `AdministratorAccess`, role vẫn bị chặn ở mức trần của Boundary.
- **D:** Sai vì Trust Policy chỉ quy định **ai được phép AssumeRole**, không giới hạn các API mà role đó được gọi.

</details>

### Câu 4 `medium`

An IAM policy on an Amazon S3 bucket requires Multi-Factor Authentication (`aws:MultiFactorAuthPresent: true`) before allowing `s3:DeleteObject`. A developer uses the AWS CLI with their IAM user's long-term Access Keys and tries to delete an object, but receives `AccessDenied`. What must the developer do in the AWS CLI to satisfy the MFA condition?

- **A.** Pass `--mfa-code` and `--mfa-serial` directly as CLI flags to the `aws s3 rm` command when deleting the object.
- **B.** Disable S3 Versioning and MFA Delete on the bucket using the root account so `s3:DeleteObject` bypasses MFA.
- **C.** Call `aws sts get-session-token` with `--serial-number` and `--token-code`, then export the temporary `AccessKeyId`, `SecretAccessKey`, and `SessionToken`.
- **D.** Rotate the IAM user's long-term Access Keys in the IAM console and reconfigure the `~/.aws/credentials` profile.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một IAM policy trên một Amazon S3 bucket yêu cầu Multi-Factor Authentication (`aws:MultiFactorAuthPresent: true`) trước khi cho phép `s3:DeleteObject`. Một developer sử dụng AWS CLI với Access Key dài hạn của IAM user của mình và thử xóa một object, nhưng nhận được lỗi `AccessDenied`. Developer phải làm gì trong AWS CLI để đáp ứng điều kiện MFA?

**Đáp án đúng:** **C**

Khi IAM/Bucket Policy yêu cầu **`aws:MultiFactorAuthPresent: true`** trên API/CLI:
- Dùng **`aws sts get-session-token --serial-number <mfa-arn> --token-code <code>`** (hoặc `sts:AssumeRole` kèm MFA).
- Export 3 biến: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, và **`AWS_SESSION_TOKEN`**.

- **A:** Sai vì `aws s3 rm` không có tham số `--mfa-code`.
- **B:** Sai vì điều kiện `aws:MultiFactorAuthPresent` nằm trong Bucket Policy cho `s3:DeleteObject`, không phải MFA Delete của Versioning.
- **C (Đúng):** Đúng! Access Key dài hạn của IAM User không mang ngữ cảnh MFA (`aws:MultiFactorAuthPresent` là false). Bắt buộc phải gọi **`sts:GetSessionToken`** kèm mã MFA để lấy bộ **Temporary Credentials (có `SessionToken`)** thì điều kiện MFA mới có hiệu lực.
- **D:** Sai vì xoay vòng Access Key dài hạn vẫn không chứa thông tin xác thực MFA.

</details>

### Câu 5 `medium`

A developer is writing an IAM policy to grant an AWS Lambda function permission to read and write items ONLY in a specific DynamoDB table (`Orders`), and ONLY allow `GetItem` and `PutItem` actions. Which IAM policy structure follows the principle of least privilege?

- **A.** `Effect: Allow`, `Action: "dynamodb:*"`, `Resource: "*"` (full DynamoDB access across the account)
- **B.** `Effect: Allow`, `Action: ["dynamodb:GetItem", "dynamodb:PutItem"]`, `Resource: "arn:aws:dynamodb:us-east-1:111122223333:table/Orders"`
- **C.** `Effect: Allow`, `Action: ["dynamodb:GetItem", "dynamodb:PutItem"]`, `Resource: "*"` (wildcard table ARN)
- **D.** `Effect: Allow`, `Action: "dynamodb:DeleteTable"`, `Resource: "arn:aws:dynamodb:us-east-1:111122223333:table/Orders"` (explicit Allow)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer đang viết một IAM policy để cấp cho hàm AWS Lambda quyền đọc và ghi các item CHỈ trong một bảng DynamoDB cụ thể (`Orders`), và CHỈ cho phép các hành động `GetItem` và `PutItem`. Cấu trúc IAM policy nào tuân thủ nguyên tắc đặc quyền tối thiểu (principle of least privilege)?

**Đáp án đúng:** **B**

Nguyên tắc **IAM Least Privilege**:
- Luôn thu hẹp cả **`Action`** (chỉ các API cần thiết) và **`Resource`** (đúng ARN cụ thể, tránh `*`).

- **A:** Sai vì cấp toàn quyền `dynamodb:*` trên mọi bảng (`*`) vi phạm nghiêm trọng nguyên tắc Least Privilege (có thể xóa luôn bảng!).
- **B (Đúng):** Đúng! Tuân thủ **Least Privilege (Đặc quyền tối thiểu)** bằng cách chỉ định đúng 2 hành động (`dynamodb:GetItem`, `dynamodb:PutItem`) và đúng ARN của bảng `Orders` thay vì dùng wildcard `*`.
- **C:** Sai vì vẫn để `Resource: "*"` cho phép đọc/ghi trên mọi bảng DynamoDB khác trong tài khoản.
- **D:** Sai vì `DeleteTable` cho phép xóa bảng và thiếu `GetItem`/`PutItem`.

</details>

### Câu 6 `medium`

A company implements Attribute-Based Access Control (ABAC) in AWS IAM. Developers are tagged with `Project=Alpha` or `Project=Beta`, and EC2/Lambda resources are also tagged with `Project=Alpha` or `Project=Beta`. How should a single IAM policy allow developers to manage ONLY resources matching their own `Project` tag?

- **A.** Use `"StringEquals": {"aws:SourceIp": "${aws:PrincipalTag/Project}"}` in the IAM policy condition block.
- **B.** Use a `Condition` checking `"StringEquals": {"aws:ResourceTag/Project": "${aws:PrincipalTag/Project}"}`.
- **C.** Hardcode separate IAM Policies for `Project=Alpha`, `Project=Beta`, and every future project.
- **D.** Use `s3:x-amz-acl` condition keys to dynamically match the developer's project tag at runtime.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty triển khai Attribute-Based Access Control (ABAC) trong AWS IAM. Các developer được gắn tag `Project=Alpha` hoặc `Project=Beta`, và các tài nguyên EC2/Lambda cũng được gắn tag `Project=Alpha` hoặc `Project=Beta`. Một IAM policy duy nhất nên được viết như thế nào để cho phép developer quản lý CHỈ các tài nguyên khớp với tag `Project` của chính họ?

**Đáp án đúng:** **B**

**IAM ABAC (Attribute-Based Access Control)**:
- So sánh **`aws:ResourceTag/<key>`** với **`aws:PrincipalTag/<key>`** (hoặc `aws:RequestTag/<key>` khi tạo tài nguyên mới).
- Lợi ích: Giảm số lượng IAM policies cần bảo trì khi nhân sự/dự án tăng lên.

- **A:** Sai vì `aws:SourceIp` kiểm tra địa chỉ IP, không phải tag dự án.
- **B (Đúng):** Đúng! **ABAC (Attribute-Based Access Control)** so sánh tag của tài nguyên (`aws:ResourceTag/Project`) với tag của IAM User/Role đang gọi (`aws:PrincipalTag/Project`), giúp dùng chung 1 policy cho hàng trăm dự án mà không cần sửa policy khi thêm dự án mới.
- **C:** Sai vì đó là mô hình RBAC truyền thống, mất lợi thế tự động mở rộng của ABAC.
- **D:** Sai vì `s3:x-amz-acl` chỉ kiểm tra ACL khi upload S3.

</details>

### Câu 7 `medium`

A developer is using the AWS SDK in an application running on an Amazon EC2 instance. The developer notices that another team member configured old IAM User credentials in `~/.aws/credentials`, while the EC2 instance also has a newer IAM Instance Profile attached. According to the **AWS SDK Default Credential Provider Chain**, which credentials will the SDK use?

- **A.** The EC2 IAM Instance Profile always takes highest priority over `~/.aws/credentials` and environment variables.
- **B.** The AWS SDK merges IAM permissions from both the `~/.aws/credentials` IAM User and the EC2 Instance Profile.
- **C.** `~/.aws/credentials` is used, because the AWS SDK checks Environment Variables and `~/.aws/credentials` BEFORE EC2 IMDS.
- **D.** The AWS SDK immediately throws a `MultipleCredentialsFoundException` error whenever both credential sources exist on EC2.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer đang sử dụng AWS SDK trong một ứng dụng chạy trên một Amazon EC2 instance. Developer nhận thấy một thành viên khác trong nhóm đã cấu hình thông tin xác thực IAM User cũ trong `~/.aws/credentials`, trong khi EC2 instance cũng có gắn một IAM Instance Profile mới hơn. Theo **AWS SDK Default Credential Provider Chain**, SDK sẽ sử dụng thông tin xác thực nào?

**Đáp án đúng:** **C**

**AWS SDK Credential Provider Chain** (từ cao xuống thấp):
1. Environment Variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).
2. Shared credentials (`~/.aws/credentials`) / config (`~/.aws/config`).
3. ECS Container Credentials (`AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`).
4. **EC2 Instance Profile (IMDS)**.
-> Trên EC2/ECS, **không** chạy `aws configure` để tránh ghi đè Role.

- **A:** Sai vì Instance Metadata (IMDS) nằm ở cuối chuỗi ưu tiên; đây là nguyên nhân hay gặp khi dev chạy `aws configure` trên EC2 làm mất tác dụng của Instance Role.
- **B:** Sai vì SDK chỉ chọn **một** bộ credentials đầu tiên tìm thấy trong chuỗi ưu tiên, không bao giờ gộp quyền.
- **C (Đúng):** Đúng! Thứ tự ưu tiên của **AWS SDK Default Credential Provider Chain** là: (1) Environment Variables (`AWS_ACCESS_KEY_ID`...) -> (2) Shared credentials/config files (`~/.aws/credentials`) -> (3) ECS Container Credentials -> (4) EC2 Instance Profile (IMDS). Vì vậy file `~/.aws/credentials` sẽ ghi đè Instance Profile!
- **D:** Sai vì SDK không báo lỗi mà chọn bộ có thứ tự ưu tiên cao hơn.

</details>

### Câu 8 `medium`

A developer is troubleshooting why an IAM User (`bob`) in Account A cannot assume an IAM Role (`AuditRole`) in Account B (`222233334444`). Which TWO policies must BOTH allow the action for `sts:AssumeRole` to succeed? (Choose two.)

- **A.** An Amazon S3 Bucket Policy in Account A explicitly allowing `sts:AssumeRole` on `AuditRole` for `bob`.
- **B.** An IAM Identity Policy on `bob` (or his group) in Account A allowing `sts:AssumeRole` on `arn:aws:iam::222233334444:role/AuditRole`.
- **C.** An AWS KMS Key Policy in Account B granting `iam:PassRole` permission directly to `bob`'s IAM User ARN.
- **D.** The Trust Policy of `AuditRole` in Account B allowing Account A (or `bob`'s ARN) as a `Principal` for `sts:AssumeRole`.
- **E.** A VPC Security Group inbound rule allowing TCP port 443 traffic between `bob` in Account A and `AuditRole`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer đang khắc phục sự cố tại sao một IAM User (`bob`) trong Account A không thể assume một IAM Role (`AuditRole`) trong Account B (`222233334444`). HAI policy nào đều BẮT BUỘC phải cho phép hành động này để `sts:AssumeRole` thành công? (Chọn hai đáp án.)

**Đáp án đúng:** **B, D**

Cross-Account **`sts:AssumeRole`** luôn cần đủ 2 vế:
1. **Account A (Caller)**: Identity Policy cho phép `sts:AssumeRole` lên Role ARN của Account B.
2. **Account B (Target Role)**: **Trust Policy** của Role cho phép Account A / Principal thực hiện `sts:AssumeRole`.

- **A:** Sai vì S3 Bucket Policy không quản lý quyền `sts:AssumeRole`.
- **B (Đúng):** Đúng! Phía tài khoản gọi (Account A), `bob` phải có quyền `sts:AssumeRole` trỏ tới ARN của `AuditRole` ở Account B.
- **C:** Sai vì `AssumeRole` cross-account không dùng KMS Key Policy hay `iam:PassRole`.
- **D (Đúng):** Đúng! Phía tài khoản đích (Account B), **Trust Policy** của `AuditRole` bắt buộc phải tin cậy Account A (hoặc ARN của `bob`).
- **E:** Sai vì Security Group không kiểm soát quyền IAM/STS.

</details>

### Câu 9 `medium`

An AWS Lambda function in Account A (`111122223333`) needs to read objects from an Amazon S3 bucket in Account B (`444455556666`) and write transformed records into an Amazon DynamoDB table that is ALSO located in Account B. Since DynamoDB does not support resource-based policies for cross-account access in this architecture, what is the standard IAM pattern the developer should implement?

- **A.** Attach a resource-based policy to the Amazon S3 bucket in Account B that grants cross-account `dynamodb:PutItem` permissions to Account A's Lambda execution role.
- **B.** Create an IAM role in Account B with S3 and DynamoDB permissions, trust Account A's Lambda execution role, and call `sts:AssumeRole` from Lambda to get temporary credentials.
- **C.** Create an IAM user in Account B with DynamoDB and S3 permissions, generate long-term access keys, and commit them as environment variables in Account A's Git repository.
- **D.** Disable IAM SigV4 authentication on the DynamoDB table in Account B and allow unauthenticated writes from Account A's Lambda VPC CIDR block.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm AWS Lambda trong Account A (`111122223333`) cần đọc các object từ một Amazon S3 bucket trong Account B (`444455556666`) và ghi các bản ghi đã chuyển đổi vào một bảng Amazon DynamoDB CŨNG nằm trong Account B. Vì DynamoDB không hỗ trợ resource-based policy cho quyền truy cập cross-account trong kiến trúc này, mẫu IAM (IAM pattern) tiêu chuẩn nào mà developer nên triển khai?

**Đáp án đúng:** **B**

Mẫu chuẩn cho truy cập chéo tài khoản (**Cross-Account Access**): Tạo IAM Role ở tài khoản đích (Account B) có **Trust Policy** tin cậy Role ở tài khoản nguồn (Account A), sau đó dùng **`sts:AssumeRole`** để lấy thông tin xác thực tạm thời.

- **A:** Sai vì S3 Bucket Policy chỉ kiểm soát quyền trên S3 bucket chứ không cấp quyền cho bảng DynamoDB.
- **B (Đúng):** Đúng! Khi cần truy cập chéo tài khoản (Cross-Account) tới dịch vụ như DynamoDB, hàm Lambda ở Account A sẽ gọi `sts:AssumeRole` sang một IAM Role đặt tại Account B để lấy Temporary Credentials (`AccessKeyId`, `SecretAccessKey`, `SessionToken`).
- **C:** Sai vì vi phạm nguyên tắc bảo mật (lộ khóa truy cập tĩnh trong Git).
- **D:** Sai vì DynamoDB bắt buộc mọi lời gọi API đều phải được xác thực bằng IAM SigV4.

</details>

---

[Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chủ đề 02 →](02-ec2-vpc-networking.md)
