# Bài 14: Chiến lược Disaster Recovery, AWS Backup & Các Dịch vụ AI/ML Managed trên SAA-C03

Bài học cuối cùng của lộ trình SAA-C03 tổng hợp hai mảng kiến thức có tần suất xuất hiện rất cao:
1. **Disaster Recovery (DR) & AWS Backup**: Thiết kế khả năng phục hồi thảm họa theo mục tiêu RPO/RTO và tối ưu chi phí.
2. **AWS Managed AI/ML Services**: Nhận diện nhanh đúng dịch vụ AI/ML có sẵn (không cần tự train model) cho từng bài toán nghiệp vụ.

---

## 1. Hiểu đúng về RPO và RTO

Mọi chiến lược Disaster Recovery đều xoay quanh hai chỉ số cốt lõi:

- **RPO (Recovery Point Objective)**: Lượng dữ liệu tối đa (tính bằng thời gian) mà doanh nghiệp **chấp nhận có thể bị mất** khi thảm họa xảy ra.
  - *Ví dụ*: Nếu hệ thống backup database mỗi 1 giờ một lần, RPO = **1 giờ**. Nếu dùng synchronous replication, RPO ≈ **0**.
- **RTO (Recovery Time Objective)**: Khoảng thời gian tối đa từ lúc sự cố xảy ra cho đến khi hệ thống **khôi phục và hoạt động trở lại bình thường**.
  - *Ví dụ*: RTO = 15 phút nghĩa là trong vòng 15 phút sau thảm họa, người dùng phải truy cập lại được ứng dụng.

> **Nguyên tắc vàng**: **RPO và RTO càng nhỏ (tiến về 0), chi phí triển khai và vận hành càng cao.**

---

## 2. 4 Chiến lược Disaster Recovery (DR) trên AWS

AWS phân loại 4 chiến lược DR từ chi phí thấp nhất đến nhanh nhất:

| Chiến lược | Cơ chế hoạt động | RPO | RTO | Chi phí | Use Case phù hợp |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Backup & Restore** | Sao lưu dữ liệu (S3, EBS Snapshots, RDS Snapshots, AWS Backup) sang Region khác. Khi có sự cố mới dựng lại hạ tầng (CloudFormation/Terraform) và restore dữ liệu. | Vài giờ | Vài giờ (chậm nhất) | **Thấp nhất** ($) | Hệ thống nội bộ ít quan trọng, môi trường dev/test, workload không khắt khe thời gian phục hồi. |
| **2. Pilot Light** | Chỉ chạy sẵn các thành phần dữ liệu cốt lõi ở chế độ tối thiểu ở DR Region (ví dụ: RDS Read Replica hoặc Aurora Global DB). Các máy chủ Compute (EC2/ASG) **tắt hoàn toàn** (0 instances), chỉ bật lên khi failover. | Vài giây – vài phút | Hàng chục phút | Thấp ($$) | Hệ thống cần bảo toàn dữ liệu (RPO thấp) nhưng chấp nhận đợi khởi động máy chủ khi có sự cố. |
| **3. Warm Standby** | Phiên bản **thu nhỏ (scaled-down)** của toàn bộ hệ thống (cả DB lẫn Web/App servers quy mô nhỏ) luôn chạy sẵn ở DR Region. Khi failover, **scale out** nhanh và chuyển traffic qua Route 53. | Vài giây – vài phút | Vài phút | Trung bình ($$$) | Ứng dụng nghiệp vụ quan trọng cần thời gian chuyển đổi nhanh, có thể kiểm thử DR liên tục. |
| **4. Multi-Site Active-Active** | Hệ thống chạy **đầy đủ công suất (full-scale)** đồng thời ở cả 2+ Regions. Người dùng được Route 53 điều hướng tới Region gần nhất (Latency/Weighted routing). | **~0 (Real-time)** | **~0 (Real-time)** | **Cao nhất** ($$$$) | Hệ thống mission-critical (ngân hàng, thanh toán, y tế), **không chấp nhận downtime hay mất dữ liệu**. |

