# Thẻ ghi nhớ (Flashcards) — CCDV-P

> 32 thẻ · Đọc mặt trước, tự trả lời rồi mở đáp án.

## Chủ đề 1: Resilient Claude API Integration (Circuit Breaker, Retry & Multi-Region Fallback)

**1. Ba trạng thái của Circuit Breaker là gì và vai trò của trạng thái Half-Open?**

<details><summary>Xem đáp án</summary>

Closed (bình thường), Open (ngắt mạch fail-fast để bảo vệ worker và kích hoạt fallback), Half-Open (sau thời gian cooldown, cho phép một số lượng nhỏ probe requests đi qua để kiểm tra xem upstream đã phục hồi chưa).

</details>

**2. Chiến lược Retry chuẩn cho lỗi HTTP 429/529 so với HTTP 400 ở hệ thống phân tán?**

<details><summary>Xem đáp án</summary>

Với 429/529: Retry với Exponential Backoff + Full Jitter và tôn trọng header retry-after (chống Thundering Herd). Với 400 (invalid_request_error): TUYỆT ĐỐI KHÔNG retry và KHÔNG fallback sang provider khác vì payload sai.

</details>

## Chủ đề 2: Enterprise Knowledge Grounding (Hybrid Search, Contextual Retrieval & Citations)

**3. Tại sao Production RAG cần kết hợp Hybrid Search (BM25 + Dense) với Reciprocal Rank Fusion (RRF) và Cross-Encoder Reranking?**

<details><summary>Xem đáp án</summary>

Dense nắm bắt ngữ nghĩa, BM25 khớp chính xác mã lỗi/SKU/tên hàm; RRF gộp hạng không cần chuẩn hóa điểm số (1/(60+rank)); Cross-Encoder Reranker ở Stage 2 lọc Top-50 xuống Top-5..8 với độ chính xác cao.

</details>

**4. Contextual Retrieval hoạt động như thế nào để khắc phục lỗi mất ngữ cảnh khi chunking?**

<details><summary>Xem đáp án</summary>

Trước khi tạo embedding và BM25 index, dùng model nhẹ (như Haiku) kèm Prompt Caching trên tài liệu gốc để sinh đoạn tóm tắt ngữ cảnh ngắn (50-100 tokens) gắn vào đầu mỗi chunk, giúp giảm tới 67% tỷ lệ lỗi truy xuất.

</details>

## Chủ đề 3: Multi-Agent Orchestration (Supervisor-Worker & Handoff Contracts)

**5. Pass-by-Reference và Context Isolation giải quyết vấn đề gì trong kiến trúc Hierarchical Supervisor-Worker?**

<details><summary>Xem đáp án</summary>

Tránh phình to và ô nhiễm context của Supervisor: Payload lớn (file, SQL result) được lưu ra Object Storage/DB và chỉ truyền artifact_uri + summary qua typed Handoff Contract giữa Supervisor và Worker.

</details>

**6. Các biện pháp phòng chống vòng lặp vô tận và đốt ngân sách ở Agent tự chủ?**

<details><summary>Xem đáp án</summary>

Đặt hard step budget (max_steps), giới hạn độ sâu đệ quy (max_depth), token/cost ceiling và Repeated Tool-Call Detector (hash tool_name + args để chặn khi gọi lặp y hệt 2-3 lần).

</details>

## Chủ đề 4: Durable Execution, Checkpointing, Idempotency & HITL Approval Gates

**7. Durable Execution & Checkpointing bảo vệ các agent chạy dài (long-running agents) như thế nào?**

<details><summary>Xem đáp án</summary>

Serialize và lưu AgentState (messages, step_count, token_usage) xuống persistent store sau mỗi bước/tool call. Khi worker crash và restart, agent tiếp tục từ checkpoint cuối cùng mà không chạy lại từ đầu.

</details>

**8. Cơ chế triển khai Human-in-the-Loop (HITL) Approval Gate đúng chuẩn cho các tool có side-effect rủi ro cao?**

<details><summary>Xem đáp án</summary>

Chặn thực thi trước khi gọi tool ghi/xóa/thanh toán, lưu checkpoint trạng thái WAITING_FOR_APPROVAL, giải phóng worker và gửi thông báo duyệt. Khi có quyết định (Approve/Reject) mới đánh thức workflow để thực thi (kèm idempotency key) hoặc trả tool_result lỗi.

