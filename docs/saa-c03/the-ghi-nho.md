# Thẻ ghi nhớ (Flashcards) — SAA-C03

> 30 thẻ · Đọc mặt trước, tự trả lời rồi mở đáp án.

## Chủ đề 2: Bảo mật Đa tài khoản & Biên mạng — Organizations (SCP), IAM Identity Center, WAF, Shield, GuardDuty & Macie

**1. AWS Organizations SCP: 3 quy tắc sống còn khi đi thi SAA-C03?**

<details><summary>Xem đáp án</summary>

1. SCP **KHÔNG cấp quyền** (chỉ đặt giới hạn tối đa/guardrails).
2. SCP **KHÔNG áp dụng** cho **Management Account**.
3. SCP **CÓ áp dụng** cho cả **Root User của các Member Accounts**.

</details>

**2. ALB vs NLB vs Gateway Load Balancer (GWLB)?**

<details><summary>Xem đáp án</summary>

- **ALB (Layer 7)**: HTTP/HTTPS, Path/Host routing, WAF, Lambda target.
- **NLB (Layer 4)**: TCP/UDP, hàng triệu req/s, **Static IP/AZ**, giữ nguyên Client IP, hỗ trợ target ALB.
- **GWLB (Layer 3)**: GENEVE port 6081, chèn **Firewall/IDS/IPS bên thứ 3** inline.

</details>

## Chủ đề 3: Mã hóa & Quản lý Bí mật — KMS, CloudHSM, Secrets Manager, SSM Parameter Store & ACM

**3. AWS KMS vs AWS CloudHSM: When do you choose CloudHSM?**

<details><summary>Xem đáp án</summary>

- Chọn **AWS CloudHSM** khi đề bài yêu cầu **phần cứng HSM vật lý chuyên dụng (single-tenant dedicated hardware)** đạt chuẩn **FIPS 140-2 Level 3** do khách hàng tự quản lý hoàn toàn khóa gốc, hoặc cần **SSL/TLS offloading**.

</details>

**4. AWS Secrets Manager vs SSM Parameter Store?**

<details><summary>Xem đáp án</summary>

- **Secrets Manager**: Có **Auto-rotation** tích hợp sẵn cho RDS/Aurora/Redshift, Cross-region replication, giá **$0.40/secret/tháng**.
- **SSM Parameter Store (Standard)**: **Miễn phí**, lưu cấu hình/secrets tối đa 4 KB, không có auto-rotation tích hợp.

</details>

**5. S3 Bucket Keys dùng để giải quyết vấn đề gì khi dùng SSE-KMS?**

<details><summary>Xem đáp án</summary>

Giảm tới **99% số lượng API call tới KMS** (tránh lỗi `KMS.ThrottlingException` và giảm mạnh chi phí KMS) bằng cách tạo một Bucket-level key ngắn hạn trên S3.

</details>

**6. ECS Task Role vs ECS Task Execution Role?**

<details><summary>Xem đáp án</summary>

- **Task Execution Role**: Dùng bởi ECS Agent để **kéo image từ ECR**, lấy secret từ Secrets Manager và ghi log CloudWatch.
- **Task Role**: Dùng bởi **code ứng dụng bên trong container** để gọi S3, DynamoDB, SQS.

</details>

## Chủ đề 4: Giám sát, Audit & Compliance — CloudWatch, CloudTrail, AWS Config & Systems Manager

**7. AWS WAF vs AWS Shield Standard vs AWS Shield Advanced vs Amazon GuardDuty vs Amazon Macie?**

<details><summary>Xem đáp án</summary>

- **AWS WAF**: Chống SQLi, XSS, Geo-block, Rate-based IP limit ở Layer 7.
- **Shield Advanced**: Chống DDoS có đội ngũ **DRT 24/7** và bảo vệ chi phí tăng vọt (**Cost Protection**).
- **GuardDuty**: Phát hiện mối đe dọa bằng ML từ CloudTrail, VPC Flow Logs, DNS Logs.
- **Macie**: Phát hiện dữ liệu nhạy cảm **PII** trong **S3** bằng ML.

</details>

**8. Amazon CloudWatch vs AWS CloudTrail vs AWS Config?**

<details><summary>Xem đáp án</summary>

