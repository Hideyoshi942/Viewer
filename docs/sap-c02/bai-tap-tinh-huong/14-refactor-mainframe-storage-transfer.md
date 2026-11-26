# Bài tập tình huống — Chủ đề 14: Refactor Spaces, Mainframe Modernization, Storage Gateway, DataSync & Transfer Family

> Migration Hub Refactor Spaces, AWS Mainframe Modernization, Storage Gateway, DataSync, Snow Family và AWS Transfer Family.
> **Số câu hỏi:** 6 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A media archive company needs to migrate 140 TB of video files from an on-premises NFS storage array to Amazon S3 within 3 weeks. The company has a 100 Mbps internet connection that is 60% utilized during business hours, leaving only 40 Mbps available for migration. During the migration period, approximately 500 GB of new or modified files are written daily to the NFS array, and all files must be fully synchronized in S3 with POSIX metadata preserved before cutover. What is the MOST practical migration strategy?

- **A.** Deploy an AWS DataSync agent on-premises and transfer all 140 TB over the 100 Mbps internet link using bandwidth throttling and POSIX metadata preservation.
- **B.** Deploy an AWS Storage Gateway S3 File Gateway on-premises and copy all 140 TB of video files into the gateway's local cache volume.
- **C.** Order an AWS Snowmobile exabyte-scale shipping container truck to transport the 140 TB video archive dataset to the nearest AWS Region.
- **D.** Order two AWS Snowball Edge Storage Optimized devices for the 140 TB bulk transfer to S3, and use an AWS DataSync agent for the daily 500 GB deltas with POSIX metadata.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ truyền thông cần di chuyển 140 TB tệp video từ hệ thống lưu trữ NFS on-premises lên Amazon S3 trong vòng 3 tuần. Công ty có đường truyền internet 100 Mbps hiện đã được sử dụng 60% trong giờ hành chính, chỉ còn 40 Mbps khả dụng cho việc di chuyển. Trong thời gian di chuyển, khoảng 500 GB tệp mới hoặc sửa đổi được ghi hàng ngày vào hệ thống NFS, và tất cả tệp phải được đồng bộ hóa đầy đủ trên S3 với siêu dữ liệu POSIX được bảo toàn trước khi cutover. Chiến lược di chuyển thực tế NHẤT là gì?

**Đáp án đúng:** **D**

Hãy luôn tính nhanh thời gian truyền mạng (40 Mbps ≈ 0.43 TB/ngày → 140 TB mất > 320 ngày). Khi đường truyền hẹp và có dữ liệu thay đổi liên tục, giải pháp chuẩn là **AWS Snowball Edge Storage Optimized** (bulk offline) kết hợp **AWS DataSync** (đồng bộ delta cuối cùng và giữ metadata).

- **A:** Với băng thông khả dụng chỉ 40 Mbps (~5 MB/s, ~430 GB/ngày), truyền 140 TB qua mạng sẽ mất hơn 325 ngày — hoàn toàn vượt quá hạn chót 3 tuần.
- **B:** S3 File Gateway vẫn phải đẩy toàn bộ 140 TB qua đường truyền 40 Mbps lên S3, không thể hoàn thành trong 3 tuần.
- **C:** Snowmobile chỉ phù hợp cho quy mô exabyte/hàng chục petabyte (từ 10 PB trở lên) và đã ngừng cung cấp cho các đơn hàng mới; với 140 TB chỉ cần 2 thiết bị Snowball Edge.
- **D (Đúng):** Chính xác. Kết hợp Offline + Online là mẫu kiến trúc kinh điển của SAP-C02: dùng 2 thiết bị Snowball Edge Storage Optimized (mỗi thiết bị ~80 TB usable) để chuyển 140 TB dữ liệu nền trong vòng 1-2 tuần, sau đó dùng AWS DataSync (có hỗ trợ lưu giữ POSIX metadata và kiểm tra toàn vẹn) để đồng bộ phần delta thay đổi trước thời điểm cutover.

</details>

### Câu 2 `hard`

A national bank runs its core banking ledger on an aging IBM z/OS mainframe using COBOL programs, CICS transactions, and a DB2 database. The bank wants to exit the mainframe within 18 months and modernize the workload into cloud-native, maintainable Java microservices running on AWS with an Amazon Aurora PostgreSQL database, eliminating COBOL skill dependencies and mainframe MIPS licensing costs. Which AWS service and migration pattern should the Solutions Architect recommend?

