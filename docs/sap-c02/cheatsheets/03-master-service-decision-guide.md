# Master Service Decision Guide & Exam Cram — AWS SAP-C02

Tổng hợp nhanh các cặp dịch vụ hay gây nhầm lẫn nhất trong kỳ thi **Solutions Architect - Professional (SAP-C02)** theo cấu trúc **Tình huống đề bài → Dịch vụ chuẩn → Lý do chọn**.

## 1. Mạng Hybrid & Kết nối Đa tài khoản (Networking Decision Matrix)

| Từ khóa / Tình huống trong đề thi | Chọn giải pháp này | Tránh bẫy |
| :--- | :--- | :--- |
| Kết nối hàng chục/trăm VPC + nhiều On-premises theo mô hình Hub-and-Spoke | **AWS Transit Gateway (TGW)** + **AWS RAM** | Không dùng VPC Peering vì không có transitive routing (n*(n-1)/2 kết nối). |
| Kết nối nhiều Region toàn cầu, tự động phân đoạn mạng (Network Segments) | **AWS Cloud WAN** | TGW Peering thủ công tốn công quản lý route table hơn ở quy mô Global. |
| Mã hóa lưu lượng đi qua **Direct Connect** (compliance yêu cầu mã hóa đầu-cuối) | **Site-to-Site VPN over Direct Connect Public VIF** hoặc **MACsec (10Gbps+)** | Direct Connect mặc định **không mã hóa** tầng IP! |
| Truy cập dịch vụ SaaS/Nội bộ ở VPC khác **bị trùng dải CIDR** | **AWS PrivateLink (Interface Endpoint + NLB)** | VPC Peering và TGW đều không định tuyến được khi trùng CIDR. |
| Phân giải DNS 2 chiều giữa On-premises AD/DNS và Route 53 Private Hosted Zone | **Route 53 Resolver Inbound + Outbound Endpoints** + **Forwarding Rules** (chia sẻ qua RAM) | Không tự dựng EC2 BIND/Unbound server vì tốn vận hành. |
| Cần 2 **Static Anycast IP** cố định toàn cầu, hỗ trợ **TCP/UDP** (Gaming, IoT, VoIP), failover < 1 phút | **AWS Global Accelerator** | CloudFront chỉ hỗ trợ HTTP/HTTPS và không có static IP mặc định. |
| Cần kiểm tra gói tin sâu (**IPS/IDS, Suricata, Domain Filtering**) tập trung cho toàn Organization | **AWS Network Firewall** (hoặc **GWLB + Firewall bên thứ 3**) đặt tại Inspection VPC nối qua TGW | NACL là stateless và không lọc được domain/payload Layer 7. |

## 2. Cơ sở dữ liệu, Lưu trữ & Multi-Region DR

| Tình huống | Giải pháp tối ưu SAP-C02 | Ghi chú Exam Tip |
| :--- | :--- | :--- |
| RPO < 1 giây, RTO < 1 phút cho Relational DB đa Region | **Amazon Aurora Global Database** | Hỗ trợ Managed Planned Failover (RPO = 0) và Switchover; Read Replica ở Region phụ đọc độ trễ thấp. |
| Active-Active Multi-Region NoSQL (ghi ở mọi Region) | **DynamoDB Global Tables** | Bắt buộc bật DynamoDB Streams; xử lý xung đột theo **Last Writer Wins**. |
| Ứng dụng Serverless (Lambda) tạo quá nhiều connection làm quá tải RDS/Aurora | **Amazon RDS Proxy** | Gom connection pool, giảm tới 66% thời gian failover, ép dùng IAM Auth & Secrets Manager. |
| 1 Endpoint toàn cầu cho S3 tự định tuyến tới Bucket gần nhất + Multi-Region Failover | **S3 Multi-Region Access Points (MRAP)** + **S3 CRR** | Kết hợp **Route 53 ARC** để điều khiển failover chủ động. |
| Shared File System cho **Windows/SMB + Active Directory** | **Amazon FSx for Windows File Server** | EFS chỉ hỗ trợ Linux (NFSv4), không hỗ trợ Windows! |
| Shared File System hỗ trợ cả **NFS, SMB, iSCSI + SnapMirror từ On-prem NetApp** | **Amazon FSx for NetApp ONTAP** | Lựa chọn số 1 khi đề nhắc tới di chuyển NetApp mà không sửa ứng dụng. |
| High-Performance Computing (HPC) / ML training đọc ghi hàng trăm GB/s với S3 | **Amazon FSx for Lustre** | Tích hợp đồng bộ trực tiếp với S3 bucket. |

