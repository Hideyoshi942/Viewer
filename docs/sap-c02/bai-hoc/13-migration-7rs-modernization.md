# Di chuyển (7Rs) & Hiện đại hóa Workload Quy Mô Lớn

Domain 4 (**Accelerate Workload Migration and Modernization** — 20%) đánh giá khả năng lập kế hoạch di chuyển hàng trăm máy chủ, hàng petabyte dữ liệu từ on-premises lên AWS với downtime tối thiểu, đồng thời hiện đại hóa ứng dụng monolithic cũ kỹ sang kiến trúc cloud-native.

---

## 1. Khung Chiến lược 7Rs của AWS

| Chiến lược | Ý nghĩa | Khi nào chọn trên đề thi SAP-C02? |
| :--- | :--- | :--- |
| **Rehost (Lift & Shift)** | Di chuyển nguyên trạng lên EC2 | Thời hạn đóng cửa Data Center quá gấp (vài tuần/tháng), cần di chuyển nhanh rồi tối ưu sau (**AWS MGN**) |
| **Relocate** | Di chuyển ở tầng hypervisor không sửa OS/app | Doanh nghiệp đang dùng VMware vSphere on-prem cần lên cloud nhanh mà giữ nguyên công cụ VMware (**VMware Cloud on AWS**) |
| **Replatform (Lift, Tinker & Shift)** | Thay đổi nhỏ để tận dụng managed services | Chuyển DB tự quản lý sang Amazon RDS/Aurora hoặc chuyển app container sang Amazon ECS/EKS mà không viết lại core code |
| **Refactor / Re-architect** | Thiết kế lại hoàn toàn theo cloud-native | Cần scale cực lớn, agility cao hoặc giảm chi phí bản quyền dài hạn (tách Monolith thành Microservices, Serverless, DynamoDB) |
| **Repurchase (Drop & Shop)** | Chuyển sang sản phẩm SaaS thương mại | Thay hệ thống CRM/ERP tự viết lỗi thời bằng Salesforce, Workday hoặc dịch vụ trên AWS Marketplace |
| **Retire** | Tắt bỏ, ngừng sử dụng | Ứng dụng không còn ai dùng (thường chiếm 10–20% portfolio sau khi discovery) |
| **Retain (Revisit)** | Giữ lại ở on-premises | Ràng buộc pháp lý/độ trễ cực thấp (hoặc dùng **AWS Outposts**), sắp hết khấu hao phần cứng |

---

## 2. Giai đoạn Assess & Mobilize: Discovery & Lập kế hoạch

- **AWS Migration Hub**: Bảng điều khiển trung tâm theo dõi tiến độ di chuyển ứng dụng từ nhiều công cụ (MGN, DMS).
- **AWS Application Discovery Service (ADS)**:
  - **Agentless Discovery Collector**: Triển khai trên VMware vCenter thu thập cấu hình VM, CPU/RAM utilization.
  - **Application Discovery Agent**: Cài đặt trực tiếp lên Linux/Windows server để thu thập thêm **network connections & running processes**, cực kỳ quan trọng để vẽ **dependency mapping** trước khi chia migration waves.
- **Migration Evaluator**: Phân tích TCO và đề xuất cấu hình tối ưu chi phí (right-sized EC2, tối ưu Windows/SQL Server licensing BYOL vs License Included).

---

## 3. Công cụ Di chuyển Server & Cơ sở dữ liệu

### Di chuyển Máy chủ: AWS Application Migration Service (AWS MGN)
- Kế nhiệm CloudEndure Migration, là công cụ khuyến nghị hàng đầu cho **Rehost**.
- Cơ chế hoạt động: Cài đặt **AWS Replication Agent** trên máy chủ nguồn (vật lý, VMware, Hyper-V, cloud khác) → thực hiện **continuous block-level replication** vào một **Staging Area Subnet** chi phí thấp (dùng EBS giá rẻ và lightweight replication servers).
- Khi thực hiện **Test** hoặc **Cutover**, MGN tự động khởi chạy máy chủ chuyển đổi (Conversion Server) và dựng EC2 Production với downtime chỉ tính bằng **vài phút**.
- Hỗ trợ **Post-Launch Actions** (tích hợp SSM) để tự động cài đặt agent, đổi cấu hình hoặc hiện đại hóa ngay sau khi cutover.

### Di chuyển Cơ sở dữ liệu: AWS DMS & AWS SCT

