# Bài tập tình huống — Module 12: Model Context Protocol (MCP) Architecture & Transports

> Kiến trúc Host-Client-Server qua JSON-RPC 2.0, 3 primitives (Tools, Resources, Prompts), transports stdio vs Streamable HTTP (OAuth 2.1) và quản lý số lượng lớn MCP tools.
> **Số câu hỏi:** 6 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

In the Model Context Protocol (MCP), what is the key distinction between an MCP `Resource` and an MCP `Tool`?

- **A.** `Resources` expose read-only URI data (app-controlled); `Tools` are executable functions (model-controlled).
- **B.** `Resources` can only store binary images, whereas `Tools` can only return JSON.
- **C.** There is no difference; `Resource` is simply a deprecated alias for `Tool`.
- **D.** `Tools` are only available over `stdio` transport, whereas `Resources` require Streamable HTTP server connections.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong Model Context Protocol (MCP), sự khác biệt chính giữa một MCP `Resource` và một MCP `Tool` là gì?

**Đáp án đúng:** **A**

MCP định nghĩa 3 primitive chính: **Tools** (model-controlled: hàm thực thi), **Resources** (application-controlled: dữ liệu/tài liệu chỉ đọc qua URI), và **Prompts** (user-controlled: mẫu prompt tái sử dụng).

- **A (Đúng):** Trong MCP: **Resources** là dữ liệu ngữ cảnh chỉ đọc được định danh bằng URI (do ứng dụng/client quyết định nạp vào); **Tools** là hàm thực thi hành động hoặc tính toán (do LLM/model quyết định gọi).
- **B:** Resources có thể chứa text, JSON, code hoặc binary; Tools cũng có thể trả về text hoặc dữ liệu có cấu trúc.
- **C:** Resource, Tool và Prompt là ba primitive hoàn toàn riêng biệt trong kiến trúc MCP.
- **D:** Cả Tools và Resources đều hoạt động trên mọi transport của MCP (stdio, Streamable HTTP).

</details>

### Câu 2 `medium`

An engineering team is deploying a shared MCP server on Kubernetes so multiple remote web applications and cloud agents can connect to it over the network. Which MCP transport should they use?

- **A.** FTP
- **B.** Streamable HTTP
- **C.** stdio (standard I/O)
- **D.** SMTP (mail relay)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ thuật đang triển khai một MCP server dùng chung trên Kubernetes để nhiều ứng dụng web từ xa và cloud agent có thể kết nối tới nó qua mạng. Họ nên sử dụng MCP transport nào?

**Đáp án đúng:** **B**

MCP hỗ trợ hai transport chính: **stdio** cho tích hợp cục bộ (CLI, IDE, local desktop app) và **Streamable HTTP** cho các MCP server triển khai từ xa trên cloud/Kubernetes.

- **A:** FTP không phải transport của MCP.
- **B (Đúng):** Streamable HTTP là chuẩn transport hiện đại của MCP cho các kết nối từ xa qua mạng (remote servers), hỗ trợ xác thực HTTP tiêu chuẩn và streaming.
- **C:** `stdio` chỉ dùng cho tiến trình cục bộ (local subprocess) trên cùng một máy, không dùng qua mạng giữa các container/dịch vụ từ xa.
- **D:** SMTP là giao thức gửi email, không phải transport của MCP.

</details>

### Câu 3 `medium`

In the Model Context Protocol (MCP), which primitive is **user-controlled** and exposes reusable prompt templates or slash-command workflows from the server to the client UI?

- **A.** `Sampling`
- **B.** `Tools`
- **C.** `Resources`
- **D.** `Prompts`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong Model Context Protocol (MCP), thành phần nguyên thủy (primitive) nào là **do người dùng kiểm soát (user-controlled)** và cung cấp các mẫu prompt tái sử dụng hoặc workflow dạng slash-command từ server tới giao diện client?

**Đáp án đúng:** **D**

Ba primitive cốt lõi của MCP phân chia quyền kiểm soát rất rõ: **Tools** (model-controlled), **Resources** (application-controlled) và **Prompts** (user-controlled).

- **A:** `Sampling` là cơ chế để MCP server yêu cầu client gọi LLM hoàn thành một lượt sinh văn bản.
- **B:** `Tools` là primitive do model điều khiển (model-controlled).
- **C:** `Resources` là dữ liệu chỉ đọc do ứng dụng/client điều khiển (application-controlled).
- **D (Đúng):** Trong MCP, **Prompts** là primitive do người dùng kích hoạt (user-controlled), cung cấp các mẫu prompt hoặc quy trình lệnh (như slash commands) từ MCP server.

</details>

### Câu 4 `easy`

A developer is building a local MCP server in Python that will be launched directly as a child process by Claude Desktop or Claude Code on the user's laptop. Which MCP transport is designed for this local integration?

