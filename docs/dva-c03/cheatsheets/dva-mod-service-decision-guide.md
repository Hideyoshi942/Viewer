# Service Decision Guide

## Application integration

| Nếu đề bài cần | Chọn trước | Dấu hiệu phân biệt |
|---|---|---|
| Queue, buffer, decouple consumer | SQS | Consumer chủ động poll |
| Thứ tự nghiêm ngặt, chống trùng | SQS FIFO | Message group/deduplication |
| Push một message đến nhiều subscriber | SNS | Fan-out notification |
| Route event theo nội dung/nhiều SaaS service | EventBridge | Rule, event bus, schema |
| Workflow có trạng thái, retry/catch/branch | Step Functions | Orchestration |
| Stream throughput cao, replay theo retention | Kinesis | Shard và partition key |

## Security

| Nhu cầu | Dịch vụ/khái niệm |
|---|---|
| Đăng ký/đăng nhập người dùng | Cognito User Pool |
| Temporary AWS credentials cho app user | Cognito Identity Pool |
| Temporary role credentials/cross-account | STS AssumeRole |
| Secret có rotation | Secrets Manager |
| Parameter/config đơn giản | Systems Manager Parameter Store |
| Feature flag/config rollout có kiểm soát | AppConfig |
| Quản lý encryption key | KMS |
| Audit ai gọi AWS API | CloudTrail |

## Observability

| Nhu cầu | Chọn |
|---|---|
| Logs, metrics, alarm, dashboard | CloudWatch |
| Distributed trace và service map | X-Ray |
| Lịch sử API/control-plane activity | CloudTrail |
| Tìm log theo truy vấn | CloudWatch Logs Insights |

## DynamoDB

| Cặp khái niệm | Quy tắc nhớ |
|---|---|
| Query / Scan | Query dùng key; Scan đọc rộng và tốn hơn |
| GSI / LSI | GSI khác partition key và tạo/xóa sau; LSI cùng partition key và tạo cùng table |
| Strong / Eventual | Strong mới nhất nhưng chi phí đọc cao hơn; GSI không hỗ trợ strong read |
| Conditional write / Transaction | Conditional bảo vệ một thao tác; transaction gom nhiều thao tác all-or-nothing |
| TTL | Xóa bất đồng bộ, không dùng làm cơ chế xóa tức thời |

## Lambda

| Khái niệm | Dùng khi |
|---|---|
| Reserved concurrency | Giới hạn và dành concurrency cho function |
| Provisioned concurrency | Giảm cold start |
| DLQ | Giữ event async xử lý thất bại |
| Destination | Route kết quả success/failure có thêm context |
| Alias | Tên ổn định trỏ đến version, hỗ trợ traffic shifting |
| Layer | Chia sẻ dependency/code giữa functions |

## Deployment

| Chiến lược | Đặc điểm |
|---|---|
| All-at-once | Nhanh, rủi ro cao |
| Rolling | Thay dần từng nhóm instance |
| Canary | Một phần nhỏ traffic trước |
| Linear | Tăng traffic theo bước đều |
| Blue/green | Hai môi trường, chuyển traffic và rollback nhanh |

---

[← Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md)
