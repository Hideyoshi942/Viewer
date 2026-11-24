# Chương 30 – AWS Security & Encryption: KMS, Encryption SDK, SSM Parameter Store, IAM & STS

> **Nguồn:** Thư mục chương không có transcript/video kèm theo, nên nội dung được biên soạn từ **đề cương (syllabus) của chương** trong khoá *AWS Certified Developer Associate (DVA-C02)* của Stephane Maarek và tài liệu chuẩn của AWS. Số thứ tự video trong bảng là **ước lượng theo thứ tự bài giảng**, không phải tên file gốc.
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung để bám sát thực tế hiện nay (2026, kỳ thi hiện là **DVA-C02**). Các chủ đề **IAM & STS** (`AssumeRole`, `GetSessionToken` + MFA, đánh giá policy, `iam:PassRole`) đã được trình bày chi tiết ở **Chương 29 – Advanced Identity**; chương này chỉ nhắc lại phần giao với KMS. Phần SSE-KMS trên S3 được trình bày ở **Chương 14 – Amazon S3 Security**, ở đây bổ sung góc nhìn từ phía KMS.

## Mục tiêu chương

Sau chương này bạn có thể:

- Phân biệt 3 kiểu mã hoá: **in-flight (TLS)**, **server-side at rest**, **client-side**.
- Giải thích các loại key trong **AWS KMS** (AWS owned / AWS managed / customer managed), **symmetric vs asymmetric**, **rotation**, **key policy**, và cách **copy snapshot mã hoá sang tài khoản khác**.
- Dùng CLI `aws kms encrypt` / `decrypt` (với `fileb://` và base64).
- Giải thích **envelope encryption**, giới hạn **4 KB** của `Encrypt`, và các API `GenerateDataKey` / `GenerateDataKeyWithoutPlaintext`.
- Dùng **AWS Encryption SDK** / **Encryption CLI** và **data key caching**.
- Xử lý **KMS request quota** (`ThrottlingException`, exponential backoff, tăng quota, cache DEK) và tối ưu SSE-KMS bằng **S3 Bucket Key**.
- Viết **key policy** kết hợp IAM, dùng condition `kms:ViaService`, `kms:CallerAccount`.
- Phân biệt **KMS vs CloudHSM**.
- Dùng **SSM Parameter Store** (Standard/Advanced, hierarchy, SecureString, parameter policies) và **Secrets Manager** (rotation, RDS integration, multi-region, CloudFormation dynamic reference); biết khi nào chọn cái nào.
- Mã hoá **CloudWatch Logs** bằng KMS, bảo mật **CodeBuild**, và biết **AWS Nitro Enclaves** dùng để làm gì.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001–002 | Section Introduction, Encryption 101 | Bài 1 – Encryption 101: in-flight, server-side, client-side |
| 003 | KMS Overview | Bài 2 – AWS KMS tổng quan |
| 004 | KMS Hands On | Bài 3 – KMS encrypt/decrypt bằng CLI |
| 005 | KMS Encryption Patterns & Envelope Encryption | Bài 4 – Envelope Encryption và `GenerateDataKey` |
| 006 | Encryption SDK CLI Hands On | Bài 5 – AWS Encryption SDK và Data Key Caching |
| 007 | KMS Limits | Bài 6 – KMS Request Quotas và Throttling |
| 008 | KMS and S3 Bucket Key | Bài 7 – KMS & S3: SSE-KMS và S3 Bucket Key |
| 009 | KMS Key Policies and IAM Principals | Bài 8 – Key Policy, IAM principal, `kms:ViaService`, `kms:CallerAccount` |
| 010 | CloudHSM Overview | Bài 9 – AWS CloudHSM |
| 011–013 | SSM Parameter Store Overview + Hands On (CLI) + Hands On (Lambda) | Bài 10 – SSM Parameter Store |
| 014–015 | Secrets Manager Overview + Hands On | Bài 11 – AWS Secrets Manager |
| 016 | SSM Parameter Store vs Secrets Manager | Bài 12 – So sánh Parameter Store và Secrets Manager |
| 017 | CloudWatch Logs Encryption | Bài 13 – Mã hoá CloudWatch Logs bằng KMS |
| 018 | CodeBuild Security | Bài 14 – Bảo mật CodeBuild |
| 019 | AWS Nitro Enclaves | Bài 15 – AWS Nitro Enclaves |
| Quiz | Security & Encryption Quiz | Câu hỏi ôn tập |

---

## Bài 1 – Encryption 101: in-flight, server-side, client-side

### Lý thuyết

#### Encryption in flight (TLS/SSL)

- Dữ liệu được **mã hoá trước khi gửi** và **giải mã sau khi nhận**.
- **TLS certificate** giúp mã hoá (HTTPS). Đảm bảo không có **MITM (man-in-the-middle)** đọc trộm dữ liệu trên đường truyền (ví dụ username/password gửi qua Internet công cộng).
- Trên AWS: ALB/CloudFront/API Gateway dùng chứng chỉ **ACM**; S3 ép HTTPS bằng `aws:SecureTransport` (xem Chương 14).

```
Client ──(mã hoá TLS)── Internet ──(giải mã TLS)── Server (ALB / HTTPS website)
 "user=kiet&pass=***"      ≠ đọc được                "user=kiet&pass=***"
```

#### Server-side encryption at rest

- Dữ liệu được **server mã hoá sau khi nhận**, lưu ở dạng mã hoá, và **giải mã trước khi gửi trả**.
- Key (thường là **data key**) được quản lý ở đâu đó, ví dụ **KMS**. Server phải có quyền truy cập key.
- Ví dụ: S3 SSE-S3/SSE-KMS, EBS encryption, RDS encryption, DynamoDB encryption at rest.

```
Object ──HTTP(S)──► Amazon S3 ──(data key)──► Object đã mã hoá lưu trên đĩa
                         ▲
                    KMS / S3-owned key
```

#### Client-side encryption

- Dữ liệu được **client mã hoá** và **chỉ client giải mã**. Server **không bao giờ** giải mã được.
- Có thể tận dụng **envelope encryption** (Bài 4) và **AWS Encryption SDK** (Bài 5).

```
Client: Object + data key ──► ciphertext ──► lưu ở bất kỳ store nào (S3, FTP, EBS...)
Client khác: tải ciphertext + data key ──► giải mã
```

| | In-flight | Server-side at rest | Client-side |
|---|---|---|---|
| Mục đích | Chống nghe lén khi truyền | Bảo vệ dữ liệu trên đĩa | Server không đọc được dữ liệu |
| Ai mã hoá | Hai đầu kết nối (TLS) | Dịch vụ AWS | Ứng dụng của bạn |
| Ví dụ | HTTPS, ACM | SSE-S3, SSE-KMS, EBS, RDS | Encryption SDK, S3 client-side encryption |

### Kiến thức thực tế

- Ngày nay hầu hết dịch vụ AWS **mã hoá at rest mặc định** (S3 SSE-S3 từ 1/2023, DynamoDB luôn mã hoá, Lambda env vars mã hoá bằng key AWS managed).
- TLS 1.2 là tối thiểu cho mọi AWS API endpoint (từ 2024); nên bật TLS 1.3 nếu có thể.
- "Mã hoá" không thay thế **IAM**: dữ liệu mã hoá at rest vẫn đọc được bởi ai có quyền dịch vụ + quyền key.

### Ghi nhớ cho kỳ thi

- Chống MITM → **in-flight (TLS/HTTPS)**.
- Server không được thấy dữ liệu → **client-side encryption**.
- Dịch vụ AWS tự mã hoá/giải mã với key từ KMS → **server-side encryption**.

---

## Bài 2 – AWS KMS tổng quan

### Lý thuyết

- **AWS KMS (Key Management Service)**: khi nói "mã hoá" trên AWS, gần như luôn là KMS.
- AWS **quản lý key** cho bạn; tích hợp hoàn toàn với **IAM** để phân quyền.
- **Audit** mọi lần dùng key bằng **CloudTrail**.
- Tích hợp liền mạch với hầu hết dịch vụ: EBS, S3, RDS, SSM, Secrets Manager, CloudWatch Logs, Lambda, DynamoDB…
- **Không bao giờ lưu secret ở dạng plaintext**, nhất là trong code. Có thể gọi KMS bằng API (SDK, CLI); secret đã mã hoá lưu trong code/biến môi trường.

#### Loại key: Symmetric vs Asymmetric

