# Bài tập tình huống — Module 6: Prompt Caching & Cost/Latency Optimization

> Cơ chế cache_control: ephemeral, thứ tự prefix matching (tools -> system -> messages), giới hạn 4 breakpoints, ngưỡng 1024-2048 tokens, TTL 5 phút vs 1 giờ và tối ưu cache hit.
> **Số câu hỏi:** 9 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A developer enables Prompt Caching on a 2,500-token system prompt using `cache_control: {"type": "ephemeral"}`. On the very first API call with this prefix, what happens to the cache and token billing?

- **A.** The prefix is written (`cache_creation_input_tokens`) at a surcharge; matching calls within TTL read it (`cache_read_input_tokens`) at 90% off.
- **B.** The first call reads from the cache immediately and receives a 90% discount.
- **C.** The API rejects the request because caching is only allowed on `user` messages and `tool_result` blocks, not on `system` prompt text strings.
- **D.** The prefix is cached permanently for 30 days with zero write cost.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên bật Prompt Caching trên một system prompt dài 2.500 token bằng `cache_control: {"type": "ephemeral"}`. Trong lần gọi API đầu tiên với tiền tố (prefix) này, điều gì xảy ra với cache và việc tính phí token?

**Đáp án đúng:** **A**

Cơ chế Prompt Caching hoạt động theo 2 bước: lần gọi đầu tiên ghi tiền tố vào cache (`cache_creation_input_tokens`), các lần gọi tiếp theo khớp chính xác tiền tố trong TTL sẽ đọc từ cache (`cache_read_input_tokens`) với chi phí giảm tới 90% và giảm mạnh độ trễ TTFT.

- **A (Đúng):** Lần đầu tiên tạo cache (cache write) có phụ phí nhẹ (mặc định 1.25x cho TTL 5 phút), các lần gọi sau trong thời gian TTL sẽ đọc từ cache (cache hit) với giá chỉ bằng 10% (giảm 90%).
- **B:** Lần gọi đầu tiên là cache miss, hệ thống phải ghi dữ liệu vào cache (`cache_creation_input_tokens`) chứ chưa thể đọc từ cache.
- **C:** Prompt Caching hỗ trợ đầy đủ trên `tools`, `system` và `messages`.
- **D:** Cache mặc định chỉ có TTL 5 phút (hoặc tùy chọn 1 giờ), không lưu vĩnh viễn 30 ngày và có tính phí cache write.

</details>

### Câu 2 `hard`

A developer adds `cache_control: {"type": "ephemeral"}` to a 600-token system prompt, but `usage.cache_creation_input_tokens` and `usage.cache_read_input_tokens` remain `0` on every request. What is the most likely reason?

- **A.** `ephemeral` caching only works when `stream=True` is set.
- **B.** The cached prefix is below the minimum token threshold (1,024 or 2,048/4,096 tokens depending on the Claude model).
- **C.** The `temperature` parameter must be set to `0.0` and `top_p` omitted for Prompt Caching to activate on `system` blocks.
- **D.** Prompt Caching requires using the asynchronous Message Batches API instead of the synchronous Messages API.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên thêm `cache_control: {"type": "ephemeral"}` vào một system prompt dài 600 token, nhưng `usage.cache_creation_input_tokens` và `usage.cache_read_input_tokens` vẫn bằng `0` trên mọi request. Nguyên nhân có khả năng nhất là gì?

**Đáp án đúng:** **B**

Mỗi model Claude có ngưỡng token tối thiểu (minimum cacheable prompt length, thường từ 1,024 đến 4,096 tokens tùy model) để kích hoạt Prompt Caching. Nếu tiền tố chỉ có 600 tokens, cache sẽ không được tạo.

- **A:** Prompt Caching hoạt động bình thường cho cả non-streaming và streaming.
- **B (Đúng):** Prompt Caching yêu cầu tiền tố phải đạt ngưỡng token tối thiểu (ví dụ 1,024 tokens với Sonnet/Opus hoặc 2,048/4,096 tokens với một số phiên bản Haiku/Opus mới). Dưới ngưỡng này, hệ thống sẽ âm thầm bỏ qua việc tạo cache.
- **C:** `temperature` không ảnh hưởng đến việc kích hoạt Prompt Caching.
- **D:** Prompt Caching hoạt động trực tiếp trên Messages API tiêu chuẩn.

</details>

### Câu 3 `hard`

A developer wants to maximize cache hit rates across requests that share a 15,000-token codebase context and 20 tool definitions, while each request includes a dynamic current timestamp and a unique user query. In what order should these elements be placed in the request?

