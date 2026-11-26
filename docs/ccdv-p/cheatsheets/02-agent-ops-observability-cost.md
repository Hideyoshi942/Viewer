# Cheatsheet 2: Observability, EvalOps, Agent Fleet & Cost Optimization

Tổng hợp nhanh các chuẩn telemetry, quy trình đánh giá tự động, vận hành đội agent CI/CD và chiến lược tối ưu chi phí/độ trễ cho **Domain 3 (12%)**, **Domain 4 (12%)**, **Domain 7 (10%)** và **Domain 8 (8%)** — chiếm **42% tổng điểm bài thi CCDV-P**.

## 1. Observability & Distributed Tracing (Domain 3)

| Hạng mục | Chuẩn / Công thức / Quy tắc |
| :--- | :--- |
| **OTel GenAI Attributes** | `gen_ai.system`, `gen_ai.request.model`, `gen_ai.response.finish_reasons`, `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`, `gen_ai.usage.cache_read.input_tokens`, `gen_ai.usage.cache_creation.input_tokens` |
| **Trace Propagation** | Truyền W3C `traceparent` qua mọi HTTP/MCP call và inject vào message headers của Async Queue (SQS/Kafka) |
| **TTFT** (Time to First Token) | Thời gian tới `content_block_delta` đầu tiên — tối ưu bằng Prompt Caching & routing sang Haiku |
| **TPOT** (Time Per Output Token) | `(E2E_Latency - TTFT) / (output_tokens - 1)` — đo tốc độ sinh token |
| **ITL** (Inter-Token Latency) | Khoảng trễ giữa 2 token liên tiếp — tăng cao khi upstream quá tải |
| **Audit vs Debug Logs** | Audit log (JSON có cấu trúc, redact PII/secrets) lưu dài hạn; Debug payload full-text chỉ sampling/TTL ngắn và mã hóa riêng |

## 2. Evaluation Engineering & QA (Domain 4)

### Nguyên tắc chọn Grader
- **Deterministic Grader (Ưu tiên #1)**: Dùng cho JSON Schema, Regex, AST, Unit Test, Exact Match, Citation ID verification → Nhanh, miễn phí, 0% variance.
- **LLM-as-a-Judge (Ưu tiên #2)**: Dùng cho Faithfulness, Relevance, Tone, Rubric chấm điểm ngữ nghĩa → Luôn yêu cầu field `reasoning` trước `score`.

### Bias Mitigation & Release Gates
| Thiên kiến / Kỹ thuật | Giải pháp chuẩn |
| :--- | :--- |
| **Position Bias** | **Pairwise Swapping** — chạy 2 lượt `(A, B)` và `(B, A)`, chỉ tính thắng nếu nhất quán cả 2 chiều |
| **Verbosity Bias** | Phạt dư thừa trong rubric, chấm theo atomic checklist |
| **Self-Enhancement Bias** | Hiệu chuẩn (calibrate) Judge với tập nhãn của chuyên gia người thật (Cohen's Kappa) |
| **CI/CD Fast Gate** | Chạy 100% deterministic + core sample qua **Message Batches API** trên mỗi PR; block merge nếu tụt ngưỡng |
| **Shadow Deployment** | Nhân bản traffic thật gửi bất đồng bộ sang bản mới để đo chất lượng/latency mà **không ảnh hưởng user** |

## 3. Agent Fleet Operations (Domain 7)

| Công cụ / Pattern | Mục đích & Lệnh chuẩn |
| :--- | :--- |
| **`git worktree`** | Cô lập thư mục & branch cho nhiều coding agent chạy song song trên cùng repo mà không xung đột working tree |
| **Headless CI (`claude -p`)** | `claude -p "<task>" --output-format json --allowedTools "Read,Grep,Glob,Bash(pytest:*)" --max-turns 15` |
| **Sandbox Isolation** | Ephemeral Container/MicroVM, không mount `~/.ssh` hay `~/.aws`, hạn chế network egress khi chạy PR từ fork ngoài |
| **Human Review Gates** | Agent không bao giờ tự push thẳng `main` hoặc tự approve; bắt buộc qua CI checks + `CODEOWNERS` review |

## 4. Cost & Latency Optimization at Scale (Domain 8)

### Thứ tự bắt buộc để tối đa Prompt Cache Hit Ratio
1. `tools` (tĩnh) → 2. `system` (tĩnh, không chứa timestamp/UUID động) → 3. Static Docs / Few-shots (đặt `cache_control: {"type": "ephemeral"}` ở cuối) → 4. Dynamic User Query.
- **Ngưỡng tối thiểu**: **1,024 tokens** (Sonnet/Opus) hoặc **2,048 tokens** (Haiku). TTL mặc định **5 phút** (auto-refresh khi hit; có tùy chọn 1 giờ).
- **Lợi ích**: Giảm **90%** chi phí input tokens trúng cache và giảm mạnh **TTFT**.

### Tiered Routing & Batching Matrix
| Chiến lược | Khi nào áp dụng | Hiệu quả |
| :--- | :--- | :--- |
| **Tiered Routing** | Traffic hỗn hợp từ dễ đến khó | **Haiku** (router/classifier/extraction) → **Sonnet** (default RAG/coding/agent) → **Opus** (suy luận sâu/escalation) |
| **Message Batches API** | Offline / Async workloads (evals, bulk labeling) | **Giảm 50% chi phí**, SLA **≤ 24h**, tối đa **100,000 requests** hoặc **256 MB/batch** |
| **Context Compaction** | Hội thoại dài dễ gây Context Rot & tốn token | Tóm tắt các lượt cũ định kỳ bằng Haiku, giữ nguyên 3–5 lượt gần nhất |
| **TPM Shaping** | Hệ thống phân tán hay gặp `429` | Distributed Token Bucket (Redis) + **AIMD Adaptive Concurrency** + `count_tokens` pre-flight check |

---

[Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md)
