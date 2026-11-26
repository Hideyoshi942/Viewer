# Bài tập tình huống — Chủ đề 6: Định tuyến Toàn cầu & Mạng Phức hợp — Transit Gateway, Route 53, CloudFront & Global Accelerator

> AWS Transit Gateway vs VPC Peering, Route 53 Routing Policies (Failover, Latency, Geolocation, Weighted), CloudFront OAC & AWS Global Accelerator.
> **Số câu hỏi:** 12 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A global online multiplayer gaming company runs UDP game servers on Network Load Balancers across four AWS Regions. Players complain about jitter, packet loss over the public internet, and slow DNS failover when a Region becomes unhealthy. Furthermore, corporate firewalls at partner e-sports venues require whitelisting a maximum of two fixed IPv4 addresses. Which AWS service solves ALL of these requirements?

- **A.** Amazon CloudFront
- **B.** AWS Global Accelerator
- **C.** Amazon S3 Transfer Acceleration
- **D.** VPC Peering

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty trò chơi trực tuyến nhiều người chơi toàn cầu chạy các máy chủ trò chơi UDP trên Network Load Balancer tại bốn AWS Region. Người chơi phàn nàn về độ trễ dao động (jitter), mất gói tin qua internet công cộng và DNS failover chậm khi một Region gặp sự cố. Hơn nữa, tường lửa doanh nghiệp tại các địa điểm e-sports đối tác yêu cầu chỉ đưa vào danh sách cho phép (whitelist) tối đa hai địa chỉ IPv4 cố định. Dịch vụ AWS nào giải quyết TẤT CẢ các yêu cầu này?

**Đáp án đúng:** **B**

Từ khóa vàng của **AWS Global Accelerator**: `UDP / non-HTTP gaming/VoIP`, `2 static Anycast IP addresses for whitelisting`, `fast regional failover without DNS caching issues`.

- **A:** Sai vì CloudFront chỉ hỗ trợ giao thức HTTP/HTTPS (không hỗ trợ UDP cho game server) và không cung cấp 2 địa chỉ IP tĩnh mặc định.
- **B (Đúng):** Đúng! **AWS Global Accelerator** cung cấp **2 địa chỉ Anycast Static IPv4 cố định**, hỗ trợ cả **TCP và UDP**, đưa lưu lượng vào mạng trục AWS ngay từ Edge gần nhất để giảm jitter, và tự động failover giữa các Region dưới 1 phút không phụ thuộc bộ nhớ đệm DNS của client.
- **C:** Sai vì S3 Transfer Acceleration chỉ dùng để tải tệp lên/xuống S3 bucket.
- **D:** Sai vì VPC Peering chỉ kết nối nội bộ giữa 2 VPC chứ không phục vụ người chơi từ ngoài Internet.

</details>

### Câu 2 `medium`

An enterprise has 120 VPCs across multiple AWS accounts and 3 on-premises data centers. Previously, the network team used VPC Peering, which resulted in thousands of complex mesh connections and route table entries. How can the solutions architect simplify the network topology into a central hub-and-spoke model that supports transitive routing?

- **A.** Enable transitive routing across the existing full-mesh VPC Peering connections and propagate routes via BGP.
- **B.** Create 120 NAT Gateways in a centralized shared-services VPC and route inter-VPC traffic through Elastic IP addresses.
- **C.** Deploy an AWS Transit Gateway, share it via AWS RAM, and attach all VPCs and on-premises VPN/Direct Connect connections to it.
- **D.** Use Amazon CloudFront distributions with custom origin access controls to route private RFC 1918 traffic between VPCs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp có 120 VPC trên nhiều AWS account và 3 trung tâm dữ liệu on-premises. Trước đây, nhóm mạng đã sử dụng VPC Peering, dẫn đến hàng nghìn kết nối mạng lưới (mesh) và các mục route table phức tạp. Làm thế nào solutions architect có thể đơn giản hóa cấu trúc mạng thành mô hình hub-and-spoke tập trung hỗ trợ transitive routing?

