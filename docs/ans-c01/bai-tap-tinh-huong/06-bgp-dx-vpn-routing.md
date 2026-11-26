# Bài tập tình huống — Định tuyến Hybrid BGP, Direct Connect VIFs/DXGW & Site-to-Site VPN ECMP

> Thuật toán BGP Path Selection (LocalPref, AS_PATH, MED, BFD, BGP Communities), Private/Public/Transit VIF, Direct Connect Gateway và VPN ECMP.
> **Số câu hỏi:** 16 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A company has two AWS Direct Connect connections (DX-Primary and DX-Backup) terminating at different Direct Connect locations, both attached to a Direct Connect Gateway (DXGW). They want DX-Primary to handle all outbound traffic from AWS to on-premises, and also ensure all inbound traffic from on-premises prefers DX-Primary over DX-Backup. Which TWO BGP configurations achieve this deterministic active/passive routing?

*(Chọn 2 đáp án)*

- **A.** Configure a higher BGP Local Preference on the on-premises router for routes received over DX-Primary compared to DX-Backup.
- **B.** Configure a higher BGP MED (Multi-Exit Discriminator) value on routes advertised over DX-Primary from the on-premises edge router to AWS.
- **C.** Prepend the AWS ASN multiple times on the on-premises BGP router for DX-Primary to prefer DX-Primary over DX-Backup.
- **D.** Apply High Preference BGP community (7224:7300) on routes advertised over DX-Primary, and Low Preference (7224:7100) on DX-Backup.
- **E.** Disable BGP Equal-Cost Multi-Path (ECMP) routing on the Direct Connect Gateway to force active/passive failover.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có hai kết nối AWS Direct Connect (DX-Primary và DX-Backup) kết cuối tại các vị trí Direct Connect khác nhau, cả hai đều gắn vào một Direct Connect Gateway (DXGW). Họ muốn DX-Primary xử lý toàn bộ lưu lượng đi ra từ AWS về tại chỗ, đồng thời đảm bảo mọi lưu lượng đi vào từ tại chỗ ưu tiên DX-Primary hơn DX-Backup. HAI cấu hình BGP nào đạt được định tuyến active/passive mang tính xác định này?

**Đáp án đúng:** **A, D**

Để điều khiển BGP Active/Passive hai chiều trên Direct Connect: chiều AWS -> On-prem dùng BGP Local Preference communities (7224:7300 vs 7224:7100); chiều On-prem -> AWS chỉnh Local Preference trên router on-premises.

- **A (Đúng):** Chính xác. Trên router on-premises, tăng Local Preference (thuộc tính ưu tiên cao nhất trong BGP path selection) cho prefix nhận từ DX-Primary sẽ ép traffic từ on-premises đi lên AWS qua DX-Primary.
- **B:** Sai. MED thấp hơn mới được ưu tiên hơn, và MED chỉ so sánh khi hai đường đến từ cùng một AS.
- **C:** Sai. AS_PATH càng dài thì càng ít được ưu tiên; để làm DX-Primary thành active phải prepend trên DX-Backup chứ không phải DX-Primary.
- **D (Đúng):** Chính xác. AWS Direct Connect hỗ trợ BGP Local Preference communities (7224:7300 High > 7224:7200 Medium > 7224:7100 Low) để điều khiển hướng outbound từ AWS về on-premises.
- **E:** Không có cấu hình tắt ECMP trực tiếp kiểu này để chọn đích active/passive cố định; phải dùng BGP attributes/communities.

</details>

### Câu 2 `medium`

A network engineer wants to use a single 10 Gbps AWS Direct Connect connection to access Amazon S3 public endpoints using a Public VIF, while simultaneously connecting to 12 VPCs via a Transit Gateway using a Transit VIF. Which statement is true regarding the Direct Connect Gateway (DXGW) configuration?

- **A.** Both the Public VIF and Transit VIF must be attached to the exact same Direct Connect Gateway to share a single 10 Gbps port.
- **B.** The Transit VIF attaches to the DXGW (associated with the TGW), while the Public VIF terminates directly on the AWS Direct Connect router.
- **C.** The Transit VIF can route Amazon S3 public endpoint traffic through the Transit Gateway without needing a separate Public VIF.
- **D.** A Transit Gateway cannot be associated with a Direct Connect Gateway if a Public VIF exists on the same physical Direct Connect connection.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư mạng muốn sử dụng một kết nối AWS Direct Connect 10 Gbps duy nhất để truy cập các endpoint công cộng của Amazon S3 bằng Public VIF, đồng thời kết nối đến 12 VPC qua Transit Gateway bằng Transit VIF. Phát biểu nào đúng liên quan đến cấu hình Direct Connect Gateway (DXGW)?

**Đáp án đúng:** **B**

Trên cùng một kết nối Direct Connect vật lý, Public VIF kết nối trực tiếp tới public AWS services (không qua DXGW), còn Transit VIF gắn vào DXGW để nối tới Transit Gateway.

- **A:** Public VIF kết nối thẳng tới AWS Public IP space và không gắn vào Direct Connect Gateway.
- **B (Đúng):** Chính xác. Chỉ Private VIF và Transit VIF mới gắn vào Direct Connect Gateway; Public VIF không dùng DXGW.
- **C:** Transit VIF chỉ quảng bá các prefix riêng tư (VPC CIDRs), không quảng bá dải IP public của S3 (trừ khi đi vòng qua S3 Interface Endpoint trong VPC).
- **D:** Một kết nối vật lý Direct Connect có thể chạy đồng thời nhiều loại VIF (Public VIF, Private VIF, Transit VIF) miễn là trong giới hạn số lượng VIF.