- **A.** Place `cache_control` only on the dynamic timestamp block so all preceding `system` and `tools` blocks are automatically cached by API.
- **B.** Dynamic timestamp -> User query -> Tool definitions -> 15,000-token codebase context
- **C.** Tool definitions -> System prompt & 15,000-token codebase context (with `cache_control` breakpoint) -> Dynamic timestamp & User query
- **D.** 15,000-token codebase context -> Dynamic timestamp -> Tool definitions -> User query

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên muốn tối đa hóa tỷ lệ cache hit trên các request dùng chung một ngữ cảnh codebase 15.000 token và 20 định nghĩa tool, trong khi mỗi request bao gồm một timestamp hiện tại thay đổi động và một truy vấn riêng của người dùng. Các thành phần này nên được đặt theo thứ tự nào trong request?

**Đáp án đúng:** **C**

Nguyên tắc vàng của Prompt Caching là **Prefix Stability**: đặt toàn bộ thành phần tĩnh (`tools`, `system`, tài liệu tham khảo) ở đầu với `cache_control` breakpoint, và đặt mọi thông tin động (timestamp, UUID, câu hỏi của user) ở phía sau breakpoint.

- **A:** Đặt `cache_control` lên phần thay đổi liên tục sẽ khiến cache miss liên tục.
- **B:** Đặt timestamp động ở đầu sẽ phá vỡ hoàn toàn cache prefix ở mọi request (cache miss 100%).
- **C (Đúng):** Prompt Caching khớp tiền tố từ đầu đến cuối theo thứ tự `tools` -> `system` -> `messages`. Đặt phần tĩnh (tools, system, codebase) lên trước với `cache_control` và đẩy phần động (timestamp, user query) xuống cuối sẽ đạt cache hit tối đa.
- **D:** Trong Messages API, `tools` luôn được đánh giá ở đầu tiền tố trước `system` và `messages`, và đặt timestamp xen giữa sẽ làm gãy cache cho phần sau.

</details>

### Câu 4 `medium`

An application sends bursts of requests that share a large cached document every 25 minutes, which causes the default 5-minute Prompt Cache to expire between bursts. What option does Anthropic provide to keep the cache warm across 25-minute gaps?

- **A.** Set `cache_control: {"type": "permanent"}` on the cached document block.
- **B.** Pass `keep_alive: true` and `cache_ttl_seconds: 1500` at the top level of `messages.create`.
- **C.** Use `max_tokens: 1` on a dummy background prompt every 4 minutes without setting `cache_control`.
- **D.** Specify `ttl: "1h"` inside `cache_control` (e.g., `{"type": "ephemeral", "ttl": "1h"}`) to use the 1-hour extended cache TTL.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng gửi các đợt request dùng chung một tài liệu lớn được cache cứ mỗi 25 phút một lần, khiến Prompt Cache mặc định 5 phút bị hết hạn giữa các đợt. Anthropic cung cấp tùy chọn nào để giữ cache luôn ấm (warm) qua các khoảng nghỉ 25 phút?

**Đáp án đúng:** **D**

Mặc định `cache_control: {"type": "ephemeral"}` có TTL 5 phút (tự gia hạn mỗi lần cache hit). Với các workload có khoảng nghỉ dài hơn 5 phút nhưng dưới 1 giờ, cấu hình `"ttl": "1h"` giúp duy trì cache hit ổn định.

- **A:** Không có loại `cache_control` nào là `permanent`; chỉ hỗ trợ `type: "ephemeral"`.
- **B:** Messages API không có tham số `keep_alive` để kéo dài TTL của cache.
- **C:** Gửi request không có `cache_control` sẽ không làm mới (refresh) TTL của cache.
- **D (Đúng):** Anthropic hỗ trợ tùy chọn `ttl: "1h"` trong `cache_control` (phí cache write cao hơn một chút so với TTL 5 phút mặc định) để giữ cache sống trong 1 giờ, rất phù hợp cho lưu lượng thưa 15-45 phút/lần.

</details>

### Câu 5 `hard`

