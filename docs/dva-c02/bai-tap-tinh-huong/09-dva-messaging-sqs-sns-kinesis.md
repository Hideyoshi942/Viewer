# Bài tập tình huống — Chủ đề 9: Tích hợp & Messaging — SQS, SNS, Kinesis & EventBridge

> SQS Standard vs FIFO, Visibility Timeout, DLQ, SNS Fanout, Kinesis Data Streams Sharding/Resharding & EventBridge.
> **Số câu hỏi:** 24 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án & Giải thích chi tiết**.

---

### Câu 1 `medium`

An AWS Lambda function reads records from an Amazon Kinesis Data Streams shard using an event source mapping. Occasionally, a malformed JSON record causes the Lambda function to throw an unhandled exception, which blocks all subsequent records in the same shard from being processed until the record expires after 24 hours. How should the developer configure the event source mapping to isolate the poison-pill record and keep processing valid records?

- **A.** Configure an Amazon SQS Dead-Letter Queue (DLQ) directly on the Lambda function's asynchronous invocation settings for failed stream batches.
- **B.** Increase the Kinesis Data Stream shard retention period from 24 hours to 7 days so failed records are automatically skipped after expiration.
- **C.** Set `BatchSize` to the maximum of 10,000 records and `ParallelizationFactor` to 1 to process all shard records in a single batch.
- **D.** Enable `BisectBatchOnFunctionError`, set `MaximumRetryAttempts` to 2, and configure an `OnFailure` destination to an Amazon SQS queue.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Với **Kinesis / DynamoDB Streams Event Source Mapping** trên Lambda, khi gặp **poison-pill record**, giải pháp chuẩn là:
- Bật **`BisectBatchOnFunctionError`**: Chia đôi batch cho đến khi tìm ra đúng bản ghi lỗi.
- Đặt **`MaximumRetryAttempts`** hoặc **`MaximumRecordAgeInSeconds`**: Tránh retry vô hạn.
- Cấu hình **`OnFailure` Destination** (SQS hoặc SNS): Lưu lại thông tin shard/sequence number của bản ghi lỗi để điều tra sau.

- **A:** Sai vì Lambda Event Source Mapping cho Kinesis/DynamoDB Streams gọi hàm theo cơ chế đồng bộ (synchronous) theo batch, không sử dụng cấu hình DLQ của asynchronous invocation (thay vào đó phải dùng `DestinationConfig.OnFailure` trên Event Source Mapping).
- **B:** Sai vì tăng thời gian lưu trữ trên Kinesis chỉ làm bản ghi lỗi nằm chờ lâu hơn chứ không giúp bỏ qua hay cô lập bản ghi lỗi.
- **C:** Sai vì tăng `BatchSize` và đặt `ParallelizationFactor` về 1 càng làm nhiều bản ghi hợp lệ bị kẹt cùng bản ghi lỗi.
- **D (Đúng):** Đúng! `BisectBatchOnFunctionError` tự động chia đôi batch bị lỗi để cô lập bản ghi hỏng (poison-pill), kết hợp `MaximumRetryAttempts` giới hạn số lần thử lại và `OnFailure` gửi metadata của bản ghi lỗi sang SQS/SNS để luồng dữ liệu không bị tắc nghẽn.

</details>

### Câu 2 `medium` *(Chọn nhiều đáp án)*

An e-commerce platform uses Amazon EventBridge to route order lifecycle events (`OrderCreated`, `OrderPaid`, `OrderShipped`) to multiple downstream AWS Lambda microservices. The team wants to ensure that: (1) the shipping Lambda only receives `OrderShipped` events where `country` is `US` or `CA`, and (2) if the shipping Lambda is temporarily unavailable, failed events are retained for reprocessing later. Which TWO configurations meet these requirements? (Choose two.)

- **A.** Enable Amazon EventBridge Schema Discovery on the default event bus to automatically filter out non-US and non-CA order events.
- **B.** Configure an Amazon S3 bucket directly as the EventBridge rule target Dead-Letter Queue (DLQ) for failed Lambda invocations.
- **C.** Configure a Dead-Letter Queue (Amazon SQS) on the EventBridge rule target for the shipping Lambda.
- **D.** Create an EventBridge rule with an event pattern matching `detail-type: ["OrderShipped"]` and `detail.country: ["US", "CA"]`.
- **E.** Use an Amazon SNS topic with a `FilterPolicyScope` set to `MessageBody` instead of EventBridge rules for complex JSON matching.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**, **D**

Trong **Amazon EventBridge**:
- **Event Pattern** lọc theo cấu trúc JSON của event (`source`, `detail-type`, `detail.*`).
- **Target DLQ**: Gắn **Amazon SQS** vào target để lưu các event không thể deliver sau khi hết số lần retry (mặc định EventBridge retry tối đa 24h / 185 lần).
- Ngoài ra, EventBridge còn có **Archive & Replay** để phát lại sự kiện lịch sử khi cần.

- **A:** Sai vì Schema Registry/Discovery chỉ dùng để phát hiện và sinh code model cho cấu trúc event, không có tác dụng lọc route event.
- **B:** Sai vì DLQ của EventBridge target chỉ hỗ trợ Amazon SQS, không hỗ trợ S3.
- **C (Đúng):** Đúng! EventBridge hỗ trợ gắn SQS Dead-Letter Queue (DLQ) trực tiếp trên target của Rule (và cấu hình RetryPolicy) để giữ lại các sự kiện gửi thất bại.
- **D (Đúng):** Đúng! EventBridge Event Pattern cho phép lọc chính xác theo trường `detail-type` và các thuộc tính lồng nhau trong `detail` trước khi kích hoạt target.
- **E:** Sai vì đề bài yêu cầu cấu hình trên hệ thống EventBridge hiện tại.

</details>

### Câu 3 `medium`

An AWS Lambda function is invoked asynchronously by Amazon S3 events to process uploaded images. The team wants to automatically route the full event payload and execution result to an Amazon EventBridge event bus when the function succeeds, and to an Amazon SQS queue when the function fails after retries. Which feature should the developer configure?

- **A.** Use an Event Source Mapping with `BisectBatchOnFunctionError` enabled to split failed asynchronous payloads into EventBridge and SQS.
- **B.** Configure a Dead-Letter Queue (DLQ) on the Lambda function for both `OnSuccess` and `OnFailure` asynchronous event routing.
- **C.** Set `MaximumRetryAttempts` to 0 on the event invoke config and enable AWS X-Ray Active Tracing to route payloads to EventBridge.
- **D.** Configure AWS Lambda Destinations with `OnSuccess` pointing to EventBridge and `OnFailure` pointing to the SQS queue.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