- **CloudWatch**: Giám sát **hiệu năng** (CPU, RAM qua Agent, Logs, Alarms).
- **CloudTrail**: Audit **ai gọi AWS API nào** (Who did what?). Bật **Data Events** để ghi log đọc/ghi S3 object.
- **AWS Config**: Theo dõi **lịch sử thay đổi cấu hình & Compliance** + Auto-Remediation qua SSM.

</details>

## Chủ đề 5: Kiến trúc Mạng VPC & Hybrid Cloud — Subnets, NAT Gateway, VPC Endpoints, PrivateLink, VPN & Direct Connect

**9. Gateway VPC Endpoint vs Interface VPC Endpoint (AWS PrivateLink)?**

<details><summary>Xem đáp án</summary>

- **Gateway VPC Endpoint**: **Miễn phí 100%**, cấu hình ở Route Table, chỉ hỗ trợ **Amazon S3** và **Amazon DynamoDB** (không dùng được từ On-prem).
- **Interface VPC Endpoint (PrivateLink)**: Tạo ENI có Private IP trong Subnet, hỗ trợ hàng trăm dịch vụ AWS + dịch vụ qua **NLB** (kể cả khi trùng CIDR và truy cập được từ On-prem).

</details>

**10. Security Group (SG) vs Network ACL (NACL)?**

<details><summary>Xem đáp án</summary>

- **Security Group**: Cấp ENI, **Stateful**, chỉ có **Allow**, tham chiếu được SG khác.
- **NACL**: Cấp Subnet, **Stateless** (phải mở cả Inbound & Outbound Ephemeral `1024-65535`), hỗ trợ **Allow và Explicit Deny** (dùng để chặn IP cụ thể).

</details>

**11. Cách loại bỏ chi phí xử lý dữ liệu NAT Gateway ($0.045/GB) khi EC2 Private truy cập S3/DynamoDB?**

<details><summary>Xem đáp án</summary>

Tạo **Gateway VPC Endpoint** cho **Amazon S3** và **Amazon DynamoDB** và gắn vào Route Table của Private Subnet — **hoàn toàn miễn phí ($0)**.

</details>

## Chủ đề 6: Định tuyến Toàn cầu & Mạng Phức hợp — Transit Gateway, Route 53, CloudFront & Global Accelerator

**12. Amazon CloudFront vs AWS Global Accelerator?**

<details><summary>Xem đáp án</summary>

- **CloudFront**: Cache nội dung HTTP/HTTPS tại Edge Locations, IP động.
- **Global Accelerator**: Không cache; cấp **2 địa chỉ Anycast Static IP cố định**, hỗ trợ cả **TCP và UDP** (Gaming, IoT, VoIP), failover giữa các Region **dưới 1 phút**.

</details>

**13. Direct Connect Virtual Interfaces: Private VIF vs Public VIF vs Transit VIF?**

<details><summary>Xem đáp án</summary>

- **Private VIF**: Kết nối vào **1 VPC** qua VGW.
- **Public VIF**: Truy cập **AWS Public Services** (S3, DynamoDB) hoặc chạy VPN over DX.
- **Transit VIF**: Kết nối qua Direct Connect Gateway tới **AWS Transit Gateway** (nhiều VPC).

</details>

**14. Route 53: Geolocation vs Geoproximity vs Latency Routing Policy?**

<details><summary>Xem đáp án</summary>

- **Geolocation**: Định tuyến theo **quốc gia/châu lục** (dùng cho tuân thủ GDPR/bản quyền).
- **Geoproximity**: Theo khoảng cách + **Bias** điều chỉnh vùng phủ.
- **Latency**: Tới Region có **độ trễ mạng thấp nhất**.

</details>

**15. VPC Peering vs AWS Transit Gateway?**

<details><summary>Xem đáp án</summary>

- **VPC Peering**: Point-to-point, **không bắc cầu (non-transitive)**, miễn phí tạo kết nối, tốt cho 2 VPC.
- **Transit Gateway**: Hub-and-Spoke cho hàng chục/trăm VPC + VPN + Direct Connect, hỗ trợ **ECMP** cộng gộp nhiều VPN tunnels.

</details>

## Chủ đề 7: Compute, Load Balancing & Auto Scaling — EC2, ALB, NLB, GWLB & Auto Scaling Groups

**16. EC2 Placement Groups: Cluster vs Spread vs Partition?**

<details><summary>Xem đáp án</summary>

