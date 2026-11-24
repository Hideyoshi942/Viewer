# Chương 16 – ECS, ECR & Fargate - Docker in AWS

> **Nguồn:** 16 video của chương + *Containers on AWS Quiz* (15 câu).
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay (2026). Kỳ thi hiện hành là **DVA-C02**; nội dung container trong chương vẫn đúng trọng tâm của đề.

## Mục tiêu chương

Sau chương này bạn có thể:

- Giải thích Docker, image, container, registry và khác biệt giữa container với máy ảo (VM).
- Phân biệt các cách chạy container trên AWS: **ECS** (EC2 launch type, **Fargate**), **EKS**, và nơi lưu image **ECR**.
- Phân biệt **EC2 Instance Profile**, **ECS Task Role** và **Task Execution Role**.
- Tạo ECS cluster, task definition, service có ALB; scale service bằng tay và tự động.
- Hiểu **rolling update** (minimum healthy percent / maximum percent).
- Nắm các trường quan trọng trong **task definition**: port mapping (dynamic host port), environment variables từ SSM/Secrets Manager/S3, volume (bind mount, EFS), essential container, logging.
- Hiểu **task placement strategy** (binpack, spread, random) và **constraint** (distinctInstance, memberOf).
- Push/pull image lên **ECR** bằng AWS CLI và Docker.
- Biết vai trò của **AWS Copilot CLI** và tình trạng hiện nay của công cụ này.
- Hiểu **EKS**: node types, Fargate, storage qua CSI driver.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001 | Docker Introduction | Bài 1 – Giới thiệu Docker |
| 002 | Amazon ECS | Bài 2 – Tổng quan Amazon ECS (launch type, IAM role, Load Balancer, EFS) |
| 003, 004, 011 | Creating ECS Cluster / Creating ECS Service / Clean Up - Hands On | Bài 3 – Thực hành: tạo ECS Cluster, Service và dọn dẹp |
| 005 | Amazon ECS - Auto Scaling | Bài 4 – ECS Service Auto Scaling |
| 006 | Amazon ECS - Rolling Updates | Bài 5 – Rolling Updates |
| 007 | Amazon ECS - Solutions Architectures | Bài 6 – Các kiến trúc mẫu với ECS |
| 008, 009 | ECS Task Definitions - Deep Dive | Bài 7 – Task Definition chi tiết |
| 010 | Amazon ECS - Task Placements | Bài 8 – Task Placement |
| 012, 013 | Amazon ECR | Bài 9 – Amazon ECR |
| 014, 015 | AWS Copilot - Overview | Bài 10 – AWS Copilot CLI |
| 016 | Amazon EKS | Bài 11 – Amazon EKS |
| Quiz | Containers on AWS Quiz | Câu hỏi ôn tập |

---

## Bài 1 – Giới thiệu Docker

### Lý thuyết

- **Docker** là nền tảng phát triển phần mềm để **triển khai ứng dụng** dưới dạng **container**.
- Ứng dụng được **đóng gói vào container** theo chuẩn chung, nên chạy được trên **mọi hệ điều hành / máy** với hành vi **giống nhau**:
  - Không còn lỗi tương thích ("máy tôi chạy được").
  - Hành vi dự đoán được, ít việc hơn, dễ bảo trì và triển khai.
  - Dùng được với mọi ngôn ngữ, hệ điều hành, công nghệ.
- **Use case:** kiến trúc **microservice** (từ khoá quan trọng), **lift-and-shift** ứng dụng từ on-premises lên cloud, và bất cứ khi nào bạn muốn chạy container.
- Cách chạy: trên một server (ví dụ EC2) cài **Docker agent/daemon**, rồi chạy nhiều container: container Java, container Node.js, nhiều bản sao của cùng một ứng dụng, thậm chí database (MySQL…).

#### Nơi lưu Docker image (Docker Repository / Registry)

| Registry | Đặc điểm |
|---|---|
| **Docker Hub** | Public, rất phổ biến, có base image cho Ubuntu, MySQL, Node… |
| **Amazon ECR** (Elastic Container Registry) | Registry **private** của AWS |
| **Amazon ECR Public Gallery** | Tuỳ chọn **public** của ECR |

#### Docker so với Virtual Machine

| | Virtual Machine (ví dụ EC2) | Docker container |
|---|---|---|
| Kiến trúc | Infrastructure → Host OS → **Hypervisor** → Guest OS + App | Infrastructure → Host OS (có thể là EC2) → **Docker Daemon** → các container |
| Tài nguyên | Mỗi VM tách biệt, không chia sẻ | Container **chia sẻ tài nguyên với host** (kernel, mạng, có thể chia sẻ dữ liệu) |
| Độ cô lập | Cao | Thấp hơn ("kém an toàn hơn" một chút) |
| Mật độ | Ít VM / server | **Nhiều container / server**, nhẹ |

#### Quy trình làm việc với Docker

```
Dockerfile --(docker build)--> Image --(docker push)--> Registry (Docker Hub / ECR)
Registry --(docker pull)--> Image --(docker run)--> Container
```

#### Quản lý container trên AWS

| Dịch vụ | Vai trò |
|---|---|
| **Amazon ECS** (Elastic Container Service) | Nền tảng điều phối container **riêng của AWS** |
| **Amazon EKS** (Elastic Kubernetes Service) | **Kubernetes** (open-source) do AWS quản lý |
| **AWS Fargate** | Nền tảng container **serverless** của AWS, dùng được với **cả ECS và EKS** |
| **Amazon ECR** | Lưu container image |

### Kiến thức thực tế

Ví dụ Dockerfile tối giản cho ứng dụng Node.js:

```dockerfile
FROM public.ecr.aws/docker/library/node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
USER node
CMD ["node", "server.js"]
```

```bash
docker build -t my-app:1.0 .
docker run -d -p 8080:3000 --name my-app my-app:1.0   # host 8080 -> container 3000
docker ps
docker logs my-app
```

- Dùng base image từ **ECR Public Gallery** (`public.ecr.aws/...`) giúp tránh bị Docker Hub giới hạn số lần pull (rate limit) khi build trong CI/CD.
- Nếu build trên máy Apple Silicon (ARM) mà chạy trên Fargate x86_64, image sẽ lỗi `exec format error`. Hãy build đúng kiến trúc: `docker build --platform linux/amd64 ...`, hoặc chọn `runtimePlatform` ARM64 (Graviton, rẻ hơn) trong task definition.
- Best practice: image nhỏ (alpine/distroless), multi-stage build, không chạy bằng root, không đưa secret vào image.

### Ghi nhớ cho kỳ thi

- "Microservice", "đóng gói ứng dụng chạy giống nhau mọi nơi" thì nghĩ tới **Docker/container**.
- Lưu image: **ECR** (private) hoặc Docker Hub (public).
- **Fargate** = serverless, dùng cho cả ECS và EKS.

---

## Bài 2 – Tổng quan Amazon ECS

### Lý thuyết

- Chạy Docker container trên AWS với ECS nghĩa là chạy **ECS Task** trên một **ECS Cluster**.

#### Hai launch type

| | **EC2 Launch Type** | **Fargate Launch Type** |
|---|---|---|
| Hạ tầng | **Bạn tự provision và bảo trì** EC2 instances | **Không có EC2 để quản lý**, serverless |
| Yêu cầu | Mỗi EC2 phải chạy **ECS Agent** để đăng ký instance vào ECS cluster | Chỉ cần tạo **task definition**; AWS chạy task theo CPU/RAM khai báo |
| Đặt container | AWS tự start/stop container và đặt lên các instance | AWS tự quyết định chạy ở đâu |
| Scale | Scale task **và** scale cả EC2 instances | Chỉ cần **tăng số task** |
| Đề thi | — | Đề **rất thích Fargate** vì dễ quản lý nhất |

