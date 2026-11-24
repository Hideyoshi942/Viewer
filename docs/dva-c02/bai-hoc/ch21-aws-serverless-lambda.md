# Chương 21 – AWS Serverless: Lambda

> **Nguồn:** Thư mục chương không có transcript video, nên nội dung được biên soạn theo **đề cương (syllabus) của khoá học** và tài liệu chuẩn của AWS về Lambda. Số thứ tự video trong bảng chỉ mang tính **ước lượng** theo thứ tự bài giảng, có thể lệch so với khoá học thực tế. Phần *Câu hỏi ôn tập* là bộ câu hỏi tự soạn theo phong cách đề thi (không phải quiz gốc của khoá).
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung để bám sát thực tế hiện nay (2026). Kỳ thi hiện hành là **DVA-C02**; Lambda là chủ đề **nặng ký nhất** của đề (xuất hiện gần như trong mọi domain: Development, Security, Deployment, Troubleshooting).

## Mục tiêu chương

Sau chương này bạn có thể:

- Giải thích **serverless** là gì và vì sao Lambda là trung tâm của kiến trúc serverless trên AWS.
- Phân biệt 3 mô hình gọi Lambda: **Synchronous**, **Asynchronous** (S3, SNS, EventBridge…) và **Event Source Mapping** (Kinesis, DynamoDB Streams, SQS); biết cơ chế retry, DLQ, Destinations của từng loại.
- Tích hợp Lambda với **ALB** (kể cả multi-header values), **EventBridge**, **S3 Event Notifications**.
- Đọc hiểu **event** và **context object**; cấu hình **execution role**, **resource-based policy**, **environment variables** (mã hoá bằng KMS).
- Giám sát Lambda bằng **CloudWatch Logs/Metrics** và **X-Ray**; phân biệt **Lambda@Edge** và **CloudFront Functions**.
- Đặt Lambda trong **VPC**, tối ưu **memory/CPU, timeout, /tmp, execution context**; dùng **Layers**, **EFS**.
- Hiểu **concurrency** (unreserved, reserved, provisioned), **throttling**, **cold start**, **SnapStart**.
- Đóng gói và triển khai: **deployment package** (zip, S3, container image), **CloudFormation** (inline, S3 + `S3ObjectVersion`).
- Dùng **Versions & Aliases**, **CodeDeploy** (Linear/Canary/AllAtOnce), **Function URL**, **CodeGuru Profiler**; nắm **limits** và **best practices**.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001–003 | Section Introduction, Serverless Introduction, AWS Lambda Overview | Bài 1 – Serverless và tổng quan AWS Lambda |
| 004–005 | Lambda Synchronous Invocations | Bài 2 – Synchronous Invocations |
| 006–007 | Lambda & Application Load Balancer | Bài 3 – Lambda và Application Load Balancer |
| 008–009 | Lambda Asynchronous Invocations & DLQ | Bài 4 – Asynchronous Invocations và DLQ |
| 010–011 | Lambda & CloudWatch Events / EventBridge | Bài 5 – Lambda và Amazon EventBridge |
| 012–013 | Lambda & S3 Event Notifications | Bài 6 – Lambda và S3 Event Notifications |
| 014–016 | Lambda Event Source Mapping (+ Hands On SQS) | Bài 7 – Event Source Mapping |
| 017 | Lambda Event & Context Objects | Bài 8 – Event Object và Context Object |
| 018–019 | Lambda Destinations | Bài 9 – Lambda Destinations |
| 020–021 | Lambda Permissions – IAM Roles & Resource Policies | Bài 10 – Execution Role và Resource-based Policy |
| 022–023 | Lambda Environment Variables | Bài 11 – Environment Variables |
| 024–025 | Lambda Monitoring & X-Ray Tracing | Bài 12 – Logging, Monitoring và X-Ray Tracing |
| 026 | Customization at the Edge – Lambda@Edge & CloudFront Functions | Bài 13 – Lambda@Edge và CloudFront Functions |
| 027–028 | Lambda in VPC | Bài 14 – Lambda trong VPC |
| 029–031 | Lambda Function Performance | Bài 15 – Hiệu năng: Memory, Timeout, Execution Context, /tmp |
| 032–033 | Lambda Layers | Bài 16 – Lambda Layers |
| 034 | Lambda File Systems Mounting | Bài 17 – Lambda và Amazon EFS |
| 035–036 | Lambda Concurrency | Bài 18 – Concurrency, Throttling, Cold Start, SnapStart |
| 037–041 | External Dependencies, Lambda & CloudFormation, Container Images | Bài 19 – Deployment Package, CloudFormation và Container Image |
| 042–043 | Lambda Versions & Aliases | Bài 20 – Versions và Aliases |
| 044–046 | Lambda & CodeDeploy, Lambda Function URL | Bài 21 – CodeDeploy và Function URL |
| 047–049 | Lambda & CodeGuru Profiling, Lambda Limits, Lambda Best Practices | Bài 22 – CodeGuru Profiler, Limits và Best Practices |
| Quiz | Lambda Quiz (tự soạn) | Câu hỏi ôn tập |

---

## Bài 1 – Serverless và tổng quan AWS Lambda

### Lý thuyết

#### Serverless là gì

- **Serverless** là mô hình mà developer **không cần quản lý server**: không provision, không vá OS, không lo scale. Bạn chỉ **deploy code** (ban đầu là *function*, nên còn gọi là **FaaS – Function as a Service**).
- "Serverless" **không có nghĩa là không có server**, chỉ là server do AWS quản lý, bạn không nhìn thấy.
- Ban đầu serverless = Lambda; ngày nay bao gồm mọi dịch vụ được quản lý toàn phần, **scale tự động** và **trả tiền theo mức dùng**.

| Nhóm | Dịch vụ serverless trên AWS |
|---|---|
| Compute | **AWS Lambda**, Fargate (container) |
| API | **API Gateway**, AppSync (GraphQL) |
| Database | **DynamoDB**, Aurora Serverless |
| Storage | **S3** |
| Messaging | **SQS**, **SNS**, Kinesis Data Firehose, **EventBridge** |
| Auth | **Cognito** |
| Orchestration | **Step Functions** |

Kiến trúc serverless điển hình:

```
Người dùng ──► CloudFront + S3 (static web)
         └──► API Gateway ──► Lambda ──► DynamoDB
                  ▲
               Cognito (đăng nhập)
```

#### EC2 so với Lambda

| Tiêu chí | Amazon EC2 | AWS Lambda |
|---|---|---|
| Bản chất | Virtual server trên cloud | **Virtual function**, không có server để quản lý |
| Giới hạn tài nguyên | Theo instance type (RAM, CPU) | Bị giới hạn **thời gian** (tối đa **15 phút**) và memory |
| Chạy | **Liên tục** (trả tiền cả khi rảnh) | **On-demand**, chỉ chạy khi được gọi |
| Scale | Cần Auto Scaling Group, can thiệp | **Tự động** scale |
| Tính phí | Theo giờ/giây instance chạy | Theo **số request** + **thời gian tính toán** (GB-giây) |

#### Lợi ích của Lambda

- **Giá rẻ, dễ dự toán**: trả theo request và thời gian chạy.
- **Free tier**: **1.000.000 request** và **400.000 GB-giây** compute mỗi tháng.
- Tích hợp với **toàn bộ hệ sinh thái AWS**, hỗ trợ nhiều ngôn ngữ lập trình.
- Monitoring dễ qua **CloudWatch**.
- Tăng tài nguyên dễ: tối đa **10 GB RAM** mỗi function; **tăng RAM thì CPU và network cũng tăng** theo.

#### Ngôn ngữ (runtime) được hỗ trợ

- **Node.js** (JavaScript/TypeScript), **Python**, **Java**, **C# (.NET)** / PowerShell, **Ruby**.
- **Custom Runtime API** (`provided.al2023`): chạy bất kỳ ngôn ngữ nào (Go, Rust, C++, PHP…) qua cơ chế bootstrap (dự án cộng đồng).
- **Lambda Container Image**: image phải implement **Lambda Runtime API**. ECS/Fargate vẫn được ưu tiên để chạy Docker image *tuỳ ý*.

#### Các tích hợp chính

| Dịch vụ | Cách dùng với Lambda |
|---|---|
| API Gateway | Tạo REST/HTTP API gọi Lambda |
| Kinesis | Biến đổi dữ liệu stream |
| DynamoDB | Trigger khi dữ liệu thay đổi (Streams) |
| S3 | Trigger khi có object mới/bị xoá |
| CloudFront | Lambda@Edge |
| EventBridge | Phản ứng sự kiện hạ tầng, chạy theo lịch (cron) |
| CloudWatch Logs | Stream log về Lambda để xử lý |
| SNS | Phản ứng với notification |
| SQS | Xử lý message trong queue |
| Cognito | Phản ứng khi user đăng nhập/đăng ký (triggers) |

Ví dụ kinh điển:
- **Serverless thumbnail**: upload ảnh lên S3 → trigger Lambda → tạo thumbnail → lưu thumbnail vào S3 + metadata (tên, kích thước, ngày tạo) vào DynamoDB.
- **Serverless CRON job**: EventBridge rule chạy mỗi 1 giờ → trigger Lambda thực hiện tác vụ (không cần EC2 chạy cron).

#### Mô hình tính giá

- **Theo số request**: 1 triệu request đầu miễn phí; sau đó **0,20 USD / 1 triệu request** (0,0000002 USD/request).
- **Theo thời gian** (làm tròn tới **1 ms**): 400.000 GB-giây miễn phí mỗi tháng, tương đương 400.000 giây nếu function dùng 1 GB RAM, hoặc 3.200.000 giây nếu dùng 128 MB. Sau đó khoảng **1 USD / 600.000 GB-giây** (x86).
- Lambda thường **rất rẻ**, là lựa chọn phổ biến.

### Kiến thức thực tế

- **Runtime hiện hành (2026)** – ví dụ: Node.js **22/24**, Python **3.12/3.13/3.14**, Java **17/21/25**, .NET **8** (và .NET 10), Ruby **3.3/3.4**, OS-only `provided.al2023`. Runtime `go1.x` và `provided` (Amazon Linux 1) đã bị **deprecated**, Go/Rust giờ dùng `provided.al2023`. Danh sách thay đổi liên tục, luôn kiểm tra trang *Lambda runtimes* trước khi chọn.
- Kiến trúc CPU: **x86_64** hoặc **arm64 (Graviton2)**. arm64 rẻ hơn khoảng **20%** cho mỗi GB-giây và thường nhanh hơn với nhiều workload; hãy thử arm64 trước nếu dependency hỗ trợ.
- Tài khoản tạo từ **15/07/2025** dùng mô hình **Free Tier mới (credit)**; quota "always free" của Lambda (1M request, 400.000 GB-s) vẫn là con số đề thi dùng.
- Tạo function bằng CLI:

  ```bash
  zip function.zip lambda_function.py
  aws lambda create-function --function-name hello-world \
    --runtime python3.13 --architectures arm64 \
    --handler lambda_function.lambda_handler \
    --role arn:aws:iam::123456789012:role/hello-world-role \
    --zip-file fileb://function.zip
  ```

### Ghi nhớ cho kỳ thi

- Lambda: **serverless, on-demand, scale tự động**, tối đa **15 phút**/lần chạy, **128 MB – 10 GB** RAM.
- **Tăng RAM = tăng CPU + network**. Đề hỏi "function chạy chậm vì CPU" → tăng **memory** (không có setting CPU riêng).
- Giá: theo **request** + **GB-giây**; free tier **1M request + 400.000 GB-s**/tháng.
- Muốn chạy Docker image bất kỳ → **ECS/Fargate**; Lambda chỉ chạy image implement **Lambda Runtime API**.

---

## Bài 2 – Synchronous Invocations

### Lý thuyết

- **Synchronous** (đồng bộ): caller **chờ** kết quả, kết quả trả về ngay cho caller.
- Gọi đồng bộ khi dùng:
  - **CLI, SDK** (mặc định `RequestResponse`), **API Gateway**, **Application Load Balancer**.
- **Xử lý lỗi nằm ở phía client**: Lambda **không retry** với sync invocation. Muốn retry thì client tự làm (exponential backoff…).

```
Client (SDK/CLI) ──invoke──► Lambda
       ◄────── response ──────┘
Client ──► API Gateway ──proxy──► Lambda ──► response trả ngược lại
```

Các dịch vụ gọi Lambda **đồng bộ**:

| Loại | Dịch vụ |
|---|---|
| Do người dùng gọi | Elastic Load Balancing (ALB), Amazon API Gateway, Amazon CloudFront (**Lambda@Edge**), Amazon S3 Batch Operations |
| Do dịch vụ gọi | Amazon Cognito (triggers), AWS Step Functions |
| Khác | Amazon Lex, Amazon Alexa, Kinesis Data Firehose (transformation) |

- Payload tối đa cho sync invocation: **6 MB** request và **6 MB** response.

### Kiến thức thực tế

- Lambda báo lỗi trong function (exception) vẫn trả **HTTP 200** cho API `Invoke`, nhưng có header `X-Amz-Function-Error: Unhandled` và body là `errorMessage`. Lỗi 4xx/5xx thật là lỗi ở tầng service (ví dụ `429 TooManyRequestsException` khi bị throttle, `413 RequestEntityTooLarge` khi payload > 6 MB).
- SDK (boto3, SDK v3) **tự retry** các lỗi tạm thời như throttle (theo cấu hình retry mode của SDK), nhưng **không** retry lỗi trong code của bạn.
- Gọi bằng Python:

  ```python
  import boto3, json
  client = boto3.client("lambda")
  resp = client.invoke(FunctionName="demo-lambda",
                       InvocationType="RequestResponse",
                       Payload=json.dumps({"key1": "value1"}))
  print(resp["StatusCode"], resp.get("FunctionError"), resp["Payload"].read())
  ```

### Ghi nhớ cho kỳ thi

- Sync: **CLI, SDK, API Gateway, ALB, Lambda@Edge, Cognito, Step Functions**.
- Sync → **client tự xử lý lỗi và retry**.
- `--invocation-type RequestResponse` (mặc định) là sync; `Event` là async; `DryRun` chỉ kiểm tra quyền.
- Payload sync tối đa **6 MB**.

---

## Bài 3 – Lambda và Application Load Balancer

### Lý thuyết

- Muốn expose Lambda ra **HTTP(S)** endpoint: dùng **ALB** (hoặc API Gateway, hoặc Function URL).
- Lambda phải được đăng ký trong một **Target Group** (target type = `lambda`).
- ALB gọi Lambda **đồng bộ**.

```
Client ──HTTP/HTTPS──► ALB ──(sync)──► Target Group ──► Lambda
```

#### Chuyển đổi HTTP ↔ JSON

ALB biến request HTTP thành **JSON event**:

```json
{
  "requestContext": {
    "elb": { "targetGroupArn": "arn:aws:elasticloadbalancing:...:targetgroup/lambda-tg/..." }
  },
  "httpMethod": "GET",
  "path": "/lambda",
  "queryStringParameters": { "query": "1234ABCD" },
  "headers": { "connection": "keep-alive", "user-agent": "Mozilla/5.0 ..." },
  "body": "",
  "isBase64Encoded": false
}
```

- ELB info (`targetGroupArn`), **HTTP method & path**, **query string** (dạng key/value), **headers** (key/value), **body** (cho POST, PUT…) và cờ **isBase64Encoded**.

Lambda phải trả về **JSON** để ALB chuyển lại thành HTTP response:

```json
{
  "statusCode": 200,
  "statusDescription": "200 OK",
  "isBase64Encoded": false,
  "headers": { "Content-Type": "text/html; charset=utf-8" },
  "body": "<h1>Hello from Lambda!</h1>"
}
```

#### Multi-header values

- HTTP cho phép một tham số xuất hiện **nhiều lần**, ví dụ `http://example.com/path?name=foo&name=bar`.
- Bật **Multi-value headers** trên **Target Group** (attribute `lambda.multi_value_headers.enabled`): ALB chuyển header và query string có nhiều giá trị thành **mảng**:

  ```json
  "multiValueQueryStringParameters": { "name": ["foo", "bar"] }
  ```

- Khi bật, Lambda cũng phải trả về `multiValueHeaders` thay vì `headers`.

### Kiến thức thực tế

- Lỗi **502** từ ALB gần như luôn do Lambda trả **sai định dạng response** (thiếu `statusCode`, body không phải string) hoặc response > **1 MB** (giới hạn response body khi Lambda đứng sau ALB).
- ALB + Lambda hợp khi bạn đã có ALB cho các service khác và muốn route một path (`/api/report`) tới Lambda. Cần auth, throttling, API key, caching → **API Gateway**. Chỉ cần một HTTPS endpoint đơn giản → **Function URL** (Bài 21).

### Ghi nhớ cho kỳ thi

- ALB → Lambda: Lambda nằm trong **Target Group**, gọi **sync**, request HTTP được chuyển thành **JSON**.
- Query string/headers trùng tên → bật **multi-header values** trên target group → nhận **mảng**.
- ALB cần quyền gọi Lambda qua **resource-based policy** của function.

---

## Bài 4 – Asynchronous Invocations và DLQ

### Lý thuyết

- **Asynchronous** (bất đồng bộ): caller **không chờ** kết quả. Áp dụng cho các dịch vụ như **S3, SNS, EventBridge (CloudWatch Events)**…
- Event được đưa vào một **Event Queue nội bộ** của Lambda (bạn không thấy queue này), rồi Lambda đọc ra để xử lý.

```
S3 ──event──► [ Lambda internal Event Queue ] ──► Lambda function
                         ▲         │ lỗi
                         └─retry───┘   (tối đa 3 lần chạy tổng cộng)
                                   │ vẫn lỗi
                                   ▼
                      DLQ (SQS / SNS) hoặc On-failure Destination
```

#### Retry và hệ quả

- Khi lỗi, Lambda **tự retry tổng cộng 3 lần thử** (1 lần đầu + **2 lần retry**):
  - Lần retry 1 sau khoảng **1 phút**, lần retry 2 sau khoảng **2 phút** nữa.
- Vì có retry → **xử lý trùng lặp** có thể xảy ra → function phải **idempotent** (chạy lại nhiều lần với cùng event cho cùng kết quả).
- Khi retry, bạn sẽ thấy **log trùng** trong CloudWatch Logs.
- Cấu hình được: **Maximum retry attempts** (0–2) và **Maximum age of event** (60 giây – **6 giờ**).

#### Dead Letter Queue (DLQ)

- Sau khi hết retry, event lỗi được gửi tới **DLQ**: **SQS** hoặc **SNS**.
- DLQ được cấu hình trong *Asynchronous invocation* của function; execution role cần quyền `sqs:SendMessage` / `sns:Publish`.
- DLQ chỉ nhận **event gốc** (kèm vài attribute lỗi cơ bản). AWS khuyến nghị dùng **Destinations** (Bài 9) thay cho DLQ.

#### Vì sao dùng async

- Tăng tốc xử lý khi không cần chờ kết quả (ví dụ xử lý 1.000 file song song).
- Ví dụ: **S3 → Lambda**, **SNS → Lambda**, **EventBridge → Lambda**.

Các dịch vụ gọi Lambda **bất đồng bộ** (cần nhớ):

| Dịch vụ | Ghi chú |
|---|---|
| **Amazon S3** | Event Notifications |
| **Amazon SNS** | Notifications |
| **Amazon EventBridge** | Rule, scheduler |
| AWS CodeCommit | Trigger (new branch, commit, push) |
| AWS CodePipeline | Invoke Lambda; function phải gọi lại `PutJobSuccessResult`/`PutJobFailureResult` |
| Amazon CloudWatch Logs | Subscription filter |
| Amazon SES | Nhận email |
| AWS CloudFormation | Custom Resource |
| AWS Config | Custom rule |
| AWS IoT, IoT Events | |

### Kiến thức thực tế

- Giới hạn payload async: đề thi (và tài liệu khoá học) dùng **256 KB**. Cuối năm 2025 AWS đã nâng giới hạn payload async lên **1 MB** (phần vượt 256 KB tính phí thêm). Khi làm bài, nếu đáp án có 256 KB thì đó là giá trị "kinh điển" của đề.
- Async không phải "fire and forget" tuyệt đối: nếu bị **throttle** hoặc lỗi hệ thống (5xx), Lambda **giữ event trong queue và retry tới 6 giờ** với exponential backoff, độc lập với 2 lần retry cho lỗi trong code.
- Idempotency trong thực tế: dùng **Powertools for AWS Lambda** (`@idempotent` + DynamoDB) hoặc tự lưu `requestId`/`messageId` đã xử lý với conditional write.

  ```python
  from aws_lambda_powertools.utilities.idempotency import (
      DynamoDBPersistenceLayer, idempotent)
  persistence = DynamoDBPersistenceLayer(table_name="IdempotencyTable")

  @idempotent(persistence_store=persistence)
  def lambda_handler(event, context):
      charge_customer(event["order_id"])
      return {"ok": True}
  ```

### Ghi nhớ cho kỳ thi

- Async: **S3, SNS, EventBridge, CodeCommit, CodePipeline, CloudWatch Logs, SES, CloudFormation, Config, IoT**.
- Lỗi → **3 lần thử** (1 + 2 retry), function phải **idempotent**, thấy **log trùng**.
- Hết retry → **DLQ (SQS/SNS)** hoặc tốt hơn là **On-failure Destination**.
- CLI async: `--invocation-type Event` → trả **202**, không có kết quả.

---

## Bài 5 – Lambda và Amazon EventBridge

### Lý thuyết

Hai cách dùng EventBridge (trước đây là CloudWatch Events) để gọi Lambda:

1. **Schedule (CRON/rate)**: rule chạy mỗi 1 giờ → trigger Lambda thực hiện task. Đây là cách làm **serverless cron job**.
2. **Event pattern**: phản ứng với sự kiện của AWS service, ví dụ **CodePipeline thay đổi state** → trigger Lambda.

```
EventBridge Rule (rate(1 hour))        ──► Lambda (task)
EventBridge Rule (CodePipeline state)  ──► Lambda (xử lý)
```

- EventBridge gọi Lambda **bất đồng bộ** → có retry/DLQ như Bài 4.
- Cần **resource-based policy** trên Lambda cho phép `events.amazonaws.com` gọi function (console tự thêm khi bạn chọn target).

### Kiến thức thực tế

- Lịch chạy mới nên dùng **EventBridge Scheduler** (2022): hỗ trợ time zone, one-time schedule, flexible time window, hàng triệu schedule, retry policy và DLQ riêng.

  ```bash
  aws scheduler create-schedule --name nightly-report \
    --schedule-expression "cron(0 2 * * ? *)" \
    --schedule-expression-timezone "Asia/Ho_Chi_Minh" \
    --flexible-time-window Mode=OFF \
    --target '{"Arn":"arn:aws:lambda:ap-southeast-1:123456789012:function:report","RoleArn":"arn:aws:iam::123456789012:role/scheduler-invoke"}'
  ```

- Lưu ý: EventBridge **Scheduler** dùng **IAM role** (`RoleArn`) để gọi Lambda, còn EventBridge **Rule** dùng **resource-based policy** trên Lambda.

### Ghi nhớ cho kỳ thi

- Cron job serverless = **EventBridge rule (schedule) + Lambda**.
- Phản ứng sự kiện AWS (CodePipeline state change, EC2 state change…) = **EventBridge rule (event pattern) + Lambda**.
- Gọi **async**; Lambda cần **resource-based policy** cho `events.amazonaws.com`.

---

## Bài 6 – Lambda và S3 Event Notifications

### Lý thuyết

- S3 phát event cho: `s3:ObjectCreated:*`, `s3:ObjectRemoved:*`, `s3:ObjectRestore:*`, `s3:Replication:*`…
- Lọc theo **prefix** và **suffix** của object name (ví dụ chỉ `*.jpg`).
- Use case kinh điển: tạo **thumbnail** cho ảnh upload lên S3.
- Đích của S3 Event Notifications: **SNS**, **SQS**, **Lambda** (async) và **EventBridge** (khi bật, mọi event gửi tới EventBridge, từ đó lọc nâng cao, gửi tới nhiều đích, archive/replay).

```
S3 ──► SNS ──fan-out──► nhiều SQS
S3 ──► SQS ──► Lambda (qua Event Source Mapping)
S3 ──(async)──► Lambda ──lỗi──► DLQ (SQS)
S3 ──► EventBridge ──rules──► nhiều đích
```

- S3 Event Notifications thường đến trong **vài giây**, đôi khi có thể **một phút hoặc lâu hơn**.
- **Quan trọng:** nếu **hai lần ghi** vào **cùng một object không có versioning** diễn ra cùng lúc, có thể chỉ nhận **một** notification. Muốn đảm bảo mỗi lần ghi đều có notification → **bật versioning** trên bucket.

#### Mẫu kiến trúc metadata

```
Upload ──► S3 ──event──► Lambda ──► cập nhật metadata vào DynamoDB / RDS
```

### Kiến thức thực tế

