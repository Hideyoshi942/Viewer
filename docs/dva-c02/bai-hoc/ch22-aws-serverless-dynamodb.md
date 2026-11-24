# Chương 22 – AWS Serverless: DynamoDB

> **Nguồn:** 25 video của chương + *DynamoDB Quiz* (27 câu).
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay (2026). Kỳ thi hiện hành là **DVA-C02**; DynamoDB là một trong những chủ đề nặng ký nhất của đề.

## Mục tiêu chương

Sau chương này bạn có thể:

- Giải thích DynamoDB là gì, khác RDS (SQL) ra sao, và **chọn Primary Key** (Partition Key hoặc Partition Key + Sort Key) sao cho dữ liệu phân tán tốt.
- Phân biệt **Provisioned** và **On-Demand**, **tính RCU/WCU** (kể cả eventually/strongly consistent và transactional), hiểu throttling, hot partition.
- Dùng đúng các API: `PutItem`, `UpdateItem`, `GetItem`, `Query`, `Scan`, `DeleteItem`, `DeleteTable`, `BatchWriteItem`, `BatchGetItem`, PartiQL.
- Viết **Condition Expression**, cài đặt **Optimistic Locking**, phân biệt concurrent / conditional / atomic / batch writes.
- Thiết kế **LSI** và **GSI**, hiểu hệ quả throttling của GSI.
- Dùng **DAX**, **DynamoDB Streams** + Lambda, **TTL**, **Transactions**.
- Áp dụng các mẫu kiến trúc: session state, write sharding, DynamoDB + S3, dọn/copy bảng.
- Bảo mật DynamoDB: VPC Endpoint, KMS, backup/PITR, Global Tables, **fine-grained access control** với `dynamodb:LeadingKeys`.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001–003 | Section Introduction, DynamoDB Overview, Basics – Hands On | Bài 1 – Tổng quan DynamoDB và Primary Key |
| 004–005 | WCU & RCU – Throughput | Bài 2 – Capacity Modes, RCU/WCU và Partition |
| 006–007 | Basic Operations, Basic APIs – Hands On | Bài 3 – Các API cơ bản |
| 008 | Conditional Writes | Bài 4 – Conditional Writes |
| 009–010 | Indexes (GSI + LSI) | Bài 5 – Local & Global Secondary Index |
| 011 | DynamoDB PartiQL | Bài 6 – PartiQL |
| 012 | DynamoDB Optimistic Locking | Bài 7 – Optimistic Locking |
| 013–014 | DynamoDB DAX | Bài 8 – DynamoDB Accelerator (DAX) |
| 015–016 | DynamoDB Streams | Bài 9 – DynamoDB Streams |
| 017 | DynamoDB TTL | Bài 10 – Time To Live (TTL) |
| 018 | DynamoDB CLI | Bài 11 – Các tuỳ chọn CLI hay gặp |
| 019 | DynamoDB Transactions | Bài 12 – Transactions |
| 020 | DynamoDB Session State | Bài 13 – Lưu Session State |
| 021 | DynamoDB Partitioning Strategies | Bài 14 – Write Sharding |
| 022 | Conditional Writes, Concurrent Writes & Atomic Writes | Bài 15 – Các kiểu ghi dữ liệu |
| 023 | DynamoDB Patterns with S3 | Bài 16 – Mẫu kiến trúc DynamoDB + S3 |
| 024 | DynamoDB Operations | Bài 17 – Dọn dẹp và sao chép bảng |
| 025 | DynamoDB Security & Other | Bài 18 – Bảo mật và các tính năng khác |
| Quiz | DynamoDB Quiz | Câu hỏi ôn tập |

---

## Bài 1 – Tổng quan DynamoDB và Primary Key

### Lý thuyết

#### Kiến trúc truyền thống và giới hạn của RDBMS

- Kiến trúc quen thuộc: Client → ELB → EC2 (Auto Scaling Group) → **RDS** (MySQL, PostgreSQL…).
- RDBMS mạnh nhờ **SQL**: có schema chặt chẽ, **JOIN**, **aggregation** (SUM, AVG…), tính toán phức tạp.
- Nhưng khả năng mở rộng chủ yếu là **vertical scaling** (đổi máy mạnh hơn: CPU, RAM, IO).
- Horizontal scaling chỉ có ở chiều **đọc** (thêm Read Replicas), và bị giới hạn số replica. **Không** scale ngang được chiều **ghi**.

#### NoSQL

- **NoSQL** ("not only SQL" / "non-SQL"): cơ sở dữ liệu **phi quan hệ**, **phân tán**, nên **scale ngang** (horizontal) được cả đọc lẫn ghi. Ví dụ: MongoDB, DynamoDB.
- Để đơn giản hoá, coi như NoSQL **không hỗ trợ JOIN** và **không có aggregation** (SUM, AVG…). Mọi dữ liệu cần cho một truy vấn nên nằm trong **một item (row)**.
- Không có đúng/sai tuyệt đối giữa SQL và NoSQL: tuỳ cách mô hình hoá dữ liệu, kiểu truy vấn và nhu cầu scale.

#### DynamoDB là gì

| Đặc điểm | Mô tả |
|---|---|
| Loại | NoSQL, **fully managed**, **serverless** |
| Sẵn sàng cao | Tự động replicate qua **nhiều AZ** |
| Quy mô | Hàng triệu request/giây, hàng nghìn tỷ item, hàng trăm TB |
| Hiệu năng | Nhanh và **ổn định**, độ trễ thấp (mili-giây một chữ số) |
| Bảo mật | Tích hợp **IAM** cho xác thực, phân quyền, quản trị |
| Event-driven | **DynamoDB Streams** |
| Chi phí | Thấp, có **auto scaling** |
| Table class | **Standard** và **Standard-IA** (Infrequent Access) |

#### Thành phần cơ bản

- Dữ liệu tổ chức thành **table**; bạn chỉ tạo table chứ **không tạo database** (database đã có sẵn theo **region**).
- Mỗi table có **Primary Key**, **phải chọn trước khi tạo bảng** (không đổi được sau đó).
- Mỗi table có số **item** (row) không giới hạn. Mỗi item có các **attribute** (giống cột nhưng mạnh hơn):
  - Có thể **lồng nhau** (nested).
  - Có thể **thêm dần theo thời gian**, không cần khai báo trước.
  - Có thể **thiếu** (null) ở một số item.
- **Kích thước tối đa một item: 400 KB.**
- Kiểu dữ liệu:

| Nhóm | Kiểu |
|---|---|
| Scalar | String (`S`), Number (`N`), Binary (`B`), Boolean (`BOOL`), Null (`NULL`) |
| Document | List (`L`), Map (`M`) |
| Set | String Set (`SS`), Number Set (`NS`), Binary Set (`BS`) |

#### Hai lựa chọn Primary Key

| | Option 1: Partition Key (HASH) | Option 2: Partition Key + Sort Key (HASH + RANGE) |
|---|---|---|
| Tính duy nhất | Partition Key phải **duy nhất** cho mỗi item | **Tổ hợp** Partition Key + Sort Key phải duy nhất |
| Ví dụ | Bảng `Users`: PK = `User_ID` | Bảng `Users-Games`: PK = `User_ID`, SK = `Game_ID` |
| Ghi chú | Partition Key phải đủ đa dạng để dữ liệu phân tán | Dữ liệu được **nhóm theo Partition Key**, sắp xếp theo Sort Key; nhiều item có thể chung Partition Key |

Ví dụ bảng `Users-Games`:

| User_ID (PK) | Game_ID (SK) | Score | Result |
|---|---|---|---|
| 7791a3d6… | 4421 | 92 | Win |
| 873e0634… | 4521 | 77 | Win |
| 873e0634… | 1894 | 14 | Lose |

Hai dòng cuối **cùng Partition Key**, khác Sort Key, nên hợp lệ (một user chơi nhiều game).

#### Bài tập chọn Partition Key

Xây dựng cơ sở dữ liệu phim, chọn Partition Key nào để **phân tán dữ liệu tốt nhất**?

- `movie_id` ✅: duy nhất cho mỗi phim, **cardinality cao nhất**.
- `producer_name`, `leader_actor_name`: lặp lại nhiều.
- `movie_language` ❌: rất ít giá trị và lệch (đa số là tiếng Anh), gây **skew**.

> Quy tắc: chọn attribute có **cardinality cao nhất**, nhận **nhiều giá trị khác nhau nhất**.

### Kiến thức thực tế

- Đặt timestamp dạng **ISO 8601** (`2021-10-09T12:34:09Z`) làm Sort Key kiểu String: sắp xếp theo chuỗi cũng đúng theo thời gian, và dùng được `begins_with(post_ts, "2021-10")`.
- Ví dụ Python (boto3) dùng `resource` để khỏi viết kiểu `{"S": ...}`:

  ```python
  import boto3
  table = boto3.resource("dynamodb", region_name="ap-southeast-1").Table("Users")
  table.put_item(Item={"user_id": "john123", "first_name": "John", "last_name": "Doe"})
  print(table.get_item(Key={"user_id": "john123"})["Item"])
  ```

- Node.js (SDK v3) dùng `DynamoDBDocumentClient` cho tiện:

  ```javascript
  import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
  import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
  const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  await doc.send(new PutCommand({ TableName: "Users", Item: { user_id: "john123", first_name: "John" } }));
  ```

- **Free Tier** của DynamoDB (với chương trình free tier cũ) là 25 GB lưu trữ + 25 RCU + 25 WCU provisioned. Tài khoản tạo từ **15/07/2025** áp dụng mô hình Free Tier mới (dựa trên credit), nên hãy kiểm tra lại trang Free Tier của tài khoản bạn.
- **Deletion protection** (có từ 2023): bật trên bảng production để tránh xoá nhầm (`--deletion-protection-enabled`).
- Item 400 KB tính **cả tên attribute** lẫn giá trị. Đặt tên attribute ngắn giúp tiết kiệm dung lượng và RCU/WCU.
- Standard-IA giảm khoảng 60% chi phí lưu trữ nhưng đọc/ghi đắt hơn; phù hợp bảng lớn, ít truy cập (log cũ, lịch sử đơn hàng).

### Ghi nhớ cho kỳ thi

- DynamoDB: **NoSQL, serverless, scale ngang**, multi-AZ, item tối đa **400 KB**.
- Không cần (và không thể) provision EC2/server cho DynamoDB.
- Primary Key: **Partition Key** (duy nhất) hoặc **Partition Key + Sort Key** (tổ hợp duy nhất).
- Chọn Partition Key có **cardinality cao nhất** (ví dụ `movie_id`, `blog_id`), tránh attribute ít giá trị (ngôn ngữ, quốc gia, trạng thái).

---

## Bài 2 – Capacity Modes, RCU/WCU và Partition

### Lý thuyết

#### Hai capacity mode

| | **Provisioned** (mặc định) | **On-Demand** |
|---|---|---|
| Cách hoạt động | Khai báo trước số **RCU/WCU** mỗi giây | Tự scale lên/xuống theo tải |
| Lập kế hoạch | Cần ước lượng trước; có thể bật **Auto Scaling** | Không cần capacity planning |
| Tính tiền | Trả theo **capacity đã provision** mỗi giờ (dùng hay không cũng trả) | Trả theo **request thực tế**: RRU (Read Request Unit), WRU (Write Request Unit) |
| Giá | Rẻ hơn khi tải ổn định | Đắt hơn (video: khoảng 2,5 lần, thực tế đã thay đổi, xem phần Kiến thức thực tế) |
| Phù hợp | Tải **ổn định, dự đoán được** | Tải **không dự đoán được**, tăng đột biến, môi trường dev ít dùng |

- Video nói chuyển đổi giữa 2 mode được **1 lần mỗi 24 giờ** (xem cập nhật bên dưới).

#### Provisioned mode chi tiết

- Phải provision **RCU** (Read Capacity Units, throughput đọc) và **WCU** (Write Capacity Units, throughput ghi). RCU và WCU **độc lập** với nhau, tăng/giảm riêng được.
- Có thể bật **Auto Scaling**: đặt min, max và **target utilization** (%), DynamoDB tự điều chỉnh.
- Vượt RCU/WCU tạm thời thì dùng **burst capacity**. Hết burst thì nhận **`ProvisionedThroughputExceededException`**; cần retry với **exponential backoff**.

