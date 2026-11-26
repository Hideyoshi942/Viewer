# Global Databases & Caching — Aurora Global Database, DynamoDB Global Tables, ElastiCache & DAX

Kiến trúc dữ liệu toàn cầu là xương sống của các hệ thống tài chính, thương mại điện tử và SaaS đa vùng trong kỳ thi **SAP-C02**.

---

## 1. Amazon Aurora Global Database vs DynamoDB Global Tables

| Tiêu chí | Aurora Global Database | DynamoDB Global Tables |
| :--- | :--- | :--- |
| **Mô hình dữ liệu** | Relational (MySQL / PostgreSQL) | NoSQL (Key-Value / Document) |
| **Kiến trúc Multi-Region** | **1 Primary (Write) + tối đa 5 Secondary Regions (Read-only)** | **Multi-Region Multi-Active (Active-Active Read & Write ở mọi Region)** |
| **Độ trễ Replication** | Thường **< 1 giây** (Storage-level replication) | Thường **< 1 giây** (Eventually Consistent cross-region) |
| **RPO / RTO khi thảm họa** | RPO ~ 1 giây, **RTO < 1 phút** (Managed Planned/Unplanned Failover) | **RPO ~ 0 / RTO ~ 0** (vì mọi Region đều đang Active) |
| **Write Forwarding** | Hỗ trợ chuyển tiếp lệnh Write từ Secondary về Primary | Không cần (mọi Region đều nhận Write trực tiếp) |

### Xử lý xung đột & Kết nối trong Aurora Global
- **Global Writer Endpoint** tự động trỏ tới Primary Region hiện tại khi thực hiện **Switchover** (planned) hoặc **Failover** (unplanned).
- **Aurora Serverless v2**: Tự động scale từ 0.5 ACU lên hàng trăm ACU trong < 1 giây, hỗ trợ làm Read Replica trong Aurora Global Database.
- **RDS Proxy**: Bắt buộc cân nhắc khi kiến trúc Serverless (Lambda) có hàng chục nghìn kết nối đồng thời tới Aurora/RDS.

---

## 2. Caching Đa tầng: ElastiCache (Redis vs Memcached) & DynamoDB DAX

| Giải pháp | Khi nào chọn? |
| :--- | :--- |
| **Amazon ElastiCache for Redis (Cluster Mode Enabled)** | Cần **Multi-AZ**, **Read Replicas**, **Persistence (AOF/RDB)**, **Global Datastore** (replicate cache giữa các AWS Regions), Pub/Sub, hoặc Sorted Sets. |
| **Amazon ElastiCache for Memcached** | Cần cache thuần túy cực đơn giản, kiến trúc **multi-threaded** tận dụng nhiều CPU core trên 1 node, không cần HA/Persistence. |
| **DynamoDB Accelerator (DAX)** | Chỉ dùng cho **DynamoDB**, giảm độ trễ đọc từ milliseconds xuống **microseconds** mà **không cần sửa logic ứng dụng** (API-compatible). Lưu ý: Không hỗ trợ Strong Consistency reads và không cache theo Region khác ngoài Region chứa bảng. |

### Chiến lược Caching (Cache-Aside vs Write-Through)
- **Lazy Loading (Cache-Aside)**: Ứng dụng đọc Cache trước -> Cache Miss -> Đọc DB -> Ghi vào Cache. Tiết kiệm bộ nhớ nhưng lần đọc đầu bị trễ và dữ liệu có thể cũ (stale) cho tới khi hết TTL.
- **Write-Through**: Ghi vào DB đồng thời cập nhật Cache -> Dữ liệu luôn mới, kết hợp **TTL** để tránh dữ liệu rác tồn đọng.

---

## 3. Bảo vệ & Phục hồi Database Cấp Doanh nghiệp

- **RDS Blue/Green Deployments**: Tạo môi trường Staging đồng bộ liên tục với Production để nâng cấp engine version (Major/Minor), thay đổi schema, rồi **switchover trong < 1 phút** với **zero data loss**.
- **AWS Backup Cross-Region & Cross-Account Copy + Vault Lock**: Sao lưu tập trung RDS, Aurora, DynamoDB, EFS, EBS sang tài khoản Audit/Backup riêng biệt và khóa WORM (**Compliance Mode**) để chống Ransomware.

```bash
# Tạo Aurora Global Database Cluster
aws rds create-global-cluster \
  --global-cluster-identifier enterprise-global-db \
  --engine aurora-postgresql \
  --engine-version 15.4
```

> [!TIP]
> **Exam Tip (SAP-C02)**:
> - Yêu cầu **Active-Active Multi-Region writes** với độ trễ đọc/ghi < 10ms tại địa phương -> **DynamoDB Global Tables**.
> - Yêu cầu **Relational DB (PostgreSQL/MySQL)** đa vùng với **RTO < 1 phút** và **Write Forwarding** -> **Aurora Global Database**.
> - Cần **Global Caching** (replicate session/cache sang Region khác cho DR) -> **ElastiCache for Redis Global Datastore**.

---

[← Bài trước](08-iac-stacksets-cicd-automation.md) | [Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/09-enterprise-databases-caching.md) | [Bài tiếp →](10-serverless-containers-event-driven-scale.md)