- **Bẫy vòng lặp vô hạn (recursive loop):** function đọc ảnh từ bucket A rồi ghi thumbnail **vào chính bucket A** với cùng event filter → trigger lại chính nó → chi phí bùng nổ. Cách tránh: ghi sang **bucket khác**, hoặc dùng prefix filter tách biệt (`uploads/` → `thumbnails/`). Lambda có **recursive loop detection** (từ 2023, ban đầu cho SQS/SNS, sau mở rộng thêm S3) tự dừng vòng lặp, nhưng đừng dựa vào đó.
- Key trong event bị **URL-encode** (dấu cách thành `+`), quên decode sẽ gặp `NoSuchKey`.
- Muốn lọc phức tạp (theo kích thước object, metadata…) → bật **EventBridge** trên bucket và viết event pattern.

### Ghi nhớ cho kỳ thi

- S3 → Lambda là **async**; lỗi → retry → DLQ/Destination.
- Lọc bằng **prefix/suffix**; muốn mỗi lần ghi đều có event → bật **versioning**.
- Cần **resource-based policy** cho `s3.amazonaws.com`.
- Fan-out một event S3 tới nhiều consumer → **SNS + SQS** hoặc **EventBridge**.

---

## Bài 7 – Event Source Mapping

### Lý thuyết

**Event Source Mapping (ESM)** là mô hình gọi thứ ba: **Lambda tự đi poll (lấy) record** từ nguồn, rồi gọi function **đồng bộ** với một **batch** record. Áp dụng cho:

- **Kinesis Data Streams**
- **SQS** và **SQS FIFO**
- **DynamoDB Streams**
- (Ngoài ra: Amazon MSK, self-managed Kafka, Amazon MQ, DocumentDB)

```
Kinesis / DynamoDB Streams / SQS
        ▲  poll
        │
[ Event Source Mapping (do Lambda quản lý) ] ──invoke sync với batch──► Lambda
```

- Nguồn **không** chủ động gọi Lambda → **execution role** của Lambda phải có quyền đọc nguồn (ví dụ `AWSLambdaSQSQueueExecutionRole`, `AWSLambdaKinesisExecutionRole`, `AWSLambdaDynamoDBExecutionRole`). Không cần resource-based policy.

#### Streams (Kinesis & DynamoDB Streams)

- ESM tạo một **iterator cho mỗi shard**, xử lý record **theo thứ tự** trong shard.
- Vị trí bắt đầu: **TRIM_HORIZON** (từ đầu), **LATEST** (chỉ record mới), **AT_TIMESTAMP** (Kinesis).
- Record đã xử lý **không bị xoá** khỏi stream (consumer khác vẫn đọc được).
- **Traffic thấp**: dùng **batch window** (`MaximumBatchingWindowInSeconds`, tối đa 300 giây) để gom record trước khi gọi.
- **Traffic cao**: xử lý **song song nhiều batch ở mức shard** với **Parallelization Factor** (tối đa **10 batch/shard**). Thứ tự vẫn được đảm bảo **theo partition key**.

```
Shard 1 ──► batch ──► Lambda instance (tối đa 10 song song/shard, giữ thứ tự theo partition key)
Shard 2 ──► batch ──► Lambda instance
```

**Xử lý lỗi với streams:**

- Mặc định: nếu function lỗi, **cả batch được retry** cho tới khi **thành công** hoặc **record hết hạn** trong stream → **shard bị chặn** (blocked) để giữ thứ tự.
- Các tuỳ chọn:
  - **Discard old events** – `MaximumRecordAgeInSeconds`; record bị bỏ có thể gửi tới **On-failure destination**.
  - **Restrict number of retries** – `MaximumRetryAttempts`.
  - **Split batch on error** (`BisectBatchOnFunctionError`) – chia đôi batch để cô lập record lỗi, tránh lỗi timeout/bad record kéo cả batch.
  - **Partial batch response** – function trả về danh sách record lỗi (`ReportBatchItemFailures`), chỉ retry từ record lỗi.

#### Queues (SQS & SQS FIFO)

- ESM **poll SQS bằng Long Polling**.
- **Batch size**: 1–10 message (Standard có thể tới **10.000** nếu đặt batch window ≥ 1 giây).
- Khuyến nghị đặt **Visibility Timeout của queue = 6 × timeout của Lambda**.
- Muốn DLQ → cấu hình **DLQ trên SQS queue** (redrive policy), **không phải** trên Lambda (DLQ của Lambda chỉ dành cho async invocation).
- Thứ tự:
  - **SQS FIFO**: xử lý **theo thứ tự trong mỗi message group**; số Lambda chạy song song tối đa = **số message group** đang hoạt động.
  - **SQS Standard**: **không** đảm bảo thứ tự.
- Khi lỗi, batch message quay lại queue (hết visibility timeout) để xử lý lại → có thể xử lý trùng; nên dùng **partial batch response**.
- Lambda **xoá message** khỏi queue khi function xử lý thành công.

#### Scaling

| Nguồn | Cách scale |
|---|---|
| Kinesis / DynamoDB Streams | **1 Lambda invocation mỗi shard**; với parallelization factor tối đa **10 batch/shard** |
| SQS Standard | Scale nhanh: thêm tới **60 instance/phút** (giá trị khoá học); tối đa **1.000 batch** xử lý đồng thời |
| SQS FIFO | Message cùng group xử lý theo thứ tự; scale tới **số active message group** |

#### Partial batch response

Bật `FunctionResponseTypes: ["ReportBatchItemFailures"]` trên ESM, rồi trả về các item lỗi:

```python
def lambda_handler(event, context):
    failures = []
    for record in event["Records"]:
        try:
            process(record["body"])
        except Exception:
            failures.append({"itemIdentifier": record["messageId"]})
    return {"batchItemFailures": failures}
```

- Với SQS: `itemIdentifier` = `messageId` → chỉ message lỗi quay lại queue.
- Với Kinesis/DynamoDB Streams: `itemIdentifier` = **sequence number** → Lambda retry từ record lỗi trở đi (checkpoint).

### Kiến thức thực tế

- Scale của SQS ESM đã được cải thiện (2023): tăng tới khoảng **300 concurrent execution/phút**, tối đa **1.250**; có thể đặt **Maximum concurrency** (2–1.000) trên ESM để không "dội" downstream. Đề thi có thể vẫn dùng con số cũ (60/phút, 1.000 batch).
- **Event filtering** trên ESM (2021): lọc record **trước** khi gọi Lambda (ví dụ chỉ `eventName = INSERT` của DynamoDB Streams), giảm chi phí invocation. Message SQS bị lọc ra sẽ **bị xoá** khỏi queue.

  ```json
  { "Filters": [ { "Pattern": "{\"eventName\": [\"INSERT\"]}" } ] }
  ```

- **Provisioned mode** cho ESM (Kafka, rồi SQS) cho phép đặt số poller tối thiểu/tối đa khi cần throughput cao, ổn định.
- Lỗi "poison message" làm SQS xử lý lại vô hạn → luôn đặt **maxReceiveCount** + DLQ trên queue.

### Ghi nhớ cho kỳ thi

- ESM: **Kinesis, DynamoDB Streams, SQS (FIFO)** – Lambda **poll**, gọi **sync** theo **batch**; quyền nằm ở **execution role**.
- Streams lỗi → **cả batch retry tới khi thành công/hết hạn**, shard bị chặn → dùng **bisect batch**, **max retry**, **max record age**, **on-failure destination**.
- SQS: **long polling**, **visibility timeout = 6 × Lambda timeout**, **DLQ cấu hình trên SQS** (không phải Lambda).
- FIFO: concurrency = **số message group**; Kinesis: tối đa **10 batch song song/shard**.
- Muốn chỉ retry record lỗi → **ReportBatchItemFailures** (partial batch response).

---

## Bài 8 – Event Object và Context Object

### Lý thuyết

Mỗi lần gọi, handler nhận 2 tham số:

```
EventBridge ──► Lambda handler(event, context)
                  │       └─ Context object: metadata về lần gọi & môi trường runtime
                  └─ Event object: dữ liệu của sự kiện (JSON)
```

| | **Event object** | **Context object** |
|---|---|---|
| Là gì | Tài liệu JSON chứa **dữ liệu để function xử lý** | **Metadata** về lần invocation, function, môi trường runtime |
| Do ai tạo | **Dịch vụ gọi** (S3, SQS, API Gateway, EventBridge…) | **Lambda runtime** |
| Ví dụ nội dung | `source`, `detail`, `Records`, `body`, input arguments | `aws_request_id`, `function_name`, `memory_limit_in_mb`… |
| Chuyển đổi | Runtime chuyển JSON thành object (dict trong Python) | Truyền vào lúc runtime |

Thuộc tính quan trọng của **context** (Python):

| Thuộc tính | Ý nghĩa |
|---|---|
| `aws_request_id` | ID của lần gọi (dùng để trace, idempotency) |
| `function_name`, `function_version` | Tên và version đang chạy |
| `invoked_function_arn` | ARN đã gọi (cho biết có gọi qua **alias** hay không) |
| `memory_limit_in_mb` | Memory được cấp |
| `log_group_name`, `log_stream_name` | Nơi ghi log CloudWatch |
| `get_remaining_time_in_millis()` | Thời gian còn lại trước khi **timeout** |
| `identity`, `client_context` | Thông tin Cognito / mobile client (nếu có) |

```python
def lambda_handler(event, context):
    print("Event source:", event.get("source"))
    print("Region:", event.get("region"))
    print("Request ID:", context.aws_request_id)
    print("Function:", context.function_name, context.function_version)
    print("Memory:", context.memory_limit_in_mb, "MB")
    print("Log:", context.log_group_name, context.log_stream_name)
    print("Remaining ms:", context.get_remaining_time_in_millis())
    return {"ok": True}
```

Node.js:

```javascript
export const handler = async (event, context) => {
  console.log("Request ID:", context.awsRequestId);
  console.log("Remaining:", context.getRemainingTimeInMillis());
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
```

### Kiến thức thực tế

- Dùng `get_remaining_time_in_millis()` để dừng sớm vòng lặp xử lý batch dài, lưu tiến độ trước khi bị timeout (ví dụ còn < 10 giây thì ghi checkpoint và return).
- Node.js: handler kiểu **callback** không còn được khuyến nghị (runtime Node.js 24 bỏ hỗ trợ callback handler), hãy dùng `async`/`await`.
- `context.callbackWaitsForEmptyEventLoop = false` (Node.js) giúp return ngay mà không chờ các connection mở (ví dụ DB pool khai báo ngoài handler).

### Ghi nhớ cho kỳ thi

- **Event** = dữ liệu từ nguồn gọi; **Context** = metadata runtime (**request ID**, tên function, memory, log group, **thời gian còn lại**).
- Câu hỏi "lấy request ID / thời gian còn lại trước timeout" → **context object**.

---

## Bài 9 – Lambda Destinations

### Lý thuyết

- Ra mắt **11/2019**: gửi **kết quả** của một lần gọi tới một đích, cho cả **thành công** và **thất bại**.
- Với **async invocation**, cấu hình đích cho **On success** và **On failure**:
  - **Amazon SQS**
  - **Amazon SNS**
  - **AWS Lambda** (function khác)
  - **Amazon EventBridge** bus
  - (Từ 11/2024: **Amazon S3** cho On failure)
- AWS **khuyến nghị dùng Destinations thay cho DLQ**: Destinations gửi **invocation record** chứa cả request lẫn response/lỗi chi tiết, và có nhiều loại đích hơn. (DLQ vẫn dùng được song song.)
- Với **Event Source Mapping**: chỉ dùng cho **batch bị loại bỏ** (discarded) – **On failure** gửi tới **SQS, SNS** (và S3 cho một số nguồn). Với SQS ESM thì dùng DLQ của SQS.

```
                           ┌── On success ──► SQS / SNS / Lambda / EventBridge
Async invoke ──► Lambda ───┤
                           └── On failure ──► SQS / SNS / Lambda / EventBridge / S3

Kinesis/DynamoDB ESM ──► Lambda ──(batch bị bỏ)──► On failure: SQS / SNS / S3
```

Ví dụ **invocation record** gửi tới đích:

```json
{
  "version": "1.0",
  "timestamp": "2026-10-15T09:10:00.000Z",
  "requestContext": {
    "requestId": "e4b4...",
    "functionArn": "arn:aws:lambda:eu-west-1:123456789012:function:lambda-s3:$LATEST",
    "condition": "RetriesExhausted",
    "approximateInvokeCount": 3
  },
  "requestPayload": { "Records": [ "..." ] },
  "responseContext": { "statusCode": 200, "functionError": "Unhandled" },
  "responsePayload": { "errorMessage": "Boom", "errorType": "Exception" }
}
```

