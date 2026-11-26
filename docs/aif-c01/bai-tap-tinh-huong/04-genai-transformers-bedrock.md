# Bài tập tình huống — Kiến trúc Generative AI, Transformers & Amazon Bedrock

> Cơ chế Self-Attention, Encoder-Decoder, Diffusion Models, Foundation Models (Claude, Titan, Llama) và dịch vụ Serverless Amazon Bedrock.
> **Số câu hỏi:** 11 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A media company needs to summarize 500,000 archived news articles stored in Amazon S3 every weekend. Latency is not critical as long as the job completes within 12 hours, and the company wants to minimize Amazon Bedrock inference costs. Which TWO options best meet these requirements? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Use Amazon Bedrock Batch Inference
- **B.** Store input prompts in JSONL format in Amazon S3
- **C.** Purchase 6-month Provisioned Throughput with maximum Model Units
- **D.** Set Temperature to 2.0 to speed up token generation
- **E.** Use Amazon SageMaker Real-Time Inference with single-AZ endpoints

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty truyền thông cần tóm tắt 500.000 bài báo lưu trữ trong Amazon S3 vào mỗi cuối tuần. Độ trễ không quan trọng miễn là tác vụ hoàn thành trong vòng 12 giờ, và công ty muốn tối thiểu hóa chi phí suy luận Amazon Bedrock. HAI tùy chọn nào đáp ứng tốt nhất các yêu cầu này? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, B**

Khi xử lý dữ liệu văn bản khổng lồ không cần real-time trên Amazon Bedrock, Batch Inference với file JSONL trên S3 giúp tiết kiệm chi phí vượt trội so với On-Demand và Provisioned Throughput.

- **A (Đúng):** Chính xác. Amazon Bedrock Batch Inference được thiết kế cho xử lý hàng loạt bất đồng bộ trên dữ liệu lớn từ S3 và có mức giá thấp hơn đáng kể (thường giảm ~50%) so với On-Demand.
- **B (Đúng):** Chính xác. Bedrock Batch Inference nhận đầu vào là các file JSONL lưu trên Amazon S3 và xuất kết quả ra S3.
- **C:** Sai. Provisioned Throughput tính phí cố định theo giờ/tháng, rất tốn kém cho tác vụ chỉ chạy vào cuối tuần.
- **D:** Sai. Temperature không làm tăng tốc độ sinh token mà chỉ làm câu trả lời ngẫu nhiên, thiếu chính xác hơn.
- **E:** Sai. Real-Time Inference không tối ưu cho bài toán batch hàng loạt 500.000 bài báo trên Bedrock.

</details>

### Câu 2 `medium`

A customer-facing generative AI application built on Amazon Bedrock requires deterministic, factual responses for answering policy questions. Which TWO inference parameter adjustments help reduce randomness and creativity? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Set Temperature close to 0
- **B.** Lower the Top-P (nucleus sampling) value
- **C.** Increase Temperature to 1.0
- **D.** Increase Top-K to its maximum value
- **E.** Increase Max Tokens to 4096

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng generative AI hướng tới khách hàng được xây dựng trên Amazon Bedrock yêu cầu các phản hồi mang tính xác định và bám sát thực tế để trả lời các câu hỏi về chính sách. HAI điều chỉnh tham số suy luận nào giúp giảm tính ngẫu nhiên và sự sáng tạo? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, B**

Để có câu trả lời thực tế, nhất quán và ít bịa đặt (deterministic), cần giảm Temperature (gần 0) và giảm Top-P / Top-K.

- **A (Đúng):** Chính xác. Temperature gần 0 làm phân phối xác suất tập trung vào token có xác suất cao nhất, giúp câu trả lời nhất quán và ít ngẫu nhiên.
- **B (Đúng):** Chính xác. Giảm Top-P thu hẹp tập các token ứng viên có tổng xác suất tích lũy nhỏ hơn, hạn chế các lựa chọn từ ngữ bất ngờ/sáng tạo.
- **C:** Sai. Tăng Temperature làm tăng tính ngẫu nhiên và sáng tạo, dễ gây sai lệch thông tin chính sách.
- **D:** Sai. Tăng Top-K cho phép nhiều token xác suất thấp hơn tham gia vào quá trình chọn từ, làm tăng độ ngẫu nhiên.
- **E:** Sai. Max Tokens chỉ giới hạn độ dài tối đa của câu trả lời, không kiểm soát tính ngẫu nhiên.

