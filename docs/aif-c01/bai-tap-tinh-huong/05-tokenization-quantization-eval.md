# Bài tập tình huống — Tokenization, Embeddings, Quantization, Distillation & Đánh giá Mô hình

> Tokenization (BPE), Vector Embeddings, tối ưu chi phí/độ trễ bằng Quantization & Model Distillation và đánh giá LLM với ROUGE, BLEU, BERTScore, Bedrock Model Evaluation.
> **Số câu hỏi:** 14 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

An engineering team is deploying a 70-billion-parameter open-source LLM on Amazon SageMaker, but their GPU instances lack sufficient VRAM to load the weights in 32-bit floating point (FP32). They want to reduce memory footprint and increase inference speed without retraining the model from scratch. Which technique should they apply?

- **A.** Continued Pre-training on unlabeled domain-specific documents
- **B.** Increasing the Temperature inference parameter toward 1.0
- **C.** Quantization (converting weights from FP32 to INT8 or INT4)
- **D.** Expanding the maximum Context Window token limit per request

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ kỹ sư đang triển khai một LLM mã nguồn mở 70 tỷ tham số trên Amazon SageMaker, nhưng các GPU instance của họ không đủ VRAM để tải trọng số ở định dạng dấu phẩy động 32-bit (FP32). Họ muốn giảm mức sử dụng bộ nhớ và tăng tốc độ suy luận mà không cần huấn luyện lại mô hình từ đầu. Họ nên áp dụng kỹ thuật nào?

**Đáp án đúng:** **C**

Quantization (lượng tử hóa) là kỹ thuật nén mô hình phổ biến nhất để giảm mức tiêu thụ VRAM và chi phí GPU khi triển khai LLM mà không cần huấn luyện lại từ đầu.

- **A:** Sai. Continued Pre-training là quá trình huấn luyện bổ sung để dạy thêm kiến thức cho model, không làm giảm kích thước VRAM của model.
- **B:** Sai. Temperature chỉ điều chỉnh độ ngẫu nhiên của token đầu ra, không ảnh hưởng đến dung lượng bộ nhớ VRAM.
- **C (Đúng):** Chính xác. Quantization giảm độ chính xác số học của trọng số (ví dụ từ FP32 xuống FP16, INT8 hoặc INT4), giúp giảm mạnh dung lượng VRAM cần thiết và tăng tốc độ suy luận mà không cần train lại từ đầu.
- **D:** Sai. Mở rộng Context Window thực tế còn làm tăng lượng bộ nhớ KV-cache tiêu thụ khi inference.

</details>

### Câu 2 `medium`

A company uses a large, expensive teacher Foundation Model that produces highly accurate financial summaries, but its latency and token cost are too high for production scale. They want to train a much smaller, faster student model to mimic the teacher model's outputs. Which technique is this?

- **A.** Model Distillation
- **B.** Retrieval-Augmented Generation (RAG)
- **C.** Tokenization
- **D.** Zero-Shot Prompting

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty sử dụng một teacher Foundation Model lớn, đắt đỏ tạo ra các bản tóm tắt tài chính có độ chính xác cao, nhưng độ trễ và chi phí token quá cao cho quy mô production. Họ muốn huấn luyện một student model nhỏ hơn, nhanh hơn nhiều để bắt chước đầu ra của teacher model. Đây là kỹ thuật nào?

**Đáp án đúng:** **A**

Model Distillation chuyển giao tri thức từ Teacher model (lớn, chính xác) sang Student model (nhỏ, nhanh, rẻ) — rất phù hợp khi muốn tối ưu TCO và độ trễ cho tác vụ chuyên biệt.

- **A (Đúng):** Chính xác. Model Distillation (chưng cất mô hình) sử dụng đầu ra của một Teacher model lớn để huấn luyện một Student model nhỏ gọn hơn, giúp giảm đáng kể chi phí và độ trễ trong production.
- **B:** Sai. RAG bổ sung ngữ cảnh từ cơ sở dữ liệu bên ngoài vào prompt, không tạo ra một mô hình nhỏ hơn.
- **C:** Sai. Tokenization là bước tách văn bản thành các đơn vị token trước khi đưa vào mô hình.
- **D:** Sai. Zero-shot prompting là kỹ thuật viết prompt không kèm ví dụ mẫu.

