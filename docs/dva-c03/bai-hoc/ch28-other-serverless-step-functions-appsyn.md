# Chương 28 – Other Serverless: Step Functions & AppSync

> **Nguồn:** 12 video của chương + *Other Serverless Quiz*.
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay (2026, kỳ thi hiện hành là **DVA-C02**).

## Mục tiêu chương

Sau chương này bạn có thể:

- Giải thích **AWS Step Functions**: state machine, Amazon States Language (ASL), các loại state (Task, Choice, Pass, Wait, Map, Parallel, Succeed, Fail).
- Dựng state machine gọi **Lambda** và xem lịch sử thực thi trên console.
- Xử lý lỗi bằng **Retry** và **Catch**, hiểu các mã lỗi `States.*` và vai trò của **ResultPath**.
- Phân biệt **Wait for Task Token** (callback, push) và **Activity Tasks** (pull), cùng các tham số `TimeoutSeconds`, `HeartbeatSeconds`.
- So sánh **Standard** với **Express** workflow (asynchronous / synchronous), đặc biệt là mô hình thực thi *exactly-once / at-least-once / at-most-once*.
- Hiểu **AWS AppSync** (GraphQL, real-time WebSocket, resolvers, 4+ chế độ authorization) và dựng API GraphQL trên DynamoDB.
- Hiểu **AWS Amplify** (Studio, CLI, Libraries, Hosting), các tính năng auth/data/hosting và kiểm thử end-to-end bằng Cypress.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001–002 | Step Functions Overview | Bài 1 – Tổng quan AWS Step Functions |
| 003 | Step Functions – Invoke Lambda – Hands On | Bài 2 – State machine gọi Lambda |
| 004–005 | Step Functions – Error Handling | Bài 3 – Xử lý lỗi: Retry, Catch, ResultPath |
| 006 | Step Functions – Wait For Task Token | Bài 4 – Wait for Task Token (callback pattern) |
| 007 | Step Functions – Activity Tasks | Bài 5 – Activity Tasks |
| 008 | Step Functions – Standard vs Express | Bài 6 – Standard vs Express Workflows |
| 009–010 | AppSync Overview | Bài 7 – AWS AppSync |
| 011–012 | AWS Amplify | Bài 8 – AWS Amplify |
| Quiz | Other Serverless Quiz | Câu hỏi ôn tập |

---

## Bài 1 – Tổng quan AWS Step Functions

### Lý thuyết

- **Step Functions** cho phép mô hình hoá workflow dưới dạng **state machine** – **mỗi workflow là một state machine**.
- Use case: xử lý đơn hàng (order fulfillment), xử lý dữ liệu, web application, hoặc bất kỳ workflow nào: định nghĩa *việc gì xảy ra*, *việc gì tiếp theo*, *rẽ nhánh theo điều kiện*.
- Workflow được định nghĩa bằng **JSON** – gọi là **Amazon States Language (ASL)**. Từ JSON này console vẽ ra **sơ đồ trực quan**, hiển thị tiến trình thực thi và **lịch sử thực thi** (execution history).
- Mỗi bước có thể là một Lambda function, ghi dữ liệu vào DynamoDB, chạy ECS task… Step Functions đóng vai trò **điều phối (orchestrate)**.
- **Cách khởi chạy workflow:** gọi API qua **SDK** (`StartExecution`), **API Gateway**, **EventBridge** (CloudWatch Events), hoặc **thủ công trên console**.

#### Task state

Task state dùng để **thực hiện công việc**:

- Gọi **Lambda function**.
- Chạy **AWS Batch job**.
- Chạy **ECS task** và chờ hoàn tất.
- **Ghi item vào DynamoDB** trực tiếp.
- **Publish message** vào **SNS** / **SQS**.
- Khởi chạy **một Step Functions workflow khác**.
- Chạy một **Activity**: EC2, ECS task, server on-premises… **chủ động poll** Step Functions để lấy việc, làm xong thì gửi kết quả về. Ở đây Step Functions **không gọi** app server; app server tự kéo việc — giống cách dịch vụ cũ **SWF (Simple Workflow Service)** hoạt động.

Ví dụ Task state gọi Lambda:

```json
"Invoke Lambda function": {
  "Type": "Task",
  "Resource": "arn:aws:states:::lambda:invoke",
  "Parameters": {
    "FunctionName": "arn:aws:lambda:us-east-1:123456789012:function:MyFunction:$LATEST",
    "Payload": { "Input.$": "$" }
  },
  "Next": "NextState",
  "TimeoutSeconds": 300
}
```

#### Các loại state

| State | Mục đích |
|---|---|
| **Task** | Thực hiện công việc (Lambda, Batch, ECS, DynamoDB, SNS, SQS, workflow khác, Activity…) |
| **Choice** | Kiểm tra điều kiện, rẽ sang nhánh tương ứng hoặc nhánh **Default** |
| **Fail / Succeed** | Dừng workflow với trạng thái thất bại / thành công |
| **Pass** | Chuyển input thành output, hoặc chèn dữ liệu cố định, **không làm việc gì** |
| **Wait** | Trì hoãn một khoảng thời gian hoặc tới một thời điểm cụ thể |
| **Map** | **Lặp động** các bước trên từng phần tử của mảng |
| **Parallel** | Chạy **nhiều nhánh song song** |

