# Bài tập tình huống — Chủ đề 3: Mã hóa & Quản lý Bí mật — KMS, CloudHSM, Secrets Manager, SSM Parameter Store & ACM

> AWS KMS (SSE-KMS, Multi-Region Keys, S3 Bucket Keys), AWS CloudHSM (FIPS 140-2 Level 3), Secrets Manager Auto-Rotation, Parameter Store & ACM.
> **Số câu hỏi:** 14 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A healthcare company is subject to strict regulatory compliance that requires all cryptographic keys to be stored in a dedicated, single-tenant FIPS 140-2 Level 3 hardware security module (HSM) where the company retains exclusive control over the hardware and AWS personnel have zero access to the master keys. Which AWS service meets this requirement?

- **A.** AWS Key Management Service (KMS) with AWS Managed Keys
- **B.** AWS Secrets Manager
- **C.** AWS Artifact
- **D.** AWS CloudHSM

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty chăm sóc sức khỏe phải tuân thủ các quy định nghiêm ngặt, yêu cầu toàn bộ khóa mật mã phải được lưu trữ trong một mô-đun bảo mật phần cứng (HSM) chuẩn FIPS 140-2 Level 3 chuyên dụng, đơn thuê (single-tenant), nơi công ty giữ quyền kiểm soát độc quyền đối với phần cứng và nhân viên AWS hoàn toàn không có quyền truy cập vào các khóa chính (master key). Dịch vụ AWS nào đáp ứng yêu cầu này?

**Đáp án đúng:** **D**

Từ khóa nhận diện **AWS CloudHSM**: `single-tenant dedicated hardware`, `FIPS 140-2 Level 3 HSM`, `exclusive customer control of cryptographic hardware`, `SSL/TLS offloading`.

- **A:** Sai vì KMS chuẩn là dịch vụ chia sẻ đa khách hàng (multi-tenant) do AWS quản lý hạ tầng.
- **B:** Sai vì Secrets Manager dùng KMS để lưu chuỗi bí mật/mật khẩu chứ không phải thiết bị phần cứng HSM riêng biệt.
- **C:** Sai vì AWS Artifact là cổng tải báo cáo kiểm toán tuân thủ (ISO, SOC, PCI) chứ không lưu khóa mã hóa.
- **D (Đúng):** Đúng! **AWS CloudHSM** cung cấp thiết bị phần cứng HSM vật lý chuyên dụng (single-tenant) đạt chuẩn FIPS 140-2 Level 3 do khách hàng toàn quyền quản lý khóa.

</details>

### Câu 2 `medium`

A serverless application uses hundreds of concurrent AWS Lambda functions that connect to an Amazon RDS for MySQL database instance. During flash sales, Lambda concurrency spikes to 2,000, overwhelming the RDS database with new TCP/TLS connection handshakes and causing `Too many connections` errors. Which AWS solution resolves this connection exhaustion with minimal code changes?

- **A.** Migrate the relational MySQL database schema directly into Amazon S3 Glacier Deep Archive to eliminate connection limits.
- **B.** Deploy Amazon RDS Proxy and update the Lambda functions to connect to the RDS Proxy endpoint instead of the database endpoint directly.
- **C.** Increase the AWS Lambda function timeout to the maximum 15 minutes so each invocation holds its database connection open longer.
- **D.** Enable Multi-AZ on Amazon RDS so both the Primary and Standby instances simultaneously accept write connections from Lambda.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng serverless sử dụng hàng trăm hàm AWS Lambda chạy đồng thời kết nối tới một database instance Amazon RDS for MySQL. Trong các đợt flash sale, số lượng Lambda chạy đồng thời tăng vọt lên 2.000, làm quá tải cơ sở dữ liệu RDS với các bắt tay kết nối TCP/TLS mới và gây ra lỗi `Too many connections`. Giải pháp AWS nào khắc phục tình trạng cạn kiệt kết nối này với mức thay đổi mã nguồn tối thiểu?

**Đáp án đúng:** **B**

