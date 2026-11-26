# Elastic Beanstalk Deployment Policies, Hooks & ECS Deployment Strategies

Trong kỳ thi **AWS Certified DevOps Engineer - Professional (DOP-C02)**, việc nắm vững từng cơ chế triển khai (deployment policy) của **AWS Elastic Beanstalk** và **Amazon ECS** là bắt buộc. Đề thi thường đưa ra các ràng buộc khắt khe về **zero downtime**, **capacity overhead (chi phí phát sinh)**, **tốc độ rollback**, và **khả năng cô lập lỗi (blast radius)**.

---

## 1. Elastic Beanstalk Deployment Policies — So sánh chi tiết

Elastic Beanstalk cung cấp **6 chiến lược triển khai** khác nhau. Hiểu rõ bảng so sánh dưới đây giúp bạn giải quyết 90% câu hỏi về Beanstalk trong DOP-C02:

| Policy | Zero Downtime? | Tác động Capacity | Tốc độ Deploy | Rollback khi lỗi | Lưu ý quan trọng |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **All at once** | **Không** (Có downtime) | Không tăng thêm EC2 | Nhanh nhất | Chậm (phải re-deploy bản cũ) | Chạy trên cùng instances hiện tại. Chỉ dùng cho Dev/Test |
| **Rolling** | **Có** (Nhưng **giảm capacity**) | Không tăng thêm EC2 | Trung bình (theo từng batch) | Chậm (phải chạy rolling lại bản cũ) | Trong lúc deploy, 1 batch bị rút khỏi ALB -> giảm năng lực chịu tải; 2 phiên bản chạy song song |
| **Rolling with additional batch** | **Có** (Giữ **100% capacity**) | Tăng thêm đúng **1 batch** EC2 | Trung bình | Chậm (phải re-deploy bản cũ lên các batch đã update) | Tốt hơn Rolling vì khởi tạo thêm 1 batch mới trước khi rút batch cũ -> không hụt tải |
| **Immutable** | **Có** (Giữ **100% capacity**) | Tăng **tạm thời +100% (gấp đôi)** EC2 | Chậm hơn | **Cực nhanh** (chỉ cần terminate ASG tạm thời) | Tạo một Auto Scaling Group (ASG) mới tạm thời, đợi health check pass 100% mới chuyển traffic & xóa ASG cũ |
| **Traffic Splitting (Canary)** | **Có** (Giữ **100% capacity**) | Tăng **tạm thời +100%** EC2 | Theo cấu hình % và thời gian | **Cực nhanh** (chuyển 100% traffic về lại instances cũ) | Tạo fleet mới (như Immutable), nhưng chia một **% traffic nhỏ (vd 10%)** trong X phút để test thực tế trước khi chuyển toàn bộ |
| **Blue/Green (Clone + Swap URL)** | **Có** (Giữ **100% capacity**) | **Gấp đôi** (2 Environments song song) | Chậm (tạo env mới) | **Gần như tức thì** (Swap URLs ngược lại) | Không phải deployment policy trong dropdown, mà là thao tác tạo **Environment mới** rồi dùng **Swap Environment URLs** (Route 53 / CNAME) |

> **Exam Tip**:
> - Yêu cầu: *"Zero downtime, không được giảm capacity trong lúc deploy, rollback nhanh nhất khi deploy lỗi nhưng không cần tạo Environment thứ 2"* -> Chọn **Immutable**.
> - Yêu cầu: *"Cần kiểm thử phiên bản mới với 5% traffic người dùng thật trong 15 phút trước khi rollout toàn bộ"* -> Chọn **Traffic Splitting**.
> - Yêu cầu: *"Zero downtime, giữ nguyên 100% capacity nhưng ngân sách hạn hẹp, KHÔNG cho phép tăng gấp đôi số lượng EC2 (chỉ cho phép tăng thêm 1-2 instances)"* -> Chọn **Rolling with additional batch**.
> - Nếu đề bài dùng **Blue/Green (Swap URLs)** với RDS nằm trong Elastic Beanstalk: **CẨN THẬN!** Nếu RDS được tạo *bên trong* Beanstalk environment, khi xóa môi trường cũ thì RDS cũng bị xóa theo! Luôn **tách RDS ra ngoài** Beanstalk environment (external RDS) khi dùng Blue/Green.

---

## 2. Elastic Beanstalk Configuration: `.ebextensions` vs `.platform` Hooks & Saved Configurations

### `.ebextensions/` vs `.platform/` (Amazon Linux 2 / AL2023)

