# Bài tập tình huống — Chủ đề 3: Enterprise Hybrid Networking — Direct Connect, BGP, Transit Gateway, Route 53 Resolver & Network Firewall

> Direct Connect Gateway, BGP Communities & AS_PATH Prepending, Transit Gateway Inter-Region Peering, Route 53 Resolver Inbound/Outbound Endpoints & Inspection VPC.
> **Số câu hỏi:** 27 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A multinational enterprise connects its on-premises data center to AWS VPCs in us-east-1 and eu-west-1 through two redundant AWS Direct Connect (DX) locations using Transit VIFs attached to a single Direct Connect Gateway and regional AWS Transit Gateways. The network team wants all outbound traffic from AWS to the on-premises prefix 10.200.0.0/16 to prefer DX Connection 1 as the primary path and use DX Connection 2 strictly as a passive failover path. Both DX connections advertise 10.200.0.0/16 via BGP. What configuration should the Solutions Architect implement?

- **A.** Prepend the on-premises ASN multiple times to the BGP AS_PATH attribute advertised over DX Connection 2.
- **B.** Configure BGP community tag 7224:7300 on DX Connection 1 and 7224:7100 on DX Connection 2 on the Transit VIFs.
- **C.** Configure a higher BGP Local Preference value on the on-premises router for DX Connection 1 than for DX Connection 2.
- **D.** Advertise 10.200.0.0/16 with a higher Multi-Exit Discriminator (MED) value on DX Connection 1 than on DX Connection 2.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp đa quốc gia kết nối trung tâm dữ liệu on-premises của mình tới các AWS VPC ở us-east-1 và eu-west-1 thông qua hai vị trí AWS Direct Connect (DX) dự phòng sử dụng các Transit VIF gắn với một Direct Connect Gateway duy nhất và các AWS Transit Gateway khu vực. Nhóm mạng muốn toàn bộ lưu lượng đi ra từ AWS tới tiền tố on-premises 10.200.0.0/16 ưu tiên DX Connection 1 làm đường dẫn chính và chỉ sử dụng DX Connection 2 làm đường dẫn dự phòng thụ động. Cả hai kết nối DX đều quảng bá 10.200.0.0/16 qua BGP. Solutions Architect nên triển khai cấu hình gì?

**Đáp án đúng:** **A**

Để điều khiển hướng traffic từ AWS về on-premises qua Direct Connect Gateway theo mô hình Active/Passive giữa hai kết nối DX khác nhau, **BGP AS_PATH Prepending** trên kết nối dự phòng (DX Connection 2) là phương pháp chuẩn và hoạt động nhất quán trên Transit VIF và Direct Connect Gateway.

- **A (Đúng):** Chính xác. Khi quảng bá cùng một prefix qua nhiều kết nối Direct Connect, AWS đánh giá đường đi ngắn nhất theo AS_PATH (sau khi khớp prefix dài nhất). Việc prepend ASN nhiều lần trên DX Connection 2 khiến AS_PATH dài hơn, buộc AWS luôn ưu tiên DX Connection 1 làm đường chính và chỉ failover sang DX Connection 2 khi đường chính gặp sự cố.
- **B:** BGP Local Preference community tags (7224:7100, 7224:7200, 7224:7300) chỉ áp dụng cho Public VIF và Private VIF/Transit VIF tùy phạm vi, nhưng các community tag 7224:7100-7300 trên Transit VIF có những giới hạn nhất định theo loại VIF (chủ yếu áp dụng cho Private/Transit VIF với Local Preference trong cùng Region). Trong khi đó, bài toán liên vùng qua Direct Connect Gateway với hai DX locations chuẩn nhất là dùng AS_PATH prepending (hoặc 7224:7300 kết hợp đánh giá AS_PATH — lưu ý AWS ưu tiên Local Preference trước AS_PATH, tuy nhiên 7224:7100-7300 không được hỗ trợ trên Transit VIF cho tất cả kịch bản định tuyến liên vùng bằng AS_PATH prepending).
- **C:** BGP Local Preference là thuộc tính cục bộ trong cùng một Autonomous System (iBGP) và không được quảng bá qua phiên eBGP sang AWS. Do đó, cấu hình Local Preference trên router on-premises chỉ ảnh hưởng đến chiều traffic từ on-premises ra AWS, không điều khiển chiều từ AWS về on-premises.
- **D:** Trong BGP, giá trị MED thấp hơn (không phải cao hơn) mới được ưu tiên hơn, và MED chỉ được so sánh khi hai kết nối có cùng AS_PATH và cùng vị trí/router ngang hàng phù hợp; AS_PATH prepending là cơ chế chuẩn và đáng tin cậy nhất giữa hai DX locations khác nhau.

</details>

### Câu 2 `hard`

A healthcare organization requires all ingress and east-west traffic across 30 AWS accounts to be inspected by a fleet of third-party virtual next-generation firewall (NGFW) appliances running on Amazon EC2. The security team needs the firewall fleet to auto-scale horizontally without manual route table updates, maintain flow stickiness for stateful inspection, and operate transparently at Layer 3. Which AWS architecture should the Solutions Architect design?

- **A.** Place the NGFW EC2 instances behind a Network Load Balancer (NLB) in an Inspection VPC and route spoke VPC traffic through full-mesh VPC Peering connections to the NLB.
- **B.** Assign Elastic IP addresses to two active/standby NGFW instances and use an AWS Lambda function triggered by CloudWatch Alarms to update VPC route tables upon appliance failure.
- **C.** Deploy NGFW EC2 instances in an Auto Scaling group behind a Gateway Load Balancer (GWLB) in an Inspection VPC with GWLB Endpoints per AZ and TGW Appliance Mode enabled.
- **D.** Deploy the NGFW EC2 instances behind an Application Load Balancer (ALB) and configure Transit Gateway Connect attachments using GRE tunnels across all 30 spoke VPCs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức y tế yêu cầu toàn bộ lưu lượng ingress và east-west trên 30 AWS account phải được kiểm tra bởi một cụm thiết bị tường lửa thế hệ mới ảo (NGFW) của bên thứ ba chạy trên Amazon EC2. Nhóm bảo mật cần cụm tường lửa tự động mở rộng theo chiều ngang mà không cần cập nhật route table thủ công, duy trì tính cố định luồng (flow stickiness) cho kiểm tra có trạng thái và hoạt động minh bạch ở Layer 3. Solutions Architect nên thiết kế kiến trúc AWS nào?

**Đáp án đúng:** **C**

**AWS Gateway Load Balancer (GWLB)** là giải pháp chuẩn để triển khai, tự động mở rộng (auto-scale) và quản lý các thiết bị tường lửa bên thứ ba (third-party NGFW/IDS/IPS) theo mô hình trong suốt ở Layer 3 sử dụng giao thức **GENEVE (port 6081)**.

- **A:** NLB hoạt động ở Layer 4 (TCP/UDP) và thay đổi địa chỉ nguồn/đích hoặc yêu cầu cấu hình target port cụ thể, không hỗ trợ hoạt động trong suốt ở Layer 3 (bump-in-the-wire) với giao thức GENEVE cho NGFW đa cổng.
- **B:** Mô hình Active/Standby thủ công bằng Lambda không hỗ trợ horizontal auto-scaling, có thời gian hội tụ chậm và là điểm nghẽn băng thông cho 30 tài khoản.
- **C (Đúng):** Chính xác. Gateway Load Balancer (GWLB) kết hợp cơ chế bump-in-the-wire ở Layer 3/Layer 4, đóng gói lưu lượng bằng giao thức GENEVE (UDP port 6081), tự động scale fleet NGFW phía sau mà không cần sửa route table, và duy trì 5-tuple flow stickiness. Kết hợp với GWLB Endpoints và TGW Appliance Mode đảm bảo kiểm tra đối xứng (symmetric inspection).
- **D:** ALB chỉ hỗ trợ HTTP/HTTPS ở Layer 7, không thể kiểm tra lưu lượng Layer 3/4 tổng quát cho toàn bộ VPC.

</details>

### Câu 3 `hard`

An enterprise has 50 spoke VPCs connected to a Shared Services VPC via an AWS Transit Gateway. All spoke VPCs need private connectivity to Amazon S3, AWS KMS, and AWS Systems Manager without traversing the public internet. To reduce costs, the Solutions Architect decides to centralize AWS PrivateLink Interface VPC Endpoints in the Shared Services VPC instead of deploying endpoints in every spoke VPC. Which TWO configurations are required to make this centralized PrivateLink architecture work seamlessly for all spoke VPCs? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Enable Transit Gateway DNS Support and configure BGP peering between the centralized Interface Endpoints and the AWS Transit Gateway.
- **B.** Deploy an Amazon S3 Gateway VPC Endpoint in the Shared Services VPC and route all spoke VPC traffic to it across the AWS Transit Gateway.
- **C.** Create custom Amazon Route 53 Private Hosted Zones for each service endpoint domain (for example, kms.us-east-1.amazonaws.com) with Alias records pointing to the Interface Endpoints, and associate those PHZs with all spoke VPCs.
- **D.** Disable the Enable Private DNS Name option on the centralized Interface VPC Endpoints in the Shared Services VPC.
- **E.** Attach a managed NAT Gateway in the Shared Services VPC to translate private requests from spoke VPCs before they reach the Interface Endpoints.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp có 50 spoke VPC kết nối tới một Shared Services VPC thông qua AWS Transit Gateway. Tất cả các spoke VPC cần kết nối riêng tư tới Amazon S3, AWS KMS và AWS Systems Manager mà không đi qua internet công cộng. Để giảm chi phí, Solutions Architect quyết định tập trung hóa các AWS PrivateLink Interface VPC Endpoint trong Shared Services VPC thay vì triển khai endpoint trong từng spoke VPC. Cần HAI cấu hình nào để kiến trúc PrivateLink tập trung này hoạt động trơn tru cho tất cả các spoke VPC? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, D**

Mô hình tập trung **Interface VPC Endpoints** qua Transit Gateway yêu cầu hai bước cốt lõi: (1) **Tắt Private DNS** trên Interface Endpoint trong Shared Services VPC và (2) Tự tạo **Route 53 Private Hosted Zones** với bản ghi Alias trỏ tới các endpoint đó rồi liên kết (associate) với tất cả spoke VPCs.

- **A:** Interface VPC Endpoints không hỗ trợ BGP peering với Transit Gateway; traffic được định tuyến thông qua bảng định tuyến IP thông thường của TGW.
- **B:** S3 Gateway Endpoint không hỗ trợ định tuyến qua Transit Gateway hoặc VPC Peering (không có tính bắc cầu). Để tập trung S3 qua Transit Gateway phải dùng S3 Interface Endpoint (PrivateLink), hoặc tạo Gateway Endpoint miễn phí tại từng spoke VPC.
- **C (Đúng):** Chính xác. Sau khi tắt Private DNS, cần tự tạo Route 53 Private Hosted Zones cho từng dịch vụ, tạo bản ghi Alias trỏ về DNS name của Interface Endpoint trong Shared Services VPC, rồi associate các PHZ này với toàn bộ 50 spoke VPCs.
- **D (Đúng):** Chính xác. Nếu bật Private DNS trên Interface Endpoint, AWS tự tạo một Route 53 Private Hosted Zone do AWS quản lý và chỉ gắn với riêng Shared Services VPC, đồng thời chặn không cho bạn tự tạo PHZ trùng tên dịch vụ để chia sẻ với các spoke VPCs. Do đó bắt buộc phải tắt Private DNS trên endpoint tập trung.
- **E:** Không cần NAT Gateway; các Interface Endpoints có private IP trong Shared Services VPC và có thể nhận kết nối trực tiếp từ CIDR của các spoke VPCs qua Transit Gateway (chỉ cần mở Security Group của endpoint).

