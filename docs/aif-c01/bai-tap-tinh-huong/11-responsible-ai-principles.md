# Bài tập tình huống — AI Có trách nhiệm: Bias, Fairness, Hallucination & Explainability

> 6 trụ cột Responsible AI của AWS (Fairness, Explainability, Privacy & Security, Safety, Controllability, Veracity & Robustness), xử lý Imbalanced Data và Toxicity.
> **Số câu hỏi:** 3 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `easy`

Which principle of Responsible AI focuses on ensuring that users know when they are interacting with an AI system and understand the system's intended capabilities and limitations?

- **A.** Transparency
- **B.** Quantization
- **C.** Latency Optimization
- **D.** Overfitting

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Nguyên tắc nào của Responsible AI tập trung vào việc đảm bảo người dùng biết khi nào họ đang tương tác với một hệ thống AI và hiểu rõ các khả năng cũng như hạn chế dự kiến của hệ thống?

**Đáp án đúng:** **A**

Các trụ cột chính của Responsible AI trên AWS gồm: Fairness, Explainability, Privacy & Security, Safety, Controllability, Veracity & Robustness, Governance và Transparency.

- **A (Đúng):** Chính xác. Transparency (Tính minh bạch) yêu cầu công khai thông tin cho người dùng biết họ đang tương tác với AI, cũng như hiểu rõ phạm vi, dữ liệu và giới hạn của hệ thống (ví dụ qua Model Cards hoặc Service Cards).
- **B:** Sai. Quantization là kỹ thuật tối ưu kích thước mô hình.
- **C:** Sai. Đây là mục tiêu hiệu năng kỹ thuật, không phải nguyên tắc Responsible AI.
- **D:** Sai. Overfitting là hiện tượng mô hình học vẹt dữ liệu huấn luyện.

</details>

### Câu 2 `medium`

A bank trained a loan approval model using historical lending decisions from the past 20 years. An audit reveals that the model systematically rejects qualified applicants from certain zip codes because past human decisions reflected societal inequities. Which type of bias is this?

- **A.** Historical bias
- **B.** Latency bias
- **C.** Quantization bias
- **D.** Tokenization bias

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ngân hàng đã huấn luyện mô hình phê duyệt khoản vay bằng dữ liệu quyết định cho vay lịch sử trong 20 năm qua. Một cuộc kiểm toán cho thấy mô hình từ chối có hệ thống những người nộp đơn đủ điều kiện từ một số mã bưu chính nhất định vì các quyết định của con người trong quá khứ phản ánh sự bất bình đẳng xã hội. Đây là loại thiên vị (bias) nào?

**Đáp án đúng:** **A**

Historical bias (thiên lệch lịch sử) phát sinh từ chính dữ liệu quá khứ mang tính bất công xã hội, ngay cả khi dữ liệu được thu thập chính xác.

- **A (Đúng):** Chính xác. Historical bias xảy ra khi dữ liệu quá khứ phản ánh sẵn định kiến hoặc bất bình đẳng xã hội trong thực tế, khiến mô hình học và tái tạo lại định kiến đó.
- **B:** Sai. Không có khái niệm Latency bias trong phân loại thiên lệch AI.
- **C:** Sai. Quantization là kỹ thuật nén mô hình, không phải nguyên nhân gây định kiến nhân khẩu học từ dữ liệu lịch sử.
- **D:** Sai. Đây là bài toán dữ liệu bảng lịch sử cho vay, không liên quan đến tokenization.

</details>

### Câu 3 `medium`

According to AWS Responsible AI guidelines, which TWO practices directly support the pillars of Fairness and Veracity/Robustness when deploying a Generative AI solution? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Setting Temperature to 1.0 for all factual medical and legal advisory queries to diversify output
- **B.** Evaluating the model across demographic subgroups to detect and mitigate disparate impact
- **C.** Removing all human-in-the-loop review workflows for high-stakes financial lending decisions
- **D.** Implementing RAG with source citations and contextual grounding checks to minimize hallucinations
- **E.** Deploying a single unverified system prompt without any Bedrock Guardrails content filtering

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Theo hướng dẫn AWS Responsible AI, HAI thực hành nào hỗ trợ trực tiếp cho các trụ cột Công bằng (Fairness) và Tính xác thực/Độ bền vững (Veracity/Robustness) khi triển khai giải pháp Generative AI? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Các trụ cột cốt lõi của Responsible AI trên AWS gồm Fairness (công bằng), Explainability (giải thích được), Privacy & Security, Safety, Controllability, Veracity & Robustness (xác thực/chống ảo giác), Governance và Transparency.

- **A:** Sai. Temperature cao làm tăng tính ngẫu nhiên và nguy cơ ảo giác cho câu hỏi thực tế.
- **B (Đúng):** Chính xác. Đánh giá và giảm thiểu tác động bất bình đẳng (disparate impact) trên các nhóm nhân khẩu học khác nhau là cốt lõi của trụ cột Fairness.
- **C:** Sai. Các quyết định rủi ro cao cần cơ chế Human-in-the-loop (như Amazon A2I).
- **D (Đúng):** Chính xác. Giảm ảo giác và đảm bảo đầu ra có căn cứ thực tế thuộc trụ cột Veracity & Robustness (tính xác thực và độ tin cậy).
- **E:** Sai. Thiếu kiểm duyệt nội dung làm tăng rủi ro an toàn và độc hại.

</details>

---

[Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md)
