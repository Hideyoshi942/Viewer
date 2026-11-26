# Bài tập tình huống — Ứng phó Sự cố, Forensics & Auto-Remediation

> EventBridge Auto-Remediation Playbooks, EC2 Isolation & EBS/Memory Forensics, Xử lý IAM Access Key bị lộ và AWS Incident Response.
> **Số câu hỏi:** 14 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A security team enables Amazon GuardDuty Malware Protection for EC2 to automatically initiate agentless malware scans whenever GuardDuty detects suspicious EC2 findings. After a High-severity crypto-mining finding is generated for a production EC2 instance with an EBS volume encrypted using a customer managed AWS KMS key, GuardDuty reports that the malware scan was skipped. What is the MOST likely cause of this issue?

- **A.** The SSM Agent is not installed on the EC2 instance, preventing GuardDuty from attaching its scanning engine to the root volume.
- **B.** GuardDuty Malware Protection does not support scanning EBS volumes encrypted with customer managed KMS keys.
- **C.** The KMS key policy does not grant the GuardDuty Malware Protection service-linked role permissions to create grants and decrypt snapshots.
- **D.** The EC2 instance is in a private subnet without a NAT Gateway, preventing the malware scan results from reaching the GuardDuty control plane.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm bảo mật bật Amazon GuardDuty Malware Protection for EC2 để tự động khởi chạy quét phần mềm độc hại không cần agent mỗi khi GuardDuty phát hiện các finding EC2 đáng ngờ. Sau khi một finding khai thác tiền ảo mức độ nghiêm trọng cao được tạo cho một EC2 instance production có EBS volume được mã hóa bằng customer managed AWS KMS key, GuardDuty báo cáo rằng quá trình quét phần mềm độc hại đã bị bỏ qua. Nguyên nhân CÓ KHẢ NĂNG NHẤT của sự cố này là gì?

**Đáp án đúng:** **C**

GuardDuty Malware Protection for EC2 thực hiện quét không cần agent (agentless) thông qua EBS snapshot. Một lỗi cấu hình rất hay thi trong SCS-C02 là quên cấp quyền KMS (kms:CreateGrant, kms:Decrypt, kms:ReEncrypt*, kms:GenerateDataKeyWithoutPlaintext, kms:DescribeKey) trong Customer Managed Key policy cho service-linked role của GuardDuty Malware Protection, hoặc gắn tag loại trừ (exclusion tag) khiến bản quét bị bỏ qua.

- **A:** GuardDuty Malware Protection for EC2 (EBS volume scanning) hoạt động hoàn toàn không cần agent (agentless) bằng cách chụp và phân tích EBS snapshot ở tầng AWS infrastructure, không phụ thuộc vào SSM Agent.
- **B:** GuardDuty Malware Protection hỗ trợ hoàn toàn việc quét cả EBS volume không mã hóa, mã hóa bằng AWS managed key lẫn Customer Managed Key (miễn là Key Policy cấp quyền phù hợp).
- **C (Đúng):** Chính xác! GuardDuty Malware Protection for EC2 tạo bản sao (replica) của EBS snapshot để quét không cần agent. Nếu EBS volume được mã hóa bằng Customer Managed Key (CMK), Key Policy của CMK bắt buộc phải cấp quyền (như kms:CreateGrant, kms:Decrypt, kms:DescribeKey) cho Service-Linked Role của GuardDuty Malware Protection, nếu không quá trình quét sẽ bị bỏ qua (skipped).
- **D:** Quá trình chụp và quét EBS snapshot diễn ra ở tầng điều khiển (control plane) của AWS bên ngoài hệ điều hành của instance, nên không cần NAT Gateway hay kết nối Internet từ VPC của instance.

</details>

### Câu 2 `hard`

During a security incident in a Production AWS account, an incident responder isolates a compromised EC2 instance by changing its Security Group and takes an EBS snapshot of its root volume. The volume is encrypted with the default AWS managed key (alias/aws/ebs). The responder wants to share this snapshot with a dedicated Forensics AWS account for offline disk analysis in a clean-room VPC, but the Share Snapshot action fails. How should the responder resolve this issue?

- **A.** Copy and re-encrypt the snapshot with a CMK granting access to the Forensics account, then share the copied snapshot.
- **B.** Modify the key policy of alias/aws/ebs to grant the Forensics AWS account kms:Decrypt and kms:CreateGrant permissions, then share the snapshot.
- **C.** Attach the compromised EBS volume directly to an EC2 forensic workstation in the Forensics account using AWS RAM.
- **D.** Disable EBS default encryption in the Production account, copy the snapshot as unencrypted, and share the unencrypted snapshot with the Forensics account.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong một sự cố bảo mật tại tài khoản AWS Production, một chuyên viên ứng phó sự cố cô lập một EC2 instance bị xâm phạm bằng cách thay đổi Security Group của nó và chụp một EBS snapshot của root volume. Volume này được mã hóa bằng AWS managed key mặc định (alias/aws/ebs). Chuyên viên muốn chia sẻ snapshot này với một tài khoản AWS Forensics chuyên dụng để phân tích đĩa ngoại tuyến trong một clean-room VPC, nhưng hành động Share Snapshot thất bại. Chuyên viên nên giải quyết vấn đề này như thế nào?

**Đáp án đúng:** **A**

