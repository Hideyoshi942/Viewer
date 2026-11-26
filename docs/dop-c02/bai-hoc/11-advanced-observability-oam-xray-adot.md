# Advanced Observability: CloudWatch OAM, Logs Insights, EMF, X-Ray & ADOT

Trong kỳ thi **AWS Certified DevOps Engineer - Professional (DOP-C02)**, Domain **Monitoring and Logging** không chỉ dừng ở việc tạo Alarm cơ bản mà đi sâu vào kiến trúc **Cross-Account Observability (OAM)**, tối ưu chi phí ingest custom metrics bằng **Embedded Metric Format (EMF)**, truy vấn log nhanh với **Logs Insights**, phát hiện bất thường bằng **Anomaly Detection / Contributor Insights**, và distributed tracing với **X-Ray** & **ADOT**.

---

## 1. CloudWatch Cross-Account Observability (OAM)

Trong môi trường multi-account, DevOps/SRE team cần một nơi tập trung để xem Metrics, Logs, và X-Ray Traces từ hàng trăm workload accounts mà **không phải copy hay nhân bản dữ liệu** (tránh tốn phí storage/ingest hai lần).

### Kiến trúc CloudWatch OAM (Observability Access Manager)

- **Monitoring Account (Central Account)**: Nơi SRE/DevOps đăng nhập để xem dashboard, chạy Logs Insights query, xem X-Ray Service Map tổng hợp của toàn tổ chức.
- **Source Accounts (Workload Accounts)**: Các tài khoản chứa ứng dụng (EC2, Lambda, ECS, RDS...).
- **Cơ chế Link & Sink**:
  1. Monitoring Account tạo một **Sink** (điểm thu nhận ảo) và gắn Sink Policy cho phép AWS Organization/OUs/Accounts kết nối.
  2. Source Accounts tạo **Link** trỏ tới Sink ARN đó, chọn loại telemetry chia sẻ (`AWS::CloudWatch::Metric`, `AWS::Logs::LogGroup`, `AWS::XRay::Trace`, `AWS::ApplicationInsights::Application`).
  3. **Không phát sinh chi phí nhân bản dữ liệu** cho Metrics và Logs (chỉ trả phí query/dashboard trên Monitoring Account).

> **Exam Tip**: Khi đề bài yêu cầu *"xem tập trung CloudWatch Metrics, Logs và X-Ray Traces từ nhiều AWS accounts trong cùng một AWS Organization trên một màn hình duy nhất, KHÔNG sao chép dữ liệu logs sang S3 hay tạo thêm bản sao log"* -> Chọn **CloudWatch Cross-Account Observability (OAM)** (thay thế cho phương án cũ là CloudWatch Cross-Account Cross-Region Dashboards chỉ xem được metrics hoặc Kinesis Firehose copy logs).

---

## 2. CloudWatch Logs Insights & Embedded Metric Format (EMF)

### A. CloudWatch Logs Insights — Truy vấn phân tích Log tốc độ cao

**Logs Insights** cho phép tìm kiếm, lọc và tổng hợp hàng gigabyte log trong vài giây. Cấu trúc câu lệnh dạng pipeline (`|` nối các lệnh):

```text
fields @timestamp, @message, statusCode, latencyMs
| filter statusCode >= 500 or latencyMs > 2000
| stats count(*) as errorCount, pct(latencyMs, 95) as p95Latency by bin(5m), serviceName
| sort errorCount desc
| limit 20
```

Các hàm quan trọng hay xuất hiện trong đề thi:
- `fields`: Chọn trường hiển thị (`@timestamp`, `@message`, `@logStream`).
- `filter`: Lọc điều kiện (`like /Error/`, `statusCode >= 500`).
- `parse`: Tách chuỗi không có cấu trúc JSON thành các trường tạm thời (`parse @message "user=* action=*" as user, action`).
- `stats`: Tổng hợp (`count()`, `sum()`, `avg()`, `pct(field, 99)`, `bin(5m)`).
- `dedup`: Loại bỏ bản ghi trùng lặp.

