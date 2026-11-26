# Domain 3: Observability, Distributed Tracing & Production Telemetry

Domain 3 chiếm **12% tỷ trọng đề thi CCDV-P**. Hệ thống LLM và Multi-Agent không thể vận hành mù (black-box). Bạn cần nắm vững chuẩn **OpenTelemetry (OTel) GenAI Semantic Conventions**, cơ chế lan truyền trace qua các agent hops, các chỉ số độ trễ đặc trưng của streaming LLM (TTFT, TPOT, ITL) và cách ghi audit log an toàn không rò rỉ dữ liệu nhạy cảm.

## 1. OpenTelemetry GenAI Semantic Conventions

Thay vì tự đặt tên attribute tùy tiện, hệ thống production chuẩn hóa telemetry theo **OpenTelemetry GenAI Semantic Conventions** để tương thích với Datadog, Honeycomb, Grafana Tempo, Langfuse hoặc Arize Phoenix.

### Các Span & Attributes cốt lõi
Một agent request điển hình tạo thành cây Span phân cấp:
`HTTP Request Span` → `Agent Workflow Span` → `LLM Call Span (gen_ai.client.operation)` + `Tool Execution Span` + `Vector Retrieval Span`.

| Attribute chuẩn OTel GenAI | Ý nghĩa & Ví dụ giá trị |
| :--- | :--- |
| `gen_ai.system` | Nhà cung cấp (`anthropic`, `aws.bedrock`, `gcp.vertex_ai`) |
| `gen_ai.request.model` | Model được yêu cầu (`claude-sonnet-4-20250514`) |
| `gen_ai.response.finish_reasons` | Lý do dừng (`["end_turn"]`, `["tool_use"]`, `["max_tokens"]`) |
| `gen_ai.usage.input_tokens` | Số input tokens không cache |
| `gen_ai.usage.output_tokens` | Số output tokens sinh ra |
| `gen_ai.usage.cache_read.input_tokens` | Số tokens đọc trúng Prompt Cache (tiết kiệm 90%) |
| `gen_ai.usage.cache_creation.input_tokens` | Số tokens vừa ghi vào Prompt Cache |

## 2. Distributed Trace Propagation qua Agent Hops & MCP

Khi Agent A gọi MCP Server B hoặc đẩy job vào hàng đợi Kafka/SQS để Worker Agent C xử lý, trace sẽ bị đứt gãy nếu không truyền ngữ cảnh phân tán (**W3C Trace Context**).

- **Synchronous HTTP / MCP**: Truyền header `traceparent` (`00-<trace-id>-<span-id>-01`) và `tracestate` qua mọi HTTP/gRPC/MCP call.
- **Asynchronous Queue (SQS/Kafka)**: Inject `traceparent` vào message metadata/headers trước khi publish; Consumer extract `traceparent` để tạo child span nối vào cùng `trace_id`.
- **Correlation IDs**: Luôn gắn `tenant_id`, `session_id`, `agent_run_id`, và `prompt_version` vào Span Attributes (hoặc Baggage) để lọc dashboard theo từng khách hàng hoặc phiên bản prompt.

```python
from opentelemetry import trace
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator
import anthropic

tracer = trace.get_tracer("claude.agent.service")
propagator = TraceContextTextMapPropagator()

def call_claude_instrumented(client: anthropic.Anthropic, model: str, messages: list, tenant_id: str):
    with tracer.start_as_current_span("anthropic.messages.create") as span:
        span.set_attribute("gen_ai.system", "anthropic")
        span.set_attribute("gen_ai.request.model", model)
        span.set_attribute("app.tenant_id", tenant_id)

        response = client.messages.create(model=model, max_tokens=1024, messages=messages)

        span.set_attribute("gen_ai.response.finish_reasons", [response.stop_reason])
        span.set_attribute("gen_ai.usage.input_tokens", response.usage.input_tokens)
        span.set_attribute("gen_ai.usage.output_tokens", response.usage.output_tokens)
        span.set_attribute(
            "gen_ai.usage.cache_read.input_tokens",
            getattr(response.usage, "cache_read_input_tokens", 0) or 0,
        )
        return response

def inject_trace_headers(headers: dict) -> dict:
    """Truyền W3C traceparent sang MCP server hoặc downstream worker."""
    propagator.inject(carrier=headers)
    return headers
```

