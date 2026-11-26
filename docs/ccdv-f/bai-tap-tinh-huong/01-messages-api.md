# Bài tập tình huống — Module 1: Messages API & Stateless Conversation Architecture

> Kiến trúc stateless của POST /v1/messages, quản lý hội thoại đa lượt (messages array), system prompts, max_tokens, temperature, stop_sequences và SDK trên Bedrock/Vertex AI.
> **Số câu hỏi:** 12 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `easy`

A developer is integrating the Anthropic Messages API (`client.messages.create`) into a backend service. Which parameter is strictly required alongside `model` and `messages` in every Messages API request?

- **A.** max_tokens
- **B.** stream
- **C.** system
- **D.** temperature

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên đang tích hợp Anthropic Messages API (`client.messages.create`) vào một dịch vụ backend. Tham số nào là bắt buộc phải có cùng với `model` và `messages` trong mọi request tới Messages API?

**Đáp án đúng:** **A**

Anthropic Messages API yêu cầu bắt buộc 3 trường: `model`, `max_tokens` (số token tối đa model được phép sinh ra) và `messages` (mảng hội thoại). Các trường như `system`, `temperature`, `stream` đều là tùy chọn.

- **A (Đúng):** Trong Anthropic Messages API, `model`, `max_tokens` và `messages` là ba tham số bắt buộc phải có trong mọi request.
- **B:** Tham số `stream` là tùy chọn (mặc định là `false`), chỉ bật khi cần nhận phản hồi dạng SSE streaming.
- **C:** Tham số `system` là tùy chọn (optional) dùng để đặt system prompt, không bắt buộc trong mọi request.
- **D:** Tham số `temperature` là tùy chọn (mặc định là 1.0), không bắt buộc phải truyền vào request.

</details>

### Câu 2 `medium`

A conversational AI application needs to maintain multi-turn context across user requests using the stateless Anthropic Messages API. How must the application structure the `messages` array when sending the third user turn?

- **A.** Send only the third user message along with a `conversation_id` returned from the previous API response.
- **B.** Send the full alternating history of `user` and `assistant` turns ending with the third `user` message.
- **C.** Send the previous `assistant` response with `role: "system"` followed by the new `user` message.
- **D.** Concatenate all previous user and assistant messages into the `system` parameter and send only the third user message in `messages`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng AI hội thoại cần duy trì ngữ cảnh nhiều lượt (multi-turn context) xuyên suốt các request của người dùng khi sử dụng Anthropic Messages API vốn không lưu trạng thái (stateless). Ứng dụng phải cấu trúc mảng `messages` như thế nào khi gửi lượt thứ ba của người dùng?

**Đáp án đúng:** **B**

Anthropic Messages API là API phi trạng thái (stateless). Để duy trì ngữ cảnh đa lượt (multi-turn), client phải gửi lại toàn bộ mảng `messages` theo thứ tự xen kẽ `user` và `assistant`, kết thúc bằng lượt `user` hiện tại.

- **A:** Messages API là stateless và không lưu trữ lịch sử hội thoại theo `conversation_id` trên server.
- **B (Đúng):** Vì Messages API hoàn toàn stateless, ứng dụng phải tự lưu và gửi lại toàn bộ lịch sử các lượt `user` và `assistant` xen kẽ nhau, kết thúc bằng lượt `user` mới nhất.
- **C:** Trong Messages API, `role` trong mảng `messages` chỉ chấp nhận `user` hoặc `assistant`; `system` là một tham số cấp cao nhất (top-level parameter) riêng biệt.
- **D:** Nhồi lịch sử hội thoại vào `system` làm mất cấu trúc phân vai `user`/`assistant` chuẩn của mô hình và làm giảm chất lượng hội thoại.

</details>

### Câu 3 `easy`

When calling `client.messages.create` with a single-turn prompt, Claude returns a response with `stop_reason: "max_tokens"`. What does this indicate?

