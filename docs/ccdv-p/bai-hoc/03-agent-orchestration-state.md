# Domain 2: Advanced Agent Architecture, State Management & Multi-Agent Orchestration

Domain 2 chiếm **17% tỷ trọng đề thi CCDV-P**. Ở quy mô production, agent không chạy trong một vòng lặp `while True` mong manh trên RAM. Bạn cần kiến trúc điều phối đa tác tử (multi-agent), lưu trạng thái bền vững (durable execution), giới hạn tài nguyên nghiêm ngặt và cổng phê duyệt của con người (Human-in-the-Loop) cho các hành động có rủi ro cao.

## 1. Các mẫu Kiến trúc Điều phối (Orchestration Patterns)

| Kiến trúc | Cơ chế hoạt động | Khi nào sử dụng | Rủi ro cần kiểm soát |
| :--- | :--- | :--- | :--- |
| **Hierarchical Supervisor-Worker** | Orchestrator (Supervisor) phân rã mục tiêu, giao việc cho Worker chuyên biệt (Researcher, Coder, Reviewer), tổng hợp kết quả | Tác vụ phức tạp, nhiều bước phụ thuộc động | Context phình to ở Supervisor; bottleneck nếu Supervisor giữ mọi raw output |
| **Sequential / Pipeline** | Output của Agent A là input chuẩn hóa của Agent B | Quy trình cố định (Extract → Transform → Validate) | Lan truyền lỗi (error propagation) qua các bước |
| **Parallel Fan-out / Fan-in** | Điều phối nhiều subagent chạy đồng thời trên các phần việc độc lập, rồi hợp nhất kết quả | Review đa chiều, tìm kiếm nhiều nguồn, xử lý nhiều file | Rate limit (TPM/RPM) tăng đột biến; xung đột ghi đè state |
| **Routing / Handoff** | Triage agent phân loại intent rồi chuyển quyền kiểm soát hẳn cho Specialist agent | Customer support nhiều tuyến, hệ thống domain tách biệt | Mất ngữ cảnh khi handoff nếu không có Handoff Contract |

## 2. Durable Execution & Checkpointing

Một agent research hoặc coding có thể chạy 15–30 phút và thực hiện 40 tool calls. Nếu container bị OOM-kill hoặc pod bị restart ở bước thứ 35, việc chạy lại từ đầu gây lãng phí lớn về chi phí và thời gian.

- **State Checkpointing**: Sau mỗi vòng lặp LLM hoặc mỗi tool call hoàn tất, serialize toàn bộ `AgentState` (`messages`, `step_count`, `token_usage`, `pending_approvals`, `artifacts_refs`) xuống persistent store (PostgreSQL, Redis, hoặc Temporal workflow history).
- **Deterministic Replay / Resume**: Khi worker mới khởi động lại từ checkpoint, nó nạp state tại bước cuối cùng đã commit mà **không gọi lại** các tool đã có kết quả trong lịch sử.
- **Externalize Large Payloads (Pass-by-Reference)**: Không nhồi raw file 5MB hoặc kết quả SQL 10,000 dòng vào state/messages. Lưu payload ra S3/Object Storage và chỉ truyền `artifact_uri` + bản tóm tắt ngắn giữa các agent.

## 3. Handoff Contracts & Context Isolation

Khi Supervisor giao việc cho Worker (hoặc Agent A chuyển giao cho Agent B), truyền toàn bộ lịch sử hội thoại thô sẽ gây **Context Pollution** và lãng phí token.

- **Typed Handoff Contract**: Định nghĩa schema rõ ràng (Pydantic / JSON Schema) cho gói tin bàn giao gồm: `task_goal`, `constraints`, `relevant_context_summary`, `expected_output_schema`, và `remaining_budget`.
- **Context Isolation**: Subagent chỉ nhận đúng context cần thiết cho nhiệm vụ của nó, chạy trong vòng lặp riêng, và chỉ trả về kết quả cuối cùng đã chuẩn hóa cho Supervisor.

```python
from pydantic import BaseModel, Field
from typing import Literal

class HandoffContract(BaseModel):
    trace_id: str
    task_id: str
    objective: str
    constraints: list[str]
    artifact_uris: list[str] = Field(default_factory=list)
    max_steps: int = 8
    max_tokens_budget: int = 25000

class WorkerResult(BaseModel):
    task_id: str
    status: Literal["completed", "needs_human_approval", "failed"]
    summary: str
    output_uri: str | None = None
    tokens_used: int
```

