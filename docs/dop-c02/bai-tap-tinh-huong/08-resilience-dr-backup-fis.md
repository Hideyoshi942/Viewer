# Bài tập tình huống — Multi-Region Disaster Recovery, AWS Backup & Chaos Engineering (FIS)

> Chiến lược DR (Backup & Restore, Pilot Light, Warm Standby, Multi-Site), Route 53 Failover, Aurora Global Database, DynamoDB Global Tables, AWS Backup và AWS FIS.
> **Số câu hỏi:** 13 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A financial services company wants to validate that its Multi-AZ microservices architecture on Amazon EKS and Amazon Aurora can survive a complete Availability Zone impairment without breaching its 1% HTTP 5xx error SLO. The chaos engineering team needs a managed AWS service to inject controlled AZ power-interruption faults and automatically halt the experiment if the 5xx error rate exceeds 1%. Which solution should the team implement?

- **A.** Write an AWS Lambda script to detach the Network ACLs in one Availability Zone and manually monitor the CloudWatch dashboard during the test.
- **B.** Use AWS Resilience Hub to inject network latency, simulate Availability Zone failures, and terminate EC2 nodes in the target Availability Zone.
- **C.** Use AWS Fault Injection Service (FIS) with an AZ Power Interruption template and attach an ALB 5xx CloudWatch Alarm as a Stop Condition.
- **D.** Use Amazon Route 53 Application Recovery Controller (ARC) zonal shift to stop all EC2 instances and RDS nodes in the Availability Zone.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty dịch vụ tài chính muốn xác thực rằng kiến trúc microservice Multi-AZ của mình trên Amazon EKS và Amazon Aurora có thể vượt qua sự cố gián đoạn hoàn toàn một Availability Zone mà không vi phạm SLO tỷ lệ lỗi HTTP 5xx dưới 1%. Nhóm chaos engineering cần một dịch vụ AWS được quản lý để tiêm lỗi ngắt nguồn AZ có kiểm soát và tự động dừng thử nghiệm nếu tỷ lệ lỗi 5xx vượt quá 1%. Nhóm nên triển khai giải pháp nào?

**Đáp án đúng:** **C**

AWS Fault Injection Service (FIS) là dịch vụ managed Chaos Engineering trên AWS, hỗ trợ mô phỏng lỗi ở mức tài nguyên lẫn mức Availability Zone kèm theo CloudWatch Alarm Stop Conditions để đảm bảo an toàn tuyệt đối (guardrails) trong môi trường kiểm thử và production.

- **A:** Sai. Viết script thủ công và giám sát bằng mắt rủi ro cao, thiếu cơ chế tự động dừng an toàn và không phải dịch vụ managed.
- **B:** Sai. AWS Resilience Hub dùng để đánh giá và khuyến nghị độ chịu lỗi (RTO/RPO assessment), còn việc thực thi chaos experiment là chức năng của AWS FIS.
- **C (Đúng):** Chính xác! AWS Fault Injection Service (FIS) cung cấp các kịch bản chaos engineering có sẵn (bao gồm AZ Power Interruption) và hỗ trợ Stop Condition tích hợp trực tiếp với CloudWatch Alarm để tự động dừng thí nghiệm và khôi phục ngay khi vượt ngưỡng SLO.
- **D:** Sai. Route 53 ARC Zonal Shift dùng để chuyển hướng traffic ra khỏi một AZ bị lỗi chứ không dùng để bơm lỗi (fault injection) hay dừng thí nghiệm bằng CloudWatch stop condition.

</details>

### Câu 2 `hard`

A healthcare enterprise must protect its Amazon EBS volumes, Amazon RDS databases, and Amazon EFS file systems against ransomware attacks and accidental deletion by compromised administrator credentials. Regulatory rules require that backups be copied to a secondary AWS Region and an isolated backup AWS account, and that NO user—including the AWS account root user—can delete or shorten the retention period of recovery points for 365 days. Which AWS Backup configuration satisfies ALL requirements?

- **A.** Configure an AWS Backup plan with cross-account and cross-Region copy actions to a vault in the isolated backup account, and enable AWS Backup Vault Lock in Governance mode with a 365-day minimum retention period.
- **B.** Attach a Backup Vault Access Policy denying backup:DeleteRecoveryPoint to all principals except the root user, and replicate snapshots via EventBridge rules.
- **C.** Enable AWS Organizations Service Control Policies (SCPs) denying backup:DeleteRecoveryPoint and backup:DeleteBackupVault across the isolated backup account.
- **D.** Configure an AWS Backup plan with cross-account/cross-Region copy to an isolated vault, and enable Backup Vault Lock in Compliance mode (365 days).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp y tế phải bảo vệ các Amazon EBS volume, cơ sở dữ liệu Amazon RDS và hệ thống tệp Amazon EFS của mình trước các cuộc tấn công ransomware và việc xóa nhầm do thông tin xác thực quản trị viên bị xâm phạm. Quy định bắt buộc các bản sao lưu phải được sao chép sang một AWS Region phụ và một tài khoản sao lưu biệt lập, đồng thời KHÔNG một người dùng nào—kể cả root user của tài khoản AWS—có thể xóa hoặc rút ngắn thời gian lưu giữ của các recovery point trong 365 ngày. Cấu hình AWS Backup nào đáp ứng TẤT CẢ các yêu cầu?