- **A.** Claude finished its response naturally and reached an end-of-turn stop sequence with no more tokens.
- **B.** Claude's output was truncated because it reached the `max_tokens` limit specified in the request.
- **C.** The input prompt exceeded the model's context window limit and could not be processed further.
- **D.** Claude paused generation to wait for a client-side tool execution result before continuing its turn.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Khi gọi `client.messages.create` với một prompt một lượt (single-turn), Claude trả về phản hồi có `stop_reason: "max_tokens"`. Điều này cho biết điều gì?

**Đáp án đúng:** **B**

`stop_reason: "max_tokens"` cho biết output đã chạm giới hạn `max_tokens` bạn đặt trong request và có thể bị cắt dở (ví dụ JSON chưa đóng ngoặc). Bạn cần tăng `max_tokens` hoặc yêu cầu model tiếp tục.

- **A:** Nếu Claude kết thúc tự nhiên, `stop_reason` sẽ là `end_turn`.
- **B (Đúng):** `stop_reason: "max_tokens"` nghĩa là quá trình sinh văn bản đã bị cắt ngang do chạm ngưỡng `max_tokens` mà client cấu hình trong request.
- **C:** Nếu input vượt quá context window, API sẽ trả về lỗi HTTP 400 ngay từ đầu chứ không trả về response với `stop_reason: "max_tokens"`.
- **D:** Khi Claude yêu cầu chạy tool, `stop_reason` là `tool_use`.

</details>

### Câu 4 `medium`

An application sends a deterministic classification prompt and sets `temperature: 0.0`. However, the team still observes minor variations in output across identical requests over time. What should the developer understand about `temperature: 0.0`?

- **A.** `temperature: 0.0` favors the highest-probability token, though floating-point execution means strict determinism is not guaranteed.
- **B.** `temperature` must be set to `-1.0` to achieve deterministic behavior.
- **C.** `temperature: 0.0` guarantees 100% bitwise-identical outputs across all future API calls regardless of model or backend hardware updates.
- **D.** `temperature: 0.0` disables the `system` prompt and forces tool calling on every turn of the conversation.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng gửi một prompt phân loại mang tính tất định và đặt `temperature: 0.0`. Tuy nhiên, nhóm vẫn quan sát thấy những biến động nhỏ trong đầu ra giữa các request giống hệt nhau theo thời gian. Lập trình viên cần hiểu điều gì về `temperature: 0.0`?

**Đáp án đúng:** **A**

Giá trị `temperature` nằm trong khoảng `0.0` đến `1.0`. Đặt `temperature: 0.0` giúp đầu ra ổn định và nhất quán nhất có thể cho các tác vụ phân loại/trích xuất, nhưng không đảm bảo tuyệt đối 100% giống hệt nhau ở mọi lần chạy do đặc thù tính toán GPU.

- **A (Đúng):** `temperature: 0.0` giảm tối đa tính ngẫu nhiên (chọn token xác suất cao nhất), nhưng vẫn có thể có sai khác nhỏ do thực thi song song trên phần cứng GPU.
- **B:** Giá trị hợp lệ của `temperature` là từ `0.0` đến `1.0`; `-1.0` sẽ gây lỗi validation 400.
- **C:** Ngay cả khi `temperature: 0.0`, tính toán dấu phẩy động trên GPU phân tán không đảm bảo 100% deterministic tuyệt đối.
- **D:** `temperature` chỉ kiểm soát độ ngẫu nhiên khi lấy mẫu token, không vô hiệu hóa `system` prompt hay ép gọi tool.

</details>

### Câu 5 `medium`

A developer wants Claude to stop generating immediately if it outputs the delimiter `</answer>` without including that delimiter in the returned text. Which Messages API parameter achieves this?

- **A.** `max_tokens: 1`
- **B.** `stop_sequences: ["</answer>"]`
- **C.** `system_stop: "</answer>"`
- **D.** `end_turn_tokens: ["</answer>"]`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên muốn Claude ngừng sinh văn bản ngay lập tức nếu nó xuất ra chuỗi phân cách `</answer>` mà không bao gồm chuỗi phân cách đó trong văn bản trả về. Tham số nào của Messages API giúp đạt được điều này?

**Đáp án đúng:** **B**

