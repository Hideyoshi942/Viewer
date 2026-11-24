# Chương 13 – Advanced Amazon S3

> **Nguồn:** 6 video của chương + *Amazon S3 Advanced Quiz*.
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay (2026, kỳ thi **DVA-C02**).

## Mục tiêu chương

Sau chương này bạn có thể:

- Tự động chuyển object giữa các **storage class** và tự động xoá object bằng **S3 Lifecycle Rules**; dùng **S3 Analytics (Storage Class Analysis)** để chọn số ngày chuyển tier hợp lý.
- Thiết kế lifecycle cho các tình huống hay gặp trong đề (thumbnail, versioning, multipart upload dở dang).
- Cấu hình **S3 Event Notifications** tới SNS, SQS, Lambda và **Amazon EventBridge**, kèm **resource policy** đúng.
- Nắm **hiệu năng cơ bản của S3** (3.500 / 5.500 request mỗi giây **mỗi prefix**) và các kỹ thuật tăng tốc: **Multi-part Upload**, **Transfer Acceleration**, **Byte-Range Fetches**.
- Phân biệt **user-defined metadata** và **object tags**, và biết cách "tìm kiếm" object theo metadata/tag.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001–002 | S3 Lifecycle Rules (with S3 Analytics) | Bài 1 – S3 Lifecycle Rules và S3 Analytics |
| 003–004 | S3 Event Notifications | Bài 2 – S3 Event Notifications |
| 005 | S3 Performance | Bài 3 – Hiệu năng S3 |
| 006 | S3 Object Tags & Metadata | Bài 4 – Object Metadata và Object Tags |
| Quiz | Amazon S3 Advanced Quiz | Câu hỏi ôn tập |

---

## Bài 1 – S3 Lifecycle Rules và S3 Analytics

### Lý thuyết

#### Chuyển object giữa các storage class

- Object có thể được chuyển (transition) từ class "nóng" sang class "lạnh" hơn theo sơ đồ thác nước:

  ```
  Standard ─► Standard-IA ─► Intelligent-Tiering ─► One Zone-IA
      └──────────────┴───────────────┴──────────────┴─► Glacier Instant Retrieval
                                                       ─► Glacier Flexible Retrieval
                                                       ─► Glacier Deep Archive
  ```

  Nguyên tắc: chỉ đi **xuống** (từ class truy cập thường xuyên sang class rẻ hơn/ít truy cập hơn), không lifecycle ngược lên.
- Biết object **ít được truy cập** → chuyển sang **Standard-IA**. Biết object sẽ **lưu trữ lâu dài (archive)** → chuyển sang các tier **Glacier** hoặc **Deep Archive**.
- Có thể chuyển thủ công, nhưng nên **tự động hoá bằng Lifecycle Rules**.

#### Thành phần của một Lifecycle Rule

| Loại action | Ý nghĩa | Ví dụ |
|---|---|---|
| **Transition actions** | Chuyển object sang storage class khác sau một số ngày | Sang Standard-IA sau 60 ngày kể từ khi tạo; sang Glacier sau 6 tháng |
| **Expiration actions** | Xoá (expire) object sau một thời gian | Xoá access log sau 365 ngày; xoá **các phiên bản cũ** (khi bật versioning); xoá **multipart upload dở dang** (ví dụ cũ hơn 2 tuần) |

- Phạm vi áp dụng của rule:
  - **Toàn bucket**, hoặc
  - Một **prefix** (ví dụ `s3://mybucket/mp3/*`), và/hoặc
  - Các **object tag** cụ thể (ví dụ chỉ áp dụng cho `Department: Finance`).

#### Tình huống thi 1 – Ảnh gốc và thumbnail

> Ứng dụng trên EC2 tạo thumbnail sau khi ảnh đại diện được upload lên S3. Thumbnail tạo lại dễ dàng và chỉ cần giữ **60 ngày**. Ảnh gốc phải lấy được **ngay lập tức** trong 60 ngày, sau đó người dùng có thể chờ **tối đa 6 giờ**.

Thiết kế:

- **Ảnh gốc**: để ở **S3 Standard**, lifecycle chuyển sang **Glacier** (Flexible Retrieval, thời gian lấy về vài phút đến vài giờ) sau **60 ngày**.
- **Thumbnail**: dùng **prefix** riêng để phân biệt với ảnh gốc, lưu ở **S3 One Zone-IA** (ít truy cập, mất thì tạo lại được), lifecycle **expire (xoá) sau 60 ngày**.

