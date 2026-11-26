# Cheatsheet 3: Compute, Serverless, Containers & DR (SAA-C03 Domain 2 & 3)

## 1. Load Balancers & Placement Groups
- **ALB (Layer 7)**: HTTP/HTTPS/gRPC, routing theo Path/Host/Header, hỗ trợ WAF, Lambda target. Không có Static IP.
- **NLB (Layer 4)**: TCP/UDP/TLS, hàng triệu req/s, độ trễ microsecond, **1 Static IP/AZ**, giữ nguyên Client IP, hỗ trợ target là ALB & PrivateLink.
- **GWLB (Layer 3)**: Chèn **Third-party Virtual Appliances (Firewall/IDS/IPS)** inline bằng GENEVE (port 6081).
- **Placement Groups**:
  - **Cluster**: Cùng Rack/AZ → 10–100 Gbps cho **HPC**.
  - **Spread**: Mỗi máy 1 Rack (max **7 instances/AZ**) → Cô lập lỗi phần cứng tối đa.
  - **Partition**: Max **7 partitions/AZ** → **Hadoop, Cassandra, Kafka**.

---

## 2. Decoupling: SQS vs SNS vs EventBridge vs Step Functions
| Dịch vụ | Khi nào chọn? | Giới hạn / Thông số vàng |
| :--- | :--- | :--- |
| **SQS** | Buffer tải, tách rời Producer-Consumer | Max payload **256 KB** (> 256 KB dùng S3 + Extended Client). Long Polling = `1–20s`. FIFO = Exactly-Once. |
| **SNS** | **Fan-out** 1 tin nhắn tới nhiều đích (SQS, Lambda, Email) | Dùng **SNS + nhiều SQS** cho kiến trúc Microservices bền vững. |
| **EventBridge** | Lọc sâu theo **JSON payload**, tích hợp **SaaS (Shopify/Datadog)**, **Replay events** | Thay thế CloudWatch Events; có Schema Registry & Scheduler. |
| **Step Functions** | Điều phối workflow nhiều bước, **Human Approval**, Retry/Catch | **Standard** (max 1 năm, Exactly-Once). **Express** (max 5 phút, >100k/s, At-Least-Once). |

---

## 3. Serverless (Lambda & API Gateway) & Containers (ECS/EKS/Fargate)
- **AWS Lambda Limits**: Timeout max **15 phút**; RAM **128 MB – 10 GB** (1,769 MB = 1 vCPU); `/tmp` max **10 GB** (cần thêm hoặc share → gắn **EFS**); Container Image max **10 GB**.
- **Lambda Cold Start**: Dùng **Provisioned Concurrency** (hoặc SnapStart cho Java). Kết nối RDS quá tải → **RDS Proxy**.
- **API Gateway**: Timeout max **29 giây**! **HTTP API** rẻ hơn 70% so với REST API. **REST API** hỗ trợ **Private Endpoint**, API Caching, WAF, Usage Plans.
- **ECS vs EKS vs Fargate**:
  - **Fargate**: Serverless containers (không quản lý EC2, dùng `awsvpc` mỗi Task 1 ENI, không hỗ trợ GPU).
  - **ECS**: Control plane miễn phí, đơn giản nhất trên AWS. **Task Role** (cho code app) vs **Task Execution Role** (kéo ECR image + ghi log).
  - **EKS**: Managed Kubernetes ($0.10/giờ/cluster), dùng khi có sẵn Helm/K8s hoặc Multi-cloud; phân quyền Pod bằng **IRSA / Pod Identity**.

---

## 4. 4 Chiến lược Disaster Recovery (DR)
1. **Backup & Restore**: Rẻ nhất, RTO/RPO **hàng giờ**.
2. **Pilot Light**: **DB chạy đồng bộ**, **EC2/App TẮT** ở DR Region (RTO 10–30 phút).
3. **Warm Standby**: **Cả DB & App ĐANG CHẠY** ở quy mô nhỏ tại DR Region (RTO vài phút).
4. **Multi-Site Active-Active**: Chạy **Full-Scale ở cả 2 Region** (RTO ~ 0, đắt nhất).

---

[Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md)