Từ khóa vàng của **Amazon RDS Proxy**: `Lambda functions exhausting database connections`, `connection pooling`, `faster failover (up to 66% reduction in failover time)`, `IAM authentication with Secrets Manager`.

- **A:** Sai vì S3 Glacier là dịch vụ lưu trữ tệp tin dài hạn, không phải cơ sở dữ liệu giao dịch.
- **B (Đúng):** Đúng! **Amazon RDS Proxy** gom và chia sẻ các kết nối vật lý tới cơ sở dữ liệu (Connection Pooling), bảo vệ RDS/Aurora khỏi bị quá tải kết nối khi hàng nghìn hàm Lambda khởi chạy đồng thời.
- **C:** Sai vì giữ kết nối mở lâu hơn càng làm cạn kiệt số lượng kết nối tối đa của RDS nhanh hơn.
- **D:** Sai vì Standby instance trong RDS Multi-AZ không bao giờ nhận lưu lượng ghi (Write).

</details>

### Câu 3 `medium`

A DevOps team deploys microservices using Amazon ECS on AWS Fargate. One microservice needs permission to read objects from a specific Amazon S3 bucket, while the ECS agent needs permission to pull container images from Amazon ECR. Which IAM configuration follows the principle of least privilege?

- **A.** Grant both S3 read and ECR pull permissions directly to the underlying EC2 Instance Profile.
- **B.** Grant S3 read permissions to the ECS Task Execution Role and ECR pull permissions to the ECS Task Role.
- **C.** Embed dedicated IAM user access keys and secret keys inside the Docker image environment variables.
- **D.** Grant S3 read permissions to the ECS Task Role and ECR pull permissions to the ECS Task Execution Role.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm DevOps triển khai các microservice bằng Amazon ECS trên AWS Fargate. Một microservice cần quyền đọc các object từ một Amazon S3 bucket cụ thể, trong khi ECS agent cần quyền kéo (pull) container image từ Amazon ECR. Cấu hình IAM nào tuân thủ nguyên tắc đặc quyền tối thiểu (least privilege)?

**Đáp án đúng:** **D**

Trong ECS: **Task Execution Role** = quyền cho hạ tầng ECS Agent (pull ECR, lấy Secrets Manager, ghi CloudWatch Logs); **Task Role** = quyền cho chính code ứng dụng trong container.

- **A:** Sai vì Fargate không dùng EC2 Instance Profile mà bạn quản lý, hơn nữa dùng chung Instance Profile vi phạm nguyên tắc least privilege.
- **B:** Sai vì bị đảo ngược vai trò của hai Role.
- **C:** Sai vì lưu Access Key tĩnh trong Docker image là lỗ hổng bảo mật nghiêm trọng.
- **D (Đúng):** Đúng! **ECS Task Role** cấp quyền cho code ứng dụng bên trong container (đọc S3), còn **ECS Task Execution Role** cấp quyền cho ECS Agent kéo image từ ECR và đẩy log lên CloudWatch.

</details>

### Câu 4 `medium`

A company hosts a static website in an Amazon S3 bucket behind an Amazon CloudFront distribution. The security team requires that users must NOT be able to bypass CloudFront and access the S3 bucket URL directly, and the S3 objects are encrypted using SSE-KMS. Which configuration should a solutions architect implement?

- **A.** Enable S3 Static Website Hosting on the bucket and configure a public-read bucket policy for all website assets.
- **B.** Attach a VPC Security Group directly to the Amazon S3 bucket allowing inbound HTTPS only from CloudFront IP ranges.
- **C.** Create a Gateway VPC Endpoint for CloudFront and attach an endpoint policy restricting direct S3 access.
- **D.** Configure CloudFront OAC, restrict the S3 bucket policy to CloudFront, and grant CloudFront KMS key permissions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ một trang web tĩnh trong Amazon S3 bucket phía sau Amazon CloudFront distribution. Nhóm bảo mật yêu cầu người dùng KHÔNG được phép bỏ qua CloudFront để truy cập trực tiếp URL của S3 bucket, và các S3 object được mã hóa bằng SSE-KMS. Solutions architect nên triển khai cấu hình nào?

