# Bài tập tình huống — Event-Driven Ops: EventBridge, SQS DLQ & AWS Health

> Amazon EventBridge Rules, EventBridge Pipes, Archive & Replay, CloudWatch Composite Alarms, AWS Health Dashboard Events và SQS Dead-Letter Queues.
> **Số câu hỏi:** 12 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

An on-call SRE team suffers from severe alert fatigue. Whenever a single microservice experiences a brief traffic spike or a planned database maintenance window occurs, three separate CloudWatch alarms (high CPU, high ALB 5xx rate, and high TargetResponseTime) fire independently and page the on-call engineer. The team wants to be paged ONLY when high ALB 5xx errors AND high TargetResponseTime occur simultaneously, and wants all paging suppressed automatically whenever a maintenance-mode alarm is active. What is the MOST operationally efficient solution?

- **A.** Route all three CloudWatch alarms to an Amazon SQS queue and deploy an AWS Lambda function that queries DynamoDB to correlate alerts over a 5-minute window.
- **B.** Configure a CloudWatch Composite Alarm combining ALB 5xx and TargetResponseTime with AND, set maintenance as ActionsSuppressor, and drop child SNS actions.
- **C.** Increase the Evaluation Periods and Datapoints to Alarm on all three individual CloudWatch alarms to 15 out of 15 datapoints to reduce false positives.
- **D.** Enable CloudWatch Anomaly Detection bands on EC2 CPU utilization metrics and delete the individual ALB 5xx and TargetResponseTime alarms.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm SRE trực sự cố đang chịu tình trạng quá tải cảnh báo nghiêm trọng. Mỗi khi một microservice đơn lẻ gặp đợt tăng lưu lượng ngắn hoặc diễn ra khung giờ bảo trì cơ sở dữ liệu theo kế hoạch, ba CloudWatch alarm riêng biệt (CPU cao, tỷ lệ ALB 5xx cao và TargetResponseTime cao) đều kích hoạt độc lập và gọi điện cho kỹ sư trực. Nhóm muốn CHỈ được gọi khi lỗi ALB 5xx cao VÀ TargetResponseTime cao xảy ra đồng thời, đồng thời muốn mọi thông báo gọi điện tự động bị tắt bất cứ khi nào alarm chế độ bảo trì đang hoạt động. Giải pháp hiệu quả về mặt vận hành NHẤT là gì?

**Đáp án đúng:** **B**

CloudWatch Composite Alarms với biểu thức Boolean (AND/OR/NOT) và tính năng ActionsSuppressor là giải pháp chuẩn của AWS để giảm nhiễu cảnh báo (alert fatigue) và chặn thông báo tự động trong khung giờ bảo trì.

- **A:** Sai. Phải tự viết và duy trì logic tương quan bằng SQS + Lambda + DynamoDB, tốn công vận hành hơn nhiều so với tính năng Composite Alarm có sẵn.
- **B (Đúng):** Chính xác! CloudWatch Composite Alarm cho phép gộp nhiều child alarm bằng biểu thức logic (AND/OR), đồng thời hỗ trợ ActionsSuppressor để tự động chặn thông báo khi maintenance-mode alarm đang kích hoạt, giảm triệt để tình trạng alert fatigue.
- **C:** Sai. Tăng Evaluation Periods làm chậm thời gian phát hiện sự cố thực sự và vẫn gửi 3 cảnh báo riêng lẻ, cũng không tự tắt cảnh báo lúc bảo trì.
- **D:** Sai. Xóa các alarm về lỗi 5xx và độ trễ sẽ làm mất khả năng phát hiện sự cố ảnh hưởng trực tiếp tới người dùng.

</details>

### Câu 2 `medium`

An event-driven order fulfillment system uses an Amazon SQS standard queue processed by an AWS Lambda function. Occasionally, malformed payloads or transient downstream ERP API bugs cause messages to fail repeatedly and block healthy processing. The DevOps team needs to isolate poison-pill messages after 3 failed attempts, alert engineers immediately when any message is isolated, and provide an operationally simple way to replay those messages back to the main queue once the downstream bug is fixed—without writing custom replay scripts. Which solution should they implement?

- **A.** Set the Lambda event source mapping RetryAttempts to 100 and increase the source SQS queue VisibilityTimeout to 12 hours to isolate failed messages.
- **B.** Configure an SQS DLQ (maxReceiveCount=3), alarm on ApproximateNumberOfMessagesVisible > 0, and use native SQS DLQ Redrive after fixing.
- **C.** Configure an Amazon SNS topic as the DLQ target directly on the SQS redrive policy so failed messages are emailed to engineers for manual re-entry.
- **D.** Write failed messages from the Lambda catch block into an Amazon S3 bucket and run an AWS Glue ETL job to push them back to the source SQS queue.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hệ thống hoàn tất đơn hàng hướng sự kiện sử dụng Amazon SQS standard queue được xử lý bởi một AWS Lambda function. Thỉnh thoảng, payload sai định dạng hoặc lỗi API ERP tạm thời phía sau khiến message thất bại liên tục và chặn quá trình xử lý bình thường. Nhóm DevOps cần cô lập các message độc hại (poison-pill) sau 3 lần thử thất bại, cảnh báo ngay cho kỹ sư khi có bất kỳ message nào bị cô lập và cung cấp cách đơn giản về mặt vận hành để phát lại (replay) các message đó về queue chính sau khi lỗi phía sau được khắc phục—mà không cần viết script phát lại tùy chỉnh. Họ nên triển khai giải pháp nào?

