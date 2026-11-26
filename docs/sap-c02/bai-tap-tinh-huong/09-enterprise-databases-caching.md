# Bài tập tình huống — Chủ đề 9: Global Databases & Caching — Aurora Global Database, DynamoDB Global Tables, ElastiCache & DAX

> Aurora Global Database (RTO < 1 phút, Write Forwarding), DynamoDB Global Tables (Active-Active), ElastiCache Redis Global Datastore & DynamoDB DAX.
> **Số câu hỏi:** 14 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A global SaaS provider uses an Amazon Aurora PostgreSQL Global Database with a primary cluster in us-east-1 and a secondary cluster in eu-central-1. The company must perform quarterly Disaster Recovery (DR) compliance drills by shifting write operations to eu-central-1 and then back to us-east-1 with zero data loss (RPO = 0) and without having to rebuild the Global Database replication topology afterward. Which procedure should the Solutions Architect use?

- **A.** Perform an Aurora Global Database Switchover (Managed Planned Failover) to eu-central-1, and execute another Switchover back to us-east-1 after the drill.
- **B.** Take a manual snapshot of the us-east-1 cluster, copy it to eu-central-1, and restore a new Aurora cluster during the drill window.
- **C.** Detach and promote the eu-central-1 secondary cluster to a standalone cluster, then re-attach us-east-1 as a new secondary cluster after the drill.
- **D.** Enable Aurora Global Database Write Forwarding on eu-central-1 and point the application write endpoint directly to eu-central-1 during the entire DR drill.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà cung cấp SaaS toàn cầu sử dụng Amazon Aurora PostgreSQL Global Database với cụm chính tại us-east-1 và cụm phụ tại eu-central-1. Công ty phải thực hiện các cuộc diễn tập tuân thủ Khôi phục Thảm họa (DR) hàng quý bằng cách chuyển các thao tác ghi sang eu-central-1 rồi chuyển ngược lại us-east-1 với mức mất dữ liệu bằng không (RPO = 0) và không phải xây dựng lại cấu trúc sao chép Global Database sau đó. Solutions Architect nên sử dụng quy trình nào?

**Đáp án đúng:** **A**

Đối với diễn tập DR định kỳ (planned drill) yêu cầu **RPO = 0** và giữ nguyên cấu trúc replication của Aurora Global Database, hãy sử dụng **Switchover (Managed Planned Failover)** thay vì Detach & Promote (chỉ dùng cho sự cố ngoài kế hoạch).

- **A (Đúng):** Chính xác. Aurora Global Database Switchover (trước đây gọi là Managed Planned Failover) tự động đồng bộ hoàn toàn dữ liệu đang truyền sang secondary cluster trước khi chuyển quyền ghi (RPO = 0) và tự động đảo chiều replication mà vẫn giữ nguyên cấu trúc Global Database.
- **B:** Copy snapshot và restore rất chậm (RTO cao), gây downtime kéo dài và phá vỡ yêu cầu giữ nguyên topology Global Database.
- **C:** Detach and promote (unplanned failover) phá vỡ cấu trúc Global Database hiện tại, có thể gây mất dữ liệu (RPO > 0 do replication bất đồng bộ) và buộc phải tạo lại secondary cluster từ đầu.
- **D:** Write Forwarding vẫn gửi các lệnh ghi về primary cluster ở us-east-1, không thực sự chuyển quyền primary sang eu-central-1 cho bài diễn tập DR.

</details>

### Câu 2 `hard`

A healthcare SaaS application operates Active-Active in us-east-1 and eu-west-1 and stores encrypted patient payloads in an Amazon DynamoDB Global Table using client-side encryption via the AWS Encryption SDK. Currently, payloads encrypted in us-east-1 require applications in eu-west-1 to make cross-Region AWS KMS Decrypt API calls to us-east-1, which increases latency and breaks regional resilience if us-east-1 becomes unreachable. How should the Solutions Architect redesign the encryption architecture with minimal application refactoring?

- **A.** Switch from client-side encryption to DynamoDB default AWS-owned server-side encryption so client payloads are automatically decrypted without KMS API calls.
- **B.** Replace the single-Region KMS key with a KMS Multi-Region Key (mrk-*), replicate it to eu-west-1, and configure the Encryption SDK to use the local replica key ARN.
- **C.** Enable AWS KMS Automatic Key Rotation on the us-east-1 key so that KMS automatically synchronizes the key material across all AWS Regions.
- **D.** Export the raw key material from the us-east-1 AWS-managed KMS key and import it manually into a new customer-managed KMS key in eu-west-1.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng SaaS chăm sóc sức khỏe hoạt động Active-Active tại us-east-1 và eu-west-1 và lưu trữ payload bệnh nhân đã mã hóa trong Amazon DynamoDB Global Table bằng mã hóa phía client thông qua AWS Encryption SDK. Hiện tại, các payload được mã hóa tại us-east-1 yêu cầu các ứng dụng tại eu-west-1 thực hiện các lệnh gọi AWS KMS Decrypt API liên Region về us-east-1, làm tăng độ trễ và phá vỡ khả năng phục hồi khu vực nếu us-east-1 không thể truy cập. Solutions Architect nên thiết kế lại kiến trúc mã hóa như thế nào với mức tái cấu trúc ứng dụng tối thiểu?

**Đáp án đúng:** **B**

**AWS KMS Multi-Region Keys (`mrk-*`)** là giải pháp chuẩn cho kiến trúc Active-Active đa vùng dùng client-side encryption (AWS Encryption SDK, DynamoDB Encryption Client), cho phép mã hóa ở một Region và giải mã cục bộ ở Region khác mà không cần gọi mạng xuyên Region.

