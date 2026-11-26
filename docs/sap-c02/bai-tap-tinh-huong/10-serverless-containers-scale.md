# Bài tập tình huống — Chủ đề 10: Large-Scale Serverless, Containers & Event-Driven — Lambda Concurrency, EKS, ECS, EventBridge & Step Functions

> Lambda Reserved vs Provisioned Concurrency, EventBridge Cross-Account Event Bus, Step Functions Distributed Map, ECS/EKS Karpenter & Fargate Spot.
> **Số câu hỏi:** 22 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A technology company runs a steady baseline of microservices on Amazon EC2 (c6i and m6i families) and plans to gradually migrate 60% of those services to AWS Fargate and AWS Lambda over the next 18 months. In addition, the company runs fault-tolerant batch video rendering jobs on EC2 Auto Scaling groups that can handle 2-minute interruption notices. Which purchasing strategy achieves the MAXIMUM cost savings while preserving architectural flexibility?

- **A.** Use On-Demand Capacity Reservations for the steady EC2 baseline and purchase EC2 Dedicated Hosts for all fault-tolerant batch video rendering jobs.
- **B.** Purchase 3-year EC2 Instance Savings Plans for the entire steady baseline and use On-Demand Instances with Auto Scaling for the batch video rendering jobs.
- **C.** Purchase a Compute Savings Plan for the EC2/Fargate/Lambda baseline, and run batch rendering on EC2 Spot Instances with price-capacity-optimized allocation across multiple instance types.
- **D.** Purchase 3-year Standard Reserved Instances for the EC2 baseline and use EC2 Spot Instances with the lowest-price allocation strategy on a single instance type for batch rendering.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty công nghệ chạy mức nền ổn định các microservice trên Amazon EC2 (các họ c6i và m6i) và dự định từng bước di chuyển 60% các dịch vụ đó sang AWS Fargate và AWS Lambda trong 18 tháng tới. Ngoài ra, công ty chạy các tác vụ kết xuất video theo lô có khả năng chịu lỗi trên EC2 Auto Scaling group có thể xử lý thông báo gián đoạn trước 2 phút. Chiến lược mua hàng nào đạt được mức tiết kiệm chi phí TỐI ĐA trong khi vẫn giữ sự linh hoạt về kiến trúc?

**Đáp án đúng:** **C**

Chiến lược FinOps tối ưu kết hợp: **Compute Savings Plans** cho tải nền tảng đang chuyển dịch dần từ EC2 sang Fargate/Lambda, và **EC2 Spot Instances (price-capacity-optimized + đa dạng instance types)** cho tác vụ batch chịu được gián đoạn.

- **A:** On-Demand Capacity Reservations không có chiết khấu giá và Dedicated Hosts đắt hơn rất nhiều so với Spot Instances.
- **B:** EC2 Instance Savings Plans bị khóa vào một họ instance (instance family) và Region cụ thể trên EC2, KHÔNG áp dụng cho Fargate hay Lambda. Dùng On-Demand cho batch rendering lãng phí cơ hội tiết kiệm tới 90% của Spot.
- **C (Đúng):** Chính xác. Compute Savings Plans tự động áp dụng chiết khấu linh hoạt cho cả EC2 (mọi họ/Region/OS), AWS Fargate và AWS Lambda — hoàn hảo cho lộ trình hiện đại hóa trong 18 tháng tới. Đối với batch rendering chịu được gián đoạn, EC2 Spot Instances với chiến lược price-capacity-optimized (và đa dạng hóa instance types) tối ưu cả chi phí lẫn tỷ lệ gián đoạn thấp.
- **D:** Standard RIs không áp dụng được khi chuyển sang Fargate/Lambda, và chiến lược lowest-price trên 1 loại instance duy nhất dễ bị thu hồi (interruption) liên tục.

</details>

### Câu 2 `medium`

An e-commerce company operates a legacy monolithic Java application on Amazon EC2 instances behind an Application Load Balancer (ALB). The business wants to incrementally modernize the monolith into domain-specific microservices (Inventory, Checkout, and Recommendations) running on Amazon ECS Fargate and AWS Lambda without a risky big-bang rewrite or downtime for customers. Both the monolith and the newly extracted microservices must react to order-placed events asynchronously. Which architectural pattern should the Solutions Architect implement?

- **A.** Apply the Strangler Fig pattern with ALB path-based routing to route specific API paths to new ECS Fargate/Lambda microservices, using EventBridge for async events.
- **B.** Freeze all feature development for 12 months, rewrite the entire Java monolith into Lambda functions, and switch DNS via Route 53 in a single big-bang cutover event.
- **C.** Deploy all new microservices inside the same EC2 Auto Scaling group as the monolith and share a single local SQLite database for asynchronous event synchronization.
- **D.** Use AWS Application Migration Service (AWS MGN) to automatically refactor the Java monolith source code into independent Node.js Lambda functions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty thương mại điện tử vận hành ứng dụng Java nguyên khối kế thừa trên các Amazon EC2 instance phía sau Application Load Balancer (ALB). Doanh nghiệp muốn từng bước hiện đại hóa ứng dụng nguyên khối thành các microservice theo miền nghiệp vụ (Inventory, Checkout và Recommendations) chạy trên Amazon ECS Fargate và AWS Lambda mà không cần viết lại toàn bộ đầy rủi ro hoặc gây gián đoạn cho khách hàng. Cả ứng dụng nguyên khối và các microservice mới tách ra đều phải phản ứng bất đồng bộ với các sự kiện đặt hàng (order-placed). Solutions Architect nên triển khai mẫu hình kiến trúc nào?

**Đáp án đúng:** **A**

Mẫu **Strangler Fig** (dùng **ALB/API Gateway path-based routing** chuyển dịch lưu lượng từng phần kết hợp **Amazon EventBridge** để tách rời giao tiếp sự kiện) là kiến trúc chuẩn để hiện đại hóa (Refactor) ứng dụng nguyên khối an toàn, không downtime.

- **A (Đúng):** Chính xác. Mẫu kiến trúc Strangler Fig sử dụng lớp định tuyến phía trước (ALB path-based routing hoặc API Gateway) để chuyển dần từng nhóm endpoint (Inventory, Checkout...) sang microservices mới trên ECS Fargate/Lambda mà không gây downtime, đồng thời dùng Amazon EventBridge để truyền phát sự kiện bất đồng bộ (event-driven decoupling) giữa hệ thống cũ và mới.
- **B:** Viết lại toàn bộ theo kiểu Big-Bang mang rủi ro cực cao, đóng băng phát triển tính năng kinh doanh và trái ngược với yêu cầu hiện đại hóa từng bước (incrementally).
- **C:** Chạy chung trên cùng EC2 và chia sẻ DB cục bộ tạo ra distributed monolith (tight coupling), không tận dụng được ECS Fargate/Lambda hay kiến trúc hướng sự kiện.
- **D:** AWS MGN chỉ dùng cho Lift-and-Shift (Rehost) máy chủ, không có khả năng tự động refactor mã nguồn Java thành Lambda.

</details>

### Câu 3 `hard`

A high-traffic retail API runs on Amazon EKS worker nodes distributed across three Availability Zones behind an Application Load Balancer (ALB) in us-east-1. Occasionally, a single Availability Zone experiences a 'gray failure' (elevated packet loss or downstream dependency timeouts) where EC2 health checks still pass, causing elevated 5xx errors for a third of all users. The SRE team wants an automated, AWS-native mechanism to rapidly shift traffic away from an impaired Availability Zone without waiting for manual DNS edits or terminating EKS pods. Which solution should the Solutions Architect implement?

- **A.** Create a Route 53 Failover routing policy with 10-second TTL pointing to three separate Application Load Balancers, one per Availability Zone.
- **B.** Disable cross-zone load balancing on the ALB and enable Amazon Route 53 Application Recovery Controller (ARC) Zonal Autoshift (with practice runs) on the ALB.
- **C.** Enable cross-zone load balancing on the ALB so healthy EKS worker nodes in other AZs automatically mask gray failures occurring in the impaired Availability Zone.
- **D.** Configure AWS Auto Scaling to immediately terminate all EKS worker nodes in an Availability Zone whenever CloudWatch detects a single HTTP 5xx error.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một API bán lẻ lưu lượng cao chạy trên các Amazon EKS worker node phân bố trên ba Availability Zone phía sau Application Load Balancer (ALB) tại us-east-1. Thỉnh thoảng, một Availability Zone đơn lẻ gặp 'lỗi xám' (gray failure - mất gói tin tăng cao hoặc timeout phụ thuộc phía sau) trong khi kiểm tra sức khỏe EC2 vẫn đạt, gây ra lỗi 5xx tăng cao cho một phần ba người dùng. Nhóm SRE muốn một cơ chế tự động, nguyên bản của AWS để nhanh chóng chuyển lưu lượng ra khỏi Availability Zone bị suy giảm mà không phải chờ chỉnh sửa DNS thủ công hoặc chấm dứt các EKS pod. Solutions Architect nên triển khai giải pháp nào?

**Đáp án đúng:** **B**

**Amazon Route 53 ARC Zonal Shift / Zonal Autoshift** (kết hợp tắt cross-zone load balancing để đảm bảo zonal isolation) là tính năng chuyên biệt của AWS để xử lý **gray failures** ở mức Availability Zone nhanh chóng và an toàn.

