# Bài tập tình huống — Systems Manager Suite & EC2 Image Builder

> SSM State Manager, Patch Manager, Distributor, Run Command, Session Manager, Maintenance Windows và EC2 Image Builder Golden AMI Pipeline.
> **Số câu hỏi:** 12 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A security compliance policy mandates that all Amazon EC2 Linux instances must receive critical security patches within 7 days of release. Development instances must be patched every Tuesday at 02:00 UTC, while Production instances must be patched every Sunday at 03:00 UTC only after patches have been vetted for 5 days in Development. Both environments run hundreds of instances with dynamic scaling. What is the MOST operationally efficient solution?

- **A.** Use Amazon EventBridge Scheduler to trigger an AWS Lambda function that connects via SSH to each EC2 instance and runs yum update --security.
- **B.** Configure an EC2 Image Builder pipeline to rebuild golden AMIs daily and manually terminate all running EC2 instances every Sunday night.
- **C.** Create SSM Patch Baselines (ApproveAfterDays: 0 for Dev, 5 for Prod), assign Patch Groups by EC2 tags, and schedule AWS-RunPatchBaseline via Maintenance Windows.
- **D.** Enable Amazon Inspector on all EC2 instances and configure Inspector to automatically install missing OS security patches on a weekly schedule.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một chính sách tuân thủ bảo mật yêu cầu tất cả các Amazon EC2 Linux instance phải nhận các bản vá bảo mật quan trọng trong vòng 7 ngày kể từ khi phát hành. Các instance Development phải được vá vào mỗi Thứ Ba lúc 02:00 UTC, trong khi các instance Production phải được vá vào mỗi Chủ Nhật lúc 03:00 UTC chỉ sau khi các bản vá đã được kiểm nghiệm 5 ngày trên Development. Cả hai môi trường đều chạy hàng trăm instance với khả năng scale động. Giải pháp hiệu quả về mặt vận hành NHẤT là gì?

**Đáp án đúng:** **C**

AWS Systems Manager Patch Manager kết hợp Patch Baseline (quy tắc duyệt bản vá theo ApproveAfterDays), Patch Group (phân nhóm instance bằng tag 'Patch Group') và Maintenance Window (lịch chạy tự động AWS-RunPatchBaseline) là giải pháp chuẩn để quản trị bản vá ở quy mô lớn.

- **A:** Sai. Dùng SSH qua Lambda kém bảo mật, khó quản lý khóa SSH, bị giới hạn timeout 15 phút và không quản lý được trạng thái tuân thủ (patch compliance) tập trung.
- **B:** Sai. Terminate thủ công toàn bộ instance không đáp ứng yêu cầu tự động và hiệu quả vận hành, đồng thời không kiểm soát được việc vá đúng tiến độ 5 ngày sau Dev.
- **C (Đúng):** Chính xác! Kết hợp Custom Patch Baselines (ApproveAfterDays khác nhau), Patch Groups (gắn theo tag Patch Group trên EC2) và SSM Maintenance Windows là kiến trúc chuẩn của Systems Manager Patch Manager để tự động vá lỗi theo lịch riêng biệt giữa Dev và Prod.
- **D:** Sai. Amazon Inspector chỉ phát hiện lỗ hổng (vulnerability scanning), không có chức năng tự động cài đặt bản vá hệ điều hành.

</details>

### Câu 2 `hard`

A centralized platform team builds hardened golden Amazon Machine Images (AMIs) using EC2 Image Builder in a Shared Services account. The pipeline must automatically run custom CIS benchmark validation tests before distributing the encrypted AMI to all accounts in the Production Organizational Unit (OU) across us-east-1 and eu-west-1. However, Production accounts fail to launch EC2 instances from the shared AMI with an error indicating they cannot access the encrypted EBS snapshot. What must the platform team configure?

- **A.** Disable EBS volume encryption in the EC2 Image Builder recipe so the shared AMI can be launched in any Production account without KMS key permissions.
- **B.** Attach an IAM policy to the EC2 Image Builder instance profile granting ec2:ModifyImageAttribute permissions across all Production member accounts.
- **C.** Export the hardened AMI as a VMDK image to Amazon S3 and import it separately into every Production account using AWS VM Import/Export.
- **D.** Configure Image Builder distribution to encrypt AMIs with a KMS CMK per Region, and grant kms:CreateGrant and kms:Decrypt via aws:PrincipalOrgPaths.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm nền tảng tập trung build các golden Amazon Machine Image (AMI) đã được hardening bằng EC2 Image Builder trong tài khoản Shared Services. Pipeline phải tự động chạy các bài kiểm thử xác thực CIS benchmark tùy chỉnh trước khi phân phối AMI đã mã hóa tới tất cả tài khoản trong Production Organizational Unit (OU) trên us-east-1 và eu-west-1. Tuy nhiên, các tài khoản Production không thể khởi chạy EC2 instance từ AMI được chia sẻ với lỗi cho biết họ không thể truy cập EBS snapshot đã mã hóa. Nhóm nền tảng phải cấu hình gì?