> Đề thi hay hỏi **Parallel state** (và Task state).

- Ví dụ workflow trong video: *Submit Job → Wait X Seconds → Get Job Status → Job Complete?* — nếu chưa xong thì quay lại Wait (vòng lặp); xong thì *Get Final Job Status*; thất bại thì *Job Failed*. Trên console, state đang chạy hiển thị màu xanh dương, giúp theo dõi trực quan.
- Bạn có thể nghĩ "viết tất cả trong một Lambda cũng được", nhưng sức mạnh thực sự của Step Functions nằm ở **xử lý lỗi**, **trực quan hoá** và **lịch sử thực thi** (Bài 3).

### Kiến thức thực tế

- **Cập nhật (11/2024): Variables và JSONata.** Video dùng `Assign` (biến workflow) — tính năng mới so với bản khoá học gốc. Đồng thời Step Functions hỗ trợ **JSONata** làm *query language* thay cho JSONPath, đơn giản hoá cú pháp (bỏ `InputPath/Parameters/ResultSelector/ResultPath/OutputPath`, thay bằng `Arguments` và `Output`):

  ```json
  {
    "QueryLanguage": "JSONata",
    "StartAt": "Is Hello World Example?",
    "States": {
      "Is Hello World Example?": {
        "Type": "Choice",
        "Choices": [
          { "Condition": "{% $states.input.IsHelloWorldExample = true %}", "Next": "Done" }
        ],
        "Default": "Fail"
      },
      "Done": { "Type": "Succeed" },
      "Fail": { "Type": "Fail" }
    }
  }
  ```

  Tài liệu và đề thi cũ dùng JSONPath (`$.field`, `"Key.$"`) — cả hai cú pháp đều còn hợp lệ.
- **Intrinsic functions** (`States.Format`, `States.MathAdd`, `States.StringToJson`, `States.UUID`, `States.ArrayPartition`…) xử lý dữ liệu ngay trong ASL mà không cần Lambda.
- **Distributed Map** (12/2022): Map state chạy tới hàng nghìn child workflow song song, đọc trực tiếp hàng triệu object/dòng CSV từ S3.
- **Giới hạn payload:** input/output mỗi state tối đa **256 KiB**. Dữ liệu lớn → lưu S3, truyền key.
- **Service integration:** ngoài Lambda, Step Functions gọi trực tiếp **hơn 200 dịch vụ** qua *AWS SDK integrations* (`arn:aws:states:::aws-sdk:<service>:<apiAction>`) và gọi **HTTPS endpoint** bên ngoài (HTTP Task, 11/2023) — giảm Lambda "keo dán".
- **TestState API** cho phép test một state riêng lẻ; **Redrive** (11/2023) cho phép chạy lại execution Standard thất bại từ state lỗi.

### Ghi nhớ cho kỳ thi

- Điều phối nhiều Lambda thành workflow → **Step Functions** (không phải SWF – dịch vụ cũ, CodePipeline, OpsWorks).
- Workflow viết bằng **JSON (ASL)**, có giao diện trực quan và lịch sử thực thi.
- Chạy nhiều Lambda song song rồi đợi tất cả xong → **Parallel state** + một Task state cuối.
- Khởi chạy qua SDK, API Gateway, EventBridge, console.

---

## Bài 2 – State machine gọi Lambda

### Lý thuyết

- Task state **Lambda Invoke** cấu hình: tên state, kiểu integration, **function name/ARN**, payload, xử lý input/output, xử lý lỗi.
- Có thể kéo thả trong Workflow Studio hoặc dán ASL JSON vào tab **Code**.
- Workflow của bài: **Lambda Invoke → Choice** — nếu output Lambda chứa chuỗi `Stephane` → **Is Teacher** (Pass, output `"Woohoo!"`); ngược lại → **Not Teacher** (Fail, mã lỗi kèm lý do "Stephane the teacher wasn't found in the output of the Lambda Function").
- Khi state machine gọi Lambda (và có thể X-Ray), cần **IAM execution role**; console **tự tạo role** với quyền cần thiết.

### Kiến thức thực tế

