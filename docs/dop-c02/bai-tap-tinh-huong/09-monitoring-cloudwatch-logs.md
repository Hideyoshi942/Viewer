# Bài tập tình huống — CloudWatch Logs, Metric Filters, Synthetics & OpenSearch

> CloudWatch Logs Subscription Filters, Kinesis Data Firehose, Logs Insights, Embedded Metric Format (EMF), Synthetics Canary và Amazon OpenSearch Service.
> **Số câu hỏi:** 16 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A DevOps team needs to stream real-time JSON application logs from multiple Amazon CloudWatch Log Groups into an Amazon OpenSearch Service domain for full-text search and Kibana/OpenSearch Dashboards visualization. Sensitive credit card fields must be stripped from log records in transit before indexing, and any records that fail OpenSearch delivery must be preserved for later reprocessing without managing EC2 or Kinesis shards. Which architecture meets these requirements?

- **A.** Use CloudWatch Logs Export Tasks every 5 minutes to export logs to Amazon S3, then trigger an AWS Lambda function to load them into OpenSearch Service.
- **B.** Create a CloudWatch Logs Subscription Filter targeting an Amazon Data Firehose stream with Lambda transformation, OpenSearch destination, and S3 backup.
- **C.** Create a CloudWatch Logs Subscription Filter targeting an Amazon Kinesis Data Streams stream with provisioned shards and an EC2 fleet running Logstash.
- **D.** Configure CloudWatch Logs Metric Filters with JSON pattern matching to forward raw sanitized log events directly into Amazon OpenSearch Service.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm DevOps cần truyền phát các log ứng dụng JSON theo thời gian thực từ nhiều Amazon CloudWatch Log Group vào một Amazon OpenSearch Service domain để tìm kiếm toàn văn và trực quan hóa trên Kibana/OpenSearch Dashboards. Các trường thẻ tín dụng nhạy cảm phải được loại bỏ khỏi bản ghi log khi đang truyền trước khi lập chỉ mục, và bất kỳ bản ghi nào gửi tới OpenSearch thất bại phải được giữ lại để xử lý lại sau mà không cần quản lý EC2 hoặc các shard Kinesis. Kiến trúc nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **B**

Mẫu kiến trúc CloudWatch Logs Subscription Filter -> Amazon Data Firehose (Lambda Transform + S3 Backup) -> OpenSearch Service là lựa chọn serverless chuẩn xác cho nhu cầu log analytics thời gian thực, lọc dữ liệu nhạy cảm và đảm bảo không mất log khi đích gặp sự cố.

- **A:** Sai. Export Tasks (CreateExportTask) là xử lý batch không theo thời gian thực và bị giới hạn số lượng task chạy đồng thời rất thấp.
- **B (Đúng):** Chính xác! CloudWatch Logs Subscription Filter đẩy log thời gian thực sang Amazon Data Firehose (serverless, không cần quản lý shard), dùng Lambda transformation để xóa dữ liệu nhạy cảm trên đường truyền, ghi vào OpenSearch Service và tự động lưu bản ghi lỗi vào S3 backup bucket.
- **C:** Sai. Vi phạm yêu cầu không tự quản lý EC2 hay Kinesis shards.
- **D:** Sai. Metric Filters chỉ dùng để chuyển đổi log thành số liệu (CloudWatch Metrics), không đẩy dữ liệu log sang OpenSearch.

</details>

### Câu 2 `medium`

An internal enterprise web portal hosted behind an internal Application Load Balancer (ALB) in a private VPC subnet has experienced silent authentication regressions where HTTP 200 responses still render a broken login page. The DevOps team wants to proactively simulate multi-step user logins every 5 minutes, capture screenshots of failures, and trigger an alert immediately when a step fails—without exposing the portal to the public internet. What is the BEST solution?

- **A.** Configure an Amazon Route 53 Health Check to perform HTTP GET requests against the internal ALB login page every 30 seconds and trigger SNS.
- **B.** Enable ALB Access Logs in Amazon S3 and run a scheduled Amazon Athena query every 5 minutes to search for HTTP 5xx error status codes.
- **C.** Enable CloudWatch Real User Monitoring (RUM) on the login page so internal employees automatically report broken authentication flows.
- **D.** Create a CloudWatch Synthetics Canary running a Playwright script inside the VPC, store failure screenshots in S3, and alarm on SuccessPercent.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một cổng thông tin web doanh nghiệp nội bộ được lưu trữ phía sau một Application Load Balancer (ALB) nội bộ trong một private VPC subnet đã gặp phải các lỗi hồi quy xác thực âm thầm, nơi phản hồi HTTP 200 vẫn hiển thị một trang đăng nhập bị hỏng. Nhóm DevOps muốn chủ động mô phỏng quy trình đăng nhập nhiều bước của người dùng mỗi 5 phút, chụp ảnh màn hình khi lỗi và kích hoạt cảnh báo ngay lập tức khi một bước thất bại—mà không để lộ cổng thông tin ra internet công cộng. Giải pháp TỐT NHẤT là gì?

**Đáp án đúng:** **D**

Amazon CloudWatch Synthetics Canaries là công cụ giám sát chủ động (synthetic monitoring) hỗ trợ chạy script trình duyệt/API định kỳ ngay trong private VPC, phát hiện lỗi logic/UI ngay cả khi HTTP trả về 200 và lưu bằng chứng screenshot lên S3.

- **A:** Sai. Route 53 Health Check chỉ chạy từ public internet (không truy cập được internal ALB trong private VPC) và không mô phỏng được luồng đăng nhập nhiều bước hay chụp ảnh màn hình.
- **B:** Sai. Sự cố trả về HTTP 200 (silent regression) nên tìm 5xx trong ALB Access Logs sẽ không phát hiện được lỗi giao diện/đăng nhập.
- **C:** Sai. RUM chỉ ghi nhận lỗi thụ động khi người dùng thật đã gặp sự cố, không phải giải pháp kiểm tra chủ động (proactive synthetic monitoring) 5 phút/lần.
- **D (Đúng):** Chính xác! CloudWatch Synthetics Canaries hỗ trợ chạy bên trong private VPC, mô phỏng thao tác trình duyệt nhiều bước (headless browser), tự động chụp screenshot/HAR file lưu vào S3 khi lỗi và tích hợp trực tiếp với CloudWatch Alarms.

