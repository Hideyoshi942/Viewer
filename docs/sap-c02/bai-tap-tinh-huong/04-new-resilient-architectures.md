# Bài tập tình huống — Chủ đề 4: Multi-Region Resilience & Disaster Recovery — RTO/RPO, Route 53 ARC & Active-Active Patterns

> Chiến lược DR doanh nghiệp, Route 53 Application Recovery Controller (ARC) Readiness Checks & Routing Controls, Active-Active Multi-Region failover.
> **Số câu hỏi:** 10 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A payment processing platform runs Active-Active across us-east-1 and us-west-2. During a severe impairment in us-east-1, operators need to guarantee they can drain all customer traffic away from us-east-1 within 60 seconds, even if the Amazon Route 53 control plane API (located in us-east-1) is unavailable. The failover mechanism must also include safety guardrails to prevent operators from accidentally turning off traffic to both Regions simultaneously. Which solution should the Solutions Architect implement?

- **A.** Configure Route 53 weighted routing policies and run an AWS Lambda function in us-west-2 to call ChangeResourceRecordSets and set the us-east-1 record weight to 0.
- **B.** Use Route 53 Application Recovery Controller (ARC) Routing Controls with health checks, a minimum-1-on Safety Rule, and regional data plane endpoints.
- **C.** Use AWS Global Accelerator with Endpoint Groups in both Regions and rely on a custom IAM policy to prevent operators from setting both traffic dials to 0.
- **D.** Configure Amazon CloudFront Origin Groups with us-east-1 as the primary origin, us-west-2 as the secondary origin, and automatic failover on HTTP 5xx errors.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng xử lý thanh toán chạy Active-Active trên us-east-1 và us-west-2. Khi xảy ra sự cố nghiêm trọng tại us-east-1, người vận hành cần đảm bảo có thể rút toàn bộ lưu lượng khách hàng khỏi us-east-1 trong vòng 60 giây, ngay cả khi Amazon Route 53 control plane API (đặt tại us-east-1) không khả dụng. Cơ chế chuyển đổi dự phòng cũng phải bao gồm các rào cản an toàn để ngăn người vận hành vô tình tắt lưu lượng tới cả hai Region cùng lúc. Solutions Architect nên triển khai giải pháp nào?

**Đáp án đúng:** **B**

Khi thiết kế cơ chế failover đa vùng cấp doanh nghiệp không phụ thuộc vào Control Plane và có luật an toàn chống sai sót con người (safety rules), **Amazon Route 53 Application Recovery Controller (ARC) Routing Controls** là lựa chọn tối ưu nhờ kiến trúc 5-Region Data Plane Cluster Endpoints.

- **A:** API ChangeResourceRecordSets thuộc Route 53 Control Plane (chạy tại us-east-1). Khi us-east-1 bị sự cố nghiêm trọng, việc gọi API control plane có thể thất bại.
- **B (Đúng):** Chính xác. Route 53 ARC Routing Controls hoạt động trên các Data Plane Cluster Endpoints cực kỳ sẵn sàng (5 endpoints ở 5 Region khác nhau), không phụ thuộc vào Route 53 Control Plane ở us-east-1. Ngoài ra, ARC Safety Rules (Assertion rule: AtLeast 1) đảm bảo không thể tắt nhầm cả hai Region cùng lúc.
- **C:** IAM policy không thể đánh giá trạng thái hiện tại của traffic dial ở Region khác để làm safety rule chống tắt cả hai Region, và Global Accelerator control plane API cũng đặt tại us-west-2 (không có 5-region data plane cluster như ARC).
- **D:** CloudFront Origin Failover chỉ failover tự động theo mã lỗi HTTP (5xx/4xx) và không cung cấp cơ chế kiểm soát chuyển hướng chủ động kèm Safety Rules chống tắt cả hai Region.

</details>

### Câu 2 `medium`

A video streaming platform operates origin clusters in us-east-1, us-west-2, and an on-premises data center in Chicago. During regional sports events, the engineering team needs to dynamically expand or shrink the geographic area served by each cluster without modifying application code, so that users in the Midwest can be gradually shifted from the Chicago data center to us-east-1 or us-west-2 when capacity approaches 80%. Which Amazon Route 53 routing policy should the architect implement?

