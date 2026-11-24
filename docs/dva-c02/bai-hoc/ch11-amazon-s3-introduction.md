# Chương 11 – Amazon S3 Introduction

> **Nguồn:** 13 video của chương + *Amazon S3 Quiz*.
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay (2026, kỳ thi hiện hành là **DVA-C02**).

## Mục tiêu chương

Sau chương này bạn có thể:

- Giải thích các khái niệm nền tảng của Amazon S3: **bucket**, **object**, **key** (prefix + object name), metadata, tags, version ID.
- Nắm quy tắc đặt tên bucket, sự khác nhau giữa **global namespace** và **account regional namespace**.
- Phân biệt **pre-signed URL** và **public URL** của object.
- Bảo mật S3 bằng **IAM policy**, **bucket policy**, ACL và **Block Public Access**; viết bucket policy public-read.
- Bật **static website hosting** cho bucket.
- Dùng **versioning**, hiểu **delete marker** và **permanent delete**.
- Cấu hình **replication** (CRR/SRR) và nắm các lưu ý thi (chỉ object mới, Batch Replication, delete marker, không chaining).
- Phân biệt các **storage class** và tự động chuyển lớp bằng **lifecycle rules**.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001–002 | S3 Overview | Bài 1 – Tổng quan Amazon S3: bucket, object, key |
| 003–004 | S3 Security: Bucket Policy | Bài 2 – Bảo mật S3 và Bucket Policy |
| 005–006 | S3 Website Overview | Bài 3 – Static Website Hosting |
| 007–008 | S3 Versioning | Bài 4 – S3 Versioning |
| 009–011 | S3 Replication, Replication Notes | Bài 5 – S3 Replication (CRR/SRR) |
| 012–013 | S3 Storage Classes Overview | Bài 6 – S3 Storage Classes và Lifecycle |
| Quiz | Amazon S3 Quiz | Câu hỏi ôn tập |

---

## Bài 1 – Tổng quan Amazon S3: bucket, object, key

### Lý thuyết

- Amazon S3 là một trong những **khối xây dựng chính** của AWS, được quảng bá là **lưu trữ mở rộng vô hạn** (infinitely scaling storage). Rất nhiều website và nhiều dịch vụ AWS khác dùng S3 làm nền tảng hoặc để tích hợp.

#### Các use case

| Use case | Ví dụ |
|---|---|
| Backup & storage | File, đĩa, dữ liệu ứng dụng |
| Disaster Recovery | Sao chép dữ liệu sang region khác, nếu region chính sập vẫn còn bản sao |
| Archive | Lưu trữ dài hạn giá rẻ (Glacier), truy xuất sau |
| Hybrid cloud storage | Mở rộng storage on-premises lên cloud |
| Host application / media | Video, hình ảnh… |
| Data lake & big data analytics | Lưu khối lượng lớn dữ liệu để phân tích |
| Software delivery | Phân phối bản cập nhật phần mềm |
| Static website | Host website tĩnh |

- Ví dụ thực tế trong video: **NASDAQ** lưu 7 năm dữ liệu trong **S3 Glacier**; **Cisco** chạy analytics trên dữ liệu trong S3.

#### Bucket

- S3 lưu **object** (file) trong **bucket** (có thể hình dung như "thư mục cấp cao nhất").
- Bucket được **tạo ở một region cụ thể** (region-level). Console S3 có giao diện "global" hiển thị bucket của **mọi region**, nhưng mỗi bucket vẫn thuộc về một region.
- **Đặt tên bucket:**
  - **Global namespace** (cách truyền thống): tên phải **duy nhất toàn cầu** — trên mọi region, mọi account. Ví dụ tên `test` chắc chắn đã có người dùng.
  - **Account regional namespace** (tính năng mới được giới thiệu trong video): cho phép đặt tên tuỳ ý (ví dụ `demo`) và dùng lại cùng tên ở nhiều region/account; AWS **tự thêm hậu tố** gắn với account ID và region nên tên đầy đủ luôn duy nhất. Video cho biết đây là cách được khuyến nghị về sau.
  - Quy tắc đặt tên: **không chữ hoa**, **không dấu gạch dưới** `_`, **không phải dạng địa chỉ IP**, phải **bắt đầu bằng chữ thường hoặc số**, **không bắt đầu bằng `xn--`**, **không kết thúc bằng `-s3alias`**. Dùng chữ thường, số và dấu `-` là an toàn.