- **A:** Chuyển sang server-side encryption bỏ qua yêu cầu client-side encryption (mã hóa payload trước khi gửi lên DynamoDB) và không giải quyết bài toán giải mã payload đã mã hóa ở tầng ứng dụng.
- **B (Đúng):** Chính xác. AWS KMS Multi-Region Keys chia sẻ cùng một Key ID và cùng key material giữa primary key và các replica keys ở các Region khác. Nhờ đó, dữ liệu mã hóa bằng primary key ở us-east-1 có thể được giải mã cục bộ tại eu-west-1 mà không cần gọi API KMS xuyên Region, đảm bảo hiệu năng và khả năng chịu lỗi vùng.
- **C:** Automatic Key Rotation chỉ xoay vòng key material theo chu kỳ cho khóa đó trong cùng một Region, không sao chép khóa sang Region khác.
- **D:** AWS KMS không bao giờ cho phép export key material từ các khóa do KMS tạo ra.

</details>

### Câu 3 `hard`

A serverless order-processing platform uses AWS Lambda functions inside a VPC to read and write to an Amazon Aurora PostgreSQL Multi-AZ cluster. During flash sales, Lambda scales rapidly to 2,000 concurrent executions, causing the database to reject new connections with 'too many clients already' errors and high CPU spikes from TCP/TLS connection handshakes. Additionally, during unplanned database failovers, Lambda functions experience 45-second outages while waiting for DNS caches to expire. Which solution resolves BOTH issues with minimal code changes?

- **A.** Deploy Amazon RDS Proxy in front of the Aurora PostgreSQL cluster, configure Lambda functions to connect to the RDS Proxy endpoint, and enforce IAM database authentication.
- **B.** Set Lambda Reserved Concurrency to 50 and configure SQS dead-letter queues so the Aurora PostgreSQL database never receives more than 50 simultaneous connections.
- **C.** Vertically scale the Aurora PostgreSQL writer instance to the largest available db.r6g instance class and increase the max_connections database parameter.
- **D.** Place an Amazon ElastiCache for Redis cluster in front of Aurora PostgreSQL to absorb and pool all write and read connection bursts from Lambda.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng xử lý đơn hàng serverless sử dụng các hàm AWS Lambda bên trong VPC để đọc và ghi vào cụm Amazon Aurora PostgreSQL Multi-AZ. Trong các đợt flash sale, Lambda mở rộng nhanh chóng lên 2.000 lượt thực thi đồng thời, khiến cơ sở dữ liệu từ chối kết nối mới với lỗi 'too many clients already' và CPU tăng vọt do các bắt tay kết nối TCP/TLS. Ngoài ra, trong các sự cố failover cơ sở dữ liệu ngoài ý muốn, các hàm Lambda bị gián đoạn 45 giây trong khi chờ bộ nhớ đệm DNS hết hạn. Giải pháp nào khắc phục CẢ HAI vấn đề với mức thay đổi mã nguồn tối thiểu?

**Đáp án đúng:** **A**

**Amazon RDS Proxy** là mảnh ghép kiến trúc bắt buộc khi kết nối **AWS Lambda** (scale đột ngột) với **RDS/Aurora**: vừa giải quyết triệt để bài toán cạn kiệt kết nối (connection pooling/multiplexing), vừa tăng tốc độ phục hồi khi DB failover.

- **A (Đúng):** Chính xác. Amazon RDS Proxy thực hiện connection pooling và multiplexing giúp hàng nghìn Lambda tái sử dụng một lượng nhỏ kết nối DB thực tế (tránh cạn max_connections và giảm tải CPU cho TLS handshake), đồng thời tự động chuyển hướng sang writer mới khi failover mà giữ nguyên kết nối ứng dụng, giảm thời gian gián đoạn failover tới 66%.
- **B:** Giới hạn Reserved Concurrency xuống 50 sẽ gây throttling hàng loạt đơn hàng trong đợt flash sale, ảnh hưởng nghiêm trọng đến trải nghiệm khách hàng.
- **C:** Tăng kích thước instance và max_connections rất tốn kém, vẫn chịu tải nặng từ hàng nghìn TLS handshakes khi Lambda scale đột ngột, và không rút ngắn thời gian failover (vẫn phụ thuộc DNS propagation).
- **D:** ElastiCache chỉ giảm tải cho các truy vấn đọc (read caching), không giải quyết vấn đề cạn kiệt kết nối ghi (write connections) hay thời gian failover của Aurora PostgreSQL.

</details>

### Câu 4 `medium`

An insurance company runs a customer claims portal in us-east-1 using Amazon ECS on EC2 and an Amazon Aurora MySQL cluster. Management requires a Disaster Recovery (DR) architecture in us-west-2 that achieves an RPO of less than 1 minute and an RTO of less than 10 minutes, while keeping standby infrastructure costs significantly lower than a full Active-Active deployment. Which DR strategy best meets these objectives?

