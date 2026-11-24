# Chương 35.4 – Mở rộng Container, CI/CD, Serverless & Observability trong DVA-C03 (Domain 1, 2, 3, 4)

> **Phạm vi trong Exam Guide DVA-C03:**
> Bên cạnh mảng AI, đề thi DVA-C03 điều chỉnh trọng tâm ở 4 mảng kỹ thuật truyền thống:
> 1. **Containerization & Orchestration mở rộng (Task 3.1 & 3.3):** Đi sâu hơn vào quy trình đóng gói image với **Dockerfile**, quản lý **Amazon ECR** (immutable tags, lifecycle policies, vulnerability scanning, pull-through cache) và vận hành **ECS / EKS / Fargate** (ECS Exec, Deployment Circuit Breaker, EKS Pod Identity).
> 2. **Testing & Modern CI/CD (Task 3.2 & 3.3):** Chuyển dịch từ CodeCommit sang **AWS CodeConnections**, báo cáo kiểm thử và độ phủ code trên **CodeBuild**.
> 3. **Presigned URLs & Cookies (Task 2.1):** Nhấn mạnh các tình huống thực tế và bẫy hết hạn sớm của **S3 Presigned URL** và **CloudFront Signed URL / Signed Cookies**.
> 4. **Troubleshooting & Observability hiện đại (Domain 4 – tăng từ 18% lên 22%):** **Lambda Recursive Loop Detection**, **CloudWatch Application Signals**, **OpenTelemetry (ADOT)**, **EventBridge Scheduler & EventBridge Pipes**.

---

## Bài 1 – Quy trình Container Chuyên sâu: Docker, ECR, ECS & EKS (Task 3.1 & 3.3)

Trong Chương 16 của khóa học cũ đã có kiến thức nền về ECS, ECR và Fargate. Tuy nhiên, DVA-C03 yêu cầu nắm thêm các tính năng vận hành và bảo mật container sau:

### 1.1. Amazon ECR (Elastic Container Registry) — Các tính năng hay hỏi thi

| Tính năng trên Amazon ECR | Cách hoạt động | Khi nào chọn trong đề DVA-C03? |
|---|---|---|
| **Tag Immutability (Thẻ bất biến)** | Khi bật `IMMUTABLE` trên repository, không ai có thể ghi đè (overwrite) một image tag đã tồn tại (ví dụ không thể push đè một image khác lên tag `v1.0.2`). *(Lưu ý: vẫn có thể cấu hình ngoại lệ cho các tag như `latest` hoặc `dev-*` ở các bản cập nhật mới, nhưng best practice là dùng tag bất biến theo commit SHA / semantic version).* | *"Đảm bảo image dùng trong production không bao giờ bị ghi đè bởi một bản build khác có cùng tag"* → Bật **Image Tag Immutability** trên ECR. |
| **ECR Lifecycle Policies** | Bộ quy tắc tự động dọn dẹp các image cũ/không dùng đến dựa trên: **trạng thái tag** (`untagged`, `tagged` với prefix cụ thể, `any`), **số lượng image giữ lại** (`countNumber`, ví dụ chỉ giữ 10 bản build gần nhất), hoặc **số ngày kể từ khi push** (`sinceImagePushed`, ví dụ xóa image `untagged` sau 7 ngày). | *"Tiết kiệm chi phí lưu trữ ECR bằng cách tự động xóa các container image không gắn thẻ (untagged) sau 14 ngày và chỉ giữ lại 10 image production mới nhất"* → Cấu hình **ECR Lifecycle Policy**. |
| **ECR Image Scanning (Basic vs Enhanced)** | - **Basic scanning:** Quét miễn phí lỗ hổng hệ điều hành (CVEs) khi push (`Scan on push`) hoặc quét thủ công.<br>- **Enhanced scanning (tích hợp Amazon Inspector):** Quét **liên tục và tự động (continuous scanning)** cả gói hệ điều hành (OS packages) **lẫn thư viện ngôn ngữ lập trình** (Python pip, Node npm, Java Maven...) ngay khi có CVE mới công bố mà không cần push lại image! | *"Tự động phát hiện lỗ hổng bảo mật trong cả thư viện ngôn ngữ lập trình của container image và tự động quét lại mỗi khi có CVE mới xuất hiện"* → Bật **ECR Enhanced Scanning với Amazon Inspector**. |
| **Pull Through Cache Rules** | Tự động đồng bộ và cache các image từ registry bên ngoài (ECR Public, Docker Hub, GitHub Container Registry, Quay...) về private ECR của bạn ngay ở lần pull đầu tiên. | *"Tránh lỗi giới hạn lượt tải (rate limit) từ Docker Hub và tăng tốc độ pull base image cho các node ECS/EKS trong mạng nội bộ"* → Cấu hình **ECR Pull Through Cache**. |
| **Cross-Region & Cross-Account Replication** | Tự động nhân bản image từ ECR ở Region A sang Region B hoặc sang tài khoản AWS khác (ví dụ từ tài khoản Build sang tài khoản Prod). | *"Triển khai ứng dụng container đa vùng (multi-region DR) cần container image luôn có sẵn ở Region dự phòng với độ trễ thấp nhất"*. |