- **A:** ALB yêu cầu tối thiểu 2 subnets ở 2 AZ khác nhau nên không thể tạo ALB chỉ nằm trong 1 AZ, và cơ chế này phức tạp hơn rất nhiều so với ARC Zonal Autoshift.
- **B (Đúng):** Chính xác. Route 53 ARC Zonal Shift / Zonal Autoshift (yêu cầu tắt cross-zone load balancing trên ALB/NLB để cô lập từng AZ) cho phép AWS tự động phát hiện sự cố tầng AZ (kể cả gray failure) và rút toàn bộ DNS IP của AZ lỗi ra khỏi ALB trong vài giây, đồng thời hỗ trợ practice runs định kỳ để đảm bảo các AZ còn lại đủ năng lực chịu tải.
- **C:** Bật cross-zone load balancing khiến ALB ở các AZ khỏe vẫn tiếp tục đẩy traffic sang các pod ở AZ đang bị gray failure (vì health check vẫn pass), làm lan rộng lỗi 5xx thay vì cô lập AZ.
- **D:** Xóa toàn bộ node EKS khi gặp lỗi 5xx rất chậm, gây xáo trộn hệ thống (cascading failure) và vi phạm yêu cầu không terminate EKS pods.

</details>

### Câu 4 `hard`

A retail enterprise runs an Amazon Redshift cluster using dense-storage (ds2.8xlarge) nodes. Storage grows by 20% annually due to 7 years of historical order data, forcing the team to keep adding expensive compute nodes even though CPU utilization averages only 25%. Additionally, every Monday morning at 9:00 AM, hundreds of BI analysts run concurrent dashboard queries causing severe query queuing, while 5 years of older historical data is queried only once a quarter. How should the Solutions Architect optimize BOTH cost and query concurrency?

- **A.** Pause the Amazon Redshift cluster every weekend to save compute costs and run an AWS Lambda function to manually resize the cluster every Monday morning at 9:00 AM.
- **B.** Upgrade the cluster to Amazon Redshift dc2.8xlarge dense-compute nodes and double the node count to handle Monday morning BI dashboard peaks.
- **C.** Migrate to Redshift RA3 nodes (Managed Storage), offload 5-year historical data as S3 Parquet queried via Redshift Spectrum, and enable Concurrency Scaling.
- **D.** Migrate the entire 7-year enterprise data warehouse to Amazon Aurora PostgreSQL with 15 Read Replicas and Auto Scaling endpoints.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp bán lẻ vận hành cụm Amazon Redshift sử dụng các node dense-storage (ds2.8xlarge). Dung lượng lưu trữ tăng 20% mỗi năm do 7 năm dữ liệu đơn hàng lịch sử, buộc nhóm phải liên tục thêm các compute node đắt tiền mặc dù mức sử dụng CPU trung bình chỉ 25%. Ngoài ra, mỗi sáng thứ Hai lúc 9:00 sáng, hàng trăm nhà phân tích BI chạy các truy vấn bảng điều khiển đồng thời gây xếp hàng truy vấn nghiêm trọng, trong khi 5 năm dữ liệu lịch sử cũ hơn chỉ được truy vấn mỗi quý một lần. Solutions Architect nên tối ưu hóa CẢ chi phí lẫn khả năng xử lý truy vấn đồng thời như thế nào?

**Đáp án đúng:** **C**

Bộ 3 kỹ thuật tối ưu **Amazon Redshift** trong SAP-C02: (1) **RA3 nodes** (Managed Storage tách biệt compute/storage), (2) **Redshift Spectrum** (truy vấn dữ liệu lịch sử dạng Parquet trên S3), và (3) **Concurrency Scaling** (tự động gánh tải đỉnh BI đột biến).

- **A:** Không giải quyết bài toán lưu trữ tăng 20%/năm gắn chặt với ds2 nodes, và resize cụm thủ công mất thời gian hơn nhiều so với Concurrency Scaling tự động trong vài giây.
- **B:** dc2 cũng gắn chặt compute với local SSD storage; nhân đôi số node chỉ để gánh peak sáng thứ Hai sẽ cực kỳ lãng phí chi phí trong suốt phần còn lại của tuần.
- **C (Đúng):** Chính xác. Kiến trúc tối ưu toàn diện cho Redshift: (1) chuyển từ ds2 sang **RA3** để tách biệt compute và storage (không phải mua thêm node chỉ để tăng ổ đĩa), (2) đẩy 5 năm dữ liệu lạnh ra S3 dạng Parquet và truy vấn khi cần bằng **Redshift Spectrum**, và (3) bật **Concurrency Scaling** (có sẵn 1 giờ miễn phí/ngày) để tự động thêm cụm xử lý tạm thời cho đợt peak sáng thứ Hai.
- **D:** Aurora là cơ sở dữ liệu OLTP, không tối ưu cho truy vấn phân tích cột (OLAP/MPP) quy mô data warehouse như Redshift.

</details>

### Câu 5 `hard`

A financial ledger system uses Amazon SQS and AWS Lambda to process account balance updates. During traffic bursts, duplicate messages occasionally cause double-deductions, and updates for the same customer account must be processed strictly in order. Furthermore, Lambda consumes messages in batches of 10; when 1 poison-pill message in a batch fails, all 9 valid messages in the same batch are currently retried and reprocessed, causing wasted compute and duplicate side effects. Which TWO architectural improvements should the Solutions Architect implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Enable ReportBatchItemFailures on the Lambda Event Source Mapping so the function returns only the failed message IDs, and attach an SQS FIFO Dead-Letter Queue (DLQ) with a maxReceiveCount redrive policy.
- **B.** Use an Amazon SQS Standard queue with long polling and increase the Lambda batch size to 100 to reduce duplicate message deliveries.
- **C.** Migrate to an Amazon SQS FIFO queue with Content-Based Deduplication (or MessageDeduplicationId) enabled and set the customer account ID as the MessageGroupId.
- **D.** Set the SQS queue Visibility Timeout to 0 seconds so failed messages are immediately retried by another concurrent Lambda invocation.
- **E.** Attach an Amazon SQS Standard Dead-Letter Queue to the SQS FIFO source queue so failed poison-pill messages can be processed out of order.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hệ thống sổ cái tài chính sử dụng Amazon SQS và AWS Lambda để xử lý cập nhật số dư tài khoản. Trong các đợt lưu lượng tăng đột biến, các thông điệp trùng lặp thỉnh thoảng gây trừ tiền hai lần, và các bản cập nhật cho cùng một tài khoản khách hàng phải được xử lý nghiêm ngặt theo đúng thứ tự. Hơn nữa, Lambda tiêu thụ thông điệp theo lô 10; khi 1 thông điệp lỗi (poison-pill) trong lô thất bại, cả 9 thông điệp hợp lệ trong cùng lô hiện bị thử lại và xử lý lại, gây lãng phí compute và tác dụng phụ trùng lặp. Solutions Architect nên triển khai HAI cải tiến kiến trúc nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, C**

Mẫu Event-Driven tin cậy cho giao dịch tài chính: dùng **SQS FIFO (`MessageGroupId` = accountId + Deduplication)** để đảm bảo thứ tự và chống trùng lặp, kết hợp **Lambda Partial Batch Response (`ReportBatchItemFailures`) + FIFO DLQ** để không xử lý lại cả batch khi gặp 1 poison-pill message.

- **A (Đúng):** Chính xác. Bật `ReportBatchItemFailures` (Partial Batch Response) cho phép Lambda chỉ báo lỗi đúng 1 bản ghi hỏng (poison-pill) để retry riêng nó mà không retry lại 9 bản ghi đã thành công trong batch; kết hợp FIFO DLQ để cô lập poison-pill sau số lần retry giới hạn, tránh tắc nghẽn toàn bộ MessageGroupId.
- **B:** SQS Standard chỉ đảm bảo at-least-once và best-effort ordering; tăng batch size lên 100 thậm chí làm trầm trọng hơn lỗi retry cả batch.
- **C (Đúng):** Chính xác. SQS FIFO đảm bảo xử lý chính xác một lần (exactly-once processing) nhờ Deduplication ID và đảm bảo thứ tự nghiêm ngặt theo từng tài khoản khách hàng thông qua `MessageGroupId` (trong khi các tài khoản khác nhau vẫn được xử lý song song).
- **D:** Visibility Timeout bằng 0 sẽ khiến nhiều Lambda đọc trùng cùng một message ngay lập tức, gây loạn dữ liệu và double-deduction nghiêm trọng hơn.
- **E:** SQS FIFO source queue bắt buộc phải dùng SQS FIFO Dead-Letter Queue, không thể gắn Standard DLQ vào FIFO queue.

</details>

### Câu 6 `hard`

An enterprise is modernizing a legacy Windows-based e-commerce suite consisting of ASP.NET Web APIs (running on IIS) and a Microsoft SQL Server Enterprise database with complex T-SQL stored procedures. Management wants to eliminate expensive Windows Server and SQL Server Enterprise licensing fees by moving the web tier to Linux containers on Amazon ECS and migrating the database to Amazon Aurora PostgreSQL with MINIMAL rewriting of the application's existing T-SQL queries and client drivers. Which TWO AWS tools/features best accelerate this modernization? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Migrate the SQL Server database to Amazon RDS for SQL Server Enterprise Edition using BYOL on EC2 Dedicated Hosts to eliminate SQL Server licensing costs.
- **B.** Enable Babelfish for Amazon Aurora PostgreSQL so Aurora PostgreSQL natively understands the SQL Server TDS wire protocol and T-SQL queries with minimal application code changes.
- **C.** Use AWS Porting Assistant for .NET to assess and assist porting the legacy .NET Framework web APIs to cross-platform .NET (Linux), then deploy them as Linux containers on Amazon ECS.
- **D.** Deploy the legacy Windows IIS ASP.NET Web APIs directly onto AWS Lambda using the Windows Server managed container runtime.
- **E.** Use AWS App2Container to automatically rewrite legacy .NET Framework 4.x ASP.NET Web API source code into Python AWS Lambda functions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp đang hiện đại hóa bộ ứng dụng thương mại điện tử nền tảng Windows kế thừa bao gồm các ASP.NET Web API (chạy trên IIS) và cơ sở dữ liệu Microsoft SQL Server Enterprise với các T-SQL stored procedure phức tạp. Ban quản lý muốn loại bỏ phí bản quyền Windows Server và SQL Server Enterprise đắt đỏ bằng cách chuyển tầng web sang Linux container trên Amazon ECS và di chuyển cơ sở dữ liệu sang Amazon Aurora PostgreSQL với mức viết lại TỐI THIỂU các truy vấn T-SQL và driver client hiện có của ứng dụng. HAI công cụ/tính năng AWS nào thúc đẩy quá trình hiện đại hóa này tốt nhất? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, C**

