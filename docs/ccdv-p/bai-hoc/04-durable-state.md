# Chủ đề 4: Durable Execution, Checkpointing, Idempotency & HITL Approval Gates

Trong **Domain 2 (17%)**, một agent production không thể chỉ chạy trong bộ nhớ RAM của một tiến trình ngắn hạn. Các tác vụ nghiên cứu, xử lý khiếu nại hay triển khai hạ tầng có thể kéo dài hàng chục phút hoặc tạm dừng nhiều giờ chờ con người phê duyệt. Bài học này đi sâu vào kỹ thuật giữ trạng thái bền vững (**Durable Execution**), đảm bảo tác động ngoài (**Idempotent Side-Effects**) và cổng phê duyệt (**HITL**).

## 1. Durable Execution & State Checkpointing

Nếu một agent chạy 30 bước bị pod eviction, OOM-kill hoặc restart ở bước 28, việc chạy lại từ bước 1 sẽ gây lãng phí chi phí LLM và có nguy cơ lặp lại các thao tác đã thực hiện.

### Mô hình Checkpointing theo từng Step
Sau mỗi lượt gọi Claude API hoặc mỗi lần hoàn tất `tool_result`, orchestrator lưu (persist) một **Checkpoint** xuống cơ sở dữ liệu bền vững (PostgreSQL, Redis AOF, DynamoDB) hoặc chạy trên nền **Workflow Engine** (như Temporal, Inngest):

| Thành phần trong Checkpoint | Mục đích phục hồi |
| :--- | :--- |
| `workflow_id` & `step_index` | Định danh duy nhất lượt chạy và thứ tự bước hiện tại |
| `status` | `RUNNING`, `WAITING_FOR_APPROVAL`, `COMPLETED`, `FAILED` |
| `messages_ref` | Lịch sử hội thoại (hoặc URI trỏ tới blob storage nếu quá lớn) |
| `pending_tool_calls` | Danh sách `tool_use` chưa được thực thi hoặc đang chờ duyệt |
| `cumulative_tokens` & `step_count` | Bảo toàn ngân sách (budget) khi resume, tránh reset bộ đếm về 0 |

### Deterministic Replay / Resume
Khi worker mới tiếp nhận `workflow_id` bị gián đoạn:
1. Nạp checkpoint có `step_index` cao nhất đã commit.
2. Nếu bước đang dở là `tool_use` đã có kết quả lưu sẵn → không gọi lại tool, chuyển thẳng sang gọi Claude.
3. Nếu bước đang dở là LLM call chưa nhận đủ response → gọi lại đúng bước đó với `step_count` giữ nguyên.

## 2. Idempotent Tool Side-Effects & Outbox Pattern

Trong hệ thống phân tán, lỗi **network timeout** khiến agent không biết tool ghi dữ liệu (tạo đơn hàng, hoàn tiền, gửi email) đã thành công ở server đích hay chưa. Nếu retry mù quáng, người dùng có thể bị hoàn tiền 2 lần.

### Quy tắc thiết kế Idempotent Tool
- **Deterministic Idempotency Key**: Tạo khóa từ `f"{workflow_id}:{step_index}:{tool_use_id}"` và truyền vào header/tham số của API đích (`Idempotency-Key`).
- **Server-side Deduplication**: Downstream service lưu `idempotency_key` cùng kết quả trong cùng transaction DB; nếu nhận lại cùng key, trả về kết quả cũ mà không thực thi lại nghiệp vụ.
- **Transactional Outbox**: Khi vừa cần cập nhật checkpoint DB vừa cần phát sự kiện sang queue (Kafka/SQS), ghi cả hai vào cùng một ACID transaction để tránh trạng thái "ghi DB xong nhưng crash trước khi gửi event".

```python
import hashlib
import json

def build_idempotency_key(workflow_id: str, step_index: int, tool_use_id: str, tool_input: dict) -> str:
    payload_hash = hashlib.sha256(json.dumps(tool_input, sort_keys=True).encode()).hexdigest()[:12]
    return f"{workflow_id}:{step_index}:{tool_use_id}:{payload_hash}"

def execute_refund_idempotent(payment_api, workflow_id: str, step_index: int, tool_block):
    idem_key = build_idempotency_key(workflow_id, step_index, tool_block.id, tool_block.input)
    # API thanh toán đảm bảo chỉ xử lý 1 lần duy nhất cho cùng idem_key
    return payment_api.create_refund(
        order_id=tool_block.input["order_id"],
        amount=tool_block.input["amount"],
        idempotency_key=idem_key,
    )
```

## 3. Thiết kế Human-in-the-Loop (HITL) Approval Gates

Tuyệt đối **không giữ HTTP connection mở** hoặc dùng `time.sleep()` trong worker để chờ con người duyệt (gây cạn kiệt connection pool và mất trạng thái nếu server restart).

### Kiến trúc Pause-and-Resume chuẩn Production
1. **Phân loại rủi ro (Risk Tiering)**:
   - *Tier 1 (Read-only)*: `search_kb`, `get_invoice` → Tự động thực thi.
   - *Tier 2 (Reversible Write)*: `create_draft_ticket` → Thực thi tự động nhưng ghi audit log.
   - *Tier 3 (High-Risk / Irreversible)*: `refund_over_500`, `delete_user_data`, `deploy_prod` → Bắt buộc qua **HITL Gate**.
2. **Interrupt & Persist**: Khi Claude trả về `tool_use` thuộc Tier 3, orchestrator **không thực thi tool**. Nó lưu checkpoint với `status = "WAITING_FOR_APPROVAL"`, giải phóng worker thread, và đẩy yêu cầu duyệt (kèm tóm tắt tác động + `approval_token` có TTL) lên Slack/Admin UI.
3. **Async Resume qua Webhook**:
   - **Nếu Approved**: Endpoint nhận webhook xác thực danh tính người duyệt, thực thi tool với `idempotency_key`, tạo `tool_result` chứa kết quả thành công và đánh thức agent chạy tiếp.
   - **Nếu Rejected**: Trả `tool_result` với `"is_error": True` và nội dung `"Human reviewer rejected this action: <reason>"` để Claude điều chỉnh phương án thay thế hoặc kết thúc lịch sự.
   - **Nếu Timeout (quá SLA)**: Tự động chuyển trạng thái `EXPIRED` và trả `is_error: True` thay vì treo vô thời hạn.

> [!TIP]
> **Exam Tip (CCDV-P):**
> 1. Khi agent bị crash giữa chừng ở bước 18/25 và cần tiếp tục mà không gọi lại các tool thanh toán đã chạy ở bước 5 → Cần **State Checkpointing + Idempotency Keys** (`workflow_id + step_index + tool_use_id`).
> 2. Để chờ quản lý phê duyệt lệnh xóa dữ liệu có thể mất 2 tiếng → Dùng mô hình **Async Pause-and-Resume**: lưu state `WAITING_FOR_APPROVAL`, giải phóng worker, chờ webhook duyệt rồi mới cấp `tool_result`.
> 3. Khi con người nhấn Reject trong HITL → Trả `tool_result` với `is_error: true` kèm lý do từ chối để model phản ứng phù hợp, không vứt bỏ exception làm crash cả session.

---

[← Bài trước](03-agent-orchestration-state.md) | [Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/04-durable-state.md) | [Bài tiếp →](05-observability-distributed-tracing.md)
