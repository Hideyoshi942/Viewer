# Bài tập tình huống — Chủ đề 7: NoSQL Serverless — Amazon DynamoDB & DAX

> Partition Key & Sort Key, RCU/WCU, LSI vs GSI, DynamoDB Streams, TTL, Optimistic Locking, Transactions & DAX Caching.
> **Số câu hỏi:** 21 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án & Giải thích chi tiết**.

---

### Câu 1 `medium`

An inventory management service stores product stock quantities in an Amazon DynamoDB table. Multiple concurrent Lambda workers read an item's `quantity` and `version` attributes, subtract the ordered amount, and write the updated item back. To prevent lost updates when two workers modify the same product simultaneously, which mechanism should the developer implement?

- **A.** Use DynamoDB Optimistic Locking by adding a `ConditionExpression` that checks `version = :expectedVersion` and increments `version` on each `UpdateItem` call.
- **B.** Enable DynamoDB Streams on the inventory table and process all concurrent item updates asynchronously through a Global Secondary Index (GSI).
- **C.** Use the `BatchWriteItem` API instead of `UpdateItem` for single-item inventory updates to guarantee atomic compare-and-swap locking.
- **D.** Switch the DynamoDB table read mode from Eventually Consistent Reads to Strongly Consistent Reads without modifying the `UpdateItem` write operation or adding conditions.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

**DynamoDB Optimistic Locking (Conditional Writes)**:
- Dùng **`ConditionExpression`** trong `PutItem` / `UpdateItem` / `DeleteItem` (ví dụ `version = :v` hoặc `attribute_not_exists(id)`).
- Nếu điều kiện sai -> ném lỗi **`ConditionalCheckFailedException`**.
- Lưu ý: **`BatchWriteItem`** KHÔNG hỗ trợ `ConditionExpression`; muốn nhiều item cùng có điều kiện nguyên tử hãy dùng **`TransactWriteItems`**.

- **A (Đúng):** Đúng! Optimistic Locking sử dụng `ConditionExpression` (hoặc `@DynamoDBVersionAttribute` trong SDK) kiểm tra số phiên bản trước khi ghi. Nếu worker khác đã cập nhật trước, DynamoDB trả về `ConditionalCheckFailedException` để ứng dụng đọc lại và thử lại.
- **B:** Sai vì GSI là read-only index đồng bộ bất đồng bộ (eventually consistent), không dùng để khóa ghi đồng thời.
- **C:** Sai vì `BatchWriteItem` không hỗ trợ `ConditionExpression` nên không thể thực hiện Optimistic Locking.
- **D:** Sai vì Strongly Consistent Reads chỉ đảm bảo đọc được dữ liệu mới nhất tại thời điểm đọc, không ngăn được race condition (lost update) xảy ra giữa lúc đọc và lúc ghi của hai worker song song.

</details>

### Câu 2 `hard`

A mobile gaming backend uses Amazon DynamoDB and experiences heavy read traffic (95% reads, 5% writes) for player leaderboard items. The team adds Amazon DynamoDB Accelerator (DAX) to reduce read latency to microseconds. However, a specific microservice that requires strongly consistent reads for financial coin balances reports stale data when reading through the DAX client. How should the developer resolve this issue?

- **A.** Increase the DAX Item Cache TTL to 24 hours so that stale financial items are served consistently across all cluster nodes.
- **B.** Enable DynamoDB Streams on the table and attach an AWS Lambda trigger to automatically invalidate the DAX item cache on writes.
- **C.** Configure the financial microservice to bypass DAX and query DynamoDB directly using `ConsistentRead=True`.
- **D.** Pass `ConsistentRead=True` to the DAX client's `GetItem` call so DAX always fetches fresh data from DynamoDB.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Các giới hạn cần nhớ về **DynamoDB Accelerator (DAX)** trong đề DVA-C02:
- DAX lý tưởng cho **read-heavy workloads** cần độ trễ **microseconds** (vài trăm micro giây) mà không cần sửa logic ứng dụng nhiều.
- DAX **KHÔNG phù hợp** khi: (1) cần **Strongly Consistent Reads**, (2) **write-heavy** workloads, (3) ứng dụng thực hiện nhiều phép tính tổng hợp/aggregation phức tạp, hoặc (4) ghi trực tiếp vào DynamoDB bỏ qua DAX (gây lệch cache).

- **A:** Sai vì tăng TTL chỉ làm dữ liệu cũ tồn tại lâu hơn trong cache.
- **B:** Sai vì DAX tự cập nhật qua cơ chế write-through khi ứng dụng ghi qua DAX; nếu ứng dụng ghi trực tiếp vào DynamoDB (bỏ qua DAX), DynamoDB Streams không tự động cập nhật DAX.
- **C (Đúng):** Đúng! DAX luôn sử dụng mô hình cache eventually consistent (kể cả khi truyền `ConsistentRead=True` vào DAX, DAX vẫn đọc từ cache hoặc ghi nhận dữ liệu có thể trễ). Các tác vụ đòi hỏi Strongly Consistent Reads bắt buộc phải gọi thẳng tới DynamoDB API.
- **D:** Sai vì DAX không hỗ trợ Strongly Consistent Reads; khi nhận `ConsistentRead=True`, DAX chuyển tiếp request xuống DynamoDB nhưng không cập nhật cache và không đảm bảo mô hình đồng bộ xuyên suốt cho các thao tác cache khác — giải pháp chuẩn của AWS là không dùng DAX cho workload cần strongly consistent reads.