- **A.** Latency-based routing policy configured with Route 53 health checks across the three origin endpoints.
- **B.** Geoproximity routing policy with adjustable bias values configured via Amazon Route 53 Traffic Flow.
- **C.** Geolocation routing policy with country-level and continent-level DNS records configured in Route 53.
- **D.** Multivalue answer routing policy with Route 53 health checks returning up to eight healthy IP records.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng phát trực tuyến video vận hành các cụm origin tại us-east-1, us-west-2 và một trung tâm dữ liệu on-premises tại Chicago. Trong các sự kiện thể thao khu vực, đội ngũ kỹ sư cần mở rộng hoặc thu hẹp linh hoạt khu vực địa lý được phục vụ bởi mỗi cụm mà không sửa đổi mã nguồn ứng dụng, sao cho người dùng ở vùng Midwest có thể được chuyển dần từ trung tâm dữ liệu Chicago sang us-east-1 hoặc us-west-2 khi công suất tiến gần 80%. Kiến trúc sư nên triển khai chính sách định tuyến Amazon Route 53 nào?

**Đáp án đúng:** **B**

**Route 53 Geoproximity Routing** (thường cấu hình qua Traffic Flow) là lựa chọn duy nhất cho phép định tuyến theo khoảng cách địa lý tới cả **AWS Region lẫn on-premises coordinates** kèm khả năng tinh chỉnh **bias** để mở rộng/thu hẹp vùng phủ sóng lưu lượng.

- **A:** Latency-based routing chỉ hỗ trợ tài nguyên trong các AWS Region (không hỗ trợ trực tiếp data center on-premises theo tọa độ) và không cho phép điều chỉnh thủ công biên giới địa lý khi tải đạt 80%.
- **B (Đúng):** Chính xác. Geoproximity routing định tuyến người dùng dựa trên khoảng cách địa lý tới tài nguyên (hỗ trợ cả AWS Region và tọa độ kinh độ/vĩ độ của data center on-premises như Chicago) và cho phép điều chỉnh giá trị bias (+1 đến +99 hoặc -1 đến -99) để mở rộng hoặc thu hẹp vùng địa lý phục vụ một cách linh hoạt.
- **C:** Geolocation routing ánh xạ cứng theo ranh giới địa lý cố định (quốc gia/bang) và không có tham số bias để mở rộng hay thu hẹp linh hoạt vùng phục vụ của một cụm máy chủ.
- **D:** Multivalue answer trả về ngẫu nhiên tối đa 8 bản ghi khỏe mạnh, hoàn toàn không quan tâm tới vị trí địa lý hay độ dịch chuyển vùng phục vụ.

</details>

### Câu 3 `hard`

A global SaaS analytics vendor stores customer reports in Amazon S3 in us-east-1 and replicates them to eu-central-1 for disaster recovery with a strict 15-minute RPO SLA. Management requires a single global S3 endpoint so applications do not need code changes or DNS updates during a regional outage, and wants to shift 100% of S3 traffic from us-east-1 to eu-central-1 within 2 minutes using a controlled failover switch. Which solution meets these requirements?

- **A.** Migrate the customer reports to Amazon S3 Express One Zone in both Regions and synchronize them with AWS DataSync tasks every hour.
- **B.** Enable S3 Cross-Region Replication (CRR) and place an Amazon CloudFront distribution with an Origin Group and automated 5xx failover in front of both buckets.
- **C.** Configure S3 CRR with S3 RTC, create an S3 Multi-Region Access Point (MRAP) spanning both buckets, and use MRAP failover controls for Active-Passive routing.
- **D.** Use Amazon Route 53 Failover routing with CNAME records pointing directly to the two regional Amazon S3 bucket website endpoints.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà cung cấp phân tích SaaS toàn cầu lưu trữ báo cáo khách hàng trong Amazon S3 tại us-east-1 và sao chép sang eu-central-1 để khôi phục thảm họa với SLA RPO nghiêm ngặt là 15 phút. Ban quản lý yêu cầu một điểm cuối S3 toàn cầu duy nhất để ứng dụng không cần thay đổi mã nguồn hay cập nhật DNS trong sự cố khu vực, và muốn chuyển 100% lưu lượng S3 từ us-east-1 sang eu-central-1 trong vòng 2 phút bằng một công tắc chuyển đổi dự phòng có kiểm soát. Giải pháp nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **C**

