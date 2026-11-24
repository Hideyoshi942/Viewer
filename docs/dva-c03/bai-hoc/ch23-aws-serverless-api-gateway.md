# Chương 23 – AWS Serverless API Gateway

> **Nguồn:** 21 video của chương + *API Gateway Quiz* (17 câu).
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay (2026). Kỳ thi hiện hành là **DVA-C02**.

## Mục tiêu chương

Sau chương này bạn có thể:

- Giải thích vai trò của **Amazon API Gateway** trong kiến trúc serverless và các loại tích hợp backend (Lambda, HTTP, AWS Service, Mock, VPC Link).
- Phân biệt 3 **endpoint type**: Edge-Optimized, Regional, Private.
- Tạo REST API tích hợp Lambda (proxy và non-proxy), deploy lên **stage**, dùng **stage variables** trỏ tới **Lambda alias**.
- Triển khai **canary deployment** trên một stage.
- Dùng **mapping templates (VTL)** để biến đổi request/response, và **OpenAPI** để import/export và validate request.
- Cấu hình **caching**, **usage plans & API keys**, **CORS**.
- Giám sát bằng CloudWatch Logs/Metrics, X-Ray; đọc hiểu các mã lỗi 4xx/5xx (429, 502, 504…).
- Chọn đúng cơ chế bảo mật: **IAM (SigV4) + resource policy**, **Cognito User Pools**, **Lambda Authorizer**.
- Phân biệt **REST API, HTTP API và WebSocket API**.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001–002 | Section Introduction, API Gateway Overview | Bài 1 – Tổng quan API Gateway |
| 003 | API Gateway Basics Hands On | Bài 2 – Tạo REST API đầu tiên với Lambda |
| 004–006 | Stages and Deployment, Stages Configurations Hands On | Bài 3 – Stages, Deployment và Stage Variables |
| 007–008 | Canary Deployments | Bài 4 – Canary Deployments |
| 009–010 | Integration Types & Mappings, Mapping Templates Hands On | Bài 5 – Integration Types và Mapping Templates |
| 011–012 | Open API | Bài 6 – OpenAPI và Request Validation |
| 013 | API Gateway Caching | Bài 7 – Caching |
| 014 | Usage Plans & API Keys | Bài 8 – Usage Plans và API Keys |
| 015 | Monitoring, Logging and Tracing | Bài 9 – Giám sát, Logging, Tracing, Throttling và mã lỗi |
| 016 | API Gateway CORS | Bài 10 – CORS |
| 017–018 | Authentication and Authorization | Bài 11 – Bảo mật: IAM, Resource Policy, Cognito, Lambda Authorizer |
| 019 | REST API vs HTTP API | Bài 12 – REST API và HTTP API |
| 020 | Websocket API | Bài 13 – WebSocket API |
| 021 | API Gateway - Architecture | Bài 14 – Kiến trúc microservices với API Gateway |
| Quiz | API Gateway Quiz | Câu hỏi ôn tập |

---

## Bài 1 – Tổng quan API Gateway

### Lý thuyết

Ở các chương trước ta đã có **Lambda** (xử lý) và **DynamoDB** (lưu trữ). Câu hỏi tiếp theo: làm sao để **client bên ngoài gọi được** Lambda? Có 3 cách:

| Cách | Đặc điểm |
|---|---|
| Client gọi **thẳng Lambda** (`Invoke`) | Client phải có **IAM credentials**, không phù hợp cho người dùng công khai |
| **Application Load Balancer** trước Lambda | Có HTTP endpoint, nhưng chỉ là "cái ống", ít tính năng |
| **Amazon API Gateway** | Dịch vụ **serverless** tạo REST API công khai, **proxy** request tới Lambda, kèm rất nhiều tính năng |

**API Gateway + Lambda = ứng dụng serverless hoàn chỉnh**, không phải quản lý hạ tầng.

#### Tính năng chính của API Gateway

- Hỗ trợ giao thức **WebSocket** (giao tiếp thời gian thực, hai chiều).
- **Versioning API** (v1, v2, v3…) mà không làm hỏng client cũ.
- Quản lý **nhiều môi trường** (dev, test, prod).
- **Bảo mật**: nhiều cách xác thực (authentication) và phân quyền (authorization).
- Tạo **API keys**, **throttling** request khi client gọi quá nhiều.
- Import/export định nghĩa API theo chuẩn **Swagger / OpenAPI 3.0**.
- **Biến đổi và validate** request/response ngay tại tầng API Gateway.
- **Sinh SDK** và đặc tả API cho client.
- **Cache** response.

#### API Gateway tích hợp với những gì?

| Loại backend | Ví dụ / Lý do dùng |
|---|---|
| **Lambda function** | Cách phổ biến và đơn giản nhất để có REST API serverless |
| **HTTP endpoint** | API on-premises, ALB trong cloud… Đặt API Gateway phía trước để có rate limiting, caching, xác thực người dùng, API keys |
| **AWS Service** | Expose **bất kỳ AWS API nào**: khởi chạy Step Functions workflow, gửi message vào SQS, đẩy dữ liệu vào Kinesis… để thêm xác thực, public API hoặc kiểm soát tốc độ |

Ví dụ: client gửi dữ liệu vào **Kinesis Data Streams** mà **không cần AWS credentials**:

```
Client --HTTP--> API Gateway --(AWS Service integration)--> Kinesis Data Streams
                                                      --> Kinesis Data Firehose --> S3 (JSON)
```

Toàn bộ không có server nào phải quản lý.

#### 3 Endpoint Types

| Endpoint type | Mô tả |
|---|---|
| **Edge-Optimized** (mặc định) | Cho client **toàn cầu**. Request đi qua **CloudFront Edge locations** để giảm độ trễ. API Gateway vẫn **chỉ nằm ở 1 region** |
| **Regional** | Client nằm cùng region. Có thể tự đặt **CloudFront distribution** riêng phía trước để có hiệu quả như Edge-Optimized nhưng **kiểm soát được** cache strategy và cấu hình CloudFront |
| **Private** | **Không public**, chỉ truy cập được **từ trong VPC** qua **interface VPC endpoint** (ENI). Dùng **resource policy** để định nghĩa ai được truy cập |

#### Bảo mật (tổng quan)

- **IAM Roles**: cho ứng dụng nội bộ (ví dụ EC2 gọi API).
- **Amazon Cognito**: cho người dùng bên ngoài (mobile app, web app).
- **Custom Authorizer** (Lambda Authorizer): tự viết logic xác thực.
- **HTTPS với custom domain** thông qua **AWS Certificate Manager (ACM)**:
  - Endpoint **Edge-Optimized**: certificate phải ở **`us-east-1`**.
  - Endpoint **Regional**: certificate phải ở **cùng region** với API Gateway stage.
  - Phải tạo bản ghi **CNAME** hoặc **A-Alias** trong Route 53 trỏ domain về API Gateway.

### Kiến thức thực tế

- **Giới hạn timeout**: integration timeout mặc định của REST API là **29 giây** (tối thiểu 50 ms). Từ **tháng 6/2024**, với **Regional và Private REST API** bạn có thể **xin tăng** integration timeout vượt 29 giây qua Service Quotas (đánh đổi: có thể bị giảm quota throttle cấp account). Edge-Optimized REST API và HTTP API **vẫn giới hạn 29/30 giây**. Với tác vụ dài, nên chuyển sang mô hình **bất đồng bộ** (trả về job ID, client polling hoặc nhận thông báo qua WebSocket).
- **Payload tối đa 10 MB** cho REST API. Upload file lớn nên dùng **S3 pre-signed URL** thay vì đi qua API Gateway.
- **Chi phí**: REST API tính theo số request (+ data transfer, + cache theo giờ nếu bật). HTTP API rẻ hơn đáng kể (xem Bài 12). Có Free Tier 1 triệu call REST API/tháng trong 12 tháng đầu với tài khoản theo chương trình free tier cũ.
- Lỗi hay gặp với custom domain Edge-Optimized: tạo certificate ACM ở region của API (ví dụ `ap-southeast-1`) rồi không chọn được trong console. Nhớ: **Edge → us-east-1**.