#### Tình huống thi 2 – Khôi phục object đã xoá

> Quy định công ty: object bị xoá phải **khôi phục được ngay** trong **30 ngày** (hiếm khi xảy ra). Sau đó, trong tối đa **365 ngày**, phải khôi phục được trong vòng **48 giờ**.

Thiết kế:

- **Bật S3 Versioning**: khi xoá, object chỉ bị che bởi **delete marker**, các phiên bản cũ vẫn còn và khôi phục được.
- Lifecycle cho **noncurrent versions** (các phiên bản không phải bản mới nhất):
  - Chuyển sang **Standard-IA** (sau 30 ngày),
  - Sau đó chuyển sang **Glacier Deep Archive** (thời gian lấy về tối đa 48 giờ) để lưu trữ.

#### S3 Analytics – Storage Class Analysis

- Giúp xác định **số ngày tối ưu** để chuyển object từ class này sang class khác.
- Chỉ đưa khuyến nghị cho **Standard** và **Standard-IA**. **Không** hỗ trợ One Zone-IA hay Glacier.
- Kết quả là **báo cáo CSV** gồm khuyến nghị và thống kê, **cập nhật hằng ngày**.
- Mất **24–48 giờ** để bắt đầu thấy kết quả phân tích.
- Là bước đầu tốt để xây dựng hoặc tinh chỉnh lifecycle rule.

### Kiến thức thực tế

- **Rule theo prefix và tag** (tình huống thumbnail):

  ```json
  {
    "Rules": [
      {
        "ID": "expire-thumbnails",
        "Status": "Enabled",
        "Filter": { "Prefix": "thumbnails/" },
        "Expiration": { "Days": 60 }
      },
      {
        "ID": "archive-finance",
        "Status": "Enabled",
        "Filter": { "And": { "Prefix": "reports/", "Tags": [ { "Key": "Department", "Value": "Finance" } ] } },
        "Transitions": [ { "Days": 180, "StorageClass": "GLACIER" } ]
      }
    ]
  }
  ```

  Lưu ý: thumbnail có thể upload thẳng vào One Zone-IA bằng `--storage-class ONEZONE_IA` khi `PutObject`, không cần lifecycle để chuyển.
- **Ràng buộc thời gian lưu tối thiểu** khi transition:
  - Từ Standard sang **Standard-IA / One Zone-IA**: object phải ở Standard **ít nhất 30 ngày** (console sẽ báo lỗi nếu đặt nhỏ hơn).
  - Các class IA/Glacier có **minimum storage duration** (IA: 30 ngày, Glacier Instant/Flexible: 90 ngày, Deep Archive: 180 ngày). Xoá hoặc chuyển tiếp sớm hơn vẫn bị tính phí đủ thời gian tối thiểu.
- **Object nhỏ**: từ tháng 9/2024, lifecycle mặc định **không transition object nhỏ hơn 128 KB** (vì phí transition và phí metadata của Glacier làm tốn hơn là tiết kiệm). Có thể ghi đè bằng filter `ObjectSizeGreaterThan` / `ObjectSizeLessThan`.
- **Phí transition** tính theo số request (mỗi object 1 request). Bucket có hàng triệu object nhỏ thì phí transition có thể lớn hơn khoản tiết kiệm. Hãy tính trước.
- Lifecycle là tác vụ **bất đồng bộ**: object đủ điều kiện có thể được xử lý trễ vài ngày; nhưng việc **tính phí** theo class mới/ngừng tính phí khi expire được áp dụng ngay khi object đủ điều kiện.
- **Luôn thêm rule `AbortIncompleteMultipartUpload`** cho mọi bucket có upload file lớn. Các part dở dang **không hiện** khi `ListObjects` nhưng vẫn bị tính tiền. Kiểm tra bằng:

  ```bash
  aws s3api list-multipart-uploads --bucket my-demo-bucket
  ```

