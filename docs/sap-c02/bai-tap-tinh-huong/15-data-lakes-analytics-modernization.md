# Bài tập tình huống — Chủ đề 15: Enterprise Data Lakes, Streaming Analytics & Database Modernization — Lake Formation, Glue, EMR, Kinesis & Redshift

> AWS Lake Formation Cross-Account, AWS Glue, Amazon EMR, Kinesis Data Streams/Firehose, Redshift RA3 & Data Sharing.
> **Số câu hỏi:** 3 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A cybersecurity SaaS company ingests 15 TB of application and firewall logs per day into an Amazon OpenSearch Service cluster. Analysts actively query the last 7 days of logs for real-time dashboards, occasionally search logs from days 8 to 90 during incident investigations, and must retain logs from days 91 to 365 for regulatory audits (with rare, infrequent ad-hoc queries). Currently, all 365 days of indices reside on hot r6g.8xlarge data nodes with gp3 EBS volumes, causing monthly storage costs to skyrocket. How can the architect dramatically reduce OpenSearch costs while keeping all 365 days searchable on demand?

- **A.** Replace all gp3 EBS volumes on the hot data nodes with io2 Block Express volumes to improve index compression and reduce storage costs.
- **B.** Configure OpenSearch ISM policies to keep days 1-7 in Hot storage, move days 8-90 to UltraWarm, and move days 91-365 to Cold storage on S3.
- **C.** Delete all indices older than 7 days from OpenSearch and instruct auditors to manually grep raw JSON log files archived in Amazon S3 Glacier Deep Archive.
- **D.** Disable OpenSearch replica shards on all hot and warm indices across all 365 days to cut storage costs by 50%.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty SaaS an ninh mạng tiếp nhận 15 TB nhật ký ứng dụng và tường lửa mỗi ngày vào cụm Amazon OpenSearch Service. Các nhà phân tích tích cực truy vấn nhật ký 7 ngày gần nhất cho bảng điều khiển thời gian thực, thỉnh thoảng tìm kiếm nhật ký từ ngày thứ 8 đến ngày 90 trong quá trình điều tra sự cố, và phải lưu giữ nhật ký từ ngày 91 đến 365 cho kiểm toán quy định (với các truy vấn đột xuất hiếm gặp). Hiện tại, toàn bộ 365 ngày chỉ mục đều nằm trên các hot data node r6g.8xlarge với gp3 EBS volume, khiến chi phí lưu trữ hàng tháng tăng vọt. Kiến trúc sư có thể giảm mạnh chi phí OpenSearch trong khi vẫn giữ toàn bộ 365 ngày có thể tìm kiếm theo yêu cầu bằng cách nào?

**Đáp án đúng:** **B**

Với bài toán tối ưu chi phí log analytics trên **Amazon OpenSearch Service** có vòng đời truy cập rõ ràng (Nóng -> Ấm -> Lạnh), giải pháp chuẩn là tự động hóa bằng **Index State Management (ISM)** chuyển dần từ **Hot -> UltraWarm -> Cold Storage**.

- **A:** io2 Block Express đắt hơn rất nhiều so với gp3 và không cung cấp cơ chế nén giảm chi phí lưu trữ dài hạn.
- **B (Đúng):** Chính xác. Kiến trúc phân tầng lưu trữ của Amazon OpenSearch Service (Hot -> UltraWarm -> Cold storage trên S3) kết hợp tự động hóa bằng Index State Management (ISM) giúp giữ hiệu năng cao cho 7 ngày gần nhất, giảm mạnh chi phí cho 8-90 ngày bằng UltraWarm (read-only trên S3 + cache cục bộ), và tối ưu tối đa cho 91-365 ngày bằng Cold storage mà vẫn có thể gắn lại để truy vấn khi cần kiểm toán.
- **C:** Xóa dữ liệu khỏi OpenSearch và bắt kiểm toán viên tự grep file trong Glacier Deep Archive vừa mất nhiều giờ/ngày khôi phục vừa không giữ được khả năng tìm kiếm on-demand trong OpenSearch.
- **D:** Tắt replica shards trên hot indices làm mất tính sẵn sàng cao và nguy cơ mất dữ liệu khi node gặp sự cố, trong khi vẫn giữ cả 365 ngày dữ liệu trên tầng Hot đắt đỏ.

</details>

### Câu 2 `medium`

A data analytics team runs hundreds of daily Amazon Athena SQL queries against 100 TB of uncompressed JSON clickstream files stored in Amazon S3 (organized by /year/month/day/hour/). Queries typically filter on a 2-hour window and select only 4 out of 60 JSON fields, yet each query takes over 2 minutes and costs tens of dollars due to full-dataset scanning and slow AWS Glue Data Catalog partition listing across 50,000 partitions. Which combination of optimizations will reduce Athena query costs and execution time by over 90%?

- **A.** Move the 100 TB of uncompressed JSON clickstream files from Amazon S3 Standard to S3 Glacier Instant Retrieval storage.
- **B.** Run MSCK REPAIR TABLE on the Glue Data Catalog table before every single Amazon Athena SQL query.
- **C.** Convert JSON to columnar Apache Parquet (or Iceberg) with Snappy/ZSTD compression, and enable Athena Partition Projection on date/hour keys.
- **D.** Keep the clickstream files in uncompressed JSON format and split them into 10 million tiny 10 KB files for higher Amazon Athena query parallelism.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm phân tích dữ liệu chạy hàng trăm truy vấn SQL Amazon Athena mỗi ngày trên 100 TB tệp clickstream JSON không nén lưu trong Amazon S3 (được tổ chức theo /year/month/day/hour/). Các truy vấn thường lọc trong khung thời gian 2 giờ và chỉ chọn 4 trong số 60 trường JSON, nhưng mỗi truy vấn mất hơn 2 phút và tốn hàng chục đô la do quét toàn bộ tập dữ liệu và liệt kê phân vùng AWS Glue Data Catalog chậm trên 50.000 phân vùng. Sự kết hợp tối ưu hóa nào sẽ giảm chi phí và thời gian thực thi truy vấn Athena hơn 90%?

