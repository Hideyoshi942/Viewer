# Bài tập tình huống — Chủ đề 14: CI/CD Pipelines — CodeCommit, CodeBuild, CodeDeploy & CodePipeline

> CodeBuild buildspec.yml, CodeDeploy appspec.yml (In-place vs Blue/Green), CodePipeline Stages, Actions & Automated Testing.
> **Số câu hỏi:** 18 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án & Giải thích chi tiết**.

---

### Câu 1 `medium`

A team uses AWS Elastic Beanstalk to host a web application backed by an Amazon RDS PostgreSQL database. Initially, the RDS instance was created inside the Elastic Beanstalk environment configuration. Now the team needs to perform blue/green environment swaps and occasionally terminate old environments without deleting the production database. What is the recommended approach?

- **A.** Store the production database files directly on the local EC2 instance store volume of the Elastic Beanstalk application instances for fast I/O.
- **B.** Keep the Amazon RDS instance coupled inside the Elastic Beanstalk environment and set `DeletionPolicy: Retain` in `.ebextensions`.
- **C.** Use the `eb clone` CLI command to copy the coupled RDS instance configuration with every new Elastic Beanstalk deployment.
- **D.** Create the Amazon RDS instance independently outside Elastic Beanstalk and pass its connection string via Elastic Beanstalk environment properties.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Best practice với **Elastic Beanstalk + RDS**:
- **Dev/Test**: Có thể tạo RDS tích hợp trong EB cho nhanh.
- **Production**: Bắt buộc **tách rời (decouple) RDS** tạo độc lập bên ngoài EB, truyền endpoint/credentials qua Environment Properties (hoặc Secrets Manager) và cấu hình Security Group cho phép EB instances kết nối vào RDS.

- **A:** Sai vì Instance Store là dữ liệu tạm thời, sẽ mất sạch khi EC2 stop/terminate hoặc Auto Scaling scale in.
- **B:** Sai vì giữ RDS gắn cứng trong EB environment khiến việc Blue/Green deploy (tạo môi trường mới dùng chung DB) trở nên phức tạp; tách RDS ra ngoài là best practice chính thức của AWS.
- **C:** Sai vì `eb clone` tạo môi trường mới; nếu RDS nằm trong EB thì sẽ tạo một database mới tách biệt dữ liệu với môi trường cũ.
- **D (Đúng):** Đúng! Với môi trường Production, AWS khuyến nghị tách rời (decouple) RDS khỏi vòng đời Elastic Beanstalk. Nếu tạo RDS bên trong EB, khi terminate môi trường EB, RDS cũng bị xóa theo (trừ khi có snapshot), gây rủi ro mất dữ liệu và khó Blue/Green swap.

</details>

### Câu 2 `medium`

A developer is using AWS CodeDeploy to deploy an updated web application to an Amazon EC2 Auto Scaling group using an in-place deployment. After the new code is started on each instance, the team wants to run a smoke-test script (`validate.sh`) on the instance before the Application Load Balancer routes production traffic to it. Which lifecycle event hook in `appspec.yml` should run `validate.sh`?

- **A.** `ValidateService`
- **B.** `AfterAllowTraffic`
- **C.** `BeforeInstall`
- **D.** `DownloadBundle`

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Thứ tự **CodeDeploy EC2 Lifecycle Hooks** (`appspec.yml`):
`ApplicationStop` -> *(DownloadBundle)* -> `BeforeInstall` -> *(Install)* -> `AfterInstall` -> `ApplicationStart` -> **`ValidateService`**.
(Với **Lambda / ECS**: `BeforeAllowTraffic` -> *(AllowTraffic)* -> `AfterAllowTraffic`).

- **A (Đúng):** Đúng! Trong CodeDeploy EC2/On-Premises, thứ tự các lifecycle hooks là: `ApplicationStop` -> `DownloadBundle` -> `BeforeInstall` -> `Install` -> `AfterInstall` -> `ApplicationStart` -> **`ValidateService`** (chạy cuối cùng để kiểm tra sức khỏe ứng dụng trước khi gắn lại vào Load Balancer).
- **B:** Sai vì `AfterAllowTraffic` là hook của **ECS / Lambda / Blue-Green**, không phải hook của EC2 in-place trước khi nhận traffic (và nó chạy *sau* khi traffic đã mở).
- **C:** Sai vì `BeforeInstall` chạy trước khi giải nén code mới, lúc đó ứng dụng mới chưa được cài đặt hay khởi chạy.
- **D:** Sai vì `DownloadBundle` là bước nội bộ của CodeDeploy Agent để tải artifact, không cho phép gắn script tùy chỉnh.

