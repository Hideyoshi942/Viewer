# CI/CD Chuyên sâu Đa tài khoản: CodePipeline, CodeDeploy, CodeBuild, CodeArtifact & AppConfig

Trong kỳ thi **AWS Certified DevOps Engineer - Professional (DOP-C02)**, Domain 1 (SDLC Automation - 22%) không chỉ dừng ở việc nối các stage cơ bản mà tập trung mạnh vào **kiến trúc CI/CD đa tài khoản (Cross-Account)**, **thứ tự thực thi AppSpec Lifecycle Hooks** giữa EC2/ECS/Lambda, **tối ưu tốc độ build CodeBuild**, **quản trị dependency với CodeArtifact** và **triển khai cấu hình an toàn bằng AWS AppConfig**.

---

## 1. Kiến trúc Cross-Account AWS CodePipeline

Khi tổ chức tách biệt **Tools/CI Account (Account A)** và **Target/Prod Account (Account B)**, một pipeline chạy ở Account A muốn deploy sang Account B bắt buộc phải thỏa mãn **4 mảnh ghép bảo mật đồng thời** (thiếu 1 trong 4 sẽ báo `AccessDenied`):

| Thành phần | Tài khoản đặt | Vai trò & Cấu hình bắt buộc |
| :--- | :--- | :--- |
| **1. Customer Managed KMS Key (CMK)** | Account A (Tools) | Mã hóa Artifact S3 Bucket. **Không được dùng AWS Managed Key (`aws/s3`)** vì không thể sửa Key Policy để chia sẻ cross-account. Key Policy phải cấp `kms:Decrypt`, `kms:DescribeKey` (và `kms:Encrypt`/`GenerateDataKey` nếu Account B ghi output artifact) cho Account B / Deploy Role ở Account B. |
| **2. Artifact S3 Bucket Policy** | Account A (Tools) | Cấp quyền `s3:GetObject`, `s3:GetObjectVersion`, `s3:GetBucketVersioning` (và `s3:PutObject` nếu cần) cho Cross-Account Role ở Account B. |
| **3. Cross-Account Deploy Role** | Account B (Prod) | Trust Policy tin cậy (`sts:AssumeRole`) Account A (hoặc CodePipeline Service Role ở Account A). Permissions Policy cấp quyền deploy (CloudFormation/CodeDeploy/ECS) + quyền đọc S3 Artifact Bucket ở Account A + quyền `kms:Decrypt` trên CMK ở Account A. |
| **4. CodePipeline Service Role** | Account A (Tools) | Có quyền `sts:AssumeRole` vào Cross-Account Deploy Role ở Account B. Trong cấu hình Action của Pipeline (Stage Deploy), khai báo `roleArn` trỏ tới Role ở Account B. |

```json
// KMS Key Policy snippet (Account A) cho phép Account B giải mã artifact
{
  "Sid": "AllowCrossAccountDecrypt",
  "Effect": "Allow",
  "Principal": {
    "AWS": "arn:aws:iam::222222222222:role/CrossAccountDeployRole"
  },
  "Action": [
    "kms:Decrypt",
    "kms:DescribeKey",
    "kms:Encrypt",
    "kms:ReEncrypt*",
    "kms:GenerateDataKey*"
  ],
  "Resource": "*"
}
```

> **Exam Tip**: Nếu đề bài hỏi tại sao pipeline hoạt động bình thường trong cùng account nhưng lỗi `AccessDenied` khi deploy sang Prod Account mặc dù Bucket Policy và Cross-Account Role đã có `s3:GetObject`, câu trả lời gần như chắc chắn là **Artifact Bucket đang mã hóa bằng `aws/s3` (AWS Managed Key) thay vì Customer Managed KMS Key (CMK)** hoặc thiếu quyền `kms:Decrypt` trên CMK đó.

---

## 2. CodeDeploy AppSpec Lifecycle Hook Execution Order (EC2 vs ECS vs Lambda)

Đây là một trong những vùng kiến thức **hay bị bẫy nhất** trong DOP-C02. Mỗi compute platform có tập hook, định dạng file (`appspec.yml` vs `appspec.json`/YAML) và cơ chế rollback khác nhau.

### 2.1. Bảng so sánh thứ tự Lifecycle Hooks

