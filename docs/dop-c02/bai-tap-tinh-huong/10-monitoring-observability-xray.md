# Bài tập tình huống — Cross-Account Observability (OAM), AWS X-Ray & ADOT

> CloudWatch Cross-Account Observability (OAM), AWS X-Ray Tracing, Service Map, Sampling Rules, AWS Distro for OpenTelemetry (ADOT) và Container Insights.
> **Số câu hỏi:** 7 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

An SRE team operates 60 AWS accounts within AWS Organizations and needs a centralized view of Amazon CloudWatch metrics, CloudWatch Logs, and AWS X-Ray traces across all workload accounts without duplicating log data into a central S3 bucket or incurring cross-account data ingestion fees. Onboarding new accounts must be automated via Infrastructure as Code. What is the MOST cost-effective and operationally efficient solution?

- **A.** Configure CloudWatch Cross-Account Observability (OAM) with a Sink in a central Monitoring account, and deploy OAM Links via CloudFormation StackSets.
- **B.** Create a CloudWatch Logs Subscription Filter in every source account to stream all logs to an Amazon Data Firehose delivery stream in the Monitoring account.
- **C.** Deploy Prometheus and Jaeger clusters in each of the 60 source accounts and federate them into a central Amazon Managed Grafana workspace.
- **D.** Share individual Amazon CloudWatch dashboards from each of the 60 source accounts using public shareable dashboard links and IAM federation.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm SRE vận hành 60 tài khoản AWS trong AWS Organizations và cần một chế độ xem tập trung cho Amazon CloudWatch metric, CloudWatch Logs và AWS X-Ray trace trên tất cả các tài khoản workload mà không cần nhân bản dữ liệu log vào một S3 bucket tập trung hoặc phát sinh phí nhập dữ liệu (ingestion fee) cross-account. Việc tích hợp các tài khoản mới phải được tự động hóa qua Infrastructure as Code. Giải pháp TIẾT KIỆM CHI PHÍ NHẤT và hiệu quả về mặt vận hành nhất là gì?

**Đáp án đúng:** **A**

Amazon CloudWatch Cross-Account Observability (OAM) là dịch vụ native giúp tập trung hóa khả năng quan sát (Metrics, Logs, X-Ray Traces, Application Insights) xuyên suốt nhiều tài khoản AWS mà không cần sao chép dữ liệu, kết hợp hoàn hảo với CloudFormation StackSets.

- **A (Đúng):** Chính xác! CloudWatch Cross-Account Observability (OAM) cho phép Monitoring Account truy vấn trực tiếp metrics, logs và X-Ray traces từ các Source Account mà không cần sao chép dữ liệu và không phát sinh thêm phí ingestion. Triển khai OAM Link qua StackSets giúp tự động hóa cho mọi tài khoản mới.
- **B:** Sai. Cách này nhân đôi dữ liệu log, phát sinh chi phí truyền tải/lưu trữ lớn và không giải quyết việc gom metrics hay X-Ray traces.
- **C:** Sai. Tốn rất nhiều công sức vận hành và chi phí hạ tầng so với giải pháp native CloudWatch OAM.
- **D:** Sai. Chia sẻ dashboard công khai không an toàn, không cho phép truy vấn chéo tài khoản thống nhất và không tự động hóa tốt.

</details>

### Câu 2 `hard`

A high-traffic microservices platform running on Amazon ECS with AWS Fargate experiences intermittent tail-latency spikes across 15 services. The team has instrumented their application code with the AWS X-Ray SDK, but no traces appear in the X-Ray console. Furthermore, once traces are flowing, the team wants to keep tracing costs low by sampling only 5% of normal requests while capturing 100% of requests to the /checkout endpoint. Which TWO actions must the team take? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Enable AWS X-Ray Active Tracing directly on the Amazon ECS cluster settings in the AWS Management Console for automatic Fargate trace collection.
- **B.** Grant the ECS Task Execution Role xray:PutTraceSegments and xray:PutTelemetryRecords permissions so the Fargate agent can upload traces.
- **C.** Add the X-Ray daemon or ADOT collector as a sidecar container in each ECS Fargate task definition and grant X-Ray permissions to the ECS task role.
- **D.** Configure the Application Load Balancer to sample 5% of incoming HTTP headers and drop X-Amzn-Trace-Id headers on all other non-checkout requests.
- **E.** Configure centralized X-Ray sampling rules with a higher-priority rule for URLPath /checkout at 100% and a default fallback rule at 5%.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng microservice lưu lượng cao chạy trên Amazon ECS với AWS Fargate gặp phải các đợt tăng đột biến độ trễ đuôi (tail-latency) ngắt quãng trên 15 service. Nhóm đã tích hợp AWS X-Ray SDK vào mã ứng dụng nhưng không có trace nào xuất hiện trong bảng điều khiển X-Ray. Hơn nữa, khi trace đã được gửi về, nhóm muốn giữ chi phí tracing ở mức thấp bằng cách chỉ lấy mẫu 5% các request thông thường trong khi thu thập 100% các request tới endpoint /checkout. Nhóm phải thực hiện HAI hành động nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Khi triển khai AWS X-Ray trên ECS Fargate, cần hai thành phần cốt lõi: (1) chạy X-Ray daemon/ADOT collector làm sidecar container kèm quyền trên ECS Task Role (không phải Task Execution Role), và (2) dùng Centralized Sampling Rules để kiểm soát chi phí theo đường dẫn URL quan trọng.