#### IAM Roles cho ECS

| Role | Áp dụng | Ai dùng | Dùng để |
|---|---|---|---|
| **EC2 Instance Profile** | Chỉ **EC2 launch type** | **ECS Agent** | Gọi ECS API (đăng ký instance), gửi log lên **CloudWatch Logs**, **pull image từ ECR**, tham chiếu dữ liệu nhạy cảm trong **Secrets Manager / SSM Parameter Store** |
| **ECS Task Role** | **Cả EC2 và Fargate** | **Container trong task** | Gọi dịch vụ AWS mà ứng dụng cần (S3, DynamoDB, SQS…) |

- Mỗi task có thể có **role riêng**: Task A dùng *Task A Role* (truy cập S3), Task B dùng *Task B Role* (truy cập DynamoDB).
- Task Role được khai báo trong **task definition**.

#### Tích hợp Load Balancer

| Loại | Khuyến nghị |
|---|---|
| **Application Load Balancer (ALB)** | Phù hợp **hầu hết use case** (HTTP/HTTPS), hoạt động với **Fargate** |
| **Network Load Balancer (NLB)** | Chỉ khi cần **throughput/hiệu năng rất cao**, hoặc dùng với **AWS PrivateLink** |
| Classic Load Balancer | Được hỗ trợ nhưng **không khuyến nghị**: không có tính năng nâng cao, **không dùng được với Fargate** |

#### Lưu trữ dữ liệu bền vững (Data Volumes) – Amazon EFS

- Gắn (mount) **Amazon EFS** (network file system) trực tiếp vào ECS task.
- Hoạt động với **cả EC2 và Fargate launch type**.
- Task ở **bất kỳ AZ nào** mount cùng EFS sẽ **chia sẻ cùng dữ liệu** (có thể giao tiếp qua file system).
- **Combo tối thượng: Fargate + EFS**, cả hai đều serverless, trả tiền theo dùng.
- Use case: **lưu trữ dùng chung, bền vững, multi-AZ** cho container.

### Kiến thức thực tế

- Ngoài 2 launch type trong video, ECS hiện còn có:
  - **Capacity provider** (cách khuyến nghị thay cho chỉ định launch type): `FARGATE`, `FARGATE_SPOT`, hoặc ASG capacity provider.
  - **Amazon ECS Managed Instances** (ra mắt cuối 2025, xuất hiện ở video 003): AWS quản lý EC2 instances cho bạn (chọn loại instance, vá lỗi, scale), bạn vẫn có quyền chọn loại instance như GPU. Nằm giữa Fargate và EC2 tự quản.
  - **ECS Anywhere**: chạy task trên server on-premises.
- Có thêm **Task Execution Role** (xem Bài 7): role mà **ECS agent / Fargate** dùng để **pull image từ ECR, ghi log CloudWatch, đọc secret** khi khởi động task. Với Fargate không có instance profile, nên những việc đó do **execution role** đảm nhận.
- **Bảng phân biệt 3 role (rất hay gây nhầm):**

  | Câu hỏi | Role |
  |---|---|
  | Code trong container gọi S3/DynamoDB | **Task Role** |
  | Fargate không pull được image ECR / không đọc được secret | **Task Execution Role** |
  | EC2 container instance không đăng ký được vào cluster | **EC2 Instance Profile** (`ecsInstanceRole`) |

- **EBS cho ECS:** từ 2024, ECS hỗ trợ gắn **EBS volume** vào task (kể cả Fargate), nhưng mỗi volume chỉ gắn cho **một task**, không chia sẻ được. Muốn chia sẻ giữa nhiều task, nhiều AZ thì vẫn dùng **EFS**.
- Với EFS trên Fargate cần mở port **2049 (NFS)** từ security group của task tới security group của EFS mount target.

### Ghi nhớ cho kỳ thi

- "Không muốn quản lý hạ tầng", "serverless container" thì chọn **Fargate**.
- Container cần gọi dịch vụ AWS thì sửa **ECS Task Role** (không sửa EC2 Instance Profile).
- ALB là lựa chọn mặc định; NLB cho hiệu năng cao/PrivateLink; CLB không dùng với Fargate.
- Chia sẻ file giữa các task, multi-AZ, Fargate thì dùng **EFS** (không phải EBS hay Instance Store).

---

## Bài 3 – Thực hành: tạo ECS Cluster, Service và dọn dẹp

### Lý thuyết

- Một ECS cluster có thể có nhiều **capacity provider**:
  - **FARGATE**: chạy task serverless.
  - **FARGATE_SPOT**: chạy task Fargate với giá Spot (rẻ hơn, có thể bị thu hồi).
  - **ASG provider**: chạy task trên EC2 instances do một Auto Scaling Group quản lý (*managed scaling*).
- Khi tạo cluster, console hiện có 3 lựa chọn hạ tầng:
  - **Fargate only**: serverless.
  - **Fargate and Managed Instances**: AWS quản lý EC2 phía sau. Cần **instance profile** (`ecsInstanceRole`, use case *EC2 Role for ECS Managed Instances*) và **infrastructure role** (use case *Infrastructure for ECS Managed Instances*). Có thể để ECS tự chọn loại instance theo yêu cầu task, hoặc *Custom* (giới hạn vCPU/memory, *Allowed instance types* ví dụ chỉ `t3.micro`).
  - **Fargate and Self-managed instances**: cách cũ, bạn tự chọn ASG, AMI, instance type… AWS đang khuyến khích chuyển khỏi cách này.
- Một EC2 instance sau khi đăng ký vào cluster được gọi là **container instance**, hiển thị CPU/RAM còn trống (ví dụ 1024 CPU units, 982 MiB memory với instance nhỏ). Task được đặt lên instance tới khi hết capacity.
- **Service** duy trì số lượng task mong muốn (*desired tasks*), gắn với ALB/target group, tự thay task lỗi.
- Khi tạo service/cluster từ console, ECS dùng **CloudFormation** phía sau; khi xoá, CloudFormation xoá luôn listener, ALB, security group, target group, capacity provider, ASG, launch template.

### Kiến thức thực tế

- **Chi phí:** ALB tính phí theo giờ + LCU ngay cả khi không có task; Fargate tính theo vCPU-giây và GB-giây. Quên xoá ALB là nguồn phát sinh chi phí phổ biến khi học.
- Task Fargate ở **private subnet** cần **NAT Gateway** hoặc **VPC endpoints** (ECR `api`, ECR `dkr`, S3 gateway, CloudWatch Logs) để pull image. Thiếu đường ra internet thì task dừng với lỗi `CannotPullContainerError`.
- Security group của task chỉ nên mở port 80 **từ security group của ALB**, không mở `0.0.0.0/0` như demo.
- Xem lý do task dừng: `aws ecs describe-tasks --cluster DemoCluster --tasks <task-id> --query "tasks[].stoppedReason"`.

### Ghi nhớ cho kỳ thi

- Cluster có thể kết hợp FARGATE, FARGATE_SPOT và ASG capacity provider.
- EC2 container instance phải chạy **ECS agent**, có **instance profile** phù hợp, và dùng AMI có agent (**ECS-optimized AMI**) thì mới đăng ký được vào cluster. **Security group inbound không ảnh hưởng** đến việc đăng ký.

---

## Bài 4 – ECS Service Auto Scaling

### Lý thuyết

