# Nền tảng AI/ML & Các Dịch vụ AWS AI

Domain 1 chiếm **20%** tỷ trọng bài thi **AWS Certified AI Practitioner (AIF-C01)**. Bạn cần phân biệt rõ các khái niệm cốt lõi (AI, ML, Deep Learning, GenAI), chọn đúng loại học máy cho bài toán nghiệp vụ và ánh xạ chính xác các dịch vụ AWS AI quản lý (Managed AI Services).

## 1. Phân cấp AI, ML, Deep Learning & Các loại Học máy

- **Artificial Intelligence (AI)**: Lĩnh vực rộng nhất mô phỏng trí thông minh con người (bao gồm cả hệ chuyên gia dựa trên luật - rule-based).
- **Machine Learning (ML)**: Nhánh con của AI cho phép máy tính học quy luật từ dữ liệu thay vì lập trình cứng.
- **Deep Learning (DL)**: Nhánh con của ML sử dụng mạng nơ-ron nhiều lớp (Multi-layer Neural Networks) để xử lý dữ liệu phi cấu trúc (ảnh, âm thanh, văn bản).

| Loại Học máy | Dữ liệu đầu vào | Bài toán tiêu biểu | Ví dụ thực tế |
| :--- | :--- | :--- | :--- |
| **Supervised Learning** | **Labeled data** (có nhãn sẵn) | **Classification** (phân loại rời rạc) & **Regression** (dự đoán số liên tục) | Phát hiện gian lận thẻ (Classification); dự đoán giá nhà, doanh thu (Regression) |
| **Unsupervised Learning** | **Unlabeled data** (không có nhãn) | **Clustering** (phân cụm), **Anomaly Detection**, **Dimensionality Reduction** | Phân khúc khách hàng (Customer Segmentation), phát hiện bất thường mạng |
| **Semi-supervised Learning** | Ít dữ liệu có nhãn + nhiều dữ liệu chưa nhãn | Phân loại quy mô lớn khi chi phí gán nhãn cao | Gán nhãn tự động ảnh y tế hoặc tài liệu pháp lý |
| **Reinforcement Learning (RL)** | Tương tác môi trường (**Agent, Action, State, Reward**) | Tối ưu hóa chuỗi quyết định theo phần thưởng dài hạn | Xe tự hành (AWS DeepRacer), robot kho vận, RLHF tinh chỉnh LLM |

> **Exam Tip**: Nếu đề bài nhắc tới *"predict a numerical value / continuous number"* (giá bán, nhiệt độ, sản lượng) $\rightarrow$ **Regression**. Nếu *"categorize into predefined classes / yes-no / fraud vs non-fraud"* $\rightarrow$ **Classification**. Nếu *"discover hidden groups without labeled data"* $\rightarrow$ **Unsupervised Clustering**.

## 2. Khái niệm Dữ liệu, Vòng đời ML (ML Lifecycle) & Chỉ số Đánh giá

### Quy trình ML Lifecycle chuẩn
1. **Business Goal & Problem Framing**: Xác định xem bài toán có thực sự cần ML hay chỉ cần rule-based logic.
2. **Data Collection & Preprocessing**: Thu thập, làm sạch, xử lý missing values, **Feature Engineering** (biến đổi dữ liệu thô thành đặc trưng), chia tập **Train / Validation / Test** (ví dụ 70% / 15% / 15%).
3. **Model Training & Hyperparameter Tuning**: Huấn luyện mô hình, kiểm soát **Overfitting** (học thuộc dữ liệu train nhưng kém trên dữ liệu mới — khắc phục bằng Regularization, thêm dữ liệu, giảm độ phức tạp, Early Stopping) và **Underfitting** (mô hình quá đơn giản).
4. **Evaluation & Deployment**: Đánh giá chỉ số kỹ thuật và nghiệp vụ, triển khai **Real-time Inference** (độ trễ thấp, từng request), **Batch Transform** (xử lý lô dữ liệu lớn định kỳ) hoặc **Serverless/Async Inference**.
5. **Monitoring**: Phát hiện **Data Drift** (phân phối dữ liệu đầu vào thay đổi theo thời gian) và **Model/Concept Drift** bằng **Amazon SageMaker Model Monitor**.

### Chỉ số Đánh giá Quan trọng (Evaluation Metrics)
- **Precision**: Trong các mẫu dự đoán là Dương tính (Positive), bao nhiêu % thực sự đúng? Quan trọng khi **False Positive** tốn kém (ví dụ: lọc email spam — không muốn email quan trọng bị rơi vào spam).
- **Recall (Sensitivity)**: Trong các mẫu thực tế là Dương tính, mô hình tìm ra được bao nhiêu %? Quan trọng khi **False Negative** nguy hiểm (ví dụ: chẩn đoán ung thư, phát hiện gian lận).
- **F1-Score**: Trung bình điều hòa của Precision và Recall — hữu ích khi dữ liệu mất cân bằng (**Imbalanced Dataset**).
- **AUC-ROC**: Khả năng phân biệt giữa các lớp ở nhiều ngưỡng khác nhau.
- **RMSE / MAE / $R^2$**: Dùng cho bài toán **Regression** (sai số càng nhỏ càng tốt với RMSE/MAE).

