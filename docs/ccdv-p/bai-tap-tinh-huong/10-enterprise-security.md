# Bài tập tình huống — Chủ đề 10: Runtime Guardrails, PII/Secret Redaction & Least-Privilege MCP Scoping

> Áp dụng bộ lọc Input/Output Guardrails, che giấu PII/Secrets trước khi gửi API, cách ly dữ liệu đa tenant và cấp quyền tối thiểu cho MCP tools.
> **Số câu hỏi:** 10 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A multi-tenant SaaS application stores embeddings for 500 enterprise customers in a single shared vector database index. During a RAG query for Tenant A, a semantic search accidentally returns chunks belonging to Tenant B. How must tenant isolation be enforced?

- **A.** Instruct Claude in the system prompt to politely ignore any retrieved chunks that mention a different enterprise company name or tenant ID.
- **B.** Rely on client-side JavaScript in the browser to hide paragraphs that do not match the logged-in user's corporate domain.
- **C.** Set `temperature: 0.0` and `top_p: 0.1` so Claude never mixes up information between different enterprise customers.
- **D.** Enforce server-side mandatory metadata filtering (`tenant_id = auth_context.tenant_id`) or per-tenant namespaces/indexes before retrieval.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng SaaS đa người thuê (multi-tenant) lưu trữ embedding cho 500 khách hàng doanh nghiệp trong một chỉ mục cơ sở dữ liệu vector dùng chung duy nhất. Trong một truy vấn RAG cho Tenant A, tìm kiếm ngữ nghĩa vô tình trả về các chunk thuộc về Tenant B. Việc cô lập người thuê (tenant isolation) phải được thực thi như thế nào?

**Đáp án đúng:** **D**

Multi-tenant RAG bắt buộc phải thực hiện Authorization & Tenant Isolation ở tầng truy xuất (pre-retrieval server-side filter theo JWT/auth context hoặc physical index isolation), không bao giờ giao việc phân quyền cho LLM.

- **A:** Dựa vào LLM để lọc quyền truy cập (soft filtering) là lỗ hổng bảo mật nghiêm trọng; dữ liệu của Tenant B đã lọt vào context và có thể bị trích xuất.
- **B:** Kiểm soát phía client hoàn toàn có thể bị vượt qua qua DevTools hoặc API trực tiếp.
- **C:** Temperature không có bất kỳ tác dụng kiểm soát phân quyền dữ liệu nào.
- **D (Đúng):** Cách ly tenant phải được thực thi cưỡng bức ở tầng server/database (pre-retrieval mandatory `tenant_id` filter từ token xác thực hoặc tách namespace/index riêng), tuyệt đối không để dữ liệu tenant khác lọt vào prompt.

</details>

### Câu 2 `medium`

An internal developer assistant connects to an MCP server that exposes database query tools. Currently, the MCP server uses a single shared superuser service account with `DROP`, `UPDATE`, and `SELECT` privileges across all schemas. Which security principle is violated, and how should it be fixed?

- **A.** Least privilege; issue per-user scoped OAuth/JWT tokens, restrict the assistant to read-only views, and block destructive DDL/DML statements.
- **B.** High availability; duplicate the shared superuser database password across three separate Kubernetes secret variables for redundancy.
- **C.** Idempotency; wrap every `DROP TABLE` and `UPDATE` SQL command in an exponential backoff retry loop with jitter.
- **D.** Prompt caching; cache the database superuser credentials inside the `system` prompt using `ephemeral` cache control breakpoints for faster auth.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một trợ lý lập trình nội bộ kết nối tới một MCP server cung cấp các tool truy vấn cơ sở dữ liệu. Hiện tại, MCP server sử dụng một tài khoản dịch vụ superuser dùng chung duy nhất với các quyền `DROP`, `UPDATE` và `SELECT` trên tất cả các schema. Nguyên tắc bảo mật nào đã bị vi phạm và nên khắc phục như thế nào?

