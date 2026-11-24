# Bài tập tình huống — Chủ đề 6: Serverless Compute — AWS Lambda Deep Dive

> Lambda Execution Model, Memory/vCPU, Layers, SnapStart, Provisioned vs Reserved Concurrency, Event Source Mapping & Destinations.
> **Số câu hỏi:** 9 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

An AWS Lambda function performs CPU-intensive image resizing and currently runs with 256 MB of allocated memory, taking 4,000 ms per invocation. The developer wants to reduce both execution duration and total invocation cost. How does increasing the Lambda memory allocation to 1,024 MB affect CPU and cost?

- **A.** Lambda allocates vCPU proportionally to memory, so 1,024 MB provides 4x the CPU power, which can cut execution time to ~1,000 ms and result in the same or lower total cost.
- **B.** Increasing memory only adds RAM and does not affect CPU speed, so invocation cost will increase 4x with no latency improvement.
- **C.** Increasing memory to 1,024 MB automatically enables Provisioned Concurrency on `$LATEST`, increasing hourly infrastructure costs.
- **D.** Lambda functions are strictly capped at 1 vCPU regardless of memory size, so allocating anything above 512 MB is wasted.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm AWS Lambda thực hiện thay đổi kích thước ảnh tiêu tốn nhiều CPU và hiện đang chạy với 256 MB bộ nhớ được cấp phát, mất 4.000 ms cho mỗi lần gọi. Developer muốn giảm cả thời gian thực thi lẫn tổng chi phí gọi hàm. Việc tăng mức cấp phát bộ nhớ Lambda lên 1.024 MB ảnh hưởng đến CPU và chi phí như thế nào?

**Đáp án đúng:** **A**

**AWS Lambda Performance & Cost Tuning**:
- **Memory tỷ lệ thuận với vCPU** (`1,769 MB` = 1 vCPU; tối đa `10,240 MB` = 6 vCPU).
- Với tác vụ **CPU-bound** (nén ảnh, mã hóa, tính toán), tăng Memory giúp giảm Duration mạnh -> **giảm latency mà tổng chi phí bằng hoặc thấp hơn**.
- Công cụ chuẩn để tìm điểm tối ưu là **AWS Lambda Power Tuning** (chạy bằng Step Functions).

- **A (Đúng):** Đúng! Trong AWS Lambda, sức mạnh vCPU và băng thông mạng tăng **tuyến tính theo Memory** (1,769 MB = 1 vCPU đầy đủ). Tăng RAM gấp 4 lần cho tác vụ CPU-bound thường giúp giảm thời gian chạy xuống ~1/4, khiến tổng GB-seconds không đổi hoặc thậm chí rẻ hơn mà lại nhanh hơn nhiều.
- **B:** Sai vì Lambda không cho chỉnh CPU riêng; CPU luôn tỷ lệ thuận với dung lượng Memory được cấp phát.
- **C:** Sai vì thay đổi Memory không liên quan đến Provisioned Concurrency.
- **D:** Sai vì Lambda hỗ trợ tối đa lên tới 10,240 MB RAM tương đương **6 vCPU**.

</details>

### Câu 2 `medium`

An AWS Lambda function establishes a new HTTPS connection and initializes the AWS SDK client inside the `handler` function on every invocation, causing inconsistent latency and high connection overhead. Additionally, the function temporarily downloads 2 GB files during processing. Which two optimizations follow AWS Lambda best practices?

- **A.** Initialize the AWS SDK client and connection pools outside the `handler` (during the Init phase), and increase ephemeral `/tmp` storage up to 10,240 MB as needed.
- **B.** Write the 2 GB temporary files directly to `/var/task` inside the Lambda execution environment during each invocation.
- **C.** Call `client.close()` at the end of every handler invocation and re-instantiate the AWS SDK client on each new request.
- **D.** Store the 2 GB temporary files inside AWS Lambda Environment Variables encrypted with an AWS KMS key.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm AWS Lambda thiết lập kết nối HTTPS mới và khởi tạo AWS SDK client bên trong hàm `handler` ở mỗi lần gọi, gây ra độ trễ không ổn định và chi phí kết nối cao. Ngoài ra, hàm còn tải xuống tạm thời các tệp 2 GB trong quá trình xử lý. Hai tối ưu hóa nào tuân theo các thực hành tốt nhất của AWS Lambda?

**Đáp án đúng:** **A**