**Đáp án đúng:** **D**

Khi chia sẻ encrypted AMI qua EC2 Image Builder đến nhiều tài khoản/OU trong AWS Organizations, bắt buộc phải mã hóa bằng Customer Managed KMS Key (CMK) thay vì aws/ebs, đồng thời cấp quyền KMS trên Key Policy cho các tài khoản đích (dùng aws:PrincipalOrgID hoặc aws:PrincipalOrgPaths).

- **A:** Sai. Tắt mã hóa EBS vi phạm yêu cầu bảo mật (encrypted AMI) của bài toán.
- **B:** Sai. Lỗi xảy ra khi Production account không giải mã được EBS snapshot, không phải lỗi chia sẻ AMI attribute.
- **C:** Sai. Quá rườm rà và tốn kém vận hành trong khi EC2 Image Builder hỗ trợ chia sẻ AMI cross-account và cross-region native thông qua Distribution Settings.
- **D (Đúng):** Chính xác! AMI mã hóa bằng AWS managed key (aws/ebs) không thể chia sẻ cross-account. Phải dùng Customer Managed KMS Key (CMK) trong Distribution Configuration và cấp quyền sử dụng key (kms:Decrypt, kms:ReEncrypt*, kms:CreateGrant, kms:DescribeKey) cho các tài khoản trong Production OU thông qua điều kiện aws:PrincipalOrgPaths.

</details>

### Câu 3 `hard`

A DevOps engineer builds an AWS CloudFormation Custom Resource backed by an AWS Lambda function to look up the latest approved golden AMI ID from an internal catalog API during stack creation. During testing, CloudWatch Logs confirm the Lambda function completed in 2 seconds with no errors, yet the CloudFormation stack remains stuck in CREATE_IN_PROGRESS for 1 hour before timing out and rolling back. What is the root cause?

- **A.** The Lambda function timeout is configured as 30 seconds instead of the maximum 15-minute AWS Lambda execution timeout.
- **B.** The Lambda function returned the AMI ID directly instead of sending an HTTP PUT JSON payload to the presigned S3 ResponseURL in the event.
- **C.** CloudFormation Custom Resources can only be backed by Amazon SNS topics and do not support AWS Lambda function ARNs as custom ServiceTokens.
- **D.** The CloudFormation template is missing a CreationPolicy with ResourceSignal Count and Timeout attributes on the Custom Resource.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư DevOps xây dựng một AWS CloudFormation Custom Resource được hỗ trợ bởi một AWS Lambda function để tra cứu ID của golden AMI được phê duyệt mới nhất từ một API danh mục nội bộ trong quá trình tạo stack. Khi kiểm thử, CloudWatch Logs xác nhận Lambda function hoàn tất trong 2 giây mà không có lỗi, nhưng CloudFormation stack vẫn bị kẹt ở trạng thái CREATE_IN_PROGRESS trong 1 giờ trước khi hết thời gian chờ (timeout) và rollback. Nguyên nhân gốc rễ là gì?

**Đáp án đúng:** **B**

Lỗi treo 1 giờ (1-hour hang) khi tạo hoặc xóa CloudFormation Custom Resource gần như luôn do Lambda không gửi HTTP PUT phản hồi (hoặc gửi sai format / không xử lý trường hợp exception / không xử lý RequestType Delete) về presigned `ResponseURL` do CloudFormation cung cấp.

- **A:** Sai. Lambda đã chạy xong trong 2 giây không lỗi, nên không liên quan đến timeout của Lambda.
- **B (Đúng):** Chính xác! CloudFormation Custom Resource giao tiếp bất đồng bộ: CloudFormation truyền một presigned S3 URL trong trường ResponseURL của event. Lambda BẮT BUỘC phải gửi HTTP PUT kèm JSON body (Status: SUCCESS/FAILED, PhysicalResourceId, StackId, RequestId, LogicalResourceId, Data) tới ResponseURL đó. Nếu chỉ return giá trị thông thường, CloudFormation sẽ chờ mãi đến khi timeout (1 giờ).
- **C:** Sai. Custom Resources hỗ trợ cả AWS Lambda ARN và Amazon SNS Topic ARN làm ServiceToken.
- **D:** Sai. Custom Resource không dùng CreationPolicy/cfn-signal mà dùng cơ chế PUT tới ResponseURL.

