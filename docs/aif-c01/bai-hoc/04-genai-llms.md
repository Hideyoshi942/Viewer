# Kiến trúc Generative AI, Foundation Models & Amazon Bedrock

Domain 2 chiếm **24%** bài thi AIF-C01, tập trung vào cách hoạt động của **Generative AI (GenAI)**, **Foundation Models (FMs)**, các tham số suy luận (Inference Parameters) và hệ sinh thái dịch vụ GenAI của AWS (nổi bật nhất là **Amazon Bedrock** và **Amazon Q**).

## 1. Khái niệm Cốt lõi của Generative AI & Foundation Models

- **Generative AI**: Nhánh của Deep Learning có khả năng **tạo nội dung mới** (văn bản, mã nguồn, hình ảnh, âm thanh, video) dựa trên các mẫu đã học từ lượng dữ liệu khổng lồ.
- **Foundation Models (FMs)**: Các mô hình khổng lồ được tiền huấn luyện (pre-trained) trên tập dữ liệu cực lớn bằng phương pháp **Self-supervised Learning**, có thể thích ứng (adapt) cho nhiều tác vụ khác nhau (tóm tắt, hỏi đáp, sinh mã, dịch thuật).
- **Large Language Models (LLMs)**: Một tập con của FMs chuyên xử lý và sinh ngôn ngữ tự nhiên, xây dựng trên kiến trúc **Transformer**.

### Kiến trúc Transformer & Các thành phần Quan trọng
1. **Tokenization**: Chia văn bản đầu vào thành các đơn vị nhỏ gọi là **Tokens** (từ, phần từ hoặc ký tự; trung bình 1 token $\approx$ 3/4 từ tiếng Anh). Giá gọi API và giới hạn ngữ cảnh (**Context Window**) đều tính theo token.
2. **Embeddings**: Chuyển đổi token/câu/ảnh thành **vector số học nhiều chiều (numerical vectors)** biểu diễn ý nghĩa ngữ nghĩa (semantic meaning). Các câu đồng nghĩa sẽ có vector nằm gần nhau trong không gian vector.
3. **Self-Attention Mechanism**: Cho phép mô hình gán trọng số vào các từ liên quan trong toàn bộ chuỗi đầu vào (xử lý song song thay vì tuần tự như RNN/LSTM), giúp hiểu sâu ngữ cảnh dài.
4. **Diffusion Models**: Kiến trúc phổ biến cho **tạo hình ảnh/video** (ví dụ: Stability AI Stable Diffusion, Amazon Titan Image Generator) hoạt động bằng cách thêm nhiễu (noise) rồi học cách khử nhiễu ngược để tạo ảnh sắc nét từ prompt.
5. **Multimodal Models**: Mô hình xử lý đồng thời nhiều dạng dữ liệu đầu vào/đầu ra (Text + Image + Audio/Video), ví dụ: Anthropic Claude 3, Amazon Nova.

> **Exam Tip**: **Context Window** là lượng token tối đa (gồm cả input prompt + output completion) mà mô hình có thể xử lý trong một lượt gọi. Nếu tài liệu vượt quá Context Window, mô hình sẽ cắt bớt hoặc quên thông tin ở đầu/giữa (hiện tượng *Lost in the Middle*).

## 2. Tham số Suy luận (Inference Parameters)

Kiểm soát mức độ sáng tạo (randomness) và độ dài của câu trả lời mà không cần huấn luyện lại mô hình:

| Tham số | Phạm vi / Cơ chế | Khi tăng giá trị | Khi giảm giá trị |
| :--- | :--- | :--- | :--- |
| **Temperature** | Thường `0.0` $\rightarrow$ `1.0` | Tăng tính **sáng tạo, ngẫu nhiên** (phù hợp viết truyện, brainstorming marketing) | Tăng tính **xác định (deterministic), nhất quán** (phù hợp viết SQL, trích xuất JSON, hỏi đáp pháp lý) |
| **Top-P (Nucleus Sampling)** | `0.0` $\rightarrow$ `1.0` (tổng xác suất tích lũy) | Xem xét nhiều token ứng viên hơn $\rightarrow$ câu trả lời đa dạng hơn | Chỉ chọn tập token nhỏ có xác suất tích lũy cao nhất $\rightarrow$ an toàn, ít lan man |
| **Top-K** | Số nguyên (ví dụ `50`, `250`) | Chọn ngẫu nhiên trong $K$ token có xác suất cao nhất | $K=1$ tương đương Greedy Decoding (luôn chọn token xác suất cao nhất) |
| **Max Tokens / Response Length** | Số token tối đa được sinh ra | Cho phép câu trả lời dài hơn (chi phí cao hơn) | Giới hạn độ dài và kiểm soát chi phí/độ trễ |
| **Stop Sequences** | Chuỗi ký tự dừng (ví dụ `###`, `\n\n`) | Mô hình dừng sinh ngay khi gặp chuỗi chỉ định | Kiểm soát định dạng đầu ra chuẩn xác |

