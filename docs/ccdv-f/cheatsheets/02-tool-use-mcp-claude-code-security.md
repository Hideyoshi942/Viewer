# Cheatsheet 2: Tool Use, MCP, Security, Claude Code & Evals

Tóm tắt nhanh các điểm kiểm tra trọng yếu cho **Domain 5 (10%)**, **Domain 6 (8%)**, **Domain 7 (3%)** và **Domain 8 (3%)**.

## 1. Tool Use & `tool_choice`

| `tool_choice` | Hành vi |
| :--- | :--- |
| `{"type": "auto"}` | Claude tự quyết định gọi tool hay trả lời text |
| `{"type": "any"}` | Bắt buộc gọi ít nhất 1 tool |
| `{"type": "tool", "name": "fn"}` | Ép gọi chính xác tool `fn` |
| `{"type": "none"}` | Cấm gọi tool nhưng **giữ nguyên mảng `tools` để bảo toàn Prompt Cache** |

- **Parallel Tool Use**: 1 response có thể chứa nhiều `tool_use` blocks → phải trả về đủ `tool_result` khớp từng `tool_use_id` trong cùng 1 `user` message.
- **Tool Error Recovery**: Trả về `tool_result` với `"is_error": true` + thông báo lỗi rõ ràng để Claude tự sửa tham số.

## 2. Model Context Protocol (MCP)

- **Kiến trúc**: **Host** (Claude Desktop/IDE/App) → **Client** (kết nối 1-1) → **Server** (cung cấp năng lực qua JSON-RPC 2.0).
- **3 Primitives**:
  - **Tools** (*Model-controlled*): Thực thi hành động / gọi API.
  - **Resources** (*Application-controlled*): Dữ liệu đọc (file, schema, logs).
  - **Prompts** (*User-controlled*): Slash command / prompt templates.
- **Transports**: `stdio` (local server trên cùng máy) vs `Streamable HTTP` (remote server trên cloud, hỗ trợ OAuth 2.1).

## 3. Bảo mật & An toàn (Defense-in-Depth)

- **Direct vs Indirect Prompt Injection**: Direct từ user input; Indirect từ dữ liệu ngoài (email, web, PDF).
- **4 lớp phòng thủ chuẩn**:
  1. Bọc dữ liệu ngoài trong XML tags (`<untrusted_data>`).
  2. **Least Privilege** cho tools (read-only token, giới hạn scope).
  3. **Human-in-the-Loop (HITL)** cho hành động thay đổi trạng thái (xóa DB, thanh toán, gửi email).
  4. **PII Redaction** trước khi gửi API + **Zero Data Retention (ZDR)** nếu cần tuân thủ HIPAA/PCI-DSS.
- **API Key Hygiene**: Không bao giờ nhúng `ANTHROPIC_API_KEY` ở frontend; luôn gọi qua Backend Proxy + Secrets Manager + tách key theo môi trường (`dev`/`prod`).

## 4. Claude Code CLI & Evals

| Thành phần Claude Code | Vị trí & Vai trò |
| :--- | :--- |
| **Shared `CLAUDE.md`** | `./CLAUDE.md` (commit Git) — quy chuẩn chung của team |
| **Local `CLAUDE.local.md`** | `./CLAUDE.local.md` (gitignored) — cấu hình cá nhân |
| **Custom Slash Commands** | `.claude/commands/<name>.md` — dùng `/name` |
| **Hooks (Deterministic)** | `PreToolUse` (exit code `2` để block), `PostToolUse` (auto-format/lint), `Stop` |
| **CI/CD Headless** | `claude -p "prompt" --output-format json` |

- **Graders trong Evals**:
  - **Code-based**: Nhanh, rẻ, tất định (Regex, JSON schema, unit test).
  - **LLM-as-a-Judge**: Đánh giá ngữ nghĩa theo **Rubric** cụ thể, xuất `reasoning` trước `score`.
  - **Regression Testing**: Chạy lại toàn bộ Eval dataset mỗi khi đổi prompt, model hoặc tool schema.

---

[Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md)
