# Giám sát & Xử lý sự cố Mạng Chuyên sâu trên AWS

Domain 3 (**Network Management and Operation – 20%**) đánh giá khả năng chẩn đoán lỗi kết nối phức tạp (routing loop, asymmetric routing, MTU fragmentation, packet drop) và thiết lập hệ thống giám sát mạng chủ động (observability) ở quy mô doanh nghiệp.

---

## 1. Bộ công cụ Phân tích Kết nối Tĩnh (Static Analysis)

### VPC Reachability Analyzer
- **Cơ chế**: Phân tích cấu hình tĩnh (không gửi gói tin thật trên đường truyền!) giữa **Source** và **Destination** (EC2, ENI, IGW, VGW, TGW, VPC Endpoint, Network Firewall...).
- **Ưu điểm**: Chỉ ra chính xác từng hop và nguyên nhân chặn (Security Group rule thiếu, NACL chặn ephemeral port, Route Table thiếu đường về, TGW Route Table chưa associate).
- **Multi-Account**: Hỗ trợ phân tích xuyên tài khoản trong AWS Organizations (cần bật Trusted Access).

### VPC Network Access Analyzer
- **Khác biệt cốt lõi với Reachability Analyzer**: Thay vì kiểm tra điểm-tới-điểm (A → B), Network Access Analyzer kiểm tra **tuân thủ kiến trúc (Compliance / Security Scope)** trên toàn mạng!
- **Ví dụ dùng trong đề thi**:
  - *"Xác minh rằng KHÔNG có EC2 instance nào trong Production VPC có thể truy cập trực tiếp từ Internet mà không đi qua Inspection VPC (AWS Network Firewall)"*.
  - *"Chứng minh các Database subnet hoàn toàn tách biệt với Dev VPCs"*.

> **Exam Tip**: Cần debug *"tại sao EC2 A không ping được RDS B"* → **VPC Reachability Analyzer**. Cần audit/compliance *"đảm bảo không có đường đi nào bỏ qua Firewall hoặc lộ ra Internet"* → **VPC Network Access Analyzer**.

---

## 2. Giám sát Lưu lượng Gói tin: VPC Flow Logs vs. VPC Traffic Mirroring

| Tiêu chí | VPC Flow Logs | VPC Traffic Mirroring |
| :--- | :--- | :--- |
| **Dữ liệu thu thập** | **Metadata** Layer 3/4 (5-tuple, bytes, packets, `ACCEPT`/`REJECT`, `pkt-srcaddr`, `flow-direction`) | **Full Packet Payload** (L2–L7) đóng gói bằng **VXLAN (UDP port 4789)** |
| **Phạm vi bật** | VPC, Subnet, ENI, hoặc **Transit Gateway (TGW Flow Logs)** | Trên **ENI** của EC2 Nitro instances (hoặc GWLB Endpoint) |
| **Đích lưu trữ / xử lý** | CloudWatch Logs, Amazon S3 (Parquet/Gzip), Kinesis Data Firehose | NLB, ENI của IDS/IPS appliance, hoặc **GWLB Endpoint** |
| **Lưu lượng bị bỏ qua** | DNS đến AWS `.2` (trừ custom DNS), DHCP, `169.254.169.254`, NTP | Không capture traffic giữa instance và metadata/DNS nội bộ |
| **Khi nào chọn?** | Audit kết nối, đếm lưu lượng, phát hiện port scan, debug SG/NACL drop | Deep Packet Inspection (DPI), điều tra payload L7, phân tích malware/IDS |

### Mẹo đọc VPC Flow Logs trong bài thi ANS-C01
- **Asymmetric Routing / NACL Ephemeral Ports**: Bạn thấy chiều đi `ACCEPT` (port 443), nhưng chiều về bị `REJECT` ở port ngẫu nhiên (ví dụ `49152–65535`) → **NACL (stateless)** chưa mở outbound/inbound cho Ephemeral Ports!
- **Custom Format Fields hữu ích**: `pkt-srcaddr`, `pkt-dstaddr` (phân biệt IP gốc trước/sau khi đi qua NAT Gateway/ALB), `tcp-flags` (`2`=SYN, `18`=SYN-ACK — nếu thấy SYN `ACCEPT` nhưng không có SYN-ACK trả về, chứng tỏ OS firewall bên trong EC2 hoặc route chiều về bị lỗi!).

