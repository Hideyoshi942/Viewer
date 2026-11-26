# Bài tập tình huống — Module 10: Extended Thinking & Context Window Management

> Cấu hình Extended Thinking (thinking.budget_tokens < max_tokens), bảo toàn thinking blocks + signature khi dùng Tool Use, Context Engineering và RAG Reranking.
> **Số câu hỏi:** 10 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A developer enables Extended Thinking on Claude by passing `thinking: {"type": "enabled", "budget_tokens": 8000}` and sets `max_tokens: 4000`. What will the Anthropic API do?

- **A.** Reject the request with a 400 validation error because `max_tokens` must be strictly greater than `thinking.budget_tokens`.
- **B.** Allow 8,000 thinking tokens plus 4,000 output tokens for a combined total of 12,000 generated tokens in the Messages API response.
- **C.** Automatically expand `max_tokens` to 12,000 behind the scenes.
- **D.** Ignore `budget_tokens` and run without Extended Thinking.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên bật Extended Thinking trên Claude bằng cách truyền `thinking: {"type": "enabled", "budget_tokens": 8000}` và đặt `max_tokens: 4000`. Anthropic API sẽ làm gì?

**Đáp án đúng:** **A**

Khi bật Extended Thinking (`thinking.type = "enabled"`), `max_tokens` bao gồm cả token suy nghĩ (`thinking`) lẫn token trả lời cuối cùng. Do vậy, quy tắc bắt buộc là `max_tokens > thinking.budget_tokens` (và `budget_tokens >= 1024`).

- **A (Đúng):** Trong Extended Thinking, `budget_tokens` nằm bên trong tổng `max_tokens` của response. Do đó `max_tokens` bắt buộc phải lớn hơn `budget_tokens` (ví dụ `max_tokens: 16000`, `budget_tokens: 8000`), nếu không API sẽ báo lỗi 400.
- **B:** `max_tokens` là tổng trần cho cả `thinking` tokens và `text`/`tool_use` tokens cộng lại.
- **C:** API không tự động tăng `max_tokens` giúp bạn.
- **D:** API không âm thầm bỏ qua tham số hợp lệ mà sẽ trả về lỗi validation 400.

</details>

### Câu 2 `hard`

An automated coding agent uses Extended Thinking (`thinking` blocks) together with Tool Use. When Claude returns a `tool_use` block preceded by a `thinking` block, what must the agent send back in the conversation history alongside the `tool_result`?

- **A.** Convert the `thinking` block into a `text` block so it is easier for Claude to read.
- **B.** Preserve unmodified `thinking` (and `redacted_thinking`) blocks with their `signature` in `assistant` before `tool_result`.
- **C.** Strip the `thinking` block to save input tokens and only include the `tool_use` block in the `assistant` turn message payload.
- **D.** Move the `thinking` text into the `system` prompt for the next turn.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một agent lập trình tự động sử dụng Extended Thinking (các khối `thinking`) kết hợp với Tool Use. Khi Claude trả về một khối `tool_use` đứng sau một khối `thinking`, agent phải gửi kèm gì trở lại trong lịch sử hội thoại cùng với `tool_result`?

**Đáp án đúng:** **B**

Khi kết hợp Extended Thinking với Tool Use, ứng dụng phải truyền lại nguyên vẹn `thinking` block (bao gồm `signature` và cả `redacted_thinking` nếu có) trong message `assistant` trước khi gửi `tool_result` để Claude tiếp tục mạch suy luận chính xác.

- **A:** Thay đổi loại block hoặc chỉnh sửa nội dung `thinking` sẽ làm sai lệch chữ ký xác thực (`signature`) của block.
- **B (Đúng):** Trong vòng lặp tool-use có Extended Thinking, bạn BẮT BUỘC phải giữ nguyên toàn bộ `thinking` block (kèm `signature`) và `tool_use` block của lượt `assistant` trước khi gửi `tool_result` ở lượt `user`.
- **C:** Xóa hoặc sửa `thinking` block trong lượt `assistant` đang thực thi tool sẽ làm đứt mạch suy luận của model và có thể bị API từ chối (lỗi signature).
- **D:** Không được di chuyển `thinking` block sang `system` prompt.

