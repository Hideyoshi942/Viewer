# Bài tập tình huống — Chủ đề 11: FinOps & Cost Optimization at Scale — Compute Optimizer, Shared Savings Plans/RI, Data Transfer & Storage Tiering

> AWS Compute Optimizer, chia sẻ Savings Plans & RI trong Organizations, tối ưu chi phí Data Transfer Cross-AZ/NAT Gateway và S3 Intelligent-Tiering.
> **Số câu hỏi:** 11 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A conglomerate uses AWS Organizations with Consolidated Billing across 25 subsidiary accounts. Subsidiary A purchased a large number of 3-year All Upfront EC2 Reserved Instances (RIs) and Compute Savings Plans out of its own IT budget. The CFO of Subsidiary A notices that unused RI and Savings Plans discounts are being automatically applied to workloads in Subsidiary B and Subsidiary C, complicating internal chargebacks. Subsidiary A must remain in AWS Organizations for SCP governance and consolidated invoicing, but its RI and Savings Plans discounts must apply exclusively to Subsidiary A. What should the Solutions Architect do?

- **A.** Attach a Service Control Policy (SCP) to Subsidiary B and Subsidiary C denying the ec2:PurchaseReservedInstancesOffering and ec2:ModifyReservedInstances actions.
- **B.** Convert all of Subsidiary A's Regional Reserved Instances to Zonal Reserved Instances so that discounts cannot be shared with other member accounts in the organization.
- **C.** Move Subsidiary A out of AWS Organizations into a standalone AWS account and use the AWS Cost Explorer API to manually aggregate monthly invoices.
- **D.** In the AWS Organizations Management account under Billing Preferences, turn off Reserved Instance and Savings Plans discount sharing for Subsidiary A's account.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tập đoàn sử dụng AWS Organizations với Consolidated Billing trên 25 tài khoản công ty con. Công ty con A đã mua một số lượng lớn EC2 Reserved Instances (RIs) trả trước toàn bộ 3 năm và Compute Savings Plans bằng ngân sách CNTT riêng của mình. CFO của Công ty con A nhận thấy các khoản chiết khấu RI và Savings Plans chưa sử dụng đang tự động được áp dụng cho các workload ở Công ty con B và Công ty con C, gây phức tạp cho việc phân bổ chi phí nội bộ. Công ty con A phải ở lại AWS Organizations để quản trị SCP và xuất hóa đơn hợp nhất, nhưng chiết khấu RI và Savings Plans của họ chỉ được áp dụng độc quyền cho Công ty con A. Solutions Architect nên làm gì?

**Đáp án đúng:** **D**

Trong **AWS Organizations Consolidated Billing**, mặc định chiết khấu RI và Savings Plans được chia sẻ giữa tất cả các tài khoản. Để cô lập ưu đãi cho một tài khoản cụ thể mà vẫn giữ trong Organization, hãy tắt **Discount Sharing** cho tài khoản đó trong **Billing Preferences** của Management account.

- **A:** SCP chỉ ngăn quyền mua RI mới chứ không ngăn cơ chế chia sẻ chiết khấu thanh toán (billing discount sharing) của AWS Organizations.
- **B:** Zonal RIs vẫn được chia sẻ chiết khấu thanh toán giữa các tài khoản trong cùng Organization nếu discount sharing đang bật.
- **C:** Tách tài khoản khỏi AWS Organizations vi phạm yêu cầu giữ nguyên quản trị SCP và thanh toán hợp nhất (consolidated invoicing).
- **D (Đúng):** Chính xác. Trong Billing Preferences của Management account, AWS cho phép tắt tính năng RI và Savings Plans discount sharing cho từng tài khoản thành viên cụ thể. Khi tắt cho Subsidiary A, các ưu đãi RI/SP mua trong Subsidiary A chỉ áp dụng cho chính nó và không chia sẻ sang các tài khoản khác.

</details>

### Câu 2 `medium`