Lộ trình thoát khỏi bản quyền Windows & SQL Server nhanh nhất trên AWS: dùng **AWS Porting Assistant for .NET** để đưa ứng dụng .NET sang Linux containers (ECS/Fargate) và dùng **Babelfish for Aurora PostgreSQL** để chuyển từ SQL Server sang Aurora PostgreSQL mà gần như không phải viết lại T-SQL hay đổi driver.

- **A:** Dùng RDS for SQL Server Enterprise BYOL vẫn phải trả tiền bản quyền SQL Server Enterprise và thuê Dedicated Hosts đắt đỏ, không loại bỏ được chi phí license.
- **B (Đúng):** Chính xác. Babelfish for Aurora PostgreSQL cung cấp lớp tương thích trực tiếp giao thức mạng TDS (port 1433) và ngôn ngữ T-SQL của SQL Server ngay trên Aurora PostgreSQL, giúp ứng dụng .NET giữ nguyên SQL Server drivers và phần lớn câu lệnh T-SQL trong khi cắt bỏ hoàn toàn chi phí bản quyền SQL Server Enterprise.
- **C (Đúng):** Chính xác. AWS Porting Assistant for .NET quét mã nguồn .NET Framework cũ, phát hiện các API không tương thích và hỗ trợ chuyển đổi sang .NET hiện đại chạy trên Linux containers (ECS/Fargate), giúp loại bỏ hoàn toàn chi phí bản quyền Windows Server.
- **D:** AWS Lambda chỉ chạy trên môi trường Amazon Linux, không có Windows Server managed runtime cho ứng dụng IIS.
- **E:** AWS App2Container chỉ đóng gói ứng dụng hiện có thành container (với .NET Framework vẫn là Windows container), không tự động viết lại code sang Python Lambda.

</details>

### Câu 7 `hard`

A regulated fintech company builds serverless payment microservices using AWS Lambda. Internal auditors mandate that only cryptographically verified deployment packages built by the central CI/CD pipeline can be deployed to production Lambda functions, and that deployment must be strictly blocked if a package signature is invalid or tampered with. Additionally, the team must ensure no developer can bypass this check by modifying the function's code signing settings. Which TWO measures should the Solutions Architect implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Configure AWS WAF regional Web ACLs in front of the AWS Lambda Invoke API endpoint to inspect deployment ZIP payloads for tampering.
- **B.** Enable Amazon Inspector Lambda code scanning with continuous monitoring, which automatically blocks deployment of any unsigned or tampered Lambda ZIP packages.
- **C.** Encrypt the Lambda deployment ZIP package in Amazon S3 with SSE-S3, which cryptographically guarantees that only the central CI/CD pipeline created the artifact.
- **D.** Create an AWS Signer profile for the CI/CD pipeline to sign Lambda ZIP packages, and attach a Lambda Code Signing Configuration with UntrustedArtifactOnDeployment set to Enforce.
- **E.** Apply an AWS Organizations SCP or IAM permission boundary denying lambda:DeleteFunctionCodeSigningConfig and PutFunctionCodeSigningConfig except for Security Admin.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty fintech chịu quản lý chặt chẽ xây dựng các microservice thanh toán serverless bằng AWS Lambda. Kiểm toán viên nội bộ bắt buộc chỉ các gói triển khai đã được xác minh bằng mật mã do pipeline CI/CD trung tâm xây dựng mới có thể được triển khai lên các hàm Lambda production, và việc triển khai phải bị chặn nghiêm ngặt nếu chữ ký gói không hợp lệ hoặc bị giả mạo. Ngoài ra, nhóm phải đảm bảo không lập trình viên nào có thể vượt qua bước kiểm tra này bằng cách sửa đổi cài đặt ký mã (code signing) của hàm. Solutions Architect nên triển khai HAI biện pháp nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **D, E**

Để bảo vệ chuỗi cung ứng phần mềm (supply-chain security) cho **AWS Lambda**, cần kết hợp **AWS Signer** + **Lambda Code Signing Configuration (Enforce)** để chặn artifact không hợp lệ, đồng thời dùng **SCP/IAM Deny** khóa quyền `PutFunctionCodeSigningConfig` / `DeleteFunctionCodeSigningConfig` nhằm chống bypass.

- **A:** AWS WAF không thể gắn trước AWS Control Plane API endpoint (lambda.amazonaws.com) để kiểm tra chữ ký gói ZIP.
- **B:** Amazon Inspector quét lỗ hổng bảo mật (vulnerabilities) trong mã nguồn và thư viện Lambda sau khi triển khai; nó không xác thực chữ ký số và không chặn deployment gói chưa ký.
- **C:** SSE-S3 chỉ mã hóa dữ liệu lúc nghỉ (encryption at rest) trong S3, không cung cấp chữ ký số xác minh nguồn gốc (code signing) hay chặn triển khai code bị sửa đổi.
- **D (Đúng):** Chính xác. AWS Signer ký số gói triển khai Lambda trong CI/CD pipeline, và Lambda Code Signing Configuration đặt chế độ Enforce sẽ chặn cứng mọi thao tác triển khai nếu gói code không có chữ ký hợp lệ hoặc đã bị chỉnh sửa.
- **E (Đúng):** Chính xác. Để ngăn lập trình viên lách luật bằng cách gỡ hoặc sửa Code Signing Configuration trên Lambda function, cần khóa các hành động lambda:DeleteFunctionCodeSigningConfig và lambda:PutFunctionCodeSigningConfig bằng SCP hoặc IAM Policy/Permission Boundary.

</details>

### Câu 8 `medium`

An order management service writes millions of updates daily to an Amazon DynamoDB table. Currently, an AWS Lambda function polls DynamoDB Streams, filters out 95% of events that do not have status='SHIPPED', enriches the remaining 5% by calling an internal API, and publishes them to an Amazon SQS queue. The team wants to eliminate boilerplate polling/filtering Lambda code and reduce invocation costs while keeping strict event ordering per shard. What should the Solutions Architect recommend?

- **A.** Use Amazon EventBridge Pipes with DynamoDB Stream as source, a Pipe filter for status='SHIPPED', API Destination enrichment, and SQS as target.
- **B.** Configure an Amazon EventBridge Event Bus rule with content filtering to directly subscribe to the DynamoDB Stream without Lambda.
- **C.** Use DynamoDB Global Tables with IAM replication filters to replicate only status='SHIPPED' items to a second table attached to SQS.
- **D.** Enable Amazon Kinesis Data Streams on the DynamoDB table and attach an Amazon Kinesis Data Firehose delivery stream directly to the target SQS queue.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một dịch vụ quản lý đơn hàng ghi hàng triệu bản cập nhật mỗi ngày vào một bảng Amazon DynamoDB. Hiện tại, một hàm AWS Lambda thăm dò DynamoDB Streams, lọc bỏ 95% các sự kiện không có status='SHIPPED', làm giàu 5% còn lại bằng cách gọi một API nội bộ và phát hành chúng tới một Amazon SQS queue. Nhóm muốn loại bỏ mã nguồn Lambda lặp đi lặp lại dùng để thăm dò/lọc và giảm chi phí gọi hàm trong khi vẫn giữ thứ tự sự kiện nghiêm ngặt theo từng shard. Solutions Architect nên đề xuất gì?

**Đáp án đúng:** **A**

**Amazon EventBridge Pipes** là mẫu kiến trúc chuẩn để nối các nguồn streaming/queue (**DynamoDB Streams, SQS, Kinesis, MSK**) tới đích đến, tích hợp sẵn **Filter** (tiết kiệm chi phí xử lý), **Enrichment** và bảo toàn thứ tự mà không phải viết code glue.

- **A (Đúng):** Chính xác. Amazon EventBridge Pipes kết nối điểm-tới-điểm từ DynamoDB Streams tới SQS, hỗ trợ lọc sự kiện ngay ở bước filter (loại bỏ 95% sự kiện không cần thiết trước khi gọi bước enrichment để tiết kiệm chi phí), giữ nguyên thứ tự theo shard và loại bỏ hoàn toàn code boilerplate.
- **B:** EventBridge Event Bus không thể trực tiếp đọc từ DynamoDB Streams (chỉ EventBridge Pipes mới hỗ trợ poll nguồn DynamoDB Streams).
- **C:** DynamoDB Global Tables sao chép toàn bộ bảng (không lọc theo thuộc tính item) và không đẩy trực tiếp vào SQS.
- **D:** Kinesis Data Firehose không hỗ trợ SQS làm đích đến (destination) và không có tính năng lọc/làm giàu đơn giản theo sự kiện như EventBridge Pipes.

</details>

### Câu 9 `hard`