</details>

### Câu 4 `hard`

A global gaming leaderboard application uses Amazon DynamoDB Global Tables replicated across us-east-1, eu-west-1, and ap-northeast-1 to support Active-Active reads and writes. During peak tournaments, read latency on hot leaderboard items spikes to 12 ms, and the team wants microsecond read latency while keeping regional isolation. A developer proposes deploying a single Amazon DynamoDB Accelerator (DAX) cluster in us-east-1 and having all three Regions query it over Transit Gateway peering. What is the BEST architectural recommendation?

- **A.** Approve the single DAX cluster in us-east-1 because DAX automatically caches cross-Region DynamoDB Global Table updates with strong consistency across Regions.
- **B.** Replace Amazon DynamoDB Global Tables with Amazon ElastiCache for Redis Global Datastore as the primary durable system of record for leaderboards.
- **C.** Enable DynamoDB Streams with an AWS Lambda function in each Region to replicate DAX cache entries across all three Regions in real time.
- **D.** Deploy a separate DAX cluster in each of the three Regions for local reads, accepting that Global Table updates refresh in DAX only after TTL expiration.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng bảng xếp hạng trò chơi toàn cầu sử dụng Amazon DynamoDB Global Tables được sao chép trên us-east-1, eu-west-1 và ap-northeast-1 để hỗ trợ đọc và ghi Active-Active. Trong các giải đấu cao điểm, độ trễ đọc trên các mục bảng xếp hạng nóng tăng vọt lên 12 ms, và nhóm muốn độ trễ đọc mức micro-giây trong khi vẫn giữ cách ly theo khu vực. Một lập trình viên đề xuất triển khai một cụm Amazon DynamoDB Accelerator (DAX) duy nhất tại us-east-1 và để cả ba Region truy vấn qua Transit Gateway peering. Khuyến nghị kiến trúc TỐT NHẤT là gì?

**Đáp án đúng:** **D**

Khi kết hợp **DynamoDB Global Tables** với **DAX**, cần triển khai cụm DAX độc lập ở từng Region để đạt độ trễ micro-giây và cô lập lỗi vùng, đồng thời hiểu rõ cơ chế cache consistency: dữ liệu đồng bộ từ Region khác không tự làm mới DAX cho đến khi hết **TTL**.

- **A:** Truy vấn DAX xuyên Region qua Transit Gateway sẽ phát sinh độ trễ mạng WAN hàng trăm mili-giây (phá hủy mục tiêu microsecond latency) và tạo ra điểm lỗi đơn (SPOF) mất tính cô lập vùng.
- **B:** ElastiCache Global Datastore là Active-Passive (chỉ có 1 Region ghi chính) và là in-memory store, không đáp ứng yêu cầu Active-Active multi-region write như DynamoDB Global Tables.
- **C:** DAX không hỗ trợ API ghi trực tiếp vào cache mà không ghi xuống DynamoDB (nếu ghi qua DAX sẽ gây vòng lặp ghi lại vào DynamoDB Global Tables).
- **D (Đúng):** Chính xác. DAX là dịch vụ cache theo từng Region (regional), nên phải triển khai một cụm DAX riêng ở mỗi Region để đạt độ trễ microsecond và giữ regional isolation. Điểm quan trọng trong SAP-C02: DAX chỉ bắt được các lệnh ghi đi trực tiếp qua nó; các thay đổi đồng bộ nền từ Global Tables không tự invalidate DAX, nên dữ liệu sẽ được làm mới theo TTL của DAX.

</details>

### Câu 5 `hard`

A defense contractor has a 10 Gbps AWS Direct Connect dedicated connection between its on-premises data center and AWS. Compliance mandates end-to-end Layer 3 IPsec encryption for all data in transit between on-premises routers and multiple AWS VPCs attached to an AWS Transit Gateway. The contractor wants to avoid traversing the public internet while retaining BGP dynamic routing. Which networking design satisfies these requirements?

- **A.** Deploy AWS Client VPN endpoints in every attached spoke VPC and route encrypted client traffic back to on-premises over a Direct Connect Private VIF.
- **B.** Create a Direct Connect Private VIF attached directly to the AWS Transit Gateway and enable AWS Direct Connect MACsec Layer 2 encryption across the 10 Gbps dedicated port.
- **C.** Create a Direct Connect Public VIF to establish private IPsec Site-to-Site VPN tunnels to the Transit Gateway's VPN endpoints, and enable ECMP across multiple tunnels.
- **D.** Create a Direct Connect Transit VIF attached to a Direct Connect Gateway and enable native Layer 3 IPsec encryption directly on the Transit VIF BGP session.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà thầu quốc phòng có kết nối chuyên dụng AWS Direct Connect 10 Gbps giữa trung tâm dữ liệu on-premises và AWS. Quy định tuân thủ bắt buộc mã hóa IPsec Layer 3 đầu cuối cho toàn bộ dữ liệu truyền qua giữa các router on-premises và nhiều AWS VPC gắn với một AWS Transit Gateway. Nhà thầu muốn tránh đi qua internet công cộng trong khi vẫn giữ định tuyến động BGP. Thiết kế mạng nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **C**

Để mã hóa **IPsec Layer 3 đầu cuối** đi qua đường truyền **AWS Direct Connect** tới **Transit Gateway**, mẫu kiến trúc chuẩn là chạy **AWS Site-to-Site VPN qua Direct Connect Public VIF** (kết hợp **ECMP** nếu cần vượt giới hạn 1.25 Gbps mỗi tunnel). Lưu ý phân biệt với **MACsec** (chỉ là mã hóa Layer 2 point-to-point trên cổng 10G/100G).

- **A:** AWS Client VPN dành cho người dùng cá nhân (end-user laptops/devices), không dùng cho kết nối site-to-site định tuyến BGP giữa router on-premises và Transit Gateway.
- **B:** Private VIF không thể gắn trực tiếp vào Transit Gateway (phải dùng Transit VIF qua Direct Connect Gateway). Hơn nữa, MACsec chỉ mã hóa ở Layer 2 (point-to-point giữa router khách hàng và thiết bị AWS tại DX location), không phải end-to-end Layer 3 IPsec tới tận Transit Gateway.
- **C (Đúng):** Chính xác. Để có mã hóa IPsec đầu cuối (Layer 3) đi qua đường truyền Direct Connect mà không đi ra Internet công cộng tới Transit Gateway, kiến trúc chuẩn là tạo Direct Connect Public VIF, sau đó thiết lập các đường hầm AWS Site-to-Site VPN (BGP dynamic routing) kết cuối vào Transit Gateway VPN Attachment (và bật ECMP để gộp băng thông nhiều tunnel 1.25 Gbps).
- **D:** Direct Connect Transit VIF không có tính năng bật mã hóa IPsec bản địa trực tiếp trên VIF (chỉ có thể chạy VPN bên trong Transit VIF qua private IP tới Transit Gateway nếu dùng Private IP VPN, nhưng trên DX truyền thống/chuẩn SAP-C02, VPN over DX sử dụng Public VIF tới public VPN endpoints hoặc Private IP VPN trên Transit VIF — tuy nhiên Transit VIF không có nút bật 'native IPsec encryption').

</details>

### Câu 6 `hard`

A global company deploys an AWS Transit Gateway in us-east-1 (connected to 20 VPCs in 10.10.0.0/16 through 10.29.0.0/16) and another Transit Gateway in eu-west-1 (connected to 15 VPCs in 10.100.0.0/16 through 10.114.0.0/16). The network engineer establishes a Transit Gateway Inter-Region Peering attachment between the two Transit Gateways and verifies the peering state is Available. However, EC2 instances in us-east-1 still cannot ping EC2 instances in eu-west-1 even though Security Groups and NACLs allow ICMP traffic. What is the MOST likely cause?

- **A.** An AWS Direct Connect Gateway is required as an intermediary router to forward traffic between AWS Transit Gateways deployed in different AWS Regions.
- **B.** Both Transit Gateways must be configured with the exact same BGP Autonomous System Number (ASN) and overlapping route tables for Inter-Region Peering to forward ICMP packets.
- **C.** TGW Inter-Region Peering lacks dynamic route propagation; add static routes to the peering attachment in both TGW route tables and route remote CIDRs in VPC route tables.
- **D.** Transit Gateway Inter-Region Peering only supports TCP and UDP application traffic and drops ICMP echo request packets between Regions by default.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty toàn cầu triển khai AWS Transit Gateway tại us-east-1 (kết nối tới 20 VPC trong dải 10.10.0.0/16 đến 10.29.0.0/16) và một Transit Gateway khác tại eu-west-1 (kết nối tới 15 VPC trong dải 10.100.0.0/16 đến 10.114.0.0/16). Kỹ sư mạng thiết lập một Transit Gateway Inter-Region Peering attachment giữa hai Transit Gateway và xác nhận trạng thái peering là Available. Tuy nhiên, các EC2 instance ở us-east-1 vẫn không thể ping tới các EC2 instance ở eu-west-1 mặc dù Security Group và NACL đã cho phép lưu lượng ICMP. Nguyên nhân có khả năng CAO NHẤT là gì?

**Đáp án đúng:** **C**

Luôn nhớ nguyên tắc vàng của **AWS Transit Gateway Inter-Region Peering**: không có dynamic route propagation giữa hai TGW. Bạn phải cấu hình **static routes** ở cả hai chiều trên TGW route tables và đảm bảo các VPC route tables có route hướng tới CIDR của Region kia qua local TGW.

- **A:** Transit Gateway Inter-Region Peering đi trực tiếp trên hạ tầng mạng backbone toàn cầu được mã hóa của AWS mà không cần Direct Connect Gateway.
- **B:** Ngược lại, hai Transit Gateway peer với nhau không yêu cầu trùng ASN (thực tế thường khuyến nghị ASN khác nhau trong mạng doanh nghiệp để tránh xung đột BGP).
- **C (Đúng):** Chính xác. Một bẫy thi rất phổ biến của SAP-C02: Transit Gateway Inter-Region Peering KHÔNG hỗ trợ tự động lan truyền route (route propagation). Kỹ sư mạng bắt buộc phải thêm các static route (ví dụ summary route hoặc từng CIDR) trỏ sang TGW Peering attachment ở bảng định tuyến của CẢ HAI Transit Gateway (và đảm bảo VPC route table trỏ về TGW cục bộ).
- **D:** Transit Gateway Peering chuyển tiếp bình thường mọi giao thức IP bao gồm TCP, UDP và ICMP.

</details>

### Câu 7 `hard`

