# Bài tập tình huống — AWS Network Firewall & Route 53 Resolver DNS Firewall

> Triển khai Stateless/Stateful Rule Groups (Suricata IPS, TLS Inspection, Domain Filtering) và chặn DNS Exfiltration/C2 với Route 53 Resolver DNS Firewall.
> **Số câu hỏi:** 12 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A security team configures AWS Network Firewall with both a Stateless Rule Group and a Stateful Rule Group (Strict Order). They want stateless rules to drop known malicious UDP traffic immediately, while forwarding HTTP/HTTPS traffic to the stateful engine for deep domain inspection. Which TWO configurations are required?

*(Chọn 2 đáp án)*

- **A.** Set the stateless default action (or a matching stateless rule) for TCP 80/443 traffic to Forward to stateful rule groups.
- **B.** Set the stateless rule action for TCP 80/443 traffic to Pass so it reaches the stateful engine.
- **C.** Set the stateless rule action for the malicious UDP traffic to Drop.
- **D.** Attach a Suricata-compatible rule inside the Stateless Rule Group for HTTP Host header inspection.
- **E.** Enable TLS Inspection on the Transit Gateway attachment.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ bảo mật cấu hình AWS Network Firewall với cả Stateless Rule Group và Stateful Rule Group (Strict Order). Họ muốn các quy tắc stateless loại bỏ ngay lập tức lưu lượng UDP độc hại đã biết, đồng thời chuyển tiếp lưu lượng HTTP/HTTPS đến bộ xử lý stateful để kiểm tra tên miền sâu. Cần cấu hình HAI thiết lập nào?

**Đáp án đúng:** **A, C**

Điểm bẫy kinh điển trong AWS Network Firewall: Stateless action `Pass` bỏ qua luôn Stateful engine, trong khi `Forward to stateful rule groups` mới đẩy gói tin sang Stateful engine.

- **A (Đúng):** Chính xác. Trong AWS Network Firewall, muốn gói tin đi vào Stateful engine kiểm tra domain/TLS thì Stateless engine bắt buộc phải dùng action 'Forward to stateful rule groups' (không dùng 'Pass', vì 'Pass' sẽ bỏ qua stateful engine luôn).
- **B:** Sai. Action 'Pass' trên stateless rule sẽ cho gói tin đi thẳng qua firewall và bỏ qua hoàn toàn stateful engine!
- **C (Đúng):** Chính xác. Action 'Drop' ở stateless engine sẽ chặn gói tin ngay lập tức mà không tốn tài nguyên đẩy sang stateful engine.
- **D:** Sai. Suricata rules và kiểm tra HTTP Host header thuộc Stateful Rule Group, không phải Stateless.
- **E:** Sai. TLS Inspection là tính năng cấu hình trên AWS Network Firewall Policy, không phải trên TGW attachment.

</details>

### Câu 2 `medium`

A company uses Route 53 Resolver DNS Firewall to block outbound DNS queries to known malware domains. During an internal audit, the compliance team requires that if the DNS Firewall service experiences an internal failure or timeout, all VPC DNS queries must be blocked rather than allowed through. Which setting should be configured?

- **A.** Change all Route 53 Resolver DNS Firewall rule group actions from BLOCK to ALERT during an outage.
- **B.** Set the DNS Firewall Rule Group priority to 1 so all outbound VPC DNS queries are blocked by default.
- **C.** Set Fail-Open to Disabled (Fail-Closed) on the Route 53 Resolver DNS Firewall association.
- **D.** Enable DNSSEC Validation on the VPC to block outbound DNS queries if the DNS Firewall fails.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty sử dụng Route 53 Resolver DNS Firewall để chặn các truy vấn DNS đi ra đến các tên miền phần mềm độc hại đã biết. Trong một cuộc kiểm toán nội bộ, đội ngũ tuân thủ yêu cầu rằng nếu dịch vụ DNS Firewall gặp lỗi nội bộ hoặc hết thời gian chờ, mọi truy vấn DNS của VPC phải bị chặn thay vì cho phép đi qua. Nên cấu hình thiết lập nào?

