# Bài tập tình huống — Chủ đề 13: Infrastructure as Code — CloudFormation, AWS SAM & CDK

> CloudFormation Intrinsic Functions & StackSets, AWS SAM (sam build/deploy, Canary/Linear), AWS CDK Constructs & Best Practices.
> **Số câu hỏi:** 40 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án & Giải thích chi tiết**.

---

### Câu 1 `hard`

A developer uses AWS SAM (`template.yaml`) to deploy a Lambda function with `AutoPublishAlias: live` and `DeploymentPreference.Type: Canary10Percent5Minutes`. The team wants to automatically roll back the deployment if the new Lambda version triggers any `Errors` metric > 0 during the 5-minute canary window, AND run a pre-traffic validation Lambda before shifting the first 10% of traffic. Which properties should be configured under `DeploymentPreference`?

- **A.** Set `Role` to an IAM Role with `cloudwatch:PutMetricAlarm` and configure `Trigger` to run validation after deployment completes.
- **B.** Set `Hooks.PostTraffic` to run the validation Lambda function before shifting the first 10% of production traffic.
- **C.** Set `Alarms` to reference the CloudWatch Alarm on the Lambda `Errors` metric, and set `Hooks.PreTraffic` to reference the validation Lambda function.
- **D.** Change `Type` to `AllAtOnce` and configure an Amazon EventBridge rule to delete the Lambda function alias if an error occurs.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

**AWS SAM + CodeDeploy Traffic Shifting** cho Lambda:
- `AutoPublishAlias: live`: Tự tạo version mới và cập nhật alias.
- `DeploymentPreference.Type`: `Canary10Percent5Minutes`, `Linear10PercentEvery1Minute`, `AllAtOnce`.
- `Alarms`: CloudWatch Alarms kích hoạt rollback tự động.
- `Hooks.PreTraffic` / `Hooks.PostTraffic`: Hàm Lambda kiểm thử gọi `codedeploy:PutLifecycleEventHookExecutionStatus` (`Succeeded` hoặc `Failed`).

- **A:** Sai vì thuộc tính `Alarms` mới là nơi khai báo CloudWatch Alarm để CodeDeploy theo dõi rollback, và validation hook dùng `Hooks.PreTraffic`.
- **B:** Sai vì `PostTraffic` chạy *sau* khi 100% traffic đã chuyển sang version mới; muốn chạy trước khi chuyển traffic phải dùng `PreTraffic`.
- **C (Đúng):** Đúng! Trong AWS SAM `DeploymentPreference` (tích hợp CodeDeploy cho Lambda): `Alarms` chỉ định danh sách CloudWatch Alarms để tự động rollback khi báo động kích hoạt, còn `Hooks.PreTraffic` chạy hàm kiểm thử trước khi chuyển 10% traffic đầu tiên.
- **D:** Sai vì `AllAtOnce` chuyển 100% traffic ngay lập tức, không còn là Canary deployment.

</details>

### Câu 2 `medium`

A CloudFormation stack provisions an Amazon RDS database and an Amazon S3 bucket. If an operations engineer accidentally deletes the CloudFormation stack, the company requires that the RDS database automatically takes a final snapshot and the S3 bucket is NOT deleted. Which resource attributes should the developer add to the CloudFormation template?

- **A.** Enable the `TerminationProtection` property directly on the `AWS::S3::Bucket` and `AWS::RDS::DBInstance` resources in the template.
- **B.** Set `DeletionPolicy: Snapshot` on the RDS `AWS::RDS::DBInstance` resource and `DeletionPolicy: Retain` on the S3 `AWS::S3::Bucket` resource.
- **C.** Add a `DependsOn` attribute between the `AWS::S3::Bucket` resource and the `AWS::RDS::DBInstance` resource to prevent deletion.
- **D.** Set `DeletionPolicy: Retain` on the `AWS::RDS::DBInstance` resource and `DeletionPolicy: Snapshot` on the `AWS::S3::Bucket` resource in the template.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

**CloudFormation `DeletionPolicy`** có 3 giá trị:
- `Delete` (mặc định): Xóa tài nguyên khi stack bị xóa (với S3 bucket phải rỗng mới xóa được).
- **`Retain`**: Giữ lại tài nguyên (áp dụng cho mọi resource).
- **`Snapshot`**: Tạo snapshot cuối trước khi xóa (chỉ áp dụng cho EBS, RDS, ElastiCache, Redshift, Neptune, EFS...).

- **A:** Sai vì `TerminationProtection` là thuộc tính ở cấp độ Stack (ngăn không cho xóa stack), không phải thuộc tính bên trong resource S3.
- **B (Đúng):** Đúng! `DeletionPolicy: Snapshot` yêu cầu CloudFormation tạo final snapshot trước khi xóa RDS (hỗ trợ RDS, EBS, ElastiCache, Redshift), còn `DeletionPolicy: Retain` giữ lại nguyên vẹn S3 bucket và dữ liệu bên trong ngay cả khi stack bị xóa.
- **C:** Sai vì `DependsOn` chỉ quy định thứ tự tạo/xóa tài nguyên, không ngăn tài nguyên bị xóa khi xóa stack.
- **D:** Sai vì S3 bucket không hỗ trợ `DeletionPolicy: Snapshot`, và đề bài yêu cầu RDS tạo final snapshot.

</details>

### Câu 3 `medium`

A developer writes a single AWS CloudFormation template that will be deployed across multiple AWS Regions (`us-east-1`, `eu-west-1`, `ap-southeast-1`). Each Region requires a different Amazon Linux AMI ID, and a larger EC2 instance type (`m5.large` vs `t3.small`) should only be provisioned when the `Environment` parameter is set to `prod`. Which CloudFormation template sections should be used?

- **A.** Hardcode the `us-east-1` AMI ID in `Parameters` and use `Fn::Sub` to dynamically convert it into valid AMI IDs for other Regions.
- **B.** Use `Outputs` with `Export` for the Region-to-AMI lookup and `Transform` for conditionally selecting the `prod` instance type.
- **C.** Use `Metadata` for the Region-to-AMI lookup and `DependsOn` for conditionally selecting the `prod` instance type.
- **D.** Use `Mappings` (with `Fn::FindInMap`) for the Region-to-AMI lookup, and `Conditions` (with `Fn::Equals` and `Fn::If`) for selecting the `prod` instance type.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Các phần chính trong **CloudFormation Template**:
- **`Mappings` + `Fn::FindInMap`**: Bảng tra cứu tĩnh (ví dụ Region -> AMI ID).
- **`Parameters` + `Conditions` (`Fn::Equals`, `Fn::If`)**: Rẽ nhánh tài nguyên/thuộc tính theo môi trường (`dev` vs `prod`).
- **`SSM Parameter` (`AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>`)**: Cách hiện đại khác để lấy AMI ID mới nhất tự động.

- **A:** Sai vì AMI ID khác nhau hoàn toàn giữa các Region, không thể dùng `Fn::Sub` để suy ra AMI ID của Region khác.
- **B:** Sai vì `Outputs` dùng để xuất giá trị sau khi deploy xong (hoặc Export sang stack khác), còn `Transform` dùng cho Macro/AWS SAM.
- **C:** Sai vì `Metadata` chỉ chứa thông tin mô tả bổ sung và `DependsOn` chỉ định thứ tự khởi tạo.
- **D (Đúng):** Đúng! `Mappings` + `Fn::FindInMap` là chuẩn để ánh xạ Region (`AWS::Region`) sang AMI ID cố định. `Conditions` + `Fn::If` dùng để rẽ nhánh logic dựa trên giá trị của `Parameters` (như `Environment == prod`).

</details>

### Câu 4 `medium`

A developer is starting a new AWS CDK (Cloud Development Kit) TypeScript project in a fresh AWS account and Region. When running `cdk deploy`, the command fails because the account/Region lacks the required staging S3 bucket and IAM roles used by CDK to store assets. Which command must be run once per account/Region before deploying CDK apps with assets?

- **A.** `cdk init app --language typescript`
- **B.** `cdk diff`
- **C.** `cdk bootstrap`
- **D.** `cdk synth`

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Các lệnh cốt lõi của **AWS CDK CLI**:
- `cdk init`: Tạo project mẫu.
- **`cdk bootstrap`**: Chuẩn bị hạ tầng (`CDKToolkit` S3, ECR, IAM roles) trên Account/Region (chỉ chạy 1 lần).
- `cdk synth`: Sinh ra CloudFormation template.
- `cdk diff`: Xem trước thay đổi trước khi deploy.
- `cdk deploy`: Triển khai lên AWS CloudFormation.

- **A:** Sai vì `cdk init` chỉ tạo khung thư mục dự án trên máy local.
- **B:** Sai vì `cdk diff` chỉ so sánh sự khác biệt giữa template hiện tại và stack đang chạy trên AWS.
- **C (Đúng):** Đúng! `cdk bootstrap` khởi tạo stack `CDKToolkit` chứa S3 bucket (lưu asset/template lớn), ECR repository (lưu Docker image asset) và các IAM Roles cần thiết trong mỗi cặp Account/Region.
- **D:** Sai vì `cdk synth` chỉ biên dịch code TypeScript/Python thành CloudFormation JSON/YAML template cục bộ trong thư mục `cdk.out`.

</details>

### Câu 5 `easy`

A developer is building an AWS SAM serverless API locally and wants to start a local HTTP server that simulates Amazon API Gateway endpoints so they can test with `curl` or Postman before deploying to AWS. Which AWS SAM CLI command should the developer run?