An enterprise acquires a startup whose production workloads run in VPC-B (CIDR 10.0.0.0/16), which completely overlaps with the enterprise's core production VPC-A (CIDR 10.0.0.0/16). Re-IPing either VPC is not feasible in the short term. Applications in VPC-A need to privately call a REST API hosted in VPC-B over TCP port 443, and a legacy batch server in VPC-A also needs to initiate outbound connections to a specific SFTP server IP in VPC-B through a Transit Gateway without IP conflicts. Which TWO networking solutions solve these overlapping CIDR requirements? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Deploy an Amazon CloudFront distribution in front of VPC-B's private IP addresses so VPC-A workloads can access them privately without overlapping CIDR conflicts.
- **B.** Establish a VPC Peering connection between VPC-A and VPC-B, update both route tables, and enable DNS resolution on the peering connection.
- **C.** Attach both VPC-A and VPC-B directly to the same AWS Transit Gateway route table and enable Equal Cost Multi-Path (ECMP) routing to resolve IP overlaps.
- **D.** Attach a non-overlapping secondary CIDR block to both VPC-A and VPC-B, place a Private NAT Gateway in the secondary CIDR subnet of VPC-A, and route traffic to VPC-B through a Transit Gateway.
- **E.** Expose the REST API in VPC-B behind a Network Load Balancer (NLB) as an AWS PrivateLink VPC Endpoint Service, and create an Interface VPC Endpoint in VPC-A to consume it privately.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp mua lại một công ty khởi nghiệp có workload production chạy trong VPC-B (CIDR 10.0.0.0/16), trùng lặp hoàn toàn với VPC-A production cốt lõi của doanh nghiệp (CIDR 10.0.0.0/16). Việc đổi dải IP cho một trong hai VPC là không khả thi trong ngắn hạn. Các ứng dụng trong VPC-A cần gọi riêng tư một REST API lưu trữ trong VPC-B qua cổng TCP 443, và một máy chủ batch kế thừa trong VPC-A cũng cần khởi tạo kết nối đi ra tới một địa chỉ IP máy chủ SFTP cụ thể trong VPC-B thông qua Transit Gateway mà không bị xung đột IP. HAI giải pháp mạng nào giải quyết các yêu cầu CIDR trùng lặp này? (Chọn HAI đáp án.)

**Đáp án đúng:** **D, E**

Khi xử lý bài toán **Overlapping CIDR** (thường gặp sau M&A), có 2 vũ khí chính trên AWS: (1) **AWS PrivateLink** (tối ưu nhất cho truy cập dịch vụ TCP/HTTP một chiều) và (2) **Secondary non-overlapping CIDR + Private NAT Gateway** qua Transit Gateway khi cần định tuyến IP truyền thống.

- **A:** CloudFront không hỗ trợ kết nối SFTP (TCP port 22) và không phải là giải pháp kết nối private VPC-to-VPC cho trường hợp trùng CIDR.
- **B:** VPC Peering không thể tạo được giữa hai VPC có dải IPv4 CIDR trùng lặp.
- **C:** Hai VPC trùng dải 10.0.0.0/16 không thể định tuyến trực tiếp cho nhau trên cùng một Transit Gateway route table mà không có cơ chế dịch địa chỉ (NAT) hoặc PrivateLink.
- **D (Đúng):** Chính xác. Khi cần kết nối định tuyến qua Transit Gateway giữa hai VPC trùng CIDR (ví dụ kết nối outbound tới SFTP server), có thể gắn secondary CIDR không trùng lặp vào VPC, đặt Private NAT Gateway trong subnet thuộc secondary CIDR đó để dịch địa chỉ nguồn (SNAT) trước khi đi qua TGW.
- **E (Đúng):** Chính xác. AWS PrivateLink (NLB + Endpoint Service + Interface Endpoint) là giải pháp chuẩn và đơn giản nhất để truy cập dịch vụ một chiều giữa hai VPC có dải CIDR trùng lặp hoàn toàn, vì Interface Endpoint nhận IP cục bộ trong VPC-A và không cần định tuyến CIDR trực tiếp.

</details>

### Câu 8 `hard`

A bank operates 40 private spoke VPCs across member accounts with no Internet Gateways or NAT Gateways in the spoke VPCs. All workloads must be able to download OS patches and call approved third-party SaaS APIs over HTTPS on the internet, while blocking outbound access to all unapproved domains based on FQDN (HTTP Host header and TLS SNI). The security team wants centralized outbound inspection with minimal NAT Gateway costs and high availability across two Availability Zones. Which architecture should the Solutions Architect deploy?

- **A.** Attach an Internet Gateway directly to the AWS Transit Gateway in the Network account and apply AWS WAF domain-filtering rules directly on the Transit Gateway.
- **B.** Deploy a Route 53 Resolver DNS Firewall in the Egress VPC only and skip NAT Gateways because Transit Gateway performs source NAT for outbound internet traffic automatically.
- **C.** Deploy an Egress VPC attached to TGW with Network Firewall (stateful domain-list rules) and NAT Gateways in two AZs; route 0.0.0.0/0 via TGW -> Firewall -> NAT GW -> IGW.
- **D.** Configure VPC Network ACLs in each of the 40 spoke VPCs with stateful outbound rules allowing HTTPS traffic only to the approved third-party FQDNs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ngân hàng vận hành 40 spoke VPC riêng tư trên các member account mà không có Internet Gateway hay NAT Gateway trong các spoke VPC. Tất cả workload phải có thể tải xuống các bản vá hệ điều hành và gọi các SaaS API của bên thứ ba đã được phê duyệt qua HTTPS trên internet, đồng thời chặn truy cập đi ra tới tất cả các tên miền chưa được phê duyệt dựa trên FQDN (HTTP Host header và TLS SNI). Nhóm bảo mật muốn kiểm tra lưu lượng đi ra tập trung với chi phí NAT Gateway tối thiểu và tính sẵn sàng cao trên hai Availability Zone. Solutions Architect nên triển khai kiến trúc nào?

**Đáp án đúng:** **C**

Mô hình **Centralized Egress VPC** kết hợp **Transit Gateway → AWS Network Firewall (Domain List) → NAT Gateway → Internet Gateway** (triển khai tối thiểu 2 AZ) là kiến trúc chuẩn doanh nghiệp để lọc tên miền đầu ra (FQDN/TLS SNI) và tối ưu chi phí NAT Gateway cho hàng chục spoke VPCs.

- **A:** Không thể gắn Internet Gateway trực tiếp vào Transit Gateway, và AWS WAF chỉ dùng cho lưu lượng inbound vào CloudFront/ALB/API Gateway/AppSync, không dùng lọc outbound trên TGW.
- **B:** Transit Gateway không thực hiện Source NAT (vẫn cần NAT Gateway cho các private subnet đi ra Internet), và DNS Firewall chỉ chặn ở tầng phân giải DNS chứ không kiểm tra trực tiếp TLS SNI/HTTP Host nếu ứng dụng kết nối bằng IP.
- **C (Đúng):** Chính xác. Kiến trúc Centralized Egress + Inspection chuẩn đặt AWS Network Firewall (hỗ trợ stateful domain-list filtering theo HTTP Host / TLS SNI) nằm giữa Transit Gateway subnet và NAT Gateway subnet trong Egress VPC (trên 2 AZ), vừa tiết kiệm chi phí NAT Gateway cho 40 VPC vừa kiểm soát chặt tên miền đầu ra.
- **D:** VPC Network ACLs và Security Groups chỉ lọc theo địa chỉ IP/CIDR và port, KHÔNG hỗ trợ lọc theo tên miền (FQDN / TLS SNI).

</details>

### Câu 9 `medium`

A stock exchange runs latency-sensitive trading workloads in AWS that communicate continuously with its on-premises matching engines. To meet its 99.99% SLA, the connectivity must survive the simultaneous loss of an entire AWS Direct Connect location AND a single router failure at the remaining location. In addition, BGP failover between links must occur in under 1 second rather than waiting for the default 90-second BGP hold timer. Which Direct Connect design meets these requirements?

- **A.** Use Direct Connect Maximum Resiliency with four connections across two DX locations (two per location on separate devices) and enable BFD on BGP sessions.
- **B.** Provision two Direct Connect connections at a single DX location with a Site-to-Site VPN backup over the public internet and a 90-second BGP hold timer.
- **C.** Provision two Hosted Connections from the same Direct Connect Partner terminating at a single DX location and enable ECMP across both BGP sessions.
- **D.** Provision a single 100 Gbps Direct Connect connection grouped into a Link Aggregation Group (LAG) with the BGP hold timer reduced to 30 seconds across two VIFs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một sở giao dịch chứng khoán vận hành các workload giao dịch nhạy cảm với độ trễ trên AWS giao tiếp liên tục với các hệ thống khớp lệnh on-premises của mình. Để đáp ứng SLA 99,99%, kết nối phải trụ được trước sự cố mất đồng thời toàn bộ một vị trí AWS Direct Connect VÀ lỗi một router đơn lẻ tại vị trí còn lại. Ngoài ra, quá trình chuyển đổi dự phòng BGP giữa các đường truyền phải diễn ra trong dưới 1 giây thay vì chờ bộ đếm thời gian giữ BGP mặc định 90 giây. Thiết kế Direct Connect nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **A**

Để đạt SLA **99.99%** trên AWS Direct Connect cần mô hình **Maximum Resiliency** (4 kết nối trên 2 DX locations, mỗi nơi 2 thiết bị), và để rút ngắn thời gian phát hiện lỗi BGP từ 90 giây xuống **dưới 1 giây** cần bật **BFD (Bidirectional Forwarding Detection)**.

- **A (Đúng):** Chính xác. Mô hình Maximum Resiliency của AWS Direct Connect (4 kết nối trên 2 DX locations riêng biệt, mỗi location 2 thiết bị khác nhau) chịu được đồng thời sự cố mất cả 1 DX location lẫn lỗi 1 thiết bị ở location còn lại (đạt SLA 99.99%). Bật BFD (Bidirectional Forwarding Detection) giúp phát hiện đứt liên kết và failover BGP trong dưới 1 giây thay vì đợi hold timer mặc định 90 giây.
- **B:** Hai kết nối tại cùng một DX location sẽ mất kết nối hoàn toàn nếu toàn bộ DX location đó gặp sự cố; VPN backup qua Internet cũng không đáp ứng độ trễ/băng thông cho hệ thống giao dịch chứng khoán và không đạt mô hình Maximum Resiliency.
- **C:** Hai kết nối tại cùng một DX location vẫn là điểm lỗi đơn nếu cả location gặp sự cố và không giải quyết thời gian hội tụ dưới 1 giây nếu thiếu BFD.
- **D:** Một LAG chỉ nằm trên một thiết bị AWS tại một DX location duy nhất (single point of failure), và hold time 30 giây vẫn lâu hơn yêu cầu dưới 1 giây rất nhiều.

</details>

### Câu 10 `medium`

A data engineering team runs Amazon EMR and Amazon ECS workloads in private subnets across three Availability Zones. Last month, the AWS bill showed $18,000 in NAT Gateway Data Processing charges. VPC Flow Logs reveal that 85% of the outbound traffic through the NAT Gateways consists of large dataset reads and writes to Amazon S3 and Amazon DynamoDB in the same AWS Region, while the remaining 15% is low-volume outbound API calls to external SaaS vendors. What is the MOST cost-effective way to reduce the NAT Gateway bill with minimal operational effort?

- **A.** Replace the three regional NAT Gateways with a single NAT Gateway in one Availability Zone to eliminate all data processing charges.
- **B.** Move all EMR and ECS workloads into public subnets with public IPv4 addresses and remove the NAT Gateways.
- **C.** Deploy Gateway VPC Endpoints for Amazon S3 and Amazon DynamoDB and associate them with the private subnet route tables.
- **D.** Deploy Interface VPC Endpoints (AWS PrivateLink) for Amazon S3 and Amazon DynamoDB in all three Availability Zones.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ sư dữ liệu chạy các workload Amazon EMR và Amazon ECS trong các private subnet trên ba Availability Zone. Tháng trước, hóa đơn AWS cho thấy 18.000 USD phí xử lý dữ liệu NAT Gateway. VPC Flow Logs tiết lộ rằng 85% lưu lượng đi ra qua các NAT Gateway bao gồm các thao tác đọc và ghi tập dữ liệu lớn tới Amazon S3 và Amazon DynamoDB trong cùng AWS Region, trong khi 15% còn lại là các lệnh gọi API đi ra lưu lượng thấp tới các nhà cung cấp SaaS bên ngoài. Cách tối ưu chi phí NHẤT để giảm hóa đơn NAT Gateway với nỗ lực vận hành tối thiểu là gì?

