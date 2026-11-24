# Chương 24 – AWS CI/CD: CodeCommit, CodePipeline, CodeBuild, CodeDeploy

> **Nguồn:** 18 video của chương + *AWS CICD Quiz* (19 câu).
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay (2026). Các điểm đã thay đổi so với thời điểm quay video được đánh dấu **[Cập nhật 2026]**.

## Mục tiêu chương

Sau chương này bạn có thể:

- Giải thích **CI (Continuous Integration)** và **CD (Continuous Delivery)**, và vị trí của từng dịch vụ AWS trong chuỗi CI/CD.
- Dùng **CodeCommit** (hoặc GitHub/GitLab/Bitbucket qua **CodeConnections**) làm kho mã nguồn; hiểu các cách xác thực (SSH, HTTPS Git credentials, credential helper), notification rule và trigger.
- Xây dựng pipeline bằng **CodePipeline**: source → build/test → deploy, thêm stage, **manual approval**, hiểu cơ chế **artifact qua S3**.
- Viết **`buildspec.yml`** cho **CodeBuild**, hiểu các phase, biến môi trường, cache, artifact, log và chạy CodeBuild trong VPC.
- Triển khai bằng **CodeDeploy** lên EC2/on-premises, Auto Scaling Group, Lambda và ECS; viết **`appspec.yml`**; phân biệt in-place và blue/green, canary và linear; hiểu cơ chế rollback.
- Dùng **CodeArtifact** để quản lý package (proxy public repo, upstream, cross-account bằng resource policy).
- Nắm **CodeGuru Reviewer** và **CodeGuru Profiler** (và các tham số agent của Profiler).

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001–002 | AWS CICD - Section Introduction, Introduction to CICD in AWS | Bài 1 – Tổng quan CI/CD trên AWS |
| 003–005 | CodeCommit Overview, CodeCommit Hands On Part I & 2 | Bài 2 – AWS CodeCommit |
| 006–008 | CodePipeline Overview, Hands On - Prerequisite, Hands On | Bài 3 – AWS CodePipeline |
| 009–011 | CodeBuild Overview, CodeBuild Hands On Part I & 2 | Bài 4 – AWS CodeBuild |
| 012–013 | CodeDeploy Overview, CodeDeploy Hands On | Bài 5 – AWS CodeDeploy |
| 014 | CodeDeploy for EC2 and ASG | Bài 6 – CodeDeploy với EC2, ASG và Rollback |
| 015–016 | CodeArtifact - Overview, CodeArtifact - Hands On | Bài 7 – AWS CodeArtifact |
| 017–018 | CodeGuru - Overview, CodeGuru - Agent Configuration | Bài 8 – Amazon CodeGuru |
| Quiz | AWS CICD Quiz | Câu hỏi ôn tập |

---

## Bài 1 – Tổng quan CI/CD trên AWS

### Lý thuyết

Ở các chương trước, ta tạo tài nguyên **thủ công** (console), rồi bằng CLI, rồi deploy code bằng Elastic Beanstalk. Làm tay thì chậm và dễ sai. Mục tiêu của CI/CD: **push code lên repository → code tự động được test và deploy** lên AWS, đúng cách, qua nhiều môi trường (dev → test → staging/pre-prod → prod), có thể thêm **manual approval** trước khi lên prod. Tóm lại: **tự động hoá mọi thứ để tăng an toàn và tốc độ**.

Các dịch vụ được giới thiệu trong chương:

| Dịch vụ | Vai trò |
|---|---|
| **CodeCommit** | Lưu trữ mã nguồn (Git repository) |
| **CodePipeline** | Điều phối (orchestrate) pipeline từ code tới môi trường đích (ví dụ Beanstalk) |
| **CodeBuild** | Build và test code tự động |
| **CodeDeploy** | Deploy code lên EC2, on-premises, Lambda, ECS (không cần Beanstalk) |
| **CodeStar** | Quản lý hoạt động phát triển phần mềm ở một chỗ, gom CodeCommit + CodePipeline + CodeBuild + CodeDeploy **[Cập nhật 2026: đã ngừng hoạt động, xem bên dưới]** |
| **CodeArtifact** | Lưu trữ, publish, chia sẻ software package |
| **CodeGuru** | Review code tự động và gợi ý hiệu năng bằng machine learning |

#### Continuous Integration (CI)

- Developer **push code thường xuyên** lên một repository trung tâm (GitHub, CodeCommit, Bitbucket…).
- Một **build/test server** (CodeBuild, Jenkins CI…) lấy code về và kiểm tra ngay khi code được push.
- Developer nhận **kết quả build/test** (pass/fail).
- Lợi ích: phát hiện bug sớm và sửa sớm; developer không phải tự test trên máy mà làm việc khác trong lúc chờ; code được giao nhanh hơn; deploy thường xuyên hơn; developer "hạnh phúc" hơn.

#### Continuous Delivery (CD)

- Sau khi build **pass** (xanh), **deployment server** deploy ứng dụng lên các application server (v1 → v2 → …).
- Đảm bảo phần mềm **release đáng tin cậy, thường xuyên và nhanh**: chuyển từ "3 tháng release một lần" (lâu, dễ lỗi) sang "có thể release 5 lần/ngày".
- Cần công cụ deploy tự động: **CodeDeploy**, Jenkins CD, Spinnaker…

#### Tech stack CI/CD trên AWS

| Giai đoạn | Dịch vụ AWS | Lựa chọn khác |
|---|---|---|
| Code | CodeCommit | GitHub, Bitbucket, GitLab… |
| Build + Test | CodeBuild | Jenkins CI, CI server bên thứ ba |
| Deploy | CodeDeploy (EC2, on-premises, Lambda, ECS) | Elastic Beanstalk (deploy **và** provision hạ tầng) |
| Orchestrate | **CodePipeline** (điều phối toàn bộ) | — |

### Kiến thức thực tế

- **Continuous Delivery vs Continuous Deployment:** *Delivery* = luôn ở trạng thái sẵn sàng release, bước lên prod có thể cần **người phê duyệt**; *Deployment* = mọi thay đổi pass test đều **tự động** lên prod, không có bước tay. Đề DVA gọi chung là "CD", nhưng nếu đề nhắc manual approval trước prod thì đó là Continuous Delivery.
- **[Cập nhật 2026] Trạng thái các dịch vụ trong họ "Code\*":**

| Dịch vụ | Trạng thái |
|---|---|
| **AWS CodeStar** | **Đã ngừng hoạt động (31/7/2024).** Không dùng nữa; tự dựng pipeline bằng CodePipeline/CDK/CloudFormation. |
| **AWS CodeStar Connections** | **Đổi tên thành AWS CodeConnections** (2024). Dùng để kết nối GitHub, GitLab, Bitbucket… vào CodePipeline/CodeBuild. ARN mới dạng `arn:aws:codeconnections:...` (ARN cũ `codestar-connections` vẫn được chấp nhận). |
| **AWS CodeStar Notifications** | Vẫn hoạt động (là cơ chế đằng sau *notification rule* của CodeCommit/CodeBuild/CodeDeploy/CodePipeline). |
| **AWS CodeCommit** | Ngừng nhận khách hàng mới từ **25/7/2024**; sau đó (cuối 2025) AWS thông báo đưa CodeCommit trở lại hoạt động bình thường. Hãy kiểm tra trang chính thức trước khi chọn cho dự án mới. Thực tế phần lớn đội ngũ dùng **GitHub/GitLab/Bitbucket qua CodeConnections**. |
| **CodePipeline, CodeBuild, CodeDeploy, CodeArtifact** | Vẫn hoạt động bình thường. |
| **CodeGuru Reviewer** | Đã **ngừng nhận liên kết repository mới**; AWS khuyên chuyển sang các công cụ khác (ví dụ Amazon Q Developer, Amazon Inspector code security). |

- Hiện nay nhiều công ty dùng **GitHub Actions/GitLab CI** cho CI và dùng **OIDC** để assume IAM role vào AWS (không lưu access key). Tuy vậy đề DVA vẫn tập trung vào bộ Code\* của AWS.

### Ghi nhớ cho kỳ thi

