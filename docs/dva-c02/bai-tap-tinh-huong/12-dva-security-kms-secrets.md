# Bài tập tình huống — Chủ đề 12: Mã hóa & Bảo mật dữ liệu — KMS, Secrets Manager, SSM & S3 Security

> KMS Envelope Encryption (GenerateDataKey), KMS Key Policies, SSM Parameter Store vs Secrets Manager, S3 Encryption (SSE-S3/KMS/C).
> **Số câu hỏi:** 35 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án & Giải thích chi tiết**.

---

### Câu 1 `hard`

Account A owns an Amazon S3 bucket encrypted with a customer-managed AWS KMS key (`CMK-A`) also in Account A. An IAM role in Account B (`Role-B`) already has an S3 bucket policy granting `s3:GetObject` on Account A's bucket, and `Role-B` has an IAM policy allowing `s3:GetObject` and `kms:Decrypt` on `CMK-A`. However, when `Role-B` tries to download an encrypted object from the bucket, it receives `AccessDenied`. What is missing?

- **A.** The S3 bucket must use SSE-S3 instead of SSE-KMS because customer-managed KMS keys cannot be shared across AWS accounts.
- **B.** The KMS Key Policy of `CMK-A` in Account A must explicitly grant `kms:Decrypt` permission to Account B (or `Role-B`).
- **C.** `Role-B` must also be granted `kms:GenerateDataKey` in its IAM policy to decrypt and read existing KMS-encrypted objects.
- **D.** Enable S3 Object Ownership to `BucketOwnerEnforced` on Account A's bucket to automatically transfer KMS key permissions.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Quy tắc vàng **Cross-Account KMS CMK**:
1. **Customer-Managed Key (CMK)**: Chia sẻ được cross-account (khác với AWS Managed Key `aws/s3` không thể chia sẻ).
2. **Bắt buộc cả 2 bên**: Key Policy ở Account sở hữu KMS Key **VÀ** IAM Policy ở Account gọi API đều phải cho phép (nếu Key Policy không mở cho Account B thì IAM Policy của Account B không có hiệu lực).

- **A:** Sai vì Customer-Managed KMS Keys (CMK) hoàn toàn có thể chia sẻ cross-account (chỉ AWS Managed Key `aws/s3` mới không chia sẻ cross-account được).
- **B (Đúng):** Đúng! Khác với IAM thông thường, truy cập KMS CMK cross-account bắt buộc phải có sự cho phép từ CẢ HAI phía: (1) KMS Key Policy ở Account A cho phép Account B/Role-B, VÀ (2) IAM Policy ở Account B cho phép `kms:Decrypt` trên `CMK-A`.
- **C:** Sai vì `kms:GenerateDataKey` chỉ cần khi mã hóa (upload/PutObject); để đọc (decrypt) chỉ cần `kms:Decrypt`.
- **D:** Sai vì BucketOwnerEnforced chỉ tắt ACLs, không liên quan đến quyền giải mã KMS cross-account.

</details>

### Câu 2 `medium`

A microservices application stores 25 configuration parameters in AWS Systems Manager Parameter Store using hierarchical paths such as `/prod/orders/db-host`, `/prod/orders/db-port`, and `/prod/orders/api-key` (encrypted as `SecureString`). During startup, the orders service needs to retrieve all parameters under `/prod/orders/` in a single API call with decrypted values. Which API call should the developer use?

- **A.** Call `GetSecretValue` from AWS Secrets Manager using the parameter path prefix `/prod/orders/`.
- **B.** Call `GetParametersByPath` with `Path='/prod/orders/'`, `Recursive=True`, and `WithDecryption=True`.
- **C.** Call `DescribeParameters` with `WithDecryption=True` and filter the returned list by `/prod/orders/`.
- **D.** Call `GetParameter` with `Name='/prod/orders/*'` and `WithDecryption=True` to fetch all matching keys.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

**SSM Parameter Store APIs**:
- `GetParameter`: Lấy 1 tham số.
- `GetParameters`: Lấy danh sách tên tham số cụ thể.
- **`GetParametersByPath`**: Lấy tất cả tham số theo tiền tố đường dẫn (`/env/app/...`), hỗ trợ phân trang và `WithDecryption=True` cho `SecureString`.

- **A:** Sai vì tham số đang lưu ở SSM Parameter Store, không phải Secrets Manager.
- **B (Đúng):** Đúng! `ssm:GetParametersByPath` cho phép lấy toàn bộ tham số theo cấu trúc thư mục (`/prod/orders/...`) và truyền `WithDecryption=True` để tự động giải mã các tham số `SecureString` bằng KMS.
- **C:** Sai vì `DescribeParameters` chỉ trả về metadata của tham số (tên, kiểu, ngày sửa), không trả về giá trị (`Value`).
- **D:** Sai vì `GetParameter` chỉ lấy được duy nhất 1 tham số theo tên chính xác, không hỗ trợ wildcard `*`.

</details>

### Câu 3 `hard`

A compliance team mandates that all objects uploaded to an Amazon S3 bucket (`corp-audit-logs`) must be encrypted at rest using AWS KMS (`aws:kms`) and must only be transmitted over HTTPS (TLS). Which S3 bucket policy statements enforce BOTH requirements?

- **A.** Add an `Allow` statement for `s3:PutObject` with `aws:SecureTransport: true` and rely on default bucket encryption without `Deny` rules.
- **B.** Configure an S3 CORS policy allowing only `https://` origins and requiring `x-amz-server-side-encryption` in `AllowedHeaders`.
- **C.** Add two `Deny` statements: one denying `s3:*` when `aws:SecureTransport` is `false`, and another denying `s3:PutObject` when `s3:x-amz-server-side-encryption` is not `aws:kms`.
- **D.** Enable S3 Block Public Access on the bucket to enforce HTTPS transport and AWS KMS encryption on all uploaded objects.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Mẫu **S3 Bucket Policy** ép bảo mật (rất hay gặp trong DVA-C02):
- Ép **HTTPS (in-transit)**: `Effect: Deny`, `Condition: { "Bool": { "aws:SecureTransport": "false" } }`.
- Ép **SSE-KMS (at-rest)**: `Effect: Deny` trên `s3:PutObject` nếu header `s3:x-amz-server-side-encryption` khác `aws:kms` hoặc bị thiếu.

- **A:** Sai vì một statement `Allow` không chặn được các IAM user có quyền `s3:*` từ IAM Policy; để ép buộc tuyệt đối ở tầng bucket phải dùng **Explicit `Deny`**.
- **B:** Sai vì CORS chỉ kiểm soát trình duyệt cross-origin, không chặn được các request HTTP từ CLI/SDK.
- **C (Đúng):** Đúng! Dùng Explicit `Deny` với điều kiện `Bool: {"aws:SecureTransport": "false"}` để chặn mọi kết nối HTTP không mã hóa, và `StringNotEquals: {"s3:x-amz-server-side-encryption": "aws:kms"}` (hoặc `Null: {"s3:x-amz-server-side-encryption": "true"}`) trên `s3:PutObject` để ép dùng SSE-KMS.
- **D:** Sai vì Block Public Access chỉ chặn truy cập công khai, không ép buộc HTTPS hay SSE-KMS đối với các IAM user nội bộ.

</details>

### Câu 4 `medium`

A single-page React application hosted on `https://app.example.com` makes a `POST` request with a custom `Authorization` header to an Amazon API Gateway REST API at `https://api.example.com/orders`. The browser blocks the request with a CORS error, even though the Lambda function already returns `Access-Control-Allow-Origin: *`. What is the most likely cause?

