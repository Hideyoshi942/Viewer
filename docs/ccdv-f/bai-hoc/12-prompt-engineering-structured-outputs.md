# Module 9: Prompt Engineering, XML Tags & Structured Outputs

**Domain 4 (Prompt and Context Engineering)** chiếm **11% đề thi CCDV-F**. Claude được huấn luyện để phản hồi đặc biệt tốt với các chỉ dẫn rõ ràng, có cấu trúc phân cấp và giải thích lý do (*why*) đằng sau quy tắc.

## 1. Best Practices Viết System Prompt & Chỉ dẫn Rõ ràng

- **Đặt quy tắc ở `system` parameter**: Dùng tham số `system` của Messages API để tách biệt vai trò, định dạng đầu ra và ràng buộc hành vi khỏi dữ liệu người dùng.
- **Giải thích *tại sao* (Explain the Why)**: Thay vì chỉ viết *"Do not output markdown"*, viết *"Output raw JSON only without markdown fences because the downstream parser reads stdout directly"* giúp Claude khái quát hóa tốt hơn và tuân thủ cao hơn ở các trường hợp biên.
- **Multishot (Few-shot) Prompting**: Cung cấp 3–5 ví dụ `<example>` đầu vào/đầu ra mẫu nhất quán về định dạng, giúp giảm mạnh lỗi sai cấu trúc và định hướng phong cách chính xác.

## 2. Phân tách Dữ liệu & Chỉ dẫn bằng XML Tags

Anthropic khuyến nghị sử dụng **XML tags** (như `<instructions>`, `<context>`, `<document>`, `<examples>`) để phân tách rạch ròi giữa **lệnh điều khiển** và **dữ liệu cần xử lý**:

```xml
<instructions>
Extract the vendor name, invoice date, and total amount from the document below.
If a field is missing, set its value to null.
</instructions>

<document>
Invoice #4401 - Acme Cloud Services - Date: 2026-04-12 - Total: $1,250.00
</document>
```

### Lợi ích của XML Tags
- Ngăn Claude nhầm lẫn văn bản trong tài liệu là chỉ dẫn mới (giảm rủi ro Indirect Prompt Injection).
- Giúp dễ dàng trích xuất từng phần trong output nếu yêu cầu Claude bọc câu trả lời trong thẻ `<analysis>...</analysis>` và `<answer>...</answer>`.
- Với **Long Context** (tài liệu dài hàng chục nghìn tokens), Anthropic khuyến nghị đặt **tài liệu (`<documents>`) ở phía trên** và **câu hỏi/chỉ dẫn cụ thể ở phía dưới** (cuối prompt) để đạt độ chính xác truy xuất cao nhất.

## 3. Structured Outputs (Ép Đầu ra 100% Tuân thủ JSON Schema)

Trong hệ thống production, việc chỉ nhắc *"Please return valid JSON"* trong prompt vẫn có xác suất nhỏ Claude trả kèm lời dẫn (`Here is your JSON: ...`) hoặc sai kiểu dữ liệu.

Anthropic cung cấp **Structured Outputs** (qua `output_config.format` với `type: "json_schema"` hoặc **Constrained Decoding** kết hợp `tool_use` schema) để **đảm bảo 100% đầu ra tuân thủ đúng JSON Schema** ở tầng token sampling:

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Extract: Order #991 by Alice, 3 items, total $89.50"}
    ],
    output_config={
        "format": {
            "type": "json_schema",
            "schema": {
                "type": "object",
                "properties": {
                    "order_id": {"type": "string"},
                    "customer": {"type": "string"},
                    "item_count": {"type": "integer"},
                    "total_usd": {"type": "number"}
                },
                "required": ["order_id", "customer", "item_count", "total_usd"],
                "additionalProperties": False
            }
        }
    }
)
print(response.content[0].text)  # Luôn là chuỗi JSON hợp lệ 100% theo schema
```

> **Exam Tip**: Khi đề bài yêu cầu **đảm bảo 100% (guaranteed)** response từ Claude khớp với JSON Schema (không bao giờ lỗi parse JSON hay sai kiểu field), hãy chọn **Structured Outputs (`json_schema` / constrained decoding)** thay vì chỉ dựa vào prompt engineering hay regex post-processing.

---

[← Bài trước](11-claude-agent-sdk-hitl.md) | [Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/09-prompt-structured-outputs.md) | [Bài tiếp →](13-prompt-context-structured-outputs.md)