- **Expired object delete markers**: trong bucket có versioning, sau khi xoá hết noncurrent versions, các delete marker "mồ côi" vẫn còn. Dùng `"Expiration": { "ExpiredObjectDeleteMarker": true }` để dọn.
- **S3 Analytics** trên console: **bucket → Metrics → Storage Class Analysis → Create analytics configuration**, có thể export CSV vào một bucket khác. Ngoài ra **S3 Storage Lens** cho cái nhìn tổng quan cấp tổ chức/tài khoản. Nếu không đoán được mẫu truy cập, dùng luôn **S3 Intelligent-Tiering** thay vì tự viết lifecycle.

### Ghi nhớ cho kỳ thi

- Tự động chuyển tier hoặc tự động xoá object thì chọn **S3 Lifecycle Rules** (không phải Lambda hay CloudWatch Events).
- **Transition actions** = đổi storage class; **Expiration actions** = xoá (object, phiên bản cũ, multipart dở dang).
- Xoá **phiên bản cũ** để giảm chi phí: **Expiration action** cho **noncurrent versions**.
- Dọn **multipart upload dở dang**: **Lifecycle Policy** (`AbortIncompleteMultipartUpload`).
- Rule áp dụng được theo **prefix** và **tag**.
- Tìm số ngày tối ưu để transition: **S3 Analytics** (chỉ Standard và Standard-IA, báo cáo CSV, 24–48 giờ mới có dữ liệu).
- "Phải khôi phục object đã xoá" → **Versioning** + lifecycle cho **noncurrent versions**.

---

## Bài 2 – S3 Event Notifications

### Lý thuyết

- **Sự kiện (event)** trong S3: object được tạo (`s3:ObjectCreated:*`), bị xoá (`s3:ObjectRemoved:*`), được khôi phục từ Glacier (`s3:ObjectRestore:*`), có replication (`s3:Replication:*`)…
- Có thể **lọc** theo tên object (prefix/suffix), ví dụ chỉ object kết thúc bằng `.jpg`.
- Use case điển hình: **tự động phản ứng** với sự kiện, ví dụ **tạo thumbnail** cho mọi ảnh upload lên S3.
- **Đích (destination)** của event notification:
  1. **SNS topic**
  2. **SQS queue**
  3. **Lambda function**
- Tạo bao nhiêu event notification cũng được, gửi tới đích tuỳ ý.
- Thời gian giao event: **thường vài giây**, nhưng **có thể mất 1 phút hoặc lâu hơn**.

#### Phân quyền: dùng Resource (Access) Policy, không dùng IAM Role

S3 **không** dùng IAM Role để gửi event. Thay vào đó, đích phải có **resource policy** cho phép dịch vụ S3 gửi tới:

| Đích | Policy cần có |
|---|---|
| SNS topic | **SNS Resource (Access) Policy** cho phép S3 `sns:Publish` |
| SQS queue | **SQS Resource (Access) Policy** cho phép S3 `sqs:SendMessage` |
| Lambda function | **Lambda Resource Policy** cho phép S3 `lambda:InvokeFunction` |

Cách hoạt động tương tự S3 bucket policy.

#### Tích hợp Amazon EventBridge

- Bật tích hợp EventBridge trên bucket thì **mọi event** của bucket được gửi vào **Amazon EventBridge**.
- Từ EventBridge, tạo **rules** để gửi event tới **hơn 18 dịch vụ AWS** làm đích (Step Functions, Kinesis Data Streams, Kinesis Data Firehose…).
- Ưu điểm so với event notification thường:
  - **Lọc nâng cao** (theo metadata, kích thước object, tên object…).
  - Gửi tới **nhiều đích cùng lúc**.
  - Có các tính năng của EventBridge: **Archive**, **Replay** event, **giao nhận tin cậy hơn**.

### Kiến thức thực tế

- **Đích là Lambda**: cấp quyền bằng resource policy:

  ```bash
  aws lambda add-permission \
    --function-name make-thumbnail \
    --statement-id s3-invoke \
    --action lambda:InvokeFunction \
    --principal s3.amazonaws.com \
    --source-arn arn:aws:s3:::my-photo-bucket \
    --source-account 123456789012
  ```

  Hàm Lambda (Python) đọc event:

  ```python
  import urllib.parse
  import boto3

  s3 = boto3.client("s3")

  def handler(event, context):
      for record in event["Records"]:
          bucket = record["s3"]["bucket"]["name"]
          key = urllib.parse.unquote_plus(record["s3"]["object"]["key"])  # key được URL-encode
          if key.startswith("thumbnails/"):
              continue  # tránh vòng lặp vô hạn
          obj = s3.get_object(Bucket=bucket, Key=key)
          # ... resize ảnh rồi put_object vào "thumbnails/" + key
  ```

