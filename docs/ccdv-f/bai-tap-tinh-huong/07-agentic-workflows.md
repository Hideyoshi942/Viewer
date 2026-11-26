# Bài tập tình huống — Module 7: Agentic Workflows, stop_reason Loop & Multi-Agent Patterns

> Phân biệt Workflows (Prompt Chaining, Routing, Parallelization, Evaluator-Optimizer) vs Autonomous Agents, vòng lặp dựa trên stop_reason (tool_use vs end_turn) và Orchestrator-Workers.
> **Số câu hỏi:** 9 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `easy`

In a standard Claude tool-use agentic loop, how does the application know whether to execute a tool and continue the loop versus returning the final answer to the user?

- **A.** Check if `usage.output_tokens` is greater than 100.
- **B.** Always run exactly three loop iterations regardless of the `stop_reason` or content blocks returned by Claude.
- **C.** Parse the assistant's text output for the substring `"CALL_TOOL"` or XML tool tags before executing any functions.
- **D.** Check `response.stop_reason`: continue the loop if it equals `"tool_use"`, and exit with the text response if it equals `"end_turn"`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong một vòng lặp agent sử dụng tool (tool-use agentic loop) tiêu chuẩn của Claude, làm thế nào ứng dụng biết được khi nào cần thực thi một tool và tiếp tục vòng lặp so với khi nào trả về câu trả lời cuối cùng cho người dùng?

**Đáp án đúng:** **D**

Vòng lặp agentic chuẩn xoay quanh `response.stop_reason`: khi là `"tool_use"`, ứng dụng thực thi các block `tool_use` và gửi lại `tool_result`; khi là `"end_turn"`, vòng lặp kết thúc và trả nội dung cho người dùng.

- **A:** Số lượng output tokens không cho biết model có muốn gọi tool hay không.
- **B:** Số vòng lặp phụ thuộc vào bài toán và `stop_reason`, nhưng vẫn nên có một giới hạn trần (`max_iterations`) để tránh lặp vô tận.
- **C:** Messages API trả về cấu trúc `tool_use` content block và `stop_reason` rõ ràng, không cần parse chuỗi văn bản thủ công.
- **D (Đúng):** `stop_reason == "tool_use"` báo hiệu Claude đang chờ ứng dụng thực thi tool và gửi `tool_result` lại; `stop_reason == "end_turn"` nghĩa là Claude đã hoàn thành câu trả lời.

</details>

### Câu 2 `medium`

When Claude emits two `tool_use` blocks in a single assistant turn (parallel tool calling), how must the application return the `tool_result` blocks in the next `user` message?

- **A.** Send a single `user` message whose `content` array contains both `tool_result` blocks, each matching its corresponding `tool_use_id`.
- **B.** Send two separate consecutive `user` messages in the `messages` array, one for each `tool_result` block.
- **C.** Concatenate both tool outputs into a single plain `text` block without specifying any `tool_use_id` field.
- **D.** Return only the first `tool_result` and ignore the second `tool_use` block.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Khi Claude phát ra hai khối `tool_use` trong một lượt phản hồi của assistant (parallel tool calling), ứng dụng phải trả về các khối `tool_result` trong `user` message tiếp theo như thế nào?

**Đáp án đúng:** **A**

Với parallel tool use (nhiều `tool_use` trong một response), ứng dụng có thể thực thi song song các tool rồi gộp tất cả `tool_result` (đúng `tool_use_id`) vào mảng `content` của một `user` message duy nhất ở lượt tiếp theo.

- **A (Đúng):** Anthropic Messages API yêu cầu mọi `tool_use` trong một lượt `assistant` đều phải nhận được `tool_result` tương ứng (khớp `tool_use_id`) trong cùng một `user` message kế tiếp.
- **B:** Không được tách thành hai `user` message riêng lẻ; mọi `tool_result` cho lượt `assistant` đó phải nằm trong cùng một `user` message tiếp theo.
- **C:** Cần dùng đúng cấu trúc `type: "tool_result"` với `tool_use_id` tương ứng.
- **D:** Nếu thiếu `tool_result` cho bất kỳ `tool_use_id` nào ở lượt trước, API sẽ trả về lỗi 400.

</details>

### Câu 3 `medium`