</details>

### Câu 3 `medium`

A company uses AWS CodePipeline to automate deployments from GitHub to staging and then to production. Compliance rules require that a release manager review the staging environment and explicitly approve the release before CodePipeline deploys to production. An email notification must be sent to the release manager when an approval is needed. How should this be implemented in CodePipeline?

- **A.** Add an AWS CodeBuild stage that executes `sleep 86400` in its `buildspec.yml` until the release manager manually cancels the build.
- **B.** Add a `Manual` approval action to a stage between Staging and Production, and attach an Amazon SNS topic ARN for notifications.
- **C.** Use an AWS Lambda invoke action that throws an unhandled exception until a DynamoDB approval flag is updated to `approved`.
- **D.** Disable the stage transition between Staging and Production permanently and manually upload build artifacts to S3.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

**AWS CodePipeline Manual Approval**:
- Đặt ở giữa giai đoạn Staging và Production.
- Gắn **SNS Topic** để gửi thông báo ngay khi pipeline dừng chờ duyệt.
- Nếu không có ai duyệt trong **7 ngày**, action sẽ tự động hết hạn (timeout/fail).

- **A:** Sai vì CodeBuild tính phí theo phút chạy, timeout tối đa 8 giờ và không phải cơ chế phê duyệt chuẩn.
- **B (Đúng):** Đúng! CodePipeline hỗ trợ action type **Manual Approval** (`Approval` category) có thể gắn **SNS Topic ARN** để gửi email/Slack thông báo cho người duyệt; pipeline sẽ tạm dừng tại bước này cho đến khi được Approve/Reject (tối đa 7 ngày).
- **C:** Sai vì ném exception sẽ đánh dấu pipeline là Failed chứ không tạm dừng chờ duyệt.
- **D:** Sai vì tắt transition chỉ chặn luồng tự động mà không gửi thông báo SNS hay tạo luồng duyệt chuẩn có audit log (tuy nhiên vẫn dùng thủ công được nếu không cần SNS/comment).

</details>

### Câu 4 `medium` *(Chọn nhiều đáp án)*

A company builds Node.js and Python microservices using AWS CodeBuild inside a private VPC without internet access. The team wants to share internal libraries privately across teams while also caching public packages from npm and PyPI locally in AWS. Which TWO actions should the developer take? (Choose two.)

- **A.** Configure AWS CodeCommit Git repositories as a live PyPI and npm package registry server accessed over HTTPS.
- **B.** Push all internal npm packages and Python wheels to Amazon ECR Public Gallery so CodeBuild can pull them without VPC endpoints.
- **C.** Create an AWS CodeArtifact domain and repository with external connections to `public:npmjs` and `public:pypi`.
- **D.** Create Interface VPC Endpoints for `codeartifact.api` and `codeartifact.repositories` (plus S3 Gateway Endpoint) for offline CodeBuild access.
- **E.** Store all `node_modules` and Python `.whl` dependency archives directly inside AWS Secrets Manager secrets and fetch them during the `install` phase.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**, **D**

**AWS CodeArtifact** là dịch vụ Artifact Repository được quản lý hoàn toàn:
- Hỗ trợ **npm, PyPI, Maven, Gradle, NuGet, Swift, RubyGems**.
- **Upstream / External Connections**: Tự động tải và cache gói từ public registry (`npmjs`, `pypi`) về repo nội bộ.
- Hỗ trợ **VPC PrivateLink** (cần cả endpoint cho `codeartifact.api`, `codeartifact.repositories` và S3 Gateway Endpoint).

- **A:** Sai vì CodeCommit chỉ là Git repository, không hỗ trợ giao thức registry của npm/PyPI hay caching gói public.
- **B:** Sai vì ECR là Docker container registry, không phải npm/PyPI package registry, và Public Gallery sẽ làm lộ thư viện nội bộ ra công khai.
- **C (Đúng):** Đúng! AWS CodeArtifact là dịch vụ quản lý artifact riêng tư (npm, PyPI, Maven, NuGet) hỗ trợ External Connection để tự động cache các gói công khai từ npmjs/PyPI về AWS.
- **D (Đúng):** Đúng! Vì CodeBuild chạy trong private VPC không có internet, cần Interface VPC Endpoint cho CodeArtifact (và S3 Gateway Endpoint để tải payload artifact) để kết nối hoàn toàn qua mạng riêng.
- **E:** Sai vì Secrets Manager có giới hạn kích thước nhỏ (64 KB) và chỉ dùng để lưu chuỗi bí mật, không phải package registry.