### Ghi nhớ cho kỳ thi

- "Expose Lambda thành REST API serverless" → **API Gateway + Lambda**.
- "Cho client ghi vào Kinesis/SQS mà không cấp AWS credentials" → **API Gateway AWS Service integration**.
- Edge-Optimized = CloudFront edge, API vẫn ở 1 region; Regional = cùng region; Private = trong VPC, dùng resource policy.
- ACM cert: **Edge-Optimized → us-east-1**, **Regional → cùng region**.

---

## Bài 2 – Tạo REST API đầu tiên với Lambda

### Lý thuyết

- Console API Gateway cho chọn loại API: **HTTP API**, **WebSocket API**, **REST API** (public) và **REST API Private**. Chương này chủ yếu dùng **REST API**.
- Tạo REST API có 4 cách: **New API**, **Import** (từ file OpenAPI), **Clone existing API**, **Example API**.
- Cấu trúc REST API: **Resource** (đường dẫn, ví dụ `/`, `/houses`) → **Method** (GET, POST…) → **Integration**.
- 5 loại integration khi tạo method: **Lambda function, HTTP, Mock, AWS service, VPC link**.
- **Lambda proxy integration**: API Gateway chuyển **toàn bộ request** (path, method, headers, query string…) thành `event` cho Lambda, và **diễn giải** kết quả Lambda trả về (`statusCode`, `headers`, `body`) thành HTTP response.
- **Timeout**: dù Lambda có thể chạy tới 15 phút, API Gateway có **timeout mặc định 29 giây** (có thể đặt thấp hơn).
- Khi tạo method trên console, API Gateway **tự động thêm resource-based policy** vào Lambda cho phép `apigateway.amazonaws.com` gọi function (giới hạn theo `SourceArn` của API/method).
- Mọi thay đổi chỉ có hiệu lực khi **Deploy API** lên một **stage**. Sau khi deploy có **Invoke URL** dạng:
  `https://{api-id}.execute-api.{region}.amazonaws.com/{stage}/`
- Gọi một path không tồn tại (ví dụ `/dev/wrong`) sẽ nhận lỗi `{"message":"Missing Authentication Token"}`.

### Kiến thức thực tế

- **Lỗi 502 "Malformed Lambda proxy response"** là lỗi kinh điển: với proxy integration, Lambda **bắt buộc** trả về object có `statusCode` và `body` là **chuỗi** (phải `json.dumps`), không được trả thẳng dict.
- "Missing Authentication Token" thực chất thường có nghĩa là **sai path/method hoặc chưa deploy**, không hẳn là thiếu token. Kiểm tra lại stage name trong URL.
- Tạo API bằng CLI/IaC thì **phải tự `add-permission`** cho Lambda; quên bước này sẽ nhận lỗi 500 "Invalid permissions on Lambda function".
- Thực tế nên định nghĩa API bằng **SAM/CDK/CloudFormation** thay vì click console (xem Chương 25 – SAM).

### Ghi nhớ cho kỳ thi

- Thay đổi API **phải Deploy** thì mới có hiệu lực.
- Lambda proxy: Lambda nhận toàn bộ request, tự trả `statusCode/headers/body`.
- Timeout API Gateway **29 giây** dù Lambda chạy tối đa 15 phút.

---

## Bài 3 – Stages, Deployment và Stage Variables

### Lý thuyết

#### Deployment và Stage

- Thay đổi trên API **không có hiệu lực** cho tới khi **deploy**. Đây là nguồn nhầm lẫn phổ biến: sửa API nhưng quên deploy.
- Thay đổi được deploy lên **stage**. Số lượng và tên stage tuỳ ý: `dev`, `test`, `prod` hoặc `v1`, `v2`, `v3`…
- Mỗi stage có **cấu hình riêng**, và giữ **lịch sử deployment** nên có thể **rollback** dễ dàng.

Ví dụ thay đổi gây **breaking change**:

```
Stage v1  --> Lambda v1   (https://api.example.com/v1)  <-- client cũ
Stage v2  --> Lambda v2   (https://api.example.com/v2)  <-- client mới
```

Hai stage cùng tồn tại; di chuyển dần client sang v2, khi không còn ai dùng v1 thì tắt v1.

#### Stage Variables

- Giống **biến môi trường**, nhưng cho **stage** của API Gateway.
- Dùng để **thay đổi cấu hình mà không cần redeploy** API.
- Có thể dùng trong: **Lambda function ARN**, **HTTP endpoint**, **parameter mapping templates**.
- Use case:
  - Cấu hình HTTP endpoint mà từng stage gọi tới (dev/test/prod).
  - Truyền tham số cấu hình cho Lambda qua mapping templates.
  - Trỏ tới đúng **Lambda alias**.
- Stage variables được truyền vào **`event`** (trong proxy integration là trường `stageVariables`) để Lambda đọc được.
- Cú pháp: **`${stageVariables.variableName}`**.

#### Pattern quan trọng: Stage Variables + Lambda Aliases

```
Stage dev  (lambdaAlias=DEV)  --> alias DEV  --> 100% $LATEST
Stage test (lambdaAlias=TEST) --> alias TEST --> 100% v2
Stage prod (lambdaAlias=PROD) --> alias PROD --> 95% v1 / 5% v2
```

Muốn đổi tỉ lệ traffic chỉ cần **sửa alias ở Lambda**, **không phải sửa API Gateway**.

#### Các cấu hình của một Stage

| Nhóm | Nội dung |
|---|---|
| Stage details | Mô tả, **API cache**, **throttling** (rate, burst), **AWS WAF** web ACL, **client certificate** (để backend xác minh request đến từ API Gateway) |
| Logs and tracing | CloudWatch Logs (**Errors only / Errors and info logs / Full request and response logs** – có thể lộ dữ liệu nhạy cảm), **detailed metrics**, **custom access logging**, **X-Ray tracing** |
| Stage variables | Như trên |
| Deployment history | Lịch sử deploy, cho phép chuyển stage về deployment cũ |
| Documentation history | Lịch sử tài liệu API |
| Canary | Xem Bài 4 |
| Tags | Gắn tag cho stage |

### Kiến thức thực tế

- Đọc stage variable trong Lambda (proxy integration):

  ```python
  def lambda_handler(event, context):
      alias = (event.get("stageVariables") or {}).get("lambdaAlias")
      ...
  ```

- **Không lưu secret** trong stage variables (chúng hiển thị dạng plain text). Dùng **Secrets Manager** / **SSM Parameter Store**.
- Muốn bật CloudWatch execution logs cho REST API, bạn phải cấu hình **CloudWatch Logs role ARN** ở **API Gateway → Settings** (cấp account, mỗi region một lần), nếu không sẽ báo lỗi khi bật logging.
- Rollback: **Stage → Deployment history → chọn deployment cũ → Change active deployment**.
- Với IaC, stage `prod` và `dev` thường là **API riêng** hoặc **stack riêng** cho mỗi môi trường (thậm chí account riêng) thay vì nhiều stage chung một API — an toàn hơn khi tách quyền.

