# Bài tập tình huống — AWS CDK, AWS SAM & Quản lý Cấu hình Tham số

> AWS CDK Constructs (L1/L2/L3), CDK Pipelines, CDK Bootstrap, AWS SAM Serverless CI/CD, Parameter Store và Secrets Manager integration trong IaC.
> **Số câu hỏi:** 3 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A company manages its production Amazon RDS PostgreSQL database and application tier within the same AWS CloudFormation stack. Recently, an engineer accidentally modified the DBInstanceIdentifier property during a routine stack update, causing CloudFormation to replace the database and delete production data. The DevOps lead wants to prevent ANY stack update from replacing or deleting the RDS resource, AND ensure that even if someone deletes the entire stack, the database and its data remain intact. Which TWO actions should the engineer take? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Apply a CloudFormation Stack Policy explicitly denying Update:Replace and Update:Delete on the RDS DBInstance while allowing all other updates.
- **B.** Enable CloudFormation Drift Detection with automated remediation on the stack to block destructive stack update operations.
- **C.** Set DeletionPolicy: Retain and UpdateReplacePolicy: Retain on the AWS::RDS::DBInstance resource in the CloudFormation template.
- **D.** Add a DependsOn attribute to the RDS resource referencing the EC2 Auto Scaling Group so CloudFormation cannot modify the database.
- **E.** Set the CloudFormation stack RollbackConfiguration monitoring time to 180 minutes with a CloudWatch alarm on RDS connections.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty quản lý cơ sở dữ liệu Amazon RDS PostgreSQL production và tầng ứng dụng trong cùng một AWS CloudFormation stack. Gần đây, một kỹ sư vô tình sửa đổi thuộc tính DBInstanceIdentifier trong một lần cập nhật stack định kỳ, khiến CloudFormation thay thế cơ sở dữ liệu và xóa dữ liệu production. Trưởng nhóm DevOps muốn ngăn BẤT KỲ bản cập nhật stack nào thay thế hoặc xóa tài nguyên RDS, VÀ đảm bảo rằng ngay cả khi ai đó xóa toàn bộ stack, cơ sở dữ liệu và dữ liệu của nó vẫn còn nguyên vẹn. Kỹ sư nên thực hiện HAI hành động nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, C**

Cần phân biệt rõ hai cơ chế bảo vệ của CloudFormation: (1) Stack Policy bảo vệ tài nguyên trong lúc UpdateStack (ngăn Update:Replace, Update:Delete), nhưng KHÔNG ngăn DeleteStack; (2) DeletionPolicy: Retain bảo vệ tài nguyên không bị xóa khi toàn bộ stack bị DeleteStack (có thể kết hợp thêm Termination Protection).

- **A (Đúng):** Chính xác! Stack Policy bảo vệ tài nguyên cụ thể khỏi bị thay thế (Update:Replace) hoặc bị xóa (Update:Delete) trong quá trình thực hiện stack update.
- **B:** Sai. Drift Detection chỉ phát hiện sự sai lệch giữa template và tài nguyên thực tế, không có tác dụng chặn stack update hay stack delete.
- **C (Đúng):** Chính xác! Stack Policy không ngăn được hành động DeleteStack toàn bộ stack. Do đó cần thiết lập DeletionPolicy: Retain (và UpdateReplacePolicy: Retain) để đảm bảo RDS vẫn được giữ lại ngay cả khi toàn bộ stack bị xóa.
- **D:** Sai. DependsOn chỉ quy định thứ tự khởi tạo/xóa tài nguyên, không bảo vệ tài nguyên khỏi bị thay thế hay xóa.
- **E:** Sai. RollbackConfiguration dùng để giám sát CloudWatch Alarm sau update, không ngăn chặn việc thay thế RDS ngay trong quá trình update.

</details>

### Câu 2 `medium`

A company standardizes on the AWS Cloud Development Kit (AWS CDK) in TypeScript across multiple engineering squads. The cloud governance team wants to ensure that every AWS CDK application automatically validates during cdk synth that all Amazon DynamoDB tables have Point-in-Time Recovery (PITR) enabled and all Amazon S3 buckets have versioning enabled, failing synthesis with a clear error message if any construct violates these rules. They also want their CDK CI/CD pipeline to automatically update itself whenever a new deployment stage is added in code. Which combination of AWS CDK features should they use?

- **A.** Use CDK Context key-value pairs in cdk.json to enforce PITR and S3 versioning, and deploy generated templates using AWS CodeDeploy.
- **B.** Write an AWS Lambda custom resource inside every CDK stack that validates DynamoDB PITR and S3 versioning properties after deployment.
- **C.** Use cdk diff in a local pre-commit hook and manually edit the AWS CodePipeline JSON definition whenever a new deployment stage is added.
- **D.** Apply CDK Aspects (IAspect) to inspect CfnResource nodes with Annotations.addError() on violations, and deploy via CDK Pipelines.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty chuẩn hóa việc sử dụng AWS Cloud Development Kit (AWS CDK) bằng TypeScript trên nhiều nhóm kỹ thuật. Nhóm quản trị đám mây muốn đảm bảo mọi ứng dụng AWS CDK tự động xác thực trong quá trình chạy cdk synth rằng tất cả các bảng Amazon DynamoDB đều bật Point-in-Time Recovery (PITR) và tất cả các Amazon S3 bucket đều bật versioning, làm quá trình tổng hợp (synthesis) thất bại kèm thông báo lỗi rõ ràng nếu bất kỳ construct nào vi phạm các quy tắc này. Họ cũng muốn CDK CI/CD pipeline của mình tự động cập nhật bất cứ khi nào một giai đoạn triển khai mới được thêm vào trong mã nguồn. Họ nên sử dụng kết hợp các tính năng AWS CDK nào?

