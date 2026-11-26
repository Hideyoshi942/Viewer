# Cheatsheet: Auto Scaling, Resilience, Disaster Recovery & Chaos Engineering (FIS)

Bảng tra cứu nhanh các cơ chế chịu lỗi, Auto Scaling nâng cao, Route 53 Health Checks, AWS Backup Vault Lock và AWS Fault Injection Service (FIS) hay gặp nhất trong **DOP-C02 Domain 3 (15%)**.

---

## 1. EC2 Auto Scaling Lifecycle Hooks

Cho phép **tạm dừng (pause)** quá trình khởi tạo (`Pending:Wait`) hoặc tắt (`Terminating:Wait`) của EC2 instance để chạy tác vụ tùy chỉnh (cài phần mềm nặng, đăng ký vào hệ thống ngoài, tải log cuối lên S3, drain batch job).

```text
Launch ──► Pending ──► [Pending:Wait] ──► Pending:Proceed ──► InService
                              │ (EventBridge / SNS / SQS)
                              ▼
                     Lambda / SSM Run Command
               (gia hạn bằng RecordLifecycleActionHeartbeat)
                              │
                              ▼
                  CompleteLifecycleAction (CONTINUE / ABANDON)

InService ──► [Terminating:Wait] ──► Terminating:Proceed ──► Terminated
```

- **Heartbeat Timeout**: Mặc định **3600 giây (1 giờ)**, tối thiểu 30 giây, tối đa 7200 giây (2 giờ). Có thể gia hạn nhiều lần bằng API **`autoscaling:RecordLifecycleActionHeartbeat`** (tổng thời gian tối đa lên tới **48 giờ** hoặc 100 lần heartbeat).
- **Hoàn tất sớm**: Gọi **`autoscaling:CompleteLifecycleAction`** với `CONTINUE` (tiếp tục) hoặc `ABANDON` (hủy bỏ/terminate).
- **Default Result**: Hành động mặc định (`CONTINUE` hoặc `ABANDON`) khi hết timeout mà không nhận được tín hiệu.

> **Exam Tip**: Khi đề bài yêu cầu *"đẩy log từ disk lên S3 hoặc hoàn tất xử lý tin nhắn đang dở trước khi ASG terminate instance"* → **Lifecycle Hook (`EC2_INSTANCE_TERMINATING`) + EventBridge + SSM Run Command/Lambda + `CompleteLifecycleAction`**.

---

## 2. EC2 Auto Scaling Warm Pools

Giữ sẵn một nhóm EC2 đã chạy xong User Data/cài app ở trạng thái chờ để rút ngắn tối đa thời gian scale-out cho ứng dụng **boot lâu** khi gặp **spike traffic đột ngột**.

| Trạng thái Pool (`PoolState`) | Chi phí Compute (EC2) | Chi phí EBS & RAM | Tốc độ đưa vào `InService` | Khi nào chọn? |
| :--- | :--- | :--- | :--- | :--- |
| **`Stopped`** (Phổ biến nhất) | **Không tốn phí EC2** | Chỉ trả phí EBS volume | Nhanh (vài chục giây — bỏ qua cài đặt app) | Tối ưu nhất giữa **chi phí thấp** và **boot nhanh** cho hầu hết ứng dụng web/API. |
| **`Hibernated`** | **Không tốn phí EC2** | EBS + lưu snapshot RAM xuống EBS root volume | Rất nhanh (giữ nguyên bộ nhớ RAM đã nạp sẵn cache/JVM) | Ứng dụng cần nạp dữ liệu lớn vào RAM trước khi phục vụ (VD: ML model, JVM warmup lâu). |
| **`Running`** | **Trả phí EC2 đầy đủ** | EC2 + EBS | Tức thì (vài giây) | Yêu cầu latency phản hồi scale-out cực thấp (mission-critical), chấp nhận chi phí cao. |

- **Instance Reuse (`ReuseOnScaleIn`)**: Khi ASG scale-in, thay vì terminate instance, trả nó về lại Warm Pool để tái sử dụng cho đợt spike tiếp theo.

> **Exam Tip**: **Warm Pools** giải quyết **spike đột ngột không đoán trước** + **app khởi động chậm**; còn **Predictive Scaling** giải quyết **tải có tính chu kỳ lặp lại** (theo giờ/ngày/tuần).