A genomics research firm stores 40 million small CSV files in an Amazon S3 bucket. Every month, a batch pipeline must parse every file, run a lightweight Python normalization script, and aggregate summary results back to S3 within 30 minutes. Previously, the team tried an AWS Step Functions Standard Workflow with an Inline Map state, but it hit the 25,000 event history limit and 40 concurrent iteration cap. How should the architect redesign the workflow for massive serverless parallelism with minimal infrastructure management?

- **A.** Use Amazon S3 Event Notifications to trigger a single AWS Lambda function with reserved concurrency set to 10 to process all 40 million files.
- **B.** Keep the Inline Map state in Step Functions Standard Workflow and split the 40 million CSV files across 1,000 separate S3 buckets.
- **C.** Switch Step Functions Map to Distributed Map mode with S3 ItemReader, ItemBatcher, and up to 10,000 concurrent Express child workflows invoking Lambda.
- **D.** Provision a 500-node Amazon EC2 Auto Scaling group and use a scheduled cron job to list and process the 40 million S3 CSV files from each node.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty nghiên cứu gen lưu trữ 40 triệu tệp CSV nhỏ trong một Amazon S3 bucket. Hàng tháng, một pipeline xử lý theo lô phải phân tích cú pháp mọi tệp, chạy tập lệnh chuẩn hóa Python nhẹ và tổng hợp kết quả tóm tắt trở lại S3 trong vòng 30 phút. Trước đây, nhóm đã thử dùng AWS Step Functions Standard Workflow với Inline Map state, nhưng gặp giới hạn 25.000 lịch sử sự kiện và mức trần 40 lần lặp đồng thời. Kiến trúc sư nên thiết kế lại quy trình như thế nào để đạt được tính song song serverless quy mô lớn với việc quản lý hạ tầng tối thiểu?

**Đáp án đúng:** **C**

Khi xử lý song song hàng triệu object/dòng dữ liệu trong S3 bằng serverless, **AWS Step Functions Distributed Map** (tối đa **10.000 concurrent executions** + **ItemReader/ItemBatcher**) là nâng cấp vượt trội so với Inline Map (giới hạn 40 concurrency và 25.000 lịch sử sự kiện).

- **A:** S3 Event Notifications chỉ kích hoạt khi có sự kiện tạo/sửa object mới (không chạy lại định kỳ hàng tháng trên 40 triệu file đã có sẵn), và concurrency = 10 quá chậm để hoàn thành trong 30 phút.
- **B:** Inline Map vẫn bị giới hạn 40 luồng song song và giới hạn kích thước payload/event history, đồng thời chia ra 1.000 S3 bucket vượt quá giới hạn mặc định và cực kỳ khó quản lý.
- **C (Đúng):** Chính xác. AWS Step Functions Distributed Map được thiết kế chuyên biệt để xử lý dữ liệu quy mô lớn trực tiếp trên hàng chục triệu object S3, hỗ trợ tối đa 10.000 child workflow chạy song song (thường dùng Express Workflows + ItemBatcher để tối ưu chi phí và tốc độ) mà không vướng giới hạn 25.000 event history của Inline Map.
- **D:** Quản lý cụm 500 EC2 và tự chia việc (coordination/sharding) từ S3 list tạo ra gánh nặng vận hành lớn, dễ xử lý trùng lặp và không phải giải pháp serverless.

</details>

### Câu 10 `medium`

A SaaS company currently runs steady-state baseline workloads on x86-based Amazon EC2 m6i instances across us-east-1 and eu-west-1. Over the next 12 months, engineering plans to migrate 60% of these workloads to AWS Graviton4 (m8g) EC2 instances and refactor the remaining 40% into containerized services on AWS Fargate and AWS Lambda. Finance wants a 1-year commitment discount that automatically applies across the entire transformation without locking the company into a single instance family, Region, or compute service. Which purchasing option should the architect recommend?

- **A.** Purchase a 1-year Compute Savings Plan matching the steady-state hourly spend baseline.
- **B.** Purchase a 1-year EC2 Instance Savings Plan for m6i in us-east-1.
- **C.** Purchase 1-year Standard EC2 Reserved Instances for the m6i family in us-east-1 and eu-west-1.
- **D.** Purchase 1-year Convertible Reserved Instances and manually exchange them for Fargate and Lambda credits later.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty SaaS hiện chạy các workload nền ổn định trên các Amazon EC2 m6i instance nền tảng x86 tại us-east-1 và eu-west-1. Trong 12 tháng tới, bộ phận kỹ thuật dự định di chuyển 60% các workload này sang các EC2 instance AWS Graviton4 (m8g) và tái cấu trúc 40% còn lại thành các dịch vụ container trên AWS Fargate và AWS Lambda. Bộ phận tài chính muốn một gói cam kết giảm giá 1 năm tự động áp dụng xuyên suốt toàn bộ quá trình chuyển đổi mà không khóa công ty vào một họ instance, Region hay dịch vụ compute duy nhất. Kiến trúc sư nên đề xuất tùy chọn mua hàng nào?

**Đáp án đúng:** **A**

Trong FinOps trên AWS, khi doanh nghiệp có kế hoạch dịch chuyển giữa các **instance family (x86 -> Graviton)**, đổi **Region**, hoặc hiện đại hóa từ **EC2 sang Fargate/Lambda**, **Compute Savings Plans** là lựa chọn duy nhất đảm bảo không bị lãng phí cam kết.

- **A (Đúng):** Chính xác. Compute Savings Plans mang lại sự linh hoạt tối đa: tự động áp dụng mức giảm giá cho EC2 (bất kể instance family x86 hay Graviton, kích thước, OS, Region), đồng thời tự động bao phủ cả AWS Fargate và AWS Lambda xuyên suốt lộ trình hiện đại hóa.
- **B:** EC2 Instance Savings Plans tuy linh hoạt kích thước/OS nhưng vẫn bị khóa vào một instance family (m6i) và một Region cụ thể, không bao phủ Graviton (m8g), Fargate hay Lambda.
- **C:** Standard EC2 Reserved Instances khóa cứng theo instance family (m6i) và Region, hoàn toàn không áp dụng được khi chuyển sang Graviton (m8g), Fargate hay Lambda.
- **D:** Convertible Reserved Instances chỉ dùng được cho EC2, không thể chuyển đổi sang giảm giá cho AWS Fargate hoặc AWS Lambda.

</details>

### Câu 11 `hard`

A security architect manages 150 AWS accounts in AWS Organizations. Despite strict Service Control Policies (SCPs), an application team accidentally attached an overly permissive S3 bucket policy to a production bucket that granted s3:GetObject to an external AWS account outside the Organization. Because SCPs only restrict IAM principals inside the Organization and do not evaluate external principals accessing a resource via a resource-based policy, the data was exposed. Which AWS Organizations policy type can centrally establish a data perimeter restricting access to S3 buckets, KMS keys, and SQS queues across all member accounts so ONLY principals from within the Organization can access them?

- **A.** Apply an IAM Permission Boundary to every IAM role in all 150 member accounts restricting cross-account resource policies.
- **B.** Enable S3 Block Public Access at the AWS account level, which automatically blocks access from all external AWS accounts outside the Organization.
- **C.** Attach an Organizations Resource Control Policy (RCP) denying S3, KMS, and SQS access unless aws:PrincipalOrgID matches your Organization ID.
- **D.** Attach a Service Control Policy (SCP) to the Root OU denying s3:GetObject, kms:Decrypt, and sqs:ReceiveMessage when aws:PrincipalOrgID does not equal the Organization ID.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiến trúc sư bảo mật quản lý 150 AWS account trong AWS Organizations. Mặc dù đã có Service Control Policies (SCPs) nghiêm ngặt, một nhóm ứng dụng đã vô tình gắn một S3 bucket policy quá rộng vào một bucket production, cấp quyền s3:GetObject cho một AWS account bên ngoài Organization. Vì SCP chỉ giới hạn các IAM principal bên trong Organization và không đánh giá các principal bên ngoài truy cập tài nguyên thông qua resource-based policy, dữ liệu đã bị lộ. Loại chính sách nào của AWS Organizations có thể thiết lập tập trung một vành đai dữ liệu (data perimeter) giới hạn quyền truy cập vào S3 bucket, khóa KMS và SQS queue trên tất cả các member account sao cho CHỈ các principal từ bên trong Organization mới có thể truy cập chúng?

**Đáp án đúng:** **C**

Phân biệt cốt lõi trong **Data Perimeter** của AWS Organizations: **SCPs** kiểm soát mức quyền tối đa cho **Principals nội bộ**, còn **Resource Control Policies (RCPs)** kiểm soát mức quyền tối đa cho **Resources** (ngăn cả external AWS accounts bên ngoài truy cập vào S3/KMS/SQS/STS/Secrets Manager của bạn).

- **A:** Giống như SCP, IAM Permission Boundary chỉ giới hạn quyền của IAM principal nội bộ, không thể ngăn tài khoản bên ngoài truy cập tài nguyên thông qua resource-based policy bị cấu hình hở.
- **B:** S3 Block Public Access chỉ chặn truy cập công cộng (Principal: '*' hoặc public ACL), KHÔNG chặn việc cấp quyền trực tiếp cho một mã tài khoản AWS bên ngoài cụ thể (cross-account ARN) trong bucket policy.
- **C (Đúng):** Chính xác. AWS Organizations Resource Control Policies (RCPs) là cơ chế kiểm soát tập trung áp đặt mức quyền tối đa (maximum available permissions) trực tiếp lên TÀI NGUYÊN (S3, STS, KMS, SQS, Secrets Manager) trong toàn Organization. Khác với SCP (chỉ chặn principal nội bộ), RCP chặn được cả external principals bên ngoài Organization truy cập vào tài nguyên dù bucket policy bị cấu hình sai.
- **D:** SCP chỉ áp dụng cho các IAM identity (user/role) nằm BÊN TRONG Organization; SCP hoàn toàn không đánh giá các external principal từ tài khoản AWS bên ngoài gọi vào S3 bucket policy của bạn.

