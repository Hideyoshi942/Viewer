# Chương 08 – AWS Fundamentals: RDS + Aurora + ElastiCache

> **Nguồn:** 11 video của chương + *Quiz – RDS, Aurora, & ElastiCache Quiz*.
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay (2026, kỳ thi hiện là **DVA-C02**).

## Mục tiêu chương

Sau chương này bạn có thể:

- Giải thích **Amazon RDS** là gì, các engine được hỗ trợ và lợi ích của dịch vụ managed so với tự cài database trên EC2.
- Phân biệt rõ **Read Replicas** (scale đọc, bất đồng bộ) và **Multi-AZ** (disaster recovery, đồng bộ), biết khi nào dùng cái nào.
- Hiểu kiến trúc **Amazon Aurora**: shared storage 6 bản sao / 3 AZ, writer endpoint, reader endpoint, replica auto scaling, Global Database, Serverless v2.
- Nắm các lớp bảo mật của RDS/Aurora: mã hoá at-rest (KMS), in-flight (TLS), **IAM Database Authentication**, security group, audit log.
- Hiểu **RDS Proxy** dùng để làm gì (connection pooling, giảm failover time, ép dùng IAM auth), đặc biệt với Lambda.
- Hiểu **Amazon ElastiCache** (Redis OSS / Valkey / Memcached), các kiến trúc dùng cache, và **đọc được pseudocode** của các chiến lược cache: **Lazy Loading (Cache-Aside)**, **Write-Through**, **TTL**, **Eviction**.
- Biết **Amazon MemoryDB** khác ElastiCache ở điểm nào.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001, 003 | Amazon RDS Overview + Amazon RDS Hands On | Bài 1 – Amazon RDS tổng quan |
| 002 | RDS Read Replicas vs Multi AZ | Bài 2 – Read Replicas và Multi-AZ |
| 004–005 | Amazon Aurora | Bài 3 – Amazon Aurora |
| 006 | RDS & Aurora Security | Bài 4 – Bảo mật RDS và Aurora |
| 007 | RDS Proxy | Bài 5 – Amazon RDS Proxy |
| 008–009 | ElastiCache Overview | Bài 6 – Amazon ElastiCache |
| 010 | ElastiCache Strategies | Bài 7 – Các chiến lược caching |
| 011 | Amazon MemoryDB for Redis - Overview | Bài 8 – Amazon MemoryDB |
| Quiz | RDS, Aurora, & ElastiCache Quiz | Câu hỏi ôn tập |

---

## Bài 1 – Amazon RDS tổng quan

### Lý thuyết

- **RDS = Relational Database Service**: dịch vụ **managed database** cho các database dùng **SQL** làm ngôn ngữ truy vấn.
- Bạn tạo database trên cloud, AWS quản lý hạ tầng bên dưới.
- **Các engine RDS hỗ trợ** (phải nhớ cho kỳ thi):
  - **PostgreSQL**
  - **MySQL**
  - **MariaDB**
  - **Oracle**
  - **Microsoft SQL Server**
  - **IBM Db2**
  - **Aurora** (engine độc quyền của AWS, học ở Bài 3)
- **Không có** MongoDB, Cassandra, Redis… trong RDS (đó là NoSQL, thuộc dịch vụ khác như DocumentDB, Keyspaces, ElastiCache).

#### Vì sao dùng RDS thay vì tự cài database trên EC2?

| RDS (managed) cung cấp | Tự cài trên EC2 |
|---|---|
| Provisioning tự động, **vá OS** tự động | Tự làm hết |
| **Backup liên tục**, khôi phục về một thời điểm (**Point in Time Restore**) | Tự viết script backup |
| Dashboard monitoring hiệu năng | Tự dựng |
| **Read Replicas** để tăng hiệu năng đọc | Tự cấu hình replication |
| **Multi-AZ** cho disaster recovery | Tự dựng cluster, failover |
| **Maintenance window** cho việc nâng cấp | Tự lên lịch |
| Scale **dọc** (đổi instance type) và **ngang** (thêm read replica) | Thủ công |
| Storage dựa trên **EBS** | EBS |
| **Không SSH** được vào instance | SSH thoải mái |

> Điểm "trừ" duy nhất: **không SSH** vào được máy chạy RDS (trừ **RDS Custom** cho Oracle/SQL Server). Đổi lại bạn có mọi thứ ở trên mà không phải tự làm.

#### RDS Storage Auto Scaling

- Khi tạo RDS bạn khai báo dung lượng ban đầu (ví dụ 20 GB). Nếu sắp hết chỗ, **RDS tự phát hiện và tăng storage**, **không cần downtime**.
- Bạn phải đặt **Maximum Storage Threshold** (giới hạn tối đa storage được phép tăng tới), để storage không tăng vô hạn.
- RDS tự tăng storage khi **đồng thời**:
  - Dung lượng trống **< 10%** dung lượng đã cấp phát.
  - Tình trạng thiếu chỗ kéo dài **≥ 5 phút**.
  - Đã qua **6 giờ** kể từ lần thay đổi storage gần nhất.
- Hữu ích cho ứng dụng có **workload khó dự đoán**. Hỗ trợ **mọi engine RDS**.

### Kiến thức thực tế

- **Point in Time Restore luôn tạo ra một DB instance MỚI** (endpoint mới), không ghi đè lên instance cũ. Ứng dụng phải đổi connection string sang instance mới.
- **Automated backup**: retention 0–35 ngày (0 = tắt). **Manual snapshot** giữ đến khi bạn xoá.
- **Storage autoscaling** chỉ tăng, **không bao giờ tự giảm**. Muốn giảm storage phải tạo instance mới và migrate dữ liệu.
- **Engine IBM Db2** được thêm vào RDS từ cuối 2023; các tài liệu cũ chỉ liệt kê 6 engine.
- **Free tier:** từ **15/7/2025**, tài khoản AWS mới chuyển sang mô hình **credit** (Free plan dùng trong tối đa 6 tháng) thay cho mô hình "12 tháng free tier" như video nói. Tài khoản tạo trước mốc này vẫn theo mô hình cũ. Luôn xem *Estimated monthly costs* trước khi tạo.
- **Không bao giờ để Public access = Yes** cho database thật. Đặt RDS trong **private subnet**, chỉ cho phép security group của ứng dụng truy cập port DB.
- Nên chọn **Managed in AWS Secrets Manager** cho master password: password được tự động rotate, ứng dụng đọc từ Secrets Manager thay vì hard-code.
- **RDS Blue/Green Deployments**: tạo môi trường "green" đồng bộ với production để nâng cấp phiên bản engine/thay đổi schema rồi switchover trong khoảng thời gian rất ngắn. Hữu ích khi nâng cấp major version.

### Ghi nhớ cho kỳ thi

- Engine RDS: **PostgreSQL, MySQL, MariaDB, Oracle, SQL Server, Db2, Aurora**. **MongoDB không phải** engine RDS.
- RDS là managed: backup, patch, monitoring, Multi-AZ, read replica… **nhưng không SSH được**.
- **Storage Auto Scaling**: cần đặt **maximum storage threshold**; dùng cho workload khó đoán.

---

## Bài 2 – Read Replicas và Multi-AZ

### Lý thuyết

> Đây là chủ đề **cực kỳ quan trọng** cho kỳ thi: phải hiểu rõ khác biệt và use case của từng cái.

#### RDS Read Replicas – để scale đọc

- Tạo được **tối đa 15 Read Replicas**.
- Replica có thể nằm ở: **cùng AZ**, **khác AZ (cross-AZ)**, hoặc **khác region (cross-region)**.
- Replication là **bất đồng bộ (ASYNC)** → dữ liệu đọc từ replica là **eventually consistent**: nếu ứng dụng đọc replica trước khi dữ liệu kịp sao chép, sẽ nhận dữ liệu cũ.
- Replica có thể được **promote** thành database độc lập: khi đó nó rời khỏi cơ chế replication và có vòng đời riêng, nhận cả ghi.
- Ứng dụng phải **cập nhật connection string** để dùng danh sách các replica (mỗi replica có **endpoint DNS riêng**).
- Replica **chỉ dùng cho câu lệnh `SELECT`** (đọc). Không dùng `INSERT`, `UPDATE`, `DELETE`.