### Ghi nhớ cho kỳ thi

- Sửa API mà không thấy thay đổi → **chưa deploy lên stage**.
- "Trỏ stage tới đúng Lambda alias" → **Stage Variables**, cú pháp `${stageVariables.name}`.
- Dùng stage variable cho Lambda ARN thì phải **`lambda add-permission`** cho từng alias.
- Breaking change → tạo **stage mới** (v2) để 2 phiên bản cùng tồn tại.

---

## Bài 4 – Canary Deployments

### Lý thuyết

- **Canary** cho phép đưa **một phần nhỏ traffic** tới thay đổi mới để thử nghiệm, thường áp dụng ở **prod**.
- Bạn chọn **% traffic** cho **canary channel**, phần còn lại đi tới deployment hiện tại của stage.

```
               95% --> Stage prod (deployment hiện tại, v1)
Client --> prod
                5% --> Prod Stage Canary (deployment mới, v2)
```

- **Metrics và logs của canary tách riêng** → dễ theo dõi, so sánh.
- Có thể **override stage variables** cho canary.
- Khi đã tự tin → **Promote** canary: 100% traffic sang phiên bản mới.
- Đây là cách làm **blue/green deployment** với API Gateway + Lambda.

### Kiến thức thực tế

- Canary của API Gateway là canary ở **tầng API** (đổi cấu hình API, integration, mapping…). Nếu chỉ đổi **code Lambda**, cách phổ biến hơn là **Lambda alias weighted** + **CodeDeploy** (`Canary10Percent5Minutes`…), thường thông qua SAM (Chương 25).
- Theo dõi canary: bật CloudWatch logs; log group của canary có hậu tố `/Canary`, metric có dimension riêng cho canary.
- Canary của API Gateway **không tự động rollback** theo alarm như CodeDeploy; bạn phải tự promote hoặc xoá canary.

### Ghi nhớ cho kỳ thi

- "Thử API mới với một phần nhỏ traffic, lo ngại chuyển hết" → **Canary release** trên stage (không phải tạo stage mới + Route 53 weighted).
- Metrics/logs canary tách riêng; có thể override stage variables; **Promote** khi ổn.

---

## Bài 5 – Integration Types và Mapping Templates

### Lý thuyết

#### Các kiểu integration

| Integration type | Mô tả | Mapping template? |
|---|---|---|
| **MOCK** | API Gateway tự trả response, **không gọi backend**. Dùng khi đang phát triển/test, **không dùng cho production** | Có (dùng để tạo response giả) |
| **HTTP / AWS** (Lambda non-proxy, các AWS service) | Chuyển tiếp request nhưng **cho phép sửa**. Phải cấu hình **integration request** và **integration response** | **Có** |
| **AWS_PROXY** (Lambda Proxy) | Request client **thành input** của Lambda; Lambda **tự chịu trách nhiệm** toàn bộ logic request/response | **Không** (không đổi được headers, query string…) |
| **HTTP_PROXY** | Request chuyển thẳng tới HTTP backend, response trả thẳng lại client | **Không**, nhưng có thể **thêm HTTP header** (ví dụ API key bí mật giữa API Gateway và backend mà client không thấy) |

Ví dụ HTTP_PROXY: Client → API Gateway (thêm header `x-api-key: <secret>`) → ALB. Client không cần biết secret, backend vẫn xác minh được request đến từ API Gateway.

Ví dụ AWS integration: REST API → **mapping template** đổi tên, sắp xếp lại tham số → gọi **SQS** `SendMessage` theo định dạng SQS hiểu.

**Event của Lambda proxy** (rút gọn):

```json
{
  "resource": "/",
  "path": "/",
  "httpMethod": "GET",
  "headers": { "Accept": "*/*", "Host": "..." },
  "queryStringParameters": { "name": "foo" },
  "pathParameters": null,
  "stageVariables": { "lambdaAlias": "DEV" },
  "requestContext": { "...": "..." },
  "body": null,
  "isBase64Encoded": false
}
```

**Response Lambda proxy phải có dạng:**

```json
{ "statusCode": 200, "headers": { "Content-Type": "application/json" }, "body": "\"Hello\"" }
```

#### Mapping Templates

- Chỉ áp dụng cho integration **AWS** hoặc **HTTP** **không proxy**.
- Dùng để **sửa request và response**:
  - Đổi tên / sửa **query string parameters**.
  - Sửa nội dung **body**.
  - Thêm / sửa **headers**.
  - **Lọc bớt** kết quả trong response (ví dụ che/ẩn một số trường).
- Viết bằng **VTL – Velocity Template Language** (có vòng lặp, `if`…).
- Gắn với **Content-Type** `application/json` hoặc `application/xml`.