| | Symmetric (AES-256-GCM) | Asymmetric (RSA, ECC) |
|---|---|---|
| Số key | 1 key cho cả encrypt và decrypt | Cặp public key (encrypt/verify) + private key (decrypt/sign) |
| Truy cập key | **Không bao giờ** lấy được key unencrypted, phải gọi KMS API | **Tải được public key**; private key không bao giờ rời KMS |
| Dùng với | Mọi dịch vụ AWS tích hợp KMS | Mã hoá **bên ngoài AWS** bởi người dùng **không gọi được KMS API**; ký số (sign/verify) |
| Envelope encryption | Có (`GenerateDataKey`) | Không |

#### 3 loại key theo quyền sở hữu

| | AWS owned key | AWS managed key | Customer managed key (CMK) |
|---|---|---|---|
| Ví dụ | Key của SSE-S3, DynamoDB mặc định | `aws/rds`, `aws/ebs`, `aws/s3`, `aws/lambda` | Key bạn tạo trong KMS |
| Bạn thấy trong account | Không | Có (chỉ xem) | Có |
| Chi phí | Miễn phí | **Miễn phí** (trả tiền API call) | **$1/tháng** mỗi key (+ API call) |
| Key policy | Không | AWS quản lý, **không sửa được** | **Bạn sửa được** |
| Rotation | AWS quyết định | **Tự động mỗi 1 năm** | Tự động (bật/tắt, chu kỳ cấu hình được) hoặc on-demand |
| Cross-account | Không | **Không** | **Có** (qua key policy) |
| Imported key | – | – | Có (BYOK), chỉ symmetric; rotation thủ công qua alias |

- Chi phí API call: khoảng **$0,03 / 10.000 request**.

#### Key là phạm vi theo Region

- KMS key **gắn với một region**. Copy EBS snapshot mã hoá sang region khác:

```
Region A: EBS Volume (KMS Key A) ──snapshot──► Snapshot (Key A)
                                                  │ copy, re-encrypt bằng KMS Key B
Region B: Snapshot (Key B) ──restore──► EBS Volume (KMS Key B)
```

- Không thể dùng cùng một key ở hai region (trừ **multi-region keys**, xem Kiến thức thực tế).

#### KMS Key Policies

- Kiểm soát truy cập KMS key, **giống S3 bucket policy**. Khác biệt: **không có key policy thì không ai truy cập được key**.
- **Default key policy**: được tạo nếu bạn không cung cấp policy riêng; cho **toàn bộ account (root)** truy cập key → từ đó **IAM policy** của user/role quyết định ai dùng được.
- **Custom key policy**: định nghĩa user/role nào truy cập được, ai quản trị được key. Hữu ích cho **cross-account access**.

#### Copy snapshot mã hoá sang tài khoản khác

1. Tạo snapshot, mã hoá bằng **customer managed key** của bạn.
2. **Gắn key policy** cho phép tài khoản đích (cross-account) dùng key.
3. **Chia sẻ** snapshot mã hoá cho tài khoản đích.
4. Ở tài khoản đích: **copy snapshot**, mã hoá lại bằng **CMK của tài khoản đích**.
5. Tạo volume từ snapshot đó.

```json
{
  "Sid": "Allow use of the key with destination account",
  "Effect": "Allow",
  "Principal": { "AWS": "arn:aws:iam::TARGET-ACCOUNT-ID:role/ROLENAME" },
  "Action": ["kms:Decrypt", "kms:CreateGrant"],
  "Resource": "*",
  "Condition": {
    "StringEquals": {
      "kms:ViaService": "ec2.REGION.amazonaws.com",
      "kms:CallerAccount": "TARGET-ACCOUNT-ID"
    }
  }
}
```

> Snapshot mã hoá bằng **AWS managed key** (`aws/ebs`) **không chia sẻ được** cross-account → phải copy lại với CMK trước.

### Kiến thức thực tế

- **Rotation (cập nhật 2024)**: CMK symmetric có thể cấu hình chu kỳ tự động **90 – 2.560 ngày** (mặc định 365), và có **on-demand rotation** (`aws kms rotate-key-on-demand`). Rotation **giữ nguyên key ID/ARN**, chỉ thêm *key material* mới; dữ liệu cũ vẫn giải mã được bằng material cũ.
- **Multi-Region keys** (`mrk-...`): cùng key material, cùng key ID ở nhiều region → mã hoá ở region này, giải mã ở region khác không cần re-encrypt. Dùng cho DynamoDB Global Tables client-side encryption, ứng dụng active-active.
- Xoá key: **không xoá ngay**, phải **schedule deletion 7–30 ngày** (mặc định 30). Trong thời gian chờ có thể huỷ. Nên **disable** trước để kiểm tra ảnh hưởng.
- **Alias** (`alias/my-app`) giúp đổi key mà không đổi code.
- **Grants**: cấp quyền dùng key tạm thời, có thể thu hồi; dịch vụ AWS (EBS, RDS) dùng grants để truy cập key thay bạn (vì vậy cần `kms:CreateGrant`).
- **HMAC keys** (`GenerateMac`/`VerifyMac`) và **External Key Store (XKS)** là các loại khác, ít gặp trong DVA.

### Ghi nhớ cho kỳ thi

- AWS managed key: miễn phí, **rotation tự động 1 năm**, **không share cross-account**.
- Customer managed key: $1/tháng, sửa key policy, rotation bật/tắt, share cross-account được.
- Người dùng **ngoài AWS, không gọi được KMS** cần mã hoá → **asymmetric key** (tải public key).
- KMS key **theo region**; copy snapshot sang region khác → **re-encrypt** bằng key region đích.
- Không có key policy → **không ai** dùng được key; default policy cho root account → IAM quyết định.

---

## Bài 3 – KMS Hands On: encrypt/decrypt bằng CLI

### Kiến thức thực tế

- **`fileb://`** = đọc file dạng **binary** (bắt buộc cho plaintext/ciphertext); `file://` đọc dạng text, sẽ sai với ciphertext.
- CLI v2 coi tham số blob là base64 theo mặc định; nếu truyền chuỗi trực tiếp cần `--cli-binary-format raw-in-base64-out` hoặc dùng `fileb://`.
- **Encryption context**: cặp key-value (không bí mật) gắn vào lúc encrypt, bắt buộc khớp khi decrypt; được ghi vào CloudTrail → dùng làm **AAD** và cho điều kiện `kms:EncryptionContext:...` trong policy.

  ```bash
  aws kms encrypt --key-id alias/tutorial --plaintext fileb://f.txt \
    --encryption-context app=billing,env=prod --query CiphertextBlob --output text
  ```

- `aws kms re-encrypt` đổi ciphertext sang key khác **mà plaintext không rời KMS**.

### Ghi nhớ cho kỳ thi

- `Encrypt` / `Decrypt` trực tiếp chỉ cho dữ liệu **≤ 4 KB**.
- Decrypt symmetric **không cần chỉ key ID** (ciphertext chứa thông tin key).
- Output CLI là **base64**; dùng `fileb://` để truyền binary.

---

## Bài 4 – Envelope Encryption và `GenerateDataKey`

### Lý thuyết

- KMS `Encrypt` API chỉ mã hoá được **tối đa 4 KB**.
- Muốn mã hoá dữ liệu **> 4 KB** → dùng **Envelope Encryption**, xoay quanh API **`GenerateDataKey`**.
- Đề thi: **"mã hoá file lớn hơn 4 KB" → Envelope Encryption → `GenerateDataKey`**.

#### Envelope Encryption – phía mã hoá (client)

```
                 ┌────────────── AWS KMS ──────────────┐
Client SDK ──GenerateDataKey(KeyId=CMK)──►  CMK sinh DEK
           ◄── Plaintext DEK + Encrypted DEK ─────────┘
   │
   ├─ Mã hoá big file bằng Plaintext DEK (local, AES-256)
   ├─ Xoá Plaintext DEK khỏi bộ nhớ
   └─ Đóng gói "envelope":  [ Encrypted DEK | Encrypted file ]  → lưu S3/đĩa
```

#### Envelope Encryption – phía giải mã

```
Client đọc envelope ──► tách Encrypted DEK
   │
   ├─ Decrypt(Encrypted DEK) ──► AWS KMS (CMK) ──► Plaintext DEK
   └─ Giải mã file bằng Plaintext DEK (local) ──► Decrypted big file
```

- Lợi ích: dữ liệu lớn **không đi qua mạng tới KMS**; chỉ DEK nhỏ được mã hoá/giải mã bởi KMS; CMK **không bao giờ rời KMS**.

#### Các API KMS cần nhớ

