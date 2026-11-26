# Bài tập tình huống — Chủ đề 12: Enterprise Observability, Audit & Automated Remediation — CloudWatch Cross-Account, X-Ray, Config, Security Hub & SSM

> CloudWatch Cross-Account Observability, AWS X-Ray, Organization CloudTrail, Config Aggregator, Security Hub và Auto-Remediation qua EventBridge + SSM.
> **Số câu hỏi:** 8 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A FinOps team enabled AWS Compute Optimizer at the AWS Organizations level across 60 accounts to rightsize over-provisioned Amazon EC2 instances. After two weeks, the Solutions Architect reviews the Compute Optimizer dashboard and notices that recommendations only consider CPU and network utilization, leading to suggestions that could cause Out-Of-Memory (OOM) crashes on memory-intensive Java applications. How should the Solutions Architect improve the accuracy of Compute Optimizer recommendations across all accounts?

- **A.** Upgrade to AWS Enterprise Support across the AWS Organizations Management account so Compute Optimizer unlocks memory-aware EC2 rightsizing recommendations automatically for Java.
- **B.** Install and configure the Amazon CloudWatch Agent on the EC2 instances (using Systems Manager Distributor/State Manager) to push memory utilization metrics to CloudWatch.
- **C.** Enable AWS Trusted Advisor Organizational View across all 60 accounts because Trusted Advisor natively inspects guest OS memory utilization without requiring agents.
- **D.** Enable Detailed Monitoring (1-minute granularity) on all EC2 instances across all 60 accounts so CloudWatch automatically collects OS-level memory utilization metrics.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm FinOps đã bật AWS Compute Optimizer ở cấp AWS Organizations trên 60 account để điều chỉnh kích thước các Amazon EC2 instance được cấp phát dư thừa. Sau hai tuần, Solutions Architect xem xét bảng điều khiển Compute Optimizer và nhận thấy các khuyến nghị chỉ xem xét mức sử dụng CPU và mạng, dẫn đến các đề xuất có thể gây ra lỗi Out-Of-Memory (OOM) trên các ứng dụng Java ngốn bộ nhớ. Solutions Architect nên cải thiện độ chính xác của các khuyến nghị Compute Optimizer trên tất cả các account bằng cách nào?

**Đáp án đúng:** **B**

Mặc định EC2 không gửi chỉ số RAM lên CloudWatch. Để **AWS Compute Optimizer** đưa ra khuyến nghị rightsizing chính xác và tránh lỗi OOM cho ứng dụng tốn RAM, cần triển khai **CloudWatch Agent** (tự động hóa qua Systems Manager) để đẩy memory metrics lên CloudWatch.

- **A:** Gói Enterprise Support không tự động cung cấp guest OS memory metrics cho Compute Optimizer nếu không cài CloudWatch Agent.
- **B (Đúng):** Chính xác. AWS Compute Optimizer tự động nhận diện và đưa chỉ số RAM vào thuật toán khuyến nghị rightsizing nếu Amazon CloudWatch Agent (hoặc một số APM bên thứ ba được hỗ trợ) đang thu thập và gửi memory metrics (như mem_used_percent) lên CloudWatch.
- **C:** Trusted Advisor cũng chỉ dựa vào hypervisor metrics mặc định (CPU, Network) và không thể đọc RAM bên trong guest OS nếu không có agent.
- **D:** Detailed Monitoring chỉ tăng tần suất thu thập các hypervisor metrics (CPU, Disk, Network) từ 5 phút xuống 1 phút; AWS hypervisor không thể thấy memory utilization bên trong hệ điều hành.

</details>

### Câu 2 `hard`

