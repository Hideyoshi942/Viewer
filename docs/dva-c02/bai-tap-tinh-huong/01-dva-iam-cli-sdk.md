# Bài tập tình huống — Chủ đề 1: IAM, AWS CLI & SDK Fundamentals

> Quản lý danh tính IAM Users, Groups, Roles, Policies, cấu hình AWS CLI, SDK Credentials Chain và STS AssumeRole.
> **Số câu hỏi:** 9 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án & Giải thích chi tiết**.

---

### Câu 1 `medium`

A developer is creating an AWS Lambda function that needs an IAM execution role (`lambda-s3-read-role`) to access Amazon S3. When the developer runs `aws lambda create-function --role arn:aws:iam::111122223333:role/lambda-s3-read-role`, the command fails with an `AccessDeniedException` stating the user is not authorized to perform `iam:PassRole`. Which IAM permission must be added to the developer's IAM user or role?

- **A.** Grant `iam:PassRole` on the resource `arn:aws:iam::111122223333:role/lambda-s3-read-role` to the developer's IAM identity.
- **B.** Add the developer's IAM user ARN to the Trust Policy (`AssumeRolePolicyDocument`) of `lambda-s3-read-role`.
- **C.** Attach the `AmazonS3ReadOnlyAccess` AWS managed policy directly to the developer's IAM user so Lambda inherits it.
- **D.** Grant `sts:AssumeRole` on `arn:aws:iam::111122223333:role/lambda-s3-read-role` directly to the developer's IAM user identity.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Quyền **`iam:PassRole`** là câu hỏi kinh điển trong Domain Security:
- Bất cứ khi nào bạn gán một IAM Role cho dịch vụ AWS (EC2 Instance Profile, Lambda Execution Role, ECS Task Role, CodeBuild Service Role), bạn phải có quyền **`iam:PassRole`** trên role đó.
- Nên giới hạn `Resource` chỉ định đúng Role ARN cần thiết (kèm Condition `iam:PassedToService` nếu cần) để tránh leo thang đặc quyền (privilege escalation).

- **A (Đúng):** Đúng! Khi một user truyền (pass) một IAM Role cho dịch vụ AWS (như Lambda, EC2, ECS, CloudFormation, CodePipeline) sử dụng, user đó phải có quyền `iam:PassRole` đối với ARN của role được truyền.
- **B:** Sai vì Trust Policy chỉ định ai được phép `AssumeRole` (ở đây là `lambda.amazonaws.com`), không thay thế được quyền `iam:PassRole`.
- **C:** Sai vì lỗi xảy ra do thiếu quyền `iam:PassRole` khi tạo hàm Lambda, không phải do thiếu quyền đọc S3.
- **D:** Sai vì developer không tự assume role đó; dịch vụ Lambda mới là bên assume role thông qua Trust Policy (`lambda.amazonaws.com`).

</details>

### Câu 2 `medium`

A backend AWS Lambda function generates an Amazon S3 pre-signed URL for a private PDF report using its IAM execution role and returns the URL to an authenticated user. However, when the user clicks the URL 10 minutes later, S3 returns `403 AccessDenied` (`Request has expired` or `Access Denied`) even though the expiration was set to 1 hour. Which two common causes should the developer investigate?

- **A.** The Amazon S3 bucket has Block Public Access enabled, which automatically invalidates all IAM-signed pre-signed URLs for private objects.
- **B.** The Amazon S3 bucket does not have Static Website Hosting enabled on the bucket properties for serving pre-signed download links.
- **C.** Amazon S3 pre-signed URLs only support `PUT` object uploads and cannot be generated or used for `GET` object downloads.
- **D.** The Lambda execution role lacks `s3:GetObject` on that key, or Lambda's temporary STS credentials expired before the 1-hour URL TTL.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Lưu ý bẫy thi **S3 Pre-signed URL**:
1. Người dùng sử dụng URL sẽ có **đúng quyền của IAM identity đã tạo URL**.
2. Thời hạn tối đa của Pre-signed URL phụ thuộc vào loại credentials tạo ra nó: IAM User (tối đa **7 ngày** qua SigV4), **IAM Role / STS temporary credentials** (hết hạn ngay khi **STS token hết hạn** — mặc dù mặc định truyền `ExpiresIn` lớn hơn, URL vẫn chết khi STS token hết hạn).

