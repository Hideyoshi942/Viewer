# Module 10: Extended Thinking & Context Window Management

Khi giải quyết các bài toán suy luận nhiều bước (toán học, debug phức tạp, phân tích mã nguồn lớn), việc cho phép Claude "suy nghĩ" trước khi trả lời thông qua **Extended Thinking** giúp tăng vượt trội độ chính xác. Đồng thời, quản lý **Context Window** hiệu quả giúp tránh suy giảm chất lượng (*Context Rot*) khi hội thoại kéo dài.

## 1. Cấu hình Extended Thinking (`thinking`)

Bạn kích hoạt Extended Thinking bằng cách truyền tham số `thinking` với `budget_tokens`:

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=8192,
    thinking={
        "type": "enabled",
        "budget_tokens": 4096  # BẮT BUỘC nhỏ hơn max_tokens
    },
    messages=[
        {"role": "user", "content": "Find the race condition in this distributed lock algorithm..."}
    ]
)

for block in response.content:
    if block.type == "thinking":
        print("[Thinking]:", block.thinking[:120], "...")
    elif block.type == "text":
        print("[Answer]:", block.text)
```

### Các Quy tắc API Bắt buộc của Extended Thinking
1. **`budget_tokens < max_tokens`**: Giá trị `budget_tokens` (tối thiểu `1024`) **luôn phải nhỏ hơn `max_tokens`**, vì `max_tokens` bao gồm cả thinking tokens và text output tokens.
2. **Ràng buộc `temperature`**: Khi bật Extended Thinking, `temperature` **bắt buộc phải là `1.0`** (mặc định) — không được đặt `temperature=0.0` hoặc chỉnh `top_k`.
3. **Tính phí**: Thinking tokens được tính phí như **output tokens** (kể cả phần tóm tắt thinking).

## 2. Extended Thinking Kết hợp với Tool Use (Quy tắc Signature!)

Đây là câu hỏi "bẫy" kinh điển trong đề thi CCDV-F:
Khi Claude bật Extended Thinking và trả về `stop_reason == "tool_use"`, mảng `response.content` sẽ chứa cả **`thinking` block (kèm trường `signature` mã hóa)** và **`tool_use` block**.

- Ở lượt tiếp theo khi gửi `tool_result` lên, ứng dụng **BẮT BUỘC phải giữ nguyên toàn bộ `thinking` block (kèm nguyên vẹn `signature`)** trong message `assistant` trước đó!
- **Tuyệt đối không** xóa bỏ, cắt ngắn hoặc tự ý chỉnh sửa nội dung `thinking` block; nếu sửa hoặc bỏ sót, API sẽ trả về lỗi `400 invalid_request_error` (vì chữ ký `signature` không khớp hoặc mất chuỗi suy luận liên tục).

> **Exam Tip**: Khi dùng Extended Thinking với Tool Use trong Agentic Loop, hãy truyền lại nguyên vẹn `response.content` (bao gồm cả `thinking` block + `signature` và `tool_use` block) vào mảng `messages` ở bước `assistant` trước khi nối `tool_result`.

## 3. Quản lý Context Window & Context Engineering

Mặc dù Claude hỗ trợ Context Window lớn (200K+ tokens), việc nhồi nhét quá nhiều thông tin nhiễu sẽ gây **Context Rot** (giảm độ chính xác, tăng độ trễ và chi phí). Các kỹ thuật quản lý chuẩn gồm:
- **RAG Reranking & Filtering**: Thay vì nhét toàn bộ 25–50 chunks từ vector search vào prompt, hãy dùng **Reranker** lọc lấy top 3–5 chunks liên quan nhất.
- **Conversation Compaction (Tóm tắt lịch sử)**: Khi hội thoại vượt ngưỡng (ví dụ 70% context), tóm tắt các lượt chat cũ thành một block `<conversation_summary>` và chỉ giữ nguyên vẹn các lượt gần nhất.
- **Tool Result Trimming**: Cắt gọn hoặc lưu ra file các `tool_result` quá dài (như log hàng nghìn dòng) trước khi đưa lại vào context.

---

[← Bài trước](13-prompt-context-structured-outputs.md) | [Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/10-extended-thinking.md) | [Bài tiếp →](15-tool-use-schema-parallel-execution.md)
