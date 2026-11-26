# Bài tập tình huống — AWS WAF, Shield Advanced, Direct Connect MACsec & Transit Encryption

> Bảo vệ Layer 3/4/7 với AWS Shield Advanced và AWS WAF, mã hóa Layer 2 MACsec trên Direct Connect và IPsec over Direct Connect Public VIF.
> **Số câu hỏi:** 9 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A defense contractor requires Layer 2 wire-speed encryption between their on-premises router and AWS Direct Connect endpoint for a dedicated 10 Gbps connection, without adding IPsec header overhead that reduces the effective MTU. Which solution meets this requirement?

- **A.** Enable IEEE 802.1AE MACsec on the dedicated Direct Connect connection using a CKN and CAK stored in AWS Secrets Manager.
- **B.** Configure an AWS Site-to-Site IPsec VPN over a Public VIF on the 10 Gbps Direct Connect connection without reducing MTU.
- **C.** Request a 10 Gbps Hosted Connection from an AWS Direct Connect Partner with MACsec encryption enabled end-to-end on the AWS side.
- **D.** Enable TLS 1.3 wire-speed encryption directly on the AWS Direct Connect Gateway for Layer 2 links.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà thầu quốc phòng yêu cầu mã hóa tốc độ đường truyền ở Layer 2 giữa router tại chỗ của họ và endpoint AWS Direct Connect cho kết nối dedicated 10 Gbps, mà không thêm chi phí phụ trội tiêu đề IPsec làm giảm MTU hiệu dụng. Giải pháp nào đáp ứng yêu cầu này?

**Đáp án đúng:** **A**

MACsec (IEEE 802.1AE) cung cấp mã hóa Layer 2 trực tiếp từ thiết bị on-premises tới thiết bị Direct Connect của AWS trên Dedicated Connections (10G/100G/400G) với CKN/CAK.

- **A (Đúng):** Chính xác. Direct Connect hỗ trợ MACsec (IEEE 802.1AE) mã hóa ở Layer 2 với tốc độ đường truyền (10 Gbps / 100 Gbps) trên Dedicated Connection, cấu hình bằng CKN/CAK lưu trong AWS Secrets Manager.
- **B:** IPsec VPN chạy ở Layer 3, giới hạn băng thông mỗi tunnel (~1.25 Gbps) và làm giảm đáng kể MTU.
- **C:** MACsec trên AWS Direct Connect chỉ hỗ trợ cho Dedicated Connections (10 Gbps, 100 Gbps, 400 Gbps), không hỗ trợ trên Hosted Connections.
- **D:** Direct Connect Gateway không có tính năng mã hóa TLS 1.3.

</details>

### Câu 2 `medium`

An e-commerce company experiences frequent Layer 7 HTTP flood DDoS attacks targeting its CloudFront distribution and Application Load Balancers. They want AWS to automatically create and deploy AWS WAF rate-limiting rules during an active attack without manual intervention, and provide 24/7 access to the AWS Shield Response Team (SRT). What should they implement?

- **A.** Use Amazon GuardDuty to automatically detect and block attacking Layer 7 HTTP flood IPs in the VPC Network ACL.
- **B.** Subscribe to AWS Shield Advanced, associate the CloudFront distribution and ALBs, and enable Automatic Application Layer DDoS Mitigation.
- **C.** Rely on AWS Shield Standard combined with CloudFront Geo Restriction and manual rate-based rules.
- **D.** Enable AWS Network Firewall directly on the Amazon CloudFront distribution edge locations for Layer 7 filtering.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty thương mại điện tử thường xuyên gặp các cuộc tấn công DDoS HTTP flood Layer 7 nhắm vào CloudFront distribution và các Application Load Balancer của mình. Họ muốn AWS tự động tạo và triển khai các quy tắc giới hạn tốc độ (rate-limiting) trên AWS WAF trong khi cuộc tấn công đang diễn ra mà không cần can thiệp thủ công, đồng thời cung cấp quyền tiếp cận 24/7 với AWS Shield Response Team (SRT). Họ nên triển khai gì?

