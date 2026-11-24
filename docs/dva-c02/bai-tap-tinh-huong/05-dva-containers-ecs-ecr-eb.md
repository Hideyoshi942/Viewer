# Bài tập tình huống — Chủ đề 5: Containers & PaaS — ECS, ECR, Fargate & Elastic Beanstalk

> Docker trên AWS, ECS Task Role vs Execution Role, Fargate Serverless Containers, ECR và Elastic Beanstalk Deployment Policies.
> **Số câu hỏi:** 22 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án & Giải thích chi tiết**.

---

### Câu 1 `medium`

A developer is deploying a containerized web service on Amazon ECS using the EC2 launch type behind an Application Load Balancer (ALB). The team wants to run multiple tasks of the same container (which listens on container port 8080) on a single EC2 instance without port conflicts. How should the developer configure the ECS Task Definition?

- **A.** Use the `host` network mode and explicitly map both `hostPort` and `containerPort` to `8080` in the task definition.
- **B.** Use the `bridge` network mode and set `hostPort` to `0` while keeping `containerPort` as `8080` in `portMappings`.
- **C.** Use the `bridge` network mode and explicitly pin both `hostPort` and `containerPort` to `8080` in `portMappings`.
- **D.** Replace the Application Load Balancer (ALB) with a Classic Load Balancer (CLB) to enable static port forwarding across EC2 instances.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

**ECS Dynamic Port Mapping** (chỉ áp dụng cho **EC2 launch type** với `bridge` mode):
- Đặt **`hostPort: 0`** và `containerPort: 8080`.
- **ALB** (hoặc NLB) tự động định tuyến traffic tới đúng ephemeral port trên từng EC2 instance.
- Lưu ý: Security Group của EC2 instance phải mở dải ephemeral ports (`32768–65535` hoặc `49153–65535`) cho traffic từ Security Group của ALB.

- **A:** Sai vì `host` network mode gắn trực tiếp container vào port 8080 của EC2 host, nên chỉ chạy được tối đa 1 task trên mỗi EC2 instance.
- **B (Đúng):** Đúng! Khi dùng `bridge` network mode trên ECS EC2 và đặt `hostPort: 0`, Docker/ECS tự động gán một ephemeral port ngẫu nhiên trên host (dynamic port mapping) và tự đăng ký port đó vào Target Group của ALB.
- **C:** Sai vì cố định `hostPort: 8080` sẽ gây xung đột cổng khi chạy task thứ 2 trên cùng một EC2 instance.
- **D:** Sai vì Classic Load Balancer không hỗ trợ Dynamic Port Mapping trên ECS; chỉ ALB và NLB mới hỗ trợ.

</details>

### Câu 2 `medium`

A company runs a production web application on AWS Elastic Beanstalk with 6 EC2 instances. During deployments, the team wants to ensure that: (1) existing instances are NOT modified in place, (2) full production capacity (6 instances) is maintained throughout the deployment, and (3) if the new version fails health checks, rollback is fast without redeploying old code to existing instances. Which Elastic Beanstalk deployment policy should be used?

- **A.** `RollingWithAdditionalBatch`
- **B.** `Immutable`
- **C.** `AllAtOnce`
- **D.** `Rolling`

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

So sánh các **Elastic Beanstalk Deployment Policies**:
- **`AllAtOnce`**: Nhanh nhất, có downtime.
- **`Rolling`**: Không downtime, nhưng giảm capacity theo batch.
- **`RollingWithAdditionalBatch`**: Giữ 100% capacity, cập nhật dần in-place.
- **`Immutable`**: Tạo **ASG mới** với instance mới hoàn toàn, giữ 100% capacity, rollback sạch và nhanh nhất.
- **`TrafficSplitting`**: Canary testing (chia % traffic sang bản mới).

- **A:** Sai vì `RollingWithAdditionalBatch` giữ được 100% capacity nhưng vẫn cập nhật đè lên các instance cũ (in-place) ở các batch tiếp theo, không cô lập hoàn toàn như `Immutable`.
- **B (Đúng):** Đúng! Chính sách **Immutable** tạo một Auto Scaling Group tạm thời với các EC2 instance mới hoàn toàn (giữ nguyên 100% capacity cũ), kiểm tra health check đạt mới chuyển sang ASG chính và xóa instance cũ; nếu lỗi chỉ cần xóa ASG tạm nên rollback cực nhanh và sạch.
- **C:** Sai vì `AllAtOnce` deploy đè lên toàn bộ instance cùng lúc, gây downtime trong lúc cập nhật.
- **D:** Sai vì `Rolling` gỡ từng batch instance ra để cập nhật tại chỗ, làm giảm capacity khả dụng trong quá trình deploy và rollback chậm.

</details>

### Câu 3 `medium`

A developer is migrating an AWS Elastic Beanstalk application from Amazon Linux 1 to Amazon Linux 2 (AL2) / AL2023. The application previously used `.ebextensions` `container_commands` to configure Nginx reverse proxy settings and run custom startup scripts. What is the recommended way to customize Nginx and run platform hooks on AL2/AL2023?