**Đáp án đúng:** **C**

Một mẹo FinOps kinh điển trên SAP-C02: luôn kiểm tra lưu lượng S3 và DynamoDB đi qua NAT Gateway. Triển khai **Gateway VPC Endpoints cho S3 và DynamoDB** hoàn toàn **miễn phí** (cả phí giờ lẫn phí GB), giúp loại bỏ ngay lập tức phần lớn hóa đơn NAT Gateway Data Processing.

- **A:** Gộp thành 1 NAT Gateway không giảm bất kỳ đồng nào phí NAT Gateway Data Processing ($0.045/GB), thậm chí còn phát sinh thêm phí truyền dữ liệu Cross-AZ và mất tính sẵn sàng cao.
- **B:** Đưa cụm EMR và ECS ra public subnets làm tăng bề mặt tấn công bảo mật nghiêm trọng và còn phát sinh thêm chi phí IPv4 công cộng.
- **C (Đúng):** Chính xác. Gateway VPC Endpoints cho Amazon S3 và Amazon DynamoDB hoàn toàn MIỄN PHÍ (không tính phí giờ và không tính phí xử lý dữ liệu theo GB). Gắn chúng vào route table của các private subnet sẽ chuyển toàn bộ 85% lưu lượng S3/DynamoDB đi trực tiếp nội bộ AWS, cắt giảm ngay ~85% hóa đơn NAT Gateway mà không tốn thêm chi phí endpoint.
- **D:** Interface VPC Endpoints tính phí theo giờ trên mỗi AZ và phí xử lý dữ liệu theo GB (dù rẻ hơn NAT Gateway nhưng vẫn tốn tiền), trong khi Gateway VPC Endpoints cho S3 và DynamoDB trong cùng Region hoàn toàn miễn phí.

</details>

### Câu 11 `hard`

A multinational enterprise operates 120 VPCs across 6 AWS Regions and connects 40 global branch offices via SD-WAN appliances. Network architects must enforce strict traffic segmentation (Production, Staging, and Shared Services) globally, automatically route all inter-segment and internet-bound traffic through regional AWS Network Firewall inspection VPCs, and manage the entire global routing topology declaratively from a single policy document. Which architecture satisfies these requirements with minimal manual route table maintenance?

- **A.** Deploy an AWS Transit Gateway in each of the 6 Regions, create full-mesh Inter-Region Peering attachments, and write Lambda scripts to maintain static routes across all Transit Gateway route tables.
- **B.** Configure AWS Cloud WAN with a global core network policy defining segments, attach VPCs and SD-WAN via Connect, and use service insertion for regional inspection VPCs.
- **C.** Enable AWS Global Accelerator in front of all 120 VPCs and use Accelerator endpoint groups to segment Production, Staging, and Shared Services traffic.
- **D.** Use AWS Direct Connect Gateway to interconnect all 120 VPCs across the 6 Regions and deploy AWS WAF rules directly on the Direct Connect Gateway.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp đa quốc gia vận hành 120 VPC trên 6 AWS Region và kết nối 40 văn phòng chi nhánh toàn cầu qua các thiết bị SD-WAN. Các kiến trúc sư mạng phải thực thi phân tách lưu lượng nghiêm ngặt (Production, Staging và Shared Services) trên toàn cầu, tự động định tuyến toàn bộ lưu lượng liên phân khúc và hướng ra internet qua các VPC kiểm tra AWS Network Firewall khu vực, và quản lý toàn bộ cấu trúc định tuyến toàn cầu theo cách khai báo (declarative) từ một tài liệu chính sách duy nhất. Kiến trúc nào đáp ứng các yêu cầu này với việc bảo trì route table thủ công tối thiểu?

**Đáp án đúng:** **B**

Khi bài toán yêu cầu mạng toàn cầu đa Region kết nối hàng trăm VPC + SD-WAN với phân đoạn tập trung (segments), **service insertion** qua inspection VPC và quản trị khai báo bằng một policy duy nhất, **AWS Cloud WAN** vượt trội hơn hẳn so với việc tự nối lưới Transit Gateway thủ công.

- **A:** Transit Gateway Inter-Region Peering không hỗ trợ dynamic route propagation; việc quản lý full-mesh 6 Region và tự viết script Lambda bảo trì static route cho 120 VPC + 40 chi nhánh SD-WAN tạo ra gánh nặng vận hành cực lớn.
- **B (Đúng):** Chính xác. AWS Cloud WAN được thiết kế chuyên biệt cho mạng doanh nghiệp toàn cầu đa Region và SD-WAN. Toàn bộ phân đoạn mạng (segments), quy tắc chia sẻ route và chèn dịch vụ tường lửa (service insertion qua AWS Network Firewall) được khai báo tập trung trong một file JSON core network policy duy nhất, tự động hóa hoàn toàn routing toàn cầu.
- **C:** AWS Global Accelerator chỉ dùng để tăng tốc lưu lượng từ người dùng Internet vào các endpoint công khai (ALB/NLB/EC2), không phải mạng trục WAN nội bộ để kết nối và phân đoạn 120 VPC với 40 chi nhánh SD-WAN.
- **D:** Direct Connect Gateway không thể định tuyến trực tiếp VPC-to-VPC (chỉ kết nối on-premises tới VPC/TGW) và không thể gắn AWS WAF lên Direct Connect Gateway.

</details>

### Câu 12 `hard`

A global media company has studio offices in Tokyo, London, and New York. Each studio already has a 10 Gbps AWS Direct Connect dedicated connection to the nearest Direct Connect location. The studios need to transfer large raw video files directly between each other with the lowest possible latency and jitter over the AWS global backbone, without routing traffic through any AWS VPC or AWS Region. Which AWS Direct Connect feature enables this capability?

- **A.** Create a centralized Direct Connect Gateway and attach Private VIFs from all three studio locations to the same Direct Connect Gateway over BGP.
- **B.** Enable AWS Direct Connect SiteLink on the VIFs associated with the Direct Connect Gateway so traffic flows directly between DX locations over the AWS backbone.
- **C.** Deploy an AWS Transit Gateway in us-east-1 and connect all three studio locations via Direct Connect Transit VIFs to route inter-studio video traffic.
- **D.** Configure AWS Global Accelerator custom routing across the three Direct Connect locations.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty truyền thông toàn cầu có các văn phòng studio tại Tokyo, London và New York. Mỗi studio đều đã có một kết nối chuyên dụng AWS Direct Connect 10 Gbps tới vị trí Direct Connect gần nhất. Các studio cần truyền các tệp video thô dung lượng lớn trực tiếp cho nhau với độ trễ và dao động độ trễ (jitter) thấp nhất có thể qua mạng đường trục toàn cầu của AWS, mà không cần định tuyến lưu lượng qua bất kỳ AWS VPC hoặc AWS Region nào. Tính năng AWS Direct Connect nào cho phép thực hiện khả năng này?

**Đáp án đúng:** **B**

**AWS Direct Connect SiteLink** là tính năng chuyên biệt cho phép kết nối trực tiếp site-to-site giữa các văn phòng/data center on-premises trên mạng backbone AWS, bỏ qua hoàn toàn AWS Region để đạt độ trễ thấp nhất.

- **A:** Direct Connect Gateway chỉ định tuyến lưu lượng giữa on-premises và AWS VPC/Transit Gateway; theo mặc định nó không định tuyến trực tiếp lưu lượng giữa hai kết nối Direct Connect on-premises với nhau trừ khi bật SiteLink.
- **B (Đúng):** Chính xác. AWS Direct Connect SiteLink cho phép gửi dữ liệu trực tiếp giữa các địa điểm on-premises (Tokyo, London, New York) đi theo đường ngắn nhất giữa các Direct Connect locations trên mạng backbone toàn cầu của AWS mà không cần đi vòng qua bất kỳ AWS Region hay VPC nào.
- **C:** Định tuyến lưu lượng từ Tokyo sang London đi vòng qua Transit Gateway ở us-east-1 vi phạm yêu cầu không đi qua AWS Region và làm tăng độ trễ (latency) đáng kể.
- **D:** AWS Global Accelerator chỉ định tuyến lưu lượng từ Internet công cộng vào các AWS Region, không hoạt động để nối trực tiếp các kết nối Direct Connect on-premises.

</details>

### Câu 13 `medium`

A healthcare provider is provisioning a new 100 Gbps AWS Direct Connect dedicated connection between its primary data center and an AWS Direct Connect location. Regulatory auditors require IEEE 802.1AE Layer 2 hop-by-hop encryption between the customer's edge router and the AWS Direct Connect endpoint device at full 100 Gbps line rate without the throughput bottlenecks of IPsec tunnels. How should the Solutions Architect configure this connection?

- **A.** Enable AWS Direct Connect MACsec encryption on the 100 Gbps dedicated connection and associate a CKN/CAK key pair stored in AWS Secrets Manager.
- **B.** Request a 100 Gbps Hosted Connection from an AWS Direct Connect Partner and enable IEEE 802.1AE MACsec encryption directly on the hosted VIF.
- **C.** Provision 80 AWS Site-to-Site VPN IPsec tunnels over a Direct Connect Public VIF and enable ECMP routing across all tunnels on the AWS Transit Gateway.
- **D.** Enable AWS KMS envelope encryption on the Direct Connect Gateway to automatically encrypt all Ethernet frames traversing the physical fiber.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà cung cấp dịch vụ y tế đang cấp phát một kết nối chuyên dụng AWS Direct Connect 100 Gbps mới giữa trung tâm dữ liệu chính của mình và một vị trí AWS Direct Connect. Các kiểm toán viên quy định yêu cầu mã hóa hop-by-hop ở Layer 2 chuẩn IEEE 802.1AE giữa router biên của khách hàng và thiết bị đầu cuối AWS Direct Connect ở tốc độ đường truyền đầy đủ 100 Gbps mà không bị nghẽn thông lượng như các đường hầm IPsec. Solutions Architect nên cấu hình kết nối này như thế nào?

**Đáp án đúng:** **A**

Khi đề bài yêu cầu mã hóa **Layer 2 (IEEE 802.1AE)** ở tốc độ **line rate (10G/100G)** giữa router on-premises và thiết bị AWS tại Direct Connect location, đáp án luôn là **AWS Direct Connect MACsec** trên **Dedicated Connection** với cặp khóa **CKN/CAK** quản lý qua **AWS Secrets Manager**.

- **A (Đúng):** Chính xác. AWS Direct Connect MACsec cung cấp mã hóa Layer 2 (IEEE 802.1AE) point-to-point giữa router khách hàng và thiết bị AWS ở tốc độ line rate (hỗ trợ cổng Dedicated 10 Gbps và 100 Gbps), sử dụng cặp khóa CKN/CAK lưu an toàn trong AWS Secrets Manager.
- **B:** MACsec chỉ được hỗ trợ trên Dedicated Connections (10 Gbps và 100 Gbps), không hỗ trợ trên Hosted Connections và không cấu hình ở cấp độ VIF.
- **C:** Site-to-Site VPN là mã hóa Layer 3 IPsec (không phải IEEE 802.1AE Layer 2), và việc quản lý 80 tunnel (mỗi tunnel 1.25 Gbps) để đạt 100 Gbps cực kỳ phức tạp và không đạt yêu cầu line-rate L2.
- **D:** Direct Connect Gateway không có tính năng bật mã hóa AWS KMS cho các Ethernet frame ở tầng Layer 2.

</details>

### Câu 14 `hard`

