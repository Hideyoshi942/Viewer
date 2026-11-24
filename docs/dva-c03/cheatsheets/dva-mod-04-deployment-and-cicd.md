# Tuần 4 – Deployment, IaC và CI/CD

## Mục tiêu

Tự động build, test và triển khai ứng dụng qua nhiều môi trường, có rollback.

## Infrastructure as Code

- CloudFormation stack, template, parameter, output.
- Change set, rollback và drift detection.
- SAM transform, build, local test và deploy.
- CDK synthesize thành CloudFormation.
- Dependency, artifact và environment-specific configuration.

## CI/CD

- CodeBuild project, buildspec và artifact.
- CodePipeline stages và approvals.
- CodeDeploy deployment group và lifecycle hooks.
- Lambda version và alias.
- Canary, linear, rolling và blue/green.
- CloudWatch alarm kích hoạt rollback.
- API Gateway stages.
- AppConfig feature flags và validators.
- Elastic Beanstalk deployment policies.
- ECR/ECS image tag và task definition ở mức chọn giải pháp.

## Lab chính

Xây pipeline:

```text
Source → Unit Test → Build → Deploy Dev → Integration Test
       → Manual Approval → Canary Production → Verify/Rollback
```

Yêu cầu:

- Hạ tầng được mô tả bằng SAM/CloudFormation.
- Dev và production dùng cấu hình riêng.
- Alias production trỏ vào version cụ thể.
- Canary deployment có pre/post traffic hook.
- Alarm lỗi kích hoạt rollback tự động.

## Negative tests

- Làm unit test thất bại.
- Tạo template sai cú pháp hoặc dependency vòng.
- Làm integration test dev thất bại.
- Tăng error rate trong canary.
- Deploy configuration không qua validator.
- Kiểm tra stack rollback và log của từng stage.

## Điều kiện hoàn thành

- Một commit có thể đi qua pipeline mà không thao tác deploy thủ công.
- Phân biệt được version, alias và environment variable.
- Chọn đúng deployment strategy theo yêu cầu downtime/risk/speed.
- Đạt ≥70% mixed quiz bốn domain đã học.

---

[← Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md)
