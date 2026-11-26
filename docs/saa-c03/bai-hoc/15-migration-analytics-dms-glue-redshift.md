# Di chuyển Dữ liệu & Phân tích Big Data trên AWS (SAA-C03 Domain 3 & 4)

Trong đề thi SAA-C03, các bài toán về **Migration** (chuyển TB/PB dữ liệu và Database từ On-premises lên AWS với downtime tối thiểu) và **Data Analytics** (xây dựng Data Lake, Streaming Pipeline, Data Warehouse) chiếm số lượng câu hỏi rất lớn.

---

## 1. Dịch vụ Di chuyển Dữ liệu & Database (Migration Services)

### AWS Database Migration Service (DMS) & Schema Conversion Tool (SCT)
- **Homogeneous Migration** (cùng loại DB, ví dụ Oracle → Oracle, MySQL → Aurora MySQL): Chỉ cần dùng **AWS DMS** (hoặc công cụ native như `mysqldump`/Aurora Read Replica).
- **Heterogeneous Migration** (khác loại DB, ví dụ Oracle → PostgreSQL, SQL Server → Aurora MySQL):
  - Bước 1: Dùng **AWS Schema Conversion Tool (SCT)** để chuyển đổi cấu trúc bảng, Stored Procedures, Views sang định dạng mới.
  - Bước 2: Dùng **AWS DMS** để di chuyển dữ liệu (Full Load + **CDC — Change Data Capture** để đồng bộ liên tục với **near-zero downtime**!).
- **Lưu ý DMS**: Trong quá trình migration, Database nguồn **vẫn hoạt động bình thường**. DMS hỗ trợ **Multi-AZ** cho Replication Instance để đảm bảo chịu lỗi cao.

### AWS DataSync vs AWS Transfer Family vs Snow Family
| Dịch vụ | Giao thức / Phương tiện | Kịch bản sử dụng chuẩn SAA-C03 |
| :--- | :--- | :--- |
| **AWS DataSync** | Qua mạng Internet hoặc **Direct Connect** (nhanh hơn 10x công cụ mã nguồn mở) | Đồng bộ dữ liệu tự động, định kỳ giữa **On-premises NFS/SMB** lên **S3, EFS, FSx** (giữ nguyên metadata & permissions). |
| **AWS Transfer Family** | **SFTP, FTPS, FTP, AS2** | Đối tác/khách hàng cần upload file qua giao thức **SFTP truyền thống** thẳng vào **Amazon S3** hoặc **EFS** mà không cần tự quản lý server SFTP. |
| **AWS Snowcone** | Thiết bị vật lý nhỏ (8 TB HDD / 14 TB SSD) | Biên mạng (Edge computing), không gian hẹp, hoặc gửi qua mạng bằng DataSync agent cài sẵn. |
| **AWS Snowball Edge** | Thiết bị vật lý lớn (**Storage Optimized: 80 TB** / Compute Optimized: 28–42 TB + CPU/GPU) | Di chuyển **vài chục TB đến vài PB** khi mạng Internet quá chậm (quy tắc ngón tay cái: **truyền qua mạng mất > 1 tuần thì dùng Snowball**!). |
| **AWS Snowmobile** | Xe container đầu kéo (**lên tới 100 PB** mỗi xe) | Di chuyển cả một Datacenter quy mô Exabyte. |

---

## 2. Streaming Data: Kinesis Data Streams vs Firehose vs MSK

| Tiêu chí | Amazon Kinesis Data Streams (KDS) | Amazon Data Firehose (trước là Kinesis Firehose) | Amazon MSK (Managed Streaming for Apache Kafka) |
| :--- | :--- | :--- | :--- |
| **Quản lý & Scale** | Quản lý theo **Shards** (1 MB/s hoặc 1,000 rec/s input; 2 MB/s output mỗi shard) hoặc **On-Demand mode** | **Hoàn toàn Serverless**, tự động scale (Zero administration) | Managed **Apache Kafka** (Quản lý Brokers/Zookeeper/KRaft) |
| **Độ trễ** | **Real-time (~70–200 ms)** | **Near Real-time** (Buffer tối thiểu 60 giây hoặc 1 MB) | **Real-time (milliseconds)** |
| **Lưu trữ dữ liệu** | Lưu tối đa **365 ngày** (hỗ trợ Replay dữ liệu) | **Không lưu trữ** (đẩy thẳng tới đích) | Tùy cấu hình EBS/Tiered Storage |
| **Đích đến (Destinations)** | Phải tự viết Consumer (Lambda, EC2, KCL, Kinesis Data Analytics/Flink) | Tự động đẩy thẳng tới **S3, Redshift, OpenSearch, Splunk**, hỗ trợ **Lambda transformation** & nén GZIP/Parquet | Kafka Consumers (ECS, EKS, EC2, Lambda) |