**Use case thi hay hỏi – SOAP API:** SOAP dựa trên **XML**, còn client dùng REST/**JSON**. API Gateway:
1. Trích dữ liệu từ request (path, payload, header).
2. Dựng SOAP message (mapping template).
3. Gọi SOAP service, nhận XML.
4. Biến XML thành định dạng mong muốn (JSON) trả cho client.

**Use case – đổi tên query string:** request `GET /?name=foo&other=bar` tới Lambda (non-proxy). Mapping template biến thành:

```json
{ "my_variable": "foo", "other_variable": "bar" }
```

### Kiến thức thực tế

- Biến hay dùng trong VTL: `$input.body`, `$input.json('$.x')`, `$input.path('$.x')`, `$input.params('name')`, `$context.requestId`, `$context.identity.sourceIp`, `$context.authorizer.claims.sub`, `$util.escapeJavaScript()`, `$util.base64Encode()`.
- Che dữ liệu nhạy cảm trong response (ví dụ chỉ trả `name`, bỏ `ssn`):

  ```velocity
  #set($r = $input.path('$'))
  { "id": "$r.id", "name": "$r.name" }
  ```

- **AWS service integration không cần Lambda** ("Lambda-less"): ví dụ POST `/orders` → `SQS SendMessage`, giảm chi phí và độ trễ. Request template mẫu (Content-Type `application/x-www-form-urlencoded`):

  ```velocity
  Action=SendMessage&MessageBody=$util.urlEncode($input.body)
  ```

  Integration cần **IAM role** cho API Gateway có quyền `sqs:SendMessage`.
- Thực tế phần lớn dự án dùng **Lambda proxy** vì đơn giản, dễ test; mapping templates dùng khi tích hợp trực tiếp AWS service hoặc backend legacy.

### Ghi nhớ cho kỳ thi

- "Che/sửa/đổi tên trường trong request/response" → **Mapping Templates** (không dùng được với proxy).
- "Client JSON ↔ backend SOAP/XML" → **Mapping Templates**.
- MOCK = không gọi backend, dùng khi dev/test.
- HTTP_PROXY có thể thêm header (API key bí mật) tới backend.

---

## Bài 6 – OpenAPI và Request Validation

### Lý thuyết

- **OpenAPI** (trước đây là **Swagger**) là chuẩn phổ biến để định nghĩa REST API **dưới dạng code** (YAML hoặc JSON).
- API Gateway hỗ trợ:
  - **Import** OpenAPI 3.0 (và Swagger 2.0): định nghĩa method, method request, integration request, method response + **AWS extensions** (`x-amazon-apigateway-*`).
  - **Export** API hiện có ra OpenAPI/Swagger (JSON/YAML, có/không kèm extension API Gateway hoặc Postman).
  - Dùng spec để **sinh client SDK** (Android, JavaScript, iOS, Java, Ruby…).
- **Request validation**: API Gateway kiểm tra request **trước khi** gọi backend. Nếu không hợp lệ → trả ngay **400 Bad Request**, giảm call thừa tới backend. Có thể kiểm tra:
  - Tham số bắt buộc có mặt trong URI, query string, headers và **không rỗng**.
  - **Payload** tuân theo **JSON Schema model** của method.
- Khai báo bằng `x-amazon-apigateway-request-validators` (định nghĩa validator) và `x-amazon-apigateway-request-validator` (áp dụng cho toàn API hoặc từng method).

```yaml
openapi: 3.0.1
info: { title: ValidationDemo, version: "1.0" }
x-amazon-apigateway-request-validators:
  all:
    validateRequestBody: true
    validateRequestParameters: true
  params-only:
    validateRequestBody: false
    validateRequestParameters: true
x-amazon-apigateway-request-validator: params-only   # mặc định cho mọi method
paths:
  /validation:
    post:
      x-amazon-apigateway-request-validator: all       # riêng method này kiểm tra cả body
      parameters:
        - name: q1
          in: query
          required: true
          schema: { type: string }
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: "#/components/schemas/Order" }
      responses:
        "200": { description: OK }
      x-amazon-apigateway-integration:
        type: aws_proxy
        httpMethod: POST
        uri: arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:123456789012:function:orders/invocations
components:
  schemas:
    Order:
      type: object
      required: [productId, quantity]
      properties:
        productId: { type: string }
        quantity:  { type: integer, minimum: 1 }
```

### Kiến thức thực tế

- Request validation giúp **tiết kiệm chi phí** Lambda (request rác bị chặn trước) nhưng **không thay thế** validate trong code (defense in depth).
- Tuỳ biến thông báo lỗi validation bằng **Gateway Responses** (`BAD_REQUEST_BODY`, `BAD_REQUEST_PARAMETERS`), ví dụ dùng `$context.error.validationErrorString` để trả chi tiết lỗi.
- OpenAPI là cách thuận tiện để **giữ API trong Git** và dùng với SAM (`DefinitionBody` hoặc `AWS::Include`).

### Ghi nhớ cho kỳ thi

- "Import/export API dưới dạng code" → **Swagger / OpenAPI**.
- Request validation trả **400** trước khi tới backend.
- Từ OpenAPI có thể **sinh SDK client**.

---

## Bài 7 – Caching

### Lý thuyết

- Cache giúp **giảm số lần gọi backend**: API Gateway kiểm tra cache trước; **cache hit** thì trả luôn, **cache miss** mới gọi backend.
- **TTL** mặc định **300 giây** (5 phút); tối thiểu **0** (không cache), tối đa **3600 giây** (1 giờ).
- Cache được định nghĩa **theo stage** (mỗi stage một cache); có thể **override theo method** (ví dụ tắt cache cho 1 method, hoặc đặt TTL riêng).
- Cache có thể **mã hoá**.
- Dung lượng từ **0.5 GB đến 237 GB**.
- Cache **đắt** → hợp lý cho **production / pre-production**, ít ý nghĩa ở dev/test.

#### Invalidate cache

- Xoá **toàn bộ cache** ngay từ console (**Flush entire cache**).
- **Client** có thể invalidate bằng header **`Cache-Control: max-age=0`**, nhưng cần **IAM authorization** phù hợp:

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": ["execute-api:InvalidateCache"],
      "Resource": ["arn:aws:execute-api:us-east-1:123456789012:api-id/stage-name/GET/resource-path"]
    }]
  }
  ```

- Nếu **không bắt buộc authorization** (không tick *Require authorization*) thì **bất kỳ client nào** cũng invalidate được cache → có thể là thảm hoạ (backend bị dội tải).
- Khi request invalidate **không được phép**, có thể chọn: **Ignore cache control header** (bỏ qua), **Fail the request with 403**, hoặc **Ignore + thêm warning header**.

### Kiến thức thực tế

- Cache key mặc định gồm **path + method**; muốn cache khác nhau theo query string / header thì phải khai báo tham số đó là **cache key** (trong method request → *Caching*). Quên bước này → mọi user nhận cùng một kết quả (lỗi rò rỉ dữ liệu nguy hiểm khi response phụ thuộc user).
- Cache tính phí **theo giờ** theo dung lượng, kể cả khi không có request. Với dữ liệu tĩnh, cân nhắc **CloudFront** phía trước Regional API thay vì API cache.
- Chỉ **GET** được cache mặc định.

### Ghi nhớ cho kỳ thi

- Cache **theo stage**, TTL mặc định **300s**, tối đa **3600s**, override theo method.
- Client invalidate → header **`Cache-Control: max-age=0`** (+ IAM `execute-api:InvalidateCache`).
- "Lambda quá tải vì nhiều GET trả cùng dữ liệu" → **bật caching cho stage** (không phải tích hợp ElastiCache).

---

## Bài 8 – Usage Plans và API Keys

### Lý thuyết

Khi muốn **cung cấp API cho khách hàng** (và có thể **thu phí**):

- **Usage plan** định nghĩa:
  - **Ai** được truy cập một hoặc nhiều **API stage và method**.
  - **Bao nhiêu và nhanh như thế nào**: **throttling limits** (rate, burst) và **quota** (ví dụ 10.000 request/tháng).
  - **API keys** nào gắn với plan để **nhận diện khách hàng** và **đo lường** (meter).
- **API key**: chuỗi ký tự chữ-số phân phối cho khách hàng (ví dụ `WBjHxNtoAb4WPKBC7cGm64CBibIb24b4jt8jJHo9`).
  - Dùng cùng usage plan để **kiểm soát truy cập**.
  - **Throttling** áp dụng **theo API key**.
  - **Quota** là tổng số request.

#### Thứ tự cấu hình (đề hay hỏi)

1. Tạo một hoặc nhiều API, cấu hình các method **yêu cầu API key** (*API key required = true*), **deploy** lên stage.
2. **Tạo hoặc import API keys** để phân phối cho developer (khách hàng).
3. Tạo **usage plan** với throttle và quota mong muốn.
4. **Liên kết API stages và API keys với usage plan** — quên bước này thì không hoạt động.

- Client gửi API key qua header **`x-api-key`**.

### Kiến thức thực tế

- **API key không phải cơ chế xác thực/bảo mật** — chỉ để nhận diện và đo lường. Kết hợp với IAM, Cognito hoặc Lambda Authorizer để bảo mật thật sự. Bản thân AWS khuyến cáo không dùng API key làm phương thức authorization duy nhất.
- Throttling và quota của usage plan là **best-effort**, có thể vượt nhẹ trong thời gian ngắn.
- Xem lượng dùng theo key: `aws apigateway get-usage --usage-plan-id $PLAN_ID --start-date 2026-10-01 --end-date 2026-10-14`.
- Usage plans và API keys **chỉ có ở REST API**, HTTP API không hỗ trợ.

### Ghi nhớ cho kỳ thi

- "Bán API cho khách hàng, gói free/trả phí, giới hạn theo khách" → **Usage Plans & API Keys**.
- Header **`x-api-key`**.
- Bước cuối: **gắn stage và API key vào usage plan**.

---

## Bài 9 – Giám sát, Logging, Tracing, Throttling và mã lỗi

### Lý thuyết

#### CloudWatch Logs

- Ghi lại thông tin **request và response body** đi qua API Gateway.
- Bật ở **cấp stage**, chọn **log level**: **ERROR**, **INFO** (hoặc full request/response = mức "DEBUG" trong video). Có thể **override theo từng method**.
- Luồng: User → API Gateway (log request) → Backend → API Gateway (log response) → User.
- **Cẩn thận**: full logging có thể đưa **dữ liệu nhạy cảm** vào CloudWatch Logs.

#### X-Ray

- **Tracing** request qua API Gateway. Bật X-Ray cho **cả API Gateway và Lambda** → thấy **toàn cảnh** (service map, độ trễ từng chặng, lỗi ở đâu).

#### CloudWatch Metrics (theo stage, có thể bật detailed metrics)

| Metric | Ý nghĩa |
|---|---|
| **CacheHitCount** | Số request trả từ cache → cao = cache hiệu quả |
| **CacheMissCount** | Số request phải gọi backend do cache miss |
| **Count** | Tổng số request trong khoảng thời gian |
| **IntegrationLatency** | Thời gian từ khi API Gateway chuyển request tới backend đến khi nhận response từ backend → **backend chậm hay nhanh** |
| **Latency** | Thời gian từ khi API Gateway nhận request của client đến khi trả response → **gồm IntegrationLatency + overhead của API Gateway** (authorizer, cache, mapping templates…). Luôn ≥ IntegrationLatency |
| **4XXError** | Lỗi phía **client** |
| **5XXError** | Lỗi phía **server / backend** |

- Thời gian tối đa cho 1 request là **29 giây**; Latency/IntegrationLatency vượt 29s → **timeout**.

#### Throttling

- **Account limit**: mặc định **10.000 request/giây** cho **tất cả API** trong account (mỗi region) — **soft limit**, xin tăng được.
- Một API bị dội tải có thể làm **các API khác bị throttle** (giống Lambda concurrency).
- Bị throttle → **`429 Too Many Requests`** (lỗi client, **retriable**) → dùng **exponential backoff**.
- Hạn chế ảnh hưởng: đặt **stage limits** và **method limits** (để một stage/method bị tấn công không ăn hết quota), hoặc **usage plan** để throttle **theo khách hàng**.

#### Mã lỗi

| Mã | Ý nghĩa |
|---|---|
| **400** Bad Request | Request không hợp lệ (ví dụ fail request validation) |
| **403** Access Denied | Không có quyền, hoặc **WAF** chặn |
| **429** | **Quota exceeded / throttling** |
| **502** Bad Gateway | Thường do **Lambda proxy trả response sai định dạng**, hoặc backend lỗi |
| **503** Service Unavailable | Backend không khả dụng |
| **504** Integration Failure | Ví dụ **Endpoint Request Timed-out**: quá **29 giây** không nhận được phản hồi từ backend |

### Kiến thức thực tế

- **Execution logs** (log chi tiết luồng xử lý) khác **Access logs** (một dòng/request, format tuỳ chỉnh). Access log JSON mẫu:

  ```json
  { "requestId":"$context.requestId", "ip":"$context.identity.sourceIp",
    "method":"$context.httpMethod", "path":"$context.resourcePath",
    "status":"$context.status", "latency":"$context.responseLatency",
    "integrationLatency":"$context.integrationLatency" }
  ```

- Account throttle mặc định: **10.000 rps, burst 5.000** (con số burst theo tài liệu AWS hiện hành; có thể thay đổi theo region/account).
- Đặt alarm: `5XXError` > 0, `Latency p99` cao, `IntegrationLatency` sát 29s → backend cần tối ưu hoặc chuyển bất đồng bộ.
- Phân biệt: **Latency cao, IntegrationLatency thấp** → chậm ở tầng API Gateway (authorizer Lambda chậm, mapping template…); **cả hai cao** → backend chậm.
- Nhớ cấu hình **CloudWatch role ARN** ở Settings của API Gateway trước khi bật execution logs (REST API).

### Ghi nhớ cho kỳ thi

- Phân tích timeout giữa API Gateway và Lambda → **IntegrationLatency**.
- Hiệu quả cache → **CacheHitCount / CacheMissCount**.
- Quá nhiều request → **429**; timeout backend → **504**; Lambda proxy trả sai format → **502**.
- Tìm nguyên nhân lỗi/độ trễ xuyên suốt API Gateway → Lambda → DynamoDB → **X-Ray**.
- Account limit **10.000 rps** (soft limit).

---

## Bài 10 – CORS

### Lý thuyết

- **CORS (Cross-Origin Resource Sharing)** là cơ chế bảo mật của trình duyệt. Phải **bật CORS** nếu API nhận call từ **domain khác**.
- Trình duyệt gửi **pre-flight request** bằng method **`OPTIONS`**; response phải chứa các header:
  - `Access-Control-Allow-Methods`
  - `Access-Control-Allow-Headers`
  - `Access-Control-Allow-Origin`
- Có thể bật từ console.

Ví dụ:

```
Browser --GET--> S3 static website (www.example.com)   -> tải HTML/JS
Browser --OPTIONS (preflight)--> API Gateway (api.example.com)
API Gateway --> preflight response: Access-Control-Allow-Origin: https://www.example.com ...
Browser --GET/POST thật--> API Gateway
```

### Kiến thức thực tế

- Lỗi kinh điển: bật CORS trên console nhưng trình duyệt vẫn báo lỗi CORS → do (1) **quên deploy**, (2) Lambda proxy **không trả `Access-Control-Allow-Origin`**, hoặc (3) response lỗi 4xx/5xx do API Gateway sinh ra (ví dụ 403 từ authorizer) thiếu header CORS → thêm header vào **Gateway Responses** (`DEFAULT_4XX`, `DEFAULT_5XX`).
- **HTTP API** có cấu hình CORS **tích hợp sẵn**, API Gateway tự trả preflight, đơn giản hơn REST API.

### Ghi nhớ cho kỳ thi

- API được gọi từ **domain khác** → **Enable CORS**.
- Pre-flight = **OPTIONS** + header `Access-Control-Allow-*`.

---

## Bài 11 – Bảo mật: IAM, Resource Policy, Cognito, Lambda Authorizer

### Lý thuyết

#### 1. IAM Permissions

- **Authentication = IAM**, **Authorization = IAM policy** gắn vào user/role.
- Tối ưu khi truy cập **trong account AWS của bạn**: EC2, Lambda, IAM users…
- Credentials được truyền bằng **Signature V4 (SigV4)**, ký và đặt trong **header**.
- Luồng: Client gọi REST API kèm header SigV4 → API Gateway kiểm tra **IAM policy** → nếu được phép, gọi Lambda backend → trả kết quả.

Policy cho phép gọi API:

```json
{
  "Effect": "Allow",
  "Action": "execute-api:Invoke",
  "Resource": "arn:aws:execute-api:us-east-1:123456789012:a1b2c3d4e5/prod/GET/houses"
}
```

#### 2. Resource Policies

- Giống **Lambda resource policy**: policy JSON gắn **lên API Gateway** để định nghĩa **ai/cái gì được truy cập**.
- Use case chính: **cross-account access** (kết hợp IAM security).
- Ngoài ra: lọc theo **địa chỉ IP nguồn** (allow/deny list), chỉ cho phép từ **VPC Endpoint** (Private API).
- Console có sẵn các template: **AWS account allowlist**, **IP range denylist**, **Source VPC allowlist**.

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "AWS": "arn:aws:iam::111122223333:root" },
    "Action": "execute-api:Invoke",
    "Resource": "execute-api:/*/*/*"
  }]
}
```

#### 3. Cognito User Pools

- Cognito = **cơ sở dữ liệu người dùng**, quản lý **toàn bộ vòng đời user**; token **tự hết hạn**.
- API Gateway **xác minh danh tính** trực tiếp với Cognito — **không cần code tuỳ chỉnh**.
- Luồng: Client **authenticate với Cognito User Pool** → nhận **token** → gửi token trong API call → API Gateway **evaluate token** với User Pool → hợp lệ thì gọi backend.
- **Authentication = Cognito User Pools**; **Authorization** = cấu hình ở **method** API Gateway (và logic chi tiết thì bạn **tự làm trong backend**).

#### 4. Lambda Authorizer (trước đây là Custom Authorizer)

- **Linh hoạt nhất**, nhưng phải tự làm nhiều nhất.
- **Token-based** (bearer token: **JWT**, **OAuth**) hoặc **request-based** (headers, query strings, stage variables, context).
- Lambda kiểm tra input; nếu hợp lệ thì **trả về IAM principal + IAM policy**; kết quả **được cache** (Policy Cache).
- **Authentication bên ngoài** (bạn tự quyết, ví dụ Auth0 hay hệ thống bên thứ ba); **authorization trong Lambda**.
- Luồng: Client authenticate với **hệ thống bên thứ 3** → nhận token → gửi token (header/request params) tới API Gateway → API Gateway gọi **Lambda Authorizer** (kèm context + token) → Lambda xác minh (có thể hỏi bên thứ 3) → trả **IAM principal + policy** → cache → API Gateway gọi backend.

#### Tổng hợp cho kỳ thi

| Cơ chế | Khi nào dùng | Authentication | Authorization | Ghi chú |
|---|---|---|---|---|
| **IAM** | User/role đã có trong account AWS; cross-account thì thêm **resource policy** | IAM (**SigV4**) | IAM policy | Dùng cách quen thuộc |
| **Lambda (Custom) Authorizer** | **Third-party** tokens / hệ thống user riêng | Bạn tự làm | Lambda trả IAM policy | Rất linh hoạt; kết quả được cache nhưng vẫn **trả tiền mỗi lần gọi Lambda** |
| **Cognito User Pool** | Tự quản lý user pool (có thể federate Facebook, Google…) | Cognito | Backend tự xử lý | **Không cần code** xác thực → được ưu tiên |

### Kiến thức thực tế

- Bẫy cache authorizer: policy trả về được cache theo **token**; nếu `Resource` chỉ là `methodArn` của method hiện tại, user gọi **method khác** trong thời gian cache có thể bị **403**. Thường trả `Resource` dạng wildcard `arn:aws:execute-api:region:acct:api-id/stage/*/*` hoặc tắt cache khi debug.
- Để throw 401 từ Lambda authorizer TOKEN: `raise Exception("Unauthorized")` (đúng chuỗi này).
- **HTTP API** có **JWT authorizer** tích hợp sẵn (OIDC/OAuth 2.0: Cognito, Auth0, Okta…) — không cần viết Lambda.
- **Amazon Verified Permissions** có thể dùng làm Lambda authorizer với chính sách Cedar cho phân quyền chi tiết (ngoài phạm vi đề thi).
- Cognito Identity Pools (Federated Identities) cấp **AWS credentials tạm thời** — dùng khi client gọi API với **IAM auth**; còn Cognito User Pools cấp **JWT** cho Cognito authorizer.

### Ghi nhớ cho kỳ thi

- Truy cập nội bộ AWS / cross-account → **IAM (+ resource policy)**, dùng **SigV4**.
- **Bearer token cần validate với bên thứ 3** → **Lambda Authorizer**.
- Đăng nhập **Facebook/Google** liền mạch với API Gateway → **Cognito User Pools** (có federation với social IdP).
- Lambda Authorizer trả về **IAM policy**, kết quả được **cache**.
- Resource policy: cross-account, IP allow/deny, VPC endpoint (private API).

---

## Bài 12 – REST API và HTTP API

### Lý thuyết

API Gateway có 3 loại API: **REST API**, **HTTP API**, **WebSocket API**.

- **HTTP API**:
  - **Độ trễ thấp, rẻ** hơn.
  - Integration: **Lambda proxy**, **HTTP proxy**, **private integration** (VPC Link) — tất cả đều là **proxy**, **không có data mapping** (mapping templates).
  - Authorization: **OIDC**, **OAuth 2.0** (JWT authorizer).
  - **CORS tích hợp sẵn**.
  - **Không có usage plans, API keys**.
- **REST API**: có **đầy đủ tính năng** đã học trong chương (trừ JWT authorizer native OIDC/OAuth 2.0).

| Tính năng | REST API | HTTP API |
|---|---|---|
| Giá | Cao hơn | **Rẻ hơn nhiều** |
| Mapping templates (VTL) | Có | Không (chỉ có *parameter mapping* đơn giản) |
| Usage plans / API keys | Có | **Không** |
| Caching | Có | **Không** |
| Resource policies | **Có** | **Không** |
| Request validation | Có | Không |
| Canary trên stage | Có | Không |
| Endpoint Edge-Optimized / Private | Có | Chỉ Regional |
| AWS WAF trực tiếp | Có | Không |
| JWT authorizer (OIDC/OAuth 2.0) native | Không (dùng Lambda/Cognito authorizer) | **Có** |
| IAM auth, Lambda authorizer | Có | Có |
| CORS | Cấu hình thủ công (OPTIONS) | **Tích hợp sẵn** |

### Kiến thức thực tế

- Bảng trên phản ánh tài liệu "Choose between REST APIs and HTTP APIs" của AWS; video chỉ nêu ý chính. Video nói HTTP API chỉ hỗ trợ OIDC/OAuth 2.0 — thực tế hiện nay HTTP API **cũng hỗ trợ IAM authorization và Lambda authorizer**.
- HTTP API dùng **payload format version 2.0** cho Lambda (event gọn hơn, có `rawPath`, `requestContext.http.method`, cookie riêng). Code viết cho REST (v1.0) cần chỉnh khi chuyển.
- HTTP API có **Auto-deploy** stage `$default` và route dạng `GET /items/{id}`, `$default`.
- Chọn nhanh: cần API keys/usage plans, caching, WAF, mapping templates, request validation, private endpoint → **REST API**. Chỉ cần proxy Lambda/HTTP rẻ và nhanh → **HTTP API**.

### Ghi nhớ cho kỳ thi

- **HTTP API rẻ hơn**, toàn proxy, không usage plan/API key, không resource policy.
- **REST API** đầy đủ tính năng, hỗ trợ **resource policies**.

---

## Bài 13 – WebSocket API

### Lý thuyết

- **WebSocket**: giao tiếp **hai chiều, tương tác** giữa trình duyệt và server; server có thể **chủ động push** dữ liệu tới client mà client không cần gửi request → hỗ trợ ứng dụng **stateful**.
- Use case: **chat**, nền tảng **cộng tác**, **game nhiều người chơi**, **giao dịch tài chính** real-time.
- Client mở **một kết nối persistent** tới WebSocket API.
- Backend có thể là Lambda, DynamoDB, HTTP endpoint… (mọi integration của API Gateway).

Ví dụ chat app:

| Sự kiện | Lambda được gọi | Việc làm |
|---|---|---|
| Kết nối lần đầu | `onConnect` | Lưu **connectionId** vào DynamoDB |
| Client gửi message | `sendMessage` | Xử lý, lưu message, tra user theo connectionId |
| Client ngắt kết nối | `onDisconnect` | Xoá connectionId |

#### URL và connection ID

- URL WebSocket: **`wss://[unique-id].execute-api.[region].amazonaws.com/[stage-name]`** (wss = WebSocket mã hoá).
- Khi kết nối, API Gateway tạo **connectionId**, **giữ nguyên** suốt thời gian client còn kết nối.
- Message client gửi qua kết nối gọi là **frames**; mọi frame dùng **cùng connectionId**.

