# Bài tập tình huống — Route 53 Hybrid DNS, Resolver Endpoints, DNSSEC & ARC Zonal Shift

> Triển khai Split-Horizon DNS, Route 53 Resolver Inbound/Outbound Endpoints, Forwarding Rules, DNSSEC signing/validation và Route 53 ARC Zonal Shift.
> **Số câu hỏi:** 13 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A network engineer enables DNSSEC signing on an Amazon Route 53 public hosted zone for example.com. When creating the Key-Signing Key (KSK), the AWS KMS key created in eu-west-1 does not appear in the Route 53 console dropdown. What is the cause of this issue?

- **A.** The DS record has not been uploaded to the domain registrar yet, which hides the KMS key in the Route 53 console dropdown.
- **B.** The KMS key was created as a symmetric encryption key instead of an asymmetric ECC_NIST_P256 signing key, or it was not created in us-east-1.
- **C.** Route 53 DNSSEC does not support public hosted zones; it only works with Route 53 private hosted zones associated with a VPC.
- **D.** The Zone-Signing Key (ZSK) must be manually created in AWS KMS and rotated before the Key-Signing Key (KSK) can be linked.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư mạng bật ký số DNSSEC trên một Amazon Route 53 public hosted zone cho example.com. Khi tạo Key-Signing Key (KSK), khóa AWS KMS được tạo tại eu-west-1 không xuất hiện trong danh sách thả xuống của bảng điều khiển Route 53. Nguyên nhân của vấn đề này là gì?

**Đáp án đúng:** **B**

Để ký DNSSEC cho Route 53 Public Hosted Zone, KSK phải là KMS Asymmetric CMK chuẩn ECC_NIST_P256 đặt tại us-east-1.

- **A:** DS record chỉ được lấy và cấu hình lên Registrar sau khi bạn đã tạo KSK và bật DNSSEC trên Hosted Zone.
- **B (Đúng):** Chính xác. Route 53 DNSSEC KSK bắt buộc sử dụng Customer Managed Key bất đối xứng (ECC_NIST_P256, Key Usage: SIGN_VERIFY) và phải được tạo tại Region us-east-1 (N. Virginia).
- **C:** Ngược lại: DNSSEC signing chỉ hỗ trợ Public Hosted Zone, không hỗ trợ Private Hosted Zone.
- **D:** ZSK do Route 53 tự động tạo và xoay vòng, người dùng chỉ tạo KSK trong AWS KMS.

</details>

### Câu 2 `hard`

A company uses Split-Horizon DNS for corp.example.com with both a Public Hosted Zone and a Private Hosted Zone associated with their VPCs. They add a new public record portal.corp.example.com ONLY to the Public Hosted Zone. When EC2 instances inside the VPC query portal.corp.example.com, they receive an NXDOMAIN error instead of the public IP. Why?

- **A.** DNSSEC validation is blocking split-horizon DNS resolution between the Public and Private Hosted Zones for corp.example.com.
- **B.** Route 53 Resolver does not fall back to the Public Hosted Zone when a matching Private Hosted Zone exists, even if the subdomain record is missing.
- **C.** The Public Hosted Zone TTL has not expired in the Route 53 Resolver cache, so NXDOMAIN responses remain cached across the VPC.
- **D.** The VPC attribute enableDnsHostnames is set to false, preventing Public Hosted Zone fallback inside the VPC.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty sử dụng Split-Horizon DNS cho corp.example.com với cả Public Hosted Zone và Private Hosted Zone được liên kết với các VPC của họ. Họ thêm một bản ghi công cộng mới portal.corp.example.com CHỈ vào Public Hosted Zone. Khi các EC2 instance bên trong VPC truy vấn portal.corp.example.com, chúng nhận được lỗi NXDOMAIN thay vì IP công cộng. Tại sao?

**Đáp án đúng:** **B**

Trong Split-Horizon DNS trên Route 53, Private Hosted Zone luôn chặn hoàn toàn việc fallback ra Public Hosted Zone cho cùng domain namespace. Để EC2 phân giải được portal.corp.example.com, bản ghi đó cũng phải được thêm vào Private Hosted Zone.

