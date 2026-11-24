# Chương 17 – AWS Elastic Beanstalk

> **Nguồn:** 13 video của chương + *Elastic Beanstalk Quiz* (15 câu).
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay (2026, kỳ thi **DVA-C02**). Một số giao diện/console trong video đã thay đổi; các điểm lỗi thời được đánh dấu **(Cập nhật 2026)**.

## Mục tiêu chương

Sau chương này bạn có thể:

- Giải thích Elastic Beanstalk là gì, các thành phần **Application / Application Version / Environment / Tier**, và mô hình chi phí.
- Phân biệt **Web Server tier** và **Worker tier**, chế độ **Single Instance** và **High Availability (Load Balanced)**.
- Tạo environment dev (single instance) và prod (high availability) trên console, hiểu Beanstalk tạo ra những tài nguyên gì.
- Nắm vững **6 cách deploy**: All at once, Rolling, Rolling with additional batch, Immutable, Blue/Green (swap URL), Traffic Splitting (canary) – chọn đúng phương án theo yêu cầu về downtime, chi phí, rollback.
- Hiểu quy trình đóng gói và deploy (zip, S3, resolve dependencies), biết **EB CLI** tồn tại.
- Cấu hình **Lifecycle Policy** để không vượt giới hạn 1.000 application versions.
- Viết file cấu hình **`.ebextensions/*.config`** (option_settings, Resources).
- Hiểu Beanstalk dựa trên **CloudFormation**, biết dùng **Cloning**, **Swap environment URLs** và quy trình **migration** (đổi loại Load Balancer, tách RDS ra khỏi environment).

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001–002 | Section Introduction, Elastic Beanstalk Overview | Bài 1 – Tổng quan Elastic Beanstalk |
| 003 | Beanstalk First Environment | Bài 2 – Tạo environment đầu tiên (Dev – Single Instance) |
| 004 | Beanstalk Second Environment | Bài 3 – Tạo environment thứ hai (Prod – High Availability) |
| 005–006 | Beanstalk Deployment Modes | Bài 4 – Các chế độ deploy, Swap URL |
| 007 | Beanstalk CLI and Deployment Process | Bài 5 – EB CLI và quy trình deploy |
| 008 | Beanstalk Lifecycle Policy Overview + Hands On | Bài 6 – Lifecycle Policy |
| 009 | Beanstalk Extensions | Bài 7 – `.ebextensions` |
| 010 | Beanstalk & CloudFormation | Bài 8 – Beanstalk và CloudFormation |
| 011 | Beanstalk Cloning | Bài 9 – Cloning environment |
| 012 | Beanstalk Migrations | Bài 10 – Migration: đổi Load Balancer, tách RDS |
| 013 | Beanstalk Cleanup | Bài 11 – Dọn dẹp |
| Quiz | Elastic Beanstalk Quiz | Câu hỏi ôn tập |

---

## Bài 1 – Tổng quan Elastic Beanstalk

### Lý thuyết

#### Vấn đề Beanstalk giải quyết

- Từ đầu khoá, mỗi lần deploy ứng dụng web ta đều dựng **cùng một kiến trúc**: **ELB** nhận request của người dùng → **Auto Scaling Group** trải trên nhiều AZ, mỗi AZ có EC2 → tầng dữ liệu có **RDS** (có thể kèm read replica, Multi-AZ) và tầng cache **ElastiCache**.
- Làm thủ công mỗi lần là mệt và dễ sai. Developer chỉ muốn **code chạy được**, không muốn tự cấu hình database, load balancer, scaling…
- Nếu viết nhiều ứng dụng bằng nhiều ngôn ngữ, ta muốn có **một cách deploy thống nhất** → **Elastic Beanstalk**.

#### Elastic Beanstalk là gì

- Cung cấp **góc nhìn "developer-centric"** để deploy ứng dụng lên AWS từ **một giao diện duy nhất**.
- **Tái sử dụng** các thành phần đã học: **EC2, ASG, ELB, RDS**… nhưng là **dịch vụ managed** tự lo:
  - Capacity provisioning (cấp phát tài nguyên)
  - Cấu hình load balancer
  - Scaling
  - Theo dõi health của ứng dụng
  - Cấu hình instance
- **Trách nhiệm duy nhất của developer: code.** Bạn vẫn có **toàn quyền cấu hình** từng thành phần, chỉ là chúng được gói chung trong một giao diện.
- Beanstalk có cơ chế **cập nhật ứng dụng** rất tiện (các deployment mode – Bài 4).
- **Chi phí:** Beanstalk **miễn phí**, bạn chỉ trả tiền cho tài nguyên bên dưới (EC2, ELB, EBS, RDS…).

#### Các thành phần

| Thành phần | Ý nghĩa |
|---|---|
| **Application** | Tập hợp các thành phần Beanstalk: environments, versions, configurations |
| **Application Version** | Một lần lặp (iteration) của code ứng dụng: v1, v2, v3… |
| **Environment** | Tập hợp tài nguyên AWS đang chạy **một** application version. Tại một thời điểm, một environment chỉ chạy **1 version**, nhưng có thể cập nhật từ v1 lên v2 |
| **Tier** | **Web Server Environment Tier** hoặc **Worker Environment Tier** |

- Có thể tạo **nhiều environment** tuỳ ý: dev, test, prod… (tên đặt tự do).
- Một application version có thể được deploy lên **nhiều environment** (ví dụ cùng v2 lên dev rồi lên prod).

#### Quy trình làm việc

```
Create Application → Upload Version → Launch Environment → Manage Environment
                          ↑                                         │
                          └──── upload version mới, deploy lại ─────┘
```

#### Nền tảng (platform) được hỗ trợ (theo video)

Go, Java SE, Java with Tomcat, .NET Core on Linux, .NET on Windows Server, Node.js, PHP, Python, Ruby, Packer Builder, Single Docker Container, Multi-container Docker, Preconfigured Docker → Ý tưởng: **gần như deploy được mọi thứ**.

> **(Cập nhật 2026)** Danh sách platform hiện tại: **Docker**, **ECS** (thay cho "Multi-container Docker"), **Go**, **Corretto (Java SE)**, **Tomcat**, **.NET on Linux**, **.NET on Windows Server**, **Node.js**, **PHP**, **Python**, **Ruby**. Các platform **Packer Builder / Custom Platform**, **Multi-container Docker (Amazon Linux AMI)** và **Preconfigured Docker** đã bị **retire**. Platform Linux nên dùng bản **Amazon Linux 2023 (AL2023)**; các bản Amazon Linux 2 đã/đang hết hỗ trợ. Không có runtime mong muốn (ví dụ Rust) → dùng **platform Docker**.

#### Web Server Tier và Worker Tier

| | Web Server Tier | Worker Tier |
|---|---|---|
| Kiến trúc | **ELB → ASG** (nhiều EC2 làm web server) | **SQS Queue → ASG** (EC2 là worker) |
| Client truy cập | Trực tiếp qua URL/ELB | **Không** truy cập trực tiếp EC2 |
| Cách nhận việc | HTTP request | Worker **pull message** từ SQS để xử lý |
| Scaling | Theo CPU, network, request… | Theo **số message trong SQS** |

- Có thể **kết hợp**: Web environment **đẩy message** vào SQS queue của Worker environment để xử lý tác vụ nặng/bất đồng bộ.

#### Hai chế độ deploy (environment type)

| | **Single Instance** | **High Availability (Load Balanced)** |
|---|---|---|
| Dùng cho | **Development** | **Production** |
| Thành phần | 1 EC2 + **Elastic IP** (có thể kèm RDS) | **ELB** + **ASG** trải nhiều AZ (+ RDS Multi-AZ master/standby) |
| Chi phí | Thấp | Cao hơn (ELB, nhiều instance) |