- **A:** Sai vì S3 Block Public Access **không** chặn Pre-signed URLs (vì Pre-signed URL có chữ ký xác thực tạm thời chứ không phải truy cập công khai vô danh).
- **B:** Sai vì Pre-signed URL hoạt động trực tiếp qua S3 REST API endpoint, không cần Static Website Hosting.
- **C:** Sai vì S3 Pre-signed URLs hỗ trợ cả `GetObject` (tải xuống) và `PutObject` (tải lên).
- **D (Đúng):** Đúng! Pre-signed URL kế thừa **đúng quyền của IAM identity đã ký ra nó** (thiếu `s3:GetObject` -> `AccessDenied`), VÀ thời hạn sống thực tế của Pre-signed URL **không thể vượt quá thời hạn còn lại của STS temporary token** (ví dụ IAM Role của Lambda/EC2) đã ký URL đó.

</details>

### Câu 3 `hard`

A platform team wants to allow application developers to create new IAM roles for their Lambda functions independently. However, to prevent privilege escalation, any IAM role created by a developer must never have permissions exceeding a predefined set of allowed AWS services (e.g., S3, DynamoDB, SQS) — even if the developer attaches `AdministratorAccess` to the new role. Which IAM feature should the platform team enforce?

- **A.** Attach an AWS Organizations Service Control Policy (SCP) directly to the developer's IAM Role to cap permissions.
- **B.** Require developers to attach a specific IAM Permissions Boundary policy to every created role via an `iam:PermissionsBoundary` condition.
- **C.** Use an IAM Trust Policy (`AssumeRolePolicyDocument`) to restrict which AWS services the newly created role can call.
- **D.** Add an explicit `iam:PassRole` deny statement to the developer's IAM User policy so newly created IAM roles cannot be assumed by any service.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

**IAM Permissions Boundary**:
- Là một Managed Policy dùng để **giới hạn quyền tối đa** của IAM User hoặc IAM Role.
- Kết hợp với điều kiện `iam:PermissionsBoundary` trong policy của developer để bắt buộc mọi role do developer tạo đều phải gắn Boundary đó -> **chống leo thang đặc quyền (Privilege Escalation)**.

- **A:** Sai vì SCP thuộc AWS Organizations và chỉ gắn vào Organization Root, OU, hoặc AWS Account — không thể gắn vào từng IAM Role riêng lẻ.
- **B (Đúng):** Đúng! **IAM Permissions Boundary** đặt mức trần quyền tối đa cho một IAM entity (User/Role). Quyền thực tế là phần **giao (intersection)** giữa Identity-based Policy và Permissions Boundary, nên dù developer gắn `AdministratorAccess`, role vẫn bị chặn ở mức trần của Boundary.
- **C:** Sai vì Trust Policy chỉ quy định **ai được phép AssumeRole**, không giới hạn các API mà role đó được gọi.
- **D:** Sai vì chặn `iam:PassRole` sẽ ngăn developer gán bất kỳ role nào cho Lambda, không giải quyết bài toán tự tạo role có giới hạn quyền.

</details>

### Câu 4 `medium`

An IAM policy on an Amazon S3 bucket requires Multi-Factor Authentication (`aws:MultiFactorAuthPresent: true`) before allowing `s3:DeleteObject`. A developer uses the AWS CLI with their IAM user's long-term Access Keys and tries to delete an object, but receives `AccessDenied`. What must the developer do in the AWS CLI to satisfy the MFA condition?

