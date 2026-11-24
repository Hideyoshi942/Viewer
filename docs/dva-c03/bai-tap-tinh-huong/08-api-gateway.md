# Bài tập tình huống — Chủ đề 8: Quản lý API — Amazon API Gateway

> REST vs HTTP vs WebSocket API, Lambda Proxy Integration, Stage Variables, Caching, Throttling, Mapping Templates & Authorizers.
> **Số câu hỏi:** 12 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

An API Gateway REST API has two stages: `dev` and `prod`. Both stages point to the same AWS Lambda function, which has two aliases (`dev` and `prod`). How can the developer configure a single API Gateway integration so that requests to the `dev` stage invoke the `dev` Lambda alias and requests to the `prod` stage invoke the `prod` Lambda alias without duplicating the API definition?

- **A.** Define a `lambdaAlias` Stage Variable per stage and use `arn:aws:lambda:region:account:function:myFunc:${stageVariables.lambdaAlias}` in the Integration URI.
- **B.** Use an AWS CloudFormation `Fn::ImportValue` expression inside the API Gateway Integration Request URI to resolve the alias.
- **C.** Configure a Lambda Authorizer (`REQUEST` type) to dynamically rewrite the backend Lambda function ARN per stage.
- **D.** Enable Canary Release Settings on the `dev` stage and point the integration URI directly to the `$LATEST` qualifier.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một API Gateway REST API có hai stage: `dev` và `prod`. Cả hai stage đều trỏ tới cùng một hàm AWS Lambda, vốn có hai alias (`dev` và `prod`). Làm thế nào developer có thể cấu hình một tích hợp API Gateway duy nhất sao cho các request tới stage `dev` gọi alias Lambda `dev` và các request tới stage `prod` gọi alias Lambda `prod` mà không cần nhân đôi định nghĩa API?

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

- **A.** AWS Shield Standard with automatic Layer 3/4 DDoS mitigation enabled on the API Gateway stage
- **B.** AWS WAF (Web Application Firewall) with a Managed SQLi rule group and a Rate-based rule.
- **C.** Amazon GuardDuty with API Gateway anomaly detection and automated IP blocking enabled
- **D.** AWS Network Firewall attached directly to the API Gateway Regional stage for Layer 7 inspection

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một REST API công khai trên Amazon API Gateway đang bị dò quét SQL injection và hứng chịu các đợt request ồ ạt từ các bot độc hại (hơn 2.000 request trong 5 phút từ một địa chỉ IP duy nhất). Dịch vụ AWS nào nên được gắn vào API Gateway stage để tự động chặn các payload SQL injection và giới hạn tốc độ (rate-limit) các IP lạm dụng?

**Đáp án đúng:** **B**

**AWS WAF** bảo vệ ứng dụng web/API ở **Layer 7 (HTTP/HTTPS)**:
- Gắn được vào: **CloudFront, ALB, API Gateway (REST API), AppSync, Cognito User Pools**.
- Tính năng: Chống SQLi/XSS, **Rate-based rules** (chặn IP spam), Geo-blocking.

- **A:** Sai vì Shield Standard chỉ chống tấn công DDoS tầng mạng/truyền tải (Layer 3/4), không kiểm tra được nội dung SQL injection (Layer 7) hay rate-limit theo IP.
- **B (Đúng):** Đúng! **AWS WAF** gắn trực tiếp được vào API Gateway REST API stage (cũng như CloudFront và ALB) để lọc SQL injection, XSS và cấu hình **Rate-based rule** tự động chặn IP vượt ngưỡng request trong 5 phút.
- **C:** Sai vì GuardDuty là dịch vụ phát hiện mối đe dọa (threat detection) thụ động qua log, không trực tiếp chặn HTTP request trước API Gateway.
- **D:** Sai vì AWS Network Firewall bảo vệ lưu lượng mạng trong VPC (Layer 3–7 VPC traffic), không gắn trực tiếp lên API Gateway Regional/Edge stage.

</details>

### Câu 3 `medium`

A developer is building a real-time chat backend using Amazon API Gateway **WebSocket API** and AWS Lambda. When a client sends a message, the Lambda function needs to broadcast that message to 200 connected WebSocket clients whose `connectionId`s are stored in Amazon DynamoDB. How does the Lambda function push messages back to those connected clients?

