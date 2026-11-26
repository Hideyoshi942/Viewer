# Auto-Remediation, SSM Automation & AWS Systems Manager Incident Manager

Domain 5 (Incident and Event Response) của DOP-C02 tập trung mạnh vào khả năng **tự động phát hiện, cô lập và tự chữa lành (Self-Healing / Auto-Remediation)** mà không cần can thiệp thủ công, đồng thời điều phối quy trình xử lý sự cố lớn qua **Incident Manager** và **OpsCenter**.

---

## 1. Kiến trúc Auto-Remediation Chuẩn AWS

Luồng tự động hóa phản hồi sự cố phổ biến nhất trên AWS:
1. **Detection:** CloudWatch Alarm, GuardDuty Finding, AWS Config Rule (Non-compliant), hoặc AWS Health Event.
2. **Routing:** **Amazon EventBridge Rule** bắt sự kiện theo `source` và `detail-type`.
3. **Execution:** Kích hoạt **SSM Automation Document (Runbook)** hoặc **AWS Lambda / Step Functions** để khắc phục sự cố (ví dụ: đóng port 22 trên Security Group, thu hồi IAM credentials, reboot EC2).

```yaml
# Ví dụ SSM Automation Document (YAML) tự động cô lập EC2 hoặc tắt Public S3 Access
schemaVersion: '0.3'
description: 'Remediate non-compliant Security Group by revoking 0.0.0.0/0 SSH rule'
assumeRole: '{{ AutomationAssumeRole }}'
parameters:
  GroupId:
    type: String
  AutomationAssumeRole:
    type: String
mainSteps:
  - name: RevokeSSHFromWorld
    action: 'aws:executeAwsApi'
    inputs:
      Service: ec2
      Api: RevokeSecurityGroupIngress
      GroupId: '{{ GroupId }}'
      IpPermissions:
        - IpProtocol: tcp
          FromPort: 22
          ToPort: 22
          IpRanges:
            - CidrIp: 0.0.0.0/0
```

---

## 2. Systems Manager OpsCenter vs Incident Manager

| Tính năng | SSM OpsCenter | SSM Incident Manager |
| :--- | :--- | :--- |
| **Mục đích** | Quản lý tập trung các **OpsItems** (cảnh báo vận hành thông thường, lỗi nhỏ) | Điều phối **Sự cố nghiêm trọng (Major Incidents)** cần nhiều đội ngũ tham gia |
| **Kích hoạt** | EventBridge Rule, CloudWatch Alarm, Security Hub | CloudWatch Alarm, EventBridge Rule, hoặc nâng cấp từ OpsItem |
| **Tính năng nổi bật** | Gom nhóm OpsItems liên quan, gợi ý SSM Runbook để xử lý | **Response Plans**, **Escalation Plans**, **On-call Schedules**, ChatOps (Slack/Teams), **Post-Incident Analysis** |

> [!IMPORTANT]
> **Exam Tip:** Khi đề bài nhắc đến **On-call rotation, Escalation policy, ChatOps (AWS Chatbot -> Slack/Teams), và Post-incident analysis**, đáp án chính xác là **AWS Systems Manager Incident Manager**. Nếu chỉ cần gom lỗi từ nhiều nguồn vào một nơi để kỹ sư chạy Runbook xử lý, chọn **SSM OpsCenter**.

---

## 3. Các Kịch bản Auto-Remediation Kinh điển trong DOP-C02

1. **AWS Health Event (EC2 Scheduled Retirement / Maintenance):**
   - EventBridge bắt `aws.health` (`AWS_EC2_INSTANCE_RETIREMENT_SCHEDULED`).
   - Trigger Lambda/SSM Automation: Gỡ instance khỏi Target Group (nếu cần), hoặc thay thế instance mới trong Auto Scaling Group trước ngày retirement.
2. **SQS Dead-Letter Queue (DLQ) & Redrive:**
   - Khi message xử lý thất bại quá `maxReceiveCount`, đẩy vào DLQ.
   - Cấu hình CloudWatch Alarm trên `ApproximateNumberOfMessagesVisible > 0` của DLQ -> gửi SNS/EventBridge để điều tra và dùng **SQS DLQ Redrive** đẩy message về source queue sau khi fix bug.
3. **EC2 Disk Full / Memory Leak:**
   - CloudWatch Agent đẩy metric `disk_used_percent` -> CloudWatch Alarm -> EventBridge -> **SSM Run Command** (`AWS-RunShellScript`) xóa file log cũ hoặc mở rộng EBS volume (`ModifyVolume`) mà không cần SSH vào server.

---

[← Bài trước](12-event-driven-incident-response.md) | [Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/12-incident-ssm-remediation.md) | [Bài tiếp →](14-devsecops-compliance-automation.md)