- **A.** `sam validate`
- **B.** `sam local start-api`
- **C.** `sam sync --watch`
- **D.** `sam local invoke`

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Các lệnh **AWS SAM CLI** hay thi:
- `sam local start-api`: Mở HTTP server local test API Gateway + Lambda.
- `sam local invoke`: Chạy test 1 Lambda function với event mẫu (`sam local generate-event`).
- `sam sync --watch`: Đẩy nhanh thay đổi lên cloud (SAM Accelerate) khi dev.

- **A:** Sai vì `sam validate` chỉ kiểm tra cú pháp của file `template.yaml`.
- **B (Đúng):** Đúng! `sam local start-api` khởi chạy một HTTP server cục bộ (mặc định cổng 3000) mô phỏng API Gateway và gọi hàm Lambda chạy trong Docker container khi có HTTP request.
- **C:** Sai vì `sam sync --watch` đồng bộ code lên thẳng môi trường AWS trên cloud (SAM Accelerate), không phải chạy API local.
- **D:** Sai vì `sam local invoke` chỉ chạy một hàm Lambda đơn lẻ một lần với file event JSON, không mở HTTP server mô phỏng API Gateway.

</details>

### Câu 6 `medium`

An AWS CloudFormation template launches an Amazon EC2 instance that runs a 4-minute software installation script via User Data and `cfn-init`. The CloudFormation stack currently reports `CREATE_COMPLETE` as soon as the EC2 instance boots, even before the application is ready. How should the developer ensure CloudFormation waits until the installation script finishes (or fails the stack if it times out)?

- **A.** Add a `CreationPolicy` with `ResourceSignal` (e.g., `Timeout: PT10M`) to the EC2 resource and call `/opt/aws/bin/cfn-signal` at the end of the User Data script.
- **B.** Use `Fn::Sub` inside the `Outputs` section of the template to block stack completion until bootstrapping finishes.
- **C.** Add `DependsOn: EC2Instance` to the EC2 instance itself so CloudFormation pauses before marking it `CREATE_COMPLETE`.
- **D.** Add `DeletionPolicy: Retain` to the EC2 instance resource so CloudFormation waits for the User Data script.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Bộ đôi **CloudFormation Helper Scripts**:
- **`cfn-init`**: Đọc `AWS::CloudFormation::Init` metadata để cài gói, tạo file, bật service.
- **`cfn-signal`**: Gửi tín hiệu thành công/thất bại về CloudFormation khi kết hợp với **`CreationPolicy`** (`ResourceSignal`) hoặc `WaitCondition`.
- **`cfn-hup`**: Daemon lắng nghe thay đổi metadata khi update stack.

- **A (Đúng):** Đúng! Kết hợp **`CreationPolicy` (`ResourceSignal`)** trên `AWS::EC2::Instance` (hoặc `AutoScalingGroup`) với lệnh **`cfn-signal -e $?`** ở cuối script sẽ buộc CloudFormation chờ tín hiệu thành công từ instance trước khi chuyển sang `CREATE_COMPLETE`.
- **B:** Sai vì `Fn::Sub` chỉ là hàm thay thế chuỗi, không làm CloudFormation chờ script khởi tạo.
- **C:** Sai vì một tài nguyên không thể `DependsOn` chính nó, và `DependsOn` chỉ chờ tài nguyên được tạo chứ không chờ User Data chạy xong.
- **D:** Sai vì `DeletionPolicy` chỉ quyết định giữ hay xóa tài nguyên khi xóa stack.

</details>

### Câu 7 `medium`

A developer is about to update a production AWS CloudFormation stack that manages an Amazon RDS database. Before applying the updated template, the team wants to preview whether the update will modify the RDS instance in place or trigger a **Replacement** (which would recreate the database and cause downtime). Which CloudFormation feature should the developer use?

- **A.** Create and inspect a CloudFormation Change Set before executing it.
- **B.** Run `aws cloudformation validate-template` against the updated template file.
- **C.** Run `aws cloudformation detect-stack-drift` before executing `update-stack`.
- **D.** Enable CloudFormation Stack Policy after running `update-stack`.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

**CloudFormation Change Sets**:
- Xem trước tác động của `update-stack` (đặc biệt là cột **Replacement: True**) trước khi thực thi.
- Kết hợp **Stack Policy** để chặn mọi thao tác `Update:Replace` hoặc `Update:Delete` lên tài nguyên quan trọng như RDS Production.

- **A (Đúng):** Đúng! **Change Set** cho phép xem trước danh sách các tài nguyên sẽ bị Add, Modify, hoặc **Replacement (`True`/`False`/`Conditional`)** trước khi quyết định Execute thay đổi.
- **B:** Sai vì `validate-template` chỉ kiểm tra cú pháp JSON/YAML hợp lệ, không so sánh với stack đang chạy để biết có Replacement hay không.
- **C:** Sai vì Drift Detection kiểm tra xem tài nguyên thực tế có bị chỉnh sửa thủ công ngoài CloudFormation hay không, không xem trước tác động của template mới.
- **D:** Sai vì chạy `update-stack` trực tiếp sẽ áp dụng thay đổi ngay lập tức mà không cho xem trước.

</details>

### Câu 8 `easy`

An operations engineer manually modified an EC2 Security Group rule via the AWS Management Console, even though that Security Group is managed by an AWS CloudFormation stack. Which CloudFormation feature allows the team to identify that the live resource configuration no longer matches the stack template?

- **A.** CloudFormation Termination Protection
- **B.** CloudFormation `Fn::GetAtt`
- **C.** CloudFormation Nested Stacks
- **D.** CloudFormation Drift Detection

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

**CloudFormation Drift Detection**:
- Phát hiện sai lệch (`DRIFTED` vs `IN_SYNC`) khi có người chỉnh sửa tài nguyên trực tiếp trên Console/CLI ngoài CloudFormation.

- **A:** Sai vì Termination Protection chỉ ngăn không cho xóa nhầm stack.
- **B:** Sai vì `Fn::GetAtt` chỉ là hàm nội tại lấy thuộc tính của resource trong template.
- **C:** Sai vì Nested Stacks dùng để tái sử dụng template con trong template cha.
- **D (Đúng):** Đúng! **Drift Detection** so sánh cấu hình thực tế của các tài nguyên đang chạy với trạng thái được định nghĩa trong CloudFormation template để phát hiện các chỉnh sửa thủ công (out-of-band changes).

</details>

### Câu 9 `medium`

A platform team needs to deploy a standardized IAM baseline role and AWS Config rules from a central AWS Organizations management account into 30 member AWS accounts across 4 AWS Regions using a single CloudFormation template. Which CloudFormation feature should be used?

- **A.** AWS SAM `sam sync`
- **B.** AWS CloudFormation StackSets
- **C.** CloudFormation Cross-Stack References (`Fn::ImportValue`)
- **D.** AWS CloudFormation Nested Stacks

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Phân biệt các mô hình mở rộng **CloudFormation**:
- **StackSets**: Triển khai **Multi-Account + Multi-Region**.
- **Nested Stacks**: Tái sử dụng template con trong cùng Account/Region.
- **Cross-Stack References (`Export` + `Fn::ImportValue`)**: Chia sẻ tài nguyên (như VPC ID) giữa các stack độc lập trong cùng Account/Region.

- **A:** Sai vì `sam sync` chỉ dùng để phát triển nhanh 1 ứng dụng serverless trên 1 account/region.
- **B (Đúng):** Đúng! **CloudFormation StackSets** cho phép tạo, cập nhật hoặc xóa stack đồng loạt trên **nhiều AWS Accounts và nhiều Regions** từ một tài khoản quản trị duy nhất (tích hợp sẵn AWS Organizations).
- **C:** Sai vì `Export`/`Fn::ImportValue` chỉ chia sẻ output giữa các stack trong **cùng 1 Account và cùng 1 Region**.
- **D:** Sai vì Nested Stacks chỉ triển khai trong **cùng 1 AWS Account và cùng 1 Region**.

</details>

### Câu 10 `medium`

A CloudFormation template exceeds the maximum template body size or needs to provision a non-AWS resource (such as registering a DNS record in an external DNS provider or seeding initial items into a newly created DynamoDB table) during stack creation and clean it up during stack deletion. Which CloudFormation feature supports executing custom provisioning logic during stack lifecycle events?

- **A.** Use `Fn::Transform` with `AWS::Include` to fetch and execute external REST API provisioning scripts during CloudFormation stack creation.
- **B.** Use the `DependsOn` resource attribute pointing directly to the external vendor HTTPS endpoint URL.
- **C.** Use a CloudFormation Custom Resource (`AWS::CloudFormation::CustomResource` or `Custom::*`) backed by an AWS Lambda function.
- **D.** Use the CloudFormation `Mappings` section to execute shell scripts and register the external API.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

**CloudFormation Custom Resources (`Custom::MyResource`)**:
- Dùng khi CloudFormation chưa hỗ trợ loại tài nguyên đó (hoặc cần seed data, gọi API ngoài, lấy AMI/dữ liệu động).
- Lambda nhận `RequestType` (`Create`, `Update`, `Delete`) và bắt buộc phải PUT kết quả (`SUCCESS`/`FAILED`) lên S3 `ResponseURL` (nếu không CloudFormation sẽ treo chờ tới timeout 1 giờ!).

