# Bài tập tình huống — Chủ đề 14: Parallel Agent Swarms with Git Worktrees, Merge Gates & Supervision

> Điều phối đội coding agents chạy song song trên các git worktrees độc lập, giải quyết xung đột merge và thiết lập cổng kiểm duyệt con người.
> **Số câu hỏi:** 10 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

An engineering team runs four Claude Code agents simultaneously on the same developer workstation to implement four independent microservices features in one monorepo. Running them in the same working directory causes frequent file overwrites and corrupted `git status`. How should the workspace be isolated?

- **A.** Create a dedicated `git worktree` and feature branch for each parallel Claude Code agent so every agent has an isolated filesystem tree.
- **B.** Instruct all four agents in `CLAUDE.md` to take turns editing shared files every 30 seconds by polling a shared lock file inside `/tmp/agent.lock`.
- **C.** Run `git reset --hard HEAD` in a background cron job every minute so conflicting concurrent edits are automatically discarded.
- **D.** Disable Git index locking inside `.git/config` while the four Claude Code agents are editing monorepo files concurrently.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ thuật chạy đồng thời bốn agent Claude Code trên cùng một máy trạm lập trình viên để triển khai bốn tính năng microservice độc lập trong một monorepo. Việc chạy chúng trong cùng một thư mục làm việc thường xuyên gây ghi đè tệp và hỏng `git status`. Không gian làm việc nên được cô lập như thế nào?

**Đáp án đúng:** **A**

Sử dụng `git worktree` là phương pháp chuẩn để chạy đội quân coding agent song song trên cùng một repository mà vẫn đảm bảo cô lập tuyệt đối hệ thống tệp và nhánh Git.

- **A (Đúng):** `git worktree` tạo các thư mục làm việc độc lập cùng chia sẻ chung một kho `.git`, giúp nhiều agent chạy song song trên các nhánh riêng mà không bao giờ ghi đè file hay xung đột index của nhau.
- **B:** Dựa vào agent tự điều phối qua file text dễ gây race condition và lãng phí thời gian chờ.
- **C:** `git reset --hard` sẽ xóa sạch công sức lập trình chưa commit của các agent.
- **D:** Tắt Git locking không ngăn được các agent ghi đè lên cùng một file vật lý và làm hỏng kho Git.

</details>

### Câu 2 `hard`

An organization runs autonomous coding agents in CI to fix failing tests on repositories that accept external contributor PRs. A security review flags the risk of malicious code in a PR executing arbitrary commands or stealing CI secrets during agent test runs. How should the fleet runtime be hardened?

- **A.** Execute each agent inside an ephemeral isolated container or microVM with least-privilege scoped tokens, no production secrets, and restricted egress.
- **B.** Run all CI agents directly on a shared long-lived build server using the root user account for faster local Docker layer caching and builds in CI.
- **C.** Pass AWS production admin keys into the agent's environment variables while instructing Claude in `CLAUDE.md` never to print them.
- **D.** Disable all unit and integration test execution in CI so that no untrusted contributor code ever executes inside the agent fleet.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức chạy các agent lập trình tự chủ trong CI để sửa các test bị lỗi trên các repository chấp nhận PR từ người đóng góp bên ngoài. Một đánh giá bảo mật cảnh báo rủi ro mã độc hại trong PR thực thi các lệnh tùy ý hoặc đánh cắp secret của CI trong quá trình chạy test của agent. Fleet runtime nên được gia cố bảo mật như thế nào?

**Đáp án đúng:** **A**

Khi chạy agent fleet trên mã nguồn chưa tin cậy (untrusted PRs), Sandbox Isolation (ephemeral container/microVM, ephemeral scoped credentials, egress firewall) là yêu cầu bắt buộc.

- **A (Đúng):** Chạy agent trong sandbox cô lập ngắn hạn (ephemeral container/microVM), không gắn production secrets, dùng token tối thiểu và khóa egress mạng giúp ngăn chặn mã độc từ PR đánh cắp bí mật hoặc xâm nhập hạ tầng.
- **B:** Chạy quyền root trên máy chủ dùng chung cho phép mã độc chiếm toàn quyền hệ thống và ảnh hưởng các job khác.
- **C:** Code chạy trong repo PR có thể đọc trực tiếp `process.env` hoặc `os.environ` mà không cần hỏi Claude.
- **D:** Không chạy unit test làm mất hoàn toàn mục đích kiểm chứng bản vá của coding agent.

