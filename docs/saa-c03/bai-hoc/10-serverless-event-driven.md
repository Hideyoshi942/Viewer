# Kiến trúc Serverless & Event-Driven trên AWS (SAA-C03)

Kiến trúc **Serverless & Event-Driven** xuất hiện dày đặc trong các câu hỏi SAA-C03 yêu cầu *"least operational overhead"*, *"pay-per-use"*, hoặc *"decoupled microservices"*. Bạn cần nắm rõ giới hạn kỹ thuật của AWS Lambda, các loại API Gateway, sự khác biệt giữa EventBridge vs SNS, và khi nào dùng Step Functions.

---

## 1. AWS Lambda: Giới hạn, VPC Networking & Tối ưu Hiệu năng

### Các thông số giới hạn sống còn (Hard Limits)
| Thông số | Giới hạn của AWS Lambda | Giải pháp khi vượt ngưỡng |
| :--- | :--- | :--- |
| **Thời gian chạy tối đa (Timeout)** | **15 phút (900 giây)** | Chia nhỏ tác vụ qua **Step Functions**, hoặc chuyển sang **AWS Fargate / AWS Batch / EC2**. |
| **RAM (Memory)** | **128 MB – 10,240 MB (10 GB)** (CPU tỷ lệ thuận theo RAM; 1,769 MB = 1 vCPU) | Tăng RAM để tăng CPU & tốc độ xử lý cho tác vụ nặng tính toán. |
| **Dung lượng `/tmp` (Ephemeral Storage)** | Mặc định 512 MB, mở rộng tối đa **10 GB** | Nếu cần lưu file lớn hơn 10 GB hoặc chia sẻ file giữa các lần chạy → Gắn **Amazon EFS**. |
| **Deployment Package** | Zip: 50 MB (direct), 250 MB (unzipped). **Container Image (ECR): 10 GB** | Dùng **Lambda Container Image** (tối đa 10 GB) hoặc **Lambda Layers** cho thư viện nặng (ML/Pandas). |
| **Concurrency mặc định** | **1,000** concurrent executions / Region (có thể xin tăng) | Cấu hình **Reserved Concurrency** (đảm bảo quota cho hàm quan trọng hoặc giới hạn để không làm sập DB) & **Provisioned Concurrency** (loại bỏ Cold Start). |

### Lambda trong VPC & RDS Proxy
- Mặc định, Lambda chạy trong VPC do AWS quản lý (có Internet, gọi được S3/DynamoDB trực tiếp).
- Khi đặt Lambda **bên trong VPC của bạn** (để truy cập RDS/ElastiCache Private):
  - Lambda **MẤT quyền truy cập Internet** (kể cả S3/DynamoDB) trừ khi subnet đó có route ra **NAT Gateway** hoặc **VPC Endpoints**!
  - Nếu hàng nghìn Lambda khởi tạo cùng lúc kết nối tới RDS → Cạn kiệt connection pool của RDS → Chèn **Amazon RDS Proxy** ở giữa.

---

## 2. Amazon API Gateway: REST API vs HTTP API vs WebSocket

| Tiêu chí | HTTP API | REST API | WebSocket API |
| :--- | :--- | :--- | :--- |
| **Chi phí** | **Rẻ hơn tới 70%** ($1.00 / triệu requests) | Đắt hơn ($3.50 / triệu requests) | Tính theo messages + connection minutes |
| **Độ trễ** | Thấp nhất | Cao hơn HTTP API một chút | Real-time 2 chiều (Chat, Dashboard) |
| **Tính năng nâng cao** | JWT/OIDC Authorizer (Cognito), Lambda Authorizer, CORS | **Đầy đủ nhất**: **API Caching**, **Usage Plans & API Keys**, **Request Validation/Transformation (VTL)**, **AWS WAF**, **Resource Policies** | Duy trì kết nối dài hạn (`$connect`, `$disconnect`, `$default`) |
| **Endpoint Types** | Regional | **Edge-Optimized** (qua CloudFront), **Regional**, **Private** (chỉ truy cập từ VPC qua Interface Endpoint) | Regional |

> **Exam Tip**: Đề bài yêu cầu *"Private API chỉ cho phép các ứng dụng bên trong VPC truy cập thông qua Interface VPC Endpoint"* → Chọn **REST API (Private Endpoint)**. Đề bài yêu cầu *"API đơn giản tích hợp Cognito JWT với chi phí thấp nhất"* → Chọn **HTTP API**.

---

## 3. Amazon EventBridge vs Amazon SNS vs Amazon SQS

