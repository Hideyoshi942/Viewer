# Bài tập tình huống — Amazon SageMaker: MLOps, Pipelines, Feature Store & Inference

> Xây dựng quy trình ML tự động với SageMaker Pipelines, Data Wrangler, Feature Store, Model Registry, Model Monitor và các tùy chọn Real-time/Batch/Serverless/Async Inference.
> **Số câu hỏi:** 13 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A retail company is building a real-time fraud detection system using Amazon SageMaker. The model needs to retrieve the latest customer transaction features within single-digit milliseconds during inference, while data scientists also need historical feature values stored in Amazon S3 for model training. Which SageMaker capability satisfies both requirements?

- **A.** Amazon SageMaker Data Wrangler scheduled exports directly to Amazon DynamoDB tables
- **B.** Amazon SageMaker Feature Store with both Online Store and Offline Store enabled
- **C.** Amazon SageMaker Model Registry integrated with Amazon S3 object versioning enabled
- **D.** Amazon SageMaker Clarify configured with real-time endpoint data quality monitoring

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty bán lẻ đang xây dựng hệ thống phát hiện gian lận theo thời gian thực bằng Amazon SageMaker. Mô hình cần truy xuất các đặc trưng giao dịch khách hàng mới nhất trong vòng vài mili-giây đơn lẻ khi suy luận, đồng thời các nhà khoa học dữ liệu cũng cần các giá trị đặc trưng lịch sử lưu trữ trong Amazon S3 để huấn luyện mô hình. Tính năng nào của SageMaker đáp ứng cả hai yêu cầu?

**Đáp án đúng:** **B**

Trong kiến trúc MLOps trên AWS, Amazon SageMaker Feature Store là giải pháp chuẩn để tránh training-serving skew bằng cách dùng Online Store cho real-time inference (ms) và Offline Store (S3) cho training.

- **A:** Sai. Data Wrangler là công cụ chuẩn bị dữ liệu và feature engineering trực quan, không phải kho lưu trữ feature hai lớp cho real-time và historical training.
- **B (Đúng):** Chính xác. SageMaker Feature Store cung cấp Online Store (độ trễ mili-giây cho real-time inference) và Offline Store (lưu trữ lịch sử dạng Parquet trên Amazon S3 cho training và batch inference), đồng thời đảm bảo tính nhất quán dữ liệu.
- **C:** Sai. Model Registry dùng để quản lý phiên bản và phê duyệt mô hình ML, không lưu trữ feature dữ liệu.
- **D:** Sai. SageMaker Clarify dùng để phát hiện bias và giải thích mô hình (explainability), không phải feature store.

</details>

### Câu 2 `medium`

A medical imaging startup needs to run inference on 500 MB high-resolution radiology scans using an Amazon SageMaker model. Each request takes approximately 12 minutes to process, and the workload has periods of zero traffic overnight. Which SageMaker inference option is MOST cost-effective?

- **A.** Amazon SageMaker Real-Time Inference
- **B.** Amazon SageMaker Serverless Inference
- **C.** Amazon SageMaker Asynchronous Inference
- **D.** Amazon SageMaker Batch Transform

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một startup chẩn đoán hình ảnh y tế cần chạy suy luận trên các ảnh chụp X-quang độ phân giải cao dung lượng 500 MB bằng mô hình Amazon SageMaker. Mỗi yêu cầu mất khoảng 12 phút để xử lý và khối lượng công việc có những khoảng thời gian hoàn toàn không có lưu lượng vào ban đêm. Tùy chọn suy luận SageMaker nào TIẾT KIỆM CHI PHÍ NHẤT?

**Đáp án đúng:** **C**

Cần nhớ giới hạn 4 tùy chọn Inference của SageMaker: Serverless (< 4 MB, < 60s), Real-time (< 25 MB, < 60s), Asynchronous (lên tới 1 GB, lên tới 1 giờ, scale-to-zero), và Batch Transform (offline hàng loạt từ S3).

