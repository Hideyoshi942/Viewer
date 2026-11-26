# Bài tập tình huống — SageMaker Clarify, Model Cards, Bedrock Guardrails & Amazon A2I

> Phát hiện sai lệch và giải thích SHAP với SageMaker Clarify, tài liệu hóa minh bạch bằng Model Cards, lọc nội dung Bedrock Guardrails và kiểm duyệt con người Amazon A2I.
> **Số câu hỏi:** 16 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A healthcare RAG chatbot built on Amazon Bedrock occasionally fabricates medication dosages that are not present in the retrieved clinical guidelines. Which Amazon Bedrock Guardrails feature should the team enable to automatically detect and block responses not supported by the retrieved source context?

- **A.** Custom Word Filters list
- **B.** Contextual Grounding Check
- **C.** Knowledge Model Distillation
- **D.** Amazon Polly Pronunciation Lexicons

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một chatbot RAG y tế xây dựng trên Amazon Bedrock thỉnh thoảng tự bịa ra liều lượng thuốc không có trong các hướng dẫn lâm sàng được truy xuất. Đội ngũ nên bật tính năng nào của Amazon Bedrock Guardrails để tự động phát hiện và chặn các phản hồi không được hỗ trợ bởi ngữ cảnh nguồn đã truy xuất?

**Đáp án đúng:** **B**

Contextual Grounding Check là tính năng chuyên biệt của Amazon Bedrock Guardrails giúp giảm Hallucination trong các ứng dụng RAG bằng cách đối chiếu câu trả lời với ngữ cảnh nguồn.

- **A:** Sai. Word Filters chỉ chặn danh sách từ khóa cố định, không kiểm tra được tính xác thực so với tài liệu RAG.
- **B (Đúng):** Chính xác. Contextual Grounding Check trong Bedrock Guardrails chấm điểm mức độ bám sát nguồn RAG (Grounding score) và mức độ liên quan (Relevance score), tự động chặn các câu trả lời bịa đặt (hallucination).
- **C:** Sai. Model Distillation là kỹ thuật nén mô hình, không phải cơ chế kiểm tra hallucination của Guardrails.
- **D:** Sai. Lexicons trong Polly dùng để tùy chỉnh cách phát âm giọng nói.

</details>

### Câu 2 `medium`

A retail bank deploys a customer-facing chatbot using Amazon Bedrock. Compliance requires that the chatbot strictly refuse to give personalized stock-investment advice or cryptocurrency recommendations. Which Amazon Bedrock Guardrails feature directly enforces this business rule?

- **A.** Denied Topics
- **B.** Amazon SageMaker Feature Store
- **C.** AWS KMS Key Rotation
- **D.** Batch Inference

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ngân hàng bán lẻ triển khai chatbot hướng tới khách hàng sử dụng Amazon Bedrock. Quy định tuân thủ yêu cầu chatbot phải từ chối nghiêm ngặt việc đưa ra lời khuyên đầu tư cổ phiếu cá nhân hóa hoặc khuyến nghị tiền mã hóa. Tính năng nào của Amazon Bedrock Guardrails thực thi trực tiếp quy tắc nghiệp vụ này?

**Đáp án đúng:** **A**

Denied Topics trong Amazon Bedrock Guardrails là lựa chọn chuẩn khi cần chặn các chủ đề không mong muốn hoặc vi phạm quy định tuân thủ của doanh nghiệp.

- **A (Đúng):** Chính xác. Denied Topics cho phép định nghĩa các chủ đề bị cấm theo ngữ nghĩa nghiệp vụ (ví dụ tư vấn đầu tư cổ phiếu/crypto) để Guardrail tự động từ chối trả lời.
- **B:** Sai. Feature Store dùng để lưu trữ feature cho mô hình ML.
- **C:** Sai. KMS Key Rotation dùng để xoay vòng khóa mã hóa dữ liệu.
- **D:** Sai. Batch Inference là chế độ chạy suy luận hàng loạt.

</details>

### Câu 3 `medium`

A financial institution trained a loan-approval model on Amazon SageMaker and must explain to regulators which input features (such as income, credit history, or debt-to-income ratio) contributed most to individual approval or rejection decisions, while also checking for demographic bias. Which SageMaker tool should they use?