**Đáp án đúng:** **D**

Để chống ransomware và đảm bảo tuân thủ WORM (Write-Once-Read-Many) không thể bị xóa ngay cả bởi root user, cần kết hợp AWS Backup Cross-Account/Cross-Region Copy cùng với AWS Backup Vault Lock ở chế độ Compliance mode.

- **A:** Sai. Governance mode vẫn cho phép người dùng có quyền IAM đặc biệt (backup:DeleteBackupVaultLockConfiguration) gỡ bỏ khóa và xóa bản sao lưu, không đáp ứng yêu cầu chặn cả root user.
- **B:** Sai. Vault Access Policy có thể bị chỉnh sửa bởi administrator hoặc root user bị xâm nhập, không đảm bảo tính bất biến (immutability).
- **C:** Sai. SCP có thể bị gỡ bởi quản trị viên ở Management Account; chỉ có Vault Lock Compliance mode mới đảm bảo WORM bất biến tuyệt đối theo quy định kiểm toán.
- **D (Đúng):** Chính xác! AWS Backup Vault Lock ở chế độ Compliance mode (sau khi hết grace period) áp dụng mô hình WORM bất biến: không ai—kể cả root user hay AWS Support—có thể xóa recovery point hoặc rút ngắn thời gian lưu giữ trước 365 ngày.

</details>

### Câu 3 `hard`

A mission-critical SaaS application running on Amazon EKS and Amazon Aurora PostgreSQL in us-east-1 requires a Multi-Region Disaster Recovery (DR) architecture in us-west-2 with an RPO of less than 5 seconds and an RTO of less than 5 minutes. To control costs during normal operation, the secondary Region should run a scaled-down copy of the stateless application tier and a read-only database replica that can be promoted rapidly. Which TWO architectural components should the DevOps architect implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Use AWS Backup to copy nightly Aurora snapshots to us-west-2 and restore the database cluster manually during a disaster.
- **B.** Configure Aurora Global Database with a secondary cluster in us-west-2 for sub-second replication and fast regional promotion.
- **C.** Configure Amazon Route 53 Geoproximity routing with equal traffic weights across us-east-1 and us-west-2 Application Load Balancers.
- **D.** Deploy an AWS Database Migration Service (DMS) full-load replication task running hourly from us-east-1 to us-west-2.
- **E.** Configure Route 53 Failover routing with Health Checks on the us-east-1 ALB to route to us-west-2 and scale out via Auto Scaling.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng SaaS tối quan trọng chạy trên Amazon EKS và Amazon Aurora PostgreSQL tại us-east-1 yêu cầu kiến trúc Khôi phục sau thảm họa (DR) Multi-Region tại us-west-2 với RPO dưới 5 giây và RTO dưới 5 phút. Để kiểm soát chi phí trong hoạt động bình thường, Region phụ nên chạy một bản sao thu gọn của tầng ứng dụng phi trạng thái (stateless) và một bản sao cơ sở dữ liệu chỉ đọc có thể được nâng cấp (promote) nhanh chóng. Kiến trúc sư DevOps nên triển khai HAI thành phần kiến trúc nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, E**

Với yêu cầu RPO < 5 giây, RTO < 5 phút và tối ưu chi phí theo mô hình Warm Standby (Active-Passive), cặp đôi chuẩn mực là Amazon Aurora Global Database (storage-level replication < 1s, promote < 1 phút) và Route 53 Failover Routing kèm Health Checks.

- **A:** Sai. Sao lưu snapshot hàng đêm có RPO lên tới 24 giờ và thời gian restore mất hàng chục phút, hoàn toàn không đạt RPO < 5 giây và RTO < 5 phút.
- **B (Đúng):** Chính xác! Amazon Aurora Global Database sao chép ở mức storage layer xuyên Region với độ trễ thường dưới 1 giây (đáp ứng RPO < 5 giây) và có thể promote thành primary writer trong chưa đầy 1 phút (đáp ứng RTO < 5 phút).
- **C:** Sai. Đề bài yêu cầu kiến trúc Active-Passive (Warm Standby) với secondary Region chạy bản thu nhỏ và database read-only, không phải chia tải Active-Active 50/50.
- **D:** Sai. DMS full-load hàng giờ có RPO là 1 giờ và không tối ưu bằng Aurora Global Database native.
- **E (Đúng):** Chính xác! Mô hình Warm Standby kết hợp Route 53 Failover routing + Health Checks tự động chuyển hướng DNS sang us-west-2 khi us-east-1 gặp sự cố, đồng thời Auto Scaling nhanh chóng mở rộng tầng ứng dụng lên công suất đầy đủ.

</details>

### Câu 4 `medium`

A global gaming platform requires a Multi-Region Active-Active backend across us-east-1, eu-central-1, and ap-southeast-1 so players experience low-latency reads and writes in their nearest Region, and if any Region suffers a total outage, traffic seamlessly shifts to the next lowest-latency healthy Region with near-zero RTO. The backend stores player session state and leaderboard scores in a NoSQL key-value store. Which architecture meets these requirements with the LEAST operational complexity?