**Đáp án đúng:** **B**

AWS Shield Advanced + Automatic Application Layer DDoS Mitigation + AWS WAF là bộ giải pháp toàn diện nhất của AWS để tự động chống DDoS Layer 7 và nhận hỗ trợ từ SRT.

- **A:** GuardDuty là dịch vụ phát hiện mối đe dọa, không tự động mitigate DDoS Layer 7 trên CloudFront.
- **B (Đúng):** Chính xác. AWS Shield Advanced cung cấp quyền truy cập 24/7 tới SRT và tính năng Automatic Application Layer DDoS Mitigation tự động sinh/áp dụng rule AWS WAF (count hoặc block) khi phát hiện tấn công Layer 7.
- **C:** Shield Standard chỉ bảo vệ miễn phí ở Layer 3/4 cơ bản, không có SRT và không tự động tạo WAF rule ở Layer 7.
- **D:** AWS Network Firewall bảo vệ lưu lượng trong VPC, không gắn trực tiếp vào CloudFront distribution.

</details>

### Câu 3 `hard`

A financial institution is connecting its on-premises data center to AWS over two 10 Gbps dedicated AWS Direct Connect connections. Compliance regulations mandate Layer 2 hop-by-hop encryption between the customer's edge router and the AWS Direct Connect endpoint router, without using IPsec VPN tunnels over the connections. How should the institution meet this requirement?

- **A.** Enable TLS 1.3 encryption directly on the BGP session between the customer edge router and the Direct Connect Gateway.
- **B.** Provision Hosted Connections from an AWS Direct Connect Partner with Layer 2 MACsec encryption enabled at 500 Mbps.
- **C.** Enable AWS KMS envelope encryption on the Transit VIF attached to the Direct Connect Gateway for Layer 2 links.
- **D.** Enable MACsec (IEEE 802.1AE) on the dedicated connections with a CKN and CAK stored in AWS Secrets Manager.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức tài chính đang kết nối trung tâm dữ liệu tại chỗ của mình với AWS qua hai kết nối AWS Direct Connect dedicated 10 Gbps. Quy định tuân thủ bắt buộc mã hóa từng chặng (hop-by-hop) ở Layer 2 giữa router biên của khách hàng và router endpoint AWS Direct Connect, mà không sử dụng các đường hầm IPsec VPN trên các kết nối. Tổ chức nên đáp ứng yêu cầu này như thế nào?

**Đáp án đúng:** **D**

MACsec (IEEE 802.1AE) cung cấp mã hóa Layer 2 tốc độ dây (wire-speed) cho kết nối AWS Direct Connect Dedicated (10 Gbps / 100 Gbps) mà không làm giảm MTU nhiều như IPsec, sử dụng cặp CKN/CAK lưu trữ trong AWS Secrets Manager.

- **A:** BGP không chạy mã hóa dữ liệu data plane bằng TLS 1.3; BGP chỉ có thể dùng TCP MD5 authentication cho control plane.
- **B:** MACsec trên AWS Direct Connect chỉ hỗ trợ kết nối Dedicated (10 Gbps và 100 Gbps), không hỗ trợ Hosted Connections.
- **C:** Không có tính năng bật KMS encryption trực tiếp lên Transit VIF để mã hóa đường truyền.
- **D (Đúng):** Chính xác. AWS Direct Connect hỗ trợ MACsec (IEEE 802.1AE) ở tốc độ 10 Gbps và 100 Gbps trên kết nối Dedicated, thực hiện mã hóa Layer 2 giữa router khách hàng và router AWS thông qua cặp khóa CKN/CAK lưu trên AWS Secrets Manager.

</details>

### Câu 4 `hard`

An e-commerce company runs its public storefront behind Amazon CloudFront and an Application Load Balancer (ALB). During a major sales event, the site experiences a volumetric UDP reflection DDoS attack as well as an HTTP flood targeting the checkout API. The company needs automated 24/7 DDoS Response Team (DRT) support, DDoS cost protection, and automatic Layer 7 mitigation rules deployed to AWS WAF without manual intervention. Which combination of services meets these requirements?

