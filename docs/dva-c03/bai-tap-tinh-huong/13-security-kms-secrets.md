# Bài tập tình huống — Chủ đề 13: Mã hóa & Bảo mật dữ liệu — KMS, Secrets Manager, SSM & S3 Security

> KMS Envelope Encryption (GenerateDataKey), KMS Key Policies, SSM Parameter Store vs Secrets Manager, S3 Encryption (SSE-S3/KMS/C).
> **Số câu hỏi:** 35 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

Account A owns an Amazon S3 bucket encrypted with a customer-managed AWS KMS key (`CMK-A`) also in Account A. An IAM role in Account B (`Role-B`) already has an S3 bucket policy granting `s3:GetObject` on Account A's bucket, and `Role-B` has an IAM policy allowing `s3:GetObject` and `kms:Decrypt` on `CMK-A`. However, when `Role-B` tries to download an encrypted object from the bucket, it receives `AccessDenied`. What is missing?

- **A.** `Role-B` must also be granted `kms:GenerateDataKey` and `kms:ReEncrypt*` in its IAM policy to download encrypted objects.
- **B.** The S3 bucket must use SSE-S3 instead of SSE-KMS because customer-managed KMS keys cannot be shared across AWS accounts.
- **C.** The KMS Key Policy of `CMK-A` in Account A must explicitly grant `kms:Decrypt` permission to Account B (or `Role-B`).
- **D.** Enable S3 Object Ownership to `BucketOwnerEnforced` on Account A's bucket and disable Bucket Keys for SSE-KMS.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Account A sở hữu một Amazon S3 bucket được mã hóa bằng một customer-managed AWS KMS key (`CMK-A`) cũng nằm trong Account A. Một IAM role trong Account B (`Role-B`) đã có S3 bucket policy cấp quyền `s3:GetObject` trên bucket của Account A, và `Role-B` có IAM policy cho phép `s3:GetObject` và `kms:Decrypt` trên `CMK-A`. Tuy nhiên, khi `Role-B` cố gắng tải xuống một object đã mã hóa từ bucket, nó nhận được lỗi `AccessDenied`. Điều gì đang bị thiếu?

**Đáp án đúng:** **C**

Quy tắc vàng **Cross-Account KMS CMK**:
1. **Customer-Managed Key (CMK)**: Chia sẻ được cross-account (khác với AWS Managed Key `aws/s3` không thể chia sẻ).
2. **Bắt buộc cả 2 bên**: Key Policy ở Account sở hữu KMS Key **VÀ** IAM Policy ở Account gọi API đều phải cho phép (nếu Key Policy không mở cho Account B thì IAM Policy của Account B không có hiệu lực).

- **A:** Sai vì `kms:GenerateDataKey` chỉ cần khi mã hóa (upload/PutObject); để đọc (decrypt) chỉ cần `kms:Decrypt`.
- **B:** Sai vì Customer-Managed KMS Keys (CMK) hoàn toàn có thể chia sẻ cross-account (chỉ AWS Managed Key `aws/s3` mới không chia sẻ cross-account được).
- **C (Đúng):** Đúng! Khác với IAM thông thường, truy cập KMS CMK cross-account bắt buộc phải có sự cho phép từ CẢ HAI phía: (1) KMS Key Policy ở Account A cho phép Account B/Role-B, VÀ (2) IAM Policy ở Account B cho phép `kms:Decrypt` trên `CMK-A`.
- **D:** Sai vì BucketOwnerEnforced chỉ tắt ACLs, không liên quan đến quyền giải mã KMS cross-account.

</details>

### Câu 2 `medium`

A microservices application stores 25 configuration parameters in AWS Systems Manager Parameter Store using hierarchical paths such as `/prod/orders/db-host`, `/prod/orders/db-port`, and `/prod/orders/api-key` (encrypted as `SecureString`). During startup, the orders service needs to retrieve all parameters under `/prod/orders/` in a single API call with decrypted values. Which API call should the developer use?

- **A.** Call `DescribeParameters` with `ParameterFilters` set to `/prod/orders/` and `WithDecryption=True`.
- **B.** Call `GetParameter` with `Name='/prod/orders/*'` and `WithDecryption=True` to retrieve all nested keys.
- **C.** Call `GetParametersByPath` with `Path='/prod/orders/'`, `Recursive=True`, and `WithDecryption=True`.
- **D.** Call `GetSecretValue` from AWS Secrets Manager using the hierarchical prefix `/prod/orders/` in `SecretId`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng microservices lưu trữ 25 tham số cấu hình trong AWS Systems Manager Parameter Store bằng các đường dẫn phân cấp như `/prod/orders/db-host`, `/prod/orders/db-port` và `/prod/orders/api-key` (được mã hóa dạng `SecureString`). Khi khởi động, dịch vụ orders cần lấy tất cả các tham số dưới `/prod/orders/` trong một lời gọi API duy nhất với các giá trị đã được giải mã. Developer nên sử dụng lời gọi API nào?

**Đáp án đúng:** **C**

**SSM Parameter Store APIs**:
- `GetParameter`: Lấy 1 tham số.
- `GetParameters`: Lấy danh sách tên tham số cụ thể.
- **`GetParametersByPath`**: Lấy tất cả tham số theo tiền tố đường dẫn (`/env/app/...`), hỗ trợ phân trang và `WithDecryption=True` cho `SecureString`.

- **A:** Sai vì `DescribeParameters` chỉ trả về metadata của tham số (tên, kiểu, ngày sửa), không trả về giá trị (`Value`).
- **B:** Sai vì `GetParameter` chỉ lấy được duy nhất 1 tham số theo tên chính xác, không hỗ trợ wildcard `*`.
- **C (Đúng):** Đúng! `ssm:GetParametersByPath` cho phép lấy toàn bộ tham số theo cấu trúc thư mục (`/prod/orders/...`) và truyền `WithDecryption=True` để tự động giải mã các tham số `SecureString` bằng KMS.
- **D:** Sai vì tham số đang lưu ở SSM Parameter Store, không phải Secrets Manager.

</details>

### Câu 3 `hard`

A compliance team mandates that all objects uploaded to an Amazon S3 bucket (`corp-audit-logs`) must be encrypted at rest using AWS KMS (`aws:kms`) and must only be transmitted over HTTPS (TLS). Which S3 bucket policy statements enforce BOTH requirements?

- **A.** Configure an S3 CORS policy allowing only `https://` origins and attach an IAM policy requiring `kms:Decrypt`.
- **B.** Add an `Allow` statement for `s3:PutObject` with `aws:SecureTransport: true` and rely on S3 default bucket encryption with SSE-KMS.
- **C.** Enable S3 Block Public Access on the bucket and configure an S3 Object Lock retention policy in Governance mode.
- **D.** Add two `Deny` statements: one denying `s3:*` when `aws:SecureTransport` is `false`, and another denying `s3:PutObject` unless `s3:x-amz-server-side-encryption` is `aws:kms`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm tuân thủ yêu cầu tất cả các object được tải lên một Amazon S3 bucket (`corp-audit-logs`) phải được mã hóa khi lưu trữ (encrypted at rest) bằng AWS KMS (`aws:kms`) và chỉ được truyền qua HTTPS (TLS). Các câu lệnh S3 bucket policy nào thực thi CẢ HAI yêu cầu này?

**Đáp án đúng:** **D**

Mẫu **S3 Bucket Policy** ép bảo mật (rất hay gặp trong DVA-C02):
- Ép **HTTPS (in-transit)**: `Effect: Deny`, `Condition: { "Bool": { "aws:SecureTransport": "false" } }`.
- Ép **SSE-KMS (at-rest)**: `Effect: Deny` trên `s3:PutObject` nếu header `s3:x-amz-server-side-encryption` khác `aws:kms` hoặc bị thiếu.

- **A:** Sai vì CORS chỉ kiểm soát trình duyệt cross-origin, không chặn được các request HTTP từ CLI/SDK.
- **B:** Sai vì một statement `Allow` không chặn được các IAM user có quyền `s3:*` từ IAM Policy; để ép buộc tuyệt đối ở tầng bucket phải dùng **Explicit `Deny`**.
- **C:** Sai vì Block Public Access chỉ chặn truy cập công khai, không ép buộc HTTPS hay SSE-KMS đối với các IAM user nội bộ.
- **D (Đúng):** Đúng! Dùng Explicit `Deny` với điều kiện `Bool: {"aws:SecureTransport": "false"}` để chặn mọi kết nối HTTP không mã hóa, và `StringNotEquals: {"s3:x-amz-server-side-encryption": "aws:kms"}` (hoặc `Null: {"s3:x-amz-server-side-encryption": "true"}`) trên `s3:PutObject` để ép dùng SSE-KMS.

</details>

### Câu 4 `medium`

A single-page React application hosted on `https://app.example.com` makes a `POST` request with a custom `Authorization` header to an Amazon API Gateway REST API at `https://api.example.com/orders`. The browser blocks the request with a CORS error, even though the Lambda function already returns `Access-Control-Allow-Origin: *`. What is the most likely cause?

- **A.** API Gateway lacks a `MOCK` integration for the `OPTIONS` preflight method returning CORS headers (`Access-Control-Allow-Headers`, `Methods`, `Origin`).
- **B.** API Gateway REST APIs do not support CORS headers when the client sends `POST` requests with JSON payloads.
- **C.** The Lambda proxy integration must return `HTTP 301` instead of `HTTP 200` for browser CORS requests to succeed.
- **D.** Amazon Route 53 must be configured with a `CNAME` record instead of an `ALIAS` record for `api.example.com`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng React single-page được lưu trữ trên `https://app.example.com` gửi một `POST` request kèm header tùy chỉnh `Authorization` đến một Amazon API Gateway REST API tại `https://api.example.com/orders`. Trình duyệt chặn request với lỗi CORS, mặc dù hàm Lambda đã trả về `Access-Control-Allow-Origin: *`. Nguyên nhân có khả năng nhất là gì?

**Đáp án đúng:** **A**