- **A.** SSH into each Elastic Beanstalk EC2 instance after deployment and edit `/etc/nginx/nginx.conf` manually.
- **B.** Configure custom Nginx proxy rules and deployment hook scripts inside an AWS CodeDeploy `appspec.yml` file.
- **C.** Place all custom Nginx configuration files inside `/tmp/nginx/` via a `Dockerfile` and reference them from `.ebextensions`.
- **D.** Place custom Nginx `.conf` files in `.platform/nginx/conf.d/` and custom deployment scripts in `.platform/hooks/` (with executable permissions).

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Trên **Elastic Beanstalk Amazon Linux 2 / AL2023**:
- **`.ebextensions/*.config`**: Vẫn dùng để tạo AWS resources (SQS, DynamoDB) và option settings.
- **`.platform/nginx/conf.d/`**: Cấu hình mở rộng Nginx.
- **`.platform/hooks/`** (`prebuild`, `predeploy`, `postdeploy`): Chạy script tùy chỉnh.
- **`Procfile` / `Buildfile`**: Chỉ định lệnh khởi chạy và build ứng dụng.

- **A:** Sai vì chỉnh tay qua SSH sẽ mất sạch khi Auto Scaling tạo instance mới.
- **B:** Sai vì `appspec.yml` là file cấu hình của AWS CodeDeploy, không phải Elastic Beanstalk.
- **C:** Sai vì đây là ứng dụng Elastic Beanstalk nền tảng chuẩn (không phải Docker), và `/tmp/nginx/` không được EB proxy tự nạp.
- **D (Đúng):** Đúng! Trên Elastic Beanstalk **Amazon Linux 2 / AL2023**, AWS khuyến nghị dùng thư mục **`.platform/nginx/`** để cấu hình proxy và **`.platform/hooks/`** (`prebuild`, `predeploy`, `postdeploy`) thay cho các cấu hình Nginx/script cũ trong `.ebextensions`.

</details>

### Câu 4 `medium` *(Chọn nhiều đáp án)*

A team runs a containerized content management service on Amazon ECS using the AWS Fargate launch type. Multiple Fargate tasks across different Availability Zones must read and write shared uploaded assets concurrently on a persistent POSIX filesystem. Additionally, a single task needs 50 GB of temporary scratch space for video transcoding. Which TWO configurations meet these requirements? (Choose two.)

- **A.** Use `dockerVolumes` with `host.sourcePath` on AWS Fargate tasks to share persistent asset files across multiple Availability Zones.
- **B.** Configure `ephemeralStorage.sizeInGiB` to `50` (up to 200 GiB) in the Fargate Task Definition for the temporary scratch space.
- **C.** Attach an Amazon EBS `gp3` volume directly to multiple Fargate tasks simultaneously across multiple Availability Zones.
- **D.** Enable Amazon S3 Object Lock on the Fargate Task Definition to mount an S3 bucket as a shared POSIX filesystem.
- **E.** Mount an Amazon EFS filesystem in the ECS Task Definition (`efsVolumeConfiguration`) for the shared persistent assets.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**, **E**

Lưu trữ trên **ECS Fargate**:
- **Dữ liệu tạm thời riêng cho 1 task**: **`ephemeralStorage`** (mặc định 20 GiB, mở rộng tối đa **200 GiB**).
- **Dữ liệu bền vững dùng chung nhiều tasks / nhiều AZs**: **Amazon EFS** (`efsVolumeConfiguration`).

- **A:** Sai vì Bind Mounts (`host.sourcePath`) trên Fargate chỉ tồn tại cục bộ trong vòng đời của 1 task, không chia sẻ được giữa các task khác nhau.
- **B (Đúng):** Đúng! Mặc định Fargate có 20 GiB ephemeral storage, và có thể cấu hình `ephemeralStorage.sizeInGiB` lên tới **200 GiB** cho dữ liệu tạm thời của từng task.
- **C:** Sai vì EBS gắn theo từng AZ (không dùng chung cross-AZ cho nhiều Fargate tasks như EFS).
- **D:** Sai vì S3 Object Lock là tính năng của S3 bucket, không phải filesystem cho Fargate.
- **E (Đúng):** Đúng! **Amazon EFS** hỗ trợ gắn trực tiếp vào **ECS Fargate** (`efsVolumeConfiguration`), cung cấp hệ thống file POSIX bền vững cho phép nhiều task ở nhiều Availability Zones đọc/ghi đồng thời.

</details>

### Câu 5 `medium`

A DevOps team pushes Docker container images to Amazon ECR on every CI build. Over time, the ECR repository accumulates thousands of old untagged images, increasing storage costs. Additionally, the team wants to prevent anyone from accidentally overwriting an existing release tag like `v1.4.0` and automatically scan newly pushed images for OS vulnerabilities. Which combination of ECR features should be enabled?

- **A.** Enable S3 Object Lock on the underlying Amazon ECR storage and run `docker rmi` manually every week to purge old untagged container images from the private ECR registry.
- **B.** Configure an ECR Lifecycle Policy to expire untagged images, enable Image Tag Mutability: Immutable, and enable Scan on push (Basic or Enhanced scanning).
- **C.** Move all container images to Amazon ECR Public Gallery to enable automated vulnerability scanning and cleanup.
- **D.** Set Image Tag Mutability to `Mutable` and disable ECR Lifecycle Policies so tags can be overwritten safely.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

