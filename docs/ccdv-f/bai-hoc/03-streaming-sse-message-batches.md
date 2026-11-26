# Module 2: Streaming (SSE) & Message Batches API

Trong production, không phải mọi tác vụ đều xử lý theo kiểu request-response đồng bộ thông thường. Tùy vào yêu cầu về **TTFT (Time To First Token)** và **chi phí (Cost)**, bạn cần lựa chọn giữa **Streaming (SSE)** cho trải nghiệm thời gian thực và **Message Batches API** cho xử lý bất đồng bộ quy mô lớn.

## 1. Streaming với Server-Sent Events (SSE)

Khi xây dựng chatbot hoặc ứng dụng tạo văn bản dài (`max_tokens` lớn), việc chờ Claude sinh xong toàn bộ câu trả lời mới trả về HTTP response sẽ khiến người dùng chờ lâu và dễ gặp **HTTP gateway timeout**. Bật `stream: true` giúp gửi từng mảnh token ngay khi Claude sinh ra.

### Thứ tự chuẩn của 6 sự kiện SSE
1. **`message_start`**: Khởi tạo message, chứa `id`, `model`, `role` và `usage.input_tokens`.
2. **`content_block_start`**: Bắt đầu một block nội dung mới (`type`: `"text"`, `"thinking"`, hoặc `"tool_use"`).
3. **`content_block_delta`**: Truyền từng mảnh dữ liệu (`text_delta`, `thinking_delta`, hoặc `input_json_delta` cho tham số tool).
4. **`content_block_stop`**: Kết thúc block hiện tại.
5. **`message_delta`**: Cập nhật `stop_reason` cuối cùng và `usage.output_tokens`.
6. **`message_stop`**: Đóng luồng SSE hoàn chỉnh.

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

async function streamChat() {
  const stream = client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: "Explain event-driven microservices." }],
  });

  stream.on("text", (text) => {
    process.stdout.write(text);
  });

  // Đợi toàn bộ stream kết thúc để lấy object Message đầy đủ (kèm usage, stop_reason)
  const finalMessage = await stream.finalMessage();
  console.log("\nTotal output tokens:", finalMessage.usage.output_tokens);
}
```

> **Exam Tip**: Anthropic SDK khuyến khích dùng helper `client.messages.stream(...)` (Python: `with client.messages.stream(...) as stream:`) thay vì tự parse raw SSE lines, đồng thời bắt buộc dùng streaming cho các request có `max_tokens` lớn để tránh timeout mạng ở tầng proxy/load balancer.

## 2. Message Batches API (`/v1/messages/batches`)

Khi hệ thống cần xử lý hàng nghìn hoặc hàng trăm nghìn prompt **không yêu cầu phản hồi tức thì** (như phân loại log ban đêm, dịch tài liệu hàng loạt, chạy bộ test Eval), **Message Batches API** giúp **giảm 50% chi phí** cho cả input và output tokens.

### Thông số kỹ thuật quan trọng của Message Batches API
- **Chi phí**: **Giảm 50%** so với giá Messages API tiêu chuẩn.
- **SLA xử lý**: Bất đồng bộ, hoàn thành trong **tối đa 24 giờ** (thực tế thường nhanh hơn nhiều).
- **Giới hạn quy mô**: Tối đa **100,000 requests** hoặc **256 MB** payload cho mỗi batch.
- **Định danh (`custom_id`)**: Mỗi request trong batch **bắt buộc** có `custom_id` duy nhất vì kết quả trả về dạng `.jsonl` **không đảm bảo giữ nguyên thứ tự** gửi lên.
- **Xử lý lỗi cục bộ**: Nếu một vài request trong batch bị lỗi (ví dụ `invalid_request_error`), chỉ các item đó trả về `result.type === "errored"`; các item hợp lệ còn lại vẫn thành công bình thường.

```python
import anthropic

client = anthropic.Anthropic()

batch = client.messages.batches.create(
    requests=[
        {
            "custom_id": "ticket-1001",
            "params": {
                "model": "claude-haiku-4-5-20251001",
                "max_tokens": 256,
                "messages": [{"role": "user", "content": "Classify: Cannot reset password."}]
            }
        },
        {
            "custom_id": "ticket-1002",
            "params": {
                "model": "claude-haiku-4-5-20251001",
                "max_tokens": 256,
                "messages": [{"role": "user", "content": "Classify: Invoice #992 wrong total."}]
            }
        }
    ]
)
print("Batch ID:", batch.id, "Status:", batch.processing_status)
```

## 3. Bảng So sánh Quyết định Kiến trúc

| Tiêu chí | Real-time (No Stream) | Streaming (SSE) | Message Batches API |
| :--- | :--- | :--- | :--- |
| **Use Case** | API backend ngắn, tool call nhanh | Chatbot UI, code generation dài | Nightly jobs, evals, bulk classification |
| **TTFT** | Chờ toàn bộ output | Rất thấp (vài trăm ms) | Không áp dụng (SLA ≤ 24h) |
| **Chi phí** | 100% giá chuẩn | 100% giá chuẩn | **Giảm 50%** (input + output) |
| **Theo dõi kết quả** | Đồng bộ | Event stream (`text_delta`) | Poll `processing_status == "ended"` + đọc JSONL qua `custom_id` |

> **Exam Tip**: Nếu một câu hỏi nói về việc xử lý 50,000 bản ghi qua đêm với ngân sách hạn hẹp và kết quả trả về bị xáo trộn thứ tự, hãy chọn **Message Batches API** và đối chiếu kết quả bằng trường **`custom_id`**.

---

[← Bài trước](02-apps-integration-messages-api.md) | [Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/02-streaming-batches.md) | [Bài tiếp →](04-files-api-multimodal-vision-pdf.md)