</details>

### Câu 4 `medium`

A hybrid enterprise manages 400 Amazon EC2 instances and 150 on-premises Linux servers. Security policy requires that an internal custom security agent be installed on all servers, automatically updated whenever a new package version is published, and re-applied every 30 minutes if anyone manually stops or alters the agent configuration. Which TWO AWS Systems Manager capabilities should the team combine to meet these requirements? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Package the custom security agent using AWS Systems Manager Distributor so it can be versioned and installed across managed nodes.
- **B.** Use AWS Systems Manager Patch Manager with custom Patch Baselines to package and deploy the custom third-party security agent across servers.
- **C.** Create an SSM State Manager association targeting nodes by tag with AWS-ConfigureAWSPackage on a 30-minute rate schedule.
- **D.** Use EC2 User Data bash scripts to enforce the custom agent configuration every 30 minutes on both EC2 and on-premises servers.
- **E.** Configure AWS OpsWorks Stacks with custom Chef recipes to deploy the security agent to on-premises servers over SSH.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp hybrid quản lý 400 Amazon EC2 instance và 150 máy chủ Linux tại chỗ (on-premises). Chính sách bảo mật yêu cầu một security agent tùy chỉnh nội bộ phải được cài đặt trên tất cả các máy chủ, tự động cập nhật bất cứ khi nào phiên bản gói mới được phát hành và được áp dụng lại mỗi 30 phút nếu có ai đó dừng thủ công hoặc thay đổi cấu hình agent. Nhóm nên kết hợp HAI tính năng nào của AWS Systems Manager để đáp ứng các yêu cầu này? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, C**

Bộ đôi AWS Systems Manager Distributor (đóng gói và phân phối phần mềm/agent có phiên bản) + State Manager (duy trì trạng thái cấu hình định kỳ chống drift) hoạt động đồng nhất trên cả EC2 và máy chủ on-premises (qua SSM Hybrid Activations).

- **A (Đúng):** Chính xác! SSM Distributor chuyên dùng để đóng gói, quản lý phiên bản và phân phối phần mềm/agent tùy chỉnh cho cả EC2 và máy chủ on-premises đã kích hoạt hybrid activation.
- **B:** Sai. Patch Manager dùng để vá hệ điều hành và các ứng dụng chuẩn từ OS repository, không dùng để đóng gói và phân phối custom internal agent như Distributor.
- **C (Đúng):** Chính xác! SSM State Manager đảm bảo trạng thái cấu hình liên tục (continuous configuration enforcement) bằng cách chạy lại association định kỳ mỗi 30 phút (dùng document AWS-ConfigureAWSPackage) trên cả EC2 và on-premises managed nodes.
- **D:** Sai. EC2 User Data chỉ chạy một lần lúc khởi tạo instance (first boot) và không áp dụng được cho máy chủ on-premises.
- **E:** Sai. OpsWorks Stacks đã ngừng hoạt động (deprecated/EOL) và không phải kiến trúc chuẩn hiện đại trên AWS Systems Manager.

</details>

### Câu 5 `hard`

A networking team manages a shared VPC CloudFormation stack that exports Subnet IDs and Security Group IDs using Outputs with Export names. Ten application stacks reference these values via Fn::ImportValue. When the networking team attempts to replace an exported Subnet in the shared VPC stack, CloudFormation blocks the update with the error: 'Export cannot be updated as it is in use by another stack'. How should the organization redesign cross-stack referencing to eliminate this tight coupling?

- **A.** Convert all ten application stacks and the shared VPC networking stack into a single monolithic CloudFormation stack.
- **B.** Add DeletionPolicy: Retain and UpdateReplacePolicy: Retain to the Outputs Export section of the networking CloudFormation template.
- **C.** Write Subnet and Security Group IDs to SSM Parameter Store from the networking stack, and read them via SSM dynamic references.
- **D.** Use CloudFormation StackSets to force-overwrite the exported Subnet ID across all ten application stacks simultaneously.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm mạng quản lý một VPC CloudFormation stack dùng chung xuất các Subnet ID và Security Group ID bằng Outputs với các tên Export. Mười stack ứng dụng tham chiếu các giá trị này thông qua Fn::ImportValue. Khi nhóm mạng cố gắng thay thế một Subnet đã xuất trong VPC stack dùng chung, CloudFormation chặn bản cập nhật với lỗi: 'Export cannot be updated as it is in use by another stack'. Tổ chức nên thiết kế lại việc tham chiếu chéo giữa các stack như thế nào để loại bỏ sự phụ thuộc chặt chẽ (tight coupling) này?