- **A:** Nếu DNSSEC lỗi sẽ trả về SERVFAIL, không phải NXDOMAIN.
- **B (Đúng):** Chính xác. Khi VPC có liên kết Private Hosted Zone cho corp.example.com, mọi truy vấn thuộc domain đó chỉ được giải quyết trong Private Hosted Zone. Nếu không có bản ghi portal.corp.example.com trong Private Hosted Zone, Resolver trả về NXDOMAIN chứ không fallback ra Public.
- **C:** Đây không phải lỗi cache mà là hành vi định tuyến ưu tiên mặc định của Route 53 Split-Horizon DNS.
- **D:** Nếu enableDnsSupport tắt thì toàn bộ DNS trong VPC không chạy; ở đây chỉ bị NXDOMAIN cho bản ghi chưa có trong Private Hosted Zone.

</details>

### Câu 3 `hard`

A SaaS provider publishes an internal API using AWS PrivateLink (VPC Endpoint Service) and configures a custom Private DNS name (api.saas-vendor.internal). A consumer creates an Interface VPC Endpoint in their VPC, but the option to Enable Private DNS Name is grayed out or fails. What must the SaaS provider complete first?

- **A.** Share the SaaS provider's Route 53 Private Hosted Zone with the consumer AWS account using AWS RAM.
- **B.** Complete domain ownership verification by adding the AWS-provided TXT record to the public DNS zone of saas-vendor.internal.
- **C.** Add a Route 53 Resolver Outbound Endpoint in the SaaS provider VPC and forward DNS queries to the consumer.
- **D.** Enable Cross-Zone Load Balancing on the SaaS provider's Application Load Balancer and Network Load Balancer.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà cung cấp SaaS xuất bản một API nội bộ bằng AWS PrivateLink (VPC Endpoint Service) và cấu hình một Private DNS name tùy chỉnh (api.saas-vendor.internal). Một bên tiêu dùng (consumer) tạo một Interface VPC Endpoint trong VPC của họ, nhưng tùy chọn Enable Private DNS Name bị mờ đi hoặc thất bại. Nhà cung cấp SaaS phải hoàn tất bước gì trước?

**Đáp án đúng:** **B**

Để sử dụng Private DNS Name trên PrivateLink, Provider phải hoàn tất bước Domain Ownership Verification bằng TXT record, và phía Consumer phải bật enableDnsHostnames + enableDnsSupport trên VPC.

- **A:** PrivateLink tự động tạo một Private Hosted Zone được quản lý ẩn cho Consumer khi Enable Private DNS Name thành công; Provider không cần share PHZ.
- **B (Đúng):** Chính xác. Trước khi Consumer có thể bật Private DNS Name cho Interface Endpoint, Service Provider bắt buộc phải xác minh quyền sở hữu domain bằng bản ghi TXT trên Public DNS.
- **C:** Outbound Endpoint không liên quan đến tính năng Private DNS Name của AWS PrivateLink.
- **D:** PrivateLink Endpoint Service gắn với Network Load Balancer (hoặc Gateway Load Balancer), không gắn trực tiếp với ALB, và không liên quan đến lỗi Private DNS Name.

</details>

### Câu 4 `medium`

An enterprise has 80 VPCs across 30 AWS accounts that all need the exact same set of Private Hosted Zones, Route 53 Resolver Forwarding Rules, and DNS Firewall Rule Groups. Previously, they associated each resource individually per VPC using AWS RAM, causing configuration drift. Which AWS feature streamlines this?

- **A.** Route 53 Resolver Query Logging Configurations shared across all 80 VPCs via AWS RAM.
- **B.** Route 53 Traffic Flow Policies attached to all 30 AWS Organizations member accounts.
- **C.** Amazon Route 53 Profiles shared via AWS RAM and associated with the VPCs.
- **D.** AWS Network Manager Global Networks with automated DNS Firewall rule synchronization.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp có 80 VPC trên 30 tài khoản AWS đều cần chính xác cùng một bộ Private Hosted Zones, Route 53 Resolver Forwarding Rules và DNS Firewall Rule Groups. Trước đây, họ liên kết từng tài nguyên riêng lẻ cho mỗi VPC bằng AWS RAM, gây ra sai lệch cấu hình (configuration drift). Tính năng AWS nào giúp tinh gọn việc này?

