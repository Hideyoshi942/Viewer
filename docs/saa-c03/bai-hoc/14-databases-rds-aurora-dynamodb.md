# Database Hiệu năng cao & Caching — RDS, Aurora, DynamoDB, ElastiCache & DocumentDB

Lựa chọn đúng loại Database (Relational vs NoSQL vs In-Memory Cache) và cấu hình High Availability / Read Scaling là một trong những chủ đề xuất hiện nhiều nhất trong đề thi AWS SAA-C03.

---

## 1. Amazon RDS: Multi-AZ vs Read Replicas

| Tính năng | RDS Multi-AZ (Standby) | RDS Read Replicas |
| :--- | :--- | :--- |
| **Mục đích chính** | **High Availability & Failover** | **Read Scaling** (giảm tải đọc cho Primary) |
| **Cơ chế Replication** | **Synchronous** (đồng bộ) | **Asynchronous** (bất đồng bộ) |
| **Truy cập từ ứng dụng** | Standby **KHÔNG** phục vụ read/write | Có Endpoint riêng để phục vụ **Read-only** |
| **Phạm vi Region** | Cùng Region (khác AZ) | Cùng Region hoặc **Cross-Region** |
| **Automated Backups** | Bắt buộc bật | Có thể nâng cấp (Promote) thành Standalone DB |

### Amazon RDS Proxy
Khi kiến trúc **Serverless (AWS Lambda)** kết nối trực tiếp tới RDS, hàng ngàn Lambda invocations đồng thời có thể làm cạn kiệt connection pool của RDS:
- **RDS Proxy** đứng giữa Lambda và RDS để **pool và share database connections**.
- Giảm thời gian failover của RDS/Aurora lên tới **66%** và hỗ trợ xác thực qua **IAM Auth + Secrets Manager**.

---

## 2. Amazon Aurora — Kiến trúc Cloud-Native Database

Aurora tương thích MySQL và PostgreSQL, cho hiệu năng gấp **5x MySQL** và **3x PostgreSQL** tiêu chuẩn:
- **Storage tự động mở rộng**: Lưu trữ **6 bản sao (copies)** trên **3 AZs**, tự động scale từ 10 GB lên **128 TB**.
- **Aurora Replicas**: Hỗ trợ tối đa **15 Read Replicas** với độ trễ dưới 10ms và hỗ trợ **Auto Scaling**.
- **Aurora Global Database**: 1 Primary Region và tối đa **5 Secondary Regions** (read-only), độ trễ replication < 1 giây, phục hồi thảm họa **RTO < 1 phút**.
- **Aurora Serverless v2**: Tự động scale capacity (ACUs) trong tích tắc cho các workload có lưu lượng biến động đột ngột (unpredictable workloads).

---

## 3. Amazon DynamoDB — NoSQL Serverless Triệu Requests/Giây

DynamoDB là key-value / document database cung cấp độ trễ **single-digit millisecond** ở mọi quy mô:
- **Capacity Modes**:
  - **On-Demand**: Trả tiền theo từng request (WCU/RCU), phù hợp traffic khó đoán hoặc mới khởi chạy.
  - **Provisioned + Auto Scaling**: Rẻ hơn tới 70% cho traffic ổn định/dễ đoán.
- **Chỉ mục phụ (Secondary Indexes)**:
  - **LSI (Local Secondary Index)**: Chung Partition Key, khác Sort Key, phải tạo lúc khởi tạo bảng.
  - **GSI (Global Secondary Index)**: Khác Partition Key & Sort Key, có thể tạo/sửa bất kỳ lúc nào.
- **DynamoDB Accelerator (DAX)**: In-memory cache tích hợp cho DynamoDB, giảm độ trễ đọc từ milliseconds xuống **microseconds** (lưu ý: chỉ dùng khi không cần thay đổi logic truy vấn DynamoDB API).
- **DynamoDB Streams + Global Tables**:
  - **Streams**: Bắt sự kiện Insert/Update/Delete (TTL expiry) để kích hoạt Lambda.
  - **Global Tables**: **Multi-Region, Multi-Active (Active-Active)** replication với độ trễ dưới 1 giây.

```bash
# Bật Point-in-Time Recovery (PITR) cho bảng DynamoDB (phục hồi tới bất kỳ giây nào trong 35 ngày)
aws dynamodb update-continuous-backups \
  --table-name OrdersTable \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

---

## 4. Amazon ElastiCache (Redis vs Memcached) & Các Database Chuyên biệt

| Dịch vụ | Khi nào chọn trong đề thi SAA-C03? |
| :--- | :--- |
| **ElastiCache for Redis** | Cần **Multi-AZ Auto Failover**, **Data Persistence**, Pub/Sub, Sorted Sets (Leaderboards), Session Store có độ bền cao. |
| **ElastiCache for Memcached** | Cần cache đơn giản, **Multi-threaded** scale ngang nhiều node, không cần persistence hay replication. |
| **Amazon DocumentDB** | Tương thích **MongoDB** (JSON document database) được quản lý hoàn toàn trên AWS. |
| **Amazon Neptune** | **Graph Database** cho mạng xã hội, fraud detection, recommendation engine. |
| **Amazon Timestream** | **Time-series Database** cho IoT telemetry, DevOps metrics (tự động tiering memory -> magnetic). |

> [!TIP]
> **Exam Tip (SAA-C03)**:
> - Lambda kết nối RDS bị lỗi `Too many connections` -> Thêm **Amazon RDS Proxy**.
> - Cần **Active-Active Multi-Region** cho NoSQL -> **DynamoDB Global Tables**.
> - Cần **đọc RDS độ trễ thấp cho người dùng ở châu Âu** (DB chính ở US) -> **RDS Cross-Region Read Replica** hoặc **Aurora Global Database**.

---

[← Bài trước](13-ebs-efs-fsx-deep-dive.md) | [Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/14-databases-rds-aurora-dynamodb.md) | [Bài tiếp →](15-migration-analytics-dms-glue-redshift.md)