- **A.** Use Amazon GuardDuty Runtime Monitoring to automatically block attacking DDoS IP addresses in VPC Network ACLs without AWS WAF.
- **B.** Enable AWS Shield Standard on CloudFront and configure CloudWatch alarms for NetworkIn DDoS spikes.
- **C.** Subscribe to AWS Shield Advanced on CloudFront and enable Automatic Application Layer DDoS Mitigation with AWS WAF.
- **D.** Deploy AWS Network Firewall in front of Amazon CloudFront to drop volumetric UDP reflection DDoS traffic.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty thương mại điện tử vận hành cửa hàng trực tuyến công cộng phía sau Amazon CloudFront và một Application Load Balancer (ALB). Trong một sự kiện bán hàng lớn, trang web gặp cuộc tấn công DDoS khuếch đại UDP theo lưu lượng lớn cũng như tấn công HTTP flood nhắm vào API thanh toán. Công ty cần hỗ trợ 24/7 từ DDoS Response Team (DRT), bảo vệ chi phí DDoS và các quy tắc giảm thiểu Layer 7 tự động được triển khai lên AWS WAF mà không cần can thiệp thủ công. Sự kết hợp dịch vụ nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **C**

AWS Shield Advanced kết hợp với AWS WAF trên CloudFront cung cấp giải pháp chống DDoS toàn diện từ Layer 3/4 tới Layer 7 (Automatic Application Layer DDoS Mitigation), đi kèm quyền truy cập đội phản ứng SRT 24/7 và chính sách hoàn phí khi bị tấn công.

- **A:** GuardDuty chỉ phát hiện mối đe dọa chứ không tự động chặn DDoS Layer 7 trên CloudFront hay cung cấp DDoS cost protection.
- **B:** Shield Standard không có hỗ trợ DRT 24/7, không có bảo vệ chi phí DDoS (cost protection) và không tự động tạo rule WAF Layer 7.
- **C (Đúng):** Chính xác. AWS Shield Advanced cung cấp bảo vệ DDoS nâng cao, hỗ trợ SRT/DRT 24/7, bảo vệ chi phí scale do DDoS, và tính năng Automatic Application Layer DDoS Mitigation sẽ tự động tạo/cập nhật rule trên AWS WAF khi phát hiện HTTP flood.
- **D:** Không thể đặt AWS Network Firewall trước CloudFront (CloudFront là dịch vụ edge toàn cầu của AWS).

</details>

### Câu 5 `hard`

A global enterprise has 120 AWS accounts managed by AWS Organizations and wants to enforce uniform network security governance across all accounts. Specifically, the enterprise must automatically deploy AWS Network Firewall into every newly created VPC, ensure all CloudFront distributions have a baseline AWS WAF Web ACL attached, and enforce VPC Security Group rules that prohibit 0.0.0.0/0 on SSH (port 22). Which TWO AWS services should be used together to automate and enforce these policies? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** AWS Firewall Manager to centrally deploy and manage AWS Network Firewall, AWS WAF policies, and Security Group compliance policies across AWS Organizations.
- **B.** Amazon Inspector to automatically deploy AWS Network Firewall into newly created VPCs across all accounts.
- **C.** AWS Direct Connect Gateway to centrally enforce VPC Security Group SSH compliance rules across all 120 accounts.
- **D.** AWS Transit Gateway Network Manager to push baseline AWS WAF Web ACLs to CloudFront distributions.
- **E.** AWS Config enabled across all member accounts in AWS Organizations (a prerequisite for AWS Firewall Manager).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp toàn cầu có 120 tài khoản AWS được quản lý bởi AWS Organizations và muốn thực thi quản trị bảo mật mạng đồng nhất trên tất cả các tài khoản. Cụ thể, doanh nghiệp phải tự động triển khai AWS Network Firewall vào mọi VPC mới tạo, đảm bảo tất cả các CloudFront distribution đều gắn một AWS WAF Web ACL cơ sở và thực thi quy tắc VPC Security Group cấm 0.0.0.0/0 trên SSH (cổng 22). Nên sử dụng kết hợp HAI dịch vụ AWS nào để tự động hóa và thực thi các chính sách này? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, E**

