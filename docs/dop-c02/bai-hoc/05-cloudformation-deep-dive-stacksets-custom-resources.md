# AWS CloudFormation Chuyên sâu: Stack Policy, Custom Resources, cfn-signal, StackSets & Guard/Hooks

Trong kỳ thi **AWS Certified DevOps Engineer - Professional (DOP-C02)**, Domain 2 (Configuration Management and IaC - 17%) kiểm tra rất sâu cách vận hành **CloudFormation ở quy mô doanh nghiệp**: ngăn chặn xóa nhầm database production khi update stack, đồng bộ khởi tạo EC2 với `cfn-init`/`cfn-signal`, mở rộng IaC bằng Custom Resources, quản trị hàng trăm tài khoản bằng StackSets và áp dụng chính sách tuân thủ trước khi deploy bằng **CloudFormation Guard & Hooks**.

---

## 1. Bảo vệ Tài nguyên Production: Change Sets, DeletionPolicy, UpdateReplacePolicy & Stack Policy

Một sai lầm kinh điển trong IaC là thay đổi một thuộc tính yêu cầu **Replacement** (ví dụ đổi `DBInstanceIdentifier` trên RDS) khiến CloudFormation xóa DB cũ và tạo DB mới, làm mất toàn bộ dữ liệu.

### 1.1. Phân biệt 4 cơ chế bảo vệ

| Cơ chế | Thời điểm tác dụng | Phạm vi bảo vệ | Cách hoạt động |
| :--- | :--- | :--- | :--- |
| **Change Sets** | Trước khi Update Stack | Xem trước (Preview) mọi thay đổi | Liệt kê rõ tài nguyên nào sẽ `Modify`, `Add`, `Remove`, và cột `Replacement: True/False/Conditional` trước khi nhấn Execute. |
| **DeletionPolicy** | Khi **xóa Stack** hoặc **xóa tài nguyên** khỏi template | Từng Resource | `Delete` (mặc định), `Retain` (giữ lại tài nguyên ngoài stack), `Snapshot` (tạo snapshot cuối cùng cho RDS, EBS, Redshift, ElastiCache, Neptune trước khi xóa), `RetainExceptOnCreate`. |
| **UpdateReplacePolicy** | Khi Update Stack gây ra **Replacement** (tạo mới + xóa cũ) | Từng Resource | Tương tự DeletionPolicy (`Delete`, `Retain`, `Snapshot`) nhưng áp dụng riêng cho hành động **Replace** khi update. **Rất hay bị nhầm với DeletionPolicy!** |
| **Stack Policy** | Trong quá trình **Update Stack** | Toàn bộ hoặc nhóm Resource trong Stack | JSON policy gắn vào Stack. **Một khi đã gắn Stack Policy, MỌI tài nguyên trong stack mặc định bị CHẶN update (`Deny`)**, trừ các tài nguyên được `Allow` tường minh! |

### 1.2. Ví dụ Stack Policy chuẩn bảo vệ Production RDS

```json
{
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "Update:*",
      "Principal": "*",
      "Resource": "*"
    },
    {
      "Effect": "Deny",
      "Action": ["Update:Replace", "Update:Delete"],
      "Principal": "*",
      "Resource": "LogicalResourceId/ProductionRDS",
      "Condition": {
        "StringEquals": {
          "ResourceType": ["AWS::RDS::DBInstance"]
        }
      }
    }
  ]
}
```

> **Exam Tip**:
> - **Stack Policy KHÔNG áp dụng khi Delete Stack** (muốn chặn xóa stack phải bật **Termination Protection** và giới hạn quyền IAM `cloudformation:DeleteStack`).
> - **Stack Policy KHÔNG thay thế IAM**: nó bảo vệ chống **vô tình** update/replace. Người có quyền `cloudformation:SetStackPolicy` vẫn có thể truyền một **Temporary Stack Policy Override** (`--stack-policy-during-update-body`) khi thực sự cần bảo trì có chủ đích.
> - Để bảo vệ RDS vừa không mất dữ liệu khi xóa stack, vừa không mất dữ liệu khi vô tình bị replace trong lúc update → kết hợp cả **`DeletionPolicy: Snapshot` (hoặc `Retain`)** VÀ **`UpdateReplacePolicy: Snapshot` (hoặc `Retain`)** VÀ **Stack Policy**.

