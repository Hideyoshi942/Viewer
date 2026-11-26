# Bài tập tình huống — CloudFormation Chuyên sâu: StackSets, Drift & Custom Resources

> StackSets Service-Managed vs Self-Managed, Drift Detection, Nested Stacks, Stack Policy, cfn-init/cfn-signal, Custom Resources Lambda và CloudFormation Guard/Hooks.
> **Số câu hỏi:** 11 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A cloud platform team manages an AWS Organizations structure with 80 member accounts across multiple Organizational Units (OUs). Whenever a new AWS account is added to the Workloads OU, a standardized set of IAM roles, Amazon EventBridge rules, and AWS Config rules must be deployed automatically across three AWS Regions without manually creating IAM execution roles in each member account. When an account is moved out of the Workloads OU, those resources must be automatically deleted. Which solution fulfills these requirements?

- **A.** Create an AWS CloudFormation StackSet with SELF_MANAGED permissions and deploy it using a custom Lambda function triggered by AWS Control Tower lifecycle events.
- **B.** Deploy a single CloudFormation template in the management account that uses nested stacks with cross-account IAM role assumption to provision resources in member accounts.
- **C.** Use AWS Systems Manager State Manager associations to run CloudFormation CLI deployment commands across all member accounts in the Workloads OU.
- **D.** Create a SERVICE_MANAGED CloudFormation StackSet targeting the Workloads OU with AutoDeployment enabled and RetainStacksOnAccountRemoval set to false.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm nền tảng đám mây quản lý cấu trúc AWS Organizations với 80 tài khoản thành viên trên nhiều Organizational Unit (OU). Mỗi khi một tài khoản AWS mới được thêm vào Workloads OU, một bộ chuẩn hóa gồm các IAM role, quy tắc Amazon EventBridge và quy tắc AWS Config phải được tự động triển khai trên ba AWS Region mà không cần tạo thủ công các IAM execution role trong từng tài khoản thành viên. Khi một tài khoản bị chuyển ra khỏi Workloads OU, các tài nguyên đó phải tự động bị xóa. Giải pháp nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **D**

CloudFormation StackSets với chế độ SERVICE_MANAGED là giải pháp chuẩn để triển khai hạ tầng nền tảng đa tài khoản, đa Region theo cấu trúc OU của AWS Organizations, hỗ trợ AutoDeployment và tự động dọn dẹp tài nguyên khi tài khoản rời OU.

- **A:** Sai. SELF_MANAGED yêu cầu phải tự tạo IAM Administration Role và Execution Role ở từng member account, trái với yêu cầu không tạo role thủ công.
- **B:** Sai. Nested stacks chỉ hoạt động trong phạm vi một tài khoản và một Region duy nhất, không hỗ trợ multi-account/multi-region.
- **C:** Sai. State Manager dùng để quản lý cấu hình trên các managed instances (EC2/on-prem), không phải công cụ triển khai CloudFormation theo vòng đời OU của Organizations.
- **D (Đúng):** Chính xác! StackSets với SERVICE_MANAGED tích hợp trực tiếp với AWS Organizations, tự động tạo IAM role cần thiết, tự động deploy vào các account mới gia nhập OU (AutoDeployment) và tự động xóa stack khi account rời khỏi OU (RetainStacksOnAccountRemoval: false).

</details>

### Câu 2 `hard`

A DevOps engineer configures an AWS CloudFormation template that provisions an Auto Scaling Group (ASG) of Amazon EC2 instances in private subnets with a CreationPolicy requiring 3 signals within 15 minutes. The EC2 UserData script installs application packages using cfn-init and then calls cfn-signal to report completion. When the stack is created, all 3 EC2 instances boot and install the application successfully, yet the CloudFormation stack waits for 15 minutes and rolls back with the error 'Failed to receive 3 resource signal(s) within the specified duration'. What is the MOST likely cause?