- **A:** Sai. Amazon ECS không có nút bật 'Active Tracing' tự động thu thập trace như AWS Lambda hay API Gateway; cần chạy daemon/collector sidecar.
- **B:** Sai. Task Execution Role dùng cho ECS agent kéo image/ghi log lúc khởi động; quyền gọi X-Ray API từ container sidecar phải gắn vào Task Role.
- **C (Đúng):** Chính xác! X-Ray SDK chỉ gửi UDP segment cục bộ tới X-Ray daemon (cổng 2000). Trên ECS Fargate, phải chạy X-Ray daemon (hoặc ADOT collector) dạng sidecar container trong cùng Task Definition và cấp quyền IAM trên Task Role.
- **D:** Sai. ALB luôn tự động thêm header X-Amzn-Trace-Id nhưng không kiểm soát tỷ lệ lấy mẫu chi tiết theo URL path như X-Ray Sampling Rules.
- **E (Đúng):** Chính xác! Centralized X-Ray Sampling Rules cho phép định nghĩa tỷ lệ lấy mẫu theo độ ưu tiên (priority): rule ưu tiên cao bắt 100% endpoint /checkout và rule mặc định lấy mẫu 5% các request còn lại để tối ưu chi phí.

</details>

### Câu 3 `medium`

A large organization operates 80 AWS accounts within AWS Organizations. The central SRE team needs a single monitoring account where engineers can search CloudWatch Logs, view CloudWatch Metrics, query AWS X-Ray distributed traces, and build unified CloudWatch Dashboards across all 80 source accounts in near real time without duplicating log data into a central S3 bucket or managing custom cross-account ingestion pipelines. Which AWS capability provides this natively?

- **A.** Configure CloudWatch Logs Subscription Filters in all 80 accounts to stream logs via Amazon Data Firehose into an Amazon S3 bucket in the monitoring account.
- **B.** Enable an AWS CloudTrail Organization Trail across all 80 accounts and view unified application metrics and X-Ray traces in the CloudTrail console.
- **C.** Configure CloudWatch Cross-Account Observability (OAM) with a monitoring sink and deploy source links via CloudFormation StackSets.
- **D.** Create IAM cross-account roles in all 80 member accounts and require SREs to manually switch roles in the AWS Console for each account.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức lớn vận hành 80 tài khoản AWS trong AWS Organizations. Nhóm SRE trung tâm cần một tài khoản giám sát duy nhất nơi các kỹ sư có thể tìm kiếm CloudWatch Logs, xem CloudWatch Metrics, truy vấn AWS X-Ray distributed trace và xây dựng CloudWatch Dashboards hợp nhất trên tất cả 80 tài khoản nguồn theo thời gian gần thực mà không cần nhân bản dữ liệu log vào S3 bucket tập trung hoặc quản lý các pipeline nhập dữ liệu cross-account tùy chỉnh. Khả năng AWS nào cung cấp điều này một cách nguyên bản?

**Đáp án đúng:** **C**

Amazon CloudWatch Cross-Account Observability (OAM) sử dụng mô hình Sink (tại Monitoring account) và Link (tại Source accounts, dễ dàng triển khai bằng StackSets) để giám sát tập trung Metrics, Logs và X-Ray Traces xuyên suốt AWS Organizations mà không cần nhân bản dữ liệu.