</details>

### Câu 3 `medium`

Ten parallel coding agents finish their feature branches and open pull requests simultaneously, creating cascading merge conflicts in a shared `routes.ts` registry file. What fleet orchestration strategy minimizes merge conflicts and broken `main` builds?

- **A.** Force-push every completed agent branch directly onto `main` in order of completion without re-running integration test suites.
- **B.** Use a merge queue that rebases each PR onto the latest `main`, runs full CI tests, and invokes a conflict-resolution agent + human review when conflicts arise.
- **C.** Delete `routes.ts` from the repository and instruct each coding agent to hardcode endpoint URLs inside separate compiled binaries.
- **D.** Restrict the entire engineering organization so that only one developer or autonomous agent can open a pull request per week.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Mười agent lập trình chạy song song hoàn thành các nhánh tính năng của chúng và mở pull request cùng lúc, tạo ra các xung đột merge dây chuyền trong một tệp đăng ký `routes.ts` dùng chung. Chiến lược điều phối fleet nào giảm thiểu xung đột merge và tình trạng hỏng bản build `main`?

**Đáp án đúng:** **B**

Merge Queue kết hợp tái kiểm thử trên `main` mới nhất (rebase/merge-train) và quy trình giải quyết xung đột có kiểm duyệt là mảnh ghép thiết yếu khi vận hành đội agent lập trình song song.

- **A:** Force-push thẳng vào `main` sẽ ghi đè code của nhau và làm sập nhánh chính.
- **B (Đúng):** Merge queue tự động tuần tự hóa việc rebase lên `main` mới nhất, chạy lại full CI test và kích hoạt agent xử lý xung đột (kèm human review) đảm bảo nhánh `main` luôn xanh và không mất thay đổi.
- **C:** Xóa file registry chung và hardcode vào binary không phải kiến trúc phần mềm hợp lệ.
- **D:** Giới hạn 1 PR/tuần phá hủy hoàn toàn năng suất của đội agent song song.

</details>

### Câu 4 `medium`

A fleet of 15 Claude Code agents works across a large polyglot repository. Each agent repeatedly wastes turns discovering build commands, linting rules, and directory conventions. How should the team standardize fleet-wide behavior?

- **A.** Remove all ESLint, Prettier, and unit test runners from the repository so autonomous agents never encounter build failures.
- **B.** Send a daily Slack reminder to every engineer asking them to manually copy-paste build commands into each new agent prompt.
- **C.** Fine-tune a custom foundation model checkpoint every single time a new npm or pytest script is added to `package.json` or `pyproject.toml` files.
- **D.** Maintain a concise, version-controlled `CLAUDE.md` (and scoped subdirectory `CLAUDE.md` files) documenting build, test, and style conventions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một fleet gồm 15 agent Claude Code làm việc trên một repository đa ngôn ngữ (polyglot) lớn. Mỗi agent liên tục lãng phí các lượt chạy để tự khám phá lệnh build, quy tắc lint và quy ước thư mục. Nhóm nên chuẩn hóa hành vi trên toàn fleet như thế nào?

**Đáp án đúng:** **D**

`CLAUDE.md` đóng vai trò bộ nhớ quy ước dùng chung (shared fleet handbook) được version control ngay trong repository, giúp cả fleet agent tuân thủ đúng lệnh test, lint và kiến trúc.

- **A:** Xóa linter và test runner làm mất hoàn toàn lưới an toàn chất lượng code.
- **B:** Copy-paste thủ công dễ sai sót, không đồng bộ và không chạy được trong CI headless.
- **C:** Fine-tuning cho mỗi thay đổi script nhỏ cực kỳ tốn kém và chậm chạp.
- **D (Đúng):** File `CLAUDE.md` được quản lý phiên bản trong repo (cùng các `CLAUDE.md` theo từng module) tự động cung cấp lệnh build, test và quy ước dự án cho mọi agent ngay khi khởi động.

</details>

### Câu 5 `hard`

An engineering organization deploys autonomous coding agents to generate pull requests for security dependency bumps and API refactors. Which governance model prevents subtle logic bugs or backdoors from reaching production?

