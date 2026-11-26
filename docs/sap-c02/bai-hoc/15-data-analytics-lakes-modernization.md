# Chuyên sâu Enterprise Data Lakes, Streaming Analytics & Hiện đại hóa Database

Trong Domain 4 của kỳ thi **AWS Certified Solutions Architect - Professional (SAP-C02)**, di chuyển workload không chỉ dừng ở việc "lift-and-shift" máy chủ EC2 mà còn bao gồm xây dựng **Enterprise Data Lake** có quản trị phân quyền chặt chẽ, xử lý dữ liệu thời gian thực (Streaming Analytics), di chuyển cơ sở dữ liệu ít downtime nhất (Near-Zero Downtime Migration) và hiện đại hóa từ cơ sở dữ liệu thương mại đắt đỏ (Oracle, SQL Server) sang **Purpose-Built Cloud-Native Databases**.

---

## 1. Kiến trúc Enterprise Data Lake trên AWS

Một Data Lake chuẩn doanh nghiệp trên AWS tách biệt hoàn toàn **Storage (Amazon S3)** khỏi **Compute (Athena, EMR, Redshift, Glue)**, quản trị tập trung bằng **AWS Lake Formation**.

```text
[Data Sources] --> [Ingestion] --> [Amazon S3 Data Lake] --> [Governance & Catalog] --> [Analytics & BI]
  RDS / On-Prem      DMS/Glue       Raw -> Curated -> Gold     AWS Lake Formation         Amazon Athena
  Streams/IoT        Firehose       (Apache Parquet / ORC      + Glue Data Catalog        Redshift Spectrum
  SaaS Apps          AppFlow         / Apache Iceberg)         (Row/Col/Cell RBAC/TBAC)   Amazon QuickSight
```

### Vai trò từng thành phần cốt lõi
1. **Amazon S3 (Storage Layer)**:
   - Chuẩn hóa định dạng sang **Apache Parquet** hoặc **Apache ORC** (columnar format) kèm nén **Snappy/Gzip** giúp giảm 70–90% dung lượng và chi phí quét trên Athena/Redshift Spectrum.
   - Sử dụng **Apache Iceberg** (Open Table Format) trên S3 khi đề bài yêu cầu **ACID transactions, time-travel queries, schema evolution, xóa/cập nhật bản ghi GDPR (row-level delete)** ngay trên Data Lake.
   - Áp dụng **Partitioning** (ví dụ `year=2026/month=11/day=19/`) hoặc **Partition Projection** trên Athena để loại bỏ nhu cầu chạy `MSCK REPAIR TABLE` hay Glue Crawler liên tục.
2. **AWS Lake Formation (Governance & Fine-Grained Access Control)**:
   - Giải quyết bài toán khó nhất của S3 Data Lake truyền thống: **quản trị phân quyền chi tiết ở mức Database, Table, Column, Row và Cell** (ví dụ: ẩn cột `SSN`/`Salary` đối với nhóm Marketing) mà **không phải nhân bản dữ liệu** ra nhiều S3 bucket hay viết hàng trăm S3 Bucket Policy phức tạp.
   - **LF-TBAC (Tag-Based Access Control)**: Gắn LF-Tags (ví dụ `Sensitivity=PII`, `Department=Finance`) lên các bảng/cột và cấp quyền dựa trên Tag → dễ mở rộng cho hàng nghìn bảng và hàng trăm tài khoản trong AWS Organizations (chia sẻ cross-account qua **AWS RAM**).