</details>

### Câu 3 `hard`

An enterprise has two AWS Direct Connect connections (DX-A and DX-B) terminating at different locations and attached via Transit VIFs to a common Direct Connect Gateway. Both connections advertise the same on-premises summary prefix 10.100.0.0/16 to AWS. The enterprise wants DX-A to be the active path for all traffic from AWS to on-premises, and DX-B to be used only if DX-A fails. However, due to BGP route selection behavior, AWS is currently load-balancing traffic across both connections. What is the MOST deterministic way to prefer DX-A over DX-B?

- **A.** Advertise a lower BGP Multi-Exit Discriminator (MED) value on DX-A than on DX-B across both Transit VIFs.
- **B.** Enable Equal-Cost Multi-Path (ECMP) on the Transit Gateway route table and weight DX-A higher than DX-B.
- **C.** Configure Bidirectional Forwarding Detection (BFD) with a shorter detection interval on DX-A than on DX-B.
- **D.** Attach the AWS BGP Local Preference community 7224:7300 (High) to routes advertised over DX-A and 7224:7100 (Low) to routes advertised over DX-B.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp có hai kết nối AWS Direct Connect (DX-A và DX-B) kết cuối tại các vị trí khác nhau và gắn qua Transit VIF vào một Direct Connect Gateway chung. Cả hai kết nối đều quảng bá cùng một tiền tố tóm tắt tại chỗ 10.100.0.0/16 tới AWS. Doanh nghiệp muốn DX-A là đường chủ động (active) cho mọi lưu lượng từ AWS về tại chỗ, và DX-B chỉ được dùng nếu DX-A gặp sự cố. Tuy nhiên, do hành vi chọn tuyến BGP, AWS hiện đang cân bằng tải lưu lượng qua cả hai kết nối. Cách mang tính xác định NHẤT để ưu tiên DX-A hơn DX-B là gì?

**Đáp án đúng:** **D**

Để điều khiển lưu lượng từ AWS đi về on-premises (outbound từ góc nhìn AWS), AWS Direct Connect hỗ trợ các BGP Local Preference Communities: 7224:7100 (Low), 7224:7200 (Medium), và 7224:7300 (High). Vì Local Preference đứng đầu bảng chọn đường BGP (sau Weight của Cisco), nó quyết định đường đi chính xác hơn MED hay AS_PATH prepending.

- **A:** MED chỉ được so sánh khi các route đến từ cùng một AS (và cùng điều kiện nhất định); trong khi đó AS_PATH prepending hoặc Local Preference BGP Community là cơ chế ưu tiên cao hơn và chuẩn xác hơn trên Direct Connect.
- **B:** ECMP sẽ cân bằng tải đồng thời qua nhiều đường thay vì ép lưu lượng đi qua DX-A làm active.
- **C:** BFD giúp phát hiện đứt gãy kết nối nhanh hơn (sub-second failover), không dùng để chọn đường active/passive trong BGP.
- **D (Đúng):** Chính xác. Trên Direct Connect, BGP Local Preference community (7224:7300 High, 7224:7200 Medium, 7224:7100 Low) được đánh giá trước cả AS_PATH length trong thuật toán chọn đường của BGP, giúp điều hướng lưu lượng từ AWS về on-premises một cách chính xác.

</details>

### Câu 4 `hard`

A company has two AWS Direct Connect connections with BGP sessions to a Transit Gateway via a Direct Connect Gateway. Currently, when a fiber cut occurs on the Layer 2 provider network between the customer router and the AWS Direct Connect endpoint, BGP takes up to 90 seconds (3x 30s hold timer) to tear down the session and fail over, causing unacceptable packet loss for VoIP traffic. How can the company reduce BGP failover detection time to under 1 second?

- **A.** Reduce the BGP keepalive timer to 1 second and hold-time to 3 seconds on the customer router and Transit VIF.
- **B.** Configure a Site-to-Site VPN backup with a static route and lower administrative distance for VoIP failover.
- **C.** Enable Link Aggregation Control Protocol (LACP) across both Direct Connect locations to detect physical fiber cuts in under 1 second.
- **D.** Enable BFD on the customer router and configure the Direct Connect VIF (BFD is automatically enabled on the AWS side).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có hai kết nối AWS Direct Connect với các phiên BGP đến một Transit Gateway qua Direct Connect Gateway. Hiện tại, khi xảy ra sự cố đứt cáp quang trên mạng của nhà cung cấp Layer 2 giữa router khách hàng và endpoint AWS Direct Connect, BGP mất tới 90 giây (3x bộ đếm giữ 30 giây) để ngắt phiên và chuyển đổi dự phòng, gây mất gói không thể chấp nhận được cho lưu lượng VoIP. Công ty có thể giảm thời gian phát hiện lỗi chuyển đổi BGP xuống dưới 1 giây bằng cách nào?

**Đáp án đúng:** **D**

Bidirectional Forwarding Detection (BFD) trên AWS Direct Connect được bật sẵn mặc định ở phía AWS (300ms minimum interval, multiplier 3). Khi bật BFD trên customer router, sự cố mất kết nối Layer 2 sẽ được phát hiện trong ~900ms (dưới 1 giây) để thu hồi route BGP ngay lập tức.

