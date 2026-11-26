# Bài 9: Hệ sinh thái Amazon Q (Business, Developer, QuickSight) & No-Code ML (SageMaker Canvas, PartyRock)

Trong kỳ thi **AWS Certified AI Practitioner (AIF-C01)**, bạn không chỉ cần hiểu về mô hình nền tảng (Foundation Models) trên Amazon Bedrock mà còn phải nắm vững các **ứng dụng Generative AI đóng gói sẵn (Managed GenAI Applications)** và **công cụ No-Code ML** của AWS. Đây là nhóm câu hỏi thực tiễn rất phổ biến nhằm kiểm tra khả năng chọn đúng dịch vụ AWS nhanh nhất, ít tốn công sức lập trình nhất cho từng nhóm người dùng (Business Analyst, Developer, Customer Support, Data Analyst).

---

## 1. Hệ sinh thái Amazon Q: Chọn đúng công cụ cho đúng vai trò

**Amazon Q** là trợ lý Generative AI của AWS, được chia thành nhiều phiên bản chuyên biệt tùy theo đối tượng sử dụng:

| Sản phẩm | Đối tượng sử dụng | Chức năng cốt lõi | Nguồn dữ liệu / Tích hợp |
| :--- | :--- | :--- | :--- |
| **Amazon Q Business** | Nhân viên doanh nghiệp (HR, Legal, Sales, Ops) | Trợ lý hỏi đáp tri thức doanh nghiệp (**Enterprise RAG**), tóm tắt tài liệu, tạo **Q Apps** | **40+ built-in connectors** (S3, SharePoint, Confluence, Jira, Salesforce, Slack, Google Drive...) |
| **Amazon Q Developer** | Lập trình viên, DevOps, Cloud Architect | Sinh code, giải thích code, **quét bảo mật (SAST)**, nâng cấp phiên bản (**Code Transformation**), debug lỗi AWS Console | IDE (VS Code, JetBrains), AWS CLI, AWS Management Console, GitHub/CodeCatalyst |
| **Amazon Q in QuickSight** | Business Analyst, Lãnh đạo, Data Analyst | Hỏi đáp dữ liệu BI bằng ngôn ngữ tự nhiên, tự động tạo **Executive Summaries**, **Data Stories**, và build dashboard | Amazon QuickSight Datasets (Redshift, Athena, RDS, S3...) |
| **Amazon Q in Connect** | Nhân viên tổng đài (Contact Center Agents) | Lắng nghe cuộc gọi/chat thời gian thực, gợi ý câu trả lời chính xác và quy trình xử lý cho tổng đài viên | **Amazon Connect**, Knowledge Bases nội bộ |

---

## 2. Chuyên sâu về Amazon Q Business

**Amazon Q Business** là giải pháp **Enterprise RAG (Retrieval-Augmented Generation)** được quản lý hoàn toàn (fully managed), giúp doanh nghiệp xây dựng chatbot nội bộ bảo mật mà **không cần tự viết pipeline embedding hay quản lý vector database**.

### 2.1. Kiến trúc và Tính năng quan trọng cho kỳ thi
1. **40+ Built-in Connectors**:
   - Kết nối trực tiếp tới kho dữ liệu doanh nghiệp như Amazon S3, Microsoft SharePoint, Confluence, Jira, Google Drive, Slack, Salesforce, ServiceNow, RDS...
   - Tự động lập chỉ mục (indexing) và đồng bộ thay đổi dữ liệu theo lịch trình.
2. **Bảo mật & Phân quyền theo ngữ cảnh người dùng (User-aware ACLs)**:
   - Tích hợp bắt buộc với **AWS IAM Identity Center** (hỗ trợ Okta, Azure AD / Entra ID, Ping Identity).
   - **Document-level Access Control Lists (ACLs)**: Khi nhân viên A đặt câu hỏi, Amazon Q Business **chỉ truy xuất và trả lời dựa trên những tài liệu mà nhân viên A có quyền đọc** ở hệ thống gốc (ví dụ: nhân viên thường không thể hỏi về bảng lương của giám đốc dù tài liệu đó nằm chung trong kho dữ liệu).
3. **Admin Controls & Guardrails**:
   - Quản trị viên có thể cấu hình từ khóa bị chặn, chủ đề bị hạn chế, hoặc yêu cầu Amazon Q **chỉ trả lời dựa trên dữ liệu doanh nghiệp** (Global Controls — tắt khả năng trả lời bằng kiến thức chung của LLM để giảm hallucination).
4. **Amazon Q Apps**:
   - Cho phép nhân viên không biết lập trình (no-code) biến một chuỗi hội thoại/prompt thành một **ứng dụng web mini (Q App)** dùng ngôn ngữ tự nhiên để chia sẻ cho cả team (ví dụ: app tự động tóm tắt báo cáo tuần hoặc soạn email onboarding).

> **Exam Tip**: Nếu câu hỏi nhắc đến **"xây dựng chatbot nội bộ kết nối với SharePoint/Confluence/S3 mà phải tôn trọng quyền truy cập tài liệu của từng nhân viên (respecting existing user permissions / ACLs)"** với thời gian triển khai nhanh nhất (không tự code RAG) → đáp án chắc chắn là **Amazon Q Business**.

---

## 3. Amazon Q Developer, QuickSight & Connect