- **A.** Deploy an Amazon RDS Multi-AZ database in us-east-1 with cross-Region Read Replicas in eu-central-1 and ap-southeast-1, and use Route 53 Weighted Routing.
- **B.** Deploy stateless compute in all three Regions with DynamoDB Global Tables and Route 53 Latency-Based Routing with Health Checks.
- **C.** Use Amazon ElastiCache for Redis with Global Datastore across all three Regions and Route 53 Geolocation Routing without Health Checks.
- **D.** Deploy independent DynamoDB tables in each Region and write custom AWS Lambda functions triggered by DynamoDB Streams to replicate items bidirectionally.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng trò chơi toàn cầu yêu cầu một backend Multi-Region Active-Active trên us-east-1, eu-central-1 và ap-southeast-1 để người chơi có trải nghiệm đọc và ghi độ trễ thấp tại Region gần nhất, và nếu bất kỳ Region nào gặp sự cố mất hoàn toàn, lưu lượng sẽ chuyển liền mạch sang Region khỏe mạnh có độ trễ thấp tiếp theo với RTO gần như bằng 0. Backend lưu trữ trạng thái phiên của người chơi và điểm bảng xếp hạng trong một kho lưu trữ key-value NoSQL. Kiến trúc nào đáp ứng các yêu cầu này với độ phức tạp vận hành ÍT NHẤT?

**Đáp án đúng:** **B**

Kiến trúc Multi-Region Active-Active tiêu chuẩn cho ứng dụng toàn cầu sử dụng Amazon DynamoDB Global Tables (hỗ trợ ghi/đọc đồng thời tại mọi Region, giải quyết xung đột theo cơ chế last-writer-wins) kết hợp Route 53 Latency-Based Routing và Health Checks.

- **A:** Sai. RDS Read Replicas không hỗ trợ ghi cục bộ (chỉ đọc) nên không đáp ứng yêu cầu Active-Active low-latency writes ở cả 3 Region.
- **B (Đúng):** Chính xác! DynamoDB Global Tables cung cấp cơ sở dữ liệu NoSQL Multi-Region Active-Active (ghi đọc cục bộ ở cả 3 Region với độ trễ thấp, tự động đồng bộ đa chiều). Kết hợp với Route 53 Latency-Based Routing + Health Checks sẽ định tuyến người chơi tới Region gần nhất còn khỏe mạnh và tự chuyển hướng tức thì khi một Region gặp sự cố.
- **C:** Sai. ElastiCache Global Datastore chỉ có 1 Primary Region nhận lệnh ghi (Active-Passive) và thiếu Health Checks sẽ không tự chuyển hướng khi Region bị sập.
- **D:** Sai. Tự viết logic đồng bộ đa chiều bằng Streams + Lambda dễ gặp vòng lặp vô hạn, xung đột dữ liệu và tốn rất nhiều công sức vận hành so với DynamoDB Global Tables có sẵn.

</details>

### Câu 5 `medium`

A serverless order-processing platform invokes hundreds of concurrent AWS Lambda functions that connect directly to an Amazon Aurora PostgreSQL Multi-AZ cluster. During flash sales, Aurora exhausts its max_connections limit, causing Lambda invocations to fail with 'too many clients already'. Additionally, during Aurora writer failovers, application errors persist for nearly 45 seconds while DNS caches expire. What is the MOST effective solution to solve BOTH issues?

- **A.** Increase AWS Lambda reserved concurrency to 1,000 and add an exponential backoff sleep before opening each PostgreSQL connection.
- **B.** Place an Application Load Balancer in front of the Aurora PostgreSQL cluster to distribute and multiplex incoming TCP database connections.
- **C.** Deploy Amazon RDS Proxy in front of the Aurora PostgreSQL cluster and route all Lambda database connections through the RDS Proxy endpoint.
- **D.** Enable Amazon ElastiCache for Memcached in front of Aurora PostgreSQL to pool write transactions from concurrent Lambda functions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng xử lý đơn hàng serverless gọi hàng trăm AWS Lambda function đồng thời kết nối trực tiếp tới một cụm Amazon Aurora PostgreSQL Multi-AZ. Trong các đợt flash sale, Aurora cạn kiệt giới hạn max_connections, khiến các lệnh gọi Lambda thất bại với lỗi 'too many clients already'. Ngoài ra, trong quá trình failover writer của Aurora, lỗi ứng dụng kéo dài gần 45 giây trong khi DNS cache hết hạn. Giải pháp HIỆU QUẢ NHẤT để giải quyết CẢ HAI vấn đề là gì?

**Đáp án đúng:** **C**

Amazon RDS Proxy là giải pháp chuẩn khi kết nối các ứng dụng có độ mở rộng đột biến như AWS Lambda với RDS/Aurora: vừa giải quyết bài toán cạn kiệt kết nối (connection pooling), vừa giảm thiểu rõ rệt thời gian gián đoạn khi database failover.

