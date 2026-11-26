# Bài tập tình huống — Chủ đề 2: Bảo mật Đa tài khoản & Biên mạng — Organizations (SCP), IAM Identity Center, WAF, Shield, GuardDuty & Macie

> AWS Organizations Service Control Policies (SCP), IAM Identity Center (SSO), AWS WAF vs Shield Advanced, GuardDuty, Inspector & Amazon Macie.
> **Số câu hỏi:** 13 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A web application hosted behind an Amazon CloudFront distribution and an Application Load Balancer is experiencing an application-layer attack from thousands of botnet IP addresses. Any single IP address sending more than 1,000 HTTP requests within a 5-minute period must be automatically blocked until its request rate drops below the threshold. Which solution meets this requirement with the LEAST operational overhead?

- **A.** Update the VPC Network ACL (NACL) manually every minute to add offending botnet IP addresses to explicit inbound Deny rules.
- **B.** Configure an inbound Deny rule in the Application Load Balancer Security Group to block any source IP exceeding the request threshold.
- **C.** Configure an AWS WAF Web ACL with a rate-based rule set to 1,000 requests per 5-minute window and associate it with the CloudFront distribution.
- **D.** Enable Amazon Macie on the Application Load Balancer to inspect incoming HTTP headers and automatically throttle botnet traffic.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng web được lưu trữ phía sau một Amazon CloudFront distribution và một Application Load Balancer đang gặp phải cuộc tấn công ở tầng ứng dụng từ hàng nghìn địa chỉ IP botnet. Bất kỳ địa chỉ IP đơn lẻ nào gửi hơn 1.000 HTTP request trong khoảng thời gian 5 phút phải bị tự động chặn cho đến khi tốc độ gửi request giảm xuống dưới ngưỡng. Giải pháp nào đáp ứng yêu cầu này với chi phí vận hành THẤP NHẤT?

**Đáp án đúng:** **C**

Nhớ rõ: **Security Group chỉ có `Allow` (không có `Deny`)**; **NACL có `Allow/Deny` theo IP tĩnh nhưng giới hạn số rule**; còn **chặn tự động theo tốc độ request trên mỗi IP (Rate limiting) hoặc chặn SQLi/XSS/Geo-match** -> Chọn **AWS WAF (Rate-based rule)**.

- **A:** Sai vì NACL giới hạn số lượng rule rất nhỏ (mặc định 20, tối đa 40 rules) và không tự động đếm tần suất HTTP request.
- **B:** Sai vì Security Group chỉ có các quy tắc `Allow` (không có `Deny` từng IP).
- **C (Đúng):** Đúng! AWS WAF hỗ trợ **Rate-based Rules** tự động theo dõi số lượng request trên mỗi IP trong khung thời gian 5 phút (tối thiểu 100 requests) và tạm thời chặn IP vượt ngưỡng.
- **D:** Sai vì Macie chỉ dùng để phát hiện dữ liệu nhạy cảm PII trên S3.

</details>

### Câu 2 `medium`

A company wants to enable Single Sign-On (SSO) for its 500 employees so they can log in to the AWS Management Console across 30 AWS accounts in AWS Organizations and third-party SAML 2.0 business applications (such as Salesforce) using their existing corporate Active Directory credentials. Which AWS service should the solutions architect use?

- **A.** AWS IAM Identity Center (successor to AWS Single Sign-On)
- **B.** Amazon Cognito Identity Pools with federated SAML providers
- **C.** Create 500 individual IAM users in each of the 30 AWS accounts.
- **D.** AWS Resource Access Manager (RAM) with cross-account sharing

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty muốn kích hoạt Single Sign-On (SSO) cho 500 nhân viên để họ có thể đăng nhập vào AWS Management Console trên 30 AWS account trong AWS Organizations và các ứng dụng doanh nghiệp SAML 2.0 của bên thứ ba (như Salesforce) bằng thông tin đăng nhập Active Directory hiện có của công ty. Solutions architect nên sử dụng dịch vụ AWS nào?

**Đáp án đúng:** **A**

Phân biệt rõ:
- **Nhân viên công ty đăng nhập vào nhiều AWS Accounts + ứng dụng SAML** -> **AWS IAM Identity Center (AWS SSO)**.
- **Người dùng cuối (khách hàng) đăng nhập vào ứng dụng Web/Mobile** -> **Amazon Cognito**.

