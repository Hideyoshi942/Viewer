# Bài tập tình huống — Chủ đề 15: Giám sát, Truy vết & Chiến thuật thi — CloudWatch, X-Ray & Exam Prep

> CloudWatch Logs Insights, Metrics, Alarms, AWS X-Ray (Segments, Subsegments, Annotations vs Metadata), CloudTrail & Exam Strategy.
> **Số câu hỏi:** 38 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án & Giải thích chi tiết**.

---

### Câu 1 `medium`

A healthcare application encrypts sensitive patient records using the AWS KMS `Encrypt` API before storing them in Amazon DynamoDB. To prevent an attacker from swapping an encrypted ciphertext from one patient's DynamoDB item into another patient's item, and to record the `patientId` in AWS CloudTrail logs for auditing, which KMS feature should the developer use?

- **A.** Enable Automatic Key Rotation on the KMS key so each `patientId` receives a separate key version.
- **B.** Store the `patientId` as a KMS Key Tag on the customer-managed key before calling `Encrypt` and `Decrypt` APIs.
- **C.** Use `GenerateDataKeyWithoutPlaintext` instead of `Encrypt` to bind `patientId` to the ciphertext.
- **D.** Pass `{"patientId": "<id>"}` as the `EncryptionContext` parameter in both `Encrypt` and `Decrypt` API calls.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

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

- **A.** Add a `Condition` checking `sts:ExternalId` with a unique secret string provided by the vendor.
- **B.** Require `aws:MultiFactorAuthPresent: true` in the trust policy for the vendor's automated service.
- **C.** Set `MaxSessionDuration` to 900 seconds on the IAM Role.
- **D.** Create an IAM User with long-term Access Keys and share them with the vendor.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

**Confused Deputy Problem & `sts:ExternalId`**:
- Khi cấp quyền cross-account cho đối tác thứ 3 (Third-party SaaS), luôn thêm điều kiện `"StringEquals": {"sts:ExternalId": "<unique-id>"}` vào **Trust Policy** của IAM Role.
- Bên thứ 3 phải truyền đúng `ExternalId` này khi gọi `sts:AssumeRole`.

- **A (Đúng):** Đúng! `sts:ExternalId` trong Trust Policy là cơ chế chuẩn của AWS để chống tấn công **Confused Deputy** khi cấp quyền cross-account cho bên thứ ba (SaaS vendor).
- **B:** Sai vì hệ thống SaaS tự động gọi `sts:AssumeRole` bằng máy chủ (không có người dùng nhập MFA) nên bắt buộc MFA sẽ làm hệ thống không hoạt động.
- **C:** Sai vì `MaxSessionDuration` chỉ giới hạn thời lượng token STS chứ không ngăn được confused deputy.
- **D:** Sai vì chia sẻ IAM User Access Keys dài hạn vi phạm bảo mật nghiêm trọng và không giải quyết bài toán cross-account role.

</details>

### Câu 3 `medium`

A development team uses AWS CodeBuild to compile a Java Maven project and push a Docker image to Amazon ECR. Builds currently take 12 minutes because Maven downloads all dependencies from the internet on every run, and the Docker build fails with `Cannot connect to the Docker daemon`. Which TWO changes in `buildspec.yml` and the CodeBuild project configuration will fix the Docker error and speed up builds?

- **A.** Move `docker build` from the `build` phase to the `install` phase in `buildspec.yml` without enabling `PrivilegedMode`.
- **B.** Store the Docker image inside `env.exported-variables` in `buildspec.yml`.
- **C.** Increase `computeType` to `BUILD_GENERAL1_LARGE` and enable local Docker layer caching without configuring an S3 Maven dependency cache.
- **D.** Enable `PrivilegedMode` on the CodeBuild project environment and configure S3 caching for `/root/.m2/**/*` in `buildspec.yml`.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Hai mẹo thi **AWS CodeBuild** kinh điển:
1. Build Docker image trong CodeBuild **BẮT BUỘC** bật **Privileged Mode** (`privilegedMode: true`).
2. Giảm thời gian build bằng **`cache`** trong `buildspec.yml` (S3 cache hoặc Local cache cho Docker layers / `/root/.m2` / `node_modules`).

- **A:** Sai vì dù đặt ở phase nào, nếu không bật `PrivilegedMode` thì Docker daemon vẫn không chạy được bên trong container CodeBuild.
- **B:** Sai vì `exported-variables` chỉ truyền biến môi trường dạng text sang stage sau của CodePipeline, không lưu được Docker image.
- **C:** Sai vì không bật `PrivilegedMode` thì vẫn lỗi Docker daemon, và không có cache thì Maven vẫn tải lại thư viện từ đầu.
- **D (Đúng):** Đúng! Để chạy `docker build` trong CodeBuild bắt buộc phải bật **Privileged Mode** (`privilegedMode: true`). Đồng thời cấu hình `cache.paths: ['/root/.m2/**/*']` (hoặc Local Docker/Source cache) giúp lưu cache thư viện Maven giữa các lần build.

</details>

### Câu 4 `medium`

A development team wants to manage dynamic feature flags for a production microservice. They need to validate the JSON configuration schema before deployment, roll out flag changes gradually to 10% of instances over 10 minutes, and automatically roll back the configuration change if a CloudWatch Alarm fires. Which AWS service provides these capabilities natively?

- **A.** AWS AppConfig
- **B.** Amazon S3 with Versioning
- **C.** AWS Systems Manager Parameter Store
- **D.** AWS Secrets Manager

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

So sánh nhanh bộ ba cấu hình/bí mật trên AWS:
- **SSM Parameter Store**: Lưu cấu hình tĩnh, `SecureString`, miễn phí (Standard).
- **Secrets Manager**: Lưu mật khẩu/API key, hỗ trợ **tự động xoay vòng (Auto-rotation)**.
- **AWS AppConfig**: Quản lý **Feature Flags** & cấu hình động có **Validators**, **Gradual Rollout** và **Auto-Rollback** theo CloudWatch Alarm.

- **A (Đúng):** Đúng! AWS AppConfig (thuộc AWS Systems Manager) được thiết kế chuyên cho **Feature Flags & Dynamic Configuration**: hỗ trợ JSON Schema/Lambda Validators, triển khai dần dần (Deployment Strategy), và tự động rollback khi CloudWatch Alarm kích hoạt.
- **B:** Sai vì S3 không có cơ chế rollout cấu hình theo chiến lược thời gian và rollback theo CloudWatch Alarm.
- **C:** Sai vì Parameter Store chỉ lưu key-value tĩnh, không có tính năng validate schema, rollout theo phần trăm (canary/linear) hay tự động rollback theo CloudWatch Alarm.
- **D:** Sai vì Secrets Manager chuyên dùng để lưu và xoay vòng thông tin bí mật (mật khẩu DB, API key), không dùng để rollout feature flag theo phần trăm.

</details>

### Câu 5 `medium`

An AWS Lambda function handles 5,000 requests per second and needs to emit custom business metrics (such as `OrderValue` and `ItemsCount`) to Amazon CloudWatch Metrics. Calling `cloudwatch:PutMetricData` synchronously inside the Lambda handler adds 40 ms of latency per invocation and increases AWS SDK API costs. How can the developer publish custom metrics asynchronously with zero added API latency?

- **A.** Create a CloudWatch Logs Metric Filter without changing the log format, and increase Lambda memory to 10 GB.
- **B.** Send the metrics to AWS X-Ray annotations instead of CloudWatch.
- **C.** Print structured JSON logs formatted according to the CloudWatch Embedded Metric Format (EMF) to `stdout`.
- **D.** Call `cloudwatch:PutMetricData` inside an AWS Lambda Extension after returning the response, using `StorageResolution: 1`.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

**CloudWatch Embedded Metric Format (EMF)**:
- Ghi JSON theo chuẩn `_aws` ra `stdout` (dùng thư viện `aws-embedded-metrics`).
- CloudWatch Logs tự động tách thành **Custom Metrics** bất đồng bộ.
- **Lợi ích**: Không tốn thời gian chờ API `PutMetricData`, vừa có log chi tiết vừa có metric chính xác.

- **A:** Sai vì tăng RAM lên 10 GB gây lãng phí chi phí; hơn nữa EMF linh hoạt hơn nhiều so với Metric Filter truyền thống (tự động hỗ trợ nhiều dimensions động).
- **B:** Sai vì X-Ray annotations dùng để lọc traces (và bị sampling), không tạo ra CloudWatch Custom Metrics để vẽ dashboard/alarm số lượng chính xác.
- **C (Đúng):** Đúng! CloudWatch **Embedded Metric Format (EMF)** cho phép Lambda ghi metric dưới dạng JSON chuẩn ra `stdout` (CloudWatch Logs). CloudWatch tự động trích xuất và tạo Custom Metrics bất đồng bộ mà không cần gọi API `PutMetricData`, giúp loại bỏ hoàn toàn độ trễ mạng.
- **D:** Sai vì vẫn tốn chi phí gọi API `PutMetricData` (và High-Resolution `StorageResolution: 1` còn đắt hơn), trong khi EMF là giải pháp chuẩn được AWS khuyến nghị.

