# Mã hóa Dữ liệu & Quản lý Bí mật trên AWS (SAA-C03 Domain 1)

Bảo vệ dữ liệu khi lưu trữ (**Encryption at Rest**) và khi truyền tải (**Encryption in Transit**) là yêu cầu bắt buộc trong hầu hết các câu hỏi bảo mật của SAA-C03. Bạn cần nắm rõ khi nào dùng KMS, khi nào phải dùng CloudHSM, và sự khác biệt về chi phí/tính năng giữa Secrets Manager với SSM Parameter Store.

---

## 1. AWS KMS vs AWS CloudHSM

### Cơ chế Envelope Encryption trong AWS KMS
KMS không trực tiếp mã hóa file 10 GB gửi qua mạng (giới hạn API `Encrypt` của KMS chỉ là **4 KB**). Thay vào đó, KMS dùng **Envelope Encryption**:
1. Ứng dụng gọi `kms:GenerateDataKey` → KMS trả về 2 bản sao của **Data Encryption Key (DEK)**: bản **Plaintext DEK** và bản **Encrypted DEK** (được mã hóa bằng KMS Key).
2. Ứng dụng dùng Plaintext DEK để mã hóa dữ liệu lớn (ví dụ file 10 GB) ngay tại local, sau đó **xóa Plaintext DEK khỏi RAM**.
3. Lưu dữ liệu đã mã hóa cùng với Encrypted DEK. Khi cần giải mã, gửi Encrypted DEK lên KMS (`kms:Decrypt`) để lấy lại Plaintext DEK.

### Phân loại KMS Keys
| Loại Key | Quản lý bởi | Xoay khóa tự động (Rotation) | Cross-Account Access | Chi phí |
| :--- | :--- | :--- | :--- | :--- |
| **AWS Owned Keys** | AWS | Tự động | Không | Miễn phí |
| **AWS Managed Keys** (`aws/s3`, `aws/ebs`) | AWS (riêng cho từng account) | Mỗi **1 năm** (tự động, không tắt được) | **Không** (Không thể chia sẻ snapshot mã hóa bằng `aws/ebs` sang account khác!) | Miễn phí |
| **Customer Managed Keys (CMK)** | Khách hàng | Tùy chọn bật mỗi **1 năm** (tối thiểu 90 ngày với custom rotation) | **Có** (Qua Key Policy) | **$1/tháng** + phí API calls |

> **Exam Trap kinh điển**: Bạn muốn chia sẻ một **Encrypted EBS Snapshot** hoặc **Encrypted RDS Snapshot** sang AWS Account khác? Nếu nó đang mã hóa bằng `aws/ebs` (AWS Managed Key), bạn **KHÔNG THỂ** chia sẻ trực tiếp! Bạn phải copy snapshot đó và mã hóa lại bằng **Customer Managed Key (CMK)**, đồng thời cấp quyền sử dụng CMK đó cho Account đích.

### AWS KMS Multi-Region Keys
- Là tập hợp các KMS Key ở nhiều Region khác nhau nhưng có **cùng Key ID và Key Material**.
- Cho phép **mã hóa ở Region A và giải mã ngay ở Region B** mà không cần gọi API xuyên Region (giảm độ trễ, hỗ trợ **Aurora Global Database** hoặc **DynamoDB Global Tables** với Client-side Encryption).

### Khi nào bắt buộc chọn AWS CloudHSM thay vì KMS?
- Yêu cầu phần cứng **Single-tenant Dedicated HSM** đạt chuẩn **FIPS 140-2 Level 3** (hoặc Level 3 nói chung; KMS là FIPS 140-2 Level 2, một số thành phần Level 3).
- Khách hàng phải **tự quản lý hoàn toàn khóa gốc**, AWS không có quyền truy cập hay khôi phục khóa (nếu mất mật khẩu CO/CU, dữ liệu mất vĩnh viễn).
- Cần tích hợp qua chuẩn công nghiệp **PKCS#11, JCE, OpenSSL** hoặc làm **SSL/TLS Offloading** cho web server, **Oracle TDE** trực tiếp.
- **Lưu ý HA**: CloudHSM không tự động Multi-AZ như KMS — bạn phải tự triển khai ít nhất **2 HSM instances ở 2 AZ khác nhau** để đạt High Availability.

---

## 2. S3 Encryption Options (SSE-S3, SSE-KMS, SSE-C, DSSE-KMS)

