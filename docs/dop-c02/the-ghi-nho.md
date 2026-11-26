# Thẻ ghi nhớ (Flashcards) — DOP-C02

> 42 thẻ · Đọc mặt trước, tự trả lời rồi mở đáp án.

## CI/CD Pipelines Đa tài khoản: CodeBuild, CodeArtifact & CodePipeline

**1. CodeBuild đặt trong VPC không tải được package từ internet dù đã gán vào Public Subnet. Nguyên nhân và cách sửa?**

<details><summary>Xem đáp án</summary>

CodeBuild không gán Public IP cho ENI của nó nên **không thể đi thẳng ra Internet Gateway từ Public Subnet**. Phải cấu hình `VpcConfig` đặt CodeBuild vào **Private Subnets** có route mặc định (`0.0.0.0/0`) trỏ qua **NAT Gateway**.

</details>

**2. Tại sao Cross-Account AWS CodePipeline thường bị lỗi AccessDenied khi đọc Artifact S3 Bucket dù Bucket Policy và IAM Role đã cấu hình đúng?**

<details><summary>Xem đáp án</summary>

Vì S3 Artifact Bucket đang dùng AWS Managed KMS Key (`aws/s3`), vốn không thể chỉnh sửa Key Policy để chia sẻ cross-account. Phải chuyển sang **Customer Managed KMS Key (CMK)** và cấp quyền `kms:Decrypt` cho Cross-Account Deploy Role.

</details>

## CodeDeploy Chuyên sâu: EC2, ECS Blue/Green & Lambda Canary

**3. Sự khác biệt về các Lifecycle Hooks có thể gắn script trong AWS CodeDeploy giữa EC2 (không ELB), ECS (Blue/Green) và AWS Lambda là gì?**

<details><summary>Xem đáp án</summary>

- **EC2 (không ELB)**: `ApplicationStop`, `BeforeInstall`, `AfterInstall`, `ApplicationStart`, `ValidateService` (`DownloadBundle` & `Install` là reserved).
- **ECS Blue/Green**: `BeforeInstall`, `AfterInstall`, `AfterAllowTestTraffic`, `BeforeAllowTraffic`, `AfterAllowTraffic` (chạy Lambda).
- **AWS Lambda**: Chỉ có `BeforeAllowTraffic` và `AfterAllowTraffic` (chạy Lambda).

</details>

**4. Trên EC2 CodeDeploy, nếu bản deploy cũ có lỗi trong script `ApplicationStop` khiến mọi bản deploy mới đều fail ngay bước đầu tiên, cách khắc phục nhanh nhất là gì?**

<details><summary>Xem đáp án</summary>

Vì `ApplicationStop` luôn chạy script được cache từ **revision trước đó**, hãy tạo deployment mới với tùy chọn **`ignoreApplicationStopFailures: true`** (CLI `--ignore-application-stop-failures`) để bỏ qua lỗi của `ApplicationStop` cũ và tiến hành cài revision mới đã sửa lỗi.

</details>

**5. Trong CodeDeploy cho AWS Lambda hoặc ECS Blue/Green, điều gì xảy ra nếu Lifecycle Hook Lambda không gọi `codedeploy:PutLifecycleEventHookExecutionStatus`?**

<details><summary>Xem đáp án</summary>

Deployment sẽ bị treo (hang) cho đến khi hết timeout (tối đa 1 giờ) rồi tự động thất bại và **rollback**. Hook Lambda bắt buộc phải gọi API này (và có quyền IAM tương ứng) với trạng thái `Succeeded` hoặc `Failed`.

</details>

**6. Thứ tự chuẩn của các Lifecycle Event Hooks trong `appspec.yml` khi deploy EC2 In-Place là gì?**

<details><summary>Xem đáp án</summary>

`ApplicationStop` → `DownloadBundle` → `BeforeInstall` → `Install` → `AfterInstall` → `ApplicationStart` → `ValidateService`.

</details>

## Elastic Beanstalk Deployment Policies & AWS AppConfig

**7. Khi nào nên chọn AWS AppConfig thay vì SSM Parameter Store để quản lý cấu hình và Feature Flags?**

<details><summary>Xem đáp án</summary>

