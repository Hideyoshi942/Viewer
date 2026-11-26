# Chủ đề 2: Enterprise Knowledge Grounding (Hybrid Search, Contextual Retrieval & Citations)

Trong **Domain 1 (20%)**, khả năng thiết kế tầng tích hợp chịu lỗi chỉ là nửa đầu bài toán; nửa còn lại quyết định độ tin cậy của hệ thống doanh nghiệp là **Enterprise Knowledge Grounding**. RAG ngây thơ (fixed-size chunking + pure vector search) thường thất bại khi gặp mã lỗi kỹ thuật, tên hàm, mã SKU hoặc các đoạn văn bản bị tách rời khỏi ngữ cảnh gốc.

## 1. Hybrid Search (BM25 + Dense Vector) & Reciprocal Rank Fusion (RRF)

Không một cơ chế tìm kiếm đơn lẻ nào tối ưu cho mọi loại truy vấn:
- **Dense Vector Retrieval (Embeddings)**: Giỏi nắm bắt ngữ nghĩa đồng nghĩa (ví dụ *"không kết nối được cơ sở dữ liệu"* khớp với *"database connection timeout"*), nhưng yếu với mã định danh chính xác.
- **Sparse Lexical Retrieval (BM25)**: Giỏi khớp chính xác từ khóa, mã lỗi (`ERR_OOM_KILLED`), số hợp đồng (`HD-2026-089`), tên symbol trong code.

### Hợp nhất kết quả bằng Reciprocal Rank Fusion (RRF)
Điểm cosine similarity của vector search và điểm BM25 không cùng thang đo nên không thể cộng trực tiếp. **RRF** chuẩn hóa dựa trên thứ hạng (rank) của tài liệu $d$ trong từng danh sách:

$$RRF(d) = \sum_{r \in \{BM25, Dense\}} \frac{1}{k + rank_r(d)}$$

Với hằng số làm mượt thường dùng $k = 60$, tài liệu xuất hiện ở thứ hạng cao trong cả hai bộ tìm kiếm sẽ được đẩy lên đầu danh sách.

```python
def reciprocal_rank_fusion(bm25_ids: list[str], dense_ids: list[str], k: int = 60) -> list[tuple[str, float]]:
    scores: dict[str, float] = {}
    for rank, doc_id in enumerate(bm25_ids, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    for rank, doc_id in enumerate(dense_ids, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)
```

## 2. Two-Stage Retrieval với Cross-Encoder Reranking

Bi-encoder (embedding) nén cả đoạn văn thành 1 vector độc lập với câu hỏi nên mất thông tin tương tác chi tiết giữa các từ. Kiến trúc chuẩn production tách làm 2 pha:
1. **Stage 1 (Recall-focused)**: Chạy Hybrid Search + RRF để lấy **Top-50 đến Top-100 chunks** với độ trễ thấp.
2. **Stage 2 (Precision-focused)**: Đưa Top-50 qua **Cross-Encoder Reranker** (như Cohere Rerank hoặc BGE-Reranker) để chấm điểm tương tác trực tiếp cặp `(query, chunk)` và chỉ giữ lại **Top-5 đến Top-8 chunks** chất lượng nhất đưa vào context window của Claude.

## 3. Contextual Retrieval (Chuẩn Anthropic)

Khi cắt tài liệu dài thành các chunk 300–500 tokens, thông tin định danh thường biến mất. Ví dụ một chunk chỉ ghi: *"Biên lợi nhuận ròng tăng 4.2% so với quý trước nhờ tối ưu chi phí hạ tầng."* — không hề rõ công ty nào, quý nào, năm nào.

### Quy trình Contextual Retrieval
Trước khi tạo embedding và đánh chỉ mục BM25, dùng **Claude Haiku** kết hợp **Prompt Caching** trên toàn bộ tài liệu gốc để sinh một đoạn ngữ cảnh ngắn (50–100 tokens) gắn vào đầu mỗi chunk:
- Toàn bộ tài liệu gốc nằm trong `system` (hoặc đầu `user` message) với `cache_control: {"type": "ephemeral"}`.
- Với mỗi chunk, chỉ gửi chunk nhỏ đó yêu cầu Haiku viết phần dẫn ngữ cảnh, tận dụng cache hit 90% cho tài liệu gốc.
- Ghép `contextualized_chunk = context_prefix + "\n\n" + original_chunk`, sau đó mới tạo Dense Embedding và BM25 Index.

Theo benchmark của Anthropic, **Contextual Embeddings + Contextual BM25 + Reranking** giúp giảm **tỷ lệ lỗi truy xuất (retrieval failure rate) tới 67%**.

## 4. Citations API, Grounding & Abstention

Trong lĩnh vực pháp lý, tài chính, y tế, câu trả lời bịa đặt (hallucination) gây rủi ro nghiêm trọng hơn nhiều so với việc từ chối trả lời:

- **Anthropic Citations API**: Khi truyền tài liệu qua `document` blocks với `"citations": {"enabled": true}`, Claude tự động trả về các block trích dẫn kèm vị trí chính xác (`cited_text`, `document_index`, `start_char_index`, `end_char_index` hoặc số trang PDF) giúp UI highlight nguồn trực tiếp mà không tốn output token để chép lại nguyên văn.
- **Strict Grounding & Abstention**: Quy định rõ trong System Prompt và Structured Output trạng thái `"insufficient_evidence"`. Nếu các chunk truy xuất không chứa bằng chứng trực tiếp, Claude bắt buộc phải từ chối thay vì suy đoán từ kiến thức pre-training.
- **Post-generation Verification**: Luôn kiểm tra ở tầng ứng dụng xem mọi `document_index` / `doc_id` được trích dẫn có thực sự thuộc tập retrieved chunks của request đó không.

```python
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "document",
                    "source": {"type": "text", "media_type": "text/plain", "data": chunk_text},
                    "title": "SLA_Policy_2026.txt",
                    "citations": {"enabled": True},
                },
                {"type": "text", "text": "What is the uptime SLA for Enterprise tier?"},
            ],
        }
    ],
)
```

> [!TIP]
> **Exam Tip (CCDV-P):**
> 1. Truy vấn chứa mã lỗi/SKU chính xác mà Vector Search bỏ sót → **Hybrid Search (BM25 + Dense) + RRF**.
> 2. Chunk bị mất ngữ cảnh chủ ngữ/thời gian khi cắt nhỏ → **Contextual Retrieval** (dùng Haiku + Prompt Caching tiền xử lý trước khi index).
> 3. Cần highlight chính xác đoạn nguồn trong tài liệu gốc mà không tốn thêm output token sinh lại nguyên văn → Dùng **Anthropic Citations API** (`citations: {"enabled": true}`).

---

[← Bài trước](01-prod-integration-grounding.md) | [Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/02-knowledge-grounding.md) | [Bài tiếp →](03-agent-orchestration-state.md)
