# Domain 2: Lựa chọn Mô hình Claude, Prompt Caching & Tối ưu Chi phí/Độ trễ

Domain 2 chiếm **17% đề thi CCDV-F**. Bạn cần nắm vững cách chọn đúng dòng mô hình Claude cho từng bài toán, tận dụng Prompt Caching để giảm độ trễ và chi phí, cũng như thiết kế chiến lược Model Routing.

## 1. Hệ sinh thái Mô hình Claude (Opus, Sonnet, Haiku)

| Dòng mô hình | Điểm mạnh cốt lõi | Độ trễ & Chi phí | Use Case điển hình |
| :--- | :--- | :--- | :--- |
| **Claude Opus** | Suy luận sâu nhất, lập trình phức tạp, tác vụ agent dài | Cao nhất | Kiến trúc hệ thống, debug phức tạp, phân tích tài chính/pháp lý chuyên sâu |
| **Claude Sonnet** | Cân bằng tối ưu giữa trí tuệ, tốc độ và chi phí | Trung bình | **Mặc định cho hầu hết ứng dụng production**: coding, RAG, agents, phân tích dữ liệu |
| **Claude Haiku** | Nhanh nhất, chi phí thấp nhất, throughput cực cao | Thấp nhất | Phân loại (classification), trích xuất đơn giản, moderation, routing tầng đầu |

> **Exam Tip**: Khi câu hỏi yêu cầu "cân bằng tốt nhất giữa độ chính xác và chi phí cho ứng dụng doanh nghiệp tổng quát", chọn **Sonnet**. Khi yêu cầu "độ trễ cực thấp (sub-second) và chi phí tối thiểu cho phân loại/routing khối lượng lớn", chọn **Haiku**.

## 2. Prompt Caching — Giảm tới 90% Chi phí Input & Giảm 85% TTFT

Prompt Caching cho phép lưu trữ phần tiền tố (prefix) tĩnh của prompt trên hạ tầng Anthropic để tái sử dụng qua nhiều request liên tiếp.

### Cơ chế hoạt động cốt lõi
1. **Prefix Matching (Khớp tiền tố chính xác)**: Cache key được tính từ đầu request theo thứ tự: `tools` → `system` → `messages`. Bất kỳ thay đổi nhỏ nào ở phần trước breakpoint đều làm **cache miss** toàn bộ phần sau.
2. **Cache Breakpoints (`cache_control`)**: Đánh dấu tối đa **4 breakpoints** bằng `{"type": "ephemeral"}`.
3. **Ngưỡng token tối thiểu**: Nội dung trước breakpoint phải đạt tối thiểu **1,024 tokens** (đối với Sonnet/Opus) hoặc **2,048 tokens** (đối với Haiku) thì cache mới được kích hoạt.
4. **TTL (Time-To-Live)**: Mặc định **5 phút** (được làm mới mỗi khi có cache hit); hỗ trợ tùy chọn **1 giờ** (`"ttl": "1h"`) cho tác vụ thưa hơn.

```python
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": "You are a legal analyst. Here is the 50-page compliance manual: ...",
            "cache_control": {"type": "ephemeral"}  # Đặt nội dung tĩnh ở đầu
        }
    ],
    messages=[
        {"role": "user", "content": "Does section 4.2 allow third-party sub-processors?"}
    ]
)
# Kiểm tra hiệu quả qua response.usage:
# cache_creation_input_tokens (lần đầu ghi cache: +25% giá)
# cache_read_input_tokens (các lần sau đọc cache: chỉ 10% giá = giảm 90%)
```

> **Exam Tip**: Thứ tự đặt nội dung trong prompt **rất quan trọng**: luôn đặt `tools` cố định, `system` prompt dài, và tài liệu tham chiếu tĩnh **lên trước**; đặt câu hỏi động của người dùng, timestamp, hoặc session ID **ở cuối cùng** để tối đa hóa tỷ lệ cache hit.

## 3. Chiến lược Tối ưu Chi phí & Độ trễ

- **Model Routing (Cascading)**: Dùng **Haiku** làm bộ phân loại (router) ở tầng đầu. Nếu câu hỏi đơn giản → Haiku trả lời trực tiếp; nếu phức tạp → chuyển tiếp sang **Sonnet** hoặc **Opus**.
- **Token Counting API (`POST /v1/messages/count_tokens`)**: Đếm chính xác số input tokens **miễn phí** trước khi gọi `messages.create`, giúp kiểm tra xem prompt có vượt context window hay đủ ngưỡng 1,024 tokens cho Prompt Caching không.
- **Kết hợp Batching + Caching**: Có thể dùng Prompt Caching ngay trong **Message Batches API** để cộng hưởng mức giảm giá khi xử lý hàng loạt câu hỏi trên cùng một bộ tài liệu lớn.
- **Giới hạn `max_tokens` hợp lý**: Đặt `max_tokens` sát nhu cầu thực tế và dùng `stop_sequences` để tránh mô hình sinh thừa token không cần thiết.

---

[← Bài trước](06-model-selection-routing-token-counting.md) | [Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/05-model-selection.md) | [Bài tiếp →](08-prompt-caching-cost-optimization.md)
