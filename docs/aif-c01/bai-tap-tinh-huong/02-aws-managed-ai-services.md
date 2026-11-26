# Bài tập tình huống — Hệ sinh thái Dịch vụ AWS AI Quản lý (Managed AI Services)

> Ánh xạ bài toán thực tế với Amazon Rekognition, Textract, Comprehend, Transcribe, Polly, Translate, Lex, Kendra, Personalize và Fraud Detector.
> **Số câu hỏi:** 4 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

An insurance company receives thousands of scanned claim forms containing handwritten notes, checkboxes, and multi-column tables. The company needs to automatically extract key-value pairs and tabular data into JSON format without building custom OCR models. Which AWS service meets this requirement?

- **A.** Amazon Rekognition
- **B.** Amazon Textract
- **C.** Amazon Comprehend
- **D.** Amazon Transcribe

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty bảo hiểm nhận hàng nghìn mẫu đơn yêu cầu bồi thường được quét chứa ghi chú viết tay, hộp kiểm (checkbox) và bảng nhiều cột. Công ty cần tự động trích xuất các cặp key-value và dữ liệu dạng bảng sang định dạng JSON mà không phải xây dựng mô hình OCR tùy chỉnh. Dịch vụ AWS nào đáp ứng yêu cầu này?

**Đáp án đúng:** **B**

Amazon Textract là dịch vụ Intelligent Document Processing (IDP) chuyên trích xuất văn bản, bảng biểu và form từ tài liệu scan, vượt trội hơn OCR truyền thống.

- **A:** Sai. Rekognition chỉ hỗ trợ nhận diện chữ đơn giản trong ảnh/video tự nhiên (biển hiệu, biển số), không chuyên bóc tách biểu mẫu, checkbox và bảng phức tạp.
- **B (Đúng):** Chính xác. Amazon Textract tự động trích xuất văn bản, chữ viết tay, biểu mẫu (key-value pairs), checkbox và bảng biểu từ tài liệu scan/PDF.
- **C:** Sai. Comprehend phân tích ý nghĩa ngữ nghĩa của văn bản thuần (sentiment, entities) sau khi đã có text, không thực hiện OCR trên ảnh scan.
- **D:** Sai. Transcribe chuyển đổi giọng nói thành văn bản (speech-to-text).

</details>

### Câu 2 `medium`

A media streaming platform wants to automatically generate realistic spoken audio versions of news articles in multiple languages, with fine-grained control over pronunciation, pauses, and speaking rate using SSML tags. Which AWS service should the platform use?

- **A.** Amazon Transcribe
- **B.** Amazon Polly
- **C.** Amazon Translate
- **D.** Amazon Lex

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng phát trực tuyến truyền thông muốn tự động tạo phiên bản âm thanh giọng nói chân thực cho các bài báo bằng nhiều ngôn ngữ, với khả năng kiểm soát chi tiết cách phát âm, khoảng ngắt và tốc độ nói bằng thẻ SSML. Nền tảng nên sử dụng dịch vụ AWS nào?

**Đáp án đúng:** **B**

Amazon Polly chuyển văn bản thành giọng nói (Text-to-Speech) và hỗ trợ chuẩn SSML (Speech Synthesis Markup Language) để kiểm soát ngữ điệu, phát âm và tốc độ.

- **A:** Sai. Amazon Transcribe thực hiện Speech-to-Text (chuyển âm thanh thành văn bản), ngược lại với yêu cầu.
- **B (Đúng):** Chính xác. Amazon Polly là dịch vụ Text-to-Speech (TTS) hỗ trợ Neural voices tự nhiên, đa ngôn ngữ và thẻ SSML để tinh chỉnh phát âm, ngắt nghỉ và tốc độ đọc.
- **C:** Sai. Amazon Translate chỉ dịch văn bản từ ngôn ngữ này sang ngôn ngữ khác, không tổng hợp giọng nói.
- **D:** Sai. Amazon Lex dùng để xây dựng chatbot hội thoại tương tác (intent/slot), không phải dịch vụ chuyên đọc bài báo.

</details>

### Câu 3 `easy`

A retail website wants to provide real-time, personalized product recommendations to shoppers based on their clickstream history and past purchases, while also recommending newly added items with no interaction history. Which AWS managed AI service should the company use?

- **A.** Amazon Kendra search
- **B.** Amazon Lex chatbot
- **C.** Amazon Personalize
- **D.** Amazon Translate API

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một trang web bán lẻ muốn cung cấp đề xuất sản phẩm được cá nhân hóa theo thời gian thực cho người mua sắm dựa trên lịch sử nhấp chuột và các lần mua hàng trước đây, đồng thời đề xuất các mặt hàng mới thêm chưa có lịch sử tương tác. Công ty nên sử dụng dịch vụ AI được quản lý nào của AWS?

**Đáp án đúng:** **C**

Amazon Personalize cung cấp công nghệ gợi ý cá nhân hóa tương tự Amazon.com dưới dạng dịch vụ quản lý hoàn toàn, hỗ trợ cả real-time và batch recommendations.

- **A:** Sai. Amazon Kendra là dịch vụ tìm kiếm thông minh cho tài liệu doanh nghiệp.
- **B:** Sai. Amazon Lex dùng để xây dựng chatbot hội thoại.
- **C (Đúng):** Chính xác. Amazon Personalize là dịch vụ gợi ý sản phẩm/nội dung thời gian thực (real-time recommendations), tự động xử lý bài toán cold-start cho sản phẩm mới và người dùng mới.
- **D:** Sai. Amazon Translate dùng để dịch ngôn ngữ.

</details>

### Câu 4 `easy`

An insurance company receives thousands of scanned PDF claim forms containing structured tables and key-value fields. The company wants to automatically extract this data with minimal ML expertise. Which AWS service should the company use?

- **A.** Amazon Rekognition
- **B.** Amazon Comprehend
- **C.** Amazon Textract
- **D.** Amazon Transcribe

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty bảo hiểm nhận hàng nghìn mẫu đơn yêu cầu bồi thường dạng PDF được quét chứa các bảng có cấu trúc và các trường key-value. Công ty muốn tự động trích xuất dữ liệu này với yêu cầu chuyên môn ML tối thiểu. Công ty nên sử dụng dịch vụ AWS nào?

**Đáp án đúng:** **C**

Từ khóa 'scanned PDF', 'forms', 'tables', 'key-value pairs' luôn ánh xạ trực tiếp tới Amazon Textract.

- **A:** Sai. Amazon Rekognition chuyên phân tích ảnh/video (nhận diện khuôn mặt, vật thể, chữ đơn giản trên biển hiệu), không chuyên bóc tách bảng biểu và form phức tạp.
- **B:** Sai. Amazon Comprehend xử lý ngôn ngữ tự nhiên (NLP) trên văn bản thuần đã có sẵn, không thực hiện OCR bóc tách từ file PDF scan.
- **C (Đúng):** Chính xác. Amazon Textract là dịch vụ OCR thông minh được thiết kế riêng để trích xuất văn bản, bảng biểu (tables) và cặp khóa-giá trị (forms) từ tài liệu scan và PDF.
- **D:** Sai. Amazon Transcribe chuyển đổi âm thanh/giọng nói thành văn bản (Speech-to-Text).

</details>

---

[Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md)
