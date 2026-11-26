# Prompt Engineering, RAG & Tùy chỉnh Foundation Models

Domain 3 có tỷ trọng **lớn nhất bài thi (28%)**. Trọng tâm của miền này là biết cách **lựa chọn kỹ thuật thích ứng FM tiết kiệm và hiệu quả nhất** theo đúng thứ tự ưu tiên: **Prompt Engineering $\rightarrow$ RAG $\rightarrow$ Fine-Tuning $\rightarrow$ Continued Pre-training**.

## 1. Kỹ thuật Prompt Engineering

Prompt là đầu vào hướng dẫn FM tạo ra kết quả mong muốn. Một prompt chuẩn thường gồm: **Instruction** (chỉ dẫn), **Context** (ngữ cảnh), **Input Data** (dữ liệu xử lý) và **Output Indicator** (định dạng đầu ra như JSON, Markdown table).

| Kỹ thuật | Mô tả ngắn gọn | Khi nào sử dụng |
| :--- | :--- | :--- |
| **Zero-shot Prompting** | Yêu cầu trực tiếp **không kèm ví dụ** mẫu | Tác vụ đơn giản, tổng quát (tóm tắt, dịch thuật, phân loại cơ bản) |
| **Few-shot Prompting** | Cung cấp **2–5 cặp ví dụ** (input $\rightarrow$ output) trong prompt | Cần định dạng đầu ra nghiêm ngặt, văn phong nhất quán hoặc phân loại theo quy tắc riêng |
| **Chain-of-Thought (CoT)** | Yêu cầu mô hình *"Think step-by-step"* (suy luận từng bước) | Bài toán logic phức tạp, tính toán toán học, phân tích nhiều bước |
| **Role / System Prompting** | Gán vai trò cụ thể (*"You are a senior AWS security architect..."*) | Định hình giọng điệu, phạm vi chuyên môn và ràng buộc hành vi |
| **Negative Prompting** | Chỉ rõ những gì **không được xuất hiện** (rất phổ biến trong sinh ảnh) | Loại bỏ chi tiết thừa trong Stable Diffusion/Titan Image hoặc cấm trả lời ngoài phạm vi |

> **Exam Tip**: Prompt Engineering luôn là lựa chọn **đầu tiên, rẻ nhất và nhanh nhất** để cải thiện chất lượng đầu ra mà không cần thay đổi trọng số mô hình (model weights) hay xây dựng hạ tầng bổ sung.

## 2. Retrieval-Augmented Generation (RAG) & Knowledge Bases for Bedrock

Foundation Models có **Knowledge Cutoff** (không biết dữ liệu mới hoặc tài liệu nội bộ công ty). **RAG** khắc phục điều này bằng cách truy xuất thông tin liên quan theo thời gian thực và đính kèm vào prompt trước khi gửi cho LLM.

### Luồng hoạt động của RAG (2 pha)
1. **Ingestion Pipeline (Nạp dữ liệu)**:
   - Tài liệu nguồn (PDF, Word, HTML trên **Amazon S3**) $\rightarrow$ Chia nhỏ thành các đoạn văn bản (**Chunking**).
   - Dùng **Embedding Model** (ví dụ: *Amazon Titan Text Embeddings*, *Cohere Embed*) chuyển từng chunk thành vector.
   - Lưu vector + metadata vào **Vector Database** (**Amazon OpenSearch Serverless**, **Amazon Aurora PostgreSQL với `pgvector`**, Amazon RDS, Pinecone, Redis Enterprise).
2. **Retrieval & Generation (Truy vấn & Sinh câu trả lời)**:
   - Câu hỏi của người dùng $\rightarrow$ Chuyển thành vector $\rightarrow$ Tìm kiếm độ tương đồng ngữ nghĩa (**Semantic / Vector Similarity Search**) trong Vector DB để lấy top-K đoạn văn bản liên quan nhất.
   - Ghép *Prompt gốc + Top-K ngữ cảnh truy xuất* $\rightarrow$ Gửi tới LLM sinh câu trả lời kèm **trích dẫn nguồn (Citations)**.

**Knowledge Bases for Amazon Bedrock** tự động hóa toàn bộ quy trình RAG trên (chunking, tạo embeddings, đồng bộ S3, lưu vector store và trả về citations) mà không cần viết code tích hợp thủ công.

