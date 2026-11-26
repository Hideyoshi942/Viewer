# Bài tập tình huống — Direct Connect Resiliency, LAG, MACsec & Transit Gateway Multicast

> Mô hình High/Maximum Resiliency (99.9% - 99.99%), Dedicated vs Hosted Connection, LACP LAG, Resiliency Toolkit và IGMPv2 Multicast trên TGW.
> **Số câu hỏi:** 7 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A healthcare company requires Maximum Resiliency (99.99% SLA) for its AWS Direct Connect connectivity to a mission-critical workload in us-east-1. Which physical topology meets the AWS Direct Connect Maximum Resiliency model?

- **A.** Two Direct Connect connections at a single Direct Connect location terminated on two separate AWS devices with BGP ECMP enabled.
- **B.** Four Direct Connect connections across two DX locations, with two connections per location terminating on distinct devices.
- **C.** Two Direct Connect connections across two different Direct Connect locations, with one dedicated connection per location and a Site-to-Site VPN backup.
- **D.** One Direct Connect connection backed up by an AWS Site-to-Site VPN connection over the internet.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty y tế yêu cầu Maximum Resiliency (SLA 99.99%) cho kết nối AWS Direct Connect đến một workload tối quan trọng tại us-east-1. Cấu trúc liên kết vật lý nào đáp ứng mô hình Maximum Resiliency của AWS Direct Connect?

**Đáp án đúng:** **B**

AWS định nghĩa Maximum Resiliency (99.99% SLA) cần 4 connections tại 2 locations (2 connections mỗi location), trong khi High Resiliency (99.9% SLA) cần 2 connections ở 2 locations khác nhau.

- **A:** Hai kết nối tại cùng một Direct Connect location chỉ đạt mức High Resiliency (chưa chống được rủi ro mất toàn bộ location).
- **B (Đúng):** Chính xác. Mô hình Maximum Resiliency (99.99% SLA) yêu cầu ít nhất 4 kết nối tại tối thiểu 2 Direct Connect locations độc lập (mỗi location 2 kết nối tới 2 router khác nhau).
- **C:** Hai kết nối ở 2 location khác nhau tương ứng với mô hình High Resiliency (99.9% SLA), chưa đạt mức Maximum Resiliency (99.99% SLA).
- **D:** Đây là mô hình Development/Test hoặc Basic redundancy, không đạt SLA 99.99% của Direct Connect.

</details>

### Câu 2 `hard`

A media company needs to achieve Maximum Resiliency (99.99% SLA) for its AWS Direct Connect connectivity between two on-premises data centers and workloads in us-west-2. The company must tolerate the failure of an entire Direct Connect location as well as a single router failure at any location. How should the company design the Direct Connect connections?

- **A.** Provision at least four connections across at least two DX locations (two per location on separate AWS and customer routers).
- **B.** Provision two 10 Gbps dedicated connections at a single Direct Connect location, terminate them on separate customer routers, and bundle them into a single LACP LAG.
- **C.** Provision two connections at Location A with a Site-to-Site VPN backup over the public internet using AWS Transit Gateway.
- **D.** Provision one connection at Location A and one connection at Location B, terminating both dedicated links on a single customer router.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty truyền thông cần đạt Maximum Resiliency (SLA 99.99%) cho kết nối AWS Direct Connect giữa hai trung tâm dữ liệu tại chỗ và các workload tại us-west-2. Công ty phải chịu được sự cố mất toàn bộ một vị trí Direct Connect cũng như sự cố hỏng một router đơn lẻ tại bất kỳ vị trí nào. Công ty nên thiết kế các kết nối Direct Connect như thế nào?

**Đáp án đúng:** **A**

AWS Direct Connect cung cấp hai mức SLA: High Resiliency (99.9% - tối thiểu 2 kết nối ở 2 location khác nhau) và Maximum Resiliency (99.99% - tối thiểu 4 kết nối ở ít nhất 2 location khác nhau, mỗi location có 2 kết nối tới các thiết bị router độc lập).

