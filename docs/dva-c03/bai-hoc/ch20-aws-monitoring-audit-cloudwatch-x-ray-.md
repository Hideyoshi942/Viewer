# Chương 20 – AWS Monitoring & Audit: CloudWatch, X-Ray và CloudTrail

> **Nguồn:** 29 video của chương + *Monitoring & Audit Quiz* (24 câu).
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay (2026). Kỳ thi hiện tại là **DVA-C02**. Các điểm đã thay đổi so với lúc quay video được đánh dấu **[Cập nhật 2026]**.

## Mục tiêu chương

Sau chương này bạn có thể:

- Giải thích vì sao cần monitoring và vai trò của bộ ba **CloudWatch – X-Ray – CloudTrail**.
- Dùng **CloudWatch Metrics**: namespace, dimension, basic và detailed monitoring, **custom metric** với `PutMetricData`, high resolution.
- Dùng **CloudWatch Logs**: log group, log stream, retention, export S3, subscription filter, Logs Insights, Live Tail, **metric filter**.
- Cài và cấu hình **CloudWatch Unified Agent** để đẩy RAM, disk, process và log file từ EC2/on-premises.
- Tạo **CloudWatch Alarms**, composite alarm, EC2 recovery, và test bằng `set-alarm-state`.
- Hiểu **CloudWatch Synthetics Canary**.
- Dùng **Amazon EventBridge**: rule theo event pattern, schedule, event bus (default, partner, custom), archive & replay, schema registry, resource policy, gom sự kiện đa tài khoản.
- Instrument ứng dụng với **AWS X-Ray**: segment, subsegment, trace, annotation và metadata, sampling rule, API, tích hợp với Beanstalk, ECS, Lambda.
- Biết **AWS Distro for OpenTelemetry (ADOT)** và lý do AWS hiện khuyến nghị OpenTelemetry thay X-Ray SDK.
- Dùng **CloudTrail**: management, data, insights events; retention 90 ngày; S3 + Athena; tích hợp EventBridge.
- Phân biệt **CloudTrail và CloudWatch và X-Ray**.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001–002 | Section Introduction, Monitoring Overview in AWS | Bài 1 – Tổng quan monitoring trên AWS |
| 003 | CloudWatch Metrics | Bài 2 – CloudWatch Metrics |
| 004 | CloudWatch Custom Metrics | Bài 3 – CloudWatch Custom Metrics |
| 005–007 | CloudWatch Logs (+ Hands On, Live Tail Hands On) | Bài 4 – CloudWatch Logs |
| 008 | CloudWatch Agent & CloudWatch Logs Agent | Bài 5 – CloudWatch Agent |
| 009–010 | CloudWatch Logs - Metric Filters | Bài 6 – Metric Filters |
| 011–012 | CloudWatch Alarms | Bài 7 – CloudWatch Alarms |
| 013 | CloudWatch Synthetics | Bài 8 – CloudWatch Synthetics Canary |
| 014–016 | Amazon EventBridge (+ Hands On, Multi-Account Aggregation) | Bài 9 – Amazon EventBridge |
| 017–018 | X-Ray Overview | Bài 10 – Tổng quan AWS X-Ray |
| 019–020 | X-Ray Instrumentation and Concepts, Sampling Rules | Bài 11 – X-Ray: instrumentation, khái niệm và sampling |
| 021 | X-Ray APIs | Bài 12 – X-Ray APIs |
| 022–023 | X-Ray with Beanstalk, X-Ray & ECS | Bài 13 – X-Ray với Elastic Beanstalk và ECS |
| 024 | AWS Distro for OpenTelemetry | Bài 14 – AWS Distro for OpenTelemetry (ADOT) |
| 025–027 | CloudTrail (+ Hands On, EventBridge Integration) | Bài 15 – AWS CloudTrail |
| 028–029 | CloudTrail vs CloudWatch vs X-Ray, AWS Quick Clean-Up | Bài 16 – So sánh CloudTrail, CloudWatch, X-Ray và dọn dẹp |
| Quiz | Monitoring & Audit Quiz | Câu hỏi ôn tập (24 câu) |

---

## Bài 1 – Tổng quan monitoring trên AWS

### Lý thuyết

- Tình huống mở đầu: ứng dụng chạy trên cloud, 2 giờ sáng sếp gọi báo "ứng dụng chết rồi". Ta đã deploy nhưng **quên bật monitoring**. Một developer giỏi **không bao giờ deploy mà không bật monitoring**.
- Ta đã biết cách deploy an toàn và tự động (Infrastructure as Code, Beanstalk…), nhưng **người dùng không quan tâm ta deploy thế nào**. Họ chỉ quan tâm ứng dụng **có chạy tốt không**:
  - **Latency:** độ trễ có tăng theo thời gian không, vì sao?
  - **Outage:** khi có sự cố, trải nghiệm khách hàng không được giảm sút (vì thế mới cần kiến trúc high availability).
  - Không muốn **người dùng là người báo lỗi** cho mình. Muốn **phát hiện và khắc phục trước**.
- Monitoring giúp: ngăn sự cố trước khi xảy ra, phát hiện sự cố trước người dùng, theo dõi **hiệu năng và chi phí**, xem **xu hướng** (scaling, mẫu outage), học hỏi và cải tiến.

#### Bộ ba dịch vụ monitoring

| Dịch vụ | Chức năng |
|---|---|
| **CloudWatch** | **Metrics** (thu thập chỉ số), **Logs** (thu thập, lưu, phân tích log), **Events** (gửi thông báo khi có sự kiện, nay là EventBridge), **Alarms** (phản ứng thời gian thực với metric/event/log) |
| **X-Ray** | Gỡ lỗi **hiệu năng và lỗi** của ứng dụng, xem latency và error; **distributed tracing** cho microservices: theo dõi một request đi qua các service và các dịch vụ AWS (S3, DynamoDB…) mất bao lâu |
| **CloudTrail** | Giám sát nội bộ các **API call** và **audit** thay đổi của người dùng trên tài nguyên AWS |

### Kiến thức thực tế

- Ba "trụ cột" của observability là **metrics, logs, traces**. Trên AWS chúng tương ứng với **CloudWatch Metrics**, **CloudWatch Logs** và **X-Ray** (hoặc OpenTelemetry). **CloudTrail** là lớp **audit/governance** riêng.
- **[Cập nhật 2026]** X-Ray đã được gộp vào **CloudWatch console** (Trace Map, Traces, Transaction Search). Nhiều tính năng mới như **Application Signals** (APM tự động dựa trên OpenTelemetry) cũng nằm trong CloudWatch. Video nói X-Ray "chưa phổ biến", nhưng nay tracing đã là thực hành chuẩn.

### Ghi nhớ cho kỳ thi

- **CloudWatch = metrics, logs, alarms, events**; **X-Ray = tracing, latency/error, service map**; **CloudTrail = ai gọi API gì, khi nào**.

---

## Bài 2 – CloudWatch Metrics

### Lý thuyết

- CloudWatch cung cấp **metric cho mọi dịch vụ AWS**. Tên metric thường tự giải thích (vd `CPUUtilization`, `NetworkIn`). Hiểu metric để biết dịch vụ đang hoạt động thế nào và để troubleshoot.
- Cấu trúc metric:

| Khái niệm | Ý nghĩa |
|---|---|
| **Namespace** | "Thư mục" chứa metric, vd `AWS/EC2`, `AWS/ELB`, hay namespace tự đặt |
| **Dimension** | Thuộc tính của metric (vd `InstanceId`, `Environment`…). Tối đa **30 dimension mỗi metric** |
| **Timestamp** | Mỗi điểm dữ liệu có thời gian |
| **Dashboard** | Gom các metric thành bảng điều khiển |

#### EC2: basic monitoring và detailed monitoring

| | Basic (mặc định) | Detailed |
|---|---|---|
| Chu kỳ | **5 phút** | **1 phút** |
| Chi phí | Miễn phí | **Trả thêm** |
| Lợi ích | — | Phản ứng nhanh hơn; ASG scale-out/scale-in nhanh hơn |

- Free tier cho phép **10 detailed monitoring metric**.
- **RAM (memory usage) KHÔNG được đẩy mặc định.** Phải đẩy từ trong instance dưới dạng **custom metric** (xem Bài 3 và Bài 5).

### Kiến thức thực tế

- Metric của EC2 mặc định gồm CPU, network, disk (cho instance store), status check. **Không có**: memory, swap, dung lượng đĩa đã dùng của EBS (disk space). Muốn có thì dùng CloudWatch Agent.
- **Retention của metric** (CloudWatch tự giảm độ phân giải theo thời gian): dữ liệu < 60 giây giữ 3 giờ; 1 phút giữ 15 ngày; 5 phút giữ 63 ngày; 1 giờ giữ 455 ngày (15 tháng). Không xoá metric thủ công được, metric không có dữ liệu mới sẽ tự hết hạn.
- API mới nên dùng là `GetMetricData` (lấy nhiều metric và hỗ trợ metric math) thay cho `GetMetricStatistics`.

  ```python
  import boto3, datetime as dt
  cw = boto3.client("cloudwatch")
  r = cw.get_metric_data(
      MetricDataQueries=[{
          "Id": "cpu",
          "MetricStat": {
              "Metric": {"Namespace": "AWS/EC2", "MetricName": "CPUUtilization",
                         "Dimensions": [{"Name": "InstanceId", "Value": "i-0123456789abcdef0"}]},
              "Period": 300, "Stat": "Average"}}],
      StartTime=dt.datetime.utcnow() - dt.timedelta(hours=3),
      EndTime=dt.datetime.utcnow())
  print(r["MetricDataResults"][0]["Values"])
  ```

### Ghi nhớ cho kỳ thi

- Muốn metric EC2 **mỗi 1 phút** thì bật **Detailed Monitoring** (trả phí). Không phải custom metric, không phải high resolution.
- **RAM không có sẵn** nên phải dùng custom metric (qua CloudWatch Agent).
- Tối đa **30 dimension**/metric.

---

## Bài 3 – CloudWatch Custom Metrics

### Lý thuyết

- Tự định nghĩa metric riêng, vd: memory (RAM), dung lượng đĩa, số user đang đăng nhập…
- API: **`PutMetricData`**.
- Thêm **dimension** tuỳ ý (vd `Instance.id`, `Environment.name`).
- Tham số **`StorageResolution`** có 2 giá trị:

| Loại | StorageResolution | Tần suất đẩy/đọc |
|---|---|---|
| **Standard resolution** | 60 | 1 phút |
| **High resolution** | 1 | **1, 5, 10, 30 giây** (chi phí cao hơn) |