**Đáp án đúng:** **B**

Mẫu xử lý lỗi chuẩn cho hàng đợi SQS là: Redrive Policy (maxReceiveCount) -> SQS Dead-Letter Queue -> CloudWatch Alarm (ApproximateNumberOfMessagesVisible) -> khắc phục sự cố -> SQS DLQ Redrive native về lại source queue.

- **A:** Sai. Lambda SQS event source mapping không dùng RetryAttempts theo kiểu cô lập poison-pill và tăng VisibilityTimeout lên 12 giờ chỉ làm chậm quá trình xử lý lỗi.
- **B (Đúng):** Chính xác! Cấu hình SQS DLQ với maxReceiveCount = 3 giúp tự động cô lập poison-pill messages. Gắn CloudWatch Alarm trên ApproximateNumberOfMessagesVisible > 0 cảnh báo ngay lập tức, và tính năng native SQS DLQ Redrive cho phép đẩy tin nhắn ngược về source queue dễ dàng mà không cần viết script tùy chỉnh.
- **C:** Sai. SQS redrive policy chỉ cho phép đích đến là một SQS queue khác (cùng loại Standard/FIFO), không thể dùng SNS topic làm SQS DLQ.
- **D:** Sai. Phức tạp không cần thiết và vi phạm yêu cầu không tự viết script replay tùy chỉnh.

</details>

### Câu 3 `hard`

An e-commerce company uses Amazon EventBridge to route order lifecycle events from an Amazon DynamoDB Streams source to an AWS Step Functions state machine. Only MODIFY events where orderStatus transitions to 'SHIPPED' should trigger Step Functions, and each event must be enriched with customer tier metadata from an internal API before delivery—without writing glue polling code. Additionally, if a bug in Step Functions causes events to be misprocessed for 2 hours, the operations team must be able to replay those exact historical events once the fix is deployed. Which TWO EventBridge features should the team use? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Enable EventBridge Schema Registry with automatic schema discovery to replay failed AWS Step Functions workflow executions.
- **B.** Configure an EventBridge Pipe with DynamoDB Streams, an orderStatus=SHIPPED Filter, an API Enrichment step, and Step Functions target.
- **C.** Configure an EventBridge Scheduler cron expression to poll DynamoDB Streams shards every 1 minute for new order updates.
- **D.** Enable EventBridge Archive on the custom event bus so operations can run an EventBridge Replay for the 2-hour incident window.
- **E.** Use AWS CloudTrail Lake SQL queries to replay DynamoDB Streams application events directly back into AWS Step Functions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty thương mại điện tử sử dụng Amazon EventBridge để định tuyến các sự kiện vòng đời đơn hàng từ nguồn Amazon DynamoDB Streams tới một AWS Step Functions state machine. Chỉ các sự kiện MODIFY nơi orderStatus chuyển sang 'SHIPPED' mới được kích hoạt Step Functions, và mỗi sự kiện phải được làm giàu với siêu dữ liệu hạng khách hàng từ một API nội bộ trước khi phân phối—mà không cần viết mã polling kết nối. Ngoài ra, nếu một lỗi trong Step Functions khiến các sự kiện bị xử lý sai trong 2 giờ, nhóm vận hành phải có khả năng phát lại chính xác các sự kiện lịch sử đó sau khi bản sửa lỗi được triển khai. Nhóm nên sử dụng HAI tính năng nào của EventBridge? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Trong kiến trúc Event-Driven hiện đại trên AWS, EventBridge Pipes đảm nhận kết nối Source -> Filter -> Enrich -> Target không cần code glue, còn EventBridge Archive & Replay đảm bảo khả năng phục hồi và xử lý lại sự kiện lịch sử sau sự cố phần mềm.

- **A:** Sai. Schema Registry dùng để khám phá và quản lý cấu trúc (schema) của sự kiện, không có chức năng lưu trữ hay phát lại (replay) sự kiện lịch sử.
- **B (Đúng):** Chính xác! EventBridge Pipes kết nối điểm-tới-điểm trực tiếp từ DynamoDB Streams, hỗ trợ lọc sự kiện (Filtering) để tiết kiệm chi phí và làm giàu dữ liệu (Enrichment) trước khi gửi tới đích mà không cần tự viết code polling.
- **C:** Sai. EventBridge Scheduler dùng cho tác vụ chạy theo lịch thời gian, không dùng để poll DynamoDB Streams.
- **D (Đúng):** Chính xác! EventBridge Archive lưu trữ bản sao sự kiện trên event bus theo thời gian lưu giữ cấu hình sẵn, cho phép thực hiện EventBridge Replay chính xác khoảng thời gian 2 giờ bị sự cố sau khi đã vá lỗi.
- **E:** Sai. CloudTrail Lake lưu trữ lịch sử gọi API quản trị/dữ liệu AWS để kiểm toán, không dùng để replay luồng sự kiện ứng dụng từ DynamoDB Streams vào Step Functions.