</details>

### Câu 3 `medium`

A banking application stores account balances in an Amazon DynamoDB table (`Accounts`). When transferring $100 from Account A to Account B, both the debit on Account A (checking that `balance >= 100`) and the credit on Account B must either BOTH succeed or BOTH fail together. Which DynamoDB API operation guarantees this all-or-nothing atomicity?

- **A.** `BatchWriteItem`
- **B.** `TransactWriteItems`
- **C.** `UpdateItem` with `ReturnValues: ALL_NEW`
- **D.** `PutItem` with `ConsistentRead: True`

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

So sánh **`TransactWriteItems`** vs **`BatchWriteItem`** trong DynamoDB:
- **`TransactWriteItems`**: Hỗ trợ **ACID** (all-or-nothing), hỗ trợ `ConditionCheck`, tốn **2x WCU** (do chạy 2 pha prepare/commit).
- **`BatchWriteItem`**: Tối đa 25 items/16 MB, **không** có ACID, **không** hỗ trợ `ConditionExpression`.

- **A:** Sai vì `BatchWriteItem` không có tính giao dịch ACID (một phần item có thể thành công trong khi phần khác thất bại) và cũng không hỗ trợ `ConditionExpression`.
- **B (Đúng):** Đúng! **`TransactWriteItems`** cung cấp tính chất **ACID** nguyên tử (all-or-nothing) trên tối đa 100 items (hoặc 4 MB) trong một hoặc nhiều bảng DynamoDB cùng Region, hỗ trợ `ConditionCheck` (`balance >= 100`).
- **C:** Sai vì `UpdateItem` chỉ thao tác nguyên tử trên **1 item duy nhất**, không gộp được 2 tài khoản A và B.
- **D:** Sai vì `PutItem` không có tham số `ConsistentRead` và chỉ ghi 1 item.

</details>

### Câu 4 `hard`

An Amazon DynamoDB table stores 10 million customer order items, of which only 5,000 orders currently have an `isExpedited` attribute (set to `"true"`). An admin dashboard needs to query ONLY those 5,000 expedited orders quickly without scanning the entire 10-million-item table or wasting write capacity on non-expedited items. What is the MOST efficient DynamoDB design?

- **A.** Create a Local Secondary Index (LSI) on the existing table with `isExpedited` as the Partition Key to isolate expedited orders.
- **B.** Use a DynamoDB `Scan` operation with a `FilterExpression` checking `isExpedited = true` across the entire 10-million-item table.
- **C.** Store `isExpedited = "false"` on all 9,995,000 non-expedited items and index `isExpedited` in a Global Secondary Index (GSI) for fast querying.
- **D.** Create a Global Secondary Index (GSI) with `isExpedited` as the Partition Key (Sparse Index), setting `isExpedited` only on expedited items.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

**DynamoDB Sparse Index**:
- Một GSI chỉ chứa các item **có tồn tại** Partition Key (và Sort Key nếu có) của GSI đó.
- Bằng cách chỉ ghi thuộc tính `isExpedited` cho các đơn hàng cần lọc (bỏ qua không ghi thuộc tính này cho các đơn thường), GSI trở thành một **Sparse Index** siêu nhẹ, thay thế hoàn hảo cho `Scan`.

- **A:** Sai vì LSI **bắt buộc** dùng chung Partition Key với bảng chính (chỉ cho phép đổi Sort Key) và không thể tạo thêm sau khi bảng đã tồn tại.
- **B:** Sai vì `Scan` vẫn đọc toàn bộ 10 triệu item và tính đủ RCU trước khi áp dụng `FilterExpression`, cực kỳ chậm và đắt.
- **C:** Sai vì gán giá trị `"false"` cho 9.995 triệu item sẽ làm toàn bộ 10 triệu item bị đẩy vào GSI (mất tính chất Sparse Index) và tạo Hot Partition trên giá trị `"false"`.
- **D (Đúng):** Đúng! Đây là kỹ thuật **Sparse Index** trong DynamoDB: chỉ những item có chứa thuộc tính key của GSI (`isExpedited`) mới được chiếu (project) vào GSI, giúp GSI cực nhỏ gọn, query nhanh và không tốn chi phí lưu trữ/WCU cho 9,995,000 item còn lại.

</details>

### Câu 5 `easy`

An application stores temporary user session tokens in an Amazon DynamoDB table. Each session item should automatically expire 24 hours after creation without consuming provisioned Write Capacity Units (WCUs), and an AWS Lambda function should archive expired sessions to Amazon S3 when they are removed. How should the developer implement this?

