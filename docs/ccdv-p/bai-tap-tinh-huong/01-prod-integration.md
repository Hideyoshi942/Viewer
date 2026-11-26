# Bài tập tình huống — Chủ đề 1: Resilient Claude API Integration (Circuit Breaker, Retry & Multi-Region Fallback)

> Xây dựng tầng tích hợp API bền bỉ với Exponential Backoff + Jitter, Idempotency Keys, Circuit Breaker và Multi-Provider Fallback (Anthropic / Bedrock / Vertex).
> **Số câu hỏi:** 5 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A high-throughput customer support gateway calls the Anthropic Messages API synchronously during peak traffic. Suddenly, upstream requests begin failing with HTTP 529 Overloaded errors, causing thread pool exhaustion in the gateway. Which resilience pattern should be implemented first to prevent cascading failure across the platform?

- **A.** Configure a circuit breaker that trips after a threshold of 529 errors and routes requests to a fallback model or cached response.
- **B.** Increase the HTTP client socket read timeout from 30 seconds to 180 seconds across all gateway pods so overloaded API calls can finish waiting.
- **C.** Implement an immediate synchronous retry loop with zero backoff delay up to ten attempts per incoming user request before returning a 502 error.
- **D.** Switch all synchronous Messages API calls to the Message Batches API while keeping each user's HTTP connection open until batch completion.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một gateway hỗ trợ khách hàng lưu lượng cao gọi Anthropic Messages API đồng bộ trong giờ cao điểm. Đột nhiên, các request phía upstream bắt đầu thất bại với lỗi HTTP 529 Overloaded, gây cạn kiệt thread pool trong gateway. Mẫu phục hồi (resilience pattern) nào cần được triển khai đầu tiên để ngăn chặn lỗi dây chuyền (cascading failure) trên toàn nền tảng?

**Đáp án đúng:** **A**

Khi API gặp HTTP 529 Overloaded ở lưu lượng cao, circuit breaker giúp ngăn chặn thread pool exhaustion bằng cách ngừng gửi request mới khi mạch mở (open) và chuyển sang cơ chế fallback (như multi-region Bedrock/Vertex hoặc graceful degradation).

- **A (Đúng):** Circuit breaker phát hiện tỷ lệ lỗi 529 vượt ngưỡng, tự động ngắt mạch (open state) để bảo vệ thread pool khỏi cạn kiệt và chuyển hướng sang mô hình dự phòng hoặc phản hồi suy giảm duyên dáng.
- **B:** Tăng timeout lên 180 giây sẽ giữ kết nối mở lâu hơn, làm thread pool cạn kiệt nhanh hơn và trầm trọng hóa hiện tượng cascading failure.
- **C:** Retry ngay lập tức không có backoff và jitter sẽ tạo ra retry storm, tăng gấp 10 lần tải lên API đang quá tải.
- **D:** Message Batches API là bất đồng bộ (SLA 24 giờ), hoàn toàn không phù hợp để giữ kết nối HTTP đồng bộ cho người dùng.

</details>

### Câu 2 `medium`

A production service receives HTTP 429 rate-limit responses from the Anthropic API during bursty batch jobs. The team notices that multiple worker pods retry at identical fixed intervals, causing repeated synchronized spikes. Which retry strategy should they adopt?

- **A.** Configure a constant 2-second sleep interval between retries across all Kubernetes worker pods to keep upstream throughput predictable.
- **B.** Honor the Retry-After response header when present and otherwise apply exponential backoff with full jitter.
- **C.** Autoscale additional worker pods whenever an HTTP 429 error is logged so that more container IP addresses share the organization quota.
- **D.** Switch from HTTPS POST requests to persistent WebSocket connections to bypass organization token-per-minute and request-per-minute limits.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một dịch vụ production nhận được phản hồi giới hạn tốc độ HTTP 429 từ Anthropic API trong các batch job có tải tăng đột biến. Nhóm nhận thấy nhiều worker pod cùng thử lại theo các khoảng thời gian cố định giống hệt nhau, gây ra các đợt tăng đột biến đồng bộ lặp đi lặp lại. Họ nên áp dụng chiến lược thử lại (retry strategy) nào?

**Đáp án đúng:** **B**

