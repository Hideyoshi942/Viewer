# Thẻ ghi nhớ (Flashcards) — SCS-C02

> 42 thẻ · Đọc mặt trước, tự trả lời rồi mở đáp án.

## Phát hiện Mối đe dọa: GuardDuty, Security Hub & Amazon Detective

**1. Amazon GuardDuty S3 Protection phát hiện mối đe dọa trên S3 bằng nguồn dữ liệu nào? Có cần bật CloudTrail S3 Data Events trước không?**

<details><summary>Xem đáp án</summary>

GuardDuty S3 Protection tiêu thụ trực tiếp S3 Data Events từ hạ tầng AWS (không cần bạn tự bật hay trả phí CloudTrail S3 Data Events trước). Nó phát hiện truy cập bất thường như: gọi API từ Tor exit node/IP độc hại, vô hiệu hóa S3 Block Public Access, truy xuất dữ liệu bất thường (exfiltration), hoặc thay đổi Bucket Policy đáng ngờ.

</details>

**2. Sự khác biệt giữa GuardDuty EKS Audit Log Monitoring và GuardDuty Runtime Monitoring (EKS/ECS/EC2) là gì?**

<details><summary>Xem đáp án</summary>

EKS Audit Log Monitoring chỉ phân tích Kubernetes API audit logs (control plane) để phát hiện truy cập trái phép vào cluster. Runtime Monitoring cài một eBPF-based security agent ở cấp OS/kernel (tự động quản lý trên EKS, ECS/Fargate, EC2) để phát hiện hành vi độc hại thời gian thực bên trong container/host như reverse shell, container escape, hoặc thực thi binary độc hại.

</details>

**3. Phân biệt nhanh vai trò của Amazon GuardDuty, AWS Security Hub và Amazon Detective?**

<details><summary>Xem đáp án</summary>

GuardDuty = Phát hiện mối đe dọa bằng ML/Threat Intel; Security Hub = Tổng hợp findings theo chuẩn ASFF & kiểm tra tuân thủ (CIS/FSBP/PCI); Detective = Điều tra nguyên nhân gốc rễ bằng đồ thị hành vi lưu tới 12 tháng.

</details>

**4. Làm thế nào để SOC Analyst bấm nút kích hoạt thủ công (human-in-the-loop) một Lambda/SSM Remediation trực tiếp từ giao diện Security Hub?**

<details><summary>Xem đáp án</summary>

Tạo Security Hub Custom Action, sau đó tạo EventBridge Rule khớp event 'Security Hub Findings - Custom Action' theo ARN của Custom Action đó để gọi Lambda hoặc SSM Automation.

</details>

## Ứng phó Sự cố, Forensics & Auto-Remediation

**5. GuardDuty Malware Protection cho EC2 hoạt động như thế nào để quét mã độc mà KHÔNG ảnh hưởng hiệu năng EC2 đang chạy?**

<details><summary>Xem đáp án</summary>

Khi GuardDuty phát hiện finding đáng ngờ trên EC2 (hoặc quét theo yêu cầu), Malware Protection tạo một bản sao snapshot của EBS volume đính kèm, chia sẻ vào tài khoản dịch vụ cô lập của GuardDuty để quét (agentless — không cần cài agent lên EC2), sau đó tự động xóa snapshot (hoặc giữ lại snapshot nếu bật tùy chọn Retain snapshot khi phát hiện mã độc để phục vụ forensics).

</details>

**6. Trước khi cô lập mạng (Isolation SG) một EC2 instance bị xâm nhập thuộc Auto Scaling Group (ASG) để thu thập RAM, bước BẮT BUỘC làm đầu tiên là gì?**

<details><summary>Xem đáp án</summary>

Gọi DetachInstances (hoặc đặt vào Standby) khỏi Auto Scaling Group trước. Nếu không, ASG thấy health check fail sẽ tự động terminate instance và làm mất toàn bộ chứng cứ RAM/EBS.

</details>

**7. Tại sao xóa Trust Policy hoặc gỡ Instance Profile không vô hiệu hóa ngay STS temporary credentials của IAM Role bị lộ? Cách xử lý đúng là gì?**

