# Bài tập tình huống — Chủ đề 15: Di chuyển Dữ liệu & Big Data Analytics — DMS, DataSync, Snow Family, Athena, Glue & Redshift

> AWS DMS & SCT, AWS DataSync, Snowball Edge/Snowmobile, Amazon Athena, AWS Glue ETL, Amazon Redshift & EMR.
> **Số câu hỏi:** 4 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A company wants to migrate a 10 TB on-premises Oracle database to Amazon Aurora PostgreSQL with minimal downtime. The database has complex stored procedures, triggers, and views that must be converted to PostgreSQL syntax. Which combination of AWS services should a solutions architect recommend?

- **A.** Use AWS DataSync over Direct Connect to copy the raw Oracle database files to Amazon S3, then import them directly into Aurora.
- **B.** Use AWS DMS alone with continuous replication without running any schema conversion tool beforehand.
- **C.** Use AWS Schema Conversion Tool (AWS SCT) to convert the schema and stored procedures, then use AWS DMS with Change Data Capture (CDC).
- **D.** Create an Amazon Aurora PostgreSQL Read Replica directly from the on-premises Oracle database using native log shipping.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty muốn di chuyển cơ sở dữ liệu Oracle on-premises dung lượng 10 TB sang Amazon Aurora PostgreSQL với thời gian gián đoạn (downtime) tối thiểu. Cơ sở dữ liệu này có các stored procedure, trigger và view phức tạp cần được chuyển đổi sang cú pháp PostgreSQL. Solutions architect nên đề xuất sự kết hợp các dịch vụ AWS nào?

**Đáp án đúng:** **C**

Di chuyển **khác Database Engine (Heterogeneous Migration)** luôn cần bộ đôi **AWS SCT + AWS DMS (CDC)**.

- **A:** Sai vì DataSync chỉ copy file thông thường (NFS/SMB), không thể chuyển đổi dữ liệu và schema giữa Oracle và PostgreSQL.
- **B:** Sai vì DMS chỉ chuyển đổi schema cơ bản cho bảng, không thể chuyển đổi các đối tượng phức tạp như stored procedures và triggers giữa hai engine khác nhau.
- **C (Đúng):** Đúng! Với Heterogeneous Migration (Oracle sang Aurora PostgreSQL), bắt buộc dùng **AWS SCT** để chuyển đổi schema/stored procedures, sau đó dùng **AWS DMS (Full Load + CDC)** để đồng bộ liên tục với downtime gần như bằng 0.
- **D:** Sai vì Aurora PostgreSQL không thể làm Read Replica trực tiếp cho Oracle.

</details>

### Câu 2 `medium`

A data engineering team uses Amazon Athena to run ad-hoc SQL queries on 50 TB of raw CSV log files stored in Amazon S3. Queries are slow and monthly Athena bills are high because each query scans the entire dataset. Which TWO actions will significantly reduce Athena query costs and improve performance? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Transition the raw CSV files to the Amazon S3 Glacier Flexible Retrieval storage class using a Lifecycle rule.
- **B.** Convert the CSV files to columnar formats such as Apache Parquet or Apache ORC using AWS Glue.
- **C.** Enable Amazon S3 Transfer Acceleration and Requester Pays on the bucket containing the CSV logs.
- **D.** Partition the S3 data by commonly filtered columns such as year, month, and day.
- **E.** Split the 50 TB of CSV logs into millions of tiny 1 KB files to maximize parallel S3 GET requests.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ sư dữ liệu sử dụng Amazon Athena để chạy các truy vấn SQL đột xuất (ad-hoc) trên 50 TB tệp log CSV thô lưu trong Amazon S3. Các truy vấn chạy chậm và hóa đơn Athena hàng tháng cao vì mỗi truy vấn đều quét toàn bộ tập dữ liệu. HAI hành động nào sẽ giảm đáng kể chi phí truy vấn Athena và cải thiện hiệu năng? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

3 bí quyết vàng tối ưu **Amazon Athena**: (1) Đổi sang **Parquet/ORC**, (2) **Nén (Compression)**, (3) **Partitioning** dữ liệu trên S3.

