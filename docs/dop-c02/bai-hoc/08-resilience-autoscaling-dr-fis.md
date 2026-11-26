# Kiến trúc Chịu lỗi, Auto Scaling Nâng cao & Disaster Recovery

Domain 3 (**Resilient Cloud Solutions** - **15%**) kiểm tra khả năng thiết kế hệ thống có độ sẵn sàng cao (High Availability), tự động mở rộng thông minh, chịu lỗi đa vùng (Multi-Region DR), sao lưu tập trung và kiểm thử khả năng chịu lỗi bằng Chaos Engineering.

## 1. EC2 Auto Scaling Nâng cao

### Các chiến lược Scaling
- **Target Tracking Scaling**: Giữ metric (CPU, `ALBRequestCountPerTarget`, SQS backlog per instance) quanh giá trị mục tiêu. Dễ cấu hình và được khuyến nghị ưu tiên.
- **Step Scaling**: Phản ứng theo từng nấc vi phạm CloudWatch Alarm (phù hợp khi cần phản ứng phi tuyến tính).
- **Scheduled Scaling**: Scale trước theo lịch đã biết (VD: 8h sáng thứ Hai).
- **Predictive Scaling**: Dùng Machine Learning phân tích dữ liệu lịch sử (tối thiểu 24 giờ, tối ưu 14 ngày) để dự đoán lưu lượng theo chu kỳ ngày/tuần và **scale out trước** khi tải tăng đột biến.

### Warm Pools & Lifecycle Hooks
- **Warm Pools**: Duy trì sẵn một nhóm EC2 đã khởi tạo xong (cài app, tải cache) ở trạng thái `Stopped` hoặc `Hibernated` (chỉ tốn phí EBS). Khi scale out, instance chuyển sang `InService` chỉ trong vài giây thay vì vài phút.
- **Lifecycle Hooks**: Tạm dừng quá trình chuyển trạng thái của instance tại hai điểm:
  - `autoscaling:EC2_INSTANCE_LAUNCHING`: Đợi cài đặt/warm-up hoặc đăng ký dịch vụ xong rồi mới đưa vào Target Group.
  - `autoscaling:EC2_INSTANCE_TERMINATING`: Tạm dừng trước khi terminate để **drain connections**, upload log cuối cùng lên S3 hoặc lưu trạng thái.
  - Luồng xử lý: ASG Lifecycle Hook → **EventBridge** (hoặc SNS/SQS) → **Lambda / SSM Automation** thực thi tác vụ → gọi `autoscaling:CompleteLifecycleAction` (hoặc `RecordLifecycleActionHeartbeat` để gia hạn timeout).

```json
{
  "source": ["aws.autoscaling"],
  "detail-type": ["EC2 Instance-terminate Lifecycle Action"],
  "detail": {
    "AutoScalingGroupName": ["prod-web-asg"]
  }
}
```

### Instance Refresh & Termination Policies
- **Instance Refresh**: Tự động thay thế dần toàn bộ instance trong ASG khi cập nhật Launch Template/Golden AMI, có hỗ trợ `MinHealthyPercentage`, `InstanceWarmup` và **Checkpoint / Bake Time** để kiểm tra trước khi tiếp tục.
- **Scale-In Protection**: Bảo vệ instance đang chạy batch job quan trọng không bị scale-in.

> **Exam Tip**: Nếu ứng dụng có thời gian khởi động 10 phút do tải model/cache lớn và gặp traffic spike đột ngột không dự đoán được, hãy chọn **ASG Warm Pools** (trạng thái `Stopped` hoặc `Hibernated`). Nếu traffic có tính chu kỳ lặp lại hàng ngày/tuần, chọn **Predictive Scaling**.

## 2. Multi-Region Disaster Recovery (RTO & RPO)

