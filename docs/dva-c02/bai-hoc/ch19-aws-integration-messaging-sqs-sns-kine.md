# Chương 19 – AWS Integration & Messaging: SQS, SNS & Kinesis

> **Nguồn:** 21 video của chương + *Quiz – Messaging & Integration Quiz* (25 câu).
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay (2026). Đây là chương **rất quan trọng** cho kỳ thi DVA-C02, đặc biệt là SQS.

## Mục tiêu chương

Sau chương này bạn có thể:

- Phân biệt giao tiếp **đồng bộ (synchronous)** và **bất đồng bộ (asynchronous / event-based)** giữa các ứng dụng, và biết khi nào cần **decoupling**.
- Làm chủ **Amazon SQS**: Standard vs FIFO, retention, **Visibility Timeout**, **Dead Letter Queue** + redrive, **Delay Queue**, **Long Polling**, **SQS Extended Client**, các API chính, **Queue Access Policy**, deduplication và **MessageGroupId**.
- Dùng **Amazon SNS** theo mô hình Pub/Sub, mẫu **SNS + SQS Fan-out**, **SNS FIFO** và **Message Filtering**.
- Hiểu **Kinesis Data Streams** (shard, partition key, capacity mode, KPL/KCL, enhanced fan-out), **Amazon Data Firehose** (near real-time, buffer, đích S3/Redshift/OpenSearch) và **Amazon Managed Service for Apache Flink**.
- Chọn đúng giữa **SQS, SNS và Kinesis** cho từng tình huống trong đề thi.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001–002 | Section Introduction, Introduction to Messaging | Bài 1 – Giới thiệu Messaging & Decoupling |
| 003–004 | Amazon SQS – Standard Queues Overview | Bài 2 – Amazon SQS Standard Queue |
| 005 | SQS Queue Access Policy | Bài 3 – SQS Queue Access Policy |
| 006 | SQS – Message Visibility Timeout | Bài 4 – Message Visibility Timeout |
| 007–008 | SQS – Dead Letter Queues | Bài 5 – Dead Letter Queue (DLQ) & Redrive |
| 009 | SQS – Delay Queues | Bài 6 – Delay Queue |
| 010 | SQS – Certified Developer concepts | Bài 7 – Long Polling, Extended Client & các API của SQS |
| 011–012 | SQS – FIFO Queues (+ Advanced) | Bài 8 – SQS FIFO Queue |
| 013, 015 | Amazon SNS, SNS Hands On | Bài 9 – Amazon SNS |
| 014 | Amazon SNS and SQS – Fan Out Pattern | Bài 10 – Fan-out, SNS FIFO & Message Filtering |
| 016–017 | Amazon Kinesis Data Streams | Bài 11 – Kinesis Data Streams |
| 018–019 | Amazon Data Firehose | Bài 12 – Amazon Data Firehose |
| 020 | Amazon Managed Service for Apache Flink | Bài 13 – Managed Service for Apache Flink |
| 021 | SQS vs SNS vs Kinesis | Bài 14 – So sánh SQS, SNS và Kinesis |
| Quiz | Messaging & Integration Quiz | Câu hỏi ôn tập |

---

## Bài 1 – Giới thiệu Messaging & Decoupling

### Lý thuyết

- Khi triển khai **nhiều ứng dụng**, chúng chắc chắn phải giao tiếp và chia sẻ dữ liệu với nhau. Có 2 mô hình:

| | Đồng bộ (Synchronous) | Bất đồng bộ (Asynchronous / Event-based) |
|---|---|---|
| Cách kết nối | Ứng dụng gọi **trực tiếp** ứng dụng kia | Có **middleware** (queue, topic, stream) ở giữa |
| Ví dụ | Buying service gọi thẳng Shipping service | Buying service đẩy "đơn hàng mới" vào queue; Shipping service hỏi queue để lấy |
| Nhược điểm | Khi có **đột biến tải** (spike), service phía sau bị **quá tải** → outage | Phức tạp hơn một chút, dữ liệu xử lý trễ |
| Ưu điểm | Đơn giản, phản hồi ngay | Hai bên **scale độc lập**, chịu được spike |

- Ví dụ: service encode video bình thường xử lý 10 video, đột nhiên phải xử lý 1.000 video → nếu gọi đồng bộ sẽ bị quá tải. Giải pháp là **decouple** ứng dụng, để lớp trung gian tự scale.
- Ba dịch vụ decoupling chính của chương:
  - **SQS** – mô hình **queue** (hàng đợi).
  - **SNS** – mô hình **pub/sub** (publish–subscribe).
  - **Kinesis** – **real-time streaming**, big data.
- Cả ba đều scale rất tốt, và giúp các service của bạn scale độc lập với nhau.

### Ghi nhớ cho kỳ thi

- Thấy từ khoá **"decouple applications"** → nghĩ tới **SQS** (hoặc SNS/Kinesis tuỳ ngữ cảnh).
- Đề thi hỏi **rất nhiều về SQS** → học kỹ các bài 2–8.

---

## Bài 2 – Amazon SQS Standard Queue

### Lý thuyết

#### Mô hình hoạt động

- **SQS = Simple Queue Service**. Trung tâm là một **queue** chứa **message**.
- **Producer**: gửi message vào queue (một hoặc nhiều producer). Message có thể là bất cứ gì, ví dụ "xử lý đơn hàng này", "xử lý video này".
- **Consumer**: **poll** (kéo) message từ queue ("có message nào cho tôi không?"), xử lý rồi **xoá** message khỏi queue. Có thể có nhiều consumer.
- Queue đóng vai trò **buffer** để decouple producer và consumer.

#### Đặc điểm SQS Standard

- Dịch vụ **lâu đời nhất** của AWS (hơn 10 năm), **fully managed**, dùng để **decouple ứng dụng**.
- **Throughput không giới hạn**, **số message trong queue không giới hạn**.
- Message **sống ngắn**: retention **mặc định 4 ngày**, **tối đa 14 ngày** (tối thiểu 1 phút). Hết hạn mà chưa xử lý thì message bị mất.
- **Độ trễ thấp**: < 10 ms cho publish và receive.
- Kích thước message tối đa: **1.024 KB (1 MiB)** (xem ghi chú cập nhật bên dưới).
- **At-least-once delivery**: có thể nhận **trùng** message → ứng dụng phải xử lý được trùng lặp (idempotent).
- **Best-effort ordering**: message có thể **sai thứ tự**.

#### Producer

- Gửi message bằng SDK, API **`SendMessage`**.
- Message được lưu (persist) trong queue tới khi consumer đọc và **xoá** (đánh dấu đã xử lý), hoặc tới khi hết retention.
- Ví dụ: gửi message chứa order id, customer id, địa chỉ… để xử lý đơn hàng "theo nhịp của mình".

#### Consumer

- Là ứng dụng **bạn tự viết**, chạy trên **EC2**, **server on-premises**, hoặc **AWS Lambda**.
- Mỗi lần poll nhận **tối đa 10 message**.
- Xử lý message (ví dụ insert vào RDS), sau đó gọi **`DeleteMessage`** để các consumer khác không thấy nữa.
- **Nhiều consumer song song**: mỗi consumer nhận một tập message khác nhau. Nếu message không được xử lý đủ nhanh, consumer khác có thể nhận lại → đó là lý do có *at-least-once* và *best-effort ordering*.
- Muốn tăng throughput xử lý → **thêm consumer** (horizontal scaling).

#### SQS + Auto Scaling Group

- Consumer chạy trên EC2 trong **ASG**, scale theo metric CloudWatch **`ApproximateNumberOfMessages`** (độ dài queue).
- Tạo **CloudWatch Alarm**: khi queue length vượt ngưỡng → tăng capacity của ASG. Đây là mẫu tích hợp **rất hay gặp trong đề thi**.

#### Decouple các tầng ứng dụng

- Ví dụ ứng dụng xử lý video: thay vì front-end vừa nhận request vừa xử lý (chậm website), tách thành:
  - **Front-end** (ASG riêng) nhận request → gửi message vào SQS.
  - **Back-end processing** (ASG riêng) nhận message → xử lý video → lưu vào S3.
- Hai tầng **scale độc lập**, và có thể chọn loại EC2 tối ưu riêng (ví dụ back-end dùng instance có **GPU**).

#### Bảo mật SQS

