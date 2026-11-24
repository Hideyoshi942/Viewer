# Tuần 5 – Troubleshooting và Optimization

## Mục tiêu

Tìm root cause từ logs, metrics và traces; sau đó tối ưu đúng nút thắt.

## Observability

- Logging, monitoring và observability.
- CloudWatch Logs và Logs Insights.
- Metrics, dimensions, custom metrics và EMF.
- Alarm, dashboard và notification.
- Structured logging và correlation ID.
- X-Ray trace, segment, subsegment, annotation và metadata.
- CloudTrail cho lịch sử API activity.
- Health check và readiness probe.

## Optimization

- Lambda reserved/provisioned concurrency.
- Cold start, memory/CPU và package size.
- API Gateway/CloudFront caching.
- ElastiCache ở mức use case.
- DynamoDB partition distribution và throttling.
- SNS subscription filter.
- SQS batch size và visibility timeout.
- SDK timeout, retry, exponential backoff và jitter.
- Service quotas.

## Fault-injection lab

Tạo ít nhất sáu lỗi:

1. Thiếu IAM permission.
2. Lambda timeout.
3. DynamoDB throttling/hot key.
4. Duplicate message.
5. DLQ tăng message.
6. Canary deployment lỗi.

Với mỗi lỗi, ghi:

- Triệu chứng người dùng thấy.
- Metric báo động.
- Log query đã dùng.
- Trace/span bất thường.
- CloudTrail event nếu liên quan control plane.
- Root cause.
- Fix và biện pháp ngăn tái diễn.

## Điều kiện hoàn thành

- Dùng đúng CloudWatch, X-Ray hoặc CloudTrail theo loại câu hỏi.
- Có dashboard và ít nhất ba alarm hữu ích.
- Có một báo cáo root-cause hoàn chỉnh.
- Full mock đầu tiên đạt ≥75%.

---

[← Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md)