- **A.** Enable DynamoDB TTL on a Unix epoch attribute (`expiresAt`) and trigger Lambda from DynamoDB Streams filtering for `REMOVE` events with `userIdentity.type == "Service"`.
- **B.** Store `expiresAt` as an ISO-8601 string (e.g., `2026-11-13T10:00:00Z`) and enable DynamoDB Time to Live (TTL) on that string attribute.
- **C.** Schedule an EventBridge rule every hour to invoke a Lambda function that `Scan`s the entire table and calls `DeleteItem` on expired sessions.
- **D.** Enable Amazon S3 Lifecycle expiration rules directly on the DynamoDB table to automatically archive and delete expired session items.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Chi tiết thi **DynamoDB TTL**:
- Kiểu dữ liệu bắt buộc: **Number (Unix epoch time in seconds)**.
- **Không tốn WCU** và miễn phí.
- Thời gian xóa nền: thường trong vòng **48 giờ** sau khi hết hạn (nên lọc thêm điều kiện `expiresAt > now` ở phía ứng dụng nếu cần chính xác từng giây).
- Kết hợp **DynamoDB Streams** để archive dữ liệu hết hạn sang S3/Kinesis.

- **A (Đúng):** Đúng! DynamoDB **TTL** tự động xóa item hết hạn (thường trong vòng 48 giờ) **miễn phí và không tiêu tốn WCU**. Các item bị TTL xóa sẽ phát sinh sự kiện `REMOVE` trong **DynamoDB Streams** (kèm `userIdentity.principalId: dynamodb.amazonaws.com`) để Lambda lưu trữ sang S3.
- **B:** Sai vì thuộc tính TTL của DynamoDB **bắt buộc** phải là kiểu **Number** lưu **Unix epoch timestamp tính bằng giây** (không phải ISO string hay milliseconds).
- **C:** Sai vì `Scan` + `DeleteItem` thủ công tiêu tốn rất nhiều RCU và WCU.
- **D:** Sai vì S3 Lifecycle không áp dụng cho DynamoDB.

</details>

### Câu 6 `medium`

An AWS Lambda function running inside a private VPC subnet needs to read and write items in Amazon DynamoDB without traversing the public internet and without incurring hourly or per-GB data processing charges for a NAT Gateway or Interface Endpoint. Which VPC connectivity option should be configured?

- **A.** Use AWS Direct Connect between the VPC and DynamoDB.
- **B.** Attach an Internet Gateway (IGW) to the private subnet and assign a public IPv4 address to the Lambda ENI for DynamoDB access.
- **C.** Create a Gateway VPC Endpoint for Amazon DynamoDB and associate it with the private subnet's route table.
- **D.** Create an Interface VPC Endpoint (AWS PrivateLink) for Amazon DynamoDB.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Phân biệt 2 loại **VPC Endpoint**:
- **Gateway Endpoint** (Miễn phí, cấu hình qua Route Table): Chỉ hỗ trợ **Amazon S3** và **Amazon DynamoDB**.
- **Interface Endpoint / AWS PrivateLink** (Tính phí theo giờ + GB, tạo ENI trong subnet): Hỗ trợ hầu hết các dịch vụ AWS khác (SQS, SNS, KMS, Secrets Manager, STS, ECR, Bedrock...).

- **A:** Sai vì Direct Connect dùng để nối mạng on-premises với AWS, không dùng để nối VPC nội bộ tới DynamoDB.
- **B:** Sai vì Lambda chạy trong VPC không có public IP và việc đi qua Internet Gateway vi phạm yêu cầu không đi qua public internet.
- **C (Đúng):** Đúng! **Gateway VPC Endpoint** hỗ trợ duy nhất 2 dịch vụ là **Amazon S3** và **Amazon DynamoDB**, hoàn toàn **miễn phí** (không tính phí giờ hay phí xử lý GB) và định tuyến traffic qua route table nội bộ AWS mà không cần NAT Gateway.
- **D:** Sai vì Interface VPC Endpoint có tính phí theo giờ mỗi AZ và phí theo GB dữ liệu (trong khi DynamoDB hỗ trợ Gateway Endpoint miễn phí).

</details>

### Câu 7 `medium`

A newly launched marketing campaign causes sudden, unpredictable traffic spikes (from 10 requests/sec to 20,000 requests/sec within 2 minutes) against an Amazon DynamoDB table. Currently, the table uses Provisioned Capacity with Auto Scaling, but DynamoDB Auto Scaling reacts too slowly to the sudden spike, causing `ProvisionedThroughputExceededException` errors. Which capacity mode handles sudden, unpredictable spikes with zero throttling?

- **A.** Decrease the DynamoDB Auto Scaling target utilization from 70% to 65%.
- **B.** Convert all GSIs into LSIs.
- **C.** Switch the DynamoDB table to On-Demand Capacity mode.
- **D.** Enable DynamoDB Streams with a `BatchSize` of 1,000.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Chọn chế độ **DynamoDB Capacity Mode**:
- **Provisioned (+ Auto Scaling)**: Rẻ hơn (tới ~7 lần nếu tải ổn định/dễ đoán), phù hợp tải tăng giảm từ từ.
- **On-Demand**: Trả tiền theo từng triệu request, **co giãn tức thì** cho lưu lượng **đột biến bất ngờ (spiky / unpredictable)**.