---

### 1.2. Amazon ECS & AWS Fargate — Gỡ lỗi và Triển khai An toàn

#### 1. ECS Exec (`aws ecs execute-command`) — Gỡ lỗi container không cần mở cổng SSH!
- **Tình huống thi:** Một container chạy trên **AWS Fargate** (hoặc EC2 launch type) trong private subnet đang gặp lỗi. Lập trình viên muốn mở shell tương tác (`bash`/`sh`) vào bên trong container đang chạy để kiểm tra mà **không được mở port 22 (SSH)** trên Security Group hay gắn Public IP.
- **Giải pháp chuẩn:** Sử dụng **Amazon ECS Exec**!
  - Cơ chế bên dưới: Dùng **AWS Systems Manager (SSM) Session Manager** (container chạy SSM Agent ngầm).
  - Yêu cầu cấu hình (Bẫy thi!):
    1. Bật cờ `--enable-execute-command` trên ECS Service hoặc Task.
    2. **ECS Task Role** (không phải Task Execution Role!) phải được cấp quyền IAM cho SSM Messages (`ssmmessages:CreateControlChannel`, `ssmmessages:CreateDataChannel`, `ssmmessages:OpenControlChannel`, `ssmmessages:OpenDataChannel`).
    3. Trên Fargate Linux, nếu bật `readonlyRootFilesystem: true`, cần mount một volume tạm hoặc đảm bảo SSM agent có chỗ ghi.

#### 2. ECS Deployment Circuit Breaker (Ngắt mạch triển khai tự động)
- Khi dùng kiểu triển khai **Rolling Update (`ECS`)** cho ECS Service, nếu bản container mới bị lỗi crash liên tục (`CrashLoopBackOff` / không qua được Health Check của ALB), mặc định ECS cứ thử khởi tạo lại mãi.
- **Giải pháp chuẩn:** Bật **ECS Deployment Circuit Breaker** kèm tùy chọn **`Enable rollback`**: ECS sẽ tự động phát hiện các task mới không thể đạt trạng thái `RUNNING`/healthy và **tự động rollback** ngay về bản Task Definition ổn định gần nhất!

#### 3. Phân biệt lại thật kỹ: `Task Execution Role` vs `Task Role` (Câu hỏi kinh điển của mọi đề DVA)

