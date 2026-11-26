# Cheatsheet 1: AWS AI/ML & GenAI Service Selector

## 1. Bảng Tra cứu Nhanh Dịch vụ AWS AI (Managed AI Services)

| Nhu cầu / Bài toán trong đề thi | Chọn Dịch vụ AWS | Tránh nhầm lẫn với |
| :--- | :--- | :--- |
| Trích xuất văn bản, **bảng biểu (tables), form (key-value)** từ PDF/hóa đơn scan | **Amazon Textract** | Rekognition (chỉ đọc chữ đơn giản trên ảnh cảnh vật) |
| Nhận diện khuôn mặt, vật thể, biển số, **kiểm duyệt nội dung ảnh/video** | **Amazon Rekognition** | Textract |
| Phân tích cảm xúc (**Sentiment**), trích xuất thực thể, chủ đề, ngôn ngữ, **PII trong văn bản** | **Amazon Comprehend** | Macie (chuyên quét PII trên S3 bucket) |
| Chuyển **giọng nói thành văn bản** (Speech-to-Text), tách người nói, che PII trong audio | **Amazon Transcribe** | Polly (ngược lại: Text-to-Speech) |
| Chuyển **văn bản thành giọng nói** tự nhiên (Text-to-Speech, SSML, Neural Voices) | **Amazon Polly** | Transcribe |
| **Dịch ngôn ngữ** thời gian thực hoặc theo lô (Batch) | **Amazon Translate** | Comprehend |
| Xây dựng **Chatbot / Voicebot** theo luồng Intents & Slots | **Amazon Lex** | Amazon Q Business (trợ lý GenAI tìm kiếm tri thức doanh nghiệp) |
| Tìm kiếm thông minh nội bộ (**Enterprise Search**) kết nối SharePoint, S3, Confluence | **Amazon Kendra** | OpenSearch (tự vận hành search/vector engine) |
| Gợi ý sản phẩm/nội dung **cá nhân hóa** theo thời gian thực | **Amazon Personalize** | Bedrock |
| Phát hiện **gian lận** thanh toán/tạo tài khoản trực tuyến | **Amazon Fraud Detector** | GuardDuty (bảo mật hạ tầng AWS) |

## 2. Bảng Chọn Dịch vụ Generative AI & Custom ML

| Tình huống sử dụng | Dịch vụ tối ưu | Lý do cốt lõi |
| :--- | :--- | :--- |
| Truy cập nhiều FM hàng đầu qua **1 API Serverless**, không quản lý hạ tầng | **Amazon Bedrock** | Managed, bảo mật cao, hỗ trợ Knowledge Bases, Agents, Guardrails |
| Triển khai nhanh **FM mã nguồn mở** (Hugging Face, Llama) và **kiểm soát sâu hạ tầng GPU/VPC** | **Amazon SageMaker JumpStart** | Toàn quyền chọn EC2 instance, chỉnh sửa script training/inference |
| Trợ lý GenAI sẵn dùng cho nhân viên hỏi đáp tài liệu nội bộ **tôn trọng quyền ACL** | **Amazon Q Business** | Không cần tự code RAG, tích hợp hơn 40 data connectors |
| Trợ lý AI viết code, giải thích code, quét bảo mật, **nâng cấp Java/.NET** | **Amazon Q Developer** | Chuyên biệt cho SDLC & lập trình viên |
| Thử nghiệm nhanh ý tưởng GenAI **không cần code (No-code playground)** | **PartyRock** | Giao diện kéo thả chạy trên Amazon Bedrock |
| Gán nhãn dữ liệu huấn luyện (Data Labeling) | **SageMaker Ground Truth** | Kết hợp nhân sự + active learning tự động |
| Giảm chi phí **Training** Deep Learning / LLM quy mô lớn | **AWS Trainium** | Chip tăng tốc chuyên dụng cho Training |
| Giảm chi phí & độ trễ **Inference** Deep Learning / LLM quy mô lớn | **AWS Inferentia** | Chip tăng tốc chuyên dụng cho Inference |

## 3. Chọn Loại Học máy & Chỉ số Đánh giá

- **Supervised Learning (Có nhãn)**:
  - Dự đoán nhãn rời rạc (Spam/Not Spam, Churn/Stay) $\rightarrow$ **Classification** (Metrics: *Precision, Recall, F1, AUC-ROC*).
  - Dự đoán số liên tục (Giá nhà, doanh thu, nhiệt độ) $\rightarrow$ **Regression** (Metrics: *RMSE, MAE, $R^2$*).
- **Unsupervised Learning (Không nhãn)**: Phân cụm khách hàng (**Clustering**), phát hiện bất thường (**Anomaly Detection**).
- **Reinforcement Learning**: Agent học qua **Reward/Penalty** từ môi trường (DeepRacer, RLHF).
- **SageMaker Inference**:
  - Latency thấp liên tục $\rightarrow$ **Real-time**.
  - Traffic thất thường, có khoảng nghỉ $\rightarrow$ **Serverless**.
  - Payload lớn ($\le$ 1 GB), xử lý lâu $\rightarrow$ **Asynchronous**.
  - Xử lý lô dữ liệu offline $\rightarrow$ **Batch Transform**.

---

[Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md)
