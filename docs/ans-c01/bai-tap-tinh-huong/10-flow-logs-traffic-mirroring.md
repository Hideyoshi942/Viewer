# Bài tập tình huống — VPC Flow Logs, Traffic Mirroring & Xử lý sự cố Mạng Chuyên sâu

> Phân tích VPC Flow Logs (v2-v5, Transit Gateway Flow Logs), bắt gói tin sâu với Traffic Mirroring (VXLAN) và quy trình chẩn đoán lỗi kết nối/MTU/BGP.
> **Số câu hỏi:** 14 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A company deploys a Network Load Balancer (NLB) in front of an Auto Scaling group of EC2 instances. When analyzing VPC Flow Logs on the EC2 instance ENIs, the engineer sees the NLB's private IP as the source IP instead of the actual client IP, even though NLB preserves client IP by default. What is the most likely cause, and which custom Flow Log field confirms the original packet source?

- **A.** Cross-Zone Load Balancing is enabled on the NLB, replacing the client IP; inspect the flow-direction Flow Log field.
- **B.** The subnet Network ACL is rewriting source IP headers in transit; inspect the sublocation-id Flow Log field.
- **C.** The EC2 instance is not a Nitro-based instance, preventing client IP preservation; inspect the tcp-flags Flow Log field.
- **D.** The NLB target group is using IP-type targets instead of Instance-type targets, or Proxy Protocol v2 is disabled; inspect the pkt-srcaddr field.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty triển khai Network Load Balancer (NLB) phía trước một Auto Scaling group gồm các EC2 instance. Khi phân tích VPC Flow Logs trên các ENI của EC2 instance, kỹ sư thấy IP riêng của NLB là IP nguồn thay vì IP thực tế của client, mặc dù NLB mặc định bảo toàn IP client. Nguyên nhân khả dĩ nhất là gì, và trường Flow Log tùy chỉnh nào xác nhận nguồn gói tin gốc?

**Đáp án đúng:** **D**

VPC Flow Logs hỗ trợ các trường tùy chỉnh như `pkt-srcaddr` và `pkt-dstaddr` để theo dõi địa chỉ IP thực sự bên trong gói tin khi có sự tham gia của NAT Gateway, Transit Gateway hoặc Load Balancer.

- **A:** Cross-Zone Load Balancing không làm thay đổi cơ chế bảo toàn Client IP của NLB.
- **B:** Network ACL là bộ lọc stateless, không bao giờ rewrite địa chỉ IP.
- **C:** Việc NLB bảo toàn Client IP không phụ thuộc vào việc EC2 target có phải Nitro hay không.
- **D (Đúng):** Chính xác. Khi dùng IP target type (mặc định với một số cấu hình hoặc khi bật source IP preservation = false), NLB thực hiện SNAT thành IP của NLB; trường pkt-srcaddr trong VPC Flow Logs v5 giúp phân biệt IP gốc của gói tin so với srcaddr.

</details>

### Câu 2 `medium`

A network engineer attempts to configure VPC Traffic Mirroring on a legacy t2.large EC2 instance to capture packets for a security IDS appliance, but the instance does not appear as a valid mirror source. Why?

- **A.** VPC Traffic Mirroring only supports AWS Nitro-based EC2 instances.
- **B.** Traffic Mirroring requires UDP port 6081 to be open in the source Security Group.
- **C.** The EC2 instance must be in a public subnet to mirror traffic.
- **D.** The IDS target must be an Application Load Balancer rather than an ENI or NLB.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư mạng cố gắng cấu hình VPC Traffic Mirroring trên một EC2 instance t2.large cũ để bắt gói tin cho thiết bị bảo mật IDS, nhưng instance này không xuất hiện dưới dạng nguồn mirror hợp lệ. Tại sao?

**Đáp án đúng:** **A**

VPC Traffic Mirroring chỉ hỗ trợ Nitro-based EC2 instances và gửi gói tin đã đóng gói VXLAN (UDP port 4789) tới Mirror Target (ENI, NLB hoặc GWLBE).

- **A (Đúng):** Chính xác. VPC Traffic Mirroring yêu cầu Nitro-based EC2 instances (như t3, m5, c5, r5...); các dòng thế hệ cũ như t2, m4 không được hỗ trợ.
- **B:** Traffic Mirroring đóng gói bằng VXLAN trên UDP port 4789 (không phải GENEVE 6081), và cần mở trên Security Group của Mirror Target.
- **C:** Traffic Mirroring hoạt động bình thường trong private subnet.
- **D:** Mirror target chỉ hỗ trợ ENI, Network Load Balancer (NLB) hoặc Gateway Load Balancer Endpoint (GWLBE), không hỗ trợ ALB.