- **A (Đúng):** Chính xác. Mô hình Maximum Resiliency của AWS Direct Connect yêu cầu tối thiểu 4 kết nối trải đều trên ít nhất 2 Direct Connect locations (2 kết nối mỗi location trên các router riêng biệt) để đạt SLA 99.99%.
- **B:** Đặt cả hai kết nối tại một Direct Connect location duy nhất không thể chịu được sự cố mất toàn bộ location đó (chỉ đạt High Resiliency nếu ở 2 location với 2 kết nối, hoặc không đạt SLA 99.99%).
- **C:** VPN qua Internet không đáp ứng yêu cầu SLA 99.99% của Direct Connect Maximum Resiliency và không bảo vệ trước sự cố của một Direct Connect location bằng kết nối chuyên dụng.
- **D:** Mô hình 2 kết nối ở 2 location chỉ là High Resiliency (SLA 99.9%), và việc terminate vào một customer router tạo ra single point of failure.

</details>

### Câu 3 `hard`

An automotive company operates an IoT telemetry platform in us-east-1 that receives multicast UDP video and sensor streams from 50 EC2 producer instances and distributes them to 200 EC2 subscriber instances spread across 12 VPCs. The company wants to avoid application-level unicast replication. Which AWS Transit Gateway feature should be used?

- **A.** Deploy a Network Load Balancer in front of the 200 subscriber instances and configure UDP listeners to replicate multicast packets.
- **B.** Enable ECMP on the Transit Gateway route table to distribute multicast UDP video packets evenly across all 12 subscriber VPCs.
- **C.** Configure VPC Peering in a full mesh across all 12 VPCs because VPC Peering natively forwards Layer 2 broadcast and IGMPv2 multicast streams.
- **D.** Enable IGMPv2 multicast on the Transit Gateway, create a Transit Gateway multicast domain, and associate the producer and subscriber VPC subnets.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty ô tô vận hành một nền tảng đo từ xa IoT tại us-east-1 nhận các luồng video và cảm biến UDP multicast từ 50 EC2 producer instance và phân phối chúng đến 200 EC2 subscriber instance trải rộng trên 12 VPC. Công ty muốn tránh việc sao chép unicast ở tầng ứng dụng. Nên sử dụng tính năng nào của AWS Transit Gateway?

**Đáp án đúng:** **D**

AWS Transit Gateway là dịch vụ duy nhất hỗ trợ native IP multicast giữa các VPC thông qua việc tạo Multicast Domain (hỗ trợ cả static group registration hoặc dynamic IGMPv2).

- **A:** NLB cân bằng tải một gói tin tới một target duy nhất chứ không nhân bản multicast tới đồng thời 200 subscriber.
- **B:** ECMP dùng để cân bằng tải các tuyến đường unicast BGP có cùng cost (như VPN), không phải cơ chế multicast.
- **C:** VPC Peering không hỗ trợ IP multicast hay broadcast.
- **D (Đúng):** Chính xác. AWS Transit Gateway hỗ trợ IP multicast (static hoặc IGMPv2) thông qua Transit Gateway Multicast Domain, cho phép phân phối một luồng UDP multicast tới nhiều subscriber trên nhiều VPC mà không cần unicast replication.

</details>

### Câu 4 `hard`

A financial services company has two AWS Direct Connect 10 Gbps dedicated connections terminating at the same Direct Connect location on two separate customer routers. The company wants to combine both connections into a single logical interface to achieve 20 Gbps aggregate bandwidth for a single Transit VIF, while ensuring automatic link failover if one physical fiber fails. Which configuration should be used?

- **A.** Create a Transit VIF on each connection and enable SiteLink to bond both 10 Gbps connections at Layer 2.
- **B.** Create a LAG with both 10 Gbps Direct Connect connections and terminate them on one customer router supporting LACP.
- **C.** Enable ECMP on the Virtual Private Gateway (VGW) across two separate Private VIFs to bond both 10 Gbps links.
- **D.** Create a Link Aggregation Group (LAG) across two different Direct Connect locations to achieve 20 Gbps and location-level resiliency.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty dịch vụ tài chính có hai kết nối dedicated AWS Direct Connect 10 Gbps kết cuối tại cùng một vị trí Direct Connect trên hai router khách hàng riêng biệt. Công ty muốn gộp cả hai kết nối thành một giao diện logic duy nhất để đạt tổng băng thông 20 Gbps cho một Transit VIF duy nhất, đồng thời đảm bảo chuyển đổi dự phòng liên kết tự động nếu một sợi cáp quang vật lý bị hỏng. Nên sử dụng cấu hình nào?