Tham số `stop_sequences` cho phép bạn định nghĩa danh sách chuỗi kích hoạt dừng sinh token sớm. Khi khớp, `stop_reason` sẽ là `"stop_sequence"` và `stop_sequence` trong response cho biết chuỗi nào đã khớp.

- **A:** `max_tokens: 1` chỉ cắt cứng sau 1 token, không dừng theo chuỗi ký tự `</answer>`.
- **B (Đúng):** `stop_sequences` là mảng các chuỗi tùy chỉnh; khi model sinh tới chuỗi này, quá trình sinh dừng ngay lập tức (`stop_reason: "stop_sequence"`) và chuỗi dừng không nằm trong `content` trả về.
- **C:** Messages API không có tham số `system_stop`.
- **D:** Messages API không có tham số nào tên là `end_turn_tokens`.

</details>

### Câu 6 `hard`

A company deploys Claude via Amazon Bedrock and Google Cloud Vertex AI in addition to the direct Anthropic API. Which statement accurately describes using the official Anthropic SDKs across these platforms?

- **A.** Prompt Caching and Tool Use are completely unavailable when calling Claude through Bedrock or Vertex AI.
- **B.** You must pass your `ANTHROPIC_API_KEY` inside the `x-api-key` header when calling Amazon Bedrock.
- **C.** Dedicated client classes (`AnthropicBedrock`, `AnthropicVertex`) preserve the Messages API interface while handling cloud IAM/OAuth.
- **D.** The Anthropic SDKs only work with `api.anthropic.com`; Bedrock and Vertex AI require completely different HTTP request schemas and payloads.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty triển khai Claude thông qua Amazon Bedrock và Google Cloud Vertex AI bên cạnh Anthropic API trực tiếp. Phát biểu nào mô tả chính xác việc sử dụng các Anthropic SDK chính thức trên các nền tảng này?

**Đáp án đúng:** **C**

Anthropic SDK chính thức (Python/TypeScript) cung cấp `AnthropicBedrock` và `AnthropicVertex`, giúp code ứng dụng giữ nguyên cấu trúc Messages API trong khi tận dụng cơ chế xác thực và billing của AWS hoặc Google Cloud.

- **A:** Prompt Caching và Tool Use đều được hỗ trợ trên Bedrock và Vertex AI (tùy theo phiên bản model được bật).
- **B:** Amazon Bedrock dùng AWS credentials (IAM / SigV4), không dùng `ANTHROPIC_API_KEY`.
- **C (Đúng):** Anthropic SDK cung cấp các client chuyên biệt (`AnthropicBedrock`, `AnthropicVertex`) giữ nguyên giao diện `messages.create` nhưng tự động xử lý xác thực theo chuẩn AWS IAM hoặc GCP OAuth.
- **D:** Anthropic SDK chính thức có hỗ trợ trực tiếp cả Amazon Bedrock (`AnthropicBedrock`) và Vertex AI (`AnthropicVertex`) với cấu trúc Messages API tương đồng.

</details>

### Câu 7 `easy`

A developer is making raw HTTP requests using `curl` to `https://api.anthropic.com/v1/messages` instead of using an official SDK. Which two authentication and versioning headers must be included in every request?

- **A.** `x-anthropic-token` and `api-tier`
- **B.** `x-api-key` and `anthropic-version`
- **C.** `Bearer-Key` and `accept-encoding`
- **D.** `Authorization: Basic` and `x-claude-model`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên đang thực hiện các HTTP request thô bằng `curl` tới `https://api.anthropic.com/v1/messages` thay vì dùng SDK chính thức. Hai header xác thực và định phiên bản nào phải được bao gồm trong mọi request?

**Đáp án đúng:** **B**

Mọi HTTP request trực tiếp tới `api.anthropic.com/v1/messages` đều yêu cầu header `x-api-key` và `anthropic-version` (các SDK chính thức tự động đính kèm hai header này).

