# Bài tập tình huống — Chủ đề 5: Containers & PaaS — ECS, ECR, Fargate & Elastic Beanstalk

> Docker trên AWS, ECS Task Role vs Execution Role, Fargate Serverless Containers, ECR và Elastic Beanstalk Deployment Policies.
> **Số câu hỏi:** 22 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A developer is deploying a containerized web service on Amazon ECS using the EC2 launch type behind an Application Load Balancer (ALB). The team wants to run multiple tasks of the same container (which listens on container port 8080) on a single EC2 instance without port conflicts. How should the developer configure the ECS Task Definition?

- **A.** Replace the Application Load Balancer with a Classic Load Balancer (CLB) configured with static TCP port forwarding on port 8080.
- **B.** Use the `host` network mode and set both `hostPort` and `containerPort` to `8080` in the ECS task definition `portMappings`.
- **C.** Use the `bridge` network mode and set both `hostPort` and `containerPort` to `8080` across all task definition revisions.
- **D.** Use the `bridge` network mode and set `hostPort` to `0` while keeping `containerPort` as `8080` in `portMappings`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer đang triển khai một dịch vụ web đóng gói container trên Amazon ECS sử dụng launch type EC2 phía sau một Application Load Balancer (ALB). Nhóm muốn chạy nhiều task của cùng một container (lắng nghe trên container port 8080) trên một EC2 instance duy nhất mà không bị xung đột cổng. Developer nên cấu hình ECS Task Definition như thế nào?

**Đáp án đúng:** **D**

**ECS Dynamic Port Mapping** (chỉ áp dụng cho **EC2 launch type** với `bridge` mode):
- Đặt **`hostPort: 0`** và `containerPort: 8080`.
- **ALB** (hoặc NLB) tự động định tuyến traffic tới đúng ephemeral port trên từng EC2 instance.
- Lưu ý: Security Group của EC2 instance phải mở dải ephemeral ports (`32768–65535` hoặc `49153–65535`) cho traffic từ Security Group của ALB.

- **A:** Sai vì Classic Load Balancer không hỗ trợ Dynamic Port Mapping trên ECS; chỉ ALB và NLB mới hỗ trợ.
- **B:** Sai vì `host` network mode gắn trực tiếp container vào port 8080 của EC2 host, nên chỉ chạy được tối đa 1 task trên mỗi EC2 instance.
- **C:** Sai vì cố định `hostPort: 8080` sẽ gây xung đột cổng khi chạy task thứ 2 trên cùng một EC2 instance.
- **D (Đúng):** Đúng! Khi dùng `bridge` network mode trên ECS EC2 và đặt `hostPort: 0`, Docker/ECS tự động gán một ephemeral port ngẫu nhiên trên host (dynamic port mapping) và tự đăng ký port đó vào Target Group của ALB.

</details>

### Câu 2 `medium`

A company runs a production web application on AWS Elastic Beanstalk with 6 EC2 instances. During deployments, the team wants to ensure that: (1) existing instances are NOT modified in place, (2) full production capacity (6 instances) is maintained throughout the deployment, and (3) if the new version fails health checks, rollback is fast without redeploying old code to existing instances. Which Elastic Beanstalk deployment policy should be used?

- **A.** `Immutable`
- **B.** `AllAtOnce`
- **C.** `Rolling`
- **D.** `RollingWithAdditionalBatch`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty vận hành một ứng dụng web production trên AWS Elastic Beanstalk với 6 EC2 instance. Trong quá trình triển khai, nhóm muốn đảm bảo rằng: (1) các instance hiện có KHÔNG bị sửa đổi tại chỗ, (2) toàn bộ công suất production (6 instance) được duy trì trong suốt quá trình triển khai, và (3) nếu phiên bản mới không vượt qua health check, việc rollback diễn ra nhanh chóng mà không cần triển khai lại mã cũ lên các instance hiện có. Chính sách triển khai Elastic Beanstalk nào nên được sử dụng?

**Đáp án đúng:** **A**

So sánh các **Elastic Beanstalk Deployment Policies**:
- **`AllAtOnce`**: Nhanh nhất, có downtime.
- **`Rolling`**: Không downtime, nhưng giảm capacity theo batch.
- **`RollingWithAdditionalBatch`**: Giữ 100% capacity, cập nhật dần in-place.
- **`Immutable`**: Tạo **ASG mới** với instance mới hoàn toàn, giữ 100% capacity, rollback sạch và nhanh nhất.
- **`TrafficSplitting`**: Canary testing (chia % traffic sang bản mới).

- **A (Đúng):** Đúng! Chính sách **Immutable** tạo một Auto Scaling Group tạm thời với các EC2 instance mới hoàn toàn (giữ nguyên 100% capacity cũ), kiểm tra health check đạt mới chuyển sang ASG chính và xóa instance cũ; nếu lỗi chỉ cần xóa ASG tạm nên rollback cực nhanh và sạch.
- **B:** Sai vì `AllAtOnce` deploy đè lên toàn bộ instance cùng lúc, gây downtime trong lúc cập nhật.
- **C:** Sai vì `Rolling` gỡ từng batch instance ra để cập nhật tại chỗ, làm giảm capacity khả dụng trong quá trình deploy và rollback chậm.
- **D:** Sai vì `RollingWithAdditionalBatch` giữ được 100% capacity nhưng vẫn cập nhật đè lên các instance cũ (in-place) ở các batch tiếp theo, không cô lập hoàn toàn như `Immutable`.

</details>

### Câu 3 `medium`

A developer is migrating an AWS Elastic Beanstalk application from Amazon Linux 1 to Amazon Linux 2 (AL2) / AL2023. The application previously used `.ebextensions` `container_commands` to configure Nginx reverse proxy settings and run custom startup scripts. What is the recommended way to customize Nginx and run platform hooks on AL2/AL2023?

- **A.** Place custom Nginx `.conf` files in `.platform/nginx/conf.d/` and custom deployment scripts in `.platform/hooks/` (with executable permissions).
- **B.** Place custom Nginx `.conf` files inside `/tmp/nginx/` via a `Dockerfile` and reference them in `Dockerrun.aws.json`.
- **C.** SSH into each running EC2 instance after deployment and edit `/etc/nginx/nginx.conf` manually followed by `systemctl reload nginx`.
- **D.** Configure Nginx reverse proxy rules and startup hooks inside `appspec.yml` at the root of the source bundle.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer đang di chuyển một ứng dụng AWS Elastic Beanstalk từ Amazon Linux 1 sang Amazon Linux 2 (AL2) / AL2023. Trước đây ứng dụng đã sử dụng `container_commands` của `.ebextensions` để cấu hình Nginx reverse proxy và chạy các startup script tùy chỉnh. Cách được khuyến nghị để tùy chỉnh Nginx và chạy platform hook trên AL2/AL2023 là gì?

