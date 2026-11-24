# Bài tập tình huống — Chủ đề 16: Giám sát, Truy vết & Chiến thuật thi — CloudWatch, X-Ray, OpenTelemetry & Exam Prep

> CloudWatch Logs Insights, Metrics, Alarms, AWS X-Ray, OpenTelemetry (ADOT), CloudTrail và chiến thuật làm bài thi.
> **Số câu hỏi:** 42 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A healthcare application encrypts sensitive patient records using the AWS KMS `Encrypt` API before storing them in Amazon DynamoDB. To prevent an attacker from swapping an encrypted ciphertext from one patient's DynamoDB item into another patient's item, and to record the `patientId` in AWS CloudTrail logs for auditing, which KMS feature should the developer use?

- **A.** Enable Automatic Key Rotation on the KMS key every 365 days and store the `patientId` in a separate DynamoDB GSI.
- **B.** Store the `patientId` as an AWS KMS Key Tag on the customer-managed key and filter CloudTrail logs by tag.
- **C.** Use `GenerateDataKeyWithoutPlaintext` instead of `Encrypt` and pass the `patientId` as the `KeySpec` parameter.
- **D.** Pass `{"patientId": "<id>"}` as the `EncryptionContext` parameter in both `Encrypt` and `Decrypt` API calls.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng y tế mã hóa các hồ sơ bệnh nhân nhạy cảm bằng AWS KMS `Encrypt` API trước khi lưu trữ chúng trong Amazon DynamoDB. Để ngăn kẻ tấn công hoán đổi bản mã (ciphertext) từ DynamoDB item của bệnh nhân này sang item của bệnh nhân khác, và để ghi lại `patientId` trong log AWS CloudTrail phục vụ kiểm toán, developer nên sử dụng tính năng KMS nào?

**Đáp án đúng:** **D**

**AWS KMS Encryption Context**:
- Là cặp key-value đóng vai trò **Additional Authenticated Data (AAD)**.
- Đảm bảo **tính toàn vẹn (integrity & authenticity)**: Nếu truyền sai `EncryptionContext` khi `Decrypt`, KMS sẽ từ chối giải mã.
- **Không được mã hóa** và được ghi lại nguyên văn trong **AWS CloudTrail** để phục vụ audit.

- **A:** Sai vì Key Rotation chỉ xoay vòng key material định kỳ mỗi năm, không chống tráo đổi ciphertext giữa các item.
- **B:** Sai vì Key Tag gắn ở cấp độ KMS Key dùng để quản lý/phân quyền ABAC, không gắn vào từng ciphertext riêng lẻ.
- **C:** Sai vì `GenerateDataKeyWithoutPlaintext` chỉ trả về Data Key đã mã hóa (không có plaintext key) để lưu trữ chứ không tự động ràng buộc ciphertext với `patientId`.
- **D (Đúng):** Đúng! `EncryptionContext` là tập cặp key-value (không bí mật) đóng vai trò Additional Authenticated Data (AAD). Khi giải mã bắt buộc phải truyền đúng `EncryptionContext` lúc mã hóa (chống tráo đổi ciphertext giữa các bản ghi), đồng thời giá trị này được ghi rõ vào AWS CloudTrail.

</details>

### Câu 2 `medium`

A third-party SaaS monitoring vendor needs read-only access to AWS CloudWatch metrics in your company's AWS account. You create an IAM Role in your account that trusts the vendor's AWS account. To protect against the 'confused deputy' problem (where another customer of the same vendor could trick the vendor into accessing your account), what should you require in the IAM Role's trust policy?

- **A.** Set `MaxSessionDuration` to 900 seconds on the IAM Role.
- **B.** Require `aws:MultiFactorAuthPresent: true` in the trust policy for the vendor's automated service.
- **C.** Create an IAM User with long-term Access Keys and share them with the vendor.
- **D.** Add a `Condition` checking `sts:ExternalId` with a unique secret string provided by the vendor.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà cung cấp dịch vụ giám sát SaaS bên thứ ba cần quyền truy cập chỉ đọc vào các chỉ số AWS CloudWatch trong tài khoản AWS của công ty bạn. Bạn tạo một IAM Role trong tài khoản của mình tin cậy tài khoản AWS của nhà cung cấp. Để bảo vệ khỏi vấn đề 'confused deputy' (nơi một khách hàng khác của cùng nhà cung cấp có thể đánh lừa nhà cung cấp truy cập vào tài khoản của bạn), bạn nên yêu cầu điều gì trong trust policy của IAM Role?

**Đáp án đúng:** **D**

**Confused Deputy Problem & `sts:ExternalId`**:
- Khi cấp quyền cross-account cho đối tác thứ 3 (Third-party SaaS), luôn thêm điều kiện `"StringEquals": {"sts:ExternalId": "<unique-id>"}` vào **Trust Policy** của IAM Role.
- Bên thứ 3 phải truyền đúng `ExternalId` này khi gọi `sts:AssumeRole`.

- **A:** Sai vì `MaxSessionDuration` chỉ giới hạn thời lượng token STS chứ không ngăn được confused deputy.
- **B:** Sai vì hệ thống SaaS tự động gọi `sts:AssumeRole` bằng máy chủ (không có người dùng nhập MFA) nên bắt buộc MFA sẽ làm hệ thống không hoạt động.
- **C:** Sai vì chia sẻ IAM User Access Keys dài hạn vi phạm bảo mật nghiêm trọng và không giải quyết bài toán cross-account role.
- **D (Đúng):** Đúng! `sts:ExternalId` trong Trust Policy là cơ chế chuẩn của AWS để chống tấn công **Confused Deputy** khi cấp quyền cross-account cho bên thứ ba (SaaS vendor).

</details>

### Câu 3 `medium`

A development team uses AWS CodeBuild to compile a Java Maven project and push a Docker image to Amazon ECR. Builds currently take 12 minutes because Maven downloads all dependencies from the internet on every run, and the Docker build fails with `Cannot connect to the Docker daemon`. Which TWO changes in `buildspec.yml` and the CodeBuild project configuration will fix the Docker error and speed up builds?

- **A.** Increase `computeType` to `BUILD_GENERAL1_LARGE` and set `imagePullCredentialsType` to `SERVICE_ROLE` without configuring any cache.
- **B.** Move `docker build` from the `build` phase to the `install` phase in `buildspec.yml` without enabling `PrivilegedMode`.
- **C.** Enable `PrivilegedMode` on the CodeBuild project environment and configure S3 caching for `/root/.m2/**/*` in `buildspec.yml`.
- **D.** Store the compiled Maven dependencies and Docker image layers inside `env.exported-variables` in `buildspec.yml`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm phát triển sử dụng AWS CodeBuild để biên dịch một dự án Java Maven và push một Docker image lên Amazon ECR. Các bản build hiện mất 12 phút vì Maven tải xuống tất cả các dependency từ internet trong mỗi lần chạy, và quá trình build Docker thất bại với lỗi `Cannot connect to the Docker daemon`. HAI thay đổi nào trong `buildspec.yml` và cấu hình dự án CodeBuild sẽ khắc phục lỗi Docker và tăng tốc độ build?

**Đáp án đúng:** **C**

Hai mẹo thi **AWS CodeBuild** kinh điển:
1. Build Docker image trong CodeBuild **BẮT BUỘC** bật **Privileged Mode** (`privilegedMode: true`).
2. Giảm thời gian build bằng **`cache`** trong `buildspec.yml` (S3 cache hoặc Local cache cho Docker layers / `/root/.m2` / `node_modules`).

- **A:** Sai vì không bật `PrivilegedMode` thì vẫn lỗi Docker daemon, và không có cache thì Maven vẫn tải lại thư viện từ đầu.
- **B:** Sai vì dù đặt ở phase nào, nếu không bật `PrivilegedMode` thì Docker daemon vẫn không chạy được bên trong container CodeBuild.
- **C (Đúng):** Đúng! Để chạy `docker build` trong CodeBuild bắt buộc phải bật **Privileged Mode** (`privilegedMode: true`). Đồng thời cấu hình `cache.paths: ['/root/.m2/**/*']` (hoặc Local Docker/Source cache) giúp lưu cache thư viện Maven giữa các lần build.
- **D:** Sai vì `exported-variables` chỉ truyền biến môi trường dạng text sang stage sau của CodePipeline, không lưu được Docker image.

</details>

### Câu 4 `medium`

A development team wants to manage dynamic feature flags for a production microservice. They need to validate the JSON configuration schema before deployment, roll out flag changes gradually to 10% of instances over 10 minutes, and automatically roll back the configuration change if a CloudWatch Alarm fires. Which AWS service provides these capabilities natively?

- **A.** AWS AppConfig
- **B.** AWS Systems Manager Parameter Store
- **C.** AWS Secrets Manager
- **D.** Amazon S3 with Versioning

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm phát triển muốn quản lý các feature flag động cho một microservice production. Họ cần xác thực JSON configuration schema trước khi triển khai, triển khai thay đổi flag dần dần tới 10% số instance trong 10 phút và tự động rollback thay đổi cấu hình nếu một CloudWatch Alarm kích hoạt. Dịch vụ AWS nào cung cấp sẵn các khả năng này?

**Đáp án đúng:** **A**

So sánh nhanh bộ ba cấu hình/bí mật trên AWS:
- **SSM Parameter Store**: Lưu cấu hình tĩnh, `SecureString`, miễn phí (Standard).
- **Secrets Manager**: Lưu mật khẩu/API key, hỗ trợ **tự động xoay vòng (Auto-rotation)**.
- **AWS AppConfig**: Quản lý **Feature Flags** & cấu hình động có **Validators**, **Gradual Rollout** và **Auto-Rollback** theo CloudWatch Alarm.

- **A (Đúng):** Đúng! AWS AppConfig (thuộc AWS Systems Manager) được thiết kế chuyên cho **Feature Flags & Dynamic Configuration**: hỗ trợ JSON Schema/Lambda Validators, triển khai dần dần (Deployment Strategy), và tự động rollback khi CloudWatch Alarm kích hoạt.
- **B:** Sai vì Parameter Store chỉ lưu key-value tĩnh, không có tính năng validate schema, rollout theo phần trăm (canary/linear) hay tự động rollback theo CloudWatch Alarm.
- **C:** Sai vì Secrets Manager chuyên dùng để lưu và xoay vòng thông tin bí mật (mật khẩu DB, API key), không dùng để rollout feature flag theo phần trăm.
- **D:** Sai vì S3 không có cơ chế rollout cấu hình theo chiến lược thời gian và rollback theo CloudWatch Alarm.

</details>

### Câu 5 `medium`

An AWS Lambda function handles 5,000 requests per second and needs to emit custom business metrics (such as `OrderValue` and `ItemsCount`) to Amazon CloudWatch Metrics. Calling `cloudwatch:PutMetricData` synchronously inside the Lambda handler adds 40 ms of latency per invocation and increases AWS SDK API costs. How can the developer publish custom metrics asynchronously with zero added API latency?

- **A.** Print structured JSON logs formatted according to the CloudWatch Embedded Metric Format (EMF) to `stdout`.
- **B.** Create a CloudWatch Logs Metric Filter without changing the log format, and increase Lambda memory to 10 GB.
- **C.** Send the metrics to AWS X-Ray annotations instead of CloudWatch.
- **D.** Call `cloudwatch:PutMetricData` inside an AWS Lambda Extension after returning the response, using `StorageResolution: 1`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm AWS Lambda xử lý 5.000 request mỗi giây và cần phát ra các custom business metric (như `OrderValue` và `ItemsCount`) tới Amazon CloudWatch Metrics. Việc gọi đồng bộ `cloudwatch:PutMetricData` bên trong Lambda handler làm tăng thêm 40 ms độ trễ cho mỗi lần gọi và tăng chi phí API của AWS SDK. Làm thế nào developer có thể xuất bản các custom metric bất đồng bộ mà không làm tăng thêm độ trễ API?

**Đáp án đúng:** **A**

**CloudWatch Embedded Metric Format (EMF)**:
- Ghi JSON theo chuẩn `_aws` ra `stdout` (dùng thư viện `aws-embedded-metrics`).
- CloudWatch Logs tự động tách thành **Custom Metrics** bất đồng bộ.
- **Lợi ích**: Không tốn thời gian chờ API `PutMetricData`, vừa có log chi tiết vừa có metric chính xác.

- **A (Đúng):** Đúng! CloudWatch **Embedded Metric Format (EMF)** cho phép Lambda ghi metric dưới dạng JSON chuẩn ra `stdout` (CloudWatch Logs). CloudWatch tự động trích xuất và tạo Custom Metrics bất đồng bộ mà không cần gọi API `PutMetricData`, giúp loại bỏ hoàn toàn độ trễ mạng.
- **B:** Sai vì tăng RAM lên 10 GB gây lãng phí chi phí; hơn nữa EMF linh hoạt hơn nhiều so với Metric Filter truyền thống (tự động hỗ trợ nhiều dimensions động).
- **C:** Sai vì X-Ray annotations dùng để lọc traces (và bị sampling), không tạo ra CloudWatch Custom Metrics để vẽ dashboard/alarm số lượng chính xác.
- **D:** Sai vì vẫn tốn chi phí gọi API `PutMetricData` (và High-Resolution `StorageResolution: 1` còn đắt hơn), trong khi EMF là giải pháp chuẩn được AWS khuyến nghị.

