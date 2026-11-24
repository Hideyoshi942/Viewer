# Chương 14 – Amazon S3 Security

> **Nguồn:** 13 video của chương + *Quiz – Amazon S3 Security Quiz*.
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay (2026, kỳ thi hiện là **DVA-C02**).

## Mục tiêu chương

Sau chương này bạn có thể:

- Phân biệt 4 cách mã hoá object trên S3: **SSE-S3**, **SSE-KMS** (và **DSSE-KMS**), **SSE-C**, **Client-Side Encryption**, biết header tương ứng và chọn đúng theo yêu cầu đề bài.
- Hiểu giới hạn **KMS throttling** khi dùng SSE-KMS và cách giảm bằng **S3 Bucket Key**.
- Ép mã hoá **in transit** (HTTPS) và mã hoá **at rest** bằng **bucket policy**; hiểu quan hệ giữa **default encryption** và bucket policy.
- Giải thích **CORS** và cấu hình CORS cho bucket S3.
- Bật **MFA Delete** bằng CLI với tài khoản root.
- Bật **S3 Server Access Logs** và phân tích bằng Athena.
- Tạo và sử dụng **Pre-signed URL** cho download/upload tạm thời.
- Dùng **S3 Access Points** (internet/VPC origin) để quản lý bảo mật ở quy mô lớn và **S3 Object Lambda** để biến đổi object khi đọc.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001, 003 | S3 Encryption | Bài 1 – Mã hoá object trên S3 |
| 004 | S3 Default Encryption | Bài 2 – Default Encryption và Bucket Policy |
| 005–006 | S3 CORS | Bài 3 – S3 CORS |
| 007–008 | S3 MFA Delete | Bài 4 – S3 MFA Delete |
| 009–010 | S3 Access Logs | Bài 5 – S3 Access Logs |
| 011–012 | S3 Pre-signed URLs | Bài 6 – S3 Pre-signed URLs |
| 013 | S3 Access Points | Bài 7 – S3 Access Points |
| 014 | S3 Object Lambda | Bài 8 – S3 Object Lambda |
| Quiz | Amazon S3 Security Quiz | Câu hỏi ôn tập |

---

## Bài 1 – Mã hoá object trên S3

### Lý thuyết

Có **4 phương thức** mã hoá object trên S3:

1. **Server-Side Encryption (SSE)**, gồm:
   - **SSE-S3**: key do Amazon S3 quản lý. **Bật mặc định** cho bucket và object mới.
   - **SSE-KMS**: key do **AWS KMS** quản lý.
   - **SSE-C**: key do **khách hàng cung cấp** (customer-provided).
2. **Client-Side Encryption**: mã hoá ở client trước khi upload.

> Kỳ thi yêu cầu biết **phương thức nào dùng cho tình huống nào**.

#### SSE-S3

- Key do AWS **xử lý, quản lý và sở hữu**. Bạn **không bao giờ truy cập** được key này.
- Object được mã hoá **phía server** bởi AWS, thuật toán **AES-256**.
- Header: **`"x-amz-server-side-encryption": "AES256"`**.
- **Bật mặc định** cho bucket mới và object mới.
- Luồng: user upload file (kèm header) → S3 ghép object với **S3-owned key** → mã hoá → lưu vào bucket.

#### SSE-KMS

- Bạn tự quản lý key bằng **KMS (Key Management Service)** thay vì dùng key của S3.
- Ưu điểm:
  - **Kiểm soát key**: tự tạo key trong KMS, quản lý quyền sử dụng, chính sách rotation.
  - **Audit**: mọi lần dùng key đều được ghi vào **CloudTrail**.
- Header: **`"x-amz-server-side-encryption": "aws:kms"`** (kèm ID key KMS muốn dùng).
- Để **đọc** object, bạn cần quyền **trên object** **và** quyền **trên KMS key** đã dùng để mã hoá → thêm một lớp bảo mật.

**Giới hạn của SSE-KMS (đề hay hỏi):**

- Upload → S3 gọi KMS API **`GenerateDataKey`**; download → S3 gọi **`Decrypt`**.
- Mỗi lần gọi **tính vào quota KMS** (số request/giây). Theo video: **5.000 – 30.000 request/giây tuỳ region**, có thể xin tăng qua **Service Quotas console**.
- Bucket **throughput rất cao** mà mọi object mã hoá bằng KMS → có thể bị **throttling**.

#### DSSE-KMS

- **Dual-layer SSE-KMS**: mã hoá **hai lớp** bằng KMS, "KMS mạnh hơn". Chỉ cần biết tên (dùng cho yêu cầu compliance cần 2 lớp mã hoá).

#### SSE-C

- Key được quản lý **bên ngoài AWS**, nhưng vẫn là **server-side encryption** vì bạn **gửi key cho AWS**.
- S3 **không bao giờ lưu** key bạn cung cấp; dùng xong là **huỷ**.
- **Bắt buộc HTTPS** (vì key đi qua mạng).
- Key phải được truyền trong **HTTP header** ở **mọi request** (cả upload lẫn download).
- Để đọc lại file, user phải cung cấp **đúng key** đã dùng để mã hoá.

#### Client-Side Encryption

- Dễ cài đặt hơn khi dùng thư viện như **Amazon S3 Client-Side Encryption Library**.
- Client **tự mã hoá** dữ liệu **trước khi gửi** lên S3, và **tự giải mã** sau khi tải về, **bên ngoài S3**.
- Client **quản lý hoàn toàn key và vòng đời mã hoá**. AWS không biết key và không giải mã được dữ liệu.

#### Bảng so sánh

