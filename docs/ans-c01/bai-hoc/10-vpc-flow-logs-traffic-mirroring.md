# VPC Flow Logs, Traffic Mirroring & Xử lý sự cố Mạng Chuyên sâu

Domain 3 (**Network Management and Operation – 20%**) yêu cầu khả năng đọc hiểu metadata gói tin, bắt gói tin sâu (deep packet capture) và chẩn đoán nguyên nhân gốc rễ (root cause) của các sự cố mạng phức tạp.

---

## 1. VPC Flow Logs vs. Transit Gateway Flow Logs vs. Traffic Mirroring

| Công cụ | Mức độ dữ liệu | Độ trễ / Chi phí | Trường hợp sử dụng |
| :--- | :--- | :--- | :--- |
| **VPC Flow Logs** | Metadata IP (5-tuple, bytes, packets, `ACCEPT`/`REJECT`, v2–v5 fields) | Thấp; lưu vào CloudWatch Logs, S3 hoặc Kinesis Data Firehose | Kiểm tra kết nối bị chặn bởi SG/NACL, phân tích top talkers, audit |
| **TGW Flow Logs** | Metadata lưu lượng đi qua Transit Gateway & Attachments | Thấp; hỗ trợ trường `tgw-id`, `tgw-attachment-id`, `flow-direction` | Debug lưu lượng đi qua nhiều VPC, VPN, Direct Connect |
| **VPC Traffic Mirroring** | **Full Packet Payload** (L2–L7) đóng gói **VXLAN (UDP 4789)** | Cao hơn; yêu cầu Nitro-based EC2 làm Source | Deep Packet Inspection (IDS/IPS, Zeek/Suricata), phân tích lỗi TLS/HTTP |

> **Exam Tip**:
> - Cần **xem payload gói tin** (HTTP headers, DNS payload, TLS handshake, packet corruption) $\rightarrow$ **VPC Traffic Mirroring** (chỉ hỗ trợ **Nitro instances**).
> - Cần xác định tại sao gói tin bị drop bởi **Security Group / NACL** hoặc xem `tcp-flags`, `pkt-srcaddr` (IP gốc trước khi NAT) $\rightarrow$ **VPC Flow Logs Custom Format (v3/v4/v5)**.

---

## 2. Đọc hiểu các trường nâng cao trong VPC Flow Logs (v3–v5)

Khi bật Custom Format cho VPC Flow Logs, các trường quan trọng hay xuất hiện trong đề thi ANS-C01 gồm:
- `pkt-srcaddr` & `pkt-dstaddr`: Địa chỉ IP nguồn/đích **trước và sau khi đi qua NAT Gateway hoặc Load Balancer** (rất hữu ích để tìm IP thật của pod/client).
- `flow-direction`: `ingress` hoặc `egress` so với ENI.
- `traffic-path`: Đường đi cụ thể của gói tin (ví dụ `1` = cùng VPC, `2` = qua IGW, `7` = qua TGW, `8` = qua VPC Endpoint).
- `tcp-flags`: Bitmask cờ TCP (`2` = SYN, `18` = SYN-ACK, `4` = RST, `1` = FIN). Nếu thấy chỉ có `SYN` (`2`) ở chiều đi mà không có `SYN-ACK` chiều về $\rightarrow$ nghi ngờ **NACL stateless thiếu rule outbound/ephemeral ports**, hoặc **asymmetric routing** tại stateful firewall.

```bash
# Tạo VPC Flow Log định dạng tùy chỉnh (v5) gửi về S3 dạng Parquet tiết kiệm chi phí
aws ec2 create-flow-logs \
  --resource-type VPC \
  --resource-ids vpc-0a1b2c3d4e5f67890 \
  --traffic-type ALL \
  --log-destination-type s3 \
  --log-destination arn:aws:s3:::my-vpc-flow-logs-bucket \
  --log-format '${version} ${account-id} ${interface-id} ${srcaddr} ${dstaddr} ${pkt-srcaddr} ${pkt-dstaddr} ${srcport} ${dstport} ${protocol} ${packets} ${bytes} ${action} ${flow-direction} ${traffic-path} ${tcp-flags}' \
  --destination-options FileFormat=parquet,PerHourPartition=true
```

---

## 3. Quy trình Chẩn đoán Lỗi Kết nối Hybrid & MTU

1. **Lỗi kết nối treo sau TLS/TCP Handshake (đặc biệt qua VPN/DX)**:
   - Nguyên nhân kinh điển: **MTU / Path MTU Discovery (PMTUD) Blackhole** do ICMP *Fragmentation Needed (Type 3, Code 4)* bị chặn trên firewall.
   - Lưu ý: Site-to-Site VPN có MTU hiệu dụng ~1436 bytes (hoặc thấp hơn với IPv6/NAT-T); Transit Gateway hỗ trợ Jumbo Frame **8500 bytes** (trừ DX VIF là **1500** hoặc **8500/9001** tùy cấu hình Jumbo Frame trên VIF).
   - Khắc phục: Cho phép **ICMP Type 3 Code 4** trong Security Group/NACL hoặc cấu hình **TCP MSS Clamping** trên Customer Gateway.
2. **Traffic Mirroring không hoạt động**:
   - Kiểm tra Source có phải **AWS Nitro System** không.
   - Kiểm tra **Target** (NLB hoặc ENI) đã mở **UDP port 4789 (VXLAN)** trong Security Group chưa.
   - Kiểm tra **Mirror Filter** có rule `accept` khớp chiều `ingress`/`egress` chưa.

---

[← Bài trước](09-monitoring-troubleshooting.md) | [Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/10-flow-logs-traffic-mirroring.md) | [Bài tiếp →](11-gwlb-geneve-centralized-inspection.md)