**Use case kinh điển:** production DB đang chạy tải bình thường, team mới muốn chạy **reporting/analytics**. Nếu chạy trên DB chính sẽ làm chậm production. Giải pháp: tạo **Read Replica**, cho ứng dụng reporting đọc từ replica. Production không bị ảnh hưởng.

#### Chi phí mạng của Read Replica

- Bình thường trên AWS, dữ liệu đi **giữa 2 AZ sẽ tính phí**. Ngoại lệ thường là các **managed service**.
- **Replica cùng region (khác AZ)**: traffic replication **miễn phí**. Ví dụ DB ở `us-east-1a`, replica ở `us-east-1b` → không mất phí replication.
- **Replica khác region** (ví dụ `us-east-1` → `eu-west-1`): **mất phí** truyền dữ liệu replication.

#### RDS Multi-AZ – để Disaster Recovery

- Ứng dụng đọc/ghi vào **master** ở AZ A; RDS **replication đồng bộ (SYNC)** sang **standby** ở AZ B. Mỗi thay đổi phải được ghi cả sang standby mới được xác nhận.
- Ứng dụng dùng **một DNS name duy nhất**. Khi master gặp sự cố, RDS **tự động failover** sang standby, DNS trỏ sang standby → **không cần can thiệp thủ công**, không cần đổi connection string.
- Failover xảy ra khi: **mất cả AZ**, **mất mạng**, **instance hoặc storage của master bị lỗi**.
- Tăng **availability**. **Không dùng để scale**: standby **không đọc, không ghi** được, chỉ đứng chờ.
- **Read Replica cũng có thể bật Multi-AZ** để phục vụ disaster recovery (câu hỏi hay gặp).

#### So sánh

| | Read Replicas | Multi-AZ (DB instance) |
|---|---|---|
| Mục đích | **Scale đọc** | **Disaster recovery / High availability** |
| Replication | **Bất đồng bộ (ASYNC)** → eventually consistent | **Đồng bộ (SYNC)** |
| Số lượng | Tối đa **15** | 1 standby |
| Vị trí | Cùng AZ, cross-AZ, cross-region | AZ khác, cùng region |
| Đọc được không? | Có (chỉ đọc) | **Không** (standby không phục vụ traffic) |
| Endpoint | Mỗi replica **một endpoint riêng** → phải sửa connection string | **Một DNS name**, failover tự động |
| Promote | Promote thành DB độc lập (thủ công) | Standby tự lên làm master khi failover |
| Phí mạng | Free trong cùng region, mất phí cross-region | — |

#### Chuyển từ Single-AZ sang Multi-AZ

- Là thao tác **zero downtime**: không cần dừng database. Chỉ cần **Modify** database và bật **Multi-AZ**.
- Bên trong RDS làm như sau:
  1. Tự động **chụp snapshot** của DB chính.
  2. **Restore** snapshot đó thành **standby DB** mới ở AZ khác.
  3. Thiết lập **đồng bộ** giữa 2 DB; standby bắt kịp DB chính → hoàn tất Multi-AZ.

### Kiến thức thực tế

```bash
# Tạo read replica (cùng region)
aws rds create-db-instance-read-replica \
  --db-instance-identifier database-1-replica \
  --source-db-instance-identifier database-1

# Tạo read replica ở region khác (gọi API ở region đích, nguồn ghi bằng ARN)
aws rds create-db-instance-read-replica --region eu-west-1 \
  --db-instance-identifier database-1-replica-eu \
  --source-db-instance-identifier arn:aws:rds:us-east-1:123456789012:db:database-1 \
  --multi-az

# Bật Multi-AZ cho DB đang chạy (zero downtime)
aws rds modify-db-instance --db-instance-identifier database-1 --multi-az --apply-immediately

# Promote replica thành DB độc lập (ví dụ khi region chính gặp sự cố)
aws rds promote-read-replica --db-instance-identifier database-1-replica-eu

# Kiểm tra độ trễ replication của replica
aws cloudwatch get-metric-statistics --namespace AWS/RDS --metric-name ReplicaLag \
  --dimensions Name=DBInstanceIdentifier,Value=database-1-replica \
  --start-time 2026-10-14T00:00:00Z --end-time 2026-10-14T01:00:00Z --period 300 --statistics Average
```

- Theo dõi metric **`ReplicaLag`** để biết replica chậm bao nhiêu giây so với primary.
- **Read-after-write**: nếu người dùng vừa ghi xong cần thấy ngay dữ liệu mới (ví dụ vừa sửa bài đăng), hãy **đọc từ primary** cho request đó, các request còn lại đọc từ replica.
- **Giới hạn 15 replica** áp dụng cho MySQL, MariaDB, PostgreSQL (trước 2023 là 5). Với **Oracle và SQL Server**, giới hạn thấp hơn (5 replica). Đề thi dùng con số **15**.
- **Multi-AZ DB cluster** (thấy trong hands-on: "3 instances"): 1 writer + **2 standby đọc được** ở 3 AZ, failover nhanh hơn, chỉ hỗ trợ MySQL và PostgreSQL. Đây là ngoại lệ so với Multi-AZ DB instance truyền thống (standby không đọc được). Khi đề nói "Multi-AZ" chung chung thì hiểu là **Multi-AZ DB instance** (standby không đọc được).
- Multi-AZ chỉ bảo vệ khỏi sự cố **một AZ**. Để chống sự cố **cả region**, dùng **cross-region read replica** (có thể bật Multi-AZ cho replica), **cross-region automated backups** hoặc Aurora Global Database.
- Khi failover Multi-AZ, DNS mất một khoảng thời gian (thường 1–2 phút) để chuyển. Ứng dụng nên có **retry kết nối** và **không cache DNS quá lâu** (ví dụ JVM nên đặt TTL DNS thấp).

### Ghi nhớ cho kỳ thi

- **Read Replica = ASYNC, scale đọc, eventually consistent, endpoint riêng, tối đa 15.**
- **Multi-AZ = SYNC, DR, một DNS name, failover tự động, standby không đọc được.**
- Người dùng "không thấy ngay bài vừa sửa" khi đọc từ replica → do **replication bất đồng bộ** (eventual consistency), không phải bug.
- Analytics làm chậm production → tạo **Read Replica** cho analytics (không phải Multi-AZ, không phải chạy ban đêm).
- Tính năng **không cần đổi connection string** → **Multi-AZ**.
- Single-AZ → Multi-AZ: **zero downtime**, chỉ cần **Modify**.
- Read Replica **có thể** bật Multi-AZ.
- DR cross-region, đọc + ghi, HA ở region đích → **Read Replica ở region khác + bật Multi-AZ cho replica**.
- Replication trong cùng region miễn phí; cross-region mất phí.

---

## Bài 3 – Amazon Aurora

### Lý thuyết

- **Aurora** là công nghệ **độc quyền của AWS** (không open source), nhưng **tương thích với MySQL và PostgreSQL**: driver MySQL/PostgreSQL kết nối như bình thường.
- **Cloud-optimized**: hiệu năng khoảng **5x MySQL trên RDS** và **3x PostgreSQL trên RDS**.
- **Storage tự động tăng**, bắt đầu từ **10 GB**, tăng tới **256 TB** (xem ghi chú phiên bản ở Kiến thức thực tế). DBA/SysOps không phải theo dõi dung lượng đĩa.
- **Tối đa 15 Aurora Replicas**, replication nhanh hơn MySQL, **replica lag thường dưới 10 ms**.
- **Failover gần như tức thì**, nhanh hơn nhiều so với Multi-AZ của RDS MySQL. **High availability** sẵn có (cloud native).
- Chi phí cao hơn RDS khoảng **20%**, nhưng hiệu quả hơn nên ở quy mô lớn lại tiết kiệm hơn.

#### High availability và read scaling

- Mỗi lần ghi, Aurora lưu **6 bản sao dữ liệu trên 3 AZ**:
  - Cần **4/6 bản sao** để **ghi** → mất một AZ vẫn ghi được.
  - Cần **3/6 bản sao** để **đọc** → đọc rất sẵn sàng.
