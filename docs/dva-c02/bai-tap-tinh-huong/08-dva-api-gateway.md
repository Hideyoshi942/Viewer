# Bài tập tình huống — Chủ đề 8: Quản lý API — Amazon API Gateway

> REST vs HTTP vs WebSocket API, Lambda Proxy Integration, Stage Variables, Caching, Throttling, Mapping Templates & Authorizers.
> **Số câu hỏi:** 12 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án & Giải thích chi tiết**.

---

### Câu 1 `hard`

An API Gateway REST API has two stages: `dev` and `prod`. Both stages point to the same AWS Lambda function, which has two aliases (`dev` and `prod`). How can the developer configure a single API Gateway integration so that requests to the `dev` stage invoke the `dev` Lambda alias and requests to the `prod` stage invoke the `prod` Lambda alias without duplicating the API definition?

- **A.** Define a `lambdaAlias` stage variable on each stage and use `arn:aws:lambda:region:account:function:myFunc:${stageVariables.lambdaAlias}` in the Integration URI.
- **B.** Use an AWS CloudFormation `Fn::ImportValue` expression inside the API Gateway Integration Request URI to dynamically resolve the Lambda alias ARN for each stage.
- **C.** Configure a Lambda Authorizer on each API Gateway method to dynamically rewrite the backend Lambda integration ARN per stage.
- **D.** Enable API Gateway Canary Release on the `dev` stage and point 100% of stage traffic directly to the `$LATEST` Lambda version.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

**API Gateway Stage Variables**:
- Khai báo biến riêng cho từng Stage (ví dụ `lambdaAlias = dev` trên stage `dev`, `lambdaAlias = prod` trên stage `prod`).
- Dùng cú pháp `${stageVariables.lambdaAlias}` trong Integration URI hoặc HTTP endpoint URL.
- Bẫy thi: Phải chạy `aws lambda add-permission` cấp quyền cho **từng Alias ARN** (`:function:myFunc:dev` và `:function:myFunc:prod`).

- **A (Đúng):** Đúng! **API Gateway Stage Variables** (`${stageVariables.<name>}`) hoạt động như biến môi trường theo từng stage, cho phép 1 API trỏ động tới Lambda Alias tương ứng (`dev` hoặc `prod`). Lưu ý cần cấp quyền `lambda:InvokeFunction` cho từng ARN alias.
- **B:** Sai vì `Fn::ImportValue` chỉ được đánh giá lúc deploy CloudFormation chứ không thay đổi động theo stage khi runtime.
- **C:** Sai vì Lambda Authorizer chỉ trả về IAM Policy và context, không thể thay đổi Integration URI của backend.
- **D:** Sai vì Canary Release dùng để chia % traffic giữa các bản triển khai trên cùng 1 stage, không dùng để tách biệt stage `dev` và `prod`.

</details>

### Câu 2 `easy`

A public REST API on Amazon API Gateway is experiencing SQL injection probes and excessive request bursts from malicious bots (more than 2,000 requests per 5 minutes from a single IP address). Which AWS service should be attached to the API Gateway stage to automatically block SQL injection payloads and rate-limit abusive IPs?

- **A.** Amazon GuardDuty enabled in the account to inline-block malicious HTTP query strings at CloudFront.
- **B.** AWS WAF (Web Application Firewall) with a Managed SQLi rule group and a Rate-based rule.
- **C.** AWS Network Firewall deployed in front of the CloudFront edge locations to inspect Layer 7 SQLi.
- **D.** AWS Shield Standard enabled automatically on the CloudFront distribution to block SQL injection payloads.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

**AWS WAF** bảo vệ ứng dụng web/API ở **Layer 7 (HTTP/HTTPS)**:
- Gắn được vào: **CloudFront, ALB, API Gateway (REST API), AppSync, Cognito User Pools**.
- Tính năng: Chống SQLi/XSS, **Rate-based rules** (chặn IP spam), Geo-blocking.