**Đáp án đúng:** **A**

MCP tool servers phải tuân thủ Least-Privilege Tool Scoping và OAuth/RBAC delegation theo ngữ cảnh người dùng thực tế thay vì dùng chung tài khoản superuser.

- **A (Đúng):** Vi phạm nguyên tắc Least Privilege (quyền tối thiểu). Cần truyền định danh người dùng (OAuth/JWT delegation), giới hạn quyền read-only trên các view được phép và chặn lệnh phá hủy dữ liệu.
- **B:** Nhân bản mật khẩu superuser không giải quyết vấn đề lạm quyền mà còn tăng bề mặt rò rỉ.
- **C:** Retry lệnh `DROP TABLE` không liên quan đến bảo mật phân quyền.
- **D:** Đưa mật khẩu vào prompt là rủi ro bảo mật cực lớn (prompt extraction).

</details>

### Câu 3 `medium`

A healthcare intake application sends user-submitted medical narratives to Claude for structured symptom extraction. Compliance rules prohibit storing or transmitting raw Social Security Numbers (SSNs) and API keys to third-party logging or model endpoints. What guardrail should run before the Messages API call?

- **A.** Instruct Claude in the system prompt to delete any SSNs from its internal memory after it finishes extracting symptoms.
- **B.** Run an inline deterministic + NER PII/secret redaction layer (such as Presidio or regex/DLP) to tokenize or mask sensitive fields before calling Claude.
- **C.** Send the raw SSN inside the `system` parameter instead of the `user` messages array so it remains hidden from logs.
- **D.** Disable HTTPS TLS certificate verification on the backend client so intermediate network proxies cannot inspect or log the raw SSN payload in transit.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng tiếp nhận y tế gửi các mô tả bệnh án do người dùng nhập tới Claude để trích xuất triệu chứng có cấu trúc. Quy tắc tuân thủ nghiêm cấm lưu trữ hoặc truyền số An sinh Xã hội (SSN) thô và API key tới các endpoint ghi log hoặc mô hình của bên thứ ba. Hàng rào bảo vệ (guardrail) nào cần chạy trước lệnh gọi Messages API?

**Đáp án đúng:** **B**

PII và secrets phải được phát hiện và che/mã hóa giả (redaction/pseudonymization) ở biên nội bộ trước khi payload rời đi tới LLM hoặc hệ thống logging.

- **A:** Nếu gửi SSN lên API thì dữ liệu đã rời khỏi hạ tầng nội bộ trước khi mô hình kịp xử lý.
- **B (Đúng):** Chạy lớp PII/Secret Redaction (DLP/Presidio/regex) trước khi gọi Messages API để thay thế SSN/API key bằng token giả (pseudonymization), sau đó có thể khôi phục cục bộ nếu cần.
- **C:** Tham số `system` vẫn được gửi qua mạng tới API và vẫn chứa dữ liệu nhạy cảm.
- **D:** Tắt xác thực chứng chỉ TLS mở ra lỗ hổng tấn công Man-in-the-Middle.

</details>

### Câu 4 `medium`

A financial advisory chatbot must never provide personalized tax-evasion advice or unauthorized investment guarantees, even when users wrap requests in hypothetical roleplay scenarios. Which runtime guardrail architecture balances low latency with high accuracy?

- **A.** Run a fast input/output policy classifier (such as a lightweight Claude Haiku classifier or dedicated guardrail model) in parallel or inline with schema validation.
- **B.** Append 10,000 words of standardized legal disclaimers to the end of every chatbot response without inspecting the generated text.
- **C.** Block all incoming user messages that contain more than 15 words so complex hypothetical roleplay prompts cannot fit.
- **D.** Route every incoming user message through three sequential Claude Opus review passes before SSE streaming begins to the client.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một chatbot tư vấn tài chính tuyệt đối không được đưa ra lời khuyên trốn thuế cá nhân hoặc cam kết đầu tư trái phép, ngay cả khi người dùng bọc yêu cầu trong các kịch bản nhập vai giả định. Kiến trúc guardrail thời gian chạy (runtime guardrail) nào cân bằng giữa độ trễ thấp và độ chính xác cao?