Đây là bẫy kinh điển của bài thi SCS-C02 kết hợp giữa Incident Response (EC2 Forensics) và KMS: EBS snapshot mã hóa bằng AWS managed key (aws/ebs) KHÔNG THỂ chia sẻ cross-account và cũng không thể copy thành unencrypted. Giải pháp duy nhất là Copy Snapshot kèm Re-encrypt bằng Customer Managed Key (CMK) đã cấp quyền cho tài khoản Forensics.

- **A (Đúng):** Chính xác! Để chia sẻ EBS snapshot được mã hóa sang tài khoản Forensics khác, bắt buộc phải copy snapshot và mã hóa lại (re-encrypt) bằng một Customer Managed Key (CMK), cấp quyền KMS cho tài khoản Forensics trong Key Policy của CMK đó, rồi mới share snapshot bản sao.
- **B:** Không thể chỉnh sửa Key Policy của AWS managed key (alias/aws/ebs), do đó không bao giờ có thể chia sẻ trực tiếp EBS snapshot được mã hóa bằng AWS managed key sang tài khoản AWS khác.
- **C:** AWS RAM không hỗ trợ chia sẻ trực tiếp EBS volume giữa các tài khoản AWS, và việc gắn trực tiếp volume gốc còn vi phạm nguyên tắc bảo toàn chứng cứ pháp chứng (chain of custody).
- **D:** AWS không cho phép tạo bản sao không mã hóa (unencrypted copy) từ một EBS snapshot đã được mã hóa. Ngoài ra, lưu trữ dữ liệu pháp chứng không mã hóa cũng vi phạm best practices bảo mật.

</details>

### Câu 3 `hard`

AWS Health notifies a security team that an IAM user's long-term access key pair was discovered in a public GitHub repository. CloudTrail logs show API activity from an unfamiliar IP address over the past 30 minutes. Which TWO immediate containment and investigation actions should the security team take FIRST? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Delete the IAM user immediately without reviewing its activity so that CloudTrail automatically purges all resources created by that user.
- **B.** Deactivate or delete the exposed IAM access key immediately and attach an explicit Deny-all inline policy to the IAM user.
- **C.** Wait for the compromised IAM user's temporary STS tokens to expire naturally after 15 minutes before taking remediation actions.
- **D.** Query CloudTrail by accessKeyId and userIdentity to find persistence mechanisms (new IAM users, keys, roles, or EC2s).
- **E.** Rotate the AWS account root user password and enable AWS Shield Advanced on the account.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** AWS Health thông báo cho một nhóm bảo mật rằng một cặp access key dài hạn của IAM user đã bị phát hiện trong một kho lưu trữ GitHub công khai. Nhật ký CloudTrail cho thấy hoạt động API từ một địa chỉ IP lạ trong 30 phút qua. Nhóm bảo mật nên thực hiện HAI hành động ngăn chặn và điều tra ngay lập tức nào ĐẦU TIÊN? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Playbook xử lý IAM Access Key bị lộ của AWS yêu cầu: (1) Khoanh vùng ngay lập tức bằng cách Deactivate/Delete access key và gắn Explicit Deny (kèm thu hồi STS session nếu key đã gọi sts:GetSessionToken/AssumeRole), (2) Điều tra CloudTrail toàn bộ hành động của accessKeyId bị lộ để tìm cửa hậu (persistence) và tài nguyên bị tạo trái phép, sau đó mới xóa sạch và khắc phục.

- **A:** Xóa IAM user KHÔNG tự động xóa các tài nguyên hoặc cửa hậu (IAM user/role mới, EC2) mà kẻ tấn công đã tạo, đồng thời xóa vội user trước khi điều tra có thể làm mất ngữ cảnh về quyền và cấu hình hiện tại của user đó.
- **B (Đúng):** Chính xác! Vô hiệu hóa/xóa ngay access key bị lộ để chặn lệnh gọi API mới bằng key đó, đồng thời gắn chính sách Explicit Deny-all lên IAM user để ngăn kẻ tấn công lợi dụng bất kỳ phiên hoặc quyền nào khác còn sót lại.
- **C:** Access key của IAM user là thông tin xác thực dài hạn (long-term credentials) không tự hết hạn sau 15 phút; chờ đợi sẽ tạo điều kiện cho kẻ tấn công mở rộng xâm nhập.
- **D (Đúng):** Chính xác! Kẻ tấn công thường tạo cửa hậu (persistence) như IAM user mới, access key thứ hai, hoặc khởi chạy EC2 đào coin chỉ trong vài phút. Tra cứu toàn bộ lịch sử CloudTrail theo accessKeyId và userIdentity là bước điều tra bắt buộc.
- **E:** Việc lộ access key của một IAM user không liên quan đến tấn công DDoS (Shield Advanced) hay mật khẩu root user.

</details>

### Câu 4 `hard`

A web application allows external customers to upload PDF and ZIP files directly into an Amazon S3 staging bucket. The security team needs to automatically scan every newly uploaded object for malware before downstream processing pipelines read it, tag each object with its scan result, and automatically move any infected object to a quarantined S3 bucket—without deploying or managing EC2 scanning fleets. Which architecture meets these requirements with the LEAST operational overhead?