- **Điểm thi quan trọng:** `PutMetricData` chấp nhận timestamp **tới 2 tuần trong quá khứ** và **2 giờ trong tương lai** mà **không báo lỗi**. Vì vậy phải đảm bảo **giờ hệ thống của EC2 chính xác** nếu muốn metric khớp thời gian thực.
- CloudWatch Unified Agent thực chất cũng dùng `PutMetricData` để đẩy metric định kỳ.

### Kiến thức thực tế

- Đẩy custom metric từ code:

  ```python
  import boto3
  cw = boto3.client("cloudwatch")
  cw.put_metric_data(
      Namespace="MyApp",
      MetricData=[{
          "MetricName": "LoggedInUsers",
          "Dimensions": [{"Name": "Environment", "Value": "prod"}],
          "Value": 42, "Unit": "Count",
          "StorageResolution": 60,
      }])
  ```

  ```javascript
  import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch";
  const cw = new CloudWatchClient({});
  await cw.send(new PutMetricDataCommand({
    Namespace: "MyApp",
    MetricData: [{ MetricName: "OrdersPlaced", Value: 1, Unit: "Count",
                   Dimensions: [{ Name: "Environment", Value: "prod" }] }],
  }));
  ```

- **Embedded Metric Format (EMF):** trong Lambda/container, thay vì gọi `PutMetricData` (thêm latency, có thể bị throttle), hãy **ghi log JSON theo định dạng EMF** ra stdout. CloudWatch Logs tự trích xuất thành metric. Đây là cách AWS khuyến nghị cho Lambda.

  ```json
  {
    "_aws": {
      "Timestamp": 1760428800000,
      "CloudWatchMetrics": [{
        "Namespace": "MyApp",
        "Dimensions": [["Service"]],
        "Metrics": [{"Name": "ProcessingLatency", "Unit": "Milliseconds"}]
      }]
    },
    "Service": "checkout",
    "ProcessingLatency": 125
  }
  ```

- **Chi phí:** custom metric tính phí **theo từng metric** (mỗi tổ hợp namespace + tên + dimension là một metric riêng) và theo số lần gọi API. Đừng dùng dimension có **cardinality cao** (vd `UserId`, `RequestId`) vì sẽ sinh ra hàng nghìn metric.
- Gom nhiều điểm vào một lần gọi `PutMetricData` (một request chứa được nhiều metric/giá trị) để giảm số API call và tránh throttling.

### Ghi nhớ cho kỳ thi

- Đẩy custom metric: **`PutMetricData`** (không có `SendMetricData`, `PutCustomMetric`…).
- High resolution: tối thiểu **1 giây** (1/5/10/30 giây). Standard: 60 giây.
- Timestamp được chấp nhận: **-2 tuần đến +2 giờ**, không lỗi, nên phải đồng bộ giờ EC2.

---

## Bài 4 – CloudWatch Logs

### Lý thuyết

#### Khái niệm cơ bản

| Khái niệm | Ý nghĩa |
|---|---|
| **Log group** | Tên tuỳ ý, thường đại diện cho **một ứng dụng** |
| **Log stream** | Bên trong log group; đại diện cho **một instance** của ứng dụng, một file log, hoặc một container |
| **Retention (expiration policy)** | **Mặc định không bao giờ hết hạn**; có thể đặt từ **1 ngày đến 10 năm**. Đặt ở **cấp log group** |
| **Mã hoá** | Log **mặc định được mã hoá**; có thể dùng **KMS key riêng** |

- **Đích gửi log**: export theo lô (batch) sang **S3**; stream sang **Kinesis Data Streams**, **Kinesis Data Firehose**, **Lambda**, **OpenSearch**.

#### Nguồn log

- **SDK**, **CloudWatch Logs Agent** (cũ, coi như deprecated), **CloudWatch Unified Agent**.
- **Elastic Beanstalk**: thu log ứng dụng.
- **ECS**: log từ container.
- **Lambda**: log từ function.
- **VPC Flow Logs**: metadata lưu lượng mạng trong VPC.
- **API Gateway**: mọi request gửi tới API Gateway.
- **CloudTrail**: gửi log theo filter.
- **Route 53**: log các DNS query.

#### CloudWatch Logs Insights

- Công cụ **truy vấn** log: viết query, chọn khoảng thời gian, nhận kết quả dạng **visualization** và xem được các dòng log tạo ra kết quả.
- Có sẵn nhiều **query mẫu**: 25 sự kiện gần nhất, số sự kiện có exception/error, tìm theo IP…
- Ngôn ngữ truy vấn riêng; **field được tự động phát hiện**; hỗ trợ filter, thống kê tổng hợp (aggregate), sort, limit…
- **Lưu query** và **thêm vào CloudWatch Dashboard**.
- Truy vấn **nhiều log group cùng lúc**, kể cả **ở tài khoản khác**.
- Là **query engine, không phải real-time engine**: chỉ truy vấn dữ liệu lịch sử tại thời điểm chạy.

#### Export sang S3 và subscription

| | **S3 Export** | **Subscription Filter** |
|---|---|---|
| Kiểu | Batch | **Real-time** stream |
| API | **`CreateExportTask`** | `PutSubscriptionFilter` |
| Độ trễ | **Tối đa 12 giờ** mới xong | Gần như tức thì |
| Đích | S3 | Kinesis Data Streams, Kinesis Data Firehose, Lambda (và OpenSearch qua Lambda có sẵn) |

- Subscription filter dùng **filter pattern** để chọn sự kiện nào được gửi đi.
- Đi vào **Kinesis Data Streams**: tích hợp tiếp với Firehose, Kinesis Data Analytics, EC2, Lambda.
- Đi vào **Kinesis Data Firehose**: đẩy gần real-time sang S3, OpenSearch…
- Đi vào **Lambda**: function tự viết, hoặc Lambda do AWS quản lý để đẩy real-time vào OpenSearch.

#### Gom log đa tài khoản, đa region

- Subscription filter cho phép gom log từ **nhiều tài khoản và nhiều region** về **một đích chung**, ví dụ Kinesis Data Streams ở tài khoản trung tâm, rồi Firehose, rồi S3.
- Cơ chế (tài khoản gửi là **sender**, tài khoản nhận là **recipient**):
  1. Ở recipient: tạo **IAM role** có quyền ghi vào Kinesis Data Stream, và cho phép CloudWatch Logs **assume** role này.
  2. Ở recipient: tạo **subscription destination** (đại diện ảo cho Kinesis Data Stream) và gắn **destination access policy** cho phép tài khoản sender gửi dữ liệu.
  3. Ở sender: tạo **subscription filter** trỏ tới ARN của destination.

#### Live Tail

- Xem log **theo thời gian thực** khi chúng được ghi vào, có thể lọc theo log group, log stream (tuỳ chọn) và filter pattern. Rất tiện để debug.
- Có miễn phí một lượng sử dụng mỗi ngày (video nói khoảng **1 giờ/ngày**). Nhớ **đóng phiên Live Tail** khi xong để tránh tốn phí.

### Kiến thức thực tế

- **[Cập nhật 2026] Đổi tên dịch vụ:** *Kinesis Data Firehose* nay là **Amazon Data Firehose**; *Kinesis Data Analytics* nay là **Amazon Managed Service for Apache Flink**. Đề thi có thể dùng cả tên cũ lẫn tên mới.
- **[Cập nhật 2026] Log class Infrequent Access:** giá lưu/ingest rẻ hơn Standard, dùng cho log ít truy vấn. Đổi lại bị **giới hạn tính năng** (vd không hỗ trợ metric filter, subscription filter, Live Tail). Log class chọn lúc tạo log group và không đổi được sau đó.
- **[Cập nhật 2026]** Logs Insights ngoài ngôn ngữ truy vấn gốc nay hỗ trợ thêm **OpenSearch PPL** và **SQL**. Ngoài ra có tính năng sinh query bằng ngôn ngữ tự nhiên. Đề thi vẫn chủ yếu hỏi về khả năng chung của Logs Insights.
- Mỗi log group có tối đa **2 subscription filter**. Ngoài ra có **account-level subscription filter** áp dụng cho nhiều log group.
- Lambda tự tạo log group `/aws/lambda/<tên-function>` với retention **Never expire**. Hãy đặt retention (vd 14–30 ngày) để tránh chi phí lưu trữ tăng mãi. Có thể đặt bằng IaC:

  ```yaml
  Resources:
    HelloLogs:
      Type: AWS::Logs::LogGroup
      Properties:
        LogGroupName: /aws/lambda/HelloWorld
        RetentionInDays: 30
  ```

- Lambda, ECS, EC2 cần quyền `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents` (Lambda có sẵn trong managed policy `AWSLambdaBasicExecutionRole`).
- Export S3 cần **bucket policy** cho principal `logs.<region>.amazonaws.com`. Nếu bucket mã hoá SSE-KMS thì key policy cũng phải cho phép.
- **Không log dữ liệu nhạy cảm** (mật khẩu, số thẻ). CloudWatch Logs có **data protection policy** để phát hiện và che (mask) dữ liệu nhạy cảm.

### Ghi nhớ cho kỳ thi

- Log **mặc định không bao giờ hết hạn**; retention đặt ở **log group** (1 ngày – 10 năm).
- Export S3 dùng **`CreateExportTask`**, tối đa 12 giờ, **không real-time**. Real-time thì dùng **subscription filter** (Kinesis Data Streams, Firehose, Lambda).
- Gom log đa tài khoản: **subscription filter + destination + destination access policy + IAM role**.
- Logs Insights: truy vấn dữ liệu **lịch sử**, đa log group, đa tài khoản; lưu được và thêm vào dashboard.
- Live Tail: xem log real-time để debug.

---

## Bài 5 – CloudWatch Agent

### Lý thuyết

- **Mặc định EC2 không gửi log nào** lên CloudWatch. Phải cài và chạy **agent** (một chương trình nhỏ) trên instance để đẩy các file log mong muốn.
- Instance phải có **IAM role** cho phép gửi log/metric lên CloudWatch.
- Agent cũng cài được trên **server on-premises** (vd VM trên VMware).

| | **CloudWatch Logs Agent** | **CloudWatch Unified Agent** |
|---|---|---|
| Thế hệ | Cũ (deprecated) | Mới |
| Gửi log | Có | Có |
| Gửi metric hệ thống | **Không** | **Có** (RAM, process, disk, swap… ở mức chi tiết) |
| Cấu hình tập trung | Không | **Có, qua SSM Parameter Store** |

