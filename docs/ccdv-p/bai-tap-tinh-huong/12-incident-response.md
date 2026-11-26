# Bài tập tình huống — Chủ đề 12: Context Rot, Model Drift & Production Incident Runbooks

> Nhận diện suy giảm chất lượng do context quá dài (context rot), trôi hành vi khi đổi phiên bản model và quy trình rollback/graceful degradation.
> **Số câu hỏi:** 10 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

An autonomous coding agent enters an infinite tool-call loop: it runs `pytest`, sees a missing dependency error, calls `read_file` on `requirements.txt`, and repeats `pytest` identically 15 times without editing anything. How should the orchestrator detect and break this loop at runtime?

- **A.** Wait until the organization's monthly Anthropic spending limit is reached so the production API key is automatically suspended.
- **B.** Delete `requirements.txt` from the Git repository so that `read_file` returns a 404 file-not-found error instead.
- **C.** Set `max_tokens` to 20,000 so Claude can execute all 15 `pytest` tool calls inside a single assistant turn without looping.
- **D.** Hash recent `(tool_name, normalized_args)` tuples; when consecutive or cyclic duplicates exceed a threshold, inject a corrective hint or abort to human escalation.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một agent lập trình tự chủ rơi vào vòng lặp gọi tool vô hạn: nó chạy `pytest`, thấy lỗi thiếu dependency, gọi `read_file` trên `requirements.txt`, rồi lặp lại `pytest` y hệt 15 lần mà không chỉnh sửa gì. Bộ điều phối nên phát hiện và ngắt vòng lặp này tại runtime như thế nào?

**Đáp án đúng:** **D**

Tool-call loop detection (phát hiện trùng lặp chữ ký `tool_name + args` hoặc trạng thái lỗi lặp lại) kết hợp step budget giúp cắt vòng lặp vô hạn ngay lập tức ở runtime.

- **A:** Chờ hết ngân sách tháng sẽ làm gián đoạn toàn bộ các dịch vụ khác của công ty.
- **B:** Xóa file cấu hình dự án không giải quyết cơ chế phát hiện lặp của orchestrator.
- **C:** Mỗi lần gọi tool đòi hỏi vòng phản hồi `tool_result` từ client, không thể gói trong một turn duy nhất và cũng không phá được vòng lặp.
- **D (Đúng):** Theo dõi chữ ký (hash) của `(tool_name, args)` trong cửa sổ trượt: khi phát hiện lặp lại giống hệt nhau quá ngưỡng (ví dụ 2-3 lần), orchestrator tiêm thông điệp nhắc agent đổi hướng hoặc dừng vòng lặp để escalate.

</details>

### Câu 2 `hard`

A user reports a bizarre hallucination from a 12-turn agent session that occurred 3 hours ago. When engineers re-run the same initial user query against live production, the bug does not reproduce because the underlying database and model randomness have changed. How should the team make such non-deterministic failures reproducible?

- **A.** Capture full immutable trace snapshots (exact messages, system prompt, tool schemas, model version, and recorded tool outputs) for deterministic replay in a test harness.
- **B.** Ask the affected user to re-type all 12 conversation turns slowly while an on-call engineer watches live server logs.
- **C.** Take a full binary snapshot of the production PostgreSQL database every 5 seconds for every active user session.
- **D.** Log only the final assistant text string and discard all intermediate `tool_use` and `tool_result` blocks to save disk space.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một người dùng báo cáo một lỗi bịa đặt thông tin (hallucination) kỳ lạ từ một phiên làm việc agent 12 lượt xảy ra 3 giờ trước. Khi các kỹ sư chạy lại đúng truy vấn người dùng ban đầu trên production trực tiếp, lỗi không tái hiện vì cơ sở dữ liệu nền và tính ngẫu nhiên của mô hình đã thay đổi. Nhóm nên làm thế nào để các lỗi không tất định như vậy có thể tái lập được?

**Đáp án đúng:** **A**

Trace-based deterministic replay (ghi lại toàn bộ prompt, model snapshot, và recorded tool responses) là kỹ thuật cốt lõi để debug các lỗi không tất định trong hệ thống agent.

- **A (Đúng):** Lưu trace snapshot bất biến (toàn bộ `messages`, `system`, `tools`, `model_id`, tham số và `tool_result` đã ghi lại) cho phép phát lại (deterministic replay) chính xác trạng thái tại thời điểm lỗi mà không phụ thuộc DB sống.
- **B:** Dữ liệu DB và trạng thái đã thay đổi sau 3 giờ, không thể tái hiện bằng cách gõ lại thủ công.
- **C:** Snapshot toàn bộ DB mỗi 5 giây là bất khả thi về lưu trữ và hiệu năng.
- **D:** Bỏ qua `tool_use`/`tool_result` làm mất hoàn toàn bằng chứng về những gì agent đã nhìn thấy.