<details><summary>Xem đáp án</summary>

STS token vẫn có hiệu lực cho tới khi hết hạn. Phải gắn Inline Policy Explicit Deny '*' với Condition DateLessThan trên aws:TokenIssueTime (tính năng Revoke Active Sessions).

</details>

## CloudTrail, CloudTrail Lake & Amazon Security Lake (OCSF)

**8. Cơ chế CloudTrail Log File Integrity Validation hoạt động ra sao để chứng minh file log không bị sửa đổi hay xóa sau khi ghi vào S3?**

<details><summary>Xem đáp án</summary>

CloudTrail tính mã băm SHA-256 cho mỗi log file và mỗi giờ tạo một Digest File chứa hash của các log file đó cùng hash của Digest File trước đó (tạo chuỗi hash chain). Digest File được ký số bằng RSA Private Key của AWS. Kiểm toán viên dùng AWS CLI (aws cloudtrail validate-logs) cùng RSA Public Key để xác minh tính toàn vẹn.

</details>

**9. Phân biệt CloudTrail Management Events, Data Events và Insights Events trong việc giám sát bảo mật?**

<details><summary>Xem đáp án</summary>

Management Events ghi nhận các thao tác Control Plane (CreateUser, RunInstances, PutBucketPolicy) — mặc định bật. Data Events ghi nhận thao tác Data Plane tần suất cao (S3 GetObject/PutObject, Lambda Invoke, DynamoDB) — mặc định TẮT và tính phí riêng. Insights Events dùng ML phát hiện hoạt động API bất thường đột biến về tần suất ghi (API call rate) hoặc tỷ lệ lỗi (API error rate).

</details>

**10. Làm sao cung cấp bằng chứng mật mã rằng CloudTrail logs chưa từng bị sửa đổi và đảm bảo kể cả Root User cũng không xóa được log trong 7 năm?**

<details><summary>Xem đáp án</summary>

Bật CloudTrail Log File Integrity Validation (SHA-256 + RSA digest, kiểm tra qua aws cloudtrail validate-logs) kết hợp S3 Object Lock ở Compliance Mode (7 năm).

</details>

**11. Khi nào chọn Amazon Security Lake thay vì AWS CloudTrail Lake?**

<details><summary>Xem đáp án</summary>

Chọn Amazon Security Lake khi cần gom nhiều loại log (CloudTrail, VPC Flow, Route 53, Security Hub, 3rd-party) và tự động chuẩn hóa về chuẩn mở OCSF (Apache Parquet) cho nhiều công cụ SIEM. CloudTrail Lake chỉ chuyên truy vấn SQL cho CloudTrail/Config events.

</details>

**12. Muốn cảnh báo khi có > 5 lỗi AccessDenied trong vòng 5 phút thì dùng EventBridge hay CloudWatch Logs Metric Filter?**

<details><summary>Xem đáp án</summary>

Dùng CloudTrail -> CloudWatch Logs -> Metric Filter -> CloudWatch Alarm (> 5 trong 5 phút) -> SNS. EventBridge xử lý từng sự kiện đơn lẻ (stateless) nên không đếm ngưỡng theo cửa sổ thời gian.

</details>

## VPC Flow Logs, DNS Query Logs, AWS Config & Athena Analytics

**13. Những loại lưu lượng mạng nào KHÔNG được ghi nhận trong cả VPC Flow Logs lẫn VPC Traffic Mirroring?**

<details><summary>Xem đáp án</summary>

Cả hai đều KHÔNG ghi lại: (1) lưu lượng DNS tới Amazon DNS server (.2), (2) lưu lượng tới EC2 Instance Metadata Service (169.254.169.254), (3) lưu lượng DHCP, (4) lưu lượng kích hoạt bản quyền Windows và Amazon Time Sync Service (169.254.169.123). Để log truy vấn DNS tới .2, bắt buộc phải bật Route 53 Resolver Query Logging.

</details>

**14. Những loại traffic nào KHÔNG được ghi lại trong VPC Flow Logs, và dùng dịch vụ gì để phát hiện DNS Tunneling từ EC2?**

