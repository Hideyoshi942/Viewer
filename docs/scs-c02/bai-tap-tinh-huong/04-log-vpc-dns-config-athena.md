# Bài tập tình huống — VPC Flow Logs, DNS Query Logs, AWS Config & Athena Analytics

> VPC Flow Logs (S3/CloudWatch), Route 53 Resolver DNS Query Logs, AWS Config History/Rules, Amazon Athena Partitioning và OpenSearch.
> **Số câu hỏi:** 15 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A large enterprise with 80 AWS accounts needs a managed, immutable audit log store that aggregates CloudTrail management events, CloudTrail data events, and AWS Config configuration items across all accounts and Regions. Security analysts must be able to run ad-hoc SQL queries over 7 years of historical events without managing S3 lifecycle rules, AWS Glue crawlers, or Amazon Athena table partitions. Which solution meets these requirements with the LEAST operational overhead?

- **A.** Configure an Organization Trail delivering logs to an S3 bucket and create partitioned Amazon Athena tables updated by an AWS Glue crawler.
- **B.** Stream all CloudTrail logs to Amazon CloudWatch Logs and use CloudWatch Logs Insights for 7-year SQL queries.
- **C.** Create an AWS CloudTrail Lake organization event data store (7-year retention) ingesting CloudTrail and AWS Config items.
- **D.** Export CloudTrail Event History directly to Amazon Redshift Serverless every 90 days using a scheduled Lambda function.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp lớn với 80 tài khoản AWS cần một kho lưu trữ nhật ký kiểm toán bất biến được quản lý, tổng hợp các sự kiện quản lý CloudTrail, sự kiện dữ liệu CloudTrail và các mục cấu hình AWS Config trên tất cả tài khoản và Region. Các chuyên viên phân tích bảo mật phải có khả năng chạy các truy vấn SQL ad-hoc trên 7 năm sự kiện lịch sử mà không cần quản lý các quy tắc vòng đời S3, AWS Glue crawler hay phân vùng bảng Amazon Athena. Giải pháp nào đáp ứng các yêu cầu này với chi phí vận hành ÍT NHẤT?

**Đáp án đúng:** **C**

AWS CloudTrail Lake sinh ra để giải quyết bài toán lưu trữ bất biến dài hạn (mặc định 7 năm, tối đa 10 năm với gói mở rộng) và truy vấn SQL trực tiếp trên CloudTrail events, AWS Config configuration items và Audit Manager evidence mà không phải vận hành pipeline S3 + Glue + Athena.

- **A:** Giải pháp này yêu cầu tự quản lý S3 lifecycle, Glue crawlers và cấu trúc partition của Athena, vi phạm yêu cầu giảm thiểu operational overhead của đề bài.
- **B:** CloudWatch Logs Insights dùng cú pháp truy vấn riêng (không phải chuẩn SQL cho multi-account Config + CloudTrail lake) và tốn kém/phức tạp hơn nhiều khi tổng hợp đa tài khoản đa vùng cho cả CloudTrail và AWS Config.
- **C (Đúng):** Chính xác! AWS CloudTrail Lake là kho lưu trữ bất biến được quản lý hoàn toàn (managed immutable data lake), hỗ trợ thu thập CloudTrail events và AWS Config items ở cấp Organization, lưu trữ lên đến 7-10 năm và cho phép truy vấn SQL trực tiếp mà không cần quản lý S3/Glue/Athena.
- **D:** CloudTrail Event History chỉ chứa Management Events trong 90 ngày (không có Data Events hay AWS Config items) và việc tự viết Lambda đồng bộ vào Redshift gây operational overhead cao.

</details>

### Câu 2 `hard`

A security operations center (SOC) needs to centralize CloudTrail logs, VPC Flow Logs, Route 53 Resolver Query Logs, and AWS Security Hub findings from all accounts in an AWS Organization into a single security data lake. All logs must be automatically normalized into the Open Cybersecurity Schema Framework (OCSF) format and stored as Apache Parquet files so third-party SIEM tools can subscribe and query them efficiently. Which AWS service should the SOC implement?

- **A.** Amazon Detective
- **B.** AWS CloudTrail Lake
- **C.** Amazon EventBridge Pipes with Amazon Kinesis Data Firehose
- **D.** Amazon Security Lake

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một trung tâm điều hành bảo mật (SOC) cần tập trung nhật ký CloudTrail, VPC Flow Logs, Route 53 Resolver Query Logs và các finding AWS Security Hub từ tất cả các tài khoản trong một AWS Organization vào một security data lake duy nhất. Tất cả nhật ký phải tự động được chuẩn hóa sang định dạng Open Cybersecurity Schema Framework (OCSF) và lưu trữ dưới dạng tệp Apache Parquet để các công cụ SIEM của bên thứ ba có thể đăng ký và truy vấn hiệu quả. SOC nên triển khai dịch vụ AWS nào?

**Đáp án đúng:** **D**

Từ khóa nhận diện Amazon Security Lake trong kỳ thi SCS-C02 là: chuẩn hóa dữ liệu bảo mật đa nguồn theo **OCSF (Open Cybersecurity Schema Framework)**, lưu trữ tối ưu dưới dạng **Apache Parquet**, và hỗ trợ **Subscribers** (Data access / Query access) cho các SIEM và nền tảng phân tích bên thứ ba.