- **A:** Sai. Real-Time Inference chỉ hỗ trợ payload tối đa 25 MB và timeout 60 giây, đồng thời tính phí 24/7 nếu không scale xuống 0.
- **B:** Sai. Serverless Inference giới hạn payload tối đa 4 MB và thời gian xử lý tối đa 60 giây.
- **C (Đúng):** Chính xác. Asynchronous Inference hỗ trợ payload lớn lên tới 1 GB, thời gian xử lý tối đa 1 giờ, sử dụng hàng đợi nội bộ và hỗ trợ scale-to-zero khi không có traffic.
- **D:** Sai. Batch Transform phù hợp cho xử lý hàng loạt dữ liệu tĩnh có sẵn trên S3 theo lịch, không phù hợp khi cần xử lý từng request tải lên qua endpoint theo hàng đợi.

</details>

### Câu 3 `easy`

A data analytics team has a labeled tabular dataset in Amazon S3 and wants to automatically train, tune, and compare multiple machine learning algorithms to find the best-performing model with minimal manual coding. Which AWS service or feature should they use?

- **A.** Amazon SageMaker Autopilot
- **B.** Amazon SageMaker Model Monitor
- **C.** Amazon Rekognition Custom Labels
- **D.** Amazon Bedrock Knowledge Bases

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ phân tích dữ liệu có tập dữ liệu dạng bảng đã được gán nhãn trong Amazon S3 và muốn tự động huấn luyện, tinh chỉnh và so sánh nhiều thuật toán machine learning để tìm ra mô hình hoạt động tốt nhất với ít mã nguồn thủ công nhất. Họ nên sử dụng dịch vụ hoặc tính năng AWS nào?

**Đáp án đúng:** **A**

Amazon SageMaker Autopilot là giải pháp AutoML dành cho dữ liệu dạng bảng (tabular) có nhãn, tự động hóa từ tiền xử lý đến huấn luyện và tinh chỉnh mô hình.

- **A (Đúng):** Chính xác. SageMaker Autopilot là công cụ AutoML tự động khám phá dữ liệu, chọn thuật toán phù hợp, tinh chỉnh hyperparameter và xuất ra các mô hình tốt nhất kèm notebook minh bạch.
- **B:** Sai. Model Monitor dùng để giám sát data drift và model quality drift sau khi mô hình đã deploy lên endpoint.
- **C:** Sai. Rekognition Custom Labels chuyên cho dữ liệu hình ảnh (computer vision), không dùng cho dữ liệu bảng (tabular).
- **D:** Sai. Bedrock Knowledge Bases là dịch vụ RAG cho dữ liệu văn bản phi cấu trúc và Foundation Models.

</details>

### Câu 4 `medium`

A logistics company deployed a delivery-time prediction model in production six months ago. Recently, seasonal traffic patterns changed significantly, and the team wants to automatically detect when incoming inference data diverges from the training data baseline. Which SageMaker feature should they configure?

- **A.** Amazon SageMaker Pipelines
- **B.** Amazon SageMaker JumpStart
- **C.** Amazon SageMaker Model Monitor
- **D.** Amazon SageMaker Canvas

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty logistics đã triển khai mô hình dự đoán thời gian giao hàng trên production cách đây sáu tháng. Gần đây, các mẫu lưu lượng theo mùa thay đổi đáng kể và đội ngũ muốn tự động phát hiện khi dữ liệu suy luận đầu vào sai lệch so với đường cơ sở (baseline) của dữ liệu huấn luyện. Họ nên cấu hình tính năng SageMaker nào?

**Đáp án đúng:** **C**

SageMaker Model Monitor giám sát liên tục endpoint trong production để phát hiện 4 loại sai lệch: Data Quality Drift, Model Quality Drift, Bias Drift và Feature Attribution Drift.

- **A:** Sai. SageMaker Pipelines dùng để tự động hóa quy trình CI/CD huấn luyện và triển khai ML, không tự động giám sát drift trên endpoint.
- **B:** Sai. JumpStart là thư viện chứa sẵn các mô hình và giải pháp mẫu để triển khai nhanh.
- **C (Đúng):** Chính xác. SageMaker Model Monitor so sánh dữ liệu đầu vào thực tế trên endpoint với baseline thống kê từ tập train để phát hiện Data Quality Drift và gửi cảnh báo qua CloudWatch.
- **D:** Sai. Canvas là công cụ xây dựng mô hình không cần code cho business analyst.

</details>

### Câu 5 `medium`