- **A.** Amazon SageMaker Clarify
- **B.** Amazon SageMaker Ground Truth
- **C.** Amazon Transcribe
- **D.** Amazon Bedrock Flows

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức tài chính đã huấn luyện mô hình phê duyệt khoản vay trên Amazon SageMaker và phải giải thích cho cơ quan quản lý biết những đặc trưng đầu vào nào (như thu nhập, lịch sử tín dụng hoặc tỷ lệ nợ trên thu nhập) đóng góp nhiều nhất vào từng quyết định phê duyệt hay từ chối, đồng thời kiểm tra sự thiên vị nhân khẩu học (demographic bias). Họ nên sử dụng công cụ SageMaker nào?

**Đáp án đúng:** **A**

Amazon SageMaker Clarify là công cụ cốt lõi trong Domain 4 (Responsible AI) cho hai nhiệm vụ: phát hiện thiên lệch (Bias Detection) và giải thích mô hình (Explainability via SHAP).

- **A (Đúng):** Chính xác. SageMaker Clarify cung cấp khả năng phát hiện Bias (trước và sau khi train) và giải thích mô hình (Explainability) dựa trên giá trị SHAP cho từng dự đoán.
- **B:** Sai. Ground Truth là dịch vụ gán nhãn dữ liệu huấn luyện.
- **C:** Sai. Transcribe là dịch vụ chuyển giọng nói thành văn bản.
- **D:** Sai. Bedrock Flows dùng để thiết kế luồng ứng dụng GenAI.

</details>

### Câu 4 `medium`

An insurance company is deploying an AI document-processing pipeline using Amazon Textract and wants to ensure human reviewers verify low-confidence predictions while maintaining standardized model documentation for auditors. Which TWO AWS services should they use? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Amazon Personalize for real-time product recommendation ranking
- **B.** Amazon Polly for automated audio narration of compliance reports
- **C.** Amazon Augmented AI (Amazon A2I) for human review workflows
- **D.** AWS DeepRacer for training reinforcement learning driving agents
- **E.** Amazon SageMaker Model Cards for model governance documentation

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty bảo hiểm đang triển khai pipeline xử lý tài liệu AI bằng Amazon Textract và muốn đảm bảo người kiểm duyệt xác minh các dự đoán có độ tin cậy thấp đồng thời duy trì tài liệu mô hình chuẩn hóa cho kiểm toán viên. Họ nên sử dụng HAI dịch vụ AWS nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Amazon A2I giải quyết bài toán Human-in-the-loop khi confidence score thấp, còn SageMaker Model Cards giải quyết tính minh bạch (Transparency) và tài liệu hóa mô hình cho kiểm toán.

- **A:** Sai. Amazon Personalize dùng để xây dựng hệ thống gợi ý sản phẩm.
- **B:** Sai. Polly chuyển văn bản thành giọng nói.
- **C (Đúng):** Chính xác. Amazon A2I tích hợp sẵn với Textract/Rekognition hoặc custom model để chuyển các dự đoán có độ tin cậy thấp sang con người kiểm duyệt.
- **D:** Sai. DeepRacer là xe tự hành mô phỏng để học Reinforcement Learning.
- **E (Đúng):** Chính xác. SageMaker Model Cards lưu trữ tập trung mục đích sử dụng, dữ liệu huấn luyện, chỉ số đánh giá và giới hạn rủi ro của mô hình phục vụ kiểm toán.

</details>

### Câu 5 `medium`

A healthcare analytics team deployed an ML model on Amazon SageMaker to predict hospital readmission risk. Regulators require an explanation showing how much each patient feature (such as age, lab results, and prior visits) contributed to an individual prediction. Which AWS service provides this capability?

- **A.** Amazon Macie PII scanning
- **B.** Amazon SageMaker Clarify
- **C.** Amazon Transcribe streaming
- **D.** AWS CloudTrail event history

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ phân tích y tế đã triển khai mô hình ML trên Amazon SageMaker để dự đoán nguy cơ tái nhập viện. Cơ quan quản lý yêu cầu lời giải thích cho thấy từng đặc trưng của bệnh nhân (như tuổi tác, kết quả xét nghiệm và số lần khám trước đó) đóng góp bao nhiêu vào một dự đoán cụ thể. Dịch vụ AWS nào cung cấp khả năng này?

