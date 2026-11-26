# Multi-Account IaC & CI/CD Automation — CloudFormation StackSets, CDK, CodePipeline Cross-Account & Deployment Strategies

Trong môi trường doanh nghiệp nhiều tài khoản (Dev, Staging, Prod, Shared Services), việc triển khai hạ tầng và ứng dụng thủ công là không khả thi. Đề thi SAP-C02 kiểm tra rất sâu về tự động hóa đa tài khoản và chiến lược rollback an toàn.

---

## 1. AWS CloudFormation StackSets (Service-Managed vs Self-Managed)

**StackSets** cho phép triển khai một template CloudFormation tới **nhiều AWS Accounts và nhiều Regions** chỉ bằng một thao tác:

| Mô hình Permission | Đặc điểm & Khi nào chọn |
| :--- | :--- |
| **Service-Managed** | Tích hợp trực tiếp với **AWS Organizations**. Tự động triển khai (`AutoDeployment`) khi có tài khoản mới gia nhập OU và tự động xóa khi tài khoản rời OU. **Khuyến nghị mặc định cho SAP-C02**. |
| **Self-Managed** | Tự tạo IAM Roles (`AWSCloudFormationStackSetAdministrationRole` & `ExecutionRole`) bằng tay. Dùng khi các tài khoản **không nằm trong cùng AWS Organizations**. |

### Tối ưu hiệu năng & an toàn khi chạy StackSets
- **Deployment Targets**: Nhắm tới cả **OU** hoặc **Organizational Root**, có thể loại trừ (exclude) tài khoản cụ thể.
- **MaxConcurrentAccounts / FailureToleranceCount**: Kiểm soát tốc độ rollout theo kiểu Canary (VD: deploy 10% trước, dừng ngay nếu có 1 tài khoản lỗi).
- **Nested Stacks vs Cross-Stack References (`Export`/`ImportValue`)**: Dùng `Export`/`ImportValue` để chia sẻ tài nguyên trong cùng Account + Region; dùng **SSM Parameter Store** hoặc **CloudFormation Outputs** khi cần linh hoạt hơn để tránh khóa cứng dependency.

---

## 2. Cross-Account CI/CD Pipeline (CodePipeline + CodeBuild + CodeDeploy)

Mô hình chuẩn để triển khai ứng dụng từ tài khoản **Shared Tools / CI-CD Account** sang **Dev / Prod Accounts**:
1. **Artifact Bucket (S3)** đặt tại Shared Tools Account, mã hóa bằng **Customer Managed Key (CMK) trên KMS** (không dùng `aws/s3` default key vì không share được cross-account!).
2. **S3 Bucket Policy** và **KMS Key Policy** cấp quyền đọc/giải mã cho **Prod Account**.
3. **CodePipeline Cross-Account Action** thực hiện `sts:AssumeRole` vào `DeployRole` nằm trong Prod Account để chạy CloudFormation hoặc CodeDeploy.

```yaml
# Cấu hình Cross-Account Role Assumption trong CodePipeline Stage
- Name: DeployToProd
  Actions:
    - Name: DeployCFN
      ActionTypeId:
        Category: Deploy
        Owner: AWS
        Provider: CloudFormation
        Version: "1"
      RoleArn: "arn:aws:iam::222233334444:role/CrossAccountDeployRole"
      Configuration:
        ActionMode: CREATE_UPDATE
        StackName: prod-app-stack
        TemplatePath: BuildArtifact::packaged.yaml
```

---

## 3. Chiến lược Triển khai An toàn (Deployment Strategies)

| Chiến lược | Dịch vụ hỗ trợ | Ưu / Nhược điểm & Khi nào chọn |
| :--- | :--- | :--- |
| **All-at-Once** | CodeDeploy / Elastic Beanstalk | Nhanh nhất nhưng có **downtime**, chỉ dùng cho Dev/Test. |
| **Rolling / Rolling with Additional Batch** | Elastic Beanstalk / ASG Instance Refresh | Không downtime, tiết kiệm chi phí hơn Blue/Green, nhưng rollback chậm hơn. |
| **Blue/Green** | CodeDeploy (EC2/ECS/Lambda), RDS Blue/Green Deployments | Zero-downtime, test môi trường mới trước khi switch traffic, **rollback tức thì**, tốn gấp đôi hạ tầng tạm thời. |
| **Canary / Linear** | CodeDeploy (Lambda/ECS), Route 53 Weighted | Chuyển 10% traffic trước, theo dõi **CloudWatch Alarms** -> tự động rollback nếu lỗi (VD: `CodeDeployDefault.LambdaCanary10Percent5Minutes`). |

> [!TIP]
> **Exam Tip (SAP-C02)**:
> - Cross-account CodePipeline báo lỗi **Access Denied khi đọc artifact từ S3** -> Kiểm tra xem S3 Bucket có đang dùng **AWS Managed Key (`aws/s3`)** thay vì **Customer Managed Key (CMK)** hay không!
> - Cần tự động áp dụng baseline security/networking mỗi khi tạo tài khoản mới trong OU -> **CloudFormation StackSets (Service-Managed)** với `AutoDeployment = true`.

---

[← Bài trước](07-enterprise-security-iac-cicd.md) | [Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/08-iac-cicd-automation.md) | [Bài tiếp →](09-global-databases-aurora-dynamodb-caching.md)
