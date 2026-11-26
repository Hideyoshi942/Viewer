# Bài tập tình huống — Chủ đề 6: Production Telemetry Dashboards (TTFT, TPOT, Cache Hit Ratio & Audit Logs)

> Giám sát chỉ số độ trễ streaming (TTFT, TPOT/ITL), tỷ lệ cache hit, phân bổ token theo tenant và lưu trữ structured audit logs phục vụ tuân thủ.
> **Số câu hỏi:** 9 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

Users of a streaming chat assistant report that the interface feels sluggish before any words appear, even though the total generation speed once started is fast. Which telemetry metric should the observability team inspect to isolate this initial delay?

- **A.** Time Per Output Token (TPOT) measured from the second generated token until the final `message_stop` SSE event.
- **B.** Total `output_tokens` divided by the number of markdown paragraphs rendered in the final streaming user-interface response.
- **C.** Time To First Token (TTFT) measured from request dispatch to the first `content_block_delta` SSE event.
- **D.** The HTTP 200 TCP connection establishment duration excluding TLS handshake, prompt prefill, and API processing time.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Người dùng của một trợ lý chat streaming báo cáo rằng giao diện có cảm giác chậm chạp trước khi bất kỳ từ nào xuất hiện, mặc dù tổng tốc độ sinh văn bản sau khi bắt đầu là rất nhanh. Chỉ số đo lường (telemetry metric) nào nhóm quan sát (observability) nên kiểm tra để cô lập độ trễ ban đầu này?

**Đáp án đúng:** **C**

TTFT (Time To First Token) đo độ phản hồi ban đầu của hệ thống streaming (thường bị ảnh hưởng bởi prompt dài, chưa cache, hoặc queue), trong khi TPOT/ITL đo tốc độ đọc mượt mà của các token tiếp theo.

- **A:** TPOT đo tốc độ sinh token sau khi đã bắt đầu trả lời, không phản ánh độ trễ chờ token đầu tiên.
- **B:** Tỷ lệ token trên đoạn văn là chỉ số định dạng, không phải chỉ số độ trễ streaming.
- **C (Đúng):** TTFT (Time To First Token) đo thời gian từ lúc gửi request đến khi nhận được token đầu tiên, phản ánh trực tiếp độ trễ prefill, mạng và xếp hàng trước khi chữ bắt đầu hiện.
- **D:** Thời gian kết nối TCP không bao gồm thời gian prefill prompt trên GPU/server của Anthropic.

</details>

### Câu 2 `hard`

A company enabled Prompt Caching on its 12,000-token system prompt and tool definitions, expecting an 80% drop in input token costs. After a week, billing remains unchanged. Which telemetry fields from the Anthropic API `usage` object should be charted to diagnose why caching is failing?

- **A.** Compare `cache_read_input_tokens` against `cache_creation_input_tokens` and uncached `input_tokens` per request.
- **B.** Monitor `output_tokens` and `stop_reason` across all streaming SSE chunks to detect server-side KV cache invalidation events.
- **C.** Track the client-side DNS lookup latency and TLS session reuse rate for `api.anthropic.com` in Prometheus histograms.
- **D.** Count the total number of `tool_use` content blocks emitted per conversation turn across all active user sessions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty đã bật Prompt Caching trên system prompt và các định nghĩa tool dài 12.000 token của mình, kỳ vọng giảm 80% chi phí input token. Sau một tuần, hóa đơn vẫn không thay đổi. Các trường telemetry nào từ đối tượng `usage` của Anthropic API nên được vẽ biểu đồ để chẩn đoán lý do caching thất bại?

**Đáp án đúng:** **A**

Object `usage` của Anthropic trả về `cache_creation_input_tokens` và `cache_read_input_tokens`. Nếu `cache_creation_input_tokens` cao liên tục mà `cache_read_input_tokens` bằng 0, nghĩa là prefix đang bị thay đổi (ví dụ chứa timestamp động) hoặc vượt quá TTL 5 phút.

