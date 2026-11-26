# Module 4: Error Handling, Rate Limits & Retry Strategies

Một ứng dụng AI đạt chuẩn production phải biết cách phân biệt **lỗi có thể thử lại (transient errors)** và **lỗi logic/cấu hình không được thử lại (permanent errors)**, đồng thời tuân thủ nghiêm ngặt cơ chế **Rate Limits** của Anthropic.

## 1. Ma trận Quyết định Xử lý Lỗi HTTP

Khi gọi Messages API gặp lỗi, HTTP status code và trường `error.type` trong JSON response quyết định hành động tiếp theo của client:

| HTTP Code | Error Type | Retry? | Nguyên nhân & Cách xử lý chuẩn |
| :--- | :--- | :--- | :--- |
| **`400`** | `invalid_request_error` | **KHÔNG** | Sai cấu trúc JSON, thiếu `max_tokens`, `messages` không xen kẽ `user`/`assistant`, vượt context window. Phải sửa code/payload. |
| **`401`** | `authentication_error` | **KHÔNG** | `ANTHROPIC_API_KEY` sai, hết hạn hoặc bị thu hồi. |
| **`403`** | `permission_error` | **KHÔNG** | API key không có quyền truy cập workspace/model được chỉ định. |
| **`404`** | `not_found_error` | **KHÔNG** | Sai `model` ID, `file_id`, hoặc `batch_id` không tồn tại. |
| **`413`** | `request_too_large` | **KHÔNG** | Payload vượt giới hạn kích thước HTTP request (cần thu nhỏ hoặc dùng Files API). |
| **`429`** | `rate_limit_error` | **CÓ** | Vượt ngưỡng RPM, ITPM hoặc OTPM. Đọc header `retry-after` và retry có backoff. |
| **`500`** | `api_error` | **CÓ** | Lỗi nội bộ tạm thời phía server Anthropic. |
| **`529`** | `overloaded_error` | **CÓ** | Hệ thống Anthropic đang quá tải tạm thời do lưu lượng tăng đột biến. |

> **Exam Tip**: Tuyệt đối **không retry** lỗi `400 invalid_request_error` hoặc `401/403` vì có thử lại 100 lần cũng vẫn thất bại và chỉ làm lãng phí tài nguyên. Chỉ retry **`429`**, **`500`** và **`529`**.

## 2. Cơ chế Rate Limits (RPM, ITPM, OTPM) & Token Bucket

Anthropic áp dụng giới hạn lưu lượng theo **thuật toán Token Bucket** (làm đầy liên tục theo giây chứ không reset đột ngột theo phút) trên 3 chiều độc lập:
- **RPM (Requests Per Minute)**: Số request tối đa mỗi phút.
- **ITPM (Input Tokens Per Minute)**: Số input tokens tối đa mỗi phút (lưu ý: `cache_read_input_tokens` thường **không** tính vào hạn mức ITPM ở nhiều tier, giúp tăng thông lượng thực tế khi dùng Prompt Caching!).
- **OTPM (Output Tokens Per Minute)**: Số output tokens tối đa mỗi phút.

Khi nhận lỗi `429`, response luôn đi kèm các header quan trọng:
- `retry-after`: Số giây client nên chờ trước khi gửi lại request.
- `anthropic-ratelimit-requests-remaining`, `anthropic-ratelimit-tokens-remaining`: Số lượng còn lại trong bucket.

## 3. Chiến lược Retry: Exponential Backoff with Jitter

Nếu hàng trăm worker cùng gặp `429` hoặc `529` và cùng retry sau đúng 2 giây, chúng sẽ tạo ra hiệu ứng **Thundering Herd** làm server càng quá tải. Giải pháp chuẩn là **Exponential Backoff with Jitter**:

```python
import random
import time
import anthropic

client = anthropic.Anthropic(max_retries=0)  # Tự quản lý retry để minh họa logic

def call_claude_with_backoff(messages, max_attempts=5):
    for attempt in range(max_attempts):
        try:
            return client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                messages=messages,
            )
        except anthropic.RateLimitError as e:
            # Ưu tiên đọc header retry-after nếu có
            retry_after = e.response.headers.get("retry-after")
            base_delay = float(retry_after) if retry_after else (2 ** attempt)
            jitter = random.uniform(0, 0.5 * base_delay)
            time.sleep(base_delay + jitter)
        except anthropic.APIStatusError as e:
            if e.status_code in (500, 529):
                delay = (2 ** attempt) + random.uniform(0, 1.0)
                time.sleep(delay)
            else:
                raise  # 400, 401, 403, 404 -> Không retry!
    raise RuntimeError("Exceeded max retry attempts")
```

> **Exam Tip**: Anthropic Python và TypeScript SDK mặc định đã tích hợp sẵn retry (mặc định `max_retries=2`) với Exponential Backoff + Jitter cho `429`, `500`, `529` và tự động tôn trọng `retry-after`. Với hệ thống tải cao, bạn có thể tăng `max_retries` hoặc kết hợp queue (như SQS/BullMQ) + fallback model.

---

[← Bài trước](04-files-api-multimodal-vision-pdf.md) | [Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/04-error-handling-retries.md) | [Bài tiếp →](06-model-selection-routing-token-counting.md)