A scientific research institute stores 800 TB of genomic datasets in an Amazon S3 bucket. Access patterns are highly unpredictable: some newly uploaded files are never read again, while 3-year-old datasets suddenly experience heavy burst reads when new research papers are published. Furthermore, incomplete multipart uploads from interrupted research pipelines have been silently accumulating storage charges, and researchers need faster upload throughput for 50 GB files from global offices. Which TWO actions should the Solutions Architect take? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Configure an S3 Lifecycle policy to transition all genomic datasets directly to S3 Glacier Deep Archive after 30 days to minimize long-term storage costs.
- **B.** Transition objects to S3 Intelligent-Tiering (with optional Archive Access tiers enabled) so S3 automatically moves objects between access tiers without retrieval fees based on changing access patterns.
- **C.** Add an S3 Lifecycle rule to expire incomplete multipart uploads after 7 days, and enable S3 Transfer Acceleration with multipart uploads for the 50 GB global transfers.
- **D.** Enable S3 Object Lock in Compliance Mode with a 7-day retention period to prevent incomplete multipart uploads from incurring storage charges.
- **E.** Move the 800 TB genomic dataset to Amazon EFS Infrequent Access so EFS automatically tiers objects without requiring S3 Lifecycle rules.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một viện nghiên cứu khoa học lưu trữ 800 TB tập dữ liệu gen trong một Amazon S3 bucket. Mẫu hình truy cập rất khó đoán: một số tệp mới tải lên không bao giờ được đọc lại, trong khi các tập dữ liệu 3 năm tuổi bỗng nhiên có lượng đọc tăng đột biến khi các bài báo nghiên cứu mới được công bố. Hơn nữa, các bản tải lên nhiều phần chưa hoàn thành từ các pipeline nghiên cứu bị gián đoạn đang âm thầm tích tụ phí lưu trữ, và các nhà nghiên cứu cần thông lượng tải lên nhanh hơn cho các tệp 50 GB từ các văn phòng toàn cầu. Solutions Architect nên thực hiện HAI hành động nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, C**

Tối ưu S3 toàn diện cho tập dữ liệu lớn truy cập bất định: dùng **S3 Intelligent-Tiering** (tự động phân tầng, không phí retrieval), cấu hình **Lifecycle AbortIncompleteMultipartUpload** để xóa rác upload dở dang, và bật **Multipart Upload + S3 Transfer Acceleration** cho tệp lớn xuyên lục địa.

- **A:** Glacier Deep Archive có thời gian khôi phục 12-48 giờ và phí retrieval cao, không phù hợp khi dữ liệu 3 năm tuổi bất ngờ bị đọc ồ ạt.
- **B (Đúng):** Chính xác. S3 Intelligent-Tiering được thiết kế riêng cho dữ liệu có tần suất truy cập không đoán trước (unpredictable access patterns), tự động tối ưu chi phí lưu trữ mà không tính phí retrieval khi dữ liệu cũ bất ngờ được đọc lại.
- **C (Đúng):** Chính xác. S3 Lifecycle rule `AbortIncompleteMultipartUpload` giúp loại bỏ chi phí ẩn từ các phiên upload dở dang; kết hợp Multipart Upload song song với S3 Transfer Acceleration (đi qua CloudFront Edge Locations) tăng tốc đáng kể việc tải tệp 50 GB từ các văn phòng toàn cầu.
- **D:** S3 Object Lock dùng để bảo vệ dữ liệu theo mô hình WORM (chống xóa/ghi đè), không liên quan đến dọn dẹp incomplete multipart uploads.
- **E:** Amazon EFS đắt hơn S3 nhiều lần cho lưu trữ đối tượng quy mô 800 TB và không có cơ chế S3 Transfer Acceleration cho tải lên toàn cầu.

</details>

### Câu 3 `hard`

An engineering company runs both Linux-based CAD rendering servers (requiring NFSv4) and Windows-based design workstations (requiring SMB) that must access the exact same shared 200 TB project file repository simultaneously. Approximately 80% of the files are infrequently accessed archival CAD models, and the team needs instant, zero-copy writable clones of multi-terabyte project directories for staging tests without duplicating storage costs. Which AWS storage service best satisfies all requirements?

- **A.** Amazon EFS with EFS Infrequent Access lifecycle management and AWS Storage Gateway File Gateway for Windows SMB clients.
- **B.** Amazon FSx for Lustre scratch file system linked to an Amazon S3 bucket with Automatic Export and POSIX permissions enabled.
- **C.** Amazon FSx for Windows File Server with Multi-AZ deployment, Data Deduplication, and Shadow Copies enabled for both Linux and Windows.
- **D.** Amazon FSx for NetApp ONTAP with Multi-Protocol (NFS and SMB) access, Capacity Pool storage tiering, and NetApp FlexClone.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty kỹ thuật vận hành cả máy chủ kết xuất CAD nền tảng Linux (yêu cầu NFSv4) và máy trạm thiết kế nền tảng Windows (yêu cầu SMB) phải truy cập đồng thời cùng một kho tệp dự án dùng chung 200 TB. Khoảng 80% tệp là các mô hình CAD lưu trữ ít được truy cập, và nhóm cần các bản sao có thể ghi tức thì, không sao chép dữ liệu (zero-copy writable clones) của các thư mục dự án nhiều terabyte cho kiểm thử staging mà không nhân đôi chi phí lưu trữ. Dịch vụ lưu trữ AWS nào đáp ứng tốt nhất tất cả các yêu cầu?

**Đáp án đúng:** **D**

Khi bài toán yêu cầu **Multi-Protocol (NFS + SMB cùng lúc)**, **tự động phân tầng dữ liệu lạnh (Capacity Pool tiering)** và **tạo bản sao tức thì không nhân đôi dung lượng (FlexClone)**, đáp án chuẩn xác trên SAP-C02 luôn là **Amazon FSx for NetApp ONTAP**.

