# Cheatsheet: FinOps, Bẫy Chi phí Data Transfer & Tối ưu Hiệu năng Storage/DB

Tài liệu tra cứu nhanh cho **Domain 3 (Continuous Improvement - 25%)** của kỳ thi **AWS SAP-C02**, tập trung vào mô hình mua sắm Compute, chia sẻ ưu đãi trong AWS Organizations, các bẫy chi phí Data Transfer kinh điển và bảng quyết định tối ưu hiệu năng Storage/Database.

---

## 1. Bảng quyết định mô hình mua sắm Compute (FinOps)

| Mô hình | Mức giảm tối đa | Phạm vi áp dụng | Tính linh hoạt | Khi nào chọn trên đề thi? |
| :--- | :--- | :--- | :--- | :--- |
| **Compute Savings Plans** | Lên tới **66%** | **EC2 + AWS Fargate + AWS Lambda** | **Cao nhất**: Tự động áp dụng xuyên suốt Instance Family, Size, AZ, **Region**, OS, Tenancy | Workload đang **hiện đại hóa** (EC2 → Fargate/Lambda) hoặc thay đổi Region/Instance Family liên tục nhưng tổng chi tiêu giờ ổn định. |
| **EC2 Instance Savings Plans** | Lên tới **72%** | Chỉ **EC2** | **Trung bình**: Cố định **1 Instance Family + 1 Region**; linh hoạt Size, AZ, OS, Tenancy | Biết chắc workload chạy lâu dài trên 1 Family cụ thể ở 1 Region (ví dụ `m7g` tại `us-east-1`), muốn tiết kiệm sâu hơn Compute SP. |
| **Standard Reserved Instances (RI)** | Lên tới **72%** | EC2, RDS, ElastiCache, Redshift, OpenSearch | Thấp (chỉ đổi size cùng family với Linux Regional RI); có thể bán lại trên RI Marketplace | **Bắt buộc chọn RI** khi tối ưu cho **RDS, ElastiCache, Redshift, OpenSearch** (vì Savings Plans **không** áp dụng cho các dịch vụ này!). |
| **Convertible RI** | Lên tới **66%** | Chỉ **EC2** | Có thể đổi sang family/OS/tenancy khác (giá trị >= cũ) | Ít được ưu tiên hơn Compute Savings Plans trừ khi cần **Capacity Reservation** (Zonal RI) kèm đổi family. |
| **EC2 Spot Instances** | Lên tới **90%** | EC2, EKS/Karpenter, ECS, EMR, Batch | Có thể bị thu hồi với **thông báo trước 2 phút** | Stateless web/API (kết hợp On-Demand baseline), CI/CD runners, Batch, Big Data (EMR Task Nodes), HPC có checkpointing. |
| **On-Demand Capacity Reservations (ODCR)** | **0%** (trả giá On-Demand) | EC2 theo **AZ cụ thể** | Bật/tắt bất cứ lúc nào | Đảm bảo **chắc chắn có dung lượng** cho sự kiện lớn hoặc kế hoạch **DR Pilot Light / Warm Standby** (kết hợp Regional RI/SP để được giảm giá trên ODCR!). |

### Quy tắc chia sẻ RI & Savings Plans trong AWS Organizations
- Mặc định bật **Discount Sharing** ở Management Account: RI/Savings Plans mua ở Account A sẽ áp dụng cho Account A trước, phần dư tự động áp dụng cho Account B trong cùng Organization.
- **Tắt RI/SP Sharing** trên một Member Account (hoặc nhóm tài khoản) trong Billing Preferences nếu đề bài yêu cầu **"chargeback chính xác / giữ ưu đãi riêng cho phòng ban đã trả tiền mua RI"**.
- **Lưu ý Volume Discount Tiering**: Consolidated Billing tự động gộp tổng dung lượng S3 / Data Transfer Out của mọi Member Account để đạt mức giá bậc thang rẻ hơn.

---

## 2. Các Bẫy Chi phí Data Transfer Kinh điển (Rất hay ra thi!)

