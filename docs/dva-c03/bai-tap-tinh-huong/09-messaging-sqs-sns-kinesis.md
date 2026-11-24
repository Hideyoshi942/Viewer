# Bài tập tình huống — Chủ đề 9: Tích hợp & Messaging — SQS, SNS, Kinesis & EventBridge

> SQS Standard vs FIFO, Visibility Timeout, DLQ, SNS Fanout, Kinesis Data Streams Sharding/Resharding & EventBridge.
> **Số câu hỏi:** 24 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

An AWS Lambda function reads records from an Amazon Kinesis Data Streams shard using an event source mapping. Occasionally, a malformed JSON record causes the Lambda function to throw an unhandled exception, which blocks all subsequent records in the same shard from being processed until the record expires after 24 hours. How should the developer configure the event source mapping to isolate the poison-pill record and keep processing valid records?

- **A.** Increase the Kinesis Data Stream shard retention period from 24 hours to 7 days and set `StartingPosition` to `LATEST`.
- **B.** Configure a Dead-Letter Queue (DLQ) directly on the Lambda function's asynchronous invocation settings with `MaximumRetryAttempts` set to 2.
- **C.** Enable `BisectBatchOnFunctionError`, set `MaximumRetryAttempts` to 2, and configure an `OnFailure` destination to an Amazon SQS queue.
- **D.** Set `BatchSize` to 10,000 records and `ParallelizationFactor` to 1 so each shard is polled sequentially without splitting.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm AWS Lambda đọc các bản ghi từ một shard của Amazon Kinesis Data Streams bằng event source mapping. Thỉnh thoảng, một bản ghi JSON sai định dạng khiến hàm Lambda ném ra một unhandled exception, làm tắc nghẽn tất cả các bản ghi tiếp theo trong cùng shard cho đến khi bản ghi hết hạn sau 24 giờ. Developer nên cấu hình event source mapping như thế nào để cô lập bản ghi lỗi (poison-pill record) và tiếp tục xử lý các bản ghi hợp lệ?

**Đáp án đúng:** **C**

Với **Kinesis / DynamoDB Streams Event Source Mapping** trên Lambda, khi gặp **poison-pill record**, giải pháp chuẩn là:
- Bật **`BisectBatchOnFunctionError`**: Chia đôi batch cho đến khi tìm ra đúng bản ghi lỗi.
- Đặt **`MaximumRetryAttempts`** hoặc **`MaximumRecordAgeInSeconds`**: Tránh retry vô hạn.
- Cấu hình **`OnFailure` Destination** (SQS hoặc SNS): Lưu lại thông tin shard/sequence number của bản ghi lỗi để điều tra sau.

- **A:** Sai vì tăng thời gian lưu trữ trên Kinesis chỉ làm bản ghi lỗi nằm chờ lâu hơn chứ không giúp bỏ qua hay cô lập bản ghi lỗi.
- **B:** Sai vì Lambda Event Source Mapping cho Kinesis/DynamoDB Streams gọi hàm theo cơ chế đồng bộ (synchronous) theo batch, không sử dụng cấu hình DLQ của asynchronous invocation (thay vào đó phải dùng `DestinationConfig.OnFailure` trên Event Source Mapping).
- **C (Đúng):** Đúng! `BisectBatchOnFunctionError` tự động chia đôi batch bị lỗi để cô lập bản ghi hỏng (poison-pill), kết hợp `MaximumRetryAttempts` giới hạn số lần thử lại và `OnFailure` gửi metadata của bản ghi lỗi sang SQS/SNS để luồng dữ liệu không bị tắc nghẽn.
- **D:** Sai vì tăng `BatchSize` và đặt `ParallelizationFactor` về 1 càng làm nhiều bản ghi hợp lệ bị kẹt cùng bản ghi lỗi.

</details>

### Câu 2 `medium`

An e-commerce platform uses Amazon EventBridge to route order lifecycle events (`OrderCreated`, `OrderPaid`, `OrderShipped`) to multiple downstream AWS Lambda microservices. The team wants to ensure that: (1) the shipping Lambda only receives `OrderShipped` events where `country` is `US` or `CA`, and (2) if the shipping Lambda is temporarily unavailable, failed events are retained for reprocessing later. Which TWO configurations meet these requirements? (Choose two.)

- **A.** Create an EventBridge rule with an event pattern matching `detail-type: ["OrderShipped"]` and `detail.country: ["US", "CA"]`.
- **B.** Configure a Dead-Letter Queue (Amazon SQS) on the EventBridge rule target for the shipping Lambda.
- **C.** Configure an Amazon S3 bucket directly as the EventBridge rule target Dead-Letter Queue to store failed delivery payloads.
- **D.** Use an Amazon SNS topic with a `FilterPolicyScope` set to `MessageBody` and an S3 bucket target instead of EventBridge rules.
- **E.** Enable EventBridge Schema Discovery on the default event bus to automatically filter out non-US and non-CA order events.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng thương mại điện tử sử dụng Amazon EventBridge để định tuyến các sự kiện vòng đời đơn hàng (`OrderCreated`, `OrderPaid`, `OrderShipped`) đến nhiều microservice AWS Lambda phía sau. Nhóm muốn đảm bảo rằng: (1) shipping Lambda chỉ nhận các sự kiện `OrderShipped` có `country` là `US` hoặc `CA`, và (2) nếu shipping Lambda tạm thời không khả dụng, các sự kiện thất bại sẽ được giữ lại để xử lý lại sau. HAI cấu hình nào đáp ứng các yêu cầu này? (Chọn hai đáp án.)

**Đáp án đúng:** **A, B**

Trong **Amazon EventBridge**:
- **Event Pattern** lọc theo cấu trúc JSON của event (`source`, `detail-type`, `detail.*`).
- **Target DLQ**: Gắn **Amazon SQS** vào target để lưu các event không thể deliver sau khi hết số lần retry (mặc định EventBridge retry tối đa 24h / 185 lần).
- Ngoài ra, EventBridge còn có **Archive & Replay** để phát lại sự kiện lịch sử khi cần.

- **A (Đúng):** Đúng! EventBridge Event Pattern cho phép lọc chính xác theo trường `detail-type` và các thuộc tính lồng nhau trong `detail` trước khi kích hoạt target.
- **B (Đúng):** Đúng! EventBridge hỗ trợ gắn SQS Dead-Letter Queue (DLQ) trực tiếp trên target của Rule (và cấu hình RetryPolicy) để giữ lại các sự kiện gửi thất bại.
- **C:** Sai vì DLQ của EventBridge target chỉ hỗ trợ Amazon SQS, không hỗ trợ S3.
- **D:** Sai vì đề bài yêu cầu cấu hình trên hệ thống EventBridge hiện tại.
- **E:** Sai vì Schema Registry/Discovery chỉ dùng để phát hiện và sinh code model cho cấu trúc event, không có tác dụng lọc route event.

</details>

### Câu 3 `medium`

An AWS Lambda function is invoked asynchronously by Amazon S3 events to process uploaded images. The team wants to automatically route the full event payload and execution result to an Amazon EventBridge event bus when the function succeeds, and to an Amazon SQS queue when the function fails after retries. Which feature should the developer configure?

- **A.** Configure AWS Lambda Destinations with `OnSuccess` pointing to EventBridge and `OnFailure` pointing to the SQS queue.
- **B.** Configure a Dead-Letter Queue (DLQ) on the Lambda function to handle both `OnSuccess` and `OnFailure` asynchronous routing.
- **C.** Set `MaximumRetryAttempts` to 0 on the asynchronous invocation config and enable AWS X-Ray Active Tracing.
- **D.** Use an Event Source Mapping with `BisectBatchOnFunctionError` enabled to route S3 asynchronous events.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm AWS Lambda được gọi bất đồng bộ bởi các sự kiện Amazon S3 để xử lý ảnh được tải lên. Nhóm muốn tự động định tuyến toàn bộ payload sự kiện và kết quả thực thi tới một Amazon EventBridge event bus khi hàm thành công, và tới một hàng đợi Amazon SQS khi hàm thất bại sau các lần thử lại. Developer nên cấu hình tính năng nào?

