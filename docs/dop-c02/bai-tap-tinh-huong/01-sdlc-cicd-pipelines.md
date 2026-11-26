# Bài tập tình huống — CI/CD Pipelines Đa tài khoản: CodeBuild, CodeArtifact & CodePipeline

> CodePipeline Cross-Account với Customer Managed KMS Key, CodeBuild buildspec/caching, CodeArtifact upstream repositories, CodeGuru Reviewer và Amazon Q Developer.
> **Số câu hỏi:** 19 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A DevOps team migrated their container build process to AWS CodeBuild using a standard Linux managed image. The first build fails with the error 'Cannot connect to the Docker daemon at unix:///var/run/docker.sock'. Additionally, after fixing the daemon error, builds take over 12 minutes because base Docker layers and Maven dependencies are re-downloaded on every run. Which configuration changes should the DevOps engineer apply to resolve both issues with the LEAST operational overhead?

- **A.** Install and start the Docker daemon manually in the install phase of buildspec.yml, and store Docker layers in Amazon EFS mounted to the build container.
- **B.** Switch the CodeBuild compute type to BUILD_GENERAL1_2XLARGE and configure an Amazon S3 cache bucket to persist Docker image layers across builds.
- **C.** Enable privilegedMode in the CodeBuild environment, and enable LOCAL_DOCKER_LAYER_CACHE and LOCAL_CUSTOM_CACHE in cache settings.
- **D.** Attach the AmazonEC2ContainerRegistryPowerUser managed policy to the CodeBuild service role and enable VPC mode with private subnets on the project.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm DevOps đã di chuyển quy trình build container của họ sang AWS CodeBuild bằng một standard Linux managed image. Lần build đầu tiên thất bại với lỗi 'Cannot connect to the Docker daemon at unix:///var/run/docker.sock'. Ngoài ra, sau khi sửa lỗi daemon, mỗi lần build mất hơn 12 phút vì các layer Docker cơ bản và các dependency Maven bị tải lại trong mọi lần chạy. Kỹ sư DevOps nên áp dụng những thay đổi cấu hình nào để giải quyết cả hai vấn đề với chi phí vận hành ÍT NHẤT?

**Đáp án đúng:** **C**

Trong AWS CodeBuild, xây dựng Docker image yêu cầu bật privilegedMode (elevated privileges). Để tối ưu tốc độ build Docker và dependencies, Local Cache với LOCAL_DOCKER_LAYER_CACHE và LOCAL_CUSTOM_CACHE là lựa chọn chuẩn xác nhất với ít công sức vận hành nhất.

- **A:** Sai. Nếu không bật privilegedMode thì không thể chạy Docker daemon bên trong container CodeBuild dù có cài đặt thủ công; ngoài ra cấu hình EFS phức tạp hơn so với Local Cache có sẵn.
- **B:** Sai. Tăng kích thước compute không sửa được lỗi thiếu privilegedMode, và S3 cache không hỗ trợ lưu trữ Docker layer hiệu quả bằng LOCAL_DOCKER_LAYER_CACHE.
- **C (Đúng):** Chính xác! Để chạy Docker daemon và build container image bên trong CodeBuild, bắt buộc phải bật privilegedMode: true. Đồng thời, bật LOCAL_DOCKER_LAYER_CACHE giúp tái sử dụng các Docker layer đã build và LOCAL_CUSTOM_CACHE (khai báo thư mục .m2 trong buildspec.yml) giúp giảm mạnh thời gian build mà không cần tự vận hành hạ tầng.
- **D:** Sai. Quyền ECR chỉ phục vụ push/pull image, không liên quan đến lỗi không kết nối được Docker daemon cục bộ hay tăng tốc cache layer.

</details>

### Câu 2 `medium`

An application build in AWS CodeBuild needs to retrieve a database password stored in AWS Secrets Manager and an API endpoint stored in AWS Systems Manager Parameter Store during integration tests. Security auditors require that the password never be hardcoded in buildspec.yml, never be passed as plaintext environment variables in the project configuration, and never appear in CloudWatch Logs. What is the MOST secure and idiomatic way to implement this?

- **A.** Add the database password as a PLAINTEXT environment variable in the CodeBuild project definition and enable KMS encryption on the CloudWatch Log Group.
- **B.** Run aws secretsmanager get-secret-value in the pre_build phase and echo the output to a local .env file sourced by the automated integration test runner.
- **C.** Store both values in an encrypted Amazon S3 bucket and download them during the build using a presigned URL embedded directly in buildspec.yml.
- **D.** Reference the secret ARN in env.secrets-manager and parameter in env.parameter-store of buildspec.yml, and grant GetSecretValue and GetParameters.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một quá trình build ứng dụng trong AWS CodeBuild cần lấy mật khẩu cơ sở dữ liệu được lưu trong AWS Secrets Manager và một API endpoint được lưu trong AWS Systems Manager Parameter Store trong suốt quá trình kiểm thử tích hợp. Kiểm toán viên bảo mật yêu cầu mật khẩu không bao giờ được hardcode trong buildspec.yml, không bao giờ được truyền dưới dạng biến môi trường văn bản thuần (plaintext) trong cấu hình project và không bao giờ xuất hiện trong CloudWatch Logs. Cách triển khai BẢO MẬT NHẤT và chuẩn mực nhất là gì?

**Đáp án đúng:** **D**

AWS CodeBuild hỗ trợ tích hợp native với Secrets Manager (env.secrets-manager) và SSM Parameter Store (env.parameter-store) ngay trong buildspec.yml, giúp giải mã an toàn tại runtime và tự động ẩn giá trị nhạy cảm trong build logs.

- **A:** Sai. Đề bài cấm truyền password dạng plaintext environment variable trong cấu hình project; ngoài ra mã hóa log group không ngăn giá trị bị in ra khi người dùng có quyền đọc log.
- **B:** Sai. Gọi CLI thủ công dễ vô tình làm lộ secret trong log hoặc trong build artifact nếu không dọn dẹp kỹ; dùng tích hợp native env.secrets-manager an toàn và gọn nhẹ hơn nhiều.
- **C:** Sai. Nhúng presigned URL vào buildspec.yml vi phạm nguyên tắc bảo mật và URL sẽ hết hạn theo thời gian.
- **D (Đúng):** Chính xác! Khai báo env.secrets-manager và env.parameter-store trong buildspec.yml cho phép CodeBuild tự động lấy giá trị lúc runtime và tự động che (mask) giá trị bí mật khỏi CloudWatch Logs.

</details>

### Câu 3 `medium`

A company has 15 development teams across multiple AWS accounts within AWS Organizations. Their Node.js and Python builds in AWS CodeBuild frequently fail when public npm or PyPI registries experience outages, and security teams want to prevent dependency confusion attacks while sharing internally published packages across all accounts without managing servers. Which solution should the DevOps architect recommend?