**Đáp án đúng:** **B**

Amazon SageMaker Clarify là dịch vụ cốt lõi cho Responsible AI trên AWS, hỗ trợ cả Bias Detection (trước và sau khi train) và Model Explainability (dựa trên SHAP).

- **A:** Sai. Amazon Macie dùng để phát hiện dữ liệu nhạy cảm/PII trên S3, không giải thích feature importance của mô hình ML.
- **B (Đúng):** Chính xác. Amazon SageMaker Clarify sử dụng thuật toán SHAP (SHapley Additive exPlanations) để giải thích mức độ đóng góp của từng feature vào quyết định của mô hình (Explainability) cũng như phát hiện bias.
- **C:** Sai. Transcribe chuyển giọng nói thành văn bản.
- **D:** Sai. CloudTrail ghi lại nhật ký API call trên AWS, không giải thích dự đoán mô hình.

</details>

### Câu 6 `medium`

A financial advisory firm is building a customer-facing chatbot on Amazon Bedrock. The firm must block any investment advice requests, filter out hate speech, and automatically mask customer Social Security Numbers in responses. Which feature should the firm configure?

- **A.** Amazon Bedrock Guardrails
- **B.** Amazon SageMaker Data Wrangler
- **C.** Amazon Forecast
- **D.** Amazon Bedrock Batch Inference

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty tư vấn tài chính đang xây dựng chatbot hướng tới khách hàng trên Amazon Bedrock. Công ty phải chặn mọi yêu cầu tư vấn đầu tư, lọc bỏ ngôn từ thù ghét và tự động che giấu (mask) số An sinh Xã hội của khách hàng trong phản hồi. Công ty nên cấu hình tính năng nào?

**Đáp án đúng:** **A**

Amazon Bedrock Guardrails cung cấp lớp bảo vệ thống nhất cho mọi FM trên Bedrock (và cả mô hình ngoài thông qua ApplyGuardrail API), bao gồm Denied Topics, Content Filters, Word Filters, PII redaction và Grounding check.

- **A (Đúng):** Chính xác. Amazon Bedrock Guardrails hỗ trợ Denied Topics (chặn chủ đề tư vấn đầu tư), Content Filters (lọc hate/violence), Sensitive Information Filters (che/chặn PII như SSN) và Contextual Grounding.
- **B:** Sai. Data Wrangler là công cụ chuẩn bị dữ liệu trước khi train, không kiểm soát luồng hội thoại chatbot thời gian thực.
- **C:** Sai. Amazon Forecast dùng để dự báo chuỗi thời gian.
- **D:** Sai. Batch Inference dùng để chạy xử lý hàng loạt giá rẻ, không phải bộ lọc an toàn.

</details>

### Câu 7 `easy`

A company uses Amazon Textract to process mortgage applications. To comply with internal quality standards, any extracted field with a confidence score below 85% must be routed to a human reviewer for verification before final approval. Which AWS service automates this workflow?

- **A.** Amazon Polly speech synthesis
- **B.** Amazon Lex conversational bot
- **C.** Amazon Augmented AI (Amazon A2I)
- **D.** AWS Artifact compliance portal

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty sử dụng Amazon Textract để xử lý hồ sơ thế chấp. Để tuân thủ tiêu chuẩn chất lượng nội bộ, bất kỳ trường nào được trích xuất có điểm tin cậy dưới 85% phải được chuyển đến người kiểm duyệt để xác minh trước khi phê duyệt cuối cùng. Dịch vụ AWS nào tự động hóa quy trình này?

**Đáp án đúng:** **C**

Amazon Augmented AI (A2I) là dịch vụ chuẩn cho Human-in-the-loop (HITL), giúp kết hợp tốc độ của AI với độ tin cậy của con người khi confidence score thấp.

- **A:** Sai. Polly chuyển văn bản thành giọng nói.
- **B:** Sai. Lex dùng để xây dựng chatbot.
- **C (Đúng):** Chính xác. Amazon A2I xây dựng quy trình Human-in-the-loop (HITL), tự động chuyển các dự đoán có độ tin cậy thấp (low confidence) từ Textract, Rekognition hoặc mô hình tùy chỉnh sang nhân sự kiểm duyệt.
- **D:** Sai. AWS Artifact là cổng tải báo cáo tuân thủ (compliance reports) của AWS.