> **Exam Tip**: Phân biệt **Pilot Light** vs **Warm Standby** trên đề thi:
> - **Pilot Light**: Server Compute ở DR Region **đang tắt (stopped/not running)**, chỉ có dữ liệu được replicate liên tục.
> - **Warm Standby**: Server Compute ở DR Region **đang chạy ở quy mô tối thiểu (scaled-down, always running)** và sẵn sàng nhận traffic ngay khi scale up.

---

## 3. AWS Elastic Disaster Recovery (AWS DRS) & AWS Backup

### 3.1. AWS Elastic Disaster Recovery (AWS DRS)
- Là dịch vụ chuyên dụng để phục hồi các máy chủ vật lý, VMware/Hyper-V on-premises hoặc EC2 giữa các Region/AZ lên AWS.
- **Cơ chế**: Cài đặt Replication Agent lên server nguồn -> sao chép liên tục ở cấp độ block (continuous block-level replication) sang một **Staging Area** giá rẻ (dùng EBS `gp3`/`st1` và các EC2 nhỏ) -> khi có sự cố hoặc diễn tập (DR Drill), DRS tự động khởi tạo EC2 instances đầy đủ cấu hình trong vài phút (**RPO tính bằng giây, RTO tính bằng phút**).
- Hỗ trợ **Failback** (chuyển dữ liệu ngược lại hệ thống nguồn sau khi khắc phục xong sự cố).

### 3.2. AWS Backup
- Dịch vụ quản lý tập trung việc sao lưu cho nhiều dịch vụ AWS: **EC2, EBS, RDS, Aurora, DynamoDB, EFS, FSx, S3, Storage Gateway**.
- **Tính năng quan trọng trong SAA-C03**:
  - **Backup Plans**: Định nghĩa lịch backup, cửa sổ bảo trì, và vòng đời (chuyển sang Cold Storage, xóa sau X ngày).
  - **Cross-Region & Cross-Account Backup**: Tự động sao chép bản backup sang Region khác hoặc AWS Account chuyên biệt (Security/Backup Account) để phòng chống ransomware hoặc hacker xóa mất tài khoản chính.
  - **AWS Backup Vault Lock**: Áp dụng cơ chế **WORM (Write-Once-Read-Many)** ngăn chặn mọi hành vi xóa hoặc sửa đổi bản backup (kể cả Root User nếu dùng **Compliance Mode**).
  - Tích hợp với **AWS Organizations** để áp dụng Backup Policy đồng loạt cho toàn bộ công ty.

> **Exam Tip**: Khi đề bài yêu cầu *"centralized backup across EC2, RDS, EFS, DynamoDB with Cross-Region copy and immutable/WORM protection against deletion"*, đáp án luôn là **AWS Backup** kết hợp **AWS Backup Vault Lock**.

---

## 4. Các Dịch vụ AWS Managed AI/ML thường thi trong SAA-C03

Trong SAA-C03, bạn **không** cần biết cách viết code train model phức tạp, nhưng phải nhớ chính xác **tên dịch vụ Managed AI** tương ứng với từng bài toán dữ liệu (ảnh, video, âm thanh, văn bản, tìm kiếm, dự báo):

