# Bài tập tình huống — Chủ đề 4: Durable Execution, Checkpointing, Idempotency & HITL Approval Gates

> Lưu trạng thái thực thi (checkpointing) để phục hồi sau sự cố, đảm bảo tool side-effects idempotent và thiết kế Human-in-the-Loop cho hành động rủi ro cao.
> **Số câu hỏi:** 11 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A long-running financial reconciliation agent executes 25 sequential steps across external ERP APIs. If the worker container restarts at step 19 due to a Kubernetes node preemption, the entire workflow currently restarts from step 1, re-running expensive API calls. How should the team make this agent resilient?

- **A.** Ask Claude to memorize all 18 previous ERP responses inside its static system prompt without any external persistent storage.
- **B.** Store the agent's message array in a local Python list in RAM and increase the Kubernetes pod's CPU and memory request.
- **C.** Adopt durable execution with step-level checkpointing so a restarted worker resumes from step 19 using persisted state.
- **D.** Remove all Kubernetes liveness and readiness probes so the cluster orchestrator never detects or restarts crashed agent containers.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một agent đối soát tài chính chạy lâu thực thi 25 bước tuần tự qua các API ERP bên ngoài. Nếu worker container khởi động lại ở bước 19 do Kubernetes thu hồi node (node preemption), toàn bộ workflow hiện tại phải khởi động lại từ bước 1, chạy lại các lệnh gọi API tốn kém. Nhóm nên làm cho agent này có khả năng phục hồi (resilient) như thế nào?

**Đáp án đúng:** **C**

Các agent chạy dài (long-running workflows) cần kiến trúc Durable Execution và Checkpointing để chịu lỗi hạ tầng và tiếp tục từ đúng điểm dừng (resume from checkpoint).

- **A:** System prompt không phải nơi lưu trạng thái động xuyên suốt các lần container bị khởi động lại.
- **B:** Dữ liệu trong RAM sẽ mất hoàn toàn khi pod bị Kubernetes thu hồi (preempted).
- **C (Đúng):** Durable execution (như Temporal hoặc state store checkpointing) lưu trạng thái và kết quả từng bước, cho phép worker mới khôi phục ngay tại bước 19 mà không chạy lại 18 bước trước.
- **D:** Tắt liveness probe không ngăn được node preemption và còn khiến container treo không được khởi động lại.

</details>

### Câu 2 `medium`

An autonomous customer-operations agent has tools to look up orders, issue refunds up to $5,000, and delete user accounts. Management requires strict human oversight before any irreversible or high-value action occurs. Where should the Human-in-the-Loop (HITL) gate be enforced?

- **A.** In the system prompt, politely instructing Claude to ask the user 'Are you sure?' before invoking the refund or account deletion tool in production environments.
- **B.** In the tool execution runtime, pausing the workflow in a pending-approval state before executing high-risk tools until an authorized human approves.
- **C.** In a post-hoc daily email digest sent to the finance team after all refunds and account deletions have already executed.
- **D.** By setting `tool_choice: "none"` on all API requests so the agent can only describe refund policies in plain text.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một agent vận hành khách hàng tự chủ có các tool để tra cứu đơn hàng, hoàn tiền lên đến 5.000 USD và xóa tài khoản người dùng. Ban quản lý yêu cầu giám sát chặt chẽ của con người trước khi bất kỳ hành động không thể đảo ngược hoặc giá trị cao nào xảy ra. Cổng kiểm duyệt Human-in-the-Loop (HITL) nên được thực thi ở đâu?

**Đáp án đúng:** **B**

HITL gate cho hành động rủi ro cao (irreversible/high-value) phải được thực thi cưỡng bức tại tầng orchestrator/tool runtime (interrupt & resume), tuyệt đối không chỉ dựa vào lời dặn trong prompt.