- **Self-healing**: dữ liệu hỏng được tự sửa bằng **peer-to-peer replication** ở backend.
- Dữ liệu được **stripe** trên **hàng trăm volume**, không phụ thuộc một volume duy nhất → giảm rủi ro.
- **Shared storage volume** là volume **logic**, tự replication, tự self-healing, tự mở rộng. Bạn không thao tác trực tiếp với storage.

#### Kiến trúc instance

- Giống Multi-AZ của RDS: chỉ **một master nhận ghi**.
- Master lỗi → **failover dưới 30 giây** (trung bình).
- Trên master có thể có **tối đa 15 read replicas** phục vụ đọc. **Bất kỳ replica nào cũng có thể lên làm master** khi failover (khác với RDS, nơi standby là cố định).
- Hỗ trợ **cross-region replication**.

#### Aurora DB Cluster và các endpoint

| Endpoint | Trỏ tới | Ghi chú |
|---|---|---|
| **Writer Endpoint** (cluster endpoint) | **Luôn trỏ tới master** hiện tại | Master failover thì client vẫn dùng endpoint này, tự chuyển hướng |
| **Reader Endpoint** | **Tất cả read replicas** | **Load balancing ở mức connection** (không phải mức câu lệnh) |
| Instance endpoint | Một instance cụ thể | Mỗi instance có endpoint riêng |

- Read replica hỗ trợ **Auto Scaling** (1 đến 15 replica). Vì số replica thay đổi liên tục, ứng dụng nên dùng **Reader Endpoint** thay vì theo dõi từng replica.

#### Các tính năng khác

- Automatic failover, backup & recovery, isolation & security, industry compliance.
- Push-button scaling, **automated patching with zero downtime**, advanced monitoring, routine maintenance.
- **Backtrack**: "tua ngược" dữ liệu về **bất kỳ thời điểm nào** (ví dụ "về 16:00 hôm qua", rồi đổi ý "về 17:00 hôm qua" cũng được), **không dựa vào backup**.

### Kiến thức thực tế

- **Giới hạn storage:** tài liệu cũ ghi **128 TB**. Từ 2025, AWS nâng lên **256 TiB** cho các phiên bản engine Aurora mới; phiên bản cũ vẫn là 128 TiB. Video (bản cập nhật) nói 256 TB.
- **Aurora Serverless v1 đã end-of-life (2025)**. Hiện chỉ còn **Aurora Serverless v2**: instance class `db.serverless`, scale theo ACU rất mịn, **có thể dùng chung cluster với instance provisioned**, hỗ trợ reader, Multi-AZ, Global Database, và có thể **scale về 0 ACU (auto-pause)** khi không có kết nối. Tài liệu/đề cũ nói về "Aurora Serverless" (v1) thì hiểu là khái niệm "tự scale theo tải, trả tiền theo dùng".

  ```bash
  aws rds create-db-cluster --db-cluster-identifier sls-demo --engine aurora-postgresql \
    --master-username postgres --manage-master-user-password \
    --serverless-v2-scaling-configuration MinCapacity=0.5,MaxCapacity=16
  aws rds create-db-instance --db-instance-identifier sls-demo-1 \
    --db-cluster-identifier sls-demo --engine aurora-postgresql --db-instance-class db.serverless
  ```

- **Custom Endpoint**: nhóm một tập instance cụ thể (ví dụ các instance lớn dành cho analytics) dưới một endpoint riêng, tách khỏi reader endpoint chung.
- **Reader endpoint cân bằng theo connection**: nếu ứng dụng dùng connection pool giữ kết nối lâu, tải có thể dồn lệch vào một vài replica. Replica mới do auto scaling thêm vào chỉ nhận connection **mới**.
- **Backtrack** chỉ có ở **Aurora MySQL**, phải bật khi tạo cluster, cửa sổ tối đa **72 giờ**, tua ngược **ngay trên cluster hiện tại** (khác Point in Time Restore tạo cluster mới).
- **Aurora Global Database**: 1 region primary + các region secondary chỉ đọc, replication ở tầng storage với độ trễ thường **dưới 1 giây**; khi region primary gặp sự cố có thể promote region secondary. Dùng cho DR cross-region và đọc độ trễ thấp toàn cầu.
- **Aurora I/O-Optimized** (ra mắt 2023): AWS khuyến nghị cân nhắc khi chi phí I/O chiếm khoảng **trên 25%** tổng chi phí Aurora.
- Có thể **stop** cluster Aurora/RDS để tiết kiệm, nhưng tối đa 7 ngày sau AWS sẽ tự khởi động lại.

### Ghi nhớ cho kỳ thi

- Aurora tương thích **MySQL và PostgreSQL** (không phải Oracle, MariaDB, SQL Server).
- **15 replicas**, **6 bản sao / 3 AZ**, ghi cần 4/6, đọc cần 3/6, storage tự tăng từ 10 GB.
- **Writer endpoint** luôn trỏ tới master; **Reader endpoint** load balance tới các replica (**ở mức connection**).
- Failover < 30 giây; replica nào cũng có thể lên master.
- Replica **Auto Scaling**; **Global Database** cho cross-region; **Backtrack** để tua ngược không cần backup.
- Workload khó đoán, gián đoạn → **Aurora Serverless (v2)**.

---

## Bài 4 – Bảo mật RDS và Aurora

### Lý thuyết

| Lớp bảo mật | Chi tiết |
|---|---|
| **At-rest encryption** | Mã hoá dữ liệu trên volume bằng **KMS**, áp dụng cho master và mọi replica. **Phải chọn lúc tạo database lần đầu.** |
| | Master **không mã hoá** → read replica **không thể mã hoá**. |
| | Mã hoá DB **đã có** mà chưa mã hoá: **snapshot → (copy snapshot có bật mã hoá) → restore** thành DB mã hoá. |
| **In-flight encryption** | Mọi DB RDS/Aurora **sẵn sàng TLS** mặc định. Client phải dùng **TLS root certificate của AWS** (tải từ website AWS). |
| **Authentication** | Username/password truyền thống, **hoặc IAM** (ví dụ EC2 có IAM Role xác thực thẳng vào DB, không cần password). |
| **Network** | Kiểm soát bằng **Security Group**: cho phép/chặn port, IP, security group cụ thể. |
| **Không SSH** | Vì là managed service; ngoại lệ là **RDS Custom**. |
| **Audit Logs** | Bật audit log để biết query nào được chạy. Log trên RDS bị mất sau một thời gian → muốn lưu lâu thì **gửi sang CloudWatch Logs**. |

### Kiến thức thực tế

**Mã hoá một RDS đang không mã hoá (CLI):**

```bash
aws rds create-db-snapshot --db-instance-identifier mydb --db-snapshot-identifier mydb-unenc
aws rds copy-db-snapshot \
  --source-db-snapshot-identifier mydb-unenc \
  --target-db-snapshot-identifier mydb-enc \
  --kms-key-id alias/aws/rds          # bật mã hoá khi copy
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier mydb-encrypted --db-snapshot-identifier mydb-enc
# Sau đó chuyển ứng dụng sang endpoint mới và xoá DB cũ
```

**IAM Database Authentication (MySQL/PostgreSQL/MariaDB):**

1. Bật IAM DB authentication trên instance:

   ```bash
   aws rds modify-db-instance --db-instance-identifier mydb \
     --enable-iam-database-authentication --apply-immediately
   ```

2. Tạo user trong DB dùng plugin của AWS:

   ```sql
   -- MySQL
   CREATE USER app_user IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS';
   -- PostgreSQL
   CREATE USER app_user; GRANT rds_iam TO app_user;
   ```

