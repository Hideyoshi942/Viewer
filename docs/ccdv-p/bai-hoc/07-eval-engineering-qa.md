# Domain 4: Evaluation Engineering, CI/CD Regression Gates & Quality Assurance

Domain 4 chiếm **12% tỷ trọng đề thi CCDV-P**. Với phần mềm truyền thống, unit test cho kết quả Pass/Fail tất định. Với hệ thống Claude, một thay đổi nhỏ ở system prompt, chunk size hay nâng cấp model snapshot có thể âm thầm làm giảm chất lượng ở một nhóm kịch bản hẹp. Evaluation Engineering (EvalOps) biến việc đánh giá chất lượng thành quy trình kỹ thuật đo lường được và tự động hóa trong CI/CD.

## 1. Xây dựng Golden Datasets chất lượng cao

Một bộ Golden Dataset tốt không chỉ gồm vài ví dụ "happy path" do developer tự nghĩ ra:

- **Nguồn dữ liệu thực tế (Production-derived)**: Lấy mẫu phân tầng (stratified sampling) từ traffic production thực tế đã được ẩn danh, bao phủ đủ các intent, ngôn ngữ và độ dài input.
- **Phân loại 3 nhóm bắt buộc**:
  1. **Core / Happy Path**: Các tác vụ phổ biến nhất chiếm 70–80% traffic.
  2. **Edge Cases & Ambiguity**: Input thiếu thông tin, dữ liệu rỗng, câu hỏi đa nghĩa (kiểm tra khả năng hỏi lại hoặc abstention).
  3. **Adversarial & Regression Cases**: Các ca từng gây lỗi nghiêm trọng trong production (bug cũ) và các mẫu Prompt Injection để đảm bảo không tái diễn.
- **Version Control**: Dataset và rubric chấm điểm phải được version hóa (Git/DVC) gắn với từng phiên bản prompt.

## 2. Deterministic Graders vs. LLM-as-a-Judge

Nguyên tắc vàng: **Luôn ưu tiên Deterministic Grader trước; chỉ dùng LLM-as-a-Judge cho các tiêu chí ngữ nghĩa không thể kiểm tra bằng code.**

| Loại Grader | Cơ chế | Ưu điểm | Nhược điểm | Ví dụ áp dụng |
| :--- | :--- | :--- | :--- | :--- |
| **Deterministic (Code-based)** | JSON Schema validation, Regex, AST parse, Unit test execution, Exact/Fuzzy match | Nhanh, miễn phí, ổn định 100% (0% variance) | Không đánh giá được giọng văn, tính mạch lạc, độ chính xác ngữ nghĩa | Kiểm tra tool call đúng tên & tham số; code sinh ra pass `pytest`; citation ID hợp lệ |
| **LLM-as-a-Judge** | Dùng một model mạnh (như Claude Opus/Sonnet) chấm điểm theo Rubric 1–5 hoặc Binary Pass/Fail | Đánh giá được sắc thái, faithfulness, relevance, tone | Tốn chi phí, có độ trễ, dễ mắc thiên kiến (bias) nếu thiết kế kém | Kiểm tra câu trả lời có trung thực với tài liệu RAG không (Faithfulness) |

## 3. Giảm thiểu Thiên kiến (Bias Mitigation) trong LLM-as-a-Judge

Khi dùng LLM chấm điểm (đặc biệt trong **Pairwise Comparison** so sánh Prompt A vs Prompt B), model chấm điểm thường mắc 3 loại bias kinh điển:

1. **Position Bias**: Có xu hướng ưu ái phương án đứng đầu (Option A) hoặc đứng cuối (Option B).
   - *Cách khắc phục*: **Position Swapping (Bidirectional Evaluation)** — chạy đánh giá 2 lần với thứ tự `(A, B)` và `(B, A)`. Chỉ tính thắng nếu nhất quán cả hai chiều; nếu lật kèo → ghi nhận `Tie` (Hòa).
2. **Verbosity Bias**: Có xu hướng chấm điểm cao hơn cho câu trả lời dài dòng dù nội dung rỗng tuếch.
   - *Cách khắc phục*: Quy định rõ trong rubric phạt sự dư thừa, hoặc chuẩn hóa độ dài/chấm theo danh sách tiêu chí nguyên tử (atomic checklist).
