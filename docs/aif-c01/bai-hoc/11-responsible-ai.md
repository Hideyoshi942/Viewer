# AI Có trách nhiệm & Đánh giá Mô hình

Domain 4 chiếm **14%** bài thi AIF-C01. AWS đặc biệt chú trọng việc xây dựng hệ thống AI đáng tin cậy, minh bạch, công bằng và an toàn. Bạn cần nắm vững các khía cạnh cốt lõi của **Responsible AI** và ánh xạ đúng dịch vụ AWS hỗ trợ kiểm soát từng rủi ro.

## 1. Các Trụ cột của Responsible AI (Core Dimensions)

| Trụ cột | Định nghĩa | Rủi ro khi thiếu kiểm soát |
| :--- | :--- | :--- |
| **Fairness (Công bằng)** | Mô hình không phân biệt đối xử với các nhóm nhân khẩu học (giới tính, độ tuổi, chủng tộc...) | Hệ thống duyệt vay tự động từ chối bất công một nhóm khách hàng do dữ liệu lịch sử thiên lệch (**Bias**) |
| **Explainability (Khả năng giải thích)** | Hiểu và giải thích được *tại sao* mô hình đưa ra dự đoán cụ thể (ví dụ: Feature Attribution / SHAP) | Người dùng và cơ quan quản lý (ngân hàng, y tế) không tin tưởng "hộp đen" (Black-box model) |
| **Veracity & Robustness (Độ chính xác & Bền vững)** | Mô hình đưa ra kết quả đúng sự thật, hoạt động ổn định trước nhiễu hoặc dữ liệu đầu vào bất thường | **Hallucination** (ảo giác — bịa đặt thông tin nghe rất thuyết phục nhưng sai sự thật) |
| **Safety (An toàn)** | Ngăn chặn tạo ra nội dung độc hại (thù ghét, bạo lực, tự hại, khiêu dâm) | Chatbot thương hiệu phát ngôn phản cảm gây khủng hoảng truyền thông |
| **Privacy & Security** | Bảo vệ dữ liệu nhạy cảm (PII) và quyền riêng tư của người dùng | Rò rỉ số thẻ tín dụng, thông tin bệnh án qua câu trả lời của LLM |
| **Transparency (Minh bạch)** | Công khai mục đích, giới hạn, dữ liệu huấn luyện và cảnh báo người dùng đang tương tác với AI | Người dùng nhầm lẫn nội dung AI tạo ra là thông tin xác thực từ chuyên gia |
| **Governance & Controllability** | Cơ chế giám sát vòng đời, kiểm toán và cho phép con người can thiệp (**Human-in-the-Loop**) | Hệ thống AI tự động đưa ra quyết định sai lầm nghiêm trọng không có điểm dừng |

## 2. Xử lý Thiên lệch (Bias) & Ảo giác (Hallucination)

### Các loại Bias thường gặp trong ML/AI
- **Selection / Sampling Bias**: Dữ liệu huấn luyện không đại diện cho toàn bộ quần thể thực tế (ví dụ: chỉ huấn luyện nhận diện giọng nói bằng giọng nam miền Bắc).
- **Historical Bias**: Dữ liệu lịch sử vốn đã chứa định kiến xã hội (ví dụ: dữ liệu tuyển dụng cũ thiên vị một giới tính).
- **Confirmation Bias**: Người xây dựng mô hình chỉ chọn dữ liệu hoặc chỉ số củng cố niềm tin có sẵn của mình.
- **Overgeneralization**: Mô hình khái quát hóa quá mức từ một tập mẫu nhỏ.

### Cách giảm thiểu Hallucination trong GenAI
1. Áp dụng **RAG** để neo câu trả lời vào nguồn tri thức đã xác thực (Grounding).
2. Giảm **Temperature** về gần `0` để hạn chế suy diễn ngẫu nhiên.
3. Dùng **Prompt Engineering** hướng dẫn rõ: *"If the answer is not in the provided context, reply 'I do not know'"*.
4. Kích hoạt **Contextual Grounding Checks** trong **Amazon Bedrock Guardrails** để tự động chặn câu trả lời không dựa trên ngữ cảnh nguồn.