| API | Chức năng |
|---|---|
| `Encrypt` | Mã hoá tối đa **4 KB** bằng KMS |
| `Decrypt` | Giải mã tối đa 4 KB (kể cả **DEK**) |
| **`GenerateDataKey`** | Sinh **symmetric DEK duy nhất**, trả về **plaintext DEK + DEK đã mã hoá** bởi CMK |
| **`GenerateDataKeyWithoutPlaintext`** | Chỉ trả về **DEK đã mã hoá**; dùng khi muốn sinh DEK để **dùng sau** (ví dụ lúc khác mới mã hoá) |
| `GenerateRandom` | Trả về chuỗi byte ngẫu nhiên |
| `ReEncrypt` | Đổi ciphertext sang key khác ngay trong KMS |
| `GenerateDataKeyPair` | Sinh cặp key asymmetric (ít gặp) |

### Kiến thức thực tế

- Đây chính là cách **S3 SSE-KMS, EBS, RDS** hoạt động bên trong: mỗi object/volume có DEK riêng, được bọc bởi KMS key.
- `GenerateDataKeyWithoutPlaintext` hữu ích cho hệ thống phân tán: thành phần A tạo/lưu DEK mã hoá, thành phần B (có quyền `kms:Decrypt`) mới giải mã khi cần.
- Đừng tự viết crypto nếu không cần: dùng **AWS Encryption SDK** (đã xử lý format, nonce, AAD, key commitment).

### Ghi nhớ cho kỳ thi

- Dữ liệu **> 4 KB** → **Envelope Encryption** → **`GenerateDataKey`**.
- Cần DEK **để dùng sau**, không cần plaintext ngay → **`GenerateDataKeyWithoutPlaintext`**.
- Giải mã DEK → **`Decrypt`**.

---

## Bài 5 – AWS Encryption SDK và Data Key Caching

### Lý thuyết

- **AWS Encryption SDK** cài đặt **envelope encryption** cho bạn. Có sẵn dạng **CLI tool**.
- Thư viện cho **Java, Python, C, JavaScript, .NET, Rust, Go**.
- Khác với **S3 Encryption Client** (chỉ dùng cho S3); Encryption SDK dùng cho dữ liệu bất kỳ.
- Tính năng **Data Key Caching**:
  - **Tái sử dụng data key** thay vì tạo mới cho mỗi lần mã hoá.
  - Giúp **giảm số lần gọi KMS** → giảm chi phí, giảm throttling; **đánh đổi bảo mật** (một DEK mã hoá nhiều message).
  - Dùng **`LocalCryptoMaterialsCache`** (max age, max bytes, max messages).

### Kiến thức thực tế

- Ciphertext của Encryption SDK có **format riêng** (header chứa encrypted DEK, encryption context, chữ ký) → phải giải mã bằng Encryption SDK, không phải `aws kms decrypt`.
- Có thể dùng **nhiều wrapping key** (nhiều region / nhiều account) → giải mã được nếu có quyền với một trong số đó.
- Phiên bản mới dùng **keyrings** (AWS KMS keyring, hierarchical keyring) thay cho master key provider; **Hierarchical keyring** là cách hiện đại để giảm gọi KMS (thay data key caching).
- Với DynamoDB, dùng **AWS Database Encryption SDK** (mã hoá theo attribute).

### Ghi nhớ cho kỳ thi

- Mã hoá phía client dữ liệu bất kỳ, không muốn tự viết envelope → **AWS Encryption SDK**.
- Gọi KMS quá nhiều / bị throttle / chi phí cao → **Data Key Caching** (`LocalCryptoMaterialsCache`).

---

## Bài 6 – KMS Request Quotas và Throttling

### Lý thuyết

- Khi vượt quota request, KMS trả về **`ThrottlingException`**:

  ```
  You have exceeded the rate at which you may call KMS. Reduce the frequency of your calls.
  (Service: AWSKMS; Status Code: 400; Error Code: ThrottlingException)
  ```

- Cách xử lý:
  1. **Exponential backoff** (backoff + retry, có jitter).
  2. Nhớ rằng với các thao tác mã hoá, **các API dùng chung quota** (`Encrypt`, `Decrypt`, `GenerateDataKey`, `GenerateDataKeyWithoutPlaintext`, `ReEncrypt`, `GenerateRandom`…).
  3. Dùng **DEK caching** (Encryption SDK) để giảm số lần gọi.
  4. Xin **tăng quota** qua **API/Service Quotas console** hoặc **AWS Support**.
- Dịch vụ AWS gọi KMS **thay bạn** (S3 SSE-KMS, EBS…) cũng tính vào quota của bạn.

#### Quota theo video (cryptographic operations, chia sẻ giữa các API)

| Loại key / thao tác | Quota (request/giây) |
|---|---|
| Symmetric CMK | **5.500**, **10.000** hoặc **30.000** tuỳ region (dùng chung) |
| Asymmetric RSA (encrypt/decrypt/sign/verify) | 500 |
| Asymmetric ECC (sign/verify) | 300 |

> Chương 14 ghi "5.000 – 30.000 request/giây tuỳ region" – cùng ý: con số phụ thuộc region và có thể xin tăng.

### Kiến thức thực tế

- Quota thực tế hiện nay **cao hơn** ở một số region lớn; luôn kiểm tra trong **Service Quotas** thay vì nhớ con số cứng.
- KMS đẩy metric usage vào CloudWatch (namespace `AWS/Usage`) → đặt alarm trước khi chạm quota.
- Tách key theo tenant **không** tăng quota (quota tính theo **account + region**, dùng chung cho mọi key cùng loại).

### Ghi nhớ cho kỳ thi

- `ThrottlingException` từ KMS → **exponential backoff**, **DEK caching**, **tăng quota** (Service Quotas / Support).
- Quota **dùng chung** giữa các API mã hoá, tính theo **account + region**.

---

## Bài 7 – KMS & S3: SSE-KMS và S3 Bucket Key

### Lý thuyết

- Nhắc lại (Chương 14): SSE-KMS → upload gọi `GenerateDataKey`, download gọi `Decrypt` → **mỗi object một lần gọi KMS**.
- **S3 Bucket Key**: S3 lấy một **bucket-level key** (ngắn hạn) từ KMS, rồi dùng nó sinh **data key cho từng object** **ngay trong S3** (envelope encryption).
- Kết quả: **giảm tới 99% số lần gọi KMS** → giảm chi phí, giảm throttling.
- Trade-off: ít sự kiện KMS hơn trong **CloudTrail**, và log ghi theo **bucket ARN** thay vì object ARN.

```
Không có Bucket Key:   Object 1..N ── mỗi object gọi KMS ──► KMS (N request)

Có Bucket Key:         KMS ──(1 lần)──► S3 Bucket Key (ngắn hạn)
                                           ├─► data key object 1
                                           ├─► data key object 2
                                           └─► data key object N
```

#### Quyền IAM khi dùng SSE-KMS

| Thao tác | Quyền S3 | Quyền KMS |
|---|---|---|
| Upload (PutObject) | `s3:PutObject` | `kms:GenerateDataKey` |
| Download (GetObject) | `s3:GetObject` | `kms:Decrypt` |
| Multipart upload | `s3:PutObject` | `kms:GenerateDataKey` **và** `kms:Decrypt` |

### Kiến thức thực tế

- Bucket Key **bật mặc định** khi chọn SSE-KMS trên console; không áp dụng cho **DSSE-KMS**.
- Nếu policy dựa trên **encryption context** = object ARN (`aws:s3:arn`), khi bật Bucket Key context sẽ là **bucket ARN** → cần sửa policy.
- Bật Bucket Key **không mã hoá lại** object cũ; dùng `CopyObject` hoặc **S3 Batch Operations** để áp dụng.

### Ghi nhớ cho kỳ thi

- S3 SSE-KMS bị **KMS throttling** / chi phí KMS cao → **bật S3 Bucket Key**.
- Upload SSE-KMS bị `AccessDenied` → thiếu **`kms:GenerateDataKey`**; download → thiếu **`kms:Decrypt`**.

---

## Bài 8 – Key Policy, IAM principal, `kms:ViaService`, `kms:CallerAccount`

### Lý thuyết

- KMS dùng **key policy làm nguồn quyền chính**. IAM policy **chỉ có tác dụng** khi key policy cho phép account (statement "Enable IAM User Permissions").
- **Default key policy**:

```json
{
  "Sid": "Enable IAM User Permissions",
  "Effect": "Allow",
  "Principal": { "AWS": "arn:aws:iam::111122223333:root" },
  "Action": "kms:*",
  "Resource": "*"
}
```

> `arn:aws:iam::111122223333:root` ở đây nghĩa là **cả account** (mọi IAM principal có IAM policy cho phép), không chỉ root user.

#### Principal có thể dùng trong key policy

