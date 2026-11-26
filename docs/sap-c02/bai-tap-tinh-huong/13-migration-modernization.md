# Bài tập tình huống — Chủ đề 13: Workload Migration Strategy (7Rs) — Migration Hub, AWS MGN, DMS/SCT & Application Modernization

> Chiến lược 7Rs, AWS Migration Hub, Application Migration Service (MGN), Database Migration Service (DMS/SCT) và hiện đại hóa theo Strangler Fig.
> **Số câu hỏi:** 11 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A manufacturing enterprise must migrate 180 physical and virtual x86 servers (running a mix of RHEL Linux and Windows Server with custom ERP software) from an on-premises data center to AWS within 4 months before its colocation lease expires. The business requires a cutover window of less than 15 minutes per application wave, automated rightsizing during launch, and minimal operational effort without re-architecting the applications first. Which migration service should the Solutions Architect select?

- **A.** AWS Database Migration Service (AWS DMS) configured in Full Load plus CDC mode to replicate all 180 physical and virtual servers.
- **B.** AWS Application Migration Service (AWS MGN) using continuous block-level replication and configured Launch Templates with post-launch actions.
- **C.** AWS Server Migration Service (AWS SMS) using scheduled incremental VM snapshot imports every 12 hours to Amazon EC2.
- **D.** AWS App2Container to containerize all 180 legacy Linux and Windows ERP servers directly into Amazon EKS before the colocation lease expires next quarter.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp sản xuất phải di chuyển 180 máy chủ x86 vật lý và ảo (chạy kết hợp RHEL Linux và Windows Server với phần mềm ERP tùy chỉnh) từ trung tâm dữ liệu on-premises lên AWS trong vòng 4 tháng trước khi hết hạn hợp đồng thuê chỗ đặt máy chủ. Doanh nghiệp yêu cầu khoảng thời gian chuyển đổi (cutover window) dưới 15 phút cho mỗi đợt ứng dụng, tự động điều chỉnh kích thước khi khởi chạy và nỗ lực vận hành tối thiểu mà không cần tái kiến trúc ứng dụng trước. Solutions Architect nên chọn dịch vụ di chuyển nào?

**Đáp án đúng:** **B**

Với bài toán **Rehost (Lift-and-Shift)** hàng trăm máy chủ vật lý/ảo có hạn chót gấp và cửa sổ cutover cực ngắn (< 15 phút), **AWS Application Migration Service (AWS MGN)** là lựa chọn chính thức nhờ cơ chế sao chép block liên tục và tự động hóa chuyển đổi boot sang EC2.

- **A:** AWS DMS chỉ dùng để di chuyển cơ sở dữ liệu, không thể di chuyển toàn bộ hệ điều hành và ứng dụng trên máy chủ vật lý/ảo.
- **B (Đúng):** Chính xác. AWS Application Migration Service (MGN) là dịch vụ chuẩn cho chiến lược Rehost (Lift-and-Shift) quy mô lớn đối với cả máy chủ vật lý và ảo (Linux/Windows). MGN sao chép liên tục ở mức block (RPO tính bằng giây), cho phép diễn tập non-disruptive test trước khi cutover trong vài phút, và hỗ trợ tự động rightsizing/post-launch actions.
- **C:** AWS SMS đã ngừng phát triển (deprecated) và thay thế bởi AWS MGN; ngoài ra SMS chỉ hỗ trợ VM (không hỗ trợ máy chủ vật lý) và sao chép theo snapshot định kỳ nên cửa sổ cutover/RPO lớn.
- **D:** App2Container chỉ hỗ trợ một số ứng dụng web Java/.NET nhất định, không thể di chuyển toàn bộ 180 máy chủ ERP hỗn hợp trong thời hạn gấp mà không có rủi ro tái cấu trúc.

</details>

### Câu 2 `hard`

A logistics company plans to migrate a mission-critical 4 TB on-premises Oracle 19c database (containing complex PL/SQL stored procedures, triggers, and custom packages) to Amazon Aurora PostgreSQL to eliminate commercial database licensing costs. The migration must have near-zero downtime during cutover and verify data consistency between source and target before switching application traffic. Which migration workflow should the Solutions Architect recommend?