</details>

### Câu 3 `hard`

Two Nitro-based EC2 instances in the same VPC and same Availability Zone transfer large files over TCP. After an engineer routes this traffic through an AWS Site-to-Site VPN connection to another VPC for compliance testing, throughput drops dramatically and large packets are silently dropped. What is the root cause?

- **A.** EC2 uses Jumbo Frames (MTU 9001) in-VPC, while Site-to-Site VPN has a 1446-byte MTU limit and ICMP Fragmentation Needed packets are blocked.
- **B.** AWS Transit Gateway limits inter-AZ MTU to 1280 bytes for all IPv4 traffic routed across VPN attachments.
- **C.** Site-to-Site VPN only supports UDP traffic and silently drops any TCP segments larger than 1000 bytes without sending ICMP error notifications.
- **D.** Nitro-based EC2 instances automatically disable TCP Window Scaling when traffic traverses IPsec VPN tunnels.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Hai EC2 instance nền tảng Nitro trong cùng một VPC và cùng một Availability Zone truyền các tệp lớn qua TCP. Sau khi một kỹ sư định tuyến lưu lượng này qua kết nối AWS Site-to-Site VPN đến một VPC khác để kiểm thử tuân thủ, thông lượng giảm mạnh và các gói tin lớn bị loại bỏ âm thầm. Nguyên nhân gốc rễ là gì?

**Đáp án đúng:** **A**

Lỗi MTU black hole xảy ra khi kích thước gói tin vượt quá MTU của đường truyền (8500 trên TGW, 1500 trên IGW/Peering cross-region, ~1446 trên IPsec VPN) và gói tin ICMP Fragmentation Needed bị chặn bởi firewall/SG/NACL.

- **A (Đúng):** Chính xác. Trong cùng VPC, EC2 hỗ trợ MTU 9001 (Jumbo Frames), nhưng qua Site-to-Site VPN MTU tối đa chỉ khoảng 1446 bytes (hoặc 1500 qua Internet). Nếu Path MTU Discovery (PMTUD) bị chặn (ICMP Type 3 Code 4 bị drop bởi SG/NACL), các gói tin lớn sẽ bị drop âm thầm (MTU black hole).
- **B:** Transit Gateway hỗ trợ MTU lên tới 8500 bytes cho VPC attachment.
- **C:** Site-to-Site VPN hỗ trợ mọi giao thức IP bao gồm TCP và UDP.
- **D:** Nitro instances không tự tắt TCP Window Scaling; vấn đề mất gói lớn là do MTU mismatch và PMTUD black hole.

</details>

### Câu 4 `medium`

A company sends VPC Flow Logs to Amazon S3 for cost-effective long-term storage and ad-hoc querying. They want to minimize S3 storage costs and query latency when investigating incidents across 500 GB of daily logs using Amazon Athena. Which configuration is optimal?

- **A.** Enable VPC Traffic Mirroring directly to Amazon S3 instead of VPC Flow Logs for ad-hoc Athena querying.
- **B.** Store Flow Logs in Apache Parquet format with Hive-compatible S3 prefixes and hourly partitioning.
- **C.** Send Flow Logs to Amazon CloudWatch Logs first and export them daily to Amazon S3 using a scheduled Lambda function.
- **D.** Store Flow Logs in plain text format and set the aggregation interval to 1 minute for faster Athena queries.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty gửi VPC Flow Logs đến Amazon S3 để lưu trữ dài hạn tiết kiệm chi phí và truy vấn đột xuất (ad-hoc). Họ muốn tối thiểu hóa chi phí lưu trữ S3 và độ trễ truy vấn khi điều tra sự cố trên 500 GB nhật ký hằng ngày bằng Amazon Athena. Cấu hình nào là tối ưu?

**Đáp án đúng:** **B**

VPC Flow Logs hỗ trợ ghi trực tiếp ra S3 với định dạng Apache Parquet, Hive-compatible prefixes và hourly partitioning — tối ưu nhất cho Amazon Athena.

- **A:** Traffic Mirroring không xuất trực tiếp ra S3 và lưu toàn bộ payload gói tin sẽ tốn dung lượng khổng lồ.
- **B (Đúng):** Chính xác. Lưu VPC Flow Logs ở định dạng cột Apache Parquet (nén tốt hơn text thuần) kết hợp Hive-compatible prefixes và phân vùng theo giờ (hourly partitioning) giúp giảm mạnh chi phí S3 và lượng dữ liệu Athena phải quét.
- **C:** Đẩy qua CloudWatch Logs rồi mới export sang S3 tốn thêm chi phí ingestion đắt đỏ của CloudWatch Logs.
- **D:** Plain text tốn nhiều dung lượng hơn Parquet, còn aggregation interval 1 phút tạo ra số lượng log lớn gấp nhiều lần so với mặc định 10 phút.