A team notices that their Prompt Caching hit rate is unexpectedly low (< 10%) despite setting `cache_control: {"type": "ephemeral"}` on their `system` prompt. Which TWO factors can silently invalidate or prevent cache hits? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Using `stream=True` on some requests and `stream=False` on others
- **B.** Changing `max_tokens` from 1024 to 2048 between requests
- **C.** Dynamically shuffling or filtering the `tools` array per request when `tools` appear before the cached `system` prompt
- **D.** Changing the `user` message content that appears after the `cache_control` breakpoint in the request
- **E.** Inserting a per-request UUID or current `datetime.now()` timestamp inside the `system` prompt before the `cache_control` breakpoint

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm nhận thấy tỷ lệ hit của Prompt Caching thấp bất thường (< 10%) mặc dù đã đặt `cache_control: {"type": "ephemeral"}` trên `system` prompt của họ. HAI yếu tố nào có thể âm thầm làm vô hiệu hóa hoặc ngăn chặn cache hit? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Prompt Caching yêu cầu tiền tố từ đầu (`tools` -> `system` -> các `messages` trước breakpoint) phải giống nhau từng byte (exact prefix match). Mọi dữ liệu động như timestamp, UUID hoặc danh sách `tools` bị xáo trộn trước breakpoint đều gây cache miss.

- **A:** Cờ `stream` không làm mất hiệu lực của Prompt Cache.
- **B:** `max_tokens` không nằm trong tiền tố prompt nên không làm mất cache hit.
- **C (Đúng):** Trong thứ tự đánh giá tiền tố (`tools` -> `system` -> `messages`), nếu `tools` thay đổi thứ tự hoặc nội dung giữa các request thì toàn bộ cache phía sau (`system`) cũng bị miss.
- **D:** Nội dung nằm SAU `cache_control` breakpoint hoàn toàn có thể thay đổi ở mỗi request mà không làm mất cache hit của tiền tố phía trước.
- **E (Đúng):** Bất kỳ thay đổi dù chỉ 1 ký tự nào nằm trước breakpoint đều làm thay đổi hash tiền tố và gây cache miss.

</details>

### Câu 6 `medium`

A developer is caching a 3,000-token system prompt, 10 tool definitions, and a 20,000-token reference manual that rarely changes, while also wanting to cache the growing multi-turn conversation history across turns. How many `cache_control` breakpoints can be placed in a single Messages API request?

- **A.** Up to 4 `cache_control` breakpoints per request
- **B.** Unlimited `cache_control` breakpoints on every single word
- **C.** Exactly 1 `cache_control` breakpoint per request
- **D.** Breakpoints are only allowed in `system`, never in `messages`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên đang cache một system prompt 3.000 token, 10 định nghĩa tool và một tài liệu hướng dẫn tham khảo 20.000 token hiếm khi thay đổi, đồng thời cũng muốn cache lịch sử hội thoại nhiều lượt đang tăng dần qua các lượt. Có thể đặt tối đa bao nhiêu breakpoint `cache_control` trong một request Messages API duy nhất?

**Đáp án đúng:** **A**

Messages API cho phép tối đa **4 `cache_control` breakpoints** trong một request, rất hữu ích cho hội thoại dài hoặc agentic loop: giữ nguyên breakpoint cho phần tĩnh (`tools`/`system`) và trượt (slide) 1 breakpoint theo lịch sử hội thoại mới nhất.

- **A (Đúng):** Anthropic Prompt Caching cho phép đặt tối đa 4 `cache_control` breakpoint trong một request (ví dụ: 1 ở cuối `tools`, 1 ở cuối `system`, 1 ở tài liệu nền, và 1 ở lượt hội thoại gần nhất).
- **B:** Giới hạn tối đa là 4 breakpoint mỗi request.
- **C:** Bạn được phép dùng nhiều hơn 1 breakpoint (tối đa 4) để cache theo từng tầng thay đổi khác nhau.
- **D:** `cache_control` có thể đặt ở `tools`, `system` và `messages`.

</details>

### Câu 7 `hard`

A developer places `cache_control: {"type": "ephemeral"}` on a `system` block of 3,000 tokens. Later, they modify a single tool description in the `tools` array of the same request. What happens on the next request?

- **A.** The `system` block still hits the cache because `tools` are evaluated after `system` in the Anthropic prompt prefix.
- **B.** Both the `tools` prefix and the `system` block experience a cache miss and must be rewritten to the cache.
- **C.** The API ignores the updated tool description and serves the old cached tool.
- **D.** Anthropic returns an HTTP 409 Conflict error due to stale cache state.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên đặt `cache_control: {"type": "ephemeral"}` trên một khối `system` dài 3.000 token. Sau đó, họ sửa đổi một mô tả tool duy nhất trong mảng `tools` của cùng request đó. Điều gì xảy ra ở request tiếp theo?

**Đáp án đúng:** **B**