</details>

### Câu 3 `medium`

A developer wants to compare Claude Sonnet and Claude Haiku for an extraction pipeline. Which parameter restriction applies when Extended Thinking is enabled (`thinking: {"type": "enabled"}`)?

- **A.** The `system` prompt parameter is disabled when Extended Thinking is enabled so thinking remains unbiased.
- **B.** Prompt Caching cannot be used together with Extended Thinking.
- **C.** `temperature` cannot be manually tuned, and forced tool choice (`tool_choice: {"type": "tool"}` or `"any"`) is restricted.
- **D.** Streaming is prohibited when Extended Thinking is enabled.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên muốn so sánh Claude Sonnet và Claude Haiku cho một pipeline trích xuất dữ liệu. Ràng buộc tham số nào được áp dụng khi Extended Thinking được bật (`thinking: {"type": "enabled"}`)?

**Đáp án đúng:** **C**

Extended Thinking có một số ràng buộc API quan trọng: không tùy chỉnh `temperature`/`top_k`, không dùng `tool_choice` dạng ép buộc (`any`/`tool`), và không hỗ trợ prefill assistant message.

- **A:** `system` prompt vẫn hoạt động bình thường khi bật Extended Thinking.
- **B:** Prompt Caching hoàn toàn tương thích và rất hữu ích khi dùng chung với Extended Thinking.
- **C (Đúng):** Khi bật Extended Thinking, bạn không được tùy chỉnh `temperature` (hoặc `top_k`), và chỉ hỗ trợ `tool_choice` ở chế độ `auto` hoặc `none` (không hỗ trợ ép gọi tool cụ thể `type: "tool"` hay `"any"`).
- **D:** Streaming được khuyến khích khi dùng Extended Thinking để tránh HTTP timeout và nhận `thinking_delta` theo thời gian thực.

</details>

### Câu 4 `medium`

An extraction pipeline feeds 40,000 tokens of legal contract text plus a short 50-word question to Claude. Where should the 40,000-token contract be placed relative to the question to maximize recall and accuracy?

- **A.** Place the 50-word question at the very top and the 40,000-token contract at the bottom.
- **B.** Place the 40,000-token legal contract inside the `stop_sequences` array parameter.
- **C.** Split the 40,000-token contract randomly across 10 `assistant` messages.
- **D.** Place the 40,000-token contract at the top of the prompt (wrapped in XML tags) and the 50-word question at the bottom.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một pipeline trích xuất đưa vào 40.000 token văn bản hợp đồng pháp lý cùng với một câu hỏi ngắn 50 từ cho Claude. Hợp đồng 40.000 token nên được đặt ở đâu so với câu hỏi để tối đa hóa khả năng truy xuất (recall) và độ chính xác?

**Đáp án đúng:** **D**

Với long-context prompting trên Claude, nguyên tắc quan trọng là **Long data at the top, query at the bottom**: đặt dữ liệu/tài liệu dài ở phía trên (trong thẻ XML) và đặt câu hỏi/nhiệm vụ ở cuối prompt.

- **A:** Đặt câu hỏi ở trên tài liệu dài dễ làm giảm khả năng tập trung của mô hình vào yêu cầu ở cuối ngữ cảnh.
- **B:** `stop_sequences` chỉ dùng cho các chuỗi ngắn đánh dấu dừng sinh văn bản.
- **C:** Chia nhỏ tài liệu vào vai `assistant` làm sai ngữ nghĩa hội thoại.
- **D (Đúng):** Theo thực nghiệm với ngữ cảnh dài (long-context prompting), đặt tài liệu dài ở đầu và câu hỏi/chỉ thị ở cuối giúp cải thiện đáng kể chất lượng truy xuất và độ chính xác (lên tới ~30%).