3. Gắn IAM policy cho role của EC2/Lambda:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Action": "rds-db:connect",
       "Resource": "arn:aws:rds-db:ap-southeast-1:123456789012:dbuser:db-ABCDEFGHIJKL0123456789/app_user"
     }]
   }
   ```

4. Trong code, sinh **auth token** (hiệu lực **15 phút**) thay cho password, bắt buộc dùng SSL/TLS:

   ```python
   import boto3, pymysql

   host = "mydb.xxxx.ap-southeast-1.rds.amazonaws.com"
   token = boto3.client("rds", region_name="ap-southeast-1").generate_db_auth_token(
       DBHostname=host, Port=3306, DBUsername="app_user")

   conn = pymysql.connect(host=host, port=3306, user="app_user", password=token,
                          database="mydb", ssl={"ca": "/opt/certs/global-bundle.pem"})
   ```

   ```bash
   # Hoặc từ CLI
   aws rds generate-db-auth-token --hostname $HOST --port 3306 --username app_user --region ap-southeast-1
   ```

- **IAM DB authentication** hỗ trợ **MySQL, MariaDB, PostgreSQL** và Aurora MySQL/PostgreSQL; **không hỗ trợ Oracle** (và SQL Server) – Oracle/SQL Server dùng Kerberos (AWS Managed Microsoft AD).
- **Ép buộc TLS:** PostgreSQL đặt parameter `rds.force_ssl = 1`; MySQL đặt `require_secure_transport = ON` trong parameter group.
- **Chứng chỉ CA:** CA cũ `rds-ca-2019` đã hết hạn (2024). Hiện dùng các CA như `rds-ca-rsa2048-g1`; bundle tải tại `https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem`. Ứng dụng phải cập nhật trust store khi AWS đổi CA.
- **Encryption không tắt được** sau khi bật, và snapshot của DB mã hoá cũng được mã hoá. Muốn chia sẻ snapshot mã hoá cho tài khoản khác thì phải dùng **customer managed KMS key** (không dùng được key `aws/rds`).
- **Security group** best practice: inbound port DB chỉ từ **security group của ứng dụng**, không mở theo dải IP rộng.
- Log export ra CloudWatch Logs: `--cloudwatch-logs-export-configuration '{"EnableLogTypes":["audit","error","general","slowquery"]}'` (MySQL; audit log cần option group `MARIADB_AUDIT_PLUGIN`).

### Ghi nhớ cho kỳ thi

- Mã hoá at-rest **chọn lúc tạo**; master không mã hoá → replica **không mã hoá được**.
- Mã hoá DB đang chạy: **snapshot → copy snapshot có encryption → restore**.
- Nhiều developer có IAM user, không muốn tạo DB user cho từng người → **IAM Database Authentication**.
- **Oracle không hỗ trợ IAM DB Authentication.**
- Audit log lưu lâu dài → **CloudWatch Logs**.

---

## Bài 5 – Amazon RDS Proxy

### Lý thuyết

- **RDS Proxy** là **database proxy fully managed** cho RDS và Aurora, triển khai trong VPC.
- Ứng dụng kết nối tới **proxy** thay vì kết nối thẳng DB. Proxy **gom (pool) và chia sẻ** các kết nối, mở **ít kết nối hơn** tới DB.

**Ba lợi ích chính (cần nhớ cho kỳ thi):**

| # | Lợi ích | Giải thích |
|---|---|---|
| 1 | **Connection pooling** | Giảm áp lực lên CPU, RAM của DB; **giảm số kết nối mở và timeout** |
| 2 | **Giảm failover time tới 66%** | Ứng dụng nối vào proxy (không biết gì về failover); proxy tự xử lý failover của RDS/Aurora |
| 3 | **Ép dùng IAM authentication** | Người dùng chỉ kết nối được bằng IAM; credentials DB lưu an toàn trong **AWS Secrets Manager** |

**Đặc điểm khác:**

- **Fully serverless**, tự scale, **highly available (multi-AZ)**.
- Hỗ trợ **RDS MySQL, PostgreSQL, MariaDB, SQL Server** và **Aurora MySQL/PostgreSQL**.
- **Không cần sửa code**: chỉ đổi endpoint kết nối sang endpoint của proxy.
- **Không bao giờ public**: chỉ truy cập được **từ trong VPC**.

#### RDS Proxy và Lambda

- Lambda có thể nhân lên **hàng trăm, hàng nghìn** bản chạy, xuất hiện và biến mất rất nhanh. Nếu mỗi bản mở kết nối thẳng tới RDS sẽ để lại **kết nối mở, timeout**, gây quá tải DB.
- Giải pháp: Lambda kết nối vào **RDS Proxy** (proxy được thiết kế để chịu tải đó), proxy gom lại thành ít kết nối tới DB.

### Kiến thức thực tế

```bash
# Tạo proxy (credentials DB nằm trong Secrets Manager, proxy dùng IAM role để đọc secret)
aws rds create-db-proxy \
  --db-proxy-name my-proxy \
  --engine-family MYSQL \
  --auth '[{"AuthScheme":"SECRETS","SecretArn":"arn:aws:secretsmanager:ap-southeast-1:123456789012:secret:mydb-admin-AbCdEf","IAMAuth":"REQUIRED"}]' \
  --role-arn arn:aws:iam::123456789012:role/rds-proxy-secrets-role \
  --vpc-subnet-ids subnet-aaa subnet-bbb \
  --vpc-security-group-ids sg-0123456789abcdef0 \
  --require-tls