An agent executes a database query tool, and the database throws a syntax or permission error. What is the best practice for reporting this failure back to Claude inside the agentic loop?

- **A.** Omit the `tool_result` block completely and send a new `user` text message instructing Claude to try a different query.
- **B.** Return a `tool_result` block with `is_error: true` and a clear error message in `content` so Claude can self-correct or inform the user.
- **C.** Return `is_error: false` with an empty string so Claude assumes zero matching rows were found in the database.
- **D.** Immediately terminate the entire backend process with an unhandled exception.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một agent thực thi một tool truy vấn cơ sở dữ liệu, và cơ sở dữ liệu ném ra lỗi cú pháp hoặc lỗi phân quyền. Thực hành tốt nhất để báo cáo lỗi này lại cho Claude bên trong vòng lặp agentic là gì?

**Đáp án đúng:** **B**

Trong `tool_result`, trường `is_error: true` cùng mô tả lỗi súc tích là cơ chế chuẩn giúp agent nhận biết lỗi công cụ và tự điều chỉnh (self-correction) ở lượt suy luận tiếp theo.

- **A:** Bỏ qua `tool_result` cho một `tool_use` đang chờ sẽ gây lỗi API 400.
- **B (Đúng):** Đặt `is_error: true` trong `tool_result` kèm thông báo lỗi rõ ràng giúp Claude biết tool thất bại để tự sửa tham số, thử cách khác, hoặc giải thích minh bạch cho người dùng.
- **C:** Trả về chuỗi rỗng với `is_error: false` sẽ đánh lừa Claude rằng truy vấn thành công nhưng không có dữ liệu, dẫn đến kết luận sai.
- **D:** Crash tiến trình làm mất khả năng tự phục hồi (self-correction) của agent.

</details>

### Câu 4 `medium`

A team is building a production agentic loop on top of the Messages API. Which TWO safeguards are essential to prevent runaway costs and infinite loops? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Track cumulative `input_tokens` and `output_tokens` across turns and enforce a per-task token/cost budget.
- **B.** Remove `stop_reason` checks and rely on HTTP 529 errors to terminate the loop.
- **C.** Enforce a strict `max_iterations` (or step budget) limit on the agent loop and exit gracefully if exceeded.
- **D.** Pass `max_tokens: 100000` on every intermediate tool-calling turn.
- **E.** Set `temperature: 1.0` on every turn so the agent explores more random tools.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm đang xây dựng một vòng lặp agentic trên production dựa trên Messages API. HAI biện pháp bảo vệ nào là thiết yếu để ngăn chặn chi phí tăng mất kiểm soát và vòng lặp vô hạn? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, C**

Để vận hành agentic loop an toàn ở môi trường production, bắt buộc phải có **giới hạn số bước (`max_iterations`)** và **ngân sách token/chi phí tích lũy** cho mỗi phiên chạy.

- **A (Đúng):** Theo dõi tổng token tiêu thụ qua từng lượt giúp kiểm soát ngân sách và ngắt tác vụ trước khi chi phí vượt ngưỡng.
- **B:** Bỏ kiểm tra `stop_reason` là sai hoàn toàn; không thể dựa vào lỗi 529 để dừng vòng lặp.
- **C (Đúng):** Giới hạn số vòng lặp tối đa (`max_iterations`) ngăn agent lặp vô tận khi gặp lỗi tool hoặc không hội tụ.
- **D:** Đặt `max_tokens` quá lớn một cách không cần thiết không giúp ngăn lặp vô tận và có thể làm tốn hạn mức OTPM.
- **E:** Tăng `temperature` lên 1.0 làm tăng tính ngẫu nhiên, không giúp kiểm soát chi phí hay ngăn lặp vô tận.

</details>

### Câu 5 `hard`