</details>

### Câu 6 `medium`

A company centralizes application logs from 50 AWS Lambda functions into Amazon CloudWatch Logs. The security team needs all log events containing the string `UNAUTHORIZED_ACCESS` to be streamed in near real-time to an Amazon OpenSearch Service cluster for security dashboards. Which CloudWatch Logs feature should be configured?

- **A.** Create a CloudWatch Logs Subscription Filter with the filter pattern `UNAUTHORIZED_ACCESS` targeting Amazon OpenSearch Service (or Kinesis Data Firehose).
- **B.** Schedule CloudWatch Logs Insights queries to automatically stream matching log events directly to Amazon OpenSearch Service.
- **C.** Configure a CloudWatch Metric Filter to forward full JSON log payloads to Amazon OpenSearch Service whenever `UNAUTHORIZED_ACCESS` appears in the stream.
- **D.** Create a CloudWatch Logs Export Task to export all log events to Amazon S3 every 5 minutes and query them with Athena.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Phân biệt các tính năng **CloudWatch Logs**:
- **Subscription Filter**: Stream log **real-time** (lọc theo pattern) sang OpenSearch, Kinesis, hoặc Lambda.
- **Metric Filter**: Đếm/trích số liệu từ log để tạo **CloudWatch Alarm**.
- **Logs Insights**: Truy vấn/phân tích log nhanh bằng câu lệnh SQL-like.
- **Export to S3**: Xuất batch dữ liệu log lịch sử (không real-time).

- **A (Đúng):** Đúng! **CloudWatch Logs Subscription Filter** cho phép stream log theo thời gian thực (real-time) kèm biểu thức lọc tới tối đa 2 đích trên mỗi Log Group (Lambda, Kinesis Data Streams, Kinesis Data Firehose, hoặc OpenSearch Service).
- **B:** Sai vì Logs Insights là công cụ truy vấn tương tác/ad-hoc trên dữ liệu log đã lưu, không có tính năng stream real-time sang OpenSearch.
- **C:** Sai vì Metric Filter chỉ đếm/trích xuất giá trị số để tạo CloudWatch Metric, không forward nội dung log sang OpenSearch.
- **D:** Sai vì `CreateExportTask` là cơ chế batch (chậm, có thể mất vài chục phút đến vài giờ) xuất ra S3, không phải streaming real-time.

</details>

### Câu 7 `medium` *(Chọn nhiều đáp án)*

An application writes IoT sensor events to an Amazon DynamoDB table configured with Provisioned Capacity mode. During peak hours, CloudWatch shows `ProvisionedThroughputExceededException` errors even though total consumed WCU is only 40% of the table's provisioned WCU. Investigation reveals that 90% of writes target a single `deviceType` partition key (`"THERMOSTAT"`). Which TWO actions will resolve this hot partition bottleneck? (Choose two.)

- **A.** Enable DynamoDB Time to Live (TTL) to reduce write throttling.
- **B.** Redesign the partition key to achieve higher cardinality, such as combining `deviceType` with `deviceId` or adding a random suffix (write sharding).
- **C.** Implement exponential backoff with jitter in the client application when retrying throttled DynamoDB writes.
- **D.** Deploy Amazon DynamoDB Accelerator (DAX) in front of the table to buffer write throughput.
- **E.** Convert the primary key's partition key into a Global Secondary Index (GSI) with the exact same low-cardinality key attribute and provisioned write capacity.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**, **C**

Giới hạn vật lý của mỗi **DynamoDB Partition**: tối đa **1,000 WCU**, **3,000 RCU**, và **10 GB**.
Khi gặp **Hot Partition**:
1. Tăng **cardinality** của Partition Key (ví dụ `userId#timestamp` hoặc **Write Sharding**).
2. Dùng **Exponential Backoff with Jitter** khi retry.
3. Lưu ý: **DAX** chỉ giảm tải **đọc**, không giảm tải **ghi**.

- **A:** Sai vì TTL chỉ tự động xóa item hết hạn, không phân tán tải ghi.
- **B (Đúng):** Đúng! Một partition đơn lẻ của DynamoDB chỉ chịu tối đa **1,000 WCU** và **3,000 RCU**. Khi dồn 90% ghi vào cùng 1 Partition Key sẽ bị **Hot Partition**; cần tăng cardinality (ví dụ `deviceType#deviceId` hoặc thêm hậu tố ngẫu nhiên `0..N`) để phân tán đều dữ liệu ra nhiều partition.
- **C (Đúng):** Đúng! Khi gặp throttling thoáng qua (`ProvisionedThroughputExceededException`), ứng dụng nên sử dụng **Exponential Backoff with Jitter** (AWS SDK đã tích hợp sẵn và có thể tùy chỉnh số lần retry) để tránh dồn request cùng lúc.
- **D:** Sai vì DAX là write-through cache cho thao tác **đọc**, mọi thao tác ghi đều đi thẳng xuống DynamoDB nên không giải quyết được nghẽn ghi (write hot partition).
- **E:** Sai vì nếu GSI cũng dùng key có cardinality thấp giống hệt bảng chính thì GSI cũng sẽ bị throttle và thậm chí gây backpressure làm nghẽn ngược lại bảng chính.

</details>

### Câu 8 `medium`

A developer enables AWS X-Ray active tracing on both Amazon API Gateway and a downstream AWS Lambda function. In the X-Ray Service Map, the developer can see the time spent in API Gateway and the Lambda handler overall, but cannot see individual latency breakdowns for the Lambda function's calls to Amazon DynamoDB and an external payment REST API. What should the developer do?

- **A.** Install and run the AWS X-Ray Daemon process manually inside the Lambda handler code on every invocation.
- **B.** Enable CloudWatch Logs Insights on the Lambda log group to automatically generate X-Ray service map subsegments.
- **C.** Add `xray:PutTelemetryRecords` to the Lambda Execution Role without instrumenting the application or AWS SDK clients in the deployment package.
- **D.** Include the AWS X-Ray SDK in the Lambda deployment package and wrap the AWS SDK clients and HTTP client calls to emit subsegments.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Cơ chế hoạt động **AWS X-Ray** trên **Lambda**:
- **Active Tracing** trên Lambda console: Tự động tạo Segment cho Lambda, nhưng **không tự trace** các lời gọi AWS SDK/HTTP bên trong code.
- **X-Ray SDK** (hoặc ADOT): Patch AWS SDK (`AWSXRay.captureAWS(AWS)`) và HTTP client (`captureHTTPsGlobal`) để sinh ra **Subsegments** hiển thị chi tiết từng node trên Service Map.
- Lưu ý: Lambda **không cần** tự cài X-Ray Daemon (EC2/ECS mới cần).

- **A:** Sai vì môi trường AWS Lambda đã tích hợp sẵn X-Ray Daemon, lập trình viên chỉ cần thêm X-Ray SDK vào code (khác với EC2/ECS cần tự chạy X-Ray Daemon).
- **B:** Sai vì CloudWatch Logs Insights chỉ phân tích text logs, không tạo ra subsegments trên X-Ray Service Map.
- **C:** Sai vì nếu không instrument code bằng X-Ray SDK, hàm Lambda sẽ không gửi thông tin subsegment nào lên X-Ray.
- **D (Đúng):** Đúng! Bật Active Tracing trên Lambda chỉ tự động ghi Segment tổng của Lambda (`Initialization`, `Invocation`). Để thấy chi tiết từng lệnh gọi DynamoDB, S3 hoặc external HTTP API, code Lambda phải sử dụng **AWS X-Ray SDK** (hoặc AWS Distro for OpenTelemetry) để tạo **Subsegments**.

</details>

### Câu 9 `medium`

A developer configures an Amazon API Gateway REST API with a **Lambda Proxy Integration**. When clients call the endpoint, API Gateway returns `HTTP 502 Bad Gateway` (`Internal server error`), even though CloudWatch Logs show the Lambda function completed without throwing any unhandled exception. What is the most likely cause?

- **A.** The client sent an expired Amazon Cognito User Pool JWT token in the `Authorization` header.
- **B.** The Lambda function exceeded API Gateway's 29-second synchronous integration timeout while processing the request.
- **C.** The client exceeded the API Gateway Usage Plan burst and steady-state rate limit configured for the stage.
- **D.** The Lambda function returned a JSON object that does not match the required Lambda Proxy Integration output format (`statusCode`, `headers`, stringified `body`).

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Bảng mã lỗi **API Gateway** hay thi:
- **`400 Bad Request`**: Sai schema Request Validator.
- **`401 / 403`**: Lỗi Authorizer / thiếu API Key / WAF chặn.
- **`429 Too Many Requests`**: Vượt ngưỡng Throttling / Usage Plan.
- **`502 Bad Gateway`**: Lambda Proxy trả về sai format (`statusCode`, `body` không phải string).
- **`504 Gateway Timeout`**: Backend chạy quá **29 giây** (hard limit).

