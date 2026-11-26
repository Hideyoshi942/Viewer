# Lưu trữ & Database Hiệu năng cao trên AWS (SAA-C03 Domain 3)

Domain 3 (*Design High-Performing Architectures*) yêu cầu bạn chọn đúng dịch vụ lưu trữ (Block, File, Object) và cơ sở dữ liệu (Relational, NoSQL, In-Memory) phù hợp với đặc tính I/O, giao thức, độ trễ và khả năng mở rộng của từng workload.

---

## 1. Amazon S3: Storage Classes, Performance & Security

### Bảng so sánh S3 Storage Classes
| Storage Class | Độ bền / SLA | Phí lưu trữ | Thời gian khôi phục | Phí truy xuất / Lưu ý |
| :--- | :--- | :--- | :--- | :--- |
| **S3 Standard** | 11 số 9 / 99.99% | Cao nhất | Tức thì (ms) | Không phí truy xuất, không minimum duration. |
| **S3 Intelligent-Tiering** | 11 số 9 / 99.9% | Tự động chuyển tầng | Tức thì (hoặc giờ nếu bật Deep Archive tier) | Có phí giám sát nhỏ/1,000 objects (bỏ qua object < 128 KB). **Không tính phí truy xuất!** Tốt nhất khi **mẫu truy cập không thể dự đoán**. |
| **S3 Standard-IA** | 11 số 9 / 99.9% | Rẻ hơn Standard ~45% | Tức thì (ms) | Tối thiểu lưu **30 ngày**, object tối thiểu **128 KB**, có phí truy xuất/GB. |
| **S3 One Zone-IA** | 11 số 9 (trong 1 AZ!) / 99.5% | Rẻ hơn Standard-IA 20% | Tức thì (ms) | Dữ liệu có thể mất nếu 1 AZ bị phá hủy → Dùng cho dữ liệu tái tạo được (thumbnails, backups phụ). |
| **S3 Glacier Instant Retrieval** | 11 số 9 / 99.9% | Rẻ hơn nhiều | **Tức thì (ms)** | Lưu trữ lâu dài (ít nhất **90 ngày**), đọc 1–2 lần/năm nhưng cần tải về ngay lập tức (ảnh y tế, tin tức). |
| **S3 Glacier Flexible Retrieval** | 11 số 9 / 99.99% | Rất rẻ | Expedited (1–5 phút), Standard (3–5 giờ), Bulk (5–12 giờ) | Lưu tối thiểu **90 ngày**. |
| **S3 Glacier Deep Archive** | 11 số 9 / 99.99% | **Rẻ nhất (~$0.00099/GB)** | Standard (12 giờ), Bulk (48 giờ) | Lưu tối thiểu **180 ngày** (tuân thủ pháp lý 7–10 năm thay thế băng từ). |

### Tối ưu hiệu năng & Bảo vệ dữ liệu trên S3
- **S3 Performance**: Hỗ trợ **3,500 PUT/COPY/POST/DELETE** và **5,500 GET/HEAD requests/giây trên mỗi Prefix** (không giới hạn số Prefix!).
- **S3 Multipart Upload**: Bắt buộc cho file > 5 GB; **khuyến nghị cho file > 100 MB** để upload song song tăng tốc độ và resume khi rớt mạng.
- **S3 Transfer Acceleration**: Tăng tốc upload/download từ xa toàn cầu bằng cách đẩy dữ liệu qua **Edge Location** gần nhất rồi đi trên mạng trục AWS về Bucket.
- **S3 Versioning + MFA Delete + Object Lock (WORM)**:
  - **S3 Object Lock**: Chế độ **Governance Mode** (Admin có quyền đặc biệt có thể xóa) vs **Compliance Mode** (**Không ai, kể cả Root User** có thể xóa/sửa trước thời hạn `RetainUntilDate` — dùng cho quy định SEC Rule 17a-4, HIPAA).