- **Cluster**: Cùng 1 Rack / 1 AZ -> Mạng 10–100 Gbps độ trễ thấp nhất cho **HPC**.
- **Spread**: Mỗi máy 1 Rack riêng biệt -> Tối đa **7 instances / AZ / group** cho máy cực kỳ quan trọng.
- **Partition**: Tối đa 7 partitions / AZ -> Cho cụm phân tán lớn (**Hadoop, Cassandra, Kafka**).

</details>

**17. DynamoDB On-Demand vs Provisioned Capacity & TTL?**

<details><summary>Xem đáp án</summary>

- **On-Demand**: Tải **spiky / không đoán trước** hoặc rảnh rỗi nhiều.
- **Provisioned + Auto Scaling**: Tải **ổn định, đều đặn** (rẻ hơn tới 70% với Reserved Capacity).
- **TTL**: Tự động xóa item hết hạn **miễn phí ($0 WCU)**.

</details>

## Chủ đề 8: Decoupling & Messaging — Amazon SQS, SNS, Kinesis Data Streams & Amazon MQ

**18. Amazon EventBridge vs Amazon SNS vs AWS Step Functions?**

<details><summary>Xem đáp án</summary>

- **EventBridge**: Event Bus lọc sâu theo **JSON payload**, tích hợp SaaS & **Replay events**.
- **SNS**: Pub/Sub Fan-out đơn giản tốc độ cao (SNS + nhiều SQS).
- **Step Functions**: Điều phối **Workflow nhiều bước**, Retry/Catch, Human Approval (**Standard**: 1 năm / **Express**: 5 phút).

</details>

**19. Kinesis Data Streams vs Amazon Data Firehose & Tối ưu Amazon Athena?**

<details><summary>Xem đáp án</summary>

- **Kinesis Data Streams**: **Real-time (< 1s)**, lưu tối đa 365 ngày, hỗ trợ Replay.
- **Data Firehose**: **Serverless** đẩy thẳng tới S3/Redshift/OpenSearch (trễ ≥ 60s), tự chuyển Parquet.
- **Athena**: Chuyển CSV/JSON sang **Parquet/ORC + Nén + Partitioning** để giảm tới 99% chi phí quét S3.

</details>

## Chủ đề 9: Disaster Recovery, AWS Backup & Dịch vụ AI/ML Managed

**20. Four Disaster Recovery (DR) strategies ordered from lowest to highest cost/RTO?**

<details><summary>Xem đáp án</summary>

1. **Backup and Restore** (RTO: hàng giờ, rẻ nhất).
2. **Pilot Light** (DB chạy đồng bộ, máy chủ EC2/App đang **TẮT**).
3. **Warm Standby** (Cả DB lẫn App ở DR đều **ĐANG CHẠY** ở quy mô thu nhỏ).
4. **Multi-Site Active-Active** (RTO ~ 0, chạy full-scale ở cả 2 Region).

</details>

**21. RDS Multi-AZ vs RDS Read Replicas vs Aurora Global Database?**

<details><summary>Xem đáp án</summary>

- **RDS Multi-AZ**: **HA/DR** (Synchronous, không đọc từ Standby truyền thống).
- **RDS Read Replicas**: **Read Scaling** (Asynchronous, max 15 Replicas, hỗ trợ Cross-Region).
- **Aurora Global Database**: Nhân bản đa Region **< 1 giây** (`RPO = 1s`, `RTO < 1 phút`).

</details>

## Chủ đề 10: Kiến trúc Serverless & Event-Driven — Lambda, API Gateway, EventBridge & Step Functions

**22. AWS Lambda Hard Limits: Timeout, Memory, /tmp, Concurrency?**

<details><summary>Xem đáp án</summary>

- **Timeout tối đa**: **15 phút**.
- **RAM**: 128 MB – **10 GB**.
- **`/tmp`**: Tối đa **10 GB** (cần thêm → gắn **EFS**).
- **Cold Start**: Bật **Provisioned Concurrency**. Kết nối RDS quá tải → **RDS Proxy**.

</details>

## Chủ đề 11: Kiến trúc Container trên AWS — ECS, EKS, Fargate, ECR & App Runner

**23. Compute Savings Plans vs EC2 Instance Savings Plans vs Spot Instances?**

<details><summary>Xem đáp án</summary>

