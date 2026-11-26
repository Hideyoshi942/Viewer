# Cheatsheet: Observability, Incident Response & DevSecOps Automation

## 1. Monitoring & Centralized Logging Patterns
| Mục tiêu | Kiến trúc chuẩn DOP-C02 |
| :--- | :--- |
| Thu thập RAM, Disk Space, App Logs trên EC2 | **Unified CloudWatch Agent** (config lưu trong SSM Parameter Store) |
| Đếm số lỗi `500` trong log để bắn Alarm | **CloudWatch Logs Metric Filter** → CloudWatch Alarm |
| Stream log real-time xuyên Account | **CW Logs Subscription Filter** → **CW Logs Destination** (Kinesis Streams/Firehose ở Central Account) |
| Xem Metrics/Logs/Traces đa tài khoản không nhân bản dữ liệu | **CloudWatch Cross-Account Observability (OAM)** (Monitoring Account + Source Accounts) |
| Đẩy Custom Metrics từ Lambda không gây độ trễ API | **CloudWatch Embedded Metric Format (EMF)** |
| Phân tích log lịch sử chi phí thấp nhất | **Kinesis Data Firehose** (chuyển Parquet) → **S3** → **Amazon Athena** |
| Tìm kiếm full-text & dashboard real-time | **Kinesis Data Firehose** → **Amazon OpenSearch Service** (dùng UltraWarm/Cold cho log cũ) |
| Giả lập user kiểm tra API/UI 24/7 khi không có traffic | **CloudWatch Synthetics Canary** |
| Tìm bottleneck xuyên microservices | **AWS X-Ray** (Annotations = indexed để search; Metadata = debug) |

## 2. Event-Driven Ops & Incident Management
- **Giảm Alarm Storm (Alert Fatigue)**: Dùng **CloudWatch Composite Alarms** (`AND` / `OR` / `NOT`) và tắt action ở alarm con.
- **Lịch trực on-call, Escalation Plan & Post-Incident Analysis**: **SSM Incident Manager** + **AWS Chatbot** (Slack/Teams).
- **Quản lý ticket vận hành thường ngày có ngữ cảnh AWS**: **SSM OpsCenter** (OpsItems).
- **Xử lý thông báo bảo trì phần cứng toàn Organization**: **AWS Health Organizational View** → **EventBridge** (`aws.health`) → Lambda/SSM Automation.
- **Tự phục hồi EC2 bị lỗi phần cứng AWS**: CloudWatch Alarm (`StatusCheckFailed_System`) → EC2 Action **Recover** (giữ nguyên IP, Instance ID, EBS).
- **Xử lý poison-pill messages trong SQS**: Cấu hình **SQS DLQ** (`maxReceiveCount`) + Alarm trên `ApproximateNumberOfMessagesVisible > 0` + dùng **DLQ Redrive** sau khi sửa lỗi.

## 3. DevSecOps & Multi-Account Security Matrix
| Yêu cầu bảo mật / tuân thủ | Dịch vụ AWS |
| :--- | :--- |
| **Chặn tuyệt đối** tạo tài nguyên sai Region hoặc tắt CloudTrail ở mọi Member Account | **AWS Organizations SCP** (Preventive Guardrail) |
| **Chặn** CloudFormation tạo tài nguyên vi phạm ngay trước khi provision | **CloudFormation Hooks** / **Control Tower Proactive Controls** |
| **Phát hiện & tự động sửa** cấu hình sai (S3 public, SG mở port 22) | **AWS Config Rules** + **SSM Automation Auto-Remediation** |
| Phát hiện crypto-mining, truy cập từ IP độc hại, credential bị lộ | **Amazon GuardDuty** |
| Quét lỗ hổng CVE liên tục cho EC2, ECR Images, Lambda | **Amazon Inspector** (tích hợp ECR Enhanced Scanning trong CI/CD) |
| Phát hiện dữ liệu nhạy cảm PII trong S3 | **Amazon Macie** |
| Tổng hợp cảnh báo bảo mật (ASFF) & kiểm tra CIS/FSBP tập trung | **AWS Security Hub** |
| Tìm tài nguyên chia sẻ ra ngoài & sinh Least-Privilege IAM Policy từ CloudTrail | **IAM Access Analyzer** |
| Chỉ cho phép Lambda chạy code đã được ký số hợp lệ | **AWS Signer** + **Lambda Code Signing Config (`Enforce`)** |
| Tự động xoay vòng mật khẩu RDS/Aurora không downtime | **AWS Secrets Manager** (Automatic Rotation) |
| Chống sửa đổi/xóa log kiểm toán CloudTrail toàn Org | **Organization Trail** → S3 Log Archive Account + **Log File Validation** + **S3 Object Lock (Compliance Mode)** |

---

[Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md)
