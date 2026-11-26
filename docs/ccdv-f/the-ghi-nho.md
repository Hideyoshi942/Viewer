# Thẻ ghi nhớ (Flashcards) — CCDV-F

> 32 thẻ · Đọc mặt trước, tự trả lời rồi mở đáp án.

## Module 1: Messages API & Stateless Conversation Architecture

**1. Claude Messages API (POST /v1/messages) quản lý lịch sử hội thoại theo cơ chế nào?**

<details><summary>Xem đáp án</summary>

Hoàn toàn Stateless. Ứng dụng client phải tự lưu trữ lịch sử và gửi lại toàn bộ mảng messages (xen kẽ vai trò user và assistant) trong mỗi request.

</details>

## Module 2: Streaming (SSE) & Message Batches API

**2. Thứ tự chuẩn của các sự kiện Server-Sent Events (SSE) khi bật stream: true trong Messages API?**

<details><summary>Xem đáp án</summary>

message_start -> content_block_start -> content_block_delta -> content_block_stop -> message_delta -> message_stop.

</details>

**3. Khi nào nên dùng Message Batches API và lợi ích chi phí/quy mô của nó là gì?**

<details><summary>Xem đáp án</summary>

Dùng cho tác vụ bất đồng bộ không cần phản hồi tức thì (evals, phân loại hàng loạt). Giảm 50% chi phí, xử lý trong tối đa 24 giờ, hỗ trợ tới 100,000 requests hoặc 256 MB/batch.

</details>

## Module 4: Error Handling, Rate Limits & Retry Strategies

**4. Phân biệt chiến lược retry giữa lỗi HTTP 400 và HTTP 429/529?**

<details><summary>Xem đáp án</summary>

HTTP 400 (invalid_request_error) KHÔNG retry vì lỗi payload/schema; HTTP 429 (rate_limit_error) và 529 (overloaded_error) NÊN retry với Exponential Backoff + Jitter (tôn trọng header retry-after).

</details>

## Module 5: Model Selection (Opus/Sonnet/Haiku), Routing & Token Counting

**5. Nguyên tắc chọn giữa Claude Opus, Sonnet và Haiku trong hệ thống production?**

<details><summary>Xem đáp án</summary>

Haiku: độ trễ cực thấp, chi phí rẻ nhất (routing, phân loại). Sonnet: cân bằng tối ưu trí tuệ/tốc độ/giá (mặc định cho coding, RAG, agents). Opus: suy luận sâu và phức tạp nhất.

</details>

**6. Token Counting API (POST /v1/messages/count_tokens) có tính phí không và dùng để làm gì?**

<details><summary>Xem đáp án</summary>

Hoàn toàn miễn phí. Dùng để tính chính xác số input tokens trước khi gọi messages.create, kiểm tra giới hạn context window hoặc xác nhận đủ ngưỡng Prompt Caching.

</details>

## Module 6: Prompt Caching & Cost/Latency Optimization

**7. Thứ tự prefix matching của Prompt Caching và giới hạn số cache_control breakpoints?**

<details><summary>Xem đáp án</summary>

Prefix được tính theo thứ tự: tools -> system -> messages. Tối đa 4 breakpoints (cache_control: {type: 'ephemeral'}). Mọi nội dung động phải đặt ở cuối để tránh cache miss.

</details>

**8. Ngưỡng token tối thiểu để kích hoạt Prompt Caching và tỷ lệ tiết kiệm chi phí đọc cache?**

<details><summary>Xem đáp án</summary>

Tối thiểu 1,024 tokens (Sonnet/Opus) hoặc 2,048 tokens (Haiku). Đọc cache (cache_read_input_tokens) chỉ tốn 10% giá chuẩn (giảm 90% chi phí input) và giảm tới 85% TTFT.

</details>

## Module 7: Agentic Workflows, stop_reason Loop & Multi-Agent Patterns

**9. Sự khác biệt cốt lõi giữa Workflow và Autonomous Agent theo Anthropic?**

<details><summary>Xem đáp án</summary>

Workflow điều khiển LLM và tools theo luồng code định sẵn (Prompt Chaining, Routing, Parallelization). Agent để LLM tự quyết định quy trình và gọi tool lặp lại cho đến khi xong.

</details>

**10. Trong Agentic Loop, khi response.stop_reason trả về 'tool_use' vs 'end_turn', ứng dụng phải làm gì?**

<details><summary>Xem đáp án</summary>

tool_use: trích xuất các tool_use block, thực thi tool và gửi lại tool_result trong user message tiếp theo. end_turn: mô hình đã hoàn tất câu trả lời cuối cùng, thoát vòng lặp.

