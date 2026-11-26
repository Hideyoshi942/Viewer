# KMS Chuyên sâu, ACM Private CA, S3 Object Lock & Secrets Manager

Domain 5 (**Data Protection — 18%**) là một trong những phần khó và giàu chi tiết kỹ thuật nhất của **AWS Certified Security - Specialty (SCS-C02)**. Bài học này đi sâu vào cơ chế cấp quyền đặc thù của **AWS KMS** (Key Policy, Grants, Locked-out Key), **Envelope Encryption & Data Key Caching**, **Imported Key Material**, **Custom Key Stores (CloudHSM vs XKS)**, **Asymmetric Keys**, **ACM Private CA cross-account**, **S3 Object Lock / Glacier Vault Lock**, và **Secrets Manager Rotation**.

---

## 1. KMS Key Policy, Default Policy & Khôi phục Locked-Out Key

Khác với hầu hết dịch vụ AWS khác (như EC2 hay S3), **AWS KMS KHÔNG mặc định tin tưởng IAM Policies**.

### Quy tắc vàng của KMS Key Policy
1. **IAM Policy chỉ có tác dụng khi Key Policy cho phép**: Statement mặc định sau trong Key Policy là thứ cho phép tài khoản chủ quản ủy quyền qua IAM:
   ```json
   {
     "Sid": "Enable IAM User Permissions",
     "Effect": "Allow",
     "Principal": { "AWS": "arn:aws:iam::111122223333:root" },
     "Action": "kms:*",
     "Resource": "*"
   }
   ```
2. **Nếu xóa statement trên**: Mọi IAM User/Role trong tài khoản (kể cả `AdministratorAccess`) đều **MẤT QUYỀN** trừ những principal được liệt kê trực tiếp trong Key Policy.
3. **Locked-out Key (Key bị khóa quản trị)**: Nếu bạn vô tình xóa quyền quản trị (`kms:PutKeyPolicy`) của tất cả mọi người (hoặc xóa IAM Role duy nhất được ghi trong Key Policy), **ngay cả Admin cũng không sửa được Key Policy**.
   - **Cách khôi phục duy nhất**: Đăng nhập bằng **AWS Account Root User** (nếu statement `root` chưa bị gỡ hoặc không bị Explicit Deny). Nếu ngay cả `root` cũng bị gỡ khỏi Key Policy và không còn principal nào có quyền `kms:PutKeyPolicy`, bạn **phải liên hệ AWS Support** để khôi phục quyền truy cập cho Root User!

> **Exam Tip**: Khi cấp quyền **Cross-Account** cho KMS Key, bạn BẮT BUỘC phải cấu hình ở **CẢ HAI PHÍA**:
> 1. **Key Policy** tại Account A (tài khoản sở hữu key): `Allow` cho Account B (`arn:aws:iam::222233334444:root` hoặc Role cụ thể).
> 2. **IAM Policy** tại Account B: `Allow` cho IAM Role/User thực hiện `kms:Decrypt`, `kms:GenerateDataKey` trên ARN của key đó.
> *(Ngoại lệ duy nhất: dùng KMS Grants thay cho IAM Policy trong một số luồng tạm thời, xem mục 2).*

---

## 2. KMS Grants vs KMS Key Policy

**KMS Grants** là cơ chế ủy quyền **động, lập trình được (programmatic)** và **tạm thời**, tách biệt khỏi Key Policy (giới hạn 32 KB).

| Tiêu chí | KMS Key Policy | KMS Grants |
| :--- | :--- | :--- |
| **Bản chất** | Tĩnh, gắn trực tiếp vào KMS key (tối đa 32 KB) | Động, tạo qua API `kms:CreateGrant` (tối đa 50.000 grants/key) |
| **Loại quyền** | Hỗ trợ cả `Allow` và `Deny` | **CHỈ hỗ trợ `Allow`** (không có `Deny`) |
| **Thu hồi quyền** | Sửa lại toàn bộ Key Policy (`PutKeyPolicy`) | Gọi `RetireGrant` (bởi retiring principal/grantee) hoặc `RevokeGrant` (bởi key admin) |
| **Ứng dụng điển hình** | Quản trị dài hạn, cấp quyền cho IAM roles cố định | AWS Services (EBS, RDS, Auto Scaling) tạo grant tạm thời để giải mã volume khi khởi tạo instance; ứng dụng cấp quyền tạm cho worker |
| **Encryption Context Constraint** | Dùng Condition `kms:EncryptionContext:*` | Dùng `GrantConstraints` (`EncryptionContextSubset` hoặc `EncryptionContextEquals`) |