- **A:** Sai. Cách này nhân bản dữ liệu log vào S3 (tốn chi phí lưu trữ và ingestion), không hỗ trợ xem CloudWatch Metrics và X-Ray traces hợp nhất trên CloudWatch Console.
- **B:** Sai. CloudTrail chỉ ghi lại nhật ký audit API AWS, không thu thập application logs, CloudWatch Metrics hay X-Ray traces.
- **C (Đúng):** Chính xác! CloudWatch Cross-Account Observability (dựa trên OAM Sink và Link) cho phép tài khoản Monitoring truy vấn trực tiếp Metrics, Logs, X-Ray Traces, và Application Insights từ các Source Account theo thời gian thực mà không cần sao chép/nhân bản dữ liệu log hay dựng pipeline Kinesis.
- **D:** Sai. Chuyển role thủ công qua 80 tài khoản không tạo được dashboard hợp nhất hay tìm kiếm log xuyên tài khoản.

</details>

### Câu 4 `hard`

A company is migrating microservices written in Go and Java to Amazon ECS on AWS Fargate. Leadership mandates using vendor-neutral OpenTelemetry instrumentation in application code so teams are not locked into proprietary SDKs. However, operations wants distributed traces stored in AWS X-Ray and Prometheus-format application metrics stored in Amazon Managed Service for Prometheus (AMP) with dashboards in Amazon Managed Grafana. Which TWO steps should the DevOps engineer take? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Install the proprietary AWS X-Ray daemon and CloudWatch Agent directly onto the underlying ECS Fargate host operating system via SSH.
- **B.** Instrument Go and Java apps with OpenTelemetry SDKs exporting OTLP traces and metrics to localhost.
- **C.** Replace OpenTelemetry with the legacy AWS X-Ray SDK in Go and Java so metrics can be scraped directly by Amazon Managed Service for Prometheus.
- **D.** Deploy the ADOT Collector sidecar in each Fargate task with OTLP receiver, awsxray exporter, and prometheusremotewrite (SigV4) for AMP.
- **E.** Configure Amazon ECS to write OTLP traces directly to an Amazon S3 bucket for Amazon Managed Grafana to query via Athena.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty đang di chuyển các microservice viết bằng Go và Java lên Amazon ECS trên AWS Fargate. Lãnh đạo yêu cầu sử dụng công cụ đo lường OpenTelemetry trung lập với nhà cung cấp trong mã ứng dụng để các nhóm không bị phụ thuộc vào các SDK độc quyền. Tuy nhiên, bộ phận vận hành muốn distributed trace được lưu trong AWS X-Ray và các metric ứng dụng định dạng Prometheus được lưu trong Amazon Managed Service for Prometheus (AMP) cùng với dashboard trong Amazon Managed Grafana. Kỹ sư DevOps nên thực hiện HAI bước nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Kiến trúc chuẩn OpenTelemetry trên ECS Fargate là instrument ứng dụng bằng OTel SDK (vendor-neutral) đẩy OTLP tới ADOT Collector sidecar; ADOT sẽ chuyển tiếp traces sang AWS X-Ray và metrics sang Amazon Managed Service for Prometheus (AMP) bằng SigV4.

- **A:** Sai. AWS Fargate là serverless compute, người dùng không có quyền SSH hay cài đặt phần mềm lên host OS bên dưới.
- **B (Đúng):** Chính xác! Sử dụng OpenTelemetry SDK chuẩn mở giúp ứng dụng không bị khóa vào vendor (vendor-neutral) và đẩy dữ liệu telemetry qua giao thức chuẩn OTLP tới collector chạy cùng task (localhost).
- **C:** Sai. Vi phạm yêu cầu dùng OpenTelemetry chuẩn mở (vendor-neutral) và X-Ray SDK cũng không xuất Prometheus metrics cho AMP.
- **D (Đúng):** Chính xác! ADOT Collector chạy dạng sidecar trong ECS Fargate task nhận dữ liệu OTLP từ app container, sau đó định tuyến traces sang AWS X-Ray (awsxray exporter) và metrics sang Amazon Managed Service for Prometheus (prometheusremotewrite + SigV4 extension).
- **E:** Sai. ECS không tự xuất OTLP traces ra S3 và không đáp ứng yêu cầu lưu traces ở AWS X-Ray và metrics ở AMP.

</details>

### Câu 5 `hard`