- **A.** Configure GitHub branch protection rules allowing the coding agent's service account to self-approve and auto-merge its own generated pull requests.
- **B.** Require passing deterministic CI checks (tests, SAST, typecheck) plus mandatory human code-owner review before merging agent-authored PRs.
- **C.** Use a second LLM agent with the exact same system prompt to rubber-stamp and auto-approve every PR without running unit tests.
- **D.** Bypass mandatory code review for any agent-authored pull request whose git diff is smaller than 50 lines of source code.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức kỹ thuật triển khai các agent lập trình tự chủ để tạo pull request cho việc nâng cấp dependency bảo mật và refactor API. Mô hình quản trị (governance model) nào ngăn chặn các lỗi logic tinh vi hoặc cửa hậu (backdoor) lọt vào production?

**Đáp án đúng:** **B**

Trong vận hành agent fleet cho software delivery, human review gates (CODEOWNERS + branch protection không cho agent tự approve) kết hợp deterministic CI checks là tiêu chuẩn quản trị bắt buộc.

- **A:** Cho phép agent tự phê duyệt và tự merge PR của chính nó vi phạm nguyên tắc tách biệt nhiệm vụ (separation of duties).
- **B (Đúng):** Kết hợp cổng kiểm tra tự động (unit/integration tests, SAST, typecheck) với yêu cầu bắt buộc con người (CODEOWNERS) review trước khi merge đảm bảo an toàn tuyệt đối cho production.
- **C:** Bỏ qua unit test và chỉ dùng LLM khác phê duyệt không phát hiện được lỗi runtime hay hồi quy chức năng.
- **D:** Một lỗi bảo mật hoặc backdoor nghiêm trọng có thể chỉ nằm trong 1-3 dòng code.

</details>

### Câu 6 `hard`

When scaling a headless Claude Code fleet in CI/CD to process dozens of repositories concurrently, which THREE operational controls keep costs bounded and execution safe?

*(Chọn 3 đáp án)*

- **A.** Set explicit turn limits (`--max-turns`) and per-job timeout budgets so runaway agents terminate predictably.
- **B.** Restrict available tools via `--allowedTools` and run inside ephemeral sandboxes without persistent credentials.
- **C.** Emit structured JSON telemetry (`--output-format json`) to track per-repo token spend, success rates, and failure modes.
- **D.** Mount the entire host Docker socket (`/var/run/docker.sock`) inside every untrusted PR agent container.
- **E.** Share one global mutable directory across all parallel CI jobs to save disk space.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Khi mở rộng quy mô một fleet Claude Code headless trong CI/CD để xử lý hàng chục repository đồng thời, BA biện pháp kiểm soát vận hành nào giúp giữ chi phí trong tầm kiểm soát và thực thi an toàn?

**Đáp án đúng:** **A, B, C**

Vận hành fleet Claude Code quy mô lớn cần: (1) Bounded execution (`--max-turns`/timeouts), (2) Sandbox + `--allowedTools` least privilege, và (3) Structured telemetry (`--output-format json`) để giám sát chi phí và chất lượng.

- **A (Đúng):** Giới hạn số lượt (`--max-turns`) và timeout theo từng job ngăn chặn agent chạy lặp vô tận làm cháy ngân sách CI.
- **B (Đúng):** Giới hạn quyền tool và chạy trong sandbox ngắn hạn không lưu credential giúp thu hẹp bề mặt tấn công.
- **C (Đúng):** Thu thập output JSON có cấu trúc giúp theo dõi chi phí token, tỷ lệ thành công và tối ưu hiệu suất toàn đội agent.
- **D:** Mount Docker socket cho phép container thoát ra chiếm quyền root trên máy chủ host.
- **E:** Dùng chung thư mục ghi cho nhiều job song song gây xung đột file và rò rỉ dữ liệu giữa các repo.

</details>

### Câu 7 `medium`

A platform team wants to run six Claude Code agents concurrently on the same backend monorepo to implement six independent Jira tickets simultaneously. Running all six agents inside the same local repository clone causes `.git/index.lock` errors, overwritten working-tree edits, and mixed branch states. Which git workflow cleanly isolates these parallel agents?

- **A.** Keep all six agents in the same local clone directory and instruct each agent in its `CLAUDE.md` prompt to avoid touching files that another concurrent agent might be editing.
- **B.** Run all six agents sequentially on the `main` branch and force-push after each ticket finishes.
- **C.** Provision an isolated `git worktree` and feature branch per agent so each runs in its own directory while sharing the Git object store.
- **D.** Delete the `.git` directory before launching the six agents and re-initialize a brand new repository after all code edits are completed.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm nền tảng muốn chạy đồng thời sáu agent Claude Code trên cùng một monorepo backend để triển khai sáu ticket Jira độc lập cùng lúc. Việc chạy cả sáu agent bên trong cùng một bản sao repository cục bộ gây ra lỗi `.git/index.lock`, ghi đè các chỉnh sửa trên working-tree và trạng thái nhánh bị trộn lẫn. Quy trình làm việc git nào cô lập gọn gàng các agent chạy song song này?

