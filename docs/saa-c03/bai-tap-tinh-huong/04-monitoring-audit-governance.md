# Bài tập tình huống — Chủ đề 4: Giám sát, Audit & Compliance — CloudWatch, CloudTrail, AWS Config & Systems Manager

> CloudWatch Metrics/Logs/Alarms, CloudTrail Management vs Data Events, AWS Config Rules & Auto-Remediation, Systems Manager Session Manager & Patch Manager.
> **Số câu hỏi:** 12 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A company manages 40 AWS accounts using AWS Organizations. The security team wants to ensure that no IAM user or even the root user in any Member Account can ever disable AWS CloudTrail or launch Amazon EC2 instances in Regions outside `us-east-1` and `eu-west-1`. Which AWS feature enforces this restriction across all member accounts?

- **A.** Attach an IAM Permissions Boundary to the Management Account root user and replicate the boundary policy across all member accounts via StackSets.
- **B.** Create a Service Control Policy (SCP) in AWS Organizations with an explicit `Deny` for `cloudtrail:StopLogging` and `aws:RequestedRegion`, attached to the Root OU.
- **C.** Create an AWS Config managed rule across all member accounts without configuring any automated Systems Manager remediation action.
- **D.** Enable Amazon Inspector across AWS Organizations to automatically block EC2 instance launches in unauthorized AWS Regions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty quản lý 40 AWS account bằng AWS Organizations. Nhóm bảo mật muốn đảm bảo rằng không một IAM user nào hay thậm chí là root user trong bất kỳ Member Account nào có thể vô hiệu hóa AWS CloudTrail hoặc khởi chạy Amazon EC2 instance ở các Region ngoài `us-east-1` và `eu-west-1`. Tính năng AWS nào thực thi giới hạn này trên tất cả các member account?

**Đáp án đúng:** **B**

Trong đề SAA-C03, khi yêu cầu **chặn (prevent) mọi người dùng kể cả Root User trong các Member Accounts của AWS Organizations** không được gọi một số API hoặc không được dùng Region khác -> Đáp án luôn là **Service Control Policy (SCP)**.

- **A:** Sai vì Permissions Boundary chỉ gắn cho từng IAM User/Role riêng lẻ chứ không quản lý tập trung toàn bộ các tài khoản thành viên và không áp dụng cho Root User.
- **B (Đúng):** Đúng! Service Control Policies (SCP) đặt rào chắn quyền tối đa (guardrails) áp dụng cho tất cả IAM Users, IAM Roles và cả Root User của các Member Accounts trong AWS Organizations.
- **C:** Sai vì AWS Config chỉ phát hiện vi phạm sau khi sự việc đã xảy ra (detective control), không chặn trước hành động (preventive control) như SCP.
- **D:** Sai vì Inspector chỉ quét lỗ hổng phần mềm trên EC2, ECR và Lambda.

</details>

### Câu 2 `medium`

A financial firm needs to prevent any user—including the AWS account root user—from deleting or overwriting audit log objects stored in an Amazon S3 bucket for a mandatory regulatory retention period of 5 years (Write-Once-Read-Many / WORM model). Which S3 feature should the solutions architect configure?

- **A.** Enable S3 Object Lock in Compliance Mode with a 5-year retention period (requires S3 Versioning enabled).
- **B.** Enable S3 Object Lock in Governance Mode without configuring any IAM permissions restrictions for administrators.
- **C.** Configure an S3 Lifecycle expiration rule to permanently delete all audit log objects after 5 days.
- **D.** Enable S3 Static Website Hosting on the bucket with a public read bucket policy for external auditors.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty tài chính cần ngăn chặn bất kỳ người dùng nào—bao gồm cả AWS account root user—xóa hoặc ghi đè các object nhật ký kiểm toán (audit log) lưu trong Amazon S3 bucket trong thời gian lưu giữ bắt buộc theo quy định là 5 năm (mô hình Write-Once-Read-Many / WORM). Solutions architect nên cấu hình tính năng S3 nào?

**Đáp án đúng:** **A**

