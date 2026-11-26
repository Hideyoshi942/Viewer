# Bài tập tình huống — Module 8: Claude Agent SDK & Human-in-the-Loop (HITL)

> Xây dựng agent production với Claude Agent SDK, subagent delegation theo Least Privilege, lifecycle hooks (PreToolUse/PostToolUse), và cơ chế phê duyệt Human-in-the-Loop (HITL).
> **Số câu hỏi:** 7 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

An autonomous finance agent is capable of reading account balances and executing wire transfers. Which architectural pattern provides Human-in-the-Loop (HITL) safety before money is moved?

- **A.** Set `temperature: 0.0` so Claude never makes a mistake on wire transfers.
- **B.** Rely solely on a strict sentence in the `system` prompt instructing Claude to double-check all wire transfer parameters.
- **C.** Intercept `execute_wire_transfer` in app code, pause for human confirmation, and execute if approved (or return `is_error: true` if denied).
- **D.** Disable `tool_use` entirely and instruct Claude to output raw SQL statements for the end user to copy-paste into the production SQL console.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một agent tài chính tự động có khả năng đọc số dư tài khoản và thực hiện chuyển khoản (wire transfers). Mẫu kiến trúc (architectural pattern) nào cung cấp sự an toàn Human-in-the-Loop (HITL) trước khi tiền được chuyển đi?

**Đáp án đúng:** **C**

Với các hành động có rủi ro cao hoặc không thể hoàn tác (chuyển tiền, xóa dữ liệu, gửi email hàng loạt), Human-in-the-Loop phải được thực thi ở tầng code/hook bằng cách chặn `tool_use` trước khi chạy thật và chỉ thực thi khi có phê duyệt.

- **A:** `temperature: 0.0` không ngăn được lỗi logic hay tấn công prompt injection.
- **B:** Chỉ dặn dò trong `system` prompt không đảm bảo an toàn ở tầng hệ thống nếu model bị prompt injection hoặc hiểu nhầm.
- **C (Đúng):** Kiểm soát HITL ở tầng thực thi tool (chặn `tool_use` nhạy cảm, chờ xác nhận từ con người, nếu từ chối thì trả về `tool_result` báo bị từ chối) là rào chắn kỹ thuật chắc chắn nhất.
- **D:** Cách này phá vỡ trải nghiệm tự động hóa của agent cho các thao tác đọc dữ liệu an toàn.

</details>

### Câu 2 `medium`

When using the Claude Agent SDK, what is the primary purpose of `PreToolUse` hooks?

- **A.** To compress and redact the model's `thinking` blocks after the final text response is delivered to the user.
- **B.** To replace the `system` prompt on every iteration of the loop.
- **C.** To automatically fine-tune Claude's weights on successful tool outputs.
- **D.** To intercept tool calls before execution so deterministic code can validate arguments, enforce permissions, or block unsafe actions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Khi sử dụng Claude Agent SDK, mục đích chính của các `PreToolUse` hook là gì?

**Đáp án đúng:** **D**

Trong Claude Agent SDK (và Claude Code), `PreToolUse` hook là điểm chặn xác định (deterministic guardrails) trước khi bất kỳ tool nào chạy, giúp kiểm tra đầu vào, áp dụng chính sách bảo mật hoặc yêu cầu xác nhận.

- **A:** `PreToolUse` không dùng để nén `thinking` block sau khi trả lời xong.
- **B:** `PreToolUse` kiểm soát việc gọi tool, không dùng để thay thế `system` prompt.
- **C:** Hook không thực hiện fine-tuning trọng số model.
- **D (Đúng):** `PreToolUse` hook chạy trước khi tool thực thi, cho phép code xác thực tham số, kiểm tra quyền hạn, ghi log kiểm toán hoặc chặn/từ chối lời gọi tool không an toàn.

</details>

### Câu 3 `hard`

A research assistant uses an orchestrator agent that spawns specialized subagents (e.g., a Web Researcher and a Code Analyzer) using the Claude Agent SDK. What is the key architectural advantage of delegating tasks to subagents with isolated contexts?