</details>

### Câu 5 `medium`

A team uses AWS CodeDeploy to perform Blue/Green deployments for an Amazon ECS Fargate service behind an Application Load Balancer (ALB). Before shifting production traffic from the Blue target group to the Green target group, the QA team wants to send test requests to the Green tasks on port `8443` and run a `BeforeAllowTraffic` validation Lambda. How does CodeDeploy route test traffic to the Green task set?

- **A.** Set `DeploymentType: IN_PLACE` in the CodeDeploy Deployment Group and route test traffic via the production ALB listener before shifting live traffic.
- **B.** Create a second Application Load Balancer and update Route 53 weighted DNS records inside the `BeforeInstall` hook.
- **C.** Disable health checks on the ALB Target Group during deployment so ECS tasks pass validation immediately.
- **D.** Configure a Test Listener (port `8443`) on the ALB in the CodeDeploy Deployment Group, and specify the `BeforeAllowTraffic` Lambda hook in `appspec.yml`.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

**CodeDeploy ECS Blue/Green Deployment**:
- Dùng **1 ALB** + **2 Target Groups** + **Production Listener** + **Test Listener** (tùy chọn).
- Thứ tự hooks trong `appspec.yml` cho ECS: `BeforeInstall` -> `AfterInstall` -> `AfterAllowTestTraffic` -> `BeforeAllowTraffic` -> `AfterAllowTraffic`.

- **A:** Sai vì ECS trên CodeDeploy chỉ hỗ trợ Blue/Green deployment (`BLUE_GREEN`), không hỗ trợ In-Place.
- **B:** Sai vì CodeDeploy ECS Blue/Green sử dụng 1 ALB duy nhất với 2 Target Groups và không có hook `BeforeInstall` (ECS chỉ có `BeforeInstall`, `AfterInstall`, `AfterAllowTestTraffic`, `BeforeAllowTraffic`, `AfterAllowTraffic`).
- **C:** Sai vì tắt health check làm mất khả năng kiểm tra sức khỏe Green tasks trước khi chuyển traffic.
- **D (Đúng):** Đúng! Trong **CodeDeploy ECS Blue/Green**, ALB có 2 Target Groups (Blue & Green) và 2 Listeners: **Production Listener** (443) và **Test Listener** (ví dụ 8443). CodeDeploy tạm thời trỏ Test Listener vào Green target group để hook `BeforeAllowTraffic` kiểm thử trước khi đổi Production Listener.

</details>

### Câu 6 `medium`

An AWS CodeBuild project needs to log in to a private npm registry and run integration tests using a database password stored in AWS Secrets Manager (`prod/ci/db-pass`). How can the developer securely inject this secret into the CodeBuild environment without hardcoding it in `buildspec.yml`?

- **A.** Pass the Secrets Manager ARN in `env.exported-variables` so CodeBuild automatically resolves the token at runtime.
- **B.** Store the SonarQube token in `artifacts.files` so it is uploaded to Amazon S3 and downloaded securely by the CodeBuild build container during the `build` phase.
- **C.** Reference the secret under the `env.secrets-manager` section in `buildspec.yml` and grant the CodeBuild service role `secretsmanager:GetSecretValue` permission.
- **D.** Define the SonarQube token in plaintext under `env.variables` in `buildspec.yml` and mask it in CloudWatch Logs.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Trong **`buildspec.yml` của AWS CodeBuild**:
- **`env.variables`**: Biến thường (plaintext).
- **`env.parameter-store`**: Lấy từ SSM Parameter Store (hỗ trợ `SecureString`).
- **`env.secrets-manager`**: Lấy từ AWS Secrets Manager (cú pháp `VAR_NAME: secret-id:json-key`).

- **A:** Sai vì `exported-variables` dùng để xuất biến từ CodeBuild ra các stage sau của CodePipeline, không dùng để đọc từ Secrets Manager.
- **B:** Sai vì `artifacts.files` dùng để đóng gói đầu ra của quá trình build.
- **C (Đúng):** Đúng! CodeBuild hỗ trợ sẵn `env.secrets-manager` (và `env.parameter-store`) trong `buildspec.yml`, tự động lấy giá trị lúc chạy và **che (mask) giá trị bí mật** khỏi build logs.
- **D:** Sai vì lưu mật khẩu dạng plaintext trong Git (`buildspec.yml`) vi phạm bảo mật nghiêm trọng.

</details>

### Câu 7 `medium`