Phân biệt 2 chế độ của **S3 Object Lock (WORM)** (Lưu ý: đối với S3 Glacier thì tính năng tương đương gọi là **Glacier Vault Lock**):
- **Compliance Mode**: **Không ai** (kể cả Root User) có thể xóa/sửa trước khi hết hạn.
- **Governance Mode**: Người dùng thường không xóa được, nhưng Admin có quyền `s3:BypassGovernanceRetention` thì bỏ qua được.

- **A (Đúng):** Đúng! **S3 Object Lock ở chế độ Compliance Mode** bảo vệ phiên bản đối tượng theo mô hình WORM: không bất kỳ ai (kể cả Root User của tài khoản AWS) có thể xóa, sửa hoặc rút ngắn thời gian lưu giữ cho tới khi hết hạn 5 năm.
- **B:** Sai vì ở Governance Mode, người dùng có quyền đặc biệt (`s3:BypassGovernanceRetention`, bao gồm Root User) vẫn có thể ghi đè hoặc xóa tệp.
- **C:** Sai vì Lifecycle rule xóa đối tượng chứ không chống xóa/ghi đè.
- **D:** Sai vì không bảo vệ dữ liệu theo chuẩn WORM.

</details>

### Câu 3 `medium`

A security team must monitor memory utilization and disk space usage on 200 Amazon EC2 Linux instances and trigger an alarm if memory usage exceeds 85% for 5 minutes. What should the solutions architect do?

- **A.** Enable Amazon CloudWatch Detailed Monitoring at 1-minute intervals across all 200 Amazon EC2 Linux instances.
- **B.** Query AWS CloudTrail management event logs using CloudTrail Lake for EC2 OS memory utilization events.
- **C.** Enable VPC Flow Logs on the subnets containing the EC2 instances and publish them to CloudWatch Logs.
- **D.** Install and configure the Unified Amazon CloudWatch Agent on the EC2 instances to push memory and disk metrics.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm bảo mật phải giám sát mức sử dụng bộ nhớ và dung lượng đĩa trên 200 Amazon EC2 instance chạy Linux và kích hoạt cảnh báo nếu mức sử dụng bộ nhớ vượt quá 85% trong 5 phút. Solutions architect nên làm gì?

**Đáp án đúng:** **D**

Mẹo nhớ SAA-C03: **CPU, Network, Disk I/O** có sẵn mặc định trên CloudWatch; **Memory (RAM) và Disk Space** bắt buộc phải cài **CloudWatch Agent**.

- **A:** Sai vì Detailed Monitoring chỉ giảm chu kỳ thu thập từ 5 phút xuống 1 phút cho các metric mặc định (CPU, Network, Disk I/O), vẫn KHÔNG có Memory và Disk Space usage.
- **B:** Sai vì CloudTrail chỉ ghi lại các lệnh gọi AWS API, không theo dõi thông số phần cứng bên trong OS.
- **C:** Sai vì VPC Flow Logs chỉ ghi lại metadata lưu lượng mạng IP.
- **D (Đúng):** Đúng! Memory (RAM) và Disk Space là OS-level metrics không có sẵn mặc định trên CloudWatch; bắt buộc phải cài **CloudWatch Agent** để thu thập và đẩy lên CloudWatch.

</details>

### Câu 4 `medium`

A company requires that all Amazon EBS volumes created in any AWS account within its AWS Organization must be encrypted, and any non-compliant Security Group allowing SSH (port 22) from `0.0.0.0/0` must be automatically remediated. Which TWO AWS services work together to detect and automatically remediate these compliance violations? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Amazon Macie
- **B.** Amazon Inspector
- **C.** AWS Config
- **D.** AWS Shield Standard
- **E.** AWS Systems Manager (SSM) Automation

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty yêu cầu tất cả các Amazon EBS volume được tạo trong bất kỳ AWS account nào thuộc AWS Organization của họ đều phải được mã hóa, và bất kỳ Security Group không tuân thủ nào cho phép SSH (cổng 22) từ `0.0.0.0/0` phải được tự động khắc phục. HAI dịch vụ AWS nào phối hợp với nhau để phát hiện và tự động khắc phục các vi phạm tuân thủ này? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Cặp bài trùng cho **Compliance Detection & Auto-Remediation** trên AWS là **AWS Config + AWS Systems Manager (SSM) Automation**.

