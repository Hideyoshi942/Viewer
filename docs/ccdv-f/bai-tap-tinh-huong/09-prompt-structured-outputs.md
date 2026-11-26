# Bài tập tình huống — Module 9: Prompt Engineering, XML Tags & Structured Outputs

> Thiết kế System Prompt rõ ràng, phân tách chỉ dẫn và dữ liệu bằng XML tags, Multishot (Few-shot) prompting và ép đầu ra 100% tuân thủ JSON Schema với Structured Outputs.
> **Số câu hỏi:** 8 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `easy`

When passing multiple reference documents and user instructions to Claude in a single prompt, why does Anthropic recommend wrapping sections in XML tags such as `<document>` and `<instructions>`?

- **A.** Messages API rejects prompts that do not contain at least one XML tag.
- **B.** Claude was trained to recognize XML tags as structural boundaries, reducing ambiguity between instructions and data.
- **C.** The Anthropic API automatically strips all XML tags from the prompt before billing input tokens.
- **D.** XML tags automatically activate Prompt Caching without using `cache_control`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Khi truyền nhiều tài liệu tham khảo và hướng dẫn người dùng cho Claude trong một prompt duy nhất, tại sao Anthropic khuyến nghị bọc các phần trong các thẻ XML như `<document>` và `<instructions>`?

**Đáp án đúng:** **B**

Sử dụng thẻ XML (như `<context>`, `<document>`, `<instructions>`, `<output_format>`) giúp Claude phân biệt chính xác đâu là ngữ cảnh, đâu là ví dụ và đâu là yêu cầu chính.

- **A:** Messages API chấp nhận văn bản thuần (plain text) bình thường; XML tags là một kỹ thuật prompt engineering được khuyến nghị.
- **B (Đúng):** Claude được huấn luyện rất tốt để hiểu các thẻ XML (`<document>`, `<example>`, `<instructions>`), giúp phân tách rạch ròi giữa chỉ thị và dữ liệu đầu vào, giảm nhầm lẫn và tăng độ chính xác.
- **C:** Thẻ XML vẫn được tính là input tokens bình thường, không bị cắt bỏ trước khi tính phí.
- **D:** XML tags không tự kích hoạt Prompt Caching; vẫn phải khai báo `cache_control`.

</details>

### Câu 2 `medium`

A developer needs Claude to reliably return a strictly typed JSON object matching a specific schema for downstream database insertion. Which approach provides the strongest structural guarantee?

- **A.** Ask Claude in the `system` prompt: "Please output valid JSON only and do not include markdown code fence backticks."
- **B.** Wrap the `user` message in `<json>` tags without specifying any schema.
- **C.** Use Structured Outputs (constrained JSON Schema decoding) or forced Tool Use with a defined `input_schema`.
- **D.** Set `temperature: 1.0` and retry until `json.loads()` succeeds.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên cần Claude trả về một cách đáng tin cậy một đối tượng JSON có kiểu dữ liệu chặt chẽ khớp với một schema cụ thể để chèn vào cơ sở dữ liệu phía sau. Cách tiếp cận nào mang lại sự đảm bảo cấu trúc mạnh mẽ nhất?

**Đáp án đúng:** **C**

Để ép Claude trả về dữ liệu có cấu trúc chuẩn xác cho hệ thống downstream, giải pháp mạnh nhất là dùng **Structured Outputs** (JSON Schema) hoặc **Forced Tool Use** kết hợp JSON Schema validation.

- **A:** Chỉ nhắc bằng lời trong prompt vẫn có xác suất nhỏ model thêm lời dẫn hoặc sai kiểu dữ liệu.
- **B:** Chỉ bọc thẻ `<json>` không đảm bảo các trường và kiểu dữ liệu khớp với schema của database.
- **C (Đúng):** Dùng Structured Outputs (`output_format` JSON Schema) hoặc ép gọi tool (`tool_choice: {"type": "tool", "name": ...}`) với `input_schema` chặt chẽ giúp đảm bảo đầu ra tuân thủ đúng cấu trúc JSON Schema.
- **D:** Tăng `temperature: 1.0` làm tăng tính ngẫu nhiên và dễ hỏng JSON hơn.

</details>

### Câu 3 `medium`

A developer notices Claude occasionally hallucinates facts when a user asks a question not covered by the provided knowledge base. Which prompt instruction best reduces hallucinations?

- **A.** Instruct Claude: "Answer only from `<context>`. If not explicitly supported there, state you lack enough information."
- **B.** Increase `temperature` to `1.0` so Claude considers more creative possibilities.
- **C.** Remove the `system` prompt completely and pass only raw user queries.
- **D.** Instruct Claude: "Always provide a confident, helpful answer even if you have to guess from your general training knowledge."

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên nhận thấy Claude thỉnh thoảng bịa đặt thông tin (hallucinate) khi người dùng hỏi một câu hỏi không có trong cơ sở tri thức được cung cấp. Hướng dẫn prompt nào giúp giảm thiểu hallucination tốt nhất?