**Đáp án đúng:** **A**

So sánh **Lambda Destinations** vs **DLQ** (Asynchronous Invocation):
- **Lambda Destinations** (khuyến nghị): Hỗ trợ cả **`OnSuccess`** và **`OnFailure`**, đích đến gồm **SQS, SNS, Lambda, EventBridge**, gửi kèm toàn bộ Request + Response + Error Stack.
- **DLQ**: Chỉ hỗ trợ khi lỗi, chỉ gửi tới SQS/SNS và chỉ chứa payload gốc.

- **A (Đúng):** Đúng! **Lambda Destinations** (cho Asynchronous Invocation) hỗ trợ định tuyến cả `OnSuccess` và `OnFailure` kèm đầy đủ context (request payload, response, stack trace) tới SQS, SNS, Lambda, hoặc EventBridge — vượt trội hơn DLQ truyền thống vốn chỉ gửi payload khi lỗi.
- **B:** Sai vì Lambda DLQ truyền thống chỉ xử lý khi thất bại (không có `OnSuccess`), chỉ hỗ trợ SQS/SNS (không hỗ trợ EventBridge), và không đính kèm thông tin chi tiết về lỗi/response.
- **C:** Sai vì tắt retry và bật X-Ray không định tuyến kết quả thành công/thất bại sang EventBridge hoặc SQS.
- **D:** Sai vì `BisectBatchOnFunctionError` chỉ dành cho Event Source Mapping từ Kinesis/DynamoDB Streams, không áp dụng cho lời gọi bất đồng bộ từ S3.

</details>

### Câu 4 `medium`

An Amazon EC2 worker application polls an Amazon SQS standard queue for background video transcoding jobs. Currently, the worker makes thousands of empty `ReceiveMessage` calls per hour (incurring high cost), and occasionally a 5-minute transcoding job gets processed twice by two different workers because the default Visibility Timeout is 30 seconds. Which two changes fix BOTH issues?

- **A.** Set `ReceiveMessageWaitTimeSeconds` to 20 (Long Polling) and increase Visibility Timeout (or call `ChangeMessageVisibility`) past 5 minutes.
- **B.** Set `ReceiveMessageWaitTimeSeconds` to 0 (Short Polling) and set `DelaySeconds` to 300 on the SQS standard queue.
- **C.** Switch to an Amazon SQS FIFO queue with `ContentBasedDeduplication` enabled while keeping `VisibilityTimeout` at 30 seconds.
- **D.** Set `MessageRetentionPeriod` to 60 seconds and reduce `MaxNumberOfMessages` to 1 per poll.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng worker trên Amazon EC2 thực hiện poll một hàng đợi tiêu chuẩn Amazon SQS để lấy các tác vụ chuyển mã video chạy nền. Hiện tại, worker thực hiện hàng nghìn lời gọi `ReceiveMessage` trống mỗi giờ (gây tốn kém chi phí), và thỉnh thoảng một tác vụ chuyển mã kéo dài 5 phút bị hai worker khác nhau xử lý hai lần vì Visibility Timeout mặc định là 30 giây. Hai thay đổi nào khắc phục CẢ HAI vấn đề này?

**Đáp án đúng:** **A**

Hai thông số cốt lõi của **Amazon SQS**:
- **Long Polling (`ReceiveMessageWaitTimeSeconds` = 1..20s)**: Chờ có message mới trả về, giảm **empty receives** và giảm chi phí.
- **Visibility Timeout** (mặc định 30s, tối đa 12h): Khoảng thời gian message bị ẩn khỏi các consumer khác sau khi được đọc; phải lớn hơn thời gian xử lý + gọi `DeleteMessage` (hoặc gia hạn bằng `ChangeMessageVisibility`).

- **A (Đúng):** Đúng! **Long Polling** (`WaitTimeSeconds = 20`) giảm số lần gọi rỗng và tiết kiệm chi phí. Tăng **Visibility Timeout** lên > 5 phút (hoặc gọi `ChangeMessageVisibility` gia hạn định kỳ) ngăn worker khác nhìn thấy và xử lý trùng message trước khi job xong.
- **B:** Sai vì `WaitTimeSeconds = 0` là Short Polling (vẫn tốn request rỗng), còn `DelaySeconds = 300` chỉ làm trễ lúc message mới vào queue chứ không ngăn xử lý trùng sau khi đã được nhận.
- **C:** Sai vì giữ `VisibilityTimeout = 30s` vẫn khiến message hiện lại sau 30 giây nếu job chạy mất 5 phút chưa kịp xóa message.
- **D:** Sai vì `MessageRetentionPeriod` là thời gian tối đa message tồn tại trong queue trước khi bị xóa vĩnh viễn.

</details>

### Câu 5 `medium`

An order service publishes JSON messages to an Amazon SNS topic. Three Amazon SQS queues subscribe to this SNS topic: `FulfillmentQueue`, `BillingQueue`, and `FraudQueue`. The developer wants `FraudQueue` to ONLY receive messages where the `orderAmount` is greater than `1000`, without writing custom filtering code inside the `FraudQueue` consumer. How should this be configured?

- **A.** Configure an SNS Subscription Filter Policy on `FraudQueue` (with `FilterPolicyScope` set to `MessageBody` or `MessageAttributes`).
- **B.** Configure an SQS Queue Access Policy on `FraudQueue` to reject incoming SNS messages where the `orderAmount` attribute is strictly under 1000.
- **C.** Use `MessageDeduplicationId` on the SNS `Publish` API call to filter out orders with amounts below 1000.
- **D.** Enable Raw Message Delivery (`RawMessageDelivery: true`) on the `FraudQueue` SNS subscription without a filter policy.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một dịch vụ đặt hàng xuất bản các message JSON tới một Amazon SNS topic. Ba hàng đợi Amazon SQS đăng ký (subscribe) vào SNS topic này: `FulfillmentQueue`, `BillingQueue` và `FraudQueue`. Developer muốn `FraudQueue` CHỈ nhận các message có `orderAmount` lớn hơn `1000`, mà không cần viết mã lọc tùy chỉnh bên trong consumer của `FraudQueue`. Điều này nên được cấu hình như thế nào?

**Đáp án đúng:** **A**

**Amazon SNS Message Filtering**:
- Gắn **Filter Policy** lên từng **Subscription** (mặc định nếu không gắn Filter Policy, subscriber nhận 100% tin nhắn).
- Hỗ trợ lọc theo **`MessageAttributes`** (mặc định) hoặc **`MessageBody`** (`FilterPolicyScope: MessageBody`).

- **A (Đúng):** Đúng! **SNS Subscription Filter Policy** cho phép lọc tin nhắn ngay tại tầng SNS trước khi đẩy xuống SQS subscriber, hỗ trợ toán tử số học (`numeric: [">", 1000]`) trên `MessageAttributes` hoặc trực tiếp trên `MessageBody`.
- **B:** Sai vì SQS Queue Policy chỉ kiểm soát quyền IAM gửi/nhận tin nhắn, không đọc và lọc nội dung trường dữ liệu `orderAmount`.
- **C:** Sai vì `MessageDeduplicationId` chỉ dùng cho SNS FIFO để chống trùng lặp trong 5 phút.
- **D:** Sai vì Raw Message Delivery chỉ bỏ lớp vỏ JSON metadata của SNS, không có chức năng lọc tin nhắn.

</details>

### Câu 6 `hard`

A telemetry system ingests clickstream events into an Amazon Kinesis Data Stream. Three independent consumer applications need to read from the same shard concurrently, and each consumer requires its own dedicated 2 MB/s read throughput with minimal delivery latency (~70 ms). Meanwhile, the producer needs to send batches of records in a single API call to maximize ingestion throughput. Which TWO actions meet these requirements? (Choose two.)

