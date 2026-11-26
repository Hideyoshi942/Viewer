# Bài tập tình huống — Chủ đề 8: Decoupling & Messaging — Amazon SQS, SNS, Kinesis Data Streams & Amazon MQ

> SQS Standard vs FIFO, Visibility Timeout, Long Polling, Dead-Letter Queues (DLQ), SNS Fan-out Pattern, Kinesis Data Streams vs Firehose & Amazon MQ.
> **Số câu hỏi:** 9 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A clickstream analytics platform ingests millions of user interaction events per second from a website. The company wants to automatically buffer, convert the raw JSON events into Apache Parquet format, compress them, and deliver them directly into an Amazon S3 data lake bucket with near-real-time delivery (every 60 seconds) and zero server management. Which AWS service should the solutions architect choose?

- **A.** Amazon SQS FIFO Queue with dead-letter queue redrive
- **B.** AWS Snowmobile physical data transport container
- **C.** Amazon SNS standard topic with HTTP/S subscriptions
- **D.** Amazon Data Firehose (formerly Kinesis Data Firehose)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng phân tích clickstream tiếp nhận hàng triệu sự kiện tương tác người dùng mỗi giây từ một trang web. Công ty muốn tự động đệm (buffer), chuyển đổi các sự kiện JSON thô sang định dạng Apache Parquet, nén chúng và gửi trực tiếp vào một Amazon S3 data lake bucket với tốc độ gần thời gian thực (mỗi 60 giây) và hoàn toàn không cần quản lý máy chủ. Solutions architect nên chọn dịch vụ AWS nào?

**Đáp án đúng:** **D**

Phân biệt **Kinesis Data Streams** vs **Amazon Data Firehose**:
- **Kinesis Data Streams**: Thời gian thực (**Real-time ~70-200ms**), quản lý theo Shards (hoặc On-demand), lưu giữ dữ liệu **1–365 ngày**, hỗ trợ đọc lại (**Replay**).
- **Amazon Data Firehose**: Gần thời gian thực (**Near real-time**, theo kích thước MB hoặc thời gian 0–900s), tự động co giãn không cần quản lý Shard, tự động **convert JSON sang Parquet/ORC** và đẩy thẳng vào **S3 / Redshift / OpenSearch**.

- **A:** Sai vì SQS FIFO giới hạn thông lượng 300–3,000 msg/s và không tự động chuyển đổi định dạng sang Parquet hay đẩy thẳng vào S3.
- **B:** Sai vì Snowmobile là xe container vận chuyển dữ liệu offline quy mô Exabyte.
- **C:** Sai vì SNS không gom buffer và không chuyển đổi JSON sang Parquet để lưu vào S3.
- **D (Đúng):** Đúng! **Amazon Data Firehose** là dịch vụ managed hoàn toàn (serverless), tự động gom buffer (near real-time >= 60s), chuyển đổi JSON sang Parquet/ORC (nhờ AWS Glue schema) và ghi thẳng vào S3, Redshift, OpenSearch hoặc Splunk.

</details>

### Câu 2 `hard`

A retail company integrates with a SaaS partner (Shopify) that sends order events as JSON payloads. The company needs to route events where `orderValue > 1000` to an AWS Step Functions workflow, and all other events to an Amazon SQS queue, with the ability to replay past events if a downstream bug occurs. Which service should be used as the central event router?

- **A.** Amazon SNS with Message Filtering
- **B.** Amazon EventBridge
- **C.** Amazon Kinesis Data Firehose
- **D.** Amazon MQ

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty bán lẻ tích hợp với đối tác SaaS (Shopify) gửi các sự kiện đơn hàng dưới dạng JSON payload. Công ty cần định tuyến các sự kiện có `orderValue > 1000` tới một AWS Step Functions workflow, và tất cả các sự kiện khác tới một Amazon SQS queue, kèm khả năng phát lại (replay) các sự kiện trong quá khứ nếu xảy ra lỗi ở hệ thống phía sau. Nên sử dụng dịch vụ nào làm bộ định tuyến sự kiện trung tâm?

**Đáp án đúng:** **B**

