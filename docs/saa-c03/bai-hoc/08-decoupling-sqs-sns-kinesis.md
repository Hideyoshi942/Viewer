# Decoupling & Messaging — Amazon SQS, SNS, Kinesis Data Streams & Amazon MQ

Trong kiến trúc chịu lỗi (Resilient Architecture), việc tách rời các thành phần (decoupling) giúp hệ thống hấp thụ được các đợt tăng tải đột biến (traffic spikes) mà không làm sập tầng xử lý phía sau.

---

## 1. Amazon SQS (Simple Queue Service)

SQS là dịch vụ hàng đợi tin nhắn (Pull-based / Polling) được quản lý hoàn toàn, hỗ trợ tách rời Microservices và xử lý bất đồng bộ.

| Thuộc tính | SQS Standard Queue | SQS FIFO Queue |
| :--- | :--- | :--- |
| **Throughput** | Gần như **không giới hạn** (unlimited TPS) | Mặc định **300 msg/s** (3,000 msg/s với Batching); High Throughput mode lên tới **30,000+ msg/s** |
| **Thứ tự (Ordering)** | Best-effort (không đảm bảo thứ tự tuyệt đối) | Đảm bảo nghiêm ngặt **First-In-First-Out** theo `MessageGroupId` |
| **Delivery** | **At-Least-Once** (có thể nhận trùng lặp) | **Exactly-Once** processing (Deduplication trong 5 phút) |
| **Tên Queue** | Tự do | Bắt buộc kết thúc bằng **`.fifo`** |

### Các cơ chế quan trọng của SQS khi đi thi SAA-C03
- **Visibility Timeout** (mặc định 30 giây, tối đa 12 giờ): Khoảng thời gian tin nhắn bị ẩn khỏi các consumer khác sau khi một consumer lấy ra xử lý. Nếu xử lý lâu hơn 30s mà không gọi `ChangeMessageVisibility`, tin nhắn sẽ xuất hiện lại và bị xử lý lặp!
- **Long Polling (`ReceiveMessageWaitTimeSeconds` = 1–20 giây)**: Giảm số lượng API call rỗng (Empty Receives) và **giảm chi phí SQS**, đồng thời giảm độ trễ nhận tin nhắn.
- **Dead-Letter Queue (DLQ)**: Lưu các tin nhắn xử lý thất bại quá `maxReceiveCount` lần để debug mà không chặn hàng đợi chính.
- **Delay Queue** (`DelaySeconds` tối đa 15 phút) & **Extended Client Library** (lưu payload > 256 KB lên S3, tối đa 2 GB).

```bash
# Tạo SQS FIFO Queue với Content-Based Deduplication và Long Polling 20s
aws sqs create-queue \
  --queue-name orders-processing.fifo \
  --attributes '{
    "FifoQueue": "true",
    "ContentBasedDeduplication": "true",
    "ReceiveMessageWaitTimeSeconds": "20",
    "VisibilityTimeout": "60"
  }'
```

---

## 2. Amazon SNS (Simple Notification Service) & Fan-Out Pattern

SNS là dịch vụ **Pub/Sub (Push-based)**: một Publisher gửi 1 tin nhắn tới SNS Topic, SNS đẩy đồng thời tới hàng triệu Subscribers (SQS, Lambda, HTTP/HTTPS, Email, SMS, Kinesis Data Firehose).

### Kiến trúc Kinh điển: SNS + SQS Fan-Out Pattern
Khi một sự kiện (VD: đơn hàng mới hoặc upload ảnh lên S3) cần được nhiều dịch vụ độc lập xử lý song song (Billing, Inventory, Analytics) mà không mất dữ liệu:
1. Producer đẩy 1 message vào **SNS Topic**.
2. SNS Topic phân phối tới nhiều **SQS Queues** (mỗi service có 1 queue riêng).
3. Dùng **SNS Message Filtering** (Filter Policy JSON) để mỗi SQS chỉ nhận đúng loại sự kiện cần thiết.
4. Lưu ý: Muốn dùng **SQS FIFO** làm subscriber, SNS Topic cũng phải là **SNS FIFO Topic**.

---

## 3. Amazon Kinesis Data Streams vs Amazon SQS

| Tiêu chí | Amazon SQS | Amazon Kinesis Data Streams |
| :--- | :--- | :--- |
| **Mô hình** | Message Queue (Pull, xóa sau khi xử lý) | Real-time Streaming (Log append-only, lưu 1–365 ngày) |
| **Multiple Consumers** | 1 message chỉ được 1 consumer xử lý (trừ khi kết hợp SNS) | **Nhiều consumer độc lập** cùng đọc lại dữ liệu song song |
| **Replay Data** | Không thể đọc lại message đã xóa | **Có thể replay** dữ liệu trong thời gian retention |
| **Thứ tự** | Chỉ trên FIFO Queue | Theo **Partition Key** trong từng Shard |
| **Throughput** | Tự động scale không giới hạn | Provisioned (1 MB/s in, 2 MB/s out per Shard) hoặc On-Demand |

> [!TIP]
> **Exam Tip (SAA-C03)**:
> - Cần **decouple microservices**, **buffer traffic spikes** hoặc **tích hợp Auto Scaling theo `ApproximateNumberOfMessagesVisible`** -> Chọn **Amazon SQS**.
> - Cần **real-time analytics**, **nhiều ứng dụng cùng đọc 1 luồng dữ liệu**, hoặc **replay events** -> Chọn **Kinesis Data Streams**.
> - Cần **chuyển đổi từ ứng dụng on-premises đang dùng JMS / AMQP / MQTT / ActiveMQ / RabbitMQ** mà không sửa code -> Chọn **Amazon MQ**.

---

[← Bài trước](07-ec2-elb-asg-decoupling.md) | [Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/08-decoupling-messaging.md) | [Bài tiếp →](09-disaster-recovery-backup-ml-services.md)
