# Chuyên sâu Serverless, Containers & Kiến trúc Event-Driven Quy mô lớn

Trong Domain 3 của kỳ thi **AWS Certified Solutions Architect - Professional (SAP-C02)**, bạn thường xuyên gặp các bài toán cải tiến hiệu năng, chịu tải đột biến (burst traffic), chống nghẽn cổ chai (bottleneck), và giảm chi phí vận hành cho hệ thống phân tán hiện đại. Bài học này phân tích sâu các quyết định kiến trúc giữa EventBridge, Step Functions, SQS/Kinesis/MSK, tối ưu Lambda Concurrency, chiến lược scaling ECS/EKS và tầng Caching đa lớp.

---

## 1. Event-Driven Integration: EventBridge Buses, Pipes & Cross-Account

### Amazon EventBridge Event Buses (Many-to-Many)
- **Kiến trúc Cross-Account Event Routing**:
  - Account Nguồn gửi sự kiện vào Custom Event Bus ở Account Trung tâm (hoặc trực tiếp sang Default/Custom Bus của Account Đích).
  - Yêu cầu **2 tầng phân quyền**:
    1. **IAM Role** gắn trên EventBridge Rule ở Account Nguồn có quyền `events:PutEvents` tới ARN của Event Bus đích.
    2. **Resource-based Policy** trên Event Bus đích cho phép Account Nguồn (hoặc toàn bộ `aws:PrincipalOrgID`) gửi sự kiện vào.
- **EventBridge Schema Registry & Archive/Replay**: Cho phép lưu trữ sự kiện lịch sử và phát lại (Replay) để phục hồi lỗi logic hoặc nạp dữ liệu vào microservice mới mà không ảnh hưởng hệ thống sản xuất.

### Amazon EventBridge Pipes (Point-to-Point)
- Giải quyết bài toán kết nối **1 Nguồn → 1 Đích** (ví dụ: SQS, DynamoDB Streams, Kinesis, MSK, Self-managed Kafka → Step Functions, Lambda, API Destination, EventBus) với 4 bước chuẩn: **Source → Filtering → Enrichment (tùy chọn) → Target**.
- **Lợi ích cốt lõi trên đề thi**: Loại bỏ hoàn toàn "glue code" Lambda chỉ dùng để poll SQS/Kinesis, lọc JSON rồi đẩy sang Step Functions. Giảm chi phí và độ trễ vận hành (chỉ trả tiền cho sự kiện **sau khi qua bộ lọc**).

> **Exam Tip**: Khi đề bài mô tả *"loại bỏ custom Lambda poller dùng để đọc DynamoDB Streams / SQS, lọc sự kiện, gọi API làm giàu dữ liệu rồi gửi vào Step Functions với ít code nhất"* → chọn **Amazon EventBridge Pipes**.

---

## 2. AWS Step Functions: Standard vs Express & Saga Pattern

### So sánh Standard Workflows vs Express Workflows

| Tiêu chí | Standard Workflows | Express Workflows |
| :--- | :--- | :--- |
| **Thời gian chạy tối đa** | Lên tới **1 năm** | Tối đa **5 phút** |
| **Tốc độ khởi tạo (Execution Rate)** | 2.000/giây | **> 100.000/giây** |
| **Ngữ nghĩa thực thi** | **Exactly-once** | **At-least-once** (Async) hoặc **At-most-once** (Sync) |
| **Kiểu gọi** | Asynchronous | Asynchronous & **Synchronous** (tích hợp trực tiếp API Gateway) |
| **Mô hình tính phí** | Theo số lần chuyển trạng thái (**State Transitions**) | Theo số lượng request, thời gian chạy và bộ nhớ |
| **Use Case chuẩn** | Quy trình thanh toán, phê duyệt đơn hàng, ETL dài hạn, **Saga Pattern**, Callback (`waitForTaskToken`) | Xử lý streaming IoT tốc độ cao, backend microservices đồng bộ ngắn hạn |