**Đáp án đúng:** **C**

Bộ 3 tối ưu kinh điển cho **Amazon Athena**: (1) Định dạng **Columnar (Parquet/ORC/Iceberg)** + nén **Snappy/ZSTD**, (2) Kích thước file tối ưu (~128 MB - 1 GB, tránh small files), và (3) **Partition Projection** để loại bỏ độ trễ đọc hàng chục nghìn partition từ Glue Data Catalog.

- **A:** Chuyển sang Glacier Instant Retrieval không giảm lượng dữ liệu Athena phải quét (vẫn tính $5/TB trên JSON không nén) và còn phát sinh thêm phí truy xuất (retrieval fee) mỗi lần chạy query.
- **B:** MSCK REPAIR TABLE quét toàn bộ thư mục S3 rất chậm với 50.000 partition và hoàn toàn không giải quyết được vấn đề quét toàn bộ dữ liệu JSON không nén.
- **C (Đúng):** Chính xác. Athena tính tiền theo dung lượng dữ liệu quét ($5/TB). Chuyển từ JSON không nén sang định dạng lưu theo cột (columnar) Apache Parquet/Iceberg + nén Snappy/ZSTD giúp Athena chỉ đọc đúng 4/60 cột cần thiết và giảm tới >90% dung lượng quét. Bật Partition Projection giúp Athena tự tính toán đường dẫn partition trong bộ nhớ thay vì gọi API Glue Data Catalog chậm chạp cho 50.000 partition.
- **D:** Chia thành hàng chục triệu file nhỏ (small files problem) làm giảm thảm hại hiệu năng Athena do overhead gọi S3 GET/LIST, và giữ JSON không nén vẫn phải quét toàn bộ 60 trường dữ liệu.

</details>

### Câu 3 `hard`

A quantitative hedge fund is migrating an on-premises High Performance Computing (HPC) Monte Carlo risk-simulation cluster (2,000 Linux compute nodes) to AWS ParallelCluster on Amazon EC2. The simulation jobs require a shared POSIX-compliant parallel file system capable of hundreds of GB/s of aggregate throughput and sub-millisecond latency. Source market tick datasets are stored durably in an Amazon S3 data lake, and results written by the compute nodes must be automatically exported back to S3 without writing custom S3 sync scripts. Which AWS storage service is purpose-built for this HPC workload?

- **A.** Amazon EFS in General Purpose performance mode mounted via NFSv4.1 across all 2,000 Linux HPC compute nodes.
- **B.** Amazon EBS st1 (Throughput Optimized HDD) volumes with Multi-Attach enabled across all 2,000 Linux compute nodes.
- **C.** Amazon FSx for Windows File Server deployed in Multi-AZ mode with SMB 3.0 shares mounted across all 2,000 Linux nodes.
- **D.** Amazon FSx for Lustre configured with a Data Repository Association (DRA) linked directly to the Amazon S3 bucket.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một quỹ đầu cơ định lượng đang di chuyển cụm mô phỏng rủi ro Monte Carlo Tính toán Hiệu năng Cao (HPC) on-premises (2.000 compute node Linux) lên AWS ParallelCluster trên Amazon EC2. Các tác vụ mô phỏng yêu cầu một hệ thống tệp song song tuân thủ POSIX dùng chung có khả năng đạt thông lượng tổng hợp hàng trăm GB/s và độ trễ dưới một mili-giây. Tập dữ liệu biến động giá thị trường nguồn được lưu bền vững trong Amazon S3 data lake, và kết quả do các compute node ghi ra phải được tự động xuất trở lại S3 mà không cần viết tập lệnh đồng bộ S3 tùy chỉnh. Dịch vụ lưu trữ AWS nào được xây dựng chuyên biệt cho workload HPC này?

**Đáp án đúng:** **D**

Trong mọi bài toán **HPC / ML / Genomics / Financial Monte Carlo** cần **POSIX parallel file system siêu tốc (hàng trăm GB/s, sub-ms latency)** tích hợp hai chiều trực tiếp với **Amazon S3**, đáp án luôn là **Amazon FSx for Lustre + Data Repository Association (DRA)**.

- **A:** Amazon EFS không đạt mức throughput hàng trăm GB/s với độ trễ dưới 1ms cho cụm HPC 2.000 node và không có tính năng liên kết hai chiều Data Repository Association bản địa với S3 như FSx for Lustre.
- **B:** EBS st1 không hỗ trợ Multi-Attach (chỉ io1/io2 hỗ trợ tối đa 16 instances) và không thể gắn chung làm POSIX parallel file system cho 2.000 máy chủ Linux.
- **C:** FSx for Windows sử dụng giao thức SMB cho Windows, không phải hệ thống file song song chuẩn POSIX cho cụm HPC Linux.
- **D (Đúng):** Chính xác. Amazon FSx for Lustre là hệ thống file song song chuẩn POSIX hiệu năng siêu cao (hàng trăm GB/s throughput, hàng triệu IOPS, độ trễ dưới 1ms) chuyên cho HPC/ML. Tính năng Data Repository Association (DRA) liên kết hai chiều trực tiếp với Amazon S3 giúp tự động nạp dữ liệu đầu vào (lazy loading) và tự động xuất kết quả ngược về S3 mà không cần viết script đồng bộ.

</details>

---

[Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md)