A team runs automated JUnit unit tests and code coverage checks inside AWS CodeBuild. Instead of parsing raw console logs to see which test cases failed, the developers want a visual test summary report (pass/fail counts, duration, stack traces) directly inside the AWS CodeBuild console. How should `buildspec.yml` be configured?

- **A.** Add a `reports` section in `buildspec.yml` (`file-format: JUNITXML`), and grant `codebuild:CreateReportGroup` and `codebuild:BatchPutTestCases`.
- **B.** Enable `PrivilegedMode` on the CodeBuild project environment so the build container can publish JUnit XML test reports directly to the AWS console.
- **C.** Send the raw JUnit XML test output file to an Amazon SQS queue using the AWS CLI in the `post_build` phase.
- **D.** Add the JUnit XML test result files to `artifacts.secondary-artifacts` only without defining a `reports` section.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

**AWS CodeBuild Test Reports**:
- Khai báo trong mục **`reports`** của `buildspec.yml` (hỗ trợ cả **Test reports** như `JUNITXML` và **Code coverage** như `JACOCOXML`, `COBERTURAXML`).
- Cần cấp quyền `codebuild:CreateReportGroup`, `codebuild:CreateReport`, `codebuild:UpdateReport`, `codebuild:BatchPutTestCases` cho CodeBuild Role.

- **A (Đúng):** Đúng! Phần **`reports`** trong `buildspec.yml` cho phép CodeBuild Report Groups tự động đọc các file kết quả test (`JUNITXML`, `CUCUMBERJSON`, `NUNITXML`, `CLOVERXML`, `JACOCOXML`...) và hiển thị biểu đồ/chi tiết pass/fail ngay trên AWS Console.
- **B:** Sai vì `PrivilegedMode` chỉ dùng để build Docker image.
- **C:** Sai vì SQS không phải nơi hiển thị CodeBuild Test Reports.
- **D:** Sai vì đưa vào `artifacts` chỉ lưu file XML lên S3 chứ không hiển thị giao diện Test Report trên CodeBuild console.

</details>

### Câu 8 `medium` *(Chọn nhiều đáp án)*

A development team uses AWS CodePipeline to deploy a containerized application to Amazon ECS whenever a new Docker image with the `prod` tag is pushed to an Amazon ECR repository, AND wants to send a Slack/email notification whenever any pipeline execution enters the `FAILED` state. Which TWO EventBridge configurations satisfy these requirements? (Choose two.)

- **A.** Configure AWS CodeBuild to poll Amazon ECR every 5 seconds in an infinite loop for new `prod` image pushes.
- **B.** Use an Amazon S3 Lifecycle rule on the artifact bucket to detect `FAILED` CodePipeline executions and notify Slack.
- **C.** Use the ECR source action in CodePipeline (which creates an Amazon EventBridge rule matching `ECR Image Action` `PUSH` events for tag `prod`) to trigger the pipeline automatically.
- **D.** Create an Amazon EventBridge rule matching `source: ["aws.codepipeline"]` and `detail.state: ["FAILED"]` targeting an Amazon SNS topic (or AWS Chatbot for Slack).
- **E.** Attach a Lambda Authorizer to the Amazon ECR repository to trigger CodePipeline on every `docker push`.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**, **D**

**AWS CodePipeline + Amazon EventBridge**:
- **Trigger Pipeline**: EventBridge rule bắt sự kiện từ CodeCommit, S3, hoặc **Amazon ECR** (khi push tag mới).
- **Giám sát trạng thái**: EventBridge bắt sự kiện **`CodePipeline Pipeline Execution State Change`** (`FAILED`, `SUCCEEDED`) gửi tới SNS / Lambda / AWS Chatbot.

- **A:** Sai vì polling liên tục gây lãng phí chi phí CodeBuild; EventBridge cung cấp kích hoạt hướng sự kiện tức thì.
- **B:** Sai vì S3 Lifecycle không theo dõi trạng thái của CodePipeline.
- **C (Đúng):** Đúng! CodePipeline tích hợp Amazon EventBridge để lắng nghe sự kiện `ECR Image Action` (`result: SUCCESS`, `action-type: PUSH`, `image-tag: prod`) và tự động kích hoạt pipeline.
- **D (Đúng):** Đúng! CodePipeline phát sự kiện thay đổi trạng thái (`STARTED`, `SUCCEEDED`, `FAILED`) lên **Amazon EventBridge**, cho phép lọc `detail.state: ["FAILED"]` để gửi thông báo qua SNS / AWS Chatbot.
- **E:** Sai vì ECR không sử dụng Lambda Authorizer của API Gateway.