- **A:** Sai. Tăng concurrency còn làm cạn kiệt kết nối DB nhanh hơn, và không cải thiện thời gian failover của Aurora.
- **B:** Sai. ALB hoạt động ở Layer 7 (HTTP/HTTPS), không hỗ trợ giao thức PostgreSQL TCP và không có tính năng connection pooling.
- **C (Đúng):** Chính xác! Amazon RDS Proxy cung cấp connection pooling và multiplexing hoàn toàn serverless, giúp hàng nghìn Lambda tái sử dụng kết nối mà không làm cạn kiệt max_connections của Aurora. Đồng thời, RDS Proxy tự động chuyển hướng kết nối tới writer mới khi failover, giảm thời gian gián đoạn failover lên tới 66% mà không phụ thuộc DNS cache.
- **D:** Sai. ElastiCache là tầng cache đọc dữ liệu, không phải database connection pooler cho các lệnh ghi/giao dịch PostgreSQL.

</details>

### Câu 6 `hard`

A global payments company runs an active-active multi-Region architecture across us-east-1 and us-west-2. During a severe Regional outage in us-east-1, operators need an ultra-reliable mechanism to drain traffic away from us-east-1 within seconds—even if the AWS Route 53 control plane in us-east-1 is impaired. Additionally, the mechanism must enforce a guardrail that prevents an operator from accidentally turning off traffic to BOTH Regions simultaneously. Which AWS service and feature should the DevOps architect implement?

- **A.** An AWS Lambda function in us-east-1 that calls route53:ChangeResourceRecordSets to set the weighted routing record value to 0 during an outage.
- **B.** AWS Global Accelerator endpoint group traffic dials updated manually via Terraform apply from CI/CD pipelines during the regional outage.
- **C.** Amazon Route 53 Resolver Inbound Endpoints paired with Amazon CloudWatch Alarms and cross-Region VPC peering route propagation.
- **D.** Route 53 ARC Routing Controls on a 5-Region cluster data plane with an ASSERTION safety rule keeping at least one Region ON.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty thanh toán toàn cầu vận hành kiến trúc multi-Region active-active trên us-east-1 và us-west-2. Trong một sự cố Region nghiêm trọng tại us-east-1, người vận hành cần một cơ chế cực kỳ đáng tin cậy để rút lưu lượng khỏi us-east-1 trong vài giây—ngay cả khi control plane của AWS Route 53 tại us-east-1 bị suy giảm. Ngoài ra, cơ chế này phải thực thi một hàng rào bảo vệ ngăn người vận hành vô tình tắt lưu lượng tới CẢ HAI Region cùng lúc. Kiến trúc sư DevOps nên triển khai dịch vụ và tính năng AWS nào?

**Đáp án đúng:** **D**

Route 53 Application Recovery Controller (ARC) cung cấp Routing Controls chạy trên data plane 5-Region siêu tin cậy (tránh phụ thuộc control plane khi Region gặp sự cố) và Safety Rules (ASSERTION / GATING) để bảo vệ hệ thống trước thao tác nhầm lẫn như tắt đồng thời mọi Region.

- **A:** Sai. Route 53 ChangeResourceRecordSets thuộc control plane đặt tại us-east-1; nếu us-east-1 gặp sự cố nghiêm trọng, cả Lambda lẫn Route 53 control plane API đều có thể không khả dụng.
- **B:** Sai. Cập nhật traffic dial qua control plane/Terraform chậm hơn, phụ thuộc control plane và không có sẵn safety rule chống tắt cả hai Region.
- **C:** Sai. Route 53 Resolver Inbound Endpoints chỉ dùng để phân giải DNS từ on-premises vào VPC, không dùng để điều hướng failover giữa các Region.
- **D (Đúng):** Chính xác! Route 53 ARC Routing Controls hoạt động trên data plane cực kỳ tin cậy phân tán ở 5 Region (không phụ thuộc vào Route 53 control plane ở us-east-1). Kết hợp Safety Rule (ASSERTION rule yêu cầu tối thiểu 1 routing control ở trạng thái ON) giúp ngăn tuyệt đối lỗi con người tắt cả hai Region cùng lúc.

</details>

### Câu 7 `hard`

A healthcare enterprise must retain daily backups of Amazon EBS volumes, Amazon RDS databases, and Amazon EFS file systems for 7 years to satisfy strict regulatory compliance. Security requirements dictate that once a backup is created, no user—including the AWS account root user—can delete the recovery point or shorten its retention period. Additionally, backups must be replicated to a separate isolated security account in another Region, and the team must automate monthly restore verification drills without manual scripting. Which AWS Backup architecture meets ALL requirements?