</details>

### Câu 5 `hard`

An agentic coding assistant starts degrading in accuracy after 40 turns of conversation filled with verbose file reads and test logs. Which TWO context management strategies effectively mitigate context rot while preserving task continuity? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Clear or trim stale `tool_result` payloads from earlier turns while keeping recent turns and key decisions intact.
- **B.** Perform context compaction by summarizing older turns and completed tool outputs into a concise state summary before continuing.
- **C.** Randomly delete every second `user` message while leaving all `assistant` messages intact.
- **D.** Disable the `system` prompt after turn 10 to free up space in the context window.
- **E.** Increase `temperature` to `1.0` after turn 20 to refresh Claude's memory.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một trợ lý lập trình agentic bắt đầu suy giảm độ chính xác sau 40 lượt hội thoại chứa đầy kết quả đọc tệp dài dòng và log kiểm thử. HAI chiến lược quản lý ngữ cảnh nào giúp giảm thiểu hiệu quả tình trạng suy giảm ngữ cảnh (context rot) mà vẫn bảo toàn tính liên tục của tác vụ? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, B**

Khi hội thoại kéo dài, hiện tượng **context rot** (nhiễu và suy giảm độ chính xác) xảy ra. Hai chiến lược quản lý ngữ cảnh hiệu quả là **Compaction** (tóm tắt trạng thái) và **Tool Result Clearing** (xóa/cắt gọn output tool cũ).

- **A (Đúng):** Dọn dẹp các `tool_result` cũ, cồng kềnh không còn cần thiết giúp giữ cửa sổ ngữ cảnh sạch sẽ và tập trung vào thông tin hiện tại.
- **B (Đúng):** Context compaction (tóm tắt các lượt cũ và log tool dài thành trạng thái cô đọng) giúp giải phóng context window và giảm nhiễu (context rot).
- **C:** Xóa ngẫu nhiên message `user` sẽ phá vỡ cấu trúc xen kẽ hợp lệ và làm hỏng cặp `tool_use`/`tool_result`.
- **D:** Bỏ `system` prompt khiến agent quên mất vai trò và các quy tắc cốt lõi.
- **E:** `temperature` không giúp khắc phục suy giảm ngữ cảnh.

</details>

### Câu 6 `medium`

A developer wants Claude to solve a complex algorithmic optimization problem using Extended Thinking, and chooses `budget_tokens: 10000`. How are thinking tokens billed?

- **A.** Thinking tokens are billed as `cache_read_input_tokens`.
- **B.** Thinking tokens generated by the model are billed as `output_tokens`.
- **C.** You are always billed for the entire `budget_tokens` even if Claude only thinks for 500 tokens.
- **D.** Thinking tokens are completely free and never billed.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên muốn Claude giải quyết một bài toán tối ưu hóa thuật toán phức tạp bằng Extended Thinking và chọn `budget_tokens: 10000`. Các token suy luận (thinking tokens) được tính phí như thế nào?

**Đáp án đúng:** **B**

Với Extended Thinking, `budget_tokens` là giới hạn trên cho quá trình suy nghĩ. Số token suy nghĩ thực tế được tính vào `output_tokens` khi xuất hóa đơn (và trong các lượt sau của hội thoại thông thường, `thinking` block cũ thường được lược bỏ khỏi input bởi API/hoặc không tính lại ngoại trừ trong vòng tool use).

- **A:** Không phải `cache_read_input_tokens`; chúng là token do model sinh ra nên tính vào `output_tokens`.
- **B (Đúng):** Tất cả token sinh ra trong `thinking` block (kể cả phần bị ẩn trong `redacted_thinking`) đều được tính vào `output_tokens` và tính phí theo đơn giá output token.
- **C:** `budget_tokens` chỉ là mức trần tối đa; bạn chỉ trả tiền cho số token model thực sự sinh ra.
- **D:** Thinking tokens vẫn tiêu tốn tài nguyên suy luận và được tính phí như output tokens.