- **A:** Sai vì `AWS::Include` chỉ chèn đoạn YAML/JSON tĩnh từ S3 vào template, không chạy code tùy chỉnh lúc tạo/xóa stack.
- **B:** Sai vì `DependsOn` chỉ nhận Logical ID của tài nguyên trong cùng template.
- **C (Đúng):** Đúng! **CloudFormation Custom Resource** gọi một hàm Lambda (hoặc SNS topic) kèm `RequestType` (`Create`, `Update`, `Delete`), cho phép thực thi bất kỳ logic nào (như seed DynamoDB, gọi API bên thứ ba) và gửi kết quả về CloudFormation qua `ResponseURL`.
- **D:** Sai vì `Mappings` chỉ là bảng tra cứu key-value tĩnh.

</details>

### Câu 11 `easy`

An AWS SAM `template.yaml` defines 12 `AWS::Serverless::Function` resources that all use the same `Runtime: nodejs20.x`, `Timeout: 15`, and `MemorySize: 512` settings. How can the developer avoid repeating these properties across all 12 function definitions in the SAM template?

- **A.** Place `Runtime`, `Timeout`, and `MemorySize` in `samconfig.toml` under `[default.deploy.parameters]`.
- **B.** Define `Runtime`, `Timeout`, and `MemorySize` once under the `Globals.Function` section of the SAM template.
- **C.** Define `Runtime`, `Timeout`, and `MemorySize` inside the `Outputs` section of the SAM template.
- **D.** Use `AWS::Serverless::Application` to inherit all Lambda runtime properties automatically across every function in the template.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Cấu trúc **AWS SAM `template.yaml`**:
- `Transform: AWS::Serverless-2016-10-31` (bắt buộc).
- **`Globals`**: Khai báo thuộc tính chung cho `Function`, `Api`, `HttpApi` (hàm nào cần khác đi chỉ việc ghi đè cục bộ).
- Các loại tài nguyên rút gọn: `AWS::Serverless::Function`, `AWS::Serverless::Api`, `AWS::Serverless::SimpleTable`, `AWS::Serverless::LayerVersion`.

- **A:** Sai vì `samconfig.toml` lưu tham số CLI cho `sam build`/`sam deploy`, không thay thế thuộc tính tài nguyên trong `template.yaml`.
- **B (Đúng):** Đúng! Phần **`Globals`** trong AWS SAM `template.yaml` cho phép khai báo các thuộc tính mặc định dùng chung cho toàn bộ `Function`, `Api`, `HttpApi`, hoặc `SimpleTable` trong file template.
- **C:** Sai vì `Outputs` chỉ dùng để xuất giá trị sau khi deploy stack xong.
- **D:** Sai vì `AWS::Serverless::Application` dùng để nhúng một ứng dụng SAM con (nested app) từ SAR hoặc S3.

</details>

### Câu 12 `medium`

A developer uses AWS SAM to build a serverless application with local source code references (`CodeUri: ./src`). Before deploying the SAM template to AWS CloudFormation via a CI/CD script, which command packages the local code, uploads the ZIP artifacts to an Amazon S3 bucket, and outputs a transformed CloudFormation template with S3 URIs?

- **A.** `sam package` (or `aws cloudformation package`)
- **B.** `sam init --runtime`
- **C.** `sam logs --tail`
- **D.** `sam validate --lint` (with cfn-lint template validation and linting rules)

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Quy trình chuẩn **AWS SAM CLI**:
1. `sam build`: Biên dịch dependencies và chuẩn bị artifact trong `.aws-sam/build`.
2. **`sam package`**: Upload artifact lên S3 và thay thế đường dẫn local thành S3 URI.
3. **`sam deploy`** (hoặc `sam deploy --guided` để lưu cấu hình vào `samconfig.toml`): Đẩy lên CloudFormation.

- **A (Đúng):** Đúng! `sam package` (tương đương `aws cloudformation package`) nén code local, tải lên S3 bucket chỉ định (`--s3-bucket`), và sinh ra file template mới đã thay thế `CodeUri` local bằng đường dẫn `s3://...` để `sam deploy` (hoặc `cloudformation deploy`) triển khai.
- **B:** Sai vì `sam init` chỉ tạo project mẫu mới.
- **C:** Sai vì `sam logs` dùng để xem CloudWatch Logs của hàm Lambda đã deploy.
- **D:** Sai vì `sam validate` chỉ kiểm tra tính hợp lệ của `template.yaml`.

</details>

### Câu 13 `hard`

A company has a central Tools AWS Account (`111111111111`) running AWS CodePipeline and wants to deploy an AWS CloudFormation stack into a separate Production AWS Account (`222222222222`). CodePipeline stores build artifacts in an S3 bucket in the Tools account encrypted with a KMS key. When the cross-account CloudFormation deploy action runs, it fails with `AccessDenied` while reading the artifact from S3. What are the TWO most common missing configurations?

- **A.** The Production account must create a duplicate CodePipeline in `us-east-1` to pull artifacts from the Tools account over a cross-region VPC peering connection.
- **B.** CodePipeline must use a long-term IAM User Access Key from the Production account instead of an IAM Role.
- **C.** The CodePipeline Artifact S3 bucket must disable server-side encryption completely for cross-account deployments.
- **D.** The Artifact S3 bucket uses a Customer-Managed KMS Key granting `kms:Decrypt` to the Production deploy role, and the bucket policy grants `s3:GetObject`.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Yêu cầu bắt buộc khi **CodePipeline Cross-Account Deployment**:
1. **Artifact S3 Bucket** phải mã hóa bằng **Customer-Managed KMS Key (CMK)** (không dùng `aws/s3`).
2. **KMS Key Policy** & **S3 Bucket Policy** ở Tools Account phải cho phép Target Account / Cross-Account Role.
3. Action ở Target Account cấu hình `RoleArn` trỏ sang IAM Role ở Target Account (có Trust Policy tin cậy Tools Account).

- **A:** Sai vì một CodePipeline ở Tools Account hoàn toàn deploy được sang nhiều tài khoản khác nhau bằng `RoleArn` trên action.
- **B:** Sai vì CodePipeline dùng `sts:AssumeRole` vào IAM Role của Production account, không dùng IAM User Access Key.
- **C:** Sai vì CodePipeline hỗ trợ và khuyến nghị mã hóa cross-account bằng Customer-Managed KMS Key (CMK).
- **D (Đúng):** Đúng! Deploy cross-account trong CodePipeline **bắt buộc** dùng **Customer-Managed KMS Key (CMK)** cho Artifact S3 Bucket (vì AWS Managed Key `aws/s3` không chia sẻ cross-account được), đồng thời cả S3 Bucket Policy và KMS Key Policy ở Tools Account phải cấp quyền cho IAM Role của Production Account.

</details>

### Câu 14 `medium`

A developer is writing an AWS CDK TypeScript stack that provisions an Amazon S3 bucket for application logs and a DynamoDB table for production user data. By default in AWS CDK, stateful resources like S3 buckets and DynamoDB tables have `RemovalPolicy.RETAIN`. If the developer wants the S3 log bucket in a temporary `dev` stack to be automatically emptied and deleted when running `cdk destroy`, which CDK properties should be set on the Bucket construct?

- **A.** Run `cdk synth --destroy` to generate a CloudFormation template that empties and deletes the S3 bucket.
- **B.** Set `removalPolicy: RemovalPolicy.RETAIN` on the `s3.Bucket` construct so CDK retains the empty bucket.
- **C.** Set `removalPolicy: RemovalPolicy.DESTROY` and `autoDeleteObjects: true` on the `s3.Bucket` construct.
- **D.** Set `versioned: true` on the `s3.Bucket` construct so CloudFormation deletes all object versions automatically.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

**AWS CDK `RemovalPolicy`**:
- Mặc định cho tài nguyên chứa dữ liệu (S3, DynamoDB, RDS): **`RemovalPolicy.RETAIN`** (an toàn cho Prod).
- Cho môi trường Dev/Test muốn `cdk destroy` xóa sạch S3 Bucket: `removalPolicy: RemovalPolicy.DESTROY` + **`autoDeleteObjects: true`**.

- **A:** Sai vì không có cờ `--destroy` cho `cdk synth`, và việc xóa bucket phụ thuộc vào `RemovalPolicy`.
- **B:** Sai vì `RETAIN` giữ lại bucket sau khi chạy `cdk destroy`.
- **C (Đúng):** Đúng! Trong AWS CDK, đặt `removalPolicy: RemovalPolicy.DESTROY` sẽ đổi `DeletionPolicy` thành `Delete`, nhưng S3 bucket có dữ liệu bên trong sẽ không thể xóa nếu không rỗng — vì vậy cần thêm `autoDeleteObjects: true` để CDK tự tạo Custom Resource Lambda dọn sạch bucket trước khi xóa.
- **D:** Sai vì bật versioning khiến bucket có nhiều phiên bản object và càng khó xóa sạch nếu không có `autoDeleteObjects: true`.

</details>

### Câu 15 `medium`

In AWS CDK, a developer needs to configure a very specific low-level CloudFormation property on an Amazon S3 bucket that is not yet exposed by the high-level `s3.Bucket` L2 construct. How should the developer set this property without rewriting the entire stack in raw YAML?

- **A.** Edit the generated CloudFormation JSON file inside `cdk.out/` manually after every `cdk deploy` run.
- **B.** Create a new L3 Pattern construct from scratch in TypeScript without generating any underlying AWS CloudFormation template resources.
- **C.** Disable `cdk bootstrap` in the target account so CDK bypasses CloudFormation property validation.
- **D.** Use an Escape Hatch by accessing `bucket.node.defaultChild as s3.CfnBucket` (the L1 construct) or `addPropertyOverride()`.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

