# Bài tập tình huống — Tùy chỉnh Foundation Models: Fine-Tuning, Continued Pre-training & Chi phí

> So sánh Prompting vs RAG vs Instruction Fine-tuning vs Continued Pre-training (Domain Adaptation); On-Demand vs Batch Inference vs Provisioned Throughput.
> **Số câu hỏi:** 10 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A team built a custom fine-tuned Amazon Titan Text model in Amazon Bedrock using their proprietary medical terminology dataset. When they try to invoke the custom model in production, they notice standard On-Demand pricing is unavailable. What must they purchase to deploy and invoke the custom model?

- **A.** AWS Savings Plans for Amazon EC2 GPU instances
- **B.** Amazon SageMaker Canvas workspace user license
- **C.** Amazon Bedrock Provisioned Throughput
- **D.** Amazon OpenSearch Serverless compute OCUs

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ đã xây dựng mô hình Amazon Titan Text được tinh chỉnh tùy chỉnh trong Amazon Bedrock bằng tập dữ liệu thuật ngữ y khoa độc quyền của họ. Khi cố gắng gọi mô hình tùy chỉnh trên production, họ nhận thấy tùy chọn định giá On-Demand tiêu chuẩn không khả dụng. Họ phải mua gì để triển khai và gọi mô hình tùy chỉnh đó?

**Đáp án đúng:** **C**

Quy tắc quan trọng khi thi AIF-C01: Custom models trên Amazon Bedrock (Fine-tuning / Continued Pre-training) luôn yêu cầu Provisioned Throughput để triển khai.

- **A:** Sai. Bedrock là dịch vụ serverless, không dùng EC2 Savings Plans.
- **B:** Sai. SageMaker Canvas là dịch vụ độc lập không liên quan đến việc host custom model trên Bedrock.
- **C (Đúng):** Chính xác. Trên Amazon Bedrock, mọi mô hình tùy chỉnh (Fine-tuned hoặc Continued Pre-trained) đều bắt buộc phải mua Provisioned Throughput (Model Units) để host và chạy inference.
- **D:** Sai. OpenSearch Serverless OCU dùng cho Vector DB trong RAG, không dùng để host custom LLM.

</details>

### Câu 2 `hard`

A company wants to adapt an open-weight Foundation Model to understand niche aerospace engineering jargon and write internal maintenance reports in a specific structured format, without relying on external retrieval at runtime. Which TWO model-customization techniques are most appropriate? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Zero-shot prompting without providing any domain terminology or format examples
- **B.** Continued Pre-training on unlabeled aerospace manuals to teach domain jargon
- **C.** Increasing Top-K to 500 during inference to sample rare aerospace vocabulary
- **D.** Using Amazon Polly custom lexicons to standardize spoken aerospace acronyms
- **E.** Instruction Fine-tuning on labeled prompt-response pairs for the report format

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty muốn điều chỉnh một Foundation Model mở trọng số (open-weight) để hiểu thuật ngữ kỹ thuật hàng không vũ trụ chuyên sâu và viết báo cáo bảo trì nội bộ theo một định dạng cấu trúc cụ thể, mà không phụ thuộc vào truy xuất bên ngoài khi chạy (runtime). HAI kỹ thuật tùy chỉnh mô hình nào phù hợp nhất? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, E**

Continued Pre-training (dữ liệu không nhãn) giúp nạp kiến thức/thuật ngữ chuyên ngành, còn Fine-tuning (dữ liệu có nhãn) giúp định hình hành vi và format đầu ra.

- **A:** Sai. Zero-shot khó đảm bảo mô hình hiểu thuật ngữ hàng không chuyên sâu và tuân thủ chặt chẽ cấu trúc báo cáo nội bộ.
- **B (Đúng):** Chính xác. Continued Pre-training dùng dữ liệu văn bản không nhãn theo miền chuyên ngành để mô hình học sâu thuật ngữ và kiến thức lĩnh vực mới.
- **C:** Sai. Top-K không dạy kiến thức mới hay định dạng báo cáo cho mô hình.
- **D:** Sai. Polly là dịch vụ Text-to-Speech, không liên quan đến tùy chỉnh LLM.
- **E (Đúng):** Chính xác. Fine-tuning với dữ liệu có nhãn (prompt-completion pairs) giúp mô hình học chính xác định dạng đầu ra và phong cách viết báo cáo.