A developer is choosing between a deterministic multi-step workflow (chaining fixed LLM calls) and an autonomous agent loop. Which TWO scenarios favor a deterministic workflow over an autonomous agent? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** The system must iteratively debug failing unit tests by editing arbitrary files until all tests pass.
- **B.** The number of steps and required tools cannot be known in advance and depends on intermediate search discoveries.
- **C.** The task has a fixed, well-defined sequence of steps (e.g., extract fields -> translate -> format report) where predictability and low latency matter.
- **D.** The application requires dynamic delegation to multiple specialized subagents based on ambiguous user intent.
- **E.** Regulatory compliance requires strict, auditable control over the exact order of operations with zero unplanned branching.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên đang lựa chọn giữa một workflow đa bước tất định (nối chuỗi các lệnh gọi LLM cố định) và một vòng lặp agent tự chủ (autonomous agent loop). HAI kịch bản nào ưu tiên sử dụng workflow tất định hơn là agent tự chủ? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Nguyên tắc thiết kế của Anthropic: luôn ưu tiên **Workflow xác định** (đơn giản, dễ kiểm soát, chi phí thấp) khi các bước đã biết trước; chỉ dùng **Autonomous Agent** khi bài toán mở, số bước thay đổi linh hoạt theo ngữ cảnh.

- **A:** Sửa lỗi code và chạy lại test theo phản hồi là bài toán mở đặc trưng của Agentic Loop.
- **B:** Khi số bước không thể biết trước và phụ thuộc vào kết quả khám phá trung gian, đó chính là lúc cần Autonomous Agent.
- **C (Đúng):** Khi quy trình các bước đã cố định và rõ ràng, workflow tuần tự (prompt chaining) cho kết quả ổn định, chi phí thấp và độ trễ dự đoán được hơn hẳn agent tự chủ.
- **D:** Điều phối động sang nhiều subagent là mẫu thiết kế của Agent, không phải workflow cố định.
- **E (Đúng):** Các bài toán đòi hỏi kiểm toán chặt chẽ và thứ tự thực thi bất biến nên dùng workflow xác định thay vì để LLM tự quyết định nhánh rẽ.

</details>

### Câu 6 `hard`

A developer builds an agentic loop that calls `messages.create` with tools. During testing, Claude returns a `tool_use` block, the tool runs, and the developer forgets to append the `assistant` message containing the `tool_use` block before appending the `user` message with `tool_result`. What happens?

- **A.** The SDK automatically deletes all previous user messages in the conversation history to repair the turn sequence.
- **B.** The API returns HTTP 400 `invalid_request_error` because every `tool_result` must match a `tool_use` in the preceding `assistant` message.
- **C.** Claude silently infers which tool was called from the `tool_result` content and continues the turn normally.
- **D.** The API automatically switches the response `stop_reason` to `"end_turn"` and drops the orphaned `tool_result`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên xây dựng một vòng lặp agentic gọi `messages.create` với các tool. Trong quá trình kiểm thử, Claude trả về một khối `tool_use`, tool chạy xong, và lập trình viên quên nối thêm `assistant` message chứa khối `tool_use` trước khi nối `user` message chứa `tool_result`. Điều gì xảy ra?

**Đáp án đúng:** **B**

Trong agentic loop, luôn phải lưu và gửi lại theo đúng cặp: `messages.append({"role": "assistant", "content": response.content})` rồi mới đến `messages.append({"role": "user", "content": [tool_results...]})`.

- **A:** SDK không tự ý xóa lịch sử hội thoại.
- **B (Đúng):** Messages API kiểm tra nghiêm ngặt cấu trúc hội thoại: mỗi `tool_result` trong lượt `user` bắt buộc phải khớp `tool_use_id` với một `tool_use` nằm trong lượt `assistant` ngay trước nó, nếu không sẽ báo lỗi 400.
- **C:** API không tự suy đoán `tool_use` bị thiếu.
- **D:** API từ chối request với lỗi 400 ngay tại bước validation.

</details>

### Câu 7 `medium`

A document analysis pipeline processes 50-page reports by running three independent tasks in parallel: (1) extract financial metrics, (2) check compliance clauses, and (3) summarize executive risks, then merges the results. Which workflow pattern does this illustrate?

- **A.** Zero-shot refusal handling
- **B.** Unbounded autonomous recursion
- **C.** Parallelization (Sectioning / Fan-out & Fan-in)
- **D.** Single-threaded prompt chaining without concurrency

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một pipeline phân tích tài liệu xử lý các báo cáo 50 trang bằng cách chạy song song ba tác vụ độc lập: (1) trích xuất chỉ số tài chính, (2) kiểm tra điều khoản tuân thủ và (3) tóm tắt rủi ro điều hành, sau đó gộp kết quả lại. Mẫu workflow nào được minh họa ở đây?