| | SSE-S3 | SSE-KMS | SSE-C | Client-Side |
|---|---|---|---|---|
| Ai mã hoá | S3 (server) | S3 (server) | S3 (server) | **Client** |
| Ai quản lý key | AWS (S3) | **AWS KMS** (bạn kiểm soát key, rotation, quyền) | **Khách hàng**, ngoài AWS | **Khách hàng** |
| Key lưu ở AWS? | Có | Có | **Không** (dùng xong huỷ) | **Không** |
| Header | `x-amz-server-side-encryption: AES256` | `x-amz-server-side-encryption: aws:kms` | `x-amz-server-side-encryption-customer-algorithm`, `-customer-key`, `-customer-key-MD5` | Không cần |
| Audit qua CloudTrail | Không (theo key) | **Có** | Không | Không |
| HTTPS bắt buộc | Không (nên dùng) | Không (nên dùng) | **Bắt buộc** | Không (nên dùng) |
| Làm trên Console | Có | Có | **Không** (chỉ CLI/SDK/API) | Không |
| Lưu ý | Mặc định | **KMS quota/throttling** | Phải gửi key mỗi request | Tự lo toàn bộ |

#### Mã hoá in transit (in flight)

- Còn gọi là **SSL/TLS**. S3 có 2 endpoint:
  - **HTTP**: không mã hoá.
  - **HTTPS**: mã hoá in flight.
- **Khuyến nghị dùng HTTPS**; với **SSE-C bắt buộc HTTPS**. Thực tế hầu hết client dùng HTTPS mặc định.
- **Ép buộc HTTPS** bằng bucket policy: **Deny** `s3:GetObject` khi **`"aws:SecureTransport": "false"`** (HTTP → `false`, HTTPS → `true`).

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ForceSSLOnlyAccess",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-bucket/*",
      "Condition": { "Bool": { "aws:SecureTransport": "false" } }
    }
  ]
}
```

### Kiến thức thực tế

- **Mốc thời gian quan trọng:**
  - Từ **5/1/2023**, S3 **tự động mã hoá SSE-S3** cho **mọi object mới** (không tắt được "không mã hoá"). Câu hỏi cũ kiểu "làm sao để object được mã hoá" giờ có đáp án "**không cần làm gì**".
  - **DSSE-KMS** ra mắt giữa 2023 (video có nhắc).
  - Từ **4/2023**, bucket mới mặc định **Block Public Access bật** và **Object Ownership = Bucket owner enforced (ACL bị tắt)**.
- **Quyền IAM khi dùng SSE-KMS** (lỗi `AccessDenied` hay gặp):
  - Upload cần `s3:PutObject` **và** `kms:GenerateDataKey` trên key.
  - Download cần `s3:GetObject` **và** `kms:Decrypt` trên key.
  - Với **customer managed key**, key policy cũng phải cho phép principal đó.
- **Quota KMS**: video nêu 5.000–30.000 req/s; con số hiện tại khác nhau theo region và loại thao tác, hãy xem **Service Quotas → AWS KMS** của region bạn dùng. Lỗi throttling từ KMS trả về `ThrottlingException` / HTTP 503 `SlowDown`.
- **S3 Bucket Key**: S3 tạo một key cấp bucket (tồn tại ngắn hạn) từ KMS rồi dùng nó để sinh data key cho từng object → **giảm mạnh số lần gọi KMS** (AWS công bố giảm chi phí request KMS tới 99%). Trade-off: CloudTrail log của KMS sẽ ghi theo **bucket ARN** thay vì từng object ARN.
- **Key `aws/s3` (AWS managed)** không chia sẻ cross-account được. Muốn tài khoản khác đọc object SSE-KMS thì phải dùng **customer managed key** và cấp quyền trong key policy.
- **Client-side encryption** thực tế: dùng **Amazon S3 Encryption Client** (Java, .NET, Go, C++, Ruby, PHP…) hoặc **AWS Encryption SDK** (envelope encryption với KMS). Ví dụ đơn giản bằng Python (minh hoạ nguyên lý, key do bạn tự quản lý):

  ```python
  import os, boto3
  from cryptography.hazmat.primitives.ciphers.aead import AESGCM

  key = AESGCM.generate_key(bit_length=256)    # lưu key ở nơi bạn kiểm soát, KHÔNG gửi lên AWS
  nonce = os.urandom(12)
  ciphertext = AESGCM(key).encrypt(nonce, open("report.pdf", "rb").read(), None)

  s3 = boto3.client("s3")
  s3.put_object(Bucket="my-bucket", Key="report.pdf.enc", Body=nonce + ciphertext)

  blob = s3.get_object(Bucket="my-bucket", Key="report.pdf.enc")["Body"].read()
  plaintext = AESGCM(key).decrypt(blob[:12], blob[12:], None)
  ```

- **Ép HTTPS cho mọi thao tác** (khuyến nghị thực tế, rộng hơn ví dụ trong video): Deny `s3:*` trên cả bucket và object khi `aws:SecureTransport = false`. Có thể thêm điều kiện `s3:TlsVersion` để yêu cầu TLS tối thiểu 1.2.

  ```json
  {
    "Effect": "Deny",
    "Principal": "*",
    "Action": "s3:*",
    "Resource": ["arn:aws:s3:::my-bucket", "arn:aws:s3:::my-bucket/*"],
    "Condition": { "Bool": { "aws:SecureTransport": "false" } }
  }
  ```

### Ghi nhớ cho kỳ thi

- **SSE-S3**: key AWS quản lý, AES-256, header `AES256`, **mặc định**.
- **SSE-KMS**: kiểm soát key + **rotation**, audit **CloudTrail**, header `aws:kms`; có thể bị **KMS throttling** (`GenerateDataKey`/`Decrypt`) → xin tăng quota hoặc bật **Bucket Key**.
- **SSE-C**: key của bạn, **AWS không lưu key**, **bắt buộc HTTPS**, gửi key trong header **mỗi request**, **không làm được trên console**.
- **Client-side**: không tin AWS mã hoá, mã hoá **trong ứng dụng** trước khi upload.
- Ép HTTPS: bucket policy **Deny** khi **`aws:SecureTransport = false`**.

---

## Bài 2 – Default Encryption và Bucket Policy

### Lý thuyết

- Mọi bucket hiện có **default encryption = SSE-S3**, tự áp dụng cho object mới trong bucket mới.
- Có thể **đổi default encryption** sang loại khác, ví dụ **SSE-KMS**.
- Ngoài ra có thể **ép buộc** mã hoá bằng **bucket policy**: từ chối mọi API call `PutObject` **không có đúng header mã hoá** (ví dụ SSE-KMS hoặc SSE-C).
- **Bucket policy luôn được đánh giá TRƯỚC default encryption.**

Ví dụ trong video:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyNonKMSUploads",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::my-bucket/*",
      "Condition": {
        "StringNotEquals": { "s3:x-amz-server-side-encryption": "aws:kms" }
      }
    },
    {
      "Sid": "DenyUploadsWithoutSSEC",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::my-bucket/*",
      "Condition": {
        "Null": { "s3:x-amz-server-side-encryption-customer-algorithm": "true" }
      }
    }
  ]
}
```

