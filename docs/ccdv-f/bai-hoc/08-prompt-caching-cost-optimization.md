# Module 6: Prompt Caching & Cost/Latency Optimization

**Prompt Caching** là một trong những chủ đề có tần suất xuất hiện cao nhất trong **Domain 2 (17%)** của kỳ thi CCDV-F. Khi ứng dụng thường xuyên gửi lặp lại một lượng lớn ngữ cảnh tĩnh (System Prompt dài, hàng chục định nghĩa Tools, tài liệu tham khảo hoặc codebase), Prompt Caching giúp **giảm tới 90% chi phí input tokens** và **giảm đáng kể TTFT (độ trễ)**.

## 1. Cơ chế `cache_control: {"type": "ephemeral"}` & Chi phí

Để đánh dấu một block cần cache, bạn thêm `"cache_control": {"type": "ephemeral"}` vào cuối block đó.

| Loại Token Usage | Ý nghĩa | Tỷ lệ Giá (so với Base Input) |
| :--- | :--- | :--- |
| `input_tokens` | Phần nội dung mới, không nằm trong cache | `1.0x` (100%) |
| `cache_creation_input_tokens` | Ghi cache lần đầu (Cache Write) — TTL 5 phút | `1.25x` (đắt hơn 25% ở lần đầu) |
| `cache_read_input_tokens` | Đọc lại từ cache (Cache Hit) | **`0.1x`** (**rẻ hơn 90%!**) |

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": "...(Large 5,000-token API documentation & coding guidelines)...",
            "cache_control": {"type": "ephemeral"}  # Đặt breakpoint ở cuối phần tĩnh
        }
    ],
    messages=[
        {"role": "user", "content": "How do I authenticate with OAuth 2.1?"}
    ]
)

print(response.usage)
# Lần 1: cache_creation_input_tokens > 0, cache_read_input_tokens = 0
# Lần 2 (trong 5 phút): cache_creation_input_tokens = 0, cache_read_input_tokens > 0
```

## 2. Quy tắc Bắt buộc để Đạt Cache Hit (Prefix Matching)

Prompt Caching hoạt động theo cơ chế **Exact Prefix Matching** (khớp chính xác phần tiền tố từ đầu request trở xuống):

1. **Thứ tự đánh giá cố định**: `tools` → `system` → `messages`.
   - Nếu bạn thay đổi dù chỉ 1 ký tự trong `tools`, toàn bộ cache ở `system` và `messages` phía sau sẽ bị **vô hiệu hóa (cache miss)**!
   - **Best Practice**: Đặt toàn bộ nội dung **tĩnh** (tools, system instructions, tài liệu gốc) lên **đầu**; đặt dữ liệu **động** (user query, timestamp, session ID) xuống **cuối**.
2. **Giới hạn Breakpoint**: Tối đa **4 `cache_control` breakpoints** trong một request.
3. **Ngưỡng Token Tối thiểu**:
   - **Claude Opus / Sonnet**: Tối thiểu **1,024 tokens** tại breakpoint để cache được kích hoạt.
   - **Claude Haiku**: Tối thiểu **2,048 tokens** (tùy phiên bản Haiku, thường là 2048 tokens cho Haiku 3.5/4.5).
   - Nếu block nhỏ hơn ngưỡng tối thiểu, API vẫn chạy bình thường nhưng **không tạo cache** (`cache_creation_input_tokens = 0`).

> **Exam Tip**: Nếu đề bài hỏi tại sao một developer đã gắn `cache_control: {"type": "ephemeral"}` vào system prompt 600 tokens mà `cache_creation_input_tokens` vẫn bằng `0`, đáp án là **chưa đạt ngưỡng token tối thiểu (1,024 tokens cho Sonnet/Opus hoặc 2,048 tokens cho Haiku)**.

## 3. TTL 5 phút vs 1 giờ & Cache Refresh

- **Mặc định (TTL 5 phút)**: Cache tồn tại 5 phút kể từ lần truy cập gần nhất. Mỗi lần có **Cache Hit**, TTL lại được **làm mới (refresh) thêm 5 phút** miễn phí.
- **Extended TTL 1 giờ (`"ttl": "1h"`)**: Phù hợp khi các burst request cách nhau từ 10–45 phút (lâu hơn 5 phút), giúp tránh phải trả phí Cache Write nhiều lần trong ngày (lưu ý phí write cho TTL 1h cao hơn TTL 5m — `2.0x` base input).

## 4. Các Lỗi Phổ biến Gây Cache Miss
- Chèn **timestamp động** (ví dụ `Current time: 14:32:05`) hoặc `request_id` vào `system` prompt.
- Thay đổi thứ tự các phần tử trong mảng `tools` giữa các request.
- Bật/tắt `tools` bằng cách xóa mảng `tools` ở lượt cuối thay vì giữ nguyên `tools` và đặt `tool_choice: {"type": "none"}`.

> **Exam Tip**: Khi muốn cấm Claude gọi tool ở lượt tổng hợp cuối cùng mà **không làm mất Prompt Cache**, hãy giữ nguyên mảng `tools` và truyền `tool_choice: {"type": "none"}`.

---

[← Bài trước](07-model-selection-prompt-caching.md) | [Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/06-prompt-caching.md) | [Bài tiếp →](09-agentic-workflows-stop-reason-loop.md)
