# Bài tập tình huống — Chủ đề 3: Cơ sở dữ liệu quan hệ & Caching — RDS, Aurora & ElastiCache

> RDS Multi-AZ vs Read Replicas, Aurora Serverless, RDS Proxy, ElastiCache Redis vs Memcached, Lazy Loading vs Write-Through.
> **Số câu hỏi:** 10 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án & Giải thích chi tiết**.

---

### Câu 1 `medium`

A multiplayer game backend needs to maintain a real-time global top-100 player leaderboard with sub-millisecond read/write latency as millions of score updates arrive. Which AWS service and data structure is BEST suited for this use case?

- **A.** Amazon ElastiCache for Memcached using key-value pairs.
- **B.** Amazon ElastiCache for Redis using Sorted Sets (`ZADD`, `ZREVRANGE`).
- **C.** Amazon S3 Standard with `ListObjectsV2`.
- **D.** Amazon RDS PostgreSQL with `ORDER BY score DESC LIMIT 100` on every request.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

So sánh **ElastiCache Redis vs Memcached** (câu hỏi kinh điển):
- **Redis**: Hỗ trợ **Sorted Sets** (Leaderboards), Pub/Sub, Persistence (AOF/RDB), Multi-AZ Auto Failover, Read Replicas.
- **Memcached**: Multi-threaded thuần key-value cache đơn giản, không persistence, không replication.

- **A:** Sai vì Memcached chỉ là bộ nhớ đệm key-value đơn giản, không có cấu trúc dữ liệu Sorted Sets để tự động xếp hạng.
- **B (Đúng):** Đúng! **ElastiCache for Redis** hỗ trợ cấu trúc **Sorted Sets** (`ZADD`, `ZREVRANGE`, `ZRANK`) giúp tự động sắp xếp và truy vấn Top-N leaderboard với độ trễ dưới 1 mili-giây (điều mà Memcached và RDS không làm tối ưu bằng).
- **C:** Sai vì S3 là object storage độ trễ hàng chục mili-giây, không phù hợp cập nhật điểm số liên tục theo thời gian thực.
- **D:** Sai vì chạy `ORDER BY` liên tục trên hàng triệu bản ghi cập nhật tốc độ cao sẽ gây quá tải CPU DB và không đạt độ trễ sub-millisecond.

</details>

### Câu 2 `medium` *(Chọn nhiều đáp án)*

A serverless application uses hundreds of concurrent AWS Lambda functions to read and write data in an Amazon RDS for PostgreSQL database. During traffic spikes, the database throws `FATAL: remaining connection slots are reserved` errors, and read queries from the reporting dashboard slow down write transactions. Which TWO architectural improvements resolve these issues? (Choose two.)

- **A.** Create an Amazon RDS Read Replica and route the reporting dashboard's read-only queries to the Read Replica endpoint.
- **B.** Configure an Amazon DynamoDB Accelerator (DAX) cluster in front of Amazon RDS to cache SQL query results.
- **C.** Enable RDS Multi-AZ and route the reporting dashboard's read-only analytical queries to the Multi-AZ standby instance endpoint.
- **D.** Open a new database connection inside the Lambda handler on every invocation and leave it open after returning.
- **E.** Deploy Amazon RDS Proxy and configure the Lambda functions to connect through the RDS Proxy endpoint.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**, **E**

Best practices kết nối **Lambda + Amazon RDS**:
- **Amazon RDS Proxy**: Pool kết nối cho Lambda (giảm lỗi `too many connections` và giảm thời gian failover).
- **Read Replica**: Mở rộng tải **đọc** (Scalability).
- **Multi-AZ**: Tăng tính sẵn sàng **HA** (standby không đọc được).

- **A (Đúng):** Đúng! **RDS Read Replica** giúp tách tải đọc (reporting/analytics) ra khỏi Primary DB instance, giảm tranh chấp CPU/IOPS cho các giao dịch ghi.
- **B:** Sai vì DAX chỉ hoạt động với Amazon DynamoDB, không hỗ trợ Amazon RDS.
- **C:** Sai vì standby instance của **Multi-AZ** chỉ dùng cho High Availability (failover tự động), **không** cho phép kết nối đọc.
- **D:** Sai vì nếu hàng nghìn container Lambda đều tự giữ kết nối riêng trực tiếp tới RDS thì vẫn vượt quá `max_connections` của database.
- **E (Đúng):** Đúng! **Amazon RDS Proxy** duy trì một pool kết nối dùng chung tới RDS, giúp hàng nghìn Lambda concurrent instances tái sử dụng kết nối thay vì làm cạn kiệt `max_connections` của PostgreSQL.

</details>

### Câu 3 `medium`