| Tình huống | Công cụ & Cơ chế | Lưu ý quan trọng |
| :--- | :--- | :--- |
| **Homogeneous Migration** (Oracle → Oracle, MySQL → Aurora MySQL) | **AWS DMS** (hoặc native tools như `pg_dump`, Aurora Read Replica) | Nên kiểm tra xem native tools có giữ nguyên stored procedures/indexes tốt hơn không |
| **Heterogeneous Migration** (Oracle → Aurora PostgreSQL, SQL Server → MySQL) | **AWS Schema Conversion Tool (SCT)** + **AWS DMS** | Bắt buộc dùng **SCT** trước để chuyển đổi schema, views, stored procedures; sau đó dùng **DMS** di chuyển dữ liệu |
| **Near-Zero Downtime** | **AWS DMS: Full Load + Ongoing Replication (CDC)** | Cần bật supplemental logging (Oracle) hoặc binlog (MySQL) trên DB nguồn |

> **Exam Tip**: AWS DMS **không chuyển đổi schema phức tạp** (stored procedures, triggers, secondary indexes). Bất kỳ câu hỏi nào yêu cầu chuyển từ **Oracle/SQL Server sang Aurora PostgreSQL/MySQL** (Heterogeneous) đều phải có **AWS SCT** đi kèm **AWS DMS**.

---

## 4. Di chuyển Dữ liệu Quy mô Lớn (Online vs Offline)

| Dịch vụ | Kênh truyền | Use Case chuẩn |
| :--- | :--- | :--- |
| **AWS DataSync** | Online (Internet / DX) | Di chuyển dữ liệu file/object (**NFS, SMB, HDFS, S3, EFS, FSx**) với giao thức tối ưu tăng tốc tới 10x, tự động kiểm tra toàn vẹn dữ liệu, hỗ trợ lịch đồng bộ định kỳ và giữ nguyên metadata/permissions (POSIX/ACLs) |
| **AWS Transfer Family** | Online | Thay thế máy chủ **SFTP, FTPS, FTP, AS2** cũ bằng dịch vụ fully managed lưu thẳng dữ liệu vào **Amazon S3** hoặc **Amazon EFS** mà không cần sửa client của đối tác |
| **AWS Storage Gateway** | Hybrid Online | **File Gateway** (NFS/SMB cache on-prem lưu S3), **Volume Gateway** (iSCSI), **Tape Gateway** (VTL thay thế băng từ backup) |
| **AWS Snowball Edge** | Offline (Thiết bị vật lý) | Di chuyển từ **vài chục TB đến nhiều PB** khi băng thông mạng hạn chế (quy tắc ngón tay cái: nếu truyền qua mạng mất > 1 tuần, hãy dùng Snowball Edge). Hỗ trợ cả Edge Computing (EC2/Lambda) |
| **AWS Direct Connect + DataSync** | Online băng thông cao | Dữ liệu lớn nhưng cần đồng bộ liên tục (incremental) và đã có đường truyền DX 10Gbps+ |

---

## 5. Chiến lược Hiện đại hóa Ứng dụng (Modernization Patterns)

### Strangler Fig Pattern
Thay vì viết lại toàn bộ hệ thống Monolith trong một lần (Big Bang — rủi ro cực cao), ta đặt một lớp định tuyến (**Amazon API Gateway** hoặc **Application Load Balancer** với Path-based Routing) ở phía trước:
1. Ban đầu 100% traffic vẫn đi vào Monolith cũ.
2. Tách dần từng domain nghiệp vụ (ví dụ: Payment, Inventory) sang **Microservices** (AWS Lambda / ECS Fargate / EKS).
3. Chuyển hướng từng đường dẫn API (`/api/v2/payments`) sang microservice mới.
4. Khi toàn bộ tính năng đã chuyển xong, tắt bỏ Monolith (Retire).

### Hiện đại hóa sang Containers & Serverless
- **AWS App2Container (A2C)**: Tự động phân tích ứng dụng Java/.NET đang chạy trên VM, đóng gói thành Docker image và sinh template CloudFormation triển khai lên **Amazon ECS** hoặc **Amazon EKS**.
- **Amazon EventBridge + Step Functions**: Thay thế các batch job cron phức tạp và quy trình nghiệp vụ dài hạn bằng **AWS Step Functions** (Standard Workflows cho quy trình chạy tối đa 1 năm, exactly-once; Express Workflows cho event tốc độ cao, chạy dưới 5 phút).
- **AWS Mainframe Modernization**: Hỗ trợ Automated Refactoring (chuyển COBOL sang Java) hoặc Replatforming cho các hệ thống Mainframe ngân hàng/bảo hiểm.

---

[← Bài trước](12-observability-security-hub-remediation.md) | [Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/13-migration-modernization.md) | [Bài tiếp →](14-migration-refactor-spaces-mainframe.md)
