# Bài tập tình huống — Kiến trúc VPC, Overlapping CIDR, VPC Peering & Shared VPC (AWS RAM)

> Thiết kế VPC quy mô lớn, chia sẻ Subnet qua AWS RAM, xử lý Overlapping CIDR, NAT Gateway vs Egress-Only IGW và VPC Endpoints.
> **Số câu hỏi:** 3 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A university is migrating a large high-performance computing (HPC) cluster to AWS. The cluster consists of 64 c6in.32xlarge EC2 instances in us-east-1 that exchange large MPI messages with each other. The network architect must minimize inter-instance latency, maximize single-flow throughput, and avoid packet loss during bursty all-to-all communications. Which combination of EC2 networking features should be configured?

- **A.** Launch all instances in a Cluster Placement Group, attach Elastic Fabric Adapter (EFA) network interfaces, and enable Jumbo Frames (9001 MTU).
- **B.** Place the 64 EC2 instances behind a Network Load Balancer with Cross-Zone Load Balancing and Proxy Protocol enabled.
- **C.** Launch all 64 c6in.32xlarge instances in a Spread Placement Group across three Availability Zones and use standard ENA interfaces with 1500 MTU.
- **D.** Connect the 64 HPC instances across multiple VPCs using an AWS Transit Gateway with ECMP routing enabled.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một trường đại học đang di chuyển một cụm điện toán hiệu năng cao (HPC) lớn lên AWS. Cụm gồm 64 EC2 instance c6in.32xlarge tại us-east-1 trao đổi các thông điệp MPI lớn với nhau. Kiến trúc sư mạng phải tối thiểu hóa độ trễ giữa các instance, tối đa hóa thông lượng đơn luồng (single-flow) và tránh mất gói trong các giao tiếp all-to-all đột biến. Nên cấu hình sự kết hợp các tính năng mạng EC2 nào?

**Đáp án đúng:** **A**

Đối với workload HPC/MPI cần độ trễ cực thấp và thông lượng cao trên AWS, kiến trúc chuẩn gồm: Cluster Placement Group (cùng AZ, gần nhau về vật lý) + Elastic Fabric Adapter (EFA - hỗ trợ OS-bypass và SRD protocol) + Jumbo Frames (9001 MTU).

- **A (Đúng):** Chính xác. Cluster Placement Group đặt các instance gần nhau trên cùng một hạ tầng vật lý để giảm thiểu độ trễ; Elastic Fabric Adapter (EFA) cung cấp cơ chế OS-bypass cho MPI/HPC với thông lượng cao và độ trễ cực thấp; cùng với Jumbo Frames (9001 MTU) trong VPC.
- **B:** HPC/MPI giao tiếp trực tiếp node-to-node, không đi qua Load Balancer và không dùng Cross-Zone.
- **C:** Spread Placement Group đặt các instance tách xa nhau trên các rack/AZ khác nhau, làm tăng độ trễ mạng và không tối ưu cho HPC/MPI.
- **D:** Đặt HPC cluster qua nhiều VPC và đi qua Transit Gateway làm tăng độ trễ đáng kể và không hỗ trợ EFA OS-bypass.

</details>

### Câu 2 `hard`

A multinational corporation has acquired a subsidiary whose on-premises network uses the exact same 10.0.0.0/16 IPv4 CIDR block as the corporation's primary AWS Transit Gateway-connected VPCs. Both environments must communicate bi-directionally over an AWS Site-to-Site VPN without re-addressing either network immediately. How can the network architect enable connectivity between the overlapping 10.0.0.0/16 networks?

- **A.** Enable Overlapping CIDR Support directly on the AWS Transit Gateway route table for both 10.0.0.0/16 environments.
- **B.** Configure a Gateway VPC Endpoint in the corporate VPC to translate the overlapping 10.0.0.0/16 routes over the AWS Site-to-Site VPN.
- **C.** Create a Translation VPC (e.g., 100.64.0.0/16) with a Private NAT Gateway and configure NAT rules on both sides to map 10.0.0.0/16.
- **D.** Use an Egress-Only Internet Gateway (EIGW) in the corporate VPC to translate overlapping IPv4 addresses bidirectionally.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tập đoàn đa quốc gia đã mua lại một công ty con có mạng tại chỗ sử dụng chính xác cùng dải IPv4 CIDR 10.0.0.0/16 với các VPC chính kết nối AWS Transit Gateway của tập đoàn. Cả hai môi trường phải giao tiếp hai chiều qua AWS Site-to-Site VPN mà không cần đánh địa chỉ lại bất kỳ mạng nào ngay lập tức. Kiến trúc sư mạng có thể cho phép kết nối giữa các mạng 10.0.0.0/16 trùng lặp bằng cách nào?

