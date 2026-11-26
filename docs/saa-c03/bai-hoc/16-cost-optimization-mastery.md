# Chiến lược Tối ưu Chi phí Toàn diện trên AWS (SAA-C03 Domain 4)

Domain 4 (*Design Cost-Optimized Architectures*) chiếm **20%** số điểm. Đề thi thường đưa ra một kiến trúc đang hoạt động tốt nhưng **hóa đơn quá cao**, yêu cầu bạn tìm giải pháp giảm chi phí mà **vẫn giữ nguyên SLA / hiệu năng**.

---

## 1. Mô hình mua EC2 & Compute Purchasing Models

| Mô hình | Mức giảm giá | Cam kết | Đặc điểm & Kịch bản SAA-C03 |
| :--- | :--- | :--- | :--- |
| **On-Demand** | 0% (Giá chuẩn) | Không cam kết (trả theo giây/giờ) | Tải ngắn hạn, không thể gián đoạn, thử nghiệm ban đầu chưa biết baseline. |
| **Compute Savings Plans** | Lên tới **66%** | Cam kết chi tiêu **$/giờ** trong **1 hoặc 3 năm** | **Linh hoạt nhất**: Tự động áp dụng cho **EC2 (mọi Family, mọi OS, mọi Region)**, **AWS Fargate**, và **AWS Lambda**! |
| **EC2 Instance Savings Plans** | Lên tới **72%** | Cam kết **$/giờ** cho **1 Instance Family** trong **1 Region** | Đổi được kích thước (từ `m5.large` lên `m5.2xlarge`), đổi được OS/Tenancy, nhưng cố định Family & Region. |
| **Reserved Instances (Standard vs Convertible)** | Standard: **72%** / Convertible: **66%** | Cam kết **1 hoặc 3 năm** | Dùng khi cần **Capacity Reservation** ở 1 AZ cụ thể (Zonal RI) hoặc công ty đã dùng RI truyền thống. |
| **Spot Instances** | Lên tới **90%** | Không cam kết (AWS có thể thu hồi sau **2 phút cảnh báo**) | **Batch processing, Big Data (EMR), CI/CD runners, Video rendering**, hoặc kết hợp **ASG Mixed Instances Policy** (Baseline dùng On-Demand/RI + phần mở rộng dùng Spot). |
| **Dedicated Hosts vs Dedicated Instances** | Đắt nhất | Thuê máy chủ vật lý riêng | **Dedicated Host**: Nhìn thấy **Sockets & Physical Cores** → Bắt buộc khi mang giấy phép phần mềm tính theo Core/Socket (**BYOL**: Oracle, SQL Server, Windows Server) lên AWS! |

> **Exam Tip**: Khi đề bài nói *"Công ty dự định chuyển đổi workload từ EC2 sang AWS Fargate hoặc Lambda trong 6 tháng tới nhưng vẫn muốn tiết kiệm chi phí ngay từ bây giờ với cam kết 1 năm"* → Chọn **Compute Savings Plans** (vì nó tự động áp dụng cho cả EC2, Fargate và Lambda!).

---

## 2. Tối ưu Chi phí Mạng (Data Transfer Cost Optimization)

Chi phí Data Transfer là "sát thủ thầm lặng" trong hóa đơn AWS và rất hay được hỏi trong Domain 4:
1. **Data Transfer IN (vào AWS từ Internet)**: **Miễn phí ($0)**.
2. **Traffic cùng 1 AZ (Private IP)**: **Miễn phí ($0)**.
3. **Traffic Cross-AZ (khác AZ cùng Region)**: **$0.01/GB mỗi chiều** ($0.02/GB tổng cộng).
   - *Cách tối ưu*: Với cụm HPC/Batch xử lý dữ liệu lớn, đặt các node trong **cùng 1 AZ** (Cluster Placement Group). Với NLB/ALB, bật **Cross-Zone Load Balancing** sẽ tốn phí Cross-AZ (NLB tắt mặc định, ALB bật mặc định).
4. **Traffic qua NAT Gateway**: Tốn **$0.045/giờ + $0.045/GB**.
   - *Cách tối ưu*: Nếu EC2 trong Private Subnet truy cập **S3 hoặc DynamoDB**, dùng **Gateway VPC Endpoint** → **Giảm về $0**!
5. **Data Transfer OUT ra Internet**: Tốn khoảng **$0.09/GB** (từ EC2/S3).
   - *Cách tối ưu*: Dùng **Amazon CloudFront** (giá Data Transfer Out từ CloudFront rẻ hơn EC2/S3 và **Data Transfer từ S3/ALB Origin ra CloudFront là $0**!) hoặc dùng **AWS Direct Connect** (giá Data Transfer Out qua DX rẻ hơn Internet khoảng 50–70%).