- **A.** Use AWS Schema Conversion Tool (SCT) to convert Oracle schema/PL/SQL to PostgreSQL, then use AWS DMS with Full Load + CDC and Data Validation.
- **B.** Use Oracle Data Pump to export the 4 TB Oracle 19c database to Amazon S3 and import it directly into Amazon Aurora PostgreSQL during a weekend.
- **C.** Use AWS DMS alone in Full Load + CDC mode because DMS automatically converts all Oracle PL/SQL stored procedures, triggers, and custom packages to PostgreSQL.
- **D.** Use AWS Application Migration Service (AWS MGN) to replicate the Oracle server to EC2, then run an in-place engine upgrade from Oracle 19c to Aurora PostgreSQL.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty logistics dự định di chuyển cơ sở dữ liệu Oracle 19c on-premises quan trọng dung lượng 4 TB (chứa các PL/SQL stored procedure, trigger và package tùy chỉnh phức tạp) sang Amazon Aurora PostgreSQL để loại bỏ chi phí bản quyền cơ sở dữ liệu thương mại. Quá trình di chuyển phải có thời gian gián đoạn gần như bằng 0 trong lúc cutover và xác minh tính nhất quán dữ liệu giữa nguồn và đích trước khi chuyển lưu lượng ứng dụng. Solutions Architect nên đề xuất quy trình di chuyển nào?

**Đáp án đúng:** **A**

Quy trình chuẩn cho **Heterogeneous Database Migration** (như Oracle/SQL Server sang Aurora PostgreSQL/MySQL) với near-zero downtime là bộ đôi: **AWS SCT** (chuyển đổi schema & code PL/SQL) + **AWS DMS (Full Load + CDC + Data Validation)**.

- **A (Đúng):** Chính xác. Đây là di chuyển dị thể (heterogeneous migration: Oracle -> Aurora PostgreSQL). Bước 1 dùng AWS SCT để đánh giá và chuyển đổi schema, PL/SQL, triggers, packages sang PostgreSQL. Bước 2 dùng AWS DMS ở chế độ Full Load + Ongoing Replication (CDC) để giữ downtime gần bằng 0, kết hợp bật DMS Data Validation để kiểm chứng tính toàn vẹn dữ liệu trước khi cutover.
- **B:** Oracle Data Pump chỉ hoạt động cho di chuyển đồng nhất (Oracle sang Oracle), không thể import trực tiếp vào Aurora PostgreSQL và gây downtime dài cho DB 4 TB.
- **C:** AWS DMS chỉ sao chép dữ liệu và tạo cấu trúc bảng cơ bản (primary keys), KHÔNG chuyển đổi stored procedures, triggers, views hay PL/SQL packages — bắt buộc phải có AWS SCT.
- **D:** Không tồn tại cơ chế in-place engine upgrade từ Oracle sang Aurora PostgreSQL.

</details>

### Câu 3 `medium`

An enterprise is preparing to migrate 600 on-premises servers across three data centers to AWS. The migration architect currently lacks an accurate inventory of server utilization, running processes, and TCP network dependencies between application tiers, which is blocking wave planning and TCO business case approval. Some legacy servers run VMware vSphere, while 150 critical database and middleware servers run on bare-metal Linux/Windows where detailed process-to-process network connection mapping is mandatory. Which AWS discovery tools should the Solutions Architect deploy?

- **A.** Use AWS Schema Conversion Tool (SCT) to scan all 600 on-premises servers for running OS processes and TCP network dependencies.
- **B.** Deploy only the AWS Application Discovery Service Agentless Collector OVA appliance because it automatically maps TCP process-level dependencies on bare-metal servers.
- **C.** Use AWS Application Migration Service (MGN) to replicate all 600 physical and VMware servers first and inspect VPC Flow Logs in AWS to discover dependencies.
- **D.** Deploy the ADS Agentless Collector on VMware vCenter, install the ADS Agent on bare-metal servers for process/network mapping, and use Migration Hub with Migration Evaluator for TCO.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp đang chuẩn bị di chuyển 600 máy chủ on-premises trên ba trung tâm dữ liệu lên AWS. Kiến trúc sư di chuyển hiện thiếu danh mục chính xác về mức sử dụng máy chủ, các tiến trình đang chạy và các phụ thuộc mạng TCP giữa các tầng ứng dụng, điều này đang cản trở việc lập kế hoạch đợt di chuyển (wave planning) và phê duyệt hồ sơ kinh doanh TCO. Một số máy chủ kế thừa chạy VMware vSphere, trong khi 150 máy chủ cơ sở dữ liệu và middleware quan trọng chạy trên bare-metal Linux/Windows nơi việc ánh xạ kết nối mạng chi tiết từ tiến trình tới tiến trình là bắt buộc. Solutions Architect nên triển khai các công cụ khám phá AWS nào?

**Đáp án đúng:** **D**

