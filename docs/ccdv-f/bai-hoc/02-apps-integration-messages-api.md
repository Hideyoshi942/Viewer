# Domain 1: Tích hợp Ứng dụng với Claude Messages API, Streaming & Batching

Domain 1 chiếm **33% tỷ trọng đề thi CCDV-F** — phần lớn nhất toàn bài. Trọng tâm là khả năng xây dựng ứng dụng production ổn định với Messages API, xử lý hội thoại đa lượt, streaming, batching và khôi phục lỗi.

## 1. Kiến trúc Stateless của Messages API

Khác với các API quản lý session phía server, **Claude Messages API (`POST /v1/messages`) hoàn toàn stateless**. Ứng dụng của bạn phải tự lưu trữ lịch sử hội thoại và gửi lại mảng `messages` với các vai trò xen kẽ `user` và `assistant` ở mỗi request.

```python
import anthropic

client = anthropic.Anthropic()  # Tự động đọc ANTHROPIC_API_KEY từ env

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    system="You are a concise technical support engineer.",
    messages=[
        {"role": "user", "content": "What is HTTP 429?"},
        {"role": "assistant", "content": "HTTP 429 means Too Many Requests (rate limit exceeded)."},
        {"role": "user", "content": "How should my client handle it?"}
    ]
)
print(response.content[0].text)
```

| Tham số bắt buộc / cốt lõi | Ý nghĩa & Lưu ý Production |
| :--- | :--- |
| `model` | Chỉ định model ID chính xác (vd: `claude-sonnet-4-20250514`) |
| `max_tokens` | **Bắt buộc** ở mọi request; giới hạn số token sinh ra tối đa |
| `messages` | Mảng các turn `user`/`assistant`; turn đầu tiên phải là `user` |
| `system` | Tách biệt hướng dẫn hệ thống khỏi dữ liệu người dùng; hỗ trợ Prompt Caching |
| `temperature` | `0.0` (deterministic, trích xuất dữ liệu) → `1.0` (sáng tạo) |

> **Exam Tip**: Nếu đề bài hỏi cách duy trì ngữ cảnh qua nhiều lượt chat mà không dùng database phía Anthropic, đáp án đúng luôn là **ứng dụng tự lưu lịch sử và gửi lại toàn bộ mảng `messages` (hoặc bản tóm tắt) qua mỗi lần gọi `/v1/messages`**.

## 2. Streaming với Server-Sent Events (SSE)

Khi cần giảm **TTFT (Time To First Token)** cho giao diện chat hoặc tránh HTTP gateway timeout với output dài (`max_tokens` lớn), hãy bật `stream: true`. Messages API trả về chuỗi sự kiện SSE theo thứ tự chuẩn:

1. `message_start`: Chứa metadata ban đầu (`id`, `model`, `usage.input_tokens`).
2. `content_block_start`: Bắt đầu một block (`text`, `thinking`, hoặc `tool_use`).
3. `content_block_delta`: Các mảnh nội dung (`text_delta`, `thinking_delta`, `input_json_delta`).
4. `content_block_stop`: Kết thúc block hiện tại.
5. `message_delta`: Cập nhật `stop_reason` và `usage.output_tokens`.
6. `message_stop`: Kết thúc stream hoàn chỉnh.

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();
const stream = client.messages.stream({
  model: "claude-sonnet-4-20250514",
  max_tokens: 2048,
  messages: [{ role: "user", content: "Explain event-driven architecture." }],
});

stream.on("text", (text) => process.stdout.write(text));
const finalMessage = await stream.finalMessage();
```

## 3. Message Batches API vs Real-time API

| Tiêu chí | Messages API (Real-time) | Message Batches API (`/v1/messages/batches`) |
| :--- | :--- | :--- |
| **Độ trễ / SLA** | Vài giây (đồng bộ hoặc SSE) | Bất đồng bộ, xử lý trong **tối đa 24 giờ** (thường < 1h) |
| **Chi phí** | 100% giá chuẩn | **Giảm 50%** cả input và output tokens |
| **Quy mô** | 1 request / lần gọi | Lên đến **100,000 requests** hoặc **256 MB** mỗi batch |
| **Use case** | Chatbot, IDE copilot, API tương tác | Đánh giá model (Evals), phân loại dữ liệu đêm, tóm tắt tài liệu hàng loạt |

> **Exam Tip**: Bất cứ bài toán nào xử lý khối lượng lớn dữ liệu **không yêu cầu phản hồi tức thì** (như nightly classification, batch translation, offline evals), **Message Batches API** là lựa chọn tối ưu chi phí nhất (tiết kiệm 50%).

## 4. Xử lý Lỗi, Rate Limits & Đa phương thức (Vision / PDF)

Các mã lỗi quan trọng cần phân biệt khi thiết kế retry logic:
- **`400 invalid_request_error`**: Lỗi payload/schema — **KHÔNG retry**, phải sửa code/input.
- **`401 authentication_error` / `403 permission_error`**: Sai API key hoặc thiếu quyền — **KHÔNG retry**.
- **`429 rate_limit_error`**: Vượt RPM (Requests Per Minute) hoặc ITPM/OTPM (Tokens Per Minute). Đọc header `retry-after` và áp dụng **Exponential Backoff with Jitter**.
- **`529 overloaded_error`**: Hệ thống Anthropic quá tải tạm thời — **retry** với Exponential Backoff + Jitter.

Ngoài text, Messages API hỗ trợ **Vision** (ảnh JPEG/PNG/GIF/WebP dạng base64 hoặc URL) và **PDF native** (`document` block với `media_type: "application/pdf"`), cho phép Claude đọc cả văn bản lẫn biểu đồ trong trang PDF. Với file dùng lại nhiều lần qua nhiều request, sử dụng **Files API** để upload một lần và tham chiếu bằng `file_id` nhằm tiết kiệm băng thông.

---

[← Bài trước](01-messages-api-stateless.md) | [Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/01-messages-api.md) | [Bài tiếp →](03-streaming-sse-message-batches.md)
