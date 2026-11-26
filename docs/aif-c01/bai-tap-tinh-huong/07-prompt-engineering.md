# Bài tập tình huống — Prompt Engineering & Inference Parameters (Temperature, Top-P, CoT)

> Kỹ thuật Zero-shot, Few-shot, Chain-of-Thought (CoT), System Prompts, phòng chống Prompt Injection và tinh chỉnh Temperature, Top-P, Top-K, Max Tokens.
> **Số câu hỏi:** 11 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

An NLP engineer is evaluating a Foundation Model's ability to summarize 10-page financial reports against human-written reference summaries. Which automated metric specifically measures n-gram recall overlap against the reference summaries?

- **A.** ROUGE
- **B.** BLEU
- **C.** MAE
- **D.** Silhouette Score

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư NLP đang đánh giá khả năng của một Foundation Model trong việc tóm tắt các báo cáo tài chính dài 10 trang so với các bản tóm tắt tham chiếu do con người viết. Chỉ số tự động nào đo lường cụ thể độ trùng khớp n-gram recall so với các bản tóm tắt tham chiếu?

**Đáp án đúng:** **A**

Ghi nhớ cặp chuẩn: Text Summarization → ROUGE (Recall-oriented); Machine Translation → BLEU (Precision-oriented); Semantic similarity → BERTScore.

- **A (Đúng):** Chính xác. ROUGE (Recall-Oriented Understudy for Gisting Evaluation) đo độ trùng lặp n-gram/chuỗi từ dựa trên Recall và là thước đo tiêu chuẩn cho bài toán tóm tắt văn bản.
- **B:** Sai. BLEU dựa trên Precision và thường dùng cho bài toán dịch máy (Machine Translation).
- **C:** Sai. MAE dùng cho bài toán hồi quy số học.
- **D:** Sai. Silhouette Score dùng để đánh giá chất lượng phân cụm (Clustering).

</details>

### Câu 2 `medium`

A data science team needs to evaluate thousands of generated customer-service responses for helpfulness, tone, and correctness. Human evaluation is too slow and expensive, while simple n-gram metrics miss paraphrased answers. Which approach in Amazon Bedrock Model Evaluation addresses this?

- **A.** Confusion Matrix accuracy
- **B.** Exact-match BLEU score only
- **C.** Amazon Macie PII discovery
- **D.** LLM-as-a-Judge evaluation

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ khoa học dữ liệu cần đánh giá hàng nghìn phản hồi dịch vụ khách hàng được tạo ra về mức độ hữu ích, giọng văn và tính chính xác. Việc đánh giá thủ công bởi con người quá chậm và tốn kém, trong khi các chỉ số n-gram đơn giản bỏ sót các câu trả lời được diễn đạt lại (paraphrase). Cách tiếp cận nào trong Amazon Bedrock Model Evaluation giải quyết vấn đề này?

**Đáp án đúng:** **D**

Amazon Bedrock Model Evaluation hỗ trợ 3 chế độ: Automatic (ROUGE/BERTScore...), Human Evaluation (đội ngũ người chấm) và LLM-as-a-Judge (dùng LLM đánh giá LLM theo rubric ngữ nghĩa quy mô lớn).

- **A:** Sai. Confusion Matrix dùng cho bài toán phân loại nhãn rời rạc, không chấm điểm được câu trả lời văn bản mở.
- **B:** Sai. BLEU chỉ đếm trùng lặp từ khóa cứng nên bỏ sót các câu trả lời diễn đạt lại (paraphrase) đúng nghĩa.
- **C:** Sai. Macie dùng để phát hiện dữ liệu nhạy cảm/PII trên S3.
- **D (Đúng):** Chính xác. LLM-as-a-Judge sử dụng một mô hình ngôn ngữ lớn mạnh hơn để tự động chấm điểm câu trả lời của mô hình khác theo các tiêu chí ngữ nghĩa như helpfulness, correctness và tone ở quy mô lớn.

</details>

### Câu 3 `easy`