Xử lý lỗi **CORS trên Amazon API Gateway**:
- Với **Lambda Proxy Integration** (`GET`, `POST`...): Bản thân code Lambda phải trả về `Access-Control-Allow-Origin` trong `headers` của response.
- Với **Preflight `OPTIONS`**: Phải bật CORS (tạo method `OPTIONS` dùng **MOCK integration**) trả về `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, và `Access-Control-Allow-Headers`.
- Nếu API Gateway trả lỗi `4xx/5xx` (ví dụ `401/403` từ Authorizer) trước khi tới Lambda, cần thêm CORS headers vào **Gateway Responses**.

- **A (Đúng):** Đúng! Khi trình duyệt gửi request `POST` kèm header tùy chỉnh (`Authorization`), trình duyệt sẽ gửi trước một **preflight `OPTIONS` request**. Vì API Gateway chưa cấu hình method `OPTIONS` (thường dùng `MOCK` integration để không tốn tiền gọi Lambda) trả về đủ CORS headers, trình duyệt sẽ chặn request.
- **B:** Sai vì API Gateway hỗ trợ CORS đầy đủ cho mọi HTTP method (`GET`, `POST`, `PUT`, `DELETE`, v.v.).
- **C:** Sai vì preflight `OPTIONS` phải trả về `HTTP 200` (hoặc `204`), không phải `301`.
- **D:** Sai vì loại DNS record không ảnh hưởng đến chính sách CORS của trình duyệt.

</details>

### Câu 5 `medium`

A developer deploys a containerized microservice on Amazon ECS with AWS Fargate. The container image is stored in a private Amazon ECR repository, database credentials are stored in AWS Secrets Manager, and the application code inside the container needs to write objects to an Amazon S3 bucket (`app-uploads`). Which IAM roles should receive which permissions in the ECS Task Definition?

- **A.** Grant `ecr:*` pull and `secretsmanager:GetSecretValue` to Task Execution Role (`executionRoleArn`), and `s3:PutObject` to Task Role (`taskRoleArn`).
- **B.** Grant `s3:PutObject` to the Task Execution Role (`executionRoleArn`) and `ecr:GetAuthorizationToken` to the Task Role (`taskRoleArn`) in the ECS task.
- **C.** Attach both ECR pull, Secrets Manager read, and S3 `PutObject` permissions to an EC2 Instance Profile on the Fargate cluster.
- **D.** Hardcode IAM User Access Keys as plaintext `ENV` environment variables inside the container image `Dockerfile`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer triển khai một microservice đóng gói container trên Amazon ECS với AWS Fargate. Container image được lưu trữ trong một Amazon ECR repository riêng tư, thông tin đăng nhập cơ sở dữ liệu được lưu trong AWS Secrets Manager, và mã ứng dụng bên trong container cần ghi các object vào một Amazon S3 bucket (`app-uploads`). Những IAM role nào nên nhận các quyền nào trong ECS Task Definition?

**Đáp án đúng:** **A**

Phân biệt 2 IAM Role trong **Amazon ECS Task Definition**:
- **`executionRoleArn` (Task Execution Role)**: Quyền cho **hệ thống ECS/Fargate** (kéo image ECR, ghi log CloudWatch, đọc Secrets Manager/SSM để inject biến môi trường).
- **`taskRoleArn` (Task Role)**: Quyền cho **code ứng dụng bên trong container** gọi các dịch vụ AWS (S3, DynamoDB, SQS...).

- **A (Đúng):** Đúng! **Task Execution Role** (`executionRoleArn`) cấp quyền cho **ECS Agent/Fargate** kéo image từ ECR, đẩy log lên CloudWatch, và nạp Secrets Manager/SSM lúc khởi tạo container. **Task Role** (`taskRoleArn`) cấp quyền cho **chính code ứng dụng** bên trong container gọi S3/DynamoDB.
- **B:** Sai vì ngược vai trò: code ứng dụng trong container không dùng `executionRoleArn` để gọi S3, và ECS Agent không dùng `taskRoleArn` để kéo image từ ECR.
- **C:** Sai vì đang chạy trên **AWS Fargate** (serverless containers), không có EC2 instance hay EC2 Instance Profile.
- **D:** Sai vì hardcode IAM Access Keys là vi phạm bảo mật nghiêm trọng.

</details>

### Câu 6 `medium`

An application needs to encrypt a 500 MB backup file locally before uploading it to Amazon S3. Because AWS KMS `Encrypt` API has a 4 KB payload limit, the developer implements Envelope Encryption. What is the correct sequence of steps for Envelope Encryption with AWS KMS?

- **A.** Split the 500 MB backup file into 4 KB chunks and call `kms:Encrypt` 125,000 times in a sequential loop before concatenating the ciphertext.
- **B.** Call `kms:GenerateDataKeyWithoutPlaintext` to obtain an encrypted Data Key and encrypt the 500 MB file locally in memory using that encrypted key directly.
- **C.** Call `kms:GenerateDataKey`, encrypt the 500 MB file locally with the plaintext key, discard the plaintext key, and store the encrypted key with the file.
- **D.** Generate a local AES-256 key, encrypt the 500 MB file, and store the plaintext Data Key in the S3 object's `x-amz-meta-key` metadata.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng cần mã hóa cục bộ một tệp sao lưu 500 MB trước khi tải lên Amazon S3. Vì API `Encrypt` của AWS KMS có giới hạn payload là 4 KB, developer triển khai Envelope Encryption. Trình tự các bước đúng cho Envelope Encryption với AWS KMS là gì?

**Đáp án đúng:** **C**

**AWS KMS Envelope Encryption**:
- Giới hạn của `kms:Encrypt`: tối đa **4 KB**.
- Giải pháp cho file > 4 KB: Gọi **`kms:GenerateDataKey`** -> mã hóa file tại local bằng **Plaintext Data Key** -> xóa Plaintext Data Key khỏi RAM -> lưu **CiphertextBlob (Encrypted Data Key)** cùng file.
- Khi giải mã: Gọi **`kms:Decrypt`** lên Encrypted Data Key để lấy lại Plaintext Data Key rồi giải mã file tại local.

- **A:** Sai vì gọi KMS `Encrypt` 125,000 lần cho 1 file cực kỳ chậm, tốn kém và dễ bị KMS API throttling.
- **B:** Sai vì Encrypted Data Key chưa giải mã không thể dùng trực tiếp để mã hóa file; cần dùng `GenerateDataKey` để lấy Plaintext Data Key.
- **C (Đúng):** Đúng! Đây là quy trình chuẩn của **Envelope Encryption**: Dùng `GenerateDataKey` lấy cặp (Plaintext Data Key + Encrypted Data Key), mã hóa file lớn ở local bằng Plaintext Data Key, xóa ngay Plaintext Data Key khỏi RAM và lưu Encrypted Data Key kèm theo dữ liệu mã hóa.
- **D:** Sai vì lưu Plaintext Data Key cùng file sẽ làm lộ khóa giải mã, vô hiệu hóa hoàn toàn việc mã hóa.

</details>

### Câu 7 `medium`

A security audit requires automatic annual key rotation for a Customer-Managed AWS KMS symmetric key used to encrypt Amazon DynamoDB data. What happens to existing encrypted data after KMS automatically rotates the key?

- **A.** All existing DynamoDB items become unreadable until a background batch job re-encrypts every item using the newly rotated KMS key version.
- **B.** The KMS Key ARN and Key ID change every year upon rotation, so the application must update its IAM policies and SDK configuration.
- **C.** Automatic key rotation schedules deletion of the previous key backing material after a mandatory 30-day waiting period.
- **D.** Existing data needs no re-encryption because KMS retains previous key material and automatically selects the right version on `Decrypt`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một cuộc kiểm toán bảo mật yêu cầu xoay vòng khóa tự động hằng năm đối với một Customer-Managed AWS KMS symmetric key được dùng để mã hóa dữ liệu Amazon DynamoDB. Điều gì xảy ra với dữ liệu đã được mã hóa trước đó sau khi KMS tự động xoay vòng khóa?

**Đáp án đúng:** **D**

**AWS KMS Key Rotation**:
- **Customer-Managed Key (Symmetric)**: Hỗ trợ Automatic Key Rotation; giữ nguyên **Key ID / ARN**; giữ lại **key material cũ** để giải mã dữ liệu cũ.
- **Imported Key Material & Asymmetric Keys**: Không hỗ trợ Automatic Key Rotation (phải xoay vòng thủ công bằng cách tạo CMK mới và trỏ lại **KMS Alias**).

- **A:** Sai vì KMS tự động lưu giữ các phiên bản key material cũ để giải mã.
- **B:** Sai vì Key ID và Key ARN giữ nguyên không đổi khi xoay vòng tự động.
- **C:** Sai vì KMS không bao giờ tự xóa key material cũ của một key đang hoạt động.
- **D (Đúng):** Đúng! Khi bật Automatic Key Rotation (mỗi 365 ngày hoặc tùy chỉnh 90–2560 ngày), KMS tạo key material mới cho các lần mã hóa mới nhưng **vẫn giữ lại toàn bộ key material cũ** để tự động giải mã dữ liệu cũ mà không làm gián đoạn ứng dụng.

</details>

### Câu 8 `medium`

A company stores its Amazon RDS MySQL master password in AWS Secrets Manager with automatic rotation enabled every 30 days. However, when rotation runs, the rotation fails with a timeout error. The RDS database is inside a private VPC subnet with no internet access. What is the most likely cause?

- **A.** AWS Secrets Manager does not support automatic managed password rotation for Amazon RDS MySQL database instances.
- **B.** The Secrets Manager rotation Lambda lacks VPC configuration, Security Group rules, or a VPC Endpoint to reach both RDS and Secrets Manager.
- **C.** Secrets Manager requires the Amazon RDS MySQL instance to be publicly accessible on the internet (`PubliclyAccessible: true`) for rotation.
- **D.** Automatic 30-day password rotation only works when credentials are stored as AWS Systems Manager Parameter Store Standard parameters.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ mật khẩu master của Amazon RDS MySQL trong AWS Secrets Manager với tính năng xoay vòng tự động được bật mỗi 30 ngày. Tuy nhiên, khi quá trình xoay vòng chạy, nó thất bại với lỗi timeout. Cơ sở dữ liệu RDS nằm bên trong một private VPC subnet không có truy cập internet. Nguyên nhân có khả năng nhất là gì?

**Đáp án đúng:** **B**

Cơ chế xoay vòng **AWS Secrets Manager**:
- Sử dụng một **Lambda Rotation Function** gồm 4 bước: `createSecret` -> `setSecret` -> `testSecret` -> `finishSecret`.
- Nếu RDS nằm trong **Private VPC**: Rotation Lambda cần nằm trong VPC, Security Group mở tới DB port, và có **Interface VPC Endpoint** cho `secretsmanager` (hoặc NAT Gateway).

- **A:** Sai vì Secrets Manager hỗ trợ xoay vòng tự động (native rotation) cho RDS MySQL, PostgreSQL, Aurora, SQL Server, Oracle, Redshift, DocumentDB.
- **B (Đúng):** Đúng! Rotation được thực hiện bởi một **Lambda function**. Để xoay vòng mật khẩu RDS trong private VPC, hàm Lambda rotation đó phải chạy trong VPC có Security Group kết nối được tới cổng 3306 của RDS **VÀ** có đường gọi tới Secrets Manager API (qua Interface VPC Endpoint hoặc NAT Gateway).
- **C:** Sai vì hoàn toàn có thể xoay vòng trong private VPC bằng cách đặt rotation Lambda vào VPC + dùng VPC Endpoint cho Secrets Manager.
- **D:** Sai vì SSM Parameter Store không có tính năng tự động xoay vòng mật khẩu; đây là tính năng đặc trưng của Secrets Manager.

</details>

### Câu 9 `easy`

A company stores sensitive medical images in Amazon S3. Compliance requires that the company manage its own encryption keys locally on-premises (AWS must never store the encryption keys), while still letting S3 perform the actual encryption and decryption of objects on the server side. Which S3 encryption option meets this requirement?

- **A.** Server-Side Encryption with Customer-Provided Keys (SSE-C)
- **B.** Server-Side Encryption with Amazon S3 Managed Keys (SSE-S3)
- **C.** Server-Side Encryption with AWS KMS Keys (SSE-KMS)
- **D.** Client-Side Encryption using the AWS Encryption SDK

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ các hình ảnh y tế nhạy cảm trong Amazon S3. Quy định tuân thủ yêu cầu công ty phải tự quản lý khóa mã hóa cục bộ tại on-premises (AWS không bao giờ được lưu trữ khóa mã hóa), trong khi vẫn để S3 thực hiện việc mã hóa và giải mã thực tế các object ở phía máy chủ. Tùy chọn mã hóa S3 nào đáp ứng yêu cầu này?

**Đáp án đúng:** **A**

4 kiểu mã hóa **Amazon S3**:
- **SSE-S3**: AWS quản lý toàn bộ key (AES-256).
- **SSE-KMS**: AWS KMS quản lý key (có audit log CloudTrail, kiểm soát quyền qua Key Policy).
- **SSE-C**: Khách hàng tự giữ key bên ngoài, truyền key qua HTTPS ở mỗi request, **S3 mã hóa/giải mã ở server-side**.
- **Client-Side Encryption**: Khách hàng mã hóa trước ở client rồi mới upload.

- **A (Đúng):** Đúng! Với **SSE-C**, khách hàng tự quản lý khóa ở on-premises và gửi khóa kèm mỗi request `PUT`/`GET` qua HTTPS; AWS S3 thực hiện mã hóa/giải mã trên server rồi lập tức xóa khóa khỏi bộ nhớ (không lưu trữ khóa).
- **B:** Sai vì với SSE-S3, AWS toàn quyền quản lý và lưu trữ khóa mã hóa.
- **C:** Sai vì với SSE-KMS, khóa CMK được lưu trữ và quản lý bên trong dịch vụ AWS KMS.
- **D:** Sai vì Client-Side Encryption thực hiện mã hóa ở phía client trước khi gửi lên S3, không phải S3 thực hiện mã hóa ở server side.

</details>

### Câu 10 `medium`

A developer stores a third-party payment API key inside an AWS Lambda function's environment variables. To satisfy security compliance, the key must be encrypted with a Customer-Managed AWS KMS Key (CMK) both at rest and in transit to the Lambda runtime, AND only authorized developers with explicit permission should be able to view or decrypt the plaintext value. Which TWO actions meet these requirements? (Choose two.)

- **A.** Rely on the default `aws/lambda` AWS Managed KMS Key without enabling client-side AWS Lambda Encryption Helpers in the console.
- **B.** Enable Encryption Helpers in Lambda to encrypt the variable with a Customer-Managed KMS Key, and decrypt it at runtime with `kms:Decrypt`.
- **C.** Print the decrypted API key to Amazon CloudWatch Logs on function startup so authorized developers can verify it.
- **D.** Restrict `kms:Decrypt` on the Customer-Managed KMS Key Policy so only the Lambda execution role and authorized admins can decrypt it.
- **E.** Disable TLS encryption on the Lambda invocation endpoint and store the API key in Lambda layer metadata.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer lưu trữ API key thanh toán của bên thứ ba bên trong các biến môi trường (environment variable) của một hàm AWS Lambda. Để đáp ứng tuân thủ bảo mật, key này phải được mã hóa bằng một Customer-Managed AWS KMS Key (CMK) cả khi lưu trữ (at rest) và khi truyền (in transit) tới Lambda runtime, VÀ chỉ những developer được ủy quyền với quyền tường minh mới có thể xem hoặc giải mã giá trị plaintext. HAI hành động nào đáp ứng các yêu cầu này? (Chọn hai đáp án.)

**Đáp án đúng:** **B, D**

Bảo mật **Lambda Environment Variables**:
- Mặc định dùng `aws/lambda` (tự giải mã khi xem cấu hình).
- Để bảo mật cao hơn: dùng **Customer-Managed KMS Key** + **Encryption Helpers** (hoặc chuyển sang lưu ở **Secrets Manager / SSM Parameter Store SecureString**).

- **A:** Sai vì mặc định `aws/lambda` tự động giải mã và hiển thị plaintext cho bất kỳ user nào có quyền xem cấu hình hàm Lambda trên Console/CLI.
- **B (Đúng):** Đúng! Mặc định Lambda mã hóa at-rest bằng AWS Managed Key (`aws/lambda`), nhưng khi deploy hoặc xem console, bất kỳ ai có quyền `lambda:GetFunctionConfiguration` đều thấy được plaintext. Dùng **Customer-Managed KMS Key + Encryption Helpers** (mã hóa trước giá trị biến môi trường) bắt buộc code phải gọi `kms:Decrypt` lúc chạy và siết quyền ai được giải mã.
- **C:** Sai vì in bí mật ra CloudWatch Logs làm rò rỉ thông tin nhạy cảm.
- **D (Đúng):** Đúng! Kiểm soát `kms:Decrypt` trên KMS Key Policy đảm bảo chỉ Execution Role của Lambda (và admin được phép) mới giải mã được bí mật.
- **E:** Sai và không khả thi trên AWS Lambda API.

</details>

### Câu 11 `medium`

A company serves a React single-page application from a private Amazon S3 bucket through Amazon CloudFront. Users must ONLY be able to access the files via CloudFront (direct S3 URLs must be denied), and the S3 bucket uses SSE-KMS encryption. Which TWO configurations are required? (Choose two.)

- **A.** Use the legacy Amazon CloudFront Origin Access Identity (OAI) because Origin Access Control (OAC) does not support SSE-KMS encrypted S3 buckets.
- **B.** Enable S3 Static Website Hosting on the bucket and configure the HTTP website endpoint as the custom CloudFront origin.
- **C.** Configure CloudFront OAC on the S3 origin and allow `s3:GetObject` in the bucket policy only for `cloudfront.amazonaws.com` with `AWS:SourceArn`.
- **D.** Disable S3 Block Public Access on the bucket and grant `s3:GetObject` to `Principal: "*"` with a `Referer` header condition.
- **E.** Update the SSE-KMS Key Policy to allow `kms:Decrypt` for `cloudfront.amazonaws.com` with the `AWS:SourceArn` condition.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty phục vụ một ứng dụng React single-page từ một Amazon S3 bucket riêng tư thông qua Amazon CloudFront. Người dùng CHỈ được phép truy cập các tệp qua CloudFront (các URL S3 trực tiếp phải bị từ chối) và S3 bucket sử dụng mã hóa SSE-KMS. Cần HAI cấu hình nào? (Chọn hai đáp án.)

**Đáp án đúng:** **C, E**

**CloudFront + Private S3 + SSE-KMS**:
- Bắt buộc dùng **Origin Access Control (OAC)** (thay cho OAI cũ).
- Cần mở quyền ở **2 nơi**: (1) **S3 Bucket Policy** cho `cloudfront.amazonaws.com` kèm `AWS:SourceArn`, và (2) **KMS Key Policy** cấp `kms:Decrypt` cho `cloudfront.amazonaws.com`.

- **A:** Sai ngược hoàn toàn: **OAI cũ không hỗ trợ SSE-KMS**, chỉ có **OAC mới** hỗ trợ SSE-KMS.
- **B:** Sai vì nếu dùng S3 Static Website Hosting endpoint thì bucket phải mở public và không dùng được OAC/OAI.
- **C (Đúng):** Đúng! **Origin Access Control (OAC)** là cơ chế mới thay thế OAI để khóa S3 bucket chỉ cho phép đúng CloudFront distribution (`AWS:SourceArn`) truy cập, đồng thời **OAC hỗ trợ SSE-KMS** (điều mà OAI cũ không làm được).
- **D:** Sai vì mở `Principal: *` sẽ cho phép truy cập thẳng S3 không qua CloudFront.
- **E (Đúng):** Đúng! Vì S3 bucket mã hóa bằng **SSE-KMS**, CloudFront OAC cần được cấp quyền `kms:Decrypt` trong **KMS Key Policy** để giải mã object khi lấy từ S3.

</details>

### Câu 12 `medium`

An AWS Lambda function running inside a private VPC subnet (with no NAT Gateway) needs to retrieve database credentials from AWS Secrets Manager. When the function calls `secretsmanager:GetSecretValue`, it times out after 30 seconds. What is the MOST secure and cost-effective way to allow the Lambda function to reach Secrets Manager without adding a NAT Gateway?

- **A.** Create a Gateway VPC Endpoint for AWS Secrets Manager and add a prefix-list route to the private subnet route table.
- **B.** Attach an Elastic IP address directly to the Lambda function's Elastic Network Interface (ENI) inside the private subnet.
- **C.** Move the RDS database credentials into AWS Lambda Environment Variables in plaintext and remove the Secrets Manager SDK call entirely.
- **D.** Create an Interface VPC Endpoint for `com.amazonaws.<region>.secretsmanager` and allow HTTPS (443) from the Lambda Security Group.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm AWS Lambda chạy bên trong một private VPC subnet (không có NAT Gateway) cần lấy thông tin đăng nhập cơ sở dữ liệu từ AWS Secrets Manager. Khi hàm gọi `secretsmanager:GetSecretValue`, nó bị timeout sau 30 giây. Cách BẢO MẬT VÀ TỐI ƯU CHI PHÍ NHẤT để cho phép hàm Lambda kết nối tới Secrets Manager mà không cần thêm NAT Gateway là gì?

**Đáp án đúng:** **D**

Khi Lambda trong **Private VPC** (không có NAT Gateway) cần gọi **Secrets Manager / KMS / SQS / SNS / STS**:
- Phải tạo **Interface VPC Endpoint (AWS PrivateLink)** cho dịch vụ tương ứng.
- Nhớ bật **Private DNS** trên Interface Endpoint và mở **Security Group port 443 (HTTPS)** cho ENI của Endpoint.

- **A:** Sai vì Gateway VPC Endpoint chỉ tồn tại cho Amazon S3 và Amazon DynamoDB.
- **B:** Sai vì bạn không thể gắn Elastic IP trực tiếp lên ENI do Lambda quản lý.
- **C:** Sai vì lưu mật khẩu DB dạng plaintext trong biến môi trường làm mất tính năng bảo mật và xoay vòng tự động của Secrets Manager.
- **D (Đúng):** Đúng! Secrets Manager không hỗ trợ Gateway Endpoint (chỉ S3 và DynamoDB có Gateway Endpoint). Tạo **Interface VPC Endpoint (PrivateLink)** cho `secretsmanager` giúp Lambda gọi API qua mạng riêng AWS mà không cần NAT Gateway hay Internet.

</details>

### Câu 13 `medium`

A web application at `https://app.example.com` fetches static JSON assets from an Amazon S3 bucket via Amazon CloudFront (`https://cdn.example.com`). The S3 bucket already has a CORS policy allowing `https://app.example.com`, yet browsers intermittently receive cached responses without `Access-Control-Allow-Origin` headers after another origin (`https://admin.example.com`) requested the same file first. How should CloudFront be configured?