</details>

### Câu 8 `medium`

A media platform uses Amazon Titan Image Generator on Amazon Bedrock to create marketing visuals and wants to promote transparency regarding AI-generated content. Which TWO mechanisms help identify AI-generated images and document model limitations? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Increasing the Temperature parameter during image generation inference
- **B.** Invisible digital watermarking embedded by Amazon Titan Image Generator
- **C.** Disabling AWS CloudTrail management logging in the production account
- **D.** Converting generated PNG images into tabular CSV files for storage
- **E.** AWS AI Service Cards and Amazon SageMaker Model Cards documentation

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng truyền thông sử dụng Amazon Titan Image Generator trên Amazon Bedrock để tạo hình ảnh marketing và muốn thúc đẩy tính minh bạch đối với nội dung do AI tạo ra. HAI cơ chế nào giúp nhận diện hình ảnh do AI tạo ra và ghi lại các hạn chế của mô hình? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, E**

Tính minh bạch (Transparency) trong Responsible AI trên AWS được thể hiện qua Watermarking cho ảnh AI sinh ra và hệ thống tài liệu Model Cards / AI Service Cards.

- **A:** Sai. Temperature không tạo watermark hay tài liệu minh bạch.
- **B (Đúng):** Chính xác. Amazon Titan Image Generator (và Amazon Nova Canvas) mặc định nhúng watermark kỹ thuật số vô hình giúp nhận diện ảnh do AI tạo ra và chống thông tin sai lệch.
- **C:** Sai. Tắt CloudTrail làm giảm khả năng kiểm toán và minh bạch.
- **D:** Sai. Không liên quan đến nhận diện ảnh AI hay tài liệu mô hình.
- **E (Đúng):** Chính xác. AI Service Cards và SageMaker Model Cards cung cấp tài liệu minh bạch về mục đích sử dụng (intended use), giới hạn, hiệu năng và các lưu ý đạo đức của mô hình.

</details>

### Câu 9 `medium`

A customer-facing RAG application occasionally generates plausible-sounding statements that are not supported by the retrieved source documents. Which Amazon Bedrock Guardrails feature automatically detects and blocks responses that are ungrounded in the provided source context?

- **A.** Contextual Grounding Check
- **B.** Word Filters
- **C.** Amazon Polly Neural Voices
- **D.** Amazon SageMaker Model Registry

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng RAG hướng tới khách hàng thỉnh thoảng tạo ra các phát biểu nghe có vẻ hợp lý nhưng không được hỗ trợ bởi các tài liệu nguồn đã truy xuất. Tính năng nào của Amazon Bedrock Guardrails tự động phát hiện và chặn các phản hồi không có cơ sở từ ngữ cảnh nguồn được cung cấp?

**Đáp án đúng:** **A**

Contextual Grounding Check của Amazon Bedrock Guardrails là vũ khí chuyên dụng để chống ảo giác (hallucination) trong các hệ thống RAG và tóm tắt tài liệu.

- **A (Đúng):** Chính xác. Contextual Grounding Check trong Amazon Bedrock Guardrails đánh giá mức độ bám sát nguồn dữ liệu (Grounding) và mức độ liên quan câu hỏi (Relevance) để chặn ảo giác (hallucination) trong RAG.
- **B:** Sai. Word Filters chỉ chặn các từ khóa/tên đối thủ cạnh tranh cụ thể trong danh sách đen, không kiểm tra tính thực tế so với tài liệu RAG.
- **C:** Sai. Polly là dịch vụ Text-to-Speech.
- **D:** Sai. Model Registry quản lý phiên bản mô hình, không kiểm tra hallucination ở runtime.

</details>

### Câu 10 `medium`

A recruiting platform is building a resume-screening ML model, but the training dataset consists of 92% male applicants and 8% female applicants from past hiring cycles. Before training the model, the team wants to quantify this demographic imbalance in the dataset. Which tool should they use?

