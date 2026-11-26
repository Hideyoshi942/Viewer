# Tự động hóa Phản hồi Sự cố & Vận hành Hướng Sự kiện (Event-Driven Ops)

Domain 5 (**Incident and Event Response** - **14%**) đánh giá khả năng biến cảnh báo thủ công thành quy trình **tự động phát hiện, lọc nhiễu, leo thang (escalation) và tự phục hồi (auto-remediation)** sử dụng EventBridge, CloudWatch Composite Alarms, Systems Manager Incident Manager/OpsCenter và kiến trúc xử lý lỗi bền bỉ.

## 1. Amazon EventBridge trong Vận hành Hướng Sự kiện

**Amazon EventBridge** là xương sống của Event-Driven Ops trên AWS, hỗ trợ:
- **AWS Service Events**: EC2 State Change, CodePipeline State Change, GuardDuty Findings, AWS Health Events, Trusted Advisor, CloudTrail Management Events.
- **Cross-Account & Cross-Region Event Routing**: Gom toàn bộ sự kiện vận hành/bảo mật từ Member Accounts về **Central Ops Event Bus** (cần cấu hình Event Bus Resource Policy ở Central Account).
- **Input Transformer**: Định dạng lại JSON payload của sự kiện thành thông điệp dễ đọc cho Slack/SNS/Email trước khi gửi đi.
- **Archive & Replay**: Lưu trữ sự kiện và phát lại (replay) để debug hoặc khôi phục trạng thái sau khi vá lỗi consumer.
- **Dead-Letter Queue (DLQ) & Retry Policy**: Gắn SQS DLQ cho EventBridge Target để không mất sự kiện khi Lambda/API đích bị lỗi tạm thời.

```json
{
  "source": ["aws.health"],
  "detail-type": ["AWS Health Event"],
  "detail": {
    "service": ["EC2", "RDS"],
    "eventTypeCategory": ["scheduledChange", "issue"]
  }
}
```

> **Exam Tip**: Để tự động xử lý các thông báo bảo trì phần cứng EC2/RDS (như `EC2_INSTANCE_RETIREMENT_SCHEDULED`) xuyên suốt AWS Organizations, hãy bật **AWS Health Organizational View** và cấu hình **EventBridge Rule** bắt `source: ["aws.health"]` kích hoạt **SSM Automation** hoặc **Lambda** để thông báo/thay thế instance chủ động.

## 2. Giảm Nhiễu Cảnh báo với CloudWatch Composite Alarms

Trong hệ thống lớn, một sự cố gốc (root cause) như RDS quá tải có thể kéo theo hàng chục alarm con (CPU cao, Latency cao, HTTP 5xx cao) gây ra **Alarm Storm (Alert Fatigue)**.
- **Composite Alarms** kết hợp nhiều Metric Alarms hoặc Composite Alarms khác bằng toán tử logic (`AND`, `OR`, `NOT`).
- **Alarm Actions Suppression**: Chỉ gửi thông báo PagerDuty/SNS/Incident Manager khi Composite Alarm chuyển sang `ALARM` (tắt action ở các alarm con), hoặc cấu hình `ActionsSuppressor` tạm tắt cảnh báo trong thời gian bảo trì (Maintenance Window).

## 3. Systems Manager Incident Manager & OpsCenter

| Dịch vụ | Chức năng chính | Khi nào chọn trong đề thi? |
| :--- | :--- | :--- |
| **SSM OpsCenter** | Tập hợp các vấn đề vận hành thành **OpsItems** kèm ngữ cảnh (CloudTrail logs, Config history, CloudFormation stack) và đề xuất SSM Automation Runbooks để xử lý. | Quản lý ticket vận hành thường nhật, gom lỗi từ EventBridge/Security Hub/Config vào một nơi. |
| **SSM Incident Manager** | Quản lý sự cố nghiêm trọng (P1/P2): tự động kích hoạt **Response Plan**, gọi trực ca theo **Contacts & Escalation Plans**, tạo phòng chat (**AWS Chatbot** với Slack/Teams), chạy **Runbooks** và xuất **Post-Incident Analysis**. | Cần quy trình on-call escalation tự động, phối hợp nhiều nhóm xử lý sự cố lớn và phân tích sau sự cố (post-mortem). |
| **AWS Chatbot (Amazon Q Developer in chat apps)** | Gửi thông báo giàu ngữ cảnh vào Slack/Microsoft Teams và cho phép chạy lệnh AWS CLI / SSM Runbook trực tiếp từ kênh chat (có phân quyền IAM). | Cần ChatOps tương tác hai chiều từ Slack/Teams mà không cần tự code bot Lambda. |