Best practices tối ưu **AWS Lambda Execution Environment**:
1. **Code outside handler**: Khởi tạo AWS SDK clients, HTTP connection pools, DB connections bên ngoài hàm `handler` để tái sử dụng khi warm start.
2. **`/tmp` Ephemeral Storage**: Mặc định 512 MB, có thể cấu hình tăng lên tối đa **10,240 MB (10 GB)** (nếu cần chia sẻ dữ liệu lâu dài giữa các container hãy dùng **Amazon EFS**).

- **A (Đúng):** Đúng! Khai báo SDK client / DB connection bên ngoài `handler` giúp tái sử dụng qua các lần gọi ấm (warm invocations). Đồng thời, Lambda cho phép mở rộng bộ nhớ tạm `/tmp` từ 512 MB lên tới 10,240 MB (10 GB) để chứa file tạm 2 GB.
- **B:** Sai vì `/var/task` là thư mục chứa code chỉ đọc (read-only); chỉ thư mục `/tmp` mới cho phép ghi file tạm.
- **C:** Sai vì đóng và tạo lại client mỗi lần gọi làm mất lợi ích tái sử dụng kết nối (connection reuse) của Execution Environment.
- **D:** Sai vì tổng kích thước Environment Variables chỉ giới hạn tối đa **4 KB**.

</details>

### Câu 3 `easy`

A development team maintains 15 Python AWS Lambda functions that all depend on the same large third-party data processing library (30 MB). Currently, every function's deployment package includes a copy of this library, slowing down deployments and making updates tedious. What is the MOST efficient way to share this library across all 15 Lambda functions?

- **A.** Package the library as an AWS Lambda Layer and attach it to all 15 Lambda functions.
- **B.** Upload the library to Amazon S3 and have each Lambda function download it into `/var/task` on every invocation.
- **C.** Store the library as a Base64-encoded string inside Lambda Environment Variables.
- **D.** Attach 15 separate Amazon EBS volumes to the Lambda functions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm phát triển duy trì 15 hàm AWS Lambda viết bằng Python, tất cả đều phụ thuộc vào cùng một thư viện xử lý dữ liệu bên thứ ba có kích thước lớn (30 MB). Hiện tại, gói triển khai của mỗi hàm đều chứa một bản sao của thư viện này, làm chậm quá trình triển khai và khiến việc cập nhật trở nên tẻ nhạt. Cách HIỆU QUẢ NHẤT để chia sẻ thư viện này trên cả 15 hàm Lambda là gì?

**Đáp án đúng:** **A**

**AWS Lambda Layers**:
- Chia sẻ thư viện, custom runtime hoặc cấu hình dùng chung giữa nhiều hàm Lambda.
- Tối đa **5 Layers** trên mỗi hàm Lambda; tổng kích thước giải nén (code + tất cả layers) không quá **250 MB**.
- Nội dung Layer được mount vào **`/opt`**.

- **A (Đúng):** Đúng! AWS Lambda Layer cho phép đóng gói thư viện dùng chung một lần, giải nén tự động vào thư mục `/opt` của môi trường thực thi, giúp gói code của mỗi hàm nhẹ hơn và cập nhật thư viện tập trung.
- **B:** Sai vì `/var/task` là thư mục chỉ đọc (read-only) khi Lambda chạy, và việc tải 30 MB từ S3 mỗi lần gọi sẽ làm tăng mạnh độ trễ và chi phí.
- **C:** Sai vì tổng kích thước Environment Variables của Lambda bị giới hạn tối đa 4 KB.
- **D:** Sai vì AWS Lambda không hỗ trợ gắn EBS volume.

</details>

### Câu 4 `medium`

An AWS account has a regional Lambda concurrency limit of 1,000. A critical checkout Lambda function experiences occasional `429 TooManyRequestsException` throttling errors during flash sales because a separate, non-critical batch analytics Lambda function spikes to 950 concurrent executions. How can the developer guarantee that the checkout Lambda ALWAYS has 200 concurrent executions available while capping the analytics Lambda?

