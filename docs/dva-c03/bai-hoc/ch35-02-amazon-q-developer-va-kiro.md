# Chương 35.2 – Phát triển, Kiểm thử & Tối ưu Ứng dụng với AI: Amazon Q Developer & Kiro (Domain 1, 3, 4)

> **Phạm vi trong Exam Guide DVA-C03:**
> - **Domain 1 (Task 1.1):** Sử dụng công cụ phát triển có AI hỗ trợ (**Amazon Q Developer**, **Kiro**) để sinh code theo đặc tả (spec-driven code generation), gợi ý hoàn thiện code, refactor, review code tự động và quét bảo mật.
> - **Domain 3 (Task 3.2 – Testing):** Sử dụng công cụ AI của AWS để **tự động sinh unit test / integration test, phân tích kết quả kiểm thử, kiểm thử hồi quy (regression testing) và tăng độ phủ kiểm thử (code test coverage)**.
> - **Domain 4 (Task 4.1 & 4.3):** Sử dụng trợ lý AI để chẩn đoán lỗi trên AWS Console/CloudWatch, giải thích mã lỗi và đề xuất tối ưu hiệu năng.

---

## Mục tiêu bài học

Sau bài này bạn có thể:
- Nắm vững toàn bộ tính năng và các lệnh slash (`/dev`, `/test`, `/review`, `/transform`, `/doc`) của **Amazon Q Developer** trong IDE và CI/CD.
- Hiểu cách **Amazon Q Developer thay thế CodeGuru Reviewer** trong việc quét lỗ hổng bảo mật (SAST, lộ secret, lỗi IaC CloudFormation/CDK/Terraform) và review code.
- Phân biệt gói **Amazon Q Developer Free Tier** (dùng AWS Builder ID) và **Pro Tier** (dùng AWS IAM Identity Center, có **Customizations** với codebase nội bộ và chính sách bảo mật doanh nghiệp).
- Hiểu rõ **Kiro** (AI IDE mới được đưa vào danh sách In-Scope của DVA-C03): quy trình **Spec-Driven Development** (`requirements.md` → `design.md` → `tasks.md`), **Agent Hooks**, **Steering files** và tích hợp **MCP**.
- Trả lời chính xác các câu hỏi tình huống về **tự động hóa kiểm thử (Task 3.2)** bằng AI.

---

## Bài 1 – Amazon Q Developer (Trợ lý AI toàn diện cho Developer)

### 1.1. Tổng quan & Sự tiến hóa từ CodeWhisperer / CodeGuru

- **Amazon Q Developer** là trợ lý tạo sinh (Generative AI-powered assistant) dành cho lập trình viên, tích hợp trực tiếp vào:
  - **IDE** (VS Code, JetBrains IntelliJ/PyCharm, Visual Studio, Eclipse).
  - **Command Line (CLI)** (`q chat`, `q translate`).
  - **AWS Management Console & AWS Documentation**.
  - **Nền tảng Git / CI/CD** (GitLab Duo with Amazon Q, GitHub, AWS CodePipeline / CodeBuild).
  - **Kênh chat đội nhóm** (Slack, Microsoft Teams qua AWS Chatbot / Amazon Q Developer in chat applications).
- **Lịch sử thay thế dịch vụ cũ (Cần nhớ để không bị lừa bởi đáp án cũ):**
  - Trước đây AWS có **Amazon CodeWhisperer** (gợi ý code) và **Amazon CodeGuru Reviewer** (review code & tìm lỗ hổng tĩnh).
  - Hiện nay, cả hai đã được **hợp nhất hoàn toàn vào Amazon Q Developer**. Trong đề DVA-C03, khi câu hỏi nhắc tới *"AI-assisted code generation, automated code review, security vulnerability scanning, unit test generation, or language upgrade"* → Đáp án luôn là **Amazon Q Developer**!

---

### 1.2. Các lệnh Agentic cốt lõi của Amazon Q Developer trong IDE

Trong IDE, ngoài việc gợi ý code theo thời gian thực (inline code completion) và hỏi đáp trong khung chat, Amazon Q Developer cung cấp các **Agent chuyên biệt** được gọi bằng lệnh dấu gạch chéo (**Slash commands**):