</details>

### Câu 3 `easy`

A developer notices that when sending very long legal contracts to an Amazon Bedrock Foundation Model, the beginning of the prompt is ignored or an error is returned because the combined input and output exceed the model's maximum token limit. Which concept explains this limit?

- **A.** Context Window
- **B.** Top-K Sampling
- **C.** Cosine Similarity
- **D.** Perplexity

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên nhận thấy khi gửi các hợp đồng pháp lý rất dài đến một Foundation Model trên Amazon Bedrock, phần đầu của prompt bị bỏ qua hoặc lỗi được trả về vì tổng đầu vào và đầu ra vượt quá giới hạn token tối đa của mô hình. Khái niệm nào giải thích giới hạn này?

**Đáp án đúng:** **A**

Context Window quyết định giới hạn độ dài tối đa của toàn bộ phiên hội thoại/tài liệu trong một lần gọi API tới LLM.

- **A (Đúng):** Chính xác. Context Window là tổng số token tối đa (bao gồm system prompt, input, ngữ cảnh RAG và output) mà một Foundation Model có thể xử lý trong một lần gọi.
- **B:** Sai. Top-K giới hạn số lượng token ứng viên có xác suất cao nhất được xét khi sinh từ tiếp theo.
- **C:** Sai. Cosine Similarity là phép đo độ tương đồng góc giữa hai vector embedding.
- **D:** Sai. Perplexity là chỉ số đo mức độ không chắc chắn của mô hình ngôn ngữ khi dự đoán token tiếp theo.

</details>

### Câu 4 `medium`

A search application converts product descriptions and user queries into high-dimensional numerical vectors using Amazon Titan Text Embeddings. Which mathematical metric is MOST commonly used to measure semantic similarity between the query vector and product vectors regardless of document length?

- **A.** Cosine Similarity
- **B.** Mean Absolute Error (MAE)
- **C.** BLEU Score
- **D.** F1-Score

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng tìm kiếm chuyển đổi mô tả sản phẩm và truy vấn của người dùng thành các vector số học nhiều chiều bằng Amazon Titan Text Embeddings. Chỉ số toán học nào PHỔ BIẾN NHẤT được sử dụng để đo độ tương đồng ngữ nghĩa giữa vector truy vấn và vector sản phẩm bất kể độ dài tài liệu?

**Đáp án đúng:** **A**

Trong các hệ thống Vector Search và RAG, Embeddings biểu diễn ngữ nghĩa và Cosine Similarity là thước đo phổ biến nhất để tìm các đoạn văn bản có ý nghĩa gần nhất với truy vấn.

- **A (Đúng):** Chính xác. Cosine Similarity đo góc giữa hai vector trong không gian embedding (từ -1 đến 1), không bị ảnh hưởng bởi độ lớn/độ dài văn bản nên là chuẩn mực trong Semantic Search và RAG.
- **B:** Sai. MAE là metric đánh giá sai số của bài toán hồi quy (Regression).
- **C:** Sai. BLEU Score dùng để đánh giá chất lượng dịch máy dựa trên trùng lặp n-gram.
- **D:** Sai. F1-Score là trung bình điều hòa của Precision và Recall trong bài toán phân loại.

</details>

### Câu 5 `medium`

During pre-training evaluation of a custom language model, researchers measure how well the model predicts the next token in a held-out text corpus. A lower value indicates higher confidence and fluency. Which metric are they using?

- **A.** AUC-ROC score
- **B.** R-Squared value
- **C.** ROUGE-1 F1
- **D.** Perplexity

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong quá trình đánh giá tiền huấn luyện (pre-training) của một mô hình ngôn ngữ tùy chỉnh, các nhà nghiên cứu đo lường mức độ dự đoán tốt của mô hình đối với token tiếp theo trong một kho văn bản kiểm thử (held-out text corpus). Giá trị càng thấp cho thấy độ tin cậy và sự trôi chảy càng cao. Họ đang sử dụng chỉ số nào?