- **A.** Return an array of all 200 `connectionId` values in the HTTP 200 response body of the `$default` route Lambda.
- **B.** Publish the broadcast message to an Amazon SNS topic subscribed directly by each WebSocket `connectionId` endpoint.
- **C.** Use `SendTaskSuccess` from AWS Step Functions to push the broadcast payload to each connected client `connectionId`.
- **D.** Use `ApiGatewayManagementApi` to call `postToConnection` per `connectionId` via the WebSocket callback URL (`https://{api-id}.execute-api.{region}.amazonaws.com/{stage}`).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer đang xây dựng một backend trò chuyện thời gian thực bằng Amazon API Gateway **WebSocket API** và AWS Lambda. Khi một client gửi tin nhắn, hàm Lambda cần phát sóng (broadcast) tin nhắn đó tới 200 WebSocket client đang kết nối có `connectionId` được lưu trong Amazon DynamoDB. Hàm Lambda đẩy tin nhắn ngược lại cho các client đang kết nối đó như thế nào?

**Đáp án đúng:** **D**

**API Gateway WebSocket API**:
- Các route tích hợp sẵn: `$connect`, `$disconnect`, `$default`, và custom routes.
- Đẩy dữ liệu từ backend xuống client: Dùng **`ApiGatewayManagementApi.postToConnection(ConnectionId, Data)`** (cần quyền IAM `execute-api:ManageConnections`).

- **A:** Sai vì trả về response từ `$default` chỉ gửi lại cho đúng 1 client vừa gửi tin nhắn (nếu bật 2-way), không phát tán được tới 200 client khác.
- **B:** Sai vì SNS không hỗ trợ `connectionId` của API Gateway WebSocket làm subscriber.
- **C:** Sai vì `SendTaskSuccess` dùng cho callback token của Step Functions, không gửi dữ liệu qua WebSocket.
- **D (Đúng):** Đúng! API Gateway WebSocket API sử dụng **`ApiGatewayManagementApi.postToConnection`** (gọi tới callback URL `https://.../@connections/{connectionId}`) để server chủ động đẩy tin nhắn tới từng client đang kết nối.

</details>

### Câu 4 `medium`

A company wants to expose an Amazon API Gateway REST API exclusively to internal microservices running inside a private Amazon VPC. The API must NOT be reachable from the public internet, even with valid credentials. Which API Gateway endpoint type and configuration should the developer choose?

- **A.** Create a Regional API Gateway endpoint and attach an EC2 Security Group directly to the API Gateway stage.
- **B.** Create a Private API Gateway endpoint with an Interface VPC Endpoint (`execute-api`) and a Resource Policy for `aws:SourceVpce` or `aws:SourceVpc`.
- **C.** Create an Edge-optimized API Gateway endpoint with CloudFront Origin Access Control (OAC) and a custom VPC route.
- **D.** Create a Gateway VPC Endpoint for `com.amazonaws.<region>.execute-api` and associate it with the private subnet route table.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty muốn cung cấp một Amazon API Gateway REST API dành riêng cho các microservice nội bộ chạy bên trong một Amazon VPC riêng tư. API KHÔNG được phép truy cập từ public internet, ngay cả khi có thông tin xác thực hợp lệ. Developer nên chọn loại endpoint API Gateway và cấu hình nào?

**Đáp án đúng:** **B**

3 loại Endpoint của **API Gateway REST API**:
- **Edge-optimized**: Đi qua CloudFront Edge toàn cầu (cho user phân tán toàn cầu).
- **Regional**: Nằm tại 1 Region (cho client cùng Region hoặc tự gắn CloudFront riêng).
- **Private**: Chỉ truy cập nội bộ qua **Interface VPC Endpoint (`execute-api`)** + **Resource Policy**.

- **A:** Sai vì Regional endpoint là public endpoint trên internet và API Gateway không gắn Security Group trực tiếp.
- **B (Đúng):** Đúng! **Private REST API** chỉ có thể truy cập từ bên trong VPC thông qua **Interface VPC Endpoint (`com.amazonaws.<region>.execute-api`)** và bắt buộc phải có **Resource Policy** cho phép từ VPC hoặc VPCE đó.
- **C:** Sai vì Edge-optimized đi qua CloudFront công khai trên internet, và OAC chỉ dùng cho S3/Origin.
- **D:** Sai vì Gateway VPC Endpoint chỉ hỗ trợ S3 và DynamoDB; `execute-api` dùng **Interface VPC Endpoint**.