Khi xử lý HTTP 429, best practice chuẩn là đọc header `Retry-After` (nếu có) và sử dụng exponential backoff kết hợp full jitter để tránh hiện tượng thundering herd giữa các worker.

- **A:** Sleep cố định 2 giây khiến các worker tiếp tục đồng bộ hóa (thundering herd) và đâm vào giới hạn rate limit cùng một lúc.
- **B (Đúng):** Ưu tiên header Retry-After từ server và kết hợp exponential backoff với full jitter giúp phân tán thời điểm retry ngẫu nhiên, triệt tiêu thundering herd.
- **C:** Rate limit của Anthropic tính theo organization/workspace API key chứ không theo IP; tăng thêm pod chỉ làm 429 tệ hơn.
- **D:** Messages API dùng HTTPS/SSE và giới hạn TPM/RPM được áp dụng ở tầng tài khoản, không thể vượt qua bằng đổi giao thức.

</details>

### Câu 3 `medium`

An engineering team streams Claude responses over Server-Sent Events (SSE) to mobile clients on flaky cellular networks. When a client disconnects mid-stream and reconnects 3 seconds later, the backend currently restarts the LLM call from scratch, doubling token costs. How should the backend handle stream resumption?

- **A.** Disable TLS encryption on the SSE streaming endpoint to eliminate TCP/TLS handshake overhead during cellular tower handoffs.
- **B.** Switch from SSE streaming to synchronous blocking HTTP responses so mobile clients never receive partial payloads over cellular links.
- **C.** Send the partial assistant text back to Claude with `temperature: 0.0` and ask it to reconstruct the exact tokens the mobile client missed.
- **D.** Buffer emitted SSE chunks in Redis keyed by stream ID with sequence numbers and replay missed deltas upon client reconnection.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ thuật stream phản hồi của Claude qua Server-Sent Events (SSE) tới các thiết bị di động trên mạng di động không ổn định. Khi một client bị ngắt kết nối giữa chừng và kết nối lại sau 3 giây, backend hiện tại khởi động lại lệnh gọi LLM từ đầu, làm tăng gấp đôi chi phí token. Backend nên xử lý việc khôi phục stream (stream resumption) như thế nào?

**Đáp án đúng:** **D**

Tách rời vòng đời stream từ Anthropic về backend với vòng đời kết nối từ backend ra client (dùng Redis/buffer + `Last-Event-ID`) giúp client reconnect mượt mà mà không phải tốn tiền gọi lại LLM.

- **A:** Tắt TLS vi phạm nghiêm trọng bảo mật dữ liệu và không giải quyết vấn đề mất kết nối ở tầng ứng dụng.
- **B:** Chặn đồng bộ làm tăng mạnh thời gian chờ (TTFT) và dễ bị timeout trên mạng di động không ổn định.
- **C:** Gọi lại Claude chỉ để nối tiếp sẽ tốn thêm token, tăng độ trễ và không cần thiết nếu server vẫn đang nhận stream từ Anthropic.
- **D (Đúng):** Lưu đệm các SSE delta vào Redis theo `stream_id` và số thứ tự (event ID) cho phép client gửi `Last-Event-ID` khi kết nối lại để nhận tiếp phần còn thiếu mà không gọi lại Claude.

</details>

### Câu 4 `hard`

An engineering team is designing a multi-region production integration for Claude that must survive both regional cloud outages and transient rate-limit spikes without losing user requests. Which THREE practices should they implement together?

*(Chọn 3 đáp án)*

- **A.** Apply exponential backoff with jitter when handling HTTP 429 and 529 responses, respecting `Retry-After` headers.
- **B.** Maintain a circuit breaker per upstream region/provider that trips on sustained error rates and routes traffic to a healthy fallback region.
- **C.** Enforce strict request timeouts and bounded connection pools so failing upstream calls cannot exhaust application worker threads.
- **D.** Configure infinite synchronous retries with zero delay so that no transient error ever reaches the fallback region.
- **E.** Hardcode a single availability zone IP address in `/etc/hosts` to bypass DNS resolution overhead during failover.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ thuật đang thiết kế tích hợp production đa vùng (multi-region) cho Claude phải sống sót qua cả sự cố gián đoạn đám mây theo vùng lẫn các đợt tăng đột biến rate-limit tạm thời mà không làm mất request của người dùng. BA thực hành nào họ nên triển khai cùng nhau?