| Principal | Ví dụ |
|---|---|
| AWS account (root) | `arn:aws:iam::123456789012:root` |
| IAM role | `arn:aws:iam::123456789012:role/role-name` |
| IAM role session (assumed role) | `arn:aws:sts::123456789012:assumed-role/role-name/role-session-name` |
| Role session qua web identity federation | `arn:aws:sts::123456789012:assumed-role/role-name/my-app` |
| Role session qua SAML federation | `arn:aws:sts::123456789012:assumed-role/role-name/my-saml-session` |
| IAM user | `arn:aws:iam::123456789012:user/user-name` |
| Federated user session | `arn:aws:sts::123456789012:federated-user/user-name` |
| AWS service | `"Service": "logs.us-east-1.amazonaws.com"` |
| Mọi principal | `"*"` (nguy hiểm, luôn kèm condition) |

> Phần STS (`AssumeRole`, session, federation, MFA) xem **Chương 29 – Bài 1**.

#### `kms:ViaService` và `kms:CallerAccount`

- **`kms:ViaService`**: chỉ cho phép dùng key khi request đến **từ một dịch vụ AWS cụ thể** (thay mặt principal), ví dụ chỉ qua EC2/EBS hoặc RDS, không cho gọi KMS trực tiếp.
- **`kms:CallerAccount`**: giới hạn theo **account ID** của người gọi.

```json
{
  "Sid": "Allow use of the key via EC2 and RDS only",
  "Effect": "Allow",
  "Principal": { "AWS": "arn:aws:iam::111122223333:user/ExampleUser" },
  "Action": ["kms:Encrypt", "kms:Decrypt", "kms:ReEncrypt*",
             "kms:GenerateDataKey*", "kms:CreateGrant", "kms:ListGrants",
             "kms:DescribeKey"],
  "Resource": "*",
  "Condition": {
    "ForAnyValue:StringEquals": {
      "kms:ViaService": ["ec2.us-west-2.amazonaws.com", "rds.us-west-2.amazonaws.com"]
    }
  }
}
```

- Đây cũng là cấu trúc key policy của **AWS managed key** (ví dụ `aws/ebs`): cho mọi principal trong account dùng key **qua** EC2, với `kms:CallerAccount` = account đó.

#### Cross-account KMS

Cần **cả hai phía**:

1. **Key policy** ở account sở hữu key cho phép principal/account bên kia.
2. **IAM policy** ở account bên kia cho phép principal gọi `kms:*` trên **key ARN** đó (không dùng alias cross-account được).

```json
{
  "Effect": "Allow",
  "Action": ["kms:Decrypt", "kms:DescribeKey"],
  "Resource": "arn:aws:kms:us-east-1:111122223333:key/1111aaaa-22bb-33cc-44dd-5555eeee6666"
}
```

### Kiến thức thực tế

- **Lockout**: nếu sửa key policy mà bỏ mất statement cho account/admin → không ai quản trị được key, phải nhờ AWS Support. KMS có "policy lockout safety check" để ngăn việc này.
- Tách **Key administrators** (`kms:Create*`, `kms:Put*`, `kms:ScheduleKeyDeletion`…) và **Key users** (`kms:Encrypt`, `kms:Decrypt`…) → least privilege.
- Condition hữu ích khác: `kms:EncryptionContext:<key>`, `kms:GrantIsForAWSResource`, `aws:PrincipalOrgID`.

### Ghi nhớ cho kỳ thi

- Key chỉ dùng được **khi đi qua dịch vụ X** → **`kms:ViaService`**.
- Giới hạn account gọi → **`kms:CallerAccount`**.
- Cross-account KMS = **key policy** (bên sở hữu) + **IAM policy** (bên gọi).

---

## Bài 9 – AWS CloudHSM

### Lý thuyết

- **KMS** → AWS quản lý phần mềm mã hoá. **CloudHSM** → AWS cấp **phần cứng mã hoá chuyên dụng** (HSM – Hardware Security Module).
- **Bạn tự quản lý key mã hoá hoàn toàn** (không phải AWS). AWS **không thể** khôi phục key nếu bạn mất credentials.
- HSM chống giả mạo (tamper resistant), đạt chuẩn **FIPS 140-2 Level 3**.
- Hỗ trợ **cả symmetric và asymmetric** (SSL/TLS keys).
- **Không có free tier**.
- Phải dùng **CloudHSM Client Software**.
- **Redshift** hỗ trợ CloudHSM cho mã hoá database và quản lý key.
- Phù hợp với **SSE-C** trên S3 (key nằm trong CloudHSM của bạn).
- **High availability**: CloudHSM cluster trải **nhiều AZ**.
- Tích hợp với KMS qua **Custom Key Store** (KMS key có key material nằm trong CloudHSM của bạn).

```
        AWS quản lý phần cứng              Bạn quản lý key + user
┌────────────────────────────┐     ┌───────────────────────────────┐
│ CloudHSM Cluster (multi-AZ) │◄────│ CloudHSM Client (trên EC2 ...) │
│   HSM (AZ-a)   HSM (AZ-b)   │     │ quản lý key, user, policy      │
└────────────────────────────┘     └───────────────────────────────┘
          ▲
          └── KMS Custom Key Store (EBS/S3/RDS dùng KMS như bình thường, CloudTrail audit)
```

#### So sánh KMS và CloudHSM

| Tiêu chí | AWS KMS | AWS CloudHSM |
|---|---|---|
| Tenancy | Multi-tenant | **Single-tenant** |
| Chuẩn | FIPS 140-2 Level 3 (theo video: Level 2; AWS đã nâng lên Level 3 từ 2023) | FIPS 140-2 Level 3 |
| Loại key | AWS owned / AWS managed / Customer managed | Customer managed (của bạn) |
| Ai quản lý key | AWS + bạn (qua policy) | **Chỉ bạn** |
| Access control | **IAM + key policy** | **User trong HSM** (CO, CU) |
| Mã hoá | Symmetric, asymmetric, sign/verify, HMAC | Symmetric, asymmetric, hashing, sign, SSL/TLS offload |
| Tích hợp dịch vụ AWS | Rất nhiều | Qua KMS Custom Key Store |
| Free tier | Có | **Không** |
| HA | AWS quản lý | Bạn thêm HSM ở nhiều AZ |
| Acceleration | Không | **SSL/TLS acceleration**, Oracle TDE |

### Kiến thức thực tế

- Dùng CloudHSM khi compliance yêu cầu **single-tenant HSM**, bạn độc quyền kiểm soát key, hoặc ứng dụng có sẵn cần chuẩn **PKCS#11 / JCE / CNG**.
- Chỉ cần "key nằm trong HSM của tôi" nhưng vẫn muốn tích hợp dịch vụ AWS → **KMS Custom Key Store (CloudHSM)**; HSM nằm ngoài AWS → **External Key Store (XKS)**.

### Ghi nhớ cho kỳ thi

- Cần **phần cứng chuyên dụng**, **single-tenant**, **tự quản lý key hoàn toàn** → **CloudHSM**.
- Muốn dùng **SSE-C** với key lưu trên HSM riêng trong AWS → **CloudHSM**.

---

## Bài 10 – SSM Parameter Store

### Lý thuyết

- **Lưu trữ an toàn** cấu hình và secret.
- **Tuỳ chọn mã hoá** bằng KMS (**SecureString**).
- **Serverless**, scale tốt, bền vững, SDK dễ dùng.
- **Version tracking** cho cấu hình/secret.
- Bảo mật bằng **IAM**; thông báo qua **Amazon EventBridge**; tích hợp **CloudFormation**.

#### Hierarchy (cây tham số)

```
/my-department/
    my-app/
        dev/
            db-url
            db-password
        prod/
            db-url
            db-password
    other-app/
/other-department/
/aws/reference/secretsmanager/secret_ID_in_Secrets_Manager   ← tham chiếu secret của Secrets Manager
/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64   ← public parameter do AWS cung cấp
```

- Lambda dev đọc `/my-department/my-app/dev/*`, Lambda prod đọc `/my-department/my-app/prod/*` → phân quyền IAM theo path.
- Đọc secret của Secrets Manager **qua Parameter Store API** bằng prefix `/aws/reference/secretsmanager/...` (cần `--with-decryption`).

#### Kiểu tham số

| Kiểu | Mô tả |
|---|---|
| `String` | Plaintext |
| `StringList` | Danh sách phân tách bởi dấu phẩy |
| **`SecureString`** | Mã hoá bằng KMS (`aws/ssm` hoặc CMK). Đọc plaintext cần quyền SSM **và** `kms:Decrypt` |

#### Standard vs Advanced tier