> **Exam Tip**: Auto Scaling Group khởi tạo EC2 từ EBS Encrypted Snapshot bằng CMK bị lỗi? Nguyên nhân 99% là **AWSServiceRoleForAutoScaling** chưa có quyền **`kms:CreateGrant`** (kèm điều kiện `kms:GrantIsForAWSResource: true`) trên Key Policy của CMK đó!

---

## 3. Envelope Encryption & Data Key Caching

AWS KMS chỉ cho phép mã hóa trực tiếp tối đa **4 KB** dữ liệu qua API `kms:Encrypt`. Với file lớn hơn, bắt buộc dùng **Envelope Encryption**:
1. Ứng dụng gọi `kms:GenerateDataKey` → KMS trả về 2 bản của **Data Key**:
   - **Plaintext Data Key**: Dùng mã hóa dữ liệu cục bộ (AES-256-GCM) trong RAM, sau đó **xóa ngay khỏi bộ nhớ**.
   - **Encrypted Data Key (Ciphertext Blob)**: Lưu kèm cùng dữ liệu đã mã hóa (ví dụ trong header hoặc S3 metadata).
2. Khi giải mã, ứng dụng gửi Encrypted Data Key lên `kms:Decrypt` để lấy lại Plaintext Data Key và giải mã dữ liệu cục bộ.

### Tối ưu hiệu năng & tránh Throttling: Data Key Caching (AWS Encryption SDK)
- Nếu hệ thống mã hóa hàng triệu bản ghi/giây, gọi `GenerateDataKey` cho từng bản ghi sẽ gây **KMS API Throttling** và tốn chi phí cao.
- **Giải pháp**: Sử dụng **AWS Encryption SDK với Data Key Caching (`CachingCryptoMaterialsManager`)** để tái sử dụng một Data Key cho nhiều bản ghi, giới hạn theo 3 tham số bảo mật:
  - `MaxAge` (thời gian sống tối đa của data key trong cache)
  - `MaxMessagesEncrypted` (số lượng message tối đa)
  - `MaxBytesEncrypted` (tổng dung lượng byte tối đa)
- Đối với **Amazon S3**: Bật **S3 Bucket Keys** để giảm tới **99% chi phí và số lần gọi KMS API** bằng cách tạo một bucket-level key tạm thời trong S3 thay vì gọi KMS cho từng object.

---

## 4. Imported Key Material (BYOK) & Custom Key Stores (CloudHSM vs XKS)

### 4.1. Imported Key Material (`ORIGIN = EXTERNAL`)
Khi doanh nghiệp muốn tự tạo key trên HSM on-premises và import vào AWS KMS:
- Quy trình: Tạo KMS Key không có key material → Gọi `GetParametersForImport` (tải Public Wrapping Key + Import Token có hạn 24h) → Mã hóa (wrap) key material cục bộ → Gọi `ImportKeyMaterial`.
- **Các giới hạn BẮT BUỘC nhớ cho kỳ thi**:
  - **KHÔNG hỗ trợ Automatic Key Rotation** của KMS (phải xoay vòng thủ công bằng cách tạo key mới và chuyển Alias).
  - **Không có độ bền 99.999999999% như AWS-generated key**: Nếu vùng gặp sự cố nghiêm trọng hoặc key hết hạn (`ValidTo`), bạn phải giữ bản sao an toàn on-premises và **re-import đúng key material đó** vào lại cùng KMS Key ID (không thể import key material khác vào key cũ!).
  - Có thể **xóa ngay lập tức** key material bằng `DeleteImportedKeyMaterial` (khác với KMS key thường phải chờ 7–30 ngày).