- **A.** Enable AWS Backup Vault Lock in Governance mode on the primary vault and schedule an AWS Lambda function to copy snapshots cross-Region.
- **B.** Use Amazon Data Lifecycle Manager (DLM) with an explicit IAM Deny policy on ec2:DeleteSnapshot attached to all IAM roles and users.
- **C.** Configure an AWS Backup plan with Cross-Account/Cross-Region copy, Vault Lock Compliance mode, and Restore Testing for monthly drills.
- **D.** Export all backups to Amazon S3 Glacier Deep Archive with S3 Versioning enabled and verify database restores manually each quarter.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp y tế phải lưu giữ các bản sao lưu hàng ngày của Amazon EBS volume, cơ sở dữ liệu Amazon RDS và hệ thống tệp Amazon EFS trong 7 năm để đáp ứng tuân thủ quy định nghiêm ngặt. Yêu cầu bảo mật quy định rằng một khi bản sao lưu đã được tạo, không một người dùng nào—kể cả root user của tài khoản AWS—có thể xóa recovery point hoặc rút ngắn thời gian lưu giữ của nó. Ngoài ra, các bản sao lưu phải được sao chép sang một tài khoản bảo mật biệt lập riêng biệt ở một Region khác, và nhóm phải tự động hóa các bài diễn tập xác minh khôi phục hàng tháng mà không cần viết script thủ công. Kiến trúc AWS Backup nào đáp ứng TẤT CẢ các yêu cầu?

**Đáp án đúng:** **C**

AWS Backup Vault Lock (Compliance mode) cung cấp tính bất biến WORM tuyệt đối (ngay cả root user cũng không thể xóa), kết hợp Cross-Account/Cross-Region copy để chống ransomware và AWS Backup Restore Testing để tự động hóa diễn tập khôi phục định kỳ.

- **A:** Sai. Governance mode vẫn cho phép người dùng có quyền IAM đặc biệt (như root hoặc admin) gỡ bỏ khóa và xóa backup. Cần Compliance mode để bất biến hoàn toàn kể cả với root user.
- **B:** Sai. DLM không quản lý RDS hay EFS tập trung như AWS Backup, và IAM Deny policy vẫn có thể bị root user gỡ bỏ.
- **C (Đúng):** Chính xác! AWS Backup Vault Lock ở chế độ Compliance (sau thời gian cooling-off) đảm bảo WORM bất biến không ai kể cả root user có thể xóa hay rút ngắn retention. Tính năng Cross-Account/Cross-Region Copy nhân bản sang tài khoản tách biệt, và AWS Backup Restore Testing tự động hóa hoàn toàn việc kiểm thử khôi phục định kỳ và dọn dẹp tài nguyên test.
- **D:** Sai. S3 Versioning không chống xóa bởi root user nếu không có S3 Object Lock Compliance mode, đồng thời việc export thủ công EBS/RDS/EFS và test thủ công vi phạm yêu cầu tự động hóa hàng tháng.

</details>

### Câu 8 `medium`

An SRE team wants to continuously validate the resilience of a multi-AZ e-commerce platform running on Amazon EKS, Amazon Aurora PostgreSQL, and Amazon ElastiCache. They need to run controlled chaos engineering experiments in staging—and eventually production—such as simulating an entire Availability Zone power interruption (blocking AZ network traffic, stopping EC2/EKS nodes, and triggering Aurora failover) while guaranteeing that the experiment automatically halts and reverts fault injections immediately if checkout error rates spike above 2%. Which AWS service should they use?

- **A.** AWS Systems Manager Automation scripts that randomly call ec2:TerminateInstances across subnets without CloudWatch rollback hooks.
- **B.** AWS Fault Injection Service (FIS) experiment templates (AZ Power Interruption) targeting tagged resources with a CloudWatch Alarm Stop Condition.
- **C.** Amazon CloudWatch Synthetics Canaries configured to send high-volume distributed load tests against the production Application Load Balancer endpoints.
- **D.** AWS Resilience Hub continuous assessments running alone in the operations account without any external fault injection mechanism.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm SRE muốn liên tục xác thực khả năng phục hồi của một nền tảng thương mại điện tử multi-AZ chạy trên Amazon EKS, Amazon Aurora PostgreSQL và Amazon ElastiCache. Họ cần chạy các thử nghiệm chaos engineering có kiểm soát trên staging—và sau này là production—chẳng hạn như mô phỏng sự cố ngắt nguồn toàn bộ một Availability Zone (chặn lưu lượng mạng AZ, dừng các node EC2/EKS và kích hoạt failover Aurora) đồng thời đảm bảo thử nghiệm tự động dừng và hoàn tác việc tiêm lỗi ngay lập tức nếu tỷ lệ lỗi thanh toán tăng vọt trên 2%. Họ nên sử dụng dịch vụ AWS nào?

**Đáp án đúng:** **B**

AWS Fault Injection Service (FIS) cho phép kiểm thử khả năng chịu lỗi (Chaos Engineering) có kiểm soát với các kịch bản thực tế (như AZ Power Interruption, RDS failover, network latency) đi kèm guardrail bắt buộc là Stop Conditions gắn với CloudWatch Alarms.

