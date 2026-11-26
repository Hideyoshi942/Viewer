# Bài tập tình huống — Nền tảng AI/ML, Học máy & Vòng đời ML (ML Lifecycle)

> Phân biệt AI, ML, Deep Learning; Supervised, Unsupervised, Semi-supervised và Reinforcement Learning; Overfitting/Underfitting và chỉ số đánh giá (Precision, Recall, F1, RMSE).
> **Số câu hỏi:** 9 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A healthcare provider is building a binary classification model to screen patients for a rare but life-threatening disease. Missing a positive case (false negative) is far more costly than flagging a healthy patient for a follow-up test (false positive). Which evaluation metric should the team prioritize?

- **A.** Accuracy
- **B.** Precision
- **C.** Recall
- **D.** Root Mean Squared Error (RMSE)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà cung cấp dịch vụ y tế đang xây dựng mô hình phân loại nhị phân để sàng lọc bệnh nhân mắc một căn bệnh hiếm gặp nhưng đe dọa tính mạng. Việc bỏ sót một ca dương tính (false negative) gây tốn kém và hậu quả lớn hơn nhiều so với việc đánh dấu nhầm một bệnh nhân khỏe mạnh để xét nghiệm lại (false positive). Đội ngũ nên ưu tiên chỉ số đánh giá nào?

**Đáp án đúng:** **C**

Trong phân loại nhị phân: ưu tiên tránh bỏ sót (giảm False Negative như tầm soát bệnh, phát hiện gian lận) → chọn Recall; ưu tiên tránh báo nhầm (giảm False Positive như lọc Spam) → chọn Precision.

- **A:** Sai. Với bệnh hiếm gặp (dữ liệu mất cân bằng nặng), mô hình dự đoán tất cả là âm tính vẫn có thể đạt Accuracy > 99% nhưng vô dụng về mặt y khoa.
- **B:** Sai. Precision tập trung giảm False Positive, trong khi bài toán này ưu tiên không được bỏ sót ca bệnh (giảm False Negative).
- **C (Đúng):** Chính xác. Recall = TP / (TP + FN). Tối ưu Recall giúp giảm thiểu False Negative, đảm bảo tối đa các ca bệnh thực sự được phát hiện.
- **D:** Sai. RMSE là chỉ số đánh giá bài toán hồi quy (Regression) dự đoán giá trị liên tục, không dùng cho phân loại (Classification).

</details>

### Câu 2 `easy`

A telecommunications company wants to group millions of customers into distinct behavioral segments based on call duration, data usage, and roaming frequency, without having any predefined labels. Which type of machine learning is MOST appropriate?

- **A.** Supervised learning using binary classification
- **B.** Unsupervised learning using clustering
- **C.** Reinforcement learning using a reward function
- **D.** Supervised learning using linear regression

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty viễn thông muốn phân nhóm hàng triệu khách hàng thành các phân khúc hành vi riêng biệt dựa trên thời lượng cuộc gọi, mức sử dụng dữ liệu và tần suất chuyển vùng (roaming), mà không có bất kỳ nhãn nào được định nghĩa trước. Loại machine learning nào PHÙ HỢP NHẤT?

**Đáp án đúng:** **B**

Khi bài toán không có nhãn định sẵn (unlabeled data) và mục tiêu là khám phá cấu trúc hoặc phân nhóm (customer segmentation), Unsupervised learning (như K-Means clustering) là lựa chọn phù hợp nhất.

- **A:** Sai. Supervised learning yêu cầu dữ liệu đầu vào phải có nhãn (labeled data) định nghĩa sẵn.
- **B (Đúng):** Chính xác. Phân cụm (Clustering) là kỹ thuật Unsupervised learning dùng để tự động tìm các nhóm khách hàng tương đồng từ dữ liệu chưa gắn nhãn (unlabeled data).
- **C:** Sai. Reinforcement learning dùng cho bài toán ra quyết định tuần tự thông qua thử và sai với phần thưởng từ môi trường, không dùng cho phân khúc khách hàng tĩnh.
- **D:** Sai. Linear regression dự đoán một giá trị số liên tục dựa trên dữ liệu có nhãn, không phải phân nhóm không nhãn.

</details>