- **A.** Enable Amazon Macie automated sensitive data discovery on the staging bucket and configure an EventBridge rule to quarantine flagged objects.
- **B.** Enable GuardDuty Malware Protection for S3 with tagging, and use EventBridge to trigger Lambda quarantine on THREATS_FOUND.
- **C.** Deploy ClamAV antivirus software on an Auto Scaling group of EC2 instances polling an SQS queue fed by S3 Event Notifications.
- **D.** Enable Amazon GuardDuty S3 Protection to inspect CloudTrail S3 data events and automatically delete malicious objects.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng web cho phép khách hàng bên ngoài tải trực tiếp các tệp PDF và ZIP lên một Amazon S3 staging bucket. Nhóm bảo mật cần tự động quét mọi đối tượng mới được tải lên để tìm phần mềm độc hại trước khi các pipeline xử lý phía sau đọc nó, gắn thẻ mỗi đối tượng với kết quả quét và tự động di chuyển bất kỳ đối tượng bị nhiễm nào sang một S3 bucket cách ly—mà không cần triển khai hoặc quản lý các đội ngũ EC2 quét. Kiến trúc nào đáp ứng các yêu cầu này với chi phí vận hành ÍT NHẤT?

**Đáp án đúng:** **B**

Phân biệt 2 tính năng S3 của GuardDuty: **GuardDuty S3 Protection** phân tích API call (CloudTrail data events) để phát hiện hành vi bất thường, còn **GuardDuty Malware Protection for S3** quét trực tiếp nội dung object mới tải lên, gắn tag `GuardDutyMalwareScanStatus` và gửi kết quả qua EventBridge để tự động cách ly (quarantine).

- **A:** Amazon Macie phát hiện dữ liệu nhạy cảm (PII, thẻ tín dụng, bí mật), KHÔNG có chức năng quét mã độc/virus trong file tải lên S3.
- **B (Đúng):** Chính xác! GuardDuty Malware Protection for S3 tự động quét mọi object mới tải lên S3 mà không cần quản lý hạ tầng máy quét, tự gắn tag GuardDutyMalwareScanStatus (NO_THREATS_FOUND / THREATS_FOUND) và phát sự kiện EventBridge để Lambda cách ly file nhiễm mã độc (kết hợp bucket policy chỉ cho pipeline đọc object có tag NO_THREATS_FOUND).
- **C:** Giải pháp tự quản lý cụm EC2 chạy ClamAV gây nhiều gánh nặng vận hành (vá lỗi, cập nhật signature, scale) so với dịch vụ managed GuardDuty Malware Protection for S3.
- **D:** GuardDuty S3 Protection chỉ phân tích hành vi gọi API (CloudTrail S3 data events) để phát hiện truy cập bất thường hoặc exfiltration, không quét nội dung nhị phân của file để tìm malware.

</details>

### Câu 5 `hard`

A company aggregates AWS Security Hub findings from 50 member accounts into a central Security Tooling delegated administrator account. The security team wants to automatically revoke any Security Group inbound rule allowing RDP (port 3389) from 0.0.0.0/0 within seconds of detection in any member account, while maintaining least privilege and centralized orchestration. Which architecture should the team implement?

- **A.** Grant the Security Hub service-linked role in the Security Tooling account ec2:RevokeSecurityGroupIngress permissions across all member accounts so Security Hub automatically edits Security Groups.
- **B.** Store long-term IAM user access keys for all 50 member accounts in an S3 bucket and have a cron job run every hour to audit Security Groups.
- **C.** Use Amazon GuardDuty to automatically remove inbound rules from Security Groups whenever port 3389 is opened.
- **D.** Use EventBridge in Security Tooling to match Security Hub findings and invoke Lambda/Step Functions assuming a member remediation role.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty tổng hợp các finding AWS Security Hub từ 50 tài khoản thành viên vào một tài khoản quản trị được ủy quyền Security Tooling trung tâm. Nhóm bảo mật muốn tự động thu hồi bất kỳ quy tắc inbound Security Group nào cho phép RDP (port 3389) từ 0.0.0.0/0 trong vòng vài giây kể từ khi phát hiện ở bất kỳ tài khoản thành viên nào, đồng thời duy trì đặc quyền tối thiểu và điều phối tập trung. Nhóm nên triển khai kiến trúc nào?

**Đáp án đúng:** **D**

Mẫu Auto-Remediation đa tài khoản chuẩn trên AWS: **Security Hub (Delegated Admin)** → **EventBridge Rule** (lọc theo `GeneratorId` / `Compliance.Status: FAILED`) → **Step Functions / Lambda / SSM Automation** → **STS AssumeRole** vào member account (với quyền tối thiểu) để thực thi khắc phục tự động.

- **A:** Security Hub chỉ phát hiện và tổng hợp findings, bản thân Security Hub không tự thực thi hành động sửa đổi tài nguyên EC2; việc khắc phục phải thông qua EventBridge + Lambda/SSM Automation/Step Functions.
- **B:** Lưu trữ long-term access keys của 50 tài khoản trong S3 là lỗi bảo mật nghiêm trọng (vi phạm least privilege) và chạy cron mỗi giờ không đáp ứng yêu cầu phản ứng trong vài giây.
- **C:** GuardDuty là công cụ phát hiện mối đe dọa bị động, không có khả năng tự động chỉnh sửa Security Group.
- **D (Đúng):** Chính xác! Đây là mẫu kiến trúc Automated Security Response (ASR) chuẩn của AWS: EventBridge ở tài khoản Security Tooling bắt finding từ Security Hub (hoặc Custom Action) -> kích hoạt Lambda/Step Functions -> AssumeRole vào một Remediation Role có quyền tối thiểu (ec2:RevokeSecurityGroupIngress) trong member account bị ảnh hưởng để tự động gỡ rule vi phạm.