A machine learning team wants to standardize their end-to-end ML workflow so that every new dataset triggers automated preprocessing, training, evaluation, and manual approval before deploying to production. Which TWO Amazon SageMaker capabilities should they combine? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Amazon Comprehend Custom
- **B.** Amazon SageMaker Pipelines
- **C.** Amazon Polly Neural TTS
- **D.** Amazon SageMaker Model Registry
- **E.** AWS PartyRock Playground

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ machine learning muốn chuẩn hóa quy trình ML đầu-cuối (end-to-end) sao cho mỗi tập dữ liệu mới sẽ kích hoạt tự động tiền xử lý, huấn luyện, đánh giá và phê duyệt thủ công trước khi triển khai lên production. Họ nên kết hợp HAI khả năng nào của Amazon SageMaker? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Bộ đôi chuẩn MLOps cho tự động hóa và quản trị phát hành mô hình trên AWS là SageMaker Pipelines (điều phối workflow) và SageMaker Model Registry (quản lý phiên bản & phê duyệt).

- **A:** Sai. Amazon Comprehend là dịch vụ NLP được quản lý, không phải công cụ điều phối quy trình MLOps.
- **B (Đúng):** Chính xác. SageMaker Pipelines định nghĩa và tự động hóa chuỗi các bước CI/CD từ xử lý dữ liệu, huấn luyện đến đánh giá mô hình.
- **C:** Sai. Amazon Polly là dịch vụ chuyển văn bản thành giọng nói (Text-to-Speech).
- **D (Đúng):** Chính xác. Model Registry lưu trữ các phiên bản mô hình cùng trạng thái phê duyệt (PendingManualApproval/Approved) để kiểm soát quy trình đưa lên production.
- **E:** Sai. PartyRock là playground web để thử nghiệm prompt và chia sẻ app GenAI đơn giản.

</details>

### Câu 6 `easy`

An e-commerce company wants to deploy a serverless inference endpoint in Amazon SageMaker for an internal product-categorization model that receives sporadic traffic only a few times per hour with payloads under 2 MB. Which deployment option minimizes cost?

- **A.** Amazon SageMaker Serverless Inference
- **B.** Amazon SageMaker Real-Time Inference on GPU instances
- **C.** Amazon SageMaker Asynchronous Inference with dedicated Provisioned IOPS
- **D.** Amazon Bedrock Provisioned Throughput

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty thương mại điện tử muốn triển khai một endpoint suy luận không máy chủ (serverless inference) trong Amazon SageMaker cho mô hình phân loại sản phẩm nội bộ vốn chỉ nhận lưu lượng rải rác vài lần mỗi giờ với kích thước payload dưới 2 MB. Tùy chọn triển khai nào tối thiểu hóa chi phí?

**Đáp án đúng:** **A**

Với traffic thưa thớt/không đều, payload < 4 MB và chấp nhận được cold start nhẹ, Amazon SageMaker Serverless Inference là lựa chọn tối ưu chi phí nhất.

- **A (Đúng):** Chính xác. Serverless Inference tự động cấp phát và thu hồi tài nguyên theo request, không tính phí khi nhàn rỗi, rất lý tưởng cho traffic ngắt quãng với payload < 4 MB.
- **B:** Sai. Real-Time Inference chạy liên tục 24/7 nên gây lãng phí chi phí khi traffic thưa thớt.
- **C:** Sai. Asynchronous Inference dành cho payload lớn (lên tới 1 GB) và thời gian xử lý dài (lên tới 1 giờ), không cần thiết cho payload nhỏ < 2 MB.
- **D:** Sai. Provisioned Throughput là mô hình thuê công suất cố định theo giờ/tháng trên Bedrock, đắt đỏ với traffic thấp và thưa thớt.

</details>

### Câu 7 `medium`

A data scientist trains a deep neural network on Amazon SageMaker to predict equipment failure. The model achieves 99% accuracy on the training dataset but only 61% accuracy on the validation dataset. Which technique would BEST address this issue?

- **A.** Increase the number of hidden layers and training epochs to capture more complex patterns
- **B.** Apply dropout or L2 regularization, and gather more diverse training data to improve generalization
- **C.** Remove the input features that have the highest statistical correlation to the target variable
- **D.** Switch the evaluation objective from classification metrics to Root Mean Squared Error (RMSE)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà khoa học dữ liệu huấn luyện một mạng nơ-ron sâu trên Amazon SageMaker để dự đoán hỏng hóc thiết bị. Mô hình đạt độ chính xác 99% trên tập dữ liệu huấn luyện nhưng chỉ đạt 61% trên tập dữ liệu kiểm định (validation). Kỹ thuật nào sẽ giải quyết TỐT NHẤT vấn đề này?

