# Bài tập tình huống — IPv6 Dual-Stack, IPv6-Only, NAT64/DNS64, VPC IPAM & Prefix Lists

> Thiết kế IPv6 Dual-Stack và IPv6-Only Subnets, Egress-Only Internet Gateway (EIGW), NAT64/DNS64, quản trị IP tập trung với VPC IPAM và Prefix Lists.
> **Số câu hỏi:** 12 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A company is deploying microservices on Nitro-based Amazon EC2 instances in IPv6-only private subnets to avoid IPv4 exhaustion. These instances must initiate outbound connections to an IPv4-only third-party REST API on the internet. Which network configuration enables this communication?

- **A.** Enable DNS64 on the IPv6-only subnets, deploy a NAT Gateway in a dual-stack public subnet, and route 64:ff9b::/96 to the NAT Gateway.
- **B.** Deploy a NAT Gateway in the IPv6-only private subnet and route 0.0.0.0/0 directly to an Internet Gateway in the public subnet.
- **C.** Attach an Egress-Only Internet Gateway (EIGW) to the VPC and add a ::/0 default route pointing to the EIGW for IPv4-only SaaS API calls.
- **D.** Configure a VPC Peering connection to a dual-stack VPC and enable IPv6 DNS64 resolution across the peering connection.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty đang triển khai các microservice trên các Amazon EC2 instance nền tảng Nitro trong các private subnet chỉ dùng IPv6 (IPv6-only) để tránh cạn kiệt IPv4. Các instance này phải khởi tạo kết nối đi ra đến một REST API bên thứ ba chỉ hỗ trợ IPv4 trên internet. Cấu hình mạng nào cho phép giao tiếp này?

**Đáp án đúng:** **A**

Để workload trong IPv6-only subnet giao tiếp được với endpoint IPv4-only, kiến trúc chuẩn trên AWS là kết hợp DNS64 (tổng hợp địa chỉ tiền tố 64:ff9b::/96) và NAT64 (trên NAT Gateway đặt tại dual-stack subnet).

- **A (Đúng):** Chính xác. DNS64 tổng hợp địa chỉ IPv6 dạng 64:ff9b::<IPv4> khi không có bản ghi AAAA, sau đó route 64:ff9b::/96 đẩy traffic tới NAT Gateway ở dual-stack subnet để thực hiện NAT64 sang IPv4.
- **B:** NAT Gateway thực hiện NAT64 phải được đặt trong dual-stack subnet (có cả IPv4 và IPv6) và IPv6-only subnet không dùng route 0.0.0.0/0.
- **C:** EIGW chỉ cho phép kết nối IPv6-to-IPv6 outbound ra Internet, không thể dịch gói tin IPv6 sang IPv4 để nói chuyện với IPv4-only API.
- **D:** VPC Peering không cung cấp cơ chế dịch địa chỉ NAT64 hay truy cập Internet gián tiếp cho workload IPv6-only.

</details>

### Câu 2 `medium`

An enterprise has 150 AWS accounts in AWS Organizations. Network administrators want to automate IPv4 CIDR allocation for new VPCs across multiple Regions, prevent overlapping CIDRs, and enforce a minimum netmask of /22 for production VPCs. Which solution meets these requirements with the least operational overhead?

- **A.** Create a Customer-Managed Prefix List containing all /22 production CIDRs and share it across all 150 accounts using AWS RAM.
- **B.** Enable AWS Config managed rule vpc-cidr-overlap-check across all 150 accounts in AWS Organizations to block overlapping CIDRs.
- **C.** Use AWS CloudFormation StackSets with a central DynamoDB table and Lambda function to track and assign non-overlapping /22 CIDR blocks across Regions.
- **D.** Configure Amazon VPC IPAM with a hierarchical pool structure, set allocation rules for minimum netmask /22, and share pools via AWS RAM.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp có 150 tài khoản AWS trong AWS Organizations. Quản trị viên mạng muốn tự động hóa việc cấp phát IPv4 CIDR cho các VPC mới trên nhiều Region, ngăn chặn CIDR trùng lặp và áp đặt netmask tối thiểu là /22 cho các VPC production. Giải pháp nào đáp ứng các yêu cầu này với gánh nặng vận hành thấp nhất?