</details>

### Câu 3 `medium`

A legacy Java payment service running on Amazon EC2 writes structured JSON logs to Amazon CloudWatch Logs via the CloudWatch Agent. The application cannot be modified to call the CloudWatch PutMetricData API directly. The SRE team needs to create a CloudWatch Alarm that triggers whenever more than 5 log entries contain '"event":"PaymentDeclined"' and '"reason":"GatewayTimeout"' within any 5-minute period. What is the SIMPLEST, serverless way to implement this?

- **A.** Create a CloudWatch Logs Subscription Filter to stream all log events to an AWS Lambda function that parses JSON and calls cloudwatch:PutMetricData.
- **B.** Run a scheduled CloudWatch Logs Insights query every 5 minutes using EventBridge Scheduler and send an Amazon SNS alert via AWS Step Functions.
- **C.** Export the CloudWatch Log Group to an Amazon S3 bucket every 5 minutes using CreateExportTask and query the raw logs using Amazon Athena.
- **D.** Create a CloudWatch Logs Metric Filter for { $.event = "PaymentDeclined" && $.reason = "GatewayTimeout" } with an Alarm (> 5 in 5 mins).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một dịch vụ thanh toán Java kế thừa chạy trên Amazon EC2 ghi các log JSON có cấu trúc vào Amazon CloudWatch Logs thông qua CloudWatch Agent. Ứng dụng không thể được sửa đổi để gọi trực tiếp CloudWatch PutMetricData API. Nhóm SRE cần tạo một CloudWatch Alarm kích hoạt bất cứ khi nào có hơn 5 mục log chứa '"event":"PaymentDeclined"' và '"reason":"GatewayTimeout"' trong bất kỳ khoảng thời gian 5 phút nào. Cách ĐƠN GIẢN NHẤT theo hướng serverless để triển khai việc này là gì?

**Đáp án đúng:** **D**

CloudWatch Logs Metric Filters là công cụ đơn giản, chi phí thấp và không cần sửa code ứng dụng để trích xuất số liệu (metrics) từ các mẫu text hoặc JSON trong log và gắn CloudWatch Alarms.

- **A:** Sai. Dùng Subscription Filter + Lambda tốn thêm chi phí thực thi và công sức duy trì code trong khi Metric Filter làm trực tiếp ngay trong CloudWatch Logs.
- **B:** Sai. Phức tạp không cần thiết và tốn chi phí truy vấn Logs Insights lặp lại liên tục.
- **C:** Sai. Export sang S3 + Athena không phải giải pháp giám sát cảnh báo gần thời gian thực và rất cồng kềnh.
- **D (Đúng):** Chính xác! CloudWatch Logs Metric Filters hỗ trợ cú pháp lọc JSON trực tiếp ({ $.event = ... && $.reason = ... }), tự động xuất ra Custom Metric mà không cần sửa code ứng dụng hay chạy thêm Lambda, sau đó gắn CloudWatch Alarm rất gọn nhẹ.

</details>

### Câu 4 `medium`

A DevOps team needs to monitor OS-level memory utilization (mem_used_percent), root disk space utilization (disk_used_percent), and the running status of a critical custom daemon process across 250 Amazon EC2 Linux instances. Whenever the monitoring configuration changes (such as adding a new log file path), all 250 instances must pick up the updated configuration automatically without SSH access. What is the BEST way to deploy and manage this?

- **A.** Store the CloudWatch Agent JSON config (mem, disk, procstat) in SSM Parameter Store and run AmazonCloudWatch-ManageAgent via SSM State Manager.
- **B.** Enable CloudWatch Detailed Monitoring (1-minute granularity) on all 250 EC2 instances so OS memory and disk metrics appear automatically.
- **C.** Bake the CloudWatch Agent JSON config file into the EC2 Golden AMI and rebuild and redeploy all 250 instances whenever a log file path changes.
- **D.** Install the AWS X-Ray daemon on all 250 EC2 instances to automatically collect OS memory, disk utilization, and Linux process statistics.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm DevOps cần giám sát mức sử dụng bộ nhớ cấp hệ điều hành (mem_used_percent), mức sử dụng dung lượng đĩa gốc (disk_used_percent) và trạng thái đang chạy của một tiến trình daemon tùy chỉnh quan trọng trên 250 Amazon EC2 Linux instance. Mỗi khi cấu hình giám sát thay đổi (chẳng hạn như thêm đường dẫn tệp log mới), tất cả 250 instance phải tự động nhận cấu hình đã cập nhật mà không cần truy cập SSH. Cách TỐT NHẤT để triển khai và quản lý việc này là gì?

**Đáp án đúng:** **A**

Hypervisor của EC2 không thấy được bên trong hệ điều hành (RAM, Disk, Process). Cần cài đặt Unified CloudWatch Agent (có plugin `procstat` cho tiến trình), lưu cấu hình tập trung tại SSM Parameter Store và phân phối/đồng bộ tự động bằng SSM State Manager (`AmazonCloudWatch-ManageAgent`).

- **A (Đúng):** Chính xác! CloudWatch Agent thu thập được các OS-level metrics không có mặc định như mem_used_percent, disk_used_percent và trạng thái tiến trình qua plugin procstat. Lưu file cấu hình JSON tập trung trên SSM Parameter Store và dùng SSM State Manager chạy AmazonCloudWatch-ManageAgent giúp đồng bộ cấu hình tự động cho toàn bộ 250 instance mà không cần SSH.
- **B:** Sai. Detailed Monitoring chỉ tăng tần suất thu thập metric hypervisor từ 5 phút xuống 1 phút; nó KHÔNG thu thập OS-level metrics như RAM hay dung lượng ổ đĩa.
- **C:** Sai. Phải rebuild AMI và thay thế 250 instance mỗi khi đổi cấu hình log là quá nặng nề và kém linh hoạt so với SSM Parameter Store + State Manager.
- **D:** Sai. X-Ray daemon dùng cho distributed tracing của request ứng dụng, không thu thập chỉ số RAM/ổ đĩa/tiến trình của hệ điều hành.