</details>

### Câu 6 `hard`

A security operations team receives 15 separate Amazon GuardDuty findings over a 2-hour window involving a compromised IAM role, an EC2 instance communicating with a known command-and-control server, and unusual S3 GetObject calls. The analyst wants to automatically correlate these related findings into a single investigative unit mapped to MITRE ATT&CK tactics to see the complete attack sequence. Which AWS feature directly provides this capability?

- **A.** AWS Security Hub custom insights
- **B.** Amazon EventBridge Pipes correlation rules
- **C.** Amazon Detective finding groups
- **D.** AWS CloudTrail Insights

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm vận hành bảo mật nhận được 15 finding Amazon GuardDuty riêng biệt trong khoảng thời gian 2 giờ liên quan đến một IAM role bị xâm phạm, một EC2 instance giao tiếp với máy chủ command-and-control đã biết và các lệnh gọi S3 GetObject bất thường. Chuyên viên phân tích muốn tự động tương quan các finding liên quan này thành một đơn vị điều tra duy nhất được ánh xạ tới các chiến thuật MITRE ATT&CK để xem toàn bộ chuỗi tấn công. Tính năng AWS nào cung cấp trực tiếp khả năng này?

**Đáp án đúng:** **C**

**Amazon Detective Finding Groups** sử dụng behavior graph để tự động nhóm nhiều GuardDuty findings có liên quan đến cùng một sự cố tấn công (ngay cả khi liên quan đến nhiều tài nguyên/tài khoản khác nhau), hiển thị trực quan các thực thể liên quan và ánh xạ tới các chiến thuật **MITRE ATT&CK**.

- **A:** Security Hub Insights chỉ gom nhóm các findings theo thuộc tính lọc tĩnh (ví dụ theo Resource ID hoặc Severity), không tự động phân tích đồ thị hành vi để xâu chuỗi nhiều loại finding khác nhau thành một vụ tấn công liên kết như Detective finding groups.
- **B:** EventBridge Pipes dùng để kết nối point-to-point giữa nguồn và đích sự kiện, không có khả năng phân tích đồ thị bảo mật hay tự động liên kết chuỗi tấn công MITRE ATT&CK.
- **C (Đúng):** Chính xác! Amazon Detective Finding Groups tự động gom nhóm nhiều GuardDuty findings và các thực thể liên quan (IAM role, EC2, IP) thành một nhóm điều tra duy nhất, đồng thời gắn nhãn chiến thuật MITRE ATT&CK để hiển thị toàn bộ chuỗi tấn công và mối quan hệ.
- **D:** CloudTrail Insights chỉ phát hiện bất thường về tần suất gọi API ghi (write API) hoặc tỷ lệ lỗi API trong CloudTrail, không gom nhóm GuardDuty findings đa nguồn.

</details>

### Câu 7 `hard`

A company deploys serverless microservices using AWS Lambda functions that process sensitive financial transactions inside a VPC. The security team needs to detect if a compromised Lambda function begins communicating with a cryptocurrency mining pool or a known malicious IP address without modifying function code or adding Lambda layers. Which solution meets this requirement?

- **A.** Enable Amazon Inspector Lambda code scanning to monitor outbound network connections during function invocation.
- **B.** Configure AWS WAF on the Lambda function URLs to block outbound connections to mining pools.
- **C.** Deploy an AWS Systems Manager Agent inside each Lambda execution environment to capture network sockets.
- **D.** Enable Amazon GuardDuty Lambda Protection to monitor VPC Flow Logs generated by Lambda function network activity.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty triển khai các microservice serverless sử dụng AWS Lambda function để xử lý các giao dịch tài chính nhạy cảm bên trong một VPC. Nhóm bảo mật cần phát hiện xem một Lambda function bị xâm phạm có bắt đầu giao tiếp với một nhóm khai thác tiền ảo hoặc một địa chỉ IP độc hại đã biết hay không mà không cần sửa đổi mã hàm hay thêm Lambda layer. Giải pháp nào đáp ứng yêu cầu này?

**Đáp án đúng:** **D**

**Amazon GuardDuty Lambda Protection** giúp phát hiện mối đe dọa mạng ở thời điểm chạy (runtime) đối với AWS Lambda bằng cách tự động tiêu thụ và phân tích nhật ký lưu lượng mạng (Lambda network activity logs) mà không cần thay đổi mã nguồn hay triển khai agent/layer.

- **A:** Amazon Inspector Lambda scanning kiểm tra lỗ hổng trong mã nguồn và thư viện phụ thuộc (static/package vulnerability scanning), không giám sát lưu lượng mạng runtime khi hàm đang chạy.
- **B:** AWS WAF chỉ kiểm tra lưu lượng HTTP/HTTPS đi vào (inbound) và không hỗ trợ gắn trực tiếp lên Lambda Function URL hay lọc lưu lượng outbound.
- **C:** SSM Agent không thể cài đặt hoặc chạy như dịch vụ nền trong môi trường thực thi serverless của AWS Lambda.
- **D (Đúng):** Chính xác! Amazon GuardDuty Lambda Protection tự động giám sát lưu lượng mạng của các hàm Lambda (thông qua VPC Flow Logs của Lambda) mà không cần bật VPC Flow Logs thủ công, không cần sửa code hay thêm Lambda layer, giúp phát hiện kết nối tới máy chủ đào tiền ảo hoặc IP độc hại.

</details>

### Câu 8 `hard`