3 tính năng quản trị **Amazon ECR** hay thi:
- **Lifecycle Policy**: Tự động xóa image untagged hoặc chỉ giữ lại N image gần nhất.
- **Tag Immutability (`IMMUTABLE`)**: Ngăn ghi đè tag đã tồn tại.
- **Image Scanning** (Basic / Enhanced with Amazon Inspector): Quét lỗ hổng CVE tự động khi push.

- **A:** Sai vì ECR không để người dùng thao tác trực tiếp S3 Object Lock, và chạy `docker rmi` trên máy local không xóa image trên ECR.
- **B (Đúng):** Đúng! **ECR Lifecycle Policy** tự động dọn dẹp image cũ/untagged; **Immutable Tags** chặn ghi đè tag release như `v1.4.0`; và **Scan on push** tự động quét lỗ hổng bảo mật ngay khi push image.
- **C:** Sai vì đưa image nội bộ lên Public Gallery làm lộ mã nguồn.
- **D:** Sai vì `Mutable` cho phép ghi đè tag `v1.4.0`, còn tắt Lifecycle Policy sẽ không dọn được image rác.

</details>

### Câu 6 `easy`

A team manages multiple AWS Elastic Beanstalk environments (`dev`, `staging`, `prod`). After tuning the `staging` environment's Auto Scaling, load balancer, and instance settings via the console, the team wants to capture those exact environment settings so they can quickly recreate identical environments or apply them to `prod` later. Which Elastic Beanstalk feature should they use?

- **A.** Export the EC2 instance's `/tmp` configuration directory and upload it to the new `prod` environment.
- **B.** Use `eb ssh` to copy `/etc/hosts` and environment files from `staging` to `prod`.
- **C.** Save the environment settings as an Elastic Beanstalk Saved Configuration (`eb config save`).
- **D.** Run `eb swap` between the `staging` and `prod` environments to transfer all configuration settings.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Các lệnh **EB CLI** quan trọng:
- `eb init` / `eb create`: Khởi tạo và tạo môi trường.
- `eb deploy`: Đẩy phiên bản ứng dụng mới.
- **`eb config save` / `eb config put`**: Lưu và tái sử dụng **Saved Configurations**.
- **`eb swap`**: Hoán đổi CNAME URL trong Blue/Green deployment.

- **A:** Sai vì `/tmp` không chứa cấu hình hạ tầng ASG/ALB của Elastic Beanstalk.
- **B:** Sai vì `/etc/hosts` không liên quan đến cấu hình môi trường Elastic Beanstalk.
- **C (Đúng):** Đúng! **Saved Configurations** lưu toàn bộ cấu hình của một môi trường Elastic Beanstalk (dưới dạng YAML lưu trên S3 bucket của EB) để tái sử dụng khi tạo hoặc cập nhật các môi trường khác.
- **D:** Sai vì `eb swap` dùng để tráo đổi CNAME/URL giữa hai môi trường đang chạy (Blue/Green), không sao chép template cấu hình.

</details>

### Câu 7 `medium` *(Chọn nhiều đáp án)*

An Amazon ECS service using the AWS Fargate launch type in private VPC subnets fails to start new tasks. The ECS service events show: `ResourceInitializationError: unable to pull secrets or registry auth: execution resource retrieval failed: unable to retrieve ecr registry auth`. Which TWO missing configurations are the most likely causes? (Choose two.)

- **A.** The Application Load Balancer is missing a `ValidateService` CodeDeploy lifecycle hook.
- **B.** The ECS Task Role (`taskRoleArn`) lacks `s3:PutObject` permissions to push container logs.
- **C.** The Fargate Task Definition has `networkMode` set to `awsvpc` instead of `bridge` mode.
- **D.** The private subnet lacks outbound connectivity to Amazon ECR (missing either a NAT Gateway or Interface VPC Endpoints for `ecr.api`, `ecr.dkr`, and an S3 Gateway Endpoint).
- **E.** The ECS Task Execution Role (`executionRoleArn`) is missing `ecr:GetAuthorizationToken`, `ecr:BatchGetImage`, and `ecr:GetDownloadUrlForLayer` permissions.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**, **E**

Gỡ lỗi **`ResourceInitializationError` / `CannotPullContainerError`** trên **ECS Fargate Private Subnet**:
1. Kiểm tra **Mạng**: Cần **NAT Gateway** hoặc **VPC Endpoints** (`ecr.api` + `ecr.dkr` + **`s3` Gateway Endpoint** + `logs` nếu ghi CloudWatch Logs).
2. Kiểm tra **IAM**: **`executionRoleArn`** phải có `AmazonECSTaskExecutionRolePolicy`.

- **A:** Sai vì `ValidateService` là hook của CodeDeploy EC2, không liên quan đến lỗi kéo image ECR của Fargate.
- **B:** Sai vì `taskRoleArn` chỉ dùng khi container đã chạy lên; lỗi kéo image xảy ra ở giai đoạn khởi tạo dùng `executionRoleArn`.
- **C:** Sai vì `awsvpc` là `networkMode` bắt buộc và duy nhất được hỗ trợ trên AWS Fargate.
- **D (Đúng):** Đúng! Fargate task trong private subnet (khi `assignPublicIp: DISABLED`) cần đường mạng ra **ECR** và **S3** (nơi lưu image layers) thông qua **NAT Gateway** hoặc bộ **VPC Endpoints (`ecr.api`, `ecr.dkr`, và `s3` Gateway Endpoint)**.
- **E (Đúng):** Đúng! Lỗi `unable to retrieve ecr registry auth` cũng xảy ra nếu `executionRoleArn` thiếu quyền kéo image từ ECR (thường dùng managed policy `AmazonECSTaskExecutionRolePolicy`).