- **A:** Sai vì GuardDuty là dịch vụ phát hiện mối đe dọa (threat detection) thụ động qua log, không trực tiếp chặn HTTP request trước API Gateway.
- **B (Đúng):** Đúng! **AWS WAF** gắn trực tiếp được vào API Gateway REST API stage (cũng như CloudFront và ALB) để lọc SQL injection, XSS và cấu hình **Rate-based rule** tự động chặn IP vượt ngưỡng request trong 5 phút.
- **C:** Sai vì AWS Network Firewall bảo vệ lưu lượng mạng trong VPC (Layer 3–7 VPC traffic), không gắn trực tiếp lên API Gateway Regional/Edge stage.
- **D:** Sai vì Shield Standard chỉ chống tấn công DDoS tầng mạng/truyền tải (Layer 3/4), không kiểm tra được nội dung SQL injection (Layer 7) hay rate-limit theo IP.

</details>

### Câu 3 `medium`

A developer is building a real-time chat backend using Amazon API Gateway **WebSocket API** and AWS Lambda. When a client sends a message, the Lambda function needs to broadcast that message to 200 connected WebSocket clients whose `connectionId`s are stored in Amazon DynamoDB. How does the Lambda function push messages back to those connected clients?

- **A.** Publish the JSON notification message to an Amazon SNS topic subscribed directly by each WebSocket `connectionId`.
- **B.** Return an array of all 200 `connectionId` values in the HTTP response body of the `$default` route Lambda function.
- **C.** Call `SendTaskSuccess` from AWS Step Functions with the WebSocket `connectionId` as the task token.
- **D.** Use `ApiGatewayManagementApi.postToConnection` for each `connectionId` via the WebSocket callback URL.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

**API Gateway WebSocket API**:
- Các route tích hợp sẵn: `$connect`, `$disconnect`, `$default`, và custom routes.
- Đẩy dữ liệu từ backend xuống client: Dùng **`ApiGatewayManagementApi.postToConnection(ConnectionId, Data)`** (cần quyền IAM `execute-api:ManageConnections`).

- **A:** Sai vì SNS không hỗ trợ `connectionId` của API Gateway WebSocket làm subscriber.
- **B:** Sai vì trả về response từ `$default` chỉ gửi lại cho đúng 1 client vừa gửi tin nhắn (nếu bật 2-way), không phát tán được tới 200 client khác.
- **C:** Sai vì `SendTaskSuccess` dùng cho callback token của Step Functions, không gửi dữ liệu qua WebSocket.
- **D (Đúng):** Đúng! API Gateway WebSocket API sử dụng **`ApiGatewayManagementApi.postToConnection`** (gọi tới callback URL `https://.../@connections/{connectionId}`) để server chủ động đẩy tin nhắn tới từng client đang kết nối.

</details>

### Câu 4 `medium`

A company wants to expose an Amazon API Gateway REST API exclusively to internal microservices running inside a private Amazon VPC. The API must NOT be reachable from the public internet, even with valid credentials. Which API Gateway endpoint type and configuration should the developer choose?

- **A.** Create a Regional API Gateway endpoint and attach an EC2 Security Group directly to the API Gateway stage.
- **B.** Create a Gateway VPC Endpoint for `execute-api` and associate it with the private subnet route tables.
- **C.** Create an Edge-optimized API Gateway endpoint with CloudFront Origin Access Control (OAC) enabled.
- **D.** Create a Private API Gateway, attach an Interface VPC Endpoint (`execute-api`), and set a Resource Policy for `aws:SourceVpce`.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

3 loại Endpoint của **API Gateway REST API**:
- **Edge-optimized**: Đi qua CloudFront Edge toàn cầu (cho user phân tán toàn cầu).
- **Regional**: Nằm tại 1 Region (cho client cùng Region hoặc tự gắn CloudFront riêng).
- **Private**: Chỉ truy cập nội bộ qua **Interface VPC Endpoint (`execute-api`)** + **Resource Policy**.

- **A:** Sai vì Regional endpoint là public endpoint trên internet và API Gateway không gắn Security Group trực tiếp.
- **B:** Sai vì Gateway VPC Endpoint chỉ hỗ trợ S3 và DynamoDB; `execute-api` dùng **Interface VPC Endpoint**.
- **C:** Sai vì Edge-optimized đi qua CloudFront công khai trên internet, và OAC chỉ dùng cho S3/Origin.
- **D (Đúng):** Đúng! **Private REST API** chỉ có thể truy cập từ bên trong VPC thông qua **Interface VPC Endpoint (`com.amazonaws.<region>.execute-api`)** và bắt buộc phải có **Resource Policy** cho phép từ VPC hoặc VPCE đó.

</details>

### Câu 5 `medium`

