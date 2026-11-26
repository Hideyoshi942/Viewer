# Domain 8: Cost & Latency Optimization at Scale (Caching, Routing, Batching)

Domain 8 chiếm **8% tỷ trọng đề thi CCDV-P**. Ở quy mô hàng triệu request mỗi ngày, sự khác biệt giữa kiến trúc tối ưu và kiến trúc ngây thơ có thể là **tiết kiệm 70–90% chi phí** và giảm **50–80% độ trễ TTFT**. Trọng tâm của miền này là tối ưu tỷ lệ trúng Prompt Cache, định tuyến model theo tầng, xử lý lô bất đồng bộ và điều tiết lưu lượng (TPM shaping).

## 1. Tối ưu Prompt Cache Hit Ratio

Prompt Caching giúp giảm **90% chi phí input tokens** cho phần prefix lặp lại và giảm mạnh **TTFT** (lên tới ~80% với context lớn). Tuy nhiên, rất nhiều hệ thống production bị **Cache Miss liên tục** do thiết kế sai thứ tự prompt.

### Quy tắc vàng: Strict Static-to-Dynamic Ordering
Cache hoạt động theo cơ chế **exact prefix matching** từ trên xuống dưới theo thứ tự:
1. **`tools`** (Danh sách tool definitions — tĩnh, đặt breakpoint ở cuối `tools` nếu cần)
2. **`system`** (System instructions — tĩnh)
3. **Static Context / Few-shot Examples / Knowledge Base** (Đặt `cache_control: {"type": "ephemeral"}` ở cuối phần tĩnh)
4. **Dynamic User Query & Conversation Turns mới nhất** (Đặt ở cuối cùng!)

### Các lỗi phổ biến làm hỏng Cache (Cache Busting)
- Chèn `current_timestamp` (`"Today is 2026-11-22 15:47:02"`) hoặc `request_id` ngẫu nhiên vào đầu `system` prompt → Mỗi giây là một prefix khác nhau, **0% cache hit**! (Giải pháp: chuyển thông tin động xuống cuối trong `user` message).
- Thay đổi thứ tự mảng `tools` động giữa các request (ví dụ sort không nhất quán).
- Quên ngưỡng tối thiểu: Mỗi cacheable prefix phải đạt kích thước tối thiểu (**1,024 tokens** cho Sonnet/Opus, **2,048 tokens** cho Haiku) và TTL mặc định là **5 phút** (được làm mới mỗi lần cache hit; có tùy chọn TTL **1 giờ** cho workload thưa hơn).

```python
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": LARGE_STATIC_SYSTEM_AND_POLICY_DOCS,  # >= 1024 tokens, không chứa timestamp động
            "cache_control": {"type": "ephemeral"},
        }
    ],
    messages=[
        {
            "role": "user",
            "content": f"[Timestamp: {now_iso}]\nUser question: {user_query}",
        }
    ],
)
```

## 2. Semantic & Tiered Model Routing (Haiku → Sonnet → Opus)

Không phải request nào cũng cần model đắt nhất và chậm nhất. **Tiered Routing** phân luồng dựa trên độ phức tạp:

| Tầng Model | Đặc trưng | Use Case tối ưu |
| :--- | :--- | :--- |
| **Claude Haiku** | Độ trễ cực thấp, giá rẻ nhất | Phân loại intent (router), trích xuất thực thể đơn giản, guardrail classifier, Contextual Retrieval indexing |
| **Claude Sonnet** | Cân bằng tối ưu trí tuệ / tốc độ / chi phí | Mặc định cho 80% tác vụ production: RAG Q&A, coding assistant, tool-use agents |
| **Claude Opus** | Suy luận sâu nhất, chi phí cao nhất | Kiến trúc hệ thống phức tạp, phân tích pháp lý/tài chính chuyên sâu, giải quyết bug khó mà Sonnet thất bại |

