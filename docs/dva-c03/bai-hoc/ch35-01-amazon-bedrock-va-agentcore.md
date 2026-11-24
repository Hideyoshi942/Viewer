# Chương 35.1 – Tích hợp Dịch vụ AI vào Ứng dụng: Amazon Bedrock & Amazon Bedrock AgentCore (Domain 1)

> **Phạm vi trong Exam Guide DVA-C03:**
> - **Domain 1 – Task 1.1:** Phát triển code cho ứng dụng chạy trên AWS, tích hợp các dịch vụ AI được quản lý (**Amazon Bedrock**, **Amazon Bedrock AgentCore**) thông qua AWS SDK/API, xử lý gọi đồng bộ/bất đồng bộ/streaming, quản lý lỗi và đóng gói dữ liệu.
> - **Lưu ý:** Đề thi **không** yêu cầu bạn huấn luyện mô hình ML từ đầu mà kiểm tra cách **lập trình viên tích hợp API của Bedrock và vận hành Agent** trong kiến trúc serverless/container.

---

## Mục tiêu bài học

Sau bài này bạn có thể:
- Phân biệt các control plane và data plane client của Amazon Bedrock trong AWS SDK (`bedrock` vs `bedrock-runtime` vs `bedrock-agent` vs `bedrock-agent-runtime`).
- Chọn đúng API khi gọi Foundation Model (FM): **`InvokeModel`**, **`InvokeModelWithResponseStream`**, **`Converse`** và **`ConverseStream`**.
- Xử lý giới hạn token, lỗi `ThrottlingException` (exponential backoff + jitter), và chọn đúng chế độ **On-Demand / Cross-Region Inference (CRIS) / Provisioned Throughput / Batch Inference**.
- Hiểu kiến trúc **Amazon Bedrock Agents** (Foundation Model + Instructions + Action Groups + Knowledge Bases) và cách tích hợp **AWS Lambda** làm công cụ (tool) cho Agent.
- Nắm vững các thành phần của **Amazon Bedrock AgentCore** (Runtime, Gateway/MCP, Memory, Identity, Code Interpreter, Browser, Observability) khi đưa AI Agent lên môi trường production.

---

## Bài 1 – Amazon Bedrock & Các API dành cho Developer

### 1.1. Lý thuyết cốt lõi

- **Amazon Bedrock** là dịch vụ **serverless, fully managed** cung cấp quyền truy cập vào các **Foundation Models (FMs)** hàng đầu (Amazon Nova, Anthropic Claude, Meta Llama, Mistral, Cohere, Stability AI...) thông qua một API thống nhất.
- **Đặc điểm kiến trúc cần nhớ:**
  - **Serverless:** Không phải quản lý hạ tầng hay GPU (khi dùng On-Demand).
  - **Dữ liệu riêng tư mặc định:** AWS **không** dùng prompt (input) và kết quả (output) của bạn để huấn luyện lại các mô hình gốc (base models) hoặc chia sẻ cho bên thứ ba. Dữ liệu luôn được mã hóa khi truyền (TLS) và khi lưu trữ (KMS).

#### Bốn nhóm Client trong AWS SDK (Boto3) — Rất dễ nhầm trong đề!

| Tên Client trong Boto3 | Loại Plane | Công dụng chính | Ví dụ API tiêu biểu |
|---|---|---|---|
| **`bedrock`** | Control Plane | Quản lý cấu hình, xem danh sách model, tạo Guardrail, cấu hình logging | `ListFoundationModels`, `CreateGuardrail`, `PutModelInvocationLoggingConfiguration` |
| **`bedrock-runtime`** | **Data Plane (Model)** | **Ứng dụng gọi trực tiếp tới Foundation Model để sinh văn bản/ảnh/embedding** | **`InvokeModel`**, **`InvokeModelWithResponseStream`**, **`Converse`**, **`ConverseStream`** |
| **`bedrock-agent`** | Control Plane (Agent/KB) | Tạo và cấu hình Agent, Action Group, Knowledge Base | `CreateAgent`, `CreateAgentActionGroup`, `CreateKnowledgeBase` |
| **`bedrock-agent-runtime`** | **Data Plane (Agent/KB)** | **Ứng dụng gửi yêu cầu cho Agent thực thi hoặc truy vấn Knowledge Base** | **`InvokeAgent`**, **`Retrieve`**, **`RetrieveAndGenerate`** |

---

### 1.2. Bốn API gọi Model trong `bedrock-runtime` (Khi nào dùng cái nào?)

