# Chương 31 – AWS Other Services

> **Nguồn:** 11 video của chương + *Other Services Quiz* (4 câu, bổ sung 6 câu tự soạn).
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay (2026). Kỳ thi hiện hành là **DVA-C02**. Các dịch vụ trong chương thường chỉ xuất hiện **1–2 câu, mức cơ bản**, chủ yếu để nhận diện "dịch vụ nào làm việc gì".

## Mục tiêu chương

Sau chương này bạn có thể:

- Nhận diện đúng dịch vụ cho từng nhu cầu: gửi email (**SES**), tìm kiếm/phân tích (**OpenSearch**), truy vấn SQL trên S3 (**Athena**), streaming Kafka (**MSK**), chứng chỉ TLS (**ACM**, **AWS Private CA**), phát hiện dữ liệu nhạy cảm (**Macie**), cấu hình động / feature flag (**AppConfig**).
- Biết các kiến trúc tích hợp phổ biến: DynamoDB Streams → Lambda → OpenSearch; CloudWatch Logs / Kinesis → OpenSearch; MSK → Flink/Glue/Lambda.
- Tối ưu hiệu năng và chi phí Athena (columnar, nén, partition, file lớn) và hiểu Federated Query.
- Phân biệt Kinesis Data Streams và Amazon MSK.
- Cấp chứng chỉ ACM cho ALB qua DNS validation với Route 53.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001, 002 | Section Introduction / AWS SES | Bài 1 – Amazon SES |
| 003 | Amazon OpenSearch Service - Overview | Bài 2 – Amazon OpenSearch Service |
| 004, 005 | Amazon Athena - Overview | Bài 3 – Amazon Athena |
| 006 | Amazon MSK - Overview | Bài 4 – Amazon MSK |
| 007, 008 | Amazon Certificate Manager (ACM) | Bài 5 – AWS Certificate Manager (ACM) |
| 009 | ACM Private CA - Overview | Bài 6 – AWS Private CA |
| 010 | Amazon Macie | Bài 7 – Amazon Macie |
| 011 | AWS AppConfig - Overview | Bài 8 – AWS AppConfig |
| Quiz | Other Services Quiz | Câu hỏi ôn tập |

---

## Bài 1 – Amazon SES

### Lý thuyết

- Chương này giới thiệu các dịch vụ có thể xuất hiện **1–2 câu cơ bản** trong đề; không đi sâu.
- **Amazon SES (Simple Email Service)**: dịch vụ **gửi email** (và **nhận email**).
- Gửi email qua **SMTP interface** hoặc **AWS SDK**.
- Nhận email: tích hợp với **S3** (lưu thư), **SNS** (thông báo), **Lambda** (xử lý).
- Quyền gửi/nhận được kiểm soát bằng **IAM**.
- Mẹo đề: đề hay "bẫy" bạn chọn SES cho việc không liên quan. **SES = email.** Câu hỏi nói về email thì SES là ứng viên, ngược lại thì không.

### Kiến thức thực tế

Gửi email bằng SDK (Python, SES API v2):

```python
import boto3

ses = boto3.client("sesv2", region_name="ap-southeast-1")
ses.send_email(
    FromEmailAddress="no-reply@example.com",
    Destination={"ToAddresses": ["user@example.com"]},
    Content={"Simple": {
        "Subject": {"Data": "Xác nhận đơn hàng"},
        "Body": {"Text": {"Data": "Cảm ơn bạn đã đặt hàng."},
                 "Html": {"Data": "<h1>Cảm ơn bạn đã đặt hàng</h1>"}}
    }},
)
```

```bash
aws sesv2 create-email-identity --email-identity example.com     # xác minh domain
aws sesv2 send-email --from-email-address no-reply@example.com \
  --destination ToAddresses=user@example.com \
  --content '{"Simple":{"Subject":{"Data":"Hi"},"Body":{"Text":{"Data":"Hello"}}}}'
```

- Tài khoản mới ở chế độ **sandbox**: chỉ gửi được tới địa chỉ/domain **đã xác minh**, có giới hạn số lượng. Phải **xin production access** trước khi gửi cho khách hàng thật.
- Phải **xác minh identity** (email hoặc domain), cấu hình **DKIM, SPF, DMARC** để email không vào spam.
- Theo dõi **bounce** và **complaint** (qua SNS hoặc configuration set + EventBridge/Firehose). Tỉ lệ bounce/complaint cao có thể khiến tài khoản bị tạm khoá gửi.
- IAM policy tối thiểu: `ses:SendEmail` / `ses:SendRawEmail`, có thể giới hạn bằng điều kiện `ses:FromAddress`.
- Phân biệt các dịch vụ "gửi thông báo":

  | Dịch vụ | Dùng cho |
  |---|---|
  | **SES** | Email giao dịch / marketing số lượng lớn |
  | **SNS** | Pub/sub, fan-out; có thể gửi email đơn giản tới subscriber đã xác nhận, SMS, push |
  | **AWS End User Messaging** (trước đây là các kênh SMS/voice/push của **Amazon Pinpoint**) | SMS, voice, push. AWS đang chuyển dần Pinpoint sang End User Messaging; tính năng engagement/campaign của Pinpoint đã được thông báo ngừng hỗ trợ, nên kiểm tra trang AWS trước khi dùng cho dự án mới |

