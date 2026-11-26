# Bài tập tình huống — Chủ đề 11: Debugging Non-Deterministic Failures, Tool Loops & Silent Truncation

> Tái hiện lỗi không tất định từ trace snapshots, xử lý vòng lặp gọi tool vô hạn và phát hiện lỗi cắt cụt âm thầm (stop_reason: max_tokens).
> **Số câu hỏi:** 2 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A production JSON-extraction service intermittently fails to parse Claude's response because the closing braces `}` are missing. Inspection of the response metadata shows HTTP 200 OK and `stop_reason: "max_tokens"`. What is the root cause and fix?

- **A.** The Anthropic API experienced a transient network disconnect; add an exponential backoff retry loop on HTTP 200 responses.
- **B.** The output hit the configured `max_tokens` ceiling, causing silent truncation; increase `max_tokens`, tighten output conciseness, and alert on `stop_reason == "max_tokens"`.
- **C.** Claude's `temperature` is configured too low; raise it to 1.0 so the model generates more compact JSON payloads.
- **D.** The Python `json.loads()` parser enforces a hard 4KB buffer limit; switch the extraction schema to XML parsing instead.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một dịch vụ trích xuất JSON trên production thỉnh thoảng không parse được phản hồi của Claude vì thiếu các dấu ngoặc nhọn đóng `}`. Kiểm tra metadata phản hồi cho thấy HTTP 200 OK và `stop_reason: "max_tokens"`. Nguyên nhân gốc rễ và cách khắc phục là gì?

**Đáp án đúng:** **B**

Silent truncation xảy ra khi response trả về HTTP 200 nhưng `stop_reason` là `max_tokens` thay vì `end_turn`. Production service phải luôn kiểm tra `stop_reason` trước khi parse JSON.

- **A:** HTTP 200 với `stop_reason: "max_tokens"` không phải lỗi mạng mà là API đã dừng sinh vì chạm trần token.
- **B (Đúng):** `stop_reason: "max_tokens"` cho thấy phản hồi bị cắt cụt âm thầm (silent truncation) do chạm giới hạn `max_tokens`. Cần nâng `max_tokens` phù hợp, tối ưu độ gọn của output và bật cảnh báo khi gặp trạng thái này.
- **C:** Temperature không kiểm soát độ dài tối đa của JSON bằng `max_tokens`.
- **D:** `json.loads()` không có giới hạn 4KB; lỗi là do chuỗi JSON thực sự bị thiếu phần kết.

</details>

### Câu 2 `medium`

An automated invoice extraction service receives HTTP 200 OK from the Anthropic Messages API, yet downstream `JSON.parse()` fails with `Unexpected end of JSON input` on large multi-page invoices. Inspection shows the JSON is syntactically valid up to the exact point where it abruptly cuts off mid-field. Which response field confirms the root cause, and what is the proper fix?

- **A.** Check `stop_reason == 'end_turn'`; the fix is switching from `claude-sonnet` to `claude-haiku` so the response finishes faster.
- **B.** Check `stop_reason == 'tool_use'`; the fix is removing all `tools` from the API request so JSON output is never interrupted.
- **C.** Check `usage.cache_creation_input_tokens` in the API response; the fix is disabling prompt caching on all requests containing multi-page invoices with more than 10 line items.
- **D.** Check `stop_reason == 'max_tokens'` for silent truncation; alert on it, raise `max_tokens`, or chunk large invoices before extraction.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một dịch vụ trích xuất hóa đơn tự động nhận được HTTP 200 OK từ Anthropic Messages API, nhưng `JSON.parse()` ở phía sau lại thất bại với lỗi `Unexpected end of JSON input` trên các hóa đơn lớn nhiều trang. Kiểm tra cho thấy JSON hợp lệ về mặt cú pháp cho đến đúng điểm nó bị cắt đột ngột giữa chừng một trường dữ liệu. Trường phản hồi nào xác nhận nguyên nhân gốc rễ và cách khắc phục đúng là gì?

**Đáp án đúng:** **D**

Silent Truncation (`stop_reason: "max_tokens"`) là lỗi production rất phổ biến vì API vẫn trả về HTTP 200 OK. Ứng dụng phải luôn kiểm tra `stop_reason` trước khi parse JSON hoặc dùng kết quả.

- **A:** `end_turn` nghĩa là model đã kết thúc câu trả lời tự nhiên, không phải bị cắt ngang; và đổi sang Haiku không giải quyết giới hạn `max_tokens`.
- **B:** `tool_use` là trạng thái model dừng để chờ kết quả thực thi tool, không phải nguyên nhân cắt ngang giữa chuỗi JSON text.
- **C:** Prompt caching chỉ liên quan đến input tokens, không làm cắt ngang output JSON.
- **D (Đúng):** HTTP 200 kèm `stop_reason: "max_tokens"` là hiện tượng silent truncation (output bị cắt ngang do chạm trần `max_tokens`). Cần luôn kiểm tra `stop_reason` trong code, cảnh báo khi gặp `max_tokens`, tăng giới hạn phù hợp hoặc chia nhỏ hóa đơn lớn.

</details>

---

[Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md)
