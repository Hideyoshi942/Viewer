# Cheatsheet: Ma trận Quyết định Multi-Region, DR & Global Traffic

## 1. Chọn Chiến lược DR theo RTO / RPO & Ngân sách

| RTO / RPO yêu cầu | Chiến lược DR | Kiến trúc AWS chuẩn |
| :--- | :--- | :--- |
| **RTO: Giờ / RPO: Giờ** (Chi phí thấp nhất) | **Backup & Restore** | AWS Backup Cross-Region Copy + S3 CRR + CloudFormation/Terraform dựng lại hạ tầng |
| **RTO: 10–30 phút / RPO: Giây–Phút** | **Pilot Light** | Aurora Global DB / RDS Cross-Region Replica chạy liên tục; EC2/ECS ở DR Region ở trạng thái **tắt (0 instances)**, khởi chạy khi failover |
| **RTO: Vài phút / RPO: Giây–Phút** | **Warm Standby** | Toàn bộ app stack chạy ở DR Region ở **quy mô thu nhỏ (scaled-down)**, nhận được traffic ngay rồi Auto Scaling mở rộng |
| **RTO: ~0 / RPO: ~0** (Mission-critical) | **Multi-Site Active-Active** | Toàn bộ stack chạy full capacity ở ≥ 2 Regions; DynamoDB Global Tables / Aurora Global DB + Write Forwarding; Route 53 Latency/Global Accelerator |

---

## 2. Cơ sở dữ liệu & Lưu trữ Đa vùng

| Dịch vụ | Kiểu đồng bộ | RTO / RPO điển hình | Điểm đặc biệt cần nhớ |
| :--- | :--- | :--- | :--- |
| **Aurora Global Database** | Storage-level replication (< 1s) | RTO < 1 phút, RPO ~1s (Managed Planned Failover: RPO = 0) | Hỗ trợ tối đa 5 Secondary Regions; hỗ trợ **Write Forwarding** từ Secondary về Primary |
| **DynamoDB Global Tables** | Active-Active Multi-Master (Async) | RTO ~0, RPO ~1s | Mọi Region đều Read/Write cục bộ; xử lý xung đột bằng **Last Writer Wins (LWW)** |
| **RDS Cross-Region Read Replica** | Async replication | RTO vài phút (promote thủ công/tự động) | Hỗ trợ tối đa 5 replicas; khi promote sẽ tách thành standalone DB cluster/instance |
| **S3 CRR + RTC** | Async với SLA | 99.99% object đồng bộ trong **< 15 phút** | Bắt buộc bật **S3 Versioning** trên cả source và destination bucket |
| **S3 Multi-Region Access Points (MRAP)** | Global endpoint trên Global Accelerator | Failover < 2 phút | Một endpoint duy nhất cho nhiều bucket ở nhiều Region; hỗ trợ Active-Active & Active-Passive |
| **KMS Multi-Region Keys (MRK)** | Đồng bộ cùng key material (`mrk-*`) | Giải mã cục bộ tức thì | Mã hóa ở Region A, giải mã ở Region B **không cần re-encrypt** và không gọi API xuyên Region |

---

## 3. CloudFront vs Global Accelerator vs Route 53 ARC

| Từ khóa trong đề thi | Chọn ngay dịch vụ |
| :--- | :--- |
| Static IP allowlisting trên firewall khách hàng; non-HTTP (TCP/UDP); client cache DNS TTL lâu | **AWS Global Accelerator** |
| Caching static/dynamic HTTP content; giảm tải Origin bằng lớp cache tập trung | **Amazon CloudFront + Origin Shield** |
| Kiểm tra DR Region đã đủ quota/capacity chưa; chuyển traffic không phụ thuộc Control Plane API | **Route 53 Application Recovery Controller (ARC)** (Readiness Checks + Routing Controls) |
| Tuân thủ Data Residency theo quốc gia/châu lục | **Route 53 Geolocation Routing** |
| Phục vụ người dùng ở Region có độ trễ mạng thấp nhất (DNS-based) | **Route 53 Latency-Based Routing** |

> **Exam Tip**: Khi failover Multi-Region với **Route 53 ARC**, luôn nhớ **Routing Control** sử dụng **Data Plane Cluster Endpoints** (5 Regional endpoints) để đảm bảo vẫn bật/tắt failover được ngay cả khi Route 53 Control Plane (ở `us-east-1`) gặp sự cố.

---

[Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md)