</details>

### Câu 12 `medium`

A video transcoding platform processes stateless batch jobs from an Amazon SQS queue using an Amazon EC2 Auto Scaling group. Jobs are checkpointed every 60 seconds and can tolerate interruptions. Currently, the fleet uses 100% On-Demand c6i.4xlarge instances, costing $45,000 per month. The engineering team wants to cut compute costs by at least 60% while maintaining high capacity availability and minimizing the frequency of Spot interruptions during peak hours. Which Auto Scaling configuration is optimal?

- **A.** Purchase 3-year All Upfront Reserved Instances for c6i.4xlarge instances covering peak holiday video transcoding capacity.
- **B.** Migrate the video transcoding batch jobs from EC2 Auto Scaling to Amazon EC2 Dedicated Hosts with per-socket licensing.
- **C.** Configure a Mixed Instances Policy with a small On-Demand base, diversify across multiple compute-optimized instance types, and use price-capacity-optimized Spot allocation.
- **D.** Switch the Auto Scaling group to 100% Spot Instances using only the single c6i.4xlarge instance type and the lowest-price allocation strategy for maximum savings.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng chuyển mã video xử lý các tác vụ theo lô không lưu trạng thái từ một Amazon SQS queue bằng Amazon EC2 Auto Scaling group. Các tác vụ được lưu checkpoint mỗi 60 giây và có thể chịu được gián đoạn. Hiện tại, cụm sử dụng 100% On-Demand instance c6i.4xlarge với chi phí 45.000 USD mỗi tháng. Đội ngũ kỹ sư muốn cắt giảm chi phí compute ít nhất 60% trong khi vẫn duy trì tính sẵn sàng công suất cao và giảm thiểu tần suất gián đoạn Spot trong giờ cao điểm. Cấu hình Auto Scaling nào là tối ưu?

**Đáp án đúng:** **C**

Best practice tối ưu chi phí cho workload chịu được gián đoạn (stateless/checkpointed batch) là **EC2 Auto Scaling Mixed Instances Policy** + **đa dạng hóa nhiều instance family** + chiến lược **Spot `price-capacity-optimized` (hoặc `capacity-optimized`)** thay vì `lowest-price`.

- **A:** Mua Reserved Instances bao phủ cả đỉnh tải (peak capacity) sẽ gây lãng phí lớn trong các khung giờ thấp điểm của workload batch.
- **B:** Dedicated Hosts đắt hơn rất nhiều so với On-Demand và Spot, chỉ dùng cho các ràng buộc license BYOL hoặc tuân thủ cách ly vật lý.
- **C (Đúng):** Chính xác. Kết hợp Mixed Instances Policy (có lớp nền On-Demand nhỏ đảm bảo baseline + đa dạng hóa nhiều instance family/size) cùng chiến lược phân bổ Spot là price-capacity-optimized (hoặc capacity-optimized) giúp AWS tự chọn các Spot capacity pool sâu nhất, ít bị thu hồi nhất với mức giá tối ưu, dễ dàng giảm 60-80% chi phí.
- **D:** Chỉ dùng một loại instance duy nhất (c6i.4xlarge) với chiến lược lowest-price sẽ rơi vào các capacity pool nông, dễ bị thu hồi Spot hàng loạt (high interruption rate) và thiếu tài nguyên vào giờ cao điểm.

</details>

### Câu 13 `medium`

A logistics company is migrating a suite of 40 tightly coupled legacy Java microservices from on-premises to AWS under an aggressive 3-month data center exit deadline. All 40 services communicate asynchronously using standard JMS 1.1 and OpenWire protocols through an on-premises Apache ActiveMQ cluster. Rewriting all 40 applications to use Amazon SQS/SNS SDKs cannot be completed before the data center lease expires. What is the fastest, lowest-risk Replatform strategy for the messaging tier?

- **A.** Replace Apache ActiveMQ with Amazon Managed Streaming for Apache Kafka (Amazon MSK) and update all 40 legacy Java services to use Kafka consumers.
- **B.** Replace Apache ActiveMQ with Amazon EventBridge Event Buses.
- **C.** Migrate the messaging tier directly to Amazon SQS FIFO queues and deploy an AWS Lambda proxy adapter to translate JMS 1.1 OpenWire packets in real time.
- **D.** Migrate to Amazon MQ for ActiveMQ in an Active/Standby Multi-AZ setup so services reconnect via endpoint URL changes, then modernize to SQS/SNS later.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty logistics đang di chuyển bộ 40 microservice Java kế thừa gắn kết chặt chẽ từ on-premises lên AWS theo thời hạn rời trung tâm dữ liệu gấp rút trong 3 tháng. Cả 40 dịch vụ giao tiếp bất đồng bộ bằng các giao thức tiêu chuẩn JMS 1.1 và OpenWire thông qua một cụm Apache ActiveMQ on-premises. Việc viết lại cả 40 ứng dụng để sử dụng Amazon SQS/SNS SDK không thể hoàn thành trước khi hết hạn hợp đồng thuê trung tâm dữ liệu. Chiến lược Replatform nhanh nhất và ít rủi ro nhất cho tầng nhắn tin (messaging tier) là gì?

**Đáp án đúng:** **D**

Trong đề thi SAP-C02, khi gặp yêu cầu **di chuyển nhanh (Replatform)** các hệ thống dùng **JMS, AMQP, MQTT, OpenWire, STOMP (ActiveMQ/RabbitMQ)** mà **không kịp viết lại code sang SQS/SNS**, đáp án luôn là **Amazon MQ** (chọn **Active/Standby Multi-AZ** để đảm bảo High Availability).

- **A:** Apache Kafka dùng giao thức và mô hình pub/sub log riêng, không tương thích trực tiếp với JMS 1.1 / OpenWire của ActiveMQ nên vẫn phải viết lại mã nguồn của cả 40 dịch vụ.
- **B:** EventBridge dùng JSON HTTP APIs, không hỗ trợ kết nối trực tiếp qua giao thức JMS/OpenWire.
- **C:** SQS không hỗ trợ giao thức JMS OpenWire bản địa; tự viết tầng dịch giao thức bằng Lambda cho 40 ứng dụng trong 3 tháng vừa rủi ro cao vừa không cần thiết khi đã có Amazon MQ.
- **D (Đúng):** Chính xác. Amazon MQ là dịch vụ message broker được quản lý hỗ trợ sẵn các giao thức chuẩn doanh nghiệp (JMS, OpenWire, AMQP, MQTT, STOMP) cho Apache ActiveMQ và RabbitMQ. Chuyển sang Amazon MQ (Active/Standby Multi-AZ) cho phép 40 ứng dụng kết nối lại ngay chỉ bằng cách đổi endpoint URL mà không cần viết lại code kịp tiến độ 3 tháng.

</details>

### Câu 14 `hard`

A global logistics platform relies on two event-driven backbones: (1) an Amazon EventBridge custom event bus receiving SaaS webhook events that must automatically fail over from us-east-1 to eu-west-1 within minutes if us-east-1 experiences a service disruption without changing publisher URLs; and (2) an Amazon MSK (Managed Streaming for Apache Kafka) cluster in us-east-1 that must continuously replicate topics, consumer group offsets, and metadata to a standby MSK cluster in eu-west-1 for regional disaster recovery without managing self-hosted MirrorMaker 2 EC2 fleets. Which TWO AWS capabilities should the architect implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Configure an Amazon EventBridge Global Endpoint backed by an Amazon Route 53 health check targeting primary and secondary regional event buses, with event replication enabled.
- **B.** Enable Amazon MSK Replicator between the us-east-1 and eu-west-1 MSK clusters to asynchronously replicate Kafka topics, ACLs, and consumer group offsets automatically.
- **C.** Deploy an AWS Global Accelerator with static Anycast IPs in front of the Amazon MSK ZooKeeper endpoints in us-east-1 and eu-west-1.
- **D.** Use AWS DataSync agents to copy Kafka log segments from the us-east-1 MSK brokers to eu-west-1 every 5 minutes without downtime.
- **E.** Use Amazon SQS Dead-Letter Queues to automatically fail over EventBridge SaaS webhook publisher endpoints across AWS Regions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng logistics toàn cầu dựa vào hai hệ thống xương sống hướng sự kiện: (1) một Amazon EventBridge custom event bus tiếp nhận các sự kiện SaaS webhook phải tự động chuyển đổi dự phòng từ us-east-1 sang eu-west-1 trong vòng vài phút nếu us-east-1 gặp sự cố gián đoạn dịch vụ mà không cần thay đổi URL của bên phát hành; và (2) một cụm Amazon MSK (Managed Streaming for Apache Kafka) tại us-east-1 phải liên tục sao chép các topic, consumer group offset và metadata sang một cụm MSK dự phòng tại eu-west-1 để khôi phục thảm họa khu vực mà không cần quản lý các cụm EC2 MirrorMaker 2 tự vận hành. Kiến trúc sư nên triển khai HAI khả năng AWS nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, B**

Cho khả năng chịu lỗi đa vùng (Multi-Region DR) ở tầng **Event-Driven**: sử dụng **EventBridge Global Endpoints** (kết hợp Route 53 Health Checks + Event Replication) cho EventBridge và **Amazon MSK Replicator** cho sao chép đa vùng Kafka được quản lý hoàn toàn.