- **Cascading / Escalation Routing**: Thử xử lý bằng Haiku (hoặc Sonnet) trước; nếu độ tin cậy thấp hoặc validator báo fail → tự động escalate lên Sonnet/Opus.
- **Semantic Caching**: Với các câu hỏi FAQ lặp lại nhiều (khác câu chữ một chút), dùng embedding similarity (> 0.96) tra Redis/Vector Cache để trả lời tức thì với **0 token LLM** (chỉ áp dụng cho dữ liệu công khai, không áp dụng cho dữ liệu cá nhân hóa theo user).

## 3. Message Batches API (Giảm 50% chi phí cho Offline Workloads)

Với các tác vụ **không yêu cầu phản hồi thời gian thực (real-time)**:
- Chạy bộ Evaluation / Regression testing ban đêm.
- Phân loại, gắn nhãn, tóm tắt hàng trăm nghìn tài liệu hoặc log.
- Sinh dữ liệu tổng hợp (synthetic data).

**Thông số chuẩn của Message Batches API**:
- **Giảm 50% chi phí** cho cả input và output tokens (có thể kết hợp với Prompt Caching để giảm sâu hơn nữa).
- SLA hoàn thành trong **≤ 24 giờ** (thường nhanh hơn nhiều).
- Giới hạn mỗi batch: tối đa **100,000 requests** hoặc **256 MB**.

## 4. Token Budgeting, Context Compaction & Rate-Limit (TPM) Shaping

### 4.1 Token Budgeting & Context Compaction
- Dùng `POST /v1/messages/count_tokens` (miễn phí) để đo trước kích thước prompt, tránh gửi request vượt context window.
- **Context Compaction**: Khi lịch sử hội thoại vượt ngưỡng (ví dụ 60% budget), kích hoạt tác vụ nền dùng Haiku tóm tắt các lượt cũ thành `<conversation_summary>`, giữ nguyên 3–5 lượt gần nhất để bảo toàn ngữ cảnh tức thời và tránh **Context Rot**.

### 4.2 Rate-Limit & TPM Shaping (Chống lỗi 429 ở quy mô lớn)
Anthropic áp dụng giới hạn theo **RPM** (Requests Per Minute), **ITPM** (Input Tokens Per Minute — lưu ý token đọc từ cache `cache_read_input_tokens` thường được tính ưu đãi/tách riêng tùy tier) và **OTPM** (Output Tokens Per Minute).
- **Token Bucket / Distributed Rate Limiter (Redis)**: Điều tiết tốc độ gửi request từ các worker theo ngân sách token ước tính trước khi gọi API.
- **Adaptive Concurrency (AIMD)**: Tăng dần số worker song song khi không có lỗi, và giảm một nửa ngay lập tức khi gặp `429`.
- **Smooth Traffic**: Tránh cron job bắn 10,000 request cùng lúc vào giây `:00` của phút; rải đều (jitter/pacing) hoặc đẩy qua Message Batches API.

> [!TIP]
> **Exam Tip (CCDV-P):**
> 1. Hệ thống có `cache_read_input_tokens == 0` dù đã gắn `cache_control: {"type": "ephemeral"}` → Kiểm tra 3 nguyên nhân: (a) Chèn timestamp/UUID động vào `system` prompt, (b) Prefix dưới ngưỡng tối thiểu (1,024 / 2,048 tokens), hoặc (c) Khoảng cách giữa các request vượt TTL 5 phút.
> 2. Cần chạy phân tích 50,000 hồ sơ khách hàng mỗi đêm với chi phí thấp nhất → **Message Batches API** (giảm 50% chi phí, SLA ≤ 24h).
> 3. Giảm chi phí và độ trễ cho hệ thống có 70% câu hỏi đơn giản, 25% trung bình, 5% phức tạp → **Tiered Model Routing** (Haiku classifier router → Haiku/Sonnet/Opus).

---

[← Bài trước](14-fleet-worktrees.md) | [Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/15-cost-latency.md) | [Bài tiếp →](16-scale-batching.md)