- **A.** Amazon Bedrock asynchronous Batch Inference
- **B.** Amazon SageMaker Clarify pre-training bias analysis
- **C.** Amazon Transcribe real-time speech recognition
- **D.** AWS PrivateLink interface VPC endpoint

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng tuyển dụng đang xây dựng mô hình ML sàng lọc hồ sơ ứng viên, nhưng tập dữ liệu huấn luyện gồm 92% ứng viên nam và 8% ứng viên nữ từ các chu kỳ tuyển dụng trước đây. Trước khi huấn luyện mô hình, đội ngũ muốn định lượng sự mất cân bằng nhân khẩu học này trong tập dữ liệu. Họ nên sử dụng công cụ nào?

**Đáp án đúng:** **B**

SageMaker Clarify kiểm tra Bias ở hai giai đoạn: Pre-training (phát hiện mất cân bằng dữ liệu gốc) và Post-training (phát hiện thiên lệch trong dự đoán của mô hình).

- **A:** Sai. Batch Inference dùng để chạy LLM hàng loạt, không đo lường bias dữ liệu bảng.
- **B (Đúng):** Chính xác. SageMaker Clarify hỗ trợ đo lường các chỉ số pre-training data bias (như Class Imbalance - CI và Difference in Proportions of Labels - DPL) ngay trên tập dữ liệu trước khi huấn luyện.
- **C:** Sai. Transcribe chuyển âm thanh thành văn bản.
- **D:** Sai. PrivateLink là giải pháp kết nối mạng riêng tư.

</details>

### Câu 11 `easy`

A compliance officer asks the ML engineering team for standardized documentation detailing a deployed SageMaker model's intended use cases, training data details, performance metrics, and known ethical limitations. Which AWS feature provides a centralized template for this documentation?

- **A.** Amazon SageMaker Feature Store
- **B.** Amazon Lex conversational AI
- **C.** Amazon SageMaker Model Cards
- **D.** Amazon Kendra semantic search

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhân viên tuân thủ yêu cầu đội ngũ kỹ sư ML cung cấp tài liệu chuẩn hóa mô tả chi tiết các trường hợp sử dụng dự kiến, thông tin dữ liệu huấn luyện, chỉ số hiệu năng và các hạn chế đạo đức đã biết của một mô hình SageMaker đã triển khai. Tính năng AWS nào cung cấp mẫu tập trung cho tài liệu này?

**Đáp án đúng:** **C**

SageMaker Model Cards giúp chuẩn hóa tài liệu mô hình xuyên suốt vòng đời ML để phục vụ kiểm toán, tuân thủ và minh bạch (Transparency & Governance).

- **A:** Sai. Feature Store lưu trữ các đặc trưng dữ liệu (features) cho training và inference.
- **B:** Sai. Lex là dịch vụ xây dựng chatbot.
- **C (Đúng):** Chính xác. Amazon SageMaker Model Cards tập hợp thông tin quản trị và minh bạch của mô hình (mục đích sử dụng, kết quả đánh giá, rủi ro và giới hạn) tại một nơi duy nhất.
- **D:** Sai. Kendra là dịch vụ tìm kiếm doanh nghiệp.

</details>

### Câu 12 `easy`

A bank built a loan approval ML model on Amazon SageMaker. Compliance auditors require proof that the model does not discriminate against protected demographic groups and want to see which input features most influenced individual loan rejections. Which AWS tool should the bank use?

- **A.** Amazon SageMaker Ground Truth
- **B.** Amazon Polly neural voice synthesis
- **C.** Amazon SageMaker Clarify
- **D.** AWS CloudTrail management event logs

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ngân hàng đã xây dựng mô hình ML phê duyệt khoản vay trên Amazon SageMaker. Các kiểm toán viên tuân thủ yêu cầu bằng chứng cho thấy mô hình không phân biệt đối xử với các nhóm nhân khẩu học được bảo vệ và muốn xem các đặc trưng đầu vào nào ảnh hưởng nhiều nhất đến từng quyết định từ chối khoản vay. Ngân hàng nên sử dụng công cụ AWS nào?

**Đáp án đúng:** **C**

Amazon SageMaker Clarify là công cụ trọng tâm cho 2 trụ cột Fairness (phát hiện Bias) và Explainability (giải thích dự đoán bằng SHAP) trong Domain 4.