| API | Kiểu phản hồi | Đặc điểm cốt lõi | Khi nào chọn trong đề thi? |
|---|---|---|---|
| **`InvokeModel`** | Đồng bộ (chờ trọn gói JSON) | Payload đầu vào/đầu ra **phụ thuộc từng nhà cung cấp model** (Claude có JSON schema khác Llama/Nova). Dùng cho cả text, **image generation**, và **embeddings**. | Xử lý ngầm ở backend, phân loại văn bản, tạo vector **embedding**, tạo ảnh, hoặc cần tham số đặc thù riêng của 1 model. |
| **`InvokeModelWithResponseStream`** | **Streaming** (trả từng chunk qua EventStream) | Payload vẫn theo định dạng riêng của từng model, nhưng trả từng mảnh token ngay khi sinh ra. | Chatbot/UI cần hiển thị chữ chạy dần để giảm **Time-To-First-Token (TTFT)**, nhưng đang viết riêng cho 1 model cố định. |
| **`Converse`** | Đồng bộ (chuẩn hóa) | **API thống nhất cho hội thoại (multi-turn chat)**: mọi model đều dùng chung một định dạng `messages`, `system`, `inferenceConfig`, `toolConfig`, `guardrailConfig`. | Ứng dụng cần **dễ dàng đổi qua lại giữa các model** (ví dụ từ Claude sang Amazon Nova/Llama) mà **không phải sửa code đóng gói JSON**, hoặc cần dùng **Tool Use (Function Calling)**. |
| **`ConverseStream`** | **Streaming** (chuẩn hóa) | Kết hợp ưu điểm của `Converse` (cùng 1 cấu trúc code cho mọi model + hỗ trợ Tool Use) và **Streaming**. | **Lựa chọn tốt nhất cho ứng dụng Chatbot thực tế** cần đổi model linh hoạt + phản hồi thời gian thực. |

> **Bẫy thi cực hay gặp:**
> - Nếu đề hỏi: *"Một công ty muốn xây dựng ứng dụng chat có thể chuyển đổi linh hoạt giữa các Foundation Model của Anthropic và Meta với **ít thay đổi code nhất** (minimal code changes) và hỗ trợ gọi hàm (tool use)"* → Chọn **`Converse` API (hoặc `ConverseStream` API)**, **không** chọn `InvokeModel` (vì `InvokeModel` bắt phải viết lại JSON body cho từng model).
> - Nếu đề hỏi: *"Tạo vector embeddings hoặc sinh hình ảnh"* → Phải dùng **`InvokeModel`** (`Converse` chỉ dành cho các model hội thoại văn bản/đa phương thức sinh text).

---

### 1.3. Kiến thức thực tế: Code mẫu với AWS SDK (Python `boto3`)

#### Cách 1: Dùng `Converse` API (Chuẩn hóa cho mọi model + tích hợp Guardrail)

```python
import boto3
from botocore.config import Config

# Cấu hình retry chuẩn cho Bedrock để chống ThrottlingException
config = Config(
    region_name="us-east-1",
    retries={"max_attempts": 5, "mode": "adaptive"}  # hoặc "standard"
)
brt = boto3.client("bedrock-runtime", config=config)

response = brt.converse(
    modelId="us.anthropic.claude-3-5-sonnet-20241022-v2:0",  # Cross-region inference profile ID
    system=[{"text": "Bạn là trợ lý kỹ thuật AWS ngắn gọn, chính xác."}],
    messages=[
        {"role": "user", "content": [{"text": "Giải thích ngắn gọn DynamoDB GSI."}]}
    ],
    inferenceConfig={
        "maxTokens": 512,
        "temperature": 0.2,
        "topP": 0.9
    },
    guardrailConfig={
        "guardrailIdentifier": "gr-abc123xyz",
        "guardrailVersion": "1"
    }
)

output_text = response["output"]["message"]["content"][0]["text"]
token_usage = response["usage"]  # {'inputTokens': ..., 'outputTokens': ..., 'totalTokens': ...}
```

#### Cách 2: Xử lý Streaming với `ConverseStream` (hoặc `InvokeModelWithResponseStream`)

```python
stream_response = brt.converse_stream(
    modelId="amazon.nova-pro-v1:0",
    messages=[{"role": "user", "content": [{"text": "Viết một hàm Lambda Python đọc S3."}]}]
)

for event in stream_response.get("stream", []):
    if "contentBlockDelta" in event:
        chunk_text = event["contentBlockDelta"]["delta"].get("text", "")
        print(chunk_text, end="", flush=True)
    elif "metadata" in event:
        print("\nTokens used:", event["metadata"]["usage"])
```