</details>

### Câu 3 `easy`

A customer support team wants an LLM to classify incoming tickets into custom categories and output a strictly formatted JSON object. The team includes three examples of input tickets and their corresponding JSON outputs directly inside the prompt. Which prompting technique is this?

- **A.** Zero-shot prompting
- **B.** Few-shot prompting
- **C.** Continued pre-training
- **D.** Negative prompting

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ hỗ trợ khách hàng muốn một LLM phân loại các ticket gửi đến vào các danh mục tùy chỉnh và xuất ra đối tượng JSON được định dạng nghiêm ngặt. Đội ngũ đưa trực tiếp ba ví dụ về ticket đầu vào và đầu ra JSON tương ứng vào trong prompt. Đây là kỹ thuật prompting nào?

**Đáp án đúng:** **B**

Few-shot prompting rất hiệu quả khi cần ép LLM tuân thủ một cấu trúc đầu ra cụ thể (như JSON/XML) hoặc phong cách phân loại riêng mà không cần fine-tune.

- **A:** Sai. Zero-shot prompting không cung cấp bất kỳ ví dụ mẫu nào trong prompt.
- **B (Đúng):** Chính xác. Few-shot prompting cung cấp một vài cặp ví dụ (input -> output) ngay trong prompt để mô hình học theo định dạng và logic mong muốn (in-context learning).
- **C:** Sai. Continued pre-training là quá trình huấn luyện cập nhật trọng số mô hình trên tập dữ liệu lớn, không phải kỹ thuật viết prompt.
- **D:** Sai. Negative prompting là chỉ định những thứ không muốn xuất hiện trong đầu ra (thường dùng trong sinh ảnh).

</details>

### Câu 4 `hard`

A pharmaceutical company has 500 GB of unlabeled proprietary biomedical research papers and internal drug discovery terminology. They want a Foundation Model to deeply understand this specialized domain language before building downstream applications. Which customization method is MOST appropriate?

- **A.** Zero-shot prompting
- **B.** Continued pre-training
- **C.** Instruction fine-tuning with 500 labeled Q&A pairs
- **D.** Amazon Bedrock Guardrails

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty dược phẩm có 500 GB bài báo nghiên cứu y sinh độc quyền chưa được gán nhãn và thuật ngữ khám phá thuốc nội bộ. Họ muốn một Foundation Model hiểu sâu ngôn ngữ chuyên ngành này trước khi xây dựng các ứng dụng tiếp theo. Phương pháp tùy chỉnh nào PHÙ HỢP NHẤT?

**Đáp án đúng:** **B**

Phân biệt rõ: Continued Pre-training dùng dữ liệu thô không nhãn (unlabeled) khối lượng lớn để thích ứng miền (domain adaptation); Fine-tuning dùng dữ liệu có nhãn (labeled) để dạy tác vụ/định dạng; RAG dùng để tra cứu dữ liệu cập nhật theo thời gian thực.

- **A:** Sai. Zero-shot không giúp mô hình học sâu kho thuật ngữ chuyên ngành 500 GB.
- **B (Đúng):** Chính xác. Continued pre-training sử dụng dữ liệu lớn chưa gắn nhãn (unlabeled domain corpus) để điều chỉnh trọng số FM, giúp mô hình nắm vững ngôn ngữ và kiến thức chuyên ngành sâu.
- **C:** Sai. Instruction fine-tuning dùng dữ liệu có nhãn (prompt-response pairs) để dạy định dạng/tác vụ cụ thể, không tối ưu để nạp 500 GB văn bản thô chưa gắn nhãn.
- **D:** Sai. Guardrails dùng để lọc nội dung an toàn, không dùng để huấn luyện kiến thức chuyên ngành.

