# Bài tập tình huống — Phát hiện Mối đe dọa: GuardDuty, Security Hub & Amazon Detective

> Amazon GuardDuty Threat Intelligence, Malware Protection, AWS Security Hub Aggregation, OCSF Findings và Amazon Detective Behavior Graphs.
> **Số câu hỏi:** 7 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A financial services company runs mission-critical microservices on Amazon EKS and Amazon EC2. The security team needs to detect OS-level threats inside running containers and Linux hosts—such as reverse shells, container escapes, privilege escalation, and cryptocurrency miner execution—with minimal operational overhead and automatic agent lifecycle management. Which AWS capability should the security team enable?

- **A.** Enable Amazon GuardDuty EKS Audit Log Monitoring and VPC Flow Logs analysis.
- **B.** Enable Amazon Inspector continuous EC2 and ECR container image scanning.
- **C.** Deploy AWS Network Firewall in front of the EKS cluster VPC with Suricata IPS rules.
- **D.** Enable GuardDuty Runtime Monitoring with automated agent management for EKS and EC2.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty dịch vụ tài chính chạy các microservice tối quan trọng trên Amazon EKS và Amazon EC2. Nhóm bảo mật cần phát hiện các mối đe dọa cấp độ OS bên trong các container đang chạy và các máy chủ Linux—như reverse shell, thoát container (container escape), leo thang đặc quyền và thực thi phần mềm đào tiền ảo—với chi phí vận hành tối thiểu và quản lý vòng đời agent tự động. Nhóm bảo mật nên bật khả năng AWS nào?

**Đáp án đúng:** **D**

Trong SCS-C02, cần phân biệt rõ các gói bảo vệ của GuardDuty: EKS Audit Log Monitoring giám sát Kubernetes API control plane, còn GuardDuty Runtime Monitoring (dựa trên eBPF agent với chế độ automated agent management) giám sát trực tiếp hành vi runtime ở tầng hệ điều hành (process execution, file access, network connections) cho EC2, EKS và ECS.

- **A:** EKS Audit Log Monitoring chỉ phân tích Kubernetes API calls ở control plane và VPC Flow Logs chỉ giám sát metadata mạng, không thể phát hiện hành vi OS-level bên trong container như reverse shell hay container escape.
- **B:** Amazon Inspector tập trung phát hiện lỗ hổng phần mềm (CVE) và network reachability trên EC2/ECR/Lambda, không phải công cụ phát hiện xâm nhập thời gian thực (runtime threat detection) ở cấp syscall.
- **C:** AWS Network Firewall chỉ kiểm tra lưu lượng mạng đi qua VPC, không thể quan sát tiến trình (process), file access hoặc container escape diễn ra bên trong nhân Linux của node.
- **D (Đúng):** Chính xác! GuardDuty Runtime Monitoring sử dụng eBPF security agent nhẹ (được quản lý tự động vòng đời qua EKS add-on / SSM cho EC2 / ECS Fargate) để giám sát các system call ở cấp hệ điều hành, phát hiện reverse shell, container escape, crypto miner và privilege escalation.

</details>

### Câu 2 `hard`

An Amazon GuardDuty alert flags unusual API calls from an IAM role and suspicious outbound network traffic from an EC2 instance across multiple accounts. A security analyst needs to rapidly visualize the relationships between the involved IAM principal, EC2 instance, IP addresses, API call volume anomalies, and EKS audit activity over the past 30 days to determine the root cause and blast radius—without writing complex Athena SQL queries across separate log buckets. Which AWS service should the analyst use?

- **A.** AWS Security Hub
- **B.** AWS CloudTrail Lake
- **C.** Amazon Detective
- **D.** Amazon CloudWatch Logs Insights

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một cảnh báo Amazon GuardDuty gắn cờ các lệnh gọi API bất thường từ một IAM role và lưu lượng mạng đi ra đáng ngờ từ một EC2 instance trên nhiều tài khoản. Một chuyên viên phân tích bảo mật cần nhanh chóng trực quan hóa mối quan hệ giữa IAM principal liên quan, EC2 instance, các địa chỉ IP, các bất thường về khối lượng lệnh gọi API và hoạt động kiểm toán EKS trong 30 ngày qua để xác định nguyên nhân gốc rễ và phạm vi ảnh hưởng—mà không cần viết các truy vấn SQL Athena phức tạp trên các log bucket riêng biệt. Chuyên viên phân tích nên sử dụng dịch vụ AWS nào?

