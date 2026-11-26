# Bài tập tình huống — Chủ đề 5: Kiến trúc Mạng VPC & Hybrid Cloud — Subnets, NAT Gateway, VPC Endpoints, PrivateLink, VPN & Direct Connect

> VPC Subnetting, Security Groups vs NACLs, NAT Gateway HA, Gateway vs Interface VPC Endpoint (PrivateLink), Site-to-Site VPN & AWS Direct Connect.
> **Số câu hỏi:** 13 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A SaaS provider runs a microservice behind a Network Load Balancer (NLB) in `VPC-Provider`. Dozens of enterprise customers running workloads in their own separate VPCs (`VPC-Consumer-1`, `VPC-Consumer-2`, ...) want to call this SaaS microservice privately over the AWS network WITHOUT using the public internet, WITHOUT configuring VPC Peering, and even though several customer VPCs have overlapping CIDR blocks (`10.0.0.0/16`). What should the solutions architect recommend?

- **A.** Establish VPC Peering connections between `VPC-Provider` and all customer VPCs despite the overlapping `10.0.0.0/16` CIDR blocks.
- **B.** Create a Gateway VPC Endpoint in each customer VPC pointing directly to the custom Network Load Balancer in `VPC-Provider`.
- **C.** Expose the Network Load Balancer to the public internet over unencrypted TCP listeners and restrict access using NACLs.
- **D.** Configure an AWS PrivateLink VPC Endpoint Service backed by the NLB in `VPC-Provider`, with customers using Interface Endpoints.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà cung cấp SaaS chạy một microservice phía sau Network Load Balancer (NLB) trong `VPC-Provider`. Hàng chục khách hàng doanh nghiệp đang chạy workload trong các VPC riêng biệt của họ (`VPC-Consumer-1`, `VPC-Consumer-2`, ...) muốn gọi microservice SaaS này một cách riêng tư qua mạng AWS MÀ KHÔNG sử dụng internet công cộng, KHÔNG cấu hình VPC Peering và ngay cả khi một số VPC của khách hàng có dải CIDR trùng lặp (`10.0.0.0/16`). Solutions architect nên đề xuất giải pháp gì?

**Đáp án đúng:** **D**

Từ khóa nhận diện **AWS PrivateLink (VPC Endpoint Service)**: `expose custom service to other VPCs/customers privately`, `overlapping CIDR blocks`, `backed by Network Load Balancer (NLB)`, `no VPC peering required`.

- **A:** Sai vì VPC Peering không thể hoạt động giữa các VPC bị trùng dải IP (overlapping CIDR blocks).
- **B:** Sai vì Gateway VPC Endpoint chỉ dành riêng cho S3 và DynamoDB.
- **C:** Sai vì vi phạm yêu cầu kết nối mạng riêng tư.
- **D (Đúng):** Đúng! **AWS PrivateLink (VPC Endpoint Service + NLB)** cho phép cung cấp dịch vụ một chiều an toàn qua mạng nội bộ AWS cho hàng trăm VPC khách hàng mà không cần VPC Peering và hoàn toàn KHÔNG bị ảnh hưởng bởi việc trùng dải IP (overlapping CIDRs).

</details>

### Câu 2 `medium`

A bank has an existing 10 Gbps AWS Direct Connect connection between its on-premises data center and AWS. Compliance regulations require that all traffic traversing the Direct Connect connection be encrypted in transit using IPSec, and also require a cost-effective automatic backup connection in case the Direct Connect fiber link fails. Which architecture meets both requirements?

- **A.** Configure an AWS Site-to-Site VPN over Direct Connect (or MACsec) plus a backup Site-to-Site VPN over the internet to the same gateway.
- **B.** Leave the configuration unchanged because AWS Direct Connect automatically encrypts all Layer 3 traffic using IPSec by default.
- **C.** Replace the AWS Direct Connect connection with a VPC Internet Gateway and route all corporate data center traffic over public HTTP.
- **D.** Use Amazon Route 53 Simple Routing policies with health checks to encrypt and fail over private on-premises BGP sessions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ngân hàng hiện có kết nối AWS Direct Connect 10 Gbps giữa trung tâm dữ liệu on-premises và AWS. Các quy định tuân thủ yêu cầu toàn bộ lưu lượng đi qua kết nối Direct Connect phải được mã hóa khi truyền (in transit) bằng IPSec, đồng thời yêu cầu một kết nối dự phòng tự động tối ưu chi phí trong trường hợp đường cáp quang Direct Connect bị lỗi. Kiến trúc nào đáp ứng cả hai yêu cầu này?