An AWS Lambda function needs to generate a 12 MB PDF report and return it through an Amazon API Gateway REST API. When testing, the API call fails with an error because the response payload exceeds the synchronous invocation limit. What are the AWS Lambda synchronous payload limit and the recommended workaround?

- **A.** Increase the Lambda function's memory allocation to 10,240 MB to automatically raise the synchronous payload response limit to 20 MB.
- **B.** Invoke the Lambda function asynchronously via API Gateway and wait for the 12 MB PDF binary in the HTTP response.
- **C.** Synchronous Lambda has a 6 MB payload limit (API Gateway 10 MB); upload the PDF to S3 and return an S3 pre-signed URL.
- **D.** Switch the API Gateway integration to an HTTP API to raise the synchronous Lambda response payload limit to 50 MB.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Các **giới hạn Payload** bắt buộc thuộc cho kỳ thi DVA-C02:
- **Lambda Synchronous**: **6 MB** (trừ Lambda Response Streaming tối đa 20 MB khi gọi trực tiếp Function URL).
- **Lambda Asynchronous**: **256 KB**.
- **API Gateway**: **10 MB**.
- **SQS / SNS / EventBridge**: **256 KB** (lớn hơn thì lưu S3 + gửi pointer / Extended Client Library).

- **A:** Sai vì tăng RAM không thay đổi giới hạn payload 6 MB.
- **B:** Sai vì Asynchronous Invocation có giới hạn payload còn nhỏ hơn (256 KB) và không trả về response body trực tiếp cho HTTP client.
- **C (Đúng):** Đúng! Payload đồng bộ của Lambda tối đa **6 MB** (bất đồng bộ là **256 KB**, và API Gateway là **10 MB**). Để trả về file 12 MB, chuẩn kiến trúc là Lambda upload file lên S3 rồi trả về **S3 Pre-signed URL** cho client tải trực tiếp.
- **D:** Sai vì giới hạn 6 MB là giới hạn cứng của AWS Lambda Synchronous Invocation API, đổi sang HTTP API không làm tăng giới hạn này.

</details>

### Câu 6 `hard` *(Chọn nhiều đáp án)*

A company deploys a REST API on Amazon API Gateway (`prod` stage) that experiences occasional burst traffic and needs protection against backend overload. The team also wants to sell tiered API access (`Basic`: 1,000 requests/day; `Pro`: 100,000 requests/day) to external partners. Which TWO API Gateway configurations satisfy these requirements? (Choose two.)

- **A.** Use an API Gateway HTTP API because Usage Plans and API Keys are exclusive to HTTP APIs and not REST APIs.
- **B.** Set Lambda `ReservedConcurrency` to `0` on the backend function to enforce per-partner daily request quotas.
- **C.** Configure Stage Throttling (`Rate` and `Burst` limits) on the `prod` stage to protect the backend from overall traffic spikes.
- **D.** Use Amazon Route 53 Weighted Routing records to enforce per-partner daily request quotas at the DNS layer.
- **E.** Create API Keys and Usage Plans (`Basic` and `Pro`) with daily Quotas and per-key throttling, and require `x-api-key` on the API methods.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**, **E**

**API Gateway Throttling & Monetization (REST API)**:
- Mặc định toàn account: **10,000 req/s** và **5,000 burst**.
- **Usage Plans + API Keys (`x-api-key`)**: Đặt Rate/Burst và **Quota** (ngày/tuần/tháng) cho từng khách hàng/đối tác (lưu ý: API Key KHÔNG thay thế cho IAM/Cognito Authentication).

- **A:** Sai ngược hoàn toàn: Usage Plans và API Keys chỉ hỗ trợ trên **REST API**, không hỗ trợ trên HTTP API.
- **B:** Sai vì đặt `ReservedConcurrency = 0` sẽ chặn 100% lời gọi tới hàm Lambda.
- **C (Đúng):** Đúng! **Method/Stage Throttling** giới hạn tốc độ (`requests/second`) và `Burst` (token bucket) ở cấp độ toàn Stage/Method để bảo vệ backend khỏi quá tải.
- **D:** Sai vì Route 53 chỉ định tuyến DNS, không đếm quota HTTP request theo từng đối tác.
- **E (Đúng):** Đúng! **Usage Plans + API Keys** là tính năng chuẩn của API Gateway REST API để phân gói cước (throttling + quota ngày/tuần/tháng) cho từng đối tác thông qua header `x-api-key`.

