# Thẻ ghi nhớ (Flashcards) — SAP-C02

> 40 thẻ · Đọc mặt trước, tự trả lời rồi mở đáp án.

## Chủ đề 1: Multi-Account Governance — AWS Organizations, SCPs, IAM Identity Center & Cross-Account Access

**1. Trong AWS Organizations, Service Control Policy (SCP) có ảnh hưởng tới tài khoản Management Account và Service-Linked Roles không?**

<details><summary>Xem đáp án</summary>

KHÔNG! SCP không bao giờ áp dụng lên Management Account (kể cả IAM users/roles trong đó) và không hạn chế AWS Service-Linked Roles. Ngoài ra, SCP chỉ đặt giới hạn tối đa (guardrails) chứ không tự cấp quyền — vẫn cần IAM Policy cấp phép.

</details>

**2. SCP (Service Control Policy) trong AWS Organizations có áp dụng cho Management Account và Service-Linked Roles không?**

<details><summary>Xem đáp án</summary>

KHÔNG. SCP chỉ giới hạn quyền tối đa (guardrails) cho các Member Accounts (bao gồm cả root user của member account), không áp dụng cho Management Account và không chặn Service-Linked Roles.

</details>

**3. Làm thế nào để ngăn chặn lỗ hổng Confused Deputy khi cấp Cross-Account IAM Role cho đối tác SaaS bên thứ ba?**

<details><summary>Xem đáp án</summary>

Bắt buộc thêm điều kiện `sts:ExternalId` (một chuỗi bí mật duy nhất do bên thứ 3 cung cấp cho từng khách hàng) vào Trust Policy của IAM Role.

</details>

## Chủ đề 2: Enterprise Landing Zone — Control Tower, CfCT, AFT, Service Catalog & AWS RAM

**4. Trong kiến trúc Hybrid DNS đa tài khoản, thành phần nào của Route 53 Resolver được chia sẻ qua AWS RAM?**

<details><summary>Xem đáp án</summary>

Chỉ có Outbound Forwarding Rules mới chia sẻ được qua AWS RAM cho các Member Account trong Organization. Inbound/Outbound Endpoints KHÔNG chia sẻ trực tiếp qua RAM — chúng được đặt tập trung trong Shared Services/Network VPC.

</details>

**5. Dịch vụ nào cung cấp phân quyền chi tiết mức cột/dòng/ô (Column/Row/Cell-level security) cho S3 Data Lake đa tài khoản mà không cần nhân bản dữ liệu?**

<details><summary>Xem đáp án</summary>

AWS Lake Formation kết hợp với Tag-Based Access Control (LF-TBAC) và chia sẻ tài nguyên xuyên tài khoản qua AWS Resource Access Manager (RAM).

</details>

**6. Phân biệt Route 53 Resolver Inbound Endpoint và Outbound Endpoint trong Hybrid DNS?**

<details><summary>Xem đáp án</summary>

Inbound Endpoint nhận DNS queries TỪ on-premises gửi VÀO AWS (để phân giải Route 53 Private Hosted Zones). Outbound Endpoint (+ Forwarding Rules) gửi DNS queries TỪ AWS RA DNS server on-premises; Forwarding Rules có thể chia sẻ đa tài khoản qua AWS RAM.

</details>

**7. Launch Constraints trong AWS Service Catalog mang lại lợi ích bảo mật gì?**

<details><summary>Xem đáp án</summary>

Gắn một IAM Role vào Product để Service Catalog dùng role đó tạo tài nguyên (VPC, RDS, EKS). Developer chỉ cần quyền khởi chạy Product trên Service Catalog mà KHÔNG cần được cấp quyền trực tiếp lên các dịch vụ AWS bên dưới (Least Privilege).

</details>

## Chủ đề 3: Enterprise Hybrid Networking — Direct Connect, BGP, Transit Gateway, Route 53 Resolver & Network Firewall

