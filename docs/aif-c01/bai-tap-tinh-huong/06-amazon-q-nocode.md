# Bài tập tình huống — Hệ sinh thái Amazon Q (Business, Developer) & No-Code ML (Canvas, PartyRock)

> Ứng dụng trợ lý AI doanh nghiệp Amazon Q Business, Amazon Q Developer, Amazon Q in QuickSight, SageMaker Canvas và AWS PartyRock.
> **Số câu hỏi:** 6 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `easy`

A software development organization wants an AI coding assistant integrated directly into their IDEs (such as VS Code and JetBrains) to generate code, explain functions, and upgrade legacy Java applications. Which AWS service is purpose-built for this use case?

- **A.** Amazon Q Business assistant
- **B.** Amazon Comprehend NLP API
- **C.** Amazon Q Developer
- **D.** Amazon Lex chatbot builder

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức phát triển phần mềm muốn có một trợ lý lập trình AI tích hợp trực tiếp vào các IDE của họ (như VS Code và JetBrains) để tạo code, giải thích hàm và nâng cấp các ứng dụng Java cũ. Dịch vụ AWS nào được xây dựng chuyên biệt cho trường hợp sử dụng này?

**Đáp án đúng:** **C**

Phân biệt rõ: Amazon Q Developer phục vụ lập trình viên và vận hành AWS; Amazon Q Business phục vụ nhân viên doanh nghiệp tìm kiếm và tổng hợp tri thức nội bộ.

- **A:** Sai. Amazon Q Business là trợ lý doanh nghiệp kết nối dữ liệu nội bộ (Confluence, SharePoint, S3) cho nhân viên văn phòng hỏi đáp.
- **B:** Sai. Comprehend là dịch vụ phân tích văn bản NLP (sentiment, entities), không phải trợ lý lập trình.
- **C (Đúng):** Chính xác. Amazon Q Developer là trợ lý AI chuyên biệt cho lập trình viên, tích hợp vào IDE để sinh code, kiểm tra bảo mật, debug và nâng cấp ứng dụng (như Java 8 lên 17).
- **D:** Sai. Amazon Lex dùng để xây dựng chatbot hội thoại đa kênh cho khách hàng.

</details>

### Câu 2 `easy`

A software development organization wants an AI assistant integrated directly into their IDEs to generate unit tests, explain legacy code, suggest real-time code completions, and assist with Java version upgrades. Which AWS service is purpose-built for this use case?

- **A.** Amazon Q Business
- **B.** Amazon Q Developer
- **C.** AWS PartyRock
- **D.** Amazon Comprehend

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức phát triển phần mềm muốn có một trợ lý AI tích hợp trực tiếp vào IDE để tạo unit test, giải thích code cũ, gợi ý hoàn thiện code theo thời gian thực và hỗ trợ nâng cấp phiên bản Java. Dịch vụ AWS nào được xây dựng chuyên biệt cho trường hợp sử dụng này?

**Đáp án đúng:** **B**

Amazon Q Developer tối ưu cho vòng đời phát triển phần mềm (SDLC): viết code, giải thích code, sinh test, quét bảo mật và chuyển đổi phiên bản ngôn ngữ lập trình.

- **A:** Sai. Amazon Q Business là trợ lý AI cho nhân viên văn phòng hỏi đáp tài liệu nội bộ (SharePoint, Confluence, S3), không chuyên về lập trình trong IDE.
- **B (Đúng):** Chính xác. Amazon Q Developer (trước đây là CodeWhisperer) tích hợp vào IDE để gợi ý code, tạo unit test, quét lỗ hổng bảo mật và nâng cấp mã nguồn (như Java 8 lên Java 17).
- **C:** Sai. PartyRock là sân chơi no-code trên web để thử nghiệm nhanh prompt và xây ứng dụng GenAI đơn giản.
- **D:** Sai. Comprehend là dịch vụ NLP phân tích văn bản, không hỗ trợ lập trình.

</details>

### Câu 3 `medium`

An enterprise wants to deploy a generative AI assistant for 10,000 employees that connects to SharePoint, Confluence, and Amazon S3, and strictly enforces existing user-level access permissions (ACLs) so employees only see answers from documents they are authorized to read. Which AWS service provides this out of the box?

- **A.** Amazon Q Business
- **B.** Amazon Q Developer
- **C.** AWS PartyRock
- **D.** Amazon Comprehend

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp muốn triển khai trợ lý generative AI cho 10.000 nhân viên, kết nối với SharePoint, Confluence và Amazon S3, đồng thời thực thi nghiêm ngặt các quyền truy cập cấp người dùng (ACL) hiện có để nhân viên chỉ thấy câu trả lời từ những tài liệu họ được phép đọc. Dịch vụ AWS nào cung cấp sẵn tính năng này?

**Đáp án đúng:** **A**

Amazon Q Business là lựa chọn số 1 khi doanh nghiệp muốn triển khai trợ lý tri thức nội bộ nhanh chóng với các connector có sẵn và kiểm soát phân quyền theo người dùng (ACL-aware).

- **A (Đúng):** Chính xác. Amazon Q Business là trợ lý AI doanh nghiệp được quản lý hoàn toàn, tích hợp hơn 40 connector (SharePoint, Confluence, S3, Jira...) và tự động tôn trọng quyền truy cập (ACL/IAM) của từng nhân viên.
- **B:** Sai. Amazon Q Developer chuyên hỗ trợ lập trình viên viết code và vận hành AWS.
- **C:** Sai. PartyRock là công cụ thử nghiệm prompt công khai, không kết nối nguồn dữ liệu nội bộ có phân quyền doanh nghiệp.
- **D:** Sai. Comprehend là API phân tích NLP, không phải trợ lý hỏi đáp doanh nghiệp tích hợp connector và ACL.