</details>

### Câu 9 `medium`

A company has an AWS Elastic Beanstalk environment running a Node.js API. During a major release, the team wants to test the new application version with **10% of live production traffic** for 30 minutes while 90% of traffic stays on the current version, and automatically shift 100% if no issues occur. Which Elastic Beanstalk deployment policy supports this natively?

- **A.** `Rolling` (In-place batch update mode)
- **B.** `TrafficSplitting` (Canary testing)
- **C.** `AllAtOnce` (In-place)
- **D.** `Immutable` (New ASG)

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

**Elastic Beanstalk `TrafficSplitting`**: Chính sách chuyên dụng cho **Canary Deployment** trên Elastic Beanstalk (chia % traffic sang tập instance mới trong N phút trước khi chuyển toàn bộ).

- **A:** Sai vì `Rolling` cập nhật từng nhóm instance cho đến khi hết 100%, không giữ mức chia 10% cố định trong 30 phút để theo dõi canary.
- **B (Đúng):** Đúng! **`TrafficSplitting`** tạo các instance mới cho phiên bản mới, chuyển một tỷ lệ phần trăm traffic (ví dụ 10%) sang trong một khoảng thời gian cấu hình, rồi tự chuyển 100% nếu healthy.
- **C:** Sai vì `AllAtOnce` ghi đè 100% instance cùng lúc, gây downtime.
- **D:** Sai vì `Immutable` chuyển toàn bộ 100% traffic sang ASG mới ngay khi health check pass, không chia 10% traffic.

</details>

### Câu 10 `medium`

A development team uses AWS CodeBuild to compile a large Node.js monorepo. To keep build times fast, they want CodeBuild to pass the compiled `dist/` folder to the next stage in AWS CodePipeline, AND also export the generated Docker image tag (`IMAGE_TAG`) as a variable so the subsequent Deploy stage can use it. How should `buildspec.yml` be configured?

- **A.** List both `dist/**/*` and `IMAGE_TAG` under `cache.paths` in `buildspec.yml`.
- **B.** Put `dist/**/*` under `reports.files` and export `IMAGE_TAG` via AWS CloudFormation stack outputs.
- **C.** List `dist/**/*` under `artifacts.files` and list `IMAGE_TAG` under `env.exported-variables`.
- **D.** Write `IMAGE_TAG` into `/tmp/env.txt` without declaring `env.exported-variables`.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Trong **`buildspec.yml`** tích hợp **CodePipeline**:
- **`artifacts.files`**: File đầu ra truyền sang stage sau.
- **`env.exported-variables`**: Biến môi trường xuất ra cho stage sau dùng (`#{Namespace.VAR}`).
- **`cache.paths`**: Thư mục cache dùng lại cho các lần build sau.

- **A:** Sai vì `cache.paths` chỉ dùng để cache dependencies giữa các lần chạy CodeBuild, không truyền artifact hay biến sang stage sau của CodePipeline.
- **B:** Sai vì `reports` chỉ dành cho test reports / code coverage.
- **C (Đúng):** Đúng! `artifacts.files` đóng gói file đầu ra (`dist/**/*`) gửi lên S3 artifact store của CodePipeline, còn **`env.exported-variables`** xuất các biến môi trường (như `IMAGE_TAG`) để các action ở stage sau tham chiếu qua cú pháp `#{BuildVariables.IMAGE_TAG}`.
- **D:** Sai vì CodePipeline không tự đọc `/tmp/env.txt` của container CodeBuild.

</details>

### Câu 11 `medium`

A company runs a fleet of 20 on-premises Linux servers alongside 10 Amazon EC2 instances and wants to use a single deployment service to push updated application binaries to all 30 servers in a rolling fashion with zero-downtime health checks. Which AWS service supports deploying to BOTH EC2 instances and on-premises servers?

- **A.** AWS CodeDeploy
- **B.** AWS SAM
- **C.** AWS Elastic Beanstalk
- **D.** Amazon ECR

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

4 nền tảng đích của **AWS CodeDeploy**:
1. **Amazon EC2**
2. **On-Premises Servers** (cài CodeDeploy Agent)
3. **AWS Lambda**
4. **Amazon ECS**

- **A (Đúng):** Đúng! **AWS CodeDeploy** hỗ trợ triển khai đồng nhất tới **Amazon EC2**, **On-Premises Servers** (cài CodeDeploy Agent + đăng ký bằng IAM User/STS), **AWS Lambda**, và **Amazon ECS**.
- **B:** Sai vì AWS SAM chỉ dùng cho ứng dụng Serverless trên AWS.
- **C:** Sai vì Elastic Beanstalk chỉ quản lý tài nguyên trên AWS Cloud (EC2/ASG/ALB), không deploy xuống máy chủ on-premises.
- **D:** Sai vì ECR chỉ là kho lưu trữ Docker image, không phải dịch vụ điều phối deployment.