## 4. Bounded Recursion, Step Budgets & Loop Prevention

Agent tự chủ có thể rơi vào vòng lặp vô tận (infinite loop) khi tool liên tục trả về lỗi hoặc kết quả mơ hồ, đốt sạch ngân sách API trong vài phút.

### Cơ chế phòng vệ bắt buộc
1. **Hard Step Budget (`max_steps`)**: Giới hạn số lượt gọi tool tối đa cho mỗi task (ví dụ `max_steps=12`) và độ sâu đệ quy tối đa nếu agent được phép spawn subagent (`max_depth=2`).
2. **Token & Cost Ceiling**: Theo dõi tích lũy `input_tokens + output_tokens` sau mỗi bước; ngắt sớm và trả trạng thái `partial_completed` nếu vượt ngưỡng.
3. **Repeated Tool-Call Detector**: Hash `(tool_name, normalized_arguments)` của các lần gọi gần nhất. Nếu agent gọi y hệt một tool với cùng tham số 2–3 lần liên tiếp, chặn lời gọi đó và inject thông báo ép model đổi chiến lược hoặc dừng lại.

## 5. Idempotent Tool Side-Effects & Human-in-the-Loop (HITL)

### 5.1 Phân loại Tool theo mức độ rủi ro
- **Read-only / Idempotent Tools**: `search_docs`, `get_order_status`, `read_file` → Cho phép agent tự động thực thi.
- **Mutating / Irreversible Tools**: `refund_payment`, `delete_database_row`, `send_external_email`, `deploy_production` → Yêu cầu **Idempotency Key** và **HITL Approval Gate**.

### 5.2 Thiết kế HITL Approval Gate (Pause & Resume)
Không giữ HTTP connection mở để chờ người dùng bấm nút duyệt!
1. Khi Claude phát sinh `tool_use` thuộc nhóm rủi ro cao (ví dụ `execute_refund`), orchestrator **chặn thực thi**, lưu checkpoint trạng thái `WAITING_FOR_APPROVAL` vào DB, và gửi thông báo (Slack/UI) kèm tóm tắt tác động.
2. Khi con người nhấn **Approve** hoặc **Reject** (có thể sau vài giờ), hệ thống đánh thức workflow:
   - Nếu **Approve**: Thực thi tool với `idempotency_key`, đưa kết quả vào `tool_result` và cho Claude chạy tiếp.
   - Nếu **Reject**: Trả `tool_result` với `is_error: true` và lý do từ chối từ reviewer để Claude điều chỉnh kế hoạch hoặc kết thúc an toàn.

```python
HIGH_RISK_TOOLS = {"refund_payment", "delete_record", "merge_pr"}

def handle_tool_call(tool_block, workflow_state):
    if tool_block.name in HIGH_RISK_TOOLS:
        # Lưu checkpoint và tạm dừng workflow, KHÔNG thực thi ngay
        workflow_state.status = "WAITING_FOR_APPROVAL"
        workflow_state.pending_tool_call = {
            "id": tool_block.id,
            "name": tool_block.name,
            "input": tool_block.input,
        }
        save_checkpoint(workflow_state)
        notify_reviewer(workflow_state.trace_id, tool_block)
        return None  # Tạm dừng vòng lặp agent

    return execute_read_only_tool(tool_block.name, tool_block.input)
```

> [!TIP]
> **Exam Tip (CCDV-P):**
> 1. Khi đề bài hỏi làm sao tránh mất tiến độ agent chạy lâu nếu server crash → **Durable Execution / Checkpointing sau mỗi step** (kết hợp idempotency key cho tool ghi).
> 2. Khi Supervisor bị quá tải context vì nhận raw output từ 5 worker → Áp dụng **Context Isolation + Pass-by-Reference** (lưu artifact ra storage, chỉ trả summary + URI qua Handoff Contract).
> 3. Cách xử lý HITL đúng chuẩn cho hành động nhạy cảm (như hoàn tiền/xóa dữ liệu) → **Interrupt trước khi thực thi tool, persist state, chờ webhook/approval rồi mới trả `tool_result`**.

---

[← Bài trước](02-knowledge-grounding.md) | [Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/03-agent-orchestration.md) | [Bài tiếp →](04-durable-state.md)
