# Migration Hub Refactor Spaces, Mainframe Modernization, Storage Gateway & Data Transfer

Trong Domain 4 (**Accelerate Workload Migration and Modernization**) của kỳ thi **SAP-C02**, ngoài 7Rs cơ bản, AWS kiểm tra rất sâu các dịch vụ hiện đại hóa ứng dụng (**Refactor Spaces**, **Mainframe Modernization**) và lựa chọn công cụ truyền tải/lưu trữ dữ liệu hybrid (**Storage Gateway**, **DataSync**, **Transfer Family**, **Snow Family**).

---

## 1. AWS Migration Hub Refactor Spaces — Strangler Fig Pattern

**AWS Migration Hub Refactor Spaces** là điểm khởi đầu để tái kiến trúc (refactor) các ứng dụng nguyên khối (**Monolith**) thành kiến trúc **Microservices** theo mô hình **Strangler Fig Pattern** mà không gây gián đoạn cho người dùng cuối.

### Cơ chế hoạt động & Thành phần kiến trúc

Thay vì phải tự tay dựng tầng routing phức tạp xuyên nhiều tài khoản, Refactor Spaces tự động điều phối và quản lý hạ tầng routing gồm:

1. **Environment**: Lớp vỏ bao bọc một nhóm các AWS accounts tham gia quá trình refactor (thường gồm Account chứa Monolith cũ và các Accounts chứa Microservices mới). Refactor Spaces tự động tạo **AWS Transit Gateway**, **AWS RAM resource shares**, và kết nối mạng giữa các VPC trong Environment.
2. **Application**: Đại diện cho một ứng dụng đang được refactor bên trong Environment. Nó tự động tạo:
   - **Amazon API Gateway** (Regional REST/HTTP API) làm entry point duy nhất cho client.
   - **Network Load Balancer (NLB)** và **VPC Link** để định tuyến traffic an toàn vào các private VPCs thông qua Transit Gateway.
3. **Services**: Các backend endpoint (có thể là EC2/ALB của Monolith cũ, hoặc Lambda/ECS/EKS của Microservices mới).
4. **Routes**: Quy tắc định tuyến theo **HTTP path & method** (ví dụ: `/orders/*` -> route tới Microservice Account mới; mọi route mặc định `/*` -> vẫn route về Monolith Account cũ).

```
Client --> [API Gateway] --> [NLB + VPC Link] --> [Transit Gateway (AWS RAM)]
                                                     |--> /orders/*  --> Microservice A (Account 2 - ECS/Lambda)
                                                     |--> /* (Default)--> Monolith App (Account 1 - EC2/ALB)
```

> **Exam Tip**: Khi đề bài mô tả: *"Công ty muốn tách dần từng module của ứng dụng Monolith sang Microservices trên nhiều AWS accounts khác nhau, giữ nguyên một endpoint duy nhất cho client, cần định tuyến theo URL path và giảm thiểu công sức tự cấu hình API Gateway + VPC Link + Transit Gateway"* -> Đáp án chuẩn là **AWS Migration Hub Refactor Spaces**.

---

## 2. AWS Mainframe Modernization

**AWS Mainframe Modernization** là nền tảng managed giúp di chuyển, hiện đại hóa, kiểm thử và vận hành các ứng dụng **Mainframe (COBOL, PL/I, JCL, CICS, IMS, VSAM, DB2)** lên AWS.

### Hai chiến lược chuyển đổi chính (Cực kỳ hay ra thi!)

| Tiêu chí | **Replatform with Micro Focus** | **Automated Refactoring with AWS Blu Age** |
| :--- | :--- | :--- |
| **Bản chất (7Rs)** | **Replatform** (Giữ nguyên ngôn ngữ COBOL/PL/I, thay đổi runtime environment) | **Refactor / Re-architect** (Chuyển đổi mã nguồn tự động) |
| **Đầu ra mã nguồn** | Vẫn giữ **COBOL / PL/I** (biên dịch chạy trên Micro Focus Enterprise Server runtime trên AWS) | Chuyển đổi hoàn toàn sang **Java (Spring Boot)** hiện đại, dễ bảo trì |
| **Tốc độ & Rủi ro** | **Nhanh hơn**, ít thay đổi code nghiệp vụ, phù hợp khi thiếu thời gian hoặc chưa muốn viết lại | **Tốn thời gian kiểm thử hơn**, nhưng loại bỏ hoàn toàn technical debt của COBOL và dễ tuyển dụng lập trình viên Java |
| **Cơ sở dữ liệu** | Chuyển VSAM/DB2 sang Amazon RDS / Aurora hoặc giữ tương thích qua Micro Focus data tools | Tự động chuyển đổi cấu trúc dữ liệu sang **Amazon Aurora PostgreSQL / RDS** |
| **Runtime trên AWS** | Managed Runtime Environment (tự động scaling, high availability, CloudWatch integration) | Managed Runtime Environment chạy Java/Spring Boot |