**Đáp án đúng:** **C**

Mẫu **Parallelization (Sectioning)** tách các khía cạnh độc lập (trích xuất số liệu, kiểm tra tuân thủ, tóm tắt rủi ro) để các lời gọi Claude chạy song song, vừa nhanh hơn vừa chính xác hơn một prompt ôm đồm tất cả.

- **A:** Không liên quan đến xử lý từ chối.
- **B:** Đây là workflow xác định có 3 nhánh cố định chạy song song, không phải đệ quy tự chủ.
- **C (Đúng):** Chia một đầu vào lớn thành các tác vụ con độc lập chạy song song (Sectioning/Parallelization) rồi tổng hợp kết quả giúp giảm mạnh độ trễ và tăng độ tập trung cho từng prompt.
- **D:** Ba tác vụ độc lập chạy đồng thời là Parallelization, không phải chạy nối tiếp đơn luồng.

</details>

### Câu 8 `medium`

An AI coding workflow generates a Python function, runs a separate reviewer call to critique edge cases and security flaws, and feeds the critique back to the generator to refine the code until it passes. Which Anthropic workflow pattern is this?

- **A.** Message Batching
- **B.** Static routing
- **C.** Context window compaction
- **D.** Evaluator-Optimizer loop

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một workflow lập trình AI sinh ra một hàm Python, chạy một lệnh gọi reviewer riêng biệt để phê bình các trường hợp biên và lỗ hổng bảo mật, rồi đưa phản hồi phê bình đó trở lại cho bộ sinh code để tinh chỉnh cho đến khi đạt yêu cầu. Đây là mẫu workflow nào của Anthropic?

**Đáp án đúng:** **D**

**Evaluator-Optimizer** rất hiệu quả cho các tác vụ có tiêu chí đánh giá rõ ràng (code quality, dịch thuật, viết kỹ thuật) nơi phản hồi lặp giúp cải thiện chất lượng đầu ra từng bước.

- **A:** Message Batching là xử lý bất đồng bộ hàng loạt.
- **B:** Routing chỉ phân loại đầu vào để điều hướng một lần, không có vòng lặp phản biện-tinh chỉnh.
- **C:** Context compaction là kỹ thuật nén lịch sử hội thoại.
- **D (Đúng):** Mẫu **Evaluator-Optimizer** gồm một model (Generator) tạo sản phẩm và một model/bộ kiểm tra (Evaluator) phản biện, lặp lại chu trình tinh chỉnh cho tới khi đạt chuẩn.

</details>

### Câu 9 `medium`

A developer is designing tools for an autonomous coding agent. Which TWO practices improve the agent's ability to succeed without getting stuck in error loops? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Return actionable, concise error messages in `tool_result` (e.g., exact line number or missing field) rather than generic "Error 500" strings.
- **B.** Return full raw binary core dumps and stack memory inside `tool_result` for debugging.
- **C.** Truncate or paginate huge tool outputs (e.g., 50,000-line log files) and inform the agent how to fetch specific slices if needed.
- **D.** Hide all error details and return an empty JSON object `{}` whenever a tool call fails.
- **E.** Allow the agent to call the exact same failing tool with identical arguments 100 times in a row without intervention.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên đang thiết kế các tool cho một agent lập trình tự chủ. HAI thực hành nào giúp nâng cao khả năng thành công của agent mà không bị mắc kẹt trong các vòng lặp lỗi? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, C**

Thiết kế **Agent-Computer Interface (ACI)** tốt đòi hỏi `tool_result` phải súc tích, có thông tin hành động cụ thể khi lỗi, và biết cắt gọn/phân trang với dữ liệu quá lớn.

- **A (Đúng):** Thông báo lỗi cụ thể (ACI - Agent-Computer Interface tốt) giúp agent biết chính xác cần sửa tham số hay dòng code nào ở bước tiếp theo.
- **B:** Dữ liệu binary thô làm lãng phí token và vô nghĩa với LLM.
- **C (Đúng):** Giới hạn kích thước `tool_result` tránh làm tràn context window và giữ agent tập trung.
- **D:** Trả về `{}` không cung cấp thông tin để agent tự sửa lỗi.
- **E:** Cần có cơ chế phát hiện lặp (loop detection) hoặc giới hạn số bước.

</details>

---

[Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md)