- **A.** CreationPolicy is only supported on individual AWS::EC2::Instance resources and cannot be attached to an AWS::AutoScaling::AutoScalingGroup resource.
- **B.** The private subnets lack a NAT Gateway or CloudFormation Interface VPC Endpoint, blocking cfn-signal from reaching the CloudFormation API.
- **C.** The cfn-signal helper script requires root AWS account credentials stored in /root/.aws/credentials on every newly launched EC2 instance.
- **D.** The Auto Scaling Group HealthCheckType is configured as EC2 instead of ELB, which disables CloudFormation CreationPolicy resource signaling.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư DevOps cấu hình một AWS CloudFormation template để khởi tạo một Auto Scaling Group (ASG) gồm các Amazon EC2 instance trong các private subnet với CreationPolicy yêu cầu 3 tín hiệu trong vòng 15 phút. Script EC2 UserData cài đặt các gói ứng dụng bằng cfn-init và sau đó gọi cfn-signal để báo cáo hoàn tất. Khi stack được tạo, cả 3 EC2 instance đều khởi động và cài đặt ứng dụng thành công, nhưng CloudFormation stack vẫn chờ đủ 15 phút rồi rollback với lỗi 'Failed to receive 3 resource signal(s) within the specified duration'. Nguyên nhân CÓ KHẢ NĂNG NHẤT là gì?

**Đáp án đúng:** **B**

Khi CloudFormation CreationPolicy bị timeout dù ứng dụng đã cài xong trên EC2 trong private subnet, hai nguyên nhân hàng đầu cần kiểm tra là: (1) kết nối mạng tới CloudFormation endpoint (thiếu NAT Gateway hoặc Interface VPC Endpoint), và (2) thiếu quyền cloudformation:SignalResource trên IAM Instance Profile hoặc truyền sai tên stack/resource vào cfn-signal.

- **A:** Sai. AWS::AutoScaling::AutoScalingGroup hỗ trợ đầy đủ CreationPolicy với ResourceSignal (Count và Timeout).
- **B (Đúng):** Chính xác! cfn-signal phải gửi HTTPS request đến AWS CloudFormation API endpoint. Nếu EC2 nằm trong private subnet không có đường ra NAT Gateway hoặc không có Interface VPC Endpoint cho CloudFormation (com.amazonaws.region.cloudformation), tín hiệu sẽ không bao giờ tới được CloudFormation và stack sẽ timeout rồi rollback.
- **C:** Sai. cfn-signal sử dụng IAM Instance Profile (cần quyền cloudformation:SignalResource) chứ không bao giờ yêu cầu root credentials.
- **D:** Sai. HealthCheckType (EC2 hay ELB) không vô hiệu hóa CreationPolicy hay cfn-signal.

</details>

### Câu 3 `hard`

An operations engineer made an emergency out-of-band change in the AWS Management Console to modify an Amazon S3 bucket lifecycle rule and an Amazon SQS queue visibility timeout that are managed by an AWS CloudFormation stack. The DevOps team needs to detect such out-of-band changes automatically every day across all stacks and bring the CloudFormation stack back into sync with the desired production state without recreating the resources. What should the team do?

- **A.** Enable CloudFormation Auto-Remediation in the AWS Management Console so CloudFormation automatically reverts any manual console changes within 1 minute.
- **B.** Delete the drifted CloudFormation stack and redeploy it from Git to ensure the S3 bucket and SQS queue configurations match the template.
- **C.** Run aws cloudformation validate-template daily via Amazon EventBridge Scheduler to detect out-of-band resource modifications across stacks.
- **D.** Enable the AWS Config cloudformation-stack-drift-detection-check rule, and update the template or run UpdateStack when drift is found.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư vận hành đã thực hiện một thay đổi khẩn cấp ngoài luồng (out-of-band) trong AWS Management Console để sửa đổi một quy tắc vòng đời Amazon S3 bucket và một visibility timeout của Amazon SQS queue vốn đang được quản lý bởi một AWS CloudFormation stack. Nhóm DevOps cần phát hiện các thay đổi ngoài luồng như vậy tự động hàng ngày trên tất cả các stack và đưa CloudFormation stack trở lại đồng bộ với trạng thái production mong muốn mà không tạo lại tài nguyên. Nhóm nên làm gì?

**Đáp án đúng:** **D**

Để tự động hóa CloudFormation Drift Detection ở quy mô lớn, hãy dùng AWS Config rule `cloudformation-stack-drift-detection-check` (hoặc EventBridge + Lambda gọi DetectStackDrift). Khi xử lý drift, ưu tiên cập nhật lại qua UpdateStack (hoặc Resource Import nếu là tài nguyên mới tạo ngoài) thay vì xóa stack.