3 cấp độ Construct trong **AWS CDK**:
- **L1 (`Cfn*`)**: Ánh xạ 1-1 với CloudFormation resource.
- **L2**: Construct có mặc định hợp lý, helper methods (như `grantReadWrite`). Dùng **Escape Hatch** (`node.defaultChild`) khi cần chạm xuống L1.
- **L3 (Patterns)**: Kết hợp nhiều dịch vụ (như `ApplicationLoadBalancedFargateService`).

- **A:** Sai vì `cdk.out/` bị ghi đè mỗi lần chạy `cdk synth`/`cdk deploy` và sửa sau `cdk deploy` không có tác dụng.
- **B:** Sai vì mọi CDK construct cuối cùng đều tổng hợp (synthesize) ra CloudFormation.
- **C:** Sai vì `cdk bootstrap` không liên quan đến thuộc tính của L1/L2 constructs.
- **D (Đúng):** Đúng! Trong AWS CDK, **Escape Hatches** (`node.defaultChild as Cfn*` hoặc `addPropertyOverride`) cho phép truy cập trực tiếp xuống tầng **L1 Construct (`Cfn*`)** để chỉnh bất kỳ thuộc tính CloudFormation thô nào mà vẫn giữ được lợi ích của L2 Construct.

</details>

### Câu 16 `medium` *(Chọn nhiều đáp án)*

A developer is building an AWS Lambda function in Python that reads and writes items in Amazon DynamoDB. Before deploying to the production AWS account, the developer wants to run fast unit tests offline in CI and also run local integration tests against a simulated DynamoDB service on their laptop. Which TWO approaches should the developer use? (Choose two.)

- **A.** Use `unittest.mock` / `moto` (or `botocore.stub.Stubber`) in unit tests to mock `boto3` DynamoDB API calls without network access.
- **B.** Run DynamoDB Local (Docker container) together with `sam local invoke` and point the `boto3` client's `endpoint_url` to the local container for integration testing.
- **C.** Run all unit tests directly against the live production DynamoDB table using `DeleteTable` cleanup afterward.
- **D.** Use AWS CloudFormation Drift Detection to execute Python unit tests and verify DynamoDB table schemas.
- **E.** Use AWS X-Ray Sampling Rules to intercept and simulate DynamoDB API responses offline during unit tests.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**, **B**

Chiến lược kiểm thử **Serverless trên AWS**:
- **Unit Tests (Offline/Nhanh)**: Mock AWS SDK (`botocore.stub.Stubber`, `moto`, `aws-sdk-client-mock`).
- **Local Integration Tests**: **`sam local invoke`** / **`sam local start-api`** kết hợp **DynamoDB Local** (Docker).
- **Cloud Testing**: Dùng `sam sync` lên sandbox dev account để test IAM permissions và dịch vụ thật.

- **A (Đúng):** Đúng! Mocking AWS SDK calls (như `Stubber` trong botocore hoặc `moto` / `unittest.mock`) giúp unit test chạy siêu nhanh, hoàn toàn offline trong pipeline CI.
- **B (Đúng):** Đúng! AWS cung cấp **DynamoDB Local** (dạng Docker/JAR) kết hợp với **`sam local invoke`** trên Docker network cục bộ để chạy integration test sát thực tế trước khi đẩy lên cloud.
- **C:** Sai vì chạy test trực tiếp trên bảng Production cực kỳ nguy hiểm và gây tốn kém/rủi ro mất dữ liệu.
- **D:** Sai vì Drift Detection chỉ kiểm tra sai lệch hạ tầng CloudFormation.
- **E:** Sai vì X-Ray chỉ là công cụ tracing, không mô phỏng cơ sở dữ liệu DynamoDB.

</details>

### Câu 17 `hard` *(Chọn nhiều đáp án)*

A CloudFormation stack update fails midway and enters the `UPDATE_ROLLBACK_FAILED` state because a resource that CloudFormation is trying to roll back was manually deleted out-of-band in the console. Meanwhile, another newly created stack entered `ROLLBACK_COMPLETE` on initial creation. Which TWO statements accurately describe how to recover from these two states? (Choose two.)

- **A.** For `ROLLBACK_COMPLETE`, run `aws cloudformation update-stack` directly with the fixed template.
- **B.** For `ROLLBACK_COMPLETE` on initial stack creation, the stack must be deleted (`delete-stack`) and recreated after fixing the template.
- **C.** For `UPDATE_ROLLBACK_FAILED`, run `aws cloudformation continue-update-rollback` (with `--resources-to-skip` for the deleted resource).
- **D.** Both states can be fixed by changing `DeletionPolicy` to `Retain` and running `sam package`.
- **E.** For `UPDATE_ROLLBACK_FAILED`, run `aws cloudformation detect-stack-drift` to automatically restore the deleted resource before retrying.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**, **C**

Xử lý 2 trạng thái lỗi kinh điển của **AWS CloudFormation**:
- **`ROLLBACK_COMPLETE`** (tạo stack mới thất bại): Chỉ có thể **`delete-stack`** rồi tạo lại.
- **`UPDATE_ROLLBACK_FAILED`** (update stack cũ thất bại và rollback cũng lỗi): Chạy **`continue-update-rollback`** (dùng `--resources-to-skip` nếu có tài nguyên không rollback được).

- **A:** Sai vì CloudFormation không cho phép chạy `update-stack` trên stack đang ở trạng thái `ROLLBACK_COMPLETE`.
- **B (Đúng):** Đúng! Một stack tạo mới lần đầu bị lỗi sẽ rơi vào **`ROLLBACK_COMPLETE`** — trạng thái này **không cho phép `update-stack`**, bắt buộc phải xóa stack (`delete-stack`) và tạo lại.
- **C (Đúng):** Đúng! Khi stack bị kẹt ở **`UPDATE_ROLLBACK_FAILED`**, bạn không thể `update-stack` mới được cho tới khi chạy **`continue-update-rollback`** (kèm `--resources-to-skip` cho tài nguyên bị xóa tay) để đưa stack về trạng thái ổn định.
- **D:** Sai vì `sam package` không mở khóa được trạng thái rollback của CloudFormation.
- **E:** Sai vì Drift Detection chỉ phát hiện sai lệch, không tự khôi phục hay mở khóa trạng thái `UPDATE_ROLLBACK_FAILED`.

</details>

### Câu 18 `hard`

An API Gateway REST API integrates with a legacy backend that expects XML payloads, while mobile clients send JSON payloads. The developer wants API Gateway to transform the incoming JSON body into XML before forwarding it to the backend—without adding an AWS Lambda function in between. Which API Gateway feature should be used?

- **A.** Switch from API Gateway REST API to HTTP API because HTTP API specializes in VTL XML transformations.
- **B.** Configure a Non-Proxy Integration with an Apache Velocity Template Language (VTL) Mapping Template in the Integration Request.
- **C.** Enable Lambda Proxy Integration on the method so API Gateway converts JSON to XML automatically.
- **D.** Use an Amazon Cognito User Pool Authorizer to rewrite the incoming request body from JSON to XML before backend AWS Lambda integration.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

**API Gateway Mapping Templates (VTL)**:
- Chỉ có trên **REST API** với **Non-Proxy Integration**.
- Dùng **Integration Request** để biến đổi JSON -> XML (hoặc đổi tên field) trước khi gửi xuống backend, và **Integration Response** để biến đổi XML -> JSON trước khi trả về client.

- **A:** Sai vì HTTP API **không hỗ trợ** VTL Mapping Templates (đây là tính năng chỉ có trên REST API).
- **B (Đúng):** Đúng! Trong **REST API Non-Proxy Integration**, **Mapping Templates (VTL)** ở bước **Integration Request** cho phép chuyển đổi cấu trúc body (ví dụ JSON sang XML bằng `$input.path(...)`) ngay tại tầng API Gateway mà không cần Lambda.
- **C:** Sai vì Proxy Integration chuyển thẳng nguyên bản request xuống backend mà bỏ qua bước Mapping Template.
- **D:** Sai vì Cognito Authorizer chỉ xác thực JWT, không chuyển đổi payload.

</details>

### Câu 19 `medium`

A developer creates a Customer-Managed KMS Key (CMK) using AWS CloudFormation without specifying a custom `KeyPolicy` or inadvertently removes the `"Principal": {"AWS": "arn:aws:iam::111122223333:root"}` statement from the Key Policy. Later, an IAM Administrator with `AdministratorAccess` tries to manage the KMS key and receives `AccessDenied`. Why?

- **A.** The IAM Administrator needs `s3:PutBucketPolicy` permission attached to their user before calling KMS.
- **B.** KMS CMKs do NOT trust IAM policies by default unless the Key Policy includes `arn:aws:iam::<account-id>:root`.
- **C.** KMS customer-managed keys can only be managed by the AWS Organizations management account root user.
- **D.** The KMS key must be converted to an Asymmetric `RSA_2048` key before IAM policies can apply to it for key management.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Quy tắc đặc biệt của **AWS KMS Key Policy**:
- Mặc định KMS **không** ủy quyền cho IAM Policies.
- Phải giữ statement `"Principal": { "AWS": "arn:aws:iam::<account-id>:root" }, "Action": "kms:*", "Resource": "*"` trong Key Policy thì các IAM Policies trong tài khoản mới hoạt động trên key đó.