- **CI/CD = Continuous Integration + Continuous Delivery.**
- Mapping nhanh: lưu code → **CodeCommit**; build/test → **CodeBuild** (thay Jenkins); deploy lên EC2/on-prem/Lambda/ECS → **CodeDeploy**; điều phối toàn bộ → **CodePipeline**.
- Elastic Beanstalk là lựa chọn thay CodeDeploy khi muốn vừa deploy vừa provision hạ tầng.

---

## Bài 2 – AWS CodeCommit

### Lý thuyết

#### Version control và Git

- **Version control**: theo dõi thay đổi của code theo thời gian, biết ai commit gì, thêm/xoá gì, và có thể **rollback**.
- Công nghệ phổ biến nhất: **Git**. Repo Git có thể nằm trên máy, nhưng thường được đẩy lên một **repository trung tâm online** để:
  - Cộng tác với nhiều developer (tổ chức có thể tới hàng nghìn người).
  - Code được **sao lưu** trên cloud, không chỉ nằm trên máy một người.
  - Xem và sửa được, biết ai commit dòng nào, khi nào, và revert được.

#### CodeCommit là gì

- Git repository **private**, **fully managed**, **highly available** của AWS. Developer (ví dụ Emma và John) push/pull code từ repo.
- Lý do chọn (theo video):
  - Các dịch vụ bên thứ ba (GitHub, GitLab, Bitbucket) có thể tốn kém.
  - Code chỉ nằm trong **AWS Cloud** → tăng bảo mật và tuân thủ (compliance).
  - **Không giới hạn kích thước repo**, scale liền mạch.
  - Bảo mật: mã hoá, kiểm soát truy cập bằng IAM.
  - Tích hợp với Jenkins, CodeBuild và các công cụ CI khác.

#### Bảo mật CodeCommit

| Khía cạnh | Cơ chế |
|---|---|
| Giao tiếp | Lệnh Git chuẩn |
| **Authentication** | **SSH keys** (upload public key vào IAM user) hoặc **HTTPS** (Git credentials = username/password sinh từ IAM, hoặc AWS CLI credential helper / `git-remote-codecommit`) |
| **Authorization** | **IAM policy** cấp quyền cho user/role trên từng repo |
| **Encryption at rest** | Mã hoá bằng **AWS KMS** |
| **Encryption in transit** | Chỉ qua **HTTPS hoặc SSH** (đều an toàn) |
| **Cross-account** | **Không** chia sẻ SSH key hay Git credentials. Tạo **IAM Role** trong account của bạn, người ở account khác dùng **STS `AssumeRole`** để truy cập |

#### CodeCommit vs GitHub

| | CodeCommit | GitHub |
|---|---|---|
| Pull request (code review) | Có | Có |
| Tích hợp CodeBuild | Có | Có |
| Authentication | SSH, HTTPS | SSH, HTTPS |
| Quản lý người dùng | **IAM users/roles** (tích hợp hoàn toàn với AWS) | GitHub users, SSO (bản Enterprise) |
| Nơi lưu trữ | Chỉ trên AWS | GitHub.com, hoặc server riêng (GitHub Enterprise Server) |
| Giao diện | Tối giản | Đầy đủ tính năng |

#### Notification rule và Trigger (trong Settings của repo)

| | Notification rule | Trigger |
|---|---|---|
| Sự kiện | Comment trên commit/pull request; approval (status change, rule override); pull request (source updated, created, status changed, merged); branch/tag created, deleted, updated | **Sự kiện code cụ thể**: *push to existing branch*, create branch/tag, delete branch/tag; có thể lọc theo tên branch (ví dụ `master`) |
| Target | **SNS topic**, **AWS Chatbot (Slack)** — nay là *Amazon Q Developer in chat applications* | **SNS topic** hoặc **Lambda function** |
| Mức chi tiết | Basic hoặc Full | — |

### Kiến thức thực tế

- **[Cập nhật 2026]** CodeCommit đã ngừng nhận khách hàng mới từ 25/7/2024; sau đó AWS thông báo đưa CodeCommit trở lại hoạt động bình thường (cuối 2025). Do tình trạng từng thay đổi, với dự án mới hãy kiểm tra trang dịch vụ, và cân nhắc **GitHub/GitLab/Bitbucket + AWS CodeConnections** (đây là lựa chọn phổ biến nhất hiện nay). Đề thi vẫn có thể hỏi CodeCommit.
- **Chống commit secret (Quiz câu 7):** dùng **trigger SNS/Lambda** để chạy phân tích sau mỗi push. Thực tế nên chặn **trước** khi commit bằng *pre-commit hook* (ví dụ `git-secrets`, `gitleaks`) và bật secret scanning trên GitHub.
- **Policy giới hạn push vào `main`:** dùng condition `codecommit:References`:

  ```json
  {
    "Effect": "Deny",
    "Action": ["codecommit:GitPush", "codecommit:DeleteBranch", "codecommit:PutFile", "codecommit:MergeBranchesByFastForward"],
    "Resource": "arn:aws:codecommit:eu-west-1:123456789012:my-nodejs-app",
    "Condition": {
      "StringEqualsIfExists": {"codecommit:References": ["refs/heads/main"]},
      "Null": {"codecommit:References": "false"}
    }
  }
  ```

- **Approval rule template**: bắt buộc pull request phải có N người duyệt trước khi merge.
- **Sự kiện repo** cũng được gửi tới **EventBridge** (`aws.codecommit`), thường dùng để kích hoạt pipeline. CodePipeline hiện dùng EventBridge thay vì polling định kỳ.
- Lỗi hay gặp: dùng root account (không có SSH); trên macOS, Keychain lưu Git credentials cũ gây lỗi 403; SSH config phải dùng **SSH key ID** (không phải tên IAM user) làm `User`.

### Ghi nhớ cho kỳ thi

- CodeCommit = Git **private**, managed, không giới hạn kích thước, thay thế GitHub/GitLab khi muốn code **ở trong AWS**.
- Authentication: **SSH keys**, **HTTPS Git credentials**, **HTTPS + AWS CLI credential helper**. **Không** có WebSocket.
- Authorization: **IAM policy**. Mã hoá at rest: **KMS**; in transit: HTTPS/SSH.
- **Cross-account:** tạo **IAM Role** + **STS AssumeRole**, không bao giờ chia sẻ SSH key/Git credentials.
- Muốn chạy xử lý tự động (ví dụ quét secret) sau mỗi commit → **Trigger SNS/Lambda** (hoặc EventBridge).

---

## Bài 3 – AWS CodePipeline

### Lý thuyết

**CodePipeline** là công cụ **workflow trực quan** để **điều phối CI/CD** trong AWS.

#### Các khối xây dựng

| Giai đoạn | Provider |
|---|---|
| **Source** | CodeCommit, **ECR** (Docker image), **S3**, Bitbucket, GitHub, GitHub Enterprise Server, GitLab, GitLab self-managed |
| **Build** | CodeBuild, Jenkins, CloudBees, TeamCity |
| **Test** | CodeBuild, **AWS Device Farm** (app iOS/Android), công cụ bên thứ ba |
| **Deploy** | CodeDeploy, **Elastic Beanstalk**, **CloudFormation**, **ECS**, **S3** … |
| **Invoke** | **Lambda**, **Step Functions** |

- Một pipeline gồm nhiều **stage**; mỗi stage chứa các **action** chạy **tuần tự và/hoặc song song**.
- Ví dụ: Build → Test → Deploy staging → Load testing → Deploy production.
- **Manual approval** có thể đặt ở **bất kỳ stage nào** (ví dụ trước khi deploy prod, có người xem kết quả load test rồi bấm "duyệt").

#### Artifact – các stage trao đổi dữ liệu qua S3

1. Developer push code lên CodeCommit.
2. CodePipeline lấy code, tạo **source artifact** và lưu vào **S3 bucket** (artifact store).
3. CodeBuild nhận artifact **từ S3** (do đó CodeBuild **không cần** truy cập trực tiếp CodeCommit) → build → tạo **deployment artifact**, CodePipeline lại lưu vào S3.
4. CodeDeploy nhận artifact từ S3 và deploy.

→ Mỗi stage tạo **artifact**, được lưu trong **S3** và chuyển cho stage sau.

#### Troubleshooting