- **A:** Chỉ dựa vào prompt có thể bị mô hình bỏ qua hoặc bị prompt injection vượt mặt.
- **B (Đúng):** Chặn tại tầng runtime thực thi tool (policy/approval gate): khi agent gọi tool rủi ro cao, hệ thống tạm dừng workflow, lưu checkpoint và chỉ thực thi sau khi có xác nhận hợp lệ từ con người.
- **C:** Email tổng hợp cuối ngày là kiểm tra hậu kiểm, không thể ngăn chặn hành động xóa tài khoản hay hoàn tiền sai đã xảy ra.
- **D:** Vô hiệu hóa toàn bộ tool làm mất khả năng vận hành của agent.

</details>

### Câu 3 `medium`

A supervisor agent delegates tasks to three specialized worker agents (Billing, Logistics, Compliance). Occasionally, when two workers disagree, the supervisor bounces the task back and forth indefinitely until the monthly API budget is exhausted. Which safeguard prevents this failure?

- **A.** Run all three worker agents at `temperature: 1.0` so they randomly change their routing decisions and break the deadlock.
- **B.** Increase the `max_tokens` per response from 4096 to 16384 so the supervisor agent can write longer inter-agent delegation reasoning steps.
- **C.** Remove the Compliance worker from the fleet so only two specialized workers remain in the supervisor's routing table.
- **D.** Enforce a strict step budget (`max_turns` / `max_hops`) and a cycle detector in the orchestrator that escalates to a fallback or human.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một supervisor agent ủy quyền tác vụ cho ba worker agent chuyên biệt (Billing, Logistics, Compliance). Thỉnh thoảng, khi hai worker bất đồng, supervisor đẩy tác vụ qua lại vô thời hạn cho đến khi ngân sách API hàng tháng cạn kiệt. Biện pháp bảo vệ nào ngăn chặn lỗi này?

**Đáp án đúng:** **D**

Mọi vòng lặp agent (agentic loop) trong production đều phải có bounded recursion / step budget (`max_steps`) và cơ chế phát hiện lặp lại để đảm bảo chấm dứt hữu hạn (guaranteed termination).

- **A:** Tăng tính ngẫu nhiên không phải giải pháp kiểm soát vòng lặp đáng tin cậy trong production.
- **B:** Tăng `max_tokens` không giải quyết vòng lặp giữa các agent mà chỉ làm mỗi lượt lặp tốn kém hơn.
- **C:** Hai worker vẫn có thể đẩy việc qua lại vô hạn nếu thiếu cơ chế giới hạn bước.
- **D (Đúng):** Giới hạn số bước tối đa (`max_turns`/`max_hops`) kết hợp phát hiện chu kỳ lặp (cycle detection) ở orchestrator sẽ cắt vòng lặp vô hạn và chuyển sang fallback/human escalation.

</details>

### Câu 4 `medium`

An engineering team is choosing between a deterministic state-machine workflow and a fully autonomous open-ended agent for an invoice-processing pipeline with fixed steps (OCR -> Validate Tax ID -> Match PO -> Post to ERP). Which approach is best suited for production?

- **A.** A single-shot prompt without any tools or validation schemas, trusting Claude to update the ERP database via generated SQL strings.
- **B.** An autonomous ReAct loop with 30 general-purpose tools where Claude decides the invoice-processing order from scratch on every invoice.
- **C.** A deterministic workflow graph with targeted Claude calls at specific nodes, reserving autonomous loops only for exception handling.
- **D.** A multi-agent debate between five Claude Opus instances to vote on whether each invoice should be parsed before or after validation.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ thuật đang lựa chọn giữa một workflow máy trạng thái tất định (deterministic state-machine) và một agent kết thúc mở hoàn toàn tự chủ cho một pipeline xử lý hóa đơn với các bước cố định (OCR -> Validate Tax ID -> Match PO -> Post to ERP). Cách tiếp cận nào phù hợp nhất cho production?

**Đáp án đúng:** **C**

Nguyên tắc vàng của Anthropic trong xây dựng agent: ưu tiên workflow đơn giản, tất định (deterministic workflows) cho các tác vụ có quy trình rõ ràng, chỉ dùng autonomous agent khi không thể xác định trước số bước.