Trong giai đoạn **Assess & Mobilize** của di chuyển doanh nghiệp: dùng **AWS Application Discovery Agent** khi cần **process & TCP network dependency mapping** (hoặc máy chủ bare-metal), dùng **Agentless Collector** cho kiểm kê nhanh trên VMware, tổng hợp tại **AWS Migration Hub** và tính toán chi phí/TCO bằng **AWS Migration Evaluator**.

- **A:** AWS SCT chỉ dùng để đánh giá và chuyển đổi schema cơ sở dữ liệu dị thể, không phải công cụ khám phá hạ tầng máy chủ và kết nối mạng.
- **B:** Agentless Collector chỉ hoạt động với môi trường VMware vCenter (không hỗ trợ bare-metal) và không thu thập được process-level network dependencies.
- **C:** Di chuyển mù 600 máy chủ trước khi biết phụ thuộc mạng sẽ gây gián đoạn ứng dụng và không cung cấp được báo cáo TCO trước khi phê duyệt dự án.
- **D (Đúng):** Chính xác. Agentless Collector chỉ thu thập thông tin cơ bản trên VMware vCenter (CPU/RAM/Disk), KHÔNG thu thập được tiến trình đang chạy và bản đồ kết nối mạng giữa các máy chủ. Vì vậy cần cài AWS Application Discovery Agent lên các máy chủ cần network dependency mapping (đặc biệt là bare-metal), tập hợp dữ liệu tại AWS Migration Hub (Strategy Recommendations / grouping) và dùng Migration Evaluator để lập bài toán TCO.

</details>

### Câu 4 `medium`

A healthcare provider must evacuate its on-premises VMware vSphere data center containing 400 virtual machines within 60 days due to an unexpected facility closure. Many legacy medical applications have hardcoded IP addresses that cannot be changed immediately, and the operations team is exclusively trained on VMware vCenter, vSAN, and NSX tooling. The CIO requires live migration with zero downtime for critical VMs and native low-latency access to Amazon S3 and Amazon RDS in the same AWS Region. Which migration strategy should the Solutions Architect recommend?

- **A.** Refactor all 400 VMware virtual machines into Linux containers on Amazon EKS using AWS App2Container within the 60-day evacuation window.
- **B.** Use AWS Application Migration Service (MGN) to convert all 400 VMware VMs into Amazon EC2 instances and re-IP the applications using AWS CloudFormation.
- **C.** Deploy VMware Cloud on AWS (Relocate) and use VMware HCX with L2 Network Extension and vMotion to live-migrate the 400 VMs while keeping IPs and vCenter tooling.
- **D.** Export all 400 VMware VMs as OVA files to AWS Snowball Edge Storage Optimized devices and import them using Amazon EC2 VM Import/Export.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà cung cấp dịch vụ y tế phải di dời khỏi trung tâm dữ liệu VMware vSphere on-premises chứa 400 máy ảo trong vòng 60 ngày do cơ sở bất ngờ đóng cửa. Nhiều ứng dụng y tế kế thừa có địa chỉ IP được mã hóa cứng không thể thay đổi ngay lập tức, và đội ngũ vận hành chỉ được đào tạo độc quyền về các công cụ VMware vCenter, vSAN và NSX. CIO yêu cầu di chuyển trực tiếp (live migration) không gián đoạn cho các máy ảo quan trọng và truy cập nguyên bản độ trễ thấp tới Amazon S3 và Amazon RDS trong cùng AWS Region. Solutions Architect nên đề xuất chiến lược di chuyển nào?

**Đáp án đúng:** **C**

Trong 7Rs, chiến lược **Relocate** sử dụng **VMware Cloud on AWS + VMware HCX** là đáp án chuẩn xác nhất khi doanh nghiệp cần di chuyển gấp hàng trăm VM VMware, giữ nguyên **vCenter/NSX tooling**, bảo toàn **IP hardcoded (L2 extension)** và **live migration (vMotion)** không downtime.

- **A:** Refactor 400 ứng dụng y tế kế thừa sang EKS trong 60 ngày là bất khả thi.
- **B:** MGN chuyển sang EC2 đòi hỏi downtime cutover ngắn, không giữ được bộ công cụ quản trị vCenter/vSAN/NSX quen thuộc và khó xử lý 400 máy chủ với yêu cầu bảo toàn IP trong 60 ngày cho đội ngũ chỉ quen VMware.
- **C (Đúng):** Chính xác. Chiến lược Relocate với **VMware Cloud on AWS + VMware HCX** cho phép di chuyển nóng (vMotion live migration) không downtime, mở rộng mạng Layer 2 để giữ nguyên toàn bộ IP hardcoded, tiếp tục dùng vCenter/vSAN/NSX mà không cần đào tạo lại đội ngũ, và kết nối trực tiếp qua Elastic Network Interface (ENI) băng thông cao tới S3/RDS trong cùng Region.
- **D:** Export OVA sang Snowball Edge gây downtime dài (vi phạm yêu cầu live migration zero downtime) và không giữ được hệ sinh thái VMware vCenter.