</details>

### Câu 5 `hard`

A network operations team is investigating intermittent packet drops and asymmetric routing issues between an on-premises network and EC2 instances in a VPC attached to a Transit Gateway. The team needs to capture the original source IP, destination IP, TCP flags, and the exact flow direction (ingress vs. egress) as well as Transit Gateway attachment IDs in the logs. How should the team configure Flow Logs?

- **A.** Enable AWS CloudTrail Data Events for EC2 Elastic Network Interfaces to capture TCP flags and flow direction.
- **B.** Enable VPC Flow Logs on the EC2 subnets using the default log format and stream them to Amazon CloudWatch Logs for asymmetric routing inspection.
- **C.** Enable VPC Flow Logs with a custom format (`pkt-srcaddr`, `pkt-dstaddr`, `tcp-flags`, `flow-direction`) and Transit Gateway Flow Logs.
- **D.** Enable AWS Global Accelerator Flow Logs on the AWS Transit Gateway to trace asymmetric on-premises packets.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ vận hành mạng đang điều tra sự cố mất gói ngắt quãng và định tuyến bất đối xứng giữa mạng tại chỗ và các EC2 instance trong một VPC gắn với Transit Gateway. Đội ngũ cần ghi lại IP nguồn gốc, IP đích, các cờ TCP và hướng luồng chính xác (ingress so với egress) cũng như ID của Transit Gateway attachment trong nhật ký. Đội ngũ nên cấu hình Flow Logs như thế nào?

**Đáp án đúng:** **C**

Để debug sâu các vấn đề định tuyến bất đối xứng hoặc bắt tay TCP, cần dùng Custom Format trong VPC Flow Logs (chứa `tcp-flags`, `flow-direction`, `pkt-srcaddr`, `pkt-dstaddr`) kết hợp với Transit Gateway Flow Logs.

- **A:** CloudTrail ghi nhận các API call ở control plane, không ghi nhận lưu lượng gói tin ở data plane.
- **B:** Định dạng mặc định (default format v2) của VPC Flow Logs không bao gồm các trường nâng cao như `tcp-flags`, `flow-direction`, hay `pkt-srcaddr`/`pkt-dstaddr`.
- **C (Đúng):** Chính xác. Custom format v3+ của VPC Flow Logs cho phép ghi nhận `pkt-srcaddr`, `pkt-dstaddr`, `tcp-flags`, `flow-direction`, kết hợp với Transit Gateway Flow Logs để theo dõi attachment ID và đường đi qua TGW.
- **D:** Global Accelerator Flow Logs chỉ ghi nhận lưu lượng đi qua Global Accelerator, không gắn vào Transit Gateway.

</details>

### Câu 6 `medium`

A telecommunications company needs to perform deep packet inspection (DPI) on all layer 7 payloads entering and leaving a fleet of Nitro-based EC2 instances for intrusion detection, without introducing any inline latency or modifying the application routing tables. Which AWS feature satisfies this requirement?

- **A.** VPC Flow Logs with all custom fields enabled and streamed to Amazon S3.
- **B.** Enable Enhanced Networking (ENA) packet capture mode in the VPC subnet settings.
- **C.** Amazon VPC Traffic Mirroring sending mirrored packets to a Gateway Load Balancer or NLB target.
- **D.** AWS Network Firewall deployed inline via Gateway Load Balancer Endpoints.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty viễn thông cần thực hiện kiểm tra gói tin sâu (DPI) trên tất cả các payload layer 7 đi vào và đi ra một cụm EC2 instance nền tảng Nitro để phát hiện xâm nhập, mà không gây ra bất kỳ độ trễ nội tuyến (inline latency) nào hay sửa đổi bảng định tuyến của ứng dụng. Tính năng AWS nào đáp ứng yêu cầu này?

**Đáp án đúng:** **C**

Amazon VPC Traffic Mirroring hoạt động out-of-band trên các Nitro-based EC2 instances, sao chép toàn bộ gói tin (bao gồm cả payload) gửi tới hệ thống IDS/DPI thông qua VXLAN (UDP port 4789) mà không ảnh hưởng đến đường đi hay độ trễ của lưu lượng chính.

