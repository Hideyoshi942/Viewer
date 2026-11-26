# Chủ đề 6: Production Telemetry Dashboards (TTFT, TPOT, Cache Hit Ratio & Audit Logs)

Nếu **Chủ đề 5** tập trung vào cách gắn OpenTelemetry Span và truyền `traceparent` xuyên suốt hệ thống phân tán, thì **Chủ đề 6 (Domain 3 - 12%)** tập trung vào việc biến dữ liệu thô đó thành **các chỉ số vận hành (SLIs/SLOs)**, **Dashboard cảnh báo sớm** và **Structured Audit Logs** đạt chuẩn tuân thủ doanh nghiệp.

## 1. Đo lường chính xác Độ trễ Streaming (TTFT, ITL, TPOT)

Với ứng dụng tương tác thời gian thực (`stream=True`), tổng thời gian E2E không phản ánh đúng trải nghiệm người dùng. Một câu trả lời dài 1,000 tokens mất 12 giây nhưng chữ đầu tiên hiện ra sau 0.4 giây sẽ tạo cảm giác rất nhanh, ngược lại nếu chờ 6 giây mới thấy chữ đầu tiên sẽ khiến người dùng thoát trang.

| Chỉ số | Công thức tính chính xác | Ngưỡng cảnh báo & Nguyên nhân gốc |
| :--- | :--- | :--- |
| **TTFT** (Time to First Token) | `t(first_content_block_delta) - t(request_sent)` | Tăng cao khi input prompt quá dài chưa trúng cache, cold-start connection, hoặc hàng đợi upstream bị nghẽn |
| **ITL** (Inter-Token Latency) | `t(delta[i]) - t(delta[i-1])` (theo dõi phân vị P95/P99) | ITL giật cục (jitter cao) báo hiệu model serving bị bão hòa tải hoặc network packet loss |
| **TPOT** (Time Per Output Token) | `(t(message_stop) - t(first_delta)) / max(1, output_tokens - 1)` | Phản ánh tốc độ sinh token thuần túy của model (Haiku < Sonnet < Opus) |

```python
import time

def stream_with_telemetry(client, **kwargs):
    t_start = time.perf_counter()
    t_first_token = None
    prev_token_t = None
    itl_samples_ms = []

    with client.messages.stream(**kwargs) as stream:
        for text in stream.text_stream:
            now = time.perf_counter()
            if t_first_token is None:
                t_first_token = now
            elif prev_token_t is not None:
                itl_samples_ms.append((now - prev_token_t) * 1000.0)
            prev_token_t = now
            yield text

        final_msg = stream.get_final_message()
        t_end = time.perf_counter()

        ttft_ms = ((t_first_token or t_end) - t_start) * 1000.0
        out_tokens = final_msg.usage.output_tokens
        tpot_ms = ((t_end - (t_first_token or t_end)) * 1000.0) / max(1, out_tokens - 1)
        emit_metrics(ttft_ms=ttft_ms, tpot_ms=tpot_ms, itl_p95=percentile(itl_samples_ms, 95))
```

## 2. Cache Hit Ratio & Token Economics Dashboards

Một dashboard tài chính/hiệu năng chuẩn production cần theo dõi theo chiều `tenant_id`, `model`, `prompt_version` và `environment`:

- **Prompt Cache Hit Ratio**:
  $$\text{Cache Hit Ratio} = \frac{\text{cache\_read\_input\_tokens}}{\text{input\_tokens} + \text{cache\_read\_input\_tokens} + \text{cache\_creation\_input\_tokens}}$$
  *Cảnh báo*: Nếu chỉ số này đột ngột rơi từ 85% xuống < 10% sau một lần deploy → gần như chắc chắn có developer vô tình chèn dữ liệu động (timestamp/UUID) vào phần `system` prefix!
- **Truncation Rate**: Tỷ lệ request có `stop_reason == "max_tokens"`. Nếu vượt > 1–2%, cần tăng `max_tokens` hoặc kiểm tra prompt sinh output quá dài.
- **Cost-per-Task & Cost-per-Tenant**: Tính tổng chi phí theo từng `tenant_id` (tách riêng giá `input`, `cache_write`, `cache_read` giảm 90%, và `output`) để phát hiện sớm tenant bất thường hoặc vòng lặp agent đốt tiền.

## 3. Structured Audit Logs phục vụ Tuân thủ (Compliance)

Trong các ngành tài chính, y tế (HIPAA), châu Âu (GDPR) hoặc kiểm toán SOC2, hệ thống phải trả lời được câu hỏi: *"Ai đã kích hoạt hành động gì, dựa trên dữ liệu nào, vào lúc nào?"* mà không làm rò rỉ dữ liệu nhạy cảm vào hệ thống log tập trung.

### Kiến trúc tách lớp Audit Log vs. Debug Trace
| Đặc điểm | Structured Audit Log (Bắt buộc dài hạn) | Debug Payload Log (Có điều kiện) |
| :--- | :--- | :--- |
| **Nội dung** | `timestamp`, `trace_id`, `actor_id`, `tenant_id`, `action/tool_name`, `policy_decision` (`ALLOW`/`DENY`), `approver_id`, `model`, `token_usage`, `payload_sha256` | Full `system`, `messages`, `tool_result` thô |
| **Bảo mật** | Tuyệt đối không chứa raw PII/Secrets; dùng hash hoặc redacted summary | Mã hóa bằng KMS riêng, chỉ bật theo sampling (ví dụ 1%) hoặc debug flag ngắn hạn |
| **Lưu trữ & TTL** | Append-only / Immutable (WORM S3 Object Lock), lưu 1–7 năm theo quy định | TTL ngắn (7–14 ngày), tự động xóa |

> [!TIP]
> **Exam Tip (CCDV-P):**
> 1. Chỉ số `Cache Hit Ratio` đột ngột tụt giảm nghiêm trọng sau bản release mới → Kiểm tra xem có dữ liệu động lọt vào đầu `system` prompt gây **cache busting** không.
> 2. Để đáp ứng kiểm toán SOC2/HIPAA về việc agent gọi tool gì nhưng vẫn cấm lưu trữ PII khách hàng dưới dạng plain-text trong Datadog/ELK → Dùng **Structured Audit Logs với `payload_sha256` + PII redaction**, tách riêng khỏi debug payload có TTL ngắn.
> 3. `TTFT` tăng cao nhưng `TPOT` bình thường → Vấn đề nằm ở **kích thước input prompt lớn chưa trúng cache** hoặc **network/queue delay** trước khi model bắt đầu sinh token, không phải do tốc độ sinh token của model.

---

[← Bài trước](05-observability-distributed-tracing.md) | [Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/06-prod-telemetry.md) | [Bài tiếp →](07-eval-engineering-qa.md)