---

## 3. Scaling Policies, Termination Policies & Instance Refresh

### 3.1. Chọn đúng Auto Scaling Policy

| Loại Scaling Policy | Cơ chế hoạt động | Trường hợp sử dụng chuẩn |
| :--- | :--- | :--- |
| **Target Tracking** | Tự động điều chỉnh capacity để giữ 1 metric ở mức mục tiêu (VD: CPU 60%, `ALBRequestCountPerTarget` = 1000). | **Mặc định khuyến nghị** cho hầu hết ứng dụng web/microservice. Hỗ trợ Custom Metric (VD: SQS backlog per instance). |
| **Step Scaling** | Scale theo nhiều bậc (VD: CPU 60–80% thêm +2, CPU > 80% thêm +5). | Khi cần phản ứng **mạnh tay theo nhiều mức độ** (không có cooldown cứng giữa các step). |
| **Simple Scaling** | Scale 1 lần rồi chờ hết **Cooldown period** mới đánh giá lại. | Legacy — ít dùng, dễ phản ứng chậm. |
| **Predictive Scaling** | Dùng Machine Learning phân tích lịch sử (tối thiểu 24h, tốt nhất 2 tuần) để **scale out trước** giờ cao điểm. | Traffic có **chu kỳ lặp lại rõ rệt** (VD: 9h sáng thứ 2 hàng tuần). Có thể bật chế độ `ForecastOnly` để test trước khi `ForecastAndScale`. |
| **Scheduled Scaling** | Scale theo lịch Cron cố định. | Sự kiện biết chính xác thời gian trước (VD: Flash Sale 00:00 ngày 11/11). |

### 3.2. Termination Policies & Scale-In Protection
- **Thứ tự mặc định (`Default`)**:
  1. Chọn AZ có nhiều instance nhất (cân bằng AZ).
  2. Chọn instance dùng **Launch Template / Launch Configuration cũ nhất** (hoặc `AllocationStrategy` với Mixed Instances).
  3. Chọn instance **gần đến mốc giờ tính tiền tiếp theo nhất** (nếu tính theo giờ) → ngẫu nhiên.
- **Scale-In Protection (`ProtectFromScaleIn`)**: Bật trên từng instance cụ thể đang xử lý batch job / stateful session để ASG **không terminate** nó khi scale-in. (Lưu ý: Scale-In Protection **KHÔNG ngăn** terminate do Unhealthy Health Check hoặc Manual Terminate!).

### 3.3. Instance Refresh (Rolling Update không downtime cho ASG)
Thay thế toàn bộ EC2 trong ASG khi cập nhật Launch Template / Golden AMI mới:
- **`MinHealthyPercentage`** (VD: 90%) & **`MaxHealthyPercentage`** (VD: 110%): Kiểm soát tốc độ thay thế cuốn chiếu mà vẫn đảm bảo đủ capacity.
- **`InstanceWarmup`**: Thời gian chờ instance mới ấm lên trước khi tính vào healthy capacity.
- **`AutoRollback` + CloudWatch Alarms**: Tự động dừng và **rollback** về Launch Template cũ nếu CloudWatch Alarm chuyển sang `ALARM` trong lúc refresh.
- **`Checkpoints`**: Tạm dừng sau các mốc phần trăm (VD: 20%, 50%, 100%) để kiểm tra canary trước khi tiếp tục.

---

## 4. Route 53 Health Checks & Multi-Region Failover

| Loại Health Check | Cách hoạt động | Use Case điển hình |
| :--- | :--- | :--- |
| **Endpoint Health Check** | Route 53 health checkers (từ nhiều vùng toàn cầu) gửi HTTP/HTTPS/TCP request tới public IP/domain. | Kiểm tra ALB/CloudFront/EC2 public endpoint. |
| **Calculated Health Check** | Kết hợp trạng thái của nhiều child health checks (tối đa 256) theo ngưỡng (VD: khỏe nếu ≥ 2/3 child khỏe). | Tránh false-positive failover khi chỉ 1 trong nhiều thành phần nhỏ gặp sự cố tạm thời. |
| **CloudWatch Alarm Health Check** | Theo dõi trạng thái của một **CloudWatch Alarm** (thay vì gọi trực tiếp endpoint). | **Kiểm tra tài nguyên Private bên trong VPC** (RDS, Private ALB, on-prem) mà Route 53 public health checker không gọi tới được! |