</details>

### Câu 5 `hard`

A healthcare SaaS application aggregates logs from 12 microservices into separate Amazon CloudWatch Log Groups. During incident investigations, SREs need to run fast ad-hoc correlation queries across all 12 log groups simultaneously to find all events for a specific correlationId. At the same time, compliance auditors discovered that some legacy services occasionally log patient Social Security Numbers (SSNs), which must be automatically masked before non-privileged engineers can view the logs. Which TWO CloudWatch Logs features address these requirements? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Enable AWS KMS encryption on the CloudWatch Log Groups so SSNs are automatically masked from engineers who view logs in the AWS console.
- **B.** Use CloudWatch Logs Insights to run ad-hoc filter, parse, and stats queries simultaneously across all 12 log groups by correlationId.
- **C.** Use CloudWatch Logs Live Tail in the console to run historical 30-day aggregation queries simultaneously across all 12 microservice log groups at once.
- **D.** Attach an AWS WAF managed PII detection rule group directly to the 12 CloudWatch Log Groups to redact SSNs during log ingestion.
- **E.** Configure CloudWatch Logs Data Protection policies with SSN identifiers to mask PII, allowing only IAM roles with logs:Unmask to view raw values.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng SaaS y tế tổng hợp log từ 12 microservice vào các Amazon CloudWatch Log Group riêng biệt. Trong quá trình điều tra sự cố, các SRE cần chạy các truy vấn tương quan ad-hoc nhanh chóng trên cả 12 log group cùng lúc để tìm tất cả các sự kiện cho một correlationId cụ thể. Đồng thời, kiểm toán viên tuân thủ phát hiện một số dịch vụ cũ thỉnh thoảng ghi log Số An sinh Xã hội (SSN) của bệnh nhân, vốn phải được tự động che (mask) trước khi các kỹ sư không có đặc quyền có thể xem log. HAI tính năng nào của CloudWatch Logs giải quyết các yêu cầu này? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, E**

CloudWatch Logs Insights (truy vấn ad-hoc đa log group) kết hợp với CloudWatch Logs Data Protection Policies (tự động phát hiện và che PII như SSN/thẻ tín dụng, kiểm soát giải che bằng quyền `logs:Unmask`) là bộ giải pháp native mạnh mẽ cho Observability an toàn.

- **A:** Sai. KMS mã hóa toàn bộ log ở trạng thái nghỉ (at rest), nhưng bất kỳ kỹ sư nào có quyền xem log đều sẽ thấy nguyên văn SSN đã được giải mã, không có tác dụng che từng trường PII.
- **B (Đúng):** Chính xác! CloudWatch Logs Insights hỗ trợ truy vấn phân tích ad-hoc tốc độ cao xuyên suốt nhiều Log Group cùng lúc (tối đa 50 log groups mỗi truy vấn) để truy vết theo correlationId.
- **C:** Sai. Live Tail chỉ xem luồng log thời gian thực (real-time streaming), không dùng để truy vấn tổng hợp dữ liệu lịch sử 30 ngày như Logs Insights.
- **D:** Sai. AWS WAF bảo vệ HTTP endpoints (ALB/CloudFront/API Gateway), không gắn được vào CloudWatch Log Groups.
- **E (Đúng):** Chính xác! CloudWatch Logs Data Protection sử dụng pattern matching và ML để tự động phát hiện và che (mask) dữ liệu nhạy cảm như SSN ngay trên luồng log; chỉ những IAM principal có quyền logs:Unmask mới xem được dữ liệu gốc.

</details>

### Câu 6 `medium`

A network security team needs to retain 1 year of VPC Flow Logs from 20 high-throughput production VPCs for forensic investigations and occasional ad-hoc SQL queries by source IP and time range. Currently, storing logs in CloudWatch Logs and scanning uncompressed text files in S3 is prohibitively expensive and slow. What is the MOST cost-effective and performant architecture?

- **A.** Stream all VPC Flow Logs into Amazon OpenSearch Service and retain 1 year of hot indices across multi-AZ data nodes.
- **B.** Send VPC Flow Logs to CloudWatch Logs with 365-day retention and use CloudWatch Logs Insights for all annual forensic queries.
- **C.** Deliver VPC Flow Logs to S3 in Apache Parquet with Hive prefixes/hourly partitioning, Glacier Instant Retrieval lifecycle, and Athena Partition Projection.
- **D.** Load VPC Flow Logs continuously into an Amazon RDS PostgreSQL database with B-tree indexes on source IP and timestamp.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm bảo mật mạng cần lưu giữ 1 năm VPC Flow Logs từ 20 VPC production thông lượng cao phục vụ điều tra pháp y và các truy vấn SQL ad-hoc thỉnh thoảng theo địa chỉ IP nguồn và khoảng thời gian. Hiện tại, việc lưu trữ log trong CloudWatch Logs và quét các tệp văn bản không nén trong S3 cực kỳ tốn kém và chậm chạp. Kiến trúc TIẾT KIỆM CHI PHÍ NHẤT và hiệu năng cao nhất là gì?

**Đáp án đúng:** **C**

Với bài toán lưu trữ dài hạn và truy vấn ad-hoc VPC Flow Logs tối ưu chi phí nhất: gửi thẳng sang Amazon S3 ở định dạng Parquet + Hive-compatible prefixes, dùng S3 Lifecycle chuyển tầng lưu trữ lạnh và truy vấn bằng Amazon Athena Partition Projection.

- **A:** Sai. Lưu 1 năm VPC Flow Logs tốc độ cao trên hot indices của OpenSearch cực kỳ đắt đỏ cho nhu cầu chỉ truy vấn SQL thỉnh thoảng (ad-hoc).
- **B:** Sai. CloudWatch Logs ingestion và storage cho 20 VPC lưu lượng cao đắt hơn rất nhiều so với S3 Parquet + Athena.
- **C (Đúng):** Chính xác! Ghi VPC Flow Logs trực tiếp sang S3 ở định dạng cột nén Apache Parquet kèm Hive-compatible prefixes giúp giảm mạnh chi phí lưu trữ và lượng dữ liệu quét của Amazon Athena (tối ưu tốc độ & chi phí). Kết hợp Partition Projection giúp Athena tự động nhận diện partition theo ngày/giờ mà không cần chạy MSCK REPAIR TABLE hay Glue Crawler.
- **D:** Sai. RDS không phù hợp để lưu trữ và phân tích hàng terabyte network flow logs dài hạn.

