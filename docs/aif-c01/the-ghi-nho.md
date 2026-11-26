# Thẻ ghi nhớ (Flashcards) — AIF-C01

> 25 thẻ · Đọc mặt trước, tự trả lời rồi mở đáp án.

## Nền tảng AI/ML, Học máy & Vòng đời ML (ML Lifecycle)

**1. Phân biệt Supervised Learning (Classification vs Regression) và Unsupervised Learning?**

<details><summary>Xem đáp án</summary>

- Supervised Learning dùng dữ liệu CÓ nhãn: Classification dự đoán nhãn rời rạc (spam/không spam, gian lận); Regression dự đoán giá trị số liên tục (giá nhà, doanh thu).
- Unsupervised Learning dùng dữ liệu KHÔNG nhãn để tìm cấu trúc ẩn: Clustering (phân khúc khách hàng), Anomaly Detection.

</details>

**2. Overfitting là gì và các cách phổ biến để khắc phục?**

<details><summary>Xem đáp án</summary>

Overfitting xảy ra khi mô hình học thuộc dữ liệu train (độ chính xác train rất cao) nhưng dự đoán kém trên dữ liệu mới (validation/test).
Cách khắc phục: tăng dữ liệu huấn luyện, áp dụng Regularization (L1/L2, Dropout), giảm độ phức tạp mô hình, hoặc dùng Early Stopping.

</details>

**3. Khi nào ưu tiên tối ưu Recall thay vì Precision trong bài toán Classification?**

<details><summary>Xem đáp án</summary>

Ưu tiên Recall khi False Negative (bỏ sót ca dương tính) gây hậu quả nghiêm trọng hơn False Positive — ví dụ: chẩn đoán bệnh ung thư hoặc phát hiện gian lận tài chính. Ngược lại, ưu tiên Precision khi False Positive tốn kém (ví dụ: lọc email spam).

</details>

## Hệ sinh thái Dịch vụ AWS AI Quản lý (Managed AI Services)

**4. Phân biệt Amazon Textract, Amazon Rekognition và Amazon Comprehend?**

<details><summary>Xem đáp án</summary>

- Amazon Textract: Trích xuất văn bản, bảng biểu (tables) và cặp key-value (forms) từ tài liệu scan/PDF.
- Amazon Rekognition: Computer Vision phân tích ảnh & video (nhận diện khuôn mặt, vật thể, kiểm duyệt nội dung).
- Amazon Comprehend: Xử lý ngôn ngữ tự nhiên (NLP) — phân tích cảm xúc (sentiment), thực thể, PII trong văn bản.

</details>

## Amazon SageMaker: MLOps, Pipelines, Feature Store & Inference

**5. 4 tùy chọn suy luận (Inference Options) của Amazon SageMaker dùng khi nào?**

<details><summary>Xem đáp án</summary>

1. Real-time: Traffic ổn định, yêu cầu độ trễ mili-giây.
2. Serverless: Traffic thất thường, có khoảng nghỉ, chấp nhận cold start.
3. Asynchronous: Payload lớn (tới 1 GB), thời gian xử lý lâu (tới 1 giờ).
4. Batch Transform: Xử lý dữ liệu lớn ngoại tuyến (offline) không cần endpoint chạy liên tục.

</details>

## Kiến trúc Generative AI, Transformers & Amazon Bedrock

**6. Khi nào chọn Amazon Bedrock thay vì Amazon SageMaker JumpStart?**

<details><summary>Xem đáp án</summary>

- Amazon Bedrock: Dịch vụ Serverless hoàn toàn, truy cập nhiều FM qua 1 API duy nhất, không cần quản lý hạ tầng, tích hợp sẵn Guardrails/Knowledge Bases/Agents.
- SageMaker JumpStart: Khi cần kiểm soát sâu hạ tầng EC2/GPU, mạng VPC, tùy biến framework hoặc chạy mô hình mã nguồn mở không có trên Bedrock.

</details>

**7. Phân biệt AWS Trainium và AWS Inferentia?**

<details><summary>Xem đáp án</summary>

- AWS Trainium: Chip tăng tốc ML chuyên dụng do AWS thiết kế để tối ưu hiệu năng và chi phí cho giai đoạn HUẤN LUYỆN (Training) Deep Learning & GenAI.
- AWS Inferentia: Chip tăng tốc ML chuyên dụng tối ưu cho giai đoạn SUY LUẬN (Inference) với thông lượng cao, độ trễ thấp.

</details>

## Tokenization, Embeddings, Quantization, Distillation & Đánh giá Mô hình

**8. Tokens, Embeddings và Context Window trong LLM là gì?**

<details><summary>Xem đáp án</summary>

- Tokens: Đơn vị văn bản nhỏ nhất LLM xử lý (từ/phần từ; dùng để tính chi phí & giới hạn).
- Embeddings: Vector số học nhiều chiều biểu diễn ý nghĩa ngữ nghĩa của văn bản/ảnh.
- Context Window: Tổng số token tối đa (input + output) mô hình có thể xử lý trong một lượt gọi.

