# Bài tập tình huống — Chủ đề 15: CI/CD Pipelines — CodeCommit, CodeBuild, CodeDeploy & CodePipeline

> CodeBuild buildspec.yml, CodeDeploy appspec.yml (In-place vs Blue/Green), CodePipeline Stages, Actions & Automated Testing.
> **Số câu hỏi:** 18 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A team uses AWS Elastic Beanstalk to host a web application backed by an Amazon RDS PostgreSQL database. Initially, the RDS instance was created inside the Elastic Beanstalk environment configuration. Now the team needs to perform blue/green environment swaps and occasionally terminate old environments without deleting the production database. What is the recommended approach?

- **A.** Store the PostgreSQL database files directly on the EC2 instance store volume of the Elastic Beanstalk Auto Scaling instances.
- **B.** Keep the Amazon RDS DB instance inside the Elastic Beanstalk environment and set `DeletionPolicy: Retain` in `.ebextensions/rds.config`.
- **C.** Create the Amazon RDS instance independently outside Elastic Beanstalk and pass its connection string via Elastic Beanstalk environment properties.
- **D.** Use the `eb clone` CLI command to copy the embedded RDS PostgreSQL instance automatically with every blue/green deployment.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm sử dụng AWS Elastic Beanstalk để lưu trữ một ứng dụng web được hỗ trợ bởi cơ sở dữ liệu Amazon RDS PostgreSQL. Ban đầu, RDS instance được tạo bên trong cấu hình môi trường Elastic Beanstalk. Bây giờ nhóm cần thực hiện hoán đổi môi trường blue/green và thỉnh thoảng chấm dứt các môi trường cũ mà không làm xóa cơ sở dữ liệu production. Cách tiếp cận được khuyến nghị là gì?

**Đáp án đúng:** **C**

Best practice với **Elastic Beanstalk + RDS**:
- **Dev/Test**: Có thể tạo RDS tích hợp trong EB cho nhanh.
- **Production**: Bắt buộc **tách rời (decouple) RDS** tạo độc lập bên ngoài EB, truyền endpoint/credentials qua Environment Properties (hoặc Secrets Manager) và cấu hình Security Group cho phép EB instances kết nối vào RDS.

- **A:** Sai vì Instance Store là dữ liệu tạm thời, sẽ mất sạch khi EC2 stop/terminate hoặc Auto Scaling scale in.
- **B:** Sai vì giữ RDS gắn cứng trong EB environment khiến việc Blue/Green deploy (tạo môi trường mới dùng chung DB) trở nên phức tạp; tách RDS ra ngoài là best practice chính thức của AWS.
- **C (Đúng):** Đúng! Với môi trường Production, AWS khuyến nghị tách rời (decouple) RDS khỏi vòng đời Elastic Beanstalk. Nếu tạo RDS bên trong EB, khi terminate môi trường EB, RDS cũng bị xóa theo (trừ khi có snapshot), gây rủi ro mất dữ liệu và khó Blue/Green swap.
- **D:** Sai vì `eb clone` tạo môi trường mới; nếu RDS nằm trong EB thì sẽ tạo một database mới tách biệt dữ liệu với môi trường cũ.

</details>

### Câu 2 `medium`

A developer is using AWS CodeDeploy to deploy an updated web application to an Amazon EC2 Auto Scaling group using an in-place deployment. After the new code is started on each instance, the team wants to run a smoke-test script (`validate.sh`) on the instance before the Application Load Balancer routes production traffic to it. Which lifecycle event hook in `appspec.yml` should run `validate.sh`?

- **A.** `DownloadBundle`
- **B.** `BeforeInstall`
- **C.** `AfterAllowTraffic`
- **D.** `ValidateService`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer đang sử dụng AWS CodeDeploy để triển khai một ứng dụng web đã cập nhật lên một Amazon EC2 Auto Scaling group bằng chiến lược triển khai tại chỗ (in-place deployment). Sau khi mã mới được khởi chạy trên mỗi instance, nhóm muốn chạy một script kiểm thử khói (`validate.sh`) trên instance trước khi Application Load Balancer định tuyến lưu lượng production tới nó. Lifecycle event hook nào trong `appspec.yml` nên chạy `validate.sh`?

**Đáp án đúng:** **D**

Thứ tự **CodeDeploy EC2 Lifecycle Hooks** (`appspec.yml`):
`ApplicationStop` -> *(DownloadBundle)* -> `BeforeInstall` -> *(Install)* -> `AfterInstall` -> `ApplicationStart` -> **`ValidateService`**.
(Với **Lambda / ECS**: `BeforeAllowTraffic` -> *(AllowTraffic)* -> `AfterAllowTraffic`).

- **A:** Sai vì `DownloadBundle` là bước nội bộ của CodeDeploy Agent để tải artifact, không cho phép gắn script tùy chỉnh.
- **B:** Sai vì `BeforeInstall` chạy trước khi giải nén code mới, lúc đó ứng dụng mới chưa được cài đặt hay khởi chạy.
- **C:** Sai vì `AfterAllowTraffic` là hook của **ECS / Lambda / Blue-Green**, không phải hook của EC2 in-place trước khi nhận traffic (và nó chạy *sau* khi traffic đã mở).
- **D (Đúng):** Đúng! Trong CodeDeploy EC2/On-Premises, thứ tự các lifecycle hooks là: `ApplicationStop` -> `DownloadBundle` -> `BeforeInstall` -> `Install` -> `AfterInstall` -> `ApplicationStart` -> **`ValidateService`** (chạy cuối cùng để kiểm tra sức khỏe ứng dụng trước khi gắn lại vào Load Balancer).