| Loại | Cách thực hiện |
|---|---|
| Encryption in-flight | HTTPS API |
| Encryption at-rest | **SSE-SQS** (khoá do SQS quản lý, mặc định) hoặc **SSE-KMS** |
| Client-side encryption | Client tự mã hoá/giải mã (SQS không hỗ trợ sẵn) |
| Access control | **IAM policies** điều khiển truy cập SQS API |
| Resource policy | **SQS Access Policy** (giống S3 bucket policy) → cross-account, cho phép SNS/S3… ghi vào queue |

### Kiến thức thực tế

- **Cập nhật 2025:** giới hạn kích thước message SQS đã tăng từ **256 KB** lên **1 MiB** (tháng 8/2025). Video Hands On (quay trước) vẫn nói 256 KB; nhiều đề luyện cũ cũng dùng con số 256 KB. Khi đọc đề, chú ý con số trong đề để suy luận.
- **SSE-SQS được bật mặc định** cho queue mới tạo (từ 2022–2023).
- Xoá message phải dùng **`ReceiptHandle`** (thay đổi mỗi lần nhận), **không phải** `MessageId`.
- Consumer mẫu bằng Python (boto3):

  ```python
  import boto3
  sqs = boto3.client("sqs")
  url = sqs.get_queue_url(QueueName="DemoQueue")["QueueUrl"]

  while True:
      resp = sqs.receive_message(QueueUrl=url, MaxNumberOfMessages=10, WaitTimeSeconds=20)
      for msg in resp.get("Messages", []):
          process(msg["Body"])                       # xử lý idempotent!
          sqs.delete_message(QueueUrl=url, ReceiptHandle=msg["ReceiptHandle"])
  ```

- Producer bằng Node.js (SDK v3):

  ```javascript
  import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
  const sqs = new SQSClient({});
  await sqs.send(new SendMessageCommand({
    QueueUrl: process.env.QUEUE_URL,
    MessageBody: JSON.stringify({ orderId: 123, customerId: "c-1" }),
    MessageAttributes: { type: { DataType: "String", StringValue: "order" } },
  }));
  ```

- **Lambda làm consumer**: dùng **Event Source Mapping** (Lambda tự poll). Nên đặt visibility timeout của queue **≥ 6 lần timeout của Lambda** và bật **`ReportBatchItemFailures`** để chỉ retry những message lỗi trong batch.
- Scale ASG theo SQS: AWS khuyến nghị dùng metric **backlog per instance** (`ApproximateNumberOfMessagesVisible` / số instance) với *target tracking*, thay vì chỉ đếm tổng số message.
- **Chi phí**: tính theo số request (mỗi 64 KB payload tính là 1 request); free tier 1 triệu request/tháng. Batch + long polling giúp giảm chi phí.

### Ghi nhớ cho kỳ thi

- SQS Standard: **unlimited throughput**, **at-least-once**, **best-effort ordering**.
- Retention **mặc định 4 ngày, tối đa 14 ngày**.
- Consumer nhận **tối đa 10 message/lần**, xử lý xong phải **`DeleteMessage`**.
- Scale consumer bằng **ASG + CloudWatch alarm trên `ApproximateNumberOfMessages`**.
- SQS **tự scale** – không cần "pre-warm", không cần tăng capacity.

---

## Bài 3 – SQS Queue Access Policy

### Lý thuyết

- **SQS Access Policy** là **resource policy** (JSON) gắn trực tiếp lên queue, giống **S3 bucket policy**.
- Hai use case chính:

**1. Cross-account access** – EC2 ở account khác cần poll message:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "AWS": ["111122223333"] },
    "Action": ["sqs:ReceiveMessage"],
    "Resource": "arn:aws:sqs:us-east-1:444455556666:queue1"
  }]
}
```

**2. Cho phép S3 Event Notification ghi vào queue:**

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "s3.amazonaws.com" },
    "Action": "sqs:SendMessage",
    "Resource": "arn:aws:sqs:us-east-1:444455556666:EventsFromS3",
    "Condition": {
      "ArnLike":      { "aws:SourceArn": "arn:aws:s3:::bucket1" },
      "StringEquals": { "aws:SourceAccount": "444455556666" }
    }
  }]
}
```

> Trong slide của video, principal là `"AWS": "*"` kèm điều kiện `aws:SourceArn`/`aws:SourceAccount`. Tài liệu AWS hiện nay khuyến nghị dùng `"Service": "s3.amazonaws.com"` như trên.

### Kiến thức thực tế

- Giá trị `Policy` trong `attributes.json` là **chuỗi** chứa JSON đã escape, ví dụ `{"Policy": "{\"Version\":\"2012-10-17\",...}"}`. Với SDK thì đơn giản hơn: `sqs.set_queue_attributes(QueueUrl=url, Attributes={"Policy": json.dumps(policy)})`.
- Nếu queue dùng **SSE-KMS với customer managed key**, S3/SNS còn cần quyền `kms:GenerateDataKey` và `kms:Decrypt` trên **key policy**. Key AWS managed `alias/aws/sqs` **không** cho phép S3/SNS dùng → dùng SSE-SQS hoặc CMK.
- Cross-account: cần **cả hai phía** – resource policy trên queue **và** IAM policy của principal bên account kia cho phép `sqs:ReceiveMessage`.
- Thay vì S3 → SQS trực tiếp, hiện nay có thể dùng **S3 → EventBridge** để định tuyến tới nhiều đích linh hoạt hơn.

### Ghi nhớ cho kỳ thi

- Muốn **S3/SNS ghi vào SQS** hoặc **cross-account** → sửa **SQS Access Policy** (resource policy).
- Action cần cho phép: **`sqs:SendMessage`** (ghi), **`sqs:ReceiveMessage`** (đọc).

---

## Bài 4 – Message Visibility Timeout

### Lý thuyết

- Khi một consumer **nhận (poll)** message, message đó trở nên **vô hình (invisible)** với các consumer khác trong khoảng **visibility timeout**.
- **Mặc định 30 giây**, tối thiểu 0, **tối đa 12 giờ**.
- Trong thời gian này, các `ReceiveMessage` khác **không** trả về message đó.
- Hết timeout mà message **chưa bị xoá** → message "quay lại" queue → consumer khác (hoặc chính nó) nhận lại → **xử lý 2 lần**.
- Nếu consumer biết cần thêm thời gian → gọi API **`ChangeMessageVisibility`** để kéo dài timeout cho message đó.

| Đặt visibility timeout | Hậu quả |
|---|---|
| **Quá cao** (vài giờ) | Consumer crash → phải chờ rất lâu message mới hiện lại để xử lý lại |
| **Quá thấp** (vài giây) | Consumer chưa xử lý xong → message bị nhận lại → **xử lý trùng** |
| **Hợp lý** | Đặt theo thời gian xử lý thông thường + dùng `ChangeMessageVisibility` khi cần thêm |

### Kiến thức thực tế

- Mẫu "heartbeat": với job dài, consumer chạy một thread định kỳ gọi `ChangeMessageVisibility` (ví dụ mỗi 1/2 timeout) cho tới khi xử lý xong.
- `ChangeMessageVisibility` tính từ **thời điểm gọi**, không cộng dồn; tổng thời gian không vượt quá 12 giờ kể từ lần nhận đầu.
- Đặt `VisibilityTimeout=0` cho một message = "trả lại ngay" để consumer khác xử lý.
- Với Lambda ESM: visibility timeout của queue phải **≥ timeout của function** (khuyến nghị ≥ 6 lần), nếu không sẽ bị xử lý trùng.

### Ghi nhớ cho kỳ thi

- Message bị **xử lý nhiều lần** do consumer xử lý **lâu hơn** visibility timeout → **tăng visibility timeout** hoặc dùng **`ChangeMessageVisibility`**.
- Mặc định **30 giây**, tối đa **12 giờ**.

---

## Bài 5 – Dead Letter Queue (DLQ) & Redrive

### Lý thuyết

- Nếu consumer liên tục **thất bại** khi xử lý một message (message lỗi định dạng, bug…), message cứ quay lại queue → **vòng lặp lỗi**.
- Đặt ngưỡng **`maxReceiveCount`** (MaximumReceives): khi message bị nhận quá số lần này → SQS **chuyển** message sang **Dead Letter Queue**.
- DLQ dùng để **debug**: cô lập các message "có vấn đề" (*poison pill*) để phân tích.
- Quy tắc:
  - DLQ của **FIFO queue** phải là **FIFO queue**.
  - DLQ của **Standard queue** phải là **Standard queue**.
  - Message trong DLQ cũng **hết hạn** theo retention → nên đặt retention dài (ví dụ **14 ngày**).