**Đáp án đúng:** **D**

Perplexity là metric chuẩn để đánh giá độ trôi chảy (fluency) của LLM trong quá trình pre-training — lưu ý đặc biệt: giá trị càng THẤP càng tốt.

- **A:** Sai. AUC-ROC đánh giá khả năng phân tách của bài toán phân loại nhị phân.
- **B:** Sai. R-Squared đánh giá mức độ giải thích phương sai của mô hình hồi quy.
- **C:** Sai. ROUGE-1 đo độ trùng lặp unigram cho tác vụ tóm tắt văn bản, giá trị càng cao càng tốt.
- **D (Đúng):** Chính xác. Perplexity đo mức độ 'bối rối' của mô hình ngôn ngữ khi dự đoán token tiếp theo; Perplexity càng thấp chứng tỏ mô hình càng trôi chảy và dự đoán chính xác hơn.

</details>

### Câu 6 `easy`

Which architectural mechanism in Transformer-based Large Language Models allows the model to weigh the importance of different words in a sentence relative to each other, regardless of their distance in the input sequence?

- **A.** Convolutional pooling
- **B.** Self-attention mechanism
- **C.** K-means clustering
- **D.** Gradient boosting

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Cơ chế kiến trúc nào trong các Large Language Model dựa trên Transformer cho phép mô hình cân nhắc tầm quan trọng của các từ khác nhau trong một câu so với nhau, bất kể khoảng cách của chúng trong chuỗi đầu vào?

**Đáp án đúng:** **B**

Kiến trúc Transformer (nền tảng của các LLM hiện đại) dựa trên cơ chế Self-attention để xử lý toàn bộ chuỗi token song song và hiểu mối quan hệ ngữ nghĩa ở khoảng cách xa.

- **A:** Sai. Convolutional pooling là thành phần của mạng CNN thường dùng cho xử lý ảnh.
- **B (Đúng):** Chính xác. Cơ chế Self-attention cho phép mô hình Transformer tính toán mức độ liên quan giữa mọi token trong chuỗi đầu vào song song, nắm bắt ngữ cảnh dài bất kể khoảng cách.
- **C:** Sai. K-means là thuật toán phân cụm trong Unsupervised learning.
- **D:** Sai. Gradient boosting (như XGBoost) là thuật toán cây quyết định cho dữ liệu bảng.

</details>

### Câu 7 `medium`

A legal technology company is building a contract analysis tool using a Foundation Model on Amazon Bedrock. The output must be strictly deterministic, factual, and consistent across identical runs. How should the developers configure the inference parameters?

- **A.** Set Temperature to 0.0 and use a low Top-P value
- **B.** Set Temperature to 1.0 and Top-K to 500
- **C.** Increase Max Tokens to the maximum context window
- **D.** Enable streaming responses without changing sampling parameters

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty công nghệ pháp lý đang xây dựng công cụ phân tích hợp đồng bằng Foundation Model trên Amazon Bedrock. Đầu ra phải hoàn toàn mang tính xác định (deterministic), bám sát thực tế và nhất quán giữa các lần chạy giống nhau. Các lập trình viên nên cấu hình tham số suy luận như thế nào?

**Đáp án đúng:** **A**

Temperature và Top-P kiểm soát mức độ ngẫu nhiên khi sinh token. Đối với tác vụ cần độ chính xác cao và lặp lại nhất quán (phân tích hợp đồng, trích xuất JSON), nên đặt Temperature gần 0.

- **A (Đúng):** Chính xác. Đặt Temperature = 0 (hoặc rất gần 0) và Top-P thấp khiến mô hình luôn chọn token có xác suất cao nhất (greedy decoding), cho kết quả nhất quán, chính xác và ít sáng tạo ngẫu nhiên.
- **B:** Sai. Temperature = 1.0 và Top-K cao làm tăng tính ngẫu nhiên và sáng tạo, dễ dẫn đến kết quả không nhất quán hoặc bịa đặt.
- **C:** Sai. Max Tokens chỉ giới hạn độ dài tối đa của câu trả lời, không kiểm soát tính ngẫu nhiên hay nhất quán.
- **D:** Sai. Streaming chỉ cải thiện trải nghiệm độ trễ bằng cách trả về từng phần token, không làm đầu ra mang tính tất định (deterministic).