</details>

### Câu 3 `medium`

A company uses AWS CodePipeline to automate deployments from GitHub to staging and then to production. Compliance rules require that a release manager review the staging environment and explicitly approve the release before CodePipeline deploys to production. An email notification must be sent to the release manager when an approval is needed. How should this be implemented in CodePipeline?

- **A.** Disable the stage transition between Staging and Production permanently and trigger Production deployments manually via CLI.
- **B.** Add a CodeBuild stage between Staging and Production that runs `sleep 86400` until the release manager manually cancels the build.
- **C.** Use an AWS Lambda action in the Staging stage that throws an exception until a DynamoDB approval flag is set to `approved`.
- **D.** Add a `Manual` approval action to a stage between Staging and Production, and configure it with an Amazon SNS topic ARN.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty sử dụng AWS CodePipeline để tự động hóa việc triển khai từ GitHub lên staging và sau đó lên production. Quy định tuân thủ yêu cầu một release manager xem xét môi trường staging và phê duyệt rõ ràng bản phát hành trước khi CodePipeline triển khai lên production. Một thông báo email phải được gửi đến release manager khi cần phê duyệt. Điều này nên được triển khai như thế nào trong CodePipeline?

**Đáp án đúng:** **D**

**AWS CodePipeline Manual Approval**:
- Đặt ở giữa giai đoạn Staging và Production.
- Gắn **SNS Topic** để gửi thông báo ngay khi pipeline dừng chờ duyệt.
- Nếu không có ai duyệt trong **7 ngày**, action sẽ tự động hết hạn (timeout/fail).

- **A:** Sai vì tắt transition chỉ chặn luồng tự động mà không gửi thông báo SNS hay tạo luồng duyệt chuẩn có audit log (tuy nhiên vẫn dùng thủ công được nếu không cần SNS/comment).
- **B:** Sai vì CodeBuild tính phí theo phút chạy, timeout tối đa 8 giờ và không phải cơ chế phê duyệt chuẩn.
- **C:** Sai vì ném exception sẽ đánh dấu pipeline là Failed chứ không tạm dừng chờ duyệt.
- **D (Đúng):** Đúng! CodePipeline hỗ trợ action type **Manual Approval** (`Approval` category) có thể gắn **SNS Topic ARN** để gửi email/Slack thông báo cho người duyệt; pipeline sẽ tạm dừng tại bước này cho đến khi được Approve/Reject (tối đa 7 ngày).

</details>

### Câu 4 `medium`

A company builds Node.js and Python microservices using AWS CodeBuild inside a private VPC without internet access. The team wants to share internal libraries privately across teams while also caching public packages from npm and PyPI locally in AWS. Which TWO actions should the developer take? (Choose two.)

- **A.** Create an AWS CodeArtifact domain and repository with external connections to `public:npmjs` and `public:pypi`.
- **B.** Create Interface VPC Endpoints for `codeartifact.api` and `codeartifact.repositories` (plus S3 Gateway Endpoint) for offline CodeBuild access.
- **C.** Store all `node_modules` tarballs and Python `.whl` files directly inside AWS Secrets Manager encrypted with KMS.
- **D.** Push all internal npm and PyPI packages as OCI artifacts to Amazon ECR Public Gallery for CodeBuild retrieval.
- **E.** Use AWS CodeCommit repositories as a live PyPI and npm package registry server over HTTPS VPC endpoints.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty build các microservice Node.js và Python bằng AWS CodeBuild bên trong một private VPC không có truy cập internet. Nhóm muốn chia sẻ các thư viện nội bộ một cách riêng tư giữa các nhóm đồng thời cache các package công khai từ npm và PyPI cục bộ trong AWS. Developer nên thực hiện HAI hành động nào? (Chọn hai đáp án.)

**Đáp án đúng:** **A, B**

**AWS CodeArtifact** là dịch vụ Artifact Repository được quản lý hoàn toàn:
- Hỗ trợ **npm, PyPI, Maven, Gradle, NuGet, Swift, RubyGems**.
- **Upstream / External Connections**: Tự động tải và cache gói từ public registry (`npmjs`, `pypi`) về repo nội bộ.
- Hỗ trợ **VPC PrivateLink** (cần cả endpoint cho `codeartifact.api`, `codeartifact.repositories` và S3 Gateway Endpoint).

- **A (Đúng):** Đúng! AWS CodeArtifact là dịch vụ quản lý artifact riêng tư (npm, PyPI, Maven, NuGet) hỗ trợ External Connection để tự động cache các gói công khai từ npmjs/PyPI về AWS.
- **B (Đúng):** Đúng! Vì CodeBuild chạy trong private VPC không có internet, cần Interface VPC Endpoint cho CodeArtifact (và S3 Gateway Endpoint để tải payload artifact) để kết nối hoàn toàn qua mạng riêng.
- **C:** Sai vì Secrets Manager có giới hạn kích thước nhỏ (64 KB) và chỉ dùng để lưu chuỗi bí mật, không phải package registry.
- **D:** Sai vì ECR là Docker container registry, không phải npm/PyPI package registry, và Public Gallery sẽ làm lộ thư viện nội bộ ra công khai.
- **E:** Sai vì CodeCommit chỉ là Git repository, không hỗ trợ giao thức registry của npm/PyPI hay caching gói public.

</details>

### Câu 5 `medium`