</details>

### Câu 4 `medium`

An e-commerce platform captures order state changes via Amazon DynamoDB Streams. Currently, a custom AWS Lambda function polls the stream, filters for ORDER_CANCELLED events, calls an internal REST API to enrich each event with customer loyalty tier data, and publishes the enriched event to an Amazon EventBridge custom event bus. The team wants to eliminate custom polling, batching, and error-handling boilerplate code while preserving strict filtering and enrichment. Which AWS feature should replace the custom glue Lambda?

- **A.** Amazon EventBridge Scheduler configured with a rate(1 minute) expression to poll the DynamoDB table and invoke the loyalty API.
- **B.** Amazon SNS FIFO topic subscribed directly to DynamoDB Streams with a message filtering policy and HTTP endpoint enrichment.
- **C.** EventBridge Pipes with DynamoDB Stream source, ORDER_CANCELLED filter, API Destination enrichment, and custom EventBridge bus target.
- **D.** AWS Glue streaming ETL job running continuously on Apache Spark workers to filter DynamoDB Streams and call the loyalty API.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng thương mại điện tử ghi nhận các thay đổi trạng thái đơn hàng thông qua Amazon DynamoDB Streams. Hiện tại, một AWS Lambda function tùy chỉnh đang poll stream, lọc các sự kiện ORDER_CANCELLED, gọi một REST API nội bộ để làm giàu mỗi sự kiện với dữ liệu hạng khách hàng thân thiết và xuất bản sự kiện đã làm giàu lên một Amazon EventBridge custom event bus. Nhóm muốn loại bỏ mã mẫu (boilerplate) cho việc polling, batching và xử lý lỗi tùy chỉnh trong khi vẫn duy trì việc lọc nghiêm ngặt và làm giàu dữ liệu. Tính năng AWS nào nên thay thế cho Lambda kết nối tùy chỉnh này?

**Đáp án đúng:** **C**

Amazon EventBridge Pipes sinh ra để loại bỏ các glue Lambda polling/filtering/enrichment giữa các nguồn stream/queue (DynamoDB Streams, SQS, Kinesis) và đích đến, chỉ trả phí cho các sự kiện vượt qua bộ lọc.

- **A:** Sai. EventBridge Scheduler dùng để chạy tác vụ theo lịch (cron/rate/one-time), không phải để đọc DynamoDB Streams theo sự kiện thời gian thực.
- **B:** Sai. DynamoDB Streams không thể đẩy trực tiếp sang SNS mà không có tầng trung gian, và SNS không có bước enrichment gọi REST API.
- **C (Đúng):** Chính xác! Amazon EventBridge Pipes kết nối điểm-tới-điểm giữa nguồn sự kiện (DynamoDB Streams, SQS, Kinesis, MSK...) và đích đến (EventBridge Bus, Step Functions, SQS...), tích hợp sẵn 4 bước Source -> Filtering -> Enrichment -> Target, loại bỏ hoàn toàn code glue Lambda cho polling và batching.
- **D:** Sai. AWS Glue Spark dùng cho xử lý dữ liệu phân tích lớn, quá nặng, tốn kém và độ trễ cao cho bài toán event-driven routing.

</details>

### Câu 5 `medium`

A fintech company uses an Amazon EventBridge custom event bus to distribute payment settlement events to five downstream microservices. A bug deployed to the Accounting microservice caused it to silently drop and misprocess 4 hours of settlement events before the issue was detected and patched. The other four microservices processed the events correctly and must NOT receive duplicate events during recovery. How can the DevOps engineer design the EventBridge architecture to support targeted historical recovery for situations like this?

- **A.** Configure an Amazon SQS Dead-Letter Queue (DLQ) on the Accounting EventBridge rule to capture events that the microservice returned HTTP 200 for.
- **B.** Enable EventBridge Archive on the bus, and run an EventBridge Replay for the 4-hour window targeting ONLY the Accounting rule.
- **C.** Replay the entire Amazon CloudTrail management and data event log for the 4-hour window directly back into the custom EventBridge event bus.
- **D.** Increase the EventBridge target retry policy maximum event age to 24 hours and maximum retry attempts to 185 on all five microservice rules.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty fintech sử dụng Amazon EventBridge custom event bus để phân phối các sự kiện quyết toán thanh toán tới năm microservice phía sau. Một lỗi được triển khai lên microservice Kế toán đã khiến nó âm thầm bỏ sót và xử lý sai 4 giờ sự kiện quyết toán trước khi sự cố được phát hiện và vá lỗi. Bốn microservice còn lại đã xử lý đúng các sự kiện và KHÔNG ĐƯỢC nhận các sự kiện trùng lặp trong quá trình khôi phục. Kỹ sư DevOps có thể thiết kế kiến trúc EventBridge như thế nào để hỗ trợ khôi phục lịch sử có mục tiêu cho những tình huống như vậy?