- **A:** Sai vì lỗi xác thực token sẽ trả về **`401 Unauthorized`** hoặc **`403 Forbidden`**.
- **B:** Sai vì quá giới hạn 29 giây của API Gateway sẽ trả về **`504 Gateway Timeout`**, không phải `502 Bad Gateway`.
- **C:** Sai vì vượt ngưỡng rate limit / throttling sẽ trả về **`429 Too Many Requests`**.
- **D (Đúng):** Đúng! Với **Lambda Proxy Integration**, API Gateway yêu cầu hàm Lambda trả về đúng cấu trúc `{ "statusCode": 200, "headers": {...}, "body": "<string>" }` (trong đó `body` phải là chuỗi JSON stringified, không phải object lồng nhau). Nếu sai định dạng này, API Gateway trả về **`502 Bad Gateway`**.

</details>

### Câu 10 `medium`

An e-commerce application instrumented with the AWS X-Ray SDK wants to attach two pieces of data to each trace segment: (1) `orderTier` (e.g., `"GOLD"`, `"SILVER"`) so support engineers can filter traces in the X-Ray console using `annotation.orderTier = "GOLD"`, and (2) the full raw JSON shopping cart payload for debugging without needing to search by its fields. How should each piece of data be recorded in X-Ray?

- **A.** Record `orderTier` as X-Ray Metadata (indexed for filtering) and the raw JSON cart payload as an X-Ray Annotation.
- **B.** Record `orderTier` as an X-Ray Annotation (indexed for filter expressions) and the raw JSON cart payload as X-Ray Metadata (not indexed).
- **C.** Pass both `orderTier` and the cart payload inside the `X-Amzn-Trace-Id` HTTP request header.
- **D.** Record both `orderTier` and the raw JSON cart payload as custom X-Ray Subsegment Names in the trace.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

So sánh **AWS X-Ray Annotations vs Metadata**:
- **Annotations**: Kiểu nguyên thủy (String, Number, Boolean), **ĐƯỢC INDEX**, dùng cho **Filter Expressions** (tối đa 50/trace).
- **Metadata**: Object/JSON bất kỳ, **KHÔNG INDEX**, chỉ dùng để xem thêm thông tin debug trong chi tiết trace.

- **A:** Sai ngược hoàn toàn: Metadata không search/filter được trên X-Ray console, còn Annotation không hỗ trợ object JSON lồng nhau phức tạp.
- **B (Đúng):** Đúng! Trong AWS X-Ray: **Annotations** là các cặp key-value đơn giản (string, number, boolean) được **đánh chỉ mục (indexed)** để tìm kiếm bằng Filter Expressions (tối đa 50 annotations/trace). **Metadata** lưu object/JSON tùy ý để xem chi tiết khi debug và **không được đánh chỉ mục**.
- **C:** Sai vì header `X-Amzn-Trace-Id` chỉ dùng để truyền `Root`, `Parent`, `Sampled` ID giữa các dịch vụ.
- **D:** Sai vì Subsegment Name dùng để đặt tên lời gọi dịch vụ con (như `DynamoDB` hoặc `PaymentAPI`), không dùng để nhồi JSON payload.

</details>

### Câu 11 `medium`

A high-traffic microservice handles 10,000 requests per second and uses AWS X-Ray for distributed tracing. Tracing 100% of requests is too expensive, so the team wants to trace only 1% of normal requests, EXCEPT for requests to the `/checkout` path, where they want 100% of requests traced. How should the developer configure this?

- **A.** Create a higher-priority X-Ray Sampling Rule for `URLPath: /checkout*` at Fixed Rate `1.0`, keeping the default rule at `0.01`.
- **B.** Disable X-Ray Active Tracing on API Gateway and log all raw checkout trace payloads directly to Amazon S3.
- **C.** Set `ReservoirSize` to `10,000` on the default X-Ray sampling rule so all `/checkout` requests are sampled.
- **D.** Configure an Amazon CloudWatch Metric Filter to sample 100% of X-Ray traces matching the `/checkout` path and forward them to X-Ray.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

**AWS X-Ray Sampling Rules**:
- Mặc định: **Reservoir = 1 request/giây**, sau đó **Fixed Rate = 5%**.
- Có thể tạo **Custom Sampling Rules** theo `URLPath`, `HTTPMethod`, `ServiceName`, `Host`... Rule có **Priority số nhỏ hơn** sẽ được khớp trước.

- **A (Đúng):** Đúng! **AWS X-Ray Sampling Rules** đánh giá theo thứ tự `Priority` (số nhỏ hơn ưu tiên cao hơn). Đặt rule ưu tiên cao cho `/checkout*` với `FixedRate = 1.0` và rule mặc định với `FixedRate = 0.01` giúp kiểm soát chính xác chi phí tracing mà không bỏ sót giao dịch quan trọng.
- **B:** Sai vì tắt Active Tracing sẽ mất hoàn toàn Service Map và phân tích độ trễ của X-Ray.
- **C:** Sai vì `ReservoirSize: 10000` sẽ lấy mẫu tới 10,000 req/giây (gần như 100% toàn hệ thống), làm chi phí tăng vọt.
- **D:** Sai vì CloudWatch Metric Filter không điều khiển tỷ lệ sampling của X-Ray.

</details>

### Câu 12 `easy`

A developer needs to quickly find the top 10 slowest AWS Lambda invocations over the last 3 hours across a CloudWatch Log Group containing millions of `REPORT` log lines. Which AWS tool provides an interactive, purpose-built query language (`fields`, `filter`, `sort`, `limit`) to analyze these logs in seconds?

- **A.** AWS CloudTrail Event History (Management Events)
- **B.** AWS Config
- **C.** Amazon CloudWatch Logs Insights
- **D.** Amazon CloudWatch Synthetics

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

**CloudWatch Logs Insights**:
- Công cụ truy vấn log tương tác nhanh nhất trên CloudWatch Logs.
- Tự động parse JSON logs và các trường đặc biệt của Lambda (`@duration`, `@billedDuration`, `@memorySize`, `@maxMemoryUsed`, `@billedDuration`).

- **A:** Sai vì CloudTrail ghi lại lịch sử gọi API quản trị AWS (Control Plane), không lưu log `REPORT` hay duration của từng lần chạy Lambda.
- **B:** Sai vì AWS Config theo dõi lịch sử thay đổi cấu hình tài nguyên AWS.
- **C (Đúng):** Đúng! **CloudWatch Logs Insights** cho phép chạy truy vấn tương tác tốc độ cao trên hàng triệu dòng log với cú pháp như `filter @type = "REPORT" | sort @duration desc | limit 10`.
- **D:** Sai vì CloudWatch Synthetics dùng để chạy canary scripts kiểm tra endpoint web/API định kỳ.

</details>

### Câu 13 `easy`

An application runs on Amazon EC2 instances. By default, Amazon CloudWatch displays CPU Utilization and Network metrics for the instances, but the operations team also needs to monitor **RAM (memory) utilization**, **disk space usage**, and stream `/var/log/app.log` to CloudWatch Logs. What must be installed and configured on the EC2 instances?

- **A.** Install and configure the Amazon CloudWatch Agent (unified CloudWatch Agent) with an IAM Instance Profile granting `CloudWatchAgentServerPolicy`.
- **B.** Enable EC2 Detailed Monitoring (1-minute metric intervals) on the instances via the EC2 console.
- **C.** Install and configure the AWS X-Ray Daemon on the EC2 instances to ship OS memory metrics.
- **D.** Enable VPC Flow Logs on the EC2 subnet and send them to an Amazon CloudWatch Logs group.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Kiến thức **EC2 Monitoring** hay thi:
- **Default EC2 Metrics** (Basic 5 phút / Detailed 1 phút): CPU, Network, Disk Read/Write Ops, Status Checks — **KHÔNG CÓ RAM và Disk Usage**.
- **Unified CloudWatch Agent**: Thu thập **RAM, Disk Usage**, custom OS metrics, và đẩy **Application Logs** về CloudWatch Logs.

- **A (Đúng):** Đúng! CloudWatch mặc định chỉ thu thập metric ở tầng hypervisor (CPU, Disk I/O, Network). Để thu thập **Memory (RAM)**, **Disk Space (tầng OS)** và đẩy file log lên CloudWatch Logs, bắt buộc phải cài **Unified CloudWatch Agent** kèm quyền IAM phù hợp (`CloudWatchAgentServerPolicy`).
- **B:** Sai vì Detailed Monitoring chỉ tăng tần suất thu thập từ 5 phút xuống 1 phút cho các metric mặc định, vẫn **không** có Memory hay Disk space.
- **C:** Sai vì X-Ray Daemon chỉ gửi trace segments phân tán, không thu thập RAM/Disk của hệ điều hành.
- **D:** Sai vì VPC Flow Logs chỉ ghi lại metadata lưu lượng mạng IP đi qua ENI.

</details>

### Câu 14 `medium`

An Amazon ECS Task Definition runs two containers in the same task on AWS Fargate: an `app` container (listening on port 8000) and an `xray-daemon` sidecar container (listening on UDP port 2000). How does the `app` container communicate with the `xray-daemon` sidecar container when using the `awsvpc` network mode?