| Đặc điểm | `.ebextensions/*.config` | `.platform/hooks/` & `.platform/nginx/` |
| :--- | :--- | :--- |
| **Định dạng** | YAML hoặc JSON | Shell scripts (`.sh`), Python, Ruby (phải có quyền `chmod +x`) |
| **Chức năng chính** | Cấu hình AWS resources (RDS, ElastiCache, SQS, CloudWatch Alarms, Option Settings), cài packages, tạo files | Tùy biến hệ điều hành, Nginx/Apache reverse proxy, chạy script theo **lifecycle hooks** (`prebuild`, `predeploy`, `postdeploy`) |
| **Nền tảng** | Hỗ trợ mọi phiên bản Beanstalk (AL1, AL2, AL2023) | Chuẩn khuyến nghị cho **Amazon Linux 2 / AL2023** (thay thế các hook cũ trong `/opt/elasticbeanstalk/hooks` của AL1) |

### Ví dụ cấu hình `.ebextensions/01-deployment.config`

```yaml
option_settings:
  aws:elasticbeanstalk:command:
    DeploymentPolicy: Immutable
    HealthCheckSuccessThreshold: Ok
  aws:elasticbeanstalk:healthreporting:system:
    SystemType: enhanced
  aws:autoscaling:updatepolicy:rollingupdate:
    RollingUpdateEnabled: true
    RollingUpdateType: Immutable
```

### Ví dụ `.platform/hooks/predeploy/01_migrate.sh`

```bash
#!/bin/bash
set -e
echo "Running database migrations before starting application..."
/var/app/staging/venv/bin/python /var/app/staging/manage.py migrate --noinput
```

### Saved Configurations & Environment Manifest (`env.yaml`)

- **Saved Configurations**: Cho phép lưu lại toàn bộ cấu hình (EC2 instance type, VPC, ASG scaling triggers, Deployment Policy, Environment Variables) của một Beanstalk environment dưới dạng file YAML lưu trên S3 (`elasticbeanstalk-...`) để tái sử dụng khi tạo môi trường mới hoặc khôi phục (DR).
- **Platform Updates (Managed Platform Updates)**: Tự động cập nhật phiên bản OS/runtime mới (ví dụ bản vá bảo mật Node.js/Python) theo lịch bảo trì hàng tuần bằng cơ chế **Immutable** để đảm bảo không downtime.

> **Exam Tip**: Khi đề bài hỏi cách cấu hình **Nginx custom config** (ví dụ tăng `client_max_body_size` để upload file lớn) trên **Amazon Linux 2 / AL2023** -> đặt file `.conf` vào `.platform/nginx/conf.d/` (thay vì `/etc/nginx/conf.d/` trong `.ebextensions` như AL1 cũ). Để chạy script trước hoặc sau khi deploy app -> dùng `.platform/hooks/predeploy/` hoặc `postdeploy/`.

---

## 3. Amazon ECS Deployment Strategies: Rolling Update & Deployment Circuit Breaker

Khi chạy microservices trên **Amazon ECS** (EC2 hoặc Fargate), AWS cung cấp 2 cơ chế triển khai chính:

### A. ECS Rolling Update (`ECS` Deployment Controller)

ECS sử dụng 2 tham số trên Service để kiểm soát tốc độ và sức chứa khi cập nhật Task Definition mới:
- `minimumHealthyPercent` (Mặc định: `100%`): Tỷ lệ % số task tối thiểu phải luôn ở trạng thái `RUNNING` và `HEALTHY` trong suốt quá trình deploy.
- `maximumPercent` (Mặc định: `200%`): Tỷ lệ % số task tối đa được phép chạy đồng thời trong quá trình deploy.

| Cấu hình (`minHealthy%` / `max%`) | Hành vi triển khai | Use Case |
| :--- | :--- | :--- |
| **`100%` / `200%`** (Mặc định) | Khởi tạo thêm các task mới trước, đợi khỏe mới tắt các task cũ -> **Zero downtime, không hụt capacity** | Production cần availability cao |
| **`50%` / `100%`** | Tắt một nửa số task cũ trước để lấy chỗ, rồi mới bật task mới -> **Không tốn thêm tài nguyên**, nhưng giảm 50% capacity | Dev/Test hoặc cluster giới hạn RAM/CPU |
| **`100%` / `150%`** | Chỉ bật tối đa thêm 50% task mới tại một thời điểm | Production muốn tiết kiệm chi phí/tài nguyên hơn mức 200% |

### B. ECS Deployment Circuit Breaker (Tự động Rollback!)