**Đáp án đúng:** **C**

`git worktree` là giải pháp chuẩn mực để vận hành đội ngũ coding agents (Claude Code fleet) song song trên cùng một repository mà vẫn cô lập hoàn toàn working tree và branch state.

- **A:** Nhờ LLM tự tránh đụng độ trong cùng thư mục không ngăn được lỗi `.git/index.lock` khi chạy `git status`/`git diff`/`git commit` đồng thời.
- **B:** Chạy tuần tự làm mất hoàn toàn lợi thế song song (concurrency), và force-push lên `main` phá vỡ quy trình CI/CD và review.
- **C (Đúng):** `git worktree` tạo ra các thư mục làm việc và index độc lập gắn với từng feature branch riêng biệt nhưng vẫn dùng chung Git object store, loại bỏ hoàn toàn xung đột file và `.git/index.lock` khi chạy nhiều Claude Code agents song song.
- **D:** Xóa `.git` làm mất toàn bộ lịch sử commit, khả năng diff và vẫn không giải quyết xung đột khi hai agent sửa cùng file cấu hình chung.

</details>

### Câu 8 `hard`

An engineering organization runs autonomous coding agents on pull requests opened by external open-source contributors. A malicious PR could embed prompt injection inside code comments or test fixtures to make the agent exfiltrate CI environment secrets or modify workflow files. Which sandbox isolation architecture best neutralizes this threat?

- **A.** Execute the coding agent directly on the shared CI host VM as `root`, relying on a `.claudeignore` file to prevent the agent from reading `.env` files or workflow credentials.
- **B.** Inject production deployment tokens into environment variables so the agent can run end-to-end tests, and ask the agent in `CLAUDE.md` never to run `curl`.
- **C.** Allow full outbound internet access from the agent container so it can install arbitrary npm packages, while logging stdout after the job finishes.
- **D.** Run each agent in an ephemeral non-root container/microVM with no prod secrets, read-only CI configs, and egress allowlists.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức kỹ thuật chạy các agent lập trình tự chủ trên các pull request được mở bởi những người đóng góp mã nguồn mở bên ngoài. Một PR độc hại có thể nhúng prompt injection bên trong bình luận code hoặc test fixture để khiến agent đánh cắp secret môi trường CI hoặc sửa đổi các tệp workflow. Kiến trúc cô lập sandbox nào vô hiệu hóa tốt nhất mối đe dọa này?

**Đáp án đúng:** **D**

Khi chạy coding agent trên mã nguồn untrusted (như external PRs), Sandbox Isolation cấp hệ điều hành/mạng (ephemeral container/microVM, non-root, no prod secrets, egress allowlist) là bắt buộc.

- **A:** `.claudeignore` không phải ranh giới bảo mật hệ điều hành; nếu agent có quyền chạy bash/script với user `root`, nó vẫn đọc được biến môi trường hoặc file hệ thống.
- **B:** Đặt secret production vào môi trường chạy code untrusted và chỉ cấm `curl` bằng `CLAUDE.md` sẽ bị vượt qua dễ dàng bằng Python/Node HTTP client.
- **C:** Cho phép outbound internet tự do giúp attacker exfiltrate dữ liệu ngay lập tức trước khi log được kiểm tra.
- **D (Đúng):** Cô lập bằng ephemeral container/microVM chạy non-root, không mount secret nhạy cảm, khóa read-only các file cấu hình CI (`.github/workflows`), và chặn egress network (chỉ allowlist registry nội bộ cần thiết) bảo vệ triệt để trước prompt injection từ PR bên ngoài.

</details>

### Câu 9 `hard`

A fleet of 8 coding agents works concurrently on separate feature branches in a TypeScript monorepo. Although every agent passes its local unit tests on its own branch, merging their PRs sequentially into `main` repeatedly breaks the build due to conflicting shared interface edits and semantic integration drift. Which fleet coordination pattern solves this?

