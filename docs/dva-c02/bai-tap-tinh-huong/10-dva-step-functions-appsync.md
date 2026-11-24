# Bài tập tình huống — Chủ đề 10: Điều phối & GraphQL — Step Functions & AWS AppSync

> Step Functions Standard vs Express Workflows, ASL States, Error Handling/Retry/Catch và AWS AppSync GraphQL APIs.
> **Số câu hỏi:** 5 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án & Giải thích chi tiết**.

---

### Câu 1 `medium`

An AWS Step Functions Standard Workflow orchestrates a loan approval process. One step sends a message to an Amazon SQS queue for a human underwriter to review, and the workflow must pause—potentially for several days—until the external review system calls back with an approval or rejection. How should this step be implemented in Step Functions?

- **A.** Use a Step Functions Express Workflow with a `Wait` state configured for up to 7 days while waiting for the underwriter approval.
- **B.** Use a Lambda function inside a `Task` state that polls Amazon DynamoDB in a continuous loop for 3 days until the loan is approved.
- **C.** Use the `.waitForTaskToken` callback pattern on the SQS `SendMessage` state, and have the external system call `SendTaskSuccess` or `SendTaskFailure`.
- **D.** Set `HeartbeatSeconds` to 0 on the SQS `SendMessage` state and rely on Step Functions to automatically poll the underwriter's email.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

**Step Functions Callback Pattern (`.waitForTaskToken`)**:
- Chỉ khả dụng trên **Standard Workflow** (thời gian chạy tối đa **1 năm**).
- Khi gửi task tới SQS/ECS/SNS/Lambda với `.waitForTaskToken`, Step Functions sinh ra một `$$.Task.Token` và tạm dừng.
- Hệ thống xử lý xong gọi API **`SendTaskSuccess`** hoặc **`SendTaskFailure`** (có thể gửi **`SendTaskHeartbeat`** định kỳ nếu đặt `HeartbeatSeconds`).

- **A:** Sai vì Express Workflow chỉ chạy tối đa **5 phút** và không hỗ trợ `.waitForTaskToken` callback.
- **B:** Sai vì AWS Lambda có timeout tối đa chỉ **15 phút** (900 giây), không thể chạy vòng lặp chờ nhiều ngày.
- **C (Đúng):** Đúng! Callback pattern (`.waitForTaskToken`) tạm dừng Step Functions Standard Workflow (tối đa tới 1 năm) mà không tốn phí chờ, cho đến khi hệ thống ngoài gọi `states:SendTaskSuccess` hoặc `states:SendTaskFailure` kèm `TaskToken`.
- **D:** Sai vì Step Functions không tự poll email; cần dùng `.waitForTaskToken` kết hợp `SendTaskSuccess`/`SendTaskFailure`.

</details>

### Câu 2 `medium`

A company has an AWS Step Functions workflow that invokes an AWS Lambda function to call an unstable external shipping API. Occasionally, the external API returns a `RateLimitExceeded` custom error. The developer wants Step Functions to automatically retry ONLY when `RateLimitExceeded` occurs—up to 4 times, starting with a 2-second wait and doubling the wait each time—and if all retries fail, transition to a `NotifyOperations` state. How should the Step Functions ASL definition be configured?

- **A.** Add a `Retry` block for `RateLimitExceeded` (`IntervalSeconds: 2`, `MaxAttempts: 4`, `BackoffRate: 2.0`) and a `Catch` block to `NotifyOperations`.
- **B.** Use `States.ALL` in the `Retry` block with `MaxAttempts: 0` and `BackoffRate: 2.0` before transitioning.
- **C.** Write a `while` loop with `time.sleep()` inside the Lambda function to handle exponential backoff retries.
- **D.** Configure `Catch` before `Retry` in the Task state so `NotifyOperations` runs immediately on the first error.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

**Step Functions Error Handling (ASL)**:
- **`Retry`**: `ErrorEquals`, `IntervalSeconds`, `MaxAttempts` (mặc định 3), `BackoffRate` (mặc định 2.0).
- **`Catch`**: Chuyển sang trạng thái fallback (`Next`) khi `Retry` thất bại hoàn toàn.
- Ưu điểm: Thời gian chờ giữa các lần retry trên Step Functions **không tốn tiền chạy Lambda**.