### Ghi nhớ cho kỳ thi

- Gửi **email số lượng lớn bằng SDK** hoặc SMTP = **SES**.
- Không chọn SES cho hàng đợi (SQS), pub/sub (SNS), streaming (Kinesis).

---

## Bài 2 – Amazon OpenSearch Service

### Lý thuyết

- **Amazon OpenSearch Service** là **kế nhiệm của Amazon Elasticsearch Service** (đổi tên vì vấn đề license).
- So với DynamoDB: DynamoDB chỉ truy vấn theo **primary key** hoặc **index**; OpenSearch **tìm kiếm trên mọi field**, kể cả **khớp một phần (partial match)**.
- Thường dùng làm **bổ trợ cho một database khác** để cung cấp chức năng search; ngoài ra còn làm **analytics**.
- **Hai chế độ:**
  - **Managed cluster**: instance vật lý được provision, bạn nhìn thấy chúng.
  - **Serverless**: AWS lo scaling và vận hành.
- Có **query language riêng**; video nói SQL không có sẵn mà bật qua **plugin**.
- **Nguồn dữ liệu:** Kinesis Data Firehose, AWS IoT, CloudWatch Logs, ứng dụng tự viết.
- **Bảo mật:** tích hợp **Cognito**, **IAM**, mã hoá **at rest** và **in-flight**.
- **OpenSearch Dashboards** để trực quan hoá dữ liệu.

#### Các kiến trúc phổ biến

| # | Kiến trúc | Đặc điểm |
|---|---|---|
| 1 | **DynamoDB → DynamoDB Stream → Lambda → OpenSearch** | App **search** trên OpenSearch (partial match theo tên) để lấy **item ID**, rồi gọi **DynamoDB** lấy item đầy đủ. DynamoDB vẫn là nguồn dữ liệu chính |
| 2 | **CloudWatch Logs → Subscription Filter → Lambda (AWS quản lý) → OpenSearch** | **Real time** |
| 3 | **CloudWatch Logs → Subscription Filter → Kinesis Data Firehose → OpenSearch** | **Near real time** |
| 4 | **Kinesis Data Streams → Kinesis Data Firehose (tuỳ chọn transform bằng Lambda) → OpenSearch** | **Near real time** |
| 5 | **Kinesis Data Streams → Lambda (code tự viết) → OpenSearch** | **Real time** |

### Kiến thức thực tế

Lambda nhận DynamoDB Stream và ghi vào OpenSearch (Python, ký SigV4 bằng `opensearch-py`):

```python
import boto3
from opensearchpy import OpenSearch, RequestsHttpConnection, AWSV4SignerAuth

host = "search-games-xxxx.ap-southeast-1.es.amazonaws.com"
auth = AWSV4SignerAuth(boto3.Session().get_credentials(), "ap-southeast-1", "es")
client = OpenSearch(hosts=[{"host": host, "port": 443}], http_auth=auth,
                    use_ssl=True, connection_class=RequestsHttpConnection)

def handler(event, context):
    for r in event["Records"]:
        pk = r["dynamodb"]["Keys"]["playerId"]["S"]
        if r["eventName"] == "REMOVE":
            client.delete(index="players", id=pk, ignore=[404])
        else:
            img = r["dynamodb"]["NewImage"]
            client.index(index="players", id=pk, body={"name": img["name"]["S"]})
```

Truy vấn tìm kiếm khớp một phần:

```json
GET players/_search
{ "query": { "match_phrase_prefix": { "name": "steph" } } }
```

- **Cập nhật so với video:**
  - OpenSearch hiện hỗ trợ **SQL** và **PPL** (Piped Processing Language) thông qua plugin SQL được cài sẵn trong Amazon OpenSearch Service, nên bạn có thể truy vấn SQL mà không phải tự cài.
  - **Kinesis Data Firehose** đã đổi tên thành **Amazon Data Firehose**.
  - Có **Amazon OpenSearch Ingestion** (pipeline managed dựa trên Data Prepper) và **zero-ETL integration DynamoDB → OpenSearch**, thay cho việc tự viết Lambda ở kiến trúc 1.
- **Chi phí:** managed cluster tính theo giờ instance + EBS; serverless tính theo OCU (OpenSearch Compute Unit) và có mức tối thiểu, nên với khối lượng nhỏ chưa chắc đã rẻ hơn.
- Best practice: đặt domain trong **VPC**, bật **fine-grained access control**, dùng **3 AZ** và dedicated master node cho production.

### Ghi nhớ cho kỳ thi

- "Tìm kiếm", "partial match", "full-text search" trên dữ liệu DynamoDB = **OpenSearch** (qua DynamoDB Streams + Lambda).
- Elasticsearch cũ = **OpenSearch**.
- Firehose = near real time; Lambda = real time.

---

## Bài 3 – Amazon Athena

### Lý thuyết

- **Athena**: dịch vụ truy vấn **serverless** để phân tích dữ liệu **nằm trong S3** bằng **SQL chuẩn**, **không cần di chuyển dữ liệu**.
- Xây dựng trên engine **Presto** (video).
- Định dạng hỗ trợ: **CSV, JSON, ORC, Avro, Parquet**…
- **Giá:** trả tiền theo **TB dữ liệu được quét**; không cần provision database.
- Thường dùng với **Amazon QuickSight** để làm báo cáo/dashboard (QuickSight → Athena → S3).
- **Use case:** ad hoc query, BI, analytics, reporting, **phân tích log** của dịch vụ AWS: **VPC Flow Logs, ELB logs, CloudTrail**, S3 access logs…
- Mẹo đề: **"phân tích dữ liệu trong S3 bằng serverless SQL" = Athena**.

