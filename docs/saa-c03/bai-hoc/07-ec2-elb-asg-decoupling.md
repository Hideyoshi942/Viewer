# Kiến trúc Compute, Chịu lỗi & Decoupling (SAA-C03 Domain 2 & 3)

Thiết kế hệ thống chịu lỗi cao (**Resilient**) và tách rời các thành phần (**Decoupling**) là xương sống của Domain 2. Bạn cần nắm vững sự khác biệt giữa 3 loại Load Balancer, 3 loại EC2 Placement Group, các mô hình SQS/SNS, và 4 chiến lược Disaster Recovery.

---

## 1. Elastic Load Balancing: ALB vs NLB vs GWLB

| Tiêu chí | Application Load Balancer (ALB) | Network Load Balancer (NLB) | Gateway Load Balancer (GWLB) |
| :--- | :--- | :--- | :--- |
| **Tầng OSI** | Layer 7 (HTTP/HTTPS, gRPC, WebSockets) | Layer 4 (TCP, UDP, TLS) | Layer 3 (IP Packets - GENEVE port 6081) |
| **Thông lượng & Độ trễ** | Hàng chục nghìn req/s, độ trễ vài ms | **Hàng triệu req/s**, độ trễ **cực thấp (~100 µs)** | Xử lý lưu lượng mạng xuyên suốt |
| **Địa chỉ IP** | IP động (dùng DNS Name) | **1 Static IP cố định mỗi AZ** (hỗ trợ gắn Elastic IP) | Gắn qua Gateway Load Balancer Endpoint (GWLBE) |
| **Định tuyến thông minh** | Theo **URL Path** (`/api/*`), **Host** (`api.example.com`), **HTTP Header**, Query String | Không (chỉ theo Port/Protocol) | Đẩy toàn bộ traffic qua cụm **Virtual Appliances (Firewall, IDS/IPS)** của bên thứ 3 |
| **Targets hỗ trợ** | EC2, IP, **Lambda Function**, ECS | EC2, IP, **ALB** (NLB đứng trước ALB để lấy Static IP!) | Virtual Appliances (Palo Alto, Fortinet, Suricata) |
| **Tính năng đặc biệt** | Tích hợp **AWS WAF**, **Cognito/OIDC Auth**, Sticky Sessions (Cookie) | **Preserve Client Source IP** tự nhiên, hỗ trợ **AWS PrivateLink** | Triển khai tường lửa inline minh bạch (bump-in-the-wire) |

> **Exam Tip**: Cần **Static IP** cho một **ALB**? → Đặt **NLB phía trước ALB** (NLB hỗ trợ target là ALB!). Cần chèn **Firewall/IDS bên thứ 3** vào giữa Internet Gateway và Application Subnet? → **Gateway Load Balancer (GWLB)**.

---

## 2. EC2 Placement Groups & Auto Scaling Groups (ASG)

### So sánh 3 loại EC2 Placement Groups
| Loại | Kiến trúc vật lý | Ưu điểm & Giới hạn | Kịch bản SAA-C03 |
| :--- | :--- | :--- | :--- |
| **Cluster** | Tất cả EC2 nằm **cùng 1 Rack / 1 AZ** | Mạng **10–100 Gbps**, độ trễ thấp nhất; rủi ro cao nếu 1 rack hỏng | **HPC (High Performance Computing)**, tính toán khoa học, ML training cần node giao tiếp liên tục. |
| **Spread** | Mỗi EC2 nằm trên **1 Rack phần cứng riêng biệt** (có thể trải qua nhiều AZ) | Cô lập lỗi phần cứng tối đa; giới hạn **tối đa 7 instances / AZ / group** | Các máy chủ cực kỳ quan trọng (Master node, Quorum) số lượng nhỏ không được phép chết cùng lúc. |
| **Partition** | Chia thành các Partition (mỗi Partition là cụm rack độc lập, không chia sẻ nguồn/mạng) | Tối đa **7 partitions / AZ**, chứa được **hàng trăm instances**; ứng dụng đọc được Partition ID qua Metadata | Hệ thống dữ liệu lớn phân tán nhận biết topology (**HDFS/Hadoop, Apache Kafka, Cassandra, HBase**). |

### Auto Scaling Policies (Chọn loại nào?)
- **Target Tracking Scaling**: *"Giữ CPU trung bình ở mức 60%"* hoặc *"Giữ số request per target của ALB ở mức 1,000"* → Đơn giản nhất, ưu tiên mặc định.
- **Step / Simple Scaling**: Tăng/giảm theo bậc dựa trên CloudWatch Alarm (ví dụ: CPU > 70% thêm 2 máy, CPU > 90% thêm 5 máy).
- **Scheduled Scaling**: Tăng quy mô trước giờ cao điểm đã biết trước (ví dụ: 8:55 sáng thứ Hai tăng từ 2 lên 20 máy).
- **Predictive Scaling**: Dùng Machine Learning phân tích lịch sử tải để tự động scale-out **trước** khi lưu lượng tăng đột biến (phù hợp với ứng dụng có chu kỳ lặp lại nhưng khởi động chậm).
- **ASG Lifecycle Hooks**: Tạm dừng quá trình khởi tạo (`Pending:Wait`) để cài phần mềm hoặc quá trình tắt (`Terminating:Wait`) để **chạy script rút log/drain connection** trước khi EC2 bị xóa vĩnh viễn!

---

## 3. Decoupling: Amazon SQS vs Amazon SNS vs Amazon MQ