**Đáp án đúng:** **D**

Amazon VPC IPAM tích hợp AWS Organizations và AWS RAM là giải pháp gốc để tự động hóa cấp phát CIDR, chống chồng lấn (non-overlapping) và áp đặt quy tắc netmask trên quy mô lớn.

- **A:** Prefix List chỉ dùng để gom nhóm CIDR cho Security Group và Route Table, không có chức năng cấp phát CIDR cho VPC mới.
- **B:** AWS Config chỉ giúp kiểm tra tuân thủ sau khi tài nguyên đã tạo, không tự động cấp phát CIDR cho VPC mới.
- **C:** Tự xây dựng hệ thống quản lý IP bằng DynamoDB và Lambda tốn nhiều công sức vận hành và dễ sai sót so với dịch vụ quản trị có sẵn.
- **D (Đúng):** Chính xác. Amazon VPC IPAM hỗ trợ phân cấp Pool (Top-level -> Regional -> Environment), thiết lập Allocation Rules (min/max/default netmask) và chia sẻ qua AWS RAM cho các account trong Organizations.

</details>

### Câu 3 `hard`

A network architect is designing a security group strategy for 40 Application Load Balancers (ALBs) that must only accept HTTPS traffic from Amazon CloudFront and 15 corporate branch office IPv4 CIDR blocks. The branch office list is expected to grow to 25 CIDRs next year. Which TWO actions should the architect take to minimize ongoing maintenance and avoid hitting Security Group rule quotas?

*(Chọn 2 đáp án)*

- **A.** Use an AWS Lambda function triggered by Amazon SNS IP Space Change notifications to update individual ALB Security Group ingress rules.
- **B.** Reference the AWS-managed prefix list com.amazonaws.global.cloudfront.origin-facing in the ALB security groups.
- **C.** Create a Customer-Managed Prefix List with MaxEntries set to 15 and increase MaxEntries next year when new branches open.
- **D.** Create a Customer-Managed Prefix List with MaxEntries set to 25 for the branch office CIDRs and share it via AWS RAM if needed.
- **E.** Attach the Customer-Managed Prefix List directly to the Subnet Network ACLs to filter traffic before it reaches the ALBs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiến trúc sư mạng đang thiết kế chiến lược security group cho 40 Application Load Balancer (ALB) chỉ được phép chấp nhận lưu lượng HTTPS từ Amazon CloudFront và 15 dải IPv4 CIDR của văn phòng chi nhánh doanh nghiệp. Danh sách văn phòng chi nhánh dự kiến tăng lên 25 CIDR vào năm tới. Kiến trúc sư nên thực hiện HAI hành động nào để giảm thiểu việc bảo trì liên tục và tránh chạm hạn mức quy tắc Security Group?

**Đáp án đúng:** **B, D**

Dùng AWS-managed prefix list cho CloudFront và Customer-Managed Prefix List với MaxEntries được dự phòng trước (25) là best practice để quản lý Security Group sạch sẽ và tối ưu quota.

- **A:** Cách tiếp cận thủ công qua SNS + Lambda lỗi thời và tốn công vận hành hơn nhiều so với việc dùng AWS-managed prefix list.
- **B (Đúng):** Chính xác. AWS-managed prefix list cho CloudFront tự động cập nhật dải IP của CloudFront edge locations mà không cần thao tác thủ công.
- **C:** Sai. Thuộc tính MaxEntries của Customer-Managed Prefix List là cố định và không thể chỉnh sửa sau khi đã tạo.
- **D (Đúng):** Chính xác. Vì MaxEntries không thể thay đổi sau khi tạo Customer-Managed Prefix List, cần đặt MaxEntries là 25 ngay từ đầu để đáp ứng tăng trưởng trong tương lai.
- **E:** Sai. Network ACL (NACL) không hỗ trợ tham chiếu Prefix List; Prefix List chỉ dùng được trong Security Group và Route Table.