#### Metric Unified Agent thu thập (Linux/EC2)

| Nhóm | Ví dụ |
|---|---|
| **CPU** | active, guest, idle, system, user, steal (chi tiết hơn nhiều) |
| **Disk** | free, used, total |
| **Disk IO** | writes, reads, bytes, iops |
| **RAM** | free, inactive, used, total, cached |
| **Netstat** | số kết nối TCP và UDP, net packets, bytes |
| **Processes** | total, dead, blocked, idle, running, sleep |
| **Swap space** | free, used, used % |

- Nhắc lại: EC2 mặc định chỉ có disk, CPU, network ở mức tổng quát; **không có memory, không có swap**. Muốn chi tiết hơn thì dùng **Unified Agent**.

### Kiến thức thực tế

- **[Cập nhật 2026]** CloudWatch Logs Agent cũ (`awslogs`) **đã ngừng hỗ trợ**; chỉ dùng **Unified CloudWatch Agent**. Agent hợp nhất này nay còn nhận được **trace X-Ray/OpenTelemetry (OTLP)**, thu **Prometheus metrics**, và là nền tảng cho **Application Signals**. Một agent làm được việc của Logs Agent cũ + X-Ray daemon.
- Với on-premises, dùng `-m onPremise` và cấu hình credentials (IAM user riêng hoặc IAM Roles Anywhere, hay quản lý qua SSM hybrid activation).
- Cài hàng loạt: dùng **Systems Manager Run Command** với document `AWS-ConfigureAWSPackage` (package `AmazonCloudWatchAgent`), sau đó `AmazonCloudWatch-ManageAgent`.
- Metric do agent đẩy được tính phí như **custom metric**. Chỉ thu các metric thực sự cần.

### Ghi nhớ cho kỳ thi

- **RAM/memory, swap, disk space đã dùng** thì dùng **Unified CloudWatch Agent** đẩy làm custom metric.
- Agent cần **IAM role** trên EC2; chạy được cả **on-premises**.
- Cấu hình tập trung qua **SSM Parameter Store** là đặc điểm của Unified Agent.

---

## Bài 6 – Metric Filters

### Lý thuyết

- **Metric filter** áp dụng **filter expression** trên CloudWatch Logs để tạo ra **metric**, ví dụ: tìm một IP cụ thể, đếm số lần xuất hiện chữ `ERROR`.
- Metric này dùng để **kích hoạt alarm**.
- **Không hồi tố (not retroactive):** chỉ tạo dữ liệu cho sự kiện **xảy ra sau khi** filter được tạo.
- Có thể chỉ định **tối đa 3 dimension** cho metric filter.
- Luồng điển hình: **CloudWatch Agent trên EC2** đẩy log vào **CloudWatch Logs**, rồi **metric filter** tạo metric, rồi **CloudWatch Alarm** (vd "5 lần ERROR trong 1 phút"), rồi gửi **SNS**.

### Kiến thức thực tế

- Cú pháp filter pattern hay dùng:

| Pattern | Ý nghĩa |
|---|---|
| `ERROR` | Chứa từ ERROR (phân biệt hoa thường) |
| `"START RequestId"` | Chứa cụm từ chính xác |
| `?ERROR ?Exception` | Chứa ERROR **hoặc** Exception |
| `ERROR -Timeout` | Chứa ERROR nhưng không chứa Timeout |
| `{ $.statusCode = 500 }` | Log JSON có `statusCode` bằng 500 |
| `{ $.latency > 1000 && $.path = "/checkout" }` | Điều kiện JSON kết hợp |
| `[ip, user, ..., status_code=4*, size]` | Log dạng cột (space-delimited) |

- Có thể dùng giá trị trích từ log làm metric value (vd `metricValue=$.latency`) thay vì chỉ đếm `1`.
- Nên đặt `defaultValue=0` để metric không bị "thiếu dữ liệu" khi không có khớp, giúp alarm hoạt động ổn định hơn.

### Ghi nhớ cho kỳ thi

- Cảnh báo khi log có `Error` (từ RDS, ứng dụng, Lambda…): **Metric Filter + CloudWatch Alarm** (+ SNS). Không cần Lambda quét log định kỳ, không dùng AWS Config.
- Metric filter **không hồi tố**; tối đa **3 dimension**.

---

## Bài 7 – CloudWatch Alarms

### Lý thuyết

- Alarm dùng để **kích hoạt thông báo/hành động** từ **bất kỳ metric nào**. Có nhiều tuỳ chọn: statistic (sampling, %, max, min…), so sánh, số chu kỳ đánh giá…
- **3 trạng thái:**

| Trạng thái | Ý nghĩa |
|---|---|
| `OK` | Không vượt ngưỡng |
| `INSUFFICIENT_DATA` | Chưa đủ dữ liệu để xác định |
| `ALARM` | Vượt ngưỡng, thực hiện action/gửi thông báo |

- **Period**: khoảng thời gian (giây) để đánh giá metric. Với **high-resolution custom metric** có thể đặt **10 giây, 30 giây**, hoặc bội số của 60 giây.

#### 3 nhóm target chính

1. **EC2 action**: stop, terminate, reboot, recover instance.
2. **Auto Scaling action**: scale out/scale in.
3. **Gửi SNS**: từ SNS có thể gọi Lambda để làm bất cứ điều gì.

#### Composite Alarms

- Alarm thường chỉ theo dõi **một metric**. **Composite alarm** theo dõi **trạng thái của nhiều alarm khác** (mỗi alarm có thể theo một metric khác nhau).
- Kết hợp bằng **AND / OR** (và NOT).
- Giúp **giảm "alarm noise"**: vd chỉ báo khi CPU cao **và** network thấp.
- Ví dụ: Alarm A theo dõi CPU của EC2, Alarm B theo dõi IOPS; Composite = A AND B; khi ở trạng thái ALARM thì gửi SNS.

#### EC2 Instance Recovery

| Status check | Kiểm tra |
|---|---|
| **Instance status** | Máy ảo EC2 |
| **System status** | Phần cứng, hạ tầng bên dưới |
| **Attached EBS status** | Sức khoẻ các EBS volume gắn vào |

- Đặt CloudWatch Alarm trên các check này; khi vào ALARM thì thực hiện **EC2 Instance Recovery** (chuyển instance sang host khác).
- Sau recovery giữ **nguyên private IP, public IP, Elastic IP, metadata và placement group**. Có thể gửi SNS để biết instance đã được recover.

#### Lưu ý khác

- Alarm có thể đặt trên **metric từ metric filter** của CloudWatch Logs (Bài 6).
- **Test alarm** mà không cần đạt ngưỡng thật: dùng CLI **`set-alarm-state`** để xem action có chạy đúng không.

### Kiến thức thực tế

- **[Cập nhật 2026]** Alarm nay có thể **gọi trực tiếp Lambda** làm action (không bắt buộc phải qua SNS), và có action tạo **OpsItem/Incident** trong Systems Manager.
- **[Cập nhật 2026]** Nhiều loại instance hiện được bật **simplified automatic recovery mặc định** khi system status check lỗi, không cần tự tạo alarm. Alarm recover vẫn hữu ích khi cần thông báo hoặc kiểm soát rõ ràng.
- Cấu hình `--treat-missing-data` (`missing`, `notBreaching`, `breaching`, `ignore`) quyết định alarm xử lý thế nào khi thiếu dữ liệu. Đây là lỗi hay gặp với metric từ metric filter.
- **Alarm trên ASG không thể đi dưới min capacity**: nếu ASG đã ở min, alarm scale-in vẫn ở trạng thái ALARM nhưng không giảm thêm instance (xem Quiz câu 4).
- Có thể đặt alarm trên **metric math** (vd tỉ lệ lỗi = `Errors / Invocations * 100`) và trên **Logs Insights query** (metric từ query).

### Ghi nhớ cho kỳ thi

- 3 trạng thái: **OK, INSUFFICIENT_DATA, ALARM**.
- Target: **EC2 action, Auto Scaling, SNS**.
- Alarm trên high-res metric: period **10 giây hoặc 30 giây** (hoặc bội số 60 giây).
- Nhiều metric thì dùng **Composite Alarm** (AND/OR) để giảm noise.
- Recovery giữ nguyên IP, metadata, placement group.
- **Test alarm rẻ và nhanh: `set-alarm-state`**.

---

## Bài 8 – CloudWatch Synthetics Canary

### Lý thuyết

- **Canary** là một **script có thể cấu hình**, chạy từ CloudWatch để **giám sát API, URL, website**.
- Script **mô phỏng thao tác của khách hàng** bằng code, vd: vào trang sản phẩm, thêm vào giỏ, checkout, nhập thẻ… Nếu script lỗi thì bạn **phát hiện vấn đề trước khách hàng**.
- Kiểm tra **availability và latency** của endpoint, lưu **load time**, chụp **screenshot UI**.
- Ví dụ kiến trúc: ứng dụng ở `us-east-1` được Canary giám sát; khi lỗi thì **CloudWatch Alarm** gọi **Lambda**, Lambda **cập nhật DNS Route 53** sang bản dự phòng ở `us-west-2`.
- Script viết bằng **Node.js hoặc Python**, có sẵn **headless Google Chrome**.
- Chạy **một lần** hoặc **theo lịch** (schedule).

#### Blueprint có sẵn

| Blueprint | Chức năng |
|---|---|
| **Heartbeat Monitor** | Load URL, lưu screenshot và file HTTP archive (HAR) |
| **API Canary** | Test các chức năng đọc/ghi cơ bản của REST API |
| **Broken Link Checker** | Kiểm tra mọi link trong URL không bị hỏng |
| **Visual Monitoring** | So sánh screenshot lúc chạy với screenshot **baseline** |
| **Canary Recorder** | Dùng với **CloudWatch Synthetics Recorder**: ghi lại thao tác trên website rồi tự sinh script |
| **GUI Workflow Builder** | Kiểm tra chuỗi thao tác trên trang (vd form đăng nhập) |

### Kiến thức thực tế

- Tạo canary heartbeat bằng CLI (code đã zip và upload lên S3; runtime phải lấy từ danh sách runtime hiện hành):

  ```bash
  aws synthetics describe-runtime-versions --query "RuntimeVersions[].VersionName"

  aws synthetics create-canary --name homepage-heartbeat \
    --artifact-s3-location s3://my-canary-artifacts/homepage/ \
    --execution-role-arn arn:aws:iam::123456789012:role/CanaryRole \
    --schedule Expression="rate(5 minutes)" \
    --runtime-version <phiên-bản-runtime-hiện-hành> \
    --code Handler=pageLoadBlueprint.handler,S3Bucket=my-canary-code,S3Key=canary.zip
  ```

