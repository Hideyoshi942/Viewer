# Amazon Bedrock Chuyên sâu: Knowledge Bases, Agents, Guardrails, Flows & Throughput

**Amazon Bedrock** là dịch vụ serverless trung tâm của đề thi **AIF-C01**. Để trả lời chính xác các câu hỏi tình huống ở Domain 3 (chiếm 28% điểm số), bạn cần nắm vững cách Bedrock kết hợp **Knowledge Bases (RAG)**, **Agents**, **Guardrails**, **Flows** và các mô hình tính phí **Throughput**.

## 1. Amazon Bedrock Knowledge Bases (Managed RAG)

**Knowledge Bases for Amazon Bedrock** tự động hóa toàn bộ pipeline RAG: đọc tài liệu từ **Amazon S3**, chia nhỏ (chunking), tạo vector embedding (ví dụ Titan Embeddings), lưu vào Vector DB và truy vấn kèm **trích dẫn nguồn (citations)**.

### Chiến lược Chunking (Chunking Strategies)

| Chiến lược | Cơ chế hoạt động | Khi nào sử dụng |
| :--- | :--- | :--- |
| **Default / Fixed-size** | Cắt theo số token cố định (kèm overlap %) | Tài liệu đồng nhất, thiết lập nhanh mặc định |
| **Hierarchical** | Chia thành **Parent chunk** (ngữ cảnh rộng) & **Child chunk** (tìm kiếm chính xác) | Tài liệu kỹ thuật dài cần vừa tìm chính xác vừa giữ ngữ cảnh |
| **Semantic** | Dùng embedding model cắt theo **ngữ nghĩa / chủ đề** | Văn bản đa chủ đề, tránh cắt ngang ý nghĩa câu/đoạn |
| **No chunking** | Giữ nguyên mỗi file là 1 chunk | File ngắn (FAQ, email, record JSON nhỏ) |

- **Vector Databases được hỗ trợ**: **Amazon OpenSearch Serverless** (mặc định được Bedrock tự tạo), **Amazon Aurora PostgreSQL (`pgvector`)**, **Pinecone**, **Redis Enterprise Cloud**, **MongoDB Atlas**.
- **Reranking**: Sử dụng mô hình rerank (như Cohere Rerank) để sắp xếp lại top-k đoạn văn bản truy xuất được theo mức độ liên quan thực sự với câu hỏi trước khi đưa vào LLM, giúp tăng độ chính xác của RAG.

## 2. Amazon Bedrock Agents

**Bedrock Agents** cho phép Foundation Model không chỉ trả lời văn bản mà còn **tự động lập kế hoạch và thực thi tác vụ đa bước** thông qua API nội bộ và hệ thống doanh nghiệp:

- **Cơ chế ReAct (Reasoning + Acting)**: Agent phân tích yêu cầu người dùng → suy luận bước cần làm → gọi **Action Group** hoặc truy vấn **Knowledge Base** → quan sát kết quả → lặp lại cho đến khi hoàn tất.
- **Action Groups**: Định nghĩa các hành động mà Agent có thể gọi, gắn với **AWS Lambda** (thực thi logic) và mô tả bằng **OpenAPI Schema** (hoặc Function Details) để LLM hiểu tham số đầu vào/đầu ra.
- **Memory**: Hỗ trợ lưu giữ ngữ cảnh hội thoại qua nhiều phiên (cross-session memory) cho các tác vụ cá nhân hóa dài hạn.

```yaml
# Trích đoạn OpenAPI Schema cho Action Group của Bedrock Agent
paths:
  /orders/{orderId}:
    get:
      summary: "Retrieve customer order status by orderId"
      parameters:
        - name: orderId
          in: path
          required: true
          schema:
            type: string
```

## 3. Amazon Bedrock Guardrails

**Bedrock Guardrails** cung cấp lớp bảo vệ độc lập với model (áp dụng cho cả FM trên Bedrock lẫn custom/external model qua `ApplyGuardrail` API):

| Tính năng Guardrail | Tác dụng chính |
| :--- | :--- |
| **Content Filters** | Chặn nội dung độc hại theo mức độ (Hate, Insults, Sexual, Violence, Misconduct) & **Prompt Attacks** (chống Prompt Injection / Jailbreak) |
| **Denied Topics** | Từ chối các chủ đề nhạy cảm theo nghiệp vụ (ví dụ: cấm chatbot ngân hàng tư vấn đầu tư cổ phiếu) |
| **Sensitive Information Filters (PII)** | Tự động **Block** hoặc **Mask/Redact** (ví dụ `[EMAIL]`, `[SSN]`) thông tin cá nhân bằng Regex hoặc bộ lọc có sẵn |
| **Word Filters** | Chặn từ khóa tùy chỉnh hoặc tên đối thủ cạnh tranh |
| **Contextual Grounding Check** | Kiểm tra câu trả lời có bám sát nguồn RAG hay không (**Grounding** & **Relevance score**), giúp **giảm Hallucination** |

> **Exam Tip**: Gặp tình huống *"ngăn chatbot tài chính đưa ra lời khuyên đầu tư"* → **Denied Topics**. Gặp *"ẩn số thẻ tín dụng/email trước khi trả về cho người dùng"* → **PII Redaction**. Gặp *"kiểm tra câu trả lời RAG có bịa đặt so với tài liệu gốc không"* → **Contextual Grounding Check**.

## 4. Bedrock Flows, Prompt Management & Tùy chọn Throughput

- **Bedrock Prompt Management**: Quản lý phiên bản (versioning), lưu trữ template prompt có biến (`{{topic}}`) và so sánh kết quả giữa các model.
- **Bedrock Flows**: Công cụ thiết kế trực quan (visual workflow builder) nối các node: Prompt → Knowledge Base → Condition → Lambda → Lex/Output để xây dựng ứng dụng GenAI phức tạp ít code.

| Chế độ Throughput | Mô hình tính phí | Khi nào lựa chọn |
| :--- | :--- | :--- |
| **On-Demand** | Trả theo **token** input/output (`pay-as-you-go`) | Traffic biến động, giai đoạn thử nghiệm/dev, không cần cam kết |
| **Provisioned Throughput** | Thuê theo **Model Units (MU)** theo giờ/tháng (1, 6 tháng) | Lưu lượng lớn ổn định, cần **đảm bảo TPS/latency**, hoặc **bắt buộc** để chạy **Custom Fine-tuned Model** |
| **Batch Inference** | Giảm giá (thường ~50%) so với On-Demand | Xử lý hàng loạt file JSONL từ S3 (tóm tắt tài liệu đêm, gắn thẻ dữ liệu), không cần real-time |

> **Exam Tip**: Trên Amazon Bedrock, sau khi **Fine-tune** hoặc **Continued Pre-training** một mô hình tùy chỉnh, bạn **bắt buộc** phải mua **Provisioned Throughput** để host và gọi inference cho mô hình đó.

---

[← Bài trước](07-prompt-rag-finetuning.md) | [Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/08-rag-knowledge-bases.md) | [Bài tiếp →](09-fm-customization-cost-optimization.md)