- **A.** Warm Standby: use Aurora Global Database with a small reader in us-west-2, run scaled-down ECS services continuously, and scale out ECS and promote Aurora on failover.
- **B.** Backup and Restore: copy automated Aurora snapshots to us-west-2 every hour and deploy ECS infrastructure using CloudFormation templates only after a disaster is declared.
- **C.** Multi-Site Active-Active: run 100% full production ECS and Aurora capacity in both us-east-1 and us-west-2 simultaneously with Route 53 weighted routing.
- **D.** Pilot Light: replicate data via Aurora Global Database, keep all ECS services and EC2 instances scaled to zero in us-west-2, and provision compute manually during a regional disaster.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty bảo hiểm vận hành cổng thông tin yêu cầu bồi thường của khách hàng tại us-east-1 sử dụng Amazon ECS trên EC2 và cụm Amazon Aurora MySQL. Ban quản lý yêu cầu kiến trúc Khôi phục Thảm họa (DR) tại us-west-2 đạt RPO dưới 1 phút và RTO dưới 10 phút, đồng thời giữ chi phí hạ tầng dự phòng thấp hơn đáng kể so với triển khai Active-Active toàn phần. Chiến lược DR nào đáp ứng tốt nhất các mục tiêu này?

**Đáp án đúng:** **A**

So sánh 4 chiến lược DR của AWS: **Backup & Restore** (RPO/RTO giờ), **Pilot Light** (RPO phút, RTO chục phút, compute tắt), **Warm Standby** (RPO giây/phút, RTO vài phút, compute chạy thu nhỏ), **Active-Active** (RPO/RTO gần 0, chi phí cao nhất). Với RPO < 1 phút, RTO < 10 phút và tối ưu chi phí, **Warm Standby** là lựa chọn chính xác.

- **A (Đúng):** Chính xác. Chiến lược Warm Standby giữ dữ liệu đồng bộ liên tục với độ trễ < 1 giây (Aurora Global Database, đạt RPO < 1 phút) và chạy sẵn phiên bản thu nhỏ của ứng dụng ECS tại us-west-2 để có thể nhận traffic ngay và scale out trong vài phút (đạt RTO < 10 phút) với chi phí thấp hơn nhiều so với Multi-Site Active-Active.
- **B:** Backup and Restore có RPO hàng giờ và RTO vài giờ (do phải restore DB snapshot và dựng hạ tầng), không đáp ứng RPO < 1 phút và RTO < 10 phút.
- **C:** Multi-Site Active-Active có chi phí cao nhất, vi phạm yêu cầu tối ưu chi phí hơn hẳn Active-Active.
- **D:** Pilot Light tắt hoàn toàn tầng compute nên thời gian khởi chạy EC2/ECS, kéo image và warm-up thường vượt quá RTO < 10 phút (hoặc khó đảm bảo dưới 10 phút khi kết hợp thao tác thủ công).

</details>

### Câu 5 `hard`

A global banking application uses Amazon DynamoDB Global Tables in an Active-Active architecture across us-east-1, eu-west-1, and ap-northeast-1. Compliance requires client-side field-level encryption of customer account numbers using the AWS Encryption SDK before writing items to DynamoDB. Any Region must be able to decrypt records encrypted in another Region with minimal latency and without making cross-Region AWS KMS API calls during decryption. Which KMS key architecture should be used?

- **A.** Store an AES-256 symmetric key in AWS Secrets Manager and replicate the secret to all three Regions, then have the application download the raw key directly into memory.
- **B.** Create a single-Region KMS key in us-east-1 and grant IAM roles in eu-west-1 and ap-northeast-1 permission to call kms:Decrypt across Regions over VPC Peering.
- **C.** Create three independent single-Region KMS keys and enable DynamoDB server-side encryption with customer managed keys for local decryption.
- **D.** Create a KMS Multi-Region primary key in us-east-1 and replicate it to eu-west-1 and ap-northeast-1 so all three Regions share key material locally.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng ngân hàng toàn cầu sử dụng Amazon DynamoDB Global Tables theo kiến trúc Active-Active trên us-east-1, eu-west-1 và ap-northeast-1. Quy định tuân thủ yêu cầu mã hóa cấp trường phía client đối với số tài khoản khách hàng bằng AWS Encryption SDK trước khi ghi mục vào DynamoDB. Bất kỳ Region nào cũng phải có thể giải mã các bản ghi được mã hóa ở Region khác với độ trễ tối thiểu và không thực hiện các lệnh gọi AWS KMS API liên Region trong quá trình giải mã. Nên sử dụng kiến trúc khóa KMS nào?

**Đáp án đúng:** **D**

**AWS KMS Multi-Region Keys (MRK)** được sinh ra đúng cho bài toán **Active-Active Multi-Region** (như DynamoDB Global Tables + Client-Side Encryption): cùng Key ID và Key Material ở mọi Region giúp **encrypt tại Region A và decrypt cục bộ tại Region B** với độ trễ cực thấp và khả năng chịu lỗi độc lập từng Region.

- **A:** Lưu khóa mã hóa thô trong Secrets Manager và tải trực tiếp về bộ nhớ ứng dụng làm giảm mức độ bảo mật (khóa rời khỏi HSM, thiếu audit trail và key rotation chuẩn HSM của KMS) và không tận dụng chuẩn AWS Encryption SDK với KMS MRK.
- **B:** Gọi API kms:Decrypt xuyên Region từ Tokyo hay Ireland về us-east-1 vi phạm yêu cầu không thực hiện cross-Region KMS API call, làm tăng độ trễ và tạo điểm lỗi đơn (SPOF) nếu us-east-1 gặp sự cố.
- **C:** Đề bài yêu cầu client-side field-level encryption (bằng AWS Encryption SDK), không phải server-side encryption của DynamoDB. Ngoài ra 3 khóa độc lập không có cùng key material nên không giải mã chéo cho nhau được.
- **D (Đúng):** Chính xác. AWS KMS Multi-Region Keys (MRK) tạo ra các khóa có chung Key ID và cùng key material ở nhiều Region khác nhau. Dữ liệu mã hóa bằng khóa ở us-east-1 có thể được giải mã cục bộ tại eu-west-1 hoặc ap-northeast-1 mà không cần gọi API KMS xuyên Region.