So sánh **Lambda Destinations** vs **DLQ** (Asynchronous Invocation):
- **Lambda Destinations** (khuyến nghị): Hỗ trợ cả **`OnSuccess`** và **`OnFailure`**, đích đến gồm **SQS, SNS, Lambda, EventBridge**, gửi kèm toàn bộ Request + Response + Error Stack.
- **DLQ**: Chỉ hỗ trợ khi lỗi, chỉ gửi tới SQS/SNS và chỉ chứa payload gốc.

- **A:** Sai vì `BisectBatchOnFunctionError` chỉ dành cho Event Source Mapping từ Kinesis/DynamoDB Streams, không áp dụng cho lời gọi bất đồng bộ từ S3.
- **B:** Sai vì Lambda DLQ truyền thống chỉ xử lý khi thất bại (không có `OnSuccess`), chỉ hỗ trợ SQS/SNS (không hỗ trợ EventBridge), và không đính kèm thông tin chi tiết về lỗi/response.
- **C:** Sai vì tắt retry và bật X-Ray không định tuyến kết quả thành công/thất bại sang EventBridge hoặc SQS.
- **D (Đúng):** Đúng! **Lambda Destinations** (cho Asynchronous Invocation) hỗ trợ định tuyến cả `OnSuccess` và `OnFailure` kèm đầy đủ context (request payload, response, stack trace) tới SQS, SNS, Lambda, hoặc EventBridge — vượt trội hơn DLQ truyền thống vốn chỉ gửi payload khi lỗi.

</details>

### Câu 4 `medium`

An Amazon EC2 worker application polls an Amazon SQS standard queue for background video transcoding jobs. Currently, the worker makes thousands of empty `ReceiveMessage` calls per hour (incurring high cost), and occasionally a 5-minute transcoding job gets processed twice by two different workers because the default Visibility Timeout is 30 seconds. Which two changes fix BOTH issues?

- **A.** Set `ReceiveMessageWaitTimeSeconds` to 20 (Long Polling) and increase Visibility Timeout (or call `ChangeMessageVisibility`) to exceed 5 minutes.
- **B.** Switch to an Amazon SQS FIFO queue with `VisibilityTimeout` kept at 30 seconds so duplicate deliveries are prevented automatically.
- **C.** Set `ReceiveMessageWaitTimeSeconds` to 0 to enable Short Polling and set `DelaySeconds` to 300 on the queue to extend consumer processing time.
- **D.** Set `MessageRetentionPeriod` to 60 seconds on the SQS queue so unprocessed messages expire before being polled again.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Hai thông số cốt lõi của **Amazon SQS**:
- **Long Polling (`ReceiveMessageWaitTimeSeconds` = 1..20s)**: Chờ có message mới trả về, giảm **empty receives** và giảm chi phí.
- **Visibility Timeout** (mặc định 30s, tối đa 12h): Khoảng thời gian message bị ẩn khỏi các consumer khác sau khi được đọc; phải lớn hơn thời gian xử lý + gọi `DeleteMessage` (hoặc gia hạn bằng `ChangeMessageVisibility`).

- **A (Đúng):** Đúng! **Long Polling** (`WaitTimeSeconds = 20`) giảm số lần gọi rỗng và tiết kiệm chi phí. Tăng **Visibility Timeout** lên > 5 phút (hoặc gọi `ChangeMessageVisibility` gia hạn định kỳ) ngăn worker khác nhìn thấy và xử lý trùng message trước khi job xong.
- **B:** Sai vì giữ `VisibilityTimeout = 30s` vẫn khiến message hiện lại sau 30 giây nếu job chạy mất 5 phút chưa kịp xóa message.
- **C:** Sai vì `WaitTimeSeconds = 0` là Short Polling (vẫn tốn request rỗng), còn `DelaySeconds = 300` chỉ làm trễ lúc message mới vào queue chứ không ngăn xử lý trùng sau khi đã được nhận.
- **D:** Sai vì `MessageRetentionPeriod` là thời gian tối đa message tồn tại trong queue trước khi bị xóa vĩnh viễn.

</details>

### Câu 5 `medium`

An order service publishes JSON messages to an Amazon SNS topic. Three Amazon SQS queues subscribe to this SNS topic: `FulfillmentQueue`, `BillingQueue`, and `FraudQueue`. The developer wants `FraudQueue` to ONLY receive messages where the `orderAmount` is greater than `1000`, without writing custom filtering code inside the `FraudQueue` consumer. How should this be configured?

- **A.** Use `MessageDeduplicationId` on the Amazon SNS `Publish` API call to filter out transactions below the fraud threshold.
- **B.** Configure an Amazon SQS Queue Policy on `FraudQueue` to automatically reject and drop incoming SNS messages with a transaction amount under 1000.
- **C.** Configure an SNS Subscription Filter Policy on `FraudQueue` (using `FilterPolicyScope: MessageBody` for JSON payloads or `MessageAttributes`).
- **D.** Enable Raw Message Delivery on the `FraudQueue` SNS subscription so SQS automatically discards non-matching JSON events.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

**Amazon SNS Message Filtering**:
- Gắn **Filter Policy** lên từng **Subscription** (mặc định nếu không gắn Filter Policy, subscriber nhận 100% tin nhắn).
- Hỗ trợ lọc theo **`MessageAttributes`** (mặc định) hoặc **`MessageBody`** (`FilterPolicyScope: MessageBody`).

- **A:** Sai vì `MessageDeduplicationId` chỉ dùng cho SNS FIFO để chống trùng lặp trong 5 phút.
- **B:** Sai vì SQS Queue Policy chỉ kiểm soát quyền IAM gửi/nhận tin nhắn, không đọc và lọc nội dung trường dữ liệu `orderAmount`.
- **C (Đúng):** Đúng! **SNS Subscription Filter Policy** cho phép lọc tin nhắn ngay tại tầng SNS trước khi đẩy xuống SQS subscriber, hỗ trợ toán tử số học (`numeric: [">", 1000]`) trên `MessageAttributes` hoặc trực tiếp trên `MessageBody`.
- **D:** Sai vì Raw Message Delivery chỉ bỏ lớp vỏ JSON metadata của SNS, không có chức năng lọc tin nhắn.

</details>

### Câu 6 `hard` *(Chọn nhiều đáp án)*