**Đáp án đúng:** **B**

Chênh lệch lớn giữa hiệu năng trên tập huấn luyện và tập kiểm thử là biểu hiện của Overfitting. Các biện pháp khắc phục chuẩn gồm Regularization (L1/L2, Dropout), Early Stopping, giảm độ phức tạp mô hình hoặc bổ sung dữ liệu đa dạng.

- **A:** Sai. Mô hình đang bị Overfitting (học vẹt trên tập train); việc tăng thêm layer hoặc epoch sẽ làm Overfitting trầm trọng hơn.
- **B (Đúng):** Chính xác. Độ chính xác rất cao trên tập train (99%) nhưng thấp trên tập validation (61%) là dấu hiệu điển hình của Overfitting (high variance). Regularization (Dropout, L1/L2), Early Stopping và tăng dữ liệu huấn luyện giúp mô hình tổng quát hóa tốt hơn.
- **C:** Sai. Loại bỏ các feature quan trọng nhất sẽ làm giảm khả năng dự đoán của mô hình (gây Underfitting).
- **D:** Sai. RMSE là metric cho bài toán Regression, không giải quyết vấn đề Overfitting của mô hình Classification.

</details>

### Câu 8 `easy`

A business analyst with no programming or machine learning experience needs to build a customer churn prediction model using a CSV dataset stored in Amazon S3, and generate explainable forecasts through a visual interface. Which AWS service should the analyst use?

- **A.** Amazon SageMaker Canvas
- **B.** Amazon SageMaker Studio notebooks
- **C.** Amazon Comprehend
- **D.** Amazon Bedrock

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một chuyên viên phân tích kinh doanh không có kinh nghiệm lập trình hay machine learning cần xây dựng mô hình dự đoán khách hàng rời bỏ (churn) từ tập dữ liệu CSV lưu trong Amazon S3 và tạo các dự báo có thể giải thích được thông qua giao diện trực quan. Chuyên viên phân tích nên sử dụng dịch vụ AWS nào?

**Đáp án đúng:** **A**

Amazon SageMaker Canvas giúp người dùng không chuyên lập trình (như Business Analyst) xây dựng mô hình ML (tabular, time-series, CV/NLP) và xem giải thích tầm quan trọng của feature qua giao diện trực quan.

- **A (Đúng):** Chính xác. Amazon SageMaker Canvas là công cụ no-code với giao diện kéo-thả trực quan dành cho Business Analyst để tạo mô hình ML và dự đoán mà không cần viết code.
- **B:** Sai. SageMaker Studio notebooks hướng tới Data Scientist và lập trình viên viết code Python/PyTorch/Scikit-learn.
- **C:** Sai. Amazon Comprehend là dịch vụ xử lý ngôn ngữ tự nhiên (NLP) cho văn bản phi cấu trúc, không dùng để huấn luyện mô hình dự đoán churn trên dữ liệu bảng CSV.
- **D:** Sai. Amazon Bedrock dùng để xây dựng ứng dụng Generative AI với Foundation Models, không phải công cụ AutoML no-code cho dữ liệu bảng.

</details>

### Câu 9 `hard`

An ML engineering team deployed a credit scoring model to an Amazon SageMaker real-time endpoint six months ago. Recently, business stakeholders noticed that loan default predictions have become less accurate as economic conditions shifted. Which TWO SageMaker features should the team use to detect data drift and track model versions systematically? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Amazon SageMaker Ground Truth
- **B.** Amazon SageMaker Model Monitor
- **C.** Amazon Kendra intelligent search
- **D.** Amazon SageMaker Model Registry
- **E.** Amazon Personalize recommendations

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ kỹ sư ML đã triển khai mô hình chấm điểm tín dụng lên Amazon SageMaker real-time endpoint cách đây sáu tháng. Gần đây, các bên liên quan nhận thấy dự đoán vỡ nợ kém chính xác hơn khi điều kiện kinh tế thay đổi. Đội ngũ nên sử dụng HAI tính năng nào của SageMaker để phát hiện độ trôi dữ liệu (data drift) và theo dõi các phiên bản mô hình một cách có hệ thống? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Trong vận hành MLOps trên SageMaker, Model Monitor giúp phát hiện sớm sự suy giảm chất lượng do data/concept drift, còn Model Registry giúp lưu trữ, đánh dấu phiên bản và kiểm soát việc triển khai mô hình tái huấn luyện.

