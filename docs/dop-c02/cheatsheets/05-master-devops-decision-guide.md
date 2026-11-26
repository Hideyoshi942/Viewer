# Master Service Decision Guide & Exam Cram — AWS DOP-C02

Tổng hợp tinh gọn các mẫu kiến trúc, thứ tự Lifecycle Hook và bảng chọn dịch vụ chuẩn **Stephane Maarek** cho kỳ thi **AWS Certified DevOps Engineer - Professional (DOP-C02)**.

## 1. Thứ tự Lifecycle Hooks của AWS CodeDeploy (Hay ra thi nhất!)

| Nền tảng | Thứ tự chạy Hooks chính xác | Lưu ý Exam Tip |
| :--- | :--- | :--- |
| **EC2 / On-Premises (In-Place)** | `ApplicationStop` → `DownloadBundle` → `BeforeInstall` → `Install` → `AfterInstall` → `ApplicationStart` → `ValidateService` | `ApplicationStop` chạy script của **bản cũ** trước khi tải bản mới! |
| **EC2 / On-Premises (Blue/Green)** | `BeforeBlockTraffic` → `BlockTraffic` → `AfterBlockTraffic` → *(cài trên Replacement)* → `BeforeAllowTraffic` → `AllowTraffic` → `AfterAllowTraffic` | Dùng cho zero-downtime + rollback cực nhanh bằng cách chuyển ngược traffic ALB. |
| **Amazon ECS (Blue/Green)** | `BeforeInstall` → `AfterInstall` → **`AfterAllowTestTraffic`** → **`BeforeAllowTraffic`** → `AllowTraffic` → `AfterAllowTraffic` | Chạy smoke test trên Test Listener ở `AfterAllowTestTraffic` trước khi chuyển production traffic! |
| **AWS Lambda (Canary / Linear)** | `BeforeAllowTraffic` → *(Shifting Traffic)* → `AfterAllowTraffic` | Dùng **Lambda Alias**; hook là 1 hàm Lambda khác gọi `codedeploy:PutLifecycleEventHookExecutionStatus`. |

## 2. Bản đồ Chọn Dịch Vụ SDLC, IaC & Vận hành (DevOps Decision Matrix)