An incident response team suspects that an Amazon EC2 instance running in a production VPC has been compromised by a rootkit. The team must preserve volatile memory and disk evidence for forensic analysis in a dedicated Forensics AWS account while immediately preventing the attacker from exfiltrating data or pivoting laterally. Which TWO actions should the team take? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Stop and immediately restart the EC2 instance to terminate all malicious processes before taking EBS snapshots.
- **B.** Replace the instance's security groups with an isolation security group having no inbound or outbound rules.
- **C.** Modify the VPC Network ACL to deny all traffic to the entire subnet so the compromised instance cannot communicate.
- **D.** Create encrypted snapshots of EBS volumes using a customer managed KMS key, and share them with the Forensics account.
- **E.** Share the original EBS volumes directly encrypted with the default aws/ebs AWS managed key with the Forensics account.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm ứng phó sự cố nghi ngờ rằng một Amazon EC2 instance đang chạy trong một VPC production đã bị xâm phạm bởi rootkit. Nhóm phải bảo toàn bộ nhớ khả biến và bằng chứng đĩa phục vụ phân tích điều tra số trong một tài khoản AWS Forensics chuyên dụng đồng thời ngăn chặn ngay lập tức kẻ tấn công trích xuất dữ liệu hoặc di chuyển ngang (lateral movement). Nhóm nên thực hiện HAI hành động nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Trong quy trình **EC2 Forensics & Containment**: (1) Cô lập mạng ở mức instance bằng **Isolation Security Group** (không tắt máy để giữ volatile memory, không chặn cả subnet bằng NACL); (2) Thu thập bằng chứng đĩa bằng **EBS Snapshot** mã hóa bằng **Customer Managed KMS Key** để có thể chia sẻ sang tài khoản Forensics chuyên biệt.

- **A:** Dừng (stop) hoặc khởi động lại (restart) EC2 instance sẽ làm mất hoàn toàn bộ nhớ RAM (volatile memory) và dữ liệu trên instance store, phá hủy bằng chứng pháp y quan trọng về rootkit.
- **B (Đúng):** Chính xác! Thay thế Security Group bằng nhóm cách ly (isolation SG) ngay lập tức chặn mọi kết nối mới và lưu lượng đi ra (ngăn exfiltration và lateral movement) mà vẫn giữ nguyên trạng thái bộ nhớ RAM (volatile memory) để thu thập bằng chứng.
- **C:** Chặn toàn bộ traffic ở mức Subnet NACL sẽ làm gián đoạn tất cả các EC2 instance hợp lệ khác trong cùng subnet (gây ảnh hưởng diện rộng không cần thiết).
- **D (Đúng):** Chính xác! Tạo EBS snapshot và mã hóa lại bằng Customer Managed Key (CMK) rồi chia sẻ snapshot cùng quyền sử dụng KMS key cho tài khoản Forensics giúp bảo toàn bằng chứng đĩa an toàn và tuân thủ nguyên tắc cách ly (lưu ý: snapshot mã hóa bằng AWS managed key không thể chia sẻ cross-account).
- **E:** AWS không cho phép chia sẻ EBS snapshot được mã hóa bằng AWS managed key (`aws/ebs`) sang tài khoản khác; bắt buộc phải sao chép và mã hóa bằng Customer Managed Key (CMK).

</details>

### Câu 9 `hard`

An Amazon GuardDuty finding indicates that an Amazon EC2 instance is communicating with a known Bitcoin mining pool. The security team wants to automatically scan the instance's attached Amazon EBS volumes for malware and rootkits WITHOUT installing any antivirus software on the instance and WITHOUT impacting the instance's CPU or disk performance. Which AWS feature accomplishes this?

- **A.** Enable Amazon Inspector EC2 agentless scanning to remove malware binaries from the root EBS volume.
- **B.** Run an AWS Systems Manager Run Command document to install and run an antivirus scan directly on the live EC2 instance.
- **C.** Enable GuardDuty Malware Protection for EC2 to create EBS snapshots and scan them in an isolated AWS environment.
- **D.** Enable Amazon Macie automated sensitive data discovery on the EC2 instance's EBS volume snapshots.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một finding của Amazon GuardDuty cho biết một Amazon EC2 instance đang giao tiếp với một nhóm khai thác Bitcoin đã biết. Nhóm bảo mật muốn tự động quét các Amazon EBS volume đang gắn vào instance đó để tìm phần mềm độc hại và rootkit MÀ KHÔNG cần cài đặt bất kỳ phần mềm diệt virus nào trên instance và KHÔNG ảnh hưởng đến hiệu năng CPU hay đĩa của instance. Tính năng AWS nào thực hiện điều này?

**Đáp án đúng:** **C**

**GuardDuty Malware Protection for EC2** thực hiện quét mã độc không cần agent (**agentless**) bằng cách tự động tạo **EBS snapshot** khi có GuardDuty finding đáng ngờ (hoặc chạy on-demand) và quét bản sao đó hoàn toàn tách biệt, không tiêu tốn tài nguyên của EC2 instance và có tùy chọn giữ lại snapshot nếu phát hiện mã độc để phục vụ điều tra pháp y.