</details>

### Câu 5 `medium`

An organization wants to build a Q&A assistant over its internal product manuals and is deciding between Retrieval-Augmented Generation (RAG) and Fine-tuning. Which TWO advantages make RAG the better choice when product specifications change weekly? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** RAG permanently modifies the model weights to memorize all uploaded PDF manuals
- **B.** RAG allows updating the knowledge base without retraining the Foundation Model
- **C.** RAG eliminates the need for any embedding model or vector database infrastructure
- **D.** RAG reduces hallucinations by grounding responses in retrieved source citations
- **E.** RAG requires purchasing Provisioned Throughput capacity on Amazon Bedrock

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức muốn xây dựng trợ lý hỏi đáp trên các tài liệu hướng dẫn sản phẩm nội bộ và đang cân nhắc giữa Retrieval-Augmented Generation (RAG) và Fine-tuning. HAI ưu điểm nào khiến RAG trở thành lựa chọn tốt hơn khi thông số kỹ thuật sản phẩm thay đổi hằng tuần? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

RAG vượt trội hơn Fine-tuning ở tính cập nhật dữ liệu (freshness), chi phí bảo trì thấp, giảm ảo giác (grounding) và khả năng trích dẫn nguồn (citations).

- **A:** Sai. RAG không thay đổi trọng số mô hình; việc thay đổi trọng số là của Fine-tuning.
- **B (Đúng):** Chính xác. Với RAG, chỉ cần cập nhật tài liệu vào vector database là mô hình có ngay thông tin mới nhất mà không tốn chi phí và thời gian retrain.
- **C:** Sai. Kiến trúc RAG tiêu chuẩn cần embedding model và vector store để truy xuất ngữ cảnh.
- **D (Đúng):** Chính xác. RAG cung cấp ngữ cảnh thực tế từ tài liệu nội bộ kèm trích dẫn, giúp giảm ảo giác và dễ kiểm chứng.
- **E:** Sai. RAG dùng được với mô hình On-Demand trên Amazon Bedrock.

</details>

### Câu 6 `medium`

A media company wants to customize a Foundation Model so that all generated news summaries strictly follow the company's unique editorial style, tone, and 3-bullet JSON structure. They have prepared 2,000 labeled examples of input articles paired with ideal summaries. Which approach is MOST suitable?

- **A.** Continued pre-training on unlabeled audio files
- **B.** Instruction fine-tuning (supervised fine-tuning)
- **C.** Amazon Kendra enterprise web crawler indexing
- **D.** Increasing the Temperature parameter to 1.0

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty truyền thông muốn tùy chỉnh một Foundation Model sao cho tất cả các bản tóm tắt tin tức được tạo ra đều tuân thủ nghiêm ngặt văn phong biên tập, giọng điệu và cấu trúc JSON 3 gạch đầu dòng đặc trưng của công ty. Họ đã chuẩn bị 2.000 ví dụ được gán nhãn gồm bài viết đầu vào ghép cặp với bản tóm tắt lý tưởng. Cách tiếp cận nào PHÙ HỢP NHẤT?

**Đáp án đúng:** **B**

Khi có tập dữ liệu cặp (input -> output) có nhãn để dạy mô hình một phong cách, giọng điệu hoặc định dạng cụ thể (task-specific behavior), Instruction Fine-tuning là lựa chọn chuẩn.

- **A:** Sai. Continued pre-training dùng cho dữ liệu thô không nhãn khối lượng lớn để học kiến thức miền, không tối ưu cho học định dạng từ 2,000 cặp ví dụ có nhãn.
- **B (Đúng):** Chính xác. Instruction fine-tuning sử dụng tập dữ liệu có nhãn (prompt-completion pairs) để dạy mô hình tuân thủ chính xác phong cách viết, giọng điệu và định dạng đầu ra đặc thù.
- **C:** Sai. Kendra là công cụ tìm kiếm, không tùy chỉnh trọng số mô hình.
- **D:** Sai. Tăng Temperature làm đầu ra kém nhất quán.