**Đáp án đúng:** **C**

Route 53 Resolver DNS Firewall cho phép chọn Fail-Open (ưu tiên availability) hoặc Fail-Closed (ưu tiên security — chặn mọi truy vấn nếu DNS Firewall không phản hồi).

- **A:** ALERT chỉ ghi log mà không chặn truy vấn.
- **B:** Priority chỉ quyết định thứ tự đánh giá giữa các rule group, không ảnh hưởng hành vi khi dịch vụ gặp lỗi.
- **C (Đúng):** Chính xác. Mặc định DNS Firewall có thể cấu hình Fail-Open (cho phép DNS query đi qua nếu service lỗi) hoặc Fail-Closed (tắt Fail-Open -> chặn toàn bộ DNS query khi service gặp sự cố để đảm bảo bảo mật tối đa).
- **D:** DNSSEC Validation kiểm tra tính toàn vẹn chữ ký DNS, không điều khiển hành vi fail-closed của DNS Firewall.

</details>

### Câu 3 `hard`

A company has remote branch offices in Asia connecting to an AWS Transit Gateway in us-east-1 via Site-to-Site VPN. Users report slow VPN throughput and high packet loss due to long-haul public internet routing. Which TWO actions improve VPN performance and encryption efficiency?

*(Chọn 2 đáp án)*

- **A.** Enable VPN Acceleration on a Virtual Private Gateway (VGW) attached directly to the VPC in us-east-1.
- **B.** Enable VPN Acceleration on the Site-to-Site VPN connection attached to the Transit Gateway.
- **C.** Disable Dead Peer Detection (DPD) on the Customer Gateway to prevent unnecessary IKE tunnel renegotiations.
- **D.** Switch from BGP dynamic routing to static routing on the VPN tunnels to double available tunnel bandwidth.
- **E.** Configure IKEv2 with AES-256-GCM encryption and DH Group 14 or higher on the VPN tunnels.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có các văn phòng chi nhánh từ xa tại châu Á kết nối đến AWS Transit Gateway tại us-east-1 qua Site-to-Site VPN. Người dùng báo cáo thông lượng VPN chậm và mất gói cao do định tuyến internet công cộng đường dài. HAI hành động nào cải thiện hiệu năng VPN và hiệu quả mã hóa?

**Đáp án đúng:** **B, E**

Accelerated Site-to-Site VPN (chỉ hoạt động với Transit Gateway) định tuyến lưu lượng IPsec qua AWS Global Accelerator, kết hợp với IKEv2 + AES-GCM giúp tối ưu độ ổn định và hiệu năng mã hóa.

- **A:** Sai. Accelerated Site-to-Site VPN chỉ hỗ trợ khi gắn vào Transit Gateway, không hỗ trợ Virtual Private Gateway (VGW).
- **B (Đúng):** Chính xác. Accelerated Site-to-Site VPN sử dụng AWS Global Accelerator để đưa traffic từ chi nhánh vào edge location gần nhất của AWS rồi đi trên backbone tới Transit Gateway, giảm hẳn jitter và packet loss.
- **C:** Sai. Tắt DPD làm chậm khả năng phát hiện tunnel chết khi failover, không cải thiện throughput.
- **D:** Sai. Static routing không làm tăng băng thông tunnel; để tăng băng thông cần bật ECMP trên TGW qua BGP.
- **E (Đúng):** Chính xác. AES-256-GCM vừa mã hóa vừa xác thực hiệu quả hơn CBC, giúp tăng thông lượng và đáp ứng chuẩn bảo mật hiện đại với IKEv2.

</details>

### Câu 4 `hard`