Từ khóa **SaaS partner integration**, **content-based JSON filtering**, và **Archive & Replay events** là dấu hiệu nhận biết kinh điển của **Amazon EventBridge**.

- **A:** Sai vì SNS không hỗ trợ tích hợp trực tiếp đối tác SaaS (Shopify) và không có tính năng Archive & Replay các sự kiện đã qua.
- **B (Đúng):** Đúng! Amazon EventBridge hỗ trợ Partner Event Bus (Shopify, Zendesk, Datadog...), lọc sâu theo nội dung JSON payload, điều hướng tới Step Functions/SQS và có tính năng Archive & Replay Events.
- **C:** Sai vì Firehose dùng để đẩy dữ liệu streaming vào kho lưu trữ (S3, Redshift, OpenSearch), không phải Event Router cho Step Functions.
- **D:** Sai vì Amazon MQ là message broker (ActiveMQ/RabbitMQ) cho hệ thống legacy, không có SaaS integration hay event replay.

</details>

### Câu 3 `medium`

An IoT company collects telemetry data from millions of sensors and needs to ingest, transform, and store the streaming data into Amazon S3 in Apache Parquet format for analytics. The team accepts a delivery latency of 60 seconds and wants a fully serverless solution with zero shard management. Which AWS service should they use?

- **A.** Amazon Data Firehose
- **B.** Amazon Kinesis Data Streams
- **C.** Amazon SQS FIFO
- **D.** Amazon MSK

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty IoT thu thập dữ liệu đo từ xa (telemetry) từ hàng triệu cảm biến và cần tiếp nhận, chuyển đổi rồi lưu trữ dữ liệu luồng (streaming) vào Amazon S3 ở định dạng Apache Parquet phục vụ phân tích. Nhóm chấp nhận độ trễ truyền tải 60 giây và muốn một giải pháp hoàn toàn serverless không cần quản lý shard. Họ nên sử dụng dịch vụ AWS nào?

**Đáp án đúng:** **A**

Cần đẩy streaming data vào **S3/Redshift/OpenSearch** ở định dạng **Parquet** với **ít vận hành nhất** và chấp nhận trễ **>= 60 giây** → **Amazon Data Firehose**.

- **A (Đúng):** Đúng! Amazon Data Firehose hoàn toàn serverless, tự động scale, hỗ trợ chuyển đổi định dạng sang Apache Parquet/ORC và đẩy thẳng vào Amazon S3 (buffer tối thiểu 60 giây).
- **B:** Sai vì Kinesis Data Streams yêu cầu bạn tự viết consumer (Lambda/EC2) để chuyển đổi sang Parquet và ghi vào S3.
- **C:** Sai vì SQS không tự động chuyển đổi dữ liệu sang Parquet và đẩy vào S3.
- **D:** Sai vì MSK (Managed Kafka) yêu cầu quản lý cluster brokers và tự viết Kafka Connect/consumer.

</details>

### Câu 4 `medium`

An application sends messages up to 15 MB in size through an Amazon SQS queue to downstream worker EC2 instances. However, SQS API calls are failing because the payload exceeds the maximum SQS message size limit of 256 KB. What is the most cost-effective and scalable solution?

- **A.** Increase the MaximumMessageSize attribute of the Amazon SQS queue to 20 MB in the AWS Management Console.
- **B.** Migrate the queue from Amazon SQS Standard to Amazon SQS FIFO with content-based deduplication enabled.
- **C.** Store the 15 MB payload in AWS Systems Manager Parameter Store as an Advanced Parameter and pass the key.
- **D.** Store the 15 MB payload in S3 and use the SQS Extended Client Library to send a pointer in the SQS message.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng gửi các thông điệp có kích thước lên tới 15 MB qua một Amazon SQS queue tới các worker EC2 instance ở phía sau. Tuy nhiên, các lệnh gọi SQS API đang bị lỗi vì payload vượt quá giới hạn kích thước thông điệp tối đa 256 KB của SQS. Giải pháp tối ưu chi phí và có khả năng mở rộng nhất là gì?

**Đáp án đúng:** **D**

Giới hạn tối đa của SQS message là **256 KB**. Để gửi message lớn (lên tới 2 GB) qua SQS → Dùng **Amazon S3 + SQS Extended Client Library**.

