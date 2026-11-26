# Cheatsheet 4: Lưu trữ, Database, Migration & Analytics (SAA-C03 Domain 3)

## 1. Chọn nhanh EBS vs EFS vs FSx & Storage Gateway
| Tình huống trong đề thi | Giải pháp chuẩn | Lý do cốt lõi |
| :--- | :--- | :--- |
| Ổ đĩa mặc định cho EC2 (tốt & rẻ hơn `gp2` 20%) | **EBS `gp3`** | 3,000 IOPS & 125 MB/s baseline miễn phí, tách rời IOPS khỏi dung lượng. |
| 1 EC2 cần **IOPS cực cao (> 64,000 – 256,000 IOPS)** | **EBS `io2 Block Express`** | Độ trễ sub-millisecond, hỗ trợ Multi-Attach trong **cùng 1 AZ**. |
| Nhiều **Linux EC2 / ECS / Fargate / Lambda** trên nhiều AZ cùng mount 1 thư mục | **Amazon EFS** | Giao thức **NFSv4**, tự động co giãn, có EFS-IA tiết kiệm chi phí. |
| Chia sẻ file cho **Windows** cần **SMB, NTFS ACLs, Active Directory** | **FSx for Windows File Server** | Managed Windows file server thuần túy. |
| **HPC / ML** tốc độ hàng trăm GB/s đồng bộ 2 chiều với **S3** | **FSx for Lustre** | Deployment: `Scratch` (tạm) hoặc `Persistent` (lâu dài). |
| Lưu file từ On-prem lên **S3** qua NFS/SMB (có cache local) | **S3 File Gateway** | Object lưu nguyên bản trên S3; thay thế băng từ dùng **Tape Gateway**. |

---

## 2. S3 Storage Classes & Performance
- **Truy cập không đoán trước**: **S3 Intelligent-Tiering** (không phí truy xuất).
- **Ít truy cập, lấy ngay (ms)**: Standard-IA (min 30 ngày) vs **Glacier Instant Retrieval** (min 90 ngày, đọc 1–2 lần/năm).
- **Lưu trữ tuân thủ rẻ nhất**: **Glacier Deep Archive** (min 180 ngày, khôi phục 12–48h).
- **Chống xóa/sửa tuyệt đối (WORM)**: **S3 Object Lock (Compliance Mode)** — Root User cũng không xóa được!
- **Performance**: **3,500 PUT / 5,500 GET per prefix/sec**. File > 100 MB dùng **Multipart Upload**. Upload xa toàn cầu dùng **Transfer Acceleration**.

---

## 3. Database: RDS vs Aurora vs DynamoDB vs ElastiCache
- **RDS Multi-AZ**: **HA/DR** (Synchronous, không đọc từ Standby truyền thống; riêng **Multi-AZ DB Cluster** có 2 Readable Standbys).
- **RDS Read Replicas**: **Read Scaling** (Asynchronous, max 15 Replicas, hỗ trợ Cross-Region).
- **Aurora**: 6 bản sao trên 3 AZ, max 15 Replicas, **Aurora Global Database** (`RPO = 1s`, `RTO < 1 phút`).
- **RDS Proxy**: Connection pooling cho Lambda, giảm thời gian failover **66%**.
- **DynamoDB**: Single-digit ms; **DAX** giảm xuống microsecond; **TTL** xóa item hết hạn miễn phí; **Global Tables** cho Active-Active Multi-Region.
- **ElastiCache Redis vs Memcached**: Cần HA/Persistence/Sorted Sets/PubSub → **Redis**.

---

## 4. Migration & Data Analytics
- **Khác Engine DB** (Oracle → PostgreSQL): **AWS SCT** (đổi schema) + **AWS DMS** (đồng bộ dữ liệu + CDC near-zero downtime).
- **Đồng bộ file On-prem ↔ S3/EFS/FSx**: **AWS DataSync**. Cần **SFTP** thẳng vào S3: **AWS Transfer Family**.
- **Offline Migration**: **Snowball Edge** (80 TB) khi truyền mạng mất **> 1 tuần**; **Snowmobile** (100 PB).
- **Streaming**: Cần **Serverless đẩy thẳng S3/Redshift/OpenSearch (Parquet)** → **Data Firehose** (trễ ≥ 60s). Cần **Real-time (< 1s) & Replay** → **Kinesis Data Streams**.
- **Query S3 bằng SQL**: **Amazon Athena** (Tối ưu: **Parquet/ORC + Snappy/GZIP + Partitioning**). Tự động quét Schema: **AWS Glue Crawler**. Data Warehouse OLAP: **Amazon Redshift** (+ **Redshift Spectrum** query S3).

---

[Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md)