#### Cải thiện hiệu năng (và chi phí)

| Kỹ thuật | Giải thích |
|---|---|
| **Dùng định dạng columnar** | Chỉ quét cột cần thiết. Khuyến nghị **Apache Parquet** hoặc **ORC**. Dùng **AWS Glue** (ETL job) để chuyển CSV → Parquet |
| **Nén dữ liệu** | Quét ít byte hơn (gzip, Snappy, ZSTD, LZO, bzip2…) |
| **Partition dữ liệu** | Tổ chức đường dẫn S3 theo cột hay lọc, ví dụ `s3://flights/parquet/year=1991/month=1/day=1/`. Query có `WHERE year=1991 AND month=1 AND day=1` chỉ quét đúng thư mục đó |
| **Dùng file lớn** | Nhiều file nhỏ gây overhead; nên dùng file **≥ 128 MB** |

#### Federated Query

- Athena truy vấn được dữ liệu **ngoài S3**: database quan hệ và phi quan hệ, object, nguồn tuỳ chỉnh, trên AWS hoặc on-premises.
- Dùng **Data Source Connector**, thực chất là một **Lambda function** (mỗi nguồn một connector) chạy federated query sang dịch vụ khác.
- Nguồn ví dụ: **CloudWatch Logs, DynamoDB, RDS, ElastiCache, DocumentDB, Redshift, Aurora, SQL Server, MySQL, HBase trên EMR**, database on-premises… cộng với S3.
- Có thể **JOIN** và tính toán giữa các nguồn; kết quả lưu vào **S3** để phân tích sau.

### Kiến thức thực tế

- **Cập nhật so với video:** Athena **engine version 3** dựa trên **Trino** (nhánh phát triển từ Presto). Kiến thức "Athena dựa trên Presto" vẫn có thể gặp trong đề.
- **Giá tham khảo:** khoảng **5 USD / TB quét** (ở us-east-1), làm tròn lên và có mức tối thiểu **10 MB mỗi query**; câu lệnh DDL và query lỗi không tính tiền. Ngoài ra có **Provisioned Capacity** tính theo DPU cho khối lượng lớn ổn định.
- **CTAS** để chuyển dữ liệu sang Parquet + partition ngay trong Athena (không cần Glue job):

  ```sql
  CREATE TABLE flights_parquet
  WITH (format = 'PARQUET', write_compression = 'SNAPPY',
        external_location = 's3://my-bucket/flights_parquet/',
        partitioned_by = ARRAY['year'])
  AS SELECT origin, dest, delay, year FROM flights_csv;
  ```

- **Partition projection** giúp tránh phải chạy `MSCK REPAIR TABLE` / thêm partition thủ công khi có rất nhiều partition.
- Dùng **workgroup** để tách người dùng, đặt giới hạn dữ liệu quét mỗi query (kiểm soát chi phí) và nơi lưu kết quả riêng.
- Metadata của table nằm trong **AWS Glue Data Catalog**; **Glue Crawler** có thể tự suy ra schema.
- Hỗ trợ bảng **Apache Iceberg** (cho phép `UPDATE/DELETE/MERGE`, time travel).
- **QuickSight**: AWS đã gộp QuickSight vào bộ sản phẩm mới **Amazon Quick Suite** (cuối 2025); tính năng BI dashboard vẫn còn. Trong đề, cứ hiểu "QuickSight = BI dashboard".
- **Lỗi hay gặp:** quên dấu `/` cuối `LOCATION`; bucket kết quả khác region; thiếu quyền `s3:GetObject` trên bucket dữ liệu hoặc `s3:PutObject` trên bucket kết quả; KMS key không cho phép decrypt.

### Ghi nhớ cho kỳ thi

- **Serverless SQL trên S3** = **Athena**; kết hợp **QuickSight** để làm dashboard.
- Tối ưu: **Parquet/ORC**, **nén**, **partition**, **file lớn (≥ 128 MB)**; dùng **Glue** để chuyển định dạng.
- Truy vấn nhiều nguồn (DynamoDB, RDS, on-prem…) = **Federated Query** với **Data Source Connector (Lambda)**.

---

## Bài 4 – Amazon MSK

### Lý thuyết

- **Amazon MSK (Managed Streaming for Apache Kafka)**: **Kafka được quản lý hoàn toàn** trên AWS. Kafka là **lựa chọn thay thế Kinesis** để stream dữ liệu.
- Tạo/cập nhật/xoá cluster nhanh chóng; MSK tạo và quản lý **Kafka broker nodes** và **Zookeeper nodes**.
- Cluster triển khai trong **VPC**, trải **tối đa 3 AZ** (HA).
- **Tự phục hồi** khỏi các lỗi Kafka phổ biến.
- Dữ liệu lưu trên **EBS volume**, **bao lâu cũng được**.
- **MSK Serverless**: chạy Kafka mà không provision server hay quản lý capacity; MSK tự scale compute và storage.