A developer attaches an AWS Lambda function to a private VPC subnet so it can query an internal Amazon RDS database. After this change, the Lambda function successfully queries RDS, but all calls to an external third-party Stripe payment API fail with connection timeouts. What is the root cause and solution?

- **A.** Increase the Lambda function's memory from 512 MB to 3,008 MB to enable outbound public IPv4 assignment on the ENI.
- **B.** VPC-attached Lambda functions have no public IP; deploy a NAT Gateway in a public subnet and route `0.0.0.0/0` from the private subnet to it.
- **C.** Create a Gateway VPC Endpoint for the external Stripe API in the private subnet route table to allow HTTPS egress.
- **D.** Move the Lambda function into a public subnet and attach an Internet Gateway directly to the Lambda ENI for outbound Stripe payment API requests.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Bẫy thi kinh điển **AWS Lambda in VPC**:
- Lambda trong VPC **không bao giờ có Public IP**.
- Để gọi **dịch vụ ngoài AWS (Internet)**: Bắt buộc Lambda nằm ở **Private Subnet** có route `0.0.0.0/0` trỏ tới **NAT Gateway** ở Public Subnet.
- Để gọi **dịch vụ AWS nội bộ**: Dùng **VPC Endpoints** (Gateway cho S3/DynamoDB, Interface cho các dịch vụ khác).

- **A:** Sai vì tăng RAM không tạo ra kết nối Internet cho private subnet.
- **B (Đúng):** Đúng! Khi gắn Lambda vào VPC, Lambda chỉ có Private IP (ENI trong private subnet) và **không thể ra Internet trực tiếp** (kể cả khi đặt trong public subnet!). Để gọi API công khai bên ngoài (Stripe), Lambda phải đi qua **NAT Gateway** đặt ở public subnet.
- **C:** Sai vì Gateway VPC Endpoint chỉ hỗ trợ Amazon S3 và DynamoDB, không hỗ trợ dịch vụ ngoài AWS như Stripe.
- **D:** Sai vì Lambda không được cấp Public IP, nên đặt Lambda trong public subnet vẫn **không** ra được Internet qua Internet Gateway.

</details>

### Câu 4 `medium`

An application caches product catalog pages in Amazon ElastiCache for Redis. Most products are rarely updated, so the team wants to only populate the cache when a product is actually requested and misses the cache, avoiding wasted memory on unused products. However, they also want to prevent stale data from staying in the cache forever. Which caching strategy should the developer implement?

- **A.** Use DynamoDB DAX instead of ElastiCache for an Amazon RDS database.
- **B.** Lazy Loading (Cache-Aside) combined with a TTL (Time to Live) on each cached key.
- **C.** Disable Redis eviction policies and store the entire database in Redis.
- **D.** Write-Through caching to populate Redis on every write without configuring any key expiration TTL.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

So sánh 2 chiến lược **ElastiCache**:
- **Lazy Loading (Cache-Aside)**: Chỉ cache dữ liệu được đọc; không tốn RAM cho dữ liệu ít dùng; nhược điểm là cache miss đầu tiên hơi chậm và có thể stale -> khắc phục bằng **TTL**.
- **Write-Through**: Cập nhật cache ngay khi ghi DB -> dữ liệu luôn mới, nhưng tốn RAM cho dữ liệu ít đọc.

- **A:** Sai vì DAX chỉ dành cho DynamoDB.
- **B (Đúng):** Đúng! **Lazy Loading** chỉ nạp dữ liệu vào cache khi có cache miss (không lãng phí RAM cho sản phẩm ít người xem), kết hợp với **TTL** để đảm bảo dữ liệu cũ tự động hết hạn định kỳ.
- **C:** Sai vì lưu toàn bộ DB vào RAM rất tốn kém và dễ đầy bộ nhớ.
- **D:** Sai vì Write-Through đẩy mọi bản ghi được tạo/cập nhật vào cache ngay cả khi không ai đọc (gây lãng phí bộ nhớ cache).

</details>

### Câu 5 `medium`

A company runs an Amazon Aurora PostgreSQL cluster with a writer instance and two reader instances. A developer notices that a read-heavy analytics service is still hitting the writer instance even though the team created a second reader instance. Which Aurora endpoint should the analytics service connect to so read connections are automatically load-balanced across all reader instances?

- **A.** The Aurora Global Database replication endpoint.
- **B.** The Aurora Reader Endpoint (`*.cluster-ro-*.rds.amazonaws.com`)
- **C.** The individual Instance Endpoint of the writer instance.
- **D.** The Aurora Cluster Endpoint (`*.cluster-*.rds.amazonaws.com`) for read-write scaling

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Các Endpoints của **Amazon Aurora**:
- **Cluster Endpoint (`cluster-...`)**: Luôn trỏ tới **Writer** (Read/Write).
- **Reader Endpoint (`cluster-ro-...`)**: Cân bằng tải tới các **Readers** (Read-Only).
- **Custom Endpoint**: Gom nhóm một tập hợp các instance có cấu hình riêng (ví dụ 2 instance RAM lớn cho Analytics).