</details>

### Câu 7 `medium`

A high-throughput serverless order processing API runs on AWS Lambda handling 5,000 invocations per second. The engineering team wants to publish custom business metrics (such as OrdersProcessed and OrderValueUSD by TenantId) to Amazon CloudWatch Metrics. Previously, calling cloudwatch:PutMetricData synchronously inside each Lambda invocation increased function latency, caused API throttling, and significantly raised costs. What is the MOST scalable, low-latency, and cost-effective solution?

- **A.** Create an Amazon CloudWatch Logs Metric Filter on the Lambda Log Group for every unique TenantId value in the multi-tenant system.
- **B.** Emit structured JSON logs to stdout using CloudWatch Embedded Metric Format (EMF) so CloudWatch extracts custom metrics asynchronously.
- **C.** Batch cloudwatch:PutMetricData API calls in a local SQLite database inside the Lambda /tmp directory and flush metrics every 5 minutes.
- **D.** Stream all Lambda logs to Amazon OpenSearch Service and run a scheduled Python script to push aggregated metrics back to CloudWatch.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một API xử lý đơn hàng serverless thông lượng cao chạy trên AWS Lambda xử lý 5.000 lượt gọi mỗi giây. Nhóm kỹ thuật muốn xuất bản các custom business metric (như OrdersProcessed và OrderValueUSD theo TenantId) lên Amazon CloudWatch Metrics. Trước đây, việc gọi cloudwatch:PutMetricData đồng bộ bên trong mỗi lượt gọi Lambda làm tăng độ trễ hàm, gây throttling API và làm tăng chi phí đáng kể. Giải pháp CÓ KHẢ NĂNG MỞ RỘNG NHẤT, độ trễ thấp và tiết kiệm chi phí nhất là gì?

**Đáp án đúng:** **B**

CloudWatch Embedded Metric Format (EMF) là chuẩn mực cho custom metrics ở thông lượng cao (Lambda, ECS, EKS): không tốn thời gian gọi API đồng bộ, tránh throttling của PutMetricData, hỗ trợ high-cardinality structured logs song song với CloudWatch Metrics.

- **A:** Sai. Metric Filter có giới hạn số lượng trên mỗi Log Group (mặc định 100) và không hỗ trợ dynamic dimensions linh hoạt theo từng TenantId ở quy mô lớn tốt như EMF.
- **B (Đúng):** Chính xác! CloudWatch Embedded Metric Format (EMF) cho phép ứng dụng chỉ cần ghi log JSON chuẩn hóa ra stdout (không tốn latency gọi API mạng, không bị throttle PutMetricData). CloudWatch tự động trích xuất metric bất đồng bộ đồng thời vẫn lưu trữ đầy đủ structured log để truy vấn bằng Logs Insights.
- **C:** Sai. Execution environment của Lambda có tính tạm thời và không có luồng nền chạy định kỳ mỗi 5 phút giữa các invocation; dữ liệu trong /tmp sẽ bị mất khi container recycle.
- **D:** Sai. Kiến trúc quá cồng kềnh, đắt đỏ và tăng độ trễ không cần thiết so với EMF tích hợp sẵn.

</details>

### Câu 8 `medium`

A multi-tenant SaaS application writes JSON-formatted API access logs (containing tenantId, endpoint, statusCode, and latencyMs) to Amazon CloudWatch Logs. Occasionally, the API experiences spikes in 429 throttling errors caused by a handful of abusive tenants. The operations team needs an automated, near real-time way to identify the top 10 tenants generating the most 429 errors, graph their contribution over time on a CloudWatch dashboard, and trigger a CloudWatch alarm if any single tenant exceeds 1,000 throttled requests per minute. Which solution requires the LEAST effort?

- **A.** Run a CloudWatch Logs Insights query manually across the API log group whenever enterprise customers complain about throttling or latency.
- **B.** Export the CloudWatch Log Group to Amazon S3 every hour and run scheduled Amazon EMR Spark jobs to calculate the top rate-limited tenants.
- **C.** Enable CloudWatch Anomaly Detection on the aggregate API Gateway 4XXError metric and configure a dynamic anomaly band alarm.
- **D.** Create a CloudWatch Contributor Insights rule for statusCode=429 by tenantId and alarm using INSIGHT_RULE_METRIC(MaxContributorValue).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng SaaS đa khách hàng (multi-tenant) ghi các log truy cập API định dạng JSON (chứa tenantId, endpoint, statusCode và latencyMs) vào Amazon CloudWatch Logs. Thỉnh thoảng, API gặp các đợt tăng đột biến lỗi throttling 429 do một vài tenant lạm dụng gây ra. Nhóm vận hành cần một cách tự động theo thời gian gần thực để xác định top 10 tenant tạo ra nhiều lỗi 429 nhất, vẽ biểu đồ mức đóng góp của họ theo thời gian trên CloudWatch dashboard và kích hoạt CloudWatch alarm nếu bất kỳ một tenant đơn lẻ nào vượt quá 1.000 request bị throttle mỗi phút. Giải pháp nào đòi hỏi ÍT nỗ lực nhất?

**Đáp án đúng:** **D**

CloudWatch Contributor Insights phân tích dữ liệu chuỗi thời gian từ CloudWatch Logs (hoặc DynamoDB) để tìm ra Top-N contributors ảnh hưởng lớn nhất đến hệ thống, và tích hợp trực tiếp với CloudWatch Alarms qua hàm toán học INSIGHT_RULE_METRIC.

