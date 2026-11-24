# Bài tập tình huống — Chủ đề 10: Điều phối & GraphQL — Step Functions & AWS AppSync

> Step Functions Standard vs Express Workflows, ASL States, Error Handling/Retry/Catch và AWS AppSync GraphQL APIs.
> **Số câu hỏi:** 5 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

An AWS Step Functions Standard Workflow orchestrates a loan approval process. One step sends a message to an Amazon SQS queue for a human underwriter to review, and the workflow must pause—potentially for several days—until the external review system calls back with an approval or rejection. How should this step be implemented in Step Functions?

- **A.** Use `.waitForTaskToken` on the SQS `SendMessage` state, and have the external system call `SendTaskSuccess` or `SendTaskFailure` with that token.
- **B.** Use a Step Functions Express Workflow with a `Wait` state configured for up to 7 days until human review completes.
- **C.** Use a Lambda function inside a `Task` state that polls Amazon DynamoDB in a continuous loop for 3 days until approved.
- **D.** Set `HeartbeatSeconds` to 0 and rely on Step Functions to automatically poll the underwriter's email inbox for a reply.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một AWS Step Functions Standard Workflow điều phối quy trình phê duyệt khoản vay. Một bước gửi một message tới hàng đợi Amazon SQS để chuyên viên thẩm định (underwriter) xem xét, và quy trình phải tạm dừng—có thể kéo dài vài ngày—cho đến khi hệ thống đánh giá bên ngoài gọi lại (callback) với kết quả phê duyệt hoặc từ chối. Bước này nên được triển khai như thế nào trong Step Functions?

**Đáp án đúng:** **A**

**Step Functions Callback Pattern (`.waitForTaskToken`)**:
- Chỉ khả dụng trên **Standard Workflow** (thời gian chạy tối đa **1 năm**).
- Khi gửi task tới SQS/ECS/SNS/Lambda với `.waitForTaskToken`, Step Functions sinh ra một `$$.Task.Token` và tạm dừng.
- Hệ thống xử lý xong gọi API **`SendTaskSuccess`** hoặc **`SendTaskFailure`** (có thể gửi **`SendTaskHeartbeat`** định kỳ nếu đặt `HeartbeatSeconds`).

- **A (Đúng):** Đúng! Callback pattern (`.waitForTaskToken`) tạm dừng Step Functions Standard Workflow (tối đa tới 1 năm) mà không tốn phí chờ, cho đến khi hệ thống ngoài gọi `states:SendTaskSuccess` hoặc `states:SendTaskFailure` kèm `TaskToken`.
- **B:** Sai vì Express Workflow chỉ chạy tối đa **5 phút** và không hỗ trợ `.waitForTaskToken` callback.
- **C:** Sai vì AWS Lambda có timeout tối đa chỉ **15 phút** (900 giây), không thể chạy vòng lặp chờ nhiều ngày.
- **D:** Sai vì Step Functions không tự poll email; cần dùng `.waitForTaskToken` kết hợp `SendTaskSuccess`/`SendTaskFailure`.

</details>

### Câu 2 `medium`

A company has an AWS Step Functions workflow that invokes an AWS Lambda function to call an unstable external shipping API. Occasionally, the external API returns a `RateLimitExceeded` custom error. The developer wants Step Functions to automatically retry ONLY when `RateLimitExceeded` occurs—up to 4 times, starting with a 2-second wait and doubling the wait each time—and if all retries fail, transition to a `NotifyOperations` state. How should the Step Functions ASL definition be configured?