- **A.** Register each of the three consumers to use Kinesis Enhanced Fan-Out (`RegisterStreamConsumer` / `SubscribeToShard`).
- **B.** Have the producer use the `PutRecords` API (or Kinesis Producer Library) instead of single `PutRecord` calls.
- **C.** Have all three consumers share the standard `GetRecords` polling API on the same shard.
- **D.** Set the same static `PartitionKey` for every clickstream record.
- **E.** Replace Kinesis Data Streams with Amazon SQS Standard queues to preserve strict FIFO ordering per `PartitionKey`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hệ thống telemetry tiếp nhận các sự kiện clickstream vào một Amazon Kinesis Data Stream. Ba ứng dụng consumer độc lập cần đọc từ cùng một shard đồng thời, và mỗi consumer yêu cầu thông lượng đọc 2 MB/s riêng biệt với độ trễ truyền tải tối thiểu (~70 ms). Trong khi đó, producer cần gửi các batch bản ghi trong một lời gọi API duy nhất để tối đa hóa thông lượng tiếp nhận. HAI hành động nào đáp ứng các yêu cầu này? (Chọn hai đáp án.)

**Đáp án đúng:** **A, B**

Thông số **Amazon Kinesis Data Streams** cần nhớ:
- **Ghi (Write)**: `1 MB/s` hoặc `1,000 records/s` mỗi shard. Dùng **`PutRecords`** (tối đa 500 records/call) để tăng hiệu năng.
- **Đọc chuẩn (Standard)**: `2 MB/s` mỗi shard **chia sẻ** cho mọi consumer (`GetRecords`).
- **Enhanced Fan-Out**: **`2 MB/s` riêng biệt** cho mỗi consumer trên mỗi shard, dùng HTTP/2 push (`SubscribeToShard`), độ trễ ~70 ms.

- **A (Đúng):** Đúng! Mặc định tất cả consumer chia sẻ chung giới hạn **2 MB/s/shard** (và ~200 ms độ trễ polling). **Enhanced Fan-Out** (HTTP/2 push via `SubscribeToShard`) cấp riêng **2 MB/s/shard cho mỗi consumer** và giảm độ trễ xuống ~70 ms.
- **B (Đúng):** Đúng! `PutRecords` cho phép gửi tối đa 500 records (hoặc 5 MB) trong một lần gọi API, tăng thông lượng nạp dữ liệu đáng kể so với `PutRecord` đơn lẻ.
- **C:** Sai vì `GetRecords` chia sẻ chung hạn mức 2 MB/s trên mỗi shard giữa tất cả các consumer (3 consumer chia nhau chỉ còn ~0.66 MB/s mỗi bên) và dễ bị `ProvisionedThroughputExceededException`.
- **D:** Sai vì dùng cùng 1 `PartitionKey` sẽ dồn 100% dữ liệu vào 1 shard duy nhất, gây hot shard (giới hạn 1 MB/s hoặc 1,000 records/s mỗi shard).
- **E:** Sai vì SQS Standard không đảm bảo thứ tự và xóa message sau khi 1 consumer xử lý (không hỗ trợ nhiều consumer đọc lại cùng stream độc lập).

</details>

### Câu 7 `medium`

An AWS Lambda function is invoked asynchronously by Amazon EventBridge. Downstream processing occasionally fails due to transient third-party API outages. By default, Lambda retries asynchronous invocations twice (3 attempts total). The team wants failed events to be discarded if they are older than 1 hour, and only retried once. Which configuration should be updated?

- **A.** Set the Lambda function's `Timeout` configuration to `3600` seconds in the console.
- **B.** Set `VisibilityTimeout` to `3600` seconds on the AWS Lambda function's event invoke settings.
- **C.** Update Lambda's Asynchronous Invocation settings: `MaximumEventAgeInSeconds` to `3600` and `MaximumRetryAttempts` to `1`.
- **D.** Configure `BisectBatchOnFunctionError: true` and `MaximumRetryAttempts: 1` directly on the Amazon EventBridge rule target.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm AWS Lambda được gọi bất đồng bộ bởi Amazon EventBridge. Quá trình xử lý phía sau thỉnh thoảng thất bại do sự cố gián đoạn tạm thời của API bên thứ ba. Theo mặc định, Lambda thử lại các lần gọi bất đồng bộ hai lần (tổng cộng 3 lần thử). Nhóm muốn các sự kiện thất bại bị loại bỏ nếu chúng cũ hơn 1 giờ và chỉ được thử lại một lần. Cấu hình nào nên được cập nhật?

**Đáp án đúng:** **C**

**Lambda Asynchronous Invocation Config**:
- `MaximumRetryAttempts`: `0`, `1`, hoặc `2` (mặc định `2`).
- `MaximumEventAgeInSeconds`: `60`s – `21,600`s / 6 giờ (mặc định 6 giờ).
- Khi hết retry hoặc quá tuổi -> đẩy sang **DLQ** hoặc **OnFailure Destination**.

- **A:** Sai vì `Timeout` tối đa của Lambda là 900 giây (15 phút) và đó là thời gian chạy tối đa của 1 lần gọi, không phải tuổi tối đa của event trong hàng đợi bất đồng bộ.
- **B:** Sai vì `VisibilityTimeout` là thuộc tính của Amazon SQS, không phải của AWS Lambda.
- **C (Đúng):** Đúng! Cấu hình Asynchronous Invocation của Lambda (`put-function-event-invoke-config`) cho phép đặt `MaximumEventAgeInSeconds` (60 đến 21,600 giây — mặc định 6 giờ) và `MaximumRetryAttempts` (0 đến 2 — mặc định 2).
- **D:** Sai vì `BisectBatchOnFunctionError` chỉ áp dụng cho Event Source Mapping của Kinesis/DynamoDB Streams.

</details>

### Câu 8 `medium`

An AWS Lambda function is triggered by an Amazon SQS standard queue (`BatchSize: 10`). Occasionally, 1 out of the 10 messages in a batch is invalid and throws an exception, causing the entire batch of 10 messages to become visible again and be reprocessed repeatedly until they all move to the DLQ. How can the developer ensure ONLY the single failed message is retried while the 9 valid messages are deleted from the queue?

- **A.** Enable `BisectBatchOnFunctionError` on the Amazon SQS Event Source Mapping to split failing batches.
- **B.** Set `BatchSize` to `100` on the SQS Event Source Mapping to reduce overall batch failure frequency.
- **C.** Disable the SQS Dead-Letter Queue (DLQ) so failed messages are immediately purged after one attempt.
- **D.** Enable `ReportBatchItemFailures` on the SQS Event Source Mapping and return `{ "batchItemFailures": [{"itemIdentifier": "<messageId>"}] }`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm AWS Lambda được kích hoạt bởi một hàng đợi tiêu chuẩn Amazon SQS (`BatchSize: 10`). Thỉnh thoảng, 1 trong số 10 message trong một batch không hợp lệ và ném ra exception, khiến toàn bộ batch gồm 10 message hiển thị trở lại và bị xử lý lại liên tục cho đến khi tất cả chuyển sang DLQ. Làm thế nào developer có thể đảm bảo CHỈ một message bị lỗi đó được thử lại trong khi 9 message hợp lệ được xóa khỏi hàng đợi?

**Đáp án đúng:** **D**

**SQS + Lambda Partial Batch Response**:
- Bật `FunctionResponseTypes: ["ReportBatchItemFailures"]` trên Event Source Mapping.
- Lambda bắt lỗi từng message trong vòng lặp và trả về `{ "batchItemFailures": [ { "itemIdentifier": msg.messageId } ] }` thay vì ném exception làm hỏng cả batch.

- **A:** Sai vì `BisectBatchOnFunctionError` chỉ dành cho Kinesis/DynamoDB Streams, **không** hỗ trợ SQS.
- **B:** Sai vì tăng `BatchSize` càng làm nhiều message hợp lệ bị vạ lây khi 1 message lỗi.
- **C:** Sai vì tắt DLQ không ngăn được việc retry cả batch 10 messages.
- **D (Đúng):** Đúng! Bật **`ReportBatchItemFailures`** (`FunctionResponseTypes: ["ReportBatchItemFailures"]`) cho phép Lambda trả về danh sách `itemIdentifier` (`messageId`) của các tin nhắn bị lỗi; SQS sẽ chỉ giữ lại các tin nhắn lỗi đó để retry và tự động xóa 9 tin nhắn thành công.