- **Redrive to source**: sau khi kiểm tra và sửa code consumer, **đẩy lại** message từ DLQ về queue gốc để xử lý lại. Consumer không cần biết message từng nằm trong DLQ.

### Kiến thức thực tế

- Redrive bằng API **`StartMessageMoveTask`** (ra mắt 2023) – trước đây chỉ làm được trên console. Hiện tính năng redrive đã hỗ trợ cả FIFO queue.
- **Lưu ý retention với Standard queue:** khi message bị chuyển sang DLQ, **thời điểm enqueue gốc được giữ nguyên** → nếu source queue retention 4 ngày, message đã nằm 3 ngày thì trong DLQ chỉ còn ít thời gian. Vì vậy **retention của DLQ nên dài hơn retention của source queue**. (Với FIFO queue, timestamp được đặt lại khi chuyển sang DLQ.)
- Đặt **CloudWatch Alarm** trên `ApproximateNumberOfMessagesVisible` của DLQ > 0 để được báo ngay khi có poison pill.
- Không đặt `maxReceiveCount = 1` với Lambda/consumer có lỗi tạm thời (throttling, timeout DB) vì message sẽ bị đẩy vào DLQ quá sớm.
- Lambda **asynchronous invocation** và SNS subscription cũng có DLQ / *on-failure destination* riêng (học ở chương Lambda).

### Ghi nhớ cho kỳ thi

- Muốn **debug message xử lý thất bại nhiều lần** → **Dead Letter Queue** (+ redrive policy).
- DLQ cùng loại với source queue (FIFO ↔ FIFO, Standard ↔ Standard).
- Đặt retention DLQ dài (14 ngày).
- Sửa xong lỗi → **Redrive to source**.

---

## Bài 6 – Delay Queue

### Lý thuyết

- **Delay queue** trì hoãn message để consumer **không thấy ngay**, tối đa **15 phút**.
- **Mặc định 0 giây** (message có thể đọc ngay).
- Hai cách đặt:
  - Mức **queue**: thuộc tính *Delivery delay* (`DelaySeconds`) áp dụng cho mọi message.
  - Mức **message**: tham số **`DelaySeconds`** khi gọi `SendMessage` (ghi đè mặc định của queue).

| | Delay Queue (`DelaySeconds`) | Visibility Timeout |
|---|---|---|
| Message bị ẩn khi nào | **Ngay khi được thêm vào queue** | **Sau khi bị một consumer nhận** |
| Mặc định / tối đa | 0 / **15 phút** | 30 giây / **12 giờ** |

### Kiến thức thực tế

- **Per-message delay (`DelaySeconds` trên từng message) không hỗ trợ FIFO queue** – với FIFO chỉ đặt delay ở mức queue.
- Cần trì hoãn lâu hơn 15 phút → dùng **EventBridge Scheduler** hoặc Step Functions (`Wait` state).

### Ghi nhớ cho kỳ thi

- "Consumer chỉ xử lý message **sau X phút** kể từ khi gửi" (X ≤ 15) → **Delay Queue / `DelaySeconds`**.

---

## Bài 7 – Long Polling, Extended Client & các API của SQS

### Lý thuyết

#### Long Polling

- Khi queue **trống**, consumer có thể **chờ** message tới thay vì nhận phản hồi rỗng ngay → **long polling**.
- Lợi ích:
  - **Giảm số API call** → giảm chi phí và CPU.
  - **Giảm độ trễ**: message tới là được trả về consumer ngay.
- Thời gian chờ: **1–20 giây** (nên dùng **20 giây**). Giá trị 0 = **short polling**.
- Bật ở **mức queue** (*Receive message wait time* = `ReceiveMessageWaitTimeSeconds`) hoặc **mức API call** (`WaitTimeSeconds` khi gọi `ReceiveMessage`).

#### SQS Extended Client

- Muốn gửi message **lớn hơn giới hạn** (ví dụ 1 GB)? Dùng **SQS Extended Client** (thư viện **Java**, ý tưởng có thể tự cài ở ngôn ngữ khác):
  1. Producer upload **payload lớn lên S3**.
  2. Gửi vào SQS một **message metadata nhỏ** chứa **con trỏ** tới object S3.
  3. Consumer đọc message nhỏ → tải object lớn từ S3.
- Use case: xử lý video – upload video lên S3, gửi con trỏ qua SQS.

#### Các API cần biết

| API | Ý nghĩa / tham số quan trọng |
|---|---|
| `CreateQueue` | Tạo queue; `MessageRetentionPeriod` đặt thời gian giữ message |
| `DeleteQueue` | Xoá queue **và toàn bộ message** |
| `PurgeQueue` | Xoá **toàn bộ message** trong queue (giữ queue) |
| `SendMessage` | Gửi message; `DelaySeconds` để trì hoãn |
| `ReceiveMessage` | Poll; `MaxNumberOfMessages` (mặc định **1**, tối đa **10**); `WaitTimeSeconds` / `ReceiveMessageWaitTimeSeconds` = long polling |
| `DeleteMessage` | Xoá message sau khi xử lý |
| `ChangeMessageVisibility` | Đổi visibility timeout của message |
| **Batch API** | `SendMessageBatch`, `DeleteMessageBatch`, `ChangeMessageVisibilityBatch` → giảm số API call, giảm chi phí |

### Kiến thức thực tế

- Batch gửi bằng Python:

  ```python
  sqs.send_message_batch(QueueUrl=url, Entries=[
      {"Id": str(i), "MessageBody": f"order-{i}"} for i in range(10)   # tối đa 10 entry/batch
  ])
  ```

  Batch có thể **thành công một phần** → luôn kiểm tra trường `Failed` trong response.
- SQS Extended Client:
  - Java: `amazon-sqs-java-extended-client-lib`; Python: `amazon-sqs-extended-client` (AWS cung cấp); payload qua S3 tới **2 GB**.
  - Nhớ đặt **S3 lifecycle** để dọn object payload, hoặc cấu hình client tự xoá object khi xoá message.
- Short polling chỉ hỏi **một tập con server** của SQS → có thể trả về rỗng dù queue có message ("false empty response"). Long polling hỏi **tất cả server** → loại bỏ hiện tượng này.
- Với **giới hạn mới 1 MiB** (2025), nhiều trường hợp trước phải dùng Extended Client (message 300 KB – 1 MB) nay gửi trực tiếp được. Extended Client vẫn cần cho payload > 1 MiB.

### Ghi nhớ cho kỳ thi

- Consumer gọi API **quá nhiều, nhận rỗng, tốn tiền** → **Long Polling** (`WaitTimeSeconds` 1–20s, khuyến nghị 20).
- Message **vượt giới hạn kích thước** → **SQS Extended Client** (S3 + con trỏ).
- `ReceiveMessage` tối đa **10** message; dùng **Batch API** để giảm chi phí.

---

## Bài 8 – SQS FIFO Queue

### Lý thuyết

#### Đặc điểm

- **FIFO = First In, First Out**: consumer đọc đúng **thứ tự** producer gửi.
- Throughput giới hạn (theo video): **300 msg/s không batch**, **3.000 msg/s có batch**.
- **Exactly-once send**: loại bỏ trùng lặp ngay ở queue nhờ **deduplication ID**.
- Thứ tự được đảm bảo **theo `MessageGroupId`** (tham số **bắt buộc** khi gửi vào FIFO queue).
- Tên queue **phải kết thúc bằng `.fifo`**.

#### Deduplication

- **Khoảng dedup = 5 phút**: gửi trùng trong 5 phút → message thứ 2 bị **từ chối** (nhưng API vẫn trả về thành công).
- Hai cách:

| Cách | Hoạt động |
|---|---|
| **Content-based deduplication** | SQS tính hash **SHA-256 của message body**; cùng body → cùng hash → bị loại |
| **Message Deduplication ID** | Producer tự truyền `MessageDeduplicationId`; trùng ID → bị loại |

#### Message Grouping

- **Cùng một `MessageGroupId`** cho tất cả message → chỉ **1 consumer** xử lý, toàn bộ có thứ tự.
- **Nhiều `MessageGroupId`** khác nhau → thứ tự được đảm bảo **trong từng group**, mỗi group có thể có **consumer riêng** → **xử lý song song**.
- **Không** đảm bảo thứ tự **giữa các group**.
- Ví dụ: dùng **customer ID** làm group ID → message của mỗi khách hàng đúng thứ tự, số consumer song song tối đa = số group.

