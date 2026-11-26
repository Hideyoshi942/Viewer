# Hệ sinh thái Dịch vụ AWS AI Quản lý (Managed AI Services)

Trong Domain 1 (**Fundamentals of AI and ML – 20%**), nhiều câu hỏi tình huống yêu cầu bạn chọn đúng dịch vụ AI quản lý sẵn (**Pre-trained / Managed AI Services**) của AWS để giải quyết bài toán nghiệp vụ nhanh nhất mà **không cần xây dựng hay huấn luyện mô hình ML từ đầu**.

---

## 1. Nhóm Thị giác Máy tính & Tài liệu (Vision & Document AI)

| Dịch vụ AWS | Chức năng cốt lõi | Tình huống thi tiêu biểu |
| :--- | :--- | :--- |
| **Amazon Rekognition** | Phân tích ảnh & video (Object/Scene detection, Facial analysis, Content Moderation, PPE detection) | Kiểm duyệt ảnh người dùng upload có nội dung bạo lực/nhạy cảm; đếm người trong video |
| **Amazon Textract** | Trích xuất văn bản, **bảng biểu (tables)** và **biểu mẫu (key-value pairs)** từ scan/PDF | Số hóa hóa đơn, hồ sơ vay vốn, đơn thuế (tốt hơn OCR thuần vì giữ cấu trúc bảng) |

> **Exam Tip**: Cần đọc chữ trên biển báo đường phố trong ảnh tự nhiên $\rightarrow$ **Amazon Rekognition** (DetectText). Cần trích xuất dữ liệu có cấu trúc (họ tên, tổng tiền, bảng kê chi tiết) từ file PDF/hóa đơn scan $\rightarrow$ **Amazon Textract**.

---

## 2. Nhóm Ngôn ngữ, Giọng nói & Hội thoại (Language & Speech AI)

| Dịch vụ AWS | Chức năng cốt lõi | Từ khóa nhận diện |
| :--- | :--- | :--- |
| **Amazon Comprehend** | NLP: Sentiment Analysis, Named Entity Recognition, **PII Detection**, Topic Modeling, Custom Classification | Phân tích đánh giá khách hàng (tích cực/tiêu cực), tự động che (redact) PII trong văn bản |
| **Amazon Transcribe** | Speech-to-Text (Audio $\rightarrow$ Text), hỗ trợ **Speaker Diarization** (phân biệt người nói) & PII redaction | Chuyển ghi âm tổng đài CSKH thành văn bản để phân tích chất lượng |
| **Amazon Polly** | Text-to-Speech (Text $\rightarrow$ Audio) với Neural Voices & SSML | Tạo giọng đọc tự nhiên cho sách nói, thông báo tự động |
| **Amazon Translate** | Dịch máy thần kinh đa ngôn ngữ (Real-time & Batch), hỗ trợ **Custom Terminology** | Dịch tài liệu hỗ trợ khách hàng sang nhiều ngôn ngữ, giữ nguyên thuật ngữ thương hiệu |
| **Amazon Lex** | Xây dựng Chatbot/Voicebot (công nghệ của Alexa) dựa trên **Intents, Utterances, Slots** | Tích hợp tổng đài **Amazon Connect** để đặt lịch hẹn hoặc tra cứu đơn hàng |

```python
import boto3

# Ví dụ gọi Amazon Comprehend để phát hiện cảm xúc & thực thể PII
comprehend = boto3.client("comprehend", region_name="us-east-1")
text = "Tôi rất hài lòng với dịch vụ! Số điện thoại liên hệ của tôi là 0901234567."

sentiment = comprehend.detect_sentiment(Text=text, LanguageCode="vi")
pii = comprehend.detect_pii_entities(Text=text, LanguageCode="en")
print("Sentiment:", sentiment["Sentiment"])
```

---

## 3. Nhóm Tìm kiếm, Gợi ý & Dự báo Doanh nghiệp

- **Amazon Kendra**: Dịch vụ **Enterprise Intelligent Search** tích hợp sẵn connector tới S3, SharePoint, Confluence, Salesforce; hiểu câu hỏi ngôn ngữ tự nhiên (NLP Search) và thường kết hợp làm retriever cho RAG.
- **Amazon Personalize**: Xây dựng hệ thống gợi ý sản phẩm/nội dung cá nhân hóa theo thời gian thực (real-time recommendations) mà không cần kinh nghiệm ML.
- **Amazon Fraud Detector**: Phát hiện gian lận thanh toán trực tuyến, tạo tài khoản giả dựa trên dữ liệu lịch sử.
- **AWS HealthLake / Comprehend Medical**: Phân tích dữ liệu y tế chuẩn FHIR và trích xuất thông tin lâm sàng (thuốc, chẩn đoán) tuân thủ HIPAA.

---

## 4. Ma trận Quyết định Nhanh cho Bài thi AIF-C01

| Yêu cầu nghiệp vụ | Dịch vụ AWS nên chọn | Lý do loại trừ phương án khác |
| :--- | :--- | :--- |
| Trích xuất bảng biểu & ô nhập liệu từ hóa đơn scan | **Amazon Textract** | Rekognition chỉ đọc chữ đơn giản, không hiểu cấu trúc bảng/form |
| Phân tích cảm xúc & che giấu PII trong review text | **Amazon Comprehend** | Translate chỉ dịch; Polly chỉ đọc văn bản |
| Chuyển file ghi âm cuộc gọi thành văn bản có phân biệt người nói | **Amazon Transcribe** | Comprehend không nhận đầu vào audio trực tiếp |
| Tìm kiếm tài liệu nội bộ đa nguồn (S3 + SharePoint + Wiki) | **Amazon Kendra** | OpenSearch thuần cần tự xây dựng connector & pipeline |

---

[← Bài trước](01-ml-fundamentals.md) | [Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/02-aws-managed-ai-services.md) | [Bài tiếp →](03-sagemaker-mlops-pipelines-feature-store.md)