**Đáp án đúng:** **A**

Trên **Elastic Beanstalk Amazon Linux 2 / AL2023**:
- **`.ebextensions/*.config`**: Vẫn dùng để tạo AWS resources (SQS, DynamoDB) và option settings.
- **`.platform/nginx/conf.d/`**: Cấu hình mở rộng Nginx.
- **`.platform/hooks/`** (`prebuild`, `predeploy`, `postdeploy`): Chạy script tùy chỉnh.
- **`Procfile` / `Buildfile`**: Chỉ định lệnh khởi chạy và build ứng dụng.

- **A (Đúng):** Đúng! Trên Elastic Beanstalk **Amazon Linux 2 / AL2023**, AWS khuyến nghị dùng thư mục **`.platform/nginx/`** để cấu hình proxy và **`.platform/hooks/`** (`prebuild`, `predeploy`, `postdeploy`) thay cho các cấu hình Nginx/script cũ trong `.ebextensions`.
- **B:** Sai vì đây là ứng dụng Elastic Beanstalk nền tảng chuẩn (không phải Docker), và `/tmp/nginx/` không được EB proxy tự nạp.
- **C:** Sai vì chỉnh tay qua SSH sẽ mất sạch khi Auto Scaling tạo instance mới.
- **D:** Sai vì `appspec.yml` là file cấu hình của AWS CodeDeploy, không phải Elastic Beanstalk.

</details>

### Câu 4 `medium`

A team runs a containerized content management service on Amazon ECS using the AWS Fargate launch type. Multiple Fargate tasks across different Availability Zones must read and write shared uploaded assets concurrently on a persistent POSIX filesystem. Additionally, a single task needs 50 GB of temporary scratch space for video transcoding. Which TWO configurations meet these requirements? (Choose two.)

- **A.** Attach an Amazon EBS `gp3` Multi-Attach volume directly to all Fargate tasks simultaneously across multiple Availability Zones.
- **B.** Mount an Amazon EFS filesystem in the ECS Task Definition (`efsVolumeConfiguration`) for the shared persistent assets.
- **C.** Use `dockerVolumes` with `host.sourcePath` bind mounts on AWS Fargate to share persistent files across Availability Zones.
- **D.** Enable S3 Object Lock in Compliance mode on the Fargate Task Definition for shared 50 GB scratch storage.
- **E.** Configure `ephemeralStorage.sizeInGiB` to `50` (up to 200 GiB) in the Fargate Task Definition for the temporary scratch space.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm vận hành một dịch vụ quản lý nội dung đóng gói container trên Amazon ECS sử dụng launch type AWS Fargate. Nhiều Fargate task trên các Availability Zone khác nhau phải đọc và ghi đồng thời các tài nguyên được tải lên dùng chung trên một hệ thống tệp POSIX bền vững (persistent). Ngoài ra, một task đơn lẻ cần 50 GB không gian lưu trữ tạm thời (scratch space) để chuyển mã video. HAI cấu hình nào đáp ứng các yêu cầu này? (Chọn hai đáp án.)

**Đáp án đúng:** **B, E**

Lưu trữ trên **ECS Fargate**:
- **Dữ liệu tạm thời riêng cho 1 task**: **`ephemeralStorage`** (mặc định 20 GiB, mở rộng tối đa **200 GiB**).
- **Dữ liệu bền vững dùng chung nhiều tasks / nhiều AZs**: **Amazon EFS** (`efsVolumeConfiguration`).

- **A:** Sai vì EBS gắn theo từng AZ (không dùng chung cross-AZ cho nhiều Fargate tasks như EFS).
- **B (Đúng):** Đúng! **Amazon EFS** hỗ trợ gắn trực tiếp vào **ECS Fargate** (`efsVolumeConfiguration`), cung cấp hệ thống file POSIX bền vững cho phép nhiều task ở nhiều Availability Zones đọc/ghi đồng thời.
- **C:** Sai vì Bind Mounts (`host.sourcePath`) trên Fargate chỉ tồn tại cục bộ trong vòng đời của 1 task, không chia sẻ được giữa các task khác nhau.
- **D:** Sai vì S3 Object Lock là tính năng của S3 bucket, không phải filesystem cho Fargate.
- **E (Đúng):** Đúng! Mặc định Fargate có 20 GiB ephemeral storage, và có thể cấu hình `ephemeralStorage.sizeInGiB` lên tới **200 GiB** cho dữ liệu tạm thời của từng task.

</details>

### Câu 5 `medium`

A DevOps team pushes Docker container images to Amazon ECR on every CI build. Over time, the ECR repository accumulates thousands of old untagged images, increasing storage costs. Additionally, the team wants to prevent anyone from accidentally overwriting an existing release tag like `v1.4.0` and automatically scan newly pushed images for OS vulnerabilities. Which combination of ECR features should be enabled?

- **A.** Enable S3 Object Lock on the underlying ECR storage and run `docker rmi` manually every week on the build server.
- **B.** Configure an ECR Lifecycle Policy to expire untagged images, set Image Tag Mutability to `Immutable`, and enable Scan on push.
- **C.** Set ECR Image Tag Mutability to `Mutable` and disable all Amazon ECR Lifecycle Policies so release tags can be updated in place.
- **D.** Move all production container images to Amazon ECR Public Gallery to reduce private repository storage charges.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm DevOps push các Docker container image lên Amazon ECR trên mỗi lần CI build. Theo thời gian, ECR repository tích lũy hàng nghìn image cũ không gắn thẻ (untagged), làm tăng chi phí lưu trữ. Ngoài ra, nhóm muốn ngăn bất kỳ ai vô tình ghi đè lên một release tag hiện có như `v1.4.0` và tự động quét các image mới được push để tìm lỗ hổng hệ điều hành. Sự kết hợp nào của các tính năng ECR nên được bật?

**Đáp án đúng:** **B**

3 tính năng quản trị **Amazon ECR** hay thi:
- **Lifecycle Policy**: Tự động xóa image untagged hoặc chỉ giữ lại N image gần nhất.
- **Tag Immutability (`IMMUTABLE`)**: Ngăn ghi đè tag đã tồn tại.
- **Image Scanning** (Basic / Enhanced with Amazon Inspector): Quét lỗ hổng CVE tự động khi push.