### Kiến thức thực tế

- **High throughput mode cho FIFO** (`DeduplicationScope=messageGroup`, `FifoThroughputLimit=perMessageGroupId`): throughput tăng lên rất nhiều so với 300/3.000 msg/s (AWS đã nâng hạn mức nhiều lần sau thời điểm quay video, tới hàng chục nghìn TPS tuỳ region). Để tận dụng, cần **phân bổ message đều trên nhiều `MessageGroupId`**.
- Trong một group, khi một message đang "in-flight" (đã nhận, chưa xoá), các message **sau nó cùng group** sẽ **không** được trả về → một message lỗi có thể **chặn cả group** cho tới khi xoá hoặc chuyển sang DLQ.
- Dedup ID nên là ID nghiệp vụ (order ID, idempotency key) để retry an toàn từ producer.
- **Mới (2025): SQS fair queues** – với **Standard queue**, nếu gửi kèm `MessageGroupId`, SQS giảm ảnh hưởng của "noisy neighbor" (một tenant gửi quá nhiều message) mà vẫn giữ throughput của Standard. Đây không phải FIFO (không đảm bảo thứ tự), đề DVA-C02 hiện chưa tập trung vào tính năng này.

### Ghi nhớ cho kỳ thi

- Cần **thứ tự + exactly-once** → **SQS FIFO**.
- **`MessageGroupId`** = thứ tự trong group; **`MessageDeduplicationId`** = chống trùng trong **5 phút**.
- Số consumer song song tối đa = **số MessageGroupId**.
- Tên phải có đuôi **`.fifo`**; FIFO DLQ cũng phải là FIFO.

---

## Bài 9 – Amazon SNS

### Lý thuyết

#### Pub/Sub

- Bài toán: gửi **một** message tới **nhiều** bên nhận. Nếu tích hợp trực tiếp (buying service gửi email, gửi fraud service, gửi shipping service, gửi SQS…) thì mỗi lần thêm bên nhận lại phải viết thêm tích hợp → cồng kềnh.
- **Pub/Sub**: producer chỉ **publish** vào **một SNS topic**; topic có nhiều **subscriber**, mỗi subscriber nhận **bản sao** của message (trừ khi dùng **message filtering**).
- Giới hạn (tham khảo, đề không hỏi): **12.500.000+ subscription/topic**, **100.000 topic/account** (có thể xin tăng).

#### Subscriber của SNS

- **Email**, **Email-JSON**
- **SMS** và **mobile push notification**
- **HTTP / HTTPS endpoint**
- Dịch vụ AWS: **SQS**, **Lambda**, **Amazon Data Firehose** (→ S3, Redshift…)
- **Không** có Kinesis Data Streams trong danh sách subscriber.

#### Nguồn gửi vào SNS

- Rất nhiều dịch vụ AWS gửi notification vào SNS: **CloudWatch Alarms**, **ASG notifications**, **CloudFormation** state changes, **AWS Budgets**, **S3 events**, **DMS**, **Lambda**, **DynamoDB**, **RDS events**…

#### Cách publish

- **Topic publish** (SDK): tạo topic → tạo subscription → `Publish` vào topic → mọi subscriber nhận.
- **Direct publish** (mobile apps SDK): tạo **platform application** → tạo **platform endpoint** → publish vào endpoint. Hỗ trợ Google (GCM/FCM), Apple **APNS**, Amazon **ADM**.

#### Bảo mật SNS (giống SQS)

- In-flight encryption (HTTPS), at-rest encryption bằng **KMS**, client-side encryption (client tự lo).
- **IAM policies** điều khiển SNS API.
- **SNS Access Policy** (resource policy, giống S3 bucket policy) → **cross-account** hoặc cho phép dịch vụ khác (ví dụ **S3 events**) ghi vào topic.

### Kiến thức thực tế

- Publish kèm **message attributes** (để filter) bằng Python:

  ```python
  import boto3, json
  sns = boto3.client("sns")
  sns.publish(
      TopicArn=topic_arn,
      Message=json.dumps({"order": 1036, "product": "pencil", "quantity": 4, "state": "placed"}),
      MessageAttributes={"state": {"DataType": "String", "StringValue": "placed"}},
  )
  ```

- **Cập nhật:** Google **GCM** đã được thay bằng **FCM (Firebase Cloud Messaging)**; SNS hiện hỗ trợ **FCM HTTP v1 API** (API legacy của FCM đã bị Google ngừng).
- SNS **không lưu trữ** message: nếu delivery thất bại sau hết số lần retry, message có thể mất → gắn **DLQ (SQS) cho subscription** (`RedrivePolicy` trên subscription) để giữ lại message không giao được.
- **Delivery retry policy**: SNS tự retry với các endpoint AWS (SQS, Lambda…) nhiều lần; với HTTP(S) có thể tuỳ chỉnh retry policy.
- SMS cần cấu hình *origination identity* và có thể bị giới hạn sandbox ở account mới; hiện AWS đẩy mạnh **AWS End User Messaging** cho SMS/push quy mô lớn. Với email marketing/transactional quy mô lớn nên dùng **Amazon SES**, SNS email phù hợp cho thông báo vận hành.
- Chi phí: tính theo số publish (mỗi 64 KB = 1 request) và theo loại delivery (SQS/Lambda rẻ, SMS đắt nhất).

### Ghi nhớ cho kỳ thi

- **Một message → nhiều receiver** → **SNS** (pub/sub).
- Gửi **email notification** cho người dùng → **SNS**.
- Subscriber hợp lệ: SQS, Lambda, Firehose, HTTP(S), Email, SMS, mobile push. **Kinesis Data Streams không phải** subscriber.

---

## Bài 10 – Fan-out, SNS FIFO & Message Filtering

### Lý thuyết

#### SNS + SQS Fan-out

- Muốn gửi một message tới **nhiều SQS queue**: gửi riêng từng queue dễ gặp vấn đề (app crash giữa chừng, lỗi gửi, thêm queue sau này phải sửa code).
- **Fan-out**: **publish một lần vào SNS topic**, các **SQS queue subscribe** vào topic → mỗi queue nhận một bản.
- Ví dụ: buying service → SNS topic → queue của **fraud service** và queue của **shipping service**.
- Ưu điểm:
  - **Hoàn toàn decoupled**, **không mất dữ liệu**.
  - SQS cung cấp **persistence**, **delayed processing**, **retry**.
  - **Thêm queue** subscriber bất cứ lúc nào.
- Cần cấu hình **SQS Access Policy** cho phép SNS topic **`sqs:SendMessage`** vào queue.
- Hỗ trợ **cross-region delivery**: topic ở region này gửi tới queue ở region khác (nếu policy cho phép).

#### Ứng dụng: S3 Events tới nhiều queue

- Giới hạn của S3 event: với **một tổ hợp event type + prefix** (ví dụ `ObjectCreated` + `images/`) chỉ có **một** event rule.
- Muốn gửi cùng một S3 event tới nhiều đích → **S3 → SNS topic → nhiều SQS queue** (và cả Lambda, email…).

#### SNS → Amazon Data Firehose → S3

- SNS tích hợp trực tiếp với **Firehose** → lưu message từ topic vào **S3** hoặc bất kỳ đích nào Firehose hỗ trợ.

#### SNS FIFO Topic

- Thứ tự theo **`MessageGroupId`**, **deduplication** bằng dedup ID hoặc content-based – giống SQS FIFO.
- Subscriber: **SQS FIFO** và **SQS Standard** queue (video ghi chú "chỉ SQS"; xem cập nhật bên dưới).
- Throughput giới hạn giống SQS FIFO.
- Use case: cần **fan-out + ordering + deduplication** → **SNS FIFO → nhiều SQS FIFO**.

#### Message Filtering

- **Filter policy** (JSON) gắn vào **subscription**, lọc message được gửi tới subscription đó.
- Subscription **không** có filter policy → nhận **mọi** message (mặc định).
- Ví dụ: buying service gửi giao dịch `{order: 1036, product: "pencil", qty: 4, state: "placed"}`:
  - Queue *Placed orders* với filter `state = placed`.
  - Queue *Cancelled orders* với filter `state = cancelled`; email subscription cũng dùng filter cancelled.
  - Queue *Declined orders* với filter `state = declined`.
  - Một queue không filter → nhận tất cả.