</details>

### Câu 6 `medium`

A company centralizes application logs from 50 AWS Lambda functions into Amazon CloudWatch Logs. The security team needs all log events containing the string `UNAUTHORIZED_ACCESS` to be streamed in near real-time to an Amazon OpenSearch Service cluster for security dashboards. Which CloudWatch Logs feature should be configured?

- **A.** Create a CloudWatch Logs Subscription Filter with the filter pattern `UNAUTHORIZED_ACCESS` targeting Amazon OpenSearch Service (or Kinesis Data Firehose).
- **B.** Create a CloudWatch Logs Export Task to Amazon S3 every 5 minutes and load the exported files into OpenSearch.
- **C.** Use scheduled CloudWatch Logs Insights queries to automatically push matching `UNAUTHORIZED_ACCESS` events to OpenSearch.
- **D.** Configure a CloudWatch Metric Filter on the log group to forward the full raw log messages to OpenSearch.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty tập trung log ứng dụng từ 50 hàm AWS Lambda vào Amazon CloudWatch Logs. Nhóm bảo mật cần tất cả các sự kiện log chứa chuỗi `UNAUTHORIZED_ACCESS` được stream theo thời gian gần thực tới một Amazon OpenSearch Service cluster để làm dashboard bảo mật. Tính năng nào của CloudWatch Logs nên được cấu hình?

**Đáp án đúng:** **A**

Phân biệt các tính năng **CloudWatch Logs**:
- **Subscription Filter**: Stream log **real-time** (lọc theo pattern) sang OpenSearch, Kinesis, hoặc Lambda.
- **Metric Filter**: Đếm/trích số liệu từ log để tạo **CloudWatch Alarm**.
- **Logs Insights**: Truy vấn/phân tích log nhanh bằng câu lệnh SQL-like.
- **Export to S3**: Xuất batch dữ liệu log lịch sử (không real-time).

- **A (Đúng):** Đúng! **CloudWatch Logs Subscription Filter** cho phép stream log theo thời gian thực (real-time) kèm biểu thức lọc tới tối đa 2 đích trên mỗi Log Group (Lambda, Kinesis Data Streams, Kinesis Data Firehose, hoặc OpenSearch Service).
- **B:** Sai vì `CreateExportTask` là cơ chế batch (chậm, có thể mất vài chục phút đến vài giờ) xuất ra S3, không phải streaming real-time.
- **C:** Sai vì Logs Insights là công cụ truy vấn tương tác/ad-hoc trên dữ liệu log đã lưu, không có tính năng stream real-time sang OpenSearch.
- **D:** Sai vì Metric Filter chỉ đếm/trích xuất giá trị số để tạo CloudWatch Metric, không forward nội dung log sang OpenSearch.

</details>

### Câu 7 `medium`

An application writes IoT sensor events to an Amazon DynamoDB table configured with Provisioned Capacity mode. During peak hours, CloudWatch shows `ProvisionedThroughputExceededException` errors even though total consumed WCU is only 40% of the table's provisioned WCU. Investigation reveals that 90% of writes target a single `deviceType` partition key (`"THERMOSTAT"`). Which TWO actions will resolve this hot partition bottleneck? (Choose two.)

- **A.** Redesign the partition key to achieve higher cardinality, such as combining `deviceType` with `deviceId` or adding a random suffix (write sharding).
- **B.** Implement exponential backoff with jitter in the client application when retrying throttled DynamoDB writes.
- **C.** Deploy Amazon DynamoDB Accelerator (DAX) in front of the table to buffer and distribute incoming write throughput.
- **D.** Convert the DynamoDB base table's `deviceType` partition key into a Global Secondary Index (GSI) with the exact same partition key.
- **E.** Enable DynamoDB Time to Live (TTL) on the table to automatically reduce write throttling on hot partitions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng ghi các sự kiện cảm biến IoT vào một bảng Amazon DynamoDB được cấu hình ở chế độ Provisioned Capacity. Trong giờ cao điểm, CloudWatch hiển thị lỗi `ProvisionedThroughputExceededException` mặc dù tổng WCU tiêu thụ chỉ bằng 40% WCU đã cấp phát của bảng. Điều tra cho thấy 90% lượt ghi nhắm vào một partition key `deviceType` duy nhất (`"THERMOSTAT"`). HAI hành động nào sẽ khắc phục nút thắt hot partition này? (Chọn hai đáp án.)

**Đáp án đúng:** **A, B**

Giới hạn vật lý của mỗi **DynamoDB Partition**: tối đa **1,000 WCU**, **3,000 RCU**, và **10 GB**.
Khi gặp **Hot Partition**:
1. Tăng **cardinality** của Partition Key (ví dụ `userId#timestamp` hoặc **Write Sharding**).
2. Dùng **Exponential Backoff with Jitter** khi retry.
3. Lưu ý: **DAX** chỉ giảm tải **đọc**, không giảm tải **ghi**.

- **A (Đúng):** Đúng! Một partition đơn lẻ của DynamoDB chỉ chịu tối đa **1,000 WCU** và **3,000 RCU**. Khi dồn 90% ghi vào cùng 1 Partition Key sẽ bị **Hot Partition**; cần tăng cardinality (ví dụ `deviceType#deviceId` hoặc thêm hậu tố ngẫu nhiên `0..N`) để phân tán đều dữ liệu ra nhiều partition.
- **B (Đúng):** Đúng! Khi gặp throttling thoáng qua (`ProvisionedThroughputExceededException`), ứng dụng nên sử dụng **Exponential Backoff with Jitter** (AWS SDK đã tích hợp sẵn và có thể tùy chỉnh số lần retry) để tránh dồn request cùng lúc.
- **C:** Sai vì DAX là write-through cache cho thao tác **đọc**, mọi thao tác ghi đều đi thẳng xuống DynamoDB nên không giải quyết được nghẽn ghi (write hot partition).
- **D:** Sai vì nếu GSI cũng dùng key có cardinality thấp giống hệt bảng chính thì GSI cũng sẽ bị throttle và thậm chí gây backpressure làm nghẽn ngược lại bảng chính.
- **E:** Sai vì TTL chỉ tự động xóa item hết hạn, không phân tán tải ghi.

</details>

### Câu 8 `medium`

A developer enables AWS X-Ray active tracing on both Amazon API Gateway and a downstream AWS Lambda function. In the X-Ray Service Map, the developer can see the time spent in API Gateway and the Lambda handler overall, but cannot see individual latency breakdowns for the Lambda function's calls to Amazon DynamoDB and an external payment REST API. What should the developer do?

- **A.** Include the AWS X-Ray SDK in the Lambda deployment package and wrap the AWS SDK clients and HTTP client calls to emit subsegments.
- **B.** Install and run the AWS X-Ray Daemon binary manually inside the Lambda handler function on every invocation.
- **C.** Enable Amazon CloudWatch Logs Insights on the Lambda log group to automatically generate DynamoDB subsegments.
- **D.** Add `xray:PutTelemetryRecords` to the Lambda Execution Role IAM policy without modifying the Lambda deployment package or source code.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer bật AWS X-Ray active tracing trên cả Amazon API Gateway và một hàm AWS Lambda phía sau. Trong X-Ray Service Map, developer có thể thấy tổng thời gian tiêu tốn ở API Gateway và Lambda handler, nhưng không thể thấy phân tích độ trễ chi tiết cho các lời gọi từ hàm Lambda tới Amazon DynamoDB và một REST API thanh toán bên ngoài. Developer nên làm gì?

**Đáp án đúng:** **A**

Cơ chế hoạt động **AWS X-Ray** trên **Lambda**:
- **Active Tracing** trên Lambda console: Tự động tạo Segment cho Lambda, nhưng **không tự trace** các lời gọi AWS SDK/HTTP bên trong code.
- **X-Ray SDK** (hoặc ADOT): Patch AWS SDK (`AWSXRay.captureAWS(AWS)`) và HTTP client (`captureHTTPsGlobal`) để sinh ra **Subsegments** hiển thị chi tiết từng node trên Service Map.
- Lưu ý: Lambda **không cần** tự cài X-Ray Daemon (EC2/ECS mới cần).

- **A (Đúng):** Đúng! Bật Active Tracing trên Lambda chỉ tự động ghi Segment tổng của Lambda (`Initialization`, `Invocation`). Để thấy chi tiết từng lệnh gọi DynamoDB, S3 hoặc external HTTP API, code Lambda phải sử dụng **AWS X-Ray SDK** (hoặc AWS Distro for OpenTelemetry) để tạo **Subsegments**.
- **B:** Sai vì môi trường AWS Lambda đã tích hợp sẵn X-Ray Daemon, lập trình viên chỉ cần thêm X-Ray SDK vào code (khác với EC2/ECS cần tự chạy X-Ray Daemon).
- **C:** Sai vì CloudWatch Logs Insights chỉ phân tích text logs, không tạo ra subsegments trên X-Ray Service Map.
- **D:** Sai vì nếu không instrument code bằng X-Ray SDK, hàm Lambda sẽ không gửi thông tin subsegment nào lên X-Ray.

</details>

### Câu 9 `medium`

A developer configures an Amazon API Gateway REST API with a **Lambda Proxy Integration**. When clients call the endpoint, API Gateway returns `HTTP 502 Bad Gateway` (`Internal server error`), even though CloudWatch Logs show the Lambda function completed without throwing any unhandled exception. What is the most likely cause?

- **A.** The AWS Lambda function execution exceeded Amazon API Gateway's hard 29-second integration timeout limit.
- **B.** The API client exceeded the API Gateway Usage Plan rate limit and burst quota configured on the stage.
- **C.** The Lambda function returned JSON that does not match the Lambda Proxy Integration schema (`statusCode`, `headers`, stringified `body`).
- **D.** The API client sent an expired Amazon Cognito User Pool JWT token in the `Authorization` request header.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer cấu hình một Amazon API Gateway REST API với **Lambda Proxy Integration**. Khi client gọi endpoint, API Gateway trả về `HTTP 502 Bad Gateway` (`Internal server error`), mặc dù CloudWatch Logs cho thấy hàm Lambda đã hoàn thành mà không ném ra bất kỳ unhandled exception nào. Nguyên nhân có khả năng nhất là gì?

**Đáp án đúng:** **C**

Bảng mã lỗi **API Gateway** hay thi:
- **`400 Bad Request`**: Sai schema Request Validator.
- **`401 / 403`**: Lỗi Authorizer / thiếu API Key / WAF chặn.
- **`429 Too Many Requests`**: Vượt ngưỡng Throttling / Usage Plan.
- **`502 Bad Gateway`**: Lambda Proxy trả về sai format (`statusCode`, `body` không phải string).
- **`504 Gateway Timeout`**: Backend chạy quá **29 giây** (hard limit).

- **A:** Sai vì quá giới hạn 29 giây của API Gateway sẽ trả về **`504 Gateway Timeout`**, không phải `502 Bad Gateway`.
- **B:** Sai vì vượt ngưỡng rate limit / throttling sẽ trả về **`429 Too Many Requests`**.
- **C (Đúng):** Đúng! Với **Lambda Proxy Integration**, API Gateway yêu cầu hàm Lambda trả về đúng cấu trúc `{ "statusCode": 200, "headers": {...}, "body": "<string>" }` (trong đó `body` phải là chuỗi JSON stringified, không phải object lồng nhau). Nếu sai định dạng này, API Gateway trả về **`502 Bad Gateway`**.
- **D:** Sai vì lỗi xác thực token sẽ trả về **`401 Unauthorized`** hoặc **`403 Forbidden`**.

</details>

### Câu 10 `medium`

An e-commerce application instrumented with the AWS X-Ray SDK wants to attach two pieces of data to each trace segment: (1) `orderTier` (e.g., `"GOLD"`, `"SILVER"`) so support engineers can filter traces in the X-Ray console using `annotation.orderTier = "GOLD"`, and (2) the full raw JSON shopping cart payload for debugging without needing to search by its fields. How should each piece of data be recorded in X-Ray?

- **A.** Record `orderTier` as X-Ray Metadata (indexed for filter expressions) and the raw JSON cart payload as an X-Ray Annotation string object.
- **B.** Record both `orderTier` and the raw JSON cart payload as custom AWS X-Ray Subsegment Names on the DynamoDB client.
- **C.** Pass both `orderTier` and the serialized JSON cart payload inside the `X-Amzn-Trace-Id` HTTP request header.
- **D.** Record `orderTier` as an X-Ray Annotation (indexed for filter expressions) and the raw JSON cart payload as X-Ray Metadata (not indexed).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng thương mại điện tử được tích hợp AWS X-Ray SDK muốn gắn hai loại dữ liệu vào mỗi trace segment: (1) `orderTier` (ví dụ: `"GOLD"`, `"SILVER"`) để kỹ sư hỗ trợ có thể lọc trace trong X-Ray console bằng `annotation.orderTier = "GOLD"`, và (2) toàn bộ JSON payload giỏ hàng thô để gỡ lỗi mà không cần tìm kiếm theo các trường của nó. Mỗi loại dữ liệu nên được ghi lại trong X-Ray như thế nào?