- **A:** Amazon Detective xây dựng đồ thị hành vi (behavior graph) để điều tra nguyên nhân gốc rễ các phát hiện bảo mật, không phải là data lake lưu trữ file Apache Parquet theo chuẩn OCSF để SIEM bên thứ ba đăng ký đọc.
- **B:** CloudTrail Lake không tự động thu thập VPC Flow Logs hay Route 53 Query Logs và không xuất dữ liệu chuẩn hóa OCSF dạng Apache Parquet cho SIEM bên ngoài.
- **C:** Tự xây dựng pipeline chuẩn hóa OCSF và chuyển đổi Parquet bằng EventBridge/Firehose tốn rất nhiều công sức vận hành và phát triển so với dịch vụ chuyên dụng Amazon Security Lake.
- **D (Đúng):** Chính xác! Amazon Security Lake tự động tập hợp các nguồn log bảo mật của AWS (CloudTrail, VPC Flow Logs, Route 53, Security Hub, EKS Audit Logs, WAF...) trên toàn AWS Organization, chuẩn hóa sang chuẩn mở OCSF dưới định dạng Apache Parquet tối ưu chi phí/truy vấn và hỗ trợ Subscriber cho các công cụ SIEM bên thứ ba.

</details>

### Câu 3 `medium`

A web server running on an EC2 instance in a public subnet cannot return HTTPS responses to external clients. A security engineer inspects VPC Flow Logs for the instance's ENI and observes the following records:
1) Inbound: src=203.0.113.25 dst=10.0.1.10 dstport=443 protocol=6 action=ACCEPT
2) Outbound: src=10.0.1.10 dst=203.0.113.25 srcport=443 dstport=51422 protocol=6 action=REJECT
Which TWO issues could cause this exact VPC Flow Logs pattern? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** The EC2 instance's Security Group does not have an outbound rule allowing TCP traffic to ephemeral ports (1024-65535).
- **B.** The VPC is missing an Internet Gateway attachment in the public subnet's route table.
- **C.** The subnet's Network ACL lacks an outbound rule allowing TCP ephemeral ports (1024-65535) to 0.0.0.0/0.
- **D.** The host-based OS firewall (iptables) on the EC2 instance is dropping outbound HTTPS packets.
- **E.** The subnet's Network ACL has an explicit DENY outbound rule for 203.0.113.0/24 with a lower rule number.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một máy chủ web chạy trên một EC2 instance trong public subnet không thể trả về phản hồi HTTPS cho các client bên ngoài. Một kỹ sư bảo mật kiểm tra VPC Flow Logs cho ENI của instance và quan sát thấy các bản ghi sau:
> 1) Inbound: src=203.0.113.25 dst=10.0.1.10 dstport=443 protocol=6 action=ACCEPT
> 2) Outbound: src=10.0.1.10 dst=203.0.113.25 srcport=443 dstport=51422 protocol=6 action=REJECT
> HAI vấn đề nào có thể gây ra chính xác mẫu VPC Flow Logs này? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Phân tích VPC Flow Logs là kỹ năng cốt lõi của SCS-C02: khi thấy Inbound `ACCEPT` vào cổng dịch vụ (443) nhưng Outbound phản hồi tới ephemeral port (`51422`) bị `REJECT`, nguyên nhân CHẮC CHẮN nằm ở **Network ACL** (stateless) chứ không phải Security Group (stateful) hay OS firewall (không hiển thị REJECT trong Flow Logs).

- **A:** Security Group là stateful (có lưu trạng thái). Khi kết nối inbound vào cổng 443 đã được Security Group cho phép, lưu lượng phản hồi outbound cho kết nối đó sẽ TỰ ĐỘNG được Security Group cho phép bất kể outbound rule là gì.
- **B:** Nếu thiếu route tới Internet Gateway, lưu lượng inbound từ IP công cộng 203.0.113.25 sẽ không thể vào được ENI với action=ACCEPT ngay từ đầu.
- **C (Đúng):** Chính xác! Network ACL là stateless (không lưu trạng thái). Dù lưu lượng vào cổng 443 được ACCEPT, nhưng phản hồi đi ra (dstport=51422 thuộc dải ephemeral port) vẫn bị NACL chặn (REJECT) nếu thiếu outbound rule cho phép dải ephemeral ports.
- **D:** VPC Flow Logs chỉ ghi nhận hành động ACCEPT/REJECT của Security Group và Network ACL ở tầng VPC. Nếu bị OS firewall (iptables) bên trong EC2 chặn, gói tin sẽ không bao giờ rời khỏi OS để bị ENI ghi nhận REJECT trong VPC Flow Logs.
- **E (Đúng):** Chính xác! NACL đánh giá các rule theo thứ tự từ số nhỏ đến số lớn. Một rule outbound DENY có số thứ tự thấp hơn cho dải IP 203.0.113.0/24 sẽ chặn lưu lượng phản hồi và ghi nhận action=REJECT trong VPC Flow Logs.

</details>

### Câu 4 `hard`

A security engineer is investigating a suspected TCP SYN flood and unauthorized egress traffic passing through a NAT Gateway. The default VPC Flow Logs format only shows the NAT Gateway's private IP address in srcaddr/dstaddr and does not indicate which TCP flags were set. How should the engineer reconfigure VPC Flow Logs to capture the original pre-NAT source IP address, the traffic direction, and the TCP flags?

- **A.** Modify the existing VPC Flow Log configuration in place to upgrade its log format from version 2 to version 5.
- **B.** Create a new VPC Flow Log using a Custom Log Format that includes pkt-srcaddr, pkt-dstaddr, flow-direction, and tcp-flags.
- **C.** Enable CloudTrail Network Activity Events on the NAT Gateway ENI to capture TCP flags and source IPs.
- **D.** Change the VPC Flow Logs aggregation interval from 10 minutes to 1 minute while keeping the default format.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư bảo mật đang điều tra một vụ nghi ngờ tấn công ngập lụt TCP SYN và lưu lượng đi ra trái phép đi qua một NAT Gateway. Định dạng VPC Flow Logs mặc định chỉ hiển thị địa chỉ IP riêng của NAT Gateway trong srcaddr/dstaddr và không cho biết các cờ TCP nào đã được thiết lập. Kỹ sư nên cấu hình lại VPC Flow Logs như thế nào để thu thập địa chỉ IP nguồn ban đầu trước NAT, hướng lưu lượng và các cờ TCP?