**Đáp án đúng:** **C**

Khi đề bài có **nhiều VPC (hàng chục/hàng trăm VPC) + On-premises** và muốn **tránh phức tạp của Full-Mesh VPC Peering / cần Transitive Routing** -> Chọn ngay **AWS Transit Gateway**.

- **A:** Sai vì VPC Peering KHÔNG BAO GIỜ hỗ trợ định tuyến bắc cầu (non-transitive).
- **B:** Sai vì NAT Gateway chỉ dùng để cho phép Private Subnet đi ra Internet chứ không định tuyến giữa 120 VPC.
- **C (Đúng):** Đúng! **AWS Transit Gateway** kết hợp **AWS RAM** cho phép gom hàng nghìn VPC đa tài khoản và kết nối On-premises về một mô hình Hub-and-Spoke trung tâm có định tuyến bắc cầu (Transitive Routing).
- **D:** Sai vì CloudFront là mạng CDN công cộng chứ không phải bộ định tuyến VPC nội bộ.

</details>

### Câu 3 `medium`

A company has a hybrid cloud setup with an AWS Direct Connect connection between its on-premises data center and a VPC. On-premises servers need to resolve private DNS names in an Amazon Route 53 Private Hosted Zone, and EC2 instances in the VPC need to resolve internal DNS names hosted on on-premises Active Directory DNS servers. Which TWO resources must be configured? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** A Route 53 Resolver Inbound Endpoint in the VPC for on-premises servers to query AWS private DNS.
- **B.** A Route 53 Public Hosted Zone configured with Geolocation routing policies for internal domains.
- **C.** An AWS Global Accelerator endpoint configured with Anycast static IP addresses for DNS traffic.
- **D.** A Route 53 Resolver Outbound Endpoint and Forwarding Rules to forward queries to on-premises DNS servers.
- **E.** A Gateway VPC Endpoint associated with the private subnets for Amazon Route 53 private resolution.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có hệ thống hybrid cloud với kết nối AWS Direct Connect giữa trung tâm dữ liệu on-premises và một VPC. Các máy chủ on-premises cần phân giải tên DNS nội bộ trong một Amazon Route 53 Private Hosted Zone, và các EC2 instance trong VPC cần phân giải tên DNS nội bộ được lưu trữ trên các máy chủ DNS Active Directory on-premises. HAI tài nguyên nào phải được cấu hình? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, D**

Hybrid DNS 2 chiều giữa On-premises và VPC luôn dùng cặp **Route 53 Resolver Inbound Endpoint** (On-prem -> AWS) và **Outbound Endpoint** (AWS -> On-prem).

- **A (Đúng):** Đúng! **Inbound Endpoint** nhận truy vấn DNS từ mạng On-premises đi vào Route 53 Resolver trên AWS.
- **B:** Sai vì tên miền nội bộ không nên đưa lên Public Hosted Zone.
- **C:** Sai vì Global Accelerator dùng để tăng tốc traffic TCP/UDP, không dùng cho phân giải DNS nội bộ.
- **D (Đúng):** Đúng! **Outbound Endpoint + Forwarding Rules** chuyển tiếp truy vấn DNS từ EC2 trong VPC ra DNS server ở On-premises.
- **E:** Sai vì Gateway VPC Endpoint chỉ hỗ trợ S3 và DynamoDB.

</details>

### Câu 4 `medium`

A global company has deployed an Application Load Balancer (ALB) in front of EC2 instances across three AWS Regions (`us-east-1`, `eu-west-1`, `ap-southeast-1`). An enterprise client requires two static IP addresses to whitelist in their corporate firewall, and the application uses custom UDP protocols for real-time IoT telemetry. Which AWS service should the solutions architect place in front of the regional endpoints?

