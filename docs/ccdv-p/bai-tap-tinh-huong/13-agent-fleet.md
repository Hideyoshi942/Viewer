# Bài tập tình huống — Chủ đề 13: Headless Claude Code CI/CD Pipelines & Sandbox Isolation

> Chạy Claude Code chế độ headless (-p) trong CI/CD để tự động review/sửa lỗi, kết hợp Hooks (PreToolUse/PostToolUse) và cô lập sandbox.
> **Số câu hỏi:** 2 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A DevOps team wants to integrate Claude Code into a headless GitHub Actions workflow to triage issues, generate unit tests, and output machine-readable results without interactive terminal prompts. Which CLI configuration should they use?

- **A.** Launch Claude Code in interactive TUI mode and pipe a continuous stream of `yes` confirmations into standard input until completion.
- **B.** Run `claude -p "<prompt>"` with `--output-format json` (or `stream-json`) and explicit `--allowedTools` scoped to the CI task.
- **C.** Install a headless Xvfb and VNC desktop server inside the GitHub Actions runner so Claude Code can open an interactive GUI window.
- **D.** Run `claude` with `--dangerously-skip-permissions` directly on every untrusted public pull request without container sandboxing.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm DevOps muốn tích hợp Claude Code vào một workflow GitHub Actions không giao diện (headless) để phân loại issue, tạo unit test và xuất kết quả máy đọc được mà không cần nhắc lệnh terminal tương tác. Họ nên sử dụng cấu hình CLI nào?

**Đáp án đúng:** **B**

Trong CI/CD headless pipelines, Claude Code được gọi qua `claude -p` kèm `--output-format json` và `--allowedTools` (cùng `--max-turns` / giới hạn ngân sách) để tự động hóa an toàn và có thể phân tích kết quả bằng script.

- **A:** Chạy TUI và pipe `yes` không ổn định trong CI/CD headless và không xuất ra JSON có cấu trúc.
- **B (Đúng):** Cờ `-p` (`--print`) chạy Claude Code ở chế độ headless không tương tác, kết hợp `--output-format json` cho CI parser và `--allowedTools` để giới hạn quyền tool an toàn.
- **C:** Cài đặt VNC/GUI trong CI runner hoàn toàn thừa thãi, chậm chạp và tốn tài nguyên.
- **D:** Bỏ qua kiểm tra quyền trên PR công khai không tin cậy mà không có sandbox là lỗ hổng bảo mật cực kỳ nghiêm trọng.

</details>

### Câu 2 `hard`

A DevOps team integrates Claude Code into GitHub Actions to automatically triage incoming issues, run targeted unit tests, and propose minimal lint-fix patches in a non-interactive CI environment. Which CLI invocation pattern ensures deterministic, scriptable, and bounded execution?

- **A.** Invoke `claude -p` (headless print mode) with `--output-format json` (or `stream-json`), explicit `--allowedTools`, and `--max-turns` inside the CI runner.
- **B.** Launch interactive `claude` TUI inside a pseudo-TTY wrapper and simulate keyboard Enter keystrokes every 10 seconds until the CI timeout expires.
- **C.** Run `claude --dangerously-skip-permissions` with unrestricted shell access and unlimited turns directly on a self-hosted runner with production AWS credentials.
- **D.** Paste the entire repository tarball into a single Messages API `user` string and apply regex find-and-replace on the raw markdown response.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm DevOps tích hợp Claude Code vào GitHub Actions để tự động phân loại các issue gửi đến, chạy các unit test mục tiêu và đề xuất các bản vá sửa lỗi lint tối thiểu trong môi trường CI không tương tác. Mẫu lệnh gọi CLI nào đảm bảo thực thi tất định, có thể viết script và giới hạn phạm vi?

**Đáp án đúng:** **A**

Trong CI/CD không tương tác, Claude Code cần được chạy ở headless mode (`claude -p`) với `--output-format json`, giới hạn công cụ (`--allowedTools`) và giới hạn số bước (`--max-turns`).

- **A (Đúng):** Chế độ headless `claude -p` kết hợp `--output-format json` (dễ parse trong CI), `--allowedTools` (giới hạn quyền công cụ theo nguyên tắc least-privilege), và `--max-turns` (chống treo job/vòng lặp vô hạn) là chuẩn mực vận hành Claude Code trong CI/CD.
- **B:** Giả lập TUI tương tác bằng keystrokes trong CI rất mong manh, không có structured output và dễ treo vô thời hạn.
- **C:** Bỏ qua mọi kiểm tra quyền và chạy không giới hạn vòng lặp trên runner chứa credentials production là thảm họa bảo mật nghiêm trọng.
- **D:** Cách này không tận dụng được khả năng đọc/chỉnh sửa file và chạy test thực tế của Claude Code CLI.

</details>

---

[Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md)