**Đáp án đúng:** **B**

Trong VPC Flow Logs, định dạng mặc định (version 2) chỉ có `srcaddr`/`dstaddr` (IP của ENI). Để điều tra lưu lượng đi qua trung gian (NAT Gateway, Transit Gateway, NLB) và phát hiện quét cổng/SYN flood, cần tạo Flow Log mới với **Custom Format** bao gồm `pkt-srcaddr`, `pkt-dstaddr`, `flow-direction`, `traffic-path`, và `tcp-flags`.

- **A:** AWS KHÔNG cho phép chỉnh sửa định dạng (log format) của một VPC Flow Log đã tạo; bắt buộc phải tạo một Flow Log mới với Custom Format và xóa Flow Log cũ nếu không cần.
- **B (Đúng):** Chính xác! VPC Flow Logs v3/v4/v5 Custom Format cung cấp các trường nâng cao: pkt-srcaddr / pkt-dstaddr (hiển thị IP gốc của gói tin trước/sau khi qua NAT Gateway hoặc NLB), flow-direction (ingress/egress) và tcp-flags (giúp nhận diện SYN=2, SYN-ACK=18, RST=4 để phát hiện SYN scan/flood).
- **C:** CloudTrail ghi nhận các lệnh gọi AWS API, không ghi nhận TCP flags hay header gói tin mạng đi qua NAT Gateway.
- **D:** Giảm aggregation interval xuống 1 phút chỉ giúp log xuất ra nhanh hơn, không bổ sung thêm các trường pkt-srcaddr, flow-direction hay tcp-flags vào định dạng mặc định (v2).

</details>

### Câu 5 `medium`

A security team manages 40 AWS accounts across 5 AWS Regions. After a new corporate policy mandates that all Amazon EBS volumes must be encrypted and no Amazon RDS snapshots may be publicly shared, the team needs a single centralized interface to run SQL-like queries against current resource configurations across all accounts and Regions to find non-compliant resources immediately. Which AWS Config feature should the team use?

- **A.** Enable AWS Config Delivery Channels in each account and manually download the JSON configuration snapshots from S3.
- **B.** Use AWS Trusted Advisor in the Management Account to run custom SQL queries against EBS and RDS metadata.
- **C.** Create an AWS Config Organization Aggregator in a delegated admin account and run AWS Config Advanced Queries.
- **D.** Use Amazon Inspector to query RDS snapshot sharing permissions across all accounts and AWS Regions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm bảo mật quản lý 40 tài khoản AWS trên 5 AWS Region. Sau khi một chính sách công ty mới bắt buộc tất cả Amazon EBS volume phải được mã hóa và không một Amazon RDS snapshot nào được chia sẻ công khai, nhóm cần một giao diện tập trung duy nhất để chạy các truy vấn giống SQL đối với cấu hình tài nguyên hiện tại trên tất cả tài khoản và Region nhằm tìm ra các tài nguyên không tuân thủ ngay lập tức. Nhóm nên sử dụng tính năng AWS Config nào?

**Đáp án đúng:** **C**

**AWS Config Aggregator** + **Advanced Queries** là cặp công cụ lý tưởng để kiểm kê và truy vấn cấu hình tài nguyên tức thời trên quy mô đa tài khoản, đa Region (multi-account, multi-Region) bằng cú pháp SQL mà không cần xây dựng ETL.

- **A:** Tải thủ công các file JSON snapshot từ S3 của 40 tài khoản trên 5 Region không phải là giao diện truy vấn tập trung tức thì.
- **B:** Trusted Advisor không hỗ trợ chạy truy vấn SQL tùy chỉnh (Advanced Queries) trên toàn bộ cấu hình tài nguyên.
- **C (Đúng):** Chính xác! AWS Config Aggregator (ở cấp Organization) tổng hợp dữ liệu cấu hình và trạng thái tuân thủ từ tất cả các tài khoản và Region về một nơi duy nhất, sau đó cho phép chạy AWS Config Advanced Queries (cú pháp SQL SELECT) để tìm ngay các EBS volume chưa mã hóa hoặc RDS snapshot public.
- **D:** Amazon Inspector chỉ quét lỗ hổng CVE trên EC2, ECR và Lambda, không quản lý cấu hình hay quyền chia sẻ RDS snapshot.

</details>

### Câu 6 `hard`

A financial institution routes CloudTrail logs and VPC Flow Logs from all member accounts into a centralized S3 bucket inside a dedicated Log Archive account. The CISO mandates defense-in-depth controls so that even if a member account administrator or an IAM administrator in the Log Archive account is compromised, they cannot disable CloudTrail logging or delete/overwrite historical log files for 5 years. Which TWO controls should the security architect implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Configure an S3 Lifecycle rule to transition logs to S3 Glacier Deep Archive after 1 day so IAM administrators cannot delete them.
- **B.** Enable S3 Object Lock in Compliance Mode with a 5-year retention period on the centralized Log Archive S3 bucket.
- **C.** Enable S3 Versioning without Object Lock so deleted files are never permanently removed by an IAM administrator.
- **D.** Attach an Organizations SCP to member OUs denying cloudtrail:StopLogging, DeleteTrail, and UpdateTrail.
- **E.** Grant each member account s3:DeleteObject permissions on its own prefix so application teams can clean up duplicate logs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức tài chính định tuyến nhật ký CloudTrail và VPC Flow Logs từ tất cả các tài khoản thành viên vào một S3 bucket tập trung bên trong tài khoản Log Archive chuyên dụng. CISO yêu cầu các biện pháp kiểm soát phòng vệ theo chiều sâu để ngay cả khi một quản trị viên tài khoản thành viên hoặc một quản trị viên IAM trong tài khoản Log Archive bị xâm phạm, họ cũng không thể tắt ghi nhật ký CloudTrail hoặc xóa/ghi đè các tệp nhật ký lịch sử trong 5 năm. Kiến trúc sư bảo mật nên triển khai HAI biện pháp kiểm soát nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Kiến trúc bảo vệ Log Archive Account bất biến theo chuẩn AWS Landing Zone gồm: (1) Organization Trail (chặn tắt/xóa bằng **SCP**), (2) Cô lập quyền truy cập vào Log Archive account, và (3) **S3 Object Lock (Compliance Mode)** + S3 Bucket Policy chặn xóa để đảm bảo ngay cả admin/root bị lộ cũng không xóa được bằng chứng.