- **A:** Sai vì ECR không để người dùng thao tác trực tiếp S3 Object Lock, và chạy `docker rmi` trên máy local không xóa image trên ECR.
- **B (Đúng):** Đúng! **ECR Lifecycle Policy** tự động dọn dẹp image cũ/untagged; **Immutable Tags** chặn ghi đè tag release như `v1.4.0`; và **Scan on push** tự động quét lỗ hổng bảo mật ngay khi push image.
- **C:** Sai vì `Mutable` cho phép ghi đè tag `v1.4.0`, còn tắt Lifecycle Policy sẽ không dọn được image rác.
- **D:** Sai vì đưa image nội bộ lên Public Gallery làm lộ mã nguồn.

</details>

### Câu 6 `easy`

A team manages multiple AWS Elastic Beanstalk environments (`dev`, `staging`, `prod`). After tuning the `staging` environment's Auto Scaling, load balancer, and instance settings via the console, the team wants to capture those exact environment settings so they can quickly recreate identical environments or apply them to `prod` later. Which Elastic Beanstalk feature should they use?

- **A.** Run `eb swap` between the `staging` and `prod` Elastic Beanstalk environments to copy environment settings.
- **B.** Export the EC2 instance's `/tmp` directory from `staging` and bundle it into `prod`.
- **C.** Use `eb ssh` to copy `/etc/hosts` and `/etc/nginx` from the `staging` EC2 instance to `prod`.
- **D.** Save the environment settings as an Elastic Beanstalk Saved Configuration (`eb config save`).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm quản lý nhiều môi trường AWS Elastic Beanstalk (`dev`, `staging`, `prod`). Sau khi tinh chỉnh các thiết lập Auto Scaling, load balancer và instance của môi trường `staging` qua console, nhóm muốn lưu lại chính xác các thiết lập môi trường đó để có thể nhanh chóng tạo lại các môi trường giống hệt hoặc áp dụng chúng cho `prod` sau này. Họ nên sử dụng tính năng nào của Elastic Beanstalk?

**Đáp án đúng:** **D**

Các lệnh **EB CLI** quan trọng:
- `eb init` / `eb create`: Khởi tạo và tạo môi trường.
- `eb deploy`: Đẩy phiên bản ứng dụng mới.
- **`eb config save` / `eb config put`**: Lưu và tái sử dụng **Saved Configurations**.
- **`eb swap`**: Hoán đổi CNAME URL trong Blue/Green deployment.

- **A:** Sai vì `eb swap` dùng để tráo đổi CNAME/URL giữa hai môi trường đang chạy (Blue/Green), không sao chép template cấu hình.
- **B:** Sai vì `/tmp` không chứa cấu hình hạ tầng ASG/ALB của Elastic Beanstalk.
- **C:** Sai vì `/etc/hosts` không liên quan đến cấu hình môi trường Elastic Beanstalk.
- **D (Đúng):** Đúng! **Saved Configurations** lưu toàn bộ cấu hình của một môi trường Elastic Beanstalk (dưới dạng YAML lưu trên S3 bucket của EB) để tái sử dụng khi tạo hoặc cập nhật các môi trường khác.

</details>

### Câu 7 `medium`

An Amazon ECS service using the AWS Fargate launch type in private VPC subnets fails to start new tasks. The ECS service events show: `ResourceInitializationError: unable to pull secrets or registry auth: execution resource retrieval failed: unable to retrieve ecr registry auth`. Which TWO missing configurations are the most likely causes? (Choose two.)

- **A.** The Amazon ECS Task Role (`taskRoleArn`) lacks `s3:PutObject` and `s3:GetObject` IAM permissions on the deployment bucket.
- **B.** The private subnet lacks outbound connectivity to ECR (missing a NAT Gateway or `ecr.api`, `ecr.dkr`, and S3 VPC Endpoints).
- **C.** The Fargate Task Definition has `networkMode` set to `awsvpc` instead of `bridge` for private subnet tasks.
- **D.** The ECS Task Execution Role (`executionRoleArn`) is missing `ecr:GetAuthorizationToken`, `BatchGetImage`, and `GetDownloadUrlForLayer`.
- **E.** The Application Load Balancer Target Group is missing a `ValidateService` CodeDeploy lifecycle event hook.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một dịch vụ Amazon ECS sử dụng launch type AWS Fargate trong các private VPC subnet không thể khởi chạy các task mới. Sự kiện của dịch vụ ECS hiển thị: `ResourceInitializationError: unable to pull secrets or registry auth: execution resource retrieval failed: unable to retrieve ecr registry auth`. HAI cấu hình bị thiếu nào là nguyên nhân có khả năng nhất? (Chọn hai đáp án.)

**Đáp án đúng:** **B, D**

Gỡ lỗi **`ResourceInitializationError` / `CannotPullContainerError`** trên **ECS Fargate Private Subnet**:
1. Kiểm tra **Mạng**: Cần **NAT Gateway** hoặc **VPC Endpoints** (`ecr.api` + `ecr.dkr` + **`s3` Gateway Endpoint** + `logs` nếu ghi CloudWatch Logs).
2. Kiểm tra **IAM**: **`executionRoleArn`** phải có `AmazonECSTaskExecutionRolePolicy`.

- **A:** Sai vì `taskRoleArn` chỉ dùng khi container đã chạy lên; lỗi kéo image xảy ra ở giai đoạn khởi tạo dùng `executionRoleArn`.
- **B (Đúng):** Đúng! Fargate task trong private subnet (khi `assignPublicIp: DISABLED`) cần đường mạng ra **ECR** và **S3** (nơi lưu image layers) thông qua **NAT Gateway** hoặc bộ **VPC Endpoints (`ecr.api`, `ecr.dkr`, và `s3` Gateway Endpoint)**.
- **C:** Sai vì `awsvpc` là `networkMode` bắt buộc và duy nhất được hỗ trợ trên AWS Fargate.
- **D (Đúng):** Đúng! Lỗi `unable to retrieve ecr registry auth` cũng xảy ra nếu `executionRoleArn` thiếu quyền kéo image từ ECR (thường dùng managed policy `AmazonECSTaskExecutionRolePolicy`).
- **E:** Sai vì `ValidateService` là hook của CodeDeploy EC2, không liên quan đến lỗi kéo image ECR của Fargate.

</details>

### Câu 8 `medium`

A developer has deployed an AWS Lambda function using a container image (Docker) stored in Amazon ECR because the application requires 1.5 GB of custom C++ binaries and machine learning libraries. When testing, the developer updates the code and wants to verify the container image size limit for AWS Lambda. What is the maximum container image size supported by AWS Lambda?