- **A:** Sai vì 256 KB là giới hạn cứng của SQS, không thể tăng lên 20 MB.
- **B:** Sai vì SQS FIFO cũng có giới hạn tối đa 256 KB.
- **C:** Sai vì Parameter Store chỉ lưu tối đa 4 KB - 8 KB.
- **D (Đúng):** Đúng! **SQS Extended Client Library** tự động lưu payload lớn (> 256 KB, tối đa 2 GB) vào **Amazon S3** và chỉ gửi S3 URI/reference nhỏ gọn qua SQS.

</details>

### Câu 5 `medium`

An application uses an Amazon API Gateway REST API backed by AWS Lambda. During a sudden traffic spike, an upstream service calls an endpoint that triggers a 2-minute report generation task, causing API Gateway to return `504 Gateway Timeout` errors after 29 seconds. How should the architect redesign this workflow?

- **A.** Increase the API Gateway backend integration timeout limit to 120 seconds in the stage settings.
- **B.** Migrate from Amazon API Gateway REST API to an Amazon API Gateway HTTP API endpoint.
- **C.** Configure API Gateway to push requests to SQS or Step Functions, return `202 Accepted`, and notify clients later.
- **D.** Enable API Gateway stage response caching with a 300-second TTL for the report generation endpoint.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng sử dụng Amazon API Gateway REST API với backend là AWS Lambda. Trong một đợt tăng lưu lượng đột biến, một dịch vụ phía trước gọi tới một endpoint kích hoạt tác vụ tạo báo cáo mất 2 phút, khiến API Gateway trả về lỗi `504 Gateway Timeout` sau 29 giây. Kiến trúc sư nên thiết kế lại quy trình này như thế nào?

**Đáp án đúng:** **C**

API Gateway có giới hạn timeout **29 giây**. Tác vụ backend chạy lâu hơn 29 giây bắt buộc phải chuyển sang mô hình **Asynchronous (SQS / Step Functions)**.

- **A:** Sai vì 29 giây là giới hạn cứng (hard limit) của API Gateway Integration Timeout, không thể tăng lên 120 giây.
- **B:** Sai vì HTTP API cũng có giới hạn timeout tối đa tương tự (30 giây).
- **C (Đúng):** Đúng! Chuyển sang kiến trúc **Asynchronous Request-Reply** (API Gateway -> SQS/Step Functions -> Lambda/Fargate) giúp API Gateway trả về ngay lập tức dưới 29 giây.
- **D:** Sai vì Caching không giúp ích cho các request tạo báo cáo mới lần đầu mất 2 phút.

</details>

### Câu 6 `medium`

A company is building an asynchronous order processing system using Amazon SNS and Amazon SQS. When an order is placed, three independent microservices (Billing, Inventory, and Shipping) must each receive a copy of the order event, process it at their own pace, and retry failed messages without losing data. Which TWO architectural practices should be implemented? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Configure all three microservices (Billing, Inventory, Shipping) to poll the exact same single SQS queue.
- **B.** Publish order events to one SNS topic and subscribe three separate SQS queues (one per microservice) to it.
- **C.** Configure a Dead-Letter Queue (DLQ) for each SQS queue to capture messages that fail after max retries.
- **D.** Use Amazon Kinesis Data Firehose to push order events directly to the three microservices' SQS queues.
- **E.** Set the SQS Visibility Timeout to 0 seconds on all queues so failed messages are immediately retried.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty đang xây dựng hệ thống xử lý đơn hàng bất đồng bộ bằng Amazon SNS và Amazon SQS. Khi một đơn hàng được đặt, ba microservice độc lập (Billing, Inventory và Shipping) phải cùng nhận được một bản sao của sự kiện đơn hàng, xử lý theo tốc độ riêng của mình và thử lại các thông điệp bị lỗi mà không làm mất dữ liệu. Nên triển khai HAI thực hành kiến trúc nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, C**

Kiến trúc **Fan-out bền vững cho nhiều Microservices** = **1 SNS Topic + nhiều SQS Queues (kèm DLQ)**.