### Câu 3 `medium`

A healthcare provider is building a binary classification model to screen patients for a rare, life-threatening disease. Missing an actual positive case carries severe clinical consequences, whereas a false alarm only leads to an inexpensive follow-up test. Which evaluation metric should the team prioritize?

- **A.** Recall
- **B.** Precision
- **C.** Accuracy
- **D.** Mean Absolute Error (MAE)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà cung cấp dịch vụ y tế đang xây dựng mô hình phân loại nhị phân để sàng lọc bệnh nhân mắc một căn bệnh hiếm gặp nhưng đe dọa tính mạng. Việc bỏ sót một ca dương tính thực sự gây ra hậu quả lâm sàng nghiêm trọng, trong khi báo động giả chỉ dẫn đến một xét nghiệm bổ sung ít tốn kém. Đội ngũ nên ưu tiên chỉ số đánh giá nào?

**Đáp án đúng:** **A**

Trong bài toán phân loại y tế hoặc phát hiện gian lận nghiêm trọng, việc bỏ sót (False Negative) rất nguy hiểm nên cần tối ưu Recall. Ngược lại, khi muốn tránh báo nhầm (False Positive) như lọc email rác, ta tối ưu Precision.

- **A (Đúng):** Chính xác. Recall = TP / (TP + FN) đo lường tỷ lệ các ca bệnh thực sự được phát hiện đúng. Khi chi phí của False Negative (bỏ sót ca bệnh) rất cao, ưu tiên hàng đầu là tối đa hóa Recall.
- **B:** Sai. Precision tập trung giảm thiểu False Positive (báo động giả), phù hợp với bài toán lọc spam hơn là sàng lọc bệnh hiểm nghèo.
- **C:** Sai. Với bệnh hiếm (dữ liệu mất cân bằng - imbalanced dataset), một mô hình luôn dự đoán 'không bệnh' vẫn có Accuracy rất cao nhưng hoàn toàn vô dụng.
- **D:** Sai. MAE là metric dùng cho bài toán Regression, không dùng cho Binary Classification.

</details>

### Câu 4 `easy`

A robotics company is training an autonomous warehouse robot to navigate around dynamic obstacles and optimize its delivery path through trial and error, receiving positive rewards for reaching targets quickly and penalties for collisions. Which machine learning paradigm is this?

- **A.** Reinforcement learning
- **B.** Supervised learning
- **C.** Unsupervised clustering
- **D.** Dimensionality reduction

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty robot đang huấn luyện một robot kho tự hành điều hướng tránh các chướng ngại vật động và tối ưu hóa đường đi giao hàng thông qua thử và sai, nhận phần thưởng dương khi đến đích nhanh chóng và bị phạt khi va chạm. Đây là mô hình học máy (machine learning paradigm) nào?

**Đáp án đúng:** **A**

Khi bài toán có Agent, Environment, Actions và Reward/Penalty thông qua thử và sai (như robot, xe tự hành, chơi game), đó là Reinforcement Learning.

- **A (Đúng):** Chính xác. Reinforcement learning (Học tăng cường) huấn luyện một tác tử (agent) tương tác với môi trường thông qua thử-và-sai (trial and error) để tối đa hóa phần thưởng tích lũy (cumulative reward).
- **B:** Sai. Supervised learning học từ cặp dữ liệu đầu vào - nhãn cố định, không học qua phần thưởng tương tác môi trường.
- **C:** Sai. Clustering dùng để phân nhóm dữ liệu tĩnh không nhãn.
- **D:** Sai. Dimensionality reduction (như PCA) dùng để giảm số chiều dữ liệu, không dùng cho điều khiển robot.

</details>

### Câu 5 `medium`

A data scientist builds a linear model to predict housing prices, but observes high error rates on both the training dataset and the validation dataset. The model fails to capture nonlinear relationships in the data. What is this condition called, and how should it be resolved?