</details>

### Câu 6 `hard`

A global payments company operates an Amazon Aurora PostgreSQL Global Database with its primary cluster in us-east-1 and a secondary cluster in eu-west-1. Every quarter, the company performs a scheduled regional rotation to verify disaster recovery readiness, and compliance strictly requires ZERO data loss (RPO = 0) and preserving the Global Database replication topology after the switch so us-east-1 automatically becomes the new secondary cluster. Which Aurora Global Database operation should the DBA team execute?

- **A.** Enable Aurora Write Forwarding on eu-west-1 and stop all instances in us-east-1.
- **B.** Take a manual snapshot of the us-east-1 cluster, copy it to eu-west-1, and restore a new cluster.
- **C.** Execute the Detach and Promote operation on the eu-west-1 secondary cluster.
- **D.** Perform a Managed Planned Failover (Switchover) on the Aurora Global Database.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty thanh toán toàn cầu vận hành Amazon Aurora PostgreSQL Global Database với cụm chính tại us-east-1 và cụm phụ tại eu-west-1. Mỗi quý, công ty thực hiện luân chuyển khu vực theo lịch để xác minh mức độ sẵn sàng khôi phục thảm họa, và quy định tuân thủ yêu cầu nghiêm ngặt KHÔNG mất dữ liệu (RPO = 0) và bảo toàn cấu trúc sao chép Global Database sau khi chuyển đổi để us-east-1 tự động trở thành cụm phụ mới. Nhóm DBA nên thực hiện thao tác Aurora Global Database nào?

**Đáp án đúng:** **D**

Phân biệt rõ hai thao tác của **Aurora Global Database**: **Switchover (Managed Planned Failover)** dùng cho diễn tập DR/bảo trì định kỳ (**RPO = 0**, giữ nguyên topology và tự đảo chiều replication); **Failover (Detach and Promote)** dùng cho thảm họa thực sự khi primary Region sập (**RPO < 1s**, tách cluster độc lập).

- **A:** Write Forwarding chỉ chuyển tiếp lệnh ghi từ secondary về primary; nếu tắt các instance ở us-east-1 thì hệ thống sẽ không thể ghi được nữa.
- **B:** Copy và restore snapshot mất nhiều thời gian downtime, không tận dụng tính năng chuyển đổi tích hợp của Aurora Global Database và phải dựng lại replication từ đầu.
- **C:** Detach and Promote (Failover không kế hoạch) dùng khi primary Region thực sự sập: nó tách rời secondary thành cluster độc lập (phá vỡ cấu trúc Global Database replication) và có thể mất một lượng nhỏ dữ liệu (< 1 giây replication lag).
- **D (Đúng):** Chính xác. Aurora Global Database Managed Planned Failover (Switchover) đồng bộ hoàn toàn mọi giao dịch còn lại trước khi chuyển quyền ghi sang Region đích (đạt RPO = 0, không mất dữ liệu) và tự động giữ nguyên cấu trúc Global Database bằng cách đảo chiều replication (us-east-1 tự động trở thành secondary cluster).

</details>

### Câu 7 `medium`

A retail mobile app backend consists of 30 AWS Lambda microservices querying an Amazon Aurora PostgreSQL cluster. During flash sales, Lambda concurrency scales rapidly from 50 to 4,000 invocations, causing Aurora PostgreSQL to exhaust its max_connections limit, spike CPU/memory from TLS handshake overhead, and fail transactions. Additionally, during occasional Aurora writer failovers, Lambda functions experience 40-second connection timeouts. How can the architect resolve both connection exhaustion and failover latency with minimal code changes?

- **A.** Replace Amazon Aurora PostgreSQL with Amazon ElastiCache for Redis as the primary durable transactional database for mobile orders.
- **B.** Deploy Amazon RDS Proxy in front of the Aurora PostgreSQL cluster and point the Lambda functions to it for connection pooling and fast failovers.
- **C.** Place an Application Load Balancer (ALB) in front of the Aurora PostgreSQL cluster to multiplex and distribute Lambda database connections.
- **D.** Increase max_connections in the Aurora PostgreSQL DB Cluster Parameter Group to 10,000 and enable RDS Enhanced Monitoring.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Backend của một ứng dụng di động bán lẻ bao gồm 30 microservice AWS Lambda truy vấn cụm Amazon Aurora PostgreSQL. Trong các đợt flash sale, số lượng Lambda chạy đồng thời tăng nhanh từ 50 lên 4.000 lượt gọi, khiến Aurora PostgreSQL cạn kiệt giới hạn max_connections, tăng vọt CPU/bộ nhớ do chi phí bắt tay TLS và làm lỗi giao dịch. Ngoài ra, trong các lần failover Aurora writer thỉnh thoảng xảy ra, các hàm Lambda bị timeout kết nối 40 giây. Kiến trúc sư có thể khắc phục cả tình trạng cạn kiệt kết nối và độ trễ failover với mức thay đổi mã nguồn tối thiểu bằng cách nào?

**Đáp án đúng:** **B**

Mỗi khi thấy kịch bản **AWS Lambda (hoặc kiến trúc serverless/bursty) gây cạn kiệt kết nối (`max_connections`) tới RDS/Aurora** kèm yêu cầu **giảm thời gian failover**, đáp án chuẩn xác luôn là **Amazon RDS Proxy**.

