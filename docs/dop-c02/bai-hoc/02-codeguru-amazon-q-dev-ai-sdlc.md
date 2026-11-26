# Bài 12: AI trong SDLC & DevSecOps — Amazon CodeGuru, Amazon Q Developer & CodeCatalyst

Trong kỳ thi **AWS Certified DevOps Engineer - Professional (DOP-C02)**, chủ đề **DevSecOps** và **tự động hóa chất lượng mã nguồn (SDLC Automation)** đóng vai trò then chốt. Bên cạnh các công cụ truyền thống như AWS CodePipeline hay AWS Inspector, AWS cung cấp hệ sinh thái AI/ML và nền tảng hợp tác hiện đại gồm **Amazon CodeGuru (Reviewer & Profiler)**, **Amazon Q Developer**, và **Amazon CodeCatalyst** nhằm phát hiện lỗ hổng bảo mật sớm (Shift-Left Security), tối ưu hiệu năng ứng dụng trên production và tăng tốc chu kỳ phát triển phần mềm.

---

## 1. Amazon CodeGuru: Reviewer vs. Profiler

**Amazon CodeGuru** gồm hai dịch vụ tách biệt hoàn toàn về mục đích và giai đoạn trong vòng đời phần mềm (SDLC):

| Tiêu chí | Amazon CodeGuru Reviewer | Amazon CodeGuru Profiler |
| :--- | :--- | :--- |
| **Giai đoạn SDLC** | **Code & Build** (Static Analysis trên Pull Request / Repository) | **Runtime / Production** (Dynamic Profiling trên ứng dụng đang chạy) |
| **Ngôn ngữ hỗ trợ** | Java, Python (và secrets detection cho nhiều ngôn ngữ/config) | Java / JVM (Scala, Kotlin) và Python |
| **Mục tiêu chính** | Phát hiện bug logic, concurrency issues, AWS API best practices, **hardcoded secrets** | Tìm **CPU bottlenecks**, **memory leaks**, latency spikes, tối ưu chi phí compute |
| **Cơ chế hoạt động** | Quét mã nguồn tự động khi có Pull Request hoặc full repository scan | Cài đặt lightweight **Profiler Agent** vào ứng dụng (EC2, ECS, EKS, Lambda) |
| **Output** | Comment trực tiếp lên Pull Request + Security findings trong **CodeGuru Security** | **Flame Graphs** trực quan + khuyến nghị tối ưu hóa dòng code tốn CPU nhất |

### 1.1. Amazon CodeGuru Reviewer & CodeGuru Security
- **Tích hợp Repository**: Hỗ trợ **AWS CodeCommit**, **GitHub**, **GitHub Enterprise**, và **Bitbucket**.
- **Secrets Detector**: Tự động phát hiện API keys, AWS access keys, database passwords bị hardcode trong source code hoặc file cấu hình trước khi code được merge.
- **AWS Best Practices**: Phát hiện các lỗi phổ biến như quên phân trang (missing pagination) khi gọi AWS SDK, race conditions, resource leaks (không đóng stream/connection), và lỗ hổng OWASP Top 10 (SQL Injection, XSS, Path Traversal).
- **CodeGuru Security**: Cung cấp SAST (Static Application Security Testing) tích hợp trực tiếp vào **AWS CodePipeline**, **GitHub Actions**, hoặc **Amazon SageMaker Studio** để đánh giá bảo mật tự động trong CI/CD.

### 1.2. Amazon CodeGuru Profiler
- Hoạt động ở môi trường **Production** hoặc **Staging** với chi phí CPU overhead cực thấp (~1% CPU).
- Thu thập dữ liệu stack trace theo thời gian thực để dựng **Flame Graph** (biểu đồ ngọn lửa), chỉ ra chính xác method/hàm nào đang chiếm nhiều CPU time hoặc gây garbage collection quá mức.
- **Tích hợp AWS Lambda**: Chỉ cần bật toggle hoặc thêm Lambda Layer/agent để profile hiệu năng hàm Lambda mà không cần sửa logic nghiệp vụ.
- **Tính năng ước tính chi phí**: CodeGuru Profiler tính toán số tiền ($) ước tính có thể tiết kiệm được nếu khắc phục các điểm nghẽn (ví dụ: giảm thời gian chạy trên EC2/Fargate/Lambda).