- **A:** EFS chỉ hỗ trợ NFS (không hỗ trợ SMB trực tiếp) và không có tính năng zero-copy writable clones cho thư mục nhiều terabyte.
- **B:** FSx for Lustre tối ưu cho HPC/ML trên Linux (POSIX), không hỗ trợ giao thức SMB bản địa cho Windows workstations và không có tính năng FlexClone.
- **C:** FSx for Windows File Server chỉ hỗ trợ giao thức SMB, không hỗ trợ NFSv4 cho máy chủ Linux và không có tính năng capacity pool tiering hay zero-copy writable clones (FlexClone).
- **D (Đúng):** Chính xác. Amazon FSx for NetApp ONTAP là dịch vụ duy nhất trên AWS hỗ trợ đồng thời đa giao thức (NFS + SMB + iSCSI) trên cùng một tập dữ liệu, tự động đẩy 80% dữ liệu lạnh sang Capacity Pool giá rẻ (tối ưu chi phí), và cung cấp FlexClone tạo bản sao có thể ghi tức thì (zero-copy writable clones) không tốn dung lượng nhân đôi.

</details>

### Câu 4 `hard`

An autonomous vehicle research team trains deep learning models on a cluster of 64 GPU-accelerated Amazon EC2 instances (p4d.24xlarge). Training datasets totaling 120 TB are stored as millions of files in Amazon S3. Currently, training jobs are bottlenecked because each EC2 instance downloads files from S3 over HTTP, leaving expensive GPUs idle 60% of the time. The team needs a POSIX-compliant shared file system capable of hundreds of GB/s aggregate throughput and sub-millisecond latency that automatically lazy-loads data from S3 and writes trained checkpoints back to S3. Which storage solution should the Solutions Architect implement?

- **A.** Amazon EFS with Elastic Throughput mode mounted via NFSv4.1 across all 64 p4d.24xlarge GPU instances with DataSync S3 sync.
- **B.** Amazon FSx for Lustre integrated with the Amazon S3 bucket via a Data Repository Association (DRA) with AutoImport and AutoExport enabled.
- **C.** Amazon EBS io2 Block Express volumes attached simultaneously to all 64 EC2 instances using EBS Multi-Attach with a shared XFS file system.
- **D.** Amazon FSx for NetApp ONTAP with Capacity Pool storage tiering and SnapMirror replication enabled from Amazon S3 buckets.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm nghiên cứu xe tự hành huấn luyện các mô hình deep learning trên một cụm gồm 64 Amazon EC2 instance tăng tốc GPU (p4d.24xlarge). Các tập dữ liệu huấn luyện tổng cộng 120 TB được lưu dưới dạng hàng triệu tệp trong Amazon S3. Hiện tại, các tác vụ huấn luyện bị nghẽn cổ chai vì mỗi EC2 instance tải tệp từ S3 qua HTTP, khiến các GPU đắt tiền nhàn rỗi 60% thời gian. Nhóm cần một hệ thống tệp dùng chung tuân thủ POSIX có khả năng đạt thông lượng tổng hợp hàng trăm GB/s và độ trễ dưới một mili-giây, tự động nạp lười (lazy-load) dữ liệu từ S3 và ghi các checkpoint đã huấn luyện trở lại S3. Solutions Architect nên triển khai giải pháp lưu trữ nào?

**Đáp án đúng:** **B**

Đối với workload **HPC / Deep Learning GPU training** cần thông lượng hàng trăm GB/s, độ trễ sub-millisecond, POSIX shared file system và đồng bộ trực tiếp với **Amazon S3 (lazy loading / auto-export)**, **Amazon FSx for Lustre** luôn là đáp án tối ưu.

- **A:** Amazon EFS có độ trễ vài mili-giây và thông lượng tối đa thấp hơn nhiều so với yêu cầu hàng trăm GB/s của cụm 64 node p4d HPC/ML, đồng thời không có tính năng tích hợp lazy-load/auto-export trực tiếp với Amazon S3.
- **B (Đúng):** Chính xác. Amazon FSx for Lustre được thiết kế chuyên biệt cho HPC và Machine Learning: đạt thông lượng lên đến hàng trăm GB/s, hàng triệu IOPS với độ trễ dưới 1 ms (sub-millisecond), và tích hợp sâu với Amazon S3 qua Data Repository Association (tự động lazy-load dữ liệu từ S3 khi đọc và tự động export checkpoint ngược về S3).
- **C:** EBS Multi-Attach chỉ hỗ trợ tối đa 16 Nitro EC2 instances trong cùng 1 AZ, không tự cung cấp cluster-aware POSIX file system (dễ hỏng dữ liệu) và không đồng bộ trực tiếp với S3.
- **D:** FSx for NetApp ONTAP mạnh về đa giao thức doanh nghiệp (NFS/SMB) và lưu trữ đa dụng, không đạt thông lượng cực đại hàng trăm GB/s và tích hợp S3 Data Repository Association như FSx for Lustre cho HPC/ML.