- **A.** Amazon CloudFront
- **B.** Amazon Route 53 Latency-Based Routing
- **C.** AWS Global Accelerator
- **D.** AWS Direct Connect

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty toàn cầu đã triển khai Application Load Balancer (ALB) phía trước các EC2 instance tại ba AWS Region (`us-east-1`, `eu-west-1`, `ap-southeast-1`). Một khách hàng doanh nghiệp yêu cầu hai địa chỉ IP tĩnh để đưa vào danh sách cho phép (whitelist) trong tường lửa công ty, và ứng dụng sử dụng các giao thức UDP tùy chỉnh cho dữ liệu đo từ xa IoT theo thời gian thực. Solutions architect nên đặt dịch vụ AWS nào phía trước các regional endpoint?

**Đáp án đúng:** **C**

Từ khóa **2 static IP addresses**, **UDP/TCP non-HTTP**, **instant failover < 1 minute** → **AWS Global Accelerator**.

- **A:** Sai vì CloudFront không cấp 2 Static IP cố định và chỉ hỗ trợ HTTP/HTTPS (không hỗ trợ UDP).
- **B:** Sai vì Route 53 trả về DNS (không cấp 2 Static IP cố định cho cả 3 Region để whitelist firewall).
- **C (Đúng):** Đúng! **AWS Global Accelerator** cấp **2 địa chỉ Anycast Static IP cố định**, hỗ trợ cả **TCP và UDP**, và định tuyến qua mạng trục AWS tới Region gần/khỏe nhất với thời gian failover < 1 phút.
- **D:** Sai vì Direct Connect là kết nối cáp quang từ 1 datacenter cố định, không phục vụ khách hàng toàn cầu qua Internet.

</details>

### Câu 5 `medium`

A streaming media company must comply with strict content licensing laws requiring that users located in France only access content served from the `eu-west-3` (Paris) Region, while users in Germany are routed to `eu-central-1` (Frankfurt). Which Amazon Route 53 routing policy enforces this requirement?

- **A.** Latency routing policy
- **B.** Weighted routing policy
- **C.** Multivalue Answer routing policy
- **D.** Geolocation routing policy

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty truyền thông phát trực tuyến phải tuân thủ luật cấp phép nội dung nghiêm ngặt yêu cầu người dùng tại Pháp chỉ truy cập nội dung được phục vụ từ Region `eu-west-3` (Paris), trong khi người dùng tại Đức được định tuyến đến `eu-central-1` (Frankfurt). Chính sách định tuyến (routing policy) nào của Amazon Route 53 thực thi yêu cầu này?

**Đáp án đúng:** **D**

Yêu cầu **tuân thủ pháp lý / bản quyền theo quốc gia** → Luôn chọn **Route 53 Geolocation routing policy**.

- **A:** Sai vì Latency routing chỉ chọn Region có độ trễ thấp nhất; một người dùng ở biên giới Pháp có thể bị route sang Frankfurt nếu mạng nhanh hơn, vi phạm luật bản quyền.
- **B:** Sai vì Weighted chia traffic theo tỷ lệ %, không phân biệt quốc gia.
- **C:** Sai vì Multivalue Answer trả về tối đa 8 IP ngẫu nhiên, không định tuyến theo quốc gia.
- **D (Đúng):** Đúng! **Geolocation routing policy** định tuyến chính xác dựa trên **vị trí địa lý (Quốc gia/Châu lục)** của người dùng, hoàn hảo cho bài toán tuân thủ pháp lý và bản quyền.

</details>

### Câu 6 `medium`

A company has 30 VPCs across 3 AWS accounts and 2 on-premises data centers connected via Site-to-Site VPN and AWS Direct Connect. The network team needs a scalable hub-and-spoke topology that supports transitive routing between all VPCs and on-premises networks with centralized route management. Which service should they deploy?

- **A.** Full-mesh VPC Peering across all 30 VPCs
- **B.** AWS Transit Gateway
- **C.** AWS PrivateLink
- **D.** AWS Global Accelerator

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có 30 VPC trên 3 AWS account và 2 trung tâm dữ liệu on-premises được kết nối qua Site-to-Site VPN và AWS Direct Connect. Nhóm mạng cần một cấu trúc hub-and-spoke có khả năng mở rộng, hỗ trợ transitive routing giữa tất cả các VPC và mạng on-premises với khả năng quản lý định tuyến tập trung. Họ nên triển khai dịch vụ nào?