</details>

### Câu 3 `medium`

An enterprise plans to fine-tune an Amazon Titan text model on Amazon Bedrock for a high-throughput internal customer support application with predictable, continuous traffic. Which Amazon Bedrock pricing option is required to deploy and invoke the custom fine-tuned model?

- **A.** On-Demand pricing
- **B.** Provisioned Throughput
- **C.** AWS Spot Instances
- **D.** Amazon Bedrock Batch Inference only

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp dự định tinh chỉnh (fine-tune) một mô hình Amazon Titan text trên Amazon Bedrock cho ứng dụng hỗ trợ khách hàng nội bộ có thông lượng cao với lưu lượng liên tục và có thể dự đoán trước. Tùy chọn định giá nào của Amazon Bedrock là bắt buộc để triển khai và gọi mô hình tùy chỉnh đã fine-tune?

**Đáp án đúng:** **B**

Một điểm thi rất hay gặp của Amazon Bedrock: Custom models (sau khi Fine-tuning hoặc Continued Pre-training) bắt buộc phải sử dụng Provisioned Throughput để inference.

- **A:** Sai. Trên Amazon Bedrock, các mô hình custom fine-tuned không thể chạy bằng On-Demand mà bắt buộc phải mua Provisioned Throughput.
- **B (Đúng):** Chính xác. Provisioned Throughput cung cấp năng lực tính toán dành riêng (Model Units) theo cam kết thời gian, là lựa chọn bắt buộc để triển khai custom fine-tuned models trên Amazon Bedrock và tối ưu chi phí cho lưu lượng lớn ổn định.
- **C:** Sai. Amazon Bedrock là dịch vụ serverless hoàn toàn, người dùng không quản lý EC2 hay Spot Instances.
- **D:** Sai. Batch Inference chỉ dùng cho xử lý bất đồng bộ hàng loạt, không phục vụ ứng dụng hỗ trợ khách hàng thời gian thực.

</details>

### Câu 4 `medium`

A startup wants to deploy an open-weights Foundation Model (such as Llama 3) with full control over the underlying GPU instances, custom inference containers, and VPC networking. Which AWS service provides one-click access to pre-trained open-source Foundation Models with dedicated infrastructure control?

- **A.** Amazon Bedrock On-Demand
- **B.** Amazon Rekognition Custom
- **C.** Amazon SageMaker JumpStart
- **D.** AWS Glue DataBrew ETL

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một startup muốn triển khai một Foundation Model mở trọng số (open-weights, chẳng hạn Llama 3) với toàn quyền kiểm soát các GPU instance nền tảng, container suy luận tùy chỉnh và mạng VPC. Dịch vụ AWS nào cung cấp quyền truy cập chỉ với một cú nhấp chuột vào các Foundation Model mã nguồn mở đã huấn luyện trước cùng khả năng kiểm soát hạ tầng chuyên dụng?

**Đáp án đúng:** **C**

Khi đề bài nhấn mạnh quyền kiểm soát hạ tầng (GPU instance types, custom containers, VPC deployment) cho mô hình open-weights, đáp án là Amazon SageMaker JumpStart thay vì Bedrock.

- **A:** Sai. Amazon Bedrock là dịch vụ serverless hoàn toàn, không cho phép người dùng chọn loại GPU instance hay tùy chỉnh container hạ tầng bên dưới.
- **B:** Sai. Rekognition là dịch vụ Computer Vision quản lý sẵn, không triển khai LLM.
- **C (Đúng):** Chính xác. SageMaker JumpStart cung cấp kho mô hình open-source/proprietary phong phú để triển khai trực tiếp lên hạ tầng SageMaker endpoint do khách hàng kiểm soát hoàn toàn instance GPU và VPC.
- **D:** Sai. AWS Glue là dịch vụ ETL dữ liệu.

</details>

### Câu 5 `medium`