- **A:** Sai. CloudFormation không có tính năng Auto-Remediation tự động phát hiện và tự sửa ngược các thay đổi thủ công từ console.
- **B:** Sai. Xóa và tạo lại stack sẽ làm mất dữ liệu/queue và vi phạm yêu cầu không tạo lại tài nguyên.
- **C:** Sai. validate-template chỉ kiểm tra cú pháp JSON/YAML của file template, hoàn toàn không so sánh với tài nguyên thực tế đang chạy trên AWS.
- **D (Đúng):** Chính xác! AWS Config có sẵn managed rule cloudformation-stack-drift-detection-check để tự động kiểm tra drift định kỳ trên các CloudFormation stack. Sau khi phát hiện drift, đội ngũ cập nhật template hoặc chạy UpdateStack (đặt lại thuộc tính mong muốn) để đồng bộ lại trạng thái mà không cần xóa/tạo lại tài nguyên.

</details>

### Câu 4 `hard`

A financial services company allows 40 product teams to deploy AWS resources using AWS CloudFormation across multiple accounts. Security policies mandate that every Amazon S3 bucket must have server-side encryption enabled and public access blocked, and every Amazon RDS instance must have deletion protection enabled. Even if a developer bypasses the CI/CD pipeline and runs aws cloudformation create-stack directly in their account, CloudFormation itself must proactively block the non-compliant resource before it is provisioned. Which solution enforces this requirement?

- **A.** Run AWS CloudFormation Guard (cfn-guard) exclusively as a local pre-commit Git hook on developer workstations before code is pushed.
- **B.** Enable AWS Config managed rules with SSM Automation automatic remediation to delete non-compliant S3 buckets immediately after creation.
- **C.** Activate CloudFormation Hooks (Guard Hook or custom Registry Hooks) in FAIL mode across target accounts to validate before create/update.
- **D.** Use AWS CloudFormation Drift Detection scheduled hourly via Amazon EventBridge Scheduler across all member accounts and Regions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty dịch vụ tài chính cho phép 40 nhóm sản phẩm triển khai tài nguyên AWS bằng AWS CloudFormation trên nhiều tài khoản. Chính sách bảo mật bắt buộc mọi Amazon S3 bucket phải bật mã hóa phía máy chủ và chặn truy cập công khai, và mọi Amazon RDS instance phải bật bảo vệ chống xóa (deletion protection). Ngay cả khi nhà phát triển bỏ qua CI/CD pipeline và chạy trực tiếp aws cloudformation create-stack trong tài khoản của họ, bản thân CloudFormation phải chủ động chặn tài nguyên không tuân thủ trước khi nó được khởi tạo. Giải pháp nào thực thi yêu cầu này?

**Đáp án đúng:** **C**

CloudFormation Hooks (kể cả Guard Hook tích hợp) là cơ chế kiểm soát chủ động (proactive control) ở tầng CloudFormation service, chặn tạo/cập nhật tài nguyên vi phạm ngay trước khi provision bất kể người dùng triển khai qua CI/CD hay CLI trực tiếp.

- **A:** Sai. cfn-guard chạy ở máy developer hoặc CI/CD pipeline có thể bị bypass nếu developer gọi trực tiếp CloudFormation API trong AWS account.
- **B:** Sai. AWS Config là kiểm soát phát hiện (detective), chỉ chạy sau khi tài nguyên đã được tạo ra, không đáp ứng yêu cầu chặn trước khi provision (proactively block).
- **C (Đúng):** Chính xác! CloudFormation Hooks thực thi trực tiếp trong quá trình CloudFormation xử lý stack (trước khi tạo/cập nhật tài nguyên). Khi đặt ở chế độ FAIL (bao gồm AWS::Guard::Hook tích hợp sẵn), mọi stack vi phạm chính sách đều bị chặn chủ động ngay cả khi deploy trực tiếp qua Console/CLI bỏ qua CI/CD.
- **D:** Sai. Drift Detection chỉ phát hiện sai lệch giữa template và tài nguyên thực tế sau khi đã triển khai, không kiểm tra tuân thủ bảo mật trước khi tạo.

</details>

### Câu 5 `hard`

