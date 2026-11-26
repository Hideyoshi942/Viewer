# Module 7: Agentic Workflows, stop_reason Loop & Multi-Agent Patterns

**Domain 3 (Agents and Workflows)** chiếm **15% tỷ trọng đề thi**. Anthropic nhấn mạnh nguyên tắc kỹ thuật: **luôn ưu tiên giải pháp đơn giản nhất đáp ứng được bài toán** — chỉ dùng Autonomous Agent khi các Workflow tất định (deterministic) không thể dự đoán trước số bước cần thiết.

## 1. Workflows vs. Autonomous Agents

| Đặc điểm | Workflows | Autonomous Agents |
| :--- | :--- | :--- |
| **Luồng điều khiển** | Code ứng dụng điều khiển theo trình tự định sẵn | Claude tự quyết định bước tiếp theo, gọi tool và tự đánh giá |
| **Tính dự đoán** | Cao, chi phí và độ trễ ổn định | Linh hoạt, nhưng khó dự đoán số vòng lặp và chi phí |
| **Khi nào dùng?** | Tác vụ phân rã được thành các bước cố định | Tác vụ mở, không biết trước cần bao nhiêu bước (ví dụ: debug repo, research) |

### 5 Workflow Patterns Kinh điển của Anthropic
1. **Prompt Chaining**: Chia tác vụ thành chuỗi tuần tự (Output bước 1 → Gate kiểm tra → Input bước 2).
2. **Routing**: Phân loại input ở đầu vào và điều hướng tới chuyên gia/prompt/model phù hợp.
3. **Parallelization**:
   - *Sectioning*: Chia nhỏ tác vụ độc lập chạy song song (ví dụ: tóm tắt 3 chương báo cáo cùng lúc rồi tổng hợp).
   - *Voting*: Chạy cùng prompt nhiều lần để kiểm tra đồng thuận (guardrail/moderation).
4. **Orchestrator-Workers**: Một model trung tâm (Orchestrator) tự động phân rã bài toán phức tạp thành các subtask động và giao cho các Worker chạy song song, sau đó tổng hợp kết quả.
5. **Evaluator-Optimizer**: Một model sinh kết quả (Generator) và một model khác chấm điểm/phản biện (Evaluator) lặp lại cho đến khi đạt tiêu chuẩn.

> **Exam Tip**: Khi đề bài mô tả quy trình chạy **cố định 3 phân tích độc lập song song** trên một tài liệu rồi gộp kết quả, đó là **Parallelization (Sectioning)**. Khi số lượng và loại subtask **không cố định mà do LLM tự chia động theo từng input**, đó là **Orchestrator-Workers**.

## 2. Agentic Loop Chuẩn Dựa trên `stop_reason`

Trái tim của mọi Agent chạy trên Messages API là vòng lặp `while` kiểm tra `response.stop_reason` — **tuyệt đối không** dựa vào việc tìm chuỗi text hay đoán xem Claude đã xong chưa:

```python
import anthropic

client = anthropic.Anthropic()

def run_agent(messages, tools, max_iterations=10):
    for step in range(max_iterations):
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2048,
            tools=tools,
            messages=messages
        )
        # Luôn nối nguyên assistant response.content vào lịch sử
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            # Claude đã hoàn tất câu trả lời cuối cùng
            return response

        if response.stop_reason == "tool_use":
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    result = execute_local_tool(block.name, block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result
                    })
            # Trả toàn bộ tool_result trong CÙNG MỘT user message
            messages.append({"role": "user", "content": tool_results})
        else:
            break  # max_tokens hoặc stop_sequence
    raise RuntimeError("Agent exceeded max_iterations safety limit")
```

### Quy tắc Vàng của Agentic Loop
- **Chặn vòng lặp vô hạn**: Luôn đặt `max_iterations` (hoặc giới hạn ngân sách token) cho vòng lặp agent.
- **Điều kiện dừng chuẩn**: Kiểm tra `response.stop_reason == "tool_use"` để tiếp tục chạy tool, và `response.stop_reason == "end_turn"` để kết thúc.
- **ACI (Agent-Computer Interface)**: Thiết kế mô tả tool và thông báo lỗi rõ ràng như thiết kế UI cho con người; đầu tư vào ACI giúp giảm đáng kể tỷ lệ agent gọi sai tool.

---

[← Bài trước](08-prompt-caching-cost-optimization.md) | [Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/07-agentic-workflows.md) | [Bài tiếp →](10-agents-workflows-agent-sdk.md)