A team uses AWS CodeDeploy to perform Blue/Green deployments for an Amazon ECS Fargate service behind an Application Load Balancer (ALB). Before shifting production traffic from the Blue target group to the Green target group, the QA team wants to send test requests to the Green tasks on port `8443` and run a `BeforeAllowTraffic` validation Lambda. How does CodeDeploy route test traffic to the Green task set?

- **A.** Create a second Application Load Balancer and update Amazon Route 53 weighted DNS records inside the AppSpec `BeforeInstall` hook.
- **B.** Set `DeploymentType: IN_PLACE` in the CodeDeploy Deployment Group and route port `8443` directly to the Blue target group.
- **C.** Configure a Test Listener (`8443`) on the ALB in the Deployment Group, and specify the `BeforeAllowTraffic` Lambda hook in `appspec.yml`.
- **D.** Disable health checks on the ALB Target Group during deployment so Green tasks receive traffic immediately on port `8443`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm sử dụng AWS CodeDeploy để thực hiện triển khai Blue/Green cho một dịch vụ Amazon ECS Fargate phía sau một Application Load Balancer (ALB). Trước khi chuyển lưu lượng production từ target group Blue sang target group Green, nhóm QA muốn gửi các request kiểm thử tới các task Green trên cổng `8443` và chạy một Lambda xác thực `BeforeAllowTraffic`. CodeDeploy định tuyến lưu lượng kiểm thử tới task set Green như thế nào?

**Đáp án đúng:** **C**

**CodeDeploy ECS Blue/Green Deployment**:
- Dùng **1 ALB** + **2 Target Groups** + **Production Listener** + **Test Listener** (tùy chọn).
- Thứ tự hooks trong `appspec.yml` cho ECS: `BeforeInstall` -> `AfterInstall` -> `AfterAllowTestTraffic` -> `BeforeAllowTraffic` -> `AfterAllowTraffic`.

- **A:** Sai vì CodeDeploy ECS Blue/Green sử dụng 1 ALB duy nhất với 2 Target Groups và không có hook `BeforeInstall` (ECS chỉ có `BeforeInstall`, `AfterInstall`, `AfterAllowTestTraffic`, `BeforeAllowTraffic`, `AfterAllowTraffic`).
- **B:** Sai vì ECS trên CodeDeploy chỉ hỗ trợ Blue/Green deployment (`BLUE_GREEN`), không hỗ trợ In-Place.
- **C (Đúng):** Đúng! Trong **CodeDeploy ECS Blue/Green**, ALB có 2 Target Groups (Blue & Green) và 2 Listeners: **Production Listener** (443) và **Test Listener** (ví dụ 8443). CodeDeploy tạm thời trỏ Test Listener vào Green target group để hook `BeforeAllowTraffic` kiểm thử trước khi đổi Production Listener.
- **D:** Sai vì tắt health check làm mất khả năng kiểm tra sức khỏe Green tasks trước khi chuyển traffic.

</details>

### Câu 6 `medium`

An AWS CodeBuild project needs to log in to a private npm registry and run integration tests using a database password stored in AWS Secrets Manager (`prod/ci/db-pass`). How can the developer securely inject this secret into the CodeBuild environment without hardcoding it in `buildspec.yml`?

- **A.** Define the database password in plaintext under the `env.variables` section in `buildspec.yml` and restrict Git repository access.
- **B.** Pass the Secrets Manager ARN in `env.exported-variables` so CodeBuild resolves it automatically during the `pre_build` phase.
- **C.** Store the database password in `artifacts.files` so it is uploaded to the CodePipeline S3 artifact bucket and read at runtime.
- **D.** Reference the secret under `env.secrets-manager` in `buildspec.yml` and grant the CodeBuild role `secretsmanager:GetSecretValue`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một dự án AWS CodeBuild cần đăng nhập vào một private npm registry và chạy kiểm thử tích hợp bằng mật khẩu cơ sở dữ liệu được lưu trữ trong AWS Secrets Manager (`prod/ci/db-pass`). Làm thế nào developer có thể đưa secret này vào môi trường CodeBuild một cách an toàn mà không cần hardcode trong `buildspec.yml`?

**Đáp án đúng:** **D**

Trong **`buildspec.yml` của AWS CodeBuild**:
- **`env.variables`**: Biến thường (plaintext).
- **`env.parameter-store`**: Lấy từ SSM Parameter Store (hỗ trợ `SecureString`).
- **`env.secrets-manager`**: Lấy từ AWS Secrets Manager (cú pháp `VAR_NAME: secret-id:json-key`).

- **A:** Sai vì lưu mật khẩu dạng plaintext trong Git (`buildspec.yml`) vi phạm bảo mật nghiêm trọng.
- **B:** Sai vì `exported-variables` dùng để xuất biến từ CodeBuild ra các stage sau của CodePipeline, không dùng để đọc từ Secrets Manager.
- **C:** Sai vì `artifacts.files` dùng để đóng gói đầu ra của quá trình build.
- **D (Đúng):** Đúng! CodeBuild hỗ trợ sẵn `env.secrets-manager` (và `env.parameter-store`) trong `buildspec.yml`, tự động lấy giá trị lúc chạy và **che (mask) giá trị bí mật** khỏi build logs.

</details>

### Câu 7 `medium`

A team runs automated JUnit unit tests and code coverage checks inside AWS CodeBuild. Instead of parsing raw console logs to see which test cases failed, the developers want a visual test summary report (pass/fail counts, duration, stack traces) directly inside the AWS CodeBuild console. How should `buildspec.yml` be configured?

