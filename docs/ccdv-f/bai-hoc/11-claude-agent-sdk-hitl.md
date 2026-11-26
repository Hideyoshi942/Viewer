# Module 8: Claude Agent SDK & Human-in-the-Loop (HITL)

Thay vì phải tự viết lại vòng lặp `while stop_reason == "tool_use"`, quản lý context compaction, retry và kết nối MCP thủ công cho mọi dự án, **Claude Agent SDK** cung cấp sẵn runtime chuẩn của Anthropic để xây dựng, điều phối và kiểm soát an toàn cho các Autonomous Agent.

## 1. Kiến trúc & Năng lực Cốt lõi của Claude Agent SDK

Claude Agent SDK đóng gói sẵn các thành phần production-ready:
- **Built-in Agentic Loop**: Tự động xử lý chuỗi gọi tool nhiều bước, `tool_result`, và quản lý context window (compaction khi hội thoại dài).
- **Subagent Delegation**: Cho phép Orchestrator khởi tạo các **Subagent chuyên biệt** với system prompt riêng và **tập tools bị giới hạn theo nguyên tắc Least Privilege**.
- **Native MCP Integration**: Kết nối trực tiếp tới các MCP Server (`stdio` hoặc `Streamable HTTP`) để mở rộng công cụ.
- **Lifecycle Hooks (`PreToolUse`, `PostToolUse`)**: Can thiệp ở tầng code trước hoặc sau khi agent thực thi bất kỳ tool nào.

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Audit src/auth.ts for security issues and summarize findings.",
  options: {
    allowedTools: ["Read", "Grep", "Glob"],  // Read-only: không cấp Write/Bash
    maxTurns: 10,
    hooks: {
      PreToolUse: [
        {
          matcher: "Bash",
          hooks: [async (input) => {
            console.log("Blocking unauthorized Bash call");
            return { decision: "block", reason: "Read-only audit mode" };
          }]
        }
      ]
    }
  }
})) {
  if ("result" in message) console.log(message.result);
}
```

## 2. Phân biệt `PreToolUse` vs `PostToolUse` Hooks

| Hook Event | Thời điểm kích hoạt | Ứng dụng Production |
| :--- | :--- | :--- |
| **`PreToolUse`** | **Trước** khi tool được thực thi | Kiểm tra quyền, chặn lệnh nguy hiểm (`rm -rf`, `DROP TABLE`), kích hoạt **Human-in-the-Loop** phê duyệt |
| **`PostToolUse`** | **Sau** khi tool chạy xong, trước khi trả kết quả về Claude | Ghi audit log, che giấu PII/secrets trong output của tool, chạy linter/formatter tự động |

> **Exam Tip**: Khi đề bài hỏi về việc **kiểm duyệt, làm sạch hoặc ghi log kết quả trả về từ tool trước khi Claude đọc tiếp** trong Claude Agent SDK, đáp án là **`PostToolUse` hook**. Nếu cần **chặn hoặc yêu cầu người dùng duyệt trước khi tool chạy**, đáp án là **`PreToolUse` hook**.

## 3. Human-in-the-Loop (HITL) cho Hành động Rủi ro Cao

Khi triển khai Agent có khả năng thực hiện các hành động **không thể đảo ngược (irreversible)** hoặc có tác động lớn (chuyển tiền, hoàn tiền `refund_order`, xóa dữ liệu production, gửi email hàng loạt):
1. **Tạm dừng thực thi (Pause & Confirm)**: Khi Claude trả về `tool_use` cho hành động nhạy cảm, ứng dụng **không thực thi ngay** mà đẩy yêu cầu kèm tham số chi tiết lên UI/Slack để con người xác nhận (`Approve` / `Reject`).
2. **Nếu con người từ chối**: Trả về một `tool_result` với `"is_error": true` và nội dung thông báo rõ ràng (vd: `"Action rejected by human reviewer. Do not proceed with refund."`) để Claude thông báo lại cho người dùng một cách lịch sự.
3. **Giới hạn phạm vi (Sandboxing & Least Privilege)**: Luôn kết hợp HITL với `allowedTools` tối thiểu và giới hạn `maxTurns` / ngân sách chi phí.

> **Exam Tip**: Tuyệt đối không chỉ dựa vào câu lệnh trong System Prompt (như *"Hãy hỏi người dùng trước khi xóa file"*) để đảm bảo an toàn, vì prompt có thể bị bypass bởi Prompt Injection. Phải cưỡng chế HITL ở **tầng code ứng dụng** (qua `PreToolUse` hook hoặc kiểm tra trước khi thực thi `tool_use`).

---

[← Bài trước](10-agents-workflows-agent-sdk.md) | [Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/08-agent-sdk-hitl.md) | [Bài tiếp →](12-prompt-engineering-structured-outputs.md)