- **A.** Deploy a self-managed Sonatype Nexus Repository server on an Amazon EC2 Auto Scaling group behind an internal Network Load Balancer.
- **B.** Download all public npm and PyPI packages nightly using an AWS Lambda function and sync them to an Amazon S3 bucket accessed via an S3 Gateway VPC Endpoint.
- **C.** Create a CodeArtifact domain with an upstream repository connected to public npm and PyPI, and grant access via a domain policy using aws:PrincipalOrgID.
- **D.** Store all Node.js and Python dependency packages as immutable Docker image layers inside Amazon ECR and extract them during the CodeBuild install phase.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có 15 nhóm phát triển trên nhiều tài khoản AWS trong AWS Organizations. Các quá trình build Node.js và Python của họ trong AWS CodeBuild thường xuyên thất bại khi các registry công khai như npm hoặc PyPI gặp sự cố, và các nhóm bảo mật muốn ngăn chặn các cuộc tấn công dependency confusion trong khi chia sẻ các gói được xuất bản nội bộ trên tất cả các tài khoản mà không cần quản lý máy chủ. Kiến trúc sư DevOps nên đề xuất giải pháp nào?

**Đáp án đúng:** **C**

AWS CodeArtifact là dịch vụ quản lý package/artifact managed của AWS. Thiết lập Domain với Upstream Repository kết nối public registry giúp cache package ổn định, chống tấn công chuỗi cung ứng (dependency confusion) và chia sẻ đa tài khoản dễ dàng qua aws:PrincipalOrgID.

- **A:** Sai. Tự vận hành Nexus trên EC2 vi phạm yêu cầu không quản lý server (without managing servers) và tăng gánh nặng bảo trì, vá lỗi, sao lưu.
- **B:** Sai. Đồng bộ toàn bộ registry công khai bằng Lambda lên S3 là bất khả thi về dung lượng, timeout và không hỗ trợ chuẩn giao thức package manager.
- **C (Đúng):** Chính xác! AWS CodeArtifact là dịch vụ artifact repository hoàn toàn serverless hỗ trợ npm/PyPI/Maven/NuGet, có khả năng kết nối upstream để cache package công khai (chống downtime từ registry ngoài), kiểm soát thứ tự gói nội bộ (chống dependency confusion) và chia sẻ xuyên suốt AWS Organizations qua domain policy.
- **D:** Sai. ECR là container image registry, không phải giải pháp quản lý và phân phối gói phần mềm npm/PyPI.

</details>

### Câu 4 `hard`

A development team uses a monorepo hosted in GitHub connected to AWS CodePipeline (V2). The repository contains three independent microservices under /orders, /payments, and /inventory. Currently, every commit to any directory triggers all three pipelines, and when developers merge multiple PRs rapidly, newer executions overtake older ones in the deployment stage, causing inconsistent database migration ordering. How should the DevOps engineer configure each CodePipeline V2 pipeline?