| Dịch vụ AWS | Đầu vào -> Đầu ra | Chức năng chính & Use Case thi SAA-C03 |
| :--- | :--- | :--- |
| **Amazon Rekognition** | Hình ảnh / Video -> JSON nhãn, khuôn mặt | Nhận diện vật thể, cảnh vật, chữ trong ảnh, **nhận diện khuôn mặt (Face Detection/Comparison)**, **Content Moderation** (lọc ảnh/video nhạy cảm). |
| **Amazon Textract** | Ảnh / PDF scan -> Text + Bảng biểu + Form | Trích xuất văn bản (**OCR**), đọc chính xác **cấu trúc bảng (tables) và cặp key-value (forms)** từ hóa đơn, CMND, hồ sơ y tế (vượt trội hơn OCR thông thường). |
| **Amazon Transcribe** | Audio / Video -> Văn bản (Speech-to-Text) | Chuyển giọng nói thành văn bản (tạo phụ đề, ghi biên bản cuộc họp), hỗ trợ **PII Redaction** (che giấu thông tin nhạy cảm), Custom Vocabulary, phân biệt người nói. |
| **Amazon Polly** | Văn bản -> Audio (Text-to-Speech) | Đọc văn bản thành giọng nói tự nhiên đa ngôn ngữ; hỗ trợ **SSML** (điều chỉnh ngữ điệu, ngắt nghỉ) và Pronunciation Lexicons. |
| **Amazon Translate** | Văn bản ngôn ngữ A -> Văn bản ngôn ngữ B | Dịch thuật máy (Neural Machine Translation) nhanh, chính xác, hỗ trợ dịch hàng loạt hoặc real-time. |
| **Amazon Comprehend** | Văn bản -> Insights (NLP) | Xử lý ngôn ngữ tự nhiên (**NLP**): phân tích cảm xúc (Sentiment Analysis: tích cực/tiêu cực), trích xuất thực thể (Entities), từ khóa, ngôn ngữ, và **phát hiện/che PII**. *(Có **Comprehend Medical** cho hồ sơ bệnh án)*. |
| **Amazon Lex** | Giọng nói / Text -> Chatbot hội thoại | Xây dựng **Chatbot** và **Voicebot** hiểu ý định người dùng (Intent) — dùng chung công nghệ cốt lõi với Amazon Alexa. |
| **Amazon Connect** | Cuộc gọi / Chat khách hàng | **Cloud Contact Center** (tổng đài chăm sóc khách hàng), tích hợp trực tiếp với **Amazon Lex** để làm tổng đài trả lời tự động (IVR). |
| **Amazon Kendra** | Câu hỏi tự nhiên -> Kết quả tìm kiếm chính xác | **Enterprise Intelligent Search**: công cụ tìm kiếm thông minh dùng ML, lập chỉ mục tài liệu phân tán từ **S3, SharePoint, RDS, Confluence** để nhân viên hỏi đáp tự nhiên (hỗ trợ RAG). |
| **Amazon Forecast** | Dữ liệu chuỗi thời gian (Time-series) -> Dự báo | Dự báo nhu cầu bán hàng, tồn kho, lưu lượng mạng, tài chính dựa trên dữ liệu lịch sử (không cần chuyên môn ML). |
| **Amazon Personalize** | Lịch sử hành vi user -> Gợi ý sản phẩm | Xây dựng hệ thống **Recommendation Engine** real-time (gợi ý sản phẩm thương mại điện tử, phim ảnh, tin tức) giống công nghệ của Amazon.com. |

### 4.1. Lưu ý thêm về Amazon SageMaker & Amazon Bedrock
- **Amazon SageMaker**: Nền tảng toàn diện để Data Scientist tự xây dựng, huấn luyện (train), tinh chỉnh và triển khai (deploy) các mô hình Machine Learning tùy chỉnh (Custom ML Models).
- **Amazon Bedrock**: Dịch vụ serverless cho phép gọi API tới các **Foundation Models (FMs)** / Large Language Models (LLMs) hàng đầu (như Claude, Titan, Llama) để xây dựng ứng dụng **Generative AI** mà không cần quản lý hạ tầng GPU.

> **Exam Tip**: Cách phân biệt nhanh các dịch vụ hay gây nhầm lẫn:
> - **Đọc chữ từ ảnh đường phố/biển báo**: **Rekognition**.
> - **Đọc chữ + bảng biểu + form từ PDF/Hóa đơn scan**: **Textract**.
> - **Phân tích cảm xúc (Sentiment) của review khách hàng**: **Comprehend**.
> - **Tìm kiếm tài liệu nội bộ công ty từ S3 + SharePoint**: **Kendra**.
> - **Gợi ý sản phẩm cho người dùng**: **Personalize**.

---

[← Bài trước](08-decoupling-sqs-sns-kinesis.md) | [Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/09-disaster-recovery-backup.md) | [Bài tiếp →](10-serverless-event-driven.md)