A media agency is processing 500,000 product descriptions overnight to generate localized marketing summaries using Amazon Bedrock. Real-time responses are not needed, and minimizing cost is the top priority. Which TWO strategies will MOST effectively reduce costs? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Purchase Provisioned Throughput with a 6-month commitment for this one-time job
- **B.** Use Amazon Bedrock Batch Inference for asynchronous bulk processing
- **C.** Enable streaming responses via InvokeModelWithResponseStream for every API call
- **D.** Select a cost-optimized Foundation Model (e.g., Nova Micro or Claude Haiku)
- **E.** Increase the Temperature parameter to 1.0 to reduce total inference latency

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty truyền thông đang xử lý 500.000 mô tả sản phẩm qua đêm để tạo các bản tóm tắt marketing bản địa hóa bằng Amazon Bedrock. Không cần phản hồi theo thời gian thực và việc tối thiểu hóa chi phí là ưu tiên hàng đầu. HAI chiến lược nào sẽ giảm chi phí HIỆU QUẢ NHẤT? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Để tối ưu chi phí trên Amazon Bedrock cho tác vụ offline khối lượng lớn, kết hợp Batch Inference (giảm ~50% giá) và chọn đúng kích thước Foundation Model (right-sizing model) là phương án tối ưu nhất.

- **A:** Sai. Provisioned Throughput chỉ tiết kiệm khi lưu lượng ổn định liên tục, không phù hợp cho batch job chạy qua đêm.
- **B (Đúng):** Chính xác. Amazon Bedrock Batch Inference xử lý dữ liệu lớn bất đồng bộ từ S3 với mức giá rẻ hơn tới 50% so với On-Demand.
- **C:** Sai. Streaming cải thiện độ trễ cảm nhận (TTFT) cho người dùng cuối chứ không làm giảm chi phí token.
- **D (Đúng):** Chính xác. Chọn mô hình kích thước nhỏ hơn/tối ưu chi phí cho các tác vụ tóm tắt đơn giản giúp giảm đáng kể chi phí trên mỗi 1,000 token.
- **E:** Sai. Temperature không ảnh hưởng đến đơn giá xử lý token.

</details>

### Câu 6 `easy`

Which TWO statements accurately describe Foundation Models (FMs) compared to traditional task-specific machine learning models? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Foundation Models require less compute and memory during inference than linear regression models
- **B.** Foundation Models only accept structured tabular CSV data and cannot process unstructured text inputs
- **C.** Foundation Models are pre-trained on massive datasets and can be adapted to many downstream tasks
- **D.** Foundation Models can perform new tasks with zero or few examples through prompting without retraining
- **E.** Foundation Models guarantee 100% factual accuracy without needing external grounding or verification

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** HAI phát biểu nào mô tả chính xác về Foundation Models (FMs) so với các mô hình machine learning chuyên biệt theo từng tác vụ truyền thống? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, D**

Foundation Models nổi bật nhờ khả năng tổng quát hóa đa tác vụ từ dữ liệu pre-training khổng lồ và khả năng thích ứng nhanh qua prompting.

- **A:** Sai. FM có hàng tỷ tham số nên tiêu tốn tài nguyên tính toán và bộ nhớ lớn hơn rất nhiều so với mô hình truyền thống.
- **B:** Sai. FM xử lý dữ liệu phi cấu trúc như văn bản, hình ảnh, âm thanh, video.
- **C (Đúng):** Chính xác. FM được tiền huấn luyện (pre-trained) trên lượng dữ liệu khổng lồ bằng self-supervised learning và có thể thích ứng cho nhiều tác vụ khác nhau (tóm tắt, dịch thuật, hỏi đáp, viết code).
- **D (Đúng):** Chính xác. Nhờ khả năng in-context learning (zero-shot / few-shot prompting), FM giải quyết tác vụ mới mà không cần huấn luyện lại trọng số.
- **E:** Sai. FM vẫn có thể bị ảo giác (hallucination) nếu không có RAG hoặc kiểm chứng thực tế.

</details>

### Câu 7 `medium`

A customer support chatbot built on Amazon Bedrock responds to user queries, but users complain that they have to wait 8 seconds before seeing any text appear on screen. Which API capability should developers use to significantly improve perceived latency without changing the Foundation Model?