**Đáp án đúng:** **A**

Runtime Guardrails hiện đại kết hợp deterministic checks (regex/schema) với fast policy classifiers (như Haiku hoặc NeMo/Lakera) chạy song song hoặc trước khi phát hành phản hồi.

- **A (Đúng):** Sử dụng bộ phân loại chính sách tốc độ cao (như Claude Haiku hoặc guardrail classifier chuyên dụng) ở tầng input/output kết hợp kiểm tra schema giúp phát hiện jailbreak/vi phạm chính sách với độ trễ thấp.
- **B:** Chỉ gắn disclaimer không ngăn được chatbot đưa ra lời khuyên trốn thuế bất hợp pháp.
- **C:** Giới hạn 15 từ phá hỏng trải nghiệm sử dụng hợp pháp của người dùng.
- **D:** Dùng 3 lượt Opus tuần tự gây độ trễ TTFT và chi phí cực kỳ lớn.

</details>

### Câu 5 `hard`

An agent generates HTML emails rendered in an internal admin dashboard and also invokes a shell-command tool for file conversions. Security auditors warn about XSS and command injection if Claude's outputs are consumed unsafely. What is the correct remediation?

- **A.** Instruct Claude in the system prompt never to output `<script>` HTML tags or shell command separators like semicolons.
- **B.** Treat all LLM outputs as untrusted: sanitize HTML via an allowlist sanitizer before rendering and pass tool arguments via parameterized APIs without a shell.
- **C.** Render Claude's raw HTML output inside a frontend `eval()` block so modern browsers execute embedded scripts safely.
- **D.** Switch the underlying model from Claude Sonnet to Claude Haiku because smaller models cannot generate JavaScript payloads.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một agent tạo các email HTML được render trong một bảng điều khiển quản trị nội bộ và cũng gọi một shell-command tool để chuyển đổi tệp. Các kiểm toán viên bảo mật cảnh báo về XSS và command injection nếu đầu ra của Claude được tiêu thụ không an toàn. Biện pháp khắc phục đúng là gì?

**Đáp án đúng:** **B**

Nguyên tắc OWASP cho LLM (Insecure Output Handling): luôn coi đầu ra của mô hình là dữ liệu không tin cậy, phải sanitize/escape theo ngữ cảnh đích (HTML, SQL, Shell) trước khi thực thi hoặc hiển thị.

- **A:** Nhắc nhở bằng prompt không thể đảm bảo an toàn tuyệt đối trước lỗi sinh mã hoặc indirect injection.
- **B (Đúng):** Mọi đầu ra từ LLM phải được coi là untrusted input: làm sạch HTML bằng thư viện allowlist (như DOMPurify) và gọi tiến trình bằng mảng tham số (no shell=True) hoặc API có kiểu dữ liệu chặt chẽ.
- **C:** Dùng `eval()` trực tiếp tạo ra lỗ hổng thực thi mã XSS nghiêm trọng hơn.
- **D:** Mọi mô hình ngôn ngữ đều có thể sinh JavaScript hoặc ký tự đặc biệt của shell.

</details>

### Câu 6 `medium`

To prevent sensitive customer PII and internal secrets from leaking through an AI observability pipeline and LLM responses, which TWO practices should be enforced?

*(Chọn 2 đáp án)*

- **A.** Redact or mask PII and API credentials at the gateway before prompts are logged to telemetry backends.
- **B.** Run an output DLP/secret scanner on model completions to block accidental leakage of tokens or private keys before returning to users.
- **C.** Embed the organization's production Anthropic API key inside the frontend React bundle for faster client calls.
- **D.** Store unencrypted user prompts in a public S3 bucket so QA engineers can download them easily.
- **E.** Disable RBAC on the vector database so every microservice can read all tenant collections.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Để ngăn chặn PII nhạy cảm của khách hàng và bí mật nội bộ rò rỉ qua một pipeline observability AI và các phản hồi của LLM, HAI thực hành nào cần được thực thi?

