# Chương 35.0 – Tổng quan thay đổi từ DVA-C02 sang DVA-C03 & Bản đồ bổ sung kiến thức

> **Mục đích thư mục này:** Toàn bộ 33 chương trong thư mục gốc (`01` → `34`) và file tổng hợp `AWS-DVA-C02-Tai-lieu-on-thi-he-thong.md` đã bao phủ **~80–85% kiến thức nền tảng** của kỳ thi mới (Lambda, API Gateway, DynamoDB, S3, IAM, KMS, Cognito, CloudFormation/SAM/CDK, CI/CD, CloudWatch, X-Ray...).
> Tuy nhiên, **DVA-C02 chính thức ngừng thi sau ngày 30/11/2026** và từ **01/12/2026 chỉ còn đề DVA-C03**. Thư mục `35 - Bo sung DVA-C03 (Cap nhat moi)` này tách riêng **100% các phần kiến thức mới, task mới, dịch vụ mới và trọng tâm mới của DVA-C03** để bạn học nối tiếp mà không phải đọc lại từ đầu.

---

## 1. Bảng so sánh tổng quan DVA-C02 vs DVA-C03

| Tiêu chí | DVA-C02 (Cũ – hết hạn 30/11/2026) | DVA-C03 (Mới – áp dụng từ 01/12/2026) | Ý nghĩa với người ôn thi |
|---|---|---|---|
| **Số câu hỏi** | 65 câu (50 câu tính điểm + 15 câu thử nghiệm) | **65 câu** (50 câu tính điểm + 15 câu thử nghiệm) | Không đổi |
| **Thời gian làm bài** | 130 phút (+30 phút ESL = 160 phút) | **130 phút** (+30 phút ESL = 160 phút) | Không đổi (nhớ xin ESL trước khi đặt lịch) |
| **Điểm đỗ / Thang điểm** | 720 / 1000 | **720 / 1000** | Không đổi, không trừ điểm câu sai |
| **Dạng câu hỏi** | Multiple choice & Multiple response | **Multiple choice & Multiple response** | Không đổi |
| **Domain 1: Development with AWS Services** | 32% | **30%** (-2%) | Bổ sung tích hợp **Amazon Bedrock**, **Bedrock AgentCore**, **AI-assisted development (Amazon Q, Kiro)** |
| **Domain 2: Security** | 26% | **26%** (Giữ nguyên tỷ trọng) | Thêm hẳn **Task 2.3 mới tinh về Bảo mật AI (AI Security, Guardrails, Agent Security, Data Privacy)** |
| **Domain 3: Testing and Deployment** *(đổi tên từ Deployment)* | 24% | **22%** (-2%) | Đổi tên để nhấn mạnh **Testing** (kiểm thử tự động, dùng AI sinh test) và **Container workflows (ECR, ECS, EKS, Fargate)** |
| **Domain 4: Troubleshooting and Optimization** | 18% | **22%** (**+4%**) | Tăng mạnh nhất (+4% ≈ thêm 2–3 câu); nhấn mạnh debug bằng CloudWatch, X-Ray/OpenTelemetry, Application Signals và dùng AI hỗ trợ debug |

---

## 2. Chi tiết các thay đổi trong từng Domain của DVA-C03

### 2.1. Domain 1 – Development with AWS Services (30%)
- **Giữ nguyên từ DVA-C02:** Lambda, API Gateway, DynamoDB, S3, SQS, SNS, EventBridge, Kinesis, Step Functions, ElastiCache, AWS SDK/CLI.
- **Bổ sung mới trong DVA-C03:**
  1. **Sử dụng công cụ AI hỗ trợ lập trình (AI-assisted development tools):** Dùng **Amazon Q Developer** và **Kiro** để sinh code từ đặc tả (spec-driven code generation), gợi ý code, refactor, review code tự động và quét lỗ hổng bảo mật.
  2. **Tích hợp dịch vụ AI managed vào ứng dụng:** Gọi **Amazon Bedrock** qua AWS SDK (`InvokeModel`, `InvokeModelWithResponseStream`, `Converse` API), xử lý streaming response, quản lý retry/throttling khi gọi Foundation Model (FM).
  3. **Xây dựng tác tử AI (AI Agents) với Amazon Bedrock AgentCore:** Hiểu cách kết nối Agent với Lambda (Action Groups), quản lý phiên (session), bộ nhớ (memory) và gọi công cụ qua Model Context Protocol (MCP).