</details>

### Câu 5 `medium`

An AWS Lambda function needs to generate a 12 MB PDF report and return it through an Amazon API Gateway REST API. When testing, the API call fails with an error because the response payload exceeds the synchronous invocation limit. What are the AWS Lambda synchronous payload limit and the recommended workaround?

- **A.** Switch the API Gateway integration to an HTTP API to raise the synchronous Lambda response payload limit to 50 MB.
- **B.** Lambda synchronous responses cap at 6 MB (API Gateway at 10 MB); upload the PDF to S3 and return an S3 pre-signed URL.
- **C.** Increase the AWS Lambda function's memory allocation to 10,240 MB to raise the synchronous response payload quota limit to 20 MB.
- **D.** Invoke the Lambda function with `InvocationType: Event` (asynchronous) and stream the 12 MB PDF in the HTTP response.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm AWS Lambda cần tạo một báo cáo PDF 12 MB và trả về qua một Amazon API Gateway REST API. Khi kiểm thử, lời gọi API thất bại với lỗi vì response payload vượt quá giới hạn gọi đồng bộ. Giới hạn payload đồng bộ của AWS Lambda và giải pháp thay thế được khuyến nghị là gì?

**Đáp án đúng:** **B**

Các **giới hạn Payload** bắt buộc thuộc cho kỳ thi DVA-C02:
- **Lambda Synchronous**: **6 MB** (trừ Lambda Response Streaming tối đa 20 MB khi gọi trực tiếp Function URL).
- **Lambda Asynchronous**: **256 KB**.
- **API Gateway**: **10 MB**.
- **SQS / SNS / EventBridge**: **256 KB** (lớn hơn thì lưu S3 + gửi pointer / Extended Client Library).

- **A:** Sai vì giới hạn 6 MB là giới hạn cứng của AWS Lambda Synchronous Invocation API, đổi sang HTTP API không làm tăng giới hạn này.
- **B (Đúng):** Đúng! Payload đồng bộ của Lambda tối đa **6 MB** (bất đồng bộ là **256 KB**, và API Gateway là **10 MB**). Để trả về file 12 MB, chuẩn kiến trúc là Lambda upload file lên S3 rồi trả về **S3 Pre-signed URL** cho client tải trực tiếp.
- **C:** Sai vì tăng RAM không thay đổi giới hạn payload 6 MB.
- **D:** Sai vì Asynchronous Invocation có giới hạn payload còn nhỏ hơn (256 KB) và không trả về response body trực tiếp cho HTTP client.

</details>

### Câu 6 `hard`

A company deploys a REST API on Amazon API Gateway (`prod` stage) that experiences occasional burst traffic and needs protection against backend overload. The team also wants to sell tiered API access (`Basic`: 1,000 requests/day; `Pro`: 100,000 requests/day) to external partners. Which TWO API Gateway configurations satisfy these requirements? (Choose two.)

- **A.** Use an API Gateway HTTP API because Usage Plans and API Keys are exclusive to HTTP APIs rather than REST APIs.
- **B.** Configure Stage Throttling (`Rate` and `Burst` limits) on the `prod` stage to protect the backend from overall traffic spikes.
- **C.** Set AWS Lambda `ReservedConcurrency` to `0` on the backend function to throttle excess partner requests.
- **D.** Create API Keys and Usage Plans (`Basic`, `Pro`) with daily Quotas and throttling, requiring `x-api-key` on methods.
- **E.** Use Amazon Route 53 Weighted Routing policies to enforce per-partner daily HTTP request quotas and API burst rate limits.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty triển khai một REST API trên Amazon API Gateway (stage `prod`) thỉnh thoảng gặp lưu lượng tăng đột biến và cần được bảo vệ chống quá tải backend. Nhóm cũng muốn bán quyền truy cập API theo gói (`Basic`: 1.000 request/ngày; `Pro`: 100.000 request/ngày) cho các đối tác bên ngoài. HAI cấu hình API Gateway nào đáp ứng các yêu cầu này? (Chọn hai đáp án.)

**Đáp án đúng:** **B, D**