A global financial trading application stores compliance audit documents in Amazon S3 buckets in us-east-1 and eu-central-1. Regulatory rules require that 99.99% of newly uploaded objects be replicated to the secondary Region within 15 minutes with CloudWatch replication metrics and SLA backing. Furthermore, the application must access S3 through a single global endpoint that automatically routes requests to the lowest-latency active Region and allows operators to manually shift traffic away from an impaired Region within 2 minutes without changing application code. Which TWO Amazon S3 features should the Solutions Architect configure? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Enable S3 Cross-Region Replication (CRR) with S3 Replication Time Control (S3 RTC) and S3 Replication Metrics enabled between the two buckets.
- **B.** Configure S3 Same-Region Replication (SRR) with CloudWatch metrics because CRR cannot replicate objects within a 15-minute SLA window.
- **C.** Enable S3 Transfer Acceleration on both buckets and hardcode both regional bucket URLs into the application's client-side retry logic.
- **D.** Use S3 Batch Replication scheduled every 60 minutes via Amazon EventBridge rules to synchronize newly uploaded compliance audit documents.
- **E.** Configure an Amazon S3 Multi-Region Access Point (MRAP) spanning both buckets and use MRAP Failover Controls to shift active/passive routing status during a regional impairment.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng giao dịch tài chính toàn cầu lưu trữ tài liệu kiểm toán tuân thủ trong các Amazon S3 bucket tại us-east-1 và eu-central-1. Quy định pháp luật yêu cầu 99,99% các object mới tải lên phải được sao chép sang Region phụ trong vòng 15 phút với các chỉ số sao chép CloudWatch và cam kết SLA. Hơn nữa, ứng dụng phải truy cập S3 thông qua một điểm cuối toàn cầu duy nhất tự động định tuyến yêu cầu tới Region hoạt động có độ trễ thấp nhất và cho phép người vận hành chuyển lưu lượng thủ công khỏi một Region gặp sự cố trong vòng 2 phút mà không cần sửa đổi mã nguồn ứng dụng. Solutions Architect nên cấu hình HAI tính năng Amazon S3 nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, E**

Kiến trúc Multi-Region S3 cấp doanh nghiệp gồm 2 mảnh ghép: **S3 CRR + S3 Replication Time Control (RTC)** (đảm bảo SLA sao chép 99.99% trong 15 phút) và **S3 Multi-Region Access Points (MRAP) + Failover Controls** (một global endpoint duy nhất, tự động định tuyến độ trễ thấp và failover dưới 2 phút).

- **A (Đúng):** Chính xác. S3 Replication Time Control (S3 RTC) là tính năng duy nhất cung cấp cam kết SLA sao chép 99.99% object trong vòng 15 phút kèm CloudWatch metrics theo dõi độ trễ replication.
- **B:** SRR chỉ sao chép trong cùng một AWS Region, không thể sao chép giữa us-east-1 và eu-central-1.
- **C:** S3 Transfer Acceleration chỉ tăng tốc upload qua CloudFront Edge, không cung cấp một global endpoint chung có Failover Controls và không đảm bảo SLA replication 15 phút.
- **D:** S3 Batch Replication dùng để đồng bộ dữ liệu cũ đã tồn tại từ trước (existing objects), không phải sao chép liên tục đạt SLA 15 phút cho object mới.
- **E (Đúng):** Chính xác. S3 Multi-Region Access Point (MRAP) cung cấp một global endpoint duy nhất (chạy trên AWS Global Accelerator) tự động định tuyến tới bucket gần nhất đang Active, và hỗ trợ Failover Controls cho phép chuyển trạng thái Active/Passive trong vòng chưa tới 2 phút mà không cần sửa code ứng dụng.

</details>

### Câu 3 `hard`

An IoT telemetry platform writes 15,000 sensor events per second into an Amazon DynamoDB table configured with Provisioned Capacity and Auto Scaling. Engineers observe severe ProvisionedThroughputExceededException throttling errors even though CloudWatch shows total consumed WCU is only 35% of the provisioned capacity. Investigation reveals the table's partition key is event_date (YYYY-MM-DD) and the sort key is device_id. How should the Solutions Architect resolve the throttling and optimize performance?