</details>

### Câu 5 `medium`

A legal firm is optimizing its Windows-based document management system on AWS. Currently, 300 Windows users access 40 TB of Word and PDF documents stored on two self-managed Windows Server EC2 instances synchronized via DFS Replication (DFS-R), which frequently suffers from replication conflicts and high operational overhead. The firm requires native SMB 3.0 protocol, Windows NTFS ACLs, Active Directory integration, Windows Shadow Copies for user self-service file recovery, Multi-AZ high availability, and storage cost reduction via data deduplication. Which managed service should replace the self-managed EC2 file servers?

- **A.** Amazon FSx for Windows File Server deployed in Multi-AZ mode, joined to AWS Managed Microsoft AD, with Data Deduplication and Shadow Copies enabled.
- **B.** Amazon WorkDocs Enterprise Storage integrated with AWS DataSync and Active Directory Connector for SMB 3.0 file locking.
- **C.** Amazon EFS with EFS Infrequent Access lifecycle management, IAM authorization, and NFSv4 access for Windows workstations.
- **D.** AWS Storage Gateway S3 File Gateway deployed on a Windows EC2 instance with local EBS cache and DFS-R synchronization.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty luật đang tối ưu hóa hệ thống quản lý tài liệu nền tảng Windows trên AWS. Hiện tại, 300 người dùng Windows truy cập 40 TB tài liệu Word và PDF lưu trên hai Windows Server EC2 instance tự quản lý được đồng bộ qua DFS Replication (DFS-R), vốn thường xuyên gặp xung đột sao chép và chi phí vận hành cao. Công ty yêu cầu giao thức SMB 3.0 nguyên bản, Windows NTFS ACLs, tích hợp Active Directory, Windows Shadow Copies để người dùng tự khôi phục tệp, tính sẵn sàng cao Multi-AZ và giảm chi phí lưu trữ thông qua chống trùng lặp dữ liệu (data deduplication). Dịch vụ được quản lý nào nên thay thế các máy chủ tệp EC2 tự quản lý?

**Đáp án đúng:** **A**

Khi hiện đại hóa máy chủ tệp Windows (SMB + NTFS ACLs + AD + Shadow Copies + Data Deduplication + Multi-AZ HA), **Amazon FSx for Windows File Server** là dịch vụ thay thế trực tiếp loại bỏ hoàn toàn gánh nặng quản trị EC2 và DFS-R.

- **A (Đúng):** Chính xác. Amazon FSx for Windows File Server là dịch vụ quản lý hoàn toàn chạy trên Windows Server bản địa, hỗ trợ đầy đủ SMB 3.0, NTFS ACLs, tích hợp Active Directory, Volume Shadow Copies (người dùng tự khôi phục file), Multi-AZ HA (tự động đồng bộ không còn lỗi DFS-R) và Data Deduplication giúp tiết kiệm 50-60% dung lượng lưu trữ tài liệu.
- **B:** Amazon WorkDocs không phải là SMB file server tương thích NTFS ACLs để thay thế trực tiếp hạ tầng document management system.
- **C:** Amazon EFS chỉ hỗ trợ NFS cho Linux, không hỗ trợ SMB, NTFS ACLs hay Windows Shadow Copies.
- **D:** S3 File Gateway không cung cấp đầy đủ các tính năng quản trị Windows bản địa như Volume Shadow Copies hay Data Deduplication ở mức file system và không phải Multi-AZ native Windows File Server.

</details>

### Câu 6 `medium`

A tax preparation SaaS platform runs on Amazon Aurora PostgreSQL. Database traffic is minimal for 10 months of the year but spikes by 40x within seconds during tax filing deadlines. Additionally, the QA team needs to refresh a 12 TB staging database from production every night for integration testing without impacting production I/O or paying for an additional 12 TB of duplicated storage. Which combination of Aurora features solves both requirements most cost-effectively?

- **A.** Switch to Amazon RDS for PostgreSQL Multi-AZ DB Cluster and run pg_dump over SSH nightly to hydrate the 12 TB staging environment.
- **B.** Migrate the cluster to Amazon Aurora Serverless v2 with min/max ACUs for instant scaling, and use Aurora Fast Cloning for daily staging.
- **C.** Overprovision db.r6g.16xlarge instances year-round and take daily automated Aurora Snapshots to restore the 12 TB staging cluster.
- **D.** Use Aurora Auto Scaling with Provisioned Read Replicas and export production tables to Amazon S3 nightly via AWS DMS Full Load replication tasks.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng SaaS hỗ trợ khai thuế chạy trên Amazon Aurora PostgreSQL. Lưu lượng cơ sở dữ liệu rất thấp trong 10 tháng của năm nhưng tăng vọt gấp 40 lần trong vài giây vào hạn chót nộp thuế. Ngoài ra, nhóm QA cần làm mới cơ sở dữ liệu staging dung lượng 12 TB từ môi trường production mỗi đêm cho kiểm thử tích hợp mà không ảnh hưởng đến I/O của production hoặc phải trả tiền cho thêm 12 TB dung lượng lưu trữ trùng lặp. Sự kết hợp các tính năng Aurora nào giải quyết cả hai yêu cầu một cách tối ưu chi phí nhất?