</details>

### Câu 7 `hard`

An Amazon API Gateway REST API has **Stage Caching** enabled (TTL: 300 seconds) for the `GET /products` endpoint. A developer pushes a critical price fix to the database, and an admin user wants to bypass the API Gateway cache for a single request to immediately verify the fresh price and refresh the cache. What must the admin request include and what IAM permission is needed?

- **A.** Send the custom `x-api-key: invalidate` HTTP header without requiring any IAM permissions.
- **B.** Restart the backend Lambda function container to flush the API Gateway stage cache.
- **C.** Send `Cache-Control: max-age=0` in `GET /products` AND ensure the caller has `execute-api:InvalidateCache` permission.
- **D.** Create a CloudFront Invalidation directly on the API Gateway Regional endpoint stage to clear all cached API responses.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

**API Gateway Cache Invalidation**:
- Header: **`Cache-Control: max-age=0`**.
- Quyền IAM: **`execute-api:InvalidateCache`** (hoặc tắt yêu cầu authorization trong cấu hình Cache nếu muốn cho phép tự do — nhưng dễ bị tấn công làm cạn cache).
- Xóa toàn bộ cache stage: Gọi `FlushStageCache` trên Console/CLI.

- **A:** Sai vì API Gateway dùng `Cache-Control: max-age=0` và kiểm tra quyền `execute-api:InvalidateCache`, không có header `x-api-key: invalidate`.
- **B:** Sai vì API Gateway cache nằm ở tầng API Gateway, không bị xóa khi Lambda khởi động lại.
- **C (Đúng):** Đúng! Để ép **API Gateway Stage Cache** bỏ qua cache và gọi xuống backend làm mới dữ liệu, client gửi header **`Cache-Control: max-age=0`** (hoặc `no-cache`) và caller cần quyền IAM **`execute-api:InvalidateCache`** (mặc định API Gateway yêu cầu xác thực quyền này để tránh user thường spam làm sập backend).
- **D:** Sai vì CloudFront Invalidation chỉ xóa cache của CloudFront, không xóa được Stage Cache nội bộ của API Gateway Regional endpoint.

</details>

### Câu 8 `medium`

An Amazon API Gateway REST API uses a Lambda Authorizer (`REQUEST` type) that checks both the `Authorization` header and a query string parameter `tenantId`. After enabling Authorization Caching (`AuthorizerResultTtlInSeconds: 300`), users of `tenantId=B` start receiving `403` or seeing access permissions belonging to `tenantId=A`! Why?

- **A.** API Gateway REST APIs do not support query string parameters on Lambda Authorizer routes.
- **B.** The Lambda Authorizer must write the policy to DynamoDB instead of returning it.
- **C.** The Authorizer's Identity Sources listed `Authorization` but omitted `method.request.querystring.tenantId`, reusing cached policies.
- **D.** Lambda Authorizers cannot return `Allow` IAM policies whenever authorization caching is enabled on the API Gateway REST API stage.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Bẫy thi **Lambda Authorizer Caching**:
- Tất cả các tham số đầu vào quyết định quyền (`Authorization` header, `tenantId` query string, stage variable...) đều **PHẢI** khai báo trong **Identity Sources** để làm Cache Key.

- **A:** Sai vì API Gateway hỗ trợ đầy đủ query string parameters.
- **B:** Sai vì Lambda Authorizer trả về IAM Policy JSON trực tiếp cho API Gateway.
- **C (Đúng):** Đúng! Với `REQUEST` Lambda Authorizer bật caching, API Gateway dùng các **Identity Sources** làm Cache Key. Nếu thiếu `method.request.querystring.tenantId` trong Identity Sources, mọi request có cùng `Authorization` header (dù khác `tenantId`) sẽ dùng chung 1 kết quả cache!
- **D:** Sai vì Lambda Authorizer cache trả về cả `Allow` và `Deny` IAM policies.

</details>

### Câu 9 `medium`

A developer uses AWS Lambda with an Amazon API Gateway REST API. Every day at 09:00 AM, hundreds of users hit the API simultaneously, and 20% of requests take 8 seconds because of Lambda Cold Starts. The team has budget to pay for guaranteed sub-100 ms response times for the first 30 concurrent invocations at 09:00 AM, using a Node.js 20 runtime. Which feature should be configured?