- **A.** 10 GB
- **B.** 250 MB
- **C.** 50 MB
- **D.** 512 MB

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer đã triển khai một hàm AWS Lambda bằng container image (Docker) lưu trữ trong Amazon ECR vì ứng dụng yêu cầu 1,5 GB các tệp nhị phân C++ tùy chỉnh và thư viện machine learning. Khi kiểm thử, developer cập nhật mã và muốn xác minh giới hạn kích thước container image cho AWS Lambda. Kích thước container image tối đa được AWS Lambda hỗ trợ là bao nhiêu?

**Đáp án đúng:** **A**

Tổng hợp các **giới hạn kích thước của AWS Lambda**:
- ZIP upload trực tiếp: **50 MB** (nén).
- ZIP upload qua S3 + Layers (giải nén): **250 MB**.
- **Container Image (ECR)**: **10 GB**.
- `/tmp` Ephemeral Storage: **512 MB** mặc định, mở rộng tối đa **10,240 MB (10 GB)**.

- **A (Đúng):** Đúng! AWS Lambda hỗ trợ đóng gói dưới dạng **Container Image** (lưu trên Amazon ECR) với kích thước tối đa lên tới **10 GB** (lớn hơn rất nhiều so với giới hạn 250 MB giải nén của file ZIP).
- **B:** Sai vì 250 MB là giới hạn kích thước giải nén của gói **ZIP + Layers**, không phải Container Image.
- **C:** Sai vì 50 MB là giới hạn upload trực tiếp file ZIP (nén) qua Console/API (lớn hơn 50 MB nén thì upload qua S3).
- **D:** Sai vì 512 MB là dung lượng `/tmp` ephemeral storage mặc định của Lambda.

</details>

### Câu 9 `medium`

An Amazon ECS service running on EC2 instances uses an Application Load Balancer (ALB). During deployments or scale-in events, active user requests are occasionally dropped with `502` errors because ECS kills the container before in-flight HTTP requests finish. Which TWO settings work together to allow in-flight requests to complete gracefully?

- **A.** Set Deregistration Delay to `0` seconds on the ALB Target Group so draining tasks disconnect immediately.
- **B.** Set `essential: false` on the primary application container in the ECS Task Definition.
- **C.** Configure Deregistration Delay (e.g., 30s) on the ALB Target Group and `stopTimeout` on the ECS container (handling `SIGTERM`).
- **D.** Disable ALB Target Group Health Checks during ECS rolling updates so tasks are never marked unhealthy.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một dịch vụ Amazon ECS chạy trên các EC2 instance sử dụng một Application Load Balancer (ALB). Trong quá trình triển khai hoặc sự kiện thu hẹp quy mô (scale-in), các request đang hoạt động của người dùng thỉnh thoảng bị ngắt với lỗi `502` vì ECS tắt container trước khi các HTTP request đang xử lý (in-flight) kịp hoàn tất. HAI thiết lập nào phối hợp với nhau để cho phép các request đang xử lý hoàn thành một cách suôn sẻ (gracefully)?

**Đáp án đúng:** **C**

Graceful Shutdown trên **ECS + ALB**:
1. ALB Target Group: **Deregistration Delay** (không gửi request mới, giữ kết nối cũ).
2. ECS Container: Lắng nghe **`SIGTERM`**, hoàn tất request rồi thoát trước khi hết **`stopTimeout`** (trước khi nhận `SIGKILL`).

- **A:** Sai vì đặt Deregistration Delay = 0 sẽ ngắt ngay lập tức mọi kết nối đang mở.
- **B:** Sai vì `essential: false` chỉ làm ECS không dừng cả task nếu container đó crash, không giúp xử lý graceful shutdown.
- **C (Đúng):** Đúng! Khi dừng task, ALB ngừng gửi request mới và chờ hết **Deregistration Delay** (mặc định 300s) cho các request đang chạy hoàn tất; đồng thời ECS gửi **`SIGTERM`** tới container và chờ tối đa **`stopTimeout`** (mặc định 30s, tối đa 120s) trước khi gửi `SIGKILL`.
- **D:** Sai vì không thể tắt hoàn toàn health check trên ALB Target Group và việc đó không giúp graceful shutdown.

</details>

### Câu 10 `medium`

A company runs a web application on AWS Elastic Beanstalk using a single-instance environment for development and a load-balanced auto-scaling environment for production. The team needs to run a cron job that executes a cleanup script once every hour on ONLY ONE instance in the production environment (not on every EC2 instance in the Auto Scaling group). How should this be configured in `.ebextensions`?

- **A.** Put the cleanup cron script inside `.ebextensions` `commands` without setting `leader_only: true`.
- **B.** Set `IgnoreErrors: true` in `.ebextensions` so only the first instance executes the scheduled task.
- **C.** Deploy the cleanup script inside the ALB Target Group HTTP health check path so it runs periodically across instances.
- **D.** Set `leader_only: true` on `container_commands` (or use an Elastic Beanstalk Worker Environment with `cron.yaml`).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty vận hành một ứng dụng web trên AWS Elastic Beanstalk sử dụng môi trường single-instance cho development và môi trường load-balanced auto-scaling cho production. Nhóm cần chạy một cron job thực thi script dọn dẹp mỗi giờ một lần trên CHỈ MỘT instance trong môi trường production (không phải trên mọi EC2 instance trong Auto Scaling group). Điều này nên được cấu hình như thế nào trong `.ebextensions`?

**Đáp án đúng:** **D**

Trong **Elastic Beanstalk `.ebextensions`**:
- `commands`: Chạy **trước** khi giải nén ứng dụng.
- `container_commands`: Chạy **sau** khi giải nén ứng dụng (có hỗ trợ **`leader_only: true`** để chỉ chạy trên 1 instance — ví dụ chạy DB migration).
- **Worker Environment + `cron.yaml`**: Chạy cron job định kỳ qua SQS queue một cách tin cậy.

- **A:** Sai vì `commands` chạy trên **mọi EC2 instance** (và `commands` cũng chạy trước khi code ứng dụng được giải nén).
- **B:** Sai vì `IgnoreErrors` chỉ bỏ qua mã thoát lỗi của lệnh, không giới hạn chạy trên 1 instance.
- **C:** Sai vì health check chạy mỗi vài chục giây trên tất cả instance.
- **D (Đúng):** Đúng! Trong `.ebextensions` `container_commands`, thuộc tính **`leader_only: true`** đảm bảo lệnh chỉ chạy trên 1 instance đại diện (leader). Đối với tác vụ cron định kỳ thực thụ, Elastic Beanstalk **Worker Environment** với file `cron.yaml` là giải pháp chuẩn hơn cả.