**Đáp án đúng:** **C**

CloudFormation Exports (`Fn::ImportValue`) tạo ra liên kết cứng (hard coupling): không thể sửa hay xóa Export khi vẫn còn stack khác đang import. Thực hành tốt nhất (best practice) trong DOP-C02 là xuất giá trị vào AWS Systems Manager Parameter Store để các stack tiêu thụ độc lập.

- **A:** Sai. Gom toàn bộ hạ tầng mạng và 10 ứng dụng vào một stack khổng lồ làm tăng blast radius, dễ vượt giới hạn 500 tài nguyên/stack và phá vỡ ranh giới quyền sở hữu giữa các đội.
- **B:** Sai. DeletionPolicy chỉ áp dụng cho Resources, không áp dụng cho Outputs/Exports và không gỡ bỏ ràng buộc của Fn::ImportValue.
- **C (Đúng):** Chính xác! Dùng SSM Parameter Store để lưu trữ và trao đổi giá trị giữa các stack giúp tách rời (decouple) vòng đời giữa networking stack và application stacks, loại bỏ hoàn toàn lỗi khóa cứng 'Export is in use by another stack' của Fn::ImportValue.
- **D:** Sai. StackSets không vượt qua được ràng buộc Export/ImportValue nội bộ của CloudFormation.

</details>

### Câu 6 `hard`

An operations team manages 600 Amazon EC2 instances tagged with Environment=Production across multiple Availability Zones. They need to run an AWS Systems Manager (SSM) Automation runbook to apply an OS kernel configuration update only during approved Sunday maintenance windows. To prevent a fleet-wide outage, the update must run on no more than 10% of instances at a time and automatically halt if more than 2 instances fail. Furthermore, any ad-hoc execution of this runbook outside the scheduled window must require formal approval from an operations manager before executing. Which TWO SSM capabilities should the team configure? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Use AWS Systems Manager State Manager with a 30-minute cron association and set ComplianceSeverity to CRITICAL for all production nodes.
- **B.** Register the SSM Automation runbook in a Maintenance Window targeting Environment=Production with MaxConcurrency=10% and MaxErrors=2.
- **C.** Enable AWS Systems Manager Session Manager logging to an encrypted Amazon S3 bucket to automatically block concurrent runbook executions.
- **D.** Use AWS Systems Manager Inventory to automatically pause EC2 instances whenever kernel updates fail during scheduled maintenance windows.
- **E.** Configure SSM Change Manager with a Change Template specifying the runbook and the operations manager IAM group as required approver.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm vận hành quản lý 600 Amazon EC2 instance được gắn thẻ Environment=Production trên nhiều Availability Zone. Họ cần chạy một AWS Systems Manager (SSM) Automation runbook để áp dụng bản cập nhật cấu hình kernel OS chỉ trong các khung giờ bảo trì Chủ Nhật đã được phê duyệt. Để ngăn sự cố trên toàn hệ thống, bản cập nhật chỉ được chạy trên tối đa 10% số instance cùng một lúc và tự động dừng nếu có hơn 2 instance thất bại. Hơn nữa, bất kỳ lần thực thi ad-hoc nào của runbook này ngoài khung giờ đã lên lịch đều phải có sự phê duyệt chính thức từ quản lý vận hành trước khi thực thi. Nhóm nên cấu hình HAI tính năng SSM nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, E**

Hệ sinh thái AWS Systems Manager tách biệt rõ vai trò: Maintenance Windows + Rate Controls (MaxConcurrency/MaxErrors) kiểm soát lịch chạy và bán kính ảnh hưởng (blast radius), trong khi Change Manager quản lý quy trình phê duyệt (approval workflow) cho các thay đổi hạ tầng.

- **A:** Sai. State Manager dùng để duy trì trạng thái cấu hình liên tục theo chu kỳ, không có quy trình phê duyệt thay đổi (approval workflow) và không phù hợp cho việc chỉ chạy một lần trong khung bảo trì Chủ nhật.
- **B (Đúng):** Chính xác! SSM Maintenance Windows kết hợp Rate Controls (MaxConcurrency=10%, MaxErrors=2) đảm bảo runbook chỉ chạy trong khung giờ bảo trì Chủ nhật, giới hạn tốc độ triển khai và tự động dừng ngay nếu có hơn 2 instance lỗi.
- **C:** Sai. Session Manager chỉ dùng để truy cập shell tương tác và ghi log phiên làm việc, không điều phối rate control hay phê duyệt runbook.
- **D:** Sai. SSM Inventory chỉ thu thập metadata (OS, phần mềm, bản vá) chứ không thực thi hay tạm dừng runbook.
- **E (Đúng):** Chính xác! SSM Change Manager cung cấp quy trình phê duyệt thay đổi (Change Template -> Change Request -> Approval) trước khi thực thi Automation runbook, đáp ứng yêu cầu kiểm duyệt cho các lần chạy ngoài lịch.

