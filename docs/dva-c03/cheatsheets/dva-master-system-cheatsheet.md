# AWS Certified Developer – Associate (DVA-C02)
# Tài liệu ôn thi có hệ thống: kiến thức + liên hệ thực tế

> **Nguồn:** biên soạn lại từ bộ ghi chú 33 chương "AWS DVA – Bài học" (file bạn gửi).
> **Cách biên soạn:** không giữ nguyên thứ tự chương gốc. Toàn bộ kiến thức được sắp xếp lại theo **4 domain của đề thi DVA-C02**, mỗi mục gồm: **kiến thức cốt lõi → bảng so sánh → bẫy thi → liên hệ thực tế**.
> **Lưu ý về tên file gốc:** khi giải nén, tên các file chương bị lỗi mã hóa (chỉ còn "Ch") nhưng nội dung còn nguyên vẹn. Chương 02 không tồn tại trong bộ ghi chú (nhảy từ 01 sang 03). Các file rác `.remember` (log của một công cụ khác) đã được loại bỏ, không đưa vào tài liệu này.
> **Lưu ý về số liệu:** một số con số trong video cũ đã được AWS cập nhật. Trong tài liệu này, con số nào là **"số của đề thi"** (đề vẫn dùng) và con số nào là **"cập nhật thực tế 2025–2026"** đều được ghi rõ, để bạn không bị rối khi gặp đáp án cũ trong đề.

---

## 0. Tổng quan kỳ thi và chiến lược học

### 0.1. Cấu trúc đề thi DVA-C02

| Mục | Giá trị |
|---|---|
| Mã đề | DVA-C02 (thay DVA-C01 từ đầu 2023) |
| Số câu | 65 câu = 50 câu tính điểm + 15 câu thử nghiệm (không biết câu nào là câu thử) |
| Thời gian | 130 phút (+30 phút nếu được duyệt ESL → 160 phút) |
| Điểm đỗ | 720/1000 (thang scaled). Không trừ điểm khi sai → **không bỏ trống câu nào** |
| Lệ phí | 150 USD (giảm 50% nếu có voucher từ một chứng chỉ AWS đã đỗ) |
| Hình thức | Pearson VUE tại trung tâm hoặc online (OnVUE) |
| Hiệu lực | 3 năm |
| Dạng câu | Multiple choice (1 đáp án) và multiple response (đề ghi rõ "Choose two/three") |

### 0.2. Tỷ trọng 4 domain — và cách phân bổ thời gian ôn

| Domain | Tỷ trọng | Học gì là chính | Gợi ý thời gian ôn |
|---|---|---|---|
| **1. Development with AWS Services** | **32%** | Lambda, API Gateway, DynamoDB, S3, SQS/SNS/Kinesis, Step Functions, ECS, SDK/CLI | Nhiều nhất |
| **2. Security** | **26%** | IAM/STS, Cognito, KMS, Secrets Manager, SSM Parameter Store, S3 security | Nhiều thứ hai |
| **3. Deployment** | **24%** | CloudFormation, SAM, CDK, Beanstalk, CodeCommit/Build/Deploy/Pipeline | Vừa |
| **4. Troubleshooting and Optimization** | **18%** | CloudWatch, X-Ray, CloudTrail, EventBridge, tối ưu chi phí/hiệu năng | Ít nhất nhưng không được bỏ |

**Chiến lược làm bài (rút từ 65 câu practice test cuối chương 33):**
1. **Đọc từ khóa trước, đọc scenario sau.** Đề DVA-C02 chủ yếu là câu tình huống; từ khóa quyết định đáp án (xem Bảng tra nhanh ở Phần 7).
2. **Loại trừ trước, chọn sau.** Đáp án có dịch vụ/API không tồn tại (ví dụ `RemoveQueue`, "IAM Role trong Security Group") → loại ngay. Đáp án hard-code credentials, dùng root user, tự viết nhiều code khi đã có dịch vụ managed → hầu như luôn sai.
3. **Khi 2 đáp án đều đúng, chọn đáp án đơn giản hơn, ít vận hành hơn (managed/serverless).** Đáp án "khả thi nhưng rất phức tạp" thường là sai.
4. **Phân bổ thời gian:** ~2 phút/câu. Lượt đầu làm nhanh câu chắc chắn, flag câu phân vân, dành 15–20 phút cuối rà lại.
5. **Ngưỡng sẵn sàng:** làm practice exam đến khi ổn định **trên 80%**, đọc kỹ giải thích cả câu đúng lẫn sai.
6. **Nếu bạn không phải người bản ngữ tiếng Anh:** xin **ESL +30 phút TRƯỚC khi đặt lịch thi** (đặt lịch trước rồi mới xin thì phải hủy lịch cũ đặt lại).

### 0.3. Bản đồ chương gốc → domain thi (để tra cứu ngược khi cần)

| Chương gốc | Rơi vào domain chính |
|---|---|
| 04 IAM & CLI, 12 CLI/SDK/Roles, 29 Advanced Identity | Domain 2 |
| 05 EC2, 06 Storage, 07 ELB+ASG, 08 RDS/Aurora/ElastiCache, 09 Route 53, 10 VPC | Nền tảng (hỏi ít, nhưng là nền cho mọi domain) |
| 11–15 S3, CloudFront | Domain 1 + 2 (bảo mật S3) |
| 16 ECS/ECR/Fargate, 17 Beanstalk | Domain 1 + 3 |
| 18 CloudFormation, 25 SAM, 26 CDK, 24 CI/CD | Domain 3 |
| 19 SQS/SNS/Kinesis, 21 Lambda, 22 DynamoDB, 23 API Gateway, 28 Step Functions/AppSync | Domain 1 |
| 20 CloudWatch/X-Ray/CloudTrail | Domain 4 |
| 27 Cognito, 30 KMS/SSM/Secrets, 31 Other Services | Domain 2 (31 chỉ ở mức nhận diện) |

---

## DOMAIN 1 — DEVELOPMENT WITH AWS SERVICES (32%)

### 1.1. Lambda — dịch vụ quan trọng nhất của domain này

**Khái niệm cốt lõi:**
- **Serverless ≠ không có server.** Nghĩa là bạn không provision/vá OS/lo scale server; chỉ deploy code, trả theo mức dùng.
- **3 cách gọi (invocation) — phải phân biệt rạch ròi:**
  - **Sync (đồng bộ):** caller chờ kết quả. API Gateway, ALB, CLI/SDK (`RequestResponse`), Cognito triggers, Step Functions, Lex/Alexa. **Lambda không retry; client tự retry.**
  - **Async (bất đồng bộ):** caller không chờ, nhận 202. S3, SNS, EventBridge, CloudWatch Logs subscription, SES, CloudFormation custom resource. Event vào internal queue; lỗi **retry tổng 1 + 2 lần** (~1 phút rồi ~2 phút). Vì retry nên function **phải idempotent**.
  - **Event Source Mapping (ESM):** Lambda tự poll nguồn rồi gọi **đồng bộ theo batch**. Kinesis, DynamoDB Streams, SQS/SQS FIFO, MSK, MQ, DocumentDB. Nguồn không gọi Lambda nên **không cần resource-based policy**; quyền đọc nguồn nằm ở **execution role**.
- **Execution role vs Resource-based policy (cặp hay hỏi nhất):**
  - Execution role = quyền Lambda **gọi ra** (DynamoDB, S3, SQS, ghi log, poll ESM).
  - Resource-based policy = quyền **gọi vào** Lambda (S3, SNS, EventBridge, ALB, API Gateway, cross-account), quản lý bằng `aws lambda add-permission`.
- **Event vs Context:** event = dữ liệu JSON từ nguồn; context = metadata runtime (`aws_request_id`, `function_name`, `memory_limit_in_mb`, `get_remaining_time_in_millis()`...).
- **Lambda trong VPC:** mặc định chạy ngoài VPC (vào được internet/public AWS API, không vào được RDS/ElastiCache private). Muốn vào VPC: chỉ định VPC + subnets + security groups, role `AWSLambdaVPCAccessExecutionRole`. **Public subnet không giúp có internet** (Lambda không có public IP) → cần **private subnet + NAT Gateway** hoặc **VPC Endpoint**. CloudWatch Logs vẫn hoạt động không cần NAT/endpoint.
- **Hiệu năng:** init nặng (DB connection, SDK client) để **ngoài handler** để tái sử dụng execution context. `/tmp` là đĩa tạm, còn lại khi context frozen nhưng không bền vững.
- **Layers:** zip thư viện dùng chung, giải nén vào `/opt`, version bất biến, chia sẻ cross-account/public.
- **EFS cho Lambda:** phải chạy trong VPC, qua **EFS Access Point**; mỗi Lambda instance = 1 EFS connection.
- **Versions & Aliases:** `$LATEST` mutable; **version immutable**; **alias mutable**, trỏ tới version, hỗ trợ **weighted alias** (tối đa 2 version, ví dụ canary). **Alias không trỏ tới alias khác.** Trigger nên trỏ vào alias.
- **Function URL:** HTTPS endpoint riêng, không cần API Gateway/ALB; gắn với **alias hoặc `$LATEST`** (không gắn version số cụ thể); `AuthType NONE` (public) hoặc `AWS_IAM` (SigV4; cross-account cần **cả** identity-based **và** resource-based policy).
- **DLQ vs Destinations (hay nhầm):** DLQ (SQS/SNS) chỉ nhận **event gốc** sau khi hết retry của async. **Destinations** (AWS khuyên dùng thay DLQ): gửi **invocation record** (request + response/lỗi + metadata) cho **On success và On failure** tới SQS, SNS, Lambda, EventBridge (+ S3 cho On failure). Destinations **không kích hoạt với sync**. Với ESM, destination chỉ cho **batch bị loại bỏ (On failure)**.
- **Cold start & Concurrency:**
  - **Reserved Concurrency:** giới hạn trần + dành riêng pool, miễn phí. Đặt = 0 = "tắt" function. **Không giảm cold start.**
  - **Provisioned Concurrency:** làm ấm sẵn instance, loại bỏ cold start, đặt trên version/alias (không đặt trên `$LATEST`), tính phí thêm.
  - **SnapStart:** chụp snapshot microVM sau init lúc publish version, resume nhanh tới 10 lần; Java 11+, Python 3.12+, .NET 8+; chỉ cho published version, không dùng chung với provisioned concurrency, EFS, ephemeral storage > 512 MB.
  - **Lambda@Edge:** phải dùng version cụ thể (không `$LATEST`/alias), viết ở us-east-1, không hỗ trợ env vars, Layers, VPC, ARM64, container image, provisioned concurrency; log nằm ở region gần edge location đã chạy.

**Con số phải nhớ (Lambda):**

| Hạng mục | Giá trị |
|---|---|
| Timeout | Mặc định 3 giây, tối đa **900 giây (15 phút)**; dài hơn → Fargate/ECS/EC2/Batch hoặc Step Functions |
| Memory | 128 MB – 10.240 MB, bước 1 MB; **tăng RAM = tăng CPU + network** (không có setting CPU riêng); 1.769 MB ≈ 1 vCPU, tối đa 6 vCPU ở 10 GB |
| Ephemeral storage `/tmp` | 512 MB (mặc định) – 10 GB |
| Env vars | Tổng tối đa 4 KB; gắn với version (publish là đóng băng); `update-function-configuration` **thay toàn bộ** tập biến |
| Payload | Sync 6 MB (request và response); async **256 KB theo đề thi** (AWS đã nâng lên 1 MB cuối 2025) |
| Concurrency mặc định | 1.000 concurrent executions/account/region (soft limit); sync throttle → 429; async throttle → retry tới 6 giờ |
| Deployment | Zip upload trực tiếp 50 MB (nén); giải nén (code + layers) 250 MB; container image 10 GB; tối đa 5 layers/function; code storage mỗi region 75 GB |
| ESM | Batch window tối đa 300 giây; Parallelization Factor tối đa 10 batch/shard (streams); SQS Standard batch 1–10; khuyến nghị **visibility timeout SQS = 6 × Lambda timeout** |
| ALB + Lambda | Response body tối đa 1 MB; sai định dạng (thiếu `statusCode`, body không phải string) → 502 |

**Bẫy thi Lambda:**
- Function chậm vì CPU → **tăng memory**, không tăng timeout (Lambda không có setting CPU riêng).
- Sync lỗi trong code vẫn trả HTTP 200 (kèm header `X-Amz-Function-Error: Unhandled`); 429/413 mới là lỗi tầng service. Đừng nhầm 202 (async) với "xử lý thành công".
- **DLQ của Lambda chỉ dành cho async.** SQS qua ESM muốn DLQ thì cấu hình redrive policy/DLQ **trên SQS queue**, không phải trên Lambda; streams thì dùng bisect batch, max retry, max record age, on-failure destination, partial batch response (`ReportBatchItemFailures`).
- **Streams lỗi → cả batch retry, shard bị chặn** để giữ thứ tự; muốn chỉ retry record lỗi → `ReportBatchItemFailures`.
- **SQS FIFO:** concurrency tối đa = **số message group đang hoạt động**.
- Một function "ăn" hết 1.000 concurrency làm function khác throttle → đặt reserved concurrency.
- **S3 → Lambda vòng lặp vô hạn:** function ghi thumbnail vào chính bucket với cùng filter → tự trigger lại; tránh bằng bucket khác hoặc prefix tách biệt (`uploads/` → `thumbnails/`).
- **S3 key trong event bị URL-encode** (dấu cách thành `+`): quên decode → `NoSuchKey`.
- CloudFormation không cập nhật code nếu chỉ đổi nội dung zip trên S3 mà không đổi `S3ObjectVersion` → bật versioning và truyền `S3ObjectVersion` mới.

**Liên hệ thực tế — Lambda:**
1. **Tạo thumbnail khi upload ảnh:** User upload ảnh lên S3 → **S3 Event Notification (async) → Lambda** tạo thumbnail, lưu thumbnail vào bucket khác + metadata vào DynamoDB. Vì không cần trả kết quả ngay, chạy song song hàng nghìn file, lỗi retry 3 lần rồi vào DLQ/Destination.
2. **API bị chậm ở request đầu tiên (cold start, Java):** chọn **Provisioned Concurrency** (trên alias/version, có thể auto scaling) hoặc **SnapStart** (Java 11+). Reserved concurrency chỉ giới hạn/dành pool, không làm ấm instance nên không giải quyết được bài này.

### 1.2. API Gateway — cổng vào của ứng dụng serverless

**Khái niệm cốt lõi:**
- **REST API:** Resource (đường dẫn, ví dụ `/houses`) → Method (GET, POST…) → Integration. Mọi thay đổi chỉ có hiệu lực khi **Deploy lên stage**. Sửa API mà không thấy thay đổi → thường là **chưa deploy**.
- **5 loại integration:** Lambda function, HTTP, **MOCK** (tự trả response, dev/test, không dùng production), AWS service, VPC Link.
  - **Lambda proxy (AWS_PROXY):** chuyển toàn bộ request thành `event`; Lambda phải tự trả `statusCode`, `headers`, `body` (body là chuỗi, phải `json.dumps`).
  - **Lambda non-proxy / HTTP / AWS non-proxy:** cho phép sửa request/response qua **mapping templates (VTL)** — đổi tên/sửa query string, body, headers, lọc/che trường, chuyển JSON ↔ XML/SOAP. **Mapping template chỉ dùng cho non-proxy.**
  - **HTTP_PROXY:** chuyển thẳng request tới HTTP backend, có thể thêm header bí mật mà client không thấy.
  - **AWS Service integration:** expose trực tiếp AWS API, ví dụ client gửi dữ liệu vào Kinesis/SQS mà **không cần AWS credentials**.
- **Stage và Deployment:** stage là môi trường deploy (`dev`, `test`, `prod`…), mỗi stage có cấu hình riêng, giữ lịch sử deployment nên **rollback** được bằng cách chuyển stage về deployment cũ.
- **Stage Variables:** giống biến môi trường của stage, cú pháp `${stageVariables.variableName}`; dùng để thay đổi cấu hình mà không cần redeploy, đặc biệt trỏ tới **Lambda alias** (stage `dev` → alias `DEV`, `prod` → alias `PROD`). Dùng stage variable trong ARN Lambda thì phải tự `lambda add-permission` cho từng alias. **Không lưu secret trong stage variables** (hiển thị plain text).
- **Canary Deployment:** đưa một phần nhỏ traffic tới deployment mới trên cùng stage; metrics/logs của canary tách riêng, có thể override stage variables; khi ổn thì **Promote** (100% traffic sang bản mới). Canary của API Gateway **không tự động rollback theo alarm** như CodeDeploy.
- **Caching:** cache theo stage, override được theo method; cache hit thì trả luôn không gọi backend. Quên khai báo query string/header làm cache key → mọi user nhận cùng kết quả, có thể rò rỉ dữ liệu.
- **Usage Plans & API Keys:** usage plan định nghĩa ai được truy cập stage/method nào, throttling và quota; API key nhận diện và đo lường từng khách hàng. Thứ tự: method bật `API key required = true` → deploy → tạo/import API key → tạo usage plan → **gắn stage và API key vào usage plan** (quên bước này thì không hoạt động). Client gửi key qua header `x-api-key`. **API key không phải cơ chế xác thực/bảo mật** — chỉ nhận diện và đo lường; phải kết hợp IAM, Cognito hoặc Lambda Authorizer mới bảo mật thật sự. Usage plans/API keys **chỉ có ở REST API, HTTP API không hỗ trợ**.
- **Request Validation:** kiểm tra request **trước khi** gọi backend; không hợp lệ → trả ngay **400 Bad Request**, giảm call thừa tới backend.
- **CORS:** cơ chế của trình duyệt; trình duyệt gửi pre-flight bằng method **OPTIONS**, response phải có `Access-Control-Allow-Methods/Headers/Origin`. Với Lambda proxy, **Lambda phải tự trả header CORS** trong response của method thật. Bật CORS trên console nhưng trình duyệt vẫn lỗi → do (1) quên deploy, (2) Lambda proxy không trả header, hoặc (3) response lỗi 4xx/5xx do API Gateway sinh ra thiếu header → thêm header vào Gateway Responses (`DEFAULT_4XX`, `DEFAULT_5XX`).
- **OpenAPI (Swagger):** chuẩn định nghĩa REST API dưới dạng code (YAML/JSON). API Gateway hỗ trợ import OpenAPI 3.0/Swagger 2.0, export API hiện có, và sinh client SDK.
- **Bảo mật API Gateway (3 cơ chế + resource policy):**
  - **IAM (SigV4):** cho truy cập nội bộ AWS; quyền `execute-api:Invoke`.
  - **Resource Policy:** policy JSON gắn lên API Gateway; dùng cho cross-account, IP allow/deny list, chỉ cho phép từ VPC Endpoint (Private API). Chỉ có hiệu lực sau khi deploy lại.
  - **Cognito User Pools:** API Gateway xác minh trực tiếp với Cognito, **không cần code tùy chỉnh**; hỗ trợ federation Facebook, Google…
  - **Lambda Authorizer (Custom Authorizer):** linh hoạt nhất; token-based (Bearer/JWT/OAuth) hoặc request-based (headers, query strings, stage variables, context); Lambda trả về IAM principal + IAM policy, kết quả được cache (TTL mặc định 300 giây). Bẫy: nếu `Resource` chỉ là `methodArn` của method hiện tại, user gọi method khác trong thời gian cache có thể bị 403 → thường trả `Resource` dạng wildcard hoặc tắt cache khi debug.
- **WebSocket API:** giao tiếp hai chiều, stateful, server chủ động push; chat, cộng tác, game nhiều người, giao dịch tài chính real-time. Client mở kết nối persistent; server gửi ngược về client bằng HTTP POST (ký SigV4) tới `@connections/{connectionId}`. Routing theo route selection expression (ví dụ `$request.body.action`); các route mặc định: `$connect`, `$disconnect`, `$default`.
- **Giám sát:** CloudWatch Logs ở cấp stage, CloudWatch Metrics, **X-Ray** trace xuyên suốt API Gateway → Lambda → DynamoDB. Cần cấu hình CloudWatch Logs role ARN ở API Gateway Settings trước khi bật execution logs cho REST API.
- **Mã lỗi hay gặp:** 400 = request không hợp lệ; 403 = không có quyền/WAF chặn/gọi API không ký SigV4 với IAM auth; 429 = throttling (retry bằng exponential backoff); 502 = Lambda proxy trả response sai định dạng hoặc backend lỗi; 503 = backend không khả dụng; 504 = integration timeout (quá 29 giây).

**Con số phải nhớ (API Gateway):**

| Hạng mục | Giá trị |
|---|---|
| Integration timeout REST API | Mặc định **29 giây** (tối thiểu 50 ms), dù Lambda chạy tối đa 15 phút. Regional/Private REST API có thể xin tăng vượt 29 giây qua Service Quotas |
| Payload tối đa REST API | 10 MB (upload file lớn nên dùng S3 pre-signed URL) |
| Cache | TTL mặc định 300 giây, tối thiểu 0, tối đa 3600 giây; dung lượng 0,5 GB – 237 GB; mặc định chỉ GET được cache |
| Throttling cấp account mặc định | 10.000 request/giây cho tất cả API trong account (mỗi region), soft limit |
| Lambda Authorizer cache TTL | Mặc định 300 giây |
| WebSocket | Kết nối tối đa 2 giờ, idle timeout 10 phút, frame tối đa 32 KB, message tối đa 128 KB |

**REST API vs HTTP API vs WebSocket API:**

| Tính năng | REST API | HTTP API | WebSocket API |
|---|---|---|---|
| Giá / độ trễ | Cao hơn | **Rẻ hơn nhiều, độ trễ thấp** | — |
| Integration | Đầy đủ (proxy và non-proxy) | Chỉ proxy; không data mapping | Lambda, DynamoDB, HTTP endpoint… |
| Mapping templates (VTL) | Có | Không | Không |
| Usage plans / API keys | Có | **Không** | Không |
| Caching | Có | **Không** | Không |
| Resource policies | Có | **Không** | Không |
| Request validation / Canary | Có | Không | Không |
| Endpoint | Edge-Optimized / Regional / Private | Chỉ Regional | — |
| AWS WAF trực tiếp | Có | Không | Không |
| JWT authorizer native (OIDC/OAuth 2.0) | Không (dùng Lambda/Cognito authorizer) | **Có** | Không |
| CORS | Cấu hình thủ công (OPTIONS) | **Tích hợp sẵn** | — |
| Kiểu giao tiếp | Request/response | Request/response | **Hai chiều, real-time, stateful** |

**Endpoint types:** Edge-Optimized (mặc định, cho client toàn cầu, qua CloudFront Edge; chứng chỉ ACM cho custom domain phải ở **us-east-1**) | Regional (client cùng region; chứng chỉ ACM cùng region với API) | Private (không public, chỉ truy cập từ trong VPC qua interface VPC endpoint + resource policy).

**Bẫy thi API Gateway:**
- **"Missing Authentication Token"** thường không phải thiếu token mà là **sai path/method hoặc chưa deploy**.
- **502 "Malformed Lambda proxy response":** Lambda proxy bắt buộc trả object có `statusCode` và `body` là **chuỗi**; trả thẳng dict là sai.
- Tạo API bằng CLI/IaC mà quên `lambda add-permission` → lỗi 500 "Invalid permissions on Lambda function"; console tự làm bước này nhưng CLI thì không. Với integration Lambda, `--integration-http-method` **luôn là POST** bất kể method của client.
- **Latency cao nhưng IntegrationLatency thấp** → chậm ở tầng API Gateway (authorizer Lambda chậm, mapping template…); cả hai cao → backend chậm.
- **Custom domain Edge-Optimized:** tạo certificate ACM ở region của API rồi không chọn được → nhớ **Edge → us-east-1**.
- **Canary:** "thử API mới với một phần nhỏ traffic" → **Canary release trên stage**, không phải tạo stage mới + Route 53 weighted record; cũng không phải chỉ đổi Lambda alias (đó là canary ở tầng Lambda/CodeDeploy).
- **Private API** cần resource policy + VPC endpoint; **cross-account** cần IAM + resource policy, không chỉ IAM policy một phía.
- **"Cho client ghi vào Kinesis/SQS mà không cấp AWS credentials"** → AWS Service integration (dù Lambda cũng làm được, đáp án thi ưu tiên service integration).

**Liên hệ thực tế — API Gateway:**
1. **API serverless cho web/mobile:** Client → API Gateway (REST API) → Lambda → DynamoDB. Dùng **stage `dev/test/prod`** với **stage variables trỏ tới Lambda alias**; bật **Cognito User Pools authorizer** cho người dùng cuối (kể cả qua Facebook/Google) mà không cần tự viết code xác thực; bật **caching cho stage prod** nếu nhiều GET trả cùng dữ liệu; dùng **X-Ray** khi cần trace request xuyên suốt.
2. **Chat real-time và bán API:** cần server push → **WebSocket API** (lưu `connectionId` vào DynamoDB ở `$connect`, xóa ở `$disconnect`, server POST tới `@connections/{connectionId}`). Cung cấp API cho nhiều khách hàng, bán gói trả phí → **REST API + Usage Plans & API Keys** (throttle/quota theo khách); chỉ cần proxy Lambda/HTTP rẻ và nhanh → **HTTP API**.

### 1.3. DynamoDB — NoSQL serverless, hay hỏi nhất về tính toán

**Khái niệm cốt lõi:**
- **DynamoDB:** NoSQL **fully managed, serverless**, scale ngang cả đọc lẫn ghi, tự replicate qua nhiều AZ, độ trễ mili-giây một chữ số, tích hợp IAM; **không JOIN, không aggregation (SUM/AVG)** — dữ liệu cần cho một truy vấn nên nằm trong một item. Chỉ tạo **table** (không tạo database). Item **schemaless ngoài key**.
- **Primary Key (chọn trước khi tạo bảng, không đổi được):**
  - **Partition Key (HASH)** — duy nhất mỗi item.
  - **Partition Key + Sort Key (HASH + RANGE)** — tổ hợp duy nhất, dữ liệu nhóm theo Partition Key, sắp xếp theo Sort Key.
  - Chọn Partition Key có **cardinality cao nhất** (ví dụ `movie_id`, `user_id`); tránh attribute ít giá trị/lệch gây skew/hot partition.
- **Capacity modes:** **Provisioned** — khai báo RCU/WCU trước, trả theo capacity đã provision (dùng hay không cũng trả), có thể bật Auto Scaling; **On-Demand** — tự scale theo tải, không khai báo capacity, trả theo request thực tế (RRU/WRU), phù hợp tải không dự đoán được/dev.
- **RCU/WCU — công thức tính (làm bài tập tính toán trong đề):**
  - **1 WCU = 1 ghi/giây cho item tối đa 1 KB** (làm tròn lên KB kế tiếp).
  - **1 RCU = 1 Strongly Consistent Read/giây hoặc 2 Eventually Consistent Read/giây cho item tối đa 4 KB** (làm tròn lên bội số 4 KB).
  - Đọc mặc định là **eventually consistent** (có thể stale < 1 giây); strongly consistent bật bằng `ConsistentRead=true`, **tốn gấp đôi RCU**.
  - RCU/WCU **chia đều cho các partition**; vượt ở cấp partition cũng gây `ProvisionedThroughputExceededException` dù tổng bảng chưa vượt → xử lý bằng exponential backoff, phân tán key, DAX nếu đọc nhiều một item.
  - **Ví dụ:** 10 item/giây × 2 KB = **20 WCU**; 16 eventually read/giây × 12 KB = (16/2) × (12/4) = **24 RCU**; 10 strongly read/giây × 6 KB → làm tròn 8 KB = **20 RCU**.
- **API đọc/ghi:** `PutItem` (tạo hoặc **thay toàn bộ** item cùng key; mặc định ghi đè âm thầm), `UpdateItem` (sửa một phần, hoặc tạo mới nếu chưa có; `SET/REMOVE/ADD/DELETE`, atomic counter), `GetItem` (theo Primary Key), `DeleteItem`, `DeleteTable`. `Query` (bắt buộc Partition Key `=`, Sort Key `=, <, <=, >, >=, BETWEEN, begins_with`; tối đa 1 MB/lần, phân trang), `Scan` (đọc toàn bảng rồi mới lọc — tốn nhiều RCU; nhanh nhất dùng **Parallel Scan** chia segment; giảm ảnh hưởng bằng `Limit`).
- **Expression — đừng nhầm 3 loại:**
  - `KeyConditionExpression` (điều kiện key cho Query).
  - `FilterExpression` (lọc **sau khi đọc**, Query/Scan, **không giảm RCU**).
  - `ProjectionExpression` (chỉ lấy một số attribute).
  - `ConditionExpression` (quyết định ghi thành công hay không).
- **Conditional Writes:** áp dụng cho `PutItem`, `UpdateItem`, `DeleteItem`, `TransactWriteItems` (lưu ý: **BatchWriteItem không hỗ trợ ConditionExpression** cho từng request). Hàm hay dùng: `attribute_exists`, `attribute_not_exists`, `attribute_type`, `contains`, `begins_with`, `IN`, `BETWEEN`, `size`. Điều kiện sai → `ConditionalCheckFailedException`. Không ghi đè item đã có: `attribute_not_exists(partition_key)`. Ghi thất bại do điều kiện **vẫn tốn WCU**.
- **Optimistic Locking:** Conditional Write + attribute **version**: đọc (version = 1), ghi kèm điều kiện `version = 1` và tăng lên 2; client tới sau thấy version đổi → thất bại, phải **đọc lại rồi retry**. Phù hợp khi xung đột hiếm; DynamoDB không có pessimistic lock native.
- **Secondary Index:**

| | LSI | GSI |
|---|---|---|
| Partition Key | Giống bảng gốc | Khác (tuỳ chọn) |
| Sort Key | Khác bảng gốc | Tuỳ chọn |
| Thời điểm tạo | **Chỉ lúc tạo bảng** | Bất kỳ lúc nào |
| Giới hạn | 5/bảng | 20/bảng (soft limit) |
| Capacity | Dùng RCU/WCU bảng gốc | Riêng |
| Consistency | Eventually hoặc Strongly | **Chỉ Eventually** |
| Throttling riêng | Không | Có — **GSI throttle kéo theo bảng chính throttle** |
| Khác | Giới hạn **10 GB mỗi giá trị Partition Key (item collection)** | Item không có attribute key của GSI thì không xuất hiện trong GSI (**sparse index**) |

  - Projection: `KEYS_ONLY`, `INCLUDE`, `ALL`.
- **PartiQL:** ngôn ngữ tương thích SQL: `SELECT, INSERT, UPDATE, DELETE`, batch, transaction; **không JOIN, không thêm khả năng mới**. `SELECT` có điều kiện Partition Key → chạy như GetItem/Query (rẻ); không có điều kiện Partition Key → Scan toàn bảng (đắt).
- **DAX:** cache **in-memory, fully managed, highly available** giữa ứng dụng và DynamoDB; độ trễ **microsecond** cho dữ liệu đã cache; **gần như không cần sửa logic ứng dụng** (chỉ đổi client/endpoint); ghi **write-through**; có **item cache** (GetItem/BatchGetItem) và **query cache** (Query/Scan). Giải quyết **hot key**. DAX chỉ trả eventually consistent (`ConsistentRead=true` chuyển thẳng xuống DynamoDB).
- **DAX ≠ ElastiCache:** DAX cache item/query DynamoDB, gần như không sửa code; ElastiCache cache kết quả aggregation do ứng dụng tự lưu.
- **DynamoDB Streams:** luồng **có thứ tự** các thay đổi cấp item (INSERT/MODIFY/REMOVE), **lưu tối đa 24 giờ**, **không retroactive** (chỉ thay đổi sau khi bật stream). 4 view type: `KEYS_ONLY`, `NEW_IMAGE`, `OLD_IMAGE`, `NEW_AND_OLD_IMAGES`. Đọc bằng Lambda qua **Event Source Mapping** hoặc KCL, hoặc gửi sang Kinesis Data Streams. Dùng cho phản ứng thời gian thực, analytics, bảng dẫn xuất, đồng bộ OpenSearch, Global Tables.
- **TTL:** tự động xoá item sau thời điểm hết hạn; attribute TTL kiểu **Number**, giá trị **Unix epoch tính bằng giây**; xoá **miễn phí (không tốn WCU)**, xoá **trong vòng vài ngày** (không ngay lập tức) nên item hết hạn chưa xoá vẫn hiện khi đọc → lọc bằng FilterExpression; xoá khỏi cả LSI/GSI; thao tác xoá do TTL **đi vào Streams** (dùng để archive sang S3/bảng khác).
- **Transactions:** **all-or-nothing** trên nhiều item, nhiều bảng, **ACID**; `TransactGetItems`, `TransactWriteItems`; **tốn gấp đôi RCU/WCU** (prepare + commit); đọc transactional tính như strongly consistent rồi × 2. Dùng cho giao dịch tài chính, đơn hàng, game nhiều người chơi. Tối đa 100 thao tác/transaction, tổng tối đa 4 MB; idempotency bằng `ClientRequestToken` trong 10 phút.
- **Các kiểu ghi:** Concurrent (không điều kiện → ghi sau đè ghi trước, lost update); Conditional (chỉ ghi khi điều kiện đúng); Atomic (cả hai đều cộng dồn, ví dụ `ADD views :inc` — atomic counter, nhưng không idempotent, retry có thể đếm thừa); Batch (nhiều item một lần, không atomic, có thể thất bại từng phần).
- **Write Sharding:** Partition Key chỉ có vài giá trị (ví dụ `Candidate_ID` chỉ 2 ứng viên) → hot partition; giải pháp thêm **random suffix** hoặc **calculated suffix** (hash từ attribute khác, ví dụ `hash(Voter_ID) % N`) vào Partition Key; đọc tổng thì **query tất cả N shard rồi cộng lại** (scatter-gather).
- **Mẫu DynamoDB + S3:** (1) **Large Objects:** item > 400 KB thì file lưu ở S3, DynamoDB chỉ giữ metadata + S3 key; (2) **Indexing S3 metadata:** S3 Event → Lambda → ghi metadata vào DynamoDB để tìm kiếm/lọc/tổng hợp object.
- **Session state:** DynamoDB làm session store serverless, tự scale, nhiều instance cùng dùng, kèm TTL dọn session hết hạn; ElastiCache in-memory nhanh hơn nhưng không serverless; EBS/Instance Store chỉ local, không share; S3 độ trễ cao, không hợp session nhỏ.
- **Dọn dẹp/sao chép bảng:** xoá toàn bộ dữ liệu nhanh/rẻ nhất là **`DeleteTable` rồi tạo lại**, không Scan + Delete từng item.
- **Bảo mật và tính năng khác:** truy cập riêng tư từ VPC qua **VPC Endpoint (Gateway endpoint)**; mã hoá at rest bằng KMS (luôn bật), in transit bằng TLS; **PITR** khôi phục về bất kỳ thời điểm nào trong **35 ngày**, không ảnh hưởng hiệu năng; **On-demand backup** giữ tới khi xoá; **Global Tables** multi-region, multi-active (active-active), **bắt buộc bật Streams**; **Fine-grained access control**: user web/mobile qua Cognito Identity Pools lấy temporary credentials gắn IAM Role có condition **`dynamodb:LeadingKeys`** (giới hạn theo Partition Key, cấp row) và **`dynamodb:Attributes`** (giới hạn attribute, cấp cột).

**Con số phải nhớ (DynamoDB):**

| Hạng mục | Giá trị |
|---|---|
| Item tối đa | **400 KB** (tính cả tên attribute lẫn giá trị); số item/bảng không giới hạn |
| Partition | Mỗi partition khoảng 3.000 RCU, 1.000 WCU, 10 GB; burst capacity giữ tối đa 300 giây capacity chưa dùng |
| Query/Scan | Mỗi lần trả tối đa **1 MB**, phân trang (`LastEvaluatedKey`/`ExclusiveStartKey`) |
| BatchWriteItem | Tối đa 25 Put/Delete, 16 MB tổng, **không hỗ trợ UpdateItem**, phần thất bại trả về `UnprocessedItems` |
| BatchGetItem | Tối đa 100 item, 16 MB, nhiều bảng, phần thất bại trả về `UnprocessedKeys` |
| DAX | TTL cache mặc định 5 phút; cluster tối đa 11 node, khuyến nghị tối thiểu 3 node cho production (Multi-AZ); port 8111 (không mã hoá) hoặc 9111 (in-transit encryption) |
| Streams | Lưu tối đa 24 giờ; Kinesis Data Streams for DynamoDB lưu tới 365 ngày |
| TTL | Bật/tắt TTL chỉ 1 lần mỗi giờ cho một bảng |
| PITR | 35 ngày |
| Chuyển capacity mode | Ghi chú mâu thuẫn: video nói 1 lần/24 giờ; cập nhật nói Provisioned → On-Demand tối đa 4 lần/24 giờ, On-Demand → Provisioned lúc nào cũng được |
| Giá On-Demand | Video nói đắt hơn khoảng 2,5 lần Provisioned, nhưng AWS đã giảm 50% giá throughput On-Demand (11/2024) nên tỉ lệ cũ không còn chính xác; logic thi vẫn giữ: tải ổn định → Provisioned, khó đoán → On-Demand |

