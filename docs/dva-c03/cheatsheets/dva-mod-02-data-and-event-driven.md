# Tuần 2 – Data và Event-driven

## Mục tiêu

Thiết kế luồng xử lý đơn hàng có khả năng retry, chống trùng và cô lập lỗi.

## DynamoDB phải học sâu

- Partition key, sort key và access pattern.
- Query so với Scan.
- GSI so với LSI.
- Strong và eventual consistency.
- Conditional write, optimistic locking và transaction.
- TTL và Streams.
- On-demand và provisioned capacity.
- Hot partition, throttling, exponential backoff và jitter.
- Batch read/write và unprocessed items.

## Messaging và orchestration

### SQS

- Standard và FIFO.
- Visibility timeout, retention, delay và long polling.
- Message group ID, deduplication ID.
- DLQ, redrive và poison message.
- Partial batch response với Lambda.

### SNS và EventBridge

- SNS fan-out, subscription và filter policy.
- EventBridge bus, rule, target, schedule và archive/replay.
- Chọn SNS khi phát thông báo; chọn EventBridge khi cần định tuyến event theo nội dung và tích hợp rộng.

### Step Functions và Kinesis

- Retry, Catch, Choice, Parallel và Map.
- Standard so với Express workflow.
- Kinesis shard, partition key, consumer và ordering theo shard.

## Lab chính

Mở rộng capstone:

```text
API Gateway → Lambda → DynamoDB
                      ↓ event
                  EventBridge
                      ↓
                SQS → Worker Lambda
                      ↓
                     SNS
```

Yêu cầu:

- Worker idempotent bằng conditional write.
- Retry có backoff.
- Poison message được đưa vào DLQ.
- Có alarm khi DLQ có message.
- SNS dùng filter policy cho ít nhất hai loại thông báo.

## Negative tests

- Gửi cùng một order hai lần.
- Đặt visibility timeout ngắn hơn thời gian xử lý.
- Tạo partition key dồn tải.
- Cho worker luôn ném exception.
- Gửi batch chứa một message lỗi.

## Điều kiện hoàn thành

- Giải thích được delivery semantics và idempotency.
- Phân biệt chính xác Query/Scan, GSI/LSI, SQS FIFO/Standard.
- Redrive được message từ DLQ.
- Đạt ≥60% mixed quiz sau hai tuần.

---

[← Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md)
