# Amazon Bedrock Agents, Action Groups & Bedrock Flows

Generative AI hiện đại không chỉ dừng ở việc trả lời câu hỏi (Chat) mà còn có khả năng **suy luận đa bước và tự động thực thi hành động** trên hệ thống doanh nghiệp thông qua **Amazon Bedrock Agents** và **Bedrock Flows**.

---

## 1. Kiến trúc Amazon Bedrock Agents (ReAct Framework)

Bedrock Agents sử dụng kỹ thuật **ReAct (Reasoning + Acting)** để chia nhỏ yêu cầu phức tạp của người dùng thành chuỗi suy nghĩ và gọi công cụ:

1. **Orchestration (Điều phối)**: Agent nhận prompt, lập kế hoạch (Chain-of-Thought) xem cần gọi Knowledge Base hay Action Group nào.
2. **Action Groups**: Kết nối với **AWS Lambda** thông qua **OpenAPI Schema** (JSON/YAML) để thực hiện tác vụ thật (ví dụ: kiểm tra đơn hàng trong DynamoDB, hủy vé máy bay, gửi email).
3. **Knowledge Bases Integration**: Agent tự động truy vấn tài liệu nội bộ (RAG) khi cần thông tin chính sách trước khi hành động.
4. **Memory & Session Context**: Lưu giữ ngữ cảnh hội thoại đa lượt (multi-turn) và tóm tắt lịch sử phiên làm việc dài hạn.

```yaml
# Trích đoạn OpenAPI 3.0 Schema cho Action Group của Bedrock Agent
openapi: 3.0.0
info:
  title: OrderManagementAPI
  version: 1.0.0
paths:
  /orders/{orderId}:
    get:
      summary: Tra cứu trạng thái đơn hàng theo mã đơn
      operationId: getOrderStatus
      parameters:
        - name: orderId
          in: path
          required: true
          schema:
            type: string
      responses:
        "200":
          description: Trạng thái đơn hàng hiện tại
```

---

## 2. Amazon Bedrock Flows vs. Bedrock Agents

| Tiêu chí | Amazon Bedrock Agents | Amazon Bedrock Flows |
| :--- | :--- | :--- |
| **Cơ chế điều khiển** | **Dynamic / Autonomous**: LLM tự quyết định bước tiếp theo dựa trên ReAct | **Deterministic / Visual Workflow**: Lập trình viên thiết kế luồng node cố định (Prompt, Condition, Knowledge Base, Lambda, Iterator) |
| **Tính dự đoán** | Linh hoạt cho câu hỏi mở, nhưng đường đi có thể thay đổi | **Chính xác, lặp lại ổn định** cho quy trình nghiệp vụ chuẩn hóa |
| **Use case** | Trợ lý CSKH tự động tra cứu & xử lý khiếu nại | Pipeline xử lý tài liệu tự động: Phân loại $\rightarrow$ Trích xuất $\rightarrow$ Dịch $\rightarrow$ Lưu DB |

> **Exam Tip**:
> - Đề bài mô tả *"build an autonomous assistant that breaks down multi-step user requests and invokes company APIs via AWS Lambda using OpenAPI schemas"* $\rightarrow$ **Amazon Bedrock Agents + Action Groups**.
> - Đề bài mô tả *"orchestrate a repeatable, deterministic sequence of prompts, conditional branches, and knowledge base lookups visually"* $\rightarrow$ **Amazon Bedrock Flows**.

---

[← Bài trước](09-fm-customization-cost-optimization.md) | [Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/10-bedrock-agents-flows.md) | [Bài tiếp →](11-responsible-ai.md)