- **A.** Add the JUnit XML test output files to `artifacts.secondary-artifacts` in `buildspec.yml` without configuring a `reports` block.
- **B.** Add a `reports` section in `buildspec.yml` with `file-format: JUNITXML`, and grant `codebuild:CreateReportGroup` / `BatchPutTestCases` to the role.
- **C.** Enable `PrivilegedMode` on the CodeBuild project environment so the Docker daemon renders JUnit test summary reports.
- **D.** Send the raw JUnit XML output file to an Amazon SQS queue in the `post_build` phase using the AWS CLI.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm chạy các unit test JUnit tự động và kiểm tra độ phủ mã (code coverage) bên trong AWS CodeBuild. Thay vì phân tích log console thô để xem test case nào thất bại, các developer muốn có một báo cáo tóm tắt kiểm thử trực quan (số lượng pass/fail, thời lượng, stack trace) ngay trong AWS CodeBuild console. Tệp `buildspec.yml` nên được cấu hình như thế nào?

**Đáp án đúng:** **B**

**AWS CodeBuild Test Reports**:
- Khai báo trong mục **`reports`** của `buildspec.yml` (hỗ trợ cả **Test reports** như `JUNITXML` và **Code coverage** như `JACOCOXML`, `COBERTURAXML`).
- Cần cấp quyền `codebuild:CreateReportGroup`, `codebuild:CreateReport`, `codebuild:UpdateReport`, `codebuild:BatchPutTestCases` cho CodeBuild Role.

- **A:** Sai vì đưa vào `artifacts` chỉ lưu file XML lên S3 chứ không hiển thị giao diện Test Report trên CodeBuild console.
- **B (Đúng):** Đúng! Phần **`reports`** trong `buildspec.yml` cho phép CodeBuild Report Groups tự động đọc các file kết quả test (`JUNITXML`, `CUCUMBERJSON`, `NUNITXML`, `CLOVERXML`, `JACOCOXML`...) và hiển thị biểu đồ/chi tiết pass/fail ngay trên AWS Console.
- **C:** Sai vì `PrivilegedMode` chỉ dùng để build Docker image.
- **D:** Sai vì SQS không phải nơi hiển thị CodeBuild Test Reports.

</details>

### Câu 8 `medium`

A development team uses AWS CodePipeline to deploy a containerized application to Amazon ECS whenever a new Docker image with the `prod` tag is pushed to an Amazon ECR repository, AND wants to send a Slack/email notification whenever any pipeline execution enters the `FAILED` state. Which TWO EventBridge configurations satisfy these requirements? (Choose two.)

- **A.** Configure an AWS CodeBuild project to poll the Amazon ECR repository every 5 seconds in an infinite build loop for `prod` image tags.
- **B.** Use an Amazon S3 Lifecycle rule on the artifact bucket to detect `FAILED` CodePipeline executions and notify Slack.
- **C.** Use the ECR source action in CodePipeline (EventBridge rule matching `ECR Image Action` `PUSH` for tag `prod`) to trigger the pipeline.
- **D.** Attach an Amazon API Gateway Lambda Authorizer directly to the Amazon ECR repository to trigger CodePipeline on push.
- **E.** Create an EventBridge rule matching `source: ["aws.codepipeline"]` and `detail.state: ["FAILED"]` targeting an SNS topic (or AWS Chatbot).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm phát triển sử dụng AWS CodePipeline để triển khai một ứng dụng container lên Amazon ECS bất cứ khi nào một Docker image mới với tag `prod` được push lên một Amazon ECR repository, VÀ muốn gửi thông báo Slack/email bất cứ khi nào có lần thực thi pipeline nào chuyển sang trạng thái `FAILED`. HAI cấu hình EventBridge nào đáp ứng các yêu cầu này? (Chọn hai đáp án.)

**Đáp án đúng:** **C, E**

**AWS CodePipeline + Amazon EventBridge**:
- **Trigger Pipeline**: EventBridge rule bắt sự kiện từ CodeCommit, S3, hoặc **Amazon ECR** (khi push tag mới).
- **Giám sát trạng thái**: EventBridge bắt sự kiện **`CodePipeline Pipeline Execution State Change`** (`FAILED`, `SUCCEEDED`) gửi tới SNS / Lambda / AWS Chatbot.

- **A:** Sai vì polling liên tục gây lãng phí chi phí CodeBuild; EventBridge cung cấp kích hoạt hướng sự kiện tức thì.
- **B:** Sai vì S3 Lifecycle không theo dõi trạng thái của CodePipeline.
- **C (Đúng):** Đúng! CodePipeline tích hợp Amazon EventBridge để lắng nghe sự kiện `ECR Image Action` (`result: SUCCESS`, `action-type: PUSH`, `image-tag: prod`) và tự động kích hoạt pipeline.
- **D:** Sai vì ECR không sử dụng Lambda Authorizer của API Gateway.
- **E (Đúng):** Đúng! CodePipeline phát sự kiện thay đổi trạng thái (`STARTED`, `SUCCEEDED`, `FAILED`) lên **Amazon EventBridge**, cho phép lọc `detail.state: ["FAILED"]` để gửi thông báo qua SNS / AWS Chatbot.

</details>

### Câu 9 `medium`

A company has an AWS Elastic Beanstalk environment running a Node.js API. During a major release, the team wants to test the new application version with **10% of live production traffic** for 30 minutes while 90% of traffic stays on the current version, and automatically shift 100% if no issues occur. Which Elastic Beanstalk deployment policy supports this natively?