</details>

### Câu 5 `hard`

A digital media company wants to migrate a 10 TB self-managed MongoDB 5.0 replica set running on-premises to Amazon DocumentDB (with MongoDB compatibility) to reduce operational overhead. The application must remain online with minimal downtime (under 15 minutes) during cutover, and the team wants to verify operator compatibility beforehand and avoid slow full-collection scans on the target cluster after migration. What is the BEST migration approach?

- **A.** Run the DocumentDB Compatibility Tool, pre-create indexes on the target cluster, and use AWS DMS in Full Load + CDC mode (reading the oplog) until a brief cutover.
- **B.** Run mongodump on the 10 TB source MongoDB replica set, upload the dump files to Amazon S3, and run mongorestore into Amazon DocumentDB during a weekend maintenance window.
- **C.** Use AWS Schema Conversion Tool (AWS SCT) to convert MongoDB BSON collections into Amazon DocumentDB tables and perform an offline snapshot import.
- **D.** Add the Amazon DocumentDB cluster directly as a secondary replica member to the on-premises MongoDB 5.0 replica set and step down the on-premises primary.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty truyền thông kỹ thuật số muốn di chuyển cụm replica set MongoDB 5.0 tự quản lý dung lượng 10 TB đang chạy on-premises sang Amazon DocumentDB (tương thích MongoDB) để giảm chi phí vận hành. Ứng dụng phải duy trì trực tuyến với thời gian gián đoạn tối thiểu (dưới 15 phút) trong quá trình cutover, và nhóm muốn xác minh khả năng tương thích toán tử trước đó cũng như tránh các lượt quét toàn bộ collection chậm trên cụm đích sau khi di chuyển. Phương pháp di chuyển TỐT NHẤT là gì?

**Đáp án đúng:** **A**

Di chuyển cơ sở dữ liệu NoSQL **MongoDB sang Amazon DocumentDB** với downtime tối thiểu sử dụng **DocumentDB Compatibility Tool** (kiểm tra tương thích), tạo sẵn **secondary indexes** trên đích (vì DMS chỉ sao chép dữ liệu) và chạy **AWS DMS Full Load + CDC**.

- **A (Đúng):** Chính xác. Quy trình chuẩn của AWS để di chuyển MongoDB quy mô 10 TB sang Amazon DocumentDB với near-zero downtime: (1) chạy DocumentDB Compatibility Tool để kiểm tra các toán tử MongoDB được hỗ trợ, (2) dùng mongodump/index tool hoặc tạo trước các index cần thiết trên DocumentDB (vì DMS không tự sao chép secondary indexes), và (3) dùng **AWS DMS Full Load + CDC** (đọc oplog) để đồng bộ liên tục rồi cutover trong vài phút.
- **B:** mongodump/mongorestore cho 10 TB dữ liệu sẽ mất nhiều giờ đến cả ngày, gây downtime vượt xa giới hạn 15 phút.
- **C:** AWS SCT không dùng để chuyển đổi MongoDB sang DocumentDB, và offline import không đáp ứng downtime dưới 15 phút.
- **D:** Amazon DocumentDB không thể gia nhập trực tiếp làm node replica trong một cụm self-managed MongoDB replica set on-premises.

</details>

### Câu 6 `medium`

A telecommunications company is migrating a 4 TB on-premises Oracle 19c Enterprise Edition database—containing hundreds of PL/SQL stored procedures, triggers, and views—to Amazon Aurora PostgreSQL to eliminate commercial database licensing costs. The business can tolerate at most 15 minutes of write downtime during cutover. Which end-to-end migration workflow should the Solutions Architect follow?

- **A.** Run an AWS DMS Full Load + CDC task directly from Oracle to Aurora PostgreSQL without using AWS SCT, because DMS automatically converts all PL/SQL stored procedures and triggers.
- **B.** Use Oracle RMAN to back up the 4 TB database to Amazon S3 and restore it directly into Amazon Aurora PostgreSQL.
- **C.** Use AWS Application Migration Service (MGN) to replicate the Oracle server to EC2, which automatically converts the database engine to Aurora PostgreSQL.
- **D.** Use AWS Schema Conversion Tool (SCT) to convert Oracle schema/PL/SQL to PostgreSQL, then run an AWS DMS Full Load + CDC task with Data Validation.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty viễn thông đang di chuyển cơ sở dữ liệu Oracle 19c Enterprise Edition on-premises dung lượng 4 TB—chứa hàng trăm PL/SQL stored procedure, trigger và view—sang Amazon Aurora PostgreSQL để loại bỏ chi phí bản quyền cơ sở dữ liệu thương mại. Doanh nghiệp chỉ có thể chấp nhận tối đa 15 phút gián đoạn ghi trong quá trình cutover. Solutions Architect nên tuân theo quy trình di chuyển đầu cuối nào?