A healthcare enterprise uses AWS Network Firewall in a centralized inspection VPC to inspect outbound HTTPS traffic from private subnets. The security team wants to block outbound connections to unauthorized external domains based on the TLS Server Name Indication (SNI) and HTTP Host headers, while allowing access to `*.trustedpartner.com`. Which AWS Network Firewall configuration should be used?

- **A.** Create a stateless rule group matching TCP port 443, TLS SNI headers, and allowed destination domain names.
- **B.** Create a stateful rule group using Domain List filtering (or Suricata rules) allowing `.trustedpartner.com`.
- **C.** Enable AWS WAF on the AWS Network Firewall endpoint.
- **D.** Configure a Security Group on the Network Firewall endpoints to allow outbound HTTPS only to `.trustedpartner.com`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp y tế sử dụng AWS Network Firewall trong một inspection VPC tập trung để kiểm tra lưu lượng HTTPS đi ra từ các private subnet. Đội ngũ bảo mật muốn chặn các kết nối đi ra đến các tên miền bên ngoài trái phép dựa trên TLS Server Name Indication (SNI) và HTTP Host header, trong khi cho phép truy cập vào `*.trustedpartner.com`. Nên sử dụng cấu hình AWS Network Firewall nào?

**Đáp án đúng:** **B**

AWS Network Firewall sử dụng Stateful Rule Groups (dạng Domain List hoặc Suricata IPS rules) để kiểm tra tên miền dựa trên HTTP Host header và TLS SNI cho lưu lượng đi ra ngoài.

- **A:** Stateless rule group chỉ kiểm tra 5-tuple (IP nguồn/đích, port, protocol), không thể kiểm tra sâu tên miền (SNI hoặc HTTP Host header).
- **B (Đúng):** Chính xác. Stateful rule group trong AWS Network Firewall hỗ trợ Domain List (kiểm tra HTTP Host và TLS SNI) cũng như Suricata rules để lọc tên miền ở Layer 7.
- **C:** AWS WAF không thể gắn vào AWS Network Firewall endpoint (WAF gắn vào CloudFront, ALB, API Gateway, AppSync).
- **D:** Security Groups không hỗ trợ gán vào Gateway Load Balancer / Network Firewall endpoints và cũng không lọc theo tên miền.

</details>

### Câu 5 `medium`

A security engineer wants to prevent EC2 instances in all VPCs from resolving known malware command-and-control (C2) domains and block DNS tunneling attempts using AmazonProvidedDNS. The solution must require no agents on the EC2 instances and integrate natively with AWS Organizations. Which service should the engineer implement?

- **A.** Amazon Route 53 Resolver DNS Firewall with AWS-managed domain lists, shared via AWS RAM.
- **B.** AWS WAF with the Amazon IP Reputation List rule group attached to the VPC.
- **C.** AWS Network Firewall configured with stateless rules on UDP port 53.
- **D.** VPC Network ACLs blocking outbound UDP port 53 to 169.254.169.253.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư bảo mật muốn ngăn chặn các EC2 instance trong tất cả các VPC phân giải các tên miền điều khiển và ra lệnh (C2) của phần mềm độc hại đã biết và chặn các nỗ lực DNS tunneling sử dụng AmazonProvidedDNS. Giải pháp không được yêu cầu cài đặt agent trên các EC2 instance và phải tích hợp gốc với AWS Organizations. Kỹ sư nên triển khai dịch vụ nào?

**Đáp án đúng:** **A**

Vì truy vấn DNS tới AmazonProvidedDNS (.2) không đi qua đường định tuyến subnet thông thường (nên AWS Network Firewall không chặn được), Route 53 Resolver DNS Firewall là dịch vụ duy nhất kiểm soát và lọc tên miền ngay tại tầng DNS Resolver của VPC.