- **A.** Disable TypeScript type-checking and integration tests on `main` so all 8 agent PRs can be merged without blocking.
- **B.** Use contract-first decomposition and an automated merge queue that rebases PRs and runs full integration tests before landing.
- **C.** Configure every agent to automatically run `git push --force origin main` as soon as its local unit tests pass.
- **D.** Configure all 8 agents to communicate via a shared Slack channel and negotiate manual line-by-line git conflict resolution with each other before pushing commits.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một fleet gồm 8 agent lập trình làm việc đồng thời trên các nhánh tính năng riêng biệt trong một monorepo TypeScript. Mặc dù mọi agent đều vượt qua các unit test cục bộ trên nhánh riêng của mình, việc merge tuần tự các PR của chúng vào `main` liên tục làm hỏng bản build do xung đột chỉnh sửa interface dùng chung và trôi dạt tích hợp ngữ nghĩa. Mẫu điều phối fleet nào giải quyết vấn đề này?

**Đáp án đúng:** **B**

Ở quy mô Agent Fleet, Merge Queue (tự động rebase + chạy integration test trên trạng thái hợp nhất) kết hợp Contract-First Decomposition là chìa khóa chống xung đột ngữ nghĩa và giữ `main` luôn xanh.

- **A:** Tắt type-check và integration test chỉ đẩy code lỗi thẳng vào production.
- **B (Đúng):** Phân rã công việc theo hợp đồng giao diện trước (contract-first) để giảm xung đột, kết hợp Merge Queue tự động rebase từng PR lên `main` mới nhất và chạy full type-check + integration tests trước khi merge sẽ loại bỏ integration drift.
- **C:** Force-push thẳng lên `main` sẽ ghi đè công việc của các agent khác và phá hủy lịch sử repository.
- **D:** Để các agent tự chat qua Slack đàm phán merge conflict rất chậm, tốn token và không đảm bảo tính đúng đắn ở tầng compiler/integration.

</details>

### Câu 10 `hard`

An engineering organization scales its autonomous Claude Code fleet to open 40+ pull requests per day. To maintain production velocity without compromising security or code quality, which THREE governance and human review gates should be enforced? (Select THREE)

*(Chọn 3 đáp án)*

- **A.** Require mandatory green CI checks (lint, type-check, SAST, unit/integration tests) and enforce CODEOWNERS human approval on security-sensitive paths such as auth, billing, and migrations.
- **B.** Configure blast-radius thresholds (such as max files changed or diff line count) that automatically escalate oversized agent PRs to senior engineer review.
- **C.** Auto-merge every agent-authored PR immediately without human review whenever the agent writes 'All tests passed' in the PR description.
- **D.** Attach immutable provenance metadata (agent session ID, prompt/task ID, and trace link) to every agent commit and PR for full auditability.
- **E.** Grant the coding agent service account `Admin` repository permissions so it can bypass branch protection rules during busy release weeks.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức kỹ thuật mở rộng quy mô fleet Claude Code tự chủ của mình để mở hơn 40 pull request mỗi ngày. Để duy trì tốc độ đưa lên production mà không ảnh hưởng đến bảo mật hoặc chất lượng mã nguồn, BA cổng quản trị và rà soát của con người nào cần được thực thi? (Chọn BA đáp án)

**Đáp án đúng:** **A, B, D**

Quản trị Agent Fleet chuẩn enterprise gồm: (1) Mandatory CI + CODEOWNERS cho đường dẫn nhạy cảm, (2) Blast-radius thresholds, và (3) Provenance audit trail gắn với từng commit/PR.

- **A (Đúng):** Kết hợp CI gate tự động toàn diện và bắt buộc CODEOWNERS người thật duyệt các vùng nhạy cảm (auth, billing, DB migration) giúp cân bằng tốc độ và an toàn.
- **B (Đúng):** Ngưỡng blast-radius (số file sửa, độ lớn diff) giúp phát hiện sớm khi agent đi lệch phạm vi nhiệm vụ và yêu cầu kỹ sư senior kiểm tra kỹ.
- **C:** Tin tưởng văn bản mô tả do agent tự viết mà bỏ qua CI gate và human review sẽ dễ lọt lỗi logic hoặc mã độc.
- **D (Đúng):** Gắn metadata truy vết nguồn gốc (session ID, task ID, trace link) vào commit/PR giúp dễ dàng kiểm toán, debug và quy trách nhiệm khi có sự cố.
- **E:** Cấp quyền Admin để agent tự vượt branch protection vô hiệu hóa toàn bộ khung quản trị và bảo mật của repository.

</details>

---

[Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md)