### 3.1. Amazon Q Developer
- **Hỗ trợ lập trình & Refactoring**: Gợi ý code theo thời gian thực trong IDE, viết unit test, giải thích đoạn code phức tạp.
- **Security Scanning & Reference Tracker**: Quét lỗ hổng bảo mật trong code và kiểm tra code gợi ý có trùng với mã nguồn mở (open-source) để tuân thủ bản quyền.
- **Amazon Q Developer Agent for Code Transformation**: Tự động nâng cấp toàn bộ dự án (như Java 8/11 lên Java 17/21 hoặc .NET Windows sang Linux).
- **AWS Console & CLI**: Trả lời câu hỏi kiến trúc AWS, chẩn đoán lỗi (ví dụ: tại sao EC2 không kết nối được Internet, lỗi IAM permission), tối ưu chi phí AWS.

### 3.2. Amazon Q in QuickSight
- Cho phép người dùng không biết SQL vẫn có thể khai thác dữ liệu BI:
  - **Multi-visual Q&A**: Đặt câu hỏi như *"Doanh thu quý 3 theo từng khu vực so với cùng kỳ năm ngoái thế nào?"* và nhận lại biểu đồ trực quan ngay lập tức.
  - **Executive Summaries**: Tự động tóm tắt các điểm nhấn quan trọng nhất từ cả một dashboard phức tạp.
  - **Data Stories**: Tạo bài thuyết trình/báo cáo kể chuyện bằng dữ liệu (kèm biểu đồ và văn bản giải thích) chỉ từ một câu lệnh mô tả.

### 3.3. Amazon Q in Connect
- Hoạt động như một "trợ lý ngồi cạnh" (agent assist) trong hệ thống tổng đài **Amazon Connect**:
  - Tự động nhận diện ý định khách hàng qua giọng nói (kết hợp Amazon Transcribe) hoặc tin nhắn chat.
  - Chủ động đẩy lên màn hình tổng đài viên câu trả lời đề xuất, liên kết tới chính sách hoàn tiền/bảo hành phù hợp để giảm thời gian xử lý cuộc gọi (AHT - Average Handle Time).

---

## 4. No-Code ML & GenAI Prototyping: SageMaker Canvas vs. AWS PartyRock

Hai công cụ No-Code rất dễ bị nhầm lẫn hoặc thường được đặt làm phương án nhiễu cho nhau trong đề thi AIF-C01:

| Tiêu chí | Amazon SageMaker Canvas | AWS PartyRock (powered by Bedrock) |
| :--- | :--- | :--- |
| **Mục đích chính** | **No-Code Machine Learning (AutoML)** cho dữ liệu bảng, ảnh, text và truy cập GenAI models | **No-Code Generative AI Playground** để thử nghiệm prompt và tạo app GenAI chia sẻ nhanh |
| **Đối tượng** | **Business Analysts** muốn dự đoán (churn, doanh thu, phân loại ảnh, dự báo chuỗi thời gian) mà không cần viết code | Bất kỳ ai (developer, sinh viên, PM) muốn học Prompt Engineering và tạo nguyên mẫu (prototype) GenAI app |
| **Đầu ra & Triển khai** | Tạo ra mô hình ML thực thụ, có thể **chia sẻ sang SageMaker Studio** cho Data Scientist tinh chỉnh và **deploy endpoint** | Tạo ra **web app tương tác** dùng các FM trên Bedrock (Claude, Llama, Titan...) để chia sẻ qua URL |
| **Tài khoản AWS** | Yêu cầu **AWS Account** (chạy trong môi trường SageMaker Domain) | **Không cần AWS Account** (đăng nhập bằng Google/Apple/Amazon account, miễn phí credit dùng thử) |

### 4.1. Chi tiết về Amazon SageMaker Canvas
- Hỗ trợ **Data Preparation** (kéo thả làm sạch dữ liệu, xử lý missing values, join bảng từ S3, Redshift, Snowflake).
- Tự động chọn thuật toán tối ưu (AutoML) cho các bài toán:
  - **Tabular** (Classification, Regression, Time-series forecasting).
  - **Computer Vision** (Image Classification, Object Detection).
  - **NLP** (Text Classification, Sentiment Analysis).
- Hỗ trợ **Ready-to-use Models** (dùng ngay các mô hình dựng sẵn của Rekognition, Comprehend, Textract hoặc Foundation Models từ Bedrock/JumpStart) mà không cần train lại.
- Có tính năng **Explainability (SHAP values)** giúp Business Analyst giải thích được cột dữ liệu nào ảnh hưởng mạnh nhất đến kết quả dự đoán.

### 4.2. Chi tiết về AWS PartyRock
- Là một sandbox miễn phí (không cần thẻ tín dụng hay AWS Account) chạy trên nền **Amazon Bedrock**.
- Người dùng chỉ cần nhập mô tả ứng dụng mong muốn (App Builder), PartyRock tự động tạo ra giao diện gồm các widget (Text Input, Text Generation, Image Generation, Chatbot) được kết nối với nhau (**prompt chaining**).
- Dùng để học **Prompt Engineering** (thử nghiệm thay đổi `Temperature`, `Top-P`, System Prompt giữa các FM khác nhau) và tạo demo nhanh trước khi lập trình thật bằng Bedrock API.

> **Exam Tip**:
> - Đề bài nói **Business Analyst không biết code muốn xây dựng mô hình dự đoán khách hàng rời bỏ (churn prediction) từ file CSV/Redshift** → chọn **Amazon SageMaker Canvas**.
> - Đề bài nói **thử nghiệm nhanh (experiment/prototype) các prompt và ứng dụng GenAI dựa trên Amazon Bedrock mà không cần tạo AWS Account hay viết code** → chọn **AWS PartyRock**.
> - Đề bài nói **Data Scientist muốn viết code Python/Jupyter Notebook để train và tune model** → chọn **Amazon SageMaker Studio** (không phải Canvas).

---

[← Bài trước](05-tokenization-quantization-model-evaluation.md) | [Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/06-amazon-q-nocode.md) | [Bài tiếp →](07-prompt-rag-finetuning.md)
