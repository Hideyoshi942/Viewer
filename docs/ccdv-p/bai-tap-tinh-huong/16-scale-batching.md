# Bài tập tình huống — Chủ đề 16: Message Batches API, Context Compaction & TPM/Rate-Limit Shaping

> Tận dụng Message Batches API giảm 50% chi phí cho workload bất đồng bộ, nén ngữ cảnh (compaction) và điều tiết lưu lượng theo TPM/RPM.
> **Số câu hỏi:** 8 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A document-intelligence platform processes 100,000 archived legal contracts overnight to extract structured metadata. The results are not needed until the next morning, and the team wants to cut inference costs by 50% while avoiding daytime rate-limit contention. Which Anthropic API feature should they use?

- **A.** Send 100,000 parallel synchronous `messages.create` calls from an async loop with `stream: true` and aggressive retries.
- **B.** Rotate overnight API calls across 50 personal developer accounts to distribute the legal contract extraction workload.
- **C.** Increase `max_tokens` to 64,000 on every extraction request to qualify for an automatic enterprise bulk-token pricing tier rebate.
- **D.** Submit the workload using the Message Batches API, which processes asynchronous batches within 24 hours at a 50% cost discount.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng thông minh tài liệu xử lý 100.000 hợp đồng pháp lý lưu trữ qua đêm để trích xuất metadata có cấu trúc. Kết quả chưa cần cho đến sáng hôm sau, và nhóm muốn giảm 50% chi phí suy luận đồng thời tránh tranh chấp rate-limit vào ban ngày. Họ nên sử dụng tính năng nào của Anthropic API?

**Đáp án đúng:** **D**

Message Batches API là lựa chọn tối ưu cho các workload offline/async không cần phản hồi tức thì (SLA 24h), giúp tiết kiệm 50% chi phí và tách tải khỏi quota real-time.

- **A:** Gửi 100,000 request đồng bộ song song sẽ đụng giới hạn rate limit (429) ngay lập tức và chịu giá tiêu chuẩn 100%.
- **B:** Vi phạm điều khoản dịch vụ và không phải kiến trúc vận hành doanh nghiệp hợp lệ.
- **C:** Tăng `max_tokens` không mang lại giảm giá mà còn có thể làm tăng chi phí nếu model sinh dài hơn.
- **D (Đúng):** Message Batches API thiết kế riêng cho tác vụ bất đồng bộ khối lượng lớn (như xử lý qua đêm), giảm 50% chi phí token và không tranh chấp rate limit thời gian thực.

</details>

### Câu 2 `medium`

An enterprise AI router currently sends 100% of incoming traffic—from simple intent classification and language detection to complex multi-file architecture refactoring—to Claude Opus. Monthly costs are unsustainable and simple queries feel slow. Which routing strategy solves both issues?

- **A.** Implement tiered model routing: classify request complexity first and route simple tasks to Claude Haiku, standard tasks to Sonnet, and only deep reasoning to Opus.
- **B.** Route 100% of all production requests to Claude Haiku including complex multi-file architecture refactoring without fallback.
- **C.** Fan out every incoming request to Haiku, Sonnet, and Opus simultaneously in parallel and return whichever response finishes first.
- **D.** Keep 100% of traffic on Claude Opus and cap `max_tokens` at 20 tokens across all queries to force shorter answers.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một bộ định tuyến AI doanh nghiệp hiện gửi 100% lưu lượng truy cập đến—từ phân loại ý định đơn giản và phát hiện ngôn ngữ cho đến refactor kiến trúc đa tệp phức tạp—tới Claude Opus. Chi phí hàng tháng không bền vững và các truy vấn đơn giản có cảm giác chậm. Chiến lược định tuyến (routing strategy) nào giải quyết cả hai vấn đề?

**Đáp án đúng:** **A**

Tiered / Semantic Model Routing (Haiku -> Sonnet -> Opus, hoặc cascading fallback khi confidence thấp) là đòn bẩy mạnh nhất để giảm 60-80% chi phí và hạ mạnh TTFT cho đại đa số traffic đơn giản.