| Phương thức | Quản lý Key | Audit Trail (CloudTrail) | Điểm lưu ý trong đề thi |
| :--- | :--- | :--- | :--- |
| **SSE-S3** (`AES256`) | AWS S3 tự quản lý hoàn toàn | Không có log từng lần dùng key | Mặc định cho mọi bucket mới từ 2023. Miễn phí. |
| **SSE-KMS** (`aws:kms`) | AWS KMS (CMK) | **Có** (ghi lại mọi `kms:Decrypt` trong CloudTrail) | Cần quyền IAM cho cả `s3:GetObject` VÀ `kms:Decrypt`. Có thể bị giới hạn KMS API TPS nếu tải quá cao → Bật **S3 Bucket Keys** để giảm **99%** số lần gọi KMS! |
| **DSSE-KMS** | AWS KMS (2 lớp mã hóa độc lập) | Có | Dùng cho ngành tài chính/quốc phòng yêu cầu **Dual-layer server-side encryption**. |
| **SSE-C** | Khách hàng tự giữ Key ở on-prem | Không | Khách hàng gửi Key qua HTTP Header (`x-amz-server-side-encryption-customer-key`) trong **mọi request** (bắt buộc HTTPS). |

---

## 3. AWS Secrets Manager vs SSM Parameter Store

| Tiêu chí | AWS Secrets Manager | AWS Systems Manager (SSM) Parameter Store |
| :--- | :--- | :--- |
| **Tự động xoay mật khẩu (Auto Rotation)** | **Có** (Tích hợp sẵn Lambda rotation cho RDS, Aurora, Redshift, DocumentDB; hỗ trợ custom rotation) | **Không** (Phải tự viết EventBridge + Lambda) |
| **Tạo mật khẩu ngẫu nhiên** | Có (`GenerateRandomPassword`) | Không |
| **Cross-Region Replication** | Có (Multi-Region Secrets cho DR) | Không có sẵn |
| **Giới hạn kích thước** | 64 KB | Standard: 4 KB, Advanced: 8 KB |
| **Chi phí** | **$0.40 / secret / tháng** + $0.05 / 10,000 API calls | **Standard Tier: Miễn phí** (tối đa 10,000 parameters). Advanced Tier: $0.05/parameter/tháng |
| **Khi nào chọn?** | Lưu **Database credentials, API keys** cần **Auto-rotation**, **Cross-account/Multi-region** | Lưu **cấu hình ứng dụng** (URL, feature flags, AMI ID) hoặc secrets không cần auto-rotation để **tối ưu chi phí** |

---

## 4. AWS Certificate Manager (ACM) & SSL/TLS

- **ACM Public Certificates**: **Miễn phí 100%** và **tự động gia hạn (Auto-renewal)** khi gắn vào **CloudFront, ALB, NLB, API Gateway**.
- **Giới hạn quan trọng**: Bạn **KHÔNG THỂ tải Private Key** của chứng chỉ ACM Public về để cài trực tiếp lên EC2 Apache/Nginx! Nếu đề bài yêu cầu SSL trên EC2 trực tiếp:
  1. Đặt **ALB hoặc CloudFront** phía trước EC2 và gắn ACM certificate lên ALB/CloudFront (ưu tiên #1).
  2. Hoặc dùng **ACM Private CA** (tốn phí $400/tháng cho CA) để cấp chứng chỉ nội bộ nếu bắt buộc cài trên EC2/IoT.
- **ACM Regionality**: Chứng chỉ dùng cho **CloudFront** bắt buộc phải tạo ở Region **`us-east-1` (N. Virginia)**! Chứng chỉ dùng cho **ALB** phải tạo ở **cùng Region với ALB**.

---

## 5. Bẫy đề thi SAA-C03 (Exam Traps)
1. **S3 Bucket Keys**: Nếu đề bài nói *"Ứng dụng đọc/ghi hàng triệu S3 objects mỗi giờ sử dụng SSE-KMS và gặp lỗi `KMS.ThrottlingException` hoặc chi phí KMS API tăng cao"* → Bật **S3 Bucket Keys** (giảm tới 99% request tới KMS).
2. **EBS Encryption on Existing Volume**: Không thể bật mã hóa trực tiếp trên một EBS volume đang chạy chưa mã hóa. Quy trình chuẩn: **Tạo Snapshot → Copy Snapshot và tích chọn Encrypt → Tạo Volume mới từ Encrypted Snapshot**.
3. **Secrets Manager vs Parameter Store**: Thấy từ khóa **"automatically rotate database credentials every 30 days"** → Chắc chắn là **AWS Secrets Manager**. Thấy **"store configuration parameters with zero additional cost"** → **SSM Parameter Store (Standard)**.

---

[← Bài trước](02-iam-org-security.md) | [Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/03-encryption-secrets.md) | [Bài tiếp →](04-monitoring-governance-cloudtrail-config.md)
