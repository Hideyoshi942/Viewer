# Bài tập tình huống — Module 11: Tool Use (tool_choice), Schema Validation & Parallel Execution

> Thiết kế JSON Schema và mô tả tool chuẩn xác, điều khiển tool_choice (auto/any/tool/none), xử lý Parallel Tool Use và phục hồi lỗi với tool_result (is_error: true).
> **Số câu hỏi:** 5 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `easy`

When defining a tool for Claude in the `tools` array of the Messages API, which fields are required in each tool definition?

- **A.** `name`, `endpoint_url`, and `authentication_key` (for webhook invocation)
- **B.** `output_schema` and `retry_policy` (with `timeout_ms` optional)
- **C.** `name` and `input_schema` (with `description` strongly recommended)
- **D.** `function_code` and `runtime_language` (to execute in Anthropic's sandbox)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Khi định nghĩa một tool cho Claude trong mảng `tools` của Messages API, những trường nào là bắt buộc trong mỗi định nghĩa tool?

**Đáp án đúng:** **C**

Một tool definition chuẩn trong Messages API gồm `name`, `description` (rất nên viết chi tiết) và `input_schema` (JSON Schema hợp lệ cho tham số đầu vào).

- **A:** Anthropic API không tự gọi URL của tool; ứng dụng của bạn tự thực thi tool nên không có `endpoint_url` hay `api_key` trong tool definition.
- **B:** Hai trường này không phải trường bắt buộc của tool definition.
- **C (Đúng):** Mỗi tool definition bắt buộc phải có `name` và `input_schema` (JSON Schema mô tả tham số); `description` không bắt buộc về mặt cú pháp nhưng cực kỳ quan trọng để Claude hiểu khi nào nên dùng tool.
- **D:** Bạn không gửi source code của tool lên Messages API.

</details>

### Câu 2 `medium`

A developer wants to guarantee that Claude invokes a specific tool named `extract_invoice` on a single-turn API call rather than replying with plain text. How should `tool_choice` be configured?

- **A.** `tool_choice: {"type": "none"}`
- **B.** `tool_choice: {"type": "any"}` when 5 other tools are also registered
- **C.** `tool_choice: {"type": "auto"}`
- **D.** `tool_choice: {"type": "tool", "name": "extract_invoice"}`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên muốn đảm bảo rằng Claude gọi một tool cụ thể có tên `extract_invoice` trong một lệnh gọi API một lượt thay vì trả lời bằng văn bản thuần túy. `tool_choice` phải được cấu hình như thế nào?

**Đáp án đúng:** **D**

4 chế độ của `tool_choice`: `auto` (mặc định, tự chọn), `any` (bắt buộc gọi ít nhất 1 tool bất kỳ), `tool` (bắt buộc gọi đúng tool chỉ định theo `name`), và `none` (không được gọi tool).

- **A:** `none` ngăn Claude gọi bất kỳ tool nào.
- **B:** `any` ép Claude phải gọi ít nhất một tool bất kỳ trong danh sách, không đảm bảo đúng tool `extract_invoice`.
- **C:** `auto` cho phép Claude tự quyết định gọi tool hoặc trả lời bằng text thuần.
- **D (Đúng):** `{"type": "tool", "name": "extract_invoice"}` ép buộc Claude phải gọi chính xác tool `extract_invoice` trong lượt trả lời này.

</details>

### Câu 3 `hard`

A developer notices Claude frequently passes incorrect parameter formats or chooses the wrong tool when 15 tools are registered. Which TWO improvements to tool definitions directly improve tool-selection accuracy? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Omit `required` fields from `input_schema` so Claude can skip parameters whenever it wants.
- **B.** Write clear, specific `description` strings explaining when to use each tool, what it returns, and edge-case boundaries compared to similar tools.
- **C.** Use descriptive parameter names, `enum` constraints, and `description` fields inside `input_schema` properties.
- **D.** Set `tool_choice: {"type": "none"}` so Claude stops making mistakes.
- **E.** Abbreviate all parameter names to single letters like `a`, `b`, `c` to save input tokens.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên nhận thấy Claude thường xuyên truyền sai định dạng tham số hoặc chọn nhầm tool khi có 15 tool được đăng ký. HAI cải tiến nào đối với định nghĩa tool sẽ trực tiếp nâng cao độ chính xác khi chọn tool? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, C**

Chất lượng Tool Use phụ thuộc lớn vào **Tool Definition Engineering**: mô tả `description` phân biệt rõ phạm vi từng tool và thiết kế `input_schema` chặt chẽ (tên rõ nghĩa, `enum`, `required`, mô tả từng property).

- **A:** Bỏ `required` khiến model dễ bỏ sót các tham số bắt buộc.
- **B (Đúng):** `description` rõ ràng về mục đích, ranh giới sử dụng và khác biệt với các tool khác giúp Claude chọn đúng tool.
- **C (Đúng):** Đặt tên tham số dễ hiểu kèm `enum` và mô tả chi tiết trong `input_schema` giúp Claude điền đúng định dạng và giá trị hợp lệ.
- **D:** `none` vô hiệu hóa hoàn toàn việc gọi tool.
- **E:** Tên tham số viết tắt tối nghĩa (`a`, `b`, `c`) làm model mất ngữ nghĩa và dễ truyền sai giá trị.

</details>

### Câu 4 `medium`

A developer registers 3 tools (`search_docs`, `create_ticket`, `get_status`) and sets `tool_choice: {"type": "any"}`. What does this guarantee about Claude's next response?

- **A.** Claude is forbidden from calling any registered tools in its response.
- **B.** Claude will automatically run the tools on Anthropic's servers.
- **C.** Claude must invoke at least one of the registered tools rather than responding with plain text only.
- **D.** Claude will execute all 3 registered tools simultaneously in parallel on every single API response turn.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên đăng ký 3 tool (`search_docs`, `create_ticket`, `get_status`) và đặt `tool_choice: {"type": "any"}`. Điều này đảm bảo điều gì về phản hồi tiếp theo của Claude?

**Đáp án đúng:** **C**

`tool_choice: {"type": "any"}` hữu ích khi bạn muốn chắc chắn model phải gọi một trong các tool khả dụng (ví dụ một tập các tool phân loại/định tuyến) thay vì trả lời bằng văn bản tự do.

- **A:** Cấm gọi tool là `{"type": "none"}`.
- **B:** Các tool tùy chỉnh (custom client tools) vẫn do ứng dụng của bạn thực thi.
- **C (Đúng):** `tool_choice: {"type": "any"}` bắt buộc Claude phải chọn và gọi ít nhất một tool trong danh sách `tools` được cung cấp.
- **D:** `any` chỉ yêu cầu gọi ít nhất 1 tool, không ép phải gọi cả 3.

</details>

### Câu 5 `medium`

A tool definition for `search_orders` requires a date parameter. How can the developer ensure Claude passes dates in ISO-8601 format (`YYYY-MM-DD`) reliably?

- **A.** Put the ISO-8601 date format validation rule only inside `stop_sequences` at the top level of the API request.
- **B.** Set `temperature: 1.0` so Claude creatively guesses the most appropriate ISO date format.
- **C.** Specify `"type": "string"`, `"format": "date"`, and state `"Date in YYYY-MM-DD format (e.g., 2026-05-01)"` in `description`.
- **D.** Name the parameter `x` with `"type": "any"` and omit any description or example format string.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một định nghĩa tool cho `search_orders` yêu cầu một tham số ngày. Làm thế nào lập trình viên có thể đảm bảo Claude truyền ngày theo định dạng ISO-8601 (`YYYY-MM-DD`) một cách đáng tin cậy?

**Đáp án đúng:** **C**

Khai báo rõ kiểu dữ liệu, ràng buộc JSON Schema (`enum`, `format`, `pattern`) và ví dụ mẫu ngay trong `description` của từng property là cách hiệu quả nhất để chuẩn hóa đầu vào cho tool.

- **A:** `stop_sequences` không mô tả schema tham số tool.
- **B:** `temperature` cao làm tăng sai lệch định dạng.
- **C (Đúng):** Kết hợp JSON Schema (`type`, `format`/`pattern`) cùng `description` ghi rõ định dạng `YYYY-MM-DD` và ví dụ minh họa giúp Claude truyền tham số chuẩn xác nhất.
- **D:** Tên `x` và không có mô tả sẽ khiến model đoán mò định dạng.

</details>

---

[Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md)