- Tự động tăng/giảm **số task** của service bằng **AWS Application Auto Scaling**.
- **3 metric** dùng để scale (cần nhớ):

  | Metric | Nguồn |
  |---|---|
  | `ECSServiceAverageCPUUtilization` | CPU của ECS service |
  | `ECSServiceAverageMemoryUtilization` | RAM của ECS service |
  | `ALBRequestCountPerTarget` | Số request mỗi target, từ ALB |

- **Kiểu scaling:**
  - **Target Tracking**: giữ một metric ở giá trị mục tiêu.
  - **Step Scaling**: scale theo bậc dựa trên CloudWatch Alarm.
  - **Scheduled Scaling**: scale trước theo lịch cho thay đổi dự đoán được.
- **Scale task ≠ scale EC2 instance.** Với EC2 launch type bạn phải scale cả cluster. Với **Fargate** thì chỉ cần scale task, dễ hơn nhiều; đây là lý do đề hay đẩy về Fargate.

#### Scale EC2 cho EC2 launch type

| Cách | Đặc điểm |
|---|---|
| **Auto Scaling Group Scaling** | Scale ASG theo metric (ví dụ CPU của instance) |
| **ECS Cluster Capacity Provider** (khuyến nghị) | Gắn với ASG; **khi thiếu CPU/RAM để đặt task mới, tự động thêm EC2**. Thông minh hơn |

- Luồng: CPU của service tăng → **CloudWatch Metric** → **CloudWatch Alarm** → Application Auto Scaling tăng **desired count** → task mới được tạo → (nếu EC2 launch type) **Capacity Provider** thêm EC2 khi thiếu chỗ.

### Kiến thức thực tế

Cấu hình target tracking bằng CLI:

```bash
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/DemoCluster/nginxdemos-hello \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 1 --max-capacity 10

aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/DemoCluster/nginxdemos-hello \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name cpu60 --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 60.0,
    "PredefinedMetricSpecification": {"PredefinedMetricType": "ECSServiceAverageCPUUtilization"},
    "ScaleOutCooldown": 60, "ScaleInCooldown": 120
  }'
```

- Muốn scale theo **độ dài hàng đợi SQS** (Bài 6) thì dùng target tracking với **custom metric** (ví dụ "số message / task", tính bằng metric math).
- ECS service auto scaling hiện cũng hỗ trợ **predictive scaling** (dự đoán theo lịch sử tải).
- Đặt `minimum` hợp lý; scale-in quá nhanh dễ làm dao động (flapping).

### Ghi nhớ cho kỳ thi

- Nhớ 3 metric: **CPU, Memory, ALB Request Count Per Target**.
- EC2 launch type cần scale thêm EC2 thì chọn **ECS Cluster Capacity Provider**.
- Fargate giúp auto scaling dễ hơn vì không có instance.

---

## Bài 5 – Rolling Updates

### Lý thuyết

- Khi cập nhật service từ v1 lên v2 (chọn revision task definition mới), ECS thay task theo **rolling update**, điều khiển bởi 2 tham số:

  | Tham số | Ý nghĩa | Mặc định |
  |---|---|---|
  | **Minimum healthy percent** | Tỉ lệ task tối thiểu phải đang chạy (so với desired). Dưới 100% cho phép **tắt bớt task cũ trước** | **100%** |
  | **Maximum percent** | Tỉ lệ task tối đa được chạy cùng lúc. Trên 100% cho phép **tạo thêm task mới trước** | **200%** |

- **Kịch bản 1: min 50%, max 100%, 4 task**

  | Bước | Hành động | Capacity |
  |---|---|---|
  | 1 | Tắt 2 task v1 | 50% |
  | 2 | Tạo 2 task v2 | 100% |
  | 3 | Tắt 2 task v1 còn lại | 50% |
  | 4 | Tạo 2 task v2 | 100% (toàn bộ v2) |

- **Kịch bản 2: min 100%, max 150%, 4 task**

  | Bước | Hành động | Capacity |
  |---|---|---|
  | 1 | Không được tắt task (min 100%) → tạo 2 task v2 | 150% |
  | 2 | Tắt 2 task v1 | 100% |
  | 3 | Tạo 2 task v2 | 150% |
  | 4 | Tắt 2 task v1 còn lại | 100% (toàn bộ v2) |

- Chủ đề này thường chỉ xuất hiện khoảng **1 câu** trong đề.

### Kiến thức thực tế

```bash
aws ecs update-service --cluster DemoCluster --service nginxdemos-hello \
  --task-definition nginxdemos-hello:2 \
  --deployment-configuration "minimumHealthyPercent=100,maximumPercent=200,deploymentCircuitBreaker={enable=true,rollback=true}"
```

- **Deployment circuit breaker**: nếu task mới liên tục fail, ECS dừng deployment và **tự rollback** về bản ổn định trước đó. Nên bật cho mọi service.
- **Cập nhật 2025 (sau video):** ECS có **blue/green deployment tích hợp sẵn** (không bắt buộc dùng CodeDeploy như trước), sau đó bổ sung kiểu **linear** và **canary**, kèm lifecycle hook (Lambda) và thời gian "bake". Trước đây blue/green cho ECS phải qua **CodeDeploy** (sẽ gặp ở chương CI/CD; đề DVA-C02 vẫn có thể hỏi `AppSpec` của CodeDeploy cho ECS).
- Dùng tag image cố định (ví dụ `:1.4.2` hoặc digest) thay vì `:latest`, để mỗi revision task definition trỏ đúng một phiên bản và rollback được.

### Ghi nhớ cho kỳ thi

- **Min healthy < 100%**: được tắt task cũ trước (tiết kiệm, nhưng giảm capacity).
- **Max > 100%**: được tạo task mới trước (giữ capacity, tốn thêm tài nguyên tạm thời).
- Mặc định **100% / 200%**.

---

## Bài 6 – Các kiến trúc mẫu với ECS

### Lý thuyết

| # | Kiến trúc | Luồng |
|---|---|---|
| 1 | **ECS task được EventBridge kích hoạt** | User upload object vào **S3** → sự kiện gửi tới **EventBridge** → rule **chạy ECS task** (Fargate) → task dùng **Task Role** để đọc object từ S3, xử lý, ghi kết quả vào **DynamoDB**. Kiến trúc **serverless** xử lý file bằng Docker container |
| 2 | **EventBridge Schedule** | Rule chạy **mỗi 1 giờ** → chạy task Fargate → task (có Task Role truy cập S3) làm **batch processing** trên file S3. Serverless hoàn toàn |
| 3 | **ECS + SQS** | Service gồm nhiều task **poll message** từ hàng đợi SQS và xử lý. Bật **ECS Service Auto Scaling**: càng nhiều message, càng nhiều task |
| 4 | **EventBridge bắt sự kiện từ ECS** | Task start/stop trong cluster sinh sự kiện **"ECS Task State Change"** (ví dụ `lastStatus: STOPPED` + `stoppedReason`) → EventBridge → **SNS** gửi email cho admin. Giúp theo dõi **vòng đời container** |

Ví dụ event pattern cho kiến trúc 4:

```json
{
  "source": ["aws.ecs"],
  "detail-type": ["ECS Task State Change"],
  "detail": {
    "lastStatus": ["STOPPED"],
    "clusterArn": ["arn:aws:ecs:eu-central-1:123456789012:cluster/DemoCluster"]
  }
}
```

### Kiến thức thực tế

Tạo rule EventBridge chạy task Fargate mỗi giờ:

```bash
aws events put-rule --name hourly-batch --schedule-expression "rate(1 hour)"

aws events put-targets --rule hourly-batch --targets '[{
  "Id": "1",
  "Arn": "arn:aws:ecs:eu-central-1:123456789012:cluster/DemoCluster",
  "RoleArn": "arn:aws:iam::123456789012:role/ecsEventsRole",
  "EcsParameters": {
    "TaskDefinitionArn": "arn:aws:ecs:eu-central-1:123456789012:task-definition/batch-job",
    "LaunchType": "FARGATE",
    "TaskCount": 1,
    "NetworkConfiguration": {"awsvpcConfiguration": {
      "Subnets": ["subnet-aaa"], "SecurityGroups": ["sg-123"], "AssignPublicIp": "DISABLED"}}
  }
}]'
```

- Hiện AWS khuyến nghị dùng **EventBridge Scheduler** (dịch vụ lập lịch riêng, hỗ trợ time zone, one-time schedule) thay cho scheduled rule.
- **Role cho EventBridge** (`ecsEventsRole`) cần quyền `ecs:RunTask` và `iam:PassRole` để truyền task role/execution role. Thiếu `iam:PassRole` là lỗi rất hay gặp.
- Với S3 → EventBridge phải bật *Amazon EventBridge notifications* trên bucket.
- Job ngắn (vài giây, ít RAM) thì Lambda có thể rẻ hơn; job dài hơn **15 phút** hoặc cần môi trường tuỳ biến thì ECS Fargate phù hợp.

### Ghi nhớ cho kỳ thi

- "Chạy container theo lịch / theo sự kiện, serverless" = **EventBridge + ECS Fargate + Task Role**.
- "Scale worker theo số message trong hàng đợi" = **SQS + ECS Service Auto Scaling**.
- "Biết khi container dừng" = **EventBridge (ECS Task State Change) → SNS**.

---

## Bài 7 – Task Definition chi tiết

### Lý thuyết

- **Task definition** là metadata dạng **JSON** (console có UI hỗ trợ) cho ECS biết cách chạy một hoặc nhiều container. Thông tin quan trọng:
  - Image name
  - Port binding cho container và host (khi dùng EC2)
  - Memory và CPU
  - Environment variables
  - Networking
  - **IAM Role**
  - Logging configuration (ví dụ CloudWatch)
- Một task definition chứa **tối đa 10 container**.

#### Port mapping

- **EC2 launch type:** ví dụ Apache HTTP server, **container port 80**, ánh xạ sang **host port** (80 hoặc 8080, không cần giống). Internet vào EC2 qua host port, được chuyển tới container port.
- **Dynamic Host Port Mapping** (EC2 launch type + load balancer): nếu chỉ khai báo **container port**, để **host port = 0** (hoặc trống), mỗi task nhận một **host port ngẫu nhiên**.
  - **ALB** (khi gắn với ECS service) tự biết port nào để kết nối tới từng task.
  - **Không** hoạt động với **Classic Load Balancer**.
  - Security group của EC2 phải **cho phép mọi port** từ **security group của ALB**.
  - Cho phép **chạy nhiều bản sao cùng một container trên cùng một EC2**.
- **Fargate:** mỗi task có **private IP riêng** qua **ENI** (network mode `awsvpc`), **không có host port**, chỉ khai báo container port. ALB kết nối tới mọi task trên cùng port 80.
  - Security group của ENI task: cho phép port 80 **từ security group của ALB**.
  - Security group của ALB: cho phép **80/443 từ web**.

#### IAM Role trong task definition

- **IAM role được gán theo task definition** (không phải ở mức service).
- Mọi task tạo ra từ task definition đó (trong service) đều **tự động assume** role này.
- Task definition khác có thể có role khác (ví dụ một bên S3, một bên DynamoDB).
- **Task Role** và **Task Execution Role**:

  | | Task Role | Task Execution Role |
  |---|---|---|
  | Ai dùng | Ứng dụng trong container | **Container agent** (ECS agent / Fargate) |
  | Mục đích | Gọi dịch vụ AWS (S3, DynamoDB…) | Pull image ECR, gửi log CloudWatch, lấy secret từ Secrets Manager/SSM |
  | Mức độ quan trọng ở đề | **Rất cao** | Biết để phân biệt |

#### Environment variables

| Nguồn | Khi nào |
|---|---|
| **Hard-coded** trong task definition | Giá trị cố định, không bí mật (ví dụ URL) |
| **SSM Parameter Store** / **Secrets Manager** | Giá trị nhạy cảm (API key, config dùng chung, mật khẩu DB). Được **lấy và resolve lúc chạy**, inject vào container dưới dạng biến môi trường |
| **File trên Amazon S3** (`environmentFiles`) | Nạp hàng loạt biến môi trường (*bulk*) từ file |

#### Chia sẻ dữ liệu giữa các container (Bind Mount)

- Một task có thể có nhiều container; mẫu **sidecar** (container phụ cho logging, tracing, metrics…) rất phổ biến.
- Mount một **data volume (bind mount)** vào nhiều container trong cùng task để chia sẻ file (ví dụ `/var/logs`): app container ghi, sidecar đọc và gửi đi.
- Dùng được cho **cả EC2 và Fargate**:

  | | EC2 task | Fargate task |
  |---|---|---|
  | Lưu ở | **Storage của EC2 instance** | **Ephemeral storage** |
  | Vòng đời dữ liệu | Gắn với **vòng đời EC2 instance** | Gắn với **vòng đời task**; task mất thì dữ liệu mất |
  | Dung lượng | Theo đĩa instance | **20 GiB đến 200 GiB** |

#### Các tuỳ chọn khác trên console (video 009)

- **Launch type:** Fargate và/hoặc EC2. Fargate thì CPU/memory phải theo **các mức cố định**; EC2 thì nhập tự do.
- **Network mode:** Fargate **bắt buộc `awsvpc`**; EC2 có thể chọn `bridge`, `host`, `awsvpc`, `none`.
- **Essential container:** mỗi task phải có **ít nhất 1 container essential**. Container essential bị dừng thì **toàn bộ task dừng**; container không essential dừng thì task vẫn chạy.
- **Private registry authentication:** pull image từ registry private ngoài AWS bằng cách khai báo **ARN của secret trong Secrets Manager** (`repositoryCredentials`).
- **Port mappings:** nhiều port, protocol TCP/UDP, *app protocol* HTTP, HTTP2, gRPC.
- **Resource limits:** giới hạn vCPU, memory **hard limit** (`memory`) và **soft limit** (`memoryReservation`), hữu ích khi nhiều container chạy cạnh nhau.
- **Logging:** gửi trực tiếp lên **CloudWatch Logs** (`awslogs`: log group, region, stream prefix, auto-create group) hoặc qua **AWS FireLens** tới Splunk, Firehose, Kinesis Data Streams, OpenSearch, S3…
- **HealthCheck**, **start timeout** (không khởi động kịp thì bị kill), **stop timeout** (thời gian chờ trước khi bị kill cưỡng bức), Docker labels…
- **Storage:** volume dạng **bind mount** hoặc **EFS**; khai báo **mount points** cho từng container, hoặc `volumesFrom` (mount volume từ container khác).
- **Monitoring:** bật **trace collection** gửi tới **AWS X-Ray** qua sidecar **AWS Distro for OpenTelemetry (ADOT)** (console tự cộng thêm CPU/memory cho sidecar); thu **metrics** gửi tới CloudWatch hoặc **Amazon Managed Service for Prometheus**.
- Sau khi tạo có thể xem **JSON**; muốn sửa thì **Create new revision**.

### Kiến thức thực tế