</details>

### Câu 9 `medium`

A developer uses an AWS Lambda function to process items from an Amazon SQS FIFO queue (`BatchSize: 10`). Suddenly, one poison-pill message fails repeatedly, and the developer notices that `ApproximateAgeOfOldestMessage` keeps climbing because the entire queue appears stalled for that `MessageGroupId`. Where should the developer configure a Dead-Letter Queue (DLQ) so failed messages are isolated after 3 receives?

- **A.** Configure an SQS Standard DLQ on the Lambda function's Asynchronous Invocation `DeadLetterConfig` settings.
- **B.** Configure a Redrive Policy (`maxReceiveCount: 3`) on the SQS FIFO source queue pointing to a FIFO DLQ.
- **C.** Configure an `OnFailure` destination directly on the SQS Event Source Mapping with `MaximumRetryAttempts` set to 3.
- **D.** Set `MessageRetentionPeriod` to 60 seconds on the SQS FIFO source queue to drop unprocessable messages.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer sử dụng hàm AWS Lambda để xử lý các item từ một hàng đợi Amazon SQS FIFO (`BatchSize: 10`). Đột nhiên, một poison-pill message thất bại liên tục và developer nhận thấy chỉ số `ApproximateAgeOfOldestMessage` tiếp tục tăng vì toàn bộ hàng đợi dường như bị đình trệ đối với `MessageGroupId` đó. Developer nên cấu hình Dead-Letter Queue (DLQ) ở đâu để các message thất bại được cô lập sau 3 lần nhận?

**Đáp án đúng:** **B**

Quy tắc **SQS Dead-Letter Queue (DLQ)**:
- **Cùng loại queue**: Standard -> Standard DLQ; **FIFO -> FIFO DLQ**.
- Cấu hình **Redrive Policy** (`maxReceiveCount`) trên source queue.
- Dùng **DLQ Redrive** để đẩy ngược tin nhắn từ DLQ về source queue sau khi đã sửa bug.

- **A:** Sai vì 2 lý do: (1) SQS Event Source Mapping gọi Lambda đồng bộ (không dùng Async DLQ của Lambda), và (2) FIFO queue không thể trỏ DLQ sang Standard queue.
- **B (Đúng):** Đúng! Với SQS + Lambda (Event Source Mapping), DLQ phải cấu hình trên chính **SQS source queue** thông qua **Redrive Policy** (`maxReceiveCount: 3`), và quy tắc bắt buộc của SQS là **FIFO queue chỉ được dùng FIFO DLQ** (Standard chỉ dùng Standard DLQ).
- **C:** Sai vì `OnFailure` Destination trên Event Source Mapping chỉ hỗ trợ Kinesis/DynamoDB Streams (và Kafka), không dùng cho SQS (SQS dùng Redrive Policy).
- **D:** Sai vì giảm `MessageRetentionPeriod` sẽ làm mất vĩnh viễn tin nhắn lỗi thay vì chuyển vào DLQ để điều tra.

</details>

### Câu 10 `medium`

A developer wants to schedule an AWS Lambda function to run automatically every weekday (Monday through Friday) at 08:30 UTC, and also wants to trigger a one-time maintenance Lambda exactly 2 hours after a customer signs up without managing cron jobs or DynamoDB polling. Which service provides BOTH recurring cron schedules and millions of dynamic one-time schedules?

- **A.** Amazon EventBridge Scheduler
- **B.** Amazon SQS with `DelaySeconds` set to 7,200.
- **C.** AWS Lambda Reserved Concurrency schedules.
- **D.** Amazon SNS FIFO `DeliveryDelay`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer muốn lập lịch cho một hàm AWS Lambda tự động chạy vào mỗi ngày trong tuần (từ Thứ Hai đến Thứ Sáu) lúc 08:30 UTC, đồng thời muốn kích hoạt một Lambda bảo trì chạy một lần đúng 2 giờ sau khi khách hàng đăng ký mà không cần quản lý cron job hay DynamoDB polling. Dịch vụ nào cung cấp CẢ lịch cron định kỳ lẫn hàng triệu lịch chạy một lần động?

**Đáp án đúng:** **A**

**Amazon EventBridge Scheduler**:
- Hỗ trợ **Cron / Rate** (kèm Timezone & Daylight Saving Time) và **One-time schedules (`at(yyyy-mm-ddThh:mm:ss)`)** quy mô hàng triệu lịch.
- Nhớ giới hạn SQS `DelaySeconds`: tối đa **15 phút (900 giây)**.

- **A (Đúng):** Đúng! **Amazon EventBridge Scheduler** hỗ trợ cả lịch định kỳ (`cron(...)`, `rate(...)` kèm múi giờ) lẫn hàng triệu lịch **chạy một lần (`at(...)`)** tạo động theo từng user/sự kiện.
- **B:** Sai vì SQS `DelaySeconds` tối đa chỉ là **900 giây (15 phút)**, không thể trễ 2 giờ (7,200 giây).
- **C:** Sai vì Reserved Concurrency không phải dịch vụ lập lịch.
- **D:** Sai vì SNS không có `DeliveryDelay` 2 giờ và không hỗ trợ cron biểu thức thứ Hai–thứ Sáu.

</details>

### Câu 11 `medium`

A Lambda function processes records from an Amazon Kinesis Data Stream with 4 shards. During peak load, each shard receives 800 records per second, and the Lambda function takes 2 seconds per batch of 100 records, causing the `IteratorAge` metric to grow continuously. How can the developer increase Lambda processing concurrency per shard without adding more shards to the Kinesis stream?

- **A.** Set `ReservedConcurrency` to `100` on the AWS Lambda function while leaving `ParallelizationFactor` at `1`.
- **B.** Reduce `BatchSize` to `1` on the Kinesis Event Source Mapping so each Lambda invocation processes faster.
- **C.** Increase the Parallelization Factor (`ParallelizationFactor`) on the Kinesis Event Source Mapping up to `10`.
- **D.** Disable `BisectBatchOnFunctionError` on the Kinesis Event Source Mapping to remove batch splitting latency overhead.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm Lambda xử lý các bản ghi từ một Amazon Kinesis Data Stream có 4 shard. Trong lúc tải cao điểm, mỗi shard nhận được 800 bản ghi mỗi giây và hàm Lambda mất 2 giây cho mỗi batch 100 bản ghi, khiến chỉ số `IteratorAge` tăng liên tục. Làm thế nào developer có thể tăng mức độ đồng thời (concurrency) xử lý của Lambda trên mỗi shard mà không cần thêm shard vào Kinesis stream?

**Đáp án đúng:** **C**

Tối ưu **Kinesis / DynamoDB Streams + Lambda** khi `IteratorAge` tăng cao:
1. Tăng **`ParallelizationFactor`** (1..10) để chạy nhiều Lambda song song trên 1 shard.
2. Tăng **`BatchSize`** / **`MaximumBatchingWindowInSeconds`** để xử lý nhiều record hơn mỗi lần gọi.
3. Tăng số **Shards** của Kinesis hoặc tăng Memory/CPU của Lambda.

- **A:** Sai vì nếu `ParallelizationFactor = 1` thì với 4 shards, tối đa chỉ có 4 Lambda chạy đồng thời bất kể `ReservedConcurrency` cao bao nhiêu.
- **B:** Sai vì giảm `BatchSize` xuống 1 sẽ làm tăng số lần gọi Lambda và overhead mạng, khiến `IteratorAge` tệ hơn.
- **C (Đúng):** Đúng! Mặc định Lambda chạy 1 invocation đồng thời cho mỗi shard. Tăng **`ParallelizationFactor`** (từ 1 lên tối đa **10**) cho phép chạy tới 10 Lambda invocations song song trên **cùng 1 shard** (vẫn giữ đúng thứ tự theo `PartitionKey`).
- **D:** Sai vì tắt tùy chọn này không tăng số luồng xử lý song song trên mỗi shard.

</details>

### Câu 12 `medium`