- **S3 Replication (CRR vs SRR)**:
  - Bắt buộc bật **Versioning** ở cả Source và Destination Bucket.
  - Chỉ nhân bản các **object mới** kể từ lúc bật (muốn nhân bản object cũ phải dùng **S3 Batch Replication**).

---

## 2. Block & File Storage: EBS vs EFS vs FSx & Storage Gateway

### So sánh EBS Volume Types
| Loại EBS | Loại ổ đĩa | Max IOPS / Volume | Max Throughput | Kịch bản chuẩn |
| :--- | :--- | :--- | :--- | :--- |
| **`gp3`** (General Purpose SSD) | SSD | **16,000** (mặc định 3,000 miễn phí) | **1,000 MB/s** | Mặc định cho mọi workload (Boot, App, DB vừa). **Rẻ hơn `gp2` 20%** và tách rời IOPS khỏi dung lượng! |
| **`io2 Block Express`** | SSD | **256,000** | **4,000 MB/s** | Database cực lớn (SAP HANA, Oracle, SQL Server) cần độ trễ sub-millisecond. Hỗ trợ **Multi-Attach** (cùng 1 AZ). |
| **`st1`** (Throughput Optimized HDD) | HDD | 500 | 500 MB/s | Big Data, Data Warehouse, Log Processing (truy cập tuần tự). *Không làm Boot Volume được.* |
| **`sc1`** (Cold HDD) | HDD | 250 | 250 MB/s | Dữ liệu lạnh ít truy cập nhất trên EBS, rẻ nhất. |

### EBS vs EFS vs FSx
- **EBS**: Gắn cho **1 EC2 trong 1 AZ** (trừ `io2` Multi-Attach cho cluster-aware app). Độ trễ thấp nhất cho 1 máy.
- **Amazon EFS**: Chia sẻ file **Linux (NFSv4)** cho hàng nghìn EC2/ECS/Lambda trên **nhiều AZ cùng lúc**. Hỗ trợ **EFS-IA** (Lifecycle) và **One Zone** để giảm giá.
- **Amazon FSx for Windows File Server**: Chia sẻ file **Windows (SMB, NTFS, Active Directory)**, hỗ trợ DFS Replication.
- **Amazon FSx for Lustre**: Hệ thống file song song cho **HPC, Machine Learning**, tốc độ hàng trăm GB/s, đồng bộ 2 chiều trực tiếp với **S3**.
- **Amazon FSx for NetApp ONTAP**: Hỗ trợ đa giao thức (NFS, SMB, iSCSI), snapshot/clone/deduplication tương thích NetApp on-prem.

### AWS Storage Gateway (Hybrid Storage)
| Loại Gateway | Giao thức / Chức năng | Kịch bản sử dụng |
| :--- | :--- | :--- |
| **S3 File Gateway** | NFS / SMB → Lưu thành **S3 Objects** nguyên bản | Máy chủ On-prem lưu file lên S3 (cache file nóng tại local), dùng S3 Lifecycle đẩy xuống Glacier. |
| **Volume Gateway (Cached vs Stored)** | iSCSI Block Storage → Backup thành **EBS Snapshots** | **Cached**: Dữ liệu chính nằm trên S3, cache phần nóng tại local. **Stored**: Toàn bộ dữ liệu nằm tại local, backup bất đồng bộ lên S3. |
| **Tape Gateway (VTL)** | iSCSI Virtual Tape Library → S3 / Glacier Deep Archive | Thay thế băng từ vật lý (physical tape backup) tại datacenter cũ mà không đổi phần mềm backup. |

---

## 3. Cơ sở dữ liệu: RDS vs Aurora vs DynamoDB vs ElastiCache

