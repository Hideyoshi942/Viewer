# Cheatsheet 1: Messages API, Prompt Caching, Models & Stop Reasons

Tóm tắt nhanh các thông số, giới hạn và quy tắc quyết định cho **Domain 1 (33%)**, **Domain 2 (17%)**, **Domain 3 (15%)** và **Domain 4 (11%)** — chiếm **76% tổng điểm bài thi CCDV-F**.

## 1. Messages API & Batching

| Khái niệm | Thông số / Quy tắc vàng |
| :--- | :--- |
| **Stateless API** | `POST /v1/messages` không lưu lịch sử; client phải gửi lại mảng `messages` xen kẽ `user`/`assistant` |
| **`max_tokens`** | Tham số **bắt buộc**; kiểm soát độ dài tối đa của output |
| **Streaming SSE** | Thứ tự event: `message_start` → `content_block_start` → `content_block_delta` → `content_block_stop` → `message_delta` → `message_stop` |
| **Message Batches API** | Bất đồng bộ, SLA **≤ 24 giờ**, **giảm 50% chi phí**, tối đa **100,000 requests** hoặc **256 MB/batch** |
| **Token Counting** | `POST /v1/messages/count_tokens` — **miễn phí**, kiểm tra độ dài trước khi gửi request |

## 2. Xử lý Lỗi HTTP (Retry Decision Matrix)

| HTTP Code | Error Type | Có Retry không? | Hành động chuẩn |
| :--- | :--- | :--- | :--- |
| `400` | `invalid_request_error` | **KHÔNG** | Sửa JSON/schema/tham số đầu vào |
| `401` / `403` | `authentication_error` / `permission_error` | **KHÔNG** | Kiểm tra lại `ANTHROPIC_API_KEY` và quyền workspace |
| `404` | `not_found_error` | **KHÔNG** | Kiểm tra lại `model` ID hoặc `file_id` |
| `429` | `rate_limit_error` | **CÓ** | Đọc `retry-after` header + Exponential Backoff with Jitter |
| `500` / `529` | `api_error` / `overloaded_error` | **CÓ** | Exponential Backoff with Jitter (529 = quá tải tạm thời) |

## 3. Chọn Mô hình & Prompt Caching

- **Opus**: Suy luận cực sâu, kiến trúc phức tạp, debug khó (chi phí cao nhất).
- **Sonnet**: Cân bằng tối ưu trí tuệ/tốc độ/giá — **mặc định cho production** (coding, RAG, agents).
- **Haiku**: Nhanh nhất, rẻ nhất — phân loại, routing tầng đầu, moderation, trích xuất đơn giản.

### Quy tắc Prompt Caching (`cache_control: {"type": "ephemeral"}`)
- **Thứ tự prefix**: `tools` → `system` → `messages` (đặt nội dung tĩnh lên đầu, dữ liệu động xuống cuối).
- **Số breakpoint tối đa**: **4 breakpoints** mỗi request.
- **Ngưỡng tối thiểu**: **1,024 tokens** (Sonnet/Opus) hoặc **2,048 tokens** (Haiku).
- **Chi phí**: Ghi cache `+25%` (`cache_creation_input_tokens`); đọc cache **chỉ 10%** (`cache_read_input_tokens` — giảm 90%).
- **TTL**: Mặc định **5 phút** (auto-refresh khi hit), tùy chọn **1 giờ** (`"ttl": "1h"`).

## 4. `stop_reason` trong Agentic Loop & Extended Thinking

| `stop_reason` | Ý nghĩa | Xử lý của ứng dụng |
| :--- | :--- | :--- |
| `end_turn` | Hoàn tất tự nhiên | Thoát vòng lặp, trả kết quả cho user |
| `tool_use` | Cần chạy tool | Thực thi mọi `tool_use` block → gửi lại `tool_result` |
| `max_tokens` | Bị cắt ngang do chạm trần | Tăng `max_tokens` hoặc xử lý lỗi truncated JSON |
| `stop_sequence` | Chạm chuỗi dừng tùy chỉnh | Thoát vòng lặp |

- **Extended Thinking**: `thinking={"type": "enabled", "budget_tokens": N}` (`N >= 1024`, `N < max_tokens`).
  - Phải giữ nguyên `thinking` blocks (kèm `signature`) khi gửi `tool_result` trong cùng lượt.
  - Không dùng với `tool_choice` dạng `"tool"` hoặc `"any"`; giữ `temperature = 1.0`.
- **Structured Outputs**: Dùng `output_config.format` (`type: "json_schema"`) để đảm bảo 100% JSON hợp lệ theo schema.

---

[Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md)