- **A (Đúng):** Đúng! **AWS IAM Identity Center** là dịch vụ chuẩn để quản lý đăng nhập một lần (SSO) tập trung cho nhiều tài khoản AWS trong AWS Organizations và các ứng dụng doanh nghiệp SAML 2.0.
- **B:** Sai vì Cognito dành cho khách hàng cuối sử dụng ứng dụng web/mobile (B2C), không phải công cụ quản trị đa tài khoản AWS Console cho nhân viên nội bộ.
- **C:** Sai vì việc quản lý 15,000 IAM users rời rạc gây gánh nặng vận hành khổng lồ và không phải SSO.
- **D:** Sai vì AWS RAM dùng để chia sẻ tài nguyên hạ tầng (Subnets, Transit Gateway, Route 53 Resolver) giữa các tài khoản chứ không quản lý đăng nhập người dùng.

</details>

### Câu 3 `medium`

A security architect is designing a multi-account AWS environment using AWS Organizations. Which THREE statements accurately describe Service Control Policies (SCPs)? (Choose THREE.)

*(Chọn 3 đáp án)*

- **A.** SCPs set the maximum available permissions for member accounts, but do not grant permissions on their own.
- **B.** SCPs apply to all IAM users, IAM roles, and the root user inside Member Accounts.
- **C.** SCPs do not affect users or roles in the Organization Management Account.
- **D.** SCPs automatically grant AdministratorAccess to the Management Account root user in all member accounts.
- **E.** SCPs can only restrict Amazon S3 and Amazon EC2 services.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiến trúc sư bảo mật đang thiết kế môi trường AWS đa tài khoản bằng AWS Organizations. BA phát biểu nào mô tả chính xác Service Control Policies (SCPs)? (Chọn BA đáp án.)

**Đáp án đúng:** **A, B, C**

3 quy tắc vàng của SCP: (1) Không cấp quyền, (2) Áp dụng cho cả Root User của Member Account, (3) Không áp dụng cho Management Account.

- **A (Đúng):** Đúng! SCP là rào chắn quyền tối đa (guardrails) và KHÔNG tự cấp quyền nếu bên trong tài khoản không có IAM Policy cho phép.
- **B (Đúng):** Đúng! SCP có hiệu lực lên cả Root User của các Member Accounts.
- **C (Đúng):** Đúng! SCP không bao giờ áp dụng cho Management Account (Master Account).
- **D:** Sai vì SCP không cấp quyền.
- **E:** Sai vì SCP kiểm soát được hầu hết mọi dịch vụ AWS.

</details>

### Câu 4 `medium`

A company has multiple AWS accounts managed by AWS Organizations. The security team needs to grant developers single sign-on (SSO) access to specific AWS accounts using their existing corporate Okta credentials, without creating individual IAM users in each AWS account. Which solution meets this requirement with the LEAST operational overhead?

- **A.** Create IAM users in the Management Account and configure cross-account IAM roles in each member account for developers.
- **B.** Configure AWS IAM Identity Center (AWS SSO) and integrate it with Okta using SAML 2.0 and SCIM for target AWS accounts.
- **C.** Use Amazon Cognito User Pools to federate corporate Okta users into the AWS Management Console across all member accounts.
- **D.** Set up an AWS Managed Microsoft AD and create manual IAM SAML identity providers in every individual member account.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có nhiều AWS account được quản lý bởi AWS Organizations. Nhóm bảo mật cần cấp quyền truy cập single sign-on (SSO) cho các lập trình viên vào những AWS account cụ thể bằng thông tin đăng nhập Okta hiện có của công ty, mà không cần tạo từng IAM user riêng lẻ trong mỗi AWS account. Giải pháp nào đáp ứng yêu cầu này với chi phí vận hành THẤP NHẤT?

**Đáp án đúng:** **B**

Trong môi trường đa tài khoản AWS Organizations muốn tích hợp IdP doanh nghiệp (Okta, Azure AD, Ping) để cấp quyền truy cập tập trung, **AWS IAM Identity Center** là giải pháp chuẩn mực với ít chi phí vận hành nhất.

