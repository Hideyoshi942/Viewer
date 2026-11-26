# Bài tập tình huống — Chủ đề 14: Database Hiệu năng cao & Caching — RDS, Aurora, DynamoDB, ElastiCache & DocumentDB

> RDS Multi-AZ vs Read Replicas, RDS Proxy, Aurora Global Database & Serverless v2, DynamoDB Partition Key/GSI/LSI/DAX/Global Tables & ElastiCache Redis vs Memcached.
> **Số câu hỏi:** 7 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A gaming company uses Amazon DynamoDB to store player session data and leaderboards. The application reads data from DynamoDB at high volume, and the team needs to reduce read latency from single-digit milliseconds down to microseconds without modifying application logic significantly. Which solution should they implement?

- **A.** Enable DynamoDB Global Tables with multi-Region active-active replication closer to players.
- **B.** Switch the DynamoDB table from Provisioned capacity mode to On-Demand capacity mode.
- **C.** Deploy Amazon ElastiCache for Memcached in front of the table without changing any application code.
- **D.** Deploy Amazon DynamoDB Accelerator (DAX) in front of the DynamoDB table.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty game sử dụng Amazon DynamoDB để lưu trữ dữ liệu phiên người chơi và bảng xếp hạng. Ứng dụng đọc dữ liệu từ DynamoDB với lưu lượng lớn, và nhóm cần giảm độ trễ đọc từ mức một chữ số mili-giây xuống mức micro-giây mà không cần chỉnh sửa đáng kể logic ứng dụng. Họ nên triển khai giải pháp nào?

**Đáp án đúng:** **D**

Giảm độ trễ đọc của **DynamoDB xuống microsecond** mà không sửa code → **Amazon DynamoDB Accelerator (DAX)**.

- **A:** Sai vì Global Tables dùng để nhân bản Active-Active đa Region, vẫn có độ trễ đọc mức millisecond.
- **B:** Sai vì chế độ tính phí không làm giảm độ trễ xuống microsecond.
- **C:** Sai vì dùng Memcached buộc lập trình viên phải tự viết code quản lý cache (cache-aside logic), không tương thích trực tiếp với DynamoDB API như DAX.
- **D (Đúng):** Đúng! **Amazon DAX** là in-memory cache tương thích hoàn toàn với DynamoDB API, giúp giảm độ trễ đọc từ mili-giây xuống **microsecond** mà không cần sửa logic ứng dụng.

</details>

### Câu 2 `medium`

A company runs a high-traffic web application using Amazon RDS for MySQL (Multi-AZ DB Instance). Monitoring shows that CPU utilization on the primary DB instance reaches 95% during peak hours due to heavy read-only reporting queries, while write operations remain low. Which TWO actions will offload read traffic from the primary instance and improve read performance? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Point the reporting application directly to the Amazon RDS Multi-AZ Standby instance endpoint for read queries.
- **B.** Enable AWS Backup with continuous point-in-time recovery on the primary RDS instance to offload read IOPS.
- **C.** Create one or more Amazon RDS Read Replicas and point the reporting application to the Read Replica endpoints.
- **D.** Place the primary Amazon RDS DB instance inside an EC2 Cluster Placement Group to boost query CPU speed.
- **E.** Deploy Amazon ElastiCache for Redis in front of RDS to cache frequently accessed read queries.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty vận hành một ứng dụng web lưu lượng cao sử dụng Amazon RDS for MySQL (Multi-AZ DB Instance). Hệ thống giám sát cho thấy mức sử dụng CPU trên DB instance chính đạt 95% trong giờ cao điểm do các truy vấn báo cáo chỉ đọc nặng nề, trong khi các thao tác ghi vẫn ở mức thấp. HAI hành động nào sẽ giảm tải lưu lượng đọc khỏi instance chính và cải thiện hiệu năng đọc? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Để giảm tải **ĐỌC (Read Scaling)** cho RDS: dùng **RDS Read Replicas** và/hoặc **Amazon ElastiCache**. Lưu ý: **Multi-AZ Standby truyền thống không đọc được!**