Bộ đôi **S3 Multi-Region Access Points (MRAP) Active-Passive Failover Controls** + **S3 CRR với Replication Time Control (RTC)** là mẫu kiến trúc chuẩn cho lưu trữ object đa vùng có **global endpoint duy nhất**, **RPO cam kết SLA 15 phút**, và **chuyển đổi dự phòng < 2 phút** cho cả đọc lẫn ghi.

- **A:** S3 Express One Zone lưu dữ liệu trong 1 AZ duy nhất (rủi ro mất dữ liệu nếu hỏng AZ) và chạy DataSync mỗi giờ vi phạm RPO 15 phút.
- **B:** CloudFront Origin Group chỉ hỗ trợ failover cho các request đọc (GET/HEAD/OPTIONS), không hỗ trợ chuyển hướng request ghi (PUT/POST/DELETE) sang bucket dự phòng, và CRR không có RTC thì không có cam kết SLA 15 phút.
- **C (Đúng):** Chính xác. S3 CRR kết hợp S3 Replication Time Control (RTC) đảm bảo SLA sao chép 99.99% object trong vòng 15 phút (đáp ứng RPO 15 phút). S3 Multi-Region Access Point (MRAP) cung cấp một global endpoint duy nhất chạy trên AWS Global Accelerator và hỗ trợ failover controls chuyển 100% lưu lượng sang Region thụ động (Active-Passive) trong vòng dưới 2 phút mà không cần sửa code hay DNS.
- **D:** Trỏ Route 53 CNAME tới hai S3 bucket khác tên sẽ gây lỗi SSL/TLS hostname mismatch và yêu cầu tên bucket khớp với domain, đồng thời thời gian lan truyền TTL DNS khó kiểm soát chặt chẽ như MRAP failover controls.

</details>

### Câu 4 `medium`

A media publishing platform stores shared CMS assets on an Amazon EFS file system in us-east-1. To meet a disaster recovery requirement of 15-minute RPO without managing custom sync servers, the architect enables native Amazon EFS Replication to a newly created destination EFS file system in us-west-2. During a full DR drill simulating a us-east-1 outage, EC2 instances in us-west-2 mount the destination EFS file system but receive 'Read-only file system' errors when attempting to upload new articles. What is the correct procedure to make the destination EFS file system writable?

- **A.** Delete the EFS replication configuration on the destination file system in us-west-2 to promote it to a standalone read-write file system.
- **B.** Restore the latest AWS Backup EFS recovery point over the destination file system in us-west-2.
- **C.** Modify the EFS file system resource policy in us-west-2 to explicitly add the elasticfilesystem:ClientWrite and ClientMount actions.
- **D.** Unmount and remount the EFS file system in us-west-2 using the rw mount option and EFS mount helper in /etc/fstab across all EC2 instances.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng xuất bản truyền thông lưu trữ tài nguyên CMS dùng chung trên hệ thống tệp Amazon EFS tại us-east-1. Để đáp ứng yêu cầu khôi phục thảm họa RPO 15 phút mà không cần quản lý máy chủ đồng bộ tùy chỉnh, kiến trúc sư bật tính năng Amazon EFS Replication nguyên bản tới một hệ thống tệp EFS đích mới tạo tại us-west-2. Trong một cuộc diễn tập DR toàn diện mô phỏng sự cố tại us-east-1, các EC2 instance ở us-west-2 gắn kết hệ thống tệp EFS đích nhưng nhận được lỗi 'Read-only file system' khi cố tải lên bài viết mới. Quy trình đúng để làm cho hệ thống tệp EFS đích có thể ghi được là gì?

**Đáp án đúng:** **A**

Với **Amazon EFS Replication**, file system đích mặc định là **read-only**. Để thực hiện failover và cho phép ứng dụng ghi dữ liệu tại DR Region, bắt buộc phải **xóa replication configuration** nhằm promote file system đích lên trạng thái **read-write**.

