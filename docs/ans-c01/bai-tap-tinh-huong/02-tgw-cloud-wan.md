# Bài tập tình huống — AWS Transit Gateway, Inter-Region Peering & AWS Cloud WAN

> Kiến trúc Hub-and-Spoke toàn cầu với Transit Gateway Route Tables, Appliance Mode, Inter-Region Peering và Core Network Policy trên AWS Cloud WAN.
> **Số câu hỏi:** 11 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

An enterprise operates two on-premises data centers (New York and London) connected to AWS via Direct Connect. They want to route private traffic directly between the New York data center and the London data center over the AWS global network backbone without traversing any VPCs or Transit Gateways. Which Direct Connect feature enables this?

- **A.** Private Virtual Interfaces (Private VIFs) from both data centers peered via an inter-Region VPC Peering connection.
- **B.** Direct Connect Gateway with Transit Virtual Interfaces (Transit VIFs) attached to both the New York and London data centers.
- **C.** AWS Cloud WAN with Direct Connect Core Network attachments routed through a central AWS Transit Gateway in us-east-1.
- **D.** AWS Direct Connect SiteLink enabled on the Virtual Interfaces attached to a Direct Connect Gateway.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp vận hành hai trung tâm dữ liệu tại chỗ (New York và London) kết nối với AWS qua Direct Connect. Họ muốn định tuyến lưu lượng riêng tư trực tiếp giữa trung tâm dữ liệu New York và trung tâm dữ liệu London qua mạng trục toàn cầu của AWS mà không đi qua bất kỳ VPC hay Transit Gateway nào. Tính năng Direct Connect nào cho phép điều này?

**Đáp án đúng:** **D**

AWS Direct Connect SiteLink cho phép truyền tải dữ liệu trực tiếp giữa các Direct Connect locations (on-premises to on-premises) qua hạ tầng AWS global backbone.

- **A:** VPC Peering không hỗ trợ transitive routing giữa hai Private VIF.
- **B:** Direct Connect Gateway mặc định không định tuyến traffic trực tiếp từ VIF này sang VIF khác giữa các on-premises data center nếu không bật SiteLink.
- **C:** Cloud WAN có thể kết nối các nhánh nhưng đi qua Core Network Edge (CNE) ở các Region; SiteLink là tính năng chuyên biệt của Direct Connect để nối thẳng các VIF.
- **D (Đúng):** Chính xác. Direct Connect SiteLink cho phép các văn phòng/data center on-premises kết nối thẳng với nhau qua AWS backbone bằng đường đi ngắn nhất mà không cần đi qua Region VPC/TGW.

</details>

### Câu 2 `hard`

An organization is migrating to AWS Cloud WAN to unify network segmentation across 5 Regions. Production VPCs must communicate with Shared Services VPCs, while Development VPCs must be isolated from Production VPCs but still access Shared Services. Which TWO Cloud WAN Core Network Policy configurations satisfy these requirements?

*(Chọn 2 đáp án)*

- **A.** Define three segments: prod, dev, and shared.
- **B.** Use Transit Gateway Inter-Region Peering inside the Cloud WAN Core Network Policy to isolate Development VPCs.
- **C.** Enable isolate-attachments on the shared segment.
- **D.** Create segment-actions with mode share between shared and prod, and between shared and dev.
- **E.** Set edge-locations to a single primary Region to ensure centralized routing.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức đang di chuyển sang AWS Cloud WAN để thống nhất phân đoạn mạng trên 5 Region. Các Production VPC phải giao tiếp được với Shared Services VPC, trong khi các Development VPC phải bị cô lập khỏi Production VPC nhưng vẫn truy cập được Shared Services. HAI cấu hình Cloud WAN Core Network Policy nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **A, D**

Trong AWS Cloud WAN, bạn định nghĩa các segments (prod, dev, shared) và dùng `segment-actions` với `action: share` để kiểm soát chính xác segment nào được phép trao đổi route với segment nào.

- **A (Đúng):** Chính xác. Chia mạng thành 3 segments logic (prod, dev, shared) để tách biệt ranh giới định tuyến.
- **B:** Sai. Cloud WAN tự động tạo lưới kết nối (full-mesh) giữa các Core Network Edge (CNE) ở các Region mà không cần cấu hình TGW peering thủ công.
- **C:** Sai. Bật isolate-attachments trên shared segment sẽ khiến các VPC trong shared không thể giao tiếp với nhau hoặc sai mục đích chia sẻ.
- **D (Đúng):** Chính xác. Segment action mode 'share' cho phép trao đổi route giữa shared-prod và shared-dev, trong khi prod và dev vẫn cô lập với nhau.
- **E:** Sai. Chỉ đặt 1 edge-location sẽ không thể attach các VPC ở 5 Region khác nhau và làm tăng latency nghiêm trọng.