- **A.** Switch all real-time chat traffic to Amazon Bedrock Batch Inference jobs
- **B.** Increase Top-K to 500 and Temperature to 1.0 in the inference payload
- **C.** Use streaming inference (InvokeModelWithResponseStream or ConverseStream)
- **D.** Convert the customer chatbot to use Amazon SageMaker Ground Truth

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một chatbot hỗ trợ khách hàng xây dựng trên Amazon Bedrock phản hồi các truy vấn của người dùng, nhưng người dùng phàn nàn rằng họ phải đợi 8 giây trước khi thấy bất kỳ chữ nào xuất hiện trên màn hình. Các lập trình viên nên sử dụng khả năng API nào để cải thiện đáng kể độ trễ cảm nhận mà không thay đổi Foundation Model?

**Đáp án đúng:** **C**

Streaming response (`InvokeModelWithResponseStream` / `ConverseStream`) giúp giảm độ trễ cảm nhận (perceived latency) bằng cách hiển thị câu trả lời từng phần ngay lập tức.

- **A:** Sai. Batch Inference chạy bất đồng bộ qua S3, không dùng cho chatbot tương tác thời gian thực.
- **B:** Sai. Tham số sampling không làm giảm độ trễ phản hồi.
- **C (Đúng):** Chính xác. Streaming trả về từng token ngay khi mô hình vừa sinh ra, giảm mạnh Time-To-First-Token (TTFT) và cải thiện trải nghiệm người dùng đáng kể.
- **D:** Sai. Ground Truth là dịch vụ gắn nhãn dữ liệu.

</details>

### Câu 8 `medium`

During the alignment phase of training a Large Language Model, human labelers rank multiple model responses to the same prompt from best to worst, and those rankings are used to train a reward model that guides further fine-tuning. What is this alignment technique called?

- **A.** Unsupervised K-means centroid clustering
- **B.** Principal Component Analysis (PCA) reduction
- **C.** Optical Character Recognition (OCR) extraction
- **D.** Reinforcement Learning from Human Feedback (RLHF)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong giai đoạn căn chỉnh (alignment) khi huấn luyện Large Language Model, người gán nhãn xếp hạng nhiều phản hồi của mô hình cho cùng một prompt từ tốt nhất đến tệ nhất, và các xếp hạng đó được dùng để huấn luyện một reward model nhằm dẫn hướng quá trình fine-tuning tiếp theo. Kỹ thuật căn chỉnh này được gọi là gì?

**Đáp án đúng:** **D**

Quy trình chuẩn tạo LLM hiện đại gồm: Self-supervised Pre-training -> Supervised Fine-Tuning (SFT) -> Alignment với RLHF (hoặc DPO) để phù hợp với kỳ vọng của con người.

- **A:** Sai. K-means là thuật toán phân cụm dữ liệu.
- **B:** Sai. PCA là kỹ thuật giảm chiều dữ liệu.
- **C:** Sai. OCR là nhận diện chữ viết từ hình ảnh.
- **D (Đúng):** Chính xác. RLHF sử dụng đánh giá xếp hạng của con người để huấn luyện Reward Model, sau đó tối ưu LLM nhằm sinh ra câu trả lời hữu ích, trung thực và an toàn hơn (helpful, honest, harmless).

</details>

### Câu 9 `medium`

A startup wants to rapidly experiment with multiple foundation models from Anthropic, Meta, and Amazon through a single serverless API without provisioning or managing any underlying GPU infrastructure. Which AWS service best meets this requirement?

- **A.** Amazon SageMaker JumpStart
- **B.** Amazon Bedrock
- **C.** Amazon EC2 P5 instances
- **D.** Amazon Q Developer

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một startup muốn nhanh chóng thử nghiệm nhiều foundation model từ Anthropic, Meta và Amazon thông qua một serverless API duy nhất mà không phải cấp phát hay quản lý bất kỳ hạ tầng GPU nền tảng nào. Dịch vụ AWS nào đáp ứng tốt nhất yêu cầu này?

**Đáp án đúng:** **B**

Khi đề bài yêu cầu truy cập nhiều FM qua 1 API duy nhất, Serverless, không quản lý hạ tầng -> chọn Amazon Bedrock. Nếu cần kiểm soát sâu hạ tầng GPU/instance hoặc tùy chỉnh framework -> chọn SageMaker JumpStart.