> **Exam Tip**: Nếu đề bài hỏi làm sao **phát hiện mật khẩu/API key bị lộ hoặc lỗi concurrency trong Pull Request** → chọn **Amazon CodeGuru Reviewer**. Nếu đề bài hỏi làm sao **tìm hàm gây tốn CPU, tăng latency hoặc memory leak trên ứng dụng Java/Python đang chạy ở Production với overhead tối thiểu** → chọn **Amazon CodeGuru Profiler**.

---

## 2. Amazon Q Developer trong SDLC & DevSecOps

**Amazon Q Developer** (tiền thân mở rộng từ Amazon CodeWhisperer) là trợ lý AI tạo sinh dành cho lập trình viên và kỹ sư DevOps, tích hợp sâu vào IDE, CLI và AWS Management Console.

### 2.1. Các tính năng trọng tâm cho DevSecOps
1. **IDE Security Scans (Shift-Left Security)**:
   - Quét mã nguồn ngay trên IDE (VS Code, JetBrains) hoặc trong CI/CD để phát hiện lỗ hổng bảo mật (SAST) và gợi ý **code fix tự động** (auto-remediation).
   - Hỗ trợ quét Infrastructure as Code (IaC) như CloudFormation, Terraform, AWS CDK để phát hiện cấu hình sai (ví dụ: S3 bucket public, Security Group mở `0.0.0.0/0`).
2. **Code Transformation (Nâng cấp & Hiện đại hóa tự động)**:
   - Tự động nâng cấp ứng dụng Java (ví dụ: từ **Java 8 / Java 11 lên Java 17 / Java 21**) hoặc chuyển đổi .NET Framework từ Windows sang cross-platform .NET trên Linux.
   - Tự động cập nhật dependencies, sửa deprecated APIs, chạy unit tests và tạo Pull Request hoàn chỉnh.
3. **Reference Tracker (Kiểm soát bản quyền mã nguồn mở)**:
   - Phát hiện đoạn code do AI gợi ý có giống với mã nguồn mở (open-source) hay không, hiển thị loại giấy phép (MIT, Apache 2.0, GPL...) và cho phép **chặn code gợi ý trùng lặp** để tuân thủ chính sách pháp lý của doanh nghiệp.
4. **Amazon Q Developer CLI & Console Troubleshooting**:
   - Hỗ trợ dịch ngôn ngữ tự nhiên sang lệnh AWS CLI / Bash.
   - Phân tích lỗi trong AWS Console (ví dụ: lỗi VPC Reachability, IAM Access Denied, ECS task failed to start) và đề xuất hướng khắc phục.

> **Exam Tip**: Khi đề bài yêu cầu **ngăn chặn developer vô tình đưa code có giấy phép GPL/copyleft vào dự án thương mại khi dùng AI coding assistant**, tính năng cần bật là **Reference Tracker** trong Amazon Q Developer (kết hợp chính sách ở cấp AWS IAM Identity Center / Admin Console).

---

## 3. Amazon CodeCatalyst

**Amazon CodeCatalyst** là dịch vụ **unified software development service** (hợp nhất toàn bộ chu trình lập kế hoạch, lưu trữ code, môi trường dev, và CI/CD) nhằm loại bỏ gánh nặng tự lắp ghép nhiều công cụ rời rạc.

### 3.1. Các thành phần cốt lõi của CodeCatalyst
- **Blueprints**: Các mẫu dự án chuẩn hóa (templates) chứa sẵn source code, kiến trúc AWS (CDK/SAM/CloudFormation), và CI/CD workflows. Giúp các team khởi tạo dự án mới tuân thủ chuẩn bảo mật và kiến trúc của tổ chức chỉ trong vài phút.
- **Dev Environments (Cloud-based IDE)**: Môi trường phát triển trên đám mây (hỗ trợ VS Code, JetBrains, AWS Cloud9) chạy trên EC2 chuyên dụng, có sẵn dependencies và quyền truy cập bảo mật, giúp developer mới onboard ngay lập tức mà không phải cài đặt máy local.
- **Workflows (CI/CD)**: Định nghĩa bằng YAML (tương tự GitHub Actions), hỗ trợ:
  - Chạy build/test trên **Managed Compute** (AWS quản lý) hoặc **Self-hosted runners**.
  - Deploy trực tiếp lên nhiều AWS Accounts thông qua tích hợp **AWS IAM Roles** (không cần lưu AWS Access Key tĩnh).
- **Quản lý linh hoạt**: Hỗ trợ tích hợp với GitHub repositories và Jira issues nếu doanh nghiệp không muốn chuyển toàn bộ sang CodeCatalyst.