**Đáp án đúng:** **A**

Ghi nhớ về **AWS Direct Connect (DX)**:
1. Mặc định **KHÔNG mã hóa** (cần kết hợp **Site-to-Site VPN over DX** hoặc **MACsec**).
2. Giải pháp dự phòng (Resilient backup) tiết kiệm chi phí nhất cho 1 đường DX là dùng thêm **AWS Site-to-Site VPN** (còn nếu đề bài yêu cầu **đảm bảo băng thông tối đa và SLA 99.99% không giảm tốc độ khi lỗi** thì mới chọn **2 đường Direct Connect ở 2 DX Locations khác nhau**).

- **A (Đúng):** Đúng! Mặc định Direct Connect không mã hóa; chạy Site-to-Site VPN IPSec kết hợp đường VPN dự phòng qua Internet vừa giải quyết bài toán mã hóa, vừa làm đường backup chi phí thấp khi đứt cáp DX.
- **B:** Sai vì đường truyền AWS Direct Connect mặc định là đường truyền riêng nhưng KHÔNG tự động mã hóa dữ liệu.
- **C:** Sai vì Internet Gateway không tạo đường truyền riêng từ trung tâm dữ liệu On-premises.
- **D:** Sai vì Route 53 là dịch vụ DNS, không mã hóa đường cáp vật lý Direct Connect.

</details>

### Câu 3 `hard`

A SaaS provider hosts a service behind a Network Load Balancer (NLB) in Account A (`10.0.0.0/16`). A customer in Account B has a VPC with the exact same overlapping CIDR block (`10.0.0.0/16`) and needs private, secure connectivity to the SaaS service without exposing traffic to the public internet. How should the solutions architect connect the two VPCs?

- **A.** Create a cross-account VPC Peering connection between Account A and Account B and update both route tables.
- **B.** Create an AWS PrivateLink VPC Endpoint Service in Account A backed by the NLB, and an Interface Endpoint in Account B.
- **C.** Attach both the provider VPC in Account A and the customer VPC in Account B to a shared AWS Transit Gateway.
- **D.** Create an AWS Site-to-Site VPN connection over the internet between the Virtual Private Gateways of both VPCs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà cung cấp SaaS lưu trữ một dịch vụ phía sau Network Load Balancer (NLB) trong Account A (`10.0.0.0/16`). Một khách hàng ở Account B có VPC với dải CIDR trùng lặp hoàn toàn (`10.0.0.0/16`) và cần kết nối riêng tư, an toàn tới dịch vụ SaaS mà không để lộ lưu lượng ra internet công cộng. Solutions architect nên kết nối hai VPC này bằng cách nào?

**Đáp án đúng:** **B**

Khi thấy từ khóa **overlapping CIDR blocks** giữa Provider VPC (NLB) và Consumer VPC → Đáp án duy nhất là **AWS PrivateLink (Interface VPC Endpoint)**.

- **A:** Sai vì VPC Peering không thể tạo được nếu hai VPC có dải CIDR trùng nhau (`10.0.0.0/16`).
- **B (Đúng):** Đúng! **AWS PrivateLink** hoạt động ở tầng kết nối dịch vụ (Service-level) thông qua NLB và Interface Endpoint ENI, hoàn toàn giải quyết được bài toán **overlapping CIDR blocks**.
- **C:** Sai vì Transit Gateway cũng không hỗ trợ định tuyến trực tiếp giữa hai VPC có dải CIDR trùng lặp.
- **D:** Sai vì VPN vẫn bị xung đột định tuyến khi hai bên trùng CIDR.

</details>

### Câu 4 `hard`

A cybersecurity team must inspect all incoming and outgoing VPC network traffic using a third-party stateful virtual firewall appliance (Palo Alto / Suricata) deployed in a centralized inspection VPC, without modifying packet headers. Which AWS Load Balancer should be placed in front of the firewall appliances?