- **A.** Switch the DynamoDB table from Provisioned capacity mode to On-Demand capacity mode without changing the existing event_date partition key.
- **B.** Deploy an Amazon DynamoDB Accelerator (DAX) cluster in front of the DynamoDB table to buffer and batch all 15,000 incoming IoT sensor writes per second.
- **C.** Use a high-cardinality partition key like device_id (or event_date with a 0-19 write-sharding suffix) to distribute writes evenly, and add a GSI for date queries.
- **D.** Triple the table's provisioned WCU and set Auto Scaling target utilization to 20% because DynamoDB Auto Scaling reacts too slowly to steady 15,000 writes/sec bursts.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng đo từ xa IoT ghi 15.000 sự kiện cảm biến mỗi giây vào một bảng Amazon DynamoDB được cấu hình Provisioned Capacity và Auto Scaling. Các kỹ sư quan sát thấy lỗi điều tiết ProvisionedThroughputExceededException nghiêm trọng mặc dù CloudWatch cho thấy tổng WCU tiêu thụ chỉ bằng 35% công suất đã cấp phát. Điều tra cho thấy partition key của bảng là event_date (YYYY-MM-DD) và sort key là device_id. Solutions Architect nên khắc phục tình trạng điều tiết và tối ưu hiệu năng như thế nào?

**Đáp án đúng:** **C**

Dấu hiệu kinh điển của **DynamoDB Hot Partition**: bị `ProvisionedThroughputExceededException` dù tổng WCU tiêu thụ của bảng rất thấp (< 40%). Nguyên nhân là partition key có độ phân tán thấp (như `date`), vượt trần **1,000 WCU/partition**. Giải pháp bắt buộc là thiết kế lại partition key có high cardinality hoặc dùng **Write Sharding**.

- **A:** Ngay cả ở chế độ On-Demand, giới hạn cứng 1,000 WCU trên mỗi partition key đơn lẻ vẫn áp dụng; vì vậy vẫn bị throttling nếu không sửa hot partition key.
- **B:** DAX hoạt động theo cơ chế write-through (ghi thẳng xuống DynamoDB ngay lập tức), không dùng để làm buffer giảm tải ghi hay giải quyết hot partition.
- **C (Đúng):** Chính xác. Dùng ngày (`event_date`) làm partition key khiến 100% traffic ghi trong ngày đổ vào đúng 1 partition (hot partition, vượt trần 1,000 WCU/partition). Chuyển sang partition key có độ phân tán cao (`device_id` hoặc kỹ thuật write sharding ghép hậu tố ngẫu nhiên `YYYY-MM-DD#0..19`) sẽ phân bổ đều tải ghi ra nhiều partition vật lý.
- **D:** Mỗi partition vật lý của DynamoDB có giới hạn cứng tối đa 1,000 WCU (và 3,000 RCU). Dù tăng tổng WCU của bảng lên gấp 3, tất cả 15,000 ghi/giây của ngày hôm nay vẫn đổ dồn vào DUY NHẤT 1 partition key (`event_date` hôm nay) gây hot partition.

</details>

### Câu 4 `medium`

A microservices e-commerce application spans Amazon API Gateway, AWS Lambda, Amazon ECS Fargate, Amazon SQS, and Amazon DynamoDB. Customers report intermittent 4-second checkout latency spikes, but CloudWatch CPU and memory metrics for all services look normal. The engineering team needs end-to-end distributed request tracing with a visual service map to pinpoint which downstream microservice or DynamoDB call is introducing the latency, along with the ability to query structured JSON application logs across all services. Which observability solution should the Solutions Architect implement?

- **A.** Enable VPC Flow Logs and AWS CloudTrail Data Events for all microservices and DynamoDB tables, then inspect latency metrics in Amazon Athena.
- **B.** Enable AWS X-Ray active tracing across API Gateway, Lambda, and ECS with header propagation, and use CloudWatch Logs Insights to query logs by Trace ID.
- **C.** Enable Amazon CloudWatch Detailed Monitoring on all ECS Fargate tasks and configure a CloudWatch Synthetics Canary to trace checkout requests.
- **D.** Turn on AWS Config continuous recording and Amazon Inspector scans to track latency changes between Amazon DynamoDB and ECS Fargate.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng thương mại điện tử microservice trải dài trên Amazon API Gateway, AWS Lambda, Amazon ECS Fargate, Amazon SQS và Amazon DynamoDB. Khách hàng báo cáo các đợt tăng độ trễ thanh toán 4 giây gián đoạn, nhưng các chỉ số CPU và bộ nhớ CloudWatch cho tất cả dịch vụ đều bình thường. Đội ngũ kỹ sư cần theo dõi yêu cầu phân tán đầu cuối với bản đồ dịch vụ trực quan để xác định chính xác microservice phía sau hoặc lệnh gọi DynamoDB nào đang gây ra độ trễ, cùng với khả năng truy vấn nhật ký ứng dụng JSON có cấu trúc trên tất cả các dịch vụ. Solutions Architect nên triển khai giải pháp khả năng quan sát (observability) nào?

