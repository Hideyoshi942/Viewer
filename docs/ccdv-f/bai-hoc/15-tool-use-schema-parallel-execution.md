# Module 11: Tool Use (tool_choice), Schema Validation & Parallel Execution

**Domain 5 (Tools and MCPs)** chiếm **10% tỷ trọng đề thi**. Nền tảng của hệ thống Agent là khả năng định nghĩa **Tools (Function Calling)** rõ ràng, điều khiển hành vi gọi tool qua `tool_choice`, xử lý song song và giúp Claude tự phục hồi khi tool gặp lỗi.

## 1. Thiết kế Tool Definition & JSON Schema Chuẩn xác

Chất lượng của `description` và `input_schema` quyết định trực tiếp việc Claude có gọi đúng tool và đúng tham số hay không:
- **`name`**: Tên ngắn gọn, rõ nghĩa theo `snake_case` (vd: `search_orders`).
- **`description`**: Mô tả chi tiết **khi nào nên dùng**, **khi nào không nên dùng**, ý nghĩa các giá trị trả về và các trường hợp biên.
- **`input_schema`**: JSON Schema hợp lệ (`type: "object"`, `properties`, `required`). Dùng `enum` hoặc `description` rõ ràng (vd: `"ISO-8601 date string, e.g. 2026-04-01"`) để tránh Claude truyền sai định dạng ngày tháng.

```python
tools = [
    {
        "name": "search_orders",
        "description": "Search customer orders by status and optional start date. Use when user asks about order history.",
        "input_schema": {
            "type": "object",
            "properties": {
                "status": {
                    "type": "string",
                    "enum": ["pending", "shipped", "cancelled"],
                    "description": "Current fulfillment status of the order."
                },
                "since_date": {
                    "type": "string",
                    "description": "Filter orders created on or after this ISO-8601 date (YYYY-MM-DD)."
                }
            },
            "required": ["status"]
        }
    }
]
```

## 2. Điều khiển Hành vi với `tool_choice`

| Giá trị `tool_choice` | Hành vi của Claude | Khi nào dùng? |
| :--- | :--- | :--- |
| `{"type": "auto"}` | Tự quyết định trả lời text hoặc gọi 1+ tools (Mặc định) | Chatbot đa năng, agent thông thường |
| `{"type": "any"}` | **Bắt buộc** gọi ít nhất 1 tool trong danh sách | Pipeline bắt buộc phải tra cứu/trích xuất qua tool |
| `{"type": "tool", "name": "fn"}` | **Ép buộc** gọi chính xác tool `fn` | Ép Claude trả về dữ liệu theo schema của `fn` |
| `{"type": "none"}` | **Cấm** gọi bất kỳ tool nào ở lượt này | Lượt tổng hợp cuối cùng nhưng vẫn giữ mảng `tools` để **bảo toàn Prompt Cache** |

> **Exam Tip**: Lưu ý quan trọng: Khi bật **Extended Thinking**, API chỉ hỗ trợ `tool_choice` là `auto` hoặc `none` (không được ép `any` hoặc `tool` cụ thể vì sẽ xung đột với quá trình suy luận tự do).

## 3. Parallel Tool Use & Error Recovery (`is_error: true`)

1. **Parallel Tool Use**: Trong một lượt trả về (`stop_reason == "tool_use"`), Claude có thể phát ra **nhiều `tool_use` blocks cùng lúc** (ví dụ gọi `get_weather("Hanoi")` và `get_weather("Tokyo")`).
   - Ứng dụng phải thực thi tất cả (có thể chạy song song) và **trả về ĐỦ các `tool_result` blocks tương ứng từng `tool_use_id` trong CÙNG MỘT `user` message**.
   - Nếu thiếu bất kỳ `tool_use_id` nào, Messages API sẽ báo lỗi `400 invalid_request_error`.
2. **Tool Error Recovery (`"is_error": true`)**:
   - Khi thực thi tool thất bại (lỗi cú pháp SQL, record không tồn tại, thiếu tham số), **đừng làm crash agent loop**.
   - Hãy trả về `tool_result` với `"is_error": true` và `content` mô tả lỗi cụ thể để Claude tự đọc lỗi, điều chỉnh tham số và thử lại thông minh.

```json
{
  "role": "user",
  "content": [
    {
      "type": "tool_result",
      "tool_use_id": "toolu_01ABC",
      "is_error": true,
      "content": "SQL Error: column 'user_name' does not exist. Available columns: id, email, full_name."
    }
  ]
}
```

---

[← Bài trước](14-extended-thinking-context-management.md) | [Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/11-tool-use.md) | [Bài tiếp →](16-tools-mcp-protocol.md)
