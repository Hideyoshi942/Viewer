# Chủ đề 12: Context Rot, Model Drift & Production Incident Runbooks

Nếu **Chủ đề 11** tập trung vào các lỗi tức thì ở cấp độ request (silent truncation, tool-call loops), thì **Chủ đề 12 (Domain 6 - 10%)** giải quyết các lỗi tích tụ theo thời gian (**Context Rot**, **Model Drift**) và quy trình ứng phó sự cố chuẩn mực (**Incident Runbooks**, Rollback, Graceful Degradation).

## 1. Context Rot ("Lost in the Middle" & Context Pollution)

Dù Claude hỗ trợ context window rất lớn (200K+ tokens), hiệu năng suy luận và mức độ tuân thủ chỉ dẫn không đồng đều khi context bị nhồi nhét quá nhiều nhiễu:

- **Lost in the Middle**: Thông tin nằm ở phần đầu (System Prompt) và phần cuối (User turn mới nhất) được chú ý mạnh nhất, trong khi các quy tắc hoặc dữ kiện nằm lọt thỏm ở khoảng giữa (tokens thứ 30K–120K) dễ bị bỏ sót.
- **Context Pollution**: Các `tool_result` khổng lồ chứa stack trace lỗi cũ hoặc HTML rác tích tụ qua 20 lượt hội thoại làm model bị phân tâm và suy giảm chất lượng dần theo độ dài session.

### 3 Kỹ thuật chống Context Rot
1. **Context Compaction**: Khi tổng token vượt ngưỡng (ví dụ 60% budget), dùng model nhẹ (Haiku) tóm tắt các lượt hội thoại cũ thành `<history_summary>`, giữ nguyên System Prompt và 3–5 lượt gần nhất.
2. **Subagent Isolation**: Đẩy các tác vụ đọc nhiều log/tìm kiếm tài liệu sang subagent chạy ở context riêng; chỉ trả về bản kết luận ngắn gọn cho agent chính.
3. **Strategic Placement**: Đặt các ràng buộc quan trọng nhất ở đầu System Prompt và nhắc lại (reinforce) tóm tắt các ràng buộc cốt lõi ở cuối context ngay trước khi model sinh kết quả.

## 2. Model Drift & Version Pinning

**Model Drift** xảy ra khi hành vi hệ thống (format JSON, độ dài câu trả lời, tỷ lệ từ chối, cách chọn tool) đột ngột thay đổi dù team kỹ thuật không hề deploy code mới.

- **Nguyên nhân phổ biến**: Sử dụng model alias trôi nổi (`-latest`) hoặc không khóa phiên bản snapshot, khiến nhà cung cấp tự động chuyển traffic sang bản cập nhật mới; hoặc thay đổi ngầm ở upstream embedding model làm lệch kết quả RAG.
- **Biện pháp phòng ngừa bắt buộc**:
  - **Pin Exact Model Snapshot ID** trên production (ví dụ `claude-sonnet-4-20250514`).
  - Mọi đợt nâng cấp snapshot đều phải đi qua **Full Eval Suite** và **Shadow Deployment** (Domain 4) trước khi chuyển traffic.

## 3. Production Incident Response Runbook

Khi hệ thống AI trên production gặp sự cố nghiêm trọng (tỷ lệ lỗi `5xx`/`529` tăng vọt, hallucination hàng loạt, hoặc phát hiện lỗ hổng bảo mật mới), kỹ sư trực (On-Call) cần thực hiện theo Runbook phân tầng dưới đây:

| Cấp độ sự cố | Triệu chứng điển hình | Hành động ứng phó tức thì (Mitigation) |
| :--- | :--- | :--- |
| **SEV-1: Quality / Prompt Regression** | Tỷ lệ JSON parse fail hoặc hallucination tăng đột biến sau khi sửa prompt | **Instant Config Rollback**: Đưa `prompt_version` về bản ổn định trước đó qua **Prompt Registry / Feature Flag** (mất < 10 giây, không cần rebuild container). |
| **SEV-1: Upstream Provider Outage** | Lỗi `529 Overloaded` hoặc timeout kéo dài từ Anthropic 1P API | **Circuit Breaker Failover**: Chuyển hướng traffic sang **Amazon Bedrock** hoặc **Google Vertex AI** ở region dự phòng. |
| **SEV-2: Cost Spike / Rate Limit Saturation** | Lưu lượng tăng đột biến gây lỗi `429` liên tục hoặc cháy ngân sách TPM | **Graceful Degradation**: Hạ cấp các tác vụ không thiết yếu sang **Claude Haiku**, tắt **Extended Thinking**, giảm `max_tokens` hoặc bật cache response tĩnh cho FAQ. |
| **SEV-1: Active Prompt Injection / Security Incident** | Phát hiện agent bị lợi dụng gọi tool ghi dữ liệu trái phép | **Emergency Kill-Switch**: Vô hiệu hóa toàn bộ mutating tools qua Feature Flag (chuyển sang **Read-Only Mode** hoặc ép **HITL** 100%). |

```python
# Ví dụ Feature Flag điều khiển Graceful Degradation & Kill-Switch runtime
def get_runtime_policy(flags: dict) -> dict:
    if flags.get("emergency_read_only_killswitch"):
        return {"model": "claude-sonnet-4-20250514", "allowed_tools": READ_ONLY_TOOLS, "thinking": False}
    if flags.get("degraded_cost_mode"):
        return {"model": "claude-haiku-4-5-20251001", "allowed_tools": READ_ONLY_TOOLS, "thinking": False}
    return {"model": flags["pinned_model"], "allowed_tools": ALL_TOOLS, "thinking": True}
```

> [!TIP]
> **Exam Tip (CCDV-P):**
> 1. Hệ thống tự nhiên bị tụt tỷ lệ parse JSON thành công mà không có commit code nào mới → Nghi ngờ **Model Drift** do dùng model alias; giải pháp lâu dài là **Pin exact model snapshot ID**.
> 2. Để rollback một thay đổi prompt gây lỗi trong vài giây mà không phải chờ CI/CD build lại Docker image → Quản lý prompt qua **External Prompt Registry / Feature Flags** (tách rời prompt khỏi application code).
> 3. Agent hoạt động chính xác ở 5 lượt đầu nhưng bắt đầu quên quy tắc ở lượt thứ 20 khi lịch sử chứa nhiều log dài → Hiện tượng **Context Rot**, xử lý bằng **Context Compaction** + **Subagent Isolation**.

---

[← Bài trước](11-debugging-incident-response.md) | [Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/12-incident-response.md) | [Bài tiếp →](13-agent-fleet-operations.md)
