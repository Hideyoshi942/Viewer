# Bài tập tình huống — Chủ đề 3: Multi-Agent Orchestration (Supervisor-Worker & Handoff Contracts)

> Thiết kế kiến trúc điều phối phân tầng Supervisor-Worker, Typed Handoff Schemas, giới hạn recursion/step budget và kiểm soát luồng công cụ.
> **Số câu hỏi:** 6 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A multi-agent research system passes the entire raw conversation history—including 40KB of intermediate web-scraping logs—from a Research Worker agent to a Writer Worker agent. The Writer agent frequently ignores instructions and hits context limits. What architectural change fixes this?

- **A.** Enforce a typed handoff contract where the Research Worker returns only a concise structured summary and artifact references.
- **B.** Merge the Research Worker and Writer Worker into a single monolithic mega-prompt containing all 60 external tool definitions.
- **C.** Set `max_tokens` to 100 on the Research Worker so it cannot emit any intermediate tool calls or lengthy scraping summaries.
- **D.** Disable tool result serialization and pass raw Python memory pointers directly between separate Kubernetes microservice containers.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hệ thống nghiên cứu đa agent truyền toàn bộ lịch sử hội thoại thô—bao gồm 40KB log thu thập dữ liệu web trung gian—từ một Research Worker agent sang một Writer Worker agent. Writer agent thường xuyên bỏ qua hướng dẫn và chạm giới hạn ngữ cảnh. Thay đổi kiến trúc nào khắc phục được vấn đề này?

**Đáp án đúng:** **A**

Context isolation và Typed Handoff Contracts là nguyên tắc cốt lõi của kiến trúc đa tác tử: mỗi subagent giữ scratchpad riêng và chỉ bàn giao kết quả đã chắt lọc theo schema cho bước kế tiếp.

- **A (Đúng):** Sử dụng handoff contract có kiểu dữ liệu rõ ràng (structured summary + artifact IDs) giúp cô lập ngữ cảnh (context isolation), loại bỏ nhiễu trung gian trước khi chuyển sang agent tiếp theo.
- **B:** Nhồi 60 tool vào một agent duy nhất làm tăng nhiễu chọn tool và khiến context càng phình to hơn.
- **C:** Giới hạn `max_tokens: 100` sẽ cắt cụt các tool call cần thiết của Research Worker.
- **D:** Con trỏ bộ nhớ không thể chia sẻ qua mạng giữa các container microservice.

</details>

### Câu 2 `hard`

A due-diligence agent needs to analyze 12 independent subsidiary companies, each requiring 5 tool calls against financial databases. Running these sequentially in a single agent loop takes 95 seconds. How should the architecture be redesigned to minimize end-to-end latency?

- **A.** Use a fan-out/fan-in pattern where a supervisor spawns 12 isolated worker subagents in parallel and aggregates their structured outputs.
- **B.** Keep a single sequential loop but switch from `AsyncAnthropic` to synchronous `requests` to eliminate Python asyncio scheduling overhead.
- **C.** Pass all 12 companies into a single prompt and instruct Claude to simulate 12 parallel reasoning threads internally in its output.
- **D.** Disable tool use completely and ask Claude to estimate subsidiary quarterly financials from general pretraining knowledge.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một agent thẩm định (due-diligence) cần phân tích 12 công ty con độc lập, mỗi công ty đòi hỏi 5 lệnh gọi tool tới các cơ sở dữ liệu tài chính. Việc chạy tuần tự các công ty này trong một vòng lặp agent duy nhất mất 95 giây. Kiến trúc nên được thiết kế lại như thế nào để giảm thiểu độ trễ đầu cuối (end-to-end latency)?

**Đáp án đúng:** **A**

Với các tác vụ độc lập nhau (embarrassingly parallel), mô hình Orchestrator-Workers (Fan-out/Fan-in) cho phép xử lý song song và cô lập ngữ cảnh từng nhánh, tối ưu mạnh cả độ trễ lẫn độ chính xác.

- **A (Đúng):** Mẫu fan-out/fan-in chạy 12 worker subagent song song (mỗi worker xử lý 1 công ty con với context độc lập) rồi tổng hợp kết quả, giúp giảm độ trễ tổng thể xuống gần bằng thời gian xử lý 1 công ty.
- **B:** Chạy tuần tự đồng bộ không giảm được thời gian chờ 60 lần gọi tool và LLM nối tiếp nhau.
- **C:** LLM sinh token tuần tự nên việc 'giả lập 12 luồng' trong một prompt vẫn chạy tuần tự và dễ gây tràn/loãng ngữ cảnh.
- **D:** Bỏ tool use làm mất dữ liệu tài chính thực tế.