</details>

### Câu 8 `medium`

A developer has deployed an AWS Lambda function using a container image (Docker) stored in Amazon ECR because the application requires 1.5 GB of custom C++ binaries and machine learning libraries. When testing, the developer updates the code and wants to verify the container image size limit for AWS Lambda. What is the maximum container image size supported by AWS Lambda?

- **A.** 512 MB
- **B.** 50 MB
- **C.** 250 MB
- **D.** 10 GB

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Tổng hợp các **giới hạn kích thước của AWS Lambda**:
- ZIP upload trực tiếp: **50 MB** (nén).
- ZIP upload qua S3 + Layers (giải nén): **250 MB**.
- **Container Image (ECR)**: **10 GB**.
- `/tmp` Ephemeral Storage: **512 MB** mặc định, mở rộng tối đa **10,240 MB (10 GB)**.

- **A:** Sai vì 512 MB là dung lượng `/tmp` ephemeral storage mặc định của Lambda.
- **B:** Sai vì 50 MB là giới hạn upload trực tiếp file ZIP (nén) qua Console/API (lớn hơn 50 MB nén thì upload qua S3).
- **C:** Sai vì 250 MB là giới hạn kích thước giải nén của gói **ZIP + Layers**, không phải Container Image.
- **D (Đúng):** Đúng! AWS Lambda hỗ trợ đóng gói dưới dạng **Container Image** (lưu trên Amazon ECR) với kích thước tối đa lên tới **10 GB** (lớn hơn rất nhiều so với giới hạn 250 MB giải nén của file ZIP).

</details>

### Câu 9 `medium`

An Amazon ECS service running on EC2 instances uses an Application Load Balancer (ALB). During deployments or scale-in events, active user requests are occasionally dropped with `502` errors because ECS kills the container before in-flight HTTP requests finish. Which TWO settings work together to allow in-flight requests to complete gracefully?

- **A.** Set Deregistration Delay to `0` seconds on the ALB Target Group so draining connections are closed immediately during rolling deployments.
- **B.** Disable ALB Target Group Health Checks during deployments so draining ECS tasks continue receiving new incoming requests.
- **C.** Set `essential: false` on the primary application container in the ECS Task Definition so it stops without waiting for connections.
- **D.** Configure Deregistration Delay (e.g., 30s) on the ALB Target Group and set `stopTimeout` on the ECS container (handling `SIGTERM`).

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Graceful Shutdown trên **ECS + ALB**:
1. ALB Target Group: **Deregistration Delay** (không gửi request mới, giữ kết nối cũ).
2. ECS Container: Lắng nghe **`SIGTERM`**, hoàn tất request rồi thoát trước khi hết **`stopTimeout`** (trước khi nhận `SIGKILL`).

- **A:** Sai vì đặt Deregistration Delay = 0 sẽ ngắt ngay lập tức mọi kết nối đang mở.
- **B:** Sai vì không thể tắt hoàn toàn health check trên ALB Target Group và việc đó không giúp graceful shutdown.
- **C:** Sai vì `essential: false` chỉ làm ECS không dừng cả task nếu container đó crash, không giúp xử lý graceful shutdown.
- **D (Đúng):** Đúng! Khi dừng task, ALB ngừng gửi request mới và chờ hết **Deregistration Delay** (mặc định 300s) cho các request đang chạy hoàn tất; đồng thời ECS gửi **`SIGTERM`** tới container và chờ tối đa **`stopTimeout`** (mặc định 30s, tối đa 120s) trước khi gửi `SIGKILL`.

</details>

### Câu 10 `medium`

A company runs a web application on AWS Elastic Beanstalk using a single-instance environment for development and a load-balanced auto-scaling environment for production. The team needs to run a cron job that executes a cleanup script once every hour on ONLY ONE instance in the production environment (not on every EC2 instance in the Auto Scaling group). How should this be configured in `.ebextensions`?

- **A.** Deploy the daily cleanup script inside the ALB Target Group health check path so it triggers periodically across all Elastic Beanstalk instances.
- **B.** Use `leader_only: true` on `container_commands` (or an Elastic Beanstalk Worker Environment with `cron.yaml`) to run on one instance.
- **C.** Set `IgnoreErrors: true` in `.ebextensions` so duplicate cron execution failures across instances are suppressed.
- **D.** Place the cron setup script inside the `.ebextensions` `commands` section without specifying `leader_only`.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Trong **Elastic Beanstalk `.ebextensions`**:
- `commands`: Chạy **trước** khi giải nén ứng dụng.
- `container_commands`: Chạy **sau** khi giải nén ứng dụng (có hỗ trợ **`leader_only: true`** để chỉ chạy trên 1 instance — ví dụ chạy DB migration).
- **Worker Environment + `cron.yaml`**: Chạy cron job định kỳ qua SQS queue một cách tin cậy.

