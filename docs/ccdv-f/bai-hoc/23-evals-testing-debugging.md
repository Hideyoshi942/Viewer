# Domain 8: Đánh giá Mô hình (Evals), LLM-as-a-Judge & Debugging

Domain 8 chiếm **3% đề thi CCDV-F**, tập trung vào quy trình đo lường chất lượng hệ thống AI một cách khoa học (Eval-Driven Development) và xử lý sự cố trong production.

## 1. Quy trình Xây dựng Evals & Eval Datasets

Thay vì "vibe check" (thử vài câu thấy ổn rồi deploy), kỹ sư AI chuyên nghiệp xây dựng bộ **Eval Dataset** gồm các cặp `(input, expected_criteria/reference_output)` bao phủ:
- **Happy paths**: Các truy vấn phổ biến nhất từ người dùng thực tế.
- **Edge cases**: Input rỗng, quá dài, đa ngôn ngữ, ký tự đặc biệt.
- **Adversarial cases**: Câu hỏi dễ gây hallucination hoặc chứa prompt injection.

> **Exam Tip**: Khi thay đổi prompt, nâng cấp model (vd: từ Sonnet 3.7 lên Sonnet 4), hoặc chỉnh sửa tool description, bạn **phải chạy lại toàn bộ bộ Regression Eval** để đảm bảo cải thiện ở điểm này không làm tụt chất lượng ở điểm khác.

## 2. Phân loại Graders (Bộ chấm điểm)

| Loại Grader | Cơ chế | Ưu điểm | Nhược điểm / Khi nào dùng |
| :--- | :--- | :--- | :--- |
| **Code-based (Deterministic)** | Regex, JSON Schema validation, Exact match, Unit test chạy code sinh ra | Nhanh, rẻ, khách quan 100% | Không đánh giá được ngữ nghĩa, văn phong hay độ tự nhiên |
| **LLM-as-a-Judge (Model-based)** | Dùng một mô hình mạnh (vd: Sonnet/Opus) chấm điểm output dựa trên **Rubric** rõ ràng | Hiểu ngữ nghĩa, linh hoạt, scale tốt | Có chi phí API và có thể thiên vị (position/verbosity bias) |
| **Human Review** | Chuyên gia đánh giá thủ công (thang điểm hoặc A/B) | Chuẩn xác nhất (Gold Standard) | Chậm, tốn kém; dùng để hiệu chỉnh (calibrate) LLM-as-a-Judge |

### Best Practices cho LLM-as-a-Judge
- Cung cấp **Rubric chấm điểm cụ thể** (thang 1–5 kèm mô tả từng mức) thay vì hỏi chung chung *"Câu trả lời này có tốt không?"*.
- Yêu cầu Judge **xuất lý do (`reasoning`) trước khi xuất điểm (`score`)** để tăng độ tin cậy (Chain-of-Thought grading).
- Kết hợp **Code-based grader kiểm tra format trước** (fail-fast nếu sai JSON schema) rồi mới gọi **LLM-as-a-Judge** đánh giá nội dung để tiết kiệm chi phí.

## 3. Debugging & Production Telemetry

Khi ứng dụng Claude gặp sự cố trong production, cần theo dõi các chỉ số telemetry cốt lõi từ `response.usage` và metadata:
- **`stop_reason == "max_tokens"`**: Dấu hiệu output bị cắt cụt (gây lỗi parse JSON hoặc thiếu nội dung) → cần tăng `max_tokens` hoặc chia nhỏ tác vụ.
- **Cache Hit Rate (`cache_read_input_tokens / total_input_tokens`)**: Nếu tỷ lệ này đột ngột bằng 0, kiểm tra xem có dữ liệu động (timestamp, UUID) vô tình lọt vào phần trước `cache_control` breakpoint hay không.
- **Hallucination / Grounding Failure**: Mô hình bịa thông tin không có trong tài liệu RAG → khắc phục bằng cách yêu cầu trích dẫn nguồn (`<citation>`), hạ `temperature` về `0.0`, và cho phép mô hình trả lời *"Tôi không tìm thấy thông tin trong tài liệu"* (explicit refusal).
- **Latency Spikes**: Phân biệt giữa **TTFT** (thời gian chờ token đầu tiên — cải thiện bằng Prompt Caching và Streaming) và **TPOT** (Time Per Output Token — cải thiện bằng cách chọn model nhẹ hơn như Haiku hoặc giảm `budget_tokens` của Extended Thinking).

---

[← Bài trước](22-evals-llm-as-judge-debugging.md) | [Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/15-eval-testing.md)