# Gắn proxy vào DB instance (hoặc --db-cluster-identifiers cho Aurora)
aws rds register-db-proxy-targets --db-proxy-name my-proxy --db-instance-identifiers database-1
```

- `IAMAuth=REQUIRED` là cách **ép IAM authentication**: client phải dùng token IAM (`generate-db-auth-token` với hostname là **endpoint của proxy**).
- Lambda muốn dùng RDS Proxy phải chạy **trong VPC** (cùng VPC hoặc kết nối được với proxy).
- **Mở kết nối DB ngoài handler** của Lambda để tái sử dụng giữa các lần gọi (execution environment reuse), kết hợp với RDS Proxy.
- **Connection pinning**: một số thao tác (ví dụ thay đổi biến session, prepared statement với một số engine, temporary table) khiến proxy phải "ghim" kết nối cho một client, làm giảm hiệu quả pooling. Theo dõi metric `DatabaseConnectionsCurrentlySessionPinned`.
- Proxy có thêm **read-only endpoint** cho Aurora để định tuyến tới reader.
- RDS Proxy **tính phí theo vCPU** (hoặc ACU với Aurora Serverless) của database phía sau.

### Ghi nhớ cho kỳ thi

- Quá nhiều kết nối / Lambda làm cạn kết nối DB → **RDS Proxy**.
- Giảm thời gian failover RDS/Aurora (tới **66%**) → **RDS Proxy**.
- Ép **IAM authentication** + lưu credentials trong **Secrets Manager** → **RDS Proxy**.
- RDS Proxy **không public**, chỉ trong VPC; **không cần đổi code** ngoài endpoint.

---

## Bài 6 – Amazon ElastiCache

### Lý thuyết

- Giống như RDS cho database quan hệ, **ElastiCache** cung cấp **Redis** hoặc **Memcached** được quản lý (hiện thêm **Valkey**).
- **Cache** là **in-memory database**: hiệu năng rất cao, độ trễ rất thấp.
- Lợi ích:
  - **Giảm tải cho database** với workload **đọc nhiều**: các query phổ biến được cache, không phải truy vấn DB mỗi lần.
  - Giúp ứng dụng **stateless** bằng cách lưu state (session) vào ElastiCache.
- AWS lo bảo trì OS, patching, tối ưu, setup, cấu hình, monitoring, khôi phục lỗi, backup.
- **Lưu ý:** dùng ElastiCache **phải sửa code ứng dụng khá nhiều** (query cache trước/sau khi query DB). Không phải "bật lên là có cache".

#### Kiến trúc 1 – Cache cho database

1. Ứng dụng hỏi ElastiCache trước.
2. **Cache hit**: có sẵn → lấy kết quả từ cache, **tiết kiệm một lần truy vấn DB**.
3. **Cache miss**: không có → đọc từ RDS → **ghi lại vào cache** để lần sau (hoặc instance khác) là cache hit.
4. Giảm tải RDS. Cần **chiến lược cache invalidation** để đảm bảo cache chỉ chứa dữ liệu đủ mới; đây là phần khó nhất khi dùng cache.

#### Kiến trúc 2 – Lưu user session

1. User đăng nhập vào một instance ứng dụng; ứng dụng **ghi session vào ElastiCache**.
2. Request sau của user đi tới **instance khác**: instance đó **đọc session từ ElastiCache** → user vẫn đăng nhập, không phải login lại.
3. Ứng dụng trở thành **stateless**.

#### Redis và Memcached

| Redis (Redis OSS / Valkey) | Memcached |
|---|---|
| **Multi-AZ** với **auto-failover** | Nhiều node, **phân mảnh dữ liệu (sharding)** |
| **Read replicas** để scale đọc và HA | **Không có HA**, **không replication** |
| **Durability** bằng AOF persistence | **Không persistent**: lỗi có thể mất cả cache |
| **Backup và restore** | Backup/restore **chỉ có ở Memcached Serverless**, không có ở bản node-based |
| Hỗ trợ **Sets và Sorted Sets** (làm **leaderboard**) | **Kiến trúc đa luồng (multi-thread)** |
| Hình dung: một node **replicate** sang node khác | Hình dung: nhiều node **sharding** cạnh nhau |

> Đề thi hiếm khi hỏi chọn Redis hay Memcached, nhưng nên nắm để chọn theo use case: cần HA, persistence, backup, cấu trúc dữ liệu phong phú → **Redis/Valkey**; cache đơn giản, đa luồng, chấp nhận mất dữ liệu → **Memcached**.

### Kiến thức thực tế

- **Valkey**: năm 2024 Redis đổi giấy phép, cộng đồng (Linux Foundation) fork thành **Valkey**, tương thích Redis OSS. ElastiCache hỗ trợ Valkey từ 10/2024 và **giá thấp hơn** Redis OSS. Engine "Redis" trên AWS nay gọi là **Redis OSS**. Đề thi có thể vẫn ghi "ElastiCache for Redis": coi như tương đương.
- **ElastiCache Serverless** (từ 11/2023): không quản lý node, tự scale, luôn Multi-AZ, **bắt buộc TLS**, tính tiền theo GB dữ liệu và ECPU.
- **ElastiCache chỉ truy cập được từ trong VPC** (không có public endpoint). Lab phải kết nối từ EC2/Lambda trong cùng VPC.
- **AOF trên ElastiCache**: các phiên bản engine mới không còn hỗ trợ AOF; AWS khuyến nghị **Multi-AZ với replica + backup** để đảm bảo độ bền. Cần durability thật sự như database → **MemoryDB** (Bài 8).
- **Ví dụ lưu session bằng Redis (Python):**

  ```python
  import json, uuid, redis

  r = redis.Redis(host="master.democluster.xxxxxx.apse1.cache.amazonaws.com",
                  port=6379, ssl=True, decode_responses=True)

  def create_session(user_id):
      sid = str(uuid.uuid4())
      r.set(f"session:{sid}", json.dumps({"user_id": user_id}), ex=1800)  # hết hạn 30 phút
      return sid

  def get_session(sid):
      data = r.get(f"session:{sid}")
      if data:
          r.expire(f"session:{sid}", 1800)   # sliding expiration
      return json.loads(data) if data else None
  ```

- **Leaderboard bằng Sorted Set:**

  ```python
  r.zadd("leaderboard", {"alice": 3200, "bob": 2900})
  r.zincrby("leaderboard", 150, "bob")
  top10 = r.zrevrange("leaderboard", 0, 9, withscores=True)
  ```

- **Cluster mode enabled** cho phép scale ghi và dung lượng bằng nhiều shard; client phải là **cluster-aware** và kết nối qua **configuration endpoint**.

### Ghi nhớ cho kỳ thi

- ElastiCache = **Redis / Memcached managed**, in-memory, độ trễ thấp, **giảm tải DB đọc nhiều**, **lưu session để ứng dụng stateless**.
- **Phải sửa code** ứng dụng để dùng cache.
- User phải **đăng nhập lại liên tục** khi đi qua ALB + ASG, không muốn sticky session → **lưu session trong ElastiCache**.
- ElastiCache Redis cần **high availability** → bật **Multi-AZ**.
- **Cluster mode disabled**: 1 primary + **tối đa 5 read replicas**.
- Redis: Multi-AZ, replica, backup, sorted set; Memcached: sharding, không HA, không persistence, multi-thread.
- Redis AUTH / RBAC cần **encryption in transit**.

---

## Bài 7 – Các chiến lược caching

### Lý thuyết

#### Các câu hỏi trước khi cache

| Câu hỏi | Giải thích |
|---|---|
| **Cache dữ liệu này có an toàn không?** | Thường là có, nhưng dữ liệu có thể **cũ (out of date)** → eventual consistency. Không phải dữ liệu nào cũng cache được. |
| **Cache có hiệu quả không?** | Hiệu quả: dữ liệu **thay đổi chậm**, **ít key được truy cập thường xuyên**. Anti-pattern: dữ liệu **thay đổi rất nhanh**, cần **toàn bộ key space**. |
| **Dữ liệu có cấu trúc phù hợp không?** | Key-value, kết quả tổng hợp (aggregation) rất hợp. Cấu trúc dữ liệu theo đúng kiểu query. |
| **Dùng design pattern nào?** | Lazy Loading, Write-Through, TTL… (bên dưới) |

#### Lazy Loading / Cache-Aside / Lazy Population

> Ba tên gọi này **là một**.

**Luồng:**

1. Ứng dụng đọc từ cache → **cache hit** → trả về (trường hợp tốt nhất).
2. **Cache miss** → đọc từ RDS → **ghi vào cache** → lần sau người khác đọc sẽ cache hit.

| Ưu điểm | Nhược điểm |
|---|---|
| **Chỉ dữ liệu được yêu cầu mới vào cache** → tiết kiệm bộ nhớ | **Cache miss = 3 lượt gọi mạng** (đọc cache, đọc DB, ghi cache) → **read penalty**, user thấy chậm khi đọc |
| **Node cache hỏng không nguy hiểm**: chỉ tăng độ trễ trong lúc **warm up** cache | **Dữ liệu cũ (stale)**: DB cập nhật nhưng cache không tự cập nhật |

**Pseudocode (Python) – đề thi yêu cầu đọc hiểu:**

```python
# Python
def get_user(user_id):
    # Kiểm tra cache
    record = cache.get(user_id)

    if record is None:
        # Cache miss: truy vấn database
        record = db.query("select * from users where id = ?", user_id)
        # Ghi kết quả vào cache cho lần sau
        cache.set(user_id, record)
        return record
    else:
        # Cache hit
        return record

# Chạy chương trình
user = get_user(17)
```

> Dấu hiệu nhận biết Lazy Loading: hàm **đọc** (`get_...`), kiểm tra cache trước, **miss thì mới query DB rồi `cache.set`**.

#### Write-Through

- **Thêm/cập nhật cache mỗi khi database được cập nhật**: ứng dụng ghi vào RDS và **đồng thời ghi vào cache**.

| Ưu điểm | Nhược điểm |
|---|---|
| **Dữ liệu trong cache không bao giờ cũ**, đọc rất nhanh | **Thiếu dữ liệu** cho tới khi dữ liệu được thêm/cập nhật trong DB → **kết hợp với Lazy Loading** để khắc phục |
| **Write penalty** thay cho read penalty: mỗi lần ghi cần **2 lượt gọi** (DB + cache). User **chấp nhận ghi chậm** hơn đọc (đăng bài mất 1–2 giây là bình thường, xem profile phải tức thì) | **Cache churn**: rất nhiều dữ liệu được ghi vào cache nhưng **có thể không bao giờ được đọc** → vấn đề nếu cache nhỏ |

**Pseudocode:**

```python
# Python
def save_user(user_id, values):
    # Ghi vào database
    record = db.query("update users ... where id = ?", user_id, values)
    # Đẩy bản ghi mới vào cache
    cache.set(user_id, record)
    return record