- **A:** Giảm BGP hold-time xuống 3 giây vẫn mất tới 3 giây để phát hiện lỗi (không đạt mức dưới 1 giây) và làm tăng tải CPU xử lý BGP control plane.
- **B:** Static route không tự động phát hiện lỗi Layer 2 ở phía xa nếu cổng vật lý trên router khách hàng vẫn up.
- **C:** LACP (LAG) chỉ gộp các link tại cùng một Direct Connect location, không chạy được giữa hai location khác nhau và không thay thế BFD cho BGP failover.
- **D (Đúng):** Chính xác. AWS Direct Connect hỗ trợ sẵn asynchronous BFD trên các VIF (với interval mặc định 300ms, multiplier 3 -> phát hiện lỗi trong 900ms, dưới 1 giây). Chỉ cần bật và cấu hình BFD tương ứng trên customer router.

</details>

### Câu 5 `hard`

A company has two AWS Site-to-Site VPN connections from an on-premises firewall to an AWS Transit Gateway in us-east-1. Each VPN connection has two tunnels, and BGP is configured on all four tunnels. The company wants to aggregate bandwidth across all four tunnels simultaneously for traffic between AWS and on-premises. Which configuration is required?

- **A.** Enable Direct Connect SiteLink on the Transit Gateway VPN attachments.
- **B.** Attach the two VPN connections to a Virtual Private Gateway (VGW) because VGW supports 4-tunnel ECMP bandwidth aggregation automatically.
- **C.** Enable ECMP on the Transit Gateway and advertise identical on-premises prefixes (same AS_PATH, MED, Local Pref) across all four tunnels.
- **D.** Configure a Link Aggregation Group (LAG) across the two AWS Site-to-Site VPN connections attached to the Transit Gateway.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có hai kết nối AWS Site-to-Site VPN từ tường lửa tại chỗ đến một AWS Transit Gateway tại us-east-1. Mỗi kết nối VPN có hai đường hầm (tunnel), và BGP được cấu hình trên cả bốn đường hầm. Công ty muốn gộp băng thông trên cả bốn đường hầm đồng thời cho lưu lượng giữa AWS và tại chỗ. Cần cấu hình gì?

**Đáp án đúng:** **C**

Khác với VGW (chỉ chạy active/passive), AWS Transit Gateway hỗ trợ ECMP để gộp băng thông nhiều Site-to-Site VPN tunnel (mỗi tunnel tối đa ~1.25 Gbps). Điều kiện là bật ECMP trên TGW và các đường BGP phải có thuộc tính bằng nhau.

- **A:** SiteLink chỉ áp dụng cho Direct Connect VIF, không áp dụng cho Site-to-Site VPN.
- **B:** Virtual Private Gateway (VGW) KHÔNG hỗ trợ ECMP trên nhiều VPN tunnel (chỉ dùng 1 tunnel active tại một thời điểm).
- **C (Đúng):** Chính xác. Để Transit Gateway chạy ECMP trên nhiều VPN tunnel, cần bật 'VPN ECMP support' trên TGW và đảm bảo các tuyến BGP quảng bá từ on-premises có cùng thuộc tính BGP (AS_PATH length, MED, LocalPref) để được xem là equal-cost paths.
- **D:** LAG là khái niệm Layer 2 dành cho Direct Connect, không áp dụng cho Site-to-Site VPN (Layer 3 IPsec).

</details>

### Câu 6 `hard`

An enterprise has two AWS Direct Connect connections in different locations using Public VIFs to access Amazon S3 and Amazon DynamoDB in us-east-1 without traversing the internet. The enterprise wants to ensure that only us-east-1 public AWS prefixes are received over BGP (excluding other Regions) and that on-premises traffic prefers the primary DX connection. Which TWO BGP configurations should the engineer apply? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Advertise RFC 1918 private prefixes (10.0.0.0/8) over both Public VIFs to AWS with community 7224:9100.
- **B.** Enable AWS Direct Connect SiteLink on both Public VIFs.
- **C.** Configure an inbound BGP prefix filter on the customer router using community 7224:9100 (or us-east-1 community) to accept only us-east-1 routes.
- **D.** Configure higher BGP Local Preference on the customer router for routes learned over the primary DX Public VIF to steer outbound on-premises traffic.
- **E.** Attach both Public VIFs directly to a Direct Connect Gateway to automatically filter out non-us-east-1 AWS public prefixes.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp có hai kết nối AWS Direct Connect ở các vị trí khác nhau sử dụng Public VIF để truy cập Amazon S3 và Amazon DynamoDB tại us-east-1 mà không đi qua internet. Doanh nghiệp muốn đảm bảo chỉ nhận các tiền tố AWS công cộng của us-east-1 qua BGP (loại trừ các Region khác) và lưu lượng tại chỗ ưu tiên kết nối DX chính. Kỹ sư nên áp dụng HAI cấu hình BGP nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, D**

Khi dùng Public VIF, AWS quảng bá hàng nghìn public prefix toàn cầu. Để lọc chỉ nhận prefix của một Region hoặc scope nhất định, cần lọc theo AWS BGP Communities (như 7224:9100/8100 hoặc Regional communities), đồng thời dùng Local Preference trên router khách hàng để chọn đường đi chính.