**Đáp án đúng:** **C**

Amazon Route 53 Profiles là tính năng tập trung giúp chuẩn hóa và áp dụng hàng loạt cấu hình DNS (PHZ, Resolver Rules, DNS Firewall) cho nhiều VPC trong AWS Organizations.

- **A:** Query Logging chỉ ghi log truy vấn DNS, không áp dụng rule hay hosted zone.
- **B:** Traffic Flow dùng để tạo chính sách định tuyến DNS phức tạp cho Public Hosted Zone, không quản lý Resolver Rules hay DNS Firewall cho VPC.
- **C (Đúng):** Chính xác. Route 53 Profiles cho phép đóng gói Private Hosted Zones, Resolver Rules, DNS Firewall Rule Groups và DNSSEC validation thành một Profile duy nhất rồi chia sẻ qua AWS RAM để áp dụng đồng loạt cho các VPC.
- **D:** Network Manager quản lý cấu trúc liên kết Transit Gateway và Cloud WAN, không quản lý cấu hình DNS.

</details>

### Câu 5 `hard`

During a gray failure in Availability Zone us-east-1b, an Application Load Balancer continues to pass basic TCP health checks, but application latency spikes severely for requests routed through us-east-1b. The operations team wants to immediately drain 100% of traffic away from us-east-1b without modifying application code or Route 53 DNS records manually. Which tool should they use?

- **A.** AWS Global Accelerator Traffic Dials set to 0% for the entire us-east-1 Region.
- **B.** Enable Cross-Zone Load Balancing on the ALB.
- **C.** Modify the ALB Security Group to block all traffic from us-east-1b.
- **D.** Amazon Route 53 Application Recovery Controller (ARC) Zonal Shift.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong một sự cố suy giảm ngầm (gray failure) tại Availability Zone us-east-1b, một Application Load Balancer vẫn tiếp tục vượt qua các kiểm tra sức khỏe TCP cơ bản, nhưng độ trễ ứng dụng tăng vọt nghiêm trọng đối với các yêu cầu được định tuyến qua us-east-1b. Đội ngũ vận hành muốn ngay lập tức rút 100% lưu lượng khỏi us-east-1b mà không sửa mã ứng dụng hay sửa thủ công bản ghi DNS Route 53. Họ nên sử dụng công cụ nào?

**Đáp án đúng:** **D**

ARC Zonal Shift (và Zonal Autoshift) là công cụ chuyên dụng của AWS để đẩy lưu lượng ra khỏi một Availability Zone đang gặp sự cố cục bộ một cách nhanh chóng và an toàn.

- **A:** Traffic Dials điều chỉnh theo cấp độ Endpoint Group (cả Region), không cô lập riêng lẻ một Availability Zone.
- **B:** Cross-Zone Load Balancing mặc định đã bật trên ALB, và nếu node ALB tại us-east-1b vẫn nhận traffic thì sự cố ở AZ đó vẫn ảnh hưởng.
- **C:** Chặn Security Group trên ALB không ngăn Route 53 trả về IP của node ALB tại us-east-1b, gây mất kết nối hoàn toàn cho người dùng.
- **D (Đúng):** Chính xác. ARC Zonal Shift cho phép rút toàn bộ traffic của ALB/NLB/EKS/ASG ra khỏi một AZ cụ thể trong vài giây khi xảy ra gray failure hoặc sự cố cấp AZ.

</details>

### Câu 6 `hard`

A company is adopting Amazon VPC Lattice to connect microservices running on EKS clusters and AWS Lambda functions across 10 VPCs that have overlapping IPv4 CIDR blocks. Which TWO statements accurately describe how VPC Lattice handles this architecture?

*(Chọn 2 đáp án)*