**API Gateway Throttling & Monetization (REST API)**:
- Mặc định toàn account: **10,000 req/s** và **5,000 burst**.
- **Usage Plans + API Keys (`x-api-key`)**: Đặt Rate/Burst và **Quota** (ngày/tuần/tháng) cho từng khách hàng/đối tác (lưu ý: API Key KHÔNG thay thế cho IAM/Cognito Authentication).

- **A:** Sai ngược hoàn toàn: Usage Plans và API Keys chỉ hỗ trợ trên **REST API**, không hỗ trợ trên HTTP API.
- **B (Đúng):** Đúng! **Method/Stage Throttling** giới hạn tốc độ (`requests/second`) và `Burst` (token bucket) ở cấp độ toàn Stage/Method để bảo vệ backend khỏi quá tải.
- **C:** Sai vì đặt `ReservedConcurrency = 0` sẽ chặn 100% lời gọi tới hàm Lambda.
- **D (Đúng):** Đúng! **Usage Plans + API Keys** là tính năng chuẩn của API Gateway REST API để phân gói cước (throttling + quota ngày/tuần/tháng) cho từng đối tác thông qua header `x-api-key`.
- **E:** Sai vì Route 53 chỉ định tuyến DNS, không đếm quota HTTP request theo từng đối tác.

</details>

### Câu 7 `hard`

An Amazon API Gateway REST API has **Stage Caching** enabled (TTL: 300 seconds) for the `GET /products` endpoint. A developer pushes a critical price fix to the database, and an admin user wants to bypass the API Gateway cache for a single request to immediately verify the fresh price and refresh the cache. What must the admin request include and what IAM permission is needed?

- **A.** Send `x-api-key: invalidate` on the `GET /products` request without requiring any IAM permissions.
- **B.** Send `Cache-Control: max-age=0` on `GET /products`, and ensure the caller has `execute-api:InvalidateCache` (or allow cache invalidation).
- **C.** Create a CloudFront Cache Invalidation targeting the Amazon API Gateway Regional endpoint URL.
- **D.** Restart or redeploy the backend AWS Lambda function to flush the API Gateway stage cache.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một Amazon API Gateway REST API đã bật **Stage Caching** (TTL: 300 giây) cho endpoint `GET /products`. Một developer đẩy bản sửa giá quan trọng vào cơ sở dữ liệu, và một người dùng admin muốn bỏ qua cache của API Gateway cho một request duy nhất để xác minh ngay giá mới và làm mới cache. Request của admin phải bao gồm gì và cần quyền IAM nào?

**Đáp án đúng:** **B**

**API Gateway Cache Invalidation**:
- Header: **`Cache-Control: max-age=0`**.
- Quyền IAM: **`execute-api:InvalidateCache`** (hoặc tắt yêu cầu authorization trong cấu hình Cache nếu muốn cho phép tự do — nhưng dễ bị tấn công làm cạn cache).
- Xóa toàn bộ cache stage: Gọi `FlushStageCache` trên Console/CLI.

- **A:** Sai vì API Gateway dùng `Cache-Control: max-age=0` và kiểm tra quyền `execute-api:InvalidateCache`, không có header `x-api-key: invalidate`.
- **B (Đúng):** Đúng! Để ép **API Gateway Stage Cache** bỏ qua cache và gọi xuống backend làm mới dữ liệu, client gửi header **`Cache-Control: max-age=0`** (hoặc `no-cache`) và caller cần quyền IAM **`execute-api:InvalidateCache`** (mặc định API Gateway yêu cầu xác thực quyền này để tránh user thường spam làm sập backend).
- **C:** Sai vì CloudFront Invalidation chỉ xóa cache của CloudFront, không xóa được Stage Cache nội bộ của API Gateway Regional endpoint.
- **D:** Sai vì API Gateway cache nằm ở tầng API Gateway, không bị xóa khi Lambda khởi động lại.

</details>

### Câu 8 `medium`

An Amazon API Gateway REST API uses a Lambda Authorizer (`REQUEST` type) that checks both the `Authorization` header and a query string parameter `tenantId`. After enabling Authorization Caching (`AuthorizerResultTtlInSeconds: 300`), users of `tenantId=B` start receiving `403` or seeing access permissions belonging to `tenantId=A`! Why?