**Đáp án đúng:** **C**

Trong chuỗi công cụ Incident Response của AWS: **GuardDuty** = Phát hiện mối đe dọa (Detect), **Security Hub** = Tổng hợp & ưu tiên cảnh báo (Aggregate/Prioritize), và **Amazon Detective** = Điều tra nguyên nhân gốc rễ & phạm vi ảnh hưởng bằng Behavior Graph (Investigate).

- **A:** AWS Security Hub tổng hợp và chấm điểm tuân thủ các security findings theo chuẩn ASFF, nhưng không cung cấp đồ thị hành vi (behavior graph) tương tác để điều tra sâu chuỗi sự kiện từ VPC Flow Logs và CloudTrail như Amazon Detective.
- **B:** CloudTrail Lake yêu cầu người dùng viết câu lệnh SQL để truy vấn và không tự động ghép nối VPC Flow Logs hay xây dựng đồ thị hành vi trực quan.
- **C (Đúng):** Chính xác! Amazon Detective tự động thu thập và tổng hợp dữ liệu từ CloudTrail, VPC Flow Logs, EKS Audit Logs và GuardDuty findings vào một đồ thị hành vi (behavior graph) tương tác, giúp nhà phân tích điều tra nguyên nhân gốc rễ (root cause) và phạm vi ảnh hưởng (blast radius) trực quan mà không cần viết truy vấn log thủ công.
- **D:** CloudWatch Logs Insights yêu cầu viết truy vấn thủ công trên từng log group riêng lẻ và không xây dựng đồ thị quan hệ đa nguồn bảo mật.

</details>

### Câu 3 `hard`

A company runs business-critical workloads on Amazon Aurora PostgreSQL clusters across multiple AWS accounts. The security team needs to automatically detect anomalous login attempts, such as brute-force attacks, logins from Tor exit nodes, or suspicious credential usage against the database clusters, without installing database agents or modifying application connection strings. Which AWS capability should the security team enable?

- **A.** Enable Amazon Inspector database scanning across all Aurora clusters in AWS Organizations.
- **B.** Enable Amazon GuardDuty RDS Protection from the GuardDuty delegated administrator account across all member accounts.
- **C.** Enable AWS CloudTrail data events for Amazon RDS and create a CloudWatch metric filter for failed login attempts.
- **D.** Enable Amazon Macie automated discovery on the Aurora database snapshots stored in Amazon S3.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty chạy các workload tối quan trọng trên các cụm Amazon Aurora PostgreSQL trên nhiều tài khoản AWS. Nhóm bảo mật cần tự động phát hiện các nỗ lực đăng nhập bất thường, chẳng hạn như tấn công brute-force, đăng nhập từ các node thoát Tor hoặc sử dụng thông tin xác thực đáng ngờ đối với các cụm cơ sở dữ liệu, mà không cần cài đặt database agent hoặc sửa đổi chuỗi kết nối ứng dụng. Nhóm bảo mật nên bật khả năng AWS nào?

**Đáp án đúng:** **B**

**Amazon GuardDuty RDS Protection** giám sát và phân tích hồ sơ hành vi đăng nhập của Amazon Aurora và Amazon RDS bằng machine learning để phát hiện các mối đe dọa như brute-force, truy cập từ IP độc hại hoặc người dùng bất thường mà không gây ảnh hưởng hiệu năng và không cần cài đặt agent.