- **A:** Sai. Tự viết script xóa ngẫu nhiên không có cơ chế Stop Condition an toàn tức thời và không mô phỏng được đồng bộ các lỗi mạng/AZ/Aurora như FIS.
- **B (Đúng):** Chính xác! AWS Fault Injection Service (FIS) là dịch vụ chaos engineering quản lý hoàn toàn của AWS, có sẵn các kịch bản phức hợp như AZ Power Interruption (mô phỏng mất điện toàn bộ 1 AZ cho EC2/EKS/RDS/ElastiCache/subnet), và hỗ trợ Stop Conditions liên kết trực tiếp với CloudWatch Alarms để tự động dừng ngay khi vượt ngưỡng lỗi.
- **C:** Sai. Synthetics Canaries dùng để giám sát uptime/hành trình người dùng, không phải công cụ inject lỗi hạ tầng (chaos engineering).
- **D:** Sai. AWS Resilience Hub giúp đánh giá kiến trúc và đề xuất/tích hợp với FIS, nhưng bản thân việc tiêm lỗi (fault injection) và dừng khẩn cấp phải do AWS FIS thực thi.

</details>

### Câu 9 `hard`

A company operates an internal-facing mission-critical API in two Regions (us-east-1 primary, us-west-2 secondary) behind internal Application Load Balancers inside private VPCs with no public internet exposure. The team wants Amazon Route 53 DNS Failover to automatically shift traffic to us-west-2 if EITHER the primary internal ALB has zero healthy targets OR the primary Amazon Aurora cluster enters an impaired state. Because Route 53 health checkers operate from the public internet and cannot reach private VPC endpoints directly, how should the DevOps architect implement this?

- **A.** Expose the internal Application Load Balancer to the public internet with a restrictive WAF ACL solely so Route 53 HTTP health checkers can probe it.
- **B.** Configure Route 53 Endpoint Health Checks pointing directly to the private RFC 1918 IP addresses of the internal Application Load Balancer.
- **C.** Use Amazon Route 53 Geolocation routing policies across both Regions without attaching any Route 53 Health Checks.
- **D.** Back Route 53 health checks with CloudWatch alarms (ALB HealthyHostCount, Aurora), combine in a Calculated Health Check, and attach to primary.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty vận hành một API tối quan trọng hướng nội bộ trên hai Region (us-east-1 chính, us-west-2 phụ) phía sau các Application Load Balancer nội bộ bên trong các private VPC không tiếp xúc internet công cộng. Nhóm muốn Amazon Route 53 DNS Failover tự động chuyển lưu lượng sang us-west-2 nếu HOẶC ALB nội bộ chính có không target nào khỏe mạnh HOẶC cụm Amazon Aurora chính rơi vào trạng thái suy giảm. Vì các bộ kiểm tra sức khỏe của Route 53 hoạt động từ internet công cộng và không thể tiếp cận trực tiếp các endpoint VPC riêng tư, kiến trúc sư DevOps nên triển khai việc này như thế nào?

**Đáp án đúng:** **D**

Để làm Route 53 Failover cho tài nguyên private trong VPC (không mở public), hãy tạo Route 53 Health Check theo dõi trạng thái CloudWatch Alarm, và dùng Calculated Health Check để gộp nhiều tín hiệu sức khỏe (ALB + DB) thành một quyết định failover duy nhất.

- **A:** Sai. Mở tài nguyên nội bộ ra public internet vi phạm nghiêm trọng yêu cầu bảo mật (no public internet exposure).
- **B:** Sai. Route 53 health checkers nằm trên mạng công cộng toàn cầu của AWS nên không thể truy cập trực tiếp địa chỉ IP private (RFC 1918) bên trong VPC.
- **C:** Sai. Geolocation routing không tự động failover khi một Region gặp sự cố nếu không gắn Health Check.
- **D (Đúng):** Chính xác! Route 53 Health Check dựa trên CloudWatch Alarm là giải pháp chuẩn để kiểm tra sức khỏe tài nguyên nằm trong private VPC (không cần mở public endpoint). Kết hợp nhiều health check con bằng Route 53 Calculated Health Check (yêu cầu tất cả 2/2 khỏe mạnh) cho phép failover chính xác khi ALB hoặc Aurora gặp sự cố.

</details>

### Câu 10 `medium`

A global banking application requires a relational PostgreSQL database with a Recovery Point Objective (RPO) of under 5 seconds and a Recovery Time Objective (RTO) of under 2 minutes across two AWS Regions (eu-central-1 and eu-west-1). In addition, during quarterly DR compliance drills, the team must switch the primary writer role to eu-west-1 and back to eu-central-1 with ZERO data loss and without rebuilding the cross-Region replication topology. Which database architecture meets these requirements?

- **A.** Amazon Aurora Global Database (PostgreSQL) with storage replication (<1s RPO), Switchover for planned drills, and Failover for disasters.
- **B.** Amazon RDS for PostgreSQL with automated nightly DB snapshots copied cross-Region to eu-west-1 via AWS Backup.
- **C.** Amazon RDS for PostgreSQL Multi-AZ DB Cluster deployed across three Availability Zones inside eu-central-1 only.
- **D.** Self-managed PostgreSQL on EC2 with logical replication using AWS Database Migration Service (DMS) and manual cutover scripts.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng ngân hàng toàn cầu yêu cầu một cơ sở dữ liệu quan hệ PostgreSQL với Mục tiêu Điểm khôi phục (RPO) dưới 5 giây và Mục tiêu Thời gian khôi phục (RTO) dưới 2 phút trên hai AWS Region (eu-central-1 và eu-west-1). Ngoài ra, trong các đợt diễn tập tuân thủ DR hàng quý, nhóm phải chuyển đổi vai trò writer chính sang eu-west-1 và quay lại eu-central-1 với MẤT MÁT DỮ LIỆU BẰNG KHÔNG (zero data loss) và không cần xây dựng lại cấu trúc sao chép cross-Region. Kiến trúc cơ sở dữ liệu nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **A**