- **A:** Sai vì trong mô hình **RDS Multi-AZ DB Instance** truyền thống, Standby instance chỉ dùng cho failover, ứng dụng KHÔNG thể đọc trực tiếp từ nó.
- **B:** Sai vì AWS Backup chỉ quản lý sao lưu, không giảm tải đọc.
- **C (Đúng):** Đúng! **RDS Read Replicas** dùng nhân bản bất đồng bộ để mở rộng khả năng đọc (Read Scaling), tách tải báo cáo ra khỏi Primary DB.
- **D:** Sai vì RDS là dịch vụ quản lý, không cấu hình Placement Group và điều đó cũng không giảm tải CPU truy vấn SQL.
- **E (Đúng):** Đúng! **ElastiCache (Redis)** lưu cache các kết quả truy vấn lặp lại trong RAM, giảm tải đọc trực tiếp xuống RDS.

</details>

### Câu 3 `medium`

A web application generates millions of read queries per day against an Amazon RDS for MySQL database. The primary database is experiencing high CPU utilization due to complex reporting queries executed by the analytics team, slowing down customer transactions. How should the solutions architect offload the reporting queries with minimal code changes?

- **A.** Enable Amazon RDS Multi-AZ deployment and direct the reporting queries to the standby instance.
- **B.** Enable Amazon RDS automated backups to offload read queries during business hours.
- **C.** Create an Amazon RDS Read Replica and point the analytics reporting queries to the Read Replica endpoint.
- **D.** Increase the allocated EBS storage volume size on the primary RDS database instance.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng web tạo ra hàng triệu truy vấn đọc mỗi ngày vào cơ sở dữ liệu Amazon RDS for MySQL. Cơ sở dữ liệu chính đang có mức sử dụng CPU cao do các truy vấn báo cáo phức tạp được thực thi bởi nhóm phân tích, làm chậm các giao dịch của khách hàng. Solutions architect nên giảm tải các truy vấn báo cáo này như thế nào với mức thay đổi mã nguồn tối thiểu?

**Đáp án đúng:** **C**

Nguyên tắc cốt lõi về RDS: **Multi-AZ** = High Availability (Standby không đọc được); **Read Replica** = Read Scaling (giảm tải đọc/reporting cho Primary).

- **A:** Sai vì standby instance trong RDS Multi-AZ chỉ dùng cho High Availability/Failover, KHÔNG thể phục vụ kết nối đọc (read traffic).
- **B:** Sai vì automated backups dùng cho khôi phục thảm họa, không phục vụ truy vấn SQL.
- **C (Đúng):** Đúng! Amazon RDS Read Replica sao chép bất đồng bộ từ primary DB và cung cấp endpoint riêng để xử lý lưu lượng đọc (read-only), giúp giảm tải CPU cho primary DB.
- **D:** Sai vì tăng dung lượng lưu trữ không giải quyết được vấn đề nghẽn CPU do các truy vấn báo cáo phức tạp.

</details>

### Câu 4 `medium`

A gaming company uses Amazon DynamoDB for player leaderboards. During major tournament events, read traffic spikes by 10x, causing microsecond-level latency requirements to be missed and increasing Read Capacity Unit (RCU) consumption. The application needs microsecond read latency without rewriting the DynamoDB API calls. Which AWS service should be added?

- **A.** Amazon ElastiCache for Memcached
- **B.** Amazon DynamoDB Global Tables
- **C.** Amazon CloudFront CDN caching
- **D.** Amazon DynamoDB Accelerator (DAX)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty game sử dụng Amazon DynamoDB cho bảng xếp hạng người chơi. Trong các sự kiện giải đấu lớn, lưu lượng đọc tăng vọt gấp 10 lần, khiến yêu cầu độ trễ mức micro-giây không đạt được và làm tăng mức tiêu thụ Read Capacity Unit (RCU). Ứng dụng cần độ trễ đọc mức micro-giây mà không phải viết lại các lệnh gọi DynamoDB API. Nên bổ sung dịch vụ AWS nào?