</details>

### Câu 3 `hard`

In a tool-use loop, Claude returns `stop_reason: "tool_use"` with three `tool_use` content blocks in a single assistant message. The orchestrator executes only the first tool and appends one `tool_result` block before calling the API again. What happens?

- **A.** The Python SDK caches the remaining two tool calls locally and executes them asynchronously in the user's next browser session.
- **B.** Claude automatically executes the remaining two pending tools on Anthropic's servers and merges their outputs into the next assistant turn.
- **C.** The API silently drops the two unexecuted `tool_use` blocks from history and continues generating the final user-facing answer.
- **D.** The Anthropic Messages API rejects the request with a 400 validation error because every `tool_use` ID must have a matching `tool_result`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong một vòng lặp tool-use, Claude trả về `stop_reason: "tool_use"` với ba khối nội dung `tool_use` trong một assistant message duy nhất. Bộ điều phối (orchestrator) chỉ thực thi tool đầu tiên và nối thêm một khối `tool_result` trước khi gọi lại API. Điều gì xảy ra?

**Đáp án đúng:** **D**

Khi Claude thực hiện parallel tool use (nhiều `tool_use` block trong 1 message), orchestrator phải thực thi tất cả (có thể song song) và trả về đầy đủ `tool_result` khớp từng `tool_use_id` trong message `user` tiếp theo.

- **A:** SDK không tự động lưu đệm `tool_use` sang phiên làm việc sau.
- **B:** Anthropic API không tự thực thi custom tools của client; client luôn chịu trách nhiệm thực thi và trả về đủ `tool_result`.
- **C:** API không tự động bỏ qua `tool_use` thiếu `tool_result` mà sẽ báo lỗi cấu trúc hội thoại.
- **D (Đúng):** Messages API yêu cầu ngay trong lượt `user` kế tiếp phải có đầy đủ `tool_result` tương ứng với mọi `tool_use_id` đã được sinh ra ở lượt `assistant` trước, nếu thiếu sẽ trả về lỗi 400.

</details>

### Câu 4 `hard`

An agent orchestrator executes external API tools that occasionally fail with transient 503 errors. Currently, any tool exception crashes the entire agent loop. How should the orchestrator handle recoverable tool failures?

- **A.** Inject a raw 200-line Python stack trace into the `system` prompt and restart the entire conversation history from turn 1 automatically on error.
- **B.** Swallow the HTTP 503 exception silently and return an empty string `""` as a successful `tool_result` payload to the model.
- **C.** Return a structured `tool_result` with `is_error: true` and an actionable error message so Claude can retry, adjust parameters, or pivot.
- **D.** Automatically mark every tool execution as successful in the audit database regardless of the upstream HTTP status code.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một bộ điều phối agent thực thi các API tool bên ngoài thỉnh thoảng bị lỗi với lỗi 503 tạm thời. Hiện tại, bất kỳ ngoại lệ (exception) nào của tool đều làm sập toàn bộ vòng lặp agent. Bộ điều phối nên xử lý các lỗi tool có thể khôi phục như thế nào?

**Đáp án đúng:** **C**

Trong thiết kế tool runtime cho agent, lỗi có thể phục hồi (recoverable errors) nên được truyền đạt qua `is_error: true` trong `tool_result` kèm gợi ý rõ ràng để mô hình tự phục hồi.

- **A:** Nhồi stack trace vào system prompt và xóa lịch sử hội thoại làm mất ngữ cảnh đang xử lý.
- **B:** Trả về chuỗi rỗng giả thành công khiến agent hiểu nhầm là không có dữ liệu và có thể đưa ra kết luận sai.
- **C (Đúng):** Trả về `tool_result` với `is_error: true` và thông điệp lỗi rõ ràng (có hướng dẫn khắc phục) cho phép agent tự điều chỉnh tham số hoặc chọn chiến lược thay thế thay vì crash.
- **D:** Đánh dấu thành công giả tạo gây sai lệch dữ liệu nghiêm trọng trong hệ thống.

</details>

### Câu 5 `hard`

A fintech company is designing a multi-agent system that performs KYC verification, credit scoring, fraud screening, and final loan underwriting. Regulators require a deterministic audit trail of task delegation, strict step ordering for compliance checks, and centralized error recovery. Which orchestration topology is most appropriate?