- **A.** `AllAtOnce` (in-place update)
- **B.** `Rolling` (batch-by-batch update)
- **C.** `TrafficSplitting` (Canary testing)
- **D.** `Immutable` (full ASG instance replacement)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có một môi trường AWS Elastic Beanstalk đang chạy một API Node.js. Trong một bản phát hành lớn, nhóm muốn kiểm thử phiên bản ứng dụng mới với **10% lưu lượng production thực tế** trong 30 phút trong khi 90% lưu lượng vẫn ở phiên bản hiện tại, và tự động chuyển 100% nếu không có sự cố nào xảy ra. Chính sách triển khai Elastic Beanstalk nào hỗ trợ sẵn điều này?

**Đáp án đúng:** **C**

**Elastic Beanstalk `TrafficSplitting`**: Chính sách chuyên dụng cho **Canary Deployment** trên Elastic Beanstalk (chia % traffic sang tập instance mới trong N phút trước khi chuyển toàn bộ).

- **A:** Sai vì `AllAtOnce` ghi đè 100% instance cùng lúc, gây downtime.
- **B:** Sai vì `Rolling` cập nhật từng nhóm instance cho đến khi hết 100%, không giữ mức chia 10% cố định trong 30 phút để theo dõi canary.
- **C (Đúng):** Đúng! **`TrafficSplitting`** tạo các instance mới cho phiên bản mới, chuyển một tỷ lệ phần trăm traffic (ví dụ 10%) sang trong một khoảng thời gian cấu hình, rồi tự chuyển 100% nếu healthy.
- **D:** Sai vì `Immutable` chuyển toàn bộ 100% traffic sang ASG mới ngay khi health check pass, không chia 10% traffic.

</details>

### Câu 10 `medium`

A development team uses AWS CodeBuild to compile a large Node.js monorepo. To keep build times fast, they want CodeBuild to pass the compiled `dist/` folder to the next stage in AWS CodePipeline, AND also export the generated Docker image tag (`IMAGE_TAG`) as a variable so the subsequent Deploy stage can use it. How should `buildspec.yml` be configured?

- **A.** List both `dist/**/*` and `IMAGE_TAG` under `cache.paths` in `buildspec.yml` for downstream stages.
- **B.** Write `IMAGE_TAG` into `/tmp/env.txt` during `post_build` without declaring `env.exported-variables`.
- **C.** List `dist/**/*` under `artifacts.files` and list `IMAGE_TAG` under `env.exported-variables`.
- **D.** Put `dist/**/*` under `reports.files` in `buildspec.yml` so CodePipeline packages it as an output artifact.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm phát triển sử dụng AWS CodeBuild để biên dịch một monorepo Node.js lớn. Để giữ thời gian build nhanh, họ muốn CodeBuild truyền thư mục `dist/` đã biên dịch sang stage tiếp theo trong AWS CodePipeline, VÀ đồng thời xuất Docker image tag đã tạo (`IMAGE_TAG`) dưới dạng một biến để Deploy stage tiếp theo có thể sử dụng. Tệp `buildspec.yml` nên được cấu hình như thế nào?

**Đáp án đúng:** **C**

Trong **`buildspec.yml`** tích hợp **CodePipeline**:
- **`artifacts.files`**: File đầu ra truyền sang stage sau.
- **`env.exported-variables`**: Biến môi trường xuất ra cho stage sau dùng (`#{Namespace.VAR}`).
- **`cache.paths`**: Thư mục cache dùng lại cho các lần build sau.

- **A:** Sai vì `cache.paths` chỉ dùng để cache dependencies giữa các lần chạy CodeBuild, không truyền artifact hay biến sang stage sau của CodePipeline.
- **B:** Sai vì CodePipeline không tự đọc `/tmp/env.txt` của container CodeBuild.
- **C (Đúng):** Đúng! `artifacts.files` đóng gói file đầu ra (`dist/**/*`) gửi lên S3 artifact store của CodePipeline, còn **`env.exported-variables`** xuất các biến môi trường (như `IMAGE_TAG`) để các action ở stage sau tham chiếu qua cú pháp `#{BuildVariables.IMAGE_TAG}`.
- **D:** Sai vì `reports` chỉ dành cho test reports / code coverage.

</details>

### Câu 11 `medium`

A company runs a fleet of 20 on-premises Linux servers alongside 10 Amazon EC2 instances and wants to use a single deployment service to push updated application binaries to all 30 servers in a rolling fashion with zero-downtime health checks. Which AWS service supports deploying to BOTH EC2 instances and on-premises servers?

- **A.** AWS CodeDeploy
- **B.** AWS Elastic Beanstalk
- **C.** AWS SAM
- **D.** Amazon ECR

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty vận hành một đội gồm 20 máy chủ Linux tại on-premises cùng với 10 Amazon EC2 instance và muốn sử dụng một dịch vụ triển khai duy nhất để đẩy các tệp nhị phân ứng dụng đã cập nhật tới tất cả 30 máy chủ theo kiểu rolling với kiểm tra sức khỏe không gián đoạn (zero-downtime health checks). Dịch vụ AWS nào hỗ trợ triển khai lên CẢ EC2 instance lẫn máy chủ on-premises?

**Đáp án đúng:** **A**

4 nền tảng đích của **AWS CodeDeploy**:
1. **Amazon EC2**
2. **On-Premises Servers** (cài CodeDeploy Agent)
3. **AWS Lambda**
4. **Amazon ECS**