- **A (Đúng):** Theo dõi tỷ lệ giữa `cache_read_input_tokens` (trúng cache) và `cache_creation_input_tokens` (tạo cache mới) cùng `input_tokens` cho biết cache có đang bị miss liên tục do prefix thay đổi hoặc TTL hết hạn hay không.
- **B:** `output_tokens` và `stop_reason` chỉ phản ánh phần sinh ra, không chứa thông tin về trạng thái Prompt Cache.
- **C:** Độ trễ DNS không liên quan đến cơ chế Prompt Caching trên server.
- **D:** Số lượng `tool_use` không cho biết tiền tố (prefix) có được đọc từ cache hay không.

</details>

### Câu 3 `hard`

During a traffic spike, an agentic application experiences a jump in p99 end-to-end latency from 4 seconds to 28 seconds. Metrics show TTFT and TPOT per individual Claude call remain normal. Where should the engineer look next in the distributed trace?

- **A.** Inspect the parent workflow span for an increased number of sequential agent turns, tool-retry loops, or slow downstream tool calls.
- **B.** Switch the JSON serializer in the Anthropic Python SDK from standard `json` to `orjson` to shave 20 seconds off response parsing.
- **C.** Decrease `temperature` from 0.2 to 0.0 across all requests because lower sampling temperatures make GPU matrix multiplications run faster.
- **D.** Increase the Prometheus metrics scrape interval from 15 seconds to 5 minutes to reduce observability agent CPU overhead.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong một đợt tăng lưu lượng đột biến, một ứng dụng agentic gặp tình trạng độ trễ đầu cuối p99 tăng vọt từ 4 giây lên 28 giây. Các chỉ số cho thấy TTFT và TPOT trên mỗi lệnh gọi Claude riêng lẻ vẫn bình thường. Kỹ sư nên kiểm tra tiếp ở đâu trong distributed trace?

**Đáp án đúng:** **A**

Distributed tracing giúp phân tách rõ thời gian nằm ở LLM inference (`gen_ai` spans) so với thời gian nằm ở tool execution và số lượt lặp (turn count) trong agent loop.

- **A (Đúng):** Khi TTFT và TPOT của từng lệnh gọi Claude vẫn bình thường nhưng tổng độ trễ p99 tăng vọt, nguyên nhân nằm ở số vòng lặp agent tăng lên, tool bị retry hoặc downstream API/DB của tool bị chậm.
- **B:** Phân tích JSON chỉ tốn vài micro-giây/mili-giây, không thể gây ra độ trễ 24 giây.
- **C:** Temperature chỉ ảnh hưởng phân phối xác suất khi lấy mẫu token, không làm thay đổi tốc độ tính toán.
- **D:** Thay đổi chu kỳ scrape của Prometheus chỉ làm chậm việc phát hiện sự cố chứ không giải thích nguyên nhân p99 tăng.

</details>

### Câu 4 `medium`

An engineering team deploys a new system prompt version (`v14`) for a code-review bot. Two days later, users report a surge in incomplete JSON responses. Which dashboard metric immediately surfaces this regression?

- **A.** Average HTTP connection keep-alive duration segmented by client browser version and geographic edge location.
- **B.** The distribution of `stop_reason` values (especially `max_tokens` spikes) and schema validation failure rates segmented by `prompt_version`.
- **C.** Total Kubernetes cluster memory utilization and disk IOPS across the primary PostgreSQL database namespace.
- **D.** The aggregate count of HTTP 200 OK status codes returned by the external API gateway load balancer.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ thuật triển khai một phiên bản system prompt mới (`v14`) cho một bot review code. Hai ngày sau, người dùng báo cáo sự gia tăng đột biến các phản hồi JSON không hoàn chỉnh. Chỉ số dashboard nào ngay lập tức làm lộ ra sự suy giảm chất lượng (regression) này?

**Đáp án đúng:** **B**

Gắn `prompt_version` vào mọi span/metric và theo dõi `stop_reason` (`end_turn` vs `max_tokens`) cùng tỷ lệ schema validation failure là cách nhanh nhất để phát hiện silent truncation sau khi đổi prompt.

- **A:** Thời gian keep-alive của trình duyệt không liên quan đến việc Claude sinh thiếu JSON.
- **B (Đúng):** Theo dõi phân bố `stop_reason` (đặc biệt tỷ lệ `max_tokens` tăng đột biến) và tỷ lệ lỗi validate JSON được gắn nhãn theo `prompt_version` giúp phát hiện ngay hồi quy từ bản `v14`.
- **C:** Mức dùng RAM của database không phản ánh lỗi cắt cụt JSON ở tầng LLM.
- **D:** API vẫn trả về HTTP 200 OK ngay cả khi `stop_reason` là `max_tokens` và JSON bị cắt cụt.