- **A (Đúng):** Đúng! Trong Amazon States Language (ASL), **`Retry`** tự động thử lại theo cấp số nhân (`BackoffRate: 2.0`, `IntervalSeconds: 2`, `MaxAttempts: 4`), và **`Catch`** chỉ chạy sau khi `Retry` đã hết số lần thử để chuyển luồng sang `NotifyOperations`.
- **B:** Sai vì `MaxAttempts: 0` tắt hoàn toàn việc retry.
- **C:** Sai vì giữ Lambda ngủ chờ `sleep()` sẽ tốn tiền Compute Duration của Lambda và dễ chạm timeout.
- **D:** Sai vì Step Functions luôn đánh giá `Retry` trước khi kích hoạt `Catch` (nếu không có `Retry` khớp hoặc đã hết `MaxAttempts`).

</details>

### Câu 3 `medium`

A company builds a serverless order-processing pipeline using AWS Step Functions. One state needs to execute three independent checks (`FraudCheck`, `InventoryCheck`, `CreditCheck`) simultaneously and wait until ALL three checks complete before proceeding to `ConfirmOrder`. Which Step Functions state type should be used?

- **A.** `Choice` branching state
- **B.** `Map` state
- **C.** `Pass` state
- **D.** `Parallel` state

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Phân biệt các State chính trong **AWS Step Functions**:
- **`Parallel`**: Chạy nhiều nhánh **logic khác nhau** đồng thời.
- **`Map`**: Chạy **cùng 1 logic** song song cho từng phần tử trong một **Array** (Standard Map hoặc Distributed Map cho hàng triệu file S3).
- **`Choice`**: Rẽ nhánh điều kiện.
- **`Wait` / `Pass` / `Task` / `Succeed` / `Fail`**.

- **A:** Sai vì `Choice` state dùng để rẽ nhánh điều kiện `if/else` (chỉ chọn 1 nhánh).
- **B:** Sai vì **`Map`** state dùng để chạy **cùng một tập bước lặp đi lặp lại** cho từng phần tử trong một mảng JSON đầu vào (ví dụ xử lý từng item trong danh sách đơn hàng).
- **C:** Sai vì `Pass` state chỉ truyền/biến đổi dữ liệu đầu vào sang đầu ra mà không gọi tác vụ song song.
- **D (Đúng):** Đúng! **`Parallel`** state chạy đồng thời nhiều nhánh (branches) khác nhau và chỉ chuyển sang bước tiếp theo khi tất cả các nhánh đều hoàn thành.

</details>

### Câu 4 `medium`

A developer builds an IoT data ingestion workflow that receives 50,000 short-lived micro-events per second. Each execution takes under 2 seconds and needs to orchestrate 3 quick steps at the lowest possible cost. Which AWS Step Functions workflow type should be used?

- **A.** Standard Workflows
- **B.** Express Workflows
- **C.** Nested Standard Workflows
- **D.** Standard Workflows with Wait states

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Gặp bài toán **high-volume, short-duration (< 5 phút), IoT/streaming micro-events, tối ưu chi phí** -> **Step Functions Express Workflows**.

- **A:** Sai vì Standard Workflows tính phí theo từng state transition, sẽ cực kỳ đắt với 50,000 events/giây.
- **B (Đúng):** Đúng! **Express Workflows** tối ưu cho thông lượng cực cao (>100,000/s), thời gian chạy tối đa 5 phút và tính phí theo số lượng + thời lượng thực thi (rẻ hơn rất nhiều so với tính theo state transition của Standard).
- **C:** Sai, không giải quyết bài toán chi phí micro-events.
- **D:** Sai, vẫn đắt và không cần chạy dài ngày.

</details>

### Câu 5 `medium`

A company orchestrates a high-volume IoT data ingestion workflow using AWS Step Functions. The workflow runs 50,000 times per second, each execution completes in less than 10 seconds, and the workflow does not need to wait for human callbacks. Which Step Functions workflow type is MOST cost-effective for this workload?

- **A.** Amazon Simple Workflow Service (SWF)
- **B.** AWS Glue Workflow
- **C.** Express Workflow
- **D.** Standard Workflow

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

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

[← Bộ trước](09-dva-messaging-sqs-sns-kinesis.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Bộ tiếp theo →](11-dva-cognito-identity.md)