</details>

### Câu 4 `medium`

A financial application runs in dual-stack private subnets and needs to send telemetry data over IPv6 to an external SaaS provider on the internet. Company policy strictly prohibits any inbound connections initiated from the internet to these instances. What should the network engineer deploy?

- **A.** Attach an Egress-Only Internet Gateway (EIGW) to the VPC and add a route for ::/0 pointing to the EIGW in the private subnet route table.
- **B.** Attach a Private NAT Gateway in the dual-stack private subnet and route ::/0 IPv6 telemetry traffic directly to it.
- **C.** Attach an Internet Gateway (IGW) to the VPC and configure a stateless Network ACL blocking all inbound ephemeral TCP and UDP ports from the internet.
- **D.** Use an Application Load Balancer with an IPv6 target group to proxy outbound telemetry to the external SaaS provider.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng tài chính chạy trong các private subnet dual-stack và cần gửi dữ liệu đo từ xa (telemetry) qua IPv6 đến một nhà cung cấp SaaS bên ngoài trên internet. Chính sách công ty nghiêm cấm mọi kết nối đi vào được khởi tạo từ internet đến các instance này. Kỹ sư mạng nên triển khai gì?

**Đáp án đúng:** **A**

Egress-Only Internet Gateway (EIGW) là thành phần tương đương NAT Gateway dành riêng cho lưu lượng IPv6 outbound-only.

- **A (Đúng):** Chính xác. EIGW là gateway stateful chỉ cho phép traffic IPv6 đi từ trong VPC ra Internet và tự động chặn mọi kết nối inbound khởi tạo từ Internet.
- **B:** NAT Gateway không thực hiện NAT IPv6-to-IPv6 và không dùng route ::/0 trực tiếp cho IPv6 egress.
- **C:** Chặn toàn bộ ephemeral ports trên NACL sẽ làm hỏng cả lưu lượng trả về (return traffic) của các kết nối outbound.
- **D:** ALB là reverse proxy cho lưu lượng inbound, không phải thiết bị định tuyến outbound egress.

</details>

### Câu 5 `hard`

A company has two AWS organizations following an acquisition. Both organizations have multiple VPCs using overlapping 10.0.0.0/16 CIDR blocks. The network team wants to track and manage IP utilization across both overlapping environments within a single Amazon VPC IPAM instance. How should they configure IPAM?

- **A.** Use the default Public Scope for the acquired company's RFC 1918 CIDRs.
- **B.** Create a separate custom Private Scope for the acquired company so each overlapping 10.0.0.0/16 environment resides in its own Scope.
- **C.** Deploy a second Amazon VPC IPAM instance in the same AWS Region because IPAM only supports one Private Scope per Region in Organizations.
- **D.** Create a single Private Scope in Amazon VPC IPAM and add both overlapping 10.0.0.0/16 CIDR pools directly to it.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có hai tổ chức AWS sau một thương vụ mua lại. Cả hai tổ chức đều có nhiều VPC sử dụng các dải CIDR 10.0.0.0/16 trùng lặp nhau. Đội ngũ mạng muốn theo dõi và quản lý mức sử dụng IP trên cả hai môi trường trùng lặp trong một Amazon VPC IPAM instance duy nhất. Họ nên cấu hình IPAM như thế nào?

**Đáp án đúng:** **B**

Mỗi IPAM Scope đại diện cho một không gian định tuyến tách biệt. Việc tạo Custom Private Scope cho phép quản lý các mạng có CIDR trùng lặp (overlapping CIDRs) trong cùng một VPC IPAM.