| Tiêu chí | **ECS Task Execution Role** | **ECS Task Role** |
|---|---|---|
| **Ai sử dụng?** | **ECS Agent / Fargate infrastructure** (dùng lúc **khởi tạo và dừng** container) | **Code ứng dụng chạy bên trong container** (dùng trong suốt thời gian container đang chạy) |
| **Dùng cho việc gì?** | 1. **Pull image từ Amazon ECR** (`ecr:GetAuthorizationToken`, `ecr:BatchGetImage`)<br>2. **Gửi log của container lên CloudWatch Logs** (`logs:CreateLogStream`, `logs:PutLogEvents`)<br>3. **Đọc secret từ Secrets Manager / SSM Parameter Store để tiêm vào biến môi trường (`secrets` trong Task Definition)** lúc khởi động container | 1. Code Python/Node/Java trong container gọi **S3, DynamoDB, SQS, SNS, Amazon Bedrock...**<br>2. Code trong container **tự gọi SDK `boto3.client('secretsmanager')`** lúc đang chạy<br>3. Quyền `ssmmessages:*` để chạy **ECS Exec** |

---

### 1.3. Amazon EKS — EKS Pod Identity vs IRSA

Trong chương 16 đã nhắc tới việc cấp quyền IAM cho Pod trong EKS. Trong đề DVA-C03, cần biết **2 cách cấp quyền IAM ở cấp độ từng Pod (Pod-level IAM permissions)**:
1. **EKS Pod Identity (Cách mới, đơn giản hơn – AWS khuyến nghị):**
   - Chạy **EKS Pod Identity Agent** (Add-on trên cluster).
   - Tạo **Pod Identity Association** gắn trực tiếp **Kubernetes ServiceAccount** (trong một `namespace`) với một **IAM Role** có Trust Policy tin cậy `pods.eks.amazonaws.com`.
   - **Ưu điểm:** Không cần cấu hình OIDC Identity Provider cho từng cluster, dễ dùng lại một IAM Role cho nhiều EKS cluster!
2. **IRSA (IAM Roles for Service Accounts – Cách truyền thống):**
   - Tạo **IAM OIDC Identity Provider** gắn với EKS cluster, rồi annotate Kubernetes ServiceAccount bằng `eks.amazonaws.com/role-arn`.

---

## Bài 2 – Hiện đại hóa CI/CD & Kiểm thử Tự động (Domain 3: Testing and Deployment)

### 2.1. AWS CodeConnections (Thay thế CodeCommit / OAuth Token cũ)

- Do **AWS CodeCommit** đã ngừng nhận khách hàng mới, các câu hỏi về nguồn code (Source stage) trong **AWS CodePipeline** và **AWS CodeBuild** trong đề DVA-C03 thường dùng Git bên thứ 3 (**GitHub, GitLab, Bitbucket**).
- **Cách kết nối chuẩn AWS khuyến nghị:** Sử dụng **AWS CodeConnections** (tên mới của *AWS CodeStar Connections*).
  - Hoạt động thông qua việc cài đặt **AWS Connector App** trên GitHub/GitLab/Bitbucket (hỗ trợ cả bản Cloud và bản tự cài đặt GitHub Enterprise Server / GitLab Self-Managed qua Host VPC).
  - **Không** dùng Personal Access Token (PAT) tĩnh dài hạn hay mật khẩu Git lưu trong biến môi trường!

### 2.2. Tự động hóa Kiểm thử & Báo cáo trên AWS CodeBuild (Task 3.2)

Để đáp ứng **Task 3.2 (Test applications and automate testing workflows)** trong CI/CD:
- Trong file `buildspec.yml` của **AWS CodeBuild**, thêm phần **`reports`** để xuất:
  1. **Test Reports (Báo cáo kết quả chạy Unit/Integration Test):** Hỗ trợ các định dạng chuẩn như **JUnit XML, NUnit, Cucumber JSON, TestNG, Visual Studio TRX**. Giúp xem ngay trên giao diện CodeBuild những test case nào Pass/Fail, thời gian chạy và tỉ lệ thành công qua từng lần build.
  2. **Code Coverage Reports (Báo cáo độ phủ code):** Hỗ trợ định dạng **Cobertura XML, JaCoCo XML, SimpleCov, Clover**. Cho biết bao nhiêu % dòng code (line coverage) và nhánh logic (branch coverage) đã được kiểm thử.