- **A.** Enable AWS Lambda SnapStart on the Node.js 20 `$LATEST` version to pre-initialize execution environments.
- **B.** Increase the API Gateway integration timeout to 60 seconds to absorb Node.js cold starts.
- **C.** Configure Lambda Provisioned Concurrency (`30`) on a Published Version or Alias (and optionally schedule it with Application Auto Scaling).
- **D.** Set Reserved Concurrency to `30` on `$LATEST` so 30 warm containers stay running during business hours.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

**Provisioned Concurrency** trên Lambda:
- Hỗ trợ **mọi runtime** (Node.js, Python, Java, Go, .NET, Container Image).
- Phải gắn trên **Version hoặc Alias** (không gắn trên `$LATEST`).
- Có thể kết hợp **Application Auto Scaling** (Scheduled Scaling) để bật trước 09:00 và tắt vào ban đêm.

- **A:** Sai vì 2 lý do: (1) SnapStart chỉ hỗ trợ Java, Python và .NET (chưa hỗ trợ Node.js), và (2) SnapStart chỉ áp dụng trên Published Version, không dùng trên `$LATEST`.
- **B:** Sai vì API Gateway có giới hạn cứng mặc định 29 giây và tăng timeout không làm giảm Cold Start 8 giây.
- **C (Đúng):** Đúng! **Provisioned Concurrency** giữ ấm sẵn 30 môi trường thực thi (hỗ trợ mọi runtime kể cả **Node.js 20**, khác với SnapStart vốn chỉ hỗ trợ Java/Python/.NET) và có thể lập lịch bằng Application Auto Scaling để tiết kiệm chi phí ngoài giờ hành chính.
- **D:** Sai vì Reserved Concurrency không giữ ấm container nên không loại bỏ được Cold Start.

</details>

### Câu 10 `medium` *(Chọn nhiều đáp án)*

A company runs a high-throughput REST API on Amazon API Gateway backed by AWS Lambda and Amazon DynamoDB. During a load test, 15% of requests fail with `HTTP 429 Too Many Requests` and `HTTP 504 Gateway Timeout`. Which TWO actions directly address these two specific error codes? (Choose two.)

- **A.** For `429`: Check and raise API Gateway Stage/Method Throttling limits (or Lambda account concurrency quota).
- **B.** For both `429` and `504`: Disable HTTPS on API Gateway to eliminate TLS handshake overhead.
- **C.** For `504 Gateway Timeout`: Increase the API Gateway Integration Timeout to 15 minutes (900 seconds) in Stage configuration settings.
- **D.** For `429 Too Many Requests`: Set Lambda `ReservedConcurrency` to `0` on the backend function.
- **E.** For `504`: Optimize Lambda (more Memory/CPU, reuse DB connections, or async SQS/Step Functions) to finish under 29 seconds.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**, **E**

Xử lý bộ đôi **`429` vs `504` trên API Gateway**:
- **`429`**: Throttling (API Gateway Rate/Burst, Usage Plan, hoặc Lambda Concurrency).
- **`504`**: Chạm trần **29 giây** của API Gateway -> tối ưu Lambda hoặc chuyển sang **Async Pattern** (`API Gateway -> SQS / Step Functions -> 202 Accepted`).

- **A (Đúng):** Đúng! `429` là lỗi **Throttling**: có thể do API Gateway Stage/Usage Plan throttling hoặc do Lambda chạm giới hạn concurrency của account/hàm.
- **B:** Sai vì API Gateway bắt buộc HTTPS và điều này không liên quan đến throttling hay 29s timeout.
- **C:** Sai vì API Gateway REST/HTTP API có giới hạn integration timeout tối đa chỉ là **29 giây** (không thể đặt 900 giây như Lambda).
- **D:** Sai vì đặt `ReservedConcurrency = 0` sẽ khiến 100% request bị lỗi `429`.
- **E (Đúng):** Đúng! `504 Gateway Timeout` trên API Gateway xảy ra khi backend mất quá **29 giây** (giới hạn cứng của API Gateway) mà chưa trả về phản hồi -> cần tối ưu tốc độ Lambda hoặc chuyển sang xử lý bất đồng bộ (`202 Accepted` + SQS/Step Functions).

</details>

### Câu 11 `hard`