**Đáp án đúng:** **A, B**

Bảo mật dữ liệu nhạy cảm cần thực hiện cả hai chiều: PII/secret redaction trước khi lưu log/telemetry và quét DLP ở đầu ra trước khi trả về người dùng.

- **A (Đúng):** Che/loại bỏ PII và API key tại gateway trước khi đẩy sang hệ thống telemetry đảm bảo log không chứa dữ liệu nhạy cảm.
- **B (Đúng):** Quét DLP/secret ở đầu ra ngăn chặn trường hợp mô hình vô tình lặp lại thông tin nhạy cảm từ ngữ cảnh hoặc tool result.
- **C:** Nhúng API key vào frontend làm lộ hoàn toàn bí mật cho bất kỳ ai mở DevTools.
- **D:** Lưu prompt không mã hóa trên S3 public là sự cố rò rỉ dữ liệu nghiêm trọng.
- **E:** Tắt RBAC phá vỡ cơ chế cách ly dữ liệu giữa các tenant.

</details>

### Câu 7 `hard`

A SaaS customer portal exposes an MCP tool `get_invoice(user_id, invoice_id)` to Claude. During a penetration test, a malicious user tricks Claude via prompt injection into calling `get_invoice(user_id='victim_999', invoice_id='inv_101')`, successfully retrieving another customer's billing PDF. What is the fundamental architectural flaw and its proper fix?

- **A.** The flaw is allowing Claude to output PDF links; the fix is instructing Claude in the system prompt never to pass any `user_id` argument other than the currently authenticated user.
- **B.** The flaw is using string IDs instead of integers; the fix is switching `user_id` to sequential auto-incrementing integers in the tool schema.
- **C.** The flaw is trusting LLM-supplied identity; remove `user_id` from the tool schema and derive it from the verified server-side JWT.
- **D.** The flaw is missing rate limiting on `get_invoice`; the fix is capping tool calls to 5 requests per minute per conversation.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một cổng thông tin khách hàng SaaS cung cấp một MCP tool `get_invoice(user_id, invoice_id)` cho Claude. Trong một đợt kiểm thử xâm nhập (penetration test), người dùng độc hại đánh lừa Claude qua prompt injection để gọi `get_invoice(user_id='victim_999', invoice_id='inv_101')`, lấy thành công tệp PDF hóa đơn của khách hàng khác. Lỗ hổng kiến trúc cơ bản và cách khắc phục đúng đắn là gì?

**Đáp án đúng:** **C**

Nguyên tắc Zero-Trust cho Tool Execution: LLM là untrusted caller. Mọi ngữ cảnh xác thực và phân quyền (user_id, tenant_id, RBAC scopes) phải được bind và kiểm tra ở tầng server từ session/JWT, tuyệt đối không nhận từ tham số tool do model sinh ra.

- **A:** Tin tưởng vào lời dặn trong system prompt để thực thi phân quyền (authorization) là sai lầm nghiêm trọng vì prompt có thể bị jailbreak hoặc bypass.
- **B:** Đổi sang số nguyên tuần tự thậm chí còn khiến lỗi IDOR (Insecure Direct Object Reference) dễ bị dò quét hơn.
- **C (Đúng):** Không bao giờ được tin tham số định danh (`user_id`, `tenant_id`) do LLM truyền vào để kiểm tra quyền. Phải loại bỏ nó khỏi tool schema (hoặc bỏ qua) và lấy danh tính người dùng trực tiếp từ JWT/session đã xác thực ở tầng server (least-privilege tool scoping).
- **D:** Rate limiting chỉ làm chậm tốc độ khai thác chứ không vá được lỗ hổng truy cập trái phép dữ liệu của người khác ngay từ request đầu tiên.