> **Liên hệ với AWS Lambda:** Khi ứng dụng serverless muốn stream kết quả từ Bedrock thẳng về trình duyệt người dùng mà không bị ngắt hay chờ hết câu, kết hợp **`ConverseStream` / `InvokeModelWithResponseStream`** với **Lambda Response Streaming** (qua Lambda Function URL hoặc API Gateway REST API hỗ trợ response streaming).

---

### 1.4. Các chế độ cấp phát năng lực & Tối ưu hiệu năng/chi phí trên Bedrock

| Chế độ | Cách hoạt động & Tính phí | Khi nào chọn trong đề thi? |
|---|---|---|
| **On-Demand** | Trả tiền theo số **input tokens + output tokens** thực tế sử dụng; không cam kết trước; chịu giới hạn quota (RPM/TPM) mặc định của Region. | Mặc định cho hầu hết ứng dụng, tải biến thiên hoặc chưa dự đoán được. |
| **Cross-Region Inference (CRIS / Inference Profiles)** | Sử dụng **Inference Profile ID** (ví dụ `us.anthropic...` hoặc `eu.meta...`). Bedrock tự động định tuyến request sang các Region khả dụng trong cùng khu vực địa lý khi Region chính bị nghẽn, không tốn thêm phí. | Ứng dụng On-Demand bị lỗi **`ThrottlingException` (429)** vào giờ cao điểm, cần **tăng thông lượng (throughput) và độ sẵn sàng** mà không muốn trả phí cố định. |
| **Provisioned Throughput** | Mua trước số lượng **Model Units (MU)** theo cam kết thời gian (1 tháng / 6 tháng), trả phí theo giờ dù dùng hay không. Bắt buộc cho **Custom Models (Fine-tuned / Continued Pre-training)** (trừ một số model hỗ trợ custom model on-demand). | Yêu cầu **thông lượng đảm bảo ổn định (guaranteed throughput)** ở quy mô lớn, hoặc chạy model đã fine-tune cần băng thông cố định. |
| **Batch Inference** | Gửi hàng loạt prompt từ file JSONL trong **Amazon S3**, Bedrock xử lý bất đồng bộ và xuất kết quả ra S3 với **chi phí rẻ hơn tới 50%** so với On-Demand. | Xử lý hàng chục nghìn/triệu bản ghi **offline, không cần phản hồi thời gian thực** (ví dụ: tóm tắt toàn bộ đánh giá sản phẩm hàng đêm). |
| **Prompt Caching** | Lưu cache phần đầu của prompt lặp đi lặp lại (system prompt dài, tài liệu ngữ cảnh lớn, ví dụ mẫu few-shot) trong vài phút. Giảm mạnh **độ trễ (latency)** và giảm tới 90% chi phí cho phần token được cache. | Chatbot/Agent có **system prompt hoặc tài liệu tham chiếu cố định rất dài** được gửi lặp lại qua nhiều lượt hỏi. |

---

## Bài 2 – Amazon Bedrock Agents & Amazon Bedrock AgentCore

### 2.1. Kiến trúc Amazon Bedrock Agents (Cơ bản)

Một **Bedrock Agent** giúp mô hình AI không chỉ trả lời câu hỏi mà còn **lập kế hoạch (orchestration / ReAct reasoning)**, **tra cứu dữ liệu (RAG)** và **gọi API/hàm thực thi công việc**.

Bốn thành phần cấu tạo nên một Bedrock Agent:
1. **Foundation Model (FM):** Bộ não suy luận của Agent.
2. **Instructions (Chỉ dẫn):** Mô tả vai trò, nhiệm vụ và quy tắc hành xử của Agent.
3. **Action Groups (Nhóm hành động – Trọng tâm của Developer):**
   - Định nghĩa các công cụ (tools/APIs) mà Agent được phép gọi.
   - Khai báo thông qua **OpenAPI schema** (JSON/YAML lưu trên S3 hoặc inline) **HOẶC** khai báo danh sách **Function details** (tên hàm, mô tả, các tham số).
   - Thực thi bằng **AWS Lambda function** (hoặc trả quyền điều khiển **Return of Control** về cho ứng dụng tự thực thi).
4. **Knowledge Bases (Cơ sở tri thức – Tuỳ chọn):**
   - Nối dữ liệu doanh nghiệp (trên S3, Confluence, SharePoint...) đã được chia nhỏ (chunking), tạo vector embedding và lưu trong Vector Database (OpenSearch Serverless, Aurora PostgreSQL `pgvector`, Pinecone, S3 Vectors...).

#### Luồng phân quyền giữa Bedrock Agent và AWS Lambda (Hay hỏi thi!)

