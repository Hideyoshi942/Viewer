# Kiến trúc Mạng VPC & Kết nối Hybrid Cloud (SAA-C03 Domain 2)

Mạng (Networking) là nền tảng của mọi kiến trúc Resilient và Secure trên AWS. Đề thi SAA-C03 thường kiểm tra khả năng thiết kế VPC đa vùng (Multi-AZ), cô lập lưu lượng nội bộ bằng VPC Endpoints/PrivateLink, và thiết kế kết nối Hybrid từ On-premises lên AWS.

---

## 1. Thiết kế VPC, Subnetting, NAT Gateway & Egress-Only IGW

### Quy hoạch CIDR & Reserved IPs
- Một VPC có kích thước CIDR từ `/16` (65,536 IP) đến `/28` (16 IP).
- Trong **mỗi Subnet**, AWS luôn giữ lại **5 địa chỉ IP đầu/cuối** không thể cấp cho EC2 (ví dụ với `10.0.1.0/24`):
  - `.0`: Network address
  - `.1`: VPC Router
  - `.2`: Amazon DNS Server (luôn là `VPC_base + 2`)
  - `.3`: Dự phòng cho tương lai
  - `.255`: Network Broadcast address
- **Exam Tip**: Một Subnet `/28` có 16 IP → chỉ dùng được `16 - 5 = 11` IP khả dụng!

### Security Groups vs Network ACLs (NACL)
| Tiêu chí | Security Group (SG) | Network ACL (NACL) |
| :--- | :--- | :--- |
| **Phạm vi áp dụng** | Cấp **ENI / Instance** | Cấp **Subnet** (áp dụng cho mọi instance trong subnet) |
| **Trạng thái (State)** | **Stateful** (Cho phép Inbound thì Outbound trả về tự động được phép) | **Stateless** (Phải cấu hình cả Inbound VÀ Outbound, nhớ mở **Ephemeral Ports `1024-65535`** cho chiều trả về!) |
| **Loại Rule** | Chỉ có **Allow** (mặc định Deny all) | Có cả **Allow và Deny** (đánh số thứ tự từ 1–32766, xử lý từ nhỏ đến lớn) |
| **Tham chiếu chéo** | Có thể tham chiếu SG ID khác (ví dụ: DB SG chỉ nhận từ App SG) | Chỉ dùng IP/CIDR |
| **Khi nào dùng NACL?** | Không chặn được 1 IP cụ thể | **Chặn khẩn cấp một dải IP độc hại** cụ thể bằng Explicit Deny rule |

### NAT Gateway High Availability & IPv6
- **NAT Gateway** chạy trong **1 AZ duy nhất** (đặt ở Public Subnet và gắn Elastic IP). Nếu AZ đó sập, các Private Subnet ở AZ khác trỏ về NAT Gateway đó cũng mất Internet!
- **Best Practice**: Triển khai **1 NAT Gateway trong mỗi AZ** và cấu hình Route Table riêng cho Private Subnet của từng AZ trỏ tới NAT Gateway cùng AZ (vừa đạt HA, vừa tránh phí Cross-AZ data transfer).
- **IPv6**: Mọi địa chỉ IPv6 đều là Public. Để cho phép Private Subnet đi ra Internet qua IPv6 nhưng chặn Internet gọi vào, dùng **Egress-Only Internet Gateway** (miễn phí, tương tự NAT Gateway nhưng cho IPv6).

---

## 2. VPC Endpoints: Gateway vs Interface (AWS PrivateLink)

Đây là chủ đề xuất hiện với tần suất cực cao trong cả Domain 1 (Security), Domain 2 (Resiliency) và Domain 4 (Cost Optimization).

| Tiêu chí | Gateway VPC Endpoint | Interface VPC Endpoint (AWS PrivateLink) |
| :--- | :--- | :--- |
| **Dịch vụ hỗ trợ** | **CHỈ 2 dịch vụ**: **Amazon S3** và **Amazon DynamoDB** | Hầu hết các dịch vụ AWS khác (SQS, SNS, KMS, Secrets Manager, ECR, SSM, S3...) & Dịch vụ SaaS/tự host |
| **Cơ chế hoạt động** | Thêm một **Prefix List route** vào **Route Table** của Private Subnet | Tạo **Elastic Network Interface (ENI)** có Private IP ngay trong Subnet |
| **Chi phí** | **Miễn phí 100%** (không phí giờ, không phí GB) | Tính phí theo giờ (~$0.01/giờ/AZ) + phí xử lý dữ liệu ($0.01/GB) |
| **Truy cập từ On-Premises (VPN / Direct Connect)** | **KHÔNG** (Gateway Endpoint chỉ dùng được bên trong VPC) | **CÓ** (On-premises có thể gọi qua Private IP của ENI) |
| **Kết nối dịch vụ giữa 2 VPC trùng dải CIDR** | Không | **Có**! PrivateLink kết nối Provider (qua **Network Load Balancer**) và Consumer (qua Interface Endpoint) mà **không cần VPC Peering** và **không sợ trùng CIDR**. |

