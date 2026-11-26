# Cheatsheet 2: Prompting, RAG, Fine-tuning & Responsible AI

## 1. Thang Quyết định Thích ứng Foundation Model (Từ Rẻ đến Đắt)

| Cấp độ | Kỹ thuật | Khi nào chọn? | Có đổi Model Weights? |
| :--- | :--- | :--- | :--- |
| **1 (Ưu tiên đầu)** | **Prompt Engineering** (Zero-shot, Few-shot, CoT) | Cần cải thiện kết quả nhanh, chi phí thấp nhất; định dạng output hoặc suy luận logic từng bước | **Không** |
| **2** | **RAG** (*Knowledge Bases for Bedrock*) | Dữ liệu **thay đổi thường xuyên**, tài liệu nội bộ, cần **trích dẫn nguồn (Citations)** và giảm Hallucination | **Không** |
| **3** | **Instruction Fine-Tuning** | Có tập dữ liệu **có nhãn (Prompt–Completion)** để dạy mô hình **giọng điệu, phong cách, định dạng chuyên biệt** | **Có** |
| **4 (Đắt nhất)** | **Continued Pre-training** | Có kho dữ liệu **không nhãn (Unlabeled)** cực lớn để dạy thuật ngữ chuyên ngành sâu (y tế, luật, tài chính) | **Có** |

> **Exam Tip**: Nếu cần AI **gọi API, tra cứu đơn hàng, đặt vé, thực thi quy trình nhiều bước** $\rightarrow$ Chọn **Agents for Amazon Bedrock** (kết hợp Action Groups + Lambda).

## 2. Inference Parameters & Evaluation Metrics

| Nhóm | Tham số / Metric | Ý nghĩa & Mẹo nhớ thi |
| :--- | :--- | :--- |
| **Inference** | **Temperature** | `0.0` = Xác định, chính xác, ít ảo giác; `1.0` = Sáng tạo, ngẫu nhiên |
| **Inference** | **Top-P / Top-K** | Giảm để thu hẹp tập token ứng viên (an toàn hơn); tăng để câu trả lời đa dạng hơn |
| **Evaluation** | **ROUGE** | Chuyên đánh giá **Tóm tắt văn bản (Summarization)** |
| **Evaluation** | **BLEU** | Chuyên đánh giá **Dịch máy (Machine Translation)** |
| **Evaluation** | **BERTScore** | Đánh giá **độ tương đồng ngữ nghĩa (Semantic Similarity)** |
| **Evaluation** | **Perplexity** | Đo độ tự tin dự đoán token tiếp theo (**càng thấp càng tốt**) |

## 3. Responsible AI & Security Cheat Table

| Yêu cầu trong đề thi | Dịch vụ / Giải pháp AWS |
| :--- | :--- |
| Chặn nội dung độc hại, **Denied Topics**, từ khóa cấm, **che giấu PII**, chống **Prompt Attack**, kiểm tra **Contextual Grounding** | **Amazon Bedrock Guardrails** |
| Phát hiện **Bias** (Pre/Post-training) và giải thích dự đoán mô hình (**Explainability / SHAP**) | **Amazon SageMaker Clarify** |
| Kiểm duyệt thủ công bởi con người khi độ tin cậy thấp (**Human-in-the-Loop**) | **Amazon Augmented AI (A2I)** |
| Tài liệu minh bạch do **AWS cung cấp** cho dịch vụ AI quản lý | **AWS AI Service Cards** |
| Tài liệu quản trị do **khách hàng tạo** cho mô hình ML tùy chỉnh | **Amazon SageMaker Model Cards** |
| Quét tự động phát hiện **PII trong Amazon S3** trước khi train hoặc nạp RAG | **Amazon Macie** |
| Kết nối **riêng tư tới Amazon Bedrock** không đi qua Internet công cộng | **AWS PrivateLink (Interface VPC Endpoint)** |
| Ghi lại lịch sử **gọi API** (ai gọi, lúc nào) | **AWS CloudTrail** |
| Lưu toàn bộ nội dung **prompt & completion** của Bedrock về S3/CloudWatch để kiểm toán | **Bedrock Model Invocation Logging** |
| Tải báo cáo tuân thủ chính thức (**SOC 2, ISO 27001, HIPAA**) | **AWS Artifact** |
| Mã hóa dữ liệu huấn luyện & custom model bằng khóa do khách hàng quản lý | **AWS KMS (Customer Managed Keys)** |

---

[Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md)