3. **Self-Enhancement Bias**: Một model có xu hướng chấm điểm cao hơn cho văn phong do chính dòng model của nó sinh ra.
   - *Cách khắc phục*: Hiệu chuẩn (calibrate) Judge bằng tập mẫu do con người gán nhãn (Human-annotated calibration set) để đo **Cohen's Kappa** hoặc **Spearman correlation** giữa Judge và chuyên gia người thật.

### Thiết kế Rubric chuẩn cho LLM-as-a-Judge
- Yêu cầu Judge **suy luận trước khi chấm điểm** (Chain-of-Thought reasoning field trước field `score` trong JSON output).
- Dùng thang điểm rời rạc hẹp (`1-3` hoặc `Pass/Fail` theo từng tiêu chí nhỏ) thay vì thang `1-100` mơ hồ.

```python
import json
import anthropic

JUDGE_SYSTEM = """You are a strict QA evaluator. Evaluate whether the assistant's answer
is strictly grounded in the provided context without hallucinating facts.
Output valid JSON only with keys: "reasoning" (string) and "verdict" ("PASS" or "FAIL")."""

def evaluate_pairwise_with_swap(client: anthropic.Anthropic, question: str, ans_a: str, ans_b: str) -> str:
    def judge_once(first: str, second: str) -> str:
        prompt = f"Question: {question}\n\nResponse 1:\n{first}\n\nResponse 2:\n{second}\n\nWhich is better? Reply JSON: {{\"reasoning\": \"...\", \"winner\": \"1\"|\"2\"|\"TIE\"}}"
        resp = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=512,
            temperature=0.0,
            messages=[{"role": "user", "content": prompt}],
        )
        return json.loads(resp.content[0].text)["winner"]

    run1 = judge_once(ans_a, ans_b)  # 1=A, 2=B
    run2 = judge_once(ans_b, ans_a)  # 1=B, 2=A

    if run1 == "1" and run2 == "2":
        return "A"
    if run1 == "2" and run2 == "1":
        return "B"
    return "TIE"
```

## 4. CI/CD Regression Gates & Shadow Deployments

### 4.1 Automated Release Gates trong CI/CD
Mỗi Pull Request sửa system prompt, tool definition hoặc model version phải tự động kích hoạt Eval Suite:
- **Fast Gate (trên mỗi PR)**: Chạy 100% Deterministic Graders + tập mẫu nhỏ (~50 câu quan trọng nhất) dùng **Message Batches API** để tiết kiệm 50% chi phí. Block merge nếu tỷ lệ pass giảm quá ngưỡng (ví dụ `faithfulness < 95%` hoặc `schema_valid < 100%`).
- **Full Regression Gate (Nightly / Pre-release)**: Chạy toàn bộ Golden Dataset hàng nghìn mẫu kèm LLM-as-a-Judge.

### 4.2 Shadow Deployment & Canary Rollout
- **Shadow Deployment (Dark Launch)**: Nhân bản traffic production thực tế gửi song song sang phiên bản mới (Candidate) ở chế độ bất đồng bộ. Người dùng vẫn nhận kết quả từ bản cũ (Baseline), còn kết quả bản mới được ghi lại để chấm điểm, đo latency và chi phí mà **không ảnh hưởng trải nghiệm người dùng**.
- **Canary Rollout**: Sau khi Shadow đạt chuẩn, mở dần traffic thực 1% → 5% → 25% → 100% kèm auto-rollback nếu metric lỗi hoặc latency vượt ngưỡng.

> [!TIP]
> **Exam Tip (CCDV-P):**
> 1. Khi LLM-as-a-Judge cho kết quả không nhất quán phụ thuộc vào thứ tự đặt câu trả lời → **Position Bias**, khắc phục bằng **Swap thứ tự (Bidirectional pairwise eval)**.
> 2. Làm sao kiểm chứng một prompt/model mới trên traffic production thực tế mà không gây rủi ro cho người dùng cuối? → **Shadow Deployment (Dark Launch)**.
> 3. Cần đánh giá xem JSON output có đúng schema và tool call có hợp lệ không → Dùng **Deterministic Grader**, KHÔNG dùng LLM-as-a-Judge (tốn kém và không cần thiết).

---

[← Bài trước](06-prod-telemetry.md) | [Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/07-eval-qa.md) | [Bài tiếp →](08-cicd-eval-gates.md)