A high-volume microservices application is instrumented with AWS X-Ray. Currently, X-Ray tracing costs are high because the /healthcheck endpoint generates millions of unneeded traces, while during brief error spikes on the /api/v1/checkout endpoint, many important traces are missed due to the default sampling rate. Additionally, engineers want to search and filter traces in the X-Ray console by customerTier (for example, Enterprise) and create a dedicated Service Map view for slow checkout requests (> 2 seconds). Which TWO X-Ray configurations should the team implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Configure centralized X-Ray Sampling Rules setting fixed_rate=0 for /healthcheck and a higher rate for /api/v1/checkout.
- **B.** Store customerTier in AWS X-Ray Metadata instead of Annotations so it is automatically indexed for fast trace filter expressions.
- **C.** Record customerTier as an X-Ray Annotation and create an X-Ray Group filtering response_time > 2 for a dedicated Service Map.
- **D.** Disable the X-Ray daemon on EC2 instances and write raw JSON trace segments directly to an Amazon S3 bucket.
- **E.** Enable 100% sampling globally across all endpoints and delete /healthcheck traces nightly using an AWS Lambda function.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng microservice lưu lượng lớn được tích hợp AWS X-Ray. Hiện tại, chi phí tracing X-Ray đang cao vì endpoint /healthcheck tạo ra hàng triệu trace không cần thiết, trong khi trong các đợt tăng đột biến lỗi ngắn trên endpoint /api/v1/checkout, nhiều trace quan trọng bị bỏ sót do tỷ lệ lấy mẫu mặc định. Ngoài ra, các kỹ sư muốn tìm kiếm và lọc trace trong bảng điều khiển X-Ray theo customerTier (ví dụ: Enterprise) và tạo một chế độ xem Service Map riêng cho các request thanh toán chậm (> 2 giây). Nhóm nên triển khai HAI cấu hình X-Ray nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, C**

Tối ưu AWS X-Ray ở quy mô production gồm: (1) Centralized Sampling Rules (bỏ qua /healthcheck, tăng mẫu cho /checkout), (2) Dùng Annotations (indexed) cho các trường cần tìm kiếm/lọc và Metadata (unindexed) cho dữ liệu debug phụ, (3) Dùng X-Ray Groups để tách Service Map và tạo metric theo điều kiện lọc.

- **A (Đúng):** Chính xác! Centralized X-Ray Sampling Rules cho phép tinh chỉnh tỷ lệ lấy mẫu theo từng URL path mà không cần deploy lại code: đặt 0% cho /healthcheck để cắt giảm chi phí và đặt tỷ lệ cao (tới 100%) cho đường dẫn quan trọng /api/v1/checkout.
- **B:** Sai. X-Ray Metadata KHÔNG được đánh chỉ mục và KHÔNG thể dùng trong filter expressions; chỉ Annotations mới được index.
- **C (Đúng):** Chính xác! Trong X-Ray, chỉ Annotations mới được đánh chỉ mục (indexed) để tìm kiếm và lọc trong Filter Expressions (còn Metadata không được index). X-Ray Groups sử dụng filter expression để tạo Service Map riêng biệt và tự động xuất CloudWatch metric cho nhóm trace chậm.
- **D:** Sai. Ghi file trace ra S3 sẽ làm mất hoàn toàn Service Map và khả năng lọc truy vấn thời gian thực của X-Ray.
- **E:** Sai. X-Ray tính phí theo số trace được ghi nhận (recorded), nên bật 100% rồi xóa sau không tiết kiệm được chi phí (và X-Ray cũng không có API xóa lẻ từng trace).

</details>

### Câu 6 `medium`

A platform team runs 15 production Amazon EKS clusters. They want out-of-the-box visibility into Kubernetes cluster, node, pod, container, and control-plane health—including OOMKilled container restarts, kube-state metrics, and performance anomalies—directly inside the Amazon CloudWatch console with automated dashboards and minimal manual Prometheus/Grafana configuration. Which AWS solution should they enable?

- **A.** Enable Amazon EKS Control Plane Audit Logging only and view all pod and container metrics in AWS CloudTrail.
- **B.** Install the legacy CloudWatch Agent on EKS worker nodes configured to collect only EC2-level CPUUtilization and Disk metrics.
- **C.** Use the AWS X-Ray daemon alone on EKS worker nodes to collect Kubernetes node memory and kube-state pod metrics.
- **D.** Enable CloudWatch Container Insights with Enhanced Observability via the amazon-cloudwatch-observability EKS add-on.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm nền tảng vận hành 15 cụm Amazon EKS production. Họ muốn có khả năng quan sát tích hợp sẵn về tình trạng cụm Kubernetes, node, pod, container và control plane—bao gồm các lần khởi động lại container do OOMKilled, kube-state metric và các bất thường về hiệu năng—trực tiếp bên trong bảng điều khiển Amazon CloudWatch với các dashboard tự động và cấu hình Prometheus/Grafana thủ công tối thiểu. Họ nên bật giải pháp AWS nào?