- **A:** Sai vì health check chạy mỗi vài chục giây trên tất cả instance.
- **B (Đúng):** Đúng! Trong `.ebextensions` `container_commands`, thuộc tính **`leader_only: true`** đảm bảo lệnh chỉ chạy trên 1 instance đại diện (leader). Đối với tác vụ cron định kỳ thực thụ, Elastic Beanstalk **Worker Environment** với file `cron.yaml` là giải pháp chuẩn hơn cả.
- **C:** Sai vì `IgnoreErrors` chỉ bỏ qua mã thoát lỗi của lệnh, không giới hạn chạy trên 1 instance.
- **D:** Sai vì `commands` chạy trên **mọi EC2 instance** (và `commands` cũng chạy trước khi code ứng dụng được giải nén).

</details>

### Câu 11 `easy`

A developer is building a Docker container image for an application that will run on Amazon ECS with AWS Fargate. The developer wants the container to run with minimal OS overhead, avoid running as the `root` user, and keep the image size as small as possible for fast task startup. Which Dockerfile best practices should be applied?

- **A.** Use multi-stage builds with a minimal base image (e.g., `alpine` or `distroless`), combine `RUN` layers, and specify a non-root `USER` instruction.
- **B.** Install the AWS X-Ray Daemon, CloudWatch Agent, and MySQL database all inside the single application container.
- **C.** Use the full `ubuntu:latest` image with `USER root` and keep all compilers, package managers, and build tools installed inside the final Docker container image.
- **D.** Hardcode AWS IAM Access Keys using `ENV AWS_ACCESS_KEY_ID` inside the Dockerfile to skip IAM Task Role lookups.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Best practices **Docker / ECS**:
- **Multi-stage build** + base image nhỏ (`alpine`/`slim`) -> giảm thời gian pull image trên Fargate.
- Chạy dưới quyền **non-root `USER`**.
- Không nhúng secrets/credentials vào image; dùng **ECS Task Role** và **Secrets Manager**.

- **A (Đúng):** Đúng! **Multi-stage builds** loại bỏ compiler/dev dependencies khỏi image cuối cùng giúp image cực nhẹ (Fargate pull image nhanh hơn), và khai báo **`USER`** non-root tăng cường bảo mật container.
- **B:** Sai vì vi phạm nguyên tắc 1 process/concern mỗi container (nên tách X-Ray thành sidecar container trong cùng Task Definition và dùng RDS cho database).
- **C:** Sai vì image nặng làm chậm thời gian khởi động Fargate task và chạy bằng `root` kém an toàn.
- **D:** Sai vì tuyệt đối không đưa IAM Access Keys vào Dockerfile; hãy dùng ECS Task Role (`taskRoleArn`).

</details>

### Câu 12 `medium`

A developer uses AWS Elastic Beanstalk to run a Python Flask application. By default, Elastic Beanstalk on Amazon Linux 2 looks for `application.py` with a `WSGIPath` of `application`. However, the team's entry point is `app.py` running via Gunicorn on port 8000 with 4 worker processes. How should the developer customize the startup command on AL2/AL2023?

- **A.** Create an `appspec.yml` file in `.ebextensions/` to override the default Elastic Beanstalk WSGI process with Gunicorn workers.
- **B.** Set `Handler: app.app` in `template.yaml` and configure Gunicorn workers via Elastic Beanstalk tags.
- **C.** Add a `Procfile` at the root of the application source bundle containing `web: gunicorn --bind :8000 --workers 4 app:app`.
- **D.** Add a `buildspec.yml` file at the root of the source bundle specifying the `gunicorn` startup command.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

File cấu hình đặc trưng trên **Elastic Beanstalk**:
- **`Procfile`**: Định nghĩa lệnh khởi chạy ứng dụng (`web: ...`).
- **`Buildfile`**: Lệnh biên dịch trước khi chạy.
- **`.ebextensions/*.config`**: Tạo AWS resources & option settings.
- **`.platform/hooks/` & `.platform/nginx/`**: Hooks & Nginx trên AL2/AL2023.

- **A:** Sai vì `appspec.yml` thuộc về AWS CodeDeploy.
- **B:** Sai vì `template.yaml` với `Handler` là cấu hình của AWS SAM / Lambda.
- **C (Đúng):** Đúng! Trên Elastic Beanstalk AL2/AL2023, file **`Procfile`** ở thư mục gốc cho phép chỉ định chính xác lệnh khởi chạy process `web:` (ví dụ `gunicorn` với số workers và file `app:app` tùy chỉnh).
- **D:** Sai vì `buildspec.yml` là file cấu hình build của AWS CodeBuild, không phải Elastic Beanstalk.

</details>

### Câu 13 `medium` *(Chọn nhiều đáp án)*

A DevOps team builds and deploys a Python application on AWS Elastic Beanstalk. During a deployment, the team wants to ensure that: (1) a database migration script runs ONLY once per deployment (not on every EC2 instance), and (2) no capacity is lost during deployment. Which TWO configurations meet these requirements? (Choose two.)

- **A.** Put the database migration script in `.ebextensions` `commands` without `leader_only: true` on all EC2 instances.
- **B.** Set the Elastic Beanstalk Deployment Policy to `Rolling` with batch size 50%.
- **C.** Set the Elastic Beanstalk Deployment Policy to `AllAtOnce` so all instances update simultaneously.
- **D.** Run the database migration script in `.ebextensions` under `container_commands` with `leader_only: true`.
- **E.** Set the Elastic Beanstalk Deployment Policy to `Immutable` or `RollingWithAdditionalBatch` (or Blue/Green).

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**, **E**