| | Standard | Advanced |
|---|---|---|
| Số parameter tối đa (account + region) | **10.000** | **100.000** |
| Kích thước value tối đa | **4 KB** | **8 KB** |
| **Parameter policies** | **Không** | **Có** |
| Chi phí lưu trữ | **Miễn phí** | **$0,05 / parameter / tháng** |
| Chi phí API | Throughput mặc định: miễn phí; higher throughput: $0,05 / 10.000 lần | $0,05 / 10.000 lần |

> Có thể nâng Standard → Advanced, **không hạ** Advanced → Standard được.

#### Parameter Policies (chỉ Advanced)

- Gán **TTL** (expiration date) để **buộc cập nhật hoặc xoá** dữ liệu nhạy cảm như mật khẩu.
- Có thể gán **nhiều policy** cùng lúc.

| Policy | Ý nghĩa |
|---|---|
| `Expiration` | Xoá parameter tại thời điểm chỉ định |
| `ExpirationNotification` | Gửi event **EventBridge** trước khi hết hạn (ví dụ 15 ngày) |
| `NoChangeNotification` | Gửi event EventBridge nếu parameter **không được cập nhật** sau X ngày |

```json
[
  { "Type": "Expiration", "Version": "1.0",
    "Attributes": { "Timestamp": "2026-12-31T23:59:59.000Z" } },
  { "Type": "ExpirationNotification", "Version": "1.0",
    "Attributes": { "Before": "15", "Unit": "Days" } },
  { "Type": "NoChangeNotification", "Version": "1.0",
    "Attributes": { "After": "20", "Unit": "Days" } }
]
```

### Kiến thức thực tế

- **AWS Parameters and Secrets Lambda Extension**: layer cache tham số/secret tại local (`http://localhost:2773/systemsmanager/parameters/get?name=...`) → giảm latency và chi phí API.
- Throughput mặc định của Standard khoảng **40 TPS**; bật **higher throughput** (tới 10.000 TPS, tính phí) nếu nhiều Lambda đọc đồng thời, nếu không sẽ gặp `ThrottlingException`.
- **Public parameters** của AWS: lấy AMI mới nhất trong CloudFormation:

  ```yaml
  Parameters:
    LatestAmiId:
      Type: AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>
      Default: /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64
  ```

- CloudFormation dynamic reference: `{{resolve:ssm:/my-app/prod/db-url:1}}` và `{{resolve:ssm-secure:/my-app/prod/db-password}}` (`ssm-secure` chỉ hỗ trợ ở một số resource property).

### Ghi nhớ cho kỳ thi

- Lưu cấu hình theo cây, có version, phân quyền theo path → **Parameter Store hierarchy**.
- Đọc SecureString dạng plaintext → **`--with-decryption`** + quyền **`kms:Decrypt`**.
- Đọc cả cây → **`get-parameters-by-path --recursive`**.
- TTL / thông báo hết hạn → **Parameter policies** → cần **Advanced tier**.
- Value > 4 KB (≤ 8 KB) hoặc > 10.000 parameter → **Advanced**.

---

## Bài 11 – AWS Secrets Manager

### Lý thuyết

- Dịch vụ mới hơn, chuyên **lưu secret**.
- Có thể **buộc rotation** secret **mỗi X ngày**.
- **Tự động sinh secret** khi rotation, nhờ **Lambda**.
- **Tích hợp sẵn với Amazon RDS** (MySQL, PostgreSQL, Aurora…), Redshift, DocumentDB.
- Secret được **mã hoá bằng KMS** (bắt buộc).
- Chủ yếu dùng cho **tích hợp RDS**.
- Chi phí: **$0,40 / secret / tháng** + **$0,05 / 10.000 API call**.

#### Rotation

```
Secrets Manager ──(lịch: mỗi X ngày)──► Lambda rotation function
                                            1. createSecret  (sinh mật khẩu mới, version AWSPENDING)
                                            2. setSecret     (đổi mật khẩu trên DB)
                                            3. testSecret    (thử đăng nhập)
                                            4. finishSecret  (AWSPENDING → AWSCURRENT)
```

- Secret có **staging label**: `AWSCURRENT`, `AWSPREVIOUS`, `AWSPENDING`.
- Với RDS/Aurora/Redshift/DocumentDB: AWS cung cấp **Lambda rotation template** sẵn (single user / alternating users).

#### Multi-Region Secrets

- **Replicate** secret sang nhiều region; Secrets Manager giữ **read replica đồng bộ** với secret chính.
- Có thể **promote** replica thành secret độc lập (disaster recovery).
- Use case: ứng dụng multi-region, DR, database multi-region.

```
us-east-1: Secret (primary) ──replicate──► us-west-2: Secret (replica)
                                             └─ promote khi region chính gặp sự cố
```

#### CloudFormation integration

**Cách 1 – `ManageMasterUserPassword`** (RDS/Aurora tự tạo và quản lý secret, kể cả rotation):

```yaml
Resources:
  MyCluster:
    Type: AWS::RDS::DBCluster
    Properties:
      Engine: aurora-mysql
      MasterUsername: masteruser
      ManageMasterUserPassword: true
Outputs:
  Secret:
    Value: !GetAtt MyCluster.MasterUserSecret.SecretArn
```

**Cách 2 – Dynamic reference** (tạo secret bằng `GenerateSecretString`, rồi tham chiếu):

```yaml
Resources:
  MyDatabaseSecret:
    Type: AWS::SecretsManager::Secret
    Properties:
      Name: MyDatabaseSecret
      GenerateSecretString:
        SecretStringTemplate: '{"username": "admin"}'
        GenerateStringKey: password
        PasswordLength: 16
        ExcludeCharacters: '"@/\'

  MyDBInstance:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceClass: db.t3.micro
      Engine: mysql
      AllocatedStorage: 20
      MasterUsername: !Sub '{{resolve:secretsmanager:${MyDatabaseSecret}:SecretString:username}}'
      MasterUserPassword: !Sub '{{resolve:secretsmanager:${MyDatabaseSecret}:SecretString:password}}'

  SecretRDSAttachment:          # liên kết secret với DB (để rotation biết host/port)
    Type: AWS::SecretsManager::SecretTargetAttachment
    Properties:
      SecretId: !Ref MyDatabaseSecret
      TargetId: !Ref MyDBInstance
      TargetType: AWS::RDS::DBInstance
```

- Cú pháp: `{{resolve:secretsmanager:secret-id:SecretString:json-key:version-stage:version-id}}`.

### Kiến thức thực tế

- Rotation có thể đặt theo **`ScheduleExpression`** (cron/rate) và nhanh tới **mỗi 4 giờ**.
- **Managed rotation**: với RDS master password (`ManageMasterUserPassword`) và một số dịch vụ khác, AWS tự rotate **không cần Lambda của bạn**.
- Quyền đọc: `secretsmanager:GetSecretValue` + `kms:Decrypt` (nếu dùng CMK). Có **resource policy** trên secret để cho cross-account (bắt buộc dùng CMK, không dùng `aws/secretsmanager`).
- Cache phía client: **AWS Secrets Manager caching library** (Python/Java/Go/.NET) hoặc **Lambda extension** → giảm chi phí API.
- Ứng dụng nên **đọc secret khi kết nối lại** (không hardcode lúc build), để rotation không làm gãy kết nối.

### Ghi nhớ cho kỳ thi

- Secret cần **rotation tự động** (nhất là **RDS**) → **Secrets Manager** (+ Lambda).
- Secret dùng ở **nhiều region**, DR → **multi-region secret replication**.
- CloudFormation không hardcode mật khẩu → **`{{resolve:secretsmanager:...}}`** hoặc **`ManageMasterUserPassword: true`**.

---

## Bài 12 – So sánh Parameter Store và Secrets Manager

### Lý thuyết

| Tiêu chí | SSM Parameter Store | AWS Secrets Manager |
|---|---|---|
| Mục đích | Cấu hình + secret (đa năng) | **Chuyên cho secret** |
| Chi phí | **Rẻ** (Standard miễn phí) | **Đắt hơn** ($0,40/secret/tháng) |
| Mã hoá KMS | **Tuỳ chọn** (SecureString) | **Bắt buộc** |
| Rotation tự động | **Không có sẵn** (tự làm bằng EventBridge + Lambda) | **Có**, dùng Lambda; template sẵn cho RDS, Redshift, DocumentDB |
| Sinh mật khẩu | Không | Có (`GenerateSecretString`, `get-random-password`) |
| Hierarchy / path | **Có** | Không (tên có thể chứa `/` nhưng không có API theo path) |
| Kích thước | 4 KB / 8 KB | **64 KB** |
| Multi-region | Không | **Có** (replication) |
| Cross-account | Hạn chế (Advanced parameter share qua AWS RAM) | Có (resource policy + CMK) |
| CloudFormation | `{{resolve:ssm:...}}`, `{{resolve:ssm-secure:...}}` | `{{resolve:secretsmanager:...}}` |
| Đọc secret của dịch vụ kia | Đọc được secret Secrets Manager qua `/aws/reference/secretsmanager/` | – |
| Version | Version số (1, 2, 3…) + label | Staging label (`AWSCURRENT`…) |

