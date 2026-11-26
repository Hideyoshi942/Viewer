# Cheatsheet 1: Bảo mật, Mã hóa & Governance (SAA-C03 Domain 1)

## 1. Bảng Chọn Nhanh Dịch Vụ Bảo Mật (Security Decision Matrix)
| Nhu cầu / Từ khóa trong đề thi | Dịch vụ chuẩn | Lưu ý cốt lõi |
| :--- | :--- | :--- |
| Chặn hành động trên toàn Organization (kể cả **Root User của Member Account**) | **AWS Organizations SCP** | SCP **không cấp quyền**, không áp dụng cho Management Account. |
| Nhân viên công ty dùng **AD / Okta** đăng nhập nhiều AWS Accounts | **IAM Identity Center (SSO)** | Quản lý tập trung Permission Sets theo OU/Account. |
| Người dùng cuối (Mobile/Web) đăng nhập Google/Facebook/Email | **Amazon Cognito** | User Pools (AuthN) + Identity Pools (đổi STS credentials). |
| Chặn **SQLi, XSS, Geo-block, Rate-limit IP** ở Layer 7 | **AWS WAF** | Gắn vào CloudFront, ALB, API Gateway, AppSync, Cognito. |
| Chống DDoS có **DRT/SRT 24/7** & **Cost Protection** | **AWS Shield Advanced** | Shield Standard miễn phí mặc định. |
| Quét **PII / Thẻ tín dụng / Hộ chiếu** trong **S3** bằng ML | **Amazon Macie** | Chỉ quét S3 objects. |
| Phát hiện **Crypto mining / IP độc hại / Hành vi bất thường** từ logs | **Amazon GuardDuty** | Phân tích CloudTrail, VPC Flow Logs, DNS Logs (không cần agent). |
| Điều tra nguyên nhân gốc rễ (**Forensics / Root Cause**) sau cảnh báo | **Amazon Detective** | Dựng đồ thị liên kết hành vi từ findings của GuardDuty. |
| Quét **lỗ hổng phần mềm (CVE)** trên EC2, ECR, Lambda | **Amazon Inspector** | Dùng SSM Agent trên EC2 hoặc quét trực tiếp ECR/Lambda. |
| Gom cảnh báo bảo mật đa tài khoản theo chuẩn **CIS / PCI-DSS** | **AWS Security Hub** | Trung tâm tổng hợp findings từ GuardDuty, Inspector, Macie. |

---

## 2. Mã hóa & Quản lý Bí mật (KMS vs CloudHSM vs Secrets)
- **KMS API limit**: `4 KB`. Lớn hơn dùng **Envelope Encryption** (`GenerateDataKey`).
- **Chia sẻ Encrypted EBS/RDS Snapshot Cross-Account**: Bắt buộc dùng **Customer Managed Key (CMK)** (AWS Managed Key `aws/ebs` không chia sẻ được!).
- **Giảm 99% chi phí & throttling KMS cho S3**: Bật **S3 Bucket Keys**.
- **AWS CloudHSM**: Chọn khi bắt buộc **Single-tenant dedicated hardware (FIPS 140-2 Level 3)**, tự giữ khóa gốc, hoặc SSL/TLS offloading.
- **Secrets Manager vs SSM Parameter Store**:
  - **Auto-rotate DB credentials** → **Secrets Manager** ($0.40/secret/tháng).
  - **Config / Secrets không cần auto-rotate, giá $0** → **SSM Parameter Store (Standard)**.
- **ACM Certificate**: Gắn cho CloudFront phải tạo ở **`us-east-1`**. Không tải được Private Key của Public Cert về cài lên EC2.

---

## 3. CloudWatch vs CloudTrail vs AWS Config vs SSM
| Dịch vụ | Trả lời câu hỏi gì? | Mẹo nhớ nhanh |
| :--- | :--- | :--- |
| **Amazon CloudWatch** | Hệ thống khỏe không? (CPU, RAM, Disk, App Logs) | **RAM & Disk** trên EC2 phải cài **CloudWatch Agent**. |
| **AWS CloudTrail** | **Ai đã làm gì?** (API Calls) | Lưu mặc định 90 ngày Management Events. Đọc/ghi S3 object → Bật **Data Events**. |
| **AWS Config** | **Cấu hình đổi thế nào?** (Compliance) | Phát hiện Non-Compliant + Auto-Remediation bằng **SSM Automation**. |
| **SSM Session Manager** | Truy cập EC2 Private không cần SSH/Bastion? | Không mở Port 22, không cần Public IP, ghi log lệnh. |

---

[Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md)