- **A:** Đây không phải tên header hợp lệ của Anthropic API.
- **B (Đúng):** Khi gọi trực tiếp Anthropic REST API qua HTTP, bắt buộc phải truyền `x-api-key` (chứa API key) và `anthropic-version` (ví dụ `2023-06-01`), cùng `content-type: application/json`.
- **C:** Anthropic API dùng header `x-api-key` và yêu cầu `anthropic-version`.
- **D:** Anthropic API không dùng HTTP Basic Auth và không truyền tên model qua header `x-claude-model`.

</details>

### Câu 8 `medium`

A developer uses the Anthropic Python SDK (`Anthropic()`) in a script and wants to test a beta feature or custom header without modifying the global SDK source code. How does the SDK allow enabling beta features cleanly?

- **A.** Append `?beta=true` to the `model` string parameter.
- **B.** Beta features can only be enabled by emailing Anthropic support for every API call.
- **C.** Put the beta feature name inside the `temperature` parameter.
- **D.** Use `client.beta.messages.create(..., betas=["..."])` or pass `extra_headers`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên sử dụng Anthropic Python SDK (`Anthropic()`) trong một script và muốn thử nghiệm một tính năng beta hoặc custom header mà không sửa mã nguồn SDK toàn cục. SDK cho phép bật các tính năng beta một cách gọn gàng như thế nào?

**Đáp án đúng:** **D**

Các tính năng beta của Anthropic API được kích hoạt thông qua header `anthropic-beta`, và SDK chính thức hỗ trợ sẵn qua `client.beta.messages.create(..., betas=[...])`.

- **A:** Tên `model` không dùng query string `?beta=true`.
- **B:** Các tính năng beta công khai được bật trực tiếp bằng header `anthropic-beta` hoặc `client.beta.messages`.
- **C:** `temperature` chỉ nhận số thực từ 0.0 đến 1.0.
- **D (Đúng):** Anthropic SDK cung cấp namespace `client.beta.messages` với tham số `betas=[...]` (tự động gửi header `anthropic-beta`) hoặc hỗ trợ `extra_headers` cho từng lời gọi.

</details>

### Câu 9 `hard`

An application uses Anthropic server-side tools (such as Web Search or Code Execution) and receives a response with `stop_reason: "pause_turn"`. What should the application do next?

- **A.** Append the assistant's response to the `messages` history and send another `messages.create` request to let Claude continue its turn.
- **B.** Execute the server-side tool locally on the client and return a `tool_result` block with `is_error: false` to resume the agent turn.
- **C.** Lower `max_tokens` to 100 and resend only the system prompt.
- **D.** Treat `pause_turn` as a fatal error and abort the request.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng sử dụng các server-side tool của Anthropic (như Web Search hoặc Code Execution) và nhận được phản hồi với `stop_reason: "pause_turn"`. Ứng dụng nên làm gì tiếp theo?

**Đáp án đúng:** **A**

`stop_reason: "pause_turn"` xảy ra khi Claude tạm dừng một lượt chạy server-side tool dài. Ứng dụng chỉ cần giữ nguyên nội dung `assistant` trả về, đưa vào `messages` và gửi lại request để tiếp tục.

- **A (Đúng):** Khi server-side tool chạy đạt ngưỡng vòng lặp nội bộ trong một lượt, API trả về `stop_reason: "pause_turn"`. Client chỉ cần nối message `assistant` đó vào lịch sử `messages` và gọi lại API để Claude tiếp tục.
- **B:** Server-side tools do Anthropic tự thực thi phía server; client không tự chạy lại chúng.
- **C:** Làm vậy sẽ mất toàn bộ ngữ cảnh đang chạy dở.
- **D:** `pause_turn` không phải lỗi; nó báo hiệu server-side tool loop tạm dừng sau giới hạn bước nội bộ.

</details>

### Câu 10 `hard`

A multi-tenant SaaS product wants to help Anthropic's abuse-monitoring systems distinguish between individual end-users without exposing personally identifiable information (PII). Which Messages API field is designed for this?