**Đáp án đúng:** **D**

So sánh **AWS X-Ray Annotations vs Metadata**:
- **Annotations**: Kiểu nguyên thủy (String, Number, Boolean), **ĐƯỢC INDEX**, dùng cho **Filter Expressions** (tối đa 50/trace).
- **Metadata**: Object/JSON bất kỳ, **KHÔNG INDEX**, chỉ dùng để xem thêm thông tin debug trong chi tiết trace.

- **A:** Sai ngược hoàn toàn: Metadata không search/filter được trên X-Ray console, còn Annotation không hỗ trợ object JSON lồng nhau phức tạp.
- **B:** Sai vì Subsegment Name dùng để đặt tên lời gọi dịch vụ con (như `DynamoDB` hoặc `PaymentAPI`), không dùng để nhồi JSON payload.
- **C:** Sai vì header `X-Amzn-Trace-Id` chỉ dùng để truyền `Root`, `Parent`, `Sampled` ID giữa các dịch vụ.
- **D (Đúng):** Đúng! Trong AWS X-Ray: **Annotations** là các cặp key-value đơn giản (string, number, boolean) được **đánh chỉ mục (indexed)** để tìm kiếm bằng Filter Expressions (tối đa 50 annotations/trace). **Metadata** lưu object/JSON tùy ý để xem chi tiết khi debug và **không được đánh chỉ mục**.

</details>

### Câu 11 `medium`

A high-traffic microservice handles 10,000 requests per second and uses AWS X-Ray for distributed tracing. Tracing 100% of requests is too expensive, so the team wants to trace only 1% of normal requests, EXCEPT for requests to the `/checkout` path, where they want 100% of requests traced. How should the developer configure this?

- **A.** Disable X-Ray Active Tracing on API Gateway and Lambda, and log custom trace JSON documents to Amazon S3 instead.
- **B.** Create a high-priority X-Ray Sampling Rule for `URLPath: /checkout*` at `1.0` Fixed Rate, and keep the default rule at `0.01`.
- **C.** Set `ReservoirSize` to `10,000` requests per second on the default X-Ray sampling rule and leave `FixedRate` set to `0.01` (1%).
- **D.** Configure an Amazon CloudWatch Metric Filter on the API Gateway log group to dynamically sample X-Ray traces.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một microservice lưu lượng cao xử lý 10.000 request mỗi giây và sử dụng AWS X-Ray để theo dõi phân tán. Việc trace 100% request quá tốn kém, nên nhóm chỉ muốn trace 1% các request thông thường, NGOẠI TRỪ các request tới đường dẫn `/checkout`, nơi họ muốn trace 100% request. Developer nên cấu hình điều này như thế nào?

**Đáp án đúng:** **B**

**AWS X-Ray Sampling Rules**:
- Mặc định: **Reservoir = 1 request/giây**, sau đó **Fixed Rate = 5%**.
- Có thể tạo **Custom Sampling Rules** theo `URLPath`, `HTTPMethod`, `ServiceName`, `Host`... Rule có **Priority số nhỏ hơn** sẽ được khớp trước.

- **A:** Sai vì tắt Active Tracing sẽ mất hoàn toàn Service Map và phân tích độ trễ của X-Ray.
- **B (Đúng):** Đúng! **AWS X-Ray Sampling Rules** đánh giá theo thứ tự `Priority` (số nhỏ hơn ưu tiên cao hơn). Đặt rule ưu tiên cao cho `/checkout*` với `FixedRate = 1.0` và rule mặc định với `FixedRate = 0.01` giúp kiểm soát chính xác chi phí tracing mà không bỏ sót giao dịch quan trọng.
- **C:** Sai vì `ReservoirSize: 10000` sẽ lấy mẫu tới 10,000 req/giây (gần như 100% toàn hệ thống), làm chi phí tăng vọt.
- **D:** Sai vì CloudWatch Metric Filter không điều khiển tỷ lệ sampling của X-Ray.

</details>

### Câu 12 `easy`

A developer needs to quickly find the top 10 slowest AWS Lambda invocations over the last 3 hours across a CloudWatch Log Group containing millions of `REPORT` log lines. Which AWS tool provides an interactive, purpose-built query language (`fields`, `filter`, `sort`, `limit`) to analyze these logs in seconds?

- **A.** Amazon CloudWatch Synthetics canary scripts
- **B.** AWS CloudTrail Event History queries
- **C.** Amazon CloudWatch Logs Insights
- **D.** AWS Config resource compliance rules

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer cần nhanh chóng tìm ra top 10 lần gọi AWS Lambda chậm nhất trong 3 giờ qua trên một CloudWatch Log Group chứa hàng triệu dòng log `REPORT`. Công cụ AWS nào cung cấp một ngôn ngữ truy vấn tương tác chuyên dụng (`fields`, `filter`, `sort`, `limit`) để phân tích các log này chỉ trong vài giây?

**Đáp án đúng:** **C**

**CloudWatch Logs Insights**:
- Công cụ truy vấn log tương tác nhanh nhất trên CloudWatch Logs.
- Tự động parse JSON logs và các trường đặc biệt của Lambda (`@duration`, `@billedDuration`, `@memorySize`, `@maxMemoryUsed`, `@billedDuration`).

- **A:** Sai vì CloudWatch Synthetics dùng để chạy canary scripts kiểm tra endpoint web/API định kỳ.
- **B:** Sai vì CloudTrail ghi lại lịch sử gọi API quản trị AWS (Control Plane), không lưu log `REPORT` hay duration của từng lần chạy Lambda.
- **C (Đúng):** Đúng! **CloudWatch Logs Insights** cho phép chạy truy vấn tương tác tốc độ cao trên hàng triệu dòng log với cú pháp như `filter @type = "REPORT" | sort @duration desc | limit 10`.
- **D:** Sai vì AWS Config theo dõi lịch sử thay đổi cấu hình tài nguyên AWS.

</details>

### Câu 13 `easy`

An application runs on Amazon EC2 instances. By default, Amazon CloudWatch displays CPU Utilization and Network metrics for the instances, but the operations team also needs to monitor **RAM (memory) utilization**, **disk space usage**, and stream `/var/log/app.log` to CloudWatch Logs. What must be installed and configured on the EC2 instances?

- **A.** Enable EC2 Detailed Monitoring (1-minute intervals) on the instances and view OS memory metrics in the CloudWatch console.
- **B.** Install the AWS X-Ray Daemon on the EC2 instances and attach the `AWSXRayDaemonWriteAccess` managed policy.
- **C.** Enable Amazon VPC Flow Logs on the EC2 subnet to capture memory utilization and `/var/log/app.log` entries.
- **D.** Install the unified Amazon CloudWatch Agent with an IAM Instance Profile granting `CloudWatchAgentServerPolicy`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng chạy trên các Amazon EC2 instance. Theo mặc định, Amazon CloudWatch hiển thị các chỉ số CPU Utilization và Network cho các instance, nhưng nhóm vận hành cũng cần giám sát **mức sử dụng RAM (bộ nhớ)**, **dung lượng ổ đĩa đã dùng** và stream tệp `/var/log/app.log` lên CloudWatch Logs. Cần phải cài đặt và cấu hình gì trên các EC2 instance?

**Đáp án đúng:** **D**

Kiến thức **EC2 Monitoring** hay thi:
- **Default EC2 Metrics** (Basic 5 phút / Detailed 1 phút): CPU, Network, Disk Read/Write Ops, Status Checks — **KHÔNG CÓ RAM và Disk Usage**.
- **Unified CloudWatch Agent**: Thu thập **RAM, Disk Usage**, custom OS metrics, và đẩy **Application Logs** về CloudWatch Logs.

- **A:** Sai vì Detailed Monitoring chỉ tăng tần suất thu thập từ 5 phút xuống 1 phút cho các metric mặc định, vẫn **không** có Memory hay Disk space.
- **B:** Sai vì X-Ray Daemon chỉ gửi trace segments phân tán, không thu thập RAM/Disk của hệ điều hành.
- **C:** Sai vì VPC Flow Logs chỉ ghi lại metadata lưu lượng mạng IP đi qua ENI.
- **D (Đúng):** Đúng! CloudWatch mặc định chỉ thu thập metric ở tầng hypervisor (CPU, Disk I/O, Network). Để thu thập **Memory (RAM)**, **Disk Space (tầng OS)** và đẩy file log lên CloudWatch Logs, bắt buộc phải cài **Unified CloudWatch Agent** kèm quyền IAM phù hợp (`CloudWatchAgentServerPolicy`).

</details>

### Câu 14 `medium`

An Amazon ECS Task Definition runs two containers in the same task on AWS Fargate: an `app` container (listening on port 8000) and an `xray-daemon` sidecar container (listening on UDP port 2000). How does the `app` container communicate with the `xray-daemon` sidecar container when using the `awsvpc` network mode?

- **A.** Use Docker `--link` (`links` in the ECS Task Definition) between the `app` and `xray-daemon` containers.
- **B.** Send UDP packets to `localhost:2000` (`127.0.0.1:2000`), since containers in an `awsvpc` task share the same network namespace and ENI.
- **C.** Route UDP trace traffic from the `app` container through an Application Load Balancer listener target group to reach the `xray-daemon` container.
- **D.** Use ECS Service Discovery (AWS Cloud Map) to resolve the DNS name of the `xray-daemon` sidecar container.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một Amazon ECS Task Definition chạy hai container trong cùng một task trên AWS Fargate: một container `app` (lắng nghe trên cổng 8000) và một sidecar container `xray-daemon` (lắng nghe trên cổng UDP 2000). Container `app` giao tiếp với sidecar container `xray-daemon` như thế nào khi sử dụng chế độ mạng `awsvpc`?

**Đáp án đúng:** **B**

Giao tiếp trong **ECS `awsvpc` mode**:
- Các container trong **cùng 1 Task**: Gọi nhau qua **`localhost:<port>`**.
- Các **ECS Services khác nhau**: Gọi qua **ALB/NLB**, **ECS Service Connect**, hoặc **AWS Cloud Map (Service Discovery)**.

- **A:** Sai vì `--link` (`links` trong Task Definition) chỉ dùng trong `bridge` mode trên EC2, **không** được hỗ trợ trong `awsvpc` mode.
- **B (Đúng):** Đúng! Trong **`awsvpc`** network mode (mặc định trên Fargate), cả Task được cấp 1 ENI duy nhất và tất cả container trong cùng Task chia sẻ chung **network namespace (`localhost` / `127.0.0.1`)**.
- **C:** Sai vì ALB không hỗ trợ UDP port 2000 và không cần đi vòng ra ALB khi hai container nằm chung 1 Task.
- **D:** Sai vì Service Discovery dùng để giao tiếp **giữa các ECS Services khác nhau**, không cần cho 2 container trong cùng 1 Task.

</details>

### Câu 15 `medium`

A developer uses AWS CloudTrail to investigate who deleted an Amazon DynamoDB table (`Users`) yesterday. When looking at the CloudTrail event history, the developer wants to also track **data-plane** operations (`PutItem`, `UpdateItem`, `DeleteItem`) on that DynamoDB table for compliance auditing. By default, what does CloudTrail log, and how can DynamoDB item-level operations be audited?

- **A.** AWS CloudTrail automatically logs all DynamoDB `PutItem`, `GetItem`, and `DeleteItem` Data Events by default across all regions at no extra cost.
- **B.** Enable Amazon Inspector on the DynamoDB table to record and audit all item-level `PutItem` and `DeleteItem` API calls.
- **C.** CloudTrail logs Management Events by default; to audit `PutItem`/`DeleteItem`, enable CloudTrail Data Events for DynamoDB.
- **D.** Use AWS X-Ray Sampling Rules to retain 100% of DynamoDB control-plane and item-level audit logs for 7 years.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer sử dụng AWS CloudTrail để điều tra xem ai đã xóa một bảng Amazon DynamoDB (`Users`) ngày hôm qua. Khi xem lịch sử sự kiện CloudTrail, developer cũng muốn theo dõi các thao tác **data-plane** (`PutItem`, `UpdateItem`, `DeleteItem`) trên bảng DynamoDB đó để kiểm toán tuân thủ. Theo mặc định, CloudTrail ghi lại những gì và làm thế nào để kiểm toán các thao tác ở cấp độ item của DynamoDB?

**Đáp án đúng:** **C**

Phân biệt **CloudTrail Management Events vs Data Events**:
- **Management Events** (Control Plane: `CreateTable`, `RunInstances`, `CreateRole`): Bật mặc định.
- **Data Events** (Data Plane: S3 `GetObject`/`PutObject`, Lambda `Invoke`, DynamoDB `PutItem`/`GetItem`): **Tắt mặc định**, phải bật thủ công trong Trail.