| Tình huống trong đề thi DOP-C02 | Dịch vụ / Cơ chế chuẩn | Tránh bẫy |
| :--- | :--- | :--- |
| Triển khai CodePipeline **Cross-Account** (Dev Account → Prod Account) | Artifact S3 Bucket + **KMS Customer Managed Key (CMK)** chia sẻ cho Prod Role + **Cross-Account IAM Role** | **AWS Managed Key (`aws/s3`) KHÔNG chia sẻ được Cross-Account!** |
| Build Docker image trong CodeBuild bị lỗi không chạy được daemon | Bật **`PrivilegedMode: true`** trong CodeBuild project | Đồng thời bật **Local Docker Layer Cache** để tăng tốc build. |
| Rollout **Feature Flag / cấu hình động** không cần redeploy code + tự rollback khi CloudWatch Alarm báo đỏ | **AWS AppConfig** | Tích hợp Validator (JSON Schema / Lambda) trước khi phát hành cấu hình. |
| Chặn cập nhật phá hủy (Delete/Replace) lên Production RDS/EBS khi chạy CloudFormation Update | **CloudFormation Stack Policy** | `DeletionPolicy: Retain` chỉ bảo vệ khi **xóa stack/resource**, không chặn lệnh update ghi đè. |
| Đợi EC2 cài xong app mới đánh dấu CloudFormation Stack `CREATE_COMPLETE` | **`CreationPolicy`** + `cfn-init` + **`cfn-signal`** | Nếu không có `CreationPolicy`, CloudFormation báo xong ngay khi EC2 vừa boot. |
| Tự động deploy Baseline Stack (IAM, Config, GuardDuty) vào **mọi Account mới gia nhập OU** | **CloudFormation StackSets (Service-Managed)** + bật **Automatic Deployment** | Self-Managed yêu cầu tự tạo IAM execution role thủ công ở từng account. |
| Thu thập log từ EC2 **trước khi Auto Scaling Group terminate** instance | **ASG Lifecycle Hook (`EC2_INSTANCE_TERMINATING`)** → EventBridge → SSM Run Command/Lambda → `complete-lifecycle-action` | Trạng thái `Terminating:Wait` mặc định giữ 3600s, có thể gia hạn bằng `record-lifecycle-action-heartbeat`. |
| Giảm thời gian khởi động ứng dụng nặng khi ASG Scale Out | **ASG Warm Pools** (`Stopped` / `Hibernated`) + **EC2 Image Builder** (Golden AMI) | Trả phí EBS rẻ hơn nhiều so với giữ EC2 `Running` 24/7. |
| Thử nghiệm Chaos Engineering (tắt EC2, tăng CPU, ngắt mạng) có điều kiện dừng an toàn | **AWS Fault Injection Service (FIS)** + **CloudWatch Alarm Stop Condition** | Tự động hủy thí nghiệm ngay khi alarm chuyển trạng thái `ALARM`. |
| Giảm **Alert Fatigue** (chỉ báo động khi cả CPU cao VÀ 5xx tăng đồng thời) | **CloudWatch Composite Alarms** | Kết hợp nhiều Metric Alarms bằng logic `AND` / `OR`. |
| Đẩy log CloudWatch theo thời gian thực sang OpenSearch / S3 / Account khác | **CloudWatch Logs Subscription Filter** → Kinesis Data Firehose / Lambda / Cross-Account Destination | `Export to S3` là batch chậm (tới 12 tiếng), không phải real-time! |
| Tự động phát hiện và **tự sửa** tài nguyên sai chuẩn bảo mật (vd: S3 public, SG mở 0.0.0.0/0 port 22) | **AWS Config Rules** + **Auto-Remediation (SSM Automation Runbook)** | Nhanh và chuẩn hóa hơn tự viết cronjob kiểm tra. |

## 3. 8 Quy Tắc Vàng Khi Giải Đề DOP-C02
1. **Cross-Account Observability**: Dùng **CloudWatch Cross-Account Observability (OAM)** để xem tập trung Metrics, Logs, Traces từ hàng trăm Source Accounts ngay tại 1 Monitoring Account (không cần sao chép dữ liệu).
2. **EventBridge vs CloudTrail vs AWS Config**:
   - Phản ứng theo sự kiện API tức thì → **EventBridge Rule** (match CloudTrail API call).
   - Kiểm tra trạng thái tuân thủ theo thời gian + tự sửa → **AWS Config**.
   - Điều tra lịch sử ai gọi API nào → **CloudTrail / CloudTrail Lake**.
3. **SSM Patch Manager**: Dùng **Patch Baselines** + **Patch Groups** (gắn tag `Patch Group`) + **Maintenance Windows** (cài đặt `MaxConcurrency` & `MaxErrors` để tránh sập toàn bộ fleet).
4. **CloudFormation Drift Detection**: Phát hiện thay đổi thủ công ngoài template; để xử lý tài nguyên bị tạo ngoài ý muốn, dùng `Resource Import` hoặc cập nhật lại template.
5. **Cross-Stack Exports (`Fn::ImportValue`)**: Không thể xóa hoặc sửa Output đang được stack khác import — lưu ý khi refactor stack lớn (có thể dùng SSM Parameter Store để giảm coupling).
6. **AWS Backup Vault Lock**: Chế độ **Compliance** tạo bản sao lưu bất biến (**WORM**), chống ransomware xóa backup ngay cả khi kẻ tấn công có quyền Root.
7. **Secrets Manager Rotation không downtime**: Dùng chiến lược **Alternating Users (Dual-User Rotation)** để tạo user phụ trước khi đổi mật khẩu, tránh lỗi kết nối cho app đang chạy.
8. **Amazon Inspector + ECR + CodePipeline**: Quét lỗ hổng container image tự động trên ECR; kết hợp EventBridge chặn đẩy image có lỗ hổng `CRITICAL` lên môi trường Production.

---

[Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md)
