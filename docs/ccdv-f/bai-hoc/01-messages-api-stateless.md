# Module 1: Messages API & Stateless Conversation Architecture

**Domain 1 (Applications and Integration)** chiếm **33% tỷ trọng đề thi CCDV-F**, và nền tảng cốt lõi nhất của domain này là **Claude Messages API (`POST /v1/messages`)**. Hiểu rõ bản chất stateless, cấu trúc request/response và cách SDK tích hợp đa nền tảng giúp bạn giải quyết chính xác các câu hỏi về hội thoại đa lượt và điều khiển sinh văn bản.

## 1. Kiến trúc Stateless & Quản lý Hội thoại Đa lượt (Multi-turn)

Khác với các API lưu session phía server, **Anthropic Messages API hoàn toàn stateless**. Anthropic không lưu trạng thái hội thoại giữa các lần gọi. Để duy trì ngữ cảnh qua nhiều lượt chat, ứng dụng client **bắt buộc phải tự lưu trữ lịch sử** và gửi lại mảng `messages` với các vai trò xen kẽ `user` và `assistant` trong mỗi request.

```python
import anthropic

client = anthropic.Anthropic()  # Đọc ANTHROPIC_API_KEY từ biến môi trường

conversation_history = [
    {"role": "user", "content": "What is HTTP 429?"},
    {"role": "assistant", "content": "HTTP 429 indicates Too Many Requests (rate limit exceeded)."},
    {"role": "user", "content": "How should my Python client handle it?"}
]

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    system="You are a senior backend engineer. Be concise and provide actionable guidance.",
    messages=conversation_history
)

print("Stop reason:", response.stop_reason)
print("Response:", response.content[0].text)
```

### Các quy tắc bắt buộc của mảng `messages`
- Turn đầu tiên trong `messages` **luôn phải có `role: "user"`**.
- Các turn phải xen kẽ `user` → `assistant` → `user` (nếu hai message cùng role liên tiếp nhau, API sẽ gộp hoặc báo lỗi `400 invalid_request_error` tùy cấu trúc).
- Tham số `system` được đặt ở cấp top-level (tách khỏi `messages`) để thiết lập vai trò, quy tắc và ngữ cảnh cố định.

## 2. Các Tham số Cốt lõi & Điều khiển Sinh Văn bản

| Tham số | Bắt buộc? | Giá trị & Hành vi Production |
| :--- | :--- | :--- |
| `model` | Có | ID model cụ thể (vd: `claude-sonnet-4-20250514`, `claude-haiku-4-5-20251001`) |
| `max_tokens` | **Có** | Giới hạn số token output tối đa; nếu chạm ngưỡng này, `stop_reason` là `"max_tokens"` |
| `messages` | Có | Mảng lịch sử hội thoại (`user`/`assistant`) |
| `system` | Không | String hoặc mảng block văn bản (hỗ trợ `cache_control`) |
| `temperature` | Không | `0.0` (tối đa tính nhất quán, dùng cho phân loại/trích xuất) → `1.0` (mặc định, sáng tạo) |
| `stop_sequences` | Không | Mảng chuỗi tùy chỉnh; khi Claude sinh ra chuỗi này, quá trình dừng ngay (`stop_reason: "stop_sequence"`) |

> **Exam Tip**: Khi câu hỏi đề cập đến việc output bị cắt ngang giữa chừng với `stop_reason == "max_tokens"`, nguyên nhân là giá trị `max_tokens` bạn truyền vào quá nhỏ so với độ dài câu trả lời cần thiết — không phải lỗi mạng hay rate limit.

## 3. Phân biệt các Giá trị `stop_reason`

Khi nhận response từ `POST /v1/messages`, luôn kiểm tra `response.stop_reason`:
- **`"end_turn"`**: Claude đã hoàn tất câu trả lời một cách tự nhiên.
- **`"max_tokens"`**: Output bị cắt do đạt giới hạn `max_tokens` bạn cấu hình.
- **`"stop_sequence"`**: Output dừng vì khớp một chuỗi trong `stop_sequences` (chuỗi stop sequence không được đưa vào nội dung trả về, nhưng tên chuỗi nằm trong `response.stop_sequence`).
- **`"tool_use"`**: Claude muốn gọi một hoặc nhiều công cụ (tool); ứng dụng cần thực thi tool và gửi tiếp `tool_result`.
- **`"refusal"`**: Claude từ chối yêu cầu vì vi phạm chính sách an toàn.

## 4. Triển khai Đa Nền tảng (First-party SDK vs Bedrock & Vertex AI)

Anthropic cung cấp SDK thống nhất cho cả API trực tiếp lẫn các cloud provider lớn. Thay vì viết lại logic gọi REST API thủ công, bạn chỉ cần đổi client class tương ứng:

```python
# 1. Anthropic Direct API
from anthropic import Anthropic
client = Anthropic()

# 2. Amazon Bedrock
from anthropic import AnthropicBedrock
bedrock_client = AnthropicBedrock(aws_region="us-east-1")

# 3. Google Cloud Vertex AI
from anthropic import AnthropicVertex
vertex_client = AnthropicVertex(region="us-east5", project_id="my-gcp-project")
```

> **Exam Tip**: Khi doanh nghiệp cần chạy Claude trên hạ tầng AWS hoặc GCP để đáp ứng VPC/IAM/compliance nội bộ nhưng vẫn muốn giữ nguyên code gọi `client.messages.create(...)`, hãy sử dụng **`AnthropicBedrock`** hoặc **`AnthropicVertex`** thay vì tự bọc HTTP request thô.

---

[Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/01-messages-api.md) | [Bài tiếp →](02-apps-integration-messages-api.md)