A Lambda function reads messages from an Amazon SQS queue and writes records to an Amazon RDS database. If the Lambda function fails to connect to RDS, the team wants to ensure that only messages matching `eventType == "PAYMENT"` even trigger the Lambda function in the first place, so non-payment messages in the same queue are ignored without wasting Lambda invocations. Which feature allows Lambda to filter SQS messages BEFORE invoking the function?

- **A.** Add an `if` check at the top of the AWS Lambda handler function to return early on non-matching `eventType` message values.
- **B.** Use an Amazon SQS Queue Policy with a `StringEquals` IAM condition key on the JSON `body.eventType` field.
- **C.** Enable `ReportBatchItemFailures` on the SQS Event Source Mapping and return unmatched message IDs as failures.
- **D.** Configure Lambda Event Source Mapping Event Filtering (`FilterCriteria`) on the SQS trigger matching `body.eventType`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm Lambda đọc các message từ một hàng đợi Amazon SQS và ghi các bản ghi vào cơ sở dữ liệu Amazon RDS. Nếu hàm Lambda không kết nối được với RDS, nhóm muốn đảm bảo ngay từ đầu chỉ những message khớp với `eventType == "PAYMENT"` mới kích hoạt hàm Lambda, để các message không phải thanh toán trong cùng hàng đợi bị bỏ qua mà không lãng phí lượt gọi Lambda. Tính năng nào cho phép Lambda lọc SQS message TRƯỚC KHI gọi hàm?

**Đáp án đúng:** **D**

**Lambda Event Filtering (`FilterCriteria`)**:
- Hỗ trợ **SQS, Kinesis, DynamoDB Streams, Kafka**.
- Lọc ngay tại tầng Event Source Mapping trước khi gọi Lambda -> **tiết kiệm chi phí & giảm tải Lambda**.

- **A:** Sai vì kiểm tra trong code Lambda vẫn tốn 1 lần invocation và thời gian chạy Lambda.
- **B:** Sai vì SQS Queue Policy không đọc được nội dung JSON bên trong body của tin nhắn.
- **C:** Sai vì `ReportBatchItemFailures` dùng để báo lỗi từng phần sau khi Lambda đã chạy, không phải để lọc trước khi gọi Lambda.
- **D (Đúng):** Đúng! **Lambda Event Filtering (`FilterCriteria`)** trên Event Source Mapping (hỗ trợ SQS, Kinesis, DynamoDB Streams) cho phép lọc bỏ các message không khớp điều kiện **trước khi** khởi chạy Lambda, giúp tiết kiệm chi phí invocation (các message không khớp sẽ tự động bị xóa khỏi SQS!).

</details>

### Câu 13 `medium`

A company publishes customer profile updates to an Amazon SNS topic. One subscriber is an AWS Lambda function, and another is an HTTP/S webhook endpoint on a partner server. During a partner outage, HTTP deliveries fail and are retried, while the company wants a reliable way to capture any un-delivered messages after all retries fail without losing them. What should be configured?

- **A.** Configure an Amazon S3 bucket directly as the Amazon SNS Topic's Dead-Letter Queue for failed deliveries.
- **B.** Enable SNS Message Retention for 14 days on the SNS Standard Topic so messages remain queued during endpoint outages.
- **C.** Attach an Amazon SQS Dead-Letter Queue (DLQ) to the SNS Subscription for the partner HTTP/S endpoint.
- **D.** Switch the partner HTTP/S webhook endpoint subscription to an Amazon SNS FIFO topic for built-in retention.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty xuất bản các bản cập nhật hồ sơ khách hàng tới một Amazon SNS topic. Một subscriber là một hàm AWS Lambda, và một subscriber khác là endpoint webhook HTTP/S trên máy chủ đối tác. Trong thời gian máy chủ đối tác gặp sự cố, việc gửi HTTP thất bại và được thử lại, trong khi công ty muốn một cách đáng tin cậy để thu giữ bất kỳ message nào không gửi được sau khi tất cả các lần thử lại thất bại mà không làm mất chúng. Cần cấu hình gì?

**Đáp án đúng:** **C**

Lưu ý về **Amazon SNS**:
- **SNS Standard** hỗ trợ nhiều giao thức (SQS, Lambda, HTTP/S, Email, SMS) và cho phép gắn **SQS DLQ** lên từng Subscription.
- **SNS FIFO** chỉ hỗ trợ subscriber là **SQS FIFO** (không hỗ trợ HTTP/S hay Lambda trực tiếp).

- **A:** Sai vì SNS Subscription DLQ chỉ hỗ trợ Amazon SQS, không hỗ trợ S3.
- **B:** Sai vì SNS Standard Topic không lưu trữ tin nhắn dài ngày như SQS; tin nhắn bị mất nếu không có DLQ khi hết retry.
- **C (Đúng):** Đúng! Amazon SNS hỗ trợ gắn **SQS Dead-Letter Queue (DLQ)** trực tiếp trên từng **Subscription** để lưu lại các tin nhắn không thể giao tới subscriber sau khi hết chính sách retry.
- **D:** Sai vì SNS FIFO chỉ hỗ trợ subscriber là SQS FIFO, không hỗ trợ HTTP/S webhook hay Lambda trực tiếp.

</details>

### Câu 14 `medium`

A developer is designing an event-driven architecture where an Order Service emits events that must be consumed by multiple downstream services (`Inventory`, `Analytics`, `Notifications`), and the team needs content-based routing, schema discovery, and the ability to replay past events from the last 7 days if a downstream bug occurs. Which TWO Amazon EventBridge features should be enabled? (Choose two.)

- **A.** Switch to Amazon SQS Standard because EventBridge custom event buses cannot route an event to multiple targets.
- **B.** Use EventBridge `MessageGroupId` on `PutEvents` calls to guarantee global strict ordering and replay across all buses.
- **C.** Configure an EventBridge Event Archive (7-day retention) on the custom bus and use Event Replay for recovery.
- **D.** Enable EventBridge `ConsistentRead` on the custom event bus to prevent event loss during target outages.
- **E.** Enable EventBridge Schema Discovery on the event bus so developers can download strongly-typed IDE code bindings.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer đang thiết kế một kiến trúc hướng sự kiện (event-driven), trong đó Order Service phát ra các sự kiện phải được tiêu thụ bởi nhiều dịch vụ phía sau (`Inventory`, `Analytics`, `Notifications`), và nhóm cần định tuyến theo nội dung (content-based routing), khám phá schema (schema discovery) và khả năng phát lại (replay) các sự kiện trong 7 ngày qua nếu xảy ra lỗi ở dịch vụ phía sau. HAI tính năng nào của Amazon EventBridge nên được bật? (Chọn hai đáp án.)

**Đáp án đúng:** **C, E**

Tính năng nâng cao của **Amazon EventBridge**:
- **Archive & Replay**: Lưu trữ và phát lại sự kiện lịch sử.
- **Schema Registry & Discovery**: Tự động suy luận schema và sinh code classes.
- **Input Transformer**: Chỉnh sửa payload trước khi gửi tới target.

- **A:** Sai vì EventBridge có thể route một event tới nhiều targets (tối đa 5 targets/rule và nhiều rules trên 1 bus).
- **B:** Sai vì `MessageGroupId` là thuộc tính của SQS FIFO / SNS FIFO, không phải của EventBridge.
- **C (Đúng):** Đúng! **EventBridge Archive & Replay** cho phép lưu trữ sự kiện trong khoảng thời gian cấu hình (ví dụ 7 ngày) và phát lại (Replay) một khoảng thời gian cụ thể tới event bus hoặc rule đích khi cần khôi phục.
- **D:** Sai vì `ConsistentRead` là tham số của DynamoDB.
- **E (Đúng):** Đúng! **Schema Discovery** tự động phân tích cấu trúc các event đi qua bus và lưu vào Schema Registry để sinh code bindings (TypeScript, Java, Python, Go).

</details>

### Câu 15 `medium`

An Amazon ECS service running on AWS Fargate needs to scale out automatically from 2 tasks to 20 tasks whenever the average CPU utilization exceeds 70%, AND scale based on the number of messages in an Amazon SQS queue (`ApproximateNumberOfMessagesVisible`). Which ECS Auto Scaling feature should the developer configure?