- **A:** Chuyển sang S3 Glacier Deep Archive chỉ tối ưu chi phí lưu trữ, KHÔNG ngăn chặn được IAM Administrator có quyền s3:DeleteObject xóa file log.
- **B (Đúng):** Chính xác! S3 Object Lock ở chế độ Compliance Mode đảm bảo bất biến (WORM) trong suốt 5 năm: ngay cả IAM Administrator hay AWS Account Root User của tài khoản Log Archive cũng KHÔNG thể xóa hoặc ghi đè các file log đã lưu.
- **C:** Nếu chỉ bật S3 Versioning mà không có Object Lock (hoặc MFA Delete), một IAM Administrator bị xâm nhập vẫn có thể gọi s3:DeleteObjectVersion để xóa vĩnh viễn mọi phiên bản của file log.
- **D (Đúng):** Chính xác! SCP chặn các hành động tắt/xóa/sửa trail đảm bảo quản trị viên của các member account không thể vô hiệu hóa cơ chế ghi nhật ký (càng mạnh mẽ hơn khi kết hợp với Organization Trail tạo từ Management/Delegated Admin account).
- **E:** Cấp quyền s3:DeleteObject cho member account phá vỡ hoàn toàn tính bất biến và nguyên tắc phòng thủ chiều sâu của tài khoản Log Archive.

</details>

### Câu 7 `hard`

A network security engineer is investigating suspicious outbound traffic passing through a NAT gateway in a production VPC. The default VPC Flow Logs only show the NAT gateway's private IP address as the source IP, making it impossible to identify which EC2 instance initiated the connection. Which VPC Flow Logs configuration change should the engineer make to capture the original instance IP address and traffic direction?

- **A.** Edit the existing VPC Flow Log format in place to add the instance-id and interface-id fields.
- **B.** Create a new VPC Flow Log with a custom format that includes the pkt-srcaddr, pkt-dstaddr, and flow-direction fields.
- **C.** Change the VPC Flow Logs aggregation interval from 10 minutes to 1 minute to expose the underlying EC2 private IP addresses.
- **D.** Switch the VPC Flow Logs destination from Amazon S3 to Amazon CloudWatch Logs so that NAT translation headers are automatically logged.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư bảo mật mạng đang điều tra lưu lượng đi ra đáng ngờ đi qua một NAT gateway trong một VPC production. VPC Flow Logs mặc định chỉ hiển thị địa chỉ IP riêng của NAT gateway làm địa chỉ IP nguồn, khiến không thể xác định EC2 instance nào đã khởi tạo kết nối. Kỹ sư nên thực hiện thay đổi cấu hình VPC Flow Logs nào để thu thập địa chỉ IP gốc của instance và hướng lưu lượng?

**Đáp án đúng:** **B**

Khi lưu lượng đi qua thiết bị trung gian như NAT Gateway hoặc NLB, `srcaddr`/`dstaddr` trong định dạng mặc định của VPC Flow Logs chỉ hiển thị IP của thiết bị trung gian. Để xem IP gốc ở tầng gói tin và chiều lưu lượng, cần tạo **VPC Flow Log mới** với **custom format** bao gồm `pkt-srcaddr`, `pkt-dstaddr`, và `flow-direction`.

- **A:** Thứ nhất, AWS không cho phép chỉnh sửa custom format của một VPC Flow Log đã tạo (phải tạo mới). Thứ hai, khi thu thập log trên ENI của NAT Gateway thì `instance-id` sẽ là `-` chứ không phải ID của EC2 phía sau NAT.
- **B (Đúng):** Chính xác! Trong VPC Flow Logs, trường `srcaddr` mặc định chỉ hiển thị IP của network interface trung gian (như NAT Gateway), trong khi trường tùy chỉnh `pkt-srcaddr` và `pkt-dstaddr` ghi lại địa chỉ IP nguồn/đích thực sự ở cấp gói tin (packet-level), còn `flow-direction` cho biết chiều ingress hay egress. Lưu ý: phải tạo Flow Log mới vì không thể sửa format của Flow Log đã tồn tại.
- **C:** Thay đổi aggregation interval chỉ thay đổi độ mịn theo thời gian (1 phút so với 10 phút), không làm xuất hiện thêm trường `pkt-srcaddr` hay `flow-direction`.
- **D:** Đích lưu trữ (S3 hay CloudWatch Logs) không quyết định các trường dữ liệu được ghi; chỉ có custom log format mới quyết định việc ghi `pkt-srcaddr` và `flow-direction`.

</details>

### Câu 8 `hard`

An enterprise operates 120 AWS accounts across three Regions and wants to centralize CloudTrail, VPC Flow Logs, Route 53 Resolver query logs, and Security Hub findings into a unified, open-standard security data lake so that both Amazon Athena and a third-party SIEM can query the data without building custom ETL normalization pipelines. Which AWS service should the security architect implement?