**Bẫy thi DynamoDB:**
- **Query theo non-key attribute:** không Query được theo attribute thường; chỉ filter sau Query, hoặc tạo **GSI** (bảng đã tồn tại thì không tạo được LSI — phải tạo bảng mới hoặc dùng GSI).
- **Tính RCU/WCU sai đơn vị:** WCU làm tròn theo **1 KB**, RCU làm tròn theo **4 KB**; đọc eventually thì **chia 2**, strongly và transactional thì **không chia 2** (transactional còn **× 2**); đổi "mỗi phút" thành "mỗi giây" trước khi tính.
- **Throttle dù tổng chưa vượt:** nghĩ ngay **hot partition/hot key** vì RCU/WCU chia đều cho partition; giải pháp là phân tán key, exponential backoff, DAX cho đọc — không phải cứ tăng capacity tổng là hết.
- **GSI chỉ eventually consistent:** câu hỏi "index nào hỗ trợ strongly consistent read" → chỉ **LSI**; đừng chọn GSI.
- **PartiQL không JOIN, không thêm tính năng:** chỉ là cú pháp SQL cho API sẵn có; `SELECT` không có điều kiện Partition Key sẽ thành Scan đắt đỏ.
- **BatchWriteItem không có UpdateItem, không có ConditionExpression, không atomic:** phần thất bại nằm ở `UnprocessedItems`, phải retry; cần ghi có điều kiện nhiều item thì dùng `TransactWriteItems`.
- **Streams không retroactive, chỉ 24 giờ:** bật stream rồi thì chỉ thay đổi từ đó mới vào stream; cần lưu lâu hơn thì dùng Kinesis Data Streams for DynamoDB (tới 365 ngày, nhưng có thể trùng/không thứ tự, cần dedupe).
- **TTL không xoá ngay:** item hết hạn vẫn hiện trong đọc/query/scan trong vài ngày → phải filter theo thời gian hiện tại; lỗi phổ biến là lưu epoch **mili-giây** (JavaScript `Date.now()`) khiến item không bao giờ hết hạn — phải chia 1000, epoch tính bằng giây.
- **Xoá toàn bộ bảng:** chọn **`DeleteTable` rồi tạo lại**, không Scan + DeleteItem (chậm, tốn RCU/WCU, đắt); TTL cũng xoá chậm (vài ngày) nên không phải cách dọn nhanh.
- **CLI phân trang:** `--page-size` chia nhỏ lời gọi API phía sau nhưng **vẫn trả đủ kết quả**; `--max-items` + `--starting-token` mới là phân trang kết quả trả về (kèm `NextToken`); ở cấp API/SDK tương ứng là `LastEvaluatedKey`/`ExclusiveStartKey`, khác với `Limit` của API.
- **Fine-grained access:** user chỉ được truy cập item của chính mình → **`dynamodb:LeadingKeys`** (cấp row, theo Partition Key); giới hạn cột → **`dynamodb:Attributes`**; đừng nhúng access key vào app mobile/web — dùng Cognito Identity Pools đổi lấy temporary credentials.

**Liên hệ thực tế — DynamoDB:**
1. **Bầu cử trực tuyến bị throttle ghi:** Partition Key là `Candidate_ID` (chỉ 2 ứng viên) → mọi vote dồn vào 2 partition, hot partition, throttle ghi dù tổng capacity chưa vượt. Giải pháp **Write Sharding**: thêm random/calculated suffix để phân tán ghi ra nhiều partition; đọc tổng thì query tất cả shard rồi cộng lại. DAX không giải quyết được vì DAX chỉ giúp đọc, không giúp ghi.
2. **Lưu ảnh sản phẩm và tìm kiếm theo metadata:** Ảnh vài MB, vượt giới hạn item 400 KB, đồng thời cần tìm ảnh theo customer/thời gian → **S3 + DynamoDB**: file lớn lưu ở S3, DynamoDB chỉ giữ metadata + S3 key; khi upload, **S3 Event → Lambda → ghi metadata vào DynamoDB** để API truy vấn/lọc/tổng hợp mà không cần Scan S3.

### 1.4. S3 & CloudFront — object storage và phân phối nội dung

**S3 — khái niệm cốt lõi:**
- **Bucket/key/namespace:** bucket là container; object được định danh bằng key; tên bucket **duy nhất toàn cầu**; mỗi bucket thuộc về một region cụ thể (console S3 hiện chữ Global và liệt kê bucket mọi region, nhưng dữ liệu vẫn region-scoped).
- **Object tối đa 5 TB** (đề thi dùng 5 TB; video trong ghi chú nói 50 TB là sai — đừng chọn 50 TB). Upload file lớn: **multipart upload** (khuyến nghị > 100 MB, bắt buộc > 5 GB) + **Transfer Acceleration** cho upload nhanh nhất.
- **Versioning:** bật versioning thì xoá object chỉ thêm **delete marker** (không xoá hẳn); muốn xoá hẳn phải xoá từng **version ID**. Không thể tắt versioning, chỉ *suspend*. **MFA Delete** là lớp bảo vệ thêm.
- **Replication:** **CRR** (cross-region) và **SRR** (same-region); cần bật versioning ở cả hai bucket.
- **Storage classes (7 loại) + lifecycle:** S3 Standard → Standard-IA → One Zone-IA → Intelligent-Tiering → Glacier Instant Retrieval → Glacier Flexible Retrieval → Glacier Deep Archive. **Lifecycle rules** tự chuyển class theo tuổi object; **S3 Analytics** gợi ý rule. Lưu ý: chuyển sang Glacier rồi thì truy cập chậm/có phí restore — đừng chọn Glacier cho dữ liệu cần đọc ngay.
- **Hiệu năng:** **3.500 PUT/COPY/POST/DELETE và 5.500 GET/HEAD request/giây mỗi prefix**; muốn cao hơn thì tăng số prefix (trải key) hoặc dùng **byte-range fetch** (GET song song từng phần) và **multipart**.
- **Event notifications:** đích SNS/SQS/Lambda/EventBridge + **resource policy** cho phép S3 gọi đích; lọc prefix/suffix.
- **Metadata vs Tags:** metadata là thông tin kèm object; **tags không search được** → muốn tìm kiếm theo metadata thì index bằng DynamoDB (xem mẫu ở 1.3).
- **Static website hosting:** S3 host web tĩnh; muốn HTTPS + custom domain + hiệu năng toàn cầu thì đặt CloudFront trước S3.
- **Pre-signed URL:** cho phép truy cập tạm thời vào object private mà không cần đổi bucket policy; dùng cho upload/download có thời hạn.
- **Access points:** quản lý quyền truy cập bucket ở quy mô lớn, mỗi access point có policy riêng.
- **Object Lambda (lưu ý):** ghi chú nêu không còn mở cho khách hàng mới từ 11/2025, nhưng khái niệm vẫn có thể ra thi nên vẫn giữ.
- **CORS:** cấu hình trên **bucket chứa tài nguyên** (bucket video), không phải bucket chứa website.
- **Access logs:** bật server access logging để audit ai truy cập object nào.

**S3 Security (xem thêm Domain 2):**
- **SSE-S3** (AES-256, key do S3 quản lý — mặc định cho mọi object mới từ 01/2023) | **SSE-KMS** (key KMS, audit qua CloudTrail, có phí API call) | **SSE-C** (key do khách hàng cung cấp trong mỗi request, bắt buộc HTTPS, mọi thao tác GET/HEAD/Copy phải gửi lại đúng key) | **Client-Side** (client tự mã hoá, server không giải mã được) | **DSSE-KMS** (mã hoá 2 lớp).
- **S3 Bucket Key:** S3 lấy một bucket-level key ngắn hạn từ KMS rồi sinh data key cho từng object **ngay trong S3** → **giảm tới 99% số lần gọi KMS**. Trade-off: ít sự kiện KMS hơn trong CloudTrail, log ghi theo bucket ARN thay vì object ARN. Quyền SSE-KMS: upload cần `s3:PutObject` + **`kms:GenerateDataKey`**; download cần `s3:GetObject` + **`kms:Decrypt`**; multipart upload cần cả hai.
- **Ép mã hoá bằng bucket policy:** dùng `Deny` + `s3:PutObject` + `StringNotEquals` với `s3:x-amz-server-side-encryption = "aws:kms"` (dùng `StringEquals` sẽ chặn ngược lại chính request có SSE-KMS — bẫy kinh điển).
- **Ép HTTPS:** bucket policy deny request không dùng HTTPS (`aws:SecureTransport = false`).
- **Block Public Access:** bật ở cả cấp account và bucket; **default encryption** khác với bucket policy (policy mới là cơ chế ép buộc).
- **KMS quota:** 5.000–30.000 request/giây tùy region (dùng chung cho mọi key cùng loại) — vượt quota → `ThrottlingException` → xử lý bằng exponential backoff, DEK caching, tăng quota, hoặc bật S3 Bucket Key. **Tạo thêm nhiều CMK không giúp** vì quota tính theo account + region.

**CloudFront — khái niệm cốt lõi:**
- **CDN:** phân phối nội dung qua **Edge Locations / PoP** gần người dùng; origin có thể là S3, ALB, EC2, API Gateway, HTTP server… (số PoP thay đổi theo thời gian — video nêu ~216, ghi chú cập nhật là hơn 600 — **đừng chốt số tuyệt đối khi làm bài**).
- **OAC (Origin Access Control)** thay thế **OAI** (Origin Access Identity) cũ: chỉ cho CloudFront truy cập S3 private, chặn truy cập trực tiếp vào bucket.
- **Cache policy vs Origin request policy:** cache policy quyết định cache key + TTL (cache cái gì, bao lâu); origin request policy quyết định gửi gì lên origin (header, query string, cookie) mà không ảnh hưởng cache key.
- **Cache behaviors:** routing theo path pattern tới origin khác nhau (ví dụ `/images/*` → S3, `/api/*` → ALB).
- **Invalidation:** xóa cache thủ công khi nội dung đổi (có phí sau free tier); thay vì invalidate thường xuyên, dùng versioned file name là best practice.
- **VPC origins:** CloudFront truy cập origin trong VPC private mà không cần public.
- **Geo restriction:** chặn/cho phép theo quốc gia ở tầng CloudFront (khác Route 53 Geolocation ở tầng DNS).
- **Signed URL vs Signed Cookie:** signed URL cho **một file** có thời hạn; signed cookies cho **nhiều file**. Dùng **trusted key groups** (cách mới; CloudFront key pair cũ chỉ tạo bằng root user, tối đa 2 key pair active).
- **Price classes:** giới hạn edge location dùng để giảm chi phí (ví dụ chỉ dùng Bắc Mỹ + châu Âu).
- **Origin groups:** failover giữa 2 origin khi origin chính lỗi.
- **Field-level encryption:** mã hoá field nhạy cảm ngay tại edge.
- **Real-time logs:** log chi tiết theo thời gian thực (khác access log chuẩn).
- **CloudFront Functions vs Lambda@Edge:**

| | CloudFront Functions | Lambda@Edge |
|---|---|---|
| Ngôn ngữ | JavaScript | Node.js, Python |
| Trigger | Chỉ Viewer Request/Response | Cả 4: Viewer + Origin Request/Response |
| Thời gian tối đa | < 1 ms | 5 giây (viewer), 30 giây (origin) |
| Memory tối đa | 2 MB | 128 MB (viewer) – 10 GB (origin) |
| Package | 10 KB | 1 MB (viewer), 50 MB (origin) |
| Network/file system/body | Không | Có |
| Quy mô/giá | Hàng triệu request/giây, rẻ (~1/6 Lambda@Edge), có free tier | Hàng nghìn request/giây, không free tier; viết ở us-east-1, replicate toàn cầu |

**Bẫy thi S3/CloudFront:**
- **SSE-S3 = AES-256, key do S3 quản lý** (mặc định cho mọi object mới từ 01/2023); **SSE-C** = key do khách hàng cung cấp trong mỗi request, bắt buộc HTTPS.
- S3 upload nhanh nhất cho file ~2 GB: **multipart upload + Transfer Acceleration**.
- ALB không có target đăng ký → **503**; 502 = target trả response sai định dạng; 504 = target không phản hồi trước idle timeout. (Lỗi này hay hỏi chung với CloudFront/ALB.)
- CORS cấu hình trên **bucket chứa tài nguyên**, không phải bucket chứa website.
- S3 versioning: xoá object chỉ thêm delete marker; **CloudFormation `DeletionPolicy`**: bucket S3 không rỗng sẽ làm `delete-stack` thất bại (`DELETE_FAILED`) — phải làm rỗng bucket (kể cả các version) rồi retry, hoặc retain bucket.

**Liên hệ thực tế — S3/CloudFront:**
1. **Host web tĩnh toàn cầu:** S3 (static website hosting, private) + CloudFront (OAC) + ACM (chứng chỉ ở us-east-1 cho CloudFront) + Route 53 (Alias record ở zone apex — CNAME không dùng được cho apex). Muốn nội dung mới hiện ngay mà không invalidate liên tục → dùng tên file có version/hash.
2. **Phân phối video có bản quyền theo user:** CloudFront signed URL (một file) hoặc signed cookies (nhiều file) + trusted key groups; S3 giữ private, chỉ CloudFront được truy cập qua OAC. Đừng mở bucket public rồi "hy vọng không ai đoán được URL".

### 1.5. Messaging: SQS, SNS, Kinesis — trái tim của kiến trúc decouple

**Decoupling:** đồng bộ = gọi trực tiếp, nhanh nhưng spike gây outage; bất đồng bộ = có middleware (queue/topic/stream) ở giữa, hai bên scale độc lập, chịu spike, xử lý trễ hơn.

**SQS — khái niệm cốt lõi:**
- Fully managed queue làm buffer; producer `SendMessage`, consumer poll rồi phải `DeleteMessage` bằng **`ReceiptHandle`** (không phải `MessageId`).
- Consumer chạy trên EC2/on-premises/Lambda (qua Event Source Mapping); scale consumer bằng ASG + CloudWatch Alarm trên `ApproximateNumberOfMessages`.
- Bảo mật: HTTPS in-flight, SSE-SQS (mặc định) hoặc SSE-KMS at-rest, IAM policy + SQS Access Policy (cross-account, S3/SNS ghi vào queue với điều kiện `aws:SourceArn`/`aws:SourceAccount`).
- **Visibility Timeout:** message bị poll sẽ vô hình với consumer khác trong khoảng này; hết timeout chưa xóa → quay lại queue → xử lý trùng; kéo dài bằng `ChangeMessageVisibility` (heartbeat).
- **Delay Queue:** ẩn message ngay từ khi vào queue (khác Visibility Timeout chỉ ẩn sau khi bị nhận).
- **Long Polling:** chờ khi queue trống → giảm API call, giảm chi phí, tránh "false empty" của short polling.
- **DLQ + Redrive:** message thất bại quá `maxReceiveCount` → DLQ cô lập "poison pill"; sửa xong `StartMessageMoveTask` đẩy lại queue gốc; **DLQ cùng loại với source** (FIFO → FIFO, standard → standard).
- **SQS Extended Client:** payload lớn → upload S3, SQS chỉ chứa con trỏ (tới 2 GB).
- **SQS FIFO:** thứ tự + exactly-once send, tên bắt buộc đuôi `.fifo`; `MessageGroupId` (thứ tự chỉ trong group, cùng group chỉ 1 consumer, số consumer tối đa = số group); dedup 5 phút bằng `MessageDeduplicationId` hoặc content-based (SHA-256 body).

**SQS — con số:**

| Hạng mục | Giá trị |
|---|---|
| Retention | Mặc định 4 ngày; tối thiểu 1 phút; tối đa 14 ngày |
| Message | **256 KB theo đề thi**; AWS đã tăng lên **1 MiB** từ 08/2025 |
| Poll | Tối đa 10 message/lần; batch tối đa 10 entry |
| Visibility Timeout | Mặc định 30 giây; 0–12 giờ |
| Delay Queue | Mặc định 0; tối đa 15 phút; FIFO không hỗ trợ delay per-message |
| Long Polling | 1–20 giây, khuyến nghị 20 giây |
| FIFO throughput (video) | 300 msg/s không batch; 3.000 msg/s có batch; high-throughput cao hơn |
| FIFO dedup | 5 phút |
| Lambda làm SQS consumer | Visibility timeout queue ≥ 6 lần Lambda timeout; bật `ReportBatchItemFailures` |
| `DeleteQueue` / `PurgeQueue` | `DeleteQueue` xoá queue bất kể nội dung (mất tới 60 giây; chờ ≥ 60 giây mới tạo lại cùng tên); `PurgeQueue` chỉ xoá message; **`RemoveQueue` không tồn tại** |

**SNS — khái niệm cốt lõi:**
- **Pub/Sub:** publish một lần, mọi subscriber nhận một bản sao; subscriber: Email, SMS, mobile push (APNS, FCM), HTTP/HTTPS, SQS, Lambda, Firehose — **không có Kinesis Data Streams**.
- SNS **không lưu trữ message** → gắn DLQ (SQS) cho subscription.
- **SNS + SQS Fan-out:** một publish → nhiều queue, mỗi queue một bản, thêm đích không sửa producer. **SNS FIFO → nhiều SQS FIFO** cho fan-out + ordering + dedup.
- **Message Filtering:** filter policy trên subscription, lọc theo message attributes (mặc định) hoặc body JSON (`FilterPolicyScope = MessageBody`); `RawMessageDelivery` để nhận body gốc.
- **Phân biệt dịch vụ "gửi thông báo":** SES = email giao dịch/marketing số lượng lớn; SNS = pub/sub, fan-out, email đơn giản tới subscriber đã xác nhận, SMS, push; AWS End User Messaging (trước đây Pinpoint) = SMS, voice, push.

**Kinesis — khái niệm cốt lõi:**
- **Kinesis Data Streams (KDS):** streaming real-time (clickstream, IoT, logs); producer: SDK/Kinesis Agent/KPL; consumer: SDK/KCL/Lambda/Firehose/Flink. Dữ liệu đã ghi không xóa được, chờ hết hạn, **replay được**. Thứ tự theo partition key (cùng key → cùng shard). Provisioned (tự chọn shard, split/merge thủ công) hoặc On-demand (tự scale). Shared fan-out (2 MB/s/shard chia chung, `GetRecords`, tối đa 5 lần/s/shard) vs Enhanced fan-out (2 MB/s/shard/consumer, `SubscribeToShard` HTTP/2, ~70 ms). KCL: tối đa 1 worker/shard, checkpoint/lease lưu trong DynamoDB.
- **Amazon Data Firehose (tên cũ Kinesis Data Firehose):** nạp streaming vào đích, fully managed, serverless, tự scale; từ khóa **near real-time** (do buffer). Transform bằng Lambda, convert Parquet/ORC, nén gzip/snappy; đích: S3, Redshift (qua S3 rồi `COPY`), OpenSearch, bên thứ ba, HTTP endpoint. **Không lưu trữ, không replay.**
- **Managed Service for Apache Flink (tên cũ Kinesis Data Analytics):** phân tích stream real-time (windowing, phát hiện bất thường, aggregate) bằng Flink; đọc từ KDS hoặc MSK, **không đọc từ Firehose**; tính tiền theo KPU/giờ. Kinesis Data Analytics for SQL cũ đã ngừng hỗ trợ (không tạo mới từ 10/2025).

**Kinesis — con số:**

| Hạng mục | Giá trị |
|---|---|
| KDS shard (provisioned) | Ghi 1 MB/s hoặc 1.000 record/s; đọc 2 MB/s |
| KDS retention | Mặc định 24 giờ; tối đa 365 ngày |
| KDS record | **1 MB theo đề thi**; AWS đã tăng lên 10 MB (2025), nhưng giới hạn ghi 1 MB/s/shard vẫn áp dụng |
| KDS shared fan-out | 2 MB/s/shard chia chung; tối đa 5 `GetRecords`/s/shard |
| KDS enhanced fan-out | 2 MB/s/shard/consumer; độ trễ ~70 ms |
| Firehose buffer | Size mặc định 5 MB, 1–128 MB; interval mặc định 300 giây, có thể đặt 0 giây |
| Firehose Direct PUT batch | Tối đa 500 record/batch |

**Bảng so sánh nhanh:**

| | SQS | SNS | KDS |
|---|---|---|---|
| Mô hình | Consumer pull, xóa sau xử lý | Push nhiều subscriber | Pull/push (enhanced), replay được |
| Lưu trữ | Tới 14 ngày | Không lưu trữ | Tới 365 ngày |
| Thứ tự | Chỉ với FIFO | Chỉ với FIFO topic | Theo shard |
| Provision throughput | Không cần (tự scale) | Không cần | Provisioned/On-demand |

| | KDS | Firehose |
|---|---|---|
| Vai trò | Thu thập streaming, tự viết producer/consumer, real-time | Nạp vào đích, fully managed, near real-time |
| Lưu trữ/replay | Có | Không |
| Phân tích real-time | Có (qua Flink/KCL/Lambda) | Không — Firehose chỉ nạp |

**Bẫy thi messaging:**
- "Pre-warm/tăng capacity/Auto Scaling cho SQS" không tồn tại — SQS tự scale, việc cần làm là scale **consumer**.
- Nhầm Visibility Timeout với Delay Queue; xóa message bằng `MessageId` thay vì `ReceiptHandle`; SQS Standard "đảm bảo thứ tự/đúng một lần" là sai.
- Nhầm `MessageGroupId` (thứ tự) với `MessageDeduplicationId` (chống trùng 5 phút); DLQ khác loại source là sai; `maxReceiveCount = 1` đẩy message lỗi tạm thời vào DLQ quá sớm.
- "SQS Replication"/"SQS filter" không tồn tại → fan-out dùng SNS + SQS, lọc dùng SNS Message Filtering.
- Kinesis Data Streams là SNS subscriber là sai; short polling trả rỗng chưa chắc queue trống (false empty); KDS provisioned không tự scale (phải split/merge shard); Flink không đọc từ Firehose; Firehose không dùng để phân tích real-time/replay.
- SNS + SQS = mô hình **fan-out** (một message tới nhiều nơi xử lý + xử lý lại được sau nhờ queue/DLQ); SQS chỉ có một nhóm consumer cho mỗi message.

**Liên hệ thực tế — messaging:**
1. **Đơn hàng Black Friday tăng 100 lần:** front-end → SQS Standard; back-end ASG riêng poll theo nhịp, scale theo `ApproximateNumberOfMessages`; DLQ + redrive xử lý message lỗi DB. Nếu cùng một khách hàng bắt buộc đúng thứ tự và không trừ tiền 2 lần → SQS FIFO, customer ID làm `MessageGroupId`, order ID làm `MessageDeduplicationId`.
2. **Một đơn hàng tới cùng lúc 3 nơi, có nơi chỉ nhận đơn "placed":** SNS + SQS Fan-out, filter policy `state = placed` cho queue tương ứng; thêm đích sau này không sửa producer. Ngược lại, clickstream/IoT cần replay + phân tích real-time → KDS (+ Firehose nạp S3/Redshift, + Flink phân tích), không dùng SQS/SNS.

### 1.6. Step Functions & AppSync — điều phối và GraphQL

**Step Functions:**
- Điều phối workflow dưới dạng **state machine**, định nghĩa bằng **JSON (Amazon States Language — ASL)**, có sơ đồ trực quan và **lịch sử thực thi**. Khởi chạy qua SDK (`StartExecution`), API Gateway, EventBridge, console.
- **Các loại state:** **Task** (làm việc: Lambda, Batch, ECS, DynamoDB, SNS/SQS, workflow khác, Activity), **Choice** (rẽ nhánh theo điều kiện, có nhánh Default), **Pass** (chuyển input thành output, không làm việc), **Wait** (trì hoãn), **Map** (lặp động trên từng phần tử mảng; có Distributed Map cho hàng nghìn child workflow song song), **Parallel** (chạy nhiều nhánh song song, chỉ hoàn tất khi mọi nhánh xong), **Succeed**, **Fail** (có `Error` và `Cause`).
- **Xử lý lỗi đặt ở state machine, không đặt trong code:** **Retry** (thử lại task) rồi mới **Catch** (chuyển sang nhánh xử lý lỗi). Cả hai đánh giá **từ trên xuống**.
  - Retry: `ErrorEquals`, `IntervalSeconds`, `BackoffRate` (exponential backoff), `MaxAttempts`.
  - Catch: `ErrorEquals`, `Next`, `ResultPath` — `ResultPath: "$.error"` gộp thông tin lỗi vào input ban đầu (mặc định `$` sẽ thay thế hoàn toàn input bằng output lỗi).
  - Mã lỗi: `States.ALL` (mọi lỗi — phải đứng **một mình** trong `ErrorEquals` và là **phần tử cuối** của mảng Retry/Catch), `States.Timeout` (quá `TimeoutSeconds` hoặc mất heartbeat), `States.TaskFailed` (task lỗi khi thực thi — khớp mọi lỗi của task **trừ `States.Timeout`**), `States.Permissions` (thiếu IAM permission → cấp thêm IAM permission cho execution role của state machine, không phải lỗi trong code Lambda).
  - Retry mặc định: `IntervalSeconds` = 1, `MaxAttempts` = **3**, `BackoffRate` = 2.0.
- **Wait for Task Token (callback, push):** Task có Resource hậu tố `.waitForTaskToken`; task tạm dừng cho tới khi bên ngoài gọi **`SendTaskSuccess` / `SendTaskFailure`** kèm task token (lấy từ `$$.Task.Token`). Dùng cho human approval, hệ thống bên ngoài. Chỉ dùng với **Standard workflow**.
- **Activity Tasks (pull):** worker (EC2, on-premises, bất kỳ đâu) **poll** Step Functions bằng **`GetActivityTask`** để lấy việc + task token, làm xong báo `SendTaskSuccess`/`SendTaskFailure`. `TimeoutSeconds`, `HeartbeatSeconds` (worker gửi `SendTaskHeartbeat`). Chỉ dùng với **Standard workflow**.
- **Standard vs Express:**

| | Standard | Express — Async | Express — Sync |
|---|---|---|---|
| Thời lượng tối đa | **1 năm** | 5 phút | 5 phút |
| Tốc độ khởi chạy | ~2.000 execution/giây | > 100.000 execution/giây | > 100.000 execution/giây |
| Mô hình thực thi | **Exactly-once** | At-least-once | At-most-once |
| Lịch sử thực thi | Console giữ 90 ngày; lâu hơn → CloudWatch Logs | Chỉ qua CloudWatch Logs | Chỉ qua CloudWatch Logs |
| Tính phí | Theo số state transition | Theo số execution, thời lượng, bộ nhớ | Như Async |

  - Payload input/output mỗi state tối đa **256 KiB** → dữ liệu lớn lưu S3, truyền key.
  - Loại workflow chọn khi tạo, **không đổi được** sau đó.
  - **Express không hỗ trợ** `.waitForTaskToken`, `.sync` (Run a Job) và Activity.
  - **Standard:** tác vụ **non-idempotent** (ví dụ xử lý thanh toán), cần exactly-once, chạy lâu, cần `.waitForTaskToken`/`.sync`/Activity. **Express Async:** IoT ingestion, streaming, mobile backend; phải đảm bảo **idempotency** vì at-least-once. **Express Sync:** orchestrate microservices, cần **kết quả ngay** (gọi từ API Gateway/Lambda); at-most-once nên lỗi thì tự cài logic retry.
- Đừng nhầm `.waitForTaskToken` (callback, cần token) với `.sync` (Run a Job: Step Functions tự đợi job AWS hoàn tất, không cần token).
- Điều phối nhiều Lambda thành workflow → **Step Functions**, không phải SWF (dịch vụ cũ), CodePipeline hay OpsWorks.
- Chạy nhiều Lambda song song rồi đợi tất cả xong mới quyết định → **Parallel state + một Task state cuối**.
- **Task state** là đơn vị công việc (phải có `Resource`); state thiếu `Resource` với `Result` thực chất là **Pass**.

**AppSync:**
- Dịch vụ **GraphQL managed**. Client chỉ hỏi field cần; **resolver** nối GraphQL tới nguồn: DynamoDB, Aurora, OpenSearch, Lambda, HTTP endpoint. Hỗ trợ **real-time qua WebSocket** (subscriptions `@aws_subscribe`) và **offline sync** cho mobile (thay Cognito Sync).
- Authorization: `API_KEY`, `AWS_IAM`, `OPENID_CONNECT`, `AMAZON_COGNITO_USER_POOLS` (+ `AWS_LAMBDA`; có thể bật nhiều chế độ cùng lúc).
- API key mặc định hết hạn sau 7 ngày, gia hạn tối đa 365 ngày — không dùng API key cho production cần xác thực user.
- GraphQL trên AWS → **AppSync** (kể cả migrate GraphQL API từ on-premises); API Gateway chỉ làm REST/HTTP/WebSocket, không phải GraphQL managed.
- WebSocket: **ALB, API Gateway, AppSync đều hỗ trợ; DynamoDB không**.

**Amplify** ("Elastic Beanstalk cho web & mobile"): **Studio** (xây full-stack trực quan), **CLI** (`amplify init`), **Libraries** (kết nối Cognito, S3…), **Hosting** (CI/CD, PR preview, custom domain). `amplify add auth` → **Cognito**; `amplify add api` (DataStore) → **AppSync + DynamoDB** (offline & real-time); `amplify add hosting` → CI/CD. **E2E test** khai báo trong **`amplify.yml`** (test phase), framework **Cypress**; unit test ở build phase. Amplify Gen 2 (GA 5/2024) dùng TypeScript + CDK, không còn DataStore.

**Liên hệ thực tế — Step Functions/AppSync:**
1. **Quy trình xử lý đơn hàng cần phê duyệt thủ công:** dùng **Standard workflow** + **`.waitForTaskToken`**: Step Functions gửi message kèm task token vào SQS; người quản lý phê duyệt qua email (SNS → API Gateway → Lambda gọi `SendTaskSuccess`/`SendTaskFailure`); workflow tiếp tục. Đặt `HeartbeatSeconds`/`TimeoutSeconds` để tránh chờ vô hạn.
2. **App mobile cần làm việc offline và cập nhật real-time:** dùng **AppSync** (GraphQL + subscriptions WebSocket + offline sync qua Amplify) thay cho việc tự xây REST + polling; thay thế hoàn toàn Cognito Sync đã lỗi thời.

### 1.7. ECS, ECR, Fargate & Elastic Beanstalk — chạy container và deploy nhanh

**ECS/ECR/Fargate:**
- **Docker vs VM:** container chia sẻ kernel của host, nhẹ và khởi động nhanh hơn VM.
- **EC2 vs Fargate launch type:** EC2 = bạn quản lý instance; **Fargate = serverless**, AWS quản lý hạ tầng, chỉ trả theo task chạy.
- **3 IAM role hay nhầm:** **task role** (quyền của code trong container gọi ra AWS), **execution role** (quyền của ECS agent pull image từ ECR, ghi log), **instance profile** (chỉ cho EC2 launch type).
- **ALB/NLB:** ALB cho HTTP routing theo path/host; NLB cho TCP/UDP hiệu năng cao. **Dynamic host port mapping** (ALB + ECS): nhiều task cùng service trên một instance; Classic Load Balancer phải map port tĩnh.
- **EFS:** ECS task mount EFS để chia sẻ file bền vững.
- **Auto scaling:** ECS service auto scaling theo metric (CPU, memory, ALB request count…).
- **Rolling update:** mặc định **100%/200%** (minimum healthy 100%, maximum 200%): deploy bản mới mà không giảm capacity.
- **Task definition:** image, CPU/memory, port (dynamic host port), secrets (từ Secrets Manager/SSM), sidecar container, log configuration.
- **Placement:** binpack (dồn task vào ít instance nhất), spread (trải đều theo AZ/instance), random.
- **ECR:** push/pull image bằng Docker CLI với `get-login-password`; image lưu theo tag/digest.
- **Copilot CLI:** ghi chú nêu end-of-support giữa 2026, thay bằng ECS Express Mode/CDK — **đừng đưa Copilot vào tài liệu như lựa chọn cho dự án mới**.
- **EKS:** Kubernetes managed — chỉ cần biết ở mức nhận diện cho DVA (đề hỏi sâu về ECS hơn EKS).

**Elastic Beanstalk:**
- **Application / version / environment / tier:** application chứa nhiều version; environment chạy một version; tier gồm **web tier** (nhận HTTP) và **worker tier** (xử lý SQS).
- **Single instance vs HA:** single instance cho dev (rẻ, không LB); HA cho production (LB + ASG multi-AZ).
- **6 deployment mode (hay hỏi):** all at once (nhanh nhất, có downtime), rolling (từng batch, giảm capacity tạm thời), rolling + additional batch (giữ capacity bằng cách thêm batch tạm), immutable (tạo nhóm instance mới hoàn toàn, an toàn nhất, tốn thời gian), blue/green (tạo environment mới, đổi DNS/CNAME, rollback nhanh), traffic splitting (chia % traffic giữa 2 version, canary).
- **EB CLI:** `eb init`, `eb create`, `eb deploy`, `eb status`…
- **Lifecycle policy:** tối đa **1.000 version**; version cũ tự xoá theo policy.
- **`.ebextensions`:** cấu hình thêm (package, file, command, container command) khi deploy.
- **Bên dưới Beanstalk là CloudFormation** (Beanstalk tự tạo stack); **cloning** environment để test; **migration:** đổi LB, tách RDS ra khỏi environment (RDS tạo kèm environment sẽ bị xoá khi terminate environment — muốn giữ DB thì tách ra trước).
- **Beanstalk vs CloudFormation:** Beanstalk = deploy app nhanh, AWS lo hạ tầng; CloudFormation = tự định nghĩa hạ tầng chi tiết.

**Liên hệ thực tế — ECS/Beanstalk:**
1. **Team đã có app Docker, muốn chạy production ít vận hành:** ECR lưu image → ECS Fargate service sau ALB, task role chỉ đủ quyền gọi DynamoDB/S3, secrets lấy từ Secrets Manager (không hard-code env). Cần scale theo request → ECS service auto scaling theo `ALBRequestCountPerTarget`. Không muốn quản lý cluster → Fargate, không chọn EC2 launch type.
2. **Team nhỏ, muốn deploy web app nhanh nhất:** Elastic Beanstalk web tier HA (ALB + ASG) + RDS tách riêng; deploy bằng `eb deploy`; cần deploy không downtime → immutable hoặc blue/green; cần thử version mới với 10% traffic → traffic splitting.

### 1.8. SDK, CLI & IAM Roles/Policies cho developer

