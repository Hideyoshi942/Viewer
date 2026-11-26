# Bài tập tình huống — Module 15: Model Evals, LLM-as-a-Judge, Regression Testing & Debugging

> Xây dựng Golden Eval Datasets, Code-based Graders vs LLM-as-a-Judge (Rubrics), chỉ số pass@k vs pass^k, Regression Testing trong CI/CD và debug cache_read_input_tokens / latency.
> **Số câu hỏi:** 4 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `easy`

An engineering team is building an evaluation suite for a feature that extracts structured JSON invoices from text. Which type of grader should they use first to verify JSON syntax, required keys, and exact numerical totals?

- **A.** Random sampling of 1% of responses in production without automated assertions
- **B.** Manual human review of 100% of test cases on every pull request
- **C.** An expensive LLM-as-a-Judge (Opus) to inspect the raw string and guess whether the JSON looks valid
- **D.** Deterministic code-based graders (e.g., JSON Schema validation and exact-match assertions)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ thuật đang xây dựng một bộ đánh giá (evaluation suite) cho tính năng trích xuất hóa đơn JSON có cấu trúc từ văn bản. Họ nên sử dụng loại bộ chấm điểm (grader) nào đầu tiên để xác minh cú pháp JSON, các khóa bắt buộc và tổng số chính xác?

**Đáp án đúng:** **D**

Nguyên tắc xây dựng Eval: luôn ưu tiên **Code-based graders** cho các kiểm tra xác định (JSON hợp lệ, regex, exact match, unit test) vì tốc độ nhanh, ổn định và không tốn chi phí LLM.

- **A:** Không có assertion thì không thể đo lường hồi quy (regression).
- **B:** Đánh giá thủ công toàn bộ test case trên mỗi PR không thể mở rộng trong CI/CD.
- **C:** Dùng LLM để kiểm tra cú pháp JSON hay cộng trừ số học vừa chậm, vừa tốn kém, lại kém chính xác hơn code thuần.
- **D (Đúng):** Với các tiêu chí khách quan như cú pháp JSON, trường bắt buộc và phép toán/con số chính xác, code-based grader nhanh, miễn phí và chính xác 100%.

</details>

### Câu 2 `medium`

When using an LLM-as-a-Judge (model-based grader) to evaluate open-ended customer support summaries for tone and completeness, which practice improves grading reliability and reduces bias?

- **A.** Provide an explicit scoring rubric with anchor examples, and require step-by-step reasoning before the final score.
- **B.** Ask the judge for a single number from 1 to 100 with no rubric or explanation.
- **C.** Always place the candidate response from the preferred prompt in Position A during all pairwise LLM judge comparisons.
- **D.** Never calibrate the LLM judge against human expert ratings.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Khi sử dụng LLM-as-a-Judge (bộ chấm điểm dựa trên mô hình) để đánh giá các bản tóm tắt hỗ trợ khách hàng dạng mở về giọng điệu và tính đầy đủ, thực hành nào giúp cải thiện độ tin cậy khi chấm điểm và giảm thiên kiến (bias)?

**Đáp án đúng:** **A**

Model-based eval (LLM-as-a-Judge) đạt hiệu quả cao nhất khi có **rubric cụ thể**, **lý giải trước khi chấm điểm** (reasoning before score), và **kiểm soát position bias** khi so sánh cặp.

- **A (Đúng):** Cung cấp rubric chấm điểm rõ ràng, ví dụ chuẩn (anchor examples) và yêu cầu judge giải thích lập luận trước khi chấm điểm giúp tăng độ nhất quán và giảm thiên lệch.
- **B:** Thang điểm rộng 1-100 không có rubric dễ dẫn đến điểm số dao động ngẫu nhiên và thiếu nhất quán.
- **C:** Luôn đặt ứng viên ưu tiên ở Vị trí A sẽ làm kết quả bị nhiễu bởi position bias; cần hoán đổi vị trí A/B (position swapping).
- **D:** Cần đối chiếu (calibrate) kết quả của LLM judge với đánh giá của chuyên gia để đảm bảo độ tin cậy.