## 3. Các chỉ số Độ trễ LLM (TTFT, TPOT, ITL) & Dashboards

Đo tổng thời gian phản hồi (E2E Latency) là không đủ đối với ứng dụng Streaming, vì cảm nhận của người dùng phụ thuộc vào tốc độ xuất hiện token đầu tiên và độ mượt khi đọc chữ.

| Metric | Công thức / Định nghĩa | Ý nghĩa vận hành & Nguyên nhân tăng cao |
| :--- | :--- | :--- |
| **TTFT** (Time to First Token) | Thời gian từ lúc gửi request đến khi nhận `content_block_delta` đầu tiên | Quyết định cảm giác "nhanh/chậm" tức thì. Tăng cao khi `input_tokens` quá lớn chưa được cache, hoặc network/cold-start |
| **ITL** (Inter-Token Latency) | Khoảng thời gian giữa hai token liên tiếp trong stream | Quyết định độ mượt hiển thị. ITL giật cục cho thấy upstream đang quá tải |
| **TPOT** (Time Per Output Token) | `(E2E_Latency - TTFT) / (output_tokens - 1)` | Đo tốc độ sinh token trung bình của model (Haiku rất thấp, Opus cao hơn) |
| **Cache Hit Ratio** | `cache_read_input_tokens / (input_tokens + cache_read_input_tokens + cache_creation_input_tokens)` | Đo hiệu quả Prompt Caching. Nếu đột ngột tụt giảm → kiểm tra xem prefix có bị thay đổi động không |

### Các Dashboard Production thiết yếu
1. **Reliability & Saturation**: Tỷ lệ lỗi theo HTTP status (`429`, `529`, `500`), trạng thái Circuit Breaker, tỷ lệ `stop_reason == "max_tokens"` (cảnh báo cắt cụt ngầm).
2. **Cost & Token Economics**: Chi phí theo `tenant_id`, `prompt_version`, `cache_hit_ratio`, và phân bổ traffic giữa Haiku/Sonnet/Opus.
3. **Agent Behavior**: Phân phối số bước (`steps_per_run`), tỷ lệ tool failure theo từng MCP server, tỷ lệ HITL escalation.

## 4. Structured Audit Logs & Compliance (Privacy-by-Design)

Ghi log toàn bộ prompt/completion dạng plain-text ra hệ thống log tập trung (CloudWatch/ELK) là lỗ hổng bảo mật nghiêm trọng nếu chứa PII, API key hoặc dữ liệu khách hàng.

- **Structured JSON Logging**: Log phải có schema cố định (`timestamp`, `trace_id`, `actor_id`, `tool_name`, `decision`, `latency_ms`, `token_usage`).
- **PII / Secret Redaction trước khi ghi log**: Che mờ (masking/hashing) email, số thẻ, SSN, Bearer token ở tầng middleware trước khi đẩy ra sink log.
- **Tách biệt Audit Log và Debug Payload**: Audit log (ai gọi tool gì, khi nào, kết quả allow/deny) lưu dài hạn, immutable; Debug payload (full prompt/response để tái hiện lỗi) chỉ bật có điều kiện (sampling hoặc theo debug flag ngắn hạn), mã hóa riêng và đặt TTL ngắn (ví dụ 7–14 ngày).

> [!TIP]
> **Exam Tip (CCDV-P):**
> 1. Người dùng phàn nàn chatbot phản hồi "chờ rất lâu mới thấy chữ đầu tiên" dù tốc độ chạy chữ sau đó bình thường → Chỉ số cần tối ưu là **TTFT** (bằng Prompt Caching hoặc giảm kích thước context/routing sang Haiku).
> 2. Làm sao theo dõi xuyên suốt một yêu cầu đi từ API Gateway → Orchestrator Agent → Async Queue → Worker Agent → MCP Tool? → Dùng **W3C `traceparent` propagation** kết hợp **OpenTelemetry GenAI semantic conventions**.
> 3. Cần lưu bằng chứng tuân thủ (compliance) nhưng không được lộ dữ liệu nhạy cảm của khách hàng trong Datadog/ELK → **Redaction/Masking trước khi emit log** + tách **immutable audit metadata** khỏi debug payload.

---

[← Bài trước](04-durable-state.md) | [Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/05-observability.md) | [Bài tiếp →](06-prod-telemetry.md)