**Đáp án đúng:** **A**

Để giảm thiểu hallucination trong RAG và Q&A, cần áp dụng kỹ thuật **Grounding + Permission to Abstain**: yêu cầu bám sát tài liệu cung cấp, trích dẫn nguồn và cho phép model nói không biết khi thiếu dữ kiện.

- **A (Đúng):** Cho phép Claude từ chối trả lời một cách rõ ràng (permission to say "I don't know") và yêu cầu bám sát `<context>` (grounding) là cách hiệu quả nhất để giảm ảo giác.
- **B:** Tăng `temperature` lên 1.0 làm tăng độ sáng tạo/ngẫu nhiên, khiến model dễ bịa thông tin hơn.
- **C:** Bỏ `system` prompt làm mất đi các quy tắc ràng buộc grounding.
- **D:** Ép model luôn phải trả lời tự tin dù phải đoán sẽ trực tiếp gây ra hiện tượng bịa đặt thông tin (hallucination).

</details>

### Câu 4 `medium`

A classification system struggles with edge-case formatting nuances even after detailed written instructions. Which prompt engineering technique should the developer add next?

- **A.** Repeat the exact same system instruction 10 times in uppercase letters to increase attention weight on formatting.
- **B.** Few-shot prompting: include 3 to 5 diverse, representative input/output examples wrapped in `<examples>` tags.
- **C.** Pass `stream=True` on `messages.create` so Claude streams edge-case formatting token by token.
- **D.** Lower `max_tokens` to 5 tokens so Claude cannot generate extra commentary.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hệ thống phân loại gặp khó khăn với các sắc thái định dạng trường hợp biên (edge-case) ngay cả sau khi đã có hướng dẫn chi tiết bằng văn bản. Kỹ thuật prompt engineering nào lập trình viên nên bổ sung tiếp theo?

**Đáp án đúng:** **B**

**Few-shot prompting** (multishot examples) giúp Claude học chính xác mẫu định dạng, giọng văn và cách phân loại các ca biên thông qua ví dụ thực tế thay vì chỉ đọc mô tả trừu tượng.

- **A:** Lặp lại chỉ thị viết hoa nhiều lần lãng phí token và kém hiệu quả hơn nhiều so với cung cấp ví dụ mẫu cụ thể.
- **B (Đúng):** Few-shot prompting (cung cấp 3-5 ví dụ đa dạng, đúng định dạng trong thẻ `<examples>`) là kỹ thuật mạnh nhất để chuẩn hóa format và xử lý các trường hợp biên khó diễn đạt bằng lời.
- **C:** Streaming không làm thay đổi độ chính xác hay định dạng đầu ra của model.
- **D:** Giảm `max_tokens` xuống 5 chỉ làm cắt cụt câu trả lời.

</details>

### Câu 5 `medium`

A developer wants Claude to output a concise JSON summary without conversational preamble like "Here is the JSON you requested:". When Structured Outputs is not used, which technique works reliably across models?

- **A.** Set `max_tokens: 5` so Claude stops generating right after opening the JSON brace.
- **B.** Instruct Claude in `system` to output only raw JSON matching the schema, or use a forced tool call with `input_schema`.
- **C.** Add 20 exclamation marks and uppercase commands to the `user` prompt instructing Claude to skip all conversational preamble output.
- **D.** Pass `stop_sequences: ["{"]` to suppress all conversational text before the JSON.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên muốn Claude xuất ra một bản tóm tắt JSON ngắn gọn mà không có lời mở đầu giao tiếp như "Here is the JSON you requested:". Khi không sử dụng Structured Outputs, kỹ thuật nào hoạt động đáng tin cậy trên các mô hình?

**Đáp án đúng:** **B**

Để loại bỏ lời chào đầu và đảm bảo JSON sạch: ưu tiên dùng **Structured Outputs** hoặc **Forced Tool Use**; nếu dùng text thuần, hãy chỉ thị rõ ràng và cung cấp ví dụ XML/JSON mẫu.

- **A:** `max_tokens: 5` sẽ cắt cụt toàn bộ JSON.
- **B (Đúng):** Chỉ thị rõ ràng không thêm lời dẫn kết hợp ví dụ mẫu, hoặc tối ưu nhất là dùng Structured Outputs / forced Tool Use (`input_schema`) để nhận trực tiếp đối tượng JSON sạch.
- **C:** Dấu chấm than không đảm bảo định dạng đầu ra.
- **D:** Đặt `{` làm `stop_sequence` sẽ làm model dừng ngay khi chuẩn bị mở ngoặc JSON!

</details>

### Câu 6 `medium`