- **A:** Public Scope chỉ dành cho địa chỉ IP công cộng (BYOIP hoặc AWS-provided public IPv6), không dùng cho RFC 1918.
- **B (Đúng):** Chính xác. IPAM Scope là ranh giới không gian địa chỉ không chồng lấn. Khi có các mạng trùng IP (như sau M&A), bạn tạo thêm Custom Private Scope riêng cho từng mạng trong cùng 1 IPAM.
- **C:** IPAM hỗ trợ nhiều Custom Private Scopes trong cùng một IPAM instance.
- **D:** Một IPAM Scope không cho phép hai pool có CIDR chồng lấn (overlapping) nằm chung trong cùng một Scope.

</details>

### Câu 6 `medium`

An application runs in an IPv6-only subnet in AWS and must communicate with an on-premises IPv4-only mainframe database accessible via AWS Transit Gateway and Direct Connect. Where must the NAT Gateway be placed to perform NAT64 translation?

- **A.** In an Egress-Only Internet Gateway attached directly to the AWS Transit Gateway for on-premises IPv4 translation.
- **B.** In the IPv6-only subnet with Connectivity Type set to Private and an Egress-Only Internet Gateway attached.
- **C.** Directly on the AWS Transit Gateway as a managed NAT64 attachment routing to the Direct Connect Transit VIF.
- **D.** In a dual-stack subnet with Connectivity Type set to Private (or Public) routing to the Transit Gateway for the on-premises IPv4 CIDR.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng chạy trong một subnet IPv6-only trên AWS và phải giao tiếp với một cơ sở dữ liệu mainframe chỉ hỗ trợ IPv4 tại chỗ có thể truy cập qua AWS Transit Gateway và Direct Connect. NAT Gateway phải được đặt ở đâu để thực hiện dịch NAT64?

**Đáp án đúng:** **D**

NAT Gateway thực hiện NAT64 luôn phải nằm trong một dual-stack subnet (có IPv4 để dịch địa chỉ nguồn) và có đường định tuyến IPv4 tới đích qua TGW/Direct Connect.

- **A:** EIGW chỉ gắn vào VPC cho IPv6 ra Internet, không gắn vào TGW và không làm NAT64.
- **B:** NAT Gateway không thể tạo trong IPv6-only subnet vì chính NAT Gateway cần địa chỉ IPv4 để thực hiện NAT64.
- **C:** Transit Gateway không có tính năng NAT64 tích hợp sẵn; NAT64 chạy trên VPC NAT Gateway.
- **D (Đúng):** Chính xác. Private NAT Gateway (hoặc Public NAT Gateway) đặt trong dual-stack subnet có route tới TGW sẽ dịch gói tin từ 64:ff9b::/96 sang IPv4 nguồn của NAT Gateway và định tuyến qua TGW về on-premises.

</details>

### Câu 7 `medium`

A SaaS provider is running out of RFC 1918 IPv4 space in its AWS Organization. New Kubernetes pods in Amazon EKS require outbound-only access to IPv4 SaaS APIs on the internet, while internal pod-to-pod and pod-to-RDS communication can remain IPv6. The team creates IPv6-only subnets for the EKS worker nodes. Which combination of gateways and features is required for outbound IPv4 internet access?

- **A.** DNS64 enabled on the IPv6-only subnet, a NAT Gateway in a dual-stack public subnet, and a 64:ff9b::/96 route pointing to the NAT Gateway.
- **B.** A Private NAT Gateway deployed in the IPv6-only subnet with a 0.0.0.0/0 default route pointing directly to an Internet Gateway.
- **C.** Enable IPv6 on the Internet Gateway and configure a 64:ff9b::/96 route directly to the Internet Gateway for IPv4 SaaS APIs.
- **D.** An Egress-Only Internet Gateway (EIGW) and a ::/0 route in the IPv6-only subnet route table to translate outbound IPv4 SaaS API requests.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà cung cấp SaaS đang cạn kiệt không gian IPv4 RFC 1918 trong AWS Organization của mình. Các Kubernetes pod mới trong Amazon EKS yêu cầu quyền truy cập chỉ đi ra (outbound-only) đến các API SaaS IPv4 trên internet, trong khi giao tiếp nội bộ pod-to-pod và pod-to-RDS có thể giữ nguyên IPv6. Đội ngũ tạo các subnet IPv6-only cho các EKS worker node. Cần sự kết hợp gateway và tính năng nào để truy cập internet IPv4 đi ra?