</details>

### Câu 3 `hard`

A global financial enterprise is connecting 40 VPCs across us-east-1, eu-west-1, and ap-southeast-1 to two on-premises data centers in New York and London. The enterprise wants to use AWS Direct Connect with SiteLink so that the New York and London data centers can communicate with each other over the AWS global backbone without hair-pinning traffic through a VPC or Transit Gateway. Which Direct Connect architecture meets this requirement?

- **A.** Create Public VIFs on both Direct Connect connections and advertise on-premises prefixes to AWS over BGP with SiteLink enabled.
- **B.** Create Transit VIFs on both Direct Connect connections, attach them to a common Direct Connect Gateway, and enable SiteLink on both Transit VIFs.
- **C.** Create Private VIFs on both Direct Connect connections, attach them to the same Direct Connect Gateway, and enable SiteLink on both Private VIFs.
- **D.** Create Transit VIFs on both Direct Connect connections, attach each to a separate Direct Connect Gateway, and peer the two Direct Connect Gateways.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp tài chính toàn cầu đang kết nối 40 VPC trên us-east-1, eu-west-1 và ap-southeast-1 với hai trung tâm dữ liệu tại chỗ ở New York và London. Doanh nghiệp muốn sử dụng AWS Direct Connect với SiteLink để các trung tâm dữ liệu New York và London có thể giao tiếp với nhau qua mạng trục toàn cầu của AWS mà không cần định tuyến vòng (hair-pinning) lưu lượng qua VPC hay Transit Gateway. Kiến trúc Direct Connect nào đáp ứng yêu cầu này?

**Đáp án đúng:** **B**

AWS Direct Connect SiteLink cho phép kết nối trực tiếp giữa các văn phòng/data center on-premises thông qua mạng lõi toàn cầu của AWS. Điều kiện bắt buộc là sử dụng Transit VIF (hoặc Private VIF trên một số cấu hình nhưng chuẩn kiến trúc multi-VPC/Transit là Transit VIF gắn cùng một Direct Connect Gateway) và bật tính năng SiteLink trên các VIF đó.

- **A:** Public VIF dùng để truy cập các dịch vụ public của AWS (S3, DynamoDB) và không hỗ trợ SiteLink để định tuyến private giữa các site on-premises.
- **B (Đúng):** Chính xác. SiteLink được hỗ trợ trên Transit VIF (kết nối vào Direct Connect Gateway) và cho phép truyền dữ liệu trực tiếp giữa các Direct Connect locations qua AWS global backbone mà không cần đi qua Transit Gateway hay VPC.
- **C:** Private VIF kết nối tới Virtual Private Gateway (VGW) của từng VPC. Direct Connect Gateway với Private VIF không hỗ trợ SiteLink để định tuyến trực tiếp giữa các kết nối on-premises với nhau.
- **D:** Không thể peer hai Direct Connect Gateway với nhau; các Transit VIF phải gắn vào cùng một Direct Connect Gateway và bật SiteLink.

</details>

### Câu 4 `medium`

An enterprise is migrating its global multi-Region network from manually managed Transit Gateway peerings across five AWS Regions to AWS Cloud WAN. The network team needs isolated routing domains for Production, Staging, and Shared Services, and wants VPCs to automatically attach to the appropriate segment based on resource tags without manual route table edits. How should the team configure AWS Cloud WAN?

- **A.** Create a single Cloud WAN core network with one segment and use Security Groups to isolate Production, Staging, and Shared Services traffic across Regions.
- **B.** Define three segments (prod, staging, shared) in the core network policy, use tag-based attachment-policies, and share shared via segment-actions.
- **C.** Deploy a Transit Gateway in each of the five Regions, peer them in a full mesh, and use AWS RAM with Resource Tagging to synchronize route tables.
- **D.** Create three separate Cloud WAN global networks, one for each environment, and connect them using AWS PrivateLink.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp đang di chuyển mạng đa Region toàn cầu của mình từ các Transit Gateway peering quản lý thủ công trên năm AWS Region sang AWS Cloud WAN. Đội ngũ mạng cần các miền định tuyến cô lập cho Production, Staging và Shared Services, đồng thời muốn các VPC tự động gắn vào segment phù hợp dựa trên resource tags mà không cần chỉnh sửa route table thủ công. Đội ngũ nên cấu hình AWS Cloud WAN như thế nào?