| | DLQ | Destinations |
|---|---|---|
| Áp dụng | Async | Async (success + failure), ESM (failure) |
| Đích | SQS, SNS | SQS, SNS, Lambda, EventBridge (+ S3 khi failure) |
| Nội dung | Event gốc | Event gốc **+ response/lỗi + metadata** |
| Thành công | Không hỗ trợ | Hỗ trợ **On success** |

### Kiến thức thực tế

- Destinations **chỉ hoạt động với async và ESM**; gọi sync (console Test, API Gateway, SDK `RequestResponse`) **không** kích hoạt destination. Muốn test destination từ CLI phải dùng `--invocation-type Event`.
- Pattern hay dùng: **On failure → EventBridge** để tập trung lỗi của nhiều function và route tới Slack/OpsGenie; **On success → Lambda** để nối chuỗi xử lý đơn giản (chuỗi phức tạp → Step Functions).

### Ghi nhớ cho kỳ thi

- Destinations: **On success / On failure** cho **async**; **On failure** (batch bị bỏ) cho **ESM**.
- Đích: **SQS, SNS, Lambda, EventBridge** (+ S3 cho failure).
- AWS khuyên dùng **Destinations thay DLQ** vì có nhiều thông tin và nhiều loại đích hơn.

---

## Bài 10 – Execution Role và Resource-based Policy

### Lý thuyết

#### Lambda Execution Role (IAM Role)

- Gắn vào function, cấp quyền cho **Lambda gọi các dịch vụ/tài nguyên AWS khác** (Lambda đi ra ngoài).
- Một số **managed policy** mẫu:

| Managed policy | Quyền |
|---|---|
| `AWSLambdaBasicExecutionRole` | Ghi log lên **CloudWatch Logs** |
| `AWSLambdaKinesisExecutionRole` | Đọc từ Kinesis |
| `AWSLambdaDynamoDBExecutionRole` | Đọc từ DynamoDB Streams |
| `AWSLambdaSQSQueueExecutionRole` | Đọc từ SQS |
| `AWSLambdaVPCAccessExecutionRole` | Tạo/xoá **ENI** để chạy trong VPC |
| `AWSXRayDaemonWriteAccess` | Gửi trace lên **X-Ray** |

- Khi dùng **Event Source Mapping**, Lambda dùng **execution role** để **đọc dữ liệu** từ nguồn.
- Best practice: **mỗi function một execution role** riêng, least privilege.

#### Lambda Resource-based Policy

- Cho phép **tài khoản khác** hoặc **dịch vụ AWS khác** **gọi Lambda** (đi vào Lambda).
- Giống **S3 bucket policy**.
- Một IAM principal được phép truy cập Lambda nếu:
  - **IAM policy** gắn với principal cho phép (ví dụ user truy cập hoàn toàn trong cùng account), **hoặc**
  - **Resource-based policy** của Lambda cho phép (ví dụ cross-account, service).
- Khi một **dịch vụ AWS** như **S3** gọi Lambda, resource-based policy cấp quyền cho nó.

```
                 Execution Role (Lambda ──► DynamoDB, S3, SQS, Logs…)
                      │
S3 / SNS / EventBridge / ALB / API Gateway / account khác
        │ được phép bởi Resource-based Policy
        ▼
     Lambda
```

| | Execution Role | Resource-based Policy |
|---|---|---|
| Hướng | Lambda **gọi ra** dịch vụ khác | Dịch vụ/account khác **gọi vào** Lambda |
| Dùng cho | Đọc DynamoDB, ghi S3, poll SQS/Kinesis (ESM), ghi log | S3, SNS, EventBridge, ALB, API Gateway, cross-account invoke |
| Quản lý | IAM role | `aws lambda add-permission` |

### Kiến thức thực tế

- Luôn thêm `--source-arn` (và `--source-account` với S3) khi cấp quyền cho service principal để tránh **confused deputy**.
- Lambda lấy **credentials tạm thời** của execution role qua biến môi trường `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`; SDK tự đọc. **Không bao giờ** hard-code access key vào code/env vars.
- Lỗi `AccessDeniedException` khi function gọi DynamoDB → sửa **execution role**. Lỗi S3 "Unable to validate destination configurations" khi tạo notification → thiếu **resource-based policy**.

### Ghi nhớ cho kỳ thi

- **Execution role** = quyền Lambda **gọi đi** (và **ESM đọc nguồn**).
- **Resource-based policy** = quyền **gọi vào** Lambda (S3, SNS, EventBridge, ALB, API Gateway, **cross-account**).
- Managed policy cần nhớ: `AWSLambdaBasicExecutionRole`, `AWSLambdaVPCAccessExecutionRole`, `AWSLambdaSQSQueueExecutionRole`, `AWSXRayDaemonWriteAccess`.

---

## Bài 11 – Environment Variables

### Lý thuyết

- Environment variable = cặp **key/value** dạng **String**.
- Dùng để **điều chỉnh hành vi function mà không sửa code** (ví dụ `ENVIRONMENT=dev`, `TABLE_NAME=orders`).
- Code đọc được, Lambda cũng tự thêm **biến hệ thống** (ví dụ `AWS_REGION`, `AWS_LAMBDA_FUNCTION_NAME`, `AWS_LAMBDA_FUNCTION_MEMORY_SIZE`, `_HANDLER`, `LAMBDA_TASK_ROOT`).
- Hữu ích để lưu **secret**, được **mã hoá bằng KMS**:
  - Mặc định mã hoá at rest bằng **AWS managed key** (`aws/lambda`).
  - Có thể dùng **Customer Managed Key (CMK)**.
  - **Encryption helpers** (encryption in transit): mã hoá giá trị **phía client** trước khi lưu; code phải tự gọi `kms:Decrypt` (execution role cần quyền này).
- Tổng kích thước tất cả env vars: tối đa **4 KB**.

### Kiến thức thực tế

- Secret thực tế nên để ở **Secrets Manager** hoặc **SSM Parameter Store (SecureString)**, đọc **ngoài handler** và cache. Dùng **AWS Parameters and Secrets Lambda Extension** (layer) để cache qua HTTP `localhost:2773`, giảm số lần gọi API.
- Env vars **hiện rõ** trong console với ai có quyền `lambda:GetFunctionConfiguration`, nên không phải nơi lý tưởng cho secret nhạy cảm.
- Env vars gắn với **version**: khi publish version, cấu hình (kể cả env vars) bị **đóng băng** cùng code.

### Ghi nhớ cho kỳ thi

- Env vars: key/value String, tổng **≤ 4 KB**, mã hoá bằng **KMS** (AWS managed key mặc định hoặc CMK).
- Muốn đổi hành vi theo môi trường mà không sửa code → **environment variables**.
- Mã hoá bằng encryption helper → code phải gọi **`kms:Decrypt`**.

---

## Bài 12 – Logging, Monitoring và X-Ray Tracing

### Lý thuyết

#### CloudWatch Logs

- Log của Lambda tự động lưu vào **CloudWatch Logs**, log group `/aws/lambda/<function-name>`.
- Execution role phải có quyền ghi log → **`AWSLambdaBasicExecutionRole`**.

#### CloudWatch Metrics

- Metric hiển thị trong **CloudWatch Metrics** (và tab Monitor của Lambda):
  - **Invocations**, **Durations**, **Concurrent Executions**
  - **Error count**, **Success rate**, **Throttles**
  - **Async Delivery Failures**
  - **Iterator Age** (Kinesis & DynamoDB Streams): record cũ nhất đã chờ bao lâu → tăng nghĩa là function xử lý không kịp.

#### X-Ray Tracing

- Bật trong cấu hình Lambda: **Active Tracing** (Lambda tự chạy **X-Ray daemon** cho bạn).
- Dùng **AWS X-Ray SDK** trong code (hoặc **ADOT – AWS Distro for OpenTelemetry**).
- Execution role cần managed policy **`AWSXRayDaemonWriteAccess`**.
- Biến môi trường để giao tiếp với X-Ray:

| Biến | Ý nghĩa |
|---|---|
| `_X_AMZN_TRACE_ID` | Chứa tracing header |
| `AWS_XRAY_CONTEXT_MISSING` | Mặc định `LOG_ERROR` |
| `AWS_XRAY_DAEMON_ADDRESS` | `IP_ADDRESS:PORT` của X-Ray daemon |

### Kiến thức thực tế

- **Advanced logging controls** (11/2023): log định dạng **JSON**, đặt **log level** ứng dụng/hệ thống, chọn **log group tuỳ chỉnh** (nhiều function chung log group). Mặc định log group **không hết hạn** → luôn đặt **retention** để tránh tốn tiền.
- **CloudWatch Lambda Insights** (extension) cho metric hệ thống: CPU, memory, network, cold start.
- **CloudWatch Application Signals** hỗ trợ Lambda (2024–2025) để theo dõi SLO.
- X-Ray SDK/daemon đang được AWS chuyển hướng sang **OpenTelemetry (ADOT)**; đề thi vẫn hỏi X-Ray SDK, Active Tracing và 3 biến môi trường trên.

### Ghi nhớ cho kỳ thi

- Log → **CloudWatch Logs** (cần `AWSLambdaBasicExecutionRole`); metric → **CloudWatch Metrics**.
- **IteratorAge** cao → stream consumer xử lý chậm.
- X-Ray: bật **Active Tracing**, dùng X-Ray SDK, role cần **`AWSXRayDaemonWriteAccess`**; biến `_X_AMZN_TRACE_ID`, `AWS_XRAY_CONTEXT_MISSING`, **`AWS_XRAY_DAEMON_ADDRESS`**.

---

## Bài 13 – Lambda@Edge và CloudFront Functions

### Lý thuyết

#### Customization at the Edge

- Nhiều ứng dụng cần chạy logic **tại edge** (gần người dùng) trước khi request tới ứng dụng. **Edge Function** = code gắn vào **CloudFront distribution**, chạy gần user để giảm độ trễ.
- Hai loại: **CloudFront Functions** và **Lambda@Edge**. Đều **serverless**, deploy **toàn cầu**, trả tiền theo mức dùng.
- Use case: website bảo mật & riêng tư, **dynamic web app tại edge**, **SEO**, **routing thông minh** giữa origin/data center, giảm thiểu bot, **image transformation real-time**, **A/B testing**, **user authentication/authorization**, ưu tiên user, theo dõi & analytics.

#### Bốn điểm can thiệp của CloudFront

```
Client ──Viewer Request──► CloudFront ──Origin Request──► Origin
Client ◄─Viewer Response── CloudFront ◄─Origin Response── Origin
```

#### So sánh

| | **CloudFront Functions** | **Lambda@Edge** |
|---|---|---|
| Ngôn ngữ | **JavaScript** | **Node.js, Python** |
| Quy mô | **Hàng triệu request/giây** | Hàng nghìn request/giây |
| Trigger | **Chỉ Viewer Request/Response** | **Cả 4**: Viewer + Origin Request/Response |
| Thời gian chạy tối đa | **< 1 ms** | **5 giây** (viewer), **30 giây** (origin) |
| Memory tối đa | **2 MB** | 128 MB (viewer) – tới 10 GB (origin) |
| Kích thước package | **10 KB** | 1 MB (viewer), 50 MB (origin) |
| Network / file system | **Không** | **Có** |
| Truy cập request body | **Không** | **Có** |
| Giá | Free tier; khoảng **1/6 giá** Lambda@Edge | Không free tier; theo request + duration |
| Nơi quản lý | Native trong CloudFront | Viết ở **us-east-1**, CloudFront replicate ra các location |

**Use case:**

- **CloudFront Functions**: cache key normalization (chuẩn hoá header, cookie, query string, URL), **header manipulation**, **URL rewrite/redirect**, **request authentication/authorization** đơn giản (ví dụ kiểm tra JWT).
- **Lambda@Edge**: thời gian chạy dài (vài ms trở lên), cần CPU/memory điều chỉnh được, code phụ thuộc **thư viện bên thứ 3** (AWS SDK…), cần **network** gọi dịch vụ ngoài, **truy cập file system** hoặc **body** HTTP request.

Ví dụ CloudFront Function (viewer request) thêm header và redirect:

```javascript
function handler(event) {
  var request = event.request;
  if (request.uri === "/old-page") {
    return { statusCode: 301, statusDescription: "Moved Permanently",
             headers: { location: { value: "/new-page" } } };
  }
  request.headers["x-true-client-ip"] = { value: event.viewer.ip };
  return request;
}
```

### Kiến thức thực tế