- **A:** Sai vì DynamoDB Auto Scaling vẫn cần vài phút để phản ứng qua CloudWatch Alarms, không kịp cho cú sốc tăng 2,000 lần trong 2 phút.
- **B:** Sai vì không thể đổi GSI thành LSI sau khi tạo bảng, và LSI dùng chung WCU/RCU với bảng chính.
- **C (Đúng):** Đúng! **DynamoDB On-Demand** tự động co giãn tức thì theo lưu lượng thực tế (hỗ trợ đột biến gấp đôi mức đỉnh trước đó ngay lập tức), không cần dự báo trước RCU/WCU, cực kỳ phù hợp cho traffic bất ngờ không đoán trước được.
- **D:** Sai vì DynamoDB Streams chỉ xuất sự kiện thay đổi dữ liệu ra ngoài, không tăng năng lực RCU/WCU của bảng.

</details>

### Câu 8 `medium`

An application queries an Amazon DynamoDB table that has 1 million items. The developer uses the `Query` API with `KeyConditionExpression` and also adds a `FilterExpression` to match `status = "ACTIVE"`, setting `Limit: 10`. However, DynamoDB returns only 2 items (with `LastEvaluatedKey` present) instead of 10 items. Why did DynamoDB return fewer than 10 items?

- **A.** DynamoDB applies `Limit: 10` BEFORE `FilterExpression`, so it read 10 matching items, filtered out 8 inactive ones, and returned 2.
- **B.** Using `FilterExpression` reduces Read Capacity Unit (RCU) consumption to only the 2 returned active items.
- **C.** DynamoDB `Query` only supports the `Limit` parameter accurately when `ConsistentRead` is set to `False`.
- **D.** The remaining 8 inactive items were automatically deleted by DynamoDB Streams during the `Query` operation execution phase on the table.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Bẫy thi kinh điển về **`FilterExpression` trong DynamoDB**:
1. `FilterExpression` chạy **SAU** khi đọc dữ liệu -> **KHÔNG giảm RCU** và **KHÔNG tăng tốc độ**.
2. `Limit` giới hạn số item **được đọc trước khi lọc**, nên số item trả về có thể nhỏ hơn `Limit` (thậm chí rỗng) dù vẫn còn `LastEvaluatedKey` để phân trang tiếp.

- **A (Đúng):** Đúng! Thứ tự thực thi của `Query` / `Scan` trong DynamoDB là: (1) Đọc tối đa `Limit` items (hoặc 1 MB) từ bảng/index -> (2) Tính phí RCU cho cả 10 items đó -> (3) Áp dụng `FilterExpression` để loại bớt -> (4) Trả về kết quả và `LastEvaluatedKey`.
- **B:** Sai hoàn toàn (đây là bẫy thi rất phổ biến!): `FilterExpression` **KHÔNG** giúp giảm RCU tiêu thụ vì DynamoDB vẫn phải đọc đủ `Limit` (hoặc toàn bộ partition) trước khi lọc.
- **C:** Sai vì `Limit` hoạt động với cả Strongly và Eventually Consistent Reads.
- **D:** Sai vì DynamoDB Streams chỉ đọc thay đổi, không xóa item.

</details>

### Câu 9 `medium`

A developer needs to create a secondary index on an existing Amazon DynamoDB table that already contains 50 million items. The new index needs a completely different Partition Key (`email`) from the base table's Partition Key (`userId`). Which type of index can be added to an existing DynamoDB table?

- **A.** Composite Primary Key
- **B.** Global Secondary Index (GSI)
- **C.** Local Secondary Index (LSI)
- **D.** DynamoDB Accelerator (DAX) Index

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

So sánh **GSI vs LSI** trong DynamoDB:
- **LSI**: Tạo **cùng lúc tạo bảng**, **chung Partition Key** (chỉ đổi Sort Key), dùng chung RCU/WCU với bảng chính, hỗ trợ Strongly Consistent Reads, tối đa 5 LSI/bảng, giới hạn 10 GB mỗi partition key.
- **GSI**: Tạo/xóa **bất cứ lúc nào**, **đổi cả Partition Key & Sort Key**, có RCU/WCU riêng, chỉ hỗ trợ Eventually Consistent Reads, tối đa 20 GSI/bảng.

- **A:** Sai vì Primary Key của bảng không thể thay đổi sau khi tạo bảng.
- **B (Đúng):** Đúng! **GSI** có thể tạo hoặc xóa bất kỳ lúc nào sau khi bảng đã tồn tại, và cho phép dùng **Partition Key + Sort Key hoàn toàn khác** với bảng gốc.
- **C:** Sai vì **LSI** chỉ có thể tạo **ngay lúc tạo bảng** (không thể thêm sau) và **bắt buộc** dùng chung Partition Key (`userId`) với bảng gốc.
- **D:** Sai vì DAX là cluster cache trong bộ nhớ, không phải secondary index.

</details>

### Câu 10 `medium`

An Amazon DynamoDB table (`Orders`) has a Provisioned Write Capacity of 100 WCU, and a Global Secondary Index (`CustomerIndex`) on that table has a Provisioned Write Capacity of only 10 WCU. What happens when the application writes 50 items per second to the `Orders` table, all of which include the GSI key attributes?