**Đáp án đúng:** **B**

Kết nối **nhiều VPC (≥ 3) + On-premises** theo mô hình **Hub-and-Spoke** → **AWS Transit Gateway**.

- **A:** Sai vì VPC Peering cho 30 VPC cần tới `30*29/2 = 435` kết nối và KHÔNG hỗ trợ transitive routing từ on-premises.
- **B (Đúng):** Đúng! **AWS Transit Gateway** là bộ định tuyến trung tâm theo mô hình **Hub-and-Spoke**, hỗ trợ transitive routing giữa hàng chục/hàng nghìn VPC và kết nối Hybrid (VPN/Direct Connect).
- **C:** Sai vì PrivateLink chỉ phơi bày dịch vụ đơn lẻ qua NLB, không làm bộ định tuyến mạng tổng thể cho 30 VPC.
- **D:** Sai vì Global Accelerator dùng cho lưu lượng từ người dùng Internet vào AWS, không kết nối mạng nội bộ giữa các VPC.

</details>

### Câu 7 `medium`

A company hosts a high-traffic media streaming web application behind an Application Load Balancer (ALB) and Amazon S3 in `us-east-1`. Monthly AWS bills show high Data Transfer Out charges from S3 and EC2 to users worldwide, as well as high NAT Gateway data processing charges when EC2 instances fetch objects from S3. Which TWO solutions will reduce these data transfer costs? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Place Amazon CloudFront in front of the ALB and S3 bucket to cache content at edge locations.
- **B.** Replace the Gateway VPC Endpoint with a paid Interface VPC Endpoint (AWS PrivateLink) for Amazon S3.
- **C.** Move the EC2 instances into public subnets with Elastic IPs and serve media directly without CloudFront.
- **D.** Enable S3 Cross-Region Replication (CRR) on the media bucket to replicate objects to all AWS Regions.
- **E.** Create a Gateway VPC Endpoint for Amazon S3 and associate it with the private subnet route tables.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ một ứng dụng web phát trực tuyến truyền thông lưu lượng cao phía sau Application Load Balancer (ALB) và Amazon S3 tại `us-east-1`. Hóa đơn AWS hàng tháng cho thấy chi phí Data Transfer Out từ S3 và EC2 tới người dùng toàn cầu rất cao, cũng như chi phí xử lý dữ liệu qua NAT Gateway cao khi các EC2 instance lấy object từ S3. HAI giải pháp nào sẽ giảm các chi phí truyền dữ liệu này? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, E**

2 cách giảm chi phí Data Transfer kinh điển nhất trong SAA-C03: (1) **CloudFront** giảm Data Transfer Out ra Internet; (2) **Gateway VPC Endpoint** loại bỏ phí NAT Gateway tới S3/DynamoDB.

- **A (Đúng):** Đúng! Truyền dữ liệu từ **S3/ALB ra CloudFront là miễn phí ($0)**, và giá Data Transfer Out từ CloudFront ra Internet rẻ hơn từ S3/EC2 (lại giảm số request về Origin nhờ caching).
- **B:** Sai vì Interface VPC Endpoint tốn phí theo giờ và phí xử lý dữ liệu ($0.01/GB), đắt hơn Gateway VPC Endpoint ($0).
- **C:** Sai vì việc chuyển sang public subnet không giảm giá Data Transfer Out ra Internet và làm giảm bảo mật.
- **D:** Sai vì CRR làm tăng gấp nhiều lần chi phí lưu trữ S3 và tốn thêm phí nhân bản dữ liệu xuyên Region.
- **E (Đúng):** Đúng! **Gateway VPC Endpoint for S3** hoàn toàn miễn phí và giúp traffic từ EC2 Private tới S3 đi trực tiếp trong mạng AWS, loại bỏ hoàn toàn phí xử lý **$0.045/GB của NAT Gateway**.

</details>

### Câu 8 `medium`