An insurance enterprise is modernizing a 15-year-old monolithic Java application hosted in an on-premises data center (connected via Direct Connect) into microservices deployed across multiple AWS accounts using Amazon EKS and AWS Lambda. The team wants to apply the Strangler Fig pattern so that client applications continue calling a single unified API endpoint while specific URL paths (such as /claims and /quotes) are incrementally routed to new microservices across different AWS accounts, without building and maintaining custom reverse proxy infrastructure. Which AWS service is purpose-built for this scenario?

- **A.** AWS Application Migration Service (AWS MGN)
- **B.** AWS App2Container
- **C.** AWS Migration Hub Refactor Spaces
- **D.** AWS Migration Hub Orchestrator

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp bảo hiểm đang hiện đại hóa ứng dụng Java nguyên khối 15 năm tuổi được lưu trữ tại trung tâm dữ liệu on-premises (kết nối qua Direct Connect) thành các microservice triển khai trên nhiều AWS account sử dụng Amazon EKS và AWS Lambda. Nhóm muốn áp dụng mẫu hình Strangler Fig để các ứng dụng client tiếp tục gọi một API endpoint thống nhất duy nhất trong khi các đường dẫn URL cụ thể (như /claims và /quotes) được định tuyến từng bước tới các microservice mới trên các AWS account khác nhau, mà không cần xây dựng và bảo trì hạ tầng reverse proxy tùy chỉnh. Dịch vụ AWS nào được thiết kế chuyên biệt cho kịch bản này?

**Đáp án đúng:** **C**

**AWS Migration Hub Refactor Spaces** là dịch vụ khởi điểm chuẩn mực cho kiến trúc **Strangler Fig** khi tách dần monolith thành microservices xuyên nhiều tài khoản AWS mà không phải tự xây dựng tầng proxy/networking trung gian.

- **A:** AWS MGN dùng cho chiến lược Rehost (lift-and-shift) sao chép nguyên máy chủ ở tầng block sang EC2, không dùng để định tuyến Strangler Fig giữa monolith và microservices.
- **B:** App2Container dùng để đóng gói ứng dụng Java/.NET thành container (Replatform), không cung cấp lớp định tuyến Strangler Fig xuyên nhiều AWS account.
- **C (Đúng):** Chính xác. AWS Migration Hub Refactor Spaces được xây dựng chuyên biệt cho mẫu Strangler Fig khi hiện đại hóa ứng dụng monolithic sang microservices đa tài khoản: nó tự động điều phối API Gateway, NLB, Transit Gateway và Resource Access Manager để cung cấp một endpoint thống nhất và định tuyến từng đường dẫn URL (/claims, /quotes) sang các microservice mới.
- **D:** Migration Hub Orchestrator dùng để tự động hóa quy trình/workflow di chuyển máy chủ/ứng dụng (ví dụ SAP, SQL Server) chứ không tạo tầng hạ tầng proxy định tuyến Strangler Fig ở runtime.

</details>

### Câu 15 `hard`

An engineering firm operates on-premises NetApp ONTAP storage arrays hosting 150 TB of CAD files accessed via both SMB and NFS, along with iSCSI LUNs for legacy Linux servers. The firm wants to migrate this storage to AWS with minimal application re-architecture, retain native snapshots and deduplication, and achieve near-zero downtime cutover over a 10 Gbps Direct Connect link. Which AWS storage service and migration method should be used?

- **A.** Provision Amazon FSx for NetApp ONTAP and use NetApp SnapMirror over Direct Connect to continuously replicate volumes before performing a brief cutover.
- **B.** Deploy an AWS Storage Gateway S3 File Gateway in front of Amazon S3 to replace the iSCSI LUNs and both NFS and SMB file shares.
- **C.** Migrate all SMB files to Amazon FSx for Windows File Server and attach Amazon EBS gp3 volumes for the Linux NFS shares and iSCSI LUNs.
- **D.** Migrate all 150 TB of CAD files and iSCSI LUNs to Amazon EFS Infrequent Access using AWS DataSync agents over Direct Connect.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty kỹ thuật vận hành các hệ thống lưu trữ NetApp ONTAP on-premises chứa 150 TB tệp CAD được truy cập qua cả SMB và NFS, cùng với các iSCSI LUN cho máy chủ Linux kế thừa. Công ty muốn di chuyển bộ lưu trữ này lên AWS với mức tái kiến trúc ứng dụng tối thiểu, giữ lại các snapshot và tính năng chống trùng lặp nguyên bản, và đạt thời gian chuyển đổi gần như bằng 0 qua đường truyền Direct Connect 10 Gbps. Nên sử dụng dịch vụ lưu trữ AWS và phương thức di chuyển nào?

**Đáp án đúng:** **A**

Bất cứ khi nào gặp kịch bản di chuyển hệ thống lưu trữ **on-premises NetApp** dùng đa giao thức (**NFS + SMB + iSCSI**) cần giữ snapshots/deduplication và cắt chuyển ít downtime, đáp án chuẩn xác luôn là **Amazon FSx for NetApp ONTAP** kết hợp **NetApp SnapMirror**.

- **A (Đúng):** Chính xác. Amazon FSx for NetApp ONTAP là dịch vụ lưu trữ duy nhất trên AWS hỗ trợ đồng thời đa giao thức SMB, NFS và iSCSI block storage, giữ nguyên tính năng deduplication/snapshots quen thuộc, và hỗ trợ sao chép gốc NetApp SnapMirror qua Direct Connect giúp cắt chuyển (cutover) với downtime gần bằng 0.
- **B:** S3 File Gateway không hỗ trợ iSCSI LUNs (cần Volume Gateway riêng) và không cung cấp hiệu năng thấp độ trễ cùng tính năng SnapMirror gốc từ NetApp ONTAP.
- **C:** FSx for Windows chỉ hỗ trợ SMB (không hỗ trợ NFS/iSCSI), và tách riêng sang EBS không giữ được kiến trúc hợp nhất hay sao chép SnapMirror liền mạch từ NetApp.
- **D:** Amazon EFS chỉ hỗ trợ giao thức NFS trên Linux, không hỗ trợ SMB (Windows) và không hỗ trợ iSCSI block LUNs.

</details>

### Câu 16 `medium`

A media agency needs to migrate 80 TB of active NFS file shares from an on-premises Linux storage cluster to Amazon EFS over an existing 1 Gbps AWS Direct Connect link. Production users actively use the same Direct Connect link during business hours (08:00-18:00), so migration traffic must not saturate the link during the day, POSIX permissions and timestamps must be preserved, and data integrity must be automatically verified after transfer. Which solution best meets these requirements?

- **A.** Run manual multi-threaded rsync scripts over SSH across the 1 Gbps Direct Connect link from an on-premises bastion host with cron bandwidth throttling.
- **B.** Deploy an AWS DataSync agent on-premises targeting EFS with POSIX preservation, verification, and bandwidth throttling during business hours.
- **C.** Configure AWS Storage Gateway Tape Gateway with virtual tapes to archive the 80 TB NFS shares and restore them into Amazon EFS.
- **D.** Use AWS Transfer Family with SFTP endpoints and custom SSH keys to upload all 80 TB of active NFS files directly into Amazon EFS.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty truyền thông cần di chuyển 80 TB thư mục chia sẻ tệp NFS đang hoạt động từ cụm lưu trữ Linux on-premises lên Amazon EFS qua đường truyền AWS Direct Connect 1 Gbps hiện có. Người dùng production sử dụng tích cực cùng đường truyền Direct Connect này trong giờ hành chính (08:00-18:00), do đó lưu lượng di chuyển không được làm bão hòa đường truyền vào ban ngày, quyền POSIX và dấu thời gian phải được bảo toàn, và tính toàn vẹn dữ liệu phải được tự động xác minh sau khi truyền. Giải pháp nào đáp ứng tốt nhất các yêu cầu này?

**Đáp án đúng:** **B**

**AWS DataSync** là dịch vụ chủ lực để di chuyển dữ liệu file (**NFS/SMB/HDFS**) trực tuyến sang **EFS/FSx/S3** với đầy đủ **POSIX metadata**, **integrity verification**, **incremental sync** và **bandwidth throttling** bảo vệ đường truyền sản xuất.

- **A:** rsync chạy đơn luồng khá chậm với 80 TB dữ liệu đang thay đổi liên tục, không tự động kiểm tra toàn vẹn đầu cuối ở quy mô lớn và tốn công vận hành quản lý retry/throttling thủ công.
- **B (Đúng):** Chính xác. AWS DataSync được tối ưu cho di chuyển dữ liệu file trực tuyến quy mô lớn (tốc độ cao gấp nhiều lần công cụ mã nguồn mở), tự động bảo toàn POSIX permissions/timestamps, tự kiểm tra toàn vẹn dữ liệu (in-transit & at-rest verification), và hỗ trợ giới hạn băng thông (bandwidth throttling) hoặc đặt lịch chạy ngoài giờ hành chính.
- **C:** Tape Gateway mô phỏng băng từ ảo (VTL) để sao lưu lên S3/Glacier, hoàn toàn không dùng để di chuyển dữ liệu NFS sang Amazon EFS.
- **D:** AWS Transfer Family dành cho trao đổi file B2B với đối tác bên ngoài qua SFTP/FTPS/AS2, không được tối ưu để di chuyển nội bộ 80 TB dữ liệu NFS có bảo toàn toàn bộ POSIX metadata và điều tiết băng thông.

</details>

### Câu 17 `hard`

An enterprise operates 60 spoke VPCs across 30 AWS accounts in us-east-1, all connected to a central Shared Services VPC via an AWS Transit Gateway. Every spoke VPC needs private connectivity to AWS Secrets Manager, AWS KMS, and Amazon SQS without traversing the internet. Provisioning individual Interface VPC Endpoints in all 60 spoke VPCs would exceed the networking budget due to per-AZ hourly endpoint charges. How can the architect centralize Interface VPC Endpoints in the Shared Services VPC while allowing workloads in all 60 spoke VPCs to use standard AWS SDK default endpoints seamlessly?

- **A.** Create Gateway VPC Endpoints for Secrets Manager, KMS, and SQS in the Shared Services VPC and propagate their prefix-list routes to the AWS Transit Gateway route table.
- **B.** Create Interface VPC Endpoints in Shared Services with Private DNS disabled, add Route 53 PHZs with Alias records, and associate PHZs with all 60 spoke VPCs.
- **C.** Deploy NAT Gateways in all 60 spoke VPCs so private EC2 instances can reach Secrets Manager, KMS, and SQS over private AWS backbone IP addresses.
- **D.** Create the Interface VPC Endpoints in the Shared Services VPC with Private DNS enabled and share the endpoints directly across accounts using AWS RAM.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp vận hành 60 spoke VPC trên 30 AWS account tại us-east-1, tất cả đều kết nối tới một Shared Services VPC trung tâm qua AWS Transit Gateway. Mọi spoke VPC cần kết nối riêng tư tới AWS Secrets Manager, AWS KMS và Amazon SQS mà không đi qua internet. Việc cấp phát các Interface VPC Endpoint riêng lẻ trong cả 60 spoke VPC sẽ vượt quá ngân sách mạng do phí endpoint theo giờ trên mỗi AZ. Kiến trúc sư có thể tập trung hóa các Interface VPC Endpoint trong Shared Services VPC như thế nào trong khi vẫn cho phép các workload ở cả 60 spoke VPC sử dụng các endpoint mặc định chuẩn của AWS SDK một cách liền mạch?

**Đáp án đúng:** **B**

Mẫu **Centralized Interface VPC Endpoints** qua Transit Gateway bắt buộc gồm 3 bước: (1) Tạo Interface Endpoints ở Shared Services VPC với **Private DNS = Disabled**, (2) Tạo **Route 53 Private Hosted Zone** (VD `kms.us-east-1.amazonaws.com`) chứa Alias trỏ về endpoint đó, (3) **Associate PHZ** với tất cả spoke VPCs (kể cả cross-account).