---

## 2. Nested Stacks vs Cross-Stack References (`Export` / `Fn::ImportValue`)

| Tiêu chí | Nested Stacks (`AWS::CloudFormation::Stack`) | Cross-Stack References (`Outputs.Export` + `Fn::ImportValue`) |
| :--- | :--- | :--- |
| **Vòng đời (Lifecycle)** | **Gắn chặt** với Parent Stack. Xóa Parent → xóa tất cả Child. | **Độc lập hoàn toàn** giữa các stack (VD: Network Stack quản bởi NetOps, App Stack quản bởi DevOps). |
| **Mục đích chính** | Tái sử dụng pattern phổ biến (VD: chuẩn ALB + TargetGroup) và vượt qua giới hạn 500 resources / 51,200 bytes của 1 template. | Chia sẻ tài nguyên nền tảng (VPC ID, Subnet IDs, KMS Key ARN) cho nhiều ứng dụng khác nhau. |
| **Ràng buộc (Locking Caveat)** | Không bị khóa export. Update từ Parent Stack. | **CẢNH BÁO**: Một khi Stack B đang `Fn::ImportValue` một giá trị từ Stack A, bạn **KHÔNG THỂ xóa Stack A hoặc sửa giá trị Export đó** cho đến khi gỡ hết mọi Stack đang import! |

> **Exam Tip**: Nếu bài thi mô tả lỗi *"Export cannot be updated/deleted as it is in use by another stack"* và yêu cầu kiến trúc tách rời linh hoạt hơn (loose coupling) để cập nhật cấu hình mạng/endpoint mà không bị khóa cứng → đề xuất lưu giá trị chia sẻ vào **SSM Parameter Store** (truyền qua Dynamic Reference `{{resolve:ssm:...}}` hoặc Parameter type `AWS::SSM::Parameter::Value<String>`) thay vì `Fn::ImportValue`.

---

## 3. CloudFormation Custom Resources (Lambda-backed)

Khi cần quản lý tài nguyên **chưa được CloudFormation hỗ trợ native**, tìm kiếm AMI ID động, chạy script dọn dẹp S3 Bucket không rỗng trước khi xóa stack (Empty S3 Bucket on Delete), hoặc gọi API hệ thống bên thứ 3 (VD: tạo record DNS ngoài AWS), ta dùng **`Custom::MyResource`** (hoặc `AWS::CloudFormation::CustomResource`) gắn với `ServiceToken` là ARN của Lambda Function (hoặc SNS Topic).

### Cơ chế hoạt động & Bẫy thường gặp
1. CloudFormation gửi sự kiện chứa `RequestType` (`Create`, `Update`, `Delete`), `ResponseURL` (Pre-signed S3 URL), `StackId`, `RequestId`, `LogicalResourceId`, `PhysicalResourceId`.
2. Lambda thực thi logic và **BẮT BUỘC phải gửi HTTP PUT phản hồi (`SUCCESS` hoặc `FAILED`) về `ResponseURL`** (thường dùng thư viện `cfnresponse.send()`).
3. **Bẫy Timeout (1 giờ)**: Nếu Lambda bị crash, throw exception chưa bắt (unhandled exception) hoặc quên gửi response về `ResponseURL`, CloudFormation Stack sẽ bị **treo ở trạng thái `CREATE_IN_PROGRESS` / `DELETE_IN_PROGRESS` suốt 1 giờ** rồi mới timeout! Do đó luôn bọc code Lambda trong `try ... except` và gửi `FAILED` ngay nếu có lỗi.
4. **Cẩn thận khi `Update`**: Nếu Lambda trả về `PhysicalResourceId` **khác** với giá trị cũ trong sự kiện `Update`, CloudFormation sẽ coi là **Replacement** và tự động gửi thêm một sự kiện **`Delete`** cho `PhysicalResourceId` cũ!

---

