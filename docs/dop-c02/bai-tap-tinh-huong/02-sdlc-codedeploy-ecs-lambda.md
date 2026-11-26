# Bài tập tình huống — CodeDeploy Chuyên sâu: EC2, ECS Blue/Green & Lambda Canary

> AppSpec.yml, Lifecycle Event Hooks (BeforeAllowTraffic, AfterAllowTraffic), PutLifecycleEventHookExecutionStatus, Traffic Shifting và Auto Rollback.
> **Số câu hỏi:** 9 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

An enterprise operates a centralized CI/CD Shared Services account running AWS CodePipeline that builds container images and deploys them to an Amazon ECS cluster in a separate Production account using AWS CodeDeploy. The S3 artifact bucket in the Shared Services account is encrypted with a Customer Managed KMS key (CMK). Which TWO configurations are required to allow the Production account deployment role to successfully execute the deploy stage? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Configure an S3 Cross-Region Replication rule to copy build artifacts from the Shared Services bucket to a new S3 bucket in the Production account.
- **B.** Update the Shared Services S3 artifact bucket policy to grant s3:GetObject, s3:GetObjectVersion, and s3:ListBucket to the Production role.
- **C.** Replace the Customer Managed KMS key with the AWS managed key (aws/s3) so cross-account IAM policies automatically grant decryption access.
- **D.** Create a VPC peering connection between the Shared Services VPC and the Production VPC to route CodePipeline artifact traffic privately.
- **E.** Update the Shared Services CMK key policy to grant kms:Decrypt and kms:DescribeKey permissions to the Production deployment role.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp vận hành một tài khoản Shared Services CI/CD tập trung chạy AWS CodePipeline để build container image và triển khai chúng lên cụm Amazon ECS trong một tài khoản Production riêng biệt bằng AWS CodeDeploy. S3 artifact bucket trong tài khoản Shared Services được mã hóa bằng Customer Managed KMS key (CMK). Cần HAI cấu hình nào để cho phép deployment role của tài khoản Production thực thi thành công giai đoạn deploy? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, E**

Cross-Account CodePipeline yêu cầu phân quyền đồng bộ ở cả 3 lớp: (1) S3 Bucket Policy cấp quyền đọc cho target account role, (2) KMS CMK Key Policy cấp quyền kms:Decrypt cho target account role, và (3) Trust Policy của target role cho phép Pipeline service role thực hiện sts:AssumeRole.

- **A:** Sai. CodePipeline hỗ trợ truy cập trực tiếp artifact bucket cross-account, không cần sao chép S3 sang tài khoản Production.
- **B (Đúng):** Chính xác! Trong mô hình Cross-Account CodePipeline, S3 Bucket Policy tại tài khoản Shared Services phải cấp quyền đọc object cho IAM Role ở tài khoản Production.
- **C:** Sai. AWS managed key (aws/s3) không cho phép sửa Key Policy để chia sẻ cross-account; bắt buộc phải dùng CMK.
- **D:** Sai. CodePipeline và S3 giao tiếp qua AWS API endpoints, không yêu cầu VPC peering để thực hiện cross-account deployment.
- **E (Đúng):** Chính xác! Vì artifact được mã hóa bằng Customer Managed KMS Key (CMK), Key Policy bắt buộc phải cho phép Production deployment role giải mã (kms:Decrypt) thì mới đọc được artifact.

</details>

### Câu 2 `hard`

A DevOps engineer is implementing Blue/Green deployments for an Amazon ECS service using AWS CodeDeploy and an Application Load Balancer (ALB). Before shifting any live production traffic to the replacement (Green) task set, the team must run automated end-to-end integration tests against the Green tasks via an ALB test listener on port 8443. If any test fails, the deployment must abort immediately without impacting production users. Additionally, after production traffic shifts to Green, the Blue task set must remain running for 30 minutes to allow instant rollback. How should the engineer configure CodeDeploy?