- **A:** ElastiCache là bộ nhớ đệm in-memory, không phải cơ sở dữ liệu quan hệ ACID thay thế trực tiếp cho Aurora PostgreSQL mà không phải viết lại toàn bộ hệ thống.
- **B (Đúng):** Chính xác. Amazon RDS Proxy là lớp connection pooling được quản lý hoàn toàn nằm giữa Lambda và Aurora/RDS: nó tái sử dụng các kết nối DB mở sẵn (giải quyết triệt để lỗi cạn kiệt max_connections và CPU TLS handshake khi Lambda scale đột ngột) đồng thời rút ngắn thời gian failover tới 66% bằng cách giữ phiên ứng dụng trong lúc chuyển sang writer mới.
- **C:** ALB chỉ hoạt động ở Layer 7 (HTTP/HTTPS/gRPC), không hỗ trợ giao thức TCP/PostgreSQL và không có tính năng database connection pooling.
- **D:** Tăng max_connections quá cao trên PostgreSQL sẽ làm cạn kiệt RAM của DB instance (mỗi kết nối PostgreSQL tốn nhiều MB RAM) và vẫn không giải quyết được chi phí CPU cho hàng nghìn kết nối mới hay thời gian failover.

</details>

### Câu 8 `medium`

A travel booking platform stores hotel search inventory in Amazon RDS for PostgreSQL and user session tokens in Amazon DynamoDB. Read latency on complex multi-join hotel availability SQL queries degrades to 800 ms during weekend peaks, and the engineering team wants a sub-millisecond caching layer that scales automatically without capacity planning, supports both SQL query result caching and leaderboard sorted sets, and remains highly available across multiple Availability Zones. Which caching solution should the architect select?

- **A.** Amazon CloudFront caching in front of the RDS PostgreSQL endpoint.
- **B.** Amazon DynamoDB Accelerator (DAX)
- **C.** Amazon ElastiCache for Memcached with a single-node cluster.
- **D.** Amazon ElastiCache Serverless (Valkey or Redis OSS compatible)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng đặt phòng du lịch lưu trữ danh mục tìm kiếm khách sạn trong Amazon RDS for PostgreSQL và token phiên người dùng trong Amazon DynamoDB. Độ trễ đọc trên các truy vấn SQL tìm phòng trống nhiều phép nối phức tạp giảm xuống còn 800 ms vào giờ cao điểm cuối tuần, và đội ngũ kỹ sư muốn một lớp bộ nhớ đệm dưới một mili-giây tự động mở rộng mà không cần lập kế hoạch công suất, hỗ trợ cả lưu đệm kết quả truy vấn SQL lẫn sorted set cho bảng xếp hạng, và duy trì tính sẵn sàng cao trên nhiều Availability Zone. Kiến trúc sư nên chọn giải pháp bộ nhớ đệm nào?

**Đáp án đúng:** **D**

Phân biệt nhanh 3 dịch vụ Caching trên AWS: **DAX** (chỉ cho DynamoDB API), **ElastiCache Memcached** (đơn giản, đa luồng, không có persistence/sorted sets), và **ElastiCache Serverless (Valkey/Redis)** (hỗ trợ đa dạng kiểu dữ liệu như Sorted Sets, cache kết quả RDS/SQL, tự động scale, Multi-AZ HA).

- **A:** CloudFront là HTTP CDN, không thể đặt trực tiếp trước giao thức cơ sở dữ liệu PostgreSQL hay cung cấp cấu trúc dữ liệu Sorted Sets.
- **B:** DAX là bộ nhớ đệm chuyên biệt chỉ tương thích với API của Amazon DynamoDB; nó không thể cache kết quả truy vấn SQL từ RDS PostgreSQL và không hỗ trợ cấu trúc dữ liệu sorted sets.
- **C:** Memcached không hỗ trợ kiểu dữ liệu phức tạp như Sorted Sets (leaderboards), và cụm 1 node không đạt tính sẵn sàng cao (Multi-AZ HA).
- **D (Đúng):** Chính xác. Amazon ElastiCache Serverless (tương thích Valkey/Redis) cung cấp độ trễ dưới 1ms, hỗ trợ cả cache kết quả truy vấn SQL (cache-aside) lẫn cấu trúc dữ liệu nâng cao như Sorted Sets cho bảng xếp hạng, tự động co giãn không cần lập kế hoạch dung lượng và mặc định HA đa AZ.

</details>

### Câu 9 `medium`

A high-availability e-commerce application runs on Amazon ECS in us-east-1 and eu-west-1, connecting to an Amazon Aurora Global Database. Security compliance requires rotating the database credentials every 30 days automatically with ZERO application downtime during rotation, and ensuring the rotated secret is immediately available locally in eu-west-1 in case us-east-1 becomes unavailable. Which AWS Secrets Manager design meets both requirements?