- **A.** AWS CloudTrail Lake with cross-account event data stores aggregating VPC Flow Logs and Route 53 logs.
- **B.** Amazon OpenSearch Service with AWS Glue crawlers transforming raw JSON logs into OCSF format.
- **C.** Amazon Security Lake with AWS Organizations integration normalizing logs into the OCSF Parquet format.
- **D.** AWS Security Hub cross-Region aggregation sending all raw VPC Flow Logs and CloudTrail events directly to the third-party SIEM.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp vận hành 120 tài khoản AWS trên ba Region và muốn tập trung CloudTrail, VPC Flow Logs, nhật ký truy vấn Route 53 Resolver và các finding Security Hub vào một hồ dữ liệu bảo mật tiêu chuẩn mở thống nhất để cả Amazon Athena và SIEM bên thứ ba đều có thể truy vấn dữ liệu mà không cần xây dựng các pipeline chuẩn hóa ETL tùy chỉnh. Kiến trúc sư bảo mật nên triển khai dịch vụ AWS nào?

**Đáp án đúng:** **C**

**Amazon Security Lake** tự động hóa việc thu thập, gom cụm đa tài khoản/đa Region và chuẩn hóa dữ liệu nhật ký bảo mật (CloudTrail, VPC Flow Logs, Route 53, Security Hub, EKS, WAF) sang chuẩn mở **OCSF (Open Cybersecurity Schema Framework)** dưới định dạng Parquet tối ưu cho phân tích bởi Athena và các đối tác SIEM.

- **A:** CloudTrail Lake dùng để lưu và truy vấn sự kiện CloudTrail, AWS Config và audit events từ nguồn tích hợp, không tự động thu thập và chuẩn hóa VPC Flow Logs hay Route 53 query logs sang chuẩn OCSF cho SIEM.
- **B:** Giải pháp này đòi hỏi tự xây dựng và duy trì pipeline ETL phức tạp bằng AWS Glue và quản lý cụm OpenSearch, trái với yêu cầu không xây dựng custom ETL.
- **C (Đúng):** Chính xác! Amazon Security Lake tự động thu thập log bảo mật từ CloudTrail, VPC Flow Logs, Route 53, Security Hub, Lambda, EKS trên toàn bộ AWS Organizations và tự động chuẩn hóa sang định dạng chuẩn mở OCSF (Apache Parquet), cho phép Athena và các SIEM bên thứ ba (subscribers) truy vấn trực tiếp mà không cần xây dựng ETL.
- **D:** Security Hub chỉ tổng hợp security findings theo chuẩn ASFF, không thu thập hay lưu trữ raw VPC Flow Logs, CloudTrail logs hay Route 53 query logs.

</details>

### Câu 9 `hard`

A compliance team needs to retain AWS CloudTrail management events and AWS Config configuration items across all accounts in an AWS Organization for 7 years in an immutable store, and run ad-hoc SQL queries directly against those events without setting up Amazon S3 buckets, AWS Glue Data Catalog tables, or partitioning scripts. Which AWS solution best satisfies these requirements?

- **A.** Create an Organization CloudTrail trail delivering logs to Amazon S3 Glacier Deep Archive and query them directly with Amazon Athena.
- **B.** Send all CloudTrail events to Amazon CloudWatch Logs with a 7-year retention policy and use AWS Config Aggregator for SQL queries.
- **C.** Use AWS CloudTrail Event History in the management account to run SQL queries across the last 7 years.
- **D.** Create CloudTrail Lake organization event data stores (7-year retention) for CloudTrail and AWS Config items.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm tuân thủ cần lưu giữ các sự kiện quản lý AWS CloudTrail và các mục cấu hình AWS Config trên tất cả tài khoản trong một AWS Organization trong 7 năm trong một kho lưu trữ bất biến, và chạy các truy vấn SQL ad-hoc trực tiếp đối với các sự kiện đó mà không cần thiết lập Amazon S3 bucket, bảng AWS Glue Data Catalog hay các script phân vùng. Giải pháp AWS nào đáp ứng tốt nhất các yêu cầu này?

**Đáp án đúng:** **D**

**AWS CloudTrail Lake** loại bỏ gánh nặng quản lý S3/Glue/Athena partitioning khi cần kho lưu trữ nhật ký **bất biến (immutable)** dài hạn (lên tới 7–10 năm) cho CloudTrail events, AWS Config items và audit logs bên ngoài, hỗ trợ chạy truy vấn SQL trực tiếp trên toàn Organization.

- **A:** Amazon Athena không thể truy vấn trực tiếp các object đang nằm ở lớp lưu trữ S3 Glacier Deep Archive (phải restore trước), đồng thời vẫn yêu cầu thiết lập S3 bucket và bảng/partition Athena.
- **B:** CloudWatch Logs không có tính chất kho lưu trữ kiểm toán bất biến tích hợp sẵn cho cả CloudTrail và AWS Config với truy vấn SQL chuẩn trên toàn Organization như CloudTrail Lake.
- **C:** CloudTrail Event History chỉ lưu giữ sự kiện quản trị trong 90 ngày gần nhất, chỉ ở cấp từng tài khoản/Region và không hỗ trợ truy vấn SQL.
- **D (Đúng):** Chính xác! AWS CloudTrail Lake là kho lưu trữ bất biến (immutable) được quản lý hoàn toàn, hỗ trợ lưu giữ lên đến 7 năm (hoặc 10 năm với gói extendable retention), thu thập trực tiếp CloudTrail events và AWS Config configuration items trên toàn AWS Organizations, và cho phép chạy truy vấn SQL trực tiếp mà không cần cấu hình S3 hay Glue.

</details>

### Câu 10 `hard`

A company uses Amazon Security Lake to centralize OCSF-formatted security logs across its AWS Organization. The security team wants to grant a third-party threat intelligence platform near-real-time access to newly ingested log objects as they arrive, while granting an internal data science team ad-hoc SQL query access via Amazon Athena without giving them direct S3 bucket listing permissions. How should the team configure subscribers in Amazon Security Lake?

