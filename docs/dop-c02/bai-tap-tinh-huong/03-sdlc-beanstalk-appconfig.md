# Bài tập tình huống — Elastic Beanstalk Deployment Policies & AWS AppConfig

> All-at-once, Rolling, Rolling with Additional Batch, Immutable, Traffic Splitting, .ebextensions/Platform Hooks và AWS AppConfig Feature Flags/Validators.
> **Số câu hỏi:** 4 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A product engineering team wants to release dynamic feature flags to a fleet of containerized microservices without redeploying container images. Malformed JSON configurations have previously caused production outages, so any configuration change must be validated against a JSON schema before rollout, deployed gradually over 20 minutes, and automatically rolled back if an Amazon CloudWatch alarm for HTTP 5xx errors enters the ALARM state. Which AWS service meets ALL these requirements with the LEAST custom code?

- **A.** Store feature flags in AWS Systems Manager Parameter Store as a String parameter and poll them every minute from the application.
- **B.** Use AWS AppConfig with a JSON Schema validator, a linear 20-minute deployment strategy, and an attached CloudWatch alarm for rollback.
- **C.** Store feature flags in Amazon DynamoDB with DynamoDB Streams triggering an AWS Lambda function to validate JSON syntax after writes.
- **D.** Use AWS CodeDeploy to push a JSON file to Amazon S3 and configure an EventBridge rule to revert the S3 object version on CloudWatch alarms.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ thuật sản phẩm muốn phát hành các feature flag động tới một đội ngũ microservice chạy container mà không cần triển khai lại container image. Các cấu hình JSON sai định dạng trước đây đã gây ra sự cố production, vì vậy mọi thay đổi cấu hình phải được xác thực với JSON schema trước khi triển khai, triển khai dần trong 20 phút và tự động rollback nếu một Amazon CloudWatch alarm cho lỗi HTTP 5xx chuyển sang trạng thái ALARM. Dịch vụ AWS nào đáp ứng TẤT CẢ các yêu cầu này với ÍT mã tùy chỉnh nhất?

**Đáp án đúng:** **B**

AWS AppConfig là dịch vụ quản lý cấu hình động và feature flags chuẩn trên AWS, cung cấp bộ ba bảo vệ an toàn: Pre-deployment Validation (JSON Schema hoặc Lambda), Controlled Rollout (Linear/Exponential), và Automatic Rollback tích hợp trực tiếp với CloudWatch Alarms.

- **A:** Sai. Parameter Store không có sẵn cơ chế kiểm tra JSON Schema, triển khai từ từ (gradual rollout) hay tự động rollback theo CloudWatch Alarm.
- **B (Đúng):** Chính xác! AWS AppConfig được thiết kế chuyên biệt cho feature flags và dynamic configuration với đầy đủ tính năng: JSON Schema/Lambda Validator, Deployment Strategy (gradual/canary/linear), và tự động rollback dựa trên CloudWatch Alarm.
- **C:** Sai. DynamoDB Streams chỉ chạy SAU khi dữ liệu đã ghi vào bảng (không chặn cấu hình sai từ trước) và không có sẵn gradual deployment hay alarm-based rollback.
- **D:** Sai. CodeDeploy không deploy file trực tiếp vào S3 theo cơ chế feature flag và cách này đòi hỏi nhiều mã nguồn tùy chỉnh.

</details>

### Câu 2 `medium`

A product team uses AWS AppConfig to manage feature flags for a high-traffic checkout service running on Amazon EKS. Compliance requires that every feature flag change deployed to production be automatically archived as a versioned JSON snapshot in a dedicated audit Amazon S3 bucket, and that any deployment causing checkout latency to spike be rolled back automatically within 5 minutes. What is the MOST native and maintainable way to implement this?