- **A:** Sai. Chạy truy vấn thủ công không đáp ứng yêu cầu tự động giám sát thời gian thực và kích hoạt CloudWatch Alarm.
- **B:** Sai. Độ trễ hàng giờ (không phải near real-time) và quá tốn công sức vận hành EMR.
- **C:** Sai. Anomaly Detection chỉ phát hiện tổng số lỗi 4XX bất thường, không xác định được cụ thể Top 10 tenantId nào đang gây ra lỗi.
- **D (Đúng):** Chính xác! CloudWatch Contributor Insights được thiết kế chuyên biệt để phân tích log cấu trúc (JSON/CLF) theo thời gian thực, tìm ra Top-N đối tượng (heavy hitters) như tenantId gây lỗi nhiều nhất, vẽ biểu đồ trực tiếp và đặt cảnh báo bằng hàm INSIGHT_RULE_METRIC("RuleName", "MaxContributorValue").

</details>

### Câu 9 `medium`

An e-commerce website experiences predictable daily and weekly traffic cycles: order volume peaks every weekday at 8:00 PM, drops by 85% at 3:00 AM, and doubles on weekends. The SRE team configured static Amazon CloudWatch alarms on RequestCount and Latency, which constantly generate false-positive pages during weekend peaks while failing to detect a 50% drop in traffic during weekday business hours. How can the team make alerting accurate across seasonal patterns with the LEAST operational overhead?

- **A.** Enable CloudWatch Anomaly Detection on RequestCount and Latency and alarm when values fall outside the ML-generated expected band.
- **B.** Create 24 separate static CloudWatch alarms—one for each hour of the day—and toggle them on and off using an AWS Lambda cron schedule.
- **C.** Export all CloudWatch metrics to Amazon SageMaker every hour and train a custom DeepAR time-series forecasting model on S3 data.
- **D.** Increase the static CloudWatch metric alarm evaluation period to 24 hours to smooth out daily and weekend traffic fluctuations.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một trang web thương mại điện tử có các chu kỳ lưu lượng hàng ngày và hàng tuần có thể dự đoán được: lượng đơn hàng đạt đỉnh lúc 8:00 tối mỗi ngày trong tuần, giảm 85% lúc 3:00 sáng và tăng gấp đôi vào cuối tuần. Nhóm SRE đã cấu hình các Amazon CloudWatch alarm tĩnh trên RequestCount và Latency, điều này liên tục tạo ra các cảnh báo giả (false-positive) vào các đỉnh cuối tuần trong khi không phát hiện được mức giảm 50% lưu lượng trong giờ hành chính các ngày trong tuần. Nhóm có thể làm cho việc cảnh báo chính xác trên các mô hình theo mùa với chi phí vận hành ÍT NHẤT bằng cách nào?

**Đáp án đúng:** **A**

Amazon CloudWatch Anomaly Detection áp dụng ML để tạo ngưỡng động theo chu kỳ thời gian (ngày/tuần/mùa), thay thế hoàn hảo cho ngưỡng tĩnh (static threshold) với các metric có tính chu kỳ rõ rệt.

- **A (Đúng):** Chính xác! CloudWatch Anomaly Detection sử dụng mô hình machine learning học tự động các chu kỳ theo giờ, ngày, tuần (seasonal/diurnal patterns) để tạo dải ngưỡng động (expected band), giúp phát hiện cả tình trạng traffic tăng vọt bất thường lẫn sụt giảm 50% trong giờ cao điểm mà không báo động giả cuối tuần.
- **B:** Sai. Tự quản lý 24 alarm tĩnh và bật/tắt bằng Lambda cực kỳ phức tạp, dễ lỗi và vẫn không thích ứng được với xu hướng tăng trưởng tự nhiên hay ngày lễ.
- **C:** Sai. Tự xây dựng và duy trì pipeline ML trên SageMaker tốn rất nhiều công sức vận hành và chi phí trong khi CloudWatch Anomaly Detection đã có sẵn chỉ với vài cú click.
- **D:** Sai. Kéo dài chu kỳ đánh giá lên 24 giờ sẽ khiến sự cố thực sự mất cả ngày mới được phát hiện.

</details>

### Câu 10 `medium`

During a production incident affecting a microservices platform, engineers need to search across 12 different Amazon CloudWatch Log Groups simultaneously to calculate the 99th percentile (p99) API latency grouped into 5-minute intervals for a specific correlationId, and also stream incoming error logs in real time as they deploy a hotfix—without provisioning any external search clusters. Which CloudWatch Logs features should they use?

- **A.** Provision an Amazon OpenSearch Service cluster and backfill all 12 CloudWatch log groups via an AWS Glue ETL job before querying metrics.
- **B.** Export all 12 log groups to Amazon S3 using CreateExportTask and run distributed grep commands across an Amazon EC2 instance.
- **C.** Use CloudWatch Logs Metric Filters to retroactively calculate p99 latency on historical log events from the past 2 hours.
- **D.** Use CloudWatch Logs Insights across all 12 log groups with stats pct(latency, 99), and CloudWatch Logs Live Tail during the hotfix.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong một sự cố production ảnh hưởng đến nền tảng microservice, các kỹ sư cần tìm kiếm trên 12 Amazon CloudWatch Log Group khác nhau cùng lúc để tính toán độ trễ API phân vị thứ 99 (p99) được nhóm theo các khoảng 5 phút cho một correlationId cụ thể, đồng thời truyền phát các log lỗi đang đến theo thời gian thực khi họ triển khai hotfix—mà không cần khởi tạo bất kỳ cụm tìm kiếm bên ngoài nào. Họ nên sử dụng các tính năng CloudWatch Logs nào?

**Đáp án đúng:** **D**

CloudWatch Logs Insights phục vụ phân tích/tổng hợp log lịch sử xuyên nhiều log group (hỗ trợ pct, bin, parse, filter) mà không cần hạ tầng, trong khi CloudWatch Logs Live Tail cung cấp khả năng theo dõi dòng log thời gian thực tương tự tail -f.