- **A:** Sai vì Data Events không bật mặc định (do khối lượng cực lớn) và có tính phí khi bật.
- **B:** Sai vì Amazon Inspector chỉ quét lỗ hổng phần mềm trên EC2, ECR, Lambda.
- **C (Đúng):** Đúng! Mặc định CloudTrail ghi lại **Management Events** (control plane, miễn phí 90 ngày gần nhất trong Event History). Các thao tác đọc/ghi item (`GetItem`, `PutItem`, `DeleteItem`) trên DynamoDB hoặc `GetObject`/`PutObject` trên S3 là **Data Events**, cần bật cấu hình Trail ghi Data Events.
- **D:** Sai vì X-Ray chỉ lưu traces tối đa 30 ngày và không thay thế CloudTrail audit logs.

</details>

### Câu 16 `medium`

A developer is creating an IAM policy for an AWS Lambda function that writes logs to Amazon CloudWatch Logs and reads items from a single DynamoDB table. Which AWS managed policy is specifically designed to grant ONLY the basic CloudWatch Logs permissions required by a Lambda function?

- **A.** `AWSLambdaBasicExecutionRole`
- **B.** `AWSLambdaVPCAccessExecutionRole`
- **C.** `AdministratorAccess`
- **D.** `AmazonDynamoDBFullAccess`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer đang tạo một IAM policy cho một hàm AWS Lambda ghi log vào Amazon CloudWatch Logs và đọc các item từ một bảng DynamoDB duy nhất. AWS managed policy nào được thiết kế chuyên biệt để cấp CHỈ các quyền CloudWatch Logs cơ bản cần thiết cho một hàm Lambda?

**Đáp án đúng:** **A**

Các AWS Managed Policies phổ biến cho **Lambda Execution Role**:
- **`AWSLambdaBasicExecutionRole`**: Chỉ ghi CloudWatch Logs.
- **`AWSLambdaVPCAccessExecutionRole`**: Ghi Logs + quản lý ENI trong VPC.
- **`AWSXRayDaemonWriteAccess`**: Ghi traces lên AWS X-Ray.

- **A (Đúng):** Đúng! **`AWSLambdaBasicExecutionRole`** chỉ cấp 3 quyền tối thiểu cho CloudWatch Logs (`logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents`), sau đó developer gắn thêm inline/managed policy tối thiểu cho DynamoDB.
- **B:** Sai nếu hàm Lambda không chạy trong VPC (policy này cấp thêm quyền tạo/xóa EC2 ENI cho VPC).
- **C:** Sai vì vi phạm nguyên tắc Least Privilege.
- **D:** Sai vì policy này không cấp quyền ghi CloudWatch Logs và cấp quá rộng quyền DynamoDB.

</details>

### Câu 17 `medium`

An AWS CodePipeline has a Source stage (GitHub), a Build stage (CodeBuild), and a Custom Validation stage that invokes an AWS Lambda function (`ValidateCompliance`) to check security tags on the build output. Currently, the pipeline stage stays stuck in `InProgress` for an hour and then times out, even though CloudWatch Logs show `ValidateCompliance` ran and exited cleanly! Why is CodePipeline stuck?

- **A.** The Lambda function must return an HTTP 200 API Gateway Lambda Proxy Integration JSON response object (`statusCode`, `body`).
- **B.** The Lambda function failed to call `codepipeline:PutJobSuccessResult` (or `PutJobFailureResult`) with the `jobId` from the event.
- **C.** AWS CodePipeline Lambda invoke actions require `PrivilegedMode: true` to be enabled in the function settings.
- **D.** The Lambda function must always be deployed in the `us-east-1` Region regardless of the CodePipeline Region.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một AWS CodePipeline có Source stage (GitHub), Build stage (CodeBuild) và Custom Validation stage gọi một hàm AWS Lambda (`ValidateCompliance`) để kiểm tra các tag bảo mật trên đầu ra của bản build. Hiện tại, stage của pipeline bị kẹt ở trạng thái `InProgress` trong một giờ rồi bị timeout, mặc dù CloudWatch Logs cho thấy `ValidateCompliance` đã chạy và kết thúc bình thường! Tại sao CodePipeline bị kẹt?

**Đáp án đúng:** **B**

Bẫy thi **AWS CodePipeline + Lambda Invoke Action**:
- Hàm Lambda **BẮT BUỘC** phải gọi **`codepipeline.put_job_success_result(jobId=...)`** hoặc **`put_job_failure_result(...)`**.
- Execution Role của Lambda phải có quyền `codepipeline:PutJobSuccessResult` và `codepipeline:PutJobFailureResult`.

- **A:** Sai vì CodePipeline không dùng định dạng API Gateway Proxy response.
- **B (Đúng):** Đúng! Khi CodePipeline gọi một **Lambda Action**, CodePipeline truyền một `CodePipeline.job.id` vào event và **chờ** hàm Lambda gọi lại API **`PutJobSuccessResult`** (hoặc `PutJobFailureResult`). Nếu Lambda chỉ `return` bình thường mà không gọi API này, CodePipeline sẽ treo cho đến khi hết timeout!
- **C:** Sai vì `PrivilegedMode` là thuộc tính của CodeBuild, không phải Lambda.
- **D:** Sai vì hàm Lambda phải nằm **cùng Region** với CodePipeline.

</details>

### Câu 18 `medium`

A developer is configuring AWS CodeDeploy for an in-place deployment to an EC2 Auto Scaling Group of 4 instances. The team wants CodeDeploy to deploy to 1 instance at a time (`CodeDeployDefault.OneAtATime`), and automatically roll back the deployment if the deployment fails or if a specific CloudWatch Alarm triggers during the rollout. How should this be configured?

- **A.** Add an `Alarms` block directly inside `appspec.yml` specifying the CloudWatch Alarm name and rollback triggers.
- **B.** Set `MinimumHealthyHosts` to `100%` for the `CodeDeployDefault.OneAtATime` deployment configuration.
- **C.** Configure an EventBridge rule to delete the EC2 Auto Scaling Group whenever the CloudWatch Alarm enters `ALARM`.
- **D.** In the Deployment Group, configure Alarm Configuration with the CloudWatch Alarm and enable Automatic Rollback (`DEPLOYMENT_STOP_ON_ALARM`).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer đang cấu hình AWS CodeDeploy cho một lần triển khai tại chỗ (in-place deployment) lên một EC2 Auto Scaling Group gồm 4 instance. Nhóm muốn CodeDeploy triển khai từng instance một (`CodeDeployDefault.OneAtATime`), và tự động rollback quá trình triển khai nếu việc triển khai thất bại hoặc nếu một CloudWatch Alarm cụ thể được kích hoạt trong quá trình triển khai. Điều này nên được cấu hình như thế nào?

**Đáp án đúng:** **D**

**CodeDeploy Deployment Group**:
- Cấu hình **Deployment Configuration** (`OneAtATime`, `HalfAtATime`, `AllAtOnce` hoặc custom `MinimumHealthyHosts`).
- Cấu hình **Alarms & Rollbacks** (`DEPLOYMENT_FAILURE`, `DEPLOYMENT_STOP_ON_ALARM`).

- **A:** Sai vì `appspec.yml` chỉ định `files`, `permissions`, và `hooks`; cấu hình CloudWatch Alarms và Rollback nằm trên **CodeDeploy Deployment Group** (khác với AWS SAM nơi `Alarms` nằm trong `DeploymentPreference`).
- **B:** Sai vì nếu đặt `MinimumHealthyHosts = 100%` thì CodeDeploy không thể dừng bất kỳ instance nào để deploy in-place (`OneAtATime` tương ứng tối đa 75% hoặc 3/4 instances healthy).
- **C:** Sai và gây sập toàn bộ dịch vụ.
- **D (Đúng):** Đúng! CodeDeploy **Deployment Group** hỗ trợ gắn **CloudWatch Alarms** và bật **Automatic Rollbacks** khi có lỗi (`DEPLOYMENT_FAILURE`) hoặc khi báo động kích hoạt (`DEPLOYMENT_STOP_ON_ALARM`), tự động deploy lại revision thành công gần nhất.

</details>

### Câu 19 `medium`

A team uses AWS CodePipeline with an Amazon S3 bucket as the Source stage (`PollForSourceChanges` vs EventBridge). Whenever a new `app.zip` is uploaded to S3, the team notices a delay of up to 2 minutes before CodePipeline starts, and wants immediate event-driven triggering. How should the S3 Source action be configured?

- **A.** Disable S3 Object Versioning on the source `app.zip` bucket so CodePipeline detects overwrites immediately.
- **B.** Enable CloudTrail Data Events (`s3:PutObject`) on the bucket and an EventBridge rule to trigger CodePipeline (`PollForSourceChanges: false`).
- **C.** Set `PollForSourceChanges: true` on the CodePipeline S3 Source action without configuring CloudTrail Data Events.
- **D.** Enable S3 Transfer Acceleration on the source bucket to push `app.zip` change events directly to CodePipeline.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm sử dụng AWS CodePipeline với một Amazon S3 bucket làm Source stage (`PollForSourceChanges` so với EventBridge). Bất cứ khi nào một tệp `app.zip` mới được tải lên S3, nhóm nhận thấy độ trễ lên đến 2 phút trước khi CodePipeline bắt đầu và muốn kích hoạt ngay lập tức theo sự kiện. S3 Source action nên được cấu hình như thế nào?

**Đáp án đúng:** **B**

**CodePipeline S3 Source Best Practices**:
- Bắt buộc bật **S3 Versioning**.
- Để trigger tức thì: Bật **CloudTrail Data Events** cho object đó + **EventBridge rule** -> `PollForSourceChanges: false`.

- **A:** Sai vì CodePipeline S3 Source **bắt buộc** bucket phải bật S3 Versioning.
- **B (Đúng):** Đúng! AWS khuyến nghị tắt `PollForSourceChanges` (chạy định kỳ chậm) và dùng **CloudTrail Data Events + EventBridge** để kích hoạt CodePipeline **tức thì** ngay khi file `app.zip` mới được upload lên S3 (chú ý S3 bucket cũng phải bật Versioning).
- **C:** Sai vì `PollForSourceChanges: true` chính là cơ chế polling định kỳ gây trễ.
- **D:** Sai vì Transfer Acceleration chỉ tăng tốc upload lên S3, không kích hoạt CodePipeline nhanh hơn.

</details>

### Câu 20 `medium`

An application runs on Amazon EC2 instances behind an Application Load Balancer and uses the AWS X-Ray SDK. However, no traces appear in the AWS X-Ray console, and the application logs show UDP connection errors on `127.0.0.1:2000`. What is missing?

- **A.** Amazon CloudWatch Logs Insights is disabled on the EC2 instance's application log group.
- **B.** The ALB Security Group is blocking inbound UDP port 2000 trace traffic from the public internet.
- **C.** AWS X-Ray only supports AWS Lambda functions and cannot trace applications running on Amazon EC2.
- **D.** The AWS X-Ray Daemon (or ADOT Collector) is not running on the EC2 instances, or the Instance Profile lacks `AWSXRayDaemonWriteAccess`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng chạy trên các Amazon EC2 instance phía sau một Application Load Balancer và sử dụng AWS X-Ray SDK. Tuy nhiên, không có trace nào xuất hiện trong AWS X-Ray console, và log ứng dụng hiển thị lỗi kết nối UDP trên `127.0.0.1:2000`. Điều gì đang bị thiếu?

**Đáp án đúng:** **D**

**X-Ray Daemon trên các nền tảng**:
- **AWS Lambda**: Tích hợp sẵn (không cần cài).
- **Elastic Beanstalk**: Chỉ cần bật `XRayEnabled: true` trong `.ebextensions`.
- **EC2 / On-Premises**: Phải **tự cài & chạy X-Ray Daemon** (lắng nghe UDP `2000`).
- **ECS**: Chạy X-Ray Daemon dưới dạng **sidecar container** trong Task Definition.

- **A:** Sai vì CloudWatch Logs Insights không thu thập UDP traces trên cổng 2000.
- **B:** Sai vì X-Ray Daemon chạy cục bộ trên EC2 (`127.0.0.1:2000`) và gửi dữ liệu ra X-Ray API qua **HTTPS (TCP 443)**, không nhận UDP từ internet qua ALB.
- **C:** Sai vì X-Ray hỗ trợ đầy đủ EC2, ECS, EKS, Elastic Beanstalk, Lambda, API Gateway...
- **D (Đúng):** Đúng! Khác với AWS Lambda (đã tích hợp sẵn X-Ray Daemon), trên **EC2 / ECS**, ứng dụng chỉ gửi UDP packets tới `127.0.0.1:2000` (hoặc `xray-daemon:2000`) và **bắt buộc phải chạy X-Ray Daemon** (cùng quyền IAM `xray:PutTraceSegments`) để gom và đẩy traces lên AWS X-Ray API.

</details>

### Câu 21 `medium`

A developer inspects an AWS Lambda function's CloudWatch Logs `REPORT` line: `Duration: 1850.20 ms Billed Duration: 1851 ms Memory Size: 512 MB Max Memory Used: 512 MB Init Duration: 420.15 ms`, followed by `Runtime exited with error: signal: killed`. What caused the Lambda failure and how should it be fixed?