</details>

**11. Khi nào nên dùng pattern Orchestrator-Workers thay vì Prompt Chaining?**

<details><summary>Xem đáp án</summary>

Khi các tác vụ con không thể biết trước cố định mà cần LLM trung tâm (Orchestrator) tự phân rã động dựa trên input (ví dụ: coding agent cần sửa nhiều file chưa xác định trước).

</details>

## Module 8: Claude Agent SDK & Human-in-the-Loop (HITL)

**12. Hai biện pháp an toàn bắt buộc khi triển khai Autonomous Agent có khả năng gọi tool?**

<details><summary>Xem đáp án</summary>

1) Đặt giới hạn vòng lặp tối đa (max_turns / token budget) để chống infinite loop; 2) Áp dụng Human-in-the-Loop (HITL) xác nhận trước các hành động phá hủy/không thể hoàn tác.

</details>

## Module 9: Prompt Engineering, XML Tags & Structured Outputs

**13. Tại sao Anthropic khuyến nghị dùng XML tags (như <instructions>, <document>) trong prompt?**

<details><summary>Xem đáp án</summary>

Claude được huấn luyện nhận diện tốt XML tags, giúp phân tách rạch ròi giữa chỉ dẫn hệ thống và dữ liệu đầu vào không đáng tin cậy, giảm nhầm lẫn cấu trúc và hỗ trợ chống prompt injection.

</details>

**14. Cách đảm bảo 100% đầu ra từ Claude tuân thủ JSON Schema trong production?**

<details><summary>Xem đáp án</summary>

Sử dụng Structured Outputs qua tham số output_config.format với type: 'json_schema' (constrained decoding ở tầng sinh token), thay vì parse JSON từ văn bản tự do bằng regex.

</details>

## Module 10: Extended Thinking & Context Window Management

**15. Quy tắc bắt buộc khi dùng Extended Thinking kết hợp với Tool Use trong Agentic Loop?**

<details><summary>Xem đáp án</summary>

Phải giữ nguyên các thinking blocks (bao gồm trường signature) trong lịch sử messages khi gửi lại tool_result ở cùng một lượt suy luận, và không ép tool_choice dạng 'tool' hoặc 'any'.

</details>

**16. Các kỹ thuật quản lý Context Window khi hội thoại kéo dài tiệm cận giới hạn?**

<details><summary>Xem đáp án</summary>

Rolling Window (giữ N lượt gần nhất) hoặc Conversation Summarization (dùng model nhẹ như Haiku tóm tắt các lượt cũ thành <summary> để tránh Context Rot).

</details>

## Module 11: Tool Use (tool_choice), Schema Validation & Parallel Execution

**17. Làm thế nào để cấm Claude gọi tool ở lượt cuối cùng mà không làm mất Prompt Cache của mảng tools?**

<details><summary>Xem đáp án</summary>

Giữ nguyên danh sách tools trong request và đặt tool_choice: {'type': 'none'} (vì tools nằm ở đầu prefix cache, nếu xóa tools sẽ gây cache miss).

</details>

**18. Khi thực thi tool thất bại (ví dụ lỗi SQL hoặc thiếu tham số), ứng dụng nên trả về gì cho Claude?**

<details><summary>Xem đáp án</summary>

Trả về block tool_result với 'is_error': true kèm thông báo lỗi rõ ràng để Claude tự hiểu nguyên nhân, điều chỉnh tham số và thử lại.

</details>

## Module 12: Model Context Protocol (MCP) Architecture & Transports

**19. Ba primitives chính của một MCP Server và ai là người kiểm soát từng loại?**

<details><summary>Xem đáp án</summary>

Tools (Model-controlled: hàm thực thi hành động), Resources (Application-controlled: dữ liệu đọc/context), Prompts (User-controlled: template lệnh có sẵn).

</details>

**20. Phân biệt 2 transport layers phổ biến của Model Context Protocol (MCP): stdio và Streamable HTTP?**

<details><summary>Xem đáp án</summary>

stdio dùng cho local MCP servers chạy trên cùng máy với Host (qua stdin/stdout); Streamable HTTP dùng cho remote MCP servers triển khai qua mạng/cloud, hỗ trợ OAuth 2.1.

</details>

## Module 13: Security, Prompt Injection Defense, PII Redaction & Guardrails

**21. Phân biệt Direct Prompt Injection và Indirect Prompt Injection?**

<details><summary>Xem đáp án</summary>

