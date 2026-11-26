# Thẻ ghi nhớ (Flashcards) — ANS-C01

> 24 thẻ · Đọc mặt trước, tự trả lời rồi mở đáp án.

## AWS Transit Gateway, Inter-Region Peering & AWS Cloud WAN

**1. Sự khác biệt cốt lõi giữa AWS Transit Gateway (TGW) và AWS Cloud WAN là gì?**

<details><summary>Xem đáp án</summary>

TGW là dịch vụ Regional (cần Inter-Region Peering thủ công và quản lý từng Route Table), hỗ trợ IP Multicast (IGMPv2). AWS Cloud WAN là dịch vụ Global quản lý tập trung bằng Core Network Policy (JSON) với Segments tự động cách ly xuyên Region và hỗ trợ Native Service Insertion (NFG), nhưng không hỗ trợ Multicast.

</details>

## Direct Connect Resiliency, LAG, MACsec & Transit Gateway Multicast

**2. Để đạt SLA 99.99% (Maximum Resiliency) cho AWS Direct Connect cần thiết kế tối thiểu bao nhiêu kết nối và location?**

<details><summary>Xem đáp án</summary>

Tối thiểu 4 kết nối Direct Connect tại 2 Direct Connect Locations khác nhau (2 kết nối tại mỗi location trên 2 thiết bị router riêng biệt). Mô hình High Resiliency (99.9%) chỉ cần 2 kết nối tại 2 location khác nhau.

</details>

**3. Sự khác biệt giữa Direct Connect Dedicated Connection và Hosted Connection về VIF và LAG là gì?**

<details><summary>Xem đáp án</summary>

Dedicated Connection (1G/10G/100G/400G) hỗ trợ tối đa 50 Private/Public VIF + 1 Transit VIF và hỗ trợ LAG (tối đa 4 port cùng tốc độ). Hosted Connection chỉ hỗ trợ duy nhất 1 VIF (Transit VIF yêu cầu >= 1 Gbps) và KHÔNG hỗ trợ LAG.

</details>

## Edge Networking: Amazon CloudFront, AWS Global Accelerator & Anycast

**4. Khi nào chọn AWS Global Accelerator thay vì Amazon CloudFront?**

<details><summary>Xem đáp án</summary>

Chọn Global Accelerator khi cần tối ưu Layer 4 (TCP/UDP, Gaming, VoIP, MQTT), cần 2 Static Anycast IP cố định để whitelist firewall, hoặc cần failover đa Region tức thì không bị phụ thuộc DNS TTL. CloudFront tối ưu Layer 7 (HTTP/HTTPS) với Edge Caching.

</details>

## IPv6 Dual-Stack, IPv6-Only, NAT64/DNS64, VPC IPAM & Prefix Lists

**5. Làm sao cho phép các EC2 trong IPv6-only Subnet truy cập dịch vụ IPv4-only bên ngoài mà vẫn chặn inbound từ Internet?**

<details><summary>Xem đáp án</summary>

Kết hợp DNS64 (tổng hợp bản ghi AAAA từ A) và NAT64 (trên NAT Gateway) để giao tiếp với đích IPv4-only; đồng thời dùng Egress-Only Internet Gateway (EIGW) để cho phép outbound IPv6 và chặn mọi inbound IPv6 từ Internet.

</details>

**6. Amazon VPC IPAM giải quyết những bài toán gì trong môi trường Multi-Account?**

<details><summary>Xem đáp án</summary>

Tự động lập kế hoạch, cấp phát CIDR IPv4/IPv6 không chồng lấn (non-overlapping) xuyên AWS Organizations, phát hiện CIDR overlap, lưu lịch sử gán IP tối đa 3 năm để audit, và hỗ trợ quản lý BYOIP.

</details>

## Định tuyến Hybrid BGP, Direct Connect VIFs/DXGW & Site-to-Site VPN ECMP

**7. Thứ tự ưu tiên chọn đường BGP từ AWS về On-Premises (Outbound từ AWS) là gì?**

<details><summary>Xem đáp án</summary>

1. Longest Prefix Match (LPM) -> 2. Static Route > BGP Propagated -> 3. Direct Connect > Site-to-Site VPN -> 4. BGP Local Preference (7224:7300 > 7200 > 7100) -> 5. Shortest AS_PATH -> 6. Lowest MED (cùng Neighbor ASN).

</details>

**8. Ý nghĩa của các BGP Community tags 7224:9100, 7224:9200 và 7224:9300 trên Direct Connect Public VIF là gì?**

<details><summary>Xem đáp án</summary>