- **A.** Deploy a custom Kubernetes CronJob that polls the AWS AppConfig agent every minute and copies the active configuration JSON payload to Amazon S3.
- **B.** Replace AWS AppConfig with AWS Systems Manager Parameter Store SecureString parameters and enable Amazon S3 Event Notifications on updates.
- **C.** Configure an AppConfig Extension (ON_DEPLOYMENT_COMPLETE) to back up to S3, and attach a CloudWatch alarm with a 5-minute bake time.
- **D.** Enable AWS CloudTrail Data Events on AppConfig and query CloudTrail logs with Amazon Athena to reconstruct the JSON configuration snapshot.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm sản phẩm sử dụng AWS AppConfig để quản lý các feature flag cho dịch vụ thanh toán lưu lượng cao chạy trên Amazon EKS. Quy định tuân thủ yêu cầu mọi thay đổi feature flag triển khai lên production phải tự động được lưu trữ dưới dạng bản chụp JSON có phiên bản trong một Amazon S3 bucket kiểm toán chuyên dụng, và bất kỳ lần triển khai nào khiến độ trễ thanh toán tăng vọt phải được tự động rollback trong vòng 5 phút. Cách triển khai NGUYÊN BẢN (native) NHẤT và dễ bảo trì nhất là gì?

**Đáp án đúng:** **C**

AWS AppConfig hỗ trợ Extensions (tích hợp sẵn S3 backup, EventBridge, SNS, SQS, Lambda) tại các lifecycle action points giúp tự động hóa audit/backup, đồng thời hỗ trợ Deployment Strategy + Bake Time + CloudWatch Alarm Rollback để triển khai feature flag an toàn.

- **A:** Sai. Polling định kỳ có thể bỏ sót các thay đổi nhanh giữa hai chu kỳ và tốn công duy trì CronJob.
- **B:** Sai. Parameter Store không có cơ chế gradual deployment strategy, bake time hay auto-rollback theo CloudWatch Alarm như AppConfig.
- **C (Đúng):** Chính xác! AWS AppConfig Extensions cho phép gắn các hành động mở rộng (bao gồm AWS-authored extension S3 backup hoặc Lambda/EventBridge/SNS) tại các điểm vòng đời như ON_DEPLOYMENT_COMPLETE. Kết hợp CloudWatch Alarm gắn vào AppConfig Environment cùng bake time 5 phút sẽ tự động rollback nếu latency tăng vọt.
- **D:** Sai. CloudTrail ghi lại metadata API call, không lưu trực tiếp toàn bộ nội dung payload cấu hình thành file JSON snapshot trong S3.

</details>

### Câu 3 `medium`

A microservices application running on AWS Lambda and Amazon ECS reads dynamic feature flags and rate-limit JSON configurations from AWS AppConfig. Recently, an engineer accidentally deployed a malformed configuration with a negative rate limit that crashed several pods, and calling the AppConfig Data API directly on every HTTP request caused elevated latency and high API request costs. Which combination of AWS AppConfig capabilities solves BOTH problems?

- **A.** Attach a JSON Schema/Lambda validator to the AppConfig Profile and use the AppConfig Agent (Lambda Extension/ECS sidecar) to cache locally.
- **B.** Store the JSON configuration in an Amazon S3 bucket and have every AWS Lambda invocation download the file directly from S3.
- **C.** Enable CloudWatch Logs Metric Filters to alert after ECS pods crash and increase AWS Lambda memory allocation to 10 GB.
- **D.** Disable AWS AppConfig deployment strategies and distribute updated application configurations using EC2 User Data bootstrap scripts.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng microservice chạy trên AWS Lambda và Amazon ECS đọc các feature flag động và cấu hình giới hạn tốc độ JSON từ AWS AppConfig. Gần đây, một kỹ sư vô tình triển khai một cấu hình sai định dạng với giới hạn tốc độ âm làm sập nhiều pod, và việc gọi trực tiếp AppConfig Data API trên mỗi HTTP request gây ra độ trễ tăng cao cùng chi phí gọi API lớn. Sự kết hợp các tính năng AWS AppConfig nào giải quyết CẢ HAI vấn đề?