- **A.** Configure a Lambda validation function in the AfterAllowTestTraffic hook in appspec.yml to test port 8443, and set task termination wait to 30 minutes.
- **B.** Configure a Lambda validation function in the BeforeAllowTraffic hook in appspec.yml and set the original task set termination wait time to 30 minutes.
- **C.** Configure a Lambda validation function in the AfterAllowTraffic hook in appspec.yml to test port 8443, and enable AutoRollback on deployment failure.
- **D.** Use an ECS rolling update deployment controller with minimumHealthyPercent set to 100 and maximumPercent set to 200, and run tests in CodeBuild.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư DevOps đang triển khai Blue/Green deployment cho một Amazon ECS service bằng AWS CodeDeploy và Application Load Balancer (ALB). Trước khi chuyển bất kỳ lưu lượng production thực tế nào sang tập task thay thế (Green), nhóm phải chạy các bài kiểm thử tích hợp đầu cuối (end-to-end) tự động đối với các task Green thông qua ALB test listener trên port 8443. Nếu bất kỳ bài kiểm thử nào thất bại, quá trình triển khai phải hủy ngay lập tức mà không ảnh hưởng đến người dùng production. Ngoài ra, sau khi lưu lượng production chuyển sang Green, tập task Blue phải tiếp tục chạy trong 30 phút để cho phép rollback tức thì. Kỹ sư nên cấu hình CodeDeploy như thế nào?

**Đáp án đúng:** **A**

Với Amazon ECS Blue/Green trên AWS CodeDeploy, hook AfterAllowTestTraffic là điểm lý tưởng để kiểm thử Green task set qua ALB test listener trước khi production traffic được chuyển sang. Thời gian chờ hủy Blue task set (TerminationWaitTime) cho phép giữ nguyên môi trường cũ để rollback ngay lập tức nếu phát hiện lỗi hậu triển khai.

- **A (Đúng):** Chính xác! Thứ tự hook của ECS Blue/Green là BeforeInstall -> AfterInstall -> AfterAllowTestTraffic -> BeforeAllowTraffic -> AfterAllowTraffic. Sau khi ALB test listener (port 8443) đã trỏ vào Green target group, AfterAllowTestTraffic sẽ chạy integration test. Nếu thất bại, CodeDeploy dừng deploy mà production không bị ảnh hưởng. Cài đặt TerminationWaitTime là 30 phút giữ Blue task set sẵn sàng để rollback tức thì.
- **B:** Sai. Hook BeforeAllowTraffic chạy trước khi chuyển traffic vào test listener lẫn production listener, nên lúc này test listener trên port 8443 chưa định tuyến tới Green task set.
- **C:** Sai. AfterAllowTraffic chỉ chạy sau khi production traffic đã chuyển sang Green, không đáp ứng yêu cầu kiểm thử trước khi chuyển traffic thật.
- **D:** Sai. ECS rolling update không hỗ trợ ALB test listener riêng biệt hay giữ nguyên Blue task set trong 30 phút để rollback tức thì như CodeDeploy Blue/Green.

</details>

### Câu 3 `hard`

A DevOps engineer updates the scripts/stop_server.sh script referenced by the ApplicationStop lifecycle hook in appspec.yml for an Amazon EC2 in-place deployment using AWS CodeDeploy. The previous revision had a bug in stop_server.sh that caused a non-zero exit code. When the engineer deploys the new revision containing the fixed stop_server.sh, the deployment STILL fails during the ApplicationStop phase with the exact same bug. Why did this happen and how should the engineer resolve it?

- **A.** CodeDeploy caches appspec.yml in Amazon S3 for 24 hours by default; invalidate the S3 object cache and trigger a new deployment.
- **B.** The CodeDeploy agent on the EC2 instance lacks execute permissions on stop_server.sh; move the script to the BeforeInstall lifecycle hook.
- **C.** ApplicationStop runs scripts from the PREVIOUSLY deployed revision before DownloadBundle. Redeploy with --ignore-application-stop-failures.
- **D.** ApplicationStop only runs on Blue/Green deployments; convert the CodeDeploy deployment group to Blue/Green to execute the updated script.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư DevOps cập nhật script scripts/stop_server.sh được tham chiếu bởi lifecycle hook ApplicationStop trong appspec.yml cho một lần triển khai tại chỗ (in-place) trên Amazon EC2 bằng AWS CodeDeploy. Phiên bản trước đó có lỗi trong stop_server.sh gây ra exit code khác 0. Khi kỹ sư triển khai phiên bản mới chứa stop_server.sh đã sửa lỗi, quá trình triển khai VẪN thất bại trong giai đoạn ApplicationStop với đúng lỗi y hệt. Tại sao điều này xảy ra và kỹ sư nên giải quyết như thế nào?

**Đáp án đúng:** **C**