- **A.** Create a Data Access subscriber (S3 + SQS) for the third-party platform, and a Query Access subscriber (Lake Formation) for data science.
- **B.** Grant both the third-party platform and the internal data science team S3 Bucket Owner Full Control via an S3 Access Point.
- **C.** Create a single subscriber with Query Access for both teams and configure Amazon Kinesis Data Firehose to push rows to the third-party platform.
- **D.** Export Amazon Security Lake tables to Amazon DynamoDB streams for the third-party platform.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty sử dụng Amazon Security Lake để tập trung các nhật ký bảo mật định dạng OCSF trên toàn bộ AWS Organization. Nhóm bảo mật muốn cấp cho một nền tảng thông tin mối đe dọa của bên thứ ba quyền truy cập theo thời gian gần thực vào các đối tượng nhật ký mới nhập khi chúng đến, đồng thời cấp cho nhóm khoa học dữ liệu nội bộ quyền truy cập truy vấn SQL ad-hoc qua Amazon Athena mà không cấp cho họ quyền liệt kê S3 bucket trực tiếp. Nhóm nên cấu hình các subscriber trong Amazon Security Lake như thế nào?

**Đáp án đúng:** **A**

Trong **Amazon Security Lake**, cấu hình **Subscribers** có 2 loại truy cập rõ ràng: **Data Access** (đọc object trực tiếp từ S3 với thông báo SQS/HTTPS gần thời gian thực — lý tưởng cho SIEM/SOAR) và **Query Access** (quản lý quyền truy vấn SQL qua **AWS Lake Formation** — lý tưởng cho Athena, OpenSearch, data science).

- **A (Đúng):** Chính xác! Amazon Security Lake hỗ trợ 2 chế độ subscriber: **Data Access** cấp quyền đọc trực tiếp S3 object kết hợp hàng đợi SQS (hoặc HTTPS webhook) để nhận thông báo gần thời gian thực cho SIEM/nền tảng bên thứ ba; **Query Access** cấp quyền bảng/cột qua AWS Lake Formation để truy vấn SQL bằng Athena/Redshift/EMR.
- **B:** Cấp quyền S3 Bucket Owner Full Control vi phạm nghiêm trọng nguyên tắc đặc quyền tối thiểu và bỏ qua cơ chế quản lý subscriber chuẩn của Amazon Security Lake.
- **C:** Query Access dùng cho truy vấn SQL qua Lake Formation, không cung cấp luồng thông báo object mới gần thời gian thực như Data Access (SQS/webhook).
- **D:** Security Lake lưu trữ dữ liệu OCSF Parquet trên S3, không xuất sang DynamoDB streams.

</details>

### Câu 11 `hard`

A security analyst suspects that compromised EC2 instances inside private subnets are exfiltrating sensitive data via DNS tunneling by encoding data into long subdomain queries sent to an external authoritative DNS server. VPC Flow Logs are enabled, but they do not show the queried domain names. Which AWS logging feature should the analyst enable to capture the exact DNS domain names queried by resources inside the VPC?

- **A.** Enable Amazon Route 53 Public Hosted Zone Query Logging for the company's public domain.
- **B.** Enable Amazon Route 53 Resolver Query Logging and associate it with the VPCs, sending logs to Amazon S3 or CloudWatch Logs.
- **C.** Add the dns-query-name custom field to the existing VPC Flow Logs configuration for the private subnets.
- **D.** Enable AWS CloudTrail data events for Amazon Route 53 to record outbound DNS queries.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một chuyên viên phân tích bảo mật nghi ngờ rằng các EC2 instance bị xâm phạm bên trong các private subnet đang trích xuất dữ liệu nhạy cảm qua đường hầm DNS bằng cách mã hóa dữ liệu vào các truy vấn tên miền phụ dài gửi tới một máy chủ DNS có thẩm quyền bên ngoài. VPC Flow Logs đã được bật, nhưng chúng không hiển thị các tên miền được truy vấn. Chuyên viên phân tích nên bật tính năng ghi nhật ký AWS nào để thu thập chính xác các tên miền DNS được truy vấn bởi các tài nguyên bên trong VPC?

**Đáp án đúng:** **B**

Phân biệt 2 loại DNS logging của Route 53: **Route 53 Public Query Logging** ghi truy vấn từ Internet vào Public Hosted Zone của bạn; còn **Route 53 Resolver Query Logging** ghi mọi truy vấn DNS phát sinh từ bên trong VPC (EC2, Lambda, EKS) ra ngoài, rất thiết yếu để phát hiện DNS tunneling và C2 domains.

- **A:** Public Hosted Zone Query Logging chỉ ghi các truy vấn từ Internet gửi đến tên miền công khai của chính công ty, KHÔNG ghi các truy vấn từ EC2 trong VPC gửi ra tên miền bên ngoài của kẻ tấn công.
- **B (Đúng):** Chính xác! Route 53 Resolver Query Logging ghi lại đầy đủ mọi truy vấn DNS phát sinh từ tài nguyên trong VPC (bao gồm tên miền đầy đủ, bản ghi yêu cầu, IP nguồn, instance ID và mã phản hồi) gửi về S3, CloudWatch Logs hoặc Kinesis Data Firehose, giúp phát hiện chính xác DNS tunneling.
- **C:** VPC Flow Logs không có trường `dns-query-name` và không phân tích payload giao thức DNS ở tầng ứng dụng.
- **D:** CloudTrail ghi các lệnh gọi API quản lý Route 53 (như ChangeResourceRecordSets), không ghi lưu lượng truy vấn phân giải DNS từ các EC2 instance.

</details>

### Câu 12 `hard`

A security engineer wants to detect external port-scanning reconnaissance targeting public-facing EC2 instances by identifying source IP addresses that send a high number of TCP SYN packets resulting in rejected connections. VPC Flow Logs are currently delivered to an Amazon CloudWatch Logs log group using a custom format that includes the tcp-flags and action fields. How should the engineer detect and alert on this pattern with minimal operational effort?