| Lệnh / Tính năng | Công dụng chi tiết | Tình huống xuất hiện trong đề DVA-C03 |
|---|---|---|
| **`/dev`** *(Feature Development Agent)* | Nhận yêu cầu bằng ngôn ngữ tự nhiên → phân tích toàn bộ workspace → lập kế hoạch thực thi (plan) → **tạo mới hoặc sửa nhiều file code cùng lúc** để hoàn thiện một tính năng. | *"Lập trình viên muốn tự động triển khai một tính năng mới跨越 nhiều file trong project dựa trên mô tả yêu cầu"*. |
| **`/test`** *(Unit Test Generation Agent)* | Phân tích hàm/class đang chọn → **tự động sinh bộ Unit Tests** (bao gồm cả happy path, edge cases, boundary conditions và mock các dependency) → tăng **code test coverage**. | *"Đội phát triển cần tự động tạo unit test cho các hàm Lambda hiện có để nâng cao độ phủ kiểm thử (test coverage) trước khi đưa vào CI/CD"* (**Task 3.2**). |
| **`/review`** *(Code Review & Security Scan)* | Quét tĩnh toàn bộ project hoặc các file đang mở để tìm: **(1) Lỗ hổng bảo mật (SAST, OWASP Top 10, SQL Injection, XSS)**, **(2) Lộ thông tin nhạy cảm (hardcoded secrets/API keys)**, **(3) Lỗi cấu hình IaC (CloudFormation, CDK, Terraform)**, **(4) Lỗi chất lượng code, resource leak, hiệu năng kém** — và đề xuất bản vá (**1-click autofix**). | *"Tìm lỗ hổng bảo mật và secret bị hard-code ngay trong IDE trước khi commit code mà không phải tự viết rule"* (**Task 1.1 & Task 2.3**). |
| **`/transform`** *(Code Transformation Agent)* | Tự động nâng cấp phiên bản ngôn ngữ/framework lớn: **nâng cấp Java 8 / 11 lên Java 17 / 21**, nâng cấp **.NET Framework (Windows) sang .NET đa nền tảng (Linux)**, cập nhật các thư viện phụ thuộc bị deprecated và tự chạy build/test để xác nhận. | *"Hiện đại hóa hàng chục microservice đang chạy Java 8 cũ lên Java 17/21 hoặc chuyển ứng dụng .NET sang chạy trên Linux container với ít công sức thủ công nhất"*. |
| **`/doc`** *(Documentation Agent)* | Tự động đọc cấu trúc mã nguồn và sinh hoặc cập nhật tài liệu `README.md`, sơ đồ luồng dữ liệu, và docstring cho code. | *"Tự động tạo tài liệu kỹ thuật và README cho repository chưa có tài liệu"*. |
| **Reference Tracking (Theo dõi nguồn code)** | Phát hiện xem đoạn code do AI gợi ý có giống với mã nguồn mở công khai nào không, kèm theo **URL dự án gốc và loại giấy phép (License: MIT, Apache-2.0, GPL...)** để lập trình viên quyết định chấp nhận hay từ chối. | *"Công ty có quy định pháp lý nghiêm ngặt về bản quyền phần mềm mã nguồn mở (open-source license compliance) khi dùng AI sinh code"* → Bật **Reference Tracker** trong Amazon Q Developer. |

---

### 1.3. Amazon Q Developer trong AWS Console & Troubleshooting (Domain 4)

Trong **Domain 4 (Troubleshooting and Optimization – 22%)**, Amazon Q Developer tích hợp trực tiếp vào AWS Console để giúp lập trình viên gỡ lỗi:
1. **Troubleshoot Console Errors:** Khi gặp lỗi phân quyền (`AccessDenied`), lỗi triển khai CloudFormation, hoặc lỗi cấu hình VPC/Lambda trên Console, bấm **"Troubleshoot with Amazon Q"** để chẩn đoán nguyên nhân gốc rễ và nhận câu lệnh CLI / IAM Policy sửa lỗi.
2. **CloudWatch Logs & Insights Investigation:**
   - Tự động sinh câu truy vấn **CloudWatch Logs Insights** từ câu hỏi tiếng Anh tự nhiên (không cần nhớ cú pháp `fields @timestamp | filter ...`).
   - Hỗ trợ **Amazon Q Developer Operational Investigations**: tự động tương quan (correlate) metrics, logs, traces (X-Ray) và lịch sử thay đổi (CloudTrail/CodeDeploy) để tìm nguyên nhân gây sự cố (Root Cause Analysis).
3. **Network Reachability Analysis:** Kết hợp với **VPC Reachability Analyzer** để hỏi bằng ngôn ngữ tự nhiên vì sao EC2/Lambda không kết nối được tới RDS (do Security Group, NACL hay thiếu Route Table/NAT Gateway).

---

### 1.4. So sánh Amazon Q Developer: Free Tier vs Pro Tier & Customizations