- **A.** `stdio`
- **B.** WebRTC
- **C.** gRPC-Web
- **D.** Streamable HTTP over public TLS

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên đang xây dựng một MCP server cục bộ bằng Python sẽ được khởi chạy trực tiếp như một tiến trình con (child process) bởi Claude Desktop hoặc Claude Code trên máy tính xách tay của người dùng. MCP transport nào được thiết kế cho tích hợp cục bộ này?

**Đáp án đúng:** **A**

Khi tích hợp MCP server chạy cục bộ dưới dạng subprocess trên máy trạm (Claude Code, Claude Desktop, IDE), **`stdio`** là transport chuẩn, đơn giản và không cần mở cổng mạng.

- **A (Đúng):** Transport `stdio` giao tiếp qua standard input/output giữa host (Claude Desktop/Claude Code) và tiến trình MCP server chạy cục bộ trên cùng máy.
- **B:** WebRTC không phải transport chuẩn của MCP.
- **C:** gRPC-Web không phải transport chuẩn của MCP.
- **D:** Streamable HTTP dùng cho MCP server chạy từ xa qua mạng; tiến trình con cục bộ nên dùng `stdio`.

</details>

### Câu 5 `hard`

An application integrates 60 tools across 5 MCP servers. Passing all 60 full tool JSON schemas in every Messages API call consumes 18,000 input tokens per turn and degrades tool-selection accuracy. What architectural pattern solves this?

- **A.** Delete all `description` fields from every MCP tool schema to reduce input token usage per turn.
- **B.** Use Tool Search / dynamic tool discovery (loading core tools plus a search tool to fetch relevant schemas on demand).
- **C.** Set `tool_choice: {"type": "none"}` so Claude skips tool schema evaluation completely.
- **D.** Merge all 60 MCP tools into a single mega-tool with 200 optional parameters in `input_schema` and no field descriptions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng tích hợp 60 tool trên 5 MCP server. Việc truyền toàn bộ 60 JSON schema tool đầy đủ trong mỗi lệnh gọi Messages API tiêu tốn 18.000 input token mỗi lượt và làm giảm độ chính xác khi chọn tool. Mẫu kiến trúc nào giải quyết vấn đề này?

**Đáp án đúng:** **B**

Khi hệ thống mở rộng lên hàng chục hoặc hàng trăm tool (như qua nhiều MCP server), **Dynamic Tool Discovery / Tool Search** là giải pháp kiến trúc chuẩn để tránh phình to context và suy giảm độ chính xác.

- **A:** Xóa `description` khiến model không hiểu công dụng của tool và chọn sai liên tục.
- **B (Đúng):** Khi số lượng tool quá lớn, mẫu **Tool Search / Dynamic Tool Loading** chỉ nạp sẵn một số tool cốt lõi và một tool tìm kiếm để nạp thêm định nghĩa tool liên quan theo ngữ cảnh, giúp tiết kiệm hàng chục nghìn token và tăng độ chính xác chọn tool.
- **C:** Đặt `none` sẽ tắt hoàn toàn khả năng dùng tool.
- **D:** Gộp 60 tool thành 1 tool 200 tham số khiến model cực kỳ dễ điền sai tham số.

</details>

### Câu 6 `medium`

An organization is exposing internal company APIs via a remote MCP server over Streamable HTTP. Which TWO security and protocol practices should be implemented? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Disable HTTPS and run over plain HTTP on the public internet.
- **B.** Trust the `user` prompt text as proof of admin identity without verifying tokens.
- **C.** Expose database root credentials inside the public MCP `Tool` description string.
- **D.** Validate and sanitize all tool input arguments on the MCP server before calling downstream databases or APIs.
- **E.** Enforce authentication and authorization (such as OAuth 2.1 / bearer tokens) on the MCP HTTP endpoint rather than leaving it unauthenticated.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức đang cung cấp các API nội bộ của công ty thông qua một MCP server từ xa qua Streamable HTTP. HAI thực hành bảo mật và giao thức nào nên được triển khai? (Chọn HAI đáp án.)

**Đáp án đúng:** **D, E**

Khi triển khai MCP server từ xa qua Streamable HTTP, bắt buộc phải áp dụng **OAuth/Token authentication** trên tầng HTTP/TLS và **server-side input validation** cho mọi tool call.

- **A:** Mọi kết nối từ xa qua mạng công cộng phải mã hóa bằng HTTPS/TLS.
- **B:** Prompt từ người dùng dễ bị giả mạo qua prompt injection, không thể dùng thay thế token xác thực.
- **C:** Không bao giờ đưa mật khẩu hay credential vào `description` của tool.
- **D (Đúng):** Không bao giờ tin tưởng mù quáng tham số do LLM sinh ra; MCP server phải tự validate và sanitize đầu vào để chống injection/truy cập trái phép.
- **E (Đúng):** MCP server triển khai từ xa qua HTTP bắt buộc phải có cơ chế xác thực/phân quyền (như OAuth 2.1 / token) để bảo vệ dữ liệu và API nội bộ.

</details>

---

[Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md)