**Đáp án đúng:** **B**

EventBridge Archives & Replay cho phép lưu trữ sự kiện lâu dài và phát lại có chọn lọc theo khung thời gian và theo từng Rule cụ thể, cực kỳ hữu ích khi cần phục hồi dữ liệu sau bug ứng dụng hoặc kiểm thử tính năng mới.

- **A:** Sai. DLQ chỉ nhận sự kiện khi quá trình delivery thất bại (lỗi mạng, lỗi 5xx/exception). Trong kịch bản này ứng dụng xử lý sai logic nhưng vẫn âm thầm nhận/nuốt sự kiện (silently drop) nên sự kiện không rơi vào DLQ.
- **B (Đúng):** Chính xác! EventBridge Archive lưu trữ bản sao sự kiện đi qua event bus. Khi cần khôi phục, EventBridge Replay cho phép phát lại chính xác trong khung thời gian 4 giờ và chỉ định đích đến cụ thể là Rule của Accounting microservice, không làm ảnh hưởng hay gây trùng lặp cho 4 service còn lại.
- **C:** Sai. CloudTrail không chứa payload của các custom business event trên EventBridge và không thể replay trực tiếp vào bus.
- **D:** Sai. Retry policy chỉ kích hoạt khi delivery lỗi, không giải quyết trường hợp consumer đã nhận sự kiện nhưng xử lý sai do bug.

</details>

### Câu 6 `medium`

A global SaaS platform needs to allow 500,000 customers to schedule individualized one-time and recurring report generation jobs in their own local time zones (automatically handling Daylight Saving Time transitions). To prevent database overload when thousands of customers schedule reports at the exact top of the hour (e.g., 08:00 AM), execution start times should be automatically jittered within a 15-minute window, and each schedule should directly invoke an AWS Step Functions state machine with built-in retry and SQS DLQ support. Which AWS service is purpose-built for this scale?

- **A.** Amazon EventBridge scheduled rules on the default event bus—creating one dedicated scheduled rule per customer.
- **B.** An Amazon RDS PostgreSQL schedule table polled every second by a fleet of EC2 cron daemon worker instances.
- **C.** EventBridge Scheduler with time-zone-aware cron/at expressions, 15-min Flexible Time Windows, and Step Functions target with retry/DLQ.
- **D.** AWS Systems Manager Maintenance Windows dynamically provisioned via CloudFormation for each SaaS customer schedule.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng SaaS toàn cầu cần cho phép 500.000 khách hàng lên lịch các công việc tạo báo cáo một lần và định kỳ được cá nhân hóa theo múi giờ địa phương của riêng họ (tự động xử lý chuyển đổi Giờ Tiết kiệm Ánh sáng ban ngày - Daylight Saving Time). Để ngăn quá tải cơ sở dữ liệu khi hàng nghìn khách hàng lên lịch báo cáo vào đúng đầu giờ (ví dụ: 08:00 sáng), thời gian bắt đầu thực thi phải được tự động rải ngẫu nhiên (jitter) trong khung 15 phút, và mỗi lịch trình phải gọi trực tiếp một AWS Step Functions state machine với hỗ trợ thử lại tích hợp và SQS DLQ. Dịch vụ AWS nào được thiết kế chuyên biệt cho quy mô này?

**Đáp án đúng:** **C**

Amazon EventBridge Scheduler vượt trội hoàn toàn so với EventBridge scheduled rules cũ khi cần hàng triệu lịch chạy (one-time/recurring), hỗ trợ timezone/DST, Flexible Time Windows chống thundering herd và gọi trực tiếp Universal Targets.

- **A:** Sai. EventBridge Rules bị giới hạn chỉ 300 rule mặc định mỗi event bus (không thể lên tới 500.000 lịch), chỉ chạy theo UTC (không hỗ trợ múi giờ/DST) và không có Flexible Time Windows.
- **B:** Sai. Tự xây hệ thống scheduler bằng polling DB tốn công vận hành, dễ gặp single point of failure và bottleneck ở quy mô 500.000 lịch.
- **C (Đúng):** Chính xác! Amazon EventBridge Scheduler hỗ trợ hàng triệu lịch chạy (one-time và recurring), tự động xử lý múi giờ và Daylight Saving Time (DST), có tính năng Flexible Time Windows (ví dụ 15 phút) để phân tán tải chống thundering herd, và gọi trực tiếp hơn 270 dịch vụ AWS kèm retry/DLQ.
- **D:** Sai. SSM Maintenance Windows dành cho bảo trì hạ tầng EC2/SSM, không thiết kế cho 500.000 lịch ứng dụng của khách hàng SaaS.