Một bẫy kinh điển trong kỳ thi DOP-C02: thứ tự lifecycle hook của CodeDeploy EC2 là ApplicationStop -> DownloadBundle -> BeforeInstall -> Install -> AfterInstall -> ApplicationStart -> ValidateService. Vì ApplicationStop chạy trước DownloadBundle, nó luôn thực thi script của revision cũ. Khi script cũ lỗi, hãy bật tùy chọn IgnoreApplicationStopFailures khi deploy bản mới.

- **A:** Sai. S3 không cache appspec.yml theo kiểu này; nguyên nhân nằm ở thứ tự vòng đời (lifecycle hook order) của CodeDeploy.
- **B:** Sai. Lỗi không phải do thiếu quyền execute mà vì CodeDeploy vẫn đang thực thi bản script lỗi từ revision trước đó.
- **C (Đúng):** Chính xác! Trong EC2 In-Place Deployment, ApplicationStop là hook chạy ĐẦU TIÊN — trước cả DownloadBundle. Do đó CodeDeploy luôn chạy script ApplicationStop của bản revision CŨ đang nằm trên instance. Để vượt qua script cũ bị lỗi, cần triển khai bản sửa lỗi với cờ --ignore-application-stop-failures.
- **D:** Sai. ApplicationStop chạy trên cả in-place deployment, nhưng luôn lấy từ revision đã deploy thành công trước đó.

</details>

### Câu 4 `hard`

A serverless payments API uses Amazon API Gateway backed by AWS Lambda aliases managed via AWS SAM and AWS CodeDeploy. The team needs to shift traffic gradually by 10% every 1 minute to the new Lambda version, run a synthetic smoke test AFTER 100% of traffic has shifted to verify downstream ledger reconciliation, and automatically roll back to the previous Lambda version if Lambda Errors exceed zero at any point during the rollout. Which TWO configurations must be defined in the AWS SAM template? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Set DeploymentPreference.Type to Canary10Percent5Minutes so Lambda alias traffic shifts linearly by 10% every 1 minute.
- **B.** Set DeploymentPreference.Type to Linear10PercentEvery1Minute and attach a CloudWatch Alarm on Lambda Errors under DeploymentPreference.Alarms.
- **C.** Configure the validation Lambda function under DeploymentPreference.Hooks.PreTraffic so it executes immediately after 100% of production traffic shifts.
- **D.** Configure a validation Lambda under DeploymentPreference.Hooks.PostTraffic (AfterAllowTraffic) calling PutLifecycleEventHookExecutionStatus.
- **E.** Point the Amazon API Gateway proxy integration directly to the $LATEST Lambda qualifier instead of a named Lambda alias.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một API thanh toán serverless sử dụng Amazon API Gateway được hỗ trợ bởi các AWS Lambda alias quản lý thông qua AWS SAM và AWS CodeDeploy. Nhóm cần chuyển lưu lượng dần dần 10% mỗi 1 phút sang phiên bản Lambda mới, chạy một smoke test tổng hợp SAU KHI 100% lưu lượng đã chuyển sang để xác minh đối soát sổ cái phía sau, và tự động rollback về phiên bản Lambda trước đó nếu Lambda Errors vượt quá 0 tại bất kỳ thời điểm nào trong quá trình triển khai. Phải định nghĩa HAI cấu hình nào trong AWS SAM template? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

AWS SAM tích hợp sâu với CodeDeploy cho Lambda qua thuộc tính DeploymentPreference: dùng Linear10PercentEvery1Minute để chuyển traffic tuyến tính, Alarms để tự động rollback, và Hooks (PreTraffic / PostTraffic) để chạy kiểm thử trước và sau khi chuyển traffic.