</details>

### Câu 7 `hard`

An engineering team builds a multi-turn coding agent that uses Extended Thinking. In turn 1, Claude outputs a `thinking` block and a `text` block (no tool call). In turn 2, the user sends a follow-up question. How does the API treat the turn-1 `thinking` block if you send it back in the conversation history?

- **A.** The API throws a 400 error if any previous `end_turn` assistant message is included.
- **B.** Thinking blocks from turn 1 permanently lock `max_tokens` and `temperature` for the rest of the user session.
- **C.** For non-tool turns, older `thinking` blocks are ignored/stripped automatically; inside an active tool-use loop you must preserve them.
- **D.** You must manually translate every `thinking` block into a `user` message.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ thuật xây dựng một agent lập trình nhiều lượt có sử dụng Extended Thinking. Ở lượt 1, Claude xuất ra một khối `thinking` và một khối `text` (không có lệnh gọi tool). Ở lượt 2, người dùng gửi câu hỏi tiếp theo. API xử lý khối `thinking` của lượt 1 như thế nào nếu bạn gửi lại nó trong lịch sử hội thoại?

**Đáp án đúng:** **C**

Quy tắc quản lý `thinking` block trong hội thoại: giữ nguyên toàn bộ `thinking` block (kèm `signature`) trong suốt các bước `tool_use` -> `tool_result` của cùng một lượt; còn qua lượt `user` mới sau `end_turn`, API tự động loại bỏ các `thinking` block cũ khỏi cửa sổ ngữ cảnh.

- **A:** Lịch sử hội thoại `assistant` hoàn toàn hợp lệ ở các lượt tiếp theo.
- **B:** Mỗi request có thể cấu hình `max_tokens` độc lập.
- **C (Đúng):** Khi một lượt `assistant` đã kết thúc hoàn toàn (`end_turn`), các `thinking` block của lượt đó không cần thiết cho lượt mới và hệ thống tự động bỏ qua khỏi context tính phí; nhưng khi đang dở vòng lặp `tool_use` -> `tool_result`, bạn bắt buộc phải giữ nguyên `thinking` block của lượt đó.
- **D:** Không bao giờ chuyển `thinking` block thành `user` message.

</details>

### Câu 8 `medium`

Which TWO statements about Extended Thinking in Claude are true? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** `thinking.budget_tokens` must be at least 1,024 tokens and strictly less than `max_tokens`.
- **B.** Extended Thinking is most beneficial for complex reasoning tasks such as math, multi-step coding, architecture planning, and deep analysis.
- **C.** Extended Thinking allows setting `temperature` to `0.2` and `tool_choice` to `{"type": "any"}` simultaneously.
- **D.** Extended Thinking reduces Time-To-First-Token (TTFT) for simple FAQ chatbots.
- **E.** `redacted_thinking` blocks should be deleted from `assistant` messages during tool-use loops.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** HAI phát biểu nào sau đây về Extended Thinking trong Claude là đúng? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, B**

Extended Thinking dành cho bài toán suy luận sâu với quy tắc `budget_tokens >= 1024` và `budget_tokens < max_tokens`, đồng thời không dùng cho tác vụ cần độ trễ cực thấp như FAQ đơn giản.

- **A (Đúng):** Ngưỡng tối thiểu của `budget_tokens` là 1,024 và bắt buộc nhỏ hơn `max_tokens`.
- **B (Đúng):** Extended Thinking giúp cải thiện rõ rệt độ chính xác trên các bài toán suy luận nhiều bước (toán, code phức tạp, lập kế hoạch).
- **C:** Khi bật Extended Thinking, không được tùy chỉnh `temperature` và không hỗ trợ `tool_choice` dạng ép buộc (`any` hoặc `tool`).
- **D:** Extended Thinking làm TĂNG độ trễ vì model phải suy nghĩ trước khi trả lời user.
- **E:** `redacted_thinking` cũng phải được giữ nguyên vẹn trong `assistant` message suốt vòng lặp tool-use.