- **A.** Each subagent runs in its own clean context window, preventing search noise and verbose tool outputs from polluting the orchestrator.
- **B.** Subagents share the exact same mutable Python memory space with Claude's internal transformer model weights.
- **C.** Subagents eliminate the need for any tool definitions.
- **D.** Subagents bypass all Anthropic API token billing.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một trợ lý nghiên cứu sử dụng một agent điều phối (orchestrator agent) khởi tạo các subagent chuyên biệt (ví dụ: Web Researcher và Code Analyzer) bằng Claude Agent SDK. Lợi thế kiến trúc chính của việc ủy quyền tác vụ cho các subagent với ngữ cảnh cô lập (isolated contexts) là gì?

**Đáp án đúng:** **A**

Mô hình Orchestrator-Subagent tận dụng **Context Isolation**: subagent xử lý các tác vụ nhiều nhiễu (đọc log dài, tìm kiếm nhiều trang) trong context riêng và chỉ trả về kết luận cô đọng cho orchestrator.

- **A (Đúng):** Cô lập ngữ cảnh (context isolation) giúp các bước tìm kiếm/đọc file dài dòng nằm gọn trong subagent; chỉ bản tóm tắt kết quả sạch sẽ được trả về orchestrator, tránh tràn hoặc nhiễu context.
- **B:** Subagent giao tiếp qua API/SDK bằng ngữ cảnh riêng, không chia sẻ bộ nhớ trực tiếp với trọng số của model.
- **C:** Mỗi subagent thường được cấp tập tool chuyên biệt phù hợp với vai trò của nó.
- **D:** Mỗi lượt gọi API của subagent vẫn tính phí token bình thường.

</details>

### Câu 4 `medium`

In the Claude Agent SDK, what is the role of a `PostToolUse` hook?

- **A.** To replace the `tool_use_id` with a random UUID before sending the `tool_result` back to Claude.
- **B.** To prevent the tool from ever being called in the first place by rejecting it before execution.
- **C.** To bypass `max_tokens` limits on the Anthropic API by splitting tool output across multiple turns.
- **D.** Run deterministic logic right after tool execution—such as audit logging, output sanitization, or running a linter after file edits.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong Claude Agent SDK, vai trò của một `PostToolUse` hook là gì?

**Đáp án đúng:** **D**

`PostToolUse` hook thực thi ngay sau khi tool hoàn tất, cho phép hậu xử lý kết quả (sanitization, truncation, auto-linting, telemetry) trước khi đưa lại vào ngữ cảnh của model.

- **A:** Thay đổi `tool_use_id` sẽ làm hỏng vòng lặp hội thoại.
- **B:** Chặn trước khi tool chạy là nhiệm vụ của `PreToolUse` hook.
- **C:** Hook không thể vượt qua giới hạn `max_tokens` của API.
- **D (Đúng):** `PostToolUse` hook chạy ngay sau khi tool thực thi xong, rất hữu ích để ghi log kiểm toán, cắt gọn/lọc dữ liệu nhạy cảm khỏi output, hoặc tự động chạy linter/formatter sau khi sửa file.

</details>

### Câu 5 `medium`

An orchestrator agent delegates a subtask to a subagent using the Claude Agent SDK. Which configuration best follows the principle of least privilege for the subagent?

- **A.** Restrict the subagent's `allowed_tools` (or `tools` list) to only the specific read-only or domain-scoped tools needed for its subtask.
- **B.** Give every subagent unrestricted admin access to all production tools and databases.
- **C.** Allow subagents to recursively spawn unlimited subagents without depth limits.
- **D.** Share the orchestrator's entire raw conversation history and full tool outputs with every subagent by default across turns.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một agent điều phối (orchestrator agent) ủy quyền một tác vụ con cho một subagent bằng Claude Agent SDK. Cấu hình nào tuân thủ tốt nhất nguyên tắc đặc quyền tối thiểu (principle of least privilege) cho subagent?

**Đáp án đúng:** **A**

Khi thiết kế subagent, cần áp dụng **Tool Scoping** (chỉ cấp đúng tool cần thiết) và **Context Scoping** (chỉ truyền ngữ cảnh cần thiết) để tối ưu độ chính xác và bảo mật.