- **A:** Không có tool và schema kiểm tra sẽ không thể kết nối ERP an toàn hay đảm bảo tính toàn vẹn dữ liệu.
- **B:** Để agent tự quyết định lại quy trình cố định trên từng hóa đơn gây lãng phí token, tăng độ trễ và rủi ro sai thứ tự bước.
- **C (Đúng):** Khi quy trình đã cố định và có thể dự đoán trước, workflow tất định (state machine/DAG) kết hợp các node Claude chuyên biệt mang lại độ tin cậy cao nhất, chi phí thấp và dễ kiểm thử; chỉ dùng agent tự chủ cho ngoại lệ.
- **D:** Dùng 5 mô hình Opus tranh luận cho một quy trình cố định là cực kỳ lãng phí chi phí và thời gian.

</details>

### Câu 5 `medium`

A coding agent has access to 45 MCP tools across GitHub, Jira, Slack, Datadog, and PostgreSQL. Tool selection accuracy has dropped noticeably and input token costs per turn have spiked. What is the most effective way to optimize tool orchestration?

- **A.** Scope tools dynamically per subagent or workflow stage, or use deferred tool discovery so only relevant tool schemas are loaded.
- **B.** Concatenate all 45 tool JSON schemas into the user message text instead of passing them inside the top-level `tools` API parameter.
- **C.** Remove all `description` fields from the 45 tool schemas to save input tokens while keeping every tool active on every turn.
- **D.** Force `tool_choice: {"type": "any"}` on every turn even when the agent is supposed to deliver a final plain-text summary.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một agent lập trình có quyền truy cập vào 45 MCP tool trên GitHub, Jira, Slack, Datadog và PostgreSQL. Độ chính xác khi chọn tool đã giảm rõ rệt và chi phí input token mỗi lượt tăng vọt. Cách hiệu quả nhất để tối ưu hóa việc điều phối tool là gì?

**Đáp án đúng:** **A**

Quá nhiều tool definition cùng lúc gây nhiễu cho model và tốn hàng nghìn token mỗi lượt. Giải pháp chuẩn là Least-Privilege / Stage-Scoped Tooling hoặc Tool Search / Deferred Loading.

- **A (Đúng):** Phân quyền tool theo từng subagent/giai đoạn hoặc dùng cơ chế deferred tool loading (chỉ nạp schema tool liên quan) giúp giảm mạnh token đầu vào và tăng độ chính xác chọn tool.
- **B:** Đưa schema vào user message không giảm số lượng token mà còn làm mất chuẩn tool-calling của API.
- **C:** Xóa mô tả tool khiến Claude không hiểu mục đích và cách dùng tham số, làm tỷ lệ gọi sai tool tăng vọt.
- **D:** Ép `tool_choice: any` khiến agent không bao giờ kết thúc được bằng văn bản trả lời người dùng.

</details>

### Câu 6 `hard`

A production platform runs hierarchical supervisor-worker agents that mutate cloud infrastructure and billing records. Which THREE architectural safeguards are essential for safe, predictable execution?

*(Chọn 3 đáp án)*

- **A.** Enforce explicit step budgets and wall-clock timeouts on every agent loop and subagent invocation.
- **B.** Require Human-in-the-Loop approval checkpoints before executing destructive or high-impact mutating tools.
- **C.** Make all mutating tool endpoints idempotent using workflow-scoped idempotency keys.
- **D.** Share a single mutable global dictionary in memory across all concurrent user requests without locking.
- **E.** Grant every worker subagent root administrator credentials across all production accounts by default.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng production vận hành các agent phân cấp supervisor-worker có khả năng thay đổi hạ tầng đám mây và bản ghi thanh toán. BA biện pháp bảo vệ kiến trúc nào là thiết yếu để thực thi an toàn và có thể dự đoán được?

**Đáp án đúng:** **A, B, C**

Ba trụ cột an toàn cho agent có khả năng thay đổi trạng thái (mutating agents): (1) Giới hạn bước & timeout, (2) Cổng phê duyệt HITL cho tác vụ rủi ro cao, và (3) Idempotency cho mọi tool ghi.