</details>

### Câu 7 `medium`

A platform team uses EC2 Image Builder to produce hardened golden Amazon Linux and Windows AMIs every week and distributes them to 40 AWS accounts in AWS Organizations. Over the past two years, hundreds of outdated AMIs and their underlying EBS snapshots have accumulated, inflating storage costs and cluttering the AMI catalog. The team wants an automated, native mechanism to deprecate AMIs older than 30 days, disable them after 60 days, and permanently deregister AMIs along with deleting their EBS snapshots after 90 days—while always retaining at least the 3 most recent AMIs per recipe. What should the engineer configure?

- **A.** Write an AWS Lambda function triggered by EventBridge every night to list all AMIs, parse creation dates, deregister old AMIs, and manually delete EBS snapshots.
- **B.** Configure Image Builder Lifecycle Policies by recipe/tags to deprecate at 30 days, disable at 60, and delete AMIs/snapshots at 90, retaining 3.
- **C.** Configure Amazon S3 Lifecycle expiration and transition rules on the EC2 Image Builder build logs bucket to clean up old artifacts.
- **D.** Enable AWS Backup vault retention policies directly on the EC2 Image Builder pipeline ARN to expire old golden AMIs automatically.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm nền tảng sử dụng EC2 Image Builder để tạo các golden Amazon Linux và Windows AMI đã được hardening mỗi tuần và phân phối chúng tới 40 tài khoản AWS trong AWS Organizations. Trong hai năm qua, hàng trăm AMI lỗi thời và các EBS snapshot bên dưới của chúng đã tích tụ, làm tăng chi phí lưu trữ và gây lộn xộn danh mục AMI. Nhóm muốn một cơ chế nguyên bản tự động để đánh dấu lỗi thời (deprecate) các AMI cũ hơn 30 ngày, vô hiệu hóa (disable) chúng sau 60 ngày và hủy đăng ký (deregister) vĩnh viễn các AMI cùng với xóa EBS snapshot của chúng sau 90 ngày—trong khi luôn giữ lại ít nhất 3 AMI gần nhất cho mỗi recipe. Kỹ sư nên cấu hình gì?

**Đáp án đúng:** **B**

EC2 Image Builder Lifecycle Policies tự động hóa trọn vòng đời golden AMI (Deprecate -> Disable -> Delete AMI & EBS Snapshots) dựa trên tuổi hoặc số lượng, hỗ trợ giữ lại tối thiểu số bản mới nhất và bảo vệ các AMI đang được Auto Scaling/Launch Templates sử dụng.

- **A:** Sai. Tự viết và duy trì Lambda script dọn dẹp AMI/snapshot dễ gặp lỗi race condition và tốn công vận hành hơn nhiều so với EC2 Image Builder Lifecycle Policies tích hợp sẵn.
- **B (Đúng):** Chính xác! EC2 Image Builder Lifecycle Policies hỗ trợ gốc các quy tắc tự động deprecate, disable và delete AMI (kèm xóa EBS snapshot liên kết) theo độ tuổi hoặc số lượng, đồng thời có tùy chọn retain-at-least để luôn giữ lại tối thiểu N bản AMI mới nhất.
- **C:** Sai. S3 Lifecycle chỉ xóa log build trên S3, không deregister AMI hay xóa EBS snapshots.
- **D:** Sai. AWS Backup không quản lý vòng đời deprecate/disable/deregister các AMI do EC2 Image Builder tạo ra.

</details>

### Câu 8 `medium`

A security auditor requests a centralized, queryable report of every installed OS package, application version, and patch compliance status across 1,500 Amazon EC2 instances and on-premises hybrid servers spread across 25 AWS accounts and 3 Regions. The DevOps team already has AWS Systems Manager Agent installed on all instances. Which solution provides this centralized reporting with the LEAST operational effort?

- **A.** Use SSH and WinRM scripts from a central bastion host to run rpm -qa and Get-WmiObject nightly across all 1,500 servers in 25 accounts.
- **B.** Enable Amazon CloudWatch Agent custom metrics to publish every installed OS package name and version as a CloudWatch Metric dimension.
- **C.** Query AWS CloudTrail management logs in Amazon Athena to determine which OS packages and software versions are installed inside each instance.
- **D.** Configure SSM Inventory across accounts/Regions with SSM Resource Data Sync to a central S3 bucket, and query via Athena and QuickSight.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiểm toán viên bảo mật yêu cầu một báo cáo tập trung, có thể truy vấn được về mọi gói OS đã cài đặt, phiên bản ứng dụng và trạng thái tuân thủ bản vá trên 1.500 Amazon EC2 instance và máy chủ hybrid tại chỗ trải rộng trên 25 tài khoản AWS và 3 Region. Nhóm DevOps đã cài đặt sẵn AWS Systems Manager Agent trên tất cả các instance. Giải pháp nào cung cấp báo cáo tập trung này với ÍT nỗ lực vận hành nhất?