- **A (Đúng):** Chính xác. Route 53 Resolver DNS Firewall lọc các truy vấn DNS đi qua AmazonProvidedDNS (.2) của VPC, tích hợp sẵn các AWS Managed Domain Lists (chống malware/botnet) và có thể quản lý tập trung qua AWS Firewall Manager / RAM.
- **B:** AWS WAF không gắn trực tiếp vào VPC để lọc DNS outbound của EC2.
- **C:** Lưu lượng từ EC2 tới AmazonProvidedDNS (.2) đi thẳng nội bộ trong VPC tới Route 53 Resolver, không đi qua VPC route table tới AWS Network Firewall.
- **D:** NACL là stateless ở ranh giới subnet và nếu chặn toàn bộ UDP 53 thì các instance sẽ không thể phân giải bất kỳ tên miền hợp lệ nào.

</details>

### Câu 6 `medium`

A company hosts a web application on EC2 instances behind an Application Load Balancer (ALB) in a VPC. The security team wants to ensure that all traffic to the ALB must come exclusively through Amazon CloudFront, bypassing any direct access to the ALB's public IP addresses. Which approach requires the LEAST operational effort?

- **A.** Configure an AWS Lambda function triggered by SNS notifications on AWS IP range updates to rewrite ALB Security Group inbound rules.
- **B.** Enable AWS Shield Standard on the ALB and configure listener rules to block all non-CloudFront User-Agent headers.
- **C.** Use the CloudFront managed prefix list in the ALB Security Group and validate a custom secret header in an ALB listener rule.
- **D.** Move the Application Load Balancer to a private subnet and attach a NAT Gateway in front of it for CloudFront.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ một ứng dụng web trên các EC2 instance phía sau một Application Load Balancer (ALB) trong một VPC. Đội ngũ bảo mật muốn đảm bảo rằng mọi lưu lượng đến ALB phải đi qua độc quyền thông qua Amazon CloudFront, loại bỏ mọi truy cập trực tiếp đến các địa chỉ IP công cộng của ALB. Cách tiếp cận nào đòi hỏi ÍT nỗ lực vận hành NHẤT?

**Đáp án đúng:** **C**

Kết hợp AWS-managed Prefix List cho CloudFront (`com.amazonaws.global.cloudfront.origin-facing`) trong Security Group của ALB (hạn chế IP nguồn) và kiểm tra Custom HTTP Header bí mật trên ALB Listener Rule (hạn chế đúng distribution) là giải pháp ít tốn công vận hành nhất.

- **A:** Việc tự viết Lambda cập nhật Security Group tốn công sức vận hành và dễ chạm giới hạn số lượng rule của Security Group vì CloudFront có rất nhiều dải IP.
- **B:** User-Agent rất dễ bị giả mạo và Shield Standard không có tính năng lọc HTTP header.
- **C (Đúng):** Chính xác. Sử dụng AWS-managed prefix list của CloudFront trong Security Group giúp AWS tự động cập nhật danh sách IP origin-facing của CloudFront, kết hợp với custom header trên ALB listener để ngăn chặn các distribution CloudFront của tài khoản khác truy cập vào ALB.
- **D:** CloudFront không thể kết nối trực tiếp tới ALB nằm trong private subnet thông qua NAT Gateway (trừ khi dùng CloudFront VPC Origins).

</details>

### Câu 7 `hard`

A healthcare company is deploying AWS Network Firewall in a centralized Inspection VPC. Compliance mandates that the firewall must decrypt and inspect outbound HTTPS traffic (TLS 1.2/1.3) from internal EC2 instances to external APIs, and block any payloads containing unencrypted patient Social Security Numbers (SSNs). Which AWS Network Firewall feature must be configured?