**Đáp án đúng:** **D**

Quy trình chuẩn cho **Heterogeneous Database Migration** (Oracle/SQL Server -> Aurora PostgreSQL/MySQL) có downtime tối thiểu luôn gồm 2 bước không thể tách rời: (1) **AWS SCT** (chuyển schema + PL/SQL/T-SQL) -> (2) **AWS DMS Full Load + CDC** (đồng bộ dữ liệu liên tục kèm Data Validation).

- **A:** AWS DMS chỉ chuyển đổi các đối tượng bảng cơ bản và dữ liệu; DMS KHÔNG tự động chuyển đổi PL/SQL stored procedures, triggers, views hay secondary indexes phức tạp (bắt buộc phải dùng AWS SCT).
- **B:** Oracle RMAN backup chỉ khôi phục được vào Oracle Database, hoàn toàn không tương thích với engine Aurora PostgreSQL.
- **C:** AWS MGN chỉ lift-and-shift nguyên máy chủ sang EC2 (vẫn chạy Oracle Enterprise Edition và tốn phí bản quyền), không chuyển đổi engine sang Aurora PostgreSQL.
- **D (Đúng):** Chính xác. Đối với di chuyển cơ sở dữ liệu dị thể (heterogeneous migration: Oracle -> Aurora PostgreSQL), bắt buộc phải dùng AWS SCT (hoặc DMS Schema Conversion) để chuyển đổi cấu trúc bảng và mã PL/SQL trước, sau đó dùng AWS DMS chế độ Full Load + CDC để đồng bộ dữ liệu liên tục giúp rút ngắn downtime cắt chuyển xuống dưới 15 phút.

</details>

### Câu 7 `medium`

Before committing to a 3-year cloud migration program, a CFO asks the architecture team to build a data-driven Total Cost of Ownership (TCO) business case comparing current on-premises infrastructure costs against projected AWS costs (including Savings Plans and Windows/SQL Server license optimization), AND automatically inventory 400 on-premises database instances across multiple data centers to recommend right-sized RDS/Aurora targets. Which combination of AWS migration assessment tools should be used?

- **A.** Use AWS Trusted Advisor to scan the on-premises data centers and generate a TCO report.
- **B.** Use AWS Migration Evaluator for the TCO business case with licensing optimization, and AWS DMS Fleet Advisor to discover and recommend RDS/Aurora targets.
- **C.** Use AWS Cost Explorer and the AWS Pricing Calculator exclusively to manually inventory all 400 on-premises database servers and build the executive TCO report.
- **D.** Use AWS Application Migration Service (MGN) to replicate all 400 database servers to EC2 first and measure the actual monthly AWS bill for 3 months.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trước khi cam kết chương trình di chuyển đám mây 3 năm, CFO yêu cầu nhóm kiến trúc xây dựng hồ sơ kinh doanh Tổng chi phí sở hữu (TCO) dựa trên dữ liệu để so sánh chi phí hạ tầng on-premises hiện tại với chi phí AWS dự kiến (bao gồm Savings Plans và tối ưu hóa bản quyền Windows/SQL Server), ĐỒNG THỜI tự động kiểm kê 400 database instance on-premises trên nhiều trung tâm dữ liệu để đề xuất các đích RDS/Aurora có kích thước phù hợp. Nên sử dụng sự kết hợp các công cụ đánh giá di chuyển AWS nào?

**Đáp án đúng:** **B**

Trong giai đoạn **Assess** của quy trình di chuyển quy mô lớn (MAP): dùng **AWS Migration Evaluator** để lập **TCO Business Case & tối ưu bản quyền** cho CFO, và dùng **AWS DMS Fleet Advisor** để tự động khám phá & lập kế hoạch cho hàng trăm **on-premises databases**.