**Đáp án đúng:** **B**

AWS Cloud WAN quản lý toàn bộ mạng toàn cầu thông qua một Core Network Policy duy nhất. Các Segment đóng vai trò như các routing domain độc lập, Attachment Policies tự động map VPC attachment vào segment theo tag, và Segment Actions kiểm soát việc chia sẻ route giữa các segment.

- **A:** Security Groups chỉ kiểm soát lưu lượng ở cấp ENI trong VPC, không thể thay thế cơ chế phân tách bảng định tuyến (routing domain isolation) giữa các môi trường trên Cloud WAN.
- **B (Đúng):** Chính xác. Cloud WAN sử dụng Core Network Policy (JSON) để định nghĩa các segments cô lập, dùng attachment-policies tự động gán VPC dựa trên tag, và dùng segment-actions (share) để cho phép giao tiếp với Shared Services.
- **C:** Đây là mô hình Transit Gateway thủ công mà doanh nghiệp đang muốn thoát khỏi; AWS RAM không tự động đồng bộ bảng định tuyến theo tag.
- **D:** Việc tạo 3 global network riêng lẻ làm mất đi lợi ích quản lý tập trung của Cloud WAN và không thể kết nối các global network qua PrivateLink.

</details>

### Câu 5 `hard`

A retail enterprise is designing a hybrid network connecting 80 VPCs in two AWS Regions (us-east-1 and us-west-2) to an on-premises data center via two 10 Gbps Direct Connect connections. The enterprise uses AWS Transit Gateway in each Region and wants to ensure symmetric routing, prevent asymmetric paths across Regions, and maintain centralized egress inspection. Which TWO design practices should the architect implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Attach Private VIFs directly to the Transit Gateways to bypass the Direct Connect Gateway.
- **B.** Use a single Transit Gateway in us-east-1 and attach VPCs from us-west-2 directly to it to simplify routing.
- **C.** Attach the Transit Gateways in us-east-1 and us-west-2 to a single Direct Connect Gateway and configure Allowed Prefixes for each Region's summary CIDR.
- **D.** Enable Appliance Mode on the Transit Gateway VPC attachments for the centralized inspection VPCs in each Region.
- **E.** Enable Transit Gateway Inter-Region Peering and advertise on-premises BGP routes dynamically across the peering attachment.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp bán lẻ đang thiết kế mạng lai kết nối 80 VPC tại hai AWS Region (us-east-1 và us-west-2) đến một trung tâm dữ liệu tại chỗ qua hai kết nối Direct Connect 10 Gbps. Doanh nghiệp sử dụng AWS Transit Gateway ở mỗi Region và muốn đảm bảo định tuyến đối xứng, ngăn chặn đường đi bất đối xứng xuyên Region và duy trì kiểm tra lưu lượng đi ra tập trung. Kiến trúc sư nên triển khai HAI thực hành thiết kế nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, D**

Trong kiến trúc multi-Region với Transit Gateway và Direct Connect: (1) dùng Direct Connect Gateway với Allowed Prefixes rõ ràng cho từng Region, và (2) bật Appliance Mode trên TGW attachment của inspection VPC để đảm bảo symmetric routing qua firewall.

- **A:** Private VIF chỉ kết nối với Virtual Private Gateway (VGW); Transit Gateway bắt buộc phải sử dụng Transit VIF thông qua Direct Connect Gateway.
- **B:** Transit Gateway là dịch vụ cấp Region; không thể gắn trực tiếp VPC ở us-west-2 vào TGW ở us-east-1 mà phải qua Inter-Region Peering hoặc Cloud WAN.
- **C (Đúng):** Chính xác. Khi gắn nhiều TGW ở các Region khác nhau vào cùng một Direct Connect Gateway, cần khai báo Allowed Prefixes riêng biệt (summary CIDR của từng Region) để TGW quảng bá đúng route về on-premises, tránh xung đột hoặc đi vòng.
- **D (Đúng):** Chính xác. Bật Appliance Mode trên TGW attachment của inspection VPC đảm bảo TGW luôn giữ lưu lượng đi và về trên cùng một Availability Zone, duy trì tính đối xứng (symmetric routing) cho firewall stateful.
- **E:** Transit Gateway Inter-Region Peering chỉ hỗ trợ static routing, không hỗ trợ chạy BGP động qua peering attachment.