</details>

### Câu 11 `easy`

A developer is building a Docker container image for an application that will run on Amazon ECS with AWS Fargate. The developer wants the container to run with minimal OS overhead, avoid running as the `root` user, and keep the image size as small as possible for fast task startup. Which Dockerfile best practices should be applied?

- **A.** Use the full `ubuntu:latest` base image with `USER root` and keep all compilers and build tools installed inside the final image.
- **B.** Hardcode AWS IAM Access Keys using `ENV AWS_ACCESS_KEY_ID` inside the Dockerfile for runtime AWS SDK authentication.
- **C.** Install the AWS X-Ray Daemon, CloudWatch Agent, and MySQL database all inside the single application container image.
- **D.** Use multi-stage builds with a minimal base image (`alpine` or `distroless`), combine `RUN` layers, and set a non-root `USER`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer đang xây dựng một Docker container image cho một ứng dụng sẽ chạy trên Amazon ECS với AWS Fargate. Developer muốn container chạy với chi phí hệ điều hành tối thiểu, tránh chạy dưới quyền người dùng `root` và giữ kích thước image nhỏ nhất có thể để khởi động task nhanh chóng. Các thực hành tốt nhất nào cho Dockerfile nên được áp dụng?

**Đáp án đúng:** **D**

Best practices **Docker / ECS**:
- **Multi-stage build** + base image nhỏ (`alpine`/`slim`) -> giảm thời gian pull image trên Fargate.
- Chạy dưới quyền **non-root `USER`**.
- Không nhúng secrets/credentials vào image; dùng **ECS Task Role** và **Secrets Manager**.

- **A:** Sai vì image nặng làm chậm thời gian khởi động Fargate task và chạy bằng `root` kém an toàn.
- **B:** Sai vì tuyệt đối không đưa IAM Access Keys vào Dockerfile; hãy dùng ECS Task Role (`taskRoleArn`).
- **C:** Sai vì vi phạm nguyên tắc 1 process/concern mỗi container (nên tách X-Ray thành sidecar container trong cùng Task Definition và dùng RDS cho database).
- **D (Đúng):** Đúng! **Multi-stage builds** loại bỏ compiler/dev dependencies khỏi image cuối cùng giúp image cực nhẹ (Fargate pull image nhanh hơn), và khai báo **`USER`** non-root tăng cường bảo mật container.

</details>

### Câu 12 `medium`

A developer uses AWS Elastic Beanstalk to run a Python Flask application. By default, Elastic Beanstalk on Amazon Linux 2 looks for `application.py` with a `WSGIPath` of `application`. However, the team's entry point is `app.py` running via Gunicorn on port 8000 with 4 worker processes. How should the developer customize the startup command on AL2/AL2023?

- **A.** Add a `buildspec.yml` file at the root directory of the Elastic Beanstalk source bundle specifying the `gunicorn` startup command.
- **B.** Create an `appspec.yml` file inside `.ebextensions/` with a `StartApplication` hook running `gunicorn`.
- **C.** Set `Handler: app.app` and `Runtime: python3.11` in an AWS SAM `template.yaml` file at the root.
- **D.** Add a `Procfile` at the root of the application source bundle containing `web: gunicorn --bind :8000 --workers 4 app:app`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer sử dụng AWS Elastic Beanstalk để chạy một ứng dụng Python Flask. Theo mặc định, Elastic Beanstalk trên Amazon Linux 2 tìm tệp `application.py` với `WSGIPath` là `application`. Tuy nhiên, điểm vào (entry point) của nhóm là `app.py` chạy qua Gunicorn trên cổng 8000 với 4 worker process. Developer nên tùy chỉnh lệnh khởi động trên AL2/AL2023 như thế nào?

**Đáp án đúng:** **D**

File cấu hình đặc trưng trên **Elastic Beanstalk**:
- **`Procfile`**: Định nghĩa lệnh khởi chạy ứng dụng (`web: ...`).
- **`Buildfile`**: Lệnh biên dịch trước khi chạy.
- **`.ebextensions/*.config`**: Tạo AWS resources & option settings.
- **`.platform/hooks/` & `.platform/nginx/`**: Hooks & Nginx trên AL2/AL2023.

- **A:** Sai vì `buildspec.yml` là file cấu hình build của AWS CodeBuild, không phải Elastic Beanstalk.
- **B:** Sai vì `appspec.yml` thuộc về AWS CodeDeploy.
- **C:** Sai vì `template.yaml` với `Handler` là cấu hình của AWS SAM / Lambda.
- **D (Đúng):** Đúng! Trên Elastic Beanstalk AL2/AL2023, file **`Procfile`** ở thư mục gốc cho phép chỉ định chính xác lệnh khởi chạy process `web:` (ví dụ `gunicorn` với số workers và file `app:app` tùy chỉnh).

</details>

### Câu 13 `medium`

A DevOps team builds and deploys a Python application on AWS Elastic Beanstalk. During a deployment, the team wants to ensure that: (1) a database migration script runs ONLY once per deployment (not on every EC2 instance), and (2) no capacity is lost during deployment. Which TWO configurations meet these requirements? (Choose two.)

- **A.** Set the Elastic Beanstalk Deployment Policy to `AllAtOnce` for fastest database schema synchronization across instances.
- **B.** Set the Elastic Beanstalk Deployment Policy to `Rolling` with a batch size of 50% across the fleet.
- **C.** Run the database migration script in `.ebextensions` under `container_commands` with `leader_only: true`.
- **D.** Put the database migration script in `.ebextensions` `commands` without setting `leader_only: true`.
- **E.** Set the Elastic Beanstalk Deployment Policy to `Immutable` or `RollingWithAdditionalBatch` (or Blue/Green).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm DevOps build và triển khai một ứng dụng Python trên AWS Elastic Beanstalk. Trong quá trình triển khai, nhóm muốn đảm bảo rằng: (1) một script di chuyển cơ sở dữ liệu (database migration) CHỈ chạy một lần cho mỗi lần triển khai (không chạy trên mọi EC2 instance), và (2) không bị mất công suất (capacity) trong quá trình triển khai. HAI cấu hình nào đáp ứng các yêu cầu này? (Chọn hai đáp án.)

**Đáp án đúng:** **C, E**