- **A.** API Gateway REST APIs do not support query string parameters in `REQUEST` Lambda Authorizers.
- **B.** The Lambda Authorizer's Identity Sources only included `Authorization` and omitted `querystring.tenantId`, reusing cached policies across tenants.
- **C.** Lambda Authorizers cannot return `Allow` IAM policies when `AuthorizerResultTtlInSeconds` caching is enabled.
- **D.** The Lambda Authorizer must persist the generated IAM policy to Amazon DynamoDB instead of returning it to API Gateway.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một Amazon API Gateway REST API sử dụng một Lambda Authorizer (loại `REQUEST`) kiểm tra cả header `Authorization` và tham số query string `tenantId`. Sau khi bật Authorization Caching (`AuthorizerResultTtlInSeconds: 300`), người dùng của `tenantId=B` bắt đầu nhận được lỗi `403` hoặc nhìn thấy quyền truy cập thuộc về `tenantId=A`! Tại sao?

**Đáp án đúng:** **B**

Bẫy thi **Lambda Authorizer Caching**:
- Tất cả các tham số đầu vào quyết định quyền (`Authorization` header, `tenantId` query string, stage variable...) đều **PHẢI** khai báo trong **Identity Sources** để làm Cache Key.

- **A:** Sai vì API Gateway hỗ trợ đầy đủ query string parameters.
- **B (Đúng):** Đúng! Với `REQUEST` Lambda Authorizer bật caching, API Gateway dùng các **Identity Sources** làm Cache Key. Nếu thiếu `method.request.querystring.tenantId` trong Identity Sources, mọi request có cùng `Authorization` header (dù khác `tenantId`) sẽ dùng chung 1 kết quả cache!
- **C:** Sai vì Lambda Authorizer cache trả về cả `Allow` và `Deny` IAM policies.
- **D:** Sai vì Lambda Authorizer trả về IAM Policy JSON trực tiếp cho API Gateway.

</details>

### Câu 9 `medium`

A developer uses AWS Lambda with an Amazon API Gateway REST API. Every day at 09:00 AM, hundreds of users hit the API simultaneously, and 20% of requests take 8 seconds because of Lambda Cold Starts. The team has budget to pay for guaranteed sub-100 ms response times for the first 30 concurrent invocations at 09:00 AM, using a Node.js 20 runtime. Which feature should be configured?

- **A.** Enable AWS Lambda SnapStart directly on the Node.js 20 `$LATEST` version to cache microVM memory.
- **B.** Set Reserved Concurrency to `30` on the `$LATEST` qualifier so 30 warm containers stay idle.
- **C.** Configure Lambda Provisioned Concurrency (`30`) on a Published Version or Alias (scheduled via Application Auto Scaling).
- **D.** Increase the API Gateway integration timeout to 60 seconds to accommodate the 8-second cold starts.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer sử dụng AWS Lambda với một Amazon API Gateway REST API. Mỗi ngày lúc 09:00 sáng, hàng trăm người dùng truy cập API đồng thời và 20% request mất 8 giây do Lambda Cold Start. Nhóm có ngân sách để trả cho thời gian phản hồi được đảm bảo dưới 100 ms cho 30 lượt gọi đồng thời đầu tiên lúc 09:00 sáng, sử dụng runtime Node.js 20. Tính năng nào nên được cấu hình?

**Đáp án đúng:** **C**

**Provisioned Concurrency** trên Lambda:
- Hỗ trợ **mọi runtime** (Node.js, Python, Java, Go, .NET, Container Image).
- Phải gắn trên **Version hoặc Alias** (không gắn trên `$LATEST`).
- Có thể kết hợp **Application Auto Scaling** (Scheduled Scaling) để bật trước 09:00 và tắt vào ban đêm.

- **A:** Sai vì 2 lý do: (1) SnapStart chỉ hỗ trợ Java, Python và .NET (chưa hỗ trợ Node.js), và (2) SnapStart chỉ áp dụng trên Published Version, không dùng trên `$LATEST`.
- **B:** Sai vì Reserved Concurrency không giữ ấm container nên không loại bỏ được Cold Start.
- **C (Đúng):** Đúng! **Provisioned Concurrency** giữ ấm sẵn 30 môi trường thực thi (hỗ trợ mọi runtime kể cả **Node.js 20**, khác với SnapStart vốn chỉ hỗ trợ Java/Python/.NET) và có thể lập lịch bằng Application Auto Scaling để tiết kiệm chi phí ngoài giờ hành chính.
- **D:** Sai vì API Gateway có giới hạn cứng mặc định 29 giây và tăng timeout không làm giảm Cold Start 8 giây.

