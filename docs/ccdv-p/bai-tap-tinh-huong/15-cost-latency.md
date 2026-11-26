# Bài tập tình huống — Chủ đề 15: Prompt Cache Hit Ratio Optimization & Tiered Model Routing

> Tối ưu thứ tự prefix bất biến để tăng Prompt Cache Hit Ratio và định tuyến thông minh giữa Haiku, Sonnet, Opus theo độ phức tạp tác vụ.
> **Số câu hỏi:** 3 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A team places `cache_control: {"type": "ephemeral"}` at the end of a 15,000-token system prompt, but prepends `Current UTC timestamp: 2026-11-22T10:15:03Z` on line 1 of the system prompt on every request. Cache hit rate is 0%. Why?

- **A.** Anthropic's Prompt Cache enforces a strict maximum limit of 1,000 tokens, so a 15,000-token system prompt cannot be cached in full across turns.
- **B.** Prompt Caching only activates when `temperature` is set to 1.0 and SSE `stream` mode is completely disabled on the request.
- **C.** Prompt Caching requires an exact byte-for-byte prefix match; a dynamic timestamp at the start invalidates the entire prefix on every request.
- **D.** The `ephemeral` cache breakpoint type only caches assistant output tokens and never caches static system prompt instructions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm đặt `cache_control: {"type": "ephemeral"}` ở cuối một system prompt dài 15.000 token, nhưng lại chèn `Current UTC timestamp: 2026-11-22T10:15:03Z` ở dòng 1 của system prompt trong mọi request. Tỷ lệ cache hit là 0%. Tại sao?

**Đáp án đúng:** **C**

Để đạt cache hit ratio cao, mọi thành phần tĩnh (tools, system instructions, tài liệu tham chiếu lớn) phải đặt ở đầu prefix, còn dữ liệu động (timestamp, user query, session state) phải đặt ở cuối sau điểm `cache_control`.

- **A:** Ngược lại, Prompt Caching yêu cầu ngưỡng tối thiểu (1,024 hoặc 2,048 token tùy model) chứ không giới hạn tối đa 1,000 token.
- **B:** Prompt Caching không yêu cầu `temperature: 1.0` hay tắt streaming.
- **C (Đúng):** Prompt Caching hoạt động theo khớp tiền tố chính xác (exact prefix matching từ đầu: `tools` -> `system` -> `messages`). Đặt timestamp thay đổi từng giây ở dòng 1 làm hỏng toàn bộ tiền tố phía sau.
- **D:** Prompt Caching lưu đệm tiền tố đầu vào (tools, system, messages), không phải output tokens.

</details>

### Câu 2 `hard`

A high-volume SaaS product wants to maximize Prompt Cache hit rates and minimize overall inference spend on Claude. Which THREE practices directly improve cache efficiency and cost?

*(Chọn 3 đáp án)*

- **A.** Order prompt blocks from most static to most dynamic: `tools`, then static `system` instructions/context, then dynamic `messages`.
- **B.** Place `cache_control` breakpoints at stable boundaries and avoid injecting per-request timestamps or random IDs before those breakpoints.
- **C.** Route requests with sticky session affinity or consistent prefixes and use extended TTLs (e.g., 1-hour cache) when traffic gaps exceed 5 minutes.
- **D.** Randomly shuffle the order of tool definitions in the `tools` array on every API call to prevent model overfitting.
- **E.** Pad every user prompt with 5,000 random whitespace tokens so it always exceeds the minimum cacheable token threshold.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một sản phẩm SaaS lưu lượng cao muốn tối đa hóa tỷ lệ hit của Prompt Cache và giảm thiểu tổng chi phí suy luận trên Claude. BA thực hành nào trực tiếp cải thiện hiệu quả cache và chi phí?

**Đáp án đúng:** **A, B, C**