| Vấn đề | Công cụ |
|---|---|
| Theo dõi thay đổi trạng thái pipeline/stage/action (ví dụ pipeline failed, stage cancelled) và gửi email | **CloudWatch Events / Amazon EventBridge** (rule → SNS) |
| Stage thất bại | Xem trực quan trên console, xem chi tiết lỗi |
| Pipeline không thực hiện được action (không gọi được CodeBuild, không pull được code…) | Kiểm tra **IAM service role** của CodePipeline |
| Audit các API call bị từ chối | **AWS CloudTrail** |

### Kiến thức thực tế

- **[Cập nhật 2026] Pipeline type V1 và V2:** pipeline mới mặc định là **V2**. V2 hỗ trợ **trigger có filter** (theo branch, file path, Git tag, pull request), **pipeline-level variables**, và **execution mode** `SUPERSEDED` (mặc định của V1: lần chạy mới "đè" lần cũ ở stage đang chờ), `QUEUED`, `PARALLEL`. Cách tính phí cũng khác: V1 tính theo số pipeline active mỗi tháng, V2 tính theo thời gian thực thi action.
- **[Cập nhật 2026]** Action source **"GitHub (Version 1)"** dùng OAuth đã **không còn được khuyến nghị**; hãy dùng **GitHub (via GitHub App)** thông qua **AWS CodeConnections** (tên cũ CodeStar Connections).
- Trong định nghĩa pipeline (JSON), action Elastic Beanstalk có dạng:

  ```json
  {
    "name": "DeployToProdBeanstalk",
    "actionTypeId": {"category": "Deploy", "owner": "AWS", "provider": "ElasticBeanstalk", "version": "1"},
    "configuration": {"ApplicationName": "my-first-webapp-beanstalk", "EnvironmentName": "prod"},
    "inputArtifacts": [{"name": "SourceArtifact"}],
    "runOrder": 2
  }
  ```

  Action cùng `runOrder` chạy **song song**, `runOrder` lớn hơn chạy **sau**.
- **Cross-region / cross-account**: mỗi region có action cần một artifact bucket riêng; cross-account cần **customer managed KMS key** cho artifact bucket (AWS managed key không chia sẻ được sang account khác) và role trong account đích.
- Manual approval chờ tối đa **7 ngày**, quá hạn thì action **fail**.
- Best practice: quản lý pipeline bằng IaC (CloudFormation/CDK), service role theo least privilege, bật **notification rule** (Slack/SNS) cho sự kiện failed/approval needed.

### Ghi nhớ cho kỳ thi

- **CodePipeline = orchestrator**, tích hợp trực tiếp với **Elastic Beanstalk**, CodeDeploy, CloudFormation, ECS, S3, Lambda…
- Stage trao đổi **artifact qua S3**.
- **Manual approval** đặt được ở bất kỳ stage nào.
- Thông báo khi pipeline fail → **CloudWatch Events/EventBridge rule** (→ SNS email).
- Pipeline không thực hiện được action → kiểm tra **IAM service role**. Audit API call → **CloudTrail**.
- Pipeline đột nhiên fail dù code đã push thành công → thường do **stage CodeBuild fail test**.

---

## Bài 4 – AWS CodeBuild

### Lý thuyết

**CodeBuild** là dịch vụ **build và test fully managed, serverless**: không cần quản lý build server, scale liên tục, không có hàng đợi build (mỗi build chạy trong container riêng). Đây là lựa chọn thay thế **Jenkins**.

#### Đặc điểm chính

- **Source**: CodeCommit, **S3**, Bitbucket, GitHub, GitHub Enterprise, GitLab (qua CodeConnections).
- Hướng dẫn build nằm trong file **`buildspec.yml`** ở **thư mục gốc (root)** của source code (có thể ghi đè bằng buildspec chèn trực tiếp trong project hoặc chỉ định đường dẫn/tên file khác).
- **Output logs**: gửi tới **S3** và/hoặc **CloudWatch Logs**.
- **Monitoring**: CloudWatch **Metrics** (số build, build thành công/thất bại, thời lượng), **EventBridge** để phát hiện build fail và kích hoạt thông báo, **CloudWatch Alarms** khi vượt ngưỡng số lần fail.
- **Build project** định nghĩa được trong CodeBuild hoặc trong **CodePipeline** (action build).
- **Môi trường build** dựng sẵn (managed image) cho Java, Ruby, Python, Go, Node.js, Android, .NET Core, PHP… Muốn ngôn ngữ/công cụ khác → dùng **Docker image tuỳ chỉnh** (custom image, ví dụ từ ECR).
- **Bảo mật**:
  - Mã hoá build artifact bằng **KMS**.
  - Quyền của build lấy từ **IAM service role** của CodeBuild.
  - **VPC** để build truy cập tài nguyên private.
  - Ghi log API call vào **CloudTrail**.

#### Cách CodeBuild hoạt động

1. Source code (kèm `buildspec.yml`) được lấy từ CodeCommit/GitHub/S3…
2. CodeBuild khởi tạo **container** từ Docker image (managed image hoặc custom image).
3. Container tải source, chạy các lệnh trong `buildspec.yml`.
4. (Tuỳ chọn) dùng **cache** lưu trên **S3** (hoặc local cache) để tăng tốc các lần build sau (ví dụ cache dependency).
5. Log đi vào **CloudWatch Logs** / **S3**; artifact đầu ra được lưu vào **S3**.

#### `buildspec.yml`

Phải nằm ở **root** của source code. Cấu trúc chính:

| Phần | Ý nghĩa |
|---|---|
| `version` | Phiên bản buildspec (`0.2`) |
| `env` | `variables` (biến plaintext), `parameter-store` (lấy từ **SSM Parameter Store**), `secrets-manager` (lấy từ **Secrets Manager**), `exported-variables` |
| `phases` | Các giai đoạn lệnh: **`install`** (cài dependency/runtime), **`pre_build`** (lệnh chạy trước build, ví dụ login ECR), **`build`** (lệnh build thực sự), **`post_build`** (bước hoàn thiện, ví dụ đóng gói zip, push image) |
| `artifacts` | File cần upload lên **S3** (mã hoá bằng **KMS**) |
| `cache` | File/thư mục cần cache lên S3 để tăng tốc build sau (thường là dependency) |
| `reports` | Báo cáo test (JUnit, Cucumber…) hiển thị trong CodeBuild |

Ví dụ:

```yaml
version: 0.2

env:
  variables:
    NODE_ENV: "production"
  parameter-store:
    DB_HOST: "/myapp/prod/db-host"
  secrets-manager:
    DB_PASSWORD: "prod/myapp/db:password"

phases:
  install:
    runtime-versions:
      nodejs: 20
    commands:
      - echo "Installing dependencies"
      - npm ci
  pre_build:
    commands:
      - echo "Running unit tests"
      - npm test
  build:
    commands:
      - echo "Build started on $(date)"
      - npm run build
  post_build:
    commands:
      - echo "Build completed on $(date)"

artifacts:
  files:
    - '**/*'
  base-directory: dist

cache:
  paths:
    - 'node_modules/**/*'
```

#### Chạy CodeBuild trên máy local

- Khi cần **troubleshooting sâu** hơn những gì log cho thấy, có thể chạy CodeBuild **locally** trên máy (cần **Docker**).
- Dùng **CodeBuild Agent** (script `codebuild_build.sh`) để giả lập môi trường build giống trên AWS.

```bash
./codebuild_build.sh -i public.ecr.aws/codebuild/amazonlinux2-x86_64-standard:5.0 \
  -a ./artifacts -s .
```

#### CodeBuild trong VPC

- **Mặc định**, container CodeBuild chạy **bên ngoài VPC** của bạn → **không truy cập được** tài nguyên trong VPC (RDS, ElastiCache, EC2 private, ALB internal…).
- Có thể cấu hình build project với **VPC ID, Subnet ID, Security Group ID** → build truy cập được tài nguyên trong VPC.
- Use case: chạy **integration test**, truy vấn dữ liệu, gọi internal load balancer…
- Lưu ý: khi chạy trong VPC, build cần **NAT Gateway** (subnet private) hoặc **VPC endpoint** để ra Internet/truy cập dịch vụ AWS (S3, CloudWatch Logs, ECR…).