#### Server gửi ngược về client

- **Connection URL callback**:
  `https://[unique-id].execute-api.[region].amazonaws.com/[stage-name]/@connections/connectionId`
- Lambda (hoặc bất kỳ ai) gửi **HTTP POST** được **ký IAM SigV4** tới URL này → API Gateway đẩy message xuống client.

| Method trên `@connections/{connectionId}` | Tác dụng |
|---|---|
| **POST** | Gửi message từ server tới client |
| **GET** | Lấy trạng thái kết nối mới nhất của client |
| **DELETE** | Ngắt kết nối client |

#### Routing

- Message JSON đến được **route** tới backend khác nhau dựa trên **route selection expression** — chọn một trường trong JSON.
- Không khớp route nào → gửi tới route **`$default`**.
- Route Key Table: **`$connect`**, **`$disconnect`**, **`$default`** (mặc định) + route tuỳ chỉnh (`join`, `quit`, `delete`…).

Ví dụ: message `{"service":"chat","action":"join","data":{"room":"room1234"}}`, route selection expression **`$request.body.action`** → giá trị `join` → khớp route `join` → gọi backend gắn với route đó.

### Kiến thức thực tế

- Giới hạn đáng nhớ (theo quota hiện hành): kết nối WebSocket tồn tại tối đa **2 giờ**, **idle timeout 10 phút**, frame tối đa **32 KB** (message tối đa 128 KB). Client cần **heartbeat/ping** và tự kết nối lại.
- Khi `post_to_connection` trả **410 GoneException** → client đã ngắt; xoá connectionId khỏi DynamoDB.
- Thay thế: **AWS AppSync** (GraphQL subscriptions / AppSync Events) hoặc **AWS IoT Core** (MQTT over WebSocket) cho real-time quy mô lớn.