- `arn:aws:states:::lambda:invoke` (optimized integration) trả về **toàn bộ response** của API Invoke (`Payload`, `StatusCode`, `ExecutedVersion`…); vì vậy dùng `"OutputPath": "$.Payload"` để chỉ lấy kết quả hàm. Nếu dùng ARN Lambda trực tiếp làm `Resource` thì output là payload luôn.
- Role tối thiểu cho state machine:

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": ["arn:aws:lambda:us-east-1:123456789012:function:HelloFunction*"]
    }]
  }
  ```

  Thiếu quyền này → lỗi **`States.Permissions`** hoặc `Lambda.AWSLambdaException` (AccessDenied).
- Khởi chạy từ code (Node.js SDK v3):

  ```js
  import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";
  const sfn = new SFNClient({});
  await sfn.send(new StartExecutionCommand({
    stateMachineArn: process.env.SM_ARN,
    name: `order-${orderId}`,          // tên execution là duy nhất -> chống chạy trùng (Standard)
    input: JSON.stringify({ who: "Stephane" }),
  }));
  ```

### Ghi nhớ cho kỳ thi

- State machine cần **IAM role** để gọi Lambda/dịch vụ khác.
- **Choice** rẽ nhánh dựa vào output state trước; có nhánh **Default**.
- **Fail** state có `Error` và `Cause`; **Pass** state có thể trả `Result` cố định.

---

## Bài 3 – Xử lý lỗi: Retry, Catch, ResultPath

### Lý thuyết

- Step Functions chạy nhiều task nhỏ; **xử lý lỗi nên đặt ở state machine, không đặt trong code ứng dụng** → code đơn giản hơn, và lịch sử retry/catch hiển thị ngay trong execution history.
- Nguồn lỗi:
  - **Lỗi định nghĩa** state machine (ví dụ không có rule nào khớp trong Choice).
  - **Task thất bại** (ví dụ Lambda ném exception) — đừng catch trong Lambda, hãy để Step Functions xử lý.
  - **Lỗi tạm thời** (transient), ví dụ network partition.
- Hai cơ chế: **Retry** (thử lại task) và **Catch** (chuyển sang nhánh xử lý lỗi).

#### Mã lỗi định sẵn

| Mã lỗi | Ý nghĩa |
|---|---|
| `States.ALL` | Khớp **mọi** lỗi |
| `States.Timeout` | Task chạy quá `TimeoutSeconds` hoặc **không nhận được heartbeat** từ activity |
| `States.TaskFailed` | Task thực thi thất bại (ví dụ exception trong Lambda) |
| `States.Permissions` | **Không đủ quyền** để thực thi |

- State cũng có thể **tự báo lỗi riêng** (ví dụ `CustomError` do Lambda ném ra) và Step Functions bắt được theo tên.

#### Retry

- Áp dụng cho **Task** và **Parallel** state; danh sách retrier **đánh giá từ trên xuống**.

| Trường | Ý nghĩa |
|---|---|
| `ErrorEquals` | Loại lỗi khớp, ví dụ `["CustomError"]`, `["States.TaskFailed"]`, `["States.ALL"]` |
| `IntervalSeconds` | Chờ bao lâu trước lần retry đầu |
| `BackoffRate` | Hệ số nhân thời gian chờ sau mỗi lần retry (= **exponential backoff**) |
| `MaxAttempts` | Số lần retry tối đa; **mặc định 3**, **0 = không bao giờ retry** |

- Khi **hết số lần retry**, **Catch** mới được kích hoạt.
- Lợi ích so với tự retry trong Lambda: Lambda chạy ngắn, không bị timeout vì chờ retry; muốn đổi logic retry chỉ cần sửa JSON, **không phải redeploy Lambda**.

#### Catch

- Cũng **đánh giá từ trên xuống**, gồm:
  - `ErrorEquals`: loại lỗi.
  - `Next`: state chuyển tới (ví dụ `CustomErrorFallback`).
  - `ResultPath`: xác định **input nào được gửi tới state trong `Next`**.

#### ResultPath (hay ra đề)

Ví dụ Catch với `"ErrorEquals": ["States.ALL"], "Next": "NextTask", "ResultPath": "$.error"`:

- Input của task: `{"foo": "bar"}`
- Output gửi sang `NextTask`:

  ```json
  {
    "foo": "bar",
    "error": {
      "Error": "Error here",
      "Cause": "..."
    }
  }
  ```

→ `ResultPath: "$.error"` **gộp thông tin lỗi vào input ban đầu**, để state tiếp theo vừa có dữ liệu gốc vừa có lỗi (ví dụ gửi email, debug).

### Kiến thức thực tế

- **Quy tắc ASL:** `States.ALL` phải đứng **một mình** trong `ErrorEquals` và là **phần tử cuối** của mảng `Retry`/`Catch`.
- `States.TaskFailed` khớp mọi lỗi của task **trừ `States.Timeout`**.
- Các mã lỗi khác nên biết: `States.HeartbeatTimeout`, `States.Runtime` (lỗi runtime như JSONPath sai — **không retry được**), `States.DataLimitExceeded` (vượt 256 KiB), `States.BranchFailed` (một nhánh Parallel/Map thất bại), `States.NoChoiceMatched`.
- Mặc định của Retry: `IntervalSeconds` = 1, `MaxAttempts` = 3, `BackoffRate` = 2.0. Từ 2023 có thêm **`MaxDelaySeconds`** (giới hạn thời gian chờ tối đa) và **`JitterStrategy: "FULL"`** (thêm jitter tránh retry đồng loạt).
- **ResultPath mặc định** của Catch là `$` → output lỗi **thay thế hoàn toàn** input. Muốn giữ input gốc, đặt `"ResultPath": "$.error"`. Trong chế độ **JSONata**, dùng `$states.errorOutput` trong `Output`/`Assign` của Catcher thay cho ResultPath.
- Lambda ném lỗi với tên lỗi = `errorType` (tên class exception) → đặt tên exception có ý nghĩa để Step Functions phân loại được. Lỗi hạ tầng Lambda (`Lambda.ServiceException`, `Lambda.TooManyRequestsException`…) nên luôn được retry.

### Ghi nhớ cho kỳ thi

- Xử lý lỗi bằng **Retry** (IntervalSeconds, BackoffRate, MaxAttempts) và **Catch** (ErrorEquals, Next, ResultPath) — **trong state machine, không trong code**.
- **`States.Permissions`** → cấp thêm **IAM permission** cho state machine.
- **`States.Timeout`** → chạy quá `TimeoutSeconds` hoặc không có heartbeat. **`States.TaskFailed`** → task lỗi khi thực thi.
- **`ResultPath: "$.error"`** → đưa lỗi vào input, truyền sang state tiếp theo.
- Retry/Catch đánh giá **từ trên xuống**; Catch chỉ chạy **sau khi hết retry**.

---

## Bài 4 – Wait for Task Token (callback pattern)

### Lý thuyết

- Dùng khi workflow phải **chờ một hệ thống bên ngoài** trả kết quả: dịch vụ AWS khác, **human approval**, tích hợp bên thứ ba, hệ thống legacy.
- Thêm hậu tố **`.waitForTaskToken`** vào trường `Resource` của Task, ví dụ `arn:aws:states:::sqs:sendMessage.waitForTaskToken`.
- Task **tạm dừng** cho đến khi nhận lại **task token** qua API **`SendTaskSuccess`** hoặc **`SendTaskFailure`**.

**Luồng ví dụ – "Check Credit":**

1. Step Functions gửi message vào **SQS**, kèm input và **task token**.
2. Một ứng dụng bất kỳ (Lambda, ECS, EC2, server bên thứ ba…) **poll** SQS, xử lý message, lấy được input và task token.
3. Ứng dụng gọi **`SendTaskSuccess`** (kèm output + task token) hoặc **`SendTaskFailure`**.
4. Step Functions nhận đúng token → workflow chạy tiếp.

- Đây là cơ chế **push**: Step Functions **đẩy** việc ra ngoài (SQS, SNS, Lambda…), bên ngoài làm xong thì **gọi lại** (callback).

### Kiến thức thực tế

- Chỉ dùng được với **Standard workflow** (Express không hỗ trợ `.waitForTaskToken`).
- Nên đặt **`HeartbeatSeconds`** / `TimeoutSeconds`; nếu không, task có thể chờ đến giới hạn tối đa của execution (1 năm). Bên ngoài gửi `SendTaskHeartbeat` để giữ task sống.
- Ứng dụng phổ biến: **human approval** qua email (SNS gửi link API Gateway → Lambda gọi `SendTaskSuccess`).
- Đừng nhầm với **`.sync`** (Run a Job): ví dụ `arn:aws:states:::ecs:runTask.sync` — Step Functions **tự** đợi job AWS hoàn tất, không cần token.

### Ghi nhớ cho kỳ thi

- Chờ hệ thống ngoài/human approval → **`.waitForTaskToken`** + **`SendTaskSuccess` / `SendTaskFailure`**.
- Task token phải được **truyền kèm message** để bên ngoài gọi lại.
- Cơ chế **push** (Step Functions đẩy việc ra ngoài).

---

## Bài 5 – Activity Tasks

### Lý thuyết

- Mục đích giống Wait for Task Token nhưng cách làm khác: **Activity Worker** (chạy trên EC2, Lambda, thiết bị di động… bất kỳ đâu) **định kỳ poll** Step Functions để tìm việc bằng API **`GetActivityTask`**.
- Có việc → nhận **input + task token** → làm xong → gửi **`SendTaskSuccess`** hoặc **`SendTaskFailure`** (cùng API như trước).

| | Activity Tasks | Wait for Task Token (callback) |
|---|---|---|
| Cơ chế | **Pull**: worker kéo việc từ Step Functions | **Push**: Step Functions đẩy việc ra SQS/SNS/Lambda… |
| API lấy việc | `GetActivityTask` | Worker nhận từ dịch vụ trung gian (ví dụ poll SQS) |
| Báo kết quả | `SendTaskSuccess` / `SendTaskFailure` | `SendTaskSuccess` / `SendTaskFailure` |
| Mạng | Đơn giản: worker chỉ cần kết nối tới Step Functions | Cần thêm dịch vụ trung gian |

#### Tham số

- **`TimeoutSeconds`**: task đang chạy chờ tối đa bao lâu trước khi bị coi là thất bại.
- **`HeartbeatSeconds`**: thời gian tối đa giữa hai lần heartbeat. Worker gửi **`SendTaskHeartbeat`** để báo còn sống. Ví dụ HeartbeatSeconds = 10 thì nên gửi heartbeat mỗi 5 giây.
- Đặt `TimeoutSeconds` dài và gửi heartbeat đều đặn → Activity Task có thể chờ **tới 1 năm**.

### Kiến thức thực tế

- Worker cần IAM quyền `states:GetActivityTask`, `states:SendTaskSuccess`, `states:SendTaskFailure`, `states:SendTaskHeartbeat`.
- Activity chỉ dùng với **Standard workflow**.
- Nếu không gửi heartbeat kịp → task lỗi **`States.Timeout`** (heartbeat timeout) → có thể Retry/Catch như Bài 3.
- Trong hệ thống mới, AWS thường khuyến nghị **callback pattern** (`.waitForTaskToken`) hoặc service integration trực tiếp; Activity phù hợp khi worker nằm sau firewall/on-premises chỉ có kết nối ra ngoài.

### Ghi nhớ cho kỳ thi

- **Activity = pull** (`GetActivityTask`); **Task Token = push**.
- `SendTaskHeartbeat` + `HeartbeatSeconds`; quá hạn → `States.Timeout`.
- Activity task có thể chờ tới **1 năm**.

---

## Bài 6 – Standard vs Express Workflows

### Lý thuyết

| | **Standard** (mặc định) | **Express – Asynchronous** | **Express – Synchronous** |
|---|---|---|---|
| Thời lượng tối đa | **1 năm** | **5 phút** | **5 phút** |
| Tốc độ khởi chạy | ~**2.000** execution/giây | **> 100.000** execution/giây | **> 100.000** execution/giây |
| Mô hình thực thi | **Exactly-once** | **At-least-once** | **At-most-once** |
| Lịch sử thực thi | Console giữ **90 ngày**; lâu hơn → CloudWatch Logs (retention tuỳ chỉnh) | Chỉ qua **CloudWatch Logs** | Chỉ qua **CloudWatch Logs** |
| Tính phí | Theo **số state transition** | Theo **số execution, thời lượng, bộ nhớ** | Như Async |
| Use case | Tác vụ **non-idempotent**, ví dụ **xử lý thanh toán** | IoT data ingestion, streaming, mobile backend; không cần phản hồi ngay | Orchestrate microservices, cần **kết quả ngay** |

- **Asynchronous Express:** khởi chạy và **không đợi kết quả**; muốn biết kết quả phải xem CloudWatch Logs. Ví dụ dịch vụ messaging: gửi rồi thôi. Vì **at-least-once**, Step Functions có thể tự chạy lại khi lỗi → cùng một hành động có thể chạy **2 lần** → bạn phải đảm bảo **idempotency**.
- **Synchronous Express:** gọi và **đợi workflow hoàn tất** để lấy kết quả, có thể gọi từ **API Gateway** hoặc **Lambda**. **At-most-once**: nếu lỗi, Step Functions **không tự khởi động lại** workflow — muốn thử lại phải tự cài logic.

### Kiến thức thực tế

- Loại workflow (`STANDARD`/`EXPRESS`) **chọn khi tạo, không đổi được** sau đó.
- Express **không hỗ trợ** `.waitForTaskToken`, `.sync` (Run a Job) và Activity — vì giới hạn 5 phút.
- Mẫu kết hợp phổ biến: workflow **Standard cha** gọi **Express con** cho phần xử lý khối lượng lớn, ngắn hạn → tiết kiệm chi phí.
- Standard: tên execution là **duy nhất** trong 90 ngày → dùng làm khoá chống chạy trùng. Express không có đảm bảo này.
- Giá (us-east-1, để tham khảo): Standard khoảng **$0.025 / 1.000 state transitions**, free tier 4.000 transitions/tháng. Workflow có nhiều bước và lưu lượng cao thường rẻ hơn hẳn khi dùng Express. Luôn kiểm tra trang pricing.

### Ghi nhớ cho kỳ thi

- **Standard = exactly-once, ≤ 1 năm, tính theo state transition, non-idempotent (thanh toán).**
- **Express Async = at-least-once** (cần idempotent); **Express Sync = at-most-once**.
- Express ≤ **5 phút**, > 100.000 exec/giây, xem kết quả qua **CloudWatch Logs**.
- Cần kết quả ngay từ API Gateway → **Synchronous Express**.

---

## Bài 7 – AWS AppSync

### Lý thuyết

Hai góc nhìn quan trọng cho kỳ thi:

1. **Dịch vụ managed dùng GraphQL** – muốn xây **GraphQL API** trên AWS → **AppSync**.
2. **Real-time** qua **WebSocket** hoặc **MQTT over WebSocket**.

#### GraphQL là gì?

- Kiểu API mới: client **chỉ hỏi những field cần**, GraphQL **trả đúng những field đó**.
- **Gộp dữ liệu từ nhiều nguồn** thành một graph: NoSQL, cơ sở dữ liệu quan hệ, HTTP API…
- AppSync tích hợp trực tiếp với **DynamoDB**, **Aurora**, **OpenSearch**…; nguồn bất kỳ khác qua **Lambda**; hoặc **HTTP endpoint** công khai có sẵn.

#### Các use case khác

- Ứng dụng **real-time** (ví dụ dashboard thời gian thực): AppSync với WebSocket là một lựa chọn (ngoài **ALB** và **API Gateway** – cũng hỗ trợ WebSocket).
- Ứng dụng mobile cần **truy cập dữ liệu local và đồng bộ** (offline data synchronization): AppSync **thay thế Cognito Sync** (dịch vụ đã lỗi thời).

#### Cách hoạt động

1. **Upload GraphQL schema** lên AppSync.
2. Client gửi **query**, ví dụ hỏi `human(id: ...)` lấy `name`, `appearsIn`, `starships { name }`.
3. AppSync chạy **resolver** – "phép màu" của GraphQL – ví dụ resolver đọc từ DynamoDB.
4. AppSync trả **JSON đúng hình dạng query** đã hỏi.

> Đề thi **không** yêu cầu viết schema hay query, chỉ cần hiểu ở mức high-level.

- **Client:** web app, mobile app (GraphQL), dashboard real-time, ứng dụng cần offline sync.
- **Giám sát:** tích hợp **CloudWatch Metrics** và **CloudWatch Logs**.

#### Bảo mật – các chế độ authorization

| Chế độ | Mô tả |
|---|---|
| **`API_KEY`** | Sinh API key và phát cho client (giống API Gateway) |
| **`AWS_IAM`** | IAM users, roles, **cross-account** |
| **`OPENID_CONNECT`** | Tích hợp OpenID Connect provider và JSON Web Token |
| **`AMAZON_COGNITO_USER_POOLS`** | Dùng Cognito User Pool có sẵn; qua User Pool có thể federate với social login |

- Muốn **HTTPS với custom domain**: video khuyến nghị đặt **CloudFront trước AppSync** (xem ghi chú cập nhật bên dưới).

### Kiến thức thực tế

- **Cập nhật – authorization:** ngoài 4 chế độ trong phần lý thuyết, AppSync có thêm **`AWS_LAMBDA`** (Lambda authorizer, tự viết logic xác thực) — chính là lựa chọn *Lambda* thấy trong hands-on. Có thể bật **nhiều chế độ cùng lúc** (multi-auth) và dùng directive như `@aws_api_key`, `@aws_iam`, `@aws_cognito_user_pools` trên từng type/field.
- **Cập nhật – custom domain:** AppSync hiện đã hỗ trợ **custom domain name gốc** (dùng chứng chỉ ACM) — đúng như mục *Custom domain names* trong hands-on. CloudFront phía trước vẫn là lựa chọn hợp lệ (đáp án quen thuộc của đề cũ), nhưng không còn bắt buộc.
- **Resolver:** ngoài VTL (Velocity Template Language) truyền thống, AppSync hỗ trợ **JavaScript resolver** (runtime `APPSYNC_JS`) và **pipeline resolver** (chuỗi nhiều *function*). Ví dụ resolver `getStudent`:

  ```js
  import { util } from "@aws-appsync/utils";

  export function request(ctx) {
    return {
      operation: "GetItem",
      key: util.dynamodb.toMapValues({ id: ctx.args.id }),
    };
  }

  export function response(ctx) {
    if (ctx.error) util.error(ctx.error.message, ctx.error.type);
    return ctx.result;
  }
  ```

- **Real-time:** GraphQL **subscriptions** (`@aws_subscribe`) đẩy dữ liệu qua WebSocket khi có mutation. Ngoài ra, **AppSync Events** (10/2024) cung cấp WebSocket **pub/sub** thuần, không cần GraphQL.
- API key mặc định hết hạn sau **7 ngày**, gia hạn tối đa **365 ngày** — đừng dùng API key cho production cần xác thực người dùng.
- **Merged API** gộp nhiều *source API* của các team thành một endpoint.

### Ghi nhớ cho kỳ thi

- **GraphQL** trên AWS → **AppSync** (kể cả khi **migrate GraphQL API từ on-premises**).
- Real-time WebSocket: **AppSync, API Gateway, ALB** đều hỗ trợ; **DynamoDB không**.
- Offline sync cho mobile → AppSync (thay **Cognito Sync**).
- Authorization: **API_KEY, AWS_IAM, OPENID_CONNECT, AMAZON_COGNITO_USER_POOLS** (+ AWS_LAMBDA).
- Resolver đọc dữ liệu từ DynamoDB, Aurora, OpenSearch, Lambda, HTTP.

---

## Bài 8 – AWS Amplify

### Lý thuyết

- **Amplify** = bộ công cụ để xây dựng **ứng dụng web và mobile**. Có thể coi là **"Elastic Beanstalk cho ứng dụng web & mobile"**.

| Thành phần | Vai trò |
|---|---|
| **Amplify Studio** | Xây dựng full-stack app **trực quan** (UI front-end + backend) |
| **Amplify CLI** | Làm điều tương tự bằng dòng lệnh (`amplify init`) |
| **Amplify Libraries** | Kết nối app với dịch vụ AWS có sẵn (Cognito để login, S3 để lưu file…) |
| **Amplify Hosting** | Host ứng dụng trên AWS, phân phối nhanh |

- Tính năng "phải có": **data storage, authentication, file storage, machine learning** — tất cả chạy trên dịch vụ AWS: **DynamoDB, AppSync (GraphQL), Cognito, S3**…
- **Front-end libraries** cho React, Vue, JavaScript, iOS, Android, Flutter…
- Là "one-stop shop", tích hợp sẵn best practice về reliability, security, scalability. Deploy bằng Amplify CLI hoặc Amplify Studio.

#### Ba tính năng quan trọng cho kỳ thi

| Tính năng | Lệnh (Gen 1 CLI) | Dịch vụ phía sau | Chi tiết |
|---|---|---|---|
| **Authentication** | `amplify add auth` | **Amazon Cognito** | Đăng ký, đăng nhập, khôi phục tài khoản; hỗ trợ **MFA**, **social sign-in**; component front-end dựng sẵn; **phân quyền chi tiết** (fine-grained authorization) |
| **DataStore** | `amplify add api` | **AppSync** + **DynamoDB** | Làm việc với **dữ liệu local**, **tự động đồng bộ lên cloud** không cần code phức tạp; dựa trên GraphQL; hỗ trợ **offline và real-time**; mô hình hoá dữ liệu trong Amplify Studio |
| **Amplify Hosting** | `amplify add hosting` | (CloudFront…) | Build & host web app hiện đại: **CI/CD** (build, test, deploy), **pull request previews**, **custom domain**, monitoring, **redirect & custom headers**, **password protection** — tương tự Netlify, Vercel |

- Luồng Hosting: code trên **GitHub / Bitbucket / GitLab / CodeCommit** → CI/CD build front-end → deploy (ví dụ qua CloudFront); tuỳ chọn build và deploy cả backend.

#### Kiểm thử trong Amplify

| Loại test | Khi nào | Mục đích |
|---|---|---|
| **Unit test** (build-level) | Lúc **build** | Code có làm đúng việc của nó không |
| **End-to-end (E2E) test** | Ở **test phase**, sau khi app chạy | **Bắt regression trước khi lên production**, kiểm tra hành vi từ góc độ người dùng |

- Khai báo test step trong file **`amplify.yml`**.
- Dùng framework **Cypress** để viết E2E test: sinh **báo cáo UI**, mô phỏng trình duyệt và thao tác click ("click vào đây, làm cái này…") để kiểm tra app.
- Thứ tự: **build (unit test) → test (E2E) → deploy**.

### Kiến thức thực tế

- **Cập nhật – Amplify Gen 2 (GA 5/2024):** backend định nghĩa bằng **TypeScript** (`defineAuth`, `defineData`, `defineStorage`, `defineFunction`), triển khai bằng **CDK**, mỗi git branch là một môi trường, mỗi dev có **sandbox** riêng (`npx ampx sandbox`). Lý thuyết video (và đề thi) dùng cú pháp **Gen 1** (`amplify init`, `amplify add auth`, `amplify add api`, `amplify add hosting`, `amplify push`/`amplify publish`) — vẫn cần nhớ cho kỳ thi.
- **DataStore** là tính năng của Gen 1; Gen 2 **không hỗ trợ DataStore**, thay bằng data client (`generateClient`) gọi AppSync trực tiếp, dùng subscriptions (`observeQuery`) cho real-time.
- Amplify Hosting cũng host được ứng dụng **SSR** (Next.js) và có thể dùng **riêng** (chỉ hosting frontend, không dùng backend Amplify).
- Amplify chỉ là lớp trừu tượng: mọi tài nguyên (Cognito, AppSync, DynamoDB, S3, Lambda) nằm **trong account của bạn**, xem được trong CloudFormation — khác với Netlify/Vercel.

### Ghi nhớ cho kỳ thi

- Amplify = "**Elastic Beanstalk cho web & mobile app**".
- `amplify add auth` → **Cognito**; `amplify add api` (DataStore) → **AppSync + DynamoDB**, offline & real-time; `amplify add hosting` → CI/CD, PR preview, custom domain.
- E2E test khai báo trong **`amplify.yml`** (test phase), framework **Cypress**; unit test ở build phase.

---

## Tổng kết chương

| Chủ đề | Điều cần nhớ |
|---|---|
| Step Functions | Workflow = state machine viết bằng **ASL (JSON)**; trực quan, có lịch sử; khởi chạy qua SDK, API Gateway, EventBridge, console |
| Các state | Task, Choice, Pass, Wait, Map, **Parallel**, Succeed, Fail |
| Error handling | **Retry** (ErrorEquals, IntervalSeconds, BackoffRate, MaxAttempts – mặc định 3) → **Catch** (ErrorEquals, Next, ResultPath); xử lý trong state machine, không trong code |
| Mã lỗi | `States.ALL`, `States.Timeout`, `States.TaskFailed`, `States.Permissions` (→ thêm IAM permission) |
| ResultPath | `$.error` → giữ input gốc + thêm thông tin lỗi |
| Wait for Task Token | `.waitForTaskToken`, push, `SendTaskSuccess`/`SendTaskFailure` |
| Activity Tasks | Pull bằng `GetActivityTask`; `TimeoutSeconds`, `HeartbeatSeconds`, `SendTaskHeartbeat`; tối đa 1 năm |
| Standard | ≤ 1 năm, exactly-once, ~2.000/s, tính theo state transition, lịch sử 90 ngày |
| Express | ≤ 5 phút, > 100.000/s, CloudWatch Logs; **Async = at-least-once**, **Sync = at-most-once** |
| AppSync | GraphQL managed; resolvers (DynamoDB, Aurora, OpenSearch, Lambda, HTTP); real-time WebSocket; thay Cognito Sync; auth API_KEY / IAM / OIDC / Cognito (+ Lambda) |
| Amplify | Studio, CLI, Libraries, Hosting; auth = Cognito, data = AppSync + DynamoDB; E2E test Cypress trong `amplify.yml` |
| Cập nhật 2022–2026 | Distributed Map (12/2022); HTTP Task, Redrive, TestState (11/2023); Variables + **JSONata** (11/2024); AppSync JS resolvers, custom domain gốc, Lambda auth, AppSync Events (10/2024); **Amplify Gen 2** (5/2024) |

---

## Câu hỏi ôn tập

*Nguồn: Other Serverless Quiz. Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Bạn muốn điều phối một chuỗi Lambda function thành một workflow. Nên dùng dịch vụ AWS nào?

- A. AWS Simple Workflow Service
- B. AWS CodePipeline
- C. AWS Step Functions
- D. AWS OpsWorks

<details><summary>Đáp án</summary>

**C.** Step Functions là dịch vụ workflow trực quan low-code để điều phối dịch vụ AWS, tự động hoá quy trình và xây ứng dụng serverless; tự quản lý lỗi, retry, chạy song song, tích hợp dịch vụ. A: SWF là dịch vụ cũ để chạy job nền có bước tuần tự/song song — để điều phối Lambda hãy dùng Step Functions. B: CodePipeline là dịch vụ CD tự động build/test/deploy khi code thay đổi. D: OpsWorks là dịch vụ quản lý cấu hình (Chef, Puppet) – đã ngừng hoạt động.
</details>

**Câu 2.** Đội phát triển đang làm ứng dụng mobile và muốn có backend **GraphQL** được quản lý. Bạn đề xuất dịch vụ nào?

- A. Amazon API Gateway
- B. AWS AppSync
- C. AWS Lambda
- D. Amazon ECS

<details><summary>Đáp án</summary>

**B.** AppSync là dịch vụ managed giúp phát triển GraphQL API, lo phần kết nối an toàn tới các nguồn dữ liệu như DynamoDB, Lambda… A: API Gateway dùng để tạo/publish REST, HTTP, WebSocket API, không phải dịch vụ GraphQL managed. C: Lambda là compute (FaaS). D: ECS là dịch vụ điều phối container.
</details>

**Câu 3.** Bạn muốn điều phối nhiều Lambda function và **đợi kết quả của tất cả** trước khi ra quyết định cuối cùng. Bạn đề xuất gì?

- A. Step Functions **Parallel State** rồi một Task State cuối cùng
- B. Dùng AppSync Real-Time API
- C. Xây dựng luồng bằng EventBridge

<details><summary>Đáp án</summary>

**A.** Parallel state chạy các nhánh song song và **chỉ hoàn tất khi mọi nhánh xong**, output là mảng kết quả của các nhánh → Task state cuối dùng mảng này để ra quyết định. AppSync không phải công cụ điều phối; EventBridge định tuyến sự kiện nhưng không có cơ chế "đợi tất cả rồi gộp kết quả".
</details>

**Câu 4.** Workflow Step Functions gồm chuỗi Task State gọi các Lambda function. Khi chạy, một state báo lỗi mã **`States.Permissions`**. Bạn giải quyết thế nào?

- A. Có lỗi thực thi bên trong Lambda function được Task State này gọi
- B. Cần cấp cho workflow Step Functions **IAM permission** cần thiết để thực thi Lambda function mà Task State này gọi
- C. Task State chạy lâu hơn `TimeoutSeconds` nên thất bại

<details><summary>Đáp án</summary>

**B.** `States.Permissions` nghĩa là state machine **không đủ quyền** thực thi task → bổ sung quyền (ví dụ `lambda:InvokeFunction`) vào execution role. A tương ứng với `States.TaskFailed`; C tương ứng với `States.Timeout`.
</details>

**Câu 5.** Dịch vụ AWS nào sau đây **không hỗ trợ** giao thức WebSocket?

- A. Application Load Balancer
- B. API Gateway
- C. AppSync
- D. DynamoDB

<details><summary>Đáp án</summary>

**D.** DynamoDB là cơ sở dữ liệu, truy cập qua HTTPS API, không có endpoint WebSocket. ALB hỗ trợ WebSocket, API Gateway có **WebSocket API**, AppSync dùng WebSocket cho subscriptions/real-time.
</details>

**Câu 6.** Bạn có một API dựa trên **GraphQL** đang chạy on-premises và muốn chuyển lên AWS. Nên chọn dịch vụ nào?

- A. AppSync
- B. DynamoDB
- C. Lambda
- D. Application Load Balancer

<details><summary>Đáp án</summary>

**A.** AppSync là dịch vụ GraphQL managed của AWS: upload schema, cấu hình resolver tới nguồn dữ liệu. DynamoDB có thể là nguồn dữ liệu phía sau, Lambda có thể là resolver, ALB chỉ là load balancer — không dịch vụ nào trong số đó tự cung cấp GraphQL API.
</details>

---

[← Chương 27](ch27-cognito-cognito-user-pools-cognito-ide.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chương 29 →](ch29-advanced-identity.md)

