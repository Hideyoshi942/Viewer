# Domain 2: Giám sát & Nhật ký Bảo mật (18%)

Domain 2 chiếm tới 18% trọng số kỳ thi **SCS-C02**, yêu cầu nắm vững kiến trúc thu thập, bảo vệ tính toàn vẹn, phân tích tập trung và cảnh báo tự động cho mọi loại log bảo mật trên AWS.

## 1. AWS CloudTrail: Trụ cột Audit API

CloudTrail ghi lại mọi lời gọi API trong tài khoản AWS, chia làm 3 loại sự kiện:
- **Management Events**: Thao tác Control Plane (tạo EC2, sửa IAM Policy, xóa S3 bucket). Mặc định Event History lưu miễn phí 90 ngày (nhưng không xuất ra S3 nếu không tạo Trail).
- **Data Events**: Thao tác Data Plane tần suất cao (`s3:GetObject`, `s3:PutObject`, `lambda:InvokeFunction`, DynamoDB `GetItem`/`PutItem`). **Không bật mặc định** và có tính phí riêng.
- **CloudTrail Insights**: Sử dụng ML phát hiện bất thường về khối lượng lời gọi API ghi (`write`) hoặc tỷ lệ lỗi (`error rate`) đột biến.

### Organization Trail & Log File Integrity Validation
- **Organization Trail**: Tạo từ Management Account (hoặc Delegated Admin), tự động áp dụng cho **tất cả** tài khoản thành viên và mọi Region. Tài khoản thành viên **không thể sửa hoặc xóa** Organization Trail.
- **Log File Validation**: CloudTrail tạo file digest mỗi giờ sử dụng thuật toán **SHA-256** và ký số bằng khóa riêng **SHA-256 with RSA** của AWS. Dùng lệnh CLI `aws cloudtrail validate-logs` để chứng minh log chưa từng bị chỉnh sửa hay xóa kể từ khi ghi.
- **Bảo vệ S3 Log Archive Bucket**:
  - Đặt tại tài khoản **Log Archive** riêng biệt.
  - Bật **S3 Versioning**, **S3 Object Lock (Compliance Mode)**, **MFA Delete**, và mã hóa **SSE-KMS**.
  - Bucket Policy chỉ cho phép `cloudtrail.amazonaws.com` thực hiện `s3:PutObject` với điều kiện `aws:SourceArn` và `s3:x-amz-acl: bucket-owner-full-control`.

> **Exam Tip**: Nếu câu hỏi nhắc đến **bằng chứng pháp lý / phát hiện log bị sửa đổi trái phép (tamper-evident)** cho CloudTrail, đáp án luôn liên quan đến **CloudTrail Log File Integrity Validation** kết hợp **S3 Object Lock (Compliance Mode)**.

## 2. CloudTrail Lake vs. Amazon Security Lake vs. Athena

| Giải pháp | Cơ chế hoạt động | Chuẩn dữ liệu | Khi nào chọn trong đề thi? |
| :--- | :--- | :--- | :--- |
| **Amazon Athena + S3** | Truy vấn SQL serverless trực tiếp trên file log JSON/Parquet lưu ở S3 | Định dạng gốc (CloudTrail, VPC Flow, ALB, WAF) | Cần phân tích ad-hoc chi phí thấp trên log đã lưu sẵn ở S3 (nhớ dùng Partition Projection để tối ưu tốc độ) |
| **CloudTrail Lake** | Managed data lake chuyên biệt cho CloudTrail, Config, Audit events; lưu tối đa 7 năm (hoặc 10 năm với gói mở rộng), bất biến (immutable) | Apache ORC nội bộ | Cần truy vấn SQL trực tiếp sự kiện đa tài khoản/đa Region mà **không muốn tự quản lý S3, Glue hay Athena** |
| **Amazon Security Lake** | Tự động chuẩn hóa log từ AWS & bên thứ 3 về chuẩn **OCSF** (Open Cybersecurity Schema Framework) dưới dạng Apache Parquet trên S3 | **OCSF** (Parquet) | Cần xây dựng Security Data Lake tập trung theo chuẩn mở OCSF cho nhiều công cụ SIEM/Analytics (Splunk, QRadar, OpenSearch) |
| **CloudWatch Logs Insights** | Truy vấn thời gian thực trên Log Groups, kết hợp **Metric Filters** tạo CloudWatch Alarm | JSON / Plain text | Cần tạo cảnh báo gần thời gian thực (ví dụ: phát hiện Root Login, sửa Security Group, Unauthorized API calls) |