- **A.** The Lambda function exceeded the maximum 15-minute (900-second) execution timeout.
- **B.** The Lambda function ran Out of Memory (OOM) (`Max Memory Used` hit `512 MB`); increase its Memory allocation (e.g., 1,024 MB).
- **C.** The Lambda function's IAM execution role lacked `iam:PassRole` permission at runtime.
- **D.** The Lambda function exceeded its 512 MB ephemeral `/tmp` disk storage limit during execution.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer kiểm tra dòng `REPORT` trong CloudWatch Logs của một hàm AWS Lambda: `Duration: 1850.20 ms Billed Duration: 1851 ms Memory Size: 512 MB Max Memory Used: 512 MB Init Duration: 420.15 ms`, theo sau là `Runtime exited with error: signal: killed`. Nguyên nhân gây ra lỗi Lambda là gì và nên khắc phục như thế nào?

**Đáp án đúng:** **B**

Đọc nhanh dòng **`REPORT` của AWS Lambda**:
- `Max Memory Used == Memory Size` + `signal: killed` -> **Out of Memory (OOM)** -> Tăng Memory.
- `Task timed out after X.XX seconds` -> **Timeout** -> Tăng `Timeout` (tối đa 900s) hoặc tối ưu code/Memory.
- `Init Duration`: Xuất hiện ở **Cold Start**.

- **A:** Sai vì `Duration` mới là 1,850 ms (~1.85 giây), chưa hề chạm timeout 15 phút (và timeout sẽ báo `Task timed out after X seconds`).
- **B (Đúng):** Đúng! Khi `Max Memory Used` bằng đúng `Memory Size` (512 MB) và tiến trình bị kill (`signal: killed`), đó là dấu hiệu kinh điển của lỗi **Out of Memory (OOM)**. Cần tăng **Memory Size** cho Lambda.
- **C:** Sai vì thiếu `iam:PassRole` xảy ra lúc deploy/tạo hàm, không phải lúc runtime với `Max Memory Used: 512 MB`.
- **D:** Sai vì hết `/tmp` sẽ báo lỗi `ENOSPC: no space left on device`, không phải `Max Memory Used: 512 MB`.

</details>

### Câu 22 `medium`

A Lambda function writes error logs to Amazon CloudWatch Logs whenever a payment fails (`PAYMENT_GATEWAY_ERROR`). The operations team wants to receive an immediate email alert via Amazon SNS whenever more than 10 `PAYMENT_GATEWAY_ERROR` occurrences appear in the logs within any 5-minute window. What is the simplest serverless setup to achieve this?

- **A.** Run a CloudWatch Logs Insights query manually every 5 minutes in the AWS Management Console.
- **B.** Export CloudWatch Logs to Amazon S3 every 24 hours and send an alert email via Amazon SES.
- **C.** Create a CloudWatch Logs Metric Filter for `PAYMENT_GATEWAY_ERROR` and a CloudWatch Alarm (`Sum > 10` in 5m) targeting SNS.
- **D.** Use AWS X-Ray Sampling Rules to detect `PAYMENT_GATEWAY_ERROR` strings and send alert emails directly.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm Lambda ghi log lỗi vào Amazon CloudWatch Logs bất cứ khi nào thanh toán thất bại (`PAYMENT_GATEWAY_ERROR`). Nhóm vận hành muốn nhận cảnh báo email ngay lập tức qua Amazon SNS bất cứ khi nào có hơn 10 lần xuất hiện `PAYMENT_GATEWAY_ERROR` trong log trong bất kỳ khoảng thời gian 5 phút nào. Thiết lập serverless đơn giản nhất để đạt được điều này là gì?

**Đáp án đúng:** **C**

**CloudWatch Logs Metric Filter -> CloudWatch Alarm -> SNS**: Mô hình chuẩn để cảnh báo khi có chuỗi lỗi/từ khóa xuất hiện quá ngưỡng trong log.

- **A:** Sai vì chạy thủ công không tự động cảnh báo.
- **B:** Sai vì xuất S3 mỗi 24 giờ quá chậm so với yêu cầu cảnh báo ngay trong cửa sổ 5 phút.
- **C (Đúng):** Đúng! **CloudWatch Logs Metric Filter** biến số lần xuất hiện chuỗi log thành **CloudWatch Metric**, từ đó gắn **CloudWatch Alarm** để bắn thông báo tới **SNS** khi vượt ngưỡng > 10 trong 5 phút.
- **D:** Sai vì X-Ray Sampling Rules không gửi email cảnh báo theo log pattern.

</details>

### Câu 23 `medium`

A team deploys an AWS Lambda function that stores its logs in Amazon CloudWatch Logs. After 2 years of operation, the CloudWatch Logs storage bill has grown significantly because the default log retention setting never expires old logs. How can the team reduce CloudWatch Logs storage costs while retaining recent logs for 30 days and archiving older logs for compliance?

- **A.** Remove the `logs:PutLogEvents` permission from the AWS Lambda function's IAM execution role.
- **B.** Stream and store all raw Lambda application logs permanently inside an Amazon DynamoDB table.
- **C.** Enable CloudWatch Detailed Monitoring on the CloudWatch Log Group to compress historical log data.
- **D.** Set the Log Group Retention Policy to `30 days` and export/stream logs to Amazon S3 (with Lifecycle to Glacier) for compliance.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm triển khai một hàm AWS Lambda lưu trữ log trong Amazon CloudWatch Logs. Sau 2 năm vận hành, hóa đơn lưu trữ CloudWatch Logs tăng lên đáng kể vì thiết lập lưu giữ log mặc định không bao giờ xóa log cũ. Làm thế nào nhóm có thể giảm chi phí lưu trữ CloudWatch Logs trong khi vẫn giữ lại log gần đây trong 30 ngày và lưu trữ (archive) log cũ hơn để tuân thủ quy định?

**Đáp án đúng:** **D**

**CloudWatch Logs Cost Optimization**:
- Mặc định Log Group giữ **`Never expire`** -> luôn đặt **Retention Policy** (ví dụ 7, 14, 30 ngày).
- Lưu trữ dài hạn nhiều năm: Đẩy sang **Amazon S3 + S3 Glacier**.

- **A:** Sai vì xóa quyền ghi log sẽ làm mất toàn bộ log debug kể cả log mới nhất.
- **B:** Sai vì lưu log thô lâu dài trong DynamoDB đắt hơn S3/Glacier rất nhiều.
- **C:** Sai vì Detailed Monitoring là tính năng của EC2 metrics, không làm giảm chi phí lưu trữ log.
- **D (Đúng):** Đúng! Mặc định CloudWatch Log Group đặt retention là **`Never expire`**. Đặt lại Retention thành **`30 days`** (chỉ giữ log nóng để debug) và đẩy bản sao sang **S3 + Glacier** (qua Kinesis Data Firehose Subscription Filter hoặc Export Task) sẽ tiết kiệm chi phí lưu trữ tối đa.

</details>

### Câu 24 `medium`

An AWS Lambda function (`OrderProcessor`) experiences sporadic `404` or `Timeout` failures only on cold starts when running inside a VPC, and the team wants to see **exact Cold Start (`Init Duration`)** percentages and p99 latency across all invocations in CloudWatch without writing custom parsing scripts. Which CloudWatch feature provides out-of-the-box Lambda cold start, memory, and error visualizations?

- **A.** Enable Amazon S3 Server Access Logging on the deployment bucket.
- **B.** Enable Amazon DynamoDB Contributor Insights on the state table.
- **C.** Enable Amazon CloudWatch Lambda Insights on the Lambda function.
- **D.** Enable Amazon VPC Flow Logs on the Lambda function's private subnets.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm AWS Lambda (`OrderProcessor`) thỉnh thoảng gặp lỗi `404` hoặc `Timeout` chỉ khi cold start lúc chạy bên trong VPC, và nhóm muốn xem tỷ lệ phần trăm **Cold Start (`Init Duration`) chính xác** cũng như độ trễ p99 trên tất cả các lần gọi trong CloudWatch mà không cần viết script phân tích tùy chỉnh. Tính năng CloudWatch nào cung cấp trực quan hóa sẵn có về cold start, bộ nhớ và lỗi của Lambda?

**Đáp án đúng:** **C**

**Amazon CloudWatch Lambda Insights**:
- Bật bằng 1 click (thêm Lambda Extension Layer + quyền `CloudWatchLambdaInsightsExecutionRolePolicy`).
- Theo dõi **Cold Starts, Memory %, CPU, Network** ở mức chi tiết hơn CloudWatch metrics mặc định.

- **A:** Sai vì S3 Access Logging chỉ ghi nhật ký truy cập S3 bucket.
- **B:** Sai vì Contributor Insights chỉ phân tích hot keys trên DynamoDB.
- **C (Đúng):** Đúng! **CloudWatch Lambda Insights** (chạy dưới dạng Lambda Extension) tự động thu thập các metric hệ thống chi tiết: Cold Start count/duration, CPU time, Memory utilization, Network I/O và hiển thị dashboard sẵn có.
- **D:** Sai vì VPC Flow Logs không đo `Init Duration` hay CPU/RAM của hàm Lambda.

</details>

### Câu 25 `medium`

A web application behind Amazon API Gateway and AWS Lambda needs end-to-end distributed tracing through an **Amazon SQS** queue: API Gateway -> Producer Lambda -> SQS Queue -> Consumer Lambda -> DynamoDB. When viewing the AWS X-Ray Service Map, the developer sees two disconnected traces instead of one unified end-to-end trace across SQS. Why?

- **A.** AWS X-Ray cannot trace Amazon DynamoDB SDK calls when invoked from an asynchronous AWS Lambda consumer.
- **B.** Amazon SQS strips all trace headers unless SQS Long Polling (`ReceiveMessageWaitTimeSeconds`) is set to `0`.
- **C.** Producer or Consumer Lambda is not propagating `AWSTraceHeader` (`X-Amzn-Trace-Id`) via SQS, or active tracing isn't enabled on both.
- **D.** API Gateway must use a `MOCK` integration instead of a Lambda Proxy integration for AWS X-Ray trace propagation to work.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng web phía sau Amazon API Gateway và AWS Lambda cần theo dõi phân tán đầu-cuối (end-to-end) xuyên qua một hàng đợi **Amazon SQS**: API Gateway -> Producer Lambda -> SQS Queue -> Consumer Lambda -> DynamoDB. Khi xem AWS X-Ray Service Map, developer thấy hai trace tách rời nhau thay vì một trace đầu-cuối thống nhất xuyên qua SQS. Tại sao?

**Đáp án đúng:** **C**

**AWS X-Ray Trace Propagation qua SQS**:
- Producer gửi kèm `AWSTraceHeader` (tự động khi patch AWS SDK bằng X-Ray SDK).
- Consumer Lambda đọc `AWSTraceHeader` từ SQS event record để nối Trace ID (tạo segment/subsegment liên kết).

- **A:** Sai vì X-Ray SDK hỗ trợ trace DynamoDB rất tốt.
- **B:** Sai vì Long Polling không ảnh hưởng đến `AWSTraceHeader`.
- **C (Đúng):** Đúng! Khi đi qua hàng đợi bất đồng bộ như SQS, AWS Lambda/X-Ray SDK truyền `AWSTraceHeader` trong system attribute của SQS message. Cần bật **Active Tracing** trên cả Producer & Consumer Lambda và dùng X-Ray SDK / ADOT đúng cách (hoặc liên kết trace context từ SQS record) để nối liền Service Map.
- **D:** Sai vì `MOCK` integration không gọi xuống Lambda.

</details>

### Câu 26 `medium`

A developer uses Amazon CloudWatch Synthetics to monitor a public checkout API (`https://api.example.com/checkout`). The developer wants a headless browser / API script to run every 5 minutes from AWS and trigger a CloudWatch Alarm if the checkout flow breaks or takes longer than 3 seconds, even when no real users are visiting the site. Which CloudWatch feature implements this?

- **A.** Use Amazon CloudWatch Logs Insights queries scheduled every 5 minutes to check endpoint availability.
- **B.** Use AWS CloudTrail Insights to monitor endpoint latency and 24/7 availability anomalies.
- **C.** Enable Amazon S3 Event Notifications on the web application bucket to verify HTTP responses.
- **D.** Create a CloudWatch Synthetics Canary (Node.js or Python script) running on a 5-minute schedule.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer sử dụng Amazon CloudWatch Synthetics để giám sát một API thanh toán công khai (`https://api.example.com/checkout`). Developer muốn một headless browser / API script chạy mỗi 5 phút từ AWS và kích hoạt CloudWatch Alarm nếu luồng thanh toán bị hỏng hoặc mất hơn 3 giây, ngay cả khi không có người dùng thực nào truy cập trang web. Tính năng CloudWatch nào triển khai điều này?

**Đáp án đúng:** **D**