- **A.** Use ECS Service Discovery (AWS Cloud Map) to resolve the `xray-daemon` sidecar container over private DNS within the VPC private subnet.
- **B.** Use Docker `--link` between the `app` and `xray-daemon` containers in the `awsvpc` Task Definition.
- **C.** Route traffic from the `app` container through an Application Load Balancer to reach `xray-daemon`.
- **D.** Send UDP packets to `localhost:2000` (or `127.0.0.1:2000`), because all containers in the same `awsvpc` task share the same network namespace and ENI.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Giao tiếp trong **ECS `awsvpc` mode**:
- Các container trong **cùng 1 Task**: Gọi nhau qua **`localhost:<port>`**.
- Các **ECS Services khác nhau**: Gọi qua **ALB/NLB**, **ECS Service Connect**, hoặc **AWS Cloud Map (Service Discovery)**.

- **A:** Sai vì Service Discovery dùng để giao tiếp **giữa các ECS Services khác nhau**, không cần cho 2 container trong cùng 1 Task.
- **B:** Sai vì `--link` (`links` trong Task Definition) chỉ dùng trong `bridge` mode trên EC2, **không** được hỗ trợ trong `awsvpc` mode.
- **C:** Sai vì ALB không hỗ trợ UDP port 2000 và không cần đi vòng ra ALB khi hai container nằm chung 1 Task.
- **D (Đúng):** Đúng! Trong **`awsvpc`** network mode (mặc định trên Fargate), cả Task được cấp 1 ENI duy nhất và tất cả container trong cùng Task chia sẻ chung **network namespace (`localhost` / `127.0.0.1`)**.

</details>

### Câu 15 `medium`

A developer uses AWS CloudTrail to investigate who deleted an Amazon DynamoDB table (`Users`) yesterday. When looking at the CloudTrail event history, the developer wants to also track **data-plane** operations (`PutItem`, `UpdateItem`, `DeleteItem`) on that DynamoDB table for compliance auditing. By default, what does CloudTrail log, and how can DynamoDB item-level operations be audited?

- **A.** Use Amazon Inspector continuous scanning to log item-level DynamoDB `PutItem` and `DeleteItem` API calls.
- **B.** Use AWS X-Ray Sampling Rules to retain 100% of DynamoDB control-plane logs for 7 years.
- **C.** CloudTrail logs Management Events (`CreateTable`, `DeleteTable`) by default; enable CloudTrail Data Events to log `PutItem`/`DeleteItem`.
- **D.** AWS CloudTrail logs all DynamoDB `PutItem`, `UpdateItem`, `DeleteItem`, and `GetItem` data-plane API calls by default at no additional cost in all Regions.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Phân biệt **CloudTrail Management Events vs Data Events**:
- **Management Events** (Control Plane: `CreateTable`, `RunInstances`, `CreateRole`): Bật mặc định.
- **Data Events** (Data Plane: S3 `GetObject`/`PutObject`, Lambda `Invoke`, DynamoDB `PutItem`/`GetItem`): **Tắt mặc định**, phải bật thủ công trong Trail.

- **A:** Sai vì Amazon Inspector chỉ quét lỗ hổng phần mềm trên EC2, ECR, Lambda.
- **B:** Sai vì X-Ray chỉ lưu traces tối đa 30 ngày và không thay thế CloudTrail audit logs.
- **C (Đúng):** Đúng! Mặc định CloudTrail ghi lại **Management Events** (control plane, miễn phí 90 ngày gần nhất trong Event History). Các thao tác đọc/ghi item (`GetItem`, `PutItem`, `DeleteItem`) trên DynamoDB hoặc `GetObject`/`PutObject` trên S3 là **Data Events**, cần bật cấu hình Trail ghi Data Events.
- **D:** Sai vì Data Events không bật mặc định (do khối lượng cực lớn) và có tính phí khi bật.

</details>

### Câu 16 `medium`

A developer is creating an IAM policy for an AWS Lambda function that writes logs to Amazon CloudWatch Logs and reads items from a single DynamoDB table. Which AWS managed policy is specifically designed to grant ONLY the basic CloudWatch Logs permissions required by a Lambda function?

- **A.** `AWSLambdaBasicExecutionRole`
- **B.** `AdministratorAccess`
- **C.** `AWSLambdaVPCAccessExecutionRole`
- **D.** `AmazonDynamoDBFullAccess`

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Các AWS Managed Policies phổ biến cho **Lambda Execution Role**:
- **`AWSLambdaBasicExecutionRole`**: Chỉ ghi CloudWatch Logs.
- **`AWSLambdaVPCAccessExecutionRole`**: Ghi Logs + quản lý ENI trong VPC.
- **`AWSXRayDaemonWriteAccess`**: Ghi traces lên AWS X-Ray.

- **A (Đúng):** Đúng! **`AWSLambdaBasicExecutionRole`** chỉ cấp 3 quyền tối thiểu cho CloudWatch Logs (`logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents`), sau đó developer gắn thêm inline/managed policy tối thiểu cho DynamoDB.
- **B:** Sai vì vi phạm nguyên tắc Least Privilege.
- **C:** Sai nếu hàm Lambda không chạy trong VPC (policy này cấp thêm quyền tạo/xóa EC2 ENI cho VPC).
- **D:** Sai vì policy này không cấp quyền ghi CloudWatch Logs và cấp quá rộng quyền DynamoDB.

</details>

### Câu 17 `medium`

An AWS CodePipeline has a Source stage (GitHub), a Build stage (CodeBuild), and a Custom Validation stage that invokes an AWS Lambda function (`ValidateCompliance`) to check security tags on the build output. Currently, the pipeline stage stays stuck in `InProgress` for an hour and then times out, even though CloudWatch Logs show `ValidateCompliance` ran and exited cleanly! Why is CodePipeline stuck?

- **A.** The Lambda function must return an HTTP `200 OK` API Gateway Proxy response object to CodePipeline.
- **B.** CodePipeline Lambda invoke actions require `PrivilegedMode: true` on the function configuration.
- **C.** The Lambda function must be deployed in `us-east-1` regardless of the CodePipeline AWS Region.
- **D.** The Lambda function failed to call `codepipeline:PutJobSuccessResult` (or `PutJobFailureResult`) with the `jobId` from the CodePipeline event.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Bẫy thi **AWS CodePipeline + Lambda Invoke Action**:
- Hàm Lambda **BẮT BUỘC** phải gọi **`codepipeline.put_job_success_result(jobId=...)`** hoặc **`put_job_failure_result(...)`**.
- Execution Role của Lambda phải có quyền `codepipeline:PutJobSuccessResult` và `codepipeline:PutJobFailureResult`.

- **A:** Sai vì CodePipeline không dùng định dạng API Gateway Proxy response.
- **B:** Sai vì `PrivilegedMode` là thuộc tính của CodeBuild, không phải Lambda.
- **C:** Sai vì hàm Lambda phải nằm **cùng Region** với CodePipeline.
- **D (Đúng):** Đúng! Khi CodePipeline gọi một **Lambda Action**, CodePipeline truyền một `CodePipeline.job.id` vào event và **chờ** hàm Lambda gọi lại API **`PutJobSuccessResult`** (hoặc `PutJobFailureResult`). Nếu Lambda chỉ `return` bình thường mà không gọi API này, CodePipeline sẽ treo cho đến khi hết timeout!

</details>

### Câu 18 `medium`

A developer is configuring AWS CodeDeploy for an in-place deployment to an EC2 Auto Scaling Group of 4 instances. The team wants CodeDeploy to deploy to 1 instance at a time (`CodeDeployDefault.OneAtATime`), and automatically roll back the deployment if the deployment fails or if a specific CloudWatch Alarm triggers during the rollout. How should this be configured?

- **A.** Set `MinimumHealthyHosts` to `100%` for the `CodeDeployDefault.OneAtATime` deployment configuration.
- **B.** In the Deployment Group, configure Alarm Configuration with the CloudWatch Alarm and enable Automatic Rollback (`DEPLOYMENT_FAILURE`, `DEPLOYMENT_STOP_ON_ALARM`).
- **C.** Add an `Alarms` block inside `appspec.yml` listing the CloudWatch Alarm ARNs to trigger rollback.
- **D.** Configure CodeDeploy to delete the EC2 Auto Scaling Group automatically on deployment failure.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

**CodeDeploy Deployment Group**:
- Cấu hình **Deployment Configuration** (`OneAtATime`, `HalfAtATime`, `AllAtOnce` hoặc custom `MinimumHealthyHosts`).
- Cấu hình **Alarms & Rollbacks** (`DEPLOYMENT_FAILURE`, `DEPLOYMENT_STOP_ON_ALARM`).

- **A:** Sai vì nếu đặt `MinimumHealthyHosts = 100%` thì CodeDeploy không thể dừng bất kỳ instance nào để deploy in-place (`OneAtATime` tương ứng tối đa 75% hoặc 3/4 instances healthy).
- **B (Đúng):** Đúng! CodeDeploy **Deployment Group** hỗ trợ gắn **CloudWatch Alarms** và bật **Automatic Rollbacks** khi có lỗi (`DEPLOYMENT_FAILURE`) hoặc khi báo động kích hoạt (`DEPLOYMENT_STOP_ON_ALARM`), tự động deploy lại revision thành công gần nhất.
- **C:** Sai vì `appspec.yml` chỉ định `files`, `permissions`, và `hooks`; cấu hình CloudWatch Alarms và Rollback nằm trên **CodeDeploy Deployment Group** (khác với AWS SAM nơi `Alarms` nằm trong `DeploymentPreference`).
- **D:** Sai và gây sập toàn bộ dịch vụ.