AWS Firewall Manager là dịch vụ quản trị bảo mật mạng tập trung cho AWS Organizations (quản lý WAF, Shield Advanced, Network Firewall, DNS Firewall và Security Groups). Điều kiện tiên quyết bắt buộc để Firewall Manager hoạt động là phải bật AWS Config trên các tài khoản thành viên.

- **A (Đúng):** Chính xác. AWS Firewall Manager tích hợp với AWS Organizations để tự động áp đặt chính sách AWS WAF, AWS Network Firewall, Shield Advanced, DNS Firewall và kiểm soát Security Group trên toàn bộ các tài khoản/VPC mới tạo.
- **B:** Amazon Inspector là dịch vụ quét lỗ hổng bảo mật trên EC2/ECR/Lambda, không triển khai hạ tầng mạng hay firewall.
- **C:** Direct Connect Gateway chỉ dùng để định tuyến kết nối lai, không có chức năng kiểm soát Security Group.
- **D:** Network Manager dùng để quản lý hạ tầng mạng TGW/Cloud WAN, không quản lý AWS WAF hay CloudFront.
- **E (Đúng):** Chính xác. AWS Firewall Manager yêu cầu bật AWS Config trên tất cả các tài khoản thành viên trong Organization để phát hiện tài nguyên mới và đánh giá sự tuân thủ.

</details>

### Câu 6 `medium`

A financial application running behind an Application Load Balancer (ALB) is protected by AWS WAF. The security team wants to block any single client IP address that sends more than 2,000 requests within a 5-minute window to the `/login` URI, and also wants to block requests originating from specific sanctioned countries. Which AWS WAF rule configuration meets these requirements with minimal effort?

- **A.** Enable AWS Shield Standard on the ALB and configure custom URI rate limits.
- **B.** Configure a VPC Network ACL to dynamically block IPs exceeding 2,000 requests per 5 minutes.
- **C.** Create a Rate-based rule with a limit of 2,000 requests per 5 minutes scoped to the `/login` URI path, and a Geo match rule blocking the sanctioned country codes.
- **D.** Use an AWS Network Firewall stateless rule to inspect the `/login` URI and country codes.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng tài chính chạy phía sau một Application Load Balancer (ALB) được bảo vệ bởi AWS WAF. Đội ngũ bảo mật muốn chặn bất kỳ địa chỉ IP client đơn lẻ nào gửi hơn 2.000 yêu cầu trong khung thời gian 5 phút tới URI `/login`, đồng thời muốn chặn các yêu cầu xuất phát từ các quốc gia bị trừng phạt cụ thể. Cấu hình quy tắc AWS WAF nào đáp ứng các yêu cầu này với nỗ lực tối thiểu?

**Đáp án đúng:** **C**

AWS WAF cung cấp sẵn Rate-based rules (hỗ trợ scope-down theo URI path, header, v.v.) để chống brute-force/HTTP flood và Geo match rules để chặn lưu lượng theo quốc gia.

- **A:** Shield Standard bảo vệ L3/L4 cơ bản và không cho phép cấu hình rate limit theo URI `/login` hay Geo match.
- **B:** NACL không có tính năng rate limiting hay đếm số request HTTP.
- **C (Đúng):** Chính xác. AWS WAF Rate-based rule hỗ trợ đếm số request theo IP trong cửa sổ 5 phút (kết hợp scope-down statement lọc riêng URI `/login`), và Geo match statement tự động chặn theo quốc gia dựa trên IP.
- **D:** Stateless rule của Network Firewall chỉ lọc L3/L4 (IP/Port), không đọc được URI `/login` hay GeoIP.

</details>

### Câu 7 `hard`