- **A.** Writes to the `Orders` table succeed at 50 WCU and the extra 40 GSI updates are silently dropped.
- **B.** The GSI automatically borrows unused WCU from the `Orders` base table whenever its own provisioned write capacity is exceeded.
- **C.** The GSI becomes throttled at 10 WCU, which causes backpressure and throttles writes to the base `Orders` table as well.
- **D.** DynamoDB automatically converts the throttled GSI into an LSI to share the base table's provisioned throughput.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Bẫy thi **DynamoDB GSI Throttling**:
- Nếu **GSI bị thiếu WCU**, nó sẽ **throttle ngược lại bảng chính** (kể cả khi bảng chính vẫn còn dư WCU).
- Nguyên tắc: WCU của GSI phải luôn lớn hơn hoặc bằng lượng ghi thực tế chiếu lên GSI (hoặc dùng On-Demand / Auto Scaling cho cả bảng và GSI).

- **A:** Sai vì DynamoDB không bao giờ âm thầm làm mất dữ liệu đồng bộ sang GSI.
- **B:** Sai vì GSI có WCU/RCU hoàn toàn tách biệt với bảng chính (trừ chế độ On-Demand tự co giãn cả hai).
- **C (Đúng):** Đúng! Khi ghi vào bảng chính có chứa thuộc tính của GSI, DynamoDB phải đẩy bản cập nhật sang GSI. Nếu GSI thiếu WCU (10 WCU < 50 WCU), bộ đệm nội bộ sẽ đầy và gây **backpressure làm nghẽn (throttle) luôn cả thao tác ghi trên bảng chính**!
- **D:** Sai vì GSI không thể tự chuyển thành LSI.

</details>

### Câu 11 `medium`

A developer is designing a single-table Amazon DynamoDB schema to store both `Customers` and `Orders` in the same table (`AppData`). Using the composite primary key (`PK`, `SK`), how should the developer model the keys so a single `Query` can retrieve a customer's profile AND all of their orders sorted by order date?

- **A.** Create a DynamoDB foreign key constraint linking the `Orders` table to the `Customers` table.
- **B.** Set `PK = "CUST#<customerId>"` for both entities; set `SK = "PROFILE"` for the customer item and `SK = "ORDER#<isoDate>#<orderId>"` for order items.
- **C.** Store all 10,000 orders of a customer inside a single 1 MB list attribute on the Customer item (which exceeds the 400 KB DynamoDB item size limit).
- **D.** Set `PK` to a random UUID for every item and use `Scan` with a `FilterExpression` on `customerId`.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Nguyên tắc **DynamoDB Single-Table Design & Limits**:
- Kích thước tối đa **1 item = 400 KB**.
- Gom nhóm thực thể liên quan bằng **`PK` chung** và phân biệt bằng **`SK` prefix** (`PROFILE`, `ORDER#<date>`) để lấy dữ liệu chỉ với 1 lần `Query`.

- **A:** Sai vì DynamoDB là cơ sở dữ liệu NoSQL, không hỗ trợ `JOIN` hay Foreign Key constraint.
- **B (Đúng):** Đúng! Đây là mẫu thiết kế **Single-Table Design (Item Collection)** chuẩn trong DynamoDB: gom nhiều thực thể liên quan vào cùng `PK` (`CUST#<id>`), dùng tiền tố `SK` (`PROFILE`, `ORDER#<isoDate>`) để vừa lấy tất cả trong **1 lần `Query`**, vừa dễ lọc với `begins_with(SK, "ORDER#")`.
- **C:** Sai vì kích thước tối đa của **1 item DynamoDB chỉ là 400 KB**, không thể chứa danh sách đơn hàng tăng trưởng vô hạn.
- **D:** Sai vì dùng UUID ngẫu nhiên cho `PK` buộc phải `Scan` toàn bộ bảng, cực kỳ chậm và tốn kém.

</details>

### Câu 12 `medium`

An Amazon DynamoDB table (`Products`) receives 100 writes per second and needs to maintain a real-time synchronized search index in Amazon OpenSearch Service so users can perform full-text fuzzy searches on product descriptions. Which serverless pattern provides near-real-time synchronization from DynamoDB to OpenSearch?

- **A.** Enable DynamoDB Streams (`NEW_AND_OLD_IMAGES`) and trigger a Lambda function to index changes into OpenSearch.
- **B.** Create a Global Secondary Index (GSI) on the DynamoDB table with native full-text fuzzy search enabled.
- **C.** Run an EventBridge cron job every 5 minutes that executes a DynamoDB `Scan` and overwrites the entire OpenSearch index.
- **D.** Enable DynamoDB Accelerator (DAX) in front of the table and point OpenSearch full-text queries directly to DAX.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

**DynamoDB Streams**:
- Lưu nhật ký thay đổi item theo thứ tự trong **24 giờ**.
- Kết hợp **Lambda** để: đồng bộ sang **OpenSearch**, gửi thông báo, tính tổng hợp (aggregates), hoặc archive dữ liệu TTL.

