# Bài tập tình huống — Amazon Bedrock Agents, Action Groups & Bedrock Flows

> Tự động hóa tác vụ đa bước theo mô hình ReAct, kết nối AWS Lambda qua Action Groups (OpenAPI Schema), Session Memory và điều phối workflow với Bedrock Flows.
> **Số câu hỏi:** 6 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

An e-commerce company wants an AI assistant on Amazon Bedrock that can autonomously look up a customer's order status, check warehouse inventory, and initiate a refund by calling internal microservices. Which Bedrock feature enables this multi-step orchestration and API execution?

- **A.** Amazon Bedrock Guardrails with custom denied topic policies
- **B.** Amazon Bedrock Model Evaluation with human-in-the-loop jobs
- **C.** Amazon Titan Image Generator with watermark verification
- **D.** Agents for Amazon Bedrock with Action Groups and AWS Lambda

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty thương mại điện tử muốn có một trợ lý AI trên Amazon Bedrock có thể tự chủ tra cứu trạng thái đơn hàng của khách hàng, kiểm tra tồn kho tại kho hàng và khởi tạo hoàn tiền bằng cách gọi các microservice nội bộ. Tính năng nào của Bedrock cho phép điều phối nhiều bước và thực thi API này?

**Đáp án đúng:** **D**

Bedrock Agents kết hợp ReAct reasoning với Action Groups (OpenAPI Schema + AWS Lambda) để biến Foundation Model thành trợ lý có khả năng hành động thực tế trên hệ thống doanh nghiệp.

- **A:** Sai. Guardrails dùng để lọc nội dung độc hại, PII và kiểm tra grounding, không thực thi gọi API nghiệp vụ.
- **B:** Sai. Model Evaluation dùng để so sánh và đánh giá chất lượng các Foundation Models.
- **C:** Sai. Đây là mô hình tạo sinh hình ảnh, không có khả năng điều phối API.
- **D (Đúng):** Chính xác. Bedrock Agents sử dụng cơ chế ReAct để lập kế hoạch đa bước và gọi Action Groups (mô tả bằng OpenAPI schema, thực thi qua AWS Lambda) nhằm tương tác với hệ thống nội bộ.

</details>

### Câu 2 `easy`

A marketing team wants to build a reusable, low-code generative AI workflow that connects a versioned prompt template, a Knowledge Base query, a conditional branch, and an AWS Lambda function in a visual designer. Which Amazon Bedrock feature provides this capability?

- **A.** Amazon SageMaker Clarify bias detection
- **B.** Amazon Polly neural text-to-speech API
- **C.** Amazon Bedrock Flows and Prompt Management
- **D.** Amazon Rekognition custom label detection

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ marketing muốn xây dựng một quy trình generative AI ít viết mã (low-code), có thể tái sử dụng, kết nối một mẫu prompt đã được đánh phiên bản, một truy vấn Knowledge Base, một nhánh điều kiện và một hàm AWS Lambda trong trình thiết kế trực quan. Tính năng nào của Amazon Bedrock cung cấp khả năng này?

**Đáp án đúng:** **C**

Bedrock Flows (kết hợp Prompt Management) là công cụ visual workflow builder giúp xâu chuỗi các thành phần GenAI nhanh chóng với ít code.

- **A:** Sai. SageMaker Clarify dùng để phát hiện bias và giải thích mô hình ML.
- **B:** Sai. Amazon Polly chuyển đổi văn bản thành giọng nói.
- **C (Đúng):** Chính xác. Amazon Bedrock Flows cho phép thiết kế trực quan quy trình GenAI đa bước kết hợp Prompt Management, Knowledge Bases, Lambda và các nhánh điều kiện.
- **D:** Sai. Amazon Rekognition là dịch vụ phân tích hình ảnh và video.

</details>

### Câu 3 `medium`

An e-commerce company wants to build an AI assistant that not only answers product questions from a catalog, but also checks real-time inventory in a database and processes customer order cancellations by calling backend APIs. Which Amazon Bedrock feature enables this autonomous multi-step execution?

- **A.** Amazon Bedrock Agents
- **B.** Amazon Bedrock Model Evaluation
- **C.** Amazon Titan Embeddings
- **D.** Amazon Polly

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty thương mại điện tử muốn xây dựng trợ lý AI không chỉ trả lời các câu hỏi về sản phẩm từ danh mục, mà còn kiểm tra tồn kho theo thời gian thực trong cơ sở dữ liệu và xử lý hủy đơn hàng của khách hàng bằng cách gọi các API backend. Tính năng nào của Amazon Bedrock cho phép thực thi tự chủ nhiều bước này?

**Đáp án đúng:** **A**

Amazon Bedrock Agents cho phép FM hành động như một tác tử tự chủ (autonomous agent): lập kế hoạch, truy xuất Knowledge Base và gọi AWS Lambda qua Action Groups để thực hiện nghiệp vụ thực tế.

- **A (Đúng):** Chính xác. Amazon Bedrock Agents sử dụng khả năng suy luận của FM để chia nhỏ yêu cầu, gọi các Action Groups (thông qua AWS Lambda và OpenAPI schema) để tương tác với API/database và hoàn thành tác vụ.
- **B:** Sai. Model Evaluation dùng để đánh giá chất lượng mô hình, không thực thi API nghiệp vụ.
- **C:** Sai. Titan Embeddings chỉ chuyển văn bản/ảnh thành vector số.
- **D:** Sai. Amazon Polly là dịch vụ Text-to-Speech.