- **A.** Attach an Application Load Balancer in front of AWS Network Firewall to terminate outbound TLS connections.
- **B.** Enable TLS Inspection using an AWS-managed public ACM certificate for `*.amazonaws.com` on the AWS Network Firewall policy.
- **C.** Use Stateless Rule Groups to inspect the encrypted HTTPS payload directly for SSNs without TLS decryption.
- **D.** Configure a TLS Inspection Configuration on Network Firewall with a CA imported into ACM, and install the root CA on EC2 instances.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty y tế đang triển khai AWS Network Firewall trong một Inspection VPC tập trung. Quy định tuân thủ bắt buộc tường lửa phải giải mã và kiểm tra lưu lượng HTTPS đi ra (TLS 1.2/1.3) từ các EC2 instance nội bộ đến các API bên ngoài, và chặn mọi payload chứa số An sinh Xã hội (SSN) chưa được mã hóa của bệnh nhân. Phải cấu hình tính năng nào của AWS Network Firewall?

**Đáp án đúng:** **D**

AWS Network Firewall TLS Inspection hỗ trợ cả Inbound (dùng server certificate trong ACM) và Outbound (dùng Subordinate CA certificate trong ACM để thực hiện TLS forward proxy decryption, yêu cầu client EC2 tin tưởng Root CA).

- **A:** ALB không làm outbound forward proxy để giải mã lưu lượng đi ra Internet cho EC2.
- **B:** Không thể dùng public ACM certificate cho outbound forward proxy để giải mã mọi domain bên ngoài; bắt buộc phải dùng private CA (ACM PCA hoặc CA tự ký nhập vào ACM).
- **C:** Không thể đọc nội dung payload (như SSN) bên trong gói tin HTTPS nếu không giải mã TLS.
- **D (Đúng):** Chính xác. AWS Network Firewall hỗ trợ TLS Inspection cho lưu lượng outbound (SSL forward proxy) bằng cách sử dụng một CA certificate lưu trong ACM để ký động chứng chỉ giả lập cho các domain bên ngoài; các EC2 instance cần tin tưởng root CA này để không báo lỗi TLS.

</details>

### Câu 8 `hard`

A company has two AWS Site-to-Site VPN connections connecting its on-premises data center to an AWS Transit Gateway. Corporate security policy requires end-to-end encryption using AES-256-GCM, SHA-256 integrity, Diffie-Hellman Group 20, IKEv2, and mandates that AWS must never initiate the IKE negotiation (the on-premises router is behind a NAT device and must act as the initiator). How should the VPN connection be configured?

- **A.** Configure the Site-to-Site VPN tunnel options with IKEv2, AES256-GCM-16, SHA2-256, DH Group 20, and set Startup Action to `add` on the AWS side.
- **B.** Enable MACsec encryption on the Site-to-Site VPN tunnel options with IKEv2 and AES-256-GCM to enforce responder-only negotiation.
- **C.** Configure IKEv2, AES256-GCM-16, SHA2-256, and DH Group 20, and set Startup Action to `start` on the AWS VPN tunnel options.
- **D.** Configure the Site-to-Site VPN tunnel options with IKEv1 Aggressive Mode, Pre-Shared Key, DH Group 2, and Startup Action set to `add`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có hai kết nối AWS Site-to-Site VPN kết nối trung tâm dữ liệu tại chỗ đến một AWS Transit Gateway. Chính sách bảo mật doanh nghiệp yêu cầu mã hóa đầu-cuối bằng AES-256-GCM, toàn vẹn SHA-256, Diffie-Hellman Group 20, IKEv2 và bắt buộc AWS không bao giờ được khởi tạo quá trình thương lượng IKE (router tại chỗ nằm sau thiết bị NAT và phải đóng vai trò là bên khởi tạo). Kết nối VPN nên được cấu hình như thế nào?

**Đáp án đúng:** **A**

AWS Site-to-Site VPN cho phép tùy chỉnh chi tiết Tunnel Options: IKE version (IKEv2), thuật toán mã hóa (AES-256-GCM), DH Group (20), và Startup Action (`add` để AWS chỉ làm responder, `start` để AWS chủ động khởi tạo).