- **A.** Configure an AWS Config managed rule to trigger whenever TCP SYN packets are rejected by a security group.
- **B.** Filter VPC Flow Logs for tcp-flags equal to 18 (SYN-ACK) and action equal to ACCEPT to detect blocked port scans.
- **C.** Create a CloudWatch Logs metric filter for action=REJECT and tcp-flags=2 (SYN) with an alarm notifying SNS.
- **D.** Enable CloudTrail Insights on the VPC to automatically alert on TCP SYN floods.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư bảo mật muốn phát hiện hoạt động trinh sát quét cổng từ bên ngoài nhắm vào các EC2 instance hướng công khai bằng cách xác định các địa chỉ IP nguồn gửi một số lượng lớn gói tin TCP SYN dẫn đến các kết nối bị từ chối. VPC Flow Logs hiện đang được phân phối tới một nhóm nhật ký Amazon CloudWatch Logs bằng định dạng tùy chỉnh bao gồm các trường tcp-flags và action. Kỹ sư nên phát hiện và cảnh báo về mẫu này như thế nào với nỗ lực vận hành tối thiểu?

**Đáp án đúng:** **C**

Trong **VPC Flow Logs**, trường tùy chỉnh **`tcp-flags`** sử dụng bitmask (`2` = SYN, `18` = SYN-ACK, `4` = RST, `1` = FIN). Kết hợp `action = REJECT` và `tcp-flags = 2` trong **CloudWatch Logs Metric Filter** + **CloudWatch Alarm** giúp phát hiện sớm các đợt quét cổng TCP bị chặn.

- **A:** AWS Config chỉ đánh giá thay đổi cấu hình tài nguyên, không phân tích lưu lượng gói tin mạng hay VPC Flow Logs.
- **B:** Cờ `18` (SYN-ACK) với hành động `ACCEPT` là phản hồi của các kết nối hợp lệ đã được chấp nhận, không phải các gói SYN quét cổng bị từ chối.
- **C (Đúng):** Chính xác! Trong VPC Flow Logs, giá trị `tcp-flags` bằng `2` biểu thị gói tin TCP SYN (khởi tạo kết nối mới), và `action = REJECT` biểu thị gói tin bị Security Group hoặc NACL từ chối. Tạo CloudWatch Logs Metric Filter lọc mẫu này và gắn CloudWatch Alarm gửi qua SNS giúp cảnh báo tự động hành vi quét cổng (port scanning).
- **D:** CloudTrail Insights phân tích bất thường về API calls trong CloudTrail, không phân tích gói tin TCP hay VPC Flow Logs.

</details>

### Câu 13 `hard`

A SOC team needs to ingest AWS WAF logs, VPC Flow Logs, and CloudTrail logs from multiple accounts into a near-real-time, full-text searchable analytics engine with interactive visual dashboards for threat hunting. The team wants to minimize custom ingestion infrastructure while supporting automatic buffering, compression, and direct delivery into the analytics engine. Which architecture should the team deploy?

- **A.** Stream logs through Amazon Data Firehose (Kinesis Data Firehose) into Amazon OpenSearch Service with OpenSearch Dashboards.
- **B.** Store all logs in Amazon S3 Glacier Flexible Retrieval and query them with Amazon Athena for real-time dashboards.
- **C.** Send all logs to Amazon SQS standard queues and connect Amazon QuickSight directly to SQS for real-time search.
- **D.** Use AWS Config Aggregator with custom rules to provide full-text search across AWS WAF and VPC Flow Logs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm SOC cần nhập nhật ký AWS WAF, VPC Flow Logs và nhật ký CloudTrail từ nhiều tài khoản vào một công cụ phân tích có thể tìm kiếm toàn văn theo thời gian gần thực với các bảng điều khiển trực quan tương tác để săn tìm mối đe dọa. Nhóm muốn giảm thiểu hạ tầng nhập dữ liệu tùy chỉnh trong khi hỗ trợ đệm (buffering), nén và phân phối trực tiếp tự động vào công cụ phân tích. Nhóm nên triển khai kiến trúc nào?

**Đáp án đúng:** **A**

Khi đề thi SCS-C02 yêu cầu **near-real-time full-text search + interactive dashboards** cho log bảo mật (WAF, VPC Flow Logs, CloudTrail) với ít hạ tầng quản lý: **Amazon Data Firehose → Amazon OpenSearch Service (OpenSearch Dashboards)** là mẫu kiến trúc chuẩn.

- **A (Đúng):** Chính xác! **Amazon Data Firehose** hỗ trợ nhận log trực tiếp từ AWS WAF, CloudWatch Logs subscription filters (VPC Flow Logs, CloudTrail), tự động buffer, nén và đẩy gần thời gian thực vào **Amazon OpenSearch Service** để tìm kiếm toàn văn (full-text search) và trực quan hóa trên OpenSearch Dashboards.
- **B:** S3 Glacier Flexible Retrieval yêu cầu restore nhiều phút đến nhiều giờ trước khi đọc, hoàn toàn không hỗ trợ truy vấn hay dashboard gần thời gian thực.
- **C:** Amazon QuickSight không kết nối trực tiếp tới SQS làm công cụ tìm kiếm toàn văn (full-text search) cho log bảo mật.
- **D:** AWS Config Aggregator chỉ tổng hợp trạng thái cấu hình và tuân thủ của tài nguyên AWS, không thu thập hay tìm kiếm AWS WAF logs và VPC Flow Logs.

</details>

### Câu 14 `medium`

A security team suspects that a compromised EC2 instance in a private subnet is exfiltrating sensitive data via DNS tunneling to an external domain using the VPC's default AmazonProvidedDNS resolver. The team inspects VPC Flow Logs for the subnet, but sees no UDP/TCP port 53 traffic to the Amazon DNS server. Why is this traffic missing, and how should the team gain visibility?

