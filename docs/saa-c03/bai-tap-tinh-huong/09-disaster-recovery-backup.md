# Bài tập tình huống — Chủ đề 9: Disaster Recovery, AWS Backup & Dịch vụ AI/ML Managed

> 4 chiến lược Disaster Recovery (Backup & Restore, Pilot Light, Warm Standby, Multi-Site Active-Active), RTO/RPO, AWS Backup & AI/ML Services (Rekognition, Comprehend, Textract).
> **Số câu hỏi:** 4 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A company runs a mission-critical application in `us-east-1` and wants to implement a Disaster Recovery (DR) strategy in `us-west-2` with an RTO of 10-15 minutes and an RPO of less than 1 minute, while keeping ongoing DR infrastructure costs low. In the DR Region, the database runs continuously to stay synchronized, while application EC2 instances remain powered off until a failover occurs. Which DR strategy is this?

- **A.** Backup and Restore
- **B.** Pilot Light
- **C.** Warm Standby
- **D.** Multi-Site Active-Active

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty vận hành một ứng dụng quan trọng tại `us-east-1` và muốn triển khai chiến lược Khôi phục Thảm họa (DR) tại `us-west-2` với RTO từ 10-15 phút và RPO dưới 1 phút, đồng thời giữ chi phí hạ tầng DR thường xuyên ở mức thấp. Tại Region DR, cơ sở dữ liệu chạy liên tục để đồng bộ, trong khi các EC2 instance của ứng dụng vẫn tắt cho đến khi xảy ra failover. Đây là chiến lược DR nào?

**Đáp án đúng:** **B**

**DB đang chạy đồng bộ + App/Compute đang TẮT** ở DR Region = **Pilot Light**.

- **A:** Sai vì Backup and Restore không chạy sẵn database ở DR Region và có RTO tính bằng giờ.
- **B (Đúng):** Đúng! **Pilot Light** giữ **Database chạy đồng bộ liên tục** ở DR Region (giữ RPO < 1 phút), trong khi các máy chủ **EC2/Compute đang TẮT** để tiết kiệm tiền và chỉ bật lên khi có thảm họa (RTO ~10-15 phút).
- **C:** Sai vì Warm Standby giữ cả Database LẪN Compute đều đang chạy ở quy mô thu nhỏ.
- **D:** Sai vì Multi-Site chạy full-scale ở cả hai Region đồng thời.

</details>

### Câu 2 `medium`

A global SaaS application uses Amazon Aurora PostgreSQL in `us-east-1`. The company is expanding to Europe and Asia and requires local low-latency reads for users in those regions, as well as a cross-region Disaster Recovery solution with an RPO of 1 second and an RTO of under 1 minute. Which database architecture should the architect recommend?

- **A.** Amazon RDS for PostgreSQL Multi-AZ
- **B.** Amazon Aurora Global Database
- **C.** Amazon DynamoDB Accelerator (DAX)
- **D.** AWS DMS continuous replication to an EC2 PostgreSQL instance

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng SaaS toàn cầu sử dụng Amazon Aurora PostgreSQL tại `us-east-1`. Công ty đang mở rộng sang châu Âu và châu Á, yêu cầu tốc độ đọc độ trễ thấp tại địa phương cho người dùng ở các khu vực đó, cũng như giải pháp Khôi phục Thảm họa đa Region với RPO 1 giây và RTO dưới 1 phút. Kiến trúc sư nên đề xuất kiến trúc cơ sở dữ liệu nào?

**Đáp án đúng:** **B**

Yêu cầu **PostgreSQL/MySQL đa Region + RPO ~ 1 giây + RTO < 1 phút** → **Amazon Aurora Global Database**.

- **A:** Sai vì RDS Multi-AZ chỉ hoạt động trong 1 Region duy nhất.
- **B (Đúng):** Đúng! **Aurora Global Database** nhân bản dữ liệu sang tối đa 5 Secondary Regions ở tầng storage với độ trễ **< 1 giây (RPO = 1s)** và có thể promote thành Primary trong **< 1 phút (RTO < 1m)**.
- **C:** Sai vì DAX chỉ dành cho DynamoDB, không dùng cho PostgreSQL.
- **D:** Sai vì tự quản lý EC2 PostgreSQL + DMS tốn nhiều công sức vận hành và không đạt RTO < 1 phút dễ dàng như Aurora Global Database.

</details>

### Câu 3 `hard`