- **A.** Pass the `--mfa-code` parameter directly to the `aws s3 rm` AWS CLI command when deleting objects.
- **B.** Rotate the IAM user's long-term Access Keys in the IAM console and re-run `aws configure`.
- **C.** Disable S3 Bucket Versioning on the bucket so MFA Delete is bypassed during object deletion.
- **D.** Call `aws sts get-session-token` with `--serial-number` and `--token-code`, then export the temporary `AccessKeyId`, `SecretAccessKey`, and `SessionToken`.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Khi IAM/Bucket Policy yêu cầu **`aws:MultiFactorAuthPresent: true`** trên API/CLI:
- Dùng **`aws sts get-session-token --serial-number <mfa-arn> --token-code <code>`** (hoặc `sts:AssumeRole` kèm MFA).
- Export 3 biến: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, và **`AWS_SESSION_TOKEN`**.

- **A:** Sai vì `aws s3 rm` không có tham số `--mfa-code`.
- **B:** Sai vì xoay vòng Access Key dài hạn vẫn không chứa thông tin xác thực MFA.
- **C:** Sai vì điều kiện `aws:MultiFactorAuthPresent` nằm trong Bucket Policy cho `s3:DeleteObject`, không phải MFA Delete của Versioning.
- **D (Đúng):** Đúng! Access Key dài hạn của IAM User không mang ngữ cảnh MFA (`aws:MultiFactorAuthPresent` là false). Bắt buộc phải gọi **`sts:GetSessionToken`** kèm mã MFA để lấy bộ **Temporary Credentials (có `SessionToken`)** thì điều kiện MFA mới có hiệu lực.

</details>

### Câu 5 `medium`

A developer is writing an IAM policy to grant an AWS Lambda function permission to read and write items ONLY in a specific DynamoDB table (`Orders`), and ONLY allow `GetItem` and `PutItem` actions. Which IAM policy structure follows the principle of least privilege?

- **A.** `Effect: Allow`, `Action: ["dynamodb:GetItem", "dynamodb:PutItem"]`, `Resource: "arn:aws:dynamodb:us-east-1:111122223333:table/Orders"`
- **B.** `Effect: Allow`, `Action: ["dynamodb:GetItem", "dynamodb:PutItem"]`, `Resource: "*"` for all DynamoDB tables
- **C.** `Effect: Allow`, `Action: "dynamodb:*"`, `Resource: "*"` across all tables in the AWS account
- **D.** `Effect: Allow`, `Action: "dynamodb:DeleteTable"`, `Resource: "arn:aws:dynamodb:us-east-1:111122223333:table/Orders"` with wildcard actions

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Nguyên tắc **IAM Least Privilege**:
- Luôn thu hẹp cả **`Action`** (chỉ các API cần thiết) và **`Resource`** (đúng ARN cụ thể, tránh `*`).

- **A (Đúng):** Đúng! Tuân thủ **Least Privilege (Đặc quyền tối thiểu)** bằng cách chỉ định đúng 2 hành động (`dynamodb:GetItem`, `dynamodb:PutItem`) và đúng ARN của bảng `Orders` thay vì dùng wildcard `*`.
- **B:** Sai vì vẫn để `Resource: "*"` cho phép đọc/ghi trên mọi bảng DynamoDB khác trong tài khoản.
- **C:** Sai vì cấp toàn quyền `dynamodb:*` trên mọi bảng (`*`) vi phạm nghiêm trọng nguyên tắc Least Privilege (có thể xóa luôn bảng!).
- **D:** Sai vì `DeleteTable` cho phép xóa bảng và thiếu `GetItem`/`PutItem`.

</details>

### Câu 6 `medium`

A company implements Attribute-Based Access Control (ABAC) in AWS IAM. Developers are tagged with `Project=Alpha` or `Project=Beta`, and EC2/Lambda resources are also tagged with `Project=Alpha` or `Project=Beta`. How should a single IAM policy allow developers to manage ONLY resources matching their own `Project` tag?

