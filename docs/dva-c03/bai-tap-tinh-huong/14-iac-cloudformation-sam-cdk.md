# Bài tập tình huống — Chủ đề 14: Infrastructure as Code — CloudFormation, AWS SAM & CDK

> CloudFormation Intrinsic Functions & StackSets, AWS SAM (sam build/deploy, Canary/Linear), AWS CDK Constructs & Best Practices.
> **Số câu hỏi:** 44 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A developer uses AWS SAM (`template.yaml`) to deploy a Lambda function with `AutoPublishAlias: live` and `DeploymentPreference.Type: Canary10Percent5Minutes`. The team wants to automatically roll back the deployment if the new Lambda version triggers any `Errors` metric > 0 during the 5-minute canary window, AND run a pre-traffic validation Lambda before shifting the first 10% of traffic. Which properties should be configured under `DeploymentPreference`?

- **A.** Change `DeploymentPreference.Type` to `AllAtOnce` and configure an EventBridge rule to roll back the Lambda alias on error.
- **B.** Set `Role` to an IAM Role with `cloudwatch:PutMetricAlarm` and configure `Trigger` to run validation after traffic shifts.
- **C.** Set `Alarms` to reference the CloudWatch Alarm on the Lambda `Errors` metric, and set `Hooks.PreTraffic` to reference the validation Lambda function.
- **D.** Set `Hooks.PostTraffic` in `DeploymentPreference` to reference the validation Lambda function so it executes before shifting the first 10% of traffic.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer sử dụng AWS SAM (`template.yaml`) để triển khai một hàm Lambda với `AutoPublishAlias: live` và `DeploymentPreference.Type: Canary10Percent5Minutes`. Nhóm muốn tự động rollback quá trình triển khai nếu phiên bản Lambda mới kích hoạt bất kỳ chỉ số `Errors` > 0 nào trong cửa sổ canary 5 phút, VÀ chạy một hàm Lambda xác thực pre-traffic trước khi chuyển 10% lưu lượng đầu tiên. Những thuộc tính nào nên được cấu hình bên dưới `DeploymentPreference`?

**Đáp án đúng:** **C**

**AWS SAM + CodeDeploy Traffic Shifting** cho Lambda:
- `AutoPublishAlias: live`: Tự tạo version mới và cập nhật alias.
- `DeploymentPreference.Type`: `Canary10Percent5Minutes`, `Linear10PercentEvery1Minute`, `AllAtOnce`.
- `Alarms`: CloudWatch Alarms kích hoạt rollback tự động.
- `Hooks.PreTraffic` / `Hooks.PostTraffic`: Hàm Lambda kiểm thử gọi `codedeploy:PutLifecycleEventHookExecutionStatus` (`Succeeded` hoặc `Failed`).

- **A:** Sai vì `AllAtOnce` chuyển 100% traffic ngay lập tức, không còn là Canary deployment.
- **B:** Sai vì thuộc tính `Alarms` mới là nơi khai báo CloudWatch Alarm để CodeDeploy theo dõi rollback, và validation hook dùng `Hooks.PreTraffic`.
- **C (Đúng):** Đúng! Trong AWS SAM `DeploymentPreference` (tích hợp CodeDeploy cho Lambda): `Alarms` chỉ định danh sách CloudWatch Alarms để tự động rollback khi báo động kích hoạt, còn `Hooks.PreTraffic` chạy hàm kiểm thử trước khi chuyển 10% traffic đầu tiên.
- **D:** Sai vì `PostTraffic` chạy *sau* khi 100% traffic đã chuyển sang version mới; muốn chạy trước khi chuyển traffic phải dùng `PreTraffic`.

</details>

### Câu 2 `medium`

A CloudFormation stack provisions an Amazon RDS database and an Amazon S3 bucket. If an operations engineer accidentally deletes the CloudFormation stack, the company requires that the RDS database automatically takes a final snapshot and the S3 bucket is NOT deleted. Which resource attributes should the developer add to the CloudFormation template?

- **A.** Add a `DependsOn` attribute between the S3 bucket and the RDS instance so CloudFormation skips deleting them.
- **B.** Set `DeletionPolicy: Retain` on the RDS `AWS::RDS::DBInstance` resource and `DeletionPolicy: Snapshot` on the S3 `AWS::S3::Bucket` resource.
- **C.** Enable `TerminationProtection: true` directly on the `AWS::S3::Bucket` and `AWS::RDS::DBInstance` resource properties.
- **D.** Set `DeletionPolicy: Snapshot` on the RDS `AWS::RDS::DBInstance` resource and `DeletionPolicy: Retain` on the S3 `AWS::S3::Bucket` resource.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một CloudFormation stack cấp phát một cơ sở dữ liệu Amazon RDS và một Amazon S3 bucket. Nếu một kỹ sư vận hành vô tình xóa CloudFormation stack, công ty yêu cầu cơ sở dữ liệu RDS phải tự động tạo một final snapshot và S3 bucket KHÔNG bị xóa. Developer nên thêm những thuộc tính tài nguyên nào vào CloudFormation template?

**Đáp án đúng:** **D**

**CloudFormation `DeletionPolicy`** có 3 giá trị:
- `Delete` (mặc định): Xóa tài nguyên khi stack bị xóa (với S3 bucket phải rỗng mới xóa được).
- **`Retain`**: Giữ lại tài nguyên (áp dụng cho mọi resource).
- **`Snapshot`**: Tạo snapshot cuối trước khi xóa (chỉ áp dụng cho EBS, RDS, ElastiCache, Redshift, Neptune, EFS...).

- **A:** Sai vì `DependsOn` chỉ quy định thứ tự tạo/xóa tài nguyên, không ngăn tài nguyên bị xóa khi xóa stack.
- **B:** Sai vì S3 bucket không hỗ trợ `DeletionPolicy: Snapshot`, và đề bài yêu cầu RDS tạo final snapshot.
- **C:** Sai vì `TerminationProtection` là thuộc tính ở cấp độ Stack (ngăn không cho xóa stack), không phải thuộc tính bên trong resource S3.
- **D (Đúng):** Đúng! `DeletionPolicy: Snapshot` yêu cầu CloudFormation tạo final snapshot trước khi xóa RDS (hỗ trợ RDS, EBS, ElastiCache, Redshift), còn `DeletionPolicy: Retain` giữ lại nguyên vẹn S3 bucket và dữ liệu bên trong ngay cả khi stack bị xóa.

</details>

### Câu 3 `medium`

A developer writes a single AWS CloudFormation template that will be deployed across multiple AWS Regions (`us-east-1`, `eu-west-1`, `ap-southeast-1`). Each Region requires a different Amazon Linux AMI ID, and a larger EC2 instance type (`m5.large` vs `t3.small`) should only be provisioned when the `Environment` parameter is set to `prod`. Which CloudFormation template sections should be used?

- **A.** Use `Metadata` for the Region-to-AMI lookup and `DependsOn` attributes for selecting the `prod` EC2 instance type.
- **B.** Use `Outputs` with `Export` for the Region-to-AMI lookup and `Transform` macros for selecting the `prod` EC2 instance type.
- **C.** Use `Mappings` (with `Fn::FindInMap`) for the Region-to-AMI lookup, and `Conditions` (with `Fn::Equals` and `Fn::If`) for selecting the `prod` instance type.
- **D.** Hardcode the `us-east-1` AMI ID in `Parameters` and use `Fn::Sub` to dynamically convert it for other AWS Regions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer viết một AWS CloudFormation template duy nhất sẽ được triển khai trên nhiều AWS Region (`us-east-1`, `eu-west-1`, `ap-southeast-1`). Mỗi Region yêu cầu một Amazon Linux AMI ID khác nhau, và một loại EC2 instance lớn hơn (`m5.large` so với `t3.small`) chỉ nên được cấp phát khi tham số `Environment` được đặt thành `prod`. Những phần (section) nào của CloudFormation template nên được sử dụng?

**Đáp án đúng:** **C**

Các phần chính trong **CloudFormation Template**:
- **`Mappings` + `Fn::FindInMap`**: Bảng tra cứu tĩnh (ví dụ Region -> AMI ID).
- **`Parameters` + `Conditions` (`Fn::Equals`, `Fn::If`)**: Rẽ nhánh tài nguyên/thuộc tính theo môi trường (`dev` vs `prod`).
- **`SSM Parameter` (`AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>`)**: Cách hiện đại khác để lấy AMI ID mới nhất tự động.

- **A:** Sai vì `Metadata` chỉ chứa thông tin mô tả bổ sung và `DependsOn` chỉ định thứ tự khởi tạo.
- **B:** Sai vì `Outputs` dùng để xuất giá trị sau khi deploy xong (hoặc Export sang stack khác), còn `Transform` dùng cho Macro/AWS SAM.
- **C (Đúng):** Đúng! `Mappings` + `Fn::FindInMap` là chuẩn để ánh xạ Region (`AWS::Region`) sang AMI ID cố định. `Conditions` + `Fn::If` dùng để rẽ nhánh logic dựa trên giá trị của `Parameters` (như `Environment == prod`).
- **D:** Sai vì AMI ID khác nhau hoàn toàn giữa các Region, không thể dùng `Fn::Sub` để suy ra AMI ID của Region khác.

</details>

### Câu 4 `medium`

A developer is starting a new AWS CDK (Cloud Development Kit) TypeScript project in a fresh AWS account and Region. When running `cdk deploy`, the command fails because the account/Region lacks the required staging S3 bucket and IAM roles used by CDK to store assets. Which command must be run once per account/Region before deploying CDK apps with assets?

- **A.** `cdk bootstrap`
- **B.** `cdk synth`
- **C.** `cdk diff`
- **D.** `cdk init app --language typescript`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer đang bắt đầu một dự án AWS CDK (Cloud Development Kit) TypeScript mới trong một tài khoản AWS và Region mới tinh. Khi chạy `cdk deploy`, lệnh thất bại vì tài khoản/Region thiếu S3 bucket staging và các IAM role bắt buộc được CDK sử dụng để lưu trữ asset. Lệnh nào phải được chạy một lần cho mỗi tài khoản/Region trước khi triển khai các ứng dụng CDK có asset?

**Đáp án đúng:** **A**

Các lệnh cốt lõi của **AWS CDK CLI**:
- `cdk init`: Tạo project mẫu.
- **`cdk bootstrap`**: Chuẩn bị hạ tầng (`CDKToolkit` S3, ECR, IAM roles) trên Account/Region (chỉ chạy 1 lần).
- `cdk synth`: Sinh ra CloudFormation template.
- `cdk diff`: Xem trước thay đổi trước khi deploy.
- `cdk deploy`: Triển khai lên AWS CloudFormation.

- **A (Đúng):** Đúng! `cdk bootstrap` khởi tạo stack `CDKToolkit` chứa S3 bucket (lưu asset/template lớn), ECR repository (lưu Docker image asset) và các IAM Roles cần thiết trong mỗi cặp Account/Region.
- **B:** Sai vì `cdk synth` chỉ biên dịch code TypeScript/Python thành CloudFormation JSON/YAML template cục bộ trong thư mục `cdk.out`.
- **C:** Sai vì `cdk diff` chỉ so sánh sự khác biệt giữa template hiện tại và stack đang chạy trên AWS.
- **D:** Sai vì `cdk init` chỉ tạo khung thư mục dự án trên máy local.

</details>

### Câu 5 `easy`

A developer is building an AWS SAM serverless API locally and wants to start a local HTTP server that simulates Amazon API Gateway endpoints so they can test with `curl` or Postman before deploying to AWS. Which AWS SAM CLI command should the developer run?

- **A.** `sam local start-api`
- **B.** `sam local invoke --event`
- **C.** `sam validate`
- **D.** `sam sync --watch`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer đang xây dựng một API serverless AWS SAM ở máy cục bộ và muốn khởi động một máy chủ HTTP cục bộ mô phỏng các endpoint của Amazon API Gateway để có thể kiểm thử bằng `curl` hoặc Postman trước khi triển khai lên AWS. Developer nên chạy lệnh AWS SAM CLI nào?

**Đáp án đúng:** **A**

Các lệnh **AWS SAM CLI** hay thi:
- `sam local start-api`: Mở HTTP server local test API Gateway + Lambda.
- `sam local invoke`: Chạy test 1 Lambda function với event mẫu (`sam local generate-event`).
- `sam sync --watch`: Đẩy nhanh thay đổi lên cloud (SAM Accelerate) khi dev.

- **A (Đúng):** Đúng! `sam local start-api` khởi chạy một HTTP server cục bộ (mặc định cổng 3000) mô phỏng API Gateway và gọi hàm Lambda chạy trong Docker container khi có HTTP request.
- **B:** Sai vì `sam local invoke` chỉ chạy một hàm Lambda đơn lẻ một lần với file event JSON, không mở HTTP server mô phỏng API Gateway.
- **C:** Sai vì `sam validate` chỉ kiểm tra cú pháp của file `template.yaml`.
- **D:** Sai vì `sam sync --watch` đồng bộ code lên thẳng môi trường AWS trên cloud (SAM Accelerate), không phải chạy API local.

</details>

### Câu 6 `medium`