</details>

### Câu 19 `medium`

A team uses AWS CodePipeline with an Amazon S3 bucket as the Source stage (`PollForSourceChanges` vs EventBridge). Whenever a new `app.zip` is uploaded to S3, the team notices a delay of up to 2 minutes before CodePipeline starts, and wants immediate event-driven triggering. How should the S3 Source action be configured?

- **A.** Enable CloudTrail Data Events (`s3:PutObject`) on the S3 key and trigger CodePipeline via EventBridge (`PollForSourceChanges: false`).
- **B.** Disable S3 Bucket Versioning on the source bucket so CodePipeline detects new ZIP uploads immediately.
- **C.** Enable S3 Transfer Acceleration on the source bucket to push real-time object upload notifications directly to AWS CodePipeline.
- **D.** Set `PollForSourceChanges: true` on the CodePipeline S3 source action without enabling CloudTrail Data Events.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

**CodePipeline S3 Source Best Practices**:
- Bắt buộc bật **S3 Versioning**.
- Để trigger tức thì: Bật **CloudTrail Data Events** cho object đó + **EventBridge rule** -> `PollForSourceChanges: false`.

- **A (Đúng):** Đúng! AWS khuyến nghị tắt `PollForSourceChanges` (chạy định kỳ chậm) và dùng **CloudTrail Data Events + EventBridge** để kích hoạt CodePipeline **tức thì** ngay khi file `app.zip` mới được upload lên S3 (chú ý S3 bucket cũng phải bật Versioning).
- **B:** Sai vì CodePipeline S3 Source **bắt buộc** bucket phải bật S3 Versioning.
- **C:** Sai vì Transfer Acceleration chỉ tăng tốc upload lên S3, không kích hoạt CodePipeline nhanh hơn.
- **D:** Sai vì `PollForSourceChanges: true` chính là cơ chế polling định kỳ gây trễ.

</details>

### Câu 20 `medium`

An application runs on Amazon EC2 instances behind an Application Load Balancer and uses the AWS X-Ray SDK. However, no traces appear in the AWS X-Ray console, and the application logs show UDP connection errors on `127.0.0.1:2000`. What is missing?

- **A.** The ALB Security Group is blocking inbound UDP port 2000 X-Ray daemon traffic from the public internet to the EC2 instances.
- **B.** Amazon CloudWatch Logs Insights is disabled on the EC2 instance's application log group.
- **C.** The AWS X-Ray Daemon (or ADOT Collector) is not running on EC2, or the Instance Profile lacks `AWSXRayDaemonWriteAccess`.
- **D.** X-Ray only supports AWS Lambda and cannot trace EC2 applications.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

**X-Ray Daemon trên các nền tảng**:
- **AWS Lambda**: Tích hợp sẵn (không cần cài).
- **Elastic Beanstalk**: Chỉ cần bật `XRayEnabled: true` trong `.ebextensions`.
- **EC2 / On-Premises**: Phải **tự cài & chạy X-Ray Daemon** (lắng nghe UDP `2000`).
- **ECS**: Chạy X-Ray Daemon dưới dạng **sidecar container** trong Task Definition.

- **A:** Sai vì X-Ray Daemon chạy cục bộ trên EC2 (`127.0.0.1:2000`) và gửi dữ liệu ra X-Ray API qua **HTTPS (TCP 443)**, không nhận UDP từ internet qua ALB.
- **B:** Sai vì CloudWatch Logs Insights không thu thập UDP traces trên cổng 2000.
- **C (Đúng):** Đúng! Khác với AWS Lambda (đã tích hợp sẵn X-Ray Daemon), trên **EC2 / ECS**, ứng dụng chỉ gửi UDP packets tới `127.0.0.1:2000` (hoặc `xray-daemon:2000`) và **bắt buộc phải chạy X-Ray Daemon** (cùng quyền IAM `xray:PutTraceSegments`) để gom và đẩy traces lên AWS X-Ray API.
- **D:** Sai vì X-Ray hỗ trợ đầy đủ EC2, ECS, EKS, Elastic Beanstalk, Lambda, API Gateway...

</details>

### Câu 21 `medium`

A developer inspects an AWS Lambda function's CloudWatch Logs `REPORT` line: `Duration: 1850.20 ms Billed Duration: 1851 ms Memory Size: 512 MB Max Memory Used: 512 MB Init Duration: 420.15 ms`, followed by `Runtime exited with error: signal: killed`. What caused the Lambda failure and how should it be fixed?

- **A.** The Lambda function exceeded its maximum 15-minute execution timeout while processing the large PDF payload in memory buffers.
- **B.** The Lambda function exceeded its ephemeral `/tmp` disk storage limit during execution.
- **C.** The Lambda function execution role lacked `iam:PassRole` permission on the invocation target.
- **D.** The Lambda function ran Out of Memory (OOM) hitting `512 MB`; increase the Lambda Memory allocation (e.g., 1,024 MB).

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Đọc nhanh dòng **`REPORT` của AWS Lambda**:
- `Max Memory Used == Memory Size` + `signal: killed` -> **Out of Memory (OOM)** -> Tăng Memory.
- `Task timed out after X.XX seconds` -> **Timeout** -> Tăng `Timeout` (tối đa 900s) hoặc tối ưu code/Memory.
- `Init Duration`: Xuất hiện ở **Cold Start**.

- **A:** Sai vì `Duration` mới là 1,850 ms (~1.85 giây), chưa hề chạm timeout 15 phút (và timeout sẽ báo `Task timed out after X seconds`).
- **B:** Sai vì hết `/tmp` sẽ báo lỗi `ENOSPC: no space left on device`, không phải `Max Memory Used: 512 MB`.
- **C:** Sai vì thiếu `iam:PassRole` xảy ra lúc deploy/tạo hàm, không phải lúc runtime với `Max Memory Used: 512 MB`.
- **D (Đúng):** Đúng! Khi `Max Memory Used` bằng đúng `Memory Size` (512 MB) và tiến trình bị kill (`signal: killed`), đó là dấu hiệu kinh điển của lỗi **Out of Memory (OOM)**. Cần tăng **Memory Size** cho Lambda.

</details>

### Câu 22 `medium`

A Lambda function writes error logs to Amazon CloudWatch Logs whenever a payment fails (`PAYMENT_GATEWAY_ERROR`). The operations team wants to receive an immediate email alert via Amazon SNS whenever more than 10 `PAYMENT_GATEWAY_ERROR` occurrences appear in the logs within any 5-minute window. What is the simplest serverless setup to achieve this?

- **A.** Create a CloudWatch Logs Metric Filter for `PAYMENT_GATEWAY_ERROR` and a CloudWatch Alarm (`Sum > 10` in 5m) publishing to SNS.
- **B.** Use AWS X-Ray Sampling Rules to send real-time operational alert emails directly to operators whenever payment gateway errors exceed 10 per minute.
- **C.** Export CloudWatch Logs to Amazon S3 every 24 hours and send an email via SES.
- **D.** Run a CloudWatch Logs Insights query manually every 5 minutes and email the results to operations.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

**CloudWatch Logs Metric Filter -> CloudWatch Alarm -> SNS**: Mô hình chuẩn để cảnh báo khi có chuỗi lỗi/từ khóa xuất hiện quá ngưỡng trong log.

- **A (Đúng):** Đúng! **CloudWatch Logs Metric Filter** biến số lần xuất hiện chuỗi log thành **CloudWatch Metric**, từ đó gắn **CloudWatch Alarm** để bắn thông báo tới **SNS** khi vượt ngưỡng > 10 trong 5 phút.
- **B:** Sai vì X-Ray Sampling Rules không gửi email cảnh báo theo log pattern.
- **C:** Sai vì xuất S3 mỗi 24 giờ quá chậm so với yêu cầu cảnh báo ngay trong cửa sổ 5 phút.
- **D:** Sai vì chạy thủ công không tự động cảnh báo.

</details>

### Câu 23 `medium`

A team deploys an AWS Lambda function that stores its logs in Amazon CloudWatch Logs. After 2 years of operation, the CloudWatch Logs storage bill has grown significantly because the default log retention setting never expires old logs. How can the team reduce CloudWatch Logs storage costs while retaining recent logs for 30 days and archiving older logs for compliance?

- **A.** Enable CloudWatch Detailed Monitoring on the Log Group and configure 1-minute metric resolution for log ingestion.
- **B.** Set the CloudWatch Log Group Retention Policy to 30 days and export or stream older logs to Amazon S3 with Glacier Lifecycle.
- **C.** Stream all CloudWatch Logs to an Amazon DynamoDB table with On-Demand capacity and DynamoDB TTL enabled after 7 years.
- **D.** Remove the `logs:PutLogEvents` permission from the Lambda execution role so older log streams stop accumulating storage.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