- **A (Đúng):** Chính xác. Amazon EventBridge Global Endpoints cung cấp một endpoint toàn cầu duy nhất kết hợp Route 53 health check để tự động chuyển hướng sự kiện sang Region dự phòng khi Region chính gặp sự cố, đồng thời hỗ trợ event replication đồng bộ sự kiện giữa hai Region mà không cần đổi URL ở phía publisher.
- **B (Đúng):** Chính xác. Amazon MSK Replicator là tính năng được quản lý hoàn toàn giúp sao chép bất đồng bộ dữ liệu Kafka (topics, metadata, ACLs và consumer group offsets) giữa hai cụm MSK ở các Region khác nhau phục vụ DR mà không phải tự triển khai và vận hành cụm MirrorMaker 2 trên EC2.
- **C:** Global Accelerator không sao chép dữ liệu hay consumer offsets giữa hai cụm Kafka ở hai Region khác nhau.
- **D:** Bạn không có quyền truy cập trực tiếp vào hệ thống file nội bộ của broker Amazon MSK để chạy DataSync, và cách này cũng làm hỏng trạng thái topic/consumer offsets.
- **E:** SQS DLQ chỉ lưu các sự kiện xử lý lỗi tại target, không cung cấp cơ chế global endpoint hay regional failover cho EventBridge Event Bus.

</details>

### Câu 15 `hard`

An e-commerce company runs 120 microservices on Amazon EKS using EC2 Managed Node Groups scaled by Kubernetes Cluster Autoscaler. Because pods have wildly varying CPU, memory, and GPU requirements, the platform team currently maintains 18 separate Auto Scaling groups, suffers 4-minute node scale-out delays during traffic bursts, and wastes 35% of EC2 spend on underutilized nodes that Cluster Autoscaler struggles to bin-pack and consolidate. Which modernization improves scaling speed, bin-packing efficiency, and Spot/Graviton cost savings with LESS operational overhead?

- **A.** Disable Kubernetes Cluster Autoscaler and overprovision all 18 Managed Node Groups for Black Friday peak capacity year-round.
- **B.** Increase the number of EKS Managed Node Groups from 18 to 50 so every microservice has its own dedicated EC2 Auto Scaling group and custom bin-packing profile.
- **C.** Replace Cluster Autoscaler and Managed Node Groups with Karpenter NodePools (Spot/On-Demand, Graviton/x86, consolidation) to launch nodes via EC2 Fleet APIs.
- **D.** Switch all GPU-accelerated machine learning pods from EC2 Managed Node Groups to AWS Fargate for Amazon EKS.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty thương mại điện tử vận hành 120 microservice trên Amazon EKS sử dụng EC2 Managed Node Groups được mở rộng bởi Kubernetes Cluster Autoscaler. Vì các pod có yêu cầu CPU, bộ nhớ và GPU rất khác nhau, nhóm nền tảng hiện duy trì 18 Auto Scaling group riêng biệt, chịu độ trễ scale-out node 4 phút trong các đợt tăng đột biến lưu lượng và lãng phí 35% chi tiêu EC2 cho các node sử dụng dưới mức mà Cluster Autoscaler gặp khó khăn khi đóng gói (bin-pack) và hợp nhất. Giải pháp hiện đại hóa nào cải thiện tốc độ mở rộng, hiệu quả bin-packing và tiết kiệm chi phí Spot/Graviton với chi phí vận hành ÍT HƠN?

**Đáp án đúng:** **C**

Trên **Amazon EKS**, **Karpenter** vượt trội hơn Cluster Autoscaler truyền thống ở 3 điểm then chốt: (1) Khởi tạo node **siêu nhanh** bằng EC2 Fleet API không qua ASG, (2) Tự động chọn **right-sized instance (Spot/Graviton/GPU)** theo đúng yêu cầu pod, và (3) **Active Consolidation** liên tục dồn tải để cắt giảm chi phí EC2.

- **A:** Cấp phát dư thừa theo đỉnh Black Friday cả năm làm đội chi phí EC2 lên gấp nhiều lần.
- **B:** Tăng lên 50 Managed Node Groups làm tăng mạnh độ phức tạp vận hành và khiến tình trạng phân mảnh tài nguyên (lãng phí CPU/RAM dư thừa trên từng nhóm nhỏ) còn nghiêm trọng hơn.
- **C (Đúng):** Chính xác. Karpenter bỏ qua lớp Auto Scaling Group trung gian và gọi trực tiếp EC2 Fleet API để khởi chạy đúng loại instance tối ưu nhất (right-sized, hỗ trợ đa dạng Spot, Graviton ARM64, GPU) chỉ trong vài chục giây theo đúng yêu cầu của các pod đang pending, đồng thời liên tục thực hiện consolidation (dồn pod và thay thế bằng node nhỏ/rẻ hơn) giúp tiết kiệm đáng kể chi phí và xóa bỏ 18 ASG thủ công.
- **D:** AWS Fargate cho Amazon EKS hiện không hỗ trợ các pod yêu cầu GPU (GPU workloads cần chạy trên EC2 nodes với Karpenter/Managed Node Groups).

</details>

### Câu 16 `medium`

A fintech company migrated a Java 21 Spring Boot payment validation microservice to AWS Lambda behind Amazon API Gateway. While steady-state warm invocations complete in 45 ms, intermittent scale-out events suffer 5-to-7-second JVM cold starts, causing mobile app timeouts. The company wants to reduce cold-start latency by up to 90% and improve price-performance without paying continuously for idle Provisioned Concurrency instances overnight. Which optimization should the architect apply?

- **A.** Configure 200 units of AWS Lambda Provisioned Concurrency 24/7 on the published alias to keep Java 21 Spring Boot containers warm.
- **B.** Enable AWS Lambda SnapStart on published versions (and use arm64 / Graviton2) to resume from pre-initialized Firecracker microVM snapshots.
- **C.** Switch the Amazon API Gateway integration from Lambda Proxy to Amazon SQS synchronous polling to smooth out JVM cold starts.
- **D.** Lower the Lambda memory allocation from 1,024 MB to 128 MB to reduce Firecracker microVM startup overhead and speed up Spring Boot JVM initialization.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty fintech đã di chuyển một microservice xác thực thanh toán Java 21 Spring Boot lên AWS Lambda phía sau Amazon API Gateway. Trong khi các lượt gọi ấm (warm) ở trạng thái ổn định hoàn thành trong 45 ms, các sự kiện scale-out gián đoạn gặp phải tình trạng khởi động lạnh (cold start) JVM từ 5 đến 7 giây, gây timeout cho ứng dụng di động. Công ty muốn giảm độ trễ cold-start tới 90% và cải thiện tỷ lệ hiệu năng/giá thành mà không phải trả tiền liên tục cho các instance Provisioned Concurrency nhàn rỗi qua đêm. Kiến trúc sư nên áp dụng tối ưu hóa nào?

**Đáp án đúng:** **B**

Với bài toán **Java (Spring Boot/Quarkus) trên AWS Lambda bị cold start nhiều giây** nhưng muốn **tránh chi phí cố định của Provisioned Concurrency**, đáp án chuẩn xác là **AWS Lambda SnapStart** (nhớ publish **version/alias**) kết hợp **arm64 (Graviton)**.

- **A:** Bật 200 Provisioned Concurrency 24/7 vi phạm trực tiếp yêu cầu không trả tiền liên tục cho các instance nhàn rỗi vào ban đêm.
- **B (Đúng):** Chính xác. AWS Lambda SnapStart (hỗ trợ Java, Python, .NET) chụp sẵn snapshot mã hóa của bộ nhớ và trạng thái đĩa sau pha khởi tạo JVM (Init phase) khi publish version, giúp các lần cold start chỉ cần khôi phục snapshot trong vài trăm mili-giây (giảm tới 90% độ trễ) mà KHÔNG phải trả phí giữ ấm liên tục như Provisioned Concurrency. Kết hợp arm64 (Graviton2) giúp tối ưu thêm price-performance.
- **C:** SQS là hàng đợi bất đồng bộ, không thể thay thế phản hồi đồng bộ thời gian thực cho API kiểm tra thanh toán trên ứng dụng di động.
- **D:** Giảm RAM của Lambda đồng nghĩa với việc giảm tỷ lệ CPU được cấp phát, khiến thời gian khởi tạo JVM Spring Boot càng chậm hơn nhiều (thậm chí bị OutOfMemory).

</details>

### Câu 17 `medium`

A retail analytics team runs an Amazon Redshift provisioned cluster using dense-compute (dc2.8xlarge) nodes. Data volume has grown to 60 TB, forcing the team to add expensive dc2 nodes just for local SSD disk space even though CPU utilization averages only 15%. Additionally, every Monday morning from 08:00 to 10:00, hundreds of executive BI dashboards query Redshift simultaneously, causing severe query queueing. How should the architect modernize this Redshift deployment to decouple storage from compute and eliminate Monday morning queueing?

- **A.** Upgrade to additional dc2.8xlarge nodes and use an EventBridge Lambda script to manually resize the cluster every Monday morning at 07:00.
- **B.** Disable Workload Management (WLM) concurrency queues in Redshift and run all executive BI dashboard queries sequentially in a single slot.
- **C.** Migrate from dc2 nodes to Redshift RA3 (Managed Storage on S3) or Redshift Serverless, and enable Concurrency Scaling for Monday bursts.
- **D.** Migrate the 60 TB analytical data warehouse from Amazon Redshift to Amazon RDS for MySQL with 15 Read Replicas.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm phân tích bán lẻ vận hành cụm Amazon Redshift được cấp phát sử dụng các node dense-compute (dc2.8xlarge). Khối lượng dữ liệu đã tăng lên 60 TB, buộc nhóm phải thêm các node dc2 đắt tiền chỉ để lấy dung lượng đĩa SSD cục bộ mặc dù mức sử dụng CPU trung bình chỉ 15%. Ngoài ra, mỗi sáng thứ Hai từ 08:00 đến 10:00, hàng trăm bảng điều khiển BI của ban điều hành truy vấn Redshift đồng thời, gây xếp hàng truy vấn nghiêm trọng. Kiến trúc sư nên hiện đại hóa việc triển khai Redshift này như thế nào để tách rời lưu trữ khỏi compute và loại bỏ tình trạng xếp hàng vào sáng thứ Hai?