- **A.** Use AWS App2Container to package and containerize all IBM z/OS CICS mainframe transactions directly into Amazon EKS Kubernetes pods.
- **B.** Use AWS Application Migration Service (AWS MGN) to perform a continuous block-level lift-and-shift of the IBM z/OS mainframe directly onto Amazon EC2 x86 bare metal instances.
- **C.** Use AWS Mainframe Modernization with Replatforming (Micro Focus) to keep the COBOL codebase unchanged and compile it directly on Amazon EC2 Linux instances.
- **D.** Use AWS Mainframe Modernization with Automated Refactoring (AWS Blu Age) to transform COBOL/CICS into Java/Spring Boot services and migrate DB2 to Aurora PostgreSQL.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ngân hàng quốc gia vận hành sổ cái ngân hàng lõi trên máy chủ lớn IBM z/OS cũ kỹ sử dụng các chương trình COBOL, giao dịch CICS và cơ sở dữ liệu DB2. Ngân hàng muốn thoát khỏi mainframe trong vòng 18 tháng và hiện đại hóa workload thành các microservice Java dễ bảo trì, chuẩn cloud-native chạy trên AWS với cơ sở dữ liệu Amazon Aurora PostgreSQL, loại bỏ sự phụ thuộc vào kỹ năng COBOL và chi phí bản quyền MIPS của mainframe. Solutions Architect nên đề xuất dịch vụ AWS và mẫu hình di chuyển nào?

**Đáp án đúng:** **D**

Với bài toán thoát khỏi **Mainframe (IBM z/OS, COBOL, CICS, DB2)** trên SAP-C02: chọn **AWS Mainframe Modernization — Automated Refactoring (AWS Blu Age)** khi khách hàng muốn chuyển sang **Java cloud-native** và bỏ COBOL; chọn **Replatforming (Micro Focus)** khi muốn giữ nguyên mã COBOL để di chuyển nhanh.

- **A:** AWS App2Container chỉ hỗ trợ container hóa ứng dụng Java và .NET đang chạy trên Linux/Windows, không hỗ trợ mainframe z/OS COBOL/CICS.
- **B:** AWS MGN chỉ hỗ trợ máy chủ x86 (Linux/Windows), hoàn toàn không thể lift-and-shift hệ điều hành IBM z/OS mainframe.
- **C:** Replatforming (Micro Focus) giữ nguyên mã nguồn COBOL, không đáp ứng yêu cầu chuyển sang Java microservices và loại bỏ sự phụ thuộc vào kỹ năng COBOL.
- **D (Đúng):** Chính xác. AWS Mainframe Modernization hỗ trợ 2 hướng chính: Replatform (Micro Focus — giữ nguyên mã COBOL) và **Automated Refactoring (AWS Blu Age)** — tự động chuyển đổi mã nguồn COBOL/CICS/JCL sang Java/Spring Boot hiện đại (loại bỏ hoàn toàn phụ thuộc kỹ năng COBOL) và chuyển DB2 sang Amazon Aurora PostgreSQL.

</details>

### Câu 3 `hard`

A retail bank runs a mission-critical core ledger on an IBM z/OS mainframe written in COBOL with CICS transactions and VSAM datasets. The bank is losing retiring COBOL developers and wants to exit the mainframe within 18 months by automatically transforming the legacy COBOL codebase into modern, maintainable cloud-native Java services running on managed AWS compute, while preserving functional equivalence. Which AWS service and migration pattern should the architect select?