- **A:** Sai vì Macie chỉ quét dữ liệu nhạy cảm PII trong S3.
- **B:** Sai vì Inspector chỉ quét lỗ hổng CVE, không tự động sửa cấu hình Security Group.
- **C (Đúng):** Đúng! AWS Config Rules (`encrypted-volumes`, `restricted-ssh`) liên tục kiểm tra cấu hình tài nguyên và kích hoạt remediation khi phát hiện Non-Compliant.
- **D:** Sai vì Shield Standard dùng để chống DDoS Layer 3/4.
- **E (Đúng):** Đúng! AWS Config tích hợp trực tiếp với **SSM Automation Runbooks** để tự động sửa lỗi cấu hình (như đóng port 22 trên Security Group).

</details>

### Câu 5 `medium`

A compliance auditor requires an immutable audit log of every read (`GetObject`) and write (`PutObject`) operation performed on objects inside a critical Amazon S3 bucket, including the identity of the caller and source IP address. Which solution meets this requirement?

- **A.** Enable AWS CloudTrail Data Events for the specific S3 bucket.
- **B.** Rely on the default AWS CloudTrail Event History retention log.
- **C.** Enable Amazon CloudWatch Logs delivery directly on the S3 bucket.
- **D.** Enable VPC Flow Logs on the S3 Gateway Endpoint subnets.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiểm toán viên tuân thủ yêu cầu một nhật ký kiểm toán bất biến (immutable audit log) cho mọi thao tác đọc (`GetObject`) và ghi (`PutObject`) được thực hiện trên các object bên trong một Amazon S3 bucket quan trọng, bao gồm danh tính người gọi và địa chỉ IP nguồn. Giải pháp nào đáp ứng yêu cầu này?

**Đáp án đúng:** **A**

Cần ghi log chi tiết cấp **Object trên S3 (`GetObject`/`PutObject`)** hoặc **lệnh gọi Lambda (`InvokeFunction`)** → Bật **CloudTrail Data Events**.

- **A (Đúng):** Đúng! Mặc định CloudTrail chỉ ghi Management Events (tạo/xóa bucket). Để ghi lại mọi thao tác đọc/ghi từng object (`GetObject`, `PutObject`), phải bật **CloudTrail Data Events for S3**.
- **B:** Sai vì CloudTrail mặc định không ghi Data Events cấp độ S3 object.
- **C:** Sai vì S3 không xuất trực tiếp log truy cập object sang CloudWatch Logs.
- **D:** Sai vì VPC Flow Logs chỉ ghi IP/Port chứ không ghi tên IAM User hay tên S3 object được truy cập.

</details>

### Câu 6 `easy`

A company has 50 EC2 Linux instances in private subnets with no internet access and no public IP addresses. System administrators need to securely access the shell of these instances for troubleshooting without deploying bastion hosts or opening SSH port 22. Which AWS service should they use?

- **A.** EC2 Instance Connect via public SSH
- **B.** AWS Direct Connect Private Virtual Interface
- **C.** AWS Systems Manager Session Manager
- **D.** Amazon Inspector vulnerability agent

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có 50 EC2 instance chạy Linux trong các private subnet không có kết nối internet và không có địa chỉ IP công cộng. Quản trị viên hệ thống cần truy cập an toàn vào shell của các instance này để khắc phục sự cố mà không cần triển khai bastion host hoặc mở cổng SSH 22. Họ nên sử dụng dịch vụ AWS nào?

**Đáp án đúng:** **C**

Truy cập EC2 trong Private Subnet **không cần Bastion Host, không mở Port 22** → Luôn là **AWS Systems Manager (SSM) Session Manager**.

- **A:** Sai vì EC2 Instance Connect truyền thống vẫn cần kết nối SSH port 22 (hoặc EC2 Instance Connect Endpoint vẫn dựa trên SSH).
- **B:** Sai vì Direct Connect là đường truyền vật lý, không phải công cụ quản trị shell.
- **C (Đúng):** Đúng! SSM Session Manager cho phép mở shell bảo mật qua HTTPS mà không cần mở port 22, không cần Bastion Host hay Public IP (dùng Interface VPC Endpoints cho `ssm`, `ssmmessages`, `ec2messages` nếu không có Internet).
- **D:** Sai vì Inspector chỉ quét lỗ hổng CVE.