- **A:** Sai vì Athena không thể query trực tiếp các object đang nằm ở tầng Glacier.
- **B (Đúng):** Đúng! Định dạng cột (Parquet/ORC) giúp Athena chỉ đọc đúng các cột cần thiết trong câu lệnh SELECT thay vì quét cả file CSV.
- **C:** Sai vì Transfer Acceleration chỉ tăng tốc upload/download qua Internet, không ảnh hưởng tới tốc độ quét dữ liệu nội bộ của Athena.
- **D (Đúng):** Đúng! Partitioning theo ngày/tháng/năm giúp Athena bỏ qua toàn bộ các thư mục không khớp điều kiện WHERE, giảm lượng dữ liệu quét tới 90-99%.
- **E:** Sai vì quá nhiều file nhỏ làm tăng chi phí S3 GET request và giảm hiệu năng đọc của Athena (nên gộp file kích thước 128 MB - 512 MB).

</details>

### Câu 3 `easy`

A company has 120 TB of archival video footage in an on-premises data center with a 100 Mbps internet connection. The company needs to transfer all 120 TB to Amazon S3 within 3 weeks. Which AWS service provides the fastest and most reliable migration method?

- **A.** Deploy an AWS DataSync agent locally and transfer all 120 TB over the existing 100 Mbps internet connection.
- **B.** Use AWS Transfer Family with SFTP endpoints and multi-threaded uploads over the 100 Mbps internet link.
- **C.** Enable Amazon S3 Transfer Acceleration on the target bucket and use S3 Multipart Upload from on-premises.
- **D.** Order two AWS Snowball Edge Storage Optimized devices, load the data locally, and ship them back to AWS.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có 120 TB tư liệu video lưu trữ lâu dài tại một trung tâm dữ liệu on-premises với kết nối internet 100 Mbps. Công ty cần chuyển toàn bộ 120 TB lên Amazon S3 trong vòng 3 tuần. Dịch vụ AWS nào cung cấp phương thức di chuyển nhanh nhất và đáng tin cậy nhất?

**Đáp án đúng:** **D**

Quy tắc tính nhanh trong SAA-C03: Nếu truyền dữ liệu qua mạng mất **hơn 1 tuần** → Dùng **AWS Snowball Edge** (80 TB/thiết bị).

- **A:** Sai vì với đường truyền 100 Mbps, việc truyền 120 TB dữ liệu sẽ mất hơn 110 ngày (gần 4 tháng), không kịp hạn 3 tuần.
- **B:** Sai vì vẫn bị giới hạn bởi băng thông mạng 100 Mbps.
- **C:** Sai vì băng thông đầu ra tại on-premises vẫn bị nghẽn ở mức 100 Mbps.
- **D (Đúng):** Đúng! Mỗi thiết bị Snowball Edge Storage Optimized chứa được 80 TB. Dùng 2 thiết bị để copy offline và gửi chuyển phát nhanh tới AWS sẽ hoàn thành trong khoảng 1-2 tuần.

</details>

### Câu 4 `medium`

A company uses Amazon Redshift as its enterprise data warehouse. Analysts also need to run complex SQL joins combining structured tables stored inside Redshift with 100 TB of historical Parquet files stored in Amazon S3, without loading the S3 data into Redshift local storage. Which Redshift feature enables this?

- **A.** Amazon Redshift Spectrum
- **B.** Amazon Redshift Concurrency Scaling
- **C.** Amazon ElastiCache
- **D.** AWS DataSync

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty sử dụng Amazon Redshift làm kho dữ liệu doanh nghiệp. Các nhà phân tích cũng cần chạy các phép nối SQL phức tạp kết hợp các bảng có cấu trúc lưu bên trong Redshift với 100 TB tệp Parquet lịch sử lưu trong Amazon S3, mà không cần nạp dữ liệu S3 vào bộ nhớ cục bộ của Redshift. Tính năng Redshift nào cho phép thực hiện điều này?

**Đáp án đúng:** **A**

Query trực tiếp dữ liệu trên **S3 từ bên trong Redshift** mà không cần load vào Redshift → **Amazon Redshift Spectrum**.

- **A (Đúng):** Đúng! **Redshift Spectrum** cho phép thực thi truy vấn SQL trực tiếp trên dữ liệu (Parquet, ORC, CSV) nằm trong **Amazon S3** và join trực tiếp với các bảng trong Redshift mà không cần load vào ổ đĩa Redshift.
- **B:** Sai vì Concurrency Scaling tự động thêm cụm tính toán khi có quá nhiều người dùng query đồng thời, không phải tính năng query trực tiếp S3.
- **C:** Sai vì ElastiCache là in-memory key-value cache.
- **D:** Sai vì DataSync dùng để đồng bộ file từ on-premises.

</details>

---

[Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md)