- **A.** Application Load Balancer (ALB)
- **B.** Network Load Balancer (NLB)
- **C.** Gateway Load Balancer (GWLB)
- **D.** Classic Load Balancer (CLB)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm an ninh mạng phải kiểm tra toàn bộ lưu lượng mạng VPC đi vào và đi ra bằng thiết bị tường lửa ảo có trạng thái (stateful) của bên thứ ba (Palo Alto / Suricata) được triển khai trong một inspection VPC tập trung, mà không làm thay đổi packet header. Nên đặt AWS Load Balancer nào phía trước các thiết bị tường lửa này?

**Đáp án đúng:** **C**

Thấy từ khóa **third-party virtual firewall appliances / IDS / IPS / inline packet inspection** → Chọn **Gateway Load Balancer (GWLB)**.

- **A:** Sai vì ALB hoạt động ở Layer 7 (HTTP/HTTPS) và terminate kết nối từ client, không giữ nguyên gói tin Layer 3 cho firewall.
- **B:** Sai vì NLB hoạt động ở Layer 4 (TCP/UDP), không phải chuẩn GENEVE Layer 3 để chèn inline firewall.
- **C (Đúng):** Đúng! **Gateway Load Balancer (GWLB)** hoạt động ở Layer 3 (giao thức GENEVE port 6081), chuyên dùng để triển khai và auto-scale các cụm Virtual Appliances (Firewall, IDS/IPS) inline một cách minh bạch.
- **D:** Sai vì CLB là thế hệ cũ không hỗ trợ GENEVE hay inline firewall inspection.

</details>

### Câu 5 `medium`

A company has an AWS Direct Connect connection between its on-premises data center and a VPC. Compliance regulations require that all traffic traversing the Direct Connect link must be encrypted in transit using IPsec. How should the solutions architect achieve this?

- **A.** Configure an AWS Site-to-Site VPN connection over a Direct Connect Public Virtual Interface (VIF).
- **B.** Use a Private Virtual Interface (VIF) directly, as Direct Connect encrypts all traffic by default.
- **C.** Create a Gateway VPC Endpoint for AWS Direct Connect and attach it to the private subnet route tables.
- **D.** Enable SSL/TLS certificate termination directly on the VPC Virtual Private Gateway (VGW) interface.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có kết nối AWS Direct Connect giữa trung tâm dữ liệu on-premises và một VPC. Các quy định tuân thủ yêu cầu toàn bộ lưu lượng đi qua đường truyền Direct Connect phải được mã hóa khi truyền (in transit) bằng IPsec. Solutions architect nên thực hiện điều này như thế nào?

**Đáp án đúng:** **A**

Direct Connect **không mã hóa mặc định**. Khi đề bài yêu cầu **Direct Connect + IPsec encryption** → **Site-to-Site VPN over Direct Connect Public VIF**.

- **A (Đúng):** Đúng! Chạy **AWS Site-to-Site VPN (IPsec) bên trên Direct Connect Public VIF** (hoặc Transit VIF tới TGW) vừa tận dụng băng thông ổn định của Direct Connect vừa đảm bảo **mã hóa IPsec End-to-End**.
- **B:** Sai! Direct Connect KHÔNG mã hóa dữ liệu theo mặc định (trừ khi bật MACsec ở phần cứng Layer 2 tương thích, nhưng chuẩn SAA-C03 cho IPsec end-to-end là chạy VPN over Public VIF).
- **C:** Sai vì không có Gateway VPC Endpoint cho Direct Connect.
- **D:** Sai vì VGW không có tính năng bật SSL/TLS trực tiếp trên Private VIF.

</details>

### Câu 6 `easy`

An application runs on EC2 instances inside private subnets across 3 Availability Zones. All private subnets currently point `0.0.0.0/0` to a single NAT Gateway located in Availability Zone A. During an outage in Availability Zone A, EC2 instances in Availability Zones B and C lose outbound internet access. How should the architect fix this single point of failure?

- **A.** Attach multiple Elastic IP addresses to the existing NAT Gateway in AZ A for automatic multi-AZ failover.
- **B.** Replace the NAT Gateway with an Egress-Only Internet Gateway to distribute IPv4 outbound traffic across AZs.
- **C.** Deploy a NAT Gateway in each of the 3 AZs and point each AZ's private subnet route table to its local NAT Gateway.
- **D.** Enable the Multi-AZ high-availability flag on the existing NAT Gateway in Availability Zone A.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng chạy trên các EC2 instance bên trong các private subnet trên 3 Availability Zone. Tất cả private subnet hiện đều trỏ `0.0.0.0/0` tới một NAT Gateway duy nhất đặt tại Availability Zone A. Khi xảy ra sự cố ở Availability Zone A, các EC2 instance tại Availability Zone B và C mất kết nối internet đi ra ngoài. Kiến trúc sư nên khắc phục điểm lỗi đơn (single point of failure) này bằng cách nào?

