# Cheatsheet: CloudFormation Nâng cao, CDK, SSM & Auto Scaling DR

## 1. CloudFormation Decision Matrix
| Nhu cầu trong câu hỏi | Tính năng CloudFormation chính xác |
| :--- | :--- |
| Triển khai đồng bộ vào hàng trăm account/OU + tự deploy khi có account mới | **StackSets (Service-Managed Permissions)** với `AutoDeployment` |
| Giảm thời gian deploy StackSet nhiều Region | Đặt `RegionConcurrencyType: PARALLEL` + tăng `MaxConcurrentPercentage` |
| Chia tách Network Stack & App Stack có vòng đời độc lập | **Cross-Stack Reference** (`Export` + `Fn::ImportValue`) |
| Tái sử dụng template con trong cùng một vòng đời stack | **Nested Stacks** (`AWS::CloudFormation::Stack`) |
| Đợi EC2 cài đặt hoàn tất mới báo `CREATE_COMPLETE` | `cfn-init` + `CreationPolicy (ResourceSignal)` + `cfn-signal` |
| Xử lý tài nguyên không có sẵn trong CFN (VD: dọn S3 bucket trước khi xóa) | **Custom Resource** (`Custom::*` gọi AWS Lambda) |
| Ngăn xóa/replace RDS khi chạy Stack Update | **Stack Policy** (chặn Update) + **`DeletionPolicy: Retain/Snapshot`** |
| Đưa tài nguyên tạo thủ công vào quản lý bởi CFN | **Resource Import** (bắt buộc khai báo `DeletionPolicy` cho tài nguyên import) |
| Kiểm tra tuân thủ template trước khi deploy trong CI | **CloudFormation Guard (`cfn-guard`)** hoặc **CloudFormation Hooks** |

## 2. Systems Manager (SSM) Quick Lookup
- **State Manager**: Chạy định kỳ để duy trì cấu hình chuẩn (anti-drift).
- **Patch Manager**: Vá OS tự động theo **Patch Baselines** + **Patch Groups (Tags)** + **Maintenance Windows**.
- **Run Command**: Thực thi script tức thời trên fleet EC2 qua tag (không cần SSH).
- **Session Manager**: Thay thế Bastion Host/SSH, quản quyền bằng IAM, lưu session log vào S3/CW Logs.
- **Automation**: Chạy runbook đa bước (tạo AMI, Auto-Remediation cho AWS Config, thay thế instance).
- **Distributor**: Đóng gói & cài đặt agent/package nội bộ có phiên bản.
- **EC2 Image Builder**: Pipeline tạo **Golden AMI** định kỳ, quét test và phân phối multi-account/multi-region, cập nhật AMI ID vào SSM Parameter Store.

## 3. Auto Scaling, HA & Multi-Region DR Cheat Table
| Kịch bản | Giải pháp tối ưu |
| :--- | :--- |
| Ứng dụng boot mất 10 phút, traffic tăng đột ngột không dự đoán trước | **ASG Warm Pools** (`Stopped` / `Hibernated`) |
| Traffic tăng theo chu kỳ lặp lại hàng ngày/tuần | **ASG Predictive Scaling** |
| Cần upload log / drain job trước khi ASG terminate EC2 | **ASG Lifecycle Hook (`EC2_INSTANCE_TERMINATING`)** + EventBridge + Lambda/SSM + `CompleteLifecycleAction` |
| Rolling update Golden AMI cho toàn bộ ASG có kiểm tra sức khỏe | **ASG Instance Refresh** (`MinHealthyPercentage`, `Checkpoint`) |
| Failover Multi-Region < 30 giây, không bị dính DNS TTL cache | **AWS Global Accelerator** |
| Failover Multi-Region tin cậy tránh phụ thuộc Control Plane | **Route 53 Application Recovery Controller (ARC)** Routing Control |
| Chống ransomware xóa backup ở Production Account | **AWS Backup** Cross-Account Copy + **Vault Lock (Compliance Mode)** |
| Kiểm thử chịu lỗi thực tế trên hệ thống (GameDay / CI) | **AWS Fault Injection Service (FIS)** + CloudWatch Alarm **Stop Condition** |

---

[Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md)