- **A.** Store DB credentials in Secrets Manager in us-east-1, enable Alternating Users automatic rotation, and replicate the secret to eu-west-1.
- **B.** Use the Single User rotation strategy in AWS Secrets Manager and have ECS tasks in eu-west-1 call the us-east-1 Secrets Manager endpoint over the internet.
- **C.** Hardcode two alternating passwords in the ECS Task Definition environment variables and redeploy every 30 days.
- **D.** Store the database password in AWS Systems Manager Parameter Store (Standard tier) because it natively supports Alternating Users automatic RDS rotation and multi-Region replication.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng thương mại điện tử tính sẵn sàng cao chạy trên Amazon ECS tại us-east-1 và eu-west-1, kết nối tới Amazon Aurora Global Database. Quy định bảo mật yêu cầu tự động xoay vòng thông tin đăng nhập cơ sở dữ liệu mỗi 30 ngày mà KHÔNG gây gián đoạn ứng dụng trong quá trình xoay vòng, đồng thời đảm bảo secret đã xoay vòng sẵn sàng ngay lập tức tại chỗ ở eu-west-1 phòng trường hợp us-east-1 không khả dụng. Thiết kế AWS Secrets Manager nào đáp ứng cả hai yêu cầu này?

**Đáp án đúng:** **A**

Ghi nhớ hai tính năng chuyên sâu của **AWS Secrets Manager** hay xuất hiện trong SAP-C02: **Alternating Users Rotation Strategy** (xoay vòng mật khẩu DB **zero-downtime** cho hệ thống tải cao) và **Multi-Region Secret Replication** (phục vụ DR đa vùng).

- **A (Đúng):** Chính xác. Chiến lược xoay vòng Alternating Users của AWS Secrets Manager sử dụng luân phiên 2 user DB (User A và User B) để đổi mật khẩu của user đang rảnh trước rồi mới chuyển dần ứng dụng sang, đảm bảo ZERO downtime cho các phiên kết nối đang chạy. Đồng thời bật Multi-Region Secret Replication sẽ tự động đồng bộ bản sao secret mới sang eu-west-1 để phục vụ DR cục bộ.
- **B:** Single User strategy có thể gây gián đoạn kết nối tạm thời cho các ứng dụng đang cache mật khẩu cũ trong lúc xoay vòng, và gọi xuyên Region về us-east-1 sẽ bị lỗi nếu us-east-1 gặp sự cố.
- **C:** Hardcode mật khẩu vào Task Definition vừa kém bảo mật vừa đòi hỏi triển khai thủ công thay vì xoay vòng tự động.
- **D:** SSM Parameter Store KHÔNG có tính năng tự động xoay vòng mật khẩu RDS tích hợp sẵn (như Alternating Users) và không có tính năng multi-Region replication bản địa như AWS Secrets Manager.

</details>

### Câu 10 `medium`

A media streaming startup runs a self-managed 12-node Apache Cassandra cluster on-premises to store user watch-history timelines using Cassandra Query Language (CQL). Managing Cassandra compaction, JVM tuning, and OS patching consumes two full-time engineers. The startup wants to migrate to a fully managed, serverless AWS database with zero cluster provisioning or patching while keeping existing CQL application code and Cassandra drivers intact. Which AWS database service should the architect select?

- **A.** Amazon ElastiCache for Redis
- **B.** Amazon Keyspaces (for Apache Cassandra)
- **C.** Amazon DynamoDB using native DynamoDB SDK APIs.
- **D.** Amazon DocumentDB (with MongoDB compatibility)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty khởi nghiệp phát trực tuyến truyền thông vận hành cụm Apache Cassandra 12 node tự quản lý on-premises để lưu trữ dòng thời gian lịch sử xem của người dùng bằng Cassandra Query Language (CQL). Việc quản lý nén dữ liệu (compaction) Cassandra, tinh chỉnh JVM và vá lỗi hệ điều hành tiêu tốn hai kỹ sư toàn thời gian. Công ty khởi nghiệp muốn di chuyển sang cơ sở dữ liệu AWS serverless được quản lý hoàn toàn, không cần cấp phát hay vá lỗi cụm trong khi vẫn giữ nguyên mã nguồn ứng dụng CQL và các driver Cassandra hiện có. Kiến trúc sư nên chọn dịch vụ cơ sở dữ liệu AWS nào?

**Đáp án đúng:** **B**

Ghi nhớ nhanh bản đồ Replatform NoSQL không cần viết lại code trên AWS: **Apache Cassandra (CQL) -> Amazon Keyspaces**; **MongoDB -> Amazon DocumentDB**; **Redis/Valkey -> ElastiCache / MemoryDB**; **Graph (Gremlin/openCypher/SPARQL) -> Amazon Neptune**.

- **A:** ElastiCache for Redis là kho key-value in-memory, không tương thích Apache Cassandra CQL.
- **B (Đúng):** Chính xác. Amazon Keyspaces (for Apache Cassandra) là dịch vụ cơ sở dữ liệu tương thích Apache Cassandra hoàn toàn serverless và được quản lý (không cần quản lý node, JVM hay compaction), cho phép ứng dụng giữ nguyên mã nguồn CQL và driver Cassandra hiện tại.
- **C:** Chuyển sang DynamoDB đòi hỏi phải viết lại toàn bộ tầng truy cập dữ liệu từ CQL/Cassandra drivers sang DynamoDB SDK APIs, vi phạm yêu cầu giữ nguyên mã nguồn CQL hiện có.
- **D:** Amazon DocumentDB tương thích với API của MongoDB, không hỗ trợ giao thức hay ngôn ngữ truy vấn CQL của Apache Cassandra.

</details>

### Câu 11 `medium`

An e-commerce company runs a globally distributed web application backed by an Amazon Aurora PostgreSQL database in us-east-1. Users in Europe experience high read latency, and the company requires a disaster recovery RPO of under 5 seconds and RTO of under 2 minutes. European application servers also occasionally perform write operations, and the engineering team wants to minimize application code changes. Which database architecture should be implemented?

