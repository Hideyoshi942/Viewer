# Bài tập tình huống — Chủ đề 10: Kiến trúc Serverless & Event-Driven — Lambda, API Gateway, EventBridge & Step Functions

> AWS Lambda Concurrency & VPC Integration, API Gateway REST vs HTTP vs WebSocket, Amazon EventBridge Event Bus & Step Functions Standard vs Express.
> **Số câu hỏi:** 6 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A company is building an event-driven order processing application using AWS Lambda and Amazon RDS for PostgreSQL. During flash sales, thousands of Lambda functions invoke concurrently, causing the RDS database to reject new connections with 'too many connections' errors. What should a solutions architect recommend to resolve this issue with minimal code changes?

- **A.** Increase the Lambda function memory allocation to 10,240 MB to allocate maximum vCPU and network bandwidth.
- **B.** Enable Amazon RDS Multi-AZ deployment with synchronous standby replication across two Availability Zones.
- **C.** Deploy an Amazon RDS Proxy between the Lambda functions and the RDS PostgreSQL database.
- **D.** Move the Lambda functions outside the VPC so they connect to the RDS endpoint over the public internet.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty đang xây dựng ứng dụng xử lý đơn hàng hướng sự kiện (event-driven) bằng AWS Lambda và Amazon RDS for PostgreSQL. Trong các đợt flash sale, hàng nghìn hàm Lambda được gọi đồng thời, khiến cơ sở dữ liệu RDS từ chối các kết nối mới với lỗi 'too many connections'. Solutions architect nên đề xuất gì để giải quyết vấn đề này với mức thay đổi mã nguồn tối thiểu?

**Đáp án đúng:** **C**

Bài toán **Lambda + RDS gặp lỗi too many connections khi scale đột biến** luôn có đáp án chuẩn là **Amazon RDS Proxy**.

- **A:** Sai vì tăng RAM cho Lambda chỉ tăng CPU và không giải quyết được giới hạn số lượng kết nối đồng thời tới RDS.
- **B:** Sai vì Multi-AZ chỉ tạo bản sao Standby để tăng tính sẵn sàng (HA), không phục vụ kết nối đọc/ghi bình thường và không làm connection pooling.
- **C (Đúng):** Đúng! Amazon RDS Proxy quản lý connection pooling giúp hàng nghìn hàm Lambda chia sẻ lại các kết nối DB sẵn có, tránh cạn kiệt `max_connections` và giảm thời gian failover tới 66%.
- **D:** Sai vì nếu RDS nằm trong Private Subnet thì Lambda bên ngoài VPC không thể kết nối tới RDS một cách an toàn qua mạng riêng.

</details>

### Câu 2 `hard`

A financial application orchestrates a multi-step loan approval workflow involving credit checks, fraud detection, and a mandatory manual review step by a human manager that can take up to 3 days. Each step must execute exactly once. Which AWS Step Functions configuration should be used?

- **A.** Step Functions Standard Workflow using the Callback Pattern with a Task Token (`.waitForTaskToken`)
- **B.** Step Functions Express Workflow configured with a 3-day Wait state for manual manager approval
- **C.** A single AWS Lambda function configured to sleep while polling DynamoDB for 3 days
- **D.** Amazon EventBridge Scheduler without any persistent state management or callback tokens

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng tài chính điều phối quy trình phê duyệt khoản vay nhiều bước bao gồm kiểm tra tín dụng, phát hiện gian lận và một bước xét duyệt thủ công bắt buộc bởi quản lý có thể mất tới 3 ngày. Mỗi bước phải thực thi chính xác một lần (exactly once). Nên sử dụng cấu hình AWS Step Functions nào?

**Đáp án đúng:** **A**

Workflow chạy **> 5 phút (lên tới 1 năm)**, yêu cầu **Exactly-Once**, hoặc có bước **Human Approval** → **Step Functions Standard Workflow (`.waitForTaskToken`)**.

- **A (Đúng):** Đúng! **Standard Workflow** chạy tối đa **1 năm**, đảm bảo thực thi **Exactly-Once**, và hỗ trợ **Callback Pattern (`.waitForTaskToken`)** để tạm dừng vô thời hạn chờ con người bấm duyệt rồi mới chạy tiếp.
- **B:** Sai vì Express Workflow chỉ chạy tối đa **5 phút** và có ngữ nghĩa At-Least-Once.
- **C:** Sai vì Lambda tối đa 15 phút.
- **D:** Sai vì EventBridge không quản lý trạng thái workflow và human approval callback.