- **A.** Set the CloudFront Default TTL and Maximum TTL to 365 days in the distribution's cache behavior settings.
- **B.** Configure the CloudFront Cache Policy to forward `Origin` to S3 and include `Origin` in the cache key (or use a Response Headers Policy).
- **C.** Disable HTTPS (`http-only`) between the CloudFront distribution and the Amazon S3 origin endpoint.
- **D.** Enable Amazon S3 Transfer Acceleration and S3 EventBridge notifications on the destination bucket before saving the Lambda trigger.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng web tại `https://app.example.com` lấy các tài nguyên JSON tĩnh từ một Amazon S3 bucket thông qua Amazon CloudFront (`https://cdn.example.com`). S3 bucket đã có CORS policy cho phép `https://app.example.com`, nhưng trình duyệt thỉnh thoảng nhận được các phản hồi được cache mà không có header `Access-Control-Allow-Origin` sau khi một origin khác (`https://admin.example.com`) yêu cầu cùng tệp đó trước đó. CloudFront nên được cấu hình như thế nào?

**Đáp án đúng:** **B**

Xử lý **CORS với CloudFront + S3**:
- CloudFront mặc định có thể loại bỏ header `Origin` khỏi request gửi về S3.
- Phải cấu hình CloudFront forward **`Origin`** (và `Access-Control-Request-Headers`, `Access-Control-Request-Method`) trong Origin Request Policy / Cache Policy (dùng managed policy **`CORS-S3Origin`**).