- Canary đẩy metric vào namespace `CloudWatchSynthetics` (vd `SuccessPercent`, `Duration`). Đặt alarm trên `SuccessPercent < 100` là mẫu phổ biến.
- Canary **chạy bên trong VPC** được, để kiểm tra endpoint nội bộ.
- Runtime có **ngày hết hạn hỗ trợ**; cần cập nhật canary sang runtime mới định kỳ. **[Cập nhật 2026]** Ngoài Puppeteer/Selenium, Synthetics đã có thêm runtime dựa trên **Playwright**.
- Chi phí tính theo **số lần chạy canary**. Lịch chạy 1 phút cho nhiều canary sẽ tốn kém.

### Ghi nhớ cho kỳ thi

- "Mô phỏng hành vi người dùng, kiểm tra website/API chủ động, chụp screenshot" thì chọn **CloudWatch Synthetics Canary**.
- Script **Node.js/Python**, headless Chrome, chạy một lần hoặc theo lịch.

---

## Bài 9 – Amazon EventBridge

### Lý thuyết

- **Amazon EventBridge** (trước đây là **CloudWatch Events**) là event bus serverless, dùng để **phản ứng với sự kiện** trong tài khoản AWS hoặc **lập lịch** chạy tác vụ.
- Hai kiểu rule chính:

| Kiểu rule | Ví dụ |
|---|---|
| **Schedule (cron/rate)** | Chạy Lambda mỗi giờ: `rate(1 hour)`, `cron(0 12 * * ? *)` |
| **Event pattern** | Bắt sự kiện từ dịch vụ: IAM root user đăng nhập thì gửi SNS; EC2 chuyển sang `stopped`; CodeBuild fail… |

#### Nguồn và đích

- **Nguồn (source)**: EC2 (đổi trạng thái instance), CodeBuild (build fail), S3 (upload object, khi bật *EventBridge notifications* trên bucket), Trusted Advisor, **CloudTrail (bất kỳ API call nào)**, schedule…
- **Filter**: có thể lọc theo nội dung sự kiện (vd chỉ bucket cụ thể, chỉ state `terminated`).
- Sự kiện được biểu diễn bằng **JSON** (có `version`, `id`, `detail-type`, `source`, `account`, `time`, `region`, `resources`, `detail`).
- **Đích (target)**: Lambda, AWS Batch, ECS task, SQS, SNS, Kinesis Data Streams, Step Functions, CodePipeline, CodeBuild, SSM Automation, EC2 action (start/stop/reboot), API Gateway, API destination (HTTP endpoint ngoài AWS)…

#### Các loại Event Bus

| Event bus | Mô tả |
|---|---|
| **Default event bus** | Nhận sự kiện từ các dịch vụ AWS trong tài khoản |
| **Partner event bus** | Nhận sự kiện từ đối tác SaaS (Zendesk, Datadog, Auth0, Segment…) |
| **Custom event bus** | Ứng dụng của bạn tự đẩy sự kiện (`PutEvents`) |

- Event bus có thể được **truy cập từ tài khoản AWS khác** qua **resource-based policy**.
- **Archive & Replay**: lưu trữ sự kiện (tất cả hoặc theo filter; giữ vô thời hạn hoặc theo số ngày) và **replay** lại sự kiện đã lưu, rất hữu ích để debug hoặc sau khi sửa lỗi consumer.

#### Schema Registry

- EventBridge có thể **phân tích sự kiện trên bus và suy ra schema** (Schema Discovery).
- **Schema Registry** cho phép **sinh code** (Java, Python, TypeScript, Go) để ứng dụng biết trước cấu trúc dữ liệu trên bus.
- Schema có **version**.

#### Resource-based Policy và Multi-Account Aggregation

- Quản lý quyền cho từng event bus: vd **cho phép/từ chối sự kiện từ tài khoản khác hoặc Region khác**.
- Use case: **gom sự kiện từ toàn bộ AWS Organization** về **một tài khoản trung tâm** (central event bus).
  - Mỗi tài khoản nguồn tạo rule trên default bus với target là **event bus của tài khoản trung tâm**.
  - Event bus trung tâm có resource policy cho phép `events:PutEvents` từ các tài khoản (hoặc theo `aws:PrincipalOrgID`).
  - Tài khoản trung tâm có rule xử lý tập trung (gửi SNS, lưu log, chạy Lambda…).

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "AllowOrgAccountsToPutEvents",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "events:PutEvents",
    "Resource": "arn:aws:events:ap-southeast-1:111111111111:event-bus/central-bus",
    "Condition": { "StringEquals": { "aws:PrincipalOrgID": "o-abc123xyz" } }
  }]
}
```

### Kiến thức thực tế

- **[Cập nhật 2026]** Lập lịch nay nên dùng **EventBridge Scheduler** (dịch vụ riêng): hỗ trợ **one-time schedule**, **time zone**, flexible time window, hàng triệu lịch và hơn 270 dịch vụ làm target. Scheduled rule trên event bus vẫn hoạt động nhưng là cách cũ.
- **EventBridge Pipes**: nối **point-to-point** từ source (SQS, Kinesis, DynamoDB Streams, MSK…) tới target, có filter và enrichment (Lambda, Step Functions, API Gateway) mà không cần viết code "glue".
- Rule có thể đặt **target là event bus ở Region khác hoặc tài khoản khác trực tiếp** (cross-Region/cross-account routing).
- Event pattern hỗ trợ **content filtering**: `prefix`, `suffix`, `anything-but`, `numeric`, `exists`, `wildcard`, `equals-ignore-case`.
- Target thất bại được **retry tối đa 24 giờ / 185 lần** (cấu hình được) và có thể gắn **DLQ (SQS)** cho từng target.
- **Input transformer** cho phép định dạng lại payload trước khi gửi tới target (vd email SNS dễ đọc hơn).
- Lệnh CLI `aws events` chính là EventBridge; CloudWatch Events và EventBridge dùng chung API.

### Ghi nhớ cho kỳ thi

- "Phản ứng khi có sự kiện AWS / chạy theo lịch cron" thì dùng **EventBridge**.
- 3 loại bus: **default, partner (SaaS), custom**.
- **Archive & Replay** sự kiện; **Schema Registry** sinh code.
- Gom sự kiện đa tài khoản: **resource-based policy** trên event bus trung tâm.
- Bắt một API call bất kỳ (vd `CreateImage`, `DeleteTable`) thì dùng **CloudTrail + EventBridge**.

---

## Bài 10 – Tổng quan AWS X-Ray

### Lý thuyết

#### Vấn đề khi debug trên production

- Cách cũ: test local, thêm log statement khắp nơi, deploy lại production rồi đọc log.
- Log từ nhiều service nằm rải rác, **khó gộp lại để phân tích**; với **microservices** gần như không thể biết request đi qua đâu và chậm ở đâu.
- Không có cái nhìn tổng thể toàn bộ kiến trúc.

#### AWS X-Ray

- Cho **phân tích trực quan** ứng dụng: **service map** hiển thị các service, đường gọi, latency, lỗi.
- Lợi ích:
  - **Xử lý sự cố hiệu năng** (tìm bottleneck).
  - Hiểu **dependency** trong kiến trúc microservices.
  - Tìm chính xác **service gây lỗi**.
  - Xem hành vi của request; tìm **lỗi và exception**.
  - Kiểm tra có đạt **SLA** về thời gian hay không.
  - Biết **user nào bị ảnh hưởng** và service nào bị throttle.

#### Tracing

- **Tracing** là cách theo dõi một request "end to end".
- Mỗi thành phần xử lý request thêm vào trace một **segment** (và **subsegment** để chi tiết hơn).
- Có thể trace **mọi request** hoặc **một phần mẫu** (sample, vd % hoặc số request/phút).
- **Bảo mật**: **IAM** để phân quyền, **KMS** để mã hoá dữ liệu lưu trữ.

#### Tích hợp

| Môi trường | Cách bật |
|---|---|
| **EC2 / on-premises** | Chạy **X-Ray daemon** |
| **Lambda** | Bật **Active tracing** (một checkbox) |
| **Elastic Beanstalk** | Daemon cài sẵn, bật bằng option |
| **ECS** | Daemon chạy dạng container (daemon/sidecar) |
| **API Gateway** | Bật tracing trên stage |
| **ELB, SNS, SQS, Step Functions…** | Có tích hợp |

#### Cách bật X-Ray (2 bước)

1. **Code** (Java, Python, Go, Node.js, .NET) **import AWS X-Ray SDK**. Chỉ sửa code rất ít. SDK ghi nhận: lời gọi tới **AWS services**, **HTTP/HTTPS request**, **database call** (MySQL, PostgreSQL, DynamoDB), **queue call (SQS)**.
2. **Cài X-Ray daemon** hoặc bật **X-Ray AWS integration**:
   - Daemon là chương trình **lắng nghe UDP**, mặc định **port 2000**, có bản cho Linux/Windows/macOS.
   - **Lambda và một số dịch vụ AWS đã chạy daemon sẵn** cho bạn.
   - Mỗi ứng dụng phải có **IAM quyền ghi dữ liệu lên X-Ray**.
- Luồng: code + SDK gửi segment qua UDP tới **daemon**; daemon **gom batch mỗi 1 giây** rồi gửi lên **AWS X-Ray**. Một daemon có thể nhận dữ liệu từ nhiều ứng dụng.

#### Xử lý sự cố: "X-Ray không hoạt động"

| Môi trường | Nguyên nhân thường gặp |
|---|---|
| **EC2** | IAM role của instance **thiếu quyền** ghi X-Ray; **chưa chạy X-Ray daemon** |
| **Lambda** | Execution role thiếu policy **`AWSXRayDaemonWriteAccess`**; code **chưa import SDK**; **chưa bật Active Tracing** |

### Kiến thức thực tế

- **[Cập nhật 2026]** Giao diện X-Ray đã được **gộp vào CloudWatch console** (*X-Ray traces*, *Trace Map*, *Application Signals*). Console X-Ray riêng vẫn còn nhưng tài liệu mới đều dẫn sang CloudWatch.
- **[Cập nhật 2026]** AWS đã đưa **X-Ray SDK và X-Ray daemon vào giai đoạn maintenance** và khuyến nghị dùng **OpenTelemetry (ADOT) hoặc CloudWatch Agent** để gửi trace. Đề thi DVA-C02 vẫn hỏi theo mô hình **SDK + daemon** (xem Bài 14).
- **CloudWatch Application Signals** (dựa trên OpenTelemetry) tự hiển thị service map, SLO, latency/error/fault cho ứng dụng gần như không cần sửa code.
- **Transaction Search**: gửi 100% span vào CloudWatch Logs (log group `aws/spans`) để tìm kiếm, chỉ index một phần thành trace X-Ray, giúp tối ưu chi phí.
- Dữ liệu trace được giữ **30 ngày**.

### Ghi nhớ cho kỳ thi

- Debug hiệu năng / distributed tracing / service map thì dùng **X-Ray**.
- 2 bước: **SDK trong code + daemon (hoặc integration)**; daemon **lắng nghe UDP port 2000**.
- X-Ray không chạy trên EC2: **thiếu IAM role** hoặc **daemon chưa chạy**.
- Lambda: **Active Tracing + IAM `AWSXRayDaemonWriteAccess` + import SDK**.

---

## Bài 11 – X-Ray: instrumentation, khái niệm và sampling

### Lý thuyết

#### Instrumentation

- **Instrumentation** là việc đo lường hiệu năng, chẩn đoán lỗi và ghi thông tin trace của sản phẩm.
- Với X-Ray dùng **X-Ray SDK**. Ví dụ Node.js/Express chỉ cần vài dòng:

```javascript
const AWSXRay = require('aws-xray-sdk');
const express = require('express');
const app = express();