- **A:** Sai vì quyền S3 không liên quan đến KMS Key Policy.
- **B (Đúng):** Đúng! Đặc thù bảo mật của **AWS KMS**: IAM Identity Policies chỉ có hiệu lực đối với một CMK **khi và chỉ khi** KMS Key Policy của CMK đó có statement cho phép `arn:aws:iam::<account-id>:root`. Nếu xóa dòng này, ngay cả `AdministratorAccess` cũng không quản trị được key!
- **C:** Sai vì mỗi tài khoản tự quản lý KMS keys của mình nếu Key Policy cho phép.
- **D:** Sai vì cả Symmetric và Asymmetric KMS keys đều tuân theo quy tắc Key Policy.

</details>

### Câu 20 `medium`

A developer is writing an AWS CloudFormation template that creates a VPC in Stack A (`network-stack`) and wants to reference that VPC's ID in Stack B (`app-stack`) without passing it manually as a parameter each time. How should Stack A and Stack B be connected?

- **A.** In Stack A, define an `Outputs` entry with an `Export.Name` (e.g., `SharedVpcId`); in Stack B, reference it using `Fn::ImportValue: SharedVpcId`.
- **B.** Use `DependsOn: network-stack` inside Stack B's `Resources` section to import Stack A outputs.
- **C.** Use `Fn::FindInMap` in Stack B to dynamically look up the VPC ID exported by Stack A.
- **D.** Use `Fn::GetAtt` directly in Stack B pointing to the Logical Resource ID defined inside Stack A.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

**CloudFormation Cross-Stack References**:
- Stack nguồn: `Outputs` -> `Export: { Name: ... }`.
- Stack đích: **`Fn::ImportValue`**.
- Ràng buộc: Phải cùng Account & Region, tên Export là duy nhất trong Region, và CloudFormation chặn xóa/sửa giá trị Export khi vẫn còn stack khác đang import.

- **A (Đúng):** Đúng! **CloudFormation Cross-Stack Reference** sử dụng **`Outputs` + `Export`** ở stack cung cấp và **`Fn::ImportValue`** ở stack tiêu thụ. *(Lưu ý: Không thể xóa Stack A nếu Stack B vẫn đang import giá trị đó).*
- **B:** Sai vì `DependsOn` chỉ nhận Logical ID trong cùng template.
- **C:** Sai vì `Mappings` là bảng hằng số tĩnh viết sẵn trước khi deploy, không đọc được ID tài nguyên mới sinh của Stack A.
- **D:** Sai vì `Fn::GetAtt` và `Ref` chỉ truy cập được tài nguyên trong **cùng một stack**.

</details>

### Câu 21 `medium`

A company has a monolithic CloudFormation template that has grown to 5,000 lines and repeatedly defines the exact same Application Load Balancer and Target Group setup across multiple environments. The team wants to break the template into modular, reusable sub-templates stored in Amazon S3 and deploy them together from a single root stack. Which CloudFormation pattern should they use?

- **A.** CloudFormation Drift Detection to split large templates into modular reusable components.
- **B.** CloudFormation `DeletionPolicy: Snapshot`
- **C.** CloudFormation StackSets deployed across multiple AWS accounts and Regions from a single monolithic template.
- **D.** Nested Stacks using the `AWS::CloudFormation::Stack` resource pointing to the sub-template S3 URLs.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

**CloudFormation Nested Stacks** (`AWS::CloudFormation::Stack`):
- Dùng để tái sử dụng các mẫu hạ tầng lặp lại và tránh giới hạn kích thước template (51,200 bytes trực tiếp / 1 MB qua S3) & giới hạn 500 resources/stack.

- **A:** Sai vì Drift Detection chỉ phát hiện sai lệch cấu hình.
- **B:** Sai vì `DeletionPolicy` chỉ kiểm soát hành vi khi xóa tài nguyên.
- **C:** Sai vì StackSets dùng để triển khai **cùng 1 template** ra nhiều Accounts/Regions, không phải để chia nhỏ module hóa 1 kiến trúc thành các template con.
- **D (Đúng):** Đúng! **Nested Stacks** (`AWS::CloudFormation::Stack`) cho phép chia nhỏ template khổng lồ thành các template con tái sử dụng được (lưu trên S3) và quản lý vòng đời đồng bộ từ 1 Root Stack duy nhất.

</details>

### Câu 22 `medium`

An AWS CloudFormation template defines an `Environment` parameter (`dev`, `prod`) and an Amazon RDS DBInstance. The team wants the CloudFormation stack to provision a `MultiAZ: true` RDS instance ONLY when `Environment` is `prod`, and a `MultiAZ: false` instance for `dev`. Which CloudFormation intrinsic function and section achieve this?

- **A.** Use `Fn::Base64` on the `MultiAZ` property to encode environment-specific database flags.
- **B.** Define a condition `IsProd: !Equals [!Ref Environment, prod]` under `Conditions`, and set `MultiAZ: !If [IsProd, true, false]` on the RDS resource.
- **C.** Use `Fn::Join` inside the `Outputs` section of the template to toggle `MultiAZ` conditionally.
- **D.** Set `Condition: IsProd` directly on the `Parameters` section of the CloudFormation template.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

**CloudFormation `Conditions`**:
- Hỗ trợ các hàm logic: `Fn::Equals`, `Fn::And`, `Fn::Or`, `Fn::Not`, `Fn::If`.
- Dùng `Condition: <Name>` trên Resource/Output để quyết định có tạo tài nguyên đó hay không.

- **A:** Sai vì `Fn::Base64` dùng để mã hóa chuỗi Base64 (thường cho EC2 UserData).
- **B (Đúng):** Đúng! Kết hợp phần **`Conditions`** (`Fn::Equals`) với hàm **`Fn::If`** (`!If [ConditionName, value_if_true, value_if_false]`) là cách chuẩn để bật/tắt thuộc tính hoặc tạo có điều kiện cả một resource trong CloudFormation.
- **C:** Sai vì `Fn::Join` chỉ nối chuỗi trong `Outputs`, không tạo logic điều kiện.
- **D:** Sai vì `Condition` chỉ gắn được vào `Resources` và `Outputs`, không gắn vào `Parameters`.

</details>

### Câu 23 `medium`

A developer uses AWS SAM (`sam sync --watch`) during active development of a Lambda-based REST API in a personal sandbox AWS account. How does `sam sync` (AWS SAM Accelerate) speed up the code-test-debug cycle compared to `sam deploy`?

- **A.** `sam sync --watch` detects local code changes and updates Lambda code/layers directly via Lambda APIs (skipping CloudFormation).
- **B.** `sam sync --watch` runs all AWS Lambda and DynamoDB services locally inside Docker containers without connecting to the AWS Cloud.
- **C.** `sam sync` triggers a full AWS CodePipeline execution on every file save or keystroke in the IDE.
- **D.** `sam sync` converts the SAM YAML template into an AWS CDK TypeScript application before deploying changes.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

**AWS SAM Accelerate (`sam sync --watch`)**:
- Chỉ dùng cho môi trường **Dev/Sandbox** (đồng bộ code trong vài giây, bỏ qua CloudFormation khi chỉ sửa code).
- Cho **Staging/Production**: Luôn dùng **`sam deploy`** (qua CloudFormation Change Sets).

- **A (Đúng):** Đúng! **AWS SAM Accelerate (`sam sync`)** đẩy nhanh tốc độ dev trên cloud bằng cách gọi thẳng AWS service APIs (`UpdateFunctionCode`...) chỉ trong vài giây thay vì chờ CloudFormation Change Set, và chỉ gọi CloudFormation khi `template.yaml` thay đổi.
- **B:** Sai vì chạy local Docker là `sam local`, còn `sam sync` đồng bộ trực tiếp lên môi trường AWS thật trên cloud (chỉ nên dùng cho dev/sandbox, không dùng cho prod!).
- **C:** Sai vì `sam sync` chạy trực tiếp từ máy developer lên tài khoản AWS dev.
- **D:** Sai vì `sam sync` không chuyển đổi code sang CDK.

</details>

### Câu 24 `medium`

A developer defines an AWS Lambda function in an AWS SAM `template.yaml` and wants to grant it read-only access to an Amazon DynamoDB table (`OrdersTable`) using the simplest, least-privilege SAM syntax without writing verbose raw IAM policy JSON. Which SAM feature provides pre-built least-privilege IAM policy shortcuts?

- **A.** Attach `AdministratorAccess` under `Globals.Function.Policies` so all SAM Lambda functions can access DynamoDB tables.
- **B.** Put the inline IAM policy JSON directly inside `samconfig.toml` under `[default.deploy.parameters]`.
- **C.** Use AWS SAM Policy Templates under `Policies` (e.g., `DynamoDBReadPolicy: { TableName: !Ref OrdersTable }`).
- **D.** Use `Events: DynamoDB` on the function to automatically grant read/write IAM access to all tables.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

**AWS SAM Policy Templates**:
- Viết ngắn gọn dưới `Policies:` của `AWS::Serverless::Function` (ví dụ `DynamoDBReadPolicy`, `DynamoDBCrudPolicy`, `S3ReadPolicy`, `SQSPollerPolicy`).
- SAM tự động biên dịch ra IAM Policy tối thiểu khi `sam deploy`.