An AWS CloudFormation template launches an Amazon EC2 instance that runs a 4-minute software installation script via User Data and `cfn-init`. The CloudFormation stack currently reports `CREATE_COMPLETE` as soon as the EC2 instance boots, even before the application is ready. How should the developer ensure CloudFormation waits until the installation script finishes (or fails the stack if it times out)?

- **A.** Add a `CreationPolicy` with `ResourceSignal` (e.g., `Timeout: PT10M`) to the EC2 resource and call `/opt/aws/bin/cfn-signal` at the end of the User Data script.
- **B.** Add `DeletionPolicy: Retain` to the EC2 instance resource so CloudFormation pauses until User Data completes.
- **C.** Use `Fn::Sub` inside the `Outputs` section of the template to wait for the EC2 instance status checks.
- **D.** Add `DependsOn: EC2Instance` to the EC2 instance resource itself so it waits for `cfn-init` to finish.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một AWS CloudFormation template khởi chạy một Amazon EC2 instance chạy một script cài đặt phần mềm kéo dài 4 phút thông qua User Data và `cfn-init`. CloudFormation stack hiện báo cáo `CREATE_COMPLETE` ngay khi EC2 instance vừa khởi động, ngay cả trước khi ứng dụng sẵn sàng. Developer nên đảm bảo CloudFormation chờ cho đến khi script cài đặt hoàn tất (hoặc đánh dấu stack thất bại nếu hết thời gian chờ) bằng cách nào?

**Đáp án đúng:** **A**

Bộ đôi **CloudFormation Helper Scripts**:
- **`cfn-init`**: Đọc `AWS::CloudFormation::Init` metadata để cài gói, tạo file, bật service.
- **`cfn-signal`**: Gửi tín hiệu thành công/thất bại về CloudFormation khi kết hợp với **`CreationPolicy`** (`ResourceSignal`) hoặc `WaitCondition`.
- **`cfn-hup`**: Daemon lắng nghe thay đổi metadata khi update stack.

- **A (Đúng):** Đúng! Kết hợp **`CreationPolicy` (`ResourceSignal`)** trên `AWS::EC2::Instance` (hoặc `AutoScalingGroup`) với lệnh **`cfn-signal -e $?`** ở cuối script sẽ buộc CloudFormation chờ tín hiệu thành công từ instance trước khi chuyển sang `CREATE_COMPLETE`.
- **B:** Sai vì `DeletionPolicy` chỉ quyết định giữ hay xóa tài nguyên khi xóa stack.
- **C:** Sai vì `Fn::Sub` chỉ là hàm thay thế chuỗi, không làm CloudFormation chờ script khởi tạo.
- **D:** Sai vì một tài nguyên không thể `DependsOn` chính nó, và `DependsOn` chỉ chờ tài nguyên được tạo chứ không chờ User Data chạy xong.

</details>

### Câu 7 `medium`

A developer is about to update a production AWS CloudFormation stack that manages an Amazon RDS database. Before applying the updated template, the team wants to preview whether the update will modify the RDS instance in place or trigger a **Replacement** (which would recreate the database and cause downtime). Which CloudFormation feature should the developer use?

- **A.** Run `aws cloudformation validate-template` to detect whether the RDS instance will be replaced.
- **B.** Enable a CloudFormation Stack Policy after running `update-stack` to roll back RDS replacements.
- **C.** Create and inspect a CloudFormation Change Set before executing the stack update.
- **D.** Run `aws cloudformation detect-stack-drift` against the running production RDS stack.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer sắp cập nhật một AWS CloudFormation stack production đang quản lý một cơ sở dữ liệu Amazon RDS. Trước khi áp dụng template đã cập nhật, nhóm muốn xem trước liệu bản cập nhật sẽ sửa đổi RDS instance tại chỗ hay kích hoạt **Replacement** (sẽ tạo lại cơ sở dữ liệu và gây gián đoạn). Developer nên sử dụng tính năng nào của CloudFormation?

**Đáp án đúng:** **C**

**CloudFormation Change Sets**:
- Xem trước tác động của `update-stack` (đặc biệt là cột **Replacement: True**) trước khi thực thi.
- Kết hợp **Stack Policy** để chặn mọi thao tác `Update:Replace` hoặc `Update:Delete` lên tài nguyên quan trọng như RDS Production.

- **A:** Sai vì `validate-template` chỉ kiểm tra cú pháp JSON/YAML hợp lệ, không so sánh với stack đang chạy để biết có Replacement hay không.
- **B:** Sai vì chạy `update-stack` trực tiếp sẽ áp dụng thay đổi ngay lập tức mà không cho xem trước.
- **C (Đúng):** Đúng! **Change Set** cho phép xem trước danh sách các tài nguyên sẽ bị Add, Modify, hoặc **Replacement (`True`/`False`/`Conditional`)** trước khi quyết định Execute thay đổi.
- **D:** Sai vì Drift Detection kiểm tra xem tài nguyên thực tế có bị chỉnh sửa thủ công ngoài CloudFormation hay không, không xem trước tác động của template mới.

</details>

### Câu 8 `easy`

An operations engineer manually modified an EC2 Security Group rule via the AWS Management Console, even though that Security Group is managed by an AWS CloudFormation stack. Which CloudFormation feature allows the team to identify that the live resource configuration no longer matches the stack template?

- **A.** CloudFormation Drift Detection
- **B.** CloudFormation Nested Stacks
- **C.** CloudFormation `Fn::GetAtt`
- **D.** CloudFormation Termination Protection

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư vận hành đã sửa đổi thủ công một quy tắc EC2 Security Group thông qua AWS Management Console, mặc dù Security Group đó được quản lý bởi một AWS CloudFormation stack. Tính năng nào của CloudFormation cho phép nhóm phát hiện rằng cấu hình tài nguyên đang chạy thực tế không còn khớp với stack template?

**Đáp án đúng:** **A**

**CloudFormation Drift Detection**:
- Phát hiện sai lệch (`DRIFTED` vs `IN_SYNC`) khi có người chỉnh sửa tài nguyên trực tiếp trên Console/CLI ngoài CloudFormation.

- **A (Đúng):** Đúng! **Drift Detection** so sánh cấu hình thực tế của các tài nguyên đang chạy với trạng thái được định nghĩa trong CloudFormation template để phát hiện các chỉnh sửa thủ công (out-of-band changes).
- **B:** Sai vì Nested Stacks dùng để tái sử dụng template con trong template cha.
- **C:** Sai vì `Fn::GetAtt` chỉ là hàm nội tại lấy thuộc tính của resource trong template.
- **D:** Sai vì Termination Protection chỉ ngăn không cho xóa nhầm stack.

</details>

### Câu 9 `medium`

A platform team needs to deploy a standardized IAM baseline role and AWS Config rules from a central AWS Organizations management account into 30 member AWS accounts across 4 AWS Regions using a single CloudFormation template. Which CloudFormation feature should be used?

- **A.** AWS CloudFormation StackSets
- **B.** AWS CloudFormation Nested Stacks
- **C.** CloudFormation Cross-Stack References (`Fn::ImportValue`)
- **D.** AWS SAM `sam sync`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm nền tảng cần triển khai một IAM baseline role chuẩn hóa và các quy tắc AWS Config từ tài khoản quản lý AWS Organizations trung tâm vào 30 tài khoản AWS thành viên trên 4 AWS Region bằng một CloudFormation template duy nhất. Tính năng nào của CloudFormation nên được sử dụng?

**Đáp án đúng:** **A**

Phân biệt các mô hình mở rộng **CloudFormation**:
- **StackSets**: Triển khai **Multi-Account + Multi-Region**.
- **Nested Stacks**: Tái sử dụng template con trong cùng Account/Region.
- **Cross-Stack References (`Export` + `Fn::ImportValue`)**: Chia sẻ tài nguyên (như VPC ID) giữa các stack độc lập trong cùng Account/Region.

- **A (Đúng):** Đúng! **CloudFormation StackSets** cho phép tạo, cập nhật hoặc xóa stack đồng loạt trên **nhiều AWS Accounts và nhiều Regions** từ một tài khoản quản trị duy nhất (tích hợp sẵn AWS Organizations).
- **B:** Sai vì Nested Stacks chỉ triển khai trong **cùng 1 AWS Account và cùng 1 Region**.
- **C:** Sai vì `Export`/`Fn::ImportValue` chỉ chia sẻ output giữa các stack trong **cùng 1 Account và cùng 1 Region**.
- **D:** Sai vì `sam sync` chỉ dùng để phát triển nhanh 1 ứng dụng serverless trên 1 account/region.

</details>

### Câu 10 `medium`

A CloudFormation template exceeds the maximum template body size or needs to provision a non-AWS resource (such as registering a DNS record in an external DNS provider or seeding initial items into a newly created DynamoDB table) during stack creation and clean it up during stack deletion. Which CloudFormation feature supports executing custom provisioning logic during stack lifecycle events?

- **A.** Use `Fn::Transform` with the `AWS::Include` macro to run external shell provisioning scripts during CloudFormation stack creation.
- **B.** Use a CloudFormation Custom Resource (`AWS::CloudFormation::CustomResource` or `Custom::*`) backed by an AWS Lambda function.
- **C.** Use the CloudFormation `Mappings` section to execute shell scripts and seed initial DynamoDB items.
- **D.** Use `DependsOn` pointing directly to an external HTTPS webhook URL for custom provisioning logic.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một CloudFormation template vượt quá kích thước phần thân template tối đa hoặc cần cấp phát một tài nguyên không phải của AWS (như đăng ký bản ghi DNS ở nhà cung cấp DNS bên ngoài hoặc khởi tạo dữ liệu ban đầu vào bảng DynamoDB mới tạo) trong quá trình tạo stack và dọn dẹp nó khi xóa stack. Tính năng nào của CloudFormation hỗ trợ thực thi logic cấp phát tùy chỉnh trong các sự kiện vòng đời của stack?

**Đáp án đúng:** **B**

**CloudFormation Custom Resources (`Custom::MyResource`)**:
- Dùng khi CloudFormation chưa hỗ trợ loại tài nguyên đó (hoặc cần seed data, gọi API ngoài, lấy AMI/dữ liệu động).
- Lambda nhận `RequestType` (`Create`, `Update`, `Delete`) và bắt buộc phải PUT kết quả (`SUCCESS`/`FAILED`) lên S3 `ResponseURL` (nếu không CloudFormation sẽ treo chờ tới timeout 1 giờ!).

- **A:** Sai vì `AWS::Include` chỉ chèn đoạn YAML/JSON tĩnh từ S3 vào template, không chạy code tùy chỉnh lúc tạo/xóa stack.
- **B (Đúng):** Đúng! **CloudFormation Custom Resource** gọi một hàm Lambda (hoặc SNS topic) kèm `RequestType` (`Create`, `Update`, `Delete`), cho phép thực thi bất kỳ logic nào (như seed DynamoDB, gọi API bên thứ ba) và gửi kết quả về CloudFormation qua `ResponseURL`.
- **C:** Sai vì `Mappings` chỉ là bảng tra cứu key-value tĩnh.
- **D:** Sai vì `DependsOn` chỉ nhận Logical ID của tài nguyên trong cùng template.

</details>

### Câu 11 `easy`

An AWS SAM `template.yaml` defines 12 `AWS::Serverless::Function` resources that all use the same `Runtime: nodejs20.x`, `Timeout: 15`, and `MemorySize: 512` settings. How can the developer avoid repeating these properties across all 12 function definitions in the SAM template?

- **A.** Define `Runtime`, `Timeout`, and `MemorySize` inside the `Outputs` section of the SAM template.
- **B.** Place `Runtime`, `Timeout`, and `MemorySize` in `samconfig.toml` under `[default.deploy.parameters]`.
- **C.** Use `AWS::Serverless::Application` to inherit `Runtime`, `Timeout`, and `MemorySize` properties automatically.
- **D.** Define `Runtime`, `Timeout`, and `MemorySize` once under the `Globals.Function` section of the SAM template.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tệp `template.yaml` của AWS SAM định nghĩa 12 tài nguyên `AWS::Serverless::Function` đều sử dụng cùng các thiết lập `Runtime: nodejs20.x`, `Timeout: 15` và `MemorySize: 512`. Làm thế nào developer có thể tránh lặp lại các thuộc tính này trên cả 12 định nghĩa hàm trong SAM template?

**Đáp án đúng:** **D**

Cấu trúc **AWS SAM `template.yaml`**:
- `Transform: AWS::Serverless-2016-10-31` (bắt buộc).
- **`Globals`**: Khai báo thuộc tính chung cho `Function`, `Api`, `HttpApi` (hàm nào cần khác đi chỉ việc ghi đè cục bộ).
- Các loại tài nguyên rút gọn: `AWS::Serverless::Function`, `AWS::Serverless::Api`, `AWS::Serverless::SimpleTable`, `AWS::Serverless::LayerVersion`.