## 3. So sánh RAG vs Fine-Tuning vs Continued Pre-training

| Tiêu chí | Prompt Engineering | RAG | Fine-Tuning (Instruction-based) | Continued Pre-training |
| :--- | :--- | :--- | :--- | :--- |
| **Thay đổi trọng số (Weights)** | Không | Không | **Có** (tạo bản sao tùy chỉnh) | **Có** (cập nhật sâu) |
| **Dữ liệu yêu cầu** | Vài ví dụ (Text) | Kho tài liệu cập nhật liên tục | **Labeled dataset** (cặp Prompt–Completion) | **Unlabeled dataset** cực lớn chuyên ngành |
| **Chi phí & Độ phức tạp** | Rất thấp | Trung bình | Cao | Rất cao |
| **Use case tốt nhất** | Điều chỉnh định dạng, tác vụ cơ bản | Dữ liệu thay đổi thường xuyên, giảm Hallucination, cần nguồn trích dẫn | Học **phong cách, giọng điệu, định dạng đặc thù** hoặc tác vụ chuyên biệt | Dạy mô hình **ngôn ngữ/thuật ngữ chuyên ngành sâu** (y khoa, tài chính, luật) |

> **Exam Tip**:
> - Dữ liệu thay đổi hàng ngày/hàng giờ (chính sách công ty, tồn kho, tin tức) $\rightarrow$ **Bắt buộc chọn RAG**, KHÔNG chọn Fine-tuning!
> - Cần mô hình phản hồi theo đúng văn phong/cấu trúc đặc thù của doanh nghiệp dựa trên tập cặp câu hỏi–đáp mẫu có nhãn $\rightarrow$ **Instruction Fine-tuning**.
> - Có hàng triệu tài liệu **không gán nhãn (unlabeled)** thuộc lĩnh vực đặc thù (ví dụ: báo cáo tài chính SEC, hồ sơ sinh học) $\rightarrow$ **Continued Pre-training**.

## 4. Agents for Amazon Bedrock

Khi người dùng không chỉ muốn *hỏi thông tin* mà muốn AI **thực hiện hành động (take actions)** đa bước (ví dụ: kiểm tra đơn hàng, hủy vé máy bay, gọi API nội bộ, đặt lịch hẹn), ta dùng **Agents for Amazon Bedrock**:
- Sử dụng kỹ thuật **ReAct (Reasoning and Acting)** để tự động chia nhỏ yêu cầu phức tạp thành chuỗi bước thực thi.
- Kết hợp **Action Groups** (định nghĩa bằng OpenAPI Schema và thực thi qua **AWS Lambda**) để gọi API hệ thống bên ngoài.
- Có thể tích hợp đồng thời với **Knowledge Bases** để vừa tra cứu tài liệu vừa thực thi giao dịch.

## 5. Đánh giá Chất lượng Mô hình (Model Evaluation)

Trong **Amazon Bedrock Model Evaluation**, bạn có thể đánh giá FM theo 3 cách: **Automatic Evaluation**, **Human Evaluation** (đội ngũ nội bộ hoặc AWS managed workforce) và **LLM-as-a-Judge**.

- **ROUGE (Recall-Oriented Understudy for Gisting Evaluation)**: Đo độ trùng lặp n-gram với bản mẫu — chuyên dùng cho **Text Summarization** (tóm tắt văn bản).
- **BLEU (Bilingual Evaluation Understudy)**: Đo độ chính xác n-gram — chuyên dùng cho **Machine Translation** (dịch máy).
- **BERTScore**: So sánh **độ tương đồng ngữ nghĩa (semantic similarity)** bằng embeddings thay vì khớp từ chính xác từng chữ.
- **Perplexity**: Đo mức độ "bối rối" của mô hình ngôn ngữ khi dự đoán token tiếp theo (giá trị **càng thấp càng tốt**).

```json
// Ví dụ định dạng dữ liệu JSONL cho Instruction Fine-tuning trên Amazon Bedrock
{"prompt": "Classify the customer ticket priority: My payment failed twice.", "completion": "HIGH"}
{"prompt": "Classify the customer ticket priority: Where can I download my invoice?", "completion": "LOW"}
```

---

[← Bài trước](06-amazon-q-canvas-partyrock-ecosystem.md) | [Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/07-prompt-engineering.md) | [Bài tiếp →](08-bedrock-agents-guardrails-knowledge-bases.md)