**Đáp án đúng:** **B**

Để tìm nút thắt độ trễ (latency bottleneck) trong kiến trúc microservices phân tán, hãy triển khai **AWS X-Ray / AWS Distro for OpenTelemetry (ADOT)** để dựng **Service Map** phân tích trace đầu cuối, kết hợp **CloudWatch Logs Insights** để truy vấn log JSON theo Trace ID.

- **A:** VPC Flow Logs chỉ ghi metadata gói tin IP (chấp nhận/từ chối), còn CloudTrail chỉ ghi API audit logs — cả hai không đo được độ trễ nội bộ ở tầng ứng dụng hay tạo distributed trace map.
- **B (Đúng):** Chính xác. AWS X-Ray (kết hợp OpenTelemetry/X-Ray SDK) thu thập và nối chuỗi Trace ID xuyên suốt API Gateway -> Lambda -> ECS -> SQS -> DynamoDB, tạo ra Service Map trực quan chỉ ra chính xác thành phần gây độ trễ 4 giây; kết hợp CloudWatch Logs Insights để truy vấn nhanh log JSON theo Trace ID.
- **C:** Detailed Monitoring chỉ tăng độ mịn của các chỉ số hạ tầng (CPU/RAM), còn Synthetics Canary chỉ kiểm tra từ bên ngoài (black-box) chứ không soi được nút thắt bên trong chuỗi microservices.
- **D:** AWS Config dùng để theo dõi thay đổi cấu hình tài nguyên AWS, không dùng để đo độ trễ ứng dụng hay distributed tracing.

</details>

### Câu 5 `medium`

A healthcare enterprise wants continuous threat detection across 90 AWS accounts for anomalous IAM API activity, suspicious EKS runtime behavior, malicious S3 object uploads (malware scanning), and compromised RDS login attempts. All security findings must be aggregated in a dedicated Security Tooling account, and any High-severity finding indicating a compromised EC2 instance must automatically trigger an isolated quarantine workflow (replacing Security Groups and taking an EBS forensic snapshot) within 60 seconds. Which architecture should be deployed?

- **A.** Deploy Amazon Inspector across all 90 accounts to perform real-time threat detection on CloudTrail API logs, S3 uploads, and RDS login attempts, triggering automated quarantine.
- **B.** Export all CloudTrail, VPC Flow Logs, and EKS audit logs to Amazon S3 and run a daily Amazon Athena SQL query to alert the SOC team.
- **C.** Enable Amazon Macie across all 90 member accounts to continuously detect anomalous EKS runtime behavior, malware uploads, and compromised RDS logins.
- **D.** Set Security Tooling as GuardDuty Delegated Admin with EKS Runtime, S3 Malware, and RDS Protection, routing High findings via EventBridge to Step Functions quarantine.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp y tế muốn phát hiện mối đe dọa liên tục trên 90 AWS account đối với hoạt động IAM API bất thường, hành vi runtime EKS đáng ngờ, tải lên S3 object độc hại (quét mã độc) và các nỗ lực đăng nhập RDS bị xâm nhập. Tất cả phát hiện bảo mật phải được tổng hợp trong một tài khoản Security Tooling chuyên dụng, và bất kỳ phát hiện mức độ High nào cho thấy một EC2 instance bị xâm nhập phải tự động kích hoạt quy trình cách ly cô lập (thay thế Security Group và chụp EBS forensic snapshot) trong vòng 60 giây. Nên triển khai kiến trúc nào?