- **Bẫy vòng lặp vô hạn**: Lambda ghi lại vào **chính bucket/prefix** đang kích hoạt nó sẽ tự gọi lại mãi (tốn tiền rất nhanh). Dùng **prefix/suffix filter** khác nhau hoặc **bucket khác** cho output.
- **Không được chồng lấn**: hai notification cùng loại event không được có prefix/suffix chồng lấn nhau. Muốn fan-out một event tới nhiều đích → dùng **SNS** (fan-out sang nhiều SQS) hoặc **EventBridge**.
- **Giao ít nhất một lần (at-least-once)**: có thể nhận trùng; xử lý phải **idempotent**. Thứ tự không đảm bảo (dùng trường `sequencer` để so thứ tự các event của cùng một key).
- Với bucket **không bật versioning**, nếu hai lần ghi vào cùng một key xảy ra gần như đồng thời thì có thể chỉ nhận **một** notification. Muốn chắc chắn mỗi lần ghi đều sinh event thì **bật versioning**.
- SQS/SNS đích **mã hoá bằng SSE-KMS** thì key policy của KMS key (customer managed) phải cho phép `s3.amazonaws.com` dùng `kms:GenerateDataKey` và `kms:Decrypt`; **AWS managed key `aws/sqs` không dùng được** cho trường hợp này.
- **SQS FIFO** không dùng được làm đích của S3 Event Notifications trực tiếp (dùng EventBridge nếu cần).
- Event pattern của EventBridge cho S3 (lọc theo prefix và kích thước):

  ```json
  {
    "source": ["aws.s3"],
    "detail-type": ["Object Created"],
    "detail": {
      "bucket": { "name": ["my-photo-bucket"] },
      "object": { "key": [{ "prefix": "uploads/" }], "size": [{ "numeric": [">", 1048576] }] }
    }
  }
  ```

### Ghi nhớ cho kỳ thi

- Muốn **được thông báo/phản ứng khi có object upload** → **S3 Event Notifications**.
- 3 đích "cổ điển": **SNS, SQS, Lambda**; đích thứ 4: **EventBridge** (mọi event, 18+ đích, lọc nâng cao, archive/replay).
- Phân quyền bằng **resource policy** trên đích (SNS/SQS access policy, Lambda resource policy), **không** phải IAM Role.
- Event thường đến trong vài giây, đôi khi 1 phút hoặc lâu hơn.

---

## Bài 3 – Hiệu năng S3

### Lý thuyết

#### Hiệu năng cơ bản (baseline)

- S3 **tự động scale** tới số lượng request rất lớn, độ trễ thấp: **100–200 ms** để nhận byte đầu tiên.
- Mỗi **prefix** trong bucket đạt được:
  - **3.500** request `PUT/COPY/POST/DELETE` mỗi giây
  - **5.500** request `GET/HEAD` mỗi giây
- **Không giới hạn số prefix** trong một bucket.

**Prefix là gì?** Là phần nằm giữa tên bucket và tên file:

| Object | Prefix |
|---|---|
| `bucket/folder1/sub1/file` | `/folder1/sub1/` |
| `bucket/folder1/sub2/file` | `/folder1/sub2/` |
| `bucket/1/file` | `/1/` |
| `bucket/2/file` | `/2/` |

Mỗi prefix có hạn mức riêng. Rải đều request đọc lên 4 prefix trên → đạt **4 × 5.500 = 22.000** request GET/HEAD mỗi giây.

#### Tăng tốc upload: Multi-part Upload

- **Khuyến nghị** cho file **> 100 MB**, **bắt buộc** cho file **> 5 GB**.
- Chia file lớn thành nhiều **part**, upload **song song** để tận dụng tối đa băng thông.
- Khi mọi part đã lên, S3 **ghép lại** thành object hoàn chỉnh.
- Nếu một part lỗi chỉ cần upload lại part đó.

#### Tăng tốc truyền tải: S3 Transfer Acceleration