- **A.** Use AWS Mainframe Modernization with the Replatforming pattern (Micro Focus) to continue maintaining and compiling the application in COBOL.
- **B.** Use AWS Schema Conversion Tool (SCT) and AWS DMS to convert COBOL business logic into PostgreSQL stored procedures.
- **C.** Use AWS Application Migration Service (MGN) to lift-and-shift the IBM z/OS LPAR directly onto Amazon EC2 Bare Metal instances without code changes.
- **D.** Use AWS Mainframe Modernization with Automated Refactoring (AWS Blu Age) to transform COBOL/CICS/VSAM into Java services and relational databases.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ngân hàng bán lẻ vận hành sổ cái lõi quan trọng trên máy chủ lớn IBM z/OS viết bằng COBOL với các giao dịch CICS và tập dữ liệu VSAM. Ngân hàng đang mất dần các lập trình viên COBOL nghỉ hưu và muốn thoát khỏi mainframe trong vòng 18 tháng bằng cách tự động chuyển đổi mã nguồn COBOL kế thừa thành các dịch vụ Java cloud-native hiện đại, dễ bảo trì chạy trên hạ tầng compute được quản lý của AWS, đồng thời bảo toàn tính tương đương về chức năng. Kiến trúc sư nên chọn dịch vụ AWS và mẫu hình di chuyển nào?

**Đáp án đúng:** **D**

Trong **AWS Mainframe Modernization**, hãy phân biệt rõ: chọn **Automated Refactoring (AWS Blu Age)** khi muốn chuyển đổi mã COBOL/PL1 sang **Java hiện đại** để thoát phụ thuộc nhân sự COBOL; chọn **Replatforming (Micro Focus)** khi muốn giữ nguyên mã COBOL để rút ngắn thời gian di chuyển nhanh nhất.

- **A:** Replatforming (Micro Focus) giữ nguyên mã COBOL, không giải quyết được bài toán cốt lõi của ngân hàng là thiếu hụt lập trình viên COBOL sắp nghỉ hưu và muốn chuyển sang Java hiện đại.
- **B:** AWS SCT và DMS dùng để chuyển đổi schema và dữ liệu cơ sở dữ liệu, không thể biên dịch hay tái cấu trúc mã nguồn ứng dụng COBOL/CICS.
- **C:** AWS MGN chỉ hỗ trợ hệ điều hành x86 Linux/Windows, không thể lift-and-shift kiến trúc phần cứng/HĐH IBM z/OS mainframe sang EC2.
- **D (Đúng):** Chính xác. AWS Mainframe Modernization hỗ trợ hai hướng chính: Replatforming (Micro Focus - giữ nguyên mã COBOL) và Automated Refactoring (AWS Blu Age - tự động chuyển đổi mã nguồn COBOL/CICS/VSAM sang ứng dụng Java hiện đại chạy trên managed runtime, giải quyết triệt để bài toán thiếu hụt nhân sự COBOL).

</details>

### Câu 4 `medium`

An offshore oil exploration company collects 12 TB of seismic sensor data per week on remote vessels with only a 5 Mbps satellite internet link. The team needs a ruggedized, portable edge device to ingest data locally via NFS, run lightweight edge preprocessing (EC2/Docker containers) to filter corrupted sensor frames while at sea, and then securely transfer the filtered datasets into Amazon S3 either over a high-speed dockside link or by physically shipping the device to AWS. Which TWO AWS services or devices best fit this edge-to-cloud workflow? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Use the pre-installed DataSync agent on the Snow device for online S3 transfers at port, or ship the encrypted device back for offline import.
- **B.** Use AWS Snowcone (or AWS Snowball Edge Compute Optimized for larger capacity) to provide ruggedized local NFS storage and local EC2 compute for edge preprocessing at sea.
- **C.** Provision an AWS Direct Connect Hosted Connection directly onto the moving vessel.
- **D.** Stream all 12 TB per week of raw seismic sensor data directly over the 5 Mbps satellite link using Amazon Kinesis Data Streams.
- **E.** Deploy an AWS Outposts 42U rack on each exploration vessel to store, preprocess, and replicate the 12 TB weekly seismic datasets.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty thăm dò dầu khí ngoài khơi thu thập 12 TB dữ liệu cảm biến địa chấn mỗi tuần trên các tàu ở vùng biển xa chỉ có đường truyền internet vệ tinh 5 Mbps. Nhóm cần một thiết bị biên di động, chịu va đập để tiếp nhận dữ liệu cục bộ qua NFS, chạy tiền xử lý nhẹ tại biên (EC2/Docker container) để lọc bỏ các khung dữ liệu cảm biến bị hỏng khi đang ở trên biển, sau đó chuyển an toàn các tập dữ liệu đã lọc vào Amazon S3 qua đường truyền tốc độ cao tại bến cảng hoặc bằng cách vận chuyển vật lý thiết bị về AWS. HAI dịch vụ hoặc thiết bị AWS nào phù hợp nhất với quy trình từ biên lên đám mây này? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, B**