3. **Amazon Athena vs Amazon Redshift Spectrum vs Redshift Serverless**:
   - **Amazon Athena**: Serverless, trả phí theo dung lượng dữ liệu quét (**$5/TB**), hỗ trợ **Athena Federated Query** (dùng Lambda connector truy vấn trực tiếp RDS, DynamoDB, DocumentDB, On-Premises SQL cùng lúc với S3).
   - **Redshift Spectrum**: Cho phép cụm Redshift hiện có truy vấn trực tiếp exabyte dữ liệu trên S3 và `JOIN` với bảng local trong Redshift mà không cần load toàn bộ dữ liệu vào ổ đĩa Redshift.
   - **Redshift Serverless**: Tự động cấp phát và scale RPU (Redshift Processing Units) cho workload phân tích biến động/không đều, tích hợp **Zero-ETL** trực tiếp từ **Aurora MySQL/PostgreSQL, RDS MySQL, DynamoDB** sang Redshift trong vài giây mà không cần pipeline ETL trung gian.

> **Exam Tip**:
> - Thấy yêu cầu **"column-level / row-level / cell-level security on S3 Data Lake across multiple AWS accounts without duplicating data"** → chọn **AWS Lake Formation** kết hợp **LF-TBAC** và **AWS RAM**.
> - Thấy yêu cầu **"real-time analytics on Aurora/DynamoDB transactional data in Redshift with minimal operational overhead and no ETL pipelines"** → chọn **Amazon Redshift Zero-ETL Integration**.

---

## 2. Real-Time Streaming Analytics: Data Firehose vs Managed Service for Apache Flink

| Tiêu chí | Amazon Data Firehose | Amazon Managed Service for Apache Flink (trước là Kinesis Data Analytics) |
| :--- | :--- | :--- |
| **Bản chất** | Dịch vụ **near real-time delivery** (tối thiểu 60 giây hoặc 1 MB buffer; có chế độ giảm buffer) | Động cơ xử lý luồng **stateful real-time** độ trễ dưới giây (sub-second) |
| **Chuyển đổi dữ liệu** | Chuyển đổi định dạng đơn giản (**JSON → Parquet/ORC** theo Glue Schema), nén, hoặc gọi Lambda transform từng bản ghi | **Stateful stream processing phức tạp**: Windowed aggregations (Tumbling/Sliding/Session windows), **Stream-to-Stream Joins**, phát hiện bất thường (anomaly detection), pattern matching |
| **Đích đến (Destinations)** | Trực tiếp vào **S3, Redshift, OpenSearch, Splunk, Snowflake, HTTP Endpoints, Apache Iceberg tables** | Xuất ra Kinesis Data Streams, MSK, S3, OpenSearch, DynamoDB hoặc bất kỳ Flink sink nào |
| **Quản lý hạ tầng** | Hoàn toàn Serverless (tự scale hoàn toàn) | Tự scale theo KPU (Kinesis Processing Units), hỗ trợ checkpointing & snapshots để khôi phục trạng thái |

> **Exam Tip**:
> - Chỉ cần **ingest streaming logs → chuyển sang Parquet → lưu vào S3/OpenSearch** với ít vận hành nhất → chọn **Amazon Data Firehose** (không cần dựng Flink hay EMR Spark Streaming).
> - Cần **tính toán trung bình trượt (rolling/sliding window 5 phút), join 2 luồng sự kiện theo thời gian thực với độ trễ < 1 giây** → chọn **Amazon Managed Service for Apache Flink**.

---

## 3. Amazon OpenSearch Service: Cross-Cluster Replication & Tối ưu Chi phí

- **Cross-Cluster Replication (CCR)**: Đồng bộ hóa index (chỉ mục) theo mô hình Active-Passive (Leader → Follower) giữa các OpenSearch domain ở **cùng Region hoặc khác Region (Cross-Region DR)** với RPO thấp và giảm độ trễ đọc cho người dùng toàn cầu.
- **Kiến trúc lưu trữ đa tầng (Tiered Storage) tiết kiệm chi phí**:
  - **Hot Tier** (EBS/Instance Store): Dữ liệu tìm kiếm/ghi mới nhất.
  - **UltraWarm Tier**: Lưu dữ liệu chỉ đọc (read-only) trên S3 kết hợp cache cục bộ → giảm tới **90% chi phí** so với Hot nodes.
  - **Cold Storage**: Tách rời hoàn toàn khỏi cụm compute (lưu trên S3, chỉ attach khi cần tra cứu lịch sử hiếm gặp).
  - **Index State Management (ISM)**: Tự động hóa vòng đời di chuyển index từ `Hot → UltraWarm → Cold → Delete`.