```
[Ứng dụng Client] --(bedrock:InvokeAgent)--> [Bedrock Agent]
                                                   |
         +-----------------------------------------+-----------------------------------------+
         | (1) Agent Execution Role (IAM Role)                                               | (2) Lambda Resource-based Policy
         v                                                                                   v
Gọi Foundation Model (`bedrock:InvokeModel`)                                  Cho phép Principal `bedrock.amazonaws.com`
Đọc S3 OpenAPI Schema (`s3:GetObject`)                                        gọi `lambda:InvokeFunction` (kèm điều kiện
Truy vấn Knowledge Base (`bedrock:Retrieve`)                                  `AWS:SourceArn` = ARN của Agent và `AWS:SourceAccount`)
```

> **Bẫy thi:** Nếu Bedrock Agent báo lỗi **AccessDenied** khi gọi hàm Lambda của Action Group, nguyên nhân số 1 là **thiếu Resource-based policy trên hàm Lambda** cho phép service principal **`bedrock.amazonaws.com`** thực hiện `lambda:InvokeFunction`!

---

### 2.2. Amazon Bedrock AgentCore — Dịch vụ mới trong Appendix DVA-C03

Trong Exam Guide DVA-C03, AWS bổ sung riêng mục **Amazon Bedrock AgentCore**. Đây là bộ dịch vụ hạ tầng cấp doanh nghiệp giúp lập trình viên triển khai, mở rộng và bảo mật **bất kỳ AI Agent nào** (dù viết bằng Bedrock Agents, Strands Agents, LangGraph, CrewAI hay code tùy chỉnh) ở quy mô production.

#### Bảng tổng hợp 7 thành phần của Amazon Bedrock AgentCore (Cần nhớ để nhận diện trong đề)

| Thành phần của AgentCore | Chức năng cốt lõi | Từ khóa nhận diện trong câu hỏi DVA-C03 |
|---|---|---|
| **1. AgentCore Runtime** | Môi trường chạy **serverless** chuyên dụng cho AI Agent, hỗ trợ các tác vụ chạy lâu (long-running), **cô lập từng phiên người dùng bằng microVM riêng biệt (session isolation)** để tránh rò rỉ dữ liệu giữa các user/tenant. | *"Chạy AI agent serverless"*, *"cô lập phiên cấp phần cứng/microVM giữa các người dùng"*, *"session isolation"*. |
| **2. AgentCore Gateway** | Biến các API hiện có (REST APIs, **AWS Lambda functions**, dịch vụ nội bộ) thành các công cụ chuẩn **MCP (Model Context Protocol)** để Agent khám phá và gọi an toàn mà không cần viết code kết nối thủ công. | *"Chuyển đổi Lambda/REST API sẵn có thành MCP tools cho Agent"*, *"quản lý tập trung các tool cho nhiều Agent"*. |
| **3. AgentCore Identity** | Quản lý định danh và xác thực cho Agent: xác thực người dùng, ủy quyền OAuth 2.0 / IAM để Agent thay mặt người dùng gọi các dịch vụ AWS hoặc bên thứ ba (GitHub, Salesforce, Slack) theo đúng quyền của user đó. | *"Agent gọi API bên thứ 3 hoặc AWS thay mặt user với quyền giới hạn (delegated access / OAuth / token vault)"*. |
| **4. AgentCore Memory** | Quản lý bộ nhớ **ngắn hạn (short-term conversation state trong phiên)** và **dài hạn (long-term memory xuyên suốt nhiều phiên)** mà lập trình viên không phải tự dựng bảng DynamoDB/vector store phức tạp. | *"Lưu trữ ngữ cảnh hội thoại qua nhiều phiên làm việc của Agent"*, *"persistent memory cho AI agent"*. |
| **5. AgentCore Code Interpreter** | Môi trường **sandbox cô lập, an toàn** để Agent tự sinh và chạy code (ví dụ Python) nhằm phân tích dữ liệu, tính toán phức tạp hoặc vẽ biểu đồ mà không ảnh hưởng hệ thống chính. | *"Cho phép Agent thực thi đoạn code tự sinh trong môi trường sandbox an toàn"*. |
| **6. AgentCore Browser** | Trình duyệt cloud được quản lý và cô lập để Agent tương tác tự động với các trang web một cách an toàn. | *"Agent tự động thao tác trình duyệt web trong môi trường cô lập"*. |
| **7. AgentCore Observability** | Theo dõi, ghi vết (tracing) từng bước suy luận (reasoning steps), lời gọi tool, độ trễ và lượng token tiêu thụ của Agent; tích hợp chuẩn **OpenTelemetry** và **CloudWatch**. | *"Debug các bước suy luận (chain-of-thought / tool calls) của Agent"*, *"theo dõi độ trễ và token của từng bước trong Agent"*. |