```yaml
# Ví dụ cấu trúc cơ bản của Amazon CodeCatalyst Workflow (.codecatalyst/workflows/ci-cd.yaml)
Name: BuildAndDeployApp
SchemaVersion: "1.0"
Triggers:
  - Type: PUSH
    Branches:
      - main
Actions:
  BuildAndTest:
    Identifier: aws/build@v1
    Inputs:
      Sources:
        - WorkflowSource
    Configuration:
      Steps:
        - Run: npm ci && npm test
  SecurityScan:
    Identifier: aws/codeguru-security@v1
    DependsOn:
      - BuildAndTest
  DeployToStaging:
    Identifier: aws/cfn-deploy@v1
    DependsOn:
      - SecurityScan
    Environment:
      Name: Staging
      Connections:
        - Role: CodeCatalystDeployRole
          AccountId: "111122223333"
```

---

## 4. Tích hợp SAST / DAST vào AWS CodePipeline

Trong mô hình **DevSecOps Pipeline** chuẩn cho kỳ thi DOP-C02, việc kiểm tra bảo mật phải được tự động hóa ở nhiều tầng (Defense in Depth):

| Loại kiểm tra | Thời điểm chạy | Công cụ AWS & Bên thứ ba phổ biến | Hành động khi phát hiện lỗi |
| :--- | :--- | :--- | :--- |
| **Pre-commit / IDE** | Trước khi push code | **Amazon Q Developer**, `git-secrets`, `cfn-lint` | Cảnh báo developer ngay trên máy local |
| **SAST & IaC Scan** | Giai đoạn **Build / Test** trong CodeBuild | **CodeGuru Reviewer/Security**, `cfn_nag`, `Checkov`, SonarQube | Fail pipeline nếu có lỗ hổng `CRITICAL`/`HIGH` |
| **Container & Artifact Scan** | Sau khi build Docker image | **Amazon Inspector** (quét ECR image theo CVE), ECR Enhanced Scanning | Chặn deploy image chứa CVE nghiêm trọng |
| **DAST (Dynamic Scan)** | Sau khi deploy lên **Staging/Test** | OWASP ZAP, Burp Suite chạy từ **CodeBuild** hoặc **Step Functions** | Chặn promotion lên Production |
| **Runtime & Compliance** | Liên tục trên **Production** | **AWS Security Hub** (tổng hợp findings), **Inspector**, **CodeGuru Profiler** | Gửi alert qua EventBridge → SNS / Slack / Jira |

### Mô hình Pipeline chuẩn:
1. **Source**: CodeCommit / GitHub (kích hoạt qua EventBridge hoặc Webhook).
2. **Build & SAST**: CodeBuild chạy Unit Test + SAST (`CodeGuru Security` / `cfn_nag`). Kết quả có thể xuất ra định dạng SARIF/ASFF đẩy về **AWS Security Hub**.
3. **Artifact Scan**: Push Docker image lên **Amazon ECR** (bật Enhanced Scanning với **Amazon Inspector**). Dùng EventBridge bắt sự kiện Inspector tìm thấy `CRITICAL` vulnerability để block bước tiếp theo hoặc cảnh báo.
4. **Deploy Staging & DAST**: Deploy lên môi trường Staging; CodeBuild chạy DAST (OWASP ZAP) kiểm tra endpoint thực tế.
5. **Manual Approval / Automated Gate & Deploy Production**: Sử dụng **Manual Approval** (kèm SNS notification) hoặc Lambda kiểm tra Security Hub findings trước khi deploy Production qua CodeDeploy (Blue/Green hoặc Canary).

> **Exam Tip**: Trong CodePipeline, khi cần **chặn quá trình deploy** nếu phát hiện lỗ hổng bảo mật ở bước build hoặc staging, hãy chạy công cụ scan trong **AWS CodeBuild** (hoặc **CodeGuru Security Action**) và trả về **non-zero exit code** để đánh dấu stage là `FAILED`. Nếu muốn quản lý tập trung toàn bộ cảnh báo từ CodeGuru, Inspector, GuardDuty, Config → tích hợp tất cả vào **AWS Security Hub**.

---

[← Bài trước](01-sdlc-cicd-deployment-strategies.md) | [Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/01-sdlc-cicd-pipelines.md) | [Bài tiếp →](03-advanced-cicd-cross-account-ecs-lambda.md)