- **A (Đúng):** Đúng! **DynamoDB Streams + AWS Lambda** là mẫu kiến trúc chuẩn để đồng bộ thay đổi theo thời gian thực (Insert/Modify/Remove) sang Amazon OpenSearch Service để phục vụ tìm kiếm toàn văn (full-text search).
- **B:** Sai vì DynamoDB GSI chỉ hỗ trợ so khớp chính xác hoặc tiền tố (`begins_with`) trên Sort Key, không hỗ trợ full-text fuzzy search.
- **C:** Sai vì `Scan` toàn bộ bảng mỗi 5 phút rất tốn RCU và không đạt độ trễ near-real-time.
- **D:** Sai vì DAX không hỗ trợ full-text fuzzy search.

</details>

### Câu 13 `medium`

An application calculates the exact DynamoDB Read Capacity Units (RCUs) needed for a workload that performs **100 Strongly Consistent Reads per second** of items that are **7 KB** in size. How many RCUs should the developer provision?

- **A.** 400 RCUs
- **B.** 700 RCUs
- **C.** 200 RCUs
- **D.** 100 RCUs

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Công thức tính **DynamoDB RCU & WCU** (bắt buộc nhớ):
- **1 RCU**: 1 Strongly Consistent Read/s (hoặc 2 Eventually Consistent Reads/s) cho item **≤ 4 KB** (làm tròn lên bội số 4 KB).
- **1 WCU**: 1 Write/s cho item **≤ 1 KB** (làm tròn lên bội số 1 KB).

- **A:** Sai vì `ceil(7 / 4) = 2`, không phải 4.
- **B:** Sai vì 1 KB là đơn vị của **WCU** (1 WCU = 1 KB/s), còn RCU tính theo khối **4 KB**.
- **C (Đúng):** Đúng! 1 RCU = 1 Strongly Consistent Read/giây cho item tối đa **4 KB**. Với item **7 KB**, làm tròn lên bội số của 4 KB là `8 KB / 4 KB = 2 RCUs` mỗi lần đọc. Vậy `100 reads/s × 2 RCUs = 200 RCUs`.
- **D:** Sai vì 100 RCUs chỉ đủ cho item ≤ 4 KB (hoặc Eventually Consistent Reads cho item ≤ 8 KB).

</details>

### Câu 14 `medium`

An application writes **50 items per second** to an Amazon DynamoDB table, where each item is **2.5 KB** in size. How many Write Capacity Units (WCUs) are required?

- **A.** 150 WCUs
- **B.** 125 WCUs
- **C.** 50 WCUs
- **D.** 300 WCUs

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Tính **WCU**: `ceil(ItemSizeKB) × WritesPerSecond`. Với `2.5 KB` -> làm tròn lên `3 KB` -> `3 × 50 = 150 WCUs`. (Nếu dùng `TransactWriteItems` thì nhân 2).

- **A (Đúng):** Đúng! 1 WCU = 1 lần ghi/giây cho item tối đa **1 KB**. Với item **2.5 KB**, làm tròn lên thành **3 KB** -> cần `3 WCUs` mỗi lần ghi. Tổng: `50 writes/s × 3 WCUs = 150 WCUs`.
- **B:** Sai vì DynamoDB làm tròn lên số nguyên KB (`ceil(2.5) = 3`), không tính lẻ 2.5.
- **C:** Sai vì 50 WCUs chỉ đủ cho item ≤ 1 KB.
- **D:** Sai vì 300 WCUs chỉ đúng nếu dùng `TransactWriteItems` (gấp đôi WCU).

</details>

### Câu 15 `medium`

An Amazon DynamoDB table (`Sessions`) is experiencing throttling on `GetItem` and `PutItem` requests. The developer wants to identify the exact **Partition Keys** that are receiving the most traffic or causing the most throttled requests in real time. Which DynamoDB observability feature reveals the most frequently accessed and throttled keys?

- **A.** Enable DynamoDB Point-in-Time Recovery (PITR) to track top throttled partition keys.
- **B.** Enable S3 Storage Lens on the DynamoDB backup bucket.
- **C.** Enable Amazon CloudWatch Contributor Insights for DynamoDB on the table.
- **D.** Enable AWS X-Ray Sampling Rules on the DynamoDB table.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

**CloudWatch Contributor Insights for DynamoDB**: Công cụ số 1 để tìm **Hot Keys / Most Throttled Keys** trên bảng DynamoDB hoặc GSI.

- **A:** Sai vì PITR dùng để sao lưu/khôi phục dữ liệu theo từng giây trong 35 ngày.
- **B:** Sai vì S3 Storage Lens chỉ dành cho Amazon S3.
- **C (Đúng):** Đúng! **CloudWatch Contributor Insights for DynamoDB** tạo biểu đồ Top-N các **Partition Keys / Sort Keys** được truy cập nhiều nhất và bị throttle nhiều nhất, giúp phát hiện chính xác **Hot Partition**.
- **D:** Sai vì X-Ray chỉ theo dõi độ trễ API gọi DynamoDB, không thống kê Top-N Partition Keys bị truy cập nhiều nhất trên bảng.

</details>

