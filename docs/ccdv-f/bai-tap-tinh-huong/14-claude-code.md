# Bài tập tình huống — Module 14: Claude Code CLI, CLAUDE.md, Settings Scopes & Hooks

> Hệ thống phân cấp CLAUDE.md (Enterprise/User/Project/Local), Settings Scopes precedence, Custom Slash Commands (.claude/commands/), Hooks (PreToolUse/PostToolUse/Stop) và chế độ CI/CD (-p).
> **Số câu hỏi:** 4 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `easy`

A development team wants to share project-wide coding conventions, build commands, and architecture notes with Claude Code across all team members via Git. Where should they place these instructions?

- **A.** In `.git/hooks/post-commit` as a shell script comment.
- **B.** In a `CLAUDE.md` file committed to the repository root (or `.claude/CLAUDE.md`).
- **C.** Inside `node_modules/.cache/claude.txt` so it is excluded from Git source control.
- **D.** In `~/.claude/settings.local.json` on one developer's personal workstation.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm phát triển muốn chia sẻ các quy ước viết code toàn dự án, lệnh build và ghi chú kiến trúc với Claude Code cho tất cả thành viên trong nhóm thông qua Git. Họ nên đặt các hướng dẫn này ở đâu?

**Đáp án đúng:** **B**

`CLAUDE.md` đặt ở root repo (hoặc các thư mục con) được commit vào Git giúp toàn đội ngũ chia sẻ nhất quán quy ước code, lệnh test và kiến trúc với Claude Code.

- **A:** Git hooks không phải là file ngữ cảnh dự án của Claude Code.
- **B (Đúng):** File `CLAUDE.md` ở thư mục gốc của repository (được commit lên Git) là nơi chuẩn để lưu hướng dẫn chung của dự án cho mọi thành viên dùng Claude Code.
- **C:** Claude Code không đọc hướng dẫn từ `node_modules/.cache`.
- **D:** File trong thư mục home cá nhân không được chia sẻ qua Git cho cả team.

</details>

### Câu 2 `medium`

In a repository using Claude Code, what is the difference between `.claude/settings.json` and `.claude/settings.local.json`?

- **A.** `.claude/settings.json` is ignored by Claude Code unless `settings.local.json` is deleted.
- **B.** `.claude/settings.local.json` stores the Anthropic API billing credit card.
- **C.** `.claude/settings.json` is committed and shared with the team; `.claude/settings.local.json` holds personal overrides and is gitignored.
- **D.** `.claude/settings.local.json` is only loaded on Windows workstations while `.claude/settings.json` is only loaded on macOS and Linux machines.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong một repository sử dụng Claude Code, sự khác biệt giữa `.claude/settings.json` và `.claude/settings.local.json` là gì?

**Đáp án đúng:** **C**

Claude Code phân tách cấu hình dự án: `.claude/settings.json` (chia sẻ cho cả team qua Git) và `.claude/settings.local.json` (cấu hình riêng của cá nhân, thường được thêm vào `.gitignore`).

- **A:** Claude Code nạp cả hai và áp dụng ghi đè theo thứ tự ưu tiên, không bỏ qua `settings.json`.
- **B:** File cấu hình local không lưu thông tin thanh toán.
- **C (Đúng):** `.claude/settings.json` chứa cấu hình chung (permissions, hooks) chia sẻ qua Git; còn `.claude/settings.local.json` lưu tùy chỉnh cá nhân trên máy từng lập trình viên và không commit lên Git.
- **D:** Hai file này phân chia theo phạm vi chia sẻ (team vs cá nhân), không phân theo hệ điều hành.

</details>

### Câu 3 `medium`

A team configures a `PreToolUse` hook in `.claude/settings.json` for Claude Code to block shell commands that attempt to run `rm -rf /` or modify `.env` files. What exit code should the hook script return to block the tool call and feed an error reason back to Claude?

- **A.** Exit code `0` (standard success signal with block reason in stdout)
- **B.** Exit code `-999` (critical hook abort signal without stderr)
- **C.** Exit code `2` (blocking error, with reason written to `stderr`)
- **D.** Exit code `200` (HTTP-style OK status with JSON payload on stdout)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm cấu hình một `PreToolUse` hook trong `.claude/settings.json` cho Claude Code để chặn các lệnh shell cố gắng chạy `rm -rf /` hoặc sửa đổi các tệp `.env`. Hook script nên trả về mã thoát (exit code) nào để chặn lệnh gọi tool và gửi lý do lỗi trở lại cho Claude?

**Đáp án đúng:** **C**

Claude Code hooks sử dụng quy ước exit code rõ ràng: `0` là thành công/cho phép; `2` là lỗi chặn (`blocking error`) và nội dung trên `stderr` được truyền trực tiếp cho Claude để điều chỉnh hành vi.

- **A:** Exit code `0` báo hiệu hook thành công và cho phép tool tiếp tục chạy.
- **B:** Đây không phải exit code hợp lệ.
- **C (Đúng):** Trong Claude Code hooks: exit code `0` cho phép tiếp tục; exit code `2` chặn hành động (blocking error) và gửi nội dung `stderr` lại cho Claude biết lý do bị chặn.
- **D:** Exit code `200` không phải quy ước chặn của Claude Code hook (chỉ `2` là blocking error).

</details>

### Câu 4 `medium`

A large monorepo has a root `CLAUDE.md` with global TypeScript rules, plus a `services/billing/CLAUDE.md` with Stripe-specific testing commands. How does Claude Code load these `CLAUDE.md` files?

- **A.** Only one `CLAUDE.md` file is allowed per GitHub organization.
- **B.** Claude Code only reads the root `CLAUDE.md` at startup and permanently ignores all nested `CLAUDE.md` files in any subdirectories of the repo.
- **C.** Nested `CLAUDE.md` files overwrite and delete the root `CLAUDE.md` from disk.
- **D.** Claude Code loads the root `CLAUDE.md` at startup and dynamically loads nested `CLAUDE.md` files when working in subdirectories.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một monorepo lớn có tệp `CLAUDE.md` ở thư mục gốc chứa các quy tắc TypeScript toàn cục, cộng thêm một tệp `services/billing/CLAUDE.md` chứa các lệnh kiểm thử riêng cho Stripe. Claude Code tải các tệp `CLAUDE.md` này như thế nào?

**Đáp án đúng:** **D**

Kiến trúc phân cấp của `CLAUDE.md` (user `~/.claude/CLAUDE.md`, project root `CLAUDE.md`, và nested `subdir/CLAUDE.md`) cho phép tổ chức hướng dẫn sạch sẽ mà không làm phình context ngay từ đầu.

- **A:** Không có giới hạn 1 file cho cả organization.
- **B:** Claude Code có đọc các `CLAUDE.md` lồng nhau trong thư mục con.
- **C:** Các file `CLAUDE.md` bổ sung ngữ cảnh cho nhau, không xóa file gốc.
- **D (Đúng):** Claude Code hỗ trợ `CLAUDE.md` phân cấp: file ở root được nạp khi khởi động, còn file ở thư mục con được nạp bổ sung khi tác vụ chạm tới thư mục đó, giúp tiết kiệm context và giữ hướng dẫn sát ngữ cảnh.

</details>

---

[Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md)