- Áp dụng cho cả **upload và download**.
- File được gửi tới **AWS edge location** gần người dùng (số edge location nhiều hơn nhiều so với số region, hàng trăm điểm), rồi edge location chuyển tiếp tới bucket ở region đích qua **mạng riêng của AWS** (nhanh, ổn định).
- Ví dụ: file ở Mỹ upload lên bucket ở Úc. Đi qua Internet công cộng tới edge location ở Mỹ (rất ngắn), rồi đi tiếp qua mạng private của AWS tới Úc. Giảm tối đa đoạn Internet công cộng, tăng tối đa đoạn mạng AWS.
- **Tương thích với Multi-part Upload**.

#### Tăng tốc download: S3 Byte-Range Fetches

- Gửi nhiều request `GET` cho **các khoảng byte cụ thể** (header `Range`) của file và chạy **song song** → tăng tốc download.
- **Chịu lỗi tốt hơn**: một range lỗi thì chỉ cần retry range nhỏ đó.
- Use case thứ hai: **chỉ lấy một phần file**, ví dụ biết 50 byte đầu là header chứa thông tin về file thì chỉ cần request range đó, rất nhanh.

> Cuối video có nhắc "KMS limits" nhưng nội dung chưa trình bày; xem phần *Kiến thức thực tế* bên dưới (và chi tiết ở chương S3 Security).

### Kiến thức thực tế

- **Multi-part upload**: tối đa **10.000 part**, mỗi part **5 MiB – 5 GiB** (part cuối có thể nhỏ hơn 5 MiB).
- Lệnh cấp cao `aws s3 cp` / `aws s3 sync` và các hàm `upload_file` / `download_file` của boto3 **tự dùng multipart** và byte-range song song khi file vượt ngưỡng (mặc định **8 MB**). Tinh chỉnh:

  ```bash
  aws configure set default.s3.multipart_threshold 64MB
  aws configure set default.s3.multipart_chunksize 16MB
  aws configure set default.s3.max_concurrent_requests 20
  ```

  ```python
  import boto3
  from boto3.s3.transfer import TransferConfig

  cfg = TransferConfig(multipart_threshold=100 * 1024**2,   # 100 MB
                       multipart_chunksize=16 * 1024**2,
                       max_concurrency=10)
  boto3.client("s3").upload_file("dataset.bin", "my-bucket", "data/dataset.bin", Config=cfg)
  ```

- Multipart **cấp thấp** (khi tự quản lý): `create-multipart-upload` → nhiều `upload-part` (giữ lại `ETag` của từng part) → `complete-multipart-upload` (hoặc `abort-multipart-upload`). Nếu không complete/abort, các part nằm lại và **vẫn bị tính tiền** → dùng lifecycle `AbortIncompleteMultipartUpload` (Bài 1).
- **Transfer Acceleration**:

  ```bash
  aws s3api put-bucket-accelerate-configuration \
    --bucket my-bucket --accelerate-configuration Status=Enabled

  # dùng endpoint tăng tốc: my-bucket.s3-accelerate.amazonaws.com
  aws s3 cp bigfile.zip s3://my-bucket/ --endpoint-url https://s3-accelerate.amazonaws.com
  # hoặc bật mặc định cho CLI
  aws configure set default.s3.use_accelerate_endpoint true
  ```

  Tên bucket phải tương thích DNS và **không chứa dấu chấm**. Có phí thêm theo GB, nhưng AWS **chỉ tính phí khi việc tăng tốc thực sự nhanh hơn**. Có công cụ *Speed Comparison* để so sánh trước.
- **Byte-range fetch**:

  ```bash
  aws s3api get-object --bucket my-bucket --key data/file.bin --range bytes=0-249 header.bin
  ```

  ```python
  resp = s3.get_object(Bucket="my-bucket", Key="data/file.bin", Range="bytes=0-249")
  header = resp["Body"].read()
  ```