</details>

### Câu 7 `medium`

A financial institution must store transaction audit records in Amazon S3 for 7 years. Due to strict regulatory compliance (SEC Rule 17a-4), no one—including the AWS account root user—must be able to delete or overwrite any object before the 7-year retention period expires. Which S3 feature satisfies this requirement?

- **A.** S3 Versioning with MFA Delete enabled
- **B.** S3 Object Lock in Governance Mode
- **C.** S3 Object Lock in Compliance Mode
- **D.** S3 Bucket Policy with an explicit Deny for `s3:DeleteObject`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức tài chính phải lưu trữ hồ sơ kiểm toán giao dịch trong Amazon S3 suốt 7 năm. Do quy định tuân thủ nghiêm ngặt (SEC Rule 17a-4), không một ai—bao gồm cả AWS account root user—được phép xóa hoặc ghi đè bất kỳ object nào trước khi hết thời hạn lưu giữ 7 năm. Tính năng S3 nào đáp ứng yêu cầu này?

**Đáp án đúng:** **C**

Yêu cầu **WORM / không ai kể cả Root User có thể xóa** → **S3 Object Lock (Compliance Mode)**.

- **A:** Sai vì Root User có MFA vẫn có thể xóa được phiên bản object nếu chỉ dùng MFA Delete.
- **B:** Sai vì trong Governance Mode, người dùng có quyền IAM đặc biệt (`s3:BypassGovernanceRetention`) vẫn có thể ghi đè hoặc xóa object.
- **C (Đúng):** Đúng! **S3 Object Lock ở chế độ Compliance Mode** đảm bảo mô hình WORM (Write-Once-Read-Many) tuyệt đối: không bất kỳ ai, kể cả **AWS Account Root User**, có thể xóa hoặc sửa đổi object trước thời hạn.
- **D:** Sai vì Root User hoặc Admin có quyền sửa lại Bucket Policy để gỡ bỏ lệnh Deny.

</details>

### Câu 8 `medium`

A regulatory agency requires that audit log files uploaded to an Amazon S3 bucket must not be deleted or overwritten by any user, including the AWS account root user, for a mandatory retention period of 7 years. Which S3 feature enforces this WORM (Write-Once-Read-Many) requirement?

- **A.** Enable S3 Object Lock in Governance mode with a 7-year retention period.
- **B.** Enable S3 Object Lock in Compliance mode with a 7-year retention period.
- **C.** Enable S3 Versioning and attach an S3 Bucket Policy denying `s3:DeleteObject`.
- **D.** Transition objects to Amazon S3 Glacier Deep Archive using a Lifecycle rule.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một cơ quan quản lý yêu cầu các tệp nhật ký kiểm toán được tải lên Amazon S3 bucket không được phép bị xóa hoặc ghi đè bởi bất kỳ người dùng nào, bao gồm cả AWS account root user, trong thời gian lưu giữ bắt buộc là 7 năm. Tính năng S3 nào thực thi yêu cầu WORM (Write-Once-Read-Many) này?

**Đáp án đúng:** **B**

Phân biệt S3 Object Lock: **Compliance Mode** = không ai (kể cả Root User) xóa được; **Governance Mode** = bảo vệ nhưng user có quyền đặc biệt có thể bypass.

- **A:** Sai vì ở chế độ Governance mode, người dùng có quyền IAM đặc biệt (`s3:BypassGovernanceRetention`) vẫn có thể xóa hoặc thay đổi thời hạn lưu giữ.
- **B (Đúng):** Đúng! S3 Object Lock ở chế độ **Compliance mode** đảm bảo không một ai (kể cả AWS account root user) có thể xóa hoặc ghi đè object trước khi hết thời gian lưu giữ 7 năm.
- **C:** Sai vì Root User hoặc quản trị viên có quyền sửa Bucket Policy vẫn có thể gỡ bỏ lệnh Deny và xóa dữ liệu.
- **D:** Sai vì Glacier Deep Archive là lớp lưu trữ giá rẻ, không tự động ngăn chặn việc xóa object trừ khi kết hợp S3 Object Lock hoặc Glacier Vault Lock.