- **A:** Sai vì đây không phải endpoint cân bằng tải đọc trong cluster.
- **B (Đúng):** Đúng! **Aurora Reader Endpoint** (`cluster-ro`) tự động cân bằng tải kết nối (DNS round-robin) tới tất cả các Aurora Replicas (Reader instances) hiện có trong cluster.
- **C:** Sai vì Instance Endpoint trỏ cứng vào 1 instance cụ thể, không cân bằng tải và không tự chuyển khi failover.
- **D:** Sai vì Cluster Endpoint luôn trỏ duy nhất tới **Writer (Primary) instance**.

</details>

### Câu 6 `medium`

A web application runs behind an Application Load Balancer (ALB) on an Amazon EC2 Auto Scaling Group. The application needs to maintain user session state across multiple HTTP requests, even though the backend instances do not share a central session store yet. What is the quickest ALB configuration to route a user's subsequent requests to the same EC2 target, and what is the recommended long-term stateless architecture?

- **A.** Store session files on each EC2 instance's local EBS volume without Sticky Sessions.
- **B.** Enable Sticky Sessions on the Amazon Route 53 Hosted Zone so DNS always resolves users to the exact same EC2 instance IP.
- **C.** Replace the Application Load Balancer with an Amazon SQS queue to store and route HTTP user sessions.
- **D.** Enable ALB Sticky Sessions (`AWSALB` cookies) short-term, and migrate session state to ElastiCache for Redis or DynamoDB long-term.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

**ALB Sticky Sessions & Stateless Design**:
- **Sticky Sessions** bật trên **Target Group** (duration-based `AWSALB` hoặc app-based `AWSALBAPP`).
- **Best practice**: Thiết kế ứng dụng **stateless**, lưu session vào **ElastiCache** hoặc **DynamoDB**.

- **A:** Sai vì nếu không có Sticky Sessions, request tiếp theo sẽ sang EC2 khác và mất session.
- **B:** Sai vì Route 53 không có tính năng Sticky Sessions theo HTTP cookie.
- **C:** Sai vì SQS là hàng đợi bất đồng bộ, không phục vụ HTTP request/response đồng bộ cho trình duyệt.
- **D (Đúng):** Đúng! **ALB Sticky Sessions** (bật ở cấp độ **Target Group**) gắn cookie để giữ user trên cùng 1 EC2 instance, nhưng làm mất cân bằng tải khi scale in/instance hỏng; về lâu dài nên lưu session tập trung vào **ElastiCache Redis** hoặc **DynamoDB** để ứng dụng stateless.

</details>

### Câu 7 `easy`

A web application runs on an EC2 Auto Scaling Group behind an Application Load Balancer. Users report being logged out randomly whenever the Auto Scaling Group scales in or distributes requests across instances because session state is stored in local server memory. What is the BEST practice to solve this issue?

- **A.** Enable ALB Sticky Sessions so users always hit the same EC2 instance even during scale-in.
- **B.** Store session files in EC2 `/tmp` and synchronize them across instances via a cron job.
- **C.** Move session state out of EC2 memory into Amazon ElastiCache (Redis) or Amazon DynamoDB.
- **D.** Increase the EC2 instance size vertically and disable Auto Scaling in production.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Kiến trúc chuẩn cloud-native luôn giữ web tier **stateless** bằng cách đưa session ra **ElastiCache** hoặc **DynamoDB**.

- **A:** Không tối ưu vì nếu EC2 instance bị terminate khi scale-in thì session trong RAM vẫn bị mất.
- **B:** Sai, phức tạp và không đồng bộ tức thời.
- **C (Đúng):** Đúng! Lưu session tập trung vào **ElastiCache** hoặc **DynamoDB** giúp tầng EC2 hoàn toàn stateless, chịu lỗi tốt khi scale-in hoặc thay thế instance.
- **D:** Sai vì làm mất tính đàn hồi và High Availability.

</details>

### Câu 8 `medium`

A serverless application uses AWS Lambda to query an Amazon RDS PostgreSQL database. During traffic bursts, hundreds of Lambda instances spin up simultaneously and cause `FATAL: remaining connection slots are reserved` errors on PostgreSQL. How should the developer resolve this?

