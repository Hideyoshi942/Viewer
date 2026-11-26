# Giám sát, Audit & Quản trị Hệ thống (SAA-C03 Domain 1 & 2)

Khả năng quan sát (**Observability**), kiểm toán (**Auditing**) và quản trị tuân thủ (**Compliance Governance**) là phần không thể thiếu trong mọi kiến trúc chuẩn Well-Architected Framework. Đề thi SAA-C03 thường kiểm tra ranh giới giữa **CloudWatch**, **CloudTrail**, **AWS Config** và **Systems Manager**.

---

## 1. Phân biệt Bộ 3 Cốt lõi: CloudWatch vs CloudTrail vs AWS Config

| Tiêu chí | Amazon CloudWatch | AWS CloudTrail | AWS Config |
| :--- | :--- | :--- | :--- |
| **Câu hỏi trả lời** | **"Hệ thống đang chạy khỏe không?"** (Hiệu năng & Tài nguyên) | **"Ai đã làm gì, vào lúc nào, từ IP nào?"** (API Audit) | **"Tài nguyên đã thay đổi cấu hình như thế nào theo thời gian?"** (Compliance) |
| **Dữ liệu thu thập** | Metrics (CPU, Network, Disk), Logs (App logs), Alarms, Dashboards | Mọi lệnh gọi **AWS API** (Console, CLI, SDK, IAM Role) | Lịch sử trạng thái cấu hình tài nguyên (Security Group, S3 ACL, EBS Encryption) |
| **Mặc định** | Metrics cơ bản 5 phút/lần (Detailed Monitoring = 1 phút/lần, có phí) | Lưu **Event History 90 ngày miễn phí** (Management Events). Muốn lưu lâu hơn/đa Region → Tạo **Trail đẩy về S3** | Không bật mặc định, tính phí theo số Configuration Items & Config Rules |
| **Lưu ý quan trọng** | **EC2 Memory (RAM) & Disk Space Utilization** KHÔNG có sẵn mặc định! Phải cài **CloudWatch Agent** lên EC2 để đẩy Custom Metrics này. | Có thể bật **Log File Validation** (SHA-256 hash) để chứng minh log không bị chỉnh sửa sau khi ghi! | Hỗ trợ **Auto-Remediation** kết hợp **SSM Automation** (ví dụ: tự đóng port 22 nếu ai đó mở `0.0.0.0/0`). |

> **Exam Tip**:
> - Đề bài hỏi: *"Theo dõi RAM usage trên EC2 và tự động gửi cảnh báo khi RAM > 85%"* → Cài **Unified CloudWatch Agent** + tạo **CloudWatch Alarm**.
> - Đề bài hỏi: *"Tìm ra IAM User nào đã xóa một EC2 instance hoặc sửa Security Group vào thứ Ba tuần trước"* → **AWS CloudTrail**.
> - Đề bài hỏi: *"Kiểm tra xem tất cả EBS volumes trong tổ chức có đang được mã hóa hay không và tự động đánh dấu Non-Compliant"* → **AWS Config**.

---

## 2. CloudWatch Logs, Metric Filters & EventBridge Integration

- **CloudWatch Logs**: Gom log từ EC2 (qua CloudWatch Agent), Lambda, API Gateway, VPC Flow Logs, RDS.
  - **Metric Filters**: Đếm số lần xuất hiện từ khóa `ERROR` hoặc `404` trong log để kích hoạt **CloudWatch Alarm**.
  - **Subscription Filters**: Đẩy log real-time sang **Kinesis Data Streams**, **Data Firehose**, hoặc **Lambda** để xử lý/lưu trữ dài hạn trên S3/OpenSearch.
- **CloudWatch Synthetics (Canaries)**: Giả lập người dùng chạy script (Node.js/Python) kiểm tra định kỳ các endpoint Web/API để phát hiện lỗi trước khi khách hàng thật gặp phải.
- **CloudWatch Container Insights / Lambda Insights**: Thu thập metrics chi tiết cấp Container/Pod/Function.

---

## 3. AWS CloudTrail: Management Events vs Data Events vs Insights

