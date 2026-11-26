# Bài tập tình huống — Chủ đề 7: Evaluation Engineering (Golden Datasets, Deterministic Graders & LLM-as-a-Judge)

> Xây dựng Golden Eval Datasets, kết hợp Code-based Graders với LLM-as-a-Judge theo Rubric và hiệu chỉnh độ tin cậy của bộ chấm điểm.
> **Số câu hỏi:** 2 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A golden evaluation dataset consists of 500 common FAQ questions. When a prompt update passes 98% on this dataset, it still breaks multi-turn tool-use edge cases and adversarial inputs in production. What is wrong with the evaluation suite?

- **A.** The evaluation suite executes with `temperature: 0.0` instead of `temperature: 1.0`, masking stochastic production failures on common queries.
- **B.** The golden dataset is too large; reducing it to 20 simple FAQ questions will expose more production edge-case regressions.
- **C.** The team should delete all passing test cases after every release so that only failing tests remain tracked in Git.
- **D.** The dataset lacks stratification across difficulty tiers, multi-turn trajectories, tool-error scenarios, and adversarial edge cases.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một bộ dữ liệu đánh giá chuẩn (golden evaluation dataset) bao gồm 500 câu hỏi FAQ phổ biến. Khi một bản cập nhật prompt đạt 98% trên bộ dữ liệu này, nó vẫn làm hỏng các trường hợp biên sử dụng tool nhiều lượt và các đầu vào đối kháng (adversarial inputs) trên production. Bộ đánh giá đang gặp vấn đề gì?

**Đáp án đúng:** **D**

Golden dataset chất lượng phải được phân tầng (stratified) theo loại tác vụ, độ khó, kịch bản multi-turn, lỗi tool và liên tục bổ sung các ca lỗi thực tế từ production (error-to-eval flywheel).

- **A:** Chạy eval với `temperature: 0.0` là tốt để tăng tính ổn định; vấn đề nằm ở độ phủ kịch bản của dataset.
- **B:** Thu nhỏ tập dữ liệu càng làm giảm độ phủ các kịch bản phức tạp.
- **C:** Xóa các test đang pass sẽ làm mất khả năng phát hiện regression ở các tính năng cũ.
- **D (Đúng):** Tập golden dataset chỉ toàn câu hỏi FAQ đơn giản nên không đại diện cho production; cần phân tầng (stratification) bao gồm multi-turn, lỗi tool và edge cases.

</details>

### Câu 2 `medium`

A team maintains a 200-sample golden dataset built from happy-path queries written by engineers six months ago. Although the CI suite reports a 98% pass rate, production users frequently complain about failures on multi-turn ambiguity, malformed inputs, and out-of-scope requests. How should the golden dataset strategy be upgraded?

- **A.** Duplicate the existing 200 happy-path examples five times to reach 1,000 samples and raise the CI pass threshold to 99.5%.
- **B.** Curate stratified samples from production failure logs—covering adversarial, multi-turn, and abstention cases—with a held-out split.
- **C.** Ask Claude to synthetically generate 500 slightly reworded variations of the original happy-path prompts and paste all of them directly into the system prompt as few-shot reference examples.
- **D.** Remove all multi-turn and out-of-scope test cases from evaluation because non-deterministic conversations cannot be scored reliably.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm duy trì một bộ dữ liệu chuẩn (golden dataset) gồm 200 mẫu được xây dựng từ các truy vấn luồng thuận (happy-path) do kỹ sư viết sáu tháng trước. Mặc dù bộ kiểm thử CI báo cáo tỷ lệ đạt 98%, người dùng production vẫn thường xuyên phàn nàn về lỗi trên các câu hỏi mơ hồ nhiều lượt, đầu vào sai định dạng và các yêu cầu ngoài phạm vi. Chiến lược bộ dữ liệu chuẩn nên được nâng cấp như thế nào?

**Đáp án đúng:** **B**

Golden Dataset chất lượng cao phải phản ánh phân phối thực tế của production (stratified sampling từ production failures, edge cases, abstention cases) và luôn tách biệt tập test held-out khỏi quá trình tối ưu prompt.

- **A:** Nhân bản các ví dụ happy-path cũ không bổ sung thêm bất kỳ độ phủ nào cho các tình huống lỗi thực tế ngoài production.
- **B (Đúng):** Xây dựng golden dataset sống (living dataset) bằng stratified sampling từ lỗi thực tế production (bao gồm adversarial, multi-turn phức tạp, và trường hợp cần từ chối/abstention), đồng thời tách riêng tập held-out để tránh overfitting khi tinh chỉnh prompt là thực hành chuẩn.
- **C:** Đưa toàn bộ tập eval vào làm few-shot examples trong system prompt gây rò rỉ dữ liệu (data contamination), khiến điểm eval cao giả tạo mà thực tế không cải thiện.
- **D:** Loại bỏ các ca khó ra khỏi bộ eval chỉ là che giấu vấn đề, khiến hệ thống tiếp tục thất bại trước người dùng thật.

</details>

---

[Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md)