</details>

### Câu 6 `hard`

An enterprise operates an active-active multi-Region application behind Application Load Balancers in us-east-1, eu-west-1, and ap-northeast-1. The application uses AWS Cloud WAN with a single core network spanning all three Regions. The network team needs to ensure that traffic originating from VPCs in us-east-1 destined for Shared Services VPCs stays within us-east-1 unless the local Shared Services VPC is unavailable, while preventing Production VPCs from communicating with Development VPCs. How should the Cloud WAN core network policy be structured?

- **A.** Deploy an AWS Network Firewall endpoint in every spoke VPC to inspect and drop `prod`-to-`dev` packets across Regions.
- **B.** Place all VPCs into a single `global` segment and apply stateless Network ACLs on every subnet to block `prod`-to-`dev` traffic.
- **C.** Disable `isolate-attachments` on the `dev` segment and peer `prod` and `dev` segments via AWS Transit Gateway peering.
- **D.** Configure `prod`, `dev`, and `shared` segments, share `shared` with both, and use Cloud WAN shortest-path regional routing.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp vận hành một ứng dụng đa Region active-active phía sau các Application Load Balancer tại us-east-1, eu-west-1 và ap-northeast-1. Ứng dụng sử dụng AWS Cloud WAN với một core network duy nhất trải dài cả ba Region. Đội ngũ mạng cần đảm bảo rằng lưu lượng phát sinh từ các VPC tại us-east-1 hướng tới Shared Services VPC vẫn nằm trong us-east-1 trừ khi Shared Services VPC cục bộ không khả dụng, đồng thời ngăn chặn các Production VPC giao tiếp với Development VPC. Nên cấu trúc core network policy của Cloud WAN như thế nào?

**Đáp án đúng:** **D**

Trong AWS Cloud WAN, các Segment hoàn toàn cô lập nhau về định tuyến mặc định. Chỉ cần chia `prod`, `dev`, `shared` thành các segment riêng và dùng `segment-actions` (share) giữa `shared` với `prod`/`dev` (không share giữa `prod` và `dev`). Cloud WAN tự động ưu tiên định tuyến nội vùng (local Region) tới attachment gần nhất.

- **A:** Triển khai Network Firewall ở mọi spoke VPC cực kỳ tốn kém và dư thừa khi Cloud WAN Segments đã giải quyết việc cô lập ở tầng định tuyến.
- **B:** Đặt chung vào một segment sẽ cho phép định tuyến L3 tự do giữa prod và dev, việc duy trì NACL trên hàng trăm subnet rất dễ sai sót và không đúng thiết kế phân tách của Cloud WAN.
- **C:** Peer `prod` và `dev` sẽ cho phép hai môi trường nói chuyện với nhau, trái với yêu cầu cô lập.
- **D (Đúng):** Chính xác. Cloud WAN mặc định ưu tiên định tuyến tới edge/attachment trong cùng Region gần nhất (shortest path) trước khi đi liên vùng, và việc tách `prod` và `dev` thành hai segment không share với nhau sẽ cô lập hoàn toàn lưu lượng giữa hai môi trường.

</details>

### Câu 7 `medium`

A company is building an outbound-only hybrid architecture where 25 spoke VPCs must send all internet-bound IPv4 traffic through a centralized Egress VPC in us-east-1. The Egress VPC contains NAT Gateways in two Availability Zones and an Internet Gateway. What is the correct routing configuration for the spoke VPCs, Transit Gateway, and Egress VPC?

- **A.** Spoke VPCs attach directly to the NAT Gateways in the Egress VPC using AWS PrivateLink Interface VPC Endpoints.
- **B.** Spoke VPCs route 0.0.0.0/0 directly to an Internet Gateway in the centralized Egress VPC using full-mesh VPC Peering connections.
- **C.** Spokes route 0.0.0.0/0 to TGW; TGW routes 0.0.0.0/0 to Egress VPC; Egress private subnets route to NAT GW; public subnets route to IGW and spokes to TGW.
- **D.** Egress VPC public subnets route 0.0.0.0/0 to the Transit Gateway and spoke VPC CIDRs directly to the Internet Gateway.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty đang xây dựng kiến trúc lai chỉ đi ra (outbound-only) trong đó 25 spoke VPC phải gửi toàn bộ lưu lượng IPv4 hướng ra internet qua một Egress VPC tập trung tại us-east-1. Egress VPC chứa các NAT Gateway ở hai Availability Zone và một Internet Gateway. Cấu hình định tuyến chính xác cho các spoke VPC, Transit Gateway và Egress VPC là gì?