Filter policy ví dụ:

```json
{
  "state": ["placed"]
}
```

### Kiến thức thực tế

- Tạo fan-out bằng CLI:

  ```bash
  QUEUE_ARN=arn:aws:sqs:us-east-1:123456789012:shipping-queue
  aws sns subscribe --topic-arn "$TOPIC_ARN" --protocol sqs --notification-endpoint "$QUEUE_ARN" \
    --attributes '{"RawMessageDelivery":"true","FilterPolicy":"{\"state\":[\"placed\"]}"}'
  ```

  Và policy trên queue:

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": { "Service": "sns.amazonaws.com" },
      "Action": "sqs:SendMessage",
      "Resource": "arn:aws:sqs:us-east-1:123456789012:shipping-queue",
      "Condition": { "ArnEquals": { "aws:SourceArn": "arn:aws:sns:us-east-1:123456789012:MyFirstTopic" } }
    }]
  }
  ```

- **Raw message delivery**: mặc định SNS bọc message trong JSON envelope (`Type`, `MessageId`, `TopicArn`, `Message`…). Bật `RawMessageDelivery` để SQS/HTTP nhận đúng body gốc.
- **Filter policy scope**: mặc định lọc theo **message attributes**; có thể đặt `FilterPolicyScope = MessageBody` để lọc theo **nội dung JSON của body**. Filter hỗ trợ prefix, numeric range, `anything-but`, `exists`…:

  ```json
  { "state": [{ "anything-but": "placed" }], "quantity": [{ "numeric": [">", 10] }] }
  ```

- **Cập nhật:** SNS FIFO hiện hỗ trợ **cả SQS Standard và SQS FIFO** làm subscriber; giới hạn throughput của SNS FIFO đã được AWS nâng sau thời điểm quay video (tra *Service Quotas* để biết số hiện tại). SNS FIFO còn có tính năng **message archiving & replay**.
- Thay thế/khác biệt: **Amazon EventBridge** cũng làm được fan-out với rule lọc nội dung rất mạnh, nhiều đích hơn; nhưng đề DVA-C02 vẫn hỏi nhiều về SNS + SQS fan-out.

### Ghi nhớ cho kỳ thi

- Gửi cùng message tới **nhiều SQS queue / nhiều ứng dụng** → **SNS + SQS Fan-out** (không có "SQS replication").
- Một S3 event tới nhiều đích → **S3 → SNS → nhiều SQS**.
- Fan-out cần **thứ tự + chống trùng** → **SNS FIFO + SQS FIFO**.
- Chỉ gửi **một phần** message tới một số subscriber → **SNS Message Filtering** (filter policy trên subscription).

---

## Bài 11 – Kinesis Data Streams

### Lý thuyết

#### Tổng quan

- **Kinesis Data Streams (KDS)**: thu thập và lưu trữ **dữ liệu streaming theo thời gian thực**. Từ khoá đề thi: **real-time**.
- Nguồn dữ liệu real-time: **clickstream** website, thiết bị IoT (ví dụ xe đạp kết nối internet), **metrics và logs** của server.
- **Producer**: ứng dụng bạn tự viết (SDK), hoặc **Kinesis Agent** cài trên server (gửi logs/metrics).
- **Consumer**: ứng dụng tự viết (SDK/KCL), **Lambda**, **Amazon Data Firehose**, **Managed Service for Apache Flink**.

#### Tính năng

- **Retention tới 365 ngày** → consumer có thể **reprocess / replay** dữ liệu.
- Dữ liệu đã ghi **không xoá được**, phải chờ hết hạn.
- Record tối đa **10 MB** (use case điển hình vẫn là rất nhiều record nhỏ).
- **Thứ tự** được đảm bảo cho các record có **cùng partition key** (cùng partition key → cùng shard).
- Bảo mật: at-rest **KMS**, in-flight **HTTPS**.
- Producer tối ưu throughput → **Kinesis Producer Library (KPL)**; consumer tối ưu → **Kinesis Client Library (KCL)**.

#### Capacity mode

| | **Provisioned mode** | **On-demand mode** |
|---|---|---|
| Quản lý capacity | Tự chọn **số shard**, scale **thủ công** (tăng/giảm shard) | Không cần quản lý, **tự scale** |
| Throughput | Mỗi shard: **ghi 1 MB/s hoặc 1.000 record/s**, **đọc 2 MB/s** | Mặc định ~**4 MB/s hoặc 4.000 record/s** ghi, tự scale theo throughput quan sát **30 ngày qua** |
| Tính tiền | Theo **shard-giờ** | Theo **stream-giờ** + lượng dữ liệu vào/ra |
| Ví dụ | Cần 10 MB/s ghi → **10 shard** | Tải khó đoán |

### Kiến thức thực tế

- Giải mã nhanh trong CloudShell thay vì web base64:

  ```bash
  aws kinesis get-records --shard-iterator "$IT" --query 'Records[].Data' --output text \
    | tr '\t' '\n' | base64 -d
  ```

- Producer Python:

  ```python
  import boto3, json
  kinesis = boto3.client("kinesis")
  kinesis.put_record(StreamName="DemoStream",
                     Data=json.dumps({"user": "u1", "event": "click"}).encode(),
                     PartitionKey="u1")          # partition key = user id → thứ tự theo user
  ```

- **`ProvisionedThroughputExceededException`**: cách xử lý
  - **Retry với exponential backoff**.
  - **Partition key phân tán tốt** (tránh *hot shard*).
  - **Tăng shard**: **shard splitting** (`SplitShard`) để tách shard nóng, hoặc `UpdateShardCount`; giảm shard bằng **merge** (`MergeShards`).
  - Hoặc chuyển sang **on-demand mode**.
- **Consumer modes**:
  - *Shared (classic) fan-out*: **2 MB/s/shard chia cho tất cả consumer** (pull bằng `GetRecords`, giới hạn 5 lần gọi/s/shard).
  - **Enhanced fan-out**: **2 MB/s/shard cho mỗi consumer**, Kinesis **push** qua `SubscribeToShard` (HTTP/2), độ trễ ~70 ms; tốn thêm phí.
- **KCL**: mỗi shard chỉ được đọc bởi **tối đa 1 KCL worker** tại một thời điểm; KCL lưu checkpoint/lease trong **DynamoDB**. **KCL 3.x** là phiên bản mới (2024); KCL 1.x dựa trên AWS SDK for Java v1 (đã hết hỗ trợ cuối 2025) → nên nâng cấp.
- **Lambda** đọc KDS qua Event Source Mapping: cấu hình batch size, *bisect batch on error*, *on-failure destination*, *parallelization factor* (tới 10 batch song song/shard).
- Retention mặc định **24 giờ**, tăng tối đa **365 ngày** (tốn thêm phí).
- **Cập nhật:** video nói record tối đa **10 MB** – đây là giới hạn mới (AWS nâng từ **1 MB** lên 10 MiB năm 2025). Nhiều đề luyện cũ ghi 1 MB. Lưu ý giới hạn ghi **1 MB/s mỗi shard** vẫn áp dụng. Giới hạn on-demand cũng đã được nâng nhiều lần so với con số 200 MB/s trong video.

### Ghi nhớ cho kỳ thi

- **Real-time streaming / clickstream / IoT / big data** → **Kinesis Data Streams**.
- Mỗi shard: **1 MB/s (1.000 rec/s) vào, 2 MB/s ra**.
- **Cùng partition key → cùng shard → có thứ tự**. Dữ liệu một user bị rải nhiều shard → dùng **user ID làm partition key**.
- Retention **tối đa 365 ngày**, có **replay**.
- Throughput vượt → **thêm shard (split)**, backoff, partition key phân tán. **Không** "liên hệ AWS Support".
- **Enhanced fan-out** = 2 MB/s/shard/**consumer**.
- Số KCL instance tối đa = **số shard**.

---

## Bài 12 – Amazon Data Firehose

### Lý thuyết

- **Amazon Data Firehose** (trước đây: **Kinesis Data Firehose**) gửi dữ liệu từ **nguồn** tới **đích**.
- **Nguồn**: ứng dụng/client (SDK – *Direct PUT*), **Kinesis Agent**, **Kinesis Data Streams** (Firehose pull), **CloudWatch Logs/Events**, **AWS IoT**…
- **Transform (tuỳ chọn)**: dùng **Lambda** để chuyển đổi dữ liệu (ví dụ CSV → JSON).
- **Buffer**: dữ liệu được gom lại rồi **ghi theo batch**.
- **Đích**:
  - AWS: **Amazon S3**, **Amazon Redshift**, **Amazon OpenSearch Service**.
  - Bên thứ 3: Datadog, **Splunk**, New Relic, MongoDB…
  - **Custom HTTP endpoint**.
- **Backup**: ghi **toàn bộ** hoặc **chỉ dữ liệu lỗi** vào một S3 bucket.
- Đặc điểm: **fully managed, serverless, tự scale**, trả tiền theo lượng dùng.
- **Near real-time** (từ khoá đề thi) vì có **buffer** theo **kích thước** hoặc **thời gian** (buffer có thể tắt).
- Định dạng vào: CSV, JSON, Parquet, Avro, text, binary. Có thể **convert sang Parquet/ORC**, **nén gzip/snappy**. Chuyển đổi tuỳ ý → Lambda.

#### Kinesis Data Streams vs Amazon Data Firehose

| | **Kinesis Data Streams** | **Amazon Data Firehose** |
|---|---|---|
| Mục đích | Thu thập dữ liệu streaming | **Nạp (load)** dữ liệu streaming vào đích (S3, Redshift, OpenSearch, 3rd party, HTTP) |
| Code | Tự viết producer & consumer | Fully managed |
| Độ trễ | **Real-time** | **Near real-time** |
| Scaling | Provisioned / On-demand | **Tự động** |
| Lưu trữ | Tới **365 ngày** | **Không lưu trữ** |
| Replay | **Có** | **Không** |

### Kiến thức thực tế

- **Đổi tên:** *Kinesis Data Firehose* → **Amazon Data Firehose** (2/2024). API/CLI vẫn là `firehose`, resource vẫn gọi là *delivery stream* trong API.
- **Cập nhật buffer:** từ cuối 2023, buffer interval có thể đặt **0 giây** (*zero buffering*) cho độ trễ thấp hơn – video nói 60 giây là tối thiểu, điều này đã thay đổi. Buffer size 1–128 MB.
- Đích mới đáng chú ý: **Apache Iceberg Tables** (S3 Tables), **Snowflake**, **OpenSearch Serverless**; nguồn mới: **Amazon MSK**.
- Ghi vào **Redshift**: Firehose ghi tạm vào S3 rồi chạy lệnh `COPY` vào Redshift.
- Lambda transformation phải trả về từng record với `recordId`, `result` (`Ok` / `Dropped` / `ProcessingFailed`) và `data` (base64):

  ```python
  import base64, json
  def handler(event, context):
      out = []
      for r in event["records"]:
          payload = base64.b64decode(r["data"]).decode()
          transformed = json.dumps({"event": payload.strip()}) + "\n"
          out.append({"recordId": r["recordId"], "result": "Ok",
                      "data": base64.b64encode(transformed.encode()).decode()})
      return {"records": out}
  ```

- Gửi Direct PUT bằng SDK: `firehose.put_record_batch(DeliveryStreamName=..., Records=[{"Data": b"..."}])` (tối đa 500 record/batch).

### Ghi nhớ cho kỳ thi

- **Near real-time** + **load vào S3 / Redshift / OpenSearch / Splunk** → **Amazon Data Firehose**.
- Cần **transform** dữ liệu trước khi giao → **Firehose + Lambda**.
- Kiến trúc kinh điển: **Kinesis Data Streams + Data Firehose** để nạp dữ liệu real-time vào S3 và Redshift.
- Firehose **không lưu trữ, không replay**.

---

## Bài 13 – Amazon Managed Service for Apache Flink

### Lý thuyết

- Trước đây tên là **Kinesis Data Analytics for Apache Flink**, nay là **Amazon Managed Service for Apache Flink**.
- **Apache Flink**: framework xử lý **data stream real-time**, viết bằng **Java, SQL, Scala** (và Python).
- Đọc dữ liệu từ **Kinesis Data Streams** hoặc **Amazon MSK** (Managed Streaming for Apache Kafka).
- AWS lo phần hạ tầng: cấp phát compute, **tính toán song song**, **tự động scale**, **backup ứng dụng** bằng **checkpoints và snapshots**.
- Dùng mọi tính năng lập trình của Flink để biến đổi dữ liệu.
- **Lưu ý bẫy đề thi:** Flink đọc được từ **Kinesis Data Streams** nhưng **không đọc từ Amazon Data Firehose**.

### Kiến thức thực tế

- **Cập nhật:** *Kinesis Data Analytics for SQL Applications* (phiên bản SQL cũ) **đã ngừng hỗ trợ** (không tạo mới từ 10/2025, ngừng hoàn toàn đầu năm 2026). Muốn phân tích stream bằng SQL → dùng **Flink SQL / Table API** trên Managed Service for Apache Flink (có **Studio notebooks** dựa trên Zeppelin để chạy SQL tương tác).
- Đề thi cũ (và quiz bên dưới) còn dùng tên **"Kinesis Data Analytics"** → hiểu là Managed Service for Apache Flink.
- Use case: tính toán cửa sổ thời gian (windowing), phát hiện bất thường, aggregate real-time, rồi xuất ra KDS/Firehose/S3/OpenSearch.
- Tính tiền theo **KPU** (Kinesis Processing Unit) theo giờ – không có free tier.

### Ghi nhớ cho kỳ thi

- **Real-time analytics** trên stream → **Managed Service for Apache Flink** (tên cũ Kinesis Data Analytics).
- Nguồn: **KDS** hoặc **MSK**; **không** phải Firehose.

---

## Bài 14 – So sánh SQS, SNS và Kinesis

### Lý thuyết

| | **SQS** | **SNS** | **Kinesis Data Streams** |
|---|---|---|---|
| Mô hình | Consumer **pull** message | **Push** tới nhiều subscriber (pub/sub) | **Pull** (standard) hoặc **push** (enhanced fan-out) |
| Sau khi xử lý | Consumer **xoá** message | Mỗi subscriber nhận **một bản sao** | Dữ liệu **giữ lại** tới khi hết hạn |
| Số consumer | Bao nhiêu worker cũng được, cùng tiêu thụ chung | Tới **12.500.000** subscriber/topic | Nhiều ứng dụng đọc cùng stream |
| Lưu trữ | Tới 14 ngày | **Không lưu trữ** (không giao được có thể mất) | **1–365 ngày**, **replay** được |
| Provision throughput | **Không cần** | **Không cần** | **Provisioned** (tự chọn shard) hoặc **On-demand** |
| Thứ tự | Chỉ với **FIFO queue** | Chỉ với **FIFO topic** | Theo **shard** (partition key) |
| Tính năng riêng | **Delay** từng message | Kết hợp **SQS fan-out**; SNS FIFO + SQS FIFO | Real-time **big data, analytics, ETL** |
| Throughput đọc | – | – | Shared: 2 MB/s/shard; Enhanced: 2 MB/s/shard/**consumer** |

### Ghi nhớ cho kỳ thi

- **Decouple, xử lý job, buffer** → **SQS**.
- **Một → nhiều, thông báo** → **SNS** (kết hợp SQS = fan-out).
- **Real-time, big data, replay, ordering theo key** → **Kinesis Data Streams**.
- **Nạp vào S3/Redshift/OpenSearch, near real-time** → **Data Firehose**.
- **Phân tích real-time** → **Managed Service for Apache Flink**.

---

## Tổng kết chương

| Chủ đề | Điều cần nhớ |
|---|---|
| SQS Standard | Unlimited throughput, at-least-once, best-effort ordering, retention 4 ngày (max 14), message tối đa 1 MiB (đề cũ: 256 KB) |
| Scale consumer | ASG + CloudWatch alarm trên `ApproximateNumberOfMessages` |
| Access Policy | Resource policy cho cross-account, S3/SNS → SQS (`sqs:SendMessage`) |
| Visibility Timeout | Mặc định 30s, max 12h; xử lý trùng → tăng timeout / `ChangeMessageVisibility` |
| DLQ | `maxReceiveCount`; cùng loại queue; retention 14 ngày; redrive to source |
| Delay Queue | 0–15 phút, `DelaySeconds` (queue hoặc message) |
| Long Polling | 1–20s, giảm API call rỗng và độ trễ |
| Extended Client | Payload lớn lưu S3, SQS chứa con trỏ |
| API | `MaxNumberOfMessages` ≤ 10; batch Send/Delete/ChangeVisibility |
| SQS FIFO | Thứ tự theo `MessageGroupId`, dedup 5 phút (`MessageDeduplicationId` / content-based SHA-256), tên `.fifo`, 300/3.000 msg/s (high-throughput mode cao hơn nhiều) |
| SNS | Pub/sub; subscriber: SQS, Lambda, Firehose, HTTP(S), Email, SMS, mobile (không có KDS) |
| Fan-out | SNS → nhiều SQS; S3 event tới nhiều queue; SNS FIFO + SQS FIFO |
| Message Filtering | Filter policy JSON trên subscription |
| Kinesis Data Streams | Real-time; shard 1 MB/s vào, 2 MB/s ra; partition key → thứ tự; retention ≤ 365 ngày; split shard khi nóng |
| KPL / KCL | Producer / consumer tối ưu; 1 shard ↔ tối đa 1 KCL worker |
| Enhanced fan-out | 2 MB/s/shard/consumer, push |
| Data Firehose | Near real-time, buffer, Lambda transform, đích S3/Redshift/OpenSearch/3rd party/HTTP, không replay |
| Flink | Phân tích real-time từ KDS/MSK (không từ Firehose); tên cũ Kinesis Data Analytics |

---

## Câu hỏi ôn tập

*Nguồn: Quiz – Messaging & Integration Quiz (25 câu). Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Bạn có website thương mại điện tử và đang chuẩn bị cho Black Friday – đợt sale lớn nhất năm, dự kiến traffic tăng 100 lần. Website đang dùng SQS Standard Queue. Bạn cần làm gì để chuẩn bị cho SQS?

- A. Liên hệ AWS Support để "pre-warm" SQS Standard Queue
- B. Bật Auto Scaling cho SQS queue
- C. Tăng capacity của SQS queue
- D. Không cần làm gì, SQS tự động scale

<details><summary>Đáp án</summary>

**D.** SQS là dịch vụ fully managed với throughput và số message không giới hạn, tự scale; không có khái niệm pre-warm, auto scaling hay capacity cho queue. (Việc cần làm là đảm bảo **consumer** scale kịp, ví dụ ASG theo độ dài queue.)
</details>

**Câu 2.** Cấu hình thế nào để message SQS chỉ được consumer xử lý **sau 5 phút** kể từ khi được gửi vào queue?

- A. Tăng tham số `DelaySeconds`
- B. Thay đổi Visibility Timeout
- C. Bật Long Polling
- D. Dùng Amazon SQS Extended Client

<details><summary>Đáp án</summary>

**A.** Delay Queue giữ message mới **vô hình** với consumer ngay từ khi được thêm vào queue (mặc định 0, tối đa 15 phút). Visibility Timeout chỉ ẩn message **sau khi** đã bị consumer nhận (mặc định 30s, tối đa 12h). Long Polling giảm phản hồi rỗng. Extended Client dùng cho message lớn (tới 2 GB qua S3).
</details>

**Câu 3.** Mỗi consumer poll 10 message một lần và xử lý xong trong 1 phút. Sau một thời gian, bạn thấy cùng một message được các consumer khác nhau nhận, dẫn tới xử lý nhiều lần. Bạn nên làm gì?

- A. Bật Long Polling
- B. Thêm tham số `DelaySeconds` khi gửi message
- C. Tăng Visibility Timeout
- D. Giảm Visibility Timeout

<details><summary>Đáp án</summary>

**C.** Visibility timeout mặc định 30s nhỏ hơn thời gian xử lý (1 phút) nên message hiện lại và bị consumer khác nhận. Tăng visibility timeout cho consumer đủ thời gian xử lý và xoá message, tránh đọc trùng.
</details>

**Câu 4.** Một nhóm EC2 (consumer) trong Auto Scaling Group xử lý message từ SQS Standard Queue. Gần đây nhiều message bị xử lý hai lần, và điều tra cho thấy các message này không thể xử lý thành công. Làm sao để debug lý do các message này thất bại?

- A. SQS Standard Queue
- B. SQS Dead Letter Queue
- C. SQS Delay Queue
- D. SQS FIFO Queue

<details><summary>Đáp án</summary>

**B.** DLQ là nơi các source queue chuyển những message không xử lý được sang, giúp **cô lập** message lỗi để debug. Standard queue không đảm bảo thứ tự/exactly-once; Delay queue chỉ trì hoãn; FIFO đảm bảo thứ tự và không trùng nhưng không giúp debug.
</details>

**Câu 5.** Loại SQS queue nào cho phép message được xử lý **đúng một lần và theo thứ tự**?

- A. SQS Standard Queue
- B. SQS Dead Letter Queue
- C. SQS Delay Queue
- D. SQS FIFO Queue

<details><summary>Đáp án</summary>

**D.** FIFO queue giữ nguyên thứ tự gửi/nhận, mỗi message được giao một lần và tồn tại tới khi consumer xử lý và xoá; không có message trùng lặp được đưa vào queue.
</details>

**Câu 6.** Bạn có 3 ứng dụng khác nhau cần nhận **cùng một message**, cả 3 đều dùng SQS. Cách tốt nhất là gì?

- A. Dùng tính năng SQS Replication
- B. Dùng mẫu SNS + SQS Fan-out
- C. Gửi message riêng lẻ tới 3 SQS queue

<details><summary>Đáp án</summary>

**B.** Gửi một message vào SNS topic rồi "fan-out" tới nhiều SQS queue: hoàn toàn decoupled, không mất dữ liệu, dễ thêm queue (ứng dụng) về sau. A: không tồn tại tính năng này. C: không phải mẫu phổ biến, khó scale.
</details>

**Câu 7.** Kinesis data stream có 6 shard (provisioned), thường nhận 5 MB/s và xuất 8 MB/s. Thỉnh thoảng traffic tăng gấp đôi và bạn gặp `ProvisionedThroughputExceededException`. Cách khắc phục?

- A. Bật Kinesis Replication
- B. Thêm shard
- C. Dùng SQS làm buffer trước Kinesis

<details><summary>Đáp án</summary>

**B.** Capacity của stream do số shard quyết định: mỗi shard 1 MB/s vào, 2 MB/s ra. 6 shard = 6 MB/s vào, 12 MB/s ra; khi tăng gấp đôi (10 MB/s vào, 16 MB/s ra) thì vượt → cần thêm shard. A: không tồn tại. C: thiết kế không tốt.
</details>

**Câu 8.** Website gửi dữ liệu clickstream (chuỗi click, thời gian, điểm bắt đầu/kết thúc điều hướng) vào Kinesis data stream. Bạn thấy dữ liệu của người dùng không có thứ tự và dữ liệu của một người bị rải trên nhiều shard. Cách khắc phục?

- A. Có quá nhiều shard, chỉ nên dùng 1 shard
- B. Chỉ dùng một consumer và để nó sắp xếp lại dữ liệu
- C. Với mỗi record gửi vào Kinesis, thêm partition key đại diện cho danh tính người dùng

<details><summary>Đáp án</summary>

**C.** Kinesis dùng partition key để quyết định record vào shard nào. Dùng user ID làm partition key → dữ liệu mỗi user vào cùng một shard và có thứ tự. A đảm bảo thứ tự toàn cục nhưng không scale; B cũng không scale.
</details>

**Câu 9.** Dịch vụ AWS nào phù hợp nhất để **phân tích real-time** trên các luồng dữ liệu?

- A. Amazon SQS
- B. Amazon SNS
- C. Amazon Kinesis Data Analytics
- D. Amazon Kinesis Data Firehose

<details><summary>Đáp án</summary>

**C.** Dùng Kinesis Data Analytics với Kinesis Data Streams làm nguồn dữ liệu. **Cập nhật:** dịch vụ này nay là **Amazon Managed Service for Apache Flink**; Firehose nay là Amazon Data Firehose (dùng để nạp dữ liệu, không phải phân tích).
</details>

**Câu 10.** Ứng dụng sinh ra lượng lớn dữ liệu real-time cần nạp vào S3 và Redshift, và dữ liệu cần được biến đổi trước khi tới đích. Kiến trúc nào tốt nhất?

- A. SQS + AWS Lambda
- B. SNS + HTTP Endpoint
- C. Kinesis Data Streams + Kinesis Data Firehose

<details><summary>Đáp án</summary>

**C.** Bộ đôi hoàn hảo để nạp dữ liệu near real-time vào S3 và Redshift; Firehose hỗ trợ biến đổi dữ liệu bằng Lambda. A và B không tích hợp trực tiếp với S3/Redshift.
</details>

**Câu 11.** Đâu **KHÔNG** phải subscriber được SNS hỗ trợ?

- A. Amazon Kinesis Data Streams
- B. Amazon SQS
- C. AWS Lambda
- D. HTTP(S) Endpoint

<details><summary>Đáp án</summary>

**A.** SNS hỗ trợ Kinesis Data **Firehose** (nay là Amazon Data Firehose) nhưng **không** hỗ trợ Kinesis Data Streams.
</details>

**Câu 12.** Dịch vụ AWS nào giúp bạn gửi **email thông báo** tới người dùng?

- A. Amazon SQS kết hợp AWS Lambda
- B. Amazon SNS
- C. Amazon Kinesis

<details><summary>Đáp án</summary>

**B.** A là tự cài lại tính năng có sẵn của SNS. Kinesis tự nó không gửi email; phải nối thêm consumer và rốt cuộc dựng lại thứ giống SNS.
</details>

**Câu 13.** SNS topic có hàng nghìn subscriber, bạn muốn gửi một số message chỉ tới **một số** subscriber nhất định. Tính năng nào của SNS cho phép điều này?

- A. SNS Message Filtering
- B. SNS Access Policy
- C. SNS FIFO Topic

<details><summary>Đáp án</summary>

**A.** Message Filtering (filter policy trên subscription) lọc message gửi tới từng subscription. Access Policy quy định ai được truy cập topic; FIFO topic dùng cho thứ tự/dedup.
</details>

**Câu 14.** Chuẩn bị Black Friday (traffic tăng 100 lần), website dùng SQS Standard queue. Do traffic tăng đột biến, consumer có thể thất bại nhiều lần khi xử lý message trong Visibility Timeout vì giới hạn của database. Bạn nên làm gì thêm để xử lý các message thất bại?

- A. Thêm SQS filter để kiểm tra định dạng message
- B. Triển khai Dead Letter Queue (DLQ) với redrive policy
- C. Tăng Visibility Timeout

<details><summary>Đáp án</summary>

**B.** DLQ + redrive policy (`maxReceiveCount`) đưa các message thất bại nhiều lần sang queue riêng, tránh vòng lặp lỗi; sau khi hệ thống ổn định có thể **redrive** về queue gốc. A: SQS không có "filter". C không giải quyết lỗi do database.
</details>

**Câu 15.** Chi phí SQS rất cao. Kiểm tra kỹ thì thấy consumer poll queue quá thường xuyên và nhận về kết quả rỗng. Bạn nên làm gì?

- A. Giảm số consumer
- B. Bật Long Polling
- C. Tăng Visibility Timeout

<details><summary>Đáp án</summary>

**B.** Long polling (`WaitTimeSeconds` tới 20s) cho consumer chờ message thay vì nhận phản hồi rỗng liên tục → giảm số API call và chi phí.
</details>

**Câu 16.** Giới hạn kích thước message SQS là 256 KB, nhưng bạn muốn gửi message 1 MB. Bạn nên ...

- A. Liên hệ AWS Support để tăng giới hạn kích thước message
- B. Sửa cấu hình queue, đặt kích thước message tối đa 2 MB
- C. Dùng SQS Extended Client Library

<details><summary>Đáp án</summary>

**C.** Extended Client lưu payload trên S3 và gửi con trỏ qua SQS. **Cập nhật 2025:** giới hạn SQS đã tăng lên **1 MiB**, nên message ~1 MB hiện có thể gửi trực tiếp; nhưng với giả định của đề (giới hạn 256 KB) và với payload lớn hơn 1 MiB, đáp án vẫn là Extended Client. Giới hạn này không thể xin tăng qua Support và không đặt được > giới hạn.
</details>

**Câu 17.** Bạn có thể cấu hình SQS queue giữ message tối đa ... ngày.

- A. 4 ngày
- B. 7 ngày
- C. 14 ngày
- D. 30 ngày

<details><summary>Đáp án</summary>

**C.** Retention cấu hình được từ 1 phút tới 14 ngày; mặc định 4 ngày.
</details>

**Câu 18.** Thuộc tính nào của message SQS FIFO cho phép nhiều message cùng nhóm được xử lý theo thứ tự?

- A. `MessageDeduplicationId`
- B. `MessageGroupId`
- C. `MessageHash`
- D. `MessageOrderId`

<details><summary>Đáp án</summary>

**B.** `MessageGroupId` xác định nhóm có thứ tự. C và D không phải thuộc tính của SQS.
</details>

**Câu 19.** Thuộc tính nào của message SQS FIFO ngăn các message có cùng deduplication ID được giao trong khoảng 5 phút?

- A. `MessageDeduplicationId`
- B. `MessageGroupId`
- C. `MessageHash`
- D. `MessageOrderId`

<details><summary>Đáp án</summary>

**A.** `MessageDeduplicationId` chống trùng trong khoảng dedup 5 phút (hoặc dùng content-based deduplication với SHA-256 của body). C và D không tồn tại.
</details>

**Câu 20.** Kinesis Data Stream đang có 6 shard, do ngày sale bạn được yêu cầu split thành 10 shard. Consumer dùng Kinesis Client Library (KCL) chạy trên các EC2. Số EC2 instance tối đa có thể triển khai để xử lý message trong các shard là bao nhiêu?

- A. 1
- B. 6
- C. 10
- D. 20

<details><summary>Đáp án</summary>

**C.** Với KCL, mỗi shard chỉ được đọc bởi một KCL instance; 10 shard → tối đa 10 KCL instance (thêm nữa sẽ ngồi không).
</details>

**Câu 21.** SQS FIFO queue có 10 message group (định nghĩa bởi `MessageGroupID`). Số consumer tối đa có thể tiêu thụ đồng thời là?

- A. 1
- B. 10
- C. 20
- D. Vô hạn

<details><summary>Đáp án</summary>

**B.** Số consumer song song tối đa bằng số `MessageGroupId`, vì mỗi group chỉ được xử lý tuần tự.
</details>

**Câu 22.** Bạn có thể cấu hình Kinesis Data Stream giữ record tối đa ... ngày.

- A. 30 ngày
- B. 90 ngày
- C. 180 ngày
- D. 365 ngày

<details><summary>Đáp án</summary>

**D.** Retention từ 24 giờ (mặc định) tới 365 ngày.
</details>

**Câu 23.** Producer của Kinesis Data Stream thỉnh thoảng gặp `ProvisionedThroughputExceededException`. Các cách sau đều giải quyết được lỗi, **NGOẠI TRỪ**:

- A. Dùng partition key phân tán cao
- B. Retry với exponential backoff
- C. Liên hệ AWS Support để tăng capacity của Kinesis Data Stream
- D. Thêm shard

<details><summary>Đáp án</summary>

**C.** Capacity của KDS do **bạn** quản lý qua số shard (hoặc on-demand mode), không phải xin AWS Support. A tránh hot shard, B xử lý lỗi tạm thời, D tăng capacity.
</details>

**Câu 24.** Dùng gì để tăng throughput đọc của consumer Kinesis Data Streams lên 2 MB/s **mỗi consumer mỗi shard**?

- A. Classic Fan-out Consumer
- B. Enhanced Fan-out Consumer
- C. Kinesis Producer Library (KPL)
- D. AWS SDK

<details><summary>Đáp án</summary>

**B.** Enhanced fan-out cấp riêng 2 MB/s/shard cho từng consumer (push qua `SubscribeToShard`). Classic fan-out chia sẻ 2 MB/s/shard cho tất cả consumer; KPL dành cho producer.
</details>

**Câu 25.** Kinesis Data Stream có một **hot shard** gây nhiều `ProvisionedThroughputExceededException`. Thao tác nào giúp tăng số shard?

- A. Shard Splitting
- B. Merge shards
- C. Không cần làm gì, Kinesis Data Stream tự scale

<details><summary>Đáp án</summary>

**A.** Split shard chia một shard (nóng) thành hai, tăng capacity. Merge shards làm **giảm** số shard. Ở provisioned mode, KDS **không** tự scale (chỉ on-demand mode mới tự điều chỉnh).
</details>

---

[← Chương 18](ch18-aws-cloudformation.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Chương 20 →](ch20-aws-monitoring-audit-cloudwatch-x-ray-.md)