**8. Khi nào BẮT BUỘC phải dùng Transit VIF trên AWS Direct Connect, và yêu cầu băng thông tối thiểu của Hosted Connection là bao nhiêu?**

<details><summary>Xem đáp án</summary>

Transit VIF bắt buộc dùng khi kết nối Direct Connect tới Transit Gateway thông qua Direct Connect Gateway (DXGW). Nếu dùng Hosted Connection, băng thông tối thiểu phải >= 1 Gbps (1G, 2G, 5G, 10G); Hosted Connection < 1 Gbps (ví dụ 500 Mbps) KHÔNG hỗ trợ Transit VIF.

</details>

**9. Thứ tự ưu tiên điều khiển lưu lượng BGP từ AWS đi về On-Premises trên Direct Connect để thiết lập Active/Passive là gì?**

<details><summary>Xem đáp án</summary>

1) Longest Prefix Match (ưu tiên tuyệt đối) -> 2) BGP Local Preference qua AWS BGP Community Tags (7224:7300 High > 7224:7200 Medium > 7224:7100 Low) -> 3) Shortest AS_PATH (AS_PATH Prepending) -> 4) Lowest MED (chỉ khi cùng ASN). Community Tags luôn mạnh hơn AS_PATH Prepending!

</details>

**10. Tại sao phải bật Transit Gateway Appliance Mode trên Attachment của Inspection VPC (chạy AWS Network Firewall hoặc GWLB)?**

<details><summary>Xem đáp án</summary>

Mặc định TGW giữ lưu lượng trong cùng AZ, gây ra Asymmetric Routing khi gói tin đi qua Firewall AZ-a nhưng gói tin phản hồi quay lại qua Firewall AZ-b -> Stateful Firewall sẽ drop gói tin. Bật Appliance Mode ép TGW định tuyến cả 2 chiều của cùng 1 flow đi qua đúng 1 AZ duy nhất.

</details>

**11. Bật tính năng nào trên AWS Direct Connect để đạt thời gian phát hiện lỗi và failover BGP dưới 1 giây (sub-second failover)?**

<details><summary>Xem đáp án</summary>

Bật Asynchronous BFD (Bidirectional Forwarding Detection) trên Direct Connect VIF. BFD giảm thời gian phát hiện đứt kết nối từ 90 giây (BGP Hold Timer mặc định) xuống dưới 1 giây (~900ms với interval 300ms x multiplier 3).

</details>

**12. Làm thế nào để mã hóa lưu lượng (encryption in transit) trên kết nối AWS Direct Connect 1 Gbps mà không cần nâng cấp lên 10 Gbps?**

<details><summary>Xem đáp án</summary>

Thiết lập AWS Site-to-Site VPN (IPsec) chạy bên trên một Direct Connect Public VIF. Lưu ý: MACsec (Layer 2 encryption) CHỈ hỗ trợ Dedicated Connection tốc độ >= 10 Gbps (10G/100G/400G), không hỗ trợ 1 Gbps hay Hosted Connection.

</details>

**13. Tại sao bắt buộc phải bật Appliance Mode trên Transit Gateway Attachment của Inspection VPC khi dùng AWS Network Firewall?**

<details><summary>Xem đáp án</summary>

Để đảm bảo symmetric routing: cả luồng traffic đi và luồng phản hồi về giữa các Spoke VPC luôn đi qua CÙNG một Availability Zone (cùng stateful firewall endpoint), tránh việc packet bị drop do asymmetric routing.

</details>

**14. Cần loại Virtual Interface (VIF) nào để kết nối AWS Direct Connect tới Direct Connect Gateway (DXGW) và nhiều Transit Gateways trên nhiều Region?**

<details><summary>Xem đáp án</summary>

Transit VIF. Một Direct Connect Gateway có thể liên kết tối đa 6 Transit Gateways trên toàn cầu thông qua Transit VIF.

</details>

**15. Làm sao để cắt giảm chi phí NAT Gateway Data Processing khi EC2/ECS trong Private Subnet tải dữ liệu lớn từ Amazon S3?**