- **A.** Access control can be enforced centrally using IAM-based Auth Policies attached to the Service Network or individual Services.
- **B.** VPC Lattice operates at Layer 7 and natively connects services across VPCs with overlapping CIDRs without requiring Transit Gateway or VPC Peering.
- **C.** Security Groups cannot be attached to VPC Lattice Service Network associations.
- **D.** VPC Lattice only supports EC2 and ECS targets; AWS Lambda functions require an intermediate Application Load Balancer.
- **E.** Each consumer VPC must deploy a NAT Gateway to translate overlapping IP addresses before reaching the Service Network.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty đang áp dụng Amazon VPC Lattice để kết nối các microservice chạy trên các cụm EKS và hàm AWS Lambda trên 10 VPC có các dải IPv4 CIDR trùng lặp. HAI phát biểu nào mô tả chính xác cách VPC Lattice xử lý kiến trúc này?

**Đáp án đúng:** **A, B**

Amazon VPC Lattice đơn giản hóa service-to-service communication ở Layer 7, giải quyết bài toán overlapping CIDRs giữa các VPC và cung cấp IAM Auth Policies tích hợp sẵn.

- **A (Đúng):** Chính xác. VPC Lattice hỗ trợ Auth Policies (IAM SigV4) ở cấp Service Network và Service để xác thực và phân quyền gọi API giữa các microservice.
- **B (Đúng):** Chính xác. VPC Lattice là dịch vụ kết nối ứng dụng Layer 7 được quản lý hoàn toàn, hỗ trợ kết nối giữa các VPC có CIDR trùng lặp mà không cần thiết lập đường truyền Layer 3 như TGW hay Peering.
- **C:** Sai. Bạn có thể gắn Security Group vào VPC Association của Service Network để kiểm soát thêm ở tầng mạng.
- **D:** Sai. VPC Lattice hỗ trợ trực tiếp Lambda functions làm Target Group bên cạnh EC2, ECS, EKS/Kubernetes và IP targets.
- **E:** Sai. VPC Lattice tự xử lý định tuyến ở tầng mạng ẩn (link-local/overlay), không cần NAT Gateway để dịch IP trùng lặp.

</details>

### Câu 7 `hard`

An organization enables Route 53 Resolver DNSSEC Validation on a VPC. An application inside the VPC queries a third-party external domain whose DNSSEC RRSIG signature has expired. What response does the Route 53 Resolver return to the application?

- **A.** It falls back to the VPC's DHCP Option Set custom DNS server.
- **B.** It returns a SERVFAIL response.
- **C.** It returns the IP address anyway with the AD (Authenticated Data) bit cleared.
- **D.** It returns an NXDOMAIN response.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức bật Route 53 Resolver DNSSEC Validation trên một VPC. Một ứng dụng bên trong VPC truy vấn một tên miền bên ngoài của bên thứ ba có chữ ký DNSSEC RRSIG đã hết hạn. Route 53 Resolver trả về phản hồi gì cho ứng dụng?

**Đáp án đúng:** **B**

Khi bật Route 53 Resolver DNSSEC Validation cho VPC, bất kỳ phản hồi nào có chữ ký sai hoặc hết hạn sẽ bị từ chối và trả về SERVFAIL.

- **A:** Route 53 Resolver không tự động fallback sang server khác khi gặp lỗi DNSSEC.
- **B (Đúng):** Chính xác. Theo chuẩn DNSSEC Validation, khi chữ ký không hợp lệ hoặc hết hạn (BOGUS), Route 53 Resolver trả về mã lỗi SERVFAIL.
- **C:** Khi DNSSEC validation được bật và chữ ký không hợp lệ (BOGUS), Resolver sẽ chặn không trả về IP để bảo vệ client khỏi spoofing.
- **D:** NXDOMAIN chỉ trả về khi tên miền thực sự không tồn tại và được chứng minh hợp lệ (hoặc unsigned), không phải khi lỗi xác thực chữ ký.

</details>

### Câu 8 `hard`

A healthcare enterprise has 50 VPCs connected via a Transit Gateway in us-east-1 and an on-premises network connected over AWS Direct Connect. The enterprise uses an AWS Route 53 Private Hosted Zone (corp.internal) associated with all 50 VPCs. On-premises servers must resolve records in corp.internal, and EC2 instances in the VPCs must resolve records in onprem.corp.internal hosted on on-premises DNS servers. Which DNS architecture implements this bidirectional hybrid resolution?

