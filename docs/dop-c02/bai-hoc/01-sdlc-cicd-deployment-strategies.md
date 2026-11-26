# Tự động hóa SDLC & Chiến lược CI/CD Đa tài khoản trên AWS

Domain 1 (**SDLC Automation**) chiếm tỷ trọng lớn nhất (**22%**) trong đề thi DOP-C02. Đề thi kiểm tra sâu khả năng thiết kế pipeline CI/CD an toàn, đa tài khoản (cross-account), triển khai không gián đoạn (zero-downtime) cho EC2, ECS, EKS và Lambda, cũng như quản lý artifact và feature flags.

## 1. Kiến trúc Cross-Account CI/CD với CodePipeline & KMS

Trong doanh nghiệp, pipeline thường đặt tại **Tools/Shared Services Account** và triển khai sang **Dev / Staging / Prod Accounts**.

Các thành phần bắt buộc để Cross-Account CodePipeline hoạt động:
1. **Customer Managed KMS Key (CMK)** trong Tools Account:
   - Không thể dùng AWS Managed Key (`aws/s3`) vì không chỉnh sửa được Key Policy để chia sẻ cross-account.
   - Key Policy phải cấp quyền `kms:Decrypt`, `kms:DescribeKey`, `kms:Encrypt`, `kms:ReEncrypt*`, `kms:GenerateDataKey*` cho IAM Role ở Target Account.
2. **Artifact S3 Bucket** trong Tools Account:
   - Bucket Policy cấp quyền `s3:GetObject*`, `s3:PutObject`, `s3:ListBucket` cho Target Account Role.
3. **IAM Roles**:
   - **CodePipeline Service Role** (Tools Account) có quyền `sts:AssumeRole` sang **Cross-Account Deploy Role** ở Target Account.
   - **Cross-Account Deploy Role** (Target Account) có Trust Policy tin tưởng Tools Account và quyền triển khai tài nguyên (CloudFormation, CodeDeploy, ECS...) kèm quyền đọc Artifact Bucket và giải mã CMK.

> **Exam Tip**: Nếu câu hỏi mô tả Cross-Account CodePipeline báo lỗi `AccessDenied` khi đọc artifact từ S3 dù Bucket Policy và IAM Role đã đúng, nguyên nhân 99% là Artifact Bucket đang mã hóa bằng **AWS Managed Key (`aws/s3`)** thay vì **Customer Managed KMS Key** có chia sẻ Key Policy.

## 2. Tối ưu hóa CodeBuild & Quản lý Dependency với CodeArtifact

### Tối ưu thời gian build với `buildspec.yml`
- **Caching**: Dùng **Local Cache** (`LOCAL_DOCKER_LAYER_CACHE`, `LOCAL_SOURCE_CACHE`, `LOCAL_CUSTOM_CACHE`) cho tốc độ nhanh nhất trên cùng host, hoặc **S3 Cache** cho build phân tán.
- **Batch Builds**: Chạy song song nhiều test suite (`build-list`, `build-matrix`, `build-fanout`).
- **Secrets**: Dùng `parameter-store` (SSM) hoặc `secrets-manager` trực tiếp trong mục `env` để tránh lộ secret ra log.

```yaml
version: 0.2
env:
  secrets-manager:
    DOCKER_PASS: "prod/dockerhub:password"
  parameter-store:
    NPM_REGISTRY: "/cicd/codeartifact/endpoint"
phases:
  pre_build:
    commands:
      - aws codeartifact login --tool npm --repository my-repo --domain my-org
  build:
    commands:
      - npm ci && npm test
      - docker build -t $REPOSITORY_URI:$IMAGE_TAG .
cache:
  paths:
    - '/root/.npm/**/*'
```

### AWS CodeArtifact
- Lưu trữ package nội bộ (npm, PyPI, Maven, NuGet) và hoạt động như proxy/upstream tới public repository (npmjs, PyPI).
- Hỗ trợ chia sẻ cross-account qua **Domain Policy** và kết nối riêng tư qua **VPC Interface Endpoint** (không cần Internet Gateway/NAT Gateway để tải dependency).

## 3. Chiến lược Triển khai với CodeDeploy & AppSpec

| Nền tảng | Chiến lược hỗ trợ | Cơ chế điều hướng traffic | Rollback tự động |
| :--- | :--- | :--- | :--- |
| **EC2 / On-Prem** | In-Place, Blue/Green | ALB/NLB Target Group hoặc CLB | CloudWatch Alarms + Deployment failure |
| **Amazon ECS** | Blue/Green (AllAtOnce, Linear, Canary) | ALB/NLB Production & Test Listener | Tự động chuyển traffic về Blue Task Set |
| **AWS Lambda** | AllAtOnce, Linear, Canary | Lambda Alias Traffic Shifting | CloudWatch Alarms + `BeforeAllowTraffic` / `AfterAllowTraffic` hooks |

### Thứ tự Lifecycle Hooks quan trọng trong `appspec.yml`
- **EC2 In-Place**: `ApplicationStop` → `DownloadBundle` → `BeforeInstall` → `Install` → `AfterInstall` → `ApplicationStart` → `ValidateService`.
- **ECS Blue/Green**: `BeforeInstall` → `AfterInstall` → `AfterAllowTestTraffic` → `BeforeAllowTraffic` → `AfterAllowTraffic`.
- **Lambda**: `BeforeAllowTraffic` → *(traffic shift)* → `AfterAllowTraffic`.

```yaml
# Ví dụ AppSpec cho Lambda Canary Deployment
version: 0.0
Resources:
  - myLambdaFunction:
      Type: AWS::Lambda::Function
      Properties:
        Name: "order-processor"
        Alias: "prod"
        CurrentVersion: "1"
        TargetVersion: "2"
Hooks:
  - BeforeAllowTraffic: "LambdaHookPreTrafficValidation"
  - AfterAllowTraffic: "LambdaHookPostTrafficValidation"
```

> **Exam Tip**: Trong Lambda/ECS Blue/Green, Hook Lambda **bắt buộc** phải gọi API `codedeploy:PutLifecycleEventHookExecutionStatus` với trạng thái `Succeeded` hoặc `Failed`. Nếu không gọi, deployment sẽ bị treo cho đến khi timeout và tự động rollback!

## 4. AWS AppConfig & Feature Flags

- **AWS AppConfig** cho phép triển khai cấu hình ứng dụng và **Feature Flags** tách biệt khỏi chu kỳ deploy code.
- Hỗ trợ **Validators** (JSON Schema hoặc Lambda function) kiểm tra cú pháp/logic trước khi deploy.
- Hỗ trợ **Deployment Strategy** (Linear/Exponential) kết hợp **CloudWatch Alarms** để tự động rollback cấu hình nếu tỷ lệ lỗi tăng đột biến.

## 5. GitOps & Multi-Branch Workflow
- Dùng **EventBridge** bắt sự kiện `CodeCommit Repository State Change` hoặc **CodeConnections (CodeStar Connections)** cho GitHub/GitLab/Bitbucket.
- **CodePipeline V2** hỗ trợ trigger theo Git tags, branch filters, file path filters và **Pipeline Variables** để tái sử dụng một pipeline cho nhiều nhánh hoặc nhiều môi trường.
- Với **Approval Gate**: Thêm **Manual Approval Action** (gửi thông báo qua SNS) trước stage Production, kết hợp **CodeBuild Report Groups** (JUnit/Cucumber/Code Coverage) để review chất lượng trước khi phê duyệt.

---

[Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/01-sdlc-cicd-pipelines.md) | [Bài tiếp →](02-codeguru-amazon-q-dev-ai-sdlc.md)