**Đáp án đúng:** **D**

**Amazon GuardDuty** (cấu hình **Delegated Administrator** toàn Organization + bật các gói **EKS/S3 Malware/RDS Protection**) kết hợp **EventBridge -> Step Functions/Lambda** là kiến trúc phát hiện và phản ứng sự cố tự động (SOAR) chuẩn mực trên AWS.

- **A:** Amazon Inspector là công cụ quét lỗ hổng phần mềm/CVE và cấu hình mạng trên EC2, ECR, Lambda — không phải dịch vụ phát hiện mối đe dọa theo thời gian thực (threat detection) trên CloudTrail hay RDS login như GuardDuty.
- **B:** Chạy truy vấn SQL hàng ngày trên Athena không thể phát hiện và tự động cách ly máy chủ bị xâm nhập trong vòng 60 giây.
- **C:** Amazon Macie chuyên phát hiện dữ liệu nhạy cảm (PII/PHI) trong Amazon S3, không phát hiện mối đe dọa runtime trên EKS hay đăng nhập bất thường trên RDS.
- **D (Đúng):** Chính xác. Amazon GuardDuty (quản trị tập trung qua Delegated Administrator) tích hợp sẵn đầy đủ các gói bảo vệ chuyên sâu (IAM/CloudTrail, EKS Runtime Monitoring, Malware Protection for S3, RDS Protection). Kết nối sự kiện GuardDuty qua EventBridge tới Step Functions/Lambda giúp thực thi quy trình cách ly EC2 và chụp EBS snapshot pháp y tự động trong vài giây.

</details>

### Câu 6 `medium`

A FinOps director overseeing 85 AWS accounts wants to continuously identify overprovisioned EC2 instances, idle EBS volumes, underutilized Lambda functions, and suboptimal ECS Fargate task definitions using machine learning analysis of historical CPU and memory metrics. In addition, the director wants automated near-real-time email/Slack alerts whenever daily spend in any member account spikes unexpectedly due to a misconfigured Auto Scaling policy or runaway Athena query. Which combination of AWS services provides these capabilities with minimal custom engineering?

- **A.** Enable AWS Budgets with a fixed monthly threshold across all 85 accounts and manually inspect AWS Cost and Usage Reports (CUR) in Excel every quarter.
- **B.** Use Amazon GuardDuty to detect unexpected cloud spending spikes and AWS Systems Manager Patch Manager to automatically rightsize EC2 instances.
- **C.** Enable AWS CloudTrail Insights to generate EC2 and Lambda rightsizing recommendations.
- **D.** Enable AWS Compute Optimizer across Organizations (with CloudWatch Agent memory metrics) for rightsizing, and configure Cost Anomaly Detection with SNS/Chatbot.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một giám đốc FinOps giám sát 85 AWS account muốn liên tục xác định các EC2 instance cấp phát dư thừa, EBS volume nhàn rỗi, hàm Lambda sử dụng dưới mức và cấu hình tác vụ ECS Fargate chưa tối ưu bằng phân tích machine learning trên các chỉ số CPU và bộ nhớ lịch sử. Ngoài ra, giám đốc muốn nhận cảnh báo email/Slack tự động gần thời gian thực bất cứ khi nào chi tiêu hàng ngày ở bất kỳ member account nào tăng vọt bất ngờ do chính sách Auto Scaling cấu hình sai hoặc truy vấn Athena chạy mất kiểm soát. Sự kết hợp các dịch vụ AWS nào cung cấp các khả năng này với ít công sức kỹ thuật tùy chỉnh nhất?

**Đáp án đúng:** **D**

Bộ công cụ FinOps cốt lõi của AWS cho bài toán cải tiến liên tục: **AWS Compute Optimizer** (ML rightsizing đa tài khoản cho EC2/EBS/Lambda/ECS/RDS, nhớ cài **CloudWatch Agent** để có metric RAM) + **AWS Cost Anomaly Detection** (ML phát hiện chi phí tăng đột biến).

