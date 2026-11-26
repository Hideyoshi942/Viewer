# Tùy chỉnh Foundation Models: Fine-Tuning, Continued Pre-training & Chi phí

Trong Domain 3 (**Applications of Foundation Models – 28%**), thí sinh cần biết chính xác khi nào nên dừng ở **Prompt Engineering / RAG** và khi nào cần tùy chỉnh trọng số mô hình (**Fine-tuning** hoặc **Continued Pre-training**), đồng thời lựa chọn mô hình tính phí tối ưu trên Amazon Bedrock.

---

## 1. Bậc thang Lựa chọn Chiến lược Tùy chỉnh FM (Từ rẻ đến đắt)

1. **Prompt Engineering** (Zero-shot, Few-shot): Nhanh nhất, rẻ nhất, không cần dữ liệu huấn luyện. Phù hợp khi mô hình đã có sẵn kiến thức nhưng cần định dạng đầu ra cụ thể.
2. **RAG (Retrieval-Augmented Generation)**: Bổ sung **kiến thức nội bộ mới nhất / thay đổi thường xuyên** (chính sách công ty, tồn kho, tài liệu kỹ thuật) với **trích dẫn nguồn**, chi phí thấp hơn Fine-tuning nhiều lần.
3. **Instruction Fine-Tuning (Supervised Fine-Tuning)**: Huấn luyện trên tập dữ liệu **gắn nhãn dạng cặp Prompt–Completion** (JSONL). Dùng khi muốn mô hình học **phong cách trả lời, giọng văn, cấu trúc JSON đặc thù hoặc tác vụ chuyên biệt** mà Few-shot chưa đủ ổn định.
4. **Continued Pre-training (Domain Adaptation)**: Huấn luyện tiếp trên khối lượng lớn **dữ liệu thô chưa gắn nhãn (unlabeled data)** thuộc lĩnh vực chuyên sâu (y khoa, luật, tài chính, mã nguồn nội bộ) để mô hình hiểu từ vựng và ngữ cảnh ngành.

| Tiêu chí | RAG | Instruction Fine-Tuning | Continued Pre-training |
| :--- | :--- | :--- | :--- |
| **Dữ liệu đầu vào** | Tài liệu văn bản (PDF, DOCX, HTML) | **Labeled** Prompt-Response pairs (JSONL) | **Unlabeled** domain corpus lớn |
| **Cập nhật dữ liệu mới** | Rất dễ (chỉ cần sync Vector DB) | Khó (phải train lại model) | Rất khó & tốn kém |
| **Giảm Hallucination kiến thức mới** | **Tốt nhất** (dựa trên ngữ cảnh truy xuất) | Trung bình | Trung bình |
| **Thay đổi hành vi / giọng văn** | Hạn chế | **Tốt nhất** | Tốt cho kiến thức chuyên ngành |

> **Exam Tip**:
> - Đề bài yêu cầu *"give the model access to up-to-date proprietary company documents without retraining"* $\rightarrow$ **RAG**.
> - Đề bài yêu cầu *"adapt the model to a specific output format/tone using labeled prompt-response pairs"* $\rightarrow$ **Instruction Fine-tuning**.
> - Đề bài có *"massive unlabeled domain-specific text (e.g., legal/medical corpus)"* $\rightarrow$ **Continued Pre-training**.

---

## 2. Tối ưu Chi phí Inference trên Amazon Bedrock

| Chế độ Throughput | Cơ chế tính phí | Khi nào sử dụng? |
| :--- | :--- | :--- |
| **On-Demand** | Trả theo từng **Input/Output Token** | Lưu lượng biến động, thử nghiệm, chưa dự đoán được tải |
| **Batch Inference** | Giảm giá (thường ~50%) so với On-Demand, xử lý bất đồng bộ qua S3 | Tóm tắt hàng triệu tài liệu ban đêm, không yêu cầu phản hồi tức thì |
| **Provisioned Throughput** | Cam kết theo giờ (1 tháng / 6 tháng) cho mức Model Units cố định | Lưu lượng lớn ổn định; **BẮT BUỘC** khi deploy **Custom Model** (Fine-tuned / Continued Pre-trained) trên Bedrock |

```json
// Định dạng chuẩn 1 dòng JSONL cho Instruction Fine-Tuning trên Amazon Bedrock
{"prompt": "Tóm tắt điều khoản bảo hành sau trong 1 câu ngắn gọn: ...", "completion": "Sản phẩm được bảo hành 24 tháng đối với lỗi phần cứng từ nhà sản xuất."}
```

---

## 3. Tối ưu Chi phí & Độ trễ bổ sung (Model Selection & Prompt Caching)

- **Model Selection (Right-sizing)**: Không phải tác vụ nào cũng cần mô hình lớn nhất (như Claude Opus/Sonnet). Các tác vụ phân loại đơn giản, tóm tắt ngắn hoặc trích xuất thực thể nên chọn mô hình nhẹ hơn (**Amazon Titan Text Lite/Express**, **Claude Haiku**) để giảm chi phí tới 5–10 lần và giảm độ trễ.
- **Prompt Caching**: Khi hệ thống gửi lặp lại cùng một khối ngữ cảnh lớn (ví dụ System Prompt dài + tài liệu tham chiếu cố định) qua nhiều lượt gọi API, bật **Prompt Caching** trên Amazon Bedrock giúp giảm đáng kể chi phí input token và độ trễ xử lý.
- **Amazon Bedrock Custom Model Import**: Cho phép import trọng số mô hình mã nguồn mở (như Llama, Mistral đã fine-tune trên SageMaker) vào Bedrock để chạy suy luận serverless qua cùng một API.

> **Exam Tip**: Khi đề bài hỏi *"how to reduce Bedrock inference costs for processing 500,000 customer reviews overnight where immediate response is not required"* $\rightarrow$ chọn **Amazon Bedrock Batch Inference**. Nếu hỏi *"run a custom fine-tuned model on Bedrock"* $\rightarrow$ bắt buộc chọn **Provisioned Throughput**.

---

## 4. Tóm tắt Lựa chọn Kỹ thuật theo Yêu cầu

- **Cần dữ liệu mới nhất + trích dẫn nguồn**: RAG (Knowledge Bases for Amazon Bedrock).
- **Cần định dạng/giọng văn riêng từ dữ liệu có nhãn**: Instruction Fine-Tuning.
- **Cần hiểu thuật ngữ chuyên ngành sâu từ dữ liệu thô chưa nhãn**: Continued Pre-training.

---

[← Bài trước](08-bedrock-agents-guardrails-knowledge-bases.md) | [Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/09-fm-customization-finetuning.md) | [Bài tiếp →](10-bedrock-agents-action-groups-flows.md)