- **A:** Sai vì tạo IAM user riêng lẻ không tận dụng được đăng nhập một lần (SSO) từ Okta và tăng gánh nặng quản lý credential.
- **B (Đúng):** Đúng! AWS IAM Identity Center là dịch vụ quản lý truy cập tập trung cho nhiều tài khoản AWS Organizations, hỗ trợ kết nối trực tiếp với IdP bên ngoài như Okta qua SAML 2.0 và đồng bộ nhóm/người dùng tự động qua SCIM.
- **C:** Sai vì Amazon Cognito dành cho người dùng ứng dụng (web/mobile end-users), không phải để quản trị truy cập AWS Management Console đa tài khoản.
- **D:** Sai vì cấu hình thủ công SAML IdP trên từng tài khoản riêng lẻ tốn nhiều công sức vận hành hơn hẳn so với dùng IAM Identity Center.

</details>

### Câu 5 `medium`

A mobile application allows users to sign in with their Google or Apple accounts and then upload profile photos directly to a dedicated folder in an Amazon S3 bucket. Which AWS service should the solutions architect use to authenticate the users and issue temporary AWS credentials for S3 access?

- **A.** Use AWS IAM Identity Center with external SAML integration to authenticate mobile app users via Google and Apple.
- **B.** Create an IAM user for each mobile app user and embed the static access keys directly inside the mobile app binary.
- **C.** Use Amazon Cognito Identity Pools with Google and Apple as providers to issue temporary STS credentials mapped to an IAM role.
- **D.** Use AWS Directory Service to store mobile user profiles and issue Amazon S3 pre-signed URLs directly to devices.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng di động cho phép người dùng đăng nhập bằng tài khoản Google hoặc Apple và sau đó tải ảnh đại diện trực tiếp lên một thư mục riêng trong Amazon S3 bucket. Solutions architect nên sử dụng dịch vụ AWS nào để xác thực người dùng và cấp thông tin xác thực AWS tạm thời cho quyền truy cập S3?

**Đáp án đúng:** **C**

Khi ứng dụng web/mobile cần xác thực người dùng qua mạng xã hội (Google, Apple, Facebook) và **cấp temporary AWS credentials** để truy cập trực tiếp S3 hoặc DynamoDB, hãy dùng **Amazon Cognito Identity Pools**.

- **A:** Sai vì IAM Identity Center dành cho nhân viên nội bộ truy cập AWS accounts và business apps, không dành cho hàng triệu người dùng ứng dụng di động.
- **B:** Sai vì nhúng access keys vào ứng dụng client là lỗ hổng bảo mật nghiêm trọng và IAM có giới hạn 5,000 users mỗi account.
- **C (Đúng):** Đúng! Amazon Cognito Identity Pools hỗ trợ Social Identity Providers (Google, Apple, Facebook) và trao đổi token để lấy AWS STS temporary credentials cho phép upload trực tiếp lên S3 theo phân quyền IAM Role.
- **D:** Sai vì AWS Directory Service dùng cho Microsoft Active Directory, không hỗ trợ social login Google/Apple hay tự phát hành pre-signed URL.

</details>

### Câu 6 `medium`

A security engineer wants to continuously monitor the AWS environment for malicious activity such as compromised EC2 instances communicating with known cryptocurrency mining IP addresses, unusual IAM API calls from Tor exit nodes, and anomalous S3 data access patterns. Which AWS service should be enabled?

- **A.** Enable Amazon Inspector across all accounts to continuously monitor VPC Flow Logs and DNS logs for cryptocurrency mining.
- **B.** Enable Amazon GuardDuty across all accounts and Regions to analyze CloudTrail, VPC Flow Logs, DNS logs, and S3 data events.
- **C.** Enable Amazon Macie across all Regions to detect unusual IAM API calls, S3 anomalies, and Tor exit node connections.
- **D.** Enable AWS Config conformance packs to automatically detect and block cryptocurrency mining traffic from EC2 instances.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư bảo mật muốn liên tục giám sát môi trường AWS để phát hiện các hoạt động độc hại như EC2 instance bị xâm nhập giao tiếp với các địa chỉ IP đào tiền mã hóa đã biết, các lệnh gọi IAM API bất thường từ các Tor exit node và các mẫu hình truy cập dữ liệu S3 bất thường. Nên kích hoạt dịch vụ AWS nào?

**Đáp án đúng:** **B**