- **A:** VPC Flow Logs chỉ ghi nhận metadata ở Layer 3/4 (header), không chứa payload Layer 7 nên không thể thực hiện DPI.
- **B:** Không có tính năng 'ENA packet capture mode' ở cấp subnet; việc sao chép gói tin trên AWS được thực hiện qua VPC Traffic Mirroring.
- **C (Đúng):** Chính xác. VPC Traffic Mirroring sao chép lưu lượng out-of-band trực tiếp từ ENI của Nitro-based EC2 instances gửi tới một thiết bị phân tích (qua NLB/GWLB/ENI) để thực hiện DPI mà không làm tăng độ trễ inline và không cần sửa route table.
- **D:** Triển khai inline qua GWLB bắt buộc phải sửa đổi VPC route tables và thêm độ trễ inline cho gói tin.

</details>

### Câu 7 `hard`

An operations engineer notices that an application running on Amazon EC2 instances in a private subnet is experiencing intermittent connection timeouts when uploading large payloads to an external HTTPS API through a NAT Gateway. The engineer suspects either NAT Gateway port allocation exhaustion or MTU/fragmentation issues along the path. Which TWO metrics or mechanisms should the engineer inspect to diagnose these root causes? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Run Path MTU Discovery / ping (-M do) and verify whether ICMP Type 3 Code 4 is blocked by Security Groups or NACLs.
- **B.** Enable Jumbo Frames (9001 MTU) on the NAT Gateway to allow larger unfragmented HTTPS packets across the public internet.
- **C.** Check the `BGPState` metric on the Internet Gateway.
- **D.** Inspect the `HealthyHostCount` CloudWatch metric on the VPC Route Table for NAT Gateway drops.
- **E.** Check the `ErrorPortAllocation` and `PacketsDropCount` Amazon CloudWatch metrics for the NAT Gateway.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư vận hành nhận thấy một ứng dụng chạy trên các Amazon EC2 instance trong private subnet gặp tình trạng hết thời gian chờ kết nối ngắt quãng khi tải lên các payload lớn đến một HTTPS API bên ngoài qua NAT Gateway. Kỹ sư nghi ngờ do cạn kiệt cấp phát cổng NAT Gateway hoặc sự cố MTU/phân mảnh dọc theo đường truyền. Kỹ sư nên kiểm tra HAI chỉ số hoặc cơ chế nào để chẩn đoán các nguyên nhân gốc rễ này? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, E**

Khi gặp timeout bất thường qua NAT Gateway với payload lớn: (1) kiểm tra `ErrorPortAllocation` trên CloudWatch để phát hiện cạn kiệt ephemeral port (một IP NAT Gateway chỉ hỗ trợ ~55,000 kết nối đồng thời tới một đích duy nhất), và (2) kiểm tra PMTUD / ICMP Type 3 Code 4 (Fragmentation Needed) xem có bị NACL/SG chặn dẫn đến MTU black hole hay không.

- **A (Đúng):** Chính xác. Nếu payload lớn gặp sự cố do MTU (ví dụ 1500 qua Internet vs 9001 Jumbo Frames trong VPC), việc chặn ICMP Type 3 Code 4 sẽ làm gãy Path MTU Discovery (PMTUD black hole), gây timeout.
- **B:** Internet công cộng chỉ hỗ trợ chuẩn MTU tối đa 1500 bytes; lưu lượng đi qua IGW luôn bị giới hạn ở 1500 MTU (không hỗ trợ Jumbo Frames ra Internet).
- **C:** Internet Gateway là dịch vụ được quản lý hoàn toàn và không có BGP session hay metric `BGPState`.
- **D:** VPC Route Table không có metric `HealthyHostCount` (đây là metric của Load Balancer).
- **E (Đúng):** Chính xác. `ErrorPortAllocation` trên NAT Gateway cho biết tình trạng cạn kiệt cổng nguồn (port allocation errors) khi có quá nhiều kết nối đồng thời tới cùng một đích; `PacketsDropCount` cho biết số gói tin bị drop bởi NAT Gateway.

</details>

### Câu 8 `hard`

A developer reports that an Amazon EC2 instance in a private subnet (10.1.2.15) cannot connect to an Amazon RDS PostgreSQL instance (10.1.3.25) on TCP port 5432 in the same VPC. The VPC Flow Logs on the RDS ENI show `ACCEPT` for incoming SYN packets from 10.1.2.15:49152 to 10.1.3.25:5432, and `REJECT` for outbound traffic from 10.1.3.25:5432 to 10.1.2.15:49152. What is the MOST likely cause of this issue?