- **Credential chain (thứ tự CLI/SDK tìm credentials):** tham số dòng lệnh → biến môi trường (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`, `AWS_PROFILE`, `AWS_REGION`) → `~/.aws/credentials` & `~/.aws/config` (gồm SSO, `credential_process`) → container credentials (ECS) → instance profile (EC2 IMDS).
- **IMDSv1 vs IMDSv2:** IMDSv2 yêu cầu session token (chống SSRF), AL2023 mặc định IMDSv2-only. **Tuyệt đối không `aws configure` với access key cá nhân trên EC2** — dùng IAM Role gắn qua instance profile, credentials tạm thời tự xoay vòng qua IMDS.
- **CLI profiles:** `aws configure` hỏi 4 giá trị: Access Key ID và Secret Access Key lưu ở `~/.aws/credentials`; Default region và Default output format (`json`, `yaml`, `text`, `table`) lưu ở `~/.aws/config`. **Quyền của CLI = quyền của IAM user sở hữu access key.** `aws sts get-caller-identity` → kiểm tra mình đang là ai — lệnh đầu tiên khi debug quyền.
- **MFA qua CLI:** `sts get-session-token` với MFA serial + token code.
- **SDK:** theo ngôn ngữ: JavaScript/TypeScript, Python (**boto3**), Java, .NET, Go, PHP, Ruby… AWS CLI v1 được xây dựng trên Python SDK (boto3/botocore).
- **API rate limit vs Service Quota:** bị throttle → **exponential backoff (có jitter)**, không retry mọi lỗi 4xx dồn dập; SES throttling thỉnh thoảng → exponential backoff, chỉ xin tăng limit khi throttling liên tục.
- **SigV4:** mọi request AWS API đều ký bằng Signature Version 4 (access key + region + service + timestamp).
- **CloudShell:** terminal chạy trong trình duyệt, **miễn phí**, đã cài sẵn AWS CLI v2, Python, Node.js, git, jq, SDK… **Tự động dùng credentials của người đang đăng nhập console** → không cần `aws configure`, không cần access key; region mặc định = region đang chọn trong console. Không có ở mọi region. CloudShell: **1 GB lưu trữ bền vững trong `$HOME` mỗi region**; file bị xoá nếu không dùng CloudShell ở region đó trong 120 ngày.

---

## DOMAIN 2 — SECURITY (26%)

### 2.1. IAM — nền tảng của mọi câu bảo mật

- **IAM là dịch vụ global, miễn phí.** Users, groups, roles, policies tạo ra dùng được ở mọi region.
- **Root account:** có **toàn quyền, không thể giới hạn bằng IAM policy**. Chỉ dùng cho tác vụ bắt buộc root (đổi thông tin tài khoản, đóng tài khoản, đổi Support plan, khôi phục quyền khi IAM admin bị khoá, cấu hình một số tính năng billing). **Không dùng, không chia sẻ root cho công việc hằng ngày; luôn bật MFA cho root; không tạo access key cho root.** Từ 2024–2025 AWS bắt buộc MFA cho root user.
- **IAM User:** đại diện cho **một người hoặc một ứng dụng**; có thông tin đăng nhập dài hạn (password cho console, access key cho CLI/SDK). Nguyên tắc: **một người dùng vật lý = một AWS user, không chia sẻ credentials**.
- **IAM Group:** tập hợp users; gán policy cho group thì mọi user trong group thừa hưởng quyền. **Group chỉ chứa users, không chứa group khác (không lồng nhau), không chứa role.** User **không bắt buộc thuộc group nào**, và **một user có thể thuộc nhiều group**. Quyền của user = **hợp (union)** các policy từ mọi group + policy gán trực tiếp — trừ khi có explicit Deny.
- **IAM Policy (JSON):** `Version` (luôn dùng `"2012-10-17"`, không phải ngày viết), `Statement` (bắt buộc), mỗi statement gồm `Sid` (tuỳ chọn), `Effect` (bắt buộc: `Allow`/`Deny`), `Action` (bắt buộc, dạng `service:Action`, hỗ trợ `*` và wildcard như `Get*`, `List*`), `Resource` (bắt buộc với identity-based policy, là ARN), `Condition` (tuỳ chọn: IP, MFA, tag, thời gian…), `Id` (tuỳ chọn). `Principal` **chỉ có trong resource-based policy** (S3 bucket policy, trust policy…), **không có trong identity-based policy**.
- **Policy evaluation logic (thuộc lòng):** (1) Mặc định **implicit deny**. (2) Có một **Allow** phù hợp → được phép. (3) **Explicit Deny ở bất kỳ đâu → Deny luôn thắng**, bất kể thứ tự gắn policy hay có bao nhiêu Allow. Tóm tắt: **Explicit Deny > Allow > Implicit Deny**.
- **IAM policy + S3 bucket policy:** khi principal thao tác trên S3, AWS đánh giá **hợp (union)** của cả hai. Hệ quả: xoá quyền S3 khỏi IAM policy của EC2 mà **bucket policy vẫn cho phép** thì EC2 vẫn làm được. (Lưu ý: cross-account thì cần **cả hai phía cùng cho phép**.)
- **Dynamic policy:** một policy duy nhất dùng biến **`${aws:username}`** (thay bằng tên user lúc đánh giá) để mỗi user chỉ truy cập thư mục `/home/<username>` của mình; gắn qua group. Biến policy chỉ hoạt động khi `"Version": "2012-10-17"`.
- **IAM Role:** **không dành cho người cố định, không có credentials dài hạn**. Ai/cái gì được phép **assume role** sẽ nhận **credentials tạm thời qua AWS STS**, tự xoay vòng. Mỗi role có 2 loại policy: **Trust policy** (ai được assume role? Ví dụ `ec2.amazonaws.com`, `lambda.amazonaws.com`, với `Action: sts:AssumeRole`) và **Permissions policy** (assume xong thì được làm gì?). Người gán role cho dịch vụ cần quyền **`iam:PassRole`** trên role đó (nên giới hạn `Resource` cụ thể, tránh `"*"` — **không bao giờ** cấp `iam:PassRole` với `Resource: "*"` vì nguy cơ leo thang đặc quyền). **Service-linked role**: do dịch vụ tự tạo và quản lý, bạn không sửa được permissions.
- **Password policy và MFA:** password policy cấu hình cho IAM users (độ dài tối thiểu, chữ hoa/thường, số, ký tự đặc biệt, cho phép user tự đổi mật khẩu, hết hạn, chống dùng lại). **Password policy không áp dụng cho root user.** **MFA = thứ bạn biết (password) + thứ bạn có (thiết bị).** Các loại MFA: **Virtual MFA device** (app TOTP); **Passkey / FIDO2 security key** (YubiKey, Titan key, passkey — chống phishing tốt nhất); **Hardware TOTP token** (key fob mã 6 số); **Hardware TOTP cho AWS GovCloud (US)** (SurePassID). Theo phần quiz trong ghi chú, **SMS OTP không phải loại MFA hợp lệ cho IAM user**. Có thể yêu cầu MFA cho thao tác nhạy cảm bằng condition `aws:MultiFactorAuthPresent`.
- **Access Keys:** tạo tại IAM → Users → Security credentials; **mỗi user tự quản lý access key của mình**. Gồm **Access Key ID ≈ username** (dạng `AKIA...`) và **Secret Access Key ≈ password — chỉ hiển thị một lần khi tạo**. **Tuyệt đối không chia sẻ, không commit lên Git, không gửi qua chat.** Bị lộ: deactivate ngay, kiểm tra CloudTrail, xoá tài nguyên lạ. Xoay vòng key: tạo key mới → cập nhật ứng dụng → Deactivate key cũ → kiểm tra → Delete.
- **Ba loại policy:**

| | AWS managed policy | Customer managed policy | Inline policy |
|---|---|---|---|
| Ai tạo/quản lý | AWS | Bạn | Bạn, nhúng trực tiếp vào 1 principal |
| Tái sử dụng | Có | Có, gắn nhiều principal | **Không**, quan hệ 1–1 |
| Version / rollback | AWS tự cập nhật | **Có versioning**, rollback được | Không |
| Khi xoá principal | — | Policy vẫn còn | **Policy bị xoá theo** |
| Dùng khi | Quyền admin, power user, theo job function | **Best practice** cho quyền chi tiết | Trường hợp đặc biệt cần gắn chặt với 1 principal |

- **Công cụ kiểm tra bảo mật:** **IAM Credentials Report** (cấp tài khoản, file CSV liệt kê mọi user kể cả root và trạng thái credentials) vs **IAM Access Advisor** (tab *Last accessed*, cấp user/group/role/policy, cho biết các dịch vụ được cấp quyền và lần cuối truy cập từng dịch vụ → cắt quyền không dùng, đạt least privilege). "Liệt kê tất cả user + trạng thái credentials/MFA" → **Credentials Report**; "một user thực sự dùng những dịch vụ nào để cắt quyền" → **Access Advisor**.
- **Shared Responsibility Model cho IAM:** AWS chịu: hạ tầng, phân tích cấu hình và lỗ hổng, validation tuân thủ. Khách hàng chịu: quản lý users, groups, roles, policies và giám sát chúng; bật MFA; xoay vòng keys thường xuyên; cấp quyền phù hợp (least privilege); phân tích access patterns và review quyền.

**Con số IAM:**

| Hạng mục | Giá trị |
|---|---|
| IAM users mỗi tài khoản | 5.000 (mặc định) |
| Groups mỗi tài khoản | 300 (có thể xin tăng) |
| Một user thuộc tối đa | 10 groups |
| Customer managed policy | Tối đa 5 version |
| Managed policy tối đa | 6.144 ký tự |
| Mỗi user/role gắn tối đa | 10 managed policies mặc định (có thể xin tăng đến 20) |
| Mỗi IAM user tối đa | 2 access keys |
| Mỗi root/IAM user gắn tối đa | 8 thiết bị MFA (nên đăng ký ít nhất 2 để dự phòng) |
| Inline policy (ký tự, không tính khoảng trắng) | user 2.048, group 5.120, role 10.240 |
| Credentials Report | Sinh lại tối đa mỗi 4 giờ |
| Access Advisor | Dữ liệu có thể trễ tới 4 giờ |

**Bẫy thi IAM:**
- **Group lồng nhau / user bắt buộc thuộc group:** Sai. Group chỉ chứa users; user có thể thuộc 0, 1 hoặc nhiều group; group không chứa role.
- **IAM theo region:** Sai. IAM là **global**.
- **Root bị giới hạn bằng IAM policy:** Sai. Root có toàn quyền không giới hạn được bằng IAM policy.
- **Mặc định cho phép:** Sai. Mặc định là **implicit deny**; phải có Allow mới được phép.
- **Principal trong identity-based policy:** Sai. `Principal` chỉ xuất hiện trong **resource-based policy / trust policy**.
- **Version trong policy JSON:** `"2012-10-17"` là phiên bản ngôn ngữ policy, **không phải ngày bạn viết policy**.
- **ARN của S3 hay nhầm:** `s3:ListBucket` áp lên **ARN bucket**, `s3:GetObject` áp lên **ARN object** (`.../*`). Đảo hai ARN này là lỗi rất hay gặp.
- **Console vs CLI/SDK:** Console dùng password + MFA; CLI/SDK dùng **access keys**. `aws configure` lưu secret vào `~/.aws/credentials`, còn region/output vào `~/.aws/config` (đảo ngược là sai).
- **AccessDenied khi chạy CLI:** Kiểm tra **IAM policy của identity đang dùng** (dùng `aws sts get-caller-identity`) — không phải cài lại CLI.
- **Chia sẻ user/key, cấp `AdministratorAccess` cho tiện:** Vi phạm least privilege và nguyên tắc một người – một user.
- **Chạy `aws configure` trên EC2, hard-code key trong code/User Data:** Sai. Dịch vụ AWS cần quyền → **IAM Role**.
- **Secret Access Key:** Chỉ hiển thị **một lần** khi tạo; mất là phải tạo key mới.
- **Password policy áp cho root:** Sai. Password policy **không áp dụng cho root user**.
- **CloudShell:** Không trả phí theo giờ, không cần `aws configure`, dữ liệu `$HOME` **không** bị xoá mỗi lần đóng (bền vững 1 GB/region, chỉ xoá sau 120 ngày không dùng ở region đó).

**Liên hệ thực tế — IAM:**
1. **Ứng dụng trên EC2 cần đọc object từ S3:** Tạo IAM Role có **trust policy** cho `ec2.amazonaws.com` (`Action: sts:AssumeRole`), gắn **permissions policy** chỉ cho phép đọc bucket cần thiết (`s3:ListBucket` trên ARN bucket và `s3:GetObject` trên ARN `bucket/*`), rồi gắn role vào EC2 instance (qua instance profile). Ứng dụng nhận **credentials tạm thời qua STS**, tự xoay vòng, không có key dài hạn nào để lộ. Các phương án sai: chạy `aws configure` trên instance với access key của developer, hard-code key trong mã nguồn, tạo IAM user riêng cho instance và lưu key vào User Data.
2. **Developer cần quyền tạm thời, công ty có nhiều nhân viên, nhiều tài khoản:** Không tạo IAM user + access key dài hạn ở từng tài khoản cho mỗi người. Dùng **IAM Identity Center** (kết nối IdP của công ty) với **permission sets** để cấp **credentials tạm thời** dùng chung cho nhiều tài khoản; trên máy dev thì dùng `aws configure sso` + `aws sso login`. Với thao tác nhạy cảm (ví dụ `ec2:StopInstances`/`TerminateInstances`), siết thêm bằng policy có condition `aws:MultiFactorAuthPresent` để bắt buộc MFA.

### 2.2. STS, Advanced Identity & Directory Service

- **AWS STS:** cấp **credentials tạm thời**. 4 API quan trọng nhất:
  - **`AssumeRole`:** assume một IAM Role trong **cùng tài khoản** hoặc **cross-account**. Quan trọng nhất.
  - **`GetSessionToken`:** lấy credentials tạm thời khi dùng **MFA** (cho IAM user hoặc root).
  - **`GetCallerIdentity`:** trả về IAM user/role đang gọi API và **số tài khoản** ("không biết mình là ai").
  - **`DecodeAuthorizationMessage`:** giải mã thông báo lỗi khi một AWS API bị từ chối (encoded authorization failure message).
  - Các API khác: `AssumeRoleWithSAML` (SAML 2.0), `AssumeRoleWithWebIdentity` (IdP web: Facebook/Google/OIDC — AWS khuyến nghị dùng **Cognito Identity Pools** thay vì gọi trực tiếp cho app mobile/web), `GetFederationToken` (federated user).
- **Cross-account với AssumeRole:** tạo role ở tài khoản đích + trust policy cho phép principal nguồn; tài khoản nguồn cấp quyền `sts:AssumeRole`; gọi `AssumeRole` → nhận credentials tạm thời (Access Key ID, Secret Key, Session Token, Expiration).
- **Con số STS:** `AssumeRole`: từ **15 phút** đến **MaxSessionDuration** của role (cấu hình **1–12 giờ**); giá trị **mặc định 1 giờ** (video nói "tối đa 1 giờ" là giá trị mặc định). **Role chaining** (dùng credentials của role để assume role khác): tối đa **1 giờ**. `GetSessionToken`: 15 phút – 36 giờ, mặc định 12 giờ (root tối đa 1 giờ).
- **STS với MFA:** IAM policy cần điều kiện `aws:MultiFactorAuthPresent: true` (ví dụ chỉ cho `ec2:StopInstances`/`TerminateInstances` khi có MFA).
- **`ExternalId`** trong trust policy chống *confused deputy* khi cho bên thứ ba (SaaS) assume role.
- **IAM Identity Center** (trước đây AWS SSO) là cách hiện đại cấp quyền tạm thời đa tài khoản cho workforce, không phải Cognito (Cognito dành cho người dùng ứng dụng).
- **AWS Directory Service (3 lựa chọn):**

| | Managed Microsoft AD | AD Connector | Simple AD |
|---|---|---|---|
| Bản chất | AD thật, AWS quản lý | Proxy về AD on-prem | Thư mục tương thích AD |
| User ở đâu | Trên AWS (và on-prem qua trust) | **Chỉ on-prem** | Trên AWS |
| Kết nối on-prem | **Trust hai chiều** | Proxy trực tiếp | **Không** |
| MFA | Có | Có | Không |
| Dùng khi | Muốn AD trên cloud + trust on-prem | Chỉ proxy xác thực về on-prem | Không có on-prem, cần AD đơn giản |

  - Managed AD Standard ~30.000 object, Enterprise ~500.000 object; AD Connector Small ~500 user, Large ~5.000 user. Cần **2 subnet ở 2 AZ** khác nhau.

**Bẫy thi STS/Identity:**
- EC2 gỡ role khỏi instance nhưng **đọc S3 vẫn được** → do **bucket policy** cho phép (union), không phải do credentials cache.
- Policy có cả explicit Deny và Allow cho cùng hành động → **Deny thắng**.
- 200 user, mỗi user một thư mục riêng → **một customer managed policy với `${aws:username}` gắn cho group**, không phải tạo policy cho từng user hay sửa bucket policy mỗi lần thêm user.
- Đọc policy `iam:PassRole` với `Resource: role/RDS-*` nghĩa là chỉ pass được role có tên bắt đầu bằng `RDS-` — tên role không quyết định quyền bên trong role.
- Cross-account: chỉ tạo role ở tài khoản đích mà **không** cấp quyền `sts:AssumeRole` ở tài khoản nguồn (hoặc ngược lại) thì không assume được.

**Liên hệ thực tế — STS:**
1. **Công ty thuê bạn làm việc trong tài khoản AWS của họ:** cách tốt nhất là nhờ họ tạo **role cross-account** và bạn dùng **STS AssumeRole** lấy credentials tạm thời — không xin IAM user hay access key dài hạn (không scale, kém an toàn).
2. **Công ty có Microsoft AD on-premises, cần tạo thêm AD trên AWS và thiết lập trust với AD on-prem:** dùng **AWS Managed Microsoft AD** (AD thật trên AWS, hỗ trợ trust). Nếu chỉ muốn proxy xác thực về AD on-prem mà không tạo AD riêng thì dùng **AD Connector**; nếu không có on-prem và chỉ cần AD đơn giản thì dùng **Simple AD**.

### 2.3. Cognito — xác thực người dùng ứng dụng

- **Amazon Cognito:** cấp danh tính cho **người dùng cuối của ứng dụng web/mobile** (nằm ngoài tài khoản AWS). Khác IAM: IAM dành cho người/dịch vụ **trong** tổ chức quản trị AWS; Cognito dành cho người dùng ứng dụng.
- **Cognito User Pools (CUP) — Authentication (xác thực):** database người dùng serverless. Tính năng: sign-up/sign-in bằng username/email + password, reset mật khẩu, xác minh email/phone, **MFA**, **federation** (Google, Facebook, Login with Amazon, Sign in with Apple, SAML, OIDC), chặn credentials bị lộ. **Đăng nhập thành công → trả về JWT** (ID token, access token, refresh token).
- **Tích hợp CUP:** **API Gateway** (Cognito authorizer: client gửi JWT trong header `Authorization`, API Gateway verify chữ ký/hạn/issuer) và **Application Load Balancer** (action `authenticate-cognito` trên HTTPS listener).
- **Lambda triggers của CUP** (gọi đồng bộ): Pre Authentication (chấp nhận/từ chối đăng nhập), Post Authentication (ghi log sau khi đăng nhập thành công), Pre Token Generation (thêm/bỏ claims), Pre Sign-up, Post Confirmation (gửi lời chào/log), Migrate User (chuyển user từ hệ cũ), Custom Message (tuỳ biến email/SMS).
- **Managed Login** (từ 11/2024, thay Hosted UI; Hosted UI cũ nay gọi là *classic*): giao diện đăng nhập dựng sẵn, tuỳ biến được logo, CSS/branding, custom domain — **không tuỳ biến được JavaScript**.
- **Adaptive authentication / threat protection** (gói Plus): chấm risk score **Low / Medium / High** dựa trên thiết bị quen thuộc, vị trí, IP; nếu đáng ngờ thì chặn hoặc yêu cầu MFA; log vào CloudWatch Logs.
- **JWT:** 3 phần `Header.Payload.Signature` (Base64). **Phải verify signature trước khi tin payload**. Claim `sub` = user ID trong User Pool. ID token chứa danh tính (`sub`, `email`, `cognito:groups`); access token chứa quyền (`scope`, `cognito:groups`).
- **Cognito Identity Pools (CIP) — Authorization (phân quyền vào AWS):** đổi token từ IdP (CUP, Google, Facebook, Apple, Amazon, SAML, OIDC, developer authenticated) lấy **credentials AWS tạm thời qua STS (`AssumeRoleWithWebIdentity`)** để gọi trực tiếp S3, DynamoDB… Hỗ trợ **guest (unauthenticated) access** với role riêng.
- **Gán role trong CIP:** role mặc định cho authenticated và guest; có thể chọn role theo **rules** (dựa trên user ID/claims) hoặc preferred_role claim; phân quyền chi tiết bằng **policy variables**.
- **ALB authentication:** 2 cách — `authenticate-cognito` (qua CUP, dùng cho social/SAML/LDAP/AD) và `authenticate-oidc` (IdP OIDC trực tiếp, không qua Cognito). **Bắt buộc HTTPS listener**. Rule thường có 2 action: authenticate rồi forward tới target group. `OnUnauthenticatedRequest`: **authenticate** (mặc định, chuyển tới trang login) / **deny** (trả 401) / **allow** (cho qua, dùng cho trang public/login). Callback URL dạng `https://<DNS-của-ALB>/oauth2/idpresponse`; app client dùng cho ALB **phải có client secret** và bật Authorization code grant.

**Con số Cognito:**
- Email mặc định của Cognito (không qua SES): chỉ để test, giới hạn **50 email/ngày** → production phải dùng **Amazon SES**.
- Token: ID/Access token mặc định **1 giờ**; refresh token **30 ngày** (cấu hình được).
- Custom domain cho Managed Login/Hosted UI: certificate ACM **bắt buộc ở region `us-east-1`**, kể cả khi user pool ở region khác.
- **Sign-in identifiers và required attributes không sửa được sau khi tạo pool** → muốn đổi phải tạo pool mới (migrate bằng trigger *User migration*).
- Lambda trigger phải trả về **trong 5 giây**, nếu không Cognito coi là lỗi (có thể retry tối đa 3 lần).
- Feature plans (từ 11/2024): **Lite / Essentials / Plus**; threat protection thuộc gói **Plus**.

**User Pools vs Identity Pools:**

| | User Pools | Identity Pools |
|---|---|---|
| Mục đích | **Authentication** — xác minh danh tính | **Authorization** — kiểm soát truy cập vào AWS |
| Bản chất | Database user cho web/mobile app | Đổi token lấy credentials AWS tạm thời |
| Đăng nhập | Nội bộ + federation (social, OIDC, SAML) | Token từ social, OIDC, SAML, developer authenticated **hoặc CUP** |
| Guest | Không | **Có** |
| Tuỳ biến | Managed Login, Lambda triggers, adaptive authentication | Map vào IAM roles & policies, policy variables |
| Kết quả | **JWT** (ID, access, refresh token) | **AWS credentials** (Access Key, Secret Key, Session Token) |

**Policy variables hay dùng:** `${cognito-identity.amazonaws.com:sub}` = prefix S3 riêng của từng user (là **Identity ID** dạng `region:uuid`, **khác** `sub` của User Pool); `dynamodb:LeadingKeys` = row-level security DynamoDB: partition key phải bằng identity ID của user.
**Trust policy của role trong Identity Pool:** Principal: `cognito-identity.amazonaws.com`; action: `sts:AssumeRoleWithWebIdentity` (+ `sts:TagSession` nếu dùng attributes for access control); điều kiện `aud` = Identity Pool ID và `amr` = `authenticated`/`unauthenticated`.

**Bẫy thi Cognito:**
- Nhầm **User Pools (đăng nhập)** với **Identity Pools (credentials AWS)** — đề hỏi "truy cập trực tiếp S3/DynamoDB" thì đáp án là Identity Pools, không phải User Pools.
- **Cognito Sync đã lỗi thời**; AWS khuyến nghị **AppSync** để đồng bộ dữ liệu người dùng. Đáp án "Cognito Sync" cho bài toán xác thực/phân quyền là đáp án nhiễu.
- **Classic Load Balancer không hỗ trợ xác thực người dùng** — chỉ API Gateway và ALB.
- Hosted UI/Managed Login tuỳ biến được logo, CSS, URL — **không** tuỳ biến được JavaScript.
- Ghi log **mọi lần đăng nhập thành công** → **Post Authentication**, không phải Pre Authentication (Pre chạy trước khi biết đăng nhập có thành công không, dùng để chấp nhận/từ chối).
- CUP trả về **JWT**, không phải SAML token, không trả lại username/password.
- App chạy trên trình duyệt/mobile **không được dùng client secret**; chỉ backend (confidential client) mới dùng secret.
- Hai luồng Identity Pool: **Enhanced (simplified)** mặc định (GetId → GetCredentialsForIdentity) và **Basic (classic)** (GetId → GetOpenIdToken → tự gọi STS AssumeRoleWithWebIdentity).

**Liên hệ thực tế — Cognito:**
1. **App mobile cho người dùng đăng nhập bằng Facebook rồi gọi API:** dùng **Cognito User Pools** (federation Facebook) + **API Gateway Cognito authorizer** — user đăng nhập → nhận JWT → gửi JWT lên API Gateway để kiểm tra. Không cần Identity Pool vì quyền nằm ở Lambda role phía backend.
2. **App chia sẻ ảnh: user đăng nhập bằng Twitter và truy cập trực tiếp ảnh/dữ liệu của chính mình trên S3/DynamoDB:** dùng **Identity Pools** (đăng nhập qua Twitter → đổi token lấy credentials tạm thời) + policy variables (`${cognito-identity.amazonaws.com:sub}` cho prefix S3, `dynamodb:LeadingKeys` cho DynamoDB) để mỗi user chỉ thấy dữ liệu của mình. Kết hợp CUP làm nơi tập trung user là best practice: CUP (authentication) + CIP (authorization).

### 2.4. KMS, Encryption & Secrets — mã hoá và quản lý secret

**3 kiểu mã hoá:** **in-flight (TLS/SSL)** — chống MITM khi truyền; **server-side at rest** — dịch vụ AWS tự mã hoá/giải mã bằng key từ KMS (SSE-S3, SSE-KMS, EBS, RDS, DynamoDB); **client-side** — client tự mã hoá, server không bao giờ giải mã được.

**AWS KMS:**
- Quản lý key, tích hợp IAM, audit mọi lần dùng key bằng **CloudTrail**.
- **Symmetric (AES-256-GCM):** 1 key cho cả encrypt/decrypt; **không bao giờ lấy được key plaintext**, phải gọi KMS API; dùng cho mọi dịch vụ AWS tích hợp KMS và envelope encryption.
- **Asymmetric (RSA, ECC):** cặp public/private; **tải được public key**, private key không rời KMS; dùng khi người **ngoài AWS, không gọi được KMS API** cần mã hoá, hoặc để ký số (sign/verify).
- **AWS owned key:** key của SSE-S3, DynamoDB mặc định; không thấy trong account; miễn phí.
- **AWS managed key** (`aws/rds`, `aws/ebs`, `aws/s3`, `aws/lambda`): thấy trong account (chỉ xem), **miễn phí** (trả tiền API call), AWS quản lý key policy (**không sửa được**), **rotation tự động mỗi 1 năm**, **không share cross-account**.
- **Customer managed key (CMK):** bạn tạo; **$1/tháng** (+ API call); **sửa được key policy**; rotation tự động (bật/tắt, chu kỳ cấu hình được) hoặc on-demand; **share cross-account được**; hỗ trợ BYOK (imported key, chỉ symmetric, rotation thủ công qua alias).

**Key policy là nguồn quyền chính của KMS:** không có key policy thì **không ai** dùng được key. **Default key policy** cho toàn bộ account (root) → từ đó **IAM policy** quyết định ai dùng được. IAM policy `kms:*` mà key policy không cho phép account thì vẫn bị `AccessDenied`.

**KMS key theo region:** copy snapshot mã hoá sang region khác → **re-encrypt bằng key ở region đích** (trừ multi-region key). Share snapshot mã hoá cross-account: phải dùng **CMK** (AWS managed key `aws/ebs` **không share được**) + key policy cho tài khoản đích + tài khoản đích copy và re-encrypt bằng CMK của họ.

**Envelope encryption:** KMS `Encrypt` chỉ mã hoá tối đa **4 KB** → dữ liệu lớn hơn dùng **`GenerateDataKey`**: KMS sinh DEK, trả về **plaintext DEK + encrypted DEK**; client mã hoá file bằng plaintext DEK ở local, xoá plaintext DEK, lưu envelope `[encrypted DEK | encrypted file]`. Giải mã: `Decrypt` encrypted DEK → plaintext DEK → giải mã file. CMK **không bao giờ rời KMS**. **`GenerateDataKeyWithoutPlaintext`** chỉ trả encrypted DEK — dùng khi muốn sinh DEK để **dùng sau**. Đây cũng là cách S3 SSE-KMS, EBS, RDS hoạt động bên trong.

**AWS Encryption SDK:** cài đặt envelope encryption sẵn cho dữ liệu bất kỳ (Java, Python, C, JavaScript, .NET, Rust, Go + CLI). Khác S3 Encryption Client (chỉ cho S3). **Data key caching** (`LocalCryptoMaterialsCache` với max age, max bytes, max messages): tái sử dụng DEK → **giảm số lần gọi KMS** → giảm chi phí và throttling, đánh đổi bảo mật (một DEK mã hoá nhiều message).

**KMS quotas & throttling:** vượt quota → **`ThrottlingException`**. Xử lý: **exponential backoff** (có jitter), **DEK caching**, **tăng quota** qua Service Quotas/Support. Quota **dùng chung** giữa các API mã hoá (`Encrypt`, `Decrypt`, `GenerateDataKey`, `GenerateDataKeyWithoutPlaintext`, `ReEncrypt`, `GenerateRandom`…), tính theo **account + region**. Dịch vụ AWS gọi KMS thay bạn (S3 SSE-KMS, EBS…) cũng tính vào quota của bạn.

**S3 Bucket Key:** xem 1.4 — giảm tới 99% số lần gọi KMS.

**Key policy conditions:** **`kms:ViaService`** — chỉ cho dùng key khi request đến từ một dịch vụ AWS cụ thể (ví dụ `ec2.us-west-2.amazonaws.com`); **`kms:CallerAccount`** — giới hạn theo account ID người gọi. Cross-account KMS cần **cả hai phía**: key policy (bên sở hữu) + IAM policy (bên gọi, trỏ tới **key ARN**, không dùng alias cross-account).

**AWS CloudHSM:** **phần cứng mã hoá chuyên dụng, single-tenant**, **bạn tự quản lý key hoàn toàn** (AWS không khôi phục được nếu bạn mất credentials), FIPS 140-2 Level 3, hỗ trợ symmetric + asymmetric, **không có free tier**, phải dùng CloudHSM Client Software, HA multi-AZ, tích hợp KMS qua **Custom Key Store**. Phù hợp **SSE-C** với key trên HSM riêng.

**SSM Parameter Store:**
- Lưu cấu hình/secret an toàn, **hierarchy** (`/my-app/dev/db-url`, `/my-app/prod/db-password`), **version tracking**, phân quyền IAM theo path, thông báo qua EventBridge, tích hợp CloudFormation.
- Kiểu: `String`, `StringList`, **`SecureString`** (mã hoá bằng KMS `aws/ssm` hoặc CMK; đọc plaintext cần `--with-decryption` + `kms:Decrypt`).
- Đọc cả cây: `get-parameters-by-path --path /my-app/ --recursive` (không có `--recursive` chỉ trả tham số ở đúng cấp đó).
- Đọc secret của Secrets Manager qua Parameter Store bằng prefix `/aws/reference/secretsmanager/...`.

**AWS Secrets Manager:**
- Chuyên cho secret; **mã hoá bằng KMS bắt buộc**; **rotation tự động** bằng Lambda (4 bước: createSecret → setSecret → testSecret → finishSecret; staging label `AWSCURRENT`/`AWSPREVIOUS`/`AWSPENDING`); template sẵn cho **RDS, Redshift, DocumentDB**; **multi-region replication** (promote replica khi DR); CloudFormation: `ManageMasterUserPassword: true` (RDS tự tạo/quản lý secret) hoặc dynamic reference `{{resolve:secretsmanager:secret-id:SecretString:json-key}}`.

**Parameter Store vs Secrets Manager:**

| Tiêu chí | SSM Parameter Store | Secrets Manager |
|---|---|---|
| Mục đích | Cấu hình + secret (đa năng) | **Chuyên cho secret** |
| Chi phí | **Rẻ** (Standard miễn phí) | **Đắt hơn** ($0,40/secret/tháng) |
| Mã hoá KMS | **Tuỳ chọn** (SecureString) | **Bắt buộc** |
| Rotation tự động | **Không có sẵn** (tự làm bằng EventBridge + Lambda) | **Có**, Lambda; template sẵn cho RDS/Redshift/DocumentDB |
| Sinh mật khẩu | Không | Có (`GenerateSecretString`, `get-random-password`) |
| Hierarchy / path | **Có** | Không (tên có thể chứa `/` nhưng không có API theo path) |
| Kích thước | 4 KB / 8 KB | **64 KB** |
| Multi-region | Không | **Có** (replication) |
| Cross-account | Hạn chế (Advanced share qua RAM) | Có (resource policy + CMK) |
| CloudFormation | `{{resolve:ssm:...}}`, `{{resolve:ssm-secure:...}}` | `{{resolve:secretsmanager:...}}` |

**KMS vs CloudHSM:**

| Tiêu chí | AWS KMS | AWS CloudHSM |
|---|---|---|
| Tenancy | Multi-tenant | **Single-tenant** |
| Ai quản lý key | AWS + bạn (qua policy) | **Chỉ bạn** |
| Access control | **IAM + key policy** | **User trong HSM** (CO, CU) |
| Tích hợp dịch vụ AWS | Rất nhiều | Qua KMS Custom Key Store |
| Free tier | Có | **Không** |
| HA | AWS quản lý | Bạn thêm HSM ở nhiều AZ |

**CloudWatch Logs encryption:** bật ở cấp log group bằng CMK, chỉ qua **CLI/SDK/API**: log group đã có → **`associate-kms-key`**; log group mới → **`create-log-group --kms-key-id`**. Key policy phải cho phép service principal **`logs.<region>.amazonaws.com`**, nếu không sẽ `AccessDeniedException`. Chỉ dữ liệu mới được mã hoá; disable/xoá key thì không đọc/ghi được log group nữa.

**CodeBuild security:** secret **không lưu plaintext** trong env vars — dùng env var tham chiếu **Parameter Store** (`PARAMETER_STORE`) hoặc **Secrets Manager** (`SECRETS_MANAGER`); service role cần `ssm:GetParameters` / `secretsmanager:GetSecretValue` (+ `kms:Decrypt` nếu dùng CMK). Cần truy cập tài nguyên trong VPC → cấu hình **VPC** (VPC ID, subnet, security group).

**AWS Nitro Enclaves:** **VM cô lập, cứng hoá** để xử lý dữ liệu cực kỳ nhạy cảm (PII, y tế, tài chính): **không persistent storage, không network ra ngoài, không truy cập tương tác (không SSH)**, chỉ giao tiếp với EC2 cha qua **vsock**; **cryptographic attestation** (chỉ code được ký/xác thực mới chạy, chỉ enclave mới giải mã được bằng KMS với condition `kms:RecipientAttestation:ImageSha384`). Bật `EnclaveOptions = true` khi launch EC2 Nitro, đóng gói bằng Nitro CLI thành EIF.

**Con số KMS/Secrets:**

| Hạng mục | Giá trị |
|---|---|
| KMS `Encrypt`/`Decrypt` trực tiếp | Tối đa **4 KB** |
| CMK | **$1/tháng**; API call ~$0,03 / 10.000 request |
| AWS managed key rotation | **1 năm** |
| CMK rotation tự động | Chu kỳ cấu hình **90 – 2.560 ngày** (mặc định 365) + on-demand rotation. Rotation **giữ nguyên key ID/ARN**, chỉ thêm key material mới; dữ liệu cũ vẫn giải mã được |
| Xoá key | **Schedule deletion 7–30 ngày** (mặc định 30); trong thời gian chờ có thể huỷ; key ở trạng thái Pending deletion không dùng được |
| Quota cryptographic operations (tuỳ region, dùng chung) | Symmetric CMK 5.500 / 10.000 / 30.000 request/giây; asymmetric RSA 500; asymmetric ECC 300 |
| S3 Bucket Key | Giảm tới **99%** số lần gọi KMS |
| Parameter Store Standard | Tối đa 10.000 parameter, value tối đa 4 KB, lưu trữ miễn phí, **không có parameter policies** |
| Parameter Store Advanced | Tối đa 100.000 parameter, value tối đa 8 KB, $0,05/parameter/tháng. Nâng Standard → Advanced được, **không hạ ngược** được. Parameter policies (chỉ Advanced): `Expiration`, `ExpirationNotification` (EventBridge trước X ngày), `NoChangeNotification` |
| Secrets Manager | $0,40/secret/tháng + $0,05/10.000 API call; kích thước secret tối đa 64 KB; xoá có recovery window **7–30 ngày** (hoặc `--force-delete-without-recovery`); rotation có thể đặt tới mỗi 4 giờ |
| CLI | Plaintext/ciphertext truyền bằng **`fileb://`** (binary); output CLI là **base64**; decrypt symmetric **không cần chỉ key ID** (ciphertext chứa metadata của key) |

**Bẫy thi KMS/Secrets:**
- Mã hoá file **1 MB** bằng KMS: `Encrypt` báo lỗi kích thước → **envelope encryption với `GenerateDataKey`**, không phải chia file thành phần 4 KB hay xin tăng giới hạn (giới hạn 4 KB không tăng được).
- Cần tạo data key để **dùng sau** (không cần plaintext ngay) → **`GenerateDataKeyWithoutPlaintext`**, không phải `GenerateRandom` (chỉ trả byte ngẫu nhiên, không gắn CMK).
- Lambda gọi KMS hàng nghìn lần/giây bị `ThrottlingException`: cách **không** giúp là **tạo thêm nhiều CMK** (quota tính theo account + region, dùng chung cho mọi key cùng loại). Cách đúng: exponential backoff, DEK caching, tăng quota.
- Đối tác **không có tài khoản AWS** cần mã hoá dữ liệu gửi cho bạn, chỉ bạn giải mã được → **asymmetric KMS key (RSA)**: đưa public key cho đối tác, private key không rời KMS. Symmetric key không lấy ra khỏi KMS được.
- Key chỉ được dùng khi request đến từ RDS → **`kms:ViaService`**; giới hạn theo account gọi → **`kms:CallerAccount`**.
- S3 SSE-KMS lưu lượng cao, chi phí KMS tăng, thỉnh thoảng bị throttle → **bật S3 Bucket Key** (không phải chuyển SSE-C hay DSSE-KMS — DSSE-KMS mã hoá 2 lớp nên còn gọi KMS nhiều hơn).
- Upload SSE-KMS bị `AccessDenied` → thiếu **`kms:GenerateDataKey`**; download → thiếu **`kms:Decrypt`**.
- Đọc SecureString trả về chuỗi mã hoá khó đọc → thêm **`--with-decryption`** và đảm bảo có quyền `kms:Decrypt`.
- Parameter tự hết hạn + thông báo EventBridge → **Advanced tier với parameter policies**; Standard không hỗ trợ.
- Mật khẩu master RDS tự đổi mỗi 30 ngày không cần sửa ứng dụng → **Secrets Manager với automatic rotation** (KMS key rotation chỉ đổi key material, không đổi mật khẩu DB).
- Mã hoá CloudWatch Logs bị `AccessDeniedException` → key policy chưa cho phép **`logs.<region>.amazonaws.com`**.
- CodeBuild cần mật khẩu DB để test với RDS trong private subnet → env var tham chiếu Parameter Store/Secrets Manager **+ cấu hình VPC** cho CodeBuild (không ghi plaintext, không mở RDS ra Internet).
- Xử lý số thẻ tín dụng trong môi trường cô lập, không network, không SSH, chỉ code đã xác thực mới giải mã được bằng KMS → **Nitro Enclaves** (không phải Dedicated Host, CloudHSM hay Macie).
- Secret mã hoá + audit + API call đơn giản → **SecureString trong SSM Parameter Store** (1 API call với `--with-decryption`) + **CloudTrail** audit (không tồn tại "SSM Audit Trail").

**Liên hệ thực tế — KMS/Secrets:**
1. **Ứng dụng cần mã hoá file 1 MB trước khi lưu lên S3, và server không được thấy dữ liệu plaintext:** dùng **client-side envelope encryption** — gọi `GenerateDataKey` lấy plaintext DEK mã hoá file ở local bằng AES-256, lưu envelope `[encrypted DEK | encrypted file]` lên S3; khi đọc, gọi `Decrypt` lấy lại DEK rồi giải mã. Thực tế nên dùng **AWS Encryption SDK** thay vì tự viết (đã xử lý format, nonce, AAD, key commitment).
2. **Mật khẩu database RDS phải tự động đổi mỗi 30 ngày, ứng dụng multi-region cần DR:** dùng **Secrets Manager** — bật automatic rotation bằng Lambda template sẵn cho RDS (staging label AWSCURRENT/AWSPENDING đảm bảo không gãy kết nối), bật **multi-region replication** để replica ở region khác có thể promote khi region chính gặp sự cố. Ngược lại, cấu hình ứng dụng theo môi trường dev/prod dạng cây, có version, chi phí thấp, không cần rotation → **Parameter Store Standard** là đủ.

### 2.5. ACM, Private CA, Macie, AppConfig (mức nhận diện)

- **ACM:** provision/quản lý/triển khai **chứng chỉ SSL/TLS**; cung cấp **mã hoá in-flight** (HTTPS); chứng chỉ **public miễn phí**, **tự động gia hạn**; tích hợp **ALB, CloudFront, API Gateway**. Validation: **DNS validation** (tạo CNAME trong Route 53 — nên ưu tiên vì tự gia hạn được) hoặc email validation (không tự gia hạn nếu không có người xác nhận). **Chứng chỉ cho CloudFront phải tạo ở `us-east-1`**; ALB/API Gateway regional thì tạo ở cùng region. Chứng chỉ ACM public **không gắn trực tiếp được lên EC2** (không export private key) — cập nhật 2025: có thêm **exportable public certificates** (có tính phí). Chứng chỉ **import** từ CA ngoài **không tự gia hạn**.
- **AWS Private CA:** dịch vụ managed tạo **Root CA** và **Subordinate CA**, cấp **end-entity X.509 certificate** cho ứng dụng; chứng chỉ **chỉ được tin cậy trong tổ chức**, **không dùng được trên internet công cộng**. Use case: **TLS nội bộ**, ký code, xác thực user/máy/API/IoT, xây dựng **PKI doanh nghiệp**. Dùng cho **mTLS** giữa microservice, **IAM Roles Anywhere**.
- **Amazon Macie:** dùng **machine learning và pattern matching** để **phát hiện và bảo vệ dữ liệu nhạy cảm (PII)** — **chỉ làm việc với S3**. Luồng: S3 → Macie phân tích → **finding qua EventBridge** → SNS/Lambda… Bật bằng một click, chọn bucket cần quét. Có automated sensitive data discovery, custom data identifier (regex), đẩy finding sang Security Hub.
- **AWS AppConfig:** **tách cấu hình ra ngoài ứng dụng** — cấu hình, kiểm tra (validate) và triển khai **cấu hình động** mà **không cần deploy code mới, không cần restart**. Use case: **feature flag** (deploy code với flag off, khi sẵn sàng bật flag), tinh chỉnh hiệu năng, danh sách chặn/cho phép IP. Nguồn cấu hình: **SSM Parameter Store, SSM Documents, S3**. Ứng dụng **định kỳ poll** lấy thay đổi. **Triển khai dần** (deployment strategy: AllAtOnce, Linear50PercentEvery30Seconds, Canary10Percent20Minutes…); **theo dõi CloudWatch alarm, nếu alarm kích hoạt thì tự rollback**. Validate trước khi triển khai bằng **JSON Schema** hoặc **Lambda function**. API mới: `appconfigdata` (`StartConfigurationSession` + `GetLatestConfiguration`); API `GetConfiguration` cũ đã deprecated.
- **AppConfig vs Parameter Store:** Parameter Store chỉ lưu giá trị; AppConfig bổ sung **validation, triển khai dần, rollback theo CloudWatch Alarm**. Đổi biến môi trường trong task definition thì phải chạy lại task (không phải cấu hình động).
- **Bẫy:** quản lý tập trung chứng chỉ TLS cho ALB/CloudFront/API Gateway → **ACM** (KMS quản lý khoá mã hoá, không phải chứng chỉ TLS; IAM chỉ lưu server certificate cũ, không phải cách khuyến nghị). Chứng chỉ **nội bộ, PKI doanh nghiệp** → **AWS Private CA**. **Macie chỉ làm việc với S3**; Shield chống DDoS; KMS mã hoá chứ không phát hiện dữ liệu nhạy cảm.

---

## DOMAIN 3 — DEPLOYMENT (24%)

### 3.1. CloudFormation — IaC khai báo

- **CloudFormation:** IaC **declarative** — bạn khai báo trạng thái mong muốn, CloudFormation tự tạo/cập nhật/xoá tài nguyên theo đúng thứ tự phụ thuộc. Engine triển khai thực sự đứng sau cả SAM và CDK.
- **Sections:** chỉ có **Resources là bắt buộc duy nhất**; các section khác: `AWSTemplateFormatVersion`, `Description`, `Metadata`, `Parameters`, `Mappings`, `Conditions`, `Transform`, `Outputs`.
- **Change set:** xem trước thay đổi (tài nguyên nào bị tạo/thay thế/xoá) **trước khi** thực thi — luôn dùng change set khi cập nhật stack production.
- **Parameters / Pseudo parameters:** parameters là đầu vào khi tạo stack; pseudo parameters là biến AWS cung cấp sẵn (`AWS::Region`, `AWS::AccountId`, `AWS::StackName`, `AWS::Partition`, `AWS::NotificationARNs`…).
- **Mappings:** bảng tra cứu theo region/môi trường (ví dụ AMI ID theo region).
- **Outputs / Export + ImportValue:** stack này export giá trị, stack khác import bằng `Fn::ImportValue`. **Phải xoá hết các stack import trước, rồi mới xoá stack export.**
- **Conditions:** gắn với **Resources và Outputs** — lưu ý: **Parameters không gắn được Condition**.
- **Intrinsic functions:** `Ref`, `Fn::GetAtt`, `Fn::Join`, `Fn::Sub`, `Fn::FindInMap`, `Fn::ImportValue`, `Fn::If`, `Fn::Select`, `Fn::Split`, `Fn::GetAZs`…
- **Rollback:** cập nhật thất bại → stack tự rollback về trạng thái cũ (trừ khi tắt rollback).
- **Service role + PassRole:** CloudFormation dùng service role để tạo tài nguyên; người tạo stack cần quyền `iam:PassRole` cho role đó.
- **Capabilities:** template tạo IAM resource thì phải khai báo `CAPABILITY_IAM` (hoặc `CAPABILITY_NAMED_IAM` nếu đặt tên tường minh cho IAM resource).
- **DeletionPolicy:** `Retain` (giữ lại khi xoá stack) / `Snapshot` (chụp snapshot trước khi xoá, cho RDS…) / `Delete` (xoá cùng stack). Bucket S3 không rỗng sẽ làm `delete-stack` thất bại (`DELETE_FAILED`).
- **Stack policy:** ngăn cập nhật một số tài nguyên quan trọng.
- **Termination protection:** bật để tránh xoá nhầm stack.
- **Custom resources:** resource tự định nghĩa, backed by Lambda (hoặc SNS) — dùng khi CloudFormation chưa hỗ trợ sẵn một thao tác.
- **StackSets:** triển khai cùng stack ra nhiều account/region cùng lúc.
- **Thứ tự xoá quan trọng:** xoá **CloudFormation stack** trước (tự xoá tài nguyên con) → **Beanstalk environment** (tự xoá EC2/ELB/ASG đi kèm) → rồi mới xoá thủ công phần còn lại. Xoá tay tài nguyên con trước có thể khiến stack rơi vào `DELETE_FAILED`. Stack `CDKToolkit` và `aws-sam-cli-managed-default` để **cuối cùng** (phải làm rỗng S3 bucket của chúng trước).
- **Dynamic reference:** `{{resolve:ssm:...}}`, `{{resolve:ssm-secure:...}}`, `{{resolve:secretsmanager:secret-id:SecretString:json-key}}` — lấy giá trị lúc deploy mà không hard-code secret vào template.

**Bẫy thi CloudFormation:**
- **Parameters không gắn được Condition** (Condition chỉ gắn với Resources và Outputs).
- Xoá stack: xoá hết stack import trước, stack export cuối cùng.
- Template tạo IAM role mà deploy không qua `--guided` → lỗi `Requires capabilities: [CAPABILITY_IAM]` → thêm `--capabilities CAPABILITY_IAM`.
- Stack `DELETE_FAILED` ở `AWS::S3::Bucket`: nguyên nhân phổ biến nhất là **bucket vẫn còn object (hoặc object versions)** — làm rỗng bucket rồi retry, hoặc retain bucket.

### 3.2. SAM — framework serverless trên CloudFormation

- **AWS SAM** là framework phát triển và triển khai ứng dụng serverless bằng file **YAML** đơn giản; SAM sinh ra CloudFormation phức tạp từ YAML đó. SAM hỗ trợ mọi thứ của CloudFormation như `Outputs`, `Mappings`, `Parameters`, `Resources`.
- **Dấu hiệu nhận biết SAM template:** dòng đầu template: `Transform: 'AWS::Serverless-2016-10-31'`.
- **Các SAM resource chính:**
  - `AWS::Serverless::Function`: Lambda function, kèm IAM role, event source, permission.
  - `AWS::Serverless::Api`: API Gateway REST API.
  - `AWS::Serverless::SimpleTable`: DynamoDB table có khóa chính đơn giản, chuyển thành `AWS::DynamoDB::Table`. **SimpleTable chỉ hỗ trợ khóa chính đơn**; cần sort key, GSI, Streams, TTL thì phải dùng `AWS::DynamoDB::Table` trực tiếp.
  - Ghi chú còn nhắc thêm: `HttpApi`, `LayerVersion`, `Application`, `StateMachine`, `Connector`, `GraphQLApi`; **không có `AWS::Serverless::UserPool`** (Cognito User Pool vẫn khai báo bằng `AWS::Cognito::UserPool`).
- **Section `Globals`:** khai báo thuộc tính chung cho mọi function như `Runtime`, `Timeout`, `MemorySize`, `Environment`, `Tracing`, tránh lặp lại.
- **Luồng SAM CLI:** `sam init` → `sam build` → `sam deploy` → `sam delete`.
  - `sam build` tạo `.aws-sam/build/` chứa CloudFormation template đã xử lý và code kèm dependencies.
  - `sam deploy` tự package, zip và upload artifact lên **S3**, rồi tạo và thực thi **CloudFormation ChangeSet**. Trước đây phải chạy riêng `sam package` rồi `sam deploy`.
  - Lần đầu, SAM tạo stack `aws-sam-cli-managed-default` chứa S3 bucket lưu artifact.
  - `sam deploy --guided` hỏi tương tác: stack name, region, xác nhận changeset, cho phép tạo IAM role, lưu cấu hình vào `samconfig.toml`.
- **SAM Accelerate (`sam sync`):**
  - `sam sync`: đồng bộ code + hạ tầng; thay đổi hạ tầng vẫn qua CloudFormation.
  - `sam sync --code`: chỉ đồng bộ code, bỏ qua CloudFormation, dùng trực tiếp service API như Lambda `UpdateFunctionCode`.
  - `sam sync --code --resource AWS::Serverless::Function`: chỉ đồng bộ code của tất cả Lambda function.
  - `sam sync --code --resource-id <ID>`: chỉ đồng bộ một resource cụ thể.
  - `sam sync --watch`: chạy nền, theo dõi file thay đổi và tự đồng bộ.
  - **`sam sync` chỉ dành cho dev**, cố ý tạo drift giữa stack và resource thật để đổi lấy tốc độ; production dùng `sam deploy` qua pipeline CI/CD. `sam sync` cũng bỏ qua CodeDeploy traffic shifting.
- **SAM Policy Templates:** khai báo trong thuộc tính `Policies` của `AWS::Serverless::Function`; khi transform, SAM tạo IAM policy gắn vào execution role của Lambda. Các template quan trọng: `S3ReadPolicy` (đọc object trong S3), `SQSPollerPolicy` (poll, tức nhận/xóa message của SQS queue), `DynamoDBCrudPolicy` (Create, Read, Update, Delete trên bảng DynamoDB), `S3CrudPolicy`, `S3WritePolicy`, `DynamoDBReadPolicy`, `DynamoDBWritePolicy`, `SQSSendMessagePolicy`, `SNSPublishMessagePolicy`, `LambdaInvokePolicy`, `KMSDecryptPolicy`, `SSMParameterReadPolicy`, `KinesisStreamReadPolicy`, `EventBridgePutEventsPolicy`, `VPCAccessPolicy`… `Policies` có thể trộn managed policy, policy template và inline policy document.
  - **Least privilege:** Lambda chỉ cần đọc S3 thì chọn `S3ReadPolicy`, không chọn `S3CrudPolicy` (thừa ghi/xóa). `S3ReadPolicy` nhận `BucketName` là **tên bucket, không phải ARN**.
- **SAM + CodeDeploy (traffic shifting cho Lambda):**
  - `AutoPublishAlias`: SAM publish version mới và cập nhật alias trỏ tới version đó.
  - `DeploymentPreference.Type`: chiến lược chuyển traffic — `Canary`, `Linear`, `AllAtOnce` (chi tiết ở 3.4).
  - `Alarms`: danh sách CloudWatch alarm; alarm kích hoạt thì rollback.
  - `Hooks`: `PreTraffic` / `PostTraffic` là Lambda function kiểm tra deployment trước/sau khi chuyển traffic. Hook bắt buộc gọi `codedeploy:PutLifecycleEventHookExecutionStatus` báo `Succeeded`/`Failed`; nếu không, deployment treo tới khi timeout.
- **Test local bằng SAM CLI (cần Docker):**
  - `sam local invoke`: gọi một lần một Lambda với payload rồi thoát.
  - `sam local start-api`: khởi động HTTP server local host tất cả API và function (port mặc định 3000); sửa code thì tự reload.
  - `sam local start-lambda`: khởi động endpoint local giả lập Lambda service để chạy automated test (port mặc định 3001).
  - `sam local generate-event`: sinh event mẫu cho S3, API Gateway, SNS, Kinesis, DynamoDB… rồi pipe vào `sam local invoke`.
  - Function chạy bằng `sam local` vẫn gọi **bảng DynamoDB thật trên AWS** theo profile/region, trừ khi cấu hình trỏ tới DynamoDB Local; function local gọi AWS thật thì dùng `--profile` đúng. `sam local` cần **Docker đang chạy**, nên không chạy được trên CloudShell; `sam build --use-container` cũng cần Docker.
- **Nhiều môi trường:** file `samconfig.toml` (định dạng TOML) đặt cạnh SAM template, mỗi môi trường có nhóm tham số riêng như `[dev.deploy.parameters]`, `[prod.deploy.parameters]`; triển khai bằng `sam deploy --config-env dev` / `sam deploy --config-env prod`.
- **Runtime cũ trong video:** Python 2.7, 3.7, 3.9 đã bị Lambda deprecate — đừng chọn runtime đã deprecated trong đáp án.

### 3.3. CDK — hạ tầng bằng ngôn ngữ lập trình

- **AWS CDK** là công cụ định nghĩa hạ tầng cloud bằng **ngôn ngữ lập trình quen thuộc**: **JavaScript/TypeScript, Python, Java, .NET (C#) và Go**. CLI viết bằng Node.js nên **luôn cần Node.js** kể cả khi viết app bằng Python/Java.
- **Cơ chế cốt lõi:** code CDK được **synthesize** thành **CloudFormation template** (JSON/YAML); CloudFormation vẫn là engine triển khai thực sự. Do đó có thể triển khai hạ tầng và code ứng dụng cùng lúc: CDK tự đóng gói code Lambda thành asset upload lên S3; với container ECS/EKS, CDK build image và push lên ECR.
- **Lợi ích so với viết YAML tay:** type safety và autocomplete trong IDE, phát hiện lỗi khi compile; dùng vòng lặp, điều kiện, hàm, class, kế thừa để tái sử dụng; default an toàn và hợp lý (ví dụ bucket chặn public access, tự sinh IAM role); method **`grant*()`** sinh IAM policy least-privilege chỉ bằng một dòng.
- **Cấu trúc CDK App:** `App` là gốc của cây construct, có thể chứa nhiều `Stack`; mỗi `Stack` tương ứng **1 CloudFormation stack** (đơn vị triển khai); `Stack` chứa các `Construct`.
- **Construct:** khối xây dựng, có thể đại diện 1 resource (S3 bucket) hoặc nhiều resource liên quan (worker queue + compute). **AWS Construct Library** là bộ construct chính thức cho từng dịch vụ; **Construct Hub (constructs.dev)** là nơi tìm construct thêm từ AWS, bên thứ ba và cộng đồng open source.
- **3 cấp Construct:**

| | L1 (CFN Resources) | L2 (Curated) | L3 (Patterns) |
|---|---|---|---|
| Tên nhận biết | Bắt đầu bằng `Cfn`, ví dụ `s3.CfnBucket` | Tên dịch vụ trực tiếp, ví dụ `s3.Bucket`, `lambda.Function` | Tên pattern, ví dụ `apigateway.LambdaRestApi`, `ecs_patterns.ApplicationLoadBalancedFargateService` |
| Ánh xạ | 1-1 với resource CloudFormation | 1 resource AWS với API cấp cao | Nhiều resource liên quan cho một kiến trúc phổ biến |
| Cấu hình | Phải khai báo tất cả thuộc tính thủ công | Có default hợp lý, chỉ khai báo thuộc tính cần khác default | Chỉ cần truyền vài tham số chính, phần còn lại tự tạo |
| Method tiện ích | Không có | Có `grant*`, `addEventNotification`, `metric*`… | Tự tạo sẵn integration, permission, load balancer… |
| Khi nào dùng | Cần thuộc tính CloudFormation mới nhất mà L2 chưa có | Hầu hết trường hợp thông thường | Muốn dựng nhanh một kiến trúc chuẩn với ít code nhất |

- **Escape hatch (L2 → L1):** khi L2 chưa hỗ trợ một thuộc tính, truy cập L1 bên dưới qua `node.defaultChild`, ví dụ ép `s3.CfnBucket` rồi dùng `addPropertyOverride`.
- **Bootstrapping:** quá trình cấp phát resource cho CDK **trước khi** deploy CDK app vào một **environment**. **Environment = account + region**; mỗi environment cần bootstrap **một lần**. Lệnh `cdk bootstrap` tạo CloudFormation stack tên **`CDKToolkit`** chứa: S3 bucket lưu asset, ECR repository lưu Docker image, các IAM role phục vụ deployment (deploy role, file/image publishing role, lookup role, CloudFormation execution role) và SSM parameter `/cdk-bootstrap/<qualifier>/version` lưu phiên bản bootstrap.
  - Ví dụ: 1 account deploy vào 3 region `us-east-1`, `eu-west-1`, `ap-southeast-1` thì cần bootstrap **3 lần**, không phải 1 lần global theo account.
  - Lần đầu `cdk deploy` vào region mới mà chưa bootstrap sẽ lỗi, ví dụ *"This stack uses assets, so the toolkit stack must be deployed to the environment (Run "cdk bootstrap aws://...")"*. Cách sửa là chạy **`cdk bootstrap aws://<account>/<region>`** cho đúng account/region; bootstrap **không phải global theo account**.
  - Stack `CDKToolkit` chứa **S3 bucket, ECR repository và IAM roles** (kèm SSM parameter version); không tạo VPC, subnet, NAT Gateway, CodePipeline hay CodeBuild project. Stack `CDKToolkit` cũng còn lại sau `cdk destroy`, phải xóa thủ công nếu không dùng CDK nữa.
- **Các lệnh CDK CLI:** `cdk init app --language <lang>` (tạo project mới) | `cdk synth` (synthesize và in ra CloudFormation template, ghi vào `cdk.out/`) | `cdk bootstrap` | `cdk deploy` (synth + upload asset + CloudFormation ChangeSet) | `cdk diff` (so sánh khác biệt giữa stack local và stack đã deploy) | `cdk destroy` (xóa stack) | `cdk ls` (liệt kê các stack trong app).
  - **`cdk synth` chỉ sinh/in template; muốn xem khác biệt giữa code local và stack đã deploy thì dùng `cdk diff`; `cdk ls` chỉ liệt kê stack.**
- **Unit test CDK:** dùng **CDK Assertions Module** (`aws-cdk-lib/assertions`) kết hợp **Jest** (JS/TS) hoặc **Pytest** (Python); test trên **template CloudFormation đã synth**, không cần deploy.
  - **Fine-grained assertions:** kiểm tra một khía cạnh cụ thể, ví dụ `hasResourceProperties`, `resourceCountIs`.
  - **Snapshot tests:** so toàn bộ template với template baseline đã lưu trước đó, phát hiện mọi thay đổi ngoài ý muốn.
  - `Template.fromStack(myStack)`: stack định nghĩa trong CDK. `Template.fromJSON(...)` / `Template.fromString(...)`: template tạo bên ngoài CDK vẫn dùng assertions để test. **Đảo ngược hai cách này là sai.**
  - Kiểm tra một thuộc tính cụ thể như runtime Lambda là **fine-grained assertion**; so toàn bộ template với baseline là **snapshot test**. Snapshot test dễ vỡ khi nâng version `aws-cdk-lib` nên không nên chỉ dựa vào snapshot; thay đổi có chủ đích thì cập nhật bằng `jest -u`.
- **CDK + SAM dùng chung:** CDK không có lệnh chạy local; muốn test Lambda của CDK ở local thì `cdk synth` rồi dùng SAM CLI: `sam local invoke MyFunction -t ./cdk.out/<Stack>.template.json` (cần Docker; dùng `--no-staging` để template trỏ trực tiếp tới thư mục code). Không có `cdk local invoke` hay `cdk deploy --local`.
- **`RemovalPolicy` mặc định:** mặc định bucket/table là **`RETAIN`**, nên `cdk destroy` sẽ để lại resource; muốn xóa được bucket khi destroy thì cần `removalPolicy: RemovalPolicy.DESTROY` kèm `autoDeleteObjects: true` (CDK thêm custom resource dọn object trước khi xóa).
- **CDK v1 vs v2:** CDK v1 dùng các package riêng lẻ dạng `@aws-cdk/aws-s3` và đã end-of-support từ 06/2023; CDK v2 gom module stable vào **`aws-cdk-lib`**.
- **CDK không deploy trực tiếp bằng API:** CDK **synthesize thành CloudFormation template** rồi CloudFormation mới deploy; đáp án nói CDK gọi trực tiếp từng service API hoặc tạo Terraform plan là sai (hotswap chỉ là ngoại lệ cho dev: `cdk deploy --hotswap` — chỉ cho dev, không dùng production).

**SAM vs CDK vs CloudFormation thuần:**

| Tiêu chí | CloudFormation thuần | SAM | CDK |
|---|---|---|---|
| Cách viết | YAML/JSON khai báo từng resource | Khai báo JSON/YAML, trọng tâm serverless | Ngôn ngữ lập trình: JS/TS, Python, Java, .NET, Go |
| Khởi đầu | Chậm, dài | Rất nhanh với Lambda, nhiều Quick Start template qua `sam init` | Cần học construct nhưng linh hoạt hơn |
| Bản chất | Engine triển khai | Transform `AWS::Serverless-2016-10-31` → CloudFormation | Synthesize → CloudFormation |
| Cấp quyền gọn | Tự viết IAM role/policy dài | Policy templates trong `Policies` | Method `grant*()` của L2 construct |
| Deploy Lambda an toàn | Tự cấu hình CodeDeploy, alias, alarm, hook | `AutoPublishAlias` + `DeploymentPreference` tích hợp sẵn | Tương đương bằng `lambda.Alias` + `codedeploy.LambdaDeploymentGroup`, ví dụ `LambdaDeploymentConfig.CANARY_10PERCENT_10MINUTES` |
| Đồng bộ code nhanh cho dev | — | `sam sync --watch` | `cdk watch` hoặc `cdk deploy --hotswap` — chỉ cho dev, không dùng production |
| Test local | Không có công cụ tích hợp sẵn | Có sẵn `sam local` | Không có sẵn → `cdk synth` rồi `sam local invoke -t cdk.out/<Stack>.template.json` |

**Liên hệ thực tế — SAM/CDK:**
1. **API CRUD serverless triển khai nhanh, an toàn:** dùng **SAM**: template viết gọn bằng `AWS::Serverless::Function`, `Events: Type: Api`, `AWS::Serverless::SimpleTable`; cấp quyền bằng `DynamoDBCrudPolicy: { TableName: !Ref SampleTable }`; thêm `AutoPublishAlias: live` + `DeploymentPreference: Canary10Percent10Minutes` + `Alarms` để 10% traffic sang version mới trong 10 phút và tự rollback khi lỗi tăng.
2. **Pipeline xử lý ảnh S3 → Lambda → Rekognition → DynamoDB:** dùng **CDK**: tạo `s3.Bucket`, `dynamodb.Table` (partition key `image`, `PAY_PER_REQUEST`), `lambda.Function` (biến môi trường `TABLE`); cấp quyền gọn bằng `bucket.grantRead(fn)`, `table.grantWriteData(fn)` và một `PolicyStatement` riêng cho `rekognition:DetectLabels`; nối trigger bằng `bucket.addEventNotification(OBJECT_CREATED, LambdaDestination(fn))`. Viết unit test bằng module `assertions` (`Template.fromStack`, `hasResourceProperties`, `resourceCountIs`) để bắt lỗi mà không cần deploy thật.
3. **Hạ tầng đa dịch vụ, đa account/region, cần review thay đổi trước khi deploy:** dùng **CDK**: định nghĩa một `Stack` rồi khởi tạo hai instance Dev/Prod với `env: { account, region }` khác nhau; **bootstrap từng environment một lần** (cross-account thì thêm `--trust`); trong pull request chạy `cdk diff` để thấy resource nào bị thay đổi hoặc replace trước khi `cdk deploy`.

### 3.4. CI/CD: CodeCommit, CodeBuild, CodeDeploy, CodePipeline

- **CI (Continuous Integration):** developer push code thường xuyên lên repository trung tâm; build/test server lấy code về kiểm tra ngay khi push; phát hiện bug sớm, giao code nhanh hơn.
- **CD (Continuous Delivery vs Deployment):** *Delivery* = luôn sẵn sàng release, bước lên prod có thể cần người phê duyệt; *Deployment* = mọi thay đổi pass test đều tự động lên prod.
- **Mapping nhanh:** lưu code → **CodeCommit**; build/test → **CodeBuild** (thay Jenkins); deploy lên EC2/on-premises/Lambda/ECS → **CodeDeploy**; điều phối toàn bộ → **CodePipeline**. **Elastic Beanstalk** là lựa chọn thay CodeDeploy khi muốn vừa deploy vừa provision hạ tầng.
- **CodeCommit:** Git repository private, fully managed, highly available; code chỉ nằm trong AWS Cloud. Authentication: **SSH keys** (upload public key vào IAM user), **HTTPS Git credentials** (username/password sinh từ IAM), **HTTPS + AWS CLI credential helper** hoặc **`git-remote-codecommit`** (HTTPS GRC, hợp với SSO/role tạm thời). Authorization: **IAM policy**. Mã hóa at rest bằng **KMS**, in transit qua HTTPS/SSH. **Cross-account: không chia sẻ SSH key hay Git credentials** — tạo IAM Role trong account sở hữu repo, người ở account khác dùng **STS AssumeRole**. Dùng root account sẽ không thấy SSH. Hỗ trợ pull request, tích hợp CodeBuild. Tối đa **2 bộ HTTPS Git credentials** mỗi IAM user.
  - **Notification rule vs Trigger:** Notification rule — sự kiện comment/approval/pull request/branch-tag, target **SNS topic** hoặc **AWS Chatbot (Slack)**; Trigger — sự kiện code cụ thể (push to existing branch, create/delete branch/tag, có thể lọc theo branch), target **SNS topic** hoặc **Lambda function**. Ví dụ: trigger tới Lambda để quét secret sau mỗi push.
  - **Lưu ý trạng thái dịch vụ (2026):** **CodeStar đã ngừng hoạt động (31/7/2024)**; CodeStar Connections đổi tên thành **CodeConnections**; **CodeCommit** ngừng nhận khách hàng mới từ 25/7/2024, sau đó (cuối 2025) AWS thông báo đưa trở lại hoạt động bình thường — kiểm tra trang chính thức trước khi chọn cho dự án mới; **CodeGuru Reviewer** đã ngừng nhận liên kết repository mới, AWS khuyên chuyển sang Amazon Q Developer / Amazon Inspector code security. Đề DVA vẫn có thể hỏi các dịch vụ này.
- **CodePipeline:** công cụ workflow trực quan điều phối CI/CD. Một pipeline gồm nhiều **stage**; mỗi stage chứa các **action** chạy tuần tự và/hoặc song song (cùng `runOrder` chạy song song, `runOrder` lớn hơn chạy sau). **Manual approval** đặt được ở **bất kỳ stage nào** (ví dụ trước khi deploy prod), **chờ tối đa 7 ngày**, quá hạn thì action fail. Các stage trao đổi dữ liệu qua **artifact lưu trong S3**: CodePipeline lấy code tạo source artifact → S3 → CodeBuild nhận artifact từ S3 (không cần truy cập trực tiếp CodeCommit) → tạo deployment artifact → S3 → CodeDeploy nhận từ S3 và deploy.
  - **Troubleshooting:** theo dõi trạng thái và gửi email → **CloudWatch Events / EventBridge rule → SNS**; stage thất bại → xem console và chi tiết lỗi; pipeline không thực hiện được action → kiểm tra **IAM service role** của CodePipeline; audit API call bị từ chối → **CloudTrail**. Pipeline đang chạy tốt, push code thành công rồi pipeline fail → nguyên nhân khả dĩ nhất là **stage CodeBuild fail test**.
  - **Provider theo giai đoạn:** Source: CodeCommit, ECR, S3, Bitbucket, GitHub, GitHub Enterprise Server, GitLab, GitLab self-managed | Build: CodeBuild, Jenkins, CloudBees, TeamCity | Test: CodeBuild, AWS Device Farm (app iOS/Android), công cụ bên thứ ba | Deploy: CodeDeploy, Elastic Beanstalk, CloudFormation, ECS, S3… | Invoke: Lambda, Step Functions.
  - Pipeline V2 (mặc định cho pipeline mới) hỗ trợ trigger có filter, pipeline-level variables, execution mode `SUPERSEDED`/`QUEUED`/`PARALLEL`. GitHub (Version 1) dùng OAuth đã không còn được khuyến nghị; dùng **GitHub (via GitHub App)** qua CodeConnections.
- **CodeBuild:** dịch vụ build và test fully managed, serverless, không cần quản lý build server, mỗi build chạy trong container riêng; thay thế Jenkins. Source: CodeCommit, S3, Bitbucket, GitHub, GitHub Enterprise, GitLab (qua CodeConnections). Log → **S3 và/hoặc CloudWatch Logs**; artifact → **S3** (mã hóa bằng **KMS**); quyền của build lấy từ **IAM service role**; monitoring bằng CloudWatch Metrics, EventBridge (phát hiện build fail), CloudWatch Alarms.
  - **`buildspec.yml`:** phải nằm ở **root** của source code (có thể ghi đè bằng buildspec chèn trực tiếp trong project hoặc chỉ định đường dẫn/tên file khác). Cấu trúc: `version` (0.2); `env` — `variables` (plaintext), `parameter-store` (SSM Parameter Store), `secrets-manager` (Secrets Manager), `exported-variables`; `phases` — **`install`** (cài dependency/runtime) → **`pre_build`** (lệnh trước build, ví dụ login ECR, chạy unit test) → **`build`** (lệnh build thực sự) → **`post_build`** (hoàn thiện, ví dụ đóng gói zip, push image); `artifacts` (file upload lên S3); `cache` (file/thư mục cache để tăng tốc build sau); `reports` (báo cáo test JUnit, Cucumber…).
  - **CodeBuild trong VPC:** mặc định container chạy **ngoài VPC** nên không truy cập được RDS, ElastiCache, EC2 private, ALB internal; cấu hình build project với **VPC ID, Subnet ID, Security Group ID** thì truy cập được; khi chạy trong VPC cần **NAT Gateway** (subnet private) hoặc **VPC endpoint** để ra Internet/truy cập dịch vụ AWS. Ngôn ngữ/công cụ không có sẵn → dùng **custom Docker image** (ví dụ từ ECR). Troubleshoot sâu hơn log → chạy **CodeBuild locally** bằng CodeBuild Agent + Docker. Build Docker image trong CodeBuild cần bật **privileged mode**.
  - **Timeout mặc định 1 giờ, tối đa 36 giờ** (theo ghi chú thực hành). Thứ tự phase chạy của build: SUBMITTED, QUEUED, PROVISIONING, DOWNLOAD_SOURCE, INSTALL, PRE_BUILD, BUILD, POST_BUILD, UPLOAD_ARTIFACTS, FINALIZING, COMPLETED.
  - **Secret trong CodeBuild:** hard-code trong `env.variables` (plaintext, hiện trong console/log) hoặc commit file `.env` là sai; đáp án đúng là `env.parameter-store` (SecureString) hoặc `env.secrets-manager`, service role phải có quyền `ssm:GetParameters` / `secretsmanager:GetSecretValue` (và `kms:Decrypt` nếu dùng customer managed key).
  - **CodeBuild mặc định chạy ngoài VPC** → build cần kết nối RDS private subnet mà bị timeout thì đáp án là **cấu hình VPC (VPC ID, subnet, security group) cho build project**, không phải đặt RDS public hay thêm quyền `rds:*` vào service role (IAM không mở được kết nối mạng). Troubleshoot ngoài log → **chạy CodeBuild locally bằng CodeBuild Agent + Docker**, không SSH vào container CodeBuild.
- **CodeDeploy:** deploy tự động lên **EC2 instances, on-premises servers, Lambda functions, ECS services**; hỗ trợ tự động rollback khi deploy thất bại hoặc khi CloudWatch Alarm kích hoạt. Hướng dẫn deploy nằm trong **`appspec.yml`** (phải ở root của bundle; bundle có thể là `.zip`, `.tar`, `.tar.gz`).
  - **Thành phần:** Application (container cho revision, deployment configuration, deployment group); Compute platform (EC2/on-premises, Lambda, ECS); Deployment configuration (quy tắc thành công/thất bại và tốc độ deploy); Deployment group (nhóm instance gắn tag hoặc ASG, tách dev/test/prod); Deployment type (**In-place** chỉ EC2/on-prem, **Blue/Green** cho EC2 qua ASG/ELB, Lambda, ECS); IAM instance profile (cho EC2 quyền đọc bản deploy từ S3/GitHub); Application revision (code + `appspec.yml`); Service role; Target revision.
  - **Hooks EC2/on-prem (in-place) theo thứ tự:** `ApplicationStop` → `DownloadBundle` (agent tự làm, không viết script được) → `BeforeInstall` → `Install` (agent tự làm) → `AfterInstall` → `ApplicationStart` → **`ValidateService`** (kiểm tra ứng dụng chạy đúng — hook quan trọng nhất). Khi có load balancer còn thêm `BeforeBlockTraffic`, `BlockTraffic`, `AfterBlockTraffic` (trước) và `BeforeAllowTraffic`, `AllowTraffic`, `AfterAllowTraffic` (sau). Hooks cho Lambda: `BeforeAllowTraffic`, `AfterAllowTraffic` (là Lambda function chạy kiểm thử). Hooks cho ECS: `BeforeInstall`, `AfterInstall`, `AfterAllowTestTraffic`, `BeforeAllowTraffic`, `AfterAllowTraffic`.
  - **CodeDeploy Agent (EC2/on-premises):** phải được cài và chạy trên instance (cài thủ công hoặc tự động bằng Systems Manager); EC2 cần **IAM instance profile đủ quyền đọc S3**; agent poll CodeDeploy để nhận việc, tải revision, chạy hooks theo `appspec.yml`, báo kết quả.
  - **CodeDeploy với ASG:** in-place — cập nhật EC2 hiện có, **instance mới do ASG tạo (scale out) cũng tự động nhận bản deploy mới nhất** (qua lifecycle hook); blue/green — tạo **ASG mới** (copy cấu hình từ ASG cũ) chạy v2, ALB chuyển traffic sang ASG mới, có thể chọn thời gian giữ instance cũ trước khi terminate, **bắt buộc dùng ELB**.
  - **Rollback CodeDeploy:** rollback = **deploy lại revision đã deploy thành công trước đó dưới dạng deployment MỚI (deployment ID mới)**, không phải "khôi phục" phiên bản cũ. Rollback tự động khi deployment fails hoặc CloudWatch Alarm đạt ngưỡng; hoặc tắt rollback, hoặc rollback thủ công. Revision trước phải còn trong S3 (bật S3 versioning, đừng xóa bundle cũ quá sớm).
  - **Điều kiện tiên quyết CodeDeploy EC2:** **CodeDeploy Agent chạy trên instance + instance profile có quyền đọc S3**, không phải instance ở public subnet, không phải bắt buộc Amazon Linux, không phải đăng ký vào Beanstalk. Script hook phải trả exit code 0; script lỗi ở `ApplicationStop` của revision cũ có thể làm hỏng mọi deployment sau.
- **CodeDeploy — cấu hình theo compute platform:**

| Platform | Deployment type | Cấu hình |
|---|---|---|
| EC2 / on-premises | In-place hoặc Blue/Green | `CodeDeployDefault.AllAtOnce` (tất cả cùng lúc: nhanh nhất, có downtime); `HalfAtATime` (mỗi lần 50%, giảm 50% capacity); `OneAtATime` (mỗi lần 1 instance: chậm nhất, ảnh hưởng availability thấp nhất); Custom (ví dụ minimum healthy hosts = 75%) |
| Lambda | Blue/Green (traffic shifting qua Lambda alias) | **Canary**: `LambdaCanary10Percent5Minutes`, `LambdaCanary10Percent30Minutes` (chuyển 10% trước, chờ N phút, rồi chuyển 100% còn lại); **Linear**: `LambdaLinear10PercentEvery3Minutes`, `LambdaLinear10PercentEvery10Minutes` (tăng đều 10% mỗi N phút tới 100%); **AllAtOnce**: `LambdaAllAtOnce` (chuyển ngay 100%: nhanh, rủi ro cao) |
| ECS | **Chỉ Blue/Green** (qua ALB, 2 target group) | **Canary**: `ECSCanary10Percent5Minutes`, `ECSCanary10Percent15Minutes`; **Linear**: `ECSLinear10PercentEvery3Minutes`, `ECSLinear10PercentEvery1Minutes`; **AllAtOnce**: `ECSAllAtOnce` |

- **In-place vs Blue/Green (EC2/ASG):** In-place = dừng app trên instance hiện có, cài bản mới | Blue/Green = tạo instance/ASG mới (green) chạy v2, ALB chuyển traffic sang green, rồi terminate blue. ASG scale out: in-place thì instance mới tự động nhận bản deploy mới nhất; blue/green thì tạo ASG mới, bắt buộc ELB, có thời gian giữ instance cũ. **ECS qua CodeDeploy không có in-place**; đáp án "In-place" cho ECS là sai — ECS chỉ có Blue/Green (Canary, Linear, AllAtOnce).
- **Canary vs Linear (Lambda/ECS):** "chuyển 10% trước, sau 5 phút chuyển toàn bộ 100%" → **`LambdaCanary10Percent5Minutes`**; Linear là tăng đều 10% mỗi chu kỳ; `HalfAtATime` chỉ dành cho EC2/on-premises.
- **SAM DeploymentPreference:** Canary: `Canary10Percent5Minutes`, `Canary10Percent10Minutes`, `Canary10Percent15Minutes`, `Canary10Percent30Minutes` | Linear: `Linear10PercentEvery1Minute`, `Linear10PercentEvery2Minutes`, `Linear10PercentEvery3Minutes`, `Linear10PercentEvery10Minutes` | AllAtOnce: chuyển 100% traffic một lần.
- **CodeArtifact:** dịch vụ artifact/package management an toàn, scalable; hỗ trợ Maven, Gradle, npm, yarn, twine, pip, NuGet (và nay thêm Swift, Ruby/gem, Cargo, generic…). **Proxy**: lấy package từ public repo (npmjs, PyPI, Maven Central, NuGet…) và cache lại; **Publish**: team publish/approve package nội bộ. Thay đổi package → **EventBridge** → kích hoạt Lambda, Step Functions, SNS, SQS hoặc CodePipeline. **Resource policy** cấp quyền cross-account nhưng **all-or-nothing** trên cả repository (không có quyền theo từng package). **Domain**: gom repository của nhiều account, deduplicated storage (một asset chỉ lưu một lần), fast copying, mọi asset/metadata mã hóa bằng **một KMS key**, quản lý tập trung bằng domain policy. Mỗi repository chỉ có **1 external connection** (muốn nhiều public repo thì tạo nhiều repository rồi nối làm upstream, tối đa 10 upstream); authorization token mặc định **12 giờ** (tùy chỉnh 15 phút – 12 giờ), trên CI phải gọi `login`/`get-authorization-token` ở đầu mỗi build. CodeArtifact không lưu Docker image (đó là ECR); package được retain ở **repo downstream được hỏi** và repo có external connection, **không** ở repo trung gian.
- **CodeGuru:** dùng machine learning để review code và gợi ý hiệu năng. **Reviewer** = static code analysis **trước** khi lên prod (khi push code/pull request), tìm lỗi nghiêm trọng, lỗ hổng bảo mật, bug khó tìm, resource leak, thiếu input validation, secret hard-code; hỗ trợ **Java và Python**. **Profiler** = phân tích **runtime** trong production, tìm code tốn CPU/bộ nhớ, giảm chi phí compute, heap summary, anomaly detection, hiển thị dạng **flame graph**, overhead rất nhỏ, chạy trên AWS và on-premises. **Reviewer vs Profiler vs X-Ray:** "machine learning-powered code review" → Reviewer; "expensive lines of code / CPU usage in production" → Profiler; tracing request qua nhiều service → X-Ray, không phải Profiler. CodeGuru Profiler tham số agent: `MaxStackDepth`, `MemoryUsageLimitPercent`, `MinimumTimeForReportingInMilliseconds`, `ReportingIntervalInMilliseconds`, `SamplingIntervalInMilliseconds` (giảm giá trị → tăng tần suất lấy mẫu, chi tiết hơn nhưng overhead cao hơn). CodeGuru Profiler: insight hiệu năng runtime, Java và Python; khi bật, Lambda thêm layer, env vars và policy `AmazonCodeGuruProfilerAgentAccess`.

**Bẫy thi CI/CD (tổng hợp):**
- **Nhầm `buildspec.yml` với `appspec.yml`:** CodeBuild → `buildspec.yml`; CodeDeploy → `appspec.yml`. Đây là cặp đáp án gây nhiễu kinh điển.
- **Nhầm vai trò dịch vụ:** hỏi "điều phối toàn bộ chuỗi push → build → test → deploy" → **CodePipeline**, không phải CodeBuild hay CodeDeploy; hỏi "deploy" → CodeDeploy, không phải CodePipeline.
- **Artifact trao đổi qua S3**, không phải EFS, EBS hay CodeCommit. CodeBuild nhận artifact từ S3 nên không cần truy cập trực tiếp CodeCommit.
- **Pipeline fail sau khi push code thành công** → nguyên nhân khả dĩ nhất là **stage CodeBuild fail test**, không phải CodeCommit lỗi lưu trữ hay S3 bucket đầy. Pipeline không thực hiện được action → kiểm tra **IAM service role** của CodePipeline; cần email khi pipeline FAILED → **EventBridge rule → SNS**, không phải CloudTrail (CloudTrail chỉ audit API call) hay Config rule.
- **CodeCommit cross-account:** chia sẻ SSH key hay Git credentials là sai; đáp án đúng là **IAM Role + STS AssumeRole**. CodeCommit không có repo public, không có xác thực qua WebSocket.

**Liên hệ thực tế — CI/CD:**
1. **Pipeline web app từ GitHub tới Beanstalk có phê duyệt tay:** Developer push lên GitHub (`main`) → **CodePipeline** tự chạy: Source (qua CodeConnections/GitHub App) → BuildAndTest (**CodeBuild** với `buildspec.yml` chạy unit test) → Deploy lên môi trường Beanstalk **dev**. Sau đó stage `DeployToProd` có 2 action group tuần tự: **Manual approval** (người xem kết quả rồi bấm Approve) → Deploy lên Beanstalk **prod** bằng artifact đã qua test. Nếu test fail, pipeline dừng và **không deploy code lỗi** lên prod; nếu pipeline FAILED thì **EventBridge rule → SNS email** thông báo.
2. **Deploy an toàn có rollback tự động:** Với **Lambda**, dùng CodeDeploy qua SAM (`AutoPublishAlias` + `DeploymentPreference` kiểu `Canary10Percent5Minutes`): chuyển 10% traffic sang bản mới, chờ 5 phút, nếu ổn mới chuyển 100%, kèm CloudWatch Alarm để rollback. Với **EC2/ASG**, nếu cần giữ nguyên instance và cập nhật dần → **in-place** (`HalfAtATime`/`OneAtATime`); nếu cần môi trường mới hoàn toàn và chuyển traffic qua ALB → **blue/green** (tạo ASG mới, bắt buộc ELB, giữ instance cũ một thời gian trước khi terminate). Trong cả hai trường hợp, bật rollback tự động khi deployment fail hoặc alarm đạt ngưỡng — và nhớ rollback là deployment mới với revision tốt trước đó, không phải restore.

### 3.5. Elastic Beanstalk deployment modes (nhắc lại vì hay hỏi ở Domain 3)

| Mode | Cơ chế | Đánh đổi |
|---|---|---|
| All at once | Tất cả instance cùng deploy | Nhanh nhất, có downtime |
| Rolling | Từng batch | Giảm capacity tạm thời |
| Rolling + additional batch | Thêm batch tạm rồi rolling | Giữ capacity |
| Immutable | Tạo nhóm instance mới hoàn toàn | An toàn nhất, tốn thời gian |
| Blue/green | Tạo environment mới, đổi DNS/CNAME | Rollback nhanh |
| Traffic splitting | Chia % traffic giữa 2 version | Canary |

---

## DOMAIN 4 — TROUBLESHOOTING AND OPTIMIZATION (18%)

### 4.1. CloudWatch — metrics, logs, alarms, events

**Bộ ba phân biệt:** CloudWatch = metrics, logs, alarms, events (hệ thống có khỏe không?) | X-Ray = distributed tracing, service map, latency/error/fault (request chậm/lỗi ở đâu?) | CloudTrail = audit API call (ai làm gì, khi nào, từ đâu?).

**CloudWatch Metrics:**
- Namespace (ví dụ `AWS/EC2`), Dimension (`InstanceId`, `Environment`), Timestamp.
- EC2 Basic (5 phút, miễn phí) vs Detailed (1 phút, trả phí, ASG scale nhanh hơn). **RAM/swap/disk đã dùng KHÔNG có mặc định** → custom metric qua CloudWatch Agent. Detailed Monitoring chỉ đổi 5 phút → 1 phút, không sinh metric RAM.
- Custom metric bằng `PutMetricData`; `StorageResolution` 60 = standard (1 phút), 1 = high resolution (1/5/10/30 giây); `PutMetricData` chấp nhận timestamp 2 tuần quá khứ, 2 giờ tương lai mà không báo lỗi → đồng bộ giờ EC2 (NTP). Lambda nên ghi log JSON theo EMF thay vì gọi `PutMetricData`. Tránh dimension cardinality cao (`UserId`, `RequestId`). Dùng `GetMetricData` thay `GetMetricStatistics`.
- Metric dimension tối đa 30 dimension/metric.
- Metric retention (tự giảm độ phân giải): < 60 giây giữ 3 giờ; 1 phút giữ 15 ngày; 5 phút giữ 63 ngày; 1 giờ giữ 455 ngày (15 tháng).
- Alarm trên high-resolution metric: period 10 giây, 30 giây, hoặc bội số của 60 giây (đặt period 1 giây là sai).

**CloudWatch Logs:**
- Log group (một ứng dụng) chứa log stream (một instance/file/container); retention ở cấp log group (mặc định không hết hạn; đặt 1 ngày–10 năm).
- Nguồn: SDK, Unified Agent, Beanstalk, ECS, Lambda (`/aws/lambda/<tên>`, retention mặc định Never expire — nên đặt 14–30 ngày), VPC Flow Logs, API Gateway, CloudTrail, Route 53.
- **Logs Insights:** truy vấn log lịch sử (filter/aggregate/sort/limit, nhiều log group, kể cả tài khoản khác), **không phải real-time engine**; nay hỗ trợ OpenSearch PPL và SQL.
- **Export sang S3:** batch, `CreateExportTask`, tối đa 12 giờ mới xong, **không real-time**.
- **Subscription Filter:** stream real-time tới KDS, Firehose, Lambda; gom log đa tài khoản cần destination + destination access policy + IAM role. Tối đa 2 filter/log group.
- **Live Tail:** xem log real-time khi debug.
- **Metric Filters:** filter expression trên log → tạo metric → alarm (ví dụ "5 lần ERROR trong 1 phút" → SNS). **Không hồi tố** (chỉ dữ liệu sau khi tạo filter). Tối đa 3 dimension; nên đặt `defaultValue=0`. Pattern hay dùng: `ERROR`, `"START RequestId"`, `?ERROR ?Exception`, `ERROR -Timeout`, `{ $.statusCode = 500 }`, `[ip, ..., status_code=4*, size]`.
- **CloudWatch Agent:** Logs Agent cũ đã deprecated; chỉ dùng **Unified Agent** — gửi cả log lẫn metric hệ thống chi tiết (CPU, disk, RAM, netstat, processes, swap), cấu hình tập trung qua SSM Parameter Store, cần IAM role `CloudWatchAgentServerPolicy` (+ `AmazonSSMManagedInstanceCore` nếu quản lý qua SSM).

**CloudWatch Alarms:**
- 3 trạng thái `OK` / `INSUFFICIENT_DATA` / `ALARM`; target: EC2 action (stop/terminate/reboot/recover), Auto Scaling action, SNS (từ SNS gọi Lambda làm gì cũng được; cập nhật 2026: alarm gọi trực tiếp Lambda, tạo OpsItem/Incident).
- **Composite Alarm:** kết hợp AND/OR/NOT nhiều alarm, giảm "alarm noise".
- **EC2 Instance Recovery:** alarm trên status check (Instance = máy ảo, System = phần cứng, Attached EBS = volume); recover giữ nguyên IP, EIP, metadata, placement group. Test alarm bằng `set-alarm-state`; `--treat-missing-data` (`missing`, `notBreaching`, `breaching`, `ignore`).

**Synthetics Canary:** script mô phỏng thao tác khách hàng (vào trang, thêm giỏ, checkout), kiểm tra availability/latency, chụp screenshot; Node.js/Python, headless Chrome (cập nhật 2026: thêm Playwright); blueprint: Heartbeat, API Canary, Broken Link Checker, Visual Monitoring, Canary Recorder, GUI Workflow Builder; metric namespace `CloudWatchSynthetics` (`SuccessPercent`, `Duration`); alarm phổ biến `SuccessPercent < 100`; chạy được trong VPC.

**Bẫy thi CloudWatch:**
- RAM có sẵn trong `AWS/EC2` là sai — cần Unified Agent hoặc custom metric; Detailed Monitoring chỉ đổi 5 phút → 1 phút, không sinh metric RAM. Nhầm high resolution (custom metric) với Detailed Monitoring (metric EC2 có sẵn).
- `PutMetricData` timestamp 2 tuần trước bị từ chối là sai — chấp nhận không báo lỗi, lỗi lệch giờ do đồng hồ instance sai.
- Metric Filter hồi tố dữ liệu cũ là sai; export S3 không real-time; Logs Insights là truy vấn lịch sử, không phải engine real-time; phân tích log gần real-time → Subscription Filter.
- Cảnh báo khi log chứa `ERROR` → Metric Filter + Alarm + SNS, không cần Lambda quét log định kỳ, không dùng Config hay CloudTrail Insights. Gom log đa tài khoản bằng S3 Replication/organization trail là sai → Subscription Filter tới Destination.
- Mô phỏng hành vi người dùng + screenshot + kiểm tra theo lịch → Synthetics Canary.

### 4.2. X-Ray — distributed tracing

- **X-Ray:** distributed tracing; service map (xanh OK, vàng 4xx error, đỏ 5xx fault, tím throttle 429). Bật bằng: (1) SDK trong code, (2) daemon hoặc AWS integration. Daemon UDP port 2000, gom batch mỗi 1 giây. Tích hợp: EC2/on-premises (daemon), Lambda (Active tracing), Beanstalk (daemon sẵn), ECS (container daemon), API Gateway (tracing trên stage).
- **Segment** (mỗi service), **Subsegment** (ví dụ `DynamoDB.PutItem`), **Trace** (end-to-end, cùng trace ID), **Sampling**.
- **Annotation** (được index, filter được, tối đa 50/trace) vs **Metadata** (không index, chỉ xem khi debug).
- **Sampling mặc định:** reservoir 1 request/giây + rate 5%; rule `Default` priority 10000 (thấp nhất, không xóa được); sửa rule trên console, SDK/daemon tự lấy, không cần đổi code/restart.
- **API Write:** `PutTraceSegments`, `PutTelemetryRecords`, `GetSamplingRules`, `GetSamplingTargets`, `GetSamplingStatisticSummaries`; policy `AWSXRayDaemonWriteAccess`. **API Read:** `GetServiceGraph`, `BatchGetTraces`, `GetTraceSummaries` (lọc trước) → `BatchGetTraces` (chi tiết), `GetTraceGraph`.
- **ECS:** EC2 launch type dùng daemon container hoặc sidecar; **Fargate bắt buộc sidecar**; biến `AWS_XRAY_DAEMON_ADDRESS` (mặc định `127.0.0.1:2000`).
- **Biến Lambda:** `_X_AMZN_TRACE_ID`, `AWS_XRAY_CONTEXT_MISSING`, `AWS_XRAY_TRACING_NAME`; header `X-Amzn-Trace-Id`.
- **ADOT (OpenTelemetry):** chuẩn mở, auto-instrumentation không cần sửa code, gửi nhiều backend cùng lúc (X-Ray, CloudWatch, Prometheus, bên thứ ba); X-Ray SDK + daemon là chuẩn riêng AWS, chỉ gửi tới X-Ray; cập nhật 2026: X-Ray SDK/daemon vào giai đoạn maintenance, AWS khuyến nghị ADOT, nhưng đề DVA-C02 vẫn hỏi mô hình SDK + daemon.
- **Trace giữ 30 ngày.**
- **Bẫy thi X-Ray:**
  - X-Ray không có trace trên EC2: instance role thiếu quyền ghi X-Ray hoặc daemon chưa chạy; trên Lambda: execution role thiếu `AWSXRayDaemonWriteAccess` (Lambda có sẵn daemon, không cần mở port 2000 trong Security Group).
  - Nhầm Annotation (index, filter được) với Metadata (không index).
  - Sampling rule mới không hiệu lực: thiếu quyền `xray:GetSamplingRules` của daemon.
  - Daemon dùng UDP 2000, không phải TCP/443.
  - Fargate bắt buộc sidecar.
  - Header tracing trong Lambda là `_X_AMZN_TRACE_ID`.

### 4.3. CloudTrail & EventBridge — audit và phản ứng sự kiện

- **CloudTrail:** governance/compliance/audit, **mặc định đã bật**; ghi API call từ Console/SDK/CLI/dịch vụ AWS; gửi log vào CloudWatch Logs hoặc S3; trail mọi Region (mặc định) hoặc một Region; organization trail cho toàn Organization.
- **Management Events** (control plane) ghi mặc định; **Data Events** (S3 object-level, Lambda `Invoke`, DynamoDB item-level) **không ghi mặc định**, phải bật + advanced event selectors; **Insights Events** phát hiện hoạt động bất thường, phải bật (trả phí).
- **Event history giữ 90 ngày**; giữ lâu hơn → trail vào S3 + Athena; log file validation (digest SHA-256); mã hóa SSE-KMS; cập nhật 2026: CloudTrail Lake lưu 7–10 năm, truy vấn SQL trực tiếp; event xuất hiện trong 5–15 phút.
- **Tích hợp EventBridge:** pattern `"detail-type": ["AWS API Call via CloudTrail"]` (ví dụ `DeleteTable` → SNS cảnh báo).
- **Bẫy:** CloudTrail ghi mặc định mọi thứ là sai — Data Events và Insights phải bật thêm. "Ai đã xóa bảng DynamoDB?" → CloudTrail (`DeleteTable`), không phải Metrics/X-Ray/Logs Insights; cảnh báo ngay lần sau → EventBridge rule trên "AWS API Call via CloudTrail" → SNS.

- **EventBridge (trước đây CloudWatch Events):** event bus serverless; rule Schedule (`rate(1 hour)`, `cron(0 12 * * ? *)`) và Event pattern (root login → SNS, EC2 → `stopped`, CodeBuild fail). Event JSON: `version`, `id`, `detail-type`, `source`, `account`, `time`, `region`, `resources`, `detail`. 3 loại bus: **Default** (dịch vụ AWS trong tài khoản), **Partner** (SaaS: Zendesk, Datadog, Auth0…), **Custom** (`PutEvents`). **Archive & Replay** để debug/sửa consumer; **Schema Registry** suy schema, sinh code; multi-account aggregation qua resource policy (`events:PutEvents`, `aws:PrincipalOrgID`). Cập nhật: EventBridge Scheduler (lập lịch riêng, time zone, hàng triệu lịch), EventBridge Pipes (point-to-point có filter/enrichment), target retry tối đa 24 giờ/185 lần, có DLQ (SQS).
- **Bẫy EventBridge:** EC2 → `terminated` muốn nhận email → EventBridge rule (EC2 State-change) → SNS. SaaS bên thứ ba → Partner bus. Replay sau khi sửa consumer → Archive & Replay.

**Liên hệ thực tế — Domain 4:**
1. **EC2 đầy RAM nhưng CloudWatch không thấy metric RAM + muốn báo động khi log có `ERROR`:** cài Unified Agent (role `CloudWatchAgentServerPolicy`, cấu hình qua SSM) đẩy `mem_used_percent` và log file; Metric Filter đếm `ERROR` (không hồi tố, `defaultValue=0`) + Alarm → SNS. Không bật Detailed Monitoring để "lấy metric RAM", không viết Lambda quét log định kỳ.
2. **Microservice chậm không rõ bottleneck + cần truy vết ai xóa tài nguyên production:** bật X-Ray (SDK + daemon UDP 2000 trên EC2, Active Tracing + `AWSXRayDaemonWriteAccess` trên Lambda, sidecar trên Fargate), service map + timeline segment/subsegment, annotation (ví dụ `customer_tier`) để lọc trace, sampling mặc định (1/giây + 5%); song song tra CloudTrail Event history (90 ngày) và đặt EventBridge rule trên "AWS API Call via CloudTrail" → SNS cảnh báo API nhạy cảm.

### 4.4. Tối ưu hoá — chi phí, hiệu năng, troubleshooting theo triệu chứng

**Tối ưu chi phí (hay hỏi):**
- Lambda: tăng memory để giảm duration (tính tiền theo GB-giây, làm tròn 1 ms) — đôi khi tăng memory lại rẻ hơn vì chạy nhanh hơn; dùng ARM/Graviton (ghi chú: thường rẻ hơn khoảng 20% cho cùng thời lượng chạy, nếu thư viện tương thích); tắt provisioned concurrency khi không cần.
- DynamoDB: tải ổn định → Provisioned (+ Auto Scaling); khó đoán → On-Demand; dùng DAX cho đọc lặp lại; tránh Scan; dùng projection để giảm RCU.
- S3: lifecycle sang IA/Glacier; dùng Intelligent-Tiering khi pattern truy cập không rõ; gộp file nhỏ (Athena: file ≥ 128 MB, Parquet/ORC + nén + partition).
- EC2: Reserved Instances/Savings Plans cho tải ổn định; Spot cho workload chịu gián đoạn; tắt instance không dùng; chú ý chi phí ẩn: NAT Gateway (~0,045 USD/giờ + phí xử lý dữ liệu), Public IPv4 (0,005 USD/giờ/IP), EBS volume unattached, snapshot, KMS key ($1/key/tháng), Secrets Manager ($0,40/secret/tháng), Route 53 hosted zone ($0,50/zone/tháng), CloudWatch Logs retention mặc định Never expire.
- CloudFront: price classes, cache TTL hợp lý để giảm origin request.
- **AWS Budgets chỉ cảnh báo, không tự tắt tài nguyên.** Muốn tự động hành động thì cần Budget Actions.

**Tối ưu hiệu năng:**
- Lambda nặng CPU → tăng memory (CPU tỉ lệ thuận với memory; ~1.769 MB ≈ 1 vCPU, tối đa 6 vCPU ở 10 GB); không chỉnh CPU trực tiếp; provisioned concurrency chỉ giảm cold start.
- DynamoDB hot partition → write sharding, phân tán key; đọc hot key → DAX.
- S3 throughput → nhiều prefix, multipart, byte-range, Transfer Acceleration.
- API Gateway latency → caching (GET), giảm authorizer/mapping overhead; IntegrationLatency vs Latency (xem 1.2).
- RDS: Read Replica cho đọc, Multi-AZ cho HA (không scale đọc), RDS Proxy cho Lambda (giảm failover tới 66%, connection pooling), ElastiCache cho cache/session.

**Troubleshooting theo triệu chứng (bảng tra nhanh):**

| Triệu chứng | Nghĩ tới đầu tiên |
|---|---|
| SSH timeout | Security Group (port 22, source IP) |
| SSH `Permission denied (publickey)` | Sai key, sai user (`ec2-user` cho Amazon Linux), sai quyền file (`chmod 0400`) |
| Connection refused | Ứng dụng chưa chạy hoặc lỗi (khác với timeout = SG) |
| EC2 không ra Internet dù đã gắn IGW | Route table thiếu `0.0.0.0/0 → IGW`, EC2 không có public IP, NACL chặn chiều ra (không phải inbound SG vì SG stateful) |
| ALB 503 | Target group không có target healthy nào |
| ALB 502 | Target trả response sai định dạng hoặc đóng kết nối |
| ALB 504 | Target phản hồi chậm hơn idle timeout |
| API Gateway 502 | Lambda proxy trả response sai định dạng |
| API Gateway "Missing Authentication Token" | Sai path/method hoặc chưa deploy |
| Lambda throttle, function khác cũng throttle | Một function "ăn" hết 1.000 concurrency → đặt reserved concurrency |
| DynamoDB throttle dù tổng chưa vượt | Hot partition/hot key |
| SQS message xử lý trùng | Visibility timeout quá ngắn so với thời gian xử lý |
| SQS message biến mất rồi xuất hiện lại | Consumer poll nhưng chưa `DeleteMessage` trước khi hết visibility timeout |
| CloudFormation `DELETE_FAILED` ở S3 bucket | Bucket còn object/version |
| CodeDeploy EC2 không deploy được | Agent chưa chạy, instance profile thiếu quyền đọc S3 |
| Pipeline fail sau push code thành công | Stage CodeBuild fail test |
| EC2 gỡ role khỏi instance nhưng đọc S3 vẫn được | Bucket policy vẫn cho phép (union) |
| User phải đăng nhập lại liên tục | Bật sticky session (giải pháp tạm) hoặc lưu session ra ElastiCache/DynamoDB (lâu dài) |
| Một instance quá tải trong khi instance khác rảnh sau khi bật stickiness | Chính stickiness gây mất cân bằng |
| ASG không thay instance mà ELB đánh unhealthy | ASG chưa bật ELB health check, chỉ dùng EC2 status check |
| Instance terminate quá lâu khi scale in với request ngắn | Giảm deregistration delay (ví dụ từ 300 giây xuống 30 giây) |
| Thay toàn bộ instance theo AMI mới | Instance Refresh với minimum healthy percentage |
| Đổi record DNS nhưng người dùng vẫn tới server cũ | TTL/cache — hạ TTL xuống thấp trước, chờ hết TTL cũ, rồi mới đổi record |

---

## PHẦN NỀN TẢNG — EC2, ELB/ASG, RDS, VPC, Route 53 (DVA hỏi ít, khoảng 1–3 câu mỗi chủ đề, nhưng là nền cho mọi domain)

### N.1. EC2 Fundamentals

- **EC2:** dịch vụ IaaS thuê máy ảo theo nhu cầu. Hệ sinh thái: EC2 instances, EBS volumes, ELB, ASG.
- **AMI:** mẫu chứa OS, cấu hình, phần mềm để launch instance. Khi launch cần chọn AMI, instance type, key pair, network/Security Group, storage và User Data.
- **Instance types:** tên dạng `m5.2xlarge` = class + generation + size.
  - **General Purpose (T, M):** cân bằng compute/memory/network; web server, code repository.
  - **Compute Optimized (C):** CPU hiệu năng cao; batch processing, media transcoding, HPC, scientific modeling, ML, gaming server.
  - **Memory Optimized (R, X1, High Memory, z1d):** xử lý tập dữ liệu lớn trong RAM; database quan hệ/NoSQL hiệu năng cao, in-memory database, ElastiCache, BI realtime.
  - **Storage Optimized (I, D, H1):** đọc/ghi tuần tự tốc độ cao trên local storage; OLTP tần suất cao, data warehousing, distributed file system.
  - Hậu tố: `g` = Graviton (ARM), `a` = AMD, `i` = Intel, `d` = có NVMe instance store, `n` = mạng tốc độ cao, `flex` = biến thể rẻ hơn.
- **Pricing options:**

| Phương thức | Cam kết | Giảm giá tối đa (ghi chú) | Khi nào dùng |
|---|---|---|---|
| On-Demand | Không | Không (giá cao nhất) | Ngắn hạn, không gián đoạn, không dự đoán được |
| Reserved Instances | 1 hoặc 3 năm | ~72% | Ổn định, chạy liên tục, ví dụ database |
| Convertible RI | 1 hoặc 3 năm | ~66% | Dài hạn nhưng cần đổi instance type linh hoạt |
| Savings Plans | 1 hoặc 3 năm, cam kết $/giờ | ~66–72% tùy loại | Dài hạn, hiện đại hơn RI; vượt cam kết tính On-Demand |
| Spot Instances | Không | ~90% | Ngắn hạn, chịu được gián đoạn; batch, phân tích dữ liệu |
| Dedicated Hosts | On-Demand hoặc reserve 1/3 năm | Reservation đến ~70% | Compliance, BYOL theo socket/core, cần visibility phần cứng |
| Dedicated Instances | — | — | Cần phần cứng riêng cho tài khoản nhưng không cần kiểm soát placement |
| Capacity Reservations | Không có thời hạn | Không giảm giá | Giữ chỗ capacity trong một AZ cụ thể; vẫn tính tiền dù không chạy instance |

  - RI chỉ có kỳ hạn **1 hoặc 3 năm**; không có kỳ hạn ở giữa.
  - On-Demand: Linux và Windows tính **theo giây sau phút đầu tiên**; các OS khác tính **theo giờ**.
  - Spot hiện nay: khi bị thu hồi, instance nhận **thông báo trước 2 phút** qua instance metadata `spot/instance-action` và EventBridge; hành vi khi bị thu hồi có thể là terminate, stop hoặc hibernate.
  - **Capacity Reservation không giảm giá và vẫn tính tiền dù không chạy instance.** Muốn giảm giá thì kết hợp với Regional RI hoặc Savings Plans.
  - **Dedicated Host đắt nhất nhưng là đáp án cho compliance + BYOL theo socket/core.** Spot rẻ nhất nhưng không dùng cho critical job hoặc database.
- **Security Groups (SG):** firewall bao quanh EC2 instance, kiểm soát inbound và outbound. **Chỉ có rule Allow, không có Deny.** Rule gồm Type, Protocol, Port range, Source (inbound) hoặc Destination (outbound). Mặc định: mọi inbound bị chặn, mọi outbound được phép. SG là **stateful**: traffic trả lời cho kết nối đã được phép tự động được cho qua. SG gắn với tổ hợp Region/VPC; một SG gắn được nhiều instance, một instance gắn được nhiều SG và rule cộng dồn. Có thể tham chiếu SG khác thay vì IP, ví dụ chỉ cho phép traffic từ SG của ALB vào EC2.
  - Giới hạn SG mặc định (có thể xin tăng): **5 SG mỗi network interface**, **60 inbound + 60 outbound rule mỗi SG**.
- **Key pairs:** `.pem` cho Mac/Linux/Windows 10+, `.ppk` cho PuTTY (chuyển đổi bằng PuTTYgen). Loại RSA hoặc ED25519; ED25519 không dùng được cho Windows instance. AWS không lưu private key — mất file là không SSH bằng key đó được nữa.
- **User Data:** bootstrap script chạy khi instance khởi động. **Mặc định chỉ chạy một lần ở lần khởi động đầu tiên**, không chạy lại khi reboot/stop-start. Chạy bằng user `root` nên không cần ghi `sudo`. Giới hạn **16 KB** (trước khi base64). User data EC2: chạy với **quyền root**, **chỉ chạy ở lần boot đầu tiên**; không sửa được khi instance đang chạy (phải stop).
- **Vòng đời instance:** Running tính phí compute; Stop không tính phí compute nhưng EBS vẫn tính phí lưu trữ; Start lại thì public IPv4 có thể đổi, private IPv4 giữ nguyên; Terminate xóa vĩnh viễn instance và root volume bị xóa nếu Delete on Termination bật.
- **SSH và EC2 Instance Connect:** SSH dùng port 22, user mặc định của Amazon Linux là `ec2-user`, cú pháp `ssh -i <file.pem> ec2-user@<public-ip>`. EC2 Instance Connect là SSH qua trình duyệt, AWS đẩy public key tạm thời lên instance, nhưng bên dưới vẫn là SSH nên SG vẫn phải mở port 22.
- **IAM Role cho EC2:** cấp quyền AWS cho ứng dụng trên EC2 bằng role gắn qua Instance Profile, cung cấp credentials tạm thời tự động xoay vòng qua Instance Metadata. Mỗi instance tại một thời điểm chỉ gắn được 1 instance profile (1 role), nhưng có thể thay role khi instance đang chạy.
- **Public IPv4 bị tính phí từ 01/02/2024**, khoảng **$0,005/giờ mỗi địa chỉ**, kể cả IP đang gắn vào instance đang chạy.
- **AWS Budgets chỉ cảnh báo, không tự tắt tài nguyên.** Muốn tự động hành động thì cần Budget Actions.
- **IAM user có quyền Administrator vẫn có thể bị Access Denied trong Billing** nếu root chưa bật "IAM user and role access to Billing information".
- **Bẫy:** "SG chỉ gắn được một instance" là sai. "My IP" trong SG chỉ đúng với IP hiện tại của bạn. Dùng `https://` khi SG chỉ mở port 80 sẽ quay vòng rồi timeout. **Timeout = Security Group; Connection refused = ứng dụng chưa chạy hoặc lỗi.** Đừng đảo ngược hai dấu hiệu này. EC2 Instance Connect vẫn cần port 22.

### N.2. EC2 Instance Storage — EBS, Instance Store, EFS, AMI, Snapshot

- **EBS volume:** ổ đĩa mạng gắn vào EC2 instance khi instance đang chạy, có một chút độ trễ so với ổ vật lý. 1 volume mặc định chỉ gắn vào 1 instance tại một thời điểm; 1 instance có thể gắn nhiều volume. EBS bị khóa trong **1 Availability Zone**: volume ở `us-east-1a` không gắn được vào instance ở `us-east-1b`. Muốn chuyển AZ thì dùng snapshot rồi restore ở AZ khác. Dung lượng phải provision trước (số GB và IOPS), tính tiền theo dung lượng đã provision; có thể tạo volume để không gắn (unattached) rồi gắn khi cần.
- **Delete on Termination:** root volume mặc định **bật** (bị xóa khi terminate instance); volume gắn thêm mặc định **tắt** (được giữ lại ở trạng thái available). Muốn giữ root volume sau khi terminate thì tắt thuộc tính này cho root volume.
- **EBS Snapshots:** bản backup tại một thời điểm của EBS volume. Không bắt buộc detach khi chụp nhưng được khuyến nghị để dữ liệu nhất quán. Snapshot là incremental: lần đầu chụp toàn bộ block đã dùng, các lần sau chỉ lưu block thay đổi; xóa snapshot cũ không làm hỏng snapshot sau. Snapshot có phạm vi Region, có thể copy sang Region khác cho Disaster Recovery.
  - **Snapshot Archive:** chuyển snapshot sang archive tier rẻ hơn tới 75%, nhưng restore mất **24–72 giờ**; thời gian lưu tối thiểu **90 ngày** (xóa/restore sớm vẫn bị tính đủ 90 ngày).
  - **Recycle Bin:** snapshot bị xóa sẽ vào thùng rác thay vì mất vĩnh viễn, khôi phục được khi xóa nhầm; áp dụng cho EBS Snapshots và AMIs; thời gian lưu giữ **1 ngày – 1 năm**.
  - **Fast Snapshot Restore (FSR):** ép khởi tạo đầy đủ snapshot để volume tạo ra không có latency ở lần đọc đầu tiên; hữu ích khi snapshot rất lớn và cần tạo volume/instance thật nhanh, nhưng rất tốn tiền.
  - Volume tạo từ snapshot được lazy-load: block chỉ tải về khi đọc lần đầu nên lần đọc đầu chậm; FSR hoặc tự "làm nóng" volume bằng cách đọc toàn bộ block sẽ khắc phục.
- **AMI:** bản tùy biến của EC2 instance chứa OS, cấu hình, phần mềm, công cụ monitoring. Tạo AMI giúp boot và cấu hình nhanh hơn. AMI gắn với một Region cụ thể, muốn dùng ở Region khác thì copy AMI sang Region đó. Ba nguồn: Public AMI do AWS cung cấp (ví dụ Amazon Linux 2023), AMI tự tạo, AWS Marketplace AMI do bên thứ ba bán (có thể kèm phí phần mềm theo giờ). Quy trình tạo AMI: tùy biến instance, stop instance để đảm bảo toàn vẹn dữ liệu, build AMI (AWS đồng thời tạo EBS snapshots phía sau), rồi launch instance mới từ AMI, kể cả ở AZ khác.
  - **Deregister AMI không tự xóa snapshot phía sau.** Phải xóa snapshot riêng, nếu không vẫn bị tính phí lưu trữ.
- **EC2 Instance Store:** ổ cứng vật lý gắn trực tiếp vào máy chủ host, cho I/O và throughput rất cao. Tính chất ephemeral (tạm thời): dữ liệu vẫn còn khi reboot, nhưng **mất khi stop, hibernate, terminate hoặc khi host hỏng**. Không detach/attach sang instance khác, không có snapshot; bạn phải tự backup và replicate. Chỉ một số loại instance có instance store (ví dụ họ `i3`, `i4i`, `d3`, các biến thể có hậu tố `d`).
- **Các loại EBS volume (6 loại):**

| Loại | Nhóm | Dung lượng (ghi chú) | Max IOPS | Max throughput | Boot volume? | Dùng khi nào |
|---|---|---|---|---|---|---|
| gp2 | General Purpose SSD | 1 GiB – 16 TiB | 16.000 (3 IOPS/GB) | — | Có | Mặc định cũ, boot volume, dev/test |
| gp3 | General Purpose SSD | 1 GiB – 16 TiB (video); tới 64 TiB (cập nhật 09/2025) | 16.000 (video); tới 80.000 (cập nhật) | 1.000 MB/s (video); tới 2.000 MiB/s (cập nhật) | Có | Mặc định mới, IOPS/throughput độc lập với size |
| io1 | Provisioned IOPS SSD | 4 GiB – 16 TiB | 64.000 (Nitro); 32.000 (khác) | — | Có | Database cần IOPS ổn định, > 16.000 IOPS |
| io2 Block Express | Provisioned IOPS SSD | 4 GiB – 64 TiB | 256.000 | — | Có | Database nhạy cảm hiệu năng, sub-ms, > 32.000 IOPS cần Nitro |
| st1 | Throughput Optimized HDD | 125 GiB – 16 TiB | 500 | 500 MB/s | Không | Big data, data warehouse, xử lý log đọc tuần tự |
| sc1 | Cold HDD | 125 GiB – 16 TiB | 250 | 250 MB/s | Không | Dữ liệu lạnh, archive, chi phí thấp nhất |

  - gp2: **3 IOPS/GB**, tối đa **16.000 IOPS** (đạt ở **5.334 GB**); volume nhỏ burst tới **3.000 IOPS**.
  - gp3 theo video: nền **3.000 IOPS + 125 MB/s** bất kể dung lượng; tăng độc lập lên **16.000 IOPS** và **1.000 MB/s**. **Cập nhật từ 09/2025:** gp3 hỗ trợ tới **64 TiB, 80.000 IOPS và 2.000 MiB/s**, với ràng buộc tối đa **500 IOPS/GiB** và throughput tối đa **0,25 MiB/s cho mỗi IOPS** đã provision. Khi làm bài thi, theo ngữ cảnh đề vì đề có thể vẫn dùng con số cũ.
  - io1: tỉ lệ IOPS/GiB là **50:1**. io2 Block Express: tỉ lệ IOPS/GiB là **1.000:1**; độ trễ **dưới 1 ms (sub-millisecond)**. Muốn vượt **32.000 IOPS** thì cần instance EC2 Nitro với io1/io2.
  - Chỉ **gp2, gp3, io1, io2** (và loại cũ Magnetic Standard) dùng làm boot volume; **st1/sc1 không làm boot volume**.
  - **Elastic Volumes:** mỗi volume phải chờ khoảng **6 giờ** giữa hai lần modify; **không giảm được dung lượng**.
  - **Độ bền theo ghi chú:** io2 hiện nay đều là io2 Block Express với độ bền **99,999%**; các loại khác khoảng **99,8–99,9%**.
- **EBS Multi-Attach:** cho phép gắn cùng một EBS volume vào nhiều EC2 instance trong cùng một AZ. Chỉ có ở họ io1 và io2. Mỗi instance có toàn quyền đọc và ghi đồng thời, nên ứng dụng phải tự quản lý thao tác ghi đồng thời; phải dùng file system cluster-aware (ví dụ GFS2, OCFS2), không phải XFS hay ext4. Tối đa **16 EC2 instance** cùng lúc, chỉ trong **1 AZ**, chỉ io1/io2.
- **Amazon EFS:** NFS được quản lý, mount được trên nhiều EC2 instance kể cả ở các AZ khác nhau. Chỉ hỗ trợ AMI Linux, chuẩn POSIX, giao thức NFSv4.1, cổng 2049, kiểm soát truy cập bằng Security Group, mã hóa at rest bằng KMS. Tự scale, không cần provision trước, trả tiền theo dung lượng dùng thực tế, đắt hơn EBS (theo video khoảng 3 lần giá gp2).
  - **Performance mode:** General Purpose (mặc định, độ trễ thấp; web server, CMS) và Max I/O (độ trễ cao hơn, throughput và song song cao hơn; big data, xử lý media). Max I/O không dùng được với throughput Elastic và với One Zone.
  - **Throughput mode:** Bursting (throughput tăng theo dung lượng lưu trữ), Provisioned (đặt throughput không phụ thuộc dung lượng, trả tiền trước cho throughput đã đặt), Elastic (tự scale lên/xuống theo workload, trả theo mức dùng, phù hợp workload khó đoán, được AWS khuyến nghị).
  - **Storage classes và lifecycle:** Standard (truy cập thường xuyên), Infrequent Access — IA (ít truy cập, lưu trữ rẻ hơn nhưng có phí khi đọc file), Archive (hiếm khi truy cập, rẻ nhất để lưu trữ). Lifecycle policy tự chuyển file sau N ngày không truy cập, ví dụ 30 ngày sang IA, 90 ngày sang Archive. Dùng đúng storage class có thể tiết kiệm tới 90% chi phí.
  - **Availability:** Regional/Multi-AZ (dữ liệu trải trên nhiều AZ, chịu được sự cố AZ, dùng cho production) và One Zone (chỉ 1 AZ, rẻ hơn, dùng cho dev/test; kết hợp được với IA thành One Zone-IA).
  - EFS theo ghi chú: hàng nghìn NFS client đồng thời, throughput **10 GB/s+**, tự tăng lên quy mô petabyte. Ví dụ Bursting: 1 TB → 50 MiB/s, burst tới 100 MiB/s; ví dụ Provisioned: 1 GiB/s cho 1 TB lưu trữ.

**EBS vs EFS vs Instance Store:**

| Tiêu chí | EBS | EFS | Instance Store |
|---|---|---|---|
| Loại | Block storage qua mạng | File system NFS qua mạng | Block storage vật lý trên host |
| Phạm vi | 1 AZ | Nhiều AZ (Regional) hoặc 1 AZ (One Zone) | Gắn với 1 host |
| Số instance | 1 (Multi-Attach io1/io2: tới 16, cùng AZ) | Hàng trăm/nghìn, khác AZ | 1, không tách rời |
| Độ bền dữ liệu | Bền, độc lập vòng đời instance | Bền, multi-AZ | Ephemeral: mất khi stop/terminate/hỏng host |
| Hiệu năng | Tốt, tùy loại volume | Tốt, scale theo throughput mode | Cao nhất (IOPS hàng triệu) |
| Dung lượng | Provision trước, trả theo provision | Tự scale, trả theo dùng | Cố định theo loại instance, đã gồm trong giá |
| OS | Linux và Windows | Chỉ Linux (POSIX) | Linux và Windows |
| Backup | Snapshot (incremental), DLM, AWS Backup | AWS Backup, EFS Replication | Tự làm (copy lên S3 hoặc EBS) |
| Giá | Trung bình | Cao hơn (giảm nhờ IA/Archive) | Không phí riêng |
| Use case | Boot volume, database 1 instance | Shared content, WordPress, CMS, home dirs | Cache, buffer, scratch, temp |

**Bẫy thi storage:**
- **EBS bị khóa theo AZ, không phải Region.** Đề hỏi "volume ở us-east-1a không gắn được vào instance ở us-east-1b" thì đáp án là do khác AZ, không phải thiếu quyền IAM hay bị khóa Region. Cách chuyển AZ là snapshot rồi restore ở AZ mới.
- **Mặc định: root volume bị xóa, volume dữ liệu được giữ.** Đảo ngược hai hành vi này là đáp án sai kinh điển.
- **AMI gắn với Region.** Không thể dùng AMI ở us-east-1 để launch instance ở Region khác; phải copy AMI sang Region đích.
- **st1/sc1 không làm boot volume.**
- **gp2 đã đạt max IOPS thì tăng dung lượng không giúp.** Volume gp2 8 TB đã ở mức tối đa 16.000 IOPS nên tăng size không tăng IOPS; cách đúng là RAID 0 nhiều volume hoặc chuyển sang io1/io2 (thực tế hiện nay chuyển sang gp3 hoặc io2 cũng là lựa chọn tốt).
- **"Multi-Attach nhiều AZ" là sai.** Multi-Attach chỉ trong cùng một AZ, chỉ io1/io2, tối đa 16 instance, cần cluster-aware FS. Mount cùng volume bằng XFS/ext4 trên nhiều máy và cùng ghi sẽ gây hỏng dữ liệu (data corruption).
- **Yêu cầu IOPS vượt EBS thì đáp án là Instance Store, nhưng phải chấp nhận mất dữ liệu.** Ví dụ trong quiz: database cần 310.000 IOPS vượt cả io2 Block Express (256.000) nên chỉ Instance Store đáp ứng; khắc phục bằng cách replicate sang EC2 khác cũng dùng Instance Store làm standby hoặc thiết lập cơ chế backup.
- **Instance Store vẫn còn khi reboot, nhưng mất khi stop/hibernate/terminate.**
- **EFS chỉ cho Linux, không hỗ trợ Windows.** Cần file share cho Windows thì dùng FSx for Windows File Server (SMB), không phải EFS.
- **Nhiều instance ở nhiều AZ cần dùng chung file NFS thì đáp án là EFS, không phải EBS.**
- **Snapshot Archive rẻ nhưng restore chậm (24–72 giờ), không dùng khi cần restore ngay.** FSR thì ngược lại: không latency lần đọc đầu nhưng rất tốn tiền, chỉ dùng khi cần tạo volume/instance thật nhanh từ snapshot lớn.
- **Volume unattached và snapshot vẫn tính phí.** Volume "mồ côi" sau khi terminate instance, snapshot, snapshot trong Recycle Bin và AMI chưa deregister đều là nguồn phí ẩn hay quên sau lab.
- **Backup EBS tiêu tốn IO.** Không nên chạy backup lúc ứng dụng đang tải cao vì ảnh hưởng hiệu năng.
- **Lỗi mount EFS bị treo/timeout thường do SG của EFS chưa mở TCP 2049 từ SG của EC2**, hoặc không có mount target ở AZ của instance.

### N.3. ELB + ASG

- **Scalability và High Availability (HA):** **Vertical scaling (scale up/down):** tăng/giảm kích thước instance. Phổ biến cho hệ thống không phân tán như database. Luôn có giới hạn phần cứng. **Horizontal scaling (scale out/in):** tăng/giảm số lượng instance, còn gọi là elasticity. Đòi hỏi hệ thống phân tán, phổ biến với web app hiện đại. **High Availability:** chạy ứng dụng trên ít nhất 2 AZ để sống sót khi mất một AZ. Có thể passive (ví dụ RDS Multi-AZ: standby chờ sẵn) hoặc active (mọi instance cùng nhận tải). Scalability khác HA, dù thường đi kèm nhau.
- **Elastic Load Balancing (ELB):** load balancer được quản lý (managed): AWS lo nâng cấp, bảo trì, HA; tích hợp EC2, ASG, ECS, ACM, CloudWatch, Route 53, WAF, Global Accelerator. Lợi ích: phân tán tải, một DNS name duy nhất cho ứng dụng, health check và ngừng gửi traffic tới instance lỗi, SSL termination, stickiness, HA multi-AZ, tách traffic public/private.
- **Health check:** ELB kiểm tra định kỳ trên một port và route, ví dụ HTTP port 4567, endpoint `/health`. Instance không trả về `200 OK` thì bị đánh unhealthy và không nhận traffic. Health check thực hiện ở cấp target group. ELB có thể là **internal** (private) hoặc **external/internet-facing** (public).
- **Bảo mật:** security group của ELB cho phép HTTP 80 và HTTPS 443 từ `0.0.0.0/0`; security group của EC2 phía sau chỉ cho phép HTTP 80 với source là **security group của ELB** (không phải dải IP), nhờ đó EC2 chỉ nhận traffic từ load balancer.
- **Application Load Balancer (ALB):** tầng 7, chỉ HTTP/HTTPS/WebSocket, hỗ trợ HTTP/2 và redirect (ví dụ HTTP → HTTPS ngay tại load balancer). Routing tới nhiều target group theo **path** (`/users`, `/posts`), **hostname** (`one.example.com`), **query string/header**, HTTP method, source IP. Rất hợp với microservices và container (ECS) nhờ port mapping tới port động. Target group của ALB: **EC2 instances** (có thể do ASG quản lý), **ECS tasks**, **Lambda functions** (request HTTP chuyển thành JSON event), **IP addresses — phải là private IP** (ví dụ server on-premises). ALB có **hostname cố định** (`XXX.region.elb.amazonaws.com`), **không có IP tĩnh**, không gắn được Elastic IP. Server ứng dụng không thấy IP thật của client vì ALB terminate kết nối và mở kết nối mới bằng private IP của ALB. Thông tin client nằm trong header: `X-Forwarded-For` (IP client), `X-Forwarded-Port`, `X-Forwarded-Proto`. Listener rule có action: forward tới target group, redirect tới URL, return fixed response (ví dụ 404).
- **Network Load Balancer (NLB):** tầng 4: forward traffic **TCP, TLS (secure TCP), UDP**. Hiệu năng cực cao, độ trễ cực thấp, xử lý hàng triệu request/giây. Có **một IP tĩnh cho mỗi AZ**, gắn được **Elastic IP** — hữu ích khi khách hàng cần whitelist tập IP cố định. NLB không thuộc free tier. Target group của NLB: **EC2 instances**, **private IP**, **ALB** (NLB đứng trước ALB: vừa có IP tĩnh vừa có routing HTTP). Health check của NLB hỗ trợ **TCP, HTTP, HTTPS**. **Client IP preservation:** với target type `instance`, EC2 thấy IP thật của client; với target type `ip`, mặc định không giữ IP client cho TCP/TLS, có thể bật `preserve_client_ip.enabled` hoặc dùng Proxy Protocol v2. NLB hỗ trợ security group từ 8/2023; lưu ý trong ghi chú: phải gắn security group lúc tạo, nếu tạo không có security group thì sau này không thêm được.
- **Gateway Load Balancer (GWLB):** tầng 3 (Network layer), xử lý IP packet. Dùng để triển khai, scale và quản lý fleet **virtual appliance mạng của bên thứ ba**: firewall, IDS/IPS, Deep Packet Inspection, hệ thống sửa đổi payload. Kết hợp Transparent Network Gateway (một điểm vào/ra duy nhất) và Load Balancer (phân tải tới appliance). Luồng: route table của VPC đưa traffic vào GWLB trước (qua Gateway Load Balancer Endpoint) → GWLB phân tải tới appliance → appliance cho qua hoặc drop → traffic quay lại GWLB rồi tới ứng dụng, trong suốt với user và ứng dụng. Dùng giao thức **GENEVE trên port 6081**. Target group: EC2 instances, private IP.
- **Classic Load Balancer (CLB):** thế hệ cũ (V1, 2009), tầng 4 và 7, hỗ trợ HTTP, HTTPS, TCP, SSL. Đã deprecated, AWS khuyến nghị migrate sang ALB/NLB; đề DVA-C02 hầu như không hỏi sâu về CLB.
- **Sticky Sessions (Session Affinity):** cùng một client luôn được chuyển tới cùng một instance phía sau load balancer. Hoạt động với CLB, ALB và NLB; CLB/ALB dùng cookie, NLB dùng source IP (không cần cookie). Cookie do load balancer tạo: duration-based là `AWSALB` (ALB), `AWSELB` (CLB); application cookie do load balancer tạo là `AWSALBAPP`; custom cookie do ứng dụng tạo, chỉ định riêng cho từng target group. Tên reserved, không dùng cho custom cookie: `AWSALB`, `AWSALBAPP`, `AWSALBTG`. Duration-based: thời hạn do load balancer đặt; application-based: thời hạn do ứng dụng quyết định. Nhược điểm: có thể gây mất cân bằng tải. Giải pháp lâu dài tốt hơn là thiết kế stateless: lưu session vào ElastiCache/DynamoDB.
- **Cross-Zone Load Balancing:** mỗi node của load balancer phân tải đều cho tất cả instance đã đăng ký ở mọi AZ, không chỉ trong AZ của mình. Không có cross-zone, traffic chỉ ở lại trong AZ của node nhận, nên AZ ít instance sẽ bị tải nặng hơn. ALB: bật mặc định, có thể tắt ở cấp target group, không tính phí data inter-AZ. NLB và GWLB: tắt mặc định, bật thì trả phí data inter-AZ. CLB: tắt mặc định, bật thì miễn phí.
  - Ví dụ AZ1 có 2 instance, AZ2 có 8 instance (tổng 10, mỗi LB node nhận 50%): có cross-zone → mỗi instance 10%; không cross-zone → mỗi instance AZ1 25% (50%/2), mỗi instance AZ2 6,25% (50%/8).
- **SSL/TLS và SNI:** certificate cho phép mã hoá traffic in-flight giữa client và load balancer. Quản lý bằng **ACM** (có thể tự upload certificate lên ACM). HTTPS listener phải chỉ định **default certificate**, có thể thêm danh sách certificate cho nhiều domain, chọn security policy để hỗ trợ client đời cũ. **SNI (Server Name Indication):** client chỉ ra hostname trong lúc SSL handshake ban đầu để server chọn đúng certificate. Chỉ hoạt động với **ALB, NLB và CloudFront**; CLB không hỗ trợ, CLB chỉ có 1 certificate nên nhiều domain cần nhiều CLB. Mẫu chuẩn: listener HTTP:80 redirect sang HTTPS:443, listener 443 terminate TLS.
- **Connection Draining / Deregistration Delay:** CLB gọi là Connection Draining; ALB và NLB gọi là Deregistration Delay (cấu hình ở target group). Ý nghĩa: thời gian cho phép request đang xử lý (in-flight) hoàn tất khi instance bị deregister hoặc unhealthy. Trong thời gian này ELB ngừng gửi request mới tới instance đó, request mới chuyển sang instance khác.
- **Auto Scaling Group (ASG):** mục tiêu: scale out khi tải tăng, scale in khi tải giảm, đảm bảo số instance tối thiểu/tối đa, tự đăng ký instance mới vào load balancer, tạo lại EC2 khi instance bị terminate vì unhealthy. **ASG miễn phí**, chỉ trả tiền tài nguyên bên dưới. Ba tham số kích thước, ràng buộc `min ≤ desired ≤ max`: **Minimum capacity** (tối thiểu luôn chạy), **Desired capacity** (số instance ASG cố gắng duy trì), **Maximum capacity** (tối đa khi scale out). ASG dùng **Launch Template** (Launch Configuration cũ đã deprecated) chứa: AMI + instance type, EC2 User Data, EBS volumes, security groups, SSH key pair, IAM role cho EC2 (instance profile), network + subnet, thông tin load balancer (cấu hình ở ASG). Mặc định ASG chỉ dùng EC2 health check (status check); muốn ASG thay instance mà ELB đánh unhealthy thì phải bật **ELB health check** cho ASG. Scale dựa trên **CloudWatch alarm**: metric như Average CPU được tính trung bình trên toàn bộ instance của ASG.
- **Scaling Policies:** **Target Tracking Scaling:** đơn giản nhất, chọn một metric và giá trị mục tiêu (ví dụ giữ CPU trung bình quanh 40%), ASG tự tạo CloudWatch alarm và scale để giữ metric quanh mục tiêu. **Simple / Step Scaling:** tự tạo CloudWatch alarm; khi alarm kích hoạt thì thêm/bớt số unit. Step: số unit phụ thuộc mức độ vượt ngưỡng (ví dụ CPU > 70% → thêm 2 unit; CPU < 30% → bớt 1 unit). **Scheduled Scaling:** scale theo lịch khi biết trước mẫu sử dụng (ví dụ tăng min capacity lên 10 lúc 17h thứ Sáu). **Predictive Scaling:** dự báo tải liên tục bằng machine learning dựa trên lịch sử rồi lên lịch scale trước; phù hợp tải có chu kỳ lặp lại theo ngày/tuần. **Scaling Cooldown:** sau một hoạt động scaling, ASG không launch/terminate thêm instance để metric kịp ổn định. Dùng AMI dựng sẵn giúp instance phục vụ nhanh hơn và cho phép giảm cooldown. Metric tốt để scale: `CPUUtilization`, `RequestCountPerTarget` (số request trên mỗi instance, ví dụ 1000 request/target), Average Network In/Out (cho ứng dụng bị giới hạn bởi network), custom metric (ví dụ số message trong queue/instance).
  - **Target Tracking Scaling Policy predefined metrics:** `ASGAverageCPUUtilization`, `ASGAverageNetworkIn/Out`, `ALBRequestCountPerTarget` — **không** có `ApproximateNumberOfMessagesVisible` (metric của SQS; muốn scale theo SQS thì tính backlog per instance làm custom metric).
- **Instance Refresh:** cập nhật launch template rồi tạo lại toàn bộ EC2 trong ASG (ví dụ đổi sang AMI mới đã vá lỗi bảo mật) mà không cần terminate thủ công từng instance hay tạo ASG mới. API: `StartInstanceRefresh`. Tham số chính: **Minimum healthy percentage** (tỷ lệ instance tối thiểu phải healthy trong suốt quá trình, ví dụ 60% — quyết định bao nhiêu instance được thay cùng lúc) và **Instance warm-up time** (thời gian chờ instance mới được coi là sẵn sàng trước khi thay đợt tiếp theo).
- **Con số ELB/ASG:** CLB ra đời 2009; ALB 2016; NLB 2017; GWLB 2020. NLB: độ trễ khoảng ~100 ms so với ~400 ms của ALB — ghi chú nêu rõ đây là con số minh hoạ trong khoá học. NLB idle timeout: TCP mặc định 350 giây, UDP 120 giây (ghi chú: TCP chỉnh được từ 2024). Listener rule priority: từ 1 (cao nhất) đến 50.000; request khớp nhiều rule thì rule có priority cao nhất (số nhỏ nhất) thắng. Sticky session duration-based: từ 1 giây đến 7 ngày. Ví dụ hands-on: duration-based 1 ngày (86.400 giây). Deregistration Delay / Connection Draining: 1–3.600 giây, mặc định 300 giây (5 phút), đặt 0 để tắt. Scaling cooldown mặc định: 300 giây. Health check grace period trong ví dụ hands-on của ASG: 300 giây (ghi chú không nêu đây là giá trị mặc định chung, nên đừng ghi nhớ 300 giây là mặc định của grace period). GWLB: giao thức GENEVE, port 6081. ALB: trong phần kiến thức thực tế, ghi chú nêu quota mặc định khoảng 25 certificate ngoài default cho một listener (dùng wildcard hoặc SAN để tiết kiệm). ASG luôn giữ capacity trong khoảng min–max (max = 3, current = 2, policy thêm 3 → chỉ thêm **1**).

**ALB vs NLB vs GWLB vs CLB:**

| Tiêu chí | ALB | NLB | GWLB | CLB |
|---|---|---|---|---|
| Tầng OSI | 7 | 4 | 3 | 4 và 7 |
| Giao thức | HTTP, HTTPS, WebSocket, gRPC | TCP, UDP, TLS, TCP_UDP | IP (tầng mạng) | HTTP, HTTPS, TCP, SSL |
| IP | Không IP tĩnh, chỉ DNS name | 1 IP tĩnh/AZ, gắn được Elastic IP | — | — |
| Routing theo nội dung | Có: path, host, header, query string, method, source IP | Không (chỉ theo port/protocol) | Không — phân tải tới appliance | — |
| IP client | Trong `X-Forwarded-For` | Giữ nguyên IP client (target type instance) | — | — |
| Target | EC2, ECS tasks, Lambda, private IP | EC2, private IP, ALB | EC2, private IP | — |
| Cross-zone mặc định | Bật, miễn phí inter-AZ | Tắt, bật thì trả phí | Tắt, bật thì trả phí | Tắt, bật thì miễn phí |
| SNI / nhiều certificate | Có | Có | — | Không — chỉ 1 certificate |
| Thế hệ | V2 (2016) | V2 (2017) | Mới (2020) | V1, deprecated (2009) |

**Bẫy thi ELB/ASG:**
- **Nhầm vertical với horizontal:** tăng cỡ instance (`r4.large` → `r4.4xlarge`) là vertical; ASG tăng/giảm số instance là horizontal. HA (multi-AZ) không đồng nghĩa với scalability.
- **Nhầm ALB với NLB:** TCP/UDP thuần, hiệu năng cực cao, hàng triệu request/giây, IP tĩnh/Elastic IP → NLB, không phải ALB. ALB không hỗ trợ TCP thuần, không có IP tĩnh, không gắn được Elastic IP.
- **Chiều NLB ↔ ALB:** NLB có thể đặt ALB làm target; chiều ngược lại (ALB đặt NLB làm target) thì không được, theo ghi chú.
- **Routing theo vị trí địa lý của client không phải việc của ALB** — đó là Route 53/CloudFront. ALB routing theo path/host/query string/header/method/source IP.
- **IP client:** EC2 phía sau ALB thấy source IP là IP của ALB, IP thật nằm ở `X-Forwarded-For`; `X-Forwarded-Proto` chỉ cho biết protocol, không phải IP.
- **Bảo mật EC2 sau ELB:** đáp án đúng là inbound cho phép traffic từ security group của ELB; đáp án dùng public IP của ALB là sai vì ALB không có IP cố định; `0.0.0.0/0` là sai vì cho phép truy cập trực tiếp từ Internet.
- **SNI:** nhiều certificate cho nhiều domain trên một load balancer → ALB/NLB/CloudFront; CLB chỉ 1 certificate, nhiều domain thì cần nhiều CLB.
- **Cross-zone:** ALB bật mặc định và miễn phí; NLB/GWLB tắt mặc định và bật thì trả phí. Đừng đảo ngược hai nhóm này.
- **Sticky session gây mất cân bằng:** một instance quá tải trong khi instance khác rảnh sau khi bật stickiness → nguyên nhân chính là stickiness, không phải cross-zone hay deregistration delay.
- **"User phải đăng nhập lại liên tục":** bật sticky sessions là đáp án trực tiếp; giải pháp lâu dài tốt hơn là lưu session ra ElastiCache/DynamoDB.
- **ASG không thay instance mà ELB đánh unhealthy:** nguyên nhân hay gặp là ASG chưa bật ELB health check, chỉ dùng EC2 status check.
- **Nhầm 3 khái niệm thời gian:** cooldown (mặc định 300 giây, sau scaling thì không scale tiếp) khác deregistration delay (mặc định 300 giây, chờ request in-flight hoàn tất khi gỡ instance) và khác health check grace period (bỏ qua health check trong lúc instance mới khởi động).
- **Instance terminate quá lâu khi scale in với request ngắn:** giảm deregistration delay (ví dụ từ 300 giây xuống 30 giây), không phải tăng cooldown hay grace period.
- **Thay toàn bộ instance theo AMI mới:** dùng Instance Refresh với minimum healthy percentage, không phải terminate thủ công từng instance, không phải đặt desired về 0 rồi tăng lại (gây downtime), không phải tạo ASG mới.
- **Lỗi ALB:** 503 = target group không có target healthy nào; 502 = target trả response sai hoặc đóng kết nối; 504 = target phản hồi chậm hơn idle timeout.
- **Target tracking vs scheduled:** "giữ CPU quanh 40%" → target tracking; "tải tăng vọt vào 17h thứ Sáu đã biết trước" → scheduled (target tracking/simple chỉ phản ứng sau khi metric đã tăng).

**Liên hệ thực tế — ELB/ASG:**
1. **Web app microservices chịu tải cao, cần routing theo path và HA:** Một ALB public đứng trước nhiều target group: route `/user` tới target group "User app", `/search` tới target group "Search app", mỗi target group có health check riêng. Phía sau là ASG multi-AZ với Launch Template, bật ELB health check để tự thay instance unhealthy, dùng target tracking giữ CPU quanh 40% và scheduled scaling cho giờ cao điểm đã biết trước. EC2 chỉ mở inbound từ security group của ALB. Chọn ALB vì cần routing tầng 7 theo path; chọn ASG vì cần horizontal scaling và tự phục hồi.
2. **Game server UDP + khách hàng doanh nghiệp yêu cầu whitelist IP cố định, nhưng vẫn cần routing HTTP theo path:** Dùng NLB cho traffic UDP của game (tầng 4, độ trễ thấp, hàng triệu request/giây) và dùng NLB với Elastic IP mỗi AZ đặt ALB làm target cho phần web: NLB cung cấp IP tĩnh để whitelist, ALB giữ khả năng routing HTTP theo path/host. Nếu chỉ dùng ALB thì không đáp ứng được yêu cầu IP tĩnh; nếu chỉ dùng NLB thì không routing được theo path. Trường hợp cần kiểm tra mọi IP packet bằng firewall của bên thứ ba thì mới dùng GWLB (GENEVE port 6081), không dùng NLB/ALB cho mục đích này.

### N.4. RDS + Aurora + ElastiCache

- **Amazon RDS:** dịch vụ managed database cho database dùng SQL. AWS quản lý hạ tầng bên dưới: provisioning tự động, vá OS tự động, backup liên tục và khôi phục về một thời điểm (Point in Time Restore), dashboard monitoring, Read Replicas, Multi-AZ, maintenance window, scale dọc (đổi instance type) và scale ngang (thêm read replica), storage dựa trên EBS.
- **Engine RDS hỗ trợ:** PostgreSQL, MySQL, MariaDB, Oracle, Microsoft SQL Server, IBM Db2, Aurora. **Không có** MongoDB, Cassandra, Redis trong RDS (đó là NoSQL, thuộc DocumentDB, Keyspaces, ElastiCache).
- Điểm "trừ" duy nhất: **không SSH** được vào instance chạy RDS (trừ RDS Custom cho Oracle/SQL Server).
- **RDS Storage Auto Scaling:** khi sắp hết chỗ, RDS tự tăng storage không cần downtime, nhưng phải đặt **Maximum Storage Threshold** để storage không tăng vô hạn. Hữu ích cho workload khó dự đoán, hỗ trợ mọi engine RDS. Tự tăng khi đồng thời: dung lượng trống **< 10%** dung lượng đã cấp phát; tình trạng thiếu chỗ kéo dài **≥ 5 phút**; đã qua **6 giờ** kể từ lần thay đổi storage gần nhất. Storage autoscaling chỉ tăng, **không bao giờ tự giảm**.
- **Point in Time Restore luôn tạo ra một DB instance MỚI** (endpoint mới), không ghi đè instance cũ — ứng dụng phải đổi connection string sang instance mới.
- **Read Replicas — để scale đọc:** replication **bất đồng bộ (ASYNC)** → dữ liệu đọc từ replica là **eventually consistent** (đọc trước khi dữ liệu kịp sao chép sẽ nhận dữ liệu cũ). Replica chỉ dùng cho `SELECT`, không dùng `INSERT`/`UPDATE`/`DELETE`. Mỗi replica có **endpoint DNS riêng**, ứng dụng phải cập nhật connection string để dùng danh sách replica. Replica có thể nằm cùng AZ, khác AZ (cross-AZ) hoặc khác region (cross-region), và có thể được **promote** thành database độc lập (rời khỏi replication, nhận cả ghi).
- **Multi-AZ — để Disaster Recovery:** ứng dụng đọc/ghi vào master ở AZ A; RDS replication **đồng bộ (SYNC)** sang standby ở AZ B, mỗi thay đổi phải ghi cả sang standby mới được xác nhận. Ứng dụng dùng **một DNS name duy nhất**; khi master gặp sự cố, RDS tự động failover sang standby, DNS trỏ sang standby — không cần can thiệp thủ công, không cần đổi connection string. Failover xảy ra khi mất cả AZ, mất mạng, instance hoặc storage của master bị lỗi.
- **Standby của Multi-AZ (DB instance) không đọc, không ghi được**, chỉ đứng chờ — vì vậy Multi-AZ tăng availability nhưng **không dùng để scale**.
- Chuyển từ Single-AZ sang Multi-AZ là **zero downtime**: chỉ cần Modify database và bật Multi-AZ (bên trong RDS tự chụp snapshot, restore thành standby ở AZ khác, rồi thiết lập đồng bộ).
- Ngoại lệ cần nhớ: **Multi-AZ DB cluster** (1 writer + 2 standby đọc được ở 3 AZ, failover nhanh hơn, chỉ hỗ trợ MySQL và PostgreSQL) khác với Multi-AZ DB instance truyền thống (standby không đọc được). Khi đề nói "Multi-AZ" chung chung thì hiểu là Multi-AZ DB instance.
- **Read Replica cũng có thể bật Multi-AZ** để phục vụ disaster recovery.
- **Amazon Aurora:** engine **độc quyền của AWS**, không open source, nhưng **tương thích với MySQL và PostgreSQL** (không phải Oracle, MariaDB, SQL Server): driver MySQL/PostgreSQL kết nối như bình thường. Cloud-optimized: hiệu năng khoảng 5x MySQL trên RDS và 3x PostgreSQL trên RDS; chi phí cao hơn RDS khoảng 20% nhưng ở quy mô lớn lại tiết kiệm hơn.
- **Aurora storage tự động tăng**, bắt đầu từ 10 GB, tăng tới 256 TB (tài liệu cũ ghi 128 TB; từ 2025 AWS nâng lên 256 TiB cho các phiên bản engine Aurora mới, phiên bản cũ vẫn là 128 TiB; video bản cập nhật nói 256 TB). Shared storage volume là volume logic, tự replication, tự self-healing, tự mở rộng.
- **Aurora HA và read scaling:** mỗi lần ghi, Aurora lưu **6 bản sao dữ liệu trên 3 AZ** — cần 4/6 bản sao để ghi (mất một AZ vẫn ghi được), cần 3/6 bản sao để đọc. Dữ liệu hỏng được tự sửa bằng peer-to-peer replication; dữ liệu được stripe trên hàng trăm volume.
- **Aurora kiến trúc instance:** chỉ một master nhận ghi; master lỗi thì failover nhanh, và **bất kỳ replica nào cũng có thể lên làm master** (khác RDS, nơi standby là cố định).
- **Aurora Endpoint:** **Writer Endpoint** (cluster endpoint) luôn trỏ tới master hiện tại; **Reader Endpoint** load balance tới tất cả read replicas **ở mức connection** (không phải mức câu lệnh); mỗi instance cũng có endpoint riêng. Vì số replica thay đổi liên tục, ứng dụng nên dùng Reader Endpoint thay vì theo dõi từng replica.
- **Aurora tính năng khác:** replica auto scaling; **Global Database** (1 region primary + các region secondary chỉ đọc, replication ở tầng storage, độ trễ thường dưới 1 giây, có thể promote region secondary khi region primary gặp sự cố) cho DR cross-region và đọc độ trễ thấp toàn cầu; **Backtrack** (tua ngược dữ liệu về bất kỳ thời điểm nào, không dựa vào backup — chỉ có ở Aurora MySQL, phải bật khi tạo cluster, cửa sổ tối đa 72 giờ, tua ngược ngay trên cluster hiện tại); **Aurora Serverless v2** (instance class `db.serverless`, scale theo ACU, có thể dùng chung cluster với instance provisioned, hỗ trợ reader, Multi-AZ, Global Database, có thể scale về 0 ACU khi không có kết nối; Serverless v1 đã end-of-life năm 2025).
- **Bảo mật RDS và Aurora:** **At-rest encryption:** mã hoá dữ liệu trên volume bằng KMS, áp dụng cho master và mọi replica, **phải chọn lúc tạo database lần đầu**. Master không mã hoá → read replica không thể mã hoá. Mã hoá DB đã có mà chưa mã hoá: **snapshot → copy snapshot có bật mã hoá → restore** thành DB mã hoá. **In-flight encryption:** mọi DB RDS/Aurora sẵn sàng TLS mặc định; client phải dùng TLS root certificate của AWS. **Authentication:** username/password truyền thống hoặc **IAM Database Authentication** (ví dụ EC2 có IAM Role xác thực thẳng vào DB, không cần password). IAM DB Auth hỗ trợ MySQL, MariaDB, PostgreSQL và Aurora MySQL/PostgreSQL; **không hỗ trợ Oracle** (và SQL Server — Oracle/SQL Server dùng Kerberos). Trong code, sinh auth token (hiệu lực 15 phút) thay cho password, bắt buộc dùng SSL/TLS. **Network:** kiểm soát bằng security group (best practice: inbound port DB chỉ từ security group của ứng dụng, không mở theo dải IP rộng; không bao giờ để Public access = Yes cho database thật, đặt RDS trong private subnet). **Audit Logs:** bật audit log để biết query nào được chạy; log trên RDS bị mất sau một thời gian → muốn lưu lâu thì gửi sang **CloudWatch Logs**.
- **Amazon RDS Proxy:** database proxy **fully managed** cho RDS và Aurora, triển khai trong VPC. Ứng dụng kết nối tới proxy thay vì kết nối thẳng DB; proxy gom (pool) và chia sẻ các kết nối, mở ít kết nối hơn tới DB. **Không cần sửa code**, chỉ đổi endpoint kết nối sang endpoint của proxy. **Không bao giờ public**, chỉ truy cập được từ trong VPC. Ba lợi ích chính phải nhớ: (1) **Connection pooling** — giảm áp lực lên CPU, RAM của DB, giảm số kết nối mở và timeout; (2) **Giảm failover time tới 66%** — ứng dụng nối vào proxy và không biết gì về failover, proxy tự xử lý failover của RDS/Aurora; (3) **Ép dùng IAM authentication** — người dùng chỉ kết nối được bằng IAM, credentials DB lưu an toàn trong AWS Secrets Manager. Hỗ trợ RDS MySQL, PostgreSQL, MariaDB, SQL Server và Aurora MySQL/PostgreSQL. Fully serverless, tự scale, highly available (multi-AZ). **RDS Proxy và Lambda:** Lambda có thể nhân lên hàng trăm, hàng nghìn bản chạy, xuất hiện và biến mất rất nhanh; nếu mỗi bản mở kết nối thẳng tới RDS sẽ để lại kết nối mở, timeout, gây quá tải DB. Giải pháp: Lambda kết nối vào RDS Proxy, proxy gom lại thành ít kết nối tới DB. Lambda muốn dùng RDS Proxy phải chạy trong VPC.
- **Amazon ElastiCache:** tương tự RDS cho database quan hệ, ElastiCache cung cấp **Redis (Redis OSS / Valkey) hoặc Memcached** được quản lý. Cache là **in-memory database**: hiệu năng rất cao, độ trễ rất thấp. Hai kiến trúc chính: (1) **Cache cho database** — ứng dụng hỏi cache trước; cache hit thì lấy kết quả, tiết kiệm một lần truy vấn DB; cache miss thì đọc từ RDS rồi ghi lại vào cache; giảm tải RDS nhưng cần chiến lược cache invalidation vì đây là phần khó nhất; (2) **Lưu user session** — user đăng nhập vào một instance, ứng dụng ghi session vào ElastiCache; request sau tới instance khác vẫn đọc được session từ ElastiCache, user không phải login lại, ứng dụng trở thành stateless. Lưu ý quan trọng: dùng ElastiCache **phải sửa code ứng dụng khá nhiều** (query cache trước/sau khi query DB), không phải "bật lên là có cache". ElastiCache chỉ truy cập được từ trong VPC (không có public endpoint).
- **Redis:** Multi-AZ với auto-failover, read replicas để scale đọc và HA, durability bằng AOF persistence, backup và restore, hỗ trợ Sets và Sorted Sets (làm leaderboard).
- **Memcached:** nhiều node, phân mảnh dữ liệu (sharding), **không có HA, không replication, không persistent** (lỗi có thể mất cả cache), kiến trúc đa luồng (multi-thread). Backup/restore chỉ có ở Memcached Serverless, không có ở bản node-based.
- **Valkey:** năm 2024 Redis đổi giấy phép, cộng đồng fork thành Valkey, tương thích Redis OSS; ElastiCache hỗ trợ Valkey từ 10/2024 và giá thấp hơn Redis OSS. Đề thi có thể vẫn ghi "ElastiCache for Redis": coi như tương đương.
- **Các chiến lược caching:** **Lazy Loading / Cache-Aside / Lazy Population — ba tên gọi là một.** Luồng: ứng dụng đọc từ cache → cache hit thì trả về; cache miss thì đọc từ RDS rồi ghi vào cache. Ưu điểm: chỉ dữ liệu được yêu cầu mới vào cache, tiết kiệm bộ nhớ; node cache hỏng không nguy hiểm, chỉ tăng độ trễ lúc warm up. Nhược điểm: cache miss = 3 lượt gọi mạng (đọc cache, đọc DB, ghi cache) → **read penalty**; dữ liệu có thể cũ (stale) vì DB cập nhật nhưng cache không tự cập nhật. Dấu hiệu nhận biết trong pseudocode: hàm đọc (`get_...`), kiểm tra cache trước, miss thì mới query DB rồi `cache.set`. **Write-Through:** thêm/cập nhật cache mỗi khi database được cập nhật (ghi vào RDS và đồng thời ghi vào cache). Ưu điểm: dữ liệu trong cache không bao giờ cũ, đọc rất nhanh. Nhược điểm: **write penalty** (mỗi lần ghi cần 2 lượt gọi: DB + cache), **cache churn** (nhiều dữ liệu ghi vào cache nhưng có thể không bao giờ được đọc — vấn đề nếu cache nhỏ), thiếu dữ liệu cho tới khi dữ liệu được thêm/cập nhật trong DB → kết hợp với Lazy Loading để khắc phục. Dấu hiệu nhận biết: hàm ghi (`save_...`), ghi DB rồi `cache.set` ngay. `get_user` (Lazy Loading) và `save_user` (Write-Through) có thể dùng cùng nhau. **TTL (Time-to-live):** item chỉ sống một khoảng thời gian (ví dụ 5 phút; TTL từ vài giây tới vài giờ, vài ngày). Ngay cả TTL vài giây cho dữ liệu được truy cập cực nhiều cũng rất hiệu quả. TTL giúp cân bằng giữa giữ dữ liệu trong cache và nhường chỗ cho dữ liệu mới; thường là ý hay, trừ khi dùng Write-Through. **Cache Evictions:** cache có dung lượng giới hạn → dữ liệu bị loại ra khi bạn xoá tường minh, khi bộ nhớ đầy và item ít được dùng gần đây → **LRU (Least Recently Used)**, hoặc khi TTL hết hạn. Quá nhiều eviction vì cache luôn đầy bộ nhớ → **scale up hoặc scale out** cache. Lời khuyên: Lazy Loading dễ cài, phù hợp nhiều tình huống, là nền tảng để cải thiện hiệu năng đọc → nên làm trước; Write-Through phức tạp hơn, là tối ưu bổ sung trên nền Lazy Loading, không nên là ưu tiên đầu tiên. Chỉ cache dữ liệu hợp lý (user profile, blog…), **không** cache giá cả (pricing) hay số dư tài khoản ngân hàng.
- **Amazon MemoryDB:** **MemoryDB for Redis** là in-memory database **bền vững (durable)**, tương thích Redis. Khác biệt cốt lõi: Redis (ElastiCache) mục đích chính là **cache**, có một chút durability; MemoryDB là **database thật sự**, chỉ là có API tương thích Redis. Dữ liệu in-memory nhưng lưu trữ bền vững nhờ **Multi-AZ transaction log**. Use case: web và mobile app, online gaming, media streaming; nhiều microservice cần truy cập một database in-memory tương thích Redis với tốc độ in-memory + transaction log Multi-AZ cho khôi phục nhanh và bền dữ liệu.

**Con số RDS/Aurora/ElastiCache:**
- RDS Read Replicas: tối đa **15**. Ghi chú lưu ý: giới hạn 15 áp dụng cho MySQL, MariaDB, PostgreSQL; với Oracle và SQL Server, giới hạn thấp hơn (5 replica) — đề thi dùng con số 15.
- Aurora Replicas: tối đa **15**; replica auto scaling từ 1 đến 15 replica.
- Aurora: **6 bản sao dữ liệu trên 3 AZ**; ghi cần **4/6** bản sao, đọc cần **3/6** bản sao; replica lag thường **dưới 10 ms**; failover trung bình **dưới 30 giây**.
- Aurora storage: bắt đầu từ **10 GB**, tăng tới **256 TB** (xem lưu ý phiên bản ở trên).
- Aurora hiệu năng: khoảng **5x MySQL trên RDS** và **3x PostgreSQL trên RDS**; chi phí cao hơn RDS khoảng **20%**.
- Aurora Global Database: độ trễ replication thường **dưới 1 giây**.
- Backtrack: chỉ Aurora MySQL, cửa sổ tối đa **72 giờ**.
- Automated backup: retention **0–35 ngày** (0 = tắt). Manual snapshot giữ đến khi bạn xoá.
- IAM Database Authentication: auth token hiệu lực **15 phút**.
- RDS Proxy: giảm failover time tới **66%**.
- ElastiCache Redis cluster mode disabled: 1 shard gồm 1 primary + tối đa **5 read replicas**.
- MemoryDB: hiệu năng hơn **160 triệu request/giây**; scale liền mạch từ hàng chục GB tới hàng trăm TB.
- RDS: ví dụ hands-on khai báo dung lượng ban đầu 20 GB, maximum storage threshold ví dụ 1000 GB (đây là ví dụ trong lab, không phải giới hạn mặc định).

**Multi-AZ vs Read Replica (RDS):**

| Tiêu chí | Read Replicas | Multi-AZ (DB instance) |
|---|---|---|
| Mục đích | Scale đọc | Disaster recovery / High availability |
| Replication | Bất đồng bộ (ASYNC) → eventually consistent | Đồng bộ (SYNC) |
| Số lượng | Tối đa 15 | 1 standby |
| Vị trí | Cùng AZ, cross-AZ, cross-region | AZ khác, cùng region |
| Đọc được không? | Có (chỉ đọc, chỉ `SELECT`) | Không (standby không phục vụ traffic) |
| Endpoint | Mỗi replica một endpoint riêng → phải sửa connection string | Một DNS name, failover tự động |
| Promote | Promote thành DB độc lập (thủ công) | Standby tự lên làm master khi failover |
| Phí mạng | Miễn phí trong cùng region, mất phí cross-region | — |
| Dùng khi nào | Analytics/reporting, giảm tải đọc cho production | Mất AZ, cần failover tự động không đổi connection string |

**Redis vs Memcached (ElastiCache):**

| Tiêu chí | Redis (Redis OSS / Valkey) | Memcached |
|---|---|---|
| Mô hình | Một node replicate sang node khác | Nhiều node sharding cạnh nhau |
| HA | Multi-AZ với auto-failover | Không có HA, không replication |
| Read replicas | Có (cluster mode disabled: tối đa 5) | — |
| Durability | Có: AOF persistence, backup và restore | Không persistent; backup/restore chỉ có ở Memcached Serverless |
| Cấu trúc dữ liệu | Sets, Sorted Sets (leaderboard) | — |
| Kiến trúc | — | Đa luồng (multi-thread) |
| Chọn khi nào | Cần HA, persistence, backup, cấu trúc dữ liệu phong phú | Cache đơn giản, đa luồng, chấp nhận mất dữ liệu |

**ElastiCache vs MemoryDB:**

| Tiêu chí | ElastiCache (Redis/Valkey) | MemoryDB |
|---|---|---|
| Vai trò | Cache trước một database chính | Primary database in-memory |
| Durability | Có thể mất dữ liệu gần nhất khi failover (replication bất đồng bộ) | Bền: ghi được xác nhận sau khi lưu vào transaction log Multi-AZ |
| Độ trễ ghi | Micro giây | Chậm hơn một chút (vài ms) do ghi transaction log; đọc vẫn micro giây |
| Chọn khi nào | Tăng tốc đọc, lưu session, giảm tải DB | Cần tốc độ Redis và không được mất dữ liệu, không muốn duy trì cache + DB riêng |

**Lazy Loading vs Write-Through:**

| Tiêu chí | Lazy Loading (Cache-Aside) | Write-Through |
|---|---|---|
| Khi nào ghi vào cache | Khi đọc và bị cache miss | Khi ghi vào DB |
| Penalty | Read penalty (3 lượt gọi khi miss) | Write penalty (2 lượt gọi mỗi lần ghi) |
| Dữ liệu cũ | Có thể cũ (stale) | Không cũ |
| Dữ liệu thiếu | Không (miss thì đọc DB) | Thiếu dữ liệu chưa từng được ghi |
| Bộ nhớ | Chỉ dữ liệu được dùng → hợp cache nhỏ | Cache churn, tốn bộ nhớ |
| Cache hỏng | Không nghiêm trọng (warm up lại) | Mất dữ liệu cache cho tới lần ghi tiếp |

**Bẫy thi RDS/ElastiCache:**
- **Read Replica ≠ Multi-AZ:** đây là chủ đề cực kỳ quan trọng. "Database cần HA khi mất AZ" → Multi-AZ; "giảm tải đọc / analytics làm chậm production" → Read Replica. Đáp án gây nhiễu hay gặp: bật Multi-AZ rồi chạy analytics trên standby — sai vì standby không phục vụ traffic; hoặc chạy analytics vào ban đêm — sai vì đề nói query chạy bất kỳ lúc nào.
- **Đọc không thấy ngay dữ liệu vừa ghi:** do replication bất đồng bộ của Read Replica (eventually consistent), không phải bug. Nếu cần đọc ngay sau khi ghi (read-after-write, ví dụ vừa sửa bài đăng), request đó nên đọc từ primary.
- **"Không cần đổi connection string" → Multi-AZ** (một DNS name); Read Replica có endpoint riêng nên phải sửa connection string.
- **Multi-AZ DB cluster là ngoại lệ:** 1 writer + 2 standby đọc được — đừng áp dụng "standby không đọc được" một cách tuyệt đối khi đề nhắc tới DB cluster, nhưng khi đề nói "Multi-AZ" chung chung thì hiểu là DB instance truyền thống.
- **DR cross-region:** Multi-AZ chỉ bảo vệ khỏi sự cố một AZ, không chống được sự cố cả region. DR cross-region, đọc + ghi, HA ở region đích → **Read Replica ở region khác + bật Multi-AZ cho replica**, rồi promote replica khi region chính gặp sự cố. RDS không có tuỳ chọn "Multi-Region" cho database chính.
- **Aurora tương thích với gì:** chỉ MySQL và PostgreSQL. Đáp án Oracle, MariaDB, SQL Server là gây nhiễu. Tương tự, MongoDB không phải engine RDS (trên AWS có DocumentDB tương thích MongoDB).
- **Mã hoá:** at-rest phải chọn lúc tạo; không thể bật mã hoá trực tiếp cho instance đã tạo, cũng không thể tạo Read Replica mã hoá từ master không mã hoá. Quy trình đúng: snapshot → copy snapshot có bật mã hoá → restore.
- **IAM Database Authentication:** hỗ trợ MySQL, MariaDB, PostgreSQL (và Aurora MySQL/PostgreSQL); **Oracle không hỗ trợ**. Tình huống "nhiều developer có IAM user, không muốn tạo DB user cho từng người" → IAM DB Auth, không phải Cognito (Cognito dành cho người dùng cuối của ứng dụng).
- **Point in Time Restore tạo instance mới**, không ghi đè instance cũ; storage autoscaling chỉ tăng, không tự giảm.
- **RDS Proxy:** "quá nhiều kết nối / Lambda làm cạn kết nối DB", "giảm failover tới 66%", "ép IAM auth + Secrets Manager" → RDS Proxy. RDS Proxy không public, chỉ trong VPC; không cần đổi code ngoài endpoint.
- **ElastiCache và session:** user phải đăng nhập lại liên tục khi đi qua ALB + ASG mà không muốn sticky session (vì sợ một số EC2 quá tải) → lưu session trong ElastiCache, không phải RDS (RDS lưu được nhưng không nhanh bằng) và không phải EBS volume dùng chung.
- **Lazy Loading vs Write-Through trong pseudocode:** `get_` + `if record is None: db.query → cache.set` = Lazy Loading; `save_` + `db.query update → cache.set` = Write-Through. "Cache nhỏ, chỉ muốn dữ liệu được yêu cầu mới vào cache" → Lazy Loading; "đọc phải nhanh nhất cho mọi user, ghi được phép chậm" → Write-Through.
- **Eviction vs Invalidation:** item bị loại khỏi cache do bộ nhớ đầy (LRU) trước khi hết TTL → **eviction**, xử lý bằng scale up/scale out; invalidation là ứng dụng chủ động xoá/cập nhật vì dữ liệu gốc đã đổi. Đừng chọn scale down/scale in khi eviction tăng.
- **MemoryDB vs ElastiCache:** cần database in-memory tương thích Redis, bền vững, Multi-AZ → MemoryDB; chỉ cần cache → ElastiCache.
- **Redis HA:** muốn ElastiCache Redis có HA → bật Multi-AZ (với replica và auto-failover); Lazy Loading là chiến lược cache trong code, không liên quan đến HA.

**Liên hệ thực tế — RDS/ElastiCache:**
1. **Database cần HA khi mất AZ, đồng thời giảm tải đọc cho production:** Bật Multi-AZ cho RDS chính để khi mất một AZ, RDS tự failover sang standby mà ứng dụng không cần đổi connection string (một DNS name duy nhất). Song song, tạo Read Replica (cùng region thì replication miễn phí) và cho ứng dụng reporting/analytics đọc từ replica, không chạy trực tiếp trên DB production. Nếu cần DR sang region khác thì tạo Read Replica cross-region (mất phí replication) và bật Multi-AZ cho replica đó, để khi region chính gặp sự cố có thể promote replica thành DB độc lập, đọc ghi đầy đủ. Không dùng Multi-AZ để scale đọc vì standby không phục vụ traffic.
2. **Web app đọc nhiều, user hay bị đăng xuất, và Lambda làm cạn kết nối DB:** Đặt ElastiCache (Redis/Valkey) trước RDS theo chiến lược Lazy Loading: request đọc hỏi cache trước, miss thì đọc RDS rồi ghi vào cache; đặt TTL hợp lý để chống dữ liệu cũ vĩnh viễn. Lưu user session vào ElastiCache thay vì trên từng EC2, để request tới instance nào cũng đọc được session — ứng dụng trở thành stateless, không cần sticky session trên ALB. Với Lambda (hàng trăm, hàng nghìn bản chạy đồng thời), cho Lambda kết nối qua RDS Proxy trong cùng VPC để gom kết nối, giảm timeout và giảm failover time tới 66%; nếu dữ liệu trong cache phải luôn mới và đọc phải nhanh nhất cho mọi user (ghi được phép chậm) thì bổ sung Write-Through trên nền Lazy Loading.

### N.5. VPC Fundamentals

- **VPC:** mạng riêng trong AWS Cloud để triển khai tài nguyên. VPC là tài nguyên **cấp Region**. **Subnet** chia nhỏ mạng trong VPC và được định nghĩa ở **cấp Availability Zone**.
- **Public subnet vs Private subnet:**
  - **Public subnet:** có route trực tiếp tới Internet Gateway (IGW) và instance có public IP thì truy cập được Internet và được truy cập từ Internet. Thường đặt load balancer, NAT Gateway, bastion host.
  - **Private subnet:** không truy cập được từ Internet. Thường đặt ứng dụng, database để bảo mật hơn. Muốn ra Internet thì đi qua NAT.
- **Route table:** định nghĩa cách traffic đi ra Internet và giữa các subnet. Chính route tới IGW là điều làm một subnet trở thành "public".
- **Internet Gateway (IGW):** gắn vào VPC, giúp các instance trong public subnet kết nối Internet.
- **NAT Gateway / NAT Instance:** giải quyết bài toán EC2 trong private subnet cần **ra Internet** (ví dụ tải bản cập nhật) nhưng **không cho Internet truy cập vào**. Đặt NAT trong public subnet; private subnet có route tới NAT; NAT có route tới IGW.
  - **NAT Gateway:** AWS-managed, tự động mở rộng, ít quản trị nhất.
  - **NAT Instance:** tự quản lý (là một EC2), tự lo scaling.
- **Default VPC:** AWS tạo sẵn 1 VPC mặc định ở mỗi region, chỉ có public subnet (mỗi AZ một public subnet), không có private subnet.
- **Security Group (SG) vs Network ACL (NACL):**

| | Security Group | NACL |
|---|---|---|
| Phạm vi | Instance / ENI | Subnet |
| Loại rule | Chỉ Allow | Allow và Deny |
| Trạng thái | Stateful (phản hồi tự động được phép) | Stateless (phản hồi phải cho phép tường minh) |
| Đánh giá rule | Xét tất cả rule trước khi quyết định | Theo thứ tự số rule, khớp rule nào dừng ở đó |
| Áp dụng | Chỉ instance được gắn SG | Tự động cho mọi instance trong subnet |
| Tham chiếu | Được tham chiếu SG khác | Chỉ địa chỉ IP |

- **VPC Flow Logs:** ghi lại thông tin về toàn bộ IP traffic đi qua VPC, subnet hoặc ENI, gồm cả traffic ACCEPT và REJECT. Dùng để giám sát và xử lý sự cố kết nối (ví dụ subnet không ra được Internet, hai subnet không nói chuyện được với nhau). Đích gửi log: Amazon S3, CloudWatch Logs, Kinesis Data Firehose (ghi chú bổ sung: đã đổi tên thành Amazon Data Firehose từ 02/2024). Flow Logs không ghi nội dung gói tin.
- **VPC Peering:** kết nối 2 VPC (khác account hoặc khác region đều được) bằng mạng private của AWS, khiến chúng hoạt động như cùng một mạng. Điều kiện: **CIDR của 2 VPC không được chồng lấn**. **Không có tính bắc cầu (non-transitive):** A–B và A–C thì B và C vẫn không nói chuyện được với nhau nếu không có peering B–C riêng.
- **VPC Endpoints:** cho phép kết nối tới dịch vụ AWS qua mạng private thay vì Internet công cộng, nên EC2 trong private subnet (không có Internet) vẫn gọi được dịch vụ AWS.
  - **Gateway Endpoint:** chỉ cho **S3 và DynamoDB**; cơ chế là target trong route table.
  - **Interface Endpoint:** cho hầu hết các dịch vụ còn lại (ví dụ CloudWatch); cơ chế là một ENI có IP private trong subnet (PrivateLink).
- **Kết nối on-premises với VPC:**
  - **Site-to-Site VPN:** VPN appliance on-premises ↔ AWS, đi qua **Internet công cộng**, **tự động mã hoá**, triển khai nhanh.
  - **Direct Connect (DX):** đường truyền vật lý riêng tới AWS, đi qua **mạng private, không qua Internet**, ổn định và nhanh, nhưng mất thời gian thiết lập dài.
- **Kiến trúc 3 tầng (three-tier):** ELB ở public subnet (multi-AZ) → EC2 trong Auto Scaling Group ở private subnet → RDS và ElastiCache ở data subnet (private sâu hơn). ElastiCache cache dữ liệu RDS và lưu session của web app. Chỉ cho ALB truy cập EC2 bằng cách đặt inbound rule của SG EC2 có source là SG của ALB.
- **LAMP stack:** Linux (HĐH của EC2), Apache (web server), MySQL (database, ví dụ MySQL trên RDS), PHP (logic ứng dụng). **WordPress trên AWS:** cùng kiến trúc 3 tầng, dùng **Amazon EFS** để nhiều EC2 ở nhiều AZ cùng chia sẻ file upload (EFS tạo ENI ở mỗi AZ).
- **Con số VPC:** DVA hỏi VPC ở mức khái niệm, thường chỉ khoảng **1–3 câu**. VPC Peering **không bắc cầu**: 3 VPC muốn kết nối đầy đủ với nhau cần **3 kết nối** (A–B, A–C, B–C). Direct Connect mất **ít nhất 1 tháng** để thiết lập; Site-to-Site VPN thiết lập trong **vài phút**. Gateway Endpoint: chỉ **2 dịch vụ — S3 và DynamoDB**. Các con số sau là **bổ sung** trong ghi chú (phần "Kiến thức thực tế", ngoài video): CIDR của VPC từ **/16 đến /28**; AWS **giữ lại 5 IP** trong mỗi subnet; default VPC dùng CIDR `172.31.0.0/16`; NAT Gateway khoảng **0,045 USD/giờ** cộng khoảng **0,045 USD/GB** phí xử lý dữ liệu (ở `us-east-1`); public IPv4 bị tính phí từ 02/2024 khoảng **0,005 USD/giờ/IP**; Gateway Endpoint **miễn phí**, Interface Endpoint tính phí theo giờ mỗi AZ + theo GB.

**Bẫy thi VPC:**
- **Gắn IGW rồi mà EC2 vẫn không ra Internet:** kiểm tra route table (thiếu `0.0.0.0/0 → IGW`), EC2 không có public IP, NACL chặn chiều ra. **Không phải** do inbound rule của Security Group — vì SG stateful nên traffic phản hồi tự động được phép quay lại. Đây là đáp án gây nhiễu kinh điển trong quiz của chương.
- **"Ít công quản trị nhất + mở rộng liền mạch" cho private subnet ra Internet → NAT Gateway**, không phải NAT Instance (dùng được nhưng phải tự cấu hình/quản trị/không tự scale) và không phải Egress-Only Internet Gateway (chỉ dành cho IPv6).
- **Chặn một IP/dải IP cụ thể → dùng NACL (có rule DENY)**, vì SG chỉ có rule Allow nên không chặn được.
- **NACL stateless gây lỗi khó thấy:** cho phép HTTP vào (port 80) nhưng quên cho phép chiều ra tới cổng tạm (ephemeral ports 1024–65535) thì traffic phản hồi bị chặn. Mẹo Flow Logs: inbound ACCEPT nhưng outbound REJECT → thường do NACL, không phải SG.
- **VPC Peering không bắc cầu:** đề hỏi 3 VPC kết nối đầy đủ thì đáp án là 3 peering, không phải 2. Khi số VPC lớn, giải pháp đúng là Transit Gateway (hub-and-spoke), nhưng đó là kiến thức mở rộng ngoài video.
- **Gateway Endpoint chỉ có S3 và DynamoDB:** các đáp án ghép SQS, CloudWatch… với Gateway Endpoint đều sai; các dịch vụ khác dùng Interface Endpoint.
- **"Thu thập thông tin về IP traffic trong VPC" → VPC Flow Logs**, không phải "CloudWatch Traffic Logs" (không tồn tại) và không phải VPC Traffic Mirroring (cái này sao chép nội dung traffic, không phải ghi log thông tin traffic).
- **"Kết nối chuyên dụng, private, ổn định, không qua Internet" → Direct Connect**, không phải Site-to-Site VPN (đi qua Internet) hay PrivateLink (dùng cho truy cập private tới dịch vụ AWS, không phải nối on-premises).
- **Subnet "public" chỉ có route tới IGW là chưa đủ:** instance còn cần public IP/Elastic IP mới ra được Internet.
- **Chỉ cho ALB truy cập EC2:** inbound rule của SG EC2 có source là **SG của ALB**, không phải `0.0.0.0/0` (mở cho cả Internet) hay CIDR của VPC (cho phép mọi tài nguyên trong VPC).

**Liên hệ thực tế — VPC:**
1. **App private cần ra Internet nhưng không cho Internet vào:** đặt EC2 ứng dụng trong **private subnet**, đặt **NAT Gateway trong public subnet**, route `0.0.0.0/0` của private subnet trỏ tới NAT Gateway. EC2 ra Internet được (tải bản cập nhật, gọi API bên ngoài) mà vẫn không bị truy cập từ Internet. Nếu app chỉ cần gọi dịch vụ AWS (ví dụ S3, DynamoDB) thì dùng **Gateway Endpoint (miễn phí)** thay vì đi qua NAT Gateway để tiết kiệm phí xử lý dữ liệu; các dịch vụ khác dùng Interface Endpoint.
2. **Web app 3 tầng chuẩn cho kỳ thi:** Route 53 trỏ tới **ELB ở public subnet** (multi-AZ) → **EC2 trong Auto Scaling Group ở private subnet**, SG của EC2 chỉ cho phép traffic từ SG của ALB → **RDS/ElastiCache ở data subnet**. Database và cache không bao giờ chạm tới Internet; EC2 trong private subnet cần ra Internet thì qua NAT Gateway, cần gọi dịch vụ AWS thì qua VPC Endpoint. Nếu mở rộng sang nhiều VPC, nhớ VPC Peering không bắc cầu nên mỗi cặp VPC cần một peering riêng.

### N.6. Route 53

- **DNS:** hệ thống dịch hostname thân thiện với con người thành địa chỉ IP. Cấu trúc phân cấp: Root → TLD (`.com`, `.org`…) → SLD (`example.com`) → subdomain → FQDN (tên miền đầy đủ, ví dụ `api.www.example.com`).
- **Amazon Route 53:** dịch vụ DNS authoritative (có thẩm quyền) được quản lý hoàn toàn, đồng thời là Domain Registrar và hỗ trợ health check. Tên "53" xuất phát từ cổng 53 của DNS.
- **Hosted zone:** container chứa các record của một domain và các subdomain của nó.
  - **Public hosted zone:** cho domain public, bất kỳ ai trên Internet cũng truy vấn được.
  - **Private hosted zone:** chỉ truy vấn được từ bên trong VPC đã liên kết, dùng cho tên miền nội bộ (ví dụ `api.example.internal` → IP private).
- **Các record phải nhớ:**
  - **A:** hostname → IPv4.
  - **AAAA:** hostname → IPv6.
  - **CNAME:** hostname → hostname khác; **không** tạo được cho zone apex (`example.com`), chỉ dùng cho subdomain như `www.example.com`.
  - **NS:** name server của hosted zone, quyết định traffic tới domain được định tuyến thế nào.
  - **Alias:** mở rộng riêng của Route 53, loại A hoặc AAAA, trỏ tới tài nguyên AWS (ELB, CloudFront, API Gateway, Elastic Beanstalk, S3 website, VPC Interface Endpoint, Global Accelerator, record khác trong cùng hosted zone). **Không** Alias tới DNS name của EC2.
- **TTL (Time To Live):** thời gian resolver/client cache kết quả DNS. Trong thời gian TTL, client không hỏi lại DNS. TTL bắt buộc với mọi record, **trừ Alias** (Route 53 tự đặt, không đặt được).
- **Routing policy:** quyết định cách Route 53 trả lời truy vấn DNS. Lưu ý: DNS không định tuyến traffic, chỉ trả lời câu hỏi; client tự kết nối tới endpoint nhận được.
  - **Simple:** thường tới một tài nguyên; một record có thể chứa nhiều giá trị, Route 53 trả về tất cả và client chọn ngẫu nhiên; **không gắn được health check**; Alias với Simple chỉ được một đích AWS.
  - **Weighted:** chia tỷ lệ câu trả lời DNS theo trọng số: `weight của record / tổng weight`. Dùng cho cân bằng tải giữa các region và thử phiên bản mới với một lượng nhỏ traffic (canary).
  - **Latency-based:** chuyển tới tài nguyên có độ trễ thấp nhất đối với người dùng, dựa trên kết nối giữa người dùng và AWS Region gắn với record.
  - **Failover (Active-Passive):** một record Primary và một record Secondary. Primary **bắt buộc gắn health check**; khi primary unhealthy, Route 53 tự động trả về secondary.
  - **Geolocation:** định tuyến theo **vị trí thực của người dùng** (châu lục, quốc gia, bang của Mỹ); vị trí cụ thể nhất được ưu tiên khi chồng lấn; nên tạo record Default.
  - **Geoproximity:** định tuyến theo vị trí địa lý của cả người dùng và tài nguyên, dùng tham số **bias** để dịch chuyển traffic; tài nguyên AWS chỉ định bằng region, tài nguyên ngoài AWS chỉ định bằng vĩ độ/kinh độ.
  - **IP-based:** định tuyến theo địa chỉ IP của client, dựa trên danh sách CIDR (CIDR collection) gắn với từng location/endpoint.
  - **Multi-Value Answer:** trả về nhiều giá trị, **gắn được health check** nên chỉ trả về các giá trị healthy; là cân bằng tải phía client, **không thay thế ELB**.
- **Health check:** dùng để kiểm tra tài nguyên và phục vụ DNS failover. Có 3 loại:
  - **Endpoint:** giám sát endpoint public qua HTTP, HTTPS hoặc TCP.
  - **Calculated:** kết hợp kết quả nhiều health check khác (điều kiện OR, AND, NOT).
  - **CloudWatch Alarm:** giám sát trạng thái của một CloudWatch Alarm — cách dùng cho **tài nguyên private** (health checker trên Internet không truy cập được endpoint private).
- **Domain mua ở registrar bên thứ ba:** tạo Public Hosted Zone trong Route 53, lấy 4 name server, rồi cập nhật custom name server ở registrar bên thứ ba (ví dụ GoDaddy) trỏ về Route 53. Không cần domain transfer nếu chỉ đổi DNS service.
- **Con số Route 53:** Route 53 là dịch vụ AWS duy nhất có **SLA 100% availability**. **0,50 USD/tháng cho mỗi hosted zone**; đăng ký domain tối thiểu khoảng **12 USD/năm** (theo video; ghi chú bổ sung: giá domain thay đổi theo TLD, `.com` hiện cao hơn mức này). TTL ví dụ trong ghi chú: 300 giây (mặc định console), 60 giây, 120 giây; TTL cao (ví dụ 24 giờ) làm client dùng record cũ lâu. Alias: truy vấn **miễn phí**, không đặt TTL. Weighted: weight **0** → ngừng gửi traffic tới record đó; **tất cả record đều weight = 0** → trả về tất cả với trọng số bằng nhau. Health check endpoint: khoảng **15 health checker toàn cầu**; coi là healthy khi **> 18%** health checker báo healthy; chỉ pass khi nhận mã **2xx hoặc 3xx**; kiểm tra string matching trong **5.120 byte đầu tiên** của response; interval **30 giây (standard)** hoặc **10 giây (fast, đắt hơn)**. Calculated health check: tối đa **256 child health check**. Multi-Value: tối đa **8 record healthy** cho mỗi truy vấn. Geoproximity bias: mở rộng vùng **+1 đến +99**, thu hẹp vùng **−1 đến −99**. Failover: chỉ có **một primary và một secondary**.

**CNAME vs Alias:**

| | CNAME | Alias |
|---|---|---|
| Trỏ tới | Bất kỳ hostname nào | Chỉ tài nguyên AWS |
| Zone apex | Không | Có |
| Loại record | CNAME | A hoặc AAAA |
| Chuẩn DNS | Chuẩn DNS | Mở rộng riêng của Route 53 |
| TTL | Tự đặt | Không đặt được |
| Phí truy vấn | Có | Miễn phí |
| Health check | Không | Có (Evaluate target health) |

**Simple (nhiều giá trị) vs Multi-Value:**

| | Simple | Multi-Value |
|---|---|---|
| Health check | Không | Có |
| Có thể trả IP chết | Có | Không (chỉ trả record healthy) |
| Số giá trị trả về | Tất cả | Tối đa 8 healthy |

**Bẫy thi Route 53:**
- **Đổi record nhưng người dùng vẫn tới server cũ → do TTL/cache**, không phải do Route 53 chưa cập nhật. Chiến lược đúng: hạ TTL xuống thấp trước, chờ hết TTL cũ, rồi mới đổi record.
- **Zone apex trỏ tới ELB/CloudFront → phải dùng Alias, không dùng CNAME.** Đề thường cho đáp án CNAME gây nhiễu; CNAME ở apex bị lỗi.
- **Latency ≠ Geolocation:** Latency dựa trên độ trễ mạng; Geolocation dựa trên vị trí địa lý. "Giảm thời gian phản hồi" → Latency; "bản địa hoá / giới hạn theo quốc gia" → Geolocation.
- **Simple có nhiều IP không có nghĩa là có failover:** nếu một server chết, client vẫn có thể nhận IP đó. Muốn loại bỏ IP chết cần Multi-Value (có health check) hoặc Failover.
- **Không có health check "giám sát SQS queue":** chỉ có Endpoint, Calculated và CloudWatch Alarm. Muốn giám sát gián tiếp tài nguyên khác thì tạo CloudWatch Alarm trên metric của nó rồi dùng health check loại CloudWatch Alarm.
- **Tài nguyên private không dùng health check endpoint trực tiếp** (health checker ở ngoài Internet, không vào được VPC) → dùng CloudWatch Alarm.
- **Geolocation không có record Default:** vị trí không khớp sẽ nhận "no answer" — đây chính là cách chặn theo quốc gia ở mức DNS, nhưng không phải là chặn chắc chắn (người dùng có thể dùng VPN hoặc truy cập thẳng IP).
- **Domain bên thứ ba:** đáp án đúng là tạo Public Hosted Zone + cập nhật NS **ở registrar bên thứ ba**; các đáp án Private Hosted Zone, sửa NS trong Route 53, hoặc bắt buộc domain transfer đều sai.
- **DNS không định tuyến traffic:** đừng nhầm routing policy với load balancer; DNS chỉ trả lời, client tự kết nối.

**Liên hệ thực tế — Route 53:**
1. **Web app đa region, ưu tiên độ trễ thấp và tự failover:** chạy app ở nhiều region, dùng **Latency-based routing kết hợp health check** (hoặc Failover nếu mô hình active-passive/DR). Người dùng được trả về region có latency thấp nhất với mình; khi một region unhealthy, Route 53 không trả về region đó nữa. Nếu yêu cầu là "chỉ dùng region dự phòng khi region chính chết" thì chọn **Failover** thay vì Latency.
2. **Blue/green deployment (chuyển dần traffic sang phiên bản mới):** dùng **Weighted routing**, ví dụ weight 95 cho môi trường cũ và 5 cho môi trường mới, theo dõi metric trên CloudWatch, rồi tăng dần và cuối cùng đặt weight 0 cho môi trường cũ để ngừng gửi traffic. Đây là use case đặc trưng của Weighted; đừng chọn Simple (không chia tỷ lệ) hay Failover (chỉ active-passive khi lỗi).

### N.7. Các dịch vụ khác (mức nhận diện, thường chỉ 1–2 câu)

- **Amazon SES (Simple Email Service):** **gửi email** (và nhận email) qua **SMTP interface** hoặc **AWS SDK**. Nhận email: tích hợp **S3** (lưu thư), **SNS** (thông báo), **Lambda** (xử lý). Quyền kiểm soát bằng IAM. Tài khoản mới ở chế độ **sandbox** (chỉ gửi tới địa chỉ/domain đã xác minh, có giới hạn) → phải **xin production access**. Phải xác minh identity, cấu hình DKIM/SPF/DMARC; theo dõi bounce/complaint qua SNS.
- **Amazon OpenSearch Service** (kế nhiệm Amazon Elasticsearch Service): **tìm kiếm full-text / khớp một phần (partial match) trên mọi field** — điều DynamoDB không làm được (DynamoDB chỉ truy vấn theo primary key hoặc index). Thường làm **bổ trợ cho database khác** để cung cấp search; ngoài ra làm analytics. Hai chế độ: **Managed cluster** (provision instance) và **Serverless** (AWS lo scaling). Bảo mật: Cognito, IAM, mã hoá at rest và in-flight. **OpenSearch Dashboards** để trực quan hoá.
  - Kiến trúc phổ biến: **DynamoDB → DynamoDB Stream → Lambda → OpenSearch** (app search trên OpenSearch lấy item ID, rồi gọi DynamoDB lấy item đầy đủ; DynamoDB vẫn là nguồn chính).
  - CloudWatch Logs → OpenSearch: qua **Subscription Filter → Lambda** = **real time**; qua **Subscription Filter → Kinesis Data Firehose** = **near real time**; Kinesis Data Streams → Lambda → OpenSearch = real time; Kinesis Data Streams → Firehose (transform bằng Lambda tuỳ chọn) → OpenSearch = near real time.
  - Cập nhật (bổ sung trong ghi chú): hỗ trợ **SQL và PPL** qua plugin; **Kinesis Data Firehose đổi tên thành Amazon Data Firehose**; có **OpenSearch Ingestion** và **zero-ETL DynamoDB → OpenSearch** thay cho Lambda tự viết.
- **Amazon Athena:** truy vấn **serverless** bằng **SQL chuẩn** trên dữ liệu **nằm trong S3** (không cần di chuyển dữ liệu), xây dựng trên engine **Presto** (engine v3 dựa trên **Trino**). Định dạng: CSV, JSON, ORC, Avro, Parquet… **Trả tiền theo TB dữ liệu quét**. Thường dùng với **QuickSight** làm dashboard. Use case: ad hoc query, BI, **phân tích log** (VPC Flow Logs, ELB logs, CloudTrail, S3 access logs).
  - Tối ưu hiệu năng/chi phí: **định dạng columnar** (Parquet/ORC — dùng Glue ETL chuyển CSV → Parquet), **nén** (gzip, Snappy, ZSTD…), **partition** dữ liệu theo cột hay lọc (ví dụ `s3://flights/parquet/year=1991/month=1/day=1/`), **file lớn ≥ 128 MB** (nhiều file nhỏ gây overhead).
  - **Federated Query:** truy vấn dữ liệu **ngoài S3** (RDS, DynamoDB, ElastiCache, DocumentDB, Redshift, Aurora, CloudWatch Logs, on-premises…) bằng **Data Source Connector** — thực chất là **Lambda function** (mỗi nguồn một connector); có thể JOIN giữa các nguồn, kết quả lưu vào S3.
  - Athena: khoảng **5 USD / TB quét** (us-east-1), làm tròn lên, tối thiểu **10 MB mỗi query**; DDL và query lỗi không tính tiền.
- **Amazon MSK (Managed Streaming for Apache Kafka):** **Kafka được quản lý hoàn toàn**; MSK tạo/quản lý **broker nodes và Zookeeper nodes** (bản Kafka mới dùng **KRaft**, không cần ZooKeeper). Cluster trong **VPC**, trải **tối đa 3 AZ**; dữ liệu lưu trên **EBS**, **bao lâu cũng được**. Có **MSK Serverless** (không provision server, tự scale). Producer ghi vào **topic** (replicate sang broker khác); consumer **poll** từ topic. Consumer: **Managed Service for Apache Flink**, **Glue streaming ETL**, **Lambda (MSK làm event source)**, consumer tự viết (EC2/ECS/EKS).
- **Kinesis Data Streams vs Amazon MSK:**

| | Kinesis Data Streams | Amazon MSK |
|---|---|---|
| Kích thước message | **1 MB** (theo video) | Mặc định 1 MB, **cấu hình lớn hơn được** (ví dụ 10 MB) |
| Đơn vị | Data Stream + **Shard** | Kafka **Topic** + **Partition** |
| Scale | **Shard splitting** (tăng), **merging** (giảm) | **Chỉ thêm partition**, **không xoá được** |
| Mã hoá in-flight | TLS | **Plaintext hoặc TLS** |
| Mã hoá at rest | Có | Có |
| Lưu trữ | Theo retention (tối đa 365 ngày) | **Bao lâu cũng được** (trả tiền EBS) |

- **Bẫy thi Other Services:**
  - **SES = email.** Không chọn SES cho hàng đợi (SQS), pub/sub (SNS), streaming (Kinesis).
  - Website game dùng DynamoDB, muốn tìm game thủ theo tên **khớp một phần** → **OpenSearch** (DynamoDB Streams → Lambda → OpenSearch), không phải DynamoDB.
  - Phân tích log trong S3 bằng SQL serverless, không quản lý server → **Athena** (không phải RDS, EMR hay OpenSearch managed cluster).
  - Chi phí Athena tăng vì quét hàng TB file CSV nhỏ → chuyển sang **Parquet + nén + partition + gộp file lớn** (không phải chia thêm file nhỏ, không phải tăng DPU).
  - MSK: topic **chỉ thêm được partition, không xoá**; MSK hỗ trợ plaintext **hoặc TLS** (không phải chỉ plaintext); **Lambda hỗ trợ MSK làm event source**.
  - CloudWatch Logs → OpenSearch **real time** → Subscription Filter → **Lambda**; qua Firehose là **near real time** (Firehose có buffer).
- **Liên hệ thực tế — Other Services:**
  1. **Website game dùng DynamoDB, người dùng muốn tìm game thủ khác theo tên, khớp một phần nếu được:** dùng **OpenSearch** với kiến trúc DynamoDB Streams → Lambda → OpenSearch; app search trên OpenSearch lấy ID rồi gọi DynamoDB lấy item đầy đủ. Nếu chỉ cần truy vấn theo primary key thì DynamoDB là đủ, không cần OpenSearch.
  2. **Đội phân tích cần chạy truy vấn SQL ad hoc trên log CloudTrail và ALB lưu trong S3, không muốn quản lý server nào, sau đó làm dashboard:** dùng **Athena** (serverless SQL trực tiếp trên S3, trả theo dữ liệu quét) + **QuickSight** làm dashboard; tối ưu bằng cách chuyển log sang Parquet, nén, partition theo ngày để giảm chi phí quét.

### N.8. Region, AZ và các khái niệm toàn cục

- **Region:** một cụm data center tại một khu vực địa lý (ví dụ Ohio, Singapore, Sydney, Tokyo), có tên/mã như `us-east-1`, `eu-west-3`. Các region nối với nhau bằng mạng riêng của AWS.
- **Availability Zone (AZ):** một region có nhiều AZ; mỗi AZ gồm một hoặc nhiều data center rời rạc, có nguồn điện, mạng, kết nối dự phòng. Các AZ cách ly với nhau để sự cố (thiên tai, mất điện) ở một AZ không lan sang AZ khác. Các AZ trong cùng region nối với nhau bằng mạng băng thông cao, độ trễ cực thấp.
- **Data center:** thành phần vật lý trong AZ (AWS không công bố mỗi AZ có bao nhiêu data center).
- **Edge Location / Point of Presence (PoP):** điểm phân phối nội dung tới người dùng với độ trễ thấp nhất, dùng cho CloudFront, Route 53…
- **4 tiêu chí chọn Region:** Compliance (tuân thủ pháp lý, data governance) — Latency (độ trễ, đặt ứng dụng gần người dùng) — tính sẵn có của dịch vụ — Pricing (giá khác nhau giữa các region).
- **Dịch vụ global:** IAM, Route 53, CloudFront, WAF — không cần chọn region, ở region nào cũng thấy cùng một giao diện.
- **Dịch vụ region-scoped (đa số):** EC2, Elastic Beanstalk, Lambda, Rekognition… Tài nguyên tạo ở region này không hiện ở region khác; dùng dịch vụ ở region khác giống như bắt đầu dùng lại từ đầu.
- **AZ mỗi region:** thường là 3, tối thiểu 3, tối đa 6.
- **Edge Location / PoP (theo video):** hơn 400 PoP ở khoảng 90 thành phố, 40 quốc gia.
- **Ví dụ region Sydney:** mã `ap-southeast-2`, có các AZ `ap-southeast-2a`, `ap-southeast-2b`, `ap-southeast-2c`.
- **Ví dụ region Singapore:** `ap-southeast-1` — region gần Việt Nam, thường được chọn để học và để giảm độ trễ.
- **Multi-session trên Console (phần bổ sung trong ghi chú):** đăng nhập tối đa 5 danh tính (nhiều tài khoản/role) cùng lúc trong một trình duyệt.
- **Tổng số region / AZ / PoP hiện tại:** không rõ trong ghi chú — ghi chú dặn rõ số liệu trong video đã cũ, số lượng tăng liên tục, cần xem số mới nhất tại trang AWS Global Infrastructure, và đề thi không hỏi con số cụ thể.
- **Thiết kế high availability:** luôn trải tài nguyên quan trọng (EC2 sau ELB, RDS Multi-AZ…) trên ít nhất 2 AZ; một AZ hỏng không được làm sập ứng dụng.
- **Tên AZ không khớp giữa các tài khoản:** tên `us-east-1a` ở tài khoản A có thể là AZ vật lý khác với `us-east-1a` ở tài khoản B (AWS xáo trộn ánh xạ để cân tải). Khi cần khớp AZ giữa nhiều tài khoản, phải dùng AZ ID (ví dụ `use1-az1`).
- **Region opt-in:** các region ra mắt từ 2019 trở đi (ví dụ `ap-east-1` Hong Kong, `me-south-1` Bahrain, `af-south-1` Cape Town, `ap-southeast-3` Jakarta) phải bật trong Account → AWS Regions trước khi dùng.
- **Lỗi kinh điển trong code/CLI:** tạo tài nguyên ở một region rồi đi tìm ở region khác. Trong code/CLI luôn chỉ định region rõ ràng (`--region`, `AWS_REGION`, `region_name=`).
- **Lịch sử AWS:** 2002 ra đời nội bộ tại amazon.com; 2004 dịch vụ công khai đầu tiên là SQS; 2006 ra mắt lại với SQS, S3, EC2.
- **Số liệu thị trường trong video (2023–2024, ghi chú cảnh báo đã cũ):** AWS là Leader trong Gartner Magic Quadrant nhiều năm liền, doanh thu khoảng 90 tỷ USD (2023), chiếm khoảng 31% thị phần (Q1 2024, Microsoft thứ hai với khoảng 25%), hơn 1 triệu người dùng hoạt động.
- **Bẫy:** "Mỗi AZ là đúng một data center" là sai. "Mỗi region có đúng 2 AZ" là sai. "Mọi dịch vụ AWS đều có sẵn ở mọi region" là sai — đây là một trong 4 tiêu chí chọn region; khi không tìm thấy dịch vụ, đáp án đúng là tra Regional Services List rồi đổi sang region có hỗ trợ, không phải mở ticket Support hay tạo tài khoản mới. **EC2 là global là sai:** EC2 là region-scoped. Tạo EC2 ở `eu-west-1` rồi mở console ở region khác sẽ không thấy instance — nguyên nhân khả dĩ nhất là console đang chọn sai region. **S3 là trường hợp dễ nhầm:** console S3 hiện chữ Global và liệt kê bucket của mọi region, nhưng mỗi bucket thuộc về một region cụ thể, và tên bucket phải là duy nhất trên toàn cầu. S3 vẫn là dịch vụ region-scoped về mặt dữ liệu.
- **Tình huống thực tế:**
  1. **Web app cho người dùng Đông Nam Á, hiện chạy ở `us-east-1` và bị phàn nàn về độ trễ, không có ràng buộc pháp lý:** triển khai (hoặc chuyển) ứng dụng sang region gần người dùng, ví dụ `ap-southeast-1` (Singapore), và/hoặc dùng CloudFront qua các edge location để phân phối nội dung. Vì sao: latency phụ thuộc khoảng cách địa lý tới người dùng — tăng kích thước EC2 ở `us-east-1` hay thêm AZ trong `us-east-1` đều không giải quyết được khoảng cách; chuyển sang dịch vụ global cũng không phải đáp án vì bản thân ứng dụng (EC2/Lambda…) vẫn là region-scoped. Đồng thời trải tài nguyên quan trọng trên ít nhất 2 AZ trong region mới để một AZ hỏng không làm sập ứng dụng.
  2. **Công ty Pháp phải đảm bảo dữ liệu khách hàng không rời khỏi lãnh thổ Pháp:** compliance là yếu tố quyết định, phải chọn region Paris (`eu-west-3`), kể cả khi region khác rẻ hơn hoặc có nhiều dịch vụ mới hơn. Vì sao: khi có ràng buộc pháp lý về nơi lưu dữ liệu, compliance là điều kiện bắt buộc, các yếu tố giá, dịch vụ, latency chỉ xét sau khi đã đáp ứng compliance. Trước khi triển khai, vẫn cần tra Regional Services List để chắc chắn các dịch vụ cần dùng có sẵn ở `eu-west-3`; nếu thiếu, phải tìm phương án thay thế trong cùng region thay vì tự ý chuyển dữ liệu sang region khác.

---

## PHẦN 7 — BẢNG TRA NHANH: ĐỀ HỎI GÌ → CHỌN GÌ

> Cách dùng: khi đọc đề, gạch chân từ khóa rồi đối chiếu bảng này trước khi đọc kỹ 4 đáp án.

| Từ khoá trong đề | Gợi ý đáp án |
|---|---|
| "least operational overhead", "serverless" | Lambda, DynamoDB, API Gateway, Fargate, Step Functions |
| "decouple", "buffer", "asynchronous" | SQS (FIFO nếu cần thứ tự / exactly-once) |
| "fan-out" | SNS + nhiều SQS |
| "orchestrate workflow", "visual workflow" | Step Functions |
| "temporary credentials", "cross-account" | STS AssumeRole, IAM Role |
| "rotate credentials automatically" | Secrets Manager |
| "encrypt > 4 KB" | Envelope encryption (`GenerateDataKey`) |
| "trace", "latency giữa các service" | X-Ray |
| "throttling" | Exponential backoff (có jitter) |
| "user sign-up/sign-in" | Cognito User Pools; "temporary AWS credentials cho user" → Identity Pools |
| "infrastructure bằng ngôn ngữ lập trình" | CDK |
| "canary / linear traffic shifting" | CodeDeploy, Lambda alias, API Gateway canary |
| "truy cập trực tiếp S3/DynamoDB từ app mobile" | Cognito Identity Pools + policy variables |
| "đọc ngay sau khi ghi (read-after-write)" | Đọc từ primary (RDS) / strongly consistent (DynamoDB) — không đọc từ Read Replica |
| "HA khi mất AZ" | Multi-AZ (RDS), multi-AZ (ASG, ElastiCache) |
| "giảm tải đọc / analytics" | Read Replica (RDS), DAX (DynamoDB), ElastiCache |
| "quá nhiều kết nối DB / Lambda làm cạn kết nối" | RDS Proxy |
| "tìm kiếm khớp một phần" | OpenSearch |
| "SQL trên dữ liệu trong S3, serverless" | Athena |
| "email số lượng lớn" | SES |
| "chứng chỉ TLS cho ALB/CloudFront/API Gateway" | ACM |
| "PKI nội bộ, chứng chỉ nội bộ" | AWS Private CA |
| "phát hiện PII trong S3" | Macie |
| "feature flag, cấu hình động không deploy lại" | AppConfig |
| "ai đã xóa/cập nhật tài nguyên?" | CloudTrail |
| "log chứa ERROR → báo động" | CloudWatch Metric Filter + Alarm + SNS |
| "mô phỏng hành vi người dùng" | Synthetics Canary |
| "GraphQL managed" | AppSync |
| "điều phối nhiều Lambda thành workflow" | Step Functions |
| "deploy không downtime, rollback nhanh" | Blue/green (Beanstalk/CodeDeploy), immutable, traffic shifting |
| "hạ tầng khai báo ngắn gọn cho serverless" | SAM |
| "test Lambda ở local" | SAM CLI (`sam local invoke/start-api`) + Docker |
| "so sánh thay đổi trước khi deploy IaC" | CloudFormation change set / `cdk diff` |
| "tài nguyên mới ở region mới mà CDK báo lỗi asset" | `cdk bootstrap` cho đúng account/region |
| "file share cho nhiều EC2 ở nhiều AZ" | EFS |
| "ổ đĩa nhanh nhất, chấp nhận mất dữ liệu" | EC2 Instance Store |
| "block storage 1 AZ, 1 instance" | EBS |
| "IP tĩnh để whitelist" | NLB + Elastic IP (có thể đặt ALB làm target) |
| "routing theo path/host" | ALB |
| "firewall bên thứ ba kiểm tra mọi IP packet" | GWLB (GENEVE 6081) |
| "chặn 1 IP cụ thể" | NACL (có DENY) — SG chỉ có Allow |
| "private subnet ra Internet, ít quản trị nhất" | NAT Gateway |
| "kết nối private tới S3/DynamoDB, miễn phí" | Gateway Endpoint |
| "kết nối private tới dịch vụ AWS khác" | Interface Endpoint |
| "kết nối on-premises private, ổn định, không qua Internet" | Direct Connect |
| "kết nối on-premises nhanh, qua Internet, có mã hoá" | Site-to-Site VPN |
| "zone apex trỏ tới ELB/CloudFront" | Route 53 Alias (không dùng CNAME) |
| "chia % traffic thử version mới" | Route 53 Weighted / API Gateway canary / CodeDeploy canary |
| "độ trễ thấp nhất theo vị trí người dùng" | Route 53 Latency-based |
| "giới hạn nội dung theo quốc gia" | Route 53 Geolocation / CloudFront geo restriction |

---

## PHẦN 8 — BẢNG CON SỐ PHẢI NHỚ (ÔN NHANH TRƯỚC NGÀY THI)

| Chủ đề | Con số |
|---|---|
| Đề thi | 65 câu, 130 phút (+30 ESL), đỗ 720/1000, 150 USD, hiệu lực 3 năm |
| Domain | Development 32% – Security 26% – Deployment 24% – Troubleshooting & Optimization 18% |
| Lambda timeout | Mặc định 3s, tối đa 15 phút |
| Lambda memory | 128 MB – 10 GB; 1.769 MB ≈ 1 vCPU; tối đa 6 vCPU |
| Lambda payload | Sync 6 MB; async 256 KB (đề thi) / 1 MB (cập nhật 2025) |
| Lambda concurrency | 1.000/account/region (mặc định) |
| Lambda layers | Tối đa 5/function; zip 50 MB; giải nén 250 MB; image 10 GB |
| API Gateway timeout | 29 giây (REST API mặc định) |
| API Gateway payload | 10 MB |
| API Gateway throttling | 10.000 req/s/account/region (mặc định) |
| DynamoDB item | Tối đa 400 KB |
| DynamoDB WCU | 1 WCU = 1 ghi/s cho item ≤ 1 KB |
| DynamoDB RCU | 1 RCU = 1 strongly read/s hoặc 2 eventually read/s cho item ≤ 4 KB |
| DynamoDB Query/Scan | Tối đa 1 MB/lần |
| DynamoDB LSI / GSI | 5/bảng (chỉ lúc tạo bảng) / 20/bảng (bất kỳ lúc nào, chỉ eventually) |
| DynamoDB Streams | 24 giờ; PITR 35 ngày; TTL epoch giây, xoá trong vài ngày |
| DynamoDB transaction | Tối đa 100 thao tác, 4 MB, tốn gấp đôi RCU/WCU |
| S3 object | Tối đa 5 TB (đề thi); multipart khuyến nghị > 100 MB, bắt buộc > 5 GB |
| S3 hiệu năng | 3.500 PUT / 5.500 GET req/s mỗi prefix |
| S3 Bucket Key | Giảm tới 99% số lần gọi KMS |
| SQS message | 256 KB (đề thi) / 1 MiB (cập nhật 2025); retention tối đa 14 ngày; visibility timeout mặc định 30s, 0–12 giờ; FIFO dedup 5 phút |
| Kinesis record | 1 MB (đề thi) / 10 MB (cập nhật 2025); shard ghi 1 MB/s hoặc 1.000 record/s, đọc 2 MB/s; retention tối đa 365 ngày |
| Step Functions | Standard tối đa 1 năm, exactly-once; Express tối đa 5 phút; payload mỗi state 256 KiB; retry mặc định 3 lần |
| X-Ray | Daemon UDP 2000; sampling mặc định 1 req/s + 5%; annotation tối đa 50/trace; trace giữ 30 ngày |
| CloudTrail | Event history 90 ngày; Data Events và Insights phải bật thêm |
| CloudWatch Logs | Retention mặc định Never expire; export S3 tối đa 12 giờ; subscription filter tối đa 2/log group; metric filter tối đa 3 dimension |
| IAM | 5.000 user, 300 group, 10 group/user, 2 access key/user, 8 MFA/user, managed policy 6.144 ký tự, 5 version customer managed policy |
| STS | AssumeRole mặc định 1 giờ, tối đa 12 giờ; role chaining tối đa 1 giờ |
| KMS | Encrypt/Decrypt trực tiếp tối đa 4 KB; CMK $1/tháng; rotation AWS managed key 1 năm; xoá key 7–30 ngày |
| Parameter Store | Standard 10.000 parameter, 4 KB, miễn phí; Advanced 100.000 parameter, 8 KB, $0,05/parameter/tháng |
| Secrets Manager | $0,40/secret/tháng; secret tối đa 64 KB; recovery window 7–30 ngày |
| Cognito | ID/Access token mặc định 1 giờ; refresh token 30 ngày; email mặc định 50/ngày; custom domain cần ACM ở us-east-1 |
| RDS | Read Replica tối đa 15; backup retention 0–35 ngày; IAM DB Auth token 15 phút; RDS Proxy giảm failover tới 66% |
| Aurora | 6 bản sao trên 3 AZ; ghi cần 4/6, đọc cần 3/6; storage 10 GB – 256 TB; replica lag < 10 ms; failover < 30s; Backtrack tối đa 72 giờ (chỉ Aurora MySQL) |
| ElastiCache Redis | Cluster mode disabled: 1 primary + tối đa 5 read replica |
| EC2 | User Data 16 KB; SG 5/NI, 60+60 rule; RI 1 hoặc 3 năm; Spot thu hồi báo trước 2 phút |
| EBS | gp2 16.000 IOPS tối đa; io2 Block Express 256.000 IOPS, sub-ms; st1 500 MB/s, sc1 250 MB/s; Multi-Attach tối đa 16 instance, cùng AZ, chỉ io1/io2; Snapshot Archive restore 24–72 giờ, lưu tối thiểu 90 ngày; Recycle Bin 1 ngày – 1 năm |
| ELB/ASG | Deregistration delay 1–3.600s, mặc định 300s; cooldown mặc định 300s; sticky duration 1s – 7 ngày; listener rule priority 1–50.000; GWLB GENEVE 6081 |
| VPC | Gateway Endpoint chỉ S3 + DynamoDB; Peering không bắc cầu (3 VPC cần 3 peering); Direct Connect ≥ 1 tháng; Site-to-Site VPN vài phút |
| Route 53 | SLA 100%; hosted zone $0,50/tháng; health check interval 30s (standard) / 10s (fast); Multi-Value tối đa 8 record healthy; Calculated tối đa 256 child |
| CloudFormation | Chỉ Resources là bắt buộc; Parameters không gắn được Condition |
| CodePipeline | Manual approval chờ tối đa 7 ngày |
| CodeBuild | Timeout mặc định 1 giờ, tối đa 36 giờ; buildspec version 0.2 |
| CodeArtifact | 1 external connection/repo; tối đa 10 upstream/repo; token mặc định 12 giờ |
| SES | Sandbox: chỉ gửi tới identity đã xác minh |
| Athena | ~5 USD/TB quét; tối thiểu 10 MB/query; file ≥ 128 MB |

---

## PHẦN 9 — 10 TÌNH HUỐNG TỔNG HỢP (KIẾN TRÚC END-TO-END HAY GẶP TRONG ĐỀ)

### 9.1. Ứng dụng serverless hoàn chỉnh
**Yêu cầu:** web/mobile app, đăng nhập user, API, database, xử lý nền, deploy an toàn.
**Kiến trúc:** Route 53 (Alias) → CloudFront → S3 (web tĩnh, private + OAC) | API Gateway (REST API, Cognito authorizer) → Lambda → DynamoDB (On-Demand, PITR, Streams) | S3 Event → Lambda xử lý ảnh → DynamoDB metadata | SQS (DLQ + redrive) cho tác vụ nền | Step Functions cho workflow phê duyệt | CloudWatch + X-Ray giám sát | SAM/CDK triển khai, CodePipeline CI/CD với manual approval trước prod, CodeDeploy canary cho Lambda.
**Vì sao:** serverless = ít vận hành nhất; Cognito lo xác thực; DynamoDB Streams mở đường cho analytics/search về sau; canary + approval = deploy an toàn.

### 9.2. Hệ thống thương mại điện tử chịu tải Black Friday
**Yêu cầu:** traffic tăng 100 lần trong vài giờ, không mất đơn, không trừ tiền 2 lần.
**Kiến trúc:** CloudFront + ALB → ASG (target tracking CPU 40% + scheduled scaling giờ cao điểm) | Front-end ghi đơn vào SQS Standard (buffer) → back-end ASG poll theo `ApproximateNumberOfMessages` | Đơn cần đúng thứ tự và không trùng → SQS FIFO (`MessageGroupId` = customer ID, `MessageDeduplicationId` = order ID) | SNS + SQS fan-out: một đơn tới kho, giao hàng, kế toán (filter policy theo trạng thái) | RDS Multi-AZ (HA) + Read Replica (báo cáo) + ElastiCache (session, Lazy Loading) + RDS Proxy (gom kết nối).
**Vì sao:** queue hấp thụ spike; FIFO giải quyết đúng thứ tự/exactly-once; fan-out tách các hệ thống con độc lập; Multi-AZ và Read Replica tách HA khỏi scale đọc.

### 9.3. Nền tảng video/ảnh toàn cầu
**Yêu cầu:** upload lớn, phân phối nhanh toàn cầu, chỉ user trả phí mới xem được, tìm kiếm theo metadata.
**Kiến trúc:** S3 (multipart + Transfer Acceleration) → S3 Event → Lambda → DynamoDB (metadata) + OpenSearch (tìm kiếm khớp một phần) | CloudFront (OAC, signed URL/cookie, price classes) → S3 private | Route 53 Latency-based cho API đa region.
**Vì sao:** S3 + CloudFront là combo chuẩn cho nội dung; signed URL/cookie thay cho bucket public; OpenSearch bù điểm yếu "DynamoDB không tìm khớp một phần".

### 9.4. Hệ thống IoT / clickstream real-time
**Yêu cầu:** hàng triệu event/giây, phân tích real-time, lưu trữ dài hạn để phân tích sau.
**Kiến trúc:** Thiết bị → Kinesis Data Streams (partition key = device ID, enhanced fan-out cho consumer riêng) → Managed Service for Apache Flink (phát hiện bất thường, aggregate theo cửa sổ) → Firehose (buffer, convert Parquet, nén) → S3 → Athena + QuickSight phân tích.
**Vì sao:** KDS giữ thứ tự theo shard và replay được; Flink phân tích real-time; Firehose nạp near real-time vào S3; Athena truy vấn không cần server.

### 9.5. App mobile có đăng nhập xã hội và dữ liệu riêng từng user
**Yêu cầu:** đăng nhập Facebook/Google, mỗi user chỉ thấy dữ liệu của mình trên S3/DynamoDB, làm việc offline.
**Kiến trúc:** Cognito User Pools (federation) + Identity Pools (đổi token lấy credentials tạm thời) + policy variables (`${cognito-identity.amazonaws.com:sub}`, `dynamodb:LeadingKeys`) | AppSync (GraphQL, subscriptions real-time, offline sync) + DynamoDB | API Gateway Cognito authorizer cho các API cần backend xử lý.
**Vì sao:** CUP lo đăng nhập, CIP lo quyền truy cập trực tiếp; AppSync thay Cognito Sync đã lỗi thời và thay REST + polling.

### 9.6. Doanh nghiệp có AD on-premises, cần mở rộng lên AWS an toàn
**Yêu cầu:** xác thực nhân viên, kết nối private, tuân thủ, mã hoá.
**Kiến trúc:** Direct Connect (ổn định, private) hoặc Site-to-Site VPN (nhanh, qua Internet có mã hoá) | AWS Managed Microsoft AD + trust với AD on-prem | IAM Identity Center + permission sets cho workforce đa tài khoản | STS AssumeRole cho cross-account | KMS CMK (key policy + `kms:ViaService`) cho mã hoá, Secrets Manager rotation cho mật khẩu DB, SSM Parameter Store cho cấu hình | CloudTrail (audit) + VPC Flow Logs (giám sát mạng).
**Vì sao:** Managed AD + trust là đáp án chuẩn cho "AD trên cloud + trust on-prem"; Identity Center thay IAM user dài hạn; KMS key policy là nguồn quyền chính.

### 9.7. Pipeline CI/CD cho team vừa và nhỏ
**Yêu cầu:** push code → test → deploy dev tự động → phê duyệt tay → deploy prod, rollback được.
**Kiến trúc:** CodeCommit (hoặc GitHub qua CodeConnections) → CodePipeline (Source → BuildAndTest bằng CodeBuild với `buildspec.yml` → Deploy dev bằng Beanstalk/CodeDeploy) → Manual approval → Deploy prod | Artifact trao đổi qua S3 | CodeDeploy canary/linear cho Lambda/ECS, blue/green cho EC2/ASG | EventBridge rule → SNS khi pipeline FAILED | Rollback = deployment mới với revision tốt trước đó.
**Vì sao:** CodePipeline là orchestrator duy nhất; artifact qua S3; approval đặt được ở bất kỳ stage nào; rollback tự động theo CloudWatch Alarm.

### 9.8. Hệ thống cần audit và truy vết toàn diện
**Yêu cầu:** biết ai làm gì, request chậm ở đâu, log tập trung, cảnh báo sớm.
**Kiến trúc:** CloudTrail (Management Events mặc định + Data Events bật thêm cho S3/Lambda/DynamoDB + Insights) → S3 (lưu dài hạn) + Athena (truy vấn) + EventBridge rule ("AWS API Call via CloudTrail" → SNS cảnh báo API nhạy cảm) | CloudWatch (Unified Agent cho metric RAM, Metric Filter đếm ERROR → Alarm → SNS, Synthetics Canary mô phỏng user) | X-Ray (SDK + daemon UDP 2000, sidecar cho Fargate, annotation để lọc trace) | CloudWatch Logs Subscription Filter gom log đa tài khoản.
**Vì sao:** mỗi công cụ trả lời một câu hỏi khác nhau (ai / khỏe không / chậm ở đâu); Data Events không bật mặc định nên phải nhớ bật thêm.

### 9.9. Tối ưu chi phí cho hệ thống đang chạy đắt
**Yêu cầu:** giảm hoá đơn mà không giảm availability.
**Kiến trúc:** EC2 ổn định → Reserved Instances/Savings Plans; batch → Spot; Lambda tăng memory để giảm duration, dùng Graviton; DynamoDB ổn định → Provisioned + Auto Scaling, đọc lặp → DAX; S3 lifecycle sang IA/Glacier, Intelligent-Tiering khi pattern không rõ; CloudFront price classes + cache TTL; RDS Read Replica thay vì tăng instance chính cho đọc; dọn tài nguyên mồ côi (EBS unattached, snapshot, NAT Gateway, EIP, KMS key, secret, log retention Never expire); AWS Budgets + Cost Anomaly Detection cảnh báo.
**Vì sao:** phần lớn chi phí thừa nằm ở "tài nguyên quên dọn" và "chọn sai tier/capacity", không phải ở việc cắt availability.

### 9.10. Migration ứng dụng truyền thống lên AWS theo từng bước
**Yêu cầu:** app 3 tầng on-premises, ít rủi ro, có thể rollback.
**Kiến trúc:** Bước 1: lift-and-shift lên EC2 (AMI, User Data) + RDS (Multi-AZ) trong VPC 3 tầng (ELB public → EC2 private → RDS data subnet), SG của EC2 chỉ cho traffic từ SG của ALB. Bước 2: đưa lên Beanstalk (ALB + ASG, deployment immutable/blue-green) + tách RDS ra khỏi environment. Bước 3: tách ứng dụng thành nhiều thành phần, decouple bằng SQS và SNS. Bước 4: chuyển sang serverless Lambda + DynamoDB + API Gateway, IaC bằng SAM/CDK, CI/CD bằng CodePipeline.
**Vì sao:** đây chính là lộ trình thực hành mà chương 33 gợi ý; mỗi bước giảm vận hành và tăng khả năng scale, đồng thời giữ được rollback ở từng bước.

---

## PHẦN 10 — CHECKLIST TRƯỚC NGÀY THI

### 10.1. Checklist 1 tuần trước ngày thi
- [ ] Làm ít nhất 2–3 bộ practice exam đầy đủ (65 câu / 130 phút), đọc kỹ giải thích cả câu đúng lẫn sai.
- [ ] Ghi lại chủ đề sai nhiều; ôn lại đúng các chương đó qua phần *Ghi nhớ cho kỳ thi* của từng chương.
- [ ] Ôn các con số hay hỏi (Phần 8) và bảng tra nhanh từ khóa (Phần 7).
- [ ] Xin **ESL +30 phút** (nếu chưa) và kiểm tra voucher **50%** (nếu đã từng đỗ một chứng chỉ AWS).
- [ ] Nếu thi online, chạy **system test OnVUE** trên đúng máy, đúng mạng sẽ dùng.
- [ ] Đọc exam guide mới nhất (danh sách dịch vụ in-scope có thể được cập nhật) và Service FAQs (đặc biệt Lambda, DynamoDB, S3, SQS, API Gateway, Cognito, KMS — rất sát câu hỏi thi).
- [ ] Đọc qua whitepaper **Blue/Green Deployments on AWS**; các whitepaper khác nên đọc qua: Security Best Practices, Well-Architected, Architecting for the Cloud, Practicing CI/CD, Microservices, Serverless Architectures with Lambda, Running Containerized Microservices.

### 10.2. Ngày thi
- [ ] Giấy tờ tuỳ thân có ảnh, tên **khớp chính xác** với tên trong tài khoản thi.
- [ ] Thi tại trung tâm: đến sớm **15–30 phút**. Thi online: check-in sớm **30 phút**, phòng kín, bàn trống, không màn hình phụ, không đồng hồ thông minh, không ai vào phòng.
- [ ] Đọc câu hỏi, gạch chân từ khoá (*least operational overhead*, *most cost-effective*, *serverless*…), loại trừ đáp án sai, **không bỏ trống** câu nào, dùng **Flag for review**, ~2 phút/câu, để dành 10–15 phút xem lại.
- [ ] Tắt phần mềm chạy nền (VPN, chat, ghi màn hình), dùng máy cá nhân và mạng có dây nếu được; không đọc to câu hỏi, không rời khỏi khung hình webcam.

### 10.3. Sau khi đỗ
- Chia sẻ **badge** trên LinkedIn (Credly), để lại review khoá học.
- Vào portal **Benefits → Claim Benefits** lấy voucher giảm 50% cho lần thi kế tiếp.
- Lộ trình tiếp theo (theo ghi chú): Solutions Architect – Associate (**SAA-C03**, trùng ~50% nội dung nền tảng) | SysOps Administrator / CloudOps Engineer – Associate (**SOA-C02 / SOA-C03**) | Data Engineer / ML Engineer – Associate (**DEA-C01 / MLA-C01**) | DevOps Engineer – Professional (**DOP-C02**, gia hạn cả Developer + SysOps) | Solutions Architect – Professional (**SAP-C02**) | Specialty: Security (SCS-C02/C03), Advanced Networking (ANS-C01), ML Specialty…
- **Recertification:** thi lại bản mới nhất của chứng chỉ, **hoặc** thi đỗ chứng chỉ **cao hơn** (ví dụ DevOps Engineer – Professional sẽ gia hạn cả Developer Associate và SysOps Administrator Associate). AWS cũng có lộ trình gia hạn qua **AWS Skill Builder** cho một số chứng chỉ Associate/Foundational.
- Thi lại (nếu trượt): phải chờ **14 ngày**, trả phí mới. Kết quả thường trong **vòng 5 ngày làm việc** qua email + Certification account.

### 10.4. Dọn dẹp tài khoản sau khi học (đừng để hoá đơn chạy tiếp)
- Đi qua từng region, mở từng dịch vụ theo thứ tự khoá học đã tạo, xoá hết những gì không cần giữ. **Global services** (IAM, Route 53, CloudFront, S3) chỉ kiểm tra một lần; **regional services** phải kiểm tra **ở mọi region đã dùng**.
- **Thứ tự xoá quan trọng:** xoá **CloudFormation stack** trước → **Beanstalk environment** → rồi mới xoá thủ công phần còn lại. Stack `CDKToolkit` và `aws-sam-cli-managed-default` để **cuối cùng** (phải làm rỗng S3 bucket của chúng trước).
- **IAM users/roles/policies không tốn tiền** → có thể giữ lại, nhưng nên xoá **access key** không dùng vì lý do bảo mật.
- **Tìm tài nguyên còn sót:** **Tag Editor / Resource Groups** (All regions, All resource types), **AWS Resource Explorer** (aggregator index), **Billing → Bills** (xem region nào phát sinh phí), **Cost Explorer** (Group by Service → Region → Usage type, ví dụ `NatGateway-Hours`, `PublicIPv4:InUseAddress`, `KMS-Keys`), **EC2 Global View**. Chờ **24–48 giờ** rồi kiểm tra lại (dữ liệu chi phí có độ trễ).
- **Budgets — lưới an toàn:** template **Zero spend budget** (báo khi phát sinh 0,01 USD) hoặc Monthly cost budget (ví dụ 5–10 USD); bật **Free Tier usage alerts** (báo khi sắp vượt 85% Free Tier) và **Cost Anomaly Detection**.
- **Đóng tài khoản (tuỳ chọn):** đăng nhập bằng **root user** → Account → Close account. Tài khoản vào trạng thái *suspended* **90 ngày** (có thể mở lại); sau đó bị xoá vĩnh viễn. **Đóng tài khoản không tự xoá tài nguyên ngay** và vẫn phải trả hoá đơn đã phát sinh → vẫn nên dọn trước. Domain Route 53 nên chuyển ra ngoài hoặc tắt auto-renew trước khi đóng.
- **Bảng "chi phí ẩn" (us-east-1, xấp xỉ):** NAT Gateway ~0,045 USD/giờ (~32 USD/tháng) + phí xử lý dữ liệu | Public IPv4 / Elastic IP 0,005 USD/giờ/IP (~3,6 USD/tháng), kể cả IP đang gắn instance | Interface VPC Endpoint ~0,01 USD/giờ/AZ | ALB / NLB ~0,0225 USD/giờ + LCU | EBS gp3 / snapshot 0,08 USD/GB-tháng / 0,05 USD/GB-tháng | KMS customer managed key 1 USD/key/tháng | Secrets Manager 0,40 USD/secret/tháng | Route 53 hosted zone 0,50 USD/zone/tháng | Domain .com 12–15 USD/năm (auto-renew mặc định bật) | CloudWatch Logs 0,03 USD/GB-tháng lưu trữ (retention mặc định *Never expire*) | Kinesis Data Streams ~0,015 USD/shard-giờ (provisioned), không có Free Tier | CodePipeline V1 1 USD/pipeline/tháng (sau 30 ngày đầu) | RDS/Aurora/ElastiCache stopped: instance *stopped* tự **khởi động lại sau 7 ngày**.
- KMS key: schedule deletion **7–30 ngày** (mặc định 30). Secrets Manager: recovery window **7–30 ngày** (hoặc `--force-delete-without-recovery`).
- **Stop ≠ Terminate** (instance stopped vẫn tính tiền EBS); **Deregister AMI ≠ xoá snapshot** (phải xoá snapshot gốc riêng); **xoá object trong bucket versioning ≠ xoá hẳn** (chỉ thêm delete marker). **CloudFront phải *disable* trước khi *delete*.** Stack import output của stack khác: phải **xoá hết các stack import trước**, rồi mới xoá stack export.
- Sau khoá học, hoá đơn vẫn ~30 USD/tháng dù đã terminate tất cả EC2, Cost Explorer hiện `NatGateway-Hours`: xoá **NAT Gateway** và **release Elastic IP** gắn với nó (EIP sau khi NAT bị xoá vẫn tính phí nếu không release). Security group và default VPC không tốn tiền.

---

## Ghi chú về độ tin cậy của tài liệu này

- Nội dung được biên soạn lại từ 33 chương ghi chú bạn gửi; các con số chỉ lấy từ ghi chú, chỗ nào ghi chú không nêu rõ thì tài liệu ghi rõ là không rõ (không bịa số liệu).
- Một số điểm ghi chú tự nêu mâu thuẫn giữa video cũ và cập nhật thực tế — tài liệu này đã ghi chú cả hai phía và nêu rõ nên theo phía nào khi làm đề thi: SQS 256 KB → 1 MiB (2025); Kinesis record 1 MB → 10 MB (2025); Lambda async payload 256 KB → 1 MB (cuối 2025); S3 object tối đa 5 TB (video nói 50 TB là sai); DynamoDB chuyển capacity mode 1 lần/24 giờ → 4 lần/24 giờ; gp3 16.000 IOPS/1.000 MB/s → 80.000 IOPS/2.000 MiB/s (09/2025); Aurora storage 128 TB → 256 TB; tên cũ Kinesis Data Analytics/Firehose → Managed Service for Apache Flink / Amazon Data Firehose; CodeCommit/CodeGuru Reviewer thay đổi trạng thái dịch vụ; Cloud9 ngừng nhận khách hàng mới từ 07/2024; X-Ray SDK chuyển sang ADOT (AWS Distro for OpenTelemetry) nhưng đề DVA-C02 vẫn hỏi mô hình SDK + daemon.
- Chương 30 và 32 trong ghi chú gốc tự ghi rõ là biên soạn từ syllabus/tài liệu AWS (không có transcript video gốc); chương 33 có bộ practice test 65 câu đầy đủ — phần "bẫy thi" trong tài liệu này đã rút gọn từ chính 65 câu đó.
- Tài liệu này không thay thế exam guide chính thức của AWS: trước ngày thi, hãy kiểm tra exam guide mới nhất vì danh sách dịch vụ in-scope có thể được cập nhật.
- Chúc bạn ôn tập hiệu quả và thi đỗ DVA-C02!

---

[← Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md)