- **A (Đúng):** Chính xác. Trong quy trình failover của Amazon EFS Replication, file system đích luôn ở trạng thái read-only để bảo toàn tính nhất quán dữ liệu nhân bản. Khi xảy ra thảm họa hoặc diễn tập DR, bạn phải xóa replication configuration (DeleteReplicationConfiguration) để biến file system đích thành một EFS độc lập có quyền đọc-ghi (read-write).
- **B:** Không cần khôi phục từ AWS Backup vì EFS Replication đã đồng bộ dữ liệu sẵn ở us-west-2 (RPO ~15 phút); chỉ cần xóa replication configuration để mở quyền ghi.
- **C:** Destination EFS file system luôn ở chế độ chỉ đọc (read-only) chừng nào cấu hình replication vẫn còn đang tồn tại; việc sửa IAM/file system policy không gỡ bỏ trạng thái read-only này.
- **D:** Trạng thái read-only được áp đặt từ tầng dịch vụ AWS EFS, không phải do mount option trên hệ điều hành Linux.

</details>

### Câu 5 `hard`

A high-traffic e-commerce checkout API runs across three Availability Zones behind an Application Load Balancer (ALB) in us-east-1. Occasionally, a single AZ experiences a 'gray failure' (elevated packet loss and database latency) where EC2 health checks still pass, causing degraded customer experience. The architecture team wants both an automated mechanism to shift traffic away from an impaired AZ without waiting for human intervention and a manual fast-action control to evacuate an AZ during application-specific anomalies. Which TWO configurations using Amazon Route 53 Application Recovery Controller (ARC) should the team implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Replace the Application Load Balancer with an AWS Global Accelerator pointing directly to EC2 instance IDs.
- **B.** Enable Cross-Zone Load Balancing on the ALB so healthy targets in other AZs can automatically absorb traffic routed to the impaired Availability Zone.
- **C.** Disable cross-zone load balancing on the Application Load Balancer so each AZ's ALB nodes only route to targets within the same AZ.
- **D.** Create a Route 53 ARC Routing Control in a Global Cluster and point the ALB's private IP addresses directly to Route 53 failover DNS records.
- **E.** Enable Route 53 ARC Zonal Autoshift on the ALB with practice runs configured, and use Zonal Shift when manual evacuation of a specific AZ is needed.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một API thanh toán thương mại điện tử lưu lượng cao chạy trên ba Availability Zone phía sau Application Load Balancer (ALB) tại us-east-1. Thỉnh thoảng, một AZ đơn lẻ gặp 'lỗi xám' (mất gói tin tăng cao và độ trễ cơ sở dữ liệu) trong khi kiểm tra sức khỏe EC2 vẫn đạt, gây suy giảm trải nghiệm khách hàng. Nhóm kiến trúc muốn có cả cơ chế tự động chuyển lưu lượng khỏi AZ bị suy giảm mà không cần chờ con người can thiệp VÀ một nút điều khiển hành động nhanh thủ công để rút tải khỏi một AZ khi có bất thường đặc thù của ứng dụng. Nhóm nên triển khai HAI cấu hình nào sử dụng Amazon Route 53 Application Recovery Controller (ARC)? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Để chống **gray failure trong một AZ** hiệu quả bằng **Route 53 ARC Zonal Shift & Zonal Autoshift**, cần đảm bảo hai điều kiện cốt lõi: (1) **Tắt Cross-Zone Load Balancing** trên ALB/NLB để đạt cô lập vùng (zonal isolation), và (2) Bật **Zonal Autoshift** (kèm practice runs) kết hợp **Zonal Shift** khi cần thao tác chủ động.

- **A:** Global Accelerator không tích hợp Zonal Autoshift cho từng AZ theo kiểu ALB/NLB và bỏ mất các tính năng L7 (HTTP/HTTPS routing, WAF) cần thiết cho checkout API.
- **B:** Ngược lại hoàn toàn: Zonal Shift/Autoshift yêu cầu TẮT Cross-Zone Load Balancing để ngăn lưu lượng từ AZ khỏe mạnh bị đẩy sang các instance lỗi trong AZ đang gặp sự cố.
- **C (Đúng):** Chính xác. Để Route 53 ARC Zonal Shift / Zonal Autoshift thực sự cô lập hoàn toàn lưu lượng khỏi một AZ bị suy giảm, bắt buộc phải tắt Cross-Zone Load Balancing trên ALB/NLB (nếu bật cross-zone, các node ALB ở AZ khỏe mạnh vẫn tiếp tục đẩy traffic sang target ở AZ lỗi).
- **D:** Routing Control dùng cho chuyển đổi mức Region/Cell ở tầng DNS (cần health check & record riêng), không phải cơ chế rút lưu lượng khỏi một AZ đơn lẻ trực tiếp trên ALB như Zonal Shift/Autoshift.
- **E (Đúng):** Chính xác. Zonal Autoshift cho phép AWS tự động chuyển lưu lượng ra khỏi AZ bị suy giảm (kèm practice runs định kỳ để đảm bảo đủ năng lực dự phòng ở các AZ còn lại), còn Zonal Shift cung cấp nút bấm/API chuyển lưu lượng thủ công cực nhanh khi xảy ra sự cố riêng của ứng dụng.