A company is expanding its AWS footprint and currently manages 35 VPCs across multiple AWS accounts in the same Region, along with an on-premises data center connected via AWS Direct Connect. All VPCs and the on-premises network must be able to communicate with each other in a hub-and-spoke topology that is easy to scale. Which networking service should the solutions architect recommend?

- **A.** Full-mesh VPC Peering connections
- **B.** AWS Transit Gateway
- **C.** AWS PrivateLink
- **D.** AWS Global Accelerator

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty đang mở rộng quy mô trên AWS và hiện quản lý 35 VPC trên nhiều AWS account trong cùng một Region, cùng với một trung tâm dữ liệu on-premises kết nối qua AWS Direct Connect. Tất cả các VPC và mạng on-premises phải có thể giao tiếp với nhau theo cấu trúc hub-and-spoke dễ mở rộng. Solutions architect nên đề xuất dịch vụ mạng nào?

**Đáp án đúng:** **B**

Khi có nhiều VPC (từ vài chục trở lên) cần kết nối với nhau và với mạng on-premises theo mô hình **hub-and-spoke** -> Đáp án chuẩn là **AWS Transit Gateway**.

- **A:** Sai vì với 35 VPCs, số lượng kết nối peering full-mesh sẽ lên tới n*(n-1)/2 = 595 kết nối, cực kỳ khó quản lý và VPC Peering không hỗ trợ transitive routing tới on-premises.
- **B (Đúng):** Đúng! AWS Transit Gateway đóng vai trò bộ định tuyến trung tâm (hub-and-spoke), cho phép kết nối hàng nghìn VPC và mạng on-premises (qua Direct Connect Gateway / VPN) một cách dễ dàng và không cần thiết lập full-mesh peering.
- **C:** Sai vì PrivateLink dùng để expose một dịch vụ cụ thể (qua NLB) sang VPC khác theo hướng đơn chiều, không dùng làm mạng lưới định tuyến toàn bộ giữa 35 VPCs và on-premises.
- **D:** Sai vì Global Accelerator tối ưu hóa lưu lượng người dùng từ Internet tới endpoints toàn cầu qua Anycast IP, không kết nối nội bộ các VPC và on-premises.

</details>

### Câu 9 `medium`

A global company runs identical web applications in `us-east-1`, `eu-west-1`, and `ap-southeast-1`. The solutions architect wants to use Amazon Route 53 so that users are always directed to the Region that provides the lowest network latency, AND if a Region becomes unhealthy, traffic is automatically routed to the next-best healthy Region. Which TWO configurations are required? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Create Route 53 Latency-based routing records for each Region's Application Load Balancer.
- **B.** Use Route 53 Geolocation routing records mapped to each user's continent or country.
- **C.** Configure Route 53 Health Checks (or enable `Evaluate Target Health`) for each regional endpoint.
- **D.** Configure Route 53 Simple routing with multiple regional IP addresses in a single DNS record.
- **E.** Use Route 53 Weighted routing with equal weights of 33 across all three regional endpoints.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty toàn cầu chạy các ứng dụng web giống hệt nhau tại `us-east-1`, `eu-west-1` và `ap-southeast-1`. Solutions architect muốn sử dụng Amazon Route 53 để người dùng luôn được điều hướng tới Region có độ trễ mạng thấp nhất, VÀ nếu một Region gặp sự cố, lưu lượng sẽ tự động được định tuyến tới Region khỏe mạnh tốt tiếp theo. Cần HAI cấu hình nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, C**

Phân biệt Route 53 Routing Policies: **Latency** = độ trễ thấp nhất; **Geolocation** = theo quốc gia/châu lục; **Failover** = Active-Passive; **Weighted** = chia tải % (A/B testing). Kết hợp **Health Check / Evaluate Target Health** để tự động failover.