Khi cần triển khai **Feature Flags / cấu hình động** tách biệt khỏi code deploy, có kiểm tra hợp lệ trước khi phát hành (**Validators**), rollout dần dần (**Linear/Exponential**) và **tự động rollback** bằng CloudWatch Alarms.

</details>

## CloudFormation Chuyên sâu: StackSets, Drift & Custom Resources

**8. Phân biệt tác dụng của CloudFormation **Stack Policy**, **`DeletionPolicy`**, **`UpdateReplacePolicy`** và **Termination Protection**?**

<details><summary>Xem đáp án</summary>

- **Stack Policy**: Chặn vô tình `Update`/`Replace` resource trong lúc **Update Stack** (KHÔNG chặn Delete Stack).
- **DeletionPolicy**: Quyết định giữ/snapshot/xóa resource khi **Delete Stack** hoặc xóa resource khỏi template.
- **UpdateReplacePolicy**: Quyết định giữ/snapshot/xóa resource cũ khi Update gây **Replacement**.
- **Termination Protection**: Chặn hoàn toàn lệnh **Delete Stack**.

</details>

**9. Điều gì xảy ra nếu một AWS CloudFormation Custom Resource (Lambda-backed) gặp unhandled exception và không gửi phản hồi về `ResponseURL`?**

<details><summary>Xem đáp án</summary>

CloudFormation Stack sẽ bị **treo (hang) ở trạng thái `CREATE_IN_PROGRESS` / `UPDATE_IN_PROGRESS` / `DELETE_IN_PROGRESS` trong đúng 1 giờ** trước khi timeout và rollback. Bắt buộc bọc logic trong `try/except` và gọi `cfnresponse.send(..., cfnresponse.FAILED)` ngay khi có lỗi.

</details>

**10. Khi nào chọn **CloudFormation Guard (`cfn-guard`)** và khi nào chọn **CloudFormation Hooks** để kiểm soát tuân thủ IaC?**

<details><summary>Xem đáp án</summary>

- **`cfn-guard`**: Chạy ở bước **CI/CD (CodeBuild/local)** để phát hiện vi phạm sớm (shift-left) trước khi gọi AWS API.
- **CloudFormation Hooks (`FailureMode: FAIL`)**: Chạy **server-side bên trong dịch vụ CloudFormation** để ép buộc chặn mọi thao tác tạo/cập nhật không tuân thủ, kể cả khi kỹ sư deploy thủ công bỏ qua pipeline.

</details>

**11. Khác biệt cốt lõi giữa CloudFormation StackSets **Service-Managed** và **Self-Managed** permissions?**

<details><summary>Xem đáp án</summary>

**Service-Managed** tích hợp chặt với AWS Organizations OU, tự tạo/quản lý IAM roles và hỗ trợ **Auto-deployment** (tự deploy vào account mới join OU). **Self-Managed** phải tự tạo Administration/Execution roles và không có auto-deployment theo OU.

</details>

**12. Làm thế nào để CloudFormation đợi quá trình cài đặt phần mềm trong EC2 User Data hoàn tất thành công mới báo `CREATE_COMPLETE` (và rollback nếu lỗi)?**

<details><summary>Xem đáp án</summary>

Gắn **`CreationPolicy` (`ResourceSignal` với `Count` và `Timeout`)** vào tài nguyên EC2/ASG, chạy `cfn-init` và gọi **`/opt/aws/bin/cfn-signal -e $?`** ở cuối User Data.

</details>

**13. Khi nào dùng CloudFormation **Nested Stacks** và khi nào dùng **Cross-Stack References** (`Export` / `Fn::ImportValue`)?**

<details><summary>Xem đáp án</summary>

- **Nested Stacks**: Tái sử dụng mẫu kiến trúc con trong **cùng một vòng đời** Parent Stack.
- **Cross-Stack References**: Tách biệt tầng hạ tầng có **vòng đời độc lập** (VD: Network Stack và App Stack). Lưu ý: không xóa/sửa được `Export` khi còn stack đang import.

</details>

## Systems Manager Suite & EC2 Image Builder

**14. Phân biệt mục đích sử dụng của **SSM State Manager**, **SSM Patch Manager** và **EC2 Image Builder**?**