Phân biệt bộ 3 bảo mật hay gặp trong SAA-C03: **GuardDuty** = Threat Detection (phát hiện tấn công, crypto mining, Tor); **Inspector** = Vulnerability Management (quét CVE trên EC2/ECR/Lambda); **Macie** = Sensitive Data Discovery (tìm PII trên S3).

- **A:** Sai vì Amazon Inspector chỉ quét lỗ hổng phần mềm (CVE) và cấu hình mạng mở trên EC2, ECR container images và Lambda functions.
- **B (Đúng):** Đúng! Amazon GuardDuty là dịch vụ phát hiện mối đe dọa thông minh (threat detection) phân tích liên tục CloudTrail, VPC Flow Logs, DNS Logs và S3 logs để phát hiện hành vi bất thường như crypto mining hay kết nối từ Tor.
- **C:** Sai vì Amazon Macie chuyên dùng để phát hiện dữ liệu nhạy cảm (PII, thẻ tín dụng) trong Amazon S3 bằng machine learning.
- **D:** Sai vì AWS Config dùng để ghi nhận và đánh giá cấu hình tài nguyên AWS theo thời gian, không phải dịch vụ threat detection.

</details>

### Câu 7 `medium`

A healthcare company stores millions of documents in Amazon S3 buckets. Before sharing these buckets with an analytics team, the compliance officer must automatically scan all existing and newly uploaded objects to identify any Personally Identifiable Information (PII) or Protected Health Information (PHI) and generate alerts. Which AWS service meets this requirement?

- **A.** Amazon GuardDuty
- **B.** AWS WAF
- **C.** Amazon Macie
- **D.** AWS Trusted Advisor

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty chăm sóc sức khỏe lưu trữ hàng triệu tài liệu trong các Amazon S3 bucket. Trước khi chia sẻ các bucket này với nhóm phân tích, nhân viên tuân thủ phải tự động quét tất cả các object hiện có và mới được tải lên để nhận diện bất kỳ Thông tin Định danh Cá nhân (PII) hoặc Thông tin Sức khỏe được Bảo vệ (PHI) nào và tạo cảnh báo. Dịch vụ AWS nào đáp ứng yêu cầu này?

**Đáp án đúng:** **C**

Bất cứ khi nào đề bài nhắc đến việc **quét nội dung Amazon S3 để phát hiện dữ liệu nhạy cảm (PII, PHI, financial data)** -> Đáp án chắc chắn là **Amazon Macie**.

- **A:** Sai vì GuardDuty phát hiện mối đe dọa dựa trên logs (CloudTrail, VPC Flow Logs, DNS, S3 API events), không quét nội dung file để tìm PII/PHI.
- **B:** Sai vì AWS WAF là tường lửa ứng dụng web (Layer 7) bảo vệ CloudFront, ALB và API Gateway.
- **C (Đúng):** Đúng! Amazon Macie sử dụng Machine Learning và nhận diện mẫu để tự động quét các S3 bucket nhằm phát hiện dữ liệu nhạy cảm như PII, PHI, số thẻ tín dụng và gửi cảnh báo qua EventBridge/Security Hub.
- **D:** Sai vì Trusted Advisor chỉ kiểm tra các thực hành tốt nhất (ví dụ S3 bucket có đang public không) chứ không quét nội dung bên trong object.

</details>

### Câu 8 `hard`

A company hosts a public e-commerce website using Amazon CloudFront in front of an Application Load Balancer. Recently, the site suffered a massive volumetric Layer 3/4 DDoS attack and a targeted Layer 7 HTTP flood. Management wants 24/7 access to the AWS Shield Response Team (SRT) during attacks and financial protection against scaling cost spikes on CloudFront and ALB caused by DDoS traffic. Which combination should the solutions architect implement?