A developer is prompting an LLM to solve multi-step word problems in arithmetic and logic. Simply asking for the final answer yields frequent errors, but instructing the model to 'think step by step' before giving the final answer dramatically improves accuracy. Which prompting technique is this?

- **A.** Negative prompting exclusions
- **B.** Post-training Model Quantization
- **C.** Chain-of-Thought (CoT) prompting
- **D.** Min-Max Feature Scaling in preprocessing

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên đang viết prompt cho một LLM để giải các bài toán đố nhiều bước về số học và logic. Chỉ yêu cầu đưa ra đáp án cuối cùng thường dẫn đến sai sót, nhưng hướng dẫn mô hình 'think step by step' (suy nghĩ từng bước) trước khi đưa ra đáp án cuối cùng lại cải thiện độ chính xác đáng kể. Đây là kỹ thuật prompting nào?

**Đáp án đúng:** **C**

Chain-of-Thought (CoT) prompting là kỹ thuật kinh điển giúp LLM giải quyết các bài toán suy luận đa bước (reasoning, math, logic) chính xác hơn hẳn so với hỏi trực tiếp.

- **A:** Sai. Negative prompting thường dùng trong mô hình tạo ảnh để loại trừ các yếu tố không mong muốn.
- **B:** Sai. Quantization là kỹ thuật nén trọng số mô hình.
- **C (Đúng):** Chính xác. Chain-of-Thought prompting khuyến khích LLM phân rã bài toán phức tạp thành các bước suy luận trung gian trước khi kết luận, giúp tăng mạnh độ chính xác cho toán học và logic.
- **D:** Sai. Feature Scaling là bước chuẩn hóa dữ liệu số trong ML truyền thống.

</details>

### Câu 4 `medium`

An engineering team notices that an LLM frequently makes arithmetic and multi-step logical errors when solving complex financial word problems. How can the team improve the model's reasoning accuracy using prompt engineering alone?

- **A.** Set the Temperature parameter to 1.0 to encourage more creative logical problem-solving
- **B.** Reduce Max Tokens to 20 so the model outputs the final answer immediately without delay
- **C.** Convert the mathematical word problem into an image and invoke a vision generation model
- **D.** Use Chain-of-Thought (CoT) prompting by instructing the model to think step by step

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ kỹ sư nhận thấy một LLM thường xuyên mắc lỗi số học và logic nhiều bước khi giải các bài toán tài chính phức tạp. Đội ngũ có thể cải thiện độ chính xác suy luận của mô hình chỉ bằng prompt engineering như thế nào?

**Đáp án đúng:** **D**

Chain-of-Thought (CoT) prompting là kỹ thuật kinh điển giúp LLM giải quyết các bài toán suy luận nhiều bước (multi-step reasoning) chính xác hơn hẳn so với hỏi trực tiếp đáp án.

- **A:** Sai. Tăng Temperature làm tăng tính ngẫu nhiên và dễ gây sai sót tính toán hơn.
- **B:** Sai. Giới hạn token quá ngắn khiến mô hình không đủ không gian suy luận từng bước và dễ cắt ngang câu trả lời.
- **C:** Sai. Chuyển văn bản thành ảnh không cải thiện khả năng suy luận logic.
- **D (Đúng):** Chính xác. Chain-of-Thought (CoT) khuyến khích mô hình chia nhỏ bài toán và trình bày từng bước suy luận trung gian trước khi đưa ra đáp án cuối, cải thiện rõ rệt độ chính xác cho toán học và logic.

</details>

### Câu 5 `hard`

A data science team is evaluating two Foundation Models on a text summarization task against human-written reference summaries. They need an automated metric that measures n-gram recall overlap between the generated summary and the reference summary. Which metric should they use?

- **A.** ROUGE
- **B.** RMSE
- **C.** AUC-ROC
- **D.** Silhouette Score

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ khoa học dữ liệu đang đánh giá hai Foundation Model trên tác vụ tóm tắt văn bản so với các bản tóm tắt tham chiếu do con người viết. Họ cần một chỉ số tự động đo lường độ trùng khớp n-gram recall giữa bản tóm tắt được tạo ra và bản tóm tắt tham chiếu. Họ nên sử dụng chỉ số nào?