</details>

### Câu 12 `medium`

A developer uses AWS CodeBuild inside a private VPC subnet to run integration tests against an internal Amazon RDS database. When the CodeBuild job starts, it fails with an error stating it cannot download source code or upload artifacts to Amazon S3. What is required for a VPC-connected CodeBuild project to access AWS services like S3 and ECR?

- **A.** Disable VPC configuration on CodeBuild and make the Amazon RDS database publicly accessible on `0.0.0.0/0`.
- **B.** Place CodeBuild in a public subnet with an Internet Gateway and no NAT Gateway so ENIs receive public IPs.
- **C.** Enable `PrivilegedMode` on the CodeBuild project so containers can route directly to private VPC subnets.
- **D.** Place CodeBuild in private subnets with a NAT Gateway (or VPC Endpoints for S3/ECR/Logs) and allow outbound Security Group traffic.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

**CodeBuild in VPC**:
- Giống như Lambda in VPC, CodeBuild ENI **không có Public IP** -> phải đặt ở **Private Subnet** + **NAT Gateway** (hoặc **VPC Endpoints**).

- **A:** Sai vì mở RDS ra internet công khai vi phạm bảo mật nghiêm trọng.
- **B:** Sai vì ENI của CodeBuild trong VPC không được gán Public IP, nên không thể đi thẳng qua Internet Gateway.
- **C:** Sai vì `PrivilegedMode` chỉ để chạy Docker daemon, không cấp quyền ra mạng.
- **D (Đúng):** Đúng! CodeBuild trong VPC **không có Public IP**, nên đặt trong public subnet với IGW vẫn sẽ bị lỗi kết nối. Bắt buộc đặt CodeBuild trong **Private Subnet** có **NAT Gateway** (hoặc dùng đầy đủ **VPC Endpoints** cho S3, ECR, Logs, Secrets Manager).

</details>

### Câu 13 `medium`

A developer uses AWS CodeBuild to run `docker build` and push an image to Amazon ECR. Inside `buildspec.yml`, the developer runs `aws ecr get-login-password` to authenticate Docker to ECR, but the command fails with `AccessDeniedException` on `ecr:GetAuthorizationToken`. How should this be fixed?

- **A.** Attach `ecr:GetAuthorizationToken` (`Resource: "*"`) and ECR push permissions (`ecr:BatchCheckLayerAvailability`, `ecr:PutImage`, etc.) to the CodeBuild Service Role.
- **B.** Add `ecr:GetAuthorizationToken` to the developer's local `~/.aws/credentials` IAM user profile.
- **C.** Disable `PrivilegedMode` on the CodeBuild project so Docker skips ECR token authentication.
- **D.** Set `Resource` to the S3 artifact bucket ARN for the `ecr:GetAuthorizationToken` IAM statement.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Push Docker image từ **CodeBuild -> Amazon ECR**:
1. Bật **`PrivilegedMode: true`** trên CodeBuild Environment.
2. Cấp **`ecr:GetAuthorizationToken`** (`Resource: "*"`) + quyền push ECR cho **CodeBuild Service Role**.

- **A (Đúng):** Đúng! CodeBuild sử dụng **CodeBuild Service Role** để gọi AWS APIs trong quá trình build. Lưu ý rằng `ecr:GetAuthorizationToken` bắt buộc `Resource: "*"`, còn các quyền push image chỉ định ARN của repository.
- **B:** Sai vì CodeBuild chạy trên máy chủ AWS bằng Service Role của nó, không dùng file local trên máy developer.
- **C:** Sai vì tắt `PrivilegedMode` sẽ làm `docker build` hỏng luôn.
- **D:** Sai vì `ecr:GetAuthorizationToken` là hành động cấp tài khoản không gắn với ARN của 1 repository hay S3 bucket cụ thể (phải để `Resource: "*"`).

</details>

### Câu 14 `medium`

A team uses AWS CodeCommit (or GitHub) with AWS CodePipeline. Occasionally, a developer pushes a commit that breaks unit tests, and the team wants to automatically run `npm test` on every **Pull Request** and post the pass/fail status back to the Pull Request *before* allowing a merge into `main`. Which service should run the Pull Request validation checks?