</details>

### Câu 8 `hard`

A mobile gaming company wants to run a large language model on resource-constrained edge devices with minimal memory footprint and lower inference latency, while accepting a slight trade-off in numerical precision. Which model optimization technique should they apply?

- **A.** Continued pre-training
- **B.** Quantization
- **C.** Chain-of-Thought prompting
- **D.** Retrieval-Augmented Generation (RAG)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty game di động muốn chạy một large language model trên các thiết bị biên (edge device) bị giới hạn tài nguyên với mức sử dụng bộ nhớ tối thiểu và độ trễ suy luận thấp hơn, đồng thời chấp nhận đánh đổi nhẹ về độ chính xác số học. Họ nên áp dụng kỹ thuật tối ưu hóa mô hình nào?

**Đáp án đúng:** **B**

Quantization (lượng tử hóa) chuyển đổi trọng số từ độ chính xác cao (FP32) sang thấp hơn (FP16, INT8, INT4) để giảm kích thước mô hình, tiết kiệm chi phí phần cứng và giảm độ trễ.

- **A:** Sai. Continued pre-training giúp mô hình học thêm kiến thức chuyên ngành chứ không làm giảm kích thước bộ nhớ của mô hình.
- **B (Đúng):** Chính xác. Quantization giảm độ chính xác số học của trọng số mô hình (ví dụ từ 32-bit floating point xuống 8-bit integer hoặc 4-bit), giúp giảm mạnh dung lượng RAM/VRAM và tăng tốc độ inference.
- **C:** Sai. Chain-of-Thought là kỹ thuật viết prompt giúp tăng khả năng suy luận, không nén kích thước mô hình.
- **D:** Sai. RAG bổ sung tri thức ngoài cho mô hình, không thu gọn trọng số mô hình.

</details>

### Câu 9 `easy`

When working with Large Language Models, what is the primary purpose of generating vector embeddings from text?

- **A.** To encrypt sensitive customer text payloads using symmetric AES-256 keys before storage
- **B.** To represent text as dense numerical vectors that capture semantic meaning for similarity search
- **C.** To compress long audio recordings into low-bitrate MP3 files for Amazon Polly playback
- **D.** To bypass the maximum context window token limit enforced by a Foundation Model

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Khi làm việc với Large Language Models, mục đích chính của việc tạo vector embeddings từ văn bản là gì?

**Đáp án đúng:** **B**

Vector Embeddings là nền tảng của tìm kiếm ngữ nghĩa (Semantic Search) và kiến trúc RAG, cho phép máy tính đo lường mức độ tương đồng về ý nghĩa thay vì chỉ khớp từ khóa chính xác.

- **A:** Sai. Embeddings không phải thuật toán mã hóa bảo mật.
- **B (Đúng):** Chính xác. Embeddings biến đổi văn bản (hoặc hình ảnh) thành các vector số nhiều chiều sao cho các nội dung có ý nghĩa ngữ nghĩa tương đồng sẽ nằm gần nhau trong không gian vector.
- **C:** Sai. Embeddings dùng cho biểu diễn ngữ nghĩa trong ML/RAG, không phải nén âm thanh.
- **D:** Sai. Bản thân embedding model cũng có giới hạn token đầu vào và không xóa bỏ context window của FM.

</details>

### Câu 10 `hard`

A research team has trained a massive 70-billion-parameter Foundation Model that achieves top accuracy, but its inference cost and latency are too high for production. They decide to train a smaller 7-billion-parameter model to mimic the outputs and behavior of the 70B model. What is this technique called?

- **A.** Sequential prompt chaining
- **B.** Zero-shot transfer learning
- **C.** Synthetic data augmentation
- **D.** Knowledge distillation

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm nghiên cứu đã huấn luyện một Foundation Model khổng lồ 70 tỷ tham số đạt độ chính xác hàng đầu, nhưng chi phí suy luận và độ trễ quá cao cho môi trường production. Họ quyết định huấn luyện một mô hình nhỏ hơn 7 tỷ tham số để bắt chước đầu ra và hành vi của mô hình 70B. Kỹ thuật này được gọi là gì?