**Đáp án đúng:** **D**

AWS Systems Manager Inventory + Resource Data Sync (đẩy về S3 trung tâm) kết hợp Amazon Athena và QuickSight là kiến trúc chuẩn cho báo cáo kiểm kê phần mềm và trạng thái vá lỗi quy mô đa tài khoản, đa Region và hybrid.

- **A:** Sai. Tự chạy SSH/WinRM xuyên 25 tài khoản và 3 Region kém an toàn, khó bảo trì và không tận dụng hạ tầng SSM đã cài sẵn.
- **B:** Sai. CloudWatch Metrics dành cho dữ liệu chuỗi thời gian số học, không dùng để lưu danh sách hàng trăm gói phần mềm/phiên bản dạng text (sẽ gây bùng nổ chi phí custom metrics).
- **C:** Sai. CloudTrail chỉ ghi lại lệnh gọi AWS API, hoàn toàn không biết các gói phần mềm cài bên trong hệ điều hành EC2.
- **D (Đúng):** Chính xác! SSM Inventory tự động thu thập danh sách phần mềm, bản vá, cấu hình mạng trên cả EC2 và hybrid managed nodes. SSM Resource Data Sync tự động đồng bộ toàn bộ dữ liệu đa tài khoản/đa Region về một S3 bucket tập trung dưới dạng JSON tối ưu để truy vấn ngay bằng Amazon Athena và trực quan hóa trên QuickSight.

</details>

### Câu 9 `medium`

An enterprise operates 300 Amazon Linux and Windows EC2 instances split into Development and Production environments. Security policy requires that Critical and Security OS patches be automatically installed on Development instances 2 days after vendor release, and on Production instances 7 days after release—only during Sunday maintenance windows—while non-security updates are excluded. Additionally, operations wants a daily compliance scan without rebooting servers. How should the DevOps engineer configure AWS Systems Manager Patch Manager?

- **A.** Use AWS-DefaultPatchBaseline for both Dev and Prod environments and schedule yum update -y via Linux cron on every managed EC2 server.
- **B.** Create Dev (2-day) and Prod (7-day) Critical/Security Patch Baselines, assign Patch Groups, scan daily via State Manager, and install Sunday.
- **C.** Schedule AWS-RunPatchBaseline with Operation=Install every day at noon across both Dev and Prod with RebootOption=RebootIfNeeded.
- **D.** Use EC2 Image Builder pipelines to patch and reboot running Dev and Prod EC2 instances in place without changing their instance IDs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp vận hành 300 Amazon Linux và Windows EC2 instance được chia thành môi trường Development và Production. Chính sách bảo mật yêu cầu các bản vá OS mức Critical và Security phải tự động được cài đặt trên các instance Development sau 2 ngày kể từ khi nhà cung cấp phát hành, và trên các instance Production sau 7 ngày kể từ khi phát hành—chỉ trong các khung giờ bảo trì Chủ Nhật—trong khi các bản cập nhật không liên quan đến bảo mật bị loại trừ. Ngoài ra, bộ phận vận hành muốn quét tuân thủ hàng ngày mà không khởi động lại máy chủ. Kỹ sư DevOps nên cấu hình AWS Systems Manager Patch Manager như thế nào?

**Đáp án đúng:** **B**

AWS Systems Manager Patch Manager quản lý vá lỗi đa môi trường chuẩn thông qua Custom Patch Baselines (approval delay + classification filters) ánh xạ với tag 'Patch Group', kết hợp Operation=Scan hàng ngày và Operation=Install trong Maintenance Window.

- **A:** Sai. AWS-DefaultPatchBaseline không thể tách riêng độ trễ phê duyệt 2 ngày vs 7 ngày, và chạy yum update thủ công qua cron không ghi nhận trạng thái tuân thủ vào SSM Compliance.
- **B (Đúng):** Chính xác! Custom Patch Baselines hỗ trợ thiết lập auto-approval delay (2 ngày cho Dev, 7 ngày cho Prod) và lọc chỉ Critical/Security. Gắn Patch Baseline với Patch Group tương ứng tag 'Patch Group' trên EC2. Dùng State Manager (Operation=Scan) để quét tuân thủ hàng ngày không reboot và Maintenance Window (Operation=Install) để cài đặt vào Chủ nhật.
- **C:** Sai. Cài đặt và reboot hàng ngày lúc trưa vi phạm yêu cầu chỉ cài vào khung bảo trì Chủ nhật và quét hàng ngày không reboot.
- **D:** Sai. EC2 Image Builder tạo AMI mới (immutable), không thực hiện vá lỗi trực tiếp (in-place) trên các EC2 instance đang chạy.