</details>

### Câu 3 `medium`

In a long-running customer-support chat, accuracy on following formatting rules degrades sharply after turn 18, when the conversation exceeds 65,000 tokens of accumulated tool outputs and history. What phenomenon is occurring, and how should it be mitigated?

- **A.** Rate-limit throttling; split the single long-running conversation across five separate Anthropic organization API keys.
- **B.** Context rot (lost-in-the-middle degradation); apply conversation compaction, prune stale tool outputs, and restate critical constraints near the end of the prompt.
- **C.** UTF-8 character encoding corruption; strip all Unicode characters and convert messages to 7-bit ASCII before sending.
- **D.** DNS cache poisoning; flush the backend server's local DNS resolver cache every 10 customer conversation turns.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong một cuộc trò chuyện hỗ trợ khách hàng kéo dài, độ chính xác khi tuân thủ các quy tắc định dạng giảm mạnh sau lượt thứ 18, khi cuộc hội thoại vượt quá 65.000 token kết quả tool và lịch sử tích lũy. Hiện tượng gì đang xảy ra và nên giảm thiểu như thế nào?

**Đáp án đúng:** **B**

Context rot xảy ra khi lịch sử hội thoại và tool output tích tụ quá lớn làm loãng sự chú ý của mô hình. Context engineering (compaction/summarization, tool-result pruning) giúp giữ ngữ cảnh gọn và sắc nét.

- **A:** Throttling gây lỗi HTTP 429, không làm giảm khả năng tuân thủ định dạng của mô hình ở lượt 18.
- **B (Đúng):** Context rot (suy giảm chú ý khi ngữ cảnh quá dài và nhiễu) khiến model quên chỉ thị ban đầu. Giải pháp là nén hội thoại (compaction), cắt tỉa tool output cũ và nhắc lại các ràng buộc quan trọng ở gần cuối ngữ cảnh.
- **C:** Claude hỗ trợ UTF-8 hoàn chỉnh; vấn đề không phải do bảng mã ký tự.
- **D:** DNS không liên quan đến chất lượng suy luận trên ngữ cảnh dài.

</details>

### Câu 4 `medium`

After an automatic minor model alias update in staging, an extraction pipeline's accuracy drops from 96% to 84% because the newer model wraps JSON in markdown code fences (` ```json `). How should production systems protect against unexpected model drift?