</details>

## Chủ đề 5: OpenTelemetry GenAI Tracing & End-to-End Agent Span Propagation

**9. Các OpenTelemetry GenAI Semantic Conventions attributes cốt lõi cần gắn vào LLM Span?**

<details><summary>Xem đáp án</summary>

gen_ai.system, gen_ai.request.model, gen_ai.response.finish_reasons, gen_ai.usage.input_tokens, gen_ai.usage.output_tokens, gen_ai.usage.cache_read.input_tokens và gen_ai.usage.cache_creation.input_tokens.

</details>

**10. Làm sao duy trì Distributed Trace xuyên suốt qua nhiều Agent hops, MCP servers và Async Queues (SQS/Kafka)?**

<details><summary>Xem đáp án</summary>

Truyền W3C Trace Context (header traceparent) qua mọi HTTP/MCP request đồng bộ, và inject traceparent vào message metadata/headers trước khi đẩy vào queue bất đồng bộ để consumer nối tiếp cùng trace_id.

</details>

## Chủ đề 6: Production Telemetry Dashboards (TTFT, TPOT, Cache Hit Ratio & Audit Logs)

**11. Phân biệt 3 chỉ số độ trễ streaming: TTFT, ITL và TPOT?**

<details><summary>Xem đáp án</summary>

TTFT (Time to First Token): thời gian chờ token đầu tiên (phụ thuộc kích thước prompt & cache). ITL (Inter-Token Latency): độ trễ giữa 2 token liên tiếp. TPOT (Time Per Output Token): (E2E - TTFT) / (output_tokens - 1).

</details>

**12. Nguyên tắc ghi Structured Audit Logs cho hệ thống Claude doanh nghiệp mà không vi phạm bảo mật?**

<details><summary>Xem đáp án</summary>

Chạy middleware redact/mask PII và secrets trước khi ghi log; tách biệt immutable audit metadata (ai gọi tool gì, khi nào, allow/deny) khỏi debug payload (chỉ bật có điều kiện, mã hóa riêng và đặt TTL ngắn).

</details>

## Chủ đề 7: Evaluation Engineering (Golden Datasets, Deterministic Graders & LLM-as-a-Judge)

**13. Khi nào nên dùng Deterministic Grader và khi nào mới dùng LLM-as-a-Judge?**

<details><summary>Xem đáp án</summary>

Luôn ưu tiên Deterministic Grader (JSON schema, regex, AST, unit test, citation ID check) vì nhanh, miễn phí và 0% variance. Chỉ dùng LLM-as-a-Judge cho tiêu chí ngữ nghĩa như faithfulness, relevance, tone.

</details>

**14. Cách giảm Verbosity Bias và Self-Enhancement Bias khi thiết kế LLM-as-a-Judge?**

<details><summary>Xem đáp án</summary>

