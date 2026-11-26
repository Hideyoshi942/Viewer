# Bài tập tình huống — Module 2: Streaming (SSE) & Message Batches API

> Giảm TTFT với Server-Sent Events (6 loại sự kiện SSE), xử lý timeout với stream, và tối ưu 50% chi phí qua Message Batches API (SLA <= 24h, 100k requests/256 MB, custom_id).
> **Số câu hỏi:** 11 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A streaming chat UI consumes Server-Sent Events (SSE) from `messages.create` with `stream=True`. Which event type delivers incremental text chunks as Claude generates its response?

- **A.** message_delta
- **B.** content_block_start_event
- **C.** content_block_delta
- **D.** message_start

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một giao diện chat streaming tiêu thụ các Server-Sent Events (SSE) từ `messages.create` với `stream=True`. Loại event nào truyền tải các đoạn văn bản tăng dần (incremental text chunks) khi Claude đang tạo phản hồi?

**Đáp án đúng:** **C**

Trong luồng SSE của Anthropic Messages API, vòng đời sự kiện đi từ `message_start` -> `content_block_start` -> nhiều `content_block_delta` (chứa nội dung tăng dần) -> `content_block_stop` -> `message_delta` -> `message_stop`.

- **A:** `message_delta` xuất hiện gần cuối stream để cập nhật metadata ở cấp độ message như `stop_reason` và tổng `output_tokens`.
- **B:** `content_block_start` đánh dấu sự bắt đầu của một content block mới (như `text` hoặc `tool_use`), chưa chứa các mảnh delta tiếp theo.
- **C (Đúng):** `content_block_delta` mang các mảnh dữ liệu tăng dần (`text_delta`, `input_json_delta`, hoặc `thinking_delta`) trong quá trình model sinh token.
- **D:** `message_start` chỉ xuất hiện một lần ở đầu stream, chứa metadata ban đầu của message và thông tin `input_tokens`.

</details>

### Câu 2 `medium`

A backend service processes an asynchronous nightly job that summarizes 50,000 customer support tickets. Latency is not critical as long as results are ready within 24 hours, and the team wants to cut inference costs in half. Which Anthropic API feature should they use?

- **A.** Token Counting API before sending standard requests
- **B.** Prompt Caching with a 1-hour TTL
- **C.** Standard Messages API with `stream=True` and concurrent worker threads
- **D.** Message Batches API

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một dịch vụ backend xử lý tác vụ chạy ngầm hàng đêm bất đồng bộ để tóm tắt 50.000 ticket hỗ trợ khách hàng. Độ trễ không quan trọng miễn là có kết quả trong vòng 24 giờ, và nhóm muốn giảm một nửa chi phí suy luận (inference cost). Họ nên sử dụng tính năng nào của Anthropic API?

**Đáp án đúng:** **D**

Message Batches API được thiết kế cho các tác vụ xử lý hàng loạt không yêu cầu thời gian thực (SLA tối đa 24 giờ) và cung cấp mức giảm giá 50% cho cả input và output tokens.

- **A:** Token Counting API chỉ dùng để ước lượng số token trước khi gọi API, không giúp giảm giá thành inference.
- **B:** Prompt Caching chỉ giảm chi phí cho phần tiền tố (prefix) lặp lại, không giảm 50% cho toàn bộ output và các ticket nội dung khác nhau.
- **C:** Streaming với nhiều worker chạy đồng thời vẫn tính giá tiêu chuẩn của Messages API và dễ chạm giới hạn rate limit (429).
- **D (Đúng):** Message Batches API xử lý bất đồng bộ với SLA trong vòng 24 giờ và giảm 50% chi phí token so với Messages API tiêu chuẩn.

</details>

### Câu 3 `medium`

A developer uses the Python Anthropic SDK's `client.messages.stream(...)` context manager for a long-running generation. Why does Anthropic recommend using streaming for requests with very large `max_tokens` values (e.g., > 16,000 tokens)?