### Quy trình chuẩn của AWS Mainframe Modernization

1. **Assess & Analyze**: Phân tích mã nguồn, dependencies, độ phức tạp (Data Lineage, Call Graphs).
2. **Transform / Compile**: Dùng **Blu Age** (chuyển COBOL -> Java) hoặc **Micro Focus** (compile COBOL cho Linux/x86).
3. **Test & Validate**: Tích hợp công cụ so sánh kết quả batch/online (parallel testing) giữa Mainframe cũ và AWS.
4. **Deploy & Operate**: Chạy trên Managed Runtime Environment với Auto Scaling, Multi-AZ, CloudWatch Logs/Metrics.

> **Exam Tip**:
> - Đề bài nói *"chuyển Mainframe COBOL lên AWS nhanh nhất, giữ nguyên code COBOL hiện tại để đội ngũ COBOL tiếp tục bảo trì"* -> Chọn **AWS Mainframe Modernization — Replatform with Micro Focus**.
> - Đề bài nói *"loại bỏ hoàn toàn COBOL legacy, chuyển đổi tự động sang Java/Spring Boot và Aurora để đội ngũ cloud-native hiện đại dễ phát triển tiếp"* -> Chọn **AWS Mainframe Modernization — Automated Refactoring with AWS Blu Age**.

---

## 3. AWS Storage Gateway — Hybrid Cloud Storage

**AWS Storage Gateway** kết nối hạ tầng on-premises với lưu trữ AWS thông qua virtual appliance (VMware, Hyper-V, KVM, EC2) hoặc Hardware Appliance, cung cấp **local cache độ trễ thấp** tại on-premises.

| Loại Gateway | Giao thức On-Premises | Backend lưu trữ AWS | Use Case điển hình |
| :--- | :--- | :--- | :--- |
| **Amazon S3 File Gateway** | **NFS (v3/v4.1)**, **SMB** | **Amazon S3** (1 file = 1 S3 object, hỗ trợ Lifecycle/Glacier) | Thay thế NAS tại văn phòng, đẩy dữ liệu file lên S3 Data Lake, ứng dụng on-premises đọc/ghi file lưu trực tiếp dạng S3 object |
| **Amazon FSx File Gateway** | **SMB** (tích hợp Active Directory, NTFS ACLs) | **Amazon FSx for Windows File Server** | Truy cập low-latency tới file shares trên FSx for Windows từ văn phòng on-premises |
| **Tape Gateway (VTL)** | **iSCSI** (Virtual Tape Library) | **S3** -> chuyển tự động sang **S3 Glacier Flexible Retrieval / Deep Archive** | Thay thế hệ thống băng từ vật lý (physical tape backup) mà **không cần sửa phần mềm backup** hiện tại (Veeam, Commvault, Veritas) |
| **Volume Gateway — Cached Mode** | **iSCSI** (Block storage) | **Amazon S3** (lưu toàn bộ dữ liệu); local chỉ giữ cache dữ liệu hay dùng | Giảm dung lượng đĩa on-premises, mở rộng dung lượng block storage gần như vô hạn lên cloud |
| **Volume Gateway — Stored Mode** | **iSCSI** (Block storage) | Toàn bộ dữ liệu lưu **100% tại on-premises**, đồng bộ bất đồng bộ lên **S3 (EBS Snapshots)** để backup/DR | Cần truy cập độ trễ cực thấp tới **toàn bộ** dataset tại local (không chấp nhận cache miss) nhưng vẫn cần cloud backup |