**Đáp án đúng:** **A**

Kiến trúc IPv6-only kết nối tới IPv4-only Internet endpoints bắt buộc dùng bộ đôi DNS64 (trên subnet) và NAT64 (trên Public NAT Gateway đặt tại dual-stack subnet) với route 64:ff9b::/96.

- **A (Đúng):** Chính xác. DNS64 tổng hợp địa chỉ IPv6 dạng 64:ff9b::/96 cho các domain chỉ có bản ghi A (IPv4), sau đó NAT Gateway ở dual-stack public subnet thực hiện NAT64 để gửi gói tin IPv4 ra Internet qua IGW.
- **B:** Private NAT Gateway không thể gửi lưu lượng ra Internet qua IGW và subnet IPv6-only không hỗ trợ NAT Gateway đặt trực tiếp bên trong nó.
- **C:** Internet Gateway không thực hiện chức năng dịch NAT64; tiền tố 64:ff9b::/96 phải được trỏ về NAT Gateway.
- **D:** EIGW chỉ định tuyến lưu lượng IPv6 thuần túy ra Internet, không thực hiện dịch địa chỉ từ IPv6 sang IPv4.

</details>

### Câu 8 `hard`

An enterprise uses Amazon VPC IPAM across 200 AWS accounts. The security team mandates that all production VPCs in eu-west-1 must receive a /20 IPv4 CIDR from a regional IPAM pool, while development VPCs must be blocked from using any CIDR outside the designated non-prod pool. Additionally, the team wants to bring their own public IPv4 /22 range (BYOIP) into IPAM for Elastic IPs. Which IPAM configuration satisfies these requirements?

- **A.** Create a top-level IPAM pool with RFC 1918 sub-pools per Region shared via AWS RAM, and provision the BYOIP /22 range into a Public IPv4 pool.
- **B.** Configure AWS Organizations SCPs to hardcode allowed /20 CIDR blocks for every production account and block non-prod CIDRs.
- **C.** Use AWS Config custom Lambda rules to assign /20 CIDRs during VPC creation and import the BYOIP /22 range into Amazon Route 53.
- **D.** Create a single IPAM Private Scope containing both the private RFC 1918 CIDRs and the public BYOIP /22 CIDR in the exact same regional IPAM pool.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp sử dụng Amazon VPC IPAM trên 200 tài khoản AWS. Đội ngũ bảo mật bắt buộc tất cả các VPC production tại eu-west-1 phải nhận một IPv4 CIDR /20 từ một IPAM pool theo Region, trong khi các VPC development phải bị chặn không được sử dụng bất kỳ CIDR nào nằm ngoài pool non-prod được chỉ định. Ngoài ra, đội ngũ muốn đưa dải IPv4 công cộng /22 của riêng họ (BYOIP) vào IPAM cho các Elastic IP. Cấu hình IPAM nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **A**

Amazon VPC IPAM quản lý tập trung cả không gian địa chỉ Private (theo cấu trúc phân cấp Top-level/Regional/Environment pools chia sẻ qua RAM) lẫn Public IPv4 (BYOIP) để cấp phát Elastic IP và kiểm soát netmask tối thiểu/tối đa.