- **A:** Sai. Canary10Percent5Minutes chỉ chuyển 10% trong 5 phút đầu rồi chuyển thẳng 90% còn lại cùng một lúc, không phải dịch chuyển đều 10% mỗi phút.
- **B (Đúng):** Chính xác! Linear10PercentEvery1Minute dịch chuyển đều đặn 10% traffic mỗi 1 phút (tổng 10 phút), và gắn CloudWatch Alarm vào DeploymentPreference.Alarms sẽ kích hoạt rollback tự động nếu có bất kỳ lỗi nào phát sinh.
- **C:** Sai. PreTraffic (BeforeAllowTraffic) chạy TRƯỚC khi có bất kỳ traffic nào chuyển sang phiên bản mới.
- **D (Đúng):** Chính xác! Trong AWS SAM, Hooks.PostTraffic tương ứng với hook AfterAllowTraffic của CodeDeploy, chạy ngay sau khi 100% traffic đã chuyển sang phiên bản mới, và bắt buộc phải gọi PutLifecycleEventHookExecutionStatus để báo kết quả thành công/thất bại.
- **E:** Sai. CodeDeploy traffic shifting cho Lambda bắt buộc phải sử dụng Alias (ví dụ: live) trỏ tới các published Version; $LATEST không hỗ trợ weighted alias traffic shifting.

</details>

### Câu 5 `hard`

A company deploys containerized REST APIs on Amazon ECS using Fargate with AWS CodeDeploy Blue/Green deployments behind an Application Load Balancer (ALB). Before shifting any production traffic to the replacement (Green) task set, the team must run automated synthetic smoke tests against the Green tasks through an isolated port. If the smoke tests fail, or if the ALB 5XX error rate exceeds 1% during the 10% canary traffic shift, the deployment must automatically stop and roll back to the Blue task set. How should the DevOps engineer configure CodeDeploy?

- **A.** Attach the smoke test Lambda function to the BeforeInstall lifecycle hook and configure the ECS Deployment Circuit Breaker to monitor ALB 5XX rates.
- **B.** Attach the smoke test Lambda function to the AfterAllowTraffic lifecycle hook and manually update ALB target group weights via AWS CLI on errors.
- **C.** Use CodeDeployDefault.ECSAllAtOnce with a custom container HEALTHCHECK command in the Dockerfile to detect and roll back ALB HTTP 5XX errors.
- **D.** Use an ALB test listener, AfterAllowTestTraffic Lambda hook, ECSLinear10PercentEvery1Minutes, and an ALB 5XX alarm for auto-rollback.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty triển khai các REST API chạy container trên Amazon ECS sử dụng Fargate với mô hình triển khai Blue/Green của AWS CodeDeploy phía sau Application Load Balancer (ALB). Trước khi chuyển bất kỳ lưu lượng production nào sang tập task thay thế (Green), nhóm phải chạy các bài smoke test tổng hợp tự động đối với các task Green thông qua một port biệt lập. Nếu smoke test thất bại, hoặc nếu tỷ lệ lỗi ALB 5XX vượt quá 1% trong quá trình chuyển 10% lưu lượng canary, quá trình triển khai phải tự động dừng lại và rollback về tập task Blue. Kỹ sư DevOps nên cấu hình CodeDeploy như thế nào?

**Đáp án đúng:** **D**

Thứ tự lifecycle hook của CodeDeploy cho ECS là: BeforeInstall -> AfterInstall -> AfterAllowTestTraffic -> BeforeAllowTraffic -> AfterAllowTraffic. Smoke test qua test listener phải đặt ở AfterAllowTestTraffic, kết hợp traffic shifting (Canary/Linear) và CloudWatch Alarm rollback.

- **A:** Sai. Tại thời điểm BeforeInstall, Green task set chưa được khởi tạo và chưa gắn vào test listener. Ngoài ra, ECS Deployment Circuit Breaker chỉ dùng cho Rolling Update, không dùng cho CodeDeploy Blue/Green và không theo dõi ALB 5XX.
- **B:** Sai. AfterAllowTraffic chạy SAU khi production traffic đã được chuyển sang Green, không đáp ứng yêu cầu kiểm thử trước khi mở traffic thật.
- **C:** Sai. ECSAllAtOnce chuyển 100% traffic ngay lập tức (không có 10% canary) và container HEALTHCHECK không đo được tỷ lệ lỗi 5XX ở tầng ALB.
- **D (Đúng):** Chính xác! Trong ECS Blue/Green của CodeDeploy, test listener cho phép kiểm thử Green task set trước khi chuyển traffic thật. Hook AfterAllowTestTraffic gọi Lambda chạy smoke test (trả về Succeeded/Failed qua PutLifecycleEventHookExecutionStatus). Cấu hình Linear/Canary kết hợp CloudWatch Alarm auto-rollback đảm bảo quay lại Blue ngay khi 5XX vượt ngưỡng.

</details>

### Câu 6 `medium`