#### Apache Kafka hoạt động thế nào

- Cluster gồm nhiều **broker**.
- **Producer** lấy dữ liệu từ nguồn (Kinesis, IoT, RDS…) và ghi vào **topic**; topic được **replicate** sang broker khác.
- **Consumer** **poll** từ topic, xử lý hoặc gửi đi (EMR, S3, SageMaker, Kinesis, RDS…).

#### Kinesis Data Streams so với Amazon MSK

| | Kinesis Data Streams | Amazon MSK |
|---|---|---|
| Kích thước message | **1 MB** (theo video) | Mặc định 1 MB, **cấu hình lớn hơn được** (ví dụ 10 MB) |
| Đơn vị | Data Stream + **Shard** | Kafka **Topic** + **Partition** |
| Scale | **Shard splitting** (tăng), **merging** (giảm) | **Chỉ thêm partition**, **không xoá được** |
| Mã hoá in-flight | TLS | **Plaintext hoặc TLS** |
| Mã hoá at rest | Có | Có |
| Lưu trữ | Theo cấu hình retention (tối đa 365 ngày) | **Bao lâu cũng được** (trả tiền EBS) |

#### Producer và Consumer

- **Produce:** viết **Kafka Producer**.
- **Consume:**
  - **Kinesis Data Analytics for Apache Flink** (ứng dụng Flink đọc trực tiếp từ MSK).
  - **AWS Glue** streaming ETL (chạy bằng Apache Spark Streaming).
  - **Lambda** với **MSK làm event source**.
  - **Kafka consumer** tự viết, chạy trên EC2, ECS, EKS…

### Kiến thức thực tế

Producer/consumer bằng Python (`kafka-python`) và tạo topic:

```bash
# Lấy bootstrap brokers
aws kafka get-bootstrap-brokers --cluster-arn arn:aws:kafka:eu-central-1:123456789012:cluster/demo/abc

# Tạo topic (dùng Kafka CLI)
kafka-topics.sh --bootstrap-server b-1.demo...:9094 --command-config client.properties \
  --create --topic orders --partitions 6 --replication-factor 3
```

```python
from kafka import KafkaProducer
import json
p = KafkaProducer(bootstrap_servers="b-1.demo...:9094", security_protocol="SSL",
                  value_serializer=lambda v: json.dumps(v).encode())
p.send("orders", {"orderId": 1, "total": 99})
p.flush()
```

Lambda event source mapping từ MSK:

```bash
aws lambda create-event-source-mapping --function-name process-orders \
  --event-source-arn arn:aws:kafka:eu-central-1:123456789012:cluster/demo/abc \
  --topics orders --starting-position LATEST --batch-size 100
```

- **Cập nhật so với video:**
  - **Kinesis Data Analytics for Apache Flink** đã đổi tên thành **Amazon Managed Service for Apache Flink**.
  - MSK hỗ trợ chế độ **KRaft** (Kafka không cần ZooKeeper) với các phiên bản Kafka mới; Kafka 4.x đã bỏ hẳn ZooKeeper.
  - MSK có thêm loại **Express brokers** (scale nhanh hơn, không phải quản lý storage) bên cạnh Standard brokers, và **MSK Connect** (Kafka Connect managed).
  - Kinesis Data Streams cũng đã tăng giới hạn kích thước record so với 1 MB trước đây (AWS công bố năm 2025); hãy kiểm tra tài liệu hiện hành. Trong đề, cứ nhớ "Kinesis 1 MB, MSK cấu hình lớn hơn được".
- Xác thực client MSK: **IAM access control** (khuyến nghị cho ứng dụng AWS), SASL/SCRAM (username/password trong Secrets Manager), mTLS.
- Khi nào chọn gì: đã có hệ sinh thái/kỹ năng Kafka hoặc cần di chuyển Kafka on-prem thì chọn **MSK**; muốn đơn giản, tích hợp AWS sâu thì **Kinesis**.

### Ghi nhớ cho kỳ thi

- "Kafka managed trên AWS" = **MSK** (có **MSK Serverless**).
- MSK: **topic/partition**, chỉ **thêm** partition; message lớn hơn 1 MB được; lưu dữ liệu lâu tuỳ ý.
- Consumer: **Flink**, **Glue**, **Lambda**, consumer tự viết.

---

## Bài 5 – AWS Certificate Manager (ACM)

### Lý thuyết

- **ACM**: provision, quản lý và triển khai **chứng chỉ SSL/TLS** dễ dàng.
- Dùng để cung cấp **mã hoá in-flight** cho website qua **HTTPS**.
- Ví dụ: client → **HTTPS** → **ALB** (gắn chứng chỉ ACM) → HTTP → ASG gồm các EC2.
- Hỗ trợ chứng chỉ TLS **public** và **private**.
- Chứng chỉ **public miễn phí**.
- **Tự động gia hạn** chứng chỉ.
- Tích hợp nạp chứng chỉ vào: **Elastic Load Balancer**, **CloudFront distribution**, **API Gateway**.
- Mẹo đề: dịch vụ giúp **mã hoá in-flight** và **sinh chứng chỉ** = **ACM**.

### Kiến thức thực tế