```yaml
version: 0.2
phases:
  install:
    runtime-versions:
      python: 3.12
    commands:
      - pip install -r requirements.txt pytest pytest-cov
  build:
    commands:
      - pytest --junitxml=reports/junit.xml --cov=src --cov-report=xml:reports/coverage.xml
reports:
  UnitTestReportGroup:
    files:
      - "junit.xml"
    base-directory: "reports"
    file-format: JUNITXML
  CodeCoverageReportGroup:
    files:
      - "coverage.xml"
    base-directory: "reports"
    file-format: COBERTURAXML
```

---

## Bài 3 – Bẫy Bảo mật với Presigned URLs (S3 vs CloudFront – Task 2.1)

Exam Guide DVA-C03 nhấn mạnh rõ việc sử dụng **Presigned URLs** trên cả **Amazon S3** và **Amazon CloudFront**. Hãy nắm chắc bảng so sánh và **bẫy hết hạn sớm** dưới đây:

### 3.1. S3 Presigned URL vs CloudFront Signed URL vs CloudFront Signed Cookies

| Tiêu chí | **S3 Presigned URL** | **CloudFront Signed URL** | **CloudFront Signed Cookies** |
|---|---|---|---|
| **Đích truy cập** | Trực tiếp vào S3 bucket (hoặc qua S3 Transfer Acceleration) | Đi qua mạng lưới Edge toàn cầu của CloudFront (tới S3 hoặc HTTP origin bất kỳ) | Đi qua CloudFront |
| **Số lượng file** | **1 URL = 1 file (object)** để tải xuống (`GET`) hoặc tải lên (`PUT`/`POST`) | **1 URL = 1 file** (ví dụ 1 bộ phim MP4 hoặc 1 gói cài đặt) | **1 bộ Cookie = NHIỀU file** (ví dụ: toàn bộ các mảnh video HLS `.ts`, hoặc toàn bộ ảnh/tài liệu của khu vực thành viên VIP) |
| **Ai ký (Signer)?** | Bất kỳ **IAM User / IAM Role** nào có quyền đọc/ghi object đó trên S3 | **CloudFront Key Group** (khuyên dùng – quản lý bằng IAM/API, xoay vòng khóa dễ dàng) hoặc CloudFront Key Pair của Root (cũ, không khuyên dùng) | **CloudFront Key Group** |
| **Tính năng lọc nâng cao** | Thời gian hết hạn | Thời gian hết hạn + **Giới hạn dải IP của người dùng (IP CIDR restriction)** (với Custom Policy) | Thời gian hết hạn + Giới hạn dải IP |

### 3.2. Bẫy thi kinh điển: S3 Presigned URL bị hết hạn SỚM hơn thời gian cấu hình (`ExpiresIn`)!

> **Tình huống:** Lập trình viên viết một hàm **AWS Lambda** (hoặc ứng dụng trên EC2 dùng IAM Role) gọi `s3_client.generate_presigned_url(..., ExpiresIn=604800)` để tạo một S3 Presigned URL có hạn **7 ngày (168 giờ)** gửi cho khách hàng. Tuy nhiên, chỉ sau **vài chục phút đến 1 giờ**, khách hàng bấm vào link thì bị lỗi **`403 Forbidden (ExpiredToken)`**! Tại sao?
>
> **Giải thích gốc rễ (Phải nhớ thuộc lòng):**
> - Thời hạn hiệu lực thực tế của một S3 Presigned URL luôn bằng:
>   $$\text{Thời hạn thực tế} = \min(\text{ExpiresIn của URL}, \text{Thời gian sống còn lại của Temporary Credentials đã ký URL đó})$$
> - Hàm **AWS Lambda** sử dụng **Execution Role** có **STS Temporary Credentials** với thời gian sống tối đa khoảng **1 giờ** (và được làm mới định kỳ). Vì vậy, dù bạn truyền `ExpiresIn=7 ngày`, Presigned URL được ký bởi Lambda **sẽ chết ngay khi phiên STS của Lambda hết hạn (<= 1 giờ)**!
> - **Thời hạn tối đa của S3 Presigned URL theo loại danh tính người ký:**
>   1. Ký bằng **AWS STS Temporary Credentials** (Lambda Role, EC2 Instance Profile, `AssumeRole`): tối đa bằng thời hạn phiên STS (mặc định **1 giờ**, cấu hình `MaxSessionDuration` của Role tối đa **12 giờ**; riêng `GetFederationToken` tối đa **36 giờ**).
>   2. Ký bằng **IAM User (Long-term credentials)** qua Signature Version 4 (SDK/CLI): tối đa **7 ngày (168 giờ / 604.800 giây)**.
>   3. Ký trên **S3 Console**: tối đa **12 giờ**.
> - **Giải pháp chuẩn nếu ứng dụng serverless (Lambda) cần tạo link tải file có hiệu lực dài hạn (ví dụ 7 ngày hoặc 30 ngày):**
>   → Dùng **CloudFront Signed URL** (ký bằng private key của **CloudFront Key Group** lưu trong Secrets Manager), vì CloudFront Signed URL dựa trên cặp khóa RSA/ECDSA độc lập, **không bị phụ thuộc vào thời hạn phiên STS của Lambda**!