- **Prefix và hiệu năng thực tế**: S3 tự **phân vùng (partition)** theo prefix dựa trên tải. Khi tải tăng đột ngột có thể gặp lỗi **`503 Slow Down`** trong lúc S3 scale → retry với **exponential backoff** (SDK đã làm sẵn). Thiết kế key có prefix đa dạng (ví dụ theo ngày, theo hash) giúp tăng throughput tổng.
- **Giới hạn KMS**: nếu object mã hoá **SSE-KMS**, mỗi upload gọi `GenerateDataKey`, mỗi download gọi `Decrypt`, và các lời gọi này tính vào **quota request/giây của KMS theo region** (khoảng 5.500 trở lên tuỳ region; xem Service Quotas). Tải S3 lớn có thể bị KMS throttle. Giảm số lời gọi KMS bằng **S3 Bucket Keys**, hoặc xin tăng quota.
- **Cập nhật hiện nay – S3 Select**: AWS đã **ngừng cung cấp S3 Select cho khách hàng mới từ 25/7/2024**. Thay thế: lọc phía client, **Amazon Athena**, hoặc đọc theo byte range. Đề thi vẫn có thể nhắc tên S3 Select như một phương án nhiễu.
- Ngoài ra còn có **S3 Express One Zone** (directory bucket, độ trễ mili-giây một chữ số, cho workload cần hiệu năng cực cao trong một AZ) – chỉ cần biết tên.

### Ghi nhớ cho kỳ thi

- **3.500 PUT/COPY/POST/DELETE** và **5.500 GET/HEAD** mỗi giây **mỗi prefix**; không giới hạn số prefix.
- Multi-part upload: **khuyến nghị > 100 MB**, **bắt buộc > 5 GB**.
- Upload xa về địa lý, muốn nhanh → **Transfer Acceleration** (qua edge location), kết hợp được với multipart.
- File 10 GB, mạng tốt nhưng **không ổn định** → **Multi-part Upload + Transfer Acceleration**.
- Chỉ cần **một phần đầu file** (header) hoặc muốn tải song song → **Byte-Range Fetches**.

---

## Bài 4 – Object Metadata và Object Tags

### Lý thuyết

#### User-defined object metadata

- Khi upload object có thể gán **metadata** = các cặp **key-value** đi kèm object.
- Metadata **do người dùng định nghĩa** phải có tên bắt đầu bằng **`x-amz-meta-`** (để phân biệt với metadata hệ thống do AWS tạo).
- Metadata được trả về khi lấy object (trong HTTP header), cho biết thông tin về chính object.
- Ví dụ một object:

  | Metadata | Nguồn |
  |---|---|
  | `Content-Length: 7.5KB` | AWS (hệ thống) |
  | `Content-Type: html` | AWS (hệ thống) |
  | `x-amz-meta-origin: paris` | Người dùng tự định nghĩa |

#### S3 Object Tags

- Cũng là các cặp **key-value**, giống tag ở các dịch vụ AWS khác.
- Lý do có tag bên cạnh metadata:
  - **Phân quyền chi tiết (fine-grained permissions)**: chỉ cho truy cập object có tag cụ thể.
  - **Phân tích (analytics)**: ví dụ S3 Analytics có thể nhóm kết quả theo tag.
- Ví dụ: `Project: Blue`, `PHI: True` (PHI = Personal Health Information).

#### Điểm quan trọng nhất

- **Metadata và tag KHÔNG tìm kiếm (search/filter) được trên S3.** Không lọc object theo metadata hay theo tag được.
- Muốn tìm kiếm: phải xây **index bên ngoài** trong một database, ví dụ **DynamoDB**. Ghi toàn bộ metadata và tag vào index, **tìm trên DynamoDB**, kết quả trả về là key của object trên S3 để lấy ra.

```
Upload ──► S3 bucket ──(event)──► Lambda ──► DynamoDB (index: key, metadata, tags)
                                                     ▲
Ứng dụng tìm kiếm ───────── query ──────────────────┘ ──► lấy object từ S3 theo key
```

### Kiến thức thực tế

- **Gán metadata và tag khi upload**:

  ```bash
  aws s3api put-object --bucket my-bucket --key report.html --body report.html \
    --content-type text/html \
    --metadata origin=paris \
    --tagging "Project=Blue&PHI=True"
  ```

  CLI tự thêm tiền tố `x-amz-meta-` cho `--metadata`. Xem lại:

  ```bash
  aws s3api head-object --bucket my-bucket --key report.html        # metadata
  aws s3api get-object-tagging --bucket my-bucket --key report.html # tags
  ```

  ```python
  s3.put_object(Bucket="my-bucket", Key="report.html", Body=data,
                ContentType="text/html",
                Metadata={"origin": "paris"},
                Tagging="Project=Blue&PHI=True")
  ```