**CloudWatch Logs Cost Optimization**:
- Mặc định Log Group giữ **`Never expire`** -> luôn đặt **Retention Policy** (ví dụ 7, 14, 30 ngày).
- Lưu trữ dài hạn nhiều năm: Đẩy sang **Amazon S3 + S3 Glacier**.

- **A:** Sai vì Detailed Monitoring là tính năng của EC2 metrics, không làm giảm chi phí lưu trữ log.
- **B (Đúng):** Đúng! Mặc định CloudWatch Log Group đặt retention là **`Never expire`**. Đặt lại Retention thành **`30 days`** (chỉ giữ log nóng để debug) và đẩy bản sao sang **S3 + Glacier** (qua Kinesis Data Firehose Subscription Filter hoặc Export Task) sẽ tiết kiệm chi phí lưu trữ tối đa.
- **C:** Sai vì lưu log thô lâu dài trong DynamoDB đắt hơn S3/Glacier rất nhiều.
- **D:** Sai vì xóa quyền ghi log sẽ làm mất toàn bộ log debug kể cả log mới nhất.

</details>

### Câu 24 `medium`

An AWS Lambda function (`OrderProcessor`) experiences sporadic `404` or `Timeout` failures only on cold starts when running inside a VPC, and the team wants to see **exact Cold Start (`Init Duration`)** percentages and p99 latency across all invocations in CloudWatch without writing custom parsing scripts. Which CloudWatch feature provides out-of-the-box Lambda cold start, memory, and error visualizations?

- **A.** Enable DynamoDB Contributor Insights on the function's IAM role.
- **B.** Enable VPC Flow Logs on the Lambda subnet to track memory usage.
- **C.** Enable S3 Server Access Logging on the deployment artifact bucket to inspect memory.
- **D.** Enable Amazon CloudWatch Lambda Insights on the Lambda function.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

**Amazon CloudWatch Lambda Insights**:
- Bật bằng 1 click (thêm Lambda Extension Layer + quyền `CloudWatchLambdaInsightsExecutionRolePolicy`).
- Theo dõi **Cold Starts, Memory %, CPU, Network** ở mức chi tiết hơn CloudWatch metrics mặc định.

- **A:** Sai vì Contributor Insights chỉ phân tích hot keys trên DynamoDB.
- **B:** Sai vì VPC Flow Logs không đo `Init Duration` hay CPU/RAM của hàm Lambda.
- **C:** Sai vì S3 Access Logging chỉ ghi nhật ký truy cập S3 bucket.
- **D (Đúng):** Đúng! **CloudWatch Lambda Insights** (chạy dưới dạng Lambda Extension) tự động thu thập các metric hệ thống chi tiết: Cold Start count/duration, CPU time, Memory utilization, Network I/O và hiển thị dashboard sẵn có.

</details>

### Câu 25 `medium`

A web application behind Amazon API Gateway and AWS Lambda needs end-to-end distributed tracing through an **Amazon SQS** queue: API Gateway -> Producer Lambda -> SQS Queue -> Consumer Lambda -> DynamoDB. When viewing the AWS X-Ray Service Map, the developer sees two disconnected traces instead of one unified end-to-end trace across SQS. Why?

- **A.** Amazon API Gateway must use a `MOCK` integration instead of Lambda proxy for X-Ray tracing headers to propagate through SQS.
- **B.** The Consumer/Producer Lambda isn't propagating `AWSTraceHeader` (`X-Amzn-Trace-Id`) via SQS, or active tracing is off.
- **C.** AWS X-Ray does not support tracing downstream Amazon DynamoDB SDK API calls from Lambda.
- **D.** Amazon SQS strips all message attributes and headers unless SQS Long Polling is disabled.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

**AWS X-Ray Trace Propagation qua SQS**:
- Producer gửi kèm `AWSTraceHeader` (tự động khi patch AWS SDK bằng X-Ray SDK).
- Consumer Lambda đọc `AWSTraceHeader` từ SQS event record để nối Trace ID (tạo segment/subsegment liên kết).

- **A:** Sai vì `MOCK` integration không gọi xuống Lambda.
- **B (Đúng):** Đúng! Khi đi qua hàng đợi bất đồng bộ như SQS, AWS Lambda/X-Ray SDK truyền `AWSTraceHeader` trong system attribute của SQS message. Cần bật **Active Tracing** trên cả Producer & Consumer Lambda và dùng X-Ray SDK / ADOT đúng cách (hoặc liên kết trace context từ SQS record) để nối liền Service Map.
- **C:** Sai vì X-Ray SDK hỗ trợ trace DynamoDB rất tốt.
- **D:** Sai vì Long Polling không ảnh hưởng đến `AWSTraceHeader`.

</details>

### Câu 26 `medium`

A developer uses Amazon CloudWatch Synthetics to monitor a public checkout API (`https://api.example.com/checkout`). The developer wants a headless browser / API script to run every 5 minutes from AWS and trigger a CloudWatch Alarm if the checkout flow breaks or takes longer than 3 seconds, even when no real users are visiting the site. Which CloudWatch feature implements this?

- **A.** Create a CloudWatch Synthetics Canary (Node.js or Python script) running on a 5-minute schedule.
- **B.** Use AWS CloudTrail Insights to simulate user login and checkout flows.
- **C.** Enable S3 Event Notifications to trigger synthetic browser tests.
- **D.** Use CloudWatch Logs Insights queries scheduled every 5 minutes to test the checkout flow end-to-end automatically.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

**Amazon CloudWatch Synthetics Canaries**: Kiểm tra chủ động (proactive monitoring) 24/7 cho endpoint web, API, broken links, visual regression; kết quả lưu ảnh chụp/HAR lên S3 và phát CloudWatch Metrics (`SuccessPercent`, `Duration`).

- **A (Đúng):** Đúng! **CloudWatch Synthetics Canaries** là các script kiểm thử tự động (dùng Puppeteer/Playwright hoặc API script) chạy định kỳ (ví dụ mỗi 5 phút) để kiểm tra tính sẵn sàng, độ trễ và luồng giao dịch web/API 24/7.
- **B:** Sai vì CloudTrail Insights chỉ theo dõi bất thường API quản trị AWS.
- **C:** Sai vì S3 Event Notifications không kiểm tra endpoint web/API.
- **D:** Sai vì Logs Insights chỉ truy vấn log thụ động khi có user thật gọi hệ thống.

</details>

### Câu 27 `medium`

A developer uses AWS CloudWatch Alarms to monitor an Amazon SQS queue (`OrdersQueue`). The team wants an alarm to trigger whenever messages are sitting unprocessed in the queue for more than 10 minutes (indicating that consumers are stuck or too slow). Which SQS CloudWatch metric should the alarm monitor?

- **A.** `ApproximateAgeOfOldestMessage`
- **B.** `NumberOfEmptyReceives`
- **C.** `SentMessageSize`
- **D.** `NumberOfMessagesDeleted` (per minute)

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Các CloudWatch Metrics quan trọng của **Amazon SQS**:
- **`ApproximateAgeOfOldestMessage`**: Phát hiện consumer bị kẹt/chậm.
- **`ApproximateNumberOfMessagesVisible`**: Số lượng tin nhắn đang chờ xử lý (dùng để Auto Scale ECS/EC2 workers).

- **A (Đúng):** Đúng! **`ApproximateAgeOfOldestMessage`** đo tuổi (tính bằng giây) của tin nhắn cũ nhất chưa bị xóa trong SQS queue — đây là chỉ số chính xác nhất để phát hiện consumer bị kẹt hoặc xử lý không kịp.
- **B:** Sai vì `NumberOfEmptyReceives` đếm số lần consumer poll nhưng hàng đợi rỗng.
- **C:** Sai vì `SentMessageSize` đo kích thước (bytes) của tin nhắn gửi vào.
- **D:** Sai vì `NumberOfMessagesDeleted` chỉ đếm số tin nhắn đã xử lý xong và xóa.

</details>

### Câu 28 `medium`

A developer creates an Amazon CloudWatch Alarm on an EC2 instance's `CPUUtilization` metric (threshold > 80% for 2 consecutive 5-minute periods). Occasionally, when an EC2 instance is stopped or experiences a brief telemetry gap, the alarm transitions to `INSUFFICIENT_DATA` instead of `OK` or `ALARM`, confusing the monitoring dashboard. Which CloudWatch Alarm setting controls how missing data points are evaluated?

- **A.** Change the CloudWatch Alarm Statistic from `Average` to `Maximum` during idle periods.
- **B.** Configure Treat missing data as (`TreatMissingData`: `notBreaching`, `breaching`, `ignore`, or `missing`).
- **C.** Set the CloudWatch Alarm `Period` to 1 second so missing data points never trigger.
- **D.** Attach an SQS Dead-Letter Queue to the CloudWatch Alarm to buffer missing metrics during idle off-peak periods.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

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

### Câu 29 `medium` *(Chọn nhiều đáp án)*

An AWS Lambda function (`OrderHandler`) is experiencing intermittent `500` errors, and the developer wants to quickly correlate logs, traces, and performance metrics across API Gateway, Lambda, and DynamoDB. Which TWO AWS observability practices help isolate the bottleneck and root cause? (Choose two.)