#### Object và key

- Mỗi object có một **key** = **đường dẫn đầy đủ** của file trong bucket:
  - `s3://my-bucket/my_file.txt` → key là `my_file.txt`
  - `s3://my-bucket/my_folder1/another_folder/my_file.txt` → key là `my_folder1/another_folder/my_file.txt`
- Key = **prefix** + **object name**:
  - prefix: `my_folder1/another_folder/`
  - object name: `my_file.txt`
- **S3 không có khái niệm thư mục thật sự.** Console hiển thị "folder" cho dễ dùng, nhưng mọi thứ đều chỉ là **key** – một chuỗi dài có chứa dấu `/`.

#### Thành phần của object

| Thành phần | Mô tả |
|---|---|
| **Value** | Nội dung (body) của object |
| Kích thước tối đa | **50 TB** mỗi object (theo video; trước đây là 5 TB – xem ghi chú bên dưới) |
| **Multi-part upload** | **Bắt buộc** khi file **> 5 GB**. Ví dụ file 5 TB phải chia thành ít nhất 1.000 part 5 GB |
| **Metadata** | Danh sách cặp key/value do hệ thống hoặc người dùng đặt |
| **Tags** | Cặp key/value Unicode, **tối đa 10** tag mỗi object; hữu ích cho bảo mật và lifecycle |
| **Version ID** | Có nếu bật **versioning** |

### Kiến thức thực tế

- **Ghi chú cập nhật – kích thước object:** suốt nhiều năm giới hạn là **5 TB**/object (quiz của khoá vẫn dùng con số này). Video mới nhất nêu **50 TB**. Quy tắc multi-part không đổi: **bắt buộc khi > 5 GB, khuyến nghị khi > 100 MB**; mỗi upload tối đa **10.000 part**, mỗi part từ 5 MB đến 5 GB (trừ part cuối).
- **Strong read-after-write consistency** (từ **12/2020**): sau khi `PUT`/`DELETE` thành công, mọi `GET`/`LIST` tiếp theo thấy ngay dữ liệu mới. Tài liệu cũ nói "eventual consistency cho overwrite/delete" là **lỗi thời**.
- **Mặc định bảo mật hiện nay:**
  - Từ **1/2023**, mọi object mới được **mã hoá SSE-S3 mặc định**.
  - Từ **4/2023**, bucket mới mặc định **ACL disabled** (Object Ownership = *Bucket owner enforced*) và **Block Public Access bật**.
- Upload với multi-part bằng SDK: các high-level API (`aws s3 cp`, boto3 `upload_file`, `@aws-sdk/lib-storage` `Upload`) **tự động** chia part và upload song song.

  ```python
  import boto3
  from boto3.s3.transfer import TransferConfig

  s3 = boto3.client("s3")
  cfg = TransferConfig(multipart_threshold=100 * 1024**2,   # >100 MB thì multi-part
                       multipart_chunksize=100 * 1024**2,
                       max_concurrency=10)
  s3.upload_file("big.iso", "my-bucket", "isos/big.iso", Config=cfg,
                 ExtraArgs={"Metadata": {"owner": "kiet"},          # user metadata -> x-amz-meta-owner
                            "Tagging": "project=demo&env=dev"})
  ```

- **User-defined metadata** được gửi dưới dạng header `x-amz-meta-*` và **không sửa tại chỗ được** — muốn đổi metadata phải copy object đè lên chính nó. Tags thì sửa được bằng `PutObjectTagging`.
- Nên cấu hình **lifecycle rule "AbortIncompleteMultipartUpload"** để dọn các part upload dở dang (vẫn tính phí lưu trữ).
- Độ dài tên bucket: **3–63 ký tự**. Tên bucket (global namespace) sau khi xoá có thể bị người khác lấy — đừng hard-code tên bucket vào ứng dụng phân phối công khai mà không kiểm soát.

### Ghi nhớ cho kỳ thi