### Triển khai Distributed Saga Pattern với Step Functions Standard
Trong kiến trúc microservices, không thể dùng ACID transaction xuyên suốt nhiều database. **Saga Pattern** dùng Step Functions để điều phối chuỗi giao dịch cục bộ kèm **Compensating Transactions** (giao dịch bù trừ) khi có lỗi:

```json
{
  "StartAt": "ReserveInventory",
  "States": {
    "ReserveInventory": {
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke",
      "Next": "ChargePayment",
      "Catch": [{ "ErrorEquals": ["States.ALL"], "Next": "OrderFailed" }]
    },
    "ChargePayment": {
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke",
      "Next": "OrderConfirmed",
      "Catch": [{ "ErrorEquals": ["States.ALL"], "Next": "ReleaseInventory" }]
    },
    "ReleaseInventory": {
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke",
      "Next": "OrderFailed"
    },
    "OrderConfirmed": { "Type": "Succeed" },
    "OrderFailed": { "Type": "Fail" }
  }
}
```
- **Lưu ý quan trọng**: Mọi Task trong Saga Pattern **phải thiết kế Idempotent** (dùng `OrderId` làm khóa chống trùng lặp trong DynamoDB/RDS) để khi Step Functions thực hiện `Retry` sẽ không trừ tiền 2 lần.
- **Map State Distributed Mode**: Khi cần xử lý song song hàng triệu object trong S3 (lên tới **10.000 child executions đồng thời**), dùng **Step Functions Distributed Map** thay vì viết script điều phối thủ công.

---

## 3. Messaging & Streaming: SQS FIFO vs Kinesis Data Streams vs MSK

| Đặc điểm | Amazon SQS Standard | Amazon SQS FIFO | Amazon Kinesis Data Streams (KDS) | Amazon MSK (Managed Kafka) |
| :--- | :--- | :--- | :--- | :--- |
| **Thứ tự (Ordering)** | Best-effort (không đảm bảo) | **Đảm bảo tuyệt đối** theo `MessageGroupId` | **Đảm bảo tuyệt đối** theo `PartitionKey` trong từng Shard | **Đảm bảo tuyệt đối** trong từng Partition |
| **Số Consumer đọc cùng dữ liệu** | 1 Consumer xử lý mỗi message (Competing Consumers) | 1 Consumer / mỗi `MessageGroupId` tại 1 thời điểm | **Nhiều Consumer độc lập** đọc cùng stream (Fan-out) | **Nhiều Consumer Group độc lập** |
| **Throughput tối đa** | Gần như không giới hạn | 300 TPS (3.000 TPS với batching), hoặc **lên tới 70.000+ TPS** với **High Throughput Mode** (`perMessageGroupId`) | On-Demand mode tự động scale tới hàng GB/s; Provisioned: 1 MB/s write, 2 MB/s read mỗi Shard (**Enhanced Fan-Out**: 2 MB/s riêng biệt cho mỗi consumer qua HTTP/2 push) | Scale theo số Broker & Partition; hỗ trợ **MSK Serverless** |
| **Lưu trữ & Replay** | Tối đa 14 ngày (xóa ngay sau khi consumer delete) | Tối đa 14 ngày; khử trùng lặp 5 phút (`MessageDeduplicationId`) | 24 giờ mặc định, tối đa **365 ngày**; hỗ trợ Replay | Không giới hạn thực tế (dùng **Tiered Storage** đẩy về S3) |

> **Exam Tip**:
> - Cần **nhiều consumer độc lập** cùng đọc và **replay** dữ liệu theo thứ tự → chọn **Kinesis Data Streams** (hoặc **MSK** nếu đề yêu cầu tương thích Kafka / di chuyển cụm Kafka sẵn có).
> - Khi nhiều consumer đọc chung 1 KDS shard và bị `ProvisionedThroughputExceededException` (độ trễ cao > 200ms) → bật **Enhanced Fan-Out** (độ trễ ~70ms, băng thông 2 MB/s riêng cho mỗi consumer).
> - Cần **decoupling + xử lý theo thứ tự theo từng khách hàng/đơn hàng** và xóa sau khi xử lý → chọn **SQS FIFO** kèm `MessageGroupId` (bật **High Throughput for FIFO** nếu vượt 3.000 msg/s).