- **OpenSearch Serverless**: Tự động scale OCU (OpenSearch Compute Units) tách biệt giữa Ingestion và Search — lý tưởng cho workload tìm kiếm/log không dự đoán trước lưu lượng hoặc Vector Search cho AI/RAG.

---

## 4. Di chuyển Database bằng AWS DMS & AWS SCT

### Homogeneous vs Heterogeneous Migration

| Loại di chuyển | Ví dụ | Công cụ chuẩn | Lưu ý quan trọng trên SAP-C02 |
| :--- | :--- | :--- | :--- |
| **Homogeneous** (Cùng engine) | On-Premises PostgreSQL → Aurora PostgreSQL; Oracle → RDS Oracle | **Native Tools** (`pg_dump`/`pg_restore`, Oracle Data Guard/RMAN, MySQL Percona XtraBackup) hoặc **AWS DMS** (nếu cần CDC giảm tối đa downtime) | Native tools giữ nguyên toàn bộ stored procedures, triggers, indexes, secondary objects tốt hơn DMS. |
| **Heterogeneous** (Khác engine) | Oracle / SQL Server → Aurora PostgreSQL / MySQL | **Bước 1: AWS Schema Conversion Tool (SCT)** chuyển đổi schema, views, stored procedures, triggers.<br>**Bước 2: AWS DMS** (Full Load + **CDC** - Change Data Capture) đồng bộ dữ liệu liên tục. | **DMS KHÔNG chuyển đổi schema phức tạp** (nó chỉ tạo cấu trúc bảng cơ bản và khóa chính). Luôn cần **SCT trước, DMS sau**! |

### Best Practices cho DMS quy mô lớn (TB dữ liệu & Near-Zero Downtime)
1. **Dùng DMS Fleet Advisor**: Tự động quét môi trường On-Premises, lập danh mục DB và đề xuất target engine phù hợp.
2. **Tối ưu hiệu năng Full Load + CDC**:
   - Tạm thời **disable secondary indexes, foreign keys, triggers** trên database đích trong pha Full Load, sau đó tạo lại trước khi bật CDC (tránh khóa bảng và chậm gấp nhiều lần).
   - Bật **Multi-AZ trên DMS Replication Instance** cho môi trường Production để tránh gián đoạn quá trình CDC khi AZ gặp sự cố.
   - Bật **DMS Data Validation** để kiểm tra toàn vẹn dữ liệu giữa nguồn và đích trước khi cutover.
   - Với dữ liệu cực lớn (hàng chục TB) mà đường truyền mạng hạn chế → kết hợp **AWS SCT Data Extractor + AWS Snowball Edge** cho pha Full Load, sau đó dùng **DMS CDC** qua mạng để đồng bộ phần thay đổi (delta).

```bash
# Ví dụ: Tạo DMS Replication Task chạy Full Load + CDC kèm Validation
aws dms create-replication-task \
  --replication-task-identifier "oracle-to-aurora-pg-cdc" \
  --source-endpoint-arn "arn:aws:dms:us-east-1:111122223333:endpoint:SOURCE_ORACLE" \
  --target-endpoint-arn "arn:aws:dms:us-east-1:111122223333:endpoint:TARGET_AURORA_PG" \
  --replication-instance-arn "arn:aws:dms:us-east-1:111122223333:rep:DMS_INSTANCE" \
  --migration-type "full-load-and-cdc" \
  --table-mappings file://table-mappings.json \
  --replication-task-settings '{"ValidationSettings":{"EnableValidation":true}}'
```