A telemetry system ingests clickstream events into an Amazon Kinesis Data Stream. Three independent consumer applications need to read from the same shard concurrently, and each consumer requires its own dedicated 2 MB/s read throughput with minimal delivery latency (~70 ms). Meanwhile, the producer needs to send batches of records in a single API call to maximize ingestion throughput. Which TWO actions meet these requirements? (Choose two.)

- **A.** Set the exact same static `PartitionKey` string for every clickstream record to maximize shard throughput.
- **B.** Have all three consumers share the standard `GetRecords` polling API on the same shard.
- **C.** Register each of the three consumers to use Kinesis Enhanced Fan-Out (`RegisterStreamConsumer` / `SubscribeToShard`).
- **D.** Have the producer use the `PutRecords` API (or Kinesis Producer Library) instead of single `PutRecord` calls.
- **E.** Replace Kinesis Data Streams with an Amazon SQS Standard queue to preserve strict chronological ordering per `PartitionKey`.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**, **D**

Thông số **Amazon Kinesis Data Streams** cần nhớ:
- **Ghi (Write)**: `1 MB/s` hoặc `1,000 records/s` mỗi shard. Dùng **`PutRecords`** (tối đa 500 records/call) để tăng hiệu năng.
- **Đọc chuẩn (Standard)**: `2 MB/s` mỗi shard **chia sẻ** cho mọi consumer (`GetRecords`).
- **Enhanced Fan-Out**: **`2 MB/s` riêng biệt** cho mỗi consumer trên mỗi shard, dùng HTTP/2 push (`SubscribeToShard`), độ trễ ~70 ms.

- **A:** Sai vì dùng cùng 1 `PartitionKey` sẽ dồn 100% dữ liệu vào 1 shard duy nhất, gây hot shard (giới hạn 1 MB/s hoặc 1,000 records/s mỗi shard).
- **B:** Sai vì `GetRecords` chia sẻ chung hạn mức 2 MB/s trên mỗi shard giữa tất cả các consumer (3 consumer chia nhau chỉ còn ~0.66 MB/s mỗi bên) và dễ bị `ProvisionedThroughputExceededException`.
- **C (Đúng):** Đúng! Mặc định tất cả consumer chia sẻ chung giới hạn **2 MB/s/shard** (và ~200 ms độ trễ polling). **Enhanced Fan-Out** (HTTP/2 push via `SubscribeToShard`) cấp riêng **2 MB/s/shard cho mỗi consumer** và giảm độ trễ xuống ~70 ms.
- **D (Đúng):** Đúng! `PutRecords` cho phép gửi tối đa 500 records (hoặc 5 MB) trong một lần gọi API, tăng thông lượng nạp dữ liệu đáng kể so với `PutRecord` đơn lẻ.
- **E:** Sai vì SQS Standard không đảm bảo thứ tự và xóa message sau khi 1 consumer xử lý (không hỗ trợ nhiều consumer đọc lại cùng stream độc lập).

</details>

### Câu 7 `medium`

An AWS Lambda function is invoked asynchronously by Amazon EventBridge. Downstream processing occasionally fails due to transient third-party API outages. By default, Lambda retries asynchronous invocations twice (3 attempts total). The team wants failed events to be discarded if they are older than 1 hour, and only retried once. Which configuration should be updated?

- **A.** Set `VisibilityTimeout` to `3600` seconds directly on the Lambda function configuration for async events.
- **B.** Update the Lambda function's Asynchronous Invocation configuration: set `MaximumEventAgeInSeconds` to `3600` and `MaximumRetryAttempts` to `1`.
- **C.** Configure `BisectBatchOnFunctionError: true` on the Amazon EventBridge rule target to retry failed events.
- **D.** Set the Lambda function's synchronous execution `Timeout` property to `3600` seconds to extend asynchronous retry duration and maximum event age.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

**Lambda Asynchronous Invocation Config**:
- `MaximumRetryAttempts`: `0`, `1`, hoặc `2` (mặc định `2`).
- `MaximumEventAgeInSeconds`: `60`s – `21,600`s / 6 giờ (mặc định 6 giờ).
- Khi hết retry hoặc quá tuổi -> đẩy sang **DLQ** hoặc **OnFailure Destination**.

- **A:** Sai vì `VisibilityTimeout` là thuộc tính của Amazon SQS, không phải của AWS Lambda.
- **B (Đúng):** Đúng! Cấu hình Asynchronous Invocation của Lambda (`put-function-event-invoke-config`) cho phép đặt `MaximumEventAgeInSeconds` (60 đến 21,600 giây — mặc định 6 giờ) và `MaximumRetryAttempts` (0 đến 2 — mặc định 2).
- **C:** Sai vì `BisectBatchOnFunctionError` chỉ áp dụng cho Event Source Mapping của Kinesis/DynamoDB Streams.
- **D:** Sai vì `Timeout` tối đa của Lambda là 900 giây (15 phút) và đó là thời gian chạy tối đa của 1 lần gọi, không phải tuổi tối đa của event trong hàng đợi bất đồng bộ.

</details>

### Câu 8 `medium`

An AWS Lambda function is triggered by an Amazon SQS standard queue (`BatchSize: 10`). Occasionally, 1 out of the 10 messages in a batch is invalid and throws an exception, causing the entire batch of 10 messages to become visible again and be reprocessed repeatedly until they all move to the DLQ. How can the developer ensure ONLY the single failed message is retried while the 9 valid messages are deleted from the queue?

- **A.** Disable the SQS Dead-Letter Queue so failed messages remain in the main queue indefinitely without being reprocessed by Lambda.
- **B.** Set `BatchSize` to `100` on the SQS Event Source Mapping to reduce the frequency of batch failures.
- **C.** Enable `ReportBatchItemFailures` on the SQS Event Source Mapping and return failed IDs in `batchItemFailures`.
- **D.** Enable `BisectBatchOnFunctionError` on the SQS Event Source Mapping to split failing batches in half.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

**SQS + Lambda Partial Batch Response**:
- Bật `FunctionResponseTypes: ["ReportBatchItemFailures"]` trên Event Source Mapping.
- Lambda bắt lỗi từng message trong vòng lặp và trả về `{ "batchItemFailures": [ { "itemIdentifier": msg.messageId } ] }` thay vì ném exception làm hỏng cả batch.