- **A.** Use a `Condition` checking `"StringEquals": {"aws:ResourceTag/Project": "${aws:PrincipalTag/Project}"}`.
- **B.** Use `s3:x-amz-acl` condition keys on the IAM role to match the developer's `Project` principal tag.
- **C.** Use `"StringEquals": {"aws:SourceIp": "${aws:PrincipalTag/Project}"}` in the IAM policy condition for S3 access.
- **D.** Hardcode separate IAM Policies for `Project=Alpha`, `Project=Beta`, and every future project.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

**IAM ABAC (Attribute-Based Access Control)**:
- So sánh **`aws:ResourceTag/<key>`** với **`aws:PrincipalTag/<key>`** (hoặc `aws:RequestTag/<key>` khi tạo tài nguyên mới).
- Lợi ích: Giảm số lượng IAM policies cần bảo trì khi nhân sự/dự án tăng lên.

- **A (Đúng):** Đúng! **ABAC (Attribute-Based Access Control)** so sánh tag của tài nguyên (`aws:ResourceTag/Project`) với tag của IAM User/Role đang gọi (`aws:PrincipalTag/Project`), giúp dùng chung 1 policy cho hàng trăm dự án mà không cần sửa policy khi thêm dự án mới.
- **B:** Sai vì `s3:x-amz-acl` chỉ kiểm tra ACL khi upload S3.
- **C:** Sai vì `aws:SourceIp` kiểm tra địa chỉ IP, không phải tag dự án.
- **D:** Sai vì đó là mô hình RBAC truyền thống, mất lợi thế tự động mở rộng của ABAC.

</details>

### Câu 7 `medium`

A developer is using the AWS SDK in an application running on an Amazon EC2 instance. The developer notices that another team member configured old IAM User credentials in `~/.aws/credentials`, while the EC2 instance also has a newer IAM Instance Profile attached. According to the **AWS SDK Default Credential Provider Chain**, which credentials will the SDK use?

- **A.** The AWS SDK throws a `MultipleCredentialsFoundException` error if both credential sources exist on the instance.
- **B.** The EC2 IAM Instance Profile always takes highest priority over `~/.aws/credentials` and environment variables.
- **C.** The AWS SDK automatically merges IAM permissions from both the `~/.aws/credentials` user and the EC2 Instance Profile IAM role.
- **D.** The credentials in `~/.aws/credentials`, because the SDK checks Environment Variables and `~/.aws/credentials` BEFORE IMDS.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

**AWS SDK Credential Provider Chain** (từ cao xuống thấp):
1. Environment Variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).
2. Shared credentials (`~/.aws/credentials`) / config (`~/.aws/config`).
3. ECS Container Credentials (`AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`).
4. **EC2 Instance Profile (IMDS)**.
-> Trên EC2/ECS, **không** chạy `aws configure` để tránh ghi đè Role.

- **A:** Sai vì SDK không báo lỗi mà chọn bộ có thứ tự ưu tiên cao hơn.
- **B:** Sai vì Instance Metadata (IMDS) nằm ở cuối chuỗi ưu tiên; đây là nguyên nhân hay gặp khi dev chạy `aws configure` trên EC2 làm mất tác dụng của Instance Role.
- **C:** Sai vì SDK chỉ chọn **một** bộ credentials đầu tiên tìm thấy trong chuỗi ưu tiên, không bao giờ gộp quyền.
- **D (Đúng):** Đúng! Thứ tự ưu tiên của **AWS SDK Default Credential Provider Chain** là: (1) Environment Variables (`AWS_ACCESS_KEY_ID`...) -> (2) Shared credentials/config files (`~/.aws/credentials`) -> (3) ECS Container Credentials -> (4) EC2 Instance Profile (IMDS). Vì vậy file `~/.aws/credentials` sẽ ghi đè Instance Profile!

</details>

### Câu 8 `medium` *(Chọn nhiều đáp án)*

A developer is troubleshooting why an IAM User (`bob`) in Account A cannot assume an IAM Role (`AuditRole`) in Account B (`222233334444`). Which TWO policies must BOTH allow the action for `sts:AssumeRole` to succeed? (Choose two.)