- **A:** Amazon Inspector chỉ quét lỗ hổng phần mềm (CVE) và khả năng tiếp cận mạng trên EC2, ECR và Lambda; nó không phân tích hành vi đăng nhập bất thường vào Amazon Aurora/RDS.
- **B (Đúng):** Chính xác! Amazon GuardDuty RDS Protection tự động phân tích các sự kiện đăng nhập (RDS login activity) trực tiếp ở tầng dịch vụ của Amazon Aurora và Amazon RDS để phát hiện brute-force, đăng nhập từ IP độc hại/Tor mà không cần cài agent hay sửa ứng dụng, và có thể bật tập trung từ tài khoản delegated administrator.
- **C:** CloudTrail ghi nhận các lời gọi API quản trị RDS (như ModifyDBCluster) chứ không ghi nhận các sự kiện xác thực/đăng nhập ở tầng kết nối cơ sở dữ liệu (database login activity).
- **D:** Amazon Macie chỉ quét dữ liệu nhạy cảm trong S3 bucket, không phát hiện tấn công brute-force hay đăng nhập bất thường vào cơ sở dữ liệu.

</details>

### Câu 4 `hard`

A company runs multi-tenant microservices on Amazon EKS clusters with EC2 worker nodes. The security team already monitors Kubernetes API calls via EKS Audit Logs, but now needs to detect operating-system-level threats occurring inside running containers—such as privilege escalation, container escape attempts, reverse shells, and malicious binary execution—with automated agent lifecycle management. Which AWS capability should the team enable?

- **A.** Enable Amazon GuardDuty EKS Audit Log Monitoring only.
- **B.** Enable Amazon GuardDuty Runtime Monitoring for Amazon EKS with automated security agent management.
- **C.** Enable Amazon Inspector continuous scanning for Amazon ECR container images.
- **D.** Enable VPC Flow Logs on the EKS worker node subnets and inspect packet payloads for shell commands.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty chạy các microservice đa khách hàng trên các cụm Amazon EKS với các worker node EC2. Nhóm bảo mật đã giám sát các lệnh gọi Kubernetes API thông qua EKS Audit Logs, nhưng hiện cần phát hiện các mối đe dọa cấp độ hệ điều hành xảy ra bên trong các container đang chạy—như leo thang đặc quyền, nỗ lực thoát container, reverse shell và thực thi tệp nhị phân độc hại—với khả năng quản lý vòng đời agent tự động. Nhóm nên bật khả năng AWS nào?

**Đáp án đúng:** **B**

Trong **Amazon GuardDuty** cho EKS, cần phân biệt 2 tính năng: **EKS Audit Log Monitoring** giám sát hoạt động gọi Kubernetes API ở Control Plane, còn **Runtime Monitoring (EKS/ECS/EC2)** sử dụng eBPF agent được quản lý tự động để phát hiện mối đe dọa OS-level bên trong container/host khi đang chạy.

- **A:** GuardDuty EKS Audit Log Monitoring chỉ phân tích các lời gọi tới Kubernetes Control Plane API (ví dụ tạo pod đặc quyền hoặc truy cập secret), không quan sát được tiến trình OS-level hay reverse shell bên trong container đang chạy.
- **B (Đúng):** Chính xác! Amazon GuardDuty Runtime Monitoring cho EKS triển khai và tự động quản lý eBPF security agent (EKS add-on) để giám sát các sự kiện ở mức hệ điều hành (OS-level syscalls, file access, process execution) bên trong container, phát hiện leo thang đặc quyền, container escape và reverse shell.
- **C:** Amazon Inspector ECR scanning quét lỗ hổng CVE tĩnh trong container image lưu ở ECR, không phát hiện hành vi xâm nhập runtime (reverse shell, container escape) trong pod đang chạy.
- **D:** VPC Flow Logs chỉ ghi metadata tầng mạng (IP, port, byte count), không ghi payload gói tin và hoàn toàn không thấy được hoạt động tiến trình ở tầng hệ điều hành trong container.

</details>

### Câu 5 `hard`

A company enables Amazon GuardDuty S3 Protection across its production accounts. An authorized third-party penetration testing firm runs scheduled weekly vulnerability scans from a static CIDR block, generating hundreds of repetitive Recon:EC2/PortProbeUnprotectedPort findings. The security team wants to automatically archive ONLY this specific finding type when originating from the penetration testing CIDR block, while continuing to receive alerts for all other finding types from that CIDR block. What should the team configure in GuardDuty?