- **A:** Sai vì `Outputs` chỉ dùng để xuất giá trị sau khi deploy stack xong.
- **B:** Sai vì `samconfig.toml` lưu tham số CLI cho `sam build`/`sam deploy`, không thay thế thuộc tính tài nguyên trong `template.yaml`.
- **C:** Sai vì `AWS::Serverless::Application` dùng để nhúng một ứng dụng SAM con (nested app) từ SAR hoặc S3.
- **D (Đúng):** Đúng! Phần **`Globals`** trong AWS SAM `template.yaml` cho phép khai báo các thuộc tính mặc định dùng chung cho toàn bộ `Function`, `Api`, `HttpApi`, hoặc `SimpleTable` trong file template.

</details>

### Câu 12 `medium`

A developer uses AWS SAM to build a serverless application with local source code references (`CodeUri: ./src`). Before deploying the SAM template to AWS CloudFormation via a CI/CD script, which command packages the local code, uploads the ZIP artifacts to an Amazon S3 bucket, and outputs a transformed CloudFormation template with S3 URIs?

- **A.** `sam validate --lint` (or `aws cloudformation validate-template`)
- **B.** `sam package` (or `aws cloudformation package`)
- **C.** `sam init --location ./src` (to initialize deployment artifacts)
- **D.** `sam logs --stack-name` (to bundle and upload function logs)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer sử dụng AWS SAM để build một ứng dụng serverless có tham chiếu mã nguồn cục bộ (`CodeUri: ./src`). Trước khi triển khai SAM template lên AWS CloudFormation thông qua một CI/CD script, lệnh nào đóng gói mã nguồn cục bộ, tải các artifact ZIP lên một Amazon S3 bucket và xuất ra một CloudFormation template đã được chuyển đổi với các S3 URI?

**Đáp án đúng:** **B**

Quy trình chuẩn **AWS SAM CLI**:
1. `sam build`: Biên dịch dependencies và chuẩn bị artifact trong `.aws-sam/build`.
2. **`sam package`**: Upload artifact lên S3 và thay thế đường dẫn local thành S3 URI.
3. **`sam deploy`** (hoặc `sam deploy --guided` để lưu cấu hình vào `samconfig.toml`): Đẩy lên CloudFormation.

- **A:** Sai vì `sam validate` chỉ kiểm tra tính hợp lệ của `template.yaml`.
- **B (Đúng):** Đúng! `sam package` (tương đương `aws cloudformation package`) nén code local, tải lên S3 bucket chỉ định (`--s3-bucket`), và sinh ra file template mới đã thay thế `CodeUri` local bằng đường dẫn `s3://...` để `sam deploy` (hoặc `cloudformation deploy`) triển khai.
- **C:** Sai vì `sam init` chỉ tạo project mẫu mới.
- **D:** Sai vì `sam logs` dùng để xem CloudWatch Logs của hàm Lambda đã deploy.

</details>

### Câu 13 `hard`

A company has a central Tools AWS Account (`111111111111`) running AWS CodePipeline and wants to deploy an AWS CloudFormation stack into a separate Production AWS Account (`222222222222`). CodePipeline stores build artifacts in an S3 bucket in the Tools account encrypted with a KMS key. When the cross-account CloudFormation deploy action runs, it fails with `AccessDenied` while reading the artifact from S3. What are the TWO most common missing configurations?

- **A.** The Artifact S3 bucket in the Tools account must disable server-side encryption completely for cross-account AWS CodePipeline deployments.
- **B.** The Production account (`222222222222`) must create a duplicate CodePipeline in `us-east-1` to pull artifacts locally.
- **C.** CodePipeline must authenticate using a long-term IAM User Access Key from the Production account instead of `sts:AssumeRole`.
- **D.** The Artifact bucket uses a CMK whose Key Policy grants `kms:Decrypt` to the Production deploy role, and the bucket policy grants `s3:GetObject` to it.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có một Tools AWS Account trung tâm (`111111111111`) chạy AWS CodePipeline và muốn triển khai một AWS CloudFormation stack sang một Production AWS Account riêng biệt (`222222222222`). CodePipeline lưu trữ các build artifact trong một S3 bucket ở Tools account được mã hóa bằng KMS key. Khi hành động triển khai CloudFormation cross-account chạy, nó thất bại với lỗi `AccessDenied` trong lúc đọc artifact từ S3. HAI cấu hình thiếu phổ biến nhất là gì?

**Đáp án đúng:** **D**

Yêu cầu bắt buộc khi **CodePipeline Cross-Account Deployment**:
1. **Artifact S3 Bucket** phải mã hóa bằng **Customer-Managed KMS Key (CMK)** (không dùng `aws/s3`).
2. **KMS Key Policy** & **S3 Bucket Policy** ở Tools Account phải cho phép Target Account / Cross-Account Role.
3. Action ở Target Account cấu hình `RoleArn` trỏ sang IAM Role ở Target Account (có Trust Policy tin cậy Tools Account).

- **A:** Sai vì CodePipeline hỗ trợ và khuyến nghị mã hóa cross-account bằng Customer-Managed KMS Key (CMK).
- **B:** Sai vì một CodePipeline ở Tools Account hoàn toàn deploy được sang nhiều tài khoản khác nhau bằng `RoleArn` trên action.
- **C:** Sai vì CodePipeline dùng `sts:AssumeRole` vào IAM Role của Production account, không dùng IAM User Access Key.
- **D (Đúng):** Đúng! Deploy cross-account trong CodePipeline **bắt buộc** dùng **Customer-Managed KMS Key (CMK)** cho Artifact S3 Bucket (vì AWS Managed Key `aws/s3` không chia sẻ cross-account được), đồng thời cả S3 Bucket Policy và KMS Key Policy ở Tools Account phải cấp quyền cho IAM Role của Production Account.

</details>

### Câu 14 `medium`

A developer is writing an AWS CDK TypeScript stack that provisions an Amazon S3 bucket for application logs and a DynamoDB table for production user data. By default in AWS CDK, stateful resources like S3 buckets and DynamoDB tables have `RemovalPolicy.RETAIN`. If the developer wants the S3 log bucket in a temporary `dev` stack to be automatically emptied and deleted when running `cdk destroy`, which CDK properties should be set on the Bucket construct?

- **A.** Set `removalPolicy: RemovalPolicy.RETAIN` only on the `s3.Bucket` L2 construct.
- **B.** Set `versioned: true` on the `s3.Bucket` construct to allow deleting non-empty S3 buckets.
- **C.** Set `removalPolicy: RemovalPolicy.DESTROY` and `autoDeleteObjects: true` on `s3.Bucket`.
- **D.** Run `cdk synth --destroy` followed by `cdk bootstrap --force` to purge the S3 bucket.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer đang viết một AWS CDK TypeScript stack cấp phát một Amazon S3 bucket cho log ứng dụng và một bảng DynamoDB cho dữ liệu người dùng production. Theo mặc định trong AWS CDK, các tài nguyên có trạng thái (stateful) như S3 bucket và bảng DynamoDB có `RemovalPolicy.RETAIN`. Nếu developer muốn S3 log bucket trong một `dev` stack tạm thời tự động được làm trống và xóa khi chạy `cdk destroy`, những thuộc tính CDK nào nên được thiết lập trên Bucket construct?

**Đáp án đúng:** **C**

**AWS CDK `RemovalPolicy`**:
- Mặc định cho tài nguyên chứa dữ liệu (S3, DynamoDB, RDS): **`RemovalPolicy.RETAIN`** (an toàn cho Prod).
- Cho môi trường Dev/Test muốn `cdk destroy` xóa sạch S3 Bucket: `removalPolicy: RemovalPolicy.DESTROY` + **`autoDeleteObjects: true`**.

- **A:** Sai vì `RETAIN` giữ lại bucket sau khi chạy `cdk destroy`.
- **B:** Sai vì bật versioning khiến bucket có nhiều phiên bản object và càng khó xóa sạch nếu không có `autoDeleteObjects: true`.
- **C (Đúng):** Đúng! Trong AWS CDK, đặt `removalPolicy: RemovalPolicy.DESTROY` sẽ đổi `DeletionPolicy` thành `Delete`, nhưng S3 bucket có dữ liệu bên trong sẽ không thể xóa nếu không rỗng — vì vậy cần thêm `autoDeleteObjects: true` để CDK tự tạo Custom Resource Lambda dọn sạch bucket trước khi xóa.
- **D:** Sai vì không có cờ `--destroy` cho `cdk synth`, và việc xóa bucket phụ thuộc vào `RemovalPolicy`.

</details>

### Câu 15 `medium`

In AWS CDK, a developer needs to configure a very specific low-level CloudFormation property on an Amazon S3 bucket that is not yet exposed by the high-level `s3.Bucket` L2 construct. How should the developer set this property without rewriting the entire stack in raw YAML?

- **A.** Edit the synthesized CloudFormation JSON template inside `cdk.out/` manually after every `cdk deploy`.
- **B.** Use an Escape Hatch by casting `bucket.node.defaultChild as s3.CfnBucket` (L1) or calling `addPropertyOverride()`.
- **C.** Create a custom L3 Pattern construct from scratch that deploys S3 buckets directly without generating AWS CloudFormation templates.
- **D.** Disable `cdk bootstrap` in the target AWS account and Region so L2 constructs expose all raw properties.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong AWS CDK, một developer cần cấu hình một thuộc tính CloudFormation cấp thấp rất cụ thể trên một Amazon S3 bucket mà chưa được cung cấp bởi L2 construct `s3.Bucket` cấp cao. Developer nên thiết lập thuộc tính này như thế nào mà không cần viết lại toàn bộ stack bằng YAML thô?

**Đáp án đúng:** **B**

3 cấp độ Construct trong **AWS CDK**:
- **L1 (`Cfn*`)**: Ánh xạ 1-1 với CloudFormation resource.
- **L2**: Construct có mặc định hợp lý, helper methods (như `grantReadWrite`). Dùng **Escape Hatch** (`node.defaultChild`) khi cần chạm xuống L1.
- **L3 (Patterns)**: Kết hợp nhiều dịch vụ (như `ApplicationLoadBalancedFargateService`).

- **A:** Sai vì `cdk.out/` bị ghi đè mỗi lần chạy `cdk synth`/`cdk deploy` và sửa sau `cdk deploy` không có tác dụng.
- **B (Đúng):** Đúng! Trong AWS CDK, **Escape Hatches** (`node.defaultChild as Cfn*` hoặc `addPropertyOverride`) cho phép truy cập trực tiếp xuống tầng **L1 Construct (`Cfn*`)** để chỉnh bất kỳ thuộc tính CloudFormation thô nào mà vẫn giữ được lợi ích của L2 Construct.
- **C:** Sai vì mọi CDK construct cuối cùng đều tổng hợp (synthesize) ra CloudFormation.
- **D:** Sai vì `cdk bootstrap` không liên quan đến thuộc tính của L1/L2 constructs.

</details>

### Câu 16 `medium`

A developer is building an AWS Lambda function in Python that reads and writes items in Amazon DynamoDB. Before deploying to the production AWS account, the developer wants to run fast unit tests offline in CI and also run local integration tests against a simulated DynamoDB service on their laptop. Which TWO approaches should the developer use? (Choose two.)

- **A.** Run all unit tests directly against the live production DynamoDB table using `DeleteTable` cleanup between test cases.
- **B.** Use `unittest.mock` / `moto` (or `botocore.stub.Stubber`) in unit tests to mock `boto3` DynamoDB calls offline.
- **C.** Use AWS X-Ray Sampling Rules and trace segments to simulate DynamoDB API responses offline during unit tests.
- **D.** Run DynamoDB Local (Docker) with `sam local invoke` and set `endpoint_url` to the container for integration tests.
- **E.** Use AWS CloudFormation Drift Detection to execute Python unit tests and verify DynamoDB schema changes.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer đang xây dựng một hàm AWS Lambda bằng Python để đọc và ghi các item trong Amazon DynamoDB. Trước khi triển khai lên tài khoản AWS production, developer muốn chạy các unit test nhanh ngoại tuyến trong CI và cũng muốn chạy các integration test cục bộ với một dịch vụ DynamoDB mô phỏng trên máy tính xách tay của mình. Developer nên sử dụng HAI phương pháp nào? (Chọn hai đáp án.)

**Đáp án đúng:** **B, D**

Chiến lược kiểm thử **Serverless trên AWS**:
- **Unit Tests (Offline/Nhanh)**: Mock AWS SDK (`botocore.stub.Stubber`, `moto`, `aws-sdk-client-mock`).
- **Local Integration Tests**: **`sam local invoke`** / **`sam local start-api`** kết hợp **DynamoDB Local** (Docker).
- **Cloud Testing**: Dùng `sam sync` lên sandbox dev account để test IAM permissions và dịch vụ thật.

- **A:** Sai vì chạy test trực tiếp trên bảng Production cực kỳ nguy hiểm và gây tốn kém/rủi ro mất dữ liệu.
- **B (Đúng):** Đúng! Mocking AWS SDK calls (như `Stubber` trong botocore hoặc `moto` / `unittest.mock`) giúp unit test chạy siêu nhanh, hoàn toàn offline trong pipeline CI.
- **C:** Sai vì X-Ray chỉ là công cụ tracing, không mô phỏng cơ sở dữ liệu DynamoDB.
- **D (Đúng):** Đúng! AWS cung cấp **DynamoDB Local** (dạng Docker/JAR) kết hợp với **`sam local invoke`** trên Docker network cục bộ để chạy integration test sát thực tế trước khi đẩy lên cloud.
- **E:** Sai vì Drift Detection chỉ kiểm tra sai lệch hạ tầng CloudFormation.