| Tiêu chí | Amazon Q Developer **Free Tier** | Amazon Q Developer **Pro Tier** |
|---|---|---|
| **Cách đăng nhập** | **AWS Builder ID** (tài khoản cá nhân miễn phí) | **AWS IAM Identity Center (SSO)** do doanh nghiệp quản lý |
| **Quản trị tập trung** | Không có | Có (Admin kiểm soát chính sách, chặn gợi ý code có license mã nguồn mở, xem dashboard sử dụng) |
| **Quyền riêng tư dữ liệu (Data Privacy)** | Mặc định AWS **có thể** dùng dữ liệu/code để cải thiện dịch vụ **TRỪ KHI** người dùng tự vào cài đặt IDE **tắt (opt-out)** chia sẻ dữ liệu với AWS. | **Mặc định 100% KHÔNG bao giờ dùng code/dữ liệu của doanh nghiệp để huấn luyện mô hình cho khách hàng khác.** |
| **Customizations (Tùy biến theo codebase nội bộ)** | Không hỗ trợ | **Hỗ trợ Customizations:** Kết nối tới repository riêng tư của công ty (GitHub, GitLab, Bitbucket, S3) để Amazon Q học các thư viện nội bộ, coding conventions và API riêng của công ty, giúp gợi ý code chuẩn xác hơn. |

> **Bẫy thi:**
> - Nếu đề hỏi: *"Làm sao để công cụ AI gợi ý code tuân theo các thư viện nội bộ (internal libraries) và chuẩn code riêng của công ty?"* → Chọn **Amazon Q Developer Pro với tính năng Customizations** (kết nối vào private repo của công ty), **không phải** đi fine-tune lại mô hình trên SageMaker!

---

## Bài 2 – Kiro (Công cụ phát triển AI hướng đặc tả – Spec-Driven Development)

### 2.1. Kiro là gì và vì sao xuất hiện trong đề DVA-C03?

Trong phần **Appendix – In-scope AWS services and features** của Exam Guide DVA-C03 (nhóm *Machine Learning and Artificial Intelligence*), AWS liệt kê đích danh **Kiro** bên cạnh Amazon Bedrock và Amazon Q.
Đồng thời, trong **Task 1.1**, Exam Guide nhấn mạnh kỹ năng **"spec-driven code generation"** (sinh code dựa trên bản đặc tả).

- **Kiro** là **Agentic AI IDE** của AWS được thiết kế để đưa dự án từ bản mẫu (prototype / "vibe coding") lên chất lượng **production** thông qua phương pháp **Spec-Driven Development (Phát triển dựa trên đặc tả)**.
- Thay vì gõ một câu prompt ngắn rồi để AI sinh code ngẫu nhiên khó bảo trì, Kiro chuyển hóa yêu cầu của lập trình viên thành **3 file đặc tả có cấu trúc** trước khi viết code.

---

### 2.2. Bốn khái niệm cốt lõi của Kiro cần nhớ cho kỳ thi

#### 1. Spec-Driven Development (3 bước chuẩn hóa của Kiro)

Khi bạn đưa một yêu cầu tính năng vào Kiro ở chế độ **Spec**, Kiro tự động tạo và duy trì 3 tài liệu trong thư mục `.kiro/specs/<ten-tinh-nang>/`:

```
[Prompt yêu cầu của Developer]
       |
       v
(1) requirements.md  ---> Viết các User Stories + Acceptance Criteria theo chuẩn cú pháp EARS
       |                  ("WHEN <sự kiện> THE SYSTEM SHALL <phản hồi bắt buộc>")
       v
(2) design.md        ---> Phân tích codebase hiện tại, vẽ kiến trúc kỹ thuật, Sequence Diagram (Mermaid),
       |                  cấu trúc bảng DynamoDB, giao diện API, chiến lược xử lý lỗi & kiểm thử
       v
(3) tasks.md         ---> Chia nhỏ thành danh sách các Task/Sub-task triển khai tuần tự,
                          kèm theo Unit Test / Property-based Test cho từng bước và liên kết ngược về requirements
```

- **Lợi ích trong đề thi:** Giúp lập trình viên **rà soát và phê duyệt thiết kế kỹ thuật (design review) trước khi AI sinh hàng loạt code**, đảm bảo code sinh ra khớp 100% với yêu cầu nghiệp vụ, có sẵn kế hoạch kiểm thử và không làm lệch kiến trúc hiện tại.

#### 2. Agent Hooks (Tự động hóa theo sự kiện trong IDE)
- **Agent Hooks** trong Kiro là các tác vụ AI tự động kích hoạt khi có **sự kiện tệp tin trong IDE** (ví dụ: khi lập trình viên **lưu file `onSave`**, **tạo file mới `onCreate`**, hoặc **xóa file `onDelete`**).
- **Ví dụ thực tế hay hỏi trong Task 3.2 (Testing) & Task 1.1:**
  - Mỗi khi lập trình viên lưu một file hàm Lambda (`.py` hoặc `.ts`), **Agent Hook** tự động chạy để **cập nhật hoặc sinh thêm Unit Test tương ứng** và chạy kiểm tra regression test.
  - Khi sửa file API route, Agent Hook tự động cập nhật file tài liệu OpenAPI/Swagger hoặc kiểm tra xem có vi phạm quy tắc bảo mật không.