</details>

### Câu 7 `medium`

An on-call SRE team suffers from severe alarm fatigue: whenever an Amazon RDS primary instance undergoes a brief planned failover or high-load event, 15 separate Amazon CloudWatch alarms (CPU, memory, ALB latency, 5XX errors, Lambda timeouts) fire simultaneously, flooding PagerDuty with redundant pages. Furthermore, during weekly database maintenance windows, the team wants to suppress incident notifications automatically without disabling the underlying metric alarms. How should the DevOps engineer redesign the alerting layer?

- **A.** Create CloudWatch Composite Alarms combining child alarms with Boolean logic (AND/OR), and configure Actions Suppression for maintenance.
- **B.** Delete 14 of the 15 CloudWatch metric alarms across the stack and retain only the primary Application Load Balancer HTTP 5XX alarm.
- **C.** Disable all CloudWatch alarm actions manually via the AWS Console before every maintenance window and re-enable them afterward.
- **D.** Set the CloudWatch alarm MissingDataTreatment parameter to ignore across all 15 individual metric alarms during deployment windows.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm SRE trực sự cố đang chịu tình trạng quá tải cảnh báo nghiêm trọng: mỗi khi một Amazon RDS primary instance trải qua một lần failover theo kế hoạch ngắn hoặc sự kiện tải cao, 15 Amazon CloudWatch alarm riêng biệt (CPU, bộ nhớ, độ trễ ALB, lỗi 5XX, timeout Lambda) đều kích hoạt cùng lúc, làm tràn ngập PagerDuty bằng các thông báo trùng lặp. Hơn nữa, trong các khung giờ bảo trì cơ sở dữ liệu hàng tuần, nhóm muốn tự động tạm tắt thông báo sự cố mà không vô hiệu hóa các metric alarm bên dưới. Kỹ sư DevOps nên thiết kế lại tầng cảnh báo như thế nào?

**Đáp án đúng:** **A**

Amazon CloudWatch Composite Alarms giảm thiểu alarm fatigue bằng cách kết hợp nhiều alarm con theo logic AND/OR thành một cảnh báo tổng hợp duy nhất và hỗ trợ Actions Suppressor để tự động ẩn thông báo trong giờ bảo trì hoặc khi tài nguyên cha đang bảo trì.

- **A (Đúng):** Chính xác! CloudWatch Composite Alarms gom nhiều alarm con bằng biểu thức logic (AND/OR) để phát ra một cảnh báo duy nhất (chống alarm storm), đồng thời hỗ trợ tính năng Actions Suppressor tự động tạm ngưng gửi thông báo trong khung bảo trì mà vẫn giữ nguyên trạng thái giám sát của các alarm con.
- **B:** Sai. Xóa các alarm tài nguyên làm mất khả năng theo dõi chi tiết nguyên nhân gốc rễ (như CPU/Memory/RDS).
- **C:** Sai. Thao tác thủ công dễ quên bật lại sau bảo trì (gây mù giám sát) và không giải quyết tình trạng alarm storm khi có sự cố thật.
- **D:** Sai. MissingDataTreatment chỉ quy định cách xử lý khi thiếu điểm dữ liệu, không gộp cảnh báo hay ngăn alarm storm.

</details>

### Câu 8 `medium`

An order fulfillment microservice consumes messages from an Amazon SQS standard queue using AWS Lambda. A downstream shipping partner API experienced a 2-hour outage, causing hundreds of order messages to fail processing repeatedly and pile up in the queue's Dead-Letter Queue (DLQ). Now that the shipping partner API has recovered, the operations team needs to safely reprocess all failed messages in the DLQ without writing custom migration scripts, AND ensure the team is immediately alerted in the future whenever even a single message lands in the DLQ. Which TWO actions should the DevOps engineer take? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Configure an SQS queue resource policy that automatically routes DLQ messages directly back to the source queue every 10 seconds.
- **B.** Use native SQS DLQ Redrive (StartMessageMoveTask) to move messages back to the source queue with maxNumberOfMessagesPerSecond rate limiting.
- **C.** Purge the Dead-Letter Queue via the SQS console to force the upstream source queue to regenerate the lost order messages.
- **D.** Create a CloudWatch alarm on the DLQ ApproximateNumberOfMessagesVisible > 0 metric linked to an SNS topic or Incident Manager plan.
- **E.** Set maxReceiveCount on the source SQS queue redrive policy to 1000 so failed order messages never enter the Dead-Letter Queue.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một microservice hoàn tất đơn hàng tiêu thụ message từ một Amazon SQS standard queue bằng AWS Lambda. Một API đối tác vận chuyển phía sau gặp sự cố gián đoạn 2 giờ, khiến hàng trăm message đơn hàng thất bại liên tục khi xử lý và dồn ứ vào Dead-Letter Queue (DLQ) của queue đó. Hiện tại API đối tác vận chuyển đã phục hồi, nhóm vận hành cần xử lý lại an toàn tất cả các message thất bại trong DLQ mà không cần viết script di chuyển tùy chỉnh, VÀ đảm bảo nhóm được cảnh báo ngay lập tức trong tương lai bất cứ khi nào có dù chỉ một message rơi vào DLQ. Kỹ sư DevOps nên thực hiện HAI hành động nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Vận hành SQS DLQ chuẩn production gồm: thiết lập maxReceiveCount hợp lý (thường 3–5), gắn CloudWatch Alarm trên ApproximateNumberOfMessagesVisible > 0 của DLQ để phát hiện sớm, và dùng tính năng SQS DLQ Redrive (có rate limit) để khôi phục tin nhắn sau khi sự cố đã khắc phục.