Với bài toán **edge computing môi trường khắc nghiệt + mạng bị ngắt quãng/băng thông cực thấp (disconnected edge)**, dòng thiết bị **AWS Snow Family (Snowcone / Snowball Edge)** kết hợp **DataSync agent tích hợp sẵn** (hoặc gửi vật lý về AWS) là giải pháp duy nhất đáp ứng trọn vẹn.

- **A (Đúng):** Chính xác. Thiết bị Snow tích hợp sẵn AWS DataSync agent cho phép đồng bộ trực tuyến lên S3 khi tàu cập cảng có băng thông lớn, hoặc đóng gói gửi vật lý về trung tâm dữ liệu AWS để nạp dữ liệu ngoại tuyến (mã hóa bằng KMS).
- **B (Đúng):** Chính xác. AWS Snowcone (8-14 TB, siêu nhỏ gọn, chống chịu môi trường khắc nghiệt) hoặc Snowball Edge Compute Optimized cung cấp cả lưu trữ cục bộ (NFS) lẫn năng lực tính toán EC2 tại biên (edge compute) để lọc dữ liệu cảm biến ngay trên tàu ngoài khơi.
- **C:** AWS Direct Connect là đường truyền cáp quang vật lý cố định tại các điểm POP/colocation trên đất liền, không thể kéo ra tàu đang di chuyển trên biển.
- **D:** Đường truyền 5 Mbps tối đa chỉ tải được khoảng ~3 TB/tuần nếu chạy 100% công suất không nghỉ, hoàn toàn không thể truyền hết 12 TB/tuần.
- **E:** AWS Outposts Rack yêu cầu nguồn điện ổn định cấp data center và kết nối mạng liên tục có băng thông/độ trễ thấp về AWS Region; không phù hợp cho tàu biển ngoài khơi chỉ có mạng vệ tinh 5 Mbps chập chờn.

</details>

### Câu 5 `hard`

A genomics research institute needs to migrate 120 TB of NFS file data from an on-premises storage array to Amazon EFS within 10 days. The institute has a dedicated 100 Mbps internet connection that is already 50% utilized during business hours. New research files totaling 50 GB are generated daily on-premises until the final cutover. Which migration approach meets the 10-day deadline while preserving POSIX permissions?

- **A.** Deploy an AWS Storage Gateway File Gateway on-premises to mount Amazon EFS locally and synchronize all 120 TB of NFS files using multi-threaded rsync.
- **B.** Order AWS Snowball Edge Storage Optimized devices for the 120 TB bulk transfer to S3, move data to EFS via DataSync, and run incremental DataSync tasks for the daily 50 GB delta.
- **C.** Enable Amazon S3 Transfer Acceleration on a staging bucket and execute parallel aws s3 sync commands from the on-premises NFS storage server.
- **D.** Deploy an AWS DataSync agent on-premises, configure NFS source locations with POSIX preservation, and transfer the entire 120 TB dataset over the existing 100 Mbps internet connection.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một viện nghiên cứu gen học cần di chuyển 120 TB dữ liệu tệp NFS từ hệ thống lưu trữ on-premises lên Amazon EFS trong vòng 10 ngày. Viện có đường truyền internet chuyên dụng 100 Mbps hiện đã được sử dụng 50% trong giờ hành chính. Các tệp nghiên cứu mới với tổng dung lượng 50 GB được tạo ra hàng ngày tại chỗ cho đến lần chuyển đổi cuối cùng. Phương pháp di chuyển nào đáp ứng thời hạn 10 ngày trong khi vẫn bảo toàn quyền POSIX?

**Đáp án đúng:** **B**

Trong các bài toán di chuyển dữ liệu lớn (> 50 TB) với băng thông hạn chế nhưng dữ liệu vẫn tiếp tục thay đổi hàng ngày, giải pháp chuẩn là **Hybrid Transfer**: **AWS Snowball Edge** cho bulk transfer ban đầu + **AWS DataSync** cho incremental delta trước cutover (giữ nguyên POSIX/NTFS metadata).