- **A:** Sai. SageMaker Ground Truth dùng để gán nhãn dữ liệu huấn luyện, không đo Bias hay Explainability.
- **B:** Sai. Amazon Polly là dịch vụ chuyển văn bản thành giọng nói.
- **C (Đúng):** Chính xác. Amazon SageMaker Clarify tự động phát hiện thiên lệch (Pre-training & Post-training Bias) và cung cấp biểu đồ giải thích mức độ đóng góp đặc trưng (Explainability / SHAP values).
- **D:** Sai. CloudTrail ghi lại lịch sử gọi API AWS, không phân tích tính công bằng hay khả năng giải thích của mô hình ML.

</details>

### Câu 13 `medium`

A retail bank deploys a customer-facing generative AI chatbot on Amazon Bedrock. The bank wants to automatically block any discussion about competitor banks, prevent investment advice, redact customer Social Security Numbers (SSNs), and block hallucinated answers not supported by the RAG source context. Which feature should they configure?

- **A.** Amazon Bedrock Guardrails
- **B.** Amazon Comprehend Custom Classification
- **C.** AWS Shield Advanced
- **D.** Amazon SageMaker Model Monitor

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ngân hàng bán lẻ triển khai chatbot generative AI hướng tới khách hàng trên Amazon Bedrock. Ngân hàng muốn tự động chặn mọi thảo luận về các ngân hàng đối thủ, ngăn chặn lời khuyên đầu tư, ẩn/biên tập số An sinh Xã hội (SSN) của khách hàng và chặn các câu trả lời ảo giác (hallucination) không được hỗ trợ bởi ngữ cảnh nguồn RAG. Họ nên cấu hình tính năng nào?

**Đáp án đúng:** **A**

Amazon Bedrock Guardrails là giải pháp bảo vệ toàn diện cho ứng dụng GenAI với 5 lớp kiểm soát: Content Filters, Denied Topics, Word Filters, Sensitive Information (PII) Filters và Contextual Grounding Checks.

- **A (Đúng):** Chính xác. Amazon Bedrock Guardrails hỗ trợ đầy đủ Word Filters (chặn tên đối thủ), Denied Topics (cấm tư vấn đầu tư), PII Redaction (che SSN) và Contextual Grounding Check (chặn Hallucination).
- **B:** Sai. Comprehend không cung cấp bộ lọc bảo vệ tích hợp cho FM như Denied Topics hay Contextual Grounding Check.
- **C:** Sai. AWS Shield Advanced bảo vệ hạ tầng mạng chống tấn công DDoS, không kiểm soát nội dung câu trả lời của LLM.
- **D:** Sai. Model Monitor giám sát Data Drift và Model Quality theo thời gian, không chặn nội dung hay che PII theo thời gian thực trên Bedrock.

</details>

### Câu 14 `medium`

A mortgage lender uses Amazon Textract to extract income figures from tax documents. Whenever the model's confidence score for an extracted field falls below 90%, a human loan officer must review and verify the value before approval. Which AWS service implements this workflow?

- **A.** Agents for Amazon Bedrock with Lambda
- **B.** Amazon SageMaker Feature Store online
- **C.** Amazon Kendra intelligent search index
- **D.** Amazon Augmented AI (Amazon A2I)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đơn vị cho vay thế chấp sử dụng Amazon Textract để trích xuất số liệu thu nhập từ hồ sơ thuế. Bất cứ khi nào điểm tin cậy (confidence score) của mô hình cho một trường được trích xuất giảm xuống dưới 90%, một nhân viên tín dụng phải xem xét và xác minh giá trị đó trước khi phê duyệt. Dịch vụ AWS nào triển khai quy trình này?

**Đáp án đúng:** **D**

Bất cứ khi nào đề bài nhắc tới 'Human-in-the-Loop', 'low confidence score', 'human review before final decision' (tích hợp sẵn với Textract, Rekognition, SageMaker) -> chọn ngay Amazon Augmented AI (A2I).