- **A:** Sai vì `AdministratorAccess` vi phạm nghiêm trọng nguyên tắc Least Privilege.
- **B:** Sai vì `samconfig.toml` không định nghĩa IAM permissions.
- **C (Đúng):** Đúng! **SAM Policy Templates** cung cấp hàng chục mẫu policy ngắn gọn, chuẩn Least Privilege (như `DynamoDBReadPolicy`, `S3CrudPolicy`, `SQSSendMessagePolicy`, `KMSDecryptPolicy`) ngay dưới thuộc tính `Policies:` của `AWS::Serverless::Function`.
- **D:** Sai vì `Events: DynamoDB` chỉ tạo Event Source Mapping từ DynamoDB Streams, không cấp quyền đọc/ghi bảng chính.

</details>

### Câu 25 `medium`

A company has two AWS CodePipeline executions triggered within 10 seconds when a developer pushes two rapid commits to GitHub. In the Deploy stage (which updates a CloudFormation stack), the second pipeline execution fails because the stack is still being updated by the first execution. How should CodePipeline be configured to prevent concurrent executions from colliding in the Deploy stage?

- **A.** Add a `sleep 600` command inside `buildspec.yml` to serialize deployments across stages.
- **B.** Keep CodePipeline's default Execution Mode (`SUPERSEDED` or `QUEUED`), so only one execution occupies a stage at a time.
- **C.** Disable Amazon EventBridge triggers for CodePipeline and rely on manual pipeline starts.
- **D.** Switch the CodePipeline Execution Mode to `PARALLEL` so stages process commits concurrently.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

**CodePipeline Execution Modes**:
- **`SUPERSEDED`** (Mặc định): Mỗi stage chỉ 1 execution; bản mới hơn có thể thay thế bản cũ đang kẹt.
- **`QUEUED`**: Xếp hàng tuần tự FIFO, mọi commit đều được deploy lần lượt.
- **`PARALLEL`**: Chạy song song độc lập (tốn tài nguyên hơn, dễ xung đột tài nguyên dùng chung).

- **A:** Sai vì lãng phí tiền CodeBuild và không đảm bảo đồng bộ.
- **B (Đúng):** Đúng! CodePipeline hỗ trợ 3 chế độ thực thi (Execution Mode): **`SUPERSEDED`** (mặc định: bản mới vượt qua bản cũ nếu bản cũ chưa tới stage đó hoặc chờ stage giải phóng), **`QUEUED`** (xếp hàng tuần tự từng bản), và **`PARALLEL`** (chạy song song — dễ gây đụng độ CloudFormation nếu không tách stack).
- **C:** Sai vì tắt trigger sẽ làm mất tự động hóa CI/CD.
- **D:** Sai vì chế độ `PARALLEL` cho phép nhiều lượt chạy đâm thẳng vào stage Deploy cùng lúc, càng làm CloudFormation bị lỗi `UPDATE_IN_PROGRESS`.

</details>

### Câu 26 `medium`

A developer uses AWS CloudFormation to create an IAM Role (`AppRole`) and an EC2 Instance (`AppServer`) in the same template. Because `AppServer` references `!Ref AppInstanceProfile` (which references `AppRole`), CloudFormation creates them in the right order. However, the developer also has a Lambda function that needs to wait until an unrelated DynamoDB table (`ConfigTable`) is fully created before the Lambda Custom Resource runs. How can an explicit creation dependency be enforced?

- **A.** Add `DependsOn: ConfigTable` on the Lambda Custom Resource.
- **B.** Place `ConfigTable` higher up in the YAML file than the Custom Resource.
- **C.** Add `Condition: ConfigTable` on the Custom Resource.
- **D.** Add `DeletionPolicy: Retain` on `ConfigTable`.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Thứ tự tạo tài nguyên trong **CloudFormation**:
- Mặc định: **Song song**.
- Phụ thuộc ngầm định: Khi dùng `!Ref` hoặc `!GetAtt`.
- Phụ thuộc tường minh: Dùng **`DependsOn`** (nhận 1 Logical ID hoặc danh sách `[ResA, ResB]`).

- **A (Đúng):** Đúng! Thuộc tính **`DependsOn`** ép CloudFormation phải tạo xong `ConfigTable` trước khi bắt đầu tạo tài nguyên có khai báo `DependsOn` (và khi xóa stack sẽ xóa theo thứ tự ngược lại).
- **B:** Sai vì CloudFormation tạo các tài nguyên **song song** bất kể thứ tự dòng trong file YAML/JSON, trừ khi có tham chiếu (`Ref`/`GetAtt`) hoặc `DependsOn`.
- **C:** Sai vì `Condition` chỉ nhận tên một condition boolean trong phần `Conditions:`.
- **D:** Sai vì `DeletionPolicy` không quy định thứ tự tạo tài nguyên.

</details>

### Câu 27 `medium`

A team uses AWS SAM to deploy a Lambda function and wants to bundle an external binary (`ffmpeg`) into a reusable Lambda Layer (`AWS::Serverless::LayerVersion`). Where will the Lambda function find the `ffmpeg` binary at runtime when the Layer is attached?

- **A.** `/tmp/layers/ffmpeg` (ephemeral temp)
- **B.** `/etc/lambda/ffmpeg` (system config)
- **C.** `/var/task/ffmpeg` (default Lambda task root)
- **D.** `/opt/bin/ffmpeg` (matching the layer ZIP)

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Đường dẫn trong **AWS Lambda Execution Environment**:
- Code chính của Lambda: **`/var/task`** (read-only).
- **Lambda Layers**: **`/opt`** (Python tìm ở `/opt/python`, Node.js tìm ở `/opt/nodejs/node_modules`, binary ở `/opt/bin`).
- Bộ nhớ tạm ghi được: **`/tmp`**.

- **A:** Sai vì `/tmp` là bộ nhớ tạm ghi được khi chạy, không phải nơi giải nén Layer.
- **B:** Sai vì Lambda không giải nén Layer vào `/etc/lambda`.
- **C:** Sai vì `/var/task` là nơi chứa mã nguồn chính của hàm Lambda, không phải Layer.
- **D (Đúng):** Đúng! Mọi AWS Lambda Layer đều được giải nén vào thư mục **`/opt`** trong môi trường thực thi Lambda (và `/opt/bin` được thêm sẵn vào biến `PATH`).

</details>

### Câu 28 `medium`

A developer has built an AWS CloudFormation template that uses `AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>` as a Parameter type with the default value `/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64`. What is the advantage of using this SSM Parameter type instead of hardcoding AMI IDs in `Mappings`?

- **A.** It allows deploying EC2 instances without specifying a `KeyName`, security group, or VPC subnet.
- **B.** It automatically upgrades running EC2 instances in place every night without requiring a CloudFormation stack update or downtime.
- **C.** CloudFormation resolves the latest Amazon Linux 2023 AMI ID per Region automatically without a static lookup map.
- **D.** It encrypts the AMI ID parameter value using an AWS KMS customer-managed key.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

2 cách lấy **AMI ID theo Region** trong CloudFormation:
1. **`Mappings` + `Fn::FindInMap`**: Phù hợp khi muốn ghim cứng (pin) đúng 1 AMI ID cụ thể.
2. **`AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>`**: Tự động lấy AMI mới nhất từ AWS Public Parameter Store tại mỗi Region.

- **A:** Sai vì kiểu tham số này chỉ dùng để phân giải AMI ID.
- **B:** Sai vì CloudFormation chỉ đọc giá trị SSM tại thời điểm tạo/cập nhật stack, không tự động thay thế EC2 đang chạy hằng đêm.
- **C (Đúng):** Đúng! Dùng kiểu tham số **`AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>`** trỏ tới Public SSM Parameter của AWS giúp template tự động lấy được **AMI ID mới nhất đúng theo Region** mỗi khi triển khai mà không cần cập nhật bảng `Mappings` thủ công.
- **D:** Sai vì AMI ID công khai không phải dữ liệu bí mật cần mã hóa.

</details>

### Câu 29 `medium`

A developer wants to deploy a Lambda function using AWS SAM with a gradual traffic-shifting strategy that shifts **10% of traffic every 1 minute** until 100% of traffic is on the new version (completing in 10 minutes). Which `DeploymentPreference.Type` value in SAM should be used?

- **A.** `AllAtOnce`
- **B.** `Canary10Percent5Minutes`
- **C.** `Linear10PercentEvery1Minute`
- **D.** `RollingWithAdditionalBatch` (ASG)

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

3 nhóm chiến lược chuyển traffic của **SAM / CodeDeploy Lambda**:
- **Canary**: `Canary10Percent5Minutes`, `Canary10Percent10Minutes`, `Canary10Percent15Minutes`, `Canary10Percent30Minutes` (thử X% trong Y phút -> nhảy lên 100%).
- **Linear**: `Linear10PercentEvery1Minute`, `Linear10PercentEvery2Minutes`, `Linear10PercentEvery3Minutes`, `Linear10PercentEvery10Minutes` (tăng đều X% mỗi Y phút).
- **AllAtOnce**: Chuyển 100% ngay.

- **A:** Sai vì `AllAtOnce` chuyển 100% traffic ngay lập tức.
- **B:** Sai vì **Canary** giữ 10% trong 5 phút rồi nhảy vọt một lần lên 100%, không tăng đều 10% mỗi phút.
- **C (Đúng):** Đúng! **`Linear10PercentEvery1Minute`** tăng tuyến tính 10% mỗi phút (10% -> 20% -> ... -> 100% sau 9–10 phút).
- **D:** Sai vì `RollingWithAdditionalBatch` là chiến lược của Elastic Beanstalk (EC2), không phải SAM/CodeDeploy Lambda.

</details>

### Câu 30 `medium`