**Đáp án đúng:** **C**

Kiến trúc chuẩn High Availability cho NAT Gateway: **1 NAT Gateway trong Public Subnet ở mỗi AZ**, kết hợp Route Table riêng cho Private Subnet của AZ đó.

- **A:** Sai vì NAT Gateway vẫn nằm vật lý ở AZ A nên vẫn chết khi AZ A sập.
- **B:** Sai vì Egress-Only Internet Gateway chỉ hỗ trợ IPv6, không hỗ trợ IPv4.
- **C (Đúng):** Đúng! NAT Gateway là dịch vụ cấp AZ. Triển khai **1 NAT Gateway mỗi AZ** và cấu hình Route Table nội bộ theo từng AZ vừa đảm bảo **High Availability** vừa **tránh phí Cross-AZ data transfer**.
- **D:** Sai vì không có nút bật Multi-AZ cho một NAT Gateway đơn lẻ.

</details>

### Câu 7 `medium`

A company has EC2 instances in private subnets that need to download and upload large files to Amazon S3. Traffic between the EC2 instances and S3 must never traverse the public internet, and the company wants to avoid paying hourly and per-GB data processing charges associated with NAT Gateways. Which solution meets these requirements?

- **A.** Create a Gateway VPC Endpoint for Amazon S3 and associate it with the route tables of the private subnets.
- **B.** Create an Interface VPC Endpoint (AWS PrivateLink) for Amazon S3 in each private subnet.
- **C.** Attach an Internet Gateway to the VPC and route S3 traffic through a NAT Gateway.
- **D.** Configure a VPC Peering connection between the VPC and the Amazon S3 service.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có các EC2 instance trong private subnet cần tải xuống và tải lên các tệp lớn tới Amazon S3. Lưu lượng giữa các EC2 instance và S3 không bao giờ được đi qua internet công cộng, và công ty muốn tránh trả phí theo giờ cũng như phí xử lý dữ liệu theo GB gắn với NAT Gateway. Giải pháp nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **A**

Nhớ ngay quy tắc SAA-C03: Kết nối từ Private Subnet tới **S3 hoặc DynamoDB** không qua Internet và miễn phí -> luôn chọn **Gateway VPC Endpoint**.

- **A (Đúng):** Đúng! Gateway VPC Endpoint hỗ trợ Amazon S3 và DynamoDB hoàn toàn miễn phí, định tuyến lưu lượng nội bộ qua mạng AWS mà không đi qua Internet hay NAT Gateway.
- **B:** Sai vì Interface VPC Endpoint cho S3 tính phí theo giờ và theo GB dữ liệu truyền qua, trong khi Gateway VPC Endpoint cho S3 hoàn toàn miễn phí.
- **C:** Sai vì dùng NAT Gateway vừa tốn phí giờ + phí per-GB, vừa đi ra public endpoint của S3 qua Internet.
- **D:** Sai vì không thể tạo VPC Peering trực tiếp tới dịch vụ Amazon S3.

</details>

### Câu 8 `medium`

A company has an AWS Direct Connect connection linking its on-premises data center to an AWS VPC. Management requires a resilient backup connection in case the Direct Connect link fails, and the backup must be provisioned quickly at minimal cost. All traffic over the backup must be encrypted in transit. Which solution meets these requirements?

- **A.** Order a second AWS Direct Connect connection from a different telecommunications provider.
- **B.** Use AWS PrivateLink to connect the on-premises router directly to the VPC.
- **C.** Provision an AWS Site-to-Site VPN connection over the internet as a failover backup to the Direct Connect connection, using BGP for automatic route failover.
- **D.** Enable Amazon Route 53 Geolocation routing to redirect on-premises traffic to a public ALB.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có kết nối AWS Direct Connect nối trung tâm dữ liệu on-premises với một AWS VPC. Ban quản lý yêu cầu một kết nối dự phòng có khả năng phục hồi cao trong trường hợp đường truyền Direct Connect bị lỗi, và kết nối dự phòng phải được cấp phát nhanh chóng với chi phí tối thiểu. Toàn bộ lưu lượng qua kết nối dự phòng phải được mã hóa khi truyền (in transit). Giải pháp nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **C**