- **A (Đúng):** Step budget và timeout giúp chặn đứng tình trạng agent chạy lặp vô hạn hoặc treo.
- **B (Đúng):** Cổng phê duyệt HITL ở tầng runtime bảo vệ hạ tầng và dữ liệu thanh toán khỏi các thay đổi sai lầm.
- **C (Đúng):** Tính idempotent đảm bảo việc retry hoặc khôi phục từ checkpoint không tạo ra thao tác thay đổi hạ tầng/thanh toán trùng lặp.
- **D:** Dùng chung biến global không khóa gây race condition và rò rỉ dữ liệu giữa các người dùng.
- **E:** Cấp quyền root mặc định vi phạm nguyên tắc least privilege và cực kỳ nguy hiểm.

</details>

### Câu 7 `medium`

When designing typed handoff contracts between a Triage Agent and a Remediation Agent in an incident-response system, which TWO elements should the handoff schema include?

*(Chọn 2 đáp án)*

- **A.** A validated structured summary containing incident severity, root-cause hypotheses, and affected service IDs.
- **B.** Pointers or URIs to external evidence artifacts (such as log snapshots) rather than embedding megabytes of raw logs.
- **C.** The full unredacted system prompt and few-shot examples of the Triage Agent.
- **D.** Raw database passwords and SSH private keys needed by the Remediation Agent to connect to production.
- **E.** Every failed tool retry and verbose stack trace encountered during the triage phase.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Khi thiết kế các hợp đồng bàn giao định kiểu (typed handoff contracts) giữa một Triage Agent và một Remediation Agent trong hệ thống ứng phó sự cố, HAI thành phần nào nên được đưa vào schema bàn giao?

**Đáp án đúng:** **A, B**

Handoff contract tốt cần gọn nhẹ, chuẩn hóa bằng schema (severity, root cause, service IDs) và dùng artifact references thay vì nhồi toàn bộ raw logs hay secrets.

- **A (Đúng):** Tóm tắt có cấu trúc và đã qua kiểm tra schema giúp Remediation Agent nắm bắt ngay trọng tâm sự cố.
- **B (Đúng):** Truyền tham chiếu/URI tới artifact giúp tiết kiệm context window và chỉ nạp dữ liệu chi tiết khi thực sự cần.
- **C:** Remediation Agent có vai trò và system prompt riêng, không cần nhận lại prompt của Triage Agent.
- **D:** Tuyệt đối không truyền bí mật (secrets) qua payload hội thoại hoặc handoff LLM.
- **E:** Đưa toàn bộ log lỗi trung gian vào handoff chỉ gây nhiễu (context pollution) cho agent tiếp theo.

</details>

### Câu 8 `hard`

A multi-step document-analysis agent must run reliably over 15-minute workflows. Which TWO patterns enable seamless pause-and-resume for both infrastructure crashes and human approvals?

*(Chọn 2 đáp án)*

- **A.** Persist the serialized conversation state and tool-execution checkpoints to durable storage after every completed step.
- **B.** Use correlation/workflow IDs so external approval webhooks can locate and rehydrate the exact paused execution state.
- **C.** Keep a single HTTP request open for 15 minutes until the human reviewer clicks Approve in another browser tab.
- **D.** Re-run the entire 15-minute workflow from step 1 on every approval webhook without saving intermediate results.
- **E.** Store checkpoints exclusively in `/tmp` on ephemeral serverless container instances.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một agent phân tích tài liệu đa bước phải chạy đáng tin cậy qua các workflow kéo dài 15 phút. HAI mẫu (pattern) nào cho phép tạm dừng và tiếp tục (pause-and-resume) liền mạch cho cả sự cố sập hạ tầng và phê duyệt của con người?

**Đáp án đúng:** **A, B**

Pause-and-resume bền vững dựa trên durable state checkpointing sau từng bước và workflow correlation ID để tiếp nhận sự kiện bất đồng bộ (như HITL webhook).

- **A (Đúng):** Lưu trạng thái hội thoại và checkpoint sau mỗi bước vào kho lưu trữ bền vững (DB/Redis/Temporal) là điều kiện tiên quyết để resume.
- **B (Đúng):** Workflow ID giúp webhook phê duyệt từ con người đánh thức đúng phiên làm việc đang tạm dừng.
- **C:** Giữ kết nối HTTP mở 15 phút sẽ bị load balancer/gateway ngắt vì timeout.
- **D:** Chạy lại từ đầu gây lãng phí lớn và không bao giờ vượt qua được bước chờ phê duyệt.
- **E:** Serverless container có thể bị hủy bất cứ lúc nào, làm mất sạch dữ liệu trong `/tmp`.