A bank operates a 10 Gbps Dedicated AWS Direct Connect link between its data center and an AWS Direct Connect location. Compliance mandates Layer 2 encryption on the physical fiber link between the bank's colocation router and the AWS Direct Connect router without degrading the 10 Gbps line-rate throughput or introducing IPsec tunnel overhead. Which encryption mechanism should be implemented?

- **A.** TLS 1.3 mutual authentication configured directly on the AWS Direct Connect Gateway for physical fiber encryption.
- **B.** Private IP Site-to-Site IPsec VPN configured over a Direct Connect Transit VIF without MACsec key rotation.
- **C.** AWS Direct Connect MACsec (IEEE 802.1AE) using a Connectivity Association Key (CAK) and Key Name (CKN) stored in AWS Secrets Manager.
- **D.** Site-to-Site IPsec VPN tunnels configured over a Direct Connect Public VIF with ECMP enabled for 10 Gbps line-rate throughput without MTU reduction.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ngân hàng vận hành một liên kết Dedicated AWS Direct Connect 10 Gbps giữa trung tâm dữ liệu của mình và một vị trí AWS Direct Connect. Quy định tuân thủ bắt buộc mã hóa Layer 2 trên liên kết cáp quang vật lý giữa router tại colocation của ngân hàng và router AWS Direct Connect mà không làm suy giảm thông lượng tốc độ đường truyền 10 Gbps hay phát sinh chi phí phụ trội của đường hầm IPsec. Nên triển khai cơ chế mã hóa nào?

**Đáp án đúng:** **C**

Khi yêu cầu mã hóa Layer 2 point-to-point trên đường truyền Direct Connect 10G/100G ở tốc độ line-rate mà không muốn overhead của IPsec → chọn Direct Connect MACsec (IEEE 802.1AE).

- **A:** Direct Connect Gateway không cấu hình TLS 1.3 cho đường truyền vật lý.
- **B:** Private IP VPN vẫn là IPsec Layer 3 (giới hạn 1.25 Gbps/tunnel và có IPsec overhead), không phải mã hóa Layer 2 line-rate.
- **C (Đúng):** Direct Connect MACsec (IEEE 802.1AE) cung cấp mã hóa Layer 2 point-to-point ở tốc độ line-rate (không giảm băng thông 10 Gbps, không có overhead IPsec), hỗ trợ trên các cổng 10 Gbps / 100 Gbps.
- **D:** IPsec VPN là mã hóa Layer 3, có overhead làm giảm MTU và bị giới hạn 1.25 Gbps/tunnel (không đạt line-rate 10 Gbps nếu chỉ dùng 1 tunnel).

</details>

### Câu 8 `medium`

A security team wants to prevent compromised EC2 instances across 50 VPCs from exfiltrating sensitive data via DNS tunneling to known malicious domains. If the DNS filtering service experiences an internal outage, security policy mandates that all outbound DNS queries must be blocked rather than allowed through. Which AWS solution should be deployed?

- **A.** AWS Shield Advanced enabled on Route 53 Public Hosted Zones with automatic DNS query rate limiting.
- **B.** Amazon GuardDuty DNS Logs integrated with an EventBridge rule that automatically updates VPC Network ACLs to block malicious domains.
- **C.** Route 53 Resolver Query Logging configured with a Fail-Closed policy to drop NXDOMAIN DNS responses.
- **D.** Route 53 Resolver DNS Firewall managed via Firewall Manager using Malware Domain Lists with Fail-Closed enabled on all VPCs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ bảo mật muốn ngăn chặn các EC2 instance bị xâm nhập trên 50 VPC tuồn dữ liệu nhạy cảm ra ngoài qua kỹ thuật DNS tunneling đến các tên miền độc hại đã biết. Nếu dịch vụ lọc DNS gặp sự cố nội bộ, chính sách bảo mật bắt buộc tất cả các truy vấn DNS đi ra phải bị chặn thay vì cho phép đi qua. Nên triển khai giải pháp AWS nào?

**Đáp án đúng:** **D**

Route 53 Resolver DNS Firewall kết hợp AWS Firewall Manager và chế độ Fail-Closed (tắt Fail-Open) là giải pháp chuẩn để ngăn chặn DNS exfiltration ở quy mô Multi-Account với ưu tiên bảo mật tuyệt đối.