- **A (Đúng):** Tiered model routing dùng bộ phân loại nhanh để điều phối tác vụ đơn giản sang Haiku (rẻ, siêu nhanh), tác vụ phổ thông sang Sonnet và chỉ dành Opus cho suy luận phức tạp, tối ưu cả chi phí lẫn độ trễ.
- **B:** Đẩy toàn bộ tác vụ phức tạp sang Haiku sẽ làm suy giảm chất lượng kiến trúc và độ chính xác.
- **C:** Gọi cả 3 model song song làm tăng chi phí lên gấp bội thay vì tiết kiệm.
- **D:** Giới hạn 20 output token làm cắt cụt các câu trả lời hợp lệ mà vẫn tốn chi phí input cao của Opus.

</details>

### Câu 3 `hard`

A multi-tenant AI gateway shares an Anthropic organization quota of 400,000 input tokens per minute (ITPM). One tenant starts a bulk backfill job that saturates the entire ITPM quota, starving interactive chat users of other tenants with 429 errors. How should the gateway protect interactive traffic?

- **A.** Omit `max_tokens` from all outgoing API requests so Anthropic's gateway stops counting input tokens per minute against the org.
- **B.** Disable all automatic retries on interactive chat users so they fail fast while the bulk backfill job keeps consuming quota.
- **C.** Implement token-bucket rate-limit shaping per tenant and priority queues that reserve ITPM capacity for interactive traffic over background jobs.
- **D.** Merge all enterprise tenants into a single shared queue with strict FIFO ordering and zero per-tenant ITPM token rate-limit quotas enforced.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một AI gateway đa người thuê dùng chung hạn mức tổ chức Anthropic là 400.000 input token mỗi phút (ITPM). Một tenant bắt đầu một job backfill hàng loạt làm bão hòa toàn bộ hạn mức ITPM, khiến người dùng chat tương tác của các tenant khác bị lỗi 429. Gateway nên bảo vệ lưu lượng tương tác như thế nào?

**Đáp án đúng:** **C**

Để chống vấn đề 'noisy neighbor' trên quota TPM/RPM dùng chung, LLM Gateway cần per-tenant token-bucket shaping và priority queues (ưu tiên interactive latency-sensitive traffic trước batch/background).

- **A:** `max_tokens` là tham số bắt buộc và không làm tắt cơ chế đếm ITPM của API.
- **B:** Làm người dùng tương tác lỗi ngay lập tức đi ngược lại mục tiêu bảo vệ trải nghiệm interactive.
- **C (Đúng):** Áp dụng token-bucket rate limiting theo từng `tenant_id` kết hợp hàng đợi ưu tiên (priority queuing) giúp bảo vệ băng thông ITPM cho người dùng tương tác và điều tiết job chạy nền.
- **D:** Hàng đợi FIFO không quota cho phép một tenant chiếm dụng toàn bộ băng thông (noisy neighbor problem).

</details>

### Câu 4 `medium`

A coding assistant session runs for 40 turns, accumulating 140,000 input tokens of past file reads and terminal logs. Each new turn now costs over $0.40 and takes 9 seconds TTFT. How can the team drastically cut per-turn cost and latency without losing essential task state?

- **A.** Switch from SSE streaming to HTTP polling every 10 seconds to mask the 9-second Time To First Token latency.
- **B.** Clear the entire `messages` array to empty after every single turn regardless of ongoing coding task progress.
- **C.** Send the 140,000 input tokens twice in every request to force the inference cluster to warm up its memory bandwidth.
- **D.** Trigger conversation compaction when context crosses a token threshold: summarize older turns, prune stale tool outputs, and preserve key decisions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một phiên làm việc của trợ lý lập trình kéo dài 40 lượt, tích lũy 140.000 input token từ các lần đọc tệp và log terminal trước đó. Mỗi lượt mới hiện tiêu tốn hơn 0,40 USD và mất 9 giây TTFT. Nhóm có thể giảm mạnh chi phí và độ trễ mỗi lượt mà không làm mất trạng thái tác vụ thiết yếu bằng cách nào?