**Đáp án đúng:** **C**

Khi tối ưu **Amazon Redshift** từ dòng `dc2` cũ đang bị lãng phí compute vì thiếu ổ đĩa: chuyển sang **RA3 (Managed Storage)** hoặc **Redshift Serverless** để **tách rời Compute & Storage**, kết hợp **Concurrency Scaling** để tự động gánh các đợt đột biến truy vấn BI.

- **A:** dc2 vẫn gắn cứng compute với local SSD (không tách rời lưu trữ và tính toán), và resize thủ công mỗi tuần tốn công vận hành hơn nhiều so với RA3 + Concurrency Scaling hoặc Redshift Serverless.
- **B:** Chạy tuần tự trong một slot duy nhất sẽ làm tình trạng nghẽn hàng đợi sáng thứ Hai càng tồi tệ hơn.
- **C (Đúng):** Chính xác. Amazon Redshift RA3 (hoặc Redshift Serverless) tách rời hoàn toàn compute và storage nhờ Redshift Managed Storage (RMS trên S3), giúp bạn chỉ trả tiền cho lượng compute thực cần (không phải mua thêm node chỉ để lấy ổ đĩa SSD như dc2). Bật thêm Concurrency Scaling sẽ tự động bổ sung cụm xử lý tạm thời trong vài giây để xóa sổ hàng đợi truy vấn sáng thứ Hai (và miễn phí tới 1 giờ credit/ngày).
- **D:** RDS for MySQL là cơ sở dữ liệu OLTP lưu theo hàng (row-oriented), hoàn toàn không phù hợp cho kho dữ liệu phân tích OLAP 60 TB.

</details>

### Câu 18 `medium`

A pharmaceutical distributor operates an aging on-premises SFTP and AS2 file-exchange server used by 200 external B2B trading partners to upload nightly EDI purchase orders. The distributor wants to decommission the fragile on-premises servers and land incoming files directly into an Amazon S3 data lake (triggering downstream AWS Lambda workflows) WITHOUT forcing any of the 200 external partners to change their SFTP/AS2 client software, SSH keys, or authentication directory (currently stored in an existing Okta/custom LDAP API). Which AWS service is purpose-built for this modernization?

- **A.** AWS Transfer Family (SFTP and AS2 endpoints backed by S3) integrated with a custom Lambda Identity Provider to authenticate against the existing directory.
- **B.** AWS Storage Gateway S3 File Gateway exposed directly on the public internet with SMB and NFS endpoints for all 200 external trading partners.
- **C.** AWS DataSync agents deployed on-premises at all 200 external trading partner sites to push nightly EDI files directly to Amazon S3.
- **D.** Amazon S3 Transfer Acceleration with pre-signed HTTPS URLs replacing the legacy SFTP and AS2 endpoints for all 200 trading partners.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà phân phối dược phẩm vận hành máy chủ trao đổi tệp SFTP và AS2 on-premises cũ kỹ được 200 đối tác thương mại B2B bên ngoài sử dụng để tải lên đơn đặt hàng EDI hàng đêm. Nhà phân phối muốn ngừng hoạt động các máy chủ on-premises mong manh và đưa các tệp đến trực tiếp vào Amazon S3 data lake (kích hoạt các quy trình AWS Lambda phía sau) MÀ KHÔNG buộc bất kỳ đối tác nào trong số 200 đối tác bên ngoài phải thay đổi phần mềm SFTP/AS2 client, khóa SSH hoặc thư mục xác thực của họ (hiện lưu trong Okta/custom LDAP API). Dịch vụ AWS nào được xây dựng chuyên biệt cho quá trình hiện đại hóa này?

**Đáp án đúng:** **A**

Khi hiện đại hóa hệ thống trao đổi file B2B/EDI dùng **SFTP, FTPS, FTP hoặc AS2** lên **Amazon S3/EFS** mà giữ nguyên trải nghiệm phía đối tác (kể cả custom auth), đáp án luôn là **AWS Transfer Family**.

- **A (Đúng):** Chính xác. AWS Transfer Family là dịch vụ được quản lý hoàn toàn hỗ trợ trực tiếp giao thức SFTP, FTPS, FTP và AS2 (chuyên cho B2B EDI), lưu file thẳng vào Amazon S3/EFS, và hỗ trợ tích hợp Custom Identity Provider (Lambda/API Gateway) để giữ nguyên hoàn toàn tài khoản, SSH keys và quy trình kết nối của 200 đối tác.
- **B:** Storage Gateway File Gateway dùng giao thức SMB/NFS nội bộ, không hỗ trợ giao thức SFTP hay AS2 cho đối tác B2B qua Internet.
- **C:** AWS DataSync là công cụ di chuyển nội bộ yêu cầu cài đặt agent trong mạng đối tác — không thể bắt 200 đối tác B2B bên ngoài cài DataSync agent thay cho SFTP/AS2.
- **D:** Đổi sang HTTPS pre-signed URLs vi phạm yêu cầu không bắt 200 đối tác thay đổi phần mềm client SFTP/AS2 hiện có.

</details>

### Câu 19 `hard`

After initially lifting-and-shifting a legacy Windows Server monolithic application (written in .NET Framework 4.8) backed by Microsoft SQL Server Enterprise Edition to Amazon EC2, an enterprise wants to eliminate BOTH Windows Server OS licensing costs and Microsoft SQL Server Enterprise licensing costs as fast as possible. The engineering team wants to port the .NET codebase to cross-platform .NET 8 running on Linux containers (Amazon ECS/EKS) and migrate the database to Amazon Aurora PostgreSQL while minimizing the amount of T-SQL application query rewrites. Which TWO AWS modernization tools/features accelerate this transition? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Migrate the Microsoft SQL Server database to Amazon RDS for SQL Server Enterprise Edition with License Included to eliminate commercial licensing fees.
- **B.** Use AWS Porting Assistant for .NET to scan .NET Framework 4.8 code, identify incompatible APIs, and accelerate porting to .NET 8 on Linux.
- **C.** Use AWS Mainframe Modernization (AWS Blu Age) to automatically convert C# .NET Framework 4.8 source code into Linux-compatible COBOL.
- **D.** Run the legacy .NET Framework 4.8 ASP.NET application unmodified on Amazon Linux 2023 EC2 instances without recompiling or containerizing.
- **E.** Enable Babelfish for Aurora PostgreSQL so Aurora natively understands the SQL Server TDS protocol and T-SQL queries, reducing code rewrites.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Sau khi di chuyển nguyên trạng (lift-and-shift) ban đầu một ứng dụng nguyên khối Windows Server kế thừa (viết bằng .NET Framework 4.8) sử dụng cơ sở dữ liệu Microsoft SQL Server Enterprise Edition lên Amazon EC2, một doanh nghiệp muốn loại bỏ CẢ chi phí bản quyền hệ điều hành Windows Server lẫn chi phí bản quyền Microsoft SQL Server Enterprise nhanh nhất có thể. Đội ngũ kỹ sư muốn chuyển đổi mã nguồn .NET sang .NET 8 đa nền tảng chạy trên Linux container (Amazon ECS/EKS) và di chuyển cơ sở dữ liệu sang Amazon Aurora PostgreSQL trong khi giảm thiểu lượng viết lại truy vấn T-SQL trong ứng dụng. HAI công cụ/tính năng hiện đại hóa AWS nào thúc đẩy quá trình chuyển đổi này? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, E**

Chiến lược thoát phụ thuộc bản quyền Microsoft (Windows + SQL Server) nhanh nhất trên AWS: dùng **AWS Porting Assistant for .NET** để port `.NET Framework -> .NET on Linux` (xóa phí Windows) và **Babelfish for Aurora PostgreSQL** (hiểu trực tiếp T-SQL/TDS, xóa phí SQL Server với ít sửa code nhất).

- **A:** RDS for SQL Server Enterprise Edition (License Included) vẫn phải trả toàn bộ chi phí bản quyền SQL Server Enterprise đắt đỏ, không đáp ứng mục tiêu loại bỏ phí bản quyền Microsoft SQL Server.
- **B (Đúng):** Chính xác. AWS Porting Assistant for .NET phân tích tự động mã nguồn .NET Framework cũ, phát hiện các API/gói NuGet không tương thích và hỗ trợ chuyển đổi nhanh sang .NET (Core/.NET 8) chạy trên Linux để thoát hoàn toàn chi phí bản quyền Windows Server.
- **C:** AWS Mainframe Modernization (Blu Age) dùng cho máy chủ lớn mainframe (COBOL/PL1 sang Java), hoàn toàn không dùng cho .NET Framework sang .NET 8.
- **D:** .NET Framework 4.8 chỉ chạy được trên hệ điều hành Windows; bắt buộc phải port sang .NET (Core/.NET 6/8) mới có thể chạy trên Linux.
- **E (Đúng):** Chính xác. Babelfish for Aurora PostgreSQL cung cấp lớp phiên dịch tích hợp giúp Aurora PostgreSQL hiểu trực tiếp giao thức TDS và cú pháp T-SQL của Microsoft SQL Server, giúp ứng dụng .NET chuyển sang Aurora PostgreSQL cực nhanh mà ít phải sửa code nhất và loại bỏ hoàn toàn phí bản quyền SQL Server Enterprise.