- **A:** Sai. Vi phạm yêu cầu không dựng cluster tìm kiếm bên ngoài và tốn quá nhiều thời gian khi đang xử lý sự cố khẩn cấp.
- **B:** Sai. Export log ra S3 mất nhiều phút đến hàng giờ và không hỗ trợ xem stream log thời gian thực.
- **C:** Sai. Metric Filters chỉ áp dụng cho dữ liệu log mới phát sinh TỪ THỜI ĐIỂM TẠO trở đi, không tính toán ngược lại (retroactively) cho log lịch sử.
- **D (Đúng):** Chính xác! CloudWatch Logs Insights hỗ trợ truy vấn đồng thời nhiều log group (tối đa 50 log group) với cú pháp mạnh mẽ (filter, parse, stats pct(..., 99) by bin(5m)) hoàn toàn serverless. CloudWatch Logs Live Tail cho phép xem dòng log mới chảy vào theo thời gian thực ngay trong quá trình deploy hotfix.

</details>

### Câu 11 `medium`

A SaaS company's web portal recently suffered a frontend JavaScript regression that broke the multi-step login and checkout flow in the browser, even though all backend ALB health checks and API HTTP 200 metrics remained green. The DevOps team wants an automated synthetic monitoring solution that runs every 5 minutes using a headless browser to execute the full login-to-checkout user journey, captures screenshots and HTTP Archive (HAR) files whenever a step fails, and triggers an Amazon CloudWatch alarm. Which AWS service provides this natively?

- **A.** Amazon Route 53 HTTP Health Checks pointing to the login page URL with a 10-second request interval and string matching.
- **B.** CloudWatch Synthetics Canaries running a Puppeteer/Playwright script, saving failure screenshots to S3, and alarming on SuccessPercent.
- **C.** AWS X-Ray Active Tracing enabled on the Application Load Balancer and API Gateway stages to capture frontend UI errors.
- **D.** Amazon CloudWatch Real User Monitoring (RUM) deployed via JavaScript snippet without any scheduled synthetic browser tests.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Cổng thông tin web của một công ty SaaS gần đây gặp sự cố hồi quy JavaScript phía frontend làm hỏng luồng đăng nhập và thanh toán nhiều bước trên trình duyệt, mặc dù tất cả các kiểm tra sức khỏe ALB phía backend và chỉ số API HTTP 200 vẫn bình thường. Nhóm DevOps muốn một giải pháp giám sát tổng hợp tự động chạy mỗi 5 phút bằng trình duyệt headless để thực thi toàn bộ hành trình người dùng từ đăng nhập đến thanh toán, chụp ảnh màn hình và các tệp HTTP Archive (HAR) bất cứ khi nào một bước thất bại, đồng thời kích hoạt Amazon CloudWatch alarm. Dịch vụ AWS nào cung cấp tính năng này một cách nguyên bản?

**Đáp án đúng:** **B**

Amazon CloudWatch Synthetics Canaries sử dụng Puppeteer/Playwright để chủ động mô phỏng hành trình người dùng (GUI workflow, API, broken links), tự động lưu screenshot và HAR file lên S3 để chẩn đoán lỗi frontend/end-to-end.

- **A:** Sai. Route 53 Health Check chỉ kiểm tra mã HTTP status code hoặc chuỗi text tĩnh ở một URL, không thể chạy JavaScript trên trình duyệt hay mô phỏng luồng đăng nhập nhiều bước.
- **B (Đúng):** Chính xác! CloudWatch Synthetics Canaries chạy các script headless browser (Puppeteer/Playwright) định kỳ để kiểm thử hành trình người dùng đầu-cuối (login -> checkout), tự động chụp ảnh màn hình, lưu HAR file và log lên S3 khi lỗi, đồng thời xuất metric SuccessPercent để gắn CloudWatch Alarm.
- **C:** Sai. X-Ray theo dõi các request thực tế đi qua backend, không chủ động giả lập hành trình trình duyệt người dùng và không chụp ảnh màn hình giao diện lỗi.
- **D:** Sai. CloudWatch RUM thu thập telemetry từ người dùng thật đang truy cập (bị động), không chủ động chạy kịch bản kiểm thử định kỳ mỗi 5 phút khi chưa có khách hàng truy cập (ví dụ ban đêm) và không chụp screenshot từng bước.

</details>

### Câu 12 `medium`

A healthcare application writes verbose application logs from 20 microservices to Amazon CloudWatch Logs. During a HIPAA compliance audit, auditors discovered that several legacy services occasionally log patient Social Security Numbers (SSNs) and credit card numbers in plaintext. Modifying all 20 legacy codebases immediately is not feasible. The security team wants an automated, native AWS control that detects and masks sensitive PII in CloudWatch Logs BEFORE the log events are stored at rest, while still allowing authorized compliance officers to view unmasked values when strictly needed and recording audit findings in Amazon S3. Which feature should the engineer enable?

- **A.** Encrypt the Amazon CloudWatch Log Groups using an AWS KMS customer managed key (CMK) with key rotation enabled.
- **B.** Enable Amazon Macie automated sensitive data discovery directly on the Amazon CloudWatch Log Groups.
- **C.** Configure CloudWatch Logs Data Protection Policies (SSN/credit card identifiers), audit to S3, and grant logs:Unmask only to compliance.
- **D.** Run a nightly AWS Lambda function to download logs, regex-replace SSNs and credit cards, and re-upload them to CloudWatch Logs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng y tế ghi các log ứng dụng chi tiết từ 20 microservice vào Amazon CloudWatch Logs. Trong một đợt kiểm toán tuân thủ HIPAA, kiểm toán viên phát hiện một số dịch vụ kế thừa thỉnh thoảng ghi log Số An sinh Xã hội (SSN) và số thẻ tín dụng của bệnh nhân dưới dạng văn bản thuần. Việc sửa đổi cả 20 codebase kế thừa ngay lập tức là không khả thi. Nhóm bảo mật muốn một biện pháp kiểm soát AWS nguyên bản tự động phát hiện và che (mask) PII nhạy cảm trong CloudWatch Logs TRƯỚC KHI các sự kiện log được lưu trữ tại chỗ (at rest), đồng thời vẫn cho phép các nhân viên tuân thủ được ủy quyền xem các giá trị chưa che khi thực sự cần thiết và ghi lại các phát hiện kiểm toán trong Amazon S3. Kỹ sư nên bật tính năng nào?