</details>

### Câu 8 `hard`

A multi-tenant B2B knowledge platform serves 400 enterprise customers from a shared vector database and uses Anthropic Prompt Caching to optimize latency. A security architect warns about cross-tenant data leakage risks. Which pair of isolation controls is strictly required?

- **A.** Combine all tenants' documents into a single shared prompt cache prefix to maximize cache hit rates, and instruct Claude in the system prompt to filter out other companies' names before answering.
- **B.** Enforce mandatory tenant filtering at the vector DB query layer and exclude tenant-specific data from shared prompt cache prefixes.
- **C.** Encrypt every retrieved text chunk with AES-256 before sending it to Claude, and ask Claude to decrypt it internally during reasoning.
- **D.** Allow all tenants to query the same unfiltered vector index and rely on post-retrieval regex matching to delete sentences mentioning competing company names.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng tri thức B2B đa người thuê phục vụ 400 khách hàng doanh nghiệp từ một cơ sở dữ liệu vector dùng chung và sử dụng Anthropic Prompt Caching để tối ưu độ trễ. Một kiến trúc sư bảo mật cảnh báo về rủi ro rò rỉ dữ liệu chéo giữa các tenant. Cặp biện pháp kiểm soát cô lập nào là bắt buộc nghiêm ngặt?

**Đáp án đúng:** **B**

Multi-tenant isolation trong hệ thống Claude RAG yêu cầu phân tách dữ liệu chặt chẽ ngay tại tầng lưu trữ/truy vấn Vector DB và cô lập hoàn toàn dữ liệu riêng của từng tenant khỏi các prompt cache prefix dùng chung.

- **A:** Nhồi dữ liệu nhiều tenant vào chung một prompt cache prefix là lỗ hổng rò rỉ dữ liệu nghiêm trọng nếu mô hình trích xuất hoặc bị prompt injection.
- **B (Đúng):** Phải cô lập tuyệt đối ở tầng retrieval (bắt buộc filter `tenant_id` hoặc tách namespace/index riêng) và đảm bảo prefix dùng chung cho Prompt Caching chỉ chứa system prompt/tool definitions chung, tuyệt đối không chứa dữ liệu của tenant khác.
- **C:** LLM không thể giải mã AES-256 trong ngữ cảnh suy luận văn bản; làm vậy sẽ khiến RAG hoàn toàn vô dụng.
- **D:** Post-retrieval regex rất dễ sót thông tin mật không nhắc tên công ty và không đáp ứng chuẩn cô lập dữ liệu multi-tenant.

</details>

### Câu 9 `medium`

A developer support bot answers questions using internal engineering wikis and occasionally outputs configuration snippets. Compliance auditors discover that an API key (`sk-ant-...`) and customer SSNs embedded in a legacy wiki page were echoed verbatim in a user response. Which runtime guardrail prevents this leakage reliably?

- **A.** Set `temperature: 0.0` so Claude avoids creative elaboration and only outputs standard documentation text.
- **B.** Add a system prompt instruction asking Claude to double-check its own output for secrets before finishing.
- **C.** Disable streaming mode in the Messages API, because synchronous non-streaming responses automatically invoke Anthropic's built-in regex filters to redact all customer API keys and SSNs.
- **D.** Run deterministic PII/secret scanners (regex, checksums, entropy) on ingested chunks and buffered outputs before delivery.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một bot hỗ trợ lập trình viên trả lời câu hỏi bằng các wiki kỹ thuật nội bộ và thỉnh thoảng xuất ra các đoạn cấu hình. Kiểm toán viên tuân thủ phát hiện rằng một API key (`sk-ant-...`) và số SSN của khách hàng được nhúng trong một trang wiki cũ đã bị lặp lại nguyên văn trong phản hồi cho người dùng. Guardrail thời gian chạy nào ngăn chặn đáng tin cậy sự rò rỉ này?