> **Exam Tip**: Cần đẩy dữ liệu streaming vào **S3 hoặc Redshift ở định dạng Parquet** với **chi phí vận hành thấp nhất (least operational overhead)** và chấp nhận trễ 1 phút → **Amazon Data Firehose**! Cần phân tích **Real-time dưới 1 giây** với nhiều Consumer đọc cùng lúc → **Kinesis Data Streams**.

---

## 3. Data Lake & Data Warehouse: S3 + Glue + Athena vs Redshift vs EMR

| Dịch vụ | Vai trò trong kiến trúc Analytics | Điểm nhấn SAA-C03 |
| :--- | :--- | :--- |
| **Amazon Athena** | **Serverless Interactive SQL Query** trực tiếp trên **S3** | Trả tiền theo **lượng dữ liệu quét ($5 / TB scanned)**. Để tối ưu chi phí & tốc độ: Chuyển CSV/JSON sang **Apache Parquet / ORC**, nén **Snappy/GZIP**, và **Partitioning** theo ngày (`year=/month=/day=`)! |
| **AWS Glue** | **Serverless ETL** (Apache Spark) + **Glue Data Catalog** | **Glue Crawler** tự động quét S3 để suy luận Schema lưu vào Data Catalog (Athena, Redshift Spectrum dùng chung Catalog này). Hỗ trợ **Glue DataBrew** (chuẩn hóa dữ liệu không cần code). |
| **Amazon Redshift** | **Petabyte-scale Cloud Data Warehouse (OLAP)** | Phân tích SQL phức tạp trên dữ liệu có cấu trúc (BI/Reporting). **Redshift Spectrum** cho phép query trực tiếp dữ liệu trên S3 mà không cần load vào ổ đĩa Redshift! Hỗ trợ **Redshift Serverless** & **Concurrency Scaling**. |
| **Amazon EMR** | **Managed Big Data Cluster** (Spark, Hadoop, Hive, Presto, HBase) | Dùng khi cần **kiểm soát sâu Spark/Hadoop**, xử lý dữ liệu cực lớn nhiều giờ với **EMR Spot Instances** (Task nodes dùng Spot để tiết kiệm 90%). |
| **Amazon OpenSearch Service** | **Full-text Search & Log Analytics** (ELK Stack) | Tìm kiếm văn bản tự do (Fuzzy search, Autocomplete) hoặc phân tích log real-time với OpenSearch Dashboards. |
| **Amazon QuickSight** | **Serverless BI Dashboard** | Trực quan hóa dữ liệu từ Athena, Redshift, RDS, S3. Dùng **SPICE** (In-memory engine) để tăng tốc dashboard cực nhanh; tính phí theo **Per-Session pricing** cho người xem thỉnh thoảng. |

### AWS Lake Formation
- Dịch vụ xây dựng Data Lake trên S3 nhanh chóng, cung cấp **phân quyền chi tiết ở mức Cột (Column-level) và Hàng (Row-level)** cho người dùng khi query qua Athena/Redshift Spectrum/EMR mà không cần tạo hàng trăm S3 Bucket Policies phức tạp.

---

## 4. Bẫy đề thi SAA-C03 (Exam Traps)
1. **Athena quét quá nhiều dữ liệu (Hóa đơn cao & Chậm)**: Đáp án chuẩn luôn là **Chuyển định dạng sang Parquet/ORC + Nén + Partitioning** (giảm tới 90–99% dung lượng quét).
2. **Redshift vs RDS**: RDS (OLTP) dùng cho giao dịch hàng ngày (thêm/sửa/xóa từng dòng). Redshift (OLAP) dùng cho truy vấn tổng hợp hàng tỷ dòng phục vụ báo cáo BI.
3. **Di chuyển DB khác Engine**: Oracle → PostgreSQL bắt buộc phải có **AWS SCT** trước khi chạy **AWS DMS**!
4. **S3 Event Notifications vs DataSync**: S3 Event là trigger xử lý khi có file mới; **DataSync** mới là dịch vụ copy dữ liệu hàng loạt từ On-premises NFS/SMB lên S3/EFS/FSx.

---

[← Bài trước](14-databases-rds-aurora-dynamodb.md) | [Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/15-migration-analytics.md) | [Bài tiếp →](16-cost-optimization-mastery.md)