- **A.** Streaming reduces the per-token price by 25% compared to non-streaming requests.
- **B.** Streaming prevents HTTP connection timeouts on long-running requests by keeping data flowing incrementally.
- **C.** Streaming disables rate limiting for the duration of the response.
- **D.** Non-streaming `messages.create` requests automatically cap output at 4,096 tokens regardless of the requested `max_tokens`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên sử dụng context manager `client.messages.stream(...)` của Anthropic Python SDK cho một tác vụ sinh văn bản chạy lâu. Tại sao Anthropic khuyến nghị sử dụng streaming cho các request có giá trị `max_tokens` rất lớn (ví dụ: > 16.000 tokens)?

**Đáp án đúng:** **B**

Với các request sinh lượng token lớn (hoặc Extended Thinking dài), việc chờ toàn bộ response trong một kết nối HTTP đồng bộ dễ gây timeout. Dùng streaming (`stream=True` / `messages.stream()`) giúp giữ kết nối hoạt động và giảm Time-To-First-Token (TTFT).

- **A:** Giá token giữa streaming và non-streaming là hoàn toàn giống nhau.
- **B (Đúng):** Sinh hàng chục nghìn token có thể mất vài phút; nếu không dùng streaming, HTTP request dễ bị timeout ở client, proxy hoặc load balancer. Streaming gửi dữ liệu liên tục nên tránh được lỗi timeout.
- **C:** Streaming vẫn tuân thủ đầy đủ các giới hạn rate limit (RPM, ITPM, OTPM).
- **D:** Non-streaming không tự động giới hạn 4,096 tokens, nhưng SDK có thể cảnh báo hoặc từ chối nếu thời gian chờ ước tính quá lâu để tránh HTTP timeout.

</details>

### Câu 4 `medium`

A team submits a Message Batch containing 10,000 requests using `client.messages.batches.create`. How should the application determine when the batch is ready for result retrieval?

- **A.** Check `request_counts.succeeded` in the batch metadata and stop polling as soon as it is greater than zero.
- **B.** Call `client.messages.retrieve(batch_id)` on the standard synchronous `/v1/messages` endpoint to download the completed batch JSONL results.
- **C.** Poll `client.messages.batches.retrieve(batch_id)` until `processing_status` is `"ended"`, then stream `batches.results(batch_id)`.
- **D.** Keep the initial `client.messages.batches.create` HTTP connection open until all 10,000 responses stream back from the API.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm gửi một Message Batch chứa 10.000 request bằng `client.messages.batches.create`. Ứng dụng nên xác định khi nào batch đã sẵn sàng để lấy kết quả bằng cách nào?

**Đáp án đúng:** **C**

Message Batches API hoạt động bất đồng bộ: gọi `batches.create` để nhận `batch_id`, poll `batches.retrieve(batch_id)` đến khi `processing_status == "ended"`, rồi tải kết quả từng item (khớp qua `custom_id`) từ `batches.results(batch_id)`.

- **A:** Khi `succeeded > 0` nhưng các request khác vẫn đang `processing`, batch chưa hoàn tất; chỉ khi `processing_status` chuyển sang `"ended"` mới xong toàn bộ.
- **B:** Endpoint chuẩn không có phương thức retrieve theo `batch_id`; phải dùng `messages.batches.retrieve`.
- **C (Đúng):** Quy trình chuẩn của Message Batches API là tạo batch, poll trạng thái qua `batches.retrieve(batch_id)` cho đến khi `processing_status == "ended"`, sau đó đọc kết quả JSONL qua `batches.results(batch_id)`.
- **D:** `batches.create` trả về ngay lập tức với `processing_status: "in_progress"`, không giữ kết nối mở để stream kết quả.

</details>

### Câu 5 `hard`

In a Message Batch job, 50 out of 1,000 requests fail validation or hit an error while 950 succeed. How does the `custom_id` field help the application reconcile results?