**Đáp án đúng:** **B**

**Aurora Serverless v2** tối ưu chi phí cho workload có đỉnh tải đột ngột (spiky) nhờ cơ chế scale tính bằng giây theo từng 0.5 ACU, còn **Aurora Fast Cloning** (copy-on-write) là lựa chọn số một để nhân bản database nhiều TB cho QA/Staging gần như tức thì và không tốn gấp đôi dung lượng lưu trữ.

- **A:** RDS for PostgreSQL không có Serverless v2 auto-scaling tức thì và pg_dump 12 TB sẽ gây nghẽn nặng I/O trên production.
- **B (Đúng):** Chính xác. Aurora Serverless v2 tự động co giãn siêu nhanh (trong vòng vài trăm mili-giây theo mức 0.5 ACU) đáp ứng đột biến tải 40x mà chỉ trả tiền khi dùng. Aurora Fast Cloning sử dụng giao thức copy-on-write cho phép tạo bản sao database 12 TB trong vài phút mà không tốn thêm chi phí dung lượng cho dữ liệu trùng lặp và không ảnh hưởng I/O production.
- **C:** Cấp phát thừa công suất suốt 10 tháng cực kỳ lãng phí chi phí, và khôi phục từ Snapshot cho 12 TB vừa mất nhiều thời gian vừa phải trả tiền lưu trữ thêm 12 TB đầy đủ.
- **D:** Aurora Auto Scaling chỉ thêm Read Replicas (không tự scale-up Writer instance cho lưu lượng ghi đột biến trong vài giây), và DMS export/import 12 TB mỗi đêm rất chậm và tốn tài nguyên production.

</details>

### Câu 7 `medium`

A scientific research organization stores 2 PB of satellite imagery (average object size 50 MB) in Amazon S3 Standard. Access patterns are highly unpredictable: some images are queried heavily for a few weeks, then untouched for 8 months, and suddenly re-analyzed a year later. The organization wants to automatically minimize storage costs without incurring retrieval fees when rarely accessed objects are read back, and can tolerate asynchronous retrieval times only for objects untouched for more than 180 days. Which S3 storage strategy is MOST cost-effective?

- **A.** Create an S3 Lifecycle rule to transition all objects directly to S3 Glacier Deep Archive after 30 days.
- **B.** Transition all objects to S3 Intelligent-Tiering and opt in to the optional Archive Access tier (at 180 days) and Deep Archive Access tier.
- **C.** Keep all 2 PB in S3 Standard and enable S3 Storage Lens to manually move objects every week.
- **D.** Create an S3 Lifecycle rule to transition all satellite imagery objects to S3 Standard-IA after 30 days and S3 Glacier Instant Retrieval after 90 days.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức nghiên cứu khoa học lưu trữ 2 PB ảnh vệ tinh (kích thước object trung bình 50 MB) trong Amazon S3 Standard. Mẫu hình truy cập rất khó đoán: một số ảnh được truy vấn nhiều trong vài tuần, sau đó không đụng tới trong 8 tháng, rồi bỗng nhiên được phân tích lại một năm sau đó. Tổ chức muốn tự động giảm thiểu chi phí lưu trữ mà không phát sinh phí truy xuất khi các object ít truy cập được đọc lại, và chỉ có thể chấp nhận thời gian truy xuất bất đồng bộ đối với các object không được đụng tới quá 180 ngày. Chiến lược lưu trữ S3 nào tối ưu chi phí NHẤT?

**Đáp án đúng:** **B**

Với dữ liệu lớn có **mẫu truy cập không đoán trước (unpredictable access patterns)** và cần tránh **retrieval fees**, **S3 Intelligent-Tiering** (kết hợp bật tầng **Archive Access / Deep Archive Access** nếu chấp nhận asynchronous retrieval sau 90-180 ngày) là giải pháp tối ưu chi phí hàng đầu.