---

## 3. Giám sát Hybrid & Global Network

1. **Amazon CloudWatch Network Monitor**:
   - Chủ động gửi **synthetic probes** (ICMP/TCP) từ VPC qua Direct Connect hoặc Site-to-Site VPN tới các endpoint On-Premises để đo **Packet Loss** và **Round-Trip Time (RTT)** theo thời gian thực.
2. **Amazon CloudWatch Internet Monitor**:
   - Giám sát hiệu năng và tính khả dụng của Internet công cộng giữa người dùng cuối và ứng dụng trên VPC, CloudFront, WorkSpaces hoặc ALB; phát hiện sự cố ISP theo từng thành phố/ASN.
3. **AWS Network Manager (Transit Gateway Network Manager)**:
   - Cung cấp bản đồ trực quan (Topology Graph), **Route Analyzer** (mô phỏng đường đi trên TGW giữa 2 attachment, phát hiện **asymmetric routing** hoặc blackhole) và cảnh báo trạng thái VPN/DX/TGW tunnel qua EventBridge.
4. **Route 53 Resolver Query Logging**:
   - Ghi lại toàn bộ DNS queries phát sinh từ VPC (kèm source IP, query name, rcode như `NXDOMAIN`, `SERVFAIL`) về S3, CloudWatch Logs hoặc Firehose.

---

## 4. Các lỗi Mạng Kinh điển & Cách Xử lý (Troubleshooting Playbook)

| Triệu chứng | Nguyên nhân gốc rễ thường gặp | Giải pháp chuẩn AWS |
| :--- | :--- | :--- |
| **SSH/TCP treo sau khi handshake, truyền file lớn bị timeout** | **Path MTU Discovery (PMTUD) Blackhole**: NACL/SG chặn `ICMP Type 3 Code 4` (Fragmentation Needed) trên đường VPN/TGW (MTU VPN = 1446/1420, TGW = 8500, VPC = 9001, Internet = 1500) | Mở **ICMP Fragmentation Needed** hoặc cấu hình **TCP MSS Clamping** (1379 bytes cho IPsec VPN) trên Customer Gateway |
| **Lưu lượng qua Firewall bị drop ngẫu nhiên** | **Asymmetric Routing** giữa các AZ trên TGW hoặc giữa 2 DX connections | Bật **TGW Appliance Mode** trên Inspection VPC attachment; đồng bộ BGP LocalPref/AS_PATH giữa 2 DX |
| **BGP Session trên Direct Connect bị flap / reset** | Vượt quá giới hạn **100 routes** quảng bá từ On-Premises trên Private/Transit VIF | Thực hiện **Route Summarization** trên router On-Premises trước khi quảng bá lên AWS |
| **DNS phân giải chậm hoặc `SERVFAIL`** | Vượt giới hạn **1024 packets/sec per ENI** của Route 53 VPC Resolver (`.2`) | Cài **local DNS cache** (systemd-resolved / dnsmasq) trên EC2 hoặc dùng nhiều ENI/tối ưu TTL |

```bash
# Tạo VPC Reachability Analyzer Path kiểm tra từ EC2 tới RDS qua TGW
aws ec2 create-network-insights-path \
  --source eni-0aaa1111222233334 \
  --destination eni-0bbb5555666677778 \
  --protocol tcp \
  --destination-port 5432
```

---

[← Bài trước](08-privatelink-vpc-lattice-elb.md) | [Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/09-reachability-network-manager.md) | [Bài tiếp →](10-vpc-flow-logs-traffic-mirroring.md)