- **A.** It forces Anthropic to guarantee that all batch results are returned in the exact original submission order without gaps.
- **B.** It encrypts the prompt payload at rest using a customer-managed KMS key before batching.
- **C.** It automatically retries any `errored` or `expired` items inside the same batch without incurring extra API calls or billing.
- **D.** Each batch result item includes your `custom_id` alongside `result.type` (`succeeded`, `errored`, `canceled`, or `expired`).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong một job Message Batch, 50 trên tổng số 1.000 request bị lỗi xác thực (validation) hoặc gặp lỗi trong khi 950 request thành công. Trường `custom_id` giúp ứng dụng đối chiếu kết quả như thế nào?

**Đáp án đúng:** **D**

Trong Message Batches API, kết quả trả về có thể không theo thứ tự gửi. Mỗi request bắt buộc có `custom_id` duy nhất để bạn map từng kết quả (`succeeded`, `errored`, `canceled`, `expired`) về đúng tác vụ ban đầu.

- **A:** Kết quả batch không đảm bảo trả về đúng thứ tự đã gửi lên, đó là lý do `custom_id` rất quan trọng.
- **B:** `custom_id` không liên quan đến mã hóa payload.
- **C:** `custom_id` chỉ là mã định danh do client cung cấp để map kết quả, không tự động retry item lỗi.
- **D (Đúng):** Vì thứ tự kết quả trong batch không cố định, `custom_id` duy nhất do client gắn cho từng request giúp đối chiếu chính xác từng kết quả (thành công hay lỗi) về bản ghi gốc.

</details>

### Câu 6 `medium`

A web application streams Claude responses to the browser using Server-Sent Events (SSE). Which TWO practices are recommended when building a robust SSE streaming consumer? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Disable UTF-8 decoding because SSE deltas are always ASCII-only.
- **B.** Assume `message_start` contains the final `output_tokens` count and `stop_reason`.
- **C.** Expose your `ANTHROPIC_API_KEY` directly in browser-side JavaScript so the browser connects straight to `api.anthropic.com`.
- **D.** Handle `ping` events gracefully by ignoring them without throwing a parse or unknown-event error.
- **E.** Accumulate `text_delta` chunks by content block `index` and check for `error` events inside the stream.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng web stream phản hồi của Claude về trình duyệt bằng Server-Sent Events (SSE). HAI thực hành nào sau đây được khuyến nghị khi xây dựng một SSE streaming consumer đáng tin cậy? (Chọn HAI đáp án.)

**Đáp án đúng:** **D, E**

Khi xử lý SSE stream từ Claude, client cần ghép nối delta theo `index` của từng content block, xử lý sự kiện `ping` và `error` trong luồng, và luôn giữ API key ở phía backend.

- **A:** SSE sử dụng chuẩn UTF-8 và Claude có thể trả về Unicode (tiếng Việt, emoji, ký tự đặc biệt).
- **B:** `stop_reason` và tổng `output_tokens` cuối cùng chỉ có trong sự kiện `message_delta` ở gần cuối stream, không có ở `message_start`.
- **C:** Tuyệt đối không lộ `ANTHROPIC_API_KEY` ở frontend/browser; phải proxy stream qua backend của bạn.
- **D (Đúng):** Anthropic gửi các sự kiện `ping` định kỳ để giữ kết nối sống; client cần bỏ qua chúng một cách an toàn thay vì báo lỗi.
- **E (Đúng):** Một message có thể có nhiều content block (ví dụ `thinking`, `text`, `tool_use`), nên phải ghép delta theo `index` và xử lý sự kiện `error` có thể xảy ra giữa chừng.

</details>

### Câu 7 `medium`

During a streaming response that includes both Extended Thinking and a tool call, a client receives `content_block_delta` events. Which `delta.type` values should the client handle to extract thinking text, normal text, and tool input JSON?

- **A.** `message_start`, `message_delta`, and `message_stop`
- **B.** `thought_chunk`, `message_chunk`, and `args_json_chunk`
- **C.** `thinking_delta`, `text_delta`, and `input_json_delta`
- **D.** Only `text_delta` is used for all three block types.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong một phản hồi streaming có cả Extended Thinking và lệnh gọi tool, client nhận được các event `content_block_delta`. Client cần xử lý các giá trị `delta.type` nào để trích xuất văn bản suy luận (thinking text), văn bản thông thường và JSON đầu vào của tool?