Why is explaining *why* a rule exists in a system prompt (e.g., "Do not use markdown tables because the output is read aloud by a screen reader") often more effective than a terse command ("NO TABLES")?

- **A.** It reduces billed `input_tokens` to zero whenever the system prompt explains the underlying rationale.
- **B.** Claude ignores any system prompt sentence that contains fewer than 10 words during instruction following.
- **C.** Providing motivation helps Claude generalize the intent to edge cases (like avoiding ASCII art) rather than following a brittle rule.
- **D.** Longer sentences automatically trigger Prompt Caching on `system` prompts even when total tokens are under 100 tokens in length overall.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Tại sao việc giải thích *tại sao* một quy tắc tồn tại trong system prompt (ví dụ: "Do not use markdown tables because the output is read aloud by a screen reader") thường hiệu quả hơn một mệnh lệnh cộc lốc ("NO TABLES")?

**Đáp án đúng:** **C**

Một nguyên tắc cốt lõi của Prompt Engineering trên Claude là **Explain the "Why"**: nêu rõ mục đích/bối cảnh của ràng buộc để mô hình khái quát hóa chính xác cho mọi tình huống phát sinh.

- **A:** Giải thích thêm làm tăng nhẹ vài input token, không giảm về 0.
- **B:** Claude vẫn đọc các câu ngắn, nhưng thiếu ngữ cảnh lý do sẽ khó xử lý ca biên.
- **C (Đúng):** Giải thích lý do đằng sau quy tắc giúp Claude hiểu đúng mục đích thực sự, từ đó tự suy rộng ra các trường hợp biên tương tự (ví dụ cũng tránh luôn bảng ASCII) thay vì máy móc.
- **D:** Ngưỡng tối thiểu của Prompt Caching vẫn là 1,024–4,096 tokens.

</details>

### Câu 7 `easy`

Which Anthropic Messages API parameter is specifically intended for setting the AI's persistent role, persona, rules, and formatting guidelines across a conversation?

- **A.** `stop_sequences`
- **B.** `metadata`
- **C.** `top_p`
- **D.** `system`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Tham số nào của Anthropic Messages API được thiết kế chuyên biệt để thiết lập vai trò, nhân vật (persona), các quy tắc và hướng dẫn định dạng xuyên suốt một cuộc hội thoại cho AI?

**Đáp án đúng:** **D**

Luôn đặt hướng dẫn vai trò, quy tắc hệ thống và ngữ cảnh nền vào tham số **`system`** (top-level), tách biệt khỏi lượt hội thoại của **`user`** trong `messages`.

- **A:** `stop_sequences` chỉ dùng để dừng sinh token khi gặp chuỗi chỉ định.
- **B:** `metadata` chỉ chứa `user_id` phục vụ theo dõi.
- **C:** `top_p` là tham số lấy mẫu xác suất (nucleus sampling).
- **D (Đúng):** Tham số `system` cấp cao nhất được thiết kế riêng để định nghĩa vai trò, quy tắc hành vi, giọng văn và định dạng xuyên suốt phiên hội thoại.

</details>

### Câu 8 `medium`

A developer uses Structured Outputs with a JSON Schema for extracting customer addresses. What happens if an optional field like `apartment_number` is missing from the input text and the schema marks it as `nullable` / optional?

- **A.** The API crashes with HTTP 500 Internal Server Error whenever any optional schema field is absent from the input text in the user prompt.
- **B.** Constrained decoding ensures schema compliance (returning `null` or omitting the key) rather than producing invalid types or broken JSON.
- **C.** The entire structured JSON response is automatically converted to XML by the Messages API.
- **D.** Claude automatically invents a random placeholder apartment number to satisfy the JSON Schema.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên sử dụng Structured Outputs với một JSON Schema để trích xuất địa chỉ khách hàng. Điều gì xảy ra nếu một trường tùy chọn như `apartment_number` bị thiếu trong văn bản đầu vào và schema đánh dấu nó là `nullable` / tùy chọn?

**Đáp án đúng:** **B**

Thiết kế JSON Schema tốt cho trích xuất dữ liệu nên cho phép `null` (hoặc không đưa vào `required`) với các trường có thể vắng mặt trong tài liệu gốc, giúp model trung thực mà vẫn hợp lệ schema.

- **A:** Không có lỗi 500 khi dữ liệu thiếu trường tùy chọn.
- **B (Đúng):** Structured Outputs dùng constrained decoding bám sát JSON Schema, do đó khi trường được khai báo optional hoặc nullable (`["string", "null"]`), model sẽ trả về `null` hoặc bỏ qua key hợp lệ thay vì bịa giá trị hay làm hỏng JSON.
- **C:** Structured Outputs luôn xuất JSON đúng schema.
- **D:** Khi schema cho phép `null` và prompt hướng dẫn không bịa đặt, model sẽ trả `null`.

</details>

---

[Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md)