#### CodeBuild trong CodePipeline

- CodeBuild có thể dùng làm **Build** stage và cả **Test** stage của CodePipeline.
- Nếu stage CodeBuild fail (ví dụ test không pass) → pipeline dừng, không deploy code lỗi.

### Kiến thức thực tế

- **Secrets:** không đặt mật khẩu ở `env.variables` (plaintext, hiện trong console/log). Dùng `parameter-store` (SecureString) hoặc `secrets-manager`; service role phải có quyền `ssm:GetParameters` / `secretsmanager:GetSecretValue` (và `kms:Decrypt` nếu dùng customer managed key).
- **Cache:** *S3 cache* (dùng chung giữa các host) hoặc *local cache* (`LOCAL_DOCKER_LAYER_CACHE`, `LOCAL_SOURCE_CACHE`, `LOCAL_CUSTOM_CACHE`). Docker layer cache cần bật **privileged mode** (cũng bắt buộc khi build Docker image trong CodeBuild).
- **Build Docker image và push ECR:** `pre_build` chạy `aws ecr get-login-password | docker login ...`, `build` chạy `docker build`, `post_build` chạy `docker push` và ghi `imagedefinitions.json` làm artifact cho action ECS deploy.
- **[Cập nhật 2026]** CodeBuild hỗ trợ nhiều mô hình compute: **EC2 on-demand**, **Lambda compute** (khởi động nhanh, rẻ cho build ngắn), **reserved capacity fleets**, và có thể làm **GitHub Actions self-hosted runner** / **GitLab runner** — nhiều đội dùng GitHub Actions nhưng để job chạy trên CodeBuild trong VPC.
- **Batch builds** (build matrix/graph) và **test reports/code coverage** hiển thị trực tiếp trong console.
- Biến môi trường có sẵn hữu ích: `CODEBUILD_RESOLVED_SOURCE_VERSION` (commit ID), `CODEBUILD_BUILD_ID`, `CODEBUILD_SRC_DIR`.

### Ghi nhớ cho kỳ thi

- `buildspec.yml` phải ở **root** của source code.
- Thứ tự phase: **install → pre_build → build → post_build**.
- Secrets cho build → `env.parameter-store` / `env.secrets-manager` (không dùng plaintext variables).
- Log → **CloudWatch Logs** và/hoặc **S3**; artifact → **S3** (mã hoá **KMS**).
- Build nhanh hơn → **cache trên S3** (dependency).
- Cần troubleshoot ngoài log → chạy **CodeBuild locally** bằng **CodeBuild Agent + Docker**.
- Build cần truy cập RDS/ElastiCache/tài nguyên private → **cấu hình VPC** (VPC ID, subnet, security group) cho build project.
- Ngôn ngữ không có sẵn → **custom Docker image**.
- Phát hiện build fail → **EventBridge**, **CloudWatch Alarms**, notification rule.

---

## Bài 5 – AWS CodeDeploy

### Lý thuyết

**CodeDeploy** là dịch vụ **deploy tự động** ứng dụng (phiên bản mới) lên:

- **EC2 instances** và **on-premises servers**,
- **AWS Lambda** functions,
- **Amazon ECS** services.

Hỗ trợ **tự động rollback** khi deploy thất bại hoặc khi **CloudWatch Alarm** kích hoạt; kiểm soát tốc độ rollout chi tiết. Hướng dẫn deploy nằm trong file **`appspec.yml`**.

#### Các thành phần chính

| Thành phần | Ý nghĩa |
|---|---|
| **Application** | Tên duy nhất, đóng vai trò container cho revision, deployment configuration, deployment group |
| **Compute platform** | EC2/On-premises, AWS Lambda, Amazon ECS |
| **Deployment configuration** | Bộ quy tắc thành công/thất bại và tốc độ deploy (ví dụ tối thiểu bao nhiêu instance healthy; với Lambda/ECS: traffic dịch chuyển thế nào) |
| **Deployment group** | Nhóm instance được gắn **tag** (hoặc ASG) để deploy tới; cho phép tách dev/test/prod |
| **Deployment type** | **In-place** (chỉ EC2/on-prem) hoặc **Blue/Green** (EC2 qua ASG/ELB, Lambda, ECS) |
| **IAM instance profile** | Cấp cho EC2 quyền đọc bản deploy từ **S3/GitHub** |
| **Application revision** | Code ứng dụng + file `appspec.yml` |
| **Service role** | IAM role cho CodeDeploy thao tác EC2, ASG, ELB… |
| **Target revision** | Revision đích muốn deploy tới deployment group |

#### `appspec.yml`

- **`files`**: cách copy source từ S3/GitHub vào filesystem (`source`, `destination`).
- **`hooks`**: tập lệnh chạy ở từng giai đoạn deploy (có thể đặt `timeout`, `runas`).
- Thứ tự **hooks cho EC2/on-prem (in-place)**:
  1. `ApplicationStop`
  2. `DownloadBundle` (CodeDeploy agent tự làm, không viết script được)
  3. `BeforeInstall`
  4. `Install` (agent tự làm)
  5. `AfterInstall`
  6. `ApplicationStart`
  7. **`ValidateService`** ← **rất quan trọng**: kiểm tra ứng dụng chạy đúng (health check)
- Khi có load balancer còn thêm `BeforeBlockTraffic`, `BlockTraffic`, `AfterBlockTraffic` (trước) và `BeforeAllowTraffic`, `AllowTraffic`, `AfterAllowTraffic` (sau).

```yaml
version: 0.0
os: linux
files:
  - source: /index.html
    destination: /var/www/html/
hooks:
  BeforeInstall:
    - location: scripts/install_dependencies.sh
      timeout: 300
      runas: root
  ApplicationStart:
    - location: scripts/start_server.sh
      timeout: 300
      runas: root
  ApplicationStop:
    - location: scripts/stop_server.sh
      timeout: 300
      runas: root
  ValidateService:
    - location: scripts/validate.sh
      timeout: 120
```

#### Deployment configuration cho EC2/On-premises

| Config | Hành vi |
|---|---|
| `CodeDeployDefault.AllAtOnce` | Deploy tất cả cùng lúc: **nhanh nhất** nhưng **có downtime** |
| `CodeDeployDefault.HalfAtATime` | Mỗi lần 50% instance (giảm 50% capacity) |
| `CodeDeployDefault.OneAtATime` | Mỗi lần 1 instance: **chậm nhất**, ảnh hưởng availability thấp nhất |
| **Custom** | Ví dụ minimum healthy hosts = 75% |

- **In-place**: dừng app trên instance hiện có, cài bản mới (ví dụ HalfAtATime: nửa đầu v1 → v2, rồi nửa sau).
- **Blue/Green**: tạo instance mới (green) chạy v2, ALB chuyển traffic sang green, rồi terminate blue. Cần **load balancer**.

#### Deployment configuration cho Lambda và ECS (traffic shifting)

Traffic chuyển từ version cũ sang version mới qua **Lambda alias** (Lambda) hoặc target group/listener của ALB (ECS):

| Kiểu | Ví dụ (Lambda) | Ví dụ (ECS) | Hành vi |
|---|---|---|---|
| **Linear** | `LambdaLinear10PercentEvery3Minutes`, `LambdaLinear10PercentEvery10Minutes` | `ECSLinear10PercentEvery3Minutes`, `ECSLinear10PercentEvery1Minutes` | Tăng đều 10% traffic sau mỗi N phút tới 100% |
| **Canary** | `LambdaCanary10Percent5Minutes`, `LambdaCanary10Percent30Minutes` | `ECSCanary10Percent5Minutes`, `ECSCanary10Percent15Minutes` | Chuyển 10% trước, chờ N phút, rồi chuyển **100%** còn lại |
| **AllAtOnce** | `LambdaAllAtOnce` | `ECSAllAtOnce` | Chuyển ngay 100%: nhanh, rủi ro cao |

- **ECS chỉ hỗ trợ Blue/Green** qua CodeDeploy (cần ALB, 2 target group).
- Hooks cho Lambda: `BeforeAllowTraffic`, `AfterAllowTraffic` (là **Lambda function** chạy kiểm thử).
- Hooks cho ECS: `BeforeInstall`, `AfterInstall`, `AfterAllowTestTraffic`, `BeforeAllowTraffic`, `AfterAllowTraffic`.