An AWS CloudFormation template creates an Amazon DynamoDB table (`Orders`). During a stack update, a developer accidentally changes the `KeySchema` (Partition Key) of the DynamoDB table in the template. What will CloudFormation do when updating the stack, and how can accidental data loss on the production table be prevented?

- **A.** Use `sam local invoke` to update the production DynamoDB table schema without replacement.
- **B.** CloudFormation automatically migrates all 10 million items to the new Partition Key in place with zero downtime.
- **C.** Enable `TerminationProtection` on the stack, which blocks `Update:Replace` on individual resources.
- **D.** Changing `KeySchema` triggers Replacement; prevent it with a Stack Policy denying `Update:Replace` and `Update:Delete` (plus `DeletionPolicy: Retain`).

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Bảo vệ tài nguyên Stateful (RDS, DynamoDB) trong **CloudFormation**:
- **Stack Policy**: Chặn `Update:Replace` / `Update:Delete` khi update stack.
- **`DeletionPolicy: Retain` / `Snapshot`**: Bảo vệ khi xóa stack hoặc replacement.
- **Termination Protection**: Chặn thao tác `DeleteStack`.

- **A:** Sai vì `sam local invoke` chỉ chạy test local.
- **B:** Sai vì DynamoDB không hỗ trợ đổi Primary Key tại chỗ; mọi thay đổi `KeySchema` đều là Replacement.
- **C:** Sai vì `TerminationProtection` chỉ chặn lệnh **`DeleteStack`**, không chặn `UpdateStack` gây Replacement tài nguyên.
- **D (Đúng):** Đúng! Đổi Partition Key / Sort Key của DynamoDB là thay đổi đòi hỏi **Replacement** (tạo bảng mới, xóa bảng cũ). Dùng **Stack Policy** chặn `Update:Replace` / `Update:Delete` sẽ khiến CloudFormation từ chối thực thi update nguy hiểm đó.

</details>

### Câu 31 `medium`

A team uses AWS CDK in Python to provision an application containing an Amazon S3 bucket and an AWS Lambda function. The developer wants to grant the Lambda function's execution role exact least-privilege read/write permissions to that S3 bucket without writing raw IAM Policy JSON. Which idiomatic AWS CDK L2 Construct method accomplishes this in a single line?

- **A.** `lambda_fn.add_environment("IAM_ROLE", "AdministratorAccess")`
- **B.** `bucket.grant_read_write(lambda_fn)`
- **C.** `cdk.bootstrap(bucket, lambda_fn)`
- **D.** `cdk diff --grant-permissions`

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

**AWS CDK `grant_*` methods**:
- Ví dụ: `bucket.grant_read(fn)`, `table.grant_read_write_data(fn)`, `secret.grant_read(fn)`.
- Tự động tạo Least-Privilege IAM Policy và tự động cấp thêm quyền KMS nếu tài nguyên dùng CMK.

- **A:** Sai vì biến môi trường không cấp quyền IAM.
- **B (Đúng):** Đúng! Các L2 Construct trong AWS CDK cung cấp sẵn các phương thức **`grant_*`** (như `bucket.grant_read_write(fn)`, `table.grant_read_data(fn)`, `queue.grant_send_messages(fn)`) tự động sinh IAM Policy tối thiểu (kèm quyền KMS nếu bucket mã hóa CMK!).
- **C:** Sai vì không có hàm `cdk.bootstrap()` trong code stack; `cdk bootstrap` là lệnh CLI.
- **D:** Sai vì `cdk diff` chỉ xem trước thay đổi.

</details>

### Câu 32 `medium`

A developer wants to deploy an AWS SAM application that includes an Amazon API Gateway REST API with two Lambda functions, and wants to verify the CloudFormation template syntax and SAM transform rules locally before pushing to Git. Which SAM CLI command validates the template?

- **A.** `sam logs --tail` (for CloudWatch log streaming)
- **B.** `sam delete` (to tear down the CloudFormation stack)
- **C.** `sam local generate-event` (for mock payloads)
- **D.** `sam validate --lint` (with cfn-lint rules)

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

**`sam validate --lint`**: Lệnh kiểm tra cú pháp và best practices cho `template.yaml` trước khi build/deploy.

- **A:** Sai vì `sam logs` dùng để xem CloudWatch Logs của hàm Lambda đã deploy.
- **B:** Sai vì `sam delete` dùng để xóa stack đã deploy.
- **C:** Sai vì `sam local generate-event` chỉ sinh JSON event mẫu (S3, SQS, API Gateway) để test.
- **D (Đúng):** Đúng! **`sam validate`** kiểm tra xem `template.yaml` có hợp lệ theo đặc tả AWS SAM / CloudFormation hay không (thêm `--lint` để kiểm tra sâu hơn với `cfn-lint`).

</details>

### Câu 33 `medium` *(Chọn nhiều đáp án)*

A company runs a mission-critical serverless API using AWS SAM and AWS CodeDeploy. To minimize the risk of bad deployments in production, the team wants to: (1) shift 10% of traffic for 10 minutes before shifting the remaining 90%, and (2) automatically roll back if the Lambda `Errors` metric exceeds 5 errors in 1 minute. Which TWO configurations must be present in the SAM `template.yaml`? (Choose two.)

- **A.** Define an `AWS::CloudWatch::Alarm` watching the `Errors` metric for the Lambda function alias and reference it under `DeploymentPreference.Alarms`.
- **B.** Omit `AutoPublishAlias` and point Amazon API Gateway directly to the `$LATEST` Lambda function version.
- **C.** Set `DeploymentPreference.Type` to `AllAtOnce` so traffic shifts immediately without canary validation.
- **D.** Use `DeletionPolicy: Snapshot` on the `AWS::Serverless::Function` resource to enable automatic rollbacks.
- **E.** Set `AutoPublishAlias: live` and `DeploymentPreference: { Type: Canary10Percent10Minutes }` on the `AWS::Serverless::Function` resource.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**, **E**

**SAM Canary Deployment**: Cần đủ 3 thành phần: `AutoPublishAlias` + `DeploymentPreference.Type` (`Canary10Percent10Minutes`) + `DeploymentPreference.Alarms` (CloudWatch Alarm).

- **A (Đúng):** Đúng! Khai báo CloudWatch Alarm trong `DeploymentPreference.Alarms` giúp CodeDeploy tự động rollback về version cũ ngay khi alarm chuyển sang trạng thái `ALARM`.
- **B:** Sai vì `$LATEST` không hỗ trợ traffic shifting (Alias weighted routing) của CodeDeploy.
- **C:** Sai vì `AllAtOnce` chuyển 100% traffic ngay lập tức, không có giai đoạn 10% trong 10 phút.
- **D:** Sai vì Lambda function không hỗ trợ `DeletionPolicy: Snapshot`.
- **E (Đúng):** Đúng! `AutoPublishAlias` kích hoạt quản lý version/alias tự động, và `Canary10Percent10Minutes` chuyển 10% traffic trong 10 phút trước khi chuyển 100%.

</details>

### Câu 34 `medium`

A developer uses AWS CloudFormation to provision an Amazon S3 bucket and wants to pass the generated bucket name to a Lambda function in the same template without hardcoding the bucket name (so CloudFormation can generate a unique name automatically). Which CloudFormation intrinsic function returns the physical bucket name?

- **A.** `!ImportValue MyS3Bucket`
- **B.** `!Ref MyS3Bucket`
- **C.** `!FindInMap [MyS3Bucket, Name]`
- **D.** `!Base64 MyS3Bucket`

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Hàm nội tại **CloudFormation** cơ bản:
- **`!Ref`**: Trả về giá trị Parameter hoặc **Physical ID** (tên bucket, instance ID, queue URL...).
- **`!GetAtt`**: Trả về thuộc tính cụ thể (ARN, Endpoint, DomainName...).
- **`!Sub`**: Chèn biến vào chuỗi (`"arn:aws:s3:::${MyBucket}/*"`).

- **A:** Sai vì `Fn::ImportValue` dùng để nhập output từ một **stack khác**.
- **B (Đúng):** Đúng! Trong CloudFormation, `!Ref` trên resource `AWS::S3::Bucket` trả về **physical bucket name** (còn `!GetAtt MyS3Bucket.Arn` trả về ARN, `!GetAtt MyS3Bucket.RegionalDomainName` trả về domain name).
- **C:** Sai vì `Fn::FindInMap` chỉ tra cứu trong bảng hằng số `Mappings`.
- **D:** Sai vì `Fn::Base64` dùng để mã hóa Base64.

</details>

### Câu 35 `medium`

A developer has a CloudFormation stack that uses `DeletionPolicy: Retain` on an Amazon RDS database. Later, the developer deletes the CloudFormation stack, and the RDS database remains running as expected. What happens if the developer later needs to manage that retained RDS database through CloudFormation again?

- **A.** Run `aws cloudformation update-stack` with the old stack name; CloudFormation automatically re-attaches deleted stacks and retained resources.
- **B.** Run `aws cloudformation detect-stack-drift` on the deleted stack name to automatically re-import retained resources.
- **C.** Use CloudFormation Resource Import (`ChangeSetType: IMPORT`) to bring the existing RDS database back under CloudFormation.
- **D.** It is impossible in CloudFormation; the retained RDS database must be deleted and recreated from a snapshot.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

**CloudFormation Resource Import**: Cho phép đưa các tài nguyên sẵn có (được tạo thủ công hoặc từng bị `Retain`) vào một CloudFormation stack (yêu cầu khai báo `DeletionPolicy` trên resource nhập).