- **A:** Sai vì trong SQS, một message chỉ được 1 consumer nhận tại một thời điểm và bị xóa sau khi xử lý xong, nên 3 microservice không thể cùng nhận bản sao từ 1 queue duy nhất.
- **B (Đúng):** Đúng! Mô hình **SNS + SQS Fan-out** giúp gửi 1 sự kiện tới nhiều microservice độc lập, mỗi microservice có buffer queue riêng để xử lý theo tốc độ của mình.
- **C (Đúng):** Đúng! **Dead-Letter Queue (DLQ)** giữ lại các message lỗi sau `maxReceiveCount` lần thử để điều tra mà không làm tắc nghẽn queue chính.
- **D:** Sai vì Firehose đẩy dữ liệu vào kho lưu trữ (S3/Redshift/OpenSearch), không phải queue cho microservices.
- **E:** Sai vì Visibility Timeout = 0 sẽ khiến nhiều worker đọc trùng lặp cùng một message ngay lập tức.

</details>

### Câu 7 `medium`

A video processing platform receives user uploads and runs CPU-intensive transcoding jobs that can take up to 20 minutes per video. During peak hours, upload requests spike sharply, overwhelming the backend EC2 worker fleet and causing dropped requests. How should the solutions architect decouple the ingestion tier from the processing tier to handle traffic spikes reliably?

- **A.** Send job messages to an SQS queue and scale an EC2 worker ASG based on `ApproximateNumberOfMessagesVisible`.
- **B.** Place an Application Load Balancer directly in front of the EC2 worker fleet and increase the ALB idle timeout to 20 minutes.
- **C.** Trigger an AWS Lambda function directly from the upload API to perform the 20-minute video transcoding synchronously.
- **D.** Write the job metadata to an Amazon RDS database and have EC2 instances poll the database every 100 milliseconds.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng xử lý video tiếp nhận tệp tải lên của người dùng và chạy các tác vụ chuyển mã tiêu tốn nhiều CPU, có thể mất tới 20 phút cho mỗi video. Trong giờ cao điểm, yêu cầu tải lên tăng đột biến, làm quá tải đội ngũ EC2 worker ở backend và gây rớt yêu cầu. Solutions architect nên tách rời tầng tiếp nhận (ingestion tier) khỏi tầng xử lý (processing tier) như thế nào để xử lý các đợt tăng đột biến lưu lượng một cách đáng tin cậy?

**Đáp án đúng:** **A**

Bất kỳ bài toán nào có **traffic spikes**, **long-running jobs (> 15 phút)**, và cần **decouple** -> Dùng **Amazon SQS** kết hợp **EC2 Auto Scaling** dựa trên số lượng message trong queue (Queue Depth).

- **A (Đúng):** Đúng! Amazon SQS đóng vai trò bộ đệm (buffer) lưu giữ các tác vụ khi lưu lượng tăng đột biến, giúp tách biệt tầng nhận yêu cầu và tầng xử lý. Auto Scaling group tăng/giảm số lượng EC2 worker dựa trên độ dài hàng đợi.
- **B:** Sai vì xử lý đồng bộ qua HTTP cho tác vụ 20 phút rất dễ lỗi timeout (idle timeout tối đa của ALB cũng chỉ 4000s nhưng giữ kết nối HTTP lâu rất kém ổn định) và không chống được traffic spike.
- **C:** Sai vì thời gian chạy tối đa của AWS Lambda là 15 phút, không thể chạy tác vụ 20 phút.
- **D:** Sai vì dùng RDS làm hàng đợi gây tải lớn (polling liên tục) và không hiệu quả bằng SQS.

</details>

### Câu 8 `medium`

An order fulfillment application publishes an event whenever a new order is placed. Three independent downstream microservices (Inventory, Billing, and Shipping) must each receive a copy of every order event and process it asynchronously at their own pace without losing messages if a service is temporarily down. Which architecture should the solutions architect choose?