- **A.** The VPC Route Table associated with the RDS subnet is missing a local route for the 10.1.0.0/16 CIDR block.
- **B.** The RDS Security Group is stateless and missing an explicit outbound rule allowing return TCP port 5432 traffic to 10.1.2.15.
- **C.** The Network ACL on the RDS (or EC2) subnet is missing an inbound/outbound rule allowing ephemeral TCP ports (1024-65535).
- **D.** The EC2 instance in the private subnet does not have a public IPv4 address assigned for local VPC routing.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên báo cáo rằng một Amazon EC2 instance trong private subnet (10.1.2.15) không thể kết nối đến một Amazon RDS PostgreSQL instance (10.1.3.25) trên cổng TCP 5432 trong cùng một VPC. VPC Flow Logs trên ENI của RDS hiển thị `ACCEPT` cho các gói SYN đi vào từ 10.1.2.15:49152 đến 10.1.3.25:5432, và `REJECT` cho lưu lượng đi ra từ 10.1.3.25:5432 đến 10.1.2.15:49152. Nguyên nhân khả dĩ NHẤT của sự cố này là gì?

**Đáp án đúng:** **C**

Dấu hiệu kinh điển trong VPC Flow Logs: chiều vào `ACCEPT` nhưng chiều trả về tới ephemeral port (49152) bị `REJECT` luôn chỉ ra lỗi ở Network ACL (stateless) thiếu rule cho ephemeral ports (1024-65535).

- **A:** Mọi VPC Route Table đều có sẵn local route không thể xóa, và nếu thiếu route thì gói tin đã không đến được RDS ENI để ghi nhận ACCEPT ở chiều vào.
- **B:** Security Group là stateful: khi lưu lượng chiều vào đã khớp rule inbound và được ACCEPT, lưu lượng phản hồi của kết nối đó tự động được phép đi ra bất kể outbound rule của Security Group.
- **C (Đúng):** Chính xác. Security Groups là stateful nên nếu chiều vào đã ACCEPT thì chiều về tự động được phép. Việc chiều về bị `REJECT` ở cổng ephemeral 49152 chứng tỏ Network ACL (stateless) đang chặn lưu lượng trả về trên dải ephemeral ports (1024-65535).
- **D:** Giao tiếp nội bộ trong cùng VPC sử dụng private IP, không cần public IP.

</details>

### Câu 9 `hard`

A network engineer enabled Amazon VPC Flow Logs on a VPC and configured them to be delivered to Amazon S3 in Apache Parquet format with Hive-compatible prefixes, partitioned by hour. The engineer needs to run ad-hoc SQL queries across 30 days of logs to find the top 10 source IP addresses generating `REJECT` traffic on port 3389. Which solution provides the fastest query performance with the least operational overhead?

- **A.** Download the Parquet files from S3 to an EC2 instance and parse them using a Python script.
- **B.** Import the S3 files into an Amazon RDS MySQL database before running SQL queries.
- **C.** Query the Parquet-formatted Flow Logs in S3 directly using Amazon Athena with partition projection enabled.
- **D.** Reconfigure Flow Logs to send to CloudWatch Logs and run CloudWatch Logs Insights queries on the existing S3 Parquet files.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư mạng đã bật Amazon VPC Flow Logs trên một VPC và cấu hình gửi đến Amazon S3 ở định dạng Apache Parquet với tiền tố tương thích Hive, phân vùng theo giờ. Kỹ sư cần chạy các truy vấn SQL đột xuất (ad-hoc) trên 30 ngày nhật ký để tìm 10 địa chỉ IP nguồn hàng đầu tạo ra lưu lượng `REJECT` trên cổng 3389. Giải pháp nào mang lại hiệu năng truy vấn nhanh nhất với ít gánh nặng vận hành nhất?

**Đáp án đúng:** **C**

Khi lưu VPC Flow Logs lên S3 để phân tích dài hạn, chọn định dạng Apache Parquet + Hive-compatible S3 prefixes giúp Amazon Athena quét dữ liệu theo cột và theo phân vùng thời gian nhanh hơn và rẻ hơn nhiều so với plain text.

- **A:** Tải hàng trăm GB/TB log về EC2 để parse thủ công rất chậm và tốn công sức vận hành.
- **B:** Import 30 ngày Flow Logs vào RDS MySQL tốn rất nhiều thời gian, chi phí lưu trữ và công sức vận hành.
- **C (Đúng):** Chính xác. Định dạng Apache Parquet (dạng cột, nén sẵn) kết hợp với Hive-compatible partitioning và Amazon Athena (dùng partition projection) cho phép truy vấn SQL cực nhanh và tiết kiệm chi phí trực tiếp trên S3 mà không cần quản lý server hay ETL.
- **D:** CloudWatch Logs Insights không thể truy vấn trực tiếp các file đã lưu trên S3, và việc đổi đích mới không giải quyết dữ liệu 30 ngày qua trên S3.