- **A:** Sai vì tăng TTL chỉ làm response cache sai tồn tại lâu hơn.
- **B (Đúng):** Đúng! Nếu CloudFront không đưa header **`Origin`** vào Cache Key và không forward `Origin` về S3, CloudFront sẽ cache response đầu tiên (không có CORS header phù hợp hoặc sai origin) và trả lại cho các domain khác. Đưa `Origin` (hoặc dùng `SimpleCORS` / `CORS-with-preflight` policy) giải quyết triệt để lỗi này.
- **C:** Sai vì tắt HTTPS không liên quan đến header `Origin` của CORS.
- **D:** Sai vì Transfer Acceleration không xử lý CORS header caching.

</details>

### Câu 14 `easy`

A security engineer wants to automatically audit all Amazon S3 buckets, AWS KMS keys, IAM roles, and AWS Lambda function policies in an account to identify any resources shared publicly or with external AWS accounts outside the organization. Which AWS feature provides this continuous automated analysis?

- **A.** AWS IAM Access Analyzer
- **B.** AWS CloudTrail Insights
- **C.** AWS Systems Manager Parameter Store
- **D.** AWS X-Ray Service Map

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư bảo mật muốn tự động kiểm toán tất cả các Amazon S3 bucket, AWS KMS key, IAM role và AWS Lambda function policy trong một tài khoản để xác định bất kỳ tài nguyên nào được chia sẻ công khai hoặc với các tài khoản AWS bên ngoài tổ chức. Tính năng AWS nào cung cấp khả năng phân tích tự động liên tục này?

**Đáp án đúng:** **A**

**AWS IAM Access Analyzer**:
- Phát hiện tài nguyên bị chia sẻ **public** hoặc **cross-account** ngoài Zone of Trust (Account hoặc AWS Organization).
- Hỗ trợ sinh **Least-Privilege IAM Policy** dựa trên lịch sử hoạt động CloudTrail.

- **A (Đúng):** Đúng! **IAM Access Analyzer** sử dụng lý luận toán học (automated reasoning) để phân tích resource-based policies (S3, KMS, IAM roles, Lambda, SQS, Secrets Manager...) và cảnh báo mọi quyền truy cập từ bên ngoài tài khoản/Organization.
- **B:** Sai vì CloudTrail Insights phát hiện bất thường về tần suất gọi API quản trị (ví dụ đột biến số lần gọi `RunInstances`), không phân tích cấu hình policy chia sẻ tài nguyên.
- **C:** Sai vì Parameter Store chỉ lưu biến cấu hình.
- **D:** Sai vì X-Ray dùng để trace hiệu năng request ứng dụng, không quét bảo mật policy.

</details>

### Câu 15 `hard`

An AWS account has an Amazon S3 bucket (`finance-reports`) with a **Bucket Policy** allowing `s3:GetObject` to `arn:aws:iam::111122223333:user/alice`. Alice's IAM User has NO IAM Identity Policy attached at all, and there is no Explicit Deny anywhere. Can Alice download objects from `finance-reports`?

- **A.** No, because an IAM User must always have an explicit `Allow` statement in both an Identity-based Policy and a Resource-based Policy together.
- **B.** No, because S3 Bucket Policies only apply to anonymous public users and cannot grant access to IAM Users.
- **C.** Yes, because for same-account access, a Resource-based Policy `Allow` for Alice is sufficient even without an Identity-based Policy.
- **D.** Yes, only if Alice also has the `AdministratorAccess` AWS managed policy attached to her IAM User.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tài khoản AWS có một Amazon S3 bucket (`finance-reports`) với một **Bucket Policy** cho phép `s3:GetObject` đối với `arn:aws:iam::111122223333:user/alice`. IAM User của Alice KHÔNG có bất kỳ IAM Identity Policy nào được gắn, và không có Explicit Deny ở bất kỳ đâu. Alice có thể tải xuống các object từ `finance-reports` không?

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

- **A.** Nothing can be done; once scheduled for deletion, an AWS KMS key can never be cancelled or recovered.
- **B.** Run `CancelKeyDeletion` on the key and then call `EnableKey`, since keys in `PendingDeletion` are disabled until re-enabled.
- **C.** Create a new KMS key with the exact same Alias name; AWS KMS will automatically decrypt the existing S3 files.
- **D.** Call `kms:Decrypt` directly; keys in `PendingDeletion` continue decrypting existing S3 objects normally during the 7-day waiting period.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer vô tình lên lịch xóa một AWS KMS Customer-Managed Key (CMK) với thời gian chờ 7 ngày, và sau đó nhận ra hàng nghìn tệp được mã hóa quan trọng trong Amazon S3 phụ thuộc vào key này. Developer có thể làm gì vào Ngày thứ 3 trước khi thời gian chờ kết thúc?

**Đáp án đúng:** **B**

**Xóa KMS Key (`ScheduleKeyDeletion`)**:
- Thời gian chờ bắt buộc: **7 – 30 ngày**.
- Trong thời gian chờ: Key bị **Disabled** (`PendingDeletion`).
- Khôi phục trước khi hết hạn: **`CancelKeyDeletion`** -> **`EnableKey`**.

- **A:** Sai vì mục đích của thời gian chờ 7–30 ngày chính là để kịp thời phát hiện và hủy lệnh xóa bằng `CancelKeyDeletion`.
- **B (Đúng):** Đúng! KMS bắt buộc có thời gian chờ từ **7 đến 30 ngày** trước khi xóa vĩnh viễn. Trong thời gian này key ở trạng thái `PendingDeletion` (không dùng để mã hóa/giải mã được), và có thể cứu lại bằng **`CancelKeyDeletion`** sau đó gọi **`EnableKey`**.
- **C:** Sai vì mỗi KMS key có key material ngẫu nhiên khác nhau, tạo key mới cùng Alias không giải mã được dữ liệu cũ.
- **D:** Sai vì khi ở trạng thái `PendingDeletion`, mọi lệnh `Encrypt`/`Decrypt` dùng key đó đều bị từ chối cho đến khi hủy xóa và bật lại key.

</details>

### Câu 17 `medium`

An AWS Lambda function fetches a database connection string from AWS Secrets Manager on every invocation. Under high load (3,000 invocations/sec), the function encounters `ThrottlingException` from Secrets Manager and adds 50 ms of network latency per request. How can the developer eliminate Secrets Manager throttling and reduce latency without hardcoding secrets?

- **A.** Increase the AWS Lambda function's `Timeout` setting from 30 seconds to the maximum 900 seconds.
- **B.** Move the database secret into `buildspec.yml` plaintext `env.variables` so Lambda reads it at deploy time.
- **C.** Use the AWS Parameters and Secrets Lambda Extension (or cache the secret outside the handler with a TTL) to cache secrets locally.
- **D.** Disable TLS encryption on `secretsmanager:GetSecretValue` SDK calls to reduce API handshake latency.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm AWS Lambda lấy chuỗi kết nối cơ sở dữ liệu từ AWS Secrets Manager ở mỗi lần gọi. Khi tải cao (3.000 lượt gọi/giây), hàm gặp lỗi `ThrottlingException` từ Secrets Manager và làm tăng thêm 50 ms độ trễ mạng cho mỗi request. Làm thế nào developer có thể loại bỏ throttling của Secrets Manager và giảm độ trễ mà không cần hardcode secret?

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

- **A.** Encrypting sensitive secret values at rest using a Customer-Managed AWS KMS key.
- **B.** Organizing configuration parameters using hierarchical paths such as `/prod/db/host`.
- **C.** Controlling fine-grained read access to secrets using IAM identity and resource policies.
- **D.** Built-in automatic secret rotation with native RDS, Aurora, and Redshift integration, plus cross-region replication.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer đang so sánh AWS Systems Manager Parameter Store và AWS Secrets Manager để lưu trữ các secret của ứng dụng. Khả năng nào là **độc quyền** của AWS Secrets Manager (không được cung cấp sẵn bởi SSM Parameter Store)?

**Đáp án đúng:** **D**

So sánh **SSM Parameter Store vs Secrets Manager**:
- **SSM Parameter Store**: Miễn phí (Standard, tối đa 10,000 params, 4 KB), Advanced ($0.05/param, 8 KB, có Parameter Policies TTL), **không** có native DB auto-rotation.
- **Secrets Manager**: $0.40/secret/tháng, kích thước tới **64 KB**, có **Automatic Rotation**, **Cross-Region Replication**, và sinh mật khẩu ngẫu nhiên.