- **A:** Sai vì tắt DLQ không ngăn được việc retry cả batch 10 messages.
- **B:** Sai vì tăng `BatchSize` càng làm nhiều message hợp lệ bị vạ lây khi 1 message lỗi.
- **C (Đúng):** Đúng! Bật **`ReportBatchItemFailures`** (`FunctionResponseTypes: ["ReportBatchItemFailures"]`) cho phép Lambda trả về danh sách `itemIdentifier` (`messageId`) của các tin nhắn bị lỗi; SQS sẽ chỉ giữ lại các tin nhắn lỗi đó để retry và tự động xóa 9 tin nhắn thành công.
- **D:** Sai vì `BisectBatchOnFunctionError` chỉ dành cho Kinesis/DynamoDB Streams, **không** hỗ trợ SQS.

</details>

### Câu 9 `medium`

A developer uses an AWS Lambda function to process items from an Amazon SQS FIFO queue (`BatchSize: 10`). Suddenly, one poison-pill message fails repeatedly, and the developer notices that `ApproximateAgeOfOldestMessage` keeps climbing because the entire queue appears stalled for that `MessageGroupId`. Where should the developer configure a Dead-Letter Queue (DLQ) so failed messages are isolated after 3 receives?

- **A.** Configure a Redrive Policy (`maxReceiveCount: 3`) on the SQS FIFO source queue pointing to a FIFO DLQ.
- **B.** Configure an `OnFailure` Lambda Destination directly on the SQS Event Source Mapping trigger.
- **C.** Set `MessageRetentionPeriod` to 60 seconds on the SQS FIFO queue so failed messages expire quickly.
- **D.** Configure an SQS Standard DLQ on the Lambda function's Asynchronous Invocation error handling settings for failed FIFO message batches.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Quy tắc **SQS Dead-Letter Queue (DLQ)**:
- **Cùng loại queue**: Standard -> Standard DLQ; **FIFO -> FIFO DLQ**.
- Cấu hình **Redrive Policy** (`maxReceiveCount`) trên source queue.
- Dùng **DLQ Redrive** để đẩy ngược tin nhắn từ DLQ về source queue sau khi đã sửa bug.

- **A (Đúng):** Đúng! Với SQS + Lambda (Event Source Mapping), DLQ phải cấu hình trên chính **SQS source queue** thông qua **Redrive Policy** (`maxReceiveCount: 3`), và quy tắc bắt buộc của SQS là **FIFO queue chỉ được dùng FIFO DLQ** (Standard chỉ dùng Standard DLQ).
- **B:** Sai vì `OnFailure` Destination trên Event Source Mapping chỉ hỗ trợ Kinesis/DynamoDB Streams (và Kafka), không dùng cho SQS (SQS dùng Redrive Policy).
- **C:** Sai vì giảm `MessageRetentionPeriod` sẽ làm mất vĩnh viễn tin nhắn lỗi thay vì chuyển vào DLQ để điều tra.
- **D:** Sai vì 2 lý do: (1) SQS Event Source Mapping gọi Lambda đồng bộ (không dùng Async DLQ của Lambda), và (2) FIFO queue không thể trỏ DLQ sang Standard queue.

</details>

### Câu 10 `medium`

A developer wants to schedule an AWS Lambda function to run automatically every weekday (Monday through Friday) at 08:30 UTC, and also wants to trigger a one-time maintenance Lambda exactly 2 hours after a customer signs up without managing cron jobs or DynamoDB polling. Which service provides BOTH recurring cron schedules and millions of dynamic one-time schedules?

- **A.** Amazon SQS with `DelaySeconds` set to 7,200.
- **B.** Amazon EventBridge Scheduler
- **C.** AWS Lambda Reserved Concurrency schedules.
- **D.** Amazon SNS FIFO `DeliveryDelay`.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

**Amazon EventBridge Scheduler**:
- Hỗ trợ **Cron / Rate** (kèm Timezone & Daylight Saving Time) và **One-time schedules (`at(yyyy-mm-ddThh:mm:ss)`)** quy mô hàng triệu lịch.
- Nhớ giới hạn SQS `DelaySeconds`: tối đa **15 phút (900 giây)**.

- **A:** Sai vì SQS `DelaySeconds` tối đa chỉ là **900 giây (15 phút)**, không thể trễ 2 giờ (7,200 giây).
- **B (Đúng):** Đúng! **Amazon EventBridge Scheduler** hỗ trợ cả lịch định kỳ (`cron(...)`, `rate(...)` kèm múi giờ) lẫn hàng triệu lịch **chạy một lần (`at(...)`)** tạo động theo từng user/sự kiện.
- **C:** Sai vì Reserved Concurrency không phải dịch vụ lập lịch.
- **D:** Sai vì SNS không có `DeliveryDelay` 2 giờ và không hỗ trợ cron biểu thức thứ Hai–thứ Sáu.

</details>

### Câu 11 `medium`

A Lambda function processes records from an Amazon Kinesis Data Stream with 4 shards. During peak load, each shard receives 800 records per second, and the Lambda function takes 2 seconds per batch of 100 records, causing the `IteratorAge` metric to grow continuously. How can the developer increase Lambda processing concurrency per shard without adding more shards to the Kinesis stream?

- **A.** Reduce `BatchSize` to `1` on the Kinesis Event Source Mapping so each record is processed in its own invocation.
- **B.** Set `ReservedConcurrency` to `100` on the Lambda function so it can scale up to 100 concurrent invocations per shard.
- **C.** Increase the Parallelization Factor (`ParallelizationFactor`) on the Kinesis Event Source Mapping up to `10`.
- **D.** Disable `BisectBatchOnFunctionError` on the Kinesis Event Source Mapping to prevent batch splitting overhead.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Tối ưu **Kinesis / DynamoDB Streams + Lambda** khi `IteratorAge` tăng cao:
1. Tăng **`ParallelizationFactor`** (1..10) để chạy nhiều Lambda song song trên 1 shard.
2. Tăng **`BatchSize`** / **`MaximumBatchingWindowInSeconds`** để xử lý nhiều record hơn mỗi lần gọi.
3. Tăng số **Shards** của Kinesis hoặc tăng Memory/CPU của Lambda.

- **A:** Sai vì giảm `BatchSize` xuống 1 sẽ làm tăng số lần gọi Lambda và overhead mạng, khiến `IteratorAge` tệ hơn.
- **B:** Sai vì nếu `ParallelizationFactor = 1` thì với 4 shards, tối đa chỉ có 4 Lambda chạy đồng thời bất kể `ReservedConcurrency` cao bao nhiêu.
- **C (Đúng):** Đúng! Mặc định Lambda chạy 1 invocation đồng thời cho mỗi shard. Tăng **`ParallelizationFactor`** (từ 1 lên tối đa **10**) cho phép chạy tới 10 Lambda invocations song song trên **cùng 1 shard** (vẫn giữ đúng thứ tự theo `PartitionKey`).
- **D:** Sai vì tắt tùy chọn này không tăng số luồng xử lý song song trên mỗi shard.