- **A.** Write a `while` loop with `time.sleep()` and exponential backoff inside the AWS Lambda function handler.
- **B.** Configure `Catch` before `Retry` in the Step Functions state definition so `NotifyOperations` runs immediately on the first error.
- **C.** Add a `Retry` (`RateLimitExceeded`, `IntervalSeconds: 2`, `MaxAttempts: 4`, `BackoffRate: 2.0`) and a `Catch` targeting `NotifyOperations`.
- **D.** Use `States.ALL` in the `Retry` block with `MaxAttempts: 0` and `BackoffRate: 2.0` before transitioning.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có một quy trình AWS Step Functions gọi một hàm AWS Lambda để gọi một API vận chuyển bên ngoài không ổn định. Thỉnh thoảng, API bên ngoài trả về lỗi tùy chỉnh `RateLimitExceeded`. Developer muốn Step Functions tự động thử lại CHỈ khi `RateLimitExceeded` xảy ra—tối đa 4 lần, bắt đầu bằng thời gian chờ 2 giây và tăng gấp đôi thời gian chờ mỗi lần—và nếu tất cả các lần thử lại đều thất bại, chuyển sang trạng thái `NotifyOperations`. Định nghĩa ASL của Step Functions nên được cấu hình như thế nào?

**Đáp án đúng:** **C**

**Step Functions Error Handling (ASL)**:
- **`Retry`**: `ErrorEquals`, `IntervalSeconds`, `MaxAttempts` (mặc định 3), `BackoffRate` (mặc định 2.0).
- **`Catch`**: Chuyển sang trạng thái fallback (`Next`) khi `Retry` thất bại hoàn toàn.
- Ưu điểm: Thời gian chờ giữa các lần retry trên Step Functions **không tốn tiền chạy Lambda**.

- **A:** Sai vì giữ Lambda ngủ chờ `sleep()` sẽ tốn tiền Compute Duration của Lambda và dễ chạm timeout.
- **B:** Sai vì Step Functions luôn đánh giá `Retry` trước khi kích hoạt `Catch` (nếu không có `Retry` khớp hoặc đã hết `MaxAttempts`).
- **C (Đúng):** Đúng! Trong Amazon States Language (ASL), **`Retry`** tự động thử lại theo cấp số nhân (`BackoffRate: 2.0`, `IntervalSeconds: 2`, `MaxAttempts: 4`), và **`Catch`** chỉ chạy sau khi `Retry` đã hết số lần thử để chuyển luồng sang `NotifyOperations`.
- **D:** Sai vì `MaxAttempts: 0` tắt hoàn toàn việc retry.

</details>

### Câu 3 `medium`

A company builds a serverless order-processing pipeline using AWS Step Functions. One state needs to execute three independent checks (`FraudCheck`, `InventoryCheck`, `CreditCheck`) simultaneously and wait until ALL three checks complete before proceeding to `ConfirmOrder`. Which Step Functions state type should be used?

- **A.** `Parallel` state
- **B.** `Map` state
- **C.** `Choice` branching state
- **D.** `Pass` state

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty xây dựng một pipeline xử lý đơn hàng serverless bằng AWS Step Functions. Một state cần thực thi đồng thời ba bước kiểm tra độc lập (`FraudCheck`, `InventoryCheck`, `CreditCheck`) và chờ cho đến khi TẤT CẢ ba bước kiểm tra hoàn tất trước khi chuyển sang `ConfirmOrder`. Loại Step Functions state nào nên được sử dụng?

**Đáp án đúng:** **A**

Phân biệt các State chính trong **AWS Step Functions**:
- **`Parallel`**: Chạy nhiều nhánh **logic khác nhau** đồng thời.
- **`Map`**: Chạy **cùng 1 logic** song song cho từng phần tử trong một **Array** (Standard Map hoặc Distributed Map cho hàng triệu file S3).
- **`Choice`**: Rẽ nhánh điều kiện.
- **`Wait` / `Pass` / `Task` / `Succeed` / `Fail`**.

- **A (Đúng):** Đúng! **`Parallel`** state chạy đồng thời nhiều nhánh (branches) khác nhau và chỉ chuyển sang bước tiếp theo khi tất cả các nhánh đều hoàn thành.
- **B:** Sai vì **`Map`** state dùng để chạy **cùng một tập bước lặp đi lặp lại** cho từng phần tử trong một mảng JSON đầu vào (ví dụ xử lý từng item trong danh sách đơn hàng).
- **C:** Sai vì `Choice` state dùng để rẽ nhánh điều kiện `if/else` (chỉ chọn 1 nhánh).
- **D:** Sai vì `Pass` state chỉ truyền/biến đổi dữ liệu đầu vào sang đầu ra mà không gọi tác vụ song song.