Mẫu câu hỏi kinh điển của SAA-C03: Backup nhanh, chi phí thấp và có mã hóa cho **Direct Connect** -> chọn **AWS Site-to-Site VPN** (dùng BGP để tự động failover).

- **A:** Sai vì triển khai đường Direct Connect thứ hai tốn nhiều tuần/tháng và chi phí cao hơn nhiều so với yêu cầu 'provisioned quickly at minimal cost'.
- **B:** Sai vì PrivateLink không phải là kết nối WAN thay thế cho Direct Connect giữa on-premises và AWS.
- **C (Đúng):** Đúng! AWS Site-to-Site VPN triển khai nhanh (vài phút), chi phí thấp và mã hóa IPSec sẵn, kết hợp BGP để tự động chuyển hướng (failover) khi đường truyền Direct Connect gặp sự cố.
- **D:** Sai vì Route 53 không thiết lập đường truyền mạng riêng (private tunnel) thay thế Direct Connect.

</details>

### Câu 9 `hard`

A SaaS provider runs an analytics service behind a Network Load Balancer (NLB) in its own AWS account (Provider VPC). Thousands of enterprise customers want to consume this service privately from their own VPCs without opening traffic to the internet and without needing to manage overlapping CIDR blocks. Which AWS feature should the SaaS provider use?

- **A.** Establish VPC Peering connections between the Provider VPC and every customer VPC across all accounts.
- **B.** Attach an AWS Transit Gateway to the Provider VPC and share it with all customer accounts via AWS RAM.
- **C.** Expose the NLB over the public internet and restrict customer source IP addresses using a Security Group.
- **D.** Create a VPC Endpoint Service powered by AWS PrivateLink backed by the NLB for Interface VPC Endpoints.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà cung cấp SaaS vận hành dịch vụ phân tích phía sau Network Load Balancer (NLB) trong AWS account riêng của họ (Provider VPC). Hàng nghìn khách hàng doanh nghiệp muốn sử dụng dịch vụ này một cách riêng tư từ VPC của chính họ mà không mở lưu lượng ra internet và không cần xử lý các dải CIDR trùng lặp. Nhà cung cấp SaaS nên sử dụng tính năng AWS nào?

**Đáp án đúng:** **D**

Khi nhà cung cấp SaaS muốn chia sẻ một dịch vụ qua **NLB** tới nhiều VPC khác một cách riêng tư và **tránh xung đột overlapping CIDR** -> Đáp án là **AWS PrivateLink (VPC Endpoint Service)**.

- **A:** Sai vì VPC Peering không hoạt động nếu các VPC có CIDR trùng nhau và có giới hạn số lượng peering mỗi VPC.
- **B:** Sai vì Transit Gateway cũng yêu cầu các VPC không được trùng lặp CIDR và mở rộng phạm vi mạng quá mức cần thiết so với chỉ expose 1 dịch vụ.
- **C:** Sai vì yêu cầu bắt buộc kết nối riêng tư không đi qua public internet và NLB không có Security Group gắn trực tiếp như ALB (trừ cấu hình target/NLB SG mới nhưng vẫn đi qua internet nếu public).
- **D (Đúng):** Đúng! AWS PrivateLink (VPC Endpoint Service gắn với NLB) cho phép cung cấp dịch vụ riêng tư cho hàng nghìn VPC khách hàng mà không cần VPC Peering và hoàn toàn không bị ảnh hưởng bởi trùng lặp dải IP (overlapping CIDR).

</details>

### Câu 10 `hard`

A security-conscious organization must inspect all incoming and outgoing VPC network traffic using a fleet of third-party virtual firewall appliances deployed in a centralized Inspection VPC. The solution must scale horizontally and preserve the original source and destination IP addresses without modifying packets. Which load balancer should be placed in front of the firewall appliances?

- **A.** Application Load Balancer (ALB)
- **B.** Network Load Balancer (NLB)
- **C.** Gateway Load Balancer (GWLB)
- **D.** Classic Load Balancer (CLB)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức chú trọng bảo mật phải kiểm tra toàn bộ lưu lượng mạng VPC đi vào và đi ra bằng một cụm thiết bị tường lửa ảo của bên thứ ba được triển khai trong một Inspection VPC tập trung. Giải pháp phải mở rộng theo chiều ngang và giữ nguyên địa chỉ IP nguồn và đích ban đầu mà không sửa đổi gói tin. Nên đặt load balancer nào phía trước các thiết bị tường lửa này?