**Đáp án đúng:** **D**

Khi câu hỏi nhắc đến **DynamoDB + microsecond latency + không đổi code/API** -> Đáp án là **Amazon DynamoDB Accelerator (DAX)**.

- **A:** Sai vì dùng ElastiCache đòi hỏi phải viết lại code ứng dụng để gọi API cache riêng (cache-aside pattern), không tương thích trực tiếp với DynamoDB API như DAX.
- **B:** Sai vì Global Tables giúp sao chép dữ liệu đa Region, không giảm độ trễ xuống mức micro-giây trong cùng một Region.
- **C:** Sai vì CloudFront là CDN cho nội dung HTTP/HTTPS tĩnh/động ở edge, không phải in-memory cache tương thích DynamoDB API.
- **D (Đúng):** Đúng! DAX là bộ nhớ đệm trong bộ nhớ (in-memory cache) được quản lý hoàn toàn và tương thích 100% API với DynamoDB, giúp giảm độ trễ đọc từ mili-giây xuống micro-giây và giảm tải RCU.

</details>

### Câu 5 `medium`

A company wants to delegate the ability to create new IAM roles to senior developers in a sandbox account, while ensuring that any role created by a developer can NEVER have permissions beyond Amazon S3 and Amazon DynamoDB, even if the developer attaches `AdministratorAccess` to the new role. Which IAM feature enforces this upper limit?

- **A.** IAM Access Analyzer
- **B.** Amazon S3 Bucket Policy
- **C.** IAM Permissions Boundary
- **D.** AWS STS `AssumeRole` Session Policy without an IAM policy condition

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty muốn ủy quyền khả năng tạo IAM role mới cho các lập trình viên cấp cao trong một sandbox account, đồng thời đảm bảo rằng bất kỳ role nào do lập trình viên tạo ra KHÔNG BAO GIỜ có quyền vượt quá Amazon S3 và Amazon DynamoDB, ngay cả khi lập trình viên gắn `AdministratorAccess` vào role mới. Tính năng IAM nào thực thi giới hạn trên này?

**Đáp án đúng:** **C**

Khi cần **ủy quyền tạo IAM User/Role cho developer** nhưng vẫn **giới hạn trần quyền tối đa** của các entity được tạo ra -> Sử dụng **IAM Permissions Boundary**.

- **A:** Sai vì IAM Access Analyzer chỉ phát hiện các tài nguyên được chia sẻ ra bên ngoài tài khoản/organization, không chặn quyền của role.
- **B:** Sai vì Bucket Policy chỉ kiểm soát truy cập vào S3 bucket đó, không giới hạn quyền của các IAM role mới tạo.
- **C (Đúng):** Đúng! IAM Permissions Boundary đặt trần quyền tối đa mà một IAM user hoặc role có thể sở hữu. Quyền thực tế là phần giao (intersection) giữa Identity Policy và Permissions Boundary.
- **D:** Sai vì nếu không ép buộc gắn Permissions Boundary khi `iam:CreateRole`, developer vẫn có thể tạo role toàn quyền.

</details>

### Câu 6 `medium`

A social media application needs an in-memory data store to cache user session state and maintain real-time sorted leaderboards using Sorted Sets. The data store must support Multi-AZ automatic failover, data persistence, and backup/restore capabilities. Which AWS service should the solutions architect select?

- **A.** Amazon ElastiCache for Memcached
- **B.** Amazon RDS for MySQL
- **C.** Amazon ElastiCache for Redis
- **D.** Amazon S3 Express One Zone

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng mạng xã hội cần một kho lưu trữ dữ liệu trong bộ nhớ (in-memory) để lưu bộ nhớ đệm trạng thái phiên người dùng và duy trì bảng xếp hạng được sắp xếp theo thời gian thực bằng Sorted Sets. Kho dữ liệu phải hỗ trợ tự động chuyển đổi dự phòng Multi-AZ, lưu trữ bền vững (persistence) và khả năng sao lưu/khôi phục. Solutions architect nên chọn dịch vụ AWS nào?