</details>

### Câu 5 `medium`

A production AI platform bills internal business units based on their actual Claude usage. Several teams share the same Anthropic organization API key through a central LLM gateway. How should the gateway attribute token costs accurately?

- **A.** Divide the monthly Anthropic invoice equally by the total number of registered internal engineering teams.
- **B.** Estimate token cost solely from raw UTF-8 character counts in HTTP request bodies before dispatching them to Claude.
- **C.** Emit structured usage events per request recording `tenant_id`, `model`, `input_tokens`, `output_tokens`, and cache token fields from the API response.
- **D.** Ask each internal business unit to self-report their estimated monthly Claude spend in a shared finance spreadsheet.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng AI production tính phí các đơn vị kinh doanh nội bộ dựa trên mức sử dụng Claude thực tế của họ. Nhiều nhóm dùng chung một Anthropic organization API key thông qua một LLM gateway trung tâm. Gateway nên phân bổ chi phí token một cách chính xác như thế nào?

**Đáp án đúng:** **C**

LLM Gateway tập trung cần ghi nhận structured telemetry từ trường `usage` của từng response gắn với `tenant_id`/`cost_center` và `model` để thực hiện chargeback/showback chính xác.

- **A:** Chia đều không phản ánh đúng mức tiêu thụ thực tế và không khuyến khích các đội tối ưu token.
- **B:** Ước lượng theo ký tự bỏ qua tỷ lệ token hóa thực tế, output tokens và mức giảm giá của Prompt Cache.
- **C (Đúng):** Ghi nhận chính xác `tenant_id`, `model`, `input_tokens`, `output_tokens`, `cache_creation_input_tokens` và `cache_read_input_tokens` từ `usage` object của API cho phép hạch toán chi phí chính xác theo từng đơn vị.
- **D:** Tự báo cáo thủ công thiếu chính xác và không thể kiểm toán.

</details>

### Câu 6 `hard`

A real-time streaming chat application monitors both Time to First Token (TTFT) and Time Per Output Token (TPOT). After a recent deployment, P95 TTFT jumped from 900ms to 6.8 seconds, while P95 TPOT remained steady at 18ms/token. What is the most likely root cause indicated by this metric divergence?

- **A.** The client browser's Server-Sent Events (SSE) parser is buffering incoming chunks mid-stream and slowing down DOM token rendering on long assistant replies.
- **B.** Claude is generating significantly longer responses than before, causing the `max_tokens` limit to be reached more frequently.
- **C.** The `temperature` parameter was lowered from 0.7 to 0.1, which forces the decoder to spend more time per generated output token.
- **D.** Input prefill overhead spiked—likely from bloated RAG context or a broken prompt cache prefix—delaying the first token without slowing decoding.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng chat streaming thời gian thực giám sát cả Time to First Token (TTFT) và Time Per Output Token (TPOT). Sau một lần triển khai gần đây, P95 TTFT tăng vọt từ 900ms lên 6,8 giây, trong khi P95 TPOT vẫn ổn định ở mức 18ms/token. Nguyên nhân gốc rễ có khả năng nhất được chỉ ra bởi sự phân kỳ chỉ số này là gì?

**Đáp án đúng:** **D**

Phân biệt TTFT (prefill + queue latency) và TPOT/ITL (decoding speed) là kỹ năng cốt lõi khi vận hành streaming LLM. TTFT tăng đột biến khi TPOT ổn định thường do context đầu vào quá lớn hoặc cache miss.

- **A:** Nếu trình duyệt render SSE chậm, TPOT/ITL đo ở phía client cũng sẽ tăng vọt, chứ không chỉ riêng TTFT tăng còn TPOT giữ nguyên.
- **B:** Độ dài output ảnh hưởng đến tổng thời gian sinh (total generation time), không làm tăng TTFT (thời gian chờ token đầu tiên).
- **C:** Thay đổi `temperature` không làm tăng độ trễ prefill hay thời gian giải mã token một cách đáng kể như vậy.
- **D (Đúng):** TTFT phản ánh độ trễ xử lý input (prefill) và hàng đợi trước khi sinh token đầu tiên, trong khi TPOT phản ánh tốc độ sinh từng token sau đó. TTFT tăng vọt mà TPOT giữ nguyên là dấu hiệu kinh điển của input prompt phình to hoặc prompt cache bị miss.