### Kiến thức thực tế

- **Worker tier hoạt động thế nào:** trên mỗi instance có daemon **`sqsd`** đọc message từ SQS và **POST** nội dung message tới ứng dụng của bạn qua `http://localhost/` (path cấu hình được). Ứng dụng trả **HTTP 200** → message bị xoá khỏi queue; trả lỗi/timeout → message quay lại queue sau visibility timeout, quá số lần thì vào **Dead Letter Queue**.
- **Tác vụ định kỳ** (cron) trong Worker tier: khai báo file **`cron.yaml`** ở gốc source bundle. File này **chỉ có tác dụng ở Worker environment**.
- Beanstalk phù hợp với ứng dụng web/API "truyền thống" cần triển khai nhanh. Với hệ thống microservices phức tạp, nhiều team thường chọn **ECS/Fargate**, **App Runner** hoặc **Lambda**; với hạ tầng tuỳ biến nhiều thì dùng **CloudFormation/CDK** trực tiếp.
- Mỗi environment có URL dạng `my-env.eba-xxxxxxxx.<region>.elasticbeanstalk.com` (CNAME). Production thật nên trỏ **domain riêng** (Route 53 alias tới ELB hoặc CNAME tới URL Beanstalk) và gắn **HTTPS** bằng chứng chỉ **ACM** trên listener 443 của ALB.

### Ghi nhớ cho kỳ thi

- Beanstalk = **developer-centric**, managed; dev chỉ lo **code**. Beanstalk **miễn phí**, trả tiền cho tài nguyên bên dưới.
- Application → Versions → Environments; một version có thể deploy lên **nhiều** environment; tên environment **tự đặt** (không bắt buộc dev/test/prod).
- **Worker tier = SQS**, scale theo số message. Thấy "xử lý tác vụ nền, tách khỏi web" → Worker environment.
- Dev, muốn **rẻ** → **Single Instance** (1 EC2 + Elastic IP). Prod → **High Availability** (ELB + ASG Multi-AZ).
- Ngôn ngữ không được hỗ trợ → **Docker** (Custom Platform đã ngừng hỗ trợ).

---

## Bài 2 – Tạo environment đầu tiên (Dev – Single Instance)

### Lý thuyết

- Khi tạo environment, chọn **Web server environment** (chạy website) hoặc **Worker environment** (xử lý tác vụ từ queue).
- **Preset** (cấu hình mẫu):
  - **Single instance** (free tier eligible)
  - **High availability** (có load balancer)
  - **Custom configuration** (tự chỉnh mọi thứ)
- Cần 2 IAM role:
  - **Service role** (`aws-elasticbeanstalk-service-role`): để **dịch vụ Beanstalk** gọi các dịch vụ khác thay bạn (theo dõi health, managed updates…).
  - **EC2 instance profile** (`aws-elasticbeanstalk-ec2-role`): để **EC2 instance** trong environment gọi AWS (đẩy log, đọc S3, SQS cho worker…).
- Beanstalk tạo hạ tầng thông qua **CloudFormation**: tab **Events** của Beanstalk hiển thị các sự kiện tương ứng với stack CloudFormation.
- Với Single Instance, Beanstalk tạo: **Security Group**, **Elastic IP**, **Auto Scaling Group** (min = max = 1) quản lý **1 EC2** (t3.micro), launch configuration/launch template, wait condition…
- Sau khi tạo xong, environment có **domain name** riêng; mở ra thấy trang *"Congratulations"* của sample app.
- So sánh: **Beanstalk** xoay quanh **code và environment cho code**; **CloudFormation** dùng để deploy **bất kỳ hạ tầng nào** (stack tuỳ ý).

### Kiến thức thực tế

- Các managed policy thường gắn vào role:

  | Role | Trusted entity | Managed policies |
  |---|---|---|
  | `aws-elasticbeanstalk-service-role` | `elasticbeanstalk.amazonaws.com` | `AWSElasticBeanstalkEnhancedHealth`, `AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy` |
  | `aws-elasticbeanstalk-ec2-role` (instance profile) | `ec2.amazonaws.com` | `AWSElasticBeanstalkWebTier`, `AWSElasticBeanstalkWorkerTier`, `AWSElasticBeanstalkMulticontainerDocker` |

- Nếu ứng dụng cần đọc DynamoDB, S3, Secrets Manager… hãy **gắn thêm policy vào instance profile** (`aws-elasticbeanstalk-ec2-role` hoặc role riêng của app), **không** nhét access key vào biến môi trường.
- **(Cập nhật 2026)** Trong video, CloudFormation tạo **Launch Configuration**. AWS đã ngừng Launch Configuration (tài khoản mới từ 10/2024 không tạo được nữa) → Beanstalk hiện dùng **Launch Template**. Tên namespace `aws:autoscaling:launchconfiguration` vẫn giữ nguyên trong option settings. Công cụ *Application Composer* trong video nay đổi tên thành **AWS Infrastructure Composer**.
- Lỗi hay gặp khi tạo environment: thiếu instance profile → environment báo lỗi/health *Severe*; tài khoản không còn **default VPC** → phải chọn VPC/subnet thủ công trong bước *networking*.
- Single instance **không có load balancer** nên không gắn ACM certificate trực tiếp được; muốn HTTPS phải tự cấu hình trên instance (hoặc đặt CloudFront phía trước).

### Ghi nhớ cho kỳ thi

- Beanstalk dùng **CloudFormation** bên dưới để tạo tài nguyên.
- Single Instance = **1 EC2 + Elastic IP** (+ ASG có 1 instance), không có ELB.
- Cần **service role** (cho Beanstalk) và **instance profile** (cho EC2).

---

## Bài 3 – Tạo environment thứ hai (Prod – High Availability)

### Lý thuyết

Khi chọn preset **High availability**, console cho cấu hình rất nhiều thứ:

| Nhóm cấu hình | Nội dung chính |
|---|---|
| **Networking** | Chọn VPC, **subnet cho instance** (chọn nhiều AZ để HA), có gán **public IP** cho EC2 hay không (có ELB thì không cần) |
| **Database** | Tạo RDS trong environment. **Lưu ý: vòng đời DB gắn với environment** → xoá environment là mất DB (trừ khi snapshot trước) |
| **Instances** | Root volume, security groups |
| **Capacity / ASG** | Environment type *Load balanced*, **min/max** (ví dụ 1–4), fleet composition (**On-Demand** và/hoặc **Spot**), instance types (`t3.micro`, `t3.small`), AMI ID, **scaling triggers** (metric, min/max, ngưỡng) |
| **Load balancer** | Visibility (public/internal), subnet cho LB, **loại LB**: **ALB** hoặc **NLB**; ALB có thể **dedicated** hoặc **shared** (dùng chung giữa nhiều environment để tiết kiệm), listeners, processes, rules |
| **Health reporting** | **Basic** hoặc **Enhanced** health, CloudWatch custom metrics |
| **Managed platform updates** | Beanstalk tự cập nhật platform trong maintenance window |
| **Notifications** | Email khi có sự kiện quan trọng |
| **Rolling updates and deployments** | Deployment policy (Bài 4 – **rất quan trọng cho kỳ thi**) |
| **Platform software** | AWS **X-Ray**, **stream log tới CloudWatch Logs**, biến môi trường… |

Tài nguyên Beanstalk tạo ra cho environment HA:

- **Application Load Balancer** trải trên 3 AZ, **target group** chứa EC2 (healthy).
- **Security group của ALB**: cho phép port 80 từ mọi nơi (`0.0.0.0/0`).
- **Security group của EC2**: chỉ cho phép port 80 **từ security group của ALB**.
- **ASG** với min 1 / max 4, có **dynamic scaling policies** (kèm CloudWatch alarms) do Beanstalk tự tạo.

Từ góc độ ứng dụng thì vẫn là **cùng app**, chỉ là **chạy theo cách khác** (HA thay vì single instance).

### Kiến thức thực tế

- **(Cập nhật 2026)** Video chọn "Node.js 12" – phiên bản này đã hết hỗ trợ từ lâu. Hiện dùng **Node.js 20/22 trên Amazon Linux 2023**.
- **Không đổi được loại Load Balancer** sau khi tạo environment (xem Bài 10) → chọn đúng ngay từ đầu, thường là **ALB**. Classic Load Balancer chỉ còn cho môi trường cũ.
- **Shared ALB**: nhiều environment dùng chung một ALB (phân luồng bằng host/path rules) → tiết kiệm chi phí ALB cố định theo giờ, phù hợp nhiều environment nhỏ (dev/test).
- **Enhanced health reporting** là mặc định trên platform hiện đại: có agent trên instance gửi số liệu (request, latency, lỗi 5xx, CPU…) và trạng thái màu (Ok/Warning/Degraded/Severe).
- Bật **stream logs to CloudWatch Logs** cho prod để không mất log khi instance bị thay thế (ASG terminate instance là mất log local).
- Dùng **Spot** trong fleet composition (kết hợp On-Demand base) giúp giảm chi phí đáng kể cho workload chịu được gián đoạn.

### Ghi nhớ cho kỳ thi

- DB tạo **bên trong** Beanstalk environment có **vòng đời gắn với environment** → prod nên tách DB ra ngoài (Bài 10).
- HA = **ELB + ASG Multi-AZ**; EC2 chỉ nhận traffic từ SG của ELB.
- Có thể dùng **shared ALB** giữa nhiều environment để tiết kiệm.

---

## Bài 4 – Các chế độ deploy (Deployment Modes) và Swap URL

### Lý thuyết

#### Tổng quan 6 phương án

| Phương án | Ý tưởng ngắn gọn |
|---|---|
| **All at once** | Deploy tất cả trong một lần. Nhanh nhất nhưng có **downtime** |
| **Rolling** | Cập nhật từng nhóm (**bucket/batch**) instance, xong nhóm này (healthy) mới sang nhóm tiếp |
| **Rolling with additional batch** | Như Rolling nhưng **tạo thêm instance mới** để luôn giữ **đủ capacity** |
| **Immutable** | Tạo instance **mới** trong **ASG tạm**, deploy lên đó, khi tất cả healthy thì thay thế instance cũ |
| **Blue/Green** | Tạo **environment mới** hoàn toàn, chuyển traffic khi sẵn sàng (swap URL) |
| **Traffic Splitting** | **Canary testing**: gửi **một phần nhỏ % traffic** sang bản mới trong thời gian cấu hình được |

#### 1. All at once

- 4 instance đang chạy v1 → Beanstalk **dừng ứng dụng trên tất cả** (không phục vụ được) → deploy v2 lên tất cả.
- **Nhanh nhất**, nhưng **có downtime**.
- **Không phát sinh chi phí** thêm.
- Phù hợp **lặp nhanh ở môi trường development**, không quan tâm downtime.

#### 2. Rolling

- Ứng dụng chạy **dưới capacity** trong lúc deploy; mức giảm do **bucket size** quyết định.
- Ví dụ 4 instance, bucket size = 2: dừng app trên 2 instance đầu (chỉ còn 50% capacity) → cập nhật v2 → khi healthy, "lăn" sang 2 instance tiếp → cập nhật v2.
- Trong lúc deploy, ứng dụng **chạy song song cả 2 version**.
- **Không tốn thêm chi phí** (số instance không đổi).
- Bucket size nhỏ + nhiều instance (ví dụ bucket 2, 100 instance) → **deploy rất lâu**.

#### 3. Rolling with additional batch

- Ứng dụng **luôn chạy đủ capacity** (có lúc còn **vượt** capacity); vẫn đặt được bucket size.
- Ví dụ 4 instance v1, bucket = 2: Beanstalk **tạo thêm 2 instance mới chạy v2** (tổng 6) → dừng & cập nhật batch 1 (2 instance cũ) lên v2 → tiếp batch 2 → cuối cùng có 6 instance v2 → **batch bổ sung bị terminate**, còn lại 4.
- Lúc thấp nhất vẫn có 4 instance phục vụ → **luôn đủ capacity**.
- **Chạy song song 2 version**, **chi phí thêm nhỏ** (đề hay hỏi: *có chi phí thêm không?* → **có, nhỏ**).
- Deploy **lâu**; là lựa chọn tốt cho **prod**.

#### 4. Immutable

- **Zero downtime**; code mới deploy lên **instance mới** (không phải instance cũ), lấy từ một **ASG tạm thời (temporary ASG)**.
- **Chi phí cao**: nhân đôi capacity trong lúc deploy; **lâu nhất**.
- **Rollback rất nhanh** khi lỗi: Beanstalk chỉ cần **terminate ASG mới**, ASG cũ vẫn nguyên vẹn, đủ capacity.
- Quy trình:
  1. ASG hiện tại có 3 instance v1.
  2. Tạo **ASG tạm**, trước tiên launch **1 instance** v2 để kiểm tra.
  3. Nếu pass health check → launch các instance còn lại (3 instance v2).
  4. **Chuyển (merge)** các instance từ ASG tạm sang ASG hiện tại (lúc này có 6 instance).
  5. **Terminate** các instance v1 trong ASG hiện tại.
  6. **Xoá ASG tạm**.
- Lựa chọn tốt cho **prod** nếu chấp nhận tốn hơn.

#### 5. Blue/Green

- **Không phải tính năng trực tiếp** của Beanstalk; **làm thủ công** khá nhiều.
- Zero downtime, hỗ trợ release/test kỹ hơn.
- Tạo **environment mới** ("stage" / **green**) và deploy v2 lên đó. (Các cách trước đều deploy **trong cùng** environment; Blue/Green tạo environment **khác**.)
- Green được kiểm thử **độc lập**, rollback dễ nếu có vấn đề.
- Có thể dùng **Route 53 weighted routing**: ví dụ **90% traffic → blue (v1)**, **10% → green (v2)** để thử nghiệm.
- Khi hài lòng → dùng **Swap environment URLs** (swap CNAME) trên console Beanstalk để green thành environment chính, rồi tắt blue.

#### 6. Traffic Splitting (Canary Testing)

- Thấy **"canary testing"** trong đề → nghĩ ngay **Traffic Splitting**.
- Version mới được deploy lên **ASG tạm** có **cùng capacity** (main 3 instance + temp 3 instance → nhân đôi capacity).
- **ALB** chia **một phần nhỏ % traffic** (ví dụ 10%) sang ASG tạm trong **khoảng thời gian cấu hình được**, 90% vẫn vào ASG chính.
- **Deployment health được giám sát tự động**: nếu deploy lỗi hoặc metric xấu → **tự động rollback rất nhanh** (chỉ việc ngừng gửi traffic sang ASG tạm, ASG chính vẫn còn).
- **Không downtime**.
- Khi ổn định → instance mới được **migrate** từ ASG tạm sang ASG chính, version cũ bị terminate.
- Toàn bộ **tự động** → là bước cải tiến so với Blue/Green thủ công.

#### Bảng so sánh (theo tài liệu Beanstalk)

