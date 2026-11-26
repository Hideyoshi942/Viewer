# Kiến trúc VPC, Overlapping CIDR, VPC Peering & Shared VPC (AWS RAM)

Thiết kế VPC nền tảng là bước đầu tiên và quyết định khả năng mở rộng của toàn bộ hệ thống mạng AWS. Trong kỳ thi **ANS-C01**, các tình huống thường xoay quanh việc chia sẻ tài nguyên đa tài khoản (multi-account) bằng **AWS RAM**, xử lý **Overlapping CIDR** trong môi trường M&A, và lựa chọn giữa **VPC Peering** và **Transit Gateway**.

---

## 1. Chia sẻ Subnet với AWS Resource Access Manager (Shared VPC)

**Shared VPC** cho phép một tài khoản trung tâm (**Network Owner Account**) tạo VPC và chia sẻ từng Subnet cụ thể cho các tài khoản thành viên (**Participant Accounts**) trong cùng **AWS Organizations**.

| Đặc điểm | Shared VPC (AWS RAM) | VPC riêng cho từng Account + TGW |
| :--- | :--- | :--- |
| **Quản lý CIDR & Route Table** | Tập trung 100% tại Owner Account | Phân tán hoặc kết nối qua TGW |
| **Lưu lượng liên tài khoản** | Cùng VPC $\rightarrow$ **0 phí Inter-VPC**, độ trễ thấp nhất | Đi qua TGW $\rightarrow$ tốn phí TGW data processing |
| **Chia sẻ Security Group** | Participant có thể tham chiếu SG của Owner và ngược lại | Chỉ tham chiếu SG qua VPC Peering (cùng Region) |
| **Giới hạn** | Không chia sẻ được Default VPC; Participant không thể sửa Route Table/NACL | Độc lập hoàn toàn về Route Table và NACL |

> **Exam Tip**: Khi đề bài yêu cầu nhiều tài khoản cùng triển khai EC2/RDS trong cùng một mạng phẳng để **tối ưu chi phí truyền dữ liệu (zero inter-AZ/inter-account peering fee)** và **quản trị IP/Routing tập trung** $\rightarrow$ chọn **Shared VPC với AWS RAM**.

---

## 2. Xử lý Overlapping CIDR & VPC Peering

### VPC Peering Limitations
- **Không hỗ trợ Transitive Routing**: VPC A peer với VPC B, VPC B peer với VPC C $\rightarrow$ A không thể đi qua B để tới C.
- **Không hỗ trợ Overlapping CIDR**: Hai VPC có dải IP trùng nhau không thể tạo VPC Peering.
- **Hỗ trợ Cross-Region & Cross-Account**: Dữ liệu đi qua backbone riêng của AWS và được mã hóa ở lớp liên kết.

### Giải pháp khi gặp Overlapping CIDR (M&A / Partner Integration)
1. **AWS PrivateLink**: Giải pháp tối ưu nhất cho giao tiếp Client-Server một chiều (TCP/UDP) qua **NLB + Endpoint Service**. Không cần lo trùng CIDR vì Consumer truy cập qua ENI nội bộ trong VPC của chính mình.
2. **Secondary CIDR + Private NAT Gateway**: Thêm dải IP phụ không trùng (non-overlapping secondary CIDR) vào VPC, đặt **Private NAT Gateway** ở subnet có dải CIDR mới để NAT lưu lượng trước khi đi qua Transit Gateway hoặc Direct Connect.
3. **VPC Lattice**: Kết nối các dịch vụ HTTP/HTTPS/gRPC ở Layer 7 giữa các VPC có Overlapping CIDR mà không cần quản lý NAT hay Peering.

```bash
# Thêm Secondary CIDR vào VPC hiện tại
aws ec2 associate-vpc-cidr-block \
  --vpc-id vpc-0a1b2c3d4e5f67890 \
  --cidr-block 100.64.0.0/16

# Tạo Private NAT Gateway (không cần Elastic IP, dùng cho Hybrid/Overlapping CIDR)
aws ec2 create-nat-gateway \
  --subnet-id subnet-0123456789abcdef0 \
  --connectivity-type private
```

---

## 3. VPC Endpoints: Gateway vs. Interface Endpoints

| Tiêu chí | Gateway Endpoint | Interface Endpoint (AWS PrivateLink) |
| :--- | :--- | :--- |
| **Dịch vụ hỗ trợ** | Chỉ **Amazon S3** và **Amazon DynamoDB** | Hơn 100 dịch vụ AWS & SaaS đối tác |
| **Cơ chế hoạt động** | Thêm Prefix List (`pl-xxxx`) vào **VPC Route Table** | Tạo **ENI** có Private IP trong Subnet |
| **Truy cập từ On-Premises (DX/VPN)** | **Không hỗ trợ** trực tiếp (phải đi qua Proxy hoặc Interface Endpoint cho S3) | **Hỗ trợ** trực tiếp từ On-Premises qua DX/VPN |
| **Chi phí** | **Miễn phí** | Tính phí theo giờ mỗi AZ + phí xử lý dữ liệu (/GB) |

> **Exam Tip**: Cần truy cập **Amazon S3** từ Data Center on-premises qua Direct Connect Private VIF mà **không qua Internet**? Hãy dùng **S3 Interface Endpoint** (PrivateLink), không phải S3 Gateway Endpoint!

---

[Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/01-vpc-architecture-peering.md) | [Bài tiếp →](02-hybrid-edge-design.md)