</details>

### Câu 9 `hard`

A RAG system retrieves 25 document chunks and stuffs all 25 into the prompt, even though only 2 chunks are relevant. As a result, Claude's answer accuracy drops and latency rises. Which context engineering principle explains this issue?

- **A.** Context pollution: irrelevant chunks distract attention and raise cost; reranking and filtering to top-k chunks improves accuracy.
- **B.** Claude cannot process more than 2,000 input tokens in total.
- **C.** XML tags stop working when there are more than 5 chunks.
- **D.** Sending 25 document chunks triggers HTTP 429 rate-limit errors automatically even on a single synchronous Messages API request call.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hệ thống RAG truy xuất 25 đoạn tài liệu và nhồi cả 25 đoạn vào prompt, mặc dù chỉ có 2 đoạn thực sự liên quan. Kết quả là độ chính xác câu trả lời của Claude giảm xuống và độ trễ tăng lên. Nguyên lý context engineering nào giải thích vấn đề này?

**Đáp án đúng:** **A**

Context Engineering hướng tới **bộ token nhỏ nhất nhưng tín hiệu cao nhất** (minimal high-signal context). Trong RAG, dùng reranking và ngưỡng độ tương đồng để loại bỏ nhiễu tốt hơn nhiều so với nhồi bừa vào context.

- **A (Đúng):** Nhồi nhét quá nhiều đoạn không liên quan làm giảm tỷ lệ tín hiệu/nhiễu (signal-to-noise), gây xao nhãng chú ý của mô hình. Dùng reranker/lọc để chỉ đưa top-k đoạn thực sự liên quan sẽ vừa chính xác vừa nhanh hơn.
- **B:** Claude hỗ trợ context window rất lớn (200K+ tokens), vấn đề ở đây là nhiễu ngữ cảnh chứ không phải giới hạn 2,000 tokens.
- **C:** XML tags hoạt động bình thường với số lượng lớn chunk.
- **D:** 25 đoạn văn trên 1 request không tự động gây lỗi 429.

</details>

### Câu 10 `medium`

A developer is optimizing a complex prompt that extracts structured compliance findings from 30-page policies. Which TWO prompt engineering practices are most effective? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Place the 30-page policy document near the top of the prompt inside `<policy>` tags and put the extraction instructions and output schema at the bottom.
- **B.** Include 2–3 concrete `<example>` pairs demonstrating how ambiguous clauses should be classified.
- **C.** Ask Claude to summarize the policy in 3 words before reading it.
- **D.** Set `temperature: 1.0` so Claude is more creative with legal interpretations.
- **E.** Mix the policy text and system instructions together without any delimiters.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên đang tối ưu hóa một prompt phức tạp để trích xuất các phát hiện tuân thủ có cấu trúc từ các chính sách dài 30 trang. HAI thực hành prompt engineering nào là hiệu quả nhất? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, B**

Với bài toán trích xuất tài liệu dài, kết hợp **XML delimiters + Long-context ordering** (tài liệu trên, câu hỏi dưới) và **Few-shot examples** mang lại cải thiện chất lượng rõ rệt nhất.

- **A (Đúng):** Đặt tài liệu dài ở trên trong thẻ XML và đặt yêu cầu trích xuất ở cuối giúp tối đa hóa khả năng chú ý và độ chính xác.
- **B (Đúng):** Ví dụ few-shot trong thẻ `<example>` giúp chuẩn hóa cách phân loại các điều khoản nhập nhằng.
- **C:** Không có cơ chế tóm tắt trước khi đọc trong một lượt prompt như vậy.
- **D:** Trích xuất tuân thủ pháp lý cần `temperature` thấp (gần 0.0) để đảm bảo nhất quán.
- **E:** Trộn lẫn dữ liệu và chỉ thị không có dấu phân cách dễ gây nhầm lẫn và tăng rủi ro injection.

</details>

---

[Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md)