| Phương án | Ảnh hưởng khi deploy lỗi | Thời gian deploy | Zero downtime | Đổi DNS | Cách rollback | Code deploy lên |
|---|---|---|---|---|---|---|
| **All at once** | Downtime | ⏱ (nhanh nhất) | Không | Không | Deploy lại thủ công | Instance hiện có |
| **Rolling** | 1 batch ngừng phục vụ; các batch thành công trước đó chạy bản mới | ⏱⏱ | Có | Không | Deploy lại thủ công | Instance hiện có |
| **Rolling with additional batch** | Tối thiểu nếu batch đầu lỗi, còn lại giống Rolling | ⏱⏱⏱ | Có | Không | Deploy lại thủ công | Instance mới và hiện có |
| **Immutable** | Tối thiểu | ⏱⏱⏱⏱ | Có | Không | Terminate instance mới | Instance mới |
| **Traffic splitting** | Chỉ % traffic chuyển sang bản mới bị ảnh hưởng tạm thời | ⏱⏱⏱⏱ | Có | Không | Chuyển traffic về + terminate instance mới | Instance mới |
| **Blue/Green** | Tối thiểu | ⏱⏱⏱⏱ | Có | **Có** | **Swap URL** | Instance mới (environment mới) |

#### Chọn phương án theo yêu cầu đề bài

| Yêu cầu | Chọn |
|---|---|
| Dev, nhanh nhất, chấp nhận downtime | **All at once** |
| Không downtime, **không thêm chi phí**, chấp nhận giảm capacity tạm thời | **Rolling** |
| Giữ **đủ capacity**, chi phí thêm **tối thiểu** | **Rolling with additional batch** |
| Đủ capacity + **rollback nhanh nhất**, chấp nhận chi phí cao | **Immutable** |
| Gửi **% nhỏ traffic** sang bản mới, **canary**, rollback tự động | **Traffic Splitting** |
| Môi trường **tách biệt hoàn toàn**, test lâu, chuyển bằng DNS/swap URL | **Blue/Green** |

#### Application deployments và Configuration updates

- **Application deployments**: chính sách khi deploy **application version mới** (6 phương án trên) – **đây là phần đề thi hỏi**.
- **Configuration updates**: khi thay đổi cấu hình khiến instance phải **thay thế** (đổi instance type, VPC, launch template…) → chọn **Rolling** (theo health hoặc theo thời gian) hoặc **Immutable**. Đề thi hầu như không hỏi phần này.
- Với **All at once** và **Immutable**, ô *Batch size* (Fixed/Percentage) không có tác dụng (console vẫn hiển thị nhưng bị vô hiệu). Với **Rolling / Rolling with additional batch**, batch size là **%** (ví dụ 30%) hoặc **cố định** (ví dụ 1 instance).

#### Swap environment URLs (CNAME swap)

- Hoán đổi **domain (CNAME)** giữa 2 environment: prod trỏ sang dev và ngược lại.
- Kịch bản thực tế: **Clone** prod → prod-2, deploy version mới lên prod-2, test kỹ → **swap URL** để prod-2 thành prod.
- Swap là thay đổi **DNS** → cần vài phút để có hiệu lực (DNS cache).

### Kiến thức thực tế

- **Traffic splitting yêu cầu ALB** (dựa trên weighted target group của ALB). Single instance không dùng được Rolling/Immutable/Traffic splitting theo đúng nghĩa (chỉ có 1 instance).
- **Rolling** và **Rolling with additional batch** khi lỗi giữa chừng sẽ để environment ở trạng thái **hỗn hợp 2 version** → phải deploy lại bản cũ thủ công. Đây là lý do prod quan trọng thường chọn **Immutable** hoặc **Traffic splitting**.
- **Immutable/Traffic splitting** tạm thời **nhân đôi số instance** → kiểm tra **EC2 vCPU quota** và số IP còn trống trong subnet, nếu không deploy sẽ lỗi giữa chừng.
- Muốn deploy nhanh hơn nhưng vẫn an toàn: rút ngắn **health check** của ALB, đặt **Command timeout** hợp lý, và **đóng gói sẵn dependencies** trong bundle (xem Bài 5).
- **Blue/Green bằng swap URL** đổi DNS nên client có thể còn cache DNS cũ một lúc; với Route 53 weighted routing có thể chuyển dần traffic theo %. Cả 2 environment chạy song song → **chi phí gấp đôi** trong thời gian chuyển đổi.
- Rollback nhanh nhất cho mọi kiểu deploy trong cùng environment: **deploy lại application version cũ** (version vẫn lưu trong Beanstalk/S3).

### Ghi nhớ cho kỳ thi

- **All at once**: nhanh nhất, **downtime**, không thêm chi phí → **dev**.
- **Rolling**: không thêm chi phí, **giảm capacity** tạm thời, chạy 2 version song song.
- **Rolling with additional batch**: **giữ đủ capacity**, **chi phí thêm nhỏ**.
- **Immutable**: instance mới trong **ASG tạm**, chi phí **cao nhất**, deploy lâu nhất, **rollback nhanh nhất** (terminate ASG mới), luôn đủ capacity.
- **Traffic Splitting** = **canary testing**, % traffic sang bản mới, **rollback tự động**.
- **Blue/Green** = environment mới + **Swap URLs / Route 53 weighted**; không phải tính năng "một nút" của Beanstalk.
- Swap URL = **CNAME swap**.

---

## Bài 5 – EB CLI và quy trình deploy

### Lý thuyết

#### EB CLI là gì?

- Ngoài console và AWS CLI, Beanstalk có một CLI riêng gọi là **EB CLI** (lệnh `eb`), giúp làm việc với Beanstalk **dễ hơn** từ dòng lệnh.
- Các lệnh cơ bản:

| Lệnh | Tác dụng |
|---|---|
| `eb init` | Khởi tạo project trong thư mục hiện tại: chọn region, application, platform (tạo `.elasticbeanstalk/config.yml`) |
| `eb create` | Tạo environment mới (và deploy code hiện tại) |
| `eb status` | Xem trạng thái environment |
| `eb health` | Xem health chi tiết (enhanced health) theo thời gian thực |
| `eb events` | Xem các event gần đây |
| `eb logs` | Lấy log từ instance |
| `eb open` | Mở URL của environment trên trình duyệt |
| `eb deploy` | Đóng gói code → tạo application version mới → deploy |
| `eb config` | Xem/sửa cấu hình environment |
| `eb terminate` | Xoá (terminate) environment |

- EB CLI rất hữu ích để **tự động hoá deployment pipeline** (CI/CD).

#### Quy trình deploy (Deployment Process)

1. **Khai báo dependencies** của ứng dụng: `requirements.txt` (Python), `package.json` (Node.js), `composer.json` (PHP), `pom.xml`/JAR (Java)…
2. **Đóng gói** code thành **file zip**, kèm file mô tả dependencies.
   - Console: **Upload and deploy** file zip → tạo **application version mới** → deploy.
   - CLI: `eb deploy` → tạo application version mới (zip được **upload lên S3**) → deploy.
3. Beanstalk **deploy file zip lên từng EC2 instance**, **resolve dependencies** (ví dụ chạy `npm install` / `pip install`) và **khởi động ứng dụng**.

> Mấu chốt: **mọi application version đều là một file zip lưu trong S3** (bucket `elasticbeanstalk-<region>-<account-id>`). Environment chỉ trỏ tới version đang chạy.

### Kiến thức thực tế