### Ghi nhớ cho kỳ thi

- **WebSocket API = giao tiếp hai chiều, real-time** (chat, game, trading).
- Server push → POST tới **`@connections/{connectionId}`** (ký SigV4).
- Routing theo **route selection expression** (ví dụ `$request.body.action`), không khớp → **`$default`**; route bắt buộc `$connect`, `$disconnect`, `$default`.

---

## Bài 14 – Kiến trúc microservices với API Gateway

### Lý thuyết

- API Gateway làm **một cửa ngõ duy nhất (single interface)** cho mọi microservice trong công ty, **che giấu độ phức tạp** với client.

```
                       /service1 --> ELB --> ECS cluster
customer1.example.com
customer2.example.com --> API Gateway --> /docs --> S3 bucket (tài liệu tĩnh)
  (Route 53 + SSL)                     --> /service2 --> ELB --> EC2 Auto Scaling group
```

- **Route 53** đăng ký domain thay cho DNS mặc định của API Gateway; có thể có địa chỉ riêng cho từng khách hàng (`customer1.example.com`, `customer2.example.com`), mỗi domain có **SSL certificate** riêng.
- Tại API Gateway có thể áp dụng **forwarding và transformation rules** để sửa dữ liệu trước khi gửi tới backend.
- Tóm lại: thống nhất microservices dưới **một URL**, xử lý routing, biến đổi dữ liệu và SSL tại API Gateway.