Ghi nhớ: Chỉ `Immutable`, `RollingWithAdditionalBatch`, `TrafficSplitting` và `Blue/Green` là giữ được **100% capacity** trên Elastic Beanstalk.

- **A:** Sai vì `AllAtOnce` làm giảm 100% capacity (gây downtime).
- **B:** Sai vì `Rolling` làm mất 50% capacity trong lúc cập nhật từng batch.
- **C (Đúng):** Đúng! `leader_only: true` trong `container_commands` đảm bảo migration chỉ chạy duy nhất 1 lần trên leader instance.
- **D:** Sai vì `commands` chạy trên mọi instance và chạy trước khi code mới được giải nén.
- **E (Đúng):** Đúng! Cả `Immutable`, `RollingWithAdditionalBatch`, và Blue/Green đều đảm bảo giữ **100% capacity** trong suốt quá trình triển khai (khác với `Rolling` và `AllAtOnce`).

</details>

### Câu 14 `medium`

A developer uses AWS Elastic Beanstalk with an Amazon Linux 2023 platform and needs to deploy a new application version with zero downtime and without reducing the serving capacity during deployment. If the new version fails health checks, it must be easy to roll back without affecting existing instances. Which Elastic Beanstalk deployment policy meets these requirements with the safest isolation?

- **A.** Immutable
- **B.** All at once
- **C.** Rolling
- **D.** In-place

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer sử dụng AWS Elastic Beanstalk với nền tảng Amazon Linux 2023 và cần triển khai một phiên bản ứng dụng mới với zero downtime và không làm giảm công suất phục vụ trong quá trình triển khai. Nếu phiên bản mới không vượt qua health check, việc rollback phải dễ dàng mà không ảnh hưởng đến các instance hiện có. Chính sách triển khai Elastic Beanstalk nào đáp ứng các yêu cầu này với mức độ cô lập an toàn nhất?

**Đáp án đúng:** **A**

So sánh nhanh các Deployment Policy của **Elastic Beanstalk**:
- **Immutable**: Zero downtime, giữ nguyên 100% capacity, tạo instance mới hoàn toàn trong ASG tạm -> rollback cực nhanh và sạch nhất.

- **A (Đúng):** Đúng! **Immutable** tạo một Auto Scaling Group tạm thời với các EC2 instance mới chạy bản mới, đợi pass health check mới chuyển sang ASG chính -> không downtime, không giảm capacity, và rollback chỉ cần xóa ASG tạm.
- **B:** Sai vì `All at once` gây downtime trong lúc cập nhật toàn bộ instance.
- **C:** Sai vì `Rolling` làm giảm capacity phục vụ trong quá trình nâng cấp từng batch và nếu lỗi thì phải redeploy bản cũ.
- **D:** Sai vì không có deployment policy tên `In-place` trong Elastic Beanstalk (chỉ có `All at once`, `Rolling`, `Rolling with additional batch`, `Immutable`, `Traffic splitting`).

</details>

### Câu 15 `hard`

A development team configures an Elastic Beanstalk environment with an Amazon RDS database created directly inside the Elastic Beanstalk environment settings. What major risk does this architecture introduce in production?

- **A.** Terminating the Elastic Beanstalk environment will also terminate the RDS database and risk data loss.
- **B.** Elastic Beanstalk cannot pass the RDS database endpoint to EC2 instances via environment configuration variables.
- **C.** RDS inside Elastic Beanstalk only supports MySQL and cannot use PostgreSQL.
- **D.** Elastic Beanstalk disables automated backups on RDS instances.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm phát triển cấu hình một môi trường Elastic Beanstalk với cơ sở dữ liệu Amazon RDS được tạo trực tiếp bên trong phần cài đặt môi trường Elastic Beanstalk. Kiến trúc này mang lại rủi ro lớn nào trong môi trường production?

**Đáp án đúng:** **A**

Trong bài thi AWS DVA-C02, **không bao giờ** gắn RDS production trực tiếp vào vòng đời của Elastic Beanstalk environment. Hãy tạo RDS độc lập bên ngoài và truyền chuỗi kết nối qua Environment Properties hoặc Secrets Manager.

- **A (Đúng):** Đúng! RDS tạo **bên trong** Elastic Beanstalk có vòng đời gắn chặt với môi trường đó; khi terminate environment hoặc thực hiện Blue/Green swap rồi xóa môi trường cũ, RDS sẽ bị xóa theo.
- **B:** Sai vì Elastic Beanstalk tự động inject `RDS_HOSTNAME`, `RDS_PORT`, `RDS_USERNAME`, `RDS_PASSWORD`.
- **C:** Sai vì Elastic Beanstalk hỗ trợ nhiều engine (MySQL, PostgreSQL, SQL Server, Oracle).
- **D:** Sai, vấn đề cốt lõi của đề thi là **coupling vòng đời (lifecycle coupling)** giữa Environment và Database.

</details>

### Câu 16 `medium`

A developer runs an application on Amazon ECS on EC2 instances behind an Application Load Balancer (ALB). Multiple copies of the same container task need to run on a single EC2 host simultaneously, listening on container port 8080, without port conflicts. Which ECS task definition port mapping configuration enables this?

- **A.** Use `host` network mode and set both `hostPort` and `containerPort` to `8080` in the ECS task definition.
- **B.** Use `none` network mode and attach a Classic Load Balancer (CLB) to route traffic to container port `8080`.
- **C.** Use `bridge` network mode and set `hostPort` to `0` (dynamic port mapping) with `containerPort` `8080`.
- **D.** Use `bridge` network mode and hardcode `hostPort` to `8080` alongside `containerPort: 8080`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer vận hành một ứng dụng trên Amazon ECS trên các EC2 instance phía sau một Application Load Balancer (ALB). Nhiều bản sao của cùng một container task cần chạy đồng thời trên một máy chủ EC2 duy nhất, lắng nghe trên cổng container 8080, mà không bị xung đột cổng. Cấu hình port mapping nào trong ECS task definition cho phép điều này?

**Đáp án đúng:** **C**

**Dynamic Port Mapping** trên ECS EC2 (`bridge` mode + `hostPort: 0`) kết hợp với **ALB Target Group** cho phép chạy nhiều task cùng container port trên một EC2 instance.

