# Bài tập tình huống — Module 4: Error Handling, Rate Limits & Retry Strategies

> Ma trận xử lý lỗi HTTP (400/401/403/404 không retry vs 429/500/529 có retry), đọc retry-after header, Exponential Backoff with Jitter và kiểm soát RPM/ITPM/OTPM.
> **Số câu hỏi:** 5 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A production microservice occasionally receives HTTP `429 Too Many Requests` and HTTP `529 Overloaded` responses from the Anthropic API during traffic spikes. What is the recommended retry strategy?

- **A.** Use exponential backoff with jitter, honoring the `retry-after` header when present.
- **B.** Immediately retry in a tight loop without delay until the request succeeds.
- **C.** Treat HTTP 529 as a permanent client-side schema error and drop the request without retrying.
- **D.** Switch the `model` parameter to an invalid string to force a fallback route.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một microservice trên production thỉnh thoảng nhận được phản hồi HTTP `429 Too Many Requests` và HTTP `529 Overloaded` từ Anthropic API khi lưu lượng tăng đột biến. Chiến lược thử lại (retry strategy) nào được khuyến nghị?

**Đáp án đúng:** **A**

Cả HTTP 429 (rate limit) và HTTP 529 (Anthropic API tạm thời quá tải) đều là lỗi tạm thời (transient errors). Thực hành tốt nhất là dùng exponential backoff với jitter và ưu tiên giá trị trong header `retry-after` (SDK chính thức của Anthropic đã tích hợp sẵn cơ chế này).

- **A (Đúng):** Chiến lược chuẩn khi gặp 429 hoặc 529 là exponential backoff kết hợp jitter (độ trễ ngẫu nhiên để tránh thundering herd) và tôn trọng header `retry-after` nếu server trả về.
- **B:** Retry liên tục không có độ trễ sẽ làm trầm trọng thêm tình trạng quá tải và tiếp tục bị chặn rate limit.
- **C:** HTTP 529 (Overloaded) là lỗi tạm thời phía server do lưu lượng cao, có thể retry thành công sau khi chờ.
- **D:** Truyền tên model không hợp lệ sẽ gây lỗi 400/404 chứ không kích hoạt fallback.

</details>

### Câu 2 `medium`

A developer is inspecting the `usage` object returned by a Messages API response and its HTTP headers to monitor rate limits and token consumption. Which TWO statements about Anthropic rate limits and usage tracking are correct? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Prompt-cached input tokens read from cache (`cache_read_input_tokens`) always count 100% against your organization's ITPM limit at full weight.
- **B.** Setting `max_tokens` to 100,000 has no effect on OTPM admission checks if the model only outputs 50 tokens.
- **C.** Response headers such as `anthropic-ratelimit-requests-remaining` and `anthropic-ratelimit-tokens-remaining` report current quota status.
- **D.** Anthropic enforces rate limits across Requests Per Minute (RPM), Input Tokens Per Minute (ITPM), and Output Tokens Per Minute (OTPM).
- **E.** Rate limits are shared globally across all Anthropic customers rather than scoped to an organization.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên đang kiểm tra đối tượng `usage` trả về từ phản hồi của Messages API và các HTTP header của nó để giám sát rate limit và mức tiêu thụ token. HAI phát biểu nào sau đây về rate limit và theo dõi mức sử dụng của Anthropic là đúng? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, D**

Anthropic quản lý rate limit theo từng Organization qua các chỉ số RPM, ITPM và OTPM, đồng thời trả về các header `anthropic-ratelimit-*` giúp ứng dụng theo dõi hạn mức theo thời gian thực.

- **A:** Trên các model Claude mới, token đọc từ cache (`cache_read_input_tokens`) không bị tính vào giới hạn ITPM (hoặc được miễn trừ theo chính sách rate limit cache), giúp tăng thông lượng đáng kể.
- **B:** Hệ thống có thể ước lượng/giữ chỗ theo `max_tokens` khi kiểm tra giới hạn; đặt `max_tokens` quá cao không cần thiết có thể khiến request dễ chạm ngưỡng OTPM hơn.
- **C (Đúng):** Các HTTP response header bắt đầu bằng `anthropic-ratelimit-*` cho biết hạn mức còn lại và thời điểm reset để client chủ động điều tiết lưu lượng.
- **D (Đúng):** Anthropic áp dụng giới hạn đồng thời trên 3 chiều: RPM (số request/phút), ITPM (input tokens/phút) và OTPM (output tokens/phút).
- **E:** Rate limits được áp dụng theo từng Organization (và theo tier sử dụng), không dùng chung toàn cầu giữa các khách hàng.

</details>

### Câu 3 `hard`