- **A:** Sai. Bedrock Agents dùng để tự động gọi API thực thi tác vụ đa bước, không phải quy trình kiểm duyệt thủ công bởi con người.
- **B:** Sai. Feature Store là kho lưu trữ và chia sẻ đặc trưng dữ liệu ML.
- **C:** Sai. Amazon Kendra là công cụ tìm kiếm thông minh nội bộ doanh nghiệp.
- **D (Đúng):** Chính xác. Amazon Augmented AI (A2I) được thiết kế chuyên biệt cho quy trình Human-in-the-Loop (HITL), tự động chuyển các dự đoán có độ tin cậy thấp sang nhân sự kiểm duyệt.

</details>

### Câu 15 `medium`

An ML engineering team wants to maintain standardized, centralized governance documentation for each custom model they train—recording its intended business use, training data sources, evaluation metrics, and known risks. Which AWS capability should they use?

- **A.** AWS AI Service Cards
- **B.** Amazon SageMaker Model Cards
- **C.** AWS Trusted Advisor
- **D.** Amazon CloudWatch Dashboards

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ kỹ sư ML muốn duy trì tài liệu quản trị tập trung, được chuẩn hóa cho mỗi mô hình tùy chỉnh mà họ huấn luyện — ghi lại mục đích kinh doanh dự kiến, nguồn dữ liệu huấn luyện, chỉ số đánh giá và các rủi ro đã biết. Họ nên sử dụng tính năng nào của AWS?

**Đáp án đúng:** **B**

Phân biệt rõ: AWS AI Service Cards (tài liệu minh bạch do AWS viết cho Managed AI Services) vs Amazon SageMaker Model Cards (tài liệu quản trị do khách hàng tạo cho Custom ML Models).

- **A:** Sai. AWS AI Service Cards là tài liệu do AWS cung cấp cho các dịch vụ AI quản lý (như Rekognition, Textract), không phải cho mô hình tùy chỉnh của khách hàng.
- **B (Đúng):** Chính xác. Amazon SageMaker Model Cards giúp khách hàng chuẩn hóa và lưu trữ tập trung thông tin quản trị (mục đích sử dụng, dữ liệu, chỉ số đánh giá, rủi ro) cho từng mô hình ML tùy chỉnh.
- **C:** Sai. AWS Trusted Advisor đưa ra khuyến nghị tối ưu chi phí, bảo mật và hiệu năng hạ tầng AWS.
- **D:** Sai. CloudWatch Dashboards hiển thị biểu đồ chỉ số vận hành (CPU, latency, errors), không phải hồ sơ quản trị mô hình.

</details>

### Câu 16 `medium`

A healthcare company is building a patient-facing GenAI assistant and wants to minimize hallucinations where the model invents unsupported medical facts. Which TWO practices are most effective? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Use Retrieval-Augmented Generation (RAG) grounded in verified clinical guidelines
- **B.** Enable Contextual Grounding Checks in Amazon Bedrock Guardrails
- **C.** Increase the temperature parameter to maximize answer diversity
- **D.** Disable all prompt instructions so the model relies solely on pre-training memory
- **E.** Use unsupervised clustering to generate patient responses

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty y tế đang xây dựng trợ lý GenAI cho bệnh nhân và muốn giảm thiểu hiện tượng ảo giác (hallucination) khi mô hình tự bịa ra các thông tin y khoa không có cơ sở. HAI thực hành nào hiệu quả nhất? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, B**

Bộ đôi chống Hallucination hiệu quả nhất trên AWS là RAG (neo vào dữ liệu chuẩn) kết hợp Bedrock Guardrails Contextual Grounding Checks (và giữ Temperature thấp).

- **A (Đúng):** Chính xác. RAG cung cấp ngữ cảnh y khoa đã xác thực trực tiếp trong prompt, giúp neo câu trả lời vào sự thật và giảm mạnh Hallucination.
- **B (Đúng):** Chính xác. Contextual Grounding Checks tự động kiểm tra xem câu trả lời có bám sát nguồn RAG hay không và chặn các phát ngôn bịa đặt.
- **C:** Sai. Tăng Temperature làm tăng tính ngẫu nhiên và khiến mô hình dễ bịa đặt thông tin hơn.
- **D:** Sai. Chỉ dựa vào trí nhớ tiền huấn luyện làm tăng nguy cơ thông tin lỗi thời và ảo giác.
- **E:** Sai. Unsupervised clustering dùng để phân nhóm dữ liệu, không tạo câu trả lời ngôn ngữ tự nhiên.

</details>

---

[Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md)