**Đáp án đúng:** **D**

Bảo vệ S3 Origin sau CloudFront (đặc biệt khi dùng **SSE-KMS**) → Dùng **CloudFront Origin Access Control (OAC)**.

- **A:** Sai vì mở public-read cho phép người dùng truy cập thẳng vào S3 URL mà không qua CloudFront.
- **B:** Sai vì S3 bucket không hỗ trợ gắn Security Group.
- **C:** Sai vì Gateway VPC Endpoint chỉ dành cho kết nối từ trong VPC tới S3/DynamoDB.
- **D (Đúng):** Đúng! **Origin Access Control (OAC)** là cơ chế mới thay thế OAI, giúp khóa chặt S3 bucket chỉ cho phép CloudFront truy cập và hỗ trợ đầy đủ **SSE-KMS**.

</details>

### Câu 5 `medium`

A healthcare company encrypts millions of small files in an Amazon S3 bucket using SSE-KMS with a Customer Managed Key (CMK). Recently, the application has been experiencing `KMS.ThrottlingException` errors and high KMS API charges due to the massive number of `GenerateDataKey` and `Decrypt` requests. How can the solutions architect resolve the throttling and reduce KMS costs while keeping SSE-KMS enabled?

- **A.** Enable S3 Bucket Keys on the Amazon S3 bucket.
- **B.** Switch from SSE-KMS to SSE-S3.
- **C.** Replace the Customer Managed Key with an AWS Managed Key (`aws/s3`).
- **D.** Enable S3 Transfer Acceleration.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty chăm sóc sức khỏe mã hóa hàng triệu tệp nhỏ trong một Amazon S3 bucket bằng SSE-KMS với Customer Managed Key (CMK). Gần đây, ứng dụng gặp phải lỗi `KMS.ThrottlingException` và chi phí KMS API cao do số lượng lớn các yêu cầu `GenerateDataKey` và `Decrypt`. Làm thế nào solutions architect có thể khắc phục tình trạng throttling và giảm chi phí KMS trong khi vẫn bật SSE-KMS?

**Đáp án đúng:** **A**

Khi dùng **SSE-KMS** trên S3 với hàng triệu object nhỏ bị lỗi **KMS throttling** hoặc chi phí KMS API cao → Bật **S3 Bucket Keys**.

- **A (Đúng):** Đúng! **S3 Bucket Keys** tạo một khóa trung gian cấp Bucket để S3 tự mã hóa/giải mã, giúp giảm tới **99%** số lượng request gọi tới AWS KMS, loại bỏ lỗi throttling và giảm mạnh chi phí.
- **B:** Sai vì đề bài yêu cầu vẫn phải giữ nguyên **SSE-KMS** (while keeping SSE-KMS enabled).
- **C:** Sai vì `aws/s3` vẫn gọi KMS API cho mỗi object nếu không bật S3 Bucket Keys, và làm mất quyền kiểm soát Key Policy tùy chỉnh.
- **D:** Sai vì Transfer Acceleration chỉ tối ưu đường truyền mạng qua Edge Locations.

</details>

### Câu 6 `medium`

A company stores its Amazon RDS database credentials in AWS Secrets Manager. Security policy mandates that the database password must be automatically rotated every 30 days without any application downtime. Which solution meets this requirement with the least operational overhead?

- **A.** Move the credentials to AWS Systems Manager Parameter Store and enable its built-in RDS rotation feature.
- **B.** Store the password in an S3 bucket and write an EC2 cron job to update RDS monthly without downtime.
- **C.** Enable automatic rotation in AWS Secrets Manager for the RDS database secret with a 30-day rotation schedule.
- **D.** Enable AWS KMS automatic key rotation on the RDS encryption key every 30 days to refresh credentials.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ thông tin đăng nhập cơ sở dữ liệu Amazon RDS trong AWS Secrets Manager. Chính sách bảo mật bắt buộc mật khẩu cơ sở dữ liệu phải được tự động xoay vòng (rotate) mỗi 30 ngày mà không gây gián đoạn ứng dụng. Giải pháp nào đáp ứng yêu cầu này với chi phí vận hành thấp nhất?