#### Write Capacity Unit (WCU)

> **1 WCU = 1 lần ghi/giây cho item tối đa 1 KB.** Item lớn hơn thì **làm tròn lên KB kế tiếp**.

**Công thức:** `WCU = (số item ghi/giây) × ceil(kích thước item / 1 KB)`

| Ví dụ | Tính | Kết quả |
|---|---|---|
| 10 item/giây, mỗi item 2 KB | 10 × (2 / 1) | **20 WCU** |
| 6 item/giây, mỗi item 4,5 KB | 4,5 KB làm tròn thành 5 KB: 6 × (5 / 1) | **30 WCU** |
| 120 item/**phút**, mỗi item 2 KB | 120 / 60 = 2 item/giây: 2 × (2 / 1) | **4 WCU** |

#### Strongly Consistent và Eventually Consistent Read

- DynamoDB có nhiều server phía sau; dữ liệu ghi vào một server rồi được **replicate** sang các server khác.
- **Eventually Consistent Read** (**mặc định**): đọc ngay sau khi ghi có thể nhận **dữ liệu cũ (stale)** vì replication chưa xong (thường khoảng dưới 1 giây).
- **Strongly Consistent Read**: luôn nhận dữ liệu mới nhất vừa ghi. Bật bằng tham số **`ConsistentRead = true`** trong `GetItem`, `BatchGetItem`, `Query`, `Scan`.
- Strongly consistent **tốn gấp đôi RCU** và có thể **độ trễ cao hơn** một chút.

#### Read Capacity Unit (RCU)

> **1 RCU = 1 Strongly Consistent Read/giây, hoặc 2 Eventually Consistent Read/giây, cho item tối đa 4 KB.** Item lớn hơn thì **làm tròn lên bội số 4 KB kế tiếp**.

**Công thức:**

- Strongly: `RCU = (số lần đọc/giây) × ceil(kích thước / 4 KB)`
- Eventually: `RCU = (số lần đọc/giây / 2) × ceil(kích thước / 4 KB)`

| Ví dụ | Tính | Kết quả |
|---|---|---|
| 10 strongly consistent read/giây, item 4 KB | 10 × (4 / 4) | **10 RCU** |
| 16 eventually consistent read/giây, item 12 KB | (16 / 2) × (12 / 4) | **24 RCU** |
| 10 strongly consistent read/giây, item 6 KB | 6 KB làm tròn thành 8 KB: 10 × (8 / 4) | **20 RCU** |

> Mẹo: với WCU làm tròn theo **1 KB**, với RCU làm tròn theo **4 KB**. Đọc eventually thì **chia 2**.

#### Partition bên trong DynamoDB

- Mỗi table gồm nhiều **partition**: các bản dữ liệu nằm trên các server cụ thể.
- Khi ghi, **Partition Key** đi qua một **hàm băm (hash function)** nội bộ để quyết định item nằm ở partition nào (ví dụ `ID_13` → Partition 1, `ID_45` → Partition 2).
- Công thức số partition (**không cần thuộc cho kỳ thi**):
  - Theo capacity: `RCU / 3000 + WCU / 1000`
  - Theo dung lượng: `Tổng dung lượng / 10 GB`
  - Số partition = `ceil(max(theo capacity, theo dung lượng))`
- **Điều cần nhớ**: RCU/WCU được **chia đều cho các partition**. Ví dụ 10 partition, provision 10 RCU + 10 WCU thì mỗi partition chỉ có 1 RCU + 1 WCU.

#### Throttling

- Vượt RCU/WCU **ở cấp partition** cũng gây `ProvisionedThroughputExceededException`, kể cả khi tổng của bảng chưa vượt.
- Nguyên nhân:
  - **Hot key**: một Partition Key bị đọc quá nhiều (ví dụ item phổ biến).
  - **Hot partition**.
  - **Item quá lớn** (RCU/WCU phụ thuộc kích thước item).
- Giải pháp:
  - **Exponential backoff** (SDK đã tích hợp sẵn).
  - **Phân tán Partition Key** tốt hơn.
  - Vấn đề về RCU (đọc nhiều một item) thì dùng **DynamoDB Accelerator (DAX)**.

#### On-Demand mode

- Tự động nhận mọi lượt đọc/ghi, scale lên/xuống theo tải; **không** khai báo RCU/WCU; video coi như "không giới hạn, không throttle".
- Tính tiền theo **RRU / WRU**; **cách tính đơn vị giống RCU/WCU**.
- Dùng cho tải **không biết trước** hoặc **không dự đoán được**.

### Kiến thức thực tế

- **Cập nhật giá (11/2024):** AWS **giảm 50% giá throughput On-Demand**. Vì vậy tỉ lệ "On-Demand đắt hơn khoảng 2,5 lần (hoặc 7 lần)" trong video **không còn chính xác**. Hiện On-Demand là lựa chọn mặc định được AWS khuyến nghị cho đa số workload mới; Provisioned + Auto Scaling vẫn rẻ hơn khi tải ổn định và sử dụng cao. Đề thi vẫn theo logic: tải ổn định thì Provisioned, khó đoán thì On-Demand.
- **Cập nhật chuyển mode:** theo tài liệu hiện tại, chuyển từ Provisioned sang On-Demand được tối đa **4 lần trong 24 giờ** (cửa sổ trượt); chuyển từ On-Demand về Provisioned **lúc nào cũng được**. Quy tắc "1 lần/24 giờ" trong video đã cũ.
- On-Demand **không phải vô hạn tuyệt đối**: vẫn có giới hạn theo partition và giới hạn throughput mặc định của bảng; nếu tải tăng hơn gấp đôi đỉnh trước đó trong thời gian rất ngắn vẫn có thể bị throttle. Từ 2024 có thể đặt **maximum throughput** cho bảng On-Demand để chặn chi phí, và tính năng **warm throughput** để "làm ấm" bảng trước sự kiện lớn.
- Giới hạn **mỗi partition**: khoảng **3.000 RCU**, **1.000 WCU**, **10 GB**.
- **Burst capacity**: DynamoDB giữ lại tối đa **300 giây** capacity chưa dùng để dùng khi đột biến.
- **Adaptive capacity** (tự động, miễn phí): DynamoDB tự dồn throughput cho partition "nóng" và có thể tách item hay truy cập ra partition riêng. Giảm bớt vấn đề hot partition nhưng **không thay thế** việc thiết kế key tốt.
- Theo dõi throttling bằng CloudWatch: `ReadThrottleEvents`, `WriteThrottleEvents`, `ConsumedReadCapacityUnits`, `ConsumedWriteCapacityUnits`. Dùng **CloudWatch Contributor Insights for DynamoDB** để tìm hot key.
- Xem RCU/WCU thực tế một request đã tốn bằng `ReturnConsumedCapacity`:

  ```bash
  aws dynamodb get-item --table-name Users --key '{"user_id":{"S":"john123"}}' \
    --consistent-read --return-consumed-capacity TOTAL
  ```

- Retry trong boto3:

  ```python
  from botocore.config import Config
  ddb = boto3.client("dynamodb", config=Config(retries={"max_attempts": 10, "mode": "adaptive"}))
  ```

### Ghi nhớ cho kỳ thi

- **WCU: 1 KB/ghi/giây, làm tròn lên 1 KB.** **RCU: 4 KB, 1 strongly hoặc 2 eventually/giây, làm tròn lên 4 KB.** Nhớ đổi "mỗi phút" thành "mỗi giây".
- Đọc mặc định là **eventually consistent**; muốn strongly thì `ConsistentRead=true` (tốn gấp đôi).
- RCU/WCU **chia đều cho các partition**. `ProvisionedThroughputExceededException` dù chưa vượt tổng capacity thì nghĩ ngay đến **hot partition / hot key**.
- Xử lý throttle: **exponential backoff**, phân tán key, đọc nhiều một key thì **DAX**.
- Tải ổn định (production) → **Provisioned + Auto Scaling**; tải không dự đoán được (dev) → **On-Demand**.

---

## Bài 3 – Các API cơ bản

### Lý thuyết

#### Ghi dữ liệu

| API | Ý nghĩa |
|---|---|
| **`PutItem`** | Tạo item mới, hoặc **thay thế toàn bộ** item có cùng Primary Key. Tốn WCU |
| **`UpdateItem`** | **Sửa một số attribute** của item có sẵn, hoặc tạo item mới nếu chưa có. Dùng được cho **Atomic Counter** |
| **Conditional Writes** | Chỉ chấp nhận write/update/delete nếu **điều kiện** thoả. Giúp xử lý truy cập đồng thời. Không tốn thêm chi phí riêng |

#### Đọc dữ liệu

**`GetItem`**

- Đọc theo **Primary Key** (HASH hoặc HASH + RANGE).
- Mặc định **eventually consistent**; có thể chọn **strongly consistent** (tốn RCU hơn, độ trễ có thể cao hơn).
- **`ProjectionExpression`**: chỉ lấy **một số attribute**.

**`Query`**

- Trả về item dựa trên **`KeyConditionExpression`**:
  - **Partition Key**: bắt buộc, chỉ dùng toán tử **`=`**.
  - **Sort Key** (tuỳ chọn): `=`, `<`, `<=`, `>`, `>=`, `BETWEEN`, `begins_with`.
- **`FilterExpression`**: lọc thêm **sau khi Query chạy, trước khi trả về** cho client. Chỉ dùng với **non-key attribute** (không dùng với HASH/RANGE).
- Trả về danh sách item, tối đa theo tham số **`Limit`** hoặc tối đa **1 MB** dữ liệu mỗi lần. Muốn thêm thì **phân trang** (pagination).
- Query được trên **table**, **LSI** hoặc **GSI**.

**`Scan`**

- Đọc **toàn bộ bảng**, rồi mới lọc (bạn có thể lọc, nhưng hiệu quả kém vì đã đọc hết). Dùng khi cần "export" toàn bảng.
- Mỗi lần trả tối đa **1 MB**; dùng pagination để đọc tiếp.
- **Tốn rất nhiều RCU**. Để giảm ảnh hưởng tới hoạt động bình thường: dùng **`Limit`** hoặc giảm kích thước kết quả và nghỉ giữa các lần gọi.
- Muốn scan **nhanh nhất**: **Parallel Scan**: nhiều worker quét nhiều **segment** cùng lúc, tăng throughput và RCU tiêu thụ. Vẫn có thể kết hợp `Limit` để hạn chế ảnh hưởng.
- Dùng được với `ProjectionExpression` và `FilterExpression`.

> Lưu ý: `FilterExpression` chạy phía **server** của DynamoDB nhưng **sau khi đã đọc dữ liệu**, nên RCU tính theo dữ liệu đã đọc chứ không phải dữ liệu trả về. (Trong console, bộ lọc của Scan được giảng viên mô tả là "client side", ý là không giảm chi phí đọc.)

#### Xoá dữ liệu

| API | Ý nghĩa |
|---|---|
| **`DeleteItem`** | Xoá một item; có thể **xoá có điều kiện** (ví dụ chỉ xoá nếu `money = 0`) |
| **`DeleteTable`** | Xoá **cả bảng và mọi item**. **Nhanh hơn rất nhiều** so với Scan rồi xoá từng item |

#### Batch operations

- Giảm số lần gọi API, giảm độ trễ; các thao tác trong batch được DynamoDB thực hiện **song song**.
- Một phần batch có thể **thất bại**: bạn nhận lại phần thất bại để retry.

| API | Giới hạn | Phần thất bại | Ghi chú |
|---|---|---|---|
| **`BatchWriteItem`** | Tối đa **25** `PutItem` và/hoặc `DeleteItem` mỗi lần; tối đa **16 MB** tổng; mỗi item vẫn tối đa 400 KB | **`UnprocessedItems`** | **Không** hỗ trợ `UpdateItem` |
| **`BatchGetItem`** | Tối đa **100 item**, **16 MB**; đọc từ **một hoặc nhiều bảng** | **`UnprocessedKeys`** | Lấy song song để giảm độ trễ |

- Xử lý phần thất bại (thường do thiếu capacity): retry bằng **exponential backoff**, hoặc nếu xảy ra thường xuyên thì **tăng WCU/RCU**.

#### PartiQL

- Dùng cú pháp **SQL** để thao tác DynamoDB: `SELECT`, `INSERT`, `UPDATE`, `DELETE`.

  ```sql
  SELECT OrderID, Total FROM "Orders" WHERE OrderID IN [1, 2, 3] ORDER BY OrderID DESC
  ```

- Chạy được trên nhiều bảng nhưng **không hỗ trợ JOIN**.
- Chạy từ Management Console, **NoSQL Workbench for DynamoDB**, DynamoDB API, CLI, SDK.
- **Không thêm khả năng mới**, chỉ là cách viết bằng SQL cho các thao tác sẵn có.

### Kiến thức thực tế

- `UpdateItem` hỗ trợ 4 mệnh đề trong `UpdateExpression`: **`SET`**, **`REMOVE`**, **`ADD`** (số/set), **`DELETE`** (xoá phần tử khỏi set).
- Tên attribute trùng **reserved word** (`name`, `status`, `date`, `timestamp`, `size`…) phải dùng placeholder `ExpressionAttributeNames`:

  ```bash
  aws dynamodb get-item --table-name Users --key '{"user_id":{"S":"john123"}}' \
    --projection-expression "#n, age" --expression-attribute-names '{"#n":"name"}'
  ```

- Query và phân trang bằng boto3:

  ```python
  from boto3.dynamodb.conditions import Key, Attr
  table = boto3.resource("dynamodb").Table("UserPosts")
  kwargs = {"KeyConditionExpression": Key("user_id").eq("john123") & Key("post_ts").begins_with("2021"),
            "FilterExpression": Attr("content").contains("yay"),
            "ScanIndexForward": False}  # sắp xếp giảm dần theo sort key
  while True:
      resp = table.query(**kwargs)
      for item in resp["Items"]:
          print(item)
      if "LastEvaluatedKey" not in resp:
          break
      kwargs["ExclusiveStartKey"] = resp["LastEvaluatedKey"]
  ```

- Parallel Scan: chia bảng thành `TotalSegments` phần, mỗi worker xử lý một `Segment`:

  ```bash
  aws dynamodb scan --table-name UserPosts --total-segments 4 --segment 0
  ```

- Retry `UnprocessedItems` trong `BatchWriteItem`: boto3 `table.batch_writer()` đã tự chia lô 25 và tự retry phần chưa xử lý:

  ```python
  with table.batch_writer() as batch:
      for i in range(1000):
          batch.put_item(Item={"user_id": f"u{i}", "post_ts": "2026-01-01T00:00:00Z"})
  ```

- `PutItem` mặc định **ghi đè âm thầm** nếu trùng key. Muốn chỉ tạo mới thì dùng `ConditionExpression="attribute_not_exists(user_id)"` (Bài 4).
- `ReturnValues` (`ALL_OLD`, `UPDATED_NEW`…) cho phép nhận lại giá trị cũ/mới ngay trong response, khỏi phải `GetItem` thêm lần nữa.

### Ghi nhớ cho kỳ thi

- `PutItem` = **thay toàn bộ**; `UpdateItem` = **sửa một phần**.
- Chỉ lấy một số attribute: **`ProjectionExpression`**. Lọc kết quả đọc: **`FilterExpression`** (không giảm RCU).
- Query: Partition Key phải `=`; Sort Key dùng được `<, >, BETWEEN, begins_with`.
- Scan nhanh hơn: **Parallel Scan**. Giảm ảnh hưởng: **`Limit`**.
- Xoá toàn bộ dữ liệu: **`DeleteTable`** rồi tạo lại.
- `BatchWriteItem`: 25 thao tác, 16 MB, **không có Update**, trả `UnprocessedItems`. `BatchGetItem`: 100 item, 16 MB, trả `UnprocessedKeys`.
- PartiQL = SQL cho DynamoDB, **không JOIN**.

---

## Bài 4 – Conditional Writes

### Lý thuyết

- Áp dụng cho **`PutItem`**, **`UpdateItem`**, **`DeleteItem`**, **`BatchWriteItem`** (theo slide; xem ghi chú bên dưới) và **`TransactWriteItems`**.
- Dùng **`ConditionExpression`** để quyết định item nào được sửa.
- Các hàm/toán tử điều kiện:

| Nhóm | Hàm/toán tử |
|---|---|
| Tồn tại / kiểu | `attribute_exists`, `attribute_not_exists`, `attribute_type` |
| Chuỗi | `contains`, `begins_with` |
| Giá trị | `IN` (ví dụ `ProductCategory IN (:cat1, :cat2)`), `BETWEEN :low AND :high`, `=`, `<>`, `<`, `>`, `<=`, `>=` |
| Độ dài | `size` (độ dài chuỗi, số phần tử list/map…) |

- **Phân biệt**:

| | Filter Expression | Condition Expression |
|---|---|---|
| Dùng cho | **Đọc** (Query, Scan) | **Ghi** (Put/Update/Delete) |
| Tác dụng | Lọc kết quả đọc | Quyết định thao tác ghi **thành công hay không** |

#### Các ví dụ trong video (bảng `ProductCatalog`)

**1. Update có điều kiện: giảm giá chỉ khi giá còn lớn hơn ngưỡng**

```bash
aws dynamodb update-item \
  --table-name ProductCatalog \
  --key '{"Id": {"N": "456"}}' \
  --update-expression "SET Price = Price - :discount" \
  --condition-expression "Price > :limit" \
  --expression-attribute-values file://values.json
```

```json
{
  ":discount": { "N": "150" },
  ":limit":    { "N": "500" }
}
```

- Item `456` có `Price = 650`. Lần 1: 650 > 500 nên cập nhật, giá còn **500**.
- Lần 2: 500 > 500 là **false**, nên **không cập nhật** (lỗi `ConditionalCheckFailedException`). Giá không bao giờ xuống dưới 500.

**2. `attribute_not_exists`: chỉ xoá sản phẩm chưa có giá**

```bash
aws dynamodb delete-item --table-name ProductCatalog \
  --key '{"Id": {"N": "456"}}' \
  --condition-expression "attribute_not_exists(Price)"
```

**3. `attribute_exists`: chỉ xoá nếu sản phẩm có review 1 sao**

```bash
aws dynamodb delete-item --table-name ProductCatalog \
  --key '{"Id": {"N": "456"}}' \
  --condition-expression "attribute_exists(ProductReviews.OneStar)"
```

**4. Không bao giờ ghi đè item đã tồn tại**

- Chỉ có Partition Key: `attribute_not_exists(partition_key)`.
- Có cả Sort Key: `attribute_not_exists(partition_key) AND attribute_not_exists(sort_key)`.
- Nếu item đã có thì điều kiện false, không ghi đè; nếu chưa có thì ghi.

**5. `IN` và `BETWEEN`**

```bash
aws dynamodb delete-item --table-name ProductCatalog \
  --key '{"Id": {"N": "456"}}' \
  --condition-expression "(ProductCategory IN (:cat1, :cat2)) AND (Price BETWEEN :lo AND :hi)" \
  --expression-attribute-values file://values.json
```

```json
{
  ":cat1": { "S": "Sporting Goods" },
  ":cat2": { "S": "Gardening Supplies" },
  ":lo":   { "N": "500" },
  ":hi":   { "N": "600" }
}
```

- Item thuộc "Sporting Goods" (thoả vế 1) nhưng `Price = 650` không nằm trong 500–600, nên **cả điều kiện false**, **không xoá**.

**6. So sánh chuỗi: xoá ảnh không an toàn (`http://`)**

```bash
aws dynamodb delete-item --table-name ProductCatalog \
  --key '{"Id": {"N": "456"}}' \
  --condition-expression "begins_with(Pictures.FrontView, :v_sub)" \
  --expression-attribute-values '{":v_sub": {"S": "http://"}}'
```

### Kiến thức thực tế

- **`BatchWriteItem` không hỗ trợ `ConditionExpression`** cho từng request. Cần ghi có điều kiện cho nhiều item thì dùng **`TransactWriteItems`** (có `ConditionCheck`).
- Bắt lỗi điều kiện trong Python:

  ```python
  from botocore.exceptions import ClientError
  try:
      table.put_item(Item={"user_id": "john123", "first_name": "John"},
                     ConditionExpression="attribute_not_exists(user_id)")
  except ClientError as e:
      if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
          print("Item đã tồn tại, không ghi đè")
      else:
          raise
  ```

- Có thể đặt `ReturnValuesOnConditionCheckFailure="ALL_OLD"` để nhận luôn item hiện tại khi điều kiện thất bại (tiết kiệm một lần đọc).
- Ghi thất bại do điều kiện **vẫn tốn WCU**.
- Mẫu "idempotent write" phổ biến: `attribute_not_exists(pk)` để xử lý message trùng lặp từ SQS/Lambda retry.

### Ghi nhớ cho kỳ thi

- **Condition Expression** dành cho **ghi**; **Filter Expression** dành cho **đọc**.
- Không ghi đè item đã có: **`attribute_not_exists(partition_key)`**.
- Điều kiện sai thì nhận **`ConditionalCheckFailedException`**.

---

## Bài 5 – Local & Global Secondary Index

### Lý thuyết

#### Vì sao cần index

- `Query` chỉ chạy được trên **Primary Key** (Partition Key bắt buộc, Sort Key tuỳ chọn). Muốn truy vấn theo attribute khác mà không phải `Scan` cả bảng thì cần **Secondary Index**.
- DynamoDB có 2 loại: **Local Secondary Index (LSI)** và **Global Secondary Index (GSI)**.

#### Local Secondary Index (LSI)

- **Cùng Partition Key** với bảng gốc, nhưng dùng **Sort Key khác** (một **Sort Key thay thế**, alternative sort key).
- Sort Key của LSI là **một attribute scalar** (String, Number hoặc Binary).
- Tối đa **5 LSI** mỗi bảng.
- **Phải định nghĩa lúc tạo bảng** (không thêm/xoá được sau đó).
- **Attribute Projection**: chọn attribute nào được copy sang index: `KEYS_ONLY`, `INCLUDE` (liệt kê thêm), hoặc `ALL`.
- Ví dụ bảng `Users-Games` (PK = `User_ID`, SK = `Game_ID`): tạo LSI với Sort Key `Game_TS` để query "các game user X chơi trong khoảng thời gian Y".

| User_ID (PK) | Game_ID (SK) | Game_TS (LSI SK) | Score | Result |
|---|---|---|---|---|
| 7791a3d6… | 4421 | "2021-03-15T17:43:08" | 92 | Win |
| 873e0634… | 4521 | "2021-06-20T19:02:32" | 77 | Win |
| 873e0634… | 1894 | "2021-02-11T04:11:31" | 14 | Lose |

#### Global Secondary Index (GSI)

- **Primary Key thay thế** hoàn toàn: Partition Key khác (HASH) hoặc HASH + RANGE khác so với bảng gốc.
- Giúp **tăng tốc truy vấn trên non-key attribute**.
- Index key là attribute scalar (String, Number, Binary).
- Projection: `KEYS_ONLY`, `INCLUDE`, `ALL`.
- **Phải provision RCU/WCU riêng cho GSI** (ở Provisioned mode).
- **Thêm/sửa được sau khi bảng đã tạo**.
- Ví dụ bảng `Users-Games` chỉ query được theo `User_ID`. Muốn query theo `Game_ID` thì tạo GSI: PK = `Game_ID`, SK = `Game_TS`, projection thêm `User_ID`.

| Game_ID (GSI PK) | Game_TS (GSI SK) | User_ID |
|---|---|---|
| 4421 | "2021-03-15T17:43:08" | 7791a3d6… |
| 4521 | "2021-06-20T19:02:32" | 873e0634… |
| 1894 | "2021-02-11T04:11:31" | 873e0634… |

#### So sánh LSI và GSI

| | **LSI** | **GSI** |
|---|---|---|
| Partition Key | **Giống** bảng gốc | **Khác** (tuỳ chọn) |
| Sort Key | Khác bảng gốc | Tuỳ chọn, khác bảng gốc |
| Thời điểm tạo | **Chỉ lúc tạo bảng** | **Bất kỳ lúc nào** |
| Giới hạn | **5** mỗi bảng | **20** mỗi bảng (soft limit) |
| Capacity | **Dùng RCU/WCU của bảng gốc** | **RCU/WCU riêng** |
| Consistency | Eventually **hoặc Strongly** consistent | **Chỉ Eventually** consistent |
| Giới hạn kích thước | 10 GB mỗi giá trị Partition Key (item collection) | Không |

#### Indexes và Throttling (rất hay thi)

- **GSI**:
  - Nếu **ghi vào GSI bị throttle** (WCU của GSI không đủ) thì **bảng chính cũng bị throttle**, **kể cả khi WCU của bảng chính còn dư**.
  - Phải chọn **Partition Key của GSI** cẩn thận (tránh hot partition) và **cấp đủ WCU cho GSI**.
- **LSI**:
  - Dùng WCU/RCU **của bảng chính**, nên **không có cân nhắc throttling riêng**.

### Kiến thức thực tế

- **Sparse index**: item không có attribute key của GSI thì **không xuất hiện** trong GSI. Rất hữu ích để lọc tập nhỏ (ví dụ chỉ index đơn hàng có `is_open`, xoá attribute khi đóng đơn).
- **GSI overloading / single-table design**: dùng các attribute chung tên như `GSI1PK`, `GSI1SK` cho nhiều kiểu entity, phổ biến trong thiết kế single-table.
- Projection `ALL` tiện nhưng **tăng chi phí lưu trữ và WCU** (mỗi lần ghi bảng chính cũng ghi index). Chỉ project attribute thật sự cần.
- Query GSI với attribute không được project: DynamoDB **không tự lấy** từ bảng gốc. LSI thì có thể tự fetch từ bảng gốc nhưng tốn thêm RCU.
- Bảng On-Demand thì GSI cũng On-Demand, không cần cấp capacity riêng, nhưng **back-pressure** từ GSI lên bảng chính vẫn có thể xảy ra nếu GSI có hot partition.
- Từ cuối **2025**, DynamoDB hỗ trợ **multi-attribute composite keys** cho GSI, khỏi phải ghép chuỗi thủ công kiểu `TENANT#123#STATUS#OPEN`. Tính năng này chưa xuất hiện trong đề DVA-C02.
- Theo dõi `WriteThrottleEvents` theo dimension `GlobalSecondaryIndexName` trên CloudWatch để phát hiện GSI là thủ phạm throttle.

### Ghi nhớ cho kỳ thi

- **LSI**: cùng PK, khác SK, **tối đa 5**, **chỉ tạo lúc tạo bảng**, dùng capacity bảng chính, hỗ trợ **strongly consistent**.
- **GSI**: PK/SK mới, tạo/xoá **bất kỳ lúc nào**, **capacity riêng**, **chỉ eventually consistent**.
- **GSI bị throttle → bảng chính bị throttle** (dù bảng chính còn WCU). Giải pháp: tăng WCU cho GSI, chọn PK của GSI tốt.
- Bảng đã tạo rồi, cần query theo attribute khác → **GSI**. Cần sort khác trên cùng PK và đang thiết kế bảng mới → **LSI**.

---

## Bài 6 – PartiQL

### Lý thuyết

- **PartiQL** là ngôn ngữ truy vấn **tương thích SQL** (mã nguồn mở, do Amazon phát triển) dùng để **select, insert, update, delete** dữ liệu trong DynamoDB.
- Hỗ trợ:
  - **`SELECT`**, **`INSERT`**, **`UPDATE`**, **`DELETE`**.
  - **Batch operations** (`BatchExecuteStatement`) và **transactions** (`ExecuteTransaction`).
- **Không hỗ trợ JOIN**, không có thêm khả năng mới so với API gốc; chỉ là cú pháp quen thuộc cho người biết SQL.
- Chạy được từ: **Management Console** (PartiQL editor), **NoSQL Workbench**, **DynamoDB API**, **AWS CLI**, **AWS SDK**.

#### Ví dụ

```sql
-- Đọc theo key (tương đương GetItem/Query)
SELECT * FROM "DemoIndexes" WHERE "user_id" = 'john123'

-- Thêm item
INSERT INTO "Users" VALUE {'user_id': 'bob789', 'first_name': 'Bob', 'age': 30}

-- Cập nhật
UPDATE "Users" SET age = 31 WHERE user_id = 'bob789'

-- Xoá
DELETE FROM "Users" WHERE user_id = 'bob789'
```

#### Cạm bẫy về chi phí

- `SELECT` có `WHERE` theo **Partition Key** (`=` hoặc `IN`) → DynamoDB chạy như **GetItem/Query** (rẻ).
- `SELECT` **không** có điều kiện trên Partition Key (hoặc chỉ lọc non-key) → DynamoDB chạy **Scan toàn bảng** (đắt).

### Kiến thức thực tế

- Dùng **tham số `?`** thay vì nối chuỗi để tránh lỗi và injection.
- Chặn PartiQL vô tình Scan toàn bảng bằng IAM: deny `dynamodb:PartiQLSelect` khi `dynamodb:FullTableScan = true`.

  ```json
  {
    "Effect": "Deny",
    "Action": "dynamodb:PartiQLSelect",
    "Resource": "arn:aws:dynamodb:*:*:table/Users",
    "Condition": { "Bool": { "dynamodb:FullTableScan": "true" } }
  }
  ```

- Quyền IAM riêng cho PartiQL: `dynamodb:PartiQLSelect`, `PartiQLInsert`, `PartiQLUpdate`, `PartiQLDelete`.
- Boto3:

  ```python
  ddb = boto3.client("dynamodb")
  resp = ddb.execute_statement(Statement='SELECT * FROM "Users" WHERE user_id = ?',
                               Parameters=[{"S": "john123"}])
  ```

- Trong code production, đa số team vẫn ưu tiên API gốc (`Query`, `UpdateItem`) vì rõ ràng về chi phí; PartiQL tiện để khám phá dữ liệu nhanh trong console.

### Ghi nhớ cho kỳ thi

- PartiQL = **SQL-compatible** cho DynamoDB: SELECT/INSERT/UPDATE/DELETE, hỗ trợ batch và transaction.
- **Không JOIN**, không thêm tính năng mới.
- "Team quen SQL muốn truy vấn DynamoDB" → **PartiQL**.

---

## Bài 7 – Optimistic Locking

### Lý thuyết

- DynamoDB có **Conditional Writes**, nhờ đó cài đặt được **Optimistic Locking**: chiến lược đảm bảo item **không bị người khác thay đổi** **giữa lúc bạn đọc và lúc bạn ghi** (update/delete).
- Cách làm: **mỗi item có một attribute đóng vai trò version number** (ví dụ `version`).

#### Ví dụ trong video

1. Item `{ user_id: 1, first_name: "John", version: 1 }`.
2. Hai client cùng đọc item (đều thấy `version = 1`).
3. Client 1 gửi: `SET name = "Lisa", version = 2` **chỉ khi `version = 1`**.
4. Client 2 gửi: `SET name = "Michelle", version = 2` **chỉ khi `version = 1`**.
5. Request của Client 1 tới trước: điều kiện đúng → item thành `{ name: "Lisa", version: 2 }`.
6. Request của Client 2 tới sau: `version = 1` **sai** → **thất bại** (`ConditionalCheckFailedException`). Client 2 phải **đọc lại** item (thấy Lisa, version 2) rồi quyết định có update tiếp hay không.

```bash
aws dynamodb update-item --table-name Users \
  --key '{"user_id":{"N":"1"}}' \
  --update-expression "SET first_name = :n, version = :newv" \
  --condition-expression "version = :expected" \
  --expression-attribute-values '{":n":{"S":"Lisa"},":newv":{"N":"2"},":expected":{"N":"1"}}'
```

| | Optimistic Locking | Pessimistic Locking |
|---|---|---|
| Ý tưởng | Không khoá; kiểm tra lúc ghi, xung đột thì retry | Khoá trước khi đọc/ghi |
| Trong DynamoDB | **Có** (Conditional Writes + version) | Không có lock native (tự làm "lock table") |
| Phù hợp | Xung đột hiếm | Xung đột thường xuyên |

### Kiến thức thực tế

- **DynamoDB Enhanced Client (Java SDK v2)** có annotation `@DynamoDbVersionAttribute`, tự tăng version và tự gắn điều kiện. Bản cũ `DynamoDBMapper` dùng `@DynamoDBVersionAttribute`.
- Python (boto3) tự viết:

  ```python
  item = table.get_item(Key={"user_id": 1})["Item"]
  try:
      table.update_item(
          Key={"user_id": 1},
          UpdateExpression="SET first_name = :n, version = version + :one",
          ConditionExpression="version = :v",
          ExpressionAttributeValues={":n": "Lisa", ":one": 1, ":v": item["version"]},
      )
  except ClientError as e:
      if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
          pass  # đọc lại rồi retry
  ```

- Có thể dùng `updated_at` làm "version", nhưng số nguyên tăng dần an toàn hơn (tránh trùng timestamp).
- Cần lock phân tán giữa nhiều tiến trình: thư viện **DynamoDB Lock Client** (AWS Labs) dùng bảng DynamoDB làm lock với lease + heartbeat.

### Ghi nhớ cho kỳ thi

- Optimistic Locking = **Conditional Write + attribute version**.
- Ghi thất bại vì version đã đổi → **đọc lại rồi retry**.
- "Tránh ghi đè lên thay đổi của người khác (lost update)" → **Optimistic Locking / Conditional Writes**.

---

## Bài 8 – DynamoDB Accelerator (DAX)

### Lý thuyết

#### DAX là gì

- **DAX (DynamoDB Accelerator)**: **in-memory cache fully managed, highly available, liền mạch** cho DynamoDB.
- **Độ trễ microsecond** cho dữ liệu đã cache (thay vì mili-giây).
- **Không cần sửa logic ứng dụng**: tương thích với API DynamoDB sẵn có (chỉ đổi client/endpoint sang DAX cluster).
- Giải quyết **"Hot Key" problem** (quá nhiều lượt đọc vào cùng một item).
- **TTL mặc định của cache: 5 phút**.
- Cluster tối đa **11 node**; khuyến nghị **tối thiểu 3 node cho production** (Multi-AZ).
- Bảo mật: **encryption at rest bằng KMS**, VPC, IAM, CloudTrail.

#### Kiến trúc

```
Application ──► DAX Cluster (nhiều node, Multi-AZ) ──► DynamoDB Tables
```

- DAX nằm **giữa** ứng dụng và DynamoDB. Đọc trúng cache thì trả ngay; miss thì đọc DynamoDB rồi lưu vào cache. Ghi đi **write-through** qua DAX xuống DynamoDB.
- Hai loại cache bên trong:
  - **Item cache**: kết quả `GetItem`, `BatchGetItem`.
  - **Query cache**: kết quả `Query`, `Scan` (theo tham số).

#### DAX và ElastiCache

| | **DAX** | **ElastiCache** |
|---|---|---|
| Cache cái gì | **Từng object, kết quả Query/Scan** của DynamoDB | **Kết quả tính toán / aggregation** do ứng dụng tự lưu |
| Cần sửa code | Rất ít (dùng DAX client) | Ứng dụng tự quản lý logic cache |
| Ví dụ | Đọc item phổ biến, query lặp lại | Lưu kết quả tổng hợp sau khi xử lý dữ liệu DynamoDB |

- Hai dịch vụ **có thể bổ trợ nhau**: DAX cache item/query; ElastiCache cache kết quả đã tính toán.

### Kiến thức thực tế

- Dùng DAX trong Python bằng thư viện `amazon-dax-client`:

  ```python
  from amazondax import AmazonDaxClient
  dax = AmazonDaxClient.resource(endpoint_url="daxs://demo-dax.xxxx.dax-clusters.ap-southeast-1.amazonaws.com")
  table = dax.Table("Users")
  print(table.get_item(Key={"user_id": "john123"}))
  ```

- DAX **chỉ trả eventually consistent**: request `ConsistentRead=true` được **chuyển thẳng** xuống DynamoDB, không cache.
- DAX **chạy trong VPC**, nên Lambda dùng DAX cũng phải cấu hình VPC.
- Item cache và query cache **độc lập**: ghi qua DAX cập nhật item cache (write-through) nhưng **không** làm mất hiệu lực query cache liên quan, nên kết quả Query/Scan đã cache có thể **stale tới hết TTL**.
- Khi nào **không** nên dùng DAX: ứng dụng ghi nhiều đọc ít, cần strongly consistent, hoặc độ trễ mili-giây đã đủ. Ngoài ra cân nhắc chi phí: cluster 3 node chạy 24/7.
- Có SDK DAX cho Java, .NET, Node.js (v3 có `@amazon-dax-sdk/lib-dax`), Python, Go.

### Ghi nhớ cho kỳ thi

- **DAX** = cache **in-memory** cho DynamoDB, **microsecond latency**, **không cần sửa code** đáng kể.
- **TTL mặc định 5 phút**; tối đa **11 node**; **≥ 3 node** cho production (Multi-AZ).
- Hot key / đọc lặp lại nhiều → **DAX**. Cache kết quả **aggregation/tính toán** → **ElastiCache**.
- `ProvisionedThroughputExceededException` do đọc quá nhiều một item → **DAX**.

---

## Bài 9 – DynamoDB Streams

### Lý thuyết

#### Stream là gì

- **DynamoDB Streams**: luồng **có thứ tự (ordered)** các **thay đổi ở cấp item** (create / update / delete) trong bảng.
- Các bản ghi stream có thể:
  - Được gửi tới **Kinesis Data Streams**.
  - Được đọc bởi **AWS Lambda**.
  - Được đọc bởi **Kinesis Client Library (KCL)** application.
- **Thời gian lưu dữ liệu: tối đa 24 giờ**.
- Use case:
  - **Phản ứng thời gian thực** (ví dụ gửi email chào mừng user mới).
  - **Analytics**.
  - **Insert vào bảng dẫn xuất** (derivative tables).
  - **Insert vào OpenSearch**.
  - **Cross-Region Replication** (Global Tables dựa trên Streams).

#### Kiến trúc mẫu

```
App ──create/update/delete──► DynamoDB Table ──► DynamoDB Streams
                                                    ├─► Lambda ──► SNS (gửi thông báo)
                                                    ├─► Lambda ──► DynamoDB table khác (lọc, dẫn xuất)
                                                    └─► Kinesis Data Streams ──► Firehose ──► S3 / Redshift / OpenSearch
```

#### StreamViewType: chọn thông tin ghi vào stream

| StreamViewType | Nội dung bản ghi |
|---|---|
| **`KEYS_ONLY`** | Chỉ **attribute key** của item bị thay đổi |
| **`NEW_IMAGE`** | **Toàn bộ item sau khi** thay đổi |
| **`OLD_IMAGE`** | **Toàn bộ item trước khi** thay đổi |
| **`NEW_AND_OLD_IMAGES`** | Cả item **mới và cũ** |

- Streams được tạo từ **shards**, giống Kinesis Data Streams. Bạn **không provision shard**, AWS tự quản lý.
- **Records không được ghi ngược lại (retroactive)** sau khi bật stream: bật stream rồi thì **chỉ thay đổi từ thời điểm đó** mới vào stream.

#### DynamoDB Streams và Lambda

- Cần định nghĩa **Event Source Mapping** để Lambda **đọc (poll)** từ DynamoDB Streams.
- Lambda execution role cần quyền đọc stream (managed policy `AWSLambdaDynamoDBExecutionRole`: `dynamodb:DescribeStream`, `GetRecords`, `GetShardIterator`, `ListStreams`).
- Lambda được **invoke đồng bộ (synchronously)** bởi Event Source Mapping, theo batch.

```
DynamoDB Table ──► Streams ──poll── Event Source Mapping (internal) ──invoke với batch──► Lambda
```

### Kiến thức thực tế

- **Event filtering** (2021) cho Event Source Mapping: chỉ invoke Lambda với bản ghi khớp filter, ví dụ chỉ `INSERT`:

  ```json
  { "Filters": [ { "Pattern": "{\"eventName\": [\"INSERT\"]}" } ] }
  ```

- Xử lý lỗi: bản ghi lỗi sẽ **chặn shard** (retry tới khi thành công hoặc hết 24h). Cấu hình `BisectBatchOnFunctionError`, `MaximumRetryAttempts`, `MaximumRecordAgeInSeconds`, **on-failure destination** (SQS/SNS/S3) và `ReportBatchItemFailures` để tránh kẹt.
- Thứ tự được đảm bảo **theo từng item (partition key)**; mỗi thay đổi xuất hiện **đúng một lần** trong DynamoDB Streams.
- **Kinesis Data Streams for DynamoDB** (lựa chọn thay thế): lưu lâu hơn (tới **365 ngày**), nhiều consumer hơn, tích hợp Firehose, nhưng có thể có bản ghi trùng/không thứ tự (cần dedupe bằng `ApproximateCreationDateTime`).
- Mỗi shard của DynamoDB Streams khuyến nghị **tối đa 2 consumer** đồng thời để tránh throttle.
- Bản ghi xoá do **TTL** xuất hiện trong stream với `userIdentity.principalId = "dynamodb.amazonaws.com"` (phân biệt với xoá thủ công).

### Ghi nhớ cho kỳ thi

- Streams: thay đổi cấp item, **có thứ tự**, **lưu 24 giờ**, **không retroactive**.
- 4 view type: `KEYS_ONLY`, `NEW_IMAGE`, `OLD_IMAGE`, `NEW_AND_OLD_IMAGES`.
- Lambda đọc Streams qua **Event Source Mapping** (poll, invoke **đồng bộ**), cần quyền **`AWSLambdaDynamoDBExecutionRole`**.
- "Gửi email khi có user mới / đồng bộ sang OpenSearch / bảng khác" → **Streams + Lambda**.

---

## Bài 10 – Time To Live (TTL)

### Lý thuyết

- **TTL**: **tự động xoá item sau một thời điểm hết hạn** (expiry timestamp).
- **Không tốn WCU** (xoá miễn phí, không cần thêm chi phí).
- Attribute TTL phải có kiểu **Number** và giá trị là **Unix Epoch timestamp** (tính bằng **giây**).
- Item hết hạn bị xoá **trong vòng vài ngày** (không xoá ngay lập tức).
  - Item đã hết hạn nhưng chưa bị xoá **vẫn xuất hiện** trong đọc/query/scan. Muốn ẩn thì **dùng filter** (`FilterExpression` so sánh với thời gian hiện tại).
- Item hết hạn bị xoá **cả khỏi LSI và GSI**.
- Thao tác xoá do TTL **đi vào DynamoDB Streams** → có thể dùng để **khôi phục** item hết hạn (ví dụ Lambda chép sang bảng archive / S3).

| user_id | name | expire_on (Number, epoch) |
|---|---|---|
| john123 | John | 1633003200 (đã hết hạn → sẽ bị xoá) |
| alice456 | Alice | 1897048800 (còn hạn) |

- Use case:
  - **Giảm dữ liệu lưu trữ** bằng cách chỉ giữ item hiện hành.
  - **Tuân thủ quy định** (xoá dữ liệu sau X ngày).
  - **Web session handling** (session hết hạn sau N giờ).

### Kiến thức thực tế

- Theo tài liệu hiện tại, item hết hạn thường bị xoá **trong vòng vài ngày** (AWS đã nêu "thường trong 48 giờ" trước đây, nay ghi "within a few days"). Đừng dùng TTL cho logic cần chính xác tới phút.
- Lỗi phổ biến: lưu epoch tính bằng **mili-giây** (`Date.now()` trong JavaScript) → item không bao giờ hết hạn. Phải chia 1000.
- Item có attribute TTL **không phải Number** hoặc giá trị quá xa trong quá khứ (hơn 5 năm) sẽ **bị bỏ qua**.
- Global Tables: TTL xoá ở region nguồn rồi replicate; việc replicate xoá **có tốn** replicated write ở region khác.
- Filter bỏ item đã hết hạn trong Python:

  ```python
  import time
  from boto3.dynamodb.conditions import Attr
  resp = table.scan(FilterExpression=Attr("expire_on").gt(int(time.time())))
  ```

- Bật/tắt TTL chỉ được **1 lần mỗi giờ** cho một bảng.

### Ghi nhớ cho kỳ thi

- TTL: attribute **Number**, **epoch giây**, xoá **miễn phí (không tốn WCU)**, xoá **trong vài ngày**.
- Item hết hạn chưa xoá vẫn hiện → **lọc bằng FilterExpression**.
- Xoá khỏi cả **LSI/GSI**, đi vào **Streams** (dùng để archive).
- Session hết hạn, dữ liệu tạm, tuân thủ xoá dữ liệu → **TTL**.

---

## Bài 11 – Các tuỳ chọn CLI hay gặp

### Lý thuyết

#### Các tuỳ chọn tối ưu hoá output

| Tuỳ chọn | Ý nghĩa |
|---|---|
| **`--projection-expression`** | Chỉ lấy **một hoặc nhiều attribute** cần thiết |
| **`--filter-expression`** | **Lọc item** trước khi trả về cho bạn |

#### Các tuỳ chọn phân trang (chung cho AWS CLI, như S3)

| Tuỳ chọn | Ý nghĩa |
|---|---|
| **`--page-size`** | CLI **vẫn lấy toàn bộ danh sách** nhưng gọi API **nhiều lần, mỗi lần ít item hơn** (mặc định 1.000 item/lần). Giúp **tránh timeout** |
| **`--max-items`** | **Số item tối đa** CLI hiển thị. Trả về **`NextToken`** nếu còn |
| **`--starting-token`** | Truyền `NextToken` của lần trước để **lấy trang tiếp theo** |

- Phân biệt:
  - `--page-size` = **chia nhỏ các lời gọi API phía sau** (bạn vẫn nhận đủ kết quả).
  - `--max-items` + `--starting-token` = **phân trang kết quả trả về cho bạn**.

### Kiến thức thực tế

- `NextToken` là token của **CLI** (đã mã hoá); ở cấp **API/SDK**, khái niệm tương ứng là **`LastEvaluatedKey`** → truyền lại vào **`ExclusiveStartKey`**. `--max-items` cũng không tương đương `Limit` của API (`--limit` trong DynamoDB CLI là `Limit` của API: số item tối đa **được đọc** trên mỗi request).
- Lọc output phía client bằng `--query` (JMESPath) và đổi format:

  ```bash
  aws dynamodb scan --table-name UserPosts \
    --query "Items[].content.S" --output text
  ```

- Tắt phân trang tự động: `--no-paginate` (chỉ lấy trang đầu tiên).
- Boto3 có **paginator** thay cho vòng lặp thủ công:

  ```python
  paginator = boto3.client("dynamodb").get_paginator("scan")
  for page in paginator.paginate(TableName="UserPosts", PaginationConfig={"PageSize": 100}):
      for item in page["Items"]:
          print(item)
  ```

### Ghi nhớ cho kỳ thi

- Chỉ lấy vài attribute → **`--projection-expression`**. Lọc item → **`--filter-expression`**.
- Lệnh CLI bị **timeout** khi bảng lớn → **`--page-size`**.
- Phân trang kết quả → **`--max-items`** + **`--starting-token`** (dùng `NextToken`).

---

## Bài 12 – Transactions

### Lý thuyết

#### Transaction là gì

- **Thao tác all-or-nothing** (tất cả hoặc không gì cả) trên **nhiều item**, có thể ở **nhiều bảng**.
- Cung cấp **ACID**: **Atomicity, Consistency, Isolation, Durability**.
- Các chế độ đọc/ghi:

| Chế độ đọc | Chế độ ghi |
|---|---|
| Eventually consistent | Standard |
| Strongly consistent | **Transactional** |
| **Transactional** | |

- Áp dụng cho **cả bảng** (đọc và ghi đều có thể là transactional).
- **Tốn gấp đôi WCU & RCU**: DynamoDB thực hiện **2 thao tác cho mỗi item** (**prepare** & **commit**).
- Hai API:
  - **`TransactGetItems`**: một hoặc nhiều `Get`.
  - **`TransactWriteItems`**: một hoặc nhiều `Put`, `Update`, `Delete`, **`ConditionCheck`**.
- Use case: **giao dịch tài chính**, **quản lý đơn hàng**, **game nhiều người chơi** (cập nhật nhiều item phải nhất quán).

#### Ví dụ: chuyển tiền

- Bảng `AccountBalance` và bảng `BankTransactions`.
- Một transaction: **trừ tiền** ở `AccountBalance` + **ghi giao dịch** vào `BankTransactions`. Cả hai cùng thành công hoặc cùng thất bại.

```bash
aws dynamodb transact-write-items --transact-items '[
  {"Update": {"TableName": "AccountBalance",
              "Key": {"Account_id": {"S": "Acct_21"}},
              "UpdateExpression": "SET Balance = Balance - :amt",
              "ConditionExpression": "Balance >= :amt",
              "ExpressionAttributeValues": {":amt": {"N": "45"}}}},
  {"Put":    {"TableName": "BankTransactions",
              "Item": {"Transaction_id": {"S": "Tx_23"}, "Account_id": {"S": "Acct_21"},
                       "Amount": {"N": "45"}, "Date": {"S": "2026-10-15"}}}}
]'
```

#### Tính capacity cho transaction (hay thi)

**Ví dụ 1:** **3 transactional write/giây**, item **5 KB**

- WCU thường = 3 × 5 = 15 → transactional **× 2** = **30 WCU**.

**Ví dụ 2:** **5 transactional read/giây**, item **5 KB**

- 5 KB làm tròn lên **8 KB** → 5 × (8 / 4) = 10 → transactional **× 2** = **20 RCU**.

> Công thức: tính như **strongly consistent** (RCU) / standard (WCU) rồi **nhân 2**.

### Kiến thức thực tế

- Giới hạn hiện tại: tối đa **100 thao tác** (item) mỗi transaction, tổng tối đa **4 MB** (trước 9/2022 là 25 item).
- **Không thể** có 2 thao tác lên **cùng một item** trong một transaction.
- Xung đột (item đang bị transaction khác sửa) → **`TransactionCanceledException`** với `CancellationReasons` (ví dụ `ConditionalCheckFailed`, `TransactionConflict`). Retry với backoff.
- **Idempotency**: truyền `ClientRequestToken` cho `TransactWriteItems` để retry an toàn trong **10 phút** (không bị ghi 2 lần).
- Transaction chỉ trong **một region, một account**. Với Global Tables, tính ACID chỉ đảm bảo ở region nơi gọi transaction.
- Boto3:

  ```python
  client = boto3.client("dynamodb")
  client.transact_write_items(
      TransactItems=[
          {"ConditionCheck": {"TableName": "Users", "Key": {"user_id": {"S": "john123"}},
                              "ConditionExpression": "attribute_exists(user_id)"}},
          {"Put": {"TableName": "Orders", "Item": {"order_id": {"S": "o-1"}, "user_id": {"S": "john123"}}}},
      ],
      ClientRequestToken="order-o-1",
  )
  ```

- PartiQL cũng có transaction: `ExecuteTransaction`.

### Ghi nhớ cho kỳ thi

- Transaction = **all-or-nothing**, **ACID**, nhiều item / nhiều bảng.
- API: **`TransactGetItems`**, **`TransactWriteItems`** (Put/Update/Delete/ConditionCheck).
- **Tốn gấp 2 lần RCU/WCU** (prepare + commit). Đọc transactional: tính như strongly consistent rồi × 2.

---

## Bài 13 – Lưu Session State

### Lý thuyết

- Dùng **DynamoDB làm session store** là use case phổ biến (ví dụ lưu trạng thái đăng nhập của user cho web app).
- So sánh với các lựa chọn khác:

| | **DynamoDB** | **ElastiCache** | **EFS** | **EBS & Instance Store** | **S3** |
|---|---|---|---|---|---|
| Kiểu | Key/value, **serverless** | Key/value, **in-memory** | Network file system | Ổ đĩa gắn vào **một** EC2 | Object storage |
| Chia sẻ giữa nhiều instance | Có | Có | Có (mount nhiều EC2) | **Không** (chỉ local) | Có |
| Ghi chú | **Auto scaling**, serverless, có TTL để xoá session hết hạn | Nhanh hơn (in-memory), nhưng **không serverless** | Session lưu dạng file | Chỉ dùng cache **cục bộ**, không share | **Độ trễ cao hơn**, dành cho **file lớn**, không hợp session nhỏ |

- **DynamoDB vs ElastiCache** (hay thi):
  - **ElastiCache**: in-memory → **nhanh hơn**.
  - **DynamoDB**: **serverless**, tự scale.
  - Cả hai đều là **key/value store**.
- **EFS** phải gắn vào EC2 như một **network drive**; **EBS / Instance Store** chỉ dùng **local**, không share được.

### Kiến thức thực tế

- Thiết kế bảng session: PK = `session_id` (UUID ngẫu nhiên, cardinality cao), attribute `user_id`, `data`, và **`expires_at` (TTL)** để tự dọn session hết hạn.
- Có sẵn session handler: **DynamoDB Session Manager for Tomcat**, **AWS SDK for PHP `SessionHandler`**, **`connect-dynamodb`** cho Express (Node.js).
- Vì TTL xoá chậm (vài ngày), khi đọc session phải **kiểm tra `expires_at`** trong code, không chỉ dựa vào TTL.
- Session cần độ trễ **sub-millisecond** với lượng truy cập rất cao → **ElastiCache (Valkey/Redis OSS)** hoặc **DynamoDB + DAX**.
- Ứng dụng serverless hiện đại (Cognito/JWT) thường **stateless**, giảm nhu cầu session store phía server.

### Ghi nhớ cho kỳ thi

- Session store **serverless**, tự scale, nhiều instance cùng dùng → **DynamoDB** (kèm **TTL**).
- Cần **in-memory, nhanh nhất** → **ElastiCache**.
- **EBS / Instance Store** không share được giữa các instance; **S3** độ trễ cao, không hợp session.

---

## Bài 14 – Write Sharding

### Lý thuyết

- Bài toán: ứng dụng **bầu cử** với 2 ứng viên, `Candidate A` và `Candidate B`.
- Nếu Partition Key = **`Candidate_ID`** → chỉ có **2 giá trị** → toàn bộ lượt vote dồn vào **2 partition** → **hot partition**, throttle ghi.

| Candidate_ID (PK) | Vote_ts | Voter_ID |
|---|---|---|
| Candidate_A | … | 235343 |
| Candidate_B | … | 232344 |

- Giải pháp **Write Sharding**: **thêm hậu tố (suffix)** vào giá trị Partition Key để chia ra nhiều partition:
  - **Random suffix**: `Candidate_A-1`, `Candidate_A-2`, … `Candidate_A-N` (chọn ngẫu nhiên 1..N).
  - **Calculated suffix**: suffix tính bằng **thuật toán băm** từ attribute khác (ví dụ `hash(Voter_ID) % N`) → biết trước item nằm ở shard nào, dễ đọc lại một item cụ thể.

| Candidate_ID (PK) | Vote_ts | Voter_ID |
|---|---|---|
| Candidate_A-11 | … | 235343 |
| Candidate_A-20 | … | 232344 |
| Candidate_B-17 | … | 111111 |
| Candidate_B-80 | … | 123123 |

- Khi đọc tổng số vote: phải **query tất cả N shard** rồi **cộng lại** (scatter-gather) phía ứng dụng.

### Kiến thức thực tế

- Chọn N vừa đủ: mỗi partition ghi tối đa khoảng **1.000 WCU/giây**; nếu dự kiến 10.000 vote/giây cho một ứng viên thì cần ít nhất ~10 shard (thêm dư phòng).
- Ví dụ Python:

  ```python
  import random, hashlib
  N = 20
  # random suffix
  pk = f"Candidate_A-{random.randint(1, N)}"
  # calculated suffix (biết trước shard theo voter)
  pk = f"Candidate_A-{int(hashlib.md5(b'235343').hexdigest(), 16) % N + 1}"
  table.put_item(Item={"Candidate_ID": pk, "Vote_ts": "2026-10-15T10:00:00Z", "Voter_ID": "235343"})
  ```

- Cách khác cho đếm số: **atomic counter** (`ADD votes :one`) trên nhiều item counter đã shard, rồi định kỳ tổng hợp bằng **Streams + Lambda** vào item tổng.
- **Adaptive capacity** và **split for heat** giúp phần nào, nhưng **không** cứu được khi Partition Key chỉ có vài giá trị.

### Ghi nhớ cho kỳ thi

- Partition Key ít giá trị → hot partition → **Write Sharding**: thêm **random suffix** hoặc **calculated suffix**.
- Đọc lại thì phải gom dữ liệu từ **mọi shard**.

---

## Bài 15 – Các kiểu ghi dữ liệu

### Lý thuyết

| Kiểu ghi | Mô tả | Ví dụ |
|---|---|---|
| **Concurrent Writes** | Hai client ghi cùng item, **không điều kiện** → **lần ghi sau đè lần ghi trước** (last writer wins) | User 1 `SET value = 1`, User 2 `SET value = 2` → kết quả là 2 (mất cập nhật của User 1) |
| **Conditional Writes** | **Chỉ ghi nếu** điều kiện đúng (ví dụ `value = 0`) → lần ghi đầu thành công, lần sau **thất bại** | User 1 `SET value = 1 IF value = 0` ✅, User 2 `SET value = 2 IF value = 0` ❌ |
| **Atomic Writes** | **Cả hai** cập nhật đều có hiệu lực, cộng dồn | User 1 `INCREASE BY 1`, User 2 `INCREASE BY 2` → value tăng **3** |
| **Batch Writes** | **Ghi/xoá nhiều item cùng lúc** trong một lời gọi | `BatchWriteItem` nhiều item |

- **Atomic counter**: dùng `UpdateItem` với `SET counter = counter + :inc` hoặc `ADD counter :inc`. Phù hợp đếm lượt xem, like… (không idempotent: retry có thể đếm thừa).

```bash
aws dynamodb update-item --table-name Posts \
  --key '{"post_id":{"S":"p1"}}' \
  --update-expression "ADD views :inc" \
  --expression-attribute-values '{":inc":{"N":"1"}}' \
  --return-values UPDATED_NEW
```

### Kiến thức thực tế

- Bảng chọn nhanh:

| Nhu cầu | Dùng |
|---|---|
| Tránh lost update khi nhiều người sửa | **Conditional write / Optimistic Locking** |
| Đếm chính xác tuyệt đối, retry an toàn | Conditional write với version hoặc **transaction + `ClientRequestToken`** |
| Đếm gần đúng, hiệu năng cao | **Atomic counter** |
| Nhiều item phải cùng thành công | **Transaction** (`TransactWriteItems`) |
| Nạp nhiều item, chấp nhận thành công từng phần | **Batch** (`BatchWriteItem`) |

- `BatchWriteItem` **không atomic**: một số item có thể thất bại (`UnprocessedItems`), và không có `ConditionExpression`.

### Ghi nhớ cho kỳ thi

- **Concurrent**: ghi sau đè ghi trước. **Conditional**: chỉ ghi khi điều kiện đúng. **Atomic**: cả hai đều cộng dồn (`ADD`, `SET x = x + :v`). **Batch**: nhiều item một lần.
- Đếm lượt xem/like từ nhiều client đồng thời → **Atomic Counter**.

---

## Bài 16 – Mẫu kiến trúc DynamoDB + S3

### Lý thuyết

#### Mẫu 1: Lưu object lớn (Large Objects Pattern)

- DynamoDB giới hạn item **400 KB** → không lưu được file lớn (ảnh, video, tài liệu).
- Cách làm:
  1. Client **upload file lớn lên S3**.
  2. Ghi **một item nhỏ vào DynamoDB** chứa **metadata** + **đường dẫn S3** (bucket/key), kích thước, ngày tạo…
  3. Client đọc metadata từ DynamoDB rồi **tải file từ S3**.

```
Client ──upload──► S3 bucket (file lớn)
   └────ghi metadata──► DynamoDB { Product_ID: 123, Product_Name: "Jumper", Image_URL: "https://s3.../jumper.jpg" }
Client ──đọc metadata──► DynamoDB ──► tải file từ S3
```

#### Mẫu 2: Indexing S3 object metadata

- S3 không tìm kiếm/lọc object theo metadata hiệu quả.
- Cách làm: **S3 Event Notification** (ObjectCreated) → **Lambda** → ghi metadata (object key, size, date, uploader…) vào **DynamoDB**.
- Sau đó **API của ứng dụng truy vấn DynamoDB** để trả lời các câu hỏi:
  - Tìm mọi object của một customer.
  - Tính tổng dung lượng một customer đã dùng.
  - Liệt kê object có attribute nào đó.
  - Tìm object upload trong một khoảng thời gian.

```
Upload ──► S3 ──event──► Lambda ──► DynamoDB (bảng index) ◄── API (search / filter / aggregate)
```

### Kiến thức thực tế

- Python cho mẫu 1:

  ```python
  s3 = boto3.client("s3")
  s3.upload_file("jumper.jpg", "my-product-images", "products/123/jumper.jpg")
  table.put_item(Item={"Product_ID": "123", "Product_Name": "Jumper",
                       "Image_S3": "s3://my-product-images/products/123/jumper.jpg"})
  ```

- Trả file cho client bằng **presigned URL** (hoặc CloudFront signed URL) thay vì để bucket public.
- Thay thế hiện đại cho mẫu 2: **S3 Metadata** (ra mắt 2024–2025) tự tạo bảng metadata dạng **Apache Iceberg (S3 Tables)** truy vấn bằng Athena; tuy nhiên đề thi vẫn dùng mẫu **S3 → Lambda → DynamoDB**.
- Nhớ xử lý tính nhất quán: nếu upload S3 thành công nhưng ghi DynamoDB thất bại thì sinh "file mồ côi"; dùng retry/DLQ hoặc ghi metadata từ S3 event để đảm bảo đồng bộ.

### Ghi nhớ cho kỳ thi

- Item > **400 KB** → **lưu file ở S3**, DynamoDB chỉ giữ **metadata + S3 key**.
- Cần tìm kiếm/lọc object S3 theo metadata → **S3 Event → Lambda → DynamoDB**.

---

## Bài 17 – Dọn dẹp và sao chép bảng

### Lý thuyết

#### Dọn dẹp bảng (xoá toàn bộ dữ liệu)

| Cách | Đánh giá |
|---|---|
| **Scan + DeleteItem** từng item | **Rất chậm**, **tốn RCU & WCU**, **đắt** |
| **Drop table (`DeleteTable`) + tạo lại** | **Nhanh, hiệu quả, rẻ** ✅ |

#### Sao chép bảng DynamoDB (ví dụ sang account/region khác)

| Cách | Mô tả |
|---|---|
| **AWS Data Pipeline** | (Cách cũ trong video) Pipeline dùng EMR đọc bảng → ghi ra S3 → đọc S3 → ghi vào bảng mới |
| **Backup and restore vào bảng mới** | Tạo backup rồi **restore sang bảng có tên mới**; mất thời gian nhưng không cần code, không ảnh hưởng RCU |
| **Scan + PutItem / BatchWriteItem** | **Tự viết code** (đọc bảng gốc, ghi bảng mới); linh hoạt, có thể **biến đổi dữ liệu** khi copy |

### Kiến thức thực tế

- **AWS Data Pipeline đã ngừng nhận khách hàng mới (2023)** và đang dần bị khai tử. Cách hiện đại để copy bảng:
  - **Export to S3** (dựa trên PITR, **không tốn RCU**, định dạng DynamoDB JSON hoặc Amazon Ion) rồi **Import from S3** (tạo **bảng mới**, không tốn WCU, tính phí theo dung lượng).

    ```bash
    aws dynamodb export-table-to-point-in-time \
      --table-arn arn:aws:dynamodb:ap-southeast-1:123456789012:table/Users \
      --s3-bucket my-ddb-exports --export-format DYNAMODB_JSON

    aws dynamodb import-table \
      --s3-bucket-source S3Bucket=my-ddb-exports,S3KeyPrefix=AWSDynamoDB/01234/data/ \
      --input-format DYNAMODB_JSON --input-compression-type GZIP \
      --table-creation-parameters '{"TableName":"UsersCopy","AttributeDefinitions":[{"AttributeName":"user_id","AttributeType":"S"}],"KeySchema":[{"AttributeName":"user_id","KeyType":"HASH"}],"BillingMode":"PAY_PER_REQUEST"}'
    ```

  - **AWS Backup** hỗ trợ **copy backup cross-account / cross-region**, restore ra bảng mới.
  - **AWS Glue** ETL khi cần biến đổi dữ liệu.
- Restore từ backup/PITR luôn tạo **bảng mới**; cần tự cấu hình lại auto scaling, IAM policy, Streams, TTL, CloudWatch alarm, tags.
- Xoá dữ liệu cũ theo thời gian: dùng **TTL** thay vì Scan + Delete.

### Ghi nhớ cho kỳ thi

- Xoá hết dữ liệu: **`DeleteTable` rồi tạo lại** (nhanh, rẻ), **không** Scan + Delete.
- Copy bảng: **Backup & Restore**, **Data Pipeline** (cũ), **Scan + PutItem/BatchWriteItem** (tự code); thực tế nay: **Export/Import S3**.

---

## Bài 18 – Bảo mật và các tính năng khác

### Lý thuyết

#### Bảo mật

- **VPC Endpoint (Gateway endpoint)**: truy cập DynamoDB **không qua Internet** (từ subnet private).
- Truy cập được kiểm soát hoàn toàn bằng **IAM**.
- **Encryption at rest** bằng **AWS KMS** (luôn bật), **encryption in transit** bằng **SSL/TLS**.

#### Backup và Restore

- **Point-in-time Recovery (PITR)** giống RDS: khôi phục về **bất kỳ thời điểm nào** trong **35 ngày** gần nhất.
- **Không ảnh hưởng hiệu năng**.
- **On-demand backup**: backup thủ công, giữ tới khi bạn xoá.

#### Global Tables

- Bảng **multi-region, multi-active**, **replicate hoàn toàn**, **hiệu năng cao**.
- Đọc/ghi được ở **mọi region** (active-active).
- **Bắt buộc bật DynamoDB Streams** (Global Tables dựa trên Streams để replicate).

#### DynamoDB Local

- Bản DynamoDB chạy **trên máy local** để **phát triển và test** mà **không cần Internet**, không tốn tiền AWS (dạng JAR, Docker image `amazon/dynamodb-local`).

#### Migrate dữ liệu

- **AWS DMS (Database Migration Service)** migrate **vào DynamoDB** từ MongoDB, Oracle, MySQL, S3…

#### Fine-Grained Access Control (rất hay thi)

- Bài toán: ứng dụng **web/mobile** cho người dùng **truy cập trực tiếp DynamoDB**. **Không** được nhúng IAM user/access key vào app.
- Giải pháp: dùng **Identity Provider** (Amazon Cognito User Pools, Google, Facebook, OpenID Connect, SAML…) → đổi lấy **temporary AWS credentials** (qua **Cognito Identity Pools**) gắn với **IAM Role**.
- Gắn **IAM Role có Condition** để giới hạn **chỉ được truy cập item của chính mình**:
  - **`dynamodb:LeadingKeys`**: giới hạn quyền truy cập theo **Primary Key (Partition Key)** ở **cấp row (item)**.
  - **`dynamodb:Attributes`**: giới hạn các **attribute** user được xem (cấp **cột**).

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["dynamodb:GetItem", "dynamodb:BatchGetItem", "dynamodb:Query",
                 "dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:DeleteItem",
                 "dynamodb:BatchWriteItem"],
      "Resource": "arn:aws:dynamodb:us-west-2:123456789012:table/MyTable",
      "Condition": {
        "ForAllValues:StringEquals": {
          "dynamodb:LeadingKeys": ["${cognito-identity.amazonaws.com:sub}"]
        }
      }
    }
  ]
}
```

- `${cognito-identity.amazonaws.com:sub}` là **policy variable** = ID của user đã đăng nhập; mỗi user chỉ đọc/ghi item có Partition Key bằng ID của mình.

### Kiến thức thực tế

- **Global Tables version 2019.11.21** là bản hiện hành; tạo bằng cách **thêm replica** vào bảng có sẵn (`update-table --replica-updates`). Từ **2025** có chế độ **Multi-Region Strong Consistency (MRSC)** cho Global Tables (ghi/đọc strongly consistent giữa 3 region), mặc định vẫn là eventual (**MREC**, last writer wins).
- Encryption at rest có 3 lựa chọn key: **AWS owned key** (mặc định, miễn phí), **AWS managed key** (`aws/dynamodb`), **Customer managed key** (CMK, kiểm soát rotation/policy, xem được trong CloudTrail).
- **Resource-based policy** cho bảng DynamoDB (2024): cấp quyền **cross-account** trực tiếp trên bảng/stream, không cần assume role.
- **Deletion protection** + **PITR** nên bật cho mọi bảng production. Từ 2025 có thể chỉnh **PITR recovery period** từ 1 đến 35 ngày.
- DynamoDB Local dùng cho test:

  ```bash
  docker run -p 8000:8000 amazon/dynamodb-local
  aws dynamodb list-tables --endpoint-url http://localhost:8000
  ```

- **zero-ETL integration** từ DynamoDB sang **Amazon OpenSearch Service** / **Redshift** (2023–2024) thay cho tự viết Streams + Lambda khi chỉ cần tìm kiếm/analytics.
- Gateway VPC Endpoint cho DynamoDB **miễn phí**; từ 2024 còn có **Interface endpoint (PrivateLink)** để truy cập từ on-premises.

### Ghi nhớ cho kỳ thi

- Truy cập riêng tư từ VPC → **VPC Endpoint**. Mã hoá at rest → **KMS**; in transit → **TLS**.
- **PITR**: khôi phục tới **35 ngày**, không ảnh hưởng hiệu năng.
- **Global Tables**: multi-region, **active-active**, **cần bật Streams**.
- Test local không cần Internet → **DynamoDB Local**. Migrate vào DynamoDB → **DMS**.
- User web/mobile chỉ truy cập **item của chính mình** → **Cognito + IAM Role với `dynamodb:LeadingKeys`**; giới hạn cột → **`dynamodb:Attributes`**.

---

## Câu hỏi ôn tập

*Nguồn: DynamoDB Quiz (27 câu). Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** DynamoDB được tạo thành từ table, item và attribute. Kích thước tối đa của một item là bao nhiêu?

- A. 64 KB
- B. 400 KB
- C. 16 MB
- D. 400 MB

<details><summary>Đáp án</summary>

**B.** Mỗi item tối đa **400 KB** (tính cả tên attribute và giá trị). File lớn hơn thì lưu ở S3 và giữ metadata trong DynamoDB.
</details>

**Câu 2.** Bạn đang xây dựng bảng `Movies`. Attribute nào là Partition Key tốt nhất để phân tán dữ liệu?

- A. `producer_name`
- B. `movie_language`
- C. `movie_id`
- D. `release_year`

<details><summary>Đáp án</summary>

**C.** `movie_id` có **cardinality cao nhất** (mỗi phim một giá trị), giúp dữ liệu phân tán đều. `movie_language` rất lệch (đa số tiếng Anh).
</details>

**Câu 3.** Bạn cần ghi **10 item/giây**, mỗi item **6 KB**. Cần provision bao nhiêu WCU?

- A. 6
- B. 10
- C. 15
- D. 60

<details><summary>Đáp án</summary>

**D.** WCU = 10 × ceil(6 KB / 1 KB) = 10 × 6 = **60 WCU**.
</details>

**Câu 4.** Bạn cần **12 strongly consistent read/giây**, mỗi item **16 KB**. Cần bao nhiêu RCU?

- A. 12
- B. 24
- C. 48
- D. 96

<details><summary>Đáp án</summary>

**C.** RCU = 12 × (16 / 4) = **48 RCU**. Strongly consistent nên không chia 2.
</details>

**Câu 5.** Bạn cần **16 eventually consistent read/giây**, mỗi item **12 KB**. Cần bao nhiêu RCU?

- A. 12
- B. 24
- C. 48
- D. 96

<details><summary>Đáp án</summary>

**B.** RCU = (16 / 2) × (12 / 4) = 8 × 3 = **24 RCU**.
</details>

**Câu 6.** Bạn đã provision **10 RCU** cho bảng, nhưng ứng dụng vẫn nhận `ProvisionedThroughputExceededException` dù tổng lượt đọc thấp hơn 10 RCU. Nguyên nhân khả dĩ nhất là gì?

- A. Đọc eventually consistent thay vì strongly consistent
- B. Có **hot partition / hot key**
- C. Bảng thiếu LSI
- D. Bảng đang dùng On-Demand

<details><summary>Đáp án</summary>

**B.** RCU/WCU được **chia đều cho các partition**; một partition "nóng" có thể vượt phần capacity của nó dù tổng chưa vượt. Giải pháp: phân tán key tốt hơn, exponential backoff, DAX.
</details>

**Câu 7.** Bạn muốn cập nhật item **chỉ khi** một attribute có giá trị nhất định, và muốn thao tác thất bại nếu không thoả. Bạn dùng gì?

- A. Filter Expression
- B. Projection Expression
- C. Condition Expression (Conditional Writes)
- D. Key Condition Expression

<details><summary>Đáp án</summary>

**C.** **Condition Expression** dùng cho ghi (Put/Update/Delete); không thoả thì nhận `ConditionalCheckFailedException`. Filter Expression chỉ lọc kết quả đọc.
</details>

**Câu 8.** Bạn muốn `PutItem` **không bao giờ ghi đè** item đã tồn tại (bảng chỉ có Partition Key `user_id`). Điều kiện nào đúng?

- A. `attribute_exists(user_id)`
- B. `attribute_not_exists(user_id)`
- C. `size(user_id) > 0`
- D. `begins_with(user_id, :p)`

<details><summary>Đáp án</summary>

**B.** `attribute_not_exists(user_id)`: nếu item đã có thì điều kiện sai, không ghi đè.
</details>

**Câu 9.** Bạn chỉ muốn lấy **một vài attribute** của item khi gọi `GetItem` để giảm dữ liệu trả về. Dùng gì?

- A. `FilterExpression`
- B. `ProjectionExpression`
- C. `ConditionExpression`
- D. `UpdateExpression`

<details><summary>Đáp án</summary>

**B.** **`ProjectionExpression`** chọn attribute cần lấy (CLI: `--projection-expression`).
</details>

**Câu 10.** Bạn cần **xoá toàn bộ dữ liệu** trong một bảng DynamoDB lớn, nhanh và rẻ nhất. Bạn làm gì?

- A. Scan rồi gọi `DeleteItem` cho từng item
- B. `BatchWriteItem` với `DeleteRequest` cho mọi item
- C. Gọi `DeleteTable` rồi tạo lại bảng
- D. Bật TTL với thời gian hiện tại

<details><summary>Đáp án</summary>

**C.** `DeleteTable` rồi tạo lại nhanh và không tốn RCU/WCU. Scan + Delete chậm và đắt; TTL xoá chậm (vài ngày).
</details>

**Câu 11.** Một `BatchWriteItem` trả về một số item trong **`UnprocessedItems`**. Bạn nên làm gì?

- A. Bỏ qua, DynamoDB sẽ tự xử lý sau
- B. Retry các item đó với **exponential backoff**
- C. Chuyển sang dùng `TransactWriteItems`
- D. Tạo thêm GSI

<details><summary>Đáp án</summary>

**B.** Batch có thể thất bại một phần (thường do thiếu capacity). Retry `UnprocessedItems` với exponential backoff, hoặc tăng WCU nếu xảy ra thường xuyên.
</details>

**Câu 12.** Bạn muốn tạo một index có **cùng Partition Key** nhưng **Sort Key khác** cho bảng **đã tồn tại**. Điều gì đúng?

- A. Tạo LSI bằng `UpdateTable`
- B. Không thể tạo LSI cho bảng đã tồn tại; phải tạo bảng mới (hoặc dùng GSI)
- C. LSI tạo được bất kỳ lúc nào, tối đa 20
- D. Chỉ cần bật Streams rồi tạo LSI

<details><summary>Đáp án</summary>

**B.** **LSI chỉ định nghĩa được lúc tạo bảng** (tối đa **5**). Với bảng có sẵn thì dùng **GSI** (có thể dùng lại cùng partition key với sort key khác) hoặc tạo bảng mới rồi copy dữ liệu.
</details>

**Câu 13.** Ứng dụng ghi vào bảng bị throttle, dù **WCU của bảng chính còn dư**. Bảng có một GSI. Nguyên nhân khả dĩ nhất?

- A. LSI hết capacity
- B. **GSI không đủ WCU** nên bị throttle, kéo theo bảng chính bị throttle
- C. DAX cluster quá tải
- D. Streams đang bật

<details><summary>Đáp án</summary>

**B.** Nếu ghi vào **GSI bị throttle** thì **bảng chính cũng bị throttle**. Cần tăng WCU cho GSI và chọn Partition Key của GSI tốt. LSI dùng chung capacity bảng chính nên không có vấn đề riêng.
</details>

**Câu 14.** Loại index nào hỗ trợ **strongly consistent read**?

- A. Chỉ GSI
- B. Chỉ LSI
- C. Cả LSI và GSI
- D. Không loại nào

<details><summary>Đáp án</summary>

**B.** **LSI** hỗ trợ eventually và strongly consistent. **GSI chỉ eventually consistent**.
</details>

**Câu 15.** Team phát triển quen dùng SQL và muốn truy vấn DynamoDB bằng cú pháp SQL (SELECT/INSERT/UPDATE/DELETE). Nên dùng gì?

- A. Amazon Athena
- B. PartiQL
- C. DynamoDB Streams
- D. Amazon RDS

<details><summary>Đáp án</summary>

**B.** **PartiQL** là ngôn ngữ tương thích SQL cho DynamoDB (không hỗ trợ JOIN).
</details>

**Câu 16.** Hai client có thể cùng sửa một item. Bạn muốn đảm bảo không client nào **ghi đè lên thay đổi** mà nó chưa thấy. Cách nào phù hợp?

- A. Atomic counter
- B. Optimistic Locking với attribute version + Conditional Write
- C. BatchWriteItem
- D. Tăng WCU

<details><summary>Đáp án</summary>

**B.** **Optimistic Locking**: mỗi update kèm điều kiện `version = :expected` và tăng version. Nếu item đã bị sửa thì update thất bại, client đọc lại rồi retry.
</details>

**Câu 17.** Ứng dụng đọc **cùng một số item rất nhiều lần**, gây hot key và throttle. Bạn muốn **độ trễ microsecond** mà **không phải viết lại logic ứng dụng**. Dùng gì?

- A. ElastiCache
- B. DynamoDB Accelerator (DAX)
- C. Tăng WCU
- D. DynamoDB Streams

<details><summary>Đáp án</summary>

**B.** **DAX** là cache in-memory tương thích API DynamoDB, độ trễ microsecond, giải quyết hot key. ElastiCache đòi hỏi tự viết logic cache.
</details>

**Câu 18.** **TTL mặc định** của dữ liệu trong cache DAX là bao lâu?

- A. 1 phút
- B. 5 phút
- C. 1 giờ
- D. 24 giờ

<details><summary>Đáp án</summary>

**B.** Mặc định **5 phút** cho item cache (và query cache), có thể chỉnh qua parameter group.
</details>

**Câu 19.** Bạn muốn **cache kết quả tính toán tổng hợp (aggregation)** từ dữ liệu DynamoDB. Dịch vụ nào phù hợp hơn?

- A. DAX
- B. ElastiCache
- C. DynamoDB Streams
- D. S3

<details><summary>Đáp án</summary>

**B.** DAX cache **item và kết quả Query/Scan**; kết quả **aggregation do ứng dụng tính** thì lưu ở **ElastiCache**.
</details>

**Câu 20.** Bạn muốn gửi **email chào mừng** mỗi khi có user mới được thêm vào bảng `Users`. Kiến trúc nào phù hợp nhất?

- A. Cron job Scan bảng mỗi phút
- B. **DynamoDB Streams + Lambda** (gửi qua SES/SNS)
- C. DAX
- D. TTL

<details><summary>Đáp án</summary>

**B.** Streams ghi lại thay đổi cấp item; Lambda (qua Event Source Mapping) xử lý event `INSERT` và gửi email. Có thể thêm event filtering chỉ cho `INSERT`.
</details>

**Câu 21.** Dữ liệu trong DynamoDB Streams được lưu tối đa bao lâu?

- A. 1 giờ
- B. 24 giờ
- C. 7 ngày
- D. 35 ngày

<details><summary>Đáp án</summary>

**B.** **24 giờ**. Cần lưu lâu hơn thì dùng **Kinesis Data Streams for DynamoDB** (tới 365 ngày).
</details>

**Câu 22.** Bạn muốn stream chứa **cả giá trị cũ và mới** của item mỗi khi thay đổi. Chọn `StreamViewType` nào?

- A. `KEYS_ONLY`
- B. `NEW_IMAGE`
- C. `OLD_IMAGE`
- D. `NEW_AND_OLD_IMAGES`

<details><summary>Đáp án</summary>

**D.** `NEW_AND_OLD_IMAGES` chứa cả item trước và sau khi thay đổi.
</details>

**Câu 23.** Bạn muốn **tự động xoá session hết hạn** trong DynamoDB mà **không tốn WCU**. Dùng gì?

- A. Lambda chạy định kỳ Scan + Delete
- B. **TTL** với attribute Number chứa epoch timestamp
- C. DAX
- D. `DeleteTable`

<details><summary>Đáp án</summary>

**B.** **TTL** xoá item hết hạn miễn phí (không tốn WCU), attribute kiểu **Number, epoch giây**. Item bị xoá trong vòng vài ngày nên vẫn cần filter khi đọc.
</details>

**Câu 24.** Lệnh `aws dynamodb scan` trên bảng lớn bị **timeout**. Tuỳ chọn CLI nào giúp khắc phục mà vẫn nhận đủ kết quả?

- A. `--max-items`
- B. `--page-size`
- C. `--starting-token`
- D. `--projection-expression`

<details><summary>Đáp án</summary>

**B.** **`--page-size`** khiến CLI gọi API nhiều lần với ít item mỗi lần (tránh timeout) nhưng vẫn trả đủ. `--max-items` + `--starting-token` dùng để phân trang kết quả.
</details>

**Câu 25.** Bạn cần **5 transactional write/giây**, mỗi item **3 KB**. Cần bao nhiêu WCU?

- A. 5
- B. 15
- C. 30
- D. 60

<details><summary>Đáp án</summary>

**C.** WCU thường = 5 × 3 = 15; transactional **gấp đôi** (prepare + commit) → **30 WCU**.
</details>

**Câu 26.** Ứng dụng bầu cử có 2 ứng viên, Partition Key là `Candidate_ID`, bị throttle ghi nghiêm trọng. Giải pháp nào phù hợp?

- A. Chuyển sang LSI
- B. Bật DAX
- C. **Write Sharding**: thêm random/calculated suffix vào Partition Key
- D. Dùng strongly consistent read

<details><summary>Đáp án</summary>

**C.** Partition Key chỉ có 2 giá trị gây hot partition. Thêm suffix (`Candidate_A-1`…`Candidate_A-N`) để phân tán ghi; DAX chỉ giúp đọc.
</details>

**Câu 27.** Ứng dụng mobile cho user đăng nhập qua Cognito và truy cập **trực tiếp** DynamoDB. Mỗi user chỉ được đọc/ghi **item của chính mình**. Bạn dùng điều kiện IAM nào?

- A. `dynamodb:Attributes`
- B. `dynamodb:LeadingKeys`
- C. `aws:SourceIp`
- D. `dynamodb:Select`

<details><summary>Đáp án</summary>

**B.** **`dynamodb:LeadingKeys`** giới hạn truy cập theo Partition Key (cấp row), ví dụ bằng `${cognito-identity.amazonaws.com:sub}`. `dynamodb:Attributes` giới hạn theo cột.
</details>

---

[← Chương 21](ch21-aws-serverless-lambda.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Chương 23 →](ch23-aws-serverless-api-gateway.md)