</details>

### Câu 10 `medium`

A security team built a proprietary endpoint telemetry agent (packaged for Linux RPM/DEB and Windows MSI) that must be installed, version-controlled, and kept continuously up to date across 800 Amazon EC2 instances and on-premises servers managed by AWS Systems Manager. Whenever a new agent version is released, the team wants to deploy it automatically to all existing servers as well as any newly launched EC2 instances without baking a new AMI immediately. Which TWO AWS Systems Manager features should they combine? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Package and version the proprietary agent (Linux and Windows) using SSM Distributor, storing the package artifacts in Amazon S3.
- **B.** Use AWS Systems Manager Session Manager to manually open interactive shells on each of the 800 servers and run curl install scripts.
- **C.** Use AWS Systems Manager Parameter Store Advanced Tier to store the 150 MB binary MSI and RPM agent installers for distribution.
- **D.** Create an SSM State Manager association running AWS-ConfigureAWSPackage by tag so existing and new instances install the agent.
- **E.** Use AWS Systems Manager Patch Manager with custom Patch Baselines to distribute proprietary MSI and RPM agent packages.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm bảo mật đã xây dựng một endpoint telemetry agent độc quyền (được đóng gói cho Linux RPM/DEB và Windows MSI) phải được cài đặt, quản lý phiên bản và liên tục cập nhật trên 800 Amazon EC2 instance và máy chủ tại chỗ được quản lý bởi AWS Systems Manager. Mỗi khi một phiên bản agent mới được phát hành, nhóm muốn tự động triển khai nó tới tất cả các máy chủ hiện có cũng như bất kỳ EC2 instance mới khởi chạy nào mà không cần tạo AMI mới ngay lập tức. Họ nên kết hợp HAI tính năng AWS Systems Manager nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, D**

AWS Systems Manager Distributor (đóng gói & quản lý phiên bản phần mềm nội bộ đa OS) kết hợp SSM State Manager (tài liệu AWS-ConfigureAWSPackage) là giải pháp chuẩn để phân phối và duy trì liên tục các security/monitoring agent trên quy mô lớn.

- **A (Đúng):** Chính xác! AWS Systems Manager Distributor cho phép đóng gói, quản lý phiên bản các phần mềm/agent nội bộ đa nền tảng (Linux/Windows) với manifest và script cài đặt/gỡ cài đặt chuẩn hóa.
- **B:** Sai. Thao tác thủ công qua Session Manager trên 800 server không thể tự động hóa cho server mới khởi chạy.
- **C:** Sai. Parameter Store chỉ lưu chuỗi cấu hình nhỏ (tối đa 4 KB Standard / 8 KB Advanced), không thể lưu file binary 150 MB.
- **D (Đúng):** Chính xác! SSM State Manager chạy tài liệu AWS-ConfigureAWSPackage theo lịch và khi có instance mới gia nhập giúp đảm bảo cả fleet hiện tại lẫn mọi instance mới khởi chạy đều tự động cài đặt và duy trì đúng phiên bản agent mới nhất.
- **E:** Sai. Patch Manager chuyên cho các bản vá hệ điều hành và phần mềm chuẩn từ repo OS/Microsoft, không phải công cụ đóng gói và phân phối agent nội bộ như SSM Distributor.

</details>

### Câu 11 `medium`

A security team requires that all EC2 instances across 20 AWS accounts run the latest hardened Golden AMI with pre-installed CloudWatch and SSM agents, reducing Auto Scaling boot time from 9 minutes to under 2 minutes. Whenever a new OS patch is released weekly, the AMI must be automatically rebuilt, tested, shared with all 20 accounts, and referenced by Auto Scaling Launch Templates without manual edits. Which architecture should the DevOps engineer implement?