<details><summary>Xem đáp án</summary>

VPC Flow Logs KHÔNG ghi traffic tới Amazon DNS server (.2), IMDS (169.254.169.254), Amazon Time Sync, DHCP và Windows license activation. Phải bật Route 53 Resolver Query Logs để giám sát DNS.

</details>

## Bảo mật Mạng Biên: CloudFront, AWS WAF, Shield Advanced & Firewall Manager

**15. 3 điều kiện tiên quyết BẮT BUỘC để triển khai AWS Firewall Manager quản lý tập trung WAF/Shield/SG/Network Firewall là gì?**

<details><summary>Xem đáp án</summary>

1) Bật AWS Organizations ở chế độ All Features (không phải chỉ Consolidated Billing). 2) Chỉ định một Member Account làm Delegated Administrator cho Firewall Manager. 3) Bật AWS Config trên TẤT CẢ các tài khoản thành viên trong phạm vi tổ chức.

</details>

**16. Làm sao ngăn chặn hoàn toàn Origin Bypass (kẻ tấn công gọi thẳng vào ALB bỏ qua CloudFront + WAF)?**

<details><summary>Xem đáp án</summary>

Kết hợp 2 lớp: (1) ALB Security Group chỉ mở Inbound cho CloudFront Managed Prefix List, VÀ (2) CloudFront chèn Custom Secret Header + ALB Listener Rule chỉ forward request khớp header đó.

</details>

## Bảo mật VPC: Security Groups, NACLs, Network Firewall & Traffic Mirroring

**17. Tại sao kết nối TCP qua AWS Network Firewall trong Inspection VPC (Multi-AZ) gắn Transit Gateway bị rớt chập chờn? Cách khắc phục?**

<details><summary>Xem đáp án</summary>

Do asymmetric routing giữa các AZ. Bật Appliance Mode trên Transit Gateway Attachment của Inspection VPC để ghim cả 2 chiều luồng mạng đi qua cùng 1 AZ.

</details>

**18. Phân biệt VPC Traffic Mirroring và AWS Network Firewall trong việc xử lý gói tin độc hại?**

<details><summary>Xem đáp án</summary>

VPC Traffic Mirroring sao chép gói tin (VXLAN UDP 4789) sang thiết bị IDS ngoài luồng (out-of-band) — KHÔNG chặn được traffic trực tiếp. AWS Network Firewall nằm inline và chặn được traffic bằng Suricata IPS rules / lọc FQDN.

</details>

## Bảo mật Compute & Workload: EC2 IMDSv2, Inspector, SSM & Containers

**19. Tại sao khi chạy container (Docker/ECS/EKS) trên EC2, cấu hình IMDSv2 chuẩn bảo mật lại giữ HttpTokens=required và HttpPutResponseHopLimit=1?**

<details><summary>Xem đáp án</summary>

HttpTokens=required bắt buộc dùng session token qua PUT (chặn SSRF GET). Giữ HttpPutResponseHopLimit=1 ngăn chặn các container chạy phía sau bridge network (cần 2 hops) truy cập vào IMDS để đánh cắp IAM Role của EC2 Host, buộc container phải sử dụng quyền tối thiểu riêng qua ECS Task Role hoặc EKS IRSA/Pod Identity.

</details>

**20. Phân biệt ECS Task Execution Role và ECS Task Role khi khắc phục lỗi AccessDenied?**

<details><summary>Xem đáp án</summary>

Task Execution Role được ECS Agent / Fargate infrastructure sử dụng để pull image từ ECR, đẩy log lên CloudWatch Logs, và đọc Secrets Manager/SSM lúc khởi động container. Task Role được code ứng dụng bên trong container sử dụng ở runtime để gọi các API AWS như S3, DynamoDB, SQS.

</details>

**21. Giải pháp chuẩn AWS để ngăn tấn công SSRF trên EC2 đánh cắp IAM Role credentials từ 169.254.169.254?**

<details><summary>Xem đáp án</summary>

Bắt buộc sử dụng IMDSv2 bằng cấu hình HttpTokens=required (và đặt HttpPutResponseHopLimit=1, hoặc 2 cho container), có thể enforce toàn Organization qua SCP.