A serverless payments API runs on AWS Lambda behind Amazon API Gateway pointing to a Lambda alias named prod. When deploying a new Lambda version, the team wants to run an automated pre-traffic verification check against the new version before routing any live requests, then shift 10% of production traffic for 5 minutes before shifting the remaining 90%. If Lambda Errors or Throttles exceed a threshold during the 5-minute window, traffic must automatically revert to the previous version. How should the DevOps engineer configure AWS CodeDeploy?

- **A.** Use CodeDeployDefault.LambdaCanary10Percent5Minutes, a BeforeAllowTraffic validation hook in appspec.yaml, and CloudWatch alarms for rollback.
- **B.** Update API Gateway to point directly to the $LATEST Lambda qualifier and use an Amazon EventBridge rule to revert the function code ZIP if errors occur.
- **C.** Use CodeDeployDefault.LambdaLinear10PercentEvery1Minute and place the pre-traffic validation Lambda function inside the AfterAllowTraffic lifecycle hook.
- **D.** Deploy two separate API Gateway REST API stages and use Amazon Route 53 latency-based routing policies to shift production traffic gradually.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một API thanh toán serverless chạy trên AWS Lambda phía sau Amazon API Gateway trỏ tới một Lambda alias tên là prod. Khi triển khai một phiên bản Lambda mới, nhóm muốn chạy kiểm tra xác minh tự động trước khi chuyển lưu lượng (pre-traffic) đối với phiên bản mới trước khi định tuyến bất kỳ request thực tế nào, sau đó chuyển 10% lưu lượng production trong 5 phút trước khi chuyển 90% còn lại. Nếu Lambda Errors hoặc Throttles vượt quá ngưỡng trong khoảng thời gian 5 phút đó, lưu lượng phải tự động quay về phiên bản trước. Kỹ sư DevOps nên cấu hình AWS CodeDeploy như thế nào?

**Đáp án đúng:** **A**

CodeDeploy tích hợp sâu với AWS Lambda Alias (và AWS SAM AutoPublishAlias) hỗ trợ Canary/Linear traffic shifting, hai lifecycle hook BeforeAllowTraffic và AfterAllowTraffic, cùng cơ chế tự động rollback dựa trên CloudWatch Alarms.

- **A (Đúng):** Chính xác! CodeDeploy cho Lambda sử dụng alias traffic shifting với cấu hình LambdaCanary10Percent5Minutes (chuyển 10% trong 5 phút rồi mới chuyển 90% còn lại). Hook BeforeAllowTraffic chạy hàm Lambda kiểm thử trước khi mở traffic thật, và CloudWatch Alarm gắn vào CodeDeploy sẽ tự động rollback về version cũ nếu lỗi xảy ra.
- **B:** Sai. Trỏ vào $LATEST không thể chia tỷ lệ traffic (canary) giữa hai phiên bản bất biến và không hỗ trợ rollback nguyên tử.
- **C:** Sai. LambdaLinear10PercentEvery1Minute tăng tuyến tính 10% mỗi phút (không phải Canary 10% trong 5 phút) và AfterAllowTraffic chạy SAU khi 100% traffic đã chuyển sang bản mới.
- **D:** Sai. Route 53 latency-based routing định tuyến theo độ trễ địa lý, không phải chia tỷ lệ phần trăm canary và gây phức tạp không cần thiết so với CodeDeploy Lambda alias shifting.

</details>

### Câu 7 `medium`

A DevOps engineer uses AWS CodeDeploy to perform in-place rolling deployments to a fleet of 10 Amazon EC2 instances behind an Application Load Balancer. The team requires that at least 7 instances remain healthy and serving traffic throughout the deployment, that the old application process is gracefully stopped before new files are copied, and that a local health-check script verifies the new service is listening on port 8080 before CodeDeploy marks the instance deployment successful. How should the engineer configure CodeDeploy and appspec.yml?