- **A:** Storage Gateway File Gateway kết nối tới Amazon S3 (hoặc FSx) chứ không dùng để đẩy 120 TB qua đường truyền 50 Mbps trong 10 ngày được.
- **B (Đúng):** Chính xác. Dùng Snowball Edge để vận chuyển khối lượng lớn 120 TB offline trong vài ngày, sau đó dùng AWS DataSync (bảo toàn POSIX permissions) để đồng bộ phần dữ liệu mới phát sinh 50 GB/ngày qua mạng trước giờ cutover.
- **C:** S3 Transfer Acceleration không thể vượt quá giới hạn băng thông vật lý 50 Mbps tại đầu ra của viện nghiên cứu và `aws s3 sync` không giữ nguyên POSIX permissions cho EFS.
- **D:** Với băng thông khả dụng chỉ 50 Mbps (~5-6 MB/s), việc truyền 120 TB qua mạng sẽ mất hơn 200 ngày — hoàn toàn không thể kịp hạn 10 ngày.

</details>

### Câu 6 `medium`

A healthcare company is migrating an on-premises SFTP file-exchange server used by 200 external hospital partners. The partners upload daily encrypted CSV files using existing SFTP clients and SSH keys, and cannot change their client workflows. Additionally, before migrating its 80 internal application servers, the company wants to discover network dependencies and running processes across both physical and virtual servers. Which TWO AWS services should be used? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Deploy the AWS Application Discovery Service Agentless Collector OVA appliance to capture OS-level running processes across all physical and virtual servers.
- **B.** Enable Amazon S3 Static Website Hosting with pre-signed URLs to accept daily encrypted CSV uploads over SFTP from external hospital partners.
- **C.** Install the AWS Application Discovery Service (ADS) Agent on the 80 internal servers to collect network connections and process-level dependency data.
- **D.** Deploy AWS Transfer Family with an SFTP-enabled server backed by Amazon S3 to replace the on-premises SFTP server without changing partner workflows.
- **E.** Configure AWS DataSync agents to expose a managed SFTP endpoint on Amazon S3 for the 200 external hospital partners using their existing SSH keys.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty chăm sóc sức khỏe đang di chuyển máy chủ trao đổi tệp SFTP on-premises được 200 đối tác bệnh viện bên ngoài sử dụng. Các đối tác tải lên các tệp CSV được mã hóa hàng ngày bằng các SFTP client và khóa SSH hiện có, và không thể thay đổi quy trình làm việc trên client của họ. Ngoài ra, trước khi di chuyển 80 máy chủ ứng dụng nội bộ, công ty muốn khám phá các phụ thuộc mạng và tiến trình đang chạy trên cả máy chủ vật lý và máy chủ ảo. Nên sử dụng HAI dịch vụ AWS nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, D**

Hãy phân biệt rõ: **AWS Transfer Family** thay thế SFTP/FTPS/AS2 server cũ mà không làm gián đoạn đối tác; còn **AWS Application Discovery Service (ADS) Agent** là công cụ chuẩn để thu thập *running processes & network connections* trên cả máy vật lý và máy ảo phục vụ dependency mapping.

- **A:** ADS Agentless Collector chỉ chạy trên VMware vCenter cho máy ảo và KHÔNG thu thập được network connections hay OS-level processes.
- **B:** S3 Static Website Hosting chỉ phục vụ tải xuống qua HTTP, hoàn toàn không hỗ trợ giao thức SFTP hay upload bảo mật bằng SSH keys.
- **C (Đúng):** Chính xác. Để thu thập thông tin kết nối mạng (network connections) và tiến trình đang chạy (running processes) trên cả máy chủ vật lý lẫn máy ảo nhằm vẽ bản đồ phụ thuộc, bắt buộc phải dùng ADS Agent (Agentless chỉ hỗ trợ VMware và không có thông tin process/network).
- **D (Đúng):** Chính xác. AWS Transfer Family cung cấp dịch vụ SFTP/FTPS/FTP/AS2 fully managed hỗ trợ SSH keys hiện có của đối tác và lưu thẳng file vào Amazon S3 (hoặc EFS) mà đối tác không cần đổi client.
- **E:** AWS DataSync dùng cho di chuyển/đồng bộ dữ liệu nội bộ (NFS/SMB/HDFS/S3), không cung cấp public SFTP endpoint cho đối tác bên ngoài.

</details>

---

[Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md)