- **A.** Add the penetration testing firm's CIDR block to the GuardDuty Trusted IP List for all production member accounts.
- **B.** Create a GuardDuty Suppression Rule matching finding type Recon:EC2/PortProbeUnprotectedPort and the pentest IP range.
- **C.** Disable Amazon GuardDuty detectors in all production accounts during the weekly penetration testing maintenance window.
- **D.** Add the penetration testing firm's CIDR block to a custom GuardDuty Threat IP List stored in an Amazon S3 bucket.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty bật Amazon GuardDuty S3 Protection trên các tài khoản production của mình. Một công ty kiểm thử xâm nhập bên thứ ba được ủy quyền chạy các đợt quét lỗ hổng hàng tuần theo lịch trình từ một khối CIDR tĩnh, tạo ra hàng trăm finding Recon:EC2/PortProbeUnprotectedPort lặp đi lặp lại. Nhóm bảo mật muốn tự động lưu trữ (archive) CHỈ loại finding cụ thể này khi bắt nguồn từ khối CIDR kiểm thử xâm nhập, trong khi vẫn tiếp tục nhận cảnh báo cho tất cả các loại finding khác từ khối CIDR đó. Nhóm nên cấu hình gì trong GuardDuty?

**Đáp án đúng:** **B**

Phân biệt trong **Amazon GuardDuty**: **Trusted IP List** bỏ qua TẤT CẢ các finding từ danh sách IP tin cậy (phạm vi quá rộng); **Suppression Rules** cho phép tự động archive chính xác theo tổ hợp thuộc tính (loại finding, IP nguồn, tài nguyên, mức độ nghiêm trọng) mà không tạo điểm mù.

- **A:** Thêm dải IP vào **Trusted IP List** sẽ tắt TẤT CẢ mọi loại finding từ dải IP đó (kể cả khi IP đó bị chiếm quyền để khai thác nghiêm trọng), không đáp ứng yêu cầu vẫn nhận cảnh báo cho các loại finding khác.
- **B (Đúng):** Chính xác! **GuardDuty Suppression Rules** cho phép tự động lưu trữ (auto-archive) các finding khớp chính xác điều kiện lọc (như đúng loại finding `Recon:EC2/PortProbeUnprotectedPort` VÀ đúng dải IP của đội pentest), trong khi vẫn giữ nguyên cảnh báo nếu IP đó gây ra các loại finding nguy hiểm khác.
- **C:** Tắt GuardDuty sẽ tạo điểm mù bảo mật nghiêm trọng cho toàn bộ tài khoản production.
- **D:** Threat IP List dùng để tạo thêm cảnh báo (nhận diện IP độc hại tùy chỉnh), hoàn toàn ngược lại với mục tiêu lọc giảm nhiễu.

</details>

### Câu 6 `hard`

A security administrator is configuring Trusted IP Lists and Threat IP Lists in Amazon GuardDuty across a multi-account AWS Organization managed by a delegated administrator account. Which TWO statements accurately describe the behavior and constraints of GuardDuty IP lists? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Member account administrators can override the delegated administrator's Threat IP List by uploading their own local Trusted IP List.
- **B.** Trusted IP Lists and Threat IP Lists must be managed from the GuardDuty delegated administrator account and apply to all member accounts in that Region.
- **C.** Trusted IP Lists are replicated globally across all AWS Regions automatically once uploaded to the detector in us-east-1.
- **D.** Each GuardDuty detector supports at most one active Trusted IP List per AWS Region, whereas up to six Threat IP Lists can be uploaded from Amazon S3.
- **E.** Threat IP Lists support private RFC 1918 IP addresses (such as 10.0.0.0/8) for internal lateral movement detection across VPCs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một quản trị viên bảo mật đang cấu hình Trusted IP Lists và Threat IP Lists trong Amazon GuardDuty trên một AWS Organization đa tài khoản được quản lý bởi một tài khoản quản trị được ủy quyền. HAI phát biểu nào mô tả chính xác hành vi và các ràng buộc của danh sách IP trong GuardDuty? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Các giới hạn cần nhớ về **GuardDuty IP Lists**: (1) Chỉ **Delegated Administrator** quản lý và áp dụng xuống toàn bộ member accounts trong **cùng Region** (GuardDuty là regional); (2) Tối đa **1 Trusted IP List** và **6 Threat IP Lists** trên mỗi Region; (3) Threat IP Lists chỉ chấp nhận public IPv4.