- **A:** Public VIF chỉ cho phép quảng bá các dải IP Public sở hữu hợp pháp bởi khách hàng, AWS sẽ từ chối RFC 1918 trên Public VIF.
- **B:** SiteLink không được hỗ trợ trên Public VIF.
- **C (Đúng):** Chính xác. Trên Public VIF, AWS gắn BGP Community theo từng Region (như 7224:9100 cho một số scope hoặc community mã Region cụ thể) để khách hàng lọc và chỉ nhận prefix của Region mong muốn.
- **D (Đúng):** Chính xác. Local Preference trên customer router quyết định đường đi outbound từ on-premises lên AWS qua kết nối DX chính.
- **E:** Public VIF không thể gắn vào Direct Connect Gateway (chỉ Private VIF và Transit VIF mới gắn vào DXGW).

</details>

### Câu 7 `hard`

An enterprise has two AWS Direct Connect connections (DX-Primary and DX-Secondary) connected to a Transit Gateway via a Direct Connect Gateway. On-premises routers advertise the same prefix 10.50.0.0/16 over both connections. The enterprise wants to use AS_PATH prepending to make DX-Primary preferred for AWS-to-on-premises traffic, and also wants to use MED as a tiebreaker. However, the engineer notices that AWS is still sending traffic over DX-Secondary. What is the MOST likely reason?

- **A.** BGP MED is evaluated before Local Preference and AS_PATH on AWS Direct Connect Transit VIFs by default.
- **B.** The on-premises router advertises a more specific prefix (e.g., 10.50.1.0/24) over DX-Secondary, which beats /16 regardless of AS_PATH/MED.
- **C.** AWS Direct Connect ignores AS_PATH length and always prefers the connection with the higher BGP router ID across both VIFs.
- **D.** Transit Gateway does not support BGP over Transit VIFs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp có hai kết nối AWS Direct Connect (DX-Primary và DX-Secondary) kết nối đến một Transit Gateway qua Direct Connect Gateway. Các router tại chỗ quảng bá cùng một tiền tố 10.50.0.0/16 qua cả hai kết nối. Doanh nghiệp muốn sử dụng AS_PATH prepending để làm cho DX-Primary được ưu tiên cho lưu lượng từ AWS về tại chỗ, và cũng muốn sử dụng MED làm tiêu chí phân định (tiebreaker). Tuy nhiên, kỹ sư nhận thấy AWS vẫn đang gửi lưu lượng qua DX-Secondary. Nguyên nhân khả dĩ NHẤT là gì?

**Đáp án đúng:** **B**

Quy tắc cơ bản nhưng rất hay gặp trong bài thi ANS-C01: Longest Prefix Match luôn thắng mọi thuộc tính BGP (kể cả Local Preference hay AS_PATH). Một prefix /24 quảng bá trên đường phụ sẽ luôn hút traffic khỏi prefix /16 trên đường chính.

- **A:** Trong BGP path selection, thứ tự ưu tiên là: Local Preference -> AS_PATH length -> Origin -> MED.
- **B (Đúng):** Chính xác. Trong định tuyến IP và BGP, quy tắc Longest Prefix Match (chọn prefix cụ thể hơn, /24 thắng /16) luôn được áp dụng trước khi xem xét bất kỳ thuộc tính BGP nào như Local Preference, AS_PATH hay MED.
- **C:** AWS Direct Connect có xét đến AS_PATH length (nếu Local Preference bằng nhau); Router ID chỉ là tie-breaker cuối cùng.
- **D:** Transit VIF chạy BGP với Direct Connect Gateway để trao đổi route cho Transit Gateway.

</details>

### Câu 8 `hard`

A company has a primary AWS Direct Connect connection and a backup AWS Site-to-Site VPN connection, both terminating on the same AWS Transit Gateway in us-east-1. Both connections advertise the same on-premises CIDR 172.16.0.0/16 via BGP. Which path will the Transit Gateway prefer for traffic destined to 172.16.0.0/16, and how can the company ensure the VPN is only used if the Direct Connect connection fails?

- **A.** The company must configure a static route in the Transit Gateway route table pointing to the VPN because BGP is not supported on TGW VPN attachments.
- **B.** Transit Gateway load-balances traffic 50/50 between Direct Connect and Site-to-Site VPN using ECMP for identical prefixes.
- **C.** Transit Gateway prefers Site-to-Site VPN by default unless AS_PATH prepending is applied on the VPN BGP sessions.
- **D.** Transit Gateway automatically prefers Direct Connect over Site-to-Site VPN for identical prefixes without extra BGP tuning.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có một kết nối AWS Direct Connect chính và một kết nối AWS Site-to-Site VPN dự phòng, cả hai đều kết cuối trên cùng một AWS Transit Gateway tại us-east-1. Cả hai kết nối đều quảng bá cùng một CIDR tại chỗ 172.16.0.0/16 qua BGP. Transit Gateway sẽ ưu tiên đường nào cho lưu lượng hướng tới 172.16.0.0/16, và công ty có thể đảm bảo VPN chỉ được sử dụng nếu kết nối Direct Connect gặp sự cố bằng cách nào?

**Đáp án đúng:** **D**

Thứ tự ưu tiên tuyến đường trên Transit Gateway đối với cùng một prefix: Static Routes > VPC Attachment > Direct Connect Gateway > Site-to-Site VPN. Do đó Direct Connect tự động được ưu tiên hơn VPN nếu quảng bá cùng prefix (nhưng lưu ý không được quảng bá prefix cụ thể hơn qua VPN!).