</details>

### Câu 17 `hard`

A CloudFormation stack update fails midway and enters the `UPDATE_ROLLBACK_FAILED` state because a resource that CloudFormation is trying to roll back was manually deleted out-of-band in the console. Meanwhile, another newly created stack entered `ROLLBACK_COMPLETE` on initial creation. Which TWO statements accurately describe how to recover from these two states? (Choose two.)

- **A.** For `ROLLBACK_COMPLETE`, run `aws cloudformation update-stack` directly with the fixed template and `--capabilities CAPABILITY_IAM`.
- **B.** For `UPDATE_ROLLBACK_FAILED`, run `aws cloudformation continue-update-rollback` (with `--resources-to-skip` if needed) to stabilize.
- **C.** For `UPDATE_ROLLBACK_FAILED`, run `aws cloudformation detect-stack-drift` to automatically recreate the manually deleted resource.
- **D.** For `ROLLBACK_COMPLETE` on initial creation, delete the stack (`delete-stack`) and recreate it after fixing the template.
- **E.** Both states can be resolved by changing `DeletionPolicy` to `Retain` in the template and running `sam package`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lần cập nhật CloudFormation stack thất bại giữa chừng và chuyển sang trạng thái `UPDATE_ROLLBACK_FAILED` vì một tài nguyên mà CloudFormation đang cố gắng rollback đã bị xóa thủ công ngoài luồng (out-of-band) trong console. Trong khi đó, một stack mới tạo khác lại chuyển sang trạng thái `ROLLBACK_COMPLETE` ngay trong lần tạo đầu tiên. HAI phát biểu nào mô tả chính xác cách khôi phục từ hai trạng thái này? (Chọn hai đáp án.)

**Đáp án đúng:** **B, D**

Xử lý 2 trạng thái lỗi kinh điển của **AWS CloudFormation**:
- **`ROLLBACK_COMPLETE`** (tạo stack mới thất bại): Chỉ có thể **`delete-stack`** rồi tạo lại.
- **`UPDATE_ROLLBACK_FAILED`** (update stack cũ thất bại và rollback cũng lỗi): Chạy **`continue-update-rollback`** (dùng `--resources-to-skip` nếu có tài nguyên không rollback được).

- **A:** Sai vì CloudFormation không cho phép chạy `update-stack` trên stack đang ở trạng thái `ROLLBACK_COMPLETE`.
- **B (Đúng):** Đúng! Khi stack bị kẹt ở **`UPDATE_ROLLBACK_FAILED`**, bạn không thể `update-stack` mới được cho tới khi chạy **`continue-update-rollback`** (kèm `--resources-to-skip` cho tài nguyên bị xóa tay) để đưa stack về trạng thái ổn định.
- **C:** Sai vì Drift Detection chỉ phát hiện sai lệch, không tự khôi phục hay mở khóa trạng thái `UPDATE_ROLLBACK_FAILED`.
- **D (Đúng):** Đúng! Một stack tạo mới lần đầu bị lỗi sẽ rơi vào **`ROLLBACK_COMPLETE`** — trạng thái này **không cho phép `update-stack`**, bắt buộc phải xóa stack (`delete-stack`) và tạo lại.
- **E:** Sai vì `sam package` không mở khóa được trạng thái rollback của CloudFormation.

</details>

### Câu 18 `hard`

An API Gateway REST API integrates with a legacy backend that expects XML payloads, while mobile clients send JSON payloads. The developer wants API Gateway to transform the incoming JSON body into XML before forwarding it to the backend—without adding an AWS Lambda function in between. Which API Gateway feature should be used?

- **A.** Enable Lambda Proxy Integration (`AWS_PROXY`) on the REST API method to auto-convert JSON to XML.
- **B.** Configure a Non-Proxy Integration with a VTL Mapping Template in the Integration Request.
- **C.** Switch from REST API to HTTP API because HTTP API specializes in VTL JSON-to-XML transformations.
- **D.** Use an Amazon Cognito User Pool Authorizer to rewrite the incoming request body from JSON to XML.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một API Gateway REST API tích hợp với một backend cũ yêu cầu payload XML, trong khi các mobile client gửi payload JSON. Developer muốn API Gateway chuyển đổi phần thân JSON đầu vào thành XML trước khi chuyển tiếp tới backend—mà không cần thêm hàm AWS Lambda ở giữa. Tính năng nào của API Gateway nên được sử dụng?

**Đáp án đúng:** **B**

**API Gateway Mapping Templates (VTL)**:
- Chỉ có trên **REST API** với **Non-Proxy Integration**.
- Dùng **Integration Request** để biến đổi JSON -> XML (hoặc đổi tên field) trước khi gửi xuống backend, và **Integration Response** để biến đổi XML -> JSON trước khi trả về client.

- **A:** Sai vì Proxy Integration chuyển thẳng nguyên bản request xuống backend mà bỏ qua bước Mapping Template.
- **B (Đúng):** Đúng! Trong **REST API Non-Proxy Integration**, **Mapping Templates (VTL)** ở bước **Integration Request** cho phép chuyển đổi cấu trúc body (ví dụ JSON sang XML bằng `$input.path(...)`) ngay tại tầng API Gateway mà không cần Lambda.
- **C:** Sai vì HTTP API **không hỗ trợ** VTL Mapping Templates (đây là tính năng chỉ có trên REST API).
- **D:** Sai vì Cognito Authorizer chỉ xác thực JWT, không chuyển đổi payload.

</details>

### Câu 19 `medium`

A developer creates a Customer-Managed KMS Key (CMK) using AWS CloudFormation without specifying a custom `KeyPolicy` or inadvertently removes the `"Principal": {"AWS": "arn:aws:iam::111122223333:root"}` statement from the Key Policy. Later, an IAM Administrator with `AdministratorAccess` tries to manage the KMS key and receives `AccessDenied`. Why?

- **A.** Customer-managed AWS KMS keys can only be administered by the AWS Organizations management account.
- **B.** The KMS key must be converted from Symmetric to an Asymmetric RSA key before IAM policies can apply.
- **C.** The IAM Administrator needs `s3:PutBucketPolicy` permission to modify KMS key policies in the console.
- **D.** KMS CMKs do NOT trust IAM policies by default unless the KMS Key Policy explicitly includes `arn:aws:iam::<account-id>:root`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer tạo một Customer-Managed KMS Key (CMK) bằng AWS CloudFormation mà không chỉ định `KeyPolicy` tùy chỉnh hoặc vô tình xóa câu lệnh `"Principal": {"AWS": "arn:aws:iam::111122223333:root"}` khỏi Key Policy. Sau đó, một IAM Administrator có quyền `AdministratorAccess` cố gắng quản lý KMS key và nhận được lỗi `AccessDenied`. Tại sao?

**Đáp án đúng:** **D**

Quy tắc đặc biệt của **AWS KMS Key Policy**:
- Mặc định KMS **không** ủy quyền cho IAM Policies.
- Phải giữ statement `"Principal": { "AWS": "arn:aws:iam::<account-id>:root" }, "Action": "kms:*", "Resource": "*"` trong Key Policy thì các IAM Policies trong tài khoản mới hoạt động trên key đó.

- **A:** Sai vì mỗi tài khoản tự quản lý KMS keys của mình nếu Key Policy cho phép.
- **B:** Sai vì cả Symmetric và Asymmetric KMS keys đều tuân theo quy tắc Key Policy.
- **C:** Sai vì quyền S3 không liên quan đến KMS Key Policy.
- **D (Đúng):** Đúng! Đặc thù bảo mật của **AWS KMS**: IAM Identity Policies chỉ có hiệu lực đối với một CMK **khi và chỉ khi** KMS Key Policy của CMK đó có statement cho phép `arn:aws:iam::<account-id>:root`. Nếu xóa dòng này, ngay cả `AdministratorAccess` cũng không quản trị được key!

</details>

### Câu 20 `medium`

A developer is writing an AWS CloudFormation template that creates a VPC in Stack A (`network-stack`) and wants to reference that VPC's ID in Stack B (`app-stack`) without passing it manually as a parameter each time. How should Stack A and Stack B be connected?

- **A.** Use `Fn::GetAtt` directly in Stack B pointing to the VPC Logical ID defined inside Stack A's template.
- **B.** Use `Fn::FindInMap` inside Stack B to dynamically look up the newly created VPC ID across AWS CloudFormation stacks.
- **C.** In Stack A, define an `Outputs` entry with an `Export.Name` (e.g., `SharedVpcId`); in Stack B, use `Fn::ImportValue: SharedVpcId`.
- **D.** Use `DependsOn: network-stack` inside Stack B's `Resources` section to inherit Stack A's VPC outputs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer đang viết một AWS CloudFormation template tạo một VPC trong Stack A (`network-stack`) và muốn tham chiếu ID của VPC đó trong Stack B (`app-stack`) mà không cần truyền thủ công dưới dạng tham số mỗi lần. Stack A và Stack B nên được kết nối với nhau như thế nào?

**Đáp án đúng:** **C**

**CloudFormation Cross-Stack References**:
- Stack nguồn: `Outputs` -> `Export: { Name: ... }`.
- Stack đích: **`Fn::ImportValue`**.
- Ràng buộc: Phải cùng Account & Region, tên Export là duy nhất trong Region, và CloudFormation chặn xóa/sửa giá trị Export khi vẫn còn stack khác đang import.

- **A:** Sai vì `Fn::GetAtt` và `Ref` chỉ truy cập được tài nguyên trong **cùng một stack**.
- **B:** Sai vì `Mappings` là bảng hằng số tĩnh viết sẵn trước khi deploy, không đọc được ID tài nguyên mới sinh của Stack A.
- **C (Đúng):** Đúng! **CloudFormation Cross-Stack Reference** sử dụng **`Outputs` + `Export`** ở stack cung cấp và **`Fn::ImportValue`** ở stack tiêu thụ. *(Lưu ý: Không thể xóa Stack A nếu Stack B vẫn đang import giá trị đó).* 
- **D:** Sai vì `DependsOn` chỉ nhận Logical ID trong cùng template.

</details>

### Câu 21 `medium`

A company has a monolithic CloudFormation template that has grown to 5,000 lines and repeatedly defines the exact same Application Load Balancer and Target Group setup across multiple environments. The team wants to break the template into modular, reusable sub-templates stored in Amazon S3 and deploy them together from a single root stack. Which CloudFormation pattern should they use?

- **A.** CloudFormation StackSets (`AWS::CloudFormation::StackSet`) for modularizing a single-account architecture
- **B.** CloudFormation Drift Detection (`detect-stack-drift`) for breaking apart large monolithic templates
- **C.** CloudFormation `DeletionPolicy: Snapshot` applied to each modular resource group
- **D.** Nested Stacks using `AWS::CloudFormation::Stack` resources pointing to sub-template S3 URLs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có một CloudFormation template nguyên khối đã phình to lên 5.000 dòng và lặp đi lặp lại chính xác cùng một cấu hình Application Load Balancer và Target Group trên nhiều môi trường. Nhóm muốn tách template thành các template con dạng mô-đun, có thể tái sử dụng được lưu trong Amazon S3 và triển khai chúng cùng nhau từ một root stack duy nhất. Họ nên sử dụng mẫu CloudFormation nào?

**Đáp án đúng:** **D**

**CloudFormation Nested Stacks** (`AWS::CloudFormation::Stack`):
- Dùng để tái sử dụng các mẫu hạ tầng lặp lại và tránh giới hạn kích thước template (51,200 bytes trực tiếp / 1 MB qua S3) & giới hạn 500 resources/stack.

- **A:** Sai vì StackSets dùng để triển khai **cùng 1 template** ra nhiều Accounts/Regions, không phải để chia nhỏ module hóa 1 kiến trúc thành các template con.
- **B:** Sai vì Drift Detection chỉ phát hiện sai lệch cấu hình.
- **C:** Sai vì `DeletionPolicy` chỉ kiểm soát hành vi khi xóa tài nguyên.
- **D (Đúng):** Đúng! **Nested Stacks** (`AWS::CloudFormation::Stack`) cho phép chia nhỏ template khổng lồ thành các template con tái sử dụng được (lưu trên S3) và quản lý vòng đời đồng bộ từ 1 Root Stack duy nhất.

</details>

### Câu 22 `medium`

An AWS CloudFormation template defines an `Environment` parameter (`dev`, `prod`) and an Amazon RDS DBInstance. The team wants the CloudFormation stack to provision a `MultiAZ: true` RDS instance ONLY when `Environment` is `prod`, and a `MultiAZ: false` instance for `dev`. Which CloudFormation intrinsic function and section achieve this?