**Đáp án đúng:** **A**

Trong đánh giá LLM tự động: ROUGE dùng cho tóm tắt (recall-oriented); BLEU dùng cho dịch máy (precision-oriented); BERTScore dùng embeddings để đo tương đồng ngữ nghĩa; Perplexity đo độ tự tin dự đoán token tiếp theo.

- **A (Đúng):** Chính xác. ROUGE (Recall-Oriented Understudy for Gisting Evaluation) là thước đo tiêu chuẩn cho bài toán tóm tắt văn bản (summarization), tập trung đo độ phủ (recall) các n-gram so với bản tóm tắt chuẩn.
- **B:** Sai. RMSE là thước đo sai số cho bài toán dự đoán số liên tục (Regression).
- **C:** Sai. AUC-ROC dùng cho bài toán phân loại nhị phân (Binary Classification).
- **D:** Sai. Silhouette Score dùng để đánh giá chất lượng phân cụm (Clustering).

</details>

### Câu 6 `easy`

A developer wants an LLM to consistently act as a senior cybersecurity analyst, adopt a formal tone, and never reveal internal instructions, regardless of what the user types in the chat input. Where should the developer place these overarching behavioral instructions?

- **A.** In the System Prompt
- **B.** In the Stop Sequences field
- **C.** In the Vector Store metadata index
- **D.** In the Top-P parameter

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên muốn một LLM luôn đóng vai chuyên gia phân tích an ninh mạng cao cấp, sử dụng giọng văn trang trọng và không bao giờ tiết lộ hướng dẫn nội bộ, bất kể người dùng nhập gì vào khung chat. Lập trình viên nên đặt các hướng dẫn hành vi tổng quát này ở đâu?

**Đáp án đúng:** **A**

System Prompt định hình hành vi, vai trò (role prompting) và quy tắc nền tảng cho mô hình trong suốt phiên hội thoại.

- **A (Đúng):** Chính xác. System Prompt là nơi thiết lập vai trò (persona), giọng điệu, quy tắc ứng xử và ràng buộc tổng thể cho mô hình, tách biệt với đầu vào của người dùng (User Prompt).
- **B:** Sai. Stop Sequences chỉ định chuỗi ký tự khiến mô hình dừng sinh thêm token.
- **C:** Sai. Metadata index dùng để lọc tài liệu trong RAG, không định nghĩa vai trò cho LLM.
- **D:** Sai. Top-P là tham số lấy mẫu xác suất token.

</details>

### Câu 7 `hard`

A translation quality team finds that exact n-gram matching metrics like BLEU unfairly penalize valid translations that use synonyms (for example, 'automobile' instead of 'car'). Which automated metric uses contextual embeddings to evaluate semantic similarity between generated text and reference text?

- **A.** BERTScore
- **B.** Exact Match (EM)
- **C.** Mean Squared Error (MSE)
- **D.** Confusion Matrix

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ kiểm soát chất lượng dịch thuật nhận thấy các chỉ số khớp n-gram chính xác như BLEU đánh giá thiếu công bằng các bản dịch hợp lệ sử dụng từ đồng nghĩa (ví dụ: 'automobile' thay vì 'car'). Chỉ số tự động nào sử dụng contextual embeddings để đánh giá độ tương đồng ngữ nghĩa giữa văn bản được tạo và văn bản tham chiếu?

**Đáp án đúng:** **A**

Khác với BLEU và ROUGE chỉ đếm trùng khớp từ/n-gram bề mặt, BERTScore dùng embeddings để đo tương đồng ngữ nghĩa (semantic similarity), rất hữu ích khi đánh giá câu trả lời dùng từ đồng nghĩa.