- **A:** Gateway VPC Endpoints chỉ hỗ trợ duy nhất Amazon S3 và Amazon DynamoDB (không hỗ trợ Secrets Manager, KMS, SQS), và Gateway Endpoint cũng không thể chia sẻ qua Transit Gateway.
- **B (Đúng):** Chính xác. Đây là mẫu kiến trúc kinh điển của SAP-C02 để tiết kiệm chi phí Interface VPC Endpoints (Centralized PrivateLink): TẮT Private DNS trên endpoint trong Shared Services VPC, tự tạo Route 53 Private Hosted Zone (PHZ) tương ứng tên miền dịch vụ AWS, trỏ Alias record tới DNS của endpoint tập trung, rồi liên kết PHZ đó với cả 60 spoke VPC (và cho phép route qua Transit Gateway).
- **C:** NAT Gateway định tuyến lưu lượng qua Internet Gateway (public endpoints), không đáp ứng yêu cầu kết nối hoàn toàn private bằng PrivateLink và còn phát sinh chi phí NAT Gateway nhân 60 VPC.
- **D:** AWS RAM không hỗ trợ chia sẻ Interface VPC Endpoints trực tiếp giữa các VPC, và nếu bật Private DNS trên endpoint ở Shared Services VPC thì chỉ có Shared Services VPC mới phân giải được — các spoke VPC không thể liên kết được với PHZ do AWS quản lý ẩn đó.

</details>

### Câu 18 `hard`

A banking organization mandates that all East-West (VPC-to-VPC) and North-South (internet-bound) traffic across 40 AWS VPCs attached to an AWS Transit Gateway must be transparently inspected by a horizontally scalable fleet of third-party Palo Alto Networks VM-Series Next-Generation Firewalls (NGFWs) running on EC2. The security team must avoid stateful asymmetric routing issues across Availability Zones and eliminate manual IPsec/BGP tunnels between the Transit Gateway and the firewall appliances. Which architecture should the Solutions Architect deploy?

- **A.** Deploy AWS WAF Web ACLs with managed rule groups directly on the AWS Transit Gateway route table to inspect East-West traffic.
- **B.** Establish Transit Gateway Connect (GRE + BGP) attachments directly to each Palo Alto VM-Series NGFW instance and disable ECMP routing.
- **C.** Deploy the Palo Alto NGFWs behind a Network Load Balancer (NLB) in the Inspection VPC and disable Appliance Mode on the Transit Gateway attachment.
- **D.** Deploy the Palo Alto NGFW Auto Scaling group behind a Gateway Load Balancer (GWLB) in a centralized Inspection VPC, place Gateway Load Balancer Endpoints (GWLBe) in dedicated subnets, and enable Appliance Mode on the Inspection VPC's Transit Gateway attachment.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức ngân hàng bắt buộc toàn bộ lưu lượng East-West (VPC-tới-VPC) và North-South (hướng ra internet) trên 40 AWS VPC gắn với một AWS Transit Gateway phải được kiểm tra minh bạch bởi một cụm có khả năng mở rộng theo chiều ngang gồm các thiết bị tường lửa thế hệ mới (NGFW) Palo Alto Networks VM-Series của bên thứ ba chạy trên EC2. Nhóm bảo mật phải tránh các vấn đề định tuyến bất đối xứng có trạng thái qua các Availability Zone và loại bỏ các đường hầm IPsec/BGP thủ công giữa Transit Gateway và các thiết bị tường lửa. Solutions Architect nên triển khai kiến trúc nào?

**Đáp án đúng:** **D**

Kiến trúc chuẩn cho **Third-Party NGFW Inspection tập trung** là: **Transit Gateway (bật Appliance Mode)** -> **Inspection VPC** -> **GWLB Endpoints (GWLBe)** -> **Gateway Load Balancer (GENEVE)** -> **Auto Scaling Group NGFW**.

- **A:** AWS WAF không thể gắn vào Transit Gateway và đề bài yêu cầu rõ ràng sử dụng cụm tường lửa bên thứ ba Palo Alto Networks NGFW.
- **B:** Transit Gateway Connect dùng BGP/GRE thủ công không tự động scale theo Auto Scaling group mượt mà như GWLB và đi ngược lại yêu cầu loại bỏ quản lý tunnel BGP thủ công tới firewall.
- **C:** NLB không hỗ trợ định tuyến trong suốt Layer 3 (bump-in-the-wire) với đóng gói GENEVE cho firewall appliances như GWLB, và tắt Appliance Mode sẽ gây lỗi đứt kết nối do asymmetric routing qua 2 AZ khác nhau.
- **D (Đúng):** Chính xác. Gateway Load Balancer (GWLB) kết hợp giao thức GENEVE (port 6081) cho phép chèn cụm tường lửa bên thứ ba (Palo Alto NGFW) dạng bump-in-the-wire tự động scale mà không cần IPsec/BGP. Đặc biệt, bật Appliance Mode trên Transit Gateway attachment của Inspection VPC là bắt buộc để đảm bảo lưu lượng đi và về luôn đi qua cùng một AZ, tránh lỗi stateful asymmetric routing.

</details>

### Câu 19 `hard`

A healthcare company routes outbound internet traffic from 35 production VPCs through a centralized Egress VPC attached to an AWS Transit Gateway. Compliance requires blocking all outbound HTTPS connections except to an allowlist of 20 approved partner FQDNs (such as api.partner-health.com), without terminating or decrypting TLS traffic, and without managing EC2-based proxy instances. Which AWS networking architecture satisfies these requirements?

- **A.** Configure VPC Security Groups on all EC2 instances in the 35 spoke VPCs with stateful outbound rules referencing the 20 partner FQDN domain names.
- **B.** Attach an AWS WAF Web ACL with domain allowlist rules to the NAT Gateways in the Egress VPC to inspect and filter outbound HTTPS TLS SNI headers.
- **C.** Deploy AWS Network Firewall in the Egress VPC with a stateful domain list allowing the 20 FQDNs (TLS SNI) and default drop, before NAT Gateways.
- **D.** Configure stateless Network ACLs on the Egress VPC public subnets to allow outbound HTTPS traffic only to the 20 approved partner domain names.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty chăm sóc sức khỏe định tuyến lưu lượng internet đi ra từ 35 VPC production thông qua một Egress VPC tập trung gắn với AWS Transit Gateway. Quy định tuân thủ yêu cầu chặn tất cả các kết nối HTTPS đi ra ngoại trừ danh sách cho phép gồm 20 FQDN đối tác đã được phê duyệt (như api.partner-health.com), mà không cần chấm dứt hay giải mã lưu lượng TLS và không cần quản lý các proxy instance trên EC2. Kiến trúc mạng AWS nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **C**

Để lọc tên miền **FQDN chiều đi ra (egress filtering)** tập trung cho hàng chục VPC mà **không quản lý EC2 proxy**, **AWS Network Firewall** với **Stateful Domain List** (đọc **TLS SNI**) đặt trong Centralized Egress VPC giữa Transit Gateway và NAT Gateway là giải pháp chuẩn mực.

- **A:** Security Groups chỉ hỗ trợ địa chỉ IP/CIDR, Prefix List hoặc Security Group ID khác — hoàn toàn không hỗ trợ nhập trực tiếp tên miền FQDN.
- **B:** AWS WAF chỉ bảo vệ lưu lượng HTTP/HTTPS đi vào (inbound) cho CloudFront, ALB, API Gateway, AppSync, Cognito, Verified Access — không thể gắn lên NAT Gateway để lọc lưu lượng đi ra (outbound egress).
- **C (Đúng):** Chính xác. AWS Network Firewall là dịch vụ tường lửa mạng được quản lý hoàn toàn (không cần quản lý EC2 proxy), hỗ trợ lọc tên miền FQDN ở tầng Stateful Domain List bằng cách kiểm tra trường TLS SNI (Server Name Indication) mà không bắt buộc phải giải mã TLS, đặt giữa Transit Gateway và NAT Gateway trong Egress VPC.
- **D:** Network ACLs là tường lửa phi trạng thái ở tầng Layer 3/4 chỉ lọc theo dải IP/port, không hiểu tên miền FQDN hay TLS SNI.

</details>

### Câu 20 `hard`

A financial firm has two 10 Gbps AWS Direct Connect dedicated connections (DX-Primary in Location A and DX-Secondary in Location B) connected to the same Direct Connect Gateway and AWS Transit Gateway. Both connections advertise the exact same on-premises CIDR block (192.168.0.0/16) via BGP. Due to lower leased-line costs on DX-Primary, the network team wants 100% of AWS-to-on-premises traffic to prefer DX-Primary under normal conditions and automatically fail over to DX-Secondary only if DX-Primary goes down. Which BGP configuration on the customer's on-premises routers achieves deterministic Active/Passive routing from AWS to on-premises?

- **A.** Enable Equal Cost Multi-Path (ECMP) on the AWS Transit Gateway, which forces 100% of outbound traffic onto DX-Primary.
- **B.** Advertise a more specific /24 prefix on DX-Secondary and a summary /16 prefix on DX-Primary over both BGP sessions.
- **C.** Advertise 192.168.0.0/16 on DX-Primary with BGP community 7224:7300 (High local pref) and DX-Secondary with 7224:7100, or prepend AS_PATH on DX-Secondary.
- **D.** Configure a lower BGP MED (Multi-Exit Discriminator) value on DX-Primary than on DX-Secondary without changing Local Preference or AS_PATH, even though both connections use different ASNs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty tài chính có hai kết nối chuyên dụng AWS Direct Connect 10 Gbps (DX-Primary tại Location A và DX-Secondary tại Location B) kết nối tới cùng một Direct Connect Gateway và AWS Transit Gateway. Cả hai kết nối đều quảng bá cùng một dải CIDR on-premises (192.168.0.0/16) qua BGP. Do chi phí đường truyền thuê riêng trên DX-Primary thấp hơn, nhóm mạng muốn 100% lưu lượng từ AWS về on-premises ưu tiên DX-Primary trong điều kiện bình thường và chỉ tự động chuyển sang DX-Secondary nếu DX-Primary bị sập. Cấu hình BGP nào trên các router on-premises của khách hàng đạt được định tuyến Active/Passive tất định từ AWS về on-premises?

**Đáp án đúng:** **C**

Nhớ thứ tự chọn đường **BGP từ AWS về on-premises trên Direct Connect**: (1) **Longest Prefix Match**, (2) **Local Preference Community Tags** (`7224:7300` High > `7224:7200` Med > `7224:7100` Low), (3) **Shortest AS_PATH** (dùng AS_PATH prepending trên đường dự phòng), (4) **MED**.

- **A:** ECMP (Equal-Cost Multi-Path) dùng để chia tải song song (Active/Active) đều trên cả hai đường truyền, ngược lại hoàn toàn với yêu cầu Active/Passive.
- **B:** Longest Prefix Match luôn có độ ưu tiên cao nhất trong BGP; quảng bá /24 trên DX-Secondary sẽ khiến toàn bộ lưu lượng đổ sang DX-Secondary thay vì DX-Primary.
- **C (Đúng):** Chính xác. Trong thứ tự ưu tiên chọn đường BGP của AWS Direct Connect (cho lưu lượng từ AWS về on-premises): Longest Prefix Match -> Local Preference BGP Community Tags (7224:7300 High > 7224:7200 Medium > 7224:7100 Low) -> Shortest AS_PATH (AS_PATH prepending trên nhánh phụ DX-Secondary). Dùng Local Preference tags hoặc AS_PATH prepending giúp định tuyến Active/Passive chính xác tuyệt đối.
- **D:** BGP MED chỉ được đánh giá sau Local Preference và AS_PATH, và theo mặc định chỉ so sánh được khi các route đến từ CÙNG một Neighbor ASN. Cách tin cậy và chuẩn AWS nhất cho Active/Passive là BGP Local Preference community tags (7224:7300 vs 7224:7100) hoặc AS_PATH prepending.

