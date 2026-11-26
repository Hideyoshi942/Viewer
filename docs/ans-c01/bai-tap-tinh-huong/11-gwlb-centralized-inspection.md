# Bài tập tình huống — Gateway Load Balancer (GWLB), GENEVE & Centralized Inspection

> Kiến trúc Bump-in-the-wire với GWLB, giao thức GENEVE (UDP port 6081), GWLB Endpoints (GWLBe) và TGW Appliance Mode chống asymmetric routing.
> **Số câu hỏi:** 10 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A company deploys third-party stateful firewall appliances behind an AWS Gateway Load Balancer (GWLB) in a centralized Inspection VPC attached to a Transit Gateway. East-West traffic between Spoke VPCs in different Availability Zones is intermittently dropped by the firewalls. What is the most likely cause?

- **A.** Appliance Mode is disabled on the Inspection VPC Transit Gateway attachment, causing asymmetric routing across AZs.
- **B.** The third-party stateful firewall appliances are configured for VXLAN on UDP port 4789 instead of GENEVE on UDP port 6081.
- **C.** Gateway Load Balancer Endpoints (GWLBE) do not support centralized Inspection VPCs with Transit Gateway attachments.
- **D.** Cross-Zone Load Balancing is disabled on the Transit Gateway attachment for the centralized Inspection VPC.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty triển khai các thiết bị tường lửa stateful của bên thứ ba phía sau AWS Gateway Load Balancer (GWLB) trong một Inspection VPC tập trung gắn với Transit Gateway. Lưu lượng East-West giữa các Spoke VPC ở các Availability Zone khác nhau bị tường lửa ngắt ngắt quãng. Nguyên nhân khả dĩ nhất là gì?

**Đáp án đúng:** **A**

Bật `ApplianceModeSupport=enable` trên TGW VPC Attachment của Inspection VPC là quy tắc bắt buộc trong mọi kiến trúc centralized stateful inspection với GWLB hoặc AWS Network Firewall.

- **A (Đúng):** Chính xác. Nếu không bật Appliance Mode trên TGW attachment của Inspection VPC, chiều đi và chiều về giữa hai Spoke ở khác AZ sẽ đi qua hai AZ khác nhau của Inspection VPC (hai firewall khác nhau), khiến stateful firewall drop gói tin.
- **B:** Nếu sai giao thức GENEVE thì toàn bộ traffic qua GWLB sẽ không hoạt động ngay từ đầu, không phải chỉ rớt gói khi đi khác AZ.
- **C:** GWLBE nằm trong subnet của Inspection VPC và phối hợp hoàn toàn bình thường với TGW attachment.
- **D:** Transit Gateway không có tính năng tên là Cross-Zone Load Balancing; tính năng giữ symmetric routing theo AZ trên TGW gọi là Appliance Mode.

</details>

### Câu 2 `hard`

A security engineer is configuring Security Groups for a fleet of third-party firewall appliances registered in a Gateway Load Balancer (GWLB) target group. Which port and protocol must be allowed inbound from the GWLB subnet CIDR to receive encapsulated client traffic?

- **A.** UDP port 6081 (GENEVE)
- **B.** UDP port 4789 (VXLAN)
- **C.** UDP port 500 and 4500 (IPsec/NAT-T)
- **D.** TCP port 443 (HTTPS)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư bảo mật đang cấu hình Security Groups cho một cụm thiết bị tường lửa bên thứ ba được đăng ký trong target group của Gateway Load Balancer (GWLB). Cổng và giao thức nào phải được cho phép ở chiều inbound từ dải CIDR subnet của GWLB để nhận lưu lượng client đã được đóng gói?

**Đáp án đúng:** **A**

Gateway Load Balancer sử dụng giao thức GENEVE (UDP port 6081) để đóng gói và giữ nguyên vẹn header IP gốc của gói tin khi đẩy qua Firewall Appliance.

- **A (Đúng):** Chính xác. GWLB đóng gói gói tin gốc bằng giao thức GENEVE trên UDP port 6081 khi chuyển tiếp tới các Firewall Appliances trong Target Group (cộng thêm port health check như TCP 80/443).
- **B:** UDP 4789 (VXLAN) được sử dụng bởi VPC Traffic Mirroring, không phải GWLB.
- **C:** Đây là các port của Site-to-Site VPN IPsec.
- **D:** GWLB hoạt động ở Layer 3 dùng GENEVE UDP 6081, không đóng gói traffic bằng TCP 443.