- **A.** Create 10 RDS Read Replicas and round-robin database connections inside the Lambda handler function on each call.
- **B.** Switch from Amazon RDS PostgreSQL to DynamoDB Streams for relational SQL queries.
- **C.** Disable Lambda VPC integration so the function connects to RDS over the public internet.
- **D.** Deploy Amazon RDS Proxy between Lambda and RDS PostgreSQL, and point Lambda to the RDS Proxy endpoint.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Combo kinh điển trên AWS: **Lambda + RDS (MySQL/PostgreSQL) + quá tải kết nối (`too many connections`)** -> **Amazon RDS Proxy**.

- **A:** Sai, tốn kém và vẫn có thể cạn connection khi scale đột biến.
- **B:** Sai vì thay đổi toàn bộ database engine không cần thiết.
- **C:** Sai vì RDS nằm trong private subnet của VPC.
- **D (Đúng):** Đúng! **Amazon RDS Proxy** quản lý connection pooling tập trung, cho phép hàng nghìn Lambda chia sẻ số lượng kết nối nhỏ tới RDS và giảm thời gian failover.

</details>

### Câu 9 `medium`

A developer stores product catalog items in Amazon ElastiCache for Redis. Whenever an item's price changes in RDS, customers still see the old price from Redis until the 15-minute TTL expires because the app only populates Redis on cache misses. How can the developer ensure prices in Redis stay immediately up-to-date while avoiding stale data?

- **A.** Switch to Amazon ElastiCache for Memcached and disable key expiration TTL completely.
- **B.** Keep Lazy Loading (Cache-Aside) and increase the Redis TTL from 15 minutes to 24 hours.
- **C.** Implement a Write-Through caching strategy (updating Redis at the same time as RDS writes) combined with a TTL.
- **D.** Replace ElastiCache for Redis with Amazon S3 Standard-IA as a low-latency session cache.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

- **Lazy Loading**: Dễ bị stale data tới khi hết TTL.
- **Write-Through**: Dữ liệu luôn mới ngay sau khi ghi DB.

- **A:** Sai vì tắt TTL càng làm dữ liệu cũ tồn tại vĩnh viễn nếu dùng Lazy Loading.
- **B:** Sai vì tăng TTL làm dữ liệu cũ tồn tại lâu hơn.
- **C (Đúng):** Đúng! **Write-Through** cập nhật cache ngay khi ghi DB nên không bị dữ liệu cũ (stale data), kết hợp **TTL** giúp giải phóng dữ liệu ít dùng.
- **D:** Sai vì S3 không phải in-memory cache.

</details>

### Câu 10 `medium`

An application caches user profile records in Amazon ElastiCache for Redis. The engineering team wants the cache to contain ONLY data that has actually been requested by users, and can tolerate a slight latency penalty on the very first request for a user profile (cache miss). However, to prevent stale data, cached entries must automatically expire after 15 minutes. Which caching strategy should be implemented?

- **A.** Flush the entire Redis cluster every 15 minutes using the `FLUSHALL` command.
- **B.** Lazy Loading (Cache-Aside) combined with a Time-to-Live (TTL) of 900 seconds on each key.
- **C.** Use Write-Through caching to populate Redis on every database write without configuring any TTL.
- **D.** Disable ElastiCache and use S3 Glacier Instant Retrieval as an in-memory cache.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Hai chiến lược Caching kinh điển trong đề DVA:
- **Lazy Loading (Cache-Aside)**: Chỉ cache những gì được đọc (tối ưu RAM), nhược điểm là Cache Miss lần đầu và dữ liệu có thể cũ (khắc phục bằng **TTL**).
- **Write-Through**: Cập nhật cache ngay khi ghi vào DB (dữ liệu luôn mới), nhược điểm là tốn RAM cho dữ liệu ít đọc.
- Thực tế thường **kết hợp cả Lazy Loading + Write-Through + TTL**.

- **A:** Sai vì `FLUSHALL` xóa sạch toàn bộ cache cùng một lúc gây bão truy vấn (Thundering Herd) xuống cơ sở dữ liệu.
- **B (Đúng):** Đúng! Lazy Loading chỉ nạp dữ liệu vào Redis khi xảy ra Cache Miss (tránh lãng phí RAM cho dữ liệu không ai đọc), và kết hợp TTL 900 giây giúp tự động làm mới dữ liệu cũ.
- **C:** Sai vì Write-Through ghi mọi bản ghi mới vào Redis ngay khi ghi DB, dẫn đến cache chứa nhiều dữ liệu không bao giờ được đọc (cache churn) và nếu không có TTL thì tốn rất nhiều bộ nhớ.
- **D:** Sai vì S3 Glacier là dịch vụ lưu trữ đối tượng dài hạn, không phải in-memory cache.

</details>

---

[← Bộ trước](02-dva-ec2-vpc-networking.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Bộ tiếp theo →](04-dva-s3-cloudfront.md)