app.use(AWSXRay.express.openSegment('MyApp'));
app.get('/', (req, res) => res.send('hello'));
app.use(AWSXRay.express.closeSegment());

// Trace mọi lời gọi AWS SDK
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
// Trace HTTP call ra ngoài
AWSXRay.captureHTTPsGlobal(require('https'));
```

- Có thể **tuỳ biến** hành vi SDK bằng **interceptor, filter, handler, middleware**…

#### Khái niệm X-Ray

| Khái niệm | Ý nghĩa |
|---|---|
| **Segment** | Mỗi ứng dụng/service gửi một segment |
| **Subsegment** | Chi tiết hơn bên trong segment (vd lời gọi DynamoDB, HTTP call) |
| **Trace** | Tập hợp các segment end-to-end của **một request** (cùng trace ID) |
| **Sampling** | Giảm số request gửi lên X-Ray để **giảm chi phí** |
| **Annotation** | Cặp **key-value được index**, dùng để **tìm/lọc trace** bằng filter expression |
| **Metadata** | Cặp key-value **không được index**, không dùng để tìm kiếm |

- **Annotation và Metadata** (rất hay thi):
  - **Annotation** được **index**: dùng để **search/filter trace** (vd `user_id`, `game_mode`). Giá trị là string, number, boolean.
  - **Metadata** **không index**: lưu thêm dữ liệu (object bất kỳ) để xem khi debug, **không search được**.

```python
from aws_xray_sdk.core import xray_recorder, patch_all
patch_all()   # tự trace boto3, requests, các thư viện DB...

@xray_recorder.capture('process_order')
def process_order(order):
    sub = xray_recorder.current_subsegment()
    sub.put_annotation('customer_tier', order['tier'])    # index, filter được
    sub.put_metadata('order_payload', order, 'orders')    # không index
```

- Filter expression trên console: `annotation.customer_tier = "gold"`, `service("api") { fault }`, `responsetime > 2`.
- **X-Ray daemon/agent có thể gửi trace sang tài khoản khác**: cấu hình IAM permission (assume role). Cho phép **gom trace** của nhiều tài khoản về một tài khoản trung tâm.

#### Sampling Rules

- Sampling rule kiểm soát **lượng dữ liệu được ghi**, có thể sửa **mà không cần đổi code**.
- **Mặc định**: SDK ghi **request đầu tiên mỗi giây** (**reservoir = 1**) và **5%** các request còn lại (**rate = 0.05**).
  - **Reservoir**: đảm bảo **ít nhất một trace mỗi giây** được ghi khi service đang nhận request.
  - **Rate**: tỉ lệ phần trăm request bổ sung (vượt quá reservoir) được ghi.
- Ví dụ: 100 request/giây với rule mặc định thì ghi 1 + 5% × 99 ≈ **6 request/giây**.
- Có thể tạo **custom rule** với reservoir và rate riêng, match theo **service name, service type, host, HTTP method, URL path, resource ARN**, kèm **priority** (số nhỏ ưu tiên cao).
  - Vd debug endpoint `POST /checkout`: reservoir 10, rate 0.1 (10%). Chỉ bật tạm thời vì tốn chi phí.
  - Vd trace toàn bộ: reservoir 1, rate 1.0 (100%), rất đắt.
- Khi sửa rule trên console, **SDK/daemon tự lấy rule mới** (gọi `GetSamplingRules`), **không cần restart** ứng dụng.

### Kiến thức thực tế

- Đặt annotation cho các khoá tra cứu nghiệp vụ (`tenant_id`, `order_id`); tối đa **50 annotation mỗi trace**. Không đưa dữ liệu nhạy cảm (PII) vào annotation/metadata.
- Với OpenTelemetry/ADOT, **span attribute** có thể được ánh xạ thành annotation (cấu hình `indexed_attributes` trong exporter) hoặc metadata.
- **Adaptive sampling** (2025) tự tăng tỉ lệ lấy mẫu khi phát hiện bất thường (lỗi tăng đột biến) rồi giảm lại.
- Chi phí X-Ray tính theo **số trace được ghi và được truy xuất/scan**, nên sampling là đòn bẩy tiết kiệm chính.

### Ghi nhớ cho kỳ thi

- **Segment → Subsegment → Trace** (trace = mọi segment của một request).
- **Annotation = được index, dùng filter/search; Metadata = không index**.
- Sampling mặc định: **1 request/giây (reservoir) + 5% (rate)**.
- Đổi sampling rule **không cần sửa code, không cần restart**.
- Muốn tìm trace theo user/thuộc tính nghiệp vụ thì thêm **annotation**.

---

## Bài 12 – X-Ray APIs

### Lý thuyết

#### Write APIs (dùng bởi X-Ray daemon)

Managed policy **`AWSXrayWriteOnlyAccess`** (nay là **`AWSXRayDaemonWriteAccess`**) gồm:

| API | Chức năng |
|---|---|
| **`PutTraceSegments`** | **Upload segment document** lên X-Ray |
| **`PutTelemetryRecords`** | Daemon gửi **telemetry** (số segment nhận, bị từ chối, lỗi backend…) |
| **`GetSamplingRules`** | Lấy **toàn bộ sampling rule** (để biết khi nào gửi) |
| **`GetSamplingTargets`** | Lấy quota sampling (reservoir) được phân cho daemon |
| **`GetSamplingStatisticSummaries`** | Lấy thống kê sampling (nâng cao) |

- **Quan trọng**: daemon cần **`GetSamplingRules`, `GetSamplingTargets`, `GetSamplingStatisticSummaries`** để sampling rule cập nhật động, và **`PutTraceSegments`, `PutTelemetryRecords`** để gửi dữ liệu.

```json
{
  "Effect": "Allow",
  "Action": [
    "xray:PutTraceSegments",
    "xray:PutTelemetryRecords",
    "xray:GetSamplingRules",
    "xray:GetSamplingTargets",
    "xray:GetSamplingStatisticSummaries"
  ],
  "Resource": "*"
}
```

#### Read APIs

Managed policy **`AWSXrayReadOnlyAccess`**:

| API | Chức năng |
|---|---|
| **`GetServiceGraph`** | Lấy **service graph** chính (service map) |
| **`BatchGetTraces`** | Lấy danh sách trace theo **ID**; mỗi trace là tập segment document của một request |
| **`GetTraceSummaries`** | Lấy **ID và annotation** của các trace trong khoảng thời gian (có filter expression); truyền `TraceIds` cho `BatchGetTraces` để lấy trace đầy đủ |
| **`GetTraceGraph`** | Lấy **service graph cho một hoặc nhiều trace ID** cụ thể |

### Kiến thức thực tế

- Thứ tự gọi chuẩn khi tự xây công cụ phân tích: **`GetTraceSummaries` (lọc) → `BatchGetTraces` (chi tiết)**.
- Có thêm API **Groups** (`CreateGroup` với filter expression, sinh metric để đặt alarm), **Insights** (`GetInsightSummaries`) và **`PutEncryptionConfig`** (mã hoá bằng KMS).
- Với ADOT/CloudWatch Agent, quyền ghi vẫn là `xray:PutTraceSegments` (hoặc `xray:PutSpans` khi gửi OTLP trực tiếp với Transaction Search).

### Ghi nhớ cho kỳ thi

- Daemon cần: **`PutTraceSegments`, `PutTelemetryRecords`, `GetSamplingRules`/`GetSamplingTargets`/`GetSamplingStatisticSummaries`**.
- "Sampling rule mới không có hiệu lực" thì thiếu quyền **`GetSamplingRules`**.
- **`GetTraceSummaries`** lấy ID + annotation; **`BatchGetTraces`** lấy trace đầy đủ.

---

## Bài 13 – X-Ray với Elastic Beanstalk và ECS

### Lý thuyết

#### X-Ray với Elastic Beanstalk

- Các platform của Elastic Beanstalk **có sẵn X-Ray daemon**.
- Bật daemon bằng option trong console hoặc file cấu hình **`.ebextensions/xray-daemon.config`**:

```yaml
option_settings:
  aws:elasticbeanstalk:xray:
    XRayEnabled: true