**Đáp án đúng:** **C**

Mô hình Centralized Egress trên Transit Gateway yêu cầu tách biệt 2 loại subnet trong Egress VPC: subnet chứa TGW attachment ENIs (route 0.0.0.0/0 -> NAT GW trong cùng AZ) và public subnet chứa NAT Gateways (route 0.0.0.0/0 -> IGW và route spoke summary CIDR -> TGW).

- **A:** PrivateLink không dùng để làm default internet egress gateway (0.0.0.0/0) cho spoke VPCs.
- **B:** VPC Peering không hỗ trợ transitive routing (Edge-to-Edge routing qua IGW của VPC khác).
- **C (Đúng):** Chính xác. Đây là mô hình Centralized Egress chuẩn với Transit Gateway: Spoke -> TGW -> Egress VPC (TGW ENI subnet) -> NAT Gateway (Public subnet) -> IGW, và chiều về từ Public subnet qua route của spoke CIDRs trỏ ngược về TGW.
- **D:** Cấu hình bị ngược hoàn toàn: public subnet phải trỏ 0.0.0.0/0 ra IGW để đi Internet và trỏ dải IP của spoke VPC về lại TGW.

</details>

### Câu 8 `hard`

An architect is designing a multi-Region disaster recovery (DR) architecture for a stateful financial application running in us-east-1 (Active) and us-west-2 (Standby). The application uses Route 53 Application Recovery Controller (ARC) to manage failover. The architect wants to prevent split-brain scenarios during a Region failure, enforce a minimum number of healthy cells, and rapidly shift traffic away from an impaired Availability Zone in us-east-1 before triggering a full Region failover. Which TWO Route 53 ARC features should the architect implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Configure Route 53 ARC Routing Controls with Safety Rules (asserting that at most one Region is active at a time).
- **B.** Enable Route 53 ARC Zonal Shift (and Zonal Autoshift) on the Application Load Balancers in us-east-1.
- **C.** Enable Direct Connect SiteLink on the ALBs to shift traffic between Regions.
- **D.** Configure AWS Cloud WAN Segment Actions to perform Layer 7 health checks on the ALBs.
- **E.** Use Route 53 Resolver DNS Firewall to block traffic to the impaired Availability Zone.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiến trúc sư đang thiết kế kiến trúc phục hồi thảm họa (DR) đa Region cho một ứng dụng tài chính có trạng thái (stateful) chạy tại us-east-1 (Active) và us-west-2 (Standby). Ứng dụng sử dụng Route 53 Application Recovery Controller (ARC) để quản lý chuyển đổi dự phòng. Kiến trúc sư muốn ngăn chặn kịch bản split-brain trong sự cố Region, áp đặt số lượng cell khỏe mạnh tối thiểu và nhanh chóng chuyển lưu lượng khỏi một Availability Zone bị suy giảm tại us-east-1 trước khi kích hoạt chuyển đổi dự phòng toàn bộ Region. Kiến trúc sư nên triển khai HAI tính năng Route 53 ARC nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, B**

Route 53 Application Recovery Controller (ARC) cung cấp hai năng lực cốt lõi cho kiến trúc độ sẵn sàng cao: (1) Zonal Shift / Zonal Autoshift để cô lập nhanh một AZ bị lỗi ngay trong Region, và (2) Routing Controls + Safety Rules để điều phối failover giữa các Region mà không bị split-brain.

- **A (Đúng):** Chính xác. Route 53 ARC Routing Controls sử dụng cụm 5 endpoint phân tán toàn cầu (cơ chế đồng thuận) và Safety Rules để ngăn chặn tình trạng split-brain (hai Region cùng active) hoặc tắt nhầm cả hai Region.
- **B (Đúng):** Chính xác. Zonal Shift cho phép đẩy toàn bộ lưu lượng ra khỏi một Availability Zone đang gặp sự cố chỉ với một thao tác (hoặc tự động qua Zonal Autoshift) trước khi cần failover sang Region khác.
- **C:** SiteLink là tính năng của Direct Connect cho kết nối hybrid, không áp dụng cho ALB.
- **D:** Cloud WAN Segment Actions dùng để chia sẻ route giữa các segment ở Layer 3, không làm L7 health check cho ALB.
- **E:** DNS Firewall lọc truy vấn DNS outbound từ VPC, không điều hướng traffic inbound của ALB theo Availability Zone.