</details>

### Câu 7 `hard`

An observability dashboard tracks Anthropic Messages API `usage` fields across a 50-million-token/day coding assistant. Over the weekend, `cache_read_input_tokens` dropped from 85% of total input tokens to 5%, while `cache_creation_input_tokens` surged proportionally and monthly spend spiked. Which telemetry-backed investigation should the engineer perform first?

- **A.** Inspect the request prefix before `cache_control` for dynamic timestamps, shuffled tool definitions, or per-request UUIDs.
- **B.** Check whether `max_tokens` was reduced below 1024, because Anthropic Prompt Caching only activates when `max_tokens` exceeds 4096.
- **C.** Verify whether the `stream` flag was turned on, as streaming responses disable `cache_read_input_tokens` across all Claude models.
- **D.** Migrate all requests from Claude Sonnet to Claude Opus, since Opus maintains a permanent 30-day global prompt cache across unrelated customer accounts and automatically ignores minor timestamp changes.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một bảng điều khiển observability theo dõi các trường `usage` của Anthropic Messages API trên một trợ lý lập trình 50 triệu token/ngày. Vào cuối tuần, `cache_read_input_tokens` giảm từ 85% tổng số input token xuống còn 5%, trong khi `cache_creation_input_tokens` tăng vọt tương ứng và chi tiêu hàng tháng tăng mạnh. Kỹ sư nên thực hiện cuộc điều tra dựa trên telemetry nào đầu tiên?

**Đáp án đúng:** **A**

Giám sát tỷ lệ `cache_read_input_tokens` so với `cache_creation_input_tokens` giúp phát hiện sớm lỗi cache invalidation. Nguyên nhân phổ biến nhất là có dữ liệu biến động (timestamp, UUID, thứ tự tool không ổn định) lọt vào phần prefix trước `cache_control`.

- **A (Đúng):** Prompt Caching của Anthropic yêu cầu tiền tố (prefix) từ đầu request đến `cache_control` breakpoint phải khớp chính xác từng byte (tools -> system -> messages). Việc chèn timestamp động, UUID hoặc thay đổi thứ tự tool definitions sẽ làm vô hiệu hóa cache (cache miss) và kích hoạt `cache_creation_input_tokens` liên tục.
- **B:** Ngưỡng tối thiểu của Prompt Caching áp dụng cho độ dài phần input prefix được cache (ví dụ >= 1024 hoặc 2048 tokens tùy model), không phụ thuộc vào giá trị `max_tokens` output.
- **C:** Prompt Caching hoạt động bình thường với cả chế độ streaming (`stream: true`) và non-streaming.
- **D:** Ephemeral prompt cache có TTL ngắn (5 phút hoặc 1 giờ với cấu hình mở rộng) và được cô lập theo workspace/organization, không chia sẻ toàn cầu 30 ngày hay phụ thuộc việc nâng lên Opus.

</details>

### Câu 8 `medium`

A European banking platform deploys Claude for automated KYC document review. Compliance requires immutable audit logs linking every decision to model version, prompt template version, and tool calls, while GDPR prohibits storing raw customer PII in centralized log aggregators. How should telemetry logging be designed?

- **A.** Disable all application logging in production so zero customer PII can ever reach the centralized observability platform.
- **B.** Emit structured audit logs with trace IDs, model/prompt hashes, tool names, and payload hashes while redacting PII before export.
- **C.** Store full unredacted user prompts, national ID numbers, and raw KYC document text in plaintext OpenTelemetry span attributes while restricting Kibana dashboard access to senior platform engineers.
- **D.** Ask Claude in the system prompt to omit all customer names from its internal reasoning and rely solely on the model's output text as the audit log.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng ngân hàng châu Âu triển khai Claude để rà soát tài liệu KYC tự động. Quy định tuân thủ yêu cầu nhật ký kiểm toán bất biến liên kết mọi quyết định với phiên bản mô hình, phiên bản mẫu prompt và các lệnh gọi tool, trong khi GDPR cấm lưu trữ PII thô của khách hàng trong các hệ thống tổng hợp log tập trung. Việc ghi log telemetry nên được thiết kế như thế nào?