**Đáp án đúng:** **D**

Context Compaction (nén ngữ cảnh định kỳ kết hợp cắt tỉa tool output cũ) vừa giải quyết bài toán chi phí/TTFT của hội thoại dài vừa chống context rot.

- **A:** Polling mỗi 10 giây làm độ trễ cảm nhận của người dùng còn tệ hơn và không giảm chi phí token.
- **B:** Xóa sạch lịch sử mỗi lượt khiến agent mất toàn bộ trí nhớ công việc đang làm.
- **C:** Nhân đôi token chỉ làm tăng gấp đôi chi phí và độ trễ prefill.
- **D (Đúng):** Conversation compaction (tóm tắt lịch sử cũ, loại bỏ tool output lỗi thời và giữ lại các quyết định/trạng thái cốt lõi) khi vượt ngưỡng token giúp cắt giảm mạnh chi phí và TTFT ở các lượt sau.

</details>

### Câu 5 `hard`

An enterprise support platform processes 2 million requests daily: 65% are simple intent classification and FAQ lookups, 28% are multi-step troubleshooting, and 7% are complex cross-system root-cause investigations. Currently, 100% of traffic goes directly to Claude Opus, blowing the monthly budget and causing high P95 latency. Which routing architecture optimizes cost and latency without sacrificing accuracy?

- **A.** Route 100% of incoming support requests to Claude Haiku and never escalate to larger models, accepting lower resolution accuracy on complex cross-system root-cause investigations.
- **B.** Use tiered routing (Haiku for FAQ, Sonnet for troubleshooting, Opus for complex cases) with confidence-based escalation.
- **C.** Round-robin distribute requests equally across Haiku, Sonnet, and Opus (33% each) regardless of query complexity.
- **D.** Keep 100% of traffic on Claude Opus and reduce `max_tokens` to 50 for every request to force lower monthly billing.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng hỗ trợ doanh nghiệp xử lý 2 triệu request mỗi ngày: 65% là phân loại ý định đơn giản và tra cứu FAQ, 28% là khắc phục sự cố nhiều bước và 7% là điều tra nguyên nhân gốc rễ phức tạp xuyên hệ thống. Hiện tại, 100% lưu lượng đi thẳng tới Claude Opus, làm vỡ ngân sách hàng tháng và gây độ trễ P95 cao. Kiến trúc định tuyến nào tối ưu hóa chi phí và độ trễ mà không hy sinh độ chính xác?

**Đáp án đúng:** **B**

Tiered/Semantic Model Routing (Haiku cho tác vụ nhẹ/phân loại, Sonnet cho cân bằng hiệu năng-chi phí, Opus cho suy luận phức tạp) kèm confidence-based escalation là đòn bẩy tối ưu chi phí và độ trễ mạnh mẽ nhất ở quy mô lớn.

- **A:** Dùng Haiku cho cả 7% ca điều tra phức tạp sẽ làm giảm mạnh chất lượng xử lý các sự cố nghiêm trọng.
- **B (Đúng):** Tiered Model Routing phân luồng theo độ phức tạp (Haiku -> Sonnet -> Opus) kết hợp cơ chế escalation khi tier thấp trả về độ tin cậy thấp giúp giảm mạnh chi phí và độ trễ trên 93% traffic phổ thông mà vẫn giữ chất lượng đỉnh cao cho 7% ca phức tạp.
- **C:** Chia đều round-robin khiến câu hỏi đơn giản vẫn tốn tiền Opus và câu hỏi cực khó có nguy cơ rơi vào Haiku.
- **D:** Cắt `max_tokens` xuống 50 sẽ làm đứt cụt câu trả lời và không giảm được chi phí input tokens đắt đỏ của Opus.

</details>

### Câu 6 `medium`