- **A:** AWS Budgets chỉ cảnh báo khi vượt ngưỡng cố định (không phát hiện bất thường theo ML đối với đột biến ngắn hạn) và không đưa ra khuyến nghị rightsizing chi tiết cho EC2/Lambda/ECS như Compute Optimizer.
- **B:** GuardDuty là dịch vụ phát hiện mối đe dọa bảo mật (không phải FinOps), còn SSM Patch Manager dùng để vá lỗi hệ điều hành chứ không phải công cụ rightsizing.
- **C:** CloudTrail Insights phát hiện bất thường về tần suất gọi API (API call rate/error rate), không phân tích mức sử dụng CPU/RAM để khuyến nghị rightsizing hay phát hiện đột biến chi phí.
- **D (Đúng):** Chính xác. AWS Compute Optimizer sử dụng Machine Learning phân tích lịch sử CPU và RAM (khi cài CloudWatch Agent) trên toàn AWS Organizations để đề xuất rightsizing cho EC2, EBS, Lambda, ECS Fargate và RDS. Kết hợp với AWS Cost Anomaly Detection sẽ tự động dùng ML phát hiện các đột biến chi phí bất thường và gửi cảnh báo ngay qua SNS/Slack (AWS Chatbot).

</details>

### Câu 7 `medium`

A retail banking platform recently completed a Multi-AZ architecture overhaul using Amazon EKS, Amazon Aurora PostgreSQL, and Application Load Balancers. Before launching to production, the SRE team must systematically inject controlled real-world faults—such as simulating an entire Availability Zone power loss, forcing an Aurora DB cluster failover, and injecting 300 ms network latency between microservices—with automated safety guardrails that immediately halt the experiment if customer 5xx error rates exceed 1%. Which AWS service should the SRE team use?

- **A.** AWS Trusted Advisor Fault Tolerance checks combined with AWS Health Dashboard notifications.
- **B.** Amazon CloudWatch Synthetics Canaries configured with CloudWatch Alarms to simulate an Availability Zone power loss.
- **C.** AWS Resilience Hub automated chaos workflows to directly terminate EKS pods and inject 300 ms network latency into production.
- **D.** AWS Fault Injection Service (AWS FIS) experiment templates configured with Amazon CloudWatch Alarm stop conditions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng ngân hàng bán lẻ gần đây đã hoàn tất nâng cấp kiến trúc Multi-AZ sử dụng Amazon EKS, Amazon Aurora PostgreSQL và Application Load Balancer. Trước khi đưa vào production, nhóm SRE phải đưa vào một cách có hệ thống các lỗi thực tế có kiểm soát—như mô phỏng mất điện toàn bộ một Availability Zone, ép buộc chuyển đổi dự phòng cụm Aurora DB và chèn độ trễ mạng 300 ms giữa các microservice—với các hàng rào an toàn tự động lập tức dừng thử nghiệm nếu tỷ lệ lỗi 5xx của khách hàng vượt quá 1%. Nhóm SRE nên sử dụng dịch vụ AWS nào?

**Đáp án đúng:** **D**

**AWS Fault Injection Service (AWS FIS)** là công cụ Chaos Engineering chuyên dụng của AWS để kiểm chứng thực tế khả năng chịu lỗi (AZ outage, Aurora failover, network latency) một cách an toàn nhờ **CloudWatch Alarm Stop Conditions**.

- **A:** Trusted Advisor chỉ kiểm tra cấu hình tĩnh (ví dụ kiểm tra có bật Multi-AZ hay không), không thực hiện tiêm lỗi động (chaos testing) vào hệ thống đang chạy.
- **B:** CloudWatch Synthetics Canaries chỉ chạy kịch bản giả lập người dùng cuối kiểm tra endpoint/UI từ bên ngoài, không có khả năng tiêm lỗi hạ tầng AWS (chaos engineering).
- **C:** AWS Resilience Hub dùng để đánh giá kiến trúc theo mục tiêu RTO/RPO và khuyến nghị tạo thí nghiệm AWS FIS — bản thân Resilience Hub không trực tiếp tiêm lỗi mạng hay đánh sập AZ mà tích hợp gọi AWS FIS.
- **D (Đúng):** Chính xác. AWS Fault Injection Service (AWS FIS) là dịch vụ Chaos Engineering được quản lý hoàn toàn của AWS, hỗ trợ sẵn các kịch bản tiêm lỗi thực tế (AZ Power Interruption, Aurora Failover, EKS pod/network latency injection) và tích hợp chặt chẽ với CloudWatch Alarms làm Stop Conditions để tự động dừng thí nghiệm ngay khi tỷ lệ lỗi 5xx vượt 1%.