</details>

### Câu 9 `medium`

An engineering team needs to connect to Linux Amazon EC2 instances in private subnets for troubleshooting without opening inbound SSH port 22 in Security Groups, without deploying bastion hosts, and while logging all shell commands to Amazon S3 for auditing. Which solution meets these requirements?

- **A.** Deploy an EC2 bastion host in a public subnet, open SSH port 22, and enable VPC Flow Logs for auditing.
- **B.** Use AWS Systems Manager Session Manager with an EC2 IAM instance profile and session logging to Amazon S3.
- **C.** Use EC2 Instance Connect in the private subnet with a Security Group rule allowing `0.0.0.0/0` on port 22.
- **D.** Configure AWS Direct Connect to SSH directly into the private IP addresses of the EC2 instances.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ kỹ sư cần kết nối tới các Linux Amazon EC2 instance trong private subnet để khắc phục sự cố mà không mở cổng SSH 22 chiều vào trong Security Group, không triển khai bastion host, đồng thời ghi nhật ký toàn bộ các lệnh shell vào Amazon S3 để kiểm toán. Giải pháp nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **B**

Mẫu câu hỏi kinh điển của SAA-C03: **Truy cập EC2 không mở port 22, không bastion host, có audit log câu lệnh** -> **AWS Systems Manager Session Manager**.

- **A:** Sai vì vẫn cần bastion host, vẫn phải mở port 22 nội bộ và VPC Flow Logs chỉ ghi metadata mạng chứ không ghi được các lệnh shell đã chạy.
- **B (Đúng):** Đúng! AWS Systems Manager Session Manager cho phép mở shell bảo mật qua IAM mà không cần mở port 22 hay dùng bastion host, đồng thời hỗ trợ ghi log toàn bộ phiên làm việc lên S3 hoặc CloudWatch Logs.
- **C:** Sai vì phải mở port 22 và không có tính năng ghi log toàn bộ câu lệnh shell như Session Manager.
- **D:** Sai vì vẫn phải mở port 22 trên Security Group và tốn chi phí thiết lập Direct Connect.

</details>

### Câu 10 `medium`

A compliance team wants to ensure that every Amazon EBS volume created in an AWS account is encrypted by default, and that any Amazon S3 bucket accidentally made public is automatically detected and remediated within minutes. Which combination of services/features achieves this?

- **A.** Use Amazon Inspector to automatically encrypt existing EBS volumes and block public S3 buckets.
- **B.** Enable Amazon Macie across the account to automatically remediate unencrypted EBS volumes and S3 ACLs.
- **C.** Configure AWS CloudTrail management trails to automatically block unencrypted EBS volume creation API calls.
- **D.** Enable EBS encryption by default, enable S3 Block Public Access, and use AWS Config with SSM Automation.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm tuân thủ muốn đảm bảo mọi Amazon EBS volume được tạo trong một AWS account đều được mã hóa theo mặc định, và bất kỳ Amazon S3 bucket nào vô tình bị đặt ở chế độ công khai sẽ được tự động phát hiện và khắc phục trong vài phút. Sự kết hợp dịch vụ/tính năng nào đạt được điều này?

**Đáp án đúng:** **D**

Kiểm soát tuân thủ cấu hình (compliance & auto-remediation) là thế mạnh của **AWS Config** kết hợp **SSM Automation**, cùng với các thiết lập cấp tài khoản như **EBS encryption by default** và **S3 Block Public Access**.

- **A:** Sai vì Amazon Inspector chỉ quét lỗ hổng phần mềm, không thực thi mã hóa EBS hay chặn public S3.
- **B:** Sai vì Macie chỉ phát hiện dữ liệu nhạy cảm trên S3, không quản lý mã hóa EBS.
- **C:** Sai vì CloudTrail chỉ ghi log API calls chứ không có khả năng chặn hay sửa cấu hình tài nguyên.
- **D (Đúng):** Đúng! Bật EBS encryption by default đảm bảo mọi volume mới tự động mã hóa. S3 Block Public Access cấp tài khoản ngăn chặn public bucket, và AWS Config + SSM Automation giúp phát hiện và tự động khắc phục vi phạm cấu hình.