- **A:** TGW VPN attachment hỗ trợ BGP và static route; ngoài ra static route luôn thắng dynamic BGP route nên cấu hình static route trỏ vào VPN sẽ làm VPN chiếm quyền ưu tiên của Direct Connect.
- **B:** TGW không chạy ECMP giữa Direct Connect và Site-to-Site VPN.
- **C:** Ngược lại, TGW luôn ưu tiên Direct Connect hơn VPN khi hai đường quảng bá cùng prefix.
- **D (Đúng):** Chính xác. Trên AWS Transit Gateway (và VGW), khi nhận được cùng một prefix từ Direct Connect và Site-to-Site VPN (cùng độ dài prefix), AWS luôn ưu tiên đường Direct Connect hơn VPN.

</details>

### Câu 9 `hard`

A network team is connecting a SD-WAN virtual appliance running inside a VPC to an AWS Transit Gateway. The team needs high-throughput (greater than 1.25 Gbps per tunnel) dynamic BGP routing between the SD-WAN appliance and the Transit Gateway without using IPsec encryption overhead, because the SD-WAN appliance already encrypts traffic end-to-end. Which Transit Gateway feature should the team use?

- **A.** Transit Gateway Peering attachment pointing to the SD-WAN EC2 instance ENI.
- **B.** Standard AWS Site-to-Site VPN attachment to the Transit Gateway with IPsec encryption disabled to exceed 1.25 Gbps.
- **C.** Direct Connect Transit VIF terminated on the SD-WAN EC2 instance.
- **D.** Transit Gateway Connect (TGW Connect) using GRE encapsulation and BGP over a VPC attachment.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ mạng đang kết nối một thiết bị ảo SD-WAN chạy bên trong một VPC với một AWS Transit Gateway. Đội ngũ cần định tuyến BGP động thông lượng cao (lớn hơn 1.25 Gbps mỗi đường hầm) giữa thiết bị SD-WAN và Transit Gateway mà không chịu chi phí phụ trội mã hóa IPsec, vì thiết bị SD-WAN đã mã hóa lưu lượng đầu-cuối. Đội ngũ nên sử dụng tính năng Transit Gateway nào?

**Đáp án đúng:** **D**

AWS Transit Gateway Connect được thiết kế chuyên biệt để tích hợp SD-WAN appliances trong VPC (hoặc Direct Connect) với TGW thông qua GRE + BGP, loại bỏ overhead của IPsec và đạt băng thông tới 5 Gbps/GRE tunnel (tối đa 20 Gbps với ECMP).

- **A:** TGW Peering chỉ dùng để kết nối hai Transit Gateway với nhau, không kết nối tới EC2 instance.
- **B:** Site-to-Site VPN bắt buộc phải chạy IPsec encryption và giới hạn ở mức 1.25 Gbps mỗi tunnel.
- **C:** Transit VIF là kết nối vật lý từ on-premises tới Direct Connect Gateway, không chạy trên EC2 instance trong VPC.
- **D (Đúng):** Chính xác. Transit Gateway Connect cho phép kết nối trực tiếp các thiết bị SD-WAN trong VPC tới Transit Gateway bằng giao thức GRE (không mã hóa IPsec) với băng thông lên tới 5 Gbps mỗi GRE tunnel (hỗ trợ ECMP tối đa 4 tunnel = 20 Gbps) và chạy BGP động.

</details>

### Câu 10 `hard`

A company has 15 VPCs in us-east-1 connected via a Transit Gateway. The security team deploys an AWS Network Firewall in a centralized Inspection VPC. When configuring Transit Gateway routing for east-west traffic between Spoke-A and Spoke-B, traffic from Spoke-A reaches Spoke-B through the firewall, but return traffic from Spoke-B bypasses the firewall or gets dropped asynchronously. What is the correct Transit Gateway route table design to ensure symmetric inspection?

- **A.** Use a Spoke Route Table (0.0.0.0/0 -> Inspection VPC) and an Inspection Route Table (propagating Spokes), with Appliance Mode enabled.
- **B.** Use a single default TGW route table with route propagation enabled for all Spoke VPCs and the centralized Inspection VPC.
- **C.** Disable Appliance Mode on the Inspection VPC attachment to allow TGW to load-balance return traffic across multiple Availability Zones.
- **D.** Configure VPC Peering between Spoke-A and Spoke-B as a backup path.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có 15 VPC tại us-east-1 kết nối qua Transit Gateway. Đội ngũ bảo mật triển khai AWS Network Firewall trong một Inspection VPC tập trung. Khi cấu hình định tuyến Transit Gateway cho lưu lượng east-west giữa Spoke-A và Spoke-B, lưu lượng từ Spoke-A đến Spoke-B đi qua tường lửa, nhưng lưu lượng phản hồi từ Spoke-B bỏ qua tường lửa hoặc bị loại bỏ bất đồng bộ. Thiết kế route table Transit Gateway chính xác để đảm bảo kiểm tra đối xứng là gì?

**Đáp án đúng:** **A**

Thiết kế TGW cho Centralized Inspection luôn cần ít nhất 2 Route Tables: (1) Spoke RT ép toàn bộ traffic (0.0.0.0/0 hoặc summary) vào Inspection VPC, và (2) Inspection RT chứa route tới từng Spoke VPC. Kết hợp bật Appliance Mode trên Inspection VPC attachment để đảm bảo symmetric routing.