- **A:** Chuyển sang Glacier Deep Archive sau 30 ngày vi phạm yêu cầu chỉ chấp nhận truy xuất bất đồng bộ sau 180 ngày, đồng thời phát sinh phí xóa sớm (180-day minimum storage duration) và phí restore cao.
- **B (Đúng):** Chính xác. S3 Intelligent-Tiering tự động chuyển object giữa Frequent, Infrequent và Archive Instant Access mà KHÔNG mất phí truy xuất (no retrieval fees) khi đột ngột bị đọc lại. Việc bật thêm tầng Archive Access ở mốc 180 ngày giúp tiết kiệm sâu hơn nữa cho dữ liệu không chạm tới quá 6 tháng (đúng yêu cầu chấp nhận truy xuất bất đồng bộ sau 180 ngày).
- **C:** Giữ toàn bộ 2 PB ở S3 Standard tốn chi phí cao nhất, và S3 Storage Lens chỉ là công cụ phân tích quan sát chứ không tự động chuyển tầng lưu trữ.
- **D:** S3 Standard-IA và Glacier Instant Retrieval đều tính phí truy xuất (per-GB retrieval fees) khi đọc dữ liệu; với mẫu truy cập không dự đoán được (đột ngột đọc lại), phí truy xuất sẽ đội chi phí lên cao.

</details>

### Câu 8 `hard`

An AI research company runs two ultra-performance workloads in us-east-1: (1) a distributed PyTorch GPU training job on Amazon EC2 that repeatedly reads millions of small training objects from object storage and requires single-digit millisecond latency with hundreds of thousands of requests per second; and (2) a clustered commercial database running on EC2 Nitro instances in a single Availability Zone that requires 200,000 IOPS and 3,500 MB/s throughput on a shared block volume attached simultaneously to multiple EC2 nodes. Which TWO AWS storage options should the architect select? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Provision an Amazon EBS gp3 volume with Multi-Attach enabled to deliver 200,000 IOPS.
- **B.** Use Amazon S3 Standard-IA for the PyTorch GPU training dataset to achieve single-digit millisecond latency.
- **C.** Use Amazon S3 Express One Zone (directory buckets) in the same Availability Zone as the GPU training cluster for single-digit millisecond object access and high request rates.
- **D.** Use Amazon EFS One Zone with Max I/O mode as the shared block volume for the clustered database.
- **E.** Provision an Amazon EBS io2 Block Express volume with Multi-Attach enabled for the clustered database on Nitro EC2 instances.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty nghiên cứu AI chạy hai workload hiệu năng cực cao tại us-east-1: (1) một tác vụ huấn luyện GPU PyTorch phân tán trên Amazon EC2 liên tục đọc hàng triệu object huấn luyện nhỏ từ kho lưu trữ đối tượng và yêu cầu độ trễ mức một chữ số mili-giây với hàng trăm nghìn yêu cầu mỗi giây; và (2) một cơ sở dữ liệu thương mại dạng cụm chạy trên các EC2 Nitro instance trong một Availability Zone duy nhất, yêu cầu 200.000 IOPS và thông lượng 3.500 MB/s trên một block volume dùng chung gắn đồng thời vào nhiều EC2 node. Kiến trúc sư nên chọn HAI tùy chọn lưu trữ AWS nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Ghi nhớ hai lựa chọn lưu trữ hiệu năng cực đại trong 1 AZ: **Amazon S3 Express One Zone** cho object storage độ trễ single-digit ms (AI/ML training, analytics nóng), và **EBS io2 Block Express + Multi-Attach** cho block storage siêu IOPS (tới 256,000 IOPS, 4,000 MB/s) gắn đồng thời nhiều Nitro EC2.

- **A:** EBS gp3 chỉ đạt tối đa 16,000 IOPS / 1,000 MB/s và KHÔNG hỗ trợ tính năng Multi-Attach.
- **B:** S3 Standard-IA dành cho dữ liệu ít truy cập, không đạt độ trễ một chữ số mili-giây như S3 Express One Zone và còn bị tính phí retrieval mỗi lần đọc lặp lại.
- **C (Đúng):** Chính xác. Amazon S3 Express One Zone (dùng directory buckets đồng vị trí trong cùng 1 AZ với cụm GPU EC2) cung cấp độ trễ truy xuất object một chữ số mili-giây (nhanh hơn tới 10 lần S3 Standard) và hỗ trợ hàng trăm nghìn request/giây, tối ưu cho huấn luyện AI/ML.
- **D:** Amazon EFS là file storage (NFS), không phải shared block volume cho clustered database đòi hỏi 200,000 IOPS với độ trễ cực thấp.
- **E (Đúng):** Chính xác. EBS io2 Block Express hỗ trợ tối đa 256,000 IOPS và 4,000 MB/s throughput trên một volume duy nhất (đáp ứng dư yêu cầu 200,000 IOPS & 3,500 MB/s) và hỗ trợ EBS Multi-Attach cho phép gắn đồng thời một block volume vào tối đa 16 Nitro EC2 instances trong cùng một AZ cho clustered database.

</details>

### Câu 9 `medium`

A consulting firm operates 40 AWS accounts in AWS Organizations under Consolidated Billing. One dedicated client account ('Client-Gov') purchased a 3-year EC2 Instance Savings Plan funded directly by that client's contract. Finance discovers that unused hourly portions of Client-Gov's Savings Plan are automatically floating to other internal consulting accounts in the Organization, violating the client's contractual accounting rules. How can the firm prevent Client-Gov's Savings Plan and Reserved Instance discounts from being shared with any other account while keeping Client-Gov inside AWS Organizations?