- **A:** Sai. SQS queue policy chỉ kiểm soát quyền truy cập IAM, không có chức năng tự động đẩy ngược message, và đẩy ngược liên tục mỗi 10 giây sẽ gây vòng lặp vô hạn.
- **B (Đúng):** Chính xác! Amazon SQS DLQ Redrive (StartMessageMoveTask) cho phép đẩy lại tin nhắn từ DLQ về source queue (hoặc đích chỉ định) hoàn toàn không cần viết script, lại có thể đặt giới hạn tốc độ (maxNumberOfMessagesPerSecond) để tránh làm quá tải API đối tác vừa phục hồi.
- **C:** Sai. Purge sẽ xóa vĩnh viễn toàn bộ đơn hàng lỗi trong DLQ gây mất dữ liệu nghiêm trọng.
- **D (Đúng):** Chính xác! Đặt CloudWatch Alarm trên metric ApproximateNumberOfMessagesVisible > 0 của DLQ giúp phát hiện và cảnh báo ngay lập tức khi có bất kỳ message lỗi nào rơi vào DLQ.
- **E:** Sai. Đặt maxReceiveCount quá cao khiến poison-pill message bị xử lý lặp đi lặp lại hàng nghìn lần, tốn chi phí Lambda và trì hoãn việc phát hiện sự cố.

</details>

### Câu 9 `medium`

A DevOps team uses ServiceNow as its enterprise ITSM platform. Whenever an Amazon CloudWatch alarm or AWS GuardDuty high-severity finding occurs, the team wants to send an authenticated HTTP POST webhook (using OAuth 2.0 client credentials) to the ServiceNow REST API with a custom JSON body format expected by ServiceNow, rate-limited to at most 20 requests per second so ServiceNow is not overwhelmed during an incident storm—WITHOUT writing or maintaining any AWS Lambda proxy functions. How should the engineer implement this?

- **A.** Subscribe the ServiceNow HTTPS endpoint directly to an Amazon SNS topic and configure OAuth 2.0 token refresh in SNS.
- **B.** Deploy a custom AWS Fargate microservice that continuously polls Amazon SQS and forwards OAuth requests to ServiceNow.
- **C.** Match events with an EventBridge Rule + Input Transformer, targeting an EventBridge API Destination (OAuth Connection, 20 req/s).
- **D.** Use Amazon API Gateway HTTP Proxy integration triggered directly by GuardDuty findings and CloudWatch metric alarms.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm DevOps sử dụng ServiceNow làm nền tảng ITSM doanh nghiệp. Bất cứ khi nào xảy ra một Amazon CloudWatch alarm hoặc một finding mức độ nghiêm trọng cao của AWS GuardDuty, nhóm muốn gửi một HTTP POST webhook được xác thực (sử dụng OAuth 2.0 client credentials) tới ServiceNow REST API với định dạng nội dung JSON tùy chỉnh theo yêu cầu của ServiceNow, được giới hạn tốc độ ở mức tối đa 20 request mỗi giây để ServiceNow không bị quá tải trong một cơn bão sự cố—MÀ KHÔNG cần viết hay bảo trì bất kỳ AWS Lambda proxy function nào. Kỹ sư nên triển khai việc này như thế nào?

**Đáp án đúng:** **C**

Amazon EventBridge API Destinations + Connections (OAuth/Basic/API Key) + Input Transformer là mẫu tích hợp outbound webhook chuẩn không cần code (codeless) để kết nối sự kiện AWS tới các nền tảng SaaS bên thứ ba kèm rate limit và retry.