| Nền tảng | Thứ tự thực thi Lifecycle Hooks | Lưu ý đặc biệt cho kỳ thi |
| :--- | :--- | :--- |
| **EC2 / On-Premises (In-Place, không Load Balancer)** | `ApplicationStop` → `DownloadBundle` → `BeforeInstall` → `Install` → `AfterInstall` → `ApplicationStart` → `ValidateService` | `DownloadBundle` và `Install` là **reserved** (không gán script được). Trong lần deploy **đầu tiên**, `ApplicationStop` không chạy (chưa có revision cũ); từ lần thứ 2 trở đi, `ApplicationStop` chạy script của **revision trước đó** (cached trên instance)! |
| **EC2 / On-Premises (In-Place/Blue-Green có Load Balancer)** | `BeforeBlockTraffic` → `BlockTraffic` → `AfterBlockTraffic` → `ApplicationStop` → `DownloadBundle` → `BeforeInstall` → `Install` → `AfterInstall` → `ApplicationStart` → `ValidateService` → `BeforeAllowTraffic` → `AllowTraffic` → `AfterAllowTraffic` | `BlockTraffic` và `AllowTraffic` là **reserved**. Blue/Green trên EC2 tạo Auto Scaling Group mới (Replacement), cài app lên ASG mới rồi chuyển traffic qua ELB. |
| **Amazon ECS (Blue/Green)** | `BeforeInstall` → `Install` → `AfterInstall` → `AfterAllowTestTraffic` → `BeforeAllowTraffic` → `AllowTraffic` → `AfterAllowTraffic` | Tất cả hook đều gọi **AWS Lambda function**. `Install` và `AllowTraffic` là reserved. Dùng **Test Listener** trên ALB/NLB để chạy kiểm thử ở `AfterAllowTestTraffic` trước khi chuyển Production Listener! |
| **AWS Lambda (Canary / Linear / AllAtOnce)** | `BeforeAllowTraffic` → `AllowTraffic` → `AfterAllowTraffic` | Chỉ có **2 hook gắn script được** (`BeforeAllowTraffic` và `AfterAllowTraffic`), đều gọi **Lambda validation function**. `AllowTraffic` là reserved. |

### 2.2. Bắt buộc cho ECS và Lambda Validation Hooks

Khi dùng Lambda hook trong CodeDeploy cho **ECS** hoặc **AWS Lambda**, function kiểm thử **BẮT BUỘC** phải gọi API `codedeploy:PutLifecycleEventHookExecutionStatus` để báo về `Succeeded` hoặc `Failed`:

```python
import boto3

codedeploy = boto3.client("codedeploy")

def lambda_handler(event, context):
    deployment_id = event["DeploymentId"]
    lifecycle_event_hook_execution_id = event["LifecycleEventHookExecutionId"]

    # Thực hiện smoke test / integration test tại đây
    test_passed = run_smoke_tests()

    codedeploy.put_lifecycle_event_hook_execution_status(
        deploymentId=deployment_id,
        lifecycleEventHookExecutionId=lifecycle_event_hook_execution_id,
        status="Succeeded" if test_passed else "Failed"
    )
```

> **Exam Tip**:
> - Nếu `ApplicationStop` của revision cũ bị lỗi cú pháp/bug khiến mọi bản deploy mới đều thất bại trên EC2: bật tùy chọn **`ignoreApplicationStopFailures: true`** khi tạo deployment mới.
> - Trên **ECS Blue/Green**, cần kiểm tra ứng dụng trên bản Green **trước khi người dùng thật nhận traffic** → cấu hình **Test Listener** trên ALB và gắn Lambda test vào hook **`AfterAllowTestTraffic`**.
> - Trên **Lambda/ECS**, nếu hook Lambda quên gọi `PutLifecycleEventHookExecutionStatus` (hoặc IAM Role của Lambda thiếu quyền `codedeploy:PutLifecycleEventHookExecutionStatus`), deployment sẽ **treo tối đa 1 giờ rồi timeout và rollback**.

---

## 3. AWS CodeBuild Nâng cao: VPC, Caching & Batch Builds

### 3.1. CodeBuild kết nối tài nguyên nội bộ (VPC Configuration)
Mặc định, CodeBuild chạy ngoài VPC và không truy cập được RDS, ElastiCache, Private Git Server hoặc Private ALB trong VPC. Để kết nối:
- Cấu hình `VpcConfig` (`VpcId`, `Subnets`, `SecurityGroupIds`) — **BẮT BUỘC đặt trong Private Subnets có route đi qua NAT Gateway** (nếu build cần truy cập internet như tải npm/PyPI hoặc gọi AWS API không có VPC Endpoint). Không thể chạy CodeBuild trực tiếp trong Public Subnet để ra internet (CodeBuild ENI không được gán Public IP).
- Service Role của CodeBuild cần quyền quản lý ENI: `ec2:CreateNetworkInterface`, `ec2:DescribeDhcpOptions`, `ec2:DescribeNetworkInterfaces`, `ec2:DeleteNetworkInterface`, `ec2:DescribeSubnets`, `ec2:DescribeSecurityGroups`, `ec2:DescribeVpcs`, `ec2:CreateNetworkInterfacePermission`.