- **A (Đúng):** Chính xác. VPC IPAM hỗ trợ phân cấp pool (Top-level -> Regional -> Env) chia sẻ qua AWS RAM với các rule giới hạn netmask (/20) và hỗ trợ BYOIP thông qua Public IPv4 IPAM pool để cấp phát Elastic IP.
- **B:** SCP không thể tự động cấp phát và theo dõi CIDR không trùng lặp như VPC IPAM.
- **C:** AWS Config chỉ phát hiện/đánh giá tuân thủ chứ không cấp phát CIDR tự động, và Route 53 không quản lý BYOIP cho Elastic IP.
- **D:** Private IPv4 pool và Public IPv4 (BYOIP) pool không thể gộp chung một pool; chúng sử dụng các thuộc tính address-family/public-ip-source khác nhau.

</details>

### Câu 9 `medium`

A solutions architect is designing a standardized IPv6 dual-stack VPC architecture for 60 application teams. The requirements state that all public-facing ALBs must accept both IPv4 and IPv6 traffic, backend EC2 instances in private subnets must initiate IPv6 outbound connections to the internet without allowing inbound internet-initiated IPv6 connections, and VPC CIDR management must be automated. Which TWO actions should the architect take? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Configure a NAT Gateway in the public subnet and route ::/0 from private subnets to the NAT Gateway for IPv6-to-IPv6 internet egress traffic.
- **B.** Route ::/0 in the private subnet route table directly to the Internet Gateway and use NACLs to block all inbound ports.
- **C.** Set the ALB IP address type to ipv4 and enable IPv6 target group routing only.
- **D.** Provision an IPv6 IPAM pool in Amazon VPC IPAM and allocate /56 IPv6 CIDRs to each dual-stack VPC.
- **E.** Attach an Egress-Only Internet Gateway (EIGW) to each VPC and add a ::/0 route pointing to the EIGW in the private subnet route tables.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiến trúc sư giải pháp đang thiết kế kiến trúc VPC dual-stack IPv6 chuẩn hóa cho 60 nhóm ứng dụng. Yêu cầu nêu rõ tất cả các ALB hướng công cộng phải chấp nhận cả lưu lượng IPv4 và IPv6, các EC2 instance backend trong private subnet phải khởi tạo được kết nối IPv6 đi ra internet mà không cho phép kết nối IPv6 đi vào được khởi tạo từ internet, và việc quản lý VPC CIDR phải được tự động hóa. Kiến trúc sư nên thực hiện HAI hành động nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **D, E**

Kiến trúc Dual-Stack chuẩn trên AWS sử dụng VPC IPAM để cấp phát tự động dải /56 IPv6 cho VPC, ALB chế độ dualstack cho public ingress, và Egress-Only Internet Gateway (EIGW) cho outbound IPv6 stateful từ private subnet.

- **A:** NAT Gateway không thực hiện NAT cho lưu lượng IPv6-to-IPv6; để ra Internet bằng IPv6 từ private subnet phải dùng EIGW.
- **B:** Trỏ ::/0 tới IGW biến subnet thành public cho IPv6 và NACL là stateless (khó quản lý ephemeral ports), không thay thế được tính năng bảo vệ stateful của EIGW.
- **C:** Để ALB nhận cả lưu lượng IPv4 và IPv6 từ client, phải đặt IP address type của ALB là dualstack.
- **D (Đúng):** Chính xác. VPC IPAM hỗ trợ quản lý và tự động cấp phát dải /56 IPv6 CIDR (cả IPv6 do AWS cấp hoặc BYOIPv6) cho các VPC một cách nhất quán.
- **E (Đúng):** Chính xác. EIGW là gateway stateful cho phép outbound IPv6 từ private subnet ra Internet nhưng chặn mọi kết nối IPv6 khởi tạo từ Internet vào.

</details>

### Câu 10 `hard`

A company is deploying an IPv6-only workload in private subnets in us-west-2. These instances need to access Amazon S3 and Amazon DynamoDB over private AWS network paths without traversing a NAT Gateway or the public internet, and they also need to communicate with an on-premises IPv4-only mainframe over AWS Direct Connect. Which architecture satisfies both requirements?