- **A.** Create an AWS Cost Allocation Tag named Client=Gov on all EC2 instances in Client-Gov to isolate Savings Plans discount sharing automatically.
- **B.** Remove the Client-Gov member account from AWS Organizations so it becomes a standalone account with isolated billing and Savings Plans.
- **C.** Attach a Service Control Policy (SCP) to the Client-Gov account denying savingsplans:DescribeSavingsPlans and ec2:DescribeReservedInstances.
- **D.** In the Organizations management account's Billing console, turn off RI and Savings Plans discount sharing specifically for Client-Gov.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty tư vấn vận hành 40 AWS account trong AWS Organizations theo Consolidated Billing. Một tài khoản khách hàng chuyên dụng ('Client-Gov') đã mua gói EC2 Instance Savings Plan 3 năm được tài trợ trực tiếp bởi hợp đồng của khách hàng đó. Bộ phận tài chính phát hiện phần giờ chưa sử dụng của Savings Plan thuộc Client-Gov đang tự động chia sẻ sang các tài khoản tư vấn nội bộ khác trong Organization, vi phạm quy tắc kế toán hợp đồng của khách hàng. Công ty có thể ngăn việc chia sẻ chiết khấu Savings Plan và Reserved Instance của Client-Gov với bất kỳ tài khoản nào khác trong khi vẫn giữ Client-Gov bên trong AWS Organizations bằng cách nào?

**Đáp án đúng:** **D**

Mặc định trong **AWS Organizations Consolidated Billing**, chiết khấu **RI và Savings Plans** được tự động chia sẻ giữa mọi tài khoản. Để cô lập chiết khấu cho một tài khoản khách hàng riêng biệt mà không phải tách khỏi Organization, hãy **tắt RI/SP discount sharing** cho tài khoản đó trong Billing Console của **management account**.

- **A:** Cost Allocation Tags chỉ dùng để gắn nhãn báo cáo chi phí trong Cost Explorer/CUR, không thay đổi cơ chế tự động chia sẻ chiết khấu RI/Savings Plans giữa các tài khoản.
- **B:** Gỡ tài khoản khỏi AWS Organizations vi phạm yêu cầu giữ Client-Gov nằm trong Organizations (mất kiểm soát SCP, Control Tower và Consolidated Billing).
- **C:** SCP chặn API DescribeSavingsPlans chỉ chặn người dùng xem thông tin trên console/CLI, không hề ngăn hệ thống tính cước Consolidated Billing tự động chia sẻ chiết khấu Savings Plans.
- **D (Đúng):** Chính xác. Trong Billing Preferences của management account, AWS cho phép tắt tính năng RI and Savings Plans discount sharing cho từng tài khoản thành viên cụ thể (Client-Gov). Khi tắt, mọi RI/Savings Plans do Client-Gov mua chỉ áp dụng cho chính Client-Gov và không chia sẻ sang các tài khoản khác (và ngược lại), trong khi vẫn giữ Client-Gov trong AWS Organizations.

</details>

### Câu 10 `medium`

An IoT telematics platform stores 80 TB of historical vehicle trip logs in an Amazon DynamoDB Standard table. Trip logs are written heavily during the first 24 hours, rarely read after 30 days, and must be automatically purged after 365 days for privacy compliance. Storage costs currently account for 85% of the DynamoDB bill, and running a nightly batch script to delete expired items via DeleteItem consumes massive Write Capacity Units (WCUs). Which TWO DynamoDB optimizations should the architect implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Switch the archival/historical table to the Amazon DynamoDB Standard-Infrequent Access (Standard-IA) table class to reduce storage costs by up to 60%.
- **B.** Turn off DynamoDB Auto Scaling and manually provision 100,000 WCUs to speed up the nightly DeleteItem batch script and reduce storage charges.
- **C.** Enable Amazon DynamoDB Accelerator (DAX) in front of the Standard table to reduce the 80 TB storage costs by up to 60%.
- **D.** Enable DynamoDB TTL on an epoch timestamp attribute so DynamoDB automatically expires items older than 365 days without consuming WCUs.
- **E.** Create 10 Global Secondary Indexes (GSIs) with ALL attribute projection to automatically compress the 80 TB storage size.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng viễn thông IoT lưu trữ 80 TB nhật ký hành trình phương tiện lịch sử trong một bảng Amazon DynamoDB Standard. Nhật ký hành trình được ghi rất nhiều trong 24 giờ đầu, hiếm khi được đọc sau 30 ngày và phải được tự động xóa sạch sau 365 ngày để tuân thủ quyền riêng tư. Chi phí lưu trữ hiện chiếm 85% hóa đơn DynamoDB, và việc chạy tập lệnh theo lô hàng đêm để xóa các mục hết hạn qua DeleteItem tiêu tốn lượng lớn Write Capacity Units (WCUs). Kiến trúc sư nên triển khai HAI tối ưu hóa DynamoDB nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, D**