- **A.** Configure an EC2 Auto Scaling Group Scaling Policy directly on the AWS Fargate cluster nodes.
- **B.** Configure ECS Service Auto Scaling (Application Auto Scaling) with a Target Tracking policy (70% CPU) and a Step Scaling policy on SQS backlog.
- **C.** Use ECS Capacity Providers with `ManagedScaling` on EC2 instances to scale Fargate task counts.
- **D.** Set `DesiredCount` to 20 permanently in the ECS Service definition to handle any SQS backlog spikes.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một dịch vụ Amazon ECS chạy trên AWS Fargate cần tự động mở rộng (scale out) từ 2 task lên 20 task bất cứ khi nào mức sử dụng CPU trung bình vượt quá 70%, VÀ mở rộng dựa trên số lượng message trong một hàng đợi Amazon SQS (`ApproximateNumberOfMessagesVisible`). Developer nên cấu hình tính năng ECS Auto Scaling nào?

**Đáp án đúng:** **B**

Phân biệt 2 tầng Auto Scaling trong **Amazon ECS**:
1. **ECS Service Auto Scaling (Application Auto Scaling)**: Scale **số lượng Tasks** (Target Tracking, Step Scaling, Scheduled Scaling).
2. **ECS Cluster Auto Scaling (Capacity Providers)**: Scale **số lượng EC2 Container Instances** (chỉ dùng cho EC2 launch type).

- **A:** Sai vì **AWS Fargate** là serverless compute không quản lý EC2 Auto Scaling Group.
- **B (Đúng):** Đúng! **ECS Service Auto Scaling** sử dụng **Application Auto Scaling** hỗ trợ cả **Target Tracking** (theo CPU/Memory/ALB RequestCountPerTarget) và **Step Scaling** (theo CloudWatch Alarm từ SQS `ApproximateNumberOfMessagesVisible`).
- **C:** Sai vì ECS Capacity Providers EC2 chỉ scale số lượng máy chủ EC2 bên dưới, không scale số lượng Fargate tasks theo CPU/SQS.
- **D:** Sai vì chạy cố định 20 tasks suốt ngày đêm gây lãng phí chi phí.

</details>

### Câu 16 `medium`

A company wants to restrict access to an Amazon SQS queue so that ONLY an AWS Lambda function in Account A (`111122223333`) and an Amazon SNS topic (`arn:aws:sns:us-east-1:111122223333:OrdersTopic`) can send messages (`sqs:SendMessage`) to the queue. Where should this access control be configured?

- **A.** Attach an IAM Identity-based Policy directly to the Amazon SNS topic granting `sqs:SendMessage` on the queue.
- **B.** Configure an SQS Queue Policy allowing `sqs:SendMessage` from `sns.amazonaws.com` (with `aws:SourceArn`) and the Lambda role.
- **C.** Configure an EC2 Security Group directly on the Amazon SQS queue allowing inbound traffic from `sns.amazonaws.com`.
- **D.** Enable SQS Long Polling (`ReceiveMessageWaitTimeSeconds: 20`) so SNS and Lambda can publish messages without any access policies.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty muốn giới hạn quyền truy cập vào một hàng đợi Amazon SQS sao cho CHỈ một hàm AWS Lambda trong Account A (`111122223333`) và một Amazon SNS topic (`arn:aws:sns:us-east-1:111122223333:OrdersTopic`) mới có thể gửi message (`sqs:SendMessage`) vào hàng đợi. Việc kiểm soát truy cập này nên được cấu hình ở đâu?

**Đáp án đúng:** **B**

**Amazon SQS Queue Policy**:
- Là Resource-based Policy cho phép kiểm soát truy cập cross-account hoặc từ dịch vụ AWS khác (**SNS**, **S3**, **EventBridge**) với điều kiện `aws:SourceArn` / `aws:SourceAccount`.

- **A:** Sai vì SNS topic không có IAM Identity Policy; để SNS gửi sang SQS phải mở quyền trong **SQS Queue Policy**.
- **B (Đúng):** Đúng! **SQS Queue Policy** là Resource-based Policy gắn trực tiếp lên SQS queue, bắt buộc phải có để cho phép các dịch vụ AWS như **Amazon SNS** hoặc **S3 Event Notifications** (`aws:SourceArn`) gửi tin nhắn vào SQS.
- **C:** Sai vì SQS là dịch vụ managed không gắn Security Group trực tiếp.
- **D:** Sai vì Long Polling không liên quan đến phân quyền gửi tin nhắn.

</details>

### Câu 17 `medium`

An AWS Lambda function is triggered by an Amazon SQS standard queue. During a downstream database outage, the Lambda function fails on every message, and SQS immediately makes the message visible again (or retries rapidly), causing thousands of failed invocations and filling up the DLQ before the database recovers. How can the developer slow down retry attempts or temporarily stop Lambda from polling the SQS queue without losing messages?

- **A.** Set `ReservedConcurrency` to `0` on the Lambda function while leaving the Amazon SQS Event Source Mapping actively enabled.
- **B.** Purge all pending messages from the SQS queue immediately using the `sqs:PurgeQueue` API call.
- **C.** Set `BatchSize` to `10,000` on the SQS Event Source Mapping during the database outage.
- **D.** Disable the SQS Event Source Mapping (`Enabled: false`) so messages remain in SQS, and increase Visibility Timeout.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm AWS Lambda được kích hoạt bởi một hàng đợi tiêu chuẩn Amazon SQS. Trong thời gian cơ sở dữ liệu phía sau gặp sự cố, hàm Lambda thất bại trên mọi message và SQS lập tức làm cho message hiển thị trở lại (hoặc thử lại nhanh chóng), gây ra hàng nghìn lần gọi thất bại và làm đầy DLQ trước khi cơ sở dữ liệu phục hồi. Làm thế nào developer có thể làm chậm các lần thử lại hoặc tạm thời dừng Lambda poll hàng đợi SQS mà không làm mất message?

**Đáp án đúng:** **D**

Bẫy thi **SQS + Lambda khi Downstream sập**:
- **ĐỪNG** đặt `ReservedConcurrency = 0` (vì poller vẫn đọc và đẩy message vào DLQ).
- **HÃY** tạm tắt **`Event Source Mapping` (`Enabled = false`)** để giữ nguyên tin nhắn an toàn trong SQS.

- **A:** Sai vì nếu để Event Source Mapping bật mà đặt `ReservedConcurrency = 0`, SQS poller vẫn nhận message rồi bị Lambda từ chối (throttle), làm tăng `ReceiveCount` và đẩy hết message sang DLQ!
- **B:** Sai vì `PurgeQueue` sẽ xóa sạch toàn bộ dữ liệu đơn hàng/tin nhắn trong hàng đợi.
- **C:** Sai vì `BatchSize` tối đa của SQS Standard với Lambda là 10,000 nhưng không ngăn Lambda tiếp tục poll và làm lỗi tin nhắn.
- **D (Đúng):** Đúng! Tắt tạm thời **Event Source Mapping** (`aws lambda update-event-source-mapping --no-enabled`) sẽ dừng Lambda đọc SQS mà **không làm mất tin nhắn** (SQS giữ tin nhắn tối đa 14 ngày). Khi DB phục hồi, bật lại Event Source Mapping để xử lý tiếp.

</details>

### Câu 18 `medium`

An AWS Lambda function writes high-volume audit events to Amazon Kinesis Data Streams (`PutRecord`). When traffic spikes, `PutRecord` calls occasionally fail with `ProvisionedThroughputExceededException` because the stream has `Provisioned` capacity mode with 2 shards. Which TWO ways can the team resolve this without dropping events?