</details>

### Câu 21 `medium`

A compliance auditor asks a cloud security team to mathematically prove—without sending live test packets—that NO EC2 instance tagged Tier=PCI across 45 AWS accounts in AWS Organizations has any unintended network path to an Internet Gateway, and to troubleshoot why a specific database subnet in Account A cannot reach an API subnet in Account B through a Transit Gateway. Which pair of native AWS VPC diagnostic tools should the team use?

- **A.** Enable VPC Traffic Mirroring on all EC2 instances across 45 accounts and run tcpdump to prove no internet paths exist.
- **B.** Use VPC Network Access Analyzer (Org-wide) to verify zero paths from PCI instances to IGWs, and VPC Reachability Analyzer to diagnose the Account A-B hop.
- **C.** Run AWS Systems Manager Automation ICMP ping tests from every Tier=PCI EC2 instance to 8.8.8.8 and between Account A and Account B subnets.
- **D.** Query VPC Flow Logs across all 45 accounts in Amazon Athena to mathematically prove that no network path to an Internet Gateway exists.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiểm toán viên tuân thủ yêu cầu nhóm bảo mật đám mây chứng minh về mặt toán học—mà không gửi gói tin kiểm thử trực tiếp—rằng KHÔNG có EC2 instance nào được gắn thẻ Tier=PCI trên 45 AWS account trong AWS Organizations có bất kỳ đường dẫn mạng ngoài ý muốn nào tới Internet Gateway, đồng thời khắc phục sự cố tại sao một database subnet cụ thể ở Account A không thể kết nối tới một API subnet ở Account B qua Transit Gateway. Nhóm nên sử dụng cặp công cụ chẩn đoán AWS VPC nguyên bản nào?

**Đáp án đúng:** **B**

Phân biệt hai công cụ phân tích mạng tĩnh (automated reasoning) của VPC: **VPC Network Access Analyzer** (kiểm toán tuân thủ phạm vi rộng: tìm mọi đường mạng ngoài ý muốn tới IGW/NAT/TGW trên toàn Organization) và **VPC Reachability Analyzer** (gỡ lỗi điểm-tới-điểm giữa 2 ENI/Instance/Gateway xuyên tài khoản).

- **A:** VPC Traffic Mirroring bắt gói tin thực tế (tốn băng thông/chi phí lớn và chỉ thấy lưu lượng đang chạy, không thể chứng minh toán học rằng không tồn tại đường định tuyến ẩn).
- **B (Đúng):** Chính xác. VPC Network Access Analyzer phân tích tĩnh (automated reasoning, không gửi gói tin thật) ở quy mô toàn diện để chứng minh tuân thủ (ví dụ không có đường mạng nào từ tài nguyên nhạy cảm ra Internet Gateway). VPC Reachability Analyzer phân tích đường đi điểm-tới-điểm (source -> destination) xuyên tài khoản qua Transit Gateway để chỉ rõ chính xác Security Group, NACL hay Route Table nào đang chặn kết nối.
- **C:** Đề bài yêu cầu kiểm chứng KHÔNG gửi gói tin kiểm thử thực tế (without sending live test packets), và ping ICMP có thể bị chặn bởi SG dù cổng TCP 443 vẫn hở.
- **D:** VPC Flow Logs chỉ ghi lại lưu lượng mạng đã xảy ra; không có log ra Internet không chứng minh được cấu hình Route Table/SG/NACL không có lỗ hổng đường đi ra Internet.

</details>

### Câu 22 `hard`

A stock exchange is connecting its two geographically diverse on-premises data centers to AWS for a mission-critical order-routing workload that requires the highest possible AWS Direct Connect SLA (99.99% Maximum Resiliency) and sub-second failure detection if a physical fiber cut or router interface failure occurs. Which TWO networking practices should the Solutions Architect implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Provision four dedicated Direct Connect connections: two in DX Location A (separate AWS devices and customer routers) and two in DX Location B.
- **B.** Use a single Direct Connect connection backed by an AWS Site-to-Site VPN over the public internet to meet the 99.99% Direct Connect SLA.
- **C.** Increase the BGP Keepalive timer to 60 seconds and Hold timer to 180 seconds on all Virtual Interfaces to accelerate failover.
- **D.** Provision two Direct Connect connections in the same Direct Connect Location terminated on the same customer router to achieve the 99.99% Maximum Resiliency SLA.
- **E.** Enable Bidirectional Forwarding Detection (BFD) on all BGP sessions over the Direct Connect VIFs for sub-second link failure detection.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một sở giao dịch chứng khoán đang kết nối hai trung tâm dữ liệu on-premises phân tán về mặt địa lý tới AWS cho một workload định tuyến lệnh quan trọng yêu cầu mức SLA AWS Direct Connect cao nhất có thể (99,99% Maximum Resiliency) và phát hiện lỗi dưới một giây nếu xảy ra đứt cáp quang vật lý hoặc lỗi giao diện router. Solutions Architect nên triển khai HAI thực hành mạng nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, E**

Để đạt mức dự phòng cao nhất cho **AWS Direct Connect**: áp dụng mô hình **Maximum Resiliency (SLA 99.99%)** với **4 kết nối trên 2 DX Locations & 2 cặp router độc lập**, đồng thời bật **BFD (Bidirectional Forwarding Detection)** trên BGP để phát hiện đứt cáp dưới 1 giây.

- **A (Đúng):** Chính xác. Mô hình Maximum Resiliency của AWS Direct Connect (đạt SLA 99.99%) yêu cầu tối thiểu 4 kết nối vật lý độc lập phân bổ trên ít nhất 2 Direct Connect Locations khác nhau và 2 bộ thiết bị/router riêng biệt tại mỗi điểm, chống cả lỗi thiết bị lẫn sập toàn bộ một DX Location.
- **B:** 1 Direct Connect + 1 Site-to-Site VPN là mô hình Development/Test hoặc chi phí thấp, không đủ điều kiện nhận SLA 99.99% của AWS Direct Connect (vốn đòi hỏi >= 4 kết nối ở >= 2 DX Locations).
- **C:** Tăng BGP Keepalive/Hold timer lên 180 giây sẽ làm chậm thời gian phát hiện sự cố gấp đôi thay vì đạt sub-second failover.
- **D:** Hai kết nối ở cùng 1 DX Location và cùng 1 router khách hàng vẫn có điểm lỗi đơn (SPOF) ở cả router lẫn vị trí địa lý, không đạt chuẩn Maximum Resiliency SLA 99.99%.
- **E (Đúng):** Chính xác. Mặc định BGP hold timer mất tới 90 giây để phát hiện đứt kết nối tầng quang ẩn (silent fiber cut). Bật BFD (Bidirectional Forwarding Detection) trên các phiên BGP của Direct Connect VIF giúp phát hiện lỗi và hội tụ định tuyến dưới 1 giây (mặc định 300ms x 3 = 900ms).

</details>

### Câu 23 `medium`

A data engineering team runs Apache Spark jobs on Amazon EMR inside private subnets across 3 Availability Zones in us-east-1. Each month, the jobs read and write 500 TB of Parquet files in Amazon S3 (in us-east-1) and pull 20 TB of container images from Amazon ECR. Reviewing the AWS Cost and Usage Report (CUR), the FinOps lead discovers over $23,000 per month in NAT Gateway data processing charges ($0.045/GB). How can the team eliminate these NAT Gateway data processing costs with minimal architectural changes?

- **A.** Create a free S3 Gateway VPC Endpoint on private route tables for S3 traffic, and Interface VPC Endpoints for ECR (ecr.api and ecr.dkr).
- **B.** Move the Amazon EMR Spark cluster into public subnets with Elastic IP addresses so S3 and ECR traffic routes directly through the Internet Gateway.
- **C.** Replace the 3 regional NAT Gateways with a single NAT Gateway in one Availability Zone to reduce data processing fees.
- **D.** Create an S3 Interface VPC Endpoint (AWS PrivateLink) instead of an S3 Gateway VPC Endpoint for the 500 TB Apache Spark EMR traffic.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ sư dữ liệu chạy các tác vụ Apache Spark trên Amazon EMR bên trong các private subnet trên 3 Availability Zone tại us-east-1. Mỗi tháng, các tác vụ đọc và ghi 500 TB tệp Parquet trong Amazon S3 (tại us-east-1) và kéo 20 TB container image từ Amazon ECR. Khi xem xét AWS Cost and Usage Report (CUR), trưởng nhóm FinOps phát hiện hơn 23.000 USD mỗi tháng phí xử lý dữ liệu NAT Gateway (0,045 USD/GB). Nhóm có thể loại bỏ các chi phí xử lý dữ liệu NAT Gateway này với mức thay đổi kiến trúc tối thiểu bằng cách nào?

**Đáp án đúng:** **A**

Một bẫy FinOps cực kỳ phổ biến trên AWS: **500 TB lưu lượng S3 đi qua NAT Gateway** tốn $0.045/GB. Luôn dùng **S3 (và DynamoDB) Gateway VPC Endpoint (MIỄN PHÍ)** cho lưu lượng từ trong VPC; chỉ dùng **S3 Interface Endpoint** khi cần truy cập S3 qua PrivateLink từ **on-premises hoặc VPC peering/TGW khác**.

- **A (Đúng):** Chính xác. S3 Gateway VPC Endpoint hoàn toàn MIỄN PHÍ (không phí theo giờ, không phí xử lý dữ liệu), giúp xóa sổ ngay $22,500/tháng tiền NAT Gateway cho 500 TB dữ liệu S3. Kết hợp Interface VPC Endpoints cho ECR (ecr.api và ecr.dkr) có phí xử lý dữ liệu ($0.01/GB) rẻ hơn nhiều so với NAT Gateway ($0.045/GB) và giữ toàn bộ lưu lượng nội bộ trong mạng AWS.
- **B:** Đưa cụm EMR dữ liệu nhạy cảm ra public subnet với public IP làm tăng rủi ro bảo mật nghiêm trọng và hoàn toàn không cần thiết khi đã có S3 Gateway Endpoint miễn phí.
- **C:** Dùng 1 NAT Gateway vẫn phải trả nguyên $0.045/GB phí xử lý dữ liệu cho 520 TB (~$23,400/tháng), đồng thời phát sinh thêm phí cross-AZ data transfer ($0.02/GB) và tạo điểm lỗi đơn (SPOF).
- **D:** S3 Interface VPC Endpoint tính phí theo giờ và phí xử lý dữ liệu ($0.01/GB -> vẫn tốn ~$5,000/tháng cho 500 TB), trong khi S3 Gateway VPC Endpoint hoàn toàn miễn phí cho lưu lượng nội bộ trong cùng VPC.

</details>

### Câu 24 `hard`

A global enterprise manages 45 AWS accounts in AWS Organizations. All spoke VPCs are connected to a centralized AWS Transit Gateway in a Network account. The security team deploys AWS Network Firewall in a dedicated Inspection VPC across two Availability Zones to inspect all east-west traffic between spoke VPCs. After enabling inspection, engineers report intermittent TCP connection drops between applications in different spoke VPCs. What is the MOST likely cause and resolution?