</details>

### Câu 12 `medium`

A Lambda function reads messages from an Amazon SQS queue and writes records to an Amazon RDS database. If the Lambda function fails to connect to RDS, the team wants to ensure that only messages matching `eventType == "PAYMENT"` even trigger the Lambda function in the first place, so non-payment messages in the same queue are ignored without wasting Lambda invocations. Which feature allows Lambda to filter SQS messages BEFORE invoking the function?

- **A.** Configure Lambda Event Source Mapping Event Filtering (`FilterCriteria`) on the SQS trigger matching `body.eventType`.
- **B.** Enable `ReportBatchItemFailures` on the SQS trigger so the Lambda function can reject non-matching messages.
- **C.** Use an Amazon SQS Queue Policy with a `StringEquals` condition on `body.eventType` to block unwanted messages.
- **D.** Add an `if` check at the top of the Lambda handler function to return early for non-matching `eventType` messages without event filtering.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

**Lambda Event Filtering (`FilterCriteria`)**:
- Hỗ trợ **SQS, Kinesis, DynamoDB Streams, Kafka**.
- Lọc ngay tại tầng Event Source Mapping trước khi gọi Lambda -> **tiết kiệm chi phí & giảm tải Lambda**.

- **A (Đúng):** Đúng! **Lambda Event Filtering (`FilterCriteria`)** trên Event Source Mapping (hỗ trợ SQS, Kinesis, DynamoDB Streams) cho phép lọc bỏ các message không khớp điều kiện **trước khi** khởi chạy Lambda, giúp tiết kiệm chi phí invocation (các message không khớp sẽ tự động bị xóa khỏi SQS!).
- **B:** Sai vì `ReportBatchItemFailures` dùng để báo lỗi từng phần sau khi Lambda đã chạy, không phải để lọc trước khi gọi Lambda.
- **C:** Sai vì SQS Queue Policy không đọc được nội dung JSON bên trong body của tin nhắn.
- **D:** Sai vì kiểm tra trong code Lambda vẫn tốn 1 lần invocation và thời gian chạy Lambda.

</details>

### Câu 13 `medium`

A company publishes customer profile updates to an Amazon SNS topic. One subscriber is an AWS Lambda function, and another is an HTTP/S webhook endpoint on a partner server. During a partner outage, HTTP deliveries fail and are retried, while the company wants a reliable way to capture any un-delivered messages after all retries fail without losing them. What should be configured?

- **A.** Configure an Amazon S3 bucket as the SNS Topic's Dead-Letter Queue (DLQ) to store failed webhook payloads.
- **B.** Attach an Amazon SQS Dead-Letter Queue (DLQ) to the SNS Subscription for the partner HTTP/S endpoint.
- **C.** Enable SNS Message Retention for 14 days on the SNS Standard Topic so undelivered webhooks are stored automatically.
- **D.** Switch the partner webhook integration from an SNS Standard topic to an SNS FIFO topic with deduplication enabled.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Lưu ý về **Amazon SNS**:
- **SNS Standard** hỗ trợ nhiều giao thức (SQS, Lambda, HTTP/S, Email, SMS) và cho phép gắn **SQS DLQ** lên từng Subscription.
- **SNS FIFO** chỉ hỗ trợ subscriber là **SQS FIFO** (không hỗ trợ HTTP/S hay Lambda trực tiếp).

- **A:** Sai vì SNS Subscription DLQ chỉ hỗ trợ Amazon SQS, không hỗ trợ S3.
- **B (Đúng):** Đúng! Amazon SNS hỗ trợ gắn **SQS Dead-Letter Queue (DLQ)** trực tiếp trên từng **Subscription** để lưu lại các tin nhắn không thể giao tới subscriber sau khi hết chính sách retry.
- **C:** Sai vì SNS Standard Topic không lưu trữ tin nhắn dài ngày như SQS; tin nhắn bị mất nếu không có DLQ khi hết retry.
- **D:** Sai vì SNS FIFO chỉ hỗ trợ subscriber là SQS FIFO, không hỗ trợ HTTP/S webhook hay Lambda trực tiếp.

</details>

### Câu 14 `medium` *(Chọn nhiều đáp án)*

A developer is designing an event-driven architecture where an Order Service emits events that must be consumed by multiple downstream services (`Inventory`, `Analytics`, `Notifications`), and the team needs content-based routing, schema discovery, and the ability to replay past events from the last 7 days if a downstream bug occurs. Which TWO Amazon EventBridge features should be enabled? (Choose two.)

- **A.** Enable EventBridge `ConsistentRead` on the custom event bus to guarantee strong schema validation and replay.
- **B.** Switch to Amazon SQS Standard because Amazon EventBridge cannot route events to multiple downstream targets.
- **C.** Configure EventBridge Event Archive (with a 7-day retention) on the custom event bus and use Event Replay when recovery is needed.
- **D.** Use EventBridge `MessageGroupId` on every `PutEvents` call to guarantee global strict ordering across all buses.
- **E.** Enable EventBridge Schema Registry / Discovery on the event bus so developers can download strongly-typed code bindings for their IDEs.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**, **E**

Tính năng nâng cao của **Amazon EventBridge**:
- **Archive & Replay**: Lưu trữ và phát lại sự kiện lịch sử.
- **Schema Registry & Discovery**: Tự động suy luận schema và sinh code classes.
- **Input Transformer**: Chỉnh sửa payload trước khi gửi tới target.

- **A:** Sai vì `ConsistentRead` là tham số của DynamoDB.
- **B:** Sai vì EventBridge có thể route một event tới nhiều targets (tối đa 5 targets/rule và nhiều rules trên 1 bus).
- **C (Đúng):** Đúng! **EventBridge Archive & Replay** cho phép lưu trữ sự kiện trong khoảng thời gian cấu hình (ví dụ 7 ngày) và phát lại (Replay) một khoảng thời gian cụ thể tới event bus hoặc rule đích khi cần khôi phục.
- **D:** Sai vì `MessageGroupId` là thuộc tính của SQS FIFO / SNS FIFO, không phải của EventBridge.
- **E (Đúng):** Đúng! **Schema Discovery** tự động phân tích cấu trúc các event đi qua bus và lưu vào Schema Registry để sinh code bindings (TypeScript, Java, Python, Go).