</details>

## IAM Policy Evaluation Logic, Permissions Boundaries & Data Perimeter

**22. Khi tạo S3 Bucket Policy chặn mọi truy cập từ bên ngoài VPC (StringNotEquals aws:SourceVpce), tại sao cần thêm điều kiện Bool aws:ViaAWSService = false?**

<details><summary>Xem đáp án</summary>

Khi người dùng gọi dịch vụ như Amazon Athena hoặc AWS CloudFormation để đọc S3 thay mặt họ, request xuất phát từ hạ tầng của AWS Service chứ không đi qua VPC Endpoint của bạn. Nếu không thêm ngoại lệ aws:ViaAWSService: false (và aws:PrincipalIsAWSService: false cho CloudTrail/Config), statement Explicit Deny sẽ làm hỏng các AWS Service đó.

</details>

**23. S3 Bucket Policy có lệnh Deny nếu aws:SourceIp không thuộc văn phòng khiến Amazon Athena bị AccessDenied. Sửa thế nào mà không làm yếu giới hạn IP?**

<details><summary>Xem đáp án</summary>

Thêm điều kiện 'Bool': { 'aws:ViaAWSService': 'false' } vào statement Explicit Deny để miễn trừ các lời gọi đi qua dịch vụ AWS (Athena, CloudFormation, Glue) thay mặt người dùng.

</details>

**24. Làm sao cho phép Developer tự tạo IAM Role nhưng ngăn họ tạo Role có AdministratorAccess (Privilege Escalation)?**

<details><summary>Xem đáp án</summary>

Dùng IAM Permissions Boundary: bắt buộc điều kiện iam:PermissionsBoundary trên action iam:CreateRole và Deny quyền xóa/sửa Permissions Boundary.

</details>

## IAM Identity Center, SAML/OIDC Federation & AWS Verified Access

**25. Lỗ hổng bảo mật lớn nhất thường bị bỏ quên khi triển khai ABAC (aws:PrincipalTag khớp aws:ResourceTag) là gì và cách phòng chống?**

<details><summary>Xem đáp án</summary>

Nếu Principal có quyền sửa đổi tag trên tài nguyên (TagResource, UntagResource, CreateTags), họ có thể tự gắn tag khớp với PrincipalTag của mình lên tài nguyên của team khác để leo thang đặc quyền. Cần chặn bằng Explicit Deny trên các action sửa/xóa tag đối với những tag key dùng cho phân quyền (kiểm tra bằng aws:TagKeys).

</details>

## IAM Access Analyzer, Cross-Account Access & S3 Access Grants

**26. Condition Key nào dùng để chống tấn công Confused Deputy cho Cross-Service (AWS Service) và cho Cross-Account (SaaS Vendor)?**

<details><summary>Xem đáp án</summary>

Với Cross-Service Confused Deputy (khi AWS Service như CloudTrail, EventBridge, SNS truy cập tài nguyên/Role của bạn): dùng aws:SourceArn và aws:SourceAccount. Với Cross-Account Confused Deputy (khi đối tác SaaS bên thứ 3 gọi sts:AssumeRole vào tài khoản bạn): dùng sts:ExternalId trong Trust Policy.

</details>

**27. Trong IAM Policy Evaluation Logic, sự khác biệt lớn nhất giữa Same-Account và Cross-Account khi có Resource-Based Policy là gì?**

<details><summary>Xem đáp án</summary>

Same-Account: Chỉ cần Resource Policy Allow (không có Explicit Deny/Boundary) là ĐƯỢC PHÉP. Cross-Account: BẮT BUỘC phải có Allow ở CẢ Identity Policy (tài khoản gọi) VÀ Resource Policy (tài khoản sở hữu).

</details>

**28. Phân biệt Condition Key dùng để chống Confused Deputy cho AWS Services vs. đối tác 3rd-Party SaaS?**

<details><summary>Xem đáp án</summary>

Cho AWS Services (CloudTrail, S3, SNS...): dùng aws:SourceArn và aws:SourceAccount. Cho đối tác 3rd-Party SaaS (Cross-Account IAM Role): dùng sts:ExternalId trong Trust Policy.