- **A:** Sai. Ground Truth dùng để gắn nhãn dữ liệu (data labeling), không dùng để giám sát drift hoặc quản lý phiên bản mô hình.
- **B (Đúng):** Chính xác. SageMaker Model Monitor liên tục theo dõi endpoint production để phát hiện data drift, model quality drift và bias drift.
- **C:** Sai. Amazon Kendra là dịch vụ tìm kiếm tài liệu doanh nghiệp.
- **D (Đúng):** Chính xác. SageMaker Model Registry quản lý danh mục phiên bản mô hình, metadata và quy trình phê duyệt (staging/production) một cách có hệ thống.
- **E:** Sai. Amazon Personalize là dịch vụ gợi ý sản phẩm/nội dung.

</details>

### Câu 10 `medium`

A global call center records thousands of customer support phone calls daily and wants to automatically transcribe the audio, redact sensitive spoken PII, and analyze customer sentiment and key conversation topics. Which combination of AWS AI services BEST fulfills this workflow?

- **A.** Amazon Polly for speech-to-text transcription, followed by Amazon Rekognition for sentiment analysis
- **B.** Amazon Textract for audio call extraction, followed by Amazon Forecast for customer topic modeling
- **C.** Amazon Lex for batch audio transcription, followed by Amazon Personalize for automated PII detection
- **D.** Amazon Transcribe for speech-to-text with PII redaction, followed by Amazon Comprehend for sentiment

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một trung tâm chăm sóc khách hàng toàn cầu ghi âm hàng nghìn cuộc gọi hỗ trợ khách hàng mỗi ngày và muốn tự động chép lời âm thanh, ẩn/biên tập PII nhạy cảm trong lời nói, đồng thời phân tích cảm xúc khách hàng và các chủ đề hội thoại chính. Sự kết hợp dịch vụ AWS AI nào đáp ứng TỐT NHẤT quy trình này?

**Đáp án đúng:** **D**

Pipeline phân tích tổng đài (Call Center Analytics) chuẩn trên AWS kết hợp Amazon Transcribe (Speech-to-Text) và Amazon Comprehend (NLP Sentiment/Entity/Topic).

- **A:** Sai. Polly là Text-to-Speech (ngược chiều), còn Rekognition phân tích cảm xúc khuôn mặt trong ảnh/video chứ không phân tích văn bản cuộc gọi.
- **B:** Sai. Textract xử lý tài liệu scan/PDF, còn Forecast dự báo chuỗi thời gian.
- **C:** Sai. Lex là dịch vụ chatbot và Personalize là dịch vụ gợi ý sản phẩm.
- **D (Đúng):** Chính xác. Amazon Transcribe (hỗ trợ Call Analytics & PII redaction) chuyển âm thanh thành văn bản, sau đó Amazon Comprehend phân tích cảm xúc (sentiment), thực thể và chủ đề.

</details>

### Câu 11 `medium`

A data science team needs to prepare a large tabular dataset in Amazon S3 for training, automatically explore multiple ML algorithms to find the best-performing model, and deploy it. Which TWO Amazon SageMaker tools streamline data preparation and automated model selection? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Amazon SageMaker Data Wrangler
- **B.** Amazon SageMaker Autopilot
- **C.** Amazon Rekognition Custom Labels
- **D.** Amazon Polly
- **E.** Amazon Bedrock Guardrails

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ khoa học dữ liệu cần chuẩn bị một tập dữ liệu dạng bảng lớn trong Amazon S3 để huấn luyện, tự động khám phá nhiều thuật toán ML để tìm ra mô hình hoạt động tốt nhất và triển khai nó. HAI công cụ Amazon SageMaker nào giúp tinh gọn quá trình chuẩn bị dữ liệu và lựa chọn mô hình tự động? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, B**

Trong vòng đời ML trên SageMaker: Data Wrangler tăng tốc bước Data Preparation/Feature Engineering, còn SageMaker Autopilot tự động hóa bước Model Selection & Hyperparameter Tuning.