- **A.** Use `Fn::Join` inside the `Outputs` section to conditionally enable `MultiAZ` on the RDS DB instance.
- **B.** Define `IsProd: !Equals [!Ref Environment, prod]` in `Conditions`, and set `MultiAZ: !If [IsProd, true, false]` on the RDS resource.
- **C.** Use `Fn::Base64` on the `MultiAZ` property of the `AWS::RDS::DBInstance` resource in the template.
- **D.** Set `Condition: IsProd` directly on the `Parameters` section of the CloudFormation template.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một AWS CloudFormation template định nghĩa tham số `Environment` (`dev`, `prod`) và một Amazon RDS DBInstance. Nhóm muốn CloudFormation stack cấp phát một RDS instance `MultiAZ: true` CHỈ khi `Environment` là `prod`, và một instance `MultiAZ: false` cho `dev`. Hàm nội tại (intrinsic function) và phần (section) nào của CloudFormation đạt được điều này?

**Đáp án đúng:** **B**

**CloudFormation `Conditions`**:
- Hỗ trợ các hàm logic: `Fn::Equals`, `Fn::And`, `Fn::Or`, `Fn::Not`, `Fn::If`.
- Dùng `Condition: <Name>` trên Resource/Output để quyết định có tạo tài nguyên đó hay không.

- **A:** Sai vì `Fn::Join` chỉ nối chuỗi trong `Outputs`, không tạo logic điều kiện.
- **B (Đúng):** Đúng! Kết hợp phần **`Conditions`** (`Fn::Equals`) với hàm **`Fn::If`** (`!If [ConditionName, value_if_true, value_if_false]`) là cách chuẩn để bật/tắt thuộc tính hoặc tạo có điều kiện cả một resource trong CloudFormation.
- **C:** Sai vì `Fn::Base64` dùng để mã hóa chuỗi Base64 (thường cho EC2 UserData).
- **D:** Sai vì `Condition` chỉ gắn được vào `Resources` và `Outputs`, không gắn vào `Parameters`.

</details>

### Câu 23 `medium`

A developer uses AWS SAM (`sam sync --watch`) during active development of a Lambda-based REST API in a personal sandbox AWS account. How does `sam sync` (AWS SAM Accelerate) speed up the code-test-debug cycle compared to `sam deploy`?

- **A.** `sam sync --watch` runs all AWS Lambda and Amazon API Gateway services locally inside Docker without connecting to AWS cloud.
- **B.** `sam sync` converts the YAML SAM `template.yaml` into an AWS CDK TypeScript application before deploying.
- **C.** `sam sync --watch` updates Lambda code/layers directly via Lambda APIs, bypassing full CloudFormation updates unless infra changes.
- **D.** `sam sync` triggers a full AWS CodePipeline execution in the developer's AWS account on every file save.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer sử dụng AWS SAM (`sam sync --watch`) trong quá trình phát triển tích cực một REST API dựa trên Lambda trong tài khoản AWS sandbox cá nhân. `sam sync` (AWS SAM Accelerate) tăng tốc chu trình viết mã-kiểm thử-gỡ lỗi như thế nào so với `sam deploy`?

**Đáp án đúng:** **C**

**AWS SAM Accelerate (`sam sync --watch`)**:
- Chỉ dùng cho môi trường **Dev/Sandbox** (đồng bộ code trong vài giây, bỏ qua CloudFormation khi chỉ sửa code).
- Cho **Staging/Production**: Luôn dùng **`sam deploy`** (qua CloudFormation Change Sets).

- **A:** Sai vì chạy local Docker là `sam local`, còn `sam sync` đồng bộ trực tiếp lên môi trường AWS thật trên cloud (chỉ nên dùng cho dev/sandbox, không dùng cho prod!).
- **B:** Sai vì `sam sync` không chuyển đổi code sang CDK.
- **C (Đúng):** Đúng! **AWS SAM Accelerate (`sam sync`)** đẩy nhanh tốc độ dev trên cloud bằng cách gọi thẳng AWS service APIs (`UpdateFunctionCode`...) chỉ trong vài giây thay vì chờ CloudFormation Change Set, và chỉ gọi CloudFormation khi `template.yaml` thay đổi.
- **D:** Sai vì `sam sync` chạy trực tiếp từ máy developer lên tài khoản AWS dev.

</details>

### Câu 24 `medium`

A developer defines an AWS Lambda function in an AWS SAM `template.yaml` and wants to grant it read-only access to an Amazon DynamoDB table (`OrdersTable`) using the simplest, least-privilege SAM syntax without writing verbose raw IAM policy JSON. Which SAM feature provides pre-built least-privilege IAM policy shortcuts?

- **A.** Attach `AdministratorAccess` under `Globals.Function.Policies` to grant full AWS permissions to all SAM functions.
- **B.** Define the inline IAM policy JSON statements inside `samconfig.toml` under `[default.deploy.parameters]`.
- **C.** Use `Events: DynamoDB` on the `AWS::Serverless::Function` to automatically grant read/write access to all tables.
- **D.** Use AWS SAM Policy Templates under `Policies` (e.g., `DynamoDBReadPolicy: { TableName: !Ref OrdersTable }`).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer định nghĩa một hàm AWS Lambda trong tệp `template.yaml` của AWS SAM và muốn cấp cho nó quyền chỉ đọc vào một bảng Amazon DynamoDB (`OrdersTable`) bằng cú pháp SAM đơn giản nhất, tuân thủ đặc quyền tối thiểu mà không cần viết raw IAM policy JSON dài dòng. Tính năng SAM nào cung cấp các phím tắt IAM policy đặc quyền tối thiểu được dựng sẵn?

**Đáp án đúng:** **D**

**AWS SAM Policy Templates**:
- Viết ngắn gọn dưới `Policies:` của `AWS::Serverless::Function` (ví dụ `DynamoDBReadPolicy`, `DynamoDBCrudPolicy`, `S3ReadPolicy`, `SQSPollerPolicy`).
- SAM tự động biên dịch ra IAM Policy tối thiểu khi `sam deploy`.

- **A:** Sai vì `AdministratorAccess` vi phạm nghiêm trọng nguyên tắc Least Privilege.
- **B:** Sai vì `samconfig.toml` không định nghĩa IAM permissions.
- **C:** Sai vì `Events: DynamoDB` chỉ tạo Event Source Mapping từ DynamoDB Streams, không cấp quyền đọc/ghi bảng chính.
- **D (Đúng):** Đúng! **SAM Policy Templates** cung cấp hàng chục mẫu policy ngắn gọn, chuẩn Least Privilege (như `DynamoDBReadPolicy`, `S3CrudPolicy`, `SQSSendMessagePolicy`, `KMSDecryptPolicy`) ngay dưới thuộc tính `Policies:` của `AWS::Serverless::Function`.

</details>

### Câu 25 `medium`

A company has two AWS CodePipeline executions triggered within 10 seconds when a developer pushes two rapid commits to GitHub. In the Deploy stage (which updates a CloudFormation stack), the second pipeline execution fails because the stack is still being updated by the first execution. How should CodePipeline be configured to prevent concurrent executions from colliding in the Deploy stage?

- **A.** Switch the CodePipeline Execution Mode to `PARALLEL` so all concurrent commits deploy simultaneously to AWS CloudFormation.
- **B.** Add a `sleep 600` command at the end of `buildspec.yml` so CodeBuild waits before entering the Deploy stage.
- **C.** Use CodePipeline's default Execution Mode (`SUPERSEDED` or `QUEUED`), allowing only one execution per stage at a time.
- **D.** Disable Amazon EventBridge triggers for CodePipeline and require manual pipeline execution via AWS CLI.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có hai lần thực thi AWS CodePipeline được kích hoạt trong vòng 10 giây khi developer push hai commit liên tiếp nhanh chóng lên GitHub. Ở Deploy stage (cập nhật một CloudFormation stack), lần thực thi pipeline thứ hai thất bại vì stack vẫn đang được cập nhật bởi lần thực thi thứ nhất. CodePipeline nên được cấu hình như thế nào để ngăn các lần thực thi đồng thời va chạm nhau ở Deploy stage?

**Đáp án đúng:** **C**

**CodePipeline Execution Modes**:
- **`SUPERSEDED`** (Mặc định): Mỗi stage chỉ 1 execution; bản mới hơn có thể thay thế bản cũ đang kẹt.
- **`QUEUED`**: Xếp hàng tuần tự FIFO, mọi commit đều được deploy lần lượt.
- **`PARALLEL`**: Chạy song song độc lập (tốn tài nguyên hơn, dễ xung đột tài nguyên dùng chung).

- **A:** Sai vì chế độ `PARALLEL` cho phép nhiều lượt chạy đâm thẳng vào stage Deploy cùng lúc, càng làm CloudFormation bị lỗi `UPDATE_IN_PROGRESS`.
- **B:** Sai vì lãng phí tiền CodeBuild và không đảm bảo đồng bộ.
- **C (Đúng):** Đúng! CodePipeline hỗ trợ 3 chế độ thực thi (Execution Mode): **`SUPERSEDED`** (mặc định: bản mới vượt qua bản cũ nếu bản cũ chưa tới stage đó hoặc chờ stage giải phóng), **`QUEUED`** (xếp hàng tuần tự từng bản), và **`PARALLEL`** (chạy song song — dễ gây đụng độ CloudFormation nếu không tách stack).
- **D:** Sai vì tắt trigger sẽ làm mất tự động hóa CI/CD.

</details>

### Câu 26 `medium`

A developer uses AWS CloudFormation to create an IAM Role (`AppRole`) and an EC2 Instance (`AppServer`) in the same template. Because `AppServer` references `!Ref AppInstanceProfile` (which references `AppRole`), CloudFormation creates them in the right order. However, the developer also has a Lambda function that needs to wait until an unrelated DynamoDB table (`ConfigTable`) is fully created before the Lambda Custom Resource runs. How can an explicit creation dependency be enforced?

- **A.** Add `DependsOn: ConfigTable` on the Lambda Custom Resource.
- **B.** Place `ConfigTable` higher up in the YAML file than the Custom Resource.
- **C.** Add `DeletionPolicy: Retain` on `ConfigTable`.
- **D.** Add `Condition: ConfigTable` on the Custom Resource.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer sử dụng AWS CloudFormation để tạo một IAM Role (`AppRole`) và một EC2 Instance (`AppServer`) trong cùng một template. Vì `AppServer` tham chiếu `!Ref AppInstanceProfile` (tham chiếu `AppRole`), CloudFormation tạo chúng theo đúng thứ tự. Tuy nhiên, developer cũng có một hàm Lambda cần đợi cho đến khi một bảng DynamoDB không liên quan (`ConfigTable`) được tạo hoàn tất trước khi Lambda Custom Resource chạy. Làm thế nào có thể thực thi một phụ thuộc tạo tài nguyên tường minh?

**Đáp án đúng:** **A**

Thứ tự tạo tài nguyên trong **CloudFormation**:
- Mặc định: **Song song**.
- Phụ thuộc ngầm định: Khi dùng `!Ref` hoặc `!GetAtt`.
- Phụ thuộc tường minh: Dùng **`DependsOn`** (nhận 1 Logical ID hoặc danh sách `[ResA, ResB]`).

- **A (Đúng):** Đúng! Thuộc tính **`DependsOn`** ép CloudFormation phải tạo xong `ConfigTable` trước khi bắt đầu tạo tài nguyên có khai báo `DependsOn` (và khi xóa stack sẽ xóa theo thứ tự ngược lại).
- **B:** Sai vì CloudFormation tạo các tài nguyên **song song** bất kể thứ tự dòng trong file YAML/JSON, trừ khi có tham chiếu (`Ref`/`GetAtt`) hoặc `DependsOn`.
- **C:** Sai vì `DeletionPolicy` không quy định thứ tự tạo tài nguyên.
- **D:** Sai vì `Condition` chỉ nhận tên một condition boolean trong phần `Conditions:`.

</details>

### Câu 27 `medium`

A team uses AWS SAM to deploy a Lambda function and wants to bundle an external binary (`ffmpeg`) into a reusable Lambda Layer (`AWS::Serverless::LayerVersion`). Where will the Lambda function find the `ffmpeg` binary at runtime when the Layer is attached?

- **A.** `/var/task/ffmpeg` (inside the function code directory)
- **B.** `/opt/bin/ffmpeg` (matching the directory structure inside the Layer ZIP)
- **C.** `/tmp/layers/ffmpeg` (inside ephemeral `/tmp` storage)
- **D.** `/etc/lambda/ffmpeg` (inside the Lambda runtime system configuration directory)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm sử dụng AWS SAM để triển khai một hàm Lambda và muốn đóng gói một tệp nhị phân bên ngoài (`ffmpeg`) vào một Lambda Layer có thể tái sử dụng (`AWS::Serverless::LayerVersion`). Hàm Lambda sẽ tìm thấy tệp nhị phân `ffmpeg` ở đâu khi chạy (runtime) lúc Layer được gắn vào?

**Đáp án đúng:** **B**

Đường dẫn trong **AWS Lambda Execution Environment**:
- Code chính của Lambda: **`/var/task`** (read-only).
- **Lambda Layers**: **`/opt`** (Python tìm ở `/opt/python`, Node.js tìm ở `/opt/nodejs/node_modules`, binary ở `/opt/bin`).
- Bộ nhớ tạm ghi được: **`/tmp`**.