A media company runs a nightly pipeline that classifies, summarizes, and extracts metadata from 150,000 newly ingested articles every night, with a relaxed 12-hour SLA before morning publication. Currently, the team calls the synchronous Messages API with concurrent worker pools, frequently hitting TPM rate limits and paying full token rates. Which Anthropic API feature should they adopt?

- **A.** Switch all 150,000 calls to SSE streaming mode (`stream: true`) to bypass Anthropic's token-per-minute quotas.
- **B.** Concatenate 500 unrelated articles into a single 190,000-token synchronous Messages API request to minimize HTTP overhead and bypass per-request concurrency caps.
- **C.** Migrate nightly jobs to the Message Batches API for a 50% token discount and async throughput separate from real-time limits.
- **D.** Duplicate the workload across 10 different free-tier API keys and rotate keys on every `429` error.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty truyền thông chạy một pipeline hàng đêm để phân loại, tóm tắt và trích xuất metadata từ 150.000 bài báo mới nạp mỗi đêm, với SLA thoải mái 12 giờ trước khi xuất bản buổi sáng. Hiện tại, nhóm gọi Messages API đồng bộ với các pool worker đồng thời, thường xuyên chạm giới hạn tốc độ TPM và phải trả giá token đầy đủ. Họ nên áp dụng tính năng nào của Anthropic API?

**Đáp án đúng:** **C**

Với các workload offline/async không cần phản hồi tức thì (nightly enrichment, bulk classification, large-scale evals), Anthropic Message Batches API mang lại mức giảm 50% chi phí và xử lý quy mô lớn hiệu quả.

- **A:** Chế độ streaming không miễn trừ rate limit TPM và không giảm giá token.
- **B:** Gộp 500 bài báo vào một prompt duy nhất gây context rot nghiêm trọng, dễ chạm trần output `max_tokens` và khó khôi phục nếu một phần bị lỗi.
- **C (Đúng):** Message Batches API được thiết kế riêng cho các tác vụ bất đồng bộ (SLA trong vòng 24h) như xử lý dữ liệu hàng đêm hay chạy evals, giúp giảm ngay 50% chi phí token và tách biệt khỏi giới hạn rate limit của traffic real-time.
- **D:** Tạo nhiều tài khoản/API key để lách rate limit vi phạm điều khoản dịch vụ (ToS) và không giảm được 50% chi phí.

</details>

### Câu 7 `hard`

A multi-turn browser automation agent inspects web pages via DOM snapshots and executes 20+ actions per user task. Because each raw DOM snapshot is ~15,000 tokens, the cumulative input token count grows quadratically across turns, tripling per-task cost and pushing latency past SLOs. Which token-budgeting technique best curbs this growth?

- **A.** Apply rolling context compaction and prune old raw DOM snapshots into short summaries, keeping only the latest DOM state.
- **B.** Keep every raw 15,000-token DOM snapshot in the message history indefinitely and lower `max_tokens` to 100 on every turn to control total API spend.
- **C.** Increase `temperature` to 0.8 so the agent finishes the 20-step browser workflow in fewer turns by guessing CSS selectors.
- **D.** Disable tool calling after turn 3 and ask Claude to imagine the remaining 17 web page states from memory.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một agent tự động hóa trình duyệt nhiều lượt kiểm tra các trang web thông qua ảnh chụp DOM và thực thi hơn 20 hành động cho mỗi tác vụ người dùng. Vì mỗi ảnh chụp DOM thô dài khoảng ~15.000 token, số lượng input token tích lũy tăng theo cấp số nhân (bậc hai) qua các lượt, làm tăng gấp ba chi phí mỗi tác vụ và đẩy độ trễ vượt quá SLO. Kỹ thuật quản lý ngân sách token nào kiềm chế tốt nhất sự tăng trưởng này?

**Đáp án đúng:** **A**

Trong các agent có tool output kích thước lớn (DOM, log, file lớn), giữ nguyên toàn bộ lịch sử gây bùng nổ chi phí bậc hai (O(N^2)). Context Compaction và selective pruning các tool outputs cũ là giải pháp chuẩn.