- **A (Đúng):** Chính xác. Tách làm 2 bảng định tuyến trên TGW (Spoke RT đẩy toàn bộ traffic về Inspection VPC; Inspection RT định tuyến tới các Spoke VPC đã propagate) và bật Appliance Mode trên Inspection VPC attachment đảm bảo mọi gói tin đi và về đều qua đúng cùng một AZ và đi qua firewall hai chiều.
- **B:** Nếu dùng chung một TGW route table và propagate mọi Spoke VPC, Spoke-A sẽ định tuyến thẳng sang Spoke-B mà bỏ qua hoàn toàn Inspection VPC.
- **C:** Tắt Appliance Mode khiến TGW giữ lưu lượng ở AZ nguồn khi đi vào và AZ đích khi quay về, gây bất đối xứng (asymmetric routing) làm stateful firewall drop gói tin.
- **D:** VPC Peering sẽ tạo đường đi tắt bỏ qua Inspection VPC, vi phạm yêu cầu kiểm tra tập trung.

</details>

### Câu 11 `medium`

An enterprise uses AWS Direct Connect with a Private VIF to connect an on-premises router to a Virtual Private Gateway (VGW) attached to a production VPC (10.20.0.0/16). The VPC also has an Internet Gateway and a Site-to-Site VPN backup. The enterprise wants to ensure that on-premises users only access the VPC over Direct Connect (with VPN as backup) and never over the internet, while also limiting the number of BGP prefixes advertised by the on-premises router to under 100. Which action should the engineer take?

- **A.** Disable BGP on the Direct Connect Private VIF and configure static routes pointing to the VGW.
- **B.** Remove the Internet Gateway from the production VPC so BGP can advertise the 10.20.0.0/16 prefix over Direct Connect.
- **C.** Summarize on-premises routes into under 100 aggregate CIDRs before advertising via BGP, and enable VGW Route Propagation on private route tables.
- **D.** Advertise 500 individual /24 host routes over the Private VIF because Virtual Private Gateway automatically summarizes them into a /16 CIDR.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp sử dụng AWS Direct Connect với Private VIF để kết nối một router tại chỗ đến Virtual Private Gateway (VGW) gắn với một VPC production (10.20.0.0/16). VPC này cũng có một Internet Gateway và một Site-to-Site VPN dự phòng. Doanh nghiệp muốn đảm bảo người dùng tại chỗ chỉ truy cập VPC qua Direct Connect (với VPN làm dự phòng) và không bao giờ đi qua internet, đồng thời giới hạn số lượng tiền tố BGP do router tại chỗ quảng bá xuống dưới 100. Kỹ sư nên thực hiện hành động nào?

**Đáp án đúng:** **C**

Một giới hạn quan trọng trong bài thi ANS-C01: Direct Connect Private VIF chỉ nhận tối đa 100 BGP prefixes từ on-premises (vượt quá sẽ làm sập BGP session). Cần thực hiện route summarization ở phía on-premises và bật Route Propagation trên VPC route table.

- **A:** Direct Connect Private VIF bắt buộc phải chạy BGP, không hỗ trợ static route.
- **B:** Internet Gateway không ngăn cản VGW quảng bá prefix 10.20.0.0/16 qua Direct Connect.
- **C (Đúng):** Chính xác. AWS giới hạn tối đa 100 BGP routes nhận từ khách hàng trên mỗi Private/Transit VIF (nếu vượt quá sẽ làm rớt phiên BGP). Do đó cần summarize routes ở on-premises và bật Route Propagation trên VPC route table để nhận route từ VGW.
- **D:** VGW/DXGW không tự động summarize route giúp khách hàng; nếu quảng bá quá 100 prefix trên Private VIF (hoặc 200 trên Transit VIF / 100 trên VPN), phiên BGP sẽ bị reset/idle.

</details>

### Câu 12 `hard`

An organization has two 10 Gbps Direct Connect connections (DX-Primary and DX-Secondary) from the same on-premises data center (ASN 65001) to a Direct Connect Gateway associated with a Transit Gateway. Both connections advertise the exact same 10.50.0.0/16 prefix. The network engineer wants all outbound traffic from AWS to prefer DX-Primary under normal conditions and automatically fail over to DX-Secondary if DX-Primary fails. Which BGP configuration guarantees that AWS selects DX-Primary?

- **A.** Tag the 10.50.0.0/16 prefix advertised over DX-Primary with BGP community 7224:7300 and over DX-Secondary with 7224:7100.
- **B.** Tag the prefix advertised over DX-Primary with BGP community 7224:9100 and over DX-Secondary with 7224:9300 for local preference.
- **C.** Configure a higher BGP MED value on DX-Primary than on DX-Secondary across both Transit VIF BGP sessions.
- **D.** Prepend ASN 65001 three times on DX-Primary so that AWS recognizes it as the authoritative preferred outbound path.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức có hai kết nối Direct Connect 10 Gbps (DX-Primary và DX-Secondary) từ cùng một trung tâm dữ liệu tại chỗ (ASN 65001) đến một Direct Connect Gateway được liên kết với một Transit Gateway. Cả hai kết nối đều quảng bá chính xác cùng một tiền tố 10.50.0.0/16. Kỹ sư mạng muốn mọi lưu lượng đi ra từ AWS ưu tiên DX-Primary trong điều kiện bình thường và tự động chuyển sang DX-Secondary nếu DX-Primary gặp sự cố. Cấu hình BGP nào đảm bảo AWS chọn DX-Primary?

**Đáp án đúng:** **A**

Trên Private/Transit VIF, gắn BGP Community Local Preference 7224:7300 (High) cho đường Primary và 7224:7100 (Low) cho đường Secondary là phương pháp chuẩn và có độ ưu tiên cao nhất sau Longest Prefix Match.