- **Chứng chỉ cho CloudFront phải được tạo ở region `us-east-1`** (N. Virginia). Với ALB/API Gateway regional thì tạo ở **cùng region** với tài nguyên.
- Chứng chỉ ACM public **không gắn trực tiếp được lên EC2** (không export private key). Muốn HTTPS tới tận EC2 thì dùng chứng chỉ tự quản. **Cập nhật 2025:** ACM có thêm **exportable public certificates** (có tính phí) để cài lên EC2/on-prem.
- **Email validation** không tự gia hạn được nếu không có người bấm xác nhận; **DNS validation** thì ACM tự gia hạn miễn là bản ghi CNAME còn đó. Luôn ưu tiên DNS validation.
- Chứng chỉ **import** (từ CA bên ngoài) **không tự gia hạn**; ACM gửi sự kiện sắp hết hạn tới **EventBridge** (và metric `DaysToExpiry`) để bạn cảnh báo.
- Ngành chứng chỉ đang **rút ngắn thời hạn chứng chỉ public** (theo quyết định của CA/Browser Forum, lộ trình giảm dần từ 2026). Với ACM + DNS validation thì việc gia hạn tự động nên ít bị ảnh hưởng; với chứng chỉ import thì cần quy trình gia hạn tự động.
- Wildcard: `*.example.com` bao phủ một cấp subdomain; một chứng chỉ có thể có nhiều SAN.

### Ghi nhớ cho kỳ thi

- Quản lý tập trung chứng chỉ SSL/TLS cho **ALB, CloudFront, API Gateway** = **ACM** (không phải KMS, IAM, S3).
- Public cert **miễn phí**, **tự gia hạn**; DNS validation qua Route 53.
- CloudFront dùng chứng chỉ ở **us-east-1**.

---

## Bài 6 – AWS Private CA

### Lý thuyết

- Ngoài chứng chỉ public, ACM có thể cấp **chứng chỉ private**; muốn vậy phải tạo **AWS Private Certificate Authority** (video gọi là *ACM Private CA*).
- Là dịch vụ **managed**; tạo được **Root CA** và **Subordinate CA** (CA cấp dưới, phụ thuộc root).
- Cấp và triển khai **end-entity X.509 certificate** cho ứng dụng; các chứng chỉ này **không dùng để tạo chứng chỉ mới**.
- Chứng chỉ chỉ được **tin cậy trong tổ chức** (những hệ thống tin cậy Private CA đó), **không dùng được trên internet công cộng**.
- Dịch vụ AWS tích hợp ACM (ALB, CloudFront, API Gateway, EKS…) có thể nạp **chứng chỉ private**.
- Cấp chứng chỉ cho **user, máy tính, API/HTTP endpoint, thiết bị IoT**.
- **Use case:**
  - **Mã hoá TLS nội bộ**.
  - **Ký code** (code signing) bằng mật mã.
  - **Xác thực** user, máy tính, API endpoint, thiết bị IoT.
  - Xây dựng **PKI (Public Key Infrastructure)** doanh nghiệp.

### Kiến thức thực tế

```bash
aws acm-pca create-certificate-authority \
  --certificate-authority-type ROOT \
  --certificate-authority-configuration '{
     "KeyAlgorithm":"RSA_2048","SigningAlgorithm":"SHA256WITHRSA",
     "Subject":{"CommonName":"Example Internal Root CA","Organization":"Example"}}'

# Xin chứng chỉ private qua ACM (được quản lý và tự gia hạn trong ACM)
aws acm request-certificate --domain-name api.internal.example \
  --certificate-authority-arn arn:aws:acm-pca:eu-central-1:123456789012:certificate-authority/xxxx
```

- **Tên hiện nay** là **AWS Private CA** (trước đây ACM Private CA); API/CLI namespace vẫn là `acm-pca`.
- **Chi phí đáng kể**: tính phí theo tháng cho mỗi CA (chế độ general-purpose khoảng vài trăm USD/tháng) cộng phí mỗi chứng chỉ cấp ra; có chế độ **short-lived certificate** rẻ hơn. Hãy xem bảng giá hiện hành và **xoá CA** sau khi thử nghiệm.
- Dùng cho **mTLS** giữa microservice (ví dụ với ALB mTLS, App Mesh/Service Connect), xác thực **IAM Roles Anywhere** (máy on-prem lấy credentials tạm thời bằng chứng chỉ X.509).

### Ghi nhớ cho kỳ thi

- Chứng chỉ **nội bộ**, **PKI doanh nghiệp**, không dùng internet công cộng = **AWS Private CA**.
- Root CA và Subordinate CA; end-entity X.509 cert.

---

## Bài 7 – Amazon Macie

### Lý thuyết

- **Macie**: dịch vụ **bảo mật và quyền riêng tư dữ liệu** được quản lý hoàn toàn, dùng **machine learning và pattern matching** để **phát hiện và bảo vệ dữ liệu nhạy cảm** trên AWS.
- Đặc biệt cảnh báo về **PII (Personally Identifiable Information)**.
- Luồng: dữ liệu trong **S3 bucket** → **Macie** phân tích, phân loại PII → gửi **finding** qua **EventBridge** → tích hợp **SNS**, **Lambda**…
- Macie **chỉ làm việc với S3** (tìm dữ liệu nhạy cảm trong S3).
- Bật bằng **một click**, chọn các bucket cần quét.

### Kiến thức thực tế

