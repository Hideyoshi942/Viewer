# Domain 5: Bảo vệ Dữ liệu & Mã hóa Chuyên sâu (18%)

Domain 5 chiếm 18% điểm số và chứa nhiều câu hỏi mang tính "bẫy kỹ thuật" nhất trong kỳ thi **SCS-C02**, đặc biệt xoay quanh **AWS KMS**, **CloudHSM**, **Amazon S3 Encryption**, **Secrets Manager** và **ACM Private CA**.

## 1. AWS KMS: Kiến trúc & Cơ chế Mã hóa Phong bì (Envelope Encryption)

KMS sử dụng **FIPS 140-3 Level 3** HSM được AWS quản lý. KMS Key **không bao giờ rời khỏi** vùng lưu trữ bảo mật của KMS ở dạng plaintext.

### Envelope Encryption (Mã hóa dữ liệu > 4 KB)
- API `kms:Encrypt` trực tiếp chỉ mã hóa được tối đa **4 KB**.
- Với dữ liệu lớn (file S3, EBS volume, RDS):
  1. Ứng dụng gọi `kms:GenerateDataKey` → KMS trả về 2 bản của **Data Key**: `Plaintext Data Key` và `Encrypted Data Key`.
  2. Ứng dụng dùng `Plaintext Data Key` mã hóa dữ liệu cục bộ (AES-256), sau đó **xóa ngay Plaintext Data Key khỏi RAM**.
  3. Lưu trữ `Ciphertext Data` kèm theo `Encrypted Data Key`.
  4. Khi giải mã: Gửi `Encrypted Data Key` cho `kms:Decrypt` để lấy lại `Plaintext Data Key` và giải mã dữ liệu.

### Các loại KMS Key & Chính sách Xoay vòng (Key Rotation)

| Loại KMS Key | Quản lý Key Policy | Tự động xoay vòng (Automatic Rotation) | Sử dụng Cross-Account |
| :--- | :--- | :--- | :--- |
| **AWS Owned Key** | AWS quản lý hoàn toàn (miễn phí, không thấy trong console) | AWS quản lý | Không |
| **AWS Managed Key** (`aws/s3`, `aws/ebs`...) | Chỉ đọc (Read-only), không sửa được | Tự động **1 năm/lần** (không tắt được) | **KHÔNG** (Bẫy thi kinh điển!) |
| **Customer Managed Key (CMK)** | Toàn quyền sửa Key Policy, Grants, Deletion | Tùy chọn bật: mặc định 365 ngày (tùy chỉnh từ **90 đến 2560 ngày**), hoặc On-demand rotation | **CÓ** |
| **CMK với Imported Key Material (BYOK)** | Toàn quyền sửa Key Policy | **KHÔNG hỗ trợ** Automatic Rotation (phải xoay thủ công bằng Alias) | **CÓ** |
| **CMK trong Custom Key Store (CloudHSM)** | Key nằm trên cụm CloudHSM riêng của khách hàng | **KHÔNG hỗ trợ** Automatic Rotation | **CÓ** |

> **Exam Tip**:
> 1. **Xóa KMS Key**: Không thể xóa ngay lập tức; bắt buộc đặt lịch chờ từ **7 đến 30 ngày** (mặc định 30 ngày). Trong thời gian `PendingDeletion`, key bị vô hiệu hóa nhưng có thể hủy xóa (`CancelKeyDeletion`). Tuy nhiên, với **Imported Key Material**, bạn có thể xóa ngay lập tức (`DeleteImportedKeyMaterial`) để vô hiệu hóa tức thì (crypto-shredding), và có thể import lại đúng vật liệu khóa cũ sau này!
> 2. **KMS Multi-Region Keys**: Có cùng Key ID (`mrk-...`) và cùng Key Material ở nhiều Region. Dùng để mã hóa dữ liệu ở Region A và giải mã cục bộ ở Region B (không cần gọi KMS xuyên Region) — cực kỳ hữu ích cho **DynamoDB Global Tables**, **Aurora Global Database**, và **S3 Cross-Region Replication (CRR)** với độ trễ thấp.

### KMS Key Policies vs. KMS Grants
- **Key Policy**: Resource policy gắn trực tiếp vào KMS Key (tối đa 32 KB). Để chia sẻ KMS Key sang tài khoản khác, bạn phải cấp quyền trong **Key Policy** của tài khoản sở hữu Key **VÀ** cấp quyền trong **IAM Policy** của principal ở tài khoản kia.
- **KMS Grants**: Cơ chế ủy quyền **tạm thời và theo lập trình** (programmatic delegation) mà không cần sửa Key Policy (ví dụ: dịch vụ EBS/Auto Scaling tự động dùng Grant để gắn encrypted volume cho EC2). Hỗ trợ điều kiện `EncryptionContext` và `RetiringPrincipal`.