- **A (Đúng):** BGP Community Local Preference của AWS (7224:7300 High > 7224:7200 Medium > 7224:7100 Low) đứng đầu trong chuỗi chọn đường BGP cùng prefix (ưu tiên cao hơn cả AS_PATH và MED), đảm bảo AWS luôn chọn DX-Primary.
- **B:** Các BGP Community 7224:9100/9200/9300 chỉ dùng để giới hạn phạm vi quảng bá trên Public VIF, không dùng để điều chỉnh Local Preference trên Private/Transit VIF.
- **C:** Trong BGP, giá trị MED THẤP HƠN mới được ưu tiên hơn (cao hơn sẽ bị đẩy xuống làm Backup).
- **D:** AS_PATH Prepending làm đường dài hơn (kém ưu tiên hơn), vì vậy phải áp dụng lên đường Secondary/Backup, không phải Primary.

</details>

### Câu 13 `hard`

A company connects its on-premises network to AWS using a Direct Connect Transit VIF (Active) and a Site-to-Site VPN (Backup) attached to the same Transit Gateway. On-premises advertises 10.20.0.0/16 over Direct Connect, while a junior engineer accidentally advertises 10.20.1.0/24 and 10.20.2.0/24 over the Site-to-Site VPN. Where will traffic from AWS destined for 10.20.1.50 be routed?

- **A.** Dropped as a blackhole route by the Transit Gateway due to overlapping BGP prefix advertisements.
- **B.** Over Direct Connect, because AWS Direct Connect BGP routes always take precedence over Site-to-Site VPN routes regardless of prefix length.
- **C.** Load-balanced equally between the Direct Connect Transit VIF and the Site-to-Site VPN attachment via Transit Gateway ECMP.
- **D.** Over the Site-to-Site VPN, because Longest Prefix Match (/24 vs. /16) always takes precedence over route origin.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty kết nối mạng tại chỗ của mình với AWS bằng một Direct Connect Transit VIF (Active) và một Site-to-Site VPN (Backup) gắn vào cùng một Transit Gateway. Mạng tại chỗ quảng bá 10.20.0.0/16 qua Direct Connect, trong khi một kỹ sư mới vô tình quảng bá 10.20.1.0/24 và 10.20.2.0/24 qua Site-to-Site VPN. Lưu lượng từ AWS gửi đến 10.20.1.50 sẽ được định tuyến đi đâu?

**Đáp án đúng:** **D**

Quy tắc bất di bất dịch trong mạng IP và AWS Routing: Longest Prefix Match (/24 thắng /16) luôn thắng mọi thuộc tính khác như Static vs BGP, Direct Connect vs VPN hay BGP Local Preference.

- **A:** Quảng bá prefix con (/24) bên trong prefix cha (/16) là hoàn toàn hợp lệ trong định tuyến IP/BGP và không bị blackhole.
- **B:** Direct Connect chỉ ưu tiên hơn Site-to-Site VPN khi cả hai cùng quảng bá một prefix length giống nhau.
- **C:** ECMP không cân bằng tải giữa Direct Connect và VPN, và cũng không bao giờ áp dụng giữa hai prefix khác độ dài (/16 và /24).
- **D (Đúng):** Longest Prefix Match (LPM) luôn là quy tắc số 1 tuyệt đối trong bảng định tuyến. Vì 10.20.1.0/24 chi tiết hơn 10.20.0.0/16 nên lưu lượng tới 10.20.1.50 sẽ đi qua Site-to-Site VPN.

</details>

### Câu 14 `hard`

An enterprise uses two redundant AWS Direct Connect connections with BGP over Transit VIFs. During a recent fiber cut between the customer colocation router and the Direct Connect router, application connections experienced a 90-second outage before traffic failed over to the secondary link. How should the network engineer reduce BGP failover detection time to under 1 second?

- **A.** Enable Jumbo Frames (MTU 8500) on the Transit VIF to speed up BGP keepalive and hold-timer packet processing.
- **B.** Enable Equal-Cost Multi-Path (ECMP) routing on the Direct Connect Gateway to trigger sub-second failover.
- **C.** Configure BGP community 7224:7300 on the primary Transit VIF to reduce the BGP hold timer to 1 second.
- **D.** Enable Bidirectional Forwarding Detection (BFD) on both the customer router and the AWS Direct Connect VIFs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp sử dụng hai kết nối AWS Direct Connect dự phòng với BGP qua Transit VIF. Trong một sự cố đứt cáp quang gần đây giữa router đặt tại colocation của khách hàng và router Direct Connect, các kết nối ứng dụng bị gián đoạn 90 giây trước khi lưu lượng chuyển sang liên kết phụ. Kỹ sư mạng nên làm gì để giảm thời gian phát hiện lỗi chuyển đổi BGP xuống dưới 1 giây?

**Đáp án đúng:** **D**

AWS Direct Connect có BGP Hold Timer mặc định là 90 giây. Bật BFD (Bidirectional Forwarding Detection) là giải pháp chuẩn để đạt sub-second failover (< 1 giây).

- **A:** Jumbo Frames tối ưu hiệu suất truyền dữ liệu lớn, không ảnh hưởng đến BGP Hold Timer.
- **B:** ECMP cân bằng tải khi cả hai đường đang hoạt động nhưng không rút ngắn thời gian phát hiện đứt liên kết BGP (vẫn mất tới 90s nếu không có BFD).
- **C:** BGP Local Preference chỉ quyết định đường nào được ưu tiên, không làm giảm thời gian hội tụ khi mất kết nối vật lý.
- **D (Đúng):** Bật BFD trên Direct Connect VIF và router khách hàng giúp phát hiện đứt liên kết L2/L3 trong vòng ~900ms (300ms x 3) thay vì phải chờ BGP Hold Timer mặc định 90 giây.

