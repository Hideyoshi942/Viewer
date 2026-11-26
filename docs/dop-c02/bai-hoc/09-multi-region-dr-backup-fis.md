# Multi-Region Disaster Recovery, AWS Backup & Chaos Engineering (FIS)

Trong kỳ thi **AWS Certified DevOps Engineer - Professional (DOP-C02)**, Domain 3 yêu cầu kỹ sư DevOps không chỉ biết thiết kế hệ thống chạy trên nhiều Availability Zone (Multi-AZ) mà còn phải tự động hóa **Disaster Recovery (DR)** liên vùng (Multi-Region), quản lý sao lưu tập trung với **AWS Backup**, và chủ động kiểm thử khả năng chịu lỗi bằng **AWS Fault Injection Service (FIS)**.

---

## 1. Bốn Chiến lược Disaster Recovery & RPO/RTO

| Chiến lược DR | RPO (Mất dữ liệu) | RTO (Thời gian khôi phục) | Chi phí | Đặc điểm triển khai AWS |
| :--- | :--- | :--- | :--- | :--- |
| **Backup & Restore** | Giờ (Hours) | Giờ (Hours) | Thấp nhất ($) | AWS Backup Cross-Region Copy, CloudFormation/CDK tạo hạ tầng mới khi có sự cố |
| **Pilot Light** | Phút (Minutes) | Chục phút (10s mins) | Thấp - TB ($$) | DB replica luôn chạy (Aurora Global DB / RDS Read Replica); EC2/ECS scale-up từ 0 khi failover |
| **Warm Standby** | Giây - Phút | Vài phút (Minutes) | Trung bình - Cao ($$$) | Hệ thống tối thiểu luôn chạy (1-2 instance) ở DR Region; Route 53 Failover + Auto Scaling |
| **Multi-Site Active-Active** | ~0 (Real-time) | ~0 (Instant) | Cao nhất ($$$$) | Cả 2 Region cùng phục vụ traffic (Route 53 Weighted/Latency + DynamoDB Global Tables) |

> [!TIP]
> **Exam Tip:** Nếu đề bài yêu cầu **RTO/RPO tính bằng giây** với cơ sở dữ liệu quan hệ, chọn **Amazon Aurora Global Database** (RPO < 1 giây replication, RTO < 1 phút promote). Nếu là NoSQL, chọn **DynamoDB Global Tables** (active-active multi-region).

---

## 2. Route 53 Failover & ARC (Application Recovery Controller)

- **Route 53 Active-Passive Failover:** Cấu hình `Failover` routing policy với **Primary** và **Secondary** records gắn liền **Route 53 Health Checks** (HTTPS/TCP/Calculated/CloudWatch Alarm-based).
- **Health Check cho Private VPC Endpoint:** Route 53 Health Checker nằm ở public internet, không thể ping trực tiếp private IP. Giải pháp chuẩn thi: Tạo **CloudWatch Alarm** dựa trên metric nội bộ, sau đó cấu hình Route 53 Health Check theo dõi trạng thái của CloudWatch Alarm đó.
- **Amazon Route 53 Application Recovery Controller (ARC):** Sử dụng **Routing Control** (trên Data Plane siêu tin cậy) để chuyển hướng traffic giữa các Region/AZ bằng công tắc On/Off, tránh phụ thuộc vào Control Plane APIs khi Region đang gặp sự cố.

---

## 3. AWS Backup Tập trung & Cross-Account / Cross-Region

**AWS Backup** giúp chuẩn hóa backup policy cho EC2, EBS, RDS, Aurora, DynamoDB, EFS, FSx và S3:
- **Backup Plans & Resource Assignments:** Tự động backup theo tag (ví dụ `Backup: Daily`).
- **Cross-Region & Cross-Account Copy:** Tự động sao chép snapshot sang tài khoản Security/Backup riêng biệt (cô lập rủi ro ransomware).
- **AWS Backup Vault Lock:** Bảo vệ bản sao lưu theo cơ chế **WORM (Write-Once-Read-Many)** trong chế độ Compliance Mode — ngay cả Root user cũng không thể xóa trước thời hạn retention.

```json
{
  "Rules": [
    {
      "RuleName": "DailyBackupWithCrossRegionCopy",
      "TargetBackupVaultName": "PrimaryVault",
      "ScheduleExpression": "cron(0 2 ? * * *)",
      "Lifecycle": { "DeleteAfterDays": 35 },
      "CopyActions": [
        {
          "DestinationBackupVaultArn": "arn:aws:backup:us-west-2:222222222222:backup-vault:IsolatedDRVault",
          "Lifecycle": { "DeleteAfterDays": 90 }
        }
      ]
    }
  ]
}
```

---

## 4. Chaos Engineering với AWS Fault Injection Service (FIS)

**AWS FIS** cho phép tiêm lỗi có kiểm soát vào môi trường Staging/Production để xác minh cơ chế Auto Scaling, Circuit Breaker và Failover:
- **Actions phổ biến:** `aws:ec2:terminate-instances`, `aws:ec2:stop-instances`, `aws:rds:failover-db-cluster`, `aws:network:disrupt-connectivity`, `aws:ssm:send-command` (gây CPU/Memory stress).
- **Stop Conditions (Điều kiện dừng an toàn):** Gắn **CloudWatch Alarm** làm Stop Condition; nếu tỷ lệ lỗi HTTP 5xx vượt ngưỡng, FIS lập tức dừng experiment và rollback.
- **Tích hợp CI/CD:** Chạy FIS Experiment Template như một stage trong **CodePipeline** (qua Step Functions hoặc Lambda) sau khi deploy lên môi trường Staging.

---

[← Bài trước](08-resilience-autoscaling-dr-fis.md) | [Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/08-resilience-dr-backup-fis.md) | [Bài tiếp →](10-monitoring-logging-observability.md)