- **A (Đúng):** Chính xác. BERTScore sử dụng vector embeddings ngữ cảnh từ mô hình BERT để so sánh mức độ tương đồng ngữ nghĩa ở mức token, nhận diện được từ đồng nghĩa và cách diễn đạt khác nhau.
- **B:** Sai. Exact Match yêu cầu chuỗi ký tự khớp hoàn toàn 100%.
- **C:** Sai. MSE dùng cho bài toán hồi quy số học.
- **D:** Sai. Confusion Matrix dùng cho bài toán phân loại.

</details>

### Câu 8 `hard`

A development team is troubleshooting an LLM application that occasionally ignores instructions when untrusted user input is concatenated into the prompt, and sometimes produces verbose answers instead of concise bullet points. Which TWO prompt engineering practices will improve reliability? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Increase Temperature to 1.0 to force the model to adhere more strictly to formatting constraints
- **B.** Remove the System Prompt entirely and append all instructions at the end without any delimiters
- **C.** Use XML delimiters (e.g., <user_input></user_input>) to separate instructions from untrusted data
- **D.** Configure an n-gram BLEU score threshold as a real-time content safety guardrail during inference
- **E.** Provide explicit formatting constraints and few-shot examples showing the concise bullet-point output

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ phát triển đang xử lý sự cố với một ứng dụng LLM thỉnh thoảng bỏ qua hướng dẫn khi đầu vào không đáng tin cậy của người dùng được nối vào prompt, và đôi khi tạo ra câu trả lời dài dòng thay vì các gạch đầu dòng súc tích. HAI thực hành prompt engineering nào sẽ cải thiện độ tin cậy? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Thực hành tốt trong Prompt Engineering: dùng Delimiters (XML tags) để cô lập dữ liệu người dùng, kết hợp System Prompt rõ ràng và Few-shot examples để cố định định dạng đầu ra.

- **A:** Sai. Tăng Temperature làm mô hình sáng tạo/ngẫu nhiên hơn chứ không tuân thủ định dạng chặt chẽ hơn.
- **B:** Sai. Bỏ System Prompt làm giảm tính nhất quán và tách biệt vai trò của mô hình.
- **C (Đúng):** Chính xác. Dùng delimiter (như thẻ XML) giúp FM phân biệt rõ đâu là chỉ thị hệ thống và đâu là dữ liệu đầu vào cần xử lý, giảm nhầm lẫn và rủi ro prompt injection.
- **D:** Sai. BLEU là metric đánh giá dịch máy offline, không phải guardrail runtime.
- **E (Đúng):** Chính xác. Kết hợp chỉ dẫn định dạng rõ ràng và ví dụ mẫu (few-shot) giúp mô hình tuân thủ cấu trúc đầu ra nhất quán hơn.

</details>

### Câu 9 `easy`

A developer is prompting an LLM to solve multi-step financial math problems, but the model frequently makes arithmetic errors when answering directly. Which prompt engineering technique should the developer apply to improve reasoning accuracy?

- **A.** Zero-shot prompting without examples
- **B.** Negative prompting to exclude terms
- **C.** Continued pre-training on unlabeled text
- **D.** Chain-of-Thought (CoT) prompting

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên đang viết prompt cho một LLM để giải các bài toán tài chính nhiều bước, nhưng mô hình thường xuyên mắc lỗi số học khi trả lời trực tiếp. Lập trình viên nên áp dụng kỹ thuật prompt engineering nào để cải thiện độ chính xác trong suy luận?

**Đáp án đúng:** **D**

Chain-of-Thought (CoT) prompting yêu cầu LLM trình bày chuỗi lập luận trung gian trước khi đưa ra đáp án cuối, là kỹ thuật hiệu quả và rẻ nhất cho các bài toán suy luận phức tạp.

- **A:** Sai. Zero-shot chỉ hỏi trực tiếp nên mô hình dễ bỏ qua các bước trung gian và tính sai.
- **B:** Sai. Negative prompting chỉ dùng để loại trừ yếu tố không mong muốn (đặc biệt trong sinh ảnh), không giúp giải toán đa bước.
- **C:** Sai. Continued pre-training là kỹ thuật huấn luyện lại mô hình cực kỳ tốn kém, không phải kỹ thuật Prompt Engineering.
- **D (Đúng):** Chính xác. Chain-of-Thought (CoT) hướng dẫn mô hình suy luận từng bước ('Think step-by-step'), giúp cải thiện rõ rệt độ chính xác với bài toán logic và toán học nhiều bước.