> **Exam Tip**: Khi đề bài hỏi *"EC2 trong Private Subnet cần kết nối S3/DynamoDB không qua Internet và tối ưu chi phí nhất"* → **Gateway VPC Endpoint**. Nếu đề bài hỏi *"On-premises server qua Direct Connect cần truy cập S3 bằng Private IP"* → **Interface VPC Endpoint for S3** (vì Gateway Endpoint không route được từ On-premises!).

---

## 3. Kết nối Hybrid Cloud: Site-to-Site VPN vs AWS Direct Connect

| Tiêu chí | AWS Site-to-Site VPN | AWS Direct Connect (DX) |
| :--- | :--- | :--- |
| **Đường truyền** | Đi qua **Public Internet** (mã hóa IPsec) | **Đường cáp quang chuyên dụng (Dedicated Fiber)** qua DX Location |
| **Băng thông** | Tối đa **1.25 Gbps** / tunnel (có thể tăng bằng ECMP trên Transit Gateway) | **1 Gbps, 10 Gbps, 100 Gbps** (Hosted connection từ 50 Mbps) |
| **Mã hóa mặc định** | **Có** (IPsec Encryption mặc định) | **KHÔNG** mã hóa mặc định (hỗ trợ MACsec ở Layer 2 hoặc chạy IPsec VPN bên trên DX) |
| **Thời gian triển khai** | **Vài phút** | **Vài tuần đến vài tháng** |
| **Tính ổn định & Độ trễ** | Phụ thuộc chất lượng Internet | Rất ổn định, độ trễ thấp, giảm chi phí Data Transfer Out |

### Các loại Direct Connect Virtual Interfaces (VIF)
1. **Private VIF**: Kết nối vào **VPC riêng** thông qua Virtual Private Gateway (VGW).
2. **Public VIF**: Truy cập các **AWS Public Services** (S3, DynamoDB, CloudFront) bằng đường truyền DX thay vì Internet.
3. **Transit VIF**: Kết nối vào **Direct Connect Gateway** để đi tới nhiều VPC thông qua **AWS Transit Gateway**.

### Kiến trúc Hybrid High Availability chuẩn SAA-C03
- **Tối ưu chi phí + HA**: **1 đường Direct Connect + 1 đường Site-to-Site VPN dự phòng** (chạy BGP qua cùng VGW hoặc Transit Gateway). Khi DX đứt, BGP tự động failover sang VPN.
- **Maximum Resiliency (Critical Workloads)**: Ít nhất **2 kết nối Direct Connect tại 2 DX Locations vật lý khác nhau**, mỗi location có 2 thiết bị/kết nối độc lập.
- **Lưu ý mã hóa trên Direct Connect**: Nếu đề bài yêu cầu *"kết nối qua Direct Connect NHƯNG dữ liệu phải được mã hóa End-to-End (IPsec)"* → Chạy **Site-to-Site VPN over Direct Connect Public VIF**!

---

## 4. Bẫy đề thi SAA-C03 (Exam Traps)
1. **VPC Peering không có tính chất bắc cầu (Non-transitive)**: Nếu VPC A peer với VPC B, và VPC B peer với VPC C → A **KHÔNG** nói chuyện được với C. Muốn A-B-C kết nối dạng Hub-and-Spoke → Dùng **AWS Transit Gateway**.
2. **Truy cập Instance không cần mở Port 22 (SSH) hay Bastion Host**: Dùng **AWS Systems Manager (SSM) Session Manager** (cần IAM Role `AmazonSSMManagedInstanceCore` + SSM Agent; nếu ở Private Subnet không có Internet thì cần 3 Interface Endpoints: `ssm`, `ssmmessages`, `ec2messages`).
3. **VPC Reachability Analyzer**: Công cụ phân tích tĩnh (không gửi gói tin thật) giúp tìm ra lý do tại sao EC2 A không kết nối được tới EC2 B (do thiếu Route Table, SG chặn hay NACL chặn).

---

[← Bài trước](04-monitoring-governance-cloudtrail-config.md) | [Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/05-vpc-hybrid-networking.md) | [Bài tiếp →](06-transit-gateway-route53-global-accelerator.md)