**Amazon CloudWatch Synthetics Canaries**: Kiểm tra chủ động (proactive monitoring) 24/7 cho endpoint web, API, broken links, visual regression; kết quả lưu ảnh chụp/HAR lên S3 và phát CloudWatch Metrics (`SuccessPercent`, `Duration`).

- **A:** Sai vì Logs Insights chỉ truy vấn log thụ động khi có user thật gọi hệ thống.
- **B:** Sai vì CloudTrail Insights chỉ theo dõi bất thường API quản trị AWS.
- **C:** Sai vì S3 Event Notifications không kiểm tra endpoint web/API.
- **D (Đúng):** Đúng! **CloudWatch Synthetics Canaries** là các script kiểm thử tự động (dùng Puppeteer/Playwright hoặc API script) chạy định kỳ (ví dụ mỗi 5 phút) để kiểm tra tính sẵn sàng, độ trễ và luồng giao dịch web/API 24/7.

</details>

### Câu 27 `medium`

A developer uses AWS CloudWatch Alarms to monitor an Amazon SQS queue (`OrdersQueue`). The team wants an alarm to trigger whenever messages are sitting unprocessed in the queue for more than 10 minutes (indicating that consumers are stuck or too slow). Which SQS CloudWatch metric should the alarm monitor?

- **A.** `NumberOfEmptyReceives` (empty poll count)
- **B.** `ApproximateAgeOfOldestMessage`
- **C.** `SentMessageSize` (payload size in bytes)
- **D.** `NumberOfMessagesDeleted` (processed count)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer sử dụng AWS CloudWatch Alarms để giám sát một hàng đợi Amazon SQS (`OrdersQueue`). Nhóm muốn một cảnh báo được kích hoạt bất cứ khi nào có các message nằm chưa được xử lý trong hàng đợi quá 10 phút (cho thấy các consumer đang bị kẹt hoặc quá chậm). Cảnh báo nên giám sát chỉ số CloudWatch nào của SQS?

**Đáp án đúng:** **B**

Các CloudWatch Metrics quan trọng của **Amazon SQS**:
- **`ApproximateAgeOfOldestMessage`**: Phát hiện consumer bị kẹt/chậm.
- **`ApproximateNumberOfMessagesVisible`**: Số lượng tin nhắn đang chờ xử lý (dùng để Auto Scale ECS/EC2 workers).

- **A:** Sai vì `NumberOfEmptyReceives` đếm số lần consumer poll nhưng hàng đợi rỗng.
- **B (Đúng):** Đúng! **`ApproximateAgeOfOldestMessage`** đo tuổi (tính bằng giây) của tin nhắn cũ nhất chưa bị xóa trong SQS queue — đây là chỉ số chính xác nhất để phát hiện consumer bị kẹt hoặc xử lý không kịp.
- **C:** Sai vì `SentMessageSize` đo kích thước (bytes) của tin nhắn gửi vào.
- **D:** Sai vì `NumberOfMessagesDeleted` chỉ đếm số tin nhắn đã xử lý xong và xóa.

</details>

### Câu 28 `medium`

A developer creates an Amazon CloudWatch Alarm on an EC2 instance's `CPUUtilization` metric (threshold > 80% for 2 consecutive 5-minute periods). Occasionally, when an EC2 instance is stopped or experiences a brief telemetry gap, the alarm transitions to `INSUFFICIENT_DATA` instead of `OK` or `ALARM`, confusing the monitoring dashboard. Which CloudWatch Alarm setting controls how missing data points are evaluated?

- **A.** Change the CloudWatch Alarm `Statistic` from `Average` to `Maximum` or `SampleCount`.
- **B.** Configure Treat missing data as (`TreatMissingData`: `notBreaching`, `breaching`, `ignore`, or `missing`).
- **C.** Set the CloudWatch Alarm `Period` to `1` second for standard 5-minute EC2 metrics.
- **D.** Attach an Amazon SQS Dead-Letter Queue directly to the Amazon CloudWatch Alarm notification configuration.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer tạo một Amazon CloudWatch Alarm trên chỉ số `CPUUtilization` của một EC2 instance (ngưỡng > 80% trong 2 chu kỳ 5 phút liên tiếp). Thỉnh thoảng, khi một EC2 instance bị dừng hoặc gặp khoảng trống telemetry ngắn, cảnh báo chuyển sang trạng thái `INSUFFICIENT_DATA` thay vì `OK` hoặc `ALARM`, gây nhầm lẫn cho dashboard giám sát. Thiết lập CloudWatch Alarm nào kiểm soát cách các điểm dữ liệu bị thiếu được đánh giá?

**Đáp án đúng:** **B**

**CloudWatch Alarm `TreatMissingData`**:
- `missing` (mặc định): Chuyển sang `INSUFFICIENT_DATA`.
- `notBreaching`: Coi như nằm trong ngưỡng an toàn (rất hữu ích cho metric `Errors` của Lambda khi không có lỗi nào xảy ra!).
- `breaching`: Coi như vi phạm ngưỡng (`ALARM`).
- `ignore`: Giữ nguyên trạng thái trước đó.

- **A:** Sai vì đổi hàm thống kê không thay đổi cách xử lý khi hoàn toàn không có điểm dữ liệu nào.
- **B (Đúng):** Đúng! Thuộc tính **`TreatMissingData`** của CloudWatch Alarm cho phép chọn cách xử lý khi thiếu dữ liệu: `notBreaching` (coi là bình thường `OK`), `breaching` (coi là vượt ngưỡng `ALARM`), `ignore` (giữ nguyên trạng thái hiện tại), hoặc `missing` (mặc định -> `INSUFFICIENT_DATA`).
- **C:** Sai vì đặt Period 1 giây trên metric tiêu chuẩn (5 phút/1 phút) càng tạo ra nhiều khoảng trống thiếu dữ liệu hơn.
- **D:** Sai vì DLQ không thay đổi trạng thái `INSUFFICIENT_DATA`.

</details>

### Câu 29 `medium`

An AWS Lambda function (`OrderHandler`) is experiencing intermittent `500` errors, and the developer wants to quickly correlate logs, traces, and performance metrics across API Gateway, Lambda, and DynamoDB. Which TWO AWS observability practices help isolate the bottleneck and root cause? (Choose two.)

- **A.** Print unstructured plain-text logs with no request IDs and download raw log files manually from Amazon S3.
- **B.** Use Structured JSON Logging (Lambda Powertools) with `requestId`, `traceId`, `orderId`, and query with CloudWatch Logs Insights.
- **C.** Disable Amazon CloudWatch Logs completely on `OrderHandler` to reduce Lambda invocation latency and overhead.
- **D.** Enable AWS X-Ray Active Tracing on API Gateway and Lambda, and wrap DynamoDB SDK clients to inspect subsegments.
- **E.** Run `sam validate --lint` in production to trace live DynamoDB `PutItem` queries and exceptions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm AWS Lambda (`OrderHandler`) đang gặp lỗi `500` gián đoạn, và developer muốn nhanh chóng liên kết (correlate) các log, trace và chỉ số hiệu năng qua API Gateway, Lambda và DynamoDB. HAI thực hành quan sát (observability) AWS nào giúp cô lập nút thắt cổ chai và nguyên nhân gốc rễ? (Chọn hai đáp án.)

**Đáp án đúng:** **B, D**

Bộ đôi **Observability** chuẩn trên Serverless AWS:
1. **Structured JSON Logs + CloudWatch Logs Insights** (kèm `correlationId` / `traceId`).
2. **AWS X-Ray Active Tracing + X-Ray SDK** (Subsegments cho AWS SDK & HTTP calls).

- **A:** Sai vì log phi cấu trúc thiếu `requestId` rất khó truy vết khi hàng nghìn request chạy song song.
- **B (Đúng):** Đúng! Ghi log dạng **JSON có cấu trúc** kèm `requestId`/`traceId`/`orderId` giúp **CloudWatch Logs Insights** tự động tách trường và lọc chính xác giao dịch lỗi trong vài giây.
- **C:** Sai vì tắt log sẽ làm mất hoàn toàn dấu vết gỡ lỗi.
- **D (Đúng):** Đúng! Kết hợp **X-Ray Active Tracing** + **X-Ray SDK** cho thấy ngay trên Service Map và Trace Timeline xem độ trễ/lỗi phát sinh ở API Gateway, Lambda Init, Lambda Handler, hay DynamoDB.
- **E:** Sai vì `sam validate` chỉ kiểm tra cú pháp template YAML.

</details>

### Câu 30 `easy`

A developer wants to view the IAM Role name currently attached to an Amazon EC2 instance from a script running inside that EC2 instance. Which local metadata endpoint path provides this information?

- **A.** `http://169.254.169.254/latest/user-data/iam-role-credentials` endpoint
- **B.** `http://127.0.0.1/aws/iam/security-credentials/`
- **C.** `http://169.254.169.254/latest/dynamic/iam-policy`
- **D.** `http://169.254.169.254/latest/meta-data/iam/security-credentials/`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer muốn xem tên IAM Role hiện đang được gắn vào một Amazon EC2 instance từ một script chạy bên trong EC2 instance đó. Đường dẫn endpoint metadata cục bộ nào cung cấp thông tin này?

**Đáp án đúng:** **D**

Nhớ địa chỉ IMDS kinh điển: `169.254.169.254/latest/meta-data/iam/security-credentials/`.

- **A:** Sai, `/latest/user-data/` chỉ chứa script User Data.
- **B:** Sai IP, IMDS luôn dùng `169.254.169.254`.
- **C:** Sai đường dẫn.
- **D (Đúng):** Đúng! Endpoint `/latest/meta-data/iam/security-credentials/` trả về tên IAM Role và các temporary credentials (hoặc AWS SDK tự động lấy từ đây).

</details>

### Câu 31 `medium`

An application sends payment approval emails using a Lambda function that calls an external SMTP API taking 40 seconds to respond. The developer exposes this Lambda behind an Amazon API Gateway REST API, and clients consistently receive `HTTP 504 Gateway Timeout` even though the Lambda function completes successfully in CloudWatch Logs. What is the cause and best fix?

- **A.** Increase the Amazon API Gateway Integration Timeout to 60 seconds in the Stage settings.
- **B.** Increase Lambda memory to 10,240 MB so the external SMTP server responds within 29 seconds.
- **C.** API Gateway has a hard 29-second timeout; decouple with SQS/EventBridge or Step Functions and return `HTTP 202 Accepted`.
- **D.** Enable API Gateway Stage Caching with a 60-second TTL for the email `POST` endpoint.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng gửi email phê duyệt thanh toán bằng một hàm Lambda gọi một SMTP API bên ngoài mất 40 giây để phản hồi. Developer đặt hàm Lambda này phía sau một Amazon API Gateway REST API, và các client liên tục nhận được lỗi `HTTP 504 Gateway Timeout` mặc dù hàm Lambda hoàn thành thành công trong CloudWatch Logs. Nguyên nhân và cách khắc phục tốt nhất là gì?

**Đáp án đúng:** **C**

Bất cứ khi nào thấy **API Gateway + tác vụ > 29 giây + `504 Gateway Timeout`** -> giải pháp kiến trúc chuẩn là **bất đồng bộ hóa qua SQS / Step Functions** và trả về `202 Accepted`.

- **A:** Sai vì mặc định giới hạn 29 giây là điểm bẫy kinh điển của API Gateway trong đề thi DVA-C02 (luôn ưu tiên kiến trúc bất đồng bộ cho tác vụ dài).
- **B:** Sai vì độ trễ nằm ở bên thứ 3 (external SMTP), tăng RAM Lambda không rút ngắn được.
- **C (Đúng):** Đúng! API Gateway giới hạn **Integration Timeout tối đa 29 giây** (dù Lambda chạy được 15 phút). Với tác vụ >29s, cần xử lý bất đồng bộ (SQS/Step Functions) và trả về `202 Accepted`.
- **D:** Sai vì caching không áp dụng cho thao tác gửi email (POST) và không sửa được timeout lần chạy đầu.

</details>

### Câu 32 `medium`

A developer uses Amazon EventBridge to route order events from a custom application to an AWS Lambda function. The Lambda function only expects `{ "id": "...", "total": ... }`, whereas the original EventBridge event contains a large nested `detail` object and metadata. Which EventBridge feature transforms the payload before invoking Lambda without writing an intermediate Lambda function?

- **A.** Amazon EventBridge Schema Registry & Discovery
- **B.** EventBridge Event Archive and Replay
- **C.** Amazon SNS Subscription Filter Policy
- **D.** EventBridge Target Input Transformer

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer sử dụng Amazon EventBridge để định tuyến các sự kiện đơn hàng từ một ứng dụng tùy chỉnh tới một hàm AWS Lambda. Hàm Lambda chỉ mong đợi `{ "id": "...", "total": ... }`, trong khi sự kiện EventBridge gốc chứa một đối tượng `detail` lồng nhau lớn và metadata. Tính năng nào của EventBridge chuyển đổi payload trước khi gọi Lambda mà không cần viết một hàm Lambda trung gian?

**Đáp án đúng:** **D**

**EventBridge Input Transformer** giúp biến đổi cấu trúc payload trước khi gửi tới Target mà không cần code trung gian.