### 2.2. Domain 2 – Security (26%)
- **Giữ nguyên từ DVA-C02:** IAM, STS, Cognito (User Pools, Identity Pools), KMS, Secrets Manager, SSM Parameter Store, S3 Security, Presigned URLs (nhấn mạnh hơn cả S3 lẫn CloudFront).
- **Bổ sung mới hoàn toàn – Task Statement 2.3:** *"Identify and mitigate security risks associated with using and integrating AI services into application development"* (Nhận diện và giảm thiểu rủi ro bảo mật khi sử dụng và tích hợp dịch vụ AI vào phát triển ứng dụng):
  1. **Quản lý quyền truy cập dịch vụ AI:** Phân quyền IAM least-privilege cho Bedrock models, Guardrails, Agents.
  2. **Kiểm soát quyền riêng tư dữ liệu (Data Privacy Controls):** Đảm bảo dữ liệu đầu vào/đầu ra không bị dùng để huấn luyện lại model; truyền dữ liệu qua mạng riêng bằng **VPC Endpoints (AWS PrivateLink)** cho Bedrock và Amazon Q.
  3. **Lọc đầu vào và đầu ra của model (Input/Output Filtering):** Dùng **Amazon Bedrock Guardrails** để chặn nội dung độc hại, chủ đề bị cấm (denied topics), phát hiện và che giấu **PII/PHI (thông tin cá nhân/y tế nhạy cảm)**, chống **Prompt Injection / Jailbreak**.
  4. **Bảo mật tương tác của AI Agent (Securing AI Agent Interactions):** Phân quyền gọi công cụ (**tool-use authorization**), cô lập phiên giữa các người dùng (**session isolation**), và quy trình phê duyệt có con người (**human-in-the-loop approval / return of control**) trước khi thực hiện hành động nhạy cảm.
  5. **Bảo vệ dữ liệu nhạy cảm trong log giám sát:** Che giấu (masking/redaction) dữ liệu nhạy cảm trong CloudWatch Logs và Bedrock Model Invocation Logs.

### 2.3. Domain 3 – Testing and Deployment (22%)
- **Đổi tên từ "Deployment" sang "Testing and Deployment"**:
  1. **Task 3.1 (Package and deploy application code):** Nhấn mạnh hơn quy trình đóng gói container với **Dockerfile, Amazon ECR** (image tagging, immutable tags, lifecycle policies, vulnerability scanning).
  2. **Task 3.2 (Test applications and automate testing workflows):** Viết unit test, integration test, mock dịch vụ AWS, dùng SAM CLI test local, và **sử dụng công cụ AI (Amazon Q Developer, Kiro) để tự động sinh test case, phân tích kết quả test, kiểm thử hồi quy (regression testing) và đảm bảo độ phủ code (test coverage)**.
  3. **Task 3.3 (Deploy code by using AWS CI/CD services):** CodePipeline, CodeBuild, CodeDeploy, triển khai container lên **ECS/EKS/Fargate**, chiến lược rolling, canary, blue/green. Lưu ý: giảm sự phụ thuộc vào CodeCommit (đã ngừng nhận khách hàng mới), ưu tiên kết nối Git qua **AWS CodeConnections**.
  4. **Task 3.4 (Manage IaC):** CloudFormation, AWS SAM, AWS CDK.

### 2.4. Domain 4 – Troubleshooting and Optimization (22%)
- **Tăng tỷ trọng từ 18% lên 22%:**
  - Phân tích lỗi thực thi, timeout, permission, throttling trên Lambda, API Gateway, DynamoDB, ECS.
  - Truy vết phân tán với **AWS X-Ray**, **CloudWatch Application Signals**, **OpenTelemetry (ADOT)**.
  - Sử dụng **Amazon Q Developer** để chẩn đoán lỗi trong code, phân tích log trên CloudWatch và gợi ý tối ưu hiệu năng.
  - Tối ưu chi phí và hiệu năng cho Lambda (memory/CPU, Provisioned Concurrency, SnapStart), DynamoDB (RCU/WCU, GSI, DAX, S3 cho object lớn), API Gateway (caching), S3/CloudFront.

---

## 3. Danh mục dịch vụ In-Scope mới & Out-of-Scope trong DVA-C03

### 3.1. Dịch vụ được THÊM MỚI vào danh sách In-Scope (Appendix DVA-C03)

| Nhóm dịch vụ | Dịch vụ mới trong DVA-C03 | Mức độ hỏi trong đề |
|---|---|---|
| **Machine Learning & AI** | **Amazon Bedrock** (bao gồm Bedrock Guardrails) | **Trọng tâm mới** (Domain 1 & Domain 2) |
| **Machine Learning & AI** | **Amazon Bedrock AgentCore** | **Trọng tâm mới** (Domain 1 & Domain 2) |
| **Machine Learning & AI** | **Amazon Q** (đặc biệt là **Amazon Q Developer**) | **Trọng tâm mới** (Domain 1, 2, 3, 4) |
| **Machine Learning & AI** | **Kiro** (AI IDE phát triển theo hướng đặc tả - Spec-driven) | **Mới** (Domain 1 & Domain 3) |

### 3.2. Dịch vụ đã ngừng nhận khách hàng mới / giảm trọng tâm (So với khóa học DVA-C02)