</details>

**9. Các chỉ số ROUGE, BLEU, BERTScore và Perplexity dùng để đánh giá tác vụ nào?**

<details><summary>Xem đáp án</summary>

- ROUGE: Đánh giá Tóm tắt văn bản (Text Summarization).
- BLEU: Đánh giá Dịch máy (Machine Translation).
- BERTScore: Đánh giá độ tương đồng ngữ nghĩa bằng embeddings.
- Perplexity: Đo độ bối rối của mô hình ngôn ngữ khi dự đoán token tiếp theo (càng thấp càng tốt).

</details>

## Prompt Engineering & Inference Parameters (Temperature, Top-P, CoT)

**10. Tham số Temperature và Top-P ảnh hưởng thế nào tới đầu ra của Foundation Model?**

<details><summary>Xem đáp án</summary>

- Giảm Temperature về gần 0 (và giảm Top-P): câu trả lời mang tính xác định (deterministic), nhất quán, chính xác — phù hợp hỏi đáp sự thật, viết SQL, trích xuất JSON.
- Tăng Temperature: câu trả lời ngẫu nhiên, sáng tạo hơn — phù hợp viết truyện, brainstorming.

</details>

**11. Phân biệt Zero-shot, Few-shot và Chain-of-Thought (CoT) Prompting?**

<details><summary>Xem đáp án</summary>

- Zero-shot: Hỏi trực tiếp không kèm ví dụ.
- Few-shot: Cung cấp vài cặp ví dụ input-output trong prompt để định hướng định dạng/quy tắc.
- Chain-of-Thought (CoT): Yêu cầu mô hình suy luận từng bước ('step-by-step') cho bài toán logic hoặc tính toán phức tạp.

</details>

## RAG & Knowledge Bases for Amazon Bedrock

**12. RAG (Retrieval-Augmented Generation) hoạt động như thế nào và giải quyết vấn đề gì?**

<details><summary>Xem đáp án</summary>

RAG chia nhỏ tài liệu (chunking), tạo embeddings lưu vào Vector DB (như OpenSearch Serverless, Aurora pgvector). Khi có câu hỏi, hệ thống tìm đoạn văn bản liên quan nhất gắn vào prompt gửi LLM.
Giải quyết: vượt giới hạn Knowledge Cutoff, dùng dữ liệu nội bộ cập nhật liên tục, giảm Hallucination và trả về trích dẫn nguồn (Citations).

</details>

## Tùy chỉnh Foundation Models: Fine-Tuning, Continued Pre-training & Chi phí

**13. Khi nào dùng Provisioned Throughput vs On-Demand vs Batch Inference trên Amazon Bedrock?**

<details><summary>Xem đáp án</summary>

- On-Demand: Trả theo token, phù hợp traffic biến động hoặc thử nghiệm.
- Batch Inference: Xử lý lô lớn từ S3 không cần real-time, tiết kiệm chi phí hơn On-Demand.
- Provisioned Throughput: Cam kết băng thông (Model Units) cho traffic production lớn ổn định hoặc bắt buộc để chạy Custom Fine-tuned Models.

</details>

**14. Phân biệt Instruction Fine-tuning và Continued Pre-training?**

<details><summary>Xem đáp án</summary>

- Instruction Fine-tuning: Dùng dữ liệu CÓ NHÃN (cặp prompt-completion) để dạy mô hình phong cách, định dạng hoặc tác vụ cụ thể.
- Continued Pre-training: Dùng lượng lớn dữ liệu KHÔNG NHÃN (unlabeled) để dạy mô hình kiến thức và thuật ngữ chuyên ngành sâu (y khoa, luật, tài chính).

</details>

## Amazon Bedrock Agents, Action Groups & Bedrock Flows

**15. Agents for Amazon Bedrock dùng để làm gì?**

<details><summary>Xem đáp án</summary>

Cho phép FM lập kế hoạch và tự động thực hiện các tác vụ đa bước (ReAct) bằng cách gọi API hệ thống bên ngoài thông qua Action Groups (OpenAPI Schema + AWS Lambda), có thể kết hợp với Knowledge Bases.

</details>

## AI Có trách nhiệm: Bias, Fairness, Hallucination & Explainability

**16. Hallucination trong GenAI là gì và nêu 3 cách giảm thiểu hiệu quả nhất?**

<details><summary>Xem đáp án</summary>

Hallucination là hiện tượng FM tự bịa đặt thông tin sai sự thật nhưng diễn đạt rất tự tin.
3 cách giảm thiểu: (1) Dùng RAG để neo câu trả lời vào dữ liệu thật, (2) Giảm Temperature về gần 0, (3) Dùng Contextual Grounding Check trong Amazon Bedrock Guardrails.

</details>

