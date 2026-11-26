# Bài tập tình huống — Module 5: Model Selection (Opus/Sonnet/Haiku), Routing & Token Counting

> Lựa chọn tối ưu giữa Claude Opus, Sonnet và Haiku theo độ phức tạp/độ trễ/chi phí, kiến trúc Model Routing đa tầng và kiểm tra dung lượng miễn phí với Token Counting API.
> **Số câu hỏi:** 5 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

An engineering team needs to verify whether a large user document plus system instructions will fit within Claude's context window and estimate input costs before executing the actual generation. Which endpoint should they call?

- **A.** POST /v1/messages with `max_tokens: 0`
- **B.** GET /v1/models
- **C.** POST /v1/messages/count_tokens
- **D.** POST /v1/messages/batches

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ thuật cần kiểm tra xem một tài liệu lớn của người dùng cùng với hướng dẫn hệ thống (system instructions) có nằm gọn trong cửa sổ ngữ cảnh (context window) của Claude hay không và ước tính chi phí đầu vào trước khi thực thi việc sinh văn bản thực tế. Họ nên gọi endpoint nào?

**Đáp án đúng:** **C**

Token Counting API (`POST /v1/messages/count_tokens` hoặc `client.messages.count_tokens(...)`) tính chính xác số lượng input token cho toàn bộ payload (bao gồm system prompt, tools, images, PDF, messages) trước khi gọi `messages.create`.

- **A:** Messages API yêu cầu `max_tokens >= 1`, không chấp nhận giá trị 0.
- **B:** Endpoint `/v1/models` chỉ liệt kê danh sách các model khả dụng và thông tin cơ bản, không đếm token của payload.
- **C (Đúng):** Endpoint `/v1/messages/count_tokens` (Token Counting API) cho phép đếm chính xác số input tokens của `messages`, `system` và `tools` miễn phí mà không chạy inference.
- **D:** Message Batches API dùng để chạy inference bất đồng bộ hàng loạt, không phải để đếm token trước.

</details>

### Câu 2 `easy`

A customer support platform needs to classify incoming tickets into one of 12 categories in under 400 milliseconds per ticket at high volume and minimal cost. Which Claude model tier is best suited for this workload?

- **A.** Claude Opus via Message Batches API
- **B.** Claude Sonnet with a 32,000-token Extended Thinking budget
- **C.** Claude Opus
- **D.** Claude Haiku

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng hỗ trợ khách hàng cần phân loại các ticket gửi đến vào một trong 12 danh mục trong thời gian dưới 400 mili-giây mỗi ticket với khối lượng lớn và chi phí tối thiểu. Tầng mô hình (model tier) Claude nào phù hợp nhất cho workload này?

**Đáp án đúng:** **D**

Trong gia đình Claude, **Haiku** tối ưu tốc độ và chi phí cho các tác vụ nhẹ/lưu lượng cao (classification, routing, moderation); **Sonnet** cân bằng thông minh và tốc độ cho phần lớn tác vụ coding/agent; **Opus** dành cho suy luận chuyên sâu và bài toán phức tạp nhất.

- **A:** Message Batches API có độ trễ lên tới 24 giờ, không đáp ứng yêu cầu dưới 400ms.
- **B:** Bật Extended Thinking với budget 32k tokens cho tác vụ phân loại đơn giản sẽ làm tăng mạnh độ trễ và chi phí.
- **C:** Claude Opus là model mạnh nhất cho suy luận sâu và tác vụ phức tạp, nhưng chi phí cao và độ trễ lớn hơn, không tối ưu cho phân loại tốc độ cao.
- **D (Đúng):** Claude Haiku được tối ưu cho tốc độ phản hồi cực nhanh và chi phí thấp nhất, rất phù hợp cho tác vụ phân loại, trích xuất đơn giản ở lưu lượng lớn.

</details>

### Câu 3 `medium`

An engineering lead is designing a multi-model routing architecture to optimize both cost and accuracy. Which TWO use cases are best routed to Claude Haiku rather than Claude Opus? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Debugging an intermittent race condition in distributed C++ lock-free data structures
- **B.** Real-time intent classification and language detection on high-volume chat messages
- **C.** Architecting a complex multi-repository database migration with subtle concurrency edge cases
- **D.** Deep legal contract redlining requiring nuanced multi-clause synthesis across 150 pages
- **E.** Fast initial screening and summarization of incoming webhook payloads before deciding whether to escalate to a larger model

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một trưởng nhóm kỹ thuật đang thiết kế kiến trúc định tuyến đa mô hình (multi-model routing) để tối ưu hóa cả chi phí và độ chính xác. HAI trường hợp sử dụng nào phù hợp nhất để định tuyến tới Claude Haiku thay vì Claude Opus? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, E**