Ghi nhớ: Chỉ `Immutable`, `RollingWithAdditionalBatch`, `TrafficSplitting` và `Blue/Green` là giữ được **100% capacity** trên Elastic Beanstalk.

- **A:** Sai vì `commands` chạy trên mọi instance và chạy trước khi code mới được giải nén.
- **B:** Sai vì `Rolling` làm mất 50% capacity trong lúc cập nhật từng batch.
- **C:** Sai vì `AllAtOnce` làm giảm 100% capacity (gây downtime).
- **D (Đúng):** Đúng! `leader_only: true` trong `container_commands` đảm bảo migration chỉ chạy duy nhất 1 lần trên leader instance.
- **E (Đúng):** Đúng! Cả `Immutable`, `RollingWithAdditionalBatch`, và Blue/Green đều đảm bảo giữ **100% capacity** trong suốt quá trình triển khai (khác với `Rolling` và `AllAtOnce`).

</details>

### Câu 14 `medium`

A developer uses AWS Elastic Beanstalk with an Amazon Linux 2023 platform and needs to deploy a new application version with zero downtime and without reducing the serving capacity during deployment. If the new version fails health checks, it must be easy to roll back without affecting existing instances. Which Elastic Beanstalk deployment policy meets these requirements with the safest isolation?

- **A.** In-place
- **B.** Immutable
- **C.** All at once
- **D.** Rolling

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

So sánh nhanh các Deployment Policy của **Elastic Beanstalk**:
- **Immutable**: Zero downtime, giữ nguyên 100% capacity, tạo instance mới hoàn toàn trong ASG tạm -> rollback cực nhanh và sạch nhất.

- **A:** Sai vì không có deployment policy tên `In-place` trong Elastic Beanstalk (chỉ có `All at once`, `Rolling`, `Rolling with additional batch`, `Immutable`, `Traffic splitting`).
- **B (Đúng):** Đúng! **Immutable** tạo một Auto Scaling Group tạm thời với các EC2 instance mới chạy bản mới, đợi pass health check mới chuyển sang ASG chính -> không downtime, không giảm capacity, và rollback chỉ cần xóa ASG tạm.
- **C:** Sai vì `All at once` gây downtime trong lúc cập nhật toàn bộ instance.
- **D:** Sai vì `Rolling` làm giảm capacity phục vụ trong quá trình nâng cấp từng batch và nếu lỗi thì phải redeploy bản cũ.

</details>

### Câu 15 `hard`

A development team configures an Elastic Beanstalk environment with an Amazon RDS database created directly inside the Elastic Beanstalk environment settings. What major risk does this architecture introduce in production?

- **A.** Terminating the Elastic Beanstalk environment will also terminate the RDS database and risk data loss.
- **B.** Elastic Beanstalk cannot pass the RDS endpoint to EC2 instances via environment property variables automatically.
- **C.** Elastic Beanstalk permanently disables automated backups and snapshots on coupled RDS instances.
- **D.** RDS inside Elastic Beanstalk only supports MySQL engines and cannot provision PostgreSQL.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Trong bài thi AWS DVA-C02, **không bao giờ** gắn RDS production trực tiếp vào vòng đời của Elastic Beanstalk environment. Hãy tạo RDS độc lập bên ngoài và truyền chuỗi kết nối qua Environment Properties hoặc Secrets Manager.

- **A (Đúng):** Đúng! RDS tạo **bên trong** Elastic Beanstalk có vòng đời gắn chặt với môi trường đó; khi terminate environment hoặc thực hiện Blue/Green swap rồi xóa môi trường cũ, RDS sẽ bị xóa theo.
- **B:** Sai vì Elastic Beanstalk tự động inject `RDS_HOSTNAME`, `RDS_PORT`, `RDS_USERNAME`, `RDS_PASSWORD`.
- **C:** Sai, vấn đề cốt lõi của đề thi là **coupling vòng đời (lifecycle coupling)** giữa Environment và Database.
- **D:** Sai vì Elastic Beanstalk hỗ trợ nhiều engine (MySQL, PostgreSQL, SQL Server, Oracle).

</details>

### Câu 16 `medium`

A developer runs an application on Amazon ECS on EC2 instances behind an Application Load Balancer (ALB). Multiple copies of the same container task need to run on a single EC2 host simultaneously, listening on container port 8080, without port conflicts. Which ECS task definition port mapping configuration enables this?

- **A.** Use `none` network mode and attach a Classic Load Balancer directly to the container instances.
- **B.** Use `host` network mode and explicitly map both `hostPort` and `containerPort` to `8080` in the task definition.
- **C.** Use `bridge` network mode and pin `hostPort` to static port `8080` across all tasks.
- **D.** Use `bridge` network mode and set `hostPort` to `0` (dynamic port mapping) with `containerPort` `8080`.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

**Dynamic Port Mapping** trên ECS EC2 (`bridge` mode + `hostPort: 0`) kết hợp với **ALB Target Group** cho phép chạy nhiều task cùng container port trên một EC2 instance.

