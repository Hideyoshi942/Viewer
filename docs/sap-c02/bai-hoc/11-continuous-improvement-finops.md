# Cải tiến Liên tục — Hiệu năng, Độ tin cậy & Tối ưu Chi phí (FinOps)

Domain 3 (**Continuous Improvement for Existing Solutions** — 25%) kiểm tra năng lực "bắt bệnh" và nâng cấp các hệ thống đang vận hành trên AWS: giảm độ trễ, xử lý bottleneck cơ sở dữ liệu, loại bỏ điểm nghẽn kiến trúc đồng bộ và cắt giảm mạnh chi phí vận hành (FinOps) mà không làm suy giảm SLA.

---

## 1. Quản trị Chi phí Doanh nghiệp (Cloud FinOps)

### Cost Visibility & Governance
- **AWS Cost and Usage Report (CUR)**: Nguồn dữ liệu hóa đơn chi tiết nhất (từng giờ, từng resource ID), đẩy vào S3 để phân tích bằng **Amazon Athena** và trực quan hóa trên **Amazon QuickSight** (CUDOS Dashboard).
- **Cost Allocation Tags**: Kích hoạt User-Defined Tags (ví dụ `CostCenter`, `Environment`, `Application`) trong Billing Console để phân bổ chi phí. Dùng **AWS Organizations Tag Policies** kết hợp **SCP** để chặn việc khởi tạo EC2/RDS thiếu tag bắt buộc.
- **AWS Budgets & Cost Anomaly Detection**:
  - **AWS Budgets Actions**: Tự động gắn IAM policy hạn chế hoặc dừng EC2/RDS khi chi phí vượt ngưỡng dự báo.
  - **Cost Anomaly Detection**: Dùng Machine Learning phát hiện sớm các đợt tăng chi phí bất thường (ví dụ vòng lặp vô hạn của Lambda hoặc NAT Gateway data transfer tăng đột biến).

### Chiến lược Cam kết & Chia sẻ Giảm giá (Savings Plans vs Reserved Instances)

| Mô hình | Phạm vi áp dụng | Mức linh hoạt | Cơ chế chia sẻ trong Organization |
| :--- | :--- | :--- | :--- |
| **Compute Savings Plans** | EC2, AWS Fargate, AWS Lambda | **Cao nhất** — tự động áp dụng bất kể Instance Family, Size, AZ, Region, OS, Tenancy | Tự động chia sẻ giữa các member accounts nếu bật **Discount Sharing** tại Management Account |
| **EC2 Instance Savings Plans** | EC2 trong 1 Instance Family & 1 Region cụ thể | Trung bình (đổi được Size, OS, Tenancy trong cùng family) | Chia sẻ theo quy tắc ưu tiên account mua trước, phần dư chia cho account khác |
| **Reserved Instances (RI)** | EC2, RDS, ElastiCache, Redshift, OpenSearch | Standard RI (giảm sâu nhất) vs Convertible RI (đổi được family) | Hỗ trợ **Capacity Reservation** (Zonal RI) — Savings Plans không giữ chỗ capacity |
| **Spot Instances** | Stateless, fault-tolerant, batch, CI/CD, EMR | Giảm tới **90%**, có thông báo thu hồi trước **2 phút** | Dùng **EC2 Auto Scaling Mixed Instances Policy** (`price-capacity-optimized`) |

> **Exam Tip**: Khi đề bài yêu cầu **đảm bảo sẵn sàng dung lượng (capacity guarantee)** cho một workload chạy cố định ở một AZ cụ thể → chọn **On-Demand Capacity Reservations (ODCR)** kết hợp Savings Plans, hoặc **Zonal Reserved Instances**. Savings Plans đơn thuần chỉ là cam kết giảm giá thanh toán, **không** giữ chỗ phần cứng.

### Tối ưu Rightsizing & Storage Tiering
- **AWS Compute Optimizer**: Phân tích CloudWatch metrics (tích hợp CloudWatch Agent để có thêm **Memory utilization**) đưa ra khuyến nghị rightsizing cho EC2, Auto Scaling Groups, EBS volumes (`gp2` → `gp3`), Lambda memory và ECS on Fargate.
- **Amazon S3 Intelligent-Tiering**: Tự động di chuyển object giữa Frequent, Infrequent và Archive Instant Access khi mẫu truy cập **không thể đoán trước**, không mất phí retrieval.
- **Tối ưu Data Transfer Cost**:
  - Dùng **Gateway VPC Endpoints** (miễn phí!) cho S3 và DynamoDB để tránh phí xử lý dữ liệu qua NAT Gateway ($0.045/GB).
  - Giữ traffic giao tiếp nhiều trong cùng AZ (Cluster Placement Group hoặc AZ-aware routing) để tránh phí cross-AZ data transfer ($0.01/GB mỗi chiều).