---

## 5. Hiện đại hóa Database: Phá bỏ xiềng xích Commercial License

### Babelfish for Aurora PostgreSQL (Modernize SQL Server cực nhanh)
- **Bài toán**: Doanh nghiệp muốn bỏ license **Microsoft SQL Server** đắt đỏ để chuyển sang **Aurora PostgreSQL**, nhưng ứng dụng legacy có hàng trăm nghìn dòng code viết bằng **T-SQL** và dùng giao thức **TDS (Tabular Data Stream)** — không thể viết lại toàn bộ code ứng dụng ngay lập tức.
- **Giải pháp**: Bật **Babelfish for Aurora PostgreSQL**. Nó cung cấp một lớp dịch giao thức giúp Aurora PostgreSQL hiểu trực tiếp lệnh **T-SQL** và kết nối qua cổng **1433 (TDS)** song song với cổng 5432 (PostgreSQL) → Di chuyển nhanh với **thay đổi code ứng dụng tối thiểu**, sau đó hiện đại hóa dần sang PostgreSQL thuần.

### Chuyển đổi RDBMS sang Amazon DynamoDB (Single-Table Design)
Khi hiện đại hóa ứng dụng e-commerce/gaming có lưu lượng hàng trăm nghìn TPS, độ trễ single-digit millisecond và mô hình truy cập (Access Patterns) đã biết trước:
- **Single-Table Design**: Thay vì tách bảng `Users`, `Orders`, `OrderItems` rồi `JOIN` (DynamoDB không hỗ trợ `JOIN`), gom các thực thể liên quan vào **1 bảng duy nhất** sử dụng Generic Keys (`PK`, `SK` — ví dụ `PK: USER#123`, `SK: ORDER#2026-11-19#999`) để lấy toàn bộ dữ liệu liên quan chỉ trong **1 truy vấn `Query` duy nhất**.
- **GSI (Global Secondary Index) & Sparse Index**: Tạo các góc nhìn truy vấn phụ khác nhau mà không phải `Scan` toàn bảng.
- **Write Sharding**: Thêm hậu tố ngẫu nhiên (ví dụ `ORDER#2026-11-19#0` đến `#9`) vào Partition Key khi có khóa nóng (Hot Partition) để phân tán đều WCU trên nhiều partition vật lý.

---

## 6. Bảng quyết định nhanh cho Domain 4 (Analytics & DB Modernization)

| Yêu cầu trong câu hỏi SAP-C02 | Giải pháp tối ưu |
| :--- | :--- |
| Bảo mật mức cột/dòng trên S3 Data Lake đa tài khoản | **AWS Lake Formation** (LF-TBAC + AWS RAM) |
| ACID transactions & GDPR row-level delete trên S3 Data Lake | **Apache Iceberg** trên S3 (hỗ trợ bởi Athena, Glue, EMR, Firehose) |
| Ingest streaming JSON → Parquet trên S3, không quản lý server | **Amazon Data Firehose** |
| Tính toán stateful sliding window / stream join độ trễ < 1s | **Amazon Managed Service for Apache Flink** |
| Chuyển Oracle/SQL Server sang Aurora PostgreSQL (full migration) | **AWS SCT** (schema/code) + **AWS DMS** (Full Load + CDC) |
| Bỏ license SQL Server sang Aurora PG với **ít sửa code T-SQL nhất** | **Babelfish for Aurora PostgreSQL** |
| Phân tích dữ liệu Aurora/DynamoDB trên Redshift gần thời gian thực không cần ETL | **Amazon Redshift Zero-ETL Integration** |
| Tối ưu chi phí lưu log lịch sử trên OpenSearch nhưng vẫn tìm kiếm được | **OpenSearch UltraWarm + Cold Storage + ISM** |

---

[← Bài trước](14-migration-refactor-spaces-mainframe.md) | [Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/15-data-lakes-analytics-modernization.md)