</details>

### Câu 10 `medium`

A company runs a high-throughput REST API on Amazon API Gateway backed by AWS Lambda and Amazon DynamoDB. During a load test, 15% of requests fail with `HTTP 429 Too Many Requests` and `HTTP 504 Gateway Timeout`. Which TWO actions directly address these two specific error codes? (Choose two.)

- **A.** For `504 Gateway Timeout`: Increase the API Gateway REST API Integration Timeout from 29 seconds to 15 minutes (900 seconds) in the console.
- **B.** For `429 Too Many Requests`: Set Lambda `ReservedConcurrency` to `0` on the backend function to stabilize request bursts.
- **C.** For `429`: Raise API Gateway Stage/Method Throttling limits (or Lambda account concurrency quota if `TooManyRequestsException`).
- **D.** For both `429` and `504`: Disable HTTPS TLS termination on the Amazon API Gateway custom domain endpoint.
- **E.** For `504`: Optimize Lambda (Memory/CPU, connection reuse) or decouple asynchronously with SQS/Step Functions under 29 seconds.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty vận hành một REST API thông lượng cao trên Amazon API Gateway được hỗ trợ bởi AWS Lambda và Amazon DynamoDB. Trong một bài kiểm thử tải, 15% request thất bại với lỗi `HTTP 429 Too Many Requests` và `HTTP 504 Gateway Timeout`. HAI hành động nào giải quyết trực tiếp hai mã lỗi cụ thể này? (Chọn hai đáp án.)

**Đáp án đúng:** **C, E**

Xử lý bộ đôi **`429` vs `504` trên API Gateway**:
- **`429`**: Throttling (API Gateway Rate/Burst, Usage Plan, hoặc Lambda Concurrency).
- **`504`**: Chạm trần **29 giây** của API Gateway -> tối ưu Lambda hoặc chuyển sang **Async Pattern** (`API Gateway -> SQS / Step Functions -> 202 Accepted`).

- **A:** Sai vì API Gateway REST/HTTP API có giới hạn integration timeout tối đa chỉ là **29 giây** (không thể đặt 900 giây như Lambda).
- **B:** Sai vì đặt `ReservedConcurrency = 0` sẽ khiến 100% request bị lỗi `429`.
- **C (Đúng):** Đúng! `429` là lỗi **Throttling**: có thể do API Gateway Stage/Usage Plan throttling hoặc do Lambda chạm giới hạn concurrency của account/hàm.
- **D:** Sai vì API Gateway bắt buộc HTTPS và điều này không liên quan đến throttling hay 29s timeout.
- **E (Đúng):** Đúng! `504 Gateway Timeout` trên API Gateway xảy ra khi backend mất quá **29 giây** (giới hạn cứng của API Gateway) mà chưa trả về phản hồi -> cần tối ưu tốc độ Lambda hoặc chuyển sang xử lý bất đồng bộ (`202 Accepted` + SQS/Step Functions).

</details>

### Câu 11 `hard`

A developer builds an API Gateway REST API backed by a Lambda function that experiences noticeable latency spikes (Cold Starts) for the first few requests after idle periods because it initializes a large ML dependency inside a VPC. The developer tries setting Reserved Concurrency to 50, but Cold Starts still occur. Why did Reserved Concurrency fail, and what should the developer use instead?

- **A.** Reserved Concurrency only works with API Gateway HTTP APIs, not with REST APIs.
- **B.** Increase the Lambda function execution timeout from 3 seconds to 900 seconds.
- **C.** Reserved Concurrency only caps max concurrency; configure Provisioned Concurrency to keep execution environments pre-initialized.
- **D.** Move the dependency and SDK initialization code inside the Lambda `handler` function.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer xây dựng một API Gateway REST API được hỗ trợ bởi một hàm Lambda gặp tình trạng tăng vọt độ trễ đáng kể (Cold Start) cho một vài request đầu tiên sau thời gian nhàn rỗi vì nó khởi tạo một dependency ML lớn bên trong VPC. Developer thử đặt Reserved Concurrency bằng 50, nhưng Cold Start vẫn xảy ra. Tại sao Reserved Concurrency không giải quyết được, và developer nên sử dụng gì thay thế?