## 4. CreationPolicy, WaitCondition, `cfn-init`, `cfn-signal` & `cfn-hup`

Mặc định, CloudFormation đánh dấu `AWS::EC2::Instance` là `CREATE_COMPLETE` ngay khi EC2 boot xong ở tầng hypervisor, **không quan tâm** script User Data cài Nginx/App bên trong thành công hay thất bại.

### 4.1. Bộ công cụ Helper Scripts chuẩn
- **`cfn-init`**: Đọc metadata `AWS::CloudFormation::Init` để cài packages, tạo file, khởi chạy services một cách idempotent.
- **`cfn-signal`**: Gửi tín hiệu thành công/thất bại (`-e $?`) từ bên trong EC2 về cho CloudFormation `CreationPolicy` (hoặc `WaitCondition`).
- **`cfn-hup`**: Daemon chạy nền trên EC2, định kỳ poll (mặc định 15 phút) kiểm tra thay đổi trong `AWS::CloudFormation::Init` metadata để tự động chạy lại `cfn-init` mà **không cần replace EC2 instance**.
- **`cfn-get-metadata`**: Lấy khối metadata từ CloudFormation template.

```yaml
Resources:
  WebServerASG:
    Type: AWS::AutoScaling::AutoScalingGroup
    CreationPolicy:
      ResourceSignal:
        Count: 2
        Timeout: PT15M
    UpdatePolicy:
      AutoScalingRollingUpdate:
        MinInstancesInService: 1
        MaxBatchSize: 1
        PauseTime: PT15M
        WaitOnResourceSignals: true
```

```bash
#!/bin/bash -xe
# User Data trên EC2 instance
/opt/aws/bin/cfn-init -v --stack ${AWS::StackName} --resource WebServerLaunchTemplate --region ${AWS::Region}
# Gửi exit code của cfn-init về CloudFormation; nếu != 0 stack sẽ rollback ngay lập tức!
/opt/aws/bin/cfn-signal -e $? --stack ${AWS::StackName} --resource WebServerASG --region ${AWS::Region}
```

> **Exam Tip**:
> - Luôn ưu tiên **`CreationPolicy`** cho `AWS::EC2::Instance`, `AWS::AutoScaling::AutoScalingGroup` và `AWS::AppStream::Fleet`. Chỉ dùng **`WaitCondition` + `WaitConditionHandle`** cho các tài nguyên **không hỗ trợ `CreationPolicy`**.
> - Nếu `cfn-signal` không gửi được tín hiệu do EC2 trong Private Subnet không có đường ra CloudFormation endpoint → cần NAT Gateway hoặc **VPC Interface Endpoint cho CloudFormation**.

---

## 5. CloudFormation StackSets: Service-Managed vs Self-Managed

StackSets cho phép triển khai đồng bộ cùng một template ra **nhiều AWS Accounts và nhiều Regions** từ một điểm quản lý duy nhất.

| Đặc điểm | Service-Managed Permissions | Self-Managed Permissions |
| :--- | :--- | :--- |
| **Tích hợp AWS Organizations** | **Bắt buộc** (từ Management Account hoặc **Delegated Administrator** — Best Practice!). | Không yêu cầu Organizations (deploy vào bất kỳ AWS Account ID nào). |
| **Quản lý IAM Roles** | AWS **tự động tạo & quản lý** IAM roles ở các target account. | Bạn phải **tự tạo** `AWSCloudFormationStackSetAdministrationRole` (Admin account) và `AWSCloudFormationStackSetExecutionRole` (mọi Target account). |
| **Mục tiêu triển khai (Targets)** | Toàn bộ Organization hoặc từng **OU (Organizational Unit)** cụ thể. | Danh sách tường minh từng Account ID. |
| **Auto-Deployment** | **CÓ**: Khi account mới gia nhập OU, StackSet tự động deploy; khi account rời OU, có thể chọn tự xóa hoặc giữ lại (`RetainStacksOnAccountRemoval`). | **KHÔNG** hỗ trợ. |