**Đáp án đúng:** **C**

Cứ thấy yêu cầu **automatically rotate database credentials** → Chọn ngay **AWS Secrets Manager**.

- **A:** Sai vì SSM Parameter Store KHÔNG có tính năng tự động xoay mật khẩu tích hợp sẵn.
- **B:** Sai vì tự viết cron job tốn nhiều công sức vận hành và kém an toàn hơn Secrets Manager.
- **C (Đúng):** Đúng! **AWS Secrets Manager** tích hợp sẵn khả năng **tự động xoay mật khẩu (Auto-rotation)** cho RDS, Aurora và Redshift bằng hàm Lambda do AWS tạo sẵn.
- **D:** Sai vì KMS Key Rotation chỉ xoay khóa mã hóa KMS, không đổi mật khẩu đăng nhập của RDS.

</details>

### Câu 7 `hard`

A company has an encrypted Amazon EBS snapshot in Account A that was encrypted using the default AWS Managed Key (`aws/ebs`). The company needs to share this snapshot with Account B so Account B can launch an EC2 instance from it. Which TWO steps are required to accomplish this? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Directly share the original snapshot encrypted with the default `aws/ebs` key with Account B via EC2 console.
- **B.** Copy the snapshot in Account A and re-encrypt it using a Customer Managed Key (CMK) in AWS KMS.
- **C.** Disable encryption on the EBS snapshot in Account A before sharing it with Account B for EC2 launch.
- **D.** Update the CMK key policy to grant Account B permission to use the key, and share the new snapshot.
- **E.** Use AWS Transfer Family with an SFTP endpoint to copy the encrypted EBS snapshot directly to Account B.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có một Amazon EBS snapshot đã được mã hóa trong Account A bằng khóa mặc định AWS Managed Key (`aws/ebs`). Công ty cần chia sẻ snapshot này với Account B để Account B có thể khởi chạy EC2 instance từ đó. Cần thực hiện HAI bước nào để hoàn thành việc này? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Đây là bẫy kinh điển của KMS: **AWS Managed Key (`aws/ebs`, `aws/rds`) không chia sẻ được Cross-Account**. Phải **Copy Snapshot + Re-encrypt bằng CMK + Share CMK Key Policy**.

- **A:** Sai vì AWS không cho phép chia sẻ snapshot đang dùng `aws/ebs` sang tài khoản khác.
- **B (Đúng):** Đúng! Snapshot mã hóa bằng AWS Managed Key (`aws/ebs`) **KHÔNG THỂ** chia sẻ cross-account. Phải copy và mã hóa lại bằng **Customer Managed Key (CMK)**.
- **C:** Sai vì không thể giải mã (unencrypt) một EBS snapshot đã mã hóa.
- **D (Đúng):** Đúng! Sau khi mã hóa lại bằng CMK, phải cấp quyền sử dụng CMK cho Account B trong **KMS Key Policy** và chia sẻ snapshot cho Account B.
- **E:** Sai vì Transfer Family là dịch vụ SFTP cho S3/EFS, không dùng cho EBS snapshot.

</details>

### Câu 8 `medium`

A defense contractor must deploy an application on AWS that requires cryptographic keys to be stored on dedicated, single-tenant physical hardware validated to FIPS 140-2 Level 3. The contractor must retain exclusive control over the hardware and keys, and AWS must have zero access to the keys. Which service should the solutions architect recommend?

- **A.** AWS KMS with a Customer Managed Key
- **B.** AWS CloudHSM
- **C.** AWS Secrets Manager
- **D.** Amazon Macie

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà thầu quốc phòng phải triển khai một ứng dụng trên AWS yêu cầu lưu trữ khóa mật mã trên phần cứng vật lý chuyên dụng, đơn thuê (single-tenant) đạt chuẩn FIPS 140-2 Level 3. Nhà thầu phải giữ quyền kiểm soát độc quyền đối với phần cứng và khóa, và AWS hoàn toàn không có quyền truy cập vào khóa. Solutions architect nên đề xuất dịch vụ nào?