| Bẫy Chi phí (Cost Trap) | Chi phí ẩn | Giải pháp chuẩn SAP-C02 |
| :--- | :--- | :--- |
| **NAT Gateway truy cập S3 / DynamoDB** | $0.045/GB phí xử lý NAT GW + chi phí lưu lượng | Tạo **VPC Gateway Endpoint** cho S3 & DynamoDB (**hoàn toàn miễn phí $0** cho cả giờ chạy lẫn GB dữ liệu!). |
| **NAT Gateway truy cập AWS Services khác (ECR, Secrets Manager, STS, SQS)** | $0.045/GB phí NAT GW | Dùng **VPC Interface Endpoint (PrivateLink)**: $0.01/GB (rẻ hơn NAT GW 4.5 lần) + phí $0.01/giờ/AZ; chỉ tối ưu khi lưu lượng lớn (tính điểm hòa vốn) hoặc yêu cầu private traffic. |
| **Cross-AZ Data Transfer ($0.01/GB mỗi chiều = $0.02/GB khứ hồi)** | Tốn cực nhiều với cụm chatty (Kafka/MSK, Elasticsearch, Microservices) hoặc ALB → Target khác AZ | Bật **Availability Zone Affinity / Locality**; đặt **NAT Gateway riêng ở mỗi AZ**; tắt Cross-Zone Load Balancing nếu tải cân bằng giữa các AZ; dùng **Cluster Placement Group** (cùng AZ) cho HPC. |
| **Đọc dữ liệu trực tiếp từ S3 ra Internet** | ~$0.09/GB Data Transfer Out | Đặt **Amazon CloudFront** phía trước S3: Data Transfer từ **S3 → CloudFront là $0 (miễn phí)**, giá DTO từ CloudFront ra Internet rẻ hơn (kèm 1 TB miễn phí/tháng) + giảm chi phí S3 `GET` requests. |
| **EC2 giao tiếp qua Public IP / Elastic IP thay vì Private IP** | Bị tính phí như Regional Data Transfer ($0.01/GB mỗi chiều) ngay cả khi cùng AZ! | Luôn sử dụng **Private IP** hoặc **Route 53 Private Hosted Zone** cho giao tiếp nội bộ trong VPC. |
| **Data Transfer Out ra Internet qua Direct Connect** | Rẻ hơn nhiều so với Internet DTO (~$0.02/GB vs ~$0.09/GB) | Với doanh nghiệp đẩy hàng chục TB/tháng về On-Premises, dùng **Direct Connect** giảm mạnh chi phí DTO. |

---

## 3. Tối ưu Hiệu năng & Chi phí Storage