<details><summary>Xem đáp án</summary>

Tạo Gateway VPC Endpoint cho Amazon S3 và gắn vào Route Table của Private Subnet. Gateway VPC Endpoint hoàn toàn miễn phí và định tuyến traffic S3 đi trực tiếp nội bộ AWS thay vì đi qua NAT Gateway ($0.045/GB).

</details>

## Chủ đề 4: Multi-Region Resilience & Disaster Recovery — RTO/RPO, Route 53 ARC & Active-Active Patterns

**16. Sự khác biệt cốt lõi giữa Route 53 ARC Routing Control (Cluster Endpoints) và Route 53 Health Checks thông thường khi failover Multi-Region là gì?**

<details><summary>Xem đáp án</summary>

Route 53 ARC Routing Controls chạy trên Data Plane cực kỳ tin cậy (5 Regional Cluster Endpoints độc lập), KHÔNG phụ thuộc Control Plane của Route 53. Cho phép chuyển hướng traffic toàn cầu bằng nút bật/tắt (on/off) an toàn ngay cả khi AWS Control Plane gặp sự cố, kèm Safety Rules (Assertion/Gating) chống tắt nhầm toàn bộ Region.

</details>

**17. Amazon Route 53 Application Recovery Controller (ARC) giải quyết rủi ro gì khi thực hiện Multi-Region Failover?**

<details><summary>Xem đáp án</summary>

ARC cung cấp Readiness Checks (kiểm tra liên tục capacity/quota ở DR Region) và Routing Controls chạy trên Data Plane Cluster 5 endpoints cực kỳ ổn định (không phụ thuộc Control Plane ở us-east-1) kèm Safety Rules tránh tắt nhầm toàn bộ Region.

</details>

## Chủ đề 5: Global Traffic, Edge Caching & Security — CloudFront Origin Shield, Global Accelerator, WAF & Shield Advanced

**18. Khi nào chọn AWS Global Accelerator thay vì Amazon CloudFront cho ứng dụng đa vùng (Multi-Region)?**

<details><summary>Xem đáp án</summary>

Chọn Global Accelerator khi ứng dụng dùng giao thức non-HTTP (TCP/UDP như Gaming, VoIP, IoT, MQTT), yêu cầu IP tĩnh (2 Static Anycast IPs để whitelist ở firewall khách hàng), hoặc cần failover tức thì giữa các Region mà không bị ảnh hưởng bởi DNS TTL caching.

</details>

**19. Khi nào nên chọn AWS Global Accelerator thay vì Amazon Route 53 Failover Routing?**

<details><summary>Xem đáp án</summary>

Khi cần 2 Static Anycast IP (cho firewall allowlisting), hỗ trợ giao thức TCP/UDP (non-HTTP), hoặc khi client cache DNS TTL quá lâu khiến DNS failover chậm — Global Accelerator failover ở tầng mạng < 30 giây không phụ thuộc DNS TTL.

</details>

## Chủ đề 7: Enterprise Security & Multi-Region Encryption — KMS Multi-Region Keys, CloudHSM, Macie & GuardDuty

**20. Lợi ích chính của AWS KMS Multi-Region Keys (MRK) trong kiến trúc Multi-Region là gì?**

<details><summary>Xem đáp án</summary>

Các khóa MRK ở nhiều Region có chung Key ID (`mrk-...`) và chung key material, cho phép dữ liệu mã hóa ở Region A được giải mã cục bộ tại Region B mà KHÔNG cần gọi KMS API xuyên Region và KHÔNG cần mã hóa lại (re-encrypt).

</details>

## Chủ đề 8: Multi-Account IaC & CI/CD Automation — CloudFormation StackSets, CDK, CodePipeline Cross-Account & Deployment Strategies

**21. Cách tự động triển khai một bộ tài nguyên chuẩn (IAM Role, GuardDuty, Config) xuống mọi Account mới tạo trong một OU bằng CloudFormation?**