- **A:** Sai vì với `host` mode, chỉ 1 container có thể bind vào port 8080 trên cùng 1 EC2 host.
- **B:** Sai vì `none` mode ngắt kết nối mạng của container.
- **C (Đúng):** Đúng! Khi dùng `bridge` mode và `hostPort: 0`, Docker tự cấp một port ngẫu nhiên trên EC2 host cho mỗi task và ECS tự động đăng ký host port đó vào ALB Target Group.
- **D:** Sai vì gán cứng `hostPort: 8080` sẽ gây xung đột cổng ngay ở container thứ 2 trên cùng EC2 host.

</details>

### Câu 17 `medium`

A developer pushes Docker images to Amazon ECR for CI/CD deployments. Recently, another engineer accidentally overwrote the `v1.2.0` production image tag with a buggy build, breaking rollbacks. Which Amazon ECR feature prevents an existing image tag from being overwritten?

- **A.** Enable Scan on Push (`Basic` or `Enhanced`) on the Amazon ECR repository settings.
- **B.** Attach an ECR Lifecycle Policy matching image tag prefix `v*` with a count limit.
- **C.** Enable AWS KMS server-side encryption on the Amazon ECR repository.
- **D.** Configure Image Tag Mutability to `IMMUTABLE` on the Amazon ECR repository.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer push các Docker image lên Amazon ECR cho các đợt triển khai CI/CD. Gần đây, một kỹ sư khác vô tình ghi đè lên image tag production `v1.2.0` bằng một bản build bị lỗi, làm hỏng khả năng rollback. Tính năng nào của Amazon ECR ngăn không cho ghi đè lên một image tag hiện có?

**Đáp án đúng:** **D**

Bật **Tag Immutability** (`IMMUTABLE`) giúp đảm bảo mỗi version tag (`v1.2.0`) luôn trỏ tới đúng 1 digest duy nhất để rollback an toàn.

- **A:** Sai vì Scan on Push chỉ quét lỗ hổng CVE, không khóa việc ghi đè tag.
- **B:** Sai vì Lifecycle Policy dùng để tự động xóa image cũ/hết hạn.
- **C:** Sai vì mã hóa không ngăn người có quyền push ghi đè tag.
- **D (Đúng):** Đúng! Bật **Image Tag Immutability (`IMMUTABLE`)** trên ECR repository sẽ từ chối mọi thao tác `docker push` sử dụng tag đã tồn tại.

</details>

### Câu 18 `medium`

A developer deploys an ECS service using the `awsvpc` network mode on Fargate. Each task needs to restrict inbound traffic so only an Application Load Balancer can reach it on port 8000, while outbound traffic is limited to an RDS PostgreSQL database. Where does the developer attach these network rules?

- **A.** Configure `PORT_SECURITY` environment variables inside the container `Dockerfile`.
- **B.** Attach the Security Group to the underlying AWS Fargate host EC2 instance.
- **C.** Configure an IAM Task Role inline policy granting `ec2:AuthorizeSecurityGroupIngress` and `ec2:RevokeSecurityGroupIngress`.
- **D.** Attach a dedicated Security Group directly to the ECS Service's `networkConfiguration` (`awsvpcConfiguration`).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer triển khai một dịch vụ ECS sử dụng chế độ mạng `awsvpc` trên Fargate. Mỗi task cần giới hạn lưu lượng chiều vào sao cho chỉ Application Load Balancer mới có thể kết nối tới nó trên cổng 8000, trong khi lưu lượng chiều ra bị giới hạn tới cơ sở dữ liệu RDS PostgreSQL. Developer gắn các quy tắc mạng này ở đâu?

**Đáp án đúng:** **D**

Ưu điểm lớn nhất của **`awsvpc` network mode** trên ECS/Fargate là mỗi Task có ENI riêng và gắn được **Security Group ở cấp độ từng Task**.

- **A:** Sai, `Dockerfile` không quản lý AWS Security Group.
- **B:** Sai vì Fargate là serverless compute, bạn không quản lý EC2 host.
- **C:** Sai vì đây là quyền API IAM chứ không phải gắn Security Group cho traffic của Task.
- **D (Đúng):** Đúng! Với `awsvpc` mode, mỗi ECS Task có một **ENI riêng** và nhận **Security Group riêng** cấu hình trong `awsvpcConfiguration`.

</details>

### Câu 19 `medium`

A developer uses Elastic Beanstalk with an Application Load Balancer. How can the developer store custom configuration settings like scaling thresholds and ALB health check paths directly inside the application source code repository so every environment created from the bundle receives the same settings?

- **A.** Place a `buildspec.yml` file inside the `.ebextensions/` directory of the source bundle.
- **B.** Add YAML/JSON configuration files inside a `.ebextensions/` directory at the root of the source bundle.
- **C.** Put the environment settings inside an `appspec.yml` file at the root of the project.
- **D.** Store the environment configuration in `/etc/eb-config.json` on the developer's local workstation for deployment.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer sử dụng Elastic Beanstalk với một Application Load Balancer. Làm thế nào developer có thể lưu trữ các thiết lập cấu hình tùy chỉnh như ngưỡng scaling và đường dẫn health check của ALB trực tiếp bên trong repository mã nguồn ứng dụng để mọi môi trường được tạo từ gói nguồn đều nhận được các thiết lập giống nhau?

**Đáp án đúng:** **B**

Elastic Beanstalk đọc các file `.config` trong thư mục **`.ebextensions/`** ở gốc source bundle để áp dụng `option_settings` và tùy biến môi trường.

- **A:** Sai vì `buildspec.yml` là file cấu hình của AWS CodeBuild.
- **B (Đúng):** Đúng! Thư mục `.ebextensions/*.config` đặt ở root source bundle dùng `option_settings` để khai báo cấu hình ALB, Auto Scaling, environment properties và tài nguyên AWS.
- **C:** Sai vì `appspec.yml` dùng cho AWS CodeDeploy.
- **D:** Sai vì không đi kèm source bundle.

</details>

### Câu 20 `medium`

A company hosts a web application on AWS Elastic Beanstalk in a production environment. During application updates, the team requires that: (1) full capacity is maintained at all times; (2) no existing EC2 instances are reused for the new version; (3) new instances are launched in the Same Auto Scaling group and must pass Elastic Load Balancer health checks before old instances are terminated; and (4) rollbacks are fast if an issue occurs. Which Elastic Beanstalk deployment policy meets these requirements?

- **A.** Rolling
- **B.** Rolling with additional batch
- **C.** Immutable
- **D.** All at once

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ một ứng dụng web trên AWS Elastic Beanstalk trong môi trường production. Trong quá trình cập nhật ứng dụng, nhóm yêu cầu rằng: (1) duy trì toàn bộ công suất (full capacity) mọi lúc; (2) không tái sử dụng bất kỳ EC2 instance hiện có nào cho phiên bản mới; (3) các instance mới được khởi chạy trong cùng Auto Scaling group và phải vượt qua Elastic Load Balancer health check trước khi các instance cũ bị chấm dứt; và (4) rollback nhanh chóng nếu xảy ra sự cố. Chính sách triển khai Elastic Beanstalk nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **C**