- **A.** Create an Amazon RDS Cross-Region Read Replica in eu-west-1 and configure AWS DMS tasks to continuously replicate European writes back to us-east-1.
- **B.** Convert the database to an Amazon Aurora Global Database with a secondary cluster in eu-west-1 and enable Write Forwarding.
- **C.** Configure automated Amazon Aurora cluster snapshots to be copied to eu-west-1 every 5 minutes using AWS Backup and restore on failure.
- **D.** Migrate the entire PostgreSQL relational schema to Amazon DynamoDB Global Tables with multi-Region active-active writes without changing SQL queries.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty thương mại điện tử vận hành ứng dụng web phân tán toàn cầu với cơ sở dữ liệu Amazon Aurora PostgreSQL tại us-east-1. Người dùng ở châu Âu gặp độ trễ đọc cao, và công ty yêu cầu RPO khôi phục thảm họa dưới 5 giây cùng RTO dưới 2 phút. Các máy chủ ứng dụng ở châu Âu cũng thỉnh thoảng thực hiện thao tác ghi, và đội ngũ kỹ sư muốn giảm thiểu thay đổi mã nguồn ứng dụng. Nên triển khai kiến trúc cơ sở dữ liệu nào?

**Đáp án đúng:** **B**

**Amazon Aurora Global Database** kết hợp **Write Forwarding** là đáp án hoàn hảo cho bài toán Relational DB đa vùng cần đọc cục bộ cực nhanh, RPO ~1 giây, RTO < 1 phút và hạn chế sửa đổi code ứng dụng.

- **A:** RDS Read Replica chỉ hỗ trợ Read-only, không có Write Forwarding, và dùng DMS đồng bộ hai chiều gây phức tạp, dễ xung đột dữ liệu và không đạt RTO < 2 phút đáng tin cậy.
- **B (Đúng):** Chính xác. Aurora Global Database sử dụng storage-level replication với độ trễ < 1 giây (đạt RPO < 5s, RTO < 1 phút), giảm độ trễ đọc cục bộ tại châu Âu, và tính năng Write Forwarding cho phép app ở eu-west-1 ghi trực tiếp vào cluster cục bộ mà không cần sửa code tách endpoint ghi về us-east-1.
- **C:** Sao chép snapshot tốn nhiều phút đến hàng giờ để restore, hoàn toàn không đạt yêu cầu RPO < 5 giây, RTO < 2 phút và không giúp giảm độ trễ đọc cho người dùng châu Âu.
- **D:** DynamoDB là NoSQL, không tương thích với các câu lệnh SQL quan hệ của PostgreSQL nên sẽ đòi hỏi viết lại toàn bộ tầng dữ liệu ứng dụng.

</details>

### Câu 12 `hard`

A healthcare company runs an Active-Active application in us-east-1 and eu-west-1 using Amazon DynamoDB Global Tables with client-side field-level encryption. Previously, data encrypted with a regional AWS KMS key in us-east-1 required cross-region KMS API calls from eu-west-1 to decrypt, adding unacceptable latency and creating a cross-region dependency during outages. How should the Solutions Architect redesign the encryption strategy?

- **A.** Trigger an AWS Lambda function on DynamoDB Streams to decrypt and re-encrypt every replicated item using a separate regional KMS key in eu-west-1.
- **B.** Export the unencrypted data key from AWS KMS, store it in an Amazon S3 bucket replicated across both Regions, and load it into application memory at startup for local decryption.
- **C.** Create an AWS KMS Multi-Region Key (MRK) in us-east-1, replicate it to eu-west-1, and use the regional replica key locally in each Region to encrypt and decrypt data.
- **D.** Switch to AWS-managed KMS keys (alias/aws/dynamodb) because AWS automatically synchronizes their underlying key material across all AWS Regions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty chăm sóc sức khỏe chạy ứng dụng Active-Active tại us-east-1 và eu-west-1 sử dụng Amazon DynamoDB Global Tables với mã hóa cấp trường phía client. Trước đây, dữ liệu được mã hóa bằng khóa AWS KMS khu vực tại us-east-1 đòi hỏi các lệnh gọi KMS API liên khu vực từ eu-west-1 để giải mã, làm tăng độ trễ không thể chấp nhận và tạo ra sự phụ thuộc liên khu vực khi xảy ra sự cố. Solutions Architect nên thiết kế lại chiến lược mã hóa như thế nào?

**Đáp án đúng:** **C**

**AWS KMS Multi-Region Keys (MRK)** được thiết kế riêng cho các hệ thống Active-Active Multi-Region (như DynamoDB Global Tables + AWS Encryption SDK): mã hóa ở một Region và giải mã hoàn toàn cục bộ ở Region khác mà không phụ thuộc xuyên vùng.

- **A:** Giải mã và mã hóa lại mọi bản ghi qua Lambda vừa tốn chi phí, tăng độ trễ, vừa vẫn phải gọi KMS xuyên Region để giải mã bản ghi ban đầu (vẫn còn cross-region dependency).
- **B:** Lưu khóa giải mã dạng plaintext trên S3 là lỗ hổng bảo mật cực kỳ nghiêm trọng và vi phạm mọi tiêu chuẩn tuân thủ ngành y tế (HIPAA).
- **C (Đúng):** Chính xác. KMS Multi-Region Keys có cùng Key ID (`mrk-...`) và cùng key material ở cả hai Region, cho phép dữ liệu mã hóa ở us-east-1 được giải mã cục bộ tại eu-west-1 mà không cần gọi API xuyên Region và không cần mã hóa lại.
- **D:** AWS-managed keys là khóa đơn vùng (single-region) và không dùng được cho client-side field-level encryption.