### 4.2. So sánh KMS Standard vs CloudHSM Custom Key Store vs External Key Store (XKS)

| Tiêu chí | AWS KMS (Default) | Custom Key Store — AWS CloudHSM | External Key Store (XKS) |
| :--- | :--- | :--- | :--- |
| **Nơi lưu trữ Key Material** | Multi-tenant HSM do AWS quản lý (FIPS 140-3 Level 3) | **Single-tenant HSM** (CloudHSM cluster trong VPC của bạn, FIPS 140-2/3 Level 3) | **HSM bên ngoài AWS** (on-premises hoặc colocation của bạn) kết nối qua XKS Proxy |
| **Quyền kiểm soát vật lý / Compliance** | AWS quản lý toàn bộ | Bạn quản lý HSM user/quorum, AWS không truy cập được key | Key **không bao giờ rời khỏi** hạ tầng ngoài AWS của bạn |
| **Automatic Key Rotation** | Có (hàng năm hoặc tùy chỉnh 90–2560 ngày) | **KHÔNG** | **KHÔNG** |
| **Multi-Region Keys** | Có | Không | Không |
| **Hiệu năng & Độ trễ** | Thấp nhất, SLA 99.999% | Phụ thuộc CloudHSM cluster (tối thiểu 2 HSMs cho HA) | Cao hơn do đi qua mạng (Direct Connect/VPN) tới XKS Proxy |

---

## 5. Asymmetric KMS Keys (RSA / ECC)

Khác với Symmetric KMS key (AES-256) chỉ dùng cho mã hóa/giải mã nội bộ, **Asymmetric KMS Keys** gồm cặp Public Key (có thể tải xuống phân phát tự do) và Private Key (**không bao giờ rời khỏi KMS**):
- **RSA (`RSA_2048`, `RSA_3072`, `RSA_4096`)**: Dùng cho cả **Encrypt/Decrypt** (client ngoài AWS mã hóa bằng Public Key, gửi về AWS giải mã bằng Private Key qua `kms:Decrypt`) hoặc **Sign/Verify**.
- **ECC (`ECC_NIST_P256`, `P384`, `P521`, `ECC_SECG_P256K1`)**: Dùng cho **Sign/Verify** (chữ ký số) và **Key Agreement** (`DeriveSharedSecret`). **KHÔNG dùng ECC để mã hóa trực tiếp dữ liệu trong KMS**.
- **Lưu ý thi**: Asymmetric keys **KHÔNG hỗ trợ Automatic Key Rotation** và **KHÔNG dùng được với hầu hết dịch vụ AWS tích hợp SSE-KMS** (như S3, EBS, RDS — các dịch vụ này yêu cầu Symmetric key).

---

## 6. ACM Private CA & Chia sẻ Cross-Account qua AWS RAM

- **AWS Certificate Manager (ACM)** cấp phát public TLS/SSL cert miễn phí (chỉ gắn lên ALB, CloudFront, API Gateway — không export được private key).
- **AWS Private CA (ACM PCA)** dùng để xây dựng hạ tầng PKI nội bộ (Private Root CA / Subordinate CA) cấp chứng chỉ cho EC2, container, IoT, hoặc **IAM Roles Anywhere**.
- **Mô hình Multi-Account tiết kiệm chi phí**: Mỗi Private CA có chi phí cố định hàng tháng khá cao (~$400/tháng ở General-purpose mode). Thay vì tạo Private CA ở từng tài khoản, hãy tạo tập trung tại **Security/Shared Services Account** và chia sẻ cho toàn bộ AWS Organization (hoặc từng OU/Account) bằng **AWS Resource Access Manager (RAM)**.
  - Tài khoản thành viên có thể tự yêu cầu chứng chỉ từ ACM và tự động gia hạn (Auto-renewal) mà không cần quản lý CA.
  - Hỗ trợ kiểm tra thu hồi chứng chỉ qua **CRL (Certificate Revocation List)** lưu trên S3 hoặc **OCSP (Online Certificate Status Protocol)**.

---

## 7. WORM Compliance: S3 Object Lock vs S3 Glacier Vault Lock