- **A:** Sai vì cả SSM Parameter Store (`SecureString`) và Secrets Manager đều hỗ trợ mã hóa bằng AWS KMS.
- **B:** Sai vì tổ chức theo đường dẫn phân cấp (`/prod/db/host`) là thế mạnh của **SSM Parameter Store**.
- **C:** Sai vì cả hai dịch vụ đều kiểm soát quyền bằng IAM.
- **D (Đúng):** Đúng! **Automatic Secret Rotation** (tích hợp sẵn với RDS, Aurora, Redshift, DocumentDB) và **Multi-Region Replication** là tính năng đặc trưng của **AWS Secrets Manager** (SSM Parameter Store không có auto-rotation tích hợp sẵn).

</details>

### Câu 19 `medium`

A company encrypts objects in an Amazon S3 bucket using SSE-KMS with a Customer-Managed Key (CMK). The security team notices that high-volume S3 workloads (millions of `PUT` and `GET` requests per hour) are causing high KMS API request charges and occasional KMS throttling. Which S3 feature reduces KMS API calls by up to 99% without changing client code?

- **A.** Enable Amazon S3 Bucket Keys on the S3 bucket.
- **B.** Disable KMS encryption and switch to unencrypted HTTP uploads.
- **C.** Enable S3 Transfer Acceleration.
- **D.** Enable S3 Intelligent-Tiering.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty mã hóa các object trong một Amazon S3 bucket bằng SSE-KMS với Customer-Managed Key (CMK). Nhóm bảo mật nhận thấy các workload S3 lưu lượng lớn (hàng triệu request `PUT` và `GET` mỗi giờ) đang gây ra chi phí gọi API KMS cao và thỉnh thoảng bị KMS throttling. Tính năng S3 nào giảm tới 99% số lời gọi API KMS mà không cần thay đổi mã nguồn phía client?

**Đáp án đúng:** **A**

**Amazon S3 Bucket Keys (for SSE-KMS)**:
- Giảm tới **99% chi phí và số lần gọi KMS API**.
- Lưu ý nhỏ: CloudTrail sẽ ghi nhận KMS ARN của Bucket thay vì từng Object ARN riêng lẻ.

- **A (Đúng):** Đúng! **S3 Bucket Keys** tạo một khóa cấp bucket ngắn hạn từ KMS CMK để S3 tự sinh khóa cho từng object, giúp **giảm tới 99% số lượng lời gọi API tới AWS KMS** (tiết kiệm chi phí và tránh KMS throttling).
- **B:** Sai vì làm mất mã hóa dữ liệu.
- **C:** Sai vì Transfer Acceleration không làm giảm số lần gọi AWS KMS.
- **D:** Sai vì Intelligent-Tiering chỉ tối ưu chi phí lưu trữ theo tầng truy cập.

</details>

### Câu 20 `hard`

An application runs on Amazon ECS Fargate and needs to access an Amazon S3 bucket encrypted with a Customer-Managed KMS Key (`CMK-1`). The ECS Task Role already has `s3:GetObject` and `s3:PutObject` permissions, and the S3 Bucket Policy allows the Task Role. However, `GetObject` fails with `AccessDenied` mentioning KMS. What additional permission does the ECS Task Role (or KMS Key Policy) need?

- **A.** Grant `kms:Decrypt` and `kms:GenerateDataKey` on `CMK-1` only to the ECS Task Execution Role (`executionRoleArn`).
- **B.** Grant `kms:Decrypt` (and `kms:GenerateDataKey` for `PutObject`) on `CMK-1` to the ECS Task Role (`taskRoleArn`).
- **C.** Grant `kms:ScheduleKeyDeletion` and `kms:DescribeKey` on `CMK-1` to the ECS Task Role (`taskRoleArn`).
- **D.** Enable S3 Object Lock in Governance mode on the encrypted S3 bucket so tasks bypass KMS decryption checks.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng chạy trên Amazon ECS Fargate và cần truy cập một Amazon S3 bucket được mã hóa bằng Customer-Managed KMS Key (`CMK-1`). ECS Task Role đã có quyền `s3:GetObject` và `s3:PutObject`, và S3 Bucket Policy cho phép Task Role. Tuy nhiên, `GetObject` thất bại với lỗi `AccessDenied` đề cập đến KMS. ECS Task Role (hoặc KMS Key Policy) cần thêm quyền gì?

**Đáp án đúng:** **B**

Quyền **SSE-KMS trên S3**:
- Upload (`PutObject`): Cần `s3:PutObject` + **`kms:GenerateDataKey`** (và `kms:Encrypt` nếu có).
- Download (`GetObject`): Cần `s3:GetObject` + **`kms:Decrypt`**.

- **A:** Sai vì code ứng dụng bên trong container sử dụng **`taskRoleArn`**, không dùng `executionRoleArn`.
- **B (Đúng):** Đúng! Khi đọc/ghi object S3 mã hóa bằng **SSE-KMS**, caller (**ECS Task Role**) bắt buộc phải có quyền **`kms:Decrypt`** (để đọc) và **`kms:GenerateDataKey`** (để ghi) trên KMS Key tương ứng.
- **C:** Sai vì `ScheduleKeyDeletion` là quyền xóa key quản trị, không dùng để đọc/ghi dữ liệu.
- **D:** Sai vì Object Lock không cấp quyền giải mã KMS.

</details>

### Câu 21 `medium`

A company stores sensitive files in Amazon S3 and wants to ensure that users can ONLY download files if they have passed through the corporate network proxy (IP `198.51.100.10/32`) OR through a specific VPC Endpoint (`vpce-12345678`). Which S3 Bucket Policy condition key blocks all requests that do NOT originate from that IP or VPC Endpoint?

- **A.** Add an `Allow` statement with `aws:SourceIp: 198.51.100.10/32` and `aws:SourceVpce: vpce-12345678` without any `Deny` statement.
- **B.** Use `aws:SourceIp` alone in the `Deny` condition for both the corporate proxy CIDR and the private VPC Endpoint traffic.
- **C.** Add an Explicit `Deny` for `s3:*` when BOTH `NotIpAddress: {"aws:SourceIp": "198.51.100.10/32"}` AND `StringNotEquals: {"aws:SourceVpce": "vpce-12345678"}`.
- **D.** Configure an S3 CORS rule restricting `AllowedOrigins` to `198.51.100.10/32` and `vpce-12345678`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ các tệp nhạy cảm trong Amazon S3 và muốn đảm bảo rằng người dùng CHỈ có thể tải tệp xuống nếu họ đã đi qua proxy mạng công ty (IP `198.51.100.10/32`) HOẶC qua một VPC Endpoint cụ thể (`vpce-12345678`). Condition key nào trong S3 Bucket Policy chặn tất cả các request KHÔNG bắt nguồn từ IP hoặc VPC Endpoint đó?

**Đáp án đúng:** **C**

Bẫy thi **S3 Bucket Policy với VPC Endpoint**:
- Traffic qua VPC Endpoint dùng private IP -> **KHÔNG** dùng `aws:SourceIp`, mà dùng **`aws:SourceVpce`** (hoặc `aws:SourceVpc`).
- Muốn chặn tuyệt đối dù user có IAM `s3:*`: Phải dùng **Explicit `Deny`**.

- **A:** Sai vì `Allow` trong Bucket Policy không chặn được các IAM User đã có quyền `s3:*` từ IAM Identity Policy truy cập từ IP khác; phải dùng **Explicit `Deny`**.
- **B:** Sai vì traffic đi qua **VPC Endpoint** sử dụng Private IP và **không** khớp với `aws:SourceIp` public; phải dùng **`aws:SourceVpce`** hoặc **`aws:SourceVpc`**.
- **C (Đúng):** Đúng! Kết hợp 2 điều kiện trong cùng một khối `Condition` của Explicit `Deny` (logic **AND**): chỉ chặn khi request **không** đến từ IP công ty **VÀ** **không** đi qua `vpce-12345678`. *(Lưu ý: `aws:SourceIp` không dùng được cho traffic đi qua VPC Endpoint nội bộ, nên phải kết hợp với `aws:SourceVpce`).*
- **D:** Sai vì CORS chỉ nhận tên miền HTTP origin (không nhận CIDR IP) và không chặn được AWS CLI/SDK.

</details>

### Câu 22 `medium`

An AWS Lambda function needs to connect to an Amazon RDS for MySQL database without storing any static database password in Secrets Manager, SSM Parameter Store, or environment variables. How can the Lambda function authenticate to the RDS MySQL database using its IAM Execution Role?

- **A.** Call `sts:GetSessionToken` in Lambda and pass the returned temporary STS `SessionToken` string as the RDS MySQL user password.
- **B.** Pass the Lambda Execution Role ARN string directly as the MySQL password in the database connection string.
- **C.** Enable S3 Object Lock in Compliance mode on the Amazon RDS MySQL instance's automated backup storage.
- **D.** Enable IAM DB Authentication on RDS, grant `rds-db:connect`, and call `rds.generate_db_auth_token()` for a 15-minute token.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm AWS Lambda cần kết nối tới cơ sở dữ liệu Amazon RDS for MySQL mà không lưu trữ bất kỳ mật khẩu cơ sở dữ liệu tĩnh nào trong Secrets Manager, SSM Parameter Store hay biến môi trường. Làm thế nào hàm Lambda có thể xác thực với cơ sở dữ liệu RDS MySQL bằng IAM Execution Role của nó?

**Đáp án đúng:** **D**

**RDS IAM Database Authentication**:
- Hỗ trợ MySQL, PostgreSQL, MariaDB, Aurora.
- Token có hiệu lực **15 phút**, kết nối qua **SSL/TLS**.
- Quyền IAM cần thiết: **`rds-db:connect`** trên `arn:aws:rds-db:<region>:<account>:dbuser:<dbi-resource-id>/<db-user>`.

- **A:** Sai vì MySQL không hiểu trực tiếp STS `SessionToken`; phải dùng `rds.generate_db_auth_token()`.
- **B:** Sai vì Role ARN là chuỗi công khai và không phải token xác thực.
- **C:** Sai vì S3 Object Lock không áp dụng cho RDS.
- **D (Đúng):** Đúng! **RDS IAM Database Authentication** cho phép sinh token xác thực tạm thời (hết hạn sau **15 phút**) bằng SDK (`generate_db_auth_token`) dựa trên IAM Execution Role của Lambda — không cần mật khẩu tĩnh.

</details>

### Câu 23 `medium`

A developer uses AWS KMS to digitally sign and verify software release packages (ensuring authenticity and integrity) using public-key cryptography, so external customers can verify the signature with a public key without having AWS credentials. Which type of AWS KMS key should be created?