- **A.** Enable IPv6 on the Direct Connect Private VIF and assign an IPv6 address directly to the on-premises IPv4-only mainframe without NAT64.
- **B.** Use Dual-stack Gateway VPC Endpoints for S3/DynamoDB, and DNS64/NAT64 on a Private NAT Gateway routing 64:ff9b::/96 to Direct Connect.
- **C.** Use an Egress-Only Internet Gateway (EIGW) for both private Amazon S3 access and the on-premises IPv4-only mainframe.
- **D.** Configure an Interface VPC Endpoint (AWS PrivateLink) pointing directly to the on-premises IPv4 mainframe.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty đang triển khai một workload IPv6-only trong các private subnet tại us-west-2. Các instance này cần truy cập Amazon S3 và Amazon DynamoDB qua các đường mạng riêng của AWS mà không đi qua NAT Gateway hay internet công cộng, và chúng cũng cần giao tiếp với một mainframe chỉ hỗ trợ IPv4 tại chỗ qua AWS Direct Connect. Kiến trúc nào đáp ứng cả hai yêu cầu?

**Đáp án đúng:** **B**

Trên mạng IPv6-only: (1) S3/DynamoDB sử dụng Dual-stack Gateway VPC Endpoints để đi nội bộ qua AWS backbone; (2) Kết nối tới hệ thống IPv4-only on-premises qua Direct Connect sử dụng DNS64 kết hợp NAT64 trên NAT Gateway.

- **A:** Đề bài nêu rõ mainframe là IPv4-only (không hỗ trợ IPv6), nên bắt buộc phải có lớp dịch NAT64.
- **B (Đúng):** Chính xác. Gateway VPC Endpoints hỗ trợ IPv6 (dual-stack) cho S3/DynamoDB hoàn toàn miễn phí và private; còn để IPv6-only instance gọi được tới mainframe IPv4-only qua Direct Connect, cần dùng DNS64 + Private NAT Gateway thực hiện NAT64 cho tiền tố 64:ff9b::/96.
- **C:** EIGW chỉ đi ra Internet bằng IPv6, không kết nối được tới mainframe IPv4-only qua Direct Connect và đẩy traffic S3 ra Internet.
- **D:** Interface VPC Endpoint (PrivateLink) chỉ kết nối tới dịch vụ trong VPC/AWS, không thể trỏ trực tiếp tới một mainframe IPv4-only nằm on-premises mà không có proxy/NLB trung gian.

</details>

### Câu 11 `hard`

A large enterprise is migrating workloads to IPv6-only subnets in an AWS VPC due to severe RFC 1918 IPv4 exhaustion. EC2 instances in these IPv6-only subnets must initiate outbound connections to both IPv6-enabled Internet APIs and legacy third-party IPv4-only SaaS APIs, while all unsolicited inbound connections from the Internet must be blocked. Which combination of VPC components should the architect deploy?

- **A.** Deploy an Egress-Only IGW for outbound IPv6, enable DNS64 on IPv6-only subnets, and route 64:ff9b::/96 to a NAT64 Gateway in a dual-stack subnet.
- **B.** Assign Elastic IPv6 addresses to the EC2 instances and attach an AWS Network Firewall to perform IPv6-to-IPv4 translation.
- **C.** Deploy a NAT Gateway in the IPv6-only subnet and route both ::/0 and 0.0.0.0/0 default destinations directly to the NAT Gateway.
- **D.** Attach an Internet Gateway only, configure a Stateful Security Group, and enable DNS64 on the IPv6-only subnets for IPv4 SaaS APIs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp lớn đang di chuyển các workload sang các subnet chỉ dùng IPv6 (IPv6-only) trong một AWS VPC do tình trạng cạn kiệt địa chỉ IPv4 RFC 1918 nghiêm trọng. Các EC2 instance trong các subnet IPv6-only này phải khởi tạo kết nối đi ra (outbound) đến cả các API Internet hỗ trợ IPv6 lẫn các API SaaS bên thứ ba cũ chỉ hỗ trợ IPv4, trong khi mọi kết nối đi vào (inbound) không được yêu cầu từ Internet phải bị chặn. Kiến trúc sư nên triển khai sự kết hợp thành phần VPC nào?