**Đáp án đúng:** **A**

AWS AppConfig kết hợp Validators (JSON Schema/Lambda) để chặn cấu hình lỗi trước khi phát hành và AppConfig Agent (Lambda Extension / ECS sidecar) để cache cấu hình cục bộ, tối ưu hiệu năng và chi phí ở quy mô lớn.

- **A (Đúng):** Chính xác! AppConfig Validators (JSON Schema hoặc Lambda function) kiểm tra cú pháp và logic nghiệp vụ (như rate limit > 0) trước khi cho phép deploy. AWS AppConfig Agent (chạy dạng Lambda Extension hoặc ECS sidecar) cache cấu hình tại bộ nhớ cục bộ (localhost) và tự động poll ngầm, giảm mạnh độ trễ và chi phí gọi API.
- **B:** Sai. Tải file từ S3 ở mọi invocation tăng độ trễ và chi phí, đồng thời không có cơ chế validator tự động hay rollout kiểm soát như AppConfig.
- **C:** Sai. Chỉ cảnh báo sau khi pod đã crash không ngăn được cấu hình lỗi ngay từ đầu, và tăng RAM Lambda không giảm chi phí gọi AppConfig API lặp lại.
- **D:** Sai. EC2 User Data không áp dụng cho Lambda/ECS và không hỗ trợ cập nhật cấu hình động không cần khởi động lại ứng dụng.

</details>

### Câu 4 `medium`

A product team wants to roll out a new recommendation algorithm toggle (feature flag) to 20% of production users gradually over 30 minutes without redeploying the ECS containers. If a CloudWatch alarm for API 5xx errors triggers during the rollout, the configuration change must automatically roll back. Which AWS service meets these requirements with the LEAST effort?

- **A.** Store the feature flag JSON in AWS Systems Manager Parameter Store and configure an ECS rolling update every time the parameter changes.
- **B.** Use AWS Secrets Manager with a custom AWS Lambda rotation function to incrementally update the feature flag payload every 30 minutes.
- **C.** Configure AWS CodeDeploy with an ECS Blue/Green deployment strategy triggered by an Amazon EventBridge rule and CloudWatch alarms.
- **D.** Use AWS AppConfig with a Feature Flags profile, a Linear deployment strategy, and an attached CloudWatch alarm for rollback.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm sản phẩm muốn triển khai dần một công tắc thuật toán gợi ý mới (feature flag) cho 20% người dùng production trong vòng 30 phút mà không cần triển khai lại các container ECS. Nếu một CloudWatch alarm cho lỗi API 5xx kích hoạt trong quá trình triển khai, thay đổi cấu hình phải tự động rollback. Dịch vụ AWS nào đáp ứng các yêu cầu này với ÍT nỗ lực nhất?

**Đáp án đúng:** **D**

AWS AppConfig (một khả năng của Systems Manager) là giải pháp tiêu chuẩn để quản lý Feature Flags và cấu hình ứng dụng động với cơ chế kiểm tra tính hợp lệ (Validators), triển khai từng bước (Linear/Exponential) và tự động rollback qua CloudWatch Alarms.

- **A:** Sai. Yêu cầu là không redeploy ECS container; hơn nữa Parameter Store không có sẵn cơ chế rollout dần theo phần trăm hay tự động rollback bằng CloudWatch Alarm.
- **B:** Sai. Secrets Manager dùng để lưu và xoay vòng mật khẩu/khóa bí mật, không phù hợp cho feature flag rollout.
- **C:** Sai. CodeDeploy Blue/Green sẽ phải khởi tạo lại toàn bộ ECS task set mới, vi phạm yêu cầu không redeploy container.
- **D (Đúng):** Chính xác! AWS AppConfig được thiết kế chuyên biệt để triển khai Feature Flags và cấu hình động tách biệt khỏi deploy code, hỗ trợ validator, rollout dần dần và tự động rollback khi CloudWatch Alarm kích hoạt.

</details>

---

[Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md)