A platform engineering team uses AWS CloudFormation StackSets with service-managed permissions to deploy security baselines to 200 AWS accounts across 4 Regions. Currently, rolling out an update takes over 3 hours because StackSets deploys to one Region at a time and stops the entire operation on the first failure. The team wants to speed up rollouts by deploying to all 4 Regions simultaneously, updating up to 25% of accounts concurrently per Region, allowing up to 5 account failures before halting, and allowing non-conflicting StackSet operations to be queued automatically instead of failing with OperationInProgressException. Which StackSet settings should the team configure?

- **A.** Set RegionConcurrencyType=PARALLEL, MaxConcurrentPercentage=25, FailureToleranceCount=5, and ManagedExecution Active=true.
- **B.** Set RegionConcurrencyType to SEQUENTIAL, MaxConcurrentCount to 25, FailureTolerancePercentage to 5, and enable AutoDeployment.
- **C.** Switch from service-managed permissions to self-managed permissions and run parallel aws cloudformation create-stack calls from AWS CodeBuild.
- **D.** Set RegionConcurrencyType to PARALLEL, FailureToleranceCount to 0, and disable RetainStacksOnAccountRemoval across all target OUs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ thuật nền tảng sử dụng AWS CloudFormation StackSets với quyền service-managed để triển khai các đường cơ sở bảo mật tới 200 tài khoản AWS trên 4 Region. Hiện tại, việc triển khai bản cập nhật mất hơn 3 giờ vì StackSets triển khai từng Region một và dừng toàn bộ thao tác ngay ở lỗi đầu tiên. Nhóm muốn tăng tốc độ triển khai bằng cách triển khai đồng thời tới cả 4 Region, cập nhật tối đa 25% số tài khoản cùng lúc trên mỗi Region, cho phép tối đa 5 tài khoản thất bại trước khi dừng và cho phép các thao tác StackSet không xung đột tự động được xếp hàng đợi thay vì thất bại với OperationInProgressException. Nhóm nên cấu hình các thiết lập StackSet nào?

**Đáp án đúng:** **A**

CloudFormation StackSets cung cấp bộ tham số OperationPreferences (RegionConcurrencyType, MaxConcurrentPercentage/Count, FailureToleranceCount/Percentage) và tính năng ManagedExecution để tăng tốc triển khai đa tài khoản, đa Region và tự động xếp hàng các tác vụ đồng thời.

- **A (Đúng):** Chính xác! RegionConcurrencyType=PARALLEL triển khai đồng thời các Region; MaxConcurrentPercentage=25 cập nhật tối đa 25% tài khoản song song; FailureToleranceCount=5 cho phép tối đa 5 lỗi trước khi dừng; và ManagedExecution=Active giúp StackSets tự động xếp hàng các operation không xung đột thay vì báo lỗi OperationInProgressException.
- **B:** Sai. SEQUENTIAL vẫn chạy tuần tự từng Region một; MaxConcurrentCount=25 là số lượng tuyệt đối (không phải 25%); và AutoDeployment chỉ dùng để tự deploy cho tài khoản mới gia nhập OU, không giải quyết lỗi OperationInProgressException.
- **C:** Sai. Tự quản lý IAM role trên 200 account và viết script song song tăng gánh nặng vận hành và mất đi lợi ích tích hợp AWS Organizations của service-managed StackSets.
- **D:** Sai. FailureToleranceCount=0 sẽ dừng toàn bộ operation ngay ở lỗi đầu tiên, trái ngược yêu cầu cho phép tới 5 lỗi.

</details>

### Câu 6 `medium`

A legacy production Amazon DynamoDB table and an Amazon S3 bucket containing terabytes of customer data were originally created manually through the AWS Management Console. The DevOps team must bring both resources under AWS CloudFormation management WITHOUT causing any downtime, data loss, or resource replacement. What is the correct procedure?