#### Rotation với Parameter Store (tự xây)

```
EventBridge (schedule mỗi 30 ngày) ──► Lambda ──► sinh mật khẩu mới
                                                    ├─ đổi mật khẩu trên DB
                                                    └─ ssm put-parameter --overwrite
```

#### Rotation với Secrets Manager

```
Secrets Manager (lịch rotation) ──► Lambda (template AWS) ──► RDS đổi mật khẩu + cập nhật secret
```

### Ghi nhớ cho kỳ thi

- "Rotation tự động", "RDS credentials" → **Secrets Manager**.
- "Rẻ", "cấu hình", "hierarchy", "không cần rotation" → **Parameter Store**.
- Cả hai mã hoá bằng **KMS**; đọc plaintext cần **`kms:Decrypt`**.

---

## Bài 13 – Mã hoá CloudWatch Logs bằng KMS

### Lý thuyết

- Có thể mã hoá CloudWatch Logs bằng **KMS key**.
- Mã hoá được bật ở **cấp log group**, bằng cách **gắn (associate) CMK** với log group — **không làm được trên console**, chỉ qua **CLI/SDK/API**:
  - **`associate-kms-key`**: nếu log group **đã tồn tại**.
  - **`create-log-group --kms-key-id`**: nếu log group **chưa tồn tại**.
- **Key policy** của CMK phải cho phép **CloudWatch Logs service** (`logs.<region>.amazonaws.com`) dùng key, nếu không lệnh sẽ báo lỗi `AccessDeniedException`.
- Sau khi gắn, dữ liệu **mới** được mã hoá; dữ liệu cũ vẫn giữ nguyên (đã được mã hoá bằng key mặc định của dịch vụ).

### Kiến thức thực tế

- Nếu bạn **disable/xoá key** đã gắn, CloudWatch Logs **không đọc/ghi** được log group đó nữa.
- Condition `kms:EncryptionContext:aws:logs:arn` giới hạn key chỉ được dùng cho log group cụ thể → least privilege.
- Có thể đặt KMS key ở mức **account policy / data protection** và dùng **data protection policy** để che (mask) dữ liệu nhạy cảm như email, số thẻ trong log.

### Ghi nhớ cho kỳ thi

- Mã hoá log group **đã có** → **`associate-kms-key`**; log group **mới** → **`create-log-group --kms-key-id`**.
- Bị lỗi khi gắn key → sửa **key policy** cho principal **`logs.<region>.amazonaws.com`**.
- Không làm được trên console (theo video).

---

## Bài 14 – Bảo mật CodeBuild

### Lý thuyết

- Để truy cập tài nguyên **trong VPC** (RDS, ElastiCache, EC2, ALB nội bộ…), cấu hình **VPC** cho CodeBuild (VPC ID, subnet, security group).
- **Secrets trong CodeBuild**: **không lưu dạng plaintext** trong environment variables. Thay vào đó:
  - Environment variable có thể **tham chiếu SSM Parameter Store** (`PARAMETER_STORE`).
  - Environment variable có thể **tham chiếu Secrets Manager** (`SECRETS_MANAGER`).
- **Service role** của CodeBuild cần quyền `ssm:GetParameters` / `secretsmanager:GetSecretValue` (+ `kms:Decrypt` nếu dùng CMK).

```
CodeBuild project (trong VPC, private subnet)
   ├─ env DB_PASSWORD  ◄── Parameter Store / Secrets Manager (không plaintext)
   ├─ Security Group ──► RDS / ElastiCache trong VPC
   └─ Ra Internet (tải dependency) qua NAT Gateway / VPC endpoints
```

### Kiến thức thực tế

- CodeBuild trong VPC chạy ở **private subnet** cần **NAT Gateway** (hoặc VPC endpoint cho S3, ECR, CloudWatch Logs, SSM, Secrets Manager) để tải mã nguồn/dependency; **public subnet không cấp public IP** cho build.
- CodeBuild **che (mask)** giá trị lấy từ Parameter Store/Secrets Manager trong build log, nhưng đừng `echo`/`set -x` secret.
- Artifact và cache trên S3 có thể mã hoá bằng **KMS CMK** (`encryptionKey` của project).
- Xác thực GitHub/Bitbucket nên dùng **CodeConnections** hoặc token lưu trong Secrets Manager.

### Ghi nhớ cho kỳ thi

- Secret trong CodeBuild → **env var tham chiếu Parameter Store / Secrets Manager**, không plaintext.
- CodeBuild cần truy cập tài nguyên trong VPC → **cấu hình VPC** (VPC ID, subnet, security group).

---

## Bài 15 – AWS Nitro Enclaves

### Lý thuyết

- Bài toán: xử lý **dữ liệu cực kỳ nhạy cảm** trong một **môi trường tính toán cô lập** (isolated compute environment):
  - Dữ liệu cá nhân định danh (**PII**), y tế, tài chính, sở hữu trí tuệ.
- **Nitro Enclaves** là **VM cô lập, cứng hoá (hardened), ràng buộc cao**:
  - **Không phải container**, **không có persistent storage**, **không truy cập tương tác** (không SSH), **không có networking ra ngoài**.
  - Chỉ giao tiếp với EC2 instance cha qua kênh cục bộ **vsock**.
- Giúp **giảm bề mặt tấn công** cho ứng dụng xử lý dữ liệu nhạy cảm.
  - **Cryptographic Attestation**: chỉ code được **ký/xác thực** mới chạy được trong enclave.
  - **Chỉ enclave** mới truy cập được dữ liệu nhạy cảm (tích hợp với **KMS**).
- Use case: **bảo vệ private key**, xử lý thẻ tín dụng, xử lý PII an toàn, multi-party computation.

```
┌────────────────────── EC2 instance (Nitro) ──────────────────────┐
│  Parent instance (OS, app, network)                                │
│        │ vsock (kênh cục bộ duy nhất)                              │
│        ▼                                                           │
│  ┌──────────── Nitro Enclave ────────────┐                         │
│  │ vCPU + RAM tách riêng từ instance cha  │                         │
│  │ Không network, không disk, không SSH   │──attestation──► AWS KMS│
│  │ Xử lý PII / private key                │◄── Decrypt chỉ khi     │
│  └────────────────────────────────────────┘    image hash khớp     │
└────────────────────────────────────────────────────────────────────┘
```

#### Cách dùng

1. Chạy **EC2 instance tương thích Nitro**, bật **`EnclaveOptions` = true** khi khởi tạo.
2. Dùng **Nitro CLI** để đóng gói ứng dụng thành **Enclave Image File (EIF)**.
3. Dùng Nitro CLI để **tạo và chạy enclave** từ EIF trên instance.
4. Enclave là **VM riêng** với kernel, bộ nhớ, CPU **tách** từ instance cha.

### Kiến thức thực tế

- Nitro Enclaves **không tốn thêm phí**; chỉ trả tiền EC2 (vCPU/RAM chia từ instance cha).
- **ACM for Nitro Enclaves**: dùng chứng chỉ ACM public trên web server (NGINX) trên EC2 mà private key không bao giờ lộ ra instance cha.
- Hỗ trợ trên EKS/ECS qua plugin; chỉ chạy trên instance Nitro-based (đa số dòng mới, cần ≥ 4 vCPU với x86).

### Ghi nhớ cho kỳ thi

- Xử lý **PII/thẻ tín dụng/private key** trong môi trường **cô lập**, giảm bề mặt tấn công, **cryptographic attestation** → **AWS Nitro Enclaves**.

---

## Tổng kết chương

