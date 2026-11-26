# Bài tập tình huống — Chủ đề 8: CI/CD Regression Gates, Shadow Deployments & Bias Mitigation

> Tích hợp Eval Gates chặn deploy khi chất lượng giảm, chống Position/Verbosity Bias trong pairwise evals và vận hành Shadow/Canary Deployments.
> **Số câu hỏi:** 11 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A team uses an LLM-as-a-Judge to compare Candidate Prompt B against Baseline Prompt A in pairwise evaluations. During testing, they notice that whichever response is placed first in the judge's prompt wins 68% of the time, even when comparing two identical outputs. How should they eliminate this bias?

- **A.** Always place Baseline Prompt A in the second slot so that Candidate B receives a consistent structural advantage.
- **B.** Truncate both candidate responses to their first 20 words before passing them into the pairwise LLM judge prompt.
- **C.** Increase the judge's `temperature` to 1.0 so it selects pairwise winners randomly without consistently favoring the first candidate slot.
- **D.** Run each pair twice with swapped positions (A-then-B and B-then-A) and average or require consistency across both orderings.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm sử dụng LLM-as-a-Judge để so sánh Candidate Prompt B với Baseline Prompt A trong các đánh giá theo cặp (pairwise evaluations). Trong quá trình kiểm thử, họ nhận thấy bất kỳ phản hồi nào được đặt ở vị trí đầu tiên trong prompt của judge đều thắng 68% số lần, ngay cả khi so sánh hai đầu ra giống hệt nhau. Họ nên loại bỏ thiên kiến (bias) này như thế nào?

**Đáp án đúng:** **D**

Position bias (ưu ái phương án đứng đầu hoặc đứng cuối) là lỗi kinh điển của pairwise LLM-as-a-Judge. Phương pháp chuẩn để khắc phục là bidirectional evaluation (hoán đổi vị trí A/B).

- **A:** Cố định vị trí không loại bỏ thiên kiến mà chỉ làm lệch kết quả đánh giá theo hướng có lợi cho B.
- **B:** Cắt cụt câu trả lời làm mất nội dung cần đánh giá mà không xử lý được position bias.
- **C:** Tăng temperature làm giảm độ tin cậy và tính lặp lại của bộ chấm điểm.
- **D (Đúng):** Đánh giá hai lượt với vị trí hoán đổi (position swapping: A-B và B-A) và chỉ tính thắng nếu nhất quán ở cả hai lượt giúp triệt tiêu position bias của LLM-as-a-Judge.

</details>

### Câu 2 `medium`

A CI/CD evaluation pipeline validates a SQL-generation agent against a golden dataset of 300 queries. Currently, the pipeline uses an LLM-as-a-Judge to grade whether the generated SQL looks correct, which is slow, expensive, and occasionally marks syntax errors as valid. What is the better grading strategy?

- **A.** Replace the judge with a larger frontier model at `temperature: 0.7` to improve its intuition about PostgreSQL syntax.
- **B.** Use deterministic graders: parse SQL AST/syntax, execute the query against a seeded test database, and assert exact result-set equality.
- **C.** Grade generated SQL queries solely by checking whether their character length matches the golden SQL query within 10 characters of variance.
- **D.** Reduce the golden evaluation dataset from 300 queries down to 5 queries so the LLM judge finishes within 10 seconds.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một pipeline đánh giá CI/CD xác thực một agent sinh câu lệnh SQL dựa trên một bộ dữ liệu chuẩn (golden dataset) gồm 300 truy vấn. Hiện tại, pipeline dùng LLM-as-a-Judge để chấm xem SQL được sinh ra có vẻ đúng không, việc này chậm, tốn kém và thỉnh thoảng chấm các lỗi cú pháp là hợp lệ. Chiến lược chấm điểm nào tốt hơn?

**Đáp án đúng:** **B**

Nguyên tắc thiết kế Eval: luôn ưu tiên Deterministic Graders (unit test, JSON schema, AST, DB execution) trước khi dùng LLM-as-a-Judge; chỉ dùng LLM-as-a-Judge cho các tiêu chí định tính không thể viết rule.