| Dịch vụ trong khóa cũ | Trạng thái trong DVA-C03 | Thay thế bằng gì trong đề mới? |
|---|---|---|
| **AWS CodeCommit** | Đã ngừng nhận khách mới (từ 07/2024) | Kết nối GitHub/GitLab/Bitbucket qua **AWS CodeConnections** |
| **AWS Cloud9** | Đã ngừng nhận khách mới (từ 07/2024) | **AWS CloudShell**, IDE local tích hợp **Amazon Q Developer** hoặc **Kiro** |
| **Amazon CodeGuru Reviewer** | Ngừng liên kết repo mới (cuối 2025) | **Amazon Q Developer (`/review`, security scan)** & **Amazon Inspector** |
| **AWS Copilot CLI** | Ngừng phát triển tính năng mới (từ 2025) | **AWS CDK**, **CloudFormation**, **ECS CLI / Console** |
| **Amazon Cognito Sync** | Đã lỗi thời từ lâu | **AWS AppSync** |

### 3.3. Ranh giới cực kỳ quan trọng: Cái gì của AI KHÔNG thi (Out-of-Scope)?
Đề DVA-C03 là đề cho **Developer (Lập trình viên ứng dụng)**, **KHÔNG PHẢI** đề AI Practitioner (AIF-C01) hay Machine Learning Engineer (MLA-C01). Exam Guide của AWS nêu rõ **Out-of-Scope** gồm:
- **KHÔNG hỏi** thuật toán huấn luyện mô hình ML (training/fine-tuning hyperparameters), chọn thuật toán SageMaker.
- **KHÔNG hỏi** thiết kế kiến trúc RAG từ đầu ở góc độ khoa học dữ liệu (như chọn thuật toán nhúng vector, tính khoảng cách cosine/euclidean).
- **KHÔNG hỏi** thiết kế khung quản trị AI trên Amazon SageMaker (SageMaker Clarify, SageMaker Model Monitor...).
- **CHỈ HỎI:** Cách lập trình viên **gọi API/SDK của dịch vụ AI**, **cấu hình IAM/VPC Endpoint**, **bật Guardrails lọc PII/Prompt Injection**, **bảo mật AI Agent (session isolation, human-in-the-loop, tool authorization)** và **dùng công cụ AI (Amazon Q, Kiro) để viết code/viết test/review code**.

---

## 4. Lộ trình học thư mục bổ sung này (Chỉ mất 2–3 buổi)

Toàn bộ kiến thức còn thiếu của DVA-C03 đã được chia thành **5 bài học chuyên sâu** ngay trong thư mục này:

1. **[Bài 01 – Tích hợp Dịch vụ AI: Amazon Bedrock & Bedrock AgentCore (Domain 1)](./01%20-%20Tich%20hop%20Dich%20vu%20AI%20-%20Amazon%20Bedrock%20va%20AgentCore.md)**
   - Cách gọi Bedrock bằng SDK (`InvokeModel`, `Converse`, Streaming), xử lý lỗi throttling, kiến trúc Bedrock Agents và **Amazon Bedrock AgentCore** (Runtime, Gateway/MCP, Memory, Identity).
2. **[Bài 02 – Phát triển & Kiểm thử với AI: Amazon Q Developer & Kiro (Domain 1, 3, 4)](./02%20-%20Phat%20trien%20va%20Kiem%20thu%20voi%20AI%20-%20Amazon%20Q%20Developer%20va%20Kiro.md)**
   - Các tính năng của Amazon Q Developer (`/dev`, `/test`, `/review`, `/transform`, bảo mật code) và **Kiro** (Spec-driven development, Agent Hooks, Steering, MCP).
3. **[Bài 03 – Bảo mật AI & Guardrails – Task 2.3 Mới (Domain 2)](./03%20-%20Bao%20mat%20AI%20va%20Guardrails%20-%20Task%202.3%20Moi.md)**
   - Trọng tâm ăn điểm của Domain 2: **Amazon Bedrock Guardrails**, chống Prompt Injection, ẩn PII/PHI, PrivateLink cho AI, Session Isolation, Tool-use Authorization, Human-in-the-Loop, và bảo vệ log nhạy cảm.
4. **[Bài 04 – Mở rộng Container, CI/CD, Serverless & Observability (Domain 1, 3, 4)](./04%20-%20Mo%20rong%20Container%20CI-CD%20Serverless%20va%20Observability.md)**
   - Các chi tiết kỹ thuật được nhấn mạnh thêm ở DVA-C03: ECR Lifecycle/Scanning/Immutable tags, ECS Exec/Circuit Breaker, EKS Pod Identity, Lambda Recursive Loop Detection, Presigned URL CloudFront vs S3, CloudWatch Application Signals & OpenTelemetry.
5. **[Bài 05 – Bộ 30 Câu hỏi Luyện thi DVA-C03 (Chuyên sâu phần mới)](./05%20-%20Bo%2030%20cau%20hoi%20luyen%20thi%20DVA-C03%20phan%20moi.md)**
   - 30 câu hỏi tình huống sát cấu trúc đề DVA-C03 kèm giải thích chi tiết từng đáp án đúng/sai để bạn kiểm tra ngay sau khi đọc xong Bài 01–04.

---

[← Chương 33](ch33-preparing-for-the-exam-aws-certified-d.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chương 35.1 →](ch35-01-amazon-bedrock-va-agentcore.md)