**Đáp án đúng:** **B**

Thấy từ khóa **single-tenant dedicated hardware**, **FIPS 140-2 Level 3**, hoặc **exclusive control over HSM** → **AWS CloudHSM**.

- **A:** Sai vì AWS KMS mặc định chạy trên hạ tầng multi-tenant do AWS quản lý (trừ khi dùng Custom Key Store kết nối tới CloudHSM).
- **B (Đúng):** Đúng! **AWS CloudHSM** cung cấp phần cứng HSM vật lý chuyên dụng (**single-tenant dedicated hardware**) đạt chuẩn **FIPS 140-2 Level 3**, khách hàng tự quản lý hoàn toàn khóa gốc.
- **C:** Sai vì Secrets Manager là dịch vụ quản lý mật khẩu/bí mật, sử dụng KMS bên dưới.
- **D:** Sai vì Macie dùng để phát hiện dữ liệu nhạy cảm PII trên S3.

</details>

### Câu 9 `medium`

An application running on Amazon EC2 instances connects to an Amazon RDS for PostgreSQL database. Compliance rules require that database credentials must never be stored in application code or environment variables, and the password must be automatically rotated every 30 days without application downtime. Which solution satisfies these requirements with the LEAST management effort?

- **A.** Store the database credentials as a SecureString in AWS Systems Manager Parameter Store, which natively rotates RDS passwords every 30 days.
- **B.** Encrypt the database password using an AWS KMS Customer Managed Key and store the ciphertext in the EC2 instance user data script.
- **C.** Store the credentials in an encrypted Amazon S3 bucket and write a cron job on the EC2 instance to change the RDS password monthly.
- **D.** Store the credentials in AWS Secrets Manager with 30-day automatic rotation and grant the EC2 instance profile read access.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng chạy trên các Amazon EC2 instance kết nối tới cơ sở dữ liệu Amazon RDS for PostgreSQL. Quy tắc tuân thủ yêu cầu thông tin đăng nhập cơ sở dữ liệu không bao giờ được lưu trong mã nguồn ứng dụng hoặc biến môi trường, và mật khẩu phải được tự động xoay vòng mỗi 30 ngày mà không gây gián đoạn ứng dụng. Giải pháp nào đáp ứng các yêu cầu này với nỗ lực quản lý ÍT NHẤT?

**Đáp án đúng:** **D**

Cần phân biệt rõ trong đề SAA-C03: **AWS Secrets Manager** hỗ trợ native **automatic rotation** cho RDS/Aurora/Redshift/DocumentDB, trong khi SSM Parameter Store chỉ lưu trữ và không có built-in rotation.

- **A:** Sai vì Parameter Store KHÔNG có tính năng tự động xoay vòng mật khẩu RDS tích hợp sẵn như Secrets Manager.
- **B:** Sai vì cách này không có cơ chế tự động xoay vòng mật khẩu mỗi 30 ngày.
- **C:** Sai vì phải tự viết và duy trì cron job, tốn nhiều công sức vận hành và dễ gây gián đoạn nếu không quản lý hai phiên bản mật khẩu đúng cách.
- **D (Đúng):** Đúng! AWS Secrets Manager tích hợp sẵn khả năng xoay vòng mật khẩu tự động (automatic rotation) cho Amazon RDS bằng Lambda và cho phép EC2 lấy secret an toàn qua IAM Role.

</details>

### Câu 10 `hard`

A financial services company must comply with strict regulatory requirements stating that all encryption keys used for Amazon EBS volumes and Amazon S3 objects must be generated and stored inside dedicated, single-tenant Hardware Security Modules (HSMs) that are FIPS 140-2 Level 3 validated, with the company retaining exclusive control over the HSMs. Which AWS service should the company use?