</details>

### Câu 3 `medium`

A data engineering team stores 50 TB of Parquet files partitioned by date in an Amazon S3 data lake. Business analysts need to run ad-hoc SQL queries against this data without provisioning or managing any database servers or clusters, paying only per query based on the amount of data scanned. Which service should they use?

- **A.** Amazon Athena
- **B.** Amazon Redshift
- **C.** Amazon EMR
- **D.** Amazon RDS for PostgreSQL

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ sư dữ liệu lưu trữ 50 TB tệp Parquet được phân vùng theo ngày trong một Amazon S3 data lake. Các nhà phân tích kinh doanh cần chạy các truy vấn SQL đột xuất (ad-hoc) trên dữ liệu này mà không cần cấp phát hay quản lý bất kỳ máy chủ hoặc cụm cơ sở dữ liệu nào, chỉ trả tiền theo từng truy vấn dựa trên lượng dữ liệu được quét. Họ nên sử dụng dịch vụ nào?

**Đáp án đúng:** **A**

Từ khóa: **Serverless + ad-hoc SQL queries directly on S3 + pay per data scanned** -> **Amazon Athena** (thường kết hợp với AWS Glue Data Catalog và định dạng Parquet để giảm dung lượng quét).

- **A (Đúng):** Đúng! Amazon Athena là dịch vụ truy vấn SQL serverless trực tiếp trên dữ liệu tại Amazon S3, không cần quản lý server/cluster và chỉ tính phí theo dung lượng dữ liệu được quét (per TB scanned).
- **B:** Sai vì Redshift là Data Warehouse yêu cầu tải dữ liệu vào cluster (hoặc Redshift Serverless) để phân tích chuyên sâu, tốn chi phí hơn cho nhu cầu ad-hoc query đơn giản trực tiếp trên S3.
- **C:** Sai vì EMR yêu cầu quản lý cụm Hadoop/Spark, không phù hợp yêu cầu 'without provisioning or managing any servers or clusters'.
- **D:** Sai vì RDS không truy vấn trực tiếp file Parquet trên S3 theo mô hình serverless pay-per-scan.

</details>

### Câu 4 `hard`

A payment processing workflow consists of 6 sequential and parallel steps involving multiple AWS Lambda functions, human approval pauses that can last up to 48 hours, and automatic retry with exponential backoff on transient failures. Which AWS service should orchestrate this workflow with the LEAST custom code?

- **A.** AWS Step Functions (Standard Workflow)
- **B.** AWS Step Functions (Express Workflow)
- **C.** A single orchestrator AWS Lambda function using `sleep()` timers.
- **D.** Amazon EventBridge Pipes without state management.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một quy trình xử lý thanh toán gồm 6 bước tuần tự và song song liên quan đến nhiều hàm AWS Lambda, các khoảng tạm dừng phê duyệt thủ công có thể kéo dài tới 48 giờ, và cơ chế tự động thử lại theo cấp số nhân (exponential backoff) khi gặp lỗi tạm thời. Dịch vụ AWS nào nên điều phối quy trình này với ít mã nguồn tùy chỉnh NHẤT?

**Đáp án đúng:** **A**

Phân biệt trong SAA-C03: Cần **điều phối workflow phức tạp (branching, retry, human approval kéo dài > 5 phút)** -> **AWS Step Functions Standard Workflow** (chạy tối đa 1 năm). Còn Express Workflow dành cho sự kiện tốc độ cao, chạy dưới 5 phút.

- **A (Đúng):** Đúng! AWS Step Functions Standard Workflow hỗ trợ điều phối các bước tuần tự/song song, chờ đợi tác vụ con người (callback pattern) lên đến 1 năm (dư sức cho 48 giờ) và tích hợp sẵn retry/catch logic.
- **B:** Sai vì Express Workflow chỉ chạy tối đa 5 phút, không phù hợp cho quy trình chờ phê duyệt 48 giờ.
- **C:** Sai vì Lambda tối đa chỉ chạy 15 phút và việc `sleep()` gây tốn tiền vô ích.
- **D:** Sai vì EventBridge dùng để định tuyến sự kiện (event bus), không phải state machine để quản lý trạng thái workflow dài hạn và human approval.

</details>

### Câu 5 `hard`

