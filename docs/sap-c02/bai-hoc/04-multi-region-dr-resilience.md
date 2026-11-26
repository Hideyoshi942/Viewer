# Kiến trúc Đa vùng, Disaster Recovery & Chịu lỗi Cấp Doanh nghiệp

Domain 2 (**Design for New Solutions** — 29%) là phần có tỷ trọng cao nhất trong bài thi **SAP-C02**. Bạn cần làm chủ cách thiết kế hệ thống đạt mục tiêu **RTO (Recovery Time Objective)** và **RPO (Recovery Point Objective)** khắt khe, cũng như khả năng chịu lỗi toàn diện ở quy mô đa vùng (Multi-Region).

---

## 1. Bốn Chiến lược Disaster Recovery (DR) trên AWS

| Chiến lược DR | RTO | RPO | Kiến trúc cốt lõi | Chi phí vận hành |
| :--- | :--- | :--- | :--- | :--- |
| **Backup & Restore** | Hàng giờ | Hàng giờ | AWS Backup cross-region copy, S3 CRR, dựng hạ tầng bằng IaC khi có sự cố | Thấp nhất |
| **Pilot Light** | 10–30 phút | Vài giây – phút | Data layer luôn chạy & đồng bộ (Aurora Global DB / RDS Cross-Region Read Replica); Compute ở trạng thái tắt hoặc scale = 0 | Thấp – Trung bình |
| **Warm Standby** | Vài phút | Vài giây – phút | Bản sao thu nhỏ (scaled-down) của toàn bộ stack luôn chạy ở DR Region; scale-out nhanh khi failover | Trung bình – Cao |
| **Multi-Site Active-Active** | Gần như 0 (Real-time) | Gần như 0 | Toàn bộ workload chạy đồng thời ở ≥ 2 Regions, phân tải traffic qua Route 53 Latency/Geoproximity hoặc Global Accelerator | Cao nhất |

> **Exam Tip**: Phân biệt **Pilot Light** và **Warm Standby** trong câu hỏi thi:
> - Nếu ứng dụng ở DR Region **không thể phục vụ traffic ngay lập tức** (chỉ có DB chạy, EC2/ECS tắt hoặc chưa chạy) → **Pilot Light**.
> - Nếu ứng dụng ở DR Region **đang chạy ở quy mô nhỏ và có thể xử lý một phần traffic ngay lập tức** trước khi Auto Scaling mở rộng → **Warm Standby**.

---

## 2. Cơ sở dữ liệu & Lưu trữ Đa vùng (Multi-Region Data Layer)

### Amazon Aurora Global Database
- Sử dụng **storage-level replication** chuyên dụng xuyên Region với độ trễ thường **< 1 giây**, hỗ trợ tối đa **5 Secondary Regions** (lên đến 16 read replicas mỗi secondary region).
- **Write Forwarding**: Cho phép ứng dụng ở Secondary Region gửi lệnh ghi trực tiếp vào local Aurora cluster; Aurora tự chuyển tiếp về Primary Region. Giúp đơn giản hóa kiến trúc Active-Active đọc nhiều, ghi ít.
- **Managed Planned Failover** (RPO = 0, RTO ~1 phút) vs **Detach & Promote** cho sự cố ngoài kế hoạch (RTO < 1 phút, RPO ~1 giây).

### Amazon DynamoDB Global Tables
- Kiến trúc **Active-Active Multi-Region, Multi-Master** thực thụ: mọi Region đều nhận cả Read và Write cục bộ với độ trễ mili-giây.
- Đồng bộ bất đồng bộ (eventual consistency) giữa các Region, giải quyết xung đột ghi bằng cơ chế **Last Writer Wins (LWW)**.
- Yêu cầu bật **DynamoDB Streams** (`NEW_AND_OLD_IMAGES`). Nếu ứng dụng cần **strongly consistent reads** xuyên Region thì Global Tables không đảm bảo — cần thiết kế định tuyến user về home region hoặc xử lý conflict ở tầng ứng dụng.

### Amazon S3 Multi-Region Access Points (MRAP) & CRR
- **S3 Cross-Region Replication (CRR)** kết hợp **S3 Replication Time Control (RTC)** đảm bảo SLA 99.99% object được sao chép trong vòng **15 phút** (phần lớn trong vài giây).
- **S3 Multi-Region Access Points (MRAP)**: Cung cấp một **global endpoint duy nhất** chạy trên mạng xương sống AWS Global Accelerator, tự động định tuyến yêu cầu S3 đến bucket có độ trễ thấp nhất và hỗ trợ **Active-Active** hoặc **Active-Passive failover controls** trong vòng dưới 2 phút.

