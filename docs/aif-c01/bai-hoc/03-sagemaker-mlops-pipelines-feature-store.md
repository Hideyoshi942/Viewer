# Amazon SageMaker Toàn diện: MLOps, Pipelines, Feature Store & Inference Options

**Amazon SageMaker** là nền tảng ML end-to-end được quản lý hoàn toàn của AWS, hỗ trợ từ chuẩn bị dữ liệu, huấn luyện, triển khai đến giám sát mô hình trong production (MLOps). Trong kỳ thi **AIF-C01**, bạn cần phân biệt chính xác từng công cụ con trong hệ sinh thái SageMaker và chọn đúng **Inference Option** theo độ trễ, kích thước payload và chi phí.

## 1. Công cụ Phát triển & Chuẩn bị Dữ liệu trong SageMaker

| Công cụ | Vai trò chính | Trường hợp sử dụng điển hình trên đề thi |
| :--- | :--- | :--- |
| **SageMaker Studio** | IDE web thống nhất cho toàn bộ vòng đời ML | Cần môi trường notebook cộng tác, theo dõi experiment và quản lý pipeline |
| **SageMaker Canvas** | Giao diện **No-Code** cho Business Analyst | Người không biết code muốn tự xây dựng mô hình dự đoán từ CSV/tabular |
| **SageMaker Data Wrangler** | Chuẩn bị dữ liệu & Feature Engineering trực quan | Làm sạch dữ liệu, xử lý missing values, mã hóa cột trước khi train |
| **SageMaker Autopilot** | **AutoML** tự động thử nhiều thuật toán & tune | Có dữ liệu tabular có nhãn, muốn tự động tìm mô hình tốt nhất kèm notebook |
| **SageMaker JumpStart** | Hub chứa sẵn **Foundation Models** & built-in models | Triển khai nhanh Llama, Mistral, Stable Diffusion hoặc fine-tune sẵn |

> **Exam Tip**: Thấy từ khóa **"no-code / business analyst"** → chọn **SageMaker Canvas**. Thấy **"AutoML / automatically explore algorithms / tabular"** → chọn **SageMaker Autopilot**. Thấy **"pre-trained open-source FM / one-click deploy"** → chọn **SageMaker JumpStart**.

## 2. SageMaker Feature Store (Online vs. Offline)

**Feature Store** là kho lưu trữ tập trung giúp các nhóm ML **tái sử dụng feature** (tránh tính toán lại và đảm bảo nhất quán giữa lúc train và lúc inference — tránh *training-serving skew*).

| Loại Store | Hạ tầng lưu trữ | Độ trễ truy vấn | Mục đích sử dụng |
| :--- | :--- | :--- | :--- |
| **Online Store** | Low-latency key-value store | **Millisecond** (một chữ số) | Phục vụ **Real-time inference** (chỉ lưu bản ghi mới nhất theo `RecordIdentifier`) |
| **Offline Store** | **Amazon S3** (định dạng Parquet) | Cao hơn (batch/query) | Phục vụ **Training** và **Batch inference**, lưu trữ toàn bộ lịch sử (time-travel) |

## 3. MLOps: SageMaker Pipelines, Model Registry, Model Monitor & Clarify

Để tự động hóa quy trình ML chuẩn production, AWS cung cấp bộ tứ MLOps cốt lõi:

1. **SageMaker Pipelines**: Công cụ **CI/CD cho ML** (tương tự Step Functions nhưng chuyên biệt cho ML), định nghĩa DAG gồm các bước: Processing → Training → Evaluation → Condition → Register Model.
2. **SageMaker Model Registry**: Kho quản lý **phiên bản mô hình (model versioning)**, lưu metadata, metrics đánh giá và trạng thái phê duyệt (`PendingManualApproval` → `Approved` / `Rejected`) trước khi deploy lên production.
3. **SageMaker Model Monitor**: Giám sát mô hình đang chạy trên endpoint để phát hiện:
   - **Data Quality Drift**: Dữ liệu đầu vào thay đổi phân phối so với baseline lúc train.
   - **Model Quality Drift**: Độ chính xác (accuracy/RMSE) suy giảm theo thời gian khi có ground truth.
   - **Bias Drift & Feature Attribution Drift**: Độ lệch công bằng hoặc tầm quan trọng của feature thay đổi.
4. **SageMaker Clarify**: Phát hiện **Bias** (trước và sau khi train) và cung cấp **Explainability** (dùng **SHAP values** để giải thích feature nào tác động mạnh nhất đến dự đoán).

```python
# Ví dụ cấu hình điều kiện đăng ký model trong SageMaker Pipelines
from sagemaker.workflow.conditions import ConditionGreaterThanOrEqualTo
from sagemaker.workflow.condition_step import ConditionStep

cond_gte = ConditionGreaterThanOrEqualTo(
    left=JsonGet(step_name="EvaluateModel", property_file=eval_report, json_path="metrics.f1.value"),
    right=0.85
)
# Chỉ đưa vào Model Registry nếu F1 >= 0.85
```

## 4. So sánh 4 Tùy chọn Triển khai Inference (SageMaker Hosting)

Đây là phần xuất hiện **cực kỳ thường xuyên** trong Domain 1 và Domain 3 của AIF-C01:

| Inference Option | Kích thước Payload tối đa | Thời gian xử lý tối đa | Đặc điểm & Khi nào chọn |
| :--- | :--- | :--- | :--- |
| **Real-Time Inference** | Lên tới **25 MB** | **60 giây** | Traffic ổn định, yêu cầu **độ trễ thấp (ms)** liên tục 24/7; hỗ trợ GPU & Auto Scaling |
| **Serverless Inference** | Lên tới **4 MB** | **60 giây** | Traffic **không đều / ngắt quãng (intermittent)**, chấp nhận được **cold start**, tối ưu chi phí |
| **Asynchronous Inference** | Lên tới **1 GB** | **1 giờ** | Payload lớn (video, file âm thanh, ảnh độ phân giải cao), xử lý lâu, hỗ trợ **scale-to-zero** |
| **Batch Transform** | Hàng **GB / TB** (từ S3) | Không giới hạn | Xử lý **offline hàng loạt** định kỳ trên tập dữ liệu lớn lưu tại S3, không cần endpoint 24/7 |

> **Exam Tip**:
> - Traffic thưa thớt, payload nhỏ (< 4 MB), muốn trả tiền theo request → **Serverless Inference**.
> - Payload vài trăm MB hoặc xử lý mất 10-15 phút, cần queue request → **Asynchronous Inference**.
> - Dự đoán toàn bộ dữ liệu lịch sử trong S3 mỗi đêm → **Batch Transform**.
> - Phát hiện gian lận thẻ tín dụng ngay khi quẹt thẻ (< 50 ms) → **Real-Time Inference** kết hợp **Feature Store Online**.

---

[← Bài trước](02-aws-managed-ai-services.md) | [Mục lục AIF-C01](../00-tong-quan-va-lo-trinh-aif-c01.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/03-sagemaker-mlops.md) | [Bài tiếp →](04-genai-llms.md)