- **A.** Deploy an unstructured peer-to-peer agent swarm where each specialist agent broadcasts intermediate findings to a shared chat room and autonomously self-selects when to execute compliance checks.
- **B.** Use a hierarchical Supervisor-Worker architecture backed by an explicit state machine for deterministic ordering and centralized recovery.
- **C.** A single monolithic prompt containing all 45 tools across KYC, credit, fraud, and underwriting, relying on Claude to plan every step ad hoc without workflow boundaries.
- **D.** A fire-and-forget event bus where all four specialist agents execute in parallel and independently email their unverified conclusions directly to the loan applicant.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty fintech đang thiết kế một hệ thống đa agent thực hiện xác minh KYC, chấm điểm tín dụng, sàng lọc gian lận và thẩm định khoản vay cuối cùng. Cơ quan quản lý yêu cầu một dấu vết kiểm toán tất định (deterministic audit trail) về việc ủy quyền tác vụ, thứ tự bước nghiêm ngặt cho các kiểm tra tuân thủ và khôi phục lỗi tập trung. Cấu trúc liên kết điều phối (orchestration topology) nào là phù hợp nhất?

**Đáp án đúng:** **B**

Với các quy trình nghiệp vụ có yêu cầu tuân thủ nghiêm ngặt, thứ tự rõ ràng và cần audit trail tập trung, mô hình Hierarchical Supervisor-Worker kết hợp state machine vượt trội hơn hẳn swarm phi cấu trúc hay monolithic prompt.

- **A:** Peer-to-peer swarm không đảm bảo thứ tự thực thi bắt buộc (deterministic ordering) và rất khó kiểm soát hoặc giải trình audit trail cho cơ quan quản lý tài chính.
- **B (Đúng):** Kiến trúc Supervisor-Worker kết hợp state machine tường minh cho phép kiểm soát chặt chẽ thứ tự các bước tuân thủ (KYC -> Fraud -> Credit -> Underwriting), ghi nhận audit trail rõ ràng và xử lý lỗi tập trung.
- **C:** Nhồi toàn bộ 45 tools vào một prompt duy nhất làm tăng nhiễu chọn tool, tốn context tokens và không đảm bảo được trình tự tuân thủ pháp lý một cách tất định.
- **D:** Cho các agent tự gửi kết quả trực tiếp tới khách hàng mà không qua tổng hợp, kiểm tra chéo và tuân thủ trình tự là cực kỳ rủi ro về mặt vận hành và pháp lý.

</details>

### Câu 6 `hard`

A Supervisor agent delegates data extraction tasks to three specialized Worker agents. Passing the entire raw 40,000-token conversation history to every Worker causes high latency and frequent instruction confusion. What is the recommended handoff pattern between Supervisor and Worker agents?

- **A.** Define typed, schema-validated handoff contracts passing only scoped task goals and minimal context, returning structured summaries.
- **B.** Forward the complete raw message history plus all intermediate tool call payloads to every Worker so no subtle nuance is ever lost.
- **C.** Have each Worker agent query the Supervisor's internal memory via iterative natural language chat turns until it discovers the exact entity IDs and extraction rules it is supposed to execute.
- **D.** Serialize the Supervisor's system prompt and append it to the Worker's `user` message as an unformatted markdown dump.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một Supervisor agent ủy quyền các tác vụ trích xuất dữ liệu cho ba Worker agent chuyên biệt. Việc truyền toàn bộ lịch sử hội thoại thô 40.000 token cho mọi Worker gây ra độ trễ cao và thường xuyên nhầm lẫn hướng dẫn. Mẫu bàn giao (handoff pattern) nào được khuyến nghị giữa Supervisor và Worker agent?

**Đáp án đúng:** **A**

Explicit Handoff Contracts (nguyên tắc context isolation & typed payload) giúp các Worker agent hoạt động như các hàm chuyên biệt có đầu vào/đầu ra rõ ràng, tối ưu chi phí và độ tin cậy của hệ thống multi-agent.

- **A (Đúng):** Handoff contract có cấu trúc rõ ràng (validated bằng JSON Schema/Pydantic) chỉ truyền mục tiêu cụ thể và ngữ cảnh tối thiểu cho Worker, đồng thời nhận về payload tóm tắt có cấu trúc, giúp giảm mạnh token, độ trễ và tránh nhiễu ngữ cảnh.
- **B:** Truyền toàn bộ lịch sử thô 40,000 tokens cho mọi Worker gây lãng phí chi phí, tăng TTFT và dẫn đến hiện tượng context rot làm Worker mất tập trung.
- **C:** Để Worker tự hỏi dò Supervisor qua nhiều lượt chat làm tăng độ trễ và số lượng API calls không cần thiết.
- **D:** Nhồi system prompt của Supervisor vào user message của Worker gây xung đột vai trò (role confusion) và không kiểm soát được định dạng đầu vào/đầu ra.

</details>

---

[Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md)
