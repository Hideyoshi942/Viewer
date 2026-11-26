# Chủ đề 10: Runtime Guardrails, PII/Secret Redaction & Least-Privilege MCP Scoping

Nếu **Chủ đề 9** tập trung vào phòng thủ Indirect Prompt Injection và phân tách dữ liệu/chỉ thị, thì **Chủ đề 10 (Domain 5 - 11%)** đi sâu vào các cơ chế bảo mật hạ tầng bắt buộc cho hệ thống doanh nghiệp: **Input/Output Guardrails**, **PII/Secret Redaction**, **Multi-Tenant Isolation** và **Least-Privilege MCP Tool Scoping**.

## 1. Runtime Input & Output Guardrails (Dual-Layer Filtering)

Hệ thống production không nên phó mặc việc kiểm soát nội dung cho mỗi System Prompt của model chính. Kiến trúc chuẩn sử dụng lớp Guardrail độc lập:

- **Input Guardrail (Pre-flight)**: Chạy song song hoặc trước khi gọi model chính để phát hiện jailbreak, toxic content, hoặc chủ đề ngoài phạm vi (off-topic). Dùng model siêu nhẹ (Haiku hoặc classifier chuyên biệt) để độ trễ phát sinh < 150ms.
- **Output Guardrail (Post-flight)**: Kiểm tra phản hồi của Claude trước khi stream/trả về client:
  - Chặn rò rỉ System Prompt hoặc cấu trúc internal tools.
  - Xác thực JSON Schema / Policy compliance (ví dụ không đưa ra lời khuyên pháp lý/y tế trái phép).

## 2. PII & Secret Redaction / Tokenization Middleware

Gửi dữ liệu nhạy cảm (số thẻ tín dụng, SSN, API keys) nguyên trạng lên LLM hoặc để lộ trong `tool_result` là rủi ro tuân thủ nghiêm trọng.

### Chiến lược Tokenization & Re-hydration
1. **Pre-LLM Redaction**: Middleware quét input và `tool_result` bằng **Deterministic Regex** (cho API keys `sk-ant-...`, `AKIA...`, JWT) kết hợp **NER** (Microsoft Presidio cho tên, email, số điện thoại). Thay thế bằng token giả định danh (`<EMAIL_1>`, `<CARD_1>`).
2. **Re-hydration có kiểm soát**: Nếu hệ thống cần gửi email thật ở bước cuối, chỉ tầng ứng dụng backend mới map ngược `<EMAIL_1>` về địa chỉ thật sau khi đã qua kiểm tra quyền, **LLM không bao giờ nhìn thấy giá trị gốc**.
3. **Post-LLM Secret Scanner**: Quét output của Claude một lần cuối trước khi trả về user hoặc ghi vào hệ thống log để đảm bảo không có secret nào từ môi trường chạy tool bị in ra ngoài.

```python
import re

SECRET_PATTERNS = [
    (re.compile(r"sk-ant-[a-zA-Z0-9\-_]{20,}"), "[REDACTED_ANTHROPIC_KEY]"),
    (re.compile(r"AKIA[0-9A-Z]{16}"), "[REDACTED_AWS_KEY]"),
    (re.compile(r"ghp_[a-zA-Z0-9]{36}"), "[REDACTED_GITHUB_TOKEN]"),
]

def scan_and_redact(text: str) -> str:
    for pattern, placeholder in SECRET_PATTERNS:
        text = pattern.sub(placeholder, text)
    return text
```

## 3. Multi-Tenant Isolation (Chống Cross-Tenant Data Leakage)

Trong kiến trúc SaaS nhiều khách hàng dùng chung một Vector DB và cụm MCP Servers, lỗi nguy hiểm nhất là Tenant A truy xuất được tài liệu của Tenant B.

- **Quy tắc vàng**: **Tuyệt đối KHÔNG bao giờ** tin tưởng `tenant_id` do LLM truyền vào qua tham số tool call! Nếu bị Prompt Injection, model có thể truyền `tenant_id="competitor_org"`.
- **Backend-Enforced Context**: `tenant_id` và `user_roles` phải được giải mã từ **Verified JWT / OAuth Token** ở tầng API Gateway, sau đó ép buộc (hard-inject) vào:
  - **Vector DB Query**: Filter bắt buộc `metadata.tenant_id == auth.tenant_id` hoặc tách riêng namespace/collection theo tenant.
  - **MCP Server Calls**: Truyền `auth_context` qua signed header của tầng transport, MCP Server đọc quyền từ header đó chứ không đọc từ tool arguments của LLM.

## 4. Least-Privilege MCP Tool Scoping & Network Egress Control

Nguyên tắc **Least Privilege (Đặc quyền tối thiểu)** giới hạn thiệt hại tối đa (Blast Radius) ngay cả khi agent bị đánh lừa hoàn toàn:

| Biện pháp | Triển khai thực tế | Rủi ro được ngăn chặn |
| :--- | :--- | :--- |
| **Dynamic Tool Filtering** | Chỉ gửi danh sách `tools` đúng với role của user hiện tại (user thường không nhận tool `delete_record` trong mảng `tools`) | Ngăn model gọi nhầm hoặc bị ép gọi tool quản trị |
| **Scoped OAuth Tokens** | Mỗi MCP session dùng short-lived OAuth token mang scope hẹp của user (`read:tickets`), không dùng Master Service Account key | Ngăn leo thang đặc quyền (Privilege Escalation) |
| **Network Egress Allowlist** | Proxy chặn IP nội bộ (`169.254.169.254`, `10.0.0.0/8`, `127.0.0.1`) và chỉ cho outbound tới domain trong whitelist | Chống **SSRF** và **Data Exfiltration** qua URL query string |

> [!TIP]
> **Exam Tip (CCDV-P):**
> 1. Để ngăn Tenant A đọc dữ liệu của Tenant B trong hệ thống RAG + MCP → **Extract `tenant_id` từ verified JWT ở backend và ép buộc vào retrieval filter**, tuyệt đối không để Claude tự truyền `tenant_id` làm tham số tool.
> 2. Để ngăn Agent đọc nhầm file `.env` rồi in API key ra câu trả lời → Dùng **Deterministic Secret Redaction Middleware** quét cả `tool_result` lẫn `final_output` (không chỉ nhắc nhở trong prompt).
> 3. Agent có tool `fetch_url` bị lừa truy cập `http://169.254.169.254/latest/meta-data/` → Lỗ hổng **SSRF**, khắc phục bằng **Network Egress Allowlist** chặn dải IP nội bộ/link-local.

---

[← Bài trước](09-runtime-guardrails-security.md) | [Mục lục CCDV-P](../00-tong-quan-va-lo-trinh-ccdv-p.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/10-enterprise-security.md) | [Bài tiếp →](11-debugging-incident-response.md)