- Statement 1: `PutObject` mà header mã hoá **không phải `aws:kms`** → **Deny**.
- Statement 2: `PutObject` mà **không có header SSE-C** (`...-customer-algorithm` là null) → **Deny**.
- (Trong thực tế bạn chỉ chọn **một** trong hai statement tuỳ yêu cầu; để cả hai thì gần như không upload được gì.)

### Kiến thức thực tế

- **Cẩn thận khi dùng statement 1**: client upload **không gửi header** (dựa vào default encryption của bucket) cũng bị **Deny**, vì bucket policy được đánh giá trước. Nếu chỉ muốn "mọi object đều dùng SSE-KMS", cách đơn giản hơn là **đặt default encryption = SSE-KMS** và không cần policy.
- **Ép dùng đúng một KMS key** cụ thể:

  ```json
  {
    "Effect": "Deny",
    "Principal": "*",
    "Action": "s3:PutObject",
    "Resource": "arn:aws:s3:::my-bucket/*",
    "Condition": {
      "StringNotEqualsIfExists": {
        "s3:x-amz-server-side-encryption-aws-kms-key-id": "arn:aws:kms:ap-southeast-1:123456789012:key/1111aaaa-22bb-33cc-44dd-5555eeee6666"
      }
    }
  }
  ```

- Đổi default encryption **không mã hoá lại** các object cũ. Muốn mã hoá lại hàng loạt object cũ thì dùng **S3 Batch Operations** (copy object) hoặc copy đè từng object.
- Trên CLI, xem default encryption: `aws s3api get-bucket-encryption --bucket my-bucket`.

### Ghi nhớ cho kỳ thi

- Muốn mọi file mã hoá mặc định → **không cần làm gì** (SSE-S3 tự động cho object mới).
- Muốn ép loại mã hoá cụ thể → **bucket policy** Deny `PutObject` khi thiếu header; hoặc đổi **default encryption**.
- **Bucket policy được đánh giá trước default encryption.**
- Policy ép HTTPS chỉ mã hoá **in flight**, không phải **at rest**.

---

## Bài 3 – S3 CORS

### Lý thuyết

- **CORS = Cross-Origin Resource Sharing**. Kỳ thi thường có **một câu** về CORS.
- **Origin** = **scheme (protocol) + host (domain) + port**.
  - Ví dụ `https://www.example.com`: scheme `https`, host `www.example.com`, port ngầm định **443**.
- **Cùng origin** khi cùng scheme, host và port: `http://example.com/app1` và `http://example.com/app2` là cùng origin.
- **Khác origin**: `http://www.example.com` và `http://other.example.com`.
- CORS là **cơ chế bảo mật của trình duyệt (web browser)**: khi đang ở origin chính, trình duyệt chỉ cho phép request sang origin khác **nếu origin kia cho phép** thông qua **CORS headers**, ví dụ **`Access-Control-Allow-Origin`**.

#### Luồng hoạt động

1. Trình duyệt gửi HTTPS request tới **origin** `https://www.example.com`, nhận `index.html`.
2. `index.html` yêu cầu tải thêm tài nguyên (ảnh…) từ **cross-origin** `https://www.other.com`.
3. Trình duyệt gửi **preflight request** (`OPTIONS`) tới cross-origin, kèm header `Origin: https://www.example.com`.
4. Nếu cross-origin được cấu hình CORS, nó trả về **CORS headers**: `Access-Control-Allow-Origin: https://www.example.com`, `Access-Control-Allow-Methods: GET, PUT, DELETE`.
5. Trình duyệt hài lòng → gửi request thật để lấy tài nguyên.

#### Áp dụng cho S3

- Client gửi **cross-origin request** tới bucket S3 → bucket phải có **CORS headers** phù hợp. **Câu hỏi rất phổ biến.**
- Có thể cho phép **một origin cụ thể** hoặc **`*`** (mọi origin).
- Ví dụ: bucket `my-bucket-html` (static website) chứa `index.html`; ảnh nằm ở bucket khác `my-bucket-assets` (cũng là static website). Trình duyệt tải `index.html` từ bucket 1, rồi lấy `images/coffee.gif` từ bucket 2 với `Origin` = URL bucket 1. **Bucket 2** phải cấu hình CORS cho phép origin của bucket 1, nếu không request bị chặn.