</details>

### Câu 7 `hard`

An engineering team is evaluating a fine-tuned language model by measuring how well it predicts the next token in a held-out test corpus. A lower value indicates that the model is less surprised and assigns higher probability to the actual sequence. Which metric are they measuring?

- **A.** ROUGE-L score
- **B.** Macro Precision
- **C.** Perplexity
- **D.** Adjusted R-squared

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ kỹ sư đang đánh giá một mô hình ngôn ngữ đã fine-tune bằng cách đo lường mức độ dự đoán tốt của mô hình đối với token tiếp theo trong tập kiểm thử (held-out test corpus). Giá trị càng thấp cho thấy mô hình càng ít bị bất ngờ và gán xác suất cao hơn cho chuỗi thực tế. Họ đang đo lường chỉ số nào?

**Đáp án đúng:** **C**

Perplexity là thước đo nội tại (intrinsic metric) của Language Model: Perplexity càng thấp chứng tỏ mô hình dự đoán xác suất ngôn ngữ tự nhiên càng tốt.

- **A:** Sai. ROUGE-L đo chuỗi con chung dài nhất giữa bản tóm tắt sinh ra và bản tóm tắt tham chiếu.
- **B:** Sai. Precision là metric cho bài toán phân loại.
- **C (Đúng):** Chính xác. Perplexity đo lường mức độ 'bối rối' (uncertainty) của mô hình ngôn ngữ khi dự đoán chuỗi token tiếp theo; giá trị Perplexity càng thấp thì mô hình càng khớp tốt với phân phối ngôn ngữ.
- **D:** Sai. R-squared là metric cho bài toán hồi quy (Regression).

</details>

### Câu 8 `medium`

An e-commerce company wants its customer support chatbot on Amazon Bedrock to answer questions using product return policies and inventory guides that are updated daily in Amazon S3, and to include source citations in every answer. Which approach is the most cost-effective and maintainable?

- **A.** Run nightly instruction fine-tuning jobs on the foundation model with updated policy files
- **B.** Implement Retrieval-Augmented Generation (RAG) using Knowledge Bases for Amazon Bedrock
- **C.** Perform continued pre-training on the daily policy files using Amazon Bedrock customization
- **D.** Embed the entire repository of company documents into the system prompt of every API call

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty thương mại điện tử muốn chatbot hỗ trợ khách hàng trên Amazon Bedrock trả lời các câu hỏi dựa trên chính sách đổi trả sản phẩm và hướng dẫn tồn kho được cập nhật hằng ngày trong Amazon S3, đồng thời đính kèm trích dẫn nguồn trong mỗi câu trả lời. Cách tiếp cận nào tiết kiệm chi phí nhất và dễ bảo trì nhất?

**Đáp án đúng:** **B**

Khi dữ liệu thay đổi thường xuyên và cần trích dẫn nguồn chính xác, RAG (Knowledge Bases for Amazon Bedrock) luôn vượt trội hơn Fine-tuning về cả chi phí, độ tươi mới dữ liệu và khả năng giảm Hallucination.

- **A:** Sai. Fine-tuning hàng ngày rất tốn kém, chậm và không thể tự động cung cấp trích dẫn nguồn (citations) đáng tin cậy cho dữ liệu biến động liên tục.
- **B (Đúng):** Chính xác. RAG với Knowledge Bases for Amazon Bedrock tự động đồng bộ tài liệu từ S3 vào Vector Store, truy xuất thông tin mới nhất theo thời gian thực và trả về trích dẫn nguồn (Citations).
- **C:** Sai. Continued pre-training tốn chi phí rất lớn và đòi hỏi lượng dữ liệu khổng lồ, hoàn toàn không phù hợp cho tài liệu cập nhật hàng ngày.
- **D:** Sai. Đưa toàn bộ kho tài liệu vào mỗi prompt sẽ vượt quá Context Window và làm chi phí token tăng vọt.