- **A.** Use CodeDeployDefault.AllAtOnce and place both the graceful stop and port 8080 health-check scripts inside the BeforeInstall hook in appspec.yml.
- **B.** Use CodeDeployDefault.HalfAtATime with load balancer traffic blocking enabled and place the health-check script inside the ApplicationStop hook.
- **C.** Use CodeDeployDefault.OneAtATime and place the graceful application stop script inside the AfterInstall lifecycle hook in appspec.yml.
- **D.** Create a custom config with MinimumHealthyHosts=70% (HOST_COUNT=7), enable ALB traffic blocking, and use ApplicationStop and ValidateService.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư DevOps sử dụng AWS CodeDeploy để thực hiện triển khai cuốn chiếu tại chỗ (in-place rolling deployment) tới một đội ngũ 10 Amazon EC2 instance phía sau Application Load Balancer. Nhóm yêu cầu ít nhất 7 instance luôn khỏe mạnh và phục vụ lưu lượng trong suốt quá trình triển khai, tiến trình ứng dụng cũ được dừng một cách nhẹ nhàng trước khi các tệp mới được sao chép và một script kiểm tra sức khỏe cục bộ xác minh dịch vụ mới đang lắng nghe trên port 8080 trước khi CodeDeploy đánh dấu việc triển khai instance thành công. Kỹ sư nên cấu hình CodeDeploy và appspec.yml như thế nào?

**Đáp án đúng:** **D**

Trong CodeDeploy EC2 In-Place, thứ tự lifecycle hooks chuẩn là: ApplicationStop -> DownloadBundle -> BeforeInstall -> Install -> AfterInstall -> ApplicationStart -> ValidateService. MinimumHealthyHosts quyết định số lượng/tỷ lệ host tối thiểu phải luôn khỏe mạnh trong suốt quá trình rollout.

- **A:** Sai. AllAtOnce triển khai đồng thời lên cả 10 instance gây downtime hoàn toàn (0 instance khỏe mạnh), và BeforeInstall chạy trước khi cài file mới nên không thể kiểm tra dịch vụ mới.
- **B:** Sai. HalfAtATime chỉ giữ lại 5/10 (50%) instance khỏe mạnh, vi phạm yêu cầu tối thiểu 7 instance. Ngoài ra ApplicationStop chạy ở đầu vòng đời để dừng bản cũ, không phải kiểm tra bản mới.
- **C:** Sai. AfterInstall chạy SAU khi file mới đã được copy đè vào thư mục đích, vi phạm yêu cầu dừng tiến trình cũ trước khi copy file mới.
- **D (Đúng):** Chính xác! MinimumHealthyHosts=70% (hoặc 7 host) đảm bảo luôn có tối thiểu 7/10 EC2 phục vụ traffic; tùy chọn bật Load Balancer deregistration giúp rút traffic an toàn; hook ApplicationStop dừng tiến trình cũ trước bước DownloadBundle/BeforeInstall và ValidateService kiểm tra port 8080 ở bước cuối cùng trước khi kết thúc.

</details>

### Câu 8 `medium`

A retail company deploys an Amazon ECS service using AWS CodeDeploy Blue/Green deployments. After production traffic shifts 100% to the Green task set, business analysts sometimes discover subtle payment calculation bugs 20 to 30 minutes later. Currently, CodeDeploy terminates the original Blue task set 5 minutes after traffic cutover, forcing a slow 15-minute re-deployment if an issue is found at minute 25. How can the DevOps engineer enable near-instant rollback for up to 60 minutes after traffic cutover with minimal changes?

- **A.** Set the Amazon ECS service desiredCount parameter to double the normal production task count permanently across all Availability Zones.
- **B.** Increase the Application Load Balancer target group deregistration delay attribute from 300 seconds to 3,600 seconds.
- **C.** Switch from CodeDeploy Blue/Green to an ECS Rolling Update deployment controller with minimumHealthyPercent set to 100.
- **D.** Set blueGreenDeploymentConfiguration terminateBlueInstancesOnDeploymentSuccess.terminationWaitTimeInMinutes to 60.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty bán lẻ triển khai một Amazon ECS service bằng AWS CodeDeploy Blue/Green deployment. Sau khi lưu lượng production chuyển 100% sang tập task Green, các chuyên viên phân tích nghiệp vụ đôi khi phát hiện các lỗi tính toán thanh toán tinh vi sau đó từ 20 đến 30 phút. Hiện tại, CodeDeploy terminate tập task Blue ban đầu sau 5 phút kể từ khi chuyển lưu lượng, buộc phải triển khai lại mất 15 phút nếu phát hiện sự cố ở phút thứ 25. Kỹ sư DevOps có thể bật khả năng rollback gần như tức thì trong tối đa 60 phút sau khi chuyển lưu lượng với ít thay đổi nhất bằng cách nào?

**Đáp án đúng:** **D**