- **A.** Restart the Kubernetes application pods every hour to flush the foundation model's internal server-side token cache.
- **B.** Point production workloads directly to unversioned `-latest` aliases so model updates arrive silently without CI checks.
- **C.** Catch and ignore all JSON parsing exceptions in production and forward raw unparsed markdown strings directly to downstream API microservices.
- **D.** Pin exact dated model snapshot IDs in production, run golden evals before upgrading aliases, and use structured outputs/schema enforcement.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Sau một bản cập nhật tự động bí danh mô hình phụ (minor model alias) trên staging, độ chính xác của một pipeline trích xuất giảm từ 96% xuống 84% vì mô hình mới hơn bọc JSON trong các khối mã markdown (` ```json `). Các hệ thống production nên bảo vệ trước sự trôi dạt mô hình (model drift) bất ngờ như thế nào?

**Đáp án đúng:** **D**

Chống model drift đòi hỏi: pin exact model IDs (không dùng floating alias trên prod), kiểm thử hồi quy qua eval gate trước khi nâng cấp, và sử dụng Structured Outputs / Tool Use thay vì parse markdown thủ công.

- **A:** Mô hình chạy trên API của Anthropic, restart pod ứng dụng không thay đổi hành vi sinh mã của model.
- **B:** Trỏ thẳng vào alias tự cập nhật trên production gây ra model drift bất ngờ.
- **C:** Bỏ qua lỗi parse sẽ làm hỏng toàn bộ hệ thống downstream.
- **D (Đúng):** Luôn ghim (pin) model snapshot ID có ngày cụ thể trên production, chạy bộ golden eval trước khi nâng cấp phiên bản mới và dùng structured output/schema để tránh phụ thuộc định dạng văn bản thuần.

</details>

### Câu 5 `hard`

During a P1 production incident, a newly deployed prompt template (`v22`) causes a 30% spike in hallucinated refund amounts, while the primary Claude region simultaneously experiences elevated 529 errors. What should the on-call engineer's incident runbook prioritize?

- **A.** Manually edit `v22` directly on a live production container while keeping all user traffic routed to the degraded region.
- **B.** Purge all OpenTelemetry traces from the past 2 hours so the operational SLA dashboards return to green status.
- **C.** Roll back the prompt registry immediately to `v21`, trip the regional circuit breaker to failover, and add the failing traces to the regression eval suite post-incident.
- **D.** Wait 24 hours to collect a larger statistical sample of `v22` refund hallucinations before taking any mitigation action.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong một sự cố production mức P1, một mẫu prompt mới triển khai (`v22`) gây ra sự gia tăng đột biến 30% số tiền hoàn trả bị bịa đặt, trong khi vùng Claude chính đồng thời gặp lỗi 529 tăng cao. Sổ tay xử lý sự cố (incident runbook) của kỹ sư trực (on-call) nên ưu tiên điều gì?

**Đáp án đúng:** **C**

Phản ứng sự cố P1 cho hệ thống AI tách biệt rõ: khôi phục dịch vụ nhanh nhất (rollback prompt/config + failover region/degrade mode), sau đó mới phân tích root cause và bổ sung vào golden eval set.

- **A:** Sửa nóng trực tiếp trên pod không qua kiểm thử và không xử lý sự cố 529 của region.
- **B:** Xóa trace là che giấu sự cố và làm mất dữ liệu điều tra nguyên nhân gốc.
- **C (Đúng):** Runbook chuẩn P1: (1) Rollback ngay prompt registry về bản ổn định `v21`, (2) Kích hoạt failover sang region/provider dự phòng để xử lý 529, và (3) Sau sự cố chuyển các trace lỗi thành test case hồi quy.
- **D:** Chờ 24 giờ trong sự cố P1 gây thiệt hại tài chính nghiêm trọng từ các khoản hoàn tiền sai.

</details>

### Câu 6 `hard`

When diagnosing a production incident where an agent suddenly starts failing tasks that succeeded yesterday, which THREE signals should an engineer inspect first?

*(Chọn 3 đáp án)*

- **A.** Recent changes in prompt template versions, tool schema definitions, or RAG index snapshots.
- **B.** Changes in `stop_reason` distributions, tool `is_error` rates, and upstream HTTP 429/529 status codes.
- **C.** Full trace snapshots of failing trajectories comparing `tool_use` arguments and retrieved chunks against baseline runs.
- **D.** The CSS font-family settings on the company's public marketing landing page.
- **E.** The physical serial numbers of the developer laptops used to commit code last year.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Khi chẩn đoán một sự cố production nơi một agent đột nhiên bắt đầu thất bại ở các tác vụ mà hôm qua vẫn thành công, BA tín hiệu nào kỹ sư nên kiểm tra đầu tiên?

**Đáp án đúng:** **A, B, C**

Quy trình triage sự cố agent: (1) Kiểm tra thay đổi phiên bản (prompt/tool/index), (2) Kiểm tra telemetry (`stop_reason`, `is_error`, 429/529), và (3) So sánh trace snapshot từng bước của ca lỗi.

- **A (Đúng):** Thay đổi ở prompt, tool schema hoặc dữ liệu index RAG là nguyên nhân phổ biến nhất gây suy giảm chất lượng đột ngột.
- **B (Đúng):** Biến động `stop_reason` (`max_tokens`), tỷ lệ lỗi từ tool và mã lỗi HTTP API giúp khoanh vùng ngay tầng bị lỗi.
- **C (Đúng):** Đối chiếu trace snapshot của ca lỗi với baseline cho thấy chính xác bước nào bị lệch (truy xuất sai hay gọi tool sai).
- **D:** Giao diện trang marketing không liên quan đến pipeline thực thi của agent.
- **E:** Thông tin phần cứng laptop không giúp chẩn đoán lỗi runtime trên production.

</details>

### Câu 7 `hard`

Users report that a financial research agent intermittently skips a mandatory compliance check tool on roughly 4% of production runs. When engineers test the same user question locally, the agent behaves correctly every time. What telemetry capability is required to reliably reproduce and diagnose this non-deterministic failure?

- **A.** Record only the final assistant text output, HTTP 200 status code, and total latency in application logs, then iteratively guess which prompt edit might have caused the intermittent skip.
- **B.** Capture immutable trace snapshots—exact model ID, prompt hash, tool schemas, parameters, messages, and tool results—for deterministic replay.
- **C.** Restart all agent worker pods every 30 minutes to clear Python garbage collection state before non-deterministic failures accumulate.
- **D.** Disable tool calling in production for 48 hours and ask users to describe the missing compliance check in a feedback survey.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Người dùng báo cáo rằng một agent nghiên cứu tài chính thỉnh thoảng bỏ qua một tool kiểm tra tuân thủ bắt buộc trong khoảng 4% số lần chạy trên production. Khi các kỹ sư kiểm thử cùng câu hỏi người dùng đó ở môi trường cục bộ, agent hoạt động đúng mọi lần. Khả năng telemetry nào là cần thiết để tái lập và chẩn đoán đáng tin cậy lỗi không tất định này?

**Đáp án đúng:** **B**

Vì hệ thống agent có tính bất định và phụ thuộc vào dữ liệu động (RAG, tool output), việc chụp Trace Snapshots bất biến (immutable replayable state) là điều kiện tiên quyết để tái hiện và sửa các lỗi hiếm gặp (intermittent bugs).

- **A:** Chỉ lưu text cuối cùng không cho biết chuỗi tool calls, nội dung RAG chunks động hay trạng thái message array tại thời điểm xảy ra lỗi.
- **B (Đúng):** Lưu trace snapshot đầy đủ (model ID chính xác, system prompt, tool schemas, tham số, toàn bộ mảng messages và kết quả tool trả về tại thời điểm lỗi) cho phép kỹ sư replay lại chính xác ngữ cảnh gây lỗi trên môi trường debug.
- **C:** Restart pod không giải quyết được lỗi logic hay sự biến thiên do ngữ cảnh RAG/tool output gây ra trong LLM.
- **D:** Tắt tính năng cốt lõi trên production không phải cách debug chuyên nghiệp và làm gián đoạn hoàn toàn dịch vụ.

</details>

### Câu 8 `hard`

During a debugging session, engineers discover that a customer-support agent repeatedly calls `search_knowledge_base(query='refund policy')` 14 times in a row within a single turn loop, each time receiving an empty list `[]` and immediately retrying the exact same tool call. What combination of fixes resolves this tool-call loop?

- **A.** Detect duplicate `(tool_name, args_hash)` calls, return actionable error feedback, and enforce a per-session loop circuit breaker.
- **B.** Increase `max_tokens` to 32000 on every turn so Claude has enough output room to eventually realize on its 20th attempt that the search query returned empty results.
- **C.** Return HTTP 500 from the knowledge base tool whenever a search yields zero documents so the entire customer chat crashes immediately.
- **D.** Remove the `search_knowledge_base` tool from the agent entirely and hardcode the refund policy into the user's browser localStorage.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong một phiên gỡ lỗi, các kỹ sư phát hiện một agent hỗ trợ khách hàng liên tục gọi `search_knowledge_base(query='refund policy')` 14 lần liên tiếp trong một vòng lặp một lượt duy nhất, mỗi lần đều nhận về danh sách rỗng `[]` và ngay lập tức thử lại đúng lệnh gọi tool đó. Tổ hợp biện pháp khắc phục nào giải quyết vòng lặp gọi tool này?

**Đáp án đúng:** **A**

Tool-call loops thường xảy ra khi tool trả về kết quả mơ hồ hoặc lỗi không có hướng dẫn khắc phục. Giải pháp chuẩn gồm: phát hiện trùng lặp `(tool, args)` ở orchestrator, thiết kế actionable tool responses, và đặt circuit breaker.

- **A (Đúng):** Phát hiện lặp `(tool_name, args_hash)` ở orchestrator, trả về thông báo lỗi/phản hồi mang tính hướng dẫn (actionable feedback như gợi ý từ khóa khác hoặc dừng tìm kiếm) thay vì `[]` trống rỗng, kết hợp circuit breaker ngắt vòng lặp sẽ triệt tiêu tool-call loop.
- **B:** Tăng `max_tokens` không ngăn được vòng lặp giữa các lượt gọi API trong agent loop mà chỉ làm tốn thêm chi phí.
- **C:** Làm sập cả phiên chat khi không tìm thấy tài liệu mang lại trải nghiệm tệ hại và không phải xử lý ngoại lệ đúng đắn.
- **D:** Bỏ công cụ tìm kiếm sẽ làm mất khả năng tra cứu toàn bộ kho tri thức động của hệ thống.

</details>

### Câu 9 `hard`

A coding agent performs accurately during the first 5 turns of a session, but after accumulating 110,000 tokens of verbose compiler logs, stack traces, and raw file dumps in the message history, it starts ignoring core formatting rules from the system prompt and hallucinating file paths. What phenomenon is occurring and how should it be mitigated?

- **A.** Prompt Cache Expiration; the fix is setting `cache_control` TTL to 24 hours on every user turn.
- **B.** Tokenization Drift; the fix is encoding all source code files and compiler stack traces into base64 strings before appending them to the message array to preserve exact byte alignment.
- **C.** Context Rot from noisy bloated history; mitigate with rolling context compaction and pruning stale verbose tool outputs.
- **D.** Rate-Limit Throttling; the fix is splitting every assistant message into 10-token chunks using `stop_sequences`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một agent lập trình hoạt động chính xác trong 5 lượt đầu tiên của một phiên, nhưng sau khi tích lũy 110.000 token log trình biên dịch dài dòng, stack trace và nội dung tệp thô trong lịch sử tin nhắn, nó bắt đầu bỏ qua các quy tắc định dạng cốt lõi từ system prompt và bịa đặt đường dẫn tệp. Hiện tượng gì đang xảy ra và nên giảm thiểu như thế nào?

**Đáp án đúng:** **C**

Context Rot là hiện tượng chất lượng suy luận và tuân thủ chỉ dẫn suy giảm khi ngữ cảnh chứa quá nhiều nhiễu (verbose logs, stale tool outputs). Context Compaction và selective pruning là kỹ thuật bắt buộc cho agent chạy dài.

- **A:** Cache expiration chỉ ảnh hưởng đến chi phí và TTFT, không làm suy giảm chất lượng suy luận hay khả năng tuân thủ chỉ dẫn của mô hình.
- **B:** Mã hóa base64 mã nguồn sẽ làm tăng gấp nhiều lần số token và khiến mô hình không thể đọc hiểu code.
- **C (Đúng):** Context Rot xảy ra khi context window bị nhồi nhét quá nhiều log và tool output cũ gây nhiễu sự chú ý (attention) của mô hình. Áp dụng Context Compaction (tóm tắt các lượt cũ, cắt tỉa tool output dư thừa) giúp giữ context gọn sạch và duy trì độ chính xác.
- **D:** Rate-limit throttling trả về lỗi 429 chứ không làm mô hình quên chỉ dẫn hoặc bịa tên file.

</details>

### Câu 10 `hard`

Following an unpinned model alias update or a subtle upstream behavior shift, a production extraction pipeline experiences a sudden 15% spike in schema validation errors. Which TWO incident response actions belong in a mature production runbook? (Select TWO)

*(Chọn 2 đáp án)*

- **A.** Execute an immediate automated rollback to the previously verified, pinned model snapshot ID (or prompt/config version) via feature flag without waiting for a full code rebuild.
- **B.** Permanently disable schema validation in the API gateway so that malformed JSON payloads are saved directly into the production database.
- **C.** After stabilizing production, add the failing production trace cases to the regression golden dataset and enforce pinned model snapshots in CI/CD.
- **D.** Switch all production traffic to `temperature: 1.0` to encourage the model to explore alternative JSON schemas.
- **E.** Delete the last 24 hours of OpenTelemetry traces to free up storage before starting the post-mortem review.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Sau một bản cập nhật bí danh mô hình chưa được ghim (unpinned model alias) hoặc một sự dịch chuyển hành vi tinh vi ở upstream, một pipeline trích xuất production gặp sự cố tăng đột biến 15% lỗi xác thực schema. HAI hành động ứng phó sự cố nào thuộc về một sổ tay vận hành (runbook) production trưởng thành? (Chọn HAI đáp án)

**Đáp án đúng:** **A, C**

Incident Response Runbook chuẩn cho sự cố model drift/degradation gồm: (1) Rollback nhanh bằng config/feature flag về pinned model snapshot hoặc fallback an toàn, và (2) Cập nhật golden dataset từ các ca lỗi thực tế sau sự cố.

- **A (Đúng):** Rollback tức thì thông qua feature flag/config về phiên bản model snapshot đã được ghim (pinned) và kiểm chứng trước đó giúp khôi phục SLA nhanh nhất.
- **B:** Tắt kiểm tra schema sẽ làm hỏng tính toàn vẹn dữ liệu (data corruption) trong cơ sở dữ liệu production.
- **C (Đúng):** Sau khi ổn định sự cố, đưa các ca lỗi thực tế vào golden dataset để chống tái diễn (post-mortem eval addition) và bắt buộc ghim (pin) model snapshot ID là quy trình chuẩn.
- **D:** Tăng temperature lên 1.0 sẽ làm tăng thêm tỷ lệ lỗi định dạng schema thay vì khắc phục.
- **E:** Xóa traces sẽ làm mất toàn bộ bằng chứng kỹ thuật phục vụ điều tra nguyên nhân gốc rễ (RCA).

</details>

---

[Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md)