- **A:** Amazon Inspector quét lỗ hổng phần mềm (CVE) và cấu hình mạng, không phải công cụ quét mã độc (malware/trojan/rootkit) trên hệ thống tệp của EBS volume.
- **B:** Cài đặt và chạy phần mềm diệt virus trực tiếp trên EC2 đang hoạt động vừa yêu cầu cài phần mềm, vừa tiêu tốn CPU/disk I/O của instance, vi phạm cả hai yêu cầu đề bài.
- **C (Đúng):** Chính xác! GuardDuty Malware Protection for EC2 (GuardDuty-initiated hoặc on-demand) hoạt động không cần agent (agentless): khi có GuardDuty finding nghi ngờ trên EC2, dịch vụ tự động tạo bản chụp EBS snapshot và quét mã độc trong môi trường cô lập của AWS mà không ảnh hưởng hiệu năng của EC2 instance.
- **D:** Amazon Macie chỉ quét dữ liệu nhạy cảm trên Amazon S3, không quét mã độc trên EBS snapshot.

</details>

### Câu 10 `hard`

A developer accidentally committed an IAM user's long-lived access key ID and secret access key to a public GitHub repository. Within minutes, AWS Health and Amazon GuardDuty alert the security team of unauthorized API activity using that key. Which TWO immediate containment and investigation actions should the incident response team perform? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Delete the IAM user immediately without inspecting CloudTrail so that all resources created by the attacker are automatically terminated.
- **B.** Deactivate the exposed IAM access key, attach an explicit Deny inline policy, and revoke active temporary sessions.
- **C.** Change the IAM user's console password only, because rotating the password automatically invalidates all existing IAM access keys.
- **D.** Query CloudTrail logs for the compromised accessKeyId to find persistence (new IAM users, keys, roles, or EC2s).
- **E.** Enable S3 Block Public Access on the account, which automatically revokes compromised IAM access keys.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà phát triển vô tình commit access key ID và secret access key dài hạn của một IAM user lên một kho lưu trữ GitHub công khai. Trong vòng vài phút, AWS Health và Amazon GuardDuty cảnh báo nhóm bảo mật về hoạt động API trái phép sử dụng khóa đó. Nhóm ứng phó sự cố nên thực hiện HAI hành động ngăn chặn và điều tra ngay lập tức nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Playbook xử lý **IAM Access Key bị lộ**: (1) **Deactivate** (không vội xóa user) access key và gắn **explicit Deny** / thu hồi STS sessions; (2) **Điều tra CloudTrail** theo `accessKeyId` để tìm mọi tài nguyên hoặc backdoor (IAM user/role/key mới) mà kẻ tấn công đã tạo nhằm duy trì quyền truy cập; (3) Loại bỏ backdoor và chuyển sang dùng IAM Role/Identity Center.

- **A:** Xóa IAM user KHÔNG tự động xóa các tài nguyên mà kẻ tấn công đã tạo (như EC2 đào tiền ảo, IAM role/user backdoor) và việc xóa vội vàng còn gây khó khăn cho quá trình điều tra pháp y.
- **B (Đúng):** Chính xác! Vô hiệu hóa (deactivate) access key bị lộ giúp ngăn kẻ tấn công tiếp tục sử dụng khóa đó ngay lập tức mà vẫn giữ lại thông tin nhận dạng khóa phục vụ điều tra; đồng thời gắn explicit Deny cho user và thu hồi các phiên STS tạm thời đã tạo để chặn hoàn toàn quyền truy cập.
- **C:** Đổi mật khẩu console KHÔNG hề vô hiệu hóa IAM access keys; access key bị lộ vẫn tiếp tục gọi AWS API bình thường cho đến khi bị deactivate hoặc xóa.
- **D (Đúng):** Chính xác! Kẻ tấn công thường tạo thêm IAM user/access key dự phòng hoặc role backdoor để duy trì quyền truy cập (persistence). Rà soát toàn bộ CloudTrail events theo `accessKeyId` giúp xác định và dọn sạch toàn bộ tài nguyên trái phép.
- **E:** S3 Block Public Access chỉ ngăn truy cập công khai tới S3 bucket, không có tác dụng thu hồi IAM access keys bị lộ.

</details>

### Câu 11 `hard`

A security operations center (SOC) uses AWS Security Hub as its central dashboard. Because automatically isolating production EC2 instances without human verification could cause customer outages, the SOC wants analysts to manually review a finding in the Security Hub console and click a button labeled "Isolate-EC2" to trigger an automated AWS Lambda remediation workflow on demand. Which AWS Security Hub feature supports this human-in-the-loop workflow?

- **A.** Create a Security Hub Insight named Isolate-EC2 and configure it to invoke an AWS Lambda function ARN directly.
- **B.** Enable Security Hub Automation Rules to invoke an AWS Lambda function whenever a finding is selected in the console.
- **C.** Create a Security Hub Custom Action named Isolate-EC2 and use an EventBridge rule matching its ARN to invoke the Lambda function.
- **D.** Configure AWS Config Remediation Actions directly inside the Security Hub findings table to trigger SSM Automation.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một trung tâm điều hành bảo mật (SOC) sử dụng AWS Security Hub làm bảng điều khiển trung tâm. Vì việc tự động cô lập các EC2 instance production mà không có sự xác minh của con người có thể gây gián đoạn cho khách hàng, SOC muốn các chuyên viên phân tích xem xét thủ công một finding trong bảng điều khiển Security Hub và nhấp vào một nút có nhãn "Isolate-EC2" để kích hoạt quy trình khắc phục AWS Lambda tự động theo yêu cầu. Tính năng AWS Security Hub nào hỗ trợ quy trình có sự tham gia của con người (human-in-the-loop) này?

**Đáp án đúng:** **C**