An internal web application experiences highly variable database traffic: it is almost completely idle overnight and on weekends, but sees sudden bursts of thousands of concurrent queries during business hours. The application uses PostgreSQL and the team wants a database that automatically scales compute capacity up and down in fractions of a second without dropping connections or requiring manual instance resizing. Which database option should they choose?

- **A.** Amazon RDS for PostgreSQL with Multi-AZ
- **B.** Amazon Aurora Serverless v2
- **C.** Amazon Redshift Provisioned Cluster
- **D.** Amazon DynamoDB

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng web nội bộ có lưu lượng cơ sở dữ liệu biến động mạnh: gần như hoàn toàn nhàn rỗi qua đêm và cuối tuần, nhưng chứng kiến các đợt tăng đột biến hàng nghìn truy vấn đồng thời trong giờ hành chính. Ứng dụng sử dụng PostgreSQL và nhóm muốn một cơ sở dữ liệu tự động tăng giảm công suất compute trong tích tắc mà không làm rớt kết nối hay yêu cầu thay đổi kích thước instance thủ công. Họ nên chọn tùy chọn cơ sở dữ liệu nào?

**Đáp án đúng:** **B**

Khi đề bài có các từ khóa: **unpredictable / variable / intermittent SQL workload (MySQL/PostgreSQL)** + **auto-scale capacity instantly without downtime** -> **Amazon Aurora Serverless v2**.

- **A:** Sai vì RDS truyền thống dùng instance cố định; việc đổi instance size gây gián đoạn và không tự scale tức thì theo giây.
- **B (Đúng):** Đúng! Amazon Aurora Serverless v2 (hỗ trợ PostgreSQL và MySQL) tự động tăng/giảm dung lượng (ACUs) tức thì trong tích tắc (fractions of a second) theo tải thực tế mà không làm gián đoạn kết nối.
- **C:** Sai vì Redshift là OLAP Data Warehouse, không dùng cho ứng dụng web OLTP và không scale tức thì như Aurora Serverless v2.
- **D:** Sai vì DynamoDB là cơ sở dữ liệu NoSQL, không tương thích PostgreSQL.

</details>

### Câu 6 `medium`

A retail company receives daily CSV sales files in Amazon S3 with inconsistent schemas. They need a serverless ETL service to automatically discover the schema, populate a central metadata catalog, and run Apache Spark jobs to clean and transform the CSV files into partitioned Parquet format in S3 for Amazon Athena queries. Which AWS service should they use?

- **A.** AWS Glue (Glue Crawlers, Glue Data Catalog, and Glue ETL jobs)
- **B.** Amazon Redshift Provisioned Data Warehouse Cluster
- **C.** AWS DataSync with scheduled S3 transfer tasks
- **D.** Amazon QuickSight BI Visualization and SPICE Engine

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty bán lẻ nhận các tệp doanh số CSV hàng ngày trong Amazon S3 với schema không đồng nhất. Họ cần một dịch vụ ETL serverless để tự động khám phá schema, điền dữ liệu vào một danh mục siêu dữ liệu (metadata catalog) trung tâm và chạy các tác vụ Apache Spark để làm sạch, chuyển đổi tệp CSV sang định dạng Parquet được phân vùng trong S3 cho các truy vấn Amazon Athena. Họ nên sử dụng dịch vụ AWS nào?

**Đáp án đúng:** **A**

Bộ đôi Data Lake serverless chuẩn của AWS: **AWS Glue** (Crawler + Data Catalog + Serverless Spark ETL) đi kèm **Amazon Athena** (truy vấn SQL) và **Amazon QuickSight** (BI Dashboard).

- **A (Đúng):** Đúng! AWS Glue là dịch vụ ETL serverless hoàn toàn: Glue Crawler tự động quét và nhận diện schema, lưu vào Glue Data Catalog (tích hợp trực tiếp với Athena), và Glue ETL chạy Spark job chuyển đổi CSV sang Parquet.
- **B:** Sai vì Redshift là Data Warehouse, không phải dịch vụ crawler tự động khám phá schema cho Athena trên S3.
- **C:** Sai vì AWS DataSync dùng để truyền tải dữ liệu giữa on-premises và AWS Storage (S3/EFS/FSx), không thực hiện ETL chuyển đổi CSV sang Parquet.
- **D:** Sai vì QuickSight là công cụ BI vẽ biểu đồ/dashboard, không phải công cụ ETL Spark.

</details>

---

[Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md)