- **A:** Sai. SNS HTTPS subscription không hỗ trợ OAuth 2.0 client credentials token exchange, không hỗ trợ Input Transformer định dạng lại JSON theo schema ServiceNow và yêu cầu endpoint phải xử lý handshake ConfirmSubscription của SNS.
- **B:** Sai. Tự viết và duy trì microservice trên Fargate tốn nhiều công vận hành hơn so với EventBridge API Destinations quản lý hoàn toàn.
- **C (Đúng):** Chính xác! EventBridge API Destinations cho phép gọi trực tiếp REST API bên ngoài (ServiceNow, PagerDuty, Jira, Datadog...) với xác thực OAuth/API Key lưu an toàn trong Secrets Manager và hỗ trợ rate limiting (ví dụ 20 req/s), kết hợp EventBridge Input Transformer để biến đổi JSON payload mà hoàn toàn không cần viết Lambda proxy.
- **D:** Sai. GuardDuty không gọi trực tiếp API Gateway và API Gateway dùng để nhận inbound request chứ không phải outbound event delivery với OAuth connection.

</details>

### Câu 10 `hard`

Amazon GuardDuty generates a High-severity finding (CryptoCurrency:EC2/BitcoinTool.B!DNS) indicating that an Amazon EC2 instance inside an Auto Scaling group (ASG) is compromised. The security operations team wants an automated EventBridge + AWS Step Functions incident response workflow that immediately contains the threat, preserves volatile/disk forensic evidence for investigation, and maintains application capacity without allowing the ASG to terminate the compromised instance before forensics completes. Which TWO actions MUST the automated workflow perform? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Immediately call ec2:TerminateInstances on the compromised EC2 instance via Lambda before taking any EBS volume snapshots.
- **B.** Detach the compromised instance from the Auto Scaling group with ShouldDecrementDesiredCapacity set to true so no replacement instance is launched.
- **C.** Replace Security Groups with an empty isolation SG and revoke active IAM instance profile sessions to contain lateral movement.
- **D.** Modify the VPC Network ACL to deny all inbound and outbound traffic for the entire subnet where the compromised instance resides.
- **E.** Detach from ASG with ShouldDecrementDesiredCapacity=false (launching a clean replacement) and create encrypted EBS snapshots for forensics.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Amazon GuardDuty tạo ra một finding mức độ nghiêm trọng cao (CryptoCurrency:EC2/BitcoinTool.B!DNS) cho biết một Amazon EC2 instance bên trong Auto Scaling group (ASG) đã bị xâm phạm. Nhóm vận hành bảo mật muốn một quy trình ứng phó sự cố tự động bằng EventBridge + AWS Step Functions để cô lập ngay lập tức mối đe dọa, bảo toàn bằng chứng điều tra số (forensic) trên đĩa/bộ nhớ phục vụ điều tra và duy trì công suất ứng dụng mà không cho phép ASG terminate instance bị xâm phạm trước khi quá trình điều tra số hoàn tất. Quy trình tự động hóa PHẢI thực hiện HAI hành động nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Quy trình tự động ứng cứu sự cố EC2 bị xâm nhập chuẩn AWS: (1) Cô lập bằng Isolation Security Group (không chặn cả subnet bằng NACL) và thu hồi phiên IAM, (2) Detach khỏi ASG với ShouldDecrementDesiredCapacity=false để giữ dung lượng và không bị ASG terminate, (3) Chụp EBS snapshot / thu thập memory để điều tra forensic.

- **A:** Sai. Terminate ngay lập tức sẽ xóa sạch bộ nhớ RAM và các EBS volume có DeleteOnTermination=true, phá hủy toàn bộ bằng chứng điều tra forensic.
- **B:** Sai. Đặt ShouldDecrementDesiredCapacity=true sẽ giảm dung lượng mong muốn của ASG và không tạo instance thay thế, vi phạm yêu cầu duy trì application capacity.
- **C (Đúng):** Chính xác! Bước cô lập (containment) chuẩn là thay thế Security Group bằng một Isolation SG (chặn hoàn toàn ingress/egress để cắt đứt C2/lateral movement) và thu hồi phiên IAM credential đang hoạt động.
- **D:** Sai. Chặn toàn bộ subnet bằng NACL sẽ làm sập luôn tất cả các EC2 instance sạch khác đang nằm cùng subnet đó.
- **E (Đúng):** Chính xác! Gọi autoscaling:DetachInstances với ShouldDecrementDesiredCapacity=false giúp ASG tự động khởi chạy một instance sạch thay thế để đảm bảo dung lượng ứng dụng, đồng thời giữ nguyên instance bị xâm nhập (không terminate mất bằng chứng bộ nhớ/đĩa) và chụp EBS snapshot để điều tra forensic.

</details>

### Câu 11 `medium`

An operations team receives dozens of redundant PagerDuty pages whenever an RDS database experiences high load because separate CloudWatch Alarms for API latency, HTTP 5xx errors, EC2 CPU, and RDS CPU all fire simultaneously. They want to receive a single actionable alert only when BOTH API 5xx errors exceed 2% AND RDS CPU exceeds 85%, while suppressing alerts during scheduled maintenance windows. What is the BEST solution?