Trong AWS CodeDeploy Blue/Green (cho cả ECS và EC2), terminationWaitTimeInMinutes kiểm soát khoảng thời gian giữ lại môi trường Blue cũ sau khi cắt traffic hoàn toàn sang Green, giúp rollback tức thì chỉ bằng việc đổi listener routing mà không cần khởi tạo lại task.

- **A:** Sai. Tăng gấp đôi desiredCount chỉ chạy thêm nhiều task phiên bản Green mới, không giữ lại phiên bản Blue cũ để rollback.
- **B:** Sai. Deregistration delay tối đa là 3,600 giây chỉ giữ kết nối đang dở (in-flight) khi rút target, không ngăn CodeDeploy xóa Blue task set sau 5 phút chờ.
- **C:** Sai. Rolling Update thay thế dần các task cũ ngay trong quá trình deploy, không giữ lại toàn bộ Blue task set trong 60 phút sau khi hoàn tất để rollback tức thì.
- **D (Đúng):** Chính xác! Tham số terminationWaitTimeInMinutes trong cấu hình Blue/Green của CodeDeploy quy định thời gian giữ nguyên Blue task set (tối đa lên tới 2 ngày) sau khi chuyển 100% traffic sang Green. Đặt 60 phút cho phép chuyển ngược traffic về Blue gần như tức thì nếu phát hiện lỗi ở phút 25.

</details>

### Câu 9 `hard`

A development team deploys an AWS Lambda function using AWS CodeDeploy with a Canary10Percent5Minutes deployment configuration and a BeforeAllowTraffic lifecycle hook function. During every deployment, the hook Lambda executes successfully in CloudWatch Logs, but the CodeDeploy deployment hangs for 60 minutes and then rolls back automatically. Which TWO actions are required to resolve this issue? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Increase the hook Lambda function timeout to 15 minutes and allocate 3008 MB of memory in the function configuration.
- **B.** Update the hook Lambda function code to call codedeploy:PutLifecycleEventHookExecutionStatus with Succeeded or Failed.
- **C.** Change the deployment configuration from Canary10Percent5Minutes to AllAtOnce in the CodeDeploy AppSpec.yml file.
- **D.** Grant the hook Lambda execution role the codedeploy:PutLifecycleEventHookExecutionStatus IAM action permission.
- **E.** Move the hook Lambda function into the same private VPC subnets and security group as the target Lambda function.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm phát triển triển khai AWS Lambda function bằng AWS CodeDeploy với cấu hình triển khai Canary10Percent5Minutes và một lifecycle hook function BeforeAllowTraffic. Trong mỗi lần triển khai, hook Lambda thực thi thành công trong CloudWatch Logs, nhưng quá trình triển khai CodeDeploy bị treo trong 60 phút rồi tự động rollback. Cần thực hiện HAI hành động nào để khắc phục sự cố này? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Với AWS CodeDeploy cho Lambda và ECS Blue/Green, mọi Lifecycle Hook Lambda (BeforeAllowTraffic, AfterAllowTraffic, AfterAllowTestTraffic) đều phải gọi API codedeploy:PutLifecycleEventHookExecutionStatus và có quyền IAM tương ứng; nếu không CodeDeploy sẽ chờ tối đa 1 giờ rồi rollback.

- **A:** Sai. Hook function đã chạy xong trong CloudWatch Logs; nguyên nhân treo 60 phút là do CodeDeploy chờ tín hiệu callback từ API chứ không phải do Lambda bị timeout.
- **B (Đúng):** Chính xác! CodeDeploy không tự biết hook Lambda đã kiểm tra thành công hay thất bại; hook function bắt buộc phải gọi API PutLifecycleEventHookExecutionStatus để báo kết quả về cho CodeDeploy.
- **C:** Sai. Đổi sang AllAtOnce vẫn sẽ bị treo ở bước BeforeAllowTraffic nếu hook không gửi trạng thái về CodeDeploy.
- **D (Đúng):** Chính xác! IAM Execution Role của hook Lambda phải được cấp quyền codedeploy:PutLifecycleEventHookExecutionStatus để lời gọi API không bị từ chối.
- **E:** Sai. Hook Lambda cần gọi public endpoint của CodeDeploy API; đưa vào VPC mà không có NAT/VPC Endpoint thậm chí còn làm lỗi kết nối.

</details>

---

[Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md)