- **A.** Create a Route 53 Public Hosted Zone for corp.internal and enable DNSSEC signing.
- **B.** Deploy Resolver Inbound and Outbound Endpoints in a shared services VPC, associate the PHZ with it, and add rules for onprem.corp.internal.
- **C.** Deploy an Inbound Endpoint only and configure conditional forwarders on the Inbound Endpoint to send queries to on-premises Active Directory DNS servers.
- **D.** Enable DNS hostnames and DNS resolution on all 50 VPCs and configure DHCP Option Sets pointing directly to the on-premises DNS servers.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp y tế có 50 VPC kết nối qua Transit Gateway tại us-east-1 và một mạng tại chỗ kết nối qua AWS Direct Connect. Doanh nghiệp sử dụng AWS Route 53 Private Hosted Zone (corp.internal) liên kết với tất cả 50 VPC. Các máy chủ tại chỗ phải phân giải được các bản ghi trong corp.internal, và các EC2 instance trong VPC phải phân giải được các bản ghi trong onprem.corp.internal được lưu trữ trên các máy chủ DNS tại chỗ. Kiến trúc DNS nào triển khai khả năng phân giải lai hai chiều này?

**Đáp án đúng:** **B**

Giải pháp DNS Hybrid chuẩn trên AWS gồm: Route 53 Resolver Inbound Endpoint (cho phép on-premises query AWS Private Hosted Zone) và Outbound Endpoint + Forwarding Rules (cho phép VPC query on-premises DNS).

- **A:** Public Hosted Zone sẽ phơi bày bản ghi nội bộ ra Internet công cộng, vi phạm bảo mật và không giải quyết được việc truy vấn ngược về onprem.corp.internal.
- **B (Đúng):** Chính xác. Inbound Endpoint nhận truy vấn từ on-premises để giải quyết Private Hosted Zone (corp.internal). Outbound Endpoint kết hợp với Resolver Forwarding Rule cho onprem.corp.internal sẽ chuyển tiếp truy vấn từ các VPC về DNS server on-premises.
- **C:** Inbound Endpoint chỉ nhận truy vấn đi vào AWS, không thể dùng để forward truy vấn đi ra on-premises (việc này thuộc về Outbound Endpoint).
- **D:** Nếu đổi DHCP Option Sets trỏ thẳng về DNS on-premises, các EC2 instance sẽ mất khả năng phân giải AmazonProvidedDNS (.2) và Private Hosted Zone của AWS.

</details>

### Câu 9 `medium`

A network engineer needs to configure a Route 53 public hosted zone (example.com) so that DNSSEC validation is enforced for all resolvers querying the domain, and also wants to use DNS-based routing that automatically shifts traffic away from an unhealthy Application Load Balancer in us-east-1 within 60 seconds. Which combination of Route 53 configurations is required?

- **A.** Enable DNSSEC signing on a Route 53 Private Hosted Zone and associate it with an Internet Gateway for public resolvers.
- **B.** Enable DNSSEC signing using a KMS key (ECC_NIST_P256), add the DS record at the registrar, and use an Alias record with Evaluate Target Health.
- **C.** Use Route 53 Resolver DNS Firewall to sign DNS responses with DNSSEC.
- **D.** Enable DNSSEC signing using an RSA_2048 customer-managed KMS key in eu-west-1 and configure a CNAME record with a 3600-second TTL.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư mạng cần cấu hình một Route 53 public hosted zone (example.com) sao cho việc xác thực DNSSEC được thực thi cho tất cả các resolver truy vấn tên miền, đồng thời muốn sử dụng định tuyến dựa trên DNS tự động chuyển lưu lượng khỏi một Application Load Balancer không khỏe mạnh tại us-east-1 trong vòng 60 giây. Cần sự kết hợp cấu hình Route 53 nào?

**Đáp án đúng:** **B**

Khi bật DNSSEC trên Route 53 Public Hosted Zone, bắt buộc dùng asymmetric KMS CMK (ECC_NIST_P256) tại us-east-1 và cập nhật bản ghi DS lên registrar. Đối với ALB failover, Alias record bật Evaluate Target Health giúp Route 53 kiểm tra sức khỏe của target ALB.