- **A.** Increase the evaluation periods and datapoints-to-alarm thresholds of all four individual CloudWatch alarms to 60 minutes so they fire less frequently.
- **B.** Configure an Amazon SNS FIFO topic with content-based message deduplication enabled to automatically merge the four individual CloudWatch alarms.
- **C.** Remove individual alarm actions, create a CloudWatch Composite Alarm combining them with AND, and attach an ActionsSuppressor for maintenance.
- **D.** Replace all four CloudWatch Metric Alarms with AWS CloudTrail Insights to automatically correlate RDS CPU spikes and application HTTP 5xx errors.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm vận hành nhận được hàng chục cảnh báo PagerDuty trùng lặp mỗi khi cơ sở dữ liệu RDS bị tải cao vì các CloudWatch Alarm riêng biệt cho độ trễ API, lỗi HTTP 5xx, CPU EC2 và CPU RDS đều kích hoạt cùng lúc. Họ muốn chỉ nhận một cảnh báo duy nhất có thể hành động được khi CẢ lỗi API 5xx vượt quá 2% VÀ CPU RDS vượt quá 85%, đồng thời tạm tắt cảnh báo trong các khung giờ bảo trì định kỳ. Giải pháp TỐT NHẤT là gì?

**Đáp án đúng:** **C**

CloudWatch Composite Alarms là công cụ chuyên dụng giảm nhiễu cảnh báo (Alarm Storm / Alert Fatigue), cho phép kết hợp nhiều điều kiện logic và cấu hình ActionsSuppressor khi bảo trì.

- **A:** Sai. Tăng chu kỳ đánh giá lên 60 phút làm chậm khả năng phát hiện sự cố nghiêm trọng và vẫn bắn nhiều cảnh báo trùng lặp.
- **B:** Sai. SNS FIFO deduplication chỉ lọc các thông điệp giống hệt nhau, không thực hiện được phép toán logic AND giữa các metric khác nhau.
- **C (Đúng):** Chính xác! CloudWatch Composite Alarms kết hợp nhiều alarm con bằng toán tử logic (AND/OR/NOT) để chống Alarm Storm (Alert Fatigue), và hỗ trợ ActionsSuppressor để tạm tắt thông báo trong khung bảo trì.
- **D:** Sai. CloudTrail Insights chỉ phát hiện bất thường về lưu lượng gọi API quản trị AWS, không giám sát metric hiệu năng ứng dụng hay RDS CPU.

</details>

### Câu 12 `medium`

A critical payment microservice uses an Amazon SQS queue consumed by an AWS Lambda function. After a faulty code deployment, malformed messages caused repeated processing failures and were moved to an SQS Dead-Letter Queue (DLQ). The team has now deployed a bug fix. What is the MOST operational-efficient way to reprocess the failed messages and be alerted immediately if any future messages land in the DLQ?

- **A.** Write a custom EC2 Python script to poll messages from the DLQ and call SendMessage to the source queue, and check the DLQ manually every morning.
- **B.** Use Amazon SQS DLQ Redrive to move messages back to the source queue, and set a CloudWatch Alarm on ApproximateNumberOfMessagesVisible (> 0).
- **C.** Delete the DLQ and subscribe the Lambda function directly to an Amazon SNS Standard topic so failed payment messages are retried indefinitely.
- **D.** Increase the source SQS queue VisibilityTimeout to 12 hours and maxReceiveCount to 1000 so poison-pill messages never reach the DLQ.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một microservice thanh toán quan trọng sử dụng Amazon SQS queue được xử lý bởi một AWS Lambda function. Sau một lần triển khai mã bị lỗi, các message sai định dạng gây ra lỗi xử lý lặp đi lặp lại và bị chuyển sang SQS Dead-Letter Queue (DLQ). Nhóm hiện đã triển khai bản sửa lỗi. Cách hiệu quả về mặt vận hành NHẤT để xử lý lại các message bị lỗi và được cảnh báo ngay lập tức nếu có bất kỳ message nào trong tương lai rơi vào DLQ là gì?

**Đáp án đúng:** **B**

SQS DLQ Redrive cho phép khôi phục và xử lý lại message lỗi chỉ với một thao tác (hoặc API `StartMessageMoveTask`), kết hợp CloudWatch Alarm trên `ApproximateNumberOfMessagesVisible` để giám sát liên tục.

- **A:** Sai. Tự viết script và kiểm tra thủ công tốn công vận hành và không cảnh báo tức thời khi có sự cố mới.
- **B (Đúng):** Chính xác! Amazon SQS hỗ trợ tính năng DLQ Redrive tích hợp sẵn để đẩy ngược message từ DLQ về Source Queue mà không cần viết code, đồng thời gắn CloudWatch Alarm trên ApproximateNumberOfMessagesVisible > 0 giúp phát hiện ngay lập tức khi có message lỗi.
- **C:** Sai. Xóa DLQ sẽ làm mất toàn bộ giao dịch thanh toán đang chờ xử lý lại và không phải giải pháp an toàn.
- **D:** Sai. Tăng VisibilityTimeout chỉ trì hoãn việc retry chứ không xử lý lại được các message đã nằm trong DLQ.

</details>

---

[Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md)