```

- Cần cấp cho **instance profile** đúng IAM permission để daemon hoạt động (managed policy mặc định của Beanstalk web tier đã có quyền X-Ray).
- **Code ứng dụng vẫn phải được instrument bằng X-Ray SDK**.
- **Lưu ý**: X-Ray daemon **không có sẵn cho Multicontainer Docker** (platform cũ).

#### X-Ray với ECS: 3 cách triển khai

| Cách | Mô tả |
|---|---|
| **ECS cluster (EC2 launch type) – daemon container** | Chạy X-Ray daemon như **một container trên mỗi EC2 instance** (ECS *daemon service*). Mọi container app trên instance gửi trace tới daemon đó |
| **ECS cluster (EC2 launch type) – sidecar** | Mỗi task có **một container X-Ray daemon đi kèm** (sidecar) cạnh container app |
| **Fargate** | **Bắt buộc dùng sidecar**, vì không kiểm soát được host bên dưới |

#### Task definition mẫu (sidecar)

- Container daemon mở **port 2000/UDP**.
- Container app đặt biến môi trường **`AWS_XRAY_DAEMON_ADDRESS`** trỏ tới daemon, và **link** tới container daemon (ở network mode `awsvpc` thì dùng `localhost`).

```json
{
  "family": "scorekeep",
  "networkMode": "awsvpc",
  "taskRoleArn": "arn:aws:iam::123456789012:role/ecsTaskXRayRole",
  "containerDefinitions": [
    {
      "name": "xray-daemon",
      "image": "amazon/aws-xray-daemon",
      "cpu": 32,
      "memoryReservation": 256,
      "portMappings": [{ "containerPort": 2000, "protocol": "udp" }]
    },
    {
      "name": "scorekeep-api",
      "image": "123456789012.dkr.ecr.ap-southeast-1.amazonaws.com/scorekeep-api",
      "cpu": 192,
      "memoryReservation": 512,
      "environment": [
        { "name": "AWS_XRAY_DAEMON_ADDRESS", "value": "localhost:2000" }
      ],
      "portMappings": [{ "containerPort": 5000 }]
    }
  ]
}
```

- Ở network mode `bridge` (EC2 launch type), dùng `"links": ["xray-daemon"]` và `AWS_XRAY_DAEMON_ADDRESS=xray-daemon:2000`.
- **Task role** cần quyền ghi X-Ray (`AWSXRayDaemonWriteAccess`).

#### Biến môi trường quan trọng

| Biến | Ý nghĩa |
|---|---|
| **`AWS_XRAY_DAEMON_ADDRESS`** | Địa chỉ `host:port` của X-Ray daemon (mặc định `127.0.0.1:2000`) |
| **`_X_AMZN_TRACE_ID`** | Chứa **tracing header** (trace ID, parent, sampled) trong **Lambda** |
| **`AWS_XRAY_CONTEXT_MISSING`** | Hành vi khi thiếu context: `RUNTIME_ERROR` hoặc `LOG_ERROR` |
| **`AWS_XRAY_TRACING_NAME`** | Đặt tên service cho segment |

- Header HTTP truyền trace giữa các service: **`X-Amzn-Trace-Id`** (vd `Root=1-5759e988-bd862e3fe1be46a994272793;Parent=53995c3f42cd8ad8;Sampled=1`). ALB và API Gateway tự thêm header này.

### Kiến thức thực tế

- **[Cập nhật 2026]** Platform **Multicontainer Docker (Amazon Linux AMI)** của Beanstalk đã bị khai tử; platform hiện hành là **Docker trên Amazon Linux 2023** (hỗ trợ docker compose).
- **[Cập nhật 2026]** Thay vì sidecar X-Ray daemon, cách khuyến nghị hiện nay là sidecar **ADOT Collector** hoặc **CloudWatch Agent** (nhận OTLP và cả giao thức X-Ray UDP 2000). Trên EKS dùng **Amazon CloudWatch Observability add-on**.
- Với **ECS Service Connect**, có thể thu thập metric/trace ở tầng proxy mà không sửa nhiều code.
- Lambda: **Active tracing** khiến Lambda tạo segment và đặt `_X_AMZN_TRACE_ID`; SDK trong hàm đọc biến này để gắn subsegment vào đúng trace.

### Ghi nhớ cho kỳ thi

- Beanstalk: bật bằng console hoặc **`.ebextensions/xray-daemon.config`** (`XRayEnabled: true`), instance profile cần quyền; **không hỗ trợ Multicontainer Docker**.
- ECS EC2: **daemon container mỗi instance** hoặc **sidecar**; **Fargate: sidecar**.
- Container daemon map **UDP 2000**; app đặt **`AWS_XRAY_DAEMON_ADDRESS`**.
- **`_X_AMZN_TRACE_ID`** = tracing header trong Lambda.

---

## Bài 14 – AWS Distro for OpenTelemetry (ADOT)

### Lý thuyết

- **AWS Distro for OpenTelemetry (ADOT)** là **bản phân phối của dự án OpenTelemetry** được AWS hỗ trợ, bảo mật và tối ưu.
- Cung cấp **một bộ API, thư viện, agent và collector duy nhất** để thu thập **distributed traces và metrics** (và logs) từ ứng dụng.
- Thu thập cả **metadata** của tài nguyên AWS và dịch vụ đang chạy ứng dụng.
- **Auto-instrumentation agent**: thu thập trace **mà không cần sửa code**.
- Gửi trace và metric tới **nhiều đích**: **AWS X-Ray, CloudWatch, Amazon Managed Service for Prometheus**, và giải pháp bên thứ ba (Datadog, New Relic, Jaeger, Zipkin…).
- Dùng trên **EC2, ECS, EKS, Fargate, Lambda** và on-premises.

#### X-Ray SDK và ADOT

| | **X-Ray SDK + daemon** | **ADOT / OpenTelemetry** |
|---|---|---|
| Chuẩn | Riêng của AWS | **Mã nguồn mở, chuẩn ngành** |
| Đích gửi dữ liệu | Chỉ X-Ray | **Nhiều backend cùng lúc** (X-Ray, CloudWatch, Prometheus, bên thứ ba) |
| Thu thập | Trace | **Trace + metric** (+ log) |
| Đổi backend | Phải sửa instrumentation | **Không cần sửa instrumentation**, chỉ đổi exporter |

- Kiến trúc: ứng dụng (OpenTelemetry SDK hoặc auto-instrumentation) → **ADOT Collector** (receivers → processors → exporters) → X-Ray / CloudWatch / Prometheus…
- Đề thi: muốn **chuẩn hoá theo OpenTelemetry** hoặc **gửi trace tới nhiều đích cùng lúc** thì chuyển từ X-Ray SDK sang **ADOT**.

### Kiến thức thực tế

- **[Cập nhật 2026]** AWS đã đưa **X-Ray SDK và X-Ray daemon vào giai đoạn maintenance** (chỉ vá lỗi/bảo mật) và khuyến nghị chuyển sang **OpenTelemetry**: **ADOT SDK/auto-instrumentation** + **CloudWatch Agent** hoặc **ADOT Collector**.
- **CloudWatch Agent** nay có thể đóng vai trò collector: nhận **OTLP** và giao thức X-Ray, bật **Application Signals**.
- X-Ray có **OTLP endpoint** (`https://xray.<region>.amazonaws.com/v1/traces`) để gửi span trực tiếp (ký SigV4).
- Context propagation: OpenTelemetry mặc định dùng W3C `traceparent`; ADOT hỗ trợ cả propagator **X-Ray** (`X-Amzn-Trace-Id`) để tương thích dịch vụ AWS.

### Ghi nhớ cho kỳ thi

- **ADOT** = bản OpenTelemetry của AWS, thu thập **trace + metric**, **auto-instrumentation không sửa code**.
- Gửi tới **X-Ray, CloudWatch, Prometheus, bên thứ ba** cùng lúc.
- "Chuẩn mở / nhiều backend" thì chọn **ADOT** thay vì X-Ray SDK.

---

## Bài 15 – AWS CloudTrail

### Lý thuyết

- **CloudTrail** cung cấp **governance, compliance và audit** cho tài khoản AWS. **Mặc định đã bật**.
- Ghi lại **lịch sử các API call / event** trong tài khoản, đến từ: **Console, SDK, CLI, các dịch vụ AWS**.
- Có thể gửi log từ CloudTrail vào **CloudWatch Logs** hoặc **S3**.
- **Trail** có thể áp dụng cho **mọi Region (mặc định)** hoặc **một Region**; có **organization trail** cho toàn bộ AWS Organization.
- Câu hỏi điển hình: "Ai đã xoá/terminate tài nguyên này?" thì **xem CloudTrail trước**.

#### 3 loại event

| Loại | Mô tả | Mặc định |
|---|---|---|
| **Management Events** | Thao tác trên **tài nguyên** (control plane): cấu hình bảo mật (`AttachRolePolicy`), tạo subnet (`CreateSubnet`), cấu hình logging (`CreateTrail`)… Chia **Read events** (không sửa tài nguyên) và **Write events** (có thể sửa) | **Ghi mặc định** |
| **Data Events** | Hoạt động **trên dữ liệu** (data plane): S3 object-level (`GetObject`, `DeleteObject`, `PutObject`), **Lambda `Invoke`**, DynamoDB item-level… Có thể tách Read/Write | **Không ghi mặc định** (khối lượng lớn) |
| **CloudTrail Insights Events** | Phát hiện **hoạt động bất thường** trong tài khoản | Phải **bật** (trả phí) |

#### CloudTrail Insights

- Phát hiện bất thường như: **cấp phát tài nguyên sai**, **chạm giới hạn service**, **burst các hành động IAM**, **khoảng trống trong hoạt động bảo trì định kỳ**.
- Phân tích **management events loại write** bình thường để tạo **baseline**, rồi liên tục so sánh để phát hiện pattern bất thường.
- Insights event xuất hiện trong **console CloudTrail**, có thể gửi tới **S3**, và sinh **EventBridge event** (để tự động hoá, vd gửi email).

#### Lưu trữ event

- Event được lưu **90 ngày** trong CloudTrail (**Event history**).
- Muốn giữ **lâu hơn**: tạo **trail** ghi vào **S3**, rồi dùng **Athena** để phân tích.

#### Tích hợp CloudTrail với EventBridge

- **Mọi API call** được CloudTrail ghi đều có thể xuất hiện thành **event trong EventBridge**.
- Ví dụ:
  - Ai đó gọi **`DeleteTable`** trên DynamoDB → CloudTrail ghi → EventBridge rule → **SNS** gửi cảnh báo.
  - **`AssumeRole`** trong IAM → thông báo.
  - **`AuthorizeSecurityGroupIngress`** (sửa inbound rule của Security Group) → cảnh báo.
- Event pattern có `"detail-type": ["AWS API Call via CloudTrail"]`.

### Kiến thức thực tế

- **[Cập nhật 2026]** **CloudTrail Lake**: data lake được quản lý, lưu event dài hạn (tới 7 hoặc 10 năm tuỳ pricing option) và **truy vấn bằng SQL** trực tiếp, không cần dựng S3 + Athena. Có thể nạp cả event ngoài AWS.
- Bật **log file validation** (digest file SHA-256) để chứng minh log không bị sửa; mã hoá trail bằng **SSE-KMS**; bucket policy chặn xoá, cân nhắc **S3 Object Lock**.
- **Bản copy đầu tiên** của management events (trail đầu tiên) miễn phí; bản copy thêm, data events và Insights tính phí.
- **Advanced event selectors** cho phép lọc data event chi tiết (theo bucket, prefix, `eventName`…) để giảm chi phí.
- **Network activity events** (mới): ghi API call đi qua **VPC endpoint**, giúp phát hiện truy cập trái phép qua endpoint.
- CloudTrail **không real-time tuyệt đối**: event thường xuất hiện trong khoảng **5–15 phút**.

