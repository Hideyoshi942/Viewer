# Bài tập tình huống — Module 3: Files API & Multimodal Processing (Vision & PDF)

> Xử lý hình ảnh (Vision JPEG/PNG/GIF/WebP), đọc tài liệu PDF native (văn bản + biểu đồ/bảng) và tái sử dụng tệp đa phương thức qua Files API (file_id).
> **Số câu hỏi:** 7 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A developer sends a PDF invoice to Claude using the Messages API so Claude can extract line items. How should the PDF be passed inside a `user` message content array?

- **A.** As Base64-encoded raw binary bytes concatenated directly into the top-level `system` prompt parameter string
- **B.** As a `tool_result` content block inside the `user` message even though no tool was invoked
- **C.** As a content block with `type: "image"` and `source` specifying `media_type: "application/pdf"`
- **D.** As a content block with `type: "document"` and `source` specifying `media_type: "application/pdf"`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên gửi một hóa đơn PDF cho Claude bằng Messages API để Claude trích xuất các dòng chi tiết (line items). Tệp PDF phải được truyền vào bên trong mảng `content` của `user` message như thế nào?

**Đáp án đúng:** **D**

Anthropic Messages API hỗ trợ xử lý PDF trực tiếp (cả văn bản và hình ảnh/biểu đồ trong trang PDF) bằng content block `type: "document"` với `media_type: "application/pdf"`.

- **A:** Không thể nhét raw binary bytes của PDF vào chuỗi `system`.
- **B:** `tool_result` chỉ hợp lệ khi trả lời cho một `tool_use` block tương ứng từ lượt `assistant` trước đó.
- **C:** Content block `type: "image"` chỉ hỗ trợ các định dạng ảnh (`image/jpeg`, `image/png`, `image/gif`, `image/webp`), không hỗ trợ `application/pdf`.
- **D (Đúng):** Messages API hỗ trợ PDF gốc thông qua content block `type: "document"` với `source` (base64 hoặc URL/file) có `media_type: "application/pdf"`.

</details>

### Câu 2 `hard`

An application sends an image to Claude via the Messages API and receives an HTTP 400 error complaining about the image media type. Which set of image media types is supported by Claude's Vision capability?