---

## 4. Tối ưu AWS Lambda Concurrency & Cold Start

### Reserved Concurrency vs Provisioned Concurrency

| Cơ chế | Reserved Concurrency | Provisioned Concurrency |
| :--- | :--- | :--- |
| **Bản chất** | **Dành riêng** một phần hạn mức concurrency của Account cho function đó, đồng thời **đặt trần tối đa (hard cap)**. | **Khởi tạo sẵn (pre-warm)** số lượng execution environments ở trạng thái sẵn sàng nhận request ngay lập tức. |
| **Giải quyết Cold Start?** | **Không** | **Có** (độ trễ phản hồi ổn định ở mức vài ms) |
| **Bảo vệ Downstream DB khỏi quá tải?** | **Có** (cắt trần số lượng kết nối tối đa từ Lambda tới RDS/Legacy API) | **Không** (vượt quá Provisioned sẽ tự spill sang On-Demand concurrency nếu không chặn bằng Reserved) |
| **Chi phí** | **Miễn phí** | Trả phí theo GB-giây liên tục cho môi trường giữ ấm (kết hợp **Application Auto Scaling** theo lịch hoặc metric `ProvisionedConcurrencyUtilization` để tiết kiệm) |

### AWS Lambda SnapStart
- Dành cho **Java (11+), Python (3.12+), và .NET (8+)**.
- Cơ chế: Khi publish version mới, AWS chạy pha `INIT`, chụp **snapshot bộ nhớ & ổ đĩa đã mã hóa** (Firecracker microVM snapshot) và cache lại. Khi có Cold Start, Lambda khôi phục trực tiếp từ snapshot thay vì khởi động runtime từ đầu → giảm độ trễ khởi động tới **90%**, **không tốn phí giữ ấm như Provisioned Concurrency** (đối với Java; Python/.NET có phí nhỏ cho snapshot caching).
- **Lưu ý khi dùng SnapStart**: Tránh giữ các giá trị cần tính duy nhất (random seed, timestamp, kết nối DB cũ) trong pha `INIT`; sử dụng **CRaC runtime hooks** (`beforeCheckpoint` / `afterRestore`) để làm mới kết nối/secret.

---

## 5. Scaling Containers: Amazon ECS vs Amazon EKS

### Amazon ECS Scaling Strategies
1. **Service Auto Scaling**: Dùng Target Tracking (CPU, Memory, `ALBRequestCountPerTarget`) hoặc Step Scaling (dựa trên `ApproximateNumberOfMessagesVisible` của SQS).
2. **Cluster Auto Scaling với Capacity Providers**:
   - **EC2 Launch Type**: Gắn Auto Scaling Group làm Capacity Provider với `Managed Scaling` → ECS tự động tính `CapacityProviderReservation` để scale EC2 trước khi thiếu chỗ chạy Task.
   - **Fargate + Fargate Spot**: Dùng Capacity Provider Strategy kết hợp `base` trên `FARGATE` (đảm bảo baseline ổn định) và `weight` tỷ lệ (ví dụ `1:4`) giữa `FARGATE` và `FARGATE_SPOT` để tiết kiệm tới **70% chi phí** cho workload stateless chịu được ngắt quãng (interruption notice 2 phút qua EventBridge).

### Amazon EKS Scaling: Karpenter vs Cluster Autoscaler
- **Kubernetes Cluster Autoscaler (CA)**: Phụ thuộc vào EC2 Auto Scaling Groups (Node Groups) định nghĩa sẵn instance type. Scale chậm hơn và dễ lãng phí tài nguyên do bin-packing kém linh hoạt.
- **Karpenter (Chuẩn hiện đại trên SAP-C02)**:
  - **Node provisioning trực tiếp qua EC2 Fleet API** (không cần quản lý nhiều ASG/Node Groups).
  - Quan sát các Pod ở trạng thái `Pending`, tự động chọn đúng **instance family/size tối ưu nhất** (hỗ trợ đa dạng Spot + On-Demand, ARM Graviton + x86) và khởi tạo node trong **vài chục giây**.
  - **Consolidation**: Tự động gom các Pod vào ít node hơn hoặc thay thế bằng node nhỏ/rẻ hơn khi tải giảm → tối ưu FinOps vượt trội.