## 3. Chiến lược Di chuyển (7Rs) & Hiện đại hóa

| Nhu cầu di chuyển | Dịch vụ chuẩn | Lưu ý quan trọng |
| :--- | :--- | :--- |
| Lift-and-Shift (Rehost) hàng trăm VM VMware/Hyper-V/Physical với downtime tối thiểu | **AWS Application Migration Service (MGN)** | Thay thế CloudEndure/SMS; replication liên tục cấp block. |
| Di chuyển DB **khác engine** (Oracle/SQL Server → Aurora PostgreSQL) | **AWS SCT** (đổi schema) + **AWS DMS** (full load + CDC) | DMS chỉ chuyển dữ liệu, không tự chuyển stored procedures phức tạp nếu thiếu SCT. |
| Đồng bộ dữ liệu file (NFS/SMB/HDFS) định kỳ qua mạng lên S3/EFS/FSx (giữ metadata/permissions) | **AWS DataSync** | Nhanh hơn `aws s3 sync` tới 10 lần, hỗ trợ giới hạn băng thông (throttling). |
| Băng thông mạng quá chậm, cần chuyển **80 TB – vài PB** dữ liệu offline | **AWS Snowball Edge** (Storage Optimized) | Quy tắc ngón tay cái: nếu truyền qua mạng mất > 1 tuần → dùng Snowball. |
| SFTP/FTPS/AS2 cho đối tác bên ngoài ghi trực tiếp vào S3/EFS | **AWS Transfer Family** | Không cần vận hành EC2 SFTP server. |

## 4. Checklist 10 Bẫy Đề Thi SAP-C02 Kinh Điển
1. **SCP không cấp quyền** và **không tác động tới Management Account**; luôn gắn `FullAWSAccess` ở Root nếu dùng chiến lược Deny-list.
2. **AWS Organizations Consolidated Billing**: Chia sẻ Reserved Instances / Savings Plans bật mặc định, nhưng có thể tắt ở cấp từng Account trong Management Account.
3. **CloudFormation StackSets**: Chọn **Service-Managed** khi triển khai theo OU trong AWS Organizations (tự động deploy khi có account mới gia nhập OU).
4. **KMS Multi-Region Keys**: Dùng cùng Key ID & key material giữa các Region để mã hóa ở Region A và giải mã ở Region B mà không phải gọi API xuyên Region.
5. **Cross-AZ Data Transfer**: Tắt Cross-Zone Load Balancing nếu cần tối ưu chi phí nội vùng; dùng **Gateway VPC Endpoint** (miễn phí) cho S3/DynamoDB thay vì đi qua NAT Gateway.
6. **Route 53 Application Recovery Controller (ARC)**: Dùng **Routing Controls** (data plane siêu tin cậy, 5 cụm phân tán) để failover khi AWS Control Plane gặp sự cố.
7. **Lambda@Edge vs CloudFront Functions**: Logic đơn giản (< 1ms, không gọi mạng ngoài, chỉnh header/URL redirect) → **CloudFront Functions** (rẻ hơn 6 lần); logic nặng/gọi DynamoDB/Origin Request → **Lambda@Edge**.
8. **S3 Event Notifications vs EventBridge**: Cần fan-out tới nhiều target, lọc theo nội dung/metadata phức tạp, hoặc archive/replay → bật **Send notifications to Amazon EventBridge** trên S3.
9. **Step Functions Standard vs Express**: Chạy tới 1 năm, Exactly-Once, hỗ trợ `.waitForTaskToken` (human approval) → **Standard**; lưu lượng cực cao (>100,000 req/s), chạy < 5 phút, giá rẻ → **Express**.
10. **AWS Control Tower**: Cách nhanh nhất dựng Multi-Account Landing Zone có sẵn Guardrails (Preventive = SCP, Detective = AWS Config) và Account Factory.

---

[Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md)