- **A (Đúng):** Đúng! Route 53 Latency Routing Policy tự động đo và điều hướng người dùng tới Region có độ trễ mạng thấp nhất.
- **B:** Sai vì Geolocation định tuyến dựa trên vị trí địa lý (quốc gia/châu lục) để tuân thủ bản quyền/luật pháp, không đảm bảo độ trễ mạng thấp nhất như Latency routing.
- **C (Đúng):** Đúng! Để Route 53 tự động loại bỏ Region bị lỗi và chuyển hướng sang Region khỏe mạnh tiếp theo, bắt buộc phải bật Health Check hoặc Evaluate Target Health trên Alias record.
- **D:** Sai vì Simple routing không hỗ trợ Health Checks và trả về ngẫu nhiên danh sách IP không tối ưu độ trễ.
- **E:** Sai vì Weighted routing chia tải theo tỷ lệ phần trăm chứ không chọn Region có độ trễ thấp nhất cho từng người dùng.

</details>

### Câu 10 `medium`

A media company delivers premium paid video content stored in a private Amazon S3 bucket through an Amazon CloudFront distribution. Users must only be able to download videos through CloudFront, never directly via the S3 bucket URL, and CloudFront must restrict access to paid subscribers using time-limited URLs. Which configuration satisfies these requirements?

- **A.** Enable S3 Static Website Hosting on the bucket and generate S3 Pre-signed URLs behind CloudFront.
- **B.** Make the S3 bucket public-read and rely on an AWS WAF Web ACL on CloudFront to authenticate subscribers.
- **C.** Configure CloudFront Origin Access Control (OAC) for S3 and use CloudFront Signed URLs for paid subscribers.
- **D.** Attach an IAM Role directly to the CloudFront distribution to read private objects and disable HTTPS.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty truyền thông phân phối nội dung video trả phí cao cấp được lưu trữ trong một Amazon S3 bucket riêng tư thông qua Amazon CloudFront distribution. Người dùng chỉ được phép tải video qua CloudFront, tuyệt đối không được truy cập trực tiếp qua URL của S3 bucket, và CloudFront phải giới hạn quyền truy cập cho người đăng ký trả phí bằng các URL có thời hạn. Cấu hình nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **C**

Bảo vệ S3 chỉ cho phép đi qua CloudFront -> **Origin Access Control (OAC)** (thế hệ mới thay cho OAI). Phân phối file qua CloudFront cho người dùng trả phí có thời hạn -> **CloudFront Signed URLs / Signed Cookies**.

- **A:** Sai vì S3 Static Website Hosting yêu cầu bucket phải public (không chặn được truy cập trực tiếp S3) và không hỗ trợ OAC.
- **B:** Sai vì người dùng có thể bypass CloudFront để tải trực tiếp từ S3 bucket public.
- **C (Đúng):** Đúng! Origin Access Control (OAC) đảm bảo chỉ CloudFront mới có quyền đọc từ S3 bucket (chặn truy cập trực tiếp S3). CloudFront Signed URLs giúp phân phối nội dung trả phí có thời hạn cho từng file.
- **D:** Sai vì CloudFront không gắn IAM Role trực tiếp mà dùng OAC/OAI kết hợp S3 Bucket Policy.

</details>

### Câu 11 `hard`

A company has a web application deployed in an active-passive architecture across two AWS Regions: `us-east-1` (Primary) and `us-west-2` (Secondary). The company wants Amazon Route 53 to send 100% of user traffic to `us-east-1` under normal conditions, and automatically redirect all traffic to `us-west-2` only if the primary Application Load Balancer fails a health check. Which Route 53 routing policy should be configured?

- **A.** Latency routing policy
- **B.** Geolocation routing policy
- **C.** Failover routing policy
- **D.** Multivalue Answer routing policy

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có ứng dụng web được triển khai theo kiến trúc active-passive trên hai AWS Region: `us-east-1` (Chính) và `us-west-2` (Phụ). Công ty muốn Amazon Route 53 gửi 100% lưu lượng người dùng tới `us-east-1` trong điều kiện bình thường, và chỉ tự động chuyển hướng toàn bộ lưu lượng sang `us-west-2` nếu Application Load Balancer chính không vượt qua kiểm tra sức khỏe (health check). Nên cấu hình chính sách định tuyến Route 53 nào?

**Đáp án đúng:** **C**

