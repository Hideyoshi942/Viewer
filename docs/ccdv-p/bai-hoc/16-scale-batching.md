# Chủ đề 16: Message Batches API, Context Compaction & TPM/Rate-Limit Shaping

Trong **Domain 8 (8%)**, bên cạnh Prompt Caching và Tiered Model Routing (Chủ đề 15), việc vận hành hệ thống ở quy mô hàng triệu tokens/phút đòi hỏi kỹ năng xử lý khối lượng lớn bất đồng bộ (**Message Batches API**), kiểm soát tăng trưởng ngữ cảnh (**Context Compaction**) và điều tiết lưu lượng phân tán (**TPM/Rate-Limit Shaping**).

## 1. Message Batches API: Giảm 50% Chi phí cho Async Workloads

Với các tác vụ không cần phản hồi tức thì cho người dùng cuối (Nightly Evals, phân loại hàng loạt, trích xuất dữ liệu từ hàng trăm nghìn tài liệu, tạo Contextual Retrieval chunks), gọi `messages.create()` đồng bộ vừa đắt vừa dễ chạm ngưỡng RPM/TPM.

### Thông số kỹ thuật & Vòng đời Batch
- **Chi phí**: **Giảm 50%** giá cả Input và Output tokens (có thể kết hợp thêm với Prompt Caching nếu các request trong batch dùng chung static prefix).
- **SLA**: Hoàn tất trong vòng **≤ 24 giờ** (thực tế thường nhanh hơn nhiều).
- **Giới hạn**: Tối đa **100,000 requests** hoặc **256 MB** dung lượng payload cho mỗi batch.
- **Tracking**: Mỗi item trong batch bắt buộc có `custom_id` duy nhất để khớp kết quả khi tải file `.jsonl` đầu ra (vì thứ tự trả về không đảm bảo giống thứ tự gửi lên).

```python
import anthropic

client = anthropic.Anthropic()

batch = client.messages.batches.create(
    requests=[
        {
            "custom_id": f"ticket-{item['id']}",
            "params": {
                "model": "claude-haiku-4-5-20251001",
                "max_tokens": 256,
                "messages": [{"role": "user", "content": f"Classify ticket: {item['text']}"}],
            },
        }
        for item in tickets_list
    ]
)
print("Batch ID:", batch.id, "Status:", batch.processing_status)
```

## 2. Token Budgeting & Context Compaction

Trong các phiên agent hoặc chatbot kéo dài hàng chục lượt, chi phí input tokens tăng theo cấp số nhân ($O(N^2)$) vì mỗi lượt mới đều phải gửi lại toàn bộ lịch sử cũ.

### Quy trình Context Compaction chuẩn
1. **Pre-flight Token Counting**: Gọi `client.messages.count_tokens()` (**miễn phí**) để kiểm tra chính xác số token trước khi gửi request.
2. **Ngưỡng kích hoạt (Compaction Threshold)**: Khi lịch sử vượt quá 60–70% ngân sách token (ví dụ > 40,000 tokens), kích hoạt compaction:
   - Giữ nguyên `system` prompt và **3–5 lượt hội thoại gần nhất** (sliding window) để bảo toàn ngữ cảnh tức thời.
   - Dùng **Claude Haiku** tóm tắt toàn bộ các lượt cũ hơn thành một khối `<conversation_summary>` súc tích (giữ lại quyết định đã chốt, ID thực thể, trạng thái công việc), loại bỏ các raw tool output khổng lồ đã xử lý xong.
   - *Lưu ý Cache*: Không sửa đổi phần `system` tĩnh phía trên để vẫn giữ được Prompt Cache hit!

## 3. TPM / RPM Rate-Limit Shaping ở Quy mô Phân tán

Anthropic áp dụng giới hạn theo **RPM** (Requests Per Minute), **ITPM** (Input Tokens Per Minute) và **OTPM** (Output Tokens Per Minute). Khi có 50 workers chạy song song, nếu không điều tiết lưu lượng (traffic shaping), hệ thống sẽ liên tục dính lỗi `429` và lãng phí thời gian retry.

### Ba kỹ thuật Shaping thiết yếu
1. **Distributed Token Bucket (Redis)**: Trước khi worker gọi Claude, nó ước lượng `estimated_input_tokens` (qua `count_tokens` hoặc heuristic) + `max_tokens` để xin cấp phát (acquire) từ Token Bucket dùng chung trong Redis. Nếu cạn bucket, worker chờ nhẹ nhàng ở local thay vì bắn request gây `429`.
2. **Adaptive Concurrency (AIMD — Additive Increase, Multiplicative Decrease)**:
   - Khi các request thành công liên tiếp → tăng dần giới hạn concurrency (`+1`).
   - Ngay khi nhận `429` hoặc `529` → giảm một nửa concurrency (`concurrency // 2`) và tôn trọng `retry-after`.
3. **Cron Jitter & Pacing**: Không bao giờ lên lịch cron job bắn 5,000 requests đồng loạt vào giây `:00` của mỗi giờ; hãy rải đều bằng random delay hoặc đẩy qua Message Batches API.

> [!TIP]
> **Exam Tip (CCDV-P):**
> 1. Cần xử lý 80,000 tài liệu qua đêm để gắn nhãn phân loại với ngân sách tối thiểu → Dùng **Message Batches API** (giảm 50% chi phí, giới hạn 100,000 requests / 256 MB, SLA ≤ 24h, dùng `custom_id` để map kết quả).
> 2. Làm sao kiểm tra trước xem prompt có vượt context window hoặc ngân sách token không mà không tốn tiền API? → Dùng **`POST /v1/messages/count_tokens`** (miễn phí).
> 3. Cuộc hội thoại agent kéo dài làm chi phí tăng theo $O(N^2)$ và xuất hiện Context Rot → Áp dụng **Context Compaction** (tóm tắt lượt cũ bằng Haiku, giữ nguyên sliding window gần nhất và giữ nguyên static prefix để không phá Prompt Cache).

---

[← Bài trước](15-cost-latency-optimization.md) | [Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/16-scale-batching.md)
