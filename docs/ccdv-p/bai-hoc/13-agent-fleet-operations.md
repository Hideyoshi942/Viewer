# Domain 7: Agent Fleet Operations for Software Delivery (Claude Code & CI/CD)

Domain 7 chiếm **10% tỷ trọng đề thi CCDV-P**. Ở cấp độ Professional, kỹ sư không chỉ dùng Claude Code tương tác từng dòng lệnh trên máy cá nhân, mà vận hành cả một **đội hình (Fleet) các coding agents** chạy song song trên nhiều tính năng, tích hợp tự động vào CI/CD pipeline trong môi trường sandbox cô lập, với quy trình quản lý xung đột và kiểm duyệt chặt chẽ.

## 1. Song song hóa Phát triển với Git Worktrees

Khi chạy 3–5 Claude Code agents đồng thời trên cùng một repository, nếu tất cả cùng sửa trên một working directory duy nhất, chúng sẽ ghi đè file của nhau, làm hỏng `git status` và gây fail test chéo.

- **Giải pháp chuẩn: `git worktree`**: Tạo các thư mục làm việc độc lập gắn với từng branch riêng biệt nhưng dùng chung một `.git` object store (tạo cực nhanh, không tốn dung lượng clone lại repo).
- Mỗi agent được cấp một worktree riêng, chạy `npm test` / `pytest` độc lập và commit lên branch riêng của mình.

```bash
# Tạo 2 worktree cô lập cho 2 agent làm việc song song
git worktree add ../repo-feat-auth -b agent/feat-auth
git worktree add ../repo-fix-billing -b agent/fix-billing

# Chạy Claude Code headless trong từng worktree
(cd ../repo-feat-auth && claude -p "Implement OAuth2 PKCE flow and unit tests" --output-format json) &
(cd ../repo-fix-billing && claude -p "Fix idempotency race condition in billing" --output-format json) &
wait
```

## 2. Headless CI/CD Pipelines với `claude -p`

Trong GitHub Actions, GitLab CI hoặc Buildkite, Claude Code vận hành ở chế độ **non-interactive (headless)** thông qua flag `-p` (`--print`):

### Các cờ (flags) cốt lõi cho CI/CD Automation
| Flag | Tác dụng trong CI/CD |
| :--- | :--- |
| `-p "<prompt>"` | Chạy ở chế độ headless, thực thi xong tự thoát (không mở TUI tương tác) |
| `--output-format json` | Trả về JSON có cấu trúc gồm `result`, `total_cost_usd`, `duration_ms`, `session_id` để script CI parse tự động |
| `--allowedTools "Read,Grep,Glob,Bash(pytest:*)"` | **Whitelisting tool chính xác**: Chỉ cho phép đọc code và chạy `pytest`, chặn sửa file hoặc chạy lệnh shell nguy hiểm (phù hợp cho PR Review Agent) |
| `--max-turns 15` | Giới hạn số vòng lặp tối đa để tránh agent chạy treo làm hết phút CI |
| `CLAUDE.md` | Nạp quy tắc coding convention, lệnh test chuẩn, và ranh giới kiến trúc của repo một cách nhất quán cho mọi agent |

### Các Use Case CI/CD phổ biến
1. **Automated PR Security & Quality Reviewer**: Trigger khi mở PR, dùng `--allowedTools "Read,Grep,Glob"` (chỉ đọc) để review diff và post comment.
2. **Self-Healing CI / Flaky Test Fixer**: Khi pipeline test fail, agent đọc error log, sửa code trong branch tạm và mở Draft PR cho con người duyệt.
3. **Large-Scale Code Migration Fleet**: Chia 200 microservices thành từng batch, mỗi worker chạy `claude -p` nâng cấp SDK và chạy test tự động.

## 3. Sandbox Isolation & Least-Privilege Execution

Coding agent có khả năng chạy lệnh `Bash`, sửa file và cài package — đây là bề mặt tấn công cực kỳ nhạy cảm nếu repo chứa code không tin cậy (ví dụ PR từ external contributor).

- **Ephemeral Container / MicroVM Sandbox**: Chạy mỗi agent job trong container/VM dùng một lần (ephemeral), tự hủy sau khi xong task.
- **Credential Isolation**: Không mount `~/.ssh`, `~/.aws` hoặc production secrets vào container của agent. Nếu cần gọi LLM, dùng **short-lived scoped proxy token** thay vì API key gốc.
- **Network Egress Control**: Tắt truy cập internet công cộng trong sandbox khi chạy untrusted code, hoặc chỉ cho phép truy cập registry nội bộ (private PyPI/npm mirror) để ngăn **dependency confusion** và **data exfiltration**.

## 4. Merge Conflict Resolution & Human Review Gates

Khi một fleet 10 agent cùng mở 10 PR vào `main`:
- **Phân vùng sở hữu (Path-based Partitioning)**: Phân công các agent sửa các module/thư mục tách biệt để giảm thiểu xung đột ngay từ đầu.
- **Automated Rebase & Verification**: Trước khi merge, CI chạy `git rebase main` và chạy lại toàn bộ integration test suite. Nếu có conflict phức tạp, có thể giao cho một Conflict-Resolution Agent xử lý nhưng **bắt buộc phải pass lại toàn bộ test**.
- **Human Review Gates**: Agent **không bao giờ** tự ý `git push --force` lên `main` hay tự approve PR của chính mình. Mọi PR do agent tạo ra đều phải qua:
  1. Automated CI checks (lint, typecheck, unit/integration tests, SAST).
  2. `CODEOWNERS` / Human Engineer review trước khi merge.

> [!TIP]
> **Exam Tip (CCDV-P):**
> 1. Muốn chạy nhiều Claude Code agents song song trên cùng một máy/repo mà không giẫm chân lên working tree của nhau → Dùng **`git worktree`**.
> 2. Tích hợp Claude Code vào GitHub Actions để tự động review PR chỉ đọc (không cho sửa file hay chạy lệnh tùy ý) → Dùng **`claude -p ... --allowedTools "Read,Grep,Glob" --output-format json --max-turns ...`**.
> 3. Chạy agent tự động sửa lỗi trên PR từ fork bên ngoài → Phải chạy trong **Ephemeral Sandbox không có production secrets và hạn chế network egress**.

---

[← Bài trước](12-incident-response.md) | [Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/13-agent-fleet.md) | [Bài tiếp →](14-fleet-worktrees.md)