**Đáp án đúng:** **C**

Amazon CloudWatch Logs Data Protection Policies bảo vệ PII/PHI tự động bằng cách phát hiện và che giấu dữ liệu nhạy cảm (masking) ngay khi log đi vào, hỗ trợ kiểm soát giải che bằng quyền IAM logs:Unmask và xuất báo cáo audit findings.

- **A:** Sai. Mã hóa KMS bảo vệ dữ liệu at-rest ở tầng đĩa lưu trữ, nhưng bất kỳ developer nào có quyền đọc CloudWatch Logs vẫn thấy nguyên văn SSN và số thẻ tín dụng ở dạng plaintext.
- **B:** Sai. Amazon Macie chỉ quét dữ liệu trên Amazon S3, không quét trực tiếp CloudWatch Log Groups và không tự động mask log trước khi lưu.
- **C (Đúng):** Chính xác! CloudWatch Logs Data Protection Policies sử dụng machine learning và pattern matching để phát hiện và tự động che giấu (mask) dữ liệu nhạy cảm (SSN, thẻ tín dụng, email...) ngay trong lúc ingest trước khi lưu trữ, ghi nhận audit findings ra S3/Firehose/CloudWatch Logs, và chỉ cho phép IAM principal có quyền logs:Unmask xem dữ liệu gốc.
- **D:** Sai. CloudWatch Logs là bất biến (không thể ghi đè log cũ tại chỗ), và việc chạy hàng đêm khiến PII vẫn tồn tại plaintext suốt cả ngày.

</details>

### Câu 13 `medium`

A fintech enterprise generates 2 TB of structured JSON application logs per day in Amazon CloudWatch Logs. Operations teams need fast full-text search and Kibana/Dashboards visualizations for the last 14 days of logs in Amazon OpenSearch Service, while compliance requires archiving ALL raw logs in Apache Parquet format partitioned by year/month/day/service in Amazon S3 Glacier for 5 years. How should the DevOps architect build a serverless, scalable ingestion pipeline from CloudWatch Logs?

- **A.** Stream CloudWatch Logs via Data Firehose to OpenSearch (14-day ISM) and Parquet/Dynamic Partitioning to S3 with Glacier Lifecycle.
- **B.** Schedule an AWS Lambda function every hour to call logs:CreateExportTask to S3 and then use AWS DataSync to load S3 files into OpenSearch Service.
- **C.** Keep all 5 years of 2 TB/day raw JSON logs inside Amazon OpenSearch Service hot data nodes for immediate ad-hoc querying.
- **D.** Install Logstash on a single large EC2 instance pulling from CloudWatch Logs continuously via the GetLogEvents API.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp fintech tạo ra 2 TB log ứng dụng JSON có cấu trúc mỗi ngày trong Amazon CloudWatch Logs. Các nhóm vận hành cần tìm kiếm toàn văn nhanh và trực quan hóa Kibana/Dashboards cho 14 ngày log gần nhất trong Amazon OpenSearch Service, trong khi quy định tuân thủ yêu cầu lưu trữ TẤT CẢ log thô ở định dạng Apache Parquet được phân vùng theo year/month/day/service trong Amazon S3 Glacier trong 5 năm. Kiến trúc sư DevOps nên xây dựng pipeline nhập dữ liệu serverless có khả năng mở rộng từ CloudWatch Logs như thế nào?

**Đáp án đúng:** **A**

Kiến trúc log streaming chuẩn ở quy mô lớn (TB/ngày): CloudWatch Logs Subscription Filter -> Amazon Data Firehose (hỗ trợ sẵn format conversion sang Parquet, Dynamic Partitioning lên S3 + Lifecycle sang Glacier, và delivery sang OpenSearch Service với ISM retention).

- **A (Đúng):** Chính xác! CloudWatch Logs Subscription Filter đẩy log theo thời gian thực sang Amazon Data Firehose (hoàn toàn serverless, tự mở rộng). Firehose hỗ trợ đẩy thẳng vào Amazon OpenSearch Service (dùng ISM xóa index sau 14 ngày) và hỗ trợ chuyển đổi định dạng sang Apache Parquet kèm Dynamic Partitioning (year/month/day/service) lưu vào S3 rồi chuyển sang Glacier bằng S3 Lifecycle.
- **B:** Sai. CreateExportTask bị giới hạn đồng thời (chỉ 1 task đang chạy mỗi tài khoản/Region ở thời điểm nhất định), độ trễ cao và AWS DataSync không phải công cụ ingest dữ liệu vào OpenSearch.
- **C:** Sai. Lưu trữ hơn 3,6 PB log suốt 5 năm trên hot nodes của OpenSearch sẽ có chi phí khổng lồ và không đáp ứng yêu cầu lưu Parquet trên S3 Glacier.
- **D:** Sai. Một EC2 đơn lẻ là single point of failure, không serverless, và gọi GetLogEvents liên tục cho 2 TB/ngày sẽ bị API throttling nghiêm trọng.

</details>

### Câu 14 `hard`

An organization with 50 AWS member accounts needs to aggregate CloudWatch Logs from all accounts in near real time into a single Central Logging account, convert the JSON logs into Apache Parquet partitioned by date, and store them in Amazon S3 for cost-effective SQL querying by security analysts. Which architecture meets these requirements?

- **A.** Export CloudWatch Logs from each member account to S3 using CreateExportTask every 5 minutes and query the raw JSON files using an Amazon Redshift cluster.
- **B.** Create a CloudWatch Logs Destination with Amazon Data Firehose (Parquet to S3) in the Central account, attach Subscription Filters, and query with Amazon Athena.
- **C.** Enable CloudWatch Cross-Account Observability (OAM) to automatically replicate and copy all logs into an Amazon OpenSearch Service cluster in the Central account.
- **D.** Install a cron job on every EC2 instance to rsync compressed log files directly to a centralized EC2 NFS server running inside the Central Logging account.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức với 50 tài khoản thành viên AWS cần tổng hợp CloudWatch Logs từ tất cả các tài khoản theo thời gian gần thực vào một tài khoản Central Logging duy nhất, chuyển đổi log JSON sang Apache Parquet được phân vùng theo ngày và lưu trữ trong Amazon S3 để các chuyên viên phân tích bảo mật truy vấn SQL tiết kiệm chi phí. Kiến trúc nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **B**