<details><summary>Xem đáp án</summary>

- **State Manager**: Chạy định kỳ duy trì cấu hình mong muốn (anti-drift).
- **Patch Manager**: Vá OS tự động theo Patch Baselines, Patch Groups và Maintenance Windows.
- **EC2 Image Builder**: Tự động build, test và phân phối **Golden AMI** đa tài khoản/vùng để giảm boot time.

</details>

## EC2 Auto Scaling Nâng cao, Warm Pools & Lifecycle Hooks

**15. Sự khác biệt giữa **ASG Warm Pools** (`Stopped` / `Hibernated`) và **ASG Lifecycle Hooks** (`Pending:Wait`) là gì?**

<details><summary>Xem đáp án</summary>

- **Warm Pools**: Giữ sẵn các instance **đã khởi tạo xong từ trước** ở trạng thái `Stopped`/`Hibernated` để giảm mạnh thời gian scale-out khi có **traffic spike đột ngột**.
- **Lifecycle Hooks**: **Tạm dừng** một instance đang trong quá trình launch (`Pending:Wait`) hoặc terminate (`Terminating:Wait`) để chạy tác vụ tùy chỉnh (tải log, drain job, cài cấu hình ngoài) rồi mới chuyển trạng thái.

</details>

**16. Phân biệt khi nào dùng Auto Scaling **Predictive Scaling** vs **Warm Pools**?**

<details><summary>Xem đáp án</summary>

- **Predictive Scaling**: Dùng ML dự đoán và scale out trước cho lưu lượng có **tính chu kỳ lặp lại** (ngày/tuần).
- **Warm Pools**: Giữ sẵn instance đã khởi tạo xong ở trạng thái `Stopped`/`Hibernated` cho ứng dụng **boot lâu** gặp **traffic spike đột ngột không dự đoán trước**.

</details>

**17. Quy trình chuẩn để upload log cuối cùng hoặc drain job nền trước khi Auto Scaling Group terminate EC2 instance?**

<details><summary>Xem đáp án</summary>

Gắn **ASG Lifecycle Hook (`EC2_INSTANCE_TERMINATING`)** → **EventBridge** kích hoạt Lambda/SSM Run Command thực hiện tác vụ (gia hạn bằng `RecordLifecycleActionHeartbeat` nếu cần) → gọi **`autoscaling:CompleteLifecycleAction`**.

</details>

## Multi-Region Disaster Recovery, AWS Backup & Chaos Engineering (FIS)

**18. Làm sao để Amazon Route 53 Health Check giám sát sức khỏe của một dịch vụ nằm hoàn toàn trong **Private Subnet** (không có Public IP)?**

<details><summary>Xem đáp án</summary>

Route 53 public health checkers không thể gọi vào Private IP. Giải pháp chuẩn: đẩy custom metric về **Amazon CloudWatch**, tạo **CloudWatch Alarm**, sau đó tạo **Route 53 Health Check theo dõi trạng thái CloudWatch Alarm** đó.

</details>

**19. Cơ chế an toàn bắt buộc trong **AWS Fault Injection Service (FIS)** để ngăn thí nghiệm Chaos Engineering làm sập hệ thống production là gì?**

<details><summary>Xem đáp án</summary>

Cấu hình **Stop Conditions** gắn với **CloudWatch Alarms** (VD: tỷ lệ lỗi 5xx hoặc latency vượt ngưỡng). Khi bất kỳ Alarm nào chuyển sang trạng thái `ALARM`, FIS sẽ **dừng ngay lập tức thí nghiệm** và thực hiện rollback action (nếu được hỗ trợ).

</details>

**20. Tại sao **AWS Global Accelerator** vượt trội hơn Route 53 Failover trong một số kịch bản Multi-Region DR?**

<details><summary>Xem đáp án</summary>

Global Accelerator cung cấp **2 static Anycast IP** (dễ whitelist firewall) và chuyển hướng traffic sang Region khỏe mạnh trong **< 30 giây** mà **không bị ảnh hưởng bởi DNS TTL caching** của client/ISP.

</details>