### B. CloudWatch Embedded Metric Format (EMF) — Tối ưu chi phí Custom Metrics

Bình thường, để đẩy custom metric từ Lambda/ECS lên CloudWatch, ứng dụng phải gọi API `PutMetricData` (tốn network latency, dễ bị throttling, tốn chi phí API call).

**Embedded Metric Format (EMF)** cho phép ứng dụng **chỉ cần in (print/write) log theo định dạng JSON đặc biệt** ra `stdout` (hoặc CloudWatch Logs agent). CloudWatch Logs sẽ **tự động trích xuất** các giá trị số trong JSON đó thành **CloudWatch Custom Metrics** bất đồng bộ (async)!

```json
{
  "_aws": {
    "Timestamp": 1700000000000,
    "CloudWatchMetrics": [
      {
        "Namespace": "CheckoutService",
        "Dimensions": [["Environment", "PaymentMethod"]],
        "Metrics": [
          { "Name": "OrderValue", "Unit": "None" },
          { "Name": "ProcessingLatency", "Unit": "Milliseconds" }
        ]
      }
    ]
  },
  "Environment": "Production",
  "PaymentMethod": "CreditCard",
  "OrderValue": 149.99,
  "ProcessingLatency": 42,
  "OrderId": "ORD-998811"
}
```

> **Exam Tip**:
> - Đề bài: *"Ứng dụng Lambda lưu lượng cực lớn cần ghi nhận cả high-cardinality log details (OrderId, UserId) lẫn custom business metrics lên CloudWatch mà KHÔNG muốn gọi API `PutMetricData` vì làm tăng latency và dễ bị throttling"* -> Đáp án chuẩn là **CloudWatch Embedded Metric Format (EMF)**.
> - Lưu ý: Trong EMF, bạn có thể log `OrderId` (high cardinality) trong cùng JSON để query bằng **Logs Insights**, nhưng **KHÔNG** đưa `OrderId` vào mảng `Dimensions` (tránh bùng nổ chi phí custom metrics).

---

## 3. CloudWatch Anomaly Detection & Contributor Insights

| Tính năng | Vấn đề giải quyết | Cách hoạt động |
| :--- | :--- | :--- |
| **CloudWatch Anomaly Detection** | Ngưỡng tĩnh (Static Threshold) gây nhiều false positive vào giờ cao điểm hoặc bỏ sót lỗi vào ban đêm | Sử dụng Machine Learning phân tích lịch sử dữ liệu (tối đa 2 tuần) để vẽ **dải kỳ vọng (expected band)** tự động co giãn theo chu kỳ ngày/tuần. Alarm chỉ kêu khi metric vượt ra ngoài dải này |
| **CloudWatch Contributor Insights** | Biết hệ thống đang chậm hoặc lỗi tăng, nhưng không biết **"ai/thực thể nào"** (Top-N IP, CustomerId, API Path) đang gây ra tải/lỗi | Phân tích cấu trúc log (JSON/CLF) theo thời gian thực để tìm **Top-N contributors** (ví dụ: Top 10 IP gây nhiều lỗi 403 nhất, Top 5 DynamoDB partition keys bị throttle nhiều nhất) |

> **Exam Tip**:
> - Metric có tính chu kỳ (ngày cao, đêm thấp, cuối tuần khác ngày thường) và không thể đặt một con số threshold cố định -> **CloudWatch Anomaly Detection**.
> - Tìm **"Top-N offenders / heavy hitters"** từ log (VPC Flow Logs, API Gateway logs, DynamoDB Contributor Insights) -> **CloudWatch Contributor Insights**.

---

## 4. AWS X-Ray & AWS Distro for OpenTelemetry (ADOT)

### A. AWS X-Ray Architecture & Khái niệm cốt lõi