### 3.2. Chiến lược Caching trong CodeBuild

| Loại Cache | Cơ chế lưu trữ | Phù hợp nhất khi | Lưu ý quan trọng |
| :--- | :--- | :--- | :--- |
| **Amazon S3 Cache** | Nén và lưu vào S3 Bucket | Dự án build không thường xuyên, artifact lớn nhưng nén tốt, dùng chung giữa nhiều build host độc lập | Chi phí truyền/nén tải từ S3 có thể làm chậm nếu file quá nhỏ hoặc nhiều file nhỏ. |
| **Local Cache (`LOCAL_SOURCE_CACHE`)** | Lưu trên local host SSD của CodeBuild | Git repo lớn cần `git fetch` nhanh | Chỉ hiệu quả khi build chạy liên tục (best-effort, không đảm bảo hit 100% vì host có thể bị thu hồi sau ~15 phút idle). |
| **Local Docker Layer Cache (`LOCAL_DOCKER_LAYER_CACHE`)** | Lưu Docker image layers trên local host | Build Docker image thường xuyên, muốn tái sử dụng các layer không đổi | **Bắt buộc bật `privilegedMode: true`** trong CodeBuild environment. |
| **Local Custom Cache (`LOCAL_CUSTOM_CACHE`)** | Lưu các thư mục chỉ định trong `buildspec.yml` (`~/.m2`, `node_modules`) | Dependencies lớn, build liên tục | Khai báo đường dẫn trong mục `cache: paths:` của `buildspec.yml`. |

### 3.3. Batch Builds (Build song song & ma trận)
Thay vì tạo nhiều CodeBuild project rời rạc hoặc build tuần tự quá lâu, **CodeBuild Batch Builds** cho phép chạy nhiều build đồng thời trong cùng 1 project thông qua block `batch` trong `buildspec.yml`:
- **`build-matrix`**: Build chéo tổ hợp các phiên bản (VD: Python 3.11 & 3.12 × x86 & ARM64).
- **`build-graph`**: Khai báo phụ thuộc DAG (`depend-on`) giữa các build con (VD: build core library xong mới build 3 microservices song song).
- **`build-list`**: Danh sách build độc lập chạy song song.
- **`build-fanout`**: Chia nhỏ bộ test (VD: chạy 1000 unit tests trên 10 worker song song) để giảm mạnh thời gian phản hồi CI.

---

## 4. AWS CodeArtifact: Quản trị Package & Upstream Repositories

Trong môi trường doanh nghiệp đa tài khoản, developer không được tải package trực tiếp từ internet công cộng (rủi ro supply-chain attack, dependency confusion, hoặc bị block bởi firewall). **AWS CodeArtifact** giải quyết bài toán này:

1. **Domain & Repository Hierarchy**:
   - **Domain**: Tập hợp các repository, chia sẻ chung nơi lưu trữ asset (deduplication) và **1 KMS Key duy nhất**. Mỗi tổ chức thường tạo **1 Domain tập trung** ở Shared Services Account.
   - **Domain Permissions Policy**: Resource-based policy cấp quyền truy cập cross-account (thường dùng condition `aws:PrincipalOrgID`) cho toàn bộ AWS Organization.
2. **External Connection & Upstream Repositories**:
   - Tạo 1 **Shared/Upstream Repository** (VD: `npm-store`) có **External Connection** ra `public:npmjs` (hoặc PyPI, Maven Central, NuGet).
   - Các team repository (VD: `team-a-repo`) chỉ định `npm-store` làm **Upstream Repository** thay vì nối thẳng ra public. Khi package được tải lần đầu, CodeArtifact cache vĩnh viễn bản sao trong `npm-store` → bảo vệ khỏi sự cố public registry bị sập hoặc package bị tác giả xóa (như vụ `left-pad`).
3. **Package Origin Controls (Chống Dependency Confusion)**:
   - Cấu hình `publish: ALLOW, upstream: BLOCK` cho các gói nội bộ (internal packages) để đảm bảo kẻ tấn công không thể upload gói trùng tên với version cao hơn lên public registry và lừa pipeline kéo về.