### Ghi nhớ cho kỳ thi

- CloudTrail = **audit API call** (ai, làm gì, khi nào, từ đâu). **Bật mặc định**.
- Event history giữ **90 ngày**; lâu hơn thì **trail → S3 → Athena**.
- **Management events** ghi mặc định; **Data events** (S3 object-level, Lambda Invoke) **không** ghi mặc định; **Insights** phát hiện bất thường (phải bật).
- Cảnh báo khi có API call cụ thể: **CloudTrail + EventBridge rule → SNS/Lambda**.

---

## Bài 16 – So sánh CloudTrail, CloudWatch, X-Ray và dọn dẹp

### Lý thuyết

| | **CloudTrail** | **CloudWatch** | **X-Ray** |
|---|---|---|---|
| Mục đích | **Audit API call** do user/service/console thực hiện | **Monitoring** hiệu năng và vận hành | **Phân tích trace** request end-to-end |
| Câu hỏi trả lời | "**Ai** đã thay đổi gì, khi nào?" | "Hệ thống **có khoẻ không**? Có vượt ngưỡng không?" | "Request **chậm/lỗi ở đâu** trong chuỗi microservices?" |
| Thành phần | Management/Data/Insights events, trail | **Metrics, Logs, Alarms**, Synthetics, Dashboards | Segment, trace, service map, sampling |
| Use case | Phát hiện thay đổi trái phép, compliance | Metric để giám sát, log để lưu trữ, alarm để thông báo | Debug latency, error, fault; xem dependency |

- **CloudTrail**: audit API call của user/service/console; phát hiện **lời gọi trái phép** hoặc **thay đổi cấu hình**.
- **CloudWatch**: **metrics** để giám sát, **logs** để lưu log ứng dụng, **alarms** để gửi thông báo khi metric bất thường.
- **X-Ray**: **automated trace analysis** và **central service map visualization**; latency, error và fault; theo dõi request qua **distributed systems**.

#### Dọn dẹp tài nguyên sau chương (AWS Quick Clean-Up)

1. **CloudWatch**: xoá **alarms**, **dashboards**, **log groups** đã tạo (Lambda, demo, metric filter), **Synthetics canary** (và bucket artifact, Lambda/role do canary tạo).
2. **EventBridge**: xoá **rules**, **custom event bus**, **archive** (và **Scheduler schedules** nếu có).
3. **X-Ray**: xoá **custom sampling rules**, **groups**; xoá **CloudFormation stack** của ứng dụng mẫu (Scorekeep) cùng ECS task/service đi kèm.
4. **CloudTrail**: xoá **trail** đã tạo (hoặc tắt data events, Insights để tránh phí), dọn S3 bucket chứa log.
5. **EC2**: terminate instance, xoá IAM role demo; **SNS**: xoá topic và subscription.

```bash
aws cloudwatch delete-alarms --alarm-names TerminateEC2OnHighCPU HighCpuAndHighIops
aws logs delete-log-group --log-group-name demo-log-group
aws synthetics delete-canary --name homepage-heartbeat
aws events remove-targets --rule DemoEC2Rule --ids 1
aws events delete-rule --name DemoEC2Rule
aws xray delete-sampling-rule --rule-name DemoRule
aws cloudtrail delete-trail --name management-trail
aws cloudformation delete-stack --stack-name scorekeep
```

### Kiến thức thực tế

- Bộ ba hiện nay dùng **cùng nhau**: CloudWatch **Application Signals** + **X-Ray trace** + **Logs** (log chứa trace ID để nhảy qua lại), còn CloudTrail để điều tra bảo mật.
- Khi đề hỏi về bảo mật/compliance, nghĩ thêm tới **AWS Config** (lịch sử cấu hình tài nguyên, compliance rule) và **GuardDuty** (phát hiện mối đe doạ, dùng CloudTrail làm một nguồn dữ liệu).
- **CloudWatch Investigations** (AI hỗ trợ điều tra sự cố) tổng hợp metric, log, trace và các thay đổi gần đây (từ CloudTrail) để gợi ý nguyên nhân gốc.
- Khi dọn dẹp, chú ý **log group retention "Never expire"** và **canary chạy theo lịch**: hai nguồn chi phí ngầm phổ biến.

### Ghi nhớ cho kỳ thi

- **CloudTrail = ai làm gì (audit API)**; **CloudWatch = metric, log, alarm**; **X-Ray = trace, service map, latency/lỗi giữa các service**.
- "Ai đã xoá EC2/bảng?" → CloudTrail. "CPU cao thì báo" → CloudWatch Alarm. "Microservice nào chậm?" → X-Ray.

---

## Câu hỏi ôn tập

*Nguồn: Quiz – Monitoring & Audit Quiz (24 câu). Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Bạn có ứng dụng chạy trên EC2 và muốn theo dõi **mức sử dụng RAM** của các instance. Cách nào phù hợp?

- A. Dùng metric `MemoryUtilization` có sẵn trong namespace `AWS/EC2`
- B. Bật Detailed Monitoring cho EC2
- C. Dùng CloudWatch Unified Agent (hoặc gọi `PutMetricData`) để đẩy custom metric RAM
- D. Bật X-Ray trên instance

<details><summary>Đáp án</summary>

**C.** EC2 không cung cấp metric RAM mặc định (hypervisor không thấy bên trong OS). Phải đẩy **custom metric**: cài **CloudWatch Unified Agent** hoặc tự gọi `PutMetricData`. Detailed Monitoring chỉ đổi chu kỳ 5 phút sang 1 phút.
</details>

**Câu 2.** Bạn đã tạo custom metric với `PutMetricData` và muốn đẩy dữ liệu **mỗi 10 giây**. Cần làm gì?

- A. Bật EC2 Detailed Monitoring
- B. Đặt `StorageResolution = 1` (high resolution)
- C. Đặt `StorageResolution = 60`
- D. Không thể, chu kỳ tối thiểu là 1 phút

<details><summary>Đáp án</summary>

**B.** High-resolution custom metric (`StorageResolution` = 1) cho phép độ phân giải **1, 5, 10, 30 giây**. Giá trị 60 là standard resolution (1 phút). Detailed Monitoring chỉ áp dụng cho metric EC2 có sẵn.
</details>

**Câu 3.** Ứng dụng đẩy custom metric bằng `PutMetricData` với timestamp **2 tuần trong quá khứ**. Điều gì xảy ra?

- A. CloudWatch từ chối và trả lỗi
- B. CloudWatch chấp nhận dữ liệu điểm
- C. Dữ liệu bị dời về thời điểm hiện tại
- D. Chỉ chấp nhận nếu bật high resolution

<details><summary>Đáp án</summary>

**B.** `PutMetricData` chấp nhận data point có timestamp tới **2 tuần trong quá khứ** và **2 giờ trong tương lai** mà không báo lỗi. Vì vậy cần cấu hình đồng hồ instance đúng (NTP).
</details>

**Câu 4.** Bạn có một Auto Scaling Group với min = 2, và một CloudWatch Alarm để scale-in khi CPU thấp. ASG hiện đang có 2 instance, CPU rất thấp và alarm đang ở trạng thái `ALARM`. Điều gì xảy ra?

- A. Alarm sẽ terminate cả 2 instance
- B. ASG giảm xuống 1 instance
- C. Alarm vẫn ở trạng thái `ALARM` nhưng ASG không giảm dưới min capacity
- D. Alarm tự chuyển về `OK`

<details><summary>Đáp án</summary>

**C.** Alarm phản ánh metric nên vẫn ở `ALARM`, nhưng scaling action **không bao giờ đưa ASG xuống dưới min capacity**. Số instance giữ nguyên là 2.
</details>

**Câu 5.** Một CloudWatch Alarm được cấu hình trên **high-resolution custom metric**. Có thể đặt period đánh giá là bao nhiêu?

- A. Chỉ 1 phút trở lên
- B. 10 giây hoặc 30 giây (hoặc bội số của 60 giây)
- C. 1 giây
- D. 5 phút

<details><summary>Đáp án</summary>

**B.** Alarm trên high-resolution metric có thể dùng period **10 hoặc 30 giây**, hoặc bội số của 60 giây.
</details>

**Câu 6.** Bạn muốn **kiểm tra nhanh** rằng action của CloudWatch Alarm (gửi SNS, terminate EC2) chạy đúng, mà không phải đợi metric vượt ngưỡng. Cách nào?

- A. Tăng tải CPU lên 100% bằng stress test
- B. Dùng CLI `aws cloudwatch set-alarm-state`
- C. Tạo lại alarm với threshold 0
- D. Dùng `PutMetricData` gửi giá trị giả

<details><summary>Đáp án</summary>

**B.** `set-alarm-state` ép alarm sang `ALARM` tạm thời để kích hoạt action, nhanh và không tốn tài nguyên. Các cách khác có thể làm được nhưng chậm, tốn kém hoặc làm sai lệch dữ liệu.
</details>

**Câu 7.** Bạn cần **gửi thông báo** khi log của ứng dụng trong CloudWatch Logs chứa chữ `ERROR` quá 10 lần trong 5 phút. Giải pháp nào đơn giản nhất?

- A. Viết Lambda chạy mỗi 5 phút đọc log group
- B. Tạo Metric Filter trên log group, đặt CloudWatch Alarm trên metric đó và gửi SNS
- C. Export log sang S3 và dùng Athena
- D. Bật CloudTrail Insights

<details><summary>Đáp án</summary>

**B.** **Metric Filter** đếm số dòng khớp `ERROR` thành metric, **Alarm** trên metric đó gửi **SNS**. Không cần code. Lưu ý metric filter **không hồi tố** dữ liệu cũ.
</details>

**Câu 8.** Bạn muốn **phân tích log gần như real-time** từ CloudWatch Logs bằng Lambda/Kinesis. Dùng tính năng nào?

- A. `CreateExportTask` sang S3
- B. CloudWatch Logs Subscription Filter
- C. CloudWatch Logs Insights
- D. Metric Filter

<details><summary>Đáp án</summary>

**B.** **Subscription Filter** stream log real-time tới Kinesis Data Streams, Firehose hoặc Lambda. Export S3 là batch, mất tới 12 giờ. Logs Insights là truy vấn tương tác, không phải stream.
</details>

**Câu 9.** Bạn cần gom log CloudWatch từ **nhiều tài khoản và nhiều Region** về một đích chung. Giải pháp nào phù hợp?

