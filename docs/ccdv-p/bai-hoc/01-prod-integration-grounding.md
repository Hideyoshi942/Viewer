# Domain 1: Production Integration, Reliability Patterns & Knowledge Grounding (RAG)

Domain 1 chiếm **20% tỷ trọng đề thi CCDV-P** — phần lớn nhất trong 8 miền kiến thức. Ở cấp độ Professional, bạn không chỉ gọi `messages.create()` thành công, mà phải thiết kế lớp tích hợp chịu lỗi cao (fault-tolerant), chuyển vùng/chuyển nhà cung cấp mượt mà (multi-provider fallback), và xây dựng pipeline RAG có độ chính xác cao với khả năng trích dẫn nguồn (citation grounding) và từ chối trả lời khi thiếu bằng chứng (abstention).

## 1. Reliability Patterns: Retry with Jitter, Circuit Breaker & Idempotency

### 1.1 Retry Strategy: Exponential Backoff + Full Jitter
Khi gọi Claude API ở quy mô lớn, lỗi `429 Too Many Requests` (`rate_limit_error`) và `529 Overloaded` (`overloaded_error`) là điều bình thường. Nếu mọi worker đồng loạt retry sau đúng 1s, 2s, 4s, bạn sẽ tạo ra hiện tượng **Thundering Herd** làm sập hệ thống đang phục hồi.

- **Chỉ retry lỗi transient**: `429`, `500`, `502`, `503`, `529`, network timeout. **Tuyệt đối không retry** `400` (`invalid_request_error`), `401`, `403`, `404`.
- **Tôn trọng `retry-after`**: Nếu response header có `retry-after`, dùng giá trị đó làm sàn tối thiểu trước khi cộng jitter.
- **Full Jitter**: `sleep = random.uniform(0, min(cap, base * 2 ** attempt))`.

### 1.2 Circuit Breaker (Closed → Open → Half-Open)
Retry đơn thuần không đủ khi upstream gặp sự cố kéo dài (outage). Circuit Breaker giúp **fail-fast** để bảo vệ thread pool/worker và kích hoạt fallback sớm:

| Trạng thái | Hành vi | Điều kiện chuyển trạng thái |
| :--- | :--- | :--- |
| **Closed** | Cho phép toàn bộ request đi qua, đếm tỷ lệ lỗi trong sliding window | Tỷ lệ lỗi vượt ngưỡng (ví dụ > 50% trong 20 requests gần nhất) → **Open** |
| **Open** | Chặn ngay lập tức (fail-fast) không gọi API, trả fallback/route sang provider phụ | Hết thời gian `cooldown_seconds` (ví dụ 30s) → **Half-Open** |
| **Half-Open** | Cho phép một số lượng nhỏ request thăm dò (probe requests, ví dụ 3 requests) | Probe thành công → **Closed**; Probe lỗi → quay lại **Open** |

### 1.3 Idempotency Keys cho Side-Effects
Trong các hệ thống bất đồng bộ hoặc retry khi network timeout (client không biết server đã xử lý request chưa), mọi thao tác ghi (billing, tạo ticket, gửi email) kích hoạt bởi Claude hoặc workflow orchestration phải gắn **Idempotency Key** (ví dụ `uuid4` theo `request_id + step_index`) để tránh thực thi trùng lặp.

```python
import random
import time
import anthropic
from enum import Enum

class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"

class AnthropicCircuitBreaker:
    def __init__(self, failure_threshold: int = 5, recovery_timeout: float = 30.0):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failures = 0
        self.state = CircuitState.CLOSED
        self.opened_at = 0.0

    def allow_request(self) -> bool:
        if self.state == CircuitState.CLOSED:
            return True
        if self.state == CircuitState.OPEN:
            if time.monotonic() - self.opened_at >= self.recovery_timeout:
                self.state = CircuitState.HALF_OPEN
                return True
            return False
        return True  # HALF_OPEN cho phép probe

    def record_success(self) -> None:
        self.failures = 0
        self.state = CircuitState.CLOSED

    def record_failure(self) -> None:
        self.failures += 1
        if self.failures >= self.failure_threshold or self.state == CircuitState.HALF_OPEN:
            self.state = CircuitState.OPEN
            self.opened_at = time.monotonic()

def call_with_resilience(client: anthropic.Anthropic, cb: AnthropicCircuitBreaker, **kwargs):
    if not cb.allow_request():
        raise RuntimeError("Circuit OPEN: routing to fallback provider")

    max_attempts = 4
    for attempt in range(max_attempts):
        try:
            resp = client.messages.create(**kwargs)
            cb.record_success()
            return resp
        except anthropic.APIStatusError as e:
            if e.status_code not in (429, 500, 502, 503, 529):
                raise  # Không retry lỗi 4xx client
            if attempt == max_attempts - 1:
                cb.record_failure()
                raise
            retry_after = float(e.response.headers.get("retry-after", 0))
            exp_backoff = min(32.0, (2 ** attempt))
            sleep_time = max(retry_after, random.uniform(0, exp_backoff))
            time.sleep(sleep_time)
```

## 2. Multi-Region & Multi-Provider Fallback (Anthropic API ↔ Bedrock ↔ Vertex AI)

Hệ thống mission-critical yêu cầu SLA 99.9%+ không được phụ thuộc vào một endpoint duy nhất. Anthropic hỗ trợ 3 kênh triển khai chính thức với Anthropic SDK:

1. **Anthropic First-Party API** (`anthropic.Anthropic`)
2. **Amazon Bedrock** (`anthropic.AnthropicBedrock`) — hỗ trợ Cross-Region Inference (`us.anthropic.claude-...`)
3. **Google Cloud Vertex AI** (`anthropic.AnthropicVertex`)

### Quy tắc thiết kế lớp Provider Abstraction
- **Chuẩn hóa Model ID mapping**: Mỗi provider dùng định danh model khác nhau (ví dụ `claude-sonnet-4-20250514` trên 1P vs `anthropic.claude-sonnet-4-20250514-v1:0` trên Bedrock vs `claude-sonnet-4@20250514` trên Vertex).
- **Prompt Caching parity**: Kiểm tra tính tương thích của `cache_control` trên từng provider và region.
- **Health-aware Routing**: Chỉ fallback khi Circuit Breaker của primary mở hoặc gặp `429`/`529` kéo dài; **không** fallback khi gặp `400` (payload lỗi sẽ tiếp tục lỗi ở provider phụ).

## 3. Production RAG: Hybrid Search, Reranking & Contextual Retrieval

RAG ngây thơ (chỉ chunk cố định + vector cosine similarity) thường thất bại với các truy vấn chứa mã lỗi, tên hàm, mã SKU hoặc đoạn văn bản bị mất ngữ cảnh khi tách chunk.

### 3.1 Hybrid Search + Reciprocal Rank Fusion (RRF)
Kết hợp hai cơ chế truy xuất bổ trợ nhau:
- **Dense Retrieval (Vector Embeddings)**: Giỏi nắm bắt ngữ nghĩa đồng nghĩa (semantic similarity).
- **Sparse Retrieval (BM25 / Lexical)**: Giỏi khớp chính xác từ khóa, mã lỗi (`ERR_CONNECTION_REFUSED`), tên API, số hiệu hợp đồng.
- **Reciprocal Rank Fusion (RRF)**: Hợp nhất danh sách xếp hạng mà không cần chuẩn hóa điểm số khác thang đo:
  $$RRF(d) = \sum_{r \in \{BM25, Dense\}} \frac{1}{k + rank_r(d)}$$
  (thường chọn hằng số $k = 60$).

### 3.2 Two-Stage Retrieval với Cross-Encoder Reranking
1. **Stage 1 (Recall-focused)**: Dùng Hybrid Search lấy Top-50 đến Top-100 chunks (nhanh, chi phí thấp).
2. **Stage 2 (Precision-focused)**: Dùng Cross-Encoder Reranker (hoặc Cohere Rerank / BGE Reranker) chấm điểm tương tác trực tiếp giữa `(query, chunk)` để lọc còn **Top-5 đến Top-8 chunks** đưa vào context của Claude.

### 3.3 Contextual Retrieval (Kỹ thuật của Anthropic)
Vấn đề lớn của chunking là **mất ngữ cảnh**: một chunk ghi *"Doanh thu tăng 12% so với quý trước"* không hề cho biết đó là công ty nào, năm nào.
- **Giải pháp**: Trước khi tạo embedding và đánh chỉ mục BM25, dùng một model nhanh/rẻ (như Claude Haiku) kèm **Prompt Caching** trên toàn bộ tài liệu gốc để sinh ra một đoạn tóm tắt ngữ cảnh ngắn (50–100 tokens) gắn vào đầu mỗi chunk:
  `[Context: Đoạn trích từ Báo cáo Tài chính Q3/2025 của Acme Corp, mục Kết quả Kinh doanh] Doanh thu tăng 12% so với quý trước...`
- Theo benchmark của Anthropic, **Contextual Embeddings + Contextual BM25 + Reranking giảm tỷ lệ lỗi truy xuất (retrieval failure rate) tới 67%**.

## 4. Citation Grounding & Abstention (Chống Hallucination)

Trong môi trường doanh nghiệp (pháp lý, y tế, tài chính), câu trả lời sai nguy hiểm hơn nhiều so với việc từ chối trả lời.

- **Strict Grounding Prompting**: Gắn ID duy nhất cho từng chunk (`<doc id="D1" source="policy_v3.pdf">...</doc>`) và bắt buộc Claude chỉ sử dụng thông tin từ các thẻ `<doc>`, trích dẫn inline `[D1]`.
- **Abstention Pattern**: Định nghĩa rõ điều kiện fallback trong system prompt và structured output (`"status": "answered" | "insufficient_evidence"`). Nếu tài liệu không chứa câu trả lời, model phải trả `"insufficient_evidence"` thay vì suy đoán từ kiến thức pre-training.
- **Post-generation Verification**: Kiểm tra tự động xem mọi citation ID mà Claude sinh ra có thực sự tồn tại trong tập retrieved chunks không (chống fabricated citations).

> [!TIP]
> **Exam Tip (CCDV-P):**
> 1. Nếu đề bài mô tả truy vấn người dùng chứa **mã sản phẩm/SKU hoặc mã lỗi chính xác** mà vector search bỏ sót → Đáp án chuẩn là **Hybrid Search (BM25 + Dense) với RRF**.
> 2. Nếu chunk sau khi tách bị thiếu chủ ngữ/thời gian/tài liệu nguồn → Đáp án là **Contextual Retrieval** (tiền xử lý gắn context bằng Haiku + Prompt Caching trước khi index).
> 3. Khi upstream 1P API bị outage kéo dài, cần tránh làm nghẽn worker pool và chuyển sang Bedrock/Vertex → **Circuit Breaker** (không phải chỉ tăng `max_retries`).

---

[Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/01-prod-integration.md) | [Bài tiếp →](02-knowledge-grounding.md)