</details>

### Câu 4 `medium`

A developer builds an IoT data ingestion workflow that receives 50,000 short-lived micro-events per second. Each execution takes under 2 seconds and needs to orchestrate 3 quick steps at the lowest possible cost. Which AWS Step Functions workflow type should be used?

- **A.** Express Workflows
- **B.** Standard Workflows
- **C.** Standard Workflows with Wait states
- **D.** Nested Standard Workflows

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer xây dựng một quy trình tiếp nhận dữ liệu IoT nhận 50.000 micro-event ngắn hạn mỗi giây. Mỗi lần thực thi mất dưới 2 giây và cần điều phối 3 bước nhanh chóng với chi phí thấp nhất có thể. Loại quy trình AWS Step Functions nào nên được sử dụng?

**Đáp án đúng:** **A**

Gặp bài toán **high-volume, short-duration (< 5 phút), IoT/streaming micro-events, tối ưu chi phí** -> **Step Functions Express Workflows**.

- **A (Đúng):** Đúng! **Express Workflows** tối ưu cho thông lượng cực cao (>100,000/s), thời gian chạy tối đa 5 phút và tính phí theo số lượng + thời lượng thực thi (rẻ hơn rất nhiều so với tính theo state transition của Standard).
- **B:** Sai vì Standard Workflows tính phí theo từng state transition, sẽ cực kỳ đắt với 50,000 events/giây.
- **C:** Sai, vẫn đắt và không cần chạy dài ngày.
- **D:** Sai, không giải quyết bài toán chi phí micro-events.

</details>

### Câu 5 `medium`

A company orchestrates a high-volume IoT data ingestion workflow using AWS Step Functions. The workflow runs 50,000 times per second, each execution completes in less than 10 seconds, and the workflow does not need to wait for human callbacks. Which Step Functions workflow type is MOST cost-effective for this workload?

- **A.** Amazon Simple Workflow Service (SWF)
- **B.** AWS Glue Workflow
- **C.** Express Workflow
- **D.** Standard Workflow

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty điều phối một quy trình tiếp nhận dữ liệu IoT lưu lượng lớn bằng AWS Step Functions. Quy trình này chạy 50.000 lần mỗi giây, mỗi lần thực thi hoàn thành trong chưa đầy 10 giây và quy trình không cần chờ callback từ con người. Loại quy trình Step Functions (workflow type) nào TỐI ƯU CHI PHÍ NHẤT cho workload này?

**Đáp án đúng:** **C**

Phân biệt 2 loại **Step Functions Workflow**:
- **Standard Workflow**: Tối đa **1 năm**, ngữ nghĩa **Exactly-once**, hỗ trợ Callback `.waitForTaskToken`.
- **Express Workflow**: Tối đa **5 phút**, tốc độ **>100,000/s**, ngữ nghĩa **At-least-once** (Async) hoặc **At-most-once** (Sync), chi phí rẻ cho lưu lượng lớn.

- **A:** Sai vì SWF là dịch vụ thế hệ cũ dành cho các tác vụ có EC2 worker tự poll, không tối ưu cho IoT tốc độ cao.
- **B:** Sai vì Glue Workflow chỉ dùng cho các batch ETL jobs.
- **C (Đúng):** Đúng! Step Functions Express Workflow hỗ trợ tần suất trên 100,000 executions/giây, thời gian chạy tối đa 5 phút, tính phí theo số lượng thực thi và thời lượng bộ nhớ nên cực kỳ tiết kiệm cho IoT/Streaming.
- **D:** Sai vì Standard Workflow giới hạn 2,000 executions/giây, thời gian chạy tối đa 1 năm và tính phí theo mỗi lần chuyển trạng thái (state transition) nên rất đắt cho 50,000 lượt/giây.

</details>

---

[← Chủ đề 09](09-messaging-sqs-sns-kinesis.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chủ đề 11 →](11-ai-bedrock-q-kiro.md)