1. **Management Events** (Mặc định bật, miễn phí 1 bản sao): Các thao tác Control Plane như `CreateBucket`, `RunInstances`, `TerminateInstances`.
2. **Data Events** (Tắt mặc định, có phí): Các thao tác Data Plane tần suất cực cao như **`s3:GetObject`**, **`s3:PutObject`**, **`lambda:InvokeFunction`**, **`dynamodb:PutItem`**.
   - *Exam Trap*: Nếu đề bài yêu cầu *"Ghi log mọi lần đọc/tải từng file object trong S3 bucket để phục vụ kiểm toán"* → Bắt buộc phải bật **CloudTrail Data Events for S3** (hoặc S3 Server Access Logging, nhưng CloudTrail Data Events là chuẩn cho audit tập trung đa tài khoản!).
3. **CloudTrail Insights**: Dùng ML phát hiện hoạt động API bất thường (ví dụ: đột nhiên gọi `ec2:RunInstances` nhiều gấp 100 lần bình thường).
4. **Organization Trail**: Tạo 1 Trail duy nhất ở Management Account để tự động thu thập log của **tất cả Member Accounts** đổ về 1 S3 Bucket tập trung trong Security/Logging Account.

---

## 4. AWS Systems Manager (SSM) — Quản trị Hạ tầng Không cần SSH/Bastion

**AWS Systems Manager (SSM)** là công cụ quản trị tập trung cho cả EC2 và On-premises servers (yêu cầu **SSM Agent** + IAM Role `AmazonSSMManagedInstanceCore`):

| Tính năng SSM | Công dụng thực tế trong SAA-C03 |
| :--- | :--- |
| **Session Manager** | Truy cập shell (Linux/Windows) trực tiếp qua trình duyệt/CLI **không cần mở Port 22/3389, không cần Bastion Host, không cần Public IP**, ghi log toàn bộ câu lệnh vào CloudWatch/S3! |
| **Patch Manager** | Tự động quét và **vá lỗi bảo mật OS (OS Patching)** hàng loạt theo lịch (**Maintenance Windows**) dựa trên Patch Baselines. |
| **Run Command** | Chạy script từ xa đồng loạt trên hàng nghìn EC2 theo Tag (không cần SSH). |
| **Automation** | Chạy Runbooks tự động (ví dụ: AWS Config phát hiện SG mở port 22 → gọi SSM Automation đóng port 22). |
| **Parameter Store** | Lưu trữ cấu hình ứng dụng và secrets (Standard tier miễn phí). |

---

## 5. AWS Control Tower & Service Catalog

- **AWS Control Tower**: Cách nhanh nhất để thiết lập môi trường **Multi-Account Landing Zone** theo chuẩn Best Practices (tự động cấu hình AWS Organizations, IAM Identity Center, CloudTrail tập trung, AWS Config, và các Guardrails có sẵn).
- **AWS Service Catalog**: Cho phép đội ngũ Platform tạo danh mục các sản phẩm hạ tầng đã được duyệt sẵn (CloudFormation templates) để Developer tự triển khai (Self-service) mà không cần cấp quyền IAM rộng để tự tạo VPC/EC2.

---

## 6. Bẫy đề thi SAA-C03 (Exam Traps)
1. **CloudWatch vs CloudTrail**: Hỏi về **hiệu năng (CPU, RAM, Latency, 5xx errors)** → **CloudWatch**. Hỏi về **ai gọi API gì (Who deleted the bucket?)** → **CloudTrail**.
2. **S3 Access Logs vs CloudTrail Data Events**: Cả hai đều ghi lại `GetObject/PutObject`, nhưng **CloudTrail Data Events** chuẩn hóa JSON, tích hợp sẵn multi-account Organization Trail và EventBridge để trigger phản ứng tự động.
3. **Truy cập EC2 trong Private Subnet an toàn nhất**: Luôn chọn **SSM Session Manager** thay vì dựng Bastion Host trong Public Subnet!

---

[← Bài trước](03-kms-cloudhsm-secrets-acm.md) | [Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/04-monitoring-audit-governance.md) | [Bài tiếp →](05-vpc-hybrid-networking.md)