- Biến lấy từ Secrets Manager/SSM chỉ được đọc **khi task khởi động**. Đổi secret thì phải **chạy task mới** (ví dụ `update-service --force-new-deployment`) mới nhận giá trị mới.
- Có thể lấy **một key JSON** trong secret: `"valueFrom": "arn:...:secret:prod/db-AbCdEf:password::"`.
- Fargate ephemeral storage mặc định **20 GiB**, tăng tới **200 GiB** bằng `"ephemeralStorage": {"sizeInGiB": 100}`.
- Fargate: CPU/memory theo các cặp hợp lệ, ví dụ 0.25 vCPU (0.5–2 GB), 0.5 vCPU (1–4 GB), 1 vCPU (2–8 GB)… tới 16 vCPU (32–120 GB). Khai báo sai cặp thì đăng ký task definition báo lỗi.
- Nhiều container trong cùng task `awsvpc` chia sẻ network namespace, gọi nhau qua `localhost:<port>`.
- **ECS Exec** (`aws ecs execute-command --interactive --command "/bin/sh"`) để vào shell của container khi debug (cần bật `enableExecuteCommand` và task role có quyền SSM Messages).

### Ghi nhớ cho kỳ thi

- IAM role cho task được định nghĩa ở **task definition**.
- Mỗi ứng dụng/service một **task role riêng** (least privilege), không gom quyền vào EC2 instance role.
- Chạy **nhiều bản sao cùng container trên cùng EC2** + load balancer = **ALB + dynamic host port mapping** (host port = 0). Container thứ hai không chạy được dù đủ CPU/RAM thì lỗi nằm ở **host port** cố định.
- Fargate: mỗi task một **ENI/private IP**, chỉ có container port.
- Secret cho container thì dùng **SSM Parameter Store / Secrets Manager**; bulk thì dùng **file trên S3**.
- Sidecar chia sẻ file thì dùng **bind mount**; Fargate ephemeral storage 20–200 GiB.

---

## Bài 8 – Task Placement

### Lý thuyết

- Với **EC2 launch type**, ECS phải quyết định **đặt task mới lên instance nào** (dựa trên CPU, memory, port còn trống) và khi **scale in** thì **tắt task nào**.
- Dùng **task placement strategy** và **task placement constraint** để điều khiển.
- **Chỉ áp dụng cho ECS trên EC2**, **không áp dụng cho Fargate** (AWS tự lo).
- Placement strategy là **best effort**.

#### Quy trình đặt task

1. Tìm các instance thoả **CPU, memory, port** theo task definition.
2. Lọc theo **task placement constraints**.
3. Chọn instance thoả tốt nhất **task placement strategy**.
4. Đặt task lên instance đó.

#### Placement strategies

| Strategy | Cách hoạt động | Mục tiêu |
|---|---|---|
| **binpack** | Đặt task lên instance có **ít CPU/memory còn trống nhất**; lấp đầy một instance rồi mới sang instance khác | **Tiết kiệm chi phí nhất** (ít instance nhất) |
| **random** | Đặt **ngẫu nhiên** | Đơn giản |
| **spread** | Rải đều theo một thuộc tính, ví dụ `instanceId` hoặc `attribute:ecs.availability-zone` | **High availability** |

```json
"placementStrategy": [{ "type": "binpack", "field": "memory" }]
"placementStrategy": [{ "type": "random" }]
"placementStrategy": [{ "type": "spread", "field": "attribute:ecs.availability-zone" }]
```

- Có thể **kết hợp** nhiều strategy, ví dụ spread theo AZ rồi spread theo instanceId, hoặc spread theo AZ rồi binpack theo memory:

```json
"placementStrategy": [
  { "type": "spread", "field": "attribute:ecs.availability-zone" },
  { "type": "binpack", "field": "memory" }
]
```

#### Placement constraints

| Constraint | Ý nghĩa |
|---|---|
| **distinctInstance** | Mỗi task đặt trên **một container instance khác nhau** (không bao giờ có 2 task trên cùng instance) |
| **memberOf** | Chỉ đặt lên instance thoả một biểu thức viết bằng **Cluster Query Language** |

```json
"placementConstraints": [{ "type": "distinctInstance" }]

"placementConstraints": [{
  "type": "memberOf",
  "expression": "attribute:ecs.instance-type =~ t2.*"
}]
```

### Kiến thức thực tế

```bash
aws ecs create-service --cluster DemoCluster --service-name api \
  --task-definition api:3 --desired-count 6 --launch-type EC2 \
  --placement-strategy type=spread,field=attribute:ecs.availability-zone type=binpack,field=memory \
  --placement-constraints type=memberOf,expression="attribute:ecs.instance-type =~ m5.*"
```

- Cấu hình phổ biến trong production: **spread theo AZ** (HA) rồi **binpack theo memory** (tiết kiệm).
- `distinctInstance` cùng với port host cố định giúp tránh xung đột port, nhưng cần đủ instance cho mọi task.
- Có thể dùng thuộc tính tuỳ chỉnh (custom attribute) cho instance, ví dụ `attribute:gpu == true`, để ép task GPU chạy đúng máy.
- Với **ECS Managed Instances**, AWS tự lo việc đặt task và tối ưu instance; placement strategy chủ yếu dùng cho EC2 tự quản.

### Ghi nhớ cho kỳ thi

- **binpack = tiết kiệm chi phí nhất.** **spread = HA.** **random = ngẫu nhiên.**
- **distinctInstance** = mỗi task một instance khác nhau. **memberOf** = dùng Cluster Query Language.
- Placement chỉ áp dụng cho **EC2 launch type**, không áp dụng cho Fargate.

---

## Bài 9 – Amazon ECR

### Lý thuyết

- **Amazon ECR (Elastic Container Registry)**: lưu và quản lý Docker image trên AWS.
- Hai lựa chọn:
  - **Private repository**: chỉ tài khoản của bạn (hoặc các tài khoản bạn cấp quyền) pull được.
  - **Public repository**: ai cũng pull được, xuất bản lên **Amazon ECR Public Gallery**.
- **Tích hợp đầy đủ với ECS**; image được lưu phía sau bởi **Amazon S3**.
- **Truy cập ECR được bảo vệ bằng IAM**. EC2 trong cluster cần IAM role (instance profile; với Fargate là task execution role) có quyền pull. **Lỗi quyền khi push/pull thì kiểm tra IAM policy.**
- Tính năng: **image vulnerability scanning**, versioning, **image tags**, **image lifecycle** (lifecycle policy).
- Tuỳ chọn khi tạo repository:
  - **Tag immutability**: không cho push đè cùng một tag.
  - **Scan on push**: quét lỗ hổng khi push. Video lưu ý tuỳ chọn ở mức repository đang bị deprecate, nên dùng **scan filter ở mức registry**; quét nâng cao (*enhanced scanning*) dùng **Amazon Inspector**.
  - **Mã hoá bằng KMS** (mặc định là AES-256 do AWS quản lý).

#### Lệnh push/pull

```bash
# Đăng nhập Docker vào ECR (AWS CLI v2)
aws ecr get-login-password --region region | \
  docker login --username AWS --password-stdin aws_account_id.dkr.ecr.region.amazonaws.com

# Push
docker push aws_account_id.dkr.ecr.region.amazonaws.com/demo:latest

# Pull
docker pull aws_account_id.dkr.ecr.region.amazonaws.com/demo:latest
```

- `get-login-password` trả về **mật khẩu tạm** (token), truyền qua pipe vào `docker login` với username **`AWS`**.
- Không push/pull được thì **thiếu IAM permission**.

### Kiến thức thực tế