**21. Cơ chế an toàn bắt buộc phải cấu hình trong **AWS Fault Injection Service (FIS)** Experiment Template là gì?**

<details><summary>Xem đáp án</summary>

**Stop Conditions** gắn với **CloudWatch Alarms**. Khi alarm chuyển sang trạng thái `ALARM` (vượt ngưỡng lỗi cho phép), FIS lập tức dừng thí nghiệm và khôi phục trạng thái hệ thống.

</details>

## CloudWatch Logs, Metric Filters, Synthetics & OpenSearch

**22. Để gom log thời gian thực (real-time) từ hàng trăm AWS Accounts về một **Kinesis Data Stream** hoặc **Firehose** ở Logging Account trung tâm bằng CloudWatch Logs Subscription Filter, thành phần trung gian bắt buộc phải tạo ở Logging Account là gì?**

<details><summary>Xem đáp án</summary>

Phải tạo một **CloudWatch Logs Destination** (`AWS::Logs::Destination`) ở Logging Account kèm theo **Destination Access Policy** cho phép các Source Accounts (`aws:PrincipalOrgID`) gọi `logs:PutSubscriptionFilter`, và gắn IAM Role cho phép CloudWatch Logs ghi vào Kinesis Stream/Firehose.

</details>

**23. Phân biệt khi nào dùng **CloudWatch Metric Filter**, **CloudWatch Logs Insights** và **Embedded Metric Format (EMF)**?**

<details><summary>Xem đáp án</summary>

- **Metric Filter**: Trích xuất số đếm/giá trị đơn giản từ text log thành CloudWatch Metric để tạo Alarm.
- **Logs Insights**: Truy vấn ad-hoc, phân tích/tổng hợp log phức tạp theo yêu cầu (không dùng trực tiếp cho real-time alarm).
- **EMF**: Ghi log JSON chuẩn hóa (VD từ Lambda/ECS) để CloudWatch **tự động trích xuất Custom Metric tốc độ cao** mà không tốn API call `PutMetricData` và vẫn giữ log ngữ cảnh có độ phân giải cao.

</details>

**24. Làm thế nào để giám sát **end-to-end API/UI checkout flow** từ góc nhìn người dùng thật mỗi 5 phút và chụp lại screenshot/HAR file khi lỗi ngay cả khi không có traffic người dùng?**

<details><summary>Xem đáp án</summary>

Dùng **Amazon CloudWatch Synthetics Canaries** (chạy script Node.js/Python bằng Puppeteer/Playwright theo lịch định kỳ), lưu screenshot/HAR logs vào S3 và kích hoạt **CloudWatch Alarm** khi canary fail.

</details>

**25. Tại sao nên dùng **CloudWatch Embedded Metric Format (EMF)** thay vì gọi `PutMetricData` từ AWS Lambda hiệu năng cao?**

<details><summary>Xem đáp án</summary>

EMF chỉ cần ghi log JSON chuẩn ra stdout; CloudWatch tự động trích xuất thành Custom Metrics **bất đồng bộ**, giúp loại bỏ độ trễ mạng đồng bộ và tránh lỗi **throttling** của API `PutMetricData`.

</details>

**26. Phân biệt **CloudWatch Synthetics Canaries** và **CloudWatch RUM (Real User Monitoring)**?**

<details><summary>Xem đáp án</summary>

- **Synthetics Canaries**: Giả lập user bằng script chạy định kỳ 24/7 (kể cả khi không có user thật) để kiểm tra API, UI, SSL và chụp screenshot lỗi.
- **RUM**: Đo hiệu năng và lỗi JS thực tế từ trình duyệt của người dùng đang truy cập.

</details>

**27. Kiến trúc gom log thời gian thực đa tài khoản vào S3 để truy vấn SQL chi phí thấp nhất là gì?**

<details><summary>Xem đáp án</summary>

Member Account **CloudWatch Logs Subscription Filter** → Central Account **CloudWatch Logs Destination** → **Amazon Data Firehose** (chuyển JSON sang **Parquet** + phân vùng ngày) → **S3** → **Amazon Athena**.

</details>

## Cross-Account Observability (OAM), AWS X-Ray & ADOT

**28. Trong **AWS X-Ray**, khác biệt giữa **Annotations** và **Metadata** là gì?**