</details>

### Câu 10 `medium`

A DevOps engineer configures Amazon VPC Traffic Mirroring on an EC2 instance (t3.large) to capture packets for an intrusion detection system. However, the console returns an error when attempting to create the Traffic Mirror Session for the source ENI. What is the MOST likely cause of this error?

- **A.** VPC Flow Logs must be enabled on the subnet before Traffic Mirroring can be created.
- **B.** The source EC2 instance is an older non-Nitro generation (or the Traffic Mirror Filter / Target is invalid, e.g., an ALB was specified instead of an ENI, NLB, or GWLB).
- **C.** The source EC2 instance type is not a Nitro-based instance, or the target ENI/NLB/GWLB is in a different unsupported configuration; actually `t3.large` is Nitro-based, so the engineer likely selected a non-Nitro instance type (such as `t2.large` or `m4.large`) in another AZ or forgot to allow UDP port 4789 (VXLAN) to the mirror target.
- **D.** Traffic Mirroring only works with IPv6 addresses and cannot mirror IPv4 traffic.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư DevOps cấu hình Amazon VPC Traffic Mirroring trên một EC2 instance (t3.large) để bắt gói tin cho hệ thống phát hiện xâm nhập. Tuy nhiên, bảng điều khiển trả về lỗi khi cố gắng tạo Traffic Mirror Session cho ENI nguồn. Nguyên nhân khả dĩ NHẤT của lỗi này là gì?

**Đáp án đúng:** **B**

Các điều kiện bắt buộc của Amazon VPC Traffic Mirroring: (1) EC2 nguồn phải chạy trên AWS Nitro System, (2) Mirror Target chỉ có thể là ENI, NLB hoặc GWLB endpoint (không hỗ trợ ALB), và (3) Security Group/NACL tại target phải mở UDP port 4789 (VXLAN).

- **A:** VPC Flow Logs và VPC Traffic Mirroring hoàn toàn độc lập với nhau.
- **B (Đúng):** Chính xác. VPC Traffic Mirroring chỉ hỗ trợ Traffic Mirror Target là: Network Interface (ENI), Network Load Balancer (NLB), hoặc Gateway Load Balancer (GWLB) endpoint — không hỗ trợ ALB. Ngoài ra, instance nguồn bắt buộc phải thuộc hệ thống AWS Nitro.
- **C:** t3.large là Nitro-based và lỗi thiếu UDP 4789 sẽ không làm API tạo Traffic Mirror Session báo lỗi ngay lúc khởi tạo (chỉ làm mất gói tin khi chạy).
- **D:** Traffic Mirroring hỗ trợ đầy đủ cả IPv4 và IPv6.

</details>

### Câu 11 `hard`

Users connecting from an on-premises network over an AWS Site-to-Site VPN to an EC2 web application report that TCP handshakes succeed and small API calls work normally, but large HTTP POST uploads and SSH sessions hang indefinitely. Packet captures show the customer router sends packets with the Don't Fragment (DF) bit set. What is the MOST likely cause and resolution?

- **A.** The EC2 instance exceeded the 1,024 packets/second DNS limit; install dnsmasq locally.
- **B.** The Transit Gateway MTU of 8500 is too small for the VPC MTU of 9001; disable Jumbo Frames on the EC2 network interface and Customer Gateway.
- **C.** PMTUD blackhole from blocked ICMP Type 3 Code 4 packets; allow ICMP Fragmentation Needed and set TCP MSS clamping to 1379 bytes on the CGW.
- **D.** The VPC Security Group is blocking ephemeral ports 49152-65535 for return VPN traffic; add an inbound rule allowing all TCP ports.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Người dùng kết nối từ mạng tại chỗ qua AWS Site-to-Site VPN đến một ứng dụng web EC2 báo cáo rằng bắt tay TCP thành công và các lệnh gọi API nhỏ hoạt động bình thường, nhưng các lượt tải lên HTTP POST lớn và phiên SSH bị treo vô thời hạn. Bản chụp gói tin cho thấy router khách hàng gửi các gói tin có bật bit Don't Fragment (DF). Nguyên nhân khả dĩ NHẤT và giải pháp là gì?

**Đáp án đúng:** **C**