- **A.** `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- **B.** `image/jpeg`, `image/png`, `image/svg+xml`, `image/bmp`
- **C.** Only `image/png` and `image/jpeg`
- **D.** `image/tiff`, `image/heic`, `image/png`, `image/jpeg`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng gửi một hình ảnh cho Claude qua Messages API và nhận được lỗi HTTP 400 báo lỗi về media type của hình ảnh. Tập hợp định dạng media type hình ảnh nào được hỗ trợ bởi khả năng Vision của Claude?

**Đáp án đúng:** **A**

Claude Vision hỗ trợ 4 `media_type` cho content block `type: "image"`: `image/jpeg`, `image/png`, `image/gif` và `image/webp`. Các định dạng khác như SVG, TIFF, BMP hoặc HEIC cần được convert trước.

- **A (Đúng):** Claude Vision trong Messages API hỗ trợ chính xác 4 định dạng ảnh: JPEG, PNG, GIF và WebP.
- **B:** SVG và BMP không nằm trong danh sách định dạng ảnh được hỗ trợ trực tiếp bởi `type: "image"`.
- **C:** Ngoài PNG và JPEG, Claude còn hỗ trợ `image/gif` và `image/webp`.
- **D:** TIFF và HEIC không được hỗ trợ trực tiếp; cần chuyển đổi sang JPEG/PNG/WebP trước khi gửi.

</details>

### Câu 3 `medium`

A legal tech application wants Claude to answer questions about a 40-page PDF while providing verifiable, character-level or page-level citations pointing back to exact passages in the source document. Which Messages API feature supports this natively?

- **A.** Passing the PDF bytes inside `metadata.user_id` field
- **B.** Document blocks with `citations: {"enabled": true}`
- **C.** Setting `temperature: 0.9`
- **D.** `stop_sequences: ["citation"]`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng công nghệ pháp lý muốn Claude trả lời câu hỏi về một tệp PDF 40 trang đồng thời cung cấp các trích dẫn có thể kiểm chứng ở cấp độ ký tự hoặc cấp độ trang trỏ ngược về các đoạn văn chính xác trong tài liệu gốc. Tính năng nào của Messages API hỗ trợ điều này một cách tự nhiên (natively)?

**Đáp án đúng:** **B**

Tính năng **Citations** trên content block `type: "document"` (`citations: {"enabled": true}`) cho phép Claude tự động đính kèm trích dẫn chuẩn xác từ PDF hoặc plain-text document vào các `text` block phản hồi.

- **A:** `metadata.user_id` chỉ là chuỗi định danh người dùng ẩn danh để theo dõi lạm dụng.
- **B (Đúng):** Anthropic Messages API hỗ trợ Citations gốc trên `document` content block (`citations: {"enabled": true}`), giúp Claude trả về các trích dẫn chính xác gắn với vị trí trang/đoạn trong tài liệu nguồn.
- **C:** `temperature` cao làm tăng ngẫu nhiên, không tạo citations.
- **D:** `stop_sequences` chỉ dùng để dừng sinh token, không tạo citations.

</details>

### Câu 4 `medium`

A document processing pipeline sends high-resolution scanned receipts (4,000 x 3,000 pixels) to Claude Vision. The team notices unnecessarily high input token usage and latency. What should they do before sending the images?

- **A.** Downscale images so the longest edge is <= ~1,568px (total <= ~1.15MP) while preserving text legibility.
- **B.** Split each image into 100 tiny 10x10 pixel tiles.
- **C.** Convert every image to SVG vector XML before sending.
- **D.** Upscale all scanned receipt images to 8K resolution on the client so Claude reads smaller fonts more accurately.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một pipeline xử lý tài liệu gửi các hóa đơn quét độ phân giải cao (4.000 x 3.000 pixel) tới Claude Vision. Nhóm nhận thấy mức sử dụng input token và độ trễ cao không cần thiết. Họ nên làm gì trước khi gửi hình ảnh?

**Đáp án đúng:** **A**

Để tối ưu chi phí và độ trễ với Claude Vision, hãy resize ảnh trên client về mức khuyến nghị (cạnh dài tối đa ~1,568px, tổng pixel <= ~1.15MP) miễn là chữ vẫn rõ nét.

- **A (Đúng):** Anthropic khuyến nghị resize ảnh lớn trước khi gửi (cạnh dài tối đa khoảng 1,568px hoặc ~1.15 MP) vì API cũng tự thu nhỏ ảnh quá lớn, và ảnh lớn hơn không tăng độ chính xác mà chỉ làm tăng độ trễ truyền tải.
- **B:** Chia nhỏ thành quá nhiều mảnh làm vỡ ngữ cảnh thị giác và tốn nhiều token hơn.
- **C:** `type: "image"` không hỗ trợ SVG.
- **D:** Phóng to ảnh lên 8K chỉ làm tốn băng thông và bị API thu nhỏ lại.

</details>

### Câu 5 `medium`

A backend service sends a request with `messages` containing a user prompt, and receives an HTTP 413 `request_too_large` error. What is the most direct cause and resolution?

- **A.** The `temperature` parameter exceeded 0.5 while streaming large PDF attachments.
- **B.** The `max_tokens` parameter was set too low relative to the input prompt size.
- **C.** The Anthropic server is temporarily overloaded (HTTP 529) and rejected the connection before parsing the request payload.
- **D.** The HTTP body exceeded the max request size limit (e.g., large base64 images/PDFs); resize attachments or use Files API.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một dịch vụ backend gửi một request với `messages` chứa prompt của người dùng và nhận về lỗi HTTP 413 `request_too_large`. Nguyên nhân trực tiếp nhất và cách khắc phục là gì?

**Đáp án đúng:** **D**

HTTP 413 (`request_too_large`) báo hiệu tổng dung lượng HTTP request vượt giới hạn (thường gặp khi gửi nhiều file PDF/ảnh base64 kích thước lớn). Cần nén/resize ảnh, chia nhỏ tài liệu hoặc dùng Files API.

- **A:** `temperature` hợp lệ từ 0.0 đến 1.0 và không liên quan đến kích thước payload.
- **B:** `max_tokens` thấp gây cắt output (`stop_reason: "max_tokens"`), không gây lỗi 413.
- **C:** Quá tải server trả về HTTP 529, không phải 413.
- **D (Đúng):** HTTP 413 xảy ra khi kích thước payload HTTP (tính bằng megabytes, thường do đính kèm nhiều ảnh/PDF base64 quá nặng) vượt giới hạn tối đa của endpoint.

</details>

### Câu 6 `medium`

An engineering team needs to reference the same 5 MB PDF across 30 separate Messages API calls in a user session without re-uploading the base64 payload 30 times. Which Anthropic capability solves this?

- **A.** Upload the PDF once using the Files API (`client.beta.files.upload`) and reference its `file_id` in subsequent `document` blocks.
- **B.** Send the base64-encoded PDF inside `metadata.file_data` so it persists across user session calls.
- **C.** Store the raw PDF bytes inside `stop_sequences` so they are omitted from the generated output.
- **D.** Pass the local laptop file path `/Users/dev/doc.pdf` directly in `source.path` so the SDK streams the PDF bytes on every API call.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ thuật cần tham chiếu cùng một tệp PDF 5 MB qua 30 lệnh gọi Messages API riêng biệt trong một phiên làm việc của người dùng mà không phải tải lên lại payload base64 30 lần. Khả năng nào của Anthropic giải quyết vấn đề này?

**Đáp án đúng:** **A**

Files API giúp giảm băng thông và đơn giản hóa code khi cùng một tài liệu lớn (PDF, ảnh, dữ liệu) được sử dụng lặp lại qua nhiều lượt gọi Messages API.

- **A (Đúng):** Files API cho phép upload file một lần để nhận `file_id`, sau đó tái sử dụng `file_id` đó trong các `document`/`image` block ở nhiều request tiếp theo mà không cần gửi lại base64.
- **B:** `metadata` chỉ hỗ trợ `user_id`.
- **C:** `stop_sequences` không dùng để lưu trữ file.
- **D:** API đám mây không thể đọc đường dẫn file cục bộ trên máy của bạn.

</details>

### Câu 7 `medium`

A developer is building an integration that processes multi-page PDFs with Claude. Which TWO statements about PDF handling in the Messages API are accurate? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** A single PDF document block is limited to 1 page maximum per request.
- **B.** Password-protected encrypted PDFs are automatically decrypted by Anthropic without providing a password.
- **C.** PDFs can be supplied via a `document` content block using base64 encoding, a public URL, or a Files API `file_id`.
- **D.** PDFs must be converted to plain ASCII text by the client because Claude cannot read tables, charts, or scanned images inside PDF files.
- **E.** Claude inspects both the extracted text and visual layout (charts, tables, scanned pages) of PDF pages.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên đang xây dựng tích hợp xử lý các tệp PDF nhiều trang với Claude. HAI phát biểu nào sau đây về xử lý PDF trong Messages API là chính xác? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Messages API xử lý PDF nhiều trang rất mạnh nhờ kết hợp đọc chữ và nhìn bố cục (charts/tables), hỗ trợ truyền qua `base64`, `url` hoặc `file_id` trong block `type: "document"`.

- **A:** Messages API hỗ trợ PDF nhiều trang (tùy giới hạn số trang và dung lượng tổng của request).
- **B:** PDF có mật khẩu mã hóa cần được giải mã trước khi gửi lên API.
- **C (Đúng):** Content block `type: "document"` hỗ trợ nguồn `base64`, `url` hoặc `file_id` (qua Files API).
- **D:** Không bắt buộc convert sang ASCII; làm vậy sẽ mất hết thông tin biểu đồ và bố cục bảng.
- **E (Đúng):** Xử lý PDF gốc của Claude hiểu được cả văn bản lẫn bố cục thị giác như biểu đồ, bảng biểu và trang scan.

</details>

---

[Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md)