- **A.** A Symmetric KMS key (`SYMMETRIC_DEFAULT`) with `GenerateDataKey` and `Decrypt` API calls.
- **B.** An Asymmetric KMS key with `KeyUsage` set to `SIGN_VERIFY` (e.g., `RSA_2048` or `ECC_NIST_P256`).
- **C.** An AWS Managed KMS Key (`aws/s3`) with `KeyUsage` set to `ENCRYPT_DECRYPT` for digital signature verification.
- **D.** An AWS Systems Manager Parameter Store `StringList` parameter containing a shared HMAC secret.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer sử dụng AWS KMS để ký số và xác minh các gói phát hành phần mềm (đảm bảo tính xác thực và toàn vẹn) bằng mật mã khóa công khai (public-key cryptography), để khách hàng bên ngoài có thể xác minh chữ ký bằng public key mà không cần thông tin xác thực AWS. Loại AWS KMS key nào nên được tạo?

**Đáp án đúng:** **B**

2 loại **AWS KMS Keys**:
- **Symmetric (`SYMMETRIC_DEFAULT`)**: AES-256, dùng cho mã hóa/giải mã nhanh trong AWS (`Encrypt`/`Decrypt`/`GenerateDataKey`), hỗ trợ **Automatic Key Rotation**.
- **Asymmetric (`RSA` / `ECC`)**: Dùng cho `ENCRYPT_DECRYPT` hoặc **`SIGN_VERIFY`** (ký số, chia sẻ Public Key ra ngoài), **không** hỗ trợ Automatic Key Rotation.

- **A:** Sai vì Symmetric key dùng chung 1 khóa bí mật (không có public key để khách hàng bên ngoài tự xác minh chữ ký).
- **B (Đúng):** Đúng! **Asymmetric KMS Key** (`SIGN_VERIFY`) tạo cặp khóa bất đối xứng (Private Key nằm an toàn trong KMS để gọi `kms:Sign`, còn Public Key tải về chia sẻ cho bên ngoài tự kiểm tra chữ ký `Verify` offline mà không cần tài khoản AWS).
- **C:** Sai vì AWS Managed Key `aws/s3` là khóa đối xứng chỉ dùng nội bộ cho dịch vụ S3.
- **D:** Sai vì Parameter Store không thực hiện ký số bất đối xứng.

</details>

### Câu 24 `medium`

A company stores PII (Personally Identifiable Information) in an Amazon DynamoDB table (`Customers`). To satisfy strict compliance requirements, the team must ensure that: (1) all data at rest is encrypted using a Customer-Managed KMS Key (CMK) owned by the company, and (2) sensitive fields like `ssn` are encrypted on the client side *before* leaving the application so that even AWS administrators or DynamoDB console viewers with read access cannot see the plaintext `ssn`. Which TWO actions meet these requirements? (Choose two.)

- **A.** Enable `ConsistentRead=True` on all `GetItem` and `Query` API calls to encrypt sensitive `ssn` attributes in transit and at rest.
- **B.** Use DynamoDB Streams with a Lambda trigger to encrypt `ssn` items after they have already been written in plaintext.
- **C.** Configure DynamoDB Encryption at Rest to use a Customer-Managed KMS Key (CMK) instead of the default AWS-owned key.
- **D.** Store the `ssn` value as the DynamoDB table's Partition Key in plaintext so it is indexed separately.
- **E.** Use the AWS Database Encryption SDK in the app to client-side encrypt and sign `ssn` before calling `PutItem`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ PII (Personally Identifiable Information) trong một bảng Amazon DynamoDB (`Customers`). Để đáp ứng các yêu cầu tuân thủ nghiêm ngặt, nhóm phải đảm bảo rằng: (1) toàn bộ dữ liệu khi lưu trữ (data at rest) được mã hóa bằng Customer-Managed KMS Key (CMK) thuộc sở hữu của công ty, và (2) các trường nhạy cảm như `ssn` được mã hóa ở phía client *trước khi* rời khỏi ứng dụng để ngay cả quản trị viên AWS hoặc người xem DynamoDB console có quyền đọc cũng không thể thấy `ssn` dạng plaintext. HAI hành động nào đáp ứng các yêu cầu này? (Chọn hai đáp án.)

**Đáp án đúng:** **C, E**

Hai lớp bảo mật **DynamoDB Encryption**:
1. **Server-Side Encryption at Rest**: AWS-owned (mặc định), AWS-managed (`aws/dynamodb`), hoặc **Customer-Managed CMK**.
2. **Client-Side Attribute Encryption**: Dùng **AWS Database Encryption SDK** để mã hóa từng trường nhạy cảm trước khi gọi `PutItem`.

- **A:** Sai vì `ConsistentRead` chỉ quyết định độ mới của dữ liệu đọc, không phải mã hóa.
- **B:** Sai vì dữ liệu đã ghi plaintext vào bảng trước đó rồi, không đáp ứng yêu cầu mã hóa trước khi rời ứng dụng.
- **C (Đúng):** Đúng! Mặc định DynamoDB mã hóa bằng AWS-owned key; chuyển sang **Customer-Managed KMS Key** giúp công ty tự kiểm soát chính sách khóa và theo dõi audit log trên CloudTrail.
- **D:** Sai vì Partition Key lưu plaintext sẽ làm lộ `ssn` cho bất kỳ ai xem được bảng hoặc log.
- **E (Đúng):** Đúng! **Client-Side Encryption (AWS Database Encryption SDK)** mã hóa trực tiếp trường `ssn` trên ứng dụng trước khi gửi tới DynamoDB, nên ngay cả người có quyền xem DynamoDB trên Console cũng chỉ thấy ciphertext.

</details>

### Câu 25 `medium`

A web application needs to restrict Amazon S3 object downloads so that ONLY requests coming through a specific **Amazon CloudFront** distribution are allowed, AND only if the user belongs to an active corporate session. Why does AWS recommend **Origin Access Control (OAC)** over the older Origin Access Identity (OAI)?

- **A.** OAC automatically makes the Amazon S3 bucket public so no S3 Bucket Policy is needed for CloudFront access.
- **B.** OAC bypasses CloudFront edge caching completely and forwards every `GET` request directly to the S3 origin.
- **C.** OAC is required in order to attach an AWS Certificate Manager (ACM) TLS certificate created in the `ap-southeast-1` Region.
- **D.** OAC supports all S3 Regions, SSE-KMS, and dynamic HTTP methods (`PUT`/`POST`/`DELETE`) with SigV4, unlike OAI.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng web cần giới hạn việc tải xuống object từ Amazon S3 sao cho CHỈ các request đi qua một **Amazon CloudFront** distribution cụ thể mới được phép, VÀ chỉ khi người dùng thuộc về một phiên làm việc công ty đang hoạt động. Tại sao AWS khuyến nghị **Origin Access Control (OAC)** thay cho Origin Access Identity (OAI) cũ hơn?

**Đáp án đúng:** **D**

**CloudFront OAC vs OAI**:
- Luôn chọn **OAC** cho thiết kế mới: hỗ trợ **SSE-KMS**, **SigV4**, mọi S3 Region, và HTTP `PUT`/`POST`/`DELETE`.

- **A:** Sai vì OAC giữ S3 bucket ở trạng thái **private** hoàn toàn và bắt buộc dùng Bucket Policy cho `cloudfront.amazonaws.com`.
- **B:** Sai vì OAC chỉ bảo mật kết nối giữa CloudFront và S3 Origin, không tắt caching.
- **C:** Sai vì ACM cho CloudFront vẫn bắt buộc ở `us-east-1`.
- **D (Đúng):** Đúng! **OAC (Origin Access Control)** là chuẩn mới thay thế OAI vì hỗ trợ đầy đủ **SSE-KMS**, hỗ trợ **SigV4**, hỗ trợ mọi **S3 Region** (kể cả opt-in regions), và hỗ trợ các method ghi (`PUT`, `POST`, `DELETE`) qua CloudFront.

</details>

### Câu 26 `medium`

An AWS Lambda function needs to send sensitive application events to an Amazon SQS queue. Security policy requires that all messages stored in the SQS queue be encrypted at rest using a Customer-Managed KMS Key (`CMK-SQS`), AND that the producer Lambda and consumer Lambda be the only entities allowed to use that key. Which SQS feature and KMS permissions should be configured?

- **A.** Enable S3 Bucket Keys on the Amazon SQS queue to reduce KMS key API requests during message encryption.
- **B.** Enable SQS SSE-KMS with `CMK-SQS`, and grant producer Lambda `kms:GenerateDataKey` + `kms:Decrypt` and consumer `kms:Decrypt`.
- **C.** Set `VisibilityTimeout` to 0 seconds on the SQS queue to automatically encrypt incoming messages in transit.
- **D.** Use `SQS-managed encryption (SSE-SQS)` with a custom AWS KMS Key Policy scoped to the producer and consumer IAM roles.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm AWS Lambda cần gửi các sự kiện ứng dụng nhạy cảm tới một hàng đợi Amazon SQS. Chính sách bảo mật yêu cầu tất cả các message lưu trữ trong hàng đợi SQS phải được mã hóa khi lưu trữ (at rest) bằng Customer-Managed KMS Key (`CMK-SQS`), VÀ chỉ producer Lambda và consumer Lambda là những thực thể duy nhất được phép sử dụng key đó. Tính năng SQS và các quyền KMS nào nên được cấu hình?

**Đáp án đúng:** **B**

**Amazon SQS Encryption**:
- **SSE-SQS**: Mặc định, miễn phí, AWS quản lý key.
- **SSE-KMS**: Dùng CMK của bạn (kiểm soát được ai được `SendMessage`/`ReceiveMessage` thông qua KMS Key Policy; tối ưu chi phí bằng `KmsDataKeyReusePeriodSeconds`).

- **A:** Sai vì Bucket Keys là tính năng của Amazon S3 (SQS có `KmsDataKeyReusePeriodSeconds` để giảm số lần gọi KMS).
- **B (Đúng):** Đúng! Bật **SSE-KMS** trên SQS queue sẽ tự động mã hóa nội dung message bằng `CMK-SQS`. Producer cần `kms:GenerateDataKey` (và `kms:Decrypt`), còn Consumer cần `kms:Decrypt` trên KMS key đó.
- **C:** Sai vì `VisibilityTimeout` không liên quan đến mã hóa.
- **D:** Sai vì `SSE-SQS` dùng khóa do AWS SQS quản lý, không cho phép viết custom Key Policy để giới hạn riêng producer/consumer.

</details>

### Câu 27 `medium`

An application retrieves a configuration parameter from AWS Systems Manager Parameter Store using `ssm:GetParameter`. The parameter is larger than 4 KB (around 6 KB) and the team wants it to automatically expire after 30 days with an EventBridge notification 7 days before expiration. Which Parameter Store tier must be used?