Kiểm soát phạm vi quảng bá prefix của khách hàng trên mạng AWS Public: 7224:9100 (chỉ Local AWS Region), 7224:9200 (tất cả Region trong cùng Continent), và 7224:9300 (Global - tất cả AWS Public Regions).

</details>

**9. Tại sao cần bật BFD (Bidirectional Forwarding Detection) trên Direct Connect VIF?**

<details><summary>Xem đáp án</summary>

BGP mặc định mất tới 90 giây (hold timer) để phát hiện đứt liên kết. BFD phát hiện lỗi L2/L3 trong vòng < 1 giây (mặc định AWS: 300ms x 3 = 900ms), giúp BGP failover sang đường backup gần như tức thì.

</details>

**10. Giới hạn số lượng BGP routes từ On-Premises quảng bá lên Private VIF / Transit VIF là bao nhiêu và hậu quả khi vượt quá?**

<details><summary>Xem đáp án</summary>

Tối đa 100 routes (Private/Transit VIF) và 1,000 routes (Public VIF). Nếu vượt quá 100 routes, BGP session sẽ bị ngắt (reset/flap). Giải pháp là áp dụng Route Summarization trên router On-Premises.

</details>

## Route 53 Hybrid DNS, Resolver Endpoints, DNSSEC & ARC Zonal Shift

**11. Thiết kế Centralized Hybrid DNS với Route 53 Resolver trong môi trường Multi-Account hoạt động thế nào?**

<details><summary>Xem đáp án</summary>

Đặt 1 Inbound Endpoint và 1 Outbound Endpoint tại Shared Services VPC. Liên kết tất cả Private Hosted Zones vào VPC này để On-Premises query qua Inbound Endpoint; dùng AWS RAM chia sẻ Outbound Forwarding Rules tới các Spoke VPC để phân giải tên miền On-Premises.

</details>

**12. Giới hạn truy vấn DNS tới AmazonProvidedDNS (.2) trên mỗi ENI là bao nhiêu và cách khắc phục khi bị drop/SERVFAIL?**

<details><summary>Xem đáp án</summary>

Giới hạn cứng là 1,024 packets/second trên mỗi ENI. Cách khắc phục: cài đặt local DNS caching (dnsmasq, systemd-resolved) trên EC2, tối ưu hóa DNS TTL, hoặc phân tải trên nhiều ENI.

</details>

## AWS PrivateLink, Amazon VPC Lattice & Load Balancing (ALB/NLB)

**13. Khi nào chọn Amazon VPC Lattice thay vì AWS PrivateLink?**

<details><summary>Xem đáp án</summary>

Chọn VPC Lattice khi kết nối microservices ở Layer 7 (HTTP/HTTPS, gRPC) xuyên VPC/Account có Overlapping CIDR mà cần IAM Auth (SigV4), Weighted Routing (Canary/Blue-Green) và không muốn quản lý NLB/Endpoint cho từng dịch vụ. PrivateLink hoạt động ở Layer 4 (TCP/UDP).

</details>

## VPC Reachability Analyzer, Network Access Analyzer & Network Manager

**14. Phân biệt VPC Reachability Analyzer và VPC Network Access Analyzer?**

<details><summary>Xem đáp án</summary>

Reachability Analyzer kiểm tra tĩnh khả năng kết nối điểm-tới-điểm (Source -> Destination) để debug lỗi SG/NACL/Route Table. Network Access Analyzer kiểm tra tuân thủ (Compliance Scope) trên toàn mạng để chứng minh không có đường đi ngoài ý muốn (ví dụ: bypass firewall).

</details>

**15. Phân biệt Amazon CloudWatch Network Monitor và Amazon CloudWatch Internet Monitor?**

<details><summary>Xem đáp án</summary>

CloudWatch Network Monitor gửi synthetic probes (ICMP/TCP) từ VPC qua Direct Connect hoặc Site-to-Site VPN tới On-Premises để đo Packet Loss và RTT. CloudWatch Internet Monitor giám sát hiệu năng/sự cố ISP trên Internet công cộng giữa người dùng cuối và AWS.

</details>

## VPC Flow Logs, Traffic Mirroring & Xử lý sự cố Mạng Chuyên sâu

**16. Khi nào bắt buộc dùng VPC Traffic Mirroring thay vì VPC Flow Logs?**

<details><summary>Xem đáp án</summary>

Khi cần phân tích toàn bộ gói tin (Full Packet Payload L2-L7) cho IDS/IPS, Deep Packet Inspection (DPI) hoặc điều tra bảo mật. Traffic Mirroring đóng gói bằng VXLAN (UDP 4789) trên EC2 Nitro. VPC Flow Logs chỉ ghi metadata L3/L4.