> **Exam Tip**:
> - Muốn Route 53 Health Check kiểm tra dịch vụ nằm trong **Private Subnet** → xuất metric về CloudWatch → tạo CloudWatch Alarm → tạo **Route 53 Health Check trỏ tới CloudWatch Alarm** đó.
> - Để failover giữa 2 Region nhanh hơn nữa (giảm phụ thuộc DNS TTL caching) → cân nhắc **AWS Global Accelerator** (Anycast Static IP, tự động chuyển hướng traffic trong < 30 giây).

---

## 5. AWS Backup & Backup Vault Lock (Chống Ransomware)

- **AWS Backup** tập trung hóa sao lưu cho EC2, EBS, RDS, Aurora, DynamoDB, EFS, FSx, S3, Storage Gateway trên toàn **AWS Organizations** (qua Backup Policies).
- **Cross-Region & Cross-Account Copy**: Tự động sao chép snapshot sang Region khác và sang **Dedicated Backup Account** cô lập để chống xóa toàn bộ tài khoản production.
- **AWS Backup Vault Lock (WORM - Write Once, Read Many)**:
  - **Governance Mode**: Chỉ người dùng có quyền IAM đặc biệt mới được xóa/sửa lock.
  - **Compliance Mode**: Sau khi qua **Cooling-off Period** (tối thiểu 3 ngày), **KHÔNG AI (kể cả Root User hay AWS Support)** có thể xóa recovery point hoặc giảm thời gian retention trước khi hết hạn → chống ransomware xóa backup tuyệt đối.

---

## 6. Chaos Engineering: AWS Fault Injection Service (FIS)

**AWS FIS** chạy các thí nghiệm tiêm lỗi có kiểm soát (Chaos Engineering) để kiểm chứng khả năng chịu lỗi (resilience) của hệ thống trên AWS (EC2 terminate/CPU stress, RDS failover, AZ power interruption, Network latency/blackhole, ECS/EKS task kill, API throttling).

### Nguyên tắc vàng cho kỳ thi DOP-C02: **Stop Conditions**
- Luôn cấu hình **Stop Conditions** gắn với **CloudWatch Alarms** (VD: tỷ lệ lỗi 5xx vượt 5% hoặc P99 latency vượt ngưỡng).
- Nếu Alarm chuyển sang trạng thái **`ALARM`** trong lúc thí nghiệm đang chạy, FIS sẽ **ngay lập tức dừng thí nghiệm (halt)** và chạy rollback (nếu action hỗ trợ) để ngăn thí nghiệm làm sập production thật.
- Kết hợp **AWS FIS + EventBridge + CodePipeline** để chạy GameDay / Chaos Test tự động định kỳ trên môi trường Staging/Pre-Prod.

---

## 7. Bảng Chọn Nhanh Kiến trúc DR (RTO / RPO)

| Chiến lược DR | RTO | RPO | Đặc trưng kỹ thuật chính |
| :--- | :--- | :--- | :--- |
| **Backup & Restore** | Giờ | Giờ | AWS Backup cross-region snapshot, CloudFormation dựng lại hạ tầng khi có sự cố. Chi phí thấp nhất. |
| **Pilot Light** | Vài chục phút | Phút | Database chạy liên tục (RDS Cross-Region Read Replica / Aurora Global DB), tầng compute tắt hoặc chưa scale — chỉ khởi chạy khi failover. |
| **Warm Standby** | Phút | Giây – Phút | Bản sao thu nhỏ (scaled-down) của toàn bộ hệ thống luôn chạy ở DR Region; scale out ngay khi failover. |
| **Multi-Site Active-Active** | Gần bằng 0 (Giây) | Gần bằng 0 | Cả 2 Region cùng phục vụ traffic (Route 53 Latency/Weighted + DynamoDB Global Tables / Aurora Global DB Write Forwarding). Chi phí cao nhất. |

---

[Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md)