</details>

### Câu 4 `medium`

A team wants to build a complex Generative AI workflow that routes incoming customer requests to different Foundation Models, queries a Knowledge Base, runs a conditional check, and formats the final output—all using a visual drag-and-drop builder in Amazon Bedrock. Which feature should they use?

- **A.** Amazon Bedrock Flows
- **B.** Amazon SageMaker Clarify
- **C.** Amazon Comprehend Custom Classification
- **D.** Amazon Transcribe

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ muốn xây dựng quy trình Generative AI phức tạp để định tuyến các yêu cầu khách hàng đến các Foundation Model khác nhau, truy vấn Knowledge Base, chạy kiểm tra điều kiện và định dạng đầu ra cuối cùng — tất cả bằng trình tạo kéo-thả trực quan trong Amazon Bedrock. Họ nên sử dụng tính năng nào?

**Đáp án đúng:** **A**

Amazon Bedrock Flows là công cụ orchestration trực quan giúp xây dựng và quản lý các pipeline Prompt Chaining và RAG đa bước một cách nhanh chóng.

- **A (Đúng):** Chính xác. Amazon Bedrock Flows (trước đây gọi là Prompt Flows) cho phép thiết kế trực quan các luồng xử lý GenAI phức tạp kết nối Prompt, FM, Knowledge Bases, Lambda và nhánh điều kiện.
- **B:** Sai. Clarify dùng để kiểm tra bias và giải thích mô hình.
- **C:** Sai. Comprehend chỉ phân loại văn bản, không điều phối luồng đa bước GenAI.
- **D:** Sai. Transcribe là dịch vụ chuyển giọng nói thành văn bản.

</details>

### Câu 5 `medium`

A solutions architect is designing an automated travel booking assistant using Amazon Bedrock Agents. Which TWO components are core building blocks of an Amazon Bedrock Agent? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Amazon SageMaker Ground Truth labeling jobs triggered during each user chat
- **B.** Action Groups defined with OpenAPI schemas and backed by AWS Lambda functions
- **C.** Amazon Forecast time-series predictors invoked on every user API request
- **D.** Knowledge Bases for retrieving grounding context from enterprise documents
- **E.** Amazon Redshift data warehouse clusters for storing short-term chat memory

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiến trúc sư giải pháp đang thiết kế trợ lý đặt vé du lịch tự động bằng Amazon Bedrock Agents. HAI thành phần nào là khối xây dựng cốt lõi của một Amazon Bedrock Agent? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Một Amazon Bedrock Agent hoàn chỉnh kết hợp: Foundation Model (điều phối suy luận ReAct), Instructions, Action Groups (OpenAPI + Lambda), Knowledge Bases (RAG) và Guardrails.

- **A:** Sai. Ground Truth dùng để gắn nhãn dữ liệu huấn luyện offline, không phải thành phần của Bedrock Agent.
- **B (Đúng):** Chính xác. Action Groups định nghĩa các API/hành động (qua OpenAPI schema) mà Agent có thể gọi, thực thi bằng AWS Lambda để đặt vé hoặc tra cứu hệ thống.
- **C:** Sai. Amazon Forecast không phải thành phần kiến trúc của Bedrock Agent.
- **D (Đúng):** Chính xác. Bedrock Agents có thể tích hợp trực tiếp Knowledge Bases để tra cứu chính sách du lịch hoặc quy định hoàn vé trước khi hành động.
- **E:** Sai. Bedrock Agents quản lý session memory tích hợp sẵn, không yêu cầu Redshift cluster.

</details>

### Câu 6 `medium`

An airline wants its AI assistant to not only answer baggage policy questions but also look up a passenger's booking status, cancel a flight, and issue a refund by calling internal REST APIs. Which Amazon Bedrock feature enables this multi-step workflow?

- **A.** Amazon Bedrock Model Evaluation
- **B.** Agents for Amazon Bedrock
- **C.** Amazon Bedrock Batch Inference
- **D.** Amazon Bedrock Provisioned Throughput

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hãng hàng không muốn trợ lý AI của mình không chỉ trả lời các câu hỏi về chính sách hành lý mà còn có thể tra cứu trạng thái đặt chỗ của hành khách, hủy chuyến bay và hoàn tiền bằng cách gọi các REST API nội bộ. Tính năng nào của Amazon Bedrock cho phép thực hiện quy trình nhiều bước này?

**Đáp án đúng:** **B**

Khi bài toán yêu cầu LLM 'take actions', 'call APIs', 'execute multi-step tasks' (đặt vé, hủy đơn, hoàn tiền), đáp án chuẩn là Agents for Amazon Bedrock.

- **A:** Sai. Model Evaluation dùng để chấm điểm và so sánh chất lượng các mô hình, không thực thi tác vụ API.
- **B (Đúng):** Chính xác. Agents for Amazon Bedrock sử dụng cơ chế lập kế hoạch (ReAct) kết hợp Action Groups (OpenAPI schema + AWS Lambda) để tự động gọi API bên ngoài thực hiện các hành động nhiều bước.
- **C:** Sai. Batch Inference chỉ xử lý hàng loạt prompt tĩnh từ file S3.
- **D:** Sai. Provisioned Throughput là gói định giá băng thông cho model, không phải tính năng thực thi hành động.

</details>

---

[Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md)