# Chạy chương trình
user = save_user(17, {"name": "Nate Dogg"})
```

> Dấu hiệu nhận biết Write-Through: hàm **ghi** (`save_...`), **ghi DB rồi `cache.set` ngay**. `get_user` (Lazy Loading) và `save_user` (Write-Through) có thể **dùng cùng nhau**.

#### Cache Evictions và TTL

- Cache có dung lượng giới hạn → dữ liệu bị **evict** (loại ra) khi:
  - Bạn **xoá item một cách tường minh**.
  - **Bộ nhớ đầy** và item **ít được dùng gần đây** → **LRU (Least Recently Used)**.
  - Item có **TTL (Time-to-live)** hết hạn (ví dụ "chỉ sống 5 phút").
- TTL hữu ích cho hầu hết loại dữ liệu: **leaderboard, comment, activity stream**…
- TTL từ **vài giây** tới **vài giờ, vài ngày**. Ngay cả TTL vài giây cho dữ liệu được truy cập cực nhiều cũng rất hiệu quả.
- TTL giúp cân bằng giữa giữ dữ liệu trong cache và nhường chỗ cho dữ liệu mới.
- **Quá nhiều eviction** vì cache luôn đầy bộ nhớ → **scale up hoặc scale out** cache (làm cache lớn hơn).

#### Lời khuyên cuối

- **Lazy Loading / Cache-Aside** dễ cài, phù hợp nhiều tình huống, là **nền tảng** để cải thiện hiệu năng đọc → nên làm trước.
- **Write-Through** phức tạp hơn, là **tối ưu bổ sung** trên nền Lazy Loading, không nên là ưu tiên đầu tiên. Dùng khi cần giảm dữ liệu cũ.
- **TTL** thường là ý hay, **trừ khi** dùng Write-Through. Đặt giá trị hợp lý cho ứng dụng.
- **Chỉ cache dữ liệu hợp lý**: user profile, blog… nhưng **không** cache giá cả (pricing) hay **số dư tài khoản ngân hàng**.
- *"There are only two hard things in Computer Science: cache invalidation and naming things."* – caching là chủ đề khó.

#### So sánh nhanh

| | Lazy Loading (Cache-Aside) | Write-Through |
|---|---|---|
| Khi nào ghi vào cache | Khi **đọc** và bị cache miss | Khi **ghi** vào DB |
| Penalty | **Read penalty** (3 lượt gọi khi miss) | **Write penalty** (2 lượt gọi mỗi lần ghi) |
| Dữ liệu cũ | **Có thể cũ** | **Không cũ** |
| Dữ liệu thiếu | Không (miss thì đọc DB) | **Thiếu** dữ liệu chưa từng được ghi |
| Bộ nhớ | Chỉ dữ liệu được dùng → **hợp cache nhỏ** | **Cache churn**, tốn bộ nhớ |
| Cache hỏng | Không nghiêm trọng (warm up lại) | Mất dữ liệu cache cho tới lần ghi tiếp |

### Kiến thức thực tế

**Kết hợp Lazy Loading + Write-Through + TTL với Redis/Valkey (Python, redis-py):**

```python
import json
import redis
import pymysql

cache = redis.Redis(host="master.democluster.xxxxxx.apse1.cache.amazonaws.com",
                    port=6379, ssl=True, decode_responses=True)
db = pymysql.connect(host="mydb.xxxx.ap-southeast-1.rds.amazonaws.com",
                     user="app", password="...", database="mydb",
                     cursorclass=pymysql.cursors.DictCursor)
TTL_SECONDS = 300   # lưới an toàn chống dữ liệu cũ vĩnh viễn

def get_user(user_id):                      # Lazy Loading
    key = f"user:{user_id}"
    cached = cache.get(key)
    if cached is not None:
        return json.loads(cached)           # cache hit
    with db.cursor() as cur:                # cache miss
        cur.execute("SELECT id, name, email FROM users WHERE id = %s", (user_id,))
        record = cur.fetchone()
    if record:
        cache.set(key, json.dumps(record), ex=TTL_SECONDS)
    return record

def save_user(user_id, name, email):        # Write-Through
    with db.cursor() as cur:
        cur.execute("UPDATE users SET name=%s, email=%s WHERE id=%s", (name, email, user_id))
    db.commit()
    record = {"id": user_id, "name": name, "email": email}
    cache.set(f"user:{user_id}", json.dumps(record), ex=TTL_SECONDS)
    return record
```

**Phiên bản Node.js (node-redis v4):**

```javascript
import { createClient } from "redis";
const cache = createClient({ url: "rediss://master.democluster.xxxxxx.apse1.cache.amazonaws.com:6379" });
await cache.connect();