<details><summary>Xem đáp án</summary>

Sử dụng AWS CloudFormation StackSets với Service-Managed Permissions và bật tính năng Auto-Deployment (Automatic Deployment) nhắm vào Organizational Unit (OU). Khi Account mới được thêm vào OU, StackSet tự động triển khai stack mà không cần cấu hình IAM execution role thủ công.

</details>

**22. Tại sao S3 Artifact Bucket trong Multi-Account AWS CodePipeline không được dùng AWS-managed KMS key (`aws/s3`)?**

<details><summary>Xem đáp án</summary>

Vì không thể chỉnh sửa Key Policy của AWS-managed key để cấp quyền `kms:Decrypt` cho Cross-Account Deployment Role ở tài khoản đích. Bắt buộc phải dùng Customer Managed Key (CMK).

</details>

## Chủ đề 9: Global Databases & Caching — Aurora Global Database, DynamoDB Global Tables, ElastiCache & DAX

**23. Sự khác biệt giữa Aurora Global Database Switchover (Managed Planned Failover) và Failover (Unplanned) là gì?**

<details><summary>Xem đáp án</summary>

Managed Planned Failover (Switchover) đảm bảo RPO = 0 (không mất dữ liệu), giữ nguyên cấu trúc Global Database và tự động biến cụm Primary cũ thành Secondary. Unplanned Failover (Detach & Promote) dùng khi Primary Region chết hẳn, RPO thường < 1 giây nhưng cụm Secondary tách ra thành cụm độc lập (cần dựng lại replication sau đó).

</details>

**24. Khi nào dùng AWS KMS Multi-Region Keys (MRK) trong kiến trúc Multi-Region Active-Active?**

<details><summary>Xem đáp án</summary>

Khi cần mã hóa dữ liệu ở Region A và giải mã trực tiếp ở Region B (ví dụ DynamoDB Global Tables với Client-Side Encryption hoặc Aurora Global DB) bằng cùng Key ID và key material mà KHÔNG phải gọi API KMS xuyên Region (giảm độ trễ và tránh lỗi khi Region A sập).

</details>

**25. Sự khác biệt giữa Compute Savings Plans và EC2 Instance Savings Plans? Dịch vụ nào KHÔNG áp dụng Savings Plans mà phải dùng Reserved Instances?**

<details><summary>Xem đáp án</summary>

Compute SP (giảm tới 66%) áp dụng linh hoạt cho EC2, Fargate, Lambda xuyên Region/Family. EC2 Instance SP (giảm tới 72%) chỉ áp dụng cho 1 EC2 Family tại 1 Region. Các dịch vụ RDS, ElastiCache, Redshift, OpenSearch KHÔNG hỗ trợ Savings Plans -> bắt buộc dùng Reserved Instances (RI).

</details>

**26. Khi nào chọn Amazon DAX thay vì Amazon ElastiCache (Valkey/Redis) phía trước DynamoDB?**

<details><summary>Xem đáp án</summary>

Chọn DAX khi cần giảm độ trễ đọc (eventually consistent GetItem/Query/Scan) từ millisecond xuống microsecond mà KHÔNG cần viết lại code logic caching (tương thích 100% DynamoDB API). Chọn ElastiCache nếu cần cache kết quả tổng hợp (aggregation), strongly consistent data hoặc cấu trúc dữ liệu như Sorted Sets.

</details>

**27. Tính năng Write Forwarding trên Amazon Aurora Global Database hoạt động như thế nào?**

<details><summary>Xem đáp án</summary>

Cho phép ứng dụng tại Secondary Region gửi lệnh ghi trực tiếp vào local Aurora reader cluster; Aurora tự động chuyển tiếp lệnh ghi đó về Primary Region để thực thi, giúp đơn giản hóa kiến trúc Active-Active Multi-Region đọc nhiều ghi ít.

</details>

