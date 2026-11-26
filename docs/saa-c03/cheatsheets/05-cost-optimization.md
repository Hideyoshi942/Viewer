# Cheatsheet 5: Tối ưu Chi phí (SAA-C03 Domain 4)

## 1. Mô hình mua Compute (Purchasing Models)
| Mô hình | Giảm giá tối đa | Khi nào chọn trong đề thi? |
| :--- | :--- | :--- |
| **Compute Savings Plans** | **66%** | Muốn linh hoạt chuyển đổi giữa **EC2, Fargate và Lambda**, hoặc đổi Instance Family / Region. |
| **EC2 Instance Savings Plans** | **72%** | Cố định **1 Instance Family + 1 Region** trong 1 hoặc 3 năm, vẫn đổi được Size & OS. |
| **Standard Reserved Instances** | **72%** | Cần **Capacity Reservation** ở 1 AZ cụ thể (Zonal RI). |
| **Spot Instances** | **90%** | Tác vụ chịu được gián đoạn (**Batch, EMR, CI/CD, Rendering**); thu hồi sau **2 phút** cảnh báo. |
| **Dedicated Hosts** | Đắt nhất | Bắt buộc cho **BYOL** tính theo **Sockets / Physical Cores** (Windows/SQL Server/Oracle). |

---

## 2. Quy tắc vàng giảm chi phí Data Transfer
1. **Data Transfer IN** từ Internet → **$0**.
2. **Traffic cùng 1 AZ** (Private IP) → **$0** (đặt cụm HPC/Big Data cùng 1 AZ).
3. **EC2 Private Subnet → S3 / DynamoDB**: Dùng **Gateway VPC Endpoint** → Loại bỏ hoàn toàn phí xử lý **$0.045/GB của NAT Gateway**!
4. **Data Transfer OUT ra Internet**: Đưa qua **Amazon CloudFront** (rẻ hơn từ EC2/S3, và truyền từ S3/ALB ra CloudFront là **$0**), hoặc dùng **Direct Connect** nếu traffic doanh nghiệp cực lớn.

---

## 3. Tối ưu Lưu trữ, Database & Serverless
- **EBS**: Chuyển `gp2` → **`gp3`** (giảm ngay **20%** chi phí, baseline 3,000 IOPS).
- **S3**: Mẫu truy cập không đoán trước → **S3 Intelligent-Tiering**. Lưu trữ tuân thủ 7–10 năm → **Glacier Deep Archive**.
- **DynamoDB**: Tải giật cục / không đoán trước / thấp điểm nhiều → **On-Demand**. Tải ổn định → **Provisioned + Auto Scaling**. Xóa dữ liệu hết hạn → **TTL ($0)**.
- **Môi trường Dev/Test**: Tắt tự động ngoài giờ làm việc bằng **AWS Instance Scheduler** (EventBridge + Lambda).

---

## 4. Bộ công cụ Quản lý Chi phí (Billing Tools)
| Công cụ | Mục đích |
| :--- | :--- |
| **AWS Cost Explorer** | Xem biểu đồ chi phí quá khứ (12–13 tháng) & **dự báo (Forecast)** tương lai, gợi ý Savings Plans/RI. |
| **AWS Budgets** | Đặt ngưỡng ngân sách và **cảnh báo** hoặc **tự động chạy IAM/SCP action** khi vượt ngưỡng. |
| **AWS Cost & Usage Report (CUR)** | Xuất dữ liệu chi phí chi tiết nhất tới từng giờ ra **S3** để phân tích bằng **Athena + QuickSight**. |
| **AWS Compute Optimizer** | Dùng ML gợi ý **Right-sizing** cho EC2, EBS, Lambda, ECS Fargate. |
| **AWS Cost Anomaly Detection** | Dùng ML tự động phát hiện chi phí tăng vọt bất thường. |
| **AWS Trusted Advisor** | Kiểm tra tối ưu chi phí, bảo mật, giới hạn dịch vụ (full checks cần Business/Enterprise Support). |

---

[Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md)