- **A (Đúng):** Đúng! **AWS CodeDeploy** hỗ trợ triển khai đồng nhất tới **Amazon EC2**, **On-Premises Servers** (cài CodeDeploy Agent + đăng ký bằng IAM User/STS), **AWS Lambda**, và **Amazon ECS**.
- **B:** Sai vì Elastic Beanstalk chỉ quản lý tài nguyên trên AWS Cloud (EC2/ASG/ALB), không deploy xuống máy chủ on-premises.
- **C:** Sai vì AWS SAM chỉ dùng cho ứng dụng Serverless trên AWS.
- **D:** Sai vì ECR chỉ là kho lưu trữ Docker image, không phải dịch vụ điều phối deployment.

</details>

### Câu 12 `medium`

A developer uses AWS CodeBuild inside a private VPC subnet to run integration tests against an internal Amazon RDS database. When the CodeBuild job starts, it fails with an error stating it cannot download source code or upload artifacts to Amazon S3. What is required for a VPC-connected CodeBuild project to access AWS services like S3 and ECR?

- **A.** Place CodeBuild in a public VPC subnet with a route to an Internet Gateway and no NAT Gateway.
- **B.** Place CodeBuild in private subnets routed to a NAT Gateway (or use S3/ECR/Logs VPC Endpoints) with outbound Security Group access.
- **C.** Disable VPC configuration on the CodeBuild project and make the RDS database publicly accessible on `0.0.0.0/0`.
- **D.** Enable `PrivilegedMode` on the CodeBuild project environment so it can bypass VPC subnet route tables.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer sử dụng AWS CodeBuild bên trong một private VPC subnet để chạy kiểm thử tích hợp với một cơ sở dữ liệu Amazon RDS nội bộ. Khi job CodeBuild bắt đầu, nó thất bại với lỗi thông báo không thể tải xuống mã nguồn hoặc tải lên artifact vào Amazon S3. Cần những gì để một dự án CodeBuild kết nối VPC có thể truy cập các dịch vụ AWS như S3 và ECR?

**Đáp án đúng:** **B**

**CodeBuild in VPC**:
- Giống như Lambda in VPC, CodeBuild ENI **không có Public IP** -> phải đặt ở **Private Subnet** + **NAT Gateway** (hoặc **VPC Endpoints**).

- **A:** Sai vì ENI của CodeBuild trong VPC không được gán Public IP, nên không thể đi thẳng qua Internet Gateway.
- **B (Đúng):** Đúng! CodeBuild trong VPC **không có Public IP**, nên đặt trong public subnet với IGW vẫn sẽ bị lỗi kết nối. Bắt buộc đặt CodeBuild trong **Private Subnet** có **NAT Gateway** (hoặc dùng đầy đủ **VPC Endpoints** cho S3, ECR, Logs, Secrets Manager).
- **C:** Sai vì mở RDS ra internet công khai vi phạm bảo mật nghiêm trọng.
- **D:** Sai vì `PrivilegedMode` chỉ để chạy Docker daemon, không cấp quyền ra mạng.

</details>

### Câu 13 `medium`

A developer uses AWS CodeBuild to run `docker build` and push an image to Amazon ECR. Inside `buildspec.yml`, the developer runs `aws ecr get-login-password` to authenticate Docker to ECR, but the command fails with `AccessDeniedException` on `ecr:GetAuthorizationToken`. How should this be fixed?

- **A.** Add `ecr:GetAuthorizationToken` and ECR push permissions to the developer's local `~/.aws/credentials` profile.
- **B.** Disable `PrivilegedMode` on the CodeBuild project environment so `docker push` runs without elevated privileges.
- **C.** Attach `ecr:GetAuthorizationToken` (`Resource: "*"`) and ECR push permissions (`PutImage`, `UploadLayerPart`, etc.) to the CodeBuild Service Role.
- **D.** Set `Resource` to the CodePipeline S3 artifact bucket ARN for the `ecr:GetAuthorizationToken` IAM statement.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer sử dụng AWS CodeBuild để chạy `docker build` và push một image lên Amazon ECR. Bên trong `buildspec.yml`, developer chạy `aws ecr get-login-password` để xác thực Docker với ECR, nhưng lệnh thất bại với lỗi `AccessDeniedException` trên `ecr:GetAuthorizationToken`. Sự cố này nên được khắc phục như thế nào?

**Đáp án đúng:** **C**

Push Docker image từ **CodeBuild -> Amazon ECR**:
1. Bật **`PrivilegedMode: true`** trên CodeBuild Environment.
2. Cấp **`ecr:GetAuthorizationToken`** (`Resource: "*"`) + quyền push ECR cho **CodeBuild Service Role**.

- **A:** Sai vì CodeBuild chạy trên máy chủ AWS bằng Service Role của nó, không dùng file local trên máy developer.
- **B:** Sai vì tắt `PrivilegedMode` sẽ làm `docker build` hỏng luôn.
- **C (Đúng):** Đúng! CodeBuild sử dụng **CodeBuild Service Role** để gọi AWS APIs trong quá trình build. Lưu ý rằng `ecr:GetAuthorizationToken` bắt buộc `Resource: "*"`, còn các quyền push image chỉ định ARN của repository.
- **D:** Sai vì `ecr:GetAuthorizationToken` là hành động cấp tài khoản không gắn với ARN của 1 repository hay S3 bucket cụ thể (phải để `Resource: "*"`).

</details>

### Câu 14 `medium`

