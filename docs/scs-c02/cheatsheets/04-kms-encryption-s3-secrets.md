# Cheatsheet: AWS KMS, CloudHSM, S3 Encryption & Secrets

## 1. Ma trận So sánh Dịch vụ Quản lý Khóa (KMS vs. CloudHSM)

| Tiêu chí | AWS KMS (Default) | KMS + Imported Key Material (BYOK) | KMS Custom Key Store (CloudHSM) | AWS CloudHSM (Trực tiếp) |
| :--- | :--- | :--- | :--- | :--- |
| **Mô hình phần cứng** | Multi-tenant HSM (FIPS 140-3 Lv 3) | Multi-tenant HSM | Single-tenant HSM do khách quản lý | Single-tenant HSM do khách quản lý |
| **Ai tạo Key Material?** | AWS KMS | Khách hàng (bên ngoài AWS) | Khách hàng trên CloudHSM | Khách hàng trên CloudHSM |
| **Automatic Key Rotation** | **Có** (90–2560 ngày, mặc định 365) | **KHÔNG** (phải xoay thủ công) | **KHÔNG** | Khách hàng tự quản lý |
| **Xóa khóa tức thì** | Không (chờ 7–30 ngày) | **CÓ** (`DeleteImportedKeyMaterial`) | Xóa trên CloudHSM | **CÓ** |
| **Giao thức mật mã** | AWS KMS API | AWS KMS API | AWS KMS API | **PKCS#11, JCE, CNG, OpenSSL** |
| **Tích hợp sẵn dịch vụ AWS** | Tự nhiên (S3, EBS, RDS...) | Tự nhiên | Tự nhiên | Thủ công (ứng dụng tự kết nối) |

## 2. Quyền tối thiểu cho KMS & EBS / S3 / RDS

- **Tải file lên S3 dùng SSE-KMS (`PutObject`)**: Cần `kms:GenerateDataKey` (và `kms:Decrypt` nếu dùng Multipart Upload!).
- **Đọc file từ S3 dùng SSE-KMS (`GetObject`)**: Cần `kms:Decrypt`.
- **Khởi chạy EC2 có EBS mã hóa bằng CMK**: Cần `kms:CreateGrant`, `kms:Decrypt`, `kms:GenerateDataKeyWithoutPlaintext`, `kms:ReEncrypt*`, `kms:DescribeKey`.
- **Chia sẻ AMI / EBS Snapshot / RDS Snapshot mã hóa sang Account B**:
  - **KHÔNG THỂ** chia sẻ nếu mã hóa bằng **AWS Managed Key (`aws/ebs`, `aws/rds`)**.
  - Phải mã hóa bằng **Customer Managed Key (CMK)**, chia sẻ Snapshot cho Account B **VÀ** thêm Account B vào **KMS Key Policy** của CMK đó (sau đó Account B nên copy snapshot và mã hóa lại bằng CMK của riêng mình).

## 3. S3 Encryption & Security Headers bắt buộc trong Bucket Policy

| Yêu cầu trong đề thi | Condition Key trong S3 Bucket Policy (`Effect: Deny`) |
| :--- | :--- |
| Bắt buộc truyền tải qua **HTTPS (TLS)** | `"Bool": {"aws:SecureTransport": "false"}` |
| Bắt buộc mọi object upload phải dùng **SSE-KMS** | `"StringNotEquals": {"s3:x-amz-server-side-encryption": "aws:kms"}` |
| Bắt buộc dùng **đúng một KMS CMK cụ thể** | `"StringNotEquals": {"s3:x-amz-server-side-encryption-aws-kms-key-id": "arn:aws:kms:..."}` |
| Giảm chi phí & chống Throttling cho SSE-KMS | Bật **S3 Bucket Keys** (giảm tới 99% số lần gọi KMS API) |
| Chống xóa dữ liệu kể cả bởi Root User (WORM) | Bật **S3 Object Lock — Compliance Mode** (yêu cầu bật Versioning) |

## 4. Chọn nhanh Dịch vụ Quản lý Bí mật & Chứng chỉ

- **Tự động xoay vòng mật khẩu DB (RDS, Redshift, DocumentDB) + Multi-Region Replication**: **AWS Secrets Manager**.
- **Lưu cấu hình & secret miễn phí (Standard tier), không cần auto-rotation tích hợp sẵn**: **SSM Parameter Store (`SecureString`)**.
- **Chứng chỉ TLS công cộng miễn phí cho ALB / CloudFront / API Gateway (auto-renew)**: **AWS Certificate Manager (ACM)**.
- **Hệ thống PKI nội bộ cấp chứng chỉ private cho IoT, EC2, VPN, mTLS**: **AWS Private CA (ACM PCA)** — có thể chia sẻ đa tài khoản qua **AWS RAM**.
- **Quét S3 tìm dữ liệu PII / thẻ tín dụng / thông tin nhạy cảm**: **Amazon Macie**.

> **Exam Tip**: Nếu một tài khoản bị khóa hoàn toàn quyền quản trị một KMS Key (do sửa nhầm Key Policy xóa hết principal), **chỉ duy nhất AWS Account Root User** của tài khoản sở hữu key mới có thể liên hệ AWS Support hoặc khôi phục (nếu policy vẫn cho phép root); nếu Key Policy không chứa statement cho `:root`, ngay cả IAM Administrator cũng không sửa được Key Policy!

---

[Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md)