## 3. Ánh xạ Dịch vụ AWS AI Quản lý (Pre-trained AI Services)

AWS cung cấp các dịch vụ AI sẵn có qua API (không cần kỹ năng ML sâu), giúp rút ngắn thời gian triển khai và giảm chi phí vận hành:

| Dịch vụ AWS | Chức năng chính | Từ khóa nhận diện trong đề thi |
| :--- | :--- | :--- |
| **Amazon Rekognition** | Computer Vision cho ảnh & video | Nhận diện khuôn mặt, vật thể, biển số, kiểm duyệt nội dung (Content Moderation), nhận diện người nổi tiếng |
| **Amazon Textract** | OCR thông minh trích xuất tài liệu | Trích xuất văn bản, **bảng biểu (tables), biểu mẫu (forms/key-value pairs)** từ PDF, hóa đơn, đơn thuế |
| **Amazon Comprehend** | Xử lý ngôn ngữ tự nhiên (NLP) | Phân tích cảm xúc (**Sentiment Analysis**), trích xuất thực thể (Entities), **PII Detection**, phân loại văn bản |
| **Amazon Transcribe** | Speech-to-Text (STT) | Chuyển âm thanh cuộc gọi/video thành văn bản, phân tách người nói, che giấu PII trong bản ghi âm |
| **Amazon Polly** | Text-to-Speech (TTS) | Chuyển văn bản thành giọng nói tự nhiên sống động (Neural Voices), hỗ trợ SSML |
| **Amazon Translate** | Dịch máy thần kinh (Neural MT) | Dịch văn bản đa ngôn ngữ theo thời gian thực hoặc hàng loạt (Batch), hỗ trợ Custom Terminology |
| **Amazon Lex** | Conversational AI (Chatbot/Voicebot) | Xây dựng chatbot hiểu ý định (**Intents**, **Utterances**, **Slots**), tích hợp Amazon Connect |
| **Amazon Kendra** | Enterprise Intelligent Search | Tìm kiếm thông minh nội bộ doanh nghiệp trên S3, SharePoint, Confluence bằng ngôn ngữ tự nhiên |
| **Amazon Personalize** | Hệ thống gợi ý (Recommendations) | Gợi ý sản phẩm/phim cá nhân hóa theo thời gian thực (công nghệ của Amazon.com) |
| **Amazon Fraud Detector** | Phát hiện gian lận trực tuyến | Phát hiện tạo tài khoản giả, thanh toán gian lận dựa trên dữ liệu lịch sử |

## 4. Amazon SageMaker — Nền tảng Xây dựng & Vận hành ML Toàn diện

Khi các dịch vụ AI quản lý không đáp ứng yêu cầu tùy biến, bạn dùng **Amazon SageMaker**:
- **SageMaker Data Wrangler**: Chuẩn bị, trực quan hóa và biến đổi dữ liệu ít code.
- **SageMaker Feature Store**: Kho lưu trữ và chia sẻ tập trung các feature cho cả training (offline) và inference (online).
- **SageMaker Ground Truth**: Gán nhãn dữ liệu (Data Labeling) với nhân lực (Mechanical Turk, đội nội bộ) kết hợp tự động hóa.
- **SageMaker Pipelines**: Xây dựng luồng CI/CD tự động cho ML (**MLOps**).
- **SageMaker Inference Options**:
  - *Real-time Endpoints*: Lưu lượng ổn định, yêu cầu độ trễ mili-giây (payload $\le$ 6 MB).
  - *Serverless Inference*: Lưu lượng không đều, có khoảng nghỉ (chấp nhận cold start).
  - *Asynchronous Inference*: Payload lớn (tới 1 GB), thời gian xử lý lâu (tới 1 giờ), lưu kết quả vào S3.
  - *Batch Transform*: Xử lý dữ liệu lớn ngoại tuyến (offline) không cần endpoint chạy liên tục.

```bash
# Ví dụ gọi Amazon Comprehend phát hiện cảm xúc qua AWS CLI
aws comprehend detect-sentiment \
  --language-code "en" \
  --text "The new delivery service was fast, reliable, and exceeded expectations!"
```

> **Exam Tip**: Đề thi AIF-C01 rất hay bẫy giữa **Amazon Textract** và **Amazon Rekognition**: nếu cần đọc văn bản có cấu trúc từ **hóa đơn, form, bảng biểu (tables/forms)** $\rightarrow$ luôn chọn **Textract**. Nếu chỉ cần đọc chữ đơn giản trên **biển báo đường phố, áo đấu trong ảnh/video** $\rightarrow$ chọn **Rekognition**.

---

[Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/01-ml-basics-lifecycle.md) | [Bài tiếp →](02-aws-managed-ai-services.md)