Triệu chứng kinh điển của PMTUD Blackhole trên Site-to-Site VPN: TCP handshake/gói nhỏ chạy bình thường nhưng truyền dữ liệu lớn bị treo. Cách khắc phục chuẩn là mở ICMP Type 3 Code 4 và bật TCP MSS clamping (1379 bytes).

- **A:** Lỗi DNS sẽ xảy ra trước khi thiết lập TCP handshake, không gây treo riêng cho gói tin kích thước lớn.
- **B:** Nút thắt MTU nằm ở đường hầm IPsec Site-to-Site VPN (MTU ~1446, nhỏ hơn Internet chuẩn 1500), không phải chênh lệch giữa 9001 và 8500.
- **C (Đúng):** Do IPsec overhead làm giảm MTU của Site-to-Site VPN (xuống ~1446/1420 bytes), nếu ICMP Type 3 Code 4 (Fragmentation Needed) bị chặn sẽ gây PMTUD Blackhole (gói nhỏ qua được, gói lớn bị treo). Giải pháp là mở ICMP Type 3 Code 4 và cấu hình TCP MSS clamping (1379 bytes).
- **D:** Security Group là Stateful nên tự động cho phép return traffic, và nếu bị chặn thì ngay cả TCP handshake cũng không thành công.

</details>

### Câu 12 `medium`

A security operations team must perform deep packet inspection (DPI) on full Layer 2 through Layer 7 payloads of traffic entering and leaving a fleet of Nitro-based EC2 instances hosting sensitive workloads, and forward the copied packets to a third-party IDS appliance fleet without impacting production routing. Which AWS capability should they implement?

- **A.** Configure VPC Traffic Mirroring on ENIs to encapsulate packets in VXLAN (UDP 4789) and send them to an NLB/GWLBE in front of IDS appliances.
- **B.** Enable Amazon GuardDuty Runtime Monitoring and EBS Malware Protection on all Nitro-based EC2 instances.
- **C.** Enable VPC Flow Logs with all custom Layer 7 metadata fields and stream them to Amazon Kinesis Data Firehose for third-party IDS appliance inspection.
- **D.** Enable AWS Transit Gateway Flow Logs with full packet payloads and forward them to an Amazon OpenSearch Service cluster.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ vận hành bảo mật (SecOps) phải thực hiện kiểm tra gói tin sâu (DPI) trên toàn bộ payload từ Layer 2 đến Layer 7 của lưu lượng đi vào và đi ra một cụm EC2 instance nền tảng Nitro đang chạy các workload nhạy cảm, và chuyển tiếp các gói tin đã sao chép đến một cụm thiết bị IDS bên thứ ba mà không ảnh hưởng đến định tuyến production. Họ nên triển khai tính năng AWS nào?

**Đáp án đúng:** **A**

Khi đề bài yêu cầu full packet capture / Deep Packet Inspection (L2-L7 payload) mà không can thiệp inline vào routing, đáp án luôn là VPC Traffic Mirroring (sử dụng VXLAN UDP port 4789 trên EC2 Nitro).

- **A (Đúng):** VPC Traffic Mirroring sao chép toàn bộ gói tin (full packet payload L2-L7) từ ENI của EC2 Nitro, đóng gói bằng VXLAN (UDP 4789) và gửi tới target (ENI, NLB, GWLB Endpoint) của hệ thống IDS mà không làm gián đoạn đường định tuyến production.
- **B:** GuardDuty giám sát hành vi và phát hiện mối đe dọa tự động, không cung cấp bản sao gói tin đầy đủ cho hệ thống IDS bên thứ ba.
- **C:** VPC Flow Logs chỉ ghi lại metadata Layer 3/4 (IP, port, bytes, action), hoàn toàn không chứa nội dung payload gói tin để làm DPI.
- **D:** TGW Flow Logs cũng chỉ là metadata lưu lượng, không chứa payload L7.

</details>

### Câu 13 `hard`

A high-throughput microservice running on an EC2 instance experiences intermittent DNS resolution timeouts and SERVFAIL errors during peak traffic. VPC Flow Logs do not show any REJECT entries for port 53 traffic to the VPC Resolver (x.x.x.2). What is the MOST likely cause and best remediation?