Amazon Aurora Global Database là lựa chọn hàng đầu cho cơ sở dữ liệu quan hệ Multi-Region yêu cầu RPO ~1 giây và RTO ~1 phút, với tính năng Switchover (RPO=0, giữ nguyên topology) cho diễn tập DR và Failover cho sự cố bất ngờ.

- **A (Đúng):** Chính xác! Amazon Aurora Global Database nhân bản ở tầng lưu trữ với độ trễ thường dưới 1 giây (đáp ứng RPO < 5s) và thời gian promote dưới 1 phút (RTO < 2 phút). Tính năng Switchover (managed planned failover) đảm bảo đồng bộ 100% không mất dữ liệu (RPO=0) và giữ nguyên cấu trúc global cluster cho các buổi diễn tập DR hàng quý.
- **B:** Sai. Copy snapshot hàng đêm có RPO lên tới 24 giờ và RTO khôi phục từ snapshot mất hàng chục phút đến hàng giờ.
- **C:** Sai. Multi-AZ chỉ bảo vệ trong phạm vi một Region (eu-central-1), không đáp ứng yêu cầu DR liên Region (cross-Region).
- **D:** Sai. Tự quản lý PostgreSQL + DMS có độ phức tạp vận hành cao, khó đạt RTO < 2 phút và không hỗ trợ switchover giữ nguyên topology gọn nhẹ như Aurora Global Database.

</details>

### Câu 11 `medium`

A mobile gaming company needs a user session and leaderboard datastore that supports low-latency local reads and writes simultaneously in us-east-1, eu-west-1, and ap-northeast-1 (active-active). Traffic spikes unpredictably by 50x whenever a new game event launches. Additionally, the team must be able to recover the table to any specific second within the last 30 days in case a buggy release corrupts player scores. Which architecture requires the LEAST operational overhead?

- **A.** Deploy Amazon DynamoDB in us-east-1 with Provisioned capacity and DAX caching clusters in eu-west-1 and ap-northeast-1.
- **B.** Configure Amazon DynamoDB Global Tables across all three Regions with On-Demand capacity mode and PITR enabled.
- **C.** Deploy Amazon Aurora Global Database across the three Regions with write forwarding enabled on secondary clusters.
- **D.** Use Amazon ElastiCache for Redis Global Datastore across all three Regions with automated daily S3 RDB snapshots.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty trò chơi di động cần một kho dữ liệu phiên người dùng và bảng xếp hạng hỗ trợ đọc và ghi cục bộ độ trễ thấp đồng thời tại us-east-1, eu-west-1 và ap-northeast-1 (active-active). Lưu lượng tăng đột biến khó lường gấp 50 lần bất cứ khi nào một sự kiện trò chơi mới ra mắt. Ngoài ra, nhóm phải có khả năng khôi phục bảng về bất kỳ giây cụ thể nào trong 30 ngày qua phòng trường hợp một bản phát hành bị lỗi làm hỏng điểm số người chơi. Kiến trúc nào đòi hỏi ÍT nỗ lực vận hành nhất?

**Đáp án đúng:** **B**

Amazon DynamoDB Global Tables (active-active multi-Region) + On-Demand capacity (tải đột biến không đoán trước) + PITR (khôi phục theo từng giây tới 35 ngày) là bộ ba chuẩn cho workload toàn cầu độ trễ thấp, ít vận hành.

- **A:** Sai. DAX chỉ hoạt động trong cùng VPC/Region với bảng DynamoDB, không hỗ trợ ghi cục bộ ở 3 Region (active-active) và Provisioned capacity khó theo kịp đột biến 50x tức thời.
- **B (Đúng):** Chính xác! DynamoDB Global Tables cung cấp kiến trúc Multi-Region Active-Active (đọc/ghi cục bộ độ trễ thấp ở cả 3 Region), On-Demand capacity tự động đáp ứng đột biến tải 50x không cần tính toán trước RCU/WCU, và PITR cho phép khôi phục về bất kỳ giây nào trong vòng 35 ngày gần nhất.
- **C:** Sai. Aurora Global Database chỉ có 1 Region ghi chính (single-writer, dù có write forwarding vẫn phải chuyển tiếp lệnh ghi qua WAN về primary Region), không phải active-active local write tại cả 3 Region như DynamoDB Global Tables.
- **D:** Sai. ElastiCache Global Datastore chỉ ghi ở 1 primary Region (không active-active write) và snapshot hàng ngày không cho phép khôi phục về bất kỳ giây nào (PITR).

</details>

### Câu 12 `hard`