### Amazon SQS (Queue — Pull Model)
- **SQS Standard Queue**: Thông lượng **không giới hạn**, giao hàng **At-Least-Once** (có thể trùng lặp nhẹ), thứ tự **Best-Effort**.
- **SQS FIFO Queue**: Đảm bảo đúng thứ tự (**First-In-First-Out**) và xử lý **Exactly-Once** (dùng `MessageDeduplicationId`). Giới hạn mặc định **300 msg/s** (hoặc **3,000 msg/s** với Batching; lên tới 70,000+ msg/s với High Throughput FIFO).
- **Các tham số sống còn của SQS**:
  - **Visibility Timeout** (Mặc định 30s, tối đa 12h): Thời gian message bị ẩn khỏi các consumer khác sau khi 1 consumer nhận nó. *Nếu xử lý lâu hơn Visibility Timeout mà chưa gọi `ChangeMessageVisibility` → Message sẽ bị consumer khác đọc lại!*
  - **Long Polling (`ReceiveMessageWaitTimeSeconds = 1–20s`)**: Giảm số lần gọi API rỗng (`EmptyReceive`), **tiết kiệm chi phí** và giảm độ trễ so với Short Polling (`0s`).
  - **Dead-Letter Queue (DLQ)**: Nơi chứa các message xử lý thất bại quá `maxReceiveCount` lần để điều tra sau (tránh làm kẹt queue).
  - **Queue Depth Scaling**: Dùng metric `ApproximateNumberOfMessagesVisible` (hoặc `BacklogPerInstance`) để kích hoạt Auto Scaling Group cho EC2 Workers!

### Amazon SNS (Pub/Sub — Push Model)
- Mô hình **Fan-out**: 1 Publisher gửi vào SNS Topic → Đẩy đồng thời tới nhiều Subscribers (**SQS Queues, Lambda, HTTP/S, Email, SMS**).
- **SNS + SQS Fan-out Pattern**: Khi 1 sự kiện (ví dụ: *OrderPlaced*) cần kích hoạt 3 hệ thống độc lập (Thanh toán, Kho hàng, Gửi Email) mà vẫn đảm bảo lưu trữ đệm và retry độc lập → Đẩy vào **1 SNS Topic**, cho **3 SQS Queues** subscribe vào Topic đó.
- **SNS Message Filtering**: Dùng JSON Filter Policy để mỗi SQS chỉ nhận đúng loại message mình quan tâm (giảm chi phí xử lý thừa).

### Khi nào chọn Amazon MQ?
- Khi di chuyển ứng dụng Legacy từ On-premises lên AWS mà ứng dụng đang dùng giao thức chuẩn công nghiệp **AMQP, MQTT, STOMP, OpenWire, JMS** (ActiveMQ / RabbitMQ) và **không thể viết lại code** để dùng SQS/SNS API.

---

## 4. 4 Chiến lược Disaster Recovery (DR) theo RTO & RPO

```
Chi phí thấp nhất / RTO, RPO cao nhất  ──────────────────────────►  Chi phí cao nhất / RTO, RPO ~ 0
[1. Backup & Restore]  ──►  [2. Pilot Light]  ──►  [3. Warm Standby]  ──►  [4. Multi-Site Active-Active]
   RTO: Hàng giờ              RTO: 10–30 phút        RTO: Vài phút            RTO: Tức thì (~0)
```

| Chiến lược | Trạng thái ở DR Region khi bình thường | Đặc điểm nhận diện trong đề SAA-C03 |
| :--- | :--- | :--- |
| **Backup and Restore** | Không có tài nguyên compute chạy; chỉ có dữ liệu backup (S3, EBS/RDS Snapshots, AWS Backup) | Rẻ nhất, chấp nhận **RTO/RPO tính bằng giờ**. |
| **Pilot Light** | **Database đang chạy & đồng bộ liên tục** (ví dụ RDS Read Replica / Aurora Global); **Compute (EC2/App) đang TẮT** | Cần khởi động EC2/ASG khi có thảm họa. Cân bằng tốt giữa chi phí và RTO (~10–30 phút). |
| **Warm Standby** | **Cả Database LẪN Compute đều ĐANG CHẠY** ở quy mô thu nhỏ (ví dụ 1 EC2 `t3.small` luôn bật) | Chỉ cần scale-up/scale-out ASG và chuyển Route 53 DNS khi có sự cố (**RTO vài phút**). |
| **Multi-Site Active-Active** | Hệ thống chạy **Full-Scale ở cả 2+ Regions** đồng thời phục vụ traffic (Route 53 Weighted/Latency + DynamoDB Global Tables / Aurora Global) | Đắt nhất, **RTO/RPO gần bằng 0**. |

---

## 5. Bẫy đề thi SAA-C03 (Exam Traps)
1. **SQS Payload > 256 KB**: SQS giới hạn kích thước message tối đa **256 KB**. Nếu cần gửi file lớn (ví dụ PDF 50 MB) qua SQS → Dùng **Amazon S3 + SQS Extended Client Library** (lưu file lên S3, chỉ gửi S3 URI/pointer qua SQS).
2. **ALB không có Static IP**: Nếu đề bài yêu cầu *"Whitelist 1 IP tĩnh cho Load Balancer"* → Chọn **NLB** (hoặc **Global Accelerator** đứng trước ALB), tuyệt đối không chọn ALB trực tiếp.
3. **ASG Health Check**: Mặc định ASG chỉ kiểm tra `EC2 Status Check`. Nếu EC2 vẫn chạy nhưng tiến trình Web App (Nginx/NodeJS) bị crash → Phải đổi **Health Check Type của ASG sang `ELB`** để ASG tự thay thế instance lỗi!

---

[← Bài trước](06-transit-gateway-route53-global-accelerator.md) | [Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/07-ec2-elb-asg-ha.md) | [Bài tiếp →](08-decoupling-sqs-sns-kinesis.md)