- CloudFront Functions có runtime **JavaScript 2.0** (ES 2020+) và **CloudFront KeyValueStore** để đọc cấu hình key/value (ví dụ bảng redirect, feature flag) mà không cần redeploy function.
- Lambda@Edge không hỗ trợ: environment variables, Layers, VPC, ARM64, container image, provisioned concurrency; function phải gắn **version cụ thể** (không dùng `$LATEST` hay alias).
- Log của Lambda@Edge nằm ở **CloudWatch Logs của region gần edge location** đã chạy function, không phải chỉ ở us-east-1.

### Ghi nhớ cho kỳ thi

- Logic nhẹ, cực nhanh, quy mô lớn (header, URL rewrite, cache key, JWT đơn giản) → **CloudFront Functions** (viewer only, < 1 ms).
- Cần network, SDK, body, file system, origin request/response, thời gian chạy dài hơn → **Lambda@Edge** (Node.js/Python, tạo ở **us-east-1**).

---

## Bài 14 – Lambda trong VPC

### Lý thuyết

- **Mặc định**, Lambda chạy **bên ngoài VPC của bạn** (trong VPC do AWS sở hữu) → truy cập được **public internet** và **public AWS API** (DynamoDB…), nhưng **không** truy cập được tài nguyên trong VPC của bạn (RDS, ElastiCache, internal ELB…).

```
Lambda (mặc định) ──► Internet, DynamoDB (public API)      ✔
Lambda (mặc định) ──✘──► RDS trong private subnet           ✘
```

- **Lambda trong VPC**: chỉ định **VPC ID**, **Subnets**, **Security Groups**.
  - Lambda tạo **ENI (Elastic Network Interface)** trong subnet của bạn.
  - Execution role cần **`AWSLambdaVPCAccessExecutionRole`** (quyền `ec2:CreateNetworkInterface`, `DescribeNetworkInterfaces`, `DeleteNetworkInterface`…).
  - Security group của RDS phải cho phép inbound từ security group của Lambda.

```
VPC
 ├─ Private subnet: [ENI ◄─ Lambda]  ──(SG Lambda → SG RDS)──► Amazon RDS
```

#### Internet access cho Lambda trong VPC

- Lambda trong VPC **không có internet access** theo mặc định.
- Đặt Lambda vào **public subnet** **KHÔNG** giúp có internet và **không có public IP** (khác EC2).
- Cách đúng: Lambda trong **private subnet** + route ra **NAT Gateway / NAT Instance** (nằm ở public subnet, route tới **Internet Gateway**).
- Truy cập dịch vụ AWS mà không qua internet: dùng **VPC Endpoints** (ví dụ Gateway Endpoint cho DynamoDB/S3).
- **Lưu ý:** **CloudWatch Logs vẫn hoạt động** dù không có endpoint hay NAT Gateway.

```
Private subnet: Lambda ──► NAT Gateway (public subnet) ──► IGW ──► Internet / external API
Private subnet: Lambda ──► VPC Endpoint ──► DynamoDB / S3 (không cần internet)
```

### Kiến thức thực tế

- Từ **2019** Lambda dùng **Hyperplane ENI** dùng chung theo cặp subnet + security group: ENI được tạo **lúc tạo/cập nhật function** (có thể mất vài phút), không còn tạo ENI mỗi cold start → VPC không còn làm cold start chậm đáng kể như trước.
- Luôn chọn **ít nhất 2 subnet ở 2 AZ** để HA; đảm bảo subnet đủ IP.
- Kết nối RDS từ Lambda nên đi qua **RDS Proxy** (Bài 22) để tránh cạn connection.
- Hỗ trợ **IPv6 outbound** cho Lambda trong VPC (dual-stack subnet) giúp gọi internet qua **Egress-only IGW** mà không cần NAT.

### Ghi nhớ cho kỳ thi

- Lambda cần truy cập **RDS/ElastiCache private** → cấu hình **VPC (subnet + SG)** + **`AWSLambdaVPCAccessExecutionRole`**.
- Lambda trong VPC cần internet → **private subnet + NAT Gateway**; public subnet **không** giúp được.
- Gọi AWS service riêng tư → **VPC Endpoint**. CloudWatch Logs vẫn chạy không cần NAT/endpoint.

---

## Bài 15 – Hiệu năng: Memory, Timeout, Execution Context, /tmp

### Lý thuyết

#### RAM và CPU

- RAM từ **128 MB đến 10.240 MB (10 GB)**, bước **1 MB**.
- **Càng nhiều RAM → càng nhiều vCPU** (và network). Không chỉnh CPU trực tiếp.
- Tại **1.769 MB**, function có tương đương **1 vCPU đầy đủ**. Trên 1.769 MB bạn có **> 1 vCPU** → cần **đa luồng (multi-threading)** trong code để tận dụng (tối đa **6 vCPU** ở 10 GB).
- Ứng dụng **CPU-bound** (tính toán nặng) → **tăng RAM**.

#### Timeout

- Mặc định **3 giây**, tối đa **900 giây (15 phút)**.
- Việc dài hơn 15 phút → dùng **Fargate, ECS, EC2, AWS Batch** (hoặc chia nhỏ bằng Step Functions).

#### Execution Context (môi trường thực thi)

- Môi trường tạm thời khởi tạo mọi **external dependency** của function (DB connection, HTTP client, SDK client).
- Execution context được **giữ lại một thời gian** để chờ lần gọi tiếp theo → lần gọi sau **tái sử dụng** context, tiết kiệm thời gian khởi tạo.
- Gồm cả thư mục **/tmp**.
- → **Khởi tạo các thứ nặng (DB connection, SDK client) ngoài handler**.

```python
import os, pymysql

# BAD: kết nối DB mỗi lần gọi
def get_user_bad(event, context):
    conn = pymysql.connect(host=os.environ["DB_HOST"], user="app",
                           password=os.environ["DB_PASS"], database="app")
    ...

# GOOD: kết nối ngoài handler, tái sử dụng giữa các invocation
conn = pymysql.connect(host=os.environ["DB_HOST"], user="app",
                       password=os.environ["DB_PASS"], database="app")

def get_user_good(event, context):
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM users WHERE id=%s", (event["id"],))
        return cur.fetchone()
```

#### Thư mục /tmp

- Dùng khi cần **tải file lớn** để xử lý hoặc cần **không gian đĩa** tạm.
- Dung lượng **512 MB (mặc định) tới 10 GB** (ephemeral storage).
- Nội dung /tmp **còn lại** khi execution context bị đóng băng (frozen) → dùng như **cache tạm** giữa các lần gọi (ví dụ checkpoint).
- Lưu **lâu dài** → dùng **S3** (hoặc EFS).
- Mã hoá dữ liệu trong /tmp → tự sinh **KMS data key** và mã hoá.

### Kiến thức thực tế

- Dùng công cụ mã nguồn mở **AWS Lambda Power Tuning** (Step Functions) để chạy function ở nhiều mức memory và chọn mức tối ưu chi phí/tốc độ. Thường tăng memory làm chạy nhanh hơn nên **tổng chi phí không tăng**, thậm chí giảm.
- Đặt **timeout sát thực tế** (không để 15 phút cho API 200 ms): tránh function treo lâu khi downstream chậm và đốt tiền.
- API Gateway (REST) có **integration timeout 29 giây** (có thể xin tăng cho Regional/Private API từ 2024); Lambda sau API Gateway chạy lâu hơn vẫn bị client nhận 504.
- Không giả định execution context luôn được tái sử dụng: code phải đúng cả khi context **mới**.

### Ghi nhớ cho kỳ thi

- RAM **128 MB – 10 GB**; **1.769 MB = 1 vCPU**; CPU-bound → **tăng RAM**.
- Timeout mặc định **3 s**, tối đa **15 phút**; dài hơn → Fargate/ECS/EC2/Batch.
- DB connection, SDK client → khởi tạo **ngoài handler** (execution context reuse).
- Cần đĩa tạm lớn → **/tmp tới 10 GB**; lưu lâu dài → S3/EFS.

---

## Bài 16 – Lambda Layers

### Lý thuyết

- **Layer** = gói zip chứa thư viện, runtime, dữ liệu dùng chung, được gắn vào function.
- Hai công dụng:
  1. **Custom Runtimes** (ví dụ C++, Rust do cộng đồng làm).
  2. **Tách dependency** ra khỏi code để **tái sử dụng**: function chỉ chứa code nhỏ của bạn; thư viện nặng (pandas, numpy, scipy…) nằm trong layer, nhiều function dùng chung, deploy code nhanh hơn.
- Mỗi function gắn tối đa **5 layer**; tổng kích thước giải nén (function + layer) **≤ 250 MB**.
- Layer có **version** (bất biến); nội dung giải nén vào **`/opt`** (Python: `/opt/python`, Node.js: `/opt/nodejs/node_modules`).
- Layer có thể chia sẻ cho account khác hoặc public bằng resource-based policy (`add-layer-version-permission`).

```
Lambda function (code 30 KB)
   ├── Layer 1: pandas + numpy (60 MB)
   └── Layer 2: AWS Parameters & Secrets extension
```

### Kiến thức thực tế

- **Lambda Extensions** cũng phân phối dưới dạng layer (Datadog, Parameters & Secrets, Lambda Insights, ADOT…).
- Layer **không** dùng được với **container image** (phải build thư viện vào image).
- Cẩn thận khi native library (numpy, Pillow…): build trên **Amazon Linux** đúng kiến trúc (x86_64/arm64), ví dụ dùng `sam build --use-container`.

### Ghi nhớ cho kỳ thi

- Tái sử dụng thư viện giữa nhiều function, giảm kích thước deploy → **Layers** (tối đa **5**, tổng **250 MB** unzipped).
- Ngôn ngữ không có runtime chính thức → **Custom Runtime** (có thể đóng gói dưới dạng layer).

---

## Bài 17 – Lambda và Amazon EFS

### Lý thuyết

- Lambda có thể **mount EFS file system** nếu chạy **trong VPC**.
- Cấu hình EFS mount vào **local directory** (ví dụ `/mnt/efs`) lúc khởi tạo.
- Phải dùng **EFS Access Points**.
- **Giới hạn:** chú ý **giới hạn số connection** của EFS (mỗi Lambda instance = 1 connection) và **connection burst** khi scale.

```
VPC: Lambda (private subnet) ──NFS──► EFS Access Point ──► EFS file system
```

#### So sánh các lựa chọn lưu trữ cho Lambda

| | **Ephemeral (/tmp)** | **Lambda Layers** | **Amazon S3** | **Amazon EFS** |
|---|---|---|---|---|
| Dung lượng tối đa | **10.240 MB** | **5 layer/function**, tối đa **250 MB** tổng | **Elastic** | **Elastic** |
| Bền vững | **Ephemeral** | **Durable** | **Durable** | **Durable** |
| Nội dung | **Dynamic** | **Static** | **Dynamic** | **Dynamic** |
| Kiểu lưu | File system | Archive | **Object** | File system |
| Thao tác | Mọi thao tác file system | **Immutable** | GET, PUT | Mọi thao tác file system |
| Giá | 512 MB đầu miễn phí | Tính vào **dung lượng code** | Storage + request + transfer | Storage + transfer + throughput |
| Chia sẻ / truy cập | **Chỉ một function** | **Mọi function** đã gắn | **Có IAM** | **IAM + NFS** |
| Tốc độ đọc | **Nhanh nhất** | **Nhanh nhất** | Nhanh | Rất nhanh |
| Chia sẻ giữa các invocation | Không (chỉ trong cùng context) | Có | Có | **Có** |

### Kiến thức thực tế

- EFS hợp cho: model ML lớn (vài GB) dùng chung giữa nhiều function, xử lý file cần chia sẻ trạng thái. Nếu chỉ cần đĩa tạm một function → **/tmp 10 GB** đơn giản và rẻ hơn.
- Mount target của EFS phải nằm trong các AZ/subnet mà Lambda dùng; SG của EFS mở **NFS 2049** từ SG của Lambda.

### Ghi nhớ cho kỳ thi

- Lambda + EFS: cần **VPC** + **EFS Access Point**; mount vào thư mục local.
- Cần **file system chia sẻ, bền vững** giữa nhiều function/invocation → **EFS**; tạm thời → **/tmp**; static library → **Layers**; object → **S3**.

---

## Bài 18 – Concurrency, Throttling, Cold Start, SnapStart

### Lý thuyết

#### Concurrency và Throttling