> **Exam Tip**: CodeArtifact token lấy qua `aws codeartifact get-authorization-token` có thời hạn tối đa **12 giờ** (mặc định 12h, tối thiểu 15 phút). Trong CodeBuild, luôn gọi lệnh login ở phase `pre_build` để tránh token hết hạn.

---

## 5. AWS AppConfig: Feature Flags & Safe Configuration Rollout

**AWS AppConfig** (một capability của Systems Manager) tách biệt hoàn toàn **thay đổi cấu hình / Feature Flags** khỏi **triển khai code (code deployment)**, giúp bật/tắt tính năng tức thì mà không cần chạy lại CI/CD pipeline hay restart server.

### 5.1. Kiến trúc lõi của AppConfig
- **Application** → chứa các **Environments** (`dev`, `staging`, `prod`) và **Configuration Profiles** (Hosted tại AppConfig, S3, SSM Parameter Store, SSM Document, hoặc CodePipeline).
- **Validators**: Kiểm tra cú pháp và nghiệp vụ **trước khi deploy** bằng **JSON Schema** hoặc **AWS Lambda Validator** (ngăn lỗi cấu hình sai làm sập production ngay từ cửa).
- **Deployment Strategies**: Kiểm soát tốc độ đẩy cấu hình mới:
  - `Linear` (tuyến tính) hoặc `Exponential` (cấp số nhân).
  - **Bake Time**: Khoảng thời gian giữ và theo dõi sau khi 100% target đã nhận cấu hình mới trước khi đánh dấu deployment hoàn tất.
- **Automated Rollback**: Gắn **CloudWatch Alarms** vào Environment. Nếu alarm chuyển sang trạng thái `ALARM` trong lúc rollout hoặc trong **Bake Time**, AppConfig **tự động rollback** về cấu hình trước đó.
- **AppConfig Agent**: Sidecar/Lambda Extension giúp ứng dụng poll và cache cấu hình cục bộ với độ trễ thấp, giảm chi phí gọi API `GetLatestConfiguration`.

### 5.2. So sánh nhanh: SSM Parameter Store vs Secrets Manager vs AppConfig

| Tiêu chí | SSM Parameter Store | AWS Secrets Manager | AWS AppConfig |
| :--- | :--- | :--- | :--- |
| **Mục đích chính** | Lưu cấu hình tĩnh, tham số hệ thống, license | Lưu bí mật (DB password, API key) cần **auto-rotation** | **Feature Flags** & cấu hình động cần **validation + gradual rollout + alarm rollback** |
| **Tự động xoay vòng (Rotation)** | Không native (phải tự viết Lambda/EventBridge) | Có native (RDS, Redshift, DocumentDB, custom Lambda) | Không |
| **Validation trước khi đẩy** | Không | Không | **Có (JSON Schema & Lambda)** |
| **Rollout từng phần & Auto-Rollback** | Không | Không | **Có (Canary/Linear + Bake Time + CloudWatch Alarm)** |

---

## 6. Checklist Ôn thi Nhanh (DOP-C02 Domain 1)

- [ ] Cross-account CodePipeline **bắt buộc dùng KMS CMK** (không dùng `aws/s3`) + S3 Bucket Policy + Cross-Account Role + `sts:AssumeRole`.
- [ ] CodeDeploy **EC2** hook đầu tiên là `ApplicationStop` (chạy script của revision cũ); **ECS** có `AfterAllowTestTraffic` để test qua Test Listener; **Lambda** chỉ có `BeforeAllowTraffic` và `AfterAllowTraffic`.
- [ ] Validation Lambda của ECS/Lambda CodeDeploy **phải gọi** `codedeploy:PutLifecycleEventHookExecutionStatus`.
- [ ] CodeBuild `LOCAL_DOCKER_LAYER_CACHE` yêu cầu `privilegedMode: true`; CodeBuild trong VPC cần **Private Subnets + NAT Gateway** để ra internet.
- [ ] Dùng **CodeArtifact Upstream Repositories + Package Origin Controls** để cache public packages và chặn tấn công Dependency Confusion.
- [ ] Dùng **AWS AppConfig** khi đề bài yêu cầu: *tách cấu hình/feature flag khỏi code release, validate bằng JSON Schema/Lambda, rollout từ từ và tự động rollback khi CloudWatch Alarm kêu*.

---

[← Bài trước](02-codeguru-amazon-q-dev-ai-sdlc.md) | [Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/02-sdlc-codedeploy-ecs-lambda.md) | [Bài tiếp →](04-elastic-beanstalk-ecs-deployment-policies.md)