Trong **AWS Security Hub**, khi cần quy trình khắc phục có con người phê duyệt (**human-in-the-loop**), sử dụng **Custom Actions** kết hợp với **EventBridge rule** lọc theo `detail-type: "Security Hub Findings - Custom Action"` và `resources: [<CustomActionARN>]` để gọi Lambda hoặc Step Functions.

- **A:** Security Hub Insights chỉ là bộ lọc gom nhóm để trực quan hóa findings trên bảng điều khiển, không thể kích hoạt trực tiếp Lambda hay gửi sự kiện hành động tùy chỉnh.
- **B:** Security Hub Automation Rules chạy tự động khi finding mới được nạp vào để cập nhật các trường metadata (như Severity, Workflow Status, Note), không phải nút bấm thủ công của SOC analyst để kích hoạt Lambda.
- **C (Đúng):** Chính xác! **Security Hub Custom Actions** cho phép nhà phân tích chọn một hoặc nhiều finding trên Security Hub Console rồi kích hoạt hành động thủ công; thao tác này phát ra sự kiện `Security Hub Findings - Custom Action` kèm Custom Action ARN tới EventBridge để kích hoạt Lambda hoặc SSM Automation khắc phục sự cố có kiểm duyệt (human-in-the-loop).
- **D:** AWS Config Remediation Actions được cấu hình trên từng AWS Config Rule, không phải cơ chế nút bấm Custom Action trên bất kỳ finding nào (như GuardDuty/Inspector finding) trong Security Hub.

</details>

### Câu 12 `hard`

Amazon GuardDuty generates a High-severity finding 'Backdoor:EC2/C&CActivity.B!DNS' for an Amazon EC2 instance that is part of an Auto Scaling group behind an Application Load Balancer. The security team must preserve the instance's volatile memory (RAM) and EBS volumes for forensic analysis while immediately stopping the instance from communicating with external hosts. Which sequence of actions should the security team take FIRST?

- **A.** Stop the EC2 instance immediately, take an EBS snapshot of all attached volumes, and detach the instance from the Auto Scaling group.
- **B.** Detach the EC2 instance from the ASG, apply an isolation security group, and capture memory via SSM before taking EBS snapshots.
- **C.** Replace the instance's security group with an isolation security group immediately, wait for the Auto Scaling group to mark it unhealthy, and then take EBS snapshots.
- **D.** Terminate the EC2 instance with EBS volume preservation enabled and launch a forensic workstation from the original AMI to inspect the compromise.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Amazon GuardDuty tạo ra một finding mức độ nghiêm trọng cao 'Backdoor:EC2/C&CActivity.B!DNS' cho một Amazon EC2 instance thuộc một Auto Scaling group phía sau Application Load Balancer. Nhóm bảo mật phải bảo toàn bộ nhớ khả biến (RAM) và các EBS volume của instance phục vụ phân tích điều tra số (forensic) đồng thời ngăn chặn ngay lập tức instance giao tiếp với các máy chủ bên ngoài. Nhóm bảo mật nên thực hiện trình tự hành động nào ĐẦU TIÊN?

**Đáp án đúng:** **B**

Trong quy trình EC2 Forensics & Containment của AWS: khi instance nằm trong Auto Scaling Group và cần giữ RAM, bắt buộc phải (1) Detach hoặc chuyển sang Standby khỏi ASG trước, (2) Cô lập mạng bằng Isolation Security Group và thu hồi IAM Role session, (3) Thu thập Memory Dump khi máy còn chạy và chụp EBS Snapshot để phân tích ở Clean-Room VPC.

- **A:** Dừng (Stop) EC2 instance sẽ làm mất toàn bộ dữ liệu bộ nhớ khả biến (volatile memory / RAM), vi phạm yêu cầu pháp chứng của đề bài.
- **B (Đúng):** Chính xác! Tách instance khỏi Auto Scaling group trước để tránh việc ASG thấy health check fail và tự động terminate instance làm mất chứng cứ; sau đó cô lập mạng bằng Isolation Security Group và thu thập RAM + EBS snapshot.
- **C:** Nếu không tách (detach) instance khỏi ASG trước khi cô lập mạng, ALB health check sẽ fail và ASG sẽ tự động terminate instance, làm mất cả RAM lẫn các volume có DeleteOnTermination=true.
- **D:** Terminate instance làm mất hoàn toàn RAM và trạng thái runtime; khởi chạy từ AMI gốc cũng không chứa dấu vết mã độc đang chạy trên máy bị xâm nhập.

</details>

### Câu 13 `hard`

A security engineer receives a GuardDuty finding 'UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration.OutsideAWS' indicating that temporary credentials issued to an EC2 instance's IAM role are being used from an external IP address. The engineer immediately detaches the IAM instance profile from the EC2 instance and removes the EC2 trust relationship from the role, but CloudTrail still shows API calls succeeding with those credentials. Why is this happening and how should the engineer immediately stop the unauthorized access?