**Đáp án đúng:** **B**

Direct Connect Link Aggregation Group (LAG) dùng LACP để gộp nhiều kết nối Dedicated cùng băng thông (tối đa 4 port) tại cùng một Direct Connect location thành một giao diện logic duy nhất, chạy active-active và tự động failover ở tầng Layer 2.

- **A:** SiteLink là tính năng định tuyến Layer 3 giữa các Direct Connect locations qua AWS backbone, không phải cơ chế gộp băng thông Layer 2 (LACP).
- **B (Đúng):** Chính xác. Link Aggregation Group (LAG) sử dụng LACP (802.3ad) để gộp tối đa 4 kết nối Dedicated cùng tốc độ tại một Direct Connect location thành một kết nối logic duy nhất, nhưng yêu cầu phía khách hàng phải terminate vào cùng một thiết bị router (hoặc switch hỗ trợ MLAG/vPC).
- **C:** VGW không hỗ trợ gộp băng thông cho một luồng duy nhất bằng LACP và bài toán yêu cầu một Transit VIF logic.
- **D:** LAG chỉ có thể gộp các kết nối nằm tại CÙNG một Direct Connect location.

</details>

### Câu 5 `hard`

A mission-critical payment processing workload requires an AWS Direct Connect architecture that achieves a 99.99% SLA (Maximum Resiliency) between an on-premises data center and the us-east-1 Region. Which Direct Connect topology meets the AWS Maximum Resiliency SLA?

- **A.** Provision two 10 Gbps Hosted Connections across two different Direct Connect locations, with one connection terminating at each DX location.
- **B.** Provision two 10 Gbps Dedicated Connections at a single Direct Connect location terminated on two separate AWS devices, combined with a Site-to-Site VPN backup over the internet.
- **C.** Provision four Direct Connect connections across two DX locations, with two per location terminating on separate AWS devices and customer routers.
- **D.** Create a Link Aggregation Group (LAG) with four 10 Gbps Dedicated Connections at a single AWS Direct Connect location with LACP enabled.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một workload xử lý thanh toán tối quan trọng yêu cầu kiến trúc AWS Direct Connect đạt SLA 99.99% (Maximum Resiliency) giữa một trung tâm dữ liệu tại chỗ (on-premises) và Region us-east-1. Cấu trúc liên kết (topology) Direct Connect nào đáp ứng SLA Maximum Resiliency của AWS?

**Đáp án đúng:** **C**

Trong AWS Direct Connect Resiliency Toolkit, SLA 99.9% (High Resiliency) yêu cầu 2 kết nối ở 2 location; còn SLA 99.99% (Maximum Resiliency) yêu cầu 4 kết nối ở 2 location (2 kết nối/location trên các thiết bị tách biệt).

- **A:** 2 kết nối tại 2 location khác nhau chỉ đáp ứng mô hình High Resiliency (SLA 99.9%), chưa đạt Maximum Resiliency (99.99%).
- **B:** Đặt cả 2 kết nối tại cùng 1 Direct Connect location không bảo vệ trước sự cố mất toàn bộ location, nên không đạt SLA 99.99%.
- **C (Đúng):** Mô hình Maximum Resiliency (SLA 99.99%) của AWS Direct Connect yêu cầu tối thiểu 4 kết nối tại 2 Direct Connect locations khác nhau (2 kết nối mỗi location trên 2 thiết bị router riêng biệt).
- **D:** LAG chỉ kết hợp nhiều cổng trên cùng một thiết bị AWS tại cùng một Direct Connect location, nên vẫn tồn tại single point of failure ở cấp thiết bị và location.

</details>

### Câu 6 `hard`

A trading platform runs a low-latency market data distribution application on EC2 instances across 6 VPCs in the same AWS Region. The application relies on UDP IP multicast with IGMPv2 dynamic group membership so subscribers can join and leave feeds dynamically. Which AWS networking service should be used?