</details>

### Câu 3 `hard`

A company wants to inspect all inbound internet traffic destined for an Application Load Balancer (ALB) in a public subnet using a Gateway Load Balancer Endpoint (GWLBE) before the traffic reaches the ALB, without changing the ALB's public IP or DNS. How should the VPC routing be configured?

- **A.** Place the Application Load Balancer (ALB) in a private subnet and route 0.0.0.0/0 from the Internet Gateway directly to the ALB private ENIs.
- **B.** Enable Appliance Mode on the Internet Gateway edge association so inbound traffic routes symmetrically through the GWLBE.
- **C.** Associate an Edge Route Table with the IGW routing the ALB subnet CIDR to the GWLBE, and route 0.0.0.0/0 from the ALB subnet to the GWLBE.
- **D.** Register the Application Load Balancer's ENI private IP addresses as targets inside the Gateway Load Balancer target group.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty muốn kiểm tra toàn bộ lưu lượng internet đi vào hướng tới một Application Load Balancer (ALB) trong public subnet bằng Gateway Load Balancer Endpoint (GWLBE) trước khi lưu lượng đến ALB, mà không làm thay đổi IP công cộng hay DNS của ALB. Nên cấu hình định tuyến VPC như thế nào?

**Đáp án đúng:** **C**

Mô hình Distributed Ingress Inspection với GWLBE (hoặc AWS Network Firewall) sử dụng tính năng IGW Ingress Routing (Edge Association) để điều hướng gói tin trước khi tới ALB.

- **A:** IGW không thể định tuyến trực tiếp tới một private ALB không có public IP.
- **B:** Internet Gateway không có khái niệm Appliance Mode (chỉ Transit Gateway mới có).
- **C (Đúng):** Chính xác. IGW Ingress Routing cho phép ép traffic từ Internet đi vào ALB phải rẽ qua GWLBE trước. Đồng thời ALB subnet phải trỏ 0.0.0.0/0 về GWLBE để chiều trả về đi qua đúng firewall đó (symmetric).
- **D:** Target Group của GWLB chứa Firewall Appliances (hỗ trợ GENEVE), không chứa ALB.

</details>

### Câu 4 `hard`

An enterprise uses an Inspection VPC with a Gateway Load Balancer (GWLB) and third-party firewalls for centralized egress inspection. Traffic flows from Spoke VPC -> Transit Gateway -> Inspection VPC TGW ENI -> GWLBE -> Firewall -> GWLBE -> NAT Gateway -> IGW -> Internet. Return traffic from the internet arrives at the NAT Gateway, but bypasses the firewall on the way back to the Spoke VPC. What route table entry is missing?

- **A.** In the Spoke VPC private subnet route table, point 0.0.0.0/0 directly to the NAT Gateway ENI.
- **B.** In the NAT Gateway subnet's route table, add a route for the Spoke VPC CIDRs pointing to the GWLBE (in the same AZ).
- **C.** In the Internet Gateway Edge Route Table, add a route for 0.0.0.0/0 pointing directly to the Transit Gateway.
- **D.** In the GWLBE subnet route table, add a return route for the Spoke VPC CIDRs pointing directly to the Internet Gateway.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp sử dụng một Inspection VPC với Gateway Load Balancer (GWLB) và tường lửa bên thứ ba để kiểm tra lưu lượng đi ra (egress) tập trung. Lưu lượng đi từ Spoke VPC -> Transit Gateway -> Inspection VPC TGW ENI -> GWLBE -> Firewall -> GWLBE -> NAT Gateway -> IGW -> Internet. Lưu lượng phản hồi từ internet quay về NAT Gateway, nhưng bỏ qua tường lửa trên đường quay lại Spoke VPC. Mục route table nào đang bị thiếu?

**Đáp án đúng:** **B**

Trong kiến trúc Centralized Egress + Inspection, NAT Gateway subnet route table phải có route cho các Spoke CIDRs trỏ về GWLBE (thay vì trỏ thẳng về TGW) để đảm bảo symmetric inspection cho cả chiều về.

