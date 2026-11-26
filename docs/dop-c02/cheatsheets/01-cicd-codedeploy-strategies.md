# Cheatsheet: CI/CD Đa tài khoản, CodeBuild & CodeDeploy Strategies

## 1. Checklist Cross-Account CodePipeline (Cực kỳ hay thi!)
| Thành phần | Tài khoản đặt | Yêu cầu bắt buộc |
| :--- | :--- | :--- |
| **Artifact S3 Bucket** | Tools Account | Bucket Policy cho phép Target Account Role (`s3:GetObject*`, `s3:PutObject`, `s3:ListBucket`) |
| **KMS Key** | Tools Account | **BẮT BUỘC Customer Managed Key (CMK)**; Key Policy cấp `kms:Decrypt`, `kms:GenerateDataKey*` cho Target Account Role |
| **Pipeline Service Role** | Tools Account | Có quyền `sts:AssumeRole` tới Cross-Account Deploy Role |
| **Cross-Account Deploy Role** | Target Account | Trust Policy tin tưởng Tools Account + quyền deploy (CFN/CodeDeploy/ECS) + quyền đọc S3 & KMS ở Tools Account |

## 2. Thứ tự Lifecycle Hooks trong `appspec.yml`
- **EC2 / On-Prem (In-Place)**:
  `ApplicationStop` → `DownloadBundle` → `BeforeInstall` → `Install` → `AfterInstall` → `ApplicationStart` → `ValidateService`
- **EC2 / On-Prem (Blue/Green)**:
  Tạo Fleet mới (Green) → `BeforeInstall` → `Install` → `AfterInstall` → `ApplicationStart` → `ValidateService` → `BeforeBlockTraffic` → `BlockTraffic` → `AfterBlockTraffic` → `BeforeAllowTraffic` → `AllowTraffic` → `AfterAllowTraffic`
- **Amazon ECS (Blue/Green)**:
  `BeforeInstall` → `AfterInstall` → `AfterAllowTestTraffic` → `BeforeAllowTraffic` → `AfterAllowTraffic`
- **AWS Lambda (Canary / Linear / AllAtOnce)**:
  `BeforeAllowTraffic` → *(Shifting Alias Traffic)* → `AfterAllowTraffic`

> **Exam Tip**: Với ECS và Lambda hooks, Lambda validation function **phải gọi** `codedeploy:PutLifecycleEventHookExecutionStatus` (`Succeeded` hoặc `Failed`), nếu không deployment sẽ timeout và tự rollback.

## 3. So sánh nhanh Chiến lược Triển khai (Deployment Strategies)
| Chiến lược | Downtime | Rollback Speed | Chi phí thêm | Khi nào chọn? |
| :--- | :--- | :--- | :--- | :--- |
| **In-Place (AllAtOnce / HalfAtATime / OneAtATime)** | Có thể (AllAtOnce) hoặc Không | Chậm (phải re-deploy bản cũ) | Không | Dev/Test, tiết kiệm chi phí |
| **Blue/Green** | Zero | Tức thì (chuyển lại ALB/Route 53) | Cao tạm thời (2x fleet) | Production cần rollback nhanh nhất |
| **Canary (VD: 10% trong 5 phút → 100%)** | Zero | Tức thì | Thấp | Kiểm chứng bản mới với một phần nhỏ user thật |
| **Linear (VD: tăng 10% mỗi 1 phút)** | Zero | Tức thì | Thấp | Tăng tải từ từ để kiểm tra khả năng chịu tải |
| **AWS AppConfig** | Zero | Tự động qua CW Alarm | Rất thấp | Deploy **Feature Flags / Config** tách biệt khỏi code |

## 4. Tối ưu hóa CodeBuild & Artifact
- **Build chậm do tải Docker/npm**: Bật `LOCAL_DOCKER_LAYER_CACHE` (cần bật `privilegedMode: true`), `LOCAL_CUSTOM_CACHE`, hoặc dùng **CodeArtifact** qua VPC Interface Endpoint.
- **Lộ mật khẩu trong build log**: Không hardcode trong `env.variables`; dùng `env.secrets-manager` hoặc `env.parameter-store`.
- **Chạy test song song**: Dùng CodeBuild **Batch Builds** (`build-matrix` / `build-fanout`).
- **Tái sử dụng pipeline cho nhiều branch/tag**: Dùng **CodePipeline V2** với Git trigger filters + Pipeline Variables.

---

[Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md)