- **A.** Use Structured JSON Logging (with `requestId`, `traceId`, `orderId`) and query with CloudWatch Logs Insights.
- **B.** Use `sam validate` in production to trace live DynamoDB queries and latency spikes.
- **C.** Disable Amazon CloudWatch Logs on `OrderHandler` to reduce cold-start and DynamoDB latency.
- **D.** Enable AWS X-Ray Active Tracing on API Gateway and Lambda, and wrap the DynamoDB SDK client to inspect subsegments.
- **E.** Print unstructured plain-text logs with no request IDs and download log files manually from Amazon S3 archive buckets.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**, **D**

Bộ đôi **Observability** chuẩn trên Serverless AWS:
1. **Structured JSON Logs + CloudWatch Logs Insights** (kèm `correlationId` / `traceId`).
2. **AWS X-Ray Active Tracing + X-Ray SDK** (Subsegments cho AWS SDK & HTTP calls).

- **A (Đúng):** Đúng! Ghi log dạng **JSON có cấu trúc** kèm `requestId`/`traceId`/`orderId` giúp **CloudWatch Logs Insights** tự động tách trường và lọc chính xác giao dịch lỗi trong vài giây.
- **B:** Sai vì `sam validate` chỉ kiểm tra cú pháp template YAML.
- **C:** Sai vì tắt log sẽ làm mất hoàn toàn dấu vết gỡ lỗi.
- **D (Đúng):** Đúng! Kết hợp **X-Ray Active Tracing** + **X-Ray SDK** cho thấy ngay trên Service Map và Trace Timeline xem độ trễ/lỗi phát sinh ở API Gateway, Lambda Init, Lambda Handler, hay DynamoDB.
- **E:** Sai vì log phi cấu trúc thiếu `requestId` rất khó truy vết khi hàng nghìn request chạy song song.

</details>

### Câu 30 `easy`

A developer wants to view the IAM Role name currently attached to an Amazon EC2 instance from a script running inside that EC2 instance. Which local metadata endpoint path provides this information?

- **A.** `http://169.254.169.254/latest/user-data/iam-role/credentials`
- **B.** `http://169.254.169.254/latest/meta-data/iam/security-credentials/`
- **C.** `http://127.0.0.1/aws/iam/security-credentials/instance-role`
- **D.** `http://169.254.169.254/latest/dynamic/iam-policy/credentials/role/ec2`

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Nhớ địa chỉ IMDS kinh điển: `169.254.169.254/latest/meta-data/iam/security-credentials/`.

- **A:** Sai, `/latest/user-data/` chỉ chứa script User Data.
- **B (Đúng):** Đúng! Endpoint `/latest/meta-data/iam/security-credentials/` trả về tên IAM Role và các temporary credentials (hoặc AWS SDK tự động lấy từ đây).
- **C:** Sai IP, IMDS luôn dùng `169.254.169.254`.
- **D:** Sai đường dẫn.

</details>

### Câu 31 `medium`

An application sends payment approval emails using a Lambda function that calls an external SMTP API taking 40 seconds to respond. The developer exposes this Lambda behind an Amazon API Gateway REST API, and clients consistently receive `HTTP 504 Gateway Timeout` even though the Lambda function completes successfully in CloudWatch Logs. What is the cause and best fix?

- **A.** API Gateway has a hard 29-second integration timeout; decouple using SQS/EventBridge or Step Functions and return `HTTP 202 Accepted` immediately.
- **B.** Increase the API Gateway Integration Timeout to 60 seconds in the production Stage settings.
- **C.** Increase Lambda memory to 10,240 MB so the external SMTP server responds within 29 seconds.
- **D.** Enable API Gateway Stage Caching with a 60-second TTL for all `POST` email requests.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Bất cứ khi nào thấy **API Gateway + tác vụ > 29 giây + `504 Gateway Timeout`** -> giải pháp kiến trúc chuẩn là **bất đồng bộ hóa qua SQS / Step Functions** và trả về `202 Accepted`.

- **A (Đúng):** Đúng! API Gateway giới hạn **Integration Timeout tối đa 29 giây** (dù Lambda chạy được 15 phút). Với tác vụ >29s, cần xử lý bất đồng bộ (SQS/Step Functions) và trả về `202 Accepted`.
- **B:** Sai vì mặc định giới hạn 29 giây là điểm bẫy kinh điển của API Gateway trong đề thi DVA-C02 (luôn ưu tiên kiến trúc bất đồng bộ cho tác vụ dài).
- **C:** Sai vì độ trễ nằm ở bên thứ 3 (external SMTP), tăng RAM Lambda không rút ngắn được.
- **D:** Sai vì caching không áp dụng cho thao tác gửi email (POST) và không sửa được timeout lần chạy đầu.

</details>

### Câu 32 `medium`

A developer uses Amazon EventBridge to route order events from a custom application to an AWS Lambda function. The Lambda function only expects `{ "id": "...", "total": ... }`, whereas the original EventBridge event contains a large nested `detail` object and metadata. Which EventBridge feature transforms the payload before invoking Lambda without writing an intermediate Lambda function?

- **A.** EventBridge Event Archive and Replay feature
- **B.** Amazon SNS Subscription Filter Policy
- **C.** EventBridge Schema Registry and Discovery
- **D.** EventBridge Target Input Transformer

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

**EventBridge Input Transformer** giúp biến đổi cấu trúc payload trước khi gửi tới Target mà không cần code trung gian.

- **A:** Sai vì tính năng này dùng để lưu và phát lại event lịch sử.
- **B:** Sai dịch vụ và Filter Policy chỉ lọc chứ không biến đổi JSON.
- **C:** Sai vì Schema Registry chỉ giúp sinh code binding/khám phá cấu trúc event.
- **D (Đúng):** Đúng! **Input Transformer** cho phép ánh xạ các trường từ event gốc (`InputPathsMap`) thành cấu trúc JSON gọn nhẹ (`InputTemplate`) trước khi gửi tới Target.

</details>

### Câu 33 `medium`

An application running on an Amazon EC2 instance is configured with instance metadata service version 2 (IMDSv2) enforced (`HttpTokens: required`). A developer writes a shell script on the EC2 instance to retrieve the current Availability Zone from the instance metadata endpoint `http://169.254.169.254/latest/meta-data/placement/availability-zone`, but a simple `curl` GET request returns an `HTTP 401 Unauthorized` error. How must the script be updated to work with IMDSv2?

- **A.** Include the AWS account root user credentials or an IAM user password encoded in Base64 inside the `Authorization: Basic` header of the metadata HTTP GET request.
- **B.** Send an HTTP PUT request to `http://169.254.169.254/latest/api/token` with `X-aws-ec2-metadata-token-ttl-seconds` to get a session token, then pass it in `X-aws-ec2-metadata-token` on the GET request.
- **C.** Modify the EC2 instance security group to allow inbound TCP traffic on port 80 from `0.0.0.0/0` so the local metadata endpoint accepts unauthenticated GET requests.
- **D.** Update the application configuration to send standard HTTP GET requests to the alternate VPC link-local metadata IP address `169.254.170.2` instead of `169.254.169.254` for IMDSv2.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Trong đề thi DVA, nếu câu hỏi nhắc tới lỗi **`HTTP 401 Unauthorized` khi gọi `169.254.169.254`** -> Nguyên nhân chắc chắn là **IMDSv2** đang bật, cần gọi `PUT /latest/api/token` trước để lấy token!

- **A:** Sai vì IMDSv2 không sử dụng mật khẩu IAM mà dùng session token nội bộ.
- **B (Đúng):** Đúng! IMDSv2 hoạt động theo cơ chế hướng phiên (session-oriented) để chống tấn công SSRF: bước 1 dùng lệnh `PUT` tới `/latest/api/token` kèm header TTL để lấy token; bước 2 gửi kèm header `X-aws-ec2-metadata-token` trong lệnh `GET`.
- **C:** Sai vì truy cập `169.254.169.254` là kết nối link-local nội bộ từ chính máy EC2 đó, không bị chặn bởi Security Group.
- **D:** Sai vì `169.254.169.254` vẫn là địa chỉ IP chuẩn của EC2 Instance Metadata (còn `169.254.170.2` là địa chỉ metadata của ECS Task).

</details>

### Câu 34 `medium`

An application writes structured JSON logs from 20 different AWS Lambda functions into Amazon CloudWatch Logs. During an incident, a developer needs to run an ad-hoc query across these log groups to find the top 10 `clientIp` addresses that received `statusCode = 500` in the last hour, sorted in descending order by error count. Which AWS feature allows the developer to run this query immediately without setting up external infrastructure?

- **A.** Amazon EC2 Serial Console connected to the underlying microVM hosts running the 20 AWS Lambda functions.
- **B.** AWS CloudTrail Event History filtered by the `Lambda` event source and `clientIp` attribute across the last 90 days of logs.
- **C.** AWS Trusted Advisor cost optimization and service limit checks across all 20 AWS Lambda functions in the account.
- **D.** Amazon CloudWatch Logs Insights using query commands such as `fields`, `filter`, `stats count(*) by clientIp`, and `sort`.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Khi đề bài yêu cầu **truy vấn, lọc, thống kê (`stats count`) trên các bản ghi log JSON trong CloudWatch Logs** -> Chọn ngay **CloudWatch Logs Insights**.