**28. Khi nào KHÔNG nên dùng Amazon DynamoDB Accelerator (DAX) để cache cho DynamoDB?**

<details><summary>Xem đáp án</summary>

Không nên dùng DAX cho workload ghi nhiều (write-heavy), ứng dụng yêu cầu Strongly Consistent Reads (DAX chỉ trả về Eventually Consistent Reads từ cache), hoặc ứng dụng cần logic tổng hợp dữ liệu phức tạp trước khi lưu cache (nên dùng ElastiCache Redis).

</details>

**29. Hai lợi ích quan trọng nhất của Amazon RDS Proxy đối với kiến trúc Serverless (AWS Lambda + Aurora/RDS) là gì?**

<details><summary>Xem đáp án</summary>

1) Connection Pooling: gộp hàng nghìn kết nối đồng thời từ Lambda để tránh lỗi cạn kiệt kết nối DB (`Too many connections`). 2) Giảm thời gian failover của Aurora/RDS tới 66% bằng cách giữ phiên kết nối ứng dụng và tự chuyển hướng sang primary mới.

</details>

## Chủ đề 10: Large-Scale Serverless, Containers & Event-Driven — Lambda Concurrency, EKS, ECS, EventBridge & Step Functions

**30. So sánh AWS Lambda Reserved Concurrency và Provisioned Concurrency: cái nào chống Cold Start và cái nào bảo vệ Downstream DB?**

<details><summary>Xem đáp án</summary>

Provisioned Concurrency giữ ấm môi trường thực thi -> giải quyết Cold Start (có tính phí). Reserved Concurrency đặt trần tối đa (hard cap) và dành riêng hạn mức -> bảo vệ Downstream DB khỏi quá tải (miễn phí, KHÔNG giải quyết Cold Start).

</details>

**31. Điểm khác biệt cốt lõi giữa chiến lược Disaster Recovery Pilot Light và Warm Standby là gì?**

<details><summary>Xem đáp án</summary>

Pilot Light chỉ chạy liên tục tầng dữ liệu (DB replication), còn tầng compute (EC2/ECS) tắt hoặc scale = 0 nên KHÔNG phục vụ traffic ngay được. Warm Standby chạy bản sao thu nhỏ của toàn bộ stack ở DR Region nên có thể phục vụ một phần traffic ngay lập tức rồi mới scale-out.

</details>

**32. Strangler Fig Pattern trong hiện đại hóa ứng dụng trên AWS được triển khai như thế nào?**

<details><summary>Xem đáp án</summary>

Đặt Amazon API Gateway hoặc Application Load Balancer (Path-based Routing) trước ứng dụng Monolith cũ, sau đó tách dần từng chức năng sang Microservices (Lambda/ECS/EKS) và chuyển hướng từng route sang dịch vụ mới cho đến khi tắt hoàn toàn Monolith.

</details>

## Chủ đề 11: FinOps & Cost Optimization at Scale — Compute Optimizer, Shared Savings Plans/RI, Data Transfer & Storage Tiering

**33. Làm sao loại bỏ chi phí $0.045/GB của NAT Gateway khi các EC2 Private Subnet tải hàng chục TB dữ liệu từ S3 và DynamoDB?**

<details><summary>Xem đáp án</summary>

Tạo VPC Gateway Endpoint cho Amazon S3 và DynamoDB rồi gắn vào Route Table của Private Subnet. VPC Gateway Endpoint hoàn toàn miễn phí ($0/giờ và $0/GB) và giữ lưu lượng đi hoàn toàn trong mạng nội bộ AWS.

</details>

**34. Savings Plans có đảm bảo giữ chỗ phần cứng (Capacity Reservation) trong một AZ cụ thể không?**

<details><summary>Xem đáp án</summary>

KHÔNG. Savings Plans chỉ là cam kết thanh toán để được giảm giá. Nếu cần đảm bảo dung lượng phần cứng trong một AZ cụ thể, phải dùng On-Demand Capacity Reservations (ODCR) kết hợp Savings Plans, hoặc Zonal Reserved Instances.