- **A.** Send order events to a single Amazon SQS standard queue and have all three microservices poll the same queue.
- **B.** Publish order events to an Amazon SNS topic and subscribe three separate SQS queues (one per microservice) to it.
- **C.** Use an Application Load Balancer to forward order HTTP POST requests simultaneously to all three microservices.
- **D.** Configure Amazon SNS to invoke AWS Lambda functions synchronously for each microservice without any buffering queue.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng hoàn tất đơn hàng (order fulfillment) phát hành một sự kiện mỗi khi có đơn hàng mới được đặt. Ba microservice độc lập ở phía sau (Inventory, Billing và Shipping) đều phải nhận được một bản sao của mọi sự kiện đơn hàng và xử lý bất đồng bộ theo tốc độ riêng mà không làm mất thông điệp nếu một dịch vụ tạm thời ngừng hoạt động. Solutions architect nên chọn kiến trúc nào?

**Đáp án đúng:** **B**

Mẫu kiến trúc **Fan-out** kinh điển trên AWS: **1 Amazon SNS Topic -> nhiều Amazon SQS Queues** (mỗi queue cho một microservice độc lập).

- **A:** Sai vì trong một SQS queue, một message chỉ được xử lý bởi một consumer rồi bị xóa; ba service dùng chung một queue sẽ tranh giành và làm mất message của nhau.
- **B (Đúng):** Đúng! Mô hình SNS + SQS Fan-out cho phép phát sự kiện một lần tới nhiều hàng đợi SQS độc lập. Mỗi microservice đọc từ queue riêng của mình theo tốc độ riêng và không lo mất dữ liệu khi service tạm ngừng.
- **C:** Sai vì ALB chỉ định tuyến mỗi HTTP request tới một target group tại một thời điểm, không hỗ trợ fan-out bất đồng bộ và lưu trữ khi service down.
- **D:** Sai vì nếu downstream microservice gặp sự cố kéo dài, cần có SQS queue để giữ message an toàn và xử lý theo tốc độ riêng của từng service.

</details>

### Câu 9 `medium`

An IoT platform ingests streaming telemetry data from 100,000 sensors. The data must be transformed (converted from JSON to Apache Parquet) in near real time and delivered automatically into an Amazon S3 data lake without writing or managing custom consumer applications. Which AWS service meets this requirement with the LEAST operational overhead?

- **A.** Amazon Kinesis Data Streams with custom EC2 KCL consumers
- **B.** Amazon SQS Standard Queue
- **C.** AWS Database Migration Service (DMS)
- **D.** Amazon Data Firehose (Kinesis Data Firehose)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng IoT tiếp nhận dữ liệu đo từ xa theo luồng (streaming) từ 100.000 cảm biến. Dữ liệu phải được chuyển đổi (từ JSON sang Apache Parquet) gần thời gian thực và được đưa tự động vào Amazon S3 data lake mà không cần viết hoặc quản lý các ứng dụng consumer tùy chỉnh. Dịch vụ AWS nào đáp ứng yêu cầu này với chi phí vận hành THẤP NHẤT?

**Đáp án đúng:** **D**

Phân biệt **Kinesis Data Streams vs Amazon Data Firehose**: Cần phân tích real-time tùy biến dưới 1 giây hoặc nhiều consumer đọc lại -> **Kinesis Data Streams**. Cần nạp thẳng vào **S3/Redshift/OpenSearch**, tự động convert JSON -> **Parquet**, không cần quản lý consumer (near real-time 60s) -> **Amazon Data Firehose**.

- **A:** Sai vì Kinesis Data Streams yêu cầu bạn tự quản lý shard và tự viết/vận hành consumer application trên EC2/Lambda để chuyển đổi sang Parquet và ghi ra S3.
- **B:** Sai vì SQS không tự động chuyển đổi định dạng sang Parquet và tự động đẩy batch vào S3.
- **C:** Sai vì DMS dùng để di chuyển hoặc đồng bộ CDC từ các cơ sở dữ liệu (RDS/Oracle/SQL Server), không phải pipeline thu thập IoT streaming.
- **D (Đúng):** Đúng! Amazon Data Firehose là dịch vụ fully managed chuyên thu thập streaming data, hỗ trợ chuyển đổi định dạng JSON sang Parquet/ORC gốc và tự động ghi vào Amazon S3 (hoặc Redshift, OpenSearch) mà không cần viết consumer app.

</details>

---

[Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md)