Bảng nhớ nhanh 6 chiến lược Deployment của **Elastic Beanstalk**:
- **All at once**: Nhanh nhất, có downtime, 0 chi phí thêm.
- **Rolling**: Giảm capacity theo từng batch, cài đè máy cũ.
- **Rolling with additional batch**: Giữ nguyên 100% capacity, tạo thêm 1 batch mới nhưng vẫn cài đè lên các máy còn lại.
- **Immutable**: Tạo dàn máy mới 100% trong cùng môi trường, kiểm tra Health Check xong mới xóa máy cũ.
- **Blue/Green**: Tạo một Environment mới hoàn toàn độc lập rồi đổi CNAME bằng Route 53.
- **Traffic Splitting (Canary)**: Chuyển một phần % lưu lượng sang bản mới để kiểm thử.

- **A:** Sai vì `Rolling` tái sử dụng các máy EC2 hiện có và làm giảm công suất phục vụ (capacity) đi một batch trong lúc triển khai.
- **B:** Sai vì `Rolling with additional batch` chỉ tạo thêm 1 batch máy mới còn các batch tiếp theo vẫn cài đè lên các máy EC2 cũ đang chạy.
- **C (Đúng):** Đúng! Chiến lược **Immutable** tạo một Auto Scaling Group tạm thời với các EC2 instances hoàn toàn mới chạy phiên bản mới; sau khi vượt qua ELB health check, chúng được chuyển vào ASG chính và xóa các instances cũ (đảm bảo không bao giờ trộn lẫn code cũ/mới trên cùng 1 máy và rollback cực nhanh).
- **D:** Sai vì `All at once` cập nhật trực tiếp lên các máy hiện tại cùng lúc và gây downtime.

</details>

### Câu 21 `medium`

A developer wants to install a custom monitoring agent and configure operating system cron jobs across all Amazon EC2 instances managed by an AWS Elastic Beanstalk environment. These configurations must be version-controlled inside the application source bundle and applied automatically whenever Elastic Beanstalk provisions or updates instances. Where should the developer place these configuration files?

- **A.** Inside `/tmp/eb-config/` by connecting manually via SSH to one running EC2 instance in the Elastic Beanstalk environment.
- **B.** In a `buildspec.yml` file stored in an Amazon S3 bucket and referenced by the Elastic Beanstalk environment configuration.
- **C.** In an `appspec.yml` file placed inside the `/etc/` directory of the Amazon Linux AMI used by the Elastic Beanstalk instances.
- **D.** In YAML/JSON files with a `.config` extension inside the `.ebextensions/` directory at the root of the application source bundle.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer muốn cài đặt một monitoring agent tùy chỉnh và cấu hình các cron job của hệ điều hành trên tất cả các Amazon EC2 instance được quản lý bởi một môi trường AWS Elastic Beanstalk. Các cấu hình này phải được quản lý phiên bản (version-controlled) bên trong gói mã nguồn ứng dụng và được áp dụng tự động bất cứ khi nào Elastic Beanstalk cấp phát hoặc cập nhật instance. Developer nên đặt các tệp cấu hình này ở đâu?

**Đáp án đúng:** **D**

Ba tên file cấu hình bắt buộc phân biệt trong đề DVA:
- **`.ebextensions/*.config`** (hoặc `.platform/hooks/`): Cấu hình **AWS Elastic Beanstalk**.
- **`buildspec.yml`**: Cấu hình các pha (`install`, `pre_build`, `build`, `post_build`) của **AWS CodeBuild**.
- **`appspec.yml`**: Cấu hình các hooks triển khai của **AWS CodeDeploy**.

- **A:** Sai vì mọi thay đổi thủ công qua SSH sẽ bị mất ngay khi Auto Scaling thay thế hoặc thêm máy chủ EC2 mới.
- **B:** Sai vì `buildspec.yml` là tệp cấu hình của AWS CodeBuild, không phải cấu hình máy chủ Elastic Beanstalk.
- **C:** Sai vì `appspec.yml` là tệp cấu hình của AWS CodeDeploy.
- **D (Đúng):** Đúng! Thư mục `.ebextensions/*.config` ở gốc gói mã nguồn cho phép cấu hình tài nguyên AWS, cài đặt package (`packages`, `files`, `commands`, `container_commands`) tự động trên mọi máy chủ Elastic Beanstalk.

</details>

### Câu 22 `medium`

A company runs containerized microservices on an Amazon ECS cluster backed by Amazon EC2 instances. Each container needs its own dedicated private IPv4 address from the VPC subnet so that individual security groups can be attached directly to each ECS task. Which ECS network mode should the developer specify in the task definition?

- **A.** none
- **B.** awsvpc
- **C.** bridge
- **D.** host

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty chạy các microservice đóng gói container trên một Amazon ECS cluster được hỗ trợ bởi các Amazon EC2 instance. Mỗi container cần có địa chỉ private IPv4 riêng từ VPC subnet để có thể gắn trực tiếp từng security group riêng lẻ vào mỗi ECS task. Developer nên chỉ định ECS network mode nào trong task definition?

**Đáp án đúng:** **B**

Trong Amazon ECS, chế độ mạng **`awsvpc`** là chế độ duy nhất cấp **ENI riêng + Private IP riêng + Security Group riêng** cho mỗi Task.

- **A:** Sai vì `none` tắt hoàn toàn kết nối mạng bên ngoài của container.
- **B (Đúng):** Đúng! Chế độ mạng `awsvpc` cấp cho mỗi ECS Task một card mạng Elastic Network Interface (ENI) riêng biệt kèm địa chỉ IP riêng trong Subnet và gắn được Security Group riêng cho từng Task (đây cũng là chế độ bắt buộc duy nhất trên AWS Fargate).
- **C:** Sai vì `bridge` dùng mạng ảo Docker nội bộ trên máy chủ EC2 và ánh xạ cổng (port mapping), không cấp ENI hay Security Group riêng cho từng Task.
- **D:** Sai vì `host` dùng chung trực tiếp card mạng và cổng của máy chủ EC2 vật lý.

</details>

---

[← Chủ đề 04](04-s3-cloudfront.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chủ đề 06 →](06-aws-lambda.md)