- **Pod Scaling**: Dùng **HPA** (Horizontal Pod Autoscaler cho CPU/Memory/Custom Metrics) kết hợp **KEDA** (Kubernetes Event-Driven Autoscaling) để scale từ 0 dựa trên độ dài hàng đợi SQS/Kafka.

---

## 6. Chiến lược Caching đa lớp: Edge → Application → Database

| Tầng Cache | Dịch vụ AWS | Độ trễ | Use Case & Điểm cần phân biệt |
| :--- | :--- | :--- | :--- |
| **Edge Compute & Cache** | **CloudFront Functions** | < 1 ms | Chạy tại **Edge Locations** (400+ điểm), chỉ hỗ trợ **JavaScript nhẹ**, tối đa **1 ms** execution, không truy cập mạng/body. Dùng cho: URL rewrite/redirect, chuẩn hóa cache key, xác thực JWT đơn giản, thêm security headers. **Rẻ gấp 6 lần Lambda@Edge**. |
| **Regional Edge Compute** | **Lambda@Edge** | Vài chục ms | Chạy tại **Regional Edge Caches** (Node.js/Python), tối đa 5s (viewer) / 30s (origin), **có quyền gọi mạng/AWS API**, đọc được request body. Dùng cho: SSR phức tạp, gọi DynamoDB/Cognito kiểm tra auth nâng cao, biến đổi ảnh động tại origin response. |
| **Application Cache** | **ElastiCache for Valkey / Redis OSS** | Sub-millisecond | Hỗ trợ cấu trúc dữ liệu phức tạp (Sorted Sets cho Leaderboard, Geospatial, Pub/Sub), **Persistence (AOF/RDB)**, **Multi-AZ Automatic Failover**, **Cluster Mode Enabled** (sharding tới hàng trăm node), **ElastiCache Serverless** tự scale không cần chọn node type. |
| **Simple Object Cache** | **ElastiCache for Memcached** | Sub-millisecond | Kiến trúc **multi-threaded**, đơn giản, không persistence, không replication. Chỉ chọn khi cần cache thuần túy cực đơn giản và tận dụng đa nhân trên từng node lớn. |
| **DynamoDB Accelerator** | **Amazon DAX** | Microsecond | **Write-through in-memory cache** tương thích hoàn toàn DynamoDB API (không cần sửa logic ứng dụng). **Chỉ tăng tốc các lệnh đọc `GetItem`/`Query`/`Scan` (eventually consistent)**; **KHÔNG** giúp ích cho workload ghi nhiều (write-heavy) hoặc yêu cầu Strongly Consistent Reads. |

> **Exam Tip**:
> - Nếu đề yêu cầu giảm độ trễ đọc **DynamoDB từ millisecond xuống microsecond** mà **không thay đổi logic caching trong code** → chọn **DAX**.
> - Nếu đề yêu cầu cache kết quả **tổng hợp (aggregation)** từ DynamoDB hoặc lưu **session/leaderboard** → chọn **ElastiCache (Valkey/Redis)** vì DAX chỉ cache item/query thô, không cache kết quả tính toán phức tạp.
> - Nếu đề yêu cầu **thêm HTTP Security Header hoặc URL Redirect** ở quy mô hàng triệu request/giây với **chi phí thấp nhất** → chọn **CloudFront Functions** (không chọn Lambda@Edge).

---

[← Bài trước](09-global-databases-aurora-dynamodb-caching.md) | [Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/10-serverless-containers-scale.md) | [Bài tiếp →](11-continuous-improvement-finops.md)