- **A:** Member accounts không được phép quản lý hay ghi đè Trusted IP List / Threat IP List khi đang nằm dưới quyền quản trị của GuardDuty delegated administrator.
- **B (Đúng):** Chính xác! Trong môi trường đa tài khoản, chỉ tài khoản GuardDuty Administrator (delegated administrator) mới có quyền tạo và quản lý Trusted IP Lists và Threat IP Lists, và các danh sách này tự động áp dụng cho toàn bộ member accounts trong cùng Region.
- **C:** Amazon GuardDuty là dịch vụ theo từng Region (regional service), nên Trusted IP Lists và Threat IP Lists phải được cấu hình riêng tại từng Region nơi GuardDuty được bật.
- **D (Đúng):** Chính xác! Mỗi GuardDuty detector theo từng Region chỉ hỗ trợ tối đa **1 Trusted IP List** (nhưng có thể chứa nhiều CIDR), trong khi hỗ trợ tối đa **6 Threat IP Lists** (lưu dưới dạng file trên S3).
- **E:** GuardDuty Threat IP Lists chỉ hỗ trợ địa chỉ IP công khai (public IPv4 addresses), không hỗ trợ dải IP nội bộ RFC 1918.

</details>

### Câu 7 `medium`

A security analyst is investigating a series of correlated GuardDuty findings involving an IAM user, an EC2 instance, and unusual API calls across multiple days. The analyst needs to visualize the historical relationship between IP addresses, AWS API calls, VPC network flows, and user sessions over the past 6 months without manually writing Athena SQL queries across multiple S3 log buckets. Which AWS service should the analyst use?

- **A.** AWS CloudTrail Lake
- **B.** Amazon Inspector
- **C.** AWS Security Hub
- **D.** Amazon Detective

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một chuyên viên phân tích bảo mật đang điều tra một chuỗi các finding GuardDuty có liên quan đến nhau bao gồm một IAM user, một EC2 instance và các lệnh gọi API bất thường trong nhiều ngày. Chuyên viên phân tích cần trực quan hóa mối quan hệ lịch sử giữa các địa chỉ IP, các lệnh gọi AWS API, luồng mạng VPC và các phiên người dùng trong 6 tháng qua mà không phải viết thủ công các truy vấn SQL Athena trên nhiều S3 log bucket. Chuyên viên phân tích nên sử dụng dịch vụ AWS nào?

**Đáp án đúng:** **D**

Ghi nhớ bộ ba Domain 1: GuardDuty = Phát hiện (Detect), Security Hub = Tổng hợp & Tuân thủ (Aggregate & Prioritize), Amazon Detective = Điều tra nguyên nhân gốc rễ bằng đồ thị hành vi trong 12 tháng (Investigate Root Cause).

- **A:** CloudTrail Lake yêu cầu viết truy vấn SQL và không tự động trực quan hóa đồ thị mối quan hệ giữa VPC Flow Logs, GuardDuty findings và hành vi người dùng.
- **B:** Amazon Inspector dùng để quét lỗ hổng CVE và khả năng tiếp cận mạng cho EC2, ECR và Lambda, không phải công cụ điều tra sự cố theo chuỗi hành vi.
- **C:** Security Hub tổng hợp danh sách findings và kiểm tra tuân thủ (CSPM), nhưng không cung cấp đồ thị phân tích lịch sử API và VPC flows chi tiết như Amazon Detective.
- **D (Đúng):** Chính xác! Amazon Detective tự động thu thập CloudTrail, VPC Flow Logs, EKS Audit Logs và GuardDuty findings để xây dựng đồ thị hành vi (behavior graph) lưu trữ tới 12 tháng, giúp điều tra root cause trực quan không cần viết SQL.

</details>

---

[Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md)