- **A:** Trusted Advisor chỉ kiểm tra tài nguyên đang chạy bên trong tài khoản AWS, không quét hạ tầng data center on-premises.
- **B (Đúng):** Chính xác. AWS Migration Evaluator (trước đây là TSO Logic) chuyên tạo báo cáo phân tích kinh doanh TCO, tối ưu bản quyền Windows/SQL Server và đề xuất Savings Plans cho ban lãnh đạo (CFO). AWS DMS Fleet Advisor tự động quét và đánh giá hàng trăm máy chủ cơ sở dữ liệu on-premises để đề xuất dịch vụ đích (RDS/Aurora) tối ưu.
- **C:** Cost Explorer chỉ phân tích chi phí ĐÃ phát sinh trên AWS (không quét hạ tầng on-premises), còn Pricing Calculator phải nhập thủ công từng dòng chứ không tự động thu thập dữ liệu sử dụng thực tế từ 400 máy chủ on-premises.
- **D:** Di chuyển thật toàn bộ 400 cơ sở dữ liệu lên EC2 trước khi lập kế hoạch TCO gây tốn kém lớn và rủi ro cao.

</details>

### Câu 8 `hard`

A manufacturing enterprise must exit its primary colocation data center within 4 months. The data center hosts 300 VMware vSphere virtual machines running a mix of legacy COTS (Commercial Off-The-Shelf) ERP systems and custom Linux/Windows applications. Management wants to minimize migration risk, avoid re-architecting applications during the initial exit, and automatically convert the majority of standard x86 VMs directly into native Amazon EC2 instances while also tracking migration progress across waves from a single dashboard. Which TWO AWS services should the Solutions Architect combine? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Use AWS Migration Hub (and Migration Hub Orchestrator) to group the 300 VMs into migration waves, automate repeatable cutover runbooks, and track end-to-end migration status from a centralized dashboard.
- **B.** Use AWS DataSync to replicate the VMware ESXi operating system boot disks into Amazon EC2 AMIs.
- **C.** Refactor all 300 VMware VMs into serverless AWS Lambda functions and Amazon DynamoDB tables before the 4-month colocation exit deadline.
- **D.** Use AWS Application Migration Service (AWS MGN) for continuous block-level replication and automated conversion of x86 VMs into native EC2 instances.
- **E.** Use AWS Snowball Edge Storage Optimized devices to manually export OVA images from all 300 VMs and import them via VM Import/Export with a 2-week application freeze.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp sản xuất phải rời khỏi trung tâm dữ liệu thuê chỗ (colocation) chính của mình trong vòng 4 tháng. Trung tâm dữ liệu lưu trữ 300 máy ảo VMware vSphere chạy kết hợp các hệ thống ERP COTS (Commercial Off-The-Shelf) kế thừa và các ứng dụng Linux/Windows tùy chỉnh. Ban quản lý muốn giảm thiểu rủi ro di chuyển, tránh tái kiến trúc ứng dụng trong đợt rời đi ban đầu, và tự động chuyển đổi phần lớn các máy ảo x86 tiêu chuẩn trực tiếp thành Amazon EC2 instance nguyên bản đồng thời theo dõi tiến độ di chuyển qua các đợt từ một bảng điều khiển duy nhất. Solutions Architect nên kết hợp HAI dịch vụ AWS nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, D**

Đối với chiến dịch **thoát data center gấp (time-boxed data center exit)** với hàng trăm máy chủ VMware/x86 cần chuyển sang EC2 gốc ít rủi ro nhất, bộ đôi chuẩn là **AWS Application Migration Service (AWS MGN)** (Rehost liên tục ở tầng block) + **AWS Migration Hub / Orchestrator** (quản lý theo wave và theo dõi tập trung).

- **A (Đúng):** Chính xác. AWS Migration Hub đóng vai trò bảng điều khiển trung tâm theo dõi tiến độ di chuyển theo từng wave (tích hợp trực tiếp với AWS MGN và DMS), còn Migration Hub Orchestrator giúp tự động hóa quy trình/runbook di chuyển ứng dụng phức tạp.
- **B:** AWS DataSync chỉ di chuyển dữ liệu file/object (NFS/SMB/S3/EFS/FSx), không thể sao chép hệ điều hành hay chuyển đổi VM sang EC2 AMI.
- **C:** Tái cấu trúc (Refactor) 300 VM (bao gồm cả phần mềm đóng gói COTS ERP) sang Serverless trong 4 tháng là bất khả thi và trái với yêu cầu tránh re-architect trong giai đoạn thoát data center.
- **D (Đúng):** Chính xác. AWS Application Migration Service (AWS MGN) là dịch vụ chủ lực của AWS cho chiến lược Rehost (lift-and-shift) quy mô lớn từ VMware/physical sang Amazon EC2 gốc, hỗ trợ sao chép block liên tục, kiểm thử cutover không gián đoạn và tự động cài đặt driver AWS.
- **E:** Xuất OVA thủ công và đóng băng hệ thống 2 tuần gây downtime khổng lồ và tốn công vận hành hơn rất nhiều so với sao chép liên tục bằng AWS MGN.