## 3. Network & DNS Logging: VPC Flow Logs và Route 53 Query Logs

### VPC Flow Logs
- Ghi lại metadata của IP traffic đi vào/ra ENI (hỗ trợ bật ở cấp **VPC**, **Subnet**, hoặc **ENI**).
- **KHÔNG ghi lại**:
  - Traffic đến Amazon DNS Server (trừ khi dùng DNS server tự dựng).
  - Traffic đến **EC2 Instance Metadata Service (169.254.169.254)** và Amazon Time Sync (`169.254.169.123`).
  - Traffic DHCP, Windows license activation, và traffic đến địa chỉ IP mặc định của VPC router.
- **Đích lưu trữ**: CloudWatch Logs, Amazon S3 (hỗ trợ định dạng **Parquet** và Hive-compatible partitions để giảm chi phí Athena), hoặc Amazon Data Firehose.
- **Custom Format (v3/v4/v5)**: Thêm các trường nâng cao như `pkt-srcaddr`, `pkt-dstaddr`, `flow-direction`, `traffic-path`, `tcp-flags` để điều tra NAT Gateway hoặc tìm traffic bị từ chối (`REJECT`).

### Route 53 Resolver Query Logs
- Ghi lại mọi truy vấn DNS phát sinh từ bên trong VPC (EC2, Lambda trong VPC, ECS).
- Cực kỳ quan trọng để phát hiện **DNS Tunneling / Data Exfiltration** hoặc malware truy vấn domain C&C (vì VPC Flow Logs không thấy DNS query gửi tới Amazon Provided DNS `.2`).

## 4. AWS Config: Theo dõi Thay đổi Cấu hình & Tự động Khắc phục

Khác với CloudTrail (trả lời *"Ai đã gọi API gì, lúc nào?"*), **AWS Config** trả lời *"Trạng thái cấu hình của tài nguyên hiện tại là gì, đã thay đổi ra sao theo thời gian, và có tuân thủ quy định không?"*.

- **AWS Config Rules**:
  - **AWS Managed Rules**: Hơn 300 rule có sẵn (ví dụ: `s3-bucket-public-read-prohibited`, `encrypted-volumes`, `iam-user-mfa-enabled`).
  - **Custom Rules**: Viết bằng AWS Lambda hoặc **AWS Config Custom Policy (Guard DSL)** — viết rule bằng CloudFormation Guard mà không cần duy trì Lambda!
- **Auto-Remediation**: Gắn trực tiếp **AWS Systems Manager (SSM) Automation Document** vào Config Rule (ví dụ: `AWS-DisablePublicAccessForSecurityGroup` hoặc `AWS-DisableS3BucketPublicReadWrite`).
- **Config Aggregator**: Gom dữ liệu compliance từ nhiều tài khoản (AWS Organizations) và nhiều Region về một dashboard duy nhất.

```bash
# Kiểm tra tính toàn vẹn của CloudTrail logs bằng AWS CLI
aws cloudtrail validate-logs \
  --trail-arn arn:aws:cloudtrail:us-east-1:111122223333:trail/org-security-trail \
  --start-time 2026-11-19T00:00:00Z
```

> **Exam Tip**: Khi cần phát hiện **thời gian thực** một hành động cụ thể như *"Root user đăng nhập"* hoặc *"Ai đó thay đổi CloudTrail"*:
> - Cách 1 (Nhanh nhất, Event-driven): **EventBridge Rule** bắt sự kiện từ CloudTrail → gửi SNS / chạy Lambda.
> - Cách 2 (Theo ngưỡng số lượng, ví dụ > 5 lần `AccessDenied` trong 5 phút): Đẩy CloudTrail sang **CloudWatch Logs** → tạo **Metric Filter** → tạo **CloudWatch Alarm** → gửi SNS.

---

[← Bài trước](02-ir-playbooks-forensics-remediation.md) | [Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/03-log-cloudtrail-security-lake.md) | [Bài tiếp →](04-vpc-flow-logs-dns-athena-config.md)