- **A:** Spoke VPC không thể trỏ trực tiếp tới NAT Gateway nằm ở một VPC khác.
- **B (Đúng):** Chính xác. Mặc định, NAT Gateway subnet có route local cho VPC CIDR và route Spoke CIDR trỏ thẳng về TGW. Để ép traffic trả về từ NAT Gateway quay lại Firewall trước khi về Spoke, phải thêm route cho Spoke VPC CIDRs trỏ tới GWLBE trong cùng AZ.
- **C:** IGW Edge Route Table chỉ định tuyến các prefix thuộc VPC đó, không thể trỏ 0.0.0.0/0 hay định tuyến thẳng tới TGW.
- **D:** Traffic về Spoke phải đi qua Transit Gateway, không phải Internet Gateway.

</details>

### Câu 5 `hard`

A security team is deploying third-party virtual firewall appliances in a centralized inspection VPC to inspect all east-west traffic between 30 spoke VPCs connected via a Transit Gateway. The appliances must scale horizontally, preserve the original source and destination IP addresses, and receive encapsulated traffic without needing IPsec tunnels to the Transit Gateway. Which AWS service and protocol should be used?

- **A.** Deploy a Gateway Load Balancer (GWLB) using GENEVE (UDP 6081) with GWLB Endpoints in the inspection VPC subnets.
- **B.** Configure VPC Traffic Mirroring using VXLAN on UDP port 4789 to route East-West traffic inline through the firewall.
- **C.** Deploy a Network Load Balancer (NLB) with Proxy Protocol v2 enabled on TCP port 443 and IP-type target groups.
- **D.** Deploy an Application Load Balancer (ALB) in front of the firewall appliances using HTTP/2 and preserve client IP headers.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ bảo mật đang triển khai các thiết bị tường lửa ảo bên thứ ba trong một inspection VPC tập trung để kiểm tra mọi lưu lượng east-west giữa 30 spoke VPC kết nối qua Transit Gateway. Các thiết bị phải mở rộng theo chiều ngang, bảo toàn địa chỉ IP nguồn và đích gốc, và nhận lưu lượng được đóng gói mà không cần các đường hầm IPsec đến Transit Gateway. Nên sử dụng dịch vụ và giao thức AWS nào?

**Đáp án đúng:** **A**

Gateway Load Balancer (GWLB) sử dụng giao thức GENEVE (UDP port 6081) là kiến trúc tiêu chuẩn trên AWS để triển khai các thiết bị firewall bên thứ ba theo mô hình bump-in-the-wire (trong suốt, giữ nguyên IP gốc, tự động scale và health check).

- **A (Đúng):** Chính xác. Gateway Load Balancer (GWLB) đóng gói gói tin bằng giao thức GENEVE (UDP port 6081), giữ nguyên hoàn toàn IP nguồn/đích gốc và hỗ trợ scale ngang các firewall appliance thông qua GWLB Endpoint.
- **B:** Traffic Mirroring chỉ sao chép lưu lượng thụ động (out-of-band) để phân tích, không thể chặn hay kiểm tra inline.
- **C:** NLB không làm việc với transparent bump-in-the-wire firewall cho mọi giao thức IP và Proxy Protocol v2 chỉ áp dụng cho TCP.
- **D:** ALB chỉ hoạt động ở Layer 7 (HTTP/HTTPS) và thay đổi IP nguồn thành IP của ALB (trừ X-Forwarded-For), không thể kiểm tra lưu lượng Layer 3/4 tổng quát.

</details>

### Câu 6 `hard`

A security architect is designing a centralized inspection architecture using a Gateway Load Balancer (GWLB) and an Auto Scaling group of third-party firewall appliances in an Inspection VPC. Spoke VPCs connect via a Transit Gateway. To prevent asymmetric routing across Availability Zones, what routing and Transit Gateway configuration must be implemented?

- **A.** Deploy a GWLB Endpoint in each AZ, route TGW subnets in AZ-A to GWLBE-A (and AZ-B to GWLBE-B), and enable TGW Appliance Mode.
- **B.** Configure the GWLB target group to use IP-based targets with GENEVE disabled.
- **C.** Enable Cross-Zone Load Balancing on the GWLB without enabling Appliance Mode on the Transit Gateway attachment.
- **D.** Deploy a single GWLB Endpoint in AZ-A and route both AZ-A and AZ-B TGW attachment subnets through it to keep inspection flows symmetric.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiến trúc sư bảo mật đang thiết kế kiến trúc kiểm tra tập trung sử dụng Gateway Load Balancer (GWLB) và một Auto Scaling group gồm các thiết bị tường lửa bên thứ ba trong một Inspection VPC. Các Spoke VPC kết nối qua Transit Gateway. Để ngăn chặn định tuyến bất đối xứng giữa các Availability Zone, phải triển khai cấu hình định tuyến và Transit Gateway nào?