- Concurrency = số lần chạy **đồng thời**. Mặc định **1.000 concurrent executions** / **account / region** (soft limit, có thể xin tăng).
- **Reserved concurrency**: đặt **giới hạn** ở mức function (ví dụ "tối đa 50 concurrent"), đồng thời **dành riêng** phần concurrency đó cho function.
- Mỗi lần gọi vượt giới hạn → **Throttle**:
  - **Sync** → trả lỗi **429 ThrottleError** (`TooManyRequestsException`).
  - **Async** → **tự retry**, sau đó vào **DLQ**/destination.
- Cần hơn 1.000 → mở **Support ticket** xin tăng limit.

#### Vấn đề khi không đặt reserved concurrency

- Tất cả function trong account **dùng chung** pool 1.000.
- Ví dụ: ứng dụng sau **ALB** bị traffic đột biến dùng hết 1.000 concurrency → các function **khác** (sau API Gateway, SDK/CLI) bị **throttle** dù không liên quan.

```
ALB  ──► Lambda A (dùng hết 1000)  ✔
API GW ──► Lambda B ──✘ THROTTLE
SDK  ──► Lambda C ──✘ THROTTLE
```

#### Concurrency và Async

- Ví dụ S3 upload hàng loạt → nhiều invocation async. Khi không đủ concurrency, request bị throttle được **trả lại event queue** và Lambda **retry tới 6 giờ**.
- Khoảng retry tăng theo **exponential backoff**: từ **1 giây** lên tối đa **5 phút**.

#### Cold Start và Provisioned Concurrency

- **Cold Start**: instance mới → **code được tải** và **code ngoài handler chạy** (init). Nếu init lớn (code, dependency, SDK…) thì lâu. Request đầu tiên do instance mới phục vụ có **độ trễ cao** hơn.
- **Provisioned Concurrency**: concurrency được **cấp sẵn trước** khi function được gọi → **không cold start**, mọi lần gọi đều độ trễ thấp.
  - Quản lý bằng **Application Auto Scaling** (schedule hoặc target utilization).
  - Đặt trên **version** hoặc **alias** (không đặt được trên `$LATEST`).
  - Tính phí thêm cho thời gian cấp sẵn.
- Ghi chú: cold start trong **VPC** đã giảm mạnh từ 10/2019 (Hyperplane ENI).

#### Reserved vs Provisioned

| | Reserved Concurrency | Provisioned Concurrency |
|---|---|---|
| Mục đích | **Giới hạn trần** + **đảm bảo** phần pool cho function | **Làm ấm sẵn** instance, loại bỏ **cold start** |
| Chi phí | **Miễn phí** | **Tính phí** |
| Áp dụng | Toàn function | Version / alias |
| Đặt = 0 | Function **luôn bị throttle** (cách "tắt" function) | – |

#### SnapStart

- **Lambda SnapStart** giảm cold start bằng cách **chụp snapshot** (Firecracker microVM) của môi trường **sau khi init** lúc **publish version**; các lần khởi động sau **resume** từ snapshot cache, nhanh tới **10 lần**.
- Hỗ trợ: **Java 11+**, **Python 3.12+**, **.NET 8+** (Python và .NET từ 11/2024).
- Chỉ áp dụng cho **published version**; không dùng chung với provisioned concurrency, EFS, ephemeral storage > 512 MB.
- Lưu ý **uniqueness**: thứ sinh ngẫu nhiên/kết nối mạng tạo lúc init sẽ bị **nhân bản** qua snapshot → dùng **runtime hooks** (`beforeCheckpoint`/`afterRestore`) để tạo lại.

### Kiến thức thực tế

- Tài khoản mới hiện có thể khởi đầu với quota concurrency **thấp hơn 1.000** (ví dụ 10) và AWS tự nâng dần theo mức dùng; kiểm tra **Service Quotas**. Đề thi dùng **1.000**.
- Scaling rate (từ 11/2023): mỗi function tăng thêm tới **1.000 concurrent execution mỗi 10 giây**, độc lập giữa các function.
- Reserved concurrency là cách **bảo vệ downstream** (ví dụ RDS chỉ chịu 100 connection → reserved concurrency 100).
- Metric theo dõi: `ConcurrentExecutions`, `Throttles`, `ProvisionedConcurrencySpilloverInvocations` (vượt provisioned, rơi về on-demand), `ProvisionedConcurrencyUtilization`.

### Ghi nhớ cho kỳ thi

- Mặc định **1.000 concurrency/region**; vượt → **429** (sync) hoặc retry tới **6 giờ** (async).
- Một function "ăn" hết concurrency làm function khác throttle → đặt **reserved concurrency**.
- Loại bỏ **cold start** → **Provisioned Concurrency** (trên alias/version, auto scaling được); Java/Python/.NET → cân nhắc **SnapStart**.
- Reserved concurrency = 0 → function bị **throttle hoàn toàn**.

---

## Bài 19 – Deployment Package, CloudFormation và Container Image

### Lý thuyết

#### External dependencies

- Function cần thư viện ngoài (AWS X-Ray SDK, DB client…) → phải **cài package cùng code** rồi **zip** lại:
  - **Node.js**: `npm install` → thư mục `node_modules`.
  - **Python**: `pip install --target .`
  - **Java**: đóng gói các file `.jar`.
- Upload zip trực tiếp lên Lambda nếu **< 50 MB**; lớn hơn → upload lên **S3** rồi trỏ Lambda tới đó.
- **Native libraries** phải được biên dịch trên **Amazon Linux**.
- **AWS SDK** có sẵn trong mọi Lambda runtime (nhưng nên tự đóng gói để cố định version).

#### Lambda và CloudFormation

**Cách 1 – Inline** (`Code.ZipFile`): cho function **rất đơn giản**, **không** thể kèm dependency.

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Description: Lambda function inline
Resources:
  primer:
    Type: AWS::Lambda::Function
    Properties:
      Runtime: python3.13
      Role: arn:aws:iam::123456789012:role/lambda-role
      Handler: index.handler
      Code:
        ZipFile: |
          import os
          def handler(event, context):
              return "Hello from " + os.environ["AWS_REGION"]
      Timeout: 10
```

**Cách 2 – Zip trên S3**: lưu zip trên S3, tham chiếu bằng:
- `S3Bucket`
- `S3Key` – đường dẫn tới zip
- `S3ObjectVersion` – nếu bucket bật **versioning**

```yaml
Parameters:
  S3BucketParam: { Type: String }
  S3KeyParam: { Type: String }
  S3ObjectVersionParam: { Type: String }
Resources:
  LambdaWithXRay:
    Type: AWS::Lambda::Function
    Properties:
      Runtime: python3.13
      Handler: index.lambda_handler
      Role: !GetAtt LambdaExecutionRole.Arn
      TracingConfig: { Mode: Active }
      Code:
        S3Bucket: !Ref S3BucketParam
        S3Key: !Ref S3KeyParam
        S3ObjectVersion: !Ref S3ObjectVersionParam
```

- **Quan trọng:** nếu bạn cập nhật code trên S3 nhưng **không đổi** `S3Bucket`, `S3Key` hoặc `S3ObjectVersion`, CloudFormation **không cập nhật** function (nó không thấy thay đổi trong template). → Bật versioning và truyền `S3ObjectVersion` mới (hoặc đổi tên key) khi deploy.

**Triển khai qua nhiều account:** bucket S3 chứa code ở account 1, CloudFormation ở account 2/3:
- **Bucket policy** cho phép account 2/3 (`s3:GetObject`), **và**
- **Execution role** của CloudFormation (hoặc principal deploy) ở account 2/3 có quyền đọc bucket đó.

#### Container Images

- Deploy Lambda dưới dạng **container image** tối đa **10 GB**, lưu trên **ECR**.
- Đóng gói code phức tạp, dependency lớn trong một image.
- **Base image phải implement Lambda Runtime API** (Runtime Interface Client).
- Base image có sẵn cho Python, Node.js, Java, .NET, Go, Ruby; có thể tự tạo base image bất kỳ (miễn implement Runtime API).
- Test **local** bằng **Lambda Runtime Interface Emulator (RIE)**.
- Một quy trình build/deploy thống nhất cho cả app container.

```dockerfile
# Dùng base image chính thức của AWS
FROM public.ecr.aws/lambda/nodejs:22

# Copy code và cài dependency
COPY app.js package*.json ./
RUN npm install --omit=dev

# Handler: file app, hàm handler
CMD [ "app.lambdaHandler" ]
```

```bash
docker build -t my-func .
# Test local (RIE có sẵn trong base image AWS)
docker run -p 9000:8080 my-func
curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{}'

aws ecr create-repository --repository-name my-func
docker tag my-func:latest 123456789012.dkr.ecr.eu-west-1.amazonaws.com/my-func:1
docker push 123456789012.dkr.ecr.eu-west-1.amazonaws.com/my-func:1
aws lambda create-function --function-name my-func --package-type Image \
  --code ImageUri=123456789012.dkr.ecr.eu-west-1.amazonaws.com/my-func:1 \
  --role arn:aws:iam::123456789012:role/lambda-role
```

**Best practices cho container image:**

- **Dùng base image do AWS cung cấp**: ổn định, dựng trên Amazon Linux 2/2023, được **cache** sẵn trong Lambda.
- **Multi-stage build**: build ở stage đầu, chỉ copy artifact vào stage cuối, bỏ bước không cần thiết.
- **Thứ tự layer từ ổn định → thay đổi thường xuyên** (dependency trước, code sau) để tận dụng cache.
- **Dùng một repository cho các function** có cùng layer lớn: ECR so sánh từng layer, tránh upload/lưu trùng.

### Kiến thức thực tế

- Thực tế dùng **SAM** (`sam build && sam deploy`) hoặc **CDK** để tự zip, upload S3 và đổi key/hash mỗi lần code thay đổi (chương 25, 26). `aws cloudformation package` cũng tự upload và thay đường dẫn local thành S3.
- `ZipFile` inline giới hạn **4.096 ký tự**.
- Từ Node.js 18, runtime chỉ có sẵn **AWS SDK v3** (không còn v2).
- Container image hỗ trợ cả **arm64**, nhưng **không** dùng được SnapStart và Layers; cold start của image lớn được Lambda giảm nhờ cơ chế cache và lazy loading.

### Ghi nhớ cho kỳ thi

- Dependency → **zip cùng code**; **> 50 MB** → upload **S3**; native lib build trên **Amazon Linux**.
- CloudFormation: **inline** (đơn giản, không dependency) hoặc **S3Bucket + S3Key + S3ObjectVersion**.
- Đổi code trên S3 mà không đổi Bucket/Key/**ObjectVersion** → CloudFormation **không cập nhật**.
- Cross-account deploy → **bucket policy + quyền của role** ở account đích.
- Container image **≤ 10 GB** trên **ECR**, base image phải implement **Lambda Runtime API**, test local bằng **RIE**.

---

## Bài 20 – Versions và Aliases

### Lý thuyết

#### Versions

- Khi làm việc với function, ta sửa trên **`$LATEST`** (mutable – thay đổi được).
- Khi sẵn sàng, **publish** function → tạo **version** (V1, V2…).
- Version là **immutable**: **code + cấu hình** (env vars, runtime, memory…) **không đổi được**.
- Version số **tăng dần**, mỗi version có **ARN riêng** (`...:function:my-func:1`). ARN không có hậu tố = **unqualified** (trỏ `$LATEST`).
- Mỗi version **truy cập độc lập**.

#### Aliases

- **Alias** = **con trỏ** tới một version, ví dụ `dev`, `test`, `prod`.
- Alias **mutable** (đổi version được).
- Dùng để **canary deployment**: alias gán **trọng số (weight)** cho **2 version** (ví dụ `prod` → 95% V1, 5% V2).
- Alias giúp **ổn định cấu hình** của trigger/destination: event source, API Gateway trỏ vào alias `prod`, khi deploy chỉ đổi alias, không cần sửa trigger.
- Alias có **ARN riêng** (`...:function:my-func:prod`).
- **Alias không thể trỏ tới alias khác**, chỉ trỏ tới version (`dev` thường trỏ `$LATEST`).

```
Users ──► PROD alias ──95%──► V1
                      └─5%──► V2