- **A.** An Amazon S3 Bucket Policy in Account A allowing `sts:AssumeRole` on `AuditRole` in Account B.
- **B.** The Trust Policy of `AuditRole` in Account B allowing Account A (or `bob`'s ARN) as a `Principal` for `sts:AssumeRole`.
- **C.** A KMS Key Policy in Account B granting `iam:PassRole` on `AuditRole` directly to `bob`.
- **D.** An IAM Identity Policy for `bob` in Account A allowing `sts:AssumeRole` on `arn:aws:iam::222233334444:role/AuditRole`.
- **E.** A VPC Security Group rule allowing outbound TCP port 443 between `bob` and `AuditRole` across the two AWS accounts in AWS IAM.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**, **D**

Cross-Account **`sts:AssumeRole`** luôn cần đủ 2 vế:
1. **Account A (Caller)**: Identity Policy cho phép `sts:AssumeRole` lên Role ARN của Account B.
2. **Account B (Target Role)**: **Trust Policy** của Role cho phép Account A / Principal thực hiện `sts:AssumeRole`.

- **A:** Sai vì S3 Bucket Policy không quản lý quyền `sts:AssumeRole`.
- **B (Đúng):** Đúng! Phía tài khoản đích (Account B), **Trust Policy** của `AuditRole` bắt buộc phải tin cậy Account A (hoặc ARN của `bob`).
- **C:** Sai vì `AssumeRole` cross-account không dùng KMS Key Policy hay `iam:PassRole`.
- **D (Đúng):** Đúng! Phía tài khoản gọi (Account A), `bob` phải có quyền `sts:AssumeRole` trỏ tới ARN của `AuditRole` ở Account B.
- **E:** Sai vì Security Group không kiểm soát quyền IAM/STS.

</details>

### Câu 9 `medium`

An AWS Lambda function in Account A (`111122223333`) needs to read objects from an Amazon S3 bucket in Account B (`444455556666`) and write transformed records into an Amazon DynamoDB table that is ALSO located in Account B. Since DynamoDB does not support resource-based policies for cross-account access in this architecture, what is the standard IAM pattern the developer should implement?

- **A.** Disable IAM authentication and authorization checks on the Amazon DynamoDB table in Account B so that any cross-account AWS Lambda function can read and write items freely.
- **B.** Attach an Amazon S3 bucket policy in Account B that grants cross-account `dynamodb:PutItem` permissions directly to Account A's Lambda execution role ARN.
- **C.** Create an IAM role in Account B granting S3 and DynamoDB access, trust Account A's Lambda execution role, and call `sts:AssumeRole` from Lambda for temporary credentials.
- **D.** Create an IAM user in Account B with S3 and DynamoDB permissions, generate long-term access keys, and commit those keys into Account A's application Git repository.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Mẫu chuẩn cho truy cập chéo tài khoản (**Cross-Account Access**): Tạo IAM Role ở tài khoản đích (Account B) có **Trust Policy** tin cậy Role ở tài khoản nguồn (Account A), sau đó dùng **`sts:AssumeRole`** để lấy thông tin xác thực tạm thời.

- **A:** Sai vì DynamoDB bắt buộc mọi lời gọi API đều phải được xác thực bằng IAM SigV4.
- **B:** Sai vì S3 Bucket Policy chỉ kiểm soát quyền trên S3 bucket chứ không cấp quyền cho bảng DynamoDB.
- **C (Đúng):** Đúng! Khi cần truy cập chéo tài khoản (Cross-Account) tới dịch vụ như DynamoDB, hàm Lambda ở Account A sẽ gọi `sts:AssumeRole` sang một IAM Role đặt tại Account B để lấy Temporary Credentials (`AccessKeyId`, `SecretAccessKey`, `SessionToken`).
- **D:** Sai vì vi phạm nguyên tắc bảo mật (lộ khóa truy cập tĩnh trong Git).

</details>

---

[Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Bộ tiếp theo →](02-dva-ec2-vpc-networking.md)