- **A (Đúng):** Chính xác. Trên AWS Site-to-Site VPN, `Startup Action = add` khiến AWS ở trạng thái lắng nghe (responder) và chỉ đợi phía on-premises chủ động khởi tạo kết nối IKEv2, phù hợp khi thiết bị on-premises nằm sau NAT.
- **B:** MACsec là mã hóa Layer 2 dành riêng cho Direct Connect Dedicated, không tồn tại trên Site-to-Site VPN.
- **C:** `start` khiến AWS chủ động khởi tạo IKE, điều này sẽ thất bại nếu thiết bị on-premises nằm sau NAT hoặc policy cấm AWS khởi tạo.
- **D:** IKEv1 và DH Group 2 yếu hơn về mặt bảo mật và không đáp ứng yêu cầu IKEv2 + DH Group 20 của đề bài.

</details>

### Câu 9 `hard`

An enterprise uses AWS Network Firewall in a centralized Inspection VPC with a firewall policy that contains both Stateless and Stateful rule groups. The security engineer notices that TCP packets matching a `Pass` rule in the Stateless rule group are never evaluated by the Stateful Domain List rule group, allowing users to bypass domain filtering. What is the cause and how should the engineer fix it?

- **A.** The engineer must set the Stateful rule evaluation order to `Action Order` so it overrides the Stateless `Pass` action in the Network Firewall policy.
- **B.** Stateful rule groups always run before Stateless rule groups, so the Domain List must be misconfigured.
- **C.** Stateless rule groups cannot be used in the same firewall policy as Stateful rule groups.
- **D.** A `Pass` action in a Stateless rule skips the Stateful engine; change the Stateless rule action from `Pass` to `Forward to stateful rule groups`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp sử dụng AWS Network Firewall trong một Inspection VPC tập trung với firewall policy chứa cả Stateless và Stateful rule group. Kỹ sư bảo mật nhận thấy các gói TCP khớp với quy tắc `Pass` trong Stateless rule group không bao giờ được đánh giá bởi Stateful Domain List rule group, cho phép người dùng vượt qua bộ lọc tên miền. Nguyên nhân là gì và kỹ sư nên khắc phục như thế nào?

**Đáp án đúng:** **D**

Luồng xử lý của AWS Network Firewall: Gói tin đi vào Stateless Engine trước. Action `Pass` cho phép đi thẳng ra ngoài (bỏ qua Stateful); Action `Forward to stateful rule groups` (hoặc default action set là `aws:forward_to_sfe`) mới đẩy gói tin vào Stateful Engine.

- **A:** Nếu gói tin đã bị Stateless `Pass` cho qua thì nó không bao giờ chạm tới Stateful engine, dù Stateful đặt chế độ `Action Order` hay `Strict Order`.
- **B:** Stateless engine luôn chạy TRƯỚC Stateful engine.
- **C:** Một Firewall Policy kết hợp bình thường cả Stateless và Stateful rule groups.
- **D (Đúng):** Chính xác. Trong AWS Network Firewall, Stateless engine chạy trước: nếu khớp `Pass` hoặc `Drop`, gói tin được cho qua hoặc hủy ngay lập tức mà KHÔNG đi vào Stateful engine. Để chuyển gói tin sang kiểm tra Layer 7 ở Stateful engine, phải dùng action `Forward to stateful rule groups`.

</details>

### Câu 10 `medium`

A company wants to ensure that all data transferred between its Amazon EC2 instances in a VPC and an Amazon S3 bucket never traverses the public internet, and that only requests originating from a specific VPC (`vpc-0123456789abcdef0`) and belonging to the company's AWS Organization (`o-abc1234567`) can read objects from the bucket. Which combination of controls enforces this?