```bash
aws macie2 enable-macie
aws macie2 create-classification-job --job-type ONE_TIME --name scan-uploads \
  --s3-job-definition '{"bucketDefinitions":[{"accountId":"123456789012","buckets":["customer-uploads"]}]}'
aws macie2 list-findings
```

EventBridge rule bắt finding của Macie:

```json
{ "source": ["aws.macie"], "detail-type": ["Macie Finding"] }
```

- Ngoài job thủ công, Macie có **automated sensitive data discovery** (lấy mẫu liên tục toàn bộ bucket) và tự đánh giá **bảo mật bucket** (bucket public, không mã hoá, chia sẻ ra ngoài).
- Có thể định nghĩa **custom data identifier** (regex) cho dữ liệu riêng, ví dụ số CCCD, mã khách hàng.
- Finding có thể đẩy sang **AWS Security Hub**.
- **Chi phí** tính theo số bucket được đánh giá và **GB dữ liệu được quét**; quét toàn bộ data lake lớn có thể tốn kém, nên giới hạn phạm vi hoặc dùng sampling.
- Phân biệt: **Macie** (dữ liệu nhạy cảm trong S3), **GuardDuty** (phát hiện mối đe doạ từ log), **Inspector** (lỗ hổng phần mềm EC2/ECR/Lambda), **Shield** (DDoS), **KMS** (khoá mã hoá).

### Ghi nhớ cho kỳ thi

- **Tìm/bảo vệ dữ liệu nhạy cảm, PII trong S3** = **Macie**.
- Thông báo qua **EventBridge**.

---

## Bài 8 – AWS AppConfig

### Lý thuyết

- Thường cấu hình được đóng gói cùng ứng dụng hoặc qua biến môi trường. **AppConfig** cho phép **tách cấu hình ra ngoài ứng dụng**: **cấu hình, kiểm tra (validate) và triển khai cấu hình động**.
- Đổi cấu hình **không cần deploy code mới**, **không cần restart** ứng dụng.
- Use case:
  - **Feature flag**: deploy code có tính năng mới nhưng để flag **off**; khi sẵn sàng, bật flag trong AppConfig, ứng dụng tự nhận và kích hoạt tính năng.
  - **Tinh chỉnh hiệu năng** ứng dụng.
  - **Danh sách chặn/cho phép IP** (block list/allow list) thay đổi theo thời gian thực.
- Dùng cho ứng dụng trên **EC2, Lambda, ECS, EKS**…
- **Triển khai dần (gradual deployment)** thay vì đổi cho mọi instance cùng lúc; nếu có lỗi thì **rollback**.
- **Nguồn cấu hình:** **SSM Parameter Store**, **SSM Documents**, **S3 bucket**, và các nguồn khác.
- Ứng dụng **định kỳ poll** để lấy thay đổi.
- Khi triển khai cấu hình mới, AppConfig **theo dõi CloudWatch**; nếu **alarm** kích hoạt thì **tự rollback** cấu hình.
- **Validate** trước khi triển khai để tránh cấu hình sai:
  - **JSON Schema**: kiểm tra cú pháp, kiểu dữ liệu.
  - **Lambda function**: logic kiểm tra phức tạp bằng code.

### Kiến thức thực tế

Luồng thực tế với AppConfig (CLI):

```bash
APP=$(aws appconfig create-application --name shop --query Id --output text)
ENV=$(aws appconfig create-environment --application-id $APP --name prod \
  --monitors AlarmArn=arn:aws:cloudwatch:eu-central-1:123456789012:alarm:high-5xx \
  --query Id --output text)
PROF=$(aws appconfig create-configuration-profile --application-id $APP --name flags \
  --location-uri hosted --type AWS.AppConfig.FeatureFlags --query Id --output text)

aws appconfig create-hosted-configuration-version --application-id $APP \
  --configuration-profile-id $PROF --content-type application/json \
  --content fileb://flags.json version.out

aws appconfig start-deployment --application-id $APP --environment-id $ENV \
  --configuration-profile-id $PROF --configuration-version 1 \
  --deployment-strategy-id AppConfig.Linear50PercentEvery30Seconds
```

Ứng dụng đọc cấu hình (Python), dùng API phiên mới:

```python
import boto3, json
ac = boto3.client("appconfigdata")
token = ac.start_configuration_session(
    ApplicationIdentifier="shop", EnvironmentIdentifier="prod",
    ConfigurationProfileIdentifier="flags",
    RequiredMinimumPollIntervalInSeconds=30)["InitialConfigurationToken"]

resp = ac.get_latest_configuration(ConfigurationToken=token)
token = resp["NextPollConfigurationToken"]      # dùng cho lần poll sau
body = resp["Configuration"].read()
if body:                                          # rỗng nghĩa là cấu hình không đổi
    flags = json.loads(body)
    new_checkout = flags.get("new_checkout", {}).get("enabled", False)
```