#### CodeDeploy Agent (EC2/on-premises)

- **CodeDeploy Agent** phải được **cài và chạy** trên EC2/on-prem làm điều kiện tiên quyết.
- Cài thủ công hoặc tự động bằng **Systems Manager (SSM)** (Distributor/State Manager).
- EC2 cần **IAM instance profile** đủ quyền **đọc S3** (lấy bundle deploy).
- Agent **poll** CodeDeploy để nhận việc, tải revision, chạy hooks theo `appspec.yml`, báo kết quả về CodeDeploy.

### Kiến thức thực tế

- **Lambda thực tế** thường deploy qua **SAM**: khai báo `AutoPublishAlias` và `DeploymentPreference` (Type `Canary10Percent5Minutes`, `Alarms`, `Hooks`) → SAM tự sinh CodeDeploy application/deployment group.
- **[Cập nhật 2026] ECS:** ngoài CodeDeploy blue/green, ECS nay có **blue/green, linear và canary native** trong ECS deployment controller (2025), không bắt buộc CodeDeploy. Đề thi vẫn hỏi theo mô hình CodeDeploy.
- Đối với ECS + CodeDeploy, CodePipeline dùng action **"Amazon ECS (Blue/Green)"** với `taskdef.json` + `appspec.yaml` + `imageDetail.json`; action ECS thường (rolling) dùng `imagedefinitions.json`.
- Agent log nằm ở `/var/log/aws/codedeploy-agent/codedeploy-agent.log`; script hook log ở `/opt/codedeploy-agent/deployment-root/<deployment-group-id>/<deployment-id>/logs/scripts.log`.
- Script hook phải trả về exit code 0; script lỗi ở `ApplicationStop` của revision **cũ** có thể làm hỏng mọi deployment sau → dùng tuỳ chọn *ignore ApplicationStop failures* khi cần.
- Bundle có thể là `.zip`, `.tar`, `.tar.gz`; `appspec.yml` phải nằm ở **root** của bundle.

### Ghi nhớ cho kỳ thi

- CodeDeploy deploy lên **EC2, on-premises, Lambda, ECS**; file cấu hình là **`appspec.yml`** (khác `buildspec.yml` của CodeBuild).
- EC2/on-prem cần **CodeDeploy Agent** + **instance profile đọc S3**.
- Hook kiểm tra sức khoẻ ứng dụng sau deploy → **`ValidateService`**.
- Thứ tự hook in-place: ApplicationStop → DownloadBundle → BeforeInstall → Install → AfterInstall → ApplicationStart → ValidateService.
- EC2: **AllAtOnce** (nhanh, downtime), **HalfAtATime**, **OneAtATime** (chậm, an toàn), Custom.
- Lambda/ECS: **Canary** (X% rồi phần còn lại), **Linear** (đều đặn X% mỗi N phút), **AllAtOnce**.
- **ECS** qua CodeDeploy chỉ có **Blue/Green**; **in-place** chỉ cho **EC2/on-prem**.
- Deployment group chọn instance bằng **tag** hoặc **ASG**.

---

## Bài 6 – CodeDeploy với EC2, ASG và Rollback

### Lý thuyết

#### CodeDeploy với EC2

- Định nghĩa cách deploy bằng **`appspec.yml`** + **deployment strategy** (deployment configuration).
- Deploy **in-place** lên các EC2 trong deployment group, ví dụ **HalfAtATime**: một nửa instance bị đưa ra khỏi phục vụ và cập nhật v1 → v2, xong rồi mới tới nửa còn lại.
- Dùng hook **`ValidateService`** để kiểm tra deployment có thực sự chạy đúng sau khi cài.

#### CodeDeploy với Auto Scaling Group

| Kiểu | Cơ chế |
|---|---|
| **In-place deployment** | Cập nhật các **EC2 hiện có** trong ASG. **Instance mới** do ASG tạo ra (scale out) cũng **tự động** nhận bản deploy mới nhất (CodeDeploy dùng lifecycle hook của ASG) |
| **Blue/Green deployment** | Tạo **ASG mới** (copy cấu hình từ ASG cũ, launch template) chạy v2; ALB chuyển traffic sang ASG mới; có thể chọn **thời gian giữ lại** instance cũ trước khi terminate. **Bắt buộc dùng ELB** |

Luồng Blue/Green với ASG:

```
ALB ──> ASG v1 (blue)        ALB ──> ASG v1 (blue)  ┐  chờ N phút
                        →          └─> ASG v2 (green) ┘  rồi terminate blue
```

#### Redeploy và Rollback

- **Rollback** = deploy lại **revision đã deploy thành công trước đó**.
- Có thể rollback **tự động** khi:
  - **Deployment fails** (một hook script lỗi, instance không healthy…), hoặc
  - **CloudWatch Alarm** đạt ngưỡng (ví dụ CPU > 75%, tỉ lệ 5xx tăng).
- Hoặc **tắt rollback** (không làm gì) hoặc rollback **thủ công**.
- **Rất quan trọng cho kỳ thi:** khi rollback xảy ra, CodeDeploy **redeploy revision cuối cùng đã biết là tốt** dưới dạng **deployment MỚI** (có **deployment ID mới**), **không phải** "khôi phục" (restore) phiên bản cũ.

### Kiến thức thực tế

- Với ASG, nếu đang có deployment mà ASG scale out, instance mới có thể nhận revision **cũ** → nên tạm **suspend scaling** trong lúc deploy hoặc chạy lại deployment (CodeDeploy có tuỳ chọn tự xử lý *outdated instances*).
- Thực tế nhiều đội dùng **EC2 Image Builder + ASG Instance Refresh** (immutable AMI) thay cho CodeDeploy in-place, hoặc chuyển hẳn sang container/Lambda.
- Kết hợp **CloudWatch Alarm** dựa trên metric ứng dụng (5xx của ALB, latency p99, error custom) để rollback tự động — đây là "safety net" quan trọng nhất của deployment.
- Rollback chỉ có tác dụng nếu revision trước còn tồn tại trong S3 → bật **S3 versioning** và không xoá bundle cũ quá sớm.

### Ghi nhớ cho kỳ thi

- ASG + **in-place**: cập nhật instance hiện có, **instance mới tự nhận** bản deploy mới.
- ASG + **blue/green**: tạo **ASG mới**, **bắt buộc ELB**, có thời gian giữ instance cũ.
- Rollback tự động khi **deployment fail** hoặc **CloudWatch Alarm**.
- Rollback = **deployment mới** với **revision tốt trước đó** (**deployment ID mới**), không phải restore.

---

## Bài 7 – AWS CodeArtifact

### Lý thuyết

Phần mềm thường phụ thuộc vào nhau: các **code dependencies** (package). Việc lưu trữ và lấy các dependency gọi là **artifact management**. Truyền thống phải tự dựng hệ thống (Nexus, Artifactory…).

**CodeArtifact** là dịch vụ **artifact management an toàn, scalable, tiết kiệm** cho software package.

- Hỗ trợ các công cụ quản lý dependency phổ biến: **Maven, Gradle, npm, yarn, twine, pip, NuGet** (và nay thêm Swift, Ruby/gem, Cargo, generic…).
- Developer và **CodeBuild** lấy dependency **trực tiếp từ CodeArtifact**.
- CodeArtifact nằm trong **VPC của AWS** (dịch vụ managed; có thể truy cập private qua VPC endpoint).

#### Kiến trúc

```
Developer / CodeBuild  ──>  CodeArtifact Domain
                              ├── Repository A (npm, pip, maven...)
                              │      └── proxy & cache ──> Public repo (npmjs, PyPI, Maven Central)
                              └── Repository B (package nội bộ do team publish)
```

- **Proxy**: CodeArtifact lấy package từ public repository (npm, PyPI, Maven Central, NuGet…) và **cache** lại → nếu package public bị xoá/hỏng, bạn vẫn còn bản đã cache.
- **Publish**: team có thể **publish và approve** package nội bộ vào CodeArtifact.

#### Tích hợp EventBridge