**Đáp án đúng:** **D**

Đối với các thực thể có cấu trúc rõ ràng như API keys, tokens, SSN, số thẻ tín dụng, Deterministic Redaction (regex + entropy + checksum) kết hợp policy classifiers là lớp bảo vệ bắt buộc ở cả đầu vào RAG và đầu ra runtime.

- **A:** Temperature 0.0 không ngăn mô hình chép lại nguyên văn API key hoặc SSN nếu chúng xuất hiện trong tài liệu RAG được truy xuất.
- **B:** Tự kiểm tra bằng LLM không đảm bảo 100% và dễ bị bỏ sót khi context dài hoặc bị đánh lừa.
- **C:** Anthropic Messages API không tự động xóa API key hay dữ liệu nhạy cảm của ứng dụng trong non-streaming mode.
- **D (Đúng):** Sử dụng bộ quét tất định (regex + checksum + entropy check cho secrets/API keys và PII) ở cả bước ingestion và tầng output guardrail (trước khi trả về user hoặc ghi log) đảm bảo ngăn rò rỉ dữ liệu nhạy cảm một cách đáng tin cậy.

</details>

### Câu 10 `hard`

An engineering team deploys a custom MCP server that gives Claude access to `fetch_webpage(url)` and `run_sql_readonly(query)` in a cloud VPC. Which TWO security controls are essential to harden this MCP server against SSRF and data abuse? (Select TWO)

*(Chọn 2 đáp án)*

- **A.** Enforce strict egress allowlists and block private/link-local IP ranges (such as `169.254.169.254` cloud metadata endpoints and RFC 1918 subnets) after DNS resolution in `fetch_webpage`.
- **B.** Connect `run_sql_readonly` using the database superuser account and rely on Claude's system prompt to only write `SELECT` statements.
- **C.** Bind `run_sql_readonly` to a dedicated database role with read-only permissions on specific views, strict query timeouts, and row-limit enforcement.
- **D.** Disable TLS certificate verification in `fetch_webpage` so Claude can inspect internal staging services with self-signed certificates.
- **E.** Return full stack traces and database connection strings inside MCP tool error messages so Claude can debug permissions autonomously.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ thuật triển khai một MCP server tùy chỉnh cấp cho Claude quyền truy cập vào `fetch_webpage(url)` và `run_sql_readonly(query)` trong một VPC đám mây. HAI biện pháp kiểm soát bảo mật nào là thiết yếu để gia cố MCP server này trước tấn công SSRF và lạm dụng dữ liệu? (Chọn HAI đáp án)

**Đáp án đúng:** **A, C**

Bảo mật MCP Server đòi hỏi phòng thủ tầng hạ tầng: chống SSRF (chặn IP nội bộ/metadata endpoint, egress allowlist) và least-privilege cho database (read-only role, view scoping, timeout).

- **A (Đúng):** Chặn các dải IP nội bộ/link-local (đặc biệt là `169.254.169.254` chứa cloud IAM credentials) sau bước phân giải DNS và áp dụng egress allowlist là biện pháp chống SSRF bắt buộc cho tool fetch URL.
- **B:** Dùng tài khoản superuser và trông chờ vào system prompt là cực kỳ nguy hiểm; nếu bị prompt injection, attacker có thể chạy `DROP` hoặc `COPY` đọc file hệ thống.
- **C (Đúng):** Sử dụng DB role chỉ đọc (read-only) giới hạn trên các view được phép, kèm query timeout và giới hạn số dòng trả về là thực hành least-privilege chuẩn cho SQL tool.
- **D:** Tắt kiểm tra chứng chỉ TLS khiến hệ thống dễ bị tấn công Man-in-the-Middle (MitM) và mở đường truy cập dịch vụ nội bộ trái phép.
- **E:** Trả về stack trace và connection string trong tool output có thể làm lộ thông tin hạ tầng và bí mật cho người dùng cuối.

</details>

---

[Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md)