- **A:** Sai vì Schema Registry chỉ giúp sinh code binding/khám phá cấu trúc event.
- **B:** Sai vì tính năng này dùng để lưu và phát lại event lịch sử.
- **C:** Sai dịch vụ và Filter Policy chỉ lọc chứ không biến đổi JSON.
- **D (Đúng):** Đúng! **Input Transformer** cho phép ánh xạ các trường từ event gốc (`InputPathsMap`) thành cấu trúc JSON gọn nhẹ (`InputTemplate`) trước khi gửi tới Target.

</details>

### Câu 33 `medium`

An application running on an Amazon EC2 instance is configured with instance metadata service version 2 (IMDSv2) enforced (`HttpTokens: required`). A developer writes a shell script on the EC2 instance to retrieve the current Availability Zone from the instance metadata endpoint `http://169.254.169.254/latest/meta-data/placement/availability-zone`, but a simple `curl` GET request returns an `HTTP 401 Unauthorized` error. How must the script be updated to work with IMDSv2?

- **A.** Send an HTTP PUT to `http://169.254.169.254/latest/api/token` with `X-aws-ec2-metadata-token-ttl-seconds` to get a session token, then pass it in `X-aws-ec2-metadata-token` on the GET request.
- **B.** Update the metadata endpoint IP address in the shell script from `169.254.169.254` to the ECS container metadata endpoint `169.254.170.2` and retry the `curl` GET request.
- **C.** Encode the AWS account root user credentials or IAM user access key in Base64 and pass them in the HTTP `Authorization: Basic` header on the `curl` GET request.
- **D.** Modify the EC2 instance security group to allow inbound TCP port 80 traffic from `0.0.0.0/0` and enable `HttpPutResponseHopLimit: 1` on the network interface.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng chạy trên một Amazon EC2 instance được cấu hình bắt buộc sử dụng instance metadata service version 2 (IMDSv2) (`HttpTokens: required`). Một developer viết một shell script trên EC2 instance để lấy Availability Zone hiện tại từ endpoint metadata của instance `http://169.254.169.254/latest/meta-data/placement/availability-zone`, nhưng một lệnh `curl` GET đơn giản trả về lỗi `HTTP 401 Unauthorized`. Script phải được cập nhật như thế nào để hoạt động với IMDSv2?

**Đáp án đúng:** **A**

Trong đề thi DVA, nếu câu hỏi nhắc tới lỗi **`HTTP 401 Unauthorized` khi gọi `169.254.169.254`** -> Nguyên nhân chắc chắn là **IMDSv2** đang bật, cần gọi `PUT /latest/api/token` trước để lấy token!

- **A (Đúng):** Đúng! IMDSv2 hoạt động theo cơ chế hướng phiên (session-oriented) để chống tấn công SSRF: bước 1 dùng lệnh `PUT` tới `/latest/api/token` kèm header TTL để lấy token; bước 2 gửi kèm header `X-aws-ec2-metadata-token` trong lệnh `GET`.
- **B:** Sai vì `169.254.169.254` vẫn là địa chỉ IP chuẩn của EC2 Instance Metadata (còn `169.254.170.2` là địa chỉ metadata của ECS Task).
- **C:** Sai vì IMDSv2 không sử dụng mật khẩu IAM mà dùng session token nội bộ.
- **D:** Sai vì truy cập `169.254.169.254` là kết nối link-local nội bộ từ chính máy EC2 đó, không bị chặn bởi Security Group.

</details>

### Câu 34 `medium`

An application writes structured JSON logs from 20 different AWS Lambda functions into Amazon CloudWatch Logs. During an incident, a developer needs to run an ad-hoc query across these log groups to find the top 10 `clientIp` addresses that received `statusCode = 500` in the last hour, sorted in descending order by error count. Which AWS feature allows the developer to run this query immediately without setting up external infrastructure?

- **A.** AWS Trusted Advisor service limit and security checks refreshed from the AWS Management Console.
- **B.** Amazon EC2 Serial Console connected to the underlying Lambda execution environment over a virtual serial port.
- **C.** Amazon CloudWatch Logs Insights using commands such as `fields`, `filter`, `stats count(*) by clientIp`, and `sort`.
- **D.** AWS CloudTrail Event History filtered by `EventName` and exported to Amazon S3 for ad-hoc JSON inspection.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng ghi các JSON log có cấu trúc từ 20 hàm AWS Lambda khác nhau vào Amazon CloudWatch Logs. Trong một sự cố, một developer cần chạy một truy vấn đột xuất (ad-hoc query) trên các log group này để tìm top 10 địa chỉ `clientIp` nhận được `statusCode = 500` trong giờ qua, được sắp xếp theo thứ tự giảm dần theo số lượng lỗi. Tính năng AWS nào cho phép developer chạy truy vấn này ngay lập tức mà không cần thiết lập hạ tầng bên ngoài?

**Đáp án đúng:** **C**

Khi đề bài yêu cầu **truy vấn, lọc, thống kê (`stats count`) trên các bản ghi log JSON trong CloudWatch Logs** -> Chọn ngay **CloudWatch Logs Insights**.

- **A:** Sai vì Trusted Advisor chỉ đưa ra khuyến nghị về chi phí, bảo mật và giới hạn dịch vụ.
- **B:** Sai vì EC2 Serial Console chỉ dùng để debug khởi động hệ điều hành của máy chủ EC2.
- **C (Đúng):** Đúng! **CloudWatch Logs Insights** cho phép truy vấn trực tiếp log JSON trên nhiều Log Groups bằng ngôn ngữ truy vấn chuyên dụng (`fields`, `filter`, `stats`, `sort`, `limit`) mà không cần dựng hạ tầng ngoài.
- **D:** Sai vì CloudTrail ghi lại các lời gọi API quản trị AWS chứ không chứa log ứng dụng bên trong hàm Lambda.

</details>

### Câu 35 `medium`

An application running on Amazon EC2 instances instruments its code with the AWS X-Ray SDK, and the X-Ray daemon is running inside a Docker container on each instance. However, no traces appear in the AWS X-Ray console, and the X-Ray daemon logs show `AccessDeniedException` when attempting to upload segment documents. What should the developer do to fix this issue?

- **A.** Reconfigure the AWS X-Ray daemon listening port from UDP 2000 to TCP 22 inside the Docker container and update the EC2 security group.
- **B.** Uninstall the AWS X-Ray SDK from the application code and rely solely on Amazon CloudWatch basic EC2 CPU utilization metrics.
- **C.** Enable Amazon S3 Transfer Acceleration on the central X-Ray trace storage bucket and configure a Gateway VPC Endpoint for S3.
- **D.** Attach the `AWSXRayDaemonWriteAccess` managed policy (which includes `xray:PutTraceSegments` and `xray:PutTelemetryRecords`) to the EC2 Instance Profile IAM role.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng chạy trên các Amazon EC2 instance tích hợp mã nguồn với AWS X-Ray SDK và X-Ray daemon đang chạy bên trong một Docker container trên mỗi instance. Tuy nhiên, không có trace nào xuất hiện trong AWS X-Ray console và log của X-Ray daemon hiển thị lỗi `AccessDeniedException` khi cố gắng tải lên các segment document. Developer nên làm gì để khắc phục sự cố này?

**Đáp án đúng:** **D**

Hai điều kiện để **AWS X-Ray** hoạt động trên EC2/ECS:
1. **X-Ray Daemon** đang chạy (mặc định nhận gói tin qua **UDP port 2000**).
2. IAM Role (Instance Profile / Task Role / Lambda Execution Role) có gắn chính sách **`AWSXRayDaemonWriteAccess`** (`xray:PutTraceSegments`).

- **A:** Sai vì X-Ray Daemon mặc định lắng nghe trên cổng **UDP 2000**, và lỗi ở đây là `AccessDeniedException` khi gọi API lên AWS chứ không phải lỗi cổng.
- **B:** Sai vì gỡ X-Ray SDK sẽ làm ứng dụng ngừng tạo trace.
- **C:** Sai vì S3 Transfer Acceleration không liên quan đến AWS X-Ray.
- **D (Đúng):** Đúng! Чтобы X-Ray Daemon gửi được dữ liệu trace lên dịch vụ AWS X-Ray, IAM Role của máy chủ EC2 (hoặc ECS Task / Lambda) bắt buộc phải có quyền `AWSXRayDaemonWriteAccess` (`xray:PutTraceSegments`, `xray:PutTelemetryRecords`).

</details>

### Câu 36 `hard`

A developer configures an AWS Lambda function `ResizeImageFunction` to be triggered by `s3:ObjectCreated:*` events on an Amazon S3 bucket named `app-media-bucket`. After resizing the image, the Lambda function writes the resized image back into the same `app-media-bucket` without any prefix separation, causing the function to trigger itself indefinitely. What happens by default in AWS Lambda, and how should the developer fix the architecture?

- **A.** Amazon S3 automatically deletes `app-media-bucket` and revokes the Lambda execution role permissions as soon as a recursive loop is detected.
- **B.** Enabling AWS Lambda SnapStart on a published function version prevents `s3:ObjectCreated:*` event notifications from firing more than once per object.
- **C.** AWS Lambda will invoke `ResizeImageFunction` infinitely with no built-in loop protection until the account concurrency quota is exhausted or the AWS account is suspended.
- **D.** Lambda recursive loop detection stops the chain after ~16 invocations; write outputs to a separate S3 bucket or distinct prefix.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer cấu hình hàm AWS Lambda `ResizeImageFunction` được kích hoạt bởi sự kiện `s3:ObjectCreated:*` trên một Amazon S3 bucket có tên `app-media-bucket`. Sau khi thay đổi kích thước ảnh, hàm Lambda ghi ảnh đã thay đổi kích thước trở lại vào chính `app-media-bucket` mà không có bất kỳ sự phân tách prefix nào, khiến hàm tự kích hoạt chính nó vô tận. Điều gì xảy ra theo mặc định trong AWS Lambda và developer nên sửa kiến trúc này như thế nào?

**Đáp án đúng:** **D**

Tính năng **Lambda Recursive Loop Detection** tự động theo dõi chuỗi sự kiện lặp qua Lambda ↔ S3/SQS/SNS và ngắt vòng lặp sau **16 lần gọi liên tiếp**. Để sửa đúng kiến trúc, phải ghi file kết quả sang một S3 bucket khác hoặc dùng S3 Event Notification lọc riêng prefix đầu vào (`raw/`) tách biệt hoàn toàn với prefix đầu ra (`resized/`).

- **A:** Sai. Phương án này không đáp ứng đúng yêu cầu của đề bài.
- **B:** Sai. Phương án này không đáp ứng đúng yêu cầu của đề bài.
- **C:** Sai. Phương án này không đáp ứng đúng yêu cầu của đề bài.
- **D (Đúng):** Đúng. Tính năng **Lambda Recursive Loop Detection** tự động theo dõi chuỗi sự kiện lặp qua Lambda ↔ S3/SQS/SNS và ngắt vòng lặp sau **16 lần gọi liên tiếp**. Để sửa đúng kiến trúc, phải ghi file kết quả sang một S3 bucket khác hoặc dùng S3 Event Notification lọc riêng prefix đầu vào (`raw/`) tách biệt hoàn toàn với prefix đầu ra (`resized/`).

</details>

### Câu 37 `medium`

A developer needs to read item-level changes from an **Amazon DynamoDB Stream**, filter the records so that only items with `orderStatus = "REFUND_REQUESTED"` are processed, call an internal **Amazon API Gateway** endpoint to enrich each record with customer billing details, and then send the enriched payload to an **Amazon SQS** queue in order. Which solution meets these requirements while writing the **LEAST** amount of custom glue code?

- **A.** Create an Amazon EventBridge Pipe with the DynamoDB stream as source, an event filter for `orderStatus = "REFUND_REQUESTED"`, an API Gateway enrichment step, and SQS as target.
- **B.** Deploy a custom Java application on Amazon EC2 instances using the Kinesis Client Library (KCL) and DynamoDB Streams Kinesis Adapter to poll and enrich records continuously.
- **C.** Use Amazon Athena federated queries scheduled every 5 seconds via EventBridge Scheduler to scan the DynamoDB stream and forward matching records to Amazon SQS.
- **D.** Configure AWS CodeDeploy with a custom `appspec.yml` lifecycle hook to stream, filter, and transfer changed records from DynamoDB Streams to Amazon SQS.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer cần đọc các thay đổi ở cấp độ item từ một **Amazon DynamoDB Stream**, lọc các bản ghi sao cho chỉ những item có `orderStatus = "REFUND_REQUESTED"` được xử lý, gọi một endpoint **Amazon API Gateway** nội bộ để làm giàu (enrich) từng bản ghi với thông tin thanh toán của khách hàng, rồi gửi payload đã được làm giàu tới một hàng đợi **Amazon SQS** theo đúng thứ tự. Giải pháp nào đáp ứng các yêu cầu này trong khi viết **ÍT** custom glue code NHẤT?

**Đáp án đúng:** **A**