Kiến trúc **Active-Passive DR** với Route 53 -> Dùng **Failover Routing Policy** (Primary record + Health Check, Secondary record).

- **A:** Sai vì Latency routing gửi traffic tới cả hai Region tùy theo vị trí người dùng (Active-Active), không giữ `us-west-2` ở trạng thái passive hoàn toàn.
- **B:** Sai vì Geolocation định tuyến dựa trên vị trí địa lý của người dùng chứ không phải mô hình Active-Passive toàn cầu.
- **C (Đúng):** Đúng! Route 53 Failover Routing Policy được thiết kế chuyên biệt cho kiến trúc Active-Passive, sử dụng bản ghi Primary (kèm Health Check) và bản ghi Secondary chỉ nhận traffic khi Primary không khỏe mạnh.
- **D:** Sai vì Multivalue Answer trả về nhiều IP khỏe mạnh ngẫu nhiên (tối đa 8 bản ghi) cho client, không phân biệt Primary/Secondary.

</details>

### Câu 12 `medium`

A financial firm runs a real-time trading application behind a load balancer. Third-party banking partners require two static IP addresses per Availability Zone to whitelist in their corporate firewalls, and the application uses a custom binary TCP protocol on port 9443 that requires preserving the original client IP address. Which TWO load balancing/networking configurations should the solutions architect choose? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Use a Network Load Balancer (NLB) listening on TCP port 9443.
- **B.** Use an Application Load Balancer (ALB) listening on custom binary TCP port 9443.
- **C.** Enable `X-Forwarded-For` HTTP header inspection on the NLB to preserve the client IP.
- **D.** Associate Elastic IPs with NLB subnets or place AWS Global Accelerator in front for static Anycast IPs.
- **E.** Use Amazon CloudFront in front of the custom binary TCP port 9443 trading endpoint.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty tài chính vận hành ứng dụng giao dịch thời gian thực phía sau một load balancer. Các đối tác ngân hàng bên thứ ba yêu cầu hai địa chỉ IP tĩnh trên mỗi Availability Zone để đưa vào danh sách cho phép trong tường lửa công ty, và ứng dụng sử dụng giao thức TCP nhị phân tùy chỉnh trên cổng 9443 yêu cầu giữ nguyên địa chỉ IP gốc của client. Solutions architect nên chọn HAI cấu hình cân bằng tải/mạng nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, D**

Khi thấy các từ khóa: **Layer 4 / TCP / UDP**, **Static IP / Elastic IP**, **Whitelist IP**, **Extreme performance / sub-millisecond**, **Preserve Client IP** -> Đáp án luôn là **Network Load Balancer (NLB)** (hoặc kết hợp **AWS Global Accelerator** để lấy 2 Anycast IP tĩnh toàn cầu).

- **A (Đúng):** Đúng! Network Load Balancer (NLB) hoạt động ở Layer 4 (TCP/UDP/TLS), hỗ trợ các giao thức TCP tùy biến trên port 9443, cung cấp 1 IP tĩnh mỗi AZ (hỗ trợ gắn Elastic IP) và giữ nguyên Client IP mặc định.
- **B:** Sai vì ALB chỉ hỗ trợ HTTP/HTTPS/gRPC (Layer 7), không hỗ trợ giao thức binary TCP tùy biến và không có IP tĩnh.
- **C:** Sai vì `X-Forwarded-For` là HTTP header (Layer 7) do ALB chèn vào; NLB hoạt động ở Layer 4 nên giữ nguyên Source IP ở tầng gói tin TCP (hoặc Proxy Protocol v2).
- **D (Đúng):** Đúng! NLB cho phép gán Elastic IP cố định cho từng AZ (hoặc dùng Global Accelerator để có 2 static Anycast IP toàn cầu) giúp đối tác ngân hàng dễ dàng whitelist.
- **E:** Sai vì CloudFront chỉ hỗ trợ lưu lượng HTTP/HTTPS, không hỗ trợ raw binary TCP trên port 9443.

</details>

---

[Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md)