## SageMaker Clarify, Model Cards, Bedrock Guardrails & Amazon A2I

**17. 5 tính năng chính của Amazon Bedrock Guardrails là gì?**

<details><summary>Xem đáp án</summary>

1. Content Filters (chặn nội dung độc hại & Prompt Attack).
2. Denied Topics (cấm thảo luận chủ đề ngoài phạm vi).
3. Word Filters (chặn từ khóa tùy chỉnh).
4. Sensitive Information Filters (chặn/che giấu PII).
5. Contextual Grounding Checks (phát hiện & chặn Hallucination).

</details>

**18. Amazon SageMaker Clarify giải quyết 2 trụ cột Responsible AI nào?**

<details><summary>Xem đáp án</summary>

1. Fairness: Phát hiện thiên lệch (Bias) cả trước huấn luyện (Pre-training data bias) và sau huấn luyện (Post-training model bias).
2. Explainability: Giải thích lý do mô hình đưa ra dự đoán thông qua mức độ đóng góp đặc trưng (Feature Importance / SHAP values).

</details>

**19. Phân biệt AWS AI Service Cards và Amazon SageMaker Model Cards?**

<details><summary>Xem đáp án</summary>

- AWS AI Service Cards: Tài liệu minh bạch do AWS phát hành cho các dịch vụ AI quản lý (Rekognition, Textract...) nêu rõ use case phù hợp và giới hạn.
- SageMaker Model Cards: Tài liệu do KHÁCH HÀNG tạo để chuẩn hóa quản trị cho các mô hình ML tùy chỉnh của riêng mình.

</details>

**20. Amazon Augmented AI (Amazon A2I) hoạt động như thế nào?**

<details><summary>Xem đáp án</summary>

A2I triển khai quy trình Human-in-the-Loop (HITL): khi mô hình AI đưa ra dự đoán có độ tin cậy (Confidence Score) thấp hơn ngưỡng quy định, A2I tự động chuyển mẫu đó sang nhân sự kiểm duyệt để xác minh trước khi chốt kết quả.

</details>

## Bảo mật, Quyền riêng tư & Quản trị Hệ thống AI trên AWS

**21. Prompt Injection là gì và cách phòng chống trên AWS?**

<details><summary>Xem đáp án</summary>

Prompt Injection là tấn công chèn chỉ dẫn độc hại vào đầu vào người dùng hoặc tài liệu RAG nhằm đánh lừa LLM bỏ qua hướng dẫn hệ thống và tiết lộ dữ liệu/thực thi hành động trái phép.
Phòng chống: bật Prompt Attack Filter trong Bedrock Guardrails, tách biệt system prompt, áp dụng Least Privilege cho Bedrock Agents.

</details>

**22. Amazon Bedrock xử lý quyền riêng tư dữ liệu khách hàng như thế nào?**

<details><summary>Xem đáp án</summary>

Dữ liệu prompt, completion và dữ liệu fine-tuning của khách hàng KHÔNG được sử dụng để huấn luyện lại các Foundation Models gốc và KHÔNG bao giờ bị chia sẻ với nhà cung cấp mô hình bên thứ ba (như Anthropic, Meta, Cohere). Dữ liệu được mã hóa in transit (TLS) và at rest (KMS).

</details>

**23. Làm sao kết nối ứng dụng trong Private Subnet tới Amazon Bedrock mà không đi qua Internet?**

<details><summary>Xem đáp án</summary>

Sử dụng AWS PrivateLink bằng cách tạo Interface VPC Endpoint cho Amazon Bedrock (`bedrock-runtime`). Toàn bộ lưu lượng gọi API suy luận sẽ đi hoàn toàn trong mạng trục riêng của AWS.

</details>

**24. Phân biệt Amazon Macie và PII Filters của Amazon Bedrock Guardrails?**

<details><summary>Xem đáp án</summary>

- Amazon Macie: Chủ động quét và phát hiện dữ liệu nhạy cảm/PII đang LƯU TRỮ trong Amazon S3 bucket (trước khi đưa vào training hoặc RAG).
- Bedrock Guardrails PII Filters: Chặn hoặc che giấu (mask/redact) PII theo THỜI GIAN THỰC trong prompt đầu vào và response đầu ra của FM.

</details>

**25. Phân biệt AWS CloudTrail, Bedrock Model Invocation Logging và AWS Artifact trong quản trị AI?**

<details><summary>Xem đáp án</summary>

- AWS CloudTrail: Ghi lại lịch sử ai gọi API nào (Control plane & Data plane API audit).
- Bedrock Model Invocation Logging: Lưu nội dung chi tiết prompt và response về S3/CloudWatch Logs.
- AWS Artifact: Cổng tải các chứng chỉ & báo cáo tuân thủ chính thức của AWS (SOC 2, ISO 27001, HIPAA).

</details>

---

[Mục lục AIF-C01](00-tong-quan-va-lo-trinh-aif-c01.md)