**Amazon EventBridge Pipes** nối điểm-tới-điểm (Point-to-Point) theo đúng 4 bước **Source → Filtering → Enrichment → Target** hoàn toàn managed mà không cần lập trình viên phải tự viết và bảo trì hàm Lambda chỉ để lọc và chuyển tiếp dữ liệu.

- **A (Đúng):** Đúng. **Amazon EventBridge Pipes** nối điểm-tới-điểm (Point-to-Point) theo đúng 4 bước **Source → Filtering → Enrichment → Target** hoàn toàn managed mà không cần lập trình viên phải tự viết và bảo trì hàm Lambda chỉ để lọc và chuyển tiếp dữ liệu.
- **B:** Sai. Phương án này không đáp ứng đúng yêu cầu của đề bài.
- **C:** Sai. Phương án này không đáp ứng đúng yêu cầu của đề bài.
- **D:** Sai. Phương án này không đáp ứng đúng yêu cầu của đề bài.

</details>

### Câu 38 `medium`

An engineering team runs dozens of Java and Python microservices on Amazon EKS and AWS Lambda. They want to automatically collect standard application performance monitoring (APM) metrics (call volume, latency, and 4xx/5xx fault rates), visualize the end-to-end service dependency map, and track **Service Level Objectives (SLOs)** in Amazon CloudWatch **without manually modifying application source code to add custom tracing SDKs**. Which feature should the team enable?

- **A.** AWS Systems Manager Patch Manager (for automating OS and application security patching)
- **B.** Amazon CloudWatch Application Signals (using OpenTelemetry-based auto-instrumentation)
- **C.** AWS CloudTrail Insights (for detecting unusual API management call volume and error rates)
- **D.** Amazon S3 Storage Lens (for organization-wide object storage metrics and activity trends)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ thuật vận hành hàng chục microservice Java và Python trên Amazon EKS và AWS Lambda. Họ muốn tự động thu thập các chỉ số giám sát hiệu năng ứng dụng (APM) tiêu chuẩn (lượng lời gọi, độ trễ và tỷ lệ lỗi 4xx/5xx), trực quan hóa bản đồ phụ thuộc dịch vụ đầu-cuối (end-to-end) và theo dõi **Service Level Objectives (SLOs)** trong Amazon CloudWatch **mà không cần sửa đổi thủ công mã nguồn ứng dụng để thêm các tracing SDK tùy chỉnh**. Nhóm nên bật tính năng nào?

**Đáp án đúng:** **B**

**CloudWatch Application Signals** cung cấp khả năng APM tự động dựa trên AWS Distro for OpenTelemetry (ADOT), tự động thu thập Golden Signals (Throughput, Latency, Errors/Faults), dựng Service Map và quản lý **SLI/SLO** cho ứng dụng trên EKS, ECS, EC2, Lambda mà không cần sửa code chèn SDK thủ công.

- **A:** Sai. Phương án này không đáp ứng đúng yêu cầu của đề bài.
- **B (Đúng):** Đúng. **CloudWatch Application Signals** cung cấp khả năng APM tự động dựa trên AWS Distro for OpenTelemetry (ADOT), tự động thu thập Golden Signals (Throughput, Latency, Errors/Faults), dựng Service Map và quản lý **SLI/SLO** cho ứng dụng trên EKS, ECS, EC2, Lambda mà không cần sửa code chèn SDK thủ công.
- **C:** Sai. Phương án này không đáp ứng đúng yêu cầu của đề bài.
- **D:** Sai. Phương án này không đáp ứng đúng yêu cầu của đề bài.

</details>

### Câu 39 `hard`

A company stores its application source code in **GitHub.com** and wants to configure **AWS CodePipeline** to automatically trigger an **AWS CodeBuild** project whenever a developer pushes a commit to the `main` branch. According to current AWS security best practices (avoiding long-lived personal access tokens), how should the developer configure the Source stage of the pipeline?

- **A.** Create a cron job on an Amazon EC2 instance that polls and downloads a ZIP archive from GitHub every hour and uploads it to S3.
- **B.** Configure an Amazon Route 53 CNAME record pointing to GitHub.com and attach it as an S3 source action in CodePipeline.
- **C.** Create and configure an AWS CodeConnections (formerly AWS CodeStar Connections) connection using the AWS Connector for GitHub app.
- **D.** Hardcode a developer's GitHub username and personal password directly inside the `buildspec.yml` pre_build phase.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ mã nguồn ứng dụng của mình trên **GitHub.com** và muốn cấu hình **AWS CodePipeline** để tự động kích hoạt một dự án **AWS CodeBuild** bất cứ khi nào developer push một commit lên nhánh `main`. Theo các thực hành bảo mật tốt nhất hiện tại của AWS (tránh dùng personal access token có thời hạn dài), developer nên cấu hình giai đoạn Source (Source stage) của pipeline như thế nào?

**Đáp án đúng:** **C**

**AWS CodeConnections** (tên mới của AWS CodeStar Connections) là chuẩn kết nối bảo mật được AWS khuyến nghị để tích hợp CodePipeline / CodeBuild với GitHub, GitLab, Bitbucket thông qua ứng dụng kết nối được cấp quyền thay vì dùng Personal Access Token tĩnh.

- **A:** Sai. Phương án này không đáp ứng đúng yêu cầu của đề bài.
- **B:** Sai. Phương án này không đáp ứng đúng yêu cầu của đề bài.
- **C (Đúng):** Đúng. **AWS CodeConnections** (tên mới của AWS CodeStar Connections) là chuẩn kết nối bảo mật được AWS khuyến nghị để tích hợp CodePipeline / CodeBuild với GitHub, GitLab, Bitbucket thông qua ứng dụng kết nối được cấp quyền thay vì dùng Personal Access Token tĩnh.
- **D:** Sai. Phương án này không đáp ứng đúng yêu cầu của đề bài.

</details>

### Câu 40 `medium`

A microservice runs on Amazon ECS using the AWS Fargate launch type. The application container inside the task needs to query an Amazon DynamoDB table, while the ECS agent needs permissions to pull container images from Amazon ECR and publish container logs to Amazon CloudWatch Logs. How should the IAM roles be configured?

- **A.** Attach the ECR and CloudWatch Logs permissions to the ECS Task Execution Role, and attach the DynamoDB permissions to the ECS Task IAM Role.
- **B.** Attach both sets of permissions to the EC2 Instance Profile associated with the Fargate tasks.
- **C.** Embed long-term IAM user access keys as `ENV` variables inside the Dockerfile.
- **D.** Attach the DynamoDB permissions to the ECS Task Execution Role, and attach the ECR and CloudWatch Logs permissions to the ECS Task IAM Role.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một microservice chạy trên Amazon ECS sử dụng launch type AWS Fargate. Application container bên trong task cần truy vấn một bảng Amazon DynamoDB, trong khi ECS agent cần quyền để pull container image từ Amazon ECR và gửi container log lên Amazon CloudWatch Logs. Các IAM role nên được cấu hình như thế nào?

**Đáp án đúng:** **A**

Phân biệt rõ trong Amazon ECS:
- **ECS Task Execution Role (`executionRoleArn`)**: Quyền cho ECS Agent khởi tạo container (pull image từ ECR, ghi CloudWatch Logs, inject secrets từ Secrets Manager/SSM).
- **ECS Task IAM Role (`taskRoleArn`)**: Quyền cho code ứng dụng bên trong container gọi AWS SDK tới DynamoDB, S3, Bedrock...

- **A (Đúng):** Đúng! Task Execution Role phục vụ ECS Agent (pull image ECR, lấy secret SSM/Secrets Manager khi khởi tạo, đẩy log lên CloudWatch). Task IAM Role phục vụ chính code ứng dụng gọi SDK tới các dịch vụ AWS (DynamoDB, S3, SQS...).
- **B:** Sai vì AWS Fargate là serverless container nên không sử dụng EC2 Instance Profile.
- **C:** Sai vì tuyệt đối không nhúng khóa truy cập tĩnh (hardcoded credentials) vào Dockerfile/container image.
- **D:** Sai vì bị ngược vai trò giữa Task Execution Role (dành cho hạ tầng ECS agent) và Task IAM Role (dành cho code ứng dụng bên trong container).

</details>

### Câu 41 `medium`

A development team uses AWS SAM to deploy an AWS Lambda function to production. The team wants 10% of production traffic to be routed to the new Lambda version for the first 10 minutes. If no Amazon CloudWatch alarms are triggered during those 10 minutes, the remaining 90% of traffic should immediately shift to the new version. Which `DeploymentPreference` type in the AWS SAM template meets this requirement?

- **A.** Canary10Percent10Minutes
- **B.** AllAtOnce
- **C.** RollingWithAdditionalBatch
- **D.** Linear10PercentEvery10Minutes

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm phát triển sử dụng AWS SAM để triển khai một hàm AWS Lambda lên môi trường production. Nhóm muốn 10% lưu lượng production được định tuyến đến phiên bản Lambda mới trong 10 phút đầu tiên. Nếu không có cảnh báo Amazon CloudWatch nào được kích hoạt trong 10 phút đó, 90% lưu lượng còn lại sẽ lập tức chuyển sang phiên bản mới. Giá trị `DeploymentPreference` type nào trong AWS SAM template đáp ứng yêu cầu này?

**Đáp án đúng:** **A**

Trong AWS SAM & CodeDeploy cho Lambda có 3 nhóm chiến lược chính:
- **Canary (`Canary10Percent10Minutes`)**: Chuyển X% trước, đợi Y phút rồi chuyển nốt phần còn lại.
- **Linear (`Linear10PercentEvery10Minutes`)**: Tăng đều đặn X% sau mỗi Y phút cho tới khi đủ 100%.
- **AllAtOnce**: Chuyển 100% ngay lập tức.

- **A (Đúng):** Đúng! `Canary10Percent10Minutes` chuyển 10% lưu lượng sang bản mới, theo dõi trong 10 phút rồi chuyển toàn bộ phần còn lại (90%) trong một bước duy nhất.
- **B:** Sai vì `AllAtOnce` chuyển 100% lưu lượng sang phiên bản mới ngay lập tức mà không có giai đoạn thử nghiệm 10%.
- **C:** Sai vì `RollingWithAdditionalBatch` là chiến lược triển khai của Elastic Beanstalk trên EC2, không phải cấu hình CodeDeploy cho Lambda trong SAM.
- **D:** Sai vì `Linear10PercentEvery10Minutes` sẽ tăng thêm 10% sau mỗi 10 phút (mất 100 phút mới đạt 100%), thay vì chuyển 10% rồi sau 10 phút chuyển nốt 90%.

</details>

### Câu 42 `medium`

A microservices application uses AWS X-Ray for distributed tracing across API Gateway, AWS Lambda, and Amazon DynamoDB. A developer wants to attach `customerId` and `orderTier` key-value pairs to each trace so that the support team can search and filter traces by `customerId` using X-Ray filter expressions in the console. Which X-Ray SDK method should the developer use?

- **A.** Set the X-Ray sampling rule reservoir size and fixed rate to 0.
- **B.** Record the key-value pairs using `subsegment.addAnnotation(key, value)`.
- **C.** Record the key-value pairs using `subsegment.addMetadata(key, value)`.
- **D.** Overwrite the `_X_AMZN_TRACE_ID` environment variable with the `customerId`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng microservices sử dụng AWS X-Ray để theo dõi phân tán (distributed tracing) qua API Gateway, AWS Lambda và Amazon DynamoDB. Một developer muốn gắn cặp key-value `customerId` và `orderTier` vào mỗi trace để nhóm hỗ trợ có thể tìm kiếm và lọc các trace theo `customerId` bằng X-Ray filter expression trong console. Developer nên sử dụng phương thức X-Ray SDK nào?

**Đáp án đúng:** **B**

Điểm phân biệt kinh điển trong AWS X-Ray:
- **Annotations (`addAnnotation`)**: Cặp key-value **ĐƯỢC ĐÁNH CHỈ MỤC (Indexed)** -> dùng để lọc/tìm kiếm với Filter Expressions (tối đa 50 annotations/trace).
- **Metadata (`addMetadata`)**: Đối tượng JSON bất kỳ **KHÔNG ĐƯỢC ĐÁNH CHỈ MỤC (Not Indexed)** -> chỉ dùng để lưu thêm thông tin debug chi tiết.

- **A:** Sai vì đặt Sampling Rate = 0 sẽ ngừng thu thập các trace thông thường.
- **B (Đúng):** Đúng! `Annotations` trong AWS X-Ray được đánh chỉ mục (indexed) nên có thể dùng trong Filter Expressions để tìm kiếm và gom nhóm trace.
- **C:** Sai vì `Metadata` KHÔNG được đánh chỉ mục (not indexed) nên chỉ xem được khi mở chi tiết từng trace chứ không dùng để lọc/tìm kiếm trên X-Ray được.
- **D:** Sai vì `_X_AMZN_TRACE_ID` là biến hệ thống chứa Trace ID của X-Ray, ghi đè nó sẽ làm hỏng luồng truy vết.

</details>

---

[← Chủ đề 15](15-cicd-codepipeline.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md)