Trước đây, nếu một Task Definition mới bị lỗi crash liên tục (ví dụ image hỏng hoặc sai env var), ECS Rolling Update sẽ kẹt mãi trong vòng lặp khởi tạo task mới. **Deployment Circuit Breaker** giải quyết triệt để vấn đề này:
- ECS theo dõi số lần task thất bại trước khi đạt trạng thái `RUNNING` / `HEALTHY`.
- Khi vượt ngưỡng thất bại (tự động tính theo `desiredCount`, tối thiểu 10 lần và tối đa 200 lần), Circuit Breaker chuyển deployment sang trạng thái `FAILED`.
- Nếu bật `rollback: true`, ECS **tự động rollback** về Task Definition ổn định gần nhất (last completed deployment).
- Có thể kết hợp thêm **CloudWatch Alarms** trong cấu hình Service deployment để kích hoạt rollback nếu tỷ lệ lỗi HTTP 5xx tăng vọt sau khi task đã `RUNNING`.

```json
{
  "deploymentConfiguration": {
    "deploymentCircuitBreaker": {
      "enable": true,
      "rollback": true
    },
    "alarms": {
      "alarmNames": ["ECS-High-5XX-Alarm"],
      "enable": true,
      "rollback": true
    },
    "maximumPercent": 200,
    "minimumHealthyPercent": 100
  }
}
```

---

## 4. ECS Blue/Green Deployment với AWS CodeDeploy

Khi cần **Canary** hoặc **Linear** traffic shifting (tương tự Traffic Splitting của Beanstalk) cho ECS Service, bạn phải chuyển `deploymentController` từ `ECS` sang **`CODE_DEPLOY`**.

### Kiến trúc Blue/Green trên ECS + CodeDeploy

1. **Application Load Balancer (ALB)** phải có **2 Target Groups** (Blue TG và Green TG) và **2 Listeners**:
   - **Production Listener** (ví dụ Port 443 / 80): Phục vụ người dùng thật.
   - **Test Listener** (ví dụ Port 8080/8443): Phục vụ kiểm thử tự động trước khi chuyển traffic thật.
2. **ECS Service** chạy Task Set Blue (phiên bản hiện tại) gắn với Blue TG.
3. Khi deploy Task Definition mới:
   - CodeDeploy tạo **Task Set Green** gắn vào **Green TG**.
   - **Test Listener** chuyển traffic sang Green TG -> Chạy **Lifecycle Hook (`AfterAllowTestTraffic`)** gọi Lambda function thực hiện smoke test / integration test.
   - Nếu Lambda trả về `Succeeded`, CodeDeploy chuyển **Production Listener** từ Blue TG sang Green TG theo cấu hình:
     - `CodeDeployDefault.ECSAllAtOnce` (100% ngay lập tức)
     - `CodeDeployDefault.ECSCanary10Percent5Minutes` (10% trong 5 phút -> 100%)
     - `CodeDeployDefault.ECSLinear10PercentEvery1Minutes` (tăng dần 10% mỗi phút)
   - Task Set Blue được giữ lại trong khoảng thời gian cấu hình (`terminationWaitTimeInMinutes`) để rollback tức thì nếu CloudWatch Alarm kêu, sau đó mới bị terminate.

### Ví dụ `appspec.yaml` cho ECS Blue/Green với CodeDeploy

```yaml
version: 0.0
Resources:
  - TargetService:
      Type: AWS::ECS::Service
      Properties:
        TaskDefinition: "arn:aws:ecs:ap-southeast-1:123456789012:task-definition/my-app:15"
        LoadBalancerInfo:
          ContainerName: "web-app"
          ContainerPort: 8080
Hooks:
  - AfterAllowTestTraffic: "arn:aws:lambda:ap-southeast-1:123456789012:function:RunSmokeTests"
```

> **Exam Tip**:
> - Nếu đề bài hỏi: *"ECS Service thường xuyên bị treo deployment khi container crash lúc khởi động, cần tự động dừng và quay về bản cũ với ít thay đổi kiến trúc nhất"* -> Bật **ECS Deployment Circuit Breaker (`enable: true, rollback: true`)** trên Rolling Update (không cần chuyển sang CodeDeploy).
> - Nếu đề bài hỏi: *"ECS cần kiểm thử qua Test Listener, chạy Lambda validation trước khi chuyển 10% traffic thật rồi tăng dần lên 100%"* -> Dùng **ECS Blue/Green với AWS CodeDeploy** (`CODE_DEPLOY` controller) + `appspec.yaml` + **2 Target Groups**.

---

[← Bài trước](03-advanced-cicd-cross-account-ecs-lambda.md) | [Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/03-sdlc-beanstalk-appconfig.md) | [Bài tiếp →](05-cloudformation-deep-dive-stacksets-custom-resources.md)