### Câu 16 `medium`

A microservice runs on AWS Fargate and needs to call Amazon DynamoDB. Occasionally, DynamoDB returns a `500 Internal Server Error` or `ProvisionedThroughputExceededException`. The developer wants to make sure the client retries failed requests reliably without overwhelming DynamoDB if thousands of containers retry at the exact same millisecond. Which retry pattern is recommended by AWS?

- **A.** Immediate tight-loop retries with zero delay (`while True: retry()`).
- **B.** Fixed-interval retries at exact 1.000-second intervals across all container instances simultaneously.
- **C.** Disable all retries and return `HTTP 500` immediately to users.
- **D.** Exponential Backoff with Jitter (built into the AWS SDK's `standard` / `adaptive` retry modes).

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

**Exponential Backoff with Jitter**:
- Được tích hợp sẵn trong AWS SDK (`standard` và `adaptive` retry modes).
- Tránh **Thundering Herd** khi nhiều client cùng retry đồng thời.

- **A:** Sai vì retry tức thì không chờ sẽ làm quá tải nặng thêm hệ thống đang bị nghẽn.
- **B:** Sai vì không có Jitter nên tất cả container vẫn dồn request vào cùng một thời điểm.
- **C:** Sai vì bỏ qua retry cho lỗi thoáng qua (transient error) làm giảm độ tin cậy của ứng dụng.
- **D (Đúng):** Đúng! **Exponential Backoff with Jitter** tăng dần thời gian chờ theo cấp số nhân (100ms, 200ms, 400ms...) cộng thêm một khoảng ngẫu nhiên (**Jitter**) để dàn trải các lần thử lại, tránh hiệu ứng **Thundering Herd**.

</details>

### Câu 17 `medium`

An e-commerce application stores inventory counts in Amazon DynamoDB. Two concurrent Lambda invocations read `stock = 1` for the same product and both try to decrement it to `0`, causing overselling. How should the developer prevent race conditions using DynamoDB native features?

- **A.** Use Optimistic Locking with a `version` attribute and a `ConditionExpression` (`version = :expectedVersion` or `stock >= :qty`) on `UpdateItem`.
- **B.** Switch the DynamoDB table from Provisioned capacity mode to On-Demand capacity mode.
- **C.** Enable DynamoDB Streams and deduplicate conflicting concurrent stock updates in Lambda.
- **D.** Enable DynamoDB Accelerator (DAX) in front of the table to serialize concurrent item updates.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Để chống ghi đè đồng thời (race condition) trên DynamoDB, luôn dùng **Conditional Writes (`ConditionExpression`)** hoặc **Optimistic Locking (`version` attribute)**.

- **A (Đúng):** Đúng! **Conditional Writes / Optimistic Locking** kiểm tra điều kiện nguyên tử (`ConditionExpression`) ngay tại thời điểm ghi, từ chối request thứ hai bằng `ConditionalCheckFailedException`.
- **B:** Sai vì capacity mode không giải quyết bài toán concurrency control.
- **C:** Sai vì Streams chạy sau khi ghi đã xảy ra.
- **D:** Sai vì DAX là tầng cache tăng tốc đọc, không ngăn race condition khi ghi đè.

</details>

### Câu 18 `medium`

A DynamoDB table has a heavy read workload where 90% of requests read the same set of hot product items using `GetItem`. A developer needs to reduce read latency from milliseconds down to microseconds with minimal code changes. Which AWS solution fits best?

- **A.** Enable DynamoDB Auto Scaling with target utilization 50% for hot read partition items.
- **B.** Deploy Amazon DynamoDB Accelerator (DAX) and use the DAX SDK client.
- **C.** Use `Scan` with `ParallelScan` instead of `GetItem`.
- **D.** Create a Global Secondary Index (GSI) for the hot items.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Gặp từ khóa **DynamoDB + microsecond read latency + minimal code changes + hot `GetItem`/`Query`** -> **DAX**.

- **A:** Sai vì Auto Scaling tăng RCU chứ không giảm độ trễ từng request xuống micro-giây.
- **B (Đúng):** Đúng! **DAX** là in-memory cache tương thích hoàn toàn API của DynamoDB, giảm độ trễ đọc xuống **micro-giây** chỉ bằng việc đổi client sang DAX SDK.
- **C:** Sai hoàn toàn, `Scan` chậm và tốn RCU hơn rất nhiều.
- **D:** Sai vì GSI vẫn đọc từ ổ đĩa DynamoDB ở mức mili-giây, không xuống micro-giây.

</details>

### Câu 19 `medium`

A DynamoDB table uses `pk` (`userId`) as Partition Key and `sk` (`orderDate`) as Sort Key. Users frequently need to query orders by `status` (`PENDING`, `SHIPPED`) sorted by `orderDate`, which is not the primary key. The table already exists with millions of items in production. What should the developer create?

- **A.** Create a Global Secondary Index (GSI) with `status` as Partition Key and `orderDate` as Sort Key.
- **B.** Modify the existing DynamoDB table's Primary Key schema in place using `UpdateTable`.
- **C.** Use DynamoDB `Scan` with `FilterExpression` `status = :s` across the entire table in production traffic.
- **D.** Create a Local Secondary Index (LSI) on the existing table with `status` as Partition Key.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Bảng đã tạo xong và cần truy vấn theo Partition Key mới -> **bắt buộc dùng GSI** (LSI chỉ tạo được lúc khởi tạo bảng và dùng chung Partition Key).

- **A (Đúng):** Đúng! **GSI** có thể tạo **bất kỳ lúc nào** trên bảng đã tồn tại và cho phép chọn **Partition Key hoàn toàn mới** (`status`).
- **B:** Sai vì DynamoDB không cho sửa Primary Key của bảng hiện có.
- **C:** Sai vì Scan toàn bảng hàng triệu item cực chậm và tốn RCU.
- **D:** Sai vì **LSI** bắt buộc tạo **lúc tạo bảng** và phải dùng chung Partition Key (`userId`) của bảng gốc.

</details>

### Câu 20 `medium`

A developer is designing an Amazon DynamoDB table to store customer orders with `customerId` as the partition key and `orderDate` as the sort key. After the table is in production with millions of items, the business team requests a new feature to query orders by `customerId` and `orderStatus` with Strongly Consistent Reads. However, when the developer attempts to add a Local Secondary Index (LSI) to the existing table, the operation fails. Why did the operation fail, and what is the alternative?

- **A.** Create the Local Secondary Index (LSI) without a sort key on the existing DynamoDB table, or migrate the order history workload to an Amazon Redshift data warehouse cluster for ad-hoc queries.
- **B.** Enable DynamoDB Streams with the `NEW_AND_OLD_IMAGES` view type on the existing table first, because LSIs require an active stream before they can be provisioned.
- **C.** Recreate the DynamoDB table with the Local Secondary Index (LSI) defined at creation time, or create a Global Secondary Index (GSI) on the existing table with Eventually Consistent Reads.
- **D.** Wait until the DynamoDB table has fewer than 1,000 items or export the table to Amazon S3, because DynamoDB blocks adding any secondary indexes on populated tables.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Bảng so sánh sống còn **LSI vs GSI** trong DynamoDB:
- **LSI (Local Secondary Index)**: Tối đa **5 LSIs**, chỉ tạo được **lúc tạo bảng**, dùng chung Partition Key với bảng gốc, giới hạn **10 GB trên mỗi giá trị Partition Key**, hỗ trợ **Strongly & Eventually Consistent Reads**.
- **GSI (Global Secondary Index)**: Tối đa **20 GSIs**, tạo/sửa/xóa **bất kỳ lúc nào**, có RCU/WCU riêng, chỉ hỗ trợ **Eventually Consistent Reads**.

- **A:** Sai vì bản chất của LSI chính là giữ nguyên Partition Key của bảng gốc và thay đổi Sort Key.
- **B:** Sai vì DynamoDB Streams không liên quan đến việc tạo LSI.
- **C (Đúng):** Đúng! LSI bắt buộc phải khai báo ngay lúc tạo bảng (`CreateTable`) và hỗ trợ Strongly Consistent Read; còn GSI có thể thêm/xóa bất cứ lúc nào trên bảng đang chạy nhưng chỉ hỗ trợ Eventually Consistent Read.
- **D:** Sai vì bạn có thể thêm GSI (tối đa 20 GSIs mặc định) vào bảng DynamoDB bất cứ lúc nào.

</details>

### Câu 21 `medium`

An Amazon DynamoDB table stores session items with an average item size of 6 KB. An application requires 100 strongly consistent reads per second. How many Read Capacity Units (RCUs) must be provisioned for the table?

- **A.** 200 RCUs
- **B.** 400 RCUs
- **C.** 100 RCUs
- **D.** 150 RCUs

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Công thức tính RCU của DynamoDB (luôn làm tròn kích thước item lên bội số của 4 KB):
- **Strongly Consistent Read**: `(Size_làm_tròn_4KB / 4) * số_lượt_đọc/s`
- **Eventually Consistent Read**: `(Size_làm_tròn_4KB / 4) * số_lượt_đọc/s / 2`
- **Transactional Read**: `(Size_làm_tròn_4KB / 4) * số_lượt_đọc/s * 2`

- **A (Đúng):** Đúng! 1 RCU đọc được 1 item tối đa 4 KB ở chế độ Strongly Consistent. Item 6 KB làm tròn lên 8 KB -> tốn 8 / 4 = 2 RCU/item. Với 100 lượt đọc/giây: 100 * 2 = 200 RCU.
- **B:** Sai vì 400 RCU là mức dành cho Transactional Reads (tốn gấp đôi Strongly Consistent Reads).
- **C:** Sai vì 6 KB làm tròn lên bội số của 4 KB là 8 KB (tức 2 RCU cho mỗi lượt đọc Strongly Consistent).
- **D:** Sai vì DynamoDB luôn làm tròn kích thước item lên bội số nguyên gần nhất của 4 KB (6 KB -> 8 KB), không tính lẻ 1.5.

</details>

---

[← Bộ trước](06-dva-aws-lambda.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Bộ tiếp theo →](08-dva-api-gateway.md)