A team uses AWS CodeCommit (or GitHub) with AWS CodePipeline. Occasionally, a developer pushes a commit that breaks unit tests, and the team wants to automatically run `npm test` on every **Pull Request** and post the pass/fail status back to the Pull Request *before* allowing a merge into `main`. Which service should run the Pull Request validation checks?

- **A.** Configure AWS CodeDeploy to automatically deploy every open Pull Request directly to Production for automated smoke testing.
- **B.** Run `sam package` and `npm test` manually on every developer laptop before pushing commits to GitHub.
- **C.** Trigger AWS CodeBuild via webhook/EventBridge on Pull Request events to run `npm test` and report status back to the PR.
- **D.** Use Amazon Inspector automated vulnerability scanning to execute `npm test` on open GitHub Pull Requests.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm sử dụng AWS CodeCommit (hoặc GitHub) với AWS CodePipeline. Thỉnh thoảng, một developer push một commit làm hỏng unit test, và nhóm muốn tự động chạy `npm test` trên mọi **Pull Request** rồi đăng trạng thái pass/fail ngược lại Pull Request *trước khi* cho phép merge vào `main`. Dịch vụ nào nên chạy các bước kiểm tra xác thực Pull Request?

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

- **A.** Store intermediate Docker image layers inside AWS Systems Manager Parameter Store as KMS-encrypted `StringList` parameter values.
- **B.** Disable `PrivilegedMode` on the CodeBuild project environment to speed up container image builds.
- **C.** Move the entire `docker build` step into an AWS Lambda function triggered by CodePipeline.
- **D.** Enable Local Caching with `LOCAL_DOCKER_LAYER_CACHE` (and `LOCAL_CUSTOM_CACHE` / `LOCAL_SOURCE_CACHE`) on CodeBuild.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty chạy một dự án AWS CodeBuild tải xuống 800 MB các dependency ở mỗi lần build, khiến thời gian CI bị chậm. Nhóm đã thử sử dụng S3 caching, giúp cải thiện phần nào, nhưng quá trình build Docker layer vẫn chậm. Tùy chọn cache nào của CodeBuild lưu trữ các Docker image layer cục bộ trên máy chủ build để đạt tốc độ build Docker nhanh nhất?

**Đáp án đúng:** **D**

2 loại Cache trong **AWS CodeBuild**:
- **S3 Cache**: Lưu sang S3 (tốt cho thư viện như `.m2`, `node_modules` khi build không thường xuyên).
- **Local Cache** (`LOCAL_DOCKER_LAYER_CACHE`, `LOCAL_SOURCE_CACHE`, `LOCAL_CUSTOM_CACHE`): Lưu trên ổ đĩa host -> **nhanh nhất cho Docker build**.

- **A:** Sai vì Parameter Store chỉ lưu text tối đa 8 KB.
- **B:** Sai vì `PrivilegedMode` bắt buộc phải bật để chạy Docker daemon và `LOCAL_DOCKER_LAYER_CACHE`.
- **C:** Sai vì Lambda không chạy Docker daemon để build image.
- **D (Đúng):** Đúng! CodeBuild **Local Caching (`LOCAL_DOCKER_LAYER_CACHE`)** lưu trực tiếp các Docker layers trên host cục bộ, nhanh hơn hẳn S3 cache đối với `docker build` (yêu cầu bật `PrivilegedMode`).

</details>

### Câu 16 `medium`

A developer has an AWS CodeDeploy Blue/Green deployment for an EC2 Auto Scaling Group. During the `BeforeAllowTraffic` / `AfterAllowTraffic` phase, the developer wants to make sure the new Green EC2 instances remain running for 30 minutes after traffic shifts so the team can monitor them—and if needed, quickly reroute traffic back—before CodeDeploy terminates the old Blue instances. Which setting controls how long the original instances are kept?

- **A.** Set `MaximumEventAgeInSeconds` to `1800` seconds inside `appspec.yml` under the `AfterAllowTraffic` lifecycle hook.
- **B.** Set `VisibilityTimeout` to `1800` seconds on the EC2 Auto Scaling Group's lifecycle hook.
- **C.** Set `DeletionPolicy: Snapshot` on the Blue EC2 instances in the CloudFormation template.
- **D.** Configure TerminationWaitTime (e.g., 30 minutes) in the CodeDeploy Deployment Group's Blue/Green settings.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer có một lần triển khai AWS CodeDeploy Blue/Green cho một EC2 Auto Scaling Group. Trong giai đoạn `BeforeAllowTraffic` / `AfterAllowTraffic`, developer muốn đảm bảo các Green EC2 instance mới tiếp tục chạy trong 30 phút sau khi lưu lượng chuyển sang để nhóm có thể giám sát chúng—và nếu cần, nhanh chóng định tuyến lưu lượng trở lại—trước khi CodeDeploy chấm dứt các Blue instance cũ. Thiết lập nào kiểm soát thời gian giữ lại các instance ban đầu?

**Đáp án đúng:** **D**

**CodeDeploy Blue/Green Termination Wait Time**:
- Cho phép giữ tập instance/task **Blue** cũ thêm một khoảng thời gian sau khi chuyển traffic sang **Green** để phòng trường hợp cần rollback tức thì.