- **A:** DNSSEC signing trên Route 53 chỉ áp dụng cho Public Hosted Zone, không áp dụng cho Private Hosted Zone.
- **B (Đúng):** Chính xác. Route 53 DNSSEC signing yêu cầu CMK loại ECC_NIST_P256 tại us-east-1 và phải thiết lập DS record ở registrar để hoàn tất chain of trust. Kết hợp Alias record với Evaluate Target Health (hoặc Failover health check) sẽ tự động chuyển hướng khi ALB gặp sự cố.
- **C:** DNS Firewall dùng để lọc domain độc hại từ VPC đi ra, không dùng để ký DNSSEC cho Public Hosted Zone.
- **D:** Route 53 DNSSEC yêu cầu KMS key loại ECC_NIST_P256 tạo tại Region us-east-1, và TTL 3600 giây không thể failover trong 60 giây.

</details>

### Câu 10 `hard`

A network architect is migrating a multi-account environment to use Route 53 Profiles and Amazon VPC Prefix Lists. The architect wants to enforce consistent DNS Resolver rules and Private Hosted Zone associations across 100 VPCs, and also simplify Security Group and VPC route table management for 25 branch office CIDR blocks. Which TWO actions should the architect take? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Create a Customer-Managed Prefix List containing the 25 branch office CIDRs, share it via AWS RAM, and reference it in Security Groups and VPC route tables.
- **B.** Create a Route 53 Profile containing the Private Hosted Zones and Resolver forwarding rules, share it via AWS RAM, and associate it with the 100 VPCs.
- **C.** Use custom DHCP Option Sets to associate Private Hosted Zones and forwarding rules across all 100 AWS accounts.
- **D.** Reference an AWS-Managed Prefix List in Security Groups for the 25 custom on-premises branch office CIDRs.
- **E.** Enable Route 53 ARC Zonal Shift to synchronize Private Hosted Zone and Resolver rule associations across accounts.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiến trúc sư mạng đang di chuyển môi trường đa tài khoản sang sử dụng Route 53 Profiles và Amazon VPC Prefix Lists. Kiến trúc sư muốn thực thi nhất quán các quy tắc DNS Resolver và liên kết Private Hosted Zone trên 100 VPC, đồng thời đơn giản hóa việc quản lý Security Group và route table VPC cho 25 dải CIDR của văn phòng chi nhánh. Kiến trúc sư nên thực hiện HAI hành động nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, B**

Route 53 Profiles giúp chuẩn hóa và chia sẻ tập trung cấu hình DNS (PHZ, Resolver Rules, DNS Firewall) cho hàng trăm VPC qua AWS RAM. Customer-Managed Prefix Lists giúp quản lý tập trung các dải IP on-premises trong Security Groups và Route Tables.

- **A (Đúng):** Chính xác. Customer-Managed Prefix List cho phép gom nhóm các dải CIDR (ví dụ 25 branch CIDRs) và tái sử dụng trực tiếp trong Security Groups, Network ACLs (gián tiếp qua SG/route) và VPC/TGW Route Tables.
- **B (Đúng):** Chính xác. Route 53 Profiles cho phép đóng gói các thiết lập DNS (Private Hosted Zones, Resolver rules, DNS Firewall rule groups) vào một profile duy nhất, chia sẻ qua RAM và gắn hàng loạt vào các VPC.
- **C:** DHCP Option Sets không thể gán Private Hosted Zone hay Resolver forwarding rules cho VPC.
- **D:** AWS-Managed Prefix List chỉ chứa các dải IP của dịch vụ AWS (như S3, DynamoDB, CloudFront), không chứa dải IP on-premises của khách hàng.
- **E:** Route 53 ARC Zonal Shift dùng để chuyển hướng traffic ra khỏi một Availability Zone bị lỗi, không phải công cụ quản lý cấu hình DNS.

</details>

### Câu 11 `medium`

A company hosts a SaaS application in a VPC with both internal corporate users (via Direct Connect) and external public internet users. Both user groups must resolve `api.example.com`: external users must receive the public IP of an external CloudFront distribution, while internal VPC and on-premises users must receive the private IP of an internal Application Load Balancer. How should the company implement this split-horizon DNS architecture?