</details>

### Câu 15 `medium`

An Amazon ECS service running on AWS Fargate needs to scale out automatically from 2 tasks to 20 tasks whenever the average CPU utilization exceeds 70%, AND scale based on the number of messages in an Amazon SQS queue (`ApproximateNumberOfMessagesVisible`). Which ECS Auto Scaling feature should the developer configure?

- **A.** Use ECS Capacity Providers with `ManagedScaling` on EC2 instances to scale the Fargate task count based on SQS depth.
- **B.** Configure an EC2 Auto Scaling Group Scaling Policy directly on the AWS Fargate cluster to add underlying worker nodes when SQS depth increases.
- **C.** Configure ECS Service Auto Scaling with a Target Tracking policy for 70% CPU and a Step Scaling policy on an SQS backlog alarm.
- **D.** Set the ECS service `DesiredCount` to 20 permanently to handle peak SQS backlog bursts without scaling policies.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Phân biệt 2 tầng Auto Scaling trong **Amazon ECS**:
1. **ECS Service Auto Scaling (Application Auto Scaling)**: Scale **số lượng Tasks** (Target Tracking, Step Scaling, Scheduled Scaling).
2. **ECS Cluster Auto Scaling (Capacity Providers)**: Scale **số lượng EC2 Container Instances** (chỉ dùng cho EC2 launch type).

- **A:** Sai vì ECS Capacity Providers EC2 chỉ scale số lượng máy chủ EC2 bên dưới, không scale số lượng Fargate tasks theo CPU/SQS.
- **B:** Sai vì **AWS Fargate** là serverless compute không quản lý EC2 Auto Scaling Group.
- **C (Đúng):** Đúng! **ECS Service Auto Scaling** sử dụng **Application Auto Scaling** hỗ trợ cả **Target Tracking** (theo CPU/Memory/ALB RequestCountPerTarget) và **Step Scaling** (theo CloudWatch Alarm từ SQS `ApproximateNumberOfMessagesVisible`).
- **D:** Sai vì chạy cố định 20 tasks suốt ngày đêm gây lãng phí chi phí.

</details>

### Câu 16 `medium`

A company wants to restrict access to an Amazon SQS queue so that ONLY an AWS Lambda function in Account A (`111122223333`) and an Amazon SNS topic (`arn:aws:sns:us-east-1:111122223333:OrdersTopic`) can send messages (`sqs:SendMessage`) to the queue. Where should this access control be configured?

- **A.** Configure a VPC Security Group on the Amazon SQS queue allowing inbound HTTPS traffic from the SNS topic.
- **B.** Attach an IAM Identity Policy directly to the Amazon SNS topic granting `sqs:SendMessage` to the target Amazon SQS standard queue.
- **C.** Configure an SQS Queue Policy allowing `sqs:SendMessage` from `sns.amazonaws.com` (with `aws:SourceArn`) and the Lambda role.
- **D.** Enable SQS Long Polling with `ReceiveMessageWaitTimeSeconds` set to 20 seconds so SNS deliveries succeed.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

**Amazon SQS Queue Policy**:
- Là Resource-based Policy cho phép kiểm soát truy cập cross-account hoặc từ dịch vụ AWS khác (**SNS**, **S3**, **EventBridge**) với điều kiện `aws:SourceArn` / `aws:SourceAccount`.

- **A:** Sai vì SQS là dịch vụ managed không gắn Security Group trực tiếp.
- **B:** Sai vì SNS topic không có IAM Identity Policy; để SNS gửi sang SQS phải mở quyền trong **SQS Queue Policy**.
- **C (Đúng):** Đúng! **SQS Queue Policy** là Resource-based Policy gắn trực tiếp lên SQS queue, bắt buộc phải có để cho phép các dịch vụ AWS như **Amazon SNS** hoặc **S3 Event Notifications** (`aws:SourceArn`) gửi tin nhắn vào SQS.
- **D:** Sai vì Long Polling không liên quan đến phân quyền gửi tin nhắn.

</details>

### Câu 17 `medium`

An AWS Lambda function is triggered by an Amazon SQS standard queue. During a downstream database outage, the Lambda function fails on every message, and SQS immediately makes the message visible again (or retries rapidly), causing thousands of failed invocations and filling up the DLQ before the database recovers. How can the developer slow down retry attempts or temporarily stop Lambda from polling the SQS queue without losing messages?

- **A.** Set `BatchSize` to `10,000` on the SQS Event Source Mapping so messages wait longer before processing.
- **B.** Disable the SQS Event Source Mapping (`Enabled: false`) during the outage, and increase the SQS Visibility Timeout.
- **C.** Set `ReservedConcurrency` to `0` on the Lambda function while leaving the SQS Event Source Mapping enabled during the outage.
- **D.** Purge the entire Amazon SQS queue using `sqs:PurgeQueue` until the downstream database recovers.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Bẫy thi **SQS + Lambda khi Downstream sập**:
- **ĐỪNG** đặt `ReservedConcurrency = 0` (vì poller vẫn đọc và đẩy message vào DLQ).
- **HÃY** tạm tắt **`Event Source Mapping` (`Enabled = false`)** để giữ nguyên tin nhắn an toàn trong SQS.

- **A:** Sai vì `BatchSize` tối đa của SQS Standard với Lambda là 10,000 nhưng không ngăn Lambda tiếp tục poll và làm lỗi tin nhắn.
- **B (Đúng):** Đúng! Tắt tạm thời **Event Source Mapping** (`aws lambda update-event-source-mapping --no-enabled`) sẽ dừng Lambda đọc SQS mà **không làm mất tin nhắn** (SQS giữ tin nhắn tối đa 14 ngày). Khi DB phục hồi, bật lại Event Source Mapping để xử lý tiếp.
- **C:** Sai vì nếu để Event Source Mapping bật mà đặt `ReservedConcurrency = 0`, SQS poller vẫn nhận message rồi bị Lambda từ chối (throttle), làm tăng `ReceiveCount` và đẩy hết message sang DLQ!
- **D:** Sai vì `PurgeQueue` sẽ xóa sạch toàn bộ dữ liệu đơn hàng/tin nhắn trong hàng đợi.

</details>

### Câu 18 `medium`

An AWS Lambda function writes high-volume audit events to Amazon Kinesis Data Streams (`PutRecord`). When traffic spikes, `PutRecord` calls occasionally fail with `ProvisionedThroughputExceededException` because the stream has `Provisioned` capacity mode with 2 shards. Which TWO ways can the team resolve this without dropping events?