> **Exam Tip**:
> - Cần các file đẩy lên cloud **lưu thành từng S3 Object riêng lẻ** để dịch vụ analytics (Athena/Glue) đọc được -> **S3 File Gateway**.
> - Cần **SMB + Windows AD permissions + NTFS** cho file share doanh nghiệp -> **FSx File Gateway**.
> - Phần mềm backup cũ đòi hỏi **Virtual Tape Library (iSCSI VTL)** -> **Tape Gateway**.
> - **Volume Gateway Stored Mode** lưu toàn bộ data tại local + async snapshot lên S3; **Cached Mode** lưu toàn bộ data trên S3 + chỉ cache hot data tại local.

---

## 4. So sánh DataSync vs Transfer Family vs Snow Family

| Tiêu chí | **AWS DataSync** | **AWS Transfer Family** | **AWS Snow Family** |
| :--- | :--- | :--- | :--- |
| **Mục đích chính** | **Đồng bộ/di chuyển dữ liệu quy mô lớn** (tự động, tốc độ cao qua mạng) giữa on-premises/cloud khác và AWS | **Cung cấp Managed File Transfer Server** (SFTP, FTPS, FTP, AS2) cho đối tác/khách hàng bên ngoài | **Vận chuyển vật lý** dữ liệu cực lớn (TB đến PB) hoặc xử lý **Edge Computing** nơi không có mạng |
| **Giao thức / Nguồn** | NFS, SMB, HDFS, Object Storage (S3-compatible), EFS, FSx, S3 | **SFTP, FTPS, FTP, AS2** | Thiết bị vật lý: **Snowcone** (8TB HDD / 14TB SSD), **Snowball Edge Storage Optimized** (80TB / 210TB NVMe), **Snowball Edge Compute Optimized** |
| **Tốc độ / Băng thông** | Nhanh gấp **10x** công cụ mã nguồn mở nhờ giao thức tối ưu, nén, đa luồng, kiểm soát băng thông | Phụ thuộc kết nối Internet/Direct Connect của client | Dùng khi băng thông mạng quá chậm (ví dụ: di chuyển 100 TB qua đường truyền 100 Mbps mất > 3 tháng -> dùng Snowball mất ~1 tuần) |
| **Bảo toàn Metadata** | Bảo toàn **POSIX permissions, timestamps, NTFS ACLs** | Lưu thẳng vào **Amazon S3** hoặc **Amazon EFS** với custom IdP (Okta, Cognito, AD, Lambda) | Dữ liệu mã hóa bằng **KMS** từ trước khi gửi thiết bị về AWS |

### Ví dụ chọn công cụ Data Transfer theo tình huống

1. **Di chuyển 50 TB từ NAS on-premises (NFS/SMB) sang Amazon EFS / FSx / S3 qua đường truyền Direct Connect 10 Gbps, giữ nguyên quyền file (permissions) và đồng bộ incremental theo lịch**:
   -> **AWS DataSync** (cài đặt DataSync Agent trên VMware/Hyper-V/KVM tại on-premises).
2. **Đối tác B2B bên ngoài cần upload file hóa đơn hàng ngày qua giao thức SFTP hoặc AS2 vào S3 bucket, không muốn tự quản lý EC2 SFTP server**:
   -> **AWS Transfer Family**.
3. **Di chuyển 250 TB dữ liệu video từ phòng lab có đường truyền Internet chỉ 50 Mbps, yêu cầu hoàn thành trong 2 tuần**:
   -> Đặt nhiều **AWS Snowball Edge Storage Optimized** (hoặc chạy DataSync sau đó cho phần delta).

> **Exam Tip**:
> - **Transfer Family** KHÔNG phải là công cụ migration một lần qua NFS/SMB; nó là managed **SFTP/FTPS/FTP/AS2 endpoint** đặt trên S3 hoặc EFS để thay thế legacy SFTP server cho B2B partners.
> - **AWS DataSync** cũng hỗ trợ đồng bộ **Cloud-to-Cloud** (từ Google Cloud Storage, Azure Blob Storage, Cloudflare R2 sang Amazon S3) mà không cần cài agent tại nguồn!
> - **Snowcone** hỗ trợ **AWS DataSync Agent** cài sẵn để gửi dữ liệu trực tuyến nếu có mạng, hoặc ship vật lý nếu offline.

---

[← Bài trước](13-migration-7rs-modernization.md) | [Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/14-refactor-mainframe-storage-transfer.md) | [Bài tiếp →](15-data-analytics-lakes-modernization.md)