Cả hai đều cung cấp mô hình **WORM (Write-Once-Read-Many)** đáp ứng quy định tài chính (SEC Rule 17a-4, FINRA, HIPAA).

| Tính năng | S3 Object Lock — Governance Mode | S3 Object Lock — Compliance Mode | S3 Glacier Vault Lock |
| :--- | :--- | :--- | :--- |
| **Ai có thể xóa/sửa trước hạn?** | Principal có quyền IAM đặc biệt **`s3:BypassGovernanceRetention`** (và truyền header bypass) | **KHÔNG MỘT AI**, kể cả **AWS Account Root User** | **KHÔNG MỘT AI** sau khi Lock Policy hoàn tất (Complete) |
| **Điều kiện tiên quyết** | Bắt buộc bật **S3 Versioning** (có thể bật Object Lock ngay cả trên bucket đã tồn tại có Versioning) | Bắt buộc bật **S3 Versioning** | Khởi tạo Lock Policy (`InitiateVaultLock`) → Có **24 giờ** để kiểm thử và gọi `CompleteVaultLock` (nếu không sẽ tự hết hạn) |
| **Legal Hold** | Hỗ trợ độc lập (ON/OFF không có ngày hết hạn; cần quyền `s3:PutObjectLegalHold`) | Hỗ trợ độc lập | Dùng điều kiện trong Vault Lock Policy |
| **Trường hợp sử dụng** | Kiểm thử chính sách lưu giữ, bảo vệ khỏi xóa nhầm bởi admin thường | **Yêu cầu pháp lý bắt buộc tuyệt đối** không được xóa dưới mọi hình thức | Lưu trữ lạnh (Cold Archive) dài hạn cấp độ Vault |

---

## 8. AWS Secrets Manager: Multi-Region Replication & Dual-User Rotation

### 8.1. Multi-Region Secrets Replication
- Sao chép tự động secret từ Primary Region sang một hoặc nhiều Replica Regions (mỗi replica được mã hóa bằng **KMS key riêng của Region đó**).
- Ứng dụng ở Replica Region đọc secret cục bộ với độ trễ thấp và sẵn sàng cho Disaster Recovery (DR). Khi cần chuyển đổi, có thể **Promote Replica** thành Standalone Secret độc lập.

### 8.2. Chiến lược Rotation không gián đoạn (Zero-Downtime): Single-User vs Alternating (Dual-User)

| Chiến lược | Cơ chế hoạt động | Rủi ro & Khi nào dùng |
| :--- | :--- | :--- |
| **Single-User** | Lambda đổi trực tiếp mật khẩu của 1 DB user duy nhất trong lúc rotation | Có thể gây lỗi kết nối tạm thời (connection drop) cho ứng dụng đang dùng mật khẩu cũ. Chỉ dùng cho hệ thống đơn giản/dev |
| **Alternating Users (Dual-User)** | Dùng 2 tài khoản song song (`user_a` và `user_b`, gắn nhãn `AWSCURRENT` và `AWSPREVIOUS`). Lambda đổi mật khẩu cho user đang ở trạng thái `AWSPREVIOUS` → test kết nối → chuyển nhãn `AWSCURRENT` sang user mới | **Zero-downtime** cho Production! Các kết nối cũ vẫn chạy bình thường bằng `AWSPREVIOUS` trong lúc ứng dụng dần chuyển sang `AWSCURRENT` |

> **Exam Tip**: Các bước chuẩn của Secrets Manager Rotation Lambda là: `createSecret` → `setSecret` → `testSecret` → `finishSecret`. Nếu đề bài hỏi cách xoay vòng mật khẩu RDS/Aurora Production mà **tuyệt đối không làm rớt các phiên kết nối hiện tại (zero downtime)**, đáp án luôn là **Alternating Users (Dual-User) rotation strategy** kết hợp với **Master Secret** để tạo/đổi mật khẩu cho cloned user.

---

[← Bài trước](11-kms-encryption-data-protection.md) | [Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/12-data-s3-acm-secrets-macie.md) | [Bài tiếp →](13-multi-account-security-governance.md)