- `eb deploy` mặc định đóng gói **commit gần nhất của git** (nếu thư mục là repo git) → thay đổi chưa commit **không** được deploy. Dùng `eb deploy --staged` để deploy cả các file đã `git add`.
- Dùng file **`.ebignore`** để loại file khỏi bundle (cú pháp giống `.gitignore`; khi có `.ebignore` thì EB CLI bỏ qua `.gitignore`).
- **Đóng gói sẵn dependencies** (ví dụ `node_modules` hoặc wheel Python) vào bundle giúp deploy nhanh và ổn định hơn, không phụ thuộc registry bên ngoài khi scale-out.
- Source bundle tối đa **500 MB**; file phải nằm ở **gốc** zip (không lồng thêm thư mục cha).
- CI/CD hiện đại: **CodePipeline** (source GitHub/CodeCommit/S3 → CodeBuild → deploy action *Elastic Beanstalk*), hoặc GitHub Actions gọi `aws elasticbeanstalk create-application-version` + `update-environment` (dùng OIDC role, không cần access key). Không bắt buộc cài EB CLI trên CI.
- Platform AL2/AL2023 hỗ trợ **`Procfile`** (lệnh khởi động app) và **`Buildfile`** (lệnh build trước khi chạy).

### Ghi nhớ cho kỳ thi

- EB CLI: `eb init / create / deploy / status / health / logs / terminate`.
- Deploy = **zip code + mô tả dependencies** → upload (S3) → application version mới → Beanstalk deploy lên EC2, **resolve dependencies** rồi start app.
- Dependency lớn làm deploy chậm → **đóng gói sẵn dependencies** trong zip.

---

## Bài 6 – Lifecycle Policy

### Lý thuyết

- Beanstalk lưu được tối đa **1000 application versions**.
- Nếu **không xoá** version cũ, khi chạm giới hạn sẽ **không deploy được nữa** (không tạo được version mới).
- Giải pháp: **Lifecycle Policy** để **tự động xoá** version cũ, dựa trên:
  - **Thời gian** (*by age*): xoá version **cũ hơn N ngày**.
  - **Số lượng** (*by total count*): giữ tối đa **N version**, xoá version cũ nhất khi vượt.
- **Version đang được dùng** (đang chạy trên một environment) **không bị xoá**.
- Có tuỳ chọn **giữ lại source bundle trong S3** (*Retain source bundle in S3*) để tránh mất dữ liệu – chỉ xoá bản ghi version trong Beanstalk, file zip vẫn còn.
- Lifecycle policy cần một **service role** có quyền xoá version (thường dùng `aws-elasticbeanstalk-service-role`).

### Kiến thức thực tế

- Lifecycle policy được áp dụng **khi tạo application version mới** (không chạy theo lịch cố định) → không deploy thì version cũ cũng chưa bị dọn.
- Khi chọn *Retain source bundle in S3*, bucket `elasticbeanstalk-<region>-<account>` vẫn phình dần → kết hợp **S3 Lifecycle rule** (chuyển lớp lưu trữ rẻ hơn/xoá sau N ngày) để kiểm soát chi phí.
- Giữ đủ số version để **rollback** nhanh (deploy lại version cũ). Count 50–200 là hợp lý cho đa số team.
- Pipeline CI/CD tạo version mỗi commit → rất dễ chạm 1000 version nếu thiếu lifecycle policy; lỗi điển hình: *"You cannot have more than 1000 application versions"*.

### Ghi nhớ cho kỳ thi

- Giới hạn **1000 application versions**.
- Lifecycle policy theo **thời gian** hoặc **số lượng**; version **đang dùng không bị xoá**.
- Có thể **giữ source bundle trong S3** để tránh mất dữ liệu.

---

## Bài 7 – `.ebextensions`

### Lý thuyết

- Mọi tham số chỉnh trên **UI** đều có thể cấu hình bằng **code** qua `.ebextensions` → cấu hình **được version hoá cùng code**.
- Yêu cầu:
  - Thư mục **`.ebextensions/`** nằm ở **gốc** source code (gốc file zip).
  - Định dạng **YAML** hoặc **JSON**.
  - Tên file có đuôi **`.config`** (ví dụ `logging.config`, `env.config`).
- Có thể:
  - Chỉnh **giá trị mặc định** bằng **`option_settings`**.
  - Thêm **tài nguyên** như **RDS, ElastiCache, DynamoDB, S3…** (khối `Resources` – cú pháp CloudFormation, xem Bài 8).
- **Lưu ý quan trọng**: tài nguyên do `.ebextensions` tạo **bị xoá khi environment bị xoá** (vòng đời gắn với environment).

#### Các khối (keys) thường dùng trong file `.config`

| Key | Tác dụng |
|---|---|
| `option_settings` | Đặt option của environment (biến môi trường, ASG, LB, deployment policy…) |
| `Resources` | Tạo tài nguyên AWS bổ sung bằng cú pháp CloudFormation |
| `packages` | Cài package (yum, rpm, rubygems, python…) |
| `files` | Tạo file trên instance |
| `commands` | Chạy lệnh **trước** khi giải nén/cài app |
| `container_commands` | Chạy lệnh **sau** khi giải nén app, trước khi app được kích hoạt; có `leader_only` (ví dụ chạy DB migration đúng 1 lần) |

#### Thứ tự ưu tiên của cấu hình (precedence)

1. Setting áp **trực tiếp lên environment** (console, `eb config`, API `update-environment`) – **cao nhất**.
2. **Saved configurations**.
3. File cấu hình **`.ebextensions`**.
4. **Giá trị mặc định** – thấp nhất.

> Vì vậy nếu đã chỉnh một option trên console, sửa `.ebextensions` cho option đó sẽ **không có tác dụng**.

### Kiến thức thực tế

- Trên **Amazon Linux 2 / AL2023**, AWS khuyến nghị dùng thư mục **`.platform/`** để tuỳ biến instance:
  - `.platform/hooks/prebuild|predeploy|postdeploy/*.sh` – script chạy theo các giai đoạn deploy (thay cho nhiều `commands`/`container_commands`).
  - `.platform/nginx/conf.d/*.conf` – tuỳ biến reverse proxy nginx.
  - `.platform/confighooks/` – chạy khi chỉ thay đổi cấu hình.
  - `.ebextensions` **vẫn dùng** cho `option_settings` và `Resources`.
- Script trong `.platform/hooks` cần quyền thực thi (`chmod +x`) và xuống dòng kiểu **LF** (file soạn trên Windows hay lỗi CRLF).
- **Không đưa secret** vào `.ebextensions` (nằm trong zip lưu trên S3). Dùng **Secrets Manager / SSM Parameter Store**; Beanstalk hiện hỗ trợ tham chiếu secret/parameter làm **environment properties**.
- File `.config` được xử lý theo **thứ tự alphabet tên file** → đặt tiền tố `01-`, `02-` để kiểm soát thứ tự.

### Ghi nhớ cho kỳ thi

- `.ebextensions/` ở **gốc** source, file **`.config`**, định dạng **YAML/JSON**.
- `option_settings` chỉnh cấu hình; `Resources` thêm RDS/ElastiCache/DynamoDB…
- Tài nguyên tạo bởi `.ebextensions` **bị xoá cùng environment**.
- `container_commands` + `leader_only: true` → chạy lệnh (ví dụ migration) **trên 1 instance**.

---

## Bài 8 – Beanstalk và CloudFormation

### Lý thuyết