- A. Dùng S3 Cross-Region Replication
- B. Subscription Filter ở các tài khoản nguồn gửi tới Destination (Kinesis Data Streams/Firehose) ở tài khoản đích, với destination access policy và IAM role phù hợp
- C. Dùng CloudTrail organization trail
- D. Không thể gom log đa tài khoản

<details><summary>Đáp án</summary>

**B.** Cross-account log aggregation dùng **subscription filter** gửi tới **CloudWatch Logs destination** (bọc Kinesis Data Streams/Firehose) ở tài khoản đích, cấu hình **destination access policy** và IAM role. (Ngày nay còn có thể dùng **CloudWatch cross-account observability**.)
</details>

**Câu 10.** Ứng dụng của bạn muốn **mô phỏng thao tác của khách hàng** (đăng nhập, thêm giỏ hàng, checkout) trên website mỗi 5 phút và chụp screenshot. Dịch vụ nào phù hợp?

- A. CloudWatch Synthetics Canary
- B. AWS X-Ray
- C. Route 53 Health Check
- D. CloudWatch Logs Insights

<details><summary>Đáp án</summary>

**A.** **Synthetics Canary** chạy script Node.js/Python với headless Chrome để mô phỏng người dùng, kiểm tra availability, latency và chụp screenshot, theo lịch.
</details>

**Câu 11.** Bạn muốn **nhận email** mỗi khi một EC2 instance trong tài khoản chuyển sang trạng thái `terminated`. Cách đơn giản nhất?

- A. CloudWatch Alarm trên `CPUUtilization`
- B. EventBridge rule với event pattern EC2 State-change (`terminated`), target SNS topic
- C. Lambda poll `DescribeInstances` mỗi phút
- D. CloudWatch Logs Metric Filter

<details><summary>Đáp án</summary>

**B.** EC2 tự phát event *EC2 Instance State-change Notification* lên default event bus. Rule EventBridge lọc state `terminated` và gửi tới **SNS**.
</details>

**Câu 12.** Một ứng dụng SaaS bên thứ ba (vd Zendesk, Datadog) cần gửi sự kiện vào AWS để kích hoạt Lambda. Dùng loại event bus nào?

- A. Default event bus
- B. Partner event bus
- C. Custom event bus
- D. SQS queue

<details><summary>Đáp án</summary>

**B.** **Partner event bus** nhận sự kiện từ đối tác SaaS tích hợp với EventBridge. Default bus cho dịch vụ AWS; custom bus cho ứng dụng của bạn.
</details>

**Câu 13.** Công ty có nhiều tài khoản trong AWS Organization và muốn **gom tất cả sự kiện EventBridge** về một tài khoản trung tâm. Cần cấu hình gì trên event bus trung tâm?

- A. Bật Schema Discovery
- B. Resource-based policy cho phép `events:PutEvents` từ các tài khoản (hoặc từ Organization)
- C. Archive & Replay
- D. IAM user ở tài khoản trung tâm cho từng tài khoản

<details><summary>Đáp án</summary>

**B.** Event bus trung tâm cần **resource-based policy** cho phép các tài khoản nguồn (hoặc `aws:PrincipalOrgID`) gọi `PutEvents`. Mỗi tài khoản nguồn tạo rule với target là event bus trung tâm.
</details>

**Câu 14.** Sau khi sửa lỗi trong consumer, bạn muốn **phát lại các sự kiện** đã đi qua event bus trong 2 ngày trước. Tính năng nào?

- A. Schema Registry
- B. EventBridge Archive & Replay
- C. SQS Dead Letter Queue
- D. CloudTrail Event history

<details><summary>Đáp án</summary>

**B.** **Archive** lưu sự kiện của event bus, **Replay** phát lại sự kiện trong khoảng thời gian chọn.
</details>

**Câu 15.** Ứng dụng chạy trên EC2 đã được instrument bằng X-Ray SDK nhưng **không có trace nào** trên console X-Ray. Hai nguyên nhân có khả năng nhất là gì? (Chọn 2)

- A. EC2 instance role thiếu quyền ghi X-Ray
- B. X-Ray daemon chưa được cài/chạy trên instance
- C. Chưa bật CloudTrail
- D. Chưa bật Detailed Monitoring
- E. Chưa tạo CloudWatch Alarm

<details><summary>Đáp án</summary>

**A, B.** Trên EC2, SDK gửi segment qua UDP tới **X-Ray daemon**, daemon cần **IAM role** có quyền (`AWSXRayDaemonWriteAccess`) để gửi lên X-Ray.
</details>

**Câu 16.** Lambda function của bạn đã bật **Active Tracing** nhưng không thấy trace trên X-Ray. Nguyên nhân có thể là gì?

- A. Lambda không hỗ trợ X-Ray
- B. Execution role của Lambda thiếu quyền ghi X-Ray (`AWSXRayDaemonWriteAccess`)
- C. Phải cài X-Ray daemon trong Lambda layer
- D. Phải mở port 2000 trong Security Group

<details><summary>Đáp án</summary>

**B.** Lambda đã chạy sẵn daemon; cần **Active Tracing** + **IAM permission** trên execution role (+ import SDK nếu muốn subsegment chi tiết). Không cần tự cài daemon hay mở Security Group.
</details>

**Câu 17.** X-Ray daemon lắng nghe trên **port và giao thức** nào?

- A. TCP 2000
- B. UDP 2000
- C. TCP 443
- D. UDP 53

<details><summary>Đáp án</summary>

**B.** Daemon mặc định lắng nghe **UDP 2000** (`127.0.0.1:2000`), có thể đổi qua `AWS_XRAY_DAEMON_ADDRESS`. Daemon gọi API X-Ray qua HTTPS khi gửi lên AWS.
</details>

**Câu 18.** Bạn muốn **tìm các trace** của những request do một khách hàng cụ thể (`customer_id`) thực hiện trong X-Ray console. Bạn nên thêm thông tin này vào trace như thế nào?

- A. Metadata
- B. Annotation
- C. Segment name
- D. Sampling rule

<details><summary>Đáp án</summary>

**B.** **Annotation** là key-value **được index**, dùng được trong **filter expression** (`annotation.customer_id = "123"`). **Metadata không được index** nên không tìm kiếm được.
</details>

**Câu 19.** Với sampling rule **mặc định** của X-Ray SDK, nếu ứng dụng nhận đều **50 request mỗi giây**, khoảng bao nhiêu request mỗi giây được ghi?

- A. 50
- B. 1
- C. Khoảng 3,5 (1 + 5% của 49)
- D. 5

<details><summary>Đáp án</summary>

**C.** Rule mặc định: **reservoir 1 request/giây** + **rate 5%** các request còn lại: 1 + 0,05 × 49 ≈ 3,45 request/giây.
</details>

**Câu 20.** Bạn vừa tạo sampling rule mới trên console X-Ray để tăng tỉ lệ ghi cho endpoint `/checkout`, nhưng ứng dụng trên EC2 vẫn ghi theo rule mặc định. IAM role của daemon có thể thiếu quyền nào?

- A. `xray:PutTraceSegments`
- B. `xray:GetSamplingRules`
- C. `xray:BatchGetTraces`
- D. `xray:GetServiceGraph`

<details><summary>Đáp án</summary>

**B.** Daemon/SDK cần **`GetSamplingRules`** (cùng `GetSamplingTargets`, `GetSamplingStatisticSummaries`) để lấy rule mới động mà không cần restart. `PutTraceSegments` dùng để gửi segment; `BatchGetTraces`/`GetServiceGraph` là API đọc.
</details>

**Câu 21.** Bạn chạy ứng dụng trên **ECS Fargate** và muốn bật X-Ray. Cách triển khai X-Ray daemon nào đúng?

- A. Cài daemon lên host EC2 bên dưới
- B. Chạy daemon như ECS daemon service, một container mỗi instance
- C. Chạy X-Ray daemon dạng sidecar container trong cùng task definition, mở UDP 2000
- D. Fargate không hỗ trợ X-Ray

<details><summary>Đáp án</summary>

**C.** Fargate không cho truy cập host, nên **bắt buộc dùng sidecar**. Container app đặt `AWS_XRAY_DAEMON_ADDRESS` trỏ tới daemon; task role cần quyền X-Ray.
</details>

**Câu 22.** Trong Lambda, biến môi trường nào chứa **tracing header** của X-Ray?

- A. `AWS_XRAY_DAEMON_ADDRESS`
- B. `_X_AMZN_TRACE_ID`
- C. `AWS_XRAY_CONTEXT_MISSING`
- D. `AWS_LAMBDA_FUNCTION_NAME`

<details><summary>Đáp án</summary>

**B.** `_X_AMZN_TRACE_ID` chứa tracing header (Root, Parent, Sampled). `AWS_XRAY_DAEMON_ADDRESS` là địa chỉ `IP:port` của daemon; `AWS_XRAY_CONTEXT_MISSING` quy định hành vi khi thiếu context.
</details>

**Câu 23.** Một bảng DynamoDB trên production bị xoá. Bạn cần biết **ai đã xoá và khi nào**. Dịch vụ nào cần xem đầu tiên?

- A. CloudWatch Metrics
- B. AWS X-Ray
- C. AWS CloudTrail
- D. CloudWatch Logs Insights

<details><summary>Đáp án</summary>

**C.** **CloudTrail** ghi mọi API call (`DeleteTable`) kèm danh tính, thời gian, IP. Event history giữ **90 ngày** sẵn có. Để được cảnh báo ngay lần sau: **EventBridge rule** trên event "AWS API Call via CloudTrail" gửi **SNS**.
</details>

**Câu 24.** Bạn muốn ghi lại các thao tác **`GetObject` và `PutObject`** trên một S3 bucket và giữ log **hơn 90 ngày** để phân tích bằng SQL. Cần làm gì?

- A. Không cần làm gì, CloudTrail ghi mặc định
- B. Tạo trail bật Data Events cho bucket đó, lưu vào S3 và phân tích bằng Athena
- C. Bật CloudTrail Insights
- D. Bật CloudWatch Detailed Monitoring cho S3

<details><summary>Đáp án</summary>

**B.** S3 object-level là **Data Events**, **không ghi mặc định**; phải tạo **trail** và bật data events. Trail ghi vào **S3**, phân tích bằng **Athena** (hoặc dùng CloudTrail Lake). Insights chỉ phát hiện bất thường trên management events.
</details>

---

[← Chương 19](ch19-aws-integration-messaging-sqs-sns-kine.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chương 21 →](ch21-aws-serverless-lambda.md)