A developer builds an API Gateway REST API backed by a Lambda function that experiences noticeable latency spikes (Cold Starts) for the first few requests after idle periods because it initializes a large ML dependency inside a VPC. The developer tries setting Reserved Concurrency to 50, but Cold Starts still occur. Why did Reserved Concurrency fail, and what should the developer use instead?

- **A.** Increase the Lambda function timeout from 3 seconds to 900 seconds to avoid cold starts.
- **B.** Reserved Concurrency only works with API Gateway HTTP APIs, not REST APIs.
- **C.** Move the dependency initialization code inside the Lambda `handler` function for faster warm-up.
- **D.** Reserved Concurrency only caps maximum concurrent executions; configure Provisioned Concurrency to keep execution environments pre-initialized.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Bẫy rất hay gặp trong DVA-C02:
- **Reserved Concurrency** = Giới hạn trần (throttle protection) & cô lập quota.
- **Provisioned Concurrency** = Khởi tạo sẵn container ấm để loại bỏ **Cold Start**.

- **A:** Sai, timeout không làm giảm Cold Start.
- **B:** Sai, tính năng concurrency của Lambda độc lập với loại API Gateway.
- **C:** Sai! Đặt code khởi tạo trong `handler` còn làm chậm mọi invocation kể cả warm start.
- **D (Đúng):** Đúng! **Reserved Concurrency** chỉ dành sẵn quota và đặt trần concurrency, không khởi tạo sẵn container. **Provisioned Concurrency** mới khởi tạo sẵn môi trường thực thi ấm để triệt tiêu Cold Start.

</details>

### Câu 12 `medium`

A web application backed by Amazon API Gateway and AWS Lambda returns `HTTP 504 Gateway Timeout` errors to users whenever a complex report generation request takes 35 seconds to finish in the Lambda function. The developer increases the Lambda function timeout to 60 seconds, but API Gateway still returns `HTTP 504` after 29 seconds. Why does this happen, and how should the developer architect the solution?

- **A.** Configure the frontend web application to override the `HTTP 504 Gateway Timeout` status code in the browser using custom CSS rules and automatically retry the synchronous request.
- **B.** Decrease the AWS Lambda function timeout setting from 15 minutes down to 3 seconds so that the report generation finishes before Amazon API Gateway times out.
- **C.** Enable Amazon S3 Object Versioning and Transfer Acceleration on the static frontend hosting bucket to speed up the synchronous API Gateway to Lambda integration.
- **D.** API Gateway has a 29-second integration timeout; decouple requests via SQS or Step Functions, return `202 Accepted` with a job ID, and notify or let clients poll when ready in S3.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Bảng mã lỗi **Amazon API Gateway** cần thuộc lòng:
- **`400 Bad Request`**: Request không khớp Request Validator schema.
- **`403 Forbidden`**: Bị chặn bởi WAF, Resource Policy, thiếu API Key hoặc sai IAM/Lambda Authorizer.
- **`429 Too Many Requests`**: Vượt quá giới hạn Throttling (`Rate limit` / `Burst limit`) hoặc Usage Plan Quota.
- **`502 Bad Gateway`**: Hàm Lambda trả về JSON sai định dạng yêu cầu của **Lambda Proxy Integration** (`statusCode`, `headers`, `body`).
- **`504 Gateway Timeout`**: Backend/Lambda chạy quá thời gian **Integration Timeout (29 giây)**.

- **A:** Sai vì CSS chỉ định dạng giao diện chứ không thay đổi được giới hạn timeout của API Gateway.
- **B:** Sai vì giảm timeout của Lambda xuống 3 giây sẽ làm hàm bị ngắt sớm hơn nữa.
- **C:** Sai vì S3 Versioning không liên quan đến thời gian xử lý của API Gateway.
- **D (Đúng):** Đúng! Giới hạn Integration Timeout mặc định của API Gateway là **29 giây** (`HTTP 504`). Với các tác vụ xử lý lâu hơn (như xuất báo cáo 35–60 giây), kiến trúc chuẩn là chuyển sang xử lý bất đồng bộ (Asynchronous pattern: API Gateway -> SQS/Lambda async -> lưu S3 -> thông báo kết quả).

</details>

---

[← Bộ trước](07-dva-dynamodb.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Bộ tiếp theo →](09-dva-messaging-sqs-sns-kinesis.md)