| Chiến lược DR | Mô tả | RTO | RPO | Chi phí |
| :--- | :--- | :--- | :--- | :--- |
| **Backup & Restore** | Sao lưu snapshot/S3 sang DR Region, dựng hạ tầng bằng CloudFormation khi có sự cố | Hàng giờ | Hàng giờ | Thấp nhất |
| **Pilot Light** | Data luôn replicate (Aurora Global DB, DynamoDB Global Tables); compute ở DR tắt/0 instance, scale lên khi failover | 10 - 30 phút | Giây - Phút | Thấp |
| **Warm Standby** | Phiên bản thu nhỏ (scaled-down) của toàn bộ stack luôn chạy ở DR Region; scale out khi failover | Vài phút | Giây - Phút | Trung bình |
| **Multi-Site Active-Active** | Cả hai Region đều phục vụ production traffic song song (Route 53 Latency/Weighted + Global DB) | Gần như 0 | Gần như 0 | Cao nhất |

### Route 53 Failover & AWS Global Accelerator
- **Route 53 Health Checks**: Kiểm tra endpoint, CloudWatch Alarm (tránh mở public port cho private resource), hoặc **Calculated Health Check** (kết hợp nhiều health check con theo ngưỡng).
- **Route 53 Application Recovery Controller (ARC)**:
  - **Routing Control**: Chuyển đổi traffic Multi-Region đáng tin cậy qua Data Plane (tránh phụ thuộc Control Plane khi Region gặp sự cố).
  - **Readiness Check**: Liên tục kiểm tra xem DR Region có đủ capacity/quota/autoscaling config tương đương Primary không.
- **AWS Global Accelerator**: Cung cấp 2 static Anycast IP, chuyển hướng traffic sang Region khỏe mạnh trong **< 30 giây** (không bị ảnh hưởng bởi DNS TTL caching như Route 53).

## 3. Data Resilience & AWS Backup

- **Aurora Global Database**: Storage-level replication xuyên Region với độ trễ < 1 giây (RPO ~ 1s), hỗ trợ **Managed Planned Failover** (RPO = 0) và **Switchover**.
- **DynamoDB Global Tables**: Active-active multi-region replication tự động. Kết hợp **PITR (Point-in-Time Recovery)** khôi phục theo từng giây trong 35 ngày.
- **S3 Cross-Region Replication (CRR)**: Yêu cầu bật **Versioning** ở cả source và destination. Bật **S3 Replication Time Control (RTC)** nếu cần SLA 99.99% object replicate trong 15 phút.
- **AWS Backup**: Quản lý chính sách sao lưu tập trung xuyên tài khoản (AWS Organizations) cho EBS, RDS, Aurora, DynamoDB, EFS, FSx, S3.
  - **Cross-Region & Cross-Account Copy**: Sao chép backup sang tài khoản Backup riêng biệt để chống ransomware.
  - **AWS Backup Vault Lock**: Chế độ **Compliance Mode** (WORM - Write Once Read Many) ngăn ngay cả tài khoản Root xóa backup trước thời hạn retention.

## 4. Chaos Engineering với AWS Fault Injection Service (FIS)

- **AWS FIS** cho phép tiêm lỗi có kiểm soát vào môi trường thật (EC2 terminate/stress CPU, RDS failover, mất kết nối mạng AZ, throttle API, EKS pod delete) để kiểm chứng giả thuyết chịu lỗi.
- **Stop Conditions**: Bắt buộc gắn **CloudWatch Alarms** vào Experiment Template; nếu alarm chuyển sang `ALARM`, FIS lập tức dừng thí nghiệm và khôi phục trạng thái.
- Tích hợp **FIS vào CI/CD Pipeline** (chạy thí nghiệm định kỳ trên Staging/GameDay) để đảm bảo kiến trúc DR không bị thoái hóa theo thời gian.

> **Exam Tip**: Khi đề bài yêu cầu chuyển đổi Multi-Region không bị ảnh hưởng bởi DNS cache của client ISP và giữ nguyên IP tĩnh cho firewall whitelist, hãy chọn **AWS Global Accelerator** thay vì chỉ dùng Route 53 Failover Routing.

---

[← Bài trước](07-ssm-fleet-automation-image-builder.md) | [Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/07-resilience-autoscaling-ha.md) | [Bài tiếp →](09-multi-region-dr-backup-fis.md)
