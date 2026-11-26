# Domain 6: Advanced Debugging, Non-deterministic Failure Modes & Incident Response

Domain 6 chiếm **10% tỷ trọng đề thi CCDV-P**. Lỗi trong hệ thống LLM thường mang tính xác suất (non-deterministic), âm thầm (silent failures) và khó tái hiện nếu thiếu dữ liệu ngữ cảnh. Bạn cần biết cách chẩn đoán 4 dạng lỗi đặc trưng nhất của Claude ở production và vận hành quy trình ứng phó sự cố (Incident Response).

## 1. Tái hiện lỗi từ Trace Snapshots (Deterministic Reproduction)

Khi có sự cố chất lượng trên production, câu hỏi đầu tiên là *"Tại sao Claude lại trả lời như vậy?"*. Để tái hiện được lỗi:
- Lưu **Immutable Trace Snapshot** (trong môi trường staging/debug an toàn) gồm:
  1. `model` (chính xác snapshot ID, ví dụ `claude-sonnet-4-20250514`).
  2. `system` prompt + `tools` JSON schema (đúng thứ tự).
  3. Toàn bộ mảng `messages` đầu vào (kèm các `tool_result` thực tế đã nhận).
  4. Tham số sampling (`temperature`, `top_p`, `max_tokens`, `thinking` config).
- Chạy replay với `temperature=0.0` để cô lập xem lỗi do **prompt/context ambiguity** (tái hiện 100%) hay do **sampling variance** ở `temperature > 0`.

## 2. Bốn Failure Modes đặc trưng ở Production

### 2.1 Silent Truncation (`stop_reason == "max_tokens"`)
- **Triệu chứng**: Claude ngừng giữa chừng khi đang sinh JSON hoặc XML, gây lỗi `JSONDecodeError` ở tầng parser, hoặc trả lời thiếu phần kết luận quan trọng.
- **Nguyên nhân**: Tham số `max_tokens` đặt quá thấp so với độ dài output (đặc biệt khi bật **Extended Thinking**, vì `thinking` tokens cũng tiêu tốn trong ngân sách `max_tokens`!).
- **Cách xử lý**:
  - Luôn kiểm tra `response.stop_reason` trước khi parse!
  - Nếu `stop_reason == "max_tokens"`: Tăng `max_tokens` (hoặc yêu cầu response ngắn gọn hơn / chia nhỏ task), hoặc dùng **assistant prefill / continuation** có kiểm soát thay vì để crash parser.

### 2.2 Tool-Call Loops (Vòng lặp gọi Tool vô tận)
- **Triệu chứng**: Agent tiêu tốn hết step budget hoặc rate limit vì gọi lặp đi lặp lại cùng một tool với cùng tham số.
- **Nguyên nhân**: Tool trả về thông báo lỗi mơ hồ (ví dụ `"Error: 400"` thay vì giải thích rõ trường nào sai), khiến model thử lại y hệt; hoặc tool thành công nhưng không trả dữ liệu như model kỳ vọng.
- **Cách xử lý**:
  - Thiết kế **Actionable Tool Errors**: Trả về `is_error: true` kèm hướng dẫn sửa cụ thể (ví dụ: `"Invalid date format '22-11-2026'. Expected ISO-8601 'YYYY-MM-DD'."`).
  - Dùng **Repeated Call Detector** trong orchestrator để chặn sau 2 lần gọi trùng lặp.

### 2.3 Context Rot ("Lost in the Middle" & Context Pollution)
- **Triệu chứng**: Ở lượt đầu agent làm rất tốt, nhưng sau 15–20 lượt hội thoại hoặc khi nhồi > 80K tokens tài liệu, model bắt đầu quên chỉ dẫn trong System Prompt, bỏ sót thông tin nằm ở giữa context, hoặc bị nhiễu bởi các `tool_result` lỗi cũ.
- **Cách xử lý**:
  - **Context Compaction**: Tóm tắt định kỳ các lượt cũ, xóa bỏ raw tool outputs đã xử lý xong.
  - **Information Ordering**: Đặt chỉ dẫn quan trọng nhất và tài liệu liên quan nhất ở **đầu** hoặc **cuối** prompt (nơi cơ chế attention mạnh nhất).
  - **Subagent Isolation**: Tách các tác vụ tìm kiếm/đọc nhiều file sang subagent riêng để giữ context chính sạch sẽ.

### 2.4 Model Drift & Alias Surprise
- **Triệu chứng**: Hệ thống đang chạy ổn định bỗng nhiên tỷ lệ parse JSON lỗi hoặc thay đổi format output hàng loạt dù team không deploy code mới.
- **Nguyên nhân**: Sử dụng model alias (`-latest`) hoặc nhà cung cấp nâng cấp phiên bản ngầm.
- **Cách xử lý**: **Luôn pin Model Snapshot ID cố định** (ví dụ `claude-sonnet-4-20250514`) trên production. Chỉ nâng cấp snapshot sau khi đã chạy qua Evaluation Suite và Shadow Deployment.

## 3. Incident Response Runbook: Rollback & Graceful Degradation

| Kịch bản sự cố | Hành động ứng phó tức thì (Mitigation) |
| :--- | :--- |
| **Prompt mới làm tụt chất lượng / tăng hallucination** | **Instant Config Rollback**: Đưa `prompt_version` về bản ổn định trước đó qua Feature Flag/Prompt Registry (không cần build lại app). |
| **Primary Provider (1P API) gặp `529` / outage kéo dài** | Circuit Breaker tự động chuyển traffic sang **Amazon Bedrock / Vertex AI** ở region dự phòng. |
| **Model chính quá tải / Chi phí tăng đột biến (Spike)** | **Graceful Degradation**: Hạ cấp các tác vụ không thiết yếu sang model nhẹ hơn (Opus → Sonnet → Haiku), tắt Extended Thinking, hoặc tạm chuyển sang fallback rule-based/cached response. |
| **Phát hiện lỗ hổng Prompt Injection mới** | Kích hoạt **Kill-Switch** vô hiệu hóa tool ghi (write/mutating tools), chỉ giữ chế độ read-only hoặc HITL bắt buộc cho mọi tool call. |

> [!TIP]
> **Exam Tip (CCDV-P):**
> 1. Parser báo lỗi `Unexpected end of JSON input` dù model trước đó chạy bình thường → Kiểm tra **`response.stop_reason == "max_tokens"`** (Silent Truncation, đặc biệt hay gặp khi bật Extended Thinking mà quên tăng `max_tokens`).
> 2. Để tránh **Model Drift** bất ngờ trên production → **Pin exact model snapshot ID**, không dùng alias trôi nổi.
> 3. Agent chất lượng giảm sút dần khi hội thoại kéo dài nhiều lượt và tích tụ nhiều log tool → Hiện tượng **Context Rot**, giải pháp là **Context Compaction** + **Subagent Isolation**.

---

[← Bài trước](10-enterprise-security.md) | [Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/11-debugging-incident.md) | [Bài tiếp →](12-incident-response.md)
