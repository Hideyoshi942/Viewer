# Domain 5: Thiết kế Tool Use, Schema Validation & Model Context Protocol (MCP)

Domain 5 chiếm **10% đề thi CCDV-F**. Bạn cần thành thạo cách định nghĩa tool chuẩn xác cho Claude và hiểu sâu kiến trúc chuẩn hóa kết nối **Model Context Protocol (MCP)**.

## 1. Thiết kế Tool Use & `tool_choice`

Tool Use cho phép Claude tương tác với thế giới bên ngoài thông qua JSON Schema. **Chất lượng mô tả (`description`) quyết định 80% độ chính xác khi Claude chọn tool**: hãy mô tả rõ mục đích, khi nào nên dùng, khi nào *không* nên dùng, và ý nghĩa từng tham số.

```json
{
  "name": "get_order_status",
  "description": "Retrieve shipping and payment status for a customer order. Use this ONLY when the user provides a valid order ID starting with 'ORD-'.",
  "input_schema": {
    "type": "object",
    "properties": {
      "order_id": {
        "type": "string",
        "pattern": "^ORD-[0-9]{6}$",
        "description": "The 6-digit order identifier, e.g., ORD-123456"
      }
    },
    "required": ["order_id"],
    "additionalProperties": false
  }
}
```

### Kiểm soát hành vi gọi tool với `tool_choice`
| Giá trị `tool_choice` | Hành vi của Claude |
| :--- | :--- |
| `{"type": "auto"}` (Mặc định) | Claude tự quyết định trả lời bằng text hoặc gọi 1 hay nhiều tool |
| `{"type": "any"}` | Bắt buộc Claude phải gọi **ít nhất một** tool trong danh sách |
| `{"type": "tool", "name": "X"}` | Bắt buộc Claude phải gọi chính xác tool `X` |
| `{"type": "none"}` | Cấm Claude gọi mọi tool (dù vẫn truyền `tools` để giữ Prompt Cache!) |

### Parallel Tool Use & Xử lý lỗi `tool_result`
- **Parallel Tool Use**: Mặc định Claude có thể trả về nhiều `tool_use` blocks trong cùng 1 response (vd: tra cứu thời tiết của 3 thành phố cùng lúc). Khi trả về `user` message, bạn **phải gửi đủ `tool_result` khớp từng `tool_use_id`** tương ứng. Có thể tắt bằng `disable_parallel_tool_use: true`.
- **Báo lỗi cho Claude tự sửa**: Nếu quá trình thực thi tool thất bại (vd: SQL syntax error hoặc thiếu tham số), **đừng crash app**; hãy trả về `tool_result` với `"is_error": true` và nội dung lỗi rõ ràng để Claude tự điều chỉnh tham số và thử lại.

> **Exam Tip**: Khi muốn vô hiệu hóa việc gọi tool ở lượt cuối cùng (sau khi đã thu thập đủ dữ liệu) mà **không làm mất Prompt Cache** của danh sách `tools`, hãy giữ nguyên mảng `tools` và đặt `tool_choice: {"type": "none"}` thay vì xóa `tools` khỏi request!

## 2. Model Context Protocol (MCP)

**MCP** là giao thức mở chuẩn hóa cách ứng dụng AI kết nối với nguồn dữ liệu và công cụ bên ngoài (giống "cổng USB-C cho AI"). Thay vì viết integration riêng cho từng cặp `(Model x Data Source)` (`M x N`), MCP giảm xuống thành `M + N`.

### Kiến trúc MCP gồm 3 thành phần chính
1. **MCP Host**: Ứng dụng AI chứa mô hình (vd: Claude Desktop, Claude Code, IDE, hoặc custom agent app).
2. **MCP Client**: Thành phần nằm bên trong Host, duy trì kết nối **1-1** với một MCP Server cụ thể.
3. **MCP Server**: Chương trình nhẹ cung cấp khả năng chuyên biệt (GitHub, PostgreSQL, Slack, Jira...) thông qua JSON-RPC 2.0.

### 3 Primitives của MCP Server & Transport Layers
| Primitive | Ai kiểm soát? | Mục đích |
| :--- | :--- | :--- |
| **Tools** | **Model-controlled** | Hàm thực thi hành động (tìm kiếm, ghi DB, tạo PR) — tương ứng với Claude Tool Use |
| **Resources** | **Application-controlled** | Dữ liệu đọc (file, log, DB schema) được Host chọn đính kèm vào context |
| **Prompts** | **User-controlled** | Template prompt có sẵn (slash commands) do người dùng kích hoạt |

- **Transport Layers**:
  - **`stdio`**: Giao tiếp qua standard input/output cho **local servers** chạy trên cùng máy với Host (nhanh, không cần mở port mạng).
  - **`Streamable HTTP` (thay thế SSE cũ)**: Giao tiếp qua HTTP POST + SSE cho **remote servers** triển khai trên cloud/microservices, hỗ trợ OAuth 2.1 authentication.

---

[← Bài trước](15-tool-use-schema-parallel-execution.md) | [Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/11-tool-use.md) | [Bài tiếp →](17-mcp-protocol-architecture-transports.md)