- **Cập nhật so với các tài liệu cũ:** API `GetConfiguration` (namespace `appconfig`) đã **deprecated**; dùng **`appconfigdata`**: `StartConfigurationSession` + `GetLatestConfiguration`.
- Trên Lambda dùng **AWS AppConfig Lambda extension**; trên EC2/ECS/EKS dùng **AppConfig Agent** (sidecar/daemon) để cache cấu hình, đọc qua `http://localhost:2772/...`, đỡ phải tự poll và giảm chi phí gọi API.
- Có sẵn các **deployment strategy** như `AppConfig.AllAtOnce`, `AppConfig.Linear50PercentEvery30Seconds`, `AppConfig.Canary10Percent20Minutes`; có thể tự tạo (growth factor, bake time).
- AppConfig hỗ trợ **multi-variant feature flags** (trả giá trị khác nhau theo ngữ cảnh người dùng, ví dụ bật cho 10% user hoặc một nhóm khách hàng).
- So với **SSM Parameter Store**: Parameter Store chỉ lưu giá trị; AppConfig bổ sung **validation, triển khai dần, theo dõi alarm và rollback**.

### Ghi nhớ cho kỳ thi

- **Cấu hình động / feature flag không cần deploy lại code** = **AppConfig**.
- Nguồn: Parameter Store, SSM Documents, S3. Validate bằng **JSON Schema** hoặc **Lambda**. Rollback tự động khi **CloudWatch Alarm** kích hoạt.

---

## Tổng kết chương

| Dịch vụ | Từ khoá nhận diện trong đề | Điều cần nhớ |
|---|---|---|
| **SES** | Email | Gửi qua SMTP/SDK; nhận email → S3/SNS/Lambda; sandbox cần xin production access |
| **OpenSearch** | Search, partial match, kế nhiệm Elasticsearch | Managed hoặc Serverless; DynamoDB Streams → Lambda → OpenSearch; Dashboards |
| **Athena** | Serverless SQL trên S3, phân tích log | Trả theo TB quét; Parquet/ORC, nén, partition, file ≥ 128 MB; Federated Query qua Lambda connector |
| **MSK** | Kafka managed | Topic/partition, chỉ thêm partition; message > 1 MB; MSK Serverless; consumer: Flink, Glue, Lambda |
| **ACM** | Chứng chỉ SSL/TLS, HTTPS, in-flight encryption | Public miễn phí, tự gia hạn; ALB/CloudFront/API Gateway; CloudFront ở us-east-1 |
| **AWS Private CA** | Chứng chỉ nội bộ, PKI doanh nghiệp | Root/Subordinate CA; không tin cậy trên internet |
| **Macie** | PII, dữ liệu nhạy cảm trong S3 | ML + pattern matching; finding qua EventBridge |
| **AppConfig** | Cấu hình động, feature flag | Validate (JSON Schema/Lambda), triển khai dần, rollback theo CloudWatch Alarm |

---

## Câu hỏi ôn tập

*Nguồn: Other Services Quiz (câu 1–4). Vì quiz chỉ có 4 câu, câu 5–10 là **câu hỏi tự soạn** dựa trên nội dung video. Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Dịch vụ AWS nào cho phép gửi số lượng lớn email bằng AWS SDK?

- A. Simple Queue Service (SQS)
- B. Simple Notification Service (SNS)
- C. Kinesis Data Streams
- D. Simple Email Service (SES)

<details><summary>Đáp án</summary>

**D. SES.** SES là dịch vụ chuyên gửi (và nhận) email, qua SMTP hoặc SDK. SQS là hàng đợi, SNS là pub/sub (gửi email đơn giản cho subscriber đã xác nhận, không dành cho gửi email số lượng lớn tới khách hàng), Kinesis là streaming.
</details>

**Câu 2.** Bạn cần nạp chứng chỉ SSL lên Application Load Balancer và CloudFront distribution. Dịch vụ nào dùng để quản lý tập trung các chứng chỉ này?

- A. Amazon S3
- B. AWS Certificate Manager (ACM)
- C. Key Management Service (KMS)
- D. Identity and Access Management (IAM)

<details><summary>Đáp án</summary>

**B. ACM.** ACM cấp, quản lý, tự gia hạn và tích hợp sẵn với ALB, CloudFront, API Gateway. KMS quản lý khoá mã hoá, không phải chứng chỉ TLS. (IAM có thể lưu server certificate cũ, nhưng không phải cách quản lý tập trung được khuyến nghị.)
</details>

**Câu 3.** Dịch vụ AWS nào giúp bảo vệ dữ liệu nhạy cảm lưu trong S3 bucket?

- A. Relational Database Service (RDS)
- B. Amazon Shield
- C. Amazon Macie
- D. AWS KMS

<details><summary>Đáp án</summary>

**C. Macie.** Macie dùng ML và pattern matching để phát hiện dữ liệu nhạy cảm (PII) trong S3 và cảnh báo qua EventBridge. Shield chống DDoS; KMS quản lý khoá mã hoá (mã hoá dữ liệu nhưng không phát hiện dữ liệu nhạy cảm).
</details>

**Câu 4.** Website game dùng DynamoDB làm data store. Người dùng muốn có tính năng tìm game thủ khác theo tên, khớp một phần nếu được. Bạn khuyến nghị công nghệ nào?

- A. Amazon DynamoDB
- B. Amazon OpenSearch Service
- C. Amazon ECS
- D. Amazon S3

<details><summary>Đáp án</summary>

**B. OpenSearch.** DynamoDB chỉ truy vấn theo primary key/index, không hỗ trợ tìm kiếm khớp một phần hiệu quả. Kiến trúc: DynamoDB Streams → Lambda → OpenSearch; app search trên OpenSearch rồi lấy item đầy đủ từ DynamoDB.
</details>