</details>

## AWS KMS Chuyên sâu, Grants, Multi-Region Keys & CloudHSM

**29. KMS Grants khác KMS Key Policy ở điểm nào và tại sao Auto Scaling Group cần quyền kms:CreateGrant khi dùng EBS mã hóa bằng CMK?**

<details><summary>Xem đáp án</summary>

KMS Grants là cơ chế ủy quyền động, tạm thời, CHỈ hỗ trợ Allow (không có Deny) và không làm phình Key Policy (giới hạn 32 KB). Khi Auto Scaling Group khởi tạo EC2 từ EBS volume mã hóa bằng CMK, AWSServiceRoleForAutoScaling cần quyền kms:CreateGrant (kèm điều kiện kms:GrantIsForAWSResource: true) để cấp quyền tạm cho EC2 giải mã volume.

</details>

**30. Các đặc điểm và giới hạn bắt buộc nhớ của KMS Imported Key Material (BYOK — ORIGIN=EXTERNAL) là gì?**

<details><summary>Xem đáp án</summary>

1) KHÔNG hỗ trợ Automatic Key Rotation của KMS (phải xoay vòng thủ công). 2) Có thể đặt ngày hết hạn (ValidTo) và xóa ngay lập tức bằng DeleteImportedKeyMaterial (không cần chờ 7-30 ngày). 3) Nếu key material bị xóa hoặc hết hạn, chỉ có thể re-import ĐÚNG key material ban đầu vào lại KMS Key ID đó.

</details>

**31. Tại sao KHÔNG THỂ chia sẻ EBS Snapshot hoặc RDS Snapshot được mã hóa bằng AWS Managed Key (aws/ebs, aws/rds) sang tài khoản khác?**

<details><summary>Xem đáp án</summary>

Vì AWS Managed Key có Key Policy chỉ đọc (read-only), không thể thêm tài khoản khác vào Key Policy. Phải copy snapshot và mã hóa lại bằng Customer Managed Key (CMK) rồi mới chia sẻ.

</details>

**32. So sánh cơ chế xóa khóa và xoay vòng khóa giữa KMS-generated CMK và KMS CMK với Imported Key Material (BYOK)?**

<details><summary>Xem đáp án</summary>

KMS-generated CMK: Hỗ trợ Automatic Rotation (90-2560 ngày), xóa phải chờ 7-30 ngày. Imported Key Material (BYOK): KHÔNG hỗ trợ Automatic Rotation, nhưng có thể xóa ngay lập tức bằng DeleteImportedKeyMaterial.

</details>

**33. Khi nào BẮT BUỘC chọn AWS CloudHSM thay vì AWS KMS?**

<details><summary>Xem đáp án</summary>

Khi yêu cầu Single-tenant HSM độc quyền (khách hàng kiểm soát hoàn toàn khóa, AWS không có quyền truy cập) hoặc ứng dụng cần giao thức mật mã chuẩn PKCS#11, JCE, CNG, OpenSSL (triển khai >= 2 HSM ở 2 AZ cho HA).

</details>

## Bảo vệ Dữ liệu: S3 Encryption/Object Lock, ACM Private CA, Secrets Manager & Macie

**34. So sánh S3 Object Lock Governance Mode và Compliance Mode về khả năng xóa object trước thời hạn lưu giữ?**

<details><summary>Xem đáp án</summary>

Trong Governance Mode, người dùng có quyền IAM đặc biệt s3:BypassGovernanceRetention (và gửi kèm header bypass) vẫn có thể ghi đè hoặc xóa object trước hạn. Trong Compliance Mode, KHÔNG MỘT AI — kể cả AWS Account Root User — có thể xóa hoặc rút ngắn thời gian lưu giữ cho đến khi hết hạn.

</details>

**35. S3 Bucket dùng SSE-KMS gặp lỗi KMS ThrottlingException (HTTP 503) và chi phí KMS tăng vọt. Giải pháp đơn giản nhất là gì?**

<details><summary>Xem đáp án</summary>