### Kiến thức thực tế

- Gắn nhiều API (mỗi team một API) vào cùng custom domain bằng **API mappings / base path mapping** (`api.example.com/orders` → API Orders, `/users` → API Users).
- Backend nằm trong VPC (ALB/NLB nội bộ): REST API dùng **VPC Link** tới **NLB** (VPC Link v1); HTTP API dùng VPC Link tới ALB/NLB/Cloud Map. Các tuỳ chọn private integration được AWS mở rộng dần — kiểm tra tài liệu mới nhất khi triển khai.
- Gọi S3 qua API Gateway (route `/docs`) bằng **AWS service integration** với role có `s3:GetObject`.

### Ghi nhớ cho kỳ thi

- API Gateway = **cổng thống nhất** cho microservices: routing theo path, custom domain (Route 53 + ACM), transformation.

---

## Tổng kết chương

| Chủ đề | Điều cần nhớ |
|---|---|
| Integration | Lambda, HTTP, AWS Service, Mock, VPC Link; proxy (AWS_PROXY, HTTP_PROXY) vs non-proxy |
| Endpoint types | Edge-Optimized (mặc định, CloudFront edge, cert ACM ở us-east-1), Regional, Private (VPC endpoint + resource policy) |
| Timeout / payload | **29s** (Regional/Private REST API xin tăng được từ 6/2024), 10 MB |
| Deploy | Phải **Deploy lên stage**; stage có lịch sử, rollback được |
| Stage variables | `${stageVariables.x}`, trỏ tới **Lambda alias**, cần `lambda add-permission` |
| Canary | % traffic tới deployment mới trên cùng stage, logs/metrics riêng, **Promote** |
| Mapping templates | VTL, chỉ non-proxy; đổi tên/che trường, JSON ↔ XML (SOAP) |
| OpenAPI | Import/export, sinh SDK, request validation → **400** |
| Caching | Theo stage, TTL 300s (0–3600s), 0.5–237 GB, `Cache-Control: max-age=0` + `execute-api:InvalidateCache` |
| Usage plans & API keys | Throttle + quota theo khách; header `x-api-key`; gắn stage + key vào plan |
| Monitoring | CacheHit/MissCount, Count, **IntegrationLatency**, Latency, 4XXError, 5XXError; X-Ray |
| Throttling | 10.000 rps/account (soft); **429**; stage/method limits |
| Mã lỗi | 400, 403, 429, 502 (proxy response sai), 503, 504 (timeout 29s) |
| CORS | OPTIONS preflight, `Access-Control-Allow-*`; Lambda proxy phải tự trả header |
| Bảo mật | IAM + SigV4 (+ resource policy cross-account); Cognito User Pools (không code); Lambda Authorizer (third-party token, trả IAM policy, cache) |
| HTTP API | Rẻ, proxy-only, JWT authorizer, không usage plan/API key/resource policy/cache |
| WebSocket | Hai chiều, `wss://`, `@connections/{id}` POST/GET/DELETE, route selection expression, `$connect/$disconnect/$default` |

---

## Câu hỏi ôn tập

*Nguồn: API Gateway Quiz (17 câu). Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Để tạo một API serverless, bạn nên tích hợp API Gateway với ______.

- A. Amazon EC2
- B. Elastic Load Balancer
- C. AWS Lambda

<details><summary>Đáp án</summary>

**C.** API Gateway + Lambda tạo ra API hoàn toàn serverless. EC2 và ELB đều đòi hỏi quản lý/chi phí hạ tầng chạy liên tục.
</details>

**Câu 2.** Để chuyển hướng stage của API Gateway tới đúng Lambda Alias, bạn nên dùng ______.

- A. Canary Deployment
- B. Stage Variables
- C. X-Ray Integration
- D. HTTP Endpoint

<details><summary>Đáp án</summary>

**B.** Đặt ARN dạng `function-name:${stageVariables.lambdaAlias}`, mỗi stage gán giá trị alias riêng (DEV/TEST/PROD).
</details>

**Câu 3.** API Gateway có thể tích hợp với tất cả những thứ sau, NGOẠI TRỪ ______.

- A. Lambda Functions
- B. HTTP Endpoints
- C. AWS Services
- D. AWS CloudShell