---

### 2.3. Kiến thức thực tế: Cấu trúc Lambda Handler cho Bedrock Agent Action Group

Khi Bedrock Agent gọi một hàm AWS Lambda trong Action Group, Lambda nhận `event` chứa thông tin `agent`, `actionGroup`, `function` (hoặc `apiPath` + `httpMethod`), `parameters`, và **`sessionAttributes` / `promptSessionAttributes`**. Hàm Lambda bắt buộc phải trả về đúng cấu trúc JSON mà Bedrock Agent mong đợi:

```python
import json

def lambda_handler(event, context):
    action_group = event["actionGroup"]
    function_name = event["function"]
    parameters = {p["name"]: p["value"] for p in event.get("parameters", [])}
    
    # Ví dụ: lấy thông tin user từ sessionAttributes (không cho model tự bịa userId)
    session_attrs = event.get("sessionAttributes", {})
    current_user_id = session_attrs.get("userId", "anonymous")

    if function_name == "getOrderStatus":
        order_id = parameters.get("orderId")
        result = {"orderId": order_id, "userId": current_user_id, "status": "SHIPPED"}
    else:
        result = {"error": "Unknown function"}

    return {
        "messageVersion": "1.0",
        "response": {
            "actionGroup": action_group,
            "function": function_name,
            "functionResponse": {
                "responseBody": {
                    "TEXT": {
                        "body": json.dumps(result)
                    }
                }
            }
        },
        "sessionAttributes": session_attrs,
        "promptSessionAttributes": event.get("promptSessionAttributes", {})
    }
```

#### Phân biệt `sessionAttributes` vs `promptSessionAttributes` (Mẹo thi thực chiến):
- **`sessionAttributes`:** Lưu trạng thái phiên xuyên suốt các lượt gọi, được truyền vào **Lambda function** của Action Group nhưng **KHÔNG mặc định nhét vào prompt gửi cho Foundation Model** → Rất tốt để truyền thông tin định danh/ngữ cảnh backend (như `tenantId`, `userId`, `accountTier`) cho Lambda kiểm tra quyền mà không sợ lộ hoặc bị prompt injection sửa đổi!
- **`promptSessionAttributes`:** Được đưa **trực tiếp vào prompt** gửi cho Foundation Model ở lượt gọi đó (ví dụ: `"Hôm nay là ngày 06/11/2026, múi giờ người dùng là GMT+7"`).

---

## Ghi nhớ cho kỳ thi (Tóm tắt nhanh Chương 35.1)

1. **Đổi qua lại nhiều Foundation Model với ít sửa code nhất + dùng Tool Use:** chọn **`Converse` / `ConverseStream`** (trên client `bedrock-runtime`).
2. **Giảm thời gian chờ chữ đầu tiên (TTFT) cho ứng dụng chat:** chọn **`ConverseStream`** hoặc **`InvokeModelWithResponseStream`** kết hợp **Lambda Response Streaming** hoặc WebSocket API Gateway.
3. **Bị `ThrottlingException` trên Bedrock On-Demand:**
   - Trong code: bật **Exponential Backoff + Jitter** (hoặc `adaptive` retry mode trong SDK).
   - Về cấu hình: dùng **Cross-Region Inference (Inference Profiles)** để tự động chia tải qua nhiều Region, hoặc mua **Provisioned Throughput** nếu cần cam kết băng thông cố định.
4. **Xử lý hàng loạt dữ liệu lớn không cần real-time, tối ưu chi phí:** chọn **Bedrock Batch Inference** (đọc/ghi qua S3).
5. **System prompt / tài liệu ngữ cảnh cố định quá dài lặp lại ở mọi request:** bật **Prompt Caching** để giảm độ trễ và chi phí token đầu vào.
6. **Biến các hàm Lambda và REST API sẵn có thành công cụ MCP cho AI Agent:** chọn **Amazon Bedrock AgentCore Gateway**.
7. **Cô lập môi trường chạy giữa các phiên người dùng của AI Agent:** chọn **Amazon Bedrock AgentCore Runtime**.
8. **Truyền thông tin nhạy cảm/định danh (`userId`, `tenantId`) từ ứng dụng xuống hàm Lambda của Agent mà không cho LLM tự bịa:** truyền qua **`sessionAttributes`**.

---

[← Chương 35.0](ch35-00-tong-quan-thay-doi-dva-c02-sang-dva-c03.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chương 35.2 →](ch35-02-amazon-q-developer-va-kiro.md)