Bật S3 Bucket Keys trên S3 Bucket. Tính năng này giảm tới 99% số lượng lời gọi API từ S3 tới KMS mà không cần sửa code ứng dụng.

</details>

## AWS Organizations, Control Tower & Delegated Administrator

**36. Service Control Policies (SCP) KHÔNG áp dụng lên những thực thể nào trong AWS Organizations?**

<details><summary>Xem đáp án</summary>

SCP KHÔNG ảnh hưởng đến: (1) bất kỳ user/role nào trong Management Account (kể cả Root của Management Account), (2) Service-Linked Roles (SLR), và (3) các thực thể thuộc tài khoản bên ngoài truy cập tài nguyên qua Resource-based Policy. Lưu ý: SCP CÓ áp dụng lên Root User của các Member Accounts!

</details>

**37. Khi viết SCP giới hạn Region bằng aws:RequestedRegion, điều gì BẮT BUỘC phải đưa vào NotAction để tránh khóa luôn tài khoản?**

<details><summary>Xem đáp án</summary>

Phải dùng NotAction để miễn trừ các Global Services như iam:*, sts:*, organizations:*, route53:*, cloudfront:*, support:*, budgets:*, globalaccelerator:*.

</details>

**38. Best practice hiện đại nhất của AWS để loại bỏ hoàn toàn Root credentials tồn tại thường trực trên hàng trăm Member Accounts?**

<details><summary>Xem đáp án</summary>

Bật Centralized Root Access Management trong AWS Organizations: xóa toàn bộ Root passwords/MFA/access keys của member accounts và chỉ dùng phiên AssumeRoot ngắn hạn, giới hạn tác vụ từ Management Account / Delegated Admin khi khẩn cấp.

</details>

## Quản trị Tuân thủ: Conformance Packs, Audit Manager, Trusted Advisor & Artifact

**39. Khi cấu hình quản trị bảo mật tập trung (GuardDuty, Security Hub, Inspector, Firewall Manager) trong AWS Organizations, nên chọn tài khoản nào làm Delegated Administrator?**

<details><summary>Xem đáp án</summary>

Best Practice của AWS là KHÔNG chạy trực tiếp trên Management Account mà chỉ định một Member Account chuyên biệt (Security Tooling / Audit Account) làm Delegated Administrator. Điều này giảm thiểu bề mặt tấn công và hạn chế số lượng người cần đăng nhập vào Management Account.

</details>

**40. Phân biệt khi nào chọn AWS Artifact và khi nào chọn AWS Audit Manager trong các câu hỏi về tuân thủ (Compliance)?**

<details><summary>Xem đáp án</summary>

Chọn AWS Artifact khi cần tải xuống báo cáo tuân thủ bên thứ 3 của chính hạ tầng AWS (SOC 2, ISO 27001, PCI-DSS AoC) hoặc ký thỏa thuận BAA (HIPAA). Chọn AWS Audit Manager khi cần TỰ ĐỘNG thu thập bằng chứng (evidence) liên tục từ cấu hình tài khoản AWS của bạn (Config, CloudTrail, Security Hub) để chuẩn bị cho cuộc kiểm toán tuân thủ.

</details>

**41. Phân biệt AWS Artifact, AWS Audit Manager và AWS Config Conformance Packs?**

<details><summary>Xem đáp án</summary>

AWS Artifact = Tải báo cáo tuân thủ của CHÍNH HẠ TẦNG AWS (SOC 2, PCI AoC, BAA); AWS Audit Manager = Tự động thu thập bằng chứng kiểm toán cho workload của công ty; Config Conformance Packs = Triển khai bộ Config Rules + Auto-remediation hàng loạt toàn Organization.

</details>

**42. 3 loại Guardrails (Controls) trong AWS Control Tower hoạt động dựa trên dịch vụ AWS nào?**

<details><summary>Xem đáp án</summary>

Preventive = SCP / RCP (chặn API); Detective = AWS Config Rules / Security Hub (phát hiện sai phạm sau tạo); Proactive = CloudFormation Hooks (chặn template vi phạm trước khi cấp phát tài nguyên).

</details>

---

[Mục lục SCS-C02](00-tong-quan-va-lo-trinh-scs-c02.md)