- **A.** AWS Network Firewall does not support stateful inspection for east-west traffic; replace it with VPC Network ACLs.
- **B.** The Transit Gateway is exceeding its per-attachment bandwidth limit; enable Equal Cost Multi-Path (ECMP) routing on the Inspection VPC attachment.
- **C.** The Transit Gateway route tables are missing static return routes; add a 0.0.0.0/0 route in the Inspection VPC route table pointing back to the spoke VPCs.
- **D.** Asymmetric routing is occurring across Availability Zones; enable Appliance Mode on the Transit Gateway VPC attachment for the Inspection VPC.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp toàn cầu quản lý 45 AWS account trong AWS Organizations. Tất cả các spoke VPC đều được kết nối tới một AWS Transit Gateway tập trung trong Network account. Nhóm bảo mật triển khai AWS Network Firewall trong một Inspection VPC chuyên dụng trên hai Availability Zone để kiểm tra toàn bộ lưu lượng east-west giữa các spoke VPC. Sau khi bật kiểm tra, các kỹ sư báo cáo tình trạng rớt kết nối TCP gián đoạn giữa các ứng dụng ở các spoke VPC khác nhau. Nguyên nhân có khả năng CAO NHẤT và cách khắc phục là gì?

**Đáp án đúng:** **D**

Khi triển khai các thiết bị mạng stateful (AWS Network Firewall, Gateway Load Balancer) trong Inspection VPC sau AWS Transit Gateway, bắt buộc phải bật **Appliance Mode** trên TGW attachment của Inspection VPC để đảm bảo traffic hai chiều (symmetric routing) đi qua cùng một firewall endpoint.

- **A:** AWS Network Firewall hỗ trợ đầy đủ cả stateless và stateful inspection cho east-west và north-south traffic. Network ACLs là stateless và không thể thay thế firewall L4/L7 tập trung.
- **B:** ECMP trên Transit Gateway dùng cho các kết nối VPN để gộp băng thông, không áp dụng cho VPC attachment và không giải quyết vấn đề asymmetric routing.
- **C:** Nếu thiếu route trả về hoàn toàn, kết nối sẽ thất bại 100% thay vì bị drop chập chờn (intermittent). Hơn nữa, trong Inspection VPC cần route cụ thể cho từng CIDR spoke chứ không dùng 0.0.0.0/0 quay lại spoke.
- **D (Đúng):** Chính xác. Mặc định Transit Gateway giữ traffic trong cùng một AZ nguồn, nên luồng đi (AZ-a) và luồng về (AZ-b) có thể đi qua hai stateful Network Firewall endpoints khác nhau gây drop gói tin. Bật Appliance Mode trên TGW attachment của Inspection VPC đảm bảo symmetric routing qua cùng một AZ.

</details>

### Câu 25 `hard`

An enterprise has an on-premises data center with two 1 Gbps AWS Direct Connect connections to us-east-1. The company needs private connectivity from on-premises to 25 VPCs across us-east-1, eu-west-1, and ap-southeast-1. Additionally, security regulations require all data in transit over the Direct Connect links to be encrypted end-to-end. Which solution meets these requirements?

- **A.** Create a Direct Connect Gateway with a Transit VIF connected to Transit Gateways in all three Regions, and establish AWS Site-to-Site VPN tunnels over a Direct Connect Public VIF to encrypt traffic.
- **B.** Configure AWS PrivateLink Interface VPC Endpoints across all three Regions and route all on-premises corporate traffic directly over a single Direct Connect Private VIF.
- **C.** Create 25 separate Private VIFs on the Direct Connect connections and attach one Private VIF to each Virtual Private Gateway across all three Regions without using Transit Gateway or VPN.
- **D.** Enable MACsec encryption on the 1 Gbps Direct Connect connections and attach a dedicated Private VIF directly to an AWS Transit Gateway in each of the three AWS Regions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp có trung tâm dữ liệu on-premises với hai kết nối AWS Direct Connect 1 Gbps tới us-east-1. Công ty cần kết nối riêng tư từ on-premises tới 25 VPC trên khắp us-east-1, eu-west-1 và ap-southeast-1. Ngoài ra, các quy định bảo mật yêu cầu toàn bộ dữ liệu truyền qua các đường kết nối Direct Connect phải được mã hóa đầu cuối (end-to-end). Giải pháp nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **A**

Với cổng Direct Connect 1 Gbps cần mã hóa end-to-end (không dùng được MACsec), kiến trúc chuẩn là chạy **AWS Site-to-Site VPN (IPsec)** đè lên **Direct Connect Public VIF** (hoặc Transit VIF) kết hợp **Direct Connect Gateway** và **Transit Gateways** ở các Region.

- **A (Đúng):** Chính xác. Direct Connect Gateway + Transit VIF cho phép kết nối đa Region tới các Transit Gateways; đồng thời chạy IPsec Site-to-Site VPN trên Direct Connect Public VIF (hoặc Transit VIF + IPsec) cung cấp mã hóa end-to-end cho đường truyền 1 Gbps.
- **B:** PrivateLink dùng để expose một dịch vụ cụ thể qua NLB chứ không phải giải pháp định tuyến mạng toàn diện giữa on-premises và 25 VPC đa vùng, đồng thời Private VIF không tự mã hóa.
- **C:** Tạo 25 Private VIF tốn công quản trị và Direct Connect mặc định KHÔNG mã hóa dữ liệu trên đường truyền, vi phạm yêu cầu bảo mật.
- **D:** Hai điểm sai: MACsec chỉ hỗ trợ trên cổng Dedicated Connection 10 Gbps và 100 Gbps (không hỗ trợ 1 Gbps), và không thể gắn Private VIF trực tiếp vào Transit Gateway (phải dùng Transit VIF qua Direct Connect Gateway).

</details>

### Câu 26 `hard`

A SaaS provider hosts a multi-tenant analytics service in its Provider VPC (10.0.0.0/16). Hundreds of enterprise customers want to consume this service privately from their own AWS VPCs without traversing the public internet. Many customers have overlapping CIDR blocks (10.0.0.0/16) with the Provider VPC, and connections must only be initiated from customers to the SaaS provider. Which TWO architectural components should the SaaS provider configure? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Configure a Transit Gateway and share it with all customer AWS accounts via AWS RAM.
- **B.** Create VPC Peering connections with each customer VPC and configure NAT instances to resolve overlapping CIDR blocks.
- **C.** Expose the service through an Application Load Balancer directly attached to a Gateway VPC Endpoint.
- **D.** Instruct customers to create Interface VPC Endpoints in their VPCs pointing to the VPC Endpoint Service name.
- **E.** Place the analytics service behind a Network Load Balancer (NLB) and create a VPC Endpoint Service powered by AWS PrivateLink.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà cung cấp SaaS lưu trữ dịch vụ phân tích đa thuê bao (multi-tenant) trong Provider VPC (10.0.0.0/16) của mình. Hàng trăm khách hàng doanh nghiệp muốn sử dụng dịch vụ này một cách riêng tư từ VPC AWS của chính họ mà không đi qua internet công cộng. Nhiều khách hàng có dải CIDR trùng lặp (10.0.0.0/16) với Provider VPC, và các kết nối chỉ được phép khởi tạo từ phía khách hàng tới nhà cung cấp SaaS. Nhà cung cấp SaaS nên cấu hình HAI thành phần kiến trúc nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **D, E**

**AWS PrivateLink** (NLB + VPC Endpoint Service phía nhà cung cấp, kết hợp Interface VPC Endpoint phía khách hàng) là kiến trúc chuẩn cho nhà cung cấp SaaS: hỗ trợ hàng nghìn khách hàng, chấp nhận trùng lặp CIDR hoàn toàn, traffic đi hoàn toàn trong mạng nội bộ AWS và chỉ cho phép khởi tạo kết nối một chiều từ khách hàng.

- **A:** Transit Gateway không hỗ trợ định tuyến giữa các VPC có dải CIDR trùng nhau (10.0.0.0/16) và mở kết nối mạng hai chiều thay vì chỉ một chiều từ khách hàng.
- **B:** VPC Peering không hỗ trợ CIDR trùng nhau một cách trực tiếp và hoàn toàn không thể mở rộng cho hàng trăm khách hàng SaaS.
- **C:** Gateway VPC Endpoint chỉ dành cho Amazon S3 và DynamoDB. PrivateLink VPC Endpoint Service không gắn trực tiếp vào ALB mà cần NLB.
- **D (Đúng):** Chính xác. Khách hàng tạo Interface VPC Endpoint trong VPC của họ để kết nối một chiều (unidirectional) tới VPC Endpoint Service mà không lo trùng CIDR.
- **E (Đúng):** Chính xác. AWS PrivateLink yêu cầu đặt dịch vụ phía sau Network Load Balancer (hoặc Gateway Load Balancer) và expose thông qua VPC Endpoint Service.

</details>

### Câu 27 `hard`

A data analytics company runs hundreds of batch processing workloads on EC2 instances inside private subnets across 10 AWS accounts. Reviewing the AWS Cost and Usage Report (CUR), the FinOps team discovers $18,000 per month in NAT Gateway Data Processing charges caused by EC2 instances downloading massive Parquet files from Amazon S3 in the same Region and querying Amazon DynamoDB. How can the company eliminate these NAT Gateway charges with the LEAST effort and cost?

- **A.** Create Interface VPC Endpoints (AWS PrivateLink) for Amazon S3 and Amazon DynamoDB in every private subnet across all 10 AWS accounts.
- **B.** Create Gateway VPC Endpoints for Amazon S3 and Amazon DynamoDB and associate them with the private subnet route tables.
- **C.** Replace the managed AWS NAT Gateways with self-managed t3.micro NAT instances running in public subnets to reduce hourly processing fees.
- **D.** Assign Elastic IP addresses to all batch processing EC2 instances and route Amazon S3 and DynamoDB traffic directly through an Internet Gateway.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty phân tích dữ liệu chạy hàng trăm workload xử lý theo lô trên các EC2 instance bên trong private subnet thuộc 10 AWS account. Khi xem xét AWS Cost and Usage Report (CUR), nhóm FinOps phát hiện chi phí xử lý dữ liệu NAT Gateway lên tới 18.000 USD mỗi tháng do các EC2 instance tải các tệp Parquet khổng lồ từ Amazon S3 trong cùng Region và truy vấn Amazon DynamoDB. Công ty có thể loại bỏ các khoản phí NAT Gateway này với ít công sức và chi phí NHẤT bằng cách nào?

**Đáp án đúng:** **B**

Một quy tắc tối ưu chi phí (FinOps) kinh điển của SAP-C02: luôn cấu hình **Gateway VPC Endpoints** (hoàn toàn miễn phí) cho **Amazon S3** và **Amazon DynamoDB** trong Private Subnets để loại bỏ hoàn toàn phí NAT Gateway Data Processing ($0.045/GB).

- **A:** Interface VPC Endpoints tính phí theo giờ cho mỗi AZ và phí xử lý dữ liệu theo GB ($0.01/GB), tốn kém hơn nhiều so với Gateway VPC Endpoints (miễn phí).
- **B (Đúng):** Chính xác. Gateway VPC Endpoints cho S3 và DynamoDB hoàn toàn MIỄN PHÍ (không phí giờ, không phí xử lý dữ liệu), tự động định tuyến traffic từ Private Subnet đi thẳng vào S3/DynamoDB mà không qua NAT Gateway.
- **C:** NAT instance t3.micro bị giới hạn băng thông cực thấp (gây nghẽn cổ chai cho batch job đọc Parquet lớn), tạo điểm lỗi đơn (SPOF) và tăng gánh nặng vận hành.
- **D:** Gán Public/Elastic IP cho hàng trăm EC2 xử lý dữ liệu trong Private Subnet phá vỡ bảo mật mạng và tốn thêm phí Public IPv4.

</details>

---

[Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md)