</details>

### Câu 15 `hard`

After adding 15 new subnets to an on-premises branch network, the BGP session over an AWS Direct Connect Private VIF suddenly drops and flaps continuously. The network engineer confirms that the on-premises router is now advertising 112 individual /24 prefixes over the Private VIF. What is the root cause and the fastest remediation?

- **A.** The Direct Connect Gateway limit of 200 allowed prefixes was exceeded by the 15 new subnets; request a quota increase from AWS Support.
- **B.** The Private VIF does not support /24 prefixes over Direct Connect; convert all 112 on-premises advertisements to /16 summary prefixes.
- **C.** BGP MD5 authentication expired when the 15 new branch prefixes were added; rotate the BGP MD5 authentication key on both routers.
- **D.** The Private VIF exceeded the hard limit of 100 BGP routes advertised from on-premises; summarize the on-premises prefixes into fewer aggregate routes.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Sau khi thêm 15 subnet mới vào mạng chi nhánh tại chỗ, phiên BGP qua một AWS Direct Connect Private VIF đột nhiên bị ngắt và chập chờn liên tục (flap). Kỹ sư mạng xác nhận rằng router tại chỗ hiện đang quảng bá 112 tiền tố /24 riêng lẻ qua Private VIF. Nguyên nhân gốc rễ là gì và biện pháp khắc phục nhanh nhất là gì?

**Đáp án đúng:** **D**

Một trong những lỗi kinh điển của Direct Connect trong bài thi ANS-C01: quảng bá quá 100 routes từ On-Premises lên Private VIF / Transit VIF sẽ làm ngắt BGP session. Giải pháp là Route Summarization.

- **A:** Giới hạn 200 allowed prefixes là chiều từ AWS quảng bá về On-Premises qua DXGW->TGW, không phải chiều từ On-Premises lên Private VIF (giới hạn 100).
- **B:** Private VIF hoàn toàn hỗ trợ quảng bá prefix /24 (và chi tiết hơn), vấn đề nằm ở tổng số lượng route vượt quá 100.
- **C:** Thêm prefix mới không làm hết hạn BGP MD5 key.
- **D (Đúng):** AWS Direct Connect giới hạn tối đa 100 BGP routes quảng bá từ On-Premises trên Private VIF và Transit VIF. Khi vượt 100 routes, BGP session bị ngắt/flap. Cần áp dụng Route Summarization để giảm số prefix xuống <= 100.

</details>

### Câu 16 `hard`

A European bank uses an AWS Direct Connect Public VIF in Frankfurt (eu-central-1) to access Amazon S3 and DynamoDB endpoints. Security policy requires that the bank's public IP prefixes advertised over the Public VIF are ONLY propagated to AWS Regions within Europe, and that AWS only advertises regional public prefixes back to the bank. Which TWO BGP configurations should be applied? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Advertise RFC 1918 private IP ranges over the Public VIF with the no-export BGP community to limit regional propagation.
- **B.** Tag the prefixes advertised from on-premises with the BGP community 7224:9300 (All AWS Regions globally) to restrict propagation to European Regions.
- **C.** Attach the Public VIF directly to a Direct Connect Gateway and configure Allowed Prefixes to filter European AWS Regions.
- **D.** Configure an inbound BGP route filter on the on-premises router to accept only AWS routes tagged with the local Region or continent BGP community.
- **E.** Tag the prefixes advertised from on-premises with the BGP community 7224:9200 (All AWS Regions on the same continent).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ngân hàng châu Âu sử dụng AWS Direct Connect Public VIF tại Frankfurt (eu-central-1) để truy cập các endpoint Amazon S3 và DynamoDB. Chính sách bảo mật yêu cầu các tiền tố IP công cộng của ngân hàng được quảng bá qua Public VIF CHỈ được lan truyền đến các AWS Region trong châu Âu, và AWS chỉ quảng bá các tiền tố công cộng theo khu vực (regional) về cho ngân hàng. Nên áp dụng HAI cấu hình BGP nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **D, E**

Với Direct Connect Public VIF, dùng BGP Community 7224:9200 để giới hạn phạm vi quảng bá trong cùng châu lục (Continent) và lọc inbound routes trên router On-Premises theo AWS BGP communities.

- **A:** Public VIF yêu cầu bắt buộc sử dụng địa chỉ Public IPv4/IPv6 thuộc sở hữu của khách hàng, không chấp nhận RFC 1918.
- **B:** 7224:9300 sẽ quảng bá prefix ra toàn cầu (Global), vi phạm yêu cầu chỉ giới hạn trong Châu Âu.
- **C:** Public VIF không thể gắn vào Direct Connect Gateway (DXGW chỉ dùng cho Private VIF và Transit VIF).
- **D (Đúng):** AWS tự động gắn BGP community tag vào các public prefix mà AWS quảng bá về On-Premises; khách hàng cấu hình inbound route-map/filter trên router để chỉ nhận các prefix của Region/Châu lục mong muốn.
- **E (Đúng):** BGP Community 7224:9200 trên Public VIF giới hạn AWS chỉ quảng bá prefix của khách hàng trong phạm vi các AWS Region thuộc cùng lục địa (Châu Âu).

</details>

---

[Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md)