</details>

### Câu 10 `medium`

A news agency is evaluating multiple foundation models on Amazon Bedrock to automatically summarize long investigative articles. Which automated evaluation metric is specifically designed to measure text summarization quality against reference summaries?

- **A.** BLEU
- **B.** ROUGE
- **C.** RMSE
- **D.** AUC-ROC

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một hãng tin tức đang đánh giá nhiều foundation model trên Amazon Bedrock để tự động tóm tắt các bài báo điều tra dài. Chỉ số đánh giá tự động nào được thiết kế chuyên biệt để đo lường chất lượng tóm tắt văn bản so với các bản tóm tắt tham chiếu?

**Đáp án đúng:** **B**

Mẹo nhớ nhanh cho kỳ thi: ROUGE cho Tóm tắt (Summarization), BLEU cho Dịch máy (Translation), BERTScore cho độ tương đồng ngữ nghĩa và Perplexity cho độ tự tin dự đoán ngôn ngữ.

- **A:** Sai. BLEU (Bilingual Evaluation Understudy) được thiết kế chuyên biệt để đánh giá chất lượng dịch máy (Machine Translation).
- **B (Đúng):** Chính xác. ROUGE (Recall-Oriented Understudy for Gisting Evaluation) là chỉ số chuẩn để đánh giá chất lượng tóm tắt văn bản (Text Summarization) so với bản tóm tắt tham chiếu.
- **C:** Sai. RMSE là chỉ số sai số cho mô hình Regression trong ML truyền thống.
- **D:** Sai. AUC-ROC dùng cho bài toán phân loại nhị phân (Binary Classification).

</details>

### Câu 11 `medium`

A developer is using a foundation model to classify customer reviews into JSON objects with strict keys ('category', 'urgency', 'summary'). The output occasionally omits keys or adds extra conversational text. Which TWO prompt engineering practices will best fix this issue? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Increase the temperature parameter to 1.0 to maximize token diversity across keys
- **B.** Provide 3 to 5 few-shot examples showing the exact expected JSON structure
- **C.** Remove all system instructions so the model can infer the schema autonomously
- **D.** Switch to a text-to-image diffusion model for structured ticket classification
- **E.** Add explicit output format instructions and clear delimiters in the prompt

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một lập trình viên đang sử dụng foundation model để phân loại đánh giá của khách hàng thành các đối tượng JSON với các khóa bắt buộc ('category', 'urgency', 'summary'). Đầu ra thỉnh thoảng bỏ sót khóa hoặc thêm văn bản hội thoại thừa. HAI thực hành prompt engineering nào sẽ khắc phục tốt nhất vấn đề này? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, E**

Để ép LLM tuân thủ nghiêm ngặt định dạng đầu ra (JSON/XML/CSV), kết hợp Few-shot examples, hướng dẫn định dạng rõ ràng (Output Indicators) và giảm Temperature là thực hành tốt nhất.

- **A:** Sai. Tăng Temperature lên 1.0 làm mô hình sinh câu trả lời ngẫu nhiên hơn, dễ phá vỡ cấu trúc JSON.
- **B (Đúng):** Chính xác. Few-shot prompting cung cấp các mẫu đầu ra JSON chuẩn giúp mô hình bắt chước chính xác cấu trúc khóa và định dạng mong muốn.
- **C:** Sai. Bỏ chỉ dẫn hệ thống sẽ khiến đầu ra càng thiếu nhất quán hơn.
- **D:** Sai. Diffusion models chuyên dùng để tạo hình ảnh/video, không dùng để phân loại văn bản thành JSON.
- **E (Đúng):** Chính xác. Chỉ dẫn định dạng đầu ra rõ ràng (ví dụ: 'Return ONLY valid JSON with keys...') kèm dấu phân cách giúp loại bỏ văn bản thừa.

</details>

---

[Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md)