- **A:** Sai vì `/var/task` là nơi chứa mã nguồn chính của hàm Lambda, không phải Layer.
- **B (Đúng):** Đúng! Mọi AWS Lambda Layer đều được giải nén vào thư mục **`/opt`** trong môi trường thực thi Lambda (và `/opt/bin` được thêm sẵn vào biến `PATH`).
- **C:** Sai vì `/tmp` là bộ nhớ tạm ghi được khi chạy, không phải nơi giải nén Layer.
- **D:** Sai vì Lambda không giải nén Layer vào `/etc/lambda`.

</details>

### Câu 28 `medium`

A developer has built an AWS CloudFormation template that uses `AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>` as a Parameter type with the default value `/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64`. What is the advantage of using this SSM Parameter type instead of hardcoding AMI IDs in `Mappings`?

- **A.** It automatically upgrades running EC2 instances in place every night without requiring a CloudFormation stack update or replacement.
- **B.** It automatically encrypts the Amazon Linux 2023 AMI ID and root EBS volume using an AWS KMS key.
- **C.** It allows deploying EC2 instances in any Region without specifying an instance type, `KeyName`, or VPC subnet.
- **D.** CloudFormation resolves the latest Amazon Linux 2023 AMI ID per Region dynamically, avoiding a static `Mappings` table.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer đã xây dựng một AWS CloudFormation template sử dụng `AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>` làm kiểu Parameter với giá trị mặc định `/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64`. Lợi thế của việc sử dụng kiểu SSM Parameter này thay vì hardcode AMI ID trong `Mappings` là gì?

**Đáp án đúng:** **D**

2 cách lấy **AMI ID theo Region** trong CloudFormation:
1. **`Mappings` + `Fn::FindInMap`**: Phù hợp khi muốn ghim cứng (pin) đúng 1 AMI ID cụ thể.
2. **`AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>`**: Tự động lấy AMI mới nhất từ AWS Public Parameter Store tại mỗi Region.

- **A:** Sai vì CloudFormation chỉ đọc giá trị SSM tại thời điểm tạo/cập nhật stack, không tự động thay thế EC2 đang chạy hằng đêm.
- **B:** Sai vì AMI ID công khai không phải dữ liệu bí mật cần mã hóa.
- **C:** Sai vì kiểu tham số này chỉ dùng để phân giải AMI ID.
- **D (Đúng):** Đúng! Dùng kiểu tham số **`AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>`** trỏ tới Public SSM Parameter của AWS giúp template tự động lấy được **AMI ID mới nhất đúng theo Region** mỗi khi triển khai mà không cần cập nhật bảng `Mappings` thủ công.

</details>

### Câu 29 `medium`

A developer wants to deploy a Lambda function using AWS SAM with a gradual traffic-shifting strategy that shifts **10% of traffic every 1 minute** until 100% of traffic is on the new version (completing in 10 minutes). Which `DeploymentPreference.Type` value in SAM should be used?

- **A.** `Canary10Percent5Minutes`
- **B.** `Linear10PercentEvery1Minute`
- **C.** `AllAtOnce` (instant cutover)
- **D.** `RollingWithAdditionalBatch`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer muốn triển khai một hàm Lambda bằng AWS SAM với chiến lược chuyển dịch lưu lượng dần dần, chuyển **10% lưu lượng mỗi 1 phút** cho đến khi 100% lưu lượng nằm trên phiên bản mới (hoàn tất trong 10 phút). Giá trị `DeploymentPreference.Type` nào trong SAM nên được sử dụng?

**Đáp án đúng:** **B**

3 nhóm chiến lược chuyển traffic của **SAM / CodeDeploy Lambda**:
- **Canary**: `Canary10Percent5Minutes`, `Canary10Percent10Minutes`, `Canary10Percent15Minutes`, `Canary10Percent30Minutes` (thử X% trong Y phút -> nhảy lên 100%).
- **Linear**: `Linear10PercentEvery1Minute`, `Linear10PercentEvery2Minutes`, `Linear10PercentEvery3Minutes`, `Linear10PercentEvery10Minutes` (tăng đều X% mỗi Y phút).
- **AllAtOnce**: Chuyển 100% ngay.

- **A:** Sai vì **Canary** giữ 10% trong 5 phút rồi nhảy vọt một lần lên 100%, không tăng đều 10% mỗi phút.
- **B (Đúng):** Đúng! **`Linear10PercentEvery1Minute`** tăng tuyến tính 10% mỗi phút (10% -> 20% -> ... -> 100% sau 9–10 phút).
- **C:** Sai vì `AllAtOnce` chuyển 100% traffic ngay lập tức.
- **D:** Sai vì `RollingWithAdditionalBatch` là chiến lược của Elastic Beanstalk (EC2), không phải SAM/CodeDeploy Lambda.

</details>

### Câu 30 `medium`

An AWS CloudFormation template creates an Amazon DynamoDB table (`Orders`). During a stack update, a developer accidentally changes the `KeySchema` (Partition Key) of the DynamoDB table in the template. What will CloudFormation do when updating the stack, and how can accidental data loss on the production table be prevented?

- **A.** CloudFormation automatically migrates all 10 million DynamoDB items to the new Partition Key in place with zero downtime.
- **B.** Enable `TerminationProtection` on the CloudFormation stack, which automatically blocks `Update:Replace` on individual resources.
- **C.** Use `sam local invoke` with DynamoDB Local to safely modify the production `KeySchema` without replacement.
- **D.** Changing `KeySchema` triggers Replacement; prevent it with a Stack Policy denying `Update:Replace` / `Update:Delete` (and `DeletionPolicy: Retain`).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một AWS CloudFormation template tạo một bảng Amazon DynamoDB (`Orders`). Trong quá trình cập nhật stack, một developer vô tình thay đổi `KeySchema` (Partition Key) của bảng DynamoDB trong template. CloudFormation sẽ làm gì khi cập nhật stack, và làm thế nào để ngăn ngừa mất mát dữ liệu ngoài ý muốn trên bảng production?

**Đáp án đúng:** **D**

Bảo vệ tài nguyên Stateful (RDS, DynamoDB) trong **CloudFormation**:
- **Stack Policy**: Chặn `Update:Replace` / `Update:Delete` khi update stack.
- **`DeletionPolicy: Retain` / `Snapshot`**: Bảo vệ khi xóa stack hoặc replacement.
- **Termination Protection**: Chặn thao tác `DeleteStack`.

- **A:** Sai vì DynamoDB không hỗ trợ đổi Primary Key tại chỗ; mọi thay đổi `KeySchema` đều là Replacement.
- **B:** Sai vì `TerminationProtection` chỉ chặn lệnh **`DeleteStack`**, không chặn `UpdateStack` gây Replacement tài nguyên.
- **C:** Sai vì `sam local invoke` chỉ chạy test local.
- **D (Đúng):** Đúng! Đổi Partition Key / Sort Key của DynamoDB là thay đổi đòi hỏi **Replacement** (tạo bảng mới, xóa bảng cũ). Dùng **Stack Policy** chặn `Update:Replace` / `Update:Delete` sẽ khiến CloudFormation từ chối thực thi update nguy hiểm đó.

</details>

### Câu 31 `medium`

A team uses AWS CDK in Python to provision an application containing an Amazon S3 bucket and an AWS Lambda function. The developer wants to grant the Lambda function's execution role exact least-privilege read/write permissions to that S3 bucket without writing raw IAM Policy JSON. Which idiomatic AWS CDK L2 Construct method accomplishes this in a single line?

- **A.** `bucket.grant_read_write(lambda_fn)`
- **B.** `cdk.bootstrap(bucket, lambda_fn)`
- **C.** `lambda_fn.add_environment("IAM_ROLE", "AdministratorAccess")`
- **D.** `cdk diff --grant-permissions`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm sử dụng AWS CDK bằng Python để cấp phát một ứng dụng chứa một Amazon S3 bucket và một hàm AWS Lambda. Developer muốn cấp cho execution role của hàm Lambda quyền đọc/ghi chính xác theo nguyên tắc đặc quyền tối thiểu đối với S3 bucket đó mà không cần viết raw IAM Policy JSON. Phương thức L2 Construct chuẩn mực nào của AWS CDK thực hiện điều này chỉ trong một dòng?

**Đáp án đúng:** **A**

**AWS CDK `grant_*` methods**:
- Ví dụ: `bucket.grant_read(fn)`, `table.grant_read_write_data(fn)`, `secret.grant_read(fn)`.
- Tự động tạo Least-Privilege IAM Policy và tự động cấp thêm quyền KMS nếu tài nguyên dùng CMK.

- **A (Đúng):** Đúng! Các L2 Construct trong AWS CDK cung cấp sẵn các phương thức **`grant_*`** (như `bucket.grant_read_write(fn)`, `table.grant_read_data(fn)`, `queue.grant_send_messages(fn)`) tự động sinh IAM Policy tối thiểu (kèm quyền KMS nếu bucket mã hóa CMK!).
- **B:** Sai vì không có hàm `cdk.bootstrap()` trong code stack; `cdk bootstrap` là lệnh CLI.
- **C:** Sai vì biến môi trường không cấp quyền IAM.
- **D:** Sai vì `cdk diff` chỉ xem trước thay đổi.

</details>

### Câu 32 `medium`

A developer wants to deploy an AWS SAM application that includes an Amazon API Gateway REST API with two Lambda functions, and wants to verify the CloudFormation template syntax and SAM transform rules locally before pushing to Git. Which SAM CLI command validates the template?

- **A.** `sam logs --tail --stack-name` (stream CloudWatch Logs)
- **B.** `sam validate` (optionally with `--lint` for cfn-lint rules)
- **C.** `sam local generate-event` (generate sample JSON event payloads)
- **D.** `sam delete --stack-name` (tear down deployed stack)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer muốn triển khai một ứng dụng AWS SAM bao gồm một Amazon API Gateway REST API với hai hàm Lambda, và muốn xác minh cú pháp CloudFormation template cũng như các quy tắc chuyển đổi SAM tại máy cục bộ trước khi push lên Git. Lệnh SAM CLI nào xác thực template này?

**Đáp án đúng:** **B**

**`sam validate --lint`**: Lệnh kiểm tra cú pháp và best practices cho `template.yaml` trước khi build/deploy.

- **A:** Sai vì `sam logs` dùng để xem CloudWatch Logs của hàm Lambda đã deploy.
- **B (Đúng):** Đúng! **`sam validate`** kiểm tra xem `template.yaml` có hợp lệ theo đặc tả AWS SAM / CloudFormation hay không (thêm `--lint` để kiểm tra sâu hơn với `cfn-lint`).
- **C:** Sai vì `sam local generate-event` chỉ sinh JSON event mẫu (S3, SQS, API Gateway) để test.
- **D:** Sai vì `sam delete` dùng để xóa stack đã deploy.

</details>

### Câu 33 `medium`

A company runs a mission-critical serverless API using AWS SAM and AWS CodeDeploy. To minimize the risk of bad deployments in production, the team wants to: (1) shift 10% of traffic for 10 minutes before shifting the remaining 90%, and (2) automatically roll back if the Lambda `Errors` metric exceeds 5 errors in 1 minute. Which TWO configurations must be present in the SAM `template.yaml`? (Choose two.)

- **A.** Set `DeploymentPreference.Type` to `AllAtOnce` so traffic shifts immediately to the new Lambda version.
- **B.** Set `AutoPublishAlias: live` and `DeploymentPreference: { Type: Canary10Percent10Minutes }` on the `AWS::Serverless::Function` resource.
- **C.** Omit `AutoPublishAlias` in the SAM template and point API Gateway directly to the `$LATEST` Lambda qualifier.
- **D.** Define an `AWS::CloudWatch::Alarm` watching `Errors` on the alias and reference it under `DeploymentPreference.Alarms`.
- **E.** Use `DeletionPolicy: Snapshot` on the `AWS::Serverless::Function` resource to enable automatic rollback.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty vận hành một API serverless quan trọng bằng AWS SAM và AWS CodeDeploy. Để giảm thiểu rủi ro từ các lần triển khai lỗi trên production, nhóm muốn: (1) chuyển 10% lưu lượng trong 10 phút trước khi chuyển 90% còn lại, và (2) tự động rollback nếu chỉ số `Errors` của Lambda vượt quá 5 lỗi trong 1 phút. HAI cấu hình nào phải có mặt trong tệp `template.yaml` của SAM? (Chọn hai đáp án.)

**Đáp án đúng:** **B, D**

**SAM Canary Deployment**: Cần đủ 3 thành phần: `AutoPublishAlias` + `DeploymentPreference.Type` (`Canary10Percent10Minutes`) + `DeploymentPreference.Alarms` (CloudWatch Alarm).

- **A:** Sai vì `AllAtOnce` chuyển 100% traffic ngay lập tức, không có giai đoạn 10% trong 10 phút.
- **B (Đúng):** Đúng! `AutoPublishAlias` kích hoạt quản lý version/alias tự động, và `Canary10Percent10Minutes` chuyển 10% traffic trong 10 phút trước khi chuyển 100%.
- **C:** Sai vì `$LATEST` không hỗ trợ traffic shifting (Alias weighted routing) của CodeDeploy.
- **D (Đúng):** Đúng! Khai báo CloudWatch Alarm trong `DeploymentPreference.Alarms` giúp CodeDeploy tự động rollback về version cũ ngay khi alarm chuyển sang trạng thái `ALARM`.
- **E:** Sai vì Lambda function không hỗ trợ `DeletionPolicy: Snapshot`.