- **A.** Create a new CloudFormation stack with the identical S3 bucket name and DynamoDB table name; CloudFormation will automatically adopt existing resources.
- **B.** Run CloudFormation Drift Detection on an empty stack to automatically discover and attach all manually created resources across the AWS account.
- **C.** Define the exact properties with DeletionPolicy: Retain in a template, then run a Resource Import operation (IMPORT Change Set) mapping physical IDs.
- **D.** Create new resources via CloudFormation, migrate terabytes of S3 and DynamoDB data manually, and delete the legacy resources during a maintenance window.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một bảng Amazon DynamoDB production kế thừa và một Amazon S3 bucket chứa hàng terabyte dữ liệu khách hàng ban đầu được tạo thủ công thông qua AWS Management Console. Nhóm DevOps phải đưa cả hai tài nguyên vào sự quản lý của AWS CloudFormation MÀ KHÔNG gây ra bất kỳ thời gian ngừng hoạt động, mất dữ liệu hoặc thay thế tài nguyên nào. Quy trình chính xác là gì?

**Đáp án đúng:** **C**

CloudFormation Resource Import (kết hợp CloudFormation IaC Generator nếu muốn sinh template tự động) cho phép đưa tài nguyên đã tồn tại vào stack an toàn không downtime, với điều kiện bắt buộc đặt DeletionPolicy: Retain trong template.

- **A:** Sai. Tạo stack bình thường với tên trùng sẽ thất bại ngay lập tức với lỗi AlreadyExists.
- **B:** Sai. Drift Detection chỉ so sánh tài nguyên đã thuộc về stack, không có chức năng tự động phát hiện và import tài nguyên tạo ngoài stack.
- **C (Đúng):** Chính xác! CloudFormation Resource Import cho phép nhập tài nguyên hiện có vào quản lý của stack mà không tạo mới hay gây gián đoạn. Bắt buộc phải khai báo DeletionPolicy: Retain trên các tài nguyên được import và truyền vào physical identifier tương ứng khi tạo IMPORT Change Set.
- **D:** Sai. Cách này gây downtime, tốn công di chuyển hàng TB dữ liệu và không cần thiết khi CloudFormation hỗ trợ trực tiếp Resource Import.

</details>

### Câu 7 `medium`

A production AWS CloudFormation stack manages a stateless application tier alongside a stateful Amazon RDS PostgreSQL database. During a recent template refactor, an engineer accidentally changed a property on the RDS resource that required resource replacement, causing CloudFormation to delete and recreate the database. Management wants multiple layers of defense so that future stack updates cannot accidentally replace or delete the RDS database, and if a stack deletion or replacement is ever intentionally authorized, a final database backup is automatically preserved. Which TWO CloudFormation safeguards should the team implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Add explicit DependsOn attributes from all stateless compute resources to the RDS database resource in the CloudFormation template.
- **B.** Attach a CloudFormation Stack Policy denying Update:Replace and Update:Delete on the RDS logical ID while allowing other updates.
- **C.** Configure CloudFormation Rollback Triggers to monitor CPUUtilization and FreeStorageSpace on the Amazon RDS database instance.
- **D.** Enable Stack Termination Protection and set DeletionPolicy and UpdateReplacePolicy to Snapshot on the AWS::RDS::DBInstance.
- **E.** Convert the RDS database resource into a CloudFormation Nested Stack with DisableRollback set to true on stack updates.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một AWS CloudFormation stack production quản lý một tầng ứng dụng phi trạng thái cùng với một cơ sở dữ liệu Amazon RDS PostgreSQL có trạng thái. Trong một lần tái cấu trúc template gần đây, một kỹ sư vô tình thay đổi một thuộc tính trên tài nguyên RDS yêu cầu thay thế tài nguyên, khiến CloudFormation xóa và tạo lại cơ sở dữ liệu. Ban quản lý muốn nhiều lớp phòng vệ để các bản cập nhật stack trong tương lai không thể vô tình thay thế hoặc xóa cơ sở dữ liệu RDS, và nếu việc xóa hoặc thay thế stack được phê duyệt có chủ đích, một bản sao lưu cơ sở dữ liệu cuối cùng tự động được giữ lại. Nhóm nên triển khai HAI biện pháp bảo vệ CloudFormation nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Bảo vệ tài nguyên stateful (RDS, DynamoDB, S3) trong CloudFormation theo chiều sâu gồm: Stack Policy (chặn Update:Replace/Update:Delete), Termination Protection (chặn xóa stack), và DeletionPolicy + UpdateReplacePolicy = Snapshot/Retain.