</details>

### Câu 11 `medium`

An operations team wants to automatically trigger an AWS Lambda remediation script whenever an Amazon EC2 instance state changes to `stopped` or whenever an AWS Health event occurs, as well as route custom application events from a third-party SaaS partner (like Zendesk) to different targets based on event payload filtering. Which AWS service should they use?

- **A.** Amazon SNS
- **B.** Amazon EventBridge
- **C.** Amazon SQS FIFO
- **D.** AWS CloudFormation

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm vận hành muốn tự động kích hoạt một tập lệnh khắc phục AWS Lambda bất cứ khi nào trạng thái Amazon EC2 instance chuyển sang `stopped` hoặc khi xảy ra sự kiện AWS Health, đồng thời định tuyến các sự kiện ứng dụng tùy chỉnh từ đối tác SaaS bên thứ ba (như Zendesk) tới các đích khác nhau dựa trên bộ lọc payload sự kiện. Họ nên sử dụng dịch vụ AWS nào?

**Đáp án đúng:** **B**

Nhớ ngay: **Bắt sự kiện AWS (EC2 state, Health, Trusted Advisor) + SaaS Partner Events + Content-based filtering** -> **Amazon EventBridge**.

- **A:** Sai vì SNS không tự nhận sự kiện hệ thống từ EC2/AWS Health hay tích hợp trực tiếp đối tác SaaS như EventBridge.
- **B (Đúng):** Đúng! Amazon EventBridge (tiền thân là CloudWatch Events) tích hợp gốc với các sự kiện AWS services (EC2 state change, AWS Health), hỗ trợ SaaS partner events (Zendesk, Datadog, Auth0) và lọc nội dung payload nâng cao.
- **C:** Sai vì SQS là hàng đợi message, không phải event bus bắt sự kiện hệ thống và SaaS.
- **D:** Sai vì CloudFormation là công cụ Infrastructure as Code.

</details>

### Câu 12 `medium`

A healthcare organization must retain 500 TB of medical imaging archives for 10 years to satisfy legal regulations. The files are almost never accessed, and if an audit requires a file, a retrieval time of 12 to 48 hours is completely acceptable. Which Amazon S3 storage class minimizes storage costs?

- **A.** Amazon S3 Glacier Flexible Retrieval
- **B.** Amazon S3 Glacier Deep Archive
- **C.** Amazon S3 Glacier Instant Retrieval
- **D.** Amazon S3 Standard-IA

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức y tế phải lưu giữ 500 TB kho lưu trữ hình ảnh y tế trong 10 năm để đáp ứng các quy định pháp lý. Các tệp hầu như không bao giờ được truy cập, và nếu một cuộc kiểm toán yêu cầu tệp, thời gian truy xuất từ 12 đến 48 giờ là hoàn toàn chấp nhận được. Lớp lưu trữ Amazon S3 nào giúp giảm thiểu tối đa chi phí lưu trữ?

**Đáp án đúng:** **B**

Bảng giá S3 từ cao xuống thấp: Standard -> Intelligent-Tiering / Standard-IA -> One Zone-IA -> Glacier Instant Retrieval -> Glacier Flexible Retrieval -> **Glacier Deep Archive (rẻ nhất, 12-48h retrieval)**.

- **A:** Sai vì Glacier Flexible Retrieval đắt hơn Glacier Deep Archive khoảng 3-4 lần (dành cho nhu cầu lấy dữ liệu trong vài phút đến vài giờ).
- **B (Đúng):** Đúng! S3 Glacier Deep Archive là lớp lưu trữ rẻ nhất trên AWS (~$0.00099/GB/tháng), phù hợp cho dữ liệu lưu trữ dài hạn 7-10 năm và chấp nhận thời gian truy xuất từ 12 giờ (Standard) đến 48 giờ (Bulk).
- **C:** Sai vì Glacier Instant Retrieval đắt hơn để đổi lấy khả năng truy xuất tức thì theo mili-giây.
- **D:** Sai vì S3 Standard-IA đắt hơn nhiều so với Glacier Deep Archive.

</details>

---

[Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md)