Đây là bộ 3 dịch vụ Event-Driven hay bị nhầm lẫn nhất trong đề thi:

| Tiêu chí | Amazon EventBridge | Amazon SNS | Amazon SQS |
| :--- | :--- | :--- | :--- |
| **Mô hình** | **Event Bus** (Router thông minh dựa trên nội dung JSON) | **Pub/Sub** (Push tới nhiều subscribers) | **Message Queue** (Pull-based buffer) |
| **Nguồn sự kiện** | **AWS Services (90+ dịch vụ)**, **SaaS Partners (Datadog, Zendesk, Shopify)**, Custom Apps | Ứng dụng tự publish vào Topic | Producer gửi message vào Queue |
| **Lọc sự kiện (Filtering)** | Lọc sâu theo **bất kỳ trường nào trong JSON Event Body** (Content-based filtering) | Lọc theo Message Attributes (hoặc Payload hạn chế) | Không lọc (Consumer tự đọc) |
| **Đích đến (Targets)** | Hơn **20+ AWS Targets** (Lambda, Step Functions, SQS, ECS, API Destinations gọi webhook ngoài) | SQS, Lambda, HTTP/S, Email, SMS | Consumer tự poll (EC2, ECS, Lambda) |
| **Tính năng đặc biệt** | **Schema Registry**, **Archive & Replay Events**, **EventBridge Scheduler** (thay thế CloudWatch Events) | **Fan-out** thông lượng cực lớn, độ trễ thấp | **Buffering/Throttling protection**, DLQ, FIFO |

> **Exam Tip**: Thấy từ khóa **"SaaS partner integration (Shopify/Zendesk)"**, **"Schema Registry"**, **"Replay past events"**, hoặc **"Route events based on JSON payload content to Step Functions/ECS"** → Chọn **Amazon EventBridge**!

---

## 4. AWS Step Functions: Standard vs Express Workflows

**AWS Step Functions** dùng để điều phối (**Orchestration**) nhiều hàm Lambda, ECS tasks, Glue jobs thành một quy trình nghiệp vụ (State Machine) có xử lý lỗi (`Retry` / `Catch`), rẽ nhánh (`Choice`), chạy song song (`Parallel` / `Map`), và chờ phê duyệt thủ công (**Callback Pattern với Task Token**).

| Tiêu chí | Standard Workflow | Express Workflow |
| :--- | :--- | :--- |
| **Thời gian chạy tối đa** | **1 năm** | **5 phút** |
| **Ngữ nghĩa thực thi** | **Exactly-Once** (Đảm bảo mỗi bước chỉ chạy 1 lần) | **At-Least-Once** (Có thể chạy trùng nếu lỗi mạng) |
| **Tốc độ khởi tạo** | ~2,000 executions/giây | **> 100,000 executions/giây** |
| **Lịch sử & Debug** | Lưu lịch sử trực quan từng bước trong 90 ngày | Chỉ đẩy log ra CloudWatch Logs |
| **Chi phí** | Tính theo số lần chuyển trạng thái (**State Transitions**) | Tính theo số lượng execution + thời gian + RAM (rẻ hơn rất nhiều cho tải lớn) |
| **Kịch bản chuẩn** | Quy trình thanh toán, đặt hàng, chờ con người duyệt (**Human Approval**), tác vụ chạy nhiều giờ/ngày | Xử lý luồng IoT, Mobile backend, ETL micro-batch tốc độ cao (< 5 phút) |

---

## 5. Bẫy đề thi SAA-C03 (Exam Traps)
1. **Lambda xử lý file 20 phút**: Không thể tăng timeout Lambda lên 20 phút (max là 15 phút)! Đáp án chuẩn là chuyển sang **AWS Fargate**, **AWS Batch**, hoặc tách nhỏ thành nhiều bước trong **Step Functions**.
2. **Lambda Cold Start**: Nếu đề bài yêu cầu *"Lambda viết bằng Java/C# trong VPC phải phản hồi dưới 100ms ngay cả ở request đầu tiên sau thời gian dài không chạy"* → Bật **Provisioned Concurrency** (hoặc Lambda SnapStart cho Java).
3. **API Gateway Timeout**: Giới hạn timeout tối đa của API Gateway là **29 giây** (không tăng được!). Nếu backend xử lý mất 2 phút → Chuyển sang **Asynchronous Pattern**: API Gateway đẩy request vào **SQS / Step Functions**, trả về `202 Accepted` ngay lập tức.

---

[← Bài trước](09-disaster-recovery-backup-ml-services.md) | [Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/10-serverless-event-driven.md) | [Bài tiếp →](11-containers-ecs-eks-fargate.md)