**Đáp án đúng:** **C**

Khi parse `content_block_delta` trong SSE stream, client cần xử lý `thinking_delta` (trường `thinking`), `text_delta` (trường `text`) và `input_json_delta` (trường `partial_json` cần ghép nối trước khi parse JSON).

- **A:** Đây là các tên sự kiện SSE cấp cao nhất, không phải `delta.type` bên trong `content_block_delta`.
- **B:** Đây không phải các `delta.type` của Anthropic Messages API.
- **C (Đúng):** Trong SSE streaming của Claude: `thinking_delta` mang nội dung suy nghĩ, `text_delta` mang văn bản trả lời, và `input_json_delta` mang từng mảnh JSON tham số cho `tool_use`.
- **D:** Mỗi loại content block dùng một `delta.type` riêng để client phân biệt và xử lý chính xác.

</details>

### Câu 8 `medium`

A team wants to cancel a long-running Message Batch that was accidentally submitted with an outdated prompt template. Which operation should they perform?

- **A.** Batches cannot be canceled once created; you must wait 24 hours for all items to expire.
- **B.** Delete the `ANTHROPIC_API_KEY` from the Console immediately to abort the batch.
- **C.** Call `client.messages.batches.cancel(batch_id)` to transition the batch to `canceling` and stop unprocessed requests.
- **D.** Send a `DELETE /v1/messages` request with the `custom_id` of each item in the batch.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm muốn hủy một Message Batch đang chạy lâu do vô tình gửi nhầm với một mẫu prompt đã lỗi thời. Họ nên thực hiện thao tác nào?

**Đáp án đúng:** **C**

Bạn có thể hủy một batch đang xử lý bằng `client.messages.batches.cancel(batch_id)`. Các request chưa chạy sẽ được đánh dấu `canceled` trong file kết quả.

- **A:** Message Batches API cho phép chủ động hủy batch đang chạy thông qua `batches.cancel`.
- **B:** Xóa API key sẽ làm sập toàn bộ các dịch vụ khác đang dùng chung key đó.
- **C (Đúng):** Message Batches API cung cấp phương thức `batches.cancel(batch_id)` để hủy các request chưa xử lý trong batch (trạng thái chuyển sang `canceling` rồi `ended`).
- **D:** Không có endpoint `DELETE /v1/messages`; hủy batch phải thực hiện qua `POST /v1/messages/batches/{batch_id}/cancel` (`batches.cancel`).

</details>

### Câu 9 `medium`

A developer uses `client.messages.create` and passes an asynchronous `AsyncAnthropic()` client in a Python FastAPI endpoint. Why is `AsyncAnthropic` preferred over the synchronous `Anthropic` client inside `async def` FastAPI routes?

- **A.** `AsyncAnthropic` automatically doubles the model's context window and bypasses organization-level ITPM rate limits.
- **B.** Calling synchronous `Anthropic` inside an `async def` route blocks the asyncio event loop, degrading concurrency.
- **C.** `AsyncAnthropic` is free and does not consume API credits.
- **D.** Synchronous `Anthropic` cannot parse JSON responses.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên sử dụng `client.messages.create` và truyền một client bất đồng bộ `AsyncAnthropic()` trong một endpoint FastAPI Python. Tại sao `AsyncAnthropic` được ưu tiên hơn client đồng bộ `Anthropic` bên trong các route `async def` của FastAPI?

**Đáp án đúng:** **B**

Trong các web framework bất đồng bộ như FastAPI (`async def`), luôn sử dụng `AsyncAnthropic` (Python) hoặc `await client.messages.create(...)` (TypeScript) để không làm nghẽn event loop.