Mẫu kiến trúc Centralized Logging chi phí tối ưu trên AWS là: Member Account Subscription Filter → Central Account CloudWatch Logs Destination → Amazon Data Firehose (JSON → Parquet + Dynamic Partitioning) → S3 → Amazon Athena.

- **A:** Sai. CreateExportTask không phải near real-time (độ trễ có thể tới hàng giờ và bị giới hạn concurrent task), đồng thời chạy Redshift chỉ để truy vấn log JSON thô rất tốn kém.
- **B (Đúng):** Chính xác! CloudWatch Logs Subscription Filter đẩy log real-time sang Cross-Account CloudWatch Logs Destination (gắn Firehose), Firehose tự động chuyển JSON sang Parquet phân vùng theo ngày vào S3, và Athena truy vấn SQL không cần server với chi phí thấp nhất.
- **C:** Sai. CloudWatch OAM dùng để xem/truy vấn tập trung mà không nhân bản log, không tự chuyển Parquet vào S3 hay copy vào OpenSearch.
- **D:** Sai. Không hỗ trợ serverless logs (Lambda/ECS), thiếu khả năng mở rộng và tạo điểm lỗi đơn (SPOF).

</details>

### Câu 15 `medium`

A SaaS platform wants to proactively detect broken checkout pages, expired SSL certificates, and API latency regressions every 5 minutes—even during overnight hours when no real customers are visiting the site—and capture screenshots of UI failures. Which AWS service is BEST suited for this requirement?

- **A.** Amazon CloudWatch RUM (Real User Monitoring).
- **B.** Amazon CloudWatch Logs Insights.
- **C.** AWS Trusted Advisor.
- **D.** Amazon CloudWatch Synthetics Canaries.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng SaaS muốn chủ động phát hiện các trang thanh toán bị lỗi, chứng chỉ SSL hết hạn và suy giảm độ trễ API mỗi 5 phút—ngay cả vào ban đêm khi không có khách hàng thực nào truy cập trang web—và chụp ảnh màn hình các lỗi giao diện người dùng. Dịch vụ AWS nào PHÙ HỢP NHẤT cho yêu cầu này?

**Đáp án đúng:** **D**

Phân biệt rõ: CloudWatch Synthetics Canaries là giám sát chủ động (proactive synthetic monitoring, hoạt động cả khi 0 traffic), còn CloudWatch RUM là giám sát người dùng thật (passive real-user monitoring).

- **A:** Sai. CloudWatch RUM thu thập dữ liệu từ trình duyệt của người dùng thật đang truy cập, nên sẽ không có dữ liệu vào ban đêm khi không có khách hàng.
- **B:** Sai. Logs Insights chỉ truy vấn log đã phát sinh, không chủ động giả lập trình duyệt hay chụp ảnh màn hình UI.
- **C:** Sai. Trusted Advisor kiểm tra best practices của tài khoản AWS (chi phí, bảo mật, giới hạn dịch vụ), không kiểm thử hành trình checkout ứng dụng.
- **D (Đúng):** Chính xác! CloudWatch Synthetics Canaries chạy script headless browser (Puppeteer/Playwright) định kỳ 24/7 để giả lập thao tác người dùng, kiểm tra SSL/API và lưu screenshot/HAR file lỗi vào S3 kể cả khi không có user thật.

</details>

### Câu 16 `medium`

A DevOps team needs to monitor memory utilization, swap usage, and application error logs on an Auto Scaling group of Linux EC2 instances, and trigger a CloudWatch alarm whenever the string 'OutOfMemoryError' appears more than 3 times in 5 minutes. What should the team implement?

- **A.** Enable CloudWatch Detailed Monitoring on the Auto Scaling group to collect memory and swap metrics, and use CloudTrail Insights to detect 'OutOfMemoryError'.
- **B.** Install the Unified CloudWatch Agent on the Golden AMI to push memory metrics and app logs, then create a Logs Metric Filter and Alarm for 'OutOfMemoryError'.
- **C.** Use AWS Systems Manager Inventory with a custom PowerShell script to stream 'OutOfMemoryError' logs directly to CloudWatch Metrics in real time.
- **D.** Configure an Application Load Balancer access log filter in Amazon Athena to extract EC2 memory utilization and 'OutOfMemoryError' stack traces.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm DevOps cần giám sát mức sử dụng bộ nhớ, mức sử dụng swap và log lỗi ứng dụng trên một Auto Scaling group gồm các Linux EC2 instance, đồng thời kích hoạt CloudWatch alarm bất cứ khi nào chuỗi 'OutOfMemoryError' xuất hiện nhiều hơn 3 lần trong 5 phút. Nhóm nên triển khai gì?

**Đáp án đúng:** **B**

EC2 mặc định không gửi RAM/Disk/Swap lên CloudWatch; bắt buộc phải dùng Unified CloudWatch Agent. Để cảnh báo dựa trên từ khóa trong log, dùng CloudWatch Logs Metric Filter kết hợp CloudWatch Alarm.

- **A:** Sai. Detailed Monitoring chỉ giảm chu kỳ hypervisor metrics xuống 1 phút (không có RAM/Swap); CloudTrail chỉ ghi AWS API calls chứ không đọc log ứng dụng.
- **B (Đúng):** Chính xác! Unified CloudWatch Agent thu thập cả OS metrics (RAM, swap, disk) lẫn log ứng dụng; Metric Filter trích xuất số lần xuất hiện chuỗi 'OutOfMemoryError' thành metric để gắn CloudWatch Alarm.
- **C:** Sai. SSM Inventory chỉ thu thập metadata phần mềm/cấu hình định kỳ, không stream log ứng dụng hay tạo alarm.
- **D:** Sai. ALB Access Logs chỉ chứa thông tin request HTTP, không chứa thông số RAM hay exception bên trong ứng dụng.

</details>

---

[Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md)