- **A.** Enable AWS PrivateLink on the Internet Gateway and add a VPC Route Table entry for S3.
- **B.** Deploy an S3 Gateway VPC Endpoint with an Endpoint Policy restricting `aws:PrincipalOrgID`, and an S3 Bucket Policy checking `aws:SourceVpc`.
- **C.** Route S3 traffic through a NAT Gateway and restrict the S3 Bucket Policy to the NAT Gateway's public Elastic IP address.
- **D.** Configure a Security Group on the S3 bucket allowing inbound HTTPS from the VPC CIDR.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty muốn đảm bảo mọi dữ liệu truyền giữa các Amazon EC2 instance trong một VPC và một Amazon S3 bucket không bao giờ đi qua internet công cộng, và chỉ các yêu cầu xuất phát từ một VPC cụ thể (`vpc-0123456789abcdef0`) và thuộc về AWS Organization của công ty (`o-abc1234567`) mới có thể đọc đối tượng từ bucket. Sự kết hợp các biện pháp kiểm soát nào thực thi điều này?

**Đáp án đúng:** **B**

Kiến trúc truy cập S3 an toàn và riêng tư chuẩn trên AWS: sử dụng S3 Gateway VPC Endpoint (miễn phí, đi nội bộ AWS) kết hợp VPC Endpoint Policy (giới hạn `aws:PrincipalOrgID`) và S3 Bucket Policy (giới hạn `aws:SourceVpc` hoặc `aws:SourceVpce`).

- **A:** Không có tính năng bật PrivateLink trên Internet Gateway.
- **B (Đúng):** Chính xác. S3 Gateway VPC Endpoint giữ toàn bộ lưu lượng trên mạng nội bộ AWS. Kết hợp Endpoint Policy (giới hạn `aws:PrincipalOrgID` tránh data exfiltration sang bucket ngoài) và S3 Bucket Policy (kiểm tra `aws:SourceVpc` / `aws:SourceVpce`) đảm bảo bảo mật hai chiều.
- **C:** Đi qua NAT Gateway và Internet Gateway khiến traffic đi qua public internet endpoint của S3 thay vì nội bộ VPC Endpoint.
- **D:** Amazon S3 là dịch vụ managed không gắn được Security Group.

</details>

### Câu 11 `hard`

A security team is hardening an Amazon Route 53 Resolver DNS Firewall deployment across 40 VPCs in AWS Organizations. The team wants to prevent DNS exfiltration via newly registered or unknown domains while still allowing access to approved business domains, and wants to alert the SOC team whenever a blocked query occurs without breaking existing applications during the initial 2-week rollout. Which TWO actions should the team take? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Set `Fail Open` to disabled on the DNS Firewall configuration so that if DNS Firewall experiences an internal service disruption, all VPCs stop resolving internal AWS services.
- **B.** Create a rule group with a high-priority `ALLOW` rule for approved domains, and a lower-priority `BLOCK` (or `ALERT`) rule for `*` or threat lists.
- **C.** Configure the DNS Firewall rule group in `ALERT` mode during the 2-week rollout to log matching queries to Route 53 Resolver Query Logs before switching the action to `BLOCK`.
- **D.** Enable DNSSEC signing on the Route 53 Resolver Outbound Endpoint.
- **E.** Deploy an AWS Network Firewall inline in front of 169.254.169.253 to intercept and filter AmazonProvidedDNS queries.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ bảo mật đang tăng cường cấu hình triển khai Amazon Route 53 Resolver DNS Firewall trên 40 VPC trong AWS Organizations. Đội ngũ muốn ngăn chặn việc tuồn dữ liệu qua DNS thông qua các tên miền mới đăng ký hoặc chưa biết trong khi vẫn cho phép truy cập các tên miền kinh doanh đã được phê duyệt, và muốn cảnh báo cho đội ngũ SOC bất cứ khi nào có truy vấn bị chặn mà không làm gián đoạn các ứng dụng hiện có trong giai đoạn triển khai 2 tuần đầu tiên. Đội ngũ nên thực hiện HAI hành động nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, C**

Khi triển khai Route 53 Resolver DNS Firewall theo mô hình zero-trust/walled-garden: (1) dùng `ALERT` mode + Query Logging trong giai đoạn thử nghiệm để tránh gián đoạn ứng dụng, và (2) xếp rule `ALLOW` (priority nhỏ) trước rule `BLOCK` `*` (priority lớn).