| Dịch vụ / Loại Volume | Thông số & Đặc điểm nổi bật | Khi nào chọn? |
| :--- | :--- | :--- |
| **EBS `gp3`** | Baseline **3.000 IOPS & 125 MB/s miễn phí** (bất kể dung lượng); scale độc lập tới 16.000 IOPS & 1.000 MB/s. **Rẻ hơn `gp2` ~20%**. | **Mặc định tối ưu** thay thế cho `gp2` ở hầu hết mọi workload! |
| **EBS `io2 Block Express`** | Tối đa **256.000 IOPS**, **4.000 MB/s**, độ bền **99.999% (5 nines)**, hỗ trợ **Multi-Attach** (cần cluster-aware filesystem như GFS2/OCFS2). | Database tối quan trọng (SAP HANA, Oracle, SQL Server) cần độ trễ sub-millisecond & IOPS > 16.000. |
| **EBS `st1` (Throughput Optimized HDD)** | Tối đa 500 MB/s, chi phí rất thấp; **không dùng làm boot volume**. | Big Data, Kafka/EMR, Data Warehouse, Log processing (tuần tự, kích thước block lớn). |
| **Amazon EFS** | **Elastic Throughput** (mặc định tối ưu cho tải đột biến, trả theo GB đọc/ghi); bật **EFS Intelligent-Tiering / Lifecycle** (IA giảm 92% chi phí, Archive giảm tới 95%). | Chia sẻ file POSIX cho Linux (ECS/EKS/Lambda/EC2 Multi-AZ). |
| **Amazon FSx for Windows File Server** | Hỗ trợ SMB, NTFS, Active Directory, DFS; bật **Data Deduplication** tiết kiệm 50–60% dung lượng. | Ứng dụng Windows/.NET cần chia sẻ ổ đĩa SMB chuẩn doanh nghiệp. |
| **Amazon FSx for Lustre** | Độ trễ sub-millisecond, hàng trăm GB/s throughput, **tích hợp trực tiếp với Amazon S3** (lazy loading & write-back). | HPC, Machine Learning training, xử lý video/tài chính quy mô lớn. |
| **Amazon FSx for NetApp ONTAP** | Đa giao thức (**NFS + SMB + iSCSI**), hỗ trợ **Multi-AZ, Snapshots, FlexClone, Compression/Deduplication, Capacity Pool Tiering**. | Di chuyển NAS doanh nghiệp (NetApp) không cần đổi kiến trúc, hoặc chia sẻ file cho **cả Linux và Windows đồng thời**. |
| **S3 Intelligent-Tiering** | Tự động chuyển đổi giữa Frequent → Infrequent → Archive Instant Access → (tùy chọn) Deep Archive mà **không mất phí retrieval**. | Dữ liệu có **mẫu truy cập thay đổi hoặc không dự đoán được** (lưu ý: object < 128 KB không tự động tier xuống và không bị tính phí monitoring). |

---

## 4. Tối ưu Hiệu năng & Kết nối Database

| Vấn đề hiệu năng (Symptom) | Nguyên nhân gốc | Giải pháp chuẩn SAP-C02 |
| :--- | :--- | :--- |
| **Lambda gây cạn kiệt kết nối (`Too many connections`) trên RDS / Aurora** | Mỗi Lambda container mở kết nối TCP/DB riêng khi traffic spike | Đặt **Amazon RDS Proxy** phía trước RDS/Aurora để **connection pooling & multiplexing**; đồng thời giảm thời gian failover tới **66%**. |
| **CPU Writer của RDS/Aurora đạt 100% do truy vấn đọc (Reporting/BI)** | Cả đọc và ghi cùng dồn vào Primary Instance | Tạo **Aurora Read Replicas** (tối đa 15 replicas, lag < 100ms, dùng chung storage) + bật **Aurora Auto Scaling** + hướng truy vấn đọc vào **Reader Endpoint** (hoặc **Custom Endpoint** riêng cho BI). |
| **Traffic Database tăng đột biến không thể đoán trước (Flash sale)** | Scaling thủ công mất 10–15 phút để đổi instance class | Dùng **Amazon Aurora Serverless v2** (scale tức thì theo từng 0.5 ACU trong **chưa đầy 1 giây** mà không rớt kết nối). |
| **RDS Proxy + IAM Auth + Secrets Manager** | Cần quản lý credential an toàn không hardcode | RDS Proxy tích hợp trực tiếp **AWS Secrets Manager** và bắt buộc **IAM Authentication** từ Lambda/EC2. |
| **DynamoDB bị `ProvisionedThroughputExceededException` (Throttling)** | Hot Partition hoặc tải đột biến vượt WCU/RCU | Chuyển sang **On-Demand Capacity Mode** (tải khó đoán) hoặc bật **Auto Scaling** + **Write Sharding** + đặt **DAX** (nếu đọc lặp lại nhiều). |

> **Exam Tip**: Luôn kiểm tra **AWS Compute Optimizer** (phân tích CloudWatch metrics 14 ngày đến 3 tháng, hỗ trợ EC2, ASG, EBS, Lambda, ECS Fargate, RDS) trước khi đề xuất rightsizing. Để tối ưu Lambda Memory/CPU tự động theo thực tế, nhắc tới **AWS Lambda Power Tuning** (chạy trên Step Functions).

---

[Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md)
