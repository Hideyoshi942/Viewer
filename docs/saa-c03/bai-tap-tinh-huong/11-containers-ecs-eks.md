# Bài tập tình huống — Chủ đề 11: Kiến trúc Container trên AWS — ECS, EKS, Fargate, ECR & App Runner

> Amazon ECS (EC2 vs Fargate Launch Type), Amazon EKS, IAM Roles for Tasks/Service Accounts, Amazon ECR & AWS App Runner.
> **Số câu hỏi:** 6 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A media company runs an image-processing workflow where an AWS Lambda function is triggered when users upload files to Amazon S3. Recently, some high-resolution video files take up to 25 minutes to process, causing the Lambda invocations to fail. The team wants a serverless solution that requires minimal operational overhead. Which architecture should the solutions architect recommend?

- **A.** Run the video-processing container on Amazon ECS with AWS Fargate, triggered by Amazon EventBridge or SQS.
- **B.** Increase the AWS Lambda function timeout setting to 30 minutes and configure provisioned concurrency.
- **C.** Provision an Amazon EC2 instance with a cron job that polls the S3 bucket every minute for new uploads.
- **D.** Use Amazon API Gateway with a custom Lambda authorizer to extend the synchronous execution timeout window.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty truyền thông vận hành quy trình xử lý hình ảnh trong đó một hàm AWS Lambda được kích hoạt khi người dùng tải tệp lên Amazon S3. Gần đây, một số tệp video độ phân giải cao mất tới 25 phút để xử lý, khiến các lần gọi Lambda bị lỗi. Nhóm muốn một giải pháp serverless yêu cầu ít nỗ lực vận hành nhất. Solutions architect nên đề xuất kiến trúc nào?

**Đáp án đúng:** **A**

Khi tác vụ vượt quá giới hạn **15 phút của Lambda** nhưng vẫn muốn **serverless / ít vận hành nhất**, hãy chuyển sang **ECS on AWS Fargate** (hoặc AWS Batch).

- **A (Đúng):** Đúng! AWS Fargate chạy container serverless không cần quản lý EC2 server và không bị giới hạn timeout 15 phút như Lambda.
- **B:** Sai vì AWS Lambda có giới hạn cứng thời gian chạy tối đa là 15 phút (900 giây), không thể tăng lên 30 phút.
- **C:** Sai vì tự quản lý EC2 và cron job tạo ra gánh nặng vận hành (operational overhead) lớn hơn Fargate.
- **D:** Sai vì API Gateway có timeout tối đa chỉ 29 giây.

</details>

### Câu 2 `medium`

A company is migrating an on-premises Kubernetes cluster with dozens of Helm charts to AWS. The engineering team wants to retain Kubernetes API compatibility and minimize changes to their existing deployment manifests while offloading control plane management to AWS. Which service should they choose?

- **A.** Amazon ECS
- **B.** Amazon EKS
- **C.** AWS App Runner
- **D.** AWS Elastic Beanstalk

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty đang di chuyển một cụm Kubernetes on-premises với hàng chục Helm chart lên AWS. Đội ngũ kỹ sư muốn giữ nguyên khả năng tương thích với Kubernetes API và giảm thiểu thay đổi đối với các deployment manifest hiện có, đồng thời chuyển giao việc quản lý control plane cho AWS. Họ nên chọn dịch vụ nào?

**Đáp án đúng:** **B**

Khi đề bài nhắc tới **Kubernetes, Helm charts, kubectl, hoặc multi-cloud portability** → Đáp án chuẩn là **Amazon EKS**.

- **A:** Sai vì ECS sử dụng Task Definition riêng của AWS, không tương thích trực tiếp với Kubernetes API và Helm charts.
- **B (Đúng):** Đúng! Amazon EKS là dịch vụ Managed Kubernetes giúp chạy Helm charts và Kubernetes manifests hiện có với Control Plane do AWS quản lý.
- **C:** Sai vì App Runner chỉ chạy từng web service đơn lẻ, không hỗ trợ cụm Kubernetes và Helm charts.
- **D:** Sai vì Elastic Beanstalk là PaaS cho ứng dụng web truyền thống, không phải Kubernetes.

</details>

### Câu 3 `medium`