- **Bên dưới, Elastic Beanstalk dựa vào CloudFormation**: mỗi environment là một **CloudFormation stack** (`awseb-e-xxxxxxxx-stack`) chứa ASG, ELB, security group, EIP, alarms…
- CloudFormation dùng để **provision các dịch vụ AWS khác** (Infrastructure as Code).
- Ý tưởng: trong `.ebextensions` có thể định nghĩa **tài nguyên CloudFormation** (khối `Resources`) để tạo **ElastiCache, S3 bucket, DynamoDB table, SQS, SNS…** – **bất cứ thứ gì** CloudFormation hỗ trợ.
- Kết hợp → Beanstalk quản lý app, CloudFormation (thông qua `.ebextensions`) bổ sung hạ tầng xung quanh, tất cả **deploy cùng nhau** và **xoá cùng nhau**.

#### Các tài nguyên Beanstalk có sẵn để tham chiếu

| Logical name | Tài nguyên |
|---|---|
| `AWSEBAutoScalingGroup` | Auto Scaling Group của environment |
| `AWSEBLoadBalancer` / `AWSEBV2LoadBalancer` | Classic LB / ALB-NLB |
| `AWSEBSecurityGroup` | Security group của EC2 instance |
| `AWSEBEIP` | Elastic IP (single instance) |

Có thể dùng `Ref`, `Fn::GetAtt` tới các tài nguyên này (ví dụ cho phép SG của instance truy cập ElastiCache).

### Kiến thức thực tế

- Tài nguyên khai báo trong `.ebextensions` **bị xoá khi terminate environment** → **không** dùng cách này cho dữ liệu cần giữ lâu dài (DB prod, bucket chứa dữ liệu người dùng). Tạo những thứ đó ở **stack CloudFormation/CDK riêng** rồi truyền tên/endpoint qua environment properties.
- Không sửa trực tiếp stack `awseb-e-...` trong CloudFormation console → gây **drift**, Beanstalk có thể ghi đè hoặc lỗi khi update.
- Ngược lại, có thể **tạo cả Beanstalk application/environment bằng CloudFormation** (`AWS::ElasticBeanstalk::Application`, `ApplicationVersion`, `ConfigurationTemplate`, `Environment`) hoặc **CDK/Terraform** – cách phổ biến ở doanh nghiệp để quản lý IaC tập trung.
- Lỗi trong khối `Resources` của `.ebextensions` sẽ làm **update environment fail và rollback** → xem tab *Events* của Beanstalk lẫn CloudFormation để tìm nguyên nhân.

### Ghi nhớ cho kỳ thi

- Beanstalk **dùng CloudFormation** bên dưới.
- Muốn thêm ElastiCache/S3/DynamoDB… cùng app → khai báo **`Resources`** trong **`.ebextensions`**.
- Tài nguyên đó **gắn vòng đời** với environment.

---

## Bài 9 – Cloning environment

### Lý thuyết

- **Clone** một environment sang environment mới với **cấu hình y hệt**.
- Hữu ích để deploy một bản **"test"** của ứng dụng có cấu hình giống prod (ví dụ thử version mới trước khi swap URL – Blue/Green).
- **Mọi tài nguyên và cấu hình được giữ nguyên**:
  - **Load Balancer**: loại và cấu hình.
  - **RDS**: **loại** database (engine, instance class…) – **nhưng dữ liệu KHÔNG được sao chép**.
  - **Biến môi trường** (environment properties).
  - Platform, instance type, capacity, deployment policy…
- Sau khi clone, **có thể thay đổi** cấu hình của environment mới.

### Kiến thức thực tế

- Clone **không copy dữ liệu RDS** – bản clone có DB trống. Muốn có dữ liệu, restore từ **snapshot** hoặc trỏ app tới DB dùng chung (DB tách rời, Bài 10).
- **Saved configurations** là cách "clone có kiểm soát": lưu cấu hình thành template (lưu trong S3), dùng lại khi tạo environment mới bất kỳ lúc nào.
- *Clone with latest platform* tiện để **nâng cấp platform** theo kiểu Blue/Green: clone lên platform mới → test → swap URL.
- Bản clone chạy song song → **chi phí gấp đôi** (ALB, EC2, RDS) cho tới khi xoá.

### Ghi nhớ cho kỳ thi

- Clone = environment mới **cùng cấu hình** (LB, loại RDS, env vars).
- **Dữ liệu RDS không được clone**.
- Clone hay dùng cho **test/Blue-Green** trước khi swap URL.

---

## Bài 10 – Migration: đổi Load Balancer, tách RDS

### Lý thuyết

#### A. Đổi loại Load Balancer

- Sau khi tạo environment, **KHÔNG thể đổi loại Load Balancer** (ví dụ Classic LB → ALB), **chỉ** chỉnh được **cấu hình** của LB hiện tại.
- Cách migrate:
  1. Tạo **environment mới** với **cùng cấu hình, trừ LB** (→ **không dùng Clone được**, vì clone giữ nguyên loại LB; có thể dùng saved configuration rồi đổi loại LB).
  2. **Deploy ứng dụng** lên environment mới.
  3. Chuyển traffic: **CNAME swap** (Swap environment URLs) hoặc **cập nhật Route 53**.
  4. Kiểm tra ổn định → terminate environment cũ.

#### B. RDS với Elastic Beanstalk

- RDS **có thể** provision cùng Beanstalk → **tốt cho dev/test**.
- **Không tốt cho prod**: **vòng đời database gắn với Beanstalk environment** → xoá environment là mất DB.
- **Best practice cho prod**: tạo RDS **riêng** (bên ngoài Beanstalk) và cung cấp **connection string** cho app (qua environment properties / Secrets Manager).

#### C. Tách (decouple) RDS khỏi Beanstalk environment

Khi đã lỡ tạo RDS **bên trong** environment prod:

1. **Tạo snapshot** của RDS DB (phòng hờ).
2. Vào **RDS console** → bật **Deletion protection** cho DB.
3. Tạo **environment Beanstalk mới**, **không có RDS**, trỏ ứng dụng tới **RDS hiện có** (qua biến môi trường).
4. Thực hiện **CNAME swap** (blue/green) hoặc cập nhật **Route 53**, xác nhận mọi thứ hoạt động.
5. **Terminate environment cũ** → RDS **không bị xoá** nhờ deletion protection.
6. Stack CloudFormation cũ sẽ ở trạng thái **`DELETE_FAILED`** (vì không xoá được RDS) → vào CloudFormation **xoá stack thủ công**, chọn **giữ lại (retain)** tài nguyên RDS.

```
 Beanstalk Env cũ (có RDS)          Beanstalk Env mới (không RDS)
   ELB → ASG → RDS  ──────────────►   ELB → ASG ──┐
          (deletion protection)                    └─► RDS (giữ nguyên)
   ── CNAME swap / Route 53 ──►  terminate env cũ → xoá CFN stack (retain RDS)
```

### Kiến thức thực tế

- **(Cập nhật)** Console Beanstalk hiện có tuỳ chọn **Database lifecycle / deletion policy** khi terminate: **Create snapshot**, **Retain** hoặc **Delete**, và có luồng **decouple database** ngay trong mục *Configuration → Database* – giúp tách RDS khỏi environment mà không cần quy trình thủ công 6 bước. Tuy nhiên đề thi vẫn hỏi theo quy trình **snapshot → deletion protection → env mới → swap → terminate → xoá stack**.
- Cách tốt nhất từ đầu: tạo RDS (hoặc Aurora) bằng **stack CloudFormation/CDK riêng**, lưu credentials trong **Secrets Manager** (bật rotation), cho SG của RDS nhận kết nối từ SG của Beanstalk instance.
- Classic Load Balancer đã lỗi thời; environment mới nên dùng **ALB** (hỗ trợ traffic splitting, path/host routing, shared ALB) hoặc **NLB** khi cần TCP/UDP, IP tĩnh.
- Khi swap URL lúc migrate, chú ý **TTL DNS**; nếu domain riêng trỏ bằng Route 53 **alias** tới environment, có thể cập nhật alias trực tiếp thay vì swap.