- **A.** Overfitting; apply stronger L2 regularization and increase dropout rates across layers
- **B.** Underfitting; increase model complexity, add relevant features, or train for more epochs
- **C.** Data leakage; remove the holdout validation dataset completely from the pipeline
- **D.** Catastrophic forgetting; reduce the total number of input features during training

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà khoa học dữ liệu xây dựng mô hình tuyến tính để dự đoán giá nhà, nhưng quan sát thấy tỷ lệ lỗi cao trên cả tập dữ liệu huấn luyện và tập dữ liệu kiểm định. Mô hình không nắm bắt được các mối quan hệ phi tuyến tính trong dữ liệu. Tình trạng này được gọi là gì và nên giải quyết như thế nào?

**Đáp án đúng:** **B**

Underfitting (High Bias) xảy ra khi mô hình quá đơn giản không học được quy luật dữ liệu, dẫn đến kết quả kém trên cả tập train lẫn tập test/validation.

- **A:** Sai. Overfitting có lỗi rất thấp trên tập train nhưng cao trên tập validation; tăng regularization sẽ làm Underfitting nặng hơn.
- **B (Đúng):** Chính xác. Lỗi cao trên cả tập train và tập validation là dấu hiệu của Underfitting (high bias). Khắc phục bằng cách dùng mô hình phức tạp hơn (như cây quyết định hoặc mạng nơ-ron), thêm feature chất lượng hoặc giảm regularization.
- **C:** Sai. Xóa tập validation là sai quy trình ML và không giải quyết lỗi mô hình.
- **D:** Sai. Giảm số lượng feature càng khiến mô hình mất thông tin và bị Underfitting nặng hơn.

</details>

### Câu 6 `medium`

A logistics company wants to predict the exact delivery time in minutes for each shipment based on distance, weather, and traffic history. Which evaluation metric is MOST appropriate for assessing this regression model while penalizing large prediction errors more heavily?

- **A.** Macro-averaged F1-score
- **B.** Area Under ROC (AUC-ROC)
- **C.** Root Mean Squared Error (RMSE)
- **D.** N-gram BLEU precision score

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty logistics muốn dự đoán chính xác thời gian giao hàng tính bằng phút cho mỗi lô hàng dựa trên khoảng cách, thời tiết và lịch sử giao thông. Chỉ số đánh giá nào PHÙ HỢP NHẤT để đánh giá mô hình hồi quy này đồng thời phạt nặng hơn các sai số dự đoán lớn?

**Đáp án đúng:** **C**

Trong bài toán Regression, RMSE, MAE và R-squared là các metric phổ biến. RMSE đặc biệt hữu ích khi cần phạt nặng các dự đoán lệch quá xa thực tế.

- **A:** Sai. F1-score là trung bình điều hòa của Precision và Recall, dùng cho bài toán Classification.
- **B:** Sai. AUC-ROC đánh giá khả năng phân biệt lớp của mô hình Binary Classification.
- **C (Đúng):** Chính xác. RMSE là metric chuẩn cho bài toán Regression (dự đoán giá trị số liên tục) và do bình phương sai số trước khi lấy căn bậc hai nên RMSE phạt nặng các sai số lớn (outliers).
- **D:** Sai. BLEU score dùng để đánh giá chất lượng dịch máy.

</details>

### Câu 7 `easy`

A retail company wants to predict the exact dollar amount each customer will spend next month based on two years of historical purchase records. Which type of machine learning problem is this?

- **A.** Supervised learning using regression
- **B.** Supervised learning using classification
- **C.** Unsupervised learning using clustering
- **D.** Reinforcement learning using reward maximization

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty bán lẻ muốn dự đoán chính xác số tiền bằng đô la mà mỗi khách hàng sẽ chi tiêu trong tháng tới dựa trên dữ liệu lịch sử mua hàng trong hai năm. Đây là loại bài toán machine learning nào?

**Đáp án đúng:** **A**

Trong Supervised Learning, khi nhãn đầu ra là một đại lượng số liên tục (giá nhà, doanh thu, số tiền chi tiêu) ta chọn Regression; còn khi đầu ra là nhóm/nhãn rời rạc ta chọn Classification.

