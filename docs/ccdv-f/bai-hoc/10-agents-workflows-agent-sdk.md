# Domain 3: Kiến trúc Agentic Loop, Workflows & Claude Agent SDK

Domain 3 chiếm **15% đề thi CCDV-F**. Anthropic phân biệt rất rõ giữa **Workflows** (luồng điều khiển cố định bằng code) và **Agents** (LLM tự quyết định quy trình và gọi tool theo vòng lặp).

## 1. Workflows vs Autonomous Agents

| Pattern | Cơ chế hoạt động | Khi nào nên dùng |
| :--- | :--- | :--- |
| **Prompt Chaining** | Chia tác vụ thành các bước tuần tự cố định; output bước trước là input bước sau (có thể kèm gate kiểm tra) | Tác vụ có quy trình rõ ràng (vd: tạo dàn ý → kiểm tra → viết bài → dịch) |
| **Routing** | Phân loại input rồi điều hướng tới prompt/model chuyên biệt | Hỗ trợ khách hàng đa kênh (billing vs technical vs refund) |
| **Parallelization** | Chạy đồng thời nhiều tác vụ độc lập (**Sectioning**) hoặc chạy cùng 1 tác vụ nhiều lần để lấy đồng thuận (**Voting**) | Kiểm duyệt nội dung song song với trả lời; đánh giá code từ nhiều góc độ |
| **Orchestrator-Workers** | Một LLM trung tâm (**Orchestrator**) tự động phân rã bài toán động và giao cho các **Workers** chuyên biệt | Coding agent sửa nhiều file chưa biết trước số lượng file cần sửa |
| **Evaluator-Optimizer** | Một LLM sinh kết quả (**Generator**), một LLM khác chấm điểm/phản hồi (**Evaluator**) lặp lại đến khi đạt chuẩn | Dịch thuật văn học, tối ưu hóa truy vấn tìm kiếm phức tạp |

> **Exam Tip**: Nguyên tắc vàng của Anthropic là **"Start with the simplest solution"**: chỉ dùng Autonomous Agent khi bài toán có tính mở (open-ended), số bước không thể dự đoán trước. Nếu quy trình cố định, **Workflow** luôn rẻ hơn, nhanh hơn và dễ debug hơn.

## 2. Cơ chế Agentic Loop và `stop_reason`

Trái tim của mọi Claude Agent là vòng lặp `while` điều khiển bởi trường `response.stop_reason`:

```python
messages = [{"role": "user", "content": "Check server CPU and restart if > 90%."}]

while True:
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        tools=tools,
        messages=messages
    )
    messages.append({"role": "assistant", "content": response.content})

    if response.stop_reason == "end_turn":
        # Claude đã hoàn tất câu trả lời cuối cùng
        break
    elif response.stop_reason == "tool_use":
        # Trích xuất các tool_use block, thực thi tool và gửi lại tool_result
        tool_results = execute_tools(response.content)
        messages.append({"role": "user", "content": tool_results})
    elif response.stop_reason == "max_tokens":
        # Output bị cắt ngang! Cần xử lý tăng max_tokens hoặc yêu cầu tiếp tục
        break
```

### Bảng tổng hợp `stop_reason` cần nhớ
- **`end_turn`**: Mô hình kết thúc tự nhiên.
- **`tool_use`**: Mô hình dừng để chờ ứng dụng thực thi tool và trả về `tool_result`.
- **`max_tokens`**: Chạm trần `max_tokens` (nếu đang gọi tool, JSON input có thể bị cắt dở!).
- **`stop_sequence`**: Chạm chuỗi dừng tùy chỉnh do lập trình viên cấu hình.
- **`pause_turn`**: Xuất hiện với server-side tools chạy dài để client tiếp tục lượt.

## 3. Claude Agent SDK & Human-in-the-Loop (HITL)

**Claude Agent SDK** cung cấp sẵn runtime chuẩn hóa vòng lặp agentic, quản lý context, built-in tools (Read, Edit, Bash, Glob, Grep), subagents (cô lập ngữ cảnh cho tác vụ con) và tích hợp MCP.

Để đảm bảo an toàn trong production, luôn thiết kế **Human-in-the-Loop (HITL)** và **Guardrails vòng lặp**:
- **Max Iterations / Token Budget**: Luôn đặt giới hạn số vòng lặp tối đa (vd: `max_turns=10`) để tránh vòng lặp vô tận (infinite loop) đốt sạch ngân sách API.
- **Approval Gates**: Với các hành động có tác động phá hủy hoặc không thể hoàn tác (xóa database, chuyển tiền, gửi email hàng loạt), tạm dừng agent và yêu cầu con người xác nhận trước khi thực thi tool.
- **State Persistence**: Lưu trạng thái `messages` vào database (Redis/PostgreSQL) để có thể khôi phục agent nếu quá trình bị gián đoạn khi chờ duyệt.

---

[← Bài trước](09-agentic-workflows-stop-reason-loop.md) | [Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/07-agentic-workflows.md) | [Bài tiếp →](11-claude-agent-sdk-hitl.md)