**Đáp án đúng:** **B**

Trong hệ thống tài chính/y tế chịu quản lý chặt chẽ, Structured Audit Logging phải tách biệt metadata truy vết (model version, prompt hash, tool execution, latency) khỏi dữ liệu nhạy cảm bằng PII scrubbing/redaction trước khi đẩy ra log aggregator.

- **A:** Tắt hoàn toàn logging vi phạm yêu cầu audit trail bắt buộc của ngành ngân hàng và khiến đội ngũ kỹ thuật mù thông tin khi điều tra sự cố.
- **B (Đúng):** Structured audit logging lưu đầy đủ metadata truy vết (trace ID, model ID, prompt version/hash, tên tool, token usage) và thực hiện PII redaction/tokenization hoặc lưu hash thay cho dữ liệu thô giúp vừa đáp ứng audit compliance vừa tuân thủ GDPR.
- **C:** Lưu PII thô dạng plaintext vào hệ thống log tập trung vi phạm nghiêm trọng nguyên tắc data minimization và bảo mật của GDPR.
- **D:** Chỉ dựa vào LLM để che PII là không đáng tin cậy (non-deterministic) và bỏ sót toàn bộ metadata kỹ thuật cần thiết cho audit.

</details>

### Câu 9 `hard`

An SRE team is defining Service Level Indicators (SLIs) and automated alerting for a mission-critical Claude agentic workflow in production. Which TWO alerting configurations provide actionable early warning without causing alert fatigue? (Select TWO)

*(Chọn 2 đáp án)*

- **A.** Configure multi-window error budget burn-rate alerts on end-to-end task completion failure rate and downstream tool execution error rate.
- **B.** Trigger a PagerDuty page to the on-call engineer every single time an individual API request receives a transient `429 rate_limit_error` that is immediately recovered by SDK retry.
- **C.** Alert on sustained anomalies in P95/P99 TTFT, unexpected drops in prompt cache hit ratio, and sudden spikes in hourly token spend per tenant.
- **D.** Page the on-call engineer whenever Claude's output length varies by more than 10% between two consecutive user queries.
- **E.** Track only CPU utilization of the stateless Python API gateway and ignore all token, latency, and tool-failure telemetry.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm SRE đang định nghĩa các Chỉ số Mức độ Dịch vụ (SLI) và cảnh báo tự động cho một workflow agentic Claude tối quan trọng trên production. HAI cấu hình cảnh báo nào cung cấp cảnh báo sớm có thể hành động mà không gây mệt mỏi vì cảnh báo (alert fatigue)? (Chọn HAI đáp án)

**Đáp án đúng:** **A, C**

SLI/SLO hiệu quả cho hệ thống agentic cần tập trung vào độ tin cậy đầu cuối (error budget burn rate trên task/tool failure) và các bất thường kéo dài về hiệu năng/chi phí (P95/P99 TTFT, cache hit ratio, token spend anomalies).

- **A (Đúng):** Alert theo error budget burn-rate đa cửa sổ (multi-window) trên tỷ lệ lỗi hoàn thành tác vụ và lỗi tool execution phản ánh đúng tác động tới người dùng cuối và tránh nhiễu từ các lỗi đơn lẻ.
- **B:** Báo động khẩn cấp cho mỗi lỗi 429 thoáng qua đã được SDK retry thành công sẽ gây alert fatigue nghiêm trọng.
- **C (Đúng):** Cảnh báo theo xu hướng kéo dài (sustained anomalies) của P95/P99 TTFT, tỷ lệ cache hit giảm đột ngột hoặc chi phí token/tenant tăng vọt giúp phát hiện sớm suy giảm hiệu năng, lỗi cấu hình cache hoặc vòng lặp agent.
- **D:** Độ dài câu trả lời của LLM biến thiên tự nhiên theo từng câu hỏi của người dùng; đặt alert theo biến thiên 10% là vô nghĩa và gây nhiễu.
- **E:** Ứng dụng gọi LLM chủ yếu là I/O-bound; CPU của gateway thấp ngay cả khi LLM API bị sập hoặc độ trễ tăng gấp 10 lần.

</details>

---

[Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md)