**Đáp án đúng:** **A, B, C**

Kiến trúc tích hợp Claude đạt chuẩn production cần kết hợp phòng thủ nhiều lớp: timeout & connection pool có giới hạn, retry có backoff + jitter + `Retry-After`, và circuit breaker chuyển mạch đa vùng.

- **A (Đúng):** Exponential backoff with jitter kết hợp `Retry-After` giúp xử lý mượt mà các đợt tăng đột biến 429/529.
- **B (Đúng):** Circuit breaker theo từng region/provider giúp phát hiện sự cố diện rộng và chuyển lưu lượng sang vùng dự phòng.
- **C (Đúng):** Timeout chặt chẽ và giới hạn connection pool ngăn chặn cạn kiệt tài nguyên nội bộ khi upstream chậm hoặc treo.
- **D:** Retry vô hạn không có độ trễ sẽ làm sập cả client lẫn server và ngăn không cho fallback hoạt động.
- **E:** Hardcode một IP duy nhất phá hủy khả năng failover và load balancing ở tầng DNS/CDN.

</details>

### Câu 5 `hard`

A high-throughput customer support platform calls the Anthropic Messages API directly as its primary provider and configures AWS Bedrock as a secondary failover. During a regional traffic spike, the primary endpoint returns sustained `529 overloaded_error` responses for 45 seconds. Which resilience pattern best prevents cascading thread exhaustion while ensuring graceful recovery?

- **A.** Use a stateful circuit breaker that trips on 529 bursts, fails over to AWS Bedrock, and probes Anthropic in half-open state with exponential backoff and full jitter.
- **B.** Configure an immediate synchronous retry loop of up to 10 attempts per request with a fixed 500ms delay against the Anthropic endpoint before falling back to a static error message.
- **C.** Keep the circuit permanently switched to AWS Bedrock once three consecutive 529 errors occur, requiring a manual configuration deployment and full service restart to restore traffic to the primary Anthropic endpoint.
- **D.** Increase the HTTP client socket timeout to 180 seconds and disable connection pooling so every incoming request establishes a fresh TCP connection to the Anthropic Messages API.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng hỗ trợ khách hàng lưu lượng cao gọi trực tiếp Anthropic Messages API làm nhà cung cấp chính và cấu hình AWS Bedrock làm dự phòng chuyển đổi thứ cấp (secondary failover). Trong một đợt tăng lưu lượng đột biến theo vùng, endpoint chính trả về lỗi `529 overloaded_error` liên tục trong 45 giây. Mẫu phục hồi (resilience pattern) nào ngăn chặn tốt nhất tình trạng cạn kiệt thread dây chuyền đồng thời đảm bảo khôi phục mượt mà?

**Đáp án đúng:** **A**

Trong kiến trúc production đa nhà cung cấp (multi-provider), kết hợp Circuit Breaker (Closed -> Open -> Half-Open) với Exponential Backoff + Full Jitter và failover sang AWS Bedrock hoặc Google Vertex AI là chuẩn mực để cô lập lỗi `529 overloaded_error`, bảo vệ tài nguyên hệ thống và tự động phục hồi.

- **A (Đúng):** Circuit breaker kết hợp chuyển sang AWS Bedrock khi mở mạch (open) giúp tránh làm nghẽn thread pool của ứng dụng, và trạng thái half-open kèm exponential backoff + full jitter giúp kiểm tra phục hồi an toàn mà không gây thundering herd lên API.
- **B:** Retry đồng bộ 10 lần với fixed delay 500ms khi hệ thống đang quá tải (529) sẽ làm giữ chặt thread/connection pool và gây hiệu ứng thundering herd khiến tình trạng quá tải trầm trọng hơn.
- **C:** Failover vĩnh viễn đòi hỏi can thiệp thủ công làm mất khả năng tự phục hồi (self-healing) của hệ thống và tăng gánh nặng vận hành khi sự cố tạm thời đã qua.
- **D:** Tăng timeout và tắt connection pooling làm tăng độ trễ TLS handshake và giữ tài nguyên lâu hơn trong lúc lỗi 529, dẫn đến cạn kiệt tài nguyên server nhanh hơn.

</details>

---

[Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md)