</details>

### Câu 3 `medium`

An engineering team is evaluating a non-deterministic coding agent across multiple trials on each task. What is the difference between `pass@k` and `pass^k` (pass-to-the-k) metrics?

- **A.** `pass@k` is the probability >=1 of `k` attempts succeeds (capability); `pass^k` is the probability all `k` succeed (reliability).
- **B.** `pass^k` is always strictly higher than `pass@k` for every value of `k > 1` on non-deterministic tasks.
- **C.** `pass@k` is only defined for Claude Haiku evaluations and `pass^k` is only defined for Claude Opus multi-step agent evaluations today.
- **D.** Both `pass@k` and `pass^k` measure only input token latency and ignore task completion success.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ thuật đang đánh giá một agent lập trình không tất định qua nhiều lần chạy thử (trials) trên mỗi tác vụ. Sự khác biệt giữa hai chỉ số `pass@k` và `pass^k` (pass-to-the-k) là gì?

**Đáp án đúng:** **A**

Trong đánh giá Agent: dùng **`pass@k`** để kiểm tra xem agent có khả năng giải được bài toán không, và dùng **`pass^k`** khi hệ thống production đòi hỏi agent phải chạy đúng ổn định mọi lần.

- **A (Đúng):** `pass@k` (ít nhất 1 trong `k` lần chạy thành công) đo năng lực tối đa của agent; còn `pass^k` (cả `k` lần chạy đều thành công) đo độ tin cậy và tính nhất quán cho production.
- **B:** Vì `pass^k` yêu cầu TẤT CẢ `k` lần đều đúng, giá trị của nó luôn nhỏ hơn hoặc bằng `pass@k`.
- **C:** Hai chỉ số này áp dụng cho mọi model và agent.
- **D:** Cả hai đều đo tỷ lệ thành công (correctness/reliability), không đo độ trễ.

</details>

### Câu 4 `hard`

After deploying a prompt update, a team wants to catch subtle regressions before merging future prompt or model changes into production. Which evaluation strategy best balances speed, cost, and thoroughness in CI/CD?

- **A.** Replace all unit tests with a single Opus LLM-as-a-Judge call that scores vibes without a structured rubric or anchor examples in CI/CD.
- **B.** Maintain a golden dataset, run fast deterministic assertions on every PR, and run LLM-as-a-Judge evals on major prompt/model upgrades.
- **C.** Test only 2 happy-path examples manually in the developer console before deploying.
- **D.** Wait for end-users to report broken JSON outputs in production.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Sau khi triển khai một bản cập nhật prompt, một nhóm muốn phát hiện sớm các lỗi suy giảm chất lượng tinh vi (subtle regressions) trước khi merge các thay đổi prompt hoặc mô hình trong tương lai vào production. Chiến lược đánh giá nào cân bằng tốt nhất giữa tốc độ, chi phí và tính toàn diện trong CI/CD?

**Đáp án đúng:** **B**

Quy trình Eval chuẩn công nghiệp (Eval-Driven Development) bắt đầu từ **Golden Dataset** phản ánh dữ liệu thật, ưu tiên **Code-based graders** cho kiểm tra nhanh trong CI và dùng **LLM-as-a-Judge có rubric** cho các tiêu chí định tính.

- **A:** Chấm điểm cảm tính không có rubric và bỏ qua code-based check vừa đắt vừa thiếu tin cậy.
- **B (Đúng):** Kết hợp bộ **Golden Dataset** (gồm ca thực tế và bug cũ) với **Code-based evals** chạy nhanh trên mỗi PR và **Model-based evals** cho các thay đổi lớn tạo ra quy trình kiểm thử hồi quy bền vững.
- **C:** Thử tay 2 ca đơn giản không thể phát hiện hồi quy ở các ca biên.
- **D:** Để khách hàng tự phát hiện lỗi trên production gây ảnh hưởng trực tiếp tới uy tín và vận hành.

</details>

---

[Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md)