- Bucket thuộc **một region**; tên bucket (global namespace) **duy nhất toàn cầu**.
- Key = **prefix + object name**; S3 **không có thư mục thật**.
- File **> 5 GB bắt buộc multi-part upload**; khuyến nghị từ **100 MB**.
- Object URL trả **Access Denied** khi bucket private; **pre-signed URL** chứa chữ ký của người tạo nên mở được.
- Tối đa **10 tag** mỗi object.

---

## Bài 2 – Bảo mật S3 và Bucket Policy

### Lý thuyết

#### Các lớp bảo mật của S3

| Loại | Cơ chế | Ghi chú |
|---|---|---|
| **User-based** | **IAM policy** gắn vào user/group/role | Quy định API call nào được phép cho principal đó |
| **Resource-based** | **Bucket policy** | Quy tắc áp dụng cho toàn bucket, gắn trực tiếp trên S3; cho phép cross-account, public |
| | **Object ACL** | Chi tiết hơn (finer grain), **có thể tắt** |
| | **Bucket ACL** | Ít dùng, **có thể tắt** |
| **Encryption** | Mã hoá object bằng key | Học chi tiết ở chương S3 Security |

- Cách phổ biến nhất hiện nay để bảo mật S3 là **bucket policy**.
- **Một IAM principal truy cập được object khi:**
  > (IAM policy **cho phép** **HOẶC** resource policy **cho phép**) **VÀ** **không có explicit Deny** nào.