- **A.** Use Route 53 Geolocation routing in a Public Hosted Zone to return private RFC 1918 IP addresses to corporate users over AWS Direct Connect.
- **B.** Enable DNSSEC on the Private Hosted Zone and associate it with the Internet Gateway for external users.
- **C.** Create a Route 53 Public Hosted Zone for `example.com` pointing to CloudFront, a Private Hosted Zone pointing to the ALB, and an Inbound Endpoint.
- **D.** Configure a Route 53 Resolver Outbound Endpoint to rewrite public DNS responses to private ALB IP addresses.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ một ứng dụng SaaS trong một VPC cho cả người dùng doanh nghiệp nội bộ (qua Direct Connect) và người dùng internet công cộng bên ngoài. Cả hai nhóm người dùng phải phân giải `api.example.com`: người dùng bên ngoài phải nhận IP công cộng của một CloudFront distribution bên ngoài, trong khi người dùng VPC nội bộ và tại chỗ phải nhận IP riêng của một Application Load Balancer nội bộ. Công ty nên triển khai kiến trúc split-horizon DNS này như thế nào?

**Đáp án đúng:** **C**

Split-horizon (Split-view) DNS trên AWS dùng song song Public Hosted Zone và Private Hosted Zone có cùng tên miền. Khi VPC bật `enableDnsSupport` và `enableDnsHostnames`, AmazonProvidedDNS sẽ ưu tiên trả về bản ghi trong Private Hosted Zone.

- **A:** Không nên trả về IP private trong Public Hosted Zone và Geolocation routing không phân biệt chính xác được traffic nội bộ VPC với người dùng công cộng cùng quốc gia.
- **B:** Private Hosted Zone không hỗ trợ DNSSEC và không gắn vào Internet Gateway.
- **C (Đúng):** Chính xác. Split-horizon DNS trên Route 53 sử dụng cùng một tên miền cho cả Public Hosted Zone (trả về CloudFront cho người dùng Internet) và Private Hosted Zone (trả về internal ALB cho VPC). On-premises truy vấn Private Hosted Zone thông qua Route 53 Resolver Inbound Endpoint.
- **D:** Outbound Endpoint dùng để forward truy vấn từ VPC ra DNS on-premises, không dùng để rewrite bản ghi.

</details>

### Câu 12 `medium`

A company has 50 spoke VPCs across multiple AWS accounts connected to a Shared Services VPC and on-premises data centers via a Transit Gateway. EC2 instances in all spoke VPCs must resolve on-premises domain names (corp.local), and on-premises servers must resolve AWS Private Hosted Zones (aws.corp.internal). Which Route 53 Resolver architecture is the MOST cost-effective and scalable?

- **A.** Deploy Route 53 Resolver Inbound and Outbound Endpoints in every spoke VPC and configure conditional forwarders in each of the 50 AWS accounts.
- **B.** Deploy centralized Inbound/Outbound Endpoints in Shared Services VPC, associate PHZs with it, and share Outbound Rules via AWS RAM.
- **C.** Configure Route 53 Public Hosted Zones for aws.corp.internal and enable DNSSEC with IAM policies for private name resolution.
- **D.** Install self-managed BIND DNS forwarders on EC2 instances in each spoke VPC and update DHCP Option Sets across all 50 VPCs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có 50 spoke VPC trên nhiều tài khoản AWS kết nối với một Shared Services VPC và các trung tâm dữ liệu tại chỗ thông qua một Transit Gateway. Các EC2 instance trong tất cả spoke VPC phải phân giải được tên miền tại chỗ (corp.local), và các máy chủ tại chỗ phải phân giải được AWS Private Hosted Zones (aws.corp.internal). Kiến trúc Route 53 Resolver nào TIẾT KIỆM CHI PHÍ NHẤT và dễ mở rộng nhất?

**Đáp án đúng:** **B**

Kiến trúc Centralized Hybrid DNS chuẩn trên AWS đặt 1 Inbound + 1 Outbound Endpoint tại Shared Services VPC, associate các PHZ tại đó và dùng AWS RAM chia sẻ Outbound Forwarding Rules tới toàn bộ Organization.