</details>

### Câu 13 `medium`

A serverless e-commerce API uses Amazon API Gateway and AWS Lambda to write order records to an Amazon Aurora PostgreSQL database. During flash sales, Lambda concurrency scales rapidly to 2,000 simultaneous executions, causing the database to reject requests with 'FATAL: remaining connection slots are reserved' errors and causing slow failovers during DB maintenance. Which solution resolves BOTH issues with minimal code changes?

- **A.** Increase the max_connections parameter in the Aurora PostgreSQL DB cluster parameter group to 10,000 and double the Lambda memory allocation.
- **B.** Migrate the serverless AWS Lambda functions to Amazon EC2 instances behind an Application Load Balancer with persistent local connection pools.
- **C.** Place an Amazon ElastiCache for Redis cluster in front of Aurora PostgreSQL to buffer and cache all incoming order INSERT statements.
- **D.** Deploy Amazon RDS Proxy in front of the Aurora cluster and update the Lambda functions to connect to the RDS Proxy endpoint.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một API thương mại điện tử serverless sử dụng Amazon API Gateway và AWS Lambda để ghi các bản ghi đơn hàng vào cơ sở dữ liệu Amazon Aurora PostgreSQL. Trong các đợt flash sale, số lượng Lambda chạy đồng thời tăng nhanh lên 2.000 lượt thực thi cùng lúc, khiến cơ sở dữ liệu từ chối yêu cầu với lỗi 'FATAL: remaining connection slots are reserved' và gây chậm quá trình failover trong lúc bảo trì DB. Giải pháp nào khắc phục CẢ HAI vấn đề với mức thay đổi mã nguồn tối thiểu?

**Đáp án đúng:** **D**

**Amazon RDS Proxy** là câu trả lời chuẩn mực cho mọi kịch bản AWS Lambda gặp lỗi cạn kiệt kết nối (`Too many connections`) khi gọi RDS/Aurora và cần rút ngắn thời gian failover mà không phải sửa đổi logic ứng dụng.

- **A:** Tăng `max_connections` quá cao làm cạn kiệt RAM của DB instance gây crash (OOM) và không giúp cải thiện thời gian failover.
- **B:** Chuyển toàn bộ kiến trúc serverless sang EC2 tốn rất nhiều công sức viết lại và vận hành, không cần thiết khi đã có RDS Proxy.
- **C:** ElastiCache là read cache, không xử lý connection pooling cho lệnh ghi (INSERT) vào cơ sở dữ liệu quan hệ.
- **D (Đúng):** Chính xác. Amazon RDS Proxy thực hiện connection pooling (gộp hàng nghìn kết nối Lambda thành một lượng nhỏ kết nối ổn định tới Aurora) và giảm thời gian failover tới 66% bằng cách duy trì kết nối ứng dụng.

</details>

### Câu 14 `medium`

A financial trading application stores real-time market catalog items in Amazon DynamoDB. The workload is 95% reads and 5% writes, and the application tolerates eventually consistent reads for catalog lookups. During market open, read latency must be reduced from single-digit milliseconds to microseconds without rewriting application caching logic. What should the Solutions Architect recommend?

- **A.** Deploy Amazon DynamoDB Accelerator (DAX) in front of the DynamoDB table and update the application SDK to point to the DAX cluster endpoint.
- **B.** Deploy Amazon ElastiCache for Redis and rewrite the trading application to implement a custom cache-aside pattern with explicit TTL invalidation.
- **C.** Switch the Amazon DynamoDB table from Provisioned capacity mode to On-Demand capacity mode with standard eventually consistent reads.
- **D.** Enable DynamoDB Streams and use AWS Lambda to replicate the catalog table to an Amazon Aurora Read Replica for microsecond query latency.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng giao dịch tài chính lưu trữ các mục danh mục thị trường theo thời gian thực trong Amazon DynamoDB. Workload gồm 95% thao tác đọc và 5% thao tác ghi, và ứng dụng chấp nhận đọc nhất quán cuối cùng (eventually consistent reads) cho việc tra cứu danh mục. Trong giờ mở cửa thị trường, độ trễ đọc phải được giảm từ mức một chữ số mili-giây xuống micro-giây mà không cần viết lại logic bộ nhớ đệm của ứng dụng. Solutions Architect nên đề xuất gì?

**Đáp án đúng:** **A**

**Amazon DynamoDB Accelerator (DAX)** là lựa chọn tối ưu nhất khi đề bài nêu rõ 4 yếu tố: đang dùng **DynamoDB**, **read-heavy**, chấp nhận **eventually consistent reads**, và cần tốc độ **microseconds** với **thay đổi code tối thiểu**.

- **A (Đúng):** Chính xác. DAX là in-memory cache tương thích hoàn toàn với API của DynamoDB (không cần viết lại logic cache), giảm độ trễ đọc xuống mức microseconds, cực kỳ lý tưởng cho workload đọc nhiều (95% reads) và chấp nhận eventually consistent reads.
- **B:** ElastiCache Redis đòi hỏi phải viết lại logic cache-aside trong mã nguồn ứng dụng, vi phạm yêu cầu không viết lại logic caching.
- **C:** On-Demand mode giúp tự động mở rộng throughput nhưng không giảm độ trễ từ milliseconds xuống microseconds.
- **D:** Sao chép sang Aurora không đạt độ trễ microseconds và làm phức tạp kiến trúc một cách không cần thiết.

</details>

---

[Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md)
