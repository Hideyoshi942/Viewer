# Infrastructure as Code & Quản lý Cấu hình: CloudFormation, CDK & SSM

Domain 2 (**Configuration Management and IaC** - **17%**) tập trung vào việc tự động hóa hạ tầng ở quy mô multi-account/multi-region bằng **CloudFormation StackSets**, xử lý drift, bootstrapping EC2 chuẩn xác, sử dụng **AWS CDK** và quản trị hệ điều hành/cấu hình tập trung bằng **Systems Manager (SSM)** & **EC2 Image Builder**.

## 1. CloudFormation Nâng cao: StackSets, Nested Stacks & Custom Resources

### StackSets: Self-Managed vs Service-Managed
| Tiêu chí | Self-Managed Permissions | Service-Managed Permissions |
| :--- | :--- | :--- |
| **Phạm vi** | Bất kỳ AWS account nào (kể cả ngoài Org) | Tích hợp chặt với **AWS Organizations** (OU / Root) |
| **Quản lý IAM Role** | Tự tạo `AWSCloudFormationStackSetAdministrationRole` và `ExecutionRole` | AWS tự tạo và quản lý IAM Roles |
| **Auto-deployment** | Không hỗ trợ | Tự động deploy vào account mới join OU, tự xóa/giữ khi rời OU |
| **Delegated Admin** | Không | Hỗ trợ chỉ định Member Account làm Delegated Administrator |

### Tối ưu tốc độ & độ an toàn StackSets
- `MaxConcurrentPercentage` / `MaxConcurrentCount`: Số account triển khai song song.
- `FailureTolerancePercentage` / `FailureToleranceCount`: Ngưỡng lỗi tối đa trước khi dừng triển khai.
- `RegionConcurrencyType`: `PARALLEL` (triển khai song song nhiều Region) thay vì `SEQUENTIAL`.

### Nested Stacks vs Cross-Stack References
- **Nested Stacks** (`AWS::CloudFormation::Stack`): Tái sử dụng mẫu kiến trúc phổ biến (VD: chuẩn VPC, ALB) nằm bên trong một Parent Stack. Phù hợp cho vòng đời chung.
- **Cross-Stack References** (`Outputs` + `Export` + `Fn::ImportValue`): Chia tách tầng mạng (Network Stack) và tầng ứng dụng (App Stack) có vòng đời độc lập. **Lưu ý**: Không thể xóa/sửa giá trị `Export` khi còn stack khác đang `ImportValue`.

### Custom Resources & Macros
- **Custom Resources** (`Custom::MyResource`): Gọi **Lambda Function** hoặc **SNS Topic** trong quá trình Create/Update/Delete stack để thực hiện tác vụ CloudFormation chưa hỗ trợ natively (VD: tạo AMI, dọn sạch S3 bucket trước khi xóa stack, gọi API bên thứ ba).
- **CloudFormation Macros**: Biến đổi template trước khi thực thi (VD: tự động chèn tags chuẩn, `AWS::Include`, `AWS::Serverless` SAM).

> **Exam Tip**: Khi câu hỏi yêu cầu CloudFormation đợi quá trình cài đặt phần mềm trên EC2 hoàn tất thành công trước khi đánh dấu stack là `CREATE_COMPLETE` (hoặc kích hoạt rollback nếu cài đặt lỗi), hãy dùng kết hợp **`AWS::CloudFormation::Init` (`cfn-init`)**, **`CreationPolicy` (`ResourceSignal`)** và gọi **`cfn-signal`** từ User Data.

```yaml
Resources:
  WebServer:
    Type: AWS::EC2::Instance
    CreationPolicy:
      ResourceSignal:
        Count: 1
        Timeout: PT10M
    Properties:
      UserData:
        Fn::Base64: !Sub |
          #!/bin/bash -xe
          /opt/aws/bin/cfn-init -v --stack ${AWS::StackName} --resource WebServer --region ${AWS::Region}
          /opt/aws/bin/cfn-signal -e $? --stack ${AWS::StackName} --resource WebServer --region ${AWS::Region}
```

## 2. Xử lý Drift, Change Sets & DeletionPolicy

