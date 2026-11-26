# SageMaker Clarify, Model Cards, Bedrock Guardrails & Amazon A2I

Domain 4 (**Guidelines for Responsible AI – 14%**) kiểm tra khả năng áp dụng đúng các công cụ của AWS để phát hiện sai lệch (Bias), giải thích mô hình (Explainability), kiểm duyệt nội dung (Guardrails) và đưa con người vào vòng lặp kiểm soát (**Human-in-the-loop**).

---

## 1. Bộ công cụ Responsible AI trên AWS

| Công cụ AWS | Chức năng chính | Giai đoạn áp dụng |
| :--- | :--- | :--- |
| **Amazon SageMaker Clarify** | Phát hiện **Pre-training Bias** (dữ liệu) & **Post-training Bias** (dự đoán); giải thích đóng góp của từng feature bằng **SHAP values** | Data Prep, Training, Evaluation & Monitoring |
| **Amazon SageMaker Model Cards** | Tài liệu hóa chuẩn hóa về mục đích sử dụng, dữ liệu train, giới hạn, chỉ số đánh giá & rủi ro của mô hình | Governance & Audit Compliance |
| **Amazon Bedrock Guardrails** | Lọc nội dung độc hại (Hate, Violence), **Denied Topics**, **PII Redaction**, **Contextual Grounding Check** (chống Hallucination trong RAG) | Runtime Inference (Input & Output của FM) |
| **Amazon Augmented AI (A2I)** | Đưa con người (**Human Review**) vào kiểm tra khi độ tin cậy (Confidence Score) của dự đoán dưới ngưỡng cho phép | Post-inference Human-in-the-loop |

> **Exam Tip**:
> - Cần **giải thích tại sao mô hình từ chối hồ sơ vay vốn** (feature importance / SHAP) hoặc **kiểm tra sai lệch giới tính/độ tuổi trong tập dữ liệu** $\rightarrow$ **Amazon SageMaker Clarify**.
> - Cần **lưu trữ hồ sơ minh bạch (documentation) cho kiểm toán viên về mục đích, giới hạn và kết quả test của mô hình** $\rightarrow$ **SageMaker Model Cards**.
> - Cần **chặn chủ đề tư vấn tài chính/chính trị hoặc phát hiện câu trả lời bịa đặt (hallucination) không bám sát tài liệu RAG** $\rightarrow$ **Amazon Bedrock Guardrails (Contextual Grounding)**.
> - Cần **nhân viên kiểm tra thủ công những hóa đơn Textract đọc ra với confidence < 80%** $\rightarrow$ **Amazon Augmented AI (A2I)**.

---

## 2. Cấu hình Bảo vệ Đa lớp với Bedrock Guardrails

1. **Content Filters**: Điều chỉnh ngưỡng chặn (`NONE`, `LOW`, `MEDIUM`, `HIGH`) cho Hate, Insults, Sexual, Violence, Misconduct và **Prompt Attack** (chống Jailbreak/Prompt Injection).
2. **Denied Topics**: Định nghĩa các chủ đề cấm bằng ngôn ngữ tự nhiên (ví dụ: *"Do not provide medical diagnoses or prescription advice"*).
3. **Sensitive Information Filters (PII)**: Tự động chặn (`BLOCK`) hoặc che giấu (`ANONYMIZE` thành `{NAME}`, `{SSN}`) thông tin nhạy cảm bằng Regex hoặc bộ lọc có sẵn.
4. **Contextual Grounding Check**: Chấm điểm **Grounding** (có bám sát tài liệu nguồn RAG không) và **Relevance** (có trả lời đúng trọng tâm câu hỏi không) để loại bỏ Hallucination trước khi trả về cho người dùng.

```python
import boto3

bedrock_runtime = boto3.client("bedrock-runtime", region_name="us-east-1")
response = bedrock_runtime.converse(
    modelId="anthropic.claude-3-5-sonnet-20240620-v1:0",
    messages=[{"role": "user", "content": [{"text": "Tóm tắt chính sách hoàn tiền."}]}],
    guardrailConfig={
        "guardrailIdentifier": "abc123def456",
        "guardrailVersion": "1"
    }
)
```

---

## 3. AWS AI Service Cards vs. SageMaker Model Cards

| Tiêu chí | AWS AI Service Cards | Amazon SageMaker Model Cards |
| :--- | :--- | :--- |
| **Ai tạo?** | **AWS phát hành sẵn** | **Khách hàng tự tạo** cho mô hình của mình |
| **Đối tượng áp dụng** | Các dịch vụ AI quản lý (Rekognition, Textract, Transcribe...) | Mô hình ML tùy chỉnh train trên SageMaker |
| **Mục đích** | Công khai mục đích sử dụng khuyến nghị, giới hạn kỹ thuật & thực hành công bằng | Lưu trữ hồ sơ quản trị, rủi ro, dữ liệu train & kết quả đánh giá phục vụ kiểm toán |

---

[← Bài trước](11-responsible-ai.md) | [Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/12-clarify-model-cards-a2i.md) | [Bài tiếp →](13-ai-security-governance.md)