- **Khác biệt then chốt**:

  | | User-defined metadata | Object tags |
  |---|---|---|
  | Sửa sau khi tạo | **Không** sửa tại chỗ được; phải **copy object đè lên chính nó** với metadata mới | Sửa độc lập bằng `PutObjectTagging` |
  | Giới hạn | Tổng kích thước metadata người dùng **2 KB** | Tối đa **10 tag** mỗi object |
  | Dùng trong IAM/bucket policy | Không | **Có** (`s3:ExistingObjectTag/<key>`, `s3:RequestObjectTag/<key>`) |
  | Dùng trong lifecycle / replication filter | Không | **Có** |
  | Tìm kiếm trực tiếp trên S3 | Không | Không |

- **Policy theo tag** (chỉ cho đọc object thuộc `Project=Blue`):

  ```json
  {
    "Effect": "Allow",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::my-bucket/*",
    "Condition": { "StringEquals": { "s3:ExistingObjectTag/Project": "Blue" } }
  }
  ```

- **Cập nhật hiện nay – S3 Metadata** (ra mắt cuối 2024): S3 có thể tự động ghi **metadata hệ thống, metadata tuỳ chỉnh và tag** của object vào các **bảng metadata** (S3 Tables, định dạng Apache Iceberg) gần thời gian thực, truy vấn bằng SQL qua **Amazon Athena**. Đây là cách AWS chính thức giải bài toán "tìm object theo metadata". Tuy nhiên đáp án kinh điển trong đề vẫn là **xây index ngoài trong DynamoDB**.
- Metadata là HTTP header nên **không chứa ký tự ngoài US-ASCII** an toàn khi dùng REST; tên key metadata được S3 chuyển về chữ thường.

### Ghi nhớ cho kỳ thi

- User metadata bắt đầu bằng **`x-amz-meta-`**.
- **Tag** dùng cho **phân quyền chi tiết** và **analytics** (và lifecycle filter).
- **Không search/filter** được theo metadata hay tag trên S3 → xây **index ngoài bằng DynamoDB** (đây là câu hỏi kiến trúc hay gặp).

---

## Tổng kết chương

| Chủ đề | Điều cần nhớ |
|---|---|
| Lifecycle – Transition | Chuyển object sang class rẻ hơn sau N ngày; áp dụng theo bucket, prefix, tag |
| Lifecycle – Expiration | Xoá object, xoá **noncurrent versions**, xoá **multipart upload dở dang**, xoá delete marker hết hạn |
| Tình huống versioning | Versioning + noncurrent → Standard-IA → Deep Archive |
| S3 Analytics | Khuyến nghị số ngày chuyển Standard → Standard-IA; CSV hằng ngày; 24–48 giờ mới có dữ liệu |
| Event Notifications | Đích: SNS, SQS, Lambda (+ EventBridge); quyền bằng **resource policy**; thường vài giây |
| EventBridge | Nhận mọi event; lọc nâng cao; nhiều đích; archive/replay |
| Baseline performance | 3.500 ghi / 5.500 đọc mỗi giây **mỗi prefix**; độ trễ 100–200 ms |
| Multi-part upload | Khuyến nghị > 100 MB, bắt buộc > 5 GB; upload song song |
| Transfer Acceleration | Qua edge location rồi mạng private AWS; tương thích multipart |
| Byte-Range Fetches | GET song song theo range; lấy một phần file (header) |
| Metadata vs Tags | Metadata `x-amz-meta-`; tag dùng cho phân quyền/analytics; **không search được** → index DynamoDB |
| Cập nhật 2024–2026 | S3 Select ngừng cho khách mới (7/2024); lifecycle mặc định bỏ qua object < 128 KB (9/2024); S3 Metadata tables (cuối 2024) |

---

## Câu hỏi ôn tập

*Nguồn: Amazon S3 Advanced Quiz. Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Làm sao để được thông báo khi có object được upload lên S3 bucket của bạn?

- A. S3 Select
- B. S3 Access Logs
- C. S3 Event Notifications
- D. S3 Analytics

<details><summary>Đáp án</summary>

**C.** S3 Event Notifications gửi event `ObjectCreated` tới SNS/SQS/Lambda (hoặc EventBridge). S3 Select dùng để truy vấn nội dung object (và đã ngừng cho khách mới); Access Logs là log ghi lại request, không phải cơ chế thông báo; S3 Analytics phân tích mẫu truy cập để gợi ý lifecycle.
</details>