- **A.** Enable Kinesis Enhanced Fan-Out on the stream to increase producer `PutRecords` write throughput capacity per Kinesis shard.
- **B.** Reduce the Kinesis Data Stream retention period to 24 hours to free up shard write capacity.
- **C.** Use the same static string `"ALL"` as the `PartitionKey` for every record.
- **D.** Switch Kinesis to On-Demand mode (or `UpdateShardCount`), and use `PutRecords` with exponential backoff + jitter.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Xử lý **Kinesis Write Throttling (`ProvisionedThroughputExceededException`)**:
1. Tăng phân tán `PartitionKey` (tránh Hot Shard).
2. Dùng **Kinesis On-Demand** hoặc tăng **Shard Count**.
3. Kiểm tra `FailedRecordCount` khi dùng `PutRecords` và retry các record lỗi.

- **A:** Sai vì **Enhanced Fan-Out** chỉ tăng băng thông **đọc (consumers)**, không tăng băng thông **ghi (producers)** trên shard.
- **B:** Sai vì thời gian lưu trữ không làm tăng giới hạn 1 MB/s hoặc 1,000 records/s của shard.
- **C:** Sai vì dùng chung 1 `PartitionKey` sẽ ép toàn bộ dữ liệu vào **1 shard duy nhất** (hot shard), làm `ProvisionedThroughputExceededException` nặng hơn.
- **D (Đúng):** Đúng! **Kinesis On-Demand** tự động co giãn số shards theo lưu lượng ghi (tới 200 MB/s+); đồng thời khi dùng `PutRecords`, cần kiểm tra `FailedRecordCount` trong response và retry các bản ghi bị throttle bằng exponential backoff + jitter.

</details>

### Câu 19 `medium`

A Lambda function processes messages in batches of 10 from an Amazon SQS queue via an Event Source Mapping. Occasionally, 1 message in the batch is malformed and throws an unhandled exception, causing the entire batch of 10 messages to become visible again and be reprocessed repeatedly, including the 9 valid messages. How can the developer ensure only the failed message is retried?

- **A.** Enable `ReportBatchItemFailures` on the Event Source Mapping and return `batchItemFailures` containing only the failed message's `itemIdentifier`.
- **B.** Configure a Lambda `OnFailure` Destination on the function to filter out successful items.
- **C.** Enable `BisectBatchOnFunctionError` on the SQS Event Source Mapping to split failing batches.
- **D.** Increase the SQS Visibility Timeout to 12 hours so failed messages are not retried quickly.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Với **SQS + Lambda**, để xử lý lỗi từng phần trong batch (Partial Batch Response), luôn bật **`ReportBatchItemFailures`** và trả về danh sách `batchItemFailures`.

- **A (Đúng):** Đúng! Bật `ReportBatchItemFailures` và trả về `{ "batchItemFailures": [{ "itemIdentifier": msgId }] }` giúp Lambda xóa 9 message thành công khỏi SQS và chỉ retry đúng 1 message lỗi.
- **B:** Sai vì Lambda Destinations chỉ áp dụng cho Asynchronous Invocation, không phải Event Source Mapping.
- **C:** Sai vì `BisectBatchOnFunctionError` chỉ hỗ trợ **Kinesis & DynamoDB Streams**, không áp dụng cho SQS.
- **D:** Sai vì không tách riêng được message lỗi khỏi 9 message thành công.

</details>

### Câu 20 `medium`

A Lambda function is invoked asynchronously by Amazon S3 when new objects are uploaded. When the function fails after retries, the developer wants to forward both the original S3 event payload AND the full error stack trace/response context to an Amazon EventBridge bus for automated alerting. Which feature meets this requirement?

- **A.** Configure a Lambda Dead-Letter Queue (DLQ) pointing directly to an EventBridge bus.
- **B.** Configure an Asynchronous Invocation OnFailure Destination pointing to EventBridge.
- **C.** Enable a Lambda Function URL to automatically publish failed async payloads to EventBridge.
- **D.** Set Reserved Concurrency to `0` on the function to route async errors to EventBridge.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

**Lambda Destinations** vượt trội hơn DLQ truyền thống ở chỗ: gửi được cả `OnSuccess` lẫn `OnFailure`, hỗ trợ tới **EventBridge** và **Lambda**, đồng thời đính kèm đầy đủ context kết quả/lỗi.

- **A:** Sai vì DLQ chỉ hỗ trợ SQS/SNS và chỉ gửi event gốc chứ không kèm context lỗi/stack trace.
- **B (Đúng):** Đúng! **Lambda Destinations** hỗ trợ gửi kèm **request payload + response/error context** tới SQS, SNS, Lambda hoặc EventBridge.
- **C:** Sai, Function URL dùng cho synchronous HTTP invoke.
- **D:** Sai, đặt 0 sẽ chặn toàn bộ hàm chạy.

</details>

### Câu 21 `medium`

An order processing system uses an Amazon SQS FIFO queue. Orders from different customers (`customer-A`, `customer-B`) can be processed in parallel, but all events belonging to the same `orderId` must be processed strictly in the exact order they were sent. How should the developer set the SQS message attributes?

- **A.** Set `MessageGroupId` to a static value `"orders"` for all messages.
- **B.** Use a Standard SQS queue with `DelaySeconds` set to 0.
- **C.** Set `MessageGroupId` to the `orderId` for each message.
- **D.** Set `MessageDeduplicationId` to the `orderId` and omit `MessageGroupId`.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Trong **SQS FIFO**:
- **`MessageGroupId`**: Đơn vị tuần tự (nên đặt là `orderId` hoặc `customerId` để vừa đúng thứ tự theo đối tượng, vừa song song hóa được).
- **`MessageDeduplicationId`**: Định danh duy nhất cho mỗi message để chống gửi trùng trong 5 phút.

- **A:** Sai vì dùng chung 1 `MessageGroupId` cho mọi đơn hàng sẽ làm toàn bộ hệ thống bị nghẽn tuần tự, không song song được giữa các đơn khác nhau.
- **B:** Sai vì Standard SQS chỉ đảm bảo Best-Effort Ordering.
- **C (Đúng):** Đúng! Các message cùng **`MessageGroupId`** được đảm bảo xử lý tuần tự FIFO tuyệt đối, còn các `MessageGroupId` khác nhau có thể được consumer xử lý song song.
- **D:** Sai vì `MessageGroupId` là **bắt buộc** trên SQS FIFO, và đặt `MessageDeduplicationId` trùng nhau sẽ khiến các event sau của cùng đơn hàng bị loại bỏ nhầm trong 5 phút!