**Đáp án đúng:** **D**

Knowledge Distillation (Teacher -> Student) và Quantization (giảm độ chính xác bit của trọng số) là hai kỹ thuật tối ưu kích thước và chi phí inference LLM quan trọng cần nhớ trong AIF-C01.

- **A:** Sai. Prompt chaining là nối kết nhiều bước gọi prompt tuần tự, không tạo ra mô hình nhỏ hơn.
- **B:** Sai. Zero-shot learning là gọi mô hình làm tác vụ mới không cần ví dụ.
- **C:** Sai. Data augmentation là tạo thêm biến thể dữ liệu huấn luyện (như xoay/lật ảnh).
- **D (Đúng):** Chính xác. Knowledge distillation (chưng cất tri thức) sử dụng mô hình lớn (teacher model) để dạy cho mô hình nhỏ hơn (student model) đạt chất lượng gần tương đương nhưng nhẹ và nhanh hơn nhiều.

</details>

### Câu 11 `medium`

A developer is sending a 15,000-token system prompt containing lengthy coding guidelines repeatedly with every user request to a Foundation Model on Amazon Bedrock. Which Amazon Bedrock feature helps reduce both latency and input token costs for these repeated static prompt prefixes?

- **A.** Prompt Caching
- **B.** Negative Prompting
- **C.** Amazon Polly SSML
- **D.** Amazon SageMaker Clarify

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên đang gửi lặp đi lặp lại một system prompt dài 15.000 token chứa các hướng dẫn lập trình chi tiết trong mỗi yêu cầu của người dùng đến một Foundation Model trên Amazon Bedrock. Tính năng nào của Amazon Bedrock giúp giảm cả độ trễ và chi phí input token cho các tiền tố prompt tĩnh lặp lại này?

**Đáp án đúng:** **A**

Prompt Caching là kỹ thuật tối ưu quan trọng khi ứng dụng gửi lặp đi lặp lại cùng một ngữ cảnh dài (system prompt, few-shot examples, tài liệu cố định) trong các lần gọi API.

- **A (Đúng):** Chính xác. Prompt Caching trên Amazon Bedrock lưu đệm phần tiền tố (prefix) tĩnh lặp lại nhiều lần (như system prompt dài hoặc tài liệu tham khảo), giúp giảm đáng kể chi phí token đầu vào và độ trễ xử lý.
- **B:** Sai. Negative Prompting chỉ định nội dung cần tránh, không lưu cache.
- **C:** Sai. Polly SSML dùng cho tổng hợp giọng nói.
- **D:** Sai. Clarify dùng cho bias và explainability.

</details>

### Câu 12 `medium`

An architect is selecting a Foundation Model on Amazon Bedrock for a real-time multilingual customer chat application that must also analyze uploaded product photos of damaged items. Which TWO criteria are MOST important when evaluating candidate models? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Multimodal capability (vision and text input) and multilingual proficiency
- **B.** Inference latency and cost per token for real-time chat workloads
- **C.** Whether the model requires managing EC2 Auto Scaling groups manually
- **D.** Whether the model can export weights directly to a local laptop
- **E.** Compatibility with Amazon S3 Glacier Deep Archive retrieval times

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiến trúc sư đang lựa chọn Foundation Model trên Amazon Bedrock cho một ứng dụng chat đa ngôn ngữ theo thời gian thực cho khách hàng, đồng thời phải phân tích ảnh sản phẩm bị hư hỏng do khách hàng tải lên. HAI tiêu chí nào QUAN TRỌNG NHẤT khi đánh giá các mô hình ứng viên? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, B**

Khi chọn Foundation Model trên Bedrock, kiến trúc sư cần cân nhắc bộ tiêu chí: Khả năng xử lý (Multimodal, ngôn ngữ, Context Window), Hiệu năng (Latency, chất lượng) và Chi phí (Cost per token).