A financial services company runs a mission-critical API across two AWS Regions (us-east-1 and us-west-2) backed by Amazon Aurora Global Database. Institutional clients whitelist static IP addresses on their corporate firewalls and require automatic failover to the secondary Region in under 30 seconds without being impacted by client-side DNS TTL caching. Which networking service should the architect place in front of the regional Application Load Balancers?

- **A.** Amazon Route 53 with a Failover routing policy and a 60-second TTL.
- **B.** Amazon CloudFront with Origin Failover configured between the two Application Load Balancers.
- **C.** AWS Global Accelerator with endpoint groups in both Regions and continuous health checks.
- **D.** AWS Transit Gateway inter-Region peering routing all client traffic through a single Elastic IP in us-east-1.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty dịch vụ tài chính vận hành một API tối quan trọng trên hai AWS Region (us-east-1 và us-west-2) được hỗ trợ bởi Amazon Aurora Global Database. Các khách hàng tổ chức whitelist các địa chỉ IP tĩnh trên tường lửa doanh nghiệp của họ và yêu cầu failover tự động sang Region phụ trong dưới 30 giây mà không bị ảnh hưởng bởi việc cache DNS TTL phía client. Kiến trúc sư nên đặt dịch vụ mạng nào phía trước các Application Load Balancer theo vùng?

**Đáp án đúng:** **C**

Khi bài toán yêu cầu đồng thời: (1) Static Anycast IP để firewall whitelist, (2) Failover Multi-Region siêu nhanh (< 30 giây) và (3) Không phụ thuộc DNS TTL caching, đáp án chuẩn luôn là AWS Global Accelerator.

- **A:** Sai. Route 53 dựa trên DNS nên vẫn bị ảnh hưởng bởi client/ISP DNS TTL caching, đồng thời không cung cấp IP tĩnh cho ALB.
- **B:** Sai. CloudFront không cung cấp 2 static Anycast IP cố định đơn giản để corporate firewall whitelist như Global Accelerator.
- **C (Đúng):** Chính xác! AWS Global Accelerator cung cấp 2 địa chỉ IP tĩnh Anycast (đáp ứng yêu cầu whitelist firewall) và tự động định tuyến lại traffic sang Region khỏe mạnh trong dưới 30 giây mà không bị ảnh hưởng bởi DNS TTL cache.
- **D:** Sai. Đặt Elastic IP duy nhất ở us-east-1 tạo ra Single Point of Failure nếu toàn bộ Region us-east-1 gặp sự cố.

</details>

### Câu 13 `medium`

A DevOps team wants to validate that their production-like staging environment can automatically recover from an Availability Zone failure and an Amazon RDS primary failover without exceeding a 1% HTTP 5xx error rate. If the error rate exceeds 1% during the test, the fault injection must immediately halt and restore normal operations. What is the BEST approach?

- **A.** Use AWS Fault Injection Service (FIS) templates targeting EC2/RDS/AZ actions with a 1% HTTP 5xx CloudWatch Alarm Stop Condition.
- **B.** Write a bash script in CodeBuild to randomly terminate EC2 instances and reboot RDS instances, then review CloudWatch Logs manually after 30 minutes.
- **C.** Use AWS Resilience Hub to inject network latency, simulate Availability Zone blackouts, and terminate EC2 instances automatically during business hours.
- **D.** Enable Amazon Route 53 Application Recovery Controller Readiness Checks and zonal shift policies to simulate automated RDS failovers.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm DevOps muốn xác thực rằng môi trường staging giống production của họ có thể tự động phục hồi sau sự cố Availability Zone và failover node chính của Amazon RDS mà không vượt quá tỷ lệ lỗi HTTP 5xx là 1%. Nếu tỷ lệ lỗi vượt quá 1% trong quá trình kiểm thử, quá trình tiêm lỗi (fault injection) phải dừng ngay lập tức và khôi phục hoạt động bình thường. Cách tiếp cận TỐT NHẤT là gì?

**Đáp án đúng:** **A**

AWS Fault Injection Service (FIS) là dịch vụ Chaos Engineering được quản lý trên AWS, luôn đi kèm Stop Conditions (CloudWatch Alarms) để đảm bảo blast radius được kiểm soát an toàn.

- **A (Đúng):** Chính xác! AWS Fault Injection Service (FIS) hỗ trợ các kịch bản Chaos Engineering có kiểm soát (kể cả RDS failover, AZ disruption) và sử dụng CloudWatch Alarm làm Stop Condition để tự động dừng thí nghiệm ngay khi vượt ngưỡng lỗi 1%.
- **B:** Sai. Script tự viết thiếu cơ chế Stop Condition tự động theo thời gian thực và rủi ro gây gián đoạn kéo dài.
- **C:** Sai. AWS Resilience Hub dùng để đánh giá cấu hình, ước tính RTO/RPO và đề xuất cải thiện/tích hợp với FIS, chứ bản thân nó không trực tiếp tiêm lỗi thay FIS.
- **D:** Sai. ARC Readiness Check kiểm tra sự sẵn sàng về quota/capacity giữa các Region, không thực hiện chaos testing hay tiêm lỗi.

</details>

---

[Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md)