</details>

### Câu 34 `medium`

A developer uses AWS CloudFormation to provision an Amazon S3 bucket and wants to pass the generated bucket name to a Lambda function in the same template without hardcoding the bucket name (so CloudFormation can generate a unique name automatically). Which CloudFormation intrinsic function returns the physical bucket name?

- **A.** `!Ref MyS3Bucket`
- **B.** `!FindInMap [MyS3Bucket, Name]`
- **C.** `!ImportValue MyS3Bucket`
- **D.** `!Base64 MyS3Bucket`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer sử dụng AWS CloudFormation để cấp phát một Amazon S3 bucket và muốn truyền tên bucket được tạo ra cho một hàm Lambda trong cùng template mà không cần hardcode tên bucket (để CloudFormation có thể tự động tạo một tên duy nhất). Hàm nội tại (intrinsic function) nào của CloudFormation trả về tên vật lý (physical name) của bucket?

**Đáp án đúng:** **A**

Hàm nội tại **CloudFormation** cơ bản:
- **`!Ref`**: Trả về giá trị Parameter hoặc **Physical ID** (tên bucket, instance ID, queue URL...).
- **`!GetAtt`**: Trả về thuộc tính cụ thể (ARN, Endpoint, DomainName...).
- **`!Sub`**: Chèn biến vào chuỗi (`"arn:aws:s3:::${MyBucket}/*"`).

- **A (Đúng):** Đúng! Trong CloudFormation, `!Ref` trên resource `AWS::S3::Bucket` trả về **physical bucket name** (còn `!GetAtt MyS3Bucket.Arn` trả về ARN, `!GetAtt MyS3Bucket.RegionalDomainName` trả về domain name).
- **B:** Sai vì `Fn::FindInMap` chỉ tra cứu trong bảng hằng số `Mappings`.
- **C:** Sai vì `Fn::ImportValue` dùng để nhập output từ một **stack khác**.
- **D:** Sai vì `Fn::Base64` dùng để mã hóa Base64.

</details>

### Câu 35 `medium`

A developer has a CloudFormation stack that uses `DeletionPolicy: Retain` on an Amazon RDS database. Later, the developer deletes the CloudFormation stack, and the RDS database remains running as expected. What happens if the developer later needs to manage that retained RDS database through CloudFormation again?

- **A.** Run `aws cloudformation update-stack` with the old stack name; CloudFormation automatically re-attaches deleted stacks and resources.
- **B.** Use CloudFormation Resource Import (`ChangeSetType: IMPORT`) to bring the existing RDS instance back under CloudFormation.
- **C.** Run `aws cloudformation detect-stack-drift` on the deleted stack to re-register the retained RDS database.
- **D.** It is impossible in CloudFormation; the retained RDS database must be deleted and recreated from a snapshot.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer có một CloudFormation stack sử dụng `DeletionPolicy: Retain` trên một cơ sở dữ liệu Amazon RDS. Sau đó, developer xóa CloudFormation stack và cơ sở dữ liệu RDS vẫn tiếp tục chạy như mong đợi. Điều gì xảy ra nếu sau này developer cần quản lý lại cơ sở dữ liệu RDS đã giữ lại đó thông qua CloudFormation?

**Đáp án đúng:** **B**

**CloudFormation Resource Import**: Cho phép đưa các tài nguyên sẵn có (được tạo thủ công hoặc từng bị `Retain`) vào một CloudFormation stack (yêu cầu khai báo `DeletionPolicy` trên resource nhập).

- **A:** Sai vì một stack đã xóa (`DELETE_COMPLETE`) không thể `update-stack` lại trực tiếp.
- **B (Đúng):** Đúng! **CloudFormation Resource Import** cho phép nhập các tài nguyên đang tồn tại (như RDS bị retain hoặc tài nguyên tạo tay trước đó) vào quản lý bởi một CloudFormation stack mà không cần tạo lại.
- **C:** Sai vì Drift Detection không đưa tài nguyên vào lại stack.
- **D:** Sai vì CloudFormation hỗ trợ tính năng **Resource Import**.

</details>

### Câu 36 `medium`

A developer uses AWS CDK to manage a multi-stack application (`NetworkStack` and `AppStack`). The developer wants to see the exact CloudFormation resource changes (additions, modifications, or replacements) that `AppStack` will undergo before actually applying them to AWS. Which CDK CLI command should be run?

- **A.** `cdk diff AppStack`
- **B.** `cdk bootstrap AppStack`
- **C.** `cdk doctor`
- **D.** `cdk destroy AppStack`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer sử dụng AWS CDK để quản lý một ứng dụng multi-stack (`NetworkStack` và `AppStack`). Developer muốn xem chính xác các thay đổi tài nguyên CloudFormation (thêm mới, sửa đổi hoặc thay thế) mà `AppStack` sẽ trải qua trước khi thực sự áp dụng chúng lên AWS. Lệnh CDK CLI nào nên được chạy?

**Đáp án đúng:** **A**

**`cdk diff`**: Tương đương bước xem Change Set trước khi chạy `cdk deploy`.

- **A (Đúng):** Đúng! **`cdk diff`** so sánh template mới tổng hợp từ code CDK với stack đang chạy trên AWS CloudFormation và in ra danh sách chi tiết tài nguyên/IAM changes trước khi deploy.
- **B:** Sai vì `cdk bootstrap` chỉ khởi tạo stack `CDKToolkit` ban đầu cho account/region.
- **C:** Sai vì `cdk doctor` chỉ kiểm tra phiên bản CDK CLI và biến môi trường.
- **D:** Sai vì `cdk destroy` xóa stack khỏi AWS.

</details>

### Câu 37 `medium`

A development team uses AWS SAM to build and deploy a serverless application with `sam build` and `sam deploy`. Which TWO statements about AWS SAM are accurate? (Choose two.)

- **A.** AWS SAM templates cannot define standard CloudFormation resources like SQS queues or S3 buckets in the same file.
- **B.** `sam deploy` bypasses AWS CloudFormation completely and cannot create or update IAM execution roles.
- **C.** Every SAM template is a CloudFormation template with `Transform: AWS::Serverless-2016-10-31` and can mix `AWS::Serverless::*` with standard resources.
- **D.** `sam local start-api` requires an active internet connection to invoke Lambda functions remotely on AWS.
- **E.** `sam build --use-container` builds Lambda packages inside a Lambda-like Docker container so native C/C++ dependencies compile for Amazon Linux.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm phát triển sử dụng AWS SAM để build và triển khai một ứng dụng serverless bằng `sam build` và `sam deploy`. HAI phát biểu nào về AWS SAM là chính xác? (Chọn hai đáp án.)

**Đáp án đúng:** **C, E**

Hai điểm cốt lõi của **AWS SAM**:
1. `Transform: AWS::Serverless-2016-10-31` + hỗ trợ trộn lẫn `AWS::Serverless::*` và `AWS::*`.
2. **`sam build --use-container`**: Biên dịch native dependencies đúng chuẩn Amazon Linux của Lambda.

- **A:** Sai vì SAM hỗ trợ đầy đủ mọi resource chuẩn của CloudFormation.
- **B:** Sai vì `sam deploy` thực chất triển khai thông qua **AWS CloudFormation** (và cần `--capabilities CAPABILITY_IAM` để tạo IAM Roles).
- **C (Đúng):** Đúng! AWS SAM là phần mở rộng của CloudFormation với dòng `Transform: AWS::Serverless-2016-10-31`, cho phép viết chung cả tài nguyên `AWS::Serverless::*` và tài nguyên CloudFormation chuẩn (`AWS::DynamoDB::Table`, `AWS::SQS::Queue`...) trong cùng một file.
- **D:** Sai vì `sam local start-api` chạy Lambda cục bộ trong Docker container trên máy dev.
- **E (Đúng):** Đúng! Chạy `sam build --use-container` rất quan trọng khi máy dev chạy Windows/macOS nhưng cần biên dịch thư viện native (C/C++) tương thích với môi trường Linux của AWS Lambda.

</details>

### Câu 38 `medium`

A networking team deploys a shared VPC using an AWS CloudFormation stack named `NetworkStack`. An application team needs to reference the `PrivateSubnet1Id` created by `NetworkStack` inside their own separate `ApplicationStack` located in the same AWS account and Region. How should the two CloudFormation templates be configured?

- **A.** Export `PrivateSubnet1Id` in `NetworkStack`'s `Outputs` with an `Export` name and reference it in `ApplicationStack` using `Fn::ImportValue`.
- **B.** Use the `Fn::GetAtt` intrinsic function directly in `ApplicationStack` to query the `PrivateSubnet1Id` attribute from `NetworkStack` without exporting it.
- **C.** Delete `NetworkStack` after capturing its outputs in an SSM parameter before deploying `ApplicationStack` in the same AWS account and Region.
- **D.** Configure a `CreationPolicy` attribute in `ApplicationStack` to wait for `cfn-signal` and import the VPC subnet IDs from `NetworkStack`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm mạng triển khai một VPC dùng chung bằng một AWS CloudFormation stack có tên `NetworkStack`. Một nhóm ứng dụng cần tham chiếu `PrivateSubnet1Id` được tạo bởi `NetworkStack` bên trong `ApplicationStack` riêng của họ nằm trong cùng tài khoản AWS và Region. Hai CloudFormation template này nên được cấu hình như thế nào?

**Đáp án đúng:** **A**

Ghi nhớ về **Cross-Stack Reference** trong CloudFormation:
- Stack A xuất giá trị qua **`Outputs` + `Export`**.
- Stack B nhập giá trị qua **`Fn::ImportValue` (`!ImportValue`)**.
- *Lưu ý bẫy*: Khi Stack B đang import một giá trị từ Stack A thì bạn **KHÔNG THỂ xóa hoặc sửa giá trị Export đó ở Stack A** cho đến khi gỡ liên kết ở Stack B.

- **A (Đúng):** Đúng! Để chia sẻ giá trị giữa 2 CloudFormation Stacks trong cùng Account và Region, stack nguồn khai báo `Outputs` có trường `Export`, và stack đích dùng hàm nội tại `Fn::ImportValue` (hoặc `!ImportValue`).
- **B:** Sai vì `!GetAtt` và `!Ref` chỉ truy xuất được các tài nguyên nằm bên trong CÙNG một CloudFormation template.
- **C:** Sai vì xóa `NetworkStack` sẽ xóa mất VPC và Subnet mà ứng dụng cần chạy.
- **D:** Sai vì `CreationPolicy` chỉ dùng để đợi tín hiệu khởi tạo hoàn tất (`cfn-signal`) từ EC2 hoặc Auto Scaling Group.

</details>

### Câu 39 `medium`

A team is adopting the AWS Cloud Development Kit (AWS CDK) in TypeScript to provision serverless applications. Before synthesizing and deploying their first CDK stack to a new AWS account and Region, the developer receives an error stating that the environment lacks the required staging S3 bucket and IAM roles used by CDK for asset publishing. Which command must the developer run once per account/Region to provision these prerequisite resources?

- **A.** `cdk destroy`
- **B.** `sam local start-api`
- **C.** `cdk bootstrap`
- **D.** `cdk doctor`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm đang áp dụng AWS Cloud Development Kit (AWS CDK) bằng TypeScript để cấp phát các ứng dụng serverless. Trước khi synthesize và triển khai CDK stack đầu tiên lên một tài khoản AWS và Region mới, developer nhận được thông báo lỗi rằng môi trường thiếu S3 bucket staging và các IAM role bắt buộc được CDK sử dụng để xuất bản tài nguyên (asset publishing). Developer phải chạy lệnh nào một lần cho mỗi tài khoản/Region để cấp phát các tài nguyên tiền điều kiện này?

**Đáp án đúng:** **C**

Bốn lệnh cốt lõi của **AWS CDK CLI**:
- **`cdk init`**: Tạo khung dự án CDK mới.
- **`cdk bootstrap`**: Khởi tạo tài nguyên nền (`CDKToolkit` stack: S3 bucket, ECR, IAM roles) cho mỗi cặp Account/Region.
- **`cdk synth`**: Biên dịch code TypeScript/Python ra CloudFormation template (`cdk.out`).
- **`cdk deploy`**: Triển khai stack lên AWS.

- **A:** Sai vì `cdk destroy` dùng để xóa một CDK stack đang chạy.
- **B:** Sai vì `sam local start-api` chỉ chạy máy chủ giả lập API Gateway ở máy cá nhân.
- **C (Đúng):** Đúng! Lệnh `cdk bootstrap` khởi tạo CloudFormation stack `CDKToolkit` chứa S3 staging bucket, ECR repository và các IAM Roles cần thiết để CDK đẩy assets và triển khai ứng dụng.
- **D:** Sai vì `cdk doctor` chỉ kiểm tra phiên bản môi trường local chứ không tạo tài nguyên trên AWS.