- Khi package được **tạo, sửa, xoá** (publish version mới…), CodeArtifact phát **sự kiện** tới **EventBridge**.
- EventBridge có thể kích hoạt **Lambda, Step Functions, SNS, SQS** hoặc **CodePipeline** (ví dụ: dependency bảo mật được cập nhật → tự động build lại và deploy ứng dụng).

#### Resource policy

- Dùng **repository resource policy** để cấp quyền cho **account khác** truy cập CodeArtifact.
- Một principal được cấp quyền thì **đọc được tất cả package trong repository** — **all or nothing**, không có quyền theo từng package riêng lẻ.

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"AWS": "arn:aws:iam::222222222222:root"},
    "Action": ["codeartifact:DescribePackageVersion", "codeartifact:DescribeRepository",
               "codeartifact:GetPackageVersionReadme", "codeartifact:GetRepositoryEndpoint",
               "codeartifact:ListPackageVersions", "codeartifact:ListPackages",
               "codeartifact:ReadFromRepository"],
    "Resource": "*"
  }]
}
```

#### Upstream repositories

- Một CodeArtifact repository có thể có các **CodeArtifact repository khác làm upstream**.
- Developer chỉ cần cấu hình **một repository endpoint** duy nhất để lấy package từ nhiều repository.
- Tối đa **10 upstream repositories** mỗi repository.
- Mỗi repository chỉ có **1 external connection** (kết nối tới public repo).

#### External connection

- Là kết nối giữa CodeArtifact repository và **public repository bên ngoài** (Maven Central, npmjs, PyPI, NuGet…) → lấy package chưa có trong domain.
- **Tối đa 1 external connection mỗi repository.**
- Muốn dùng nhiều external connection → tạo nhiều repository (mỗi repo một connection), rồi gom chúng lại bằng upstream.
- Mô hình khuyến nghị: **một repository trong domain có external connection** tới npmjs; các repository khác dùng nó làm **upstream** → package public chỉ được cache **một lần**.

#### Retention

- Nếu package version được yêu cầu từ upstream, nó được **giữ lại (retained)** trong repository downstream gần nhất mà developer yêu cầu (copy reference).
- Package version được retain **không bị ảnh hưởng** khi bị thay đổi/xoá ở upstream.
- Repository trung gian (giữa repo được hỏi và repo có external connection) **không giữ** package.
- Ví dụ: `repo-A` → upstream `repo-B` → upstream `repo-C` (có external connection tới npmjs). Developer yêu cầu `lodash` từ `repo-A`: package được cache ở `repo-C` (repo có external connection) và **retain ở `repo-A`**; `repo-B` không lưu.

#### Domains

- **Domain** gom các repository của nhiều account trong tổ chức.
- **Deduplicated storage**: một asset chỉ lưu **một lần** trong domain dù có nhiều repository chứa nó → chỉ trả phí lưu trữ một lần.
- **Fast copying**: chỉ cập nhật metadata khi kéo package từ upstream vào downstream.
- **Dễ chia sẻ** giữa các repository và team: mọi asset và metadata trong domain được mã hoá bằng **một KMS key** duy nhất.
- **Quản lý tập trung bằng domain policy**: xác định account nào được truy cập repo trong domain, ai được cấu hình connection tới public repo.
- Thường: domain do **account quản trị/shared services** sở hữu, các account team khác tạo repository trong domain đó.

### Kiến thức thực tế

- **Authorization token** có hiệu lực mặc định **12 giờ** (tuỳ chỉnh 15 phút – 12 giờ); trên CI phải gọi `login`/`get-authorization-token` ở đầu mỗi build.
- **Package origin controls**: chặn **dependency confusion** (kẻ xấu publish package public trùng tên package nội bộ) bằng cách đặt package nội bộ chỉ cho phép *publish*, chặn *upstream*.
- Truy cập private từ VPC: cần **VPC endpoint** `com.amazonaws.<region>.codeartifact.api` và `codeartifact.repositories` (cộng S3 gateway endpoint vì asset lưu trên S3).
- **[Cập nhật 2026]** CodeArtifact hỗ trợ thêm định dạng **generic**, **Swift**, **Ruby**, **Cargo**; thường kết hợp với Amazon Inspector để quét lỗ hổng dependency.
- Lựa chọn thay thế phổ biến: GitHub Packages, JFrog Artifactory, Sonatype Nexus. Container image thì dùng **ECR** (CodeArtifact không lưu Docker image).

### Ghi nhớ cho kỳ thi

- CodeArtifact = **artifact/package management** (Maven, Gradle, npm, yarn, pip, twine, NuGet), **proxy + cache** public repo.
- Thay đổi package → **EventBridge** → kích hoạt CodePipeline/Lambda/Step Functions…
- Cross-account → **resource policy** (all-or-nothing trên cả repository).
- **Upstream**: tối đa **10**; **external connection**: tối đa **1** mỗi repository.
- Retention: package được giữ ở **repo downstream được hỏi** (và repo có external connection), không ở repo trung gian.
- **Domain**: deduplicated storage, fast copying, **1 KMS key**, **domain policy** quản lý tập trung.

---

## Bài 8 – Amazon CodeGuru

### Lý thuyết

**Amazon CodeGuru** là dịch vụ dùng **machine learning** để **review code tự động** và đưa ra **gợi ý hiệu năng** ứng dụng.

| Thành phần | Thời điểm | Vai trò |
|---|---|---|
| **CodeGuru Reviewer** | **Trước** khi lên prod (khi push code / pull request) | **Static code analysis**: review code tự động |
| **CodeGuru Profiler** | **Trong** production (runtime) | Gợi ý về **hiệu năng và chi phí** ứng dụng đang chạy |

```
Code ──> CodeGuru Reviewer (review, PR) ──> Build/Test ──> Deploy ──> Production
                                                                       └─ CodeGuru Profiler (đo hiệu năng runtime)