</details>

### Câu 9 `medium`

A large retail conglomerate is executing a 6-month phased migration of 50 transactional databases to Amazon Aurora using AWS Database Migration Service (DMS). Transaction rates fluctuate drastically between quiet weekday nights and massive weekend promotional bursts. Previously, the migration team had to manually guess and overprovision large DMS Replication Instances to avoid out-of-memory crashes during bursts, wasting budget and causing operational delays when resizing instances. Which AWS DMS deployment option eliminates manual replication instance sizing and automatically scales capacity up and down?

- **A.** AWS Glue Studio visual ETL jobs replacing CDC replication.
- **B.** AWS DMS with a single dms.t3.micro replication instance.
- **C.** Amazon RDS Read Replicas across on-premises data centers.
- **D.** AWS DMS Serverless

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tập đoàn bán lẻ lớn đang thực hiện di chuyển theo giai đoạn trong 6 tháng đối với 50 cơ sở dữ liệu giao dịch sang Amazon Aurora bằng AWS Database Migration Service (DMS). Tốc độ giao dịch dao động mạnh giữa các đêm ngày thường yên ắng và các đợt bùng nổ khuyến mãi cuối tuần lớn. Trước đây, nhóm di chuyển phải đoán thủ công và cấp phát dư thừa các DMS Replication Instance lớn để tránh lỗi hết bộ nhớ trong các đợt tăng đột biến, gây lãng phí ngân sách và chậm trễ vận hành khi thay đổi kích thước instance. Tùy chọn triển khai AWS DMS nào loại bỏ việc định cỡ replication instance thủ công và tự động tăng giảm công suất?

**Đáp án đúng:** **D**

**AWS DMS Serverless** tự động hóa hoàn toàn việc dự phòng và co giãn dung lượng replication (DCUs) theo lưu lượng thay đổi đột ngột, giúp tránh lỗi OOM khi tải tăng đột biến và không lãng phí chi phí lúc thấp điểm.

- **A:** AWS Glue là dịch vụ batch/Spark ETL cho data lake, không thay thế cơ chế sao chép giao dịch CDC độ trễ thấp của AWS DMS cho 50 cơ sở dữ liệu giao dịch sang Aurora.
- **B:** dms.t3.micro chỉ phù hợp thử nghiệm nhỏ, sẽ lập tức bị cạn kiệt CPU/RAM (out-of-memory) và gây trễ CDC nghiêm trọng khi gặp đợt tải cuối tuần.
- **C:** RDS Read Replicas không cung cấp giải pháp tự động co giãn replication cho di chuyển đa cơ sở dữ liệu dị thể/đồng thể như DMS Serverless.
- **D (Đúng):** Chính xác. AWS DMS Serverless tự động cấp phát, giám sát và co giãn dung lượng replication (tính theo DMS Capacity Units - DCUs) lên xuống linh hoạt theo biến động thực tế của workload mà không cần kỹ sư phải dự đoán kích thước EC2 replication instance hay dừng tác vụ để resize thủ công.

</details>

### Câu 10 `hard`

A manufacturing company must evacuate its on-premises data center within 6 weeks due to an expiring lease. The data center hosts 180 physical Linux and Windows servers running legacy ERP and custom applications with complex inter-server dependencies. The company wants to migrate all servers to Amazon EC2 with minimal downtime (minutes) and without modifying application code during the initial move. Which migration strategy and AWS service should be used?

- **A.** Rehost using AWS Application Migration Service (AWS MGN) to perform continuous block-level replication to a staging area subnet, followed by rapid cutover to EC2.
- **B.** Use AWS DataSync agents to copy the root file systems of all 180 physical servers to Amazon EFS and boot new Amazon EC2 instances from EFS.
- **C.** Refactor all 180 physical servers into Docker containers using AWS App2Container and deploy the modernized workloads directly onto Amazon EKS.
- **D.** Relocate all workloads using VMware Cloud on AWS to live-migrate the 180 physical Linux and Windows servers using VMware HCX.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty sản xuất phải di dời khỏi trung tâm dữ liệu on-premises trong vòng 6 tuần do sắp hết hạn hợp đồng thuê. Trung tâm dữ liệu lưu trữ 180 máy chủ vật lý Linux và Windows chạy hệ thống ERP kế thừa và các ứng dụng tùy chỉnh có phụ thuộc liên máy chủ phức tạp. Công ty muốn di chuyển toàn bộ máy chủ lên Amazon EC2 với thời gian gián đoạn tối thiểu (tính bằng phút) và không sửa đổi mã nguồn ứng dụng trong đợt di chuyển đầu tiên. Nên sử dụng chiến lược di chuyển và dịch vụ AWS nào?