- **A:** Sai. DependsOn chỉ kiểm soát thứ tự tạo/xóa tài nguyên, hoàn toàn không ngăn chặn việc thay thế hay xóa RDS khi stack update.
- **B (Đúng):** Chính xác! CloudFormation Stack Policy bảo vệ các tài nguyên cụ thể khỏi bị thay thế (Update:Replace) hoặc xóa (Update:Delete) ngoài ý muốn trong quá trình stack update, trong khi vẫn cho phép cập nhật bình thường các tài nguyên khác.
- **C:** Sai. Rollback Triggers chỉ kích hoạt rollback sau khi alarm báo động, không ngăn được việc CloudFormation thực hiện Update:Replace trên DB.
- **D (Đúng):** Chính xác! Termination Protection ngăn việc xóa nhầm toàn bộ stack, còn DeletionPolicy: Snapshot và UpdateReplacePolicy: Snapshot đảm bảo CloudFormation luôn tự động chụp DB snapshot cuối cùng trước khi xóa hoặc thay thế RDS instance.
- **E:** Sai. Chuyển sang Nested Stack với DisableRollback=true không ngăn được việc thay thế hay xóa database.

</details>

### Câu 8 `hard`

A DevOps engineer wrote a Lambda-backed AWS CloudFormation Custom Resource to empty an Amazon S3 bucket during stack deletion. When the engineer runs aws cloudformation delete-stack, the Lambda function completes in 3 seconds according to CloudWatch Logs, yet the CloudFormation stack remains stuck in DELETE_IN_PROGRESS for 1 hour before finally failing with DELETE_FAILED. What is the MOST likely root cause and fix?

- **A.** The AWS Lambda function timeout is configured to 15 minutes instead of the maximum 1-hour execution limit required for CloudFormation Custom Resources.
- **B.** The CloudFormation stack template is missing a CreationPolicy attribute with a 60-minute ResourceSignal timeout on the S3 bucket resource.
- **C.** The Lambda exited without an HTTP PUT to the pre-signed S3 ResponseURL; wrap the handler in try/except and call cfnresponse.send().
- **D.** The Amazon S3 bucket has S3 Versioning disabled, which prevents AWS CloudFormation from deleting the bucket during stack deletion.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư DevOps đã viết một AWS CloudFormation Custom Resource được hỗ trợ bởi Lambda để làm rỗng một Amazon S3 bucket trong quá trình xóa stack. Khi kỹ sư chạy aws cloudformation delete-stack, Lambda function hoàn tất trong 3 giây theo CloudWatch Logs, nhưng CloudFormation stack vẫn bị kẹt ở trạng thái DELETE_IN_PROGRESS trong 1 giờ trước khi cuối cùng thất bại với DELETE_FAILED. Nguyên nhân gốc rễ và cách khắc phục CÓ KHẢ NĂNG NHẤT là gì?

**Đáp án đúng:** **C**

Lỗi kinh điển của CloudFormation Custom Resource (treo 1 giờ ở CREATE/UPDATE/DELETE_IN_PROGRESS) xảy ra khi Lambda không gửi HTTP PUT callback về ResponseURL. Luôn bọc code trong try/finally hoặc try/except và gửi cfnresponse.send() trong mọi nhánh (kể cả khi gặp lỗi).

- **A:** Sai. Lambda đã chạy xong trong 3 giây; thời gian 1 giờ là timeout chờ tín hiệu phản hồi của CloudFormation service, không phải timeout của Lambda.
- **B:** Sai. CreationPolicy áp dụng cho EC2/ASG/WaitCondition khi tạo tài nguyên, không dùng cho Lambda-backed Custom Resource khi xóa.
- **C (Đúng):** Chính xác! CloudFormation Custom Resource hoạt động bất đồng bộ: CloudFormation chờ tối đa 1 giờ để nhận tín hiệu HTTP PUT (SUCCESS hoặc FAILED) gửi về trường ResponseURL trong event payload. Nếu Lambda không gọi cfnresponse.send() (hoặc bị crash trước khi gửi), stack sẽ treo đúng 1 giờ rồi timeout.
- **D:** Sai. Tắt S3 Versioning không khiến CloudFormation Custom Resource bị treo 1 giờ.

</details>

### Câu 9 `hard`