</details>

### Câu 6 `hard`

A rapidly scaling online gaming platform uses Amazon Aurora PostgreSQL to store real-time player inventory and microtransaction records. The cluster has already been vertically scaled to the largest available db.r7g.16xlarge writer instance, yet write throughput (TPS) and storage size are approaching single-writer limits during global game launches. The engineering team wants to scale write throughput horizontally across multiple PostgreSQL writer nodes while keeping a single database endpoint and avoiding rewriting application code to manage custom client-side database sharding. Which Amazon Aurora capability addresses this requirement?

- **A.** Enable Amazon RDS Proxy with connection multiplexing in front of the existing Aurora PostgreSQL db.r7g.16xlarge writer instance.
- **B.** Switch the Aurora PostgreSQL cluster to Amazon Aurora Serverless v2 with maximum capacity set to 128 ACUs for horizontal write scaling.
- **C.** Add 15 Aurora Read Replicas across multiple Availability Zones and enable Amazon Aurora Global Write Forwarding.
- **D.** Migrate to Amazon Aurora PostgreSQL Limitless Database, which shards tables across distributed writer nodes behind one endpoint.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng trò chơi trực tuyến đang mở rộng nhanh chóng sử dụng Amazon Aurora PostgreSQL để lưu trữ kho đồ người chơi và các bản ghi giao dịch vi mô theo thời gian thực. Cụm đã được mở rộng theo chiều dọc lên writer instance db.r7g.16xlarge lớn nhất hiện có, nhưng thông lượng ghi (TPS) và dung lượng lưu trữ đang tiệm cận giới hạn của một node ghi duy nhất trong các đợt ra mắt trò chơi toàn cầu. Đội ngũ kỹ sư muốn mở rộng thông lượng ghi theo chiều ngang trên nhiều PostgreSQL writer node trong khi vẫn giữ một database endpoint duy nhất và tránh viết lại mã nguồn ứng dụng để tự quản lý sharding cơ sở dữ liệu phía client. Khả năng nào của Amazon Aurora giải quyết yêu cầu này?

**Đáp án đúng:** **D**

Khi workload **PostgreSQL** chạm trần khả năng ghi của nút Writer lớn nhất (single-writer bottleneck) và không muốn tự viết logic sharding ở tầng ứng dụng, **Amazon Aurora Limitless Database** là giải pháp mở rộng ghi ngang (horizontal write sharding) được quản lý hoàn toàn.

- **A:** RDS Proxy giúp gộp kết nối (connection pooling) giảm tải RAM/CPU quản lý kết nối, nhưng không tăng giới hạn phần cứng tối đa của một nút writer duy nhất khi TPS đã chạm trần.
- **B:** Aurora Serverless v2 vẫn là kiến trúc single-writer (chỉ scale dọc một nút writer), không thể mở rộng ghi ngang vượt quá giới hạn của một instance đơn lẻ lớn nhất.
- **C:** Read Replicas chỉ giúp mở rộng lưu lượng đọc (read scaling); mọi lệnh ghi (kể cả qua Write Forwarding) vẫn dồn về một nút Writer duy nhất nên không giải quyết được nút thắt write throughput.
- **D (Đúng):** Chính xác. Amazon Aurora PostgreSQL Limitless Database cung cấp khả năng mở rộng ngang năng lực ghi (horizontal write scaling) vượt giới hạn của một nút Writer đơn lẻ bằng cách tự động phân mảnh (sharding) bảng trên nhiều nút writer phân tán ẩn sau một endpoint duy nhất, không bắt ứng dụng phải tự viết logic sharding.

</details>

### Câu 7 `medium`