## 3. Các Dịch vụ AWS cho Responsible AI

### Amazon Bedrock Guardrails
Lớp bảo vệ có thể cấu hình độc lập và áp dụng cho mọi FM trên Bedrock (thậm chí cả mô hình ngoài thông qua `ApplyGuardrail` API):
- **Content Filters**: Chặn/lọc nội dung độc hại theo ngưỡng (Hate, Insults, Sexual, Violence, Misconduct, Prompt Attack).
- **Denied Topics**: Cấm mô hình thảo luận các chủ đề ngoài phạm vi (ví dụ: chatbot ngân hàng không được đưa ra lời khuyên đầu tư cổ phiếu cụ thể).
- **Word Filters**: Chặn danh sách từ khóa tùy chỉnh (tên đối thủ cạnh tranh, từ ngữ nhạy cảm).
- **Sensitive Information Filters (PII)**: Tự động chặn hoặc che giấu (**mask/redact**) PII như email, số điện thoại, số SSN trong cả prompt và response.
- **Contextual Grounding Check**: Phát hiện và chặn **Hallucination** dựa trên ngưỡng Grounding & Relevance so với nguồn RAG.

### Amazon SageMaker Clarify
- Phát hiện **Pre-training Bias** (thiên lệch trong dữ liệu đầu vào trước khi train) và **Post-training Bias** (thiên lệch trong dự đoán của mô hình).
- Cung cấp **Explainability** thông qua biểu đồ mức độ đóng góp của từng đặc trưng (**Feature Importance / SHAP values**) giúp giải thích quyết định mô hình cho kiểm toán viên.
- Hỗ trợ đánh giá các FM (độc tính, độ chính xác, độ bền vững) trên SageMaker.

### AWS AI Service Cards & Amazon SageMaker Model Cards
- **AWS AI Service Cards**: Tài liệu minh bạch do **AWS cung cấp** cho các dịch vụ AI quản lý (như Rekognition, Textract, Transcribe) mô tả mục đích sử dụng, giới hạn và thực hành tốt nhất.
- **Amazon SageMaker Model Cards**: Tài liệu do **khách hàng tạo** để ghi lại thông tin quản trị cho từng mô hình tự xây dựng (mục tiêu nghiệp vụ, dữ liệu huấn luyện, chỉ số đánh giá, rủi ro và kế hoạch giảm thiểu).

### Amazon Augmented AI (Amazon A2I)
- Triển khai quy trình **Human-in-the-Loop (HITL)** dễ dàng.
- Khi độ tin cậy dự đoán (**Confidence Score**) của mô hình thấp hơn ngưỡng quy định (ví dụ `< 85%`), A2I tự động chuyển tác vụ sang nhân sự kiểm duyệt (đội nội bộ, đối tác hoặc Amazon Mechanical Turk) để xác minh trước khi trả kết quả cuối cùng.

> **Exam Tip**: Hãy nhớ cặp từ khóa cực nhạy trong đề thi:
> - *"Detect bias & explain model predictions (SHAP)"* $\rightarrow$ **Amazon SageMaker Clarify**.
> - *"Filter harmful content, block denied topics, redact PII, check grounding for FM apps"* $\rightarrow$ **Amazon Bedrock Guardrails**.
> - *"Human review when prediction confidence is low (Human-in-the-Loop)"* $\rightarrow$ **Amazon Augmented AI (A2I)**.
> - *"Centralize governance documentation for custom ML models"* $\rightarrow$ **SageMaker Model Cards**.

---

[← Bài trước](10-bedrock-agents-action-groups-flows.md) | [Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/11-responsible-ai-principles.md) | [Bài tiếp →](12-clarify-model-cards-guardrails-a2i.md)