- **A:** Sai vì `none` mode ngắt kết nối mạng của container.
- **B:** Sai vì với `host` mode, chỉ 1 container có thể bind vào port 8080 trên cùng 1 EC2 host.
- **C:** Sai vì gán cứng `hostPort: 8080` sẽ gây xung đột cổng ngay ở container thứ 2 trên cùng EC2 host.
- **D (Đúng):** Đúng! Khi dùng `bridge` mode và `hostPort: 0`, Docker tự cấp một port ngẫu nhiên trên EC2 host cho mỗi task và ECS tự động đăng ký host port đó vào ALB Target Group.

</details>

### Câu 17 `medium`

A developer pushes Docker images to Amazon ECR for CI/CD deployments. Recently, another engineer accidentally overwrote the `v1.2.0` production image tag with a buggy build, breaking rollbacks. Which Amazon ECR feature prevents an existing image tag from being overwritten?

- **A.** Configure Image Tag Mutability to `IMMUTABLE` on the ECR repository.
- **B.** Enable AWS KMS encryption on the ECR repository to prevent overwrites.
- **C.** Attach an ECR Lifecycle Policy matching tag prefix `v*` to lock images.
- **D.** Enable Scan on Push on the ECR repository to block tag overwrites.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Bật **Tag Immutability** (`IMMUTABLE`) giúp đảm bảo mỗi version tag (`v1.2.0`) luôn trỏ tới đúng 1 digest duy nhất để rollback an toàn.

- **A (Đúng):** Đúng! Bật **Image Tag Immutability (`IMMUTABLE`)** trên ECR repository sẽ từ chối mọi thao tác `docker push` sử dụng tag đã tồn tại.
- **B:** Sai vì mã hóa không ngăn người có quyền push ghi đè tag.
- **C:** Sai vì Lifecycle Policy dùng để tự động xóa image cũ/hết hạn.
- **D:** Sai vì Scan on Push chỉ quét lỗ hổng CVE, không khóa việc ghi đè tag.

</details>

### Câu 18 `medium`

A developer deploys an ECS service using the `awsvpc` network mode on Fargate. Each task needs to restrict inbound traffic so only an Application Load Balancer can reach it on port 8000, while outbound traffic is limited to an RDS PostgreSQL database. Where does the developer attach these network rules?

- **A.** Attach the Security Group directly to the underlying Fargate host EC2 instance in the Amazon ECS cluster VPC.
- **B.** Attach a dedicated Security Group directly to the ECS Service's `networkConfiguration` (`awsvpcConfiguration`).
- **C.** Configure the IAM Task Role inline policy with `ec2:AuthorizeSecurityGroupIngress`.
- **D.** Configure a `PORT_SECURITY` environment variable inside the application `Dockerfile`.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Ưu điểm lớn nhất của **`awsvpc` network mode** trên ECS/Fargate là mỗi Task có ENI riêng và gắn được **Security Group ở cấp độ từng Task**.

- **A:** Sai vì Fargate là serverless compute, bạn không quản lý EC2 host.
- **B (Đúng):** Đúng! Với `awsvpc` mode, mỗi ECS Task có một **ENI riêng** và nhận **Security Group riêng** cấu hình trong `awsvpcConfiguration`.
- **C:** Sai vì đây là quyền API IAM chứ không phải gắn Security Group cho traffic của Task.
- **D:** Sai, `Dockerfile` không quản lý AWS Security Group.

</details>

### Câu 19 `medium`

A developer uses Elastic Beanstalk with an Application Load Balancer. How can the developer store custom configuration settings like scaling thresholds and ALB health check paths directly inside the application source code repository so every environment created from the bundle receives the same settings?

- **A.** Place a `buildspec.yml` file inside `.ebextensions/` to configure Elastic Beanstalk packages.
- **B.** Put the Elastic Beanstalk configuration settings inside `appspec.yml` at the root of the application project.
- **C.** Store the `.config` configuration in `/etc/eb-config.json` on the developer's local machine.
- **D.** Add YAML/JSON configuration files inside a `.ebextensions/` directory at the root of the source bundle.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Elastic Beanstalk đọc các file `.config` trong thư mục **`.ebextensions/`** ở gốc source bundle để áp dụng `option_settings` và tùy biến môi trường.

- **A:** Sai vì `buildspec.yml` là file cấu hình của AWS CodeBuild.
- **B:** Sai vì `appspec.yml` dùng cho AWS CodeDeploy.
- **C:** Sai vì không đi kèm source bundle.
- **D (Đúng):** Đúng! Thư mục `.ebextensions/*.config` đặt ở root source bundle dùng `option_settings` để khai báo cấu hình ALB, Auto Scaling, environment properties và tài nguyên AWS.

</details>

### Câu 20 `medium`

A company hosts a web application on AWS Elastic Beanstalk in a production environment. During application updates, the team requires that: (1) full capacity is maintained at all times; (2) no existing EC2 instances are reused for the new version; (3) new instances are launched in the Same Auto Scaling group and must pass Elastic Load Balancer health checks before old instances are terminated; and (4) rollbacks are fast if an issue occurs. Which Elastic Beanstalk deployment policy meets these requirements?