- **A:** Dùng model lớn hơn với temperature cao vẫn chậm, tốn kém và không chính xác bằng việc chạy thử SQL thực tế.
- **B (Đúng):** Với các tác vụ có đầu ra kiểm chứng được như SQL/code, deterministic graders (kiểm tra AST, chạy thử trên DB mẫu và so sánh tập kết quả) nhanh hơn, rẻ hơn và chính xác 100%.
- **C:** Độ dài chuỗi không phản ánh tính đúng đắn về mặt logic hay cú pháp của câu lệnh SQL.
- **D:** Giảm tập test xuống 5 mẫu làm mất độ phủ kiểm thử và không thể phát hiện hồi quy.

</details>

### Câu 3 `hard`

An engineering team observes that their LLM-as-a-Judge consistently awards higher scores to verbose, padded 500-word answers over concise, accurate 80-word answers. How should they mitigate this verbosity bias and align the judge with human preferences?

- **A.** Instruct the judge rubric to award bonus points for every markdown bullet point and introductory paragraph included in the response.
- **B.** Use the exact same model snapshot and system prompt that generated the candidate response as the evaluator without a rubric.
- **C.** Use a decomposed rubric scoring accuracy and conciseness separately, include length-balanced calibration examples, and measure agreement (Cohen's kappa) with human labels.
- **D.** Randomly drop 50% of the sentences from every candidate response before passing the truncated text to the LLM judge.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ thuật quan sát thấy LLM-as-a-Judge của họ liên tục chấm điểm cao hơn cho các câu trả lời dài dòng 500 từ so với các câu trả lời súc tích, chính xác 80 từ. Họ nên giảm thiểu thiên kiến ưa chuộng độ dài (verbosity bias) này và căn chỉnh bộ chấm điểm với sở thích của con người như thế nào?

**Đáp án đúng:** **C**

Để kiểm soát verbosity bias và đảm bảo LLM-as-a-Judge đáng tin cậy, cần thiết kế rubric phân rã (decomposed rubric) kèm few-shot calibration examples và kiểm định thường xuyên bằng human alignment (Cohen's kappa).

- **A:** Thưởng điểm cho độ dài và bullet point chỉ làm verbosity bias trầm trọng hơn.
- **B:** Dùng cùng mô hình không có rubric làm tăng cả self-enhancement bias lẫn verbosity bias.
- **C (Đúng):** Tách tiêu chí chấm điểm rõ ràng (độ chính xác, tính súc tích), đưa vào bộ ví dụ hiệu chuẩn cân bằng độ dài và đo độ đồng thuận (Cohen's kappa) với chuyên gia giúp triệt tiêu verbosity bias.
- **D:** Xóa ngẫu nhiên câu làm hỏng tính mạch lạc và nội dung chính xác của câu trả lời.

</details>

### Câu 4 `hard`

Before promoting a major change to an agent's RAG retrieval and prompt pipeline, the team wants to test it on live production traffic without affecting any real users' responses. Which deployment pattern achieves this?

- **A.** Run a shadow deployment that asynchronously mirrors a sample of live requests to the candidate pipeline and logs evals offline without returning its output to users.
- **B.** Route 50% of paying enterprise customers directly to the untested candidate RAG pipeline via an immediate production A/B test.
- **C.** Deploy the candidate pipeline to production at midnight and wait for customer support tickets to report any quality regressions.
- **D.** Test only on 10 synthetic 'hello world' prompts written by the developer on a local laptop before pushing to production.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trước khi đưa một thay đổi lớn đối với pipeline truy xuất RAG và prompt của một agent lên chính thức, nhóm muốn kiểm thử nó trên lưu lượng production thực tế mà không ảnh hưởng đến phản hồi của bất kỳ người dùng thực nào. Mẫu triển khai (deployment pattern) nào đạt được điều này?

**Đáp án đúng:** **A**

Shadow deployment (dark launch) cho phép kiểm chứng chất lượng, độ trễ và chi phí của pipeline AI mới trên phân bố traffic thật mà không mang lại rủi ro nào cho người dùng cuối.

- **A (Đúng):** Shadow deployment sao chép bất đồng bộ một phần traffic thực tế sang pipeline mới để chấm điểm/so sánh offline mà hoàn toàn không ảnh hưởng đến phản hồi trả về cho người dùng.
- **B:** Đẩy 50% khách hàng thật sang pipeline chưa kiểm chứng gây rủi ro lớn nếu pipeline mới gặp lỗi hoặc hallucination.
- **C:** Chờ phản hồi khiếu nại từ khách hàng là cách phản ứng bị động và gây thiệt hại trải nghiệm.
- **D:** 10 mẫu tự viết không phản ánh phân bố dữ liệu và edge cases thực tế của production.

</details>

### Câu 5 `medium`

A pull request modifies a customer-facing agent's system prompt. The team wants an automated CI/CD release gate before merging. Which gate configuration prevents silent quality regressions while keeping PR feedback fast?

- **A.** Require manual sign-off from five engineering executives on every prompt pull request instead of running automated evaluations.
- **B.** Block pull request merges only if the raw system prompt file size increases by more than 10 kilobytes compared to `main`.
- **C.** Run a fast smoke-eval suite on every PR blocking merges on schema/safety/accuracy regressions, plus a full nightly eval suite.
- **D.** Run quantitative evaluations only once per quarter after deploying all accumulated prompt changes directly to production.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một pull request sửa đổi system prompt của một agent phục vụ khách hàng. Nhóm muốn có một cổng phát hành CI/CD tự động trước khi merge. Cấu hình cổng nào ngăn chặn sự suy giảm chất lượng âm thầm trong khi vẫn giữ phản hồi PR nhanh chóng?

**Đáp án đúng:** **C**

Chiến lược CI/CD Eval hiệu quả chia làm hai tầng: PR-level smoke/regression gate (nhanh, chặn lỗi schema/safety/critical accuracy) và nightly full benchmark.

- **A:** Phê duyệt thủ công chậm chạp và không đo lường được hồi quy định lượng trên hàng trăm test case.
- **B:** Kích thước file prompt không phản ánh chất lượng hay tính an toàn của hành vi mô hình.
- **C (Đúng):** Kết hợp fast smoke-eval gate trên từng PR (chặn merge nếu vi phạm ngưỡng schema, an toàn, hoặc độ chính xác cốt lõi) và full suite chạy ban đêm tối ưu cả tốc độ CI lẫn độ phủ.
- **D:** Đánh giá theo quý sau khi đã deploy khiến lỗi tồn tại hàng tháng trên production.

</details>

### Câu 6 `hard`

When evaluating a multi-step tool-using agent (not just a single-turn Q&A bot), which THREE dimensions should the evaluation harness measure?

*(Chọn 3 đáp án)*

- **A.** Final outcome correctness (whether the end state or answer matches the expected ground truth).
- **B.** Trajectory efficiency and tool-call validity (argument schema adherence, step count, and avoiding redundant loops).
- **C.** Safety and policy compliance (never invoking unauthorized tools or leaking restricted data along the trajectory).
- **D.** The alphabetical order of JSON keys returned by the Anthropic API.
- **E.** The number of emojis used in intermediate chain-of-thought reasoning blocks.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Khi đánh giá một agent sử dụng tool nhiều bước (không chỉ là một bot hỏi đáp một lượt), BA khía cạnh nào hệ thống đánh giá (evaluation harness) cần đo lường?

**Đáp án đúng:** **A, B, C**

Đánh giá agent đa bước phải kiểm tra cả 3 khía cạnh: Kết quả cuối (Outcome), Quỹ đạo thực thi (Trajectory & tool validity), và Tuân thủ an toàn (Safety/Policy compliance).

- **A (Đúng):** Đánh giá kết quả cuối cùng (outcome correctness) xác nhận agent có hoàn thành đúng mục tiêu bài toán hay không.
- **B (Đúng):** Đánh giá quỹ đạo thực thi (trajectory) kiểm tra agent có gọi đúng tool, đúng tham số và đạt hiệu quả số bước hay không.
- **C (Đúng):** Kiểm tra tuân thủ chính sách xuyên suốt quỹ đạo đảm bảo agent không vi phạm ranh giới an toàn dù kết quả cuối có vẻ đúng.
- **D:** Thứ tự key trong JSON không mang ý nghĩa đánh giá chất lượng agent.
- **E:** Số lượng emoji hoàn toàn không liên quan đến hiệu năng hay độ chính xác của agent.

</details>

### Câu 7 `medium`

To ensure an LLM-as-a-Judge pipeline produces trustworthy, reproducible scores in CI/CD, which TWO practices should be implemented?

*(Chọn 2 đáp án)*

- **A.** Pin the judge model snapshot, set `temperature: 0.0`, and require structured JSON output with reasoning before the numeric score.
- **B.** Periodically validate judge scores against a human-annotated calibration set using correlation or agreement metrics.
- **C.** Change the judge's scoring scale from 1-5 to 1-1000 without providing anchor definitions for each level.
- **D.** Allow the judge to see the git author name of the PR so it trusts senior engineers more.
- **E.** Skip all deterministic checks whenever an LLM-as-a-Judge is configured in the pipeline.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Để đảm bảo một pipeline LLM-as-a-Judge tạo ra điểm số đáng tin cậy và có thể tái lập trong CI/CD, HAI thực hành nào nên được triển khai?

**Đáp án đúng:** **A, B**

LLM-as-a-Judge đáng tin cậy cần: `temperature: 0`, model snapshot cố định, reasoning-before-score, thang điểm rõ ràng (như 1-5 có rubric anchor) và hiệu chuẩn định kỳ với con người.

- **A (Đúng):** Cố định phiên bản model judge, đặt `temperature: 0.0` và yêu cầu sinh lập luận (reasoning) trước khi chốt điểm số giúp tăng tính nhất quán và độ chính xác.
- **B (Đúng):** Đối chiếu định kỳ với tập dữ liệu do chuyên gia chấm (human calibration set) đảm bảo judge không bị trôi lệch so với tiêu chuẩn thực tế.
- **C:** Thang điểm 1-1000 không có định nghĩa mốc (anchors) khiến LLM chấm điểm rất dao động và vô nghĩa.
- **D:** Đưa thông tin tác giả PR vào tạo ra thiên kiến không liên quan đến chất lượng kỹ thuật.
- **E:** Không bao giờ được bỏ qua các bộ kiểm tra deterministic nhanh và chính xác hơn.

</details>

### Câu 8 `hard`

An engineering team is building an automated CI/CD evaluation suite for a SQL-generating analytics agent. Running a full LLM-as-a-Judge across 1,000 test cases on every pull request is too slow and costly, while relying solely on exact string matching fails when valid SQL queries use different table aliases. Which evaluation pipeline design is optimal?

- **A.** Use exact string matching on the generated SQL text as the sole CI gate and run manual human reviews once a quarter.
- **B.** Replace all deterministic unit tests with a single LLM-as-a-Judge prompt that inspects the raw SQL string and estimates whether the query would execute cleanly against production schemas.
- **C.** Set `temperature: 0.0` in CI and assert that the generated token sequence matches a hardcoded snapshot byte-for-byte.
- **D.** Combine fast deterministic graders (SQL AST parsing and sandbox execution equivalence) with rubric-based LLM-as-a-Judge checks.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ thuật đang xây dựng một bộ đánh giá CI/CD tự động cho một agent phân tích sinh câu lệnh SQL. Việc chạy LLM-as-a-Judge đầy đủ trên 1.000 test case cho mỗi pull request quá chậm và tốn kém, trong khi chỉ dựa vào khớp chuỗi chính xác (exact string matching) lại thất bại khi các truy vấn SQL hợp lệ sử dụng bí danh bảng khác nhau. Thiết kế pipeline đánh giá nào là tối ưu?

**Đáp án đúng:** **D**

Nguyên tắc vàng trong Evaluation Engineering là ưu tiên Deterministic Graders (code/AST/execution equivalence) cho mọi thứ có thể kiểm chứng khách quan, và chỉ dùng LLM-as-a-Judge cho các tiêu chí ngữ nghĩa mở.

- **A:** Exact string match loại bỏ nhầm nhiều câu SQL đúng ngữ nghĩa nhưng khác alias hoặc format, còn review thủ công theo quý không ngăn được regression khi merge PR.
- **B:** Để LLM tự đoán SQL có chạy được hay không rất dễ sai sót về tên cột, cú pháp hoặc logic thực thi thực tế.
- **C:** Ngay cả với `temperature: 0.0`, cập nhật nhỏ ở prompt hay model snapshot vẫn có thể đổi cách viết câu SQL hợp lệ, khiến snapshot test cực kỳ giòn (brittle).
- **D (Đúng):** Kết hợp deterministic graders (kiểm tra cú pháp AST, thực thi trên sandbox DB và so sánh result-set) chạy nhanh, rẻ, chính xác tuyệt đối với LLM-as-a-Judge chấm theo rubric cho phần giải thích ngữ nghĩa là kiến trúc evaluation chuẩn trong CI/CD.

</details>

### Câu 9 `hard`

While running pairwise LLM-as-a-Judge evaluations to compare two system prompt variants, engineers notice that the judge selects whichever response is placed in Slot A 68% of the time and consistently favors longer, padded answers over concise, accurate ones. Which pair of techniques directly mitigates these biases?

- **A.** Use bidirectional position swapping (A-vs-B and B-vs-A) alongside an explicit rubric penalizing unnecessary verbosity.
- **B.** Always place the new candidate prompt in Slot A and increase the judge model's `temperature` to 1.0 to randomize its preferences.
- **C.** Truncate both candidate outputs at 50 words before passing them to the judge so neither response can exhibit verbosity bias.
- **D.** Use the exact same model and system prompt being evaluated as the pairwise judge without providing any scoring rubric, reference answer, or length normalization criteria.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Khi chạy các đánh giá LLM-as-a-Judge theo cặp để so sánh hai biến thể system prompt, các kỹ sư nhận thấy bộ chấm điểm chọn bất kỳ phản hồi nào được đặt ở Vị trí A tới 68% số lần và liên tục ưu tiên các câu trả lời dài dòng, độn chữ hơn là các câu trả lời súc tích, chính xác. Cặp kỹ thuật nào giảm thiểu trực tiếp các thiên kiến này?

**Đáp án đúng:** **A**

Pairwise LLM-as-a-Judge thường mắc Position Bias và Verbosity Bias. Biện pháp chuẩn là Position Swapping (đánh giá cả hai thứ tự và chỉ tính thắng khi nhất quán) kết hợp Rubric tường minh (reference-guided và kiểm soát độ súc tích).

- **A (Đúng):** Đảo vị trí hai chiều (A-vs-B và B-vs-A) triệt tiêu Position Bias, còn thiết kế rubric chấm điểm rõ ràng có tiêu chí phạt sự dài dòng dư thừa (hoặc tách tiêu chí tính chính xác khỏi độ dài) giúp giảm thiểu Verbosity Bias.
- **B:** Luôn đặt ứng viên mới ở Slot A sẽ khuếch đại position bias thành kết quả ảo, còn tăng temperature làm giảm độ tin cậy (consistency) của judge.
- **C:** Cắt cụt câu trả lời ở 50 từ sẽ làm mất nội dung quan trọng ở phần sau, khiến judge không thể đánh giá đúng tính đầy đủ và chính xác.
- **D:** Không có rubric hay reference answer và dùng chính model đang test làm judge không giải quyết được position/verbosity bias mà còn gây thêm self-enhancement bias.

</details>

### Câu 10 `hard`

An organization plans to migrate its production legal-review pipeline from an older Claude model snapshot to a newer Claude release. Offline benchmark scores look promising, but the team wants to verify real-world latency, tool-calling behavior, and output formatting on live production traffic without risking customer impact. Which rollout strategy should they use?

- **A.** Perform a big-bang cutover of 100% of production legal-review traffic during peak business hours and monitor incoming customer support tickets for schema or citation regressions.
- **B.** Switch only the `model` string in staging and run 10 manual smoke tests before deploying globally to all production tenants.
- **C.** Run the candidate model in shadow mode on mirrored live traffic, score against baseline, and then execute a gated canary rollout.
- **D.** Randomly alternate between the old and new model on every turn within the same multi-turn user conversation.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức có kế hoạch di chuyển pipeline rà soát pháp lý trên production từ một bản snapshot mô hình Claude cũ hơn sang bản phát hành Claude mới hơn. Điểm benchmark ngoại tuyến trông đầy hứa hẹn, nhưng nhóm muốn xác minh độ trễ thực tế, hành vi gọi tool và định dạng đầu ra trên lưu lượng production trực tiếp mà không gây rủi ro ảnh hưởng đến khách hàng. Họ nên sử dụng chiến lược triển khai nào?

**Đáp án đúng:** **C**

Shadow Deployment kết hợp Canary Rollout là quy trình an toàn nhất khi nâng cấp model version hoặc thay đổi system prompt lớn trên hệ thống production.

- **A:** Chuyển đổi 100% traffic trực tiếp (big-bang) trên hệ thống legal-review tiềm ẩn rủi ro cao nếu model mới thay đổi định dạng tool call hoặc phong cách trích dẫn.
- **B:** 10 ca smoke test thủ công trên staging không thể bao phủ độ đa dạng và áp lực tải của traffic production thực tế.
- **C (Đúng):** Shadow Deployment (chạy song song bất đồng bộ trên traffic thật nhưng không trả kết quả cho user) cho phép đo đạc chính xác schema compliance, latency, cost và chất lượng đối chiếu với baseline trước khi tiến hành canary rollout từng phần.
- **D:** Đổi model qua lại giữa các lượt trong cùng một hội thoại gây mất nhất quán về giọng văn, định dạng và làm hỏng trải nghiệm người dùng.

</details>

### Câu 11 `hard`

A platform team is establishing automated release gates in CI/CD before deploying prompt or model updates to production. Which TWO practices ensure the release gate is statistically sound and trustworthy? (Select TWO)

*(Chọn 2 đáp án)*

- **A.** Calibrate the LLM-as-a-Judge against human expert annotations using agreement metrics such as Cohen's kappa before trusting it as a blocking CI gate.
- **B.** Evaluate only 5 randomly chosen prompts per PR and allow deployment as long as at least 3 of them pass.
- **C.** Run multiple evaluation trials or paired statistical significance tests across a sufficiently sized golden set, blocking deployment when regression on critical safety or accuracy metrics exceeds defined thresholds.
- **D.** Automatically override any failing CI evaluation gates whenever a developer adds `[skip-eval]` to the pull request title.
- **E.** Use average output word count as the primary release gate metric across all customer support workflows.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm nền tảng đang thiết lập các cổng phát hành tự động (automated release gates) trong CI/CD trước khi triển khai các bản cập nhật prompt hoặc mô hình lên production. HAI thực hành nào đảm bảo cổng phát hành có cơ sở thống kê vững chắc và đáng tin cậy? (Chọn HAI đáp án)

**Đáp án đúng:** **A, C**

Automated Release Gates đáng tin cậy đòi hỏi: (1) Hiệu chuẩn LLM-as-a-Judge với human ground truth (Cohen's kappa), và (2) Đánh giá đủ cỡ mẫu kèm kiểm định thống kê để chặn regression thực sự.

- **A (Đúng):** Kiểm chứng mức độ đồng thuận giữa LLM-as-a-Judge và chuyên gia con người (ví dụ qua Cohen's kappa) đảm bảo bộ chấm điểm tự động thực sự phản ánh tiêu chuẩn chất lượng nghiệp vụ.
- **B:** Mẫu quá nhỏ (5 prompts) không có ý nghĩa thống kê và dễ bỏ lọt các regression nghiêm trọng.
- **C (Đúng):** Chạy đánh giá trên tập golden đủ lớn kết hợp kiểm định ý nghĩa thống kê (tránh nhiễu ngẫu nhiên của LLM) và chặn deploy khi chỉ số an toàn/chính xác suy giảm vượt ngưỡng là cơ chế release gate chuẩn mực.
- **D:** Cho phép bỏ qua release gate tùy tiện qua tiêu đề PR sẽ phá vỡ kỷ luật chất lượng và dễ đưa lỗi lên production.
- **E:** Số từ trung bình không đo lường được tính đúng đắn, an toàn hay khả năng giải quyết vấn đề của agent.

</details>

---

[Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md)