- **A (Đúng):** Nén ngữ cảnh theo cửa sổ trượt (rolling context compaction) và cắt tỉa tool output cũ (thay các DOM snapshot cũ 15,000 tokens bằng bản tóm tắt kết quả ngắn gọn, chỉ giữ DOM mới nhất) giúp chi phí token tăng tuyến tính thay vì bậc hai và giảm mạnh độ trễ.
- **B:** Hạ `max_tokens` chỉ cắt ngắn câu trả lời của agent, hoàn toàn không giải quyết chi phí input tokens khổng lồ tăng theo cấp số cộng qua 20 lượt.
- **C:** Đoán CSS selector làm agent bấm sai nhiều hơn, dẫn đến nhiều lượt retry và tốn nhiều token hơn.
- **D:** Tắt tool calling khiến agent không thể tương tác với trình duyệt thực tế ở các bước tiếp theo.

</details>

### Câu 8 `hard`

A high-volume B2B SaaS application experiences periodic `429 rate_limit_error` bursts during morning login peaks due to strict Input Tokens Per Minute (ITPM) and Output Tokens Per Minute (OTPM) limits. Which TWO traffic-shaping strategies effectively smooth bursty load and maximize effective throughput? (Select TWO)

*(Chọn 2 đáp án)*

- **A.** Use a token-bucket limiter and priority queue reading `anthropic-ratelimit-*` headers to pace background jobs behind interactive traffic.
- **B.** Send every request simultaneously with `max_tokens: 128000` even when only a 200-token summary is expected, to reserve maximum server capacity upfront.
- **C.** Coalesce duplicate concurrent requests via caching and route overflow bursts to multi-region Bedrock or Vertex AI endpoints.
- **D.** Retry `429` errors in a tight `while(true)` loop with zero sleep delay so each worker captures the next available capacity slot immediately before competing tenants.
- **E.** Remove all `system` prompts and `tools` definitions during peak hours to stay under the Request Per Minute (RPM) cap.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng SaaS B2B lưu lượng cao gặp phải các đợt lỗi `429 rate_limit_error` định kỳ trong giờ cao điểm đăng nhập buổi sáng do giới hạn nghiêm ngặt về Input Tokens Per Minute (ITPM) và Output Tokens Per Minute (OTPM). HAI chiến lược điều phối lưu lượng (traffic-shaping) nào làm mượt hiệu quả tải đột biến và tối đa hóa thông lượng thực tế? (Chọn HAI đáp án)

**Đáp án đúng:** **A, C**

Tối ưu hóa Rate-Limit & TPM Shaping ở quy mô lớn dựa trên: (1) Client/Gateway token-bucket rate limiting đọc `anthropic-ratelimit-*` headers kèm priority queue, (2) Đặt `max_tokens` sát thực tế, và (3) Request coalescing/caching kết hợp multi-region/multi-provider quota distribution.

- **A (Đúng):** Bộ điều phối token-bucket kết hợp priority queue dựa trên các header `anthropic-ratelimit-*` giúp chủ động điều tiết tải (traffic shaping), ưu tiên traffic tương tác real-time và tránh dội request gây lỗi 429.
- **B:** Đặt `max_tokens` quá cao không cần thiết khiến bộ đếm OTPM ước tính trước bị tiêu tốn nhanh hơn và dễ chạm rate limit sớm hơn.
- **C (Đúng):** Gộp/cache các request trùng lặp (request coalescing) giảm lượng token tiêu thụ thực tế, và phân tải tràn (overflow routing) sang các endpoint/region khác trên Bedrock hoặc Vertex AI giúp mở rộng trần quota tổng thể.
- **D:** Retry liên tục không delay (tight loop) sẽ làm cạn kiệt RPM limit và gây tự tấn công DoS vào chính ứng dụng.
- **E:** RPM đếm số lượng HTTP requests chứ không phụ thuộc vào độ dài system prompt hay tools; bỏ system prompt/tools sẽ làm hỏng tính năng ứng dụng.

</details>

---

[Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md)