- **A.** Set the pipeline execution mode to SUPERSEDED and add a CodeBuild stage that runs git diff to abort unaffected microservice builds early.
- **B.** Set the pipeline execution mode to PARALLEL and enable Amazon S3 Object Versioning on the shared CodePipeline artifact bucket.
- **C.** Migrate the pipeline back to CodePipeline V1 and use Amazon EventBridge rules to filter GitHub webhook commit file paths.
- **D.** Configure Git push trigger file path filters (e.g., /orders/**) on each V2 pipeline, and set the pipeline execution mode to QUEUED.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm phát triển sử dụng monorepo lưu trữ trên GitHub kết nối với AWS CodePipeline (V2). Kho lưu trữ chứa ba microservice độc lập trong /orders, /payments và /inventory. Hiện tại, mọi commit vào bất kỳ thư mục nào đều kích hoạt cả ba pipeline, và khi các nhà phát triển gộp nhiều PR liên tiếp nhanh chóng, các lần thực thi mới hơn vượt mặt các lần cũ hơn trong giai đoạn triển khai, gây ra thứ tự migration cơ sở dữ liệu không nhất quán. Kỹ sư DevOps nên cấu hình từng pipeline CodePipeline V2 như thế nào?

**Đáp án đúng:** **D**

CodePipeline V2 cung cấp các tính năng quan trọng cho quy mô enterprise: (1) Trigger lọc theo nhánh/tag/đường dẫn file cho monorepo, và (2) 3 chế độ Execution Mode gồm SUPERSEDED (mặc định, bản mới đè bản cũ), QUEUED (xếp hàng tuần tự, không bỏ sót bản nào), và PARALLEL (chạy song song).

- **A:** Sai. Chế độ SUPERSEDED sẽ cho phép bản mới ghi đè và bỏ qua bản cũ đang chờ, làm sai lệch thứ tự chạy database migration tuần tự.
- **B:** Sai. Chế độ PARALLEL chạy nhiều bản deploy song song cùng lúc, càng làm tăng nguy cơ xung đột (race condition) khi chạy database migration.
- **C:** Sai. CodePipeline V1 không hỗ trợ chế độ QUEUED hay native Git file path filter; nâng cấp/dùng đúng tính năng của V2 mới là giải pháp chuẩn.
- **D (Đúng):** Chính xác! CodePipeline V2 hỗ trợ Git trigger lọc theo đường dẫn file (filePaths includes) cho monorepo để chỉ kích hoạt đúng microservice có thay đổi. Đồng thời, chế độ thực thi QUEUED đảm bảo các lần chạy xếp hàng lần lượt từng bản một, không bỏ qua (supersede) bản chạy trước, giữ đúng thứ tự database migration.

</details>

### Câu 5 `medium`

A platform engineering team defines all application and infrastructure resources using the AWS Cloud Development Kit (AWS CDK) in TypeScript. They need a CI/CD pipeline in a Shared Services account that deploys CDK application stages to Dev, Staging, and Production accounts, AND automatically updates the pipeline's own stages whenever a developer adds a new deployment wave or target account to the CDK source code. What is the BEST approach?

- **A.** Use AWS CDK Pipelines with selfMutation enabled, bootstrap target accounts with --trust to Shared Services, and define environments as CDK Stages.
- **B.** Create a manual AWS CodePipeline in the console and run cdk deploy --all inside CodeBuild using static IAM access keys for each target AWS account.
- **C.** Export the AWS CDK application to CloudFormation YAML templates locally using cdk synth and upload them to CloudFormation StackSets manually.
- **D.** Use AWS CodeStar project templates to generate a multi-account AWS CDK pipeline with automated self-mutation and cross-account IAM roles.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ thuật nền tảng định nghĩa tất cả tài nguyên ứng dụng và hạ tầng bằng AWS Cloud Development Kit (AWS CDK) với TypeScript. Họ cần một CI/CD pipeline trong tài khoản Shared Services để triển khai các giai đoạn ứng dụng CDK tới các tài khoản Dev, Staging và Production, VÀ tự động cập nhật các giai đoạn của chính pipeline đó bất cứ khi nào nhà phát triển thêm một đợt triển khai mới hoặc tài khoản đích mới vào mã nguồn CDK. Cách tiếp cận TỐT NHẤT là gì?

**Đáp án đúng:** **A**

AWS CDK Pipelines là thư viện construct cấp cao trên AWS CodePipeline với hai thế mạnh nổi bật: (1) Self-mutating pipeline (tự cập nhật cấu trúc pipeline từ mã nguồn CDK), và (2) Cross-account/Cross-region deployment mượt mà thông qua CDK Bootstrap trust roles.

- **A (Đúng):** Chính xác! AWS CDK Pipelines có sẵn tính năng self-mutating (mặc định bật): mỗi khi code định nghĩa pipeline thay đổi (thêm Stage/Wave/Account mới), pipeline sẽ tự chạy bước UpdatePipeline để tự cập nhật chính nó trước khi deploy các stage tiếp theo. Target accounts được bootstrap với --trust để cấp quyền triển khai cross-account.
- **B:** Sai. Pipeline tạo thủ công không có khả năng tự cập nhật (self-mutate) khi thêm stage mới, và dùng static IAM access keys vi phạm nguyên tắc bảo mật.
- **C:** Sai. Quy trình thủ công, không tự động hóa CI/CD và mất lợi ích của CDK Pipelines.
- **D:** Sai. AWS CodeStar không phải giải pháp chuẩn cho multi-account self-mutating CDK Pipelines (và đã ngừng hỗ trợ mới).

</details>

### Câu 6 `medium`

A CI/CD pipeline runs database schema integration tests inside AWS CodeBuild against a staging Amazon RDS database located in private subnets of a VPC. During the build, CodeBuild must also download external test dependencies from public PyPI. When the engineer attaches CodeBuild to the VPC's public subnets, the build fails to reach PyPI and cannot connect to RDS. How should the engineer configure CodeBuild?

- **A.** Enable Auto-assign public IPv4 address on the VPC public subnets so CodeBuild Elastic Network Interfaces receive public IP addresses automatically.
- **B.** Run CodeBuild in private subnets routed to a NAT Gateway, allow outbound traffic to the RDS Security Group and 443, and grant ENI permissions.
- **C.** Make the staging Amazon RDS database instance publicly accessible with 0.0.0.0/0 ingress rules and remove CodeBuild from the VPC configuration.
- **D.** Create a new Internet Gateway and attach it directly to the route tables of the private subnets hosting the staging Amazon RDS database.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một CI/CD pipeline chạy kiểm thử tích hợp schema cơ sở dữ liệu bên trong AWS CodeBuild đối với một cơ sở dữ liệu Amazon RDS staging đặt trong các private subnet của một VPC. Trong quá trình build, CodeBuild cũng phải tải các dependency kiểm thử bên ngoài từ PyPI công khai. Khi kỹ sư gắn CodeBuild vào các public subnet của VPC, quá trình build không thể truy cập PyPI và không thể kết nối tới RDS. Kỹ sư nên cấu hình CodeBuild như thế nào?

**Đáp án đúng:** **B**

Một điểm rất hay bị hỏi trong DOP-C02: AWS CodeBuild khi chạy trong chế độ VPC KHÔNG nhận Public IP. Do đó, nếu CodeBuild vừa cần truy cập tài nguyên nội bộ (RDS, ElastiCache) vừa cần truy cập internet (PyPI, GitHub, npm), bắt buộc phải đặt CodeBuild trong Private Subnets có route ra NAT Gateway.

- **A:** Sai. CodeBuild không hỗ trợ gán public IP trực tiếp cho build container ENI, dù subnet có bật Auto-assign public IPv4.
- **B (Đúng):** Chính xác! CodeBuild không tự gắn Public IP cho ENI của mình ngay cả khi đặt trong public subnet, nên đặt trong public subnet sẽ KHÔNG ra được internet. Bắt buộc phải đặt CodeBuild trong private subnets có route đi qua NAT Gateway để tải gói từ PyPI, đồng thời cấu hình Security Group kết nối nội bộ tới RDS và cấp quyền quản lý ENI cho service role.
- **C:** Sai. Mở công khai RDS ra internet là rủi ro bảo mật nghiêm trọng và không cần thiết.
- **D:** Sai. Gắn trực tiếp Internet Gateway vào private subnet làm biến đổi nó thành public subnet nhưng vẫn không giải quyết việc CodeBuild không có Public IP.

</details>

### Câu 7 `medium`

A regulated enterprise uses AWS CodePipeline to deploy applications from Staging to Production. Compliance rules mandate that a human Release Manager must approve every Production deployment, and developers who have access to trigger the pipeline MUST NOT be able to approve their own Production deployments. Which configuration enforces this separation of duties?

- **A.** Configure a CodeBuild stage that pauses with a sleep command for 1 hour until a Release Manager sends an Amazon SES email confirmation.
- **B.** Grant developers AdministratorAccess in the CI/CD account and instruct them via internal team policy not to click Approve on the Production stage.
- **C.** Add a Manual Approval action with SNS in Production, scoping codepipeline:PutApprovalResult solely to the ReleaseManager IAM role ARN.
- **D.** Use an Amazon EventBridge rule to block Production deployments unless an AWS CloudFormation Change Set is manually deleted by a manager.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp được quản lý chặt chẽ sử dụng AWS CodePipeline để triển khai ứng dụng từ Staging lên Production. Quy định tuân thủ bắt buộc một Release Manager là con người phải phê duyệt mọi lần triển khai Production, và các nhà phát triển có quyền kích hoạt pipeline KHÔNG ĐƯỢC PHÉP tự phê duyệt các lần triển khai Production của chính họ. Cấu hình nào thực thi sự phân tách nhiệm vụ (separation of duties) này?

**Đáp án đúng:** **C**

Trong AWS CodePipeline, Manual Approval Action kết hợp với IAM Least Privilege trên quyền codepipeline:PutApprovalResult (có thể giới hạn chính xác theo ARN của pipeline, stage và action) là cách chuẩn để thực thi Separation of Duties trong quy trình phát hành Production.

- **A:** Sai. Dùng sleep trong CodeBuild gây lãng phí chi phí compute, dễ timeout và không có cơ chế kiểm soát quyền phê duyệt theo IAM.
- **B:** Sai. Dựa vào quy ước hành chính (administrative policy) mà không có kiểm soát kỹ thuật (IAM) sẽ không đạt chuẩn kiểm toán tuân thủ.
- **C (Đúng):** Chính xác! CodePipeline hỗ trợ Manual Approval action gửi thông báo qua SNS. Bằng cách chỉ cấp quyền codepipeline:PutApprovalResult (giới hạn tới đúng ARN của stage/action) cho ReleaseManager IAM role và không cấp cho Developer role, nguyên tắc tách biệt nhiệm vụ (separation of duties) được thực thi chặt chẽ bằng IAM.
- **D:** Sai. Không phải cơ chế phê duyệt của CodePipeline và xóa Change Set sẽ hủy luôn triển khai.

</details>

### Câu 8 `hard`

A DevOps team manages an AWS CodePipeline V2 pipeline that deploys a microservices application across development, staging, and production environments. Release managers want to trigger ad-hoc hotfix deployments by passing a custom release tag and target region at execution time without modifying the pipeline definition. Additionally, before deploying to production, a manual approval action must notify an Amazon SNS topic with a direct link to the commit and the custom release tag. Which solution meets these requirements with the LEAST operational overhead?

- **A.** Create separate CodePipeline V1 pipelines for each hotfix release tag using an AWS Lambda function triggered by an Amazon EventBridge rule.
- **B.** Define pipeline-level variables in CodePipeline V2, reference #{variables.ReleaseTag} in downstream actions/CustomData, and attach an SNS topic.
- **C.** Store the release tag in an Amazon DynamoDB table and add an AWS CodeBuild stage before every action to read the table and call UpdatePipeline.
- **D.** Use AWS Systems Manager Parameter Store to store the release tag and configure the Manual Approval action to directly query Parameter Store at runtime.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm DevOps quản lý một AWS CodePipeline V2 pipeline triển khai ứng dụng microservice trên các môi trường development, staging và production. Các release manager muốn kích hoạt các đợt triển khai hotfix ad-hoc bằng cách truyền một release tag tùy chỉnh và region đích tại thời điểm thực thi mà không sửa đổi định nghĩa pipeline. Ngoài ra, trước khi triển khai lên production, một hành động phê duyệt thủ công (manual approval) phải thông báo tới một Amazon SNS topic kèm liên kết trực tiếp tới commit và release tag tùy chỉnh đó. Giải pháp nào đáp ứng các yêu cầu này với chi phí vận hành ÍT NHẤT?

**Đáp án đúng:** **B**

CodePipeline V2 giới thiệu Pipeline Variables giúp truyền tham số động tại thời điểm thực thi (execution time) và dùng lại xuyên suốt các stage thông qua namespace #{variables.<name>}, kết hợp trực tiếp với Manual Approval + SNS giúp thông báo đầy đủ ngữ cảnh mà không cần code trung gian.

- **A:** Sai. Tạo riêng một pipeline cho mỗi hotfix gây phình to tài nguyên, tốn công dọn dẹp và không phải thiết kế tối ưu.
- **B (Đúng):** Chính xác! CodePipeline V2 hỗ trợ pipeline-level variables cho phép truyền giá trị động khi kích hoạt (StartPipelineExecution) mà không cần sửa cấu trúc pipeline. Bạn có thể tham chiếu bằng cú pháp #{variables.<name>} trong các action phía sau cũng như trường CustomData của Manual Approval gửi qua SNS.
- **C:** Sai. Gọi UpdatePipeline liên tục giữa các lần chạy dễ gây race condition khi có nhiều execution đồng thời và tăng độ phức tạp không cần thiết.
- **D:** Sai. Manual Approval action trong CodePipeline không hỗ trợ truy vấn trực tiếp Parameter Store để nội suy vào nội dung thông báo SNS.

</details>

### Câu 9 `medium`

A software company builds a cross-platform C++ and Python SDK using AWS CodeBuild. The SDK must be compiled and unit-tested across three different OS container images and two compiler versions in parallel, followed by a final packaging step that depends on all six builds succeeding. Engineering leaders also want a unified dashboard showing unit test pass/fail trends and code coverage metrics directly in the AWS console without deploying third-party reporting tools. Which configuration should the DevOps engineer implement?

- **A.** Create six separate CodeBuild projects orchestrated with AWS Step Functions, and upload generated HTML test reports to an Amazon S3 static website.
- **B.** Run all six builds sequentially inside a single CodeBuild container using Docker-in-Docker and print JUnit test summaries to Amazon CloudWatch Logs.
- **C.** Configure a CodeBuild batch build (build-matrix and build-graph) in buildspec.yml and define report groups for JUnit XML and JaCoCo coverage.
- **D.** Use AWS CodePipeline parallel actions pointing to the same CodeBuild project and parse raw build logs nightly using Amazon Athena queries.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty phần mềm build một SDK C++ và Python đa nền tảng bằng AWS CodeBuild. SDK phải được biên dịch và chạy unit test trên ba container image hệ điều hành khác nhau và hai phiên bản trình biên dịch song song với nhau, sau đó là bước đóng gói cuối cùng phụ thuộc vào việc cả sáu bản build đều thành công. Lãnh đạo kỹ thuật cũng muốn có một bảng điều khiển thống nhất hiển thị xu hướng đạt/trượt unit test và chỉ số độ phủ mã (code coverage) trực tiếp trong AWS console mà không cần triển khai công cụ báo cáo của bên thứ ba. Kỹ sư DevOps nên triển khai cấu hình nào?

**Đáp án đúng:** **C**

AWS CodeBuild Batch Builds (build-matrix/build-graph) tối ưu cho bài toán build đa cấu hình song song có phụ thuộc, còn CodeBuild Report Groups cung cấp báo cáo Unit Test (JUnit/NUnit/Cucumber) và Code Coverage (JaCoCo/Clover/Cobertura) ngay trên AWS Console.

- **A:** Sai. Cách này tăng chi phí quản lý nhiều project CodeBuild và Step Functions, đồng thời không cung cấp biểu đồ xu hướng test/coverage tích hợp sẵn trên AWS Console.
- **B:** Sai. Chạy tuần tự làm tăng thời gian build đáng kể và in ra CloudWatch Logs không tạo ra dashboard trực quan về pass/fail rate và code coverage.
- **C (Đúng):** Chính xác! CodeBuild Batch Builds hỗ trợ build-matrix để chạy song song nhiều cấu hình môi trường/biến khác nhau và build-graph để khai báo phụ thuộc (depend-on) cho bước đóng gói cuối. CodeBuild Reports (report groups) tự động tổng hợp JUnit XML và code coverage thành dashboard xu hướng trực tiếp trên Console.
- **D:** Sai. Parse log bằng Athena tốn công thiết lập và không thay thế được tính năng CodeBuild Test & Code Coverage Reports tích hợp sẵn.

</details>

### Câu 10 `hard`

An enterprise uses AWS CodeArtifact to host internal npm packages alongside an upstream repository connected to the public npmjs registry. During a security audit, the AppSec team demonstrates a dependency confusion risk: if an attacker publishes a package to public npmjs with the same name as an internal package (for example, acme-auth-core) and a higher semantic version, developer builds could accidentally pull the malicious external version. How should the DevOps engineer eliminate this risk in CodeArtifact?

- **A.** Set CodeArtifact package origin controls on internal packages to publish=ALLOW and upstream=BLOCK so external versions are never pulled.
- **B.** Remove the external connection to public npmjs completely and require developers to manually upload every open-source dependency to CodeArtifact.
- **C.** Enable AWS KMS encryption on the CodeArtifact domain and restrict GetAuthorizationToken IAM permissions to specific VPC interface endpoints.
- **D.** Pin every internal package to version 999.0.0 in package.json so public npmjs packages cannot have a higher semantic version number.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp sử dụng AWS CodeArtifact để lưu trữ các gói npm nội bộ cùng với một upstream repository kết nối tới npmjs registry công khai. Trong một đợt kiểm toán bảo mật, nhóm AppSec chỉ ra rủi ro dependency confusion: nếu kẻ tấn công xuất bản một gói lên npmjs công khai có cùng tên với gói nội bộ (ví dụ: acme-auth-core) và số phiên bản ngữ nghĩa cao hơn, các bản build của nhà phát triển có thể vô tình tải phiên bản độc hại từ bên ngoài. Kỹ sư DevOps nên loại bỏ rủi ro này trong CodeArtifact như thế nào?

**Đáp án đúng:** **A**

AWS CodeArtifact Package Origin Controls (và Package Groups) là cơ chế chuyên dụng chống dependency confusion bằng cách kiểm soát nguồn gốc gói: chặn upstream (upstream=BLOCK) cho các gói nội bộ và chặn publish nội bộ (publish=BLOCK) cho các gói chỉ lấy từ nguồn công khai.

- **A (Đúng):** Chính xác! CodeArtifact Package Origin Controls (và Package Groups) cho phép thiết lập quy tắc rõ ràng cho từng package hoặc nhóm prefix: cho phép publish nội bộ (publish=ALLOW) nhưng chặn hoàn toàn việc lấy từ upstream/external (upstream=BLOCK), triệt tiêu tấn công dependency confusion.
- **B:** Sai. Gỡ bỏ kết nối upstream và upload thủ công mọi thư viện mã nguồn mở gây gián đoạn vận hành nghiêm trọng và không khả thi ở quy mô doanh nghiệp.
- **C:** Sai. Mã hóa KMS và VPC endpoint bảo vệ dữ liệu lưu trữ/truyền tải nhưng không ngăn CodeArtifact tải gói trùng tên có version cao hơn từ npmjs.
- **D:** Sai. Đây chỉ là giải pháp chắp vá, phá vỡ chuẩn Semantic Versioning và kẻ tấn công vẫn có thể publish phiên bản cao hơn (ví dụ 1000.0.0).

</details>

### Câu 11 `hard`

A DevOps engineer configures an AWS CodeBuild project to run integration tests against an Amazon RDS PostgreSQL database located in private subnets of a VPC. The test runner needs database credentials stored in AWS Secrets Manager without hardcoding secrets or exposing them in CloudWatch Logs. After configuring the CodeBuild project with the VPC, private subnets, and a security group, the build fails with a timeout when trying to retrieve the secret and download Python packages from PyPI. Which TWO actions must the engineer take to resolve both issues securely? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Move the CodeBuild project into public subnets and assign dedicated Elastic IP addresses to each ephemeral build container ENI.
- **B.** Route private subnets to a NAT Gateway (or Secrets Manager VPC Endpoint) and allow outbound HTTPS (443) in the CodeBuild security group.
- **C.** Run aws secretsmanager get-secret-value in the pre_build phase and echo the plaintext output to /tmp/creds.env for the test runner.
- **D.** Reference credentials under env.secrets-manager in buildspec.yml and grant the CodeBuild role secretsmanager:GetSecretValue and kms:Decrypt.
- **E.** Attach an Internet Gateway directly to the private subnets' route table so CodeBuild containers can reach public PyPI and Secrets Manager.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư DevOps cấu hình một project AWS CodeBuild để chạy kiểm thử tích hợp đối với cơ sở dữ liệu Amazon RDS PostgreSQL đặt trong các private subnet của một VPC. Trình chạy kiểm thử cần thông tin xác thực cơ sở dữ liệu lưu trong AWS Secrets Manager mà không hardcode bí mật hoặc làm lộ chúng trong CloudWatch Logs. Sau khi cấu hình project CodeBuild với VPC, các private subnet và security group, quá trình build bị lỗi timeout khi cố gắng lấy bí mật và tải các gói Python từ PyPI. Kỹ sư phải thực hiện HAI hành động nào để giải quyết cả hai vấn đề một cách bảo mật? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Khi chạy CodeBuild trong VPC: (1) Container không bao giờ có public IP nên bắt buộc đặt ở private subnet có route ra NAT Gateway (hoặc dùng VPC Endpoints), và (2) Dùng env.secrets-manager trong buildspec.yml kết hợp quyền IAM tối thiểu để lấy secret an toàn và tự động mask khỏi log.

- **A:** Sai. CodeBuild không thể tự gán public IP trong VPC (kể cả khi đặt trong public subnet, build container vẫn không có public IP và sẽ không ra được internet nếu không đi qua NAT Gateway).
- **B (Đúng):** Chính xác! CodeBuild chạy trong private subnet sẽ không có IP public; để gọi Secrets Manager API và tải gói từ PyPI, subnet cần route qua NAT Gateway (hoặc VPC Interface Endpoint cho Secrets Manager) và Security Group của CodeBuild phải cho phép outbound port 443.
- **C:** Sai. Tự chạy CLI không được CodeBuild tự động mask secret trong log nếu lỡ bật debug hoặc echo ra stdout, kém an toàn hơn dùng env.secrets-manager.
- **D (Đúng):** Chính xác! Khai báo trong mục env.secrets-manager của buildspec.yml giúp CodeBuild tự động giải mã, inject thành biến môi trường và tự động che giấu (mask) giá trị bí mật khỏi CloudWatch Logs. Role của CodeBuild cần quyền secretsmanager:GetSecretValue (và kms:Decrypt nếu dùng CMK).
- **E:** Sai. Trỏ route table của private subnet thẳng ra Internet Gateway không những vi phạm thiết kế private subnet mà CodeBuild container trong VPC cũng không có public IP nên vẫn không thể đi trực tiếp qua IGW.

</details>

### Câu 12 `hard`

A DevOps team uses AWS CodePipeline V2 to deploy a multi-tier web application. Recently, a bad commit passed the Build stage but failed during the Production Deploy stage after partially updating resources. Release engineers want the Production stage to automatically roll back to the last known-good pipeline execution whenever the stage fails, and also want the ability to manually trigger a stage-level rollback to a specific previous successful execution directly from CodePipeline without re-running the Build stage. Which feature should they configure?

- **A.** Switch the pipeline back to CodePipeline V1 and configure an Amazon S3 Lifecycle expiration rule to restore previous build artifact versions.
- **B.** Use git revert on the main CodeCommit branch and wait for the entire Source, Build, Test, and Production Deploy stages to re-run completely.
- **C.** Enable automatic stage rollback (onFailure: result: ROLLBACK) on the Production stage in CodePipeline V2, also supporting manual stage rollbacks.
- **D.** Disable stage transitions between the Build stage and the Production stage automatically via EventBridge whenever a deployment failure occurs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm DevOps sử dụng AWS CodePipeline V2 để triển khai một ứng dụng web đa tầng. Gần đây, một commit lỗi đã vượt qua giai đoạn Build nhưng thất bại trong giai đoạn Production Deploy sau khi đã cập nhật một phần tài nguyên. Các kỹ sư phát hành muốn giai đoạn Production tự động rollback về lần thực thi pipeline tốt gần nhất bất cứ khi nào giai đoạn này thất bại, đồng thời cũng muốn có khả năng kích hoạt thủ công rollback cấp độ giai đoạn về một lần thực thi thành công trước đó trực tiếp từ CodePipeline mà không cần chạy lại giai đoạn Build. Họ nên cấu hình tính năng nào?

**Đáp án đúng:** **C**

AWS CodePipeline V2 cung cấp tính năng Stage-level Rollback (tự động qua onFailure.result=ROLLBACK hoặc thủ công chọn một execution thành công trước đó) giúp phục hồi nhanh chóng trực tiếp tại stage triển khai mà không cần build lại artifact.

- **A:** Sai. CodePipeline V1 không hỗ trợ stage-level rollback và S3 Lifecycle rule không thể tự kích hoạt rollback triển khai.
- **B:** Sai. git revert buộc phải chạy lại toàn bộ pipeline từ Source và Build, mất thời gian và không đáp ứng yêu cầu không chạy lại Build stage.
- **C (Đúng):** Chính xác! CodePipeline V2 hỗ trợ Stage-level Rollback (cả tự động thông qua cấu hình onFailure.result=ROLLBACK lẫn thủ công bằng RollbackStage API/Console), cho phép quay về bản thực thi thành công trước đó tại đúng stage bị lỗi mà không phải chạy lại toàn bộ Build stage.
- **D:** Sai. Tắt stage transition chỉ ngăn các bản mới đi vào Production, không khôi phục hệ thống về bản chạy ổn định trước đó.

</details>

### Câu 13 `medium`

A company builds Docker container images for 30 microservices using AWS CodeBuild. Developers complain that Docker builds take 15 minutes because base layers are rebuilt on every run, and builds frequently fail with HTTP 429 Too Many Requests errors when pulling official base images (such as node:20-alpine and python:3.12-slim) from Docker Hub. Which solution resolves BOTH the slow build times and Docker Hub rate-limit failures with minimal maintenance?

- **A.** Increase the CodeBuild project compute type to BUILD_GENERAL1_2XLARGE without modifying how external base images are pulled from public Docker Hub.
- **B.** Enable LOCAL_DOCKER_LAYER_CACHE with privileged mode in CodeBuild, and configure an ECR Pull-Through Cache rule for Docker Hub using Secrets Manager.
- **C.** Disable privileged mode in the CodeBuild environment configuration and store all service Dockerfiles on a shared Amazon EFS file system.
- **D.** Run a nightly cron job on an EC2 instance to manually docker pull and docker push every possible image tag from Docker Hub to private ECR.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty build các Docker container image cho 30 microservice bằng AWS CodeBuild. Các nhà phát triển phàn nàn rằng các bản build Docker mất 15 phút vì các layer cơ bản bị build lại trong mỗi lần chạy, và các bản build thường xuyên thất bại với lỗi HTTP 429 Too Many Requests khi kéo các base image chính thức (như node:20-alpine và python:3.12-slim) từ Docker Hub. Giải pháp nào giải quyết CẢ HAI vấn đề thời gian build chậm và lỗi giới hạn tốc độ Docker Hub với mức bảo trì tối thiểu?

**Đáp án đúng:** **B**

Kết hợp CodeBuild LOCAL_DOCKER_LAYER_CACHE (cùng privilegedMode=true) để tăng tốc đóng gói container và Amazon ECR Pull-Through Cache để cache base image từ upstream registry (Docker Hub, Quay, GitHub, ECR Public) giúp tránh triệt để lỗi 429 rate-limit.

- **A:** Sai. Tăng CPU/RAM không giải quyết được lỗi rate-limit 429 từ Docker Hub và không tận dụng được Docker layer caching giữa các lần build.
- **B (Đúng):** Chính xác! LOCAL_DOCKER_LAYER_CACHE trong CodeBuild lưu cache các lớp Docker cục bộ trên build host giúp tăng tốc build mạnh mẽ, còn Amazon ECR Pull-Through Cache tự động đồng bộ và cache base image từ Docker Hub (xác thực qua Secrets Manager) vào private ECR, loại bỏ lỗi rate-limit 429.
- **C:** Sai. Tắt privileged mode sẽ khiến lệnh docker build không thể chạy trong CodeBuild Linux container mặc định, và lưu Dockerfile trên EFS không giải quyết rate-limit của Docker Hub.
- **D:** Sai. Tự quản lý EC2 và script đồng bộ thủ công tốn công bảo trì và dễ lỗi so với tính năng ECR Pull-Through Cache quản lý hoàn toàn.

</details>

### Câu 14 `hard`

A company runs a centralized AWS CodePipeline in a Shared Tools account (Account A) that builds artifacts and deploys AWS CloudFormation stacks into a Production account (Account B). When the Production Deploy stage runs, CloudFormation in Account B fails with AccessDenied when attempting to download and decrypt the build artifact from the CodePipeline S3 artifact bucket in Account A. Which TWO configurations are REQUIRED to fix this cross-account artifact access issue? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Use a KMS CMK in Account A for the artifact store and grant Account B's deployment role kms:Decrypt and kms:DescribeKey in the key policy.
- **B.** Make the CodePipeline S3 artifact bucket publicly readable across accounts using an S3 Bucket ACL and anonymous s3:GetObject access.
- **C.** Update Account A's S3 bucket policy to allow Account B's deploy role s3:GetObject and s3:GetBucketVersioning, plus matching IAM role permissions.
- **D.** Disable server-side encryption completely on the CodePipeline S3 artifact bucket so Account B does not require AWS KMS decrypt permissions.
- **E.** Create an IAM user with static long-term access keys in Account A and embed those credentials inside the CloudFormation deployment YAML template.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty chạy một AWS CodePipeline tập trung trong tài khoản Shared Tools (Account A) để build artifact và triển khai các AWS CloudFormation stack sang tài khoản Production (Account B). Khi giai đoạn Production Deploy chạy, CloudFormation trong Account B bị lỗi AccessDenied khi cố gắng tải xuống và giải mã build artifact từ CodePipeline S3 artifact bucket trong Account A. Cần HAI cấu hình nào để khắc phục sự cố truy cập artifact cross-account này? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, C**

Triển khai Cross-Account CodePipeline yêu cầu 3 yếu tố cốt lõi: (1) Customer Managed KMS Key (không dùng AWS managed key) có Key Policy cho phép Account đích, (2) S3 Artifact Bucket Policy cho phép Account đích đọc object, và (3) Cross-account IAM Role tại Account đích có quyền AssumeRole từ Tools account kèm quyền S3/KMS/CloudFormation.

- **A (Đúng):** Chính xác! AWS managed key (aws/s3) không thể chia sẻ cross-account. Bắt buộc phải dùng Customer Managed Key (CMK) trong Account A và cấp quyền kms:Decrypt trong KMS Key Policy cho Account B / cross-account role.
- **B:** Sai. Mở public bucket artifact gây lỗ hổng bảo mật nghiêm trọng (lộ mã nguồn, cấu hình, template).
- **C (Đúng):** Chính xác! Truy cập cross-account tới S3 và KMS yêu cầu cấp quyền ở cả hai phía: Resource-based policy (S3 bucket policy & KMS key policy ở Account A) và Identity-based policy (IAM role ở Account B).
- **D:** Sai. Tắt mã hóa vi phạm chuẩn bảo mật và CodePipeline cross-account yêu cầu mã hóa bằng CMK để bảo vệ artifact.
- **E:** Sai. Hardcode static access keys là anti-pattern bảo mật nghiêm trọng; chuẩn AWS là dùng IAM Role AssumeRole.

</details>

### Câu 15 `medium`

A company hosts its source code in GitHub Enterprise Cloud and wants to trigger an AWS CodePipeline V2 release pipeline ONLY when a release manager pushes a semantic version Git tag matching v*.*.* (for example, v2.4.0), and trigger a separate validation pipeline when pull requests are opened against the main branch. Security policy prohibits storing long-lived GitHub personal access tokens (PATs) in CodePipeline or Secrets Manager. How should the DevOps engineer configure the source integration?

- **A.** Use the legacy GitHub Version 1 source action in CodePipeline with a personal access token and PollForSourceChanges enabled on the repository.
- **B.** Create a CodeConnections GitHub App connection, use CodeStarSourceConnection in CodePipeline V2, and add V2 Git tag/PR triggers.
- **C.** Mirror the entire GitHub repository into an Amazon S3 bucket every 5 minutes using an EC2 cron job and trigger CodePipeline from S3.
- **D.** Deploy a public API Gateway endpoint backed by Lambda to receive GitHub webhooks and store a static GitHub PAT in Lambda environment variables.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ mã nguồn trên GitHub Enterprise Cloud và muốn kích hoạt một AWS CodePipeline V2 release pipeline CHỈ KHI một release manager đẩy lên một Git tag phiên bản ngữ nghĩa khớp với v*.*.* (ví dụ: v2.4.0), và kích hoạt một pipeline xác thực riêng biệt khi các pull request được mở nhắm vào nhánh main. Chính sách bảo mật nghiêm cấm lưu trữ các GitHub personal access token (PAT) dài hạn trong CodePipeline hoặc Secrets Manager. Kỹ sư DevOps nên cấu hình tích hợp mã nguồn như thế nào?

**Đáp án đúng:** **B**

AWS CodeConnections (CodeStar Connections) là chuẩn tích hợp hiện đại cho GitHub/GitLab/Bitbucket (dùng App authentication thay cho PAT), kết hợp CodePipeline V2 Git triggers cho phép lọc chính xác theo nhánh, đường dẫn file, Git tag và Pull Request.

- **A:** Sai. GitHub Version 1 đã cũ, yêu cầu lưu trữ Personal Access Token (vi phạm chính sách bảo mật) và không hỗ trợ V2 Git tag / pull request triggers.
- **B (Đúng):** Chính xác! AWS CodeConnections (trước đây là CodeStar Connections) sử dụng GitHub App OAuth (không cần lưu Personal Access Token dài hạn), đồng thời tích hợp gốc với CodePipeline V2 Git triggers hỗ trợ lọc theo Git tag (v*.*.*) và sự kiện Pull Request.
- **C:** Sai. Đồng bộ định kỳ ra S3 làm mất metadata của Git tag/PR và tăng gánh nặng vận hành không cần thiết.
- **D:** Sai. Vi phạm yêu cầu không lưu trữ GitHub PAT dài hạn và tốn công tự xây webhook handler trong khi CodeConnections + CodePipeline V2 hỗ trợ sẵn.

</details>

### Câu 16 `medium`

A mobile and backend engineering organization uses AWS CodeBuild. Their Python microservices run thousands of short 20-second unit test jobs per day, where standard EC2-based CodeBuild container provisioning startup time (30–45 seconds) dominates total build time. Separately, their iOS team needs dedicated Apple Silicon macOS build machines with zero cold-start latency during business hours. Which AWS CodeBuild compute options should the DevOps engineer choose for these two workloads?

- **A.** Use on-demand BUILD_GENERAL1_SMALL containers in CodeBuild for both Python unit tests and macOS iOS mobile builds.
- **B.** Migrate all Python and iOS builds to AWS Lambda functions invoked directly by Amazon S3 Event Notifications without CodeBuild.
- **C.** Use CodeBuild Lambda compute for short Python unit tests and a CodeBuild Reserved Capacity Fleet (macOS) for iOS builds.
- **D.** Run both Python and iOS build workloads inside a single self-managed Jenkins server running on Amazon EC2 Linux instances.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức kỹ thuật di động và backend sử dụng AWS CodeBuild. Các microservice Python của họ chạy hàng nghìn job unit test ngắn 20 giây mỗi ngày, nơi thời gian khởi tạo container CodeBuild dựa trên EC2 tiêu chuẩn (30–45 giây) chiếm phần lớn tổng thời gian build. Riêng biệt, nhóm iOS của họ cần các máy build macOS Apple Silicon chuyên dụng với độ trễ khởi động nguội (cold-start) bằng không trong giờ hành chính. Kỹ sư DevOps nên chọn các tùy chọn compute AWS CodeBuild nào cho hai workload này?

**Đáp án đúng:** **C**

AWS CodeBuild hỗ trợ nhiều chế độ compute chuyên biệt: Lambda compute (khởi động tức thì cho các tác vụ ngắn, độ đồng thời cao) và Reserved Capacity Fleets (tài nguyên dành riêng không cold-start, hỗ trợ macOS, ARM64, GPU và cấu hình chuyên sâu).

- **A:** Sai. BUILD_GENERAL1_SMALL chạy Linux trên on-demand EC2 nên vẫn có thời gian provisioning container và không thể build ứng dụng iOS macOS.
- **B:** Sai. AWS Lambda thuần không hỗ trợ macOS cho iOS build và thiếu hệ sinh thái buildspec, report groups, artifact caching của CodeBuild.
- **C (Đúng):** Chính xác! CodeBuild Lambda compute mode khởi chạy gần như tức thời (vài giây) và mở rộng song song cực nhanh, lý tưởng cho các job ngắn như unit test/linting. CodeBuild Reserved Capacity Fleets cung cấp máy chủ dành riêng (hỗ trợ cả macOS Apple Silicon, Linux, Windows, GPU) luôn sẵn sàng không có cold start.
- **D:** Sai. Jenkins trên EC2 Linux không thể build iOS (yêu cầu macOS) và tăng gánh nặng tự quản lý máy chủ.

</details>

### Câu 17 `medium`

A development team uses GitHub Actions to build container images and deploy infrastructure to AWS. Currently, the workflow uses static AWS IAM user access keys stored as GitHub repository secrets, which violates the company's zero-long-lived-credentials policy. Security also insists that ONLY workflows running from the main branch of the specific repository org/payments-api are permitted to assume the production deployment role. Which TWO configurations should the DevOps engineer implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Keep the static IAM user access keys in GitHub Secrets and rotate them every 90 days using a scheduled GitHub Actions cron job.
- **B.** Create an AWS IAM OIDC provider for GitHub Actions with id-token: write to exchange the OIDC JWT for short-lived STS credentials.
- **C.** Set the IAM role trust policy condition token.actions.githubusercontent.com:sub to repo:org/* so any repository can deploy to production.
- **D.** Restrict the IAM trust policy with StringEquals on aud=sts.amazonaws.com and sub=repo:org/payments-api:ref:refs/heads/main.
- **E.** Use AWS IAM Roles Anywhere with self-signed X.509 certificates stored as plaintext environment variables inside GitHub Actions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm phát triển sử dụng GitHub Actions để build container image và triển khai hạ tầng lên AWS. Hiện tại, quy trình làm việc sử dụng các access key tĩnh của AWS IAM user lưu dưới dạng GitHub repository secret, điều này vi phạm chính sách không-thông-tin-xác-thực-dài-hạn của công ty. Bộ phận bảo mật cũng yêu cầu CHỈ các workflow chạy từ nhánh main của repository cụ thể org/payments-api mới được phép assume role triển khai production. Kỹ sư DevOps nên triển khai HAI cấu hình nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Xác thực CI/CD bên ngoài (GitHub Actions, GitLab CI, Bitbucket) vào AWS an toàn nhất bằng IAM OIDC Identity Provider (STS AssumeRoleWithWebIdentity) kết hợp Trust Policy khóa chặt claim aud và sub theo đúng repository và branch.

- **A:** Sai. Vẫn sử dụng static long-lived IAM user keys, vi phạm trực tiếp chính sách zero-long-lived-credentials của công ty.
- **B (Đúng):** Chính xác! Thiết lập IAM OIDC Identity Provider cho GitHub Actions cho phép workflow lấy token tạm thời qua STS AssumeRoleWithWebIdentity mà không cần lưu bất kỳ static IAM access key nào.
- **C:** Sai. Dùng wildcard repo:org/* cho phép mọi repo và mọi nhánh đều assume được production role, vi phạm yêu cầu chỉ cho phép nhánh main của org/payments-api.
- **D (Đúng):** Chính xác! Ràng buộc chặt chẽ cả hai claim aud và sub (chính xác tới repo:org/payments-api:ref:refs/heads/main) trong IAM Role Trust Policy đảm bảo không có repo hay nhánh feature/PR nào khác có thể assume production role.
- **E:** Sai. IAM Roles Anywhere dành cho máy chủ on-premises có PKI riêng; với GitHub Actions/GitLab CI chuẩn AWS là OIDC federation để tránh lưu giữ private key.

</details>

### Câu 18 `hard`

A DevOps engineer configures a cross-account AWS CodePipeline in a Shared Services account to deploy an application to a Production account using AWS CloudFormation. The S3 artifact bucket policy grants s3:GetObject and s3:ListBucket to the Production deploy role, and the Pipeline service role has sts:AssumeRole permission for the Production deploy role. However, the deploy stage fails with an AccessDenied error when reading the build artifact from Amazon S3. What is the MOST likely root cause and resolution?

- **A.** The Production deploy role lacks s3:PutBucketAcl and s3:PutObjectAcl permissions on the artifact bucket. Add both ACL actions to the S3 bucket policy and IAM role.
- **B.** The S3 artifact bucket uses the default AWS managed KMS key (aws/s3). Switch to a Customer Managed KMS key (CMK) and grant kms:Decrypt to the Production deploy role.
- **C.** CodePipeline does not support cross-account CloudFormation deployments directly. Replace the CloudFormation action with an AWS Lambda function in the Shared Services account.
- **D.** S3 Versioning and Object Lock are disabled on the artifact bucket. Enable S3 Versioning and S3 Transfer Acceleration on the bucket to allow cross-account artifact reads.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư DevOps cấu hình AWS CodePipeline cross-account trong tài khoản Shared Services để triển khai ứng dụng sang tài khoản Production bằng AWS CloudFormation. Bucket policy của S3 artifact cấp quyền s3:GetObject và s3:ListBucket cho Production deploy role, và Pipeline service role có quyền sts:AssumeRole đối với Production deploy role. Tuy nhiên, giai đoạn deploy bị lỗi AccessDenied khi đọc build artifact từ Amazon S3. Nguyên nhân gốc rễ và cách khắc phục CÓ KHẢ NĂNG NHẤT là gì?

**Đáp án đúng:** **B**

Trong kiến trúc Cross-Account CodePipeline, bộ ba bắt buộc là: (1) S3 Bucket Policy cấp quyền cho Target Role, (2) Customer Managed KMS Key có Key Policy cấp quyền giải mã cho Target Role (không dùng aws/s3), và (3) IAM Trust/AssumeRole giữa hai tài khoản.

- **A:** Sai. Quá trình deploy chỉ cần đọc artifact (s3:GetObject, s3:ListBucket), không cần quyền s3:PutBucketAcl.
- **B (Đúng):** Chính xác! AWS managed key (aws/s3) không thể chỉnh sửa Key Policy để chia sẻ cross-account. Với Cross-Account CodePipeline, bắt buộc phải dùng Customer Managed KMS Key (CMK) và cấp quyền kms:Decrypt cho Role ở Production account trong Key Policy.
- **C:** Sai. CodePipeline hỗ trợ native cross-account CloudFormation deployment thông qua RoleArn và Customer Managed KMS Key.
- **D:** Sai. Thiếu S3 Versioning không gây lỗi AccessDenied khi đọc artifact từ tài khoản khác, và Transfer Acceleration không liên quan tới quyền truy cập.

</details>

### Câu 19 `medium`

A company runs AWS CodeBuild inside private subnets with no internet access to build Node.js and Python microservices. Developers need to fetch approved open-source packages from npm and PyPI as well as internal libraries securely without routing traffic through a NAT Gateway. What is the MOST operational-efficient solution?

- **A.** Manually download all npm and PyPI dependency tarballs weekly and upload them to an Amazon S3 bucket accessed via an S3 Gateway VPC Endpoint.
- **B.** Host a self-managed Sonatype Nexus repository on an EC2 instance in a public subnet and restrict access to the CodeBuild security group.
- **C.** Configure AWS CodeArtifact repositories with external connections to npm and PyPI, attach a VPC Interface Endpoint, and run aws codeartifact login.
- **D.** Enable LOCAL_SOURCE_CACHE and LOCAL_DOCKER_LAYER_CACHE in CodeBuild so all external npm and PyPI packages persist permanently across builds.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty chạy AWS CodeBuild bên trong các private subnet không có truy cập internet để build các microservice Node.js và Python. Các nhà phát triển cần tải các gói mã nguồn mở đã được phê duyệt từ npm và PyPI cũng như các thư viện nội bộ một cách bảo mật mà không định tuyến lưu lượng qua NAT Gateway. Giải pháp hiệu quả về mặt vận hành NHẤT là gì?

**Đáp án đúng:** **C**

AWS CodeArtifact là dịch vụ quản lý artifact được quản lý hoàn toàn (fully managed), hỗ trợ kết nối upstream tới npm/PyPI/Maven/NuGet và truy cập riêng tư qua AWS PrivateLink (VPC Interface Endpoint).

- **A:** Sai. Tải thủ công hàng tuần gây gánh nặng vận hành cực lớn và không tự động cập nhật dependency tree.
- **B:** Sai. Tự vận hành Nexus trên EC2 tốn chi phí quản trị, vá lỗi và không hiệu quả bằng dịch vụ managed như CodeArtifact.
- **C (Đúng):** Chính xác! AWS CodeArtifact vừa lưu package nội bộ vừa làm proxy (external connection) tới npm/PyPI công cộng, và hỗ trợ VPC Interface Endpoint để CodeBuild trong private subnet tải package mà không cần NAT Gateway.
- **D:** Sai. Local cache chỉ lưu tạm thời trên host build và vẫn cần kết nối lần đầu để tải package mới, không thay thế được private package registry.

</details>

---

[Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md)