A company currently runs its stateless web application on Amazon EC2 instances with steady baseline usage. Over the next 12 months, the engineering team plans to gradually modernize and migrate the application to AWS Fargate and AWS Lambda. Which purchasing option provides significant cost savings right now while automatically applying to Fargate and Lambda after the migration?

- **A.** EC2 Instance Savings Plans (1-year)
- **B.** Compute Savings Plans (1-year)
- **C.** Standard Reserved Instances (1-year)
- **D.** EC2 Dedicated Hosts

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty hiện đang chạy ứng dụng web không lưu trạng thái (stateless) trên các Amazon EC2 instance với mức sử dụng nền ổn định. Trong 12 tháng tới, đội ngũ kỹ sư dự định từng bước hiện đại hóa và di chuyển ứng dụng sang AWS Fargate và AWS Lambda. Tùy chọn mua hàng nào mang lại mức tiết kiệm chi phí đáng kể ngay bây giờ đồng thời tự động áp dụng cho Fargate và Lambda sau khi di chuyển?

**Đáp án đúng:** **B**

Cứ thấy đề bài nhắc đến việc **chuyển đổi giữa EC2, Fargate và Lambda** mà vẫn muốn giảm giá cam kết → **Compute Savings Plans**.

- **A:** Sai vì EC2 Instance Savings Plans chỉ áp dụng cho một EC2 Instance Family cố định trong một Region, không áp dụng cho Fargate hay Lambda.
- **B (Đúng):** Đúng! **Compute Savings Plans** giảm giá tới 66% và tự động áp dụng linh hoạt cho cả **Amazon EC2, AWS Fargate và AWS Lambda** bất kể thay đổi Region hay Instance Family.
- **C:** Sai vì Standard RI chỉ áp dụng cho EC2, không chuyển sang Fargate hay Lambda được.
- **D:** Sai vì Dedicated Hosts đắt đỏ nhất và chỉ dùng cho BYOL.

</details>

### Câu 4 `medium`

A company runs a steady-state production workload on Amazon EC2 instances 24/7. Over the next 12 months, the engineering team plans to migrate some services from `c5` instances in `us-east-1` to `m6i` instances in `eu-west-1`, and eventually move a portion of the compute to AWS Fargate and AWS Lambda. Which purchasing option provides significant discounts while preserving the flexibility to change instance families, Regions, and compute services?

- **A.** EC2 Instance Savings Plans
- **B.** Standard Reserved Instances (RIs)
- **C.** Compute Savings Plans
- **D.** EC2 Spot Instances

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty chạy workload production ở trạng thái ổn định trên các Amazon EC2 instance 24/7. Trong 12 tháng tới, đội ngũ kỹ sư dự định di chuyển một số dịch vụ từ các `c5` instance tại `us-east-1` sang các `m6i` instance tại `eu-west-1`, và cuối cùng chuyển một phần compute sang AWS Fargate và AWS Lambda. Tùy chọn mua hàng nào mang lại mức chiết khấu đáng kể đồng thời vẫn giữ sự linh hoạt để thay đổi họ instance, Region và dịch vụ compute?

**Đáp án đúng:** **C**

Phân biệt Savings Plans: **Compute Savings Plans** linh hoạt nhất (đổi Region, đổi family, dùng cho cả EC2 + Fargate + Lambda). **EC2 Instance Savings Plans** giảm giá sâu hơn một chút nhưng khóa cố định 1 Region + 1 Instance Family.

- **A:** Sai vì EC2 Instance Savings Plans khóa bạn vào một instance family cụ thể trong một Region cố định và không áp dụng cho Fargate hay Lambda.
- **B:** Sai vì Standard RIs không cho phép đổi Region hay chuyển sang Fargate/Lambda.
- **C (Đúng):** Đúng! Compute Savings Plans giảm giá tới 66% và tự động áp dụng linh hoạt cho mọi instance family, kích thước, hệ điều hành, Region, cũng như cả AWS Fargate và AWS Lambda.
- **D:** Sai vì Spot Instances có thể bị AWS thu hồi với cảnh báo 2 phút, không phù hợp cho steady-state production workload cần chạy liên tục.

</details>

### Câu 5 `medium`

A company runs a production Amazon RDS for PostgreSQL Multi-AZ database (`db.m6i.2xlarge`) 24/7 and expects the workload to remain steady for the next 3 years. Note that Savings Plans do not cover Amazon RDS. Which purchasing option provides the maximum cost savings for this RDS database?