- **A.** Set Provisioned Concurrency to `200` on the checkout Lambda without configuring Reserved Concurrency on either Lambda function.
- **B.** Set Reserved Concurrency to `200` on the checkout Lambda (and optionally cap the analytics Lambda's Reserved Concurrency).
- **C.** Set Reserved Concurrency to `0` on the checkout Lambda function to isolate its concurrency pool from the analytics Lambda.
- **D.** Enable AWS Lambda SnapStart on a published version of the analytics Lambda to reduce its concurrent execution duration.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tài khoản AWS có giới hạn concurrency Lambda theo Region là 1.000. Một hàm Lambda thanh toán (checkout) quan trọng thỉnh thoảng gặp lỗi throttling `429 TooManyRequestsException` trong các đợt flash sale vì một hàm Lambda phân tích batch không quan trọng khác tăng vọt lên 950 lượt thực thi đồng thời. Làm thế nào developer có thể đảm bảo rằng checkout Lambda LUÔN có sẵn 200 lượt thực thi đồng thời trong khi giới hạn mức trần cho analytics Lambda?

**Đáp án đúng:** **B**

Phân biệt **Reserved Concurrency** vs **Provisioned Concurrency**:
- **Reserved Concurrency** (Miễn phí): Vừa là **phần dành riêng** (guaranteed) vừa là **mức trần tối đa** (max cap) cho 1 hàm (trích từ quota 1,000 của account; đặt `= 0` để khóa hàm).
- **Provisioned Concurrency** (Có tính phí): Giữ ấm môi trường thực thi sẵn sàng để loại bỏ **Cold Start**.

- **A:** Sai vì Provisioned Concurrency giữ ấm sẵn môi trường để chống Cold Start, nhưng nếu không đặt Reserved Concurrency (hoặc giới hạn hàm analytics), hàm analytics vẫn có thể chiếm hết pool concurrency chung của account.
- **B (Đúng):** Đúng! **Reserved Concurrency** vừa **đảm bảo (dành riêng)** số lượng execution tối thiểu cho hàm quan trọng (không bị hàm khác chiếm mất), vừa đóng vai trò **giới hạn trần tối đa** cho hàm đó (giúp hãm phanh hàm analytics).
- **C:** Sai vì Reserved Concurrency = `0` sẽ **chặn hoàn toàn** (throttle 100%) hàm checkout.
- **D:** Sai vì SnapStart chỉ giảm Cold Start, không giới hạn concurrency.

</details>

### Câu 5 `medium`

An AWS Lambda function needs to call an external partner API that uses **mTLS (Mutual TLS)** authentication, requiring the Lambda function to present a client TLS certificate and private key. Where should the developer store the private key so it is encrypted at rest, rotatable, and never committed to Git?

- **A.** Commit the `.key` private key file directly into the Git repository and bundle it inside the Lambda deployment ZIP package.
- **B.** Store the mTLS private key in a public Amazon S3 bucket so the Lambda function can download it without IAM credentials.
- **C.** Pass the mTLS client certificate and private key as plaintext values in a CloudFormation `Outputs` section.
- **D.** Store the certificate and private key in AWS Secrets Manager (or SSM `SecureString`) and fetch/cache them at runtime.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm AWS Lambda cần gọi một API đối tác bên ngoài sử dụng xác thực **mTLS (Mutual TLS)**, yêu cầu hàm Lambda phải xuất trình chứng chỉ TLS phía client và private key. Developer nên lưu trữ private key ở đâu để nó được mã hóa khi lưu trữ (at rest), có thể xoay vòng và không bao giờ bị commit vào Git?

**Đáp án đúng:** **D**

Nguyên tắc lưu trữ bí mật (Private Keys, API Tokens, DB Passwords): Luôn dùng **AWS Secrets Manager** hoặc **SSM Parameter Store (`SecureString`)**, tuyệt đối không commit vào Git hoặc để plaintext trong CloudFormation `Outputs` / `Mappings`.

- **A:** Sai vì commit private key vào Git làm lộ bí mật cho bất kỳ ai có quyền đọc repository.
- **B:** Sai vì lưu private key ở public S3 bucket sẽ làm lộ ngay lập tức.
- **C:** Sai vì CloudFormation Outputs hiển thị plaintext trên console cho bất kỳ ai có quyền mô tả stack.
- **D (Đúng):** Đúng! Lưu private key mTLS trong **AWS Secrets Manager** (hoặc SSM `SecureString`) đảm bảo mã hóa bằng KMS, kiểm soát quyền chặt chẽ qua IAM, và dễ dàng xoay vòng mà không phải redeploy code.

</details>

### Câu 6 `medium`

A team uses AWS AppConfig to manage feature flags for a fleet of AWS Lambda functions. Retrieving the AppConfig configuration on every Lambda invocation via `GetLatestConfiguration` adds latency and API costs. What is the AWS-recommended way for Lambda functions to retrieve AppConfig feature flags with low latency and built-in caching?

- **A.** Store all feature flags in CloudFormation `Mappings` and redeploy the stack whenever a flag is toggled.
- **B.** Use `sam local start-api` in production to hot-reload feature flag configuration files directly from the developer's workstation.
- **C.** Attach the AWS AppConfig Agent Lambda Extension (Layer) and query `http://localhost:2772/applications/...` from code.
- **D.** Query AWS CloudTrail Event History on every Lambda invocation to retrieve the latest feature flag values.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm sử dụng AWS AppConfig để quản lý các feature flag cho một loạt hàm AWS Lambda. Việc lấy cấu hình AppConfig ở mỗi lần gọi Lambda thông qua `GetLatestConfiguration` làm tăng độ trễ và chi phí API. Cách được AWS khuyến nghị để các hàm Lambda lấy feature flag từ AppConfig với độ trễ thấp và cơ chế caching tích hợp sẵn là gì?

**Đáp án đúng:** **C**

**AWS AppConfig + Lambda**:
- Dùng **AWS AppConfig Agent Lambda Extension** (port `2772`) để cache feature flags tại local và tự poll cập nhật bất đồng bộ.

- **A:** Sai vì phải redeploy CloudFormation mỗi lần bật/tắt feature flag, mất hoàn toàn ý nghĩa dynamic configuration.
- **B:** Sai vì `sam local` chỉ là công cụ test trên máy developer.
- **C (Đúng):** Đúng! **AWS AppConfig Agent Lambda Extension** chạy cùng tiến trình Lambda, tự động cache và làm mới cấu hình định kỳ theo `AWS_APPCONFIG_EXTENSION_POLL_INTERVAL_SECONDS`, giúp Lambda đọc feature flag cực nhanh qua `localhost:2772`.
- **D:** Sai vì CloudTrail ghi log kiểm toán API, không lưu cấu hình feature flags.

</details>

### Câu 7 `medium`

An AWS Lambda function (`ImageResizer`) runs with 512 MB of memory and is invoked 10 million times per month. The team wants to find the exact memory configuration (between 128 MB and 3,008 MB) that minimizes either execution cost, execution duration, or a balanced combination of both, based on real measurements of their actual function code. Which open-source AWS tool automates this benchmarking?

- **A.** AWS Trusted Advisor cost optimization checks
- **B.** AWS CloudTrail Insights anomaly detection
- **C.** AWS Lambda Power Tuning (Step Functions state machine)
- **D.** Amazon Inspector automated Lambda function vulnerability scanning

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hàm AWS Lambda (`ImageResizer`) chạy với 512 MB bộ nhớ và được gọi 10 triệu lần mỗi tháng. Nhóm muốn tìm cấu hình bộ nhớ chính xác (trong khoảng từ 128 MB đến 3.008 MB) giúp tối thiểu hóa chi phí thực thi, thời gian thực thi hoặc sự kết hợp cân bằng cả hai, dựa trên các phép đo thực tế của mã nguồn hàm. Công cụ mã nguồn mở nào của AWS tự động hóa việc đo kiểm (benchmarking) này?

**Đáp án đúng:** **C**

**AWS Lambda Power Tuning**: Công cụ chuẩn của AWS (dựa trên Step Functions) để tìm mức Memory tối ưu cho chi phí hoặc độ trễ.

- **A:** Sai vì Trusted Advisor chỉ đưa ra khuyến nghị tổng quát về hàm bị over-provisioned/timeout, không chạy benchmark đa mức RAM trên code thực tế.
- **B:** Sai vì CloudTrail Insights theo dõi bất thường API quản trị.
- **C (Đúng):** Đúng! **AWS Lambda Power Tuning** (chạy bằng AWS Step Functions) tự động chạy hàm Lambda của bạn với nhiều mức RAM (128 MB, 256 MB, 512 MB, 1024 MB, 1769 MB...) và vẽ biểu đồ so sánh trực quan giữa **Execution Time** và **Cost**.
- **D:** Sai vì Amazon Inspector quét lỗ hổng bảo mật CVE.

</details>

### Câu 8 `medium`

A developer has an AWS Lambda function in Java that takes 4 seconds to initialize (Cold Start) because it uses Spring Boot and creates an AWS SDK v2 client. Even before enabling SnapStart, how can the developer minimize the AWS SDK v2 initialization latency and bundle size in Lambda?

- **A.** Instantiate a new `DynamoDbClient.create()` SDK client instance inside the `handleRequest()` method on every single Lambda invocation.
- **B.** Set the AWS Lambda `Timeout` to 3 seconds to force faster Java Virtual Machine initialization.
- **C.** Import only the `dynamodb` SDK module, use `UrlConnectionHttpClient` or `AwsCrtHttpClient`, and initialize the client in a `static` block.
- **D.** Lower the Lambda function's allocated memory to 128 MB to reduce the microVM initialization overhead.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer có một hàm AWS Lambda viết bằng Java mất 4 giây để khởi tạo (Cold Start) vì nó sử dụng Spring Boot và tạo một AWS SDK v2 client. Ngay cả trước khi bật SnapStart, developer có thể giảm thiểu độ trễ khởi tạo và kích thước gói của AWS SDK v2 trong Lambda bằng cách nào?

**Đáp án đúng:** **C**

Tối ưu **Cold Start cho Java / .NET / Node / Python trên Lambda**:
- Khởi tạo SDK client **bên ngoài handler** (`static` block).
- Chỉ import đúng service module cần dùng (Tree-shaking / modular SDK v2/v3).
- Bật **Lambda SnapStart** (miễn phí) hoặc **Provisioned Concurrency** (có phí).

- **A:** Sai vì khởi tạo lại SDK client bên trong `handleRequest()` làm mất connection reuse và tăng độ trễ trên mọi lần gọi.
- **B:** Sai vì đặt Timeout 3 giây trong khi Cold Start mất 4 giây sẽ làm hàm bị timeout chết ngay lúc khởi tạo.
- **C (Đúng):** Đúng! Trong **AWS SDK for Java v2** trên Lambda, tách nhỏ dependency theo từng dịch vụ, dùng **`UrlConnectionHttpClient`** (thay cho Apache/Netty nặng nề nếu không cần async non-blocking) và khởi tạo trong `static` block giúp giảm mạnh thời gian Cold Start và dung lượng JAR.
- **D:** Sai vì giảm RAM xuống 128 MB làm giảm vCPU mạnh, khiến Java Cold Start càng chậm hơn gấp nhiều lần.

</details>

### Câu 9 `medium`

A company runs a critical payment API backed by an AWS Lambda function configured with the Java 21 runtime. Users report that the first few requests each morning experience 6-second latency spikes due to cold starts, while subsequent requests complete in under 150 ms. The engineering team wants to eliminate cold start latency for this Java function WITHOUT incurring any additional per-hour AWS infrastructure charges. Which feature should the developer enable?

- **A.** Enable AWS Lambda SnapStart on a published version of the Lambda function.
- **B.** Configure Provisioned Concurrency of 50 on the `$LATEST` version of the Lambda function.
- **C.** Set Reserved Concurrency to 0 during peak business hours.
- **D.** Increase the Lambda function timeout from 30 seconds to 900 seconds.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty vận hành một API thanh toán quan trọng được hỗ trợ bởi một hàm AWS Lambda cấu hình với runtime Java 21. Người dùng báo cáo rằng một vài request đầu tiên mỗi sáng gặp tình trạng độ trễ tăng vọt lên 6 giây do cold start, trong khi các request tiếp theo hoàn thành trong chưa đầy 150 ms. Nhóm kỹ thuật muốn loại bỏ độ trễ cold start cho hàm Java này MÀ KHÔNG phát sinh thêm bất kỳ chi phí hạ tầng AWS theo giờ nào. Developer nên bật tính năng nào?

**Đáp án đúng:** **A**

So sánh **Provisioned Concurrency** vs **Lambda SnapStart**:
- **SnapStart**: **Miễn phí**, chụp snapshot microVM khi publish version, giảm tới 90% cold start cho Java/Python/.NET.
- **Provisioned Concurrency**: **Có tính phí**, giữ ấm sẵn số lượng môi trường thực thi cho mọi runtime.

- **A (Đúng):** Đúng! AWS Lambda SnapStart chụp snapshot bộ nhớ Firecracker microVM sau khi hàm khởi tạo (`Init` phase) trên một Published Version, giúp giảm tới 90% thời gian Cold Start cho Java, Python và .NET mà KHÔNG tính thêm phí duy trì theo giờ.
- **B:** Sai vì hai lý do: (1) Provisioned Concurrency có tính phí theo giờ duy trì, và (2) Provisioned Concurrency không thể gắn trực tiếp lên `$LATEST` (chỉ gắn trên Version hoặc Alias).
- **C:** Sai vì đặt Reserved Concurrency = 0 sẽ chặn (throttle) toàn bộ 100% lời gọi tới hàm Lambda đó.
- **D:** Sai vì tăng Timeout chỉ cho phép hàm chạy lâu hơn chứ không làm giảm thời gian khởi tạo Cold Start.

</details>

---

[← Chủ đề 05](05-containers-ecs-ecr-eb.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chủ đề 07 →](07-dynamodb.md)