- **A (Đúng):** Chính xác. SageMaker Data Wrangler giúp nhập, làm sạch, biến đổi dữ liệu và thực hiện feature engineering nhanh chóng qua giao diện trực quan.
- **B (Đúng):** Chính xác. SageMaker Autopilot là công cụ AutoML tự động thử nghiệm nhiều thuật toán, tinh chỉnh siêu tham số và tạo ra mô hình tốt nhất kèm mã nguồn notebook minh bạch.
- **C:** Sai. Rekognition Custom Labels chuyên cho phân loại/nhận diện đối tượng trong ảnh, không phải dữ liệu bảng.
- **D:** Sai. Polly là dịch vụ Text-to-Speech.
- **E:** Sai. Guardrails dùng để kiểm duyệt an toàn cho Generative AI.

</details>

### Câu 12 `medium`

A company wants to run inference on 500 GB of customer records stored in Amazon S3 once every night to score churn risk. Low latency is not required, and the company wants to minimize cost by avoiding always-on endpoints. Which Amazon SageMaker inference option should they use?

- **A.** SageMaker Real-Time Inference
- **B.** SageMaker Batch Transform
- **C.** SageMaker Serverless Inference
- **D.** SageMaker Multi-Model Endpoints

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty muốn chạy suy luận (inference) trên 500 GB hồ sơ khách hàng được lưu trữ trong Amazon S3 mỗi đêm một lần để chấm điểm rủi ro rời bỏ (churn risk). Độ trễ thấp không phải là yêu cầu bắt buộc và công ty muốn tối thiểu hóa chi phí bằng cách tránh các endpoint chạy liên tục. Họ nên sử dụng tùy chọn suy luận nào của Amazon SageMaker?

**Đáp án đúng:** **B**

Với bài toán chấm điểm dữ liệu lớn theo lô định kỳ (offline batch scoring) không yêu cầu thời gian thực và cần tối ưu chi phí, Amazon SageMaker Batch Transform luôn là lựa chọn tối ưu nhất.

- **A:** Sai. Real-Time Inference duy trì endpoint chạy liên tục 24/7 gây lãng phí chi phí cho tác vụ chạy định kỳ hàng đêm.
- **B (Đúng):** Chính xác. SageMaker Batch Transform được tối ưu cho xử lý ngoại tuyến (offline) tập dữ liệu lớn từ S3, tự động cấp phát hạ tầng khi chạy và tắt ngay sau khi hoàn tất.
- **C:** Sai. Serverless Inference phù hợp với từng request lẻ có lưu lượng thất thường (payload nhỏ, timeout ngắn), không phù hợp xử lý một lô 500 GB dữ liệu.
- **D:** Sai. Multi-Model Endpoints dùng để host hàng trăm mô hình trên cùng một real-time endpoint chạy liên tục.

</details>

### Câu 13 `medium`

A call center wants to convert recorded customer support phone calls into text and automatically determine whether each customer's sentiment is positive, negative, or neutral. Which TWO AWS managed AI services should be combined? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Amazon Transcribe
- **B.** Amazon Polly
- **C.** Amazon Comprehend
- **D.** Amazon Translate
- **E.** Amazon Rekognition

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một trung tâm chăm sóc khách hàng muốn chuyển đổi các cuộc gọi điện thoại hỗ trợ khách hàng đã ghi âm thành văn bản và tự động xác định xem cảm xúc của từng khách hàng là tích cực, tiêu cực hay trung tính. Cần kết hợp HAI dịch vụ AI được quản lý nào của AWS? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, C**

Pipeline phân tích tổng đài (Call Center Analytics) chuẩn trên AWS kết hợp Amazon Transcribe (âm thanh -> văn bản) và Amazon Comprehend (phân tích cảm xúc, thực thể, chủ đề từ văn bản).

- **A (Đúng):** Chính xác. Amazon Transcribe thực hiện Speech-to-Text để chuyển tệp ghi âm cuộc gọi thành bản văn bản.
- **B:** Sai. Amazon Polly chuyển văn bản thành giọng nói (Text-to-Speech), ngược với yêu cầu của đề bài.
- **C (Đúng):** Chính xác. Amazon Comprehend phân tích văn bản đầu ra từ Transcribe để xác định cảm xúc (Sentiment Analysis: Positive, Negative, Neutral, Mixed).
- **D:** Sai. Amazon Translate dùng để dịch ngôn ngữ, không phân tích cảm xúc hay chuyển giọng nói thành văn bản.
- **E:** Sai. Amazon Rekognition chuyên phân tích hình ảnh và video.

</details>

---

[Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md)