</details>

### Câu 4 `easy`

A non-technical product manager wants to quickly experiment with prompts, chain multiple Foundation Models together, and share a simple web-based Generative AI prototype with colleagues without writing any code or setting up an AWS account for each tester. Which tool should the product manager use?

- **A.** AWS PartyRock
- **B.** Amazon SageMaker Training Jobs
- **C.** AWS CloudFormation
- **D.** Amazon Kendra

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một quản lý sản phẩm không chuyên về kỹ thuật muốn nhanh chóng thử nghiệm các prompt, liên kết nhiều Foundation Model với nhau và chia sẻ một nguyên mẫu Generative AI dạng web đơn giản với đồng nghiệp mà không cần viết code hay thiết lập tài khoản AWS cho từng người thử nghiệm. Quản lý sản phẩm nên sử dụng công cụ nào?

**Đáp án đúng:** **A**

AWS PartyRock là công cụ lý tưởng để tạo mẫu nhanh (rapid prototyping) và học tập về Prompt Engineering mà không cần viết code hay quản lý tài khoản AWS phức tạp.

- **A (Đúng):** Chính xác. AWS PartyRock (xây dựng trên Amazon Bedrock) là sân chơi no-code miễn phí/dễ dùng trên web để thử nghiệm prompt, tạo app GenAI nhanh và chia sẻ qua link.
- **B:** Sai. SageMaker Training Jobs dành cho kỹ sư ML chạy huấn luyện code tùy chỉnh.
- **C:** Sai. CloudFormation là công cụ Infrastructure as Code.
- **D:** Sai. Kendra là dịch vụ tìm kiếm doanh nghiệp.

</details>

### Câu 5 `medium`

An enterprise wants to deploy a ready-to-use generative AI assistant for 5,000 employees that connects directly to internal SharePoint, Confluence, and Amazon S3 repositories while strictly respecting each employee's existing document access permissions. Which AWS service should they choose?

- **A.** AWS PartyRock for no-code prompt playgrounds
- **B.** Amazon Lex for intent-based voice chatbots
- **C.** Amazon Comprehend for NLP entity extraction
- **D.** Amazon Q Business

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp muốn triển khai một trợ lý generative AI sẵn sàng sử dụng cho 5.000 nhân viên, kết nối trực tiếp đến các kho lưu trữ nội bộ như SharePoint, Confluence và Amazon S3, đồng thời tuân thủ nghiêm ngặt quyền truy cập tài liệu hiện có của từng nhân viên. Họ nên chọn dịch vụ AWS nào?

**Đáp án đúng:** **D**

Amazon Q Business giúp triển khai nhanh trợ lý GenAI doanh nghiệp mà không phải tự xây dựng toàn bộ hệ thống RAG và cơ chế phân quyền tài liệu (ACL) từ đầu.

- **A:** Sai. PartyRock chỉ là sân chơi no-code để thử nghiệm nhanh ứng dụng GenAI cá nhân, không phải giải pháp doanh nghiệp kết nối ACL nội bộ.
- **B:** Sai. Amazon Lex dùng để xây dựng chatbot/voicebot theo kịch bản Intents & Slots, không tích hợp sẵn kho tài liệu doanh nghiệp kèm ACL như Amazon Q Business.
- **C:** Sai. Amazon Comprehend chỉ là dịch vụ NLP phân tích văn bản, không phải trợ lý hỏi đáp GenAI.
- **D (Đúng):** Chính xác. Amazon Q Business là trợ lý AI doanh nghiệp sẵn dùng có hơn 40 đầu nối dữ liệu (SharePoint, Confluence, S3...) và tự động thực thi phân quyền truy cập (ACL) theo danh tính từng nhân viên.

</details>

### Câu 6 `medium`

A non-technical product manager wants to quickly prototype a generative AI idea without writing code, while the engineering team wants an AI coding assistant inside their IDE to generate unit tests and upgrade legacy Java applications. Which TWO AWS tools should they use respectively? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** PartyRock
- **B.** Amazon Q Developer
- **C.** Amazon SageMaker Ground Truth
- **D.** Amazon Textract
- **E.** AWS DeepRacer

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một quản lý sản phẩm không chuyên về kỹ thuật muốn nhanh chóng tạo nguyên mẫu cho một ý tưởng generative AI mà không cần viết code, trong khi đội ngũ kỹ sư muốn có một trợ lý lập trình AI ngay trong IDE để tạo unit test và nâng cấp các ứng dụng Java cũ. Họ nên sử dụng HAI công cụ AWS nào tương ứng? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, B**

PartyRock phục vụ prototyping GenAI không cần code, còn Amazon Q Developer là trợ lý AI chuyên biệt cho toàn bộ vòng đời phát triển phần mềm (SDLC).

- **A (Đúng):** Chính xác. PartyRock là môi trường playground không cần code (no-code) chạy trên Amazon Bedrock giúp người không chuyên kỹ thuật tạo nhanh nguyên mẫu ứng dụng GenAI.
- **B (Đúng):** Chính xác. Amazon Q Developer tích hợp trực tiếp vào IDE để sinh code, viết unit test, quét bảo mật và nâng cấp phiên bản Java/.NET (Code Transformation).
- **C:** Sai. SageMaker Ground Truth là dịch vụ gán nhãn dữ liệu huấn luyện (Data Labeling).
- **D:** Sai. Amazon Textract là dịch vụ trích xuất văn bản và bảng biểu từ tài liệu.
- **E:** Sai. AWS DeepRacer là công cụ học tập Reinforcement Learning qua mô phỏng xe đua tự hành.

</details>

---

[Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md)