Tối ưu Prompt Caching ở quy mô lớn đòi hỏi: (1) Thứ tự tĩnh -> động (`tools` -> `system` -> `messages`), (2) Không đặt biến động (timestamp, random order) trước `cache_control`, và (3) Chọn TTL/routing phù hợp với tần suất traffic.

- **A (Đúng):** Sắp xếp từ tĩnh đến động (`tools` -> `system` -> `messages`) đảm bảo tiền tố đầu luôn ổn định để trúng cache tối đa.
- **B (Đúng):** Đặt breakpoint `cache_control` tại ranh giới ổn định và không chèn dữ liệu động (timestamp/UUID) phía trước giúp tránh cache miss.
- **C (Đúng):** Giữ ổn định prefix theo phiên và chọn TTL phù hợp (như 1-hour cache khi khoảng cách giữa các request vượt quá 5 phút) giúp duy trì cache hit rate cao.
- **D:** Xáo trộn thứ tự `tools` làm thay đổi byte tiền tố và phá hủy hoàn toàn Prompt Cache.
- **E:** Độn khoảng trắng ngẫu nhiên vừa tốn tiền vô ích vừa làm nhiễu mô hình.

</details>

### Câu 3 `hard`

A customer analytics assistant sends a 12,000-token tool definition list, a 4,000-token system prompt, an 8,000-token static company policy handbook, and a 200-token dynamic user question on every API call. Currently, the team places the user question inside the system prompt before the policy handbook, resulting in a 0% prompt cache hit rate. How should the request be structured to maximize Anthropic Prompt Caching savings?

- **A.** Place the 200-token dynamic user question at the very beginning of the `tools` array and omit `cache_control` markers so the Anthropic API automatically infers prefix boundaries.
- **B.** Set `cache_control: {"type": "ephemeral"}` on the dynamic user question block only, while leaving tools and system prompts uncached.
- **C.** Compress the 8,000-token policy handbook by removing all punctuation and spaces so the entire prompt falls under 1,024 tokens and bypasses caching.
- **D.** Order the prefix from static to dynamic (`tools` -> `system` -> handbook -> user message) with `cache_control` at the static boundary.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một trợ lý phân tích khách hàng gửi một danh sách định nghĩa tool 12.000 token, một system prompt 4.000 token, một sổ tay chính sách công ty tĩnh 8.000 token và một câu hỏi động của người dùng 200 token trong mỗi lệnh gọi API. Hiện tại, nhóm đặt câu hỏi người dùng bên trong system prompt trước sổ tay chính sách, dẫn đến tỷ lệ hit prompt cache bằng 0%. Request nên được cấu trúc như thế nào để tối đa hóa khoản tiết kiệm từ Anthropic Prompt Caching?

**Đáp án đúng:** **D**

Quy tắc vàng của Anthropic Prompt Caching: sắp xếp nội dung từ tĩnh nhất đến động nhất (`tools` -> `system` -> static context -> dynamic user turn) và đặt `cache_control` breakpoint ở ranh giới ổn định.

- **A:** Đặt phần động lên đầu sẽ phá vỡ tiền tố chung (prefix) của mọi request khác nhau, và Anthropic Prompt Caching yêu cầu gắn `cache_control` breakpoint tường minh.
- **B:** Đặt breakpoint sau phần động khiến mỗi câu hỏi mới tạo một cache miss mới, không tái sử dụng được 24,000 tokens tĩnh phía trước.
- **C:** Xóa dấu câu làm hỏng khả năng đọc hiểu của mô hình và mất lợi ích giảm 90% chi phí + giảm TTFT của Prompt Caching.
- **D (Đúng):** Anthropic Prompt Caching khớp chính xác theo tiền tố (prefix matching) theo thứ tự `tools` -> `system` -> `messages`. Đặt các phần tĩnh ổn định (`tools`, `system`, tài liệu tĩnh) lên trước, gắn `cache_control: {"type": "ephemeral"}` ở cuối phần tĩnh và đẩy nội dung động của user xuống sau cùng sẽ tối đa hóa cache hit rate.

</details>

---

[Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md)