- **A.** Rolling
- **B.** Rolling with additional batch
- **C.** All at once
- **D.** Immutable

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Bảng nhớ nhanh 6 chiến lược Deployment của **Elastic Beanstalk**:
- **All at once**: Nhanh nhất, có downtime, 0 chi phí thêm.
- **Rolling**: Giảm capacity theo từng batch, cài đè máy cũ.
- **Rolling with additional batch**: Giữ nguyên 100% capacity, tạo thêm 1 batch mới nhưng vẫn cài đè lên các máy còn lại.
- **Immutable**: Tạo dàn máy mới 100% trong cùng môi trường, kiểm tra Health Check xong mới xóa máy cũ.
- **Blue/Green**: Tạo một Environment mới hoàn toàn độc lập rồi đổi CNAME bằng Route 53.
- **Traffic Splitting (Canary)**: Chuyển một phần % lưu lượng sang bản mới để kiểm thử.

- **A:** Sai vì `Rolling` tái sử dụng các máy EC2 hiện có và làm giảm công suất phục vụ (capacity) đi một batch trong lúc triển khai.
- **B:** Sai vì `Rolling with additional batch` chỉ tạo thêm 1 batch máy mới còn các batch tiếp theo vẫn cài đè lên các máy EC2 cũ đang chạy.
- **C:** Sai vì `All at once` cập nhật trực tiếp lên các máy hiện tại cùng lúc và gây downtime.
- **D (Đúng):** Đúng! Chiến lược **Immutable** tạo một Auto Scaling Group tạm thời với các EC2 instances hoàn toàn mới chạy phiên bản mới; sau khi vượt qua ELB health check, chúng được chuyển vào ASG chính và xóa các instances cũ (đảm bảo không bao giờ trộn lẫn code cũ/mới trên cùng 1 máy và rollback cực nhanh).

</details>

### Câu 21 `medium`

A developer wants to install a custom monitoring agent and configure operating system cron jobs across all Amazon EC2 instances managed by an AWS Elastic Beanstalk environment. These configurations must be version-controlled inside the application source bundle and applied automatically whenever Elastic Beanstalk provisions or updates instances. Where should the developer place these configuration files?

- **A.** Define YAML or JSON `.config` files inside the `.ebextensions/` directory at the root of the application source bundle.
- **B.** Create a `buildspec.yml` configuration file specifying the packages and commands and upload it to an Amazon S3 bucket.
- **C.** Add an `appspec.yml` deployment manifest with `BeforeInstall` hooks inside the `/etc/elasticbeanstalk/` directory.
- **D.** Connect via SSH to one of the Elastic Beanstalk EC2 instances and place custom shell scripts inside `/tmp/eb-config/` for execution.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Ba tên file cấu hình bắt buộc phân biệt trong đề DVA:
- **`.ebextensions/*.config`** (hoặc `.platform/hooks/`): Cấu hình **AWS Elastic Beanstalk**.
- **`buildspec.yml`**: Cấu hình các pha (`install`, `pre_build`, `build`, `post_build`) của **AWS CodeBuild**.
- **`appspec.yml`**: Cấu hình các hooks triển khai của **AWS CodeDeploy**.

- **A (Đúng):** Đúng! Thư mục `.ebextensions/*.config` ở gốc gói mã nguồn cho phép cấu hình tài nguyên AWS, cài đặt package (`packages`, `files`, `commands`, `container_commands`) tự động trên mọi máy chủ Elastic Beanstalk.
- **B:** Sai vì `buildspec.yml` là tệp cấu hình của AWS CodeBuild, không phải cấu hình máy chủ Elastic Beanstalk.
- **C:** Sai vì `appspec.yml` là tệp cấu hình của AWS CodeDeploy.
- **D:** Sai vì mọi thay đổi thủ công qua SSH sẽ bị mất ngay khi Auto Scaling thay thế hoặc thêm máy chủ EC2 mới.

</details>

### Câu 22 `medium`

A company runs containerized microservices on an Amazon ECS cluster backed by Amazon EC2 instances. Each container needs its own dedicated private IPv4 address from the VPC subnet so that individual security groups can be attached directly to each ECS task. Which ECS network mode should the developer specify in the task definition?

- **A.** host
- **B.** bridge
- **C.** none
- **D.** awsvpc

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Trong Amazon ECS, chế độ mạng **`awsvpc`** là chế độ duy nhất cấp **ENI riêng + Private IP riêng + Security Group riêng** cho mỗi Task.

- **A:** Sai vì `host` dùng chung trực tiếp card mạng và cổng của máy chủ EC2 vật lý.
- **B:** Sai vì `bridge` dùng mạng ảo Docker nội bộ trên máy chủ EC2 và ánh xạ cổng (port mapping), không cấp ENI hay Security Group riêng cho từng Task.
- **C:** Sai vì `none` tắt hoàn toàn kết nối mạng bên ngoài của container.
- **D (Đúng):** Đúng! Chế độ mạng `awsvpc` cấp cho mỗi ECS Task một card mạng Elastic Network Interface (ENI) riêng biệt kèm địa chỉ IP riêng trong Subnet và gắn được Security Group riêng cho từng Task (đây cũng là chế độ bắt buộc duy nhất trên AWS Fargate).

</details>

---

[← Bộ trước](04-dva-s3-cloudfront.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Bộ tiếp theo →](06-dva-aws-lambda.md)