- **A.** Configure AWS CodeDeploy to deploy every Pull Request to Production first and run `npm test` on the live instances.
- **B.** Run `sam package` manually on every developer laptop and email the packaged ZIP artifact.
- **C.** Trigger an AWS CodeBuild project on Pull Request events to run `npm test` and report build status back.
- **D.** Use Amazon Inspector continuous scanning to execute `npm test` on GitHub Pull Requests.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

**Pull Request CI Checks trên AWS**:
- Dùng **AWS CodeBuild** (bắt Webhook PR từ GitHub/Bitbucket hoặc EventBridge rule từ CodeCommit PR) để chạy unit test/lint và chặn merge nếu fail.

- **A:** Sai vì không ai deploy PR chưa test lên Production.
- **B:** Sai vì không tự động kiểm tra trên PR.
- **C (Đúng):** Đúng! **AWS CodeBuild** hỗ trợ tích hợp trực tiếp Webhook / EventBridge cho sự kiện **Pull Request** (`PULL_REQUEST_CREATED`, `PULL_REQUEST_UPDATED`) để chạy test và báo trạng thái Pass/Fail lên PR trước khi merge (CodePipeline truyền thống chỉ chạy sau khi đã push/merge vào nhánh theo dõi).
- **D:** Sai vì Amazon Inspector là dịch vụ quét lỗ hổng bảo mật, không chạy unit test `npm test`.

</details>

### Câu 15 `medium`

A company runs an AWS CodeBuild project that downloads 800 MB of dependencies on every build, causing slow CI times. The team already tried S3 caching, which helped somewhat, but Docker layer builds are still slow. Which CodeBuild cache option caches Docker image layers locally on the build host for the fastest Docker builds?

- **A.** Enable Local Caching with `LOCAL_DOCKER_LAYER_CACHE` (and `LOCAL_CUSTOM_CACHE`) on the CodeBuild project.
- **B.** Move the multi-stage Docker build execution into an AWS Lambda function triggered by CodeBuild.
- **C.** Store intermediate Docker image layers inside AWS Systems Manager Parameter Store as `SecureString` parameters.
- **D.** Disable `PrivilegedMode` on the CodeBuild project so the Docker daemon skips layer verification.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

2 loại Cache trong **AWS CodeBuild**:
- **S3 Cache**: Lưu sang S3 (tốt cho thư viện như `.m2`, `node_modules` khi build không thường xuyên).
- **Local Cache** (`LOCAL_DOCKER_LAYER_CACHE`, `LOCAL_SOURCE_CACHE`, `LOCAL_CUSTOM_CACHE`): Lưu trên ổ đĩa host -> **nhanh nhất cho Docker build**.

- **A (Đúng):** Đúng! CodeBuild **Local Caching (`LOCAL_DOCKER_LAYER_CACHE`)** lưu trực tiếp các Docker layers trên host cục bộ, nhanh hơn hẳn S3 cache đối với `docker build` (yêu cầu bật `PrivilegedMode`).
- **B:** Sai vì Lambda không chạy Docker daemon để build image.
- **C:** Sai vì Parameter Store chỉ lưu text tối đa 8 KB.
- **D:** Sai vì `PrivilegedMode` bắt buộc phải bật để chạy Docker daemon và `LOCAL_DOCKER_LAYER_CACHE`.

</details>

### Câu 16 `medium`

A developer has an AWS CodeDeploy Blue/Green deployment for an EC2 Auto Scaling Group. During the `BeforeAllowTraffic` / `AfterAllowTraffic` phase, the developer wants to make sure the new Green EC2 instances remain running for 30 minutes after traffic shifts so the team can monitor them—and if needed, quickly reroute traffic back—before CodeDeploy terminates the old Blue instances. Which setting controls how long the original instances are kept?

- **A.** Set `DeletionPolicy: Snapshot` on the original EC2 instances in the CodeDeploy deployment group.
- **B.** Configure the TerminationWaitTime (e.g., 30 minutes) in the CodeDeploy Deployment Group's Blue/Green settings.
- **C.** Set `MaximumEventAgeInSeconds` to 1800 in `appspec.yml` so original EC2 instances remain active.
- **D.** Set `VisibilityTimeout` to 1800 seconds on the Auto Scaling Group to delay original EC2 instance termination during deployments.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

**CodeDeploy Blue/Green Termination Wait Time**:
- Cho phép giữ tập instance/task **Blue** cũ thêm một khoảng thời gian sau khi chuyển traffic sang **Green** để phòng trường hợp cần rollback tức thì.