A mission-critical e-commerce application runs in `us-east-1` with a strict Recovery Time Objective (RTO) of less than 5 minutes and a Recovery Point Objective (RPO) of less than 1 minute in the event of a full Regional outage. The company wants to minimize costs compared to running full production capacity in two Regions simultaneously. Which TWO architectural approaches meet these requirements? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Use a Backup and Restore strategy with daily Amazon S3 Cross-Region Replication and scheduled AWS Backup snapshots.
- **B.** Use a Warm Standby strategy in `us-west-2` with a scaled-down, always-running application tier and Auto Scaling.
- **C.** Deploy an Active-Active Multi-Site architecture with 100% full production capacity running in both Regions at all times.
- **D.** Use Amazon Aurora Global Database with a primary cluster in `us-east-1` and a secondary cluster in `us-west-2`.
- **E.** Use Amazon RDS automated snapshots copied every 6 hours asynchronously to `us-west-2` for database recovery.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng thương mại điện tử quan trọng chạy tại `us-east-1` với Recovery Time Objective (RTO) nghiêm ngặt dưới 5 phút và Recovery Point Objective (RPO) dưới 1 phút trong trường hợp toàn bộ Region gặp sự cố. Công ty muốn giảm thiểu chi phí so với việc chạy toàn bộ công suất production đồng thời ở hai Region. HAI phương pháp kiến trúc nào đáp ứng các yêu cầu này? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

4 chiến lược DR trong SAA-C03 theo thứ tự RTO/RPO giảm dần và chi phí tăng dần: **Backup & Restore** (giờ) -> **Pilot Light** (10-30 phút) -> **Warm Standby** (vài phút) -> **Multi-Site Active-Active** (gần như 0). Kết hợp **Aurora Global Database** để đạt RPO < 1 giây.

- **A:** Sai vì Backup and Restore có RTO và RPO tính bằng hàng giờ, không thể đáp ứng RTO < 5 phút và RPO < 1 phút.
- **B (Đúng):** Đúng! Chiến lược Warm Standby duy trì một bản sao thu nhỏ luôn chạy ở Region dự phòng giúp đạt RTO tính bằng phút (< 5 phút) với chi phí thấp hơn Active-Active Multi-Site.
- **C:** Sai vì mặc dù đáp ứng RTO/RPO nhưng không đáp ứng yêu cầu tối ưu chi phí hơn so với chạy full capacity ở cả 2 Region.
- **D (Đúng):** Đúng! Aurora Global Database sao chép dữ liệu giữa các Region với độ trễ thường dưới 1 giây (đáp ứng RPO < 1 phút) và có thể promote thành primary trong vòng dưới 1 phút.
- **E:** Sai vì RPO sẽ lên tới 6 giờ, vi phạm yêu cầu RPO < 1 phút.

</details>

### Câu 4 `medium`

An e-commerce platform requires a multi-Region disaster recovery (DR) strategy with an RTO of less than 5 minutes and an RPO near zero. Management wants the secondary Region to run a scaled-down, fully functional version of both the application tier and database tier at all times, and automatically scale out only when a failover occurs. Which disaster recovery strategy does this describe?

- **A.** Backup and Restore
- **B.** Pilot Light
- **C.** Warm Standby
- **D.** Multi-Site Active-Active

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng thương mại điện tử yêu cầu chiến lược khôi phục thảm họa (DR) đa Region với RTO dưới 5 phút và RPO gần bằng 0. Ban quản lý muốn Region dự phòng luôn chạy một phiên bản thu nhỏ nhưng hoạt động đầy đủ của cả tầng ứng dụng lẫn tầng cơ sở dữ liệu tại mọi thời điểm, và chỉ tự động mở rộng quy mô (scale out) khi xảy ra failover. Điều này mô tả chiến lược khôi phục thảm họa nào?

**Đáp án đúng:** **C**

Cách phân biệt **Pilot Light** và **Warm Standby**:
- **Pilot Light**: DB chạy đồng bộ, nhưng Web/App servers ở DR đang **TẮT**.
- **Warm Standby**: Cả DB lẫn Web/App servers ở DR đều **ĐANG CHẠY** nhưng với số lượng/cấu hình nhỏ (`scaled-down copy`).

- **A:** Sai vì Backup and Restore không có sẵn bất kỳ hạ tầng nào đang chạy ở Region DR, RTO lên tới hàng giờ.
- **B:** Sai vì trong Pilot Light, chỉ có tầng cơ sở dữ liệu được đồng bộ, còn tầng máy chủ ứng dụng (EC2/ECS) ở Region DR đang tắt và chỉ bật lên khi failover.
- **C (Đúng):** Đúng! Warm Standby duy trì một bản sao thu nhỏ (scaled-down) nhưng đầy đủ chức năng và luôn hoạt động (always-on) ở Region DR, giúp đạt RTO tính bằng phút.
- **D:** Sai vì Multi-Site Active-Active chạy tải sản xuất với quy mô đầy đủ (full production scale) ở cả 2 Region nên chi phí đắt nhất.

</details>

---

[Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md)