Dùng rubric phạt sự dư thừa và chấm theo atomic checklist; yêu cầu xuất field reasoning trước score trong JSON; và hiệu chuẩn (calibrate) Judge bằng tập mẫu do chuyên gia người thật gán nhãn (đo Cohen's Kappa).

</details>

## Chủ đề 8: CI/CD Regression Gates, Shadow Deployments & Bias Mitigation

**15. Position Bias trong Pairwise LLM-as-a-Judge là gì và cách khắc phục triệt để?**

<details><summary>Xem đáp án</summary>

Là xu hướng Judge ưu ái phương án đứng đầu hoặc đứng cuối. Khắc phục bằng Bidirectional Evaluation (Position Swapping): chạy 2 lượt (A, B) và (B, A); chỉ công nhận thắng nếu nhất quán cả hai chiều, ngược lại tính là Tie.

</details>

**16. Shadow Deployment (Dark Launch) mang lại giá trị gì trong quy trình QA trước khi release prompt/model mới?**

<details><summary>Xem đáp án</summary>

Nhân bản traffic production thật gửi bất đồng bộ sang phiên bản mới để đánh giá chất lượng, độ trễ và chi phí trên dữ liệu thực tế mà hoàn toàn không ảnh hưởng đến phản hồi trả về cho người dùng cuối (nhớ mock mutating tools).

</details>

## Chủ đề 9: Indirect Prompt Injection Defense & Data/Instruction Isolation

**17. Mô hình Defense-in-Depth chống Indirect Prompt Injection (IPI) từ tài liệu RAG/Web/Email gồm những lớp nào?**

<details><summary>Xem đáp án</summary>

(1) Data/Instruction isolation bằng XML tags (<untrusted_document>) và escape thẻ đóng; (2) Input/tool-output classifier quét lệnh ẩn; (3) Least-privilege tool scoping; (4) Deterministic policy gate & network egress allowlist.

</details>

**18. Kỹ thuật Data/Instruction Isolation bằng XML tags và Spotlighting cần lưu ý điều gì khi nạp dữ liệu bên ngoài?**

<details><summary>Xem đáp án</summary>

Bao bọc dữ liệu không tin cậy trong thẻ riêng (như <untrusted_document>), bắt buộc escape/sanitize các thẻ đóng giả mạo trong nội dung đầu vào để kẻ tấn công không thoát khỏi vùng dữ liệu, và chỉ thị rõ trong System Prompt không thực thi lệnh bên trong thẻ.

</details>

## Chủ đề 10: Runtime Guardrails, PII/Secret Redaction & Least-Privilege MCP Scoping

**19. Nguyên tắc bắt buộc để chống Cross-Tenant Data Leakage và SSRF trong hệ thống RAG + MCP?**

<details><summary>Xem đáp án</summary>

Không cho LLM tự truyền tenant_id; backend phải trích xuất tenant_id từ verified JWT và ép vào Vector DB/MCP filter. Đồng thời dùng Network Egress Allowlist chặn IP nội bộ (169.254.169.254, 10.0.0.0/8) để chống SSRF.

</details>

**20. Cách bảo vệ dữ liệu PII và API secrets không bị rò rỉ qua LLM hoặc log?**

<details><summary>Xem đáp án</summary>

Dùng middleware deterministic (Regex/NER như Presidio) redact/tokenize PII và secrets trước khi gửi prompt lên LLM, đồng thời quét lại tool_result và final output trước khi trả về user hoặc ghi log.

</details>

## Chủ đề 11: Debugging Non-Deterministic Failures, Tool Loops & Silent Truncation

**21. Hiện tượng Silent Truncation (stop_reason == 'max_tokens') thường gây ra lỗi gì và cần xử lý ra sao?**

<details><summary>Xem đáp án</summary>

Model ngừng giữa chừng khi đang sinh JSON/XML gây lỗi parser (JSONDecodeError), đặc biệt khi bật Extended Thinking vì thinking tokens cũng nằm trong ngân sách max_tokens. Cần kiểm tra stop_reason trước khi parse và tăng max_tokens hoặc chia nhỏ task.

</details>

**22. Làm sao tái hiện một lỗi không tất định (non-deterministic failure) trên production và phá vỡ Tool-Call Loops?**

<details><summary>Xem đáp án</summary>

Lưu Trace Snapshot đầy đủ (pinned model, system, tools, messages, tool_results, params) và replay ở temperature=0.0. Để phá Tool-Call Loops, trả Actionable Tool Errors (nêu rõ trường sai và định dạng đúng) kèm Repeated Call Detector.

</details>

## Chủ đề 12: Context Rot, Model Drift & Production Incident Runbooks

**23. Context Rot ('Lost in the Middle') là gì và 3 cách khắc phục chính?**

<details><summary>Xem đáp án</summary>

Là hiện tượng model suy giảm khả năng tuân thủ chỉ dẫn hoặc bỏ sót thông tin ở giữa context quá dài/nhiều nhiễu. Khắc phục bằng: Context Compaction (tóm tắt lượt cũ), Subagent Isolation, và đặt thông tin trọng yếu ở đầu/cuối prompt.

</details>

**24. Làm sao phòng ngừa Model Drift và thực thi Incident Runbook khi hệ thống gặp sự cố nghiêm trọng?**

<details><summary>Xem đáp án</summary>

Luôn pin exact model snapshot ID (tránh alias -latest). Khi có sự cố: Instant rollback prompt_version qua Feature Flag, Circuit Breaker failover sang Bedrock/Vertex, hạ cấp sang Haiku (Graceful Degradation) hoặc bật kill-switch vô hiệu hóa tool ghi.

</details>

## Chủ đề 13: Headless Claude Code CI/CD Pipelines & Sandbox Isolation

**25. Ý nghĩa các cờ cốt lõi khi chạy Claude Code headless trong CI/CD: -p, --output-format json, --allowedTools, --max-turns?**

<details><summary>Xem đáp án</summary>

-p chạy non-interactive; --output-format json xuất kết quả kèm cost/duration có cấu trúc; --allowedTools whitelist chính xác tool được phép (ví dụ chỉ đọc cho PR review); --max-turns giới hạn vòng lặp tránh treo pipeline.

</details>

**26. Các yêu cầu bảo mật Sandbox khi chạy coding agent tự động trên PR từ external contributor (fork)?**

<details><summary>Xem đáp án</summary>

Chạy trong Ephemeral Container/MicroVM tự hủy, không mount ~/.ssh hoặc ~/.aws hay production secrets, dùng scoped proxy token và giới hạn network egress (tắt internet hoặc chỉ cho truy cập private package mirror).

</details>

## Chủ đề 14: Parallel Agent Swarms with Git Worktrees, Merge Gates & Supervision

**27. Tại sao phải dùng git worktree khi chạy nhiều Claude Code agents song song trên cùng một repository?**

<details><summary>Xem đáp án</summary>

git worktree tạo các thư mục làm việc (working directory) và branch độc lập dùng chung một .git store, giúp các agent không ghi đè file hay làm hỏng git status của nhau mà không cần clone lại toàn bộ repo.

</details>

**28. Quy trình chuẩn để kiểm soát chất lượng khi một fleet coding agents mở nhiều PR cùng lúc?**

<details><summary>Xem đáp án</summary>

Phân vùng sở hữu theo thư mục để giảm conflict; chạy git rebase main + full test suite tự động trước khi merge; và luôn áp dụng Human Review Gates (CI checks + CODEOWNERS approval), tuyệt đối không cho agent tự push main.

</details>

## Chủ đề 15: Prompt Cache Hit Ratio Optimization & Tiered Model Routing

**29. Thứ tự sắp xếp prompt bắt buộc để tối đa hóa Prompt Cache Hit Ratio và những lỗi hay làm hỏng cache?**

<details><summary>Xem đáp án</summary>

Thứ tự: tools (tĩnh) -> system (tĩnh) -> static docs/examples (gắn cache_control) -> dynamic user query. Lỗi phổ biến: chèn timestamp/UUID động vào đầu system prompt, sắp xếp lại mảng tools, hoặc prefix dưới ngưỡng tối thiểu (1,024/2,048 tokens).

</details>

**30. Mô hình Tiered Model Routing giữa Haiku, Sonnet và Opus hoạt động như thế nào?**

<details><summary>Xem đáp án</summary>

Dùng Haiku (rẻ, độ trễ cực thấp) làm router/classifier hoặc xử lý tác vụ đơn giản; Sonnet làm mặc định cho 80% tác vụ RAG/coding/agent; chỉ escalate lên Opus cho suy luận phức tạp hoặc khi tầng dưới không đạt confidence.

</details>

## Chủ đề 16: Message Batches API, Context Compaction & TPM/Rate-Limit Shaping

**31. Các thông số và trường hợp sử dụng tối ưu của Message Batches API?**

<details><summary>Xem đáp án</summary>

Giảm 50% chi phí input/output tokens, SLA hoàn thành <= 24 giờ, tối đa 100,000 requests hoặc 256 MB/batch (dùng custom_id để map kết quả). Tối ưu cho evals ban đêm, phân loại hàng loạt, gắn nhãn và tóm tắt dữ liệu offline.

</details>

**32. Làm thế nào để điều tiết lưu lượng (TPM Shaping) và nén ngữ cảnh (Context Compaction) ở quy mô lớn?**

<details><summary>Xem đáp án</summary>

Dùng POST /v1/messages/count_tokens (miễn phí) ước lượng trước; áp dụng Distributed Token Bucket (Redis) + AIMD Adaptive Concurrency để tránh 429; và dùng Haiku tóm tắt lượt cũ (Context Compaction) giữ sliding window gần nhất.

</details>

---

[Mục lục CCDV-P](00-tong-quan-va-lo-trinh-ccdv-p.md)