- **A:** Sai. SageMaker JumpStart triển khai mô hình lên các EC2/GPU instance do khách hàng quản lý trong tài khoản SageMaker, không phải dịch vụ API serverless hoàn toàn.
- **B (Đúng):** Chính xác. Amazon Bedrock là dịch vụ Serverless quản lý hoàn toàn cung cấp quyền truy cập đa dạng Foundation Models (Anthropic, Meta, Amazon, Mistral, Cohere...) thông qua một API thống nhất.
- **C:** Sai. EC2 P5 đòi hỏi khách hàng tự quản lý hạ tầng máy chủ, GPU driver và triển khai mô hình.
- **D:** Sai. Amazon Q Developer là trợ lý lập trình cho developer, không phải nền tảng API đa mô hình để xây dựng ứng dụng GenAI tùy chỉnh.

</details>

### Câu 10 `medium`

An AI research company plans to train a custom 70-billion-parameter foundation model from scratch on AWS and wants to minimize training costs using purpose-built AWS ML accelerators. Which AWS chip should they select?

- **A.** AWS Inferentia
- **B.** AWS Trainium
- **C.** AWS Graviton
- **D.** AWS Nitro

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty nghiên cứu AI dự định huấn luyện từ đầu một foundation model tùy chỉnh có 70 tỷ tham số trên AWS và muốn tối thiểu hóa chi phí huấn luyện bằng các bộ tăng tốc ML chuyên dụng của AWS. Họ nên chọn loại chip AWS nào?

**Đáp án đúng:** **B**

Ghi nhớ cặp chip AI chuyên dụng của AWS: AWS Trainium dành cho Training (huấn luyện), AWS Inferentia dành cho Inference (suy luận).

- **A:** Sai. AWS Inferentia được thiết kế chuyên biệt cho giai đoạn suy luận (Inference), không phải huấn luyện (Training).
- **B (Đúng):** Chính xác. AWS Trainium là chip tăng tốc chuyên dụng do AWS thiết kế để tối ưu hiệu năng và giảm chi phí cho quá trình huấn luyện (Training) các mô hình Deep Learning và GenAI quy mô lớn.
- **C:** Sai. AWS Graviton là bộ vi xử lý CPU kiến trúc ARM cho workload đa dụng, không phải chip tăng tốc chuyên dụng để train LLM 70B.
- **D:** Sai. AWS Nitro là hệ thống ảo hóa phần cứng của EC2, không phải chip tăng tốc huấn luyện ML.

</details>

### Câu 11 `hard`

A financial services company has fine-tuned a custom foundation model on Amazon Bedrock and expects high, predictable production traffic that requires guaranteed throughput. Which Amazon Bedrock pricing option must they purchase?

- **A.** On-Demand token pricing
- **B.** Amazon Bedrock Batch Inference
- **C.** Provisioned Throughput
- **D.** Amazon EC2 Spot Instances

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty dịch vụ tài chính đã tinh chỉnh (fine-tune) một foundation model tùy chỉnh trên Amazon Bedrock và dự kiến lưu lượng truy cập production cao, có thể dự đoán trước, đòi hỏi thông lượng được đảm bảo. Họ phải mua tùy chọn định giá nào của Amazon Bedrock?

**Đáp án đúng:** **C**

Trên Amazon Bedrock: On-Demand cho traffic nhỏ/biến động; Batch Inference tiết kiệm chi phí cho tác vụ xử lý lô; Provisioned Throughput cho lưu lượng production lớn ổn định hoặc chạy Custom Model.

- **A:** Sai. On-Demand tính phí theo token và không đảm bảo băng thông cố định, đồng thời Custom Fine-tuned Models trên Bedrock yêu cầu Provisioned Throughput để chạy suy luận.
- **B:** Sai. Batch Inference dùng cho xử lý lô không đồng bộ từ S3, không phù hợp cho ứng dụng production thời gian thực cần băng thông đảm bảo.
- **C (Đúng):** Chính xác. Provisioned Throughput cho phép đặt trước Model Units để đảm bảo thông lượng ổn định (guaranteed throughput) cho production lớn và là yêu cầu bắt buộc khi triển khai Custom Model trên Bedrock.
- **D:** Sai. Amazon Bedrock là dịch vụ serverless và không sử dụng mô hình định giá EC2 Spot Instances.

</details>

---

[Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md)