- **Lệnh cũ** `aws ecr get-login` (CLI v1, in ra cả lệnh `docker login -p ...`) **đã bị loại bỏ trong CLI v2**. Hiện dùng `get-login-password`.
- Token đăng nhập ECR có hiệu lực **12 giờ**.
- Quyền tối thiểu để **push** (ví dụ cho CodeBuild):

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      { "Effect": "Allow", "Action": "ecr:GetAuthorizationToken", "Resource": "*" },
      { "Effect": "Allow",
        "Action": ["ecr:BatchCheckLayerAvailability", "ecr:InitiateLayerUpload",
                   "ecr:UploadLayerPart", "ecr:CompleteLayerUpload", "ecr:PutImage",
                   "ecr:BatchGetImage", "ecr:GetDownloadUrlForLayer"],
        "Resource": "arn:aws:ecr:eu-central-1:123456789012:repository/demostephane" }
    ]
  }
  ```

  Pull chỉ cần `GetAuthorizationToken`, `BatchGetImage`, `GetDownloadUrlForLayer` (có sẵn trong managed policy `AmazonEC2ContainerRegistryReadOnly`).
- **Lifecycle policy** để xoá image cũ, tránh tốn tiền lưu trữ:

  ```json
  { "rules": [{
      "rulePriority": 1,
      "description": "Giữ 10 image mới nhất",
      "selection": { "tagStatus": "any", "countType": "imageCountMoreThan", "countNumber": 10 },
      "action": { "type": "expire" } }] }
  ```

  ```bash
  aws ecr put-lifecycle-policy --repository-name demostephane --lifecycle-policy-text file://policy.json
  ```

- Chia sẻ image cho tài khoản khác: dùng **repository policy** (resource-based). Có thể bật **cross-region / cross-account replication** và **pull through cache** (cache image từ Docker Hub, ECR Public, Quay… vào ECR private).
- **Basic scanning** hiện dùng công nghệ quét do AWS cung cấp (bản dựa trên Clair cũ đã được AWS thay thế); **enhanced scanning** dùng Amazon Inspector, quét liên tục cả OS lẫn package ngôn ngữ.
- Chi phí: tính theo GB lưu trữ/tháng và data transfer ra ngoài; pull trong cùng region tới ECS/EKS không tốn phí truyền dữ liệu.

### Ghi nhớ cho kỳ thi

- "Lưu Docker image trên AWS", "thay thế Docker Hub, tích hợp ECS" = **ECR**.
- Lệnh đúng: **`aws ecr get-login-password ... | docker login --username AWS --password-stdin <registry>`**, rồi `docker push/pull`.
- Lỗi push/pull (kể cả CodeBuild push image thất bại) = **kiểm tra IAM role/permission**.

---

## Bài 10 – AWS Copilot CLI

> **Cập nhật 2026:** AWS đã công bố **end-of-support cho AWS Copilot CLI** (theo thông báo của AWS, mốc là giữa năm 2026); công cụ không còn được phát triển tính năng mới. Các lựa chọn thay thế AWS gợi ý gồm **Amazon ECS Express Mode** (ra mắt cuối 2025, triển khai service web từ image chỉ với vài tham số), **AWS CDK** (L3 construct `ApplicationLoadBalancedFargateService`), CloudFormation/Terraform. Hãy kiểm tra trang GitHub `aws/copilot-cli` để biết tình trạng mới nhất. Kiến thức trong video vẫn hữu ích để hiểu ý tưởng, nhưng **không nên dùng Copilot cho dự án mới**.

### Lý thuyết

- **Copilot** **không phải dịch vụ AWS**, mà là **CLI** để **build, release và vận hành** ứng dụng container sẵn sàng cho production.
- Mục tiêu: bỏ bớt độ khó khi chạy app trên **App Runner, ECS và Fargate**; bạn tập trung viết app, còn hạ tầng (ECS, VPC, ELB, ECR…) Copilot lo.
- Tính năng:
  - Tích hợp **CodePipeline** để triển khai container tự động chỉ bằng một lệnh.
  - Triển khai lên **nhiều environment** (test, prod…).
  - Troubleshooting, xem **logs**, **health status**.
  - Mô tả kiến trúc microservice bằng CLI hoặc **file YAML (manifest)**.
- Kết quả: hạ tầng **well-architected**, right-sized, tự scale, có pipeline và công cụ vận hành.
- Đích triển khai: **Amazon ECS**, **AWS Fargate**, **AWS App Runner**.

#### Các loại workload của `copilot init`

| Loại | Triển khai thành |
|---|---|
| Request-Driven Web Service | **App Runner** |
| Load Balanced Web Service | **ALB public** + ECS on Fargate |
| Backend Service | Service private trong VPC (load balancer tuỳ chọn) |
| Worker Service | **SQS → ECS on Fargate** |
| Static Site | Website tĩnh (S3 + CloudFront) |
| Scheduled Job | Task chạy theo lịch (EventBridge → ECS) |

### Kiến thức thực tế

- Tương đương bằng **AWS CDK** (TypeScript), cách được khuyến nghị lâu dài:

  ```typescript
  import * as ecs from "aws-cdk-lib/aws-ecs";
  import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";

  new ecsPatterns.ApplicationLoadBalancedFargateService(this, "FrontEnd", {
    cpu: 256,
    memoryLimitMiB: 512,
    desiredCount: 1,
    taskImageOptions: {
      image: ecs.ContainerImage.fromAsset("./"),   // build từ Dockerfile, push lên ECR
      containerPort: 80,
    },
    publicLoadBalancer: true,
  });
  ```

- **App Runner** (đích của Request-Driven Web Service): nên kiểm tra tình trạng dịch vụ hiện tại trên trang AWS trước khi chọn cho dự án mới, vì AWS đang định hướng người dùng ECS sang **ECS Express Mode**.

### Ghi nhớ cho kỳ thi

- Copilot là **CLI** (không phải dịch vụ) để build/release/operate ứng dụng container trên **ECS, Fargate, App Runner**, dùng manifest YAML, tích hợp CodePipeline.
- Ít xuất hiện trong đề; chỉ cần nhận ra tên và chức năng.

---

## Bài 11 – Amazon EKS

### Lý thuyết

- **Amazon EKS (Elastic Kubernetes Service)**: chạy và quản lý **Kubernetes cluster** trên AWS.
- **Kubernetes**: hệ thống **open-source** để tự động triển khai, scale, quản lý ứng dụng container (thường là Docker).
- So với ECS: cùng mục tiêu chạy container nhưng **API khác hẳn**; ECS **không open-source**, Kubernetes **open-source** và được nhiều cloud hỗ trợ (chuẩn hoá).
- EKS hỗ trợ 2 chế độ: **EC2** (worker node là EC2) và **Fargate** (container serverless).
- **Use case:** công ty **đã dùng Kubernetes** on-premises hoặc ở cloud khác, hoặc muốn dùng Kubernetes API, và muốn AWS quản lý cluster. Kubernetes **cloud-agnostic** (Azure, Google Cloud…) nên dễ **di chuyển giữa các cloud**.
- Kiến trúc: VPC, 3 AZ, public và private subnet; **EKS worker nodes** (EC2) chạy **EKS Pods** (tương tự ECS task; thấy chữ **"pod"** là Kubernetes). Node do ASG quản lý. Expose **Kubernetes Service** qua load balancer **private** hoặc **public**.

#### Các loại node

| Loại | Đặc điểm |
|---|---|
| **Managed Node Groups** | AWS **tạo và quản lý** node (EC2), nằm trong ASG do EKS quản lý; hỗ trợ **On-Demand và Spot** |
| **Self-Managed Nodes** | Tự tạo node và **đăng ký** vào cluster, tự quản ASG; tuỳ biến cao. Dùng **EKS Optimized AMI** dựng sẵn hoặc tự build AMI. Hỗ trợ On-Demand và Spot |
| **AWS Fargate** | **Không có node** để bảo trì, chỉ chạy container |

#### Data volumes

- Khai báo **StorageClass** manifest trên cluster, dùng driver tuân thủ **Container Storage Interface (CSI)** (từ khoá đề thi).
- Hỗ trợ: **Amazon EBS**, **Amazon EFS** (**loại duy nhất dùng được với Fargate**), **Amazon FSx for Lustre**, **Amazon FSx for NetApp ONTAP**.

### Kiến thức thực tế

Tạo cluster nhanh bằng `eksctl` và triển khai ứng dụng:

```bash
eksctl create cluster --name demo --region eu-central-1 --nodegroup-name ng1 \
  --node-type t3.medium --nodes 2 --managed