Users ──► TEST alias ───────► V2
Devs  ──► DEV alias  ───────► $LATEST (mutable)
```

### Kiến thức thực tế

- Biết version nào đang chạy qua `context.function_version` hoặc metric/log theo **ExecutedVersion**; khi dùng weighted alias, CloudWatch có dimension **ExecutedVersion** để so lỗi giữa 2 version.
- Weighted alias yêu cầu cả hai đều là **published version** (không dùng `$LATEST`), cùng **execution role** và cùng cấu hình **DLQ**.
- Provisioned concurrency, SnapStart, Function URL production nên gắn với **alias**.

### Ghi nhớ cho kỳ thi

- **$LATEST mutable**; **Version immutable** (code + config); **Alias mutable**, trỏ tới version.
- **Alias không trỏ tới alias**.
- Canary/blue-green thủ công → **weighted alias** (tối đa **2 version**).
- Trigger/API Gateway nên trỏ vào **alias** để đổi version mà không sửa cấu hình (kết hợp **stage variables** trong API Gateway).

---

## Bài 21 – CodeDeploy và Function URL

### Lý thuyết

#### Lambda + CodeDeploy

- **CodeDeploy** tự động hoá **traffic shift** cho **Lambda alias** (thường tích hợp trong **SAM**).
- Kiểu dịch chuyển:

| Loại | Ví dụ | Ý nghĩa |
|---|---|---|
| **Linear** | `Linear10PercentEvery3Minutes`, `Linear10PercentEvery10Minutes` | Tăng đều 10% traffic mỗi N phút tới 100% |
| **Canary** | `Canary10Percent5Minutes`, `Canary10Percent30Minutes` | Thử 10% trong N phút, rồi chuyển **100%** |
| **AllAtOnce** | `AllAtOnce` | Chuyển ngay 100% |

- Có thể tạo **Pre & Post Traffic hooks** (Lambda function) để kiểm tra sức khoẻ deployment.
- **Rollback** tự động dựa trên **CloudWatch Alarm** (ví dụ tỷ lệ lỗi của version mới tăng).

```
                  ┌── V1 (100% → 90% → … → 0%)
PROD alias ───────┤
   ▲              └── V2 (0% → 10% → … → 100%)
   │
CodeDeploy (Linear/Canary/AllAtOnce) + CloudWatch Alarm (rollback) + hooks
```

**AppSpec.yml** cho Lambda:

```yaml
version: 0.0
Resources:
  - myLambdaFunction:
      Type: AWS::Lambda::Function
      Properties:
        Name: myLambdaFunction          # bắt buộc: tên function
        Alias: myLambdaFunctionAlias    # bắt buộc: alias cần dịch traffic
        CurrentVersion: 1               # bắt buộc: version hiện tại
        TargetVersion: 2                # bắt buộc: version đích
Hooks:
  - BeforeAllowTraffic: "LambdaFunctionToValidateBeforeTrafficShift"
  - AfterAllowTraffic: "LambdaFunctionToValidateAfterTrafficShift"
```

Trong **SAM** (thường gặp nhất):

```yaml
MyFunction:
  Type: AWS::Serverless::Function
  Properties:
    Handler: app.handler
    Runtime: python3.13
    AutoPublishAlias: live
    DeploymentPreference:
      Type: Canary10Percent10Minutes
      Alarms: [!Ref AliasErrorMetricGreaterThanZeroAlarm]
      Hooks:
        PreTraffic: !Ref PreTrafficLambdaFunction
        PostTraffic: !Ref PostTrafficLambdaFunction
```

Hook phải báo kết quả về CodeDeploy:

```python
import boto3
cd = boto3.client("codedeploy")

def handler(event, context):
    status = "Succeeded" if run_smoke_tests() else "Failed"
    cd.put_lifecycle_event_hook_execution_status(
        deploymentId=event["DeploymentId"],
        lifecycleEventHookExecutionId=event["LifecycleEventHookExecutionId"],
        status=status)
```

#### Lambda Function URL

- **Endpoint HTTP(S) riêng** cho function, không cần API Gateway/ALB.
- URL duy nhất, **không bao giờ đổi**: `https://<url-id>.lambda-url.<region>.on.aws` (chỉ **dual-stack IPv4 & IPv6**).
- Gọi qua **public Internet** bằng trình duyệt, curl, Postman, bất kỳ HTTP client.
- Truy cập Function URL **chỉ qua public internet** (không hỗ trợ PrivateLink, nhưng **function** vẫn có thể nằm trong VPC để truy cập tài nguyên riêng).
- Hỗ trợ **Resource-based Policy** và cấu hình **CORS**.
- Gắn được với **alias** hoặc **`$LATEST`** (**không** gắn được với version số cụ thể).
- Tạo và cấu hình bằng console hoặc API.
- **Throttle** function bằng **Reserved Concurrency**.

**Bảo mật Function URL:**

| `AuthType` | Ý nghĩa |
|---|---|
| **`NONE`** | Cho phép truy cập **công khai, không xác thực**. Resource-based policy **luôn được áp dụng** (phải cho phép public: `lambda:InvokeFunctionUrl` với `Principal: "*"`, `FunctionUrlAuthType: NONE`) |
| **`AWS_IAM`** | Dùng IAM để xác thực/phân quyền; request phải ký **SigV4**. **Cùng account**: Identity-based policy **HOẶC** resource-based policy cho phép. **Cross-account**: cần **CẢ** identity-based policy **VÀ** resource-based policy |

### Kiến thức thực tế

- Function URL hỗ trợ **response streaming** (`InvokeMode: RESPONSE_STREAM`, Node.js runtime hoặc custom runtime) để trả dữ liệu dần, hữu ích cho ứng dụng sinh văn bản (LLM), file lớn.
- Function URL **không** có throttling theo client, API key, WAF trực tiếp, caching, custom domain → đặt **CloudFront** phía trước (dùng **Origin Access Control** cho Lambda Function URL, có từ 2024) khi cần custom domain/WAF.
- CodeDeploy cho Lambda thực tế gần như luôn đi qua `DeploymentPreference` của **SAM**.

### Ghi nhớ cho kỳ thi

- Dịch traffic tự động giữa version của alias → **CodeDeploy**: **Linear**, **Canary**, **AllAtOnce**; rollback bằng **CloudWatch Alarm**; kiểm tra bằng **Pre/Post Traffic hooks**.
- AppSpec Lambda: **Name, Alias, CurrentVersion, TargetVersion**.
- HTTPS endpoint đơn giản nhất cho Lambda → **Function URL** (`AuthType` **NONE** hoặc **AWS_IAM**), gắn với **alias** hoặc **$LATEST**.
- Cross-account với `AWS_IAM` cần **cả** identity-based **và** resource-based policy.

---

## Bài 22 – CodeGuru Profiler, Limits và Best Practices

### Lý thuyết

#### Lambda + CodeGuru Profiler

- Nhận **insight về hiệu năng runtime** của Lambda function (code nào tốn CPU, chậm, tốn tiền).
- Hỗ trợ runtime **Java** và **Python**.
- Bật từ **console Lambda** (Monitoring and operations tools → **Code profiling**).
- Khi bật, Lambda tự động:
  - Thêm **CodeGuru Profiler layer** vào function.
  - Thêm **environment variables** cho function.
  - Thêm policy **`AmazonCodeGuruProfilerAgentAccess`** vào execution role.

#### Lambda Limits (mỗi region) – rất hay được hỏi

**Execution:**

| Giới hạn | Giá trị |
|---|---|
| Memory | **128 MB – 10.240 MB** (bước 1 MB) |
| Thời gian chạy tối đa | **900 giây (15 phút)** |
| Environment variables | **4 KB** tổng |
| Disk trong container (`/tmp`) | **512 MB – 10.240 MB** |
| Concurrent executions | **1.000** (có thể tăng) |
| Payload sync (request/response) | **6 MB** |
| Payload async | **256 KB** (giá trị đề thi; AWS nâng lên 1 MB cuối 2025) |

**Deployment:**

| Giới hạn | Giá trị |
|---|---|
| Deployment package (zip, upload trực tiếp) | **50 MB** (nén) |
| Kích thước giải nén (code + layers) | **250 MB** |
| Container image | **10 GB** (giải nén) |
| Layers mỗi function | **5** |
| Có thể dùng `/tmp` để tải file lúc khởi động | Có |
| Code storage mỗi region | **75 GB** (có thể tăng) |

#### Lambda Best Practices

- **Làm việc nặng ở ngoài handler**:
  - Kết nối **database** ngoài handler.
  - Khởi tạo **AWS SDK client** ngoài handler.
  - Kéo **dependency/dataset** ngoài handler.
- **Dùng environment variables** cho:
  - Database connection string, S3 bucket… **không đặt cứng** vào code.
  - Password, giá trị nhạy cảm → **mã hoá bằng KMS**.
- **Giảm kích thước deployment package** cho runtime cần thiết:
  - Chia function lớn thành nhiều function nhỏ.
  - Nhớ giới hạn của Lambda.
  - Dùng **Layers** khi cần tái sử dụng thư viện.
- **Tránh dùng recursive code**: **không bao giờ để Lambda tự gọi chính nó**.

### Kiến thức thực tế

- **RDS Proxy** cho Lambda: gom (pool) connection, tránh "too many connections" khi Lambda scale, hỗ trợ IAM auth và lấy secret từ Secrets Manager.
- **Powertools for AWS Lambda** (Python, TypeScript, Java, .NET): logging JSON, metrics (EMF), tracing, idempotency, batch processing, parameters – gần như là "bộ chuẩn" cho Lambda production.
- Tính năng mới đáng biết (không phải trọng tâm đề DVA-C02): **Lambda durable functions** (viết workflow nhiều bước, chạy lâu, có checkpoint ngay trong Lambda) và **Lambda Managed Instances** (chạy Lambda trên EC2 do Lambda quản lý) – cả hai công bố cuối 2025; xem tài liệu AWS để biết runtime và region hỗ trợ.
- **CodeGuru Reviewer** (review code tĩnh) đã ngừng nhận khách hàng mới; CodeGuru Profiler vẫn là đáp án đề thi cho "tìm đoạn code tốn kém lúc chạy".

### Ghi nhớ cho kỳ thi

- Thuộc lòng bảng limits: **10 GB RAM, 15 phút, 4 KB env, 10 GB /tmp, 1.000 concurrency, 6 MB sync, 256 KB async, 50 MB zip, 250 MB unzip, 10 GB image, 5 layers**.
- Hiệu năng runtime của Java/Python → **CodeGuru Profiler** (thêm layer, env vars, `AmazonCodeGuruProfilerAgentAccess`).
- Best practice: khởi tạo **ngoài handler**, cấu hình qua **env vars**, secret mã hoá **KMS**, package nhỏ, **không đệ quy**.

---

## Câu hỏi ôn tập

*Nguồn: bộ câu hỏi tự soạn theo phong cách đề DVA-C02 (28 câu), bám nội dung chương. Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Một Lambda function xử lý ảnh chạy chậm do tính toán nặng (CPU-bound). Cách cải thiện hiệu năng đơn giản nhất là gì?

- A. Tăng timeout lên 15 phút
- B. Tăng memory của function
- C. Bật Provisioned Concurrency
- D. Chuyển function vào VPC

<details><summary>Đáp án</summary>

**B.** Lambda cấp CPU tỷ lệ với memory (1.769 MB ≈ 1 vCPU). Không có setting CPU riêng; tăng timeout không làm chạy nhanh hơn.
</details>

**Câu 2.** Bạn gọi Lambda bằng CLI và muốn lệnh trả về ngay mà không chờ kết quả. Tham số nào đúng?

- A. `--invocation-type RequestResponse`
- B. `--invocation-type DryRun`
- C. `--invocation-type Event`
- D. `--async true`

<details><summary>Đáp án</summary>

**C.** `Event` là async, trả về HTTP **202** và không có payload kết quả. `RequestResponse` là sync (mặc định), `DryRun` chỉ kiểm tra quyền.
</details>

**Câu 3.** Một function được S3 gọi khi có object mới và thỉnh thoảng lỗi. Mặc định Lambda sẽ thử chạy tổng cộng bao nhiêu lần trước khi bỏ event?

- A. 1
- B. 2
- C. 3
- D. Cho tới khi thành công

<details><summary>Đáp án</summary>

**C.** Async invocation: 1 lần đầu + **2 lần retry** (khoảng 1 phút, rồi 2 phút). Sau đó event đi tới DLQ/On-failure destination nếu có cấu hình.
</details>

**Câu 4.** Vì cơ chế retry của async invocation, function của bạn có thể xử lý cùng một event nhiều lần. Bạn cần đảm bảo điều gì?

- A. Function phải idempotent
- B. Bật Provisioned Concurrency
- C. Đặt reserved concurrency = 1
- D. Dùng SQS FIFO làm DLQ

<details><summary>Đáp án</summary>

**A.** Retry gây xử lý trùng và log trùng; function phải **idempotent** (ví dụ lưu ID đã xử lý bằng DynamoDB conditional write hoặc Powertools idempotency).
</details>

**Câu 5.** Bạn muốn nhận cả kết quả thành công lẫn thất bại của các lần gọi async, kèm chi tiết lỗi, gửi tới EventBridge. Nên dùng gì?

