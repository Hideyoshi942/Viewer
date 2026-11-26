# Module 12: Model Context Protocol (MCP) Architecture & Transports

**Model Context Protocol (MCP)** là chuẩn mở do Anthropic khởi xướng giúp chuẩn hóa cách các ứng dụng AI (Host) kết nối với nguồn dữ liệu và công cụ bên ngoài (Server) qua giao thức **JSON-RPC 2.0**, loại bỏ bài toán tích hợp N×M rời rạc.

## 1. Kiến trúc 3 Thành phần: Host – Client – Server

- **MCP Host**: Ứng dụng AI tương tác trực tiếp với người dùng (ví dụ: Claude Desktop, Claude Code, Cursor IDE, hoặc custom backend app).
- **MCP Client**: Thành phần nằm bên trong Host, duy trì **kết nối 1-1** (one-to-one) với từng MCP Server cụ thể.
- **MCP Server**: Tiến trình hoặc dịch vụ nhẹ cung cấp dữ liệu và công cụ từ hệ thống ngoài (GitHub, Postgres, Slack, Jira) theo chuẩn MCP.

## 2. Ba Primitives Cốt lõi của MCP Server

| Primitive | Người kiểm soát (*Controlled by*) | Vai trò & Ví dụ |
| :--- | :--- | :--- |
| **Tools** | **Model-controlled** (Claude tự quyết định gọi) | Thực thi hành động, gọi API, truy vấn DB, ghi file (`create_issue`, `run_query`) |
| **Resources** | **Application-controlled** (Host/App chọn & đính kèm) | Dữ liệu chỉ đọc dạng URI (`file:///logs/app.log`, `postgres://schema/users`) |
| **Prompts** | **User-controlled** (Người dùng chủ động kích hoạt) | Mẫu prompt / Slash commands tái sử dụng (vd: `/code-review`, `/summarize-pr`) |

> **Exam Tip**: Hãy nhớ chính xác bảng phân quyền kiểm soát 3 primitives: **Tools = Model-controlled**, **Resources = Application-controlled**, **Prompts = User-controlled**. Đây là câu hỏi kiểm tra kiến thức nền tảng rất hay gặp.

## 3. Transport Layers: `stdio` vs. `Streamable HTTP`

| Transport | Phạm vi triển khai | Cơ chế & Bảo mật |
| :--- | :--- | :--- |
| **`stdio`** | **Local** (chạy cùng máy với Host) | Host khởi chạy MCP Server như một subprocess và giao tiếp qua `stdin`/`stdout`. Rất nhanh, không cần mở port mạng. |
| **`Streamable HTTP`** | **Remote** (deploy trên cloud/server nội bộ) | Giao tiếp qua HTTP POST + tùy chọn SSE streaming; hỗ trợ xác thực chuẩn **OAuth 2.1** cho doanh nghiệp (thay thế transport HTTP+SSE cũ). |

```json
{
  "mcpServers": {
    "local-postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/mydb"]
    },
    "remote-github": {
      "type": "http",
      "url": "https://mcp.internal.company.com/github"
    }
  }
}
```

## 4. Quản lý Quy mô Lớn MCP Tools (Tool Scaling)

Khi tích hợp hàng chục MCP servers (ví dụ 60–100 tools cùng lúc), việc nhồi toàn bộ JSON Schema của tất cả tools vào mỗi request sẽ:
- Tiêu tốn hàng chục nghìn input tokens mỗi lượt gọi.
- Làm giảm độ chính xác chọn tool của model (*Tool Confusion*).

**Giải pháp chuẩn**:
- Sử dụng **Dynamic Tool Discovery / Tool Search** (chỉ load trước các tool cốt lõi hoặc dùng công cụ tìm kiếm tool theo ngữ cảnh để nạp schema khi cần).
- Gom nhóm theo **Subagents chuyên biệt**, mỗi subagent chỉ kết nối tới 1–2 MCP servers liên quan đến nhiệm vụ của nó.

---

[← Bài trước](16-tools-mcp-protocol.md) | [Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/12-mcp-protocol.md) | [Bài tiếp →](18-security-prompt-injection-guardrails.md)