---

## Bài 4 – Mở rộng Serverless & Observability (Domain 4: 22%)

### 4.1. AWS Lambda Recursive Loop Detection (Phát hiện vòng lặp đệ quy tự động)

- **Vấn đề thực tế:** Hàm Lambda được kích hoạt bởi S3 bucket A (hoặc SQS queue A / SNS topic A), sau khi xử lý xong lại vô tình ghi kết quả trả ngược vào chính S3 bucket A (hoặc gửi tin nhắn vào lại SQS queue A) → tạo thành **vòng lặp vô hạn (infinite recursive loop)** đốt hết concurrency và tiền của tài khoản.
- **Tính năng mới cần nhớ cho DVA-C03:**
  - AWS Lambda hiện có cơ chế **Recursive Loop Detection** tự động theo dõi chuỗi sự kiện đi qua **Lambda ↔ S3, SQS, SNS**.
  - Khi phát hiện một chuỗi sự kiện lặp đi lặp lại **quá 16 lần liên tiếp**, Lambda sẽ **tự động chặn (drop/stop) lần gọi thứ 17**, gửi sự kiện lỗi về **DLQ / On-failure Destination** (nếu có cấu hình) và gửi cảnh báo qua **AWS Health Dashboard / CloudWatch metrics (`RecursiveInvocationsDropped`)** + email.
  - **Cách phòng tránh đúng kiến trúc:** Luôn ghi file đầu ra sang một **S3 bucket khác**, hoặc nếu bắt buộc dùng chung bucket thì phải cấu hình **Event Notification chỉ lắng nghe một Prefix riêng** (ví dụ chỉ trigger ở `input/`) và ghi kết quả vào một Prefix khác (`output/`).

---

### 4.2. CloudWatch Application Signals & AWS Distro for OpenTelemetry (ADOT)

Do tỷ trọng **Domain 4 (Troubleshooting and Optimization)** tăng từ **18% lên 22%**, AWS nhấn mạnh các công cụ quan sát ứng dụng hiện đại sau:

1. **CloudWatch Application Signals (APM tự động trên CloudWatch):**
   - Tự động thu thập các chỉ số vàng (**Golden Signals: Call Volume/Throughput, Availability/Faults 5xx/Errors 4xx, Latency P90/P99**) và dựng **Service Map / Application Topology** cùng theo dõi **SLI/SLO (Service Level Objectives)** cho ứng dụng Java, Python, Node.js, .NET chạy trên **EKS, ECS, EC2 và Lambda** mà **không cần viết code thủ công (auto-instrumentation dựa trên OpenTelemetry)**.