**Đáp án đúng:** **A**

Kiến trúc chuẩn cho IPv6-only subnet trên AWS gồm Egress-Only Internet Gateway (cho outbound IPv6 một chiều) kết hợp DNS64 + NAT64 (qua NAT Gateway) để truy cập dịch vụ IPv4-only.

- **A (Đúng):** Egress-Only Internet Gateway (EIGW) cho phép outbound IPv6 và chặn mọi inbound IPv6 từ Internet. Kết hợp DNS64 + NAT64 (trên NAT Gateway tại dual-stack public subnet) giúp workload IPv6-only giao tiếp trơn tru với đích IPv4-only.
- **B:** AWS không có khái niệm Elastic IPv6 address và AWS Network Firewall không thực hiện chức năng NAT64.
- **C:** NAT Gateway không thực hiện NAT cho lưu lượng IPv6-to-IPv6 (::/0) và không thể đặt trong IPv6-only subnet mà cần public subnet có IPv4 và Elastic IP.
- **D:** Nếu chỉ có DNS64 mà không có NAT64 (trên NAT Gateway) thì gói tin IPv6 tổng hợp (64:ff9b::/96) không thể dịch sang IPv4 để đi tới SaaS API IPv4-only.

</details>

### Câu 12 `medium`

An enterprise with 120 AWS accounts in AWS Organizations frequently suffers from overlapping VPC CIDR blocks created by autonomous teams and must retain a 2-year audit history of IP address assignments for security investigations. Which AWS service provides automated CIDR allocation, overlap detection, and historical IP tracking with minimal custom code?

- **A.** AWS Config with a custom AWS Lambda rule that scans VPC CIDR blocks daily across all 120 member accounts and logs overlaps.
- **B.** AWS Network Manager with Transit Gateway Route Analyzer and automated CIDR conflict remediation.
- **C.** Amazon Route 53 Resolver Query Logging combined with Amazon Athena SQL queries for IP audit history.
- **D.** Amazon VPC IP Address Manager (IPAM) integrated with AWS Organizations and delegated to a central networking account.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp có 120 tài khoản AWS trong AWS Organizations thường xuyên gặp tình trạng trùng lặp dải VPC CIDR do các nhóm tự trị tạo ra và phải lưu giữ lịch sử kiểm toán 2 năm về việc cấp phát địa chỉ IP cho các cuộc điều tra bảo mật. Dịch vụ AWS nào cung cấp khả năng cấp phát CIDR tự động, phát hiện trùng lặp và theo dõi lịch sử IP với ít mã nguồn tùy chỉnh nhất?

**Đáp án đúng:** **D**

Amazon VPC IPAM là dịch vụ quản trị không gian địa chỉ IP tập trung chuẩn cho AWS Organizations: tự động cấp CIDR, chống overlap và lưu lịch sử gán IP tối đa 3 năm.

- **A:** AWS Config không tự động cấp phát CIDR mới khi tạo VPC và không lưu trữ lịch sử gán IP ENI/Elastic IP tích hợp sẵn cho audit mạng quy mô lớn.
- **B:** Network Manager quản lý topology và phân tích route của TGW/Cloud WAN, không phải công cụ cấp phát CIDR hay lưu lịch sử IP.
- **C:** Route 53 Query Logging chỉ ghi lại truy vấn DNS, không quản lý hay cấp phát không gian địa chỉ CIDR.
- **D (Đúng):** Amazon VPC IPAM tích hợp trực tiếp với AWS Organizations, hỗ trợ tạo IP Pool phân cấp để tự động cấp CIDR không chồng lấn, cảnh báo overlap và lưu lịch sử gán IP lên đến 3 năm.

</details>

---

[Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md)