- **A.** Keep a base Amazon Linux AMI in the Launch Template and use an SSM State Manager association to install all patches and agents on every instance launch.
- **B.** Create an EC2 Image Builder pipeline with Organizations distribution, write the AMI ID to SSM Parameter Store, and use resolve:ssm in Launch Templates.
- **C.** Run an AWS Lambda function weekly to launch an EC2 instance, SSH into it to run yum update, call CreateImage, and email the new AMI ID to application teams.
- **D.** Use AWS OpsWorks Stacks with custom Chef recipes to bake hardened AMIs and distribute them via Amazon S3 buckets to all 20 member accounts.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm bảo mật yêu cầu tất cả EC2 instance trên 20 tài khoản AWS phải chạy Golden AMI đã được hardening mới nhất với CloudWatch agent và SSM agent được cài sẵn, giúp giảm thời gian khởi động Auto Scaling từ 9 phút xuống dưới 2 phút. Mỗi khi bản vá OS mới được phát hành hàng tuần, AMI phải được tự động build lại, kiểm thử, chia sẻ với tất cả 20 tài khoản và được Auto Scaling Launch Template tham chiếu mà không cần chỉnh sửa thủ công. Kỹ sư DevOps nên triển khai kiến trúc nào?

**Đáp án đúng:** **B**

EC2 Image Builder + SSM Parameter Store + Launch Template dynamic reference (`resolve:ssm:...`) là mô hình Golden AMI Pipeline tối ưu nhất cho tốc độ scale-out và quản trị bản vá đa tài khoản.

- **A:** Sai. Cài đặt toàn bộ bản vá và agent mỗi khi instance khởi động lại khiến thời gian boot vẫn rất lâu (không đạt mục tiêu dưới 2 phút).
- **B (Đúng):** Chính xác! EC2 Image Builder tự động build, hardening, chạy test kiểm định, phân phối AMI đa tài khoản và cập nhật AMI ID mới nhất vào SSM Parameter Store để Launch Template tự động tham chiếu mà không cần sửa thủ công.
- **C:** Sai. Lambda không phù hợp để SSH và build AMI, đồng thời gửi email thủ công vi phạm yêu cầu tự động hóa hoàn toàn.
- **D:** Sai. OpsWorks Stacks không phải dịch vụ tạo/phân phối Golden AMI chuẩn và đã lỗi thời so với EC2 Image Builder.

</details>

### Câu 12 `medium`

A DevOps team manages a fleet of 400 Linux and Windows EC2 instances in private subnets without bastion hosts. They must automatically enforce that a custom security agent remains installed and running every 30 minutes, and apply approved OS security patches during a Sunday 02:00 UTC window with a maximum concurrency of 10%. Which combination of AWS Systems Manager capabilities should they use?

- **A.** Use SSM Session Manager with an EventBridge schedule to run agent checks every 30 minutes and SSM Parameter Store to deploy OS patches every Sunday.
- **B.** Use AWS Config Rules with SSM remediation to restart the custom agent every 30 minutes and Amazon Inspector to install missing OS patches on Sunday.
- **C.** Use SSM State Manager to enforce the agent every 30 minutes, and SSM Patch Manager with Patch Baselines, Patch Groups, and a Maintenance Window.
- **D.** Use SSM Inventory to install and monitor the security agent every 30 minutes and CloudFormation Drift Detection to patch the operating systems.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm DevOps quản lý đội ngũ 400 Linux và Windows EC2 instance trong các private subnet không có bastion host. Họ phải tự động thực thi việc đảm bảo một security agent tùy chỉnh luôn được cài đặt và chạy mỗi 30 phút, đồng thời áp dụng các bản vá bảo mật OS đã phê duyệt trong khung giờ Chủ Nhật 02:00 UTC với mức đồng thời tối đa là 10%. Họ nên sử dụng kết hợp các tính năng nào của AWS Systems Manager?

**Đáp án đúng:** **C**

Systems Manager tách bạch rõ nhiệm vụ: State Manager chống drift cấu hình định kỳ; Patch Manager + Maintenance Windows vá OS có kiểm soát concurrency/error threshold; không cần SSH hay Bastion Host.

- **A:** Sai. Session Manager chỉ dùng cho truy cập shell tương tác thay thế SSH, còn Parameter Store dùng để lưu cấu hình/biến chứ không vá OS.
- **B:** Sai. AWS Config không quản lý process bên trong OS mỗi 30 phút, và Amazon Inspector chỉ quét phát hiện lỗ hổng CVE chứ không cài đặt bản vá.
- **C (Đúng):** Chính xác! SSM State Manager duy trì trạng thái mong muốn theo chu kỳ (chống configuration drift), còn SSM Patch Manager kết hợp Maintenance Windows quản lý vá lỗi OS an toàn theo Patch Groups và giới hạn concurrency 10%.
- **D:** Sai. SSM Inventory chỉ thu thập thông tin phần mềm/cấu hình, còn CloudFormation Drift Detection không quản lý bản vá bên trong OS.

</details>

---

[Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md)