Thứ tự phân cấp tiền tố của Prompt Caching là **`tools` -> `system` -> `messages`**. Nếu thành phần ở tầng trước (`tools`) thay đổi, toàn bộ cache của các tầng sau (`system`, `messages`) đều bị vô hiệu hóa.

- **A:** `tools` được đặt ở đầu tiền tố trước `system`, không phải sau `system`.
- **B (Đúng):** Vì thứ tự tiền tố là `tools` -> `system` -> `messages`, bất kỳ sửa đổi nào trong `tools` đều làm thay đổi tiền tố đứng trước `system`, khiến cả `system` cũng bị cache miss.
- **C:** Prompt Caching không bao giờ trả về định nghĩa cũ khi đầu vào thay đổi; nó sẽ tính lại cache mới.
- **D:** Không có lỗi 409; request vẫn chạy bình thường nhưng với trạng thái cache write mới.

</details>

### Câu 8 `medium`

When using Prompt Caching with the default 5-minute TTL, how is the cache expiration timer managed as requests continue to arrive?

- **A.** The cache TTL only refreshes on cache misses rather than on cache hits.
- **B.** The cache expires strictly 5 minutes after creation regardless of traffic.
- **C.** Each cache hit refreshes the 5-minute TTL from the time of that hit.
- **D.** Every cache hit automatically extends the cache TTL by 24 hours.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Khi sử dụng Prompt Caching với thời gian sống mặc định TTL 5 phút, bộ đếm thời gian hết hạn của cache được quản lý như thế nào khi các request tiếp tục gửi đến?

**Đáp án đúng:** **C**

Prompt Cache mặc định có TTL 5 phút được tự động gia hạn mỗi lần cache hit. Nếu lưu lượng đều đặn dưới 5 phút/request, cache có thể giữ ấm liên tục mà không cần trả phí `cache_creation` lại.

- **A:** Cache hit mới làm mới TTL của mục cache hiện có; cache miss sẽ tạo mục cache mới.
- **B:** Cache không hết hạn cứng sau 5 phút nếu vẫn có request hit liên tục.
- **C (Đúng):** TTL của Prompt Caching được làm mới (sliding expiration) mỗi khi có cache hit, miễn là khoảng cách giữa các request không vượt quá 5 phút.
- **D:** Mỗi cache hit chỉ làm mới lại đúng khoảng TTL cấu hình (5 phút hoặc 1 giờ).

</details>

### Câu 9 `hard`

An architect is designing a cost-effective enterprise Q&A system over a 50,000-token company handbook that receives 2,000 queries per hour. Which TWO optimizations yield the largest combined cost and latency savings? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Randomize the paragraph order of the 50,000-token handbook on every request.
- **B.** Prepend the current timestamp in milliseconds to the start of the `system` prompt.
- **C.** Place the 50,000-token handbook in the `system` (or initial `user`) prefix with `cache_control: {"type": "ephemeral"}` before each user's question.
- **D.** Route straightforward factual lookups to Claude Haiku or Sonnet instead of defaulting every query to Claude Opus.
- **E.** Force `budget_tokens: 20000` Extended Thinking on every single question.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiến trúc sư đang thiết kế hệ thống hỏi đáp (Q&A) doanh nghiệp tiết kiệm chi phí trên một cuốn sổ tay công ty dài 50.000 token nhận 2.000 truy vấn mỗi giờ. HAI tối ưu hóa nào mang lại mức tiết kiệm kết hợp lớn nhất về cả chi phí và độ trễ? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, D**

Kết hợp **Prompt Caching** cho tài liệu nền ổn định với **Model Selection/Routing** hợp lý (Haiku/Sonnet) là công thức chuẩn để tối ưu cả chi phí lẫn độ trễ cho hệ thống Q&A lưu lượng cao.

- **A:** Xáo trộn nội dung tài liệu sẽ phá vỡ tiền tố và làm hỏng hoàn toàn Prompt Caching.
- **B:** Đặt timestamp động ở đầu `system` prompt gây cache miss 100%.
- **C (Đúng):** Với 2,000 query/giờ (~33 query/phút), Prompt Caching 5 phút sẽ đạt cache hit gần như 100% cho 50,000 tokens tài liệu, giảm 90% chi phí input và tăng tốc TTFT.
- **D (Đúng):** Chọn tier model phù hợp (Haiku/Sonnet) thay vì mặc định Opus cho mọi câu hỏi giúp giảm chi phí gấp nhiều lần mà vẫn đảm bảo chất lượng.
- **E:** Bật Extended Thinking 20k tokens cho mọi câu hỏi tra cứu sẽ làm tăng vọt chi phí và độ trễ.

</details>

---

[Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md)