- **Drift Detection**: Phát hiện thay đổi thủ công ngoài CloudFormation. Để khắc phục (remediate) drift: dùng **Resource Import** (nếu tài nguyên bị xóa khỏi template), chạy **Update Stack** hoặc cập nhật lại template khớp thực tế.
- **Stack Policy**: Bảo vệ tài nguyên nhạy cảm (RDS, DynamoDB) khỏi bị Update/Replace ngoài ý muốn trong quá trình stack update.
- **DeletionPolicy**:
  - `Retain`: Giữ lại tài nguyên khi xóa stack.
  - `Snapshot`: Tạo snapshot cuối cùng cho RDS, EBS, ElastiCache, Redshift trước khi xóa.
- **Change Sets**: Xem trước chính xác tài nguyên nào sẽ bị `Modify` hay `Replacement: True` trước khi thực thi.
- **CloudFormation Guard (`cfn-guard`)**: Công cụ policy-as-code kiểm tra template CloudFormation/Terraform/K8s ngay trong CI pipeline trước khi deploy.

## 3. AWS Cloud Development Kit (CDK)
- Định nghĩa hạ tầng bằng ngôn ngữ lập trình (TypeScript, Python, Java, Go, C#), biên dịch (`cdk synth`) ra CloudFormation template.
- **3 cấp độ Constructs**: L1 (`Cfn*` - 1:1 CloudFormation), L2 (AWS curated defaults + helper methods), L3 (Patterns - kiến trúc hoàn chỉnh như `ApplicationLoadBalancedFargateService`).
- **CDK Pipelines**: Tự động tạo CodePipeline tự cập nhật (self-mutating) hỗ trợ multi-account/multi-region.

## 4. AWS Systems Manager (SSM) & EC2 Image Builder

| Tính năng SSM | Mục đích & Kịch bản thi DOP-C02 |
| :--- | :--- |
| **State Manager** | Duy trì cấu hình mong muốn theo lịch (compliance), tự động chạy SSM Document định kỳ để chống configuration drift trên EC2/On-Prem. |
| **Patch Manager** | Quét và vá lỗi OS tự động theo **Patch Baselines**, **Patch Groups** (dựa trên tag) và **Maintenance Windows**. |
| **Run Command** | Thực thi lệnh/script tức thời trên hàng loạt instance theo tag không cần SSH/Bastion. |
| **Session Manager** | Truy cập shell an toàn qua IAM, không mở port 22, ghi toàn bộ session log vào S3/CloudWatch Logs. |
| **Automation** | Chạy runbook tự động hóa đa bước (tạo AMI, remediate AWS Config, duyệt thay đổi). |
| **Distributor** | Đóng gói và phân phối phần mềm/agent nội bộ có version cho fleet EC2. |
| **Fleet Manager / Inventory** | Thu thập metadata phần mềm, bản vá, network config về tập trung (Resource Data Sync sang S3 để query bằng Athena). |

### EC2 Image Builder (Golden AMI Pipeline)
- Tự động hóa build, hardening, test (kiểm tra bảo mật, cài đặt SSM/CloudWatch Agent) và phân phối **Golden AMI** hoặc **Container Images** theo lịch hoặc khi có OS update mới.
- Phân phối đa Region và đa Account qua **Distribution Settings** (kết hợp AWS Organizations/OU).
- Tích hợp trực tiếp với **SSM Parameter Store** để cập nhật AMI ID mới nhất; Launch Template của Auto Scaling Group tham chiếu `resolve:ssm:/golden-ami/latest` để tự động dùng AMI mới.

> **Exam Tip**: Khi đề bài yêu cầu giảm thời gian khởi động EC2 (boot time) trong Auto Scaling và đảm bảo bản vá bảo mật luôn mới nhất mà không cần chạy script nặng trong User Data, đáp án chuẩn luôn là **EC2 Image Builder** tạo Golden AMI định kỳ + lưu AMI ID vào **SSM Parameter Store**.

---

[← Bài trước](05-cloudformation-deep-dive-stacksets-custom-resources.md) | [Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/05-iac-cdk-sam-serverless.md) | [Bài tiếp →](07-ssm-fleet-automation-image-builder.md)