- **A:** Tạo Inbound/Outbound Endpoints ở cả 50 spoke VPC sẽ tốn hàng trăm ENI (chi phí cao) và rất khó quản trị.
- **B (Đúng):** Mô hình Centralized DNS chỉ cần 1 cặp Inbound + Outbound Endpoints tại Shared Services VPC. Liên kết PHZ vào Shared Services VPC cho phép On-Premises query qua Inbound Endpoint, còn chia sẻ Outbound Rules qua AWS RAM giúp 50 spoke VPC phân giải corp.local không cần tạo thêm endpoint.
- **C:** Không được đưa tên miền nội bộ lên Public Hosted Zone vì gây lộ thông tin hạ tầng và không giải quyết chiều phân giải corp.local về On-Premises.
- **D:** Tự vận hành 50 cụm BIND DNS trên EC2 làm tăng gánh nặng vận hành, patching và HA so với dịch vụ managed Route 53 Resolver.

</details>

### Câu 13 `medium`

A B2B software provider hosts a TCP-based analytics service behind a Network Load Balancer (NLB) in Account A and exposes it via AWS PrivateLink to 200 customer accounts. Customers report that they must connect using a friendly custom domain name (analytics.provider.com) over private IP addresses, and the provider wants to ensure only authorized customer AWS accounts can connect. Which TWO configurations must the provider implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Share the Network Load Balancer directly with all 200 customer AWS accounts using AWS Resource Access Manager (AWS RAM).
- **B.** Configure Allowed Principals on the VPC Endpoint Service and enable Acceptance Required for endpoint connection requests.
- **C.** Enable Cross-Zone Load Balancing on the VPC Endpoint Service and attach an Internet Gateway to all 200 consumer VPCs.
- **D.** Attach an IAM Resource-Based Policy directly to the Network Load Balancer restricting traffic to authorized source VPC IDs.
- **E.** Configure a Private DNS Name (analytics.provider.com) on the VPC Endpoint Service and verify domain ownership via a TXT record in public DNS.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà cung cấp phần mềm B2B lưu trữ dịch vụ phân tích dựa trên TCP phía sau một Network Load Balancer (NLB) trong Tài khoản A và cung cấp ra ngoài qua AWS PrivateLink cho 200 tài khoản khách hàng. Khách hàng yêu cầu kết nối bằng một tên miền tùy chỉnh thân thiện (analytics.provider.com) qua các địa chỉ IP riêng, và nhà cung cấp muốn đảm bảo chỉ các tài khoản AWS của khách hàng được ủy quyền mới có thể kết nối. Nhà cung cấp phải triển khai HAI cấu hình nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, E**

Khi cung cấp dịch vụ qua AWS PrivateLink với custom domain và phân quyền chặt chẽ, Provider cần cấu hình Private DNS Name (xác thực TXT record) và thiết lập Allowed Principals + Acceptance Required trên Endpoint Service.

- **A:** AWS RAM không hỗ trợ chia sẻ trực tiếp Network Load Balancer; việc chia sẻ dịch vụ PrivateLink thực hiện qua VPC Endpoint Service.
- **B (Đúng):** Sử dụng Allowed Principals (chỉ định IAM/Account ARN được phép) kết hợp Acceptance Required giúp kiểm soát chặt chẽ chỉ các tài khoản khách hàng được phê duyệt mới có thể kết nối.
- **C:** PrivateLink không cần Internet Gateway ở consumer VPC và Cross-Zone Load Balancing được cấu hình trên NLB chứ không phải tính năng phân quyền.
- **D:** NLB không hỗ trợ Resource-Based Policy để chặn source VPC ID của tài khoản khác; việc kiểm soát truy cập thực hiện trên Endpoint Service.
- **E (Đúng):** Cấu hình Private DNS Name trên VPC Endpoint Service (và xác thực quyền sở hữu domain qua bản ghi TXT) cho phép Consumer phân giải trực tiếp analytics.provider.com sang IP private của Interface Endpoint.

</details>

---

[Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md)