</details>

### Câu 9 `hard`

A long-running research agent executes 12 sequential steps, including paid third-party data enrichment APIs and multi-minute document synthesis. If the worker container restarts due to a Kubernetes node preemption at step 9, restarting from step 1 wastes significant API budget and time. How should the agent runtime be architected to handle crashes cleanly?

- **A.** Store the entire conversation array solely in process memory and configure Kubernetes to send a SIGKILL grace period of 5 seconds.
- **B.** Ask Claude to serialize its intermediate reasoning and completed tool summaries into a local `/tmp/notes.txt` file inside the ephemeral container filesystem after every third workflow step.
- **C.** Use durable execution with step-level checkpointing to persist state, history, and tool results after each step so workflows resume from step 9.
- **D.** Merge all 12 steps into a single massive Messages API call with `max_tokens` set to 64000 so the entire workflow finishes inside one HTTP request.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một agent nghiên cứu chạy lâu thực thi 12 bước tuần tự, bao gồm các API làm giàu dữ liệu trả phí của bên thứ ba và tổng hợp tài liệu kéo dài nhiều phút. Nếu worker container khởi động lại do Kubernetes thu hồi node ở bước 9, việc khởi động lại từ bước 1 gây lãng phí đáng kể ngân sách API và thời gian. Runtime của agent nên được kiến trúc như thế nào để xử lý sự cố sập một cách gọn gàng?

**Đáp án đúng:** **C**

Durable execution và step-level checkpointing vào external persistent store là nền tảng bắt buộc cho các agent chạy dài (long-running agents) có side-effect hoặc gọi API tốn phí.

- **A:** Lưu state trong RAM của container sẽ mất sạch toàn bộ tiến trình khi container bị restart hoặc preempt.
- **B:** Filesystem cục bộ (`/tmp`) trong container bị xóa khi pod bị thay thế trên node khác, không giải quyết được bài toán durable recovery.
- **C (Đúng):** Durable execution với checkpointing sau mỗi bước (lưu state, lịch sử hội thoại và kết quả tool đã chạy vào DB/Temporal) cho phép worker mới khôi phục chính xác tại bước 9 mà không gọi lại các API trả phí ở bước 1-8.
- **D:** Một HTTP request đơn lẻ không thể thay thế 12 bước gọi API bên ngoài tuần tự, và nếu kết nối bị ngắt giữa chừng vẫn mất toàn bộ tiến trình.

</details>

### Câu 10 `medium`

In a multi-agent coding assistant, a Planner agent delegates subtasks to a Debugger agent, which occasionally delegates back to the Planner when tests fail. In production, a subtle bug caused the two agents to ping-pong subtasks for 90 minutes, exhausting the daily token budget. Which safeguard directly prevents this failure mode?

- **A.** Set `temperature: 0.0` on both agents so their responses become deterministic and they naturally agree on a single plan.
- **B.** Remove the `stop_sequences` parameter from the Messages API calls so the agents can finish their reasoning completely.
- **C.** Increase the context window size of both the Planner and Debugger agents to 200K tokens so they can inspect the entire ping-pong delegation history and voluntarily agree to terminate.
- **D.** Enforce hard orchestrator bounds—max recursion depth, step budgets, and token/time ceilings—that trigger graceful escalation.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong một trợ lý lập trình đa agent, một Planner agent ủy quyền các tác vụ con cho một Debugger agent, agent này thỉnh thoảng lại ủy quyền ngược lại cho Planner khi test thất bại. Trên production, một lỗi tinh vi đã khiến hai agent đẩy qua đẩy lại các tác vụ con trong 90 phút, làm cạn kiệt ngân sách token hàng ngày. Biện pháp bảo vệ nào ngăn chặn trực tiếp chế độ lỗi này?

**Đáp án đúng:** **D**

