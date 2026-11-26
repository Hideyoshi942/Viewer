# VPC Flow Logs, DNS Query Logs, AWS Config & Athena Security Analytics

Domain 2 của SCS-C02 kiểm tra khả năng thu thập, lưu trữ bảo mật và truy vấn log mạng/cấu hình ở quy mô lớn bằng **VPC Flow Logs**, **Route 53 Resolver DNS Query Logs**, **AWS Config** và **Amazon Athena**.

---

## 1. VPC Flow Logs: S3 vs CloudWatch Logs & Custom Format

- **Phạm vi gắn:** Có thể bật ở cấp **VPC**, **Subnet**, hoặc **ENI** (Elastic Network Interface).
- **Trạng thái ghi nhận:** Ghi lại `ACCEPT` và `REJECT` traffic IP đi qua ENI (không ghi nội dung gói tin payload).
- **Lưu ý những traffic KHÔNG xuất hiện mặc định (hoặc có lưu ý đặc biệt):**
  - Traffic tới Amazon DNS Server (`169.254.169.253` hoặc `.2` của VPC CIDR) — trừ khi dùng Route 53 Resolver Query Logs.
  - Traffic tới Instance Metadata Service (`169.254.169.254`), DHCP, Amazon Time Sync (`169.254.169.123`).
- **Đích lưu trữ (Destination):**
  - **Amazon S3:** Chi phí rẻ nhất cho lưu trữ dài hạn, hỗ trợ **Hive-compatible partitioning** theo ngày/giờ và định dạng **Apache Parquet** để truy vấn cực nhanh bằng **Amazon Athena**.
  - **CloudWatch Logs:** Hỗ trợ cảnh báo real-time qua **Metric Filters** và truy vấn nhanh bằng **CloudWatch Logs Insights**.

```sql
-- Truy vấn Athena tìm top 10 IP bị REJECT nhiều nhất từ VPC Flow Logs
SELECT srcaddr, dstport, COUNT(*) AS rejected_count
FROM vpc_flow_logs
WHERE action = 'REJECT' AND dstport IN (22, 3389)
GROUP BY srcaddr, dstport
ORDER BY rejected_count DESC
LIMIT 10;
```

---

## 2. Route 53 Resolver DNS Query Logs vs Public Hosted Zone Logs

| Loại Log | Phạm vi | Đích lưu trữ | Mục đích bảo mật |
| :--- | :--- | :--- | :--- |
| **Route 53 Resolver Query Logs** | Toàn bộ truy vấn DNS **từ bên trong VPC** ra ngoài hoặc nội bộ | S3, CloudWatch Logs, Kinesis Data Firehose | Phát hiện **DNS Tunneling / Data Exfiltration**, kết nối tới domain độc hại (C2) |
| **Route 53 Public DNS Query Logs** | Truy vấn từ Internet tới Public Hosted Zone của bạn | Chỉ CloudWatch Logs (`us-east-1`) | Theo dõi lưu lượng DNS public |

> [!TIP]
> **Exam Tip:** Nếu đề bài hỏi cách phát hiện EC2 trong VPC đang thực hiện **DNS exfiltration** hoặc truy vấn tên miền độc hại, chọn **Route 53 Resolver DNS Query Logging** (kết hợp **Route 53 Resolver DNS Firewall** để chặn). Lưu ý VPC Flow Logs không thấy được tên miền trong gói tin DNS!

---

## 3. AWS Config & Bảo mật Lưu trữ Log

- **AWS Config:** Ghi lại **lịch sử thay đổi cấu hình** (Configuration History & Snapshots) của tài nguyên AWS và đánh giá tuân thủ (Config Rules). Kết hợp **AWS Config Aggregator** để gom dữ liệu tuân thủ từ nhiều tài khoản và nhiều Region về một tài khoản Security/Audit.
- **Bảo vệ Log Bucket:** Bật **S3 Versioning**, **S3 Object Lock (Governance/Compliance Mode)**, **SSE-KMS**, và chặn truy cập công khai (**S3 Block Public Access**).

---

## 4. Tối ưu Truy vấn Log Bảo mật với Athena & CloudWatch Logs Insights

- **Athena Partition Projection:** Khi lưu VPC Flow Logs hoặc CloudTrail trên S3, cấu hình **Partition Projection** trên bảng Glue Data Catalog theo `year/month/day` (hoặc `account_id/region/date`) để tránh phải chạy `MSCK REPAIR TABLE` mỗi ngày và giảm 90% chi phí quét dữ liệu.
- **CloudWatch Logs Insights:** Dùng cú pháp `fields @timestamp, srcAddr, dstPort | filter action="REJECT" | stats count(*) by srcAddr | sort count(*) desc` để điều tra sự cố mạng trong vòng vài giây.
- **Bảo mật KMS cho Log:** Với CloudWatch Logs, gắn KMS CMK vào Log Group bằng `associate-kms-key`; nhớ cấp quyền `logs.<region>.amazonaws.com` trong KMS Key Policy.

---

[← Bài trước](03-security-logging-monitoring.md) | [Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/04-log-vpc-dns-config-athena.md) | [Bài tiếp →](05-infrastructure-edge-security.md)