- **A (Đúng):** Chính xác. Ứng dụng cần đọc cả ảnh sản phẩm hư hỏng lẫn chat đa ngôn ngữ nên mô hình bắt buộc phải hỗ trợ Multimodal (Vision + Text) và đa ngôn ngữ tốt.
- **B (Đúng):** Chính xác. Chat thời gian thực đòi hỏi độ trễ thấp (low latency) và đơn giá token hợp lý khi phục vụ số lượng lớn khách hàng.
- **C:** Sai. Amazon Bedrock là dịch vụ serverless, không quản lý EC2 Auto Scaling.
- **D:** Sai. Các mô hình thương mại trên Bedrock chạy qua API quản lý, không xuất trọng số về máy cá nhân.
- **E:** Sai. S3 Glacier mất hàng giờ để khôi phục, không liên quan đến chat thời gian thực.

</details>

### Câu 13 `easy`

A legal team uses a Large Language Model (LLM) on Amazon Bedrock to extract exact dates and clauses from contracts. They notice the model occasionally varies its wording and adds speculative details. Which inference parameter change will make the output more deterministic and factual?

- **A.** Increase the temperature value toward 1.0
- **B.** Decrease the temperature value toward 0.0
- **C.** Increase Top-K to its maximum value
- **D.** Increase the maximum token limit

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ pháp lý sử dụng Large Language Model (LLM) trên Amazon Bedrock để trích xuất chính xác ngày tháng và các điều khoản từ hợp đồng. Họ nhận thấy mô hình thỉnh thoảng thay đổi cách diễn đạt và thêm vào các chi tiết suy đoán. Thay đổi tham số suy luận nào sẽ giúp đầu ra mang tính xác định (deterministic) và bám sát thực tế hơn?

**Đáp án đúng:** **B**

Temperature kiểm soát độ ngẫu nhiên trong phân phối xác suất sinh token. Với các tác vụ yêu cầu độ chính xác cao như trích xuất hợp đồng, sinh SQL hoặc JSON, luôn đặt Temperature thấp (gần 0).

- **A:** Sai. Tăng Temperature làm tăng tính ngẫu nhiên và sáng tạo, khiến mô hình dễ suy diễn và ít nhất quán hơn.
- **B (Đúng):** Chính xác. Giảm Temperature về gần 0.0 khiến mô hình ưu tiên các token có xác suất cao nhất, tạo ra câu trả lời xác định (deterministic), nhất quán và bám sát sự thật hơn.
- **C:** Sai. Tăng Top-K mở rộng số lượng token ứng viên có thể chọn ngẫu nhiên, làm giảm tính nhất quán.
- **D:** Sai. Max Tokens chỉ giới hạn độ dài tối đa của câu trả lời, không kiểm soát độ ngẫu nhiên hay tính sáng tạo.

</details>

### Câu 14 `easy`

What is the primary role of embeddings in a Generative AI application?

- **A.** To encrypt input prompts and model responses with AWS KMS before transmitting over the network
- **B.** To enforce a strict maximum limit on output tokens generated by a foundation model per request
- **C.** To convert text, images, or audio into dense numerical vectors that capture semantic meaning
- **D.** To automatically fine-tune foundation model weights in real time during synchronous inference

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Vai trò chính của embeddings trong một ứng dụng Generative AI là gì?

**Đáp án đúng:** **C**

Embeddings là nền tảng của tìm kiếm ngữ nghĩa (Semantic Search) và kiến trúc RAG: các đoạn văn bản có ý nghĩa giống nhau sẽ có vector gần nhau trong không gian toán học.

- **A:** Sai. Mã hóa dữ liệu truyền tải do giao thức TLS đảm nhiệm, không phải Embeddings.
- **B:** Sai. Giới hạn độ dài đầu ra do tham số Max Tokens kiểm soát.
- **C (Đúng):** Chính xác. Embeddings biểu diễn dữ liệu phi cấu trúc dưới dạng vector số nhiều chiều, giúp máy tính đo lường độ tương đồng ngữ nghĩa (semantic similarity) giữa các khái niệm.
- **D:** Sai. Embeddings không thay đổi trọng số của mô hình nền tảng trong quá trình suy luận.

</details>

---

[Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md)