<details><summary>Xem đáp án</summary>

- **Annotations**: Các cặp key-value **được đánh index**, dùng để lọc và tìm kiếm trace (filter expressions, VD: `OrderId`).
- **Metadata**: Dữ liệu bổ sung **không được đánh index**, chỉ dùng để xem chi tiết khi debug.

</details>

## Event-Driven Ops: EventBridge, SQS DLQ & AWS Health

**29. Làm sao tránh tình trạng **Alarm Storm (bão cảnh báo)** khi 1 sự cố gốc (VD: RDS chậm) kéo theo hàng loạt CloudWatch Alarms của EC2, ALB và Lambda cùng kêu?**

<details><summary>Xem đáp án</summary>

Dùng **CloudWatch Composite Alarms** kết hợp nhiều child alarms bằng biểu thức logic (`AND`, `OR`, `NOT`) và thiết lập **Alarm Suppression** (chỉ gửi thông báo khi Composite Alarm kích hoạt thay vì từng child alarm riêng lẻ).

</details>

**30. Khi nào dùng **SSM State Manager**, **SSM Run Command**, **SSM Distributor** và **SSM Patch Manager**?**

<details><summary>Xem đáp án</summary>

- **Run Command**: Chạy lệnh ad-hoc 1 lần trên nhiều instance.
- **State Manager**: Chạy định kỳ duy trì cấu hình chuẩn (anti-drift).
- **Distributor**: Đóng gói & phân phối custom software/agent nội bộ.
- **Patch Manager**: Vá OS/app tự động theo Patch Baselines, tag `Patch Group` và Maintenance Windows.

</details>

**31. Làm thế nào để chống **Alarm Storm (Alert Fatigue)** khi một sự cố gốc làm hàng loạt CloudWatch Alarm kích hoạt cùng lúc?**

<details><summary>Xem đáp án</summary>

Dùng **CloudWatch Composite Alarms** kết hợp nhiều alarm con bằng toán tử logic (`AND`, `OR`, `NOT`), tắt thông báo ở các alarm con, và dùng **`ActionsSuppressor`** để tạm tắt cảnh báo trong Maintenance Window.

</details>

**32. Phân biệt CloudWatch EC2 Alarm Action **Recover** và **Reboot**?**

<details><summary>Xem đáp án</summary>

- **Recover** (dùng cho `StatusCheckFailed_System` - lỗi phần cứng AWS): Di chuyển EC2 sang phần cứng khỏe mạnh, giữ nguyên Instance ID, Private/Elastic IP và EBS.
- **Reboot** (dùng cho `StatusCheckFailed_Instance` - lỗi OS/kernel): Khởi động lại hệ điều hành.

</details>

**33. Cách hiệu quả nhất để xử lý lại các message lỗi trong **SQS Dead-Letter Queue (DLQ)** sau khi đã vá bug consumer?**

<details><summary>Xem đáp án</summary>

Sử dụng tính năng **SQS DLQ Redrive** (`StartMessageMoveTask`) để đẩy ngược message từ DLQ về Source Queue mà không cần viết script, kết hợp CloudWatch Alarm trên `ApproximateNumberOfMessagesVisible > 0`.

</details>

## Auto-Remediation, SSM Automation & Incident Manager

**34. Sự khác biệt giữa **AWS Systems Manager OpsCenter** và **SSM Incident Manager**?**

<details><summary>Xem đáp án</summary>

- **OpsCenter**: Gom các vấn đề vận hành thường ngày thành **OpsItems** kèm SSM Automation Runbook để xử lý.
- **Incident Manager**: Dành cho **sự cố khẩn cấp (Critical/P1)** — tự động kích hoạt **Response Plan**, gọi điện/SMS theo **On-call Escalation Plan**, mở phòng chat Slack/Teams (AWS Chatbot) và tạo **Post-Incident Analysis (COE)**.

</details>

**35. Khác biệt giữa **SSM Incident Manager** và **SSM OpsCenter**?**

<details><summary>Xem đáp án</summary>