- **A:** Sai vì `MaximumEventAgeInSeconds` là cấu hình của AWS Lambda Async Invocation, không phải `appspec.yml`.
- **B:** Sai vì `VisibilityTimeout` là thuộc tính của Amazon SQS.
- **C:** Sai vì đây là thuộc tính CloudFormation, không điều khiển thời gian giữ Blue instances của CodeDeploy.
- **D (Đúng):** Đúng! Trong CodeDeploy Blue/Green Deployment Group, tùy chọn **Terminate the original instances in the deployment group** cho phép đặt **waiting time** (ví dụ 30 phút, tối đa 2 ngày) để giữ lại môi trường Blue cũ trước khi tự động xóa.

</details>

### Câu 17 `medium`

A developer deploys a containerized service on Amazon ECS using AWS CodeDeploy Blue/Green deployment. After the new Green task set starts passing ALB health checks, the `AfterAllowTraffic` Lambda validation hook detects a critical bug in the application logic and calls `codedeploy:PutLifecycleEventHookExecutionStatus` with `status: "Failed"`. What happens next?

- **A.** CodeDeploy ignores the `Failed` lifecycle hook status and permanently deletes the original Blue target group.
- **B.** CodeDeploy retries the `AfterAllowTraffic` validation Lambda hook infinitely for up to 7 days until it returns `Succeeded`.
- **C.** CodeDeploy stops the deployment, shifts 100% of production traffic back to Blue, and terminates the Green task set.
- **D.** CodeDeploy immediately deletes the entire Amazon ECS cluster and all running Blue and Green services.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer triển khai một dịch vụ đóng gói container trên Amazon ECS bằng triển khai Blue/Green của AWS CodeDeploy. Sau khi task set Green mới bắt đầu vượt qua các kiểm tra sức khỏe của ALB, hook xác thực Lambda `AfterAllowTraffic` phát hiện một lỗi nghiêm trọng trong logic ứng dụng và gọi `codedeploy:PutLifecycleEventHookExecutionStatus` với `status: "Failed"`. Điều gì xảy ra tiếp theo?

**Đáp án đúng:** **C**

**CodeDeploy Validation Hooks**:
- Lambda hook kiểm thử xong **bắt buộc** gọi `codedeploy:PutLifecycleEventHookExecutionStatus` (`Succeeded` hoặc `Failed`).
- Nếu trả về `Failed` (hoặc quá timeout 1 giờ không gọi), CodeDeploy lập tức **Rollback** về bản Blue.

- **A:** Sai vì CodeDeploy luôn tôn trọng kết quả `Failed` của lifecycle hook để bảo vệ production.
- **B:** Sai vì hook đã báo kết quả `Failed` rõ ràng nên không retry vô hạn.
- **C (Đúng):** Đúng! Khi bất kỳ hook nào (`BeforeAllowTraffic`, `AfterAllowTraffic`...) báo `Failed` qua `PutLifecycleEventHookExecutionStatus`, CodeDeploy đánh dấu deployment thất bại và **tự động rollback** chuyển toàn bộ traffic về lại Blue target group.
- **D:** Sai vì CodeDeploy chỉ rollback deployment trên ECS service, không xóa cluster.

</details>

### Câu 18 `medium`

A developer is using AWS CodeDeploy to deploy a containerized application to Amazon ECS using a Blue/Green deployment strategy. In the `appspec.yml` file for an ECS deployment, the developer wants to run an automated integration test Lambda function AFTER the test traffic listener is serving traffic to the replacement task set, but BEFORE production traffic is shifted to the replacement task set. Which lifecycle event hook in `appspec.yml` should the developer use?

- **A.** `DownloadBundle` (EC2 hook)
- **B.** AfterAllowTestTraffic
- **C.** `ApplicationStop` (EC2 hook)
- **D.** `AfterAllowTraffic` (Post-shift)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer đang sử dụng AWS CodeDeploy để triển khai một ứng dụng container lên Amazon ECS bằng chiến lược triển khai Blue/Green. Trong tệp `appspec.yml` cho một lần triển khai ECS, developer muốn chạy một hàm Lambda kiểm thử tích hợp tự động SAU KHI test traffic listener bắt đầu phục vụ lưu lượng tới task set thay thế, nhưng TRƯỚC KHI lưu lượng production được chuyển sang task set thay thế. Developer nên sử dụng lifecycle event hook nào trong `appspec.yml`?

**Đáp án đúng:** **B**

Thứ tự 5 Lifecycle Hooks của **CodeDeploy cho Amazon ECS** (rất hay hỏi trong đề DVA):
1. `BeforeInstall`
2. `AfterInstall`
3. **`AfterAllowTestTraffic`** *(Thời điểm vàng để chạy Integration Test trên Test Listener)*
4. `BeforeAllowTraffic`
5. `AfterAllowTraffic`

- **A:** Sai vì `DownloadBundle` là hook dành riêng cho EC2/On-premises.
- **B (Đúng):** Đúng! Trong CodeDeploy cho Amazon ECS, thứ tự các hooks là: `BeforeInstall` -> `AfterInstall` -> **`AfterAllowTestTraffic`** (chạy test trên cổng Test Listener trước khi chuyển lưu lượng Production) -> `BeforeAllowTraffic` -> `AfterAllowTraffic`.
- **C:** Sai vì `ApplicationStop` là hook dành cho triển khai trên máy chủ EC2/On-premises, không tồn tại trong `appspec.yml` của ECS hay Lambda.
- **D:** Sai vì `AfterAllowTraffic` chỉ chạy SAU KHI lưu lượng Production đã được chuyển sang tập Task mới.

</details>

---

[← Chủ đề 14](14-iac-cloudformation-sam-cdk.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chủ đề 16 →](16-monitoring-troubleshooting.md)
