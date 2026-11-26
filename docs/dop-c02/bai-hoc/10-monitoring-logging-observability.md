# Giám sát, Logging Tập trung & Observability trên AWS

Domain 4 (**Monitoring and Logging** - **15%**) kiểm tra khả năng xây dựng hệ thống thu thập log tập trung đa tài khoản, tối ưu chi phí lưu trữ/truy vấn log, theo dõi hiệu năng ứng dụng phân tán (distributed tracing) và chủ động phát hiện lỗi từ góc nhìn người dùng cuối.

## 1. CloudWatch Logs: Metric Filters, Subscription Filters & Logs Insights

### Thu thập OS & Application Metrics
- Mặc định EC2 chỉ gửi hypervisor-level metrics (CPU, Disk I/O, Network) lên CloudWatch.
- Để thu thập **Memory Utilization**, **Disk Space**, **Swap** và file log ứng dụng (`/var/log/nginx/error.log`), bắt buộc cài **Unified CloudWatch Agent** trên EC2/On-Prem và cấu hình file JSON (nên lưu config trong **SSM Parameter Store** và phân phối qua SSM Run Command/State Manager).

### Metric Filters vs Subscription Filters
| Cơ chế | Chức năng chính | Độ trễ | Đích đến (Destination) |
| :--- | :--- | :--- | :--- |
| **Metric Filters** | Quét pattern trong Log Group để trích xuất số liệu thành **Custom CloudWatch Metric** (VD: đếm lỗi `HTTP 500`, `ERROR`) | Gần thời gian thực | CloudWatch Metrics (gắn Alarm) |
| **Subscription Filters** | Stream toàn bộ log khớp pattern ra ngoài xử lý thời gian thực | Thời gian thực (real-time) | **Kinesis Data Streams**, **Kinesis Data Firehose**, **AWS Lambda**, **Amazon OpenSearch** |
| **CloudWatch Logs Insights** | Truy vấn ad-hoc mạnh mẽ trên nhiều Log Groups (tối đa 50 groups), hỗ trợ parse JSON, stats, filter | Theo truy vấn | Console / API / Dashboard |

> **Exam Tip**: Một Log Group chỉ cho phép tối đa **2 Subscription Filters**. Nếu cần stream log xuyên tài khoản (Cross-Account Centralized Logging), hãy tạo **CloudWatch Logs Destination** ở Central Logging Account (gắn với Kinesis Data Streams hoặc Firehose) cùng Resource Policy cho phép các Source Accounts đẩy log vào.

## 2. CloudWatch Cross-Account Observability & Container Insights

- **CloudWatch Cross-Account Observability (OAM)**: Cho phép chỉ định một **Monitoring Account** kết nối liền mạch với nhiều **Source Accounts** (thông qua Sink & Link) để xem tập trung **Metrics, Logs, X-Ray Traces, Application Insights** mà không cần nhân bản dữ liệu.
- **CloudWatch Embedded Metric Format (EMF)**: Cho phép ứng dụng/Lambda ghi log JSON có cấu trúc đặc biệt vào CloudWatch Logs; CloudWatch tự động trích xuất thành Custom Metrics **bất đồng bộ** mà không cần gọi API `PutMetricData` (giảm độ trễ và tránh throttling).
- **CloudWatch Container Insights**: Tự động thu thập metrics/logs ở mức cluster, node, pod/task cho ECS, EKS và Kubernetes.
- **CloudWatch Logs Data Protection**: Tự động phát hiện và che giấu (mask) dữ liệu nhạy cảm PII (email, số thẻ tín dụng, SSN) ngay khi log đang in-transit.

## 3. Centralized Log Analytics: Kinesis Data Firehose, OpenSearch & Athena

### Pattern lưu trữ & phân tích log chuẩn DOP-C02
1. **Tìm kiếm thời gian thực & Dashboard trực quan (ELK/OpenSearch)**:
   - `CloudWatch Logs Subscription Filter` → `Kinesis Data Firehose` → **Amazon OpenSearch Service** (tự động backup log lỗi sang S3).
   - Lưu ý: Dùng **UltraWarm** và **Cold Storage** (Index State Management - ISM) trên OpenSearch để giảm chi phí lưu trữ log cũ.
2. **Phân tích lịch sử chi phí thấp (Serverless Query)**:
   - Đẩy log (ALB Access Logs, CloudTrail, VPC Flow Logs, CloudWatch Logs qua Firehose) về **S3** ở định dạng nén **Parquet/ORC** (Firehose hỗ trợ tự động chuyển JSON → Parquet và phân vùng theo `year/month/day`).
   - Dùng **Amazon Athena** truy vấn trực tiếp trên S3 bằng SQL, kết hợp **S3 Lifecycle** chuyển sang Glacier Instant Retrieval / Deep Archive.

```json
{
  "RoleARN": "arn:aws:iam::111122223333:role/FirehoseDeliveryRole",
  "BucketARN": "arn:aws:s3:::central-logs-archive",
  "Prefix": "app-logs/year=!{timestamp:yyyy}/month=!{timestamp:MM}/day=!{timestamp:dd}/",
  "DataFormatConversionConfiguration": {
    "Enabled": true,
    "OutputFormatConfiguration": {
      "Serializer": { "ParquetSerDe": {} }
    }
  }
}
```

## 4. Distributed Tracing & Proactive Monitoring

### AWS X-Ray & AWS Distro for OpenTelemetry (ADOT)
- **AWS X-Ray** theo dõi request đi qua toàn bộ kiến trúc microservices (API Gateway → Lambda/ECS/EC2 → DynamoDB/RDS/SQS), vẽ **Service Map** để tìm bottleneck và lỗi 4xx/5xx.
- **Annotations** (được đánh index để filter trace trong console, VD: `OrderId`, `CustomerTier`) vs **Metadata** (không được đánh index, dùng để lưu payload debug).
- **Sampling Rules**: Kiểm soát chi phí bằng cách chỉ ghi nhận một tỷ lệ request (mặc định: 1 request/giây đầu tiên + 5% các request tiếp theo).
- Trên **ECS/EKS**, chạy **X-Ray Daemon** hoặc **ADOT Collector** dạng sidecar container.

### CloudWatch Synthetics & RUM
- **CloudWatch Synthetics (Canaries)**: Chạy script Node.js/Python (Puppeteer/Playwright) định kỳ mô phỏng hành trình người dùng (đăng nhập, thanh toán, kiểm tra REST API, kiểm tra chứng chỉ SSL sắp hết hạn) ngay cả khi không có user thật truy cập.
- **CloudWatch RUM (Real User Monitoring)**: Nhúng JS snippet vào frontend để đo hiệu năng thực tế (Core Web Vitals, JS errors, độ trễ theo địa lý) từ trình duyệt người dùng.
- **CloudWatch Anomaly Detection**: Dùng ML tạo dải giá trị bình thường (band) theo mùa vụ ngày/tuần để phát hiện bất thường thay vì đặt ngưỡng tĩnh (static threshold).

> **Exam Tip**: Khi câu hỏi yêu cầu theo dõi lỗi API từ bên ngoài 24/7 kể cả lúc nửa đêm không có traffic và tự động chụp screenshot lỗi giao diện, đáp án là **CloudWatch Synthetics Canary**. Nếu yêu cầu phân tích nút thắt cổ chai giữa các microservices, đáp án là **AWS X-Ray** (hoặc **ADOT**).

---

[← Bài trước](09-multi-region-dr-backup-fis.md) | [Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/09-monitoring-cloudwatch-logs.md) | [Bài tiếp →](11-advanced-observability-oam-xray-adot.md)