```

#### CodeGuru Reviewer

- Phát hiện **lỗi nghiêm trọng**, **lỗ hổng bảo mật**, **bug khó tìm**.
- Ví dụ: không tuân thủ best practice viết code, **rò rỉ tài nguyên** (resource leak), lỗ hổng bảo mật, **input validation** thiếu.
- Dùng ML và **automated reasoning**; được huấn luyện trên hàng nghìn repository open source, Amazon.com và các nguồn khác.
- Hỗ trợ **Java** và **Python**.
- Tích hợp **GitHub, Bitbucket, CodeCommit** (review trực tiếp trên pull request, comment gợi ý).
- Có thể phát hiện **secrets hard-code** trong code (CodeGuru Reviewer Secrets Detector) và gợi ý chuyển sang Secrets Manager.

#### CodeGuru Profiler

- Giúp hiểu **hành vi runtime** của ứng dụng.
- Ví dụ: phát hiện ứng dụng đang **tiêu tốn CPU quá mức** cho tác vụ logging, tìm ra đoạn code tốn kém nhất.
- Tính năng:
  - Xác định và **loại bỏ code kém hiệu quả**.
  - **Cải thiện hiệu năng** (ví dụ giảm CPU utilization).
  - **Giảm chi phí compute**.
  - Cung cấp **heap summary** (xác định object nào chiếm nhiều bộ nhớ).
  - **Anomaly detection**.
- Hỗ trợ ứng dụng chạy trên **AWS hoặc on-premises**.
- **Overhead rất nhỏ** lên ứng dụng.
- Hiển thị kết quả dưới dạng **flame graph**.

#### CodeGuru – Agent Configuration (Profiler)

Các tham số cấu hình agent của Profiler (đề có thể hỏi):

| Tham số | Ý nghĩa |
|---|---|
| `MaxStackDepth` | Độ sâu tối đa của stack được profiler ghi lại. Ví dụ CodeGuru Profiler gặp method A → gọi B → gọi C → gọi D (độ sâu 4); nếu `MaxStackDepth = 2` thì chỉ đánh giá A và B |
| `MemoryUsageLimitPercent` | Phần trăm bộ nhớ tối đa profiler được dùng |
| `MinimumTimeForReportingInMilliseconds` | Thời gian tối thiểu giữa các lần gửi báo cáo (ms) |
| `ReportingIntervalInMilliseconds` | Chu kỳ gửi báo cáo profile (ms) |
| `SamplingIntervalInMilliseconds` | Chu kỳ lấy mẫu (sampling) profile (ms). **Giảm** giá trị → **tăng** tần suất lấy mẫu (chi tiết hơn nhưng overhead cao hơn) |

### Kiến thức thực tế

- **[Cập nhật 2026]** **CodeGuru Reviewer** đã **ngừng nhận liên kết repository mới** (từ cuối 2025); AWS khuyến nghị chuyển sang **Amazon Q Developer** (code review, `/review` trong IDE) hoặc **Amazon Inspector code security** (SAST, secrets, IaC scanning). Đề thi DVA-C02 vẫn có thể hỏi CodeGuru Reviewer.
- **CodeGuru Profiler** vẫn hoạt động nhưng ít được dùng mới; nhiều đội dùng **Application Signals (CloudWatch)**, X-Ray, hoặc công cụ continuous profiling (Datadog, Grafana Pyroscope) và OpenTelemetry.
- **CodeGuru Security** (bản preview/GA trước đó) cũng đã được gom vào Amazon Inspector.
- Nhớ phân biệt: **X-Ray** = tracing request đi qua nhiều dịch vụ (latency giữa các service); **CodeGuru Profiler** = profiling **bên trong code** (method nào tốn CPU/bộ nhớ).

### Ghi nhớ cho kỳ thi

- **CodeGuru Reviewer** = **static analysis**, review code **trước** khi deploy (Java, Python), tìm bug, lỗ hổng bảo mật, resource leak, secret hard-code.
- **CodeGuru Profiler** = **runtime**, tìm code tốn CPU/bộ nhớ, giảm chi phí, heap summary, chạy trên AWS và on-prem.
- Thuật ngữ trong đề: "machine learning-powered code review" → Reviewer; "expensive lines of code / CPU usage in production" → Profiler.
- Tham số agent: **`MaxStackDepth`**, `MemoryUsageLimitPercent`, `MinimumTimeForReportingInMilliseconds`, `ReportingIntervalInMilliseconds`, **`SamplingIntervalInMilliseconds`**.

---

## Câu hỏi ôn tập

*Nguồn: soạn lại theo chủ đề của AWS CICD Quiz (19 câu), bổ sung một số câu tự soạn dựa trên nội dung video. Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Bạn muốn tự động hoá toàn bộ quy trình: mỗi khi push code lên repository, code được build, test rồi deploy lên Elastic Beanstalk. Dịch vụ nào dùng để **điều phối** chuỗi này?

- A. CodeBuild
- B. CodeDeploy
- C. CodePipeline
- D. CodeArtifact

<details><summary>Đáp án</summary>

**C.** CodePipeline là orchestrator CI/CD, nối Source → Build → Test → Deploy và tích hợp trực tiếp với Elastic Beanstalk. CodeBuild chỉ build/test, CodeDeploy chỉ deploy, CodeArtifact quản lý package.
</details>

**Câu 2.** Phương thức xác thực nào **KHÔNG** được CodeCommit hỗ trợ?

- A. SSH keys
- B. HTTPS Git credentials
- C. HTTPS với AWS CLI credential helper
- D. WebSocket

<details><summary>Đáp án</summary>

**D.** CodeCommit hỗ trợ SSH keys, HTTPS Git credentials và HTTPS qua credential helper / `git-remote-codecommit`. Không có xác thực qua WebSocket.
</details>

**Câu 3.** Một developer ở account B cần truy cập repository CodeCommit nằm ở account A. Cách làm đúng và an toàn nhất?

- A. Chia sẻ SSH key của IAM user trong account A
- B. Tạo Git credentials trong account A và gửi cho developer
- C. Tạo IAM Role trong account A, developer dùng STS AssumeRole để truy cập
- D. Đặt repository ở chế độ public

<details><summary>Đáp án</summary>

**C.** Truy cập cross-account luôn dùng IAM Role + `sts:AssumeRole`. Không bao giờ chia sẻ SSH key hay Git credentials; CodeCommit không có repo public.
</details>

**Câu 4.** Các stage trong CodePipeline trao đổi dữ liệu (artifact) với nhau qua đâu?

- A. Amazon EFS
- B. Amazon S3
- C. Amazon EBS
- D. CodeCommit

<details><summary>Đáp án</summary>

**B.** Mỗi stage tạo output artifact được CodePipeline lưu vào S3 artifact store và chuyển cho stage sau làm input artifact.
</details>

**Câu 5.** Bạn muốn nhận email mỗi khi pipeline CodePipeline chuyển sang trạng thái FAILED. Cách nào phù hợp?

- A. Bật CloudTrail và đọc log hằng ngày
- B. Tạo CloudWatch Events/EventBridge rule cho sự kiện thay đổi trạng thái pipeline, target là SNS topic
- C. Thêm stage Manual approval
- D. Dùng AWS Config rule

<details><summary>Đáp án</summary>

**B.** CodePipeline phát sự kiện "Pipeline Execution State Change" tới EventBridge; rule lọc `state: FAILED` rồi gửi tới SNS (email). CloudTrail chỉ audit API call.
</details>

**Câu 6.** Pipeline của bạn đang hoạt động tốt, nhưng sau khi một developer push code thành công lên CodeCommit thì pipeline bị fail. Nguyên nhân khả dĩ nhất?

- A. CodeCommit bị lỗi lưu trữ
- B. Stage CodeBuild fail do test không pass
- C. CodePipeline service role bị xoá
- D. S3 artifact bucket đầy

<details><summary>Đáp án</summary>

**B.** Code push thành công nghĩa là source không lỗi; trường hợp phổ biến nhất là code mới làm test trong stage CodeBuild fail, pipeline dừng để không deploy code lỗi.
</details>

**Câu 7.** Công ty muốn mỗi khi có commit vào CodeCommit thì tự động phân tích để phát hiện AWS credentials bị commit nhầm. Giải pháp nào phù hợp?

- A. Notification rule gửi về Slack
- B. CodeCommit Trigger tới Lambda function để quét commit
- C. Bật KMS encryption cho repository
- D. Dùng IAM policy chặn push

<details><summary>Đáp án</summary>

**B.** Trigger (sự kiện push) có thể gọi Lambda (hoặc SNS) để chạy phân tích code mới, ví dụ tìm secret. Notification rule chỉ dùng để thông báo; KMS và IAM không phân tích nội dung commit.
</details>

**Câu 8.** File cấu hình hướng dẫn CodeBuild phải tên là gì và đặt ở đâu?

- A. `appspec.yml`, ở root của source code
- B. `buildspec.yml`, ở root của source code
- C. `buildspec.yml`, trong thư mục `.aws/`
- D. `codebuild.json`, trong S3 bucket

<details><summary>Đáp án</summary>

**B.** CodeBuild đọc `buildspec.yml` ở root của source (có thể ghi đè trong cấu hình project). `appspec.yml` là của CodeDeploy.
</details>

**Câu 9.** Build trong CodeBuild cần mật khẩu database. Cách an toàn nhất để cung cấp cho build?

- A. Hard-code trong `buildspec.yml` ở mục `env.variables`
- B. Lưu trong file `.env` commit lên repo
- C. Tham chiếu SSM Parameter Store (SecureString) hoặc Secrets Manager trong `env.parameter-store` / `env.secrets-manager`
- D. Truyền qua tên build project

<details><summary>Đáp án</summary>

**C.** `buildspec.yml` hỗ trợ lấy giá trị từ Parameter Store và Secrets Manager lúc chạy; service role của CodeBuild cần quyền đọc tương ứng. Plaintext variables lộ trong console/log.
</details>

**Câu 10.** Build CodeBuild mất nhiều thời gian vì mỗi lần đều tải lại toàn bộ dependency. Cách cải thiện?

- A. Tăng timeout của build
- B. Cấu hình cache dependency lên S3 trong `buildspec.yml`/build project
- C. Chạy build trong VPC
- D. Bật CloudWatch Logs

<details><summary>Đáp án</summary>

**B.** Mục `cache` (S3 hoặc local cache) giữ lại dependency giữa các lần build, giảm thời gian tải.
</details>

**Câu 11.** Bạn cần troubleshoot một lỗi CodeBuild mà log trên CloudWatch không đủ thông tin. Bạn nên làm gì?

- A. SSH vào container CodeBuild
- B. Chạy CodeBuild locally bằng CodeBuild Agent và Docker
- C. Bật X-Ray cho CodeBuild
- D. Mở support case

<details><summary>Đáp án</summary>

**B.** CodeBuild có thể chạy trên máy local qua CodeBuild Agent (cần Docker) để tái hiện và debug chi tiết. Không SSH được vào container CodeBuild như server bình thường.
</details>

**Câu 12.** Bước test trong CodeBuild cần kết nối tới RDS database nằm trong private subnet. Build hiện bị timeout khi kết nối. Cách khắc phục?

- A. Đặt RDS ở chế độ public
- B. Cấu hình build project với VPC ID, subnet ID và security group ID
- C. Tăng compute type của build
- D. Thêm IAM permission `rds:*` vào service role

<details><summary>Đáp án</summary>

**B.** Mặc định CodeBuild chạy ngoài VPC của bạn nên không truy cập được tài nguyên private. Cấu hình VPC cho build project (và security group của RDS cho phép) sẽ giải quyết. IAM không mở được kết nối mạng.
</details>

**Câu 13.** Hook nào trong `appspec.yml` (EC2) dùng để kiểm tra ứng dụng chạy đúng sau khi deploy?

- A. `BeforeInstall`
- B. `AfterInstall`
- C. `ApplicationStart`
- D. `ValidateService`

<details><summary>Đáp án</summary>

**D.** `ValidateService` là hook cuối cùng của in-place deployment, dùng để xác minh deployment thành công (health check).
</details>

**Câu 14.** Điều kiện tiên quyết để CodeDeploy deploy được lên EC2 instance là gì?

- A. Instance phải nằm trong public subnet
- B. CodeDeploy Agent chạy trên instance và instance profile có quyền đọc S3 (nơi chứa revision)
- C. Instance phải chạy Amazon Linux
- D. Instance phải được đăng ký vào Elastic Beanstalk

<details><summary>Đáp án</summary>

**B.** CodeDeploy Agent phải được cài và chạy (có thể cài tự động bằng Systems Manager), và EC2 cần IAM instance profile đủ quyền lấy bundle từ S3. Agent hỗ trợ cả Linux và Windows, cả on-premises.
</details>

**Câu 15.** Bạn muốn deploy Lambda function phiên bản mới: chuyển 10% traffic trước, nếu ổn sau 5 phút thì chuyển toàn bộ 100%. Chọn deployment configuration nào?

- A. `LambdaLinear10PercentEvery1Minute`
- B. `LambdaCanary10Percent5Minutes`
- C. `LambdaAllAtOnce`
- D. `CodeDeployDefault.HalfAtATime`

<details><summary>Đáp án</summary>

**B.** Canary chuyển một phần (10%) trước, chờ khoảng thời gian rồi chuyển phần còn lại cùng lúc. Linear tăng đều 10% mỗi chu kỳ; HalfAtATime chỉ dành cho EC2/on-prem.
</details>

**Câu 16.** Kiểu deployment nào **KHÔNG** khả dụng khi dùng CodeDeploy cho Amazon ECS?

- A. Blue/Green với canary traffic shifting
- B. Blue/Green với linear traffic shifting
- C. In-place
- D. Blue/Green AllAtOnce

<details><summary>Đáp án</summary>

**C.** Với ECS (và Lambda), CodeDeploy chỉ hỗ trợ Blue/Green (Canary, Linear, AllAtOnce). In-place chỉ dành cho EC2/on-premises.
</details>

**Câu 17.** Một deployment CodeDeploy bị fail và rollback tự động được bật. Điều gì xảy ra?

- A. CodeDeploy khôi phục snapshot EBS của instance
- B. CodeDeploy redeploy revision tốt gần nhất dưới dạng một deployment mới với deployment ID mới
- C. CodeDeploy giữ deployment ID cũ và đánh dấu "restored"
- D. Instance bị terminate và ASG tạo instance mới

<details><summary>Đáp án</summary>

**B.** Rollback trong CodeDeploy là deploy lại revision cuối cùng đã thành công, tạo deployment mới (ID mới), không phải restore. Rollback có thể kích hoạt khi deployment fail hoặc khi CloudWatch Alarm đạt ngưỡng.
</details>

**Câu 18.** Dùng CodeDeploy với Auto Scaling Group theo kiểu **in-place**. Khi ASG scale out tạo instance mới thì sao?

- A. Instance mới chạy AMI gốc, không có code mới cho tới lần deploy sau
- B. Instance mới tự động nhận bản deploy mới nhất
- C. CodeDeploy tạo ASG mới
- D. Deployment bị huỷ

<details><summary>Đáp án</summary>

**B.** Với in-place, CodeDeploy gắn lifecycle hook vào ASG nên instance mới được tự động deploy revision mới nhất. Tạo ASG mới là hành vi của Blue/Green (bắt buộc có ELB).
</details>

**Câu 19.** Đội của bạn muốn lưu các npm/pip package nội bộ, đồng thời proxy và cache package từ npmjs/PyPI, chia sẻ cho nhiều account. Dịch vụ nào phù hợp?

- A. Amazon ECR
- B. AWS CodeArtifact
- C. Amazon S3 static website
- D. AWS CodeCommit

<details><summary>Đáp án</summary>

**B.** CodeArtifact quản lý package (npm, pip, Maven, NuGet…), proxy/cache public repo qua external connection, chia sẻ cross-account bằng resource/domain policy. ECR dành cho container image.
</details>

**Câu 20.** Một CodeArtifact repository có thể có tối đa bao nhiêu **external connection** và bao nhiêu **upstream repository**?

- A. 1 external connection, 10 upstream
- B. 10 external connection, 1 upstream
- C. Không giới hạn cả hai
- D. 5 external connection, 5 upstream

<details><summary>Đáp án</summary>

**A.** Mỗi repository chỉ có 1 external connection; muốn nhiều public repo thì tạo nhiều repository và nối chúng làm upstream (tối đa 10 upstream mỗi repository).
</details>

**Câu 21.** Bạn muốn tự động chạy lại pipeline build/deploy mỗi khi một package dependency trong CodeArtifact có version mới. Cách nào phù hợp?

- A. Cron job trên EC2 poll CodeArtifact
- B. EventBridge rule bắt sự kiện thay đổi package của CodeArtifact, target là CodePipeline
- C. CodeCommit trigger
- D. CloudTrail data events

<details><summary>Đáp án</summary>

**B.** CodeArtifact phát sự kiện tới EventBridge khi package được tạo/sửa/xoá; EventBridge có thể start CodePipeline, Lambda, Step Functions, SNS, SQS.
</details>

**Câu 22.** Công ty muốn phát hiện các đoạn code tốn CPU nhất trong ứng dụng Java **đang chạy production** để giảm chi phí compute. Dịch vụ nào phù hợp?

- A. CodeGuru Reviewer
- B. CodeGuru Profiler
- C. AWS X-Ray
- D. Amazon Inspector

<details><summary>Đáp án</summary>

**B.** CodeGuru Profiler phân tích hành vi runtime, tìm method tốn CPU/bộ nhớ, đưa gợi ý giảm chi phí (flame graph, heap summary). Reviewer là static analysis trước khi deploy; X-Ray là distributed tracing.
</details>

**Câu 23.** Tham số cấu hình agent CodeGuru Profiler nào giới hạn số tầng method call được profiler ghi nhận (ví dụ A → B → C → D chỉ đánh giá A và B)?

- A. `SamplingIntervalInMilliseconds`
- B. `MemoryUsageLimitPercent`
- C. `MaxStackDepth`
- D. `ReportingIntervalInMilliseconds`

<details><summary>Đáp án</summary>

**C.** `MaxStackDepth` là độ sâu stack tối đa được profile. `SamplingIntervalInMilliseconds` điều khiển tần suất lấy mẫu, `MemoryUsageLimitPercent` giới hạn bộ nhớ profiler dùng, `ReportingIntervalInMilliseconds` là chu kỳ gửi báo cáo.
</details>

---

[← Chương 23](ch23-aws-serverless-api-gateway.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Chương 25 →](ch25-aws-serverless-sam-serverless-applicat.md)