- **A.** Rely on AWS Shield Standard on CloudFront and enable Amazon GuardDuty for automated Layer 7 HTTP flood mitigation.
- **B.** Deploy AWS Network Firewall in the VPC and attach an AWS WAF Web ACL only to the Application Load Balancer.
- **C.** Use AWS Shield Standard and configure Security Groups on the ALB to block all incoming traffic from non-CloudFront IPs.
- **D.** Subscribe to AWS Shield Advanced, associate it with CloudFront and ALB, and attach an AWS WAF Web ACL to CloudFront.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ một trang web thương mại điện tử công khai sử dụng Amazon CloudFront phía trước Application Load Balancer. Gần đây, trang web hứng chịu một cuộc tấn công DDoS lưu lượng lớn ở Layer 3/4 và một cuộc tấn công HTTP flood có chủ đích ở Layer 7. Ban quản lý muốn có quyền liên hệ 24/7 với AWS Shield Response Team (SRT) trong thời gian bị tấn công và được bảo vệ tài chính trước các đợt tăng chi phí mở rộng đột biến trên CloudFront và ALB do lưu lượng DDoS gây ra. Solutions architect nên triển khai sự kết hợp nào?

**Đáp án đúng:** **D**

Các dấu hiệu nhận biết **AWS Shield Advanced** (thay vì Shield Standard miễn phí): cần **24/7 Shield Response Team (SRT)**, **DDoS cost protection** (bảo vệ hóa đơn khi bị DDoS gây auto-scaling), và tích hợp sẵn **AWS WAF**.

- **A:** Sai vì AWS Shield Standard không có đội ngũ SRT 24/7 và không có cơ chế hoàn trả chi phí scale do DDoS (DDoS cost protection).
- **B:** Sai vì không có SRT 24/7 hay bảo vệ chi phí DDoS trên CloudFront; ngoài ra nên gắn WAF tại CloudFront để chặn ở edge.
- **C:** Sai vì dù chặn bypass ALB là thực hành tốt, nó vẫn không cung cấp SRT 24/7 và DDoS cost protection.
- **D (Đúng):** Đúng! AWS Shield Advanced cung cấp hỗ trợ 24/7 từ Shield Response Team (SRT), bảo vệ chi phí DDoS (DDoS cost protection) và đi kèm miễn phí AWS WAF để chặn tấn công Layer 7 trên CloudFront/ALB.

</details>

### Câu 9 `medium`

A DevOps team needs to ensure that all Amazon EC2 instances and container images stored in Amazon ECR are continuously scanned for software vulnerabilities (CVEs) and unintended network exposure, with findings aggregated in AWS Security Hub. Which service provides this capability?

- **A.** AWS Artifact
- **B.** Amazon Inspector
- **C.** Amazon Detective
- **D.** AWS CloudTrail

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm DevOps cần đảm bảo tất cả các Amazon EC2 instance và container image lưu trữ trong Amazon ECR đều được quét liên tục để phát hiện các lỗ hổng phần mềm (CVE) và tình trạng phơi bày mạng ngoài ý muốn, với các phát hiện được tổng hợp trong AWS Security Hub. Dịch vụ nào cung cấp khả năng này?

**Đáp án đúng:** **B**

**Amazon Inspector** là dịch vụ quét lỗ hổng tự động (Automated Vulnerability Management) cho **EC2, ECR container images và Lambda**, tích hợp liền mạch với AWS Security Hub.

- **A:** Sai vì AWS Artifact là cổng tải các báo cáo tuân thủ của AWS (SOC 2, PCI DSS, ISO).
- **B (Đúng):** Đúng! Amazon Inspector tự động và liên tục quét lỗ hổng phần mềm (CVE) cũng như khả năng tiếp cận mạng ngoài ý muốn cho EC2 instances, ECR container images và AWS Lambda functions, đồng thời gửi kết quả về Security Hub.
- **C:** Sai vì Amazon Detective giúp điều tra nguyên nhân gốc rễ (root cause analysis) của các cảnh báo bảo mật từ GuardDuty, không quét CVE.
- **D:** Sai vì CloudTrail ghi lại lịch sử các lời gọi API trong tài khoản AWS.

</details>

### Câu 10 `medium`

A company hosts a REST API using Amazon API Gateway backed by AWS Lambda. Recently, attackers have attempted SQL injection and cross-site scripting (XSS) payloads against the API, and a botnet is flooding specific endpoints from certain countries. Which AWS service should be attached to API Gateway to block SQLi, XSS, and geo-restricted traffic?