</details>

### Câu 22 `medium`

A Lambda function consumes events from an Amazon Kinesis Data Stream via an Event Source Mapping. Sometimes a malformed record causes the Lambda function to throw an error, blocking the entire shard from advancing because Lambda keeps retrying the same batch. How can the developer isolate the bad record and send it to an SQS DLQ without blocking valid records?

- **A.** Switch the Lambda Kinesis Event Source Mapping invocation type from synchronous to Asynchronous.
- **B.** Use `ReportBatchItemFailures` instead of `BisectBatchOnFunctionError` and set retries to infinite for all failed records.
- **C.** Increase the Kinesis Data Stream shard count from 1 to 10 so poisoned records are skipped.
- **D.** Enable `BisectBatchOnFunctionError`, set `MaximumRetryAttempts`, and configure `DestinationConfig.OnFailure` to an SQS queue.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Mẫu chuẩn xử lý poison-pill record trên **Kinesis / DynamoDB Streams + Lambda**: **`BisectBatchOnFunctionError: true` + `MaximumRetryAttempts` + `OnFailure Destination (SQS/SNS)`**.

- **A:** Sai vì Kinesis luôn tích hợp qua Event Source Mapping.
- **B:** Sai vì nếu để retry vô hạn (`-1`), shard vẫn bị kẹt mãi tại record hỏng.
- **C:** Sai vì record lỗi vẫn sẽ chặn chính shard chứa nó.
- **D (Đúng):** Đúng! Với Kinesis/DynamoDB Streams, **`BisectBatchOnFunctionError`** tự chia đôi batch khi gặp lỗi để cô lập đúng record hỏng, sau khi hết `MaximumRetryAttempts` sẽ đẩy record hỏng sang `OnFailure` Destination (SQS/SNS) và cho shard tiếp tục chạy.

</details>

### Câu 23 `medium`

A financial application uses an Amazon SQS FIFO queue to process stock trade orders strictly in the order they are received for each customer account, while allowing orders from different customer accounts to be processed in parallel by multiple AWS Lambda consumers. How should the developer configure the `SendMessage` API calls to the SQS FIFO queue?

- **A.** Use the exact same static string `GLOBAL_GROUP` as the `MessageGroupId` for all messages across all customers.
- **B.** Set the `MessageGroupId` to the unique `customerAccountId` for each message.
- **C.** Generate a random UUID for `MessageGroupId` on every message.
- **D.** Set `DelaySeconds` to 900 on the SQS FIFO queue.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Trong **SQS FIFO Queue**:
- **`MessageGroupId`**: Quy định nhóm thứ tự (cùng `MessageGroupId` -> tuần tự; khác `MessageGroupId` -> song song).
- **`MessageDeduplicationId`**: Chống gửi trùng tin nhắn trong khoảng thời gian 5 phút.

- **A:** Sai vì dùng chung 1 `MessageGroupId` cho toàn hệ thống sẽ khiến tại một thời điểm chỉ có 1 consumer xử lý được, không thể xử lý song song giữa các khách hàng khác nhau.
- **B (Đúng):** Đúng! Trong SQS FIFO, các tin nhắn có cùng `MessageGroupId` được đảm bảo xử lý tuần tự nghiêm ngặt (strictly ordered), trong khi các `MessageGroupId` khác nhau được xử lý song song bởi nhiều consumers.
- **C:** Sai vì nếu mỗi tin nhắn của cùng một khách hàng có `MessageGroupId` ngẫu nhiên khác nhau, chúng sẽ được xử lý song song và làm mất thứ tự giao dịch của khách hàng đó.
- **D:** Sai vì `DelaySeconds` chỉ làm trễ thời điểm tin nhắn hiển thị trong hàng đợi 15 phút.

</details>

### Câu 24 `medium`

An AWS Lambda function processes orders from an Amazon SQS standard queue with a batch size of 10. Occasionally, the Lambda function encounters a transient error when calling a third-party payment API for one message in the batch. As a result, the entire batch of 10 messages is returned to the queue and reprocessed, including orders that were already successfully charged. Which solution resolves this duplicate processing issue with the LEAST architectural change?

- **A.** Migrate from the Amazon SQS standard queue to an Amazon SQS FIFO queue and set the event source mapping `BatchSize` parameter to 1.
- **B.** Configure an Amazon SNS dead-letter queue (DLQ) directly on the Lambda function asynchronous invocation settings.
- **C.** Configure `ReportBatchItemFailures` on the event source mapping and return only failed message IDs in `batchItemFailures`.
- **D.** Increase the Amazon SQS queue visibility timeout to the maximum value of 12 hours and enable long polling with `WaitTimeSeconds` set to 20.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Khi Lambda đọc theo lô (batch) từ SQS, Kinesis hoặc DynamoDB Streams, nếu không bật `ReportBatchItemFailures`, chỉ cần 1 bản ghi lỗi làm hàm ném ngoại lệ thì cả batch sẽ bị retry. Bật `functionResponseTypes: ["ReportBatchItemFailures"]` giúp chỉ retry đúng những message bị lỗi.
- **Exam Keywords**: `SQS batch`, `some messages reprocessed`, `partial batch response` -> Chọn **`ReportBatchItemFailures`**.

- **A:** Sai vì chuyển sang SQS FIFO đòi hỏi tạo lại hàng đợi mới và đặt BatchSize = 1 làm giảm nghiêm trọng thông lượng xử lý.
- **B:** Sai vì SQS kích hoạt Lambda thông qua Event Source Mapping (luồng poll đồng bộ), không sử dụng Asynchronous Invocation DLQ của Lambda.
- **C (Đúng):** Đúng! Bật `ReportBatchItemFailures` trên Event Source Mapping cho phép Lambda trả về danh sách `batchItemFailures` chứa `itemIdentifier` của riêng các tin nhắn bị lỗi; SQS sẽ xóa các tin nhắn đã xử lý thành công và chỉ retry những tin nhắn lỗi.
- **D:** Sai vì Visibility Timeout chỉ trì hoãn thời điểm tin nhắn xuất hiện lại trong hàng đợi chứ không tách riêng được tin nhắn thành công và thất bại trong cùng một batch.

</details>

---

[← Bộ trước](08-dva-api-gateway.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Bộ tiếp theo →](10-dva-step-functions-appsync.md)