**Câu 5.** *(câu hỏi tự soạn)* Đội phân tích cần chạy truy vấn SQL ad hoc trên log CloudTrail và ALB lưu trong S3, không muốn quản lý server nào. Dịch vụ nào phù hợp nhất?

- A. Amazon RDS
- B. Amazon Athena
- C. Amazon EMR
- D. Amazon OpenSearch Service (managed cluster)

<details><summary>Đáp án</summary>

**B. Athena.** Serverless, truy vấn SQL trực tiếp trên dữ liệu trong S3, trả tiền theo dữ liệu quét. RDS phải nạp dữ liệu vào database; EMR và OpenSearch managed cluster cần provision cluster.
</details>

**Câu 6.** *(câu hỏi tự soạn)* Chi phí Athena của bạn tăng cao vì truy vấn quét hàng TB file CSV nhỏ. Tổ hợp biện pháp nào giảm chi phí và tăng hiệu năng tốt nhất?

- A. Chuyển dữ liệu sang Parquet, nén, partition theo cột hay lọc, gộp thành file lớn
- B. Chia thành thật nhiều file nhỏ để Athena đọc song song
- C. Chuyển sang định dạng JSON không nén
- D. Tăng số DPU của workgroup

<details><summary>Đáp án</summary>

**A.** Định dạng columnar (Parquet/ORC) chỉ quét cột cần thiết; nén và partition giảm dữ liệu quét; file lớn (≥ 128 MB) giảm overhead. B làm tệ hơn vì nhiều file nhỏ gây overhead. C tăng dữ liệu quét. D không giảm lượng dữ liệu quét, vốn là yếu tố tính tiền theo mô hình mặc định.
</details>

**Câu 7.** *(câu hỏi tự soạn)* Điều nào sau đây **đúng** khi so sánh Amazon MSK với Kinesis Data Streams?

- A. Topic MSK có thể giảm số partition giống merge shard của Kinesis
- B. MSK cho phép cấu hình kích thước message lớn hơn 1 MB và lưu dữ liệu lâu hơn 1 năm (trả tiền EBS)
- C. MSK chỉ hỗ trợ mã hoá in-flight bằng plaintext
- D. MSK không thể dùng làm event source cho Lambda

<details><summary>Đáp án</summary>

**B.** A sai: MSK chỉ **thêm** được partition, không xoá. C sai: MSK hỗ trợ plaintext **hoặc TLS**. D sai: Lambda hỗ trợ MSK làm event source.
</details>

**Câu 8.** *(câu hỏi tự soạn)* Công ty muốn bật tính năng mới cho ứng dụng chạy trên Lambda và ECS mà **không deploy lại code**, triển khai thay đổi dần dần và tự động rollback nếu CloudWatch alarm báo lỗi. Nên dùng dịch vụ nào?

- A. AWS AppConfig
- B. SSM Parameter Store (chỉ lưu giá trị)
- C. AWS CodeDeploy
- D. Biến môi trường trong task definition

<details><summary>Đáp án</summary>

**A. AppConfig.** Hỗ trợ feature flag, validate (JSON Schema/Lambda), triển khai dần theo deployment strategy và rollback theo CloudWatch Alarm. Parameter Store không có triển khai dần/rollback; CodeDeploy dùng để deploy code; đổi biến môi trường cần chạy lại task.
</details>

**Câu 9.** *(câu hỏi tự soạn)* Các microservice nội bộ cần mã hoá TLS và xác thực lẫn nhau bằng chứng chỉ chỉ được tin cậy trong tổ chức. Giải pháp nào phù hợp?

- A. Chứng chỉ public miễn phí từ ACM
- B. AWS Private CA (ACM Private CA) cấp chứng chỉ private
- C. AWS KMS asymmetric key
- D. Amazon Macie

<details><summary>Đáp án</summary>

**B.** AWS Private CA tạo root/subordinate CA và cấp end-entity X.509 certificate dùng nội bộ (TLS nội bộ, xác thực máy/API/IoT, PKI doanh nghiệp). Chứng chỉ public cần domain công khai và không dành cho PKI nội bộ; KMS không cấp chứng chỉ; Macie không liên quan.
</details>

**Câu 10.** *(câu hỏi tự soạn)* Cần đưa log ứng dụng từ CloudWatch Logs vào Amazon OpenSearch theo **thời gian thực** (không phải near real time). Cách nào phù hợp?

- A. CloudWatch Logs Subscription Filter → Kinesis Data Firehose → OpenSearch
- B. CloudWatch Logs Subscription Filter → Lambda (do AWS quản lý) → OpenSearch
- C. Export CloudWatch Logs sang S3 mỗi ngày rồi nạp vào OpenSearch
- D. Athena Federated Query tới CloudWatch Logs

<details><summary>Đáp án</summary>

**B.** Subscription filter tới Lambda ghi vào OpenSearch theo real time. A là near real time (Firehose có buffer). C là batch theo ngày. D chỉ truy vấn, không nạp dữ liệu vào OpenSearch.
</details>

---

[← Chương 30](ch30-aws-security-encryption-kms-encryption.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Chương 33 →](ch33-preparing-for-the-exam-aws-certified-d.md)