**Đáp án đúng:** **D**

AWS CDK Aspects (IAspect) là cơ chế chuẩn để áp dụng kiểm tra tuân thủ hoặc chỉnh sửa đồng loạt mọi construct trong pha synthesize (kết hợp Annotations.addError để fail build). CDK Pipelines hỗ trợ self-mutation giúp pipeline tự cập nhật mỗi khi mã nguồn định nghĩa stage thay đổi.

- **A:** Sai. CDK Context chỉ lưu biến cấu hình key-value, không có cơ chế duyệt cây construct để kiểm tra và chặn synth khi vi phạm.
- **B:** Sai. Custom resource chỉ chạy lúc deploy (CloudFormation runtime), không chặn được ngay tại bước cdk synth và làm phình to template.
- **C:** Sai. cdk diff không kiểm tra quy tắc tuân thủ và sửa pipeline thủ công đi ngược lại yêu cầu tự động hóa (self-mutating).
- **D (Đúng):** Chính xác! AWS CDK Aspects triển khai mẫu Visitor duyệt qua toàn bộ cây construct trong quá trình synth, cho phép kiểm tra thuộc tính hoặc tự động gắn tag/báo lỗi (Annotations.addError làm dừng cdk synth). CDK Pipelines mặc định bật selfMutation để tự cập nhật cấu trúc pipeline khi thêm stage mới.

</details>

### Câu 3 `medium`

An enterprise platform team wants to provide standardized, compliant building blocks (such as a pre-configured multi-AZ VPC with Flow Logs and a KMS-encrypted S3 bucket with access logging) that application teams can instantiate as single logical blocks inside their AWS CloudFormation templates, while still allowing CloudFormation to manage all underlying resources natively. Additionally, the team wants to provision resources from a third-party SaaS monitoring provider directly inside the same CloudFormation templates with full lifecycle CRUD support. Which AWS CloudFormation Registry features should they use?

- **A.** Publish CloudFormation Modules in the Registry for AWS blocks, and register a third-party Resource Type extension for the SaaS provider.
- **B.** Copy and paste standardized YAML snippets into an internal Confluence wiki for developers to reuse, and run curl scripts in EC2 User Data for the SaaS provider.
- **C.** Use AWS CloudFormation StackSets for the third-party SaaS resources and CloudFormation Cross-Stack Exports for the standardized VPC blocks.
- **D.** Use AWS CloudFormation Init (cfn-init) metadata scripts to provision both the standardized VPC networking and the third-party SaaS resources.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm nền tảng doanh nghiệp muốn cung cấp các khối xây dựng chuẩn hóa, tuân thủ (như VPC multi-AZ cấu hình sẵn Flow Logs và S3 bucket mã hóa KMS kèm access logging) mà các nhóm ứng dụng có thể khởi tạo dưới dạng các khối logic đơn lẻ bên trong các AWS CloudFormation template của họ, trong khi vẫn cho phép CloudFormation quản lý toàn bộ tài nguyên bên dưới một cách nguyên bản. Ngoài ra, nhóm muốn khởi tạo tài nguyên từ một nhà cung cấp giám sát SaaS bên thứ ba trực tiếp bên trong cùng các CloudFormation template đó với đầy đủ hỗ trợ vòng đời CRUD. Họ nên sử dụng các tính năng AWS CloudFormation Registry nào?

**Đáp án đúng:** **A**

AWS CloudFormation Registry hỗ trợ mở rộng IaC thông qua Modules (đóng gói cấu trúc tài nguyên AWS chuẩn hóa tái sử dụng), Resource Types (quản lý tài nguyên AWS hoặc bên thứ ba theo đúng vòng đời CRUD) và Hooks (kiểm tra tuân thủ chủ động).

- **A (Đúng):** Chính xác! CloudFormation Modules cho phép đóng gói nhóm tài nguyên AWS chuẩn hóa thành khối tái sử dụng được nhúng trực tiếp vào template, còn CloudFormation Registry Resource Types (public partner hoặc custom private resource type) cung cấp đầy đủ vòng đời CRUD cho tài nguyên bên thứ ba ngay trong CloudFormation.
- **B:** Sai. Copy-paste thủ công không kiểm soát được phiên bản chuẩn hóa, còn chạy curl trong User Data không có vòng đời CRUD/rollback của CloudFormation.
- **C:** Sai. StackSets dùng để triển khai đa tài khoản/Region, không tự tạo được loại tài nguyên bên thứ ba nếu chưa có Resource Type extension.
- **D:** Sai. cfn-init chỉ dùng để cài đặt gói phần mềm và cấu hình bên trong hệ điều hành của EC2 instance.

</details>

---

[Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md)