- **A:** Shield Advanced chống tấn công DDoS inbound vào Public Hosted Zones, không lọc truy vấn outbound DNS từ EC2 trong VPC.
- **B:** GuardDuty mang tính phát hiện sau sự cố (detective) chứ không chặn inline truy vấn DNS theo thời gian thực và NACL không lọc được theo tên miền.
- **C:** Query Logging chỉ ghi log truy vấn DNS, không có khả năng chặn hay drop gói tin.
- **D (Đúng):** Route 53 Resolver DNS Firewall chặn DNS exfiltration và domain độc hại bằng Managed/Custom Domain Lists, quản trị tập trung xuyên 50 VPC qua AWS Firewall Manager. Tắt Fail-Open (chuyển sang Fail-Closed) đảm bảo mọi query bị chặn nếu dịch vụ gặp sự cố.

</details>

### Câu 9 `hard`

A global e-commerce application uses Amazon CloudFront in front of Application Load Balancers across multiple AWS accounts. During major sales events, the platform faces sophisticated HTTP flood DDoS attacks and credential-stuffing bots. The company needs automated Layer 7 DDoS mitigation, 24/7 access to the AWS Shield Response Team (SRT), DDoS cost protection, and centralized policy enforcement across all accounts in AWS Organizations. Which TWO services must be enabled together? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Amazon Inspector enabled across all accounts to automatically block credential-stuffing bots at the CloudFront edge.
- **B.** AWS Firewall Manager to centrally deploy and enforce AWS WAF (including Bot Control) and Shield Advanced policies across all accounts in AWS Organizations.
- **C.** AWS Shield Advanced subscribed on the CloudFront distributions and Application Load Balancers, with Automatic Application Layer DDoS Mitigation enabled.
- **D.** AWS Network Firewall attached directly to the Amazon CloudFront distributions to filter Layer 7 HTTP floods.
- **E.** AWS Shield Standard combined with VPC Traffic Mirroring and manual CloudWatch alarms for DDoS cost protection.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng thương mại điện tử toàn cầu sử dụng Amazon CloudFront phía trước các Application Load Balancer trên nhiều tài khoản AWS. Trong các sự kiện bán hàng lớn, nền tảng đối mặt với các cuộc tấn công DDoS HTTP flood tinh vi và bot dò mật khẩu (credential-stuffing). Công ty cần giảm thiểu DDoS Layer 7 tự động, quyền tiếp cận 24/7 với AWS Shield Response Team (SRT), bảo vệ chi phí DDoS và thực thi chính sách tập trung trên tất cả tài khoản trong AWS Organizations. Phải bật đồng thời HAI dịch vụ nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, C**

Bộ đôi AWS Shield Advanced (24/7 SRT, Cost Protection, Auto L7 Mitigation) + AWS Firewall Manager (áp dụng tập trung AWS WAF Bot Control và Shield Advanced xuyên AWS Organizations) là kiến trúc bảo vệ Edge hoàn chỉnh.

- **A:** Amazon Inspector là dịch vụ quét lỗ hổng phần mềm (vulnerability scanning), không phải tường lửa chặn bot tại Edge.
- **B (Đúng):** AWS Firewall Manager quản trị và áp dụng tập trung cả AWS WAF (bao gồm Bot Control chống credential-stuffing) và Shield Advanced policy cho mọi tài khoản và tài nguyên mới trong AWS Organizations.
- **C (Đúng):** AWS Shield Advanced cung cấp 24/7 SRT, DDoS Cost Protection và tính năng Automatic Application Layer DDoS Mitigation (tự động tạo/áp dụng AWS WAF rule chống HTTP flood).
- **D:** AWS Network Firewall chỉ hoạt động ở cấp VPC, không thể gắn vào Amazon CloudFront.
- **E:** Shield Standard không có 24/7 SRT, không có Cost Protection và không tự động chống Layer 7 HTTP flood.

</details>

---

[Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md)