- **A.** API Gateway REST APIs do not support CORS preflight checks when using `POST` methods with a Lambda proxy integration.
- **B.** Amazon Route 53 must be configured with a `CNAME` record instead of an `ALIAS` record pointing to the API Gateway custom domain.
- **C.** The API Gateway lacks a `MOCK` integration for `OPTIONS` returning CORS headers (`Access-Control-Allow-Headers`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Origin`).
- **D.** The Lambda function must return `HTTP 301` instead of `HTTP 200` for CORS preflight requests so the browser follows the redirect.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Xử lý lỗi **CORS trên Amazon API Gateway**:
- Với **Lambda Proxy Integration** (`GET`, `POST`...): Bản thân code Lambda phải trả về `Access-Control-Allow-Origin` trong `headers` của response.
- Với **Preflight `OPTIONS`**: Phải bật CORS (tạo method `OPTIONS` dùng **MOCK integration**) trả về `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, và `Access-Control-Allow-Headers`.
- Nếu API Gateway trả lỗi `4xx/5xx` (ví dụ `401/403` từ Authorizer) trước khi tới Lambda, cần thêm CORS headers vào **Gateway Responses**.

- **A:** Sai vì API Gateway hỗ trợ CORS đầy đủ cho mọi HTTP method (`GET`, `POST`, `PUT`, `DELETE`, v.v.).
- **B:** Sai vì loại DNS record không ảnh hưởng đến chính sách CORS của trình duyệt.
- **C (Đúng):** Đúng! Khi trình duyệt gửi request `POST` kèm header tùy chỉnh (`Authorization`), trình duyệt sẽ gửi trước một **preflight `OPTIONS` request**. Vì API Gateway chưa cấu hình method `OPTIONS` (thường dùng `MOCK` integration để không tốn tiền gọi Lambda) trả về đủ CORS headers, trình duyệt sẽ chặn request.
- **D:** Sai vì preflight `OPTIONS` phải trả về `HTTP 200` (hoặc `204`), không phải `301`.

</details>

### Câu 5 `medium`

A developer deploys a containerized microservice on Amazon ECS with AWS Fargate. The container image is stored in a private Amazon ECR repository, database credentials are stored in AWS Secrets Manager, and the application code inside the container needs to write objects to an Amazon S3 bucket (`app-uploads`). Which IAM roles should receive which permissions in the ECS Task Definition?

- **A.** Grant `s3:PutObject` to the Task Execution Role (`executionRoleArn`) and `ecr:GetAuthorizationToken` to the Task Role (`taskRoleArn`).
- **B.** Hardcode IAM Access Keys as plaintext `ENV` environment variables directly inside the application `Dockerfile`.
- **C.** Grant `ecr:*` pull and `secretsmanager:GetSecretValue` to the Task Execution Role, and `s3:PutObject` to the Task Role.
- **D.** Attach both Amazon ECR image pull and Amazon S3 object write permissions to an EC2 Instance Profile for the Fargate task.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Phân biệt 2 IAM Role trong **Amazon ECS Task Definition**:
- **`executionRoleArn` (Task Execution Role)**: Quyền cho **hệ thống ECS/Fargate** (kéo image ECR, ghi log CloudWatch, đọc Secrets Manager/SSM để inject biến môi trường).
- **`taskRoleArn` (Task Role)**: Quyền cho **code ứng dụng bên trong container** gọi các dịch vụ AWS (S3, DynamoDB, SQS...).

- **A:** Sai vì ngược vai trò: code ứng dụng trong container không dùng `executionRoleArn` để gọi S3, và ECS Agent không dùng `taskRoleArn` để kéo image từ ECR.
- **B:** Sai vì hardcode IAM Access Keys là vi phạm bảo mật nghiêm trọng.
- **C (Đúng):** Đúng! **Task Execution Role** (`executionRoleArn`) cấp quyền cho **ECS Agent/Fargate** kéo image từ ECR, đẩy log lên CloudWatch, và nạp Secrets Manager/SSM lúc khởi tạo container. **Task Role** (`taskRoleArn`) cấp quyền cho **chính code ứng dụng** bên trong container gọi S3/DynamoDB.
- **D:** Sai vì đang chạy trên **AWS Fargate** (serverless containers), không có EC2 instance hay EC2 Instance Profile.

</details>

### Câu 6 `medium`

An application needs to encrypt a 500 MB backup file locally before uploading it to Amazon S3. Because AWS KMS `Encrypt` API has a 4 KB payload limit, the developer implements Envelope Encryption. What is the correct sequence of steps for Envelope Encryption with AWS KMS?

- **A.** Store the plaintext Data Key in the S3 object's `x-amz-meta-key` user-defined metadata alongside the encrypted file.
- **B.** Split the 500 MB file into 4 KB chunks and call the `kms:Encrypt` API 125,000 times in a loop directly against AWS KMS.
- **C.** Call `kms:GenerateDataKeyWithoutPlaintext` and encrypt the 500 MB file locally using the encrypted Data Key ciphertext directly.
- **D.** Call `kms:GenerateDataKey` to get a plaintext and encrypted Data Key, encrypt the 500 MB file locally, clear the plaintext key, and store the encrypted key.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

**AWS KMS Envelope Encryption**:
- Giới hạn của `kms:Encrypt`: tối đa **4 KB**.
- Giải pháp cho file > 4 KB: Gọi **`kms:GenerateDataKey`** -> mã hóa file tại local bằng **Plaintext Data Key** -> xóa Plaintext Data Key khỏi RAM -> lưu **CiphertextBlob (Encrypted Data Key)** cùng file.
- Khi giải mã: Gọi **`kms:Decrypt`** lên Encrypted Data Key để lấy lại Plaintext Data Key rồi giải mã file tại local.

- **A:** Sai vì lưu Plaintext Data Key cùng file sẽ làm lộ khóa giải mã, vô hiệu hóa hoàn toàn việc mã hóa.
- **B:** Sai vì gọi KMS `Encrypt` 125,000 lần cho 1 file cực kỳ chậm, tốn kém và dễ bị KMS API throttling.
- **C:** Sai vì Encrypted Data Key chưa giải mã không thể dùng trực tiếp để mã hóa file; cần dùng `GenerateDataKey` để lấy Plaintext Data Key.
- **D (Đúng):** Đúng! Đây là quy trình chuẩn của **Envelope Encryption**: Dùng `GenerateDataKey` lấy cặp (Plaintext Data Key + Encrypted Data Key), mã hóa file lớn ở local bằng Plaintext Data Key, xóa ngay Plaintext Data Key khỏi RAM và lưu Encrypted Data Key kèm theo dữ liệu mã hóa.

</details>

### Câu 7 `medium`

A security audit requires automatic annual key rotation for a Customer-Managed AWS KMS symmetric key used to encrypt Amazon DynamoDB data. What happens to existing encrypted data after KMS automatically rotates the key?

- **A.** Existing data needs no re-encryption; KMS retains previous key material and automatically selects the right version during `Decrypt`.
- **B.** The KMS Key ARN changes automatically every year upon rotation, so the application must update its environment configuration and IAM policies.
- **C.** Automatic key rotation retains the previous backing key material for 30 days and then permanently deletes it.
- **D.** All existing DynamoDB items become unreadable until a batch job re-encrypts them with the new key version.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

**AWS KMS Key Rotation**:
- **Customer-Managed Key (Symmetric)**: Hỗ trợ Automatic Key Rotation; giữ nguyên **Key ID / ARN**; giữ lại **key material cũ** để giải mã dữ liệu cũ.
- **Imported Key Material & Asymmetric Keys**: Không hỗ trợ Automatic Key Rotation (phải xoay vòng thủ công bằng cách tạo CMK mới và trỏ lại **KMS Alias**).

- **A (Đúng):** Đúng! Khi bật Automatic Key Rotation (mỗi 365 ngày hoặc tùy chỉnh 90–2560 ngày), KMS tạo key material mới cho các lần mã hóa mới nhưng **vẫn giữ lại toàn bộ key material cũ** để tự động giải mã dữ liệu cũ mà không làm gián đoạn ứng dụng.
- **B:** Sai vì Key ID và Key ARN giữ nguyên không đổi khi xoay vòng tự động.
- **C:** Sai vì KMS không bao giờ tự xóa key material cũ của một key đang hoạt động.
- **D:** Sai vì KMS tự động lưu giữ các phiên bản key material cũ để giải mã.

</details>

### Câu 8 `medium`

A company stores its Amazon RDS MySQL master password in AWS Secrets Manager with automatic rotation enabled every 30 days. However, when rotation runs, the rotation fails with a timeout error. The RDS database is inside a private VPC subnet with no internet access. What is the most likely cause?

- **A.** Secrets Manager requires the Amazon RDS database instance to have `PubliclyAccessible` enabled for rotation.
- **B.** Automatic database credential rotation only works when secrets are stored in AWS Systems Manager Parameter Store Standard parameters.
- **C.** The Secrets Manager rotation Lambda is not in the same VPC (or lacks Security Group / VPC Endpoint access to RDS and Secrets Manager).
- **D.** AWS Secrets Manager does not support automatic credential rotation for Amazon RDS MySQL database instances.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Cơ chế xoay vòng **AWS Secrets Manager**:
- Sử dụng một **Lambda Rotation Function** gồm 4 bước: `createSecret` -> `setSecret` -> `testSecret` -> `finishSecret`.
- Nếu RDS nằm trong **Private VPC**: Rotation Lambda cần nằm trong VPC, Security Group mở tới DB port, và có **Interface VPC Endpoint** cho `secretsmanager` (hoặc NAT Gateway).

- **A:** Sai vì hoàn toàn có thể xoay vòng trong private VPC bằng cách đặt rotation Lambda vào VPC + dùng VPC Endpoint cho Secrets Manager.
- **B:** Sai vì SSM Parameter Store không có tính năng tự động xoay vòng mật khẩu; đây là tính năng đặc trưng của Secrets Manager.
- **C (Đúng):** Đúng! Rotation được thực hiện bởi một **Lambda function**. Để xoay vòng mật khẩu RDS trong private VPC, hàm Lambda rotation đó phải chạy trong VPC có Security Group kết nối được tới cổng 3306 của RDS **VÀ** có đường gọi tới Secrets Manager API (qua Interface VPC Endpoint hoặc NAT Gateway).
- **D:** Sai vì Secrets Manager hỗ trợ xoay vòng tự động (native rotation) cho RDS MySQL, PostgreSQL, Aurora, SQL Server, Oracle, Redshift, DocumentDB.

</details>

### Câu 9 `easy`

A company stores sensitive medical images in Amazon S3. Compliance requires that the company manage its own encryption keys locally on-premises (AWS must never store the encryption keys), while still letting S3 perform the actual encryption and decryption of objects on the server side. Which S3 encryption option meets this requirement?

- **A.** Server-Side Encryption with AWS KMS Keys (SSE-KMS)
- **B.** Server-Side Encryption with Amazon S3 Managed Keys (SSE-S3)
- **C.** Client-Side Encryption using the AWS Encryption SDK
- **D.** Server-Side Encryption with Customer-Provided Keys (SSE-C)

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

4 kiểu mã hóa **Amazon S3**:
- **SSE-S3**: AWS quản lý toàn bộ key (AES-256).
- **SSE-KMS**: AWS KMS quản lý key (có audit log CloudTrail, kiểm soát quyền qua Key Policy).
- **SSE-C**: Khách hàng tự giữ key bên ngoài, truyền key qua HTTPS ở mỗi request, **S3 mã hóa/giải mã ở server-side**.
- **Client-Side Encryption**: Khách hàng mã hóa trước ở client rồi mới upload.

- **A:** Sai vì với SSE-KMS, khóa CMK được lưu trữ và quản lý bên trong dịch vụ AWS KMS.
- **B:** Sai vì với SSE-S3, AWS toàn quyền quản lý và lưu trữ khóa mã hóa.
- **C:** Sai vì Client-Side Encryption thực hiện mã hóa ở phía client trước khi gửi lên S3, không phải S3 thực hiện mã hóa ở server side.
- **D (Đúng):** Đúng! Với **SSE-C**, khách hàng tự quản lý khóa ở on-premises và gửi khóa kèm mỗi request `PUT`/`GET` qua HTTPS; AWS S3 thực hiện mã hóa/giải mã trên server rồi lập tức xóa khóa khỏi bộ nhớ (không lưu trữ khóa).

</details>

### Câu 10 `medium` *(Chọn nhiều đáp án)*

A developer stores a third-party payment API key inside an AWS Lambda function's environment variables. To satisfy security compliance, the key must be encrypted with a Customer-Managed AWS KMS Key (CMK) both at rest and in transit to the Lambda runtime, AND only authorized developers with explicit permission should be able to view or decrypt the plaintext value. Which TWO actions meet these requirements? (Choose two.)

- **A.** Print the decrypted third-party API key to Amazon CloudWatch Logs on startup so developers can verify the value.
- **B.** Rely on the default `aws/lambda` AWS Managed KMS Key for at-rest encryption without client-side or helper encryption.
- **C.** Restrict `kms:Decrypt` on the Customer-Managed KMS Key Policy so only the Lambda execution role and security admins can decrypt it.
- **D.** Disable TLS encryption on the AWS Lambda invocation endpoint to reduce overhead when reading environment variables.
- **E.** Enable Lambda Encryption Helpers with a Customer-Managed KMS Key (`cmk`), and decrypt the variable in code via `kms:Decrypt`.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**, **E**

Bảo mật **Lambda Environment Variables**:
- Mặc định dùng `aws/lambda` (tự giải mã khi xem cấu hình).
- Để bảo mật cao hơn: dùng **Customer-Managed KMS Key** + **Encryption Helpers** (hoặc chuyển sang lưu ở **Secrets Manager / SSM Parameter Store SecureString**).

- **A:** Sai vì in bí mật ra CloudWatch Logs làm rò rỉ thông tin nhạy cảm.
- **B:** Sai vì mặc định `aws/lambda` tự động giải mã và hiển thị plaintext cho bất kỳ user nào có quyền xem cấu hình hàm Lambda trên Console/CLI.
- **C (Đúng):** Đúng! Kiểm soát `kms:Decrypt` trên KMS Key Policy đảm bảo chỉ Execution Role của Lambda (và admin được phép) mới giải mã được bí mật.
- **D:** Sai và không khả thi trên AWS Lambda API.
- **E (Đúng):** Đúng! Mặc định Lambda mã hóa at-rest bằng AWS Managed Key (`aws/lambda`), nhưng khi deploy hoặc xem console, bất kỳ ai có quyền `lambda:GetFunctionConfiguration` đều thấy được plaintext. Dùng **Customer-Managed KMS Key + Encryption Helpers** (mã hóa trước giá trị biến môi trường) bắt buộc code phải gọi `kms:Decrypt` lúc chạy và siết quyền ai được giải mã.

</details>

### Câu 11 `medium` *(Chọn nhiều đáp án)*

A company serves a React single-page application from a private Amazon S3 bucket through Amazon CloudFront. Users must ONLY be able to access the files via CloudFront (direct S3 URLs must be denied), and the S3 bucket uses SSE-KMS encryption. Which TWO configurations are required? (Choose two.)

- **A.** Use the legacy CloudFront Origin Access Identity (OAI) because OAC does not support SSE-KMS encrypted S3 buckets.
- **B.** Configure CloudFront Origin Access Control (OAC) and update the S3 bucket policy to allow `s3:GetObject` only from `cloudfront.amazonaws.com` with `AWS:SourceArn`.
- **C.** Update the SSE-KMS Key Policy to allow `kms:Decrypt` (and `kms:GenerateDataKey*`) for `cloudfront.amazonaws.com` matching `AWS:SourceArn`.
- **D.** Enable S3 Static Website Hosting on the private bucket and configure the website endpoint URL as the CloudFront origin.
- **E.** Disable S3 Block Public Access on the bucket and attach a bucket policy granting `s3:GetObject` to `Principal: "*"`.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**, **C**

**CloudFront + Private S3 + SSE-KMS**:
- Bắt buộc dùng **Origin Access Control (OAC)** (thay cho OAI cũ).
- Cần mở quyền ở **2 nơi**: (1) **S3 Bucket Policy** cho `cloudfront.amazonaws.com` kèm `AWS:SourceArn`, và (2) **KMS Key Policy** cấp `kms:Decrypt` cho `cloudfront.amazonaws.com`.

- **A:** Sai ngược hoàn toàn: **OAI cũ không hỗ trợ SSE-KMS**, chỉ có **OAC mới** hỗ trợ SSE-KMS.
- **B (Đúng):** Đúng! **Origin Access Control (OAC)** là cơ chế mới thay thế OAI để khóa S3 bucket chỉ cho phép đúng CloudFront distribution (`AWS:SourceArn`) truy cập, đồng thời **OAC hỗ trợ SSE-KMS** (điều mà OAI cũ không làm được).
- **C (Đúng):** Đúng! Vì S3 bucket mã hóa bằng **SSE-KMS**, CloudFront OAC cần được cấp quyền `kms:Decrypt` trong **KMS Key Policy** để giải mã object khi lấy từ S3.
- **D:** Sai vì nếu dùng S3 Static Website Hosting endpoint thì bucket phải mở public và không dùng được OAC/OAI.
- **E:** Sai vì mở `Principal: *` sẽ cho phép truy cập thẳng S3 không qua CloudFront.

</details>

### Câu 12 `medium`

An AWS Lambda function running inside a private VPC subnet (with no NAT Gateway) needs to retrieve database credentials from AWS Secrets Manager. When the function calls `secretsmanager:GetSecretValue`, it times out after 30 seconds. What is the MOST secure and cost-effective way to allow the Lambda function to reach Secrets Manager without adding a NAT Gateway?

- **A.** Create an Interface VPC Endpoint for `com.amazonaws.<region>.secretsmanager` and allow HTTPS (443) from the Lambda Security Group.
- **B.** Move the database credentials into Lambda Environment Variables in plaintext so no Secrets Manager API call is required.
- **C.** Attach an Elastic IP address directly to the Lambda function's Elastic Network Interface (ENI) for outbound internet routing to Secrets Manager.
- **D.** Create a Gateway VPC Endpoint for AWS Secrets Manager in the private subnet route table and attach an endpoint policy.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Khi Lambda trong **Private VPC** (không có NAT Gateway) cần gọi **Secrets Manager / KMS / SQS / SNS / STS**:
- Phải tạo **Interface VPC Endpoint (AWS PrivateLink)** cho dịch vụ tương ứng.
- Nhớ bật **Private DNS** trên Interface Endpoint và mở **Security Group port 443 (HTTPS)** cho ENI của Endpoint.

- **A (Đúng):** Đúng! Secrets Manager không hỗ trợ Gateway Endpoint (chỉ S3 và DynamoDB có Gateway Endpoint). Tạo **Interface VPC Endpoint (PrivateLink)** cho `secretsmanager` giúp Lambda gọi API qua mạng riêng AWS mà không cần NAT Gateway hay Internet.
- **B:** Sai vì lưu mật khẩu DB dạng plaintext trong biến môi trường làm mất tính năng bảo mật và xoay vòng tự động của Secrets Manager.
- **C:** Sai vì bạn không thể gắn Elastic IP trực tiếp lên ENI do Lambda quản lý.
- **D:** Sai vì Gateway VPC Endpoint chỉ tồn tại cho Amazon S3 và Amazon DynamoDB.

</details>

### Câu 13 `medium`

A web application at `https://app.example.com` fetches static JSON assets from an Amazon S3 bucket via Amazon CloudFront (`https://cdn.example.com`). The S3 bucket already has a CORS policy allowing `https://app.example.com`, yet browsers intermittently receive cached responses without `Access-Control-Allow-Origin` headers after another origin (`https://admin.example.com`) requested the same file first. How should CloudFront be configured?

- **A.** Enable S3 Transfer Acceleration on the origin bucket so CloudFront forwards all browser preflight `OPTIONS` headers automatically to S3.
- **B.** Configure the CloudFront Cache Policy (or Origin Request Policy) to forward the `Origin` header to S3 and include it in the cache key.
- **C.** Disable HTTPS between CloudFront and the S3 origin by setting the Origin Protocol Policy to `HTTP Only`.
- **D.** Set the CloudFront Default TTL and Max TTL to 365 days on the S3 origin cache behavior to retain CORS headers.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Xử lý **CORS với CloudFront + S3**:
- CloudFront mặc định có thể loại bỏ header `Origin` khỏi request gửi về S3.
- Phải cấu hình CloudFront forward **`Origin`** (và `Access-Control-Request-Headers`, `Access-Control-Request-Method`) trong Origin Request Policy / Cache Policy (dùng managed policy **`CORS-S3Origin`**).

- **A:** Sai vì Transfer Acceleration không xử lý CORS header caching.
- **B (Đúng):** Đúng! Nếu CloudFront không đưa header **`Origin`** vào Cache Key và không forward `Origin` về S3, CloudFront sẽ cache response đầu tiên (không có CORS header phù hợp hoặc sai origin) và trả lại cho các domain khác. Đưa `Origin` (hoặc dùng `SimpleCORS` / `CORS-with-preflight` policy) giải quyết triệt để lỗi này.
- **C:** Sai vì tắt HTTPS không liên quan đến header `Origin` của CORS.
- **D:** Sai vì tăng TTL chỉ làm response cache sai tồn tại lâu hơn.

</details>

### Câu 14 `easy`

A security engineer wants to automatically audit all Amazon S3 buckets, AWS KMS keys, IAM roles, and AWS Lambda function policies in an account to identify any resources shared publicly or with external AWS accounts outside the organization. Which AWS feature provides this continuous automated analysis?

- **A.** AWS Systems Manager Parameter Store
- **B.** AWS X-Ray Service Map
- **C.** AWS IAM Access Analyzer
- **D.** AWS CloudTrail Insights

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

**AWS IAM Access Analyzer**:
- Phát hiện tài nguyên bị chia sẻ **public** hoặc **cross-account** ngoài Zone of Trust (Account hoặc AWS Organization).
- Hỗ trợ sinh **Least-Privilege IAM Policy** dựa trên lịch sử hoạt động CloudTrail.

- **A:** Sai vì Parameter Store chỉ lưu biến cấu hình.
- **B:** Sai vì X-Ray dùng để trace hiệu năng request ứng dụng, không quét bảo mật policy.
- **C (Đúng):** Đúng! **IAM Access Analyzer** sử dụng lý luận toán học (automated reasoning) để phân tích resource-based policies (S3, KMS, IAM roles, Lambda, SQS, Secrets Manager...) và cảnh báo mọi quyền truy cập từ bên ngoài tài khoản/Organization.
- **D:** Sai vì CloudTrail Insights phát hiện bất thường về tần suất gọi API quản trị (ví dụ đột biến số lần gọi `RunInstances`), không phân tích cấu hình policy chia sẻ tài nguyên.

</details>

### Câu 15 `hard`

An AWS account has an Amazon S3 bucket (`finance-reports`) with a **Bucket Policy** allowing `s3:GetObject` to `arn:aws:iam::111122223333:user/alice`. Alice's IAM User has NO IAM Identity Policy attached at all, and there is no Explicit Deny anywhere. Can Alice download objects from `finance-reports`?

- **A.** No, because an IAM User must always have an `Allow` in both an Identity-based Policy and a Resource-based Policy.
- **B.** No, because S3 Bucket Policies only apply to anonymous public users and never to IAM users.
- **C.** Yes, because for same-account access, a Resource-based Policy (S3 Bucket Policy) granting explicit `Allow` to Alice's principal is sufficient even without an Identity-based Policy.
- **D.** Yes, only if Alice also has the `AdministratorAccess` managed policy attached to her IAM user.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Bẫy thi **IAM Evaluation: Same-Account vs Cross-Account**:
- **Same-Account** (trừ KMS): Chỉ cần `Allow` ở **Identity Policy HOẶC Resource Policy** (không có `Deny`).
- **Cross-Account**: Bắt buộc phải có `Allow` ở **CẢ Identity Policy (tài khoản gọi) VÀ Resource Policy (tài khoản chứa tài nguyên)**.

- **A:** Sai! Quy tắc bắt buộc có `Allow` ở cả 2 bên chỉ áp dụng cho **Cross-Account** (khác tài khoản) hoặc đối với **KMS Key Policy**.
- **B:** Sai vì S3 Bucket Policy có thể chỉ định bất kỳ IAM User/Role/Account ARN nào làm `Principal`.
- **C (Đúng):** Đúng! Trong **cùng một AWS Account (Same-Account)**, quyền hiệu lực là phần **HỢP (Union)** giữa Identity-based Policy và Resource-based Policy: chỉ cần **1 trong 2** có `Allow` (và không có `Deny` ở bất kỳ đâu) là được phép! *(Lưu ý: Khác với **Cross-Account** bắt buộc phải có `Allow` ở CẢ HAI bên).*
- **D:** Sai vì Alice không cần `AdministratorAccess`.

</details>

### Câu 16 `medium`

A developer accidentally schedules an AWS KMS Customer-Managed Key (CMK) for deletion with a 7-day waiting period, and then realizes that thousands of critical encrypted files in Amazon S3 rely on this key. What can the developer do on Day 3 before the waiting period ends?

- **A.** Call `kms:Decrypt` directly; the KMS key continues to work normally for decryption during the 7-day waiting period.
- **B.** Create a new KMS key with the same Alias name; it will automatically decrypt the old S3 files.
- **C.** Nothing; once a KMS key is scheduled for deletion, it enters an irreversible state and can never be recovered.
- **D.** Run `CancelKeyDeletion` on the KMS key and then re-enable the key (`EnableKey`), because KMS keys in `PendingDeletion` state are disabled until cancelled and re-enabled.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

**Xóa KMS Key (`ScheduleKeyDeletion`)**:
- Thời gian chờ bắt buộc: **7 – 30 ngày**.
- Trong thời gian chờ: Key bị **Disabled** (`PendingDeletion`).
- Khôi phục trước khi hết hạn: **`CancelKeyDeletion`** -> **`EnableKey`**.

- **A:** Sai vì khi ở trạng thái `PendingDeletion`, mọi lệnh `Encrypt`/`Decrypt` dùng key đó đều bị từ chối cho đến khi hủy xóa và bật lại key.
- **B:** Sai vì mỗi KMS key có key material ngẫu nhiên khác nhau, tạo key mới cùng Alias không giải mã được dữ liệu cũ.
- **C:** Sai vì mục đích của thời gian chờ 7–30 ngày chính là để kịp thời phát hiện và hủy lệnh xóa bằng `CancelKeyDeletion`.
- **D (Đúng):** Đúng! KMS bắt buộc có thời gian chờ từ **7 đến 30 ngày** trước khi xóa vĩnh viễn. Trong thời gian này key ở trạng thái `PendingDeletion` (không dùng để mã hóa/giải mã được), và có thể cứu lại bằng **`CancelKeyDeletion`** sau đó gọi **`EnableKey`**.

</details>

### Câu 17 `medium`

An AWS Lambda function fetches a database connection string from AWS Secrets Manager on every invocation. Under high load (3,000 invocations/sec), the function encounters `ThrottlingException` from Secrets Manager and adds 50 ms of network latency per request. How can the developer eliminate Secrets Manager throttling and reduce latency without hardcoding secrets?

- **A.** Increase the Lambda function's `Timeout` to 900 seconds so Secrets Manager retries never time out.
- **B.** Move the secret into `buildspec.yml` plaintext `env.variables` and inject it at deploy time.
- **C.** Use the AWS Parameters and Secrets Lambda Extension (or cache the secret in memory outside the handler with a TTL) so the execution environment caches secrets locally.
- **D.** Turn off TLS encryption on Secrets Manager API calls to reduce the network handshake latency.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Tối ưu đọc **Secrets Manager / SSM Parameter Store** trong **AWS Lambda**:
- Dùng **AWS Parameters and Secrets Lambda Extension** (Layer chính thức của AWS, cache qua `localhost:2773`) hoặc cache trong memory ngoài handler kèm TTL để xử lý rotation.

- **A:** Sai vì tăng timeout không giảm số lần gọi API Secrets Manager.
- **B:** Sai vì hardcode mật khẩu dạng plaintext vi phạm bảo mật.
- **C (Đúng):** Đúng! **AWS Parameters and Secrets Lambda Extension** chạy như một local HTTP cache (`http://localhost:2773`) ngay trong môi trường Lambda (hoặc dùng SDK caching client lưu trong biến toàn cục với TTL), giảm tối đa số lần gọi API Secrets Manager và loại bỏ throttling.
- **D:** Sai và không khả thi trên AWS APIs.

</details>

### Câu 18 `medium`

A developer is comparing AWS Systems Manager Parameter Store and AWS Secrets Manager for storing application secrets. Which capability is **exclusive** to AWS Secrets Manager (not natively provided by SSM Parameter Store)?

- **A.** Built-in automatic secret rotation with native integration for Amazon RDS, Aurora, and Redshift, plus cross-region secret replication.
- **B.** Organizing parameters using hierarchical paths like `/prod/db/host`.
- **C.** Encrypting sensitive configuration values at rest using an AWS KMS customer-managed key.
- **D.** Controlling read access to configuration values with fine-grained IAM resource policies.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

So sánh **SSM Parameter Store vs Secrets Manager**:
- **SSM Parameter Store**: Miễn phí (Standard, tối đa 10,000 params, 4 KB), Advanced ($0.05/param, 8 KB, có Parameter Policies TTL), **không** có native DB auto-rotation.
- **Secrets Manager**: $0.40/secret/tháng, kích thước tới **64 KB**, có **Automatic Rotation**, **Cross-Region Replication**, và sinh mật khẩu ngẫu nhiên.

- **A (Đúng):** Đúng! **Automatic Secret Rotation** (tích hợp sẵn với RDS, Aurora, Redshift, DocumentDB) và **Multi-Region Replication** là tính năng đặc trưng của **AWS Secrets Manager** (SSM Parameter Store không có auto-rotation tích hợp sẵn).
- **B:** Sai vì tổ chức theo đường dẫn phân cấp (`/prod/db/host`) là thế mạnh của **SSM Parameter Store**.
- **C:** Sai vì cả SSM Parameter Store (`SecureString`) và Secrets Manager đều hỗ trợ mã hóa bằng AWS KMS.
- **D:** Sai vì cả hai dịch vụ đều kiểm soát quyền bằng IAM.

</details>

### Câu 19 `medium`

A company encrypts objects in an Amazon S3 bucket using SSE-KMS with a Customer-Managed Key (CMK). The security team notices that high-volume S3 workloads (millions of `PUT` and `GET` requests per hour) are causing high KMS API request charges and occasional KMS throttling. Which S3 feature reduces KMS API calls by up to 99% without changing client code?

- **A.** Enable S3 Transfer Acceleration.
- **B.** Enable Amazon S3 Bucket Keys on the S3 bucket.
- **C.** Disable KMS encryption and switch to unencrypted HTTP uploads.
- **D.** Enable S3 Intelligent-Tiering.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

**Amazon S3 Bucket Keys (for SSE-KMS)**:
- Giảm tới **99% chi phí và số lần gọi KMS API**.
- Lưu ý nhỏ: CloudTrail sẽ ghi nhận KMS ARN của Bucket thay vì từng Object ARN riêng lẻ.

- **A:** Sai vì Transfer Acceleration không làm giảm số lần gọi AWS KMS.
- **B (Đúng):** Đúng! **S3 Bucket Keys** tạo một khóa cấp bucket ngắn hạn từ KMS CMK để S3 tự sinh khóa cho từng object, giúp **giảm tới 99% số lượng lời gọi API tới AWS KMS** (tiết kiệm chi phí và tránh KMS throttling).
- **C:** Sai vì làm mất mã hóa dữ liệu.
- **D:** Sai vì Intelligent-Tiering chỉ tối ưu chi phí lưu trữ theo tầng truy cập.

</details>

### Câu 20 `hard`

An application runs on Amazon ECS Fargate and needs to access an Amazon S3 bucket encrypted with a Customer-Managed KMS Key (`CMK-1`). The ECS Task Role already has `s3:GetObject` and `s3:PutObject` permissions, and the S3 Bucket Policy allows the Task Role. However, `GetObject` fails with `AccessDenied` mentioning KMS. What additional permission does the ECS Task Role (or KMS Key Policy) need?

- **A.** Grant `kms:Decrypt` only to the ECS Task Execution Role (`executionRoleArn`) instead of the ECS Task Role (`taskRoleArn`).
- **B.** Grant `kms:ScheduleKeyDeletion` to the ECS Task Role so the container can manage key lifecycle.
- **C.** Enable S3 Object Lock on the bucket so the ECS task can read SSE-KMS objects without KMS permissions.
- **D.** Grant `kms:Decrypt` (and `kms:GenerateDataKey` for `PutObject`) on `CMK-1` to the ECS Task Role (`taskRoleArn`).

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Quyền **SSE-KMS trên S3**:
- Upload (`PutObject`): Cần `s3:PutObject` + **`kms:GenerateDataKey`** (và `kms:Encrypt` nếu có).
- Download (`GetObject`): Cần `s3:GetObject` + **`kms:Decrypt`**.

- **A:** Sai vì code ứng dụng bên trong container sử dụng **`taskRoleArn`**, không dùng `executionRoleArn`.
- **B:** Sai vì `ScheduleKeyDeletion` là quyền xóa key quản trị, không dùng để đọc/ghi dữ liệu.
- **C:** Sai vì Object Lock không cấp quyền giải mã KMS.
- **D (Đúng):** Đúng! Khi đọc/ghi object S3 mã hóa bằng **SSE-KMS**, caller (**ECS Task Role**) bắt buộc phải có quyền **`kms:Decrypt`** (để đọc) và **`kms:GenerateDataKey`** (để ghi) trên KMS Key tương ứng.

</details>

### Câu 21 `medium`

A company stores sensitive files in Amazon S3 and wants to ensure that users can ONLY download files if they have passed through the corporate network proxy (IP `198.51.100.10/32`) OR through a specific VPC Endpoint (`vpce-12345678`). Which S3 Bucket Policy condition key blocks all requests that do NOT originate from that IP or VPC Endpoint?

- **A.** Use `aws:SourceIp` alone for both the corporate proxy and the private Interface VPC Endpoint traffic.
- **B.** Add an Explicit `Deny` for `s3:*` when BOTH `NotIpAddress: {"aws:SourceIp": "198.51.100.10/32"}` AND `StringNotEquals: {"aws:SourceVpce": "vpce-12345678"}`.
- **C.** Configure an Amazon S3 CORS rule restricting `AllowedOrigins` to `198.51.100.10/32` and `vpce-12345678`.
- **D.** Add an `Allow` statement with `aws:SourceIp: 198.51.100.10/32` without any explicit `Deny` statement.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Bẫy thi **S3 Bucket Policy với VPC Endpoint**:
- Traffic qua VPC Endpoint dùng private IP -> **KHÔNG** dùng `aws:SourceIp`, mà dùng **`aws:SourceVpce`** (hoặc `aws:SourceVpc`).
- Muốn chặn tuyệt đối dù user có IAM `s3:*`: Phải dùng **Explicit `Deny`**.

- **A:** Sai vì traffic đi qua **VPC Endpoint** sử dụng Private IP và **không** khớp với `aws:SourceIp` public; phải dùng **`aws:SourceVpce`** hoặc **`aws:SourceVpc`**.
- **B (Đúng):** Đúng! Kết hợp 2 điều kiện trong cùng một khối `Condition` của Explicit `Deny` (logic **AND**): chỉ chặn khi request **không** đến từ IP công ty **VÀ** **không** đi qua `vpce-12345678`. *(Lưu ý: `aws:SourceIp` không dùng được cho traffic đi qua VPC Endpoint nội bộ, nên phải kết hợp với `aws:SourceVpce`).*
- **C:** Sai vì CORS chỉ nhận tên miền HTTP origin (không nhận CIDR IP) và không chặn được AWS CLI/SDK.
- **D:** Sai vì `Allow` trong Bucket Policy không chặn được các IAM User đã có quyền `s3:*` từ IAM Identity Policy truy cập từ IP khác; phải dùng **Explicit `Deny`**.

</details>

### Câu 22 `medium`

An AWS Lambda function needs to connect to an Amazon RDS for MySQL database without storing any static database password in Secrets Manager, SSM Parameter Store, or environment variables. How can the Lambda function authenticate to the RDS MySQL database using its IAM Execution Role?

- **A.** Enable S3 Object Lock on the RDS MySQL instance to authenticate Lambda connections using IAM roles.
- **B.** Call `sts:GetSessionToken` in Lambda and pass the returned temporary `SessionToken` as the MySQL password when connecting to Amazon RDS MySQL.
- **C.** Enable IAM Database Authentication on RDS MySQL, grant `rds-db:connect`, and call `rds.generate_db_auth_token()` for a 15-minute token.
- **D.** Pass the Lambda Execution Role ARN directly as the MySQL password in the database connection string.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

**RDS IAM Database Authentication**:
- Hỗ trợ MySQL, PostgreSQL, MariaDB, Aurora.
- Token có hiệu lực **15 phút**, kết nối qua **SSL/TLS**.
- Quyền IAM cần thiết: **`rds-db:connect`** trên `arn:aws:rds-db:<region>:<account>:dbuser:<dbi-resource-id>/<db-user>`.

- **A:** Sai vì S3 Object Lock không áp dụng cho RDS.
- **B:** Sai vì MySQL không hiểu trực tiếp STS `SessionToken`; phải dùng `rds.generate_db_auth_token()`.
- **C (Đúng):** Đúng! **RDS IAM Database Authentication** cho phép sinh token xác thực tạm thời (hết hạn sau **15 phút**) bằng SDK (`generate_db_auth_token`) dựa trên IAM Execution Role của Lambda — không cần mật khẩu tĩnh.
- **D:** Sai vì Role ARN là chuỗi công khai và không phải token xác thực.

</details>

### Câu 23 `medium`

A developer uses AWS KMS to digitally sign and verify software release packages (ensuring authenticity and integrity) using public-key cryptography, so external customers can verify the signature with a public key without having AWS credentials. Which type of AWS KMS key should be created?

- **A.** An AWS Managed KMS Key (`aws/s3`) with `kms:Sign` permissions enabled for the service.
- **B.** An Asymmetric KMS key with `KeyUsage` set to `SIGN_VERIFY` (e.g., `RSA_2048` or `ECC_NIST_P256`).
- **C.** An AWS Systems Manager Parameter Store `StringList` parameter storing RSA keys.
- **D.** A Symmetric KMS key (`SYMMETRIC_DEFAULT`) with `GenerateDataKey` for digital signing and verification.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

2 loại **AWS KMS Keys**:
- **Symmetric (`SYMMETRIC_DEFAULT`)**: AES-256, dùng cho mã hóa/giải mã nhanh trong AWS (`Encrypt`/`Decrypt`/`GenerateDataKey`), hỗ trợ **Automatic Key Rotation**.
- **Asymmetric (`RSA` / `ECC`)**: Dùng cho `ENCRYPT_DECRYPT` hoặc **`SIGN_VERIFY`** (ký số, chia sẻ Public Key ra ngoài), **không** hỗ trợ Automatic Key Rotation.

- **A:** Sai vì AWS Managed Key `aws/s3` là khóa đối xứng chỉ dùng nội bộ cho dịch vụ S3.
- **B (Đúng):** Đúng! **Asymmetric KMS Key** (`SIGN_VERIFY`) tạo cặp khóa bất đối xứng (Private Key nằm an toàn trong KMS để gọi `kms:Sign`, còn Public Key tải về chia sẻ cho bên ngoài tự kiểm tra chữ ký `Verify` offline mà không cần tài khoản AWS).
- **C:** Sai vì Parameter Store không thực hiện ký số bất đối xứng.
- **D:** Sai vì Symmetric key dùng chung 1 khóa bí mật (không có public key để khách hàng bên ngoài tự xác minh chữ ký).

</details>

### Câu 24 `medium` *(Chọn nhiều đáp án)*

A company stores PII (Personally Identifiable Information) in an Amazon DynamoDB table (`Customers`). To satisfy strict compliance requirements, the team must ensure that: (1) all data at rest is encrypted using a Customer-Managed KMS Key (CMK) owned by the company, and (2) sensitive fields like `ssn` are encrypted on the client side *before* leaving the application so that even AWS administrators or DynamoDB console viewers with read access cannot see the plaintext `ssn`. Which TWO actions meet these requirements? (Choose two.)

- **A.** Use DynamoDB Streams to encrypt items after they have already been written in plaintext.
- **B.** Configure DynamoDB Encryption at Rest to use a Customer-Managed KMS Key (CMK) instead of the default AWS-owned key.
- **C.** Enable `ConsistentRead=True` on all `GetItem` calls to automatically encrypt sensitive attributes in transit and at rest in DynamoDB.
- **D.** Use the AWS Database Encryption SDK in the app to encrypt and sign `ssn` on the client side before calling `PutItem`.
- **E.** Store `ssn` as the DynamoDB table's Partition Key in plaintext so DynamoDB hashes it automatically.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**, **D**

Hai lớp bảo mật **DynamoDB Encryption**:
1. **Server-Side Encryption at Rest**: AWS-owned (mặc định), AWS-managed (`aws/dynamodb`), hoặc **Customer-Managed CMK**.
2. **Client-Side Attribute Encryption**: Dùng **AWS Database Encryption SDK** để mã hóa từng trường nhạy cảm trước khi gọi `PutItem`.

- **A:** Sai vì dữ liệu đã ghi plaintext vào bảng trước đó rồi, không đáp ứng yêu cầu mã hóa trước khi rời ứng dụng.
- **B (Đúng):** Đúng! Mặc định DynamoDB mã hóa bằng AWS-owned key; chuyển sang **Customer-Managed KMS Key** giúp công ty tự kiểm soát chính sách khóa và theo dõi audit log trên CloudTrail.
- **C:** Sai vì `ConsistentRead` chỉ quyết định độ mới của dữ liệu đọc, không phải mã hóa.
- **D (Đúng):** Đúng! **Client-Side Encryption (AWS Database Encryption SDK)** mã hóa trực tiếp trường `ssn` trên ứng dụng trước khi gửi tới DynamoDB, nên ngay cả người có quyền xem DynamoDB trên Console cũng chỉ thấy ciphertext.
- **E:** Sai vì Partition Key lưu plaintext sẽ làm lộ `ssn` cho bất kỳ ai xem được bảng hoặc log.

</details>

### Câu 25 `medium`

A web application needs to restrict Amazon S3 object downloads so that ONLY requests coming through a specific **Amazon CloudFront** distribution are allowed, AND only if the user belongs to an active corporate session. Why does AWS recommend **Origin Access Control (OAC)** over the older Origin Access Identity (OAI)?

- **A.** OAC is required in order to attach an AWS Certificate Manager certificate created in `ap-southeast-1` to a CloudFront distribution.
- **B.** OAC bypasses CloudFront edge caching so every viewer request is routed directly to the S3 bucket.
- **C.** OAC automatically makes the origin S3 bucket publicly readable so no S3 Bucket Policy is required.
- **D.** OAC supports all S3 Regions, SSE-KMS encryption, and dynamic methods (`PUT`/`POST`/`DELETE`) with SigV4 signing.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

**CloudFront OAC vs OAI**:
- Luôn chọn **OAC** cho thiết kế mới: hỗ trợ **SSE-KMS**, **SigV4**, mọi S3 Region, và HTTP `PUT`/`POST`/`DELETE`.

- **A:** Sai vì ACM cho CloudFront vẫn bắt buộc ở `us-east-1`.
- **B:** Sai vì OAC chỉ bảo mật kết nối giữa CloudFront và S3 Origin, không tắt caching.
- **C:** Sai vì OAC giữ S3 bucket ở trạng thái **private** hoàn toàn và bắt buộc dùng Bucket Policy cho `cloudfront.amazonaws.com`.
- **D (Đúng):** Đúng! **OAC (Origin Access Control)** là chuẩn mới thay thế OAI vì hỗ trợ đầy đủ **SSE-KMS**, hỗ trợ **SigV4**, hỗ trợ mọi **S3 Region** (kể cả opt-in regions), và hỗ trợ các method ghi (`PUT`, `POST`, `DELETE`) qua CloudFront.

</details>

### Câu 26 `medium`

An AWS Lambda function needs to send sensitive application events to an Amazon SQS queue. Security policy requires that all messages stored in the SQS queue be encrypted at rest using a Customer-Managed KMS Key (`CMK-SQS`), AND that the producer Lambda and consumer Lambda be the only entities allowed to use that key. Which SQS feature and KMS permissions should be configured?

- **A.** Enable Amazon S3 Bucket Keys on the SQS queue to reduce KMS encryption API calls across messages.
- **B.** Use `SQS-managed encryption (SSE-SQS)` with a custom KMS Key Policy restricting producer and consumer Lambda IAM execution roles on the queue.
- **C.** Enable SQS SSE-KMS with `CMK-SQS`, granting the producer `kms:GenerateDataKey` + `kms:Decrypt` and the consumer `kms:Decrypt`.
- **D.** Set `VisibilityTimeout` to 0 seconds on the SQS queue to automatically encrypt in-flight messages.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

**Amazon SQS Encryption**:
- **SSE-SQS**: Mặc định, miễn phí, AWS quản lý key.
- **SSE-KMS**: Dùng CMK của bạn (kiểm soát được ai được `SendMessage`/`ReceiveMessage` thông qua KMS Key Policy; tối ưu chi phí bằng `KmsDataKeyReusePeriodSeconds`).

- **A:** Sai vì Bucket Keys là tính năng của Amazon S3 (SQS có `KmsDataKeyReusePeriodSeconds` để giảm số lần gọi KMS).
- **B:** Sai vì `SSE-SQS` dùng khóa do AWS SQS quản lý, không cho phép viết custom Key Policy để giới hạn riêng producer/consumer.
- **C (Đúng):** Đúng! Bật **SSE-KMS** trên SQS queue sẽ tự động mã hóa nội dung message bằng `CMK-SQS`. Producer cần `kms:GenerateDataKey` (và `kms:Decrypt`), còn Consumer cần `kms:Decrypt` trên KMS key đó.
- **D:** Sai vì `VisibilityTimeout` không liên quan đến mã hóa.

</details>

### Câu 27 `medium`

An application retrieves a configuration parameter from AWS Systems Manager Parameter Store using `ssm:GetParameter`. The parameter is larger than 4 KB (around 6 KB) and the team wants it to automatically expire after 30 days with an EventBridge notification 7 days before expiration. Which Parameter Store tier must be used?

- **A.** AWS Secrets Manager Standard tier
- **B.** AWS AppConfig Free tier
- **C.** Advanced parameter tier
- **D.** Standard parameter tier

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

So sánh **SSM Parameter Store Standard vs Advanced Tier**:
- **Standard**: Miễn phí, tối đa **10,000** params, kích thước tối đa **4 KB**, không có Parameter Policies.
- **Advanced**: Có phí ($0.05/param/tháng), tối đa **100,000** params, kích thước tối đa **8 KB**, có **Parameter Policies** (Expiration / NoChangeNotification).

- **A:** Sai vì câu hỏi đang hỏi về tier của SSM Parameter Store.
- **B:** Sai vì AppConfig không phải Parameter Store tier.
- **C (Đúng):** Đúng! **SSM Parameter Store Advanced Tier** hỗ trợ giá trị tới **8 KB** (Standard chỉ 4 KB), cho phép lưu tới 100,000 tham số, và hỗ trợ **Parameter Policies** (tự động hết hạn TTL và phát cảnh báo EventBridge trước khi hết hạn).
- **D:** Sai vì Standard Tier giới hạn tối đa **4 KB** và không hỗ trợ Parameter Policies (expiration/notifications).

</details>

### Câu 28 `medium` *(Chọn nhiều đáp án)*

A developer is writing an IAM policy to secure an Amazon S3 bucket (`corp-data`) and an AWS KMS key. To ensure no accidental data exposure occurs, which TWO statements accurately describe AWS IAM policy evaluation rules? (Choose two.)

- **A.** By default, all requests start as Implicit Deny; an action is only allowed if there is an explicit `Allow` and no `Deny`.
- **B.** IAM Permissions Boundaries grant permissions by themselves without an Identity-based Policy.
- **C.** An Explicit Deny in any applicable policy (Identity, Resource, SCP, or Permissions Boundary) always overrides any `Allow`.
- **D.** An `Allow` in an IAM Identity Policy overrides an Explicit `Deny` in an S3 Bucket Policy.
- **E.** The AWS Organizations Management Account is restricted by Service Control Policies (SCPs) attached to the AWS Organization Root.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**, **C**

Các nguyên tắc vàng **IAM Policy Evaluation**:
1. Bắt đầu bằng **Implicit Deny**.
2. **Explicit Deny** ở bất kỳ đâu -> **DENY** ngay lập tức.
3. **SCP** không ảnh hưởng đến **Management Account**.
4. **Permissions Boundary** chỉ giới hạn tối đa, không tự cấp quyền.

- **A (Đúng):** Đúng! Mặc định mọi yêu cầu đều bị **Implicit Deny** (từ chối ngầm) trừ khi có một lệnh `Allow` hợp lệ và không có `Deny`.
- **B:** Sai vì Permissions Boundary chỉ đặt **giới hạn trần**, tự nó không cấp quyền (`Allow`); vẫn cần Identity Policy cấp quyền.
- **C (Đúng):** Đúng! Quy tắc số 1 của AWS IAM: **Explicit Deny luôn thắng tuyệt đối** mọi `Allow` ở bất kỳ tầng policy nào.
- **D:** Sai hoàn toàn vì không có `Allow` nào vượt qua được Explicit `Deny`.
- **E:** Sai vì SCP **chỉ áp dụng cho Member Accounts**, không bao giờ giới hạn **Management Account**.

</details>

### Câu 29 `medium`

A developer deploys a containerized microservice on Amazon ECS using the AWS Fargate launch type. The container fails to start with an `AccessDeniedException` when pulling the Docker image from Amazon ECR and fetching a database password from AWS Secrets Manager. However, the application code inside the container already has a Task IAM Role with DynamoDB permissions. Which configuration should the developer update to fix the startup failure?

- **A.** Switch the ECS task definition network mode from `awsvpc` to `bridge` on Fargate.
- **B.** Attach ECR pull and Secrets Manager read permissions to the ECS Task Execution Role.
- **C.** Enable IMDSv2 on the Fargate task definition so containers inherit Secrets Manager access.
- **D.** Attach `AmazonEC2ContainerRegistryReadOnly` to the ECS Task IAM Role (`taskRoleArn`) instead.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Phân biệt rõ 2 IAM Role của **Amazon ECS**:
- **Task Execution Role**: Dùng bởi **ECS Agent** (pull ECR image, đẩy log sang CloudWatch Logs, lấy secrets từ Secrets Manager/SSM vào biến môi trường).
- **Task IAM Role**: Dùng bởi **code ứng dụng bên trong container** khi gọi AWS SDK.

- **A:** Sai vì Fargate bắt buộc dùng `awsvpc` và lỗi ở đây là quyền IAM (`AccessDeniedException`), không phải network mode.
- **B (Đúng):** Đúng! Trong ECS/Fargate, **Task Execution Role** cấp quyền cho **ECS Agent** thực hiện pull image từ ECR, ghi log lên CloudWatch Logs và inject secrets từ Secrets Manager/SSM lúc khởi tạo container.
- **C:** Sai vì IMDSv2 áp dụng cho EC2 instance metadata, không liên quan đến quyền pull ECR image của ECS Agent.
- **D:** Sai vì **Task IAM Role** chỉ cấp quyền cho code ứng dụng chạy bên trong container, không phải cho ECS Agent lúc pull image và inject secrets.

</details>

### Câu 30 `easy`

A web application hosted on `https://app.example.com` tries to fetch JSON assets directly from `https://assets-bucket.s3.amazonaws.com` in the browser, but the browser blocks the request with a `No 'Access-Control-Allow-Origin' header` error. How should the developer fix this?

- **A.** Enable S3 Versioning on the bucket so browsers can fetch fonts across different origins.
- **B.** Enable S3 Server Access Logging on the bucket to inject `Access-Control-Allow-Origin` headers.
- **C.** Add an S3 Bucket Policy with `Condition: StringEquals aws:Referer` allowing `https://app.example.com`.
- **D.** Configure a CORS (Cross-Origin Resource Sharing) rule on the S3 bucket allowing origin `https://app.example.com` and the `GET` method.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Lỗi trình duyệt `Access-Control-Allow-Origin` khi gọi S3 từ domain khác -> cấu hình **S3 CORS**.

- **A:** Sai, không liên quan đến CORS.
- **B:** Sai, logging không sửa được lỗi CORS.
- **C:** Sai vì Bucket Policy không sinh ra CORS response headers cho trình duyệt.
- **D (Đúng):** Đúng! Trình duyệt chặn request khác origin cho tới khi S3 bucket cấu hình **CORS** trả về header `Access-Control-Allow-Origin` hợp lệ.

</details>

### Câu 31 `medium`

A company stores its production Amazon RDS PostgreSQL database credentials in AWS Secrets Manager. Security compliance requires that the database password be rotated automatically every 30 days with zero downtime for the application. How should the developer configure this automatic rotation?

- **A.** Enable AWS KMS automatic annual key rotation on the customer managed key (CMK) used to encrypt the secret so the RDS PostgreSQL password rotates every 30 days.
- **B.** Hardcode 12 pre-generated database passwords inside the application source code and configure a cron job to switch to a different password at the start of each month.
- **C.** Migrate the database credentials to an unencrypted Amazon S3 bucket and configure an S3 Lifecycle expiration rule to delete and recreate the object every 30 days.
- **D.** Enable automatic rotation in AWS Secrets Manager for Amazon RDS, using the alternating users (two-user) strategy to avoid interrupting active connections.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Khi câu hỏi nhắc tới **Automatic password rotation cho RDS/Aurora/Redshift/DocumentDB** -> Đáp án luôn là **AWS Secrets Manager** (hỗ trợ cả chiến lược *Single user* và *Alternating users*).

- **A:** Sai vì KMS Key Rotation chỉ xoay vòng khóa mã hóa KMS mỗi năm 1 lần, không thay đổi giá trị mật khẩu cơ sở dữ liệu.
- **B:** Sai vì nhúng mật khẩu cứng trong code là lỗ hổng bảo mật nghiêm trọng.
- **C:** Sai vì S3 Lifecycle chỉ xóa tệp chứ không thể đổi mật khẩu bên trong cơ sở dữ liệu RDS.
- **D (Đúng):** Đúng! AWS Secrets Manager tích hợp gốc với Amazon RDS để xoay vòng mật khẩu tự động qua hàm Lambda управляемый, và chiến lược **Alternating Users (2 user luân phiên)** đảm bảo không làm đứt kết nối của các phiên đang chạy.

</details>

### Câu 32 `medium`

An IAM user belongs to two IAM groups (`Developers` and ` Contractors`). The `Developers` group has an identity-based policy that grants `Allow` for `s3:GetObject` and `s3:DeleteObject` on `arn:aws:s3:::company-reports/*`. However, the `Contractors` group has a policy that specifies an explicit `Deny` for `s3:DeleteObject` on `*`. Additionally, the `company-reports` S3 bucket has a bucket policy that allows `s3:*` for all principals in the AWS account. When this IAM user attempts to delete `q4-financials.pdf` from `company-reports`, what is the result?

- **A.** The request is allowed because the S3 bucket policy takes precedence over IAM group policies.
- **B.** The request is denied because an explicit `Deny` in any applicable policy always overrides any `Allow`.
- **C.** The request is allowed because the user has two `Allow` statements versus only one `Deny` statement.
- **D.** AWS prompts the user to choose which IAM group to activate for the request.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Thứ tự ưu tiên **IAM Policy Evaluation Logic**:
1. Mặc định bắt đầu bằng **Implicit Deny**.
2. Nếu có bất kỳ **Explicit Deny** nào -> **DENY NGAY LẬP TỨC** (bất kể có bao nhiêu Allow).
3. Nếu không có Explicit Deny và có ít nhất một **Explicit Allow** (thỏa mãn cả SCP & Permissions Boundary nếu có) -> **ALLOW**.

- **A:** Sai vì S3 Bucket Policy `Allow` vẫn bị chặn đứng bởi `Explicit Deny` trong Identity-based Policy của nhóm `Contractors`.
- **B (Đúng):** Đúng! Theo quy tắc đánh giá chính sách của AWS IAM (Policy Evaluation Logic), một lệnh **`Explicit Deny`** ở bất kỳ đâu (SCP, Permissions Boundary, Identity-based policy, Resource-based policy) luôn ghi đè mọi lệnh `Allow`.
- **C:** Sai vì IAM không tính theo đa số phiếu; chỉ cần 1 `Explicit Deny` là bị từ chối ngay lập tức.
- **D:** Sai vì mọi chính sách gắn với IAM User và tất cả các IAM Groups của user đó luôn được gộp chung lại khi đánh giá.

</details>

### Câu 33 `medium`

An AWS Lambda function running inside a private VPC subnet attempts to call an external REST API on the internet and read parameters from AWS Systems Manager Parameter Store. Every invocation fails after 30 seconds with a `Task timed out after 30.00 seconds` error, even though the IAM execution role has full permissions. What is the MOST likely root cause?

- **A.** The private subnet lacks a route to a NAT Gateway (or Interface VPC Endpoint for Systems Manager) in its route table, causing outbound connections to hang until timeout.
- **B.** The Lambda function memory allocation is configured to 512 MB instead of 128 MB, which throttles the ENI network bandwidth inside the private VPC subnet.
- **C.** AWS Lambda functions attached to any Amazon VPC subnet are strictly prohibited from making outbound HTTPS connections to external internet endpoints or AWS APIs.
- **D.** The Lambda function's IAM execution role is missing an explicit `Deny` statement for `ec2:CreateNetworkInterface` to allow outbound traffic through the VPC internet gateway.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Mẹo chẩn đoán lỗi Lambda cực nhanh trong đề thi:
- Báo lỗi **`AccessDeniedException` ngay lập tức** -> Lỗi thiếu quyền trong **IAM Execution Role**.
- Bị treo đúng bằng thời gian cấu hình rồi báo **`Task timed out`** (đặc biệt khi Lambda nằm trong VPC) -> Lỗi mạng (**Thiếu NAT Gateway**, **Thiếu VPC Endpoint**, hoặc **Security Group / NACL chặn**).

- **A (Đúng):** Đúng! Khi gắn Lambda vào VPC (Private Subnet), nếu Route Table không có đường đi ra **NAT Gateway** (để ra Internet) hoặc **VPC Endpoint** (để gọi dịch vụ AWS), mọi kết nối mạng sẽ bị treo cho tới khi hết thời gian chạy (`Task timed out`).
- **B:** Sai vì bộ nhớ cao hơn chỉ làm hàm chạy nhanh hơn chứ không gây kẹt mạng.
- **C:** Sai vì mặc định Lambda (khi không gắn vào VPC) luôn có quyền ra Internet bình thường.
- **D:** Sai vì nếu lỗi do thiếu quyền IAM thì hàm sẽ báo lỗi `AccessDeniedException` ngay lập tức (trong vài mili-giây) chứ không bị treo tới hết 30 giây Timeout.

</details>

### Câu 34 `hard`

A company deploys a REST API on Amazon API Gateway integrated with an AWS Lambda function using Lambda proxy integration. A single-page web application hosted at `https://app.example.com` sends a `POST` request with an `Authorization` header to `https://api.example.com`, but the browser blocks the response due to a Cross-Origin Resource Sharing (CORS) error. What must the developer do to fix this issue?

- **A.** Change the Amazon API Gateway REST API endpoint type from Regional to Private and attach a VPC endpoint resource policy allowing browser requests.
- **B.** Configure the `OPTIONS` method in API Gateway for preflight requests AND return `Access-Control-Allow-Origin` from the Lambda function response.
- **C.** Enable Amazon API Gateway stage caching on the production stage and set the cache Time-to-Live (TTL) value to 0 seconds for all methods.
- **D.** Enable CORS in the Amazon API Gateway console using the Enable CORS wizard; no changes are needed in the Lambda proxy integration code.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Điểm bẫy kinh điển trong đề DVA: Với **Lambda Proxy Integration (`AWS_PROXY`)**, bạn PHẢI trả về header `Access-Control-Allow-Origin` ngay bên trong code hàm Lambda (ngoài việc bật OPTIONS cho preflight request trên API Gateway).

- **A:** Sai vì Private Endpoint chỉ cho phép gọi từ bên trong VPC thông qua Interface VPC Endpoint, không giải quyết lỗi CORS trên trình duyệt người dùng.
- **B (Đúng):** Đúng! Khi sử dụng Lambda Proxy Integration, chính code bên trong hàm Lambda phải trả về `headers: { 'Access-Control-Allow-Origin': 'https://app.example.com', ... }` trong JSON response của phương thức POST.
- **C:** Sai vì caching không liên quan đến cơ chế kiểm tra CORS header của trình duyệt.
- **D:** Sai vì với Lambda Proxy Integration (`AWS_PROXY`), API Gateway không tự động gắn response headers vào phương thức POST mà chuyển nguyên vẹn kết quả trả về từ hàm Lambda.

</details>

### Câu 35 `hard`

An application needs to perform client-side encryption on a 50 MB database export file before uploading it to cloud storage, using an AWS KMS symmetric customer managed key (CMK). When the developer calls the `kms:Encrypt` API directly with the 50 MB payload, the request fails with a size limit error. How should the developer implement this encryption?

- **A.** Switch the AWS KMS key specification from Symmetric (`SYMMETRIC_DEFAULT`) to Asymmetric `RSA_4096` and call `kms:Encrypt` directly with the 50 MB database export payload.
- **B.** Open an AWS Support quota increase case to raise the `kms:Encrypt` direct payload size limit from 4 KB to 100 MB so the 50 MB export file can be encrypted in a single API request.
- **C.** Store a static 256-bit AES encryption key as a plaintext `String` parameter in AWS Systems Manager Parameter Store and fetch it from the application before encrypting the file.
- **D.** Use envelope encryption: call `kms:GenerateDataKey`, encrypt the 50 MB file locally with the plaintext key, clear it from memory, and store the encrypted data key alongside the file.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Con số vàng cần nhớ về AWS KMS: API `Encrypt` và `Decrypt` chỉ xử lý tối đa **4 KB** dữ liệu. Với tệp lớn hơn 4 KB, bắt buộc áp dụng **Envelope Encryption (Mã hóa phong bì)** bằng API `GenerateDataKey`.

- **A:** Sai vì khóa bất đối xứng RSA còn giới hạn kích thước dữ liệu mã hóa trực tiếp nhỏ hơn nữa.
- **B:** Sai vì giới hạn 4 KB của `kms:Encrypt` là giới hạn cứng (hard limit) không thể nâng.
- **C:** Sai vì lưu khóa mã hóa dạng văn bản thuần (`String`) không có cơ chế bảo vệ bằng KMS.
- **D (Đúng):** Đúng! API `kms:Encrypt` trực tiếp chỉ nhận tối đa 4 KB dữ liệu. Mọi dữ liệu > 4 KB đều phải dùng Envelope Encryption thông qua `kms:GenerateDataKey`.

</details>

---

[← Bộ trước](11-dva-cognito-identity.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Bộ tiếp theo →](13-dva-iac-cloudformation-sam-cdk.md)