**Đáp án đúng:** **C**

Bẫy rất hay gặp trong DVA-C02:
- **Reserved Concurrency** = Giới hạn trần (throttle protection) & cô lập quota.
- **Provisioned Concurrency** = Khởi tạo sẵn container ấm để loại bỏ **Cold Start**.

- **A:** Sai, tính năng concurrency của Lambda độc lập với loại API Gateway.
- **B:** Sai, timeout không làm giảm Cold Start.
- **C (Đúng):** Đúng! **Reserved Concurrency** chỉ dành sẵn quota và đặt trần concurrency, không khởi tạo sẵn container. **Provisioned Concurrency** mới khởi tạo sẵn môi trường thực thi ấm để triệt tiêu Cold Start.
- **D:** Sai! Đặt code khởi tạo trong `handler` còn làm chậm mọi invocation kể cả warm start.

</details>

### Câu 12 `medium`

A web application backed by Amazon API Gateway and AWS Lambda returns `HTTP 504 Gateway Timeout` errors to users whenever a complex report generation request takes 35 seconds to finish in the Lambda function. The developer increases the Lambda function timeout to 60 seconds, but API Gateway still returns `HTTP 504` after 29 seconds. Why does this happen, and how should the developer architect the solution?

- **A.** API Gateway drops connections when S3 lacks versioned report keys; enable S3 Object Versioning and S3 Transfer Acceleration on the frontend static website hosting bucket.
- **B.** API Gateway has a 29-second default integration timeout; decouple report generation asynchronously with SQS or Step Functions, return `202 Accepted` with a job ID, and notify or let the client poll when ready.
- **C.** API Gateway caches `HTTP 504` responses at the edge; override the HTTP status code in the browser using frontend CSS and increase the CloudFront origin read timeout to 60 seconds.
- **D.** API Gateway requires the Lambda timeout to be shorter than the API Gateway timeout; decrease the Lambda function timeout to 3 seconds and enable provisioned concurrency.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng web được hỗ trợ bởi Amazon API Gateway và AWS Lambda trả về lỗi `HTTP 504 Gateway Timeout` cho người dùng bất cứ khi nào một yêu cầu tạo báo cáo phức tạp mất 35 giây để hoàn thành trong hàm Lambda. Developer tăng timeout của hàm Lambda lên 60 giây, nhưng API Gateway vẫn trả về `HTTP 504` sau 29 giây. Tại sao điều này xảy ra và developer nên thiết kế lại giải pháp như thế nào?

**Đáp án đúng:** **B**

Bảng mã lỗi **Amazon API Gateway** cần thuộc lòng:
- **`400 Bad Request`**: Request không khớp Request Validator schema.
- **`403 Forbidden`**: Bị chặn bởi WAF, Resource Policy, thiếu API Key hoặc sai IAM/Lambda Authorizer.
- **`429 Too Many Requests`**: Vượt quá giới hạn Throttling (`Rate limit` / `Burst limit`) hoặc Usage Plan Quota.
- **`502 Bad Gateway`**: Hàm Lambda trả về JSON sai định dạng yêu cầu của **Lambda Proxy Integration** (`statusCode`, `headers`, `body`).
- **`504 Gateway Timeout`**: Backend/Lambda chạy quá thời gian **Integration Timeout (29 giây)**.

- **A:** Sai vì S3 Versioning không liên quan đến thời gian xử lý của API Gateway.
- **B (Đúng):** Đúng! Giới hạn Integration Timeout mặc định của API Gateway là **29 giây** (`HTTP 504`). Với các tác vụ xử lý lâu hơn (như xuất báo cáo 35–60 giây), kiến trúc chuẩn là chuyển sang xử lý bất đồng bộ (Asynchronous pattern: API Gateway -> SQS/Lambda async -> lưu S3 -> thông báo kết quả).
- **C:** Sai vì CSS chỉ định dạng giao diện chứ không thay đổi được giới hạn timeout của API Gateway.
- **D:** Sai vì giảm timeout của Lambda xuống 3 giây sẽ làm hàm bị ngắt sớm hơn nữa.

</details>

---

[← Chủ đề 07](07-dynamodb.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chủ đề 09 →](09-messaging-sqs-sns-kinesis.md)