</details>

## Chủ đề 13: Workload Migration Strategy (7Rs) — Migration Hub, AWS MGN, DMS/SCT & Application Modernization

**35. Tại sao khi di chuyển Heterogeneous Database (ví dụ Oracle -> Aurora PostgreSQL) bằng AWS DMS lại BẮT BUỘC phải dùng AWS SCT trước?**

<details><summary>Xem đáp án</summary>

AWS DMS chỉ di chuyển dữ liệu (Full Load + CDC) và tạo cấu trúc bảng cơ bản; DMS KHÔNG chuyển đổi được các đối tượng schema phức tạp (stored procedures, views, triggers, functions, packages). Phải chạy AWS Schema Conversion Tool (SCT) để chuyển đổi schema trước, sau đó mới chạy DMS.

</details>

**36. Giải pháp nào giúp di chuyển ứng dụng Microsoft SQL Server sang Aurora PostgreSQL với ít thay đổi mã nguồn T-SQL nhất?**

<details><summary>Xem đáp án</summary>

Sử dụng Babelfish for Aurora PostgreSQL. Babelfish cung cấp lớp tương thích giao thức TDS (port 1433) và hiểu trực tiếp cú pháp T-SQL ngay trên Aurora PostgreSQL, giúp bỏ license SQL Server nhanh chóng trước khi hiện đại hóa hoàn toàn.

</details>

**37. AWS Application Migration Service (MGN) thực hiện sao chép máy chủ on-premises theo cơ chế nào để đạt downtime chỉ vài phút?**

<details><summary>Xem đáp án</summary>

Cài đặt AWS Replication Agent lên máy chủ nguồn để thực hiện continuous block-level replication vào Staging Area Subnet (dùng EBS giá rẻ), sau đó tự động chạy Conversion Server dựng EC2 Production khi test hoặc cutover.

</details>

**38. Sự khác biệt giữa Heterogeneous Migration và Homogeneous Migration khi dùng AWS DMS là gì?**

<details><summary>Xem đáp án</summary>

Homogeneous (cùng engine như MySQL → Aurora MySQL) có thể dùng DMS hoặc native tools trực tiếp. Heterogeneous (khác engine như Oracle → Aurora PostgreSQL) BẮT BUỘC phải dùng AWS Schema Conversion Tool (SCT) để chuyển đổi schema, views, stored procedures trước khi chạy DMS.

</details>

## Chủ đề 14: Refactor Spaces, Mainframe Modernization, Storage Gateway, DataSync & Transfer Family

**39. Sự khác biệt khi chọn AWS Application Migration Service (MGN) so với AWS Database Migration Service (DMS) và AWS DataSync?**

<details><summary>Xem đáp án</summary>

AWS MGN dùng cho Rehost (Lift-and-Shift) máy chủ vật lý/VM/Cloud sang EC2 bằng continuous block-level replication. AWS DMS dùng cho di chuyển Database (Full Load + CDC). AWS DataSync dùng cho đồng bộ file/object tốc độ cao qua mạng (NFS/SMB/HDFS <-> S3/EFS/FSx) giữ nguyên metadata & POSIX/NTFS permissions.

</details>

**40. Khi di chuyển 100 TB dữ liệu NAS on-premises trong 1 tuần với băng thông mạng chỉ 100 Mbps và dữ liệu vẫn thay đổi hàng ngày, nên kết hợp dịch vụ nào?**

<details><summary>Xem đáp án</summary>

Kết hợp AWS Snowball Edge để vận chuyển offline 100 TB ban đầu (bulk transfer), sau đó dùng AWS DataSync qua mạng để đồng bộ phần dữ liệu thay đổi (incremental delta) cho đến lúc cutover.

</details>

---

[Mục lục SAP-C02](00-tong-quan-va-lo-trinh-sap-c02.md)