aws eks update-kubeconfig --name demo --region eu-central-1
kubectl create deployment hello --image=nginxdemos/hello --replicas=3
kubectl expose deployment hello --port=80 --type=LoadBalancer
kubectl get pods,svc
```

StorageClass dùng EBS CSI driver:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: gp3
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
volumeBindingMode: WaitForFirstConsumer
```

- **Cập nhật sau video:**
  - **EKS Auto Mode** (cuối 2024): AWS quản lý luôn node (dùng Karpenter), networking, storage, load balancer. Là lựa chọn "ít vận hành nhất" bên cạnh Fargate.
  - Cấp quyền IAM cho pod: **IRSA** (IAM Roles for Service Accounts) hoặc mới hơn là **EKS Pod Identity**. Đây là tương đương **ECS Task Role** bên Kubernetes.
  - Quản lý quyền truy cập cluster bằng **EKS access entries** thay cho chỉnh `aws-auth` ConfigMap.
- **Chi phí:** EKS tính phí control plane theo giờ cho mỗi cluster (cluster ở phiên bản Kubernetes hết hỗ trợ chuẩn sẽ bị tính phí *extended support* cao hơn), cộng tiền node/Fargate. ECS không tính phí control plane.

### Ghi nhớ cho kỳ thi

- "Đã dùng Kubernetes", "cloud-agnostic", "migrate giữa các cloud", "pods" = **EKS**.
- Node types: **Managed Node Groups, Self-Managed Nodes, Fargate**.
- Storage qua **CSI driver**; **EFS là storage duy nhất dùng được với EKS on Fargate**.

---

## Tổng kết chương

| Chủ đề | Điều cần nhớ |
|---|---|
| Docker | Đóng gói app chạy giống nhau mọi nơi; microservice; image lưu ở Docker Hub / ECR |
| ECS launch types | **EC2** (tự quản instance, cần ECS agent) và **Fargate** (serverless) |
| IAM | **Task Role** cho container gọi AWS (định nghĩa ở task definition, mỗi service một role); **Instance Profile** cho ECS agent; **Execution Role** để pull image/đọc secret/ghi log |
| Load balancer | ALB mặc định; NLB cho hiệu năng cao/PrivateLink; CLB không dùng với Fargate |
| Storage | **EFS**: chia sẻ, multi-AZ, dùng với Fargate; bind mount cho sidecar; Fargate ephemeral 20–200 GiB |
| Auto Scaling | Application Auto Scaling: CPU, Memory, ALB Request Count Per Target; EC2 thì dùng **Capacity Provider** |
| Rolling update | Min healthy % (mặc định 100) và Max % (mặc định 200); thêm circuit breaker, blue/green tích hợp |
| Kiến trúc | EventBridge (event/schedule) → ECS task; SQS + auto scaling; EventBridge bắt Task State Change |
| Port | EC2: dynamic host port (hostPort 0) + ALB; Fargate: mỗi task một ENI |
| Env vars | Hard-code, **SSM / Secrets Manager**, file trên S3 |
| Placement (EC2) | **binpack** tiết kiệm, **spread** HA, **random**; constraint **distinctInstance**, **memberOf** |
| ECR | Private/Public; IAM bảo vệ; scan, lifecycle; `get-login-password \| docker login` |
| Copilot | CLI triển khai lên ECS/Fargate/App Runner; **đã/đang end-of-support**, thay bằng ECS Express Mode, CDK |
| EKS | Kubernetes managed; node: managed, self-managed, Fargate; storage qua CSI, EFS cho Fargate |

---

## Câu hỏi ôn tập

*Nguồn: Containers on AWS Quiz (15 câu). Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Bạn có nhiều ứng dụng Docker đang chạy on-premises và muốn chuyển lên AWS. Bạn không muốn provision hay quản lý hạ tầng, chỉ muốn chạy container trên AWS. Nên chọn dịch vụ nào?

- A. Elastic Container Service (ECS) với EC2 Launch Type
- B. Elastic Container Registry (ECR)
- C. Elastic Container Service (ECS) với Fargate Launch Type
- D. Elastic Kubernetes Service (EKS) với Self-Managed Nodes

<details><summary>Đáp án</summary>

**C.** Fargate cho phép chạy container mà không quản lý server nào. A: phải provision và bảo trì EC2 instances. B: ECR chỉ lưu image, không chạy ứng dụng. D: self-managed nodes nghĩa là tự quản EC2.
</details>

**Câu 2.** Hai launch type của ECS là:

- A. Amazon EC2 Launch Type và Fargate Launch Type
- B. Amazon EC2 Launch Type và EKS Launch Type
- C. Fargate Launch Type và EKS Launch Type

<details><summary>Đáp án</summary>

**A.** EKS là dịch vụ riêng (Kubernetes), không phải launch type của ECS. (Ngoài ra ECS còn có *EXTERNAL* cho ECS Anywhere và *Managed Instances*, nhưng đề chỉ xét 2 loại kinh điển.)
</details>

**Câu 3.** Ứng dụng chạy trên ECS Cluster (EC2 Launch Type), bạn muốn các ECS task upload file lên S3 bucket. Bạn nên sửa IAM Role nào?

- A. EC2 Instance Profile
- B. ECS Task Role

<details><summary>Đáp án</summary>

**B.** ECS Task Role là role dùng bởi chính task, dùng khi container gọi dịch vụ AWS khác như S3, SQS. EC2 Instance Profile là role cho ECS Agent thực hiện các việc riêng của ECS như pull image từ ECR, gửi log lên CloudWatch Logs.
</details>

**Câu 4.** Bạn chuyển một website WordPress chạy trên Docker từ on-premises lên AWS, chạy trong ECS Cluster, và muốn các container truy cập cùng nội dung website (file, ảnh, video…). Bạn khuyến nghị gì?

- A. Mount một EFS volume
- B. Mount một EBS volume
- C. Dùng EC2 Instance Store

<details><summary>Đáp án</summary>

**A.** EFS chia sẻ được giữa nhiều EC2 instance và nhiều ECS task, là storage dùng chung, bền vững, multi-AZ. B: EBS chỉ dùng được khi mọi task chạy trên cùng một EC2, không phù hợp khi task trải trên nhiều instance và không dùng được với Fargate theo cách chia sẻ. C: Instance Store không chia sẻ được giữa các instance.
</details>

**Câu 5.** ECS Cluster gồm các EC2 instance đang chạy một ứng dụng gọi DynamoDB thành công. Khi thêm ứng dụng thứ hai gọi S3, bạn gặp lỗi phân quyền. Làm gì để khắc phục và vẫn đảm bảo bảo mật?