</details>

### Câu 20 `hard`

A SaaS company operates a steady-state workload across AWS Organizations consisting of Amazon EC2 instances, AWS Fargate tasks, and AWS Lambda functions. Over the next year, the engineering team plans to migrate many EC2 workloads from Intel-based m5 instances to AWS Graviton (m7g) instances and containerize others onto Fargate. Additionally, one mission-critical database cluster on EC2 in us-east-1a requires a strict hardware capacity guarantee during regional capacity spikes. Which purchasing strategy achieves the MAXIMUM cost savings while meeting the capacity requirement?

- **A.** Purchase Compute Savings Plans for the flexible EC2, Fargate, and Lambda baseline, and combine them with On-Demand Capacity Reservations (ODCR) for the database cluster in us-east-1a.
- **B.** Use On-Demand pricing across all compute services and enable AWS Compute Optimizer to automatically apply volume discounts during regional capacity spikes.
- **C.** Purchase 1-year or 3-year EC2 Instance Savings Plans for all workloads because they automatically reserve hardware capacity in us-east-1a.
- **D.** Purchase Standard Reserved Instances for all EC2 instances and rely on EC2 Spot Instances with Capacity Rebalancing for the mission-critical database cluster in us-east-1a.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty SaaS vận hành workload ở trạng thái ổn định trên AWS Organizations bao gồm Amazon EC2 instance, tác vụ AWS Fargate và hàm AWS Lambda. Trong năm tới, đội ngũ kỹ sư dự định di chuyển nhiều workload EC2 từ các instance m5 nền tảng Intel sang instance AWS Graviton (m7g) và đóng gói container các workload khác lên Fargate. Ngoài ra, một cụm cơ sở dữ liệu quan trọng trên EC2 tại us-east-1a yêu cầu cam kết đảm bảo công suất phần cứng nghiêm ngặt trong các đợt tăng đột biến công suất khu vực. Chiến lược mua hàng nào đạt được mức tiết kiệm chi phí TỐI ĐA trong khi vẫn đáp ứng yêu cầu về công suất?

**Đáp án đúng:** **A**

Hãy nhớ rõ sự phân tách giữa **giảm giá thanh toán** và **giữ chỗ phần cứng**: **Compute Savings Plans** mang lại độ linh hoạt cao nhất (xuyên EC2 family/Graviton, Fargate, Lambda), còn **On-Demand Capacity Reservations (ODCR)** (hoặc Zonal RI) đảm bảo sẵn sàng phần cứng tại một AZ cụ thể.

- **A (Đúng):** Chính xác. Compute Savings Plans áp dụng linh hoạt cho EC2 (bất kỳ family/CPU architecture nào như m5 -> m7g), Fargate và Lambda; kết hợp với On-Demand Capacity Reservations (ODCR) cho DB ở us-east-1a để đảm bảo giữ chỗ phần cứng (và vẫn được hưởng giá giảm từ Savings Plans).
- **B:** Compute Optimizer chỉ đưa ra khuyến nghị rightsizing chứ không tự động áp dụng mức giảm giá cam kết (commitment discounts).
- **C:** Hai điểm sai: EC2 Instance Savings Plans bị khóa cứng theo 1 instance family (không linh hoạt chuyển từ m5 sang m7g hay Fargate/Lambda) và Savings Plans KHÔNG bao giờ giữ chỗ phần cứng (capacity reservation).
- **D:** Standard RI không linh hoạt khi chuyển từ m5 sang Graviton m7g hay Fargate, và dùng Spot Instances cho database mission-critical là sai lầm nghiêm trọng vì Spot có thể bị thu hồi sau 2 phút.

</details>

### Câu 21 `medium`

A logistics company processes order fulfillment events through a synchronous REST API running on Amazon ECS. During seasonal peaks, downstream inventory, billing, and notification microservices become overwhelmed, causing cascading timeouts and dropped orders. The company wants to decouple the architecture so each downstream service processes events at its own pace, only receives relevant event types, and can replay failed events from the past 7 days if a bug is discovered. Which TWO architectural changes should be implemented? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Enable Amazon EventBridge Archive and Replay on the event bus with a 7-day retention period, and target Amazon SQS queues in front of each downstream microservice.
- **B.** Publish order events to a custom Amazon EventBridge event bus with content-based filtering rules routing to each microservice.
- **C.** Consolidate all ECS microservices into a single large Amazon EC2 instance behind an ALB to eliminate inter-service network hops and timeouts.
- **D.** Increase the Amazon API Gateway integration timeout to 5 minutes and configure exponential backoff retry policies so synchronous REST calls wait for all downstream services.
- **E.** Configure Amazon Route 53 Weighted Routing policies with health checks to drop 50% of incoming order API traffic during seasonal peaks.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty logistics xử lý các sự kiện hoàn tất đơn hàng thông qua REST API đồng bộ chạy trên Amazon ECS. Trong các mùa cao điểm, các microservice tồn kho, thanh toán và thông báo ở phía sau bị quá tải, gây ra timeout dây chuyền và mất đơn hàng. Công ty muốn tách rời kiến trúc để mỗi dịch vụ phía sau xử lý sự kiện theo tốc độ riêng, chỉ nhận các loại sự kiện liên quan và có thể phát lại (replay) các sự kiện bị lỗi trong 7 ngày qua nếu phát hiện lỗi phần mềm. Nên triển khai HAI thay đổi kiến trúc nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, B**

**Amazon EventBridge** (Content-based Routing + Archive & Replay) kết hợp **Amazon SQS** (Queue-based Load Leveling) là mẫu kiến trúc Event-Driven Decoupling chuẩn mực giúp xóa bỏ lỗi dây chuyền và hỗ trợ xử lý lại sự kiện lịch sử khi có sự cố phần mềm.

- **A (Đúng):** Chính xác. EventBridge Archive & Replay cho phép lưu trữ và phát lại sự kiện trong 7 ngày khi phát hiện bug; kết hợp SQS queue làm buffer giúp từng microservice xử lý theo tốc độ riêng (load leveling).
- **B (Đúng):** Chính xác. Amazon EventBridge hỗ trợ định tuyến thông minh theo nội dung (content-based routing) để mỗi microservice chỉ nhận đúng loại sự kiện liên quan.
- **C:** Gom lại thành 1 EC2 tạo ra Single Point of Failure và đi ngược lại nguyên tắc mở rộng quy mô của kiến trúc phân tán.
- **D:** API Gateway có giới hạn timeout tối đa mặc định là 29 giây (không thể tăng lên 5 phút một cách tiêu chuẩn cho REST sync) và việc chờ đồng bộ vẫn gây lỗi dây chuyền.
- **E:** Cắt bỏ 50% đơn hàng của khách hàng làm mất doanh thu và không giải quyết nguyên nhân gốc rễ là kiến trúc tight-coupling.

</details>

### Câu 22 `medium`

A retail bank operates a legacy monolithic Java application on EC2 instances behind an Application Load Balancer (ALB). Management wants to modernize the application into independent microservices running on Amazon ECS Fargate and AWS Lambda without taking the system offline or risking a single big-bang cutover. Which modernization pattern should the Solutions Architect recommend?

- **A.** Implement the Strangler Fig pattern by configuring ALB path-based routing rules to incrementally shift specific API routes from the monolith to new ECS Fargate and Lambda microservices.
- **B.** Package and deploy the exact same monolithic Java WAR file into an AWS Lambda function with a 15-minute timeout to achieve serverless modernization.
- **C.** Freeze all new feature development for 12 months, rewrite the entire Java monolith onto AWS Lambda functions, and switch Route 53 DNS records in a single scheduled cutover window.
- **D.** Use AWS Application Migration Service (AWS MGN) to automatically analyze and decompose the legacy Java monolith into independent AWS Lambda functions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ngân hàng bán lẻ vận hành một ứng dụng Java nguyên khối (monolithic) kế thừa trên các EC2 instance phía sau Application Load Balancer (ALB). Ban quản lý muốn hiện đại hóa ứng dụng thành các microservice độc lập chạy trên Amazon ECS Fargate và AWS Lambda mà không làm gián đoạn hệ thống hoặc mạo hiểm chuyển đổi một lần (big-bang cutover). Solutions Architect nên đề xuất mẫu hình hiện đại hóa nào?

**Đáp án đúng:** **A**

**Strangler Fig Pattern** (dùng **ALB Path-based Routing** hoặc **API Gateway** đứng trước Monolith để chuyển hướng dần từng route sang Microservices trên ECS/EKS/Lambda) là chiến lược hiện đại hóa an toàn nhất trên AWS.

- **A (Đúng):** Chính xác. Strangler Fig Pattern sử dụng ALB (hoặc API Gateway) với Path-based Routing để tách dần từng chức năng khỏi Monolith sang Microservices mà không gây downtime và giảm thiểu rủi ro.
- **B:** Nhồi nguyên khối Monolith Java nặng vào Lambda gây lỗi cold start nghiêm trọng, chạm giới hạn kích thước/timeout và là anti-pattern.
- **C:** Đây là mô hình Big-Bang rewrite có rủi ro cực kỳ cao và trái ngược hoàn toàn với yêu cầu của ban lãnh đạo.
- **D:** AWS MGN là công cụ Lift & Shift (Rehost) máy chủ lên EC2, không có tính năng phân tách code monolith thành Lambda functions.

</details>

---

[Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md)