Hai công cụ tối ưu chi phí hàng đầu cho bảng **Amazon DynamoDB** dung lượng lớn: (1) **Standard-IA Table Class** (giảm tới 60% phí storage khi lưu trữ là chi phí chính) và (2) **DynamoDB TTL** (xóa dữ liệu hết hạn tự động **0 WCU**).

- **A (Đúng):** Chính xác. Khi chi phí lưu trữ (storage) chiếm tỷ trọng chủ đạo (85% hóa đơn DynamoDB) và dữ liệu ít được đọc/ghi về sau, chuyển sang tầng bảng DynamoDB Standard-IA giúp giảm tới 60% chi phí lưu trữ.
- **B:** Cấp phát cứng 100.000 WCU cho script DeleteItem cực kỳ lãng phí so với việc dùng TTL miễn phí WCU.
- **C:** DAX là cụm bộ nhớ đệm in-memory tốn thêm chi phí node theo giờ để tăng tốc độ đọc, hoàn toàn không giảm chi phí lưu trữ đĩa 80 TB của bảng DynamoDB.
- **D (Đúng):** Chính xác. DynamoDB TTL tự động xóa các bản ghi hết hạn (365 ngày) trong nền hoàn toàn MIỄN PHÍ (không tiêu tốn bất kỳ WCU nào), thay thế hoàn toàn batch script DeleteItem tốn kém.
- **E:** Tạo thêm GSI với ALL projection sẽ nhân bản toàn bộ dữ liệu bảng lên nhiều lần, làm chi phí lưu trữ và WCU tăng vọt thay vì giảm.

</details>

### Câu 11 `medium`

A retail company needs a disaster recovery plan for a three-tier web application hosted in us-east-1 using ALB, EC2 Auto Scaling, and Amazon RDS for MySQL. Management requires an RPO of less than 5 minutes and an RTO of 15 minutes while keeping ongoing DR infrastructure costs as low as possible. Which DR strategy best meets these requirements?

- **A.** Pilot Light: Run a continuous RDS Cross-Region Read Replica in us-west-2, keep golden AMIs and Launch Templates ready with Auto Scaling desired capacity set to 0, and scale out during failover.
- **B.** Warm Standby: Run 50% of production EC2 capacity in us-west-2 at all times behind an Application Load Balancer alongside a continuously replicated RDS Cross-Region Read Replica for rapid failover.
- **C.** Backup and Restore: Copy automated Amazon RDS snapshots and EC2 AMIs to us-west-2 daily, and deploy the entire three-tier infrastructure via AWS CloudFormation during a disaster.
- **D.** Multi-Site Active-Active: Run full production EC2 Auto Scaling capacity behind ALBs and multi-master databases in both us-east-1 and us-west-2 continuously at 100% scale.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty bán lẻ cần kế hoạch khôi phục thảm họa cho ứng dụng web ba tầng được lưu trữ tại us-east-1 sử dụng ALB, EC2 Auto Scaling và Amazon RDS for MySQL. Ban quản lý yêu cầu RPO dưới 5 phút và RTO 15 phút trong khi giữ chi phí hạ tầng DR thường xuyên ở mức thấp nhất có thể. Chiến lược DR nào đáp ứng tốt nhất các yêu cầu này?

**Đáp án đúng:** **A**

Khi đề bài yêu cầu **RPO vài phút, RTO 10–30 phút** và **tối ưu chi phí nhất**, hãy chọn **Pilot Light** (dữ liệu đồng bộ liên tục, compute tắt hoặc scale = 0 cho đến khi có sự cố).

- **A (Đúng):** Chính xác. Pilot Light duy trì liên tục tầng dữ liệu (RDS Cross-Region Read Replica đạt RPO vài giây/phút) nhưng giữ tầng compute ở mức 0 instance (tiết kiệm tối đa chi phí EC2), khi failover chỉ cần promote DB và khởi chạy EC2 từ AMI trong vòng 10-15 phút.
- **B:** Warm Standby đắt hơn Pilot Light vì phải trả tiền chạy EC2 liên tục ở DR Region, trong khi RTO 15 phút hoàn toàn có thể đạt được bằng Pilot Light với chi phí thấp hơn nhiều.
- **C:** Backup & Restore theo ngày có RPO tới 24 giờ và RTO hàng giờ, không đạt mục tiêu RPO < 5 phút và RTO 15 phút.
- **D:** Active-Active có chi phí vận hành cao nhất (gấp đôi hạ tầng), vượt xa nhu cầu RTO 15 phút và vi phạm yêu cầu chi phí thấp nhất.

</details>

---

[Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md)