A developer is troubleshooting why an Anthropic API call failed with an HTTP 400 `invalid_request_error`. Which TWO mistakes commonly trigger a 400 `invalid_request_error` in the Messages API? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Passing `cache_control: {"type": "ephemeral"}` inside a `system` content block when `stream=False` is configured on the API request.
- **B.** Receiving an HTTP 529 Overloaded status from Anthropic's servers.
- **C.** Including a `role: "system"` object inside the `messages` array instead of using the top-level `system` parameter.
- **D.** Using `client.messages.create` without specifying `temperature`.
- **E.** Placing two consecutive `user` messages without an intervening `assistant` turn, or starting `messages` with an `assistant` role.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên đang khắc phục sự cố tại sao một lệnh gọi Anthropic API bị lỗi với HTTP 400 `invalid_request_error`. HAI sai sót nào sau đây thường gây ra lỗi 400 `invalid_request_error` trong Messages API? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Lỗi 400 `invalid_request_error` thường do sai cấu trúc request: đưa `role: "system"` vào trong mảng `messages` thay vì dùng tham số `system` cấp cao nhất, hoặc mảng `messages` không bắt đầu bằng `user`.

- **A:** Đây là cú pháp hợp lệ hoàn toàn để bật Prompt Caching cho `system` prompt.
- **B:** HTTP 529 là lỗi tạm thời phía server (Overloaded), không phải lỗi 400 `invalid_request_error`.
- **C (Đúng):** Khác với một số API khác, Anthropic Messages API không chấp nhận `role: "system"` bên trong `messages`; system prompt phải truyền qua tham số top-level `system`.
- **D:** `temperature` là tham số tùy chọn nên bỏ qua sẽ không gây lỗi 400.
- **E (Đúng):** Messages API yêu cầu mảng `messages` phải bắt đầu bằng `role: "user"` (và tuân thủ luân phiên role hợp lệ); nếu bắt đầu bằng `assistant` sẽ bị từ chối với lỗi 400.

</details>

### Câu 4 `easy`

When using the official Anthropic Python or TypeScript SDK, what is the default retry behavior if a request encounters a transient HTTP 429 or 5xx/529 error?

- **A.** The SDK silently returns `None` instead of raising an exception.
- **B.** The SDK never retries any HTTP error unless you write and register a custom HTTP transport middleware.
- **C.** The SDK automatically retries HTTP 400 `invalid_request_error` up to 10 times with exponential backoff before raising an exception to caller.
- **D.** The SDK automatically retries transient errors (like 429, 500, 529) up to `max_retries` (default 2) with exponential backoff.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Khi sử dụng Anthropic Python hoặc TypeScript SDK chính thức, hành vi thử lại (retry behavior) mặc định là gì nếu một request gặp lỗi tạm thời HTTP 429 hoặc 5xx/529?

**Đáp án đúng:** **D**

Anthropic SDK mặc định tự động retry tối đa 2 lần với exponential backoff cho các lỗi tạm thời (429, 500, 529, network timeout) và có thể điều chỉnh qua `max_retries`.

- **A:** Nếu hết số lần retry mà vẫn lỗi, SDK sẽ ném exception (`RateLimitError`, `APIStatusError`, v.v.).
- **B:** SDK có sẵn cơ chế retry mặc định; bạn có thể tùy chỉnh qua tham số `max_retries` khi khởi tạo client.
- **C:** Lỗi 400 là lỗi phía client (sai tham số), retry sẽ vô ích nên SDK ném lỗi ngay lập tức.
- **D (Đúng):** Anthropic SDK chính thức tích hợp sẵn cơ chế tự động retry (mặc định `max_retries=2`) với exponential backoff và tôn trọng header `retry-after` cho lỗi kết nối, 408, 409, 429 và >=500.

</details>

### Câu 5 `hard`

A high-throughput service is hitting HTTP 429 rate-limit errors on Input Tokens Per Minute (ITPM). Which TWO actions directly help reduce ITPM pressure or increase effective throughput? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Offload non-urgent bulk workloads from the synchronous Messages API to the Message Batches API, which has separate batch rate limits.
- **B.** Increase `max_tokens` from 500 to 32,000 on every synchronous request to reduce HTTP overhead.
- **C.** Disable exponential backoff and retry immediately every 5 milliseconds until the HTTP 429 clears.
- **D.** Duplicate the `system` prompt twice in every request to warm up the token cache faster.
- **E.** Enable Prompt Caching on large static prefixes so `cache_read_input_tokens` benefit from cache-read rate limit exemptions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một dịch vụ lưu lượng cao đang gặp lỗi giới hạn tốc độ HTTP 429 về Input Tokens Per Minute (ITPM). HAI hành động nào sau đây trực tiếp giúp giảm áp lực ITPM hoặc tăng thông lượng hiệu quả? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, E**

Để giải quyết nghẽn ITPM trong hệ thống tải cao: hãy áp dụng **Prompt Caching** cho tiền tố lặp lại và chuyển các tác vụ không cần thời gian thực sang **Message Batches API**.

- **A (Đúng):** Message Batches API có hạn mức riêng biệt và không tranh chấp trực tiếp với lưu lượng thời gian thực trên Messages API.
- **B:** Tăng `max_tokens` không giảm ITPM mà còn gây áp lực lên OTPM.
- **C:** Retry dồn dập chỉ làm tăng thêm số lỗi 429 và lãng phí RPM.
- **D:** Lặp lại `system` prompt làm tăng gấp đôi số input tokens và khiến lỗi 429 nặng hơn.
- **E (Đúng):** Dùng Prompt Caching cho tiền tố tĩnh lớn giúp phần lớn token được đọc từ cache và được miễn trừ/giảm tải khỏi hạn mức ITPM trên các model Claude hiện đại.

</details>

---

[Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md)