**Đáp án đúng:** **D**

Amazon CloudWatch Container Insights with Enhanced Observability (triển khai qua EKS add-on) cung cấp giám sát sâu tới từng container/pod/node/kube-state và dashboard tích hợp sẵn mà không cần tự vận hành Prometheus/Grafana.

- **A:** Sai. Control Plane Audit Logging chỉ ghi log Kubernetes API server (vào CloudWatch Logs, không phải CloudTrail), không cung cấp metric CPU/RAM/OOMKilled của từng pod và container.
- **B:** Sai. Metric mức EC2 không phân tách được hiệu năng từng pod, container hay phát hiện trạng thái Kubernetes như OOMKilled.
- **C:** Sai. X-Ray chuyên về distributed request tracing, không thu thập hạ tầng kube-state hay container resource metrics.
- **D (Đúng):** Chính xác! Amazon CloudWatch Container Insights with Enhanced Observability cho EKS (cài đặt nhanh qua EKS Managed Add-on amazon-cloudwatch-observability) tự động thu thập chi tiết metric tới từng pod/container, trạng thái OOMKilled, kube-state metrics và cung cấp sẵn dashboard chuẩn hóa trên CloudWatch Console.

</details>

### Câu 7 `medium`

A high-throughput AWS Lambda function processes 5,000 events per second and must publish custom business metrics (such as OrdersProcessed and PaymentLatency) to Amazon CloudWatch without adding synchronous API latency or hitting CloudWatch PutMetricData throttling limits. Additionally, developers need to trace distributed requests across API Gateway, Lambda, and DynamoDB to pinpoint latency bottlenecks by OrderId. Which TWO solutions should be implemented? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Call cloudwatch:PutMetricData synchronously inside every Lambda invocation with StorageResolution set to 1 for high-resolution metrics.
- **B.** Record OrderId as X-Ray Metadata instead of an Annotation so the value is automatically indexed for fast trace filter expressions.
- **C.** Log structured JSON using CloudWatch Embedded Metric Format (EMF) to stdout so CloudWatch extracts custom metrics asynchronously.
- **D.** Enable VPC Flow Logs on the Lambda Elastic Network Interfaces (ENIs) to capture and measure DynamoDB query latency per OrderId.
- **E.** Enable AWS X-Ray active tracing on API Gateway and Lambda, and record OrderId as an X-Ray Annotation to filter traces.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một AWS Lambda function thông lượng cao xử lý 5.000 sự kiện mỗi giây và phải xuất bản các custom business metric (như OrdersProcessed và PaymentLatency) lên Amazon CloudWatch mà không làm tăng độ trễ API đồng bộ hoặc chạm giới hạn throttling của CloudWatch PutMetricData. Ngoài ra, các nhà phát triển cần truy vết các request phân tán qua API Gateway, Lambda và DynamoDB để xác định điểm nghẽn độ trễ theo OrderId. Nên triển khai HAI giải pháp nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Ghi nhớ hai điểm vàng của Domain 4: (1) Dùng Embedded Metric Format (EMF) cho Custom Metrics hiệu năng cao trên Lambda/Containers; (2) Trong AWS X-Ray, Annotations được đánh index để search/filter còn Metadata chỉ lưu dữ liệu bổ sung không index.

- **A:** Sai. Gọi PutMetricData đồng bộ 5.000 lần/giây sẽ tăng độ trễ Lambda, tốn chi phí API lớn và dễ bị AWS throttle.
- **B:** Sai. X-Ray Metadata KHÔNG được đánh index để filter/search; chỉ có X-Ray Annotations mới được đánh index.
- **C (Đúng):** Chính xác! CloudWatch Embedded Metric Format (EMF) cho phép Lambda chỉ cần ghi log JSON chuẩn ra stdout; CloudWatch tự động tách thành Custom Metrics bất đồng bộ mà không cần gọi API PutMetricData, loại bỏ hoàn toàn độ trễ và throttling.
- **D:** Sai. VPC Flow Logs chỉ ghi metadata gói tin IP (ACCEPT/REJECT), không thể đo độ trễ truy vấn ở tầng ứng dụng hay phân tích theo OrderId.
- **E (Đúng):** Chính xác! AWS X-Ray vẽ bản đồ dịch vụ (Service Map) và theo dõi độ trễ xuyên microservices; ghi OrderId vào Annotation (được đánh index) cho phép tìm kiếm/lọc chính xác trace theo mã đơn hàng.

</details>

---

[Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md)