- **A.** AWS WAF
- **B.** VPC Network ACLs
- **C.** Amazon GuardDuty
- **D.** AWS Shield Standard

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ một REST API bằng Amazon API Gateway với backend là AWS Lambda. Gần đây, kẻ tấn công đã thử gửi các payload SQL injection và cross-site scripting (XSS) vào API, và một mạng botnet đang làm ngập các endpoint cụ thể từ một số quốc gia nhất định. Nên gắn dịch vụ AWS nào vào API Gateway để chặn SQLi, XSS và lưu lượng bị giới hạn theo vị trí địa lý?

**Đáp án đúng:** **A**

Bảo vệ **Layer 7 (SQLi, XSS, Geo-blocking, Rate-limiting)** cho **API Gateway, ALB hoặc CloudFront** -> Luôn chọn **AWS WAF**.

- **A (Đúng):** Đúng! AWS WAF hỗ trợ gắn trực tiếp vào API Gateway (cùng với CloudFront, ALB, AppSync) để lọc và chặn SQL Injection, XSS, rate-limiting và chặn theo quốc gia (Geo-match).
- **B:** Sai vì NACL chỉ lọc ở Layer 3/4 (IP/Port) trong VPC, không thể đọc HTTP payload để chặn SQLi/XSS và không gắn trực tiếp vào API Gateway.
- **C:** Sai vì GuardDuty là dịch vụ phát hiện mối đe dọa, không tự động chặn HTTP request ở Layer 7 trên API Gateway.
- **D:** Sai vì Shield Standard chỉ chống DDoS tầng mạng/vận chuyển (Layer 3/4), không kiểm tra SQLi/XSS ở Layer 7.

</details>

### Câu 11 `medium`

An enterprise security architect wants to centrally aggregate security findings from Amazon GuardDuty, Amazon Inspector, and Amazon Macie across 30 AWS accounts into a single dashboard, and run automated CIS AWS Foundations Benchmark checks. Additionally, the team needs to perform graph-based root cause investigation of GuardDuty alerts. Which TWO AWS services should the architect enable? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** AWS Artifact
- **B.** AWS Audit Manager
- **C.** AWS Security Hub
- **D.** Amazon Cognito
- **E.** Amazon Detective

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiến trúc sư bảo mật doanh nghiệp muốn tổng hợp tập trung các phát hiện bảo mật từ Amazon GuardDuty, Amazon Inspector và Amazon Macie trên 30 AWS account vào một bảng điều khiển duy nhất, và chạy kiểm tra tự động theo chuẩn CIS AWS Foundations Benchmark. Ngoài ra, nhóm cần thực hiện điều tra nguyên nhân gốc rễ dạng đồ thị đối với các cảnh báo GuardDuty. Kiến trúc sư nên bật HAI dịch vụ AWS nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

**AWS Security Hub** = Bảng điều khiển trung tâm tổng hợp findings + chạy chuẩn bảo mật (CIS, PCI). **Amazon Detective** = Phân tích đồ thị & điều tra nguyên nhân gốc rễ (Root Cause Investigation) cho các cảnh báo từ GuardDuty/Security Hub.

- **A:** Sai vì AWS Artifact chỉ cung cấp các báo cáo tuân thủ và thỏa thuận pháp lý của AWS.
- **B:** Sai vì Audit Manager thu thập bằng chứng kiểm toán cho các kỳ audit định kỳ, không thay thế Security Hub hay điều tra đồ thị sự cố như Detective.
- **C (Đúng):** Đúng! AWS Security Hub tổng hợp cảnh báo tập trung từ GuardDuty, Inspector, Macie, Firewall Manager trên nhiều tài khoản và tự động đánh giá tuân thủ các tiêu chuẩn như CIS AWS Foundations Benchmark, PCI DSS.
- **D:** Sai vì Cognito là dịch vụ xác thực người dùng cho ứng dụng.
- **E (Đúng):** Đúng! Amazon Detective tự động thu thập và dựng biểu đồ tương tác (behavior graph) từ CloudTrail, VPC Flow Logs và GuardDuty findings giúp điều tra nguyên nhân gốc rễ (root cause) của sự cố bảo mật.

</details>

### Câu 12 `medium`