- **A.** Purchase a 3-Year All Upfront Amazon RDS Reserved Instance (RI).
- **B.** Purchase a 3-Year All Upfront Compute Savings Plan.
- **C.** Switch the RDS PostgreSQL instance to EC2 Spot Instances.
- **D.** Disable Multi-AZ deployment in production to cut the instance cost in half.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty vận hành cơ sở dữ liệu production Amazon RDS for PostgreSQL Multi-AZ (`db.m6i.2xlarge`) 24/7 và dự kiến workload sẽ duy trì ổn định trong 3 năm tới. Lưu ý rằng Savings Plans không áp dụng cho Amazon RDS. Tùy chọn mua hàng nào mang lại mức tiết kiệm chi phí tối đa cho cơ sở dữ liệu RDS này?

**Đáp án đúng:** **A**

Điểm hay bẫy trong đề SAA-C03: **Savings Plans** chỉ áp dụng cho EC2, Fargate, Lambda. Với **RDS, ElastiCache, Redshift, OpenSearch** chạy dài hạn ổn định -> Dùng **Reserved Instances (RIs)**.

- **A (Đúng):** Đúng! Amazon RDS không được hỗ trợ bởi Compute Savings Plans, vì vậy để giảm chi phí tối đa cho RDS chạy ổn định 24/7 trong 3 năm, lựa chọn tốt nhất là **RDS Reserved Instance (3-Year All Upfront)** (giảm tới ~60%+).
- **B:** Sai vì Compute Savings Plans chỉ áp dụng cho EC2, Fargate và Lambda — KHÔNG áp dụng cho Amazon RDS.
- **C:** Sai vì Amazon RDS không có mô hình Spot Instances.
- **D:** Sai vì tắt Multi-AZ trên production làm mất High Availability nghiêm trọng.

</details>

### Câu 6 `medium`

A company commits to a consistent $50/hour compute spend over the next 3 years. During this period, the engineering team plans to modernize workloads by migrating from Amazon EC2 instances in `us-east-1` to AWS Fargate and AWS Lambda in `ap-southeast-1`. Which purchasing option provides the HIGHEST savings while automatically applying discounts across these service and Region changes?

- **A.** Standard Amazon EC2 Reserved Instances (RIs)
- **B.** EC2 Instance Savings Plans
- **C.** Compute Savings Plans
- **D.** Amazon EC2 Spot Instances

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty cam kết mức chi tiêu compute ổn định 50 USD/giờ trong 3 năm tới. Trong giai đoạn này, đội ngũ kỹ sư dự định hiện đại hóa các workload bằng cách di chuyển từ các Amazon EC2 instance ở `us-east-1` sang AWS Fargate và AWS Lambda ở `ap-southeast-1`. Tùy chọn mua hàng nào mang lại mức tiết kiệm CAO NHẤT đồng thời tự động áp dụng chiết khấu xuyên suốt các thay đổi về dịch vụ và Region này?

**Đáp án đúng:** **C**

So sánh 2 loại Savings Plans chính:
- **Compute Savings Plans**: Linh hoạt tối đa — đổi Region, đổi Instance Family, chuyển từ **EC2 sang Fargate và Lambda** đều vẫn được hưởng chiết khấu.
- **EC2 Instance Savings Plans**: Chiết khấu cao hơn một chút (tới 72%) nhưng cố định trong 1 Instance Family và 1 Region, chỉ dùng cho EC2.

- **A:** Sai vì Reserved Instances chỉ áp dụng cho EC2 và không tự động chuyển đổi sang AWS Fargate hay AWS Lambda.
- **B:** Sai vì EC2 Instance Savings Plans bị khóa vào một họ instance trong một Region cố định và không áp dụng cho Fargate hay Lambda.
- **C (Đúng):** Đúng! Compute Savings Plans linh hoạt nhất (giảm giá tới 66%): tự động áp dụng xuyên suốt EC2 (mọi họ máy, mọi OS, mọi Region), AWS Fargate và AWS Lambda.
- **D:** Sai vì Spot Instances có thể bị thu hồi bất cứ lúc nào với thông báo trước 2 phút, không phải gói cam kết 3 năm.

</details>

---

[Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md)