- **A.** IAM changes take up to 60 minutes to propagate globally; wait for eventual consistency to revoke the existing STS session tokens.
- **B.** Delete the IAM role completely; deleting an IAM role immediately invalidates all active STS sessions while keeping the trust policy intact.
- **C.** STS tokens remain valid until expiration; attach an inline Deny-all policy with an aws:TokenIssueTime < current time condition.
- **D.** Rotate the AWS account root user access keys and enforce MFA on the EC2 instance profile.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư bảo mật nhận được finding từ GuardDuty 'UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration.OutsideAWS' cho biết thông tin xác thực tạm thời được cấp cho IAM role của một EC2 instance đang được sử dụng từ một địa chỉ IP bên ngoài. Kỹ sư ngay lập tức gỡ IAM instance profile khỏi EC2 instance và xóa quan hệ tin cậy (trust relationship) của EC2 khỏi role đó, nhưng CloudTrail vẫn cho thấy các lệnh gọi API thành công bằng thông tin xác thực đó. Tại sao điều này xảy ra và kỹ sư nên ngăn chặn ngay lập tức quyền truy cập trái phép như thế nào?

**Đáp án đúng:** **C**

Đây là câu hỏi kinh điển của SCS-C02 về xử lý sự cố lộ STS temporary credentials: thao tác chỉnh sửa Trust Policy hoặc gỡ Instance Profile không làm mất hiệu lực token đang hoạt động. Bắt buộc phải gắn Explicit Deny Policy với điều kiện `DateLessThan: { 'aws:TokenIssueTime': '<current-UTC-time>' }` để vô hiệu hóa ngay mọi phiên cũ.

- **A:** IAM thường đồng bộ trong vài giây, không phải 60 phút; và dù có đồng bộ xong thì việc sửa Trust Policy cũng không bao giờ thu hồi token STS đã cấp.
- **B:** Ngay cả khi xóa IAM role, các token tạm thời đã cấp vẫn có thể tiếp tục hoạt động trong một khoảng thời gian ngắn hoặc phá vỡ các workload hợp pháp khác đang dùng role đó; giải pháp chuẩn là Revoke active sessions bằng aws:TokenIssueTime.
- **C (Đúng):** Chính xác! Gỡ Instance Profile hoặc sửa Trust Policy chỉ ngăn việc cấp token MỚI, không vô hiệu hóa các STS token đã cấp. Cần gắn chính sách Explicit Deny với điều kiện DateLessThan trên aws:TokenIssueTime (tính năng Revoke Active Sessions).
- **D:** Root user access keys không liên quan đến IAM role của EC2, và EC2 instance profile không hỗ trợ gắn MFA theo cách này.

</details>

### Câu 14 `medium`

A company manages 80 AWS accounts in AWS Organizations and uses Amazon GuardDuty and AWS Security Hub across all accounts via a Delegated Administrator in the Security Tooling account. The SOC team wants to automatically isolate any EC2 instance whenever GuardDuty reports a CryptoCurrency finding with severity 7.0 or higher, and also wants a way for analysts to manually trigger a forensic snapshot workflow from the Security Hub console for lower-severity findings. Which TWO architectures meet these requirements? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Configure a GuardDuty Suppression Rule for severity >= 7 findings to automatically invoke an AWS Lambda remediation function.
- **B.** Create an EventBridge rule in the Delegated Admin matching CryptoCurrency:EC2 (severity >= 7) to trigger cross-account Lambda remediation.
- **C.** Enable Amazon Detective auto-remediation playbooks to directly modify EC2 security groups in member accounts.
- **D.** Configure a Security Hub Custom Action with an EventBridge rule matching that action ARN to trigger an SSM Automation runbook.
- **E.** Enable CloudTrail Insights in the Security Tooling account to forward GuardDuty findings directly to AWS Systems Manager Patch Manager.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty quản lý 80 tài khoản AWS trong AWS Organizations và sử dụng Amazon GuardDuty cùng AWS Security Hub trên tất cả tài khoản thông qua một Delegated Administrator trong tài khoản Security Tooling. Nhóm SOC muốn tự động cô lập bất kỳ EC2 instance nào mỗi khi GuardDuty báo cáo finding CryptoCurrency có mức độ nghiêm trọng từ 7.0 trở lên, và cũng muốn có cách để các chuyên viên phân tích kích hoạt thủ công quy trình chụp snapshot điều tra số từ bảng điều khiển Security Hub cho các finding mức độ nghiêm trọng thấp hơn. HAI kiến trúc nào đáp ứng các yêu cầu này? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Mô hình tự động ứng phó sự cố chuẩn trên AWS kết hợp EventBridge cho cả hai kịch bản: tự động hoàn toàn dựa trên pattern của GuardDuty Finding (severity/type) và bán tự động (human-in-the-loop) thông qua Security Hub Custom Actions.

- **A:** GuardDuty Suppression Rule chỉ dùng để tự động lưu trữ (auto-archive) các findings an toàn/false positive, không dùng để kích hoạt Lambda remediation.
- **B (Đúng):** Chính xác! Delegated Administrator nhận tập trung findings; EventBridge Rule lọc theo severity >= 7 và prefix 'CryptoCurrency:EC2' rồi gọi Lambda/Step Functions dùng Cross-Account IAM Role để cô lập EC2 ở member account.
- **C:** Amazon Detective là công cụ phân tích đồ thị hành vi để điều tra nguyên nhân gốc rễ (read-only investigation), không có tính năng tự động sửa đổi tài nguyên.
- **D (Đúng):** Chính xác! Security Hub Custom Action sinh ra sự kiện 'Security Hub Findings - Custom Action' trên EventBridge khi analyst bấm chọn thủ công trên console, phù hợp cho quy trình human-in-the-loop.
- **E:** CloudTrail Insights chỉ phát hiện bất thường về lưu lượng gọi API, không liên quan đến GuardDuty findings hay SSM Patch Manager.

</details>

---

[Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md)