</details>

### Câu 9 `medium`

A media company has 15,000 labeled pairs of article drafts and rewritten brand-styled summaries. They want a foundation model on Amazon Bedrock to consistently adopt their unique editorial tone and formatting style without including examples in every prompt. Which customization method should they use?

- **A.** Instruction-based fine-tuning
- **B.** Continued pre-training
- **C.** Retrieval-Augmented Generation (RAG)
- **D.** Zero-shot prompting

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty truyền thông có 15.000 cặp dữ liệu được gán nhãn gồm bản nháp bài viết và bản tóm tắt được viết lại theo văn phong thương hiệu. Họ muốn một foundation model trên Amazon Bedrock áp dụng nhất quán giọng văn biên tập và định dạng đặc trưng của mình mà không cần đưa ví dụ vào mọi prompt. Họ nên sử dụng phương pháp tùy chỉnh nào?

**Đáp án đúng:** **A**

Instruction Fine-tuning dùng dữ liệu có nhãn (Prompt–Completion) để điều chỉnh hành vi, phong cách hoặc định dạng đầu ra của FM; trong khi RAG bổ sung tri thức cập nhật và Continued Pre-training dạy kiến thức chuyên ngành từ dữ liệu không nhãn.

- **A (Đúng):** Chính xác. Instruction-based fine-tuning sử dụng tập dữ liệu có nhãn (cặp prompt-completion) để cập nhật trọng số mô hình, giúp mô hình học sâu giọng điệu, phong cách và định dạng đặc thù.
- **B:** Sai. Continued pre-training dùng lượng lớn dữ liệu KHÔNG có nhãn (unlabeled) để dạy kiến thức chuyên ngành, không dùng cặp prompt-completion để học phong cách.
- **C:** Sai. RAG tốt cho việc bổ sung tri thức thực tế mới, nhưng kém hiệu quả hơn Fine-tuning khi muốn mô hình thấm nhuần một phong cách viết đặc thù ổn định.
- **D:** Sai. Zero-shot khó đảm bảo sự nhất quán cao về giọng điệu biên tập đặc thù trên quy mô lớn.

</details>

### Câu 10 `hard`

A biomedical research institute has millions of unlabeled scientific papers and proprietary lab notes containing specialized terminology. They want a foundation model to deeply learn this domain vocabulary before downstream tasks. Which customization technique is most appropriate?

- **A.** Few-shot prompting
- **B.** Instruction-based fine-tuning
- **C.** Continued pre-training
- **D.** Amazon Bedrock Guardrails

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một viện nghiên cứu y sinh có hàng triệu bài báo khoa học chưa được gán nhãn và ghi chú phòng thí nghiệm độc quyền chứa các thuật ngữ chuyên ngành. Họ muốn một foundation model học sâu vốn từ vựng chuyên ngành này trước khi thực hiện các tác vụ tiếp theo. Kỹ thuật tùy chỉnh nào là phù hợp nhất?

**Đáp án đúng:** **C**

Từ khóa 'millions of unlabeled domain documents' + 'deeply learn specialized terminology' luôn chỉ về Continued Pre-training.

- **A:** Sai. Few-shot chỉ đưa được vài ví dụ vào prompt, không thể nạp hàng triệu bài báo chuyên ngành vào mô hình.
- **B:** Sai. Instruction fine-tuning yêu cầu dữ liệu có nhãn dạng cặp prompt-completion, trong khi viện nghiên cứu có hàng triệu tài liệu KHÔNG có nhãn.
- **C (Đúng):** Chính xác. Continued pre-training (còn gọi là Domain Adaptation) sử dụng lượng lớn dữ liệu chuyên ngành không có nhãn (unlabeled data) để giúp FM học sâu từ vựng và ngữ cảnh lĩnh vực đặc thù.
- **D:** Sai. Guardrails dùng để lọc nội dung an toàn và chặn PII/Hallucination, không dùng để huấn luyện kiến thức chuyên ngành.

</details>

---

[Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md)