</details>

### Câu 40 `medium`

During iterative development of an AWS SAM serverless application, a developer modifies only the Python code inside an AWS Lambda function without changing any infrastructure configuration in `template.yaml`. Running `sam build && sam deploy` takes over 2 minutes because it performs a full AWS CloudFormation stack update every time. Which AWS SAM CLI command should the developer use to bypass CloudFormation and synchronize code changes directly to the Lambda service in seconds during development?

- **A.** `sam package --output-template-file packaged.yaml`
- **B.** `sam validate --lint --template template.yaml`
- **C.** `aws cloudformation delete-stack --stack-name`
- **D.** `sam sync --watch --code` (SAM Accelerate)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong quá trình phát triển lặp đi lặp lại một ứng dụng serverless AWS SAM, một developer chỉ sửa đổi mã Python bên trong một hàm AWS Lambda mà không thay đổi bất kỳ cấu hình hạ tầng nào trong `template.yaml`. Việc chạy `sam build && sam deploy` mất hơn 2 phút vì mỗi lần đều thực hiện cập nhật toàn bộ AWS CloudFormation stack. Developer nên sử dụng lệnh AWS SAM CLI nào để bỏ qua CloudFormation và đồng bộ hóa các thay đổi mã trực tiếp lên dịch vụ Lambda chỉ trong vài giây trong quá trình phát triển?

**Đáp án đúng:** **D**

Trong đề DVA, khi hỏi cách **tăng tốc độ đồng bộ code Lambda/Step Functions lên môi trường đám mây dev trong vài giây mà bỏ qua CloudFormation** -> Chọn ngay **AWS SAM Accelerate (`sam sync --watch` / `sam sync --code`)**.

- **A:** Sai vì `sam package` chỉ đóng gói và tải artifact lên S3 chứ không triển khai trực tiếp lên Lambda.
- **B:** Sai vì `sam validate` chỉ kiểm tra cú pháp file `template.yaml`.
- **C:** Sai vì lệnh này xóa toàn bộ stack.
- **D (Đúng):** Đúng! Tính năng **SAM Accelerate (`sam sync --watch --code`)** tự động theo dõi thay đổi file và dùng trực tiếp API của Lambda/API Gateway/Step Functions để cập nhật code chỉ trong vài giây mà không cần đợi CloudFormation.

</details>

### Câu 41 `medium`

Before developers submit pull requests, the security team wants them to scan their application source code and AWS CloudFormation templates directly within their IDE to detect security vulnerabilities (such as SQL injection, overly permissive IAM policies, and hardcoded secrets) and apply AI-suggested code fixes. Which AWS tool should the developers use for this task in DVA-C03?

- **A.** Amazon Q Developer security scanning and code review (`/review`) in the IDE.
- **B.** AWS Cost and Usage Report (CUR) exported to Amazon S3 and queried with Amazon Athena.
- **C.** Amazon Cognito Federated Identities mapped to an IAM role with S3 bucket access.
- **D.** AWS Snowball Edge configured with local compute instances for offline file transfers.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trước khi các developer gửi pull request, nhóm bảo mật muốn họ quét mã nguồn ứng dụng và các AWS CloudFormation template trực tiếp trong IDE để phát hiện các lỗ hổng bảo mật (như SQL injection, IAM policy cấp quyền quá rộng và secret bị hardcode) và áp dụng các bản sửa mã do AI gợi ý. Các developer nên sử dụng công cụ AWS nào cho tác vụ này trong DVA-C03?

**Đáp án đúng:** **A**

Tính năng **`/review`** (Code Review & Security Scan) của **Amazon Q Developer** (thay thế cho CodeGuru Reviewer cũ) thực hiện quét tĩnh (SAST), phát hiện lộ secret và quét lỗi cấu hình IaC (CloudFormation, CDK, Terraform) ngay trong IDE kèm đề xuất bản vá lỗi tự động.

- **A (Đúng):** Đúng. Tính năng **`/review`** (Code Review & Security Scan) của **Amazon Q Developer** (thay thế cho CodeGuru Reviewer cũ) thực hiện quét tĩnh (SAST), phát hiện lộ secret và quét lỗi cấu hình IaC (CloudFormation, CDK, Terraform) ngay trong IDE kèm đề xuất bản vá lỗi tự động.
- **B:** Sai. Phương án này không đáp ứng đúng yêu cầu của đề bài.
- **C:** Sai. Phương án này không đáp ứng đúng yêu cầu của đề bài.
- **D:** Sai. Phương án này không đáp ứng đúng yêu cầu của đề bài.

</details>

### Câu 42 `hard`

A company uses **Amazon ECR** to store Docker container images built by its CI/CD pipelines. Because dozens of images are built daily, storage costs for old and untagged images are growing rapidly. Additionally, compliance rules state that once a production image is pushed with a release tag (such as `v1.4.0`), no user or pipeline can overwrite that tag with a different image. Which two Amazon ECR features should the developer configure? *(Choose TWO.)*

- **A.** Enable S3 Object Lock in Compliance mode directly on the Amazon ECR repository settings.
- **B.** Create an AWS Lambda function triggered by EventBridge to delete the entire ECR repository every night.
- **C.** Configure an ECR lifecycle policy to automatically expire untagged images after 7 days and retain only a fixed number of recent tagged images.
- **D.** Enable image tag immutability on the Amazon ECR repository.
- **E.** Store the Docker container images as binary attributes inside an Amazon DynamoDB table with Time to Live (TTL) enabled.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty sử dụng **Amazon ECR** để lưu trữ các Docker container image được xây dựng bởi các CI/CD pipeline của mình. Vì có hàng chục image được build mỗi ngày, chi phí lưu trữ cho các image cũ và chưa gắn thẻ (untagged) đang tăng nhanh chóng. Ngoài ra, quy định tuân thủ nêu rõ rằng một khi production image đã được push với một release tag (như `v1.4.0`), không người dùng hay pipeline nào có thể ghi đè tag đó bằng một image khác. Developer nên cấu hình HAI tính năng nào của Amazon ECR? *(Chọn HAI đáp án.)*

**Đáp án đúng:** **C, D**

- **ECR Lifecycle Policy (A):** Tự động xóa các image `untagged` hoặc các bản build cũ vượt quá số lượng/số ngày quy định để giảm chi phí lưu trữ.
  - **Image Tag Immutability (B):** Ngăn chặn việc push đè một image khác lên một tag đã tồn tại trên ECR.

- **A:** Sai. Phương án này không đáp ứng đúng yêu cầu của đề bài.
- **B:** Sai. Phương án này không đáp ứng đúng yêu cầu của đề bài.
- **C (Đúng):** Đúng. - **ECR Lifecycle Policy (A):** Tự động xóa các image `untagged` hoặc các bản build cũ vượt quá số lượng/số ngày quy định để giảm chi phí lưu trữ.
  - **Image Tag Immutability (B):** Ngăn chặn việc push đè một image khác lên một tag đã tồn tại trên ECR.
- **D (Đúng):** Đúng. - **ECR Lifecycle Policy (A):** Tự động xóa các image `untagged` hoặc các bản build cũ vượt quá số lượng/số ngày quy định để giảm chi phí lưu trữ.
  - **Image Tag Immutability (B):** Ngăn chặn việc push đè một image khác lên một tag đã tồn tại trên ECR.
- **E:** Sai. Phương án này không đáp ứng đúng yêu cầu của đề bài.

</details>

### Câu 43 `medium`

A containerized microservice running on **Amazon ECS with the AWS Fargate launch type** in a private subnet is experiencing intermittent file processing errors. A developer needs to open an interactive shell (`bash`) session directly inside the running container to inspect local temporary files and processes. Security policy prohibits opening inbound SSH port 22 or assigning public IP addresses. How should the developer accomplish this?

- **A.** Copy the running container's local temporary files and memory dump over FTP using AWS Transfer Family to an Amazon S3 bucket.
- **B.** Enable ECS Exec (`--enable-execute-command`) on the service/task and grant `ssmmessages:*` to the ECS task role.
- **C.** Attach `ssmmessages:*` permissions only to the ECS task execution role and open inbound port 22 in the Fargate task security group.
- **D.** Use EC2 Instance Connect with a temporary SSH key to connect directly to the underlying AWS Fargate managed host OS.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một microservice đóng gói container chạy trên **Amazon ECS với launch type AWS Fargate** trong một private subnet đang gặp lỗi xử lý tệp gián đoạn. Một developer cần mở một phiên shell tương tác (`bash`) trực tiếp bên trong container đang chạy để kiểm tra các tệp tạm thời cục bộ và các tiến trình. Chính sách bảo mật cấm mở cổng SSH 22 chiều vào hoặc gán địa chỉ public IP. Developer nên thực hiện điều này như thế nào?

**Đáp án đúng:** **B**

**Amazon ECS Exec** sử dụng AWS Systems Manager Session Manager để mở shell tương tác vào bên trong container đang chạy mà không cần mở cổng 22. **Bẫy thi:** Quyền `ssmmessages:*` (tạo/mở ControlChannel và DataChannel) bắt buộc phải cấp cho **ECS Task Role** (role của bản thân container đang chạy), **không phải** Task Execution Role (B).

- **A:** Sai. Phương án này không đáp ứng đúng yêu cầu của đề bài.
- **B (Đúng):** Đúng. **Amazon ECS Exec** sử dụng AWS Systems Manager Session Manager để mở shell tương tác vào bên trong container đang chạy mà không cần mở cổng 22. **Bẫy thi:** Quyền `ssmmessages:*` (tạo/mở ControlChannel và DataChannel) bắt buộc phải cấp cho **ECS Task Role** (role của bản thân container đang chạy), **không phải** Task Execution Role (B).
- **C:** Sai. Phương án này không đáp ứng đúng yêu cầu của đề bài.
- **D:** Sai. Phương án này không đáp ứng đúng yêu cầu của đề bài.

</details>

### Câu 44 `medium`

A serverless application uses an **AWS Lambda** function to generate an **Amazon S3 presigned URL** using the AWS SDK with an expiration parameter of **7 days (`ExpiresIn=604800`)** and emails the link to customers. However, customers report that the link stops working and returns an `ExpiredToken` (HTTP 403) error after approximately **1 hour**. What is the root cause of this issue, and what is the recommended solution to provide 7-day downloadable links delivered via edge locations?

- **A.** Disable Block Public Access and configure the Amazon S3 bucket policy with `Principal: "*"` so customers can download objects directly without expiration.
- **B.** The Lambda function lacks sufficient CPU and network bandwidth to sign 7-day URLs; increase the Lambda memory allocation to 10,240 MB and redeploy.
- **C.** The URL uses Lambda's ~1-hour STS session; switch to CloudFront signed URLs signed with a CloudFront key group private key.
- **D.** S3 presigned URLs expire after 1 hour on standard endpoints; enable S3 Transfer Acceleration on the bucket to extend the STS token lifetime to 30 days.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng serverless sử dụng một hàm **AWS Lambda** để tạo một **Amazon S3 presigned URL** bằng AWS SDK với tham số hết hạn là **7 ngày (`ExpiresIn=604800`)** và gửi email liên kết đó cho khách hàng. Tuy nhiên, khách hàng báo cáo rằng liên kết ngừng hoạt động và trả về lỗi `ExpiredToken` (HTTP 403) sau khoảng **1 giờ**. Nguyên nhân gốc rễ của sự cố này là gì và giải pháp được khuyến nghị để cung cấp các liên kết tải xuống có hiệu lực 7 ngày được phân phối qua các edge location là gì?

**Đáp án đúng:** **C**

Thời hạn hiệu lực của S3 Presigned URL không bao giờ vượt quá thời hạn sống còn lại của thông tin xác thực đã ký nó. Vì Lambda dùng **IAM Execution Role (STS temporary credentials có hạn ~1 giờ)** nên URL chết ngay khi phiên STS đó hết hạn. Chuyển sang **CloudFront Signed URL** (dùng cặp khóa của CloudFront Key Group) vừa giúp phân phối qua mạng Edge, vừa hoàn toàn giữ được thời hạn 7 ngày (hoặc lâu hơn) khi tạo từ Lambda.

- **A:** Sai. Phương án này không đáp ứng đúng yêu cầu của đề bài.
- **B:** Sai. Phương án này không đáp ứng đúng yêu cầu của đề bài.
- **C (Đúng):** Đúng. Thời hạn hiệu lực của S3 Presigned URL không bao giờ vượt quá thời hạn sống còn lại của thông tin xác thực đã ký nó. Vì Lambda dùng **IAM Execution Role (STS temporary credentials có hạn ~1 giờ)** nên URL chết ngay khi phiên STS đó hết hạn. Chuyển sang **CloudFront Signed URL** (dùng cặp khóa của CloudFront Key Group) vừa giúp phân phối qua mạng Edge, vừa hoàn toàn giữ được thời hạn 7 ngày (hoặc lâu hơn) khi tạo từ Lambda.
- **D:** Sai. Phương án này không đáp ứng đúng yêu cầu của đề bài.

</details>

---

[← Chủ đề 13](13-security-kms-secrets.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chủ đề 15 →](15-cicd-codepipeline.md)