## 2. AWS CloudHSM vs. AWS KMS

- Chọn **AWS CloudHSM** (Single-tenant, FIPS 140-2/3 Level 3) khi đề bài yêu cầu:
  - **Single-tenant HSM** độc quyền, khách hàng kiểm soát hoàn toàn vòng đời khóa (AWS không có quyền truy cập vào HSM).
  - Yêu cầu giao thức mật mã chuẩn công nghiệp: **PKCS#11**, **JCE (Java Cryptography Extension)**, **CNG (Microsoft)**, **OpenSSL**.
  - Lưu ý HA: CloudHSM là dịch vụ Regional; bắt buộc triển khai **tối thiểu 2 HSM instances ở 2 Availability Zones** khác nhau để đảm bảo High Availability (AWS không tự động backup/failover nếu chỉ có 1 HSM).

## 3. Mã hóa Amazon S3 & Bảo vệ Dữ liệu

| Chế độ mã hóa S3 | Ai quản lý khóa? | Lưu ý quan trọng trong đề thi |
| :--- | :--- | :--- |
| **SSE-S3** (`AES256`) | AWS quản lý hoàn toàn (mặc định cho mọi object mới) | Không kiểm soát được quyền truy cập khóa riêng biệt và không có CloudTrail audit cho việc sử dụng khóa |
| **SSE-KMS** (`aws:kms`) | AWS KMS (AWS Managed hoặc CMK) | Có **CloudTrail audit** từng lần giải mã, tách biệt quyền đọc S3 và quyền giải mã KMS. Bật **S3 Bucket Keys** để giảm tới 99% chi phí & tránh lỗi throttling API KMS! |
| **DSSE-KMS** (`aws:kms:dsse`) | AWS KMS (2 lớp mã hóa độc lập) | Dùng cho yêu cầu tuân thủ đặc biệt (như CNSA / dữ liệu chính phủ mật) cần Dual-layer server-side encryption |
| **SSE-C** | Khách hàng gửi khóa trong mỗi HTTP header (bắt buộc HTTPS) | AWS không lưu khóa; mất khóa = mất dữ liệu vĩnh viễn |

- **S3 Object Lock (WORM - Write Once Read Many)**:
  - **Governance Mode**: Người dùng có quyền đặc biệt `s3:BypassGovernanceRetention` mới được ghi đè/xóa trước hạn.
  - **Compliance Mode**: **Không ai** — kể cả **AWS Account Root User** — có thể xóa hoặc rút ngắn thời gian lưu giữ trước khi hết hạn.
- **Amazon Macie**: Dùng ML để tự động quét các S3 Bucket nhằm phát hiện dữ liệu nhạy cảm (**PII**, thẻ tín dụng, thông tin tài chính, credentials) và cảnh báo bucket bị cấu hình công khai/không mã hóa.

## 4. TLS/SSL (ACM & Private CA) & Quản lý Bí mật

- **AWS Certificate Manager (ACM)**: Cấp phát & tự động gia hạn chứng chỉ TLS công cộng miễn phí cho ALB, CloudFront, API Gateway. **Không thể export Private Key** của chứng chỉ công cộng (nếu cần cài TLS trực tiếp lên EC2, dùng **ACM Private CA** hoặc giải pháp khác).
- **AWS Secrets Manager vs. SSM Parameter Store**:
  - **Secrets Manager**: Tự động **xoay vòng mật khẩu (Automatic Rotation)** tích hợp sẵn với RDS, Redshift, DocumentDB (hoặc tùy biến bằng Lambda), hỗ trợ **Multi-Region Secret Replication**, chia sẻ Cross-Account bằng Resource Policy.
  - **SSM Parameter Store (SecureString)**: Chi phí thấp (Standard tier miễn phí), mã hóa bằng KMS, nhưng **không có tính năng auto-rotation tích hợp sẵn** (phải tự xây dựng bằng EventBridge + Lambda).

> **Exam Tip**: Khi đề thi nói *"S3 bucket có hàng triệu request/giây dùng SSE-KMS và gặp lỗi `ThrottlingException` (HTTP 503) kèm chi phí KMS tăng vọt"*, đáp án luôn là **bật S3 Bucket Keys** (giảm số lần gọi API từ S3 tới KMS).

---

[← Bài trước](10-advanced-iam-abac-sts-confused-deputy.md) | [Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/11-data-kms-cloudhsm-cryptography.md) | [Bài tiếp →](12-kms-cryptography-acm-pca-secrets.md)