## 4. Các mẫu Tự phục hồi (Auto-Remediation Patterns)

### Pattern 1: Self-Healing EC2 & Application Issues
- **CloudWatch EC2 Action**: Khi `StatusCheckFailed_System` (lỗi phần cứng AWS) kích hoạt, cấu hình Alarm Action tự động **Recover** EC2 instance (giữ nguyên Instance ID, Private IP, Elastic IP, EBS). Khi `StatusCheckFailed_Instance` (lỗi OS/kernel), cấu hình **Reboot**.
- **Disk Full Auto-Remediation**: CloudWatch Agent đẩy metric `disk_used_percent` → Alarm kích hoạt **EventBridge** → **SSM Automation** chạy lệnh xóa log cũ hoặc gọi `ModifyVolume` tăng dung lượng EBS + `growpart`/`resize2fs`.

### Pattern 2: Xử lý Sự cố trên Event-Driven & Serverless Apps
- **SQS Dead-Letter Queue (DLQ) & DLQ Redrive**:
  - Cấu hình `maxReceiveCount` trên SQS Source Queue để chuyển poison-pill messages sang DLQ, tránh vòng lặp vô hạn.
  - Gắn CloudWatch Alarm trên metric `ApproximateNumberOfMessagesVisible > 0` của DLQ để cảnh báo ngay khi có message lỗi.
  - Sau khi sửa bug consumer, sử dụng **SQS DLQ Redrive** để đẩy ngược message từ DLQ về Source Queue xử lý lại mà không cần viết script thủ công.
- **Lambda Asynchronous Invocation Destinations**: Cấu hình `OnFailure` Destination (SQS/SNS/EventBridge) và `MaximumRetryAttempts` (0-2) để lưu lại ngữ cảnh lỗi đầy đủ (stack trace + payload) thay vì chỉ dùng DLQ cũ.
- **Step Functions Error Handling**: Dùng `Retry` (với `BackoffRate` exponential) và `Catch` để chuyển hướng sang luồng fallback/bồi hoàn (Saga pattern).

## 5. Xử lý Sự cố Root Cause nhanh chóng
- **CloudTrail Lake / CloudTrail Insights**: Phát hiện nhanh bất thường API (VD: tăng đột biến lỗi `AccessDenied` hoặc gọi `TerminateInstances` bất thường).
- **VPC Reachability Analyzer**: Kiểm tra đường đi mạng tĩnh giữa hai ENI (Security Group, NACL, Route Table, TGW) mà không cần gửi gói tin thật.
- **SSM Automation Forensics**: Khi phát hiện EC2 nghi bị xâm nhập, tự động cô lập bằng cách gắn **Quarantine Security Group** (chặn toàn bộ inbound/outbound), tạo **EBS Snapshot** và chụp **Memory Dump** trước khi terminate.

> **Exam Tip**: Nếu câu hỏi nhắc đến việc giảm "alert fatigue" do quá nhiều cảnh báo riêng lẻ bắn ra cùng lúc khi một dịch vụ bị sập, hãy chọn **CloudWatch Composite Alarms**. Nếu cần quản lý lịch trực on-call, escalation plan và tạo tài liệu phân tích sau sự cố (post-incident analysis), hãy chọn **AWS Systems Manager Incident Manager**.

---

[← Bài trước](11-advanced-observability-oam-xray-adot.md) | [Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/11-incident-eventbridge-ops.md) | [Bài tiếp →](13-auto-remediation-incident-manager.md)