</details>

**17. Hiện tượng TCP handshake thành công nhưng truyền gói tin lớn qua Site-to-Site VPN bị treo do nguyên nhân gì và cách xử lý?**

<details><summary>Xem đáp án</summary>

Do Path MTU Discovery (PMTUD) Blackhole (ICMP Type 3 Code 4 - Fragmentation Needed bị chặn). Giải pháp: mở ICMP Fragmentation Needed trên firewall/NACL và/hoặc cấu hình TCP MSS Clamping (1379 bytes) trên Customer Gateway.

</details>

**18. VPC Flow Logs cho thấy chiều outbound tới port 443 là ACCEPT nhưng chiều inbound về port 51234 bị REJECT. Nguyên nhân là gì?**

<details><summary>Xem đáp án</summary>

Network ACL (NACL) mang tính chất Stateless và chưa mở rule cho dải Ephemeral Ports (ví dụ 1024-65535 hoặc 49152-65535) ở chiều trả về. Security Group là Stateful nên tự động cho phép return traffic.

</details>

## Gateway Load Balancer (GWLB), GENEVE & Centralized Inspection

**19. Tại sao bắt buộc phải bật TGW Appliance Mode trên Inspection VPC Attachment?**

<details><summary>Xem đáp án</summary>

Mặc định TGW giữ traffic trong cùng AZ nguồn ở chiều đi và AZ đích ở chiều về, gây ra Asymmetric Routing khi đi qua Stateful Firewall (Network Firewall / GWLB) đặt ở nhiều AZ. Appliance Mode đảm bảo cả 2 chiều của 1 flow luôn đi qua cùng 1 AZ.

</details>

**20. Gateway Load Balancer (GWLB) sử dụng giao thức và cổng nào để giao tiếp với Third-Party Firewall Appliances?**

<details><summary>Xem đáp án</summary>

Giao thức GENEVE trên cổng UDP 6081. GWLB hoạt động trong suốt ở Layer 3/4 (bump-in-the-wire), giữ nguyên IP nguồn/đích và tích hợp Auto Scaling cho các thiết bị bảo mật bên thứ ba (Palo Alto, Fortinet, Cisco).

</details>

## AWS Network Firewall & Route 53 Resolver DNS Firewall

**21. Làm sao AWS Network Firewall lọc được outbound HTTPS theo tên miền (FQDN) mà không cần cấu hình TLS Decryption?**

<details><summary>Xem đáp án</summary>

Sử dụng Stateful Domain List rule group để kiểm tra trường Server Name Indication (SNI) trong gói tin TLS ClientHello (và HTTP Host header cho HTTP). Nếu cần kiểm tra sâu payload bên trong HTTPS mới cần bật TLS Inspection.

</details>

**22. Làm thế nào để buộc mọi lưu lượng Ingress từ Internet Gateway (IGW) đi qua AWS Network Firewall trước khi tới ALB/Public Subnet?**

<details><summary>Xem đáp án</summary>

Sử dụng VPC Ingress Routing bằng cách tạo Route Table gắn với Internet Gateway (Edge Association), cấu hình route cho CIDR của Public/ALB Subnet trỏ tới Firewall Endpoint (GWLBE) nằm trong Firewall Subnet.

</details>

**23. Route 53 Resolver DNS Firewall có chế độ Fail-Open và Fail-Closed khác nhau như thế nào?**

<details><summary>Xem đáp án</summary>

Fail-Open (mặc định): nếu DNS Firewall gặp sự cố, truy vấn DNS vẫn được phân giải bình thường để ưu tiên tính sẵn sàng. Fail-Closed: chặn toàn bộ truy vấn DNS khi Firewall lỗi để ưu tiên bảo mật tuyệt đối.

</details>

## AWS WAF, Shield Advanced, Direct Connect MACsec & Transit Encryption

**24. So sánh 2 cách mã hóa lưu lượng trên AWS Direct Connect: MACsec vs. IPsec VPN over Direct Connect?**

<details><summary>Xem đáp án</summary>

MACsec (IEEE 802.1AE) mã hóa Layer 2 point-to-point giữa router khách hàng và router AWS tại DX Location (yêu cầu cổng >= 10 Gbps, không giảm băng thông). IPsec VPN over DX (qua Public VIF hoặc Private IP VPN) mã hóa Layer 3 end-to-end tới VGW/TGW (1.25 Gbps/tunnel, mở rộng bằng TGW ECMP).

</details>

---

[Mục lục ANS-C01](00-tong-quan-va-lo-trinh-ans-c01.md)