2. **AWS Distro for OpenTelemetry (ADOT):**
   - Phiên bản phân phối OpenTelemetry được AWS hỗ trợ chính thức (đóng vai trò thay thế lâu dài cho X-Ray SDK cũ).
   - **Cách triển khai chuẩn:**
     - Trên **AWS Lambda**: gắn **ADOT Lambda Layer** được AWS quản lý sẵn.
     - Trên **Amazon ECS / EKS**: chạy **ADOT Collector** dưới dạng **Sidecar container** (hoặc DaemonSet trên EKS) để thu thập cả **Traces (gửi về AWS X-Ray)** và **Metrics (gửi về CloudWatch / Amazon Managed Service for Prometheus)**.

---

### 4.3. EventBridge Scheduler vs EventBridge Pipes (Ôn nhanh phân biệt)

| Dịch vụ | Chức năng cốt lõi | Khi nào chọn trong đề DVA-C03? |
|---|---|---|
| **Amazon EventBridge Scheduler** | Bộ lập lịch serverless quy mô hàng triệu lịch chạy, hỗ trợ **Cron / Rate** VÀ **Lịch chạy 1 lần duy nhất (`at(yyyy-mm-ddThh:mm:ss)`)**, hỗ trợ **Múi giờ (Timezone) + Giờ mùa hè (DST)**, cửa sổ linh hoạt (flexible time window), tự động retry và gửi vào DLQ. | *"Đặt lịch gửi email nhắc nhở cho từng đơn hàng đúng 48 giờ sau khi khách đăng ký (one-time schedule) theo đúng múi giờ của khách hàng"*. |
| **Amazon EventBridge Pipes** | Kết nối **điểm-tới-điểm (Point-to-Point)** giữa 1 nguồn (SQS, Kinesis, DynamoDB Stream, MSK, MQ) và 1 đích (Step Functions, Lambda, API Gateway, SNS, SQS, EventBridge bus...) theo 4 bước: **Source → Filtering (lọc bớt event) → Enrichment (gọi Lambda/API Gateway/Step Functions làm giàu dữ liệu) → Target**, giữ nguyên thứ tự mà **không cần viết code Lambda glue chỉ để chuyển tiếp dữ liệu**. | *"Đọc dữ liệu từ DynamoDB Streams, lọc chỉ lấy đơn hàng > 100$, gọi một API để lấy thêm địa chỉ khách hàng rồi đẩy thẳng vào Step Functions mà viết ít code nhất"*. |

---

## Ghi nhớ cho kỳ thi (Tóm tắt nhanh Chương 35.4)

1. **Không cho phép ghi đè container image cùng tag trên ECR:** Bật **ECR Image Tag Immutability**.
2. **Tự động xóa các container image cũ / untagged trên ECR:** Cấu hình **ECR Lifecycle Policy**.
3. **Quét lỗ hổng liên tục cả OS và thư viện ngôn ngữ trong ECR:** Bật **ECR Enhanced Scanning (Amazon Inspector)**.
4. **SSH/Shell vào container đang chạy trên Fargate để debug mà không mở port 22:** Dùng **ECS Exec** (cấp quyền `ssmmessages:*` cho **ECS Task Role**).
5. **Tự động rollback khi ECS Rolling Update bị lỗi task crash liên tục:** Bật **ECS Deployment Circuit Breaker** với rollback.
6. **S3 Presigned URL tạo từ Lambda bị hết hạn sau 1 giờ dù đặt `ExpiresIn=7 ngày`:** Do bị giới hạn bởi thời hạn phiên STS của **Lambda Execution Role**. Giải pháp: dùng **CloudFront Signed URL** (hoặc ký bằng IAM User nếu bắt buộc dùng S3 Presigned URL tới 7 ngày).
7. **Nối DynamoDB Stream / SQS → Lọc → Làm giàu dữ liệu → Đích mà không viết code glue:** Dùng **Amazon EventBridge Pipes**.

---

[← Chương 35.3](ch35-03-bao-mat-ai-va-guardrails.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chương 35.5 →](ch35-05-bo-30-cau-hoi-luyen-thi-dva-c03-phan-moi.md)