- **A.** Use AWS CloudHSM to provision dedicated single-tenant HSMs and integrate with AWS KMS using a Custom Key Store.
- **B.** Use standard AWS KMS Customer Managed Keys (CMKs) with automatic annual key rotation enabled.
- **C.** Use Amazon S3 Server-Side Encryption with Amazon S3 Managed Keys (SSE-S3) and EBS default encryption.
- **D.** Use AWS Certificate Manager (ACM) Private CA to generate symmetric encryption keys for EBS and S3.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty dịch vụ tài chính phải tuân thủ các quy định nghiêm ngặt yêu cầu toàn bộ khóa mã hóa dùng cho Amazon EBS volume và Amazon S3 object phải được tạo và lưu trữ bên trong các Hardware Security Module (HSM) chuyên dụng, đơn thuê (single-tenant) đạt chuẩn FIPS 140-2 Level 3, trong đó công ty giữ quyền kiểm soát độc quyền đối với các HSM. Công ty nên sử dụng dịch vụ AWS nào?

**Đáp án đúng:** **A**

Từ khóa quyết định trong câu hỏi là **dedicated, single-tenant HSM**, **FIPS 140-2 Level 3**, và **exclusive control** -> Đáp án là **AWS CloudHSM** (có thể kết nối với KMS Custom Key Store cho các dịch vụ AWS).

- **A (Đúng):** Đúng! AWS CloudHSM cung cấp thiết bị HSM vật lý dùng riêng (single-tenant) đạt chuẩn FIPS 140-2 Level 3 do khách hàng toàn quyền kiểm soát. Kết hợp với KMS Custom Key Store giúp dùng khóa đó để mã hóa EBS và S3.
- **B:** Sai vì AWS KMS chuẩn sử dụng HSM dùng chung (multi-tenant) do AWS quản lý, không phải single-tenant HSM thuộc toàn quyền kiểm soát của khách hàng.
- **C:** Sai vì SSE-S3 do AWS quản lý hoàn toàn khóa và không hỗ trợ EBS hay single-tenant HSM.
- **D:** Sai vì ACM Private CA dùng để cấp phát chứng chỉ số TLS/SSL (asymmetric PKI), không dùng để mã hóa dữ liệu trên EBS/S3.

</details>

### Câu 11 `hard`

A solutions architect is designing a multi-account AWS architecture where an application in Account A needs to read objects from an Amazon S3 bucket in Account B. The S3 bucket is encrypted using an AWS KMS Customer Managed Key (CMK) owned by Account B. Which TWO configurations are required for the application's IAM role in Account A to decrypt and read the objects? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Configure an S3 bucket ACL in Account B to grant public read access to the encrypted objects.
- **B.** Grant the IAM role in Account A `s3:GetObject` and `kms:Decrypt` permissions in its IAM policy.
- **C.** Enable AWS KMS automatic annual key rotation on the CMK in Account B to refresh cross-account trust.
- **D.** Update the KMS CMK key policy in Account B to allow the IAM role (or Account A) to perform `kms:Decrypt`.
- **E.** Re-encrypt the S3 objects using SSE-S3 so the IAM role in Account A does not need KMS permissions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một solutions architect đang thiết kế kiến trúc AWS đa tài khoản trong đó một ứng dụng ở Account A cần đọc các object từ một Amazon S3 bucket ở Account B. S3 bucket này được mã hóa bằng một AWS KMS Customer Managed Key (CMK) thuộc sở hữu của Account B. Cần HAI cấu hình nào để IAM role của ứng dụng trong Account A có thể giải mã và đọc các object? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Quy tắc vàng của **Cross-Account Access với KMS CMK**: Identity-based policy ở Account A phải cho phép (`s3:GetObject`, `kms:Decrypt`), VÀ resource-based policy ở Account B (S3 Bucket Policy + KMS Key Policy) cũng phải cho phép Account A/Role A.