**Đáp án đúng:** **A**

Trong kiến trúc GWLB + Transit Gateway: luôn triển khai GWLB Endpoint theo từng AZ, cấu hình route table riêng cho từng AZ trong Inspection VPC để trỏ về GWLB Endpoint cùng AZ, và bắt buộc bật Appliance Mode trên TGW attachment của Inspection VPC.

- **A (Đúng):** Chính xác. Bật Appliance Mode trên TGW attachment của Inspection VPC đảm bảo TGW giữ toàn bộ flow đi và về trên cùng một AZ; đồng thời mỗi AZ trong Inspection VPC phải có GWLB Endpoint riêng để traffic trong AZ-A đi qua GWLB Endpoint AZ-A mà không bị đi chéo AZ.
- **B:** GWLB bắt buộc giao tiếp với firewall appliance qua giao thức GENEVE (UDP 6081), không thể tắt GENEVE.
- **C:** Nếu không bật Appliance Mode trên TGW, lưu lượng chiều về từ Spoke VPC ở AZ-B sẽ đi vào TGW attachment ở AZ-B, gặp một firewall appliance khác ở AZ-B chưa có trạng thái phiên (session state), dẫn đến drop gói tin.
- **D:** Dùng một GWLB Endpoint duy nhất ở AZ-A tạo ra single point of failure nếu AZ-A gặp sự cố và phát sinh chi phí truyền dữ liệu cross-AZ.

</details>

### Câu 7 `hard`

A large financial enterprise is deploying an AWS Cloud WAN core network with an inspection segment containing centralized AWS Network Firewall appliances in us-east-1 and eu-west-1. The enterprise wants all east-west traffic between `prod` and `non-prod` segments, as well as all outbound internet egress traffic, to be inspected by the regional firewalls without crossing Regions unnecessarily. Which TWO Cloud WAN core network policy features should be configured? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Configure `isolate-attachments: true` on the `inspection` network function group to drop all return packets.
- **B.** Define `network-function-groups` in the Cloud WAN core network policy containing the inspection VPC attachments in us-east-1 and eu-west-1.
- **C.** Configure `segment-actions` with `send-via` (for `prod`/`non-prod` east-west) and `send-to` (for 0.0.0.0/0 egress) using `network-function-groups`.
- **D.** Create a Transit Gateway Inter-Region Peering attachment between the Cloud WAN edge locations in us-east-1 and eu-west-1.
- **E.** Use VPC Peering between the `prod` segment VPCs and the `non-prod` segment VPCs to bypass the inspection segment.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp tài chính lớn đang triển khai mạng lõi AWS Cloud WAN với một inspection segment chứa các thiết bị AWS Network Firewall tập trung tại us-east-1 và eu-west-1. Doanh nghiệp muốn tất cả lưu lượng east-west giữa các segment `prod` và `non-prod`, cũng như tất cả lưu lượng đi ra internet (egress), đều được kiểm tra bởi các tường lửa theo Region mà không đi xuyên Region một cách không cần thiết. Nên cấu hình HAI tính năng core network policy của Cloud WAN nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, C**

AWS Cloud WAN Service Insertion đơn giản hóa việc chèn firewall tập trung (AWS Network Firewall hoặc GWLB) mà không cần tự quản lý bảng định tuyến phức tạp: khai báo `network-function-groups` cho các inspection VPCs và dùng `segment-actions` (`send-via` cho east-west, `send-to` cho egress).

- **A:** Cấu hình drop return packets sẽ làm gãy mọi kết nối.
- **B (Đúng):** Chính xác. Cloud WAN Service Insertion sử dụng `network-function-groups` để nhóm các Inspection VPC attachments (chứa firewall/GWLB) theo từng Region, giúp Cloud WAN tự động định tuyến traffic qua firewall gần nhất trong cùng Region.
- **C (Đúng):** Chính xác. Trong Cloud WAN Service Insertion, `send-via` định tuyến lưu lượng east-west giữa các segment đi qua Network Function Group (firewall) hai chiều đối xứng, còn `send-to` đẩy lưu lượng egress (0.0.0.0/0) tới Network Function Group.
- **D:** Cloud WAN tự động kết nối các core network edge toàn cầu mà không cần tạo Transit Gateway Inter-Region Peering.
- **E:** Đề bài yêu cầu tất cả lưu lượng giữa `prod` và `non-prod` phải đi qua kiểm tra (inspection), không được đi tắt.