</details>

### Câu 9 `medium`

A large enterprise is planning its AWS Transit Gateway architecture in us-east-1 for 100 VPCs across multiple Availability Zones. To ensure high availability, optimal performance, and minimal cross-AZ data transfer charges, which TWO best practices should the architect follow? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Enable BGP dynamic routing on every VPC attachment connected to the AWS Transit Gateway in us-east-1.
- **B.** Create dedicated small Transit Gateway attachment subnets (e.g., /28) in every Availability Zone where workloads run in each VPC.
- **C.** Place the Transit Gateway attachment in only one Availability Zone per VPC to conserve private IPv4 addresses.
- **D.** Disable cross-zone load balancing or use target-group AZ affinity when appropriate, and enable Appliance Mode only on Inspection VPC attachments containing stateful middleboxes.
- **E.** Attach all 100 VPCs to a single Virtual Private Gateway (VGW) instead of a centralized AWS Transit Gateway.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp lớn đang lên kế hoạch kiến trúc AWS Transit Gateway tại us-east-1 cho 100 VPC trên nhiều Availability Zone. Để đảm bảo tính sẵn sàng cao, hiệu năng tối ưu và tối thiểu hóa chi phí truyền dữ liệu liên AZ, kiến trúc sư nên tuân theo HAI thực hành tốt nhất nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Best practice khi thiết kế Transit Gateway VPC attachment: luôn tạo các subnet nhỏ chuyên dụng (/28) trải đều qua tất cả các AZ có workload để đảm bảo HA và tối ưu chi phí cross-AZ, đồng thời chỉ bật Appliance Mode trên Inspection VPC.

- **A:** TGW VPC attachment không chạy BGP; chỉ có VPN attachment, Direct Connect Gateway attachment và TGW Connect attachment mới chạy BGP.
- **B (Đúng):** Chính xác. Tạo subnet riêng (/28) cho TGW attachment tại mỗi AZ có workload giúp TGW giữ lưu lượng đi nội bộ trong cùng AZ bất cứ khi nào có thể, giảm độ trễ và tránh cước cross-AZ data transfer.
- **C:** Chỉ đặt TGW attachment ở 1 AZ tạo ra single point of failure nếu AZ đó gặp sự cố và khiến toàn bộ các AZ khác phải trả phí cross-AZ khi đi qua TGW.
- **D (Đúng):** Chính xác. TGW mặc định giữ traffic trong cùng AZ; chỉ nên bật Appliance Mode trên Inspection VPC có firewall stateful để đảm bảo tính đối xứng (symmetric routing), còn các spoke VPC thông thường nên để tắt để tối ưu chi phí và hiệu năng.
- **E:** VGW chỉ gắn được với tối đa 1 VPC duy nhất, không thể gắn 100 VPC.

</details>

### Câu 10 `hard`

A global financial enterprise operates 45 VPCs across 4 AWS Regions and connects 60 branch offices using third-party SD-WAN appliances. The network team wants to enforce consistent network segmentation (Production, Development, and Shared Services) globally, automate inter-Region routing without manually managing Transit Gateway peering and route tables, and integrate centralized security inspection across Regions. Which architecture meets these requirements with the LEAST operational overhead?

- **A.** Use AWS Direct Connect Gateway to interconnect all 45 VPCs and 60 branch offices across all 4 AWS Regions with automated dynamic BGP routing.
- **B.** Create VPC Peering connections between all 45 VPCs and terminate IPsec VPN tunnels from each branch office directly onto Virtual Private Gateways.
- **C.** Deploy an AWS Transit Gateway in each Region, configure a full mesh of Inter-Region Transit Gateway peering attachments, and synchronize static routes across all 45 VPCs using AWS Lambda.
- **D.** Deploy AWS Cloud WAN with a Core Network Policy defining segments, attach VPCs and SD-WAN Connect, and use Network Function Groups for inspection.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp tài chính toàn cầu vận hành 45 VPC trên 4 AWS Region và kết nối 60 văn phòng chi nhánh bằng các thiết bị SD-WAN của bên thứ ba. Đội ngũ mạng muốn thực thi phân đoạn mạng nhất quán (Production, Development và Shared Services) trên toàn cầu, tự động hóa định tuyến liên Region mà không phải quản lý thủ công Transit Gateway peering và route table, đồng thời tích hợp kiểm tra bảo mật tập trung trên các Region. Kiến trúc nào đáp ứng các yêu cầu này với ÍT gánh nặng vận hành NHẤT?