### Ghi nhớ cho kỳ thi

- **Không đổi được loại LB** sau khi tạo → tạo **env mới** (không clone) + deploy + **CNAME swap/Route 53**.
- RDS trong Beanstalk: **ok cho dev/test**, **không tốt cho prod** (vòng đời gắn env).
- Decouple RDS: **snapshot → deletion protection → env mới không RDS → swap → terminate env cũ → xoá CFN stack (DELETE_FAILED)**.

---

## Bài 11 – Dọn dẹp

### Lý thuyết

- Beanstalk tạo nhiều tài nguyên tính phí (EC2, ELB, EIP, RDS…) → sau khi học xong cần dọn để **tránh phát sinh chi phí**.
- Xoá **application** sẽ **terminate tất cả environment** bên trong và xoá các application version (tuỳ chọn xoá source bundle).
- Những thứ còn lại sau khi xoá application:
  - **S3 bucket** `elasticbeanstalk-<region>-<account-id>` (chứa source bundle, log, saved config). Bucket có **bucket policy chặn xoá** → phải xoá policy trước nếu muốn xoá bucket.
  - **IAM roles** (`aws-elasticbeanstalk-service-role`, `aws-elasticbeanstalk-ec2-role`) – miễn phí, có thể giữ.
  - RDS/snapshot nếu đã bật retain/deletion protection.

### Kiến thức thực tế

- **Elastic IP** không gắn instance và **public IPv4** đều tính phí theo giờ (từ 02/2024 mọi public IPv4 đều tính phí) → kiểm tra EIP còn sót.
- Log stream tới **CloudWatch Logs** với `DeleteOnTerminate: false` vẫn còn và tính phí lưu trữ → đặt retention hoặc xoá log group `/aws/elasticbeanstalk/...`.
- Dùng **AWS Budgets** cảnh báo chi phí và **Tag Editor / Resource Explorer** để tìm tài nguyên sót theo tag `elasticbeanstalk:environment-name`.

### Ghi nhớ cho kỳ thi

- Xoá application → terminate mọi environment.
- Bucket S3 của Beanstalk có **bucket policy chặn xoá**.

---

## Câu hỏi ôn tập

*Nguồn: Elastic Beanstalk Quiz (biên soạn lại theo phong cách đề DVA-C02, 18 câu). Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Bạn có một ứng dụng web Python muốn deploy lên AWS mà không phải tự quản lý hạ tầng (ELB, ASG, EC2), nhưng vẫn muốn kiểm soát được cấu hình bên dưới khi cần. Dịch vụ nào phù hợp nhất?

- A. AWS CloudFormation
- B. AWS Elastic Beanstalk
- C. Amazon EC2 + Auto Scaling tự cấu hình
- D. AWS Lambda

<details><summary>Đáp án</summary>

**B.** Elastic Beanstalk là PaaS: chỉ cần upload code, Beanstalk lo capacity provisioning, load balancing, scaling, health monitoring; vẫn có thể chỉnh cấu hình đầy đủ. A phải tự viết template hạ tầng; C phải tự quản lý; D đòi hỏi viết lại app theo mô hình serverless.
</details>

**Câu 2.** Ứng dụng của bạn cần xử lý các tác vụ nền tốn thời gian (ví dụ xử lý video) tách khỏi web server. Nên dùng loại environment tier nào cho phần xử lý này?

- A. Web Server Environment Tier
- B. Worker Environment Tier
- C. Single Instance Environment
- D. Load Balanced Environment

<details><summary>Đáp án</summary>

**B.** Worker tier dùng **SQS queue**: EC2 worker pull message từ queue để xử lý và scale theo số message. Web tier phục vụ HTTP request trực tiếp. C, D là kiểu environment (dev/prod), không phải tier.
</details>

**Câu 3.** Bạn muốn deploy version mới lên môi trường development nhanh nhất có thể và chấp nhận downtime. Chọn deployment policy nào?

- A. Rolling
- B. Immutable
- C. All at once
- D. Rolling with additional batch

<details><summary>Đáp án</summary>

**C.** All at once deploy lên tất cả instance cùng lúc: nhanh nhất, không thêm chi phí, nhưng có downtime → phù hợp dev.
</details>

**Câu 4.** Ứng dụng prod cần deploy version mới mà **luôn giữ đủ capacity** trong suốt quá trình, với **chi phí phát sinh tối thiểu**. Chọn policy nào?

- A. All at once
- B. Rolling
- C. Rolling with additional batch
- D. Immutable

<details><summary>Đáp án</summary>

**C.** Rolling with additional batch tạo thêm một batch instance mới nên capacity không giảm, chi phí thêm nhỏ. Rolling (B) làm giảm capacity; Immutable (D) giữ capacity nhưng nhân đôi số instance → chi phí cao hơn.
</details>

**Câu 5.** Deployment policy nào deploy code mới lên **instance mới trong một ASG tạm thời**, cho phép **rollback nhanh nhất** bằng cách terminate ASG mới?

- A. Rolling
- B. Immutable
- C. Blue/Green
- D. All at once

<details><summary>Đáp án</summary>

**B.** Immutable tạo temporary ASG, chạy version mới, rồi chuyển instance sang ASG chính và terminate instance cũ. Nếu lỗi, chỉ cần terminate ASG tạm – instance cũ còn nguyên.
</details>

**Câu 6.** Team muốn thực hiện **canary testing**: gửi 10% traffic sang version mới trong 15 phút, tự động rollback nếu health xấu. Chọn gì?

- A. Blue/Green với Route 53 weighted routing
- B. Rolling với batch size 10%
- C. Traffic Splitting
- D. Immutable

<details><summary>Đáp án</summary>

**C.** Traffic Splitting = canary testing được Beanstalk hỗ trợ trực tiếp: ALB chia % traffic sang ASG tạm trong thời gian đánh giá, giám sát health và tự động rollback. A làm được nhưng thủ công; B không chia theo % traffic và không tự rollback.
</details>

**Câu 7.** Để thực hiện Blue/Green deployment với Elastic Beanstalk, sau khi environment "green" đã được test xong, thao tác nào chuyển traffic sang green nhanh nhất?

- A. Deploy lại application version lên environment blue
- B. Swap environment URLs (CNAME swap)
- C. Đổi deployment policy sang Immutable
- D. Clone environment blue

<details><summary>Đáp án</summary>

**B.** Swap environment URLs hoán đổi CNAME giữa 2 environment, green trở thành environment chính. Đây là thay đổi DNS nên mất vài phút để có hiệu lực.
</details>

**Câu 8.** Mỗi khi deploy, ứng dụng Node.js của bạn mất rất lâu vì phải tải nhiều dependency trên từng EC2 instance. Cách nào cải thiện thời gian deploy?

- A. Tăng instance type
- B. Đóng gói sẵn dependencies cùng source code trong file zip
- C. Chuyển sang deployment policy Immutable
- D. Dùng Lifecycle Policy

<details><summary>Đáp án</summary>

**B.** Beanstalk resolve dependencies trên mỗi instance khi deploy; đóng gói sẵn dependencies trong bundle giúp bỏ bước tải về, deploy nhanh và ổn định hơn. C còn làm deploy lâu hơn.
</details>

**Câu 9.** Pipeline CI/CD tạo một application version mới mỗi commit. Gần đây deploy thất bại vì đã có quá nhiều application version. Giới hạn số version là bao nhiêu và giải pháp là gì?