export async function getProduct(id) {
  const key = `product:${id}`;
  const hit = await cache.get(key);
  if (hit) return JSON.parse(hit);                 // cache hit
  const product = await db.findProductById(id);    // cache miss
  if (product) await cache.set(key, JSON.stringify(product), { EX: 300 });
  return product;
}
```

- **Invalidate thay vì update**: một biến thể phổ biến là khi ghi DB thì **xoá key** (`cache.delete(key)`) thay vì set giá trị mới; lần đọc sau sẽ lazy load lại. Đơn giản và tránh ghi sai thứ tự khi có nhiều writer đồng thời.
- **Cache stampede (thundering herd)**: key "nóng" hết hạn cùng lúc → hàng nghìn request cùng miss và cùng đánh vào DB. Cách giảm: thêm **jitter** vào TTL (ví dụ `300 + random(0, 60)`), hoặc dùng lock (`SET key NX`) để chỉ một request đi load DB.
- **Eviction policy**: tham số `maxmemory-policy` trong parameter group (mặc định ElastiCache là `volatile-lru`, chỉ evict key **có TTL**). Nếu nhiều key không có TTL và bộ nhớ đầy, ghi mới có thể lỗi → cân nhắc `allkeys-lru`.
- **Theo dõi** metric CloudWatch `Evictions`, `CacheHits`, `CacheMisses`, `DatabaseMemoryUsagePercentage`, `CurrConnections`. `Evictions` tăng liên tục → **scale up** (node lớn hơn) hoặc **scale out** (thêm shard).
- Phân biệt: **eviction** = cache tự loại item do thiếu bộ nhớ/TTL; **invalidation** = ứng dụng chủ động xoá/cập nhật item vì dữ liệu gốc đã đổi.

### Ghi nhớ cho kỳ thi

- **Lazy Loading = Cache-Aside = Lazy Population**: chỉ cache dữ liệu được đọc; read penalty; có thể stale.
- **Write-Through**: cập nhật cache khi ghi DB; không stale; write penalty; cache churn; thiếu dữ liệu → kết hợp Lazy Loading.
- Cache **nhỏ**, chỉ muốn dữ liệu được yêu cầu → **Lazy Loading**.
- **Đọc phải nhanh nhất cho mọi user, ghi được phép chậm** → **Write-Through**.
- Nhiều item bị xoá **trước khi hết hạn** → **Cache Evictions** → **scale up / scale out**.
- Nhận diện pseudocode: `get_` + `if record is None: db.query → cache.set` = Lazy Loading; `save_` + `db.query update → cache.set` = Write-Through.

---

## Bài 8 – Amazon MemoryDB

### Lý thuyết

- **Amazon MemoryDB for Redis** là **in-memory database bền vững (durable)**, **tương thích Redis**.
- Khác biệt cốt lõi:
  - **Redis (ElastiCache)**: mục đích chính là **cache**, có một chút durability.
  - **MemoryDB**: là **database thật sự**, chỉ là có **API tương thích Redis**.
- **Hiệu năng cực cao**: hơn **160 triệu request/giây**.
- Dữ liệu **in-memory**, nhưng **lưu trữ bền vững** nhờ **Multi-AZ transaction log**.
- Scale liền mạch từ **hàng chục GB tới hàng trăm TB**.
- Use case: **web và mobile app**, **online gaming**, **media streaming**… Ví dụ nhiều **microservice** cần truy cập một database in-memory tương thích Redis → MemoryDB: tốc độ in-memory + transaction log Multi-AZ cho **khôi phục nhanh** và **bền dữ liệu**.

### Kiến thức thực tế

| | ElastiCache (Redis OSS/Valkey) | MemoryDB |
|---|---|---|
| Vai trò | **Cache** trước một database chính | **Primary database** in-memory |
| Durability | Có thể mất dữ liệu gần nhất khi failover (replication bất đồng bộ) | **Bền**: ghi được xác nhận sau khi lưu vào **transaction log Multi-AZ** |
| Độ trễ ghi | Micro giây | Ghi chậm hơn một chút (vài ms) do phải ghi transaction log; đọc vẫn micro giây |
| Khi nào chọn | Tăng tốc đọc, session, giảm tải DB | Cần tốc độ Redis **và** không được mất dữ liệu, không muốn duy trì cache + DB riêng |

- **Đổi tên:** nay gọi là **Amazon MemoryDB** và hỗ trợ cả **Valkey** (từ 10/2024) bên cạnh Redis OSS. Đề thi có thể vẫn dùng tên "MemoryDB for Redis".
- MemoryDB chạy trong VPC, hỗ trợ ACL, TLS, snapshot; dùng client Redis/Valkey thông thường ở chế độ cluster.

### Ghi nhớ cho kỳ thi

- Cần **database in-memory tương thích Redis, bền vững, Multi-AZ** → **MemoryDB**.
- Chỉ cần **cache** → **ElastiCache**.

---

## Tổng kết chương

| Chủ đề | Điều cần nhớ |
|---|---|
| RDS | Managed SQL DB: PostgreSQL, MySQL, MariaDB, Oracle, SQL Server, Db2, Aurora; không SSH; storage auto scaling (cần max threshold) |
| Read Replicas | Tối đa 15, **ASYNC**, eventually consistent, cùng AZ/khác AZ/khác region, endpoint riêng, chỉ `SELECT`, promote được; cross-region mất phí |
| Multi-AZ | **SYNC**, DR, 1 DNS name, failover tự động, standby không đọc được; Single-AZ → Multi-AZ zero downtime; replica cũng bật Multi-AZ được |
| Aurora | MySQL/PostgreSQL compatible, 6 bản sao/3 AZ, 15 replica, failover < 30s, writer/reader endpoint, replica auto scaling, Global Database, Backtrack, Serverless v2 (v1 đã EOL) |
| Bảo mật RDS/Aurora | KMS at-rest (chọn lúc tạo; mã hoá DB cũ qua snapshot + copy + restore), TLS in-flight, **IAM DB Auth** (không cho Oracle), security group, audit log → CloudWatch Logs |
| RDS Proxy | Connection pooling (Lambda), giảm failover tới 66%, ép IAM auth + Secrets Manager, chỉ trong VPC, không đổi code |
| ElastiCache | Redis OSS/Valkey/Memcached; giảm tải DB, lưu session; phải sửa code; Redis: Multi-AZ, replica (cluster mode disabled tối đa 5), backup; Memcached: sharding, không HA |
| Chiến lược cache | Lazy Loading (read penalty, stale), Write-Through (write penalty, churn), TTL, Eviction (LRU) → scale up/out |
| MemoryDB | Database in-memory bền vững tương thích Redis/Valkey, transaction log Multi-AZ |

---

## Câu hỏi ôn tập

*Nguồn: Quiz – RDS, Aurora, & ElastiCache Quiz. Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Amazon RDS hỗ trợ các database sau, NGOẠI TRỪ:

- A. MongoDB
- B. MySQL
- C. MariaDB
- D. Microsoft SQL Server

<details><summary>Đáp án</summary>

**A.** RDS hỗ trợ MySQL, PostgreSQL, MariaDB, Oracle, MS SQL Server, IBM Db2 và Amazon Aurora. MongoDB là database NoSQL, không thuộc RDS (trên AWS có Amazon DocumentDB tương thích MongoDB).
</details>

**Câu 2.** Bạn lên kế hoạch cho một giải pháp cần database MySQL phải luôn sẵn sàng kể cả khi một Availability Zone gặp thảm hoạ. Bạn nên dùng gì?

- A. Tạo Read Replicas
- B. Bật Encryption
- C. Bật Multi-AZ

<details><summary>Đáp án</summary>

**C.** Multi-AZ giúp khi bạn lên kế hoạch DR cho trường hợp mất cả một AZ. Read Replicas không giúp DR, chúng dùng để scale đọc. Nếu muốn chống cả một Region bị sập, cần backup và replication sang Region khác.
</details>

**Câu 3.** Database RDS không đáp ứng nổi lượng request từ website. Hàng triệu người dùng chủ yếu đọc tin tức, và tin tức không được đăng thường xuyên. Giải pháp nào KHÔNG phù hợp với vấn đề này?

- A. Một ElastiCache Cluster
- B. RDS Multi-AZ
- C. RDS Read Replicas

<details><summary>Đáp án</summary>

**B.** Hãy đọc kỹ đề: câu hỏi hỏi giải pháp **KHÔNG** phù hợp. ElastiCache và RDS Read Replicas đều giúp scale đọc. Multi-AZ chỉ phục vụ HA/DR, standby không nhận traffic đọc.
</details>

**Câu 4.** Bạn đã thiết lập read replicas cho RDS, nhưng người dùng phàn nàn rằng sau khi cập nhật bài đăng mạng xã hội, họ không thấy bài đã cập nhật ngay. Nguyên nhân có thể là gì?

- A. Ứng dụng của bạn chắc chắn có bug
- B. Read Replicas dùng replication bất đồng bộ, nên người dùng nhiều khả năng chỉ đọc được dữ liệu eventually consistent
- C. Lẽ ra bạn nên dùng Multi-AZ

<details><summary>Đáp án</summary>

**B.** Replication bất đồng bộ khiến replica có độ trễ so với primary. Nếu cần đọc ngay sau khi ghi, request đó nên đọc từ primary.
</details>

**Câu 5.** Tính năng nào của RDS (KHÔNG phải Aurora) khi dùng không yêu cầu bạn đổi connection string SQL?

- A. Read Replicas
- B. Multi-AZ

<details><summary>Đáp án</summary>

**B.** Multi-AZ giữ nguyên connection string (một DNS name) bất kể database nào đang hoạt động. Read Replicas thêm các endpoint mới với DNS riêng, ứng dụng phải tham chiếu từng endpoint để cân bằng tải đọc.
</details>

**Câu 6.** Ứng dụng chạy trên nhóm EC2 do Auto Scaling Group quản lý, phía sau Application Load Balancer. Người dùng liên tục phải đăng nhập lại và bạn không muốn bật Sticky Sessions trên ALB vì sợ một số EC2 bị quá tải. Bạn nên làm gì?

- A. Dùng load balancer tự dựng trên EC2 thay cho ALB
- B. Lưu session data trong RDS
- C. Lưu session data trong ElastiCache
- D. Lưu session data trong một EBS volume dùng chung

<details><summary>Đáp án</summary>

**C.** Lưu session trong ElastiCache là pattern phổ biến để mọi EC2 đều lấy được trạng thái người dùng. RDS cũng lưu được nhưng không có hiệu năng cao như ElastiCache. EBS mặc định không gắn được vào nhiều EC2 (EBS Multi-Attach có nhiều giới hạn) và cũng không nhanh bằng ElastiCache.
</details>

**Câu 7.** Một ứng dụng analytics đang chạy query trực tiếp trên database RDS production. Các query chạy bất kỳ lúc nào trong ngày và làm chậm RDS, ảnh hưởng trải nghiệm người dùng. Bạn nên làm gì?

- A. Tạo Read Replica
- B. Bật Multi-AZ
- C. Chạy query analytics vào ban đêm

<details><summary>Đáp án</summary>

**A.** Ứng dụng analytics query trên Read Replica, không ảnh hưởng database production. Multi-AZ dùng cho HA, standby không phục vụ ứng dụng. Chạy ban đêm không phù hợp vì đề nói query chạy bất kỳ lúc nào.
</details>

**Câu 8.** Bạn chạy một ElastiCache Redis cluster và muốn đảm bảo nó có high availability. Bạn nên làm gì?

- A. Bật Lazy Loading
- B. Bật Multi-AZ

<details><summary>Đáp án</summary>

**B.** Multi-AZ (với read replica và auto-failover) giúp Redis chịu được sự cố node/AZ. Lazy Loading là chiến lược cache trong code, không liên quan đến HA.
</details>

**Câu 9.** Công ty có ứng dụng Node.js production dùng RDS MySQL 5.6. Một ứng dụng Java mới sẽ chạy workload analytics nặng để tạo dashboard mỗi giờ. Giải pháp tiết kiệm chi phí nhất để giảm ảnh hưởng tới ứng dụng chính là gì?

- A. Bật Multi-AZ cho RDS và chạy analytics trên standby database
- B. Tạo Read Replica ở AZ khác và chạy analytics trên replica
- C. Tạo Read Replica ở AZ khác và chạy analytics trên source database

<details><summary>Đáp án</summary>

**B.** Analytics chạy trên replica nên không ảnh hưởng DB chính; replication trong cùng region miễn phí. A sai vì standby Multi-AZ không truy cập được. C vẫn chạy trên DB nguồn nên không giải quyết vấn đề. (Lưu ý: MySQL 5.6 đã hết hỗ trợ trên RDS từ lâu; chi tiết này không ảnh hưởng đáp án.)
</details>

**Câu 10.** Bạn muốn xây dựng chiến lược disaster recovery cho RDS PostgreSQL để khi một Region gặp sự cố, database có thể nhanh chóng sẵn sàng cho cả đọc và ghi ở Region khác. Database DR phải có high availability. Bạn khuyến nghị gì?

- A. Tạo Read Replica cùng region và bật Multi-AZ cho database chính
- B. Tạo Read Replica cùng region và bật Multi-AZ cho Read Replica
- C. Tạo Read Replica ở region khác và bật Multi-AZ cho Read Replica
- D. Bật tuỳ chọn Multi-Region cho database chính

<details><summary>Đáp án</summary>

**C.** Read Replica ở Region khác có thể làm standby và được **promote** thành database production khi Region chính gặp sự cố. Bật Multi-AZ cho replica giúp DB ở Region đích có HA, đọc ghi đầy đủ sau khi promote. RDS không có tuỳ chọn "Multi-Region" như D.
</details>

**Câu 11.** Bạn đã migrate MySQL từ on-premises lên RDS. Có nhiều ứng dụng và developer làm việc với database. Mỗi developer có một IAM user trong tài khoản AWS của công ty. Cách phù hợp để cấp quyền truy cập RDS MySQL cho developer thay vì tạo DB user cho từng người là gì?

- A. Bật IAM Database Authentication
- B. Dùng Amazon Cognito
- C. Mặc định IAM user đã có quyền truy cập RDS database

<details><summary>Đáp án</summary>

**A.** IAM Database Authentication cho phép xác thực vào MySQL bằng auth token sinh từ IAM credentials (quyền `rds-db:connect`). Cognito dành cho người dùng cuối của ứng dụng web/mobile. IAM user mặc định không có quyền gì.
</details>

**Câu 12.** Phát biểu nào đúng về replication của RDS Read Replicas và Multi-AZ?

- A. Read Replica dùng replication bất đồng bộ, Multi-AZ dùng replication bất đồng bộ
- B. Read Replica dùng replication đồng bộ, Multi-AZ dùng replication bất đồng bộ
- C. Read Replica dùng replication đồng bộ, Multi-AZ dùng replication đồng bộ
- D. Read Replica dùng replication bất đồng bộ, Multi-AZ dùng replication đồng bộ

<details><summary>Đáp án</summary>

**D.** Read Replica = ASYNC (eventually consistent), Multi-AZ = SYNC (mọi ghi phải được sao sang standby).
</details>

**Câu 13.** Làm sao mã hoá một RDS DB instance đang không mã hoá?

- A. Làm trực tiếp trên Console: chọn RDS instance, Actions → Encrypt using KMS
- B. Tạo snapshot của RDS instance chưa mã hoá, copy snapshot và tick "Enable encryption", rồi restore RDS instance từ snapshot đã mã hoá
- C. Làm trực tiếp trên Console sau khi stop RDS instance

<details><summary>Đáp án</summary>

**B.** Không thể bật mã hoá trực tiếp cho instance đã tạo. Phải qua quy trình snapshot → copy có mã hoá → restore.
</details>

**Câu 14.** Với database RDS, bạn có thể có tối đa ...... Read Replicas.

- A. 5
- B. 15
- C. 7

<details><summary>Đáp án</summary>

**B. 15** (áp dụng cho MySQL, MariaDB, PostgreSQL; Oracle và SQL Server có giới hạn thấp hơn).
</details>

**Câu 15.** Công nghệ database RDS nào KHÔNG hỗ trợ IAM Database Authentication?

- A. Oracle
- B. PostgreSQL
- C. MySQL

<details><summary>Đáp án</summary>

**A. Oracle.** IAM Database Authentication hỗ trợ MySQL, MariaDB, PostgreSQL (và Aurora MySQL/PostgreSQL).
</details>

**Câu 16.** Bạn có một RDS DB instance không mã hoá và muốn tạo Read Replicas. Có thể cấu hình Read Replicas được mã hoá không?

- A. Có
- B. Không

<details><summary>Đáp án</summary>

**B.** Không thể tạo Read Replica mã hoá từ một RDS instance không mã hoá. Phải mã hoá instance nguồn trước (qua snapshot + copy + restore).
</details>

**Câu 17.** Một Aurora DB Cluster có thể có bao nhiêu Aurora Read Replicas?

- A. 5
- B. 10
- C. 15

<details><summary>Đáp án</summary>

**C. 15.**
</details>

**Câu 18.** Amazon Aurora hỗ trợ cả hai loại database ......

- A. MySQL và MariaDB
- B. Oracle và MariaDB
- C. MySQL và PostgreSQL
- D. Oracle và MS SQL Server

<details><summary>Đáp án</summary>

**C.** Aurora tương thích MySQL và PostgreSQL.
</details>

**Câu 19.** Số Read Replica tối đa bạn có thể thêm vào một ElastiCache Redis Cluster ở chế độ Cluster-Mode Disabled là bao nhiêu?

- A. 3
- B. 4
- C. 5

<details><summary>Đáp án</summary>

**C. 5.** Cluster mode disabled có 1 shard gồm 1 primary node và tối đa 5 read replica.
</details>

**Câu 20.** Bạn có một ElastiCache Redis Cluster phục vụ ứng dụng phổ biến. Bạn nhận thấy rất nhiều request đi xuống database vì nhiều item bị loại khỏi cache trước khi hết hạn. Hiện tượng này gọi là gì và cách xử lý?

- A. Cache Evictions, scale up hoặc scale out ElastiCache Redis Cluster
- B. Cache Invalidations, scale up hoặc scale out ElastiCache Redis Cluster
- C. Cache Evictions, scale down hoặc scale in ElastiCache Cluster
- D. Cache Invalidations, scale down hoặc scale in ElastiCache Cluster

<details><summary>Đáp án</summary>

**A.** Item bị loại khỏi cache do bộ nhớ đầy (LRU) trước khi hết TTL gọi là **eviction**. Cách xử lý là tăng dung lượng cache: **scale up** (node lớn hơn) hoặc **scale out** (thêm shard). Invalidation là việc ứng dụng chủ động xoá/cập nhật dữ liệu, không phải hiện tượng này.
</details>

**Câu 21.** Bạn có một ElastiCache cluster với dung lượng nhỏ, nên muốn đảm bảo chỉ dữ liệu được yêu cầu mới được nạp vào cluster. Nên dùng chiến lược caching nào?

- A. Write Through
- B. Lazy Loading
- C. Time-To-Live (TTL)

<details><summary>Đáp án</summary>

**B.** Lazy Loading chỉ nạp dữ liệu vào cache khi cần (khi dữ liệu thực sự được đọc từ database). Write Through thêm/cập nhật dữ liệu vào cache mỗi khi ghi database, kể cả dữ liệu không ai đọc (cache churn).
</details>

**Câu 22.** Bạn host một website động có ElastiCache Cluster phía trước. Yêu cầu là giữ độ trễ thấp nhất cho mọi request đọc của mọi người dùng; ghi được phép lâu hơn. Bạn khuyến nghị chiến lược caching nào?

- A. Cache Aside
- B. Time-To-Live (TTL)
- C. Write Through

<details><summary>Đáp án</summary>

**C.** Write Through làm ghi lâu hơn (write penalty), nhưng đọc nhanh và dữ liệu trong cache luôn mới. Cache Aside giống Lazy Loading, có read penalty khi cache miss nên không đảm bảo độ trễ thấp cho **mọi** request đọc.
</details>

---

[← Chương 07](ch07-aws-fundamentals-elb-asg.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Chương 09 →](ch09-route-53.md)