- **A:** Sai vì một stack đã xóa (`DELETE_COMPLETE`) không thể `update-stack` lại trực tiếp.
- **B:** Sai vì Drift Detection không đưa tài nguyên vào lại stack.
- **C (Đúng):** Đúng! **CloudFormation Resource Import** cho phép nhập các tài nguyên đang tồn tại (như RDS bị retain hoặc tài nguyên tạo tay trước đó) vào quản lý bởi một CloudFormation stack mà không cần tạo lại.
- **D:** Sai vì CloudFormation hỗ trợ tính năng **Resource Import**.

</details>

### Câu 36 `medium`

A developer uses AWS CDK to manage a multi-stack application (`NetworkStack` and `AppStack`). The developer wants to see the exact CloudFormation resource changes (additions, modifications, or replacements) that `AppStack` will undergo before actually applying them to AWS. Which CDK CLI command should be run?

- **A.** `cdk diff AppStack`
- **B.** `cdk bootstrap AppStack`
- **C.** `cdk doctor`
- **D.** `cdk destroy AppStack`

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

**`cdk diff`**: Tương đương bước xem Change Set trước khi chạy `cdk deploy`.

- **A (Đúng):** Đúng! **`cdk diff`** so sánh template mới tổng hợp từ code CDK với stack đang chạy trên AWS CloudFormation và in ra danh sách chi tiết tài nguyên/IAM changes trước khi deploy.
- **B:** Sai vì `cdk bootstrap` chỉ khởi tạo stack `CDKToolkit` ban đầu cho account/region.
- **C:** Sai vì `cdk doctor` chỉ kiểm tra phiên bản CDK CLI và biến môi trường.
- **D:** Sai vì `cdk destroy` xóa stack khỏi AWS.

</details>

### Câu 37 `medium` *(Chọn nhiều đáp án)*

A development team uses AWS SAM to build and deploy a serverless application with `sam build` and `sam deploy`. Which TWO statements about AWS SAM are accurate? (Choose two.)

- **A.** `sam deploy` bypasses AWS CloudFormation completely and cannot create IAM roles.
- **B.** `sam local start-api` requires an active internet connection to invoke Lambda functions on AWS in the cloud during local testing.
- **C.** AWS SAM templates cannot define Amazon SQS queues or Amazon S3 buckets in the same file.
- **D.** `sam build --use-container` compiles native C/C++ dependencies (e.g., `numpy`) inside a Lambda-like Amazon Linux Docker container.
- **E.** Every SAM template is a valid CloudFormation template with `Transform: AWS::Serverless-2016-10-31` and supports standard resources.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**, **E**

Hai điểm cốt lõi của **AWS SAM**:
1. `Transform: AWS::Serverless-2016-10-31` + hỗ trợ trộn lẫn `AWS::Serverless::*` và `AWS::*`.
2. **`sam build --use-container`**: Biên dịch native dependencies đúng chuẩn Amazon Linux của Lambda.

- **A:** Sai vì `sam deploy` thực chất triển khai thông qua **AWS CloudFormation** (và cần `--capabilities CAPABILITY_IAM` để tạo IAM Roles).
- **B:** Sai vì `sam local start-api` chạy Lambda cục bộ trong Docker container trên máy dev.
- **C:** Sai vì SAM hỗ trợ đầy đủ mọi resource chuẩn của CloudFormation.
- **D (Đúng):** Đúng! Chạy `sam build --use-container` rất quan trọng khi máy dev chạy Windows/macOS nhưng cần biên dịch thư viện native (C/C++) tương thích với môi trường Linux của AWS Lambda.
- **E (Đúng):** Đúng! AWS SAM là phần mở rộng của CloudFormation với dòng `Transform: AWS::Serverless-2016-10-31`, cho phép viết chung cả tài nguyên `AWS::Serverless::*` và tài nguyên CloudFormation chuẩn (`AWS::DynamoDB::Table`, `AWS::SQS::Queue`...) trong cùng một file.

</details>

### Câu 38 `medium`

A networking team deploys a shared VPC using an AWS CloudFormation stack named `NetworkStack`. An application team needs to reference the `PrivateSubnet1Id` created by `NetworkStack` inside their own separate `ApplicationStack` located in the same AWS account and Region. How should the two CloudFormation templates be configured?

- **A.** Export the subnet ID in the `Outputs` section of `NetworkStack` with an `Export` name, and reference it in `ApplicationStack` using `Fn::ImportValue`.
- **B.** Add a `CreationPolicy` attribute to the EC2 or Lambda resource in `ApplicationStack` to automatically import the VPC and subnet outputs from `NetworkStack`.
- **C.** Delete `NetworkStack` before deploying `ApplicationStack` so CloudFormation can recreate the shared VPC and subnets directly inside `ApplicationStack`.
- **D.** Call the `Fn::GetAtt` intrinsic function directly inside `ApplicationStack` to query the `PrivateSubnet1` resource attributes in `NetworkStack` without exporting.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Ghi nhớ về **Cross-Stack Reference** trong CloudFormation:
- Stack A xuất giá trị qua **`Outputs` + `Export`**.
- Stack B nhập giá trị qua **`Fn::ImportValue` (`!ImportValue`)**.
- *Lưu ý bẫy*: Khi Stack B đang import một giá trị từ Stack A thì bạn **KHÔNG THỂ xóa hoặc sửa giá trị Export đó ở Stack A** cho đến khi gỡ liên kết ở Stack B.

- **A (Đúng):** Đúng! Để chia sẻ giá trị giữa 2 CloudFormation Stacks trong cùng Account và Region, stack nguồn khai báo `Outputs` có trường `Export`, và stack đích dùng hàm nội tại `Fn::ImportValue` (hoặc `!ImportValue`).
- **B:** Sai vì `CreationPolicy` chỉ dùng để đợi tín hiệu khởi tạo hoàn tất (`cfn-signal`) từ EC2 hoặc Auto Scaling Group.
- **C:** Sai vì xóa `NetworkStack` sẽ xóa mất VPC và Subnet mà ứng dụng cần chạy.
- **D:** Sai vì `!GetAtt` và `!Ref` chỉ truy xuất được các tài nguyên nằm bên trong CÙNG một CloudFormation template.

</details>

### Câu 39 `medium`

A team is adopting the AWS Cloud Development Kit (AWS CDK) in TypeScript to provision serverless applications. Before synthesizing and deploying their first CDK stack to a new AWS account and Region, the developer receives an error stating that the environment lacks the required staging S3 bucket and IAM roles used by CDK for asset publishing. Which command must the developer run once per account/Region to provision these prerequisite resources?

- **A.** `sam local start-api`
- **B.** `cdk destroy`
- **C.** `cdk bootstrap`
- **D.** `cdk doctor`

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Bốn lệnh cốt lõi của **AWS CDK CLI**:
- **`cdk init`**: Tạo khung dự án CDK mới.
- **`cdk bootstrap`**: Khởi tạo tài nguyên nền (`CDKToolkit` stack: S3 bucket, ECR, IAM roles) cho mỗi cặp Account/Region.
- **`cdk synth`**: Biên dịch code TypeScript/Python ra CloudFormation template (`cdk.out`).
- **`cdk deploy`**: Triển khai stack lên AWS.

- **A:** Sai vì `sam local start-api` chỉ chạy máy chủ giả lập API Gateway ở máy cá nhân.
- **B:** Sai vì `cdk destroy` dùng để xóa một CDK stack đang chạy.
- **C (Đúng):** Đúng! Lệnh `cdk bootstrap` khởi tạo CloudFormation stack `CDKToolkit` chứa S3 staging bucket, ECR repository và các IAM Roles cần thiết để CDK đẩy assets và triển khai ứng dụng.
- **D:** Sai vì `cdk doctor` chỉ kiểm tra phiên bản môi trường local chứ không tạo tài nguyên trên AWS.

</details>

### Câu 40 `medium`

During iterative development of an AWS SAM serverless application, a developer modifies only the Python code inside an AWS Lambda function without changing any infrastructure configuration in `template.yaml`. Running `sam build && sam deploy` takes over 2 minutes because it performs a full AWS CloudFormation stack update every time. Which AWS SAM CLI command should the developer use to bypass CloudFormation and synchronize code changes directly to the Lambda service in seconds during development?

- **A.** `aws cloudformation delete-stack`
- **B.** `sam sync --watch --code` (SAM Accelerate)
- **C.** `sam validate --lint`
- **D.** `sam package --output-template-file`

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Trong đề DVA, khi hỏi cách **tăng tốc độ đồng bộ code Lambda/Step Functions lên môi trường đám mây dev trong vài giây mà bỏ qua CloudFormation** -> Chọn ngay **AWS SAM Accelerate (`sam sync --watch` / `sam sync --code`)**.

- **A:** Sai vì lệnh này xóa toàn bộ stack.
- **B (Đúng):** Đúng! Tính năng **SAM Accelerate (`sam sync --watch --code`)** tự động theo dõi thay đổi file và dùng trực tiếp API của Lambda/API Gateway/Step Functions để cập nhật code chỉ trong vài giây mà không cần đợi CloudFormation.
- **C:** Sai vì `sam validate` chỉ kiểm tra cú pháp file `template.yaml`.
- **D:** Sai vì `sam package` chỉ đóng gói và tải artifact lên S3 chứ không triển khai trực tiếp lên Lambda.

</details>

---

[← Bộ trước](12-dva-security-kms-secrets.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Bộ tiếp theo →](14-dva-cicd-codepipeline.md)