- **SSM Incident Manager**: Xử lý sự cố nghiêm trọng (P1/P2) với Response Plans, On-Call Contacts & Escalation Plans, Slack/Teams chat và **Post-Incident Analysis**.
- **SSM OpsCenter**: Gom các vấn đề vận hành thường ngày thành **OpsItems** kèm ngữ cảnh AWS và Runbooks.

</details>

## Tuân thủ Tự động: AWS Config, Organizations SCP & Control Tower

**36. Quy trình tự động khắc phục (Auto-Remediation) khi kỹ sư vô tình mở Security Group `0.0.0.0/0` port 22 trên toàn AWS Organization?**

<details><summary>Xem đáp án</summary>

Triển khai **AWS Config Organization Managed Rule** (`restricted-ssh`) kết hợp **AWS Config Auto-Remediation** gọi **SSM Automation Document** (VD: `AWS-DisableIncomingSSHOnPort22`) để tự động gỡ rule vi phạm ngay khi phát hiện `NON_COMPLIANT`.

</details>

**37. Sự khác biệt cốt lõi giữa **AWS Organizations SCP (Service Control Policy)** và **AWS Config Rules**?**

<details><summary>Xem đáp án</summary>

- **SCP**: **Preventive Guardrail** (chặn từ đầu ở tầng IAM/API, không cho phép tạo tài nguyên vi phạm ngay cả với Admin của Member Account; **không ảnh hưởng Management Account**).
- **AWS Config**: **Detective Guardrail** (phát hiện tài nguyên sai chuẩn sau khi đã tạo/sửa và hỗ trợ Auto-Remediation).

</details>

**38. Trong **AWS Backup Vault Lock**, chế độ **Compliance Mode** khác gì **Governance Mode** để chống Ransomware xóa bản sao lưu?**

<details><summary>Xem đáp án</summary>

- **Governance Mode**: Người dùng có quyền IAM đặc biệt vẫn có thể xóa/tắt lock.
- **Compliance Mode**: Sau khi hết thời gian **Cooling-off Period** (tối thiểu 3 ngày), **không một ai (kể cả AWS Root User hay AWS Support)** có thể xóa recovery point hoặc giảm retention cho đến khi hết hạn (WORM tuyệt đối).

</details>

**39. Phân biệt **Preventive Guardrails (SCP)** và **Detective/Responsive Guardrails (AWS Config + SSM Automation)**?**

<details><summary>Xem đáp án</summary>

- **SCP**: Chặn tuyệt đối hành động API trước khi xảy ra (kể cả Admin ở Member Account, nhưng không áp dụng cho Management Account).
- **AWS Config + SSM**: Phát hiện tài nguyên vi phạm cấu hình sau khi tạo và tự động chạy Runbook khắc phục.

</details>

**40. Làm thế nào để đảm bảo chỉ những gói Lambda đã được build và ký bởi CI/CD chính thức mới được phép triển khai lên Production?**

<details><summary>Xem đáp án</summary>

Ký số deployment package bằng **AWS Signer** trong bước build và gắn **Lambda Code Signing Configuration** với chính sách `UntrustedArtifactOnDeployment: Enforce` trên Production.

</details>

## DevSecOps, Bảo mật Dữ liệu & Phát hiện Mối đe dọa

**41. Cần bật những tính năng nào để CloudTrail Audit Logs toàn Organization không thể bị sửa đổi hoặc xóa ngay cả bởi Root User trong 7 năm?**

<details><summary>Xem đáp án</summary>

Tạo **Organization Trail** đẩy về S3 ở **Log Archive Account**, mã hóa **KMS CMK**, bật **CloudTrail Log File Validation** (SHA-256 hash) và bật **S3 Object Lock ở chế độ Compliance Mode** (retention 7 năm).

</details>

**42. Dịch vụ nào giúp tự động sinh **Least-Privilege IAM Policy** từ lịch sử CloudTrail và phát hiện S3/KMS chia sẻ ngoài Organization?**

<details><summary>Xem đáp án</summary>

**AWS IAM Access Analyzer** (tính năng Policy Generation đọc tối đa 90 ngày CloudTrail logs, cùng External Access Analyzer ở cấp Organization).

</details>

---

[Mục lục DOP-C02](00-tong-quan-va-lo-trinh-dop-c02.md)