#### Cấu trúc bucket policy (JSON)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::examplebucket/*"]
    }
  ]
}
```

| Trường | Ý nghĩa |
|---|---|
| `Resource` | Bucket và object mà policy áp dụng. `arn:aws:s3:::examplebucket/*` = mọi object trong bucket |
| `Effect` | `Allow` hoặc `Deny` |
| `Action` | Tập API được Allow/Deny, ví dụ `s3:GetObject` |
| `Principal` | Account/user được áp dụng; `"*"` = bất kỳ ai |

→ Policy trên cho phép **public read** mọi object trong bucket.

Bucket policy dùng để:
- Cấp **public access** cho bucket.
- **Ép object phải được mã hoá** khi upload.
- Cấp quyền cho **account khác** (cross-account).

#### Các tình huống truy cập

| Tình huống | Giải pháp |
|---|---|
| Khách truy cập website (internet) cần đọc file | **Bucket policy** cho phép public read |
| **IAM user** trong cùng account | Gắn **IAM policy** cho user |
| **EC2 instance** cần truy cập S3 | **IAM Role** (EC2 instance role) có quyền phù hợp — không dùng IAM user |
| **IAM user ở account khác** (cross-account) | **Bucket policy** cho phép principal của account đó |

#### Block Public Access

- Thiết lập ở cấp **bucket** (đã bật khi tạo bucket) và có thể ở cấp **account**.
- Là **lớp bảo vệ bổ sung chống rò rỉ dữ liệu**: dù bucket policy cho phép public, nếu Block Public Access đang bật thì bucket **không bao giờ public**.
- Nếu biết chắc bucket không bao giờ được public thì **giữ bật**; nếu không bucket nào trong account được public thì bật ở **cấp account**.

### Kiến thức thực tế

- **Cross-account access** – bucket policy cho phép role của account khác:

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": { "AWS": "arn:aws:iam::111122223333:role/DataReader" },
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::my-bucket", "arn:aws:s3:::my-bucket/*"]
    }]
  }
  ```

  Lưu ý `s3:ListBucket` áp dụng cho **bucket ARN** (không có `/*`), còn `s3:GetObject` áp dụng cho **object ARN** (`/*`). Nhầm hai ARN này là lỗi rất hay gặp. Với cross-account, account đích **cũng phải** cấp IAM policy cho role đó.
- **Ép buộc HTTPS** (hay dùng trong thực tế):

  ```json
  {
    "Effect": "Deny",
    "Principal": "*",
    "Action": "s3:*",
    "Resource": ["arn:aws:s3:::my-bucket", "arn:aws:s3:::my-bucket/*"],
    "Condition": { "Bool": { "aws:SecureTransport": "false" } }
  }
  ```

- **ACL đã lỗi thời:** từ 4/2023 bucket mới mặc định tắt ACL. Khi ACL tắt, gửi request có ACL (ví dụ `--acl public-read`) sẽ lỗi `AccessControlListNotSupported`. Hãy dùng bucket policy.
- Không nên dùng bucket public để phục vụ nội dung web; thực tế dùng **CloudFront + Origin Access Control (OAC)** và giữ bucket private.
- **IAM Access Analyzer for S3** cảnh báo các bucket đang public hoặc chia sẻ ra ngoài account.

### Ghi nhớ cho kỳ thi

- Quyền = (IAM **hoặc** bucket policy cho phép) **và không có explicit Deny**. **Explicit Deny luôn thắng.**
- **Cross-account** → **bucket policy**. **EC2** → **IAM Role**.
- **Block Public Access** ghi đè bucket policy public; dùng để chống rò rỉ dữ liệu, bật được ở cấp account.
- `GetObject` cần Resource dạng `arn:aws:s3:::bucket/*`.

---

## Bài 3 – Static Website Hosting

### Lý thuyết

- S3 có thể **host website tĩnh** (HTML, CSS, JS, ảnh) truy cập được từ internet.
- URL website phụ thuộc region, có 2 dạng (khác nhau ở dấu `-` hay `.` trước region):
  - `http://<bucket-name>.s3-website-<region>.amazonaws.com`
  - `http://<bucket-name>.s3-website.<region>.amazonaws.com`
- Website chỉ hoạt động khi bucket cho phép **public read** (bucket policy ở Bài 2).
- Gặp lỗi **403 Forbidden** sau khi bật website → bucket **chưa public** → cần gắn bucket policy public và tắt Block Public Access.

### Kiến thức thực tế

- **Website endpoint chỉ hỗ trợ HTTP**, không HTTPS. Muốn HTTPS + custom domain → đặt **CloudFront** phía trước (kèm ACM certificate). Khi dùng CloudFront với **REST endpoint + OAC**, bucket có thể giữ **private**.
- Website endpoint khác REST endpoint: website endpoint trả trang HTML lỗi, hỗ trợ **index document**, **error document** và **redirect rules**; REST endpoint trả lỗi XML.
- Nếu frontend (ví dụ SPA React) ở domain khác gọi file trên bucket → cần cấu hình **CORS** (học ở chương Advanced S3).
- Tên bucket phải **trùng tên domain** (ví dụ `www.example.com`) nếu muốn trỏ Route 53 alias thẳng tới website endpoint.

### Ghi nhớ cho kỳ thi

- Website S3 trả **403 Forbidden** → bucket **chưa public** (thiếu bucket policy hoặc Block Public Access còn bật).
- Biết 2 dạng URL `s3-website-<region>` / `s3-website.<region>` (không cần thuộc).

---

## Bài 4 – S3 Versioning

### Lý thuyết

- **Versioning** được bật ở **cấp bucket**.
- Khi upload đè lên **cùng key**, S3 không ghi đè mà tạo **version mới** (version 1, 2, 3…).
- **Best practice** nên bật versioning vì:
  - **Chống xoá nhầm:** xoá object chỉ thêm **delete marker**, có thể khôi phục version cũ.
  - **Dễ rollback** về version trước (ví dụ trạng thái 2 ngày trước).
- Lưu ý:
  - File upload **trước khi bật** versioning có version ID là **`null`**.
  - **Suspend** versioning **không xoá** các version cũ → là thao tác an toàn.

#### Hai kiểu xoá

| | Xoá thường (không chỉ version) | Xoá một version cụ thể |
|---|---|---|
| Kết quả | Thêm **delete marker** lên trên cùng | **Permanent delete** version đó |
| Dữ liệu cũ | Vẫn còn, khôi phục được | Mất vĩnh viễn, không hoàn tác |
| Truy cập object | Trả **404 Not Found** | Version trước đó trở thành version hiện tại |
| Khôi phục | **Xoá delete marker** | Không thể |

### Kiến thức thực tế

- **Chi phí:** mỗi version được tính phí lưu trữ đầy đủ. Kết hợp **lifecycle rule** `NoncurrentVersionExpiration` (ví dụ xoá version cũ sau 30 ngày) và dọn **expired delete markers**.
- Versioning **không thể tắt hoàn toàn** sau khi bật, chỉ **Suspend** được.
- Muốn chống xoá version (kể cả permanent delete) → **MFA Delete** hoặc **S3 Object Lock** (học ở chương S3 Security).
- Versioning là **điều kiện bắt buộc** cho Replication (Bài 5) và Object Lock.
- Ứng dụng ghi rất nhiều lần vào cùng key trên bucket có versioning có thể làm `ListObjectVersions` chậm và tăng chi phí; cân nhắc thiết kế key.

### Ghi nhớ cho kỳ thi

- Bật versioning ở **cấp bucket**; object có sẵn trước đó có version **`null`**.
- **Suspend không xoá** version cũ.
- Xoá thường → **delete marker** (khôi phục được); xoá theo version ID → **permanent delete**.

---

## Bài 5 – S3 Replication (CRR/SRR)

### Lý thuyết

- Hai loại:
  - **CRR – Cross-Region Replication:** bucket nguồn và đích ở **khác region**.
  - **SRR – Same-Region Replication:** **cùng region**.
- Điều kiện:
  - **Bật versioning** ở **cả bucket nguồn và đích**.
  - Có thể ở **khác AWS account**.
  - Sao chép **bất đồng bộ** (asynchronous), chạy nền.
  - Phải cấp **IAM permissions** (IAM role) cho dịch vụ S3 để đọc bucket nguồn và ghi bucket đích.

| | CRR | SRR |
|---|---|---|
| Use case | Compliance, **giảm độ trễ** truy cập ở region khác, sao chép giữa các account | **Gộp log** từ nhiều bucket, **live replication** giữa môi trường production và test |

#### Các lưu ý quan trọng (Replication Notes)

- Sau khi bật, **chỉ object mới** được replicate.
- Muốn replicate **object có sẵn** hoặc **object replicate thất bại** → dùng **S3 Batch Replication**.
- **Delete:**
  - **Delete marker** có thể được replicate (**tuỳ chọn**, mặc định tắt).
  - **Xoá theo version ID (permanent delete) KHÔNG được replicate** – để tránh xoá độc hại lan từ bucket này sang bucket khác.
- **Không có chaining:** bucket 1 → bucket 2, bucket 2 → bucket 3 thì object của bucket 1 **không** sang bucket 3.

### Kiến thức thực tế

- **S3 Replication Time Control (RTC):** cam kết replicate phần lớn object trong **15 phút**, kèm metrics/notification — dùng khi có yêu cầu compliance về thời gian.
- **Một bucket nguồn có thể replicate tới nhiều bucket đích** bằng nhiều rule (chính là đáp án đúng khi cần A → B và A → C). Cũng có thể cấu hình **hai chiều** (A ↔ B) với *replica modification sync*.
- Object mã hoá **SSE-KMS** cần bật tuỳ chọn replicate object KMS và cấp quyền `kms:Decrypt`/`kms:Encrypt` cho role.
- Replicate **cross-account**: bucket đích cần bucket policy cho phép role nguồn; nên bật **Change object ownership to destination bucket owner**.
- Theo dõi trạng thái từng object qua header `x-amz-replication-status` (`PENDING`, `COMPLETED`, `FAILED`, `REPLICA`).
- Replication **không phải backup chống xoá**: dữ liệu sai/ghi đè vẫn được replicate. Kết hợp versioning + Object Lock nếu cần.

### Ghi nhớ cho kỳ thi

- **Versioning ở cả 2 bucket** là bắt buộc; replication là **asynchronous**; cần **IAM role** cho S3.
- **Chỉ object mới** → object cũ dùng **S3 Batch Replication**.
- **Delete marker:** replicate tuỳ chọn; **permanent delete không replicate**.
- **Không chaining**: muốn A → B và A → C thì cấu hình **2 rule từ A**.
- Cần dữ liệu ở region khác để phân tích độ trễ thấp → **S3 Replication** (không phải CloudFront).
- Version ID được giữ nguyên ở bucket đích.

---

## Bài 6 – S3 Storage Classes và Lifecycle

### Lý thuyết

#### Durability và Availability

- **Durability (độ bền)** – khả năng không bị mất object: **11 số 9 (99,999999999%)**. Lưu 10 triệu object thì trung bình mất 1 object mỗi 10.000 năm. **Giống nhau cho mọi storage class.**
- **Availability (độ sẵn sàng)** – dịch vụ sẵn sàng phục vụ đến mức nào, **phụ thuộc storage class**. Ví dụ S3 Standard 99,99% ≈ **53 phút/năm** không sẵn sàng → ứng dụng cần xử lý lỗi (retry).

#### Các storage class

| Storage class | Đặc điểm | Availability | Min. storage duration | Use case |
|---|---|---|---|---|
| **S3 Standard – General Purpose** | Mặc định; dữ liệu truy cập thường xuyên; độ trễ thấp, throughput cao; chịu được 2 facility hỏng đồng thời | 99,99% | Không | Big data analytics, mobile & gaming, phân phối nội dung |
| **S3 Standard-IA** | Truy cập ít nhưng cần lấy **nhanh** khi cần; rẻ hơn Standard, **có phí truy xuất** | 99,9% | 30 ngày | Disaster Recovery, backup |
| **S3 One Zone-IA** | Như Standard-IA nhưng chỉ ở **1 AZ**; mất dữ liệu nếu AZ bị phá huỷ | 99,5% | 30 ngày | Bản sao thứ cấp của backup on-premises, dữ liệu **có thể tạo lại** |
| **S3 Glacier Instant Retrieval** | Lưu trữ lưu trữ (archive) nhưng truy xuất **mili giây** | 99,9% | **90 ngày** | Dữ liệu truy cập ~1 lần/quý |
| **S3 Glacier Flexible Retrieval** (tên cũ: *S3 Glacier*) | Truy xuất: **Expedited 1–5 phút**, **Standard 3–5 giờ**, **Bulk 5–12 giờ (miễn phí)** | 99,99% (sau khi restore) | **90 ngày** | Archive, chấp nhận chờ |
| **S3 Glacier Deep Archive** | Rẻ nhất; truy xuất: **Standard 12 giờ**, **Bulk 48 giờ** | 99,99% (sau khi restore) | **180 ngày** | Lưu trữ dài hạn (compliance) |
| **S3 Intelligent-Tiering** | Tự động chuyển object giữa các tier theo mẫu truy cập; có phí monitoring + auto-tiering hằng tháng nhỏ; **không có phí truy xuất** | 99,9% | Không | Không biết trước mẫu truy cập |

- Glacier: giá lưu trữ rất thấp, trả thêm **phí truy xuất**. "Instant" = lấy ngay; "Flexible" = chấp nhận chờ đến 12 giờ.

#### Các tier của S3 Intelligent-Tiering

| Tier | Khi nào |
|---|---|
| Frequent Access | Tự động, **mặc định** |
| Infrequent Access | Tự động, object không truy cập **30 ngày** |
| Archive Instant Access | Tự động, không truy cập **90 ngày** |
| Archive Access | **Tuỳ chọn**, cấu hình từ 90 đến 700+ ngày |
| Deep Archive Access | **Tuỳ chọn**, cấu hình từ 180 đến 700+ ngày |

#### Cách đặt / đổi storage class

- Chọn khi **tạo object**.
- **Sửa thủ công** storage class của object.
- Dùng **S3 Lifecycle configuration** để **tự động** chuyển object giữa các class.

### Kiến thức thực tế

- **Minimum billable object size 128 KB** với Standard-IA, One Zone-IA và Glacier Instant Retrieval: object nhỏ hơn vẫn tính như 128 KB. Intelligent-Tiering **không tự chuyển tier** object nhỏ hơn 128 KB (và không tính phí monitoring cho chúng).
- Xoá/chuyển object trước **minimum storage duration** vẫn bị tính phí đủ thời gian tối thiểu.
- Object trong **Glacier Flexible Retrieval / Deep Archive** không đọc trực tiếp được; phải gọi **RestoreObject** để tạo bản tạm:

  ```bash
  aws s3api restore-object --bucket my-bucket --key archive.zip \
    --restore-request '{"Days":7,"GlacierJobParameters":{"Tier":"Bulk"}}'
  ```

  Glacier Instant Retrieval thì **không cần restore**.
- **S3 Express One Zone** (directory bucket, ra mắt 11/2023): storage class hiệu năng cao nhất, độ trễ một chữ số mili giây, lưu trong 1 AZ — chính là loại *Directory* bucket thấy trong console.
- Video không đề cập giá; giá thay đổi theo region và thời gian — luôn kiểm tra trang S3 Pricing.
- Lifecycle rule còn hỗ trợ **Expiration** (xoá object), xử lý **noncurrent versions**, **AbortIncompleteMultipartUpload**, lọc theo **prefix/tag/kích thước object**.

### Ghi nhớ cho kỳ thi

- **Durability 11 số 9 cho mọi class**; availability khác nhau.
- Glacier Flexible: **Expedited (1–5 phút) / Standard (3–5 giờ) / Bulk (5–12 giờ)**. Deep Archive: **Standard (12 giờ) / Bulk (48 giờ)** — **không có Expedited**. Không class Glacier nào có chế độ truy xuất tên "Instant (10 giây)".
- Min duration: IA **30 ngày**, Glacier IR / Flexible **90 ngày**, Deep Archive **180 ngày**.
- Không biết mẫu truy cập → **Intelligent-Tiering**. Dữ liệu tạo lại được, rẻ → **One Zone-IA**. DR/backup cần truy cập nhanh → **Standard-IA**.
- Tự động chuyển class → **Lifecycle rules**.

---

## Tổng kết chương

| Chủ đề | Điều cần nhớ |
|---|---|
| Bucket | Thuộc 1 region; tên global namespace duy nhất toàn cầu (hoặc dùng account regional namespace mới); 3–63 ký tự, chữ thường, không `_`, không IP |
| Object | Key = prefix + object name; không có thư mục thật; tối đa 50 TB (trước đây 5 TB); multi-part bắt buộc > 5 GB |
| Metadata / Tags | Metadata key/value; tối đa 10 tag/object |
| URL | Object URL cần public; pre-signed URL chứa chữ ký người tạo |
| Bảo mật | IAM policy, bucket policy (phổ biến nhất), ACL (mặc định tắt), encryption; explicit Deny thắng |
| Block Public Access | Bật mặc định; ghi đè policy public; có ở cấp bucket và account |
| Static website | `s3-website-<region>` / `s3-website.<region>`; 403 = chưa public; chỉ HTTP |
| Versioning | Cấp bucket; object cũ = `null`; suspend không xoá; delete marker vs permanent delete |
| Replication | CRR/SRR; versioning 2 phía; async; IAM role; chỉ object mới (cũ → Batch Replication); delete marker tuỳ chọn; permanent delete không replicate; không chaining |
| Storage classes | Standard, Standard-IA, One Zone-IA, Glacier IR, Glacier Flexible, Deep Archive, Intelligent-Tiering |
| Lifecycle | Tự động chuyển class / xoá object |
| Cập nhật 2020–2026 | Strong consistency (12/2020); SSE-S3 mặc định (1/2023); ACL tắt + BPA bật mặc định (4/2023); S3 Express One Zone (11/2023); object 50 TB; account regional namespace |

---

## Câu hỏi ôn tập

*Nguồn: Amazon S3 Quiz. Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Bạn có một file 25 GB cần upload lên S3 nhưng liên tục gặp lỗi. Giải pháp khả thi là gì?

- A. Giới hạn kích thước file trên S3 là 5 GB
- B. Cập nhật bucket policy để cho phép file lớn hơn
- C. Dùng **Multi-Part upload** khi upload file lớn hơn 5 GB
- D. Mã hoá file

<details><summary>Đáp án</summary>

**C.** Một request `PUT` đơn lẻ chỉ upload được tối đa 5 GB; file lớn hơn **bắt buộc** dùng multi-part upload (AWS khuyến nghị dùng ngay khi file > 100 MB). A sai: giới hạn object là 5 TB theo quiz (hiện nay video nêu 50 TB), không phải 5 GB. B và D không liên quan đến kích thước.
</details>

**Câu 2.** Bạn gặp lỗi khi tạo bucket S3 mới tên `dev`. Account AWS mới tinh, chưa từng tạo bucket nào, và bạn đã kiểm tra là có đủ IAM permission để tạo bucket. Nguyên nhân có thể là gì?

- A. Chỉ root user mới tạo được S3 bucket
- B. Tên bucket S3 phải duy nhất toàn cầu và `dev` đã có người dùng

<details><summary>Đáp án</summary>

**B.** Với global namespace, tên bucket phải duy nhất trên mọi account và mọi region; `dev` chắc chắn đã bị lấy. A sai: bất kỳ IAM principal có quyền `s3:CreateBucket` đều tạo được. *Cập nhật:* với **account regional namespace** mới, bạn có thể dùng tên ngắn như `dev` vì AWS tự thêm hậu tố account/region.
</details>

**Câu 3.** Bạn bật versioning cho một bucket đã chứa nhiều file. Các file có sẵn sẽ có version nào?

- A. 1
- B. 0
- C. -1
- D. null

<details><summary>Đáp án</summary>

**D. null.** Object upload trước khi bật versioning có version ID là `null`; chỉ object upload sau đó mới có version ID thật.
</details>

**Câu 4.** Bạn đã cập nhật bucket policy cho phép các IAM user đọc/ghi file trong bucket, nhưng một user phàn nàn không thực hiện được `PutObject`. Nguyên nhân có thể là gì?

- A. Bucket policy chắc chắn bị sai
- B. User thiếu quyền
- C. IAM policy gắn với user có **explicit DENY**
- D. Cần liên hệ AWS Support để gỡ giới hạn

<details><summary>Đáp án</summary>

**C.** **Explicit Deny** trong IAM policy luôn được ưu tiên hơn Allow của bucket policy. B sai: dù user không có quyền trong IAM, bucket policy đã Allow tường minh cho user là đủ (cùng account). A không phù hợp vì các user khác vẫn dùng được; D không liên quan.
</details>

**Câu 5.** Bạn muốn nội dung một bucket S3 có sẵn đầy đủ ở nhiều AWS Region khác nhau để nhóm phân tích dữ liệu với độ trễ và chi phí thấp nhất. Nên dùng tính năng nào?

- A. Amazon CloudFront Distributions
- B. S3 Replication
- C. S3 Versioning
- D. S3 Static Website Hosting

<details><summary>Đáp án</summary>

**B.** S3 Replication (CRR) sao chép dữ liệu sang bucket ở region khác. A sai: CloudFront chỉ **cache** dữ liệu ở edge location, không sao chép bucket sang region khác. C chỉ giữ nhiều version khi ghi đè. D dùng để host website.
</details>

**Câu 6.** Bạn có 3 bucket: bucket nguồn A và hai bucket đích B, C ở các region khác nhau. Muốn replicate object từ A sang cả B và C. Làm thế nào?

- A. Cấu hình replication từ A sang B, rồi từ A sang C
- B. Cấu hình replication từ A sang B, rồi từ B sang C
- C. Cấu hình replication từ A sang C, rồi từ C sang B

<details><summary>Đáp án</summary>

**A.** S3 Replication **không hỗ trợ chaining**: object từ A sang B sẽ không tiếp tục sang C (B, C sai). Phải cấu hình trực tiếp từ A tới từng bucket đích.
</details>

**Câu 7.** Đâu **KHÔNG** phải là chế độ truy xuất của Glacier Deep Archive?

- A. Standard (12 giờ)
- B. Expedited (1–5 phút)
- C. Bulk (48 giờ)

<details><summary>Đáp án</summary>

**B.** Deep Archive chỉ có **Standard (12 giờ)** và **Bulk (48 giờ)**. Expedited chỉ có ở Glacier Flexible Retrieval.
</details>

**Câu 8.** Đâu **KHÔNG** phải là chế độ truy xuất của Glacier Flexible Retrieval?

- A. Expedited (1–5 phút)
- B. Standard (3–5 giờ)
- C. Bulk (5–12 giờ)
- D. Instant (10 giây)

<details><summary>Đáp án</summary>

**D.** Glacier Flexible Retrieval có 3 chế độ: Expedited, Standard, Bulk. Không có "Instant (10 giây)"; truy xuất tức thì (mili giây) là đặc điểm của **một storage class khác** – Glacier Instant Retrieval.
</details>

---

[← Chương 10](ch10-vpc-fundamentals.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Chương 12 →](ch12-aws-cli-sdk-iam-roles-policies.md)
