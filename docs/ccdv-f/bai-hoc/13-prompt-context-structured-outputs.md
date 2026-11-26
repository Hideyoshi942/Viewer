# Domain 4: Prompt Engineering, Structured Outputs & Extended Thinking

Domain 4 chiếm **11% đề thi CCDV-F**, tập trung vào kỹ thuật viết prompt hiệu quả cho dòng Claude 4, ép kiểu đầu ra có cấu trúc (Structured Outputs) đáng tin cậy và sử dụng Extended Thinking cho các bài toán suy luận phức tạp.

## 1. Nguyên tắc Prompt Engineering cho Claude

Anthropic khuyến nghị thứ tự ưu tiên từ đơn giản đến phức tạp:
1. **Rõ ràng và Trực tiếp (Be Clear and Direct)**: Mô tả chính xác định dạng mong muốn, các bước xử lý và điều kiện biên như đang giao việc cho một nhân sự mới.
2. **Sử dụng XML Tags**: Claude được huấn luyện để nhận diện cực tốt cấu trúc XML như `<instructions>`, `<context>`, `<document>`, `<example>`. XML tags giúp **phân tách rạch ròi** giữa chỉ dẫn hệ thống và dữ liệu đầu vào không đáng tin cậy.
3. **Few-shot / Multishot Prompting**: Cung cấp 3–5 ví dụ mẫu trong thẻ `<examples>` là cách hiệu quả nhất để chuẩn hóa giọng văn, cấu trúc và xử lý edge cases.
4. **System Prompts**: Đặt vai trò (role), quy tắc bất biến và định dạng tổng quát vào tham số `system` thay vì nhồi vào `user` message.

```xml
<instructions>
Extract the customer's order ID and issue category from the email below.
If no order ID is found, return "NONE".
</instructions>

<email>
{{USER_UNTRUSTED_EMAIL}}
</email>
```

> **Exam Tip**: Khi gặp bài toán "mô hình thường xuyên hiểu nhầm dữ liệu người dùng là câu lệnh mới" hoặc "cần tách biệt nhiều tài liệu trong cùng prompt", đáp án chuẩn của Anthropic luôn là **bọc từng phần trong XML tags rõ ràng** (ví dụ `<document index="1">...</document>`).

## 2. Structured Outputs (JSON Schema & Tool Use)

Trong ứng dụng production, việc dùng regex để parse JSON từ text tự do rất dễ vỡ. Hai cách chuẩn để đảm bảo output tuân thủ schema:

1. **Structured Outputs (`output_config.format`)**: Sử dụng constrained decoding (lọc token hợp lệ theo JSON Schema ngay ở tầng sinh token) để đảm bảo **100% response là JSON hợp lệ** khớp chính xác với schema bạn định nghĩa (`type: "json_schema"`).
2. **Tool Use Schema Extraction**: Định nghĩa một tool giả (ví dụ `record_sentiment`) với `input_schema` mong muốn và ép `tool_choice: {"type": "tool", "name": "record_sentiment"}` (lưu ý: không tương thích nếu bật Extended Thinking ở chế độ ép buộc `tool`).

```python
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    output_config={
        "format": {
            "type": "json_schema",
            "schema": {
                "type": "object",
                "properties": {
                    "sentiment": {"type": "string", "enum": ["positive", "neutral", "negative"]},
                    "confidence": {"type": "number"}
                },
                "required": ["sentiment", "confidence"],
                "additionalProperties": False
            }
        }
    },
    messages=[{"role": "user", "content": "Analyze: The delivery was fast but packaging was damaged."}]
)
```

## 3. Extended Thinking & Quản lý Context Window

**Extended Thinking** cho phép Claude suy luận nội bộ (tạo các `thinking` blocks) trước khi đưa ra câu trả lời cuối cùng, cải thiện vượt bậc độ chính xác ở toán học, lập trình và phân tích đa bước.

- Cấu hình: `thinking={"type": "enabled", "budget_tokens": 4096}` (lưu ý `budget_tokens` phải `< max_tokens` và tối thiểu `1024`).
- **Quy tắc bắt buộc trong Agentic Loop**: Khi dùng Extended Thinking kết hợp Tool Use, bạn **phải giữ nguyên các `thinking` blocks (bao gồm `signature`)** trong lịch sử `messages` khi gửi lại `tool_result` cho cùng một lượt suy luận, nếu không Claude sẽ mất mạch tư duy hoặc API báo lỗi.
- **Lưu ý tương thích**: Khi bật Extended Thinking, không được ép `tool_choice` dạng `"tool"` hoặc `"any"` (chỉ dùng `"auto"` hoặc `"none"`), và không thay đổi `temperature` khỏi mặc định `1.0`.

### Quản lý Context Window cho Hội thoại dài
- **Rolling Window**: Chỉ giữ `N` lượt gần nhất (phù hợp chat thông thường, nhưng dễ mất thông tin cũ).
- **Conversation Summarization**: Khi tiệm cận giới hạn context (200K tokens), dùng Haiku tóm tắt các lượt cũ thành `<summary>` rồi thay thế vào đầu lịch sử.
- **Context Rot (Suy giảm chú ý)**: Context quá dài chứa nhiều nhiễu làm giảm độ chính xác; chỉ giữ những thông tin thực sự liên quan (Context Engineering).

---

[← Bài trước](12-prompt-engineering-structured-outputs.md) | [Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/09-prompt-structured-outputs.md) | [Bài tiếp →](14-extended-thinking-context-management.md)