- A. Sửa EC2 instance role để thêm quyền S3
- B. Tạo IAM task role cho ứng dụng mới
- C. Bật Fargate mode
- D. Sửa S3 bucket policy để cho phép ECS task

<details><summary>Đáp án</summary>

**B.** Mỗi ứng dụng một task role riêng theo nguyên tắc least privilege. A làm ứng dụng thứ nhất cũng truy cập được S3, là rủi ro bảo mật. C không liên quan đến quyền. D không giải quyết đúng gốc vấn đề vì task vẫn cần danh tính IAM phù hợp.
</details>

**Câu 6.** Bạn chuyển ứng dụng Docker on-premises sang Amazon ECS. Trước đây bạn dùng Docker Hub làm kho image. Dịch vụ AWS thay thế nào tích hợp đầy đủ với ECS?

- A. AWS Fargate
- B. Elastic Kubernetes Service (EKS)
- C. Elastic Container Registry (ECR)
- D. Amazon EC2

<details><summary>Đáp án</summary>

**C.** ECR là registry được quản lý hoàn toàn để lưu, quản lý, chia sẻ, triển khai image. A và B dùng để chạy container. D không dùng để lưu image.
</details>

**Câu 7.** Bạn có một ECS cluster kiểu cũ (EC2) và muốn bật IAM role cho ECS task để task gọi được AWS API. Cần bật tuỳ chọn nào trong `/etc/ecs/ecs.config`?

- A. `ECS_CLUSTER`
- B. `ECS_ENGINE_AUTH_DATA`
- C. `ECS_AVAILABLE_LOGGING_DRIVERS`
- D. `ECS_ENABLE_TASK_IAM_ROLE`

<details><summary>Đáp án</summary>

**D.** Đây là thiết lập quan trọng cần biết dù không có trong hands-on. A: đăng ký container instance vào đúng cluster. B: xác thực registry private (kiểu `docker login`). C: khai báo logging driver có sẵn trên instance (ví dụ để gửi log lên CloudWatch Logs). Thực tế, ECS-optimized AMI hiện bật sẵn `ECS_ENABLE_TASK_IAM_ROLE=true`.
</details>

**Câu 8.** Pipeline CodePipeline có stage build dùng CodeBuild để build Docker image và push lên ECR. Stage build lỗi phân quyền. Vấn đề là gì?

- A. Mở ticket AWS Support
- B. Xoá và tạo lại ECR repository
- C. Kiểm tra lại IAM role và quyền của CodeBuild
- D. Bạn phải có một EC2 container instance đang chạy

<details><summary>Đáp án</summary>

**C.** Lỗi quyền với ECR hầu như luôn do IAM. Service role của CodeBuild phải có quyền push image lên ECR (`ecr:GetAuthorizationToken`, `ecr:PutImage`, các API upload layer…).
</details>

**Câu 9.** Bạn muốn chạy nhiều bản sao của cùng một ứng dụng trên cùng một EC2 instance và expose qua load balancer. Ứng dụng có sẵn dưới dạng Docker image. Bạn nên dùng:

- A. Application Load Balancer + ECS
- B. Classic Load Balancer + Beanstalk
- C. Application Load Balancer + Beanstalk
- D. Classic Load Balancer + ECS

<details><summary>Đáp án</summary>

**A.** Nhờ tính năng **Dynamic Port Mapping** của ALB với ECS. CLB không hỗ trợ dynamic port mapping.
</details>

**Câu 10.** Ứng dụng container lưu image trong ECR, chạy trên ECS cluster. Bạn chạy 2 bản sao cùng container trên cùng một EC2 container instance: container đầu chạy được, container thứ hai thì không. Bạn đã kiểm tra đủ CPU và RAM. Vấn đề là gì?

- A. EC2 container instance thiếu quyền IAM để pull image từ ECR
- B. Host port khai báo trong task definition
- C. Container port khai báo trong task definition
- D. Mỗi EC2 container instance chỉ chạy được một container cho mỗi Docker image

<details><summary>Đáp án</summary>

**B.** Host port cố định thì container thứ hai bị xung đột port. Đặt **host port = 0** (hoặc để trống) để dùng port ngẫu nhiên, cho phép nhiều container cùng loại trên cùng instance. A sai vì container đầu đã chạy được. C là port nội bộ của container, không ảnh hưởng binding trên host. D sai.
</details>

**Câu 11.** Một EC2 container instance mới không đăng ký được vào ECS cluster. Điều nào **KHÔNG** phải là nguyên nhân?

- A. ECS agent không chạy
- B. AMI không phải Amazon ECS-optimized AMI
- C. EC2 container instance thiếu IAM permission
- D. Security group của EC2 không cho phép inbound traffic

<details><summary>Đáp án</summary>

**D.** Security group không ảnh hưởng việc đăng ký với ECS, vì agent gọi ra ngoài (outbound), và mặc định security group cho phép mọi outbound. A, B, C đều có thể là nguyên nhân thật.
</details>

**Câu 12.** Bạn muốn pull Docker image từ một ECR repository private. Lệnh nào dùng được?

- A. `docker login -u $AWS_ACCESS_KEY_ID -p $AWS_SECRET_ACCESS_KEY $ECR_URL` rồi `docker pull $ECR_IMAGE_URL`
- B. `docker login -u $AWS_USERNAME -p $AWS_PASSWORD $ECR_URL` rồi `docker pull $ECR_IMAGE_URL`
- C. `aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URL` rồi `docker pull $ECR_IMAGE_URL`
- D. `docker build -t $ECR_URL .` rồi `docker pull $ECR_IMAGE_URL`

<details><summary>Đáp án</summary>

**C.** `get-login-password` sinh token tạm thời, truyền vào `docker login` với username `AWS`. Không dùng access key hay mật khẩu console làm mật khẩu Docker (A, B); D chỉ build image.
</details>

**Câu 13.** ECS cluster chạy 4 ECS service, mỗi service cần tương tác với các dịch vụ AWS khác nhau. Best practice khi cấp quyền là gì?

- A. Tạo 1 IAM role với 4 policy và gắn vào các EC2 instance trong cluster
- B. Tạo 4 IAM role và gắn vào các EC2 instance trong cluster
- C. Tạo 1 ECS Task role với 4 policy và gắn vào mọi ECS Task definition
- D. Tạo 4 ECS Task role và gắn mỗi role vào task definition tương ứng

<details><summary>Đáp án</summary>

**D.** Mỗi service chỉ có đúng quyền nó cần (least privilege). A và C cho mọi service có tất cả quyền. B không khả thi vì một EC2 chỉ gắn được một instance profile, và quyền ở mức instance cũng bị chia sẻ cho mọi task.
</details>

**Câu 14.** Task placement strategy nào **tiết kiệm chi phí nhất**?

- A. spread
- B. binpack
- C. random

<details><summary>Đáp án</summary>

**B. binpack.** Lấp đầy từng instance theo CPU/memory trước khi dùng instance khác, nên tối thiểu số instance đang chạy.
</details>

**Câu 15.** Task placement constraint nào cho phép đặt mỗi ECS task trên một EC2 container instance khác nhau?

- A. distinctInstance
- B. memberOf

<details><summary>Đáp án</summary>

**A. distinctInstance.** `memberOf` dùng để đặt task lên instance thoả một biểu thức Cluster Query Language (ví dụ chỉ instance `t2.*`).
</details>

---

[← Chương 15](ch15-cloudfront.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Chương 17 →](ch17-aws-elastic-beanstalk.md)