<details><summary>Đáp án</summary>

**D.** CloudShell là terminal trên trình duyệt, không phải backend. API Gateway tích hợp với Lambda, HTTP endpoint, AWS service (và Mock, VPC Link).
</details>

**Câu 4.** Bạn đã tạo một API hoàn toàn mới (v2) và muốn thử nghiệm, nhưng lo ngại khi chuyển toàn bộ traffic sang. Cách được khuyến nghị là gì?

- A. Tạo một Stage mới, rồi dùng Route 53 phân phối traffic giữa hai Stage bằng Weighted record (CNAME)
- B. Tạo một Canary release
- C. Cập nhật tất cả Lambda function để dùng Aliases

<details><summary>Đáp án</summary>

**B.** Canary trên stage cho phép đưa một % nhỏ traffic tới deployment mới, có logs/metrics riêng và promote khi ổn. C sai vì câu hỏi không nói về Lambda function; A phức tạp và không phải cách khuyến nghị.
</details>

**Câu 5.** API Gateway của bạn dùng các Lambda function làm backend, và bạn muốn che (mask) một số trường trong dữ liệu đầu ra mà một Lambda trả về. Bạn nên dùng gì?

- A. Mapping Templates
- B. Custom Authorizer
- C. Cognito Mask

<details><summary>Đáp án</summary>

**A.** Mapping template ở **integration response** (non-proxy) có thể sửa/lọc bỏ trường trước khi trả cho client. Custom Authorizer dùng cho xác thực; "Cognito Mask" không tồn tại.
</details>

**Câu 6.** Đặc tả nào cho phép import/export API dưới dạng code?

- A. gRPC
- B. SOAP
- C. Swagger / OpenAPI

<details><summary>Đáp án</summary>

**C.** API Gateway hỗ trợ import/export Swagger 2.0 và OpenAPI 3.0 (YAML/JSON).
</details>

**Câu 7.** API của bạn chạy trên Lambda nhận rất nhiều request GET, khiến Lambda quá tải và hoá đơn tăng mạnh. Response trả về cùng một payload và chỉ thay đổi mỗi ngày một lần. Bạn nên làm gì để xử lý các request này và giảm chi phí?

- A. Bật mock responses
- B. Tích hợp API Gateway với ElastiCache
- C. Bật Caching cho Stage

<details><summary>Đáp án</summary>

**C.** Cache của stage trả response từ cache, giảm số lần gọi Lambda. API Gateway không tích hợp trực tiếp ElastiCache; mock response không trả dữ liệu thật.
</details>

**Câu 8.** API Gateway Caching được định nghĩa theo ______ với TTL mặc định ______.

- A. API, 300 giây
- B. Stage, 300 giây
- C. API, 600 giây
- D. Stage, 600 giây

<details><summary>Đáp án</summary>

**B.** Cache theo **stage** (override được theo method), TTL mặc định **300 giây**, tối đa 3600 giây.
</details>

**Câu 9.** Client có thể invalidate cache của API từ phía client bằng cách nào?

- A. Dùng Stage Variables
- B. Truyền URL parameter `InvalidateCache`
- C. Truyền HTTP header `Cache-Control: max-age=0`

<details><summary>Đáp án</summary>

**C.** Header `Cache-Control: max-age=0` (nên kèm yêu cầu IAM `execute-api:InvalidateCache` để tránh ai cũng xoá được cache).
</details>

**Câu 10.** Bạn cung cấp một API Machine Learning qua API Gateway cho nhiều khách hàng dùng trong ứng dụng của họ. Hiện dịch vụ miễn phí, nhưng bạn dự định bán gói trả phí cho từng khách hàng. Tính năng nào của API Gateway giúp bạn làm điều này?

- A. Usage Plans & API Keys
- B. CORS
- C. Lambda Authorizers
- D. Deployment Stages

<details><summary>Đáp án</summary>

**A.** Usage plan đặt throttle và quota cho từng gói; API key nhận diện và đo lường từng khách hàng.
</details>

**Câu 11.** Ứng dụng serverless gồm API Gateway, Lambda và DynamoDB. Gần đây người dùng phàn nàn có exception ở một số request, và một số API call bị chậm. Bạn nên dùng gì để khắc phục sự cố và xác định vấn đề nằm ở đâu?

- A. CloudWatch Logs
- B. CloudWatch Detailed Metrics
- C. X-Ray

<details><summary>Đáp án</summary>

**C.** X-Ray trace request xuyên suốt API Gateway → Lambda → DynamoDB, chỉ ra chặng nào lỗi hoặc chậm. Logs và metrics chỉ cho thấy từng phần riêng lẻ.
</details>

**Câu 12.** API của bạn được dùng bởi rất nhiều người dùng từ các domain khác nhau. Bạn cần ______.

- A. Deploy một Stage mới cho mỗi người dùng
- B. Bật CORS
- C. Tạo Stage Variable cho mỗi người dùng

<details><summary>Đáp án</summary>

**B.** Trình duyệt chặn request cross-origin nếu API không trả header CORS phù hợp.
</details>

**Câu 13.** Bạn muốn xác thực các request gửi tới API. Mọi request đều có Bearer token trong HTTP header `Authorization`. Token phải được kiểm tra với một nhà cung cấp bên thứ ba. Bạn nên dùng gì?

- A. IAM Roles với API Gateway
- B. API Gateway Lambda Authorizer
- C. Cognito User Pools với API Gateway

<details><summary>Đáp án</summary>

**B.** Lambda Authorizer (TOKEN) nhận bearer token, tự kiểm tra với bên thứ ba và trả về IAM policy.
</details>

**Câu 14.** Bạn muốn người dùng xác thực bằng Facebook trước khi gọi API trên API Gateway. Nên dùng gì để tích hợp xác thực liền mạch?

- A. Cognito Sync
- B. DynamoDB Table với Lambda Authorizer
- C. Cognito User Pools
- D. Cognito Federated Identity Pools

<details><summary>Đáp án</summary>

**C.** Cognito User Pools hỗ trợ đăng nhập qua social identity provider (Facebook, Google, Amazon, Apple) và tích hợp sẵn với API Gateway qua Cognito authorizer. Identity Pools cấp AWS credentials tạm thời, không phải cơ chế authorizer trực tiếp; Cognito Sync đã cũ và dùng để đồng bộ dữ liệu.
</details>

**Câu 15.** Mã lỗi HTTP nào API Gateway trả về khi có quá nhiều request?

- A. 400
- B. 403
- C. 429
- D. 502

<details><summary>Đáp án</summary>

**C. 429 Too Many Requests** (throttling hoặc vượt quota) — lỗi client, retry được với exponential backoff.
</details>

**Câu 16.** Metric CloudWatch nào giúp phân tích lỗi timeout giữa API Gateway và Lambda?

- A. CacheHitCount
- B. IntegrationLatency
- C. CacheMissCount
- D. Count

<details><summary>Đáp án</summary>

**B.** IntegrationLatency đo thời gian backend (Lambda) phản hồi API Gateway; tiến sát 29 giây là dấu hiệu timeout (504).
</details>

**Câu 17.** API Gateway hỗ trợ giao thức WebSocket cho các API real-time. (Đúng/Sai)

<details><summary>Đáp án</summary>

**Đúng.** API Gateway có loại **WebSocket API** cho giao tiếp hai chiều thời gian thực.
</details>

---

[← Chương 22](ch22-aws-serverless-dynamodb.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chương 24 →](ch24-aws-cicd-codecommit-codepipeline-codeb.md)