- **A.** Enable Kinesis Enhanced Fan-Out on the stream to give producers dedicated write bandwidth per shard.
- **B.** Use the same static string `"ALL"` as the `PartitionKey` for every `PutRecords` batch entry to avoid shard fragmentation issues.
- **C.** Reduce the Kinesis Data Stream retention period to 24 hours so shards free up write throughput faster.
- **D.** Switch Kinesis to On-Demand (or `UpdateShardCount`) and retry partial `PutRecords` failures with exponential backoff + jitter.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm AWS Lambda ghi các sự kiện kiểm toán lưu lượng lớn vào Amazon Kinesis Data Streams (`PutRecord`). Khi lưu lượng tăng đột biến, các lời gọi `PutRecord` thỉnh thoảng thất bại với lỗi `ProvisionedThroughputExceededException` vì stream đang ở chế độ capacity `Provisioned` với 2 shard. HAI cách nào giúp nhóm giải quyết vấn đề này mà không làm mất sự kiện?

**Đáp án đúng:** **D**

Xử lý **Kinesis Write Throttling (`ProvisionedThroughputExceededException`)**:
1. Tăng phân tán `PartitionKey` (tránh Hot Shard).
2. Dùng **Kinesis On-Demand** hoặc tăng **Shard Count**.
3. Kiểm tra `FailedRecordCount` khi dùng `PutRecords` và retry các record lỗi.

- **A:** Sai vì **Enhanced Fan-Out** chỉ tăng băng thông **đọc (consumers)**, không tăng băng thông **ghi (producers)** trên shard.
- **B:** Sai vì dùng chung 1 `PartitionKey` sẽ ép toàn bộ dữ liệu vào **1 shard duy nhất** (hot shard), làm `ProvisionedThroughputExceededException` nặng hơn.
- **C:** Sai vì thời gian lưu trữ không làm tăng giới hạn 1 MB/s hoặc 1,000 records/s của shard.
- **D (Đúng):** Đúng! **Kinesis On-Demand** tự động co giãn số shards theo lưu lượng ghi (tới 200 MB/s+); đồng thời khi dùng `PutRecords`, cần kiểm tra `FailedRecordCount` trong response và retry các bản ghi bị throttle bằng exponential backoff + jitter.

</details>

### Câu 19 `medium`

A Lambda function processes messages in batches of 10 from an Amazon SQS queue via an Event Source Mapping. Occasionally, 1 message in the batch is malformed and throws an unhandled exception, causing the entire batch of 10 messages to become visible again and be reprocessed repeatedly, including the 9 valid messages. How can the developer ensure only the failed message is retried?

- **A.** Increase the Amazon SQS queue `VisibilityTimeout` attribute to the maximum value of 12 hours.
- **B.** Enable `ReportBatchItemFailures` on the Event Source Mapping and return `batchItemFailures` with only the failed message's `itemIdentifier`.
- **C.** Enable `BisectBatchOnFunctionError` on the Amazon SQS Event Source Mapping to split failing batches.
- **D.** Configure an Asynchronous Invocation `OnFailure` Lambda Destination pointing to a Dead-Letter Queue.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm Lambda xử lý các message theo từng batch 10 message từ một hàng đợi Amazon SQS thông qua Event Source Mapping. Thỉnh thoảng, 1 message trong batch bị sai định dạng và ném ra unhandled exception, khiến toàn bộ batch 10 message hiển thị trở lại và bị xử lý lại liên tục, bao gồm cả 9 message hợp lệ. Làm thế nào developer có thể đảm bảo chỉ message bị lỗi được thử lại?

**Đáp án đúng:** **B**

Với **SQS + Lambda**, để xử lý lỗi từng phần trong batch (Partial Batch Response), luôn bật **`ReportBatchItemFailures`** và trả về danh sách `batchItemFailures`.

- **A:** Sai vì không tách riêng được message lỗi khỏi 9 message thành công.
- **B (Đúng):** Đúng! Bật `ReportBatchItemFailures` và trả về `{ "batchItemFailures": [{ "itemIdentifier": msgId }] }` giúp Lambda xóa 9 message thành công khỏi SQS và chỉ retry đúng 1 message lỗi.
- **C:** Sai vì `BisectBatchOnFunctionError` chỉ hỗ trợ **Kinesis & DynamoDB Streams**, không áp dụng cho SQS.
- **D:** Sai vì Lambda Destinations chỉ áp dụng cho Asynchronous Invocation, không phải Event Source Mapping.

</details>

### Câu 20 `medium`

A Lambda function is invoked asynchronously by Amazon S3 when new objects are uploaded. When the function fails after retries, the developer wants to forward both the original S3 event payload AND the full error stack trace/response context to an Amazon EventBridge bus for automated alerting. Which feature meets this requirement?

- **A.** Configure a Lambda Dead-Letter Queue (DLQ) pointing directly to an EventBridge event bus.
- **B.** Set Reserved Concurrency to `0` on the Lambda function to capture failed payloads.
- **C.** Enable a Lambda Function URL with `AWS_IAM` authentication on the function.
- **D.** Configure an Asynchronous Invocation OnFailure Destination pointing to EventBridge.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm Lambda được gọi bất đồng bộ bởi Amazon S3 khi có các object mới được tải lên. Khi hàm thất bại sau các lần thử lại, developer muốn chuyển tiếp cả payload sự kiện S3 gốc VÀ toàn bộ stack trace lỗi/ngữ cảnh phản hồi tới một Amazon EventBridge bus để cảnh báo tự động. Tính năng nào đáp ứng yêu cầu này?

**Đáp án đúng:** **D**

**Lambda Destinations** vượt trội hơn DLQ truyền thống ở chỗ: gửi được cả `OnSuccess` lẫn `OnFailure`, hỗ trợ tới **EventBridge** và **Lambda**, đồng thời đính kèm đầy đủ context kết quả/lỗi.

- **A:** Sai vì DLQ chỉ hỗ trợ SQS/SNS và chỉ gửi event gốc chứ không kèm context lỗi/stack trace.
- **B:** Sai, đặt 0 sẽ chặn toàn bộ hàm chạy.
- **C:** Sai, Function URL dùng cho synchronous HTTP invoke.
- **D (Đúng):** Đúng! **Lambda Destinations** hỗ trợ gửi kèm **request payload + response/error context** tới SQS, SNS, Lambda hoặc EventBridge.

</details>

### Câu 21 `medium`

An order processing system uses an Amazon SQS FIFO queue. Orders from different customers (`customer-A`, `customer-B`) can be processed in parallel, but all events belonging to the same `orderId` must be processed strictly in the exact order they were sent. How should the developer set the SQS message attributes?

- **A.** Set `MessageGroupId` to the `orderId` for each message.
- **B.** Set `MessageGroupId` to a static value `"orders"` for all messages.
- **C.** Set `MessageDeduplicationId` to the `orderId` and omit `MessageGroupId`.
- **D.** Use a Standard SQS queue with `DelaySeconds` set to 0.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hệ thống xử lý đơn hàng sử dụng một hàng đợi Amazon SQS FIFO. Các đơn hàng từ các khách hàng khác nhau (`customer-A`, `customer-B`) có thể được xử lý song song, nhưng tất cả các sự kiện thuộc cùng một `orderId` phải được xử lý nghiêm ngặt theo đúng thứ tự chúng được gửi. Developer nên thiết lập các thuộc tính SQS message như thế nào?

**Đáp án đúng:** **A**

Trong **SQS FIFO**:
- **`MessageGroupId`**: Đơn vị tuần tự (nên đặt là `orderId` hoặc `customerId` để vừa đúng thứ tự theo đối tượng, vừa song song hóa được).
- **`MessageDeduplicationId`**: Định danh duy nhất cho mỗi message để chống gửi trùng trong 5 phút.

- **A (Đúng):** Đúng! Các message cùng **`MessageGroupId`** được đảm bảo xử lý tuần tự FIFO tuyệt đối, còn các `MessageGroupId` khác nhau có thể được consumer xử lý song song.
- **B:** Sai vì dùng chung 1 `MessageGroupId` cho mọi đơn hàng sẽ làm toàn bộ hệ thống bị nghẽn tuần tự, không song song được giữa các đơn khác nhau.
- **C:** Sai vì `MessageGroupId` là **bắt buộc** trên SQS FIFO, và đặt `MessageDeduplicationId` trùng nhau sẽ khiến các event sau của cùng đơn hàng bị loại bỏ nhầm trong 5 phút!
- **D:** Sai vì Standard SQS chỉ đảm bảo Best-Effort Ordering.