**Đáp án đúng:** **D**

AWS Cloud WAN là lựa chọn tối ưu cho kiến trúc Multi-Region toàn cầu cần phân đoạn mạng tập trung (Segments), tích hợp SD-WAN và tự động hóa định tuyến thay cho việc vận hành thủ công Inter-Region TGW Peering.

- **A:** Direct Connect Gateway không hỗ trợ transitive routing giữa các VPC/VGW/TGW và không phải giải pháp quản trị SD-WAN phân đoạn toàn cầu.
- **B:** Full-mesh VPC Peering cho 45 VPC cần tới 990 kết nối và hoàn toàn không thể mở rộng hay quản trị tập trung.
- **C:** Cấu hình full-mesh Inter-Region TGW Peering và đồng bộ static routes bằng Lambda đòi hỏi công sức vận hành lớn và dễ xảy ra lỗi cấu hình thủ công.
- **D (Đúng):** AWS Cloud WAN cung cấp Core Network toàn cầu được quản trị tập trung qua Core Network Policy (JSON), tự động phân đoạn mạng (Segments) xuyên Region, tích hợp SD-WAN qua Connect attachment và hỗ trợ native Network Function Groups cho Centralized Inspection.

</details>

### Câu 11 `medium`

A company needs to establish a backup connectivity path for its 10 Gbps Direct Connect link to an AWS Transit Gateway. The backup path must sustain at least 4 Gbps of encrypted throughput over the public Internet with automated dynamic failover. Which TWO configurations should the network engineer implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Enable Equal-Cost Multi-Path (ECMP) routing support on the AWS Transit Gateway and advertise identical BGP attributes across the VPN tunnels.
- **B.** Create a single AWS Site-to-Site VPN connection attached to a Virtual Private Gateway with Accelerated Site-to-Site VPN enabled.
- **C.** Create multiple dynamic (BGP-based) AWS Site-to-Site VPN connections attached to the AWS Transit Gateway.
- **D.** Use AWS Global Accelerator to aggregate the throughput of the Site-to-Site VPN tunnels beyond 1.25 Gbps per tunnel.
- **E.** Configure static routes on the Transit Gateway pointing to the VPN attachments with a more specific prefix than Direct Connect.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty cần thiết lập đường kết nối dự phòng cho liên kết Direct Connect 10 Gbps đến một AWS Transit Gateway. Đường dự phòng phải duy trì ít nhất 4 Gbps thông lượng được mã hóa qua Internet công cộng với khả năng chuyển đổi dự phòng động tự động. Kỹ sư mạng nên triển khai HAI cấu hình nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, C**

Giới hạn băng thông mỗi IPsec VPN tunnel là 1.25 Gbps. Để đạt >= 4 Gbps backup có failover tự động, cần triển khai nhiều BGP Site-to-Site VPN connections gắn vào Transit Gateway và bật ECMP.

- **A (Đúng):** Bật ECMP trên Transit Gateway kết hợp quảng bá cùng prefix và thuộc tính BGP tương đương trên các VPN tunnels giúp cân bằng tải lưu lượng đạt >= 4 Gbps.
- **B:** Một Site-to-Site VPN tunnel bị giới hạn tối đa 1.25 Gbps và VGW không hỗ trợ ECMP để cộng gộp băng thông nhiều VPN.
- **C (Đúng):** Tạo nhiều kết nối Site-to-Site VPN dùng BGP gắn vào Transit Gateway (ít nhất 4 tunnels active) cho phép mở rộng băng thông vượt ngưỡng 1.25 Gbps/tunnel.
- **D:** Accelerated Site-to-Site VPN (dùng Global Accelerator) chỉ giúp giảm độ trễ và jitter chứ không tăng giới hạn 1.25 Gbps trên mỗi tunnel.
- **E:** Cấu hình static route hoặc prefix dài hơn cho VPN sẽ khiến VPN được ưu tiên hơn Direct Connect (trái với mục tiêu dùng VPN làm backup).

</details>

---

[Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md)