- A. 100 version; tăng quota bằng Service Quotas
- B. 1000 version; cấu hình Lifecycle Policy
- C. 500 version; xoá S3 bucket của Beanstalk
- D. 1000 version; tạo application mới cho mỗi lần deploy

<details><summary>Đáp án</summary>

**B.** Beanstalk giữ tối đa 1000 application versions. Lifecycle Policy tự động xoá version cũ theo thời gian hoặc số lượng (version đang dùng không bị xoá).
</details>

**Câu 10.** Khi cấu hình Lifecycle Policy, làm sao để tránh mất vĩnh viễn source code của các version bị xoá?

- A. Bật S3 Versioning cho bucket Beanstalk
- B. Chọn tuỳ chọn giữ lại source bundle trong S3 (Retain source bundle)
- C. Dùng Deletion protection
- D. Không thể; version bị xoá là mất cả source bundle

<details><summary>Đáp án</summary>

**B.** Lifecycle Policy có tuỳ chọn **retain source bundle in S3**: chỉ xoá bản ghi version trong Beanstalk, file zip vẫn được giữ trong S3.
</details>

**Câu 11.** Bạn muốn cấu hình Beanstalk environment bằng code (biến môi trường, cấu hình ASG…) và version hoá cùng source. Các file cấu hình phải đặt ở đâu và có định dạng gì?

- A. Thư mục `.ebextensions/` ở gốc source, file đuôi `.config`, định dạng YAML hoặc JSON
- B. Thư mục `.elasticbeanstalk/`, file `config.yml`
- C. File `cloudformation.yaml` ở gốc source
- D. Thư mục `.ebextensions/` ở bất kỳ đâu, file đuôi `.yaml`

<details><summary>Đáp án</summary>

**A.** `.ebextensions/` phải nằm ở **gốc** bundle, file có đuôi `.config`, viết bằng YAML/JSON. B là file cấu hình cục bộ của EB CLI, không phải cấu hình environment.
</details>

**Câu 12.** Bạn muốn ứng dụng Beanstalk có thêm một cụm ElastiCache được tạo và quản lý cùng environment. Cách đơn giản nhất?

- A. Tạo ElastiCache thủ công rồi hard-code endpoint
- B. Khai báo tài nguyên ElastiCache trong khối `Resources` của file `.ebextensions`
- C. Dùng Beanstalk Worker tier
- D. Dùng `eb create --elasticache`

<details><summary>Đáp án</summary>

**B.** Beanstalk dựa trên CloudFormation, nên `.ebextensions` có thể khai báo bất kỳ tài nguyên CloudFormation nào (ElastiCache, S3, DynamoDB…). Lưu ý tài nguyên này bị xoá khi environment bị xoá.
</details>

**Câu 13.** Bạn cần chạy database migration **chỉ một lần** trên một instance trong mỗi lần deploy lên environment nhiều instance. Dùng cấu hình nào trong `.ebextensions`?

- A. `commands`
- B. `container_commands` với `leader_only: true`
- C. `packages`
- D. `files`

<details><summary>Đáp án</summary>

**B.** `container_commands` chạy sau khi giải nén app và trước khi app được kích hoạt; `leader_only: true` đảm bảo lệnh chỉ chạy trên 1 instance (leader). `commands` chạy trên mọi instance và trước khi giải nén app.
</details>

**Câu 14.** Dịch vụ nào Elastic Beanstalk sử dụng bên dưới để provision tài nguyên (ELB, ASG, security group…)?

- A. AWS CodeDeploy
- B. AWS OpsWorks
- C. AWS CloudFormation
- D. AWS Systems Manager

<details><summary>Đáp án</summary>

**C.** Mỗi environment là một CloudFormation stack (`awseb-e-...-stack`); tab Events của Beanstalk phản ánh sự kiện của stack này.
</details>

**Câu 15.** Bạn muốn tạo một bản test của environment prod với **cấu hình y hệt** để thử version mới. Cách nhanh nhất là gì, và điều gì **không** được sao chép?

- A. Clone environment; dữ liệu trong RDS không được sao chép
- B. Clone environment; biến môi trường không được sao chép
- C. Tạo environment mới thủ công; loại load balancer không được giữ
- D. Swap URLs; cấu hình ASG không được giữ

<details><summary>Đáp án</summary>

**A.** Clone giữ nguyên toàn bộ cấu hình: loại và cấu hình LB, loại RDS, biến môi trường… nhưng **dữ liệu RDS không được clone**.
</details>

**Câu 16.** Environment prod đang dùng Classic Load Balancer, bạn muốn chuyển sang Application Load Balancer. Cách đúng là gì?

- A. Vào Configuration → Load balancer → đổi loại sang ALB
- B. Clone environment rồi đổi loại LB trên bản clone
- C. Tạo environment mới với cùng cấu hình nhưng dùng ALB, deploy app, rồi CNAME swap hoặc cập nhật Route 53
- D. Sửa trực tiếp stack CloudFormation của environment

<details><summary>Đáp án</summary>

**C.** Loại LB **không đổi được** sau khi tạo environment (A sai). Clone giữ nguyên loại LB (B sai). Sửa stack trực tiếp gây drift (D sai). Phải tạo env mới (không clone) rồi chuyển traffic.
</details>

**Câu 17.** Một RDS database được tạo bên trong Beanstalk environment prod. Bạn muốn tách DB ra để vòng đời độc lập. Bước nào **đúng** để đảm bảo DB không bị xoá khi terminate environment cũ?

- A. Tạo snapshot, bật **Deletion protection** cho RDS, tạo env mới trỏ tới RDS hiện có, swap URL, terminate env cũ, xoá CloudFormation stack ở trạng thái DELETE_FAILED
- B. Terminate env cũ rồi restore RDS từ snapshot tự động
- C. Clone environment, bản clone sẽ giữ dữ liệu RDS
- D. Đổi Lifecycle Policy sang retain source bundle

<details><summary>Đáp án</summary>

**A.** Đây là quy trình decouple RDS chuẩn. Deletion protection khiến việc xoá RDS trong stack thất bại → stack ở DELETE_FAILED, cần xoá thủ công và giữ lại (retain) RDS. C sai vì clone không sao chép dữ liệu.
</details>

**Câu 18.** Lệnh EB CLI nào đóng gói code hiện tại, tạo application version mới và deploy lên environment?

- A. `eb create`
- B. `eb deploy`
- C. `eb init`
- D. `eb config`

<details><summary>Đáp án</summary>

**B.** `eb deploy` zip code, upload lên S3 thành application version mới và deploy lên environment hiện tại. `eb create` tạo environment mới; `eb init` khởi tạo project; `eb config` sửa cấu hình.
</details>

**Câu 19.** Bạn đã chỉnh option `InstanceType` trực tiếp trên console Beanstalk. Sau đó bạn sửa giá trị này trong `.ebextensions` và deploy lại nhưng instance type không đổi. Vì sao?

- A. `.ebextensions` không hỗ trợ đổi instance type
- B. Setting áp trực tiếp lên environment có độ ưu tiên cao hơn file `.ebextensions`
- C. Phải dùng Immutable deployment mới áp dụng được
- D. Phải xoá Lifecycle Policy

<details><summary>Đáp án</summary>

**B.** Thứ tự ưu tiên: setting trực tiếp trên environment (console/CLI/API) > saved configuration > `.ebextensions` > mặc định. Cần xoá setting trực tiếp (hoặc chỉnh trên console) để giá trị trong `.ebextensions` có hiệu lực.
</details>

---

[← Chương 16](ch16-ecs-ecr-fargate-docker-in-aws.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chương 18 →](ch18-aws-cloudformation.md)