---

## 3. Tối ưu Chi phí Lưu trữ & Database

- **S3 Intelligent-Tiering**: Khi đề bài nói *"Dữ liệu có mẫu truy cập thay đổi thất thường / không dự đoán được"* → Dùng **S3 Intelligent-Tiering** (không tốn phí truy xuất).
- **S3 Lifecycle Policies**: Khi biết rõ chu kỳ sống (ví dụ: *"Sau 30 ngày ít đọc, sau 1 năm lưu trữ tuân thủ 7 năm"*) → Standard → Standard-IA (30 ngày) → Glacier Deep Archive (365 ngày).
- **EBS `gp2` → `gp3`**: Chuyển toàn bộ ổ đĩa `gp2` sang `gp3` giúp **tiết kiệm 20% chi phí ngay lập tức** mà hiệu năng cơ bản lại cao hơn (3,000 IOPS baseline).
- **Xóa Unattached EBS Volumes & Old Snapshots**: Dùng **AWS Trusted Advisor** hoặc **AWS Compute Optimizer** để phát hiện EBS không gắn vào EC2 nào và Idle Load Balancers.
- **Database**:
  - **DynamoDB On-Demand vs Provisioned**: Tải **không dự đoán được / có đỉnh đột ngột (spiky)** hoặc hầu như không có traffic ban đêm → **On-Demand**. Tải **ổn định, đều đặn** → **Provisioned Capacity + Auto Scaling + Reserved Capacity**.
  - **RDS / EC2 Dev & Test**: Tắt tự động ngoài giờ làm việc bằng **AWS Instance Scheduler** (EventBridge + Lambda/Step Functions).

---

## 4. Công cụ Quản lý Chi phí & Governance (Billing & Cost Management)

| Công cụ | Chức năng cốt lõi trong đề thi SAA-C03 |
| :--- | :--- |
| **AWS Cost Explorer** | Phân tích chi phí lịch sử (12–13 tháng) và **dự báo chi phí tương lai (Forecast)**, xem chi phí theo Cost Allocation Tags, gợi ý mua Savings Plans/RI. |
| **AWS Budgets** | Đặt ngưỡng ngân sách (Chi phí, Sử dụng, RI/SP Utilization) và **gửi cảnh báo (SNS/Email)** hoặc **tự động thực thi hành động** (ví dụ: gắn IAM Policy chặn tạo thêm EC2 khi vượt ngân sách!). |
| **AWS Cost and Usage Report (CUR)** | Xuất báo cáo chi tiết nhất (tới từng giờ, từng resource ID) ra **S3**, kết hợp **Athena + QuickSight** để phân tích chuyên sâu. |
| **AWS Compute Optimizer** | Dùng ML phân tích CloudWatch metrics để gợi ý **Right-sizing** (hạ cấp EC2 từ `m5.2xlarge` xuống `m5.large`, tối ưu RAM cho Lambda, tối ưu EBS). |
| **AWS Trusted Advisor** | Kiểm tra 5 trụ cột (Cost Optimization, Performance, Security, Fault Tolerance, Service Quotas). Lưu ý: Phần lớn kiểm tra Cost/Security chi tiết yêu cầu gói **Business hoặc Enterprise Support** (Basic/Developer chỉ có 7 Core Security checks). |
| **AWS Cost Anomaly Detection** | Dùng ML phát hiện **chi phí tăng đột biến bất thường** theo từng dịch vụ/tài khoản và gửi cảnh báo ngay lập tức. |

---

## 5. Bẫy đề thi SAA-C03 (Exam Traps)
1. **Cost Explorer vs AWS Budgets**: Xem biểu đồ quá khứ & dự báo → **Cost Explorer**. Gửi cảnh báo khi sắp vượt $5,000/tháng → **AWS Budgets**.
2. **S3 Glacier Instant Retrieval vs Standard-IA**: Đều truy xuất tức thì (ms), nhưng **Standard-IA** tối ưu cho dữ liệu đọc ~1 lần/tháng (lưu tối thiểu 30 ngày), còn **Glacier Instant Retrieval** rẻ hơn nhiều cho dữ liệu đọc **1–2 lần/năm** (lưu tối thiểu 90 ngày).
3. **Spot Instances trong Auto Scaling**: Không bao giờ dùng 100% Spot cho workload Production không thể gián đoạn; luôn dùng **Mixed Instances Policy** (ví dụ: On-Demand cho Base capacity + đa dạng hóa nhiều Instance Types cho Spot capacity với chiến lược `price-capacity-optimized`).

---

[← Bài trước](15-migration-analytics-dms-glue-redshift.md) | [Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/16-cost-optimization-governance.md)
