# Chủ đề 14: Parallel Agent Swarms with Git Worktrees, Merge Gates & Supervision

Trong **Domain 7 (10%)**, sau khi đã thành thạo chạy Claude Code headless trong CI/CD (Chủ đề 13), bước tiến tiếp theo ở quy mô tổ chức là vận hành **Parallel Agent Swarms** — nhiều coding agents cùng làm việc song song trên các tính năng, bản vá lỗi hoặc migration khác nhau trong cùng một repository mà không giẫm chân lên nhau.

## 1. Cô lập Working Directory bằng `git worktree`

Nếu 4 agents cùng chạy `claude -p` trong một thư mục repo duy nhất:
- Agent A chạy `git checkout feat-a` sẽ làm bay màu thay đổi chưa commit của Agent B.
- Agent A chạy `pytest` trong khi Agent B đang sửa dở file test sẽ gây lỗi giả (flaky failures).

**`git worktree`** giải quyết triệt để vấn đề này bằng cách tạo nhiều thư mục làm việc độc lập gắn với các branch khác nhau, nhưng **dùng chung một `.git` object store** (tạo tức thì, tốn rất ít dung lượng ổ đĩa).

```bash
# Tạo 3 worktrees cô lập cho 3 agents chạy song song
git worktree add ../wt-auth -b agent/feat-auth main
git worktree add ../wt-cache -b agent/feat-cache main
git worktree add ../wt-tests -b agent/fix-tests main

# Chạy song song và thu thập JSON telemetry của từng agent
(cd ../wt-auth && claude -p "Implement JWT refresh endpoint" --output-format json --max-turns 20 > /tmp/auth.json) &
(cd ../wt-cache && claude -p "Add Redis prompt cache metrics" --output-format json --max-turns 20 > /tmp/cache.json) &
(cd ../wt-tests && claude -p "Fix flaky integration tests" --output-format json --max-turns 15 > /tmp/tests.json) &
wait

# Dọn dẹp worktree sau khi đã push branch
git worktree remove ../wt-auth
```

## 2. Chiến lược Phân rã Tác vụ để Tránh Xung đột (Path-Based Partitioning)

Chạy song song hiệu quả nhất khi các agent ít đụng chạm cùng một file:
- **Path-based Partitioning**: Phân công theo ranh giới module/service rõ ràng (ví dụ Agent 1 chỉ sửa `services/auth/**`, Agent 2 chỉ sửa `services/billing/**`).
- **Shared Contract First**: Nếu hai tính năng dùng chung một API contract hoặc DB schema, hãy chạy một bước thiết kế schema trước (hoặc do con người chốt interface), sau đó mới fan-out cho các agent implement song song.

## 3. Automated Rebase, Conflict Resolution & Verification

Khi một swarm 5–10 agent lần lượt tạo Pull Request vào `main`, PR thứ 2 trở đi có thể bị lệch base hoặc conflict nhẹ (ví dụ cùng thêm import hoặc đăng ký route trong `index.ts`):

1. **Merge Queue / Automated Rebase**: Trước khi merge bất kỳ PR nào của agent, CI tự động chạy `git rebase origin/main` và thực thi lại toàn bộ **lint + typecheck + unit/integration tests**.
2. **Conflict-Resolution Agent (Có kiểm soát)**: Nếu xảy ra merge conflict, có thể trigger một agent chuyên biệt xử lý conflict trên branch đó, **nhưng bắt buộc phải chạy lại 100% test suite** sau khi giải quyết conflict (không bao giờ merge mù sau khi resolve conflict).

## 4. Human Review Gates & Supervision

Tốc độ sinh code của Agent Fleet rất nhanh, dễ tạo ra nút thắt cổ chai ở khâu review hoặc rủi ro đưa code kém chất lượng lên production.

- **Nguyên tắc bất di bất dịch**: Agent **KHÔNG BAO GIỜ** được phép push trực tiếp lên `main`, `git push --force` lên shared branch, hoặc tự approve PR của chính mình.
- **Two-Stage Gate**:
  1. **Automated Pre-Review Gate**: CI checks (SAST security scan, unit/integration tests, coverage check) + một **Reviewer Agent** độc lập (chỉ có quyền `Read,Grep,Glob`) kiểm tra diff để phát hiện lỗi logic/bảo mật trước.
  2. **Human `CODEOWNERS` Gate**: Kỹ sư con người đọc bản tóm tắt thay đổi + kết quả kiểm thử và nhấn Approve cuối cùng.
- **Fleet Cost & Progress Supervision**: Thu thập `--output-format json` (`total_cost_usd`, `duration_ms`, `num_turns`, `is_error`) từ tất cả các agent trong fleet về dashboard tập trung để phát hiện sớm agent bị kẹt vòng lặp.

> [!TIP]
> **Exam Tip (CCDV-P):**
> 1. Muốn chạy 5 Claude Code agents đồng thời trên cùng một máy/CI runner để sửa 5 module khác nhau mà không xung đột `git status` → Dùng **`git worktree`**.
> 2. Hai agent cùng sửa file chung dẫn đến merge conflict khi PR 1 vừa merge vào `main` → Dùng **Merge Queue + Automated Rebase**, nếu dùng agent giải quyết conflict thì **bắt buộc chạy lại toàn bộ test suite** trước khi cho phép Human Review.
> 3. Quy tắc quản trị bắt buộc cho PR do AI Agent Fleet tạo ra → **Branch protection + CI checks + Human `CODEOWNERS` approval** (không bao giờ cho phép auto-merge không qua người duyệt ở production repo).

---

[← Bài trước](13-agent-fleet-operations.md) | [Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/14-fleet-worktrees.md) | [Bài tiếp →](15-cost-latency-optimization.md)