> **CORS được cấu hình trên bucket ĐÍCH** (bucket chứa tài nguyên được gọi cross-origin), không phải bucket gốc.

### Kiến thức thực tế

- **CORS chỉ là cơ chế của trình duyệt.** Gọi bằng `curl`, Postman, SDK phía server **không bị CORS chặn**. Vì vậy dấu hiệu nhận biết lỗi CORS là: mở URL file trực tiếp **chạy được**, nhưng tải từ trang web **domain khác** thì **không**.
- **Upload trực tiếp từ trình duyệt lên S3** (thường kết hợp pre-signed URL ở Bài 6) cần CORS cho `PUT`/`POST`, và thường phải `ExposeHeaders: ["ETag"]` để JavaScript đọc được ETag (cần cho multipart upload).

  ```json
  [
    {
      "AllowedOrigins": ["https://app.example.com"],
      "AllowedMethods": ["PUT", "POST", "GET"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
  ```

- **Lỗi hay gặp:**
  - Thừa dấu `/` cuối trong `AllowedOrigins` hoặc sai `http`/`https` → không khớp origin.
  - Cấu hình CORS ở bucket **gốc** thay vì bucket **đích**.
  - Dùng **CloudFront** phía trước S3 nhưng không forward header `Origin` (cần dùng origin request policy *CORS-S3Origin* và response headers policy phù hợp) → CORS header bị cache sai.
- Tránh `"AllowedOrigins": ["*"]` cho dữ liệu nhạy cảm; liệt kê origin cụ thể.
- **Từ 4/2023**, bucket mới bật **Block Public Access** mặc định → muốn làm static website public như lab phải chủ động tắt nó. Thực tế nên dùng **CloudFront + Origin Access Control (OAC)** thay vì public bucket.
- Định dạng website endpoint khác nhau theo region: `bucket.s3-website-<region>.amazonaws.com` (dấu gạch) hoặc `bucket.s3-website.<region>.amazonaws.com` (dấu chấm). Hãy copy từ console.

### Ghi nhớ cho kỳ thi

- Origin = **scheme + host + port**.
- CORS là **bảo mật của trình duyệt**; header **`Access-Control-Allow-Origin`**.
- File mở trực tiếp được nhưng website **domain khác** tải không được → **CORS sai** (không phải bucket policy, IAM, encryption).
- Cấu hình CORS trên **bucket được gọi tới** (cross-origin), cho phép origin cụ thể hoặc `*`.

---

## Bài 4 – S3 MFA Delete

### Lý thuyết

- **MFA (Multi-Factor Authentication)** buộc user nhập **mã sinh trên thiết bị** (app Google Authenticator… hoặc thiết bị MFA phần cứng) trước khi làm thao tác quan trọng trên S3.

| MFA **bắt buộc** khi | MFA **không cần** khi |
|---|---|
| **Xoá vĩnh viễn một object version** | **Bật** Versioning |
| **Suspend Versioning** trên bucket | **Liệt kê** các version đã xoá |

- **Điều kiện tiên quyết:** phải **bật Versioning** trên bucket.
- **Chỉ bucket owner (tài khoản root)** mới bật/tắt được MFA Delete.
- MFA Delete là lớp bảo vệ thêm chống **xoá vĩnh viễn** object version (do vô tình hoặc cố ý).

### Kiến thức thực tế