| Chủ đề | Điều cần nhớ |
|---|---|
| Encryption 101 | In-flight (TLS) / server-side at rest / client-side |
| KMS keys | AWS owned / AWS managed (free, rotate 1 năm, không cross-account) / Customer managed ($1/tháng, key policy, cross-account) |
| Symmetric vs Asymmetric | Symmetric: luôn qua API; Asymmetric: tải public key, dùng ngoài AWS |
| Key policy | Không có policy → không ai dùng; default cho account → IAM quyết định |
| Snapshot cross-region/account | Re-encrypt bằng key đích; share cần CMK + key policy |
| CLI | `fileb://`, output base64, decrypt không cần key ID |
| Envelope encryption | > 4 KB → `GenerateDataKey`; dùng sau → `GenerateDataKeyWithoutPlaintext` |
| Encryption SDK | Envelope encryption sẵn; **data key caching** giảm gọi KMS |
| Quota | `ThrottlingException` → backoff, cache DEK, tăng quota |
| S3 Bucket Key | Giảm 99% gọi KMS cho SSE-KMS |
| Condition | `kms:ViaService`, `kms:CallerAccount` |
| CloudHSM | Phần cứng single-tenant, bạn tự quản lý key, FIPS 140-2 L3, SSE-C |
| Parameter Store | Hierarchy, SecureString, Standard (4 KB, 10k, free) / Advanced (8 KB, 100k, policies) |
| Secrets Manager | Rotation bằng Lambda, RDS, multi-region, `{{resolve:secretsmanager:...}}` |
| CloudWatch Logs | `associate-kms-key` / `create-log-group --kms-key-id`; key policy cho `logs.<region>.amazonaws.com` |
| CodeBuild | Secret qua Parameter Store/Secrets Manager env vars; VPC config |
| Nitro Enclaves | Môi trường cô lập, attestation, xử lý PII |
| IAM & STS | Xem **Chương 29** (`AssumeRole`, `GetSessionToken` + MFA, policy evaluation, `iam:PassRole`) |

---

## Câu hỏi ôn tập

*Nguồn: tổng hợp theo nội dung chương (không có file quiz gốc trong thư mục). Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Bạn cần mã hoá một file 1 MB bằng KMS. Gọi API `Encrypt` báo lỗi vì kích thước. Bạn nên làm gì?

- A. Chia file thành các phần 4 KB và gọi `Encrypt` cho từng phần
- B. Dùng envelope encryption với API `GenerateDataKey`
- C. Xin AWS tăng giới hạn kích thước của `Encrypt`
- D. Dùng `ReEncrypt`

<details><summary>Đáp án</summary>

**B.** `Encrypt` chỉ mã hoá tối đa 4 KB và giới hạn này không tăng được. Dữ liệu lớn hơn dùng **envelope encryption**: `GenerateDataKey` trả về DEK plaintext để mã hoá file ở local và DEK đã mã hoá để lưu kèm. A tốn rất nhiều request và dễ bị throttle.
</details>

**Câu 2.** Một thành phần trong hệ thống cần tạo data key để **dùng sau này** (thời điểm khác mới mã hoá), không cần plaintext DEK ngay. API nào phù hợp?

- A. `GenerateDataKey`
- B. `GenerateDataKeyWithoutPlaintext`
- C. `GenerateRandom`
- D. `Encrypt`

<details><summary>Đáp án</summary>

**B.** `GenerateDataKeyWithoutPlaintext` chỉ trả về DEK đã mã hoá; khi cần dùng, gọi `Decrypt` để lấy plaintext DEK. `GenerateRandom` chỉ trả về byte ngẫu nhiên, không gắn với CMK.
</details>

**Câu 3.** Ứng dụng Lambda gọi KMS `Decrypt` hàng nghìn lần mỗi giây và thỉnh thoảng nhận `ThrottlingException`. Cách nào **không** giúp giải quyết?

- A. Áp dụng exponential backoff khi retry
- B. Dùng data key caching của AWS Encryption SDK
- C. Xin tăng quota KMS qua Service Quotas
- D. Tạo thêm nhiều CMK để mỗi key có quota riêng

<details><summary>Đáp án</summary>

**D.** Quota request mã hoá của KMS tính theo **account + region** và dùng chung giữa các key (cùng loại), nên thêm key không tăng quota. A, B, C đều là cách xử lý khuyến nghị.
</details>

**Câu 4.** Bucket S3 dùng SSE-KMS có lưu lượng rất cao, chi phí KMS tăng mạnh và đôi khi bị throttle. Giải pháp đơn giản nhất?

- A. Chuyển sang SSE-C
- B. Bật S3 Bucket Key
- C. Dùng DSSE-KMS
- D. Dùng S3 Transfer Acceleration

<details><summary>Đáp án</summary>

**B.** S3 Bucket Key tạo key cấp bucket để sinh data key cho từng object ngay trong S3, giảm tới 99% số lần gọi KMS. DSSE-KMS mã hoá 2 lớp nên còn gọi KMS nhiều hơn; SSE-C buộc bạn tự quản lý key.
</details>

**Câu 5.** Một đối tác **không có tài khoản AWS** cần mã hoá dữ liệu trước khi gửi cho bạn, và chỉ bạn giải mã được bằng KMS. Loại key nào phù hợp?

- A. Symmetric customer managed key
- B. AWS managed key
- C. Asymmetric KMS key (RSA)
- D. AWS owned key

<details><summary>Đáp án</summary>

**C.** Với asymmetric key, bạn tải **public key** về và đưa cho đối tác mã hoá bên ngoài AWS; **private key** không rời KMS nên chỉ bạn giải mã được qua `Decrypt`. Symmetric key không thể lấy ra khỏi KMS và đối tác không gọi được KMS API.
</details>

**Câu 6.** Bạn muốn chia sẻ EBS snapshot đã mã hoá cho một tài khoản AWS khác. Snapshot đang mã hoá bằng key `aws/ebs`. Bước đầu tiên cần làm?

- A. Share snapshot trực tiếp, tài khoản đích tự dùng `aws/ebs` của họ
- B. Copy snapshot và mã hoá lại bằng customer managed key, sửa key policy cho tài khoản đích, rồi share
- C. Tắt mã hoá snapshot rồi share
- D. Export key `aws/ebs` sang tài khoản đích

<details><summary>Đáp án</summary>

**B.** AWS managed key không chia sẻ cross-account được (không sửa được key policy). Phải dùng **CMK**, cấp quyền cho tài khoản đích trong key policy (`kms:Decrypt`, `kms:CreateGrant`…), share snapshot, rồi tài khoản đích copy và re-encrypt bằng key của họ. Không thể "tắt mã hoá" snapshot đã mã hoá.
</details>

**Câu 7.** Bạn copy EBS snapshot mã hoá từ `us-east-1` sang `eu-west-1`. Điều gì xảy ra với key?

- A. Snapshot vẫn dùng KMS key ở `us-east-1`
- B. Snapshot phải được mã hoá lại bằng một KMS key ở `eu-west-1`
- C. KMS key tự được nhân bản sang `eu-west-1`
- D. Snapshot được copy ở dạng không mã hoá

<details><summary>Đáp án</summary>

**B.** KMS key theo region (trừ multi-region key). Khi copy cross-region, snapshot được re-encrypt bằng key ở region đích.
</details>

**Câu 8.** Bạn muốn một KMS key **chỉ được dùng khi request đến từ Amazon RDS** thay mặt user, không cho user gọi `kms:Decrypt` trực tiếp. Dùng condition nào?

- A. `kms:CallerAccount`
- B. `kms:ViaService`
- C. `aws:SourceIp`
- D. `kms:EncryptionAlgorithm`

<details><summary>Đáp án</summary>

**B.** `kms:ViaService` (ví dụ `rds.us-east-1.amazonaws.com`) giới hạn việc dùng key khi request đi qua dịch vụ đó. `kms:CallerAccount` chỉ giới hạn theo account ID.
</details>

**Câu 9.** Một IAM user có IAM policy `kms:*` trên một CMK nhưng vẫn bị `AccessDenied`. Key policy chỉ có một statement cấp quyền cho role `KeyAdmin`. Nguyên nhân?

- A. IAM policy phải dùng alias thay vì key ARN
- B. Key policy không cho phép account (root) nên IAM policy không có hiệu lực
- C. User cần bật MFA
- D. Key chưa bật rotation

<details><summary>Đáp án</summary>

**B.** Với KMS, key policy là nguồn quyền chính. IAM policy chỉ có tác dụng khi key policy có statement cho `arn:aws:iam::<account>:root` (như default key policy). Ở đây key policy chỉ cho `KeyAdmin`, nên user bị từ chối.
</details>

**Câu 10.** Công ty yêu cầu key mã hoá phải nằm trên **phần cứng chuyên dụng single-tenant**, chỉ công ty quản lý key, AWS không truy cập được. Dịch vụ nào phù hợp?

- A. AWS KMS với customer managed key
- B. AWS CloudHSM
- C. AWS Secrets Manager
- D. SSM Parameter Store SecureString

<details><summary>Đáp án</summary>

**B.** CloudHSM cung cấp HSM chuyên dụng (single-tenant, FIPS 140-2 Level 3), bạn tự quản lý key và user trong HSM. KMS là multi-tenant và AWS quản lý phần cứng/phần mềm.
</details>