**Đáp án đúng:** **C**

So sánh ElastiCache **Redis vs Memcached** trong SAA-C03: **Redis** = Multi-AZ failover, Backup/Restore, Persistence, Sorted Sets (Leaderboards), Pub/Sub. **Memcached** = Cache đơn giản, scale ngang đa luồng (multi-threaded), không cần HA/persistence.

- **A:** Sai vì Memcached là cache thuần túy đa luồng, KHÔNG hỗ trợ Sorted Sets, KHÔNG có Multi-AZ replication/failover và KHÔNG có backup/persistence.
- **B:** Sai vì RDS lưu trên đĩa (disk-based), không phải in-memory data store.
- **C (Đúng):** Đúng! ElastiCache for Redis hỗ trợ các cấu trúc dữ liệu nâng cao như Sorted Sets (lý tưởng cho leaderboard), hỗ trợ Multi-AZ với Automatic Failover, lưu trữ bền vững (persistence) và backup/restore.
- **D:** Sai vì S3 Express One Zone là object storage, không phải in-memory cache hỗ trợ Sorted Sets.

</details>

### Câu 7 `hard`

A global gaming company needs a NoSQL database to store player session profiles with single-digit millisecond read and write latency across `us-east-1`, `eu-west-1`, and `ap-northeast-1`. Players in each Region must be able to read and write to their local Regional endpoint, with changes automatically replicated to the other two Regions. Which TWO configurations meet these requirements? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Use Amazon Aurora Global Database, which allows simultaneous local writes in all three Regions.
- **B.** Use Amazon ElastiCache for Memcached with cross-Region replication.
- **C.** Use Amazon DynamoDB Global Tables across `us-east-1`, `eu-west-1`, and `ap-northeast-1`.
- **D.** Use Amazon RDS for PostgreSQL with Multi-AZ across all three Regions.
- **E.** Enable DynamoDB Streams on the table (required for Global Tables replication).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty game toàn cầu cần một cơ sở dữ liệu NoSQL để lưu trữ hồ sơ phiên người chơi với độ trễ đọc và ghi ở mức một chữ số mili-giây tại `us-east-1`, `eu-west-1` và `ap-northeast-1`. Người chơi ở mỗi Region phải có thể đọc và ghi vào endpoint khu vực cục bộ của họ, với các thay đổi được tự động sao chép sang hai Region còn lại. HAI cấu hình nào đáp ứng các yêu cầu này? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Khi cần **NoSQL + Active-Active Multi-Region Read/Write + độ trễ vài mili-giây** -> Đáp án luôn là **Amazon DynamoDB Global Tables** (dựa trên **DynamoDB Streams**).

- **A:** Sai vì Aurora Global Database chỉ cho phép ghi ở Primary Region (cụm Secondary chỉ là read-only hoặc dùng write forwarding về Primary) và Aurora là SQL, không phải NoSQL.
- **B:** Sai vì ElastiCache for Memcached không hỗ trợ cross-Region replication.
- **C (Đúng):** Đúng! DynamoDB Global Tables cung cấp kiến trúc Active-Active đa Region hoàn toàn được quản lý, cho phép đọc và ghi cục bộ ở mỗi Region với độ trễ một chữ số mili-giây và tự động đồng bộ đa chiều.
- **D:** Sai vì RDS Multi-AZ chỉ hoạt động trong cùng 1 Region (nhiều AZ), không trải dài 3 Region và không phải NoSQL Active-Active.
- **E (Đúng):** Đúng! DynamoDB Global Tables sử dụng DynamoDB Streams làm nền tảng để theo dõi các thay đổi và đồng bộ dữ liệu giữa các Region.

</details>

---

[Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md)