- **A.** Advanced parameter tier
- **B.** Standard parameter tier
- **C.** AWS AppConfig Free tier
- **D.** AWS Secrets Manager Standard tier

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng lấy một tham số cấu hình từ AWS Systems Manager Parameter Store bằng `ssm:GetParameter`. Tham số này lớn hơn 4 KB (khoảng 6 KB) và nhóm muốn nó tự động hết hạn sau 30 ngày kèm theo thông báo EventBridge 7 ngày trước khi hết hạn. Phải sử dụng cấp độ (tier) Parameter Store nào?

**Đáp án đúng:** **A**

So sánh **SSM Parameter Store Standard vs Advanced Tier**:
- **Standard**: Miễn phí, tối đa **10,000** params, kích thước tối đa **4 KB**, không có Parameter Policies.
- **Advanced**: Có phí ($0.05/param/tháng), tối đa **100,000** params, kích thước tối đa **8 KB**, có **Parameter Policies** (Expiration / NoChangeNotification).

- **A (Đúng):** Đúng! **SSM Parameter Store Advanced Tier** hỗ trợ giá trị tới **8 KB** (Standard chỉ 4 KB), cho phép lưu tới 100,000 tham số, và hỗ trợ **Parameter Policies** (tự động hết hạn TTL và phát cảnh báo EventBridge trước khi hết hạn).
- **B:** Sai vì Standard Tier giới hạn tối đa **4 KB** và không hỗ trợ Parameter Policies (expiration/notifications).
- **C:** Sai vì AppConfig không phải Parameter Store tier.
- **D:** Sai vì câu hỏi đang hỏi về tier của SSM Parameter Store.

</details>

### Câu 28 `medium`

A developer is writing an IAM policy to secure an Amazon S3 bucket (`corp-data`) and an AWS KMS key. To ensure no accidental data exposure occurs, which TWO statements accurately describe AWS IAM policy evaluation rules? (Choose two.)

- **A.** An Explicit Deny in any applicable policy (Identity, Resource, SCP, or Permissions Boundary) always overrides any `Allow`.
- **B.** By default, all requests start as Implicit Deny; an action is only allowed if there is an explicit `Allow` and no `Deny`.
- **C.** An `Allow` in an IAM Identity Policy overrides an Explicit `Deny` in an S3 Bucket Policy.
- **D.** The AWS Organizations Management Account is automatically restricted by Service Control Policies (SCPs) attached to the Organization Root.
- **E.** IAM Permissions Boundaries grant permissions by themselves without an Identity-based Policy.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer đang viết một IAM policy để bảo mật một Amazon S3 bucket (`corp-data`) và một AWS KMS key. Để đảm bảo không xảy ra rò rỉ dữ liệu ngoài ý muốn, HAI phát biểu nào mô tả chính xác các quy tắc đánh giá AWS IAM policy? (Chọn hai đáp án.)

**Đáp án đúng:** **A, B**

Các nguyên tắc vàng **IAM Policy Evaluation**:
1. Bắt đầu bằng **Implicit Deny**.
2. **Explicit Deny** ở bất kỳ đâu -> **DENY** ngay lập tức.
3. **SCP** không ảnh hưởng đến **Management Account**.
4. **Permissions Boundary** chỉ giới hạn tối đa, không tự cấp quyền.

- **A (Đúng):** Đúng! Quy tắc số 1 của AWS IAM: **Explicit Deny luôn thắng tuyệt đối** mọi `Allow` ở bất kỳ tầng policy nào.
- **B (Đúng):** Đúng! Mặc định mọi yêu cầu đều bị **Implicit Deny** (từ chối ngầm) trừ khi có một lệnh `Allow` hợp lệ và không có `Deny`.
- **C:** Sai hoàn toàn vì không có `Allow` nào vượt qua được Explicit `Deny`.
- **D:** Sai vì SCP **chỉ áp dụng cho Member Accounts**, không bao giờ giới hạn **Management Account**.
- **E:** Sai vì Permissions Boundary chỉ đặt **giới hạn trần**, tự nó không cấp quyền (`Allow`); vẫn cần Identity Policy cấp quyền.

</details>

### Câu 29 `medium`

A developer deploys a containerized microservice on Amazon ECS using the AWS Fargate launch type. The container fails to start with an `AccessDeniedException` when pulling the Docker image from Amazon ECR and fetching a database password from AWS Secrets Manager. However, the application code inside the container already has a Task IAM Role with DynamoDB permissions. Which configuration should the developer update to fix the startup failure?

- **A.** Attach `AmazonEC2ContainerRegistryReadOnly` and Secrets Manager permissions to the ECS Task IAM Role (`taskRoleArn`).
- **B.** Switch the ECS task definition network mode from `awsvpc` to `bridge` on AWS Fargate.
- **C.** Enable IMDSv2 (`HttpTokens: required`) on the AWS Fargate task definition settings.
- **D.** Attach ECR pull and Secrets Manager read permissions to the ECS Task Execution Role (`executionRoleArn`).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer triển khai một microservice đóng gói container trên Amazon ECS sử dụng launch type AWS Fargate. Container không khởi động được với lỗi `AccessDeniedException` khi pull Docker image từ Amazon ECR và lấy mật khẩu cơ sở dữ liệu từ AWS Secrets Manager. Tuy nhiên, mã ứng dụng bên trong container đã có một Task IAM Role với các quyền DynamoDB. Developer nên cập nhật cấu hình nào để khắc phục lỗi khởi động này?

**Đáp án đúng:** **D**

Phân biệt rõ 2 IAM Role của **Amazon ECS**:
- **Task Execution Role**: Dùng bởi **ECS Agent** (pull ECR image, đẩy log sang CloudWatch Logs, lấy secrets từ Secrets Manager/SSM vào biến môi trường).
- **Task IAM Role**: Dùng bởi **code ứng dụng bên trong container** khi gọi AWS SDK.

- **A:** Sai vì **Task IAM Role** chỉ cấp quyền cho code ứng dụng chạy bên trong container, không phải cho ECS Agent lúc pull image và inject secrets.
- **B:** Sai vì Fargate bắt buộc dùng `awsvpc` và lỗi ở đây là quyền IAM (`AccessDeniedException`), không phải network mode.
- **C:** Sai vì IMDSv2 áp dụng cho EC2 instance metadata, không liên quan đến quyền pull ECR image của ECS Agent.
- **D (Đúng):** Đúng! Trong ECS/Fargate, **Task Execution Role** cấp quyền cho **ECS Agent** thực hiện pull image từ ECR, ghi log lên CloudWatch Logs và inject secrets từ Secrets Manager/SSM lúc khởi tạo container.

</details>

### Câu 30 `easy`

A web application hosted on `https://app.example.com` tries to fetch JSON assets directly from `https://assets-bucket.s3.amazonaws.com` in the browser, but the browser blocks the request with a `No 'Access-Control-Allow-Origin' header` error. How should the developer fix this?

- **A.** Add an S3 Bucket Policy with `Condition: StringEquals aws:Referer` allowing `https://app.example.com`.
- **B.** Enable Amazon S3 Object Versioning on the bucket hosting the shared assets.
- **C.** Configure a CORS rule on the S3 bucket allowing `https://app.example.com` and the `GET` method.
- **D.** Enable Amazon S3 Server Access Logging to record cross-origin browser requests.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng web được lưu trữ tại `https://app.example.com` cố gắng lấy các tài nguyên JSON trực tiếp từ `https://assets-bucket.s3.amazonaws.com` trên trình duyệt, nhưng trình duyệt chặn request với lỗi `No 'Access-Control-Allow-Origin' header`. Developer nên khắc phục sự cố này như thế nào?

**Đáp án đúng:** **C**

Lỗi trình duyệt `Access-Control-Allow-Origin` khi gọi S3 từ domain khác -> cấu hình **S3 CORS**.

- **A:** Sai vì Bucket Policy không sinh ra CORS response headers cho trình duyệt.
- **B:** Sai, không liên quan đến CORS.
- **C (Đúng):** Đúng! Trình duyệt chặn request khác origin cho tới khi S3 bucket cấu hình **CORS** trả về header `Access-Control-Allow-Origin` hợp lệ.
- **D:** Sai, logging không sửa được lỗi CORS.

</details>

### Câu 31 `medium`

A company stores its production Amazon RDS PostgreSQL database credentials in AWS Secrets Manager. Security compliance requires that the database password be rotated automatically every 30 days with zero downtime for the application. How should the developer configure this automatic rotation?

- **A.** Enable AWS KMS automatic key rotation on the customer managed key encrypting the secret to rotate the RDS PostgreSQL user password every 30 days.
- **B.** Hardcode 12 pre-generated PostgreSQL passwords inside the application source code and switch credentials based on the current calendar month.
- **C.** Enable automatic 30-day rotation in AWS Secrets Manager using the managed Amazon RDS integration with the alternating users (two-user) rotation strategy.
- **D.** Migrate the RDS database credentials to an unencrypted Amazon S3 object and configure an S3 Lifecycle rule to expire and delete the object every 30 days.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ thông tin đăng nhập cơ sở dữ liệu Amazon RDS PostgreSQL production trong AWS Secrets Manager. Quy định tuân thủ bảo mật yêu cầu mật khẩu cơ sở dữ liệu phải được xoay vòng (rotate) tự động sau mỗi 30 ngày mà không gây gián đoạn (zero downtime) cho ứng dụng. Developer nên cấu hình việc xoay vòng tự động này như thế nào?

**Đáp án đúng:** **C**

Khi câu hỏi nhắc tới **Automatic password rotation cho RDS/Aurora/Redshift/DocumentDB** -> Đáp án luôn là **AWS Secrets Manager** (hỗ trợ cả chiến lược *Single user* và *Alternating users*).

- **A:** Sai vì KMS Key Rotation chỉ xoay vòng khóa mã hóa KMS mỗi năm 1 lần, không thay đổi giá trị mật khẩu cơ sở dữ liệu.
- **B:** Sai vì nhúng mật khẩu cứng trong code là lỗ hổng bảo mật nghiêm trọng.
- **C (Đúng):** Đúng! AWS Secrets Manager tích hợp gốc với Amazon RDS để xoay vòng mật khẩu tự động qua hàm Lambda управляемый, và chiến lược **Alternating Users (2 user luân phiên)** đảm bảo không làm đứt kết nối của các phiên đang chạy.
- **D:** Sai vì S3 Lifecycle chỉ xóa tệp chứ không thể đổi mật khẩu bên trong cơ sở dữ liệu RDS.

</details>

### Câu 32 `medium`