- **A.** VPC Flow Logs are throttling DNS packets on the EC2 ENI; disable VPC Flow Logs on the application subnet.
- **B.** The subnet Network ACL is stateless and is blocking UDP port 53 outbound to the VPC Resolver; add an explicit outbound NACL allow rule for UDP 53.
- **C.** The Route 53 Private Hosted Zone has reached its maximum query rate limit per VPC; migrate all internal service records to a Public Hosted Zone.
- **D.** The EC2 ENI exceeds the 1,024 packets/second AmazonProvidedDNS limit; deploy a local DNS cache (systemd-resolved or dnsmasq) and review DNS TTLs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một microservice có thông lượng cao chạy trên EC2 instance gặp tình trạng hết thời gian chờ phân giải DNS (timeout) và lỗi SERVFAIL ngắt quãng trong giờ cao điểm. VPC Flow Logs không hiển thị bất kỳ mục REJECT nào cho lưu lượng cổng 53 đến VPC Resolver (x.x.x.2). Nguyên nhân khả dĩ NHẤT và biện pháp khắc phục tốt nhất là gì?

**Đáp án đúng:** **D**

Hai kiến thức trọng yếu của ANS-C01 trong câu này: (1) AmazonProvidedDNS (.2) có giới hạn cứng 1,024 pps/ENI, và (2) VPC Flow Logs bỏ qua lưu lượng tới AWS DNS nội bộ (.2). Dùng local DNS cache là giải pháp chuẩn.

- **A:** VPC Flow Logs hoạt động out-of-band và không bao giờ gây throttle lưu lượng mạng hay DNS.
- **B:** Nếu NACL chặn hoàn toàn port 53 thì DNS sẽ lỗi 100% mọi lúc chứ không chỉ xảy ra ngắt quãng (intermittent) vào giờ cao điểm.
- **C:** Nút thắt nằm ở giới hạn 1,024 pps/ENI của VPC Resolver chứ không phải giới hạn của Private Hosted Zone.
- **D (Đúng):** AWS giới hạn cứng 1,024 packets/second trên mỗi ENI tới AmazonProvidedDNS (.2), và VPC Flow Logs mặc định không ghi nhận lưu lượng DNS tới .2. Giải pháp chuẩn là cài local DNS cache trên EC2 và tối ưu TTL.

</details>

### Câu 14 `medium`

An engineer is troubleshooting why an EC2 instance in a private subnet cannot reach an external HTTPS API via a NAT Gateway. VPC Flow Logs on the EC2 ENI show outbound packets to port 443 as ACCEPT, followed by inbound return packets destined to port 53412 as REJECT. Which TWO statements accurately describe the cause and fix? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Enable source/destination check on the NAT Gateway Elastic Network Interface (ENI) and restart the EC2 instance.
- **B.** Replace the NAT Gateway in the public subnet with an Egress-Only Internet Gateway for IPv4 HTTPS outbound traffic.
- **C.** The subnet Network ACL (NACL) is stateless and lacks an inbound allow rule for the ephemeral port range (for example, 1024-65535 or 49152-65535).
- **D.** Add an inbound NACL rule allowing TCP ephemeral ports from 0.0.0.0/0 (with a lower rule number than any deny rule) on the private subnet.
- **E.** The EC2 Security Group is stateless and missing an explicit inbound allow rule for return TCP port 53412 from the NAT Gateway.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư đang xử lý sự cố tại sao một EC2 instance trong private subnet không thể kết nối đến một HTTPS API bên ngoài thông qua NAT Gateway. VPC Flow Logs trên ENI của EC2 cho thấy các gói tin đi ra cổng 443 là ACCEPT, theo sau là các gói tin phản hồi đi vào hướng tới cổng 53412 là REJECT. HAI phát biểu nào mô tả chính xác nguyên nhân và cách khắc phục? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, D**

Khi VPC Flow Logs ghi nhận outbound port 443 ACCEPT nhưng return traffic về port cao (ephemeral port) bị REJECT, nguyên nhân chắc chắn là do NACL (Stateless) chưa mở inbound cho dải Ephemeral Ports.

- **A:** NAT Gateway là dịch vụ managed và luôn cần tắt source/destination check ngầm để chuyển tiếp gói tin cho subnet khác.
- **B:** Egress-Only Internet Gateway chỉ dành cho IPv6, không thay thế được NAT Gateway cho IPv4.
- **C (Đúng):** NACL có tính chất Stateless nên không tự động cho phép gói tin trả về; khi thiếu rule inbound mở dải Ephemeral Ports (chứa port 53412), gói tin trả về bị NACL đánh dấu REJECT.
- **D (Đúng):** Thêm quy tắc inbound NACL cho phép dải TCP ephemeral ports (với số ưu tiên nhỏ hơn quy tắc Deny) sẽ cho phép return traffic đi qua.
- **E:** Security Group là Stateful nên tự động cho phép gói tin trả về của kết nối outbound hợp lệ mà không cần mở inbound ephemeral port.

</details>

---

[Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md)