**AWS X-Ray** giúp trace một request đi qua kiến trúc phân tán (API Gateway -> Lambda -> SQS -> ECS -> DynamoDB) để tìm nút thắt cổ chai (latency bottleneck) và nguyên nhân lỗi.

| Khái niệm | Mô tả chi tiết |
| :--- | :--- |
| **X-Ray Daemon / Agent** | Tiến trình chạy ngầm (sidecar trên ECS/EKS, daemon trên EC2, tích hợp sẵn trong Lambda) lắng nghe UDP port **2000** để gom trace data từ SDK và gửi theo batch lên X-Ray API |
| **Segment** | Đại diện cho toàn bộ công việc của một dịch vụ xử lý request (ví dụ: một Lambda invocation hoặc một microservice) |
| **Subsegment** | Chi tiết bên trong một Segment (ví dụ: thời gian gọi truy vấn RDS, thời gian gọi S3 API, thời gian thực thi một hàm nội bộ) |
| **Annotations** | Cặp key-value **ĐƯỢC INDEX (Indexed)** -> Có thể dùng trong **Filter Expressions** để tìm kiếm trace (ví dụ: `annotation.customerTier = "Enterprise"`). Tối đa 50 annotations/trace |
| **Metadata** | Cặp key-value **KHÔNG ĐƯỢC INDEX** -> Dùng để lưu payload debug lớn (JSON request/response), **không thể** dùng để filter/search trace |
| **Sampling Rules** | Kiểm soát tỷ lệ request được trace để tiết kiệm chi phí (Mặc định: **1 request đầu tiên mỗi giây + 5% các request tiếp theo**). Có thể cấu hình ưu tiên trace 100% cho các endpoint quan trọng (vd `/checkout`) |

### B. AWS Distro for OpenTelemetry (ADOT)

**ADOT** là bản phân phối chuẩn **OpenTelemetry (OTel)** được AWS hỗ trợ production-ready. Thay vì khóa chặt code vào vendor-specific SDK (chỉ dùng X-Ray SDK hay chỉ dùng CloudWatch SDK):
- Dev viết instrumentation một lần bằng **OpenTelemetry SDK**.
- **ADOT Collector** (chạy dạng Lambda Layer, ECS Sidecar, EKS DaemonSet, EC2 Agent) thu thập đồng thời cả **Traces, Metrics, Logs** và export ra nhiều đích khác nhau (**AWS X-Ray, CloudWatch Metrics, Amazon Managed Service for Prometheus (AMP), Datadog, Jaeger...**).

```
[App with OTel SDK] --(OTLP)--> [ADOT Collector] ---> AWS X-Ray (Traces)
                                                 ---> CloudWatch / AMP (Metrics)
```

> **Exam Tip**:
> - Khi đề bài hỏi: *"Cần lọc và tìm kiếm các X-Ray traces theo `tenantId` hoặc `orderStatus`"* -> Phải dùng **X-Ray Annotations** (KHÔNG dùng Metadata vì Metadata không được index).
> - Khi đề bài yêu cầu: *"Thu thập traces và metrics bằng chuẩn mở vendor-neutral để gửi đồng thời tới AWS X-Ray và Amazon Managed Service for Prometheus (AMP) hoặc công cụ giám sát thứ 3"* -> Chọn **AWS Distro for OpenTelemetry (ADOT)**.
> - Nếu EC2 hoặc ECS không gửi được trace lên X-Ray: Kiểm tra **IAM Role** của instance/task có quyền `AWSXRayDaemonWriteAccess` (`xray:PutTraceSegments`, `xray:PutTelemetryRecords`) và kiểm tra **X-Ray Daemon** đã chạy trên UDP port 2000 chưa.

---

[← Bài trước](10-monitoring-logging-observability.md) | [Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/10-monitoring-observability-xray.md) | [Bài tiếp →](12-event-driven-incident-response.md)
