# Tuần 1 – AWS Core và Serverless

## Mục tiêu

Xây và triển khai API đầu tiên bằng API Gateway, Lambda và DynamoDB/S3.

## Nội dung phải học

### AWS SDK và credentials

- Region, ARN, account và Availability Zone.
- AWS CLI profiles.
- Credential provider chain.
- SDK clients, pagination, retry và exception handling.
- Không nhúng access key vào source code.

### Lambda

- Handler, runtime, execution role.
- Memory, timeout, environment variables.
- Layer, extension và `/tmp` storage.
- Reserved/provisioned concurrency ở mức khái niệm ban đầu.
- Sync, async và event source mapping.
- Retry, destination và DLQ.

### API Gateway

- REST API và HTTP API.
- Stage, deployment, throttling.
- Lambda proxy integration.
- Request validation và mapping.
- Status code và error response.

### S3

- Bucket policy và object permissions.
- Versioning, lifecycle và event notification.
- Presigned URL.
- Encryption phía server và phía client.

## Lab chính

Xây API `POST /orders`, `GET /orders/{id}`:

1. Tạo Lambda handler.
2. Tạo table DynamoDB.
3. Kết nối API Gateway.
4. Deploy bằng AWS SAM.
5. Gọi API bằng curl/Postman.
6. Viết unit test cho success và validation failure.
7. Log `requestId`, `orderId`, `status` theo JSON.

## Negative tests

- [ ] Xóa quyền DynamoDB khỏi execution role.
- [ ] Đặt timeout Lambda quá thấp.
- [ ] Gửi JSON thiếu trường bắt buộc.
- [ ] Gọi resource ở sai Region.
- [ ] Upload object vượt điều kiện của presigned URL.

Với mỗi lỗi, ghi triệu chứng, telemetry, root cause và fix vào workbook.

## Câu hỏi tự kiểm tra

1. Execution role khác resource policy như thế nào?
2. Khi nào API Gateway trả lỗi trước khi Lambda chạy?
3. Async Lambda retry ra sao và DLQ khác destination thế nào?
4. Presigned URL trao quyền gì và tồn tại bao lâu?
5. Vì sao tăng memory Lambda có thể giảm thời gian chạy?

## Điều kiện hoàn thành

- API được deploy bằng IaC, không chỉ tạo thủ công.
- Có unit test và structured log.
- Tự chẩn đoán được lỗi AccessDenied và timeout.
- Đạt ít nhất 70% bộ 30 câu về Lambda/API Gateway/S3.

---

[← Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md)