**Đáp án đúng:** **C**

Khi đề bài nhắc tới **third-party virtual appliances (firewall, IDS/IPS, deep packet inspection)** ở Layer 3 và cần **scale horizontally** -> Đáp án luôn là **Gateway Load Balancer (GWLB)**.

- **A:** Sai vì ALB hoạt động ở Layer 7 (HTTP/HTTPS) và ngắt kết nối TCP (terminate connection), không dùng cho deep packet inspection ở Layer 3.
- **B:** Sai vì NLB hoạt động ở Layer 4 (TCP/UDP) cho ứng dụng đích, không hỗ trợ giao thức GENEVE và mô hình bump-in-the-wire cho thiết bị tường lửa.
- **C (Đúng):** Đúng! Gateway Load Balancer hoạt động ở Layer 3 (IP packets) sử dụng giao thức GENEVE (port 6081), chuyên dùng để triển khai, scale và cân bằng tải cho các thiết bị bảo mật mạng (firewall, IDS/IPS) một cách trong suốt.
- **D:** Sai vì CLB là thế hệ cũ không hỗ trợ inspection appliance với GENEVE.

</details>

### Câu 11 `medium`

A web application runs on EC2 instances in private subnets across three Availability Zones. The instances must make outbound HTTPS calls to an external payment gateway API on the internet. The architecture must be highly available so that the failure of a single Availability Zone does not disrupt outbound internet connectivity for instances in the remaining healthy Availability Zones. What should the solutions architect deploy?

- **A.** Deploy a NAT Gateway in a public subnet in each AZ and route each private subnet's `0.0.0.0/0` to its local NAT Gateway.
- **B.** Deploy a single NAT Gateway in one public subnet and share it across all private subnets in all three Availability Zones.
- **C.** Attach an Internet Gateway directly to the private subnets' route tables for `0.0.0.0/0` outbound traffic.
- **D.** Deploy an Egress-Only Internet Gateway in the VPC for outbound IPv4 payment gateway traffic.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng web chạy trên các EC2 instance trong private subnet trên ba Availability Zone. Các instance phải thực hiện các lệnh gọi HTTPS đi ra ngoài tới một API cổng thanh toán bên ngoài trên internet. Kiến trúc phải có tính sẵn sàng cao sao cho sự cố của một Availability Zone đơn lẻ không làm gián đoạn kết nối internet đi ra ngoài của các instance tại các Availability Zone khỏe mạnh còn lại. Solutions architect nên triển khai gì?

**Đáp án đúng:** **A**

Để đảm bảo **NAT Gateway High Availability** trên nhiều AZ: Mỗi AZ có **1 NAT Gateway trong Public Subnet** và **Private Subnet của AZ đó trỏ tới NAT Gateway cùng AZ** (vừa HA, vừa tránh phí truyền dữ liệu cross-AZ).

- **A (Đúng):** Đúng! NAT Gateway là tài nguyên gắn với từng AZ. Để đạt High Availability đa AZ, cần triển khai NAT Gateway ở mỗi AZ (trong public subnet) và trỏ route table của private subnet cùng AZ tới NAT Gateway đó.
- **B:** Sai vì nếu AZ chứa NAT Gateway duy nhất bị sập, các private subnet ở 2 AZ còn lại sẽ mất kết nối outbound internet (Single Point of Failure).
- **C:** Sai vì nếu trỏ `0.0.0.0/0` tới IGW thì subnet đó trở thành public subnet và EC2 không có public IP cũng không thể đi ra IGW.
- **D:** Sai vì Egress-Only Internet Gateway chỉ hỗ trợ lưu lượng **IPv6**, không hỗ trợ IPv4.

</details>

### Câu 12 `medium`

A network administrator is troubleshooting intermittent connection drops between an application server in a private subnet and an Amazon RDS database in another subnet within the same VPC. The administrator needs to capture metadata about accepted and rejected IP traffic (source/destination IP, port, protocol) without installing any agents on the EC2 instances. Which feature should be enabled?

