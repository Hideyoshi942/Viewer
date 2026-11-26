# Cheatsheet: 7Rs & Chọn Dịch vụ Di chuyển / Hiện đại hóa

## 1. Bảng Tra cứu Nhanh Công cụ Di chuyển

| Loại Workload / Dữ liệu | Công cụ AWS chuẩn | Khi nào dùng? |
| :--- | :--- | :--- |
| **Physical / VM Servers (Lift & Shift)** | **AWS Application Migration Service (MGN)** | Rehost hàng trăm server lên EC2 với continuous block-level replication, downtime vài phút |
| **VMware vSphere giữ nguyên tooling** | **VMware Cloud on AWS** (Relocate) | Cần chuyển VM VMware cực nhanh không đổi hypervisor/IP/vCenter |
| **Database cùng engine (Homogeneous)** | **AWS DMS** hoặc Native Tools | Oracle → Oracle, PostgreSQL → RDS PostgreSQL (Full load + CDC cho near-zero downtime) |
| **Database khác engine (Heterogeneous)** | **AWS SCT + AWS DMS** | Oracle/SQL Server → Aurora PostgreSQL/MySQL (SCT đổi schema/stored proc, DMS chép dữ liệu) |
| **File Share (NFS/SMB/HDFS) online** | **AWS DataSync** | Chép dữ liệu nhanh (gấp 10x), giữ nguyên POSIX/NTFS permissions, hỗ trợ lịch đồng bộ định kỳ |
| **SFTP / FTPS / FTP / AS2 server cũ** | **AWS Transfer Family** | Thay thế SFTP server bằng dịch vụ managed ghi thẳng vào S3 hoặc EFS |
| **Backup băng từ (Tape) & Cache tại chỗ** | **AWS Storage Gateway** | File Gateway (NFS/SMB), Volume Gateway (iSCSI), Tape Gateway (VTL) |
| **Dữ liệu 50 TB – nhiều PB, mạng chậm** | **AWS Snowball Edge** | Offline transfer khi truyền qua mạng mất > 1 tuần; có thể kèm DataSync sau để đồng bộ delta cuối |
| **Khảo sát & lập bản đồ phụ thuộc** | **Application Discovery Service (ADS)** | Dùng **Agent-based** khi cần thu thập network connections & processes; **Agentless** cho VMware VM specs |
| **Đóng gói app Java/.NET thành Container** | **AWS App2Container (A2C)** | Tự động containerize ứng dụng chạy trên VM sang Docker + ECS/EKS |

---

## 2. Công thức Tính Thời gian Truyền Dữ liệu (Online vs Offline)

Để quyết định dùng **Direct Connect / DataSync** hay **Snowball Edge**:
$$\text{Thời gian truyền (ngày)} = \frac{\text{Dung lượng (TB)} \times 8 \times 1000}{\text{Băng thông khả dụng (Gbps)} \times 86400 \times 0.8}$$
*(Hệ số `0.8` là hiệu suất thực tế ~80% của đường truyền mạng).*

- **Ví dụ nhanh**: 100 TB trên đường truyền 1 Gbps (hiệu dụng 800 Mbps) → mất khoảng **11.5 ngày** liên tục. Nếu cửa sổ di chuyển chỉ có 7 ngày → **phải dùng AWS Snowball Edge** (có thể chia nhiều thiết bị chạy song song) rồi dùng **AWS DataSync** đồng bộ phần dữ liệu thay đổi (incremental delta) trước cutover.

---

## 3. Chiến lược Hiện đại hóa (Modernization Patterns)

| Tình huống đề bài | Mẫu kiến trúc chuẩn |
| :--- | :--- |
| Tách dần ứng dụng Monolith lớn sang Microservices mà không gián đoạn | **Strangler Fig Pattern** (ALB / API Gateway định tuyến từng path sang microservice mới) |
| Giảm chi phí license Microsoft SQL Server / Oracle Enterprise | **Replatform/Refactor** sang **Amazon Aurora PostgreSQL/MySQL** (dùng **SCT + DMS**) |
| Thay thế cron job / workflow đa bước chạy nhiều giờ hoặc nhiều ngày | **AWS Step Functions** (Standard Workflows: tối đa 1 năm, exactly-once; Express: tốc độ cao, < 5 phút) |
| Xử lý đột biến tải cho API ghi vào DB cũ không scale được | **Decoupling với SQS / EventBridge + Lambda** (Queue-based Load Leveling) |

> **Exam Tip**: Khi đề bài nhắc đến *di chuyển 80 TB dữ liệu từ NAS on-premises trong 10 ngày qua đường truyền 100 Mbps, đồng thời dữ liệu vẫn tiếp tục phát sinh mới mỗi ngày* → kết hợp **AWS Snowball Edge** (chép bulk 80 TB offline) + **AWS DataSync** (đồng bộ incremental delta qua mạng trước giờ cutover).

---

[Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md)