</details>

### Câu 8 `hard`

A company deploys a centralized Inspection VPC containing AWS Network Firewall endpoints in two Availability Zones (AZ-A and AZ-B), attached to an AWS Transit Gateway. After routing East-West traffic between Spoke VPC-1 (in AZ-A) and Spoke VPC-2 (in AZ-B) through the Inspection VPC, TCP connections intermittently drop and stateful firewall logs show orphaned SYN-ACK packets. What is the root cause and fix?

- **A.** Asymmetric routing across Availability Zones on the Transit Gateway; enable Appliance Mode on the Inspection VPC Transit Gateway attachment.
- **B.** Enable Cross-Zone Load Balancing on the AWS Transit Gateway route table to keep traffic symmetric across Availability Zones.
- **C.** AWS Network Firewall does not support East-West VPC-to-VPC traffic inspection across Transit Gateway; migrate to AWS WAF.
- **D.** The Inspection VPC is missing an Internet Gateway; attach an Internet Gateway to synchronize stateful firewall sessions across Availability Zones.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty triển khai một Inspection VPC tập trung chứa các endpoint AWS Network Firewall tại hai Availability Zone (AZ-A và AZ-B), gắn vào một AWS Transit Gateway. Sau khi định tuyến lưu lượng East-West giữa Spoke VPC-1 (ở AZ-A) và Spoke VPC-2 (ở AZ-B) đi qua Inspection VPC, các kết nối TCP bị ngắt ngắt quãng và nhật ký tường lửa stateful hiển thị các gói SYN-ACK mồ côi (orphaned). Nguyên nhân gốc rễ và cách khắc phục là gì?

**Đáp án đúng:** **A**

Lỗi cực kỳ phổ biến trong bài thi ANS-C01: Stateful Firewall (Network Firewall hoặc GWLB) trong Inspection VPC bị drop gói tin ngẫu nhiên khi giao tiếp khác AZ do thiếu TGW Appliance Mode trên Inspection VPC Attachment.

- **A (Đúng):** Mặc định TGW giữ lưu lượng ở cùng AZ nguồn khi đi vào Inspection VPC (chiều đi qua AZ-A, chiều về từ VPC-2 lại đi qua AZ-B), khiến Stateful Firewall tại AZ-B thấy gói SYN-ACK mồ côi và drop. Bật TGW Appliance Mode trên Inspection VPC Attachment sẽ ép cả 2 chiều đi qua cùng 1 AZ.
- **B:** Transit Gateway route table không có thiết lập Cross-Zone Load Balancing; tính năng giữ đối xứng AZ trên TGW chính là Appliance Mode.
- **C:** AWS Network Firewall hỗ trợ đầy đủ cả East-West và North-South inspection; AWS WAF chỉ là L7 Web Firewall cho CloudFront/ALB/API Gateway.
- **D:** Internet Gateway không liên quan đến việc đồng bộ trạng thái giữa các Firewall Endpoint ở các AZ khác nhau.

</details>

### Câu 9 `medium`

A company must deploy its existing Palo Alto Networks next-generation firewall (NGFW) virtual appliances in AWS to transparently inspect inbound and outbound VPC traffic while preserving original client source IP addresses and supporting horizontal Auto Scaling. Which AWS load balancing architecture should be used?

- **A.** Application Load Balancer (ALB) with X-Forwarded-For headers enabled and Auto Scaling target groups for Palo Alto NGFWs.
- **B.** Network Load Balancer (NLB) with TCP passthrough, Proxy Protocol v2, and preserve client IP enabled in front of the NGFWs.
- **C.** Gateway Load Balancer (GWLB) using GENEVE encapsulation (UDP port 6081) paired with Gateway Load Balancer Endpoints (GWLBE) inserted into VPC Route Tables.
- **D.** Classic Load Balancer deployed in a centralized Transit VPC with IPsec VPN tunnels to the Palo Alto NGFW virtual appliances.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty phải triển khai các thiết bị ảo tường lửa thế hệ mới (NGFW) Palo Alto Networks hiện có trên AWS để kiểm tra minh bạch lưu lượng VPC đi vào và đi ra trong khi vẫn bảo toàn địa chỉ IP nguồn gốc của client và hỗ trợ Auto Scaling theo chiều ngang. Nên sử dụng kiến trúc cân bằng tải AWS nào?