Kiến trúc định tuyến đa model (model routing) dùng **Claude Haiku** cho các tác vụ nhanh, chi phí thấp, lặp lại nhiều (intent classification, triage, simple extraction) và chỉ nâng cấp (escalate) lên **Sonnet/Opus** cho các bài toán suy luận sâu.

- **A:** Gỡ lỗi race condition phức tạp đòi hỏi khả năng suy luận sâu của Opus/Sonnet.
- **B (Đúng):** Phân loại ý định và nhận diện ngôn ngữ theo thời gian thực cần độ trễ cực thấp và chi phí rẻ, rất hợp với Claude Haiku.
- **C:** Bài toán kiến trúc phức tạp và nhiều edge case cần năng lực suy luận cao của Sonnet hoặc Opus.
- **D:** Phân tích hợp đồng pháp lý dài và tinh tế phù hợp với Opus hoặc Sonnet hơn là Haiku.
- **E (Đúng):** Dùng Haiku làm tầng lọc/tóm tắt ban đầu (triage/routing) giúp giảm tải chi phí cho các model lớn như Sonnet/Opus.

</details>

### Câu 4 `easy`

Which Claude model family tier offers the best balance of strong reasoning/coding intelligence and fast response speed for general-purpose production agents and RAG applications?

- **A.** Claude Haiku
- **B.** Claude Opus
- **C.** Claude Instant 1.0
- **D.** Claude Sonnet

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Tầng mô hình (model family tier) Claude nào mang lại sự cân bằng tốt nhất giữa trí tuệ suy luận/lập trình mạnh mẽ và tốc độ phản hồi nhanh cho các agent production đa dụng và ứng dụng RAG?

**Đáp án đúng:** **D**

Claude Sonnet là lựa chọn mặc định (workhorse) cho đại đa số ứng dụng AI production như coding assistant, RAG nâng cao và multi-step agents.

- **A:** Haiku ưu tiên tốc độ tối đa và chi phí siêu thấp cho các tác vụ đơn giản hơn.
- **B:** Opus là dòng cao cấp nhất cho bài toán suy luận cực khó, chi phí và độ trễ cao hơn Sonnet.
- **C:** Claude Instant là thế hệ cũ đã ngừng khuyến nghị (deprecated).
- **D (Đúng):** Claude Sonnet là dòng model cân bằng tối ưu giữa năng lực thông minh (coding, agentic workflows, phân tích) với tốc độ và chi phí cho phần lớn ứng dụng production.

</details>

### Câu 5 `medium`

A developer wants to reduce latency and output token costs on a simple yes/no classification task without losing accuracy. Which combination of settings is most appropriate?

- **A.** Use Claude Haiku, disable Extended Thinking, set `temperature: 0.0`, and use a small `max_tokens` (e.g., 64) or Structured Outputs.
- **B.** Use Claude Opus with `budget_tokens: 16000` and `max_tokens: 32000`.
- **C.** Submit each single real-time user click to the Message Batches API.
- **D.** Use `temperature: 1.0` and ask Claude to write a 5-paragraph analytical essay before answering yes or no.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên muốn giảm độ trễ và chi phí output token cho một tác vụ phân loại có/không (yes/no) đơn giản mà không làm giảm độ chính xác. Tổ hợp thiết lập nào là phù hợp nhất?

**Đáp án đúng:** **A**

Tối ưu độ trễ và chi phí cho tác vụ đơn giản: chọn **Haiku**, giữ **output ngắn gọn** (tránh giải thích dài dòng khi không cần thiết), đặt **`temperature: 0.0`** và không bật Extended Thinking.

- **A (Đúng):** Dùng Haiku + tắt Extended Thinking + `temperature: 0.0` + `max_tokens` gọn (hoặc Structured Output ngắn) giúp phản hồi gần như tức thì với chi phí thấp nhất.
- **B:** Cấu hình này quá nặng nề, chậm và đắt đỏ cho bài toán phân loại yes/no.
- **C:** Message Batches API không phù hợp cho tác vụ tương tác cần kết quả ngay.
- **D:** Bắt viết 5 đoạn văn sẽ làm tăng vọt độ trễ và chi phí output tokens.

</details>

---

[Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md)