---

## 3. Global Traffic Management & Route 53 ARC

### So sánh CloudFront, Global Accelerator và Route 53

| Dịch vụ | Giao thức | Cơ chế hoạt động | Use Case tối ưu |
| :--- | :--- | :--- | :--- |
| **Amazon CloudFront** | HTTP/HTTPS, WebSockets | Caching tại Edge Locations + **Origin Shield** (lớp cache tập trung giảm tải cho Origin & tăng cache hit ratio) + **Origin Failover** | Web app, API, media streaming, static/dynamic content |
| **AWS Global Accelerator** | TCP, UDP (Layer 4) | Cấp **2 Static Anycast IP**, đẩy traffic vào AWS Global Network tại Edge gần nhất, **không phụ thuộc DNS TTL caching**, failover < 30 giây | Gaming, IoT, VoIP, ứng dụng tài chính cần IP cố định cho firewall allowlisting hoặc failover tức thì không chờ DNS TTL |
| **Amazon Route 53** | DNS (Layer 7 routing) | Latency-based, Geolocation, Geoproximity, Weighted, Failover routing + Health Checks | Định tuyến DNS linh hoạt, hỗ trợ tuân thủ data residency (Geolocation) |

> **Exam Tip**: Khi đề bài nhắc đến *"clients cache DNS records aggressively"* hoặc *"enterprise firewalls require static IP addresses"* kèm yêu cầu failover nhanh xuyên Region → chọn **AWS Global Accelerator**, không dùng Route 53 Failover thuần túy.

### Amazon Route 53 Application Recovery Controller (ARC)

Khi failover một hệ thống lớn cấp doanh nghiệp, rủi ro lớn nhất là **chuyển sang DR Region chưa sẵn sàng** hoặc **DNS control plane bị ảnh hưởng khi Region gặp sự cố**. Route 53 ARC giải quyết bằng 2 tính năng:
1. **Readiness Checks**: Liên tục giám sát tài nguyên, quotas, capacity và routing policy ở Recovery Region để đảm bảo nó đủ sức gánh tải tương đương Primary Region.
2. **Routing Controls (Zonal Shift / Multi-Region Failover)**: Sử dụng kiến trúc **Cluster 5 endpoints phân tán cực kỳ ổn định (Data Plane API)** thay vì phụ thuộc Control Plane. Cho phép bật/tắt định tuyến traffic theo kiểu on/off switch ngay cả trong sự cố nghiêm trọng, kèm **Safety Rules** (ví dụ: ngăn chặn tắt nhầm cả 2 Region cùng lúc).

```bash
# Ví dụ kích hoạt failover bằng Routing Control qua Cluster Endpoint (Data Plane)
aws route53-recovery-cluster update-routing-control-state \
  --routing-control-arn arn:aws:route53-recovery-control::111122223333:controlpanel/abc/routingcontrol/primary-off \
  --routing-control-state Off \
  --endpoint-url https://host-abc123.route53-recovery-cluster.us-west-2.amazonaws.com
```

---

## 4. Thiết kế Chịu lỗi ở Tầng Ứng dụng (Resilience Patterns)

- **Cell-Based Architecture**: Chia nhỏ hệ thống thành các "cells" độc lập (ví dụ mỗi cell phục vụ 10% khách hàng) đứng sau một thin routing layer. Khi 1 cell lỗi, blast radius chỉ giới hạn tối đa 10%.
- **Shuffle Sharding**: Phân bổ tập con ngẫu nhiên các worker/endpoint cho từng tenant để giảm thiểu tối đa tác động của *noisy neighbor* hoặc tấn công DDoS cục bộ.
- **AWS Fault Injection Service (FIS)**: Thực hành Chaos Engineering có kiểm soát (ngắt kết nối AZ, làm tăng latency RDS, terminate EC2/ECS tasks) để kiểm chứng thực tế cơ chế failover và alarm trước khi sự cố xảy ra ngoài thực tế.

---

[← Bài trước](03-hybrid-dns-dx-bgp-tgw-routing.md) | [Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/04-new-resilient-architectures.md) | [Bài tiếp →](05-global-traffic-cloudfront-accelerator.md)