**Câu 2.** Bucket S3 của bạn đã bật Versioning và chứa rất nhiều object. Bạn muốn xoá các phiên bản cũ để giảm chi phí. Cách tốt nhất để tự động hoá việc xoá này là gì?

- A. S3 Lifecycle Rules – Expiration Actions
- B. S3 Lifecycle Rules – Transition Actions
- C. S3 Access Logs

<details><summary>Đáp án</summary>

**A.** Expiration action (cụ thể là *Permanently delete noncurrent versions*) xoá các phiên bản cũ. Transition action chỉ chuyển storage class chứ không xoá. Access Logs không liên quan.
</details>

**Câu 3.** Làm sao để tự động chuyển object S3 giữa các tier (storage class) khác nhau?

- A. AWS Lambda
- B. CloudWatch Events
- C. S3 Lifecycle Rules

<details><summary>Đáp án</summary>

**C.** Lifecycle Rules (transition actions) là tính năng có sẵn để làm việc này, không cần tự viết code. Lambda hay CloudWatch Events (nay là EventBridge) có thể làm được nhưng thủ công và tốn kém hơn.
</details>

**Câu 4.** Khi upload file lớn lên S3 bằng Multi-part Upload, do sự cố mạng nên có rất nhiều part dở dang nằm trong bucket. Bạn không dùng các part này và chúng đang tốn tiền. Cách tốt nhất để xoá chúng là gì?

- A. Dùng AWS Lambda lặp qua từng part cũ/dở dang và xoá
- B. Dùng S3 Lifecycle Policy để tự động xoá các part cũ/dở dang
- C. Nhờ AWS Support xoá giúp

<details><summary>Đáp án</summary>

**B.** Lifecycle có action `AbortIncompleteMultipartUpload` (*Delete incomplete multipart uploads*) sau N ngày. Phương án A chạy được nhưng nhiều việc thủ công và tốn tiền hơn. AWS Support không làm việc này cho bạn.
</details>

**Câu 5.** Bạn muốn xây một index cho các file trong S3 bằng Amazon RDS PostgreSQL. Để làm vậy cần đọc **250 byte đầu** của mỗi object (chứa metadata về nội dung file). Bucket có hơn 100.000 file, tổng 50 TB. Làm sao xây index hiệu quả?

- A. Dùng tính năng RDS Import để nạp dữ liệu từ S3 vào PostgreSQL, rồi chạy SQL để tạo index
- B. Viết ứng dụng duyệt bucket, gửi **Byte Range Fetch** lấy 250 byte đầu và lưu thông tin vào RDS
- C. Viết ứng dụng duyệt bucket, đọc toàn bộ từng file, trích 250 byte đầu và lưu vào RDS
- D. Viết ứng dụng duyệt bucket, dùng S3 Select lấy 250 byte đầu và lưu vào RDS

<details><summary>Đáp án</summary>

**B.** Byte-Range Fetch (`Range: bytes=0-249`) chỉ tải đúng phần cần, nhanh và rẻ. A và C phải tải toàn bộ 50 TB. D sai vì S3 Select truy vấn dữ liệu có cấu trúc (CSV/JSON/Parquet) bằng SQL, không dùng để lấy N byte đầu của file bất kỳ (và S3 Select đã ngừng cho khách hàng mới từ 7/2024).
</details>

**Câu 6.** Bạn có một bộ dữ liệu lớn on-premises cần upload lên S3, chia thành các file 10 GB. Băng thông tốt nhưng kết nối Internet không ổn định. Cách tốt nhất để upload nhanh và tránh sự cố do mạng là gì?

- A. Dùng S3 Multi-part Upload và S3 Transfer Acceleration
- B. Dùng S3 Select và S3 Transfer Acceleration
- C. Chỉ dùng Multi-part Upload

<details><summary>Đáp án</summary>

**A.** File 10 GB (> 5 GB) **bắt buộc** dùng multipart; multipart còn cho phép upload song song và chỉ cần upload lại part bị lỗi khi mạng chập chờn. Transfer Acceleration đưa dữ liệu vào edge location gần nhất rồi đi qua mạng AWS, giảm phụ thuộc vào đường Internet công cộng. C thiếu phần tăng tốc; B sai vì S3 Select không liên quan đến upload.
</details>

---

[← Chương 12](ch12-aws-cli-sdk-iam-roles-policies.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chương 14 →](ch14-amazon-s3-security.md)