**Đáp án đúng:** **C**

Khi hai mạng IPv4 bị trùng CIDR (overlapping CIDRs) cần giao tiếp hai chiều ở Layer 3 qua Transit Gateway/VPN, giải pháp native trên AWS là sử dụng Private NAT Gateway đặt trong một Translation VPC trung gian có dải CIDR riêng (như CGNAT 100.64.0.0/10) kết hợp NAT ở phía đối tác.

- **A:** Transit Gateway không hỗ trợ định tuyến trực tiếp hai mạng có CIDR trùng nhau trong cùng một bảng định tuyến (sẽ gây xung đột route).
- **B:** Gateway VPC Endpoint chỉ dùng cho S3 và DynamoDB, không có chức năng NAT.
- **C (Đúng):** Chính xác. Private NAT Gateway (không cần IGW) kết hợp với một Translation VPC có dải CIDR không trùng lặp (ví dụ 100.64.0.0/16) cho phép dịch địa chỉ nguồn/đích qua Transit Gateway hoặc Direct Connect để kết nối hai mạng bị trùng CIDR.
- **D:** EIGW chỉ dành cho IPv6 outbound ra Internet, không thực hiện NAT cho IPv4.

</details>

### Câu 3 `medium`

A company acquires another organization and must allow applications in VPC-A (10.0.0.0/16) to initiate bidirectional connections to databases and APIs in VPC-B (10.0.0.0/16) via an existing AWS Transit Gateway. Re-addressing either VPC is not feasible in the short term. Which design enables connectivity without overlapping IP conflicts?

- **A.** Associate a non-overlapping secondary CIDR (e.g., 100.64.0.0/16) to each VPC, deploy Private NAT Gateways there, and route via Transit Gateway.
- **B.** Attach both VPC-A and VPC-B directly to the AWS Transit Gateway and enable Equal-Cost Multi-Path (ECMP) routing across overlapping CIDRs.
- **C.** Create an AWS Direct Connect Gateway and associate both VPC-A and VPC-B Virtual Private Gateways to route overlapping traffic.
- **D.** Establish a VPC Peering connection between VPC-A and VPC-B, update subnet route tables, and enable DNS resolution across the peering connection.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty mua lại một tổ chức khác và phải cho phép các ứng dụng trong VPC-A (10.0.0.0/16) khởi tạo kết nối hai chiều đến các cơ sở dữ liệu và API trong VPC-B (10.0.0.0/16) thông qua một AWS Transit Gateway hiện có. Việc đánh địa chỉ lại một trong hai VPC là không khả thi trong ngắn hạn. Thiết kế nào cho phép kết nối mà không xảy ra xung đột IP trùng lặp?

**Đáp án đúng:** **A**

Khi không thể đổi IP và cần kết nối qua TGW giữa các VPC trùng CIDR, giải pháp chuẩn của AWS là thêm secondary non-overlapping CIDR (như 100.64.0.0/10) và dùng Private NAT Gateway để NAT lưu lượng.

- **A (Đúng):** Thêm secondary CIDR không trùng lặp (ví dụ RFC 6598) kết hợp Private NAT Gateway cho phép thực hiện SNAT sang dải IP riêng biệt trước khi định tuyến qua Transit Gateway, giải quyết triệt để bài toán overlapping CIDR.
- **B:** Transit Gateway không thể định tuyến trực tiếp hai VPC có CIDR trùng lặp hoàn toàn (10.0.0.0/16); ECMP không giải quyết vấn đề overlapping CIDR.
- **C:** Direct Connect Gateway không hỗ trợ VPC-to-VPC routing và cũng không chấp nhận overlapping CIDR giữa các VPC gắn vào cùng một DXGW.
- **D:** VPC Peering nghiêm cấm hoàn toàn việc kết nối hai VPC có CIDR trùng lặp.

</details>

---

[Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md)