- A. Dead Letter Queue
- B. Lambda Destinations
- C. CloudWatch Logs subscription
- D. X-Ray

<details><summary>Đáp án</summary>

**B.** Destinations hỗ trợ **On success** và **On failure** với đích SQS, SNS, Lambda, EventBridge; DLQ chỉ cho thất bại và chỉ SQS/SNS. AWS khuyên dùng Destinations thay DLQ.
</details>

**Câu 6.** Một function đọc Kinesis Data Streams. Một record lỗi khiến cả shard bị chặn, Lambda retry mãi một batch. Cấu hình nào giúp cô lập record lỗi? (Chọn tốt nhất)

- A. Tăng batch size
- B. Bật Split batch on error (bisect) và giới hạn retry
- C. Tăng memory
- D. Đặt DLQ trên Lambda (async)

<details><summary>Đáp án</summary>

**B.** Với stream, mặc định cả batch retry tới khi thành công hoặc hết hạn. **BisectBatchOnFunctionError** chia đôi batch; kết hợp `MaximumRetryAttempts`, `MaximumRecordAgeInSeconds` và on-failure destination. DLQ của Lambda chỉ dành cho async.
</details>

**Câu 7.** Lambda dùng Event Source Mapping với SQS. Bạn muốn message lỗi nhiều lần được đưa sang hàng đợi riêng. Cấu hình DLQ ở đâu?

- A. Trong Asynchronous invocation của Lambda
- B. Trên SQS queue nguồn (redrive policy)
- C. Trên ESM như On-success destination
- D. Trên CloudWatch Alarm

<details><summary>Đáp án</summary>

**B.** Với SQS ESM, Lambda gọi **sync**, nên DLQ của Lambda không áp dụng. Cấu hình **redrive policy / DLQ trên SQS** với `maxReceiveCount`.
</details>

**Câu 8.** Visibility timeout khuyến nghị cho SQS queue làm nguồn của Lambda có timeout 30 giây là bao nhiêu?

- A. 30 giây
- B. 60 giây
- C. 180 giây
- D. 900 giây

<details><summary>Đáp án</summary>

**C.** Khuyến nghị **6 × timeout của function** = 180 giây, để message không hiện lại trong khi đang xử lý/retry.
</details>

**Câu 9.** Function xử lý batch 10 message SQS; 1 message lỗi khiến cả 10 bị xử lý lại. Cách khắc phục?

- A. Giảm batch size xuống 1 bắt buộc
- B. Bật `ReportBatchItemFailures` và trả về `batchItemFailures`
- C. Dùng SQS FIFO
- D. Tăng visibility timeout

<details><summary>Đáp án</summary>

**B.** **Partial batch response**: function trả về `messageId` của message lỗi, chỉ những message này quay lại queue.
</details>

**Câu 10.** Lambda đọc từ SQS FIFO queue. Yếu tố nào quyết định số Lambda chạy song song tối đa?

- A. Số shard
- B. Số message group đang hoạt động
- C. Batch size
- D. Luôn là 1

<details><summary>Đáp án</summary>

**B.** FIFO giữ thứ tự trong mỗi **message group**, nên concurrency tối đa bằng số active message group.
</details>

**Câu 11.** Bạn muốn ALB chuyển query string `?name=foo&name=bar` tới Lambda dưới dạng mảng. Cần làm gì?

- A. Dùng API Gateway thay ALB
- B. Bật multi-value headers trên Target Group
- C. Đặt Lambda vào VPC
- D. Bật sticky sessions

<details><summary>Đáp án</summary>

**B.** Bật **multi-value headers** trên target group; event có `multiValueQueryStringParameters` và `multiValueHeaders` dạng mảng.
</details>

**Câu 12.** S3 bucket không gửi được event tới Lambda dù đã cấu hình notification. Thiếu cấu hình nào nhiều khả năng nhất?

- A. Execution role của Lambda thiếu `s3:GetObject`
- B. Resource-based policy của Lambda không cho phép `s3.amazonaws.com`
- C. Lambda chưa đặt trong VPC
- D. Chưa bật X-Ray

<details><summary>Đáp án</summary>

**B.** Dịch vụ gọi **vào** Lambda (S3, SNS, EventBridge, ALB) cần **resource-based policy**. Execution role là quyền Lambda gọi **ra** ngoài.
</details>

**Câu 13.** Hai lần ghi đồng thời vào cùng một key trên bucket không bật versioning chỉ tạo một notification. Làm sao đảm bảo mỗi lần ghi đều có notification?

- A. Bật S3 Transfer Acceleration
- B. Bật versioning trên bucket
- C. Dùng SNS thay Lambda
- D. Tăng concurrency của Lambda

<details><summary>Đáp án</summary>

**B.** Với bucket không versioning, ghi đồng thời cùng object có thể chỉ phát một event; bật **versioning** để mỗi lần ghi là một version riêng.
</details>

**Câu 14.** Lambda cần kết nối RDS trong private subnet và gọi một API bên thứ 3 trên Internet. Cấu hình nào đúng?

- A. Đặt Lambda vào public subnet có Internet Gateway
- B. Đặt Lambda vào private subnet, route ra NAT Gateway ở public subnet
- C. Giữ Lambda ngoài VPC
- D. Gắn Elastic IP cho Lambda

<details><summary>Đáp án</summary>

**B.** Lambda trong VPC không có public IP; public subnet không giúp được. Dùng **private subnet + NAT Gateway**, role có `AWSLambdaVPCAccessExecutionRole`.
</details>

**Câu 15.** Function kết nối database ngay trong handler, mỗi lần gọi mất 300 ms để kết nối. Cách tối ưu?

- A. Tăng timeout
- B. Khởi tạo connection ngoài handler để tái sử dụng execution context
- C. Lưu connection trong environment variable
- D. Dùng /tmp để lưu connection

<details><summary>Đáp án</summary>

**B.** Code ngoài handler chỉ chạy lúc init và được tái sử dụng qua các lần gọi trên cùng execution environment.
</details>

**Câu 16.** Function cần tải và giải nén file 3 GB để xử lý tạm thời. Cách đơn giản nhất?

- A. Tăng ephemeral storage `/tmp` lên tối thiểu 3 GB (tối đa 10 GB)
- B. Dùng Lambda Layers
- C. Lưu vào environment variables
- D. Không thể, Lambda chỉ có 512 MB đĩa

<details><summary>Đáp án</summary>

**A.** `/tmp` cấu hình được từ **512 MB tới 10 GB**. Layers là nội dung tĩnh, env vars tối đa 4 KB.
</details>

**Câu 17.** Một function bị traffic đột biến dùng hết concurrency của account, khiến các function quan trọng khác bị throttle. Giải pháp?

- A. Bật X-Ray
- B. Đặt reserved concurrency cho các function
- C. Tăng memory
- D. Chuyển sang async invocation

<details><summary>Đáp án</summary>

**B.** **Reserved concurrency** vừa giới hạn function "ồn ào" vừa dành riêng concurrency cho function quan trọng.
</details>

**Câu 18.** API dùng Lambda (Java) có độ trễ cao ở request đầu tiên do cold start. Hai giải pháp phù hợp là gì? (Chọn 2)

- A. Provisioned Concurrency
- B. Lambda SnapStart
- C. Reserved Concurrency
- D. Tăng timeout
- E. Bật DLQ

<details><summary>Đáp án</summary>

**A và B.** Provisioned Concurrency làm ấm sẵn instance; SnapStart (Java 11+, Python 3.12+, .NET 8+) resume từ snapshot. Reserved concurrency không giảm cold start.
</details>

**Câu 19.** Khi một lần gọi **sync** bị throttle, client nhận được gì?

- A. HTTP 202
- B. HTTP 429 TooManyRequestsException
- C. HTTP 502
- D. Event được retry tới 6 giờ

<details><summary>Đáp án</summary>

**B.** Sync → **429**; client tự retry. Async → Lambda tự retry tới 6 giờ.
</details>

**Câu 20.** Bạn cập nhật file zip trên S3 nhưng `aws cloudformation update-stack` không cập nhật code Lambda. Nguyên nhân?

- A. CloudFormation không hỗ trợ Lambda
- B. Không đổi `S3Bucket`, `S3Key` hoặc `S3ObjectVersion` trong template
- C. Thiếu quyền `lambda:InvokeFunction`
- D. Function đang ở trong VPC

<details><summary>Đáp án</summary>

**B.** CloudFormation chỉ cập nhật khi thuộc tính `Code` thay đổi; bật versioning bucket và truyền **S3ObjectVersion** mới.
</details>

**Câu 21.** Kích thước tối đa của Lambda container image là bao nhiêu và lưu ở đâu?

- A. 250 MB, S3
- B. 10 GB, Amazon ECR
- C. 50 MB, ECR
- D. 10 GB, S3

<details><summary>Đáp án</summary>

**B.** Image tối đa **10 GB**, lưu trên **ECR**, base image phải implement **Lambda Runtime API**; test local bằng Runtime Interface Emulator.
</details>

**Câu 22.** Phát biểu nào về Versions và Aliases là SAI?

- A. Version là immutable
- B. Alias có thể trỏ tới một alias khác
- C. Alias có thể chia traffic cho 2 version theo trọng số
- D. `$LATEST` là mutable

<details><summary>Đáp án</summary>

**B.** Alias **chỉ** trỏ tới version, không trỏ tới alias khác.
</details>

**Câu 23.** Bạn muốn deploy version mới: chuyển 10% traffic trong 5 phút, nếu ổn thì chuyển hết, tự rollback nếu CloudWatch Alarm kích hoạt. Dùng gì?

- A. CodeDeploy với `Canary10Percent5Minutes`
- B. CodeDeploy với `Linear10PercentEvery10Minutes`
- C. CodeDeploy với `AllAtOnce`
- D. Lambda Layers

<details><summary>Đáp án</summary>

**A.** **Canary**: một bước 10% rồi 100%. Linear tăng đều 10% mỗi khoảng thời gian. Rollback dựa trên CloudWatch Alarm.
</details>

**Câu 24.** Bạn cần một HTTPS endpoint đơn giản cho Lambda, chỉ cho phép IAM principal đã ký SigV4 gọi, không cần API Gateway. Nên dùng?

- A. Function URL với `AuthType: NONE`
- B. Function URL với `AuthType: AWS_IAM`
- C. ALB với Cognito
- D. Lambda@Edge

<details><summary>Đáp án</summary>

**B.** Function URL `AWS_IAM` yêu cầu request ký SigV4; cross-account cần cả identity-based và resource-based policy.
</details>

**Câu 25.** Bạn cần chỉnh sửa header và rewrite URL cho hàng triệu request/giây tại CloudFront với độ trễ dưới 1 ms, chi phí thấp nhất. Chọn gì?

- A. Lambda@Edge
- B. CloudFront Functions
- C. Lambda sau API Gateway
- D. Lambda Function URL

<details><summary>Đáp án</summary>

**B.** CloudFront Functions (JavaScript, viewer request/response, < 1 ms, hàng triệu RPS, rẻ). Lambda@Edge khi cần network, SDK, body hay origin trigger.
</details>

**Câu 26.** Function cần dùng X-Ray. Những thứ nào là cần thiết? (Chọn 2)

- A. Bật Active Tracing trên function
- B. Chạy X-Ray daemon trên EC2 riêng
- C. Execution role có `AWSXRayDaemonWriteAccess`
- D. Đặt function vào VPC

<details><summary>Đáp án</summary>

**A và C.** Lambda tự chạy daemon khi bật Active Tracing; role cần quyền ghi trace. Địa chỉ daemon có trong biến `AWS_XRAY_DAEMON_ADDRESS`.
</details>

**Câu 27.** Tổng kích thước tối đa của tất cả environment variables của một Lambda function là?

- A. 1 KB
- B. 4 KB
- C. 64 KB
- D. 256 KB

<details><summary>Đáp án</summary>

**B.** **4 KB**; giá trị nhạy cảm nên mã hoá bằng KMS (encryption helpers) hoặc để ở Secrets Manager/SSM Parameter Store.
</details>

**Câu 28.** Bạn muốn nhiều function Python dùng chung thư viện `pandas` mà không đóng gói vào từng function. Dùng gì?

- A. Lambda Layers
- B. Environment variables
- C. /tmp
- D. Function URL

<details><summary>Đáp án</summary>

**A.** Layers chia sẻ thư viện (tối đa 5 layer, tổng 250 MB unzipped), giảm kích thước package và tăng tốc deploy.
</details>

---

[← Chương 20](ch20-aws-monitoring-audit-cloudwatch-x-ray-.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Chương 22 →](ch22-aws-serverless-dynamodb.md)
