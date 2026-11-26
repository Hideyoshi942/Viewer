# Bài tập tình huống — Chủ đề 5: OpenTelemetry GenAI Tracing & End-to-End Agent Span Propagation

> Chuẩn hóa OpenTelemetry GenAI semantic conventions, truyền traceparent qua các hop multi-agent/MCP và theo dõi toàn bộ cây thực thi tool.
> **Số câu hỏi:** 4 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A platform team is instrumenting a multi-agent Claude application using OpenTelemetry GenAI semantic conventions. When a Supervisor agent invokes a Billing Worker agent over HTTP and the worker calls an MCP database tool, traces currently appear as disconnected single spans. How should the team link the entire end-to-end execution into one distributed trace?

- **A.** Ask Claude to generate a random UUID in its assistant text output and parse it out with regex in the centralized log pipeline.
- **B.** Propagate W3C TraceContext headers (`traceparent` and `tracestate`) across agent HTTP boundaries and MCP tool calls.
- **C.** Store all telemetry spans in a local CSV file on each Kubernetes container and merge them in a nightly batch job by timestamp.
- **D.** Disable asynchronous execution in the orchestrator so that only one user request runs globally at any given time across the cluster.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm nền tảng đang gắn công cụ theo dõi (instrumenting) một ứng dụng Claude đa agent bằng các quy ước ngữ nghĩa OpenTelemetry GenAI. Khi một Supervisor agent gọi một Billing Worker agent qua HTTP và worker đó gọi một MCP database tool, các trace hiện xuất hiện dưới dạng các span đơn lẻ rời rạc. Nhóm nên liên kết toàn bộ quá trình thực thi đầu cuối thành một distributed trace duy nhất bằng cách nào?

**Đáp án đúng:** **B**

Trong kiến trúc đa tác tử phân tán, việc truyền W3C TraceContext (`traceparent`/`tracestate`) xuyên suốt các agent hops và MCP tool calls là tiêu chuẩn để OpenTelemetry dựng được cây trace hoàn chỉnh.

- **A:** Nhờ LLM tự sinh UUID không đáng tin cậy và không kết nối được các span ở tầng hạ tầng/HTTP.
- **B (Đúng):** Truyền tải header chuẩn W3C TraceContext (`traceparent`, `tracestate`) qua các lời gọi HTTP giữa các agent và MCP tool giúp OpenTelemetry nối toàn bộ các span thành một distributed trace thống nhất.
- **C:** Gộp log theo timestamp không thể phân biệt chính xác quan hệ cha-con (parent-child) khi có nhiều request chạy đồng thời.
- **D:** Chạy đơn luồng toàn cục phá hủy khả năng chịu tải của hệ thống production.

</details>

### Câu 2 `medium`

An observability team wants to log LLM spans to Datadog using OpenTelemetry while complying with GDPR and HIPAA. Recording full raw prompts and completions in span attributes would expose patient PII. What is the recommended telemetry pattern?

- **A.** Disable OpenTelemetry tracing completely in production and rely solely on aggregate HTTP 200/500 gateway status counters.
- **B.** Log raw unredacted patient prompts directly to container `stdout` at DEBUG level while leaving OpenTelemetry attributes empty.
- **C.** Base64-encode raw patient prompts inside OTel span attributes so sensitive medical text looks opaque in the Datadog UI.
- **D.** Capture structural metadata (token counts, model, latency, `stop_reason`, prompt hash) in OTel spans and store PII-redacted payloads in an encrypted audit store.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm observability muốn ghi log các LLM span tới Datadog bằng OpenTelemetry trong khi vẫn tuân thủ GDPR và HIPAA. Việc ghi lại toàn bộ prompt và completion thô trong các thuộc tính span sẽ làm lộ PII của bệnh nhân. Mẫu telemetry được khuyến nghị là gì?

**Đáp án đúng:** **D**

Trong môi trường tuân thủ GDPR/HIPAA, OTel span chỉ nên chứa telemetry phi nhạy cảm (`gen_ai.*` metrics, `stop_reason`, prompt template version), còn nội dung hội thoại phải qua PII redaction và lưu ở kho audit có kiểm soát truy cập riêng.

- **A:** Tắt hoàn toàn tracing khiến đội ngũ mất khả năng debug lỗi, theo dõi chi phí token và độ trễ từng bước agent.
- **B:** Ghi PII ra `stdout` vẫn đẩy dữ liệu nhạy cảm vào hệ thống thu thập log tập trung.
- **C:** Base64 chỉ là mã hóa hiển thị (encoding), không phải ẩn danh hay mã hóa bảo mật (encryption), vẫn vi phạm GDPR/HIPAA.
- **D (Đúng):** Ghi metadata cấu trúc (token, model, latency, `stop_reason`, hash phiên bản prompt) vào OTel span và lưu payload đã che PII (redacted) vào kho audit mã hóa tách biệt giúp vừa quan sát tốt vừa tuân thủ GDPR/HIPAA.