#### 3. Steering Files (`.kiro/steering/*.md`)
- Các file Markdown nằm trong `.kiro/steering/` dùng để **định hướng cố định (persistent project context)** cho AI Agent về kiến trúc của dự án, quy ước đặt tên, thư viện bắt buộc dùng (ví dụ: luôn dùng AWS SDK v3, luôn bật mã hóa KMS cho DynamoDB) để lập trình viên không phải nhắc lại trong mỗi câu prompt.

#### 4. Tích hợp MCP (Model Context Protocol)
- Kiro hỗ trợ kết nối trực tiếp tới các **MCP Servers** (như AWS Documentation MCP Server, AWS CDK/Serverless MCP Server, hoặc cơ sở dữ liệu nội bộ) để tra cứu tài liệu AWS mới nhất và kiểm tra cấu hình hạ tầng ngay trong lúc lập kế hoạch và viết code.

---

## Bài 3 – Ứng dụng AI trong Kiểm thử Tự động (Task Statement 3.2 của DVA-C03)

Trong DVA-C03, **Domain 3** được đổi tên thành **Testing and Deployment**, và **Task 3.2** yêu cầu rõ:
> *"Utilize AWS AI tools to generate tests, execute automated test results analysis, handle regression testing, and ensure code test coverage."*

Dưới đây là bảng ánh xạ trực tiếp từ yêu cầu trong đề thi sang công cụ và giải pháp đúng:

| Yêu cầu trong câu hỏi (Scenario) | Giải pháp chuẩn theo DVA-C03 |
|---|---|
| **Sinh tự động Unit Test cho code hiện có để tăng độ phủ (code coverage), bao gồm cả các trường hợp biên (edge cases) và mock AWS SDK** | Sử dụng **Amazon Q Developer (`/test`)** hoặc **Kiro** để phân tích hàm và tự động sinh bộ unit test. |
| **Đảm bảo mỗi khi lập trình viên sửa code thì test tương ứng luôn được cập nhật và chạy kiểm thử hồi quy (regression testing) tự động** | Cấu hình **Agent Hooks** (trong Kiro) khi lưu file + tích hợp bước chạy test và báo cáo độ phủ (**CodeBuild Test Reports / Code Coverage**) trong pipeline CI/CD. |
| **Sinh code và bộ kiểm thử bám sát 100% yêu cầu nghiệp vụ (acceptance criteria) ngay từ khâu thiết kế** | Áp dụng quy trình **Spec-Driven Development** (với **Kiro** hoặc Amazon Q Developer): tạo `requirements.md` → `design.md` → `tasks.md` kèm tiêu chí kiểm thử trước khi sinh code. |
| **Kiểm thử hàm Lambda và API Gateway ngay tại máy local trước khi deploy lên cloud** | Sử dụng **AWS SAM CLI**: `sam local invoke` (chạy thử 1 lần với file `event.json`), `sam local start-api` (giả lập API Gateway local), `sam local generate-event s3 put` (tạo payload sự kiện mẫu). |
| **Phân tích nguyên nhân hàng loạt test bị fail trong CI/CD pipeline (CodeBuild)** | Dùng **Amazon Q Developer** tích hợp trong AWS Console / CodeBuild để tóm tắt build log, chỉ ra dòng lỗi trong test và đề xuất cách sửa. |

---

## Ghi nhớ cho kỳ thi (Tóm tắt nhanh Chương 35.2)

1. **`/dev`** = viết tính năng mới qua nhiều file; **`/test`** = tự động sinh unit test tăng coverage; **`/review`** = quét lỗ hổng bảo mật (SAST, secrets, IaC) & chất lượng code; **`/transform`** = nâng cấp phiên bản ngôn ngữ (Java 8/11 → 17/21, .NET).
2. **Thay thế CodeGuru Reviewer trong đề mới:** Chọn **Amazon Q Developer** (hoặc **Amazon Inspector** khi quét trong pipeline/ECR).
3. **Muốn AI gợi ý code theo chuẩn và thư viện nội bộ của công ty:** Chọn **Amazon Q Developer Pro** và cấu hình **Customizations** trỏ vào private repository của công ty.
4. **Muốn kiểm soát bản quyền mã nguồn mở khi dùng AI sinh code:** Bật **Reference Tracking (Code Reference Log)** hoặc cấu hình chặn gợi ý khớp với code công khai trong Amazon Q Developer.
5. **Từ khóa *"Spec-driven code generation"*, *"chuyển yêu cầu thành requirements, design, tasks trước khi sinh code"*, hoặc *"Agent Hooks tự động sinh/chạy test khi lưu file"*:** Chọn **Kiro** (hoặc quy trình Spec-driven với công cụ AI của AWS).

---

[← Chương 35.1](ch35-01-amazon-bedrock-va-agentcore.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chương 35.3 →](ch35-03-bao-mat-ai-va-guardrails.md)