- **A:** Client async không thay đổi giới hạn context window của model.
- **B (Đúng):** Dùng client đồng bộ trong hàm `async def` sẽ block toàn bộ event loop của FastAPI trong suốt thời gian chờ LLM phản hồi. `AsyncAnthropic` dùng non-blocking I/O (`await`) nên phục vụ đồng thời nhiều request hiệu quả.
- **C:** Mọi lời gọi API đều tính phí token như nhau.
- **D:** Client đồng bộ vẫn parse response bình thường, vấn đề nằm ở việc block event loop.

</details>

### Câu 10 `hard`

A developer uses `client.messages.stream(...)` in Python and wants to gracefully handle both partial text display to the user and retrieving the final assembled `Message` object (including `usage` and `stop_reason`) once streaming completes. Which SDK helper pattern is cleanest?

- **A.** Read `stream.text_stream` inside a `finally` block after closing the connection.
- **B.** Estimate `output_tokens` by dividing the total character count by 4 and ignore `stop_reason` in production.
- **C.** Call `client.messages.create` a second time without streaming just to read the `usage` and `stop_reason` response fields accurately.
- **D.** Iterate `for text in stream.text_stream:` for UI updates, then call `final_msg = stream.get_final_message()` after the loop.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên sử dụng `client.messages.stream(...)` trong Python và muốn xử lý mượt mà cả việc hiển thị văn bản từng phần cho người dùng lẫn lấy đối tượng `Message` hoàn chỉnh cuối cùng (bao gồm `usage` và `stop_reason`) khi streaming kết thúc. Mẫu helper SDK nào gọn gàng nhất?

**Đáp án đúng:** **D**

Các SDK chính thức của Anthropic cung cấp helper bậc cao (`stream.text_stream` và `stream.get_final_message()` trong Python, hoặc `.on('text', ...)` và `.finalMessage()` trong TypeScript) giúp tích hợp streaming gọn nhẹ và đầy đủ metadata.

- **A:** Đọc stream sau khi đóng kết nối sẽ thất bại.
- **B:** Không cần ước lượng vì `get_final_message()` đã cung cấp số liệu chính xác từ `message_delta`.
- **C:** Gọi lại lần 2 sẽ tốn gấp đôi chi phí và cho kết quả khác.
- **D (Đúng):** Anthropic Python SDK cung cấp `stream.text_stream` để lặp nhanh các mảnh văn bản và `stream.get_final_message()` để lấy toàn bộ đối tượng `Message` hoàn chỉnh (gồm `content`, `stop_reason`, `usage`).

</details>

### Câu 11 `medium`

Which TWO statements accurately describe the Message Batches API compared to the standard synchronous Messages API? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Each Message Batch can contain at most 5 individual requests.
- **B.** Batches are processed asynchronously with a target completion SLA of up to 24 hours.
- **C.** Message Batches provide a 50% cost reduction on input and output tokens.
- **D.** Message Batches guarantee sub-second Time-To-First-Token via SSE streaming connections.
- **E.** Prompt Caching and Tool Use are forbidden inside Message Batch requests.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** HAI phát biểu nào sau đây mô tả chính xác Message Batches API khi so sánh với Messages API đồng bộ tiêu chuẩn? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, C**

Message Batches API là lựa chọn tối ưu cho các tác vụ nền khối lượng lớn không cần phản hồi tức thì: **giảm 50% chi phí** và **SLA xử lý trong vòng 24 giờ**.

- **A:** Một batch có thể chứa tới hàng chục nghìn hoặc hàng trăm nghìn request (tùy giới hạn dung lượng/số lượng của API).
- **B (Đúng):** Batch chạy bất đồng bộ với SLA hoàn thành tối đa 24 giờ (thường nhanh hơn nhiều nhưng không đảm bảo thời gian thực).
- **C (Đúng):** Message Batches API giảm 50% chi phí token so với Messages API thông thường.
- **D:** Batch không hỗ trợ SSE streaming theo thời gian thực.
- **E:** Message Batches vẫn hỗ trợ Tool Use, Vision, System prompts và cả Prompt Caching.

</details>

---

[Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md)
