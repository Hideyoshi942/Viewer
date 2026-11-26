# Kiến trúc Container trên AWS (SAA-C03 Domain 2, 3 & 4)

Container giúp đóng gói ứng dụng nhất quán từ môi trường Dev lên Production. Trong kỳ thi SAA-C03, bạn không cần nhớ lệnh `kubectl` phức tạp (nhưng cần hiểu kiến trúc **ECS vs EKS**, **EC2 Launch Type vs AWS Fargate**, cách cấp quyền IAM ở cấp Task/Pod, và tối ưu chi phí Container).

---

## 1. Amazon ECS vs Amazon EKS vs AWS App Runner

| Tiêu chí | Amazon ECS | Amazon EKS | AWS App Runner |
| :--- | :--- | :--- | :--- |
| **Bản chất** | Dịch vụ điều phối Container **thuần AWS** (Control Plane **miễn phí**) | **Managed Kubernetes** (Control Plane tốn **$0.10/giờ/cluster**) | Dịch vụ PaaS Serverless cho Container/Source code |
| **Độ phức tạp vận hành** | Thấp — tích hợp sâu sẵn với ALB, IAM, CloudWatch | Cao — cần đội ngũ có kỹ năng Kubernetes (Helm, Ingress, CNI) | Cực thấp — chỉ trỏ tới GitHub hoặc ECR Image, tự build & scale |
| **Tính di động (Portability)** | Thấp (khó chuyển sang Cloud khác/On-prem) | **Cao nhất** (chuẩn Kubernetes, chạy được Hybrid qua EKS Anywhere) | Thấp |
| **Khi nào chọn?** | Team muốn chạy Container **nhanh, đơn giản, ít vận hành nhất** trên AWS | Công ty **đã có sẵn Kubernetes / Helm charts** từ On-prem hoặc yêu cầu **Multi-cloud** | Web app / API đơn giản muốn deploy từ code/container mà **không cần cấu hình VPC/ALB** |

---

## 2. Launch Types: EC2 vs AWS Fargate

Cả Amazon ECS và Amazon EKS đều hỗ trợ 2 chế độ chạy hạ tầng:

| Tiêu chí | EC2 Launch Type | AWS Fargate (Serverless Containers) |
| :--- | :--- | :--- |
| **Quản lý Server/OS** | Bạn phải tự quản lý EC2 instances, vá lỗi OS (AMI), cấu hình ASG | **AWS quản lý 100%** (Không thấy EC2, không cần vá lỗi OS) |
| **Mô hình tính phí** | Trả tiền cho toàn bộ EC2 instance (kể cả phần CPU/RAM dư thừa) | Trả tiền chính xác theo **vCPU & Memory của từng Task/Pod** đang chạy |
| **Hỗ trợ GPU / Custom Kernel** | **Có** (chọn EC2 `p4d`, `g5` hoặc Windows containers) | **Không** hỗ trợ GPU (chỉ hỗ trợ Linux x86/ARM64 và Windows ECS hạn chế) |
| **Spot Pricing** | EC2 Spot Instances (rẻ hơn tới 90%) | **Fargate Spot** (rẻ hơn tới 70% cho tác vụ chịu gián đoạn) |
| **Lưu trữ bền vững** | EBS, EFS, Instance Store | **Amazon EFS** (hỗ trợ gắn EFS vào Fargate Task để lưu trữ chung) |

> **Exam Tip**: Khi đề bài nhấn mạnh *"Run Docker containers with zero server management / least operational overhead"* → **ECS on AWS Fargate**. Khi đề bài yêu cầu *"Run containerized Machine Learning inference requiring NVIDIA GPUs"* → **ECS/EKS on EC2 Launch Type (GPU instances)**.

---

## 3. Bảo mật & Mạng cho Container trên AWS

### Cấp quyền IAM cho từng Container (Least Privilege)
- **ECS**: Phân biệt rõ 2 loại Role trong Task Definition:
  1. **Task Execution Role**: Dùng bởi *ECS Agent* để kéo image từ **ECR**, lấy secret từ **Secrets Manager**, và đẩy log lên **CloudWatch Logs**.
  2. **Task Role**: Dùng bởi *chính code ứng dụng* bên trong container để gọi S3, DynamoDB, SQS. *(Tuyệt đối không gắn quyền vào EC2 Instance Profile dùng chung nếu nhiều container khác nhau chạy trên cùng 1 EC2!)*
- **EKS**: Dùng **IAM Roles for Service Accounts (IRSA)** hoặc **EKS Pod Identity** để gắn IAM Role cho từng Kubernetes Pod cụ thể.

### Networking (`awsvpc` mode) & Load Balancing
- Với **AWS Fargate**, mọi Task bắt buộc dùng network mode **`awsvpc`**, nghĩa là **mỗi Task được cấp 1 Elastic Network Interface (ENI) và 1 Private IP riêng** trong VPC (hỗ trợ gắn Security Group riêng cho từng Task!).
- Khi gắn ECS/EKS với **Application Load Balancer (ALB)**, luôn chọn Target Type là **`ip`** (thay vì `instance`) để ALB gửi traffic thẳng tới từng Task/Pod ENI và hỗ trợ Dynamic Port Mapping.

### Amazon ECR (Elastic Container Registry)
- Kho lưu trữ Docker/OCI Image quản lý hoàn toàn bởi AWS.
- Hỗ trợ **Image Scanning** (tích hợp **Amazon Inspector** quét lỗ hổng CVE tự động khi push image), **Lifecycle Policies** (tự động xóa image cũ/untagged để tiết kiệm tiền), và **Cross-Region Replication**.

---

## 4. Bẫy đề thi SAA-C03 (Exam Traps)
1. **Task Role vs Task Execution Role**: Đề bài hỏi *"Container chạy trên ECS Fargate không đọc được S3 bucket dù Task Execution Role đã có quyền S3"* → Sai Role! Code ứng dụng dùng **Task Role**, còn **Task Execution Role** chỉ dùng để pull image từ ECR và ghi log CloudWatch.
2. **EFS với Fargate**: Nhiều Task Fargate cần đọc/ghi chung một thư mục dữ liệu bền vững → Gắn **Amazon EFS** (EBS không dùng được để chia sẻ giữa nhiều Fargate Task trên nhiều AZ).
3. **ECS Auto Scaling**: Để tự động scale ECS Service theo số lượng message tồn đọng trong SQS → Dùng **Target Tracking Scaling** dựa trên metric tùy chỉnh hoặc **Step Scaling** theo `ApproximateNumberOfMessagesVisible`.
4. **Di chuyển Kubernetes từ On-Premises**: Công ty đang chạy Kubernetes On-Premises với hàng trăm Helm charts và muốn chuyển lên AWS ít sửa đổi nhất → **Amazon EKS**.

---

[← Bài trước](10-serverless-event-driven.md) | [Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/11-containers-ecs-eks.md) | [Bài tiếp →](12-s3-lifecycle-storage-gateway-aurora.md)
