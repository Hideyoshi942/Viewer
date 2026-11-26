# Chủ đề 8: CI/CD Regression Gates, Shadow Deployments & Bias Mitigation

Xây dựng được Golden Dataset và bộ chấm điểm (Chủ đề 7) mới là điều kiện cần. Để bảo vệ production khỏi các bản cập nhật prompt, tool schema hoặc model snapshot gây suy giảm chất lượng ngầm, **Chủ đề 8 (Domain 4 - 12%)** tập trung vào cách tự động hóa **Eval Gates trong CI/CD**, loại bỏ thiên kiến của **LLM-as-a-Judge**, và kiểm chứng an toàn bằng **Shadow/Canary Deployments**.

## 1. Bias Mitigation trong Pairwise & Rubric LLM-as-a-Judge

Khi dùng LLM chấm điểm chất lượng giữa phiên bản cũ (Baseline A) và phiên bản mới (Candidate B), bộ chấm điểm rất dễ bị nhiễu bởi 3 loại thiên kiến hệ thống:

| Loại Thiên kiến | Biểu hiện thực tế | Kỹ thuật khắc phục chuẩn |
| :--- | :--- | :--- |
| **Position Bias** | Judge luôn có xu hướng chọn phương án đứng đầu (`Response 1`) hoặc đứng cuối (`Response 2`) khi hai câu trả lời ngang ngửa nhau | **Position Swapping (Bidirectional Eval)**: Chạy 2 lần với thứ tự `(A, B)` và `(B, A)`. Chỉ tính thắng nếu nhất quán cả 2 chiều; nếu lật kèo → ghi nhận `Tie`. |
| **Verbosity Bias** | Judge chấm điểm cao hơn cho câu trả lời dài dòng, nhiều bullet point dù nội dung thừa thãi hoặc không chính xác hơn | Quy định rõ trong Rubric phạt sự dài dòng vô ích; chấm theo **Atomic Checklist** (từng ý đúng/sai tách biệt) thay vì chấm cảm tính tổng thể. |
| **Self-Enhancement Bias** | Model có xu hướng ưu ái văn phong do chính dòng model của nó sinh ra | Hiệu chuẩn (calibrate) Judge trên tập mẫu do chuyên gia người thật gán nhãn để đo độ đồng thuận (**Cohen's Kappa ≥ 0.75**), hoặc dùng Judge độc lập. |

## 2. CI/CD Regression Gates (Two-Tier Evaluation Pipeline)

Không thể chạy 5,000 câu eval với LLM-as-a-Judge đồng bộ trên từng commit vì quá chậm và tốn kém. Pipeline chuẩn chia làm 2 tầng:

1. **PR Fast Gate (Chạy trên mỗi Pull Request sửa prompt/code)**:
   - Chạy **100% Deterministic Graders** (JSON Schema, Regex, Tool-call validation, Unit tests) — mất < 30 giây.
   - Chạy tập **Core Smoke Eval** (~50–100 ca quan trọng + adversarial cases).
   - **Điều kiện Block Merge**: Nếu `schema_validity < 100%` hoặc `core_pass_rate` giảm quá ngưỡng cho phép (ví dụ tụt > 2% so với `main`), CI tự động fail PR.
2. **Nightly / Pre-Release Full Gate**:
   - Chạy toàn bộ **Golden Dataset** (hàng nghìn mẫu) bằng **Message Batches API** để tiết kiệm **50% chi phí** mà vẫn hoàn tất trước khi release.

## 3. Shadow Deployments & Canary Rollout

Dù Golden Dataset tốt đến đâu, nó vẫn không thể phủ hết 100% biến thể ngữ cảnh thực tế của người dùng production.

### 3.1 Shadow Deployment (Dark Launch)
- **Cơ chế**: API Gateway / Orchestrator trả kết quả từ phiên bản **Baseline (v1)** cho người dùng như bình thường. Đồng thời, nhân bản request (hoặc sampling 5–10% traffic) gửi **bất đồng bộ (fire-and-forget)** sang phiên bản **Candidate (v2)**.
- **Giá trị**: Đo lường được thực tế độ trễ (`TTFT`, `TPOT`), tỷ lệ lỗi parse JSON, chi phí token và điểm LLM-as-a-Judge trên dữ liệu thật **mà không gây bất kỳ rủi ro nào cho người dùng cuối**.
- *Lưu ý quan trọng*: Với agent có tool ghi dữ liệu (mutating tools), Shadow traffic **phải chạy ở chế độ mock/dry-run** cho các tool ghi để tránh tạo đơn hàng hoặc gửi email trùng lặp!

### 3.2 Canary Rollout & Auto-Rollback
Sau khi v2 vượt qua Shadow Deployment:
1. Mở traffic thực theo từng nấc: **1% → 5% → 25% → 100%** (sticky routing theo `session_id` hoặc `user_id` để tránh một người dùng bị nhảy qua lại giữa 2 phiên bản).
2. Gắn **Automated Rollback Trigger**: Nếu trong cửa sổ 15 phút, tỷ lệ `5xx`, `stop_reason: max_tokens`, hoặc tỷ lệ người dùng nhấn "Thumbs Down" vượt ngưỡng SLA → tự động trả 100% traffic về v1.

```yaml
# Ví dụ GitHub Actions PR Eval Gate
name: Claude Prompt Regression Gate
on:
  pull_request:
    paths: ["prompts/**", "tools/**", "agents/**"]
jobs:
  fast-eval-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Deterministic & Core Smoke Evals
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_EVAL_KEY }}
        run: |
          python scripts/run_eval.py --suite core-smoke --fail-under-schema 1.0 --max-regression 0.02
```

> [!TIP]
> **Exam Tip (CCDV-P):**
> 1. Khi đánh giá Pairwise A vs B thấy kết quả thay đổi chỉ vì đảo vị trí 2 câu trả lời → **Position Bias**, bắt buộc dùng **Bidirectional Position Swapping** (đảo A/B và chỉ tính thắng khi nhất quán cả 2 lượt).
> 2. Cần kiểm tra phiên bản prompt mới trên traffic thật mà không ảnh hưởng người dùng cuối → **Shadow Deployment** (nhớ mock/dry-run các mutating tools!).
> 3. Làm sao chạy bộ Full Regression 10,000 mẫu hàng đêm với chi phí tối ưu → Dùng **Message Batches API** (giảm 50% chi phí).

---

[← Bài trước](07-eval-engineering-qa.md) | [Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/08-cicd-eval-gates.md) | [Bài tiếp →](09-runtime-guardrails-security.md)