- **A.** AWS CloudTrail Data Events for EC2 and RDS
- **B.** VPC Flow Logs published to CloudWatch Logs or S3
- **C.** Amazon CloudWatch Agent installed on the EC2 instance
- **D.** Application Load Balancer (ALB) Access Logs

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một quản trị viên mạng đang khắc phục sự cố rớt kết nối gián đoạn giữa máy chủ ứng dụng trong private subnet và cơ sở dữ liệu Amazon RDS trong một subnet khác thuộc cùng VPC. Quản trị viên cần thu thập siêu dữ liệu (metadata) về lưu lượng IP được chấp nhận và bị từ chối (IP nguồn/đích, cổng, giao thức) mà không cần cài đặt bất kỳ agent nào trên các EC2 instance. Nên bật tính năng nào?

**Đáp án đúng:** **B**

Khi cần kiểm tra lưu lượng mạng bị **ACCEPT hay REJECT** bởi Security Group / NACL trong VPC mà không cần agent -> Bật **VPC Flow Logs**.

- **A:** Sai vì CloudTrail ghi lại các lời gọi AWS API (Control/Data plane), không ghi nhận các gói tin mạng TCP/UDP trong VPC.
- **B (Đúng):** Đúng! VPC Flow Logs ghi lại thông tin metadata của lưu lượng IP đi vào và đi ra từ các ENI (bao gồm cả trạng thái ACCEPT/REJECT do Security Group hoặc NACL) mà không cần cài agent.
- **C:** Sai vì cần cài agent lên EC2 (trái yêu cầu) và không theo dõi được lưu lượng bị chặn tại ENI/NACL mức VPC.
- **D:** Sai vì ALB Access Logs chỉ ghi lại HTTP requests đi qua Load Balancer, không ghi lại kết nối từ EC2 tới RDS.

</details>

### Câu 13 `medium`

A company runs 50 Amazon EC2 instances in private subnets within a VPC. These instances read and write terabytes of data daily to Amazon S3 and Amazon DynamoDB in the same AWS Region. Monthly billing reports show high NAT gateway data processing charges. Which solution will eliminate the NAT gateway data processing charges for this traffic while keeping the EC2 instances private?

- **A.** Replace the NAT gateways with an AWS Transit Gateway and route all S3 and DynamoDB traffic through a central inspection VPC.
- **B.** Create Gateway VPC Endpoints for Amazon S3 and Amazon DynamoDB, and associate them with the private subnet route tables.
- **C.** Move the 50 EC2 instances into public subnets, assign Elastic IP addresses, and route S3 and DynamoDB traffic through an Internet Gateway.
- **D.** Provision an AWS Direct Connect connection with a Public VIF to route S3 and DynamoDB requests privately over a dedicated fiber link.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty chạy 50 Amazon EC2 instance trong các private subnet thuộc một VPC. Các instance này đọc và ghi hàng terabyte dữ liệu mỗi ngày tới Amazon S3 và Amazon DynamoDB trong cùng AWS Region. Báo cáo hóa đơn hàng tháng cho thấy chi phí xử lý dữ liệu qua NAT gateway rất cao. Giải pháp nào sẽ loại bỏ chi phí xử lý dữ liệu qua NAT gateway cho lưu lượng này trong khi vẫn giữ các EC2 instance ở trạng thái private?

**Đáp án đúng:** **B**

Mẹo tối ưu chi phí mạng số 1 trong SAA-C03: Lưu lượng từ Private Subnet đi tới **Amazon S3** hoặc **Amazon DynamoDB** cùng Region luôn nên đi qua **Gateway VPC Endpoint** vì **MIỄN PHÍ 100%**.

- **A:** Sai vì Transit Gateway dùng để kết nối nhiều VPC và mạng on-premises lại với nhau, đồng thời có tính phí theo giờ và theo GB dữ liệu.
- **B (Đúng):** Đúng! Gateway VPC Endpoint hỗ trợ S3 và DynamoDB hoàn toàn miễn phí (không tính phí giờ hoạt động và không tính phí xử lý dữ liệu qua NAT Gateway).
- **C:** Sai vì vi phạm yêu cầu giữ các máy chủ EC2 hoàn toàn trong mạng riêng (Private Subnets).
- **D:** Sai vì Direct Connect dùng để nối từ trung tâm dữ liệu On-premises lên AWS, không phải để nối từ VPC nội bộ ra S3.

</details>

---

[Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md)