</details>

### Câu 8 `medium`

A high-volume ad-tech platform ingests 30 TB of verbose debug and access logs per month into Amazon CloudWatch Logs (Standard log class). Engineers rarely inspect these logs in real time—they do not need Live Tail, metric filters, or real-time subscription filters on these debug log groups—and only run occasional ad-hoc CloudWatch Logs Insights queries during post-incident reviews before archiving logs older than 30 days to S3. Monthly CloudWatch Logs ingestion charges have become one of the top five AWS bill items. What is the simplest, most cost-effective optimization?

- **A.** Create log groups using CloudWatch Logs Infrequent Access (IA) (saving 50% on ingestion while keeping Logs Insights) with a 30-day retention.
- **B.** Keep the Standard log class and set log retention to Never Expire so debug and access logs are never deleted before S3 archival.
- **C.** Store all 30 TB of logs on Amazon EBS gp3 volumes attached to a single EC2 instance.
- **D.** Attach a CloudWatch Logs Subscription Filter to stream all 30 TB through AWS Lambda for gzip compression before writing back to CloudWatch Logs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng công nghệ quảng cáo lưu lượng lớn tiếp nhận 30 TB nhật ký gỡ lỗi và truy cập chi tiết mỗi tháng vào Amazon CloudWatch Logs (lớp log Standard). Các kỹ sư hiếm khi kiểm tra các nhật ký này theo thời gian thực—họ không cần Live Tail, metric filter hay subscription filter thời gian thực trên các log group gỡ lỗi này—và chỉ thỉnh thoảng chạy các truy vấn CloudWatch Logs Insights đột xuất trong các buổi rà soát sau sự cố trước khi lưu trữ các nhật ký cũ hơn 30 ngày vào S3. Chi phí tiếp nhận CloudWatch Logs hàng tháng đã trở thành một trong năm khoản mục hóa đơn AWS lớn nhất. Tối ưu hóa đơn giản nhất và hiệu quả chi phí nhất là gì?

**Đáp án đúng:** **A**

Với các log nhóm dung lượng lớn **không cần real-time Live Tail/Metric Filters** nhưng vẫn cần **truy vấn ad-hoc bằng Logs Insights**, chuyển sang **CloudWatch Logs Infrequent Access (IA) log class** cắt giảm ngay **50% chi phí ingestion** mà hầu như không phải đổi kiến trúc.

- **A (Đúng):** Chính xác. Amazon CloudWatch Logs Infrequent Access (IA) log class giảm tới 50% chi phí nạp log (ingestion cost) cho các log nhóm ít truy cập không cần Live Tail hay Metric Filters, trong khi vẫn giữ đầy đủ khả năng truy vấn ad-hoc bằng CloudWatch Logs Insights khi cần điều tra sự cố. Đặt retention 30 ngày giúp tránh tích lũy phí lưu trữ vô hạn.
- **B:** Giữ Standard log class và Never Expire không giảm chút nào chi phí ingestion (vốn chiếm tỷ trọng lớn nhất) mà còn làm phình to chi phí lưu trữ theo thời gian.
- **C:** Lưu log tập trung trên 1 EC2 + EBS không có tính sẵn sàng cao, tốn công vận hành và mất khả năng truy vấn tức thời bằng CloudWatch Logs Insights.
- **D:** Dữ liệu vẫn bị tính phí Standard ingestion lần đầu, cộng thêm chi phí Subscription Filter và Lambda xử lý 30 TB khiến hóa đơn còn cao hơn.

</details>

---

[Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md)