---

## 2. Tối ưu Hiệu năng & Mở rộng Quy mô (Performance Optimization)

### Chiến lược Caching Đa tầng

| Tầng Cache | Dịch vụ AWS | Khi nào chọn? |
| :--- | :--- | :--- |
| **Edge / CDN** | Amazon CloudFront | Nội dung tĩnh, API response có thể cache, giảm latency toàn cầu và giảm tải Origin |
| **Database Read Cache (NoSQL)** | **Amazon DynamoDB Accelerator (DAX)** | Ứng dụng dùng DynamoDB cần tốc độ đọc **microseconds**, tương thích API DynamoDB (chỉ đổi endpoint, không sửa logic cache), **không phù hợp** cho write-heavy hoặc yêu cầu strongly consistent reads |
| **In-Memory Data Store** | **Amazon ElastiCache (Redis / Valkey)** | Cache phức tạp cho RDS/Aurora, session store, leaderboard (Sorted Sets), pub/sub, cần persistence/replication/Multi-AZ |
| **Simple Object Cache** | **Amazon ElastiCache (Memcached)** | Cache đơn giản, đa luồng (multi-threaded), cần horizontal partitioning đơn giản, không cần HA/persistence |

### Xử lý Bottleneck Cơ sở dữ liệu
- **Amazon RDS Proxy**: Gộp kết nối (connection pooling) cho các ứng dụng **Serverless (AWS Lambda)** mở hàng nghìn kết nối đồng thời tới RDS/Aurora. Ngoài ra còn giảm thời gian failover của Aurora/RDS tới **66%** bằng cách giữ kết nối ứng dụng và tự chuyển hướng sang DB instance mới.
- **Amazon Aurora Read Replicas + Auto Scaling**: Tách tải đọc (Read-heavy) sang Read Replicas qua **Reader Endpoint**; dùng **Custom Endpoints** để phân nhóm replica cấu hình lớn riêng cho các truy vấn báo cáo/analytics.
- **DynamoDB Performance Tuning**: Tránh *Hot Partition* bằng cách thiết kế Partition Key có độ phân tán cao (high cardinality) hoặc áp dụng **Write Sharding** (thêm hậu tố ngẫu nhiên `0..N`); dùng **Sparse Indexes** để tối ưu truy vấn lọc.

---

## 3. Event-Driven Decoupling & Observability Toàn diện

### Chuyển đổi từ Kiến trúc Đồng bộ sang Bất đồng bộ
Khi hệ thống bị quá tải đột biến (traffic spikes) làm sập database hoặc timeout API:
- **Amazon SQS**: Buffer lưu tạm yêu cầu (Queue-based Load Leveling), kết hợp **Auto Scaling dựa trên chỉ số `ApproximateNumberOfMessagesVisible` (Backlog per instance)**. Dùng **SQS FIFO** khi cần đảm bảo thứ tự tuyệt đối và xử lý chính xác một lần (exactly-once).
- **Amazon SNS + SQS (Fan-out Pattern)**: Một sự kiện phát ra được gửi song song đến nhiều microservice độc lập (kèm **Message Filtering** để giảm chi phí gọi Lambda không cần thiết).
- **Amazon EventBridge**: Event bus thông minh cho kiến trúc Event-Driven quy mô doanh nghiệp, hỗ trợ **Content-based Routing**, **Schema Registry**, tích hợp SaaS partners và **Archive & Replay** sự kiện để xử lý lại khi có lỗi.

### Observability & Troubleshooting Nâng cao
- **AWS X-Ray / CloudWatch Application Signals**: Distributed tracing giúp xác định chính xác microservice hoặc câu truy vấn DB nào gây tăng độ trễ p99.
- **Amazon CloudWatch Logs Insights & Metric Filters**: Truy vấn log tập trung nhanh chóng, tạo **Embedded Metric Format (EMF)** từ Lambda để đẩy custom metrics hiệu quả không tốn chi phí gọi API `PutMetricData` riêng lẻ.
- **Amazon DevOps Guru**: Sử dụng Machine Learning tự động phát hiện hành vi vận hành bất thường (memory leak, DB connection exhaustion) và gợi ý nguyên nhân gốc rễ.

> **Exam Tip**: Nếu câu hỏi mô tả *Lambda functions bị lỗi `Too many connections` khi kết nối tới RDS PostgreSQL/MySQL trong đợt flash sale* → đáp án tối ưu luôn là **Amazon RDS Proxy** (kèm điều chỉnh Reserved Concurrency của Lambda nếu cần bảo vệ downstream).

---

[← Bài trước](10-serverless-containers-event-driven-scale.md) | [Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/11-continuous-improvement-optimization.md) | [Bài tiếp →](12-observability-security-hub-remediation.md)
