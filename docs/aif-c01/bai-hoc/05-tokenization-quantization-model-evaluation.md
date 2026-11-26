# Tokenization, Quantization, Distillation & Đánh giá Mô hình AI/GenAI

Hiểu rõ cách Foundation Model xử lý văn bản (**Tokenization**, **Context Window**, **Embeddings**), kỹ thuật tối ưu tài nguyên (**Quantization**, **Model Distillation**) và cách chọn đúng **Evaluation Metrics** cho từng bài toán là chìa khóa để đạt điểm cao ở Domain 2 và Domain 3 của kỳ thi **AIF-C01**.

## 1. Tokenization, Context Window & Embeddings

- **Tokenization**: LLM không đọc từng ký tự hay từng từ nguyên vẹn mà tách văn bản thành các **token** (thường 1 từ tiếng Anh ≈ 1.3 tokens, hoặc 1 token ≈ 4 ký tự). Chi phí API trên Bedrock và giới hạn độ dài đều tính theo **token**.
- **Context Window**: Tổng số token tối đa (bao gồm **Input Prompt + System Prompt + RAG Context + Output Completion**) mà mô hình có thể xử lý trong một lần gọi. Nếu vượt quá, mô hình sẽ cắt bớt ngữ cảnh cũ hoặc báo lỗi.
- **Embeddings & Cosine Similarity**:
  - **Embedding** là vector số thực (ví dụ 1.024 hoặc 1.536 chiều) biểu diễn **ý nghĩa ngữ nghĩa** của văn bản/hình ảnh. Hai câu đồng nghĩa sẽ nằm gần nhau trong không gian vector.
  - **Cosine Similarity**: Đo góc giữa hai vector (giá trị từ `-1` đến `1`, càng gần `1` càng giống nhau về ngữ nghĩa), không phụ thuộc vào độ dài văn bản — là thước đo phổ biến nhất trong **RAG** và **Semantic Search**.

## 2. Quantization & Model Distillation (Tối ưu Chi phí & Độ trễ)

Khi triển khai mô hình lớn trên **SageMaker** hoặc thiết bị biên (edge), ta thường dùng hai kỹ thuật nén mô hình:

| Kỹ thuật | Nguyên lý hoạt động | Lợi ích & Đánh đổi |
| :--- | :--- | :--- |
| **Quantization (Lượng tử hóa)** | Giảm độ chính xác số học của trọng số (weights) từ **FP32** (32-bit) xuống **FP16/BF16** (16-bit), **INT8** hoặc **INT4** | Giảm mạnh **VRAM/GPU memory**, tăng tốc inference, giảm chi phí; đánh đổi một phần rất nhỏ độ chính xác |
| **Model Distillation (Chưng cất)** | Huấn luyện một **Student model** (nhỏ, nhanh) bắt chước hành vi/output của **Teacher model** (lớn, thông minh) | Tạo ra mô hình nhỏ gọn chạy nhanh, rẻ (ví dụ: dùng Claude Opus tạo dữ liệu dạy cho model nhỏ hơn trên Bedrock Model Distillation) |

> **Exam Tip**: Cần chạy một LLM 70B trên phần cứng GPU nhỏ hơn mà không muốn train lại từ đầu → **Quantization** (ví dụ INT8/INT4). Muốn tạo một model nhỏ hơn hẳn để giảm chi phí & độ trễ cho tác vụ cụ thể nhưng vẫn giữ chất lượng gần bằng model khổng lồ → **Model Distillation**.

## 3. Đánh giá Mô hình Traditional ML

### Bài toán Classification (Phân loại)
Dựa trên **Confusion Matrix** (TP, FP, TN, FN):

| Metric | Công thức / Ý nghĩa | Khi nào ưu tiên metric này |
| :--- | :--- | :--- |
| **Accuracy** | `(TP + TN) / Tổng mẫu` | Dữ liệu **cân bằng** giữa các lớp (tránh dùng khi dữ liệu mất cân bằng như gian lận 1%) |
| **Precision** | `TP / (TP + FP)` | Muốn **giảm False Positive** (ví dụ: lọc Spam — không muốn email quan trọng bị nhầm là Spam) |
| **Recall (Sensitivity)** | `TP / (TP + FN)` | Muốn **giảm False Negative** (ví dụ: chẩn đoán ung thư, phát hiện gian lận — không được bỏ sót ca bệnh) |
| **F1-Score** | Trung bình điều hòa của Precision & Recall | Dữ liệu **mất cân bằng (imbalanced)**, cần cân bằng cả Precision và Recall |
| **AUC-ROC** | Diện tích dưới đường cong ROC (TPR vs FPR) | Đánh giá khả năng phân tách hai lớp ở mọi ngưỡng threshold |

### Bài toán Regression (Hồi quy dự đoán số liên tục)
- **MAE (Mean Absolute Error)**: Trung bình sai số tuyệt đối, dễ hiểu, ít nhạy với ngoại lai (outliers).
- **RMSE (Root Mean Squared Error)**: Phạt nặng các sai số lớn (vì bình phương sai số trước khi lấy căn) — chọn khi sai số lớn gây hậu quả nghiêm trọng.
- **R² (R-Squared)**: Tỷ lệ phương sai của biến mục tiêu được mô hình giải thích (gần `1` là tốt).

## 4. Đánh giá Mô hình Generative AI & LLM

| Metric / Phương pháp | Cơ chế đánh giá | Phù hợp nhất cho tác vụ |
| :--- | :--- | :--- |
| **ROUGE** (`ROUGE-1`, `ROUGE-2`, `ROUGE-L`) | Đo độ trùng lặp **n-gram / chuỗi từ** dựa trên **Recall** so với văn bản mẫu | **Tóm tắt văn bản (Text Summarization)** |
| **BLEU** | Đo độ trùng lặp **n-gram** dựa trên **Precision** so với bản dịch tham chiếu | **Dịch máy (Machine Translation)** |
| **BERTScore** | Dùng **embeddings ngữ nghĩa** (BERT) so sánh câu sinh ra với câu mẫu (hiểu từ đồng nghĩa) | Khi cần đánh giá **ngữ nghĩa** thay vì khớp từ khóa cứng |
| **Perplexity** | Đo mức độ "bối rối" của LLM khi dự đoán token tiếp theo (**càng thấp càng tốt**) | Đánh giá độ trôi chảy ngôn ngữ trong quá trình pre-training |
| **Human Evaluation** | Con người chấm điểm theo tiêu chí (Accuracy, Toxicity, Tone) | Chuẩn vàng cho chất lượng thực tế, nhưng tốn kém và chậm |
| **LLM-as-a-Judge** | Dùng một **LLM mạnh hơn** chấm điểm câu trả lời của LLM khác theo rubric | Tự động hóa đánh giá quy mô lớn trong **Amazon Bedrock Model Evaluation** |

```json
{
  "evaluationTask": "Summarization",
  "recommendedMetric": "ROUGE-L",
  "semanticAlternative": "BERTScore",
  "bedrockFeature": "Amazon Bedrock Model Evaluation (Automatic + Human + LLM-as-a-Judge)"
}
```

> **Exam Tip**: Nhớ cặp từ khóa kinh điển: **Summarization → ROUGE**, **Translation → BLEU**, **Semantic similarity → BERTScore**, **Fluency / next-token uncertainty (lower is better) → Perplexity**.

---

[← Bài trước](04-genai-llms.md) | [Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/05-tokenization-quantization-eval.md) | [Bài tiếp →](06-amazon-q-canvas-partyrock-ecosystem.md)
