# Module 14: Claude Code CLI, CLAUDE.md, Settings Scopes & Hooks

**Domain 7 (Claude Code)** chiếm **3% đề thi CCDV-F**, tập trung vào cách cấu hình bộ nhớ dự án (`CLAUDE.md`), thứ tự ưu tiên Settings Scopes, Hooks cưỡng chế quy tắc và chạy tự động trong CI/CD.

## 1. Hệ thống Phân cấp Bộ nhớ `CLAUDE.md`

`CLAUDE.md` là tệp hướng dẫn ngữ cảnh tự động được nạp khi khởi chạy Claude Code. Trong một **monorepo**, Claude Code nạp `CLAUDE.md` theo cây thư mục (root `CLAUDE.md` nạp chung cho toàn repo, còn `CLAUDE.md` trong thư mục con được nạp theo ngữ cảnh khi làm việc trong module đó):

| Phạm vi (Scope) | Vị trí tệp | Mục đích sử dụng |
| :--- | :--- | :--- |
| **Project (Shared)** | `./CLAUDE.md` hoặc `./.claude/CLAUDE.md` | Quy ước kiến trúc, lệnh build/test dùng chung cho cả team (commit lên Git) |
| **Project Local** | `./CLAUDE.local.md` | Ghi chú cá nhân riêng cho dự án hiện tại (gitignored) |
| **User (Global)** | `~/.claude/CLAUDE.md` | Sở thích cá nhân áp dụng cho mọi dự án của developer |

## 2. Thứ tự Ưu tiên Settings Scopes (Precedence)

Cấu hình quyền (`permissions`), biến môi trường và hooks được đặt trong `settings.json`. Khi có xung đột, **thứ tự ưu tiên từ cao xuống thấp** như sau:
1. **Enterprise / Managed Settings** (do IT/Security quản lý tập trung — **cao nhất**, không thể bị ghi đè).
2. **Command-line Arguments** (cờ truyền trực tiếp khi chạy `claude ...`).
3. **Local Project Settings** (`.claude/settings.local.json` — gitignored).
4. **Shared Project Settings** (`.claude/settings.json` — commit lên Git cho cả team).
5. **User Settings** (`~/.claude/settings.json` — thấp nhất).

## 3. Hooks (`PreToolUse`, `PostToolUse`, `Stop`) & Custom Slash Commands

- **Custom Slash Commands**: Tạo file Markdown trong `.claude/commands/<name>.md` (dùng `$ARGUMENTS` để nhận tham số) để chia sẻ workflow chuẩn hóa với cả team qua Git (ví dụ `/review-pr`).
- **Claude Code Hooks**: Khác với `CLAUDE.md` (chỉ mang tính *hướng dẫn mềm*, LLM có thể quên), **Hooks là script/lệnh thực thi tất định (deterministic)** chạy tự động ở các điểm vòng đời:
  - **`PreToolUse`**: Chạy **trước** khi Claude Code gọi tool (vd: exit code `2` để **chặn** lệnh `rm -rf` hoặc sửa file `.env`).
  - **`PostToolUse`**: Chạy **ngay sau** khi tool sửa file (vd: tự động chạy `prettier --write` hoặc `eslint` sau `Edit`/`Write`).
  - **`Stop`**: Chạy khi Claude Code chuẩn bị kết thúc lượt (vd: bắt buộc chạy unit test trước khi bàn giao).

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python3 .claude/hooks/block-dangerous-commands.py"
          }
        ]
      }
    ]
  }
}
```

## 4. Chế độ Non-Interactive trong CI/CD (`-p`)

Để nhúng Claude Code vào GitHub Actions, GitLab CI hoặc script tự động (không có terminal tương tác), sử dụng cờ **`-p` (`--print`)** kèm định dạng output JSON:

```bash
claude -p "Review the git diff for security vulnerabilities" --output-format json
```

> **Exam Tip**: Khi cần **đảm bảo 100%** Claude Code không bao giờ chạy lệnh nguy hiểm hoặc luôn tự format code sau khi sửa, hãy dùng **Hooks (`PreToolUse` / `PostToolUse`)** trong `.claude/settings.json`, không chỉ viết nhắc nhở trong `CLAUDE.md`.

---

[← Bài trước](19-security-safety-prompt-injection.md) | [Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/14-claude-code.md) | [Bài tiếp →](21-claude-code-cli-hooks-claudemd.md)