> **Exam Tip**: Trong đề thi, nếu yêu cầu *"highly factual, consistent, repeatable answers with minimal creativity"* $\rightarrow$ **giảm Temperature về gần 0** (và/hoặc giảm Top-P). Không bao giờ tăng Temperature khi muốn giảm Hallucination!

## 3. Hệ sinh thái Dịch vụ Generative AI trên AWS

AWS thiết kế kiến trúc GenAI theo **3 tầng (3-Layer Stack)**:

1. **Tầng Hạ tầng (Infrastructure & Frameworks)**: Dành cho đội ngũ tự huấn luyện FM từ đầu — sử dụng chip chuyên dụng **AWS Trainium** (tối ưu chi phí/hiệu năng cho **Training**) và **AWS Inferentia** (tối ưu cho **Inference**), cùng EC2 GPU (P5/G5) và **Amazon SageMaker**.
2. **Tầng Công cụ Xây dựng FM (FM Tools)**:
   - **Amazon Bedrock**: Dịch vụ **Serverless, Fully Managed** cung cấp quyền truy cập vào nhiều FM hàng đầu (Amazon Titan/Nova, Anthropic Claude, Meta Llama, Mistral, Cohere, AI21, Stability AI) thông qua **một API thống nhất**.
   - **Amazon SageMaker JumpStart**: Trung tâm ML Hub cho phép triển khai nhanh các mô hình mã nguồn mở/độc quyền (Hugging Face, Llama, Falcon...) lên **hạ tầng SageMaker riêng của bạn** khi bạn cần kiểm soát sâu instance type, mạng VPC và tùy chỉnh mã huấn luyện.
3. **Tầng Ứng dụng GenAI sẵn có (Applications)**:
   - **Amazon Q Business**: Trợ lý AI doanh nghiệp kết nối trực tiếp dữ liệu nội bộ (S3, SharePoint, Jira, Slack, Salesforce) để hỏi đáp, tóm tắt và tự động hóa tác vụ, tự động tôn trọng quyền truy cập (ACL) của người dùng.
   - **Amazon Q Developer**: Trợ lý AI cho lập trình viên (tích hợp IDE và AWS Console) giúp sinh code, giải thích code, quét lỗ hổng bảo mật và nâng cấp phiên bản Java/.NET (Code Transformation).
   - **PartyRock (powered by Amazon Bedrock)**: Môi trường **No-code Playground** trực quan giúp bất kỳ ai thử nghiệm prompt và xây dựng ứng dụng GenAI mini nhanh chóng mà không cần tài khoản AWS phức tạp.

## 4. Mô hình Định giá & Lựa chọn Amazon Bedrock vs SageMaker JumpStart

```json
// Ví dụ payload gọi InvokeModel trên Amazon Bedrock (Claude / Titan)
{
  "anthropic_version": "bedrock-2023-05-31",
  "max_tokens": 512,
  "temperature": 0.1,
  "top_p": 0.9,
  "messages": [
    { "role": "user", "content": "Summarize the AWS Shared Responsibility Model in 3 bullet points." }
  ]
}
```

- **Bedrock Pricing Models**:
  - **On-Demand**: Trả theo từng token input/output (pay-as-you-go). Phù hợp lưu lượng biến động, mới khởi chạy, thử nghiệm.
  - **Batch Inference**: Xử lý hàng loạt prompt từ file S3 với chi phí rẻ hơn (giảm tới 50%) so với On-Demand cho các tác vụ không cần thời gian thực.
  - **Provisioned Throughput**: Đặt trước băng thông (Model Units - MUs) theo cam kết 1 tháng/6 tháng. Bắt buộc khi cần **hiệu năng đảm bảo (guaranteed throughput)** cho ứng dụng production lưu lượng lớn hoặc khi chạy **Custom Fine-tuned Models** trên Bedrock.

> **Exam Tip**: Khi so sánh **Bedrock vs SageMaker JumpStart**: cần **Serverless, không quản lý hạ tầng, triển khai nhanh qua API** $\rightarrow$ **Amazon Bedrock**. Cần **kiểm soát toàn diện EC2/GPU instance, tùy biến framework PyTorch/TensorFlow hoặc chạy mô hình open-source tùy chỉnh không có trên Bedrock** $\rightarrow$ **SageMaker JumpStart**.

---

[← Bài trước](03-sagemaker-mlops-pipelines-feature-store.md) | [Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/04-genai-transformers-bedrock.md) | [Bài tiếp →](05-tokenization-quantization-model-evaluation.md)
