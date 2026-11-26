# Module 5: Model Selection (Opus/Sonnet/Haiku), Routing & Token Counting

**Domain 2 (Model Selection and Optimization)** chiếm **17% tổng điểm đề thi**. Việc chọn đúng dòng mô hình Claude cho từng bài toán không chỉ giúp tối ưu ngân sách gấp 10–20 lần mà còn cải thiện đáng kể độ trễ (latency) cho người dùng cuối.

## 1. So sánh 3 Dòng Mô hình Claude

| Dòng Model | Thế mạnh cốt lõi | Độ trễ & Chi phí | Use Case Tiêu biểu |
| :--- | :--- | :--- | :--- |
| **Claude Opus** | Suy luận sâu nhất, xử lý bài toán mơ hồ, kiến trúc hệ thống, research phức tạp | Chậm nhất / Chi phí cao nhất | Thiết kế kiến trúc, debug lỗi hệ thống cực khó, phân tích pháp lý/tài chính chuyên sâu |
| **Claude Sonnet** | Cân bằng tối ưu giữa trí tuệ, tốc độ và giá thành (**Default cho Production**) | Trung bình / Hợp lý | Coding assistants, RAG doanh nghiệp, Agentic workflows, trích xuất phức tạp |
| **Claude Haiku** | Phản hồi gần như tức thì, throughput cao | Nhanh nhất / Rẻ nhất | Phân loại ticket, moderation, routing tầng đầu, trích xuất dữ liệu đơn giản |

> **Exam Tip**: Khi đề bài mô tả một hệ thống xử lý hàng triệu lượt phân loại văn bản ngắn hoặc moderation với yêu cầu độ trễ dưới 1 giây và chi phí thấp nhất, đáp án luôn là **Claude Haiku**. Nếu bài toán là **coding agent hoặc RAG mặc định ở production**, chọn **Claude Sonnet**.

## 2. Kiến trúc Model Routing (Định tuyến Đa tầng)

Trong thực tế, không nhất thiết phải dùng một model duy nhất cho mọi request. **Model Routing** dùng một bước phân loại cực nhanh bằng **Haiku** ở tầng đầu để quyết định chuyển request tới model nào:
- **Yêu cầu đơn giản** (FAQ, chào hỏi, tra cứu cơ bản) → **Haiku** xử lý trực tiếp.
- **Yêu cầu tiêu chuẩn** (viết code, tổng hợp tài liệu RAG) → **Sonnet**.
- **Yêu cầu suy luận cực khó** (tổng hợp đa nguồn mâu thuẫn, lập kế hoạch chiến lược) → **Opus**.

```python
import anthropic

client = anthropic.Anthropic()

def route_and_answer(user_query: str) -> str:
    # Bước 1: Dùng Haiku phân loại độ phức tạp (nhanh & rẻ)
    router_res = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=10,
        temperature=0.0,
        system="Classify complexity as SIMPLE or COMPLEX. Reply with one word only.",
        messages=[{"role": "user", "content": user_query}]
    )
    tier = router_res.content[0].text.strip().upper()
    target_model = "claude-sonnet-4-20250514" if tier == "COMPLEX" else "claude-haiku-4-5-20251001"

    # Bước 2: Gọi model phù hợp
    final_res = client.messages.create(
        model=target_model,
        max_tokens=1024,
        messages=[{"role": "user", "content": user_query}]
    )
    return final_res.content[0].text
```

## 3. Token Counting API (`POST /v1/messages/count_tokens`)

Trước khi gửi một prompt lớn (kèm `system`, `tools`, tài liệu PDF hoặc lịch sử chat dài), bạn có thể gọi **Token Counting API** để biết chính xác số lượng `input_tokens` mà payload sẽ tiêu thụ.

### Đặc điểm quan trọng cần nhớ cho bài thi
- **Hoàn toàn miễn phí**: Không tính tiền token cho endpoint `/v1/messages/count_tokens` (chỉ áp dụng rate limit RPM riêng).
- **Độ chính xác tuyệt đối**: Tính cả token của `system`, `tools` (JSON Schema), `images`, `documents` và `messages` theo đúng tokenizer của model chỉ định.
- **Ứng dụng**: Kiểm tra xem prompt có vượt Context Window hay không để chủ động cắt tỉa (truncate/summarize) trước khi gửi `POST /v1/messages`, tránh lỗi `400 invalid_request_error` và tính toán chính xác chi phí dự kiến.

```python
token_count = client.messages.count_tokens(
    model="claude-sonnet-4-20250514",
    system="You are a legal assistant.",
    messages=[{"role": "user", "content": very_long_contract_text}]
)
print("Exact input tokens:", token_count.input_tokens)
```

> **Exam Tip**: Nếu đề bài hỏi làm sao kiểm tra chính xác số token của một payload gồm cả `tools` + `system` + PDF trước khi gửi để tránh lỗi tràn context window mà **không tốn chi phí inference**, đáp án là gọi **`client.messages.count_tokens(...)`** (`POST /v1/messages/count_tokens`).

---

[← Bài trước](05-error-handling-rate-limits-retries.md) | [Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/05-model-selection.md) | [Bài tiếp →](07-model-selection-prompt-caching.md)