### RDS Multi-AZ vs RDS Read Replicas vs Amazon Aurora
| Tiêu chí | RDS Multi-AZ | RDS Read Replicas | Amazon Aurora |
| :--- | :--- | :--- | :--- |
| **Mục đích chính** | **High Availability & DR** | **Tăng hiệu năng ĐỌC (Read Scaling)** | Cloud-native DB: Nhanh gấp **5x MySQL / 3x PostgreSQL** |
| **Cơ chế nhân bản** | **Synchronous** (Đồng bộ) tới Standby AZ khác | **Asynchronous** (Bất đồng bộ), tối đa **15 Replicas** | Lưu trữ phân tán **6 bản sao trên 3 AZ** (tự phục hồi khi mất tới 2 bản sao mà vẫn ghi được!) |
| **Đọc từ Standby/Replica?** | **KHÔNG** (ở Multi-AZ DB Instance truyền thống). *Lưu ý: Multi-AZ DB Cluster có 2 Readable Standbys* | **CÓ** (Cung cấp Endpoint đọc riêng) | Có thể tạo tới **15 Aurora Replicas** chia sẻ chung Storage Layer (Replication lag < 10 ms) |
| **Cross-Region** | Không (chỉ trong 1 Region) | **Có** (hỗ trợ cả DR & giảm độ trễ đọc toàn cầu) | **Aurora Global Database**: Nhân bản đa Region **< 1 giây** (`RPO = 1s`, `RTO < 1 phút`) |

### Các dịch vụ bổ trợ Database quan trọng trong SAA-C03
- **RDS Proxy**: Pooling kết nối DB cho **AWS Lambda** (hàng nghìn Lambda nổ lên cùng lúc sẽ làm cạn `max_connections` của RDS nếu không có RDS Proxy!). Ngoài ra còn giảm thời gian failover của RDS/Aurora xuống **66%**.
- **Aurora Serverless v2**: Tự động scale dung lượng (ACU) theo từng giây dựa trên tải thực tế (phù hợp tải giật cục không đoán trước).
- **Amazon DynamoDB**:
  - NoSQL Key-Value/Document độ trễ **single-digit millisecond**.
  - **DAX (DynamoDB Accelerator)**: In-memory cache giảm độ trễ đọc xuống **microsecond** (chỉ cho DynamoDB).
  - **DynamoDB Global Tables**: Active-Active Multi-Region replication.
  - **DynamoDB Streams + Lambda**: Kích hoạt xử lý Event-Driven mỗi khi có item được thêm/sửa/xóa.
  - **TTL (Time to Live)**: Tự động xóa item hết hạn (session, log) **hoàn toàn miễn phí** (không tốn WCU).
- **Amazon ElastiCache (Redis vs Memcached)**:
  - **Redis**: Hỗ trợ Multi-AZ Auto Failover, Persistence, Sorted Sets (bảng xếp hạng Leaderboard), Pub/Sub.
  - **Memcached**: Multi-threaded đơn giản, không persistence, không Multi-AZ failover.

---

## 4. Bẫy đề thi SAA-C03 (Exam Traps)
1. **Lambda kết nối RDS bị lỗi `Too many connections`**: Đáp án chuẩn là chèn **Amazon RDS Proxy** ở giữa (hoặc chuyển sang DynamoDB nếu kiến trúc cho phép).
2. **EBS Multi-Attach**: Chỉ hỗ trợ **`io1` / `io2`** và **CHỈ trong cùng 1 AZ** (và OS phải dùng Cluster-aware filesystem như GFS2). Nếu cần chia sẻ file qua **nhiều AZ** → **Amazon EFS**.
3. **S3 Consistency**: Từ 12/2020, S3 hỗ trợ **Strong Read-After-Write Consistency** cho mọi thao tác PUT/DELETE/LIST (không còn Eventual Consistency nữa!).
4. **RDS vs Aurora Backup Retention**: RDS hỗ trợ backup tự động tối đa **35 ngày** (muốn giữ 7 năm phải dùng Manual Snapshot hoặc **AWS Backup**).

---

[← Bài trước](11-containers-ecs-eks-fargate.md) | [Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/12-s3-storage-gateway.md) | [Bài tiếp →](13-ebs-efs-fsx-deep-dive.md)