- **A (Đúng):** Chính xác. Dự đoán một giá trị số liên tục (số tiền chi tiêu) dựa trên dữ liệu lịch sử đã có nhãn kết quả là bài toán Regression thuộc Supervised Learning.
- **B:** Sai. Classification dùng để dự đoán các nhãn rời rạc (ví dụ: mua/không mua, hạng vàng/bạc/đồng), không dùng để dự đoán giá trị số liên tục.
- **C:** Sai. Clustering dùng với dữ liệu không có nhãn để gom nhóm khách hàng có đặc điểm tương đồng, không dự đoán con số chi tiêu cụ thể.
- **D:** Sai. Reinforcement Learning học qua tương tác liên tục giữa Agent và môi trường theo cơ chế thưởng/phạt, không phù hợp cho bài toán dự báo số từ dữ liệu bảng lịch sử.

</details>

### Câu 8 `medium`

A healthcare startup built a binary classification model to detect a rare cancer from medical scans. Missing an actual cancer case has severe consequences for patients. Which evaluation metric should the team prioritize?

- **A.** Root Mean Squared Error (RMSE)
- **B.** Recall
- **C.** Precision
- **D.** R-squared (Coefficient of Determination)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một startup y tế đã xây dựng mô hình phân loại nhị phân để phát hiện một loại ung thư hiếm gặp từ ảnh chụp y tế. Việc bỏ sót một ca ung thư thực sự sẽ gây hậu quả nghiêm trọng cho bệnh nhân. Đội ngũ nên ưu tiên chỉ số đánh giá nào?

**Đáp án đúng:** **B**

Khi chi phí của False Negative (bỏ sót đối tượng dương tính) rất lớn như chẩn đoán ung thư hay phát hiện gian lận, phải ưu tiên Recall. Khi chi phí của False Positive lớn (lọc email spam), ưu tiên Precision.

- **A:** Sai. RMSE là chỉ số đánh giá cho bài toán Regression, không dùng cho bài toán phân loại nhị phân.
- **B (Đúng):** Chính xác. Recall đo tỷ lệ các ca bệnh thực tế được mô hình phát hiện đúng. Tối ưu Recall giúp giảm thiểu tối đa False Negatives (bỏ sót ca bệnh).
- **C:** Sai. Precision tập trung giảm False Positives (báo động giả), phù hợp hơn với lọc spam; trong chẩn đoán bệnh hiểm nghèo, bỏ sót ca bệnh (False Negative) nguy hiểm hơn nhiều.
- **D:** Sai. R-squared là chỉ số đo mức độ phù hợp của mô hình Regression.

</details>

### Câu 9 `medium`

A data science team notices their ML model achieves 99% accuracy on the training dataset but only 61% accuracy on the validation dataset. What is happening, and how should they address it?

- **A.** The model is underfitting; increase network depth, add polynomial features, and train for more epochs.
- **B.** The model is overfitting; apply L2 regularization or dropout, add training data, or reduce complexity.
- **C.** The model has data drift; redeploy the identical artifact onto a GPU-accelerated EC2 instance type.
- **D.** The model is experiencing cold start latency; enable Provisioned Concurrency on the inference endpoint.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ khoa học dữ liệu nhận thấy mô hình ML của họ đạt độ chính xác 99% trên tập dữ liệu huấn luyện nhưng chỉ đạt 61% trên tập dữ liệu kiểm định (validation). Điều gì đang xảy ra và họ nên xử lý như thế nào?

**Đáp án đúng:** **B**

Overfitting xảy ra khi mô hình ghi nhớ cả nhiễu trong tập huấn luyện khiến khả năng tổng quát hóa (generalization) trên dữ liệu mới bị kém. Regularization, Dropout, Early Stopping và bổ sung dữ liệu đa dạng là các giải pháp chuẩn.

- **A:** Sai. Underfitting xảy ra khi độ chính xác thấp trên CẢ tập train lẫn tập validation.
- **B (Đúng):** Chính xác. Độ chính xác rất cao trên tập train nhưng thấp trên tập validation là dấu hiệu kinh điển của Overfitting. Các biện pháp khắc phục gồm Regularization, tăng dữ liệu hoặc giảm độ phức tạp mô hình.
- **C:** Sai. Thay đổi kích thước EC2 không giải quyết được vấn đề học thuộc (overfitting) của mô hình.
- **D:** Sai. Cold start chỉ ảnh hưởng tới độ trễ phản hồi (latency), không làm giảm độ chính xác dự đoán trên tập validation.

</details>

---

[Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md)