A DevOps engineer manages an Amazon EC2 Auto Scaling group via AWS CloudFormation. When updating the Launch Template with a new application configuration in AWS::CloudFormation::Init (cfn-init), CloudFormation marks the stack update as UPDATE_COMPLETE immediately after EC2 launches the new instances—even when the cfn-init bootstrap script fails and leaves the application broken. How should the engineer modify the CloudFormation template so rolling updates wait for each instance to finish bootstrapping and automatically roll back if bootstrapping fails?

- **A.** Add an explicit DependsOn attribute from the Auto Scaling group resource to the EC2 Launch Template resource in the template.
- **B.** Replace cfn-init with cfn-get-metadata in EC2 User Data and remove all UpdatePolicy and CreationPolicy blocks from the Auto Scaling group.
- **C.** Add UpdatePolicy (WaitOnResourceSignals=true, PauseTime), CreationPolicy, and call cfn-signal -e $? in User Data after cfn-init.
- **D.** Set MinInstancesInService to 0 in the AutoScalingRollingUpdate UpdatePolicy and disable all Elastic Load Balancing health checks.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư DevOps quản lý một Amazon EC2 Auto Scaling group thông qua AWS CloudFormation. Khi cập nhật Launch Template với cấu hình ứng dụng mới trong AWS::CloudFormation::Init (cfn-init), CloudFormation đánh dấu bản cập nhật stack là UPDATE_COMPLETE ngay sau khi EC2 khởi chạy các instance mới—ngay cả khi script khởi tạo cfn-init bị lỗi và khiến ứng dụng bị hỏng. Kỹ sư nên sửa đổi CloudFormation template như thế nào để các bản cập nhật cuốn chiếu chờ mỗi instance hoàn tất quá trình khởi tạo và tự động rollback nếu quá trình khởi tạo thất bại?

**Đáp án đúng:** **C**

Bộ công cụ cfn-init + cfn-signal kết hợp với CreationPolicy (ResourceSignal) và UpdatePolicy (AutoScalingRollingUpdate với WaitOnResourceSignals: true, PauseTime) đảm bảo CloudFormation chỉ xác nhận thành công khi quá trình bootstrap bên trong EC2 thực sự hoàn tất không lỗi.

- **A:** Sai. DependsOn không giúp CloudFormation chờ kết quả chạy script bên trong hệ điều hành EC2.
- **B:** Sai. cfn-get-metadata chỉ in ra metadata JSON, không thực thi cài đặt và không báo tín hiệu thành công/thất bại về CloudFormation.
- **C (Đúng):** Chính xác! Cấu hình UpdatePolicy (AutoScalingRollingUpdate với WaitOnResourceSignals: true và PauseTime) kết hợp CreationPolicy (ResourceSignal) buộc CloudFormation phải chờ tín hiệu thành công từ lệnh cfn-signal -e $? sau khi cfn-init chạy xong trên từng instance. Nếu cfn-init lỗi hoặc quá thời gian PauseTime không nhận được tín hiệu, CloudFormation sẽ tự động rollback.
- **D:** Sai. MinInstancesInService=0 thậm chí còn gây downtime toàn bộ trong lúc cập nhật và không kiểm tra kết quả bootstrap.

</details>

### Câu 10 `hard`

An enterprise manages 150 AWS accounts organized into Organizational Units (OUs) under AWS Organizations. A DevOps team must deploy a standardized IAM audit role and CloudWatch alarm stack to all existing accounts in the Production OU and ensure that any new account added to the Production OU automatically receives the stack across three AWS Regions as quickly as possible. What should the team configure?

- **A.** Create a Service-Managed CloudFormation StackSet targeting the Production OU with Automatic Deployment and PARALLEL RegionConcurrencyType.
- **B.** Create a Self-Managed CloudFormation StackSet, manually deploy execution roles to all 150 accounts, and run a daily Lambda script for new accounts.
- **C.** Use CloudFormation Nested Stacks in the Management account that assume cross-account IAM roles into each member account sequentially.
- **D.** Deploy a separate AWS CodePipeline in each of the 150 member accounts triggered by Amazon S3 Event Notifications from a shared bucket.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp quản lý 150 tài khoản AWS được tổ chức thành các Organizational Unit (OU) trong AWS Organizations. Nhóm DevOps phải triển khai một stack chuẩn hóa gồm IAM audit role và CloudWatch alarm tới tất cả tài khoản hiện có trong Production OU và đảm bảo mọi tài khoản mới được thêm vào Production OU tự động nhận stack này trên ba AWS Region nhanh nhất có thể. Nhóm nên cấu hình gì?