- **A.** Setting `model` to the user's ID
- **B.** Prepending the user's full name and SSN to `system`
- **C.** `metadata: {"user_id": "<hashed-or-opaque-user-uuid>"}`
- **D.** Passing the user's raw email address in the `x-api-key` header

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một sản phẩm SaaS đa người thuê (multi-tenant) muốn giúp hệ thống giám sát lạm dụng của Anthropic phân biệt giữa từng người dùng cuối mà không làm lộ thông tin định danh cá nhân (PII). Trường nào của Messages API được thiết kế cho mục đích này?

**Đáp án đúng:** **C**

Trường `metadata.user_id` trong Messages API cho phép truyền một ID ẩn danh (như UUID/hash) đại diện cho end-user nhằm hỗ trợ phát hiện lạm dụng mà vẫn bảo vệ quyền riêng tư.

- **A:** `model` phải là mã model hợp lệ của Anthropic.
- **B:** Không được nhét PII thật vào `system` prompt.
- **C (Đúng):** Tham số `metadata.user_id` dùng để truyền mã định danh ẩn danh (UUID hoặc hash, không chứa email/tên thật) giúp theo dõi và cô lập rủi ro lạm dụng theo từng end-user.
- **D:** `x-api-key` chỉ chứa API secret key.

</details>

### Câu 11 `easy`

In the `usage` object of a Messages API response, which fields represent the total uncached input tokens, cache-read tokens, and generated output tokens?

- **A.** `prompt_chars`, `cached_chars`, and `completion_chars` in usage
- **B.** `input_tokens`, `cache_read_input_tokens`, and `output_tokens`
- **C.** `request_tokens`, `cached_words`, and `response_words`
- **D.** `total_bytes`, `cached_bytes`, and `billed_seconds`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong đối tượng `usage` của một phản hồi Messages API, các trường nào đại diện cho tổng số input token chưa được cache, số token đọc từ cache và số output token được sinh ra?

**Đáp án đúng:** **B**

Để tính chính xác chi phí một request có dùng Prompt Caching, cần cộng 3 loại input token (`input_tokens` + `cache_creation_input_tokens` + `cache_read_input_tokens` theo đơn giá từng loại) và `output_tokens`.

- **A:** Anthropic API tính theo token, không phải ký tự (chars).
- **B (Đúng):** Đối tượng `usage` trả về `input_tokens` (token đầu vào chưa cache), `cache_creation_input_tokens` (tạo cache), `cache_read_input_tokens` (đọc từ cache) và `output_tokens` (token đầu ra).
- **C:** Đây không phải tên trường hợp lệ trong `usage`.
- **D:** API không tính theo bytes hay giây trong `usage`.

</details>

### Câu 12 `medium`

A developer switches from `api.anthropic.com` to Amazon Bedrock for Claude inference. What change is required for the `model` parameter?

- **A.** Pass the AWS IAM Role ARN as the `model` value.
- **B.** Omit the `model` parameter completely because Amazon Bedrock auto-selects the latest Claude model version in your region.
- **C.** Use the Bedrock model or inference profile ID (e.g., `us.anthropic.claude-sonnet-...-v1:0`) instead of the direct alias.
- **D.** Set `model` to `"bedrock-default"` in `AnthropicBedrock().messages.create`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên chuyển từ `api.anthropic.com` sang Amazon Bedrock cho việc suy luận Claude. Cần thay đổi gì đối với tham số `model`?

**Đáp án đúng:** **C**

Khi gọi Claude qua Amazon Bedrock hoặc Google Cloud Vertex AI, code vẫn dùng chung cấu trúc Messages API thông qua `AnthropicBedrock`/`AnthropicVertex`, nhưng chuỗi `model` phải tuân theo định danh model của nền tảng đám mây đó.

- **A:** IAM Role ARN dùng để xác thực AWS, không phải tên model.
- **B:** `model` luôn là tham số bắt buộc.
- **C (Đúng):** Amazon Bedrock sử dụng định dạng model ID hoặc cross-region inference profile ID riêng (có tiền tố khu vực/nhà cung cấp như `anthropic.claude-...` hoặc `us.anthropic.claude-...`).
- **D:** `bedrock-default` không phải mã model hợp lệ.

</details>

---

[Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md)