An IAM user belongs to two IAM groups (`Developers` and ` Contractors`). The `Developers` group has an identity-based policy that grants `Allow` for `s3:GetObject` and `s3:DeleteObject` on `arn:aws:s3:::company-reports/*`. However, the `Contractors` group has a policy that specifies an explicit `Deny` for `s3:DeleteObject` on `*`. Additionally, the `company-reports` S3 bucket has a bucket policy that allows `s3:*` for all principals in the AWS account. When this IAM user attempts to delete `q4-financials.pdf` from `company-reports`, what is the result?

- **A.** The request is allowed because the S3 bucket policy takes precedence over IAM group policies.
- **B.** The request is allowed because the user has two `Allow` statements versus only one `Deny` statement.
- **C.** AWS prompts the IAM user via STS to choose which IAM group policy (`Developers` or `Contractors`) should be evaluated for the S3 request.
- **D.** The request is denied because an explicit `Deny` in any applicable policy always overrides any `Allow`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một IAM user thuộc về hai IAM group (`Developers` và `Contractors`). Nhóm `Developers` có một identity-based policy cấp quyền `Allow` cho `s3:GetObject` và `s3:DeleteObject` trên `arn:aws:s3:::company-reports/*`. Tuy nhiên, nhóm `Contractors` lại có một policy chỉ định từ chối tường minh (`Deny`) cho `s3:DeleteObject` trên `*`. Ngoài ra, S3 bucket `company-reports` có một bucket policy cho phép `s3:*` đối với tất cả các principal trong tài khoản AWS. Khi IAM user này cố gắng xóa tệp `q4-financials.pdf` khỏi `company-reports`, kết quả sẽ là gì?

**Đáp án đúng:** **D**

Thứ tự ưu tiên **IAM Policy Evaluation Logic**:
1. Mặc định bắt đầu bằng **Implicit Deny**.
2. Nếu có bất kỳ **Explicit Deny** nào -> **DENY NGAY LẬP TỨC** (bất kể có bao nhiêu Allow).
3. Nếu không có Explicit Deny và có ít nhất một **Explicit Allow** (thỏa mãn cả SCP & Permissions Boundary nếu có) -> **ALLOW**.

- **A:** Sai vì S3 Bucket Policy `Allow` vẫn bị chặn đứng bởi `Explicit Deny` trong Identity-based Policy của nhóm `Contractors`.
- **B:** Sai vì IAM không tính theo đa số phiếu; chỉ cần 1 `Explicit Deny` là bị từ chối ngay lập tức.
- **C:** Sai vì mọi chính sách gắn với IAM User và tất cả các IAM Groups của user đó luôn được gộp chung lại khi đánh giá.
- **D (Đúng):** Đúng! Theo quy tắc đánh giá chính sách của AWS IAM (Policy Evaluation Logic), một lệnh **`Explicit Deny`** ở bất kỳ đâu (SCP, Permissions Boundary, Identity-based policy, Resource-based policy) luôn ghi đè mọi lệnh `Allow`.

</details>

### Câu 33 `medium`

An AWS Lambda function running inside a private VPC subnet attempts to call an external REST API on the internet and read parameters from AWS Systems Manager Parameter Store. Every invocation fails after 30 seconds with a `Task timed out after 30.00 seconds` error, even though the IAM execution role has full permissions. What is the MOST likely root cause?

- **A.** The private subnet route table lacks a route to a NAT Gateway or Systems Manager VPC Endpoint, causing outbound connections to hang until timeout.
- **B.** AWS Lambda functions are never permitted to initiate outbound HTTPS connections to external REST APIs regardless of VPC configuration.
- **C.** The Lambda execution IAM role policy is missing an explicit `Deny` statement for `ssm:GetParameter`, causing the SDK to retry until timeout.
- **D.** The Lambda function memory allocation is set to 512 MB instead of 128 MB, which throttles the ENI network bandwidth inside the private VPC subnet.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm AWS Lambda chạy bên trong một private VPC subnet cố gắng gọi một REST API bên ngoài trên internet và đọc các tham số từ AWS Systems Manager Parameter Store. Mọi lần gọi đều thất bại sau 30 giây với lỗi `Task timed out after 30.00 seconds`, mặc dù IAM execution role có đầy đủ quyền. Nguyên nhân gốc rễ CÓ KHẢ NĂNG CAO NHẤT là gì?

**Đáp án đúng:** **A**

Mẹo chẩn đoán lỗi Lambda cực nhanh trong đề thi:
- Báo lỗi **`AccessDeniedException` ngay lập tức** -> Lỗi thiếu quyền trong **IAM Execution Role**.
- Bị treo đúng bằng thời gian cấu hình rồi báo **`Task timed out`** (đặc biệt khi Lambda nằm trong VPC) -> Lỗi mạng (**Thiếu NAT Gateway**, **Thiếu VPC Endpoint**, hoặc **Security Group / NACL chặn**).

- **A (Đúng):** Đúng! Khi gắn Lambda vào VPC (Private Subnet), nếu Route Table không có đường đi ra **NAT Gateway** (để ra Internet) hoặc **VPC Endpoint** (để gọi dịch vụ AWS), mọi kết nối mạng sẽ bị treo cho tới khi hết thời gian chạy (`Task timed out`).
- **B:** Sai vì mặc định Lambda (khi không gắn vào VPC) luôn có quyền ra Internet bình thường.
- **C:** Sai vì nếu lỗi do thiếu quyền IAM thì hàm sẽ báo lỗi `AccessDeniedException` ngay lập tức (trong vài mili-giây) chứ không bị treo tới hết 30 giây Timeout.
- **D:** Sai vì bộ nhớ cao hơn chỉ làm hàm chạy nhanh hơn chứ không gây kẹt mạng.

</details>

### Câu 34 `hard`

A company deploys a REST API on Amazon API Gateway integrated with an AWS Lambda function using Lambda proxy integration. A single-page web application hosted at `https://app.example.com` sends a `POST` request with an `Authorization` header to `https://api.example.com`, but the browser blocks the response due to a Cross-Origin Resource Sharing (CORS) error. What must the developer do to fix this issue?

- **A.** Enable CORS in the API Gateway console for the POST method and redeploy the stage to inject `Access-Control-Allow-Origin` automatically without modifying the Lambda code.
- **B.** Configure the OPTIONS method in API Gateway for preflight requests AND update the Lambda function code to return the `Access-Control-Allow-Origin` header in its response object.
- **C.** Change the API Gateway endpoint type from Regional to Private and attach a resource policy allowing requests from `https://app.example.com` through an Interface VPC Endpoint.
- **D.** Enable API Gateway stage caching with a TTL of 0 seconds and configure a Gateway Response mapping template to forward the `Authorization` header to the backend.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty triển khai một REST API trên Amazon API Gateway tích hợp với hàm AWS Lambda sử dụng Lambda proxy integration. Một ứng dụng web single-page được lưu trữ tại `https://app.example.com` gửi một `POST` request kèm header `Authorization` đến `https://api.example.com`, nhưng trình duyệt chặn response do lỗi Cross-Origin Resource Sharing (CORS). Developer phải làm gì để khắc phục sự cố này?

**Đáp án đúng:** **B**

Điểm bẫy kinh điển trong đề DVA: Với **Lambda Proxy Integration (`AWS_PROXY`)**, bạn PHẢI trả về header `Access-Control-Allow-Origin` ngay bên trong code hàm Lambda (ngoài việc bật OPTIONS cho preflight request trên API Gateway).

- **A:** Sai vì với Lambda Proxy Integration (`AWS_PROXY`), API Gateway không tự động gắn response headers vào phương thức POST mà chuyển nguyên vẹn kết quả trả về từ hàm Lambda.
- **B (Đúng):** Đúng! Khi sử dụng Lambda Proxy Integration, chính code bên trong hàm Lambda phải trả về `headers: { 'Access-Control-Allow-Origin': 'https://app.example.com', ... }` trong JSON response của phương thức POST.
- **C:** Sai vì Private Endpoint chỉ cho phép gọi từ bên trong VPC thông qua Interface VPC Endpoint, không giải quyết lỗi CORS trên trình duyệt người dùng.
- **D:** Sai vì caching không liên quan đến cơ chế kiểm tra CORS header của trình duyệt.

</details>

### Câu 35 `hard`

An application needs to perform client-side encryption on a 50 MB database export file before uploading it to cloud storage, using an AWS KMS symmetric customer managed key (CMK). When the developer calls the `kms:Encrypt` API directly with the 50 MB payload, the request fails with a size limit error. How should the developer implement this encryption?

- **A.** Open an AWS Support quota increase request in Service Quotas to raise the `kms:Encrypt` API direct payload limit from 4 KB to 100 MB for the symmetric customer managed key.
- **B.** Recreate the AWS KMS customer managed key as an Asymmetric RSA-4096 key with `ENCRYPT_DECRYPT` usage and invoke `kms:Encrypt` directly with the 50 MB database export.
- **C.** Generate an AES-256 key locally, store it as an unencrypted `String` parameter in AWS Systems Manager Parameter Store, and encrypt the 50 MB file before uploading to storage.
- **D.** Use envelope encryption via `kms:GenerateDataKey` to obtain a plaintext and encrypted data key, encrypt the 50 MB file locally, clear the plaintext key, and store the encrypted key with the file.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng cần thực hiện client-side encryption trên một tệp xuất cơ sở dữ liệu 50 MB trước khi tải lên cloud storage, sử dụng một AWS KMS symmetric customer managed key (CMK). Khi developer gọi trực tiếp API `kms:Encrypt` với payload 50 MB, request thất bại với lỗi vượt quá giới hạn kích thước. Developer nên triển khai việc mã hóa này như thế nào?

**Đáp án đúng:** **D**

Con số vàng cần nhớ về AWS KMS: API `Encrypt` và `Decrypt` chỉ xử lý tối đa **4 KB** dữ liệu. Với tệp lớn hơn 4 KB, bắt buộc áp dụng **Envelope Encryption (Mã hóa phong bì)** bằng API `GenerateDataKey`.

- **A:** Sai vì giới hạn 4 KB của `kms:Encrypt` là giới hạn cứng (hard limit) không thể nâng.
- **B:** Sai vì khóa bất đối xứng RSA còn giới hạn kích thước dữ liệu mã hóa trực tiếp nhỏ hơn nữa.
- **C:** Sai vì lưu khóa mã hóa dạng văn bản thuần (`String`) không có cơ chế bảo vệ bằng KMS.
- **D (Đúng):** Đúng! API `kms:Encrypt` trực tiếp chỉ nhận tối đa 4 KB dữ liệu. Mọi dữ liệu > 4 KB đều phải dùng Envelope Encryption thông qua `kms:GenerateDataKey`.

</details>

---

[← Chủ đề 12](12-cognito-identity.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chủ đề 14 →](14-iac-cloudformation-sam-cdk.md)