Mọi kiến trúc multi-agent đều phải có cơ chế Bounded Execution (giới hạn độ sâu đệ quy, ngân sách bước chạy, trần token và thời gian) được thực thi bằng code ở orchestrator, không bao giờ phó mặc cho LLM tự dừng.

- **A:** Temperature 0.0 không ngăn được vòng lặp logic; thực tế khi bị kẹt trong vòng lặp, temperature 0.0 còn khiến hai agent lặp lại đúng chuỗi hành động y hệt nhau mãi mãi.
- **B:** Bỏ `stop_sequences` không liên quan gì đến việc giới hạn số vòng ủy quyền (delegation) giữa hai agent ở tầng orchestration.
- **C:** Tăng context window chỉ cho phép vòng lặp kéo dài tốn kém hơn chứ không phải là cơ chế ngắt mạch cứng (hard bound) để ngăn chi phí bùng nổ.
- **D (Đúng):** Áp đặt các giới hạn cứng ở tầng orchestrator như max recursion depth, step budget (max turns), và ngưỡng token/thời gian tối đa giúp cắt đứt vòng lặp vô hạn và chuyển sang xử lý ngoại lệ an toàn.

</details>

### Câu 11 `hard`

An enterprise IT operations agent can read monitoring dashboards autonomously, but it also has tools to restart production database clusters and revoke IAM permissions. Which THREE design patterns should be implemented for Human-in-the-Loop (HITL) approval gates? (Select THREE)

*(Chọn 3 đáp án)*

- **A.** Classify tools by blast radius so read-only diagnostics execute autonomously while destructive or high-privilege mutations pause at an approval gate.
- **B.** Persist suspended state and present the reviewer with the exact tool name, validated arguments, and impact summary before resuming.
- **C.** Keep the synchronous HTTP request to the Messages API open for up to 2 hours with TCP keep-alive probes while waiting for the on-call engineer to click approve in Slack.
- **D.** Bind the approval token to the payload hash with a strict TTL so approved actions cannot be altered or replayed.
- **E.** Allow Claude to bypass the approval gate automatically if the model outputs the phrase 'urgent incident' in its reasoning trace.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một agent vận hành CNTT doanh nghiệp có thể tự chủ đọc các bảng điều khiển giám sát, nhưng nó cũng có các tool để khởi động lại cụm cơ sở dữ liệu production và thu hồi quyền IAM. BA mẫu thiết kế nào nên được triển khai cho các cổng phê duyệt Human-in-the-Loop (HITL)? (Chọn BA đáp án)

**Đáp án đúng:** **A, B, D**

HITL chuẩn production đòi hỏi phân tầng rủi ro tool, cơ chế suspend/resume bất đồng bộ lưu state bền vững, hiển thị rõ tham số tác động cho người duyệt, và ràng buộc chữ ký/hash + TTL vào hành động được phê duyệt.

- **A (Đúng):** Phân loại tool theo mức độ rủi ro (blast radius) giúp hệ thống giữ được tốc độ tự động hóa cho các tác vụ đọc, đồng thời chặn các tác vụ thay đổi hạ tầng nguy hiểm để chờ phê duyệt.
- **B (Đúng):** Lưu trạng thái workflow tạm dừng (asynchronous suspend/resume) và hiển thị chính xác tên tool, tham số cụ thể cùng tóm tắt tác động giúp người duyệt đưa ra quyết định chính xác và không giữ kết nối HTTP treo.
- **C:** Giữ HTTP connection mở chờ con người phản hồi trong nhiều giờ sẽ gây timeout ở load balancer, SDK và làm cạn kiệt worker threads.
- **D (Đúng):** Gắn approval token với hash của payload cụ thể và thời hạn hết hạn (TTL) ngăn chặn việc tham số bị thay đổi giữa lúc duyệt và lúc thực thi hoặc bị replay tấn công.
- **E:** Cho phép LLM tự vượt rào (bypass) gate bảo mật dựa trên văn bản tự sinh ra sẽ làm vô hiệu hóa hoàn toàn cơ chế HITL và dễ bị khai thác qua prompt injection.

</details>

---

[Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md)
