# Module 15: Model Evals, LLM-as-a-Judge, Regression Testing & Debugging

**Domain 8 (Eval, Testing, and Debugging)** chiếm **3% tỷ trọng đề thi**. Xây dựng ứng dụng AI không có bộ đánh giá (Evals) giống như viết phần mềm không có automated tests — mọi thay đổi prompt hoặc nâng cấp model đều có nguy cơ gây hồi quy (regression) âm thầm.

## 1. Phân loại Graders: Code-based vs. LLM-as-a-Judge

| Loại Grader | Cơ chế hoạt động | Khi nào nên ưu tiên? |
| :--- | :--- | :--- |
| **Code-based Grader** | Unit test, regex, JSON Schema validator, exact match | Đầu ra tất định (JSON hợp lệ, mã trạng thái, gọi đúng tên tool, latency). **Nhanh, rẻ, 100% nhất quán.** |
| **LLM-as-a-Judge** | Dùng một model mạnh (như Sonnet/Opus) chấm điểm theo **Rubric** | Đầu ra mở, sắc thái tự nhiên (giọng văn, độ hữu ích, phát hiện hallucination so với tài liệu gốc). |
| **Human Grader** | Chuyên gia đánh giá thủ công | Hiệu chuẩn (calibrate) lại LLM-as-a-Judge và kiểm tra các ca biên phức tạp. |

### Best Practices Thiết kế LLM-as-a-Judge
- Chấm theo **thang điểm rời rạc / nhị phân (Pass/Fail hoặc 1–5)** kèm **Rubric chi tiết từng mức**, tránh thang điểm 1–100 mơ hồ.
- Yêu cầu judge **sinh phần lập luận (`reasoning`) trước rồi mới xuất điểm số (`score`)** để tăng tính nhất quán.
- Tối ưu chi phí chạy bộ Eval lớn bằng **Message Batches API** (giảm 50% chi phí).

## 2. Chỉ số Đánh giá Agent Không Tất định: `pass@k` vs. `pass^k`

Vì LLM và Agent có tính ngẫu nhiên (non-deterministic), việc chạy 1 lần duy nhất không phản ánh đúng độ tin cậy:
- **`pass@k`**: Xác suất có **ít nhất 1 lần thành công** trong `k` lần thử (phù hợp với bài toán coding assistant nơi người dùng chỉ cần 1 giải pháp chạy được).
- **`pass^k` (pass-to-the-k)**: Xác suất **cả `k` lần thử liên tiếp đều thành công** (bắt buộc cho các production agent đòi hỏi độ tin cậy nhất quán cao, ví dụ customer support hoặc tài chính).

> **Exam Tip**: Nếu một agent có tỷ lệ thành công đơn lẻ là 80% (`0.8`), thì `pass@3` rất cao (`99.2%`), nhưng `pass^3` chỉ còn `0.8^3 = 51.2%`. Đề thi thường hỏi chỉ số nào đo **tính ổn định lặp lại (consistency)** của agent trong production — đáp án là **`pass^k`**.

## 3. Regression Testing trong CI/CD & Debugging Production

1. **Golden Eval Dataset & CI/CD**: Duy trì bộ test chuẩn (Golden Dataset) gồm cả các **edge cases** và **failure cases trong quá khứ**. Tự động chạy eval trước khi merge/deploy bất kỳ thay đổi nào về `system` prompt, `tools` schema hoặc phiên bản model mới.
2. **Debug `cache_read_input_tokens == 0` đột ngột**:
   - Kiểm tra xem có dữ liệu động (timestamp, UUID) bị chèn vào phần đầu (`tools` hoặc `system`) gây **Cache Miss** hay không.
   - Kiểm tra xem cache đã hết hạn TTL (5 phút mặc định) do khoảng cách giữa các request quá lâu hay không.
   - Kiểm tra xem block có bị giảm xuống dưới ngưỡng tối thiểu (1,024 / 2,048 tokens) hay không.
3. **Debug Latency Spikes**: Theo dõi `usage.output_tokens` (output dài bất thường làm tăng thời gian sinh), `stop_reason` (tránh vòng lặp tool vô hạn), và kiểm tra HTTP `529 overloaded_error` hoặc `429` retry delays.

---

[← Bài trước](21-claude-code-cli-hooks-claudemd.md) | [Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/15-eval-testing.md) | [Bài tiếp →](23-evals-testing-debugging.md)