A finance director wants to allocate AWS costs accurately across 5 different product teams sharing an AWS Organization, and also wants to prevent developers from accidentally launching expensive GPU instances (`p4d.24xlarge`) in non-production accounts. Which TWO AWS features or services should be implemented? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Standardize Cost Allocation Tags (such as `Team` and `Environment`) and activate them in the Billing console.
- **B.** Enable Amazon GuardDuty across all accounts to automatically terminate expensive GPU instances on launch.
- **C.** Use AWS Budgets to block `ec2:RunInstances` API calls without configuring IAM policies or SCPs.
- **D.** Create an Organizations SCP denying `ec2:RunInstances` for unapproved or GPU instance types on non-prod OUs.
- **E.** Use AWS Artifact compliance reports to enforce EC2 instance type restrictions across product teams.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một giám đốc tài chính muốn phân bổ chính xác chi phí AWS cho 5 nhóm sản phẩm khác nhau dùng chung một AWS Organization, đồng thời muốn ngăn các lập trình viên vô tình khởi chạy các GPU instance đắt tiền (`p4d.24xlarge`) trong các tài khoản non-production. Nên triển khai HAI tính năng hoặc dịch vụ AWS nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, D**

Quản trị chi phí đa tài khoản (FinOps Governance): **Cost Allocation Tags** để phân bổ hóa đơn chính xác theo team/sản phẩm, và **Organizations SCP** để chặn cứng việc tạo các tài nguyên đắt đỏ ở các môi trường dev/sandbox.

- **A (Đúng):** Đúng! Cost Allocation Tags giúp phân bổ và theo dõi chi phí chi tiết theo từng team/dự án trong Cost Explorer và AWS Budgets.
- **B:** Sai vì GuardDuty không có tính năng terminate EC2 instance hay kiểm soát chi phí loại instance.
- **C:** Sai vì AWS Budgets chủ yếu gửi cảnh báo (hoặc kích hoạt Budget Action gắn IAM policy khi vượt ngưỡng chi phí), không trực tiếp chặn từng loại instance trước khi phát sinh chi phí như SCP.
- **D (Đúng):** Đúng! SCP là rào chắn phòng ngừa (preventive guardrail) ở cấp độ tài khoản/OU, giúp chặn hoàn toàn việc khởi chạy các loại EC2 đắt tiền trong môi trường dev/test.
- **E:** Sai vì AWS Artifact là nơi tải báo cáo tuân thủ, không kiểm soát tài nguyên.

</details>

### Câu 13 `medium`

A financial services company stores millions of customer documents across dozens of Amazon S3 buckets in multiple AWS accounts. The compliance team requires an automated solution that uses machine learning to continually discover, classify, and alert on objects that inadvertently contain passport numbers, credit card numbers, or other Personally Identifiable Information (PII). Which AWS service should a solutions architect recommend?

- **A.** Amazon GuardDuty
- **B.** Amazon Macie
- **C.** Amazon Inspector
- **D.** AWS WAF

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty dịch vụ tài chính lưu trữ hàng triệu tài liệu khách hàng trên hàng chục Amazon S3 bucket thuộc nhiều AWS account khác nhau. Nhóm tuân thủ yêu cầu một giải pháp tự động sử dụng machine learning để liên tục phát hiện, phân loại và cảnh báo về các object vô tình chứa số hộ chiếu, số thẻ tín dụng hoặc các Thông tin Định danh Cá nhân (PII) khác. Solutions architect nên đề xuất dịch vụ AWS nào?

**Đáp án đúng:** **B**

Cứ gặp bài toán **discover sensitive data / PII in Amazon S3 using machine learning** -> đáp án luôn là **Amazon Macie**.

- **A:** Sai vì GuardDuty phân tích log sự kiện (CloudTrail, VPC Flow Logs, DNS Logs, S3 Data Events) để phát hiện hành vi tấn công chứ không quét nội dung văn bản tìm PII bên trong S3 object.
- **B (Đúng):** Đúng! Amazon Macie là dịch vụ bảo mật dữ liệu sử dụng Machine Learning và pattern matching để tự động phát hiện dữ liệu nhạy cảm (PII/PHI/Financial data) lưu trong Amazon S3.
- **C:** Sai vì Amazon Inspector dùng để quét lỗ hổng phần mềm (CVE) và cấu hình mạng trên EC2, ECR Container Images và hàm Lambda.
- **D:** Sai vì AWS WAF là tường lửa ứng dụng web chặn lưu lượng HTTP/HTTPS độc hại ở biên chứ không quét dữ liệu lưu trữ trong S3.

</details>

---

[Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md)