**Đáp án đúng:** **A**

Khi thời hạn đóng cửa Data Center rất gấp và cần di chuyển hàng trăm máy chủ vật lý/VM lên EC2 với downtime tối thiểu mà không sửa code, luôn chọn chiến lược **Rehost** kết hợp **AWS Application Migration Service (AWS MGN)**.

- **A (Đúng):** Chính xác. Với thời hạn gấp 6 tuần và không sửa code, chiến lược Rehost (Lift & Shift) dùng AWS Application Migration Service (MGN) thực hiện continuous block-level replication là giải pháp tối ưu giúp đạt downtime chỉ vài phút.
- **B:** EC2 không thể boot trực tiếp hệ điều hành từ Amazon EFS và DataSync không phải công cụ di chuyển máy chủ (server migration).
- **C:** Refactor 180 ứng dụng legacy trong 6 tuần là bất khả thi và rủi ro cực cao; App2Container cũng chỉ hỗ trợ Java/.NET chứ không phải mọi legacy ERP.
- **D:** Đề bài nêu rõ đây là 180 máy chủ vật lý (physical servers), không phải VMware vSphere VMs, nên không thể live-migrate bằng VMware HCX.

</details>

### Câu 11 `hard`

An insurance enterprise wants to eliminate expensive commercial database licensing by migrating a 4 TB on-premises Oracle Enterprise database—containing hundreds of PL/SQL stored procedures, triggers, and views—to Amazon Aurora PostgreSQL. The migration must occur with near-zero downtime while the on-premises application continues writing to Oracle until final cutover. Which combination of tools and process should be used?

- **A.** Use AWS Application Migration Service (AWS MGN) to perform block-level replication of the Oracle database server directly into Amazon Aurora PostgreSQL.
- **B.** Export the 4 TB Oracle database using Oracle Data Pump, upload the dump files to Amazon S3, and import them directly into Amazon Aurora PostgreSQL.
- **C.** Use AWS Schema Conversion Tool (SCT) to convert the Oracle schema, views, and PL/SQL code to PostgreSQL, then use AWS DMS with Full Load + Ongoing Replication (CDC) to migrate the data.
- **D.** Use AWS Database Migration Service (DMS) alone in Full Load + CDC mode to automatically convert all Oracle PL/SQL stored procedures, triggers, and views and replicate ongoing changes.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp bảo hiểm muốn loại bỏ chi phí bản quyền cơ sở dữ liệu thương mại đắt đỏ bằng cách di chuyển cơ sở dữ liệu Oracle Enterprise on-premises dung lượng 4 TB—chứa hàng trăm PL/SQL stored procedure, trigger và view—sang Amazon Aurora PostgreSQL. Quá trình di chuyển phải diễn ra với thời gian gián đoạn gần như bằng 0 trong khi ứng dụng on-premises vẫn tiếp tục ghi vào Oracle cho đến khi chuyển đổi cuối cùng (cutover). Nên sử dụng sự kết hợp công cụ và quy trình nào?

**Đáp án đúng:** **C**

Nguyên tắc vàng cho **Heterogeneous Database Migration** (Oracle/SQL Server → Aurora PostgreSQL/MySQL) với near-zero downtime: **AWS SCT** (chuyển đổi schema & mã nguồn DB) + **AWS DMS (Full Load + CDC)** (chuyển dữ liệu liên tục).

- **A:** AWS MGN chỉ nhân bản máy chủ lên EC2 ở tầng block storage, không thể chuyển đổi Oracle sang dịch vụ managed Aurora PostgreSQL.
- **B:** Oracle Data Pump chỉ tương thích với Oracle (homogeneous), không thể import trực tiếp vào PostgreSQL và sẽ gây downtime rất dài cho 4 TB dữ liệu.
- **C (Đúng):** Chính xác. Đây là Heterogeneous Migration (Oracle -> Aurora PostgreSQL): bắt buộc dùng AWS SCT để chuyển đổi schema/PL/SQL trước, sau đó chạy AWS DMS ở chế độ Full Load + CDC để đảm bảo near-zero downtime.
- **D:** AWS DMS KHÔNG tự động chuyển đổi schema phức tạp, PL/SQL stored procedures, triggers hay views trong heterogeneous migration.

</details>

---

[Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md)