</details>

### Câu 3 `hard`

When building a production observability stack for an agentic RAG system using OpenTelemetry GenAI conventions, which THREE attributes or metrics are most critical to record on LLM and retrieval spans?

*(Chọn 3 đáp án)*

- **A.** `gen_ai.request.model`, `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`, and cache token counts.
- **B.** TTFT, TPOT/ITL, and `gen_ai.response.finish_reasons` (`stop_reason`) per LLM call.
- **C.** Retrieval latency, candidate count, reranker scores, and prompt/index version identifiers.
- **D.** Unredacted user passwords, API secret keys, and full credit card numbers as searchable span tags.
- **E.** The raw floating-point weights of all transformer attention heads downloaded from the inference server.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Khi xây dựng một hệ thống observability trên production cho một hệ thống RAG agentic bằng các quy ước OpenTelemetry GenAI, BA thuộc tính hoặc chỉ số nào quan trọng nhất cần ghi lại trên các LLM span và retrieval span?

**Đáp án đúng:** **A, B, C**

Observability toàn diện cho agentic RAG kết hợp: (1) Chuẩn `gen_ai.*` usage & model, (2) Streaming latency (TTFT/TPOT) & `stop_reason`, và (3) Retrieval/reranker metrics cùng prompt/index version.

- **A (Đúng):** Các thuộc tính chuẩn `gen_ai.*` này cần thiết để theo dõi chi phí, thông lượng token và hiệu quả Prompt Caching.
- **B (Đúng):** TTFT, TPOT và `stop_reason` giúp phát hiện nghẽn cổ chai độ trễ streaming và lỗi cắt cụt `max_tokens`.
- **C (Đúng):** Ghi nhận độ trễ truy xuất, điểm reranker và phiên bản prompt/index giúp liên kết sự suy giảm chất lượng trả lời với tầng RAG.
- **D:** Ghi secrets và dữ liệu thẻ tín dụng không che vào span tags là lỗ hổng bảo mật nghiêm trọng.
- **E:** Trọng số mô hình không khả dụng qua API thương mại và cũng không phải dữ liệu observability.

</details>

### Câu 4 `hard`

A distributed AI platform routes user requests from an API Gateway through a Python Supervisor agent, which invokes two Go-based MCP servers and calls Claude Sonnet via the Messages API. Engineers cannot correlate downstream MCP tool latency spikes with specific LLM reasoning turns. Which instrumentation strategy solves this end-to-end?

- **A.** Ask Claude to generate a random UUID string inside its text response and parse it with regex to manually grep across container stdout logs.
- **B.** Log only the HTTP status code, client IP address, and total wall-clock duration at the API Gateway while disabling distributed telemetry inside the agent orchestrator and MCP servers to conserve CPU.
- **C.** Propagate W3C `traceparent` headers across all hops and emit OpenTelemetry spans using GenAI semantic conventions (`gen_ai.*`).
- **D.** Configure the Anthropic SDK to write raw JSON responses to a local SQLite file on each pod and aggregate them via a weekly cron job.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng AI phân tán định tuyến request của người dùng từ API Gateway qua một Supervisor agent viết bằng Python, agent này gọi hai MCP server viết bằng Go và gọi Claude Sonnet qua Messages API. Các kỹ sư không thể đối chiếu sự tăng vọt độ trễ của MCP tool phía sau với các lượt suy luận LLM cụ thể. Chiến lược gắn công cụ đo lường (instrumentation strategy) nào giải quyết vấn đề này từ đầu đến cuối?

**Đáp án đúng:** **C**

OpenTelemetry với chuẩn GenAI semantic conventions và W3C Trace Context (`traceparent`) là tiêu chuẩn công nghiệp để theo dõi luồng thực thi phân tán từ API Gateway qua nhiều agent hops và MCP servers.

- **A:** Nhờ LLM tự sinh UUID trong text vừa không đáng tin cậy vừa không thể truyền ngữ cảnh trace xuống tầng HTTP/gRPC của các MCP server.
- **B:** Chỉ log ở API Gateway không thể bóc tách được độ trễ của từng lượt gọi LLM hay từng MCP server bên dưới.
- **C (Đúng):** Truyền W3C `traceparent` xuyên suốt các service (Gateway -> Python Supervisor -> Go MCP Servers -> Messages API) kết hợp OpenTelemetry GenAI semantic conventions giúp ghép nối trọn vẹn cây span và đối chiếu chính xác độ trễ tool với từng lượt gọi Claude.
- **D:** Ghi log cục bộ vào SQLite trên từng pod và gom hàng tuần không hỗ trợ distributed tracing liên dịch vụ (cross-service) hay giám sát real-time.

</details>

---

[Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md)