- **Compute Savings Plans**: Giảm tới **66%**, tự động áp dụng khi chuyển đổi giữa **EC2, Fargate và Lambda** hoặc đổi Region.
- **EC2 Instance Savings Plans**: Giảm tới **72%**, cố định 1 Instance Family trong 1 Region.
- **Spot Instances**: Giảm tới **90%** cho tác vụ chịu được gián đoạn (batch, rendering).

</details>

## Chủ đề 12: Object Storage & Hybrid Storage — Amazon S3, Storage Classes, Lifecycle, CRR & Storage Gateway

**24. S3 Glacier Instant Retrieval vs Flexible Retrieval vs Deep Archive?**

<details><summary>Xem đáp án</summary>

- **Glacier Instant Retrieval**: Khôi phục **tức thì (ms)**, lưu min 90 ngày (đọc 1–2 lần/năm).
- **Glacier Flexible Retrieval**: 1–5 phút (Expedited), 3–5 giờ (Standard), 5–12 giờ (Bulk).
- **Glacier Deep Archive**: Rẻ nhất, khôi phục **12–48 giờ**, lưu min 180 ngày.

</details>

## Chủ đề 13: Chuyên sâu Block & File Storage — EBS, Instance Store, EFS & Amazon FSx

**25. Amazon EFS vs Amazon FSx for Windows vs Amazon FSx for Lustre?**

<details><summary>Xem đáp án</summary>

- **Amazon EFS**: Hệ thống tệp chia sẻ cho **Linux** qua giao thức **NFSv4** (Multi-AZ).
- **FSx for Windows**: Chia sẻ file cho **Windows** qua **SMB, NTFS, Active Directory**.
- **FSx for Lustre**: Tốc độ hàng trăm GB/s cho **HPC / Machine Learning**, tích hợp trực tiếp với **S3**.

</details>

**26. AWS Storage Gateway: S3 File Gateway vs Volume Gateway vs Tape Gateway?**

<details><summary>Xem đáp án</summary>

- **S3 File Gateway**: NFS/SMB → Lưu thành **S3 Objects** nguyên bản.
- **Volume Gateway**: iSCSI Block → Backup thành **EBS Snapshots** (Cached hoặc Stored).
- **Tape Gateway (VTL)**: Thay thế băng từ vật lý → Lưu lên S3/Glacier.

</details>

**27. AWS DMS vs AWS SCT vs AWS DataSync vs Snowball Edge?**

<details><summary>Xem đáp án</summary>

- **SCT + DMS**: Chuyển đổi Schema & di chuyển **Database khác Engine** (Oracle → PostgreSQL) với **CDC near-zero downtime**.
- **DataSync**: Đồng bộ file qua mạng (On-prem NFS/SMB → S3/EFS/FSx).
- **Snowball Edge (80 TB)**: Di chuyển offline khi truyền qua mạng mất **> 1 tuần**.

</details>

**28. EBS gp2 vs gp3: Lợi ích tối ưu chi phí?**

<details><summary>Xem đáp án</summary>

Chuyển từ `gp2` sang **`gp3`** giúp **giảm ngay 20% chi phí** lưu trữ mỗi GB, đồng thời có sẵn **3,000 IOPS & 125 MB/s** baseline mà không cần tăng dung lượng ổ đĩa.

</details>

## Chủ đề 16: Tối ưu Chi phí — Savings Plans, Spot Instances, S3 Tiering, Data Transfer & Billing Tools

**29. Dedicated Hosts vs Dedicated Instances khi nào bắt buộc dùng Dedicated Hosts?**

<details><summary>Xem đáp án</summary>

Chọn **EC2 Dedicated Hosts** khi mang giấy phép phần mềm **BYOL** (Oracle, SQL Server, Windows Server) tính phí theo **Sockets hoặc Physical Cores** vật lý.

</details>

**30. AWS Cost Explorer vs AWS Budgets vs AWS Compute Optimizer?**

<details><summary>Xem đáp án</summary>

- **Cost Explorer**: Xem lịch sử & **dự báo chi phí (Forecast)**.
- **AWS Budgets**: Đặt ngưỡng ngân sách và **cảnh báo / tự động chặn** khi vượt ngưỡng.
- **Compute Optimizer**: Dùng ML gợi ý **Right-sizing** (hạ cấp EC2/Lambda/EBS dư thừa).

</details>

---

[Mục lục SAA-C03](00-tong-quan-va-lo-trinh-saa-c03.md)