</details>

### Câu 22 `medium`

A Lambda function consumes events from an Amazon Kinesis Data Stream via an Event Source Mapping. Sometimes a malformed record causes the Lambda function to throw an error, blocking the entire shard from advancing because Lambda keeps retrying the same batch. How can the developer isolate the bad record and send it to an SQS DLQ without blocking valid records?

- **A.** Increase the Kinesis Data Stream shard count from 1 to 10 using `UpdateShardCount`.
- **B.** Enable `BisectBatchOnFunctionError`, set `MaximumRetryAttempts`, and configure `DestinationConfig.OnFailure` to SQS.
- **C.** Use `ReportBatchItemFailures` instead of `BisectBatchOnFunctionError` and keep Kinesis retries set to infinite (`-1`).
- **D.** Switch the Lambda Kinesis trigger invocation type from Event Source Mapping to Asynchronous.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm Lambda tiêu thụ các sự kiện từ một Amazon Kinesis Data Stream thông qua Event Source Mapping. Đôi khi một bản ghi sai định dạng khiến hàm Lambda ném ra lỗi, làm tắc nghẽn toàn bộ shard không thể tiến lên vì Lambda cứ thử lại cùng một batch. Làm thế nào developer có thể cô lập bản ghi lỗi và gửi nó tới một SQS DLQ mà không làm tắc nghẽn các bản ghi hợp lệ?

**Đáp án đúng:** **B**

Mẫu chuẩn xử lý poison-pill record trên **Kinesis / DynamoDB Streams + Lambda**: **`BisectBatchOnFunctionError: true` + `MaximumRetryAttempts` + `OnFailure Destination (SQS/SNS)`**.

- **A:** Sai vì record lỗi vẫn sẽ chặn chính shard chứa nó.
- **B (Đúng):** Đúng! Với Kinesis/DynamoDB Streams, **`BisectBatchOnFunctionError`** tự chia đôi batch khi gặp lỗi để cô lập đúng record hỏng, sau khi hết `MaximumRetryAttempts` sẽ đẩy record hỏng sang `OnFailure` Destination (SQS/SNS) và cho shard tiếp tục chạy.
- **C:** Sai vì nếu để retry vô hạn (`-1`), shard vẫn bị kẹt mãi tại record hỏng.
- **D:** Sai vì Kinesis luôn tích hợp qua Event Source Mapping.

</details>

### Câu 23 `medium`

A financial application uses an Amazon SQS FIFO queue to process stock trade orders strictly in the order they are received for each customer account, while allowing orders from different customer accounts to be processed in parallel by multiple AWS Lambda consumers. How should the developer configure the `SendMessage` API calls to the SQS FIFO queue?

- **A.** Set `DelaySeconds` to 900 on the SQS FIFO queue.
- **B.** Set the `MessageGroupId` to the unique `customerAccountId` for each message.
- **C.** Generate a random UUID for `MessageGroupId` on every message.
- **D.** Use the exact same static string `GLOBAL_GROUP` as the `MessageGroupId` for all messages across all customers.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng tài chính sử dụng một hàng đợi Amazon SQS FIFO để xử lý các lệnh giao dịch chứng khoán theo đúng thứ tự nhận được cho từng tài khoản khách hàng, đồng thời cho phép các lệnh từ các tài khoản khách hàng khác nhau được xử lý song song bởi nhiều AWS Lambda consumer. Developer nên cấu hình các lời gọi API `SendMessage` tới hàng đợi SQS FIFO như thế nào?

**Đáp án đúng:** **B**

Trong **SQS FIFO Queue**:
- **`MessageGroupId`**: Quy định nhóm thứ tự (cùng `MessageGroupId` -> tuần tự; khác `MessageGroupId` -> song song).
- **`MessageDeduplicationId`**: Chống gửi trùng tin nhắn trong khoảng thời gian 5 phút.

- **A:** Sai vì `DelaySeconds` chỉ làm trễ thời điểm tin nhắn hiển thị trong hàng đợi 15 phút.
- **B (Đúng):** Đúng! Trong SQS FIFO, các tin nhắn có cùng `MessageGroupId` được đảm bảo xử lý tuần tự nghiêm ngặt (strictly ordered), trong khi các `MessageGroupId` khác nhau được xử lý song song bởi nhiều consumers.
- **C:** Sai vì nếu mỗi tin nhắn của cùng một khách hàng có `MessageGroupId` ngẫu nhiên khác nhau, chúng sẽ được xử lý song song và làm mất thứ tự giao dịch của khách hàng đó.
- **D:** Sai vì dùng chung 1 `MessageGroupId` cho toàn hệ thống sẽ khiến tại một thời điểm chỉ có 1 consumer xử lý được, không thể xử lý song song giữa các khách hàng khác nhau.

</details>

### Câu 24 `medium`

An AWS Lambda function processes orders from an Amazon SQS standard queue with a batch size of 10. Occasionally, the Lambda function encounters a transient error when calling a third-party payment API for one message in the batch. As a result, the entire batch of 10 messages is returned to the queue and reprocessed, including orders that were already successfully charged. Which solution resolves this duplicate processing issue with the LEAST architectural change?

- **A.** Configure ReportBatchItemFailures on the Lambda event source mapping and return the message IDs of only the failed messages in batchItemFailures.
- **B.** Increase the SQS queue VisibilityTimeout attribute to the maximum value of 12 hours and configure a ReceiveMessageWaitTimeSeconds value of 20 seconds.
- **C.** Configure an Amazon SNS dead-letter queue (DLQ) target directly in the Lambda function asynchronous invocation settings with MaximumRetryAttempts set to 0.
- **D.** Migrate from the Amazon SQS standard queue to an Amazon SQS FIFO queue, configure a unique MessageGroupId per order, and set the Lambda BatchSize parameter to 1.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm AWS Lambda xử lý các đơn hàng từ một hàng đợi tiêu chuẩn Amazon SQS (standard queue) với batch size là 10. Thỉnh thoảng, hàm Lambda gặp lỗi tạm thời khi gọi third-party payment API cho một message trong batch. Kết quả là toàn bộ batch gồm 10 message bị trả lại hàng đợi và xử lý lại, bao gồm cả những đơn hàng đã được thanh toán thành công trước đó. Giải pháp nào khắc phục vấn đề xử lý trùng lặp này với thay đổi kiến trúc ÍT NHẤT?

**Đáp án đúng:** **A**

Khi Lambda đọc theo lô (batch) từ SQS, Kinesis hoặc DynamoDB Streams, nếu không bật `ReportBatchItemFailures`, chỉ cần 1 bản ghi lỗi làm hàm ném ngoại lệ thì cả batch sẽ bị retry. Bật `functionResponseTypes: ["ReportBatchItemFailures"]` giúp chỉ retry đúng những message bị lỗi.
- **Exam Keywords**: `SQS batch`, `some messages reprocessed`, `partial batch response` -> Chọn **`ReportBatchItemFailures`**.

- **A (Đúng):** Đúng! Bật `ReportBatchItemFailures` trên Event Source Mapping cho phép Lambda trả về danh sách `batchItemFailures` chứa `itemIdentifier` của riêng các tin nhắn bị lỗi; SQS sẽ xóa các tin nhắn đã xử lý thành công và chỉ retry những tin nhắn lỗi.
- **B:** Sai vì Visibility Timeout chỉ trì hoãn thời điểm tin nhắn xuất hiện lại trong hàng đợi chứ không tách riêng được tin nhắn thành công và thất bại trong cùng một batch.
- **C:** Sai vì SQS kích hoạt Lambda thông qua Event Source Mapping (luồng poll đồng bộ), không sử dụng Asynchronous Invocation DLQ của Lambda.
- **D:** Sai vì chuyển sang SQS FIFO đòi hỏi tạo lại hàng đợi mới và đặt BatchSize = 1 làm giảm nghiêm trọng thông lượng xử lý.

</details>

---

[← Chủ đề 08](08-api-gateway.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chủ đề 10 →](10-step-functions-appsync.md)