**Câu 11.** Ứng dụng cần lưu cấu hình theo môi trường dev/prod theo cấu trúc cây, có version, chi phí thấp, không cần rotation. Dịch vụ phù hợp nhất?

- A. AWS Secrets Manager
- B. SSM Parameter Store
- C. DynamoDB
- D. S3 với SSE-KMS

<details><summary>Đáp án</summary>

**B.** Parameter Store hỗ trợ hierarchy (`/my-app/dev/...`), version, SecureString, Standard tier miễn phí. Secrets Manager đắt hơn và thế mạnh là rotation.
</details>

**Câu 12.** Lệnh sau trả về giá trị của `/my-app/dev/db-password` là một chuỗi mã hoá khó đọc. Cần sửa thế nào?

```bash
aws ssm get-parameters --names /my-app/dev/db-password
```

- A. Thêm `--recursive`
- B. Thêm `--with-decryption` và đảm bảo có quyền `kms:Decrypt`
- C. Đổi sang `get-parameters-by-path`
- D. Đổi kiểu parameter sang `StringList`

<details><summary>Đáp án</summary>

**B.** SecureString được trả về dạng ciphertext nếu không có `--with-decryption`. Khi giải mã, Parameter Store gọi KMS thay bạn nên principal cần `kms:Decrypt` trên key.
</details>

**Câu 13.** Bạn muốn lấy **tất cả** tham số dưới `/my-app/` (gồm `/my-app/dev/...` và `/my-app/prod/...`) trong một lệnh. Lệnh nào đúng?

- A. `aws ssm get-parameters --names /my-app/*`
- B. `aws ssm get-parameters-by-path --path /my-app/`
- C. `aws ssm get-parameters-by-path --path /my-app/ --recursive`
- D. `aws ssm describe-parameters --path /my-app/`

<details><summary>Đáp án</summary>

**C.** Không có `--recursive`, `get-parameters-by-path` chỉ trả về tham số ở đúng cấp `/my-app/`. `get-parameters` không hỗ trợ wildcard.
</details>

**Câu 14.** Bạn cần một parameter tự hết hạn sau 30 ngày và gửi thông báo EventBridge 5 ngày trước khi hết hạn. Điều kiện cần?

- A. Standard tier với parameter policy
- B. Advanced tier với parameter policies `Expiration` và `ExpirationNotification`
- C. Secrets Manager rotation
- D. Lambda kiểm tra hằng ngày

<details><summary>Đáp án</summary>

**B.** Parameter policies (TTL, notifications) **chỉ có ở Advanced tier**. Standard tier không hỗ trợ policy.
</details>

**Câu 15.** Mật khẩu master của Amazon RDS phải được **tự động đổi mỗi 30 ngày** mà không cần sửa ứng dụng. Giải pháp phù hợp nhất?

- A. SSM Parameter Store SecureString + cron job trên EC2
- B. AWS Secrets Manager với automatic rotation
- C. KMS key rotation
- D. Lưu mật khẩu trong biến môi trường Lambda đã mã hoá

<details><summary>Đáp án</summary>

**B.** Secrets Manager tích hợp sẵn với RDS và rotation bằng Lambda (template sẵn). KMS key rotation chỉ đổi key material, **không** đổi mật khẩu DB. Parameter Store không có rotation tích hợp.
</details>

**Câu 16.** Trong template CloudFormation, bạn muốn tạo RDS instance mà **không hardcode** mật khẩu, mật khẩu lấy từ Secrets Manager. Cú pháp nào đúng?

- A. `!GetAtt MySecret.Password`
- B. `{{resolve:secretsmanager:MySecret:SecretString:password}}`
- C. `{{resolve:ssm:MySecret}}`
- D. `!ImportValue MySecret`

<details><summary>Đáp án</summary>

**B.** Dynamic reference `{{resolve:secretsmanager:secret-id:SecretString:json-key}}` lấy giá trị secret lúc deploy. Cách khác là đặt `ManageMasterUserPassword: true` để RDS tự tạo secret.
</details>

**Câu 17.** Ứng dụng chạy active-active ở `us-east-1` và `eu-west-1`, cần cùng một secret DB và khả năng DR khi một region gặp sự cố. Tính năng nào?

- A. Parameter Store Advanced tier
- B. Secrets Manager multi-region secret replication
- C. KMS multi-region key
- D. S3 Cross-Region Replication

<details><summary>Đáp án</summary>

**B.** Secrets Manager replicate secret sang region khác, giữ đồng bộ với primary, có thể **promote** replica thành secret độc lập khi DR.
</details>

**Câu 18.** Bạn chạy `aws logs associate-kms-key` cho một log group có sẵn nhưng nhận `AccessDeniedException`. Nguyên nhân có khả năng nhất?

- A. CloudWatch Logs không hỗ trợ mã hoá KMS
- B. Key policy của CMK chưa cho phép principal `logs.<region>.amazonaws.com`
- C. Phải xoá log group và tạo lại
- D. Phải bật mã hoá trên console trước

<details><summary>Đáp án</summary>

**B.** CloudWatch Logs dùng key thay bạn, nên key policy phải cho phép service principal `logs.<region>.amazonaws.com` các action `kms:Encrypt*`, `kms:Decrypt*`, `kms:GenerateDataKey*`... Mã hoá log group làm qua CLI/API (`associate-kms-key` hoặc `create-log-group --kms-key-id`).
</details>

**Câu 19.** Một dự án CodeBuild cần mật khẩu DB để chạy integration test với RDS nằm trong private subnet. Cách làm đúng?

- A. Ghi mật khẩu dạng plaintext vào `buildspec.yml`, cho CodeBuild chạy ngoài VPC
- B. Tham chiếu mật khẩu từ Parameter Store/Secrets Manager trong env vars và cấu hình VPC (subnet, security group) cho CodeBuild
- C. Lưu mật khẩu trong S3 bucket public
- D. Mở RDS ra Internet

<details><summary>Đáp án</summary>

**B.** CodeBuild hỗ trợ env vars kiểu `PARAMETER_STORE` / `SECRETS_MANAGER` (hoặc khối `env.parameter-store` / `env.secrets-manager` trong buildspec), và cấu hình VPC để truy cập tài nguyên private.
</details>

**Câu 20.** Công ty fintech cần xử lý số thẻ tín dụng trên EC2 trong một môi trường **cô lập, không network, không SSH**, chỉ code đã được xác thực mới được giải mã dữ liệu bằng KMS. Dùng gì?

- A. EC2 Dedicated Host
- B. AWS Nitro Enclaves với cryptographic attestation
- C. AWS CloudHSM
- D. Amazon Macie

<details><summary>Đáp án</summary>

**B.** Nitro Enclaves là VM cô lập (không persistent storage, không network, không truy cập tương tác), hỗ trợ **cryptographic attestation** tích hợp KMS (condition `kms:RecipientAttestation:ImageSha384`). Dedicated Host chỉ cô lập phần cứng ở mức tenancy; CloudHSM lưu key nhưng không phải môi trường tính toán cho ứng dụng; Macie phát hiện PII trong S3.
</details>

**Câu 21.** Để upload object vào bucket mã hoá SSE-KMS bằng customer managed key, IAM role cần những quyền nào?

- A. `s3:PutObject` và `kms:Decrypt`
- B. `s3:PutObject` và `kms:GenerateDataKey`
- C. `s3:PutObject` và `kms:Encrypt`
- D. Chỉ `s3:PutObject`

<details><summary>Đáp án</summary>

**B.** Khi upload, S3 gọi `GenerateDataKey` để lấy DEK cho object. Download cần `kms:Decrypt`; multipart upload cần cả hai.
</details>

**Câu 22.** Bạn bật automatic rotation cho một symmetric customer managed key. Điều gì đúng?

- A. Key ID thay đổi, cần cập nhật ứng dụng
- B. Dữ liệu cũ phải được mã hoá lại thủ công
- C. Key ID/ARN giữ nguyên; KMS giữ key material cũ để giải mã dữ liệu cũ, mã hoá mới dùng material mới
- D. Key cũ bị xoá ngay sau khi rotate

<details><summary>Đáp án</summary>

**C.** Automatic rotation chỉ thêm backing key material mới, giữ nguyên key ID/ARN/alias; ciphertext cũ vẫn giải mã được. Việc đổi key ID chỉ xảy ra khi bạn rotate **thủ công** (tạo key mới + đổi alias), ví dụ với imported key material.
</details>

---

[← Chương 29](ch29-advanced-identity.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chương 31 →](ch31-aws-other-services.md)