- **A:** Sai vì đây là thuộc tính CloudFormation, không điều khiển thời gian giữ Blue instances của CodeDeploy.
- **B (Đúng):** Đúng! Trong CodeDeploy Blue/Green Deployment Group, tùy chọn **Terminate the original instances in the deployment group** cho phép đặt **waiting time** (ví dụ 30 phút, tối đa 2 ngày) để giữ lại môi trường Blue cũ trước khi tự động xóa.
- **C:** Sai vì `MaximumEventAgeInSeconds` là cấu hình của AWS Lambda Async Invocation, không phải `appspec.yml`.
- **D:** Sai vì `VisibilityTimeout` là thuộc tính của Amazon SQS.

</details>

### Câu 17 `medium`

A developer deploys a containerized service on Amazon ECS using AWS CodeDeploy Blue/Green deployment. After the new Green task set starts passing ALB health checks, the `AfterAllowTraffic` Lambda validation hook detects a critical bug in the application logic and calls `codedeploy:PutLifecycleEventHookExecutionStatus` with `status: "Failed"`. What happens next?

- **A.** CodeDeploy ignores the `Failed` hook status and permanently deletes the original Blue target group.
- **B.** CodeDeploy stops the deployment, shifts 100% of traffic back to the Blue target group, and terminates the Green task set.
- **C.** CodeDeploy automatically terminates and deletes the entire Amazon ECS cluster upon hook failure.
- **D.** CodeDeploy retries the `AfterAllowTraffic` lifecycle hook infinitely for up to 7 days until the validation check passes.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

**CodeDeploy Validation Hooks**:
- Lambda hook kiểm thử xong **bắt buộc** gọi `codedeploy:PutLifecycleEventHookExecutionStatus` (`Succeeded` hoặc `Failed`).
- Nếu trả về `Failed` (hoặc quá timeout 1 giờ không gọi), CodeDeploy lập tức **Rollback** về bản Blue.

- **A:** Sai vì CodeDeploy luôn tôn trọng kết quả `Failed` của lifecycle hook để bảo vệ production.
- **B (Đúng):** Đúng! Khi bất kỳ hook nào (`BeforeAllowTraffic`, `AfterAllowTraffic`...) báo `Failed` qua `PutLifecycleEventHookExecutionStatus`, CodeDeploy đánh dấu deployment thất bại và **tự động rollback** chuyển toàn bộ traffic về lại Blue target group.
- **C:** Sai vì CodeDeploy chỉ rollback deployment trên ECS service, không xóa cluster.
- **D:** Sai vì hook đã báo kết quả `Failed` rõ ràng nên không retry vô hạn.

</details>

### Câu 18 `medium`

A developer is using AWS CodeDeploy to deploy a containerized application to Amazon ECS using a Blue/Green deployment strategy. In the `appspec.yml` file for an ECS deployment, the developer wants to run an automated integration test Lambda function AFTER the test traffic listener is serving traffic to the replacement task set, but BEFORE production traffic is shifted to the replacement task set. Which lifecycle event hook in `appspec.yml` should the developer use?

- **A.** DownloadBundle
- **B.** ApplicationStop
- **C.** AfterAllowTestTraffic
- **D.** AfterAllowTraffic

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Thứ tự 5 Lifecycle Hooks của **CodeDeploy cho Amazon ECS** (rất hay hỏi trong đề DVA):
1. `BeforeInstall`
2. `AfterInstall`
3. **`AfterAllowTestTraffic`** *(Thời điểm vàng để chạy Integration Test trên Test Listener)*
4. `BeforeAllowTraffic`
5. `AfterAllowTraffic`

- **A:** Sai vì `DownloadBundle` là hook dành riêng cho EC2/On-premises.
- **B:** Sai vì `ApplicationStop` là hook dành cho triển khai trên máy chủ EC2/On-premises, không tồn tại trong `appspec.yml` của ECS hay Lambda.
- **C (Đúng):** Đúng! Trong CodeDeploy cho Amazon ECS, thứ tự các hooks là: `BeforeInstall` -> `AfterInstall` -> **`AfterAllowTestTraffic`** (chạy test trên cổng Test Listener trước khi chuyển lưu lượng Production) -> `BeforeAllowTraffic` -> `AfterAllowTraffic`.
- **D:** Sai vì `AfterAllowTraffic` chỉ chạy SAU KHI lưu lượng Production đã được chuyển sang tập Task mới.

</details>

---

[← Bộ trước](13-dva-iac-cloudformation-sam-cdk.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Bộ tiếp theo →](15-dva-monitoring-troubleshooting.md)