Direct: user nhập trực tiếp lệnh ghi đè vào khung chat. Indirect: câu lệnh độc hại ẩn trong dữ liệu ngoài (email, trang web, PDF) mà Agent đọc vào.

</details>

**22. Tại sao chỉ viết system prompt cẩn thận là chưa đủ để chống Indirect Prompt Injection?**

<details><summary>Xem đáp án</summary>

Vì LLM không thể phân biệt tuyệt đối chỉ dẫn và dữ liệu. Cần Defense-in-Depth: cô lập dữ liệu bằng XML tags + Least Privilege cho tools + HITL xác nhận hành động nhạy cảm.

</details>

**23. PII Redaction và Zero Data Retention (ZDR) giải quyết vấn đề gì?**

<details><summary>Xem đáp án</summary>

PII Redaction ẩn thông tin nhạy cảm (SSN, thẻ tín dụng) ở middleware trước khi gửi lên LLM. ZDR đảm bảo Anthropic không lưu prompt/completion trên đĩa sau khi trả response.

</details>

**24. Nguyên tắc bảo mật API Key Hygiene chuẩn cho ứng dụng web dùng Claude API?**

<details><summary>Xem đáp án</summary>

Không bao giờ nhúng ANTHROPIC_API_KEY ở frontend; gọi qua Backend Proxy lấy key từ Secrets Manager, tách key/workspace riêng cho dev và prod kèm spend limits.

</details>

## Module 14: Claude Code CLI, CLAUDE.md, Settings Scopes & Hooks

**25. Đặt quy tắc coding chuẩn của team dùng chung qua Git ở file nào trong Claude Code?**

<details><summary>Xem đáp án</summary>

Đặt tại ./CLAUDE.md (hoặc ./.claude/CLAUDE.md) và commit lên Git; các cấu hình cá nhân cục bộ đặt ở ./CLAUDE.local.md (gitignored).

</details>

**26. Thứ tự ưu tiên Settings Scopes trong Claude Code (từ cao xuống thấp)?**

<details><summary>Xem đáp án</summary>

Managed Settings (Enterprise) -> CLI arguments -> Local Project (.claude/settings.local.json) -> Shared Project (.claude/settings.json) -> User (~/.claude/settings.json).

</details>

**27. Sự khác biệt giữa hướng dẫn trong CLAUDE.md và Claude Code Hooks (PreToolUse/PostToolUse)?**

<details><summary>Xem đáp án</summary>

CLAUDE.md là hướng dẫn mềm cho LLM (xác suất). Hooks là shell script chạy tất định (deterministic): PreToolUse có thể trả exit code 2 để chặn hành động nguy hiểm.

</details>

**28. Cách chạy Claude Code ở chế độ tự động (non-interactive) trong pipeline CI/CD?**

<details><summary>Xem đáp án</summary>

Sử dụng flag -p (--print) kèm --output-format json (ví dụ: git diff | claude -p 'Review bugs' --output-format json).

</details>

## Module 15: Model Evals, LLM-as-a-Judge, Regression Testing & Debugging

**29. Khi nào nên ưu tiên Code-based Grader và khi nào dùng LLM-as-a-Judge?**

<details><summary>Xem đáp án</summary>

Code-based: nhanh, rẻ, tất định cho format (JSON Schema, regex, unit test). LLM-as-a-Judge: đánh giá ngữ nghĩa, văn phong, độ chính xác lập luận theo Rubric.

</details>

**30. Best practice khi thiết kế prompt cho LLM-as-a-Judge để tăng độ tin cậy chấm điểm?**

<details><summary>Xem đáp án</summary>

Cung cấp Rubric rõ ràng (mô tả từng mức điểm) và yêu cầu Judge xuất phần giải thích (reasoning) trước khi đưa ra điểm số (score).

</details>

**31. Tại sao phải chạy Regression Evals trước khi deploy bất kỳ thay đổi prompt hay nâng cấp model nào?**

<details><summary>Xem đáp án</summary>

Để phát hiện sớm tình trạng cải thiện một kịch bản nhưng vô tình làm giảm chất lượng (regression) ở các kịch bản hiện có trong Eval Dataset.

</details>

**32. Khi debug production thấy cache_read_input_tokens đột ngột bằng 0, nguyên nhân phổ biến nhất là gì?**

<details><summary>Xem đáp án</summary>

Có dữ liệu động (timestamp, UUID, session ID) vô tình lọt vào phần nội dung trước cache_control breakpoint, làm phá vỡ prefix matching.

</details>

---

[Mục lục CCDV-F](00-tong-quan-va-lo-trinh-ccdv-f.md)