**Đáp án đúng:** **C**

Gateway Load Balancer (GWLB) sử dụng GENEVE (UDP 6081) kết hợp GWLB Endpoint là kiến trúc chuẩn AWS để triển khai Third-Party NGFW Appliances có HA và Auto Scaling.

- **A:** ALB hoạt động ở Layer 7 (chỉ HTTP/HTTPS), làm proxy kết thúc kết nối và không thể hoạt động trong suốt ở Layer 3 (bump-in-the-wire) cho NGFW.
- **B:** NLB không hỗ trợ transparent Layer 3 routing cho tất cả giao thức (như ICMP/IPsec) và không tích hợp mô hình GWLB Endpoint để chèn vào Route Table.
- **C (Đúng):** GWLB hoạt động ở Layer 3/4 trong suốt (bump-in-the-wire), giữ nguyên IP nguồn/đích, đóng gói gói tin qua giao thức GENEVE (UDP 6081) tới cụm NGFW Auto Scaling và chèn dễ dàng vào Route Table bằng GWLB Endpoint.
- **D:** Mô hình Transit VPC cũ bằng IPsec bị giới hạn băng thông 1.25 Gbps/tunnel và Classic Load Balancer đã lỗi thời.

</details>

### Câu 10 `hard`

A security architect deploys AWS Network Firewall in a VPC that hosts an Internet-facing Application Load Balancer (ALB) in public subnets (10.1.10.0/24 and 10.1.20.0/24). Outbound traffic from the ALB is being inspected, but inbound requests from Internet clients are reaching the ALB directly without passing through the Network Firewall endpoints. What configuration is missing?

- **A.** A VPC Ingress Routing table on the IGW (Edge Association) routing 10.1.10.0/24 and 10.1.20.0/24 to the Network Firewall endpoints.
- **B.** Attaching the AWS Network Firewall endpoint directly to the Application Load Balancer HTTPS listener target group.
- **C.** Enabling Appliance Mode on the Internet Gateway edge association so inbound HTTP traffic routes symmetrically through the firewall.
- **D.** A VPC Security Group rule on the Application Load Balancer allowing inbound HTTPS traffic only from the Network Firewall ENI.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiến trúc sư bảo mật triển khai AWS Network Firewall trong một VPC lưu trữ một Application Load Balancer (ALB) hướng Internet trong các public subnet (10.1.10.0/24 và 10.1.20.0/24). Lưu lượng đi ra từ ALB đang được kiểm tra, nhưng các yêu cầu đi vào từ client trên Internet đang đi thẳng đến ALB mà không đi qua các endpoint Network Firewall. Cấu hình nào đang bị thiếu?

**Đáp án đúng:** **A**

VPC Ingress Routing (Edge Association trên Internet Gateway Route Table) là bước bắt buộc để chuyển hướng lưu lượng North-South Inbound từ Internet đi qua AWS Network Firewall hoặc GWLB Endpoint trước khi vào Public Subnet/ALB.

- **A (Đúng):** Để ép lưu lượng Inbound từ Internet Gateway (IGW) đi qua Network Firewall trước khi tới ALB, bắt buộc phải tạo Route Table gắn với IGW (Edge Association / Ingress Routing) trỏ CIDR của Public/ALB subnet về Firewall Endpoint.
- **B:** Network Firewall không gắn trực tiếp vào ALB listener (khác với AWS WAF); việc điều hướng lưu lượng qua Network Firewall luôn thực hiện qua VPC Route Tables.
- **C:** Appliance Mode chỉ tồn tại trên Transit Gateway VPC Attachment, không có trên Internet Gateway.
- **D:** Network Firewall hoạt động trong suốt (không gắn Security Group và không đổi source IP của client), nên không thể dùng SG để ép traffic đi qua Firewall hay lọc theo Firewall ENI.

</details>

---

[Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md)