- **A:** Sai vì EC2 Serial Console chỉ dùng để debug khởi động hệ điều hành của máy chủ EC2.
- **B:** Sai vì CloudTrail ghi lại các lời gọi API quản trị AWS chứ không chứa log ứng dụng bên trong hàm Lambda.
- **C:** Sai vì Trusted Advisor chỉ đưa ra khuyến nghị về chi phí, bảo mật và giới hạn dịch vụ.
- **D (Đúng):** Đúng! **CloudWatch Logs Insights** cho phép truy vấn trực tiếp log JSON trên nhiều Log Groups bằng ngôn ngữ truy vấn chuyên dụng (`fields`, `filter`, `stats`, `sort`, `limit`) mà không cần dựng hạ tầng ngoài.

</details>

### Câu 35 `medium`

An application running on Amazon EC2 instances instruments its code with the AWS X-Ray SDK, and the X-Ray daemon is running inside a Docker container on each instance. However, no traces appear in the AWS X-Ray console, and the X-Ray daemon logs show `AccessDeniedException` when attempting to upload segment documents. What should the developer do to fix this issue?

- **A.** Attach the `AWSXRayDaemonWriteAccess` managed policy (`xray:PutTraceSegments`, `xray:PutTelemetryRecords`) to the EC2 Instance Profile IAM role.
- **B.** Enable Amazon S3 Transfer Acceleration on the application artifact bucket so the X-Ray daemon can upload trace segments to the AWS X-Ray service.
- **C.** Uninstall the AWS X-Ray SDK from the application code and rely solely on Amazon CloudWatch Logs to automatically generate distributed traces.
- **D.** Reconfigure the AWS X-Ray daemon container and application SDK to send trace segments over TCP port 22 instead of the default UDP port 2000.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Hai điều kiện để **AWS X-Ray** hoạt động trên EC2/ECS:
1. **X-Ray Daemon** đang chạy (mặc định nhận gói tin qua **UDP port 2000**).
2. IAM Role (Instance Profile / Task Role / Lambda Execution Role) có gắn chính sách **`AWSXRayDaemonWriteAccess`** (`xray:PutTraceSegments`).

- **A (Đúng):** Đúng! Чтобы X-Ray Daemon gửi được dữ liệu trace lên dịch vụ AWS X-Ray, IAM Role của máy chủ EC2 (hoặc ECS Task / Lambda) bắt buộc phải có quyền `AWSXRayDaemonWriteAccess` (`xray:PutTraceSegments`, `xray:PutTelemetryRecords`).
- **B:** Sai vì S3 Transfer Acceleration không liên quan đến AWS X-Ray.
- **C:** Sai vì gỡ X-Ray SDK sẽ làm ứng dụng ngừng tạo trace.
- **D:** Sai vì X-Ray Daemon mặc định lắng nghe trên cổng **UDP 2000**, và lỗi ở đây là `AccessDeniedException` khi gọi API lên AWS chứ không phải lỗi cổng.

</details>

### Câu 36 `medium`

A microservice runs on Amazon ECS using the AWS Fargate launch type. The application container inside the task needs to query an Amazon DynamoDB table, while the ECS agent needs permissions to pull container images from Amazon ECR and publish container logs to Amazon CloudWatch Logs. How should the IAM roles be configured?

- **A.** Embed long-term IAM user access keys as `ENV` variables inside the Dockerfile.
- **B.** Attach the ECR and CloudWatch Logs permissions to the ECS Task Execution Role, and attach the DynamoDB permissions to the ECS Task IAM Role.
- **C.** Attach both sets of permissions to the EC2 Instance Profile associated with the Fargate tasks.
- **D.** Attach the DynamoDB permissions to the ECS Task Execution Role, and attach the ECR and CloudWatch Logs permissions to the ECS Task IAM Role.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Phân biệt rõ trong Amazon ECS:
- **ECS Task Execution Role (`executionRoleArn`)**: Quyền cho ECS Agent khởi tạo container (pull image từ ECR, ghi CloudWatch Logs, inject secrets từ Secrets Manager/SSM).
- **ECS Task IAM Role (`taskRoleArn`)**: Quyền cho code ứng dụng bên trong container gọi AWS SDK tới DynamoDB, S3, Bedrock...

- **A:** Sai vì tuyệt đối không nhúng khóa truy cập tĩnh (hardcoded credentials) vào Dockerfile/container image.
- **B (Đúng):** Đúng! Task Execution Role phục vụ ECS Agent (pull image ECR, lấy secret SSM/Secrets Manager khi khởi tạo, đẩy log lên CloudWatch). Task IAM Role phục vụ chính code ứng dụng gọi SDK tới các dịch vụ AWS (DynamoDB, S3, SQS...).
- **C:** Sai vì AWS Fargate là serverless container nên không sử dụng EC2 Instance Profile.
- **D:** Sai vì bị ngược vai trò giữa Task Execution Role (dành cho hạ tầng ECS agent) và Task IAM Role (dành cho code ứng dụng bên trong container).

</details>

### Câu 37 `medium`

A development team uses AWS SAM to deploy an AWS Lambda function to production. The team wants 10% of production traffic to be routed to the new Lambda version for the first 10 minutes. If no Amazon CloudWatch alarms are triggered during those 10 minutes, the remaining 90% of traffic should immediately shift to the new version. Which `DeploymentPreference` type in the AWS SAM template meets this requirement?

- **A.** AllAtOnce
- **B.** Canary10Percent10Minutes
- **C.** Linear10PercentEvery10Minutes
- **D.** RollingWithAdditionalBatch

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Trong AWS SAM & CodeDeploy cho Lambda có 3 nhóm chiến lược chính:
- **Canary (`Canary10Percent10Minutes`)**: Chuyển X% trước, đợi Y phút rồi chuyển nốt phần còn lại.
- **Linear (`Linear10PercentEvery10Minutes`)**: Tăng đều đặn X% sau mỗi Y phút cho tới khi đủ 100%.
- **AllAtOnce**: Chuyển 100% ngay lập tức.

- **A:** Sai vì `AllAtOnce` chuyển 100% lưu lượng sang phiên bản mới ngay lập tức mà không có giai đoạn thử nghiệm 10%.
- **B (Đúng):** Đúng! `Canary10Percent10Minutes` chuyển 10% lưu lượng sang bản mới, theo dõi trong 10 phút rồi chuyển toàn bộ phần còn lại (90%) trong một bước duy nhất.
- **C:** Sai vì `Linear10PercentEvery10Minutes` sẽ tăng thêm 10% sau mỗi 10 phút (mất 100 phút mới đạt 100%), thay vì chuyển 10% rồi sau 10 phút chuyển nốt 90%.
- **D:** Sai vì `RollingWithAdditionalBatch` là chiến lược triển khai của Elastic Beanstalk trên EC2, không phải cấu hình CodeDeploy cho Lambda trong SAM.

</details>

### Câu 38 `medium`

A microservices application uses AWS X-Ray for distributed tracing across API Gateway, AWS Lambda, and Amazon DynamoDB. A developer wants to attach `customerId` and `orderTier` key-value pairs to each trace so that the support team can search and filter traces by `customerId` using X-Ray filter expressions in the console. Which X-Ray SDK method should the developer use?

- **A.** Record the key-value pairs using `subsegment.addMetadata(key, value)`.
- **B.** Set the X-Ray sampling rule reservoir size and fixed rate to 0.
- **C.** Record the key-value pairs using `subsegment.addAnnotation(key, value)`.
- **D.** Overwrite the `_X_AMZN_TRACE_ID` environment variable with the `customerId`.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Điểm phân biệt kinh điển trong AWS X-Ray:
- **Annotations (`addAnnotation`)**: Cặp key-value **ĐƯỢC ĐÁNH CHỈ MỤC (Indexed)** -> dùng để lọc/tìm kiếm với Filter Expressions (tối đa 50 annotations/trace).
- **Metadata (`addMetadata`)**: Đối tượng JSON bất kỳ **KHÔNG ĐƯỢC ĐÁNH CHỈ MỤC (Not Indexed)** -> chỉ dùng để lưu thêm thông tin debug chi tiết.

- **A:** Sai vì `Metadata` KHÔNG được đánh chỉ mục (not indexed) nên chỉ xem được khi mở chi tiết từng trace chứ không dùng để lọc/tìm kiếm trên X-Ray được.
- **B:** Sai vì đặt Sampling Rate = 0 sẽ ngừng thu thập các trace thông thường.
- **C (Đúng):** Đúng! `Annotations` trong AWS X-Ray được đánh chỉ mục (indexed) nên có thể dùng trong Filter Expressions để tìm kiếm và gom nhóm trace.
- **D:** Sai vì `_X_AMZN_TRACE_ID` là biến hệ thống chứa Trace ID của X-Ray, ghi đè nó sẽ làm hỏng luồng truy vết.

</details>

---

[← Bộ trước](14-dva-cicd-codepipeline.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md)