**Đáp án đúng:** **A**

CloudFormation StackSets với Service-Managed permissions + Automatic Deployment + RegionConcurrencyType: PARALLEL là kiến trúc chuẩn cho triển khai IaC quy mô AWS Organizations đa tài khoản, đa vùng.

- **A (Đúng):** Chính xác! Service-Managed StackSets tích hợp trực tiếp với AWS Organizations OU, hỗ trợ Auto-deployment khi có account mới join OU, và đặt RegionConcurrencyType là PARALLEL giúp triển khai đồng thời trên cả 3 Region nhanh nhất.
- **B:** Sai. Self-Managed không hỗ trợ Auto-deployment theo OU và tốn công quản lý IAM roles thủ công trên 150 tài khoản.
- **C:** Sai. Nested Stacks chỉ hoạt động trong cùng một tài khoản và cùng một Region, không triển khai cross-account/cross-region.
- **D:** Sai. Tạo 150 CodePipeline riêng lẻ gây dư thừa, khó quản trị tập trung và không tự động áp dụng cho account mới.

</details>

### Câu 11 `hard`

A CloudFormation template launches an EC2 instance that installs and starts a custom web service via User Data. Currently, CloudFormation marks the stack as CREATE_COMPLETE even when the User Data installation script fails, causing downstream automation to break. Which TWO additions to the CloudFormation template will ensure the stack waits for successful software configuration and rolls back on failure? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Add a DependsOn attribute pointing to the EC2 instance's Security Group and IAM Instance Profile resources.
- **B.** Add a CreationPolicy attribute with ResourceSignal (Count and Timeout) to the AWS::EC2::Instance resource.
- **C.** Set DeletionPolicy to Retain and UpdateReplacePolicy to Snapshot on the AWS::EC2::Instance resource.
- **D.** Invoke /opt/aws/bin/cfn-signal with the exit status ($?) of the script at the end of the EC2 User Data.
- **E.** Enable Termination Protection and stack policy restrictions on the parent CloudFormation stack resource.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một CloudFormation template khởi chạy một EC2 instance để cài đặt và khởi động một web service tùy chỉnh thông qua User Data. Hiện tại, CloudFormation đánh dấu stack là CREATE_COMPLETE ngay cả khi script cài đặt trong User Data bị lỗi, khiến các quy trình tự động hóa phía sau bị hỏng. HAI bổ sung nào vào CloudFormation template sẽ đảm bảo stack chờ cấu hình phần mềm thành công và rollback khi thất bại? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Để CloudFormation đồng bộ hóa với quá trình bootstrapping bên trong EC2, cần kết hợp CreationPolicy (ResourceSignal) trên tài nguyên EC2/ASG và gọi cfn-signal -e $? sau cfn-init hoặc lệnh cài đặt trong User Data.

- **A:** Sai. DependsOn chỉ kiểm soát thứ tự tạo tài nguyên giữa các resource trong CloudFormation, không kiểm tra kết quả thực thi User Data bên trong OS.
- **B (Đúng):** Chính xác! CreationPolicy với ResourceSignal buộc CloudFormation tạm dừng trạng thái CREATE_IN_PROGRESS và chờ tín hiệu thành công trong khoảng thời gian Timeout trước khi đánh dấu CREATE_COMPLETE.
- **C:** Sai. DeletionPolicy: Retain chỉ giữ lại instance khi xóa stack, không liên quan tới việc xác nhận cấu hình thành công lúc khởi tạo.
- **D (Đúng):** Chính xác! cfn-signal gửi mã thoát ($?) về CloudFormation; nếu exit code khác 0, CloudFormation sẽ nhận tín hiệu thất bại ngay lập tức và tiến hành rollback stack.
- **E:** Sai. Termination Protection chỉ ngăn người dùng xóa nhầm stack, không giải quyết vấn đề kiểm tra trạng thái cài đặt User Data.

</details>

---

[Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md)