### Tham số vận hành quan trọng của StackSets
- **`MaxConcurrentCount` / `MaxConcurrentPercentage`**: Số tài khoản deploy song song cùng lúc.
- **`FailureToleranceCount` / `FailureTolerancePercentage`**: Ngưỡng lỗi cho phép trước khi StackSet dừng rollout ở các vùng/tài khoản tiếp theo.
- **`RegionConcurrencyType`**: `SEQUENTIAL` (xong Region 1 mới sang Region 2 — an toàn hơn) vs `PARALLEL` (triển khai đồng thời nhiều Region — nhanh hơn).

---

## 6. CloudFormation Guard (cfn-guard) & CloudFormation Hooks

Trong DevSecOps hiện đại (shift-left compliance), DOP-C02 kiểm tra hai công cụ ngăn chặn tài nguyên không tuân thủ **trước khi chúng được tạo ra**:

1. **AWS CloudFormation Guard (`cfn-guard`)**:
   - Công cụ CLI mã nguồn mở **policy-as-code** (chạy ở local hoặc trong bước **CodeBuild** của CI/CD pipeline).
   - Kiểm tra tĩnh (static analysis) file CloudFormation template, Terraform plan JSON hoặc Kubernetes YAML theo bộ quy tắc DSL (VD: bắt buộc mọi `AWS::S3::Bucket` phải có `BucketEncryption`, cấm Security Group mở `0.0.0.0/0` port 22).
   - Nếu vi phạm → fail build ngay ở giai đoạn CI, trước khi gọi CloudFormation API.

2. **AWS CloudFormation Hooks**:
   - Chạy **tự động bên trong AWS CloudFormation service** ngay trước các thao tác `CREATE`, `UPDATE`, `DELETE` trên resource/stack/change set (server-side preventive control).
   - Có 2 chế độ: **`WARN`** (ghi log cảnh báo nhưng vẫn cho deploy) và **`FAIL`** (chặn đứng quá trình tạo/cập nhật tài nguyên vi phạm và rollback).
   - Hỗ trợ tích hợp trực tiếp **AWS Guard Hook** (chạy rule `cfn-guard` ngay ở tầng AWS service mà không cần viết custom Java/Python hook) và **Lambda Hook**.

> **Exam Tip**:
> - Muốn kiểm tra template **trước khi commit / trong CI pipeline (CodeBuild)** → dùng **`cfn-guard`** (hoặc `cfn-lint` cho lỗi cú pháp).
> - Muốn **chặn cứng ở tầng AWS Account** ngay cả khi ai đó deploy thủ công bằng AWS Console/CLI bỏ qua CI/CD pipeline → dùng **CloudFormation Hooks** với `FailureMode: FAIL` (kết hợp SCP nếu cần).

---

## 7. Checklist Ôn thi Nhanh (DOP-C02 Domain 2)

- [ ] Bảo vệ dữ liệu RDS khi update/replace: **`UpdateReplacePolicy: Snapshot/Retain`** + **Stack Policy** (`Deny Update:Replace, Update:Delete`).
- [ ] Stack Policy chỉ bảo vệ khi **Update**, không bảo vệ khi **Delete Stack** (dùng **Termination Protection**).
- [ ] Cross-Stack `Fn::ImportValue` **khóa chặt Export**; dùng **SSM Parameter Store** nếu cần loose coupling.
- [ ] Custom Resource Lambda quên gọi `ResponseURL` → Stack **treo 1 giờ**.
- [ ] Đợi User Data cài xong mới đánh dấu `CREATE_COMPLETE` → **`CreationPolicy` + `cfn-init` + `cfn-signal -e $?`**.
- [ ] Tự động deploy baseline vào mọi AWS Account mới tạo trong OU → **StackSets Service-Managed + Delegated Admin + Auto-Deployment**.
- [ ] Preventive compliance trong CI/CD → **`cfn-guard`**; Preventive compliance ép buộc ở tầng CloudFormation service → **CloudFormation Hooks (`FAIL`)**.

---

[← Bài trước](04-elastic-beanstalk-ecs-deployment-policies.md) | [Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/04-iac-cloudformation-core.md) | [Bài tiếp →](06-cloudformation-cdk-ssm-iac.md)
