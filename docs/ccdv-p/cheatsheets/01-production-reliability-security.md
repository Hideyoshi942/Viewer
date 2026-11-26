# Cheatsheet 1: Production Reliability, RAG, Agents, Security & Debugging

Tổng hợp nhanh các mẫu thiết kế, decision matrix và bẫy thường gặp cho **Domain 1 (20%)**, **Domain 2 (17%)**, **Domain 5 (11%)** và **Domain 6 (10%)** — chiếm **58% tổng điểm bài thi CCDV-P**.

## 1. Reliability & Multi-Provider Fallback (Domain 1)

| Mẫu / Cơ chế | Khi nào dùng | Quy tắc triển khai chuẩn |
| :--- | :--- | :--- |
| **Retry + Full Jitter** | Lỗi transient (`429`, `500`, `502`, `503`, `529`) | Tôn trọng header `retry-after`; `sleep = max(retry_after, random(0, min(cap, 2**attempt)))`. **KHÔNG** retry `400`, `401`, `403`, `404`. |
| **Circuit Breaker** | Outage kéo dài ở upstream API | `Closed` → `Open` (fail-fast khi lỗi vượt ngưỡng) → `Half-Open` (probe sau cooldown) → `Closed`. |
| **Multi-Provider Fallback** | Cần SLA 99.9%+ | Chuẩn hóa abstraction giữa **Anthropic 1P**, **Amazon Bedrock**, **Google Vertex AI**. Chỉ fallback khi lỗi `5xx`/`529`/timeout, không fallback lỗi `400`. |
| **Idempotency Key** | Retry thao tác có side-effect (ghi DB, thanh toán) | Gắn `idempotency_key` duy nhất theo `request_id + step` để tránh thực thi trùng khi network timeout. |

## 2. Production RAG & Grounding (Domain 1)

| Kỹ thuật | Giải quyết vấn đề gì? | Chi tiết cốt lõi |
| :--- | :--- | :--- |
| **Hybrid Search + RRF** | Vector search bỏ sót mã lỗi, SKU, tên hàm | Kết hợp **BM25 (Sparse)** + **Embeddings (Dense)** qua `RRF(d) = sum(1 / (60 + rank))` |
| **Cross-Encoder Reranking** | Stage 1 lấy nhiều nhiễu (Top-50/100) | Chấm điểm cặp `(query, chunk)` để lọc **Top-5..8** đưa vào context |
| **Contextual Retrieval** | Chunk bị tách mất chủ ngữ/tài liệu nguồn | Dùng Haiku + Prompt Caching gắn đoạn context 50–100 tokens trước khi index (giảm tới **67%** retrieval failure) |
| **Citation & Abstention** | Chống hallucination | Thẻ `<doc id="D1">`, bắt buộc trích dẫn `[D1]`, trả `"insufficient_evidence"` nếu thiếu bằng chứng, verify citation ID hậu kiểm |

## 3. Advanced Agent Architecture (Domain 2)

- **Hierarchical Supervisor-Worker**: Tách biệt context bằng **Context Isolation** và **Pass-by-Reference** (lưu payload lớn ra S3/DB, chỉ truyền `artifact_uri` + summary qua typed **Handoff Contract**).
- **Durable Execution**: Persist `AgentState` sau mỗi step/tool call để resume từ checkpoint khi pod crash.
- **Bounded Execution**: Luôn đặt `max_steps`, `max_depth`, `max_tokens_budget` và **Repeated Tool-Call Detector** (chặn gọi lặp y hệt 2–3 lần).
- **HITL Approval Gate**: Với tool ghi/xóa/thanh toán → **Pause & Checkpoint** (`WAITING_FOR_APPROVAL`) trước khi thực thi, chờ webhook duyệt rồi mới cấp `tool_result` (nếu reject trả `is_error: true`).

## 4. Runtime Guardrails & Enterprise Security (Domain 5)

| Mối đe dọa | Defense-in-Depth (Phòng thủ đa lớp) |
| :--- | :--- |
| **Indirect Prompt Injection** | (1) Cô lập dữ liệu bằng `<untrusted_document>` + escape thẻ đóng; (2) Classifier quét input/tool output; (3) Least-privilege tool scoping; (4) Deterministic policy gate & egress allowlist. |
| **Cross-Tenant Leakage** | **Tuyệt đối không** cho LLM tự truyền `tenant_id`. Trích xuất `tenant_id` từ verified JWT ở backend và ép vào Vector DB / MCP filter. |
| **PII / Secret Exfiltration** | Middleware regex/NER redaction (`sk-ant-...`, `AKIA...`, thẻ tín dụng) trước khi gọi LLM, trước khi trả user và trước khi ghi log. |
| **SSRF qua Tool** | Chặn IP nội bộ (`169.254.169.254`, `10.0.0.0/8`, `127.0.0.1`), chỉ cho outbound tới domain trong allowlist. |

## 5. Debugging & Incident Response (Domain 6)

| Triệu chứng | Nguyên nhân gốc (Root Cause) | Cách xử lý |
| :--- | :--- | :--- |
| `JSONDecodeError` / output cụt giữa chừng | **Silent Truncation**: `stop_reason == "max_tokens"` (hay gặp khi bật Extended Thinking) | Check `stop_reason` trước khi parse; tăng `max_tokens` hoặc chia nhỏ task |
| Agent lặp vô tận cùng 1 tool | Tool trả lỗi mơ hồ (`"Error 400"`) hoặc thiếu loop detector | Trả **Actionable Tool Error** + Repeated Call Detector |
| Chất lượng giảm dần ở hội thoại dài | **Context Rot** ("lost in the middle", nhiễu từ tool log cũ) | **Context Compaction** + **Subagent Isolation** + đặt thông tin quan trọng ở đầu/cuối |
| Output đổi format đột ngột không deploy | **Model Drift** do dùng alias trôi nổi | **Pin exact model snapshot ID**; dùng Feature Flag rollback prompt tức thì |

---

[Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md)