- **A:** Sai vì cấp public read là vi phạm bảo mật và cũng không giải quyết được quyền giải mã KMS CMK.
- **B (Đúng):** Đúng! Khi truy cập tài nguyên cross-account, IAM Role ở Account A cần được cấp quyền `s3:GetObject` và `kms:Decrypt` trong identity-based policy của chính nó.
- **C:** Sai vì xoay vòng khóa không liên quan đến việc cấp quyền giải mã cross-account.
- **D (Đúng):** Đúng! Với quyền truy cập cross-account đối với KMS CMK, cả IAM policy ở Account A và KMS Key Policy ở Account B đều phải cho phép hành động `kms:Decrypt`.
- **E:** Sai vì yêu cầu bài toán là bucket đang dùng KMS CMK của Account B; đổi sang SSE-S3 sẽ làm thay đổi kiến trúc mã hóa đang yêu cầu.

</details>

### Câu 12 `medium`

A company uses AWS Organizations with 25 member accounts. The security team wants to enforce centralized firewall rules across all VPCs and standardize SSL/TLS certificate management for public-facing Application Load Balancers. Which TWO AWS services should the team use to achieve these goals with minimal manual effort? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Use AWS Resource Access Manager (RAM) to share a single Application Load Balancer across all 25 member accounts.
- **B.** Use Amazon GuardDuty to automatically deploy and enforce identical Security Group rules across every VPC.
- **C.** Use AWS Firewall Manager to centrally configure WAF rules, Shield Advanced, and VPC security groups across accounts.
- **D.** Store third-party SSL certificates in Amazon S3 and write Lambda functions in each account to upload them to IAM.
- **E.** Use AWS Certificate Manager (ACM) to provision, manage, and automatically renew public SSL/TLS certificates for ALBs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty sử dụng AWS Organizations với 25 member account. Nhóm bảo mật muốn áp dụng các quy tắc tường lửa tập trung trên tất cả các VPC và chuẩn hóa việc quản lý chứng chỉ SSL/TLS cho các Application Load Balancer công khai. Nhóm nên sử dụng HAI dịch vụ AWS nào để đạt được các mục tiêu này với nỗ lực thủ công tối thiểu? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

**AWS Firewall Manager** dùng để quản lý tập trung tường lửa (WAF, SG, Network Firewall, Shield) trên toàn AWS Organizations. **AWS Certificate Manager (ACM)** dùng để cấp phát và gia hạn tự động chứng chỉ TLS cho ALB/CloudFront.

- **A:** Sai vì AWS RAM không hỗ trợ chia sẻ Application Load Balancer giữa các tài khoản.
- **B:** Sai vì GuardDuty là dịch vụ phát hiện mối đe dọa, không triển khai cấu hình Security Group.
- **C (Đúng):** Đúng! AWS Firewall Manager tích hợp với AWS Organizations để triển khai và giám sát tập trung WAF, Shield Advanced, Security Groups và Network Firewall trên tất cả các tài khoản.
- **D:** Sai vì tốn công vận hành thủ công và không tận dụng tính năng tự động gia hạn của ACM.
- **E (Đúng):** Đúng! ACM cấp phát và tự động gia hạn chứng chỉ SSL/TLS công cộng miễn phí cho ALB, CloudFront và API Gateway.

</details>

### Câu 13 `hard`

An application encrypts sensitive customer records in `us-east-1` using an AWS KMS Customer Managed Key (CMK) and replicates the encrypted data to `eu-west-1` for disaster recovery. The application in `eu-west-1` must be able to decrypt the replicated data locally without making cross-Region API calls back to `us-east-1` and without re-encrypting the data during replication. Which KMS feature meets this requirement?

- **A.** AWS KMS Automatic Key Rotation
- **B.** AWS KMS Imported Key Material with single-Region keys
- **C.** Amazon S3 Server-Side Encryption with SSE-S3
- **D.** AWS KMS Multi-Region keys

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng mã hóa các bản ghi khách hàng nhạy cảm tại `us-east-1` bằng AWS KMS Customer Managed Key (CMK) và sao chép dữ liệu đã mã hóa sang `eu-west-1` để khôi phục thảm họa. Ứng dụng tại `eu-west-1` phải có thể giải mã dữ liệu đã sao chép ngay tại chỗ mà không cần thực hiện các lệnh gọi API liên Region về `us-east-1` và không cần mã hóa lại dữ liệu trong quá trình sao chép. Tính năng KMS nào đáp ứng yêu cầu này?

