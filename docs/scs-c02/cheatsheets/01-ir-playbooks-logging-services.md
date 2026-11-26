# Cheatsheet: Playbook Ứng phó Sự cố & Bản đồ Dịch vụ Logging

## 1. Playbook Ứng phó Sự cố (Incident Response Quick-Reference)

### Kịch bản A: EC2 Instance bị xâm nhập / Đào coin / Kết nối C&C
1. **KHÔNG Stop / Terminate** nếu cần thu thập **Memory (RAM)** hoặc giữ nguyên trạng thái.
2. Nếu thuộc **Auto Scaling Group**: Gọi `DetachInstances` (hoặc chuyển sang `Standby`) trước để ASG không tự terminate instance!
3. **Cô lập mạng**: Gắn **Isolation Security Group** (0 Inbound, 0 Outbound). Không xóa SG cũ nếu cần làm bằng chứng, chỉ thay thế SG gắn trên ENI.
4. **Thu hồi quyền IAM**: Gỡ IAM Instance Profile hoặc gắn `Deny *` với `aws:TokenIssueTime` vào Role để vô hiệu hóa STS token đang nằm trong bộ nhớ.
5. **Thu thập chứng cứ**: Bật Termination Protection → Dump RAM (qua SSM Run Command nếu còn chạy) lên Forensic S3 Bucket → Chụp **EBS Snapshot** → Tạo volume trong **Forensic Clean-Room VPC** để phân tích read-only.

### Kịch bản B: Lộ IAM Access Key / STS Temporary Credentials
1. **IAM User Access Key**: Chuyển trạng thái sang **Inactive** (không vội xóa để giữ metadata audit) → Đổi Console Password.
2. **IAM Role Temporary Credentials**: Gắn Inline Policy **`Deny *` với Condition `DateLessThan: aws:TokenIssueTime`** (Revoke Active Sessions) — vì xóa Role hoặc sửa Trust Policy **không** hủy các token đã cấp trước đó!
3. **Điều tra**: Truy vấn CloudTrail (Athena / CloudTrail Lake) theo `userIdentity.accessKeyId` trên **tất cả các Region** để tìm tài nguyên lạ (EC2, IAM backdoor user, Lambda).

### Kịch bản C: S3 Bucket bị lộ công khai (Public Exposure)
1. Bật **S3 Block Public Access** ở cấp **Account** (hoặc Bucket).
2. Xóa các statement `Principal: "*"` trong Bucket Policy và tắt ACL (`BucketOwnerEnforced`).
3. Kiểm tra **S3 Server Access Logs** hoặc **CloudTrail Data Events** (nếu đã bật) để xác định đối tượng nào đã bị tải xuống và từ IP nào.

## 2. Bản đồ Chọn Dịch vụ Logging & Monitoring trong Đề thi

| Nhu cầu trong câu hỏi | Dịch vụ đúng nhất |
| :--- | :--- |
| Ghi lại ai gọi API nào (`CreateUser`, `AuthorizeSecurityGroupIngress`) | **AWS CloudTrail** (Management Events) |
| Ghi lại ai đọc/ghi từng object S3 (`GetObject`, `PutObject`) hoặc gọi Lambda | **AWS CloudTrail Data Events** (hoặc S3 Server Access Logs cho S3) |
| Chứng minh log CloudTrail không bị giả mạo / chỉnh sửa | **CloudTrail Log File Integrity Validation** (SHA-256 + RSA) + **S3 Object Lock (Compliance)** |
| Phát hiện đột biến bất thường về tần suất gọi API ghi hoặc tỷ lệ lỗi API | **CloudTrail Insights** |
| Truy vấn SQL sự kiện CloudTrail đa tài khoản mà không muốn quản lý S3/Athena | **CloudTrail Lake** |
| Gom log từ nhiều nguồn AWS + 3rd party theo chuẩn **OCSF** (Parquet) | **Amazon Security Lake** |
| Theo dõi lịch sử cấu hình tài nguyên & tự động sửa lỗi cấu hình sai | **AWS Config** + **SSM Automation Remediation** |
| Ghi lại metadata gói tin IP (Accept/Reject) đi qua ENI | **VPC Flow Logs** (lưu ý: KHÔNG thấy DNS Amazon `.2` và IMDS `169.254.169.254`) |
| Phát hiện truy vấn DNS độc hại / DNS Tunneling từ trong VPC | **Route 53 Resolver Query Logs** (ghi log) + **DNS Firewall** (chặn) |
| Sao chép toàn bộ payload gói tin (L2-L4) gửi sang IDS bên ngoài | **VPC Traffic Mirroring** (VXLAN UDP 4789 — out-of-band, không chặn inline) |
| Chặn traffic độc hại inline theo Suricata IPS rules / lọc domain FQDN | **AWS Network Firewall** |
| Quét lỗ hổng CVE liên tục cho EC2, ECR container images và Lambda | **Amazon Inspector** |
| Phát hiện mối đe dọa bằng ML (CryptoMining, C&C, IAM exfiltration) | **Amazon GuardDuty** |
| Tổng hợp findings bảo mật theo chuẩn **ASFF** + chấm điểm CIS/FSBP/PCI | **AWS Security Hub** |
| Điều tra chuỗi hành vi (graph) và root cause của GuardDuty finding | **Amazon Detective** |

> **Exam Tip**: **EventBridge** là cầu nối tự động hóa trung tâm cho mọi kiến trúc phản ứng sự cố thời gian thực: `GuardDuty / Security Hub / CloudTrail / Inspector / Macie` → **EventBridge Rule** → **Lambda / Step Functions / SSM Automation / SNS**.

---

[Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md)
