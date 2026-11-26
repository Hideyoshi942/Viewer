# Domain 7: Claude Code CLI — CLAUDE.md, Settings Scopes & Hooks

Domain 7 chiếm **3% đề thi CCDV-F**, kiểm tra kiến thức thực hành về **Claude Code** — công cụ agentic coding chạy trực tiếp trên terminal và tích hợp vào quy trình CI/CD.

## 1. Hệ thống Bộ nhớ `CLAUDE.md`

`CLAUDE.md` là tệp Markdown lưu trữ ngữ cảnh dự án, lệnh build/test, quy ước code (conventions) mà Claude Code tự động nạp vào context khi khởi động phiên làm việc.

| Phạm vi (Scope) | Vị trí file | Chia sẻ qua Git? | Mục đích |
| :--- | :--- | :--- | :--- |
| **Enterprise / Managed** | Thư mục hệ thống (vd: `/etc/claude-code/CLAUDE.md`) | Quản trị bởi IT/Security | Chính sách bảo mật chung của toàn công ty |
| **User (Global)** | `~/.claude/CLAUDE.md` | Không (cá nhân) | Sở thích cá nhân áp dụng cho mọi dự án |
| **Project (Shared)** | `./CLAUDE.md` hoặc `./.claude/CLAUDE.md` | **Có (commit lên Git)** | Kiến trúc repo, lệnh test, coding standards của team |
| **Project Local** | `./CLAUDE.local.md` | Không (auto gitignored) | Cấu hình cục bộ cá nhân (URL DB local, test flags) |

> **Exam Tip**: Các quy tắc chuẩn của cả nhóm (như *"Luôn chạy `npm test` trước khi báo hoàn thành"* hoặc *"Dùng Zod để validate API input"*) phải đặt ở **`./CLAUDE.md`** (commit lên Git) để mọi thành viên và CI/CD đều dùng chung.

## 2. Settings Scopes & Quyền hạn (Permissions)

Claude Code áp dụng thứ tự ưu tiên cấu hình từ cao xuống thấp (trên ghi đè dưới):
1. **Managed Settings** (IT/Enterprise policy — không thể bị ghi đè)
2. **Command-line arguments** (Flags truyền trực tiếp khi chạy `claude`)
3. **Local Project Settings** (`.claude/settings.local.json` — cá nhân, gitignored)
4. **Shared Project Settings** (`.claude/settings.json` — chia sẻ qua Git)
5. **User Settings** (`~/.claude/settings.json` — cá nhân toàn cục)

Trong `settings.json`, bạn cấu hình `permissions.allow` và `permissions.deny` để kiểm soát tool nào được chạy tự động (vd: `Bash(npm test:*)`) và tool/file nào bị chặn (vd: `Read(.env*)`).

## 3. Custom Slash Commands & Hooks

- **Custom Slash Commands**: Tạo file Markdown trong `.claude/commands/<ten-lenh>.md` (chia sẻ cho team) hoặc `~/.claude/commands/` (cá nhân). Ví dụ tạo `.claude/commands/review-pr.md`, khi gõ `/review-pr` trong Claude Code, nội dung file sẽ được mở rộng thành prompt (hỗ trợ biến `$ARGUMENTS`).
- **Hooks**: Khác với `CLAUDE.md` (mang tính hướng dẫn mềm cho LLM), **Hooks là các shell script chạy tất định (deterministic)** tại các điểm vòng đời cụ thể:
  - **`PreToolUse`**: Chạy *trước* khi tool thực thi. Có thể trả về exit code `2` để **chặn (block)** hành động nguy hiểm (vd: chặn lệnh `rm -rf` hoặc sửa file `.env`).
  - **`PostToolUse`**: Chạy *sau* khi tool hoàn tất (vd: tự động chạy `prettier` hoặc `eslint --fix` mỗi khi Claude sửa file).
  - **`Stop`**: Chạy khi Claude chuẩn bị kết thúc lượt trả lời (vd: ép chạy unit test kiểm tra lần cuối).

## 4. Chế độ Non-Interactive (`-p` / `--print`) cho CI/CD

Để nhúng Claude Code vào GitHub Actions hoặc shell script tự động hóa, dùng flag `-p`:
```bash
# Phân tích git diff và xuất kết quả dạng JSON có cấu trúc
git diff main | claude -p "Review this diff for security bugs" --output-format json
```
Có thể kết hợp `--allowedTools` để giới hạn chỉ các công cụ an toàn trong pipeline tự động.

---

[← Bài trước](20-claude-code-cli-claudemd-hooks.md) | [Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/14-claude-code.md) | [Bài tiếp →](22-evals-llm-as-judge-debugging.md)