A logistics enterprise operates 60 mission-critical Windows and Linux servers on-premises (running VMware vSphere and physical blades). Management mandates a disaster recovery solution in AWS with an RPO of less than 1 minute and an RTO of under 15 minutes, while keeping steady-state AWS costs as low as possible by avoiding running full-sized idle EC2 replicas continuously. Which AWS service is purpose-built for this DR strategy?

- **A.** AWS Backup with daily VMware virtual machine snapshots copied to Amazon S3.
- **B.** AWS Elastic Disaster Recovery (AWS DRS)
- **C.** AWS Storage Gateway Volume Gateway in Cached mode.
- **D.** Run 60 full-sized EC2 instances continuously in AWS using Active-Active replication.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp logistics vận hành 60 máy chủ Windows và Linux quan trọng tại chỗ (chạy VMware vSphere và máy chủ phiến vật lý). Ban quản lý bắt buộc phải có giải pháp khôi phục thảm họa trên AWS với RPO dưới 1 phút và RTO dưới 15 phút, đồng thời giữ chi phí AWS ở trạng thái ổn định thấp nhất có thể bằng cách tránh chạy liên tục các bản sao EC2 kích thước đầy đủ ở trạng thái nhàn rỗi. Dịch vụ AWS nào được xây dựng chuyên biệt cho chiến lược DR này?

**Đáp án đúng:** **B**

**AWS Elastic Disaster Recovery (AWS DRS)** là dịch vụ chuẩn cho bài toán **Pilot Light / Warm Standby tiết kiệm chi phí** đối với máy chủ on-premises (VMware/physical) hoặc EC2: dùng staging area giá rẻ để đạt **RPO tính bằng giây** và **RTO tính bằng phút**.

- **A:** Snapshot hàng ngày chỉ đạt RPO 24 giờ, vi phạm nghiêm trọng yêu cầu RPO dưới 1 phút.
- **B (Đúng):** Chính xác. AWS Elastic Disaster Recovery (AWS DRS) cài agent nhẹ sao chép liên tục ở tầng block (continuous block-level replication) sang một staging area chi phí thấp (t3.small replication servers + EBS gp3/st1) cho RPO tính bằng giây (< 1 phút). Chỉ khi xảy ra thảm họa hoặc diễn tập DR, AWS DRS mới tự động khởi chạy các EC2 instance cấu hình đầy đủ trong vài phút (RTO < 15 phút).
- **C:** Volume Gateway dùng để lưu trữ lai (hybrid storage) và tạo EBS snapshot định kỳ, không cung cấp khả năng sao chép liên tục nguyên máy chủ (OS + app + disks) và tự động khởi chạy EC2 failover với RPO < 1 phút như AWS DRS.
- **D:** Chạy liên tục 60 máy chủ EC2 đầy đủ cấu hình vi phạm yêu cầu tối ưu chi phí ở trạng thái bình thường (tránh chạy các bản sao EC2 full-sized nhàn rỗi).

</details>

### Câu 8 `hard`

A brokerage firm must retain financial trade audit logs in Amazon S3 and database backups in AWS Backup for 7 years to comply with SEC Rule 17a-4 (WORM - Write-Once-Read-Many). Regulators require cryptographic assurance that NO user—not even the AWS account root user—can delete, overwrite, or shorten the retention period of any log or backup during the 7-year window, protecting against both malicious insiders and ransomware attacks. Which configuration meets these strict immutability requirements?

- **A.** Enable S3 Versioning and MFA Delete on the S3 audit bucket without enabling S3 Object Lock or Backup Vault Lock.
- **B.** Attach an S3 Bucket Policy and AWS Backup Vault Access Policy with an explicit Deny on all Delete and PutRetention actions for Principal '*'.
- **C.** Enable S3 Object Lock in Compliance mode (7-year retention) and AWS Backup Vault Lock in Compliance mode (minimum 7-year retention).
- **D.** Enable S3 Object Lock in Governance mode on the S3 bucket and configure AWS Backup Vault Lock in Governance mode with a 7-year immutable retention period.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty môi giới chứng khoán phải lưu giữ nhật ký kiểm toán giao dịch tài chính trong Amazon S3 và bản sao lưu cơ sở dữ liệu trong AWS Backup suốt 7 năm để tuân thủ SEC Rule 17a-4 (WORM - Write-Once-Read-Many). Cơ quan quản lý yêu cầu sự đảm bảo mật mã rằng KHÔNG một người dùng nào—kể cả AWS account root user—có thể xóa, ghi đè hoặc rút ngắn thời gian lưu giữ của bất kỳ nhật ký hay bản sao lưu nào trong khoảng thời gian 7 năm, bảo vệ trước cả người nội bộ độc hại lẫn tấn công ransomware. Cấu hình nào đáp ứng các yêu cầu bất biến nghiêm ngặt này?