- **MFA Delete không dùng được cùng Lifecycle configuration** trên bucket đó (S3 không cho lifecycle xoá version khi bật MFA Delete). Đây là lý do nhiều tổ chức ít dùng MFA Delete.
- Thay thế hiện đại để chống xoá/sửa: **S3 Object Lock** (mô hình WORM, *Governance*/*Compliance mode*, *Legal Hold*) – có thể bật cho bucket đã tồn tại, không cần root; kết hợp **AWS Backup cho S3**.
- Có thể **hạn chế xoá version** bằng bucket policy/IAM: Deny `s3:DeleteObjectVersion` và `s3:PutBucketVersioning` cho các principal không cần thiết.
- Sau khi bật, mọi request xoá vĩnh viễn phải kèm header `x-amz-mfa` → **phải qua HTTPS**.

### Ghi nhớ cho kỳ thi

- Chống **xoá vĩnh viễn ngoài ý muốn** trên bucket có versioning → **MFA Delete**.
- MFA cần cho: **xoá vĩnh viễn object version**, **suspend versioning**. Không cần cho: bật versioning, liệt kê version.
- Cần **versioning bật**; **chỉ root** bật/tắt được, **chỉ qua CLI/API**.

---

## Bài 5 – S3 Access Logs

### Lý thuyết

- Phục vụ **audit**: ghi lại **mọi request** tới bucket S3, từ **bất kỳ tài khoản** nào, **được phép hay bị từ chối**.
- Log được ghi thành **file vào một bucket S3 khác** (logging bucket).
- Phân tích bằng công cụ như **Amazon Athena**.
- **Logging bucket phải cùng AWS region** với bucket nguồn.
- Log có **định dạng riêng** (xem tài liệu *Amazon S3 server access log format*).

> **Cảnh báo:** **Không bao giờ** đặt logging bucket **trùng** với bucket đang được giám sát. Mỗi lần ghi log là một `PutObject` → lại sinh log → **vòng lặp vô hạn**, bucket phình to theo cấp số nhân, **tốn rất nhiều tiền**.

### Kiến thức thực tế

- **Phân tích bằng Athena**: tạo bảng theo DDL mẫu trong tài liệu AWS (*"Querying Amazon S3 server access logs"*, dùng `RegexSerDe`), rồi truy vấn, ví dụ tìm ai bị từ chối truy cập:

  ```sql
  SELECT requestdatetime, requester, remoteip, operation, key, httpstatus, errorcode
  FROM s3_access_logs_db.mybucket_logs
  WHERE httpstatus = '403'
  ORDER BY requestdatetime DESC
  LIMIT 100;
  ```

- Server access log được giao theo kiểu **best effort**: hầu hết bản ghi đến trong vài giờ, nhưng **không đảm bảo** đầy đủ hay kịp thời. Cần audit chặt chẽ, gần thời gian thực → dùng **CloudTrail data events** cho S3 (tốn phí theo số event).

  | | S3 Server Access Logs | CloudTrail Data Events |
  |---|---|---|
  | Phí | Chỉ trả phí lưu trữ log | Trả theo số event |
  | Độ đầy đủ | Best effort | Đảm bảo hơn, có độ trễ thấp |
  | Thông tin | Chi tiết request (bytes, thời gian xử lý, referrer…) | Danh tính IAM chi tiết, tích hợp EventBridge |

- Logging bucket nên: **cùng region và cùng account**, **không bật default encryption SSE-KMS** (log delivery chỉ hỗ trợ đích mã hoá SSE-S3), đặt **Lifecycle rule** để chuyển lớp lưu trữ/xoá log cũ.
- Với **Object Ownership = Bucket owner enforced** (mặc định từ 4/2023), quyền ghi log phải cấp bằng **bucket policy** (như trên); cách cũ dùng ACL *S3 Log Delivery group* không còn hoạt động.

### Ghi nhớ cho kỳ thi

- Audit mọi truy cập (kể cả bị từ chối) **mà người dùng không biết** → **S3 Access Logs + Athena**.
- Logging bucket **cùng region**, **khác bucket nguồn** (tránh vòng lặp vô hạn).

---

## Bài 6 – S3 Pre-signed URLs

### Lý thuyết

- URL được tạo bằng **S3 Console, CLI hoặc SDK**, có **thời hạn**:
  - **Console**: tối đa **12 giờ**.
  - **CLI/SDK**: tối đa **168 giờ (7 ngày)**.
- Người nhận URL **kế thừa quyền của người tạo URL** cho thao tác **GET** hoặc **PUT**.
- **Use case:** bucket **private**, muốn cho người ngoài AWS truy cập **một file** trong thời gian ngắn mà **không public** file/bucket.
  1. Bucket owner/user tạo pre-signed URL cho file.
  2. URL "mang theo" credentials của người tạo (về mặt quyền truy cập file).
  3. Gửi URL cho người cần truy cập.
  4. Người đó dùng URL để tải file (hoặc upload).
- **Ví dụ:**
  - Chỉ user đã đăng nhập mới **tải video premium** từ bucket.
  - Cho **danh sách user thay đổi liên tục** tải file bằng cách sinh URL động.
  - Cho user **upload tạm thời** một file vào **vị trí chính xác** trong bucket mà bucket vẫn **private**.

### Kiến thức thực tế

**Tạo URL download và upload bằng SDK (Python):**

```python
import boto3
from botocore.config import Config

s3 = boto3.client("s3", region_name="eu-west-1", config=Config(signature_version="s3v4"))

# URL download, hết hạn sau 5 phút
get_url = s3.generate_presigned_url(
    "get_object",
    Params={"Bucket": "my-bucket", "Key": "videos/premium.mp4"},
    ExpiresIn=300,
)

# URL upload vào đúng một key, hết hạn sau 10 phút
put_url = s3.generate_presigned_url(
    "put_object",
    Params={"Bucket": "my-bucket", "Key": "uploads/user-42/avatar.png", "ContentType": "image/png"},
    ExpiresIn=600,
)
```

```bash
# Phía client upload bằng URL (không cần credentials AWS)
curl -X PUT -H "Content-Type: image/png" --upload-file avatar.png "$PUT_URL"
```

**Node.js (SDK v3):**

```javascript
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: "eu-west-1" });
const getUrl = await getSignedUrl(s3, new GetObjectCommand({ Bucket: "my-bucket", Key: "coffee.jpg" }), { expiresIn: 300 });
const putUrl = await getSignedUrl(s3, new PutObjectCommand({ Bucket: "my-bucket", Key: "uploads/a.png" }), { expiresIn: 600 });
```

- **URL hết hạn sớm hơn dự kiến**: pre-signed URL **không thể sống lâu hơn credentials đã ký nó**. Ký bằng credentials tạm thời của IAM Role (EC2, Lambda) thì URL hết hiệu lực khi session token hết hạn (Lambda thường vài giờ), dù `ExpiresIn` đặt 7 ngày. Ký bằng IAM user (long-term key) thì đủ 7 ngày.
- Người tạo URL **phải có quyền** thực hiện thao tác (`s3:GetObject`/`s3:PutObject`). Nếu quyền bị thu hồi, URL đã phát hành cũng không còn dùng được.
- Object mã hoá **SSE-KMS**: người tạo URL cũng cần quyền KMS tương ứng.
- **Upload từ trình duyệt** bằng pre-signed URL cần **CORS** trên bucket (Bài 3). Muốn giới hạn kích thước/loại file khi upload → dùng **`generate_presigned_post`** với *conditions* (ví dụ `content-length-range`).
- Pre-signed URL dùng chữ ký **SigV4** dạng query string (`X-Amz-Signature`), đã học ở chương 12.
- Phân phối nội dung trả phí cho nhiều user ở quy mô lớn → cân nhắc **CloudFront signed URL/signed cookies**.

### Ghi nhớ cho kỳ thi

- Cấp quyền **tạm thời** download/upload **một object** cho user ngoài AWS / danh sách user thay đổi liên tục, bucket vẫn private → **Pre-signed URL**.
- Thời hạn: console tối đa **12 giờ**, CLI/SDK tối đa **168 giờ**.
- Người dùng URL **kế thừa quyền của người tạo** (GET/PUT).
- Federated users không nên có IAM user riêng; bucket policy không xử lý được danh sách user động.

---

## Bài 7 – S3 Access Points

### Lý thuyết

- **Vấn đề:** một bucket chứa nhiều loại dữ liệu (`/finance/…`, `/sales/…`) với nhiều nhóm user. Nếu nhồi tất cả vào **một bucket policy**, policy sẽ phình to và **khó quản lý** theo thời gian.
- **Giải pháp – S3 Access Points:**
  - **Finance Access Point** + access point policy: cấp **read/write** cho prefix **`/finance`**.
  - **Sales Access Point** + policy riêng: cấp **read/write** cho prefix **`/sales`**.
  - **Analytics Access Point** + policy riêng: cấp **read-only** cho **cả `/finance` và `/sales`**.
- Quản lý bảo mật được **chuyển từ bucket policy sang các access point**, mỗi access point có bảo mật riêng. User có quyền IAM phù hợp sẽ truy cập **đúng access point** và chỉ thấy phần dữ liệu tương ứng.
- Kết quả: **bucket policy đơn giản**, mỗi access point có policy riêng → **scale** việc truy cập bucket dễ dàng.

**Tóm tắt đặc điểm:**

- **Đơn giản hoá quản lý bảo mật** cho bucket S3.
- Mỗi access point có **DNS name riêng** (cách kết nối tới access point).
- **Network origin**: **Internet** hoặc **VPC** (traffic private).
- **Access point policy** giống bucket policy → quản lý bảo mật ở quy mô lớn.

#### VPC Origin

- Access point có thể chỉ cho phép truy cập **private từ VPC**: ví dụ EC2 trong VPC truy cập bucket qua access point **không đi qua internet**.
- Phải tạo **VPC Endpoint** (Gateway hoặc Interface endpoint cho S3) để truy cập access point.
- **VPC Endpoint Policy** phải **cho phép truy cập cả bucket đích và access point**.
- → Có **3 lớp bảo mật**: VPC endpoint policy, access point policy, bucket policy.

### Kiến thức thực tế

**Tạo access point và policy (CLI):**

```bash
ACCOUNT=123456789012
aws s3control create-access-point --account-id $ACCOUNT --name finance-ap --bucket my-company-data
# Access point chỉ cho VPC:
aws s3control create-access-point --account-id $ACCOUNT --name analytics-vpc-ap \
  --bucket my-company-data --vpc-configuration VpcId=vpc-0abc1234

aws s3control put-access-point-policy --account-id $ACCOUNT --name finance-ap --policy file://finance-ap-policy.json
```

`finance-ap-policy.json` – nhóm Finance đọc/ghi prefix `finance/`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "AWS": "arn:aws:iam::123456789012:role/FinanceTeam" },
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:eu-west-1:123456789012:accesspoint/finance-ap/object/finance/*"
    }
  ]
}
```

**Bucket policy "uỷ quyền" cho access point** (cách AWS khuyến nghị để bucket policy luôn đơn giản):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "AWS": "*" },
      "Action": "*",
      "Resource": ["arn:aws:s3:::my-company-data", "arn:aws:s3:::my-company-data/*"],
      "Condition": { "StringEquals": { "s3:DataAccessPointAccount": "123456789012" } }
    }
  ]
}
```

**Truy cập qua access point** (dùng ARN hoặc **alias** của access point thay cho tên bucket):

```bash
aws s3api get-object --bucket arn:aws:s3:eu-west-1:123456789012:accesspoint/finance-ap \
  --key finance/2026-q3.csv q3.csv
aws s3 ls s3://finance-ap-xxxxxxxxxxxxxxxxxxxx-s3alias/finance/   # dùng alias
```

```python
boto3.client("s3").get_object(
    Bucket="arn:aws:s3:eu-west-1:123456789012:accesspoint/finance-ap",
    Key="finance/2026-q3.csv")
```

- Quyền cuối cùng = **giao** của IAM policy, access point policy và bucket policy (mọi lớp đều phải cho phép; một Deny ở bất kỳ đâu là bị chặn).
- Access point có **Block Public Access riêng** (bật mặc định).
- Access point VPC-only **không truy cập được từ internet**, kể cả console (console chạy ngoài VPC của bạn).

### Ghi nhớ cho kỳ thi

- Nhiều nhóm truy cập các prefix khác nhau của một bucket, bucket policy quá phức tạp → **S3 Access Points**.
- Mỗi access point: **DNS name riêng**, **policy riêng**, origin **Internet hoặc VPC**.
- VPC origin cần **VPC Endpoint**, endpoint policy cho phép **cả access point và bucket**.

---

## Bài 8 – S3 Object Lambda

### Lý thuyết

- Mục đích: **sửa đổi object ngay trước khi ứng dụng gọi lấy về**, thay vì **nhân bản bucket** để giữ nhiều phiên bản khác nhau của mỗi object.
- Cần dùng **S3 Access Points** (Bài 7) làm nền.

**Kiến trúc trong video:**

| Ứng dụng | Truy cập qua | Kết quả |
|---|---|---|
| **E-commerce** (chủ dữ liệu) | **Trực tiếp bucket S3** | Ghi/đọc **object gốc** |
| **Analytics** | **S3 Object Lambda Access Point** → **Lambda redact** → **S3 Access Point** → bucket | **Object đã bị lược bỏ** dữ liệu (redacted) |
| **Marketing** | **S3 Object Lambda Access Point** → **Lambda enrich** (tra cứu **Customer Loyalty Database**) → S3 Access Point → bucket | **Object đã được làm giàu** (enriched) |

- Luồng: ứng dụng gọi **Object Lambda Access Point** → gọi **Lambda function** → Lambda lấy dữ liệu từ bucket (qua access point), chạy code biến đổi → trả object đã biến đổi về ứng dụng.
- **Chỉ cần một bucket S3**, tạo nhiều access point + Object Lambda để biến đổi dữ liệu theo nhu cầu.

**Use cases:**

- **Lược bỏ PII** (personally identifiable information) cho môi trường analytics hoặc non-production.
- **Chuyển đổi định dạng**, ví dụ **XML → JSON**.
- Biến đổi bất kỳ: **resize ảnh**, **đóng watermark động** theo **user đang yêu cầu** object.

### Kiến thức thực tế

**Lambda function cho Object Lambda (Python) – lược bỏ email:**

```python
import re
import urllib.request
import boto3

s3 = boto3.client("s3")

def lambda_handler(event, context):
    ctx = event["getObjectContext"]
    # URL pre-signed để Lambda đọc object gốc qua supporting access point
    original = urllib.request.urlopen(ctx["inputS3Url"]).read().decode("utf-8")

    redacted = re.sub(r"[\w.+-]+@[\w-]+\.[\w.]+", "***@***", original)

    # Trả object đã biến đổi về cho ứng dụng gọi GetObject
    s3.write_get_object_response(
        Body=redacted.encode("utf-8"),
        RequestRoute=ctx["outputRoute"],
        RequestToken=ctx["outputToken"],
    )
    return {"statusCode": 200}
```

- Lambda cần quyền **`s3-object-lambda:WriteGetObjectResponse`** (managed policy `AmazonS3ObjectLambdaExecutionRolePolicy`).
- Ứng dụng gọi `GetObject` bình thường, chỉ thay tên bucket bằng **ARN của Object Lambda Access Point**:

  ```python
  boto3.client("s3").get_object(
      Bucket="arn:aws:s3-object-lambda:eu-west-1:123456789012:accesspoint/analytics-redacted",
      Key="customers/orders.json")
  ```

- Object Lambda hỗ trợ biến đổi các thao tác `GetObject`, `HeadObject`, `ListObjects`/`ListObjectsV2`.
- Chi phí: trả phí Lambda + phí Object Lambda theo request và dữ liệu trả về.
- **Tình trạng dịch vụ (cập nhật):** theo trang *AWS Product Lifecycle*, từ **11/2025** S3 Object Lambda **không còn mở cho khách hàng mới** (khách hàng đang dùng vẫn tiếp tục dùng được). Với hệ thống mới, cách thay thế thường gặp là đặt **API Gateway/Lambda** hoặc **CloudFront + Lambda@Edge/CloudFront Functions** phía trước S3 để biến đổi dữ liệu, hoặc tiền xử lý tạo bản sao đã biến đổi. Hãy kiểm tra tài liệu chính thức trước khi thiết kế. Khái niệm này vẫn có thể xuất hiện trong đề thi.

### Ghi nhớ cho kỳ thi

- Biến đổi object **khi đọc** (redact PII, XML → JSON, resize, watermark theo user) **mà không nhân bản dữ liệu** → **S3 Object Lambda**.
- Cần **S3 Access Point** + **Lambda function** + **Object Lambda Access Point**.

---

## Tổng kết chương

| Chủ đề | Điều cần nhớ |
|---|---|
| SSE-S3 | Mặc định (từ 1/2023), AES-256, header `AES256`, key AWS quản lý |
| SSE-KMS | Header `aws:kms`, kiểm soát key/rotation, audit CloudTrail, cần quyền KMS, có thể bị **KMS throttling** → Bucket Key / tăng quota |
| DSSE-KMS | Mã hoá 2 lớp bằng KMS |
| SSE-C | Key của khách hàng, AWS không lưu, **bắt buộc HTTPS**, gửi key mỗi request, chỉ CLI/SDK |
| Client-side | Client tự mã hoá/giải mã, AWS không biết key |
| In transit | Ép HTTPS: Deny khi `aws:SecureTransport = false` |
| Default encryption | SSE-S3 mặc định, đổi được; bucket policy ép header được đánh giá **trước** default encryption |
| CORS | Bảo mật của trình duyệt; origin = scheme + host + port; cấu hình trên bucket đích; `Access-Control-Allow-Origin` |
| MFA Delete | Cần versioning; chỉ root, chỉ CLI; bắt buộc MFA khi xoá vĩnh viễn version / suspend versioning |
| Access Logs | Ghi mọi request (kể cả bị từ chối) vào bucket khác **cùng region**; phân tích bằng Athena; không log vào chính nó |
| Pre-signed URL | Quyền tạm thời GET/PUT; console ≤ 12h, CLI/SDK ≤ 168h; kế thừa quyền người tạo |
| Access Points | Policy riêng cho từng nhóm/prefix, DNS riêng, origin Internet/VPC (cần VPC endpoint) |
| Object Lambda | Lambda biến đổi object khi đọc qua Object Lambda Access Point; không mở cho khách hàng mới từ 11/2025 |

---

## Câu hỏi ôn tập

*Nguồn: Quiz – Amazon S3 Security Quiz. Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Khách hàng muốn file được mã hoá trên S3, nhưng muốn **tự quản lý hoàn toàn key mã hoá** và **không bao giờ lưu key trên AWS**. Bạn khuyến nghị dùng ......

- A. SSE-S3
- B. SSE-KMS
- C. SSE-C
- D. Client-Side Encryption

<details><summary>Đáp án</summary>

**C. SSE-C.** Với SSE-C, việc mã hoá diễn ra trên AWS nhưng bạn toàn quyền kiểm soát key, và S3 huỷ key ngay sau khi dùng. SSE-S3 và SSE-KMS đều lưu key trên AWS. Client-Side Encryption cũng đáp ứng việc tự quản lý key, nhưng khi đó bạn phải tự mã hoá; đề chỉ yêu cầu "mã hoá xảy ra trên S3" nên đáp án theo đề là SSE-C.
</details>

**Câu 2.** Công ty muốn dữ liệu trên S3 được mã hoá. Họ không ngại key được AWS lưu và quản lý, nhưng muốn **giữ quyền kiểm soát chính sách rotation** của key. Bạn khuyến nghị dùng ......

- A. SSE-S3
- B. SSE-KMS
- C. SSE-C
- D. Client-Side Encryption

<details><summary>Đáp án</summary>

**B. SSE-KMS.** Mã hoá diễn ra trên AWS, key do AWS (KMS) lưu và quản lý, nhưng bạn toàn quyền kiểm soát chính sách rotation. SSE-S3 không cho bạn quản lý key. SSE-C và Client-Side cho phép tự định rotation nhưng trái yêu cầu "key phải do AWS lưu và quản lý".
</details>

**Câu 3.** Công ty bạn **không tin tưởng AWS** trong quá trình mã hoá và muốn việc mã hoá diễn ra **trong ứng dụng**. Bạn khuyến nghị dùng ......

- A. SSE-S3
- B. SSE-KMS
- C. SSE-C
- D. Client-Side Encryption

<details><summary>Đáp án</summary>

**D. Client-Side Encryption.** Bạn tự mã hoá và gửi dữ liệu đã mã hoá lên AWS; AWS không biết key và không thể giải mã dữ liệu. A, B, C đều là mã hoá phía server (AWS thực hiện mã hoá).
</details>

**Câu 4.** Website của bạn tải file từ một bucket S3. Khi mở trực tiếp URL của file trên Chrome thì chạy được, nhưng khi truy cập một website ở **domain khác** cố tải các file này thì không được. Vấn đề là gì?

- A. Bucket policy sai
- B. IAM policy sai
- C. Encryption sai
- D. CORS sai

<details><summary>Đáp án</summary>

**D.** CORS (Cross-Origin Resource Sharing) định nghĩa cách ứng dụng web được tải từ một domain tương tác với tài nguyên ở domain khác. Nếu bucket policy, IAM policy hoặc encryption sai thì file sẽ không tải được **trong cả hai trường hợp**, kể cả khi mở trực tiếp.
</details>

**Câu 5.** Phương thức mã hoá S3 nào **bắt buộc** dùng HTTPS khi upload/download object?

- A. SSE-C
- B. SSE-S3
- C. SSE-KMS
- D. Client-Side Encryption

<details><summary>Đáp án</summary>

**A. SSE-C.** Vì key mã hoá được gửi trong HTTP header ở mỗi request, S3 từ chối request SSE-C qua HTTP thường.
</details>

**Câu 6.** Bạn đã bật versioning và muốn thật cẩn trọng khi xoá file trên bucket S3. Nên bật gì để **ngăn xoá vĩnh viễn ngoài ý muốn**?

- A. Dùng bucket policy
- B. Mã hoá file
- C. Bật MFA Delete
- D. Tắt versioning

<details><summary>Đáp án</summary>

**C.** MFA Delete buộc user nhập mã MFA trước khi xoá vĩnh viễn object version, là lớp bảo mật thêm chống xoá nhầm. Bucket policy sẽ chặn xoá hoàn toàn (không phải mục tiêu). Tắt versioning làm mất khả năng khôi phục.
</details>

**Câu 7.** Bạn muốn mọi file trong bucket S3 **được mã hoá mặc định**. Cách tối ưu là gì?

- A. Dùng bucket policy ép kết nối HTTPS
- B. Không cần làm gì, Amazon S3 tự động mã hoá object mới bằng SSE-S3
- C. Bật Versioning

<details><summary>Đáp án</summary>

**B.** Từ 1/2023, S3 tự động mã hoá mọi object mới bằng SSE-S3. Ép HTTPS chỉ mã hoá in-flight, không phải at-rest. Versioning không liên quan đến mã hoá.
</details>

**Câu 8.** Bạn nghi ngờ một số nhân viên cố truy cập file trong bucket S3 mà họ không có quyền. Làm sao xác minh điều này **mà họ không nhận ra**?

- A. Thu hẹp IAM policy của họ và xem CloudTrail logs
- B. Dùng bucket policy
- C. Bật S3 Access Logs và phân tích bằng Athena

<details><summary>Đáp án</summary>

**C.** S3 Access Logs ghi lại mọi request tới bucket (kể cả request bị từ chối), Athena chạy truy vấn serverless trên các file log. Thu hẹp IAM policy hoặc dùng bucket policy chặn truy cập thì nhân viên sẽ nhận ra vì không truy cập được file.
</details>

**Câu 9.** Bạn muốn cung cấp **URL tạm thời** cho một **danh sách federated user ngày càng tăng** để họ **upload file** vào **một vị trí cụ thể** trong bucket S3. Nên dùng gì?

- A. S3 CORS
- B. S3 Pre-Signed URL
- C. S3 Bucket Policies
- D. IAM Users

<details><summary>Đáp án</summary>

**B.** Pre-signed URL là URL tạm thời cấp quyền có thời hạn cho một thao tác (ở đây là `PutObject` vào một key cụ thể). CORS chỉ là cơ chế cho phép truy cập cross-origin trên trình duyệt. Bucket policy không giúp cấp quyền tạm thời cho danh sách user động. Federated user không nên có IAM user.
</details>

---

[← Chương 13](ch13-advanced-amazon-s3.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Chương 15 →](ch15-cloudfront.md)