- **A.** VPC Flow Logs only capture TCP traffic by default; update the VPC Flow Log custom format to include UDP port 53 packets.
- **B.** VPC Flow Logs exclude Amazon DNS traffic; enable Route 53 Resolver Query Logging to CloudWatch Logs or S3.
- **C.** Enable CloudTrail Data Events for Route 53 to log every DNS query made by EC2 instances.
- **D.** Switch the VPC Flow Logs destination from Amazon S3 to Amazon Data Firehose to unlock DNS metadata logging.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm bảo mật nghi ngờ một EC2 instance bị xâm phạm trong private subnet đang trích xuất dữ liệu nhạy cảm qua đường hầm DNS (DNS tunneling) tới một tên miền bên ngoài bằng trình phân giải AmazonProvidedDNS mặc định của VPC. Nhóm kiểm tra VPC Flow Logs cho subnet đó, nhưng không thấy lưu lượng UDP/TCP port 53 nào tới máy chủ Amazon DNS. Tại sao lưu lượng này bị thiếu và nhóm nên làm thế nào để có được khả năng quan sát?

**Đáp án đúng:** **B**

Một giới hạn rất hay bị hỏi trong SCS-C02: VPC Flow Logs KHÔNG ghi lại traffic đến Amazon DNS Server, IMDS (169.254.169.254), Amazon Time Sync, DHCP và Windows license activation. Muốn thấy DNS queries nội bộ VPC, phải bật Route 53 Resolver Query Logs (và muốn chặn domain độc hại thì dùng Route 53 Resolver DNS Firewall).

- **A:** VPC Flow Logs ghi nhận cả TCP lẫn UDP, nhưng luôn bỏ qua lưu lượng tới Amazon Provided DNS server bất kể custom format.
- **B (Đúng):** Chính xác! Theo thiết kế của AWS, VPC Flow Logs không ghi lại traffic gửi tới Amazon DNS server (.2), IMDS (169.254.169.254) hay DHCP. Để giám sát truy vấn DNS từ VPC, bắt buộc phải bật Route 53 Resolver Query Logging.
- **C:** CloudTrail ghi lại API control plane (như tạo Hosted Zone/Record), không hỗ trợ ghi lại từng DNS query data plane từ EC2.
- **D:** Thay đổi đích lưu trữ của VPC Flow Logs không thay đổi loại traffic được thu thập; traffic tới Amazon DNS server vẫn bị bỏ qua.

</details>

### Câu 15 `medium`

An enterprise operates multiple SIEM and analytics tools (including Amazon OpenSearch Service and a third-party SIEM) and needs a centralized security data lake across all AWS Organizations accounts. The solution must automatically collect CloudTrail, VPC Flow Logs, Route 53 Resolver Query Logs, and Security Hub findings, normalize them into an open industry-standard schema in Apache Parquet format, and minimize custom ETL maintenance. Which TWO statements accurately describe the recommended AWS solution? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Use AWS CloudTrail Lake to normalize VPC Flow Logs and Route 53 Resolver Query Logs into OCSF Parquet files.
- **B.** Use Amazon GuardDuty to export raw VPC Flow Logs in OCSF format directly to third-party SIEM tools.
- **C.** Enable Amazon Security Lake via a Delegated Admin to ingest and normalize AWS logs into OCSF Parquet format.
- **D.** Deploy an AWS Glue crawler on raw CloudTrail JSON files in S3 to automatically generate OCSF-compliant tables without writing transformation code.
- **E.** Configure Security Lake Subscribers (Data or Query Access) so OpenSearch and third-party SIEMs can consume OCSF data.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp vận hành nhiều công cụ SIEM và phân tích (bao gồm Amazon OpenSearch Service và một SIEM của bên thứ ba) và cần một hồ dữ liệu bảo mật (security data lake) tập trung trên tất cả tài khoản AWS Organizations. Giải pháp phải tự động thu thập CloudTrail, VPC Flow Logs, Route 53 Resolver Query Logs và các finding của Security Hub, chuẩn hóa chúng theo một schema tiêu chuẩn mở của ngành ở định dạng Apache Parquet và giảm thiểu bảo trì ETL tùy chỉnh. HAI phát biểu nào mô tả chính xác giải pháp AWS được khuyến nghị? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Khi đề thi nhắc tới 'centralized security data lake', 'open schema / OCSF', 'Apache Parquet', và 'minimal ETL' cho nhiều nguồn log bảo mật đa tài khoản, đáp án chuẩn xác luôn là **Amazon Security Lake** cùng cơ chế **Subscribers**.

- **A:** CloudTrail Lake chuyên dùng cho sự kiện CloudTrail, AWS Config và audit events (định dạng ORC nội bộ), không thu thập VPC Flow Logs/Route 53 Query Logs và không xuất chuẩn OCSF.
- **B:** GuardDuty chỉ xuất các Security Findings (định dạng JSON/ASFF), không xuất raw VPC Flow Logs.
- **C (Đúng):** Chính xác! Amazon Security Lake tự động thu thập log từ các nguồn AWS và bên thứ 3 xuyên suốt AWS Organizations, chuyển đổi sang chuẩn mở OCSF dưới dạng Apache Parquet mà không cần tự viết ETL.
- **D:** AWS Glue Crawler chỉ suy diễn schema gốc của file JSON chứ không tự động chuyển đổi định dạng dữ liệu sang chuẩn OCSF Parquet; bạn sẽ phải tự viết và bảo trì Glue ETL job phức tạp.
- **E (Đúng):** Chính xác! Security Lake quản lý quyền truy cập dữ liệu cho các công cụ SIEM/Analytics thông qua mô hình Subscribers (hỗ trợ cả Data Access qua SQS/S3 và Query Access qua Lake Formation).

</details>

---

[Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md)