**Đáp án đúng:** **C**

Để đạt chuẩn bất biến **WORM (SEC 17a-4)** và chống ransomware/root-user compromise, bắt buộc phải dùng **Compliance Mode** (không phải Governance Mode) trên cả **S3 Object Lock** và **AWS Backup Vault Lock**.

- **A:** MFA Delete vẫn cho phép root user có thiết bị MFA xóa vĩnh viễn các phiên bản object, không đạt chuẩn WORM không thể xóa trong 7 năm như Compliance mode.
- **B:** Root user vẫn luôn có quyền sửa hoặc xóa Bucket Policy / Vault Access Policy rồi sau đó xóa dữ liệu, nên không đạt chuẩn WORM chống insider/ransomware tuyệt đối.
- **C (Đúng):** Chính xác. Compliance mode trên cả S3 Object Lock và AWS Backup Vault Lock đảm bảo tính bất biến tuyệt đối (WORM): một khi đã khóa (sau grace/cooling-off period đối với Backup Vault Lock), không một ai — kể cả AWS account root user — có thể xóa dữ liệu hay rút ngắn thời hạn lưu trữ 7 năm.
- **D:** Governance mode vẫn cho phép các IAM principal có quyền đặc biệt (như s3:BypassGovernanceRetention) hoặc root user xóa hoặc rút ngắn thời gian lưu giữ, nên không đáp ứng yêu cầu tuân thủ nghiêm ngặt của SEC Rule 17a-4 (không ai kể cả root user được phép xóa).

</details>

### Câu 9 `hard`

A multi-tenant B2B SaaS platform serves 10,000 enterprise customers from a shared cluster of 16 backend worker nodes. Recently, a single customer sent a malformed 'poison-pill' API request that triggered an unhandled memory leak, crashing all 16 worker nodes one after another as requests retried, causing a 100% outage for all 10,000 customers. The architecture team wants to drastically reduce the blast radius of any future poison-pill or noisy-neighbor event without provisioning 10,000 dedicated single-tenant clusters. Which resilience pattern should the architect adopt?

- **A.** Disable all HTTP retries on the client SDKs and increase worker node memory without isolating backend compute pools.
- **B.** Implement Cell-Based Architecture with Shuffle Sharding, mapping each tenant to a subset of independent cells so poison-pill requests only affect that subset.
- **C.** Double the shared backend cluster size from 16 to 32 worker nodes behind a single round-robin Application Load Balancer with sticky sessions enabled.
- **D.** Move the 16 shared backend worker nodes into a Multi-Region Active-Active setup with Route 53 failover without changing the shared tenancy model.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng SaaS B2B đa thuê bao phục vụ 10.000 khách hàng doanh nghiệp từ một cụm dùng chung gồm 16 backend worker node. Gần đây, một khách hàng đơn lẻ đã gửi một yêu cầu API lỗi ('poison-pill') kích hoạt rò rỉ bộ nhớ không được xử lý, làm sập lần lượt cả 16 worker node khi các yêu cầu được thử lại, gây gián đoạn 100% cho toàn bộ 10.000 khách hàng. Nhóm kiến trúc muốn giảm mạnh phạm vi ảnh hưởng của bất kỳ sự cố poison-pill hoặc noisy-neighbor nào trong tương lai mà không phải cấp phát 10.000 cụm đơn thuê chuyên dụng. Kiến trúc sư nên áp dụng mẫu hình phục hồi nào?

**Đáp án đúng:** **B**

**Cell-Based Architecture** kết hợp **Shuffle Sharding** là mẫu kiến trúc nâng cao kinh điển của AWS (được dùng ngay trong Route 53) nhằm thu hẹp tối đa **blast radius** trước các cuộc tấn công DDoS, noisy-neighbor hoặc **poison-pill requests** trong hệ thống multi-tenant quy mô lớn.