**Đáp án đúng:** **D**

Khi bài toán yêu cầu **mã hóa ở Region A và giải mã trực tiếp ở Region B không cần re-encrypt hay gọi API cross-Region** -> Đáp án là **AWS KMS Multi-Region keys**.

- **A:** Sai vì tính năng xoay vòng khóa tự động chỉ tạo key material mới hàng năm trong cùng một Region.
- **B:** Sai vì các khóa single-Region vẫn có Key ARN/ID khác nhau giữa các Region nếu không dùng Multi-Region key.
- **C:** Sai vì đề bài yêu cầu dùng KMS CMK để kiểm soát khóa và giải mã cục bộ ở cấp ứng dụng/dữ liệu đa Region.
- **D (Đúng):** Đúng! AWS KMS Multi-Region keys cho phép tạo các khóa có cùng key ID và key material ở nhiều Region khác nhau, giúp dữ liệu mã hóa ở Region này có thể giải mã trực tiếp ở Region khác mà không cần re-encrypt hay gọi API xuyên Region.

</details>

### Câu 14 `medium`

A company has a strict requirement that all Amazon S3 objects uploaded to a specific bucket must be encrypted at rest using AWS KMS, and any `PutObject` API call without KMS encryption headers must be rejected. Additionally, all data in transit to the bucket must use HTTPS. Which TWO statements should be included in the S3 bucket policy? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** An `Allow` statement for `Principal: "*"` on `s3:GetObject` when `aws:SecureTransport` is `true`.
- **B.** A `Deny` statement for `s3:PutObject` when `s3:x-amz-server-side-encryption` is not `aws:kms` (or is `Null`).
- **C.** A `Deny` statement for `s3:PutObject` when the object ACL header `s3:x-amz-acl` is set to `private`.
- **D.** A `Deny` statement for all `s3:*` actions when the condition `aws:SecureTransport` is `false`.
- **E.** An `Allow` statement for `kms:Decrypt` inside the S3 bucket policy to enforce KMS decryption.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có yêu cầu nghiêm ngặt rằng tất cả các Amazon S3 object tải lên một bucket cụ thể phải được mã hóa khi lưu trữ (at rest) bằng AWS KMS, và bất kỳ lệnh gọi `PutObject` API nào không có header mã hóa KMS phải bị từ chối. Ngoài ra, toàn bộ dữ liệu khi truyền (in transit) tới bucket phải sử dụng HTTPS. Nên đưa HAI câu lệnh (statement) nào vào S3 bucket policy? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Hai mẫu S3 Bucket Policy kinh điển trong SAA-C03: 1) Ép buộc HTTPS bằng **`Deny` khi `aws:SecureTransport == false`**; 2) Ép buộc mã hóa KMS khi upload bằng **`Deny` `s3:PutObject` khi `s3:x-amz-server-side-encryption != aws:kms`**.

- **A:** Sai vì `Principal: "*"` với `Allow` sẽ biến bucket thành public cho bất kỳ ai dùng HTTPS.
- **B (Đúng):** Đúng! Để ép buộc mọi object upload lên phải mã hóa bằng KMS, cần viết Bucket Policy từ chối (`Deny`) `s3:PutObject` nếu thiếu hoặc sai header `s3:x-amz-server-side-encryption: aws:kms`.
- **C:** Sai vì từ chối ACL private sẽ chặn các upload riêng tư hợp lệ.
- **D (Đúng):** Đúng! Điều kiện `aws:SecureTransport: false` kết hợp `Effect: Deny` là cách chuẩn để từ chối mọi kết nối HTTP không mã hóa, ép buộc sử dụng HTTPS/TLS.
- **E:** Sai vì hành động `kms:Decrypt` thuộc về KMS Key Policy, không phải S3 Bucket Policy.

</details>

---

[Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md)