- **A.** VPC Peering across all 6 VPCs with Enhanced Networking (ENA) and jumbo frames enabled on all EC2 instances.
- **B.** AWS PrivateLink with a Network Load Balancer configured for UDP listeners across all 6 subscriber VPCs.
- **C.** AWS Transit Gateway with Multicast enabled and IGMPv2 support configured on the multicast domain.
- **D.** AWS Cloud WAN with a dedicated Multicast segment and IGMPv2 dynamic group membership enabled globally.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng giao dịch vận hành ứng dụng phân phối dữ liệu thị trường độ trễ thấp trên các EC2 instance trải dài qua 6 VPC trong cùng một AWS Region. Ứng dụng dựa vào UDP IP multicast với thành viên nhóm động IGMPv2 để các thuê bao (subscriber) có thể tham gia và rời khỏi luồng dữ liệu một cách linh hoạt. Nên sử dụng dịch vụ mạng AWS nào?

**Đáp án đúng:** **C**

AWS Transit Gateway là dịch vụ duy nhất của AWS hỗ trợ native IP Multicast (Static và Dynamic IGMPv2) cho lưu lượng UDP giữa các VPC trong cùng Region.

- **A:** VPC native và VPC Peering không hỗ trợ IP Multicast hay Broadcast.
- **B:** NLB và PrivateLink chỉ hỗ trợ unicast TCP/UDP, không hỗ trợ IP Multicast.
- **C (Đúng):** AWS Transit Gateway hỗ trợ native IP Multicast trong cùng một Region, bao gồm cả Static và Dynamic group membership thông qua giao thức IGMPv2.
- **D:** AWS Cloud WAN hiện không hỗ trợ định tuyến IP Multicast.

</details>

### Câu 7 `hard`

A media company needs a 10 Gbps AWS Direct Connect setup with link-level redundancy at a Direct Connect location and must connect to both a Transit Gateway (via a Transit VIF) and Amazon S3 public endpoints (via a Public VIF) over the same physical link group. Which TWO architectural choices are required to satisfy these requirements? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Create a Link Aggregation Group (LAG) using matching-speed Dedicated Connections at the same Direct Connect location with LACP enabled.
- **B.** Use a Private VIF to access both the Transit Gateway and Amazon S3 public endpoints simultaneously.
- **C.** Attach the Transit VIF directly to the Transit Gateway without using a Direct Connect Gateway.
- **D.** Order two 10 Gbps Hosted Connections from an AWS Partner and combine them into a Link Aggregation Group (LAG).
- **E.** Order AWS Direct Connect Dedicated Connections instead of Hosted Connections.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty truyền thông cần thiết lập AWS Direct Connect 10 Gbps có dự phòng ở cấp độ liên kết tại một vị trí Direct Connect và phải kết nối đến cả Transit Gateway (qua Transit VIF) và các endpoint công cộng của Amazon S3 (qua Public VIF) trên cùng một nhóm liên kết vật lý. HAI lựa chọn kiến trúc nào là bắt buộc để đáp ứng các yêu cầu này? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, E**

Yêu cầu vừa dùng LAG vừa tạo đồng thời nhiều VIF (Transit VIF + Public VIF) bắt buộc phải sử dụng Direct Connect Dedicated Connections và cấu hình LAG cùng tốc độ với LACP.

- **A (Đúng):** LAG cho phép gom tối đa 4 Dedicated Connections cùng tốc độ tại cùng một Direct Connect location bằng giao thức LACP để tạo link-level redundancy và tăng băng thông.
- **B:** Private VIF không gắn được vào Transit Gateway và không truy cập được AWS public endpoints (trừ khi đi qua VPC Interface Endpoint).
- **C:** Transit VIF bắt buộc phải gắn vào Direct Connect Gateway (DXGW) rồi mới liên kết (associate) tới Transit Gateway, không thể gắn trực tiếp.
- **D:** Hosted Connection không hỗ trợ LAG và không thể tạo đồng thời 2 loại VIF trên cùng 1 kết nối.
- **E (Đúng):** Chỉ Dedicated Connection mới hỗ trợ tạo nhiều VIF (cả Transit VIF lẫn Public VIF) và hỗ trợ gom cổng bằng LAG. Hosted Connection chỉ cho phép 1 VIF duy nhất và không hỗ trợ LAG.

</details>

---

[Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md)