- **A:** Chỉ tắt retry ở phía client không thể kiểm soát được người dùng hoặc script bên ngoài gửi lặp lại yêu cầu độc hại vào cụm backend dùng chung.
- **B (Đúng):** Chính xác. Kiến trúc Cell-Based kết hợp Shuffle Sharding (ví dụ mỗi khách hàng chỉ được ánh xạ vào một tổ hợp 2 trong 8 cell độc lập — tạo ra C(8,2) = 28 tổ hợp ảo) đảm bảo một poison-pill request tối đa chỉ làm hỏng 2 cell mà khách hàng đó chạm tới, giới hạn blast radius xuống phần rất nhỏ mà không cần tốn chi phí dựng 10.000 cụm riêng lẻ.
- **C:** Tăng từ 16 lên 32 node chung một pool round-robin vẫn không cô lập được poison-pill request: khi client retry, yêu cầu độc hại sẽ lần lượt đánh sập toàn bộ cả 32 node (100% blast radius).
- **D:** Nếu poison-pill request vẫn có thể lan sang toàn bộ cụm chia sẻ (kể cả khi failover sang Region thứ hai), lỗi phần mềm vẫn sẽ làm sập cả hai Region.

</details>

### Câu 10 `hard`

A global fintech company operates a mission-critical payment platform across us-east-1 and eu-west-1. The platform uses Amazon Route 53 for Multi-Region failover. During a recent regional outage simulation, engineers discovered that Route 53 Control Plane API calls failed and that the recovery Region lacked sufficient EC2 service quotas to handle peak load. Which solution provides the HIGHEST resilience and prevents both issues?

- **A.** Move all public DNS hosting to an external third-party DNS provider using Control Plane APIs and keep EC2 Auto Scaling groups running at 200% capacity in both Regions.
- **B.** Configure Amazon Route 53 Weighted Routing policies with a 60-second TTL, enable Route 53 health checks, and run a weekly AWS Lambda script to audit EC2 instance counts and service quotas.
- **C.** Implement Amazon Route 53 Application Recovery Controller (ARC) with Readiness Checks to audit capacity/quotas and Routing Controls using Data Plane cluster endpoints with Safety Rules.
- **D.** Enable AWS Auto Scaling predictive scaling in eu-west-1 to pre-provision capacity and configure Amazon Route 53 Geolocation routing with standard Control Plane failover.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty fintech toàn cầu vận hành nền tảng thanh toán quan trọng trên us-east-1 và eu-west-1. Nền tảng sử dụng Amazon Route 53 cho chuyển đổi dự phòng đa Region. Trong một lần mô phỏng sự cố khu vực gần đây, các kỹ sư phát hiện rằng các lệnh gọi Route 53 Control Plane API bị lỗi và Region khôi phục thiếu hạn mức dịch vụ (service quota) EC2 để xử lý tải cao điểm. Giải pháp nào mang lại khả năng phục hồi CAO NHẤT và ngăn chặn cả hai vấn đề này?

**Đáp án đúng:** **C**

**Amazon Route 53 Application Recovery Controller (ARC)** là giải pháp chuẩn cấp doanh nghiệp cho Multi-Region Failover: **Readiness Checks** phát hiện sớm thiếu hụt quotas/capacity ở DR Region, còn **Routing Controls** chạy trên **Data Plane Cluster** giúp chuyển hướng traffic an toàn ngay cả khi Control Plane gặp sự cố.

- **A:** Tự chạy 200% capacity gây lãng phí chi phí khổng lồ và chuyển sang DNS ngoài không giải quyết bài toán kiểm tra tự động service quotas và readiness của hạ tầng AWS.
- **B:** Weighted Routing vẫn phụ thuộc vào Route 53 Control Plane API khi cần thay đổi trọng số trong lúc sự cố, và script thủ công không kiểm tra toàn diện quotas và readiness như ARC.
- **C (Đúng):** Chính xác. Route 53 ARC cung cấp Readiness Checks liên tục kiểm tra quotas/capacity tại DR Region, và Routing Controls hoạt động trên Data Plane Cluster 5 endpoints cực kỳ bền bỉ (không phụ thuộc Control Plane ở us-east-1) kèm Safety Rules tránh lỗi thao tác.
- **D:** Predictive Scaling không tự động tăng AWS Service Quotas (hard/soft limits) khi vượt trần và Geolocation routing không cung cấp cơ chế Data Plane failover switch.

</details>

---

[Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md)