- **A:** Tắt Fail Open (tức là Fail Closed) sẽ làm gián đoạn toàn bộ hệ thống khi có sự cố dịch vụ DNS Firewall, trái với yêu cầu không làm gãy ứng dụng đang chạy.
- **B (Đúng):** Chính xác. Mô hình walled-garden (chỉ cho phép domain được duyệt) dùng rule ưu tiên cao (priority thấp) `ALLOW` cho danh sách domain hợp lệ và rule ưu tiên thấp (priority cao) `BLOCK` cho `*`, kết hợp với AWS Managed Domain Lists.
- **C (Đúng):** Chính xác. Route 53 Resolver DNS Firewall hỗ trợ action `ALERT` cho phép lưu lượng đi qua bình thường nhưng vẫn ghi log vào Resolver Query Logs, giúp SOC kiểm tra tác động trước khi chuyển sang `BLOCK`.
- **D:** Outbound Endpoint không làm nhiệm vụ ký DNSSEC và DNSSEC không chống được DNS exfiltration.
- **E:** Lưu lượng tới AmazonProvidedDNS (.2 / 169.254.169.253) không đi qua VPC route table nên AWS Network Firewall không thể chặn được.

</details>

### Câu 12 `hard`

A regulated healthcare enterprise requires all outbound HTTPS traffic from 30 Spoke VPCs to be filtered based on allowed Fully Qualified Domain Names (FQDNs) such as *.hl7-partner.org, without deploying or managing third-party virtual firewall appliances and without configuring SSL/TLS decryption certificates. Which AWS solution meets these requirements with the LEAST operational effort?

- **A.** Configure VPC Security Groups on all EC2 instances with stateful outbound rules specifying the allowed partner FQDNs.
- **B.** Use AWS WAF Web ACLs attached directly to the NAT Gateway in the centralized Egress VPC to filter outbound TLS SNI domains.
- **C.** Deploy AWS Network Firewall in a centralized Egress/Inspection VPC with a Stateful Domain List rule group inspecting TLS Server Name Indication (SNI).
- **D.** Deploy a Gateway Load Balancer in the Inspection VPC with an Auto Scaling group of third-party NGFW EC2 virtual appliances.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp y tế chịu sự quản lý chặt chẽ yêu cầu mọi lưu lượng HTTPS đi ra từ 30 Spoke VPC phải được lọc dựa trên các Fully Qualified Domain Names (FQDNs) được phép như *.hl7-partner.org, mà không cần triển khai hay quản lý thiết bị tường lửa ảo bên thứ ba và không cần cấu hình chứng chỉ giải mã SSL/TLS. Giải pháp AWS nào đáp ứng các yêu cầu này với ÍT nỗ lực vận hành NHẤT?

**Đáp án đúng:** **C**

AWS Network Firewall Stateful Domain List kiểm tra trực tiếp TLS SNI (cho HTTPS) và HTTP Host header (cho HTTP), cho phép lọc outbound theo FQDN hoàn toàn managed mà không cần cấu hình TLS Decryption.

- **A:** Security Groups chỉ hỗ trợ địa chỉ IP/CIDR, Prefix List hoặc Security Group ID khác; không hỗ trợ lọc theo FQDN.
- **B:** AWS WAF không thể gắn vào NAT Gateway và không dùng để lọc outbound egress traffic từ VPC.
- **C (Đúng):** AWS Network Firewall là dịch vụ managed hỗ trợ Stateful Domain List rule group, cho phép lọc outbound HTTPS theo FQDN bằng cách kiểm tra trường TLS SNI (và HTTP Host) mà không cần giải mã TLS hay quản lý appliance bên thứ ba.
- **D:** Đề bài yêu cầu rõ không triển khai hay quản lý third-party virtual firewall appliances.

</details>

---

[Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md)