- **A (Đúng):** Giới hạn danh sách tool của subagent đúng với phạm vi nhiệm vụ (ví dụ subagent nghiên cứu chỉ có `Read`/`Grep`, không có `Write`/`Bash`) giúp tăng tính an toàn và giảm nhiễu lựa chọn tool.
- **B:** Cấp toàn quyền cho mọi subagent vi phạm nguyên tắc đặc quyền tối thiểu.
- **C:** Cho phép đệ quy không giới hạn dễ gây bùng nổ chi phí và treo hệ thống.
- **D:** Mục tiêu của subagent là cô lập ngữ cảnh; chỉ nên truyền phần nhiệm vụ và thông tin cần thiết.

</details>

### Câu 6 `hard`

A customer-facing agent has a `refund_order` tool. When the agent calls `refund_order`, the backend pauses for Human-in-the-Loop approval, and the human manager clicks "Deny". How should the application resume the agent loop so Claude handles the denial gracefully?

- **A.** Return a `tool_result` matching `tool_use_id` with `is_error: true` explaining that the refund was denied by a human reviewer.
- **B.** Return `is_error: false` with `"Refund succeeded"`.
- **C.** Immediately crash the user session with an HTTP 500 Internal Server Error.
- **D.** Delete the `tool_use` block from the assistant message and pretend the refund tool call never happened in conversation history.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một agent phục vụ khách hàng có tool `refund_order`. Khi agent gọi `refund_order`, backend tạm dừng để chờ phê duyệt Human-in-the-Loop, và người quản lý bấm "Deny". Ứng dụng nên tiếp tục vòng lặp agent như thế nào để Claude xử lý việc từ chối một cách khéo léo?

**Đáp án đúng:** **A**

Trong luồng Human-in-the-Loop, nếu người duyệt từ chối lời gọi tool, ứng dụng vẫn phải gửi lại `tool_result` (với `is_error: true` và thông điệp từ chối rõ ràng) để giữ đúng giao thức Messages API và để Claude phản hồi phù hợp.

- **A (Đúng):** Trả về `tool_result` đúng `tool_use_id` với `is_error: true` và lý do từ chối giúp vòng lặp hợp lệ về mặt API và cho phép Claude giải thích lịch sự hoặc đề xuất phương án thay thế cho khách hàng.
- **B:** Báo thành công giả sẽ khiến Claude nói dối khách hàng rằng tiền đã được hoàn.
- **C:** Trải nghiệm người dùng kém khi từ chối phê duyệt là nghiệp vụ bình thường.
- **D:** Chỉnh sửa lịch sử `assistant` làm mất ngữ cảnh về ý định đã bị từ chối.

</details>

### Câu 7 `hard`

Which TWO capabilities are provided natively by the Claude Agent SDK when building production agents? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Automatic SQL database hosting and credit card payment processing.
- **B.** A built-in managed agentic loop with tool execution, context management, and permission/hook callbacks (`PreToolUse`, `PostToolUse`).
- **C.** First-class support for spawning isolated subagents and connecting to MCP servers.
- **D.** Guaranteed zero-token execution that bypasses Anthropic API billing.
- **E.** Browser-side execution of local `bash` shell commands without a backend.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** HAI khả năng nào được cung cấp sẵn (natively) bởi Claude Agent SDK khi xây dựng các agent production? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, C**

Claude Agent SDK giúp rút ngắn thời gian xây dựng agent nhờ cung cấp sẵn vòng lặp agentic, hooks kiểm soát (`PreToolUse`/`PostToolUse`), subagents cô lập context và kết nối MCP.

- **A:** Agent SDK là framework phát triển agent, không phải dịch vụ hosting DB hay cổng thanh toán.
- **B (Đúng):** Claude Agent SDK cung cấp sẵn vòng lặp agentic hoàn chỉnh, quản lý ngữ cảnh và hệ thống hook (`PreToolUse`, `PostToolUse`, v.v.) để kiểm soát an toàn.
- **C (Đúng):** Claude Agent SDK hỗ trợ sẵn kiến trúc subagent cô lập ngữ cảnh và tích hợp trực tiếp với các MCP server.
- **D:** Agent chạy qua SDK vẫn tiêu thụ và tính phí token API bình thường.
- **E:** Trình duyệt không thể chạy `bash` cục bộ trực tiếp.

</details>

---

[Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md)
