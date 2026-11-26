# Bài tập tình huống — Bảo mật Mạng Biên: CloudFront, AWS WAF, Shield Advanced & Firewall Manager

> CloudFront OAC, Signed URLs/Cookies, AWS WAF Rate-Based & Managed Rules, Shield Advanced DDoS Mitigation (SRT) và Firewall Manager.
> **Số câu hỏi:** 10 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

An enterprise operates 120 AWS accounts inside an AWS Organization. The security team needs to automatically enforce a baseline AWS WAF web ACL on every existing and newly created Application Load Balancer tagged with Environment=Production, and continuously audit and auto-remediate any EC2 Security Group across all accounts that opens SSH (port 22) to 0.0.0.0/0. Which AWS service should the team use?

- **A.** AWS Organizations Service Control Policies (SCPs) denying ec2:AuthorizeSecurityGroupIngress and elasticloadbalancing:CreateLoadBalancer.
- **B.** AWS Shield Advanced applied via CloudFormation StackSets across all member accounts.
- **C.** AWS Firewall Manager with an AWS WAF policy and a Security Group Content Audit policy.
- **D.** Amazon GuardDuty with automated EventBridge rules in each member account.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp vận hành 120 tài khoản AWS bên trong một AWS Organization. Nhóm bảo mật cần tự động thực thi một AWS WAF web ACL cơ sở trên mọi Application Load Balancer hiện có và mới tạo được gắn thẻ Environment=Production, đồng thời liên tục kiểm toán và tự động khắc phục bất kỳ EC2 Security Group nào trên tất cả các tài khoản mở SSH (port 22) tới 0.0.0.0/0. Nhóm nên sử dụng dịch vụ AWS nào?

**Đáp án đúng:** **C**

AWS Firewall Manager là giải pháp chuyên dụng quản lý đa tài khoản trong AWS Organizations cho: AWS WAF, AWS Shield Advanced, VPC Security Groups (Common SG, Content Audit, Usage Audit), AWS Network Firewall và Route 53 Resolver DNS Firewall—có khả năng tự động áp dụng lên tài nguyên mới và tự động khắc phục (auto-remediation).

- **A:** SCP không thể tự động gắn AWS WAF web ACL lên ALB và cũng không có condition key để kiểm tra chi tiết từng CIDR/port (như port 22 từ 0.0.0.0/0) bên trong lời gọi ec2:AuthorizeSecurityGroupIngress.
- **B:** Shield Advanced tập trung bảo vệ chống DDoS, không dùng để kiểm toán và tự động sửa các rule SSH 0.0.0.0/0 trên EC2 Security Groups.
- **C (Đúng):** Chính xác! AWS Firewall Manager cho phép quản trị tập trung và tự động áp dụng (kèm auto-remediation) các chính sách AWS WAF theo tag tài nguyên và chính sách kiểm toán/khắc phục nội dung Security Group (Security Group Content Audit) trên toàn bộ AWS Organization, kể cả tài khoản và tài nguyên mới tạo.
- **D:** GuardDuty là dịch vụ phát hiện mối đe dọa chứ không phải công cụ thực thi chính sách WAF và Security Group baseline tập trung đa tài khoản.

</details>

### Câu 2 `hard`

A web application is served through Amazon CloudFront protected by AWS WAF, with an internet-facing Application Load Balancer (ALB) as the origin. During a security assessment, penetration testers discover the ALB's public DNS name and send malicious HTTP requests directly to the ALB, completely bypassing CloudFront and AWS WAF. Which combination of controls MOST securely prevents direct access to the ALB?

- **A.** Restrict the ALB SG to the CloudFront prefix list, inject a secret header in CloudFront, and match it on an ALB listener rule.
- **B.** Restrict the ALB Security Group inbound rules only to the AWS-managed CloudFront prefix list without any header validation.
- **C.** Configure CloudFront Origin Access Control (OAC) and attach it to the Application Load Balancer.
- **D.** Move the ALB into a private subnet without a public IP and connect CloudFront directly over the public internet using HTTPS.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng web được phục vụ thông qua Amazon CloudFront được bảo vệ bởi AWS WAF, với một Application Load Balancer (ALB) hướng internet làm origin. Trong một đợt đánh giá bảo mật, các chuyên gia kiểm thử xâm nhập phát hiện tên DNS công khai của ALB và gửi các HTTP request độc hại trực tiếp tới ALB, vượt qua hoàn toàn CloudFront và AWS WAF. Sự kết hợp các biện pháp kiểm soát nào ngăn chặn truy cập trực tiếp tới ALB một cách BẢO MẬT NHẤT?

**Đáp án đúng:** **A**

Bảo vệ ALB Origin sau CloudFront + WAF là bài toán cực kỳ kinh điển trong SCS-C02: kết hợp **CloudFront Managed Prefix List** trên ALB Security Group (chặn truy cập trực tiếp từ internet) + **Custom Origin Header** (`X-Origin-Verify` xoay vòng qua Secrets Manager) kiểm tra tại ALB Listener Rule (chặn kẻ tấn công dùng CloudFront distribution khác gọi tới ALB). Lưu ý: hiện nay AWS cũng có CloudFront VPC Origins cho private ALB.

- **A (Đúng):** Chính xác! Đây là mô hình bảo vệ Origin 2 lớp chuẩn của AWS: (1) Giới hạn Security Group của ALB bằng AWS-managed CloudFront prefix list để chặn mọi IP không phải CloudFront ở tầng mạng, và (2) Chèn Custom Secret Header (được xoay vòng bằng Secrets Manager/Lambda) + ALB Listener Rule kiểm tra header để ngăn kẻ tấn công tạo CloudFront distribution khác trỏ vào ALB của bạn.
- **B:** Chỉ giới hạn theo CloudFront prefix list vẫn chưa đủ an toàn tuyệt đối vì bất kỳ khách hàng AWS nào khác cũng có thể tạo một CloudFront distribution riêng trỏ origin vào DNS name của ALB của bạn (đều dùng chung dải IP của CloudFront) để vượt qua WAF của bạn.
- **C:** CloudFront Origin Access Control (OAC) dùng để ký SigV4 cho các origin như Amazon S3, Lambda Function URL, MediaPackage hoặc Elemental MediaStore—không dùng để xác thực trực tiếp với ALB.
- **D:** Nếu không sử dụng CloudFront VPC Origins, CloudFront tiêu chuẩn không thể kết nối tới ALB nằm trong private subnet không có public IP qua public internet.

</details>

### Câu 3 `hard`

An e-commerce application behind Amazon CloudFront and AWS WAF experiences credential stuffing attacks targeting only the /api/v1/login endpoint, along with automated scraping bots hitting product pages. To minimize AWS WAF Bot Control costs, the security team wants to inspect ONLY requests to /api/v1/login and /products/* with Bot Control and require a CAPTCHA challenge when suspicious automated traffic targets /api/v1/login. What should the team configure in AWS WAF?

- **A.** Add Bot Control with a scope-down statement for /api/v1/login and /products/*, and a CAPTCHA rule on /api/v1/login.
- **B.** Create a separate CloudFront distribution for /api/v1/login and attach an AWS Shield Advanced protection group to enforce CAPTCHA challenges.
- **C.** Apply the Bot Control rule group globally to all requests and use a rate-based rule to drop requests after 10,000 requests per 5 minutes.
- **D.** Replace AWS WAF with an Application Load Balancer listener rule that redirects automated user-agents to a custom login page.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng thương mại điện tử phía sau Amazon CloudFront và AWS WAF gặp phải các cuộc tấn công nhồi nhét thông tin xác thực (credential stuffing) chỉ nhắm vào endpoint /api/v1/login, cùng với các bot thu thập dữ liệu tự động tấn công các trang sản phẩm. Để giảm thiểu chi phí AWS WAF Bot Control, nhóm bảo mật muốn CHỈ kiểm tra các request tới /api/v1/login và /products/* bằng Bot Control và yêu cầu thử thách CAPTCHA khi lưu lượng tự động đáng ngờ nhắm vào /api/v1/login. Nhóm nên cấu hình gì trong AWS WAF?

**Đáp án đúng:** **A**

Trong **AWS WAF**, sử dụng **Scope-down statement** trên **Bot Control Managed Rule Group** là best practice để giảm chi phí bằng cách chỉ kiểm tra các đường dẫn quan trọng, đồng thời tận dụng các **labels** sinh ra bởi Bot Control để áp dụng hành động **CAPTCHA** hoặc **Challenge** chính xác theo từng endpoint.

- **A (Đúng):** Chính xác! Scope-down statement trong AWS WAF giới hạn các request đi vào Bot Control rule group (chỉ tính phí cho lưu lượng khớp URI `/api/v1/login` và `/products/*`), sau đó kết hợp rule tùy chỉnh kiểm tra nhãn (label) do Bot Control gắn để kích hoạt hành động CAPTCHA cho `/api/v1/login`.
- **B:** AWS Shield Advanced chống tấn công DDoS tầng 3/4/7 nhưng không có tính năng Bot Control hay thách thức CAPTCHA; việc tách CloudFront distribution cũng phức tạp không cần thiết.
- **C:** Áp dụng Bot Control cho toàn bộ lưu lượng (không dùng scope-down statement) sẽ phát sinh chi phí cao trên các static asset hoặc đường dẫn không cần thiết, không đáp ứng mục tiêu tối ưu chi phí.
- **D:** ALB listener rule chỉ lọc đơn giản theo User-Agent header (dễ bị giả mạo) và không có khả năng nhận diện bot nâng cao hay CAPTCHA như AWS WAF Bot Control.

</details>

### Câu 4 `hard`

A high-traffic media streaming platform uses Amazon CloudFront and AWS Shield Advanced. During a recent Layer 7 HTTP flood attack, the security team spent 25 minutes manually analyzing logs and writing AWS WAF rate-based rules to mitigate the attack. The company wants AWS Shield Advanced to automatically create and deploy tailored AWS WAF rules to block Layer 7 DDoS traffic as soon as an attack is detected, without waiting for manual intervention or AWS Shield Response Team (SRT) engagement. What should the team configure?

- **A.** Enable AWS Firewall Manager proactive engagement and assign an IAM role allowing Firewall Manager to restart CloudFront edge locations.
- **B.** Enable Shield Advanced automatic L7 DDoS mitigation in Block mode on CloudFront with a Route 53 health check.
- **C.** Configure Amazon GuardDuty to automatically update the VPC Network ACLs attached to the CloudFront origin.
- **D.** Enable AWS Shield Standard on the Application Load Balancer origin so that HTTP floods are automatically mitigated at the edge.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng phát trực tuyến phương tiện lưu lượng cao sử dụng Amazon CloudFront và AWS Shield Advanced. Trong một cuộc tấn công ngập lụt HTTP Layer 7 gần đây, nhóm bảo mật đã mất 25 phút phân tích log thủ công và viết các quy tắc giới hạn tốc độ AWS WAF để giảm thiểu cuộc tấn công. Công ty muốn AWS Shield Advanced tự động tạo và triển khai các quy tắc AWS WAF phù hợp để chặn lưu lượng DDoS Layer 7 ngay khi phát hiện cuộc tấn công, mà không cần chờ can thiệp thủ công hoặc sự tham gia của AWS Shield Response Team (SRT). Nhóm nên cấu hình gì?

**Đáp án đúng:** **B**

**AWS Shield Advanced Automatic Application Layer DDoS Mitigation** (ở chế độ `Count` hoặc `Block`) tự động phát hiện và tạo các rule AWS WAF phù hợp với chữ ký của cuộc tấn công HTTP flood tầng 7 trên CloudFront hoặc ALB mà không cần can thiệp thủ công. Gắn **Route 53 health check** giúp tăng tốc độ và độ chính xác nhận diện tấn công.

- **A:** Proactive engagement giúp đội SRT chủ động liên hệ với khách hàng khi Route 53 health check báo lỗi, không phải cơ chế tự động sinh WAF rule tức thì; hơn nữa không có khái niệm restart CloudFront edge locations.
- **B (Đúng):** Chính xác! Tính năng Automatic Application Layer DDoS Mitigation của AWS Shield Advanced ở chế độ Block tự động phân tích chữ ký tấn công tầng 7 và tự tạo/triển khai các rule AWS WAF (trong managed rule group do Shield quản lý) ngay lập tức khi phát hiện tấn công; kết hợp Route 53 health check giúp tăng độ chính xác phát hiện sự cố.
- **C:** GuardDuty không có tính năng tự động tạo WAF rule chống L7 DDoS cho CloudFront và NACL ở origin không thể chặn tấn công HTTP flood ngay tại tầng CloudFront edge.
- **D:** AWS Shield Standard chỉ bảo vệ tự động trước các cuộc tấn công phổ biến ở tầng 3/4 (SYN flood, UDP reflection), không có tính năng tự động tạo rule WAF chống L7 DDoS.

</details>

### Câu 5 `hard`

A B2B SaaS API hosted behind an Application Load Balancer and AWS WAF receives legitimate high-volume traffic from enterprise customers whose thousands of employees share a single corporate NAT IP address. However, individual abusive API clients sometimes flood the API using a single stolen API key passed in the X-API-Key HTTP header. If the security team blocks by source IP, entire corporate offices are locked out. How should the team configure an AWS WAF rate-based rule to throttle ONLY abusive API keys?

- **A.** Create an AWS WAF rate-based rule using Custom keys as the request aggregation method, specifying the X-API-Key HTTP header as the aggregation key.
- **B.** Create an AWS WAF rate-based rule aggregating by source IP address and lower the rate limit to 100 requests per 5 minutes.
- **C.** Create an AWS WAF IP set containing all corporate NAT IP addresses and set the rule action to Block.
- **D.** Configure an ALB security group rule to rate-limit incoming requests based on the X-API-Key HTTP header.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một B2B SaaS API lưu trữ phía sau Application Load Balancer và AWS WAF nhận lưu lượng lớn hợp pháp từ các khách hàng doanh nghiệp có hàng nghìn nhân viên dùng chung một địa chỉ IP NAT doanh nghiệp duy nhất. Tuy nhiên, các client API lạm dụng riêng lẻ đôi khi làm ngập lụt API bằng một API key bị đánh cắp duy nhất được truyền trong HTTP header X-API-Key. Nếu nhóm bảo mật chặn theo IP nguồn, toàn bộ văn phòng doanh nghiệp sẽ bị khóa. Nhóm nên cấu hình quy tắc giới hạn tốc độ AWS WAF như thế nào để CHỈ điều tiết các API key lạm dụng?

**Đáp án đúng:** **A**

Trong **AWS WAF Rate-Based Rules**, ngoài mặc định đếm theo Source IP hoặc Forwarded IP (`X-Forwarded-For`), bạn có thể chọn **Custom keys** (như `Header` `X-API-Key`, `Cookie`, `URI path`) để giới hạn chính xác từng client/tenant ngay cả khi nhiều người dùng chia sẻ cùng một IP NAT.

- **A (Đúng):** Chính xác! AWS WAF Rate-Based Rule hỗ trợ **Custom aggregation keys** (như HTTP Header `X-API-Key`, Query argument, Cookie, Label, HTTP method...), cho phép đếm và giới hạn tốc độ chính xác theo từng API key thay vì theo địa chỉ IP nguồn, tránh chặn nhầm các văn phòng dùng chung IP NAT.
- **B:** Giới hạn theo Source IP với ngưỡng thấp sẽ chặn toàn bộ nhân viên doanh nghiệp đi qua cùng địa chỉ NAT IP.
- **C:** Chặn IP doanh nghiệp sẽ khóa toàn bộ khách hàng hợp lệ thay vì chỉ chặn API key lạm dụng.
- **D:** Security Group hoạt động ở tầng 3/4 (IP/Port), không đọc được HTTP header và không có tính năng rate limiting.

</details>

### Câu 6 `hard`

A company wants to prevent EC2 instances across 30 VPCs from resolving known malware command-and-control domains and newly observed botnet domains, while ensuring that if the DNS filtering service experiences an unexpected internal error, DNS resolution for critical production workloads fails open so business operations are not disrupted. Which AWS service and configuration meets these requirements with the LEAST operational overhead?

- **A.** Deploy a custom BIND DNS proxy cluster on EC2 instances in every VPC and update all DHCP option sets.
- **B.** Use Route 53 Resolver DNS Firewall with AWS Managed Domain Lists, fail-open enabled, and share via AWS RAM.
- **C.** Configure AWS WAF Managed Rules for Known Bad Inputs on the VPC Internet Gateways.
- **D.** Create VPC Network ACL rules blocking the IP addresses of all known malware domains.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty muốn ngăn chặn các EC2 instance trên 30 VPC phân giải các tên miền command-and-control phần mềm độc hại đã biết và các tên miền botnet mới được quan sát, đồng thời đảm bảo rằng nếu dịch vụ lọc DNS gặp lỗi nội bộ bất ngờ, quá trình phân giải DNS cho các workload production quan trọng sẽ fail-open để hoạt động kinh doanh không bị gián đoạn. Dịch vụ và cấu hình AWS nào đáp ứng các yêu cầu này với chi phí vận hành ÍT NHẤT?

**Đáp án đúng:** **B**

**Amazon Route 53 Resolver DNS Firewall** lọc các truy vấn DNS phát sinh từ VPC bằng Custom hoặc **AWS Managed Domain Lists** (Malware, Botnet C2, Aggregate Threat List), hỗ trợ chia sẻ đa tài khoản qua **AWS RAM** / **Firewall Manager**, và có tùy chọn **Fail-open** (ưu tiên tính sẵn sàng) hoặc **Fail-closed** (ưu tiên bảo mật tuyệt đối).

- **A:** Tự vận hành cụm BIND DNS proxy trong 30 VPC tốn rất nhiều công sức vận hành và tự cập nhật danh sách tên miền độc hại, không phải giải pháp ít gánh nặng vận hành nhất.
- **B (Đúng):** Chính xác! Route 53 Resolver DNS Firewall cung cấp sẵn các AWS Managed Domain Lists chuyên chặn malware/botnet C2, cho phép chia sẻ tập trung qua AWS RAM (hoặc triển khai qua Firewall Manager) tới 30 VPC, và hỗ trợ cấu hình **Fail-open** để đảm bảo hệ thống không bị gián đoạn phân giải DNS nếu firewall gặp sự cố nội bộ.
- **C:** AWS WAF không thể gắn lên VPC Internet Gateway và không lọc truy vấn DNS (UDP/TCP 53).
- **D:** NACL có giới hạn số lượng rule rất nhỏ (mặc định 20, tối đa 40), chỉ lọc theo IP tĩnh (không lọc được theo tên miền động của botnet/malware) và không thể tự cập nhật danh sách mối đe dọa.

</details>

### Câu 7 `hard`

A media company serves private digital assets from an Amazon S3 bucket encrypted with a customer managed AWS KMS key (SSE-KMS) through an Amazon CloudFront distribution. The security team wants to ensure that users can ONLY access the S3 objects via CloudFront (blocking all direct S3 access) and that CloudFront can securely decrypt the SSE-KMS encrypted objects without using Lambda@Edge. Which configuration should the team implement?

- **A.** Configure a CloudFront Origin Access Identity (OAI) and grant the OAI canonical user ID kms:Decrypt permissions in the KMS key policy.
- **B.** Enable S3 static website hosting on the bucket and restrict access using a custom Referer header checked by the KMS key policy.
- **C.** Use CloudFront OAC, allow cloudfront.amazonaws.com (aws:SourceArn) in the S3 bucket policy and kms:Decrypt in the KMS policy.
- **D.** Make the S3 bucket public read-only and rely on CloudFront Signed URLs to prevent direct S3 downloads.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty truyền thông phục vụ các tài sản kỹ thuật số riêng tư từ một Amazon S3 bucket được mã hóa bằng customer managed AWS KMS key (SSE-KMS) thông qua một Amazon CloudFront distribution. Nhóm bảo mật muốn đảm bảo người dùng CHỈ có thể truy cập các đối tượng S3 thông qua CloudFront (chặn tất cả truy cập S3 trực tiếp) và CloudFront có thể giải mã an toàn các đối tượng được mã hóa SSE-KMS mà không cần sử dụng Lambda@Edge. Nhóm nên triển khai cấu hình nào?

**Đáp án đúng:** **C**

Một bẫy kinh điển của SCS-C02: **CloudFront OAI (legacy)** KHÔNG hỗ trợ **SSE-KMS**; luôn phải dùng **CloudFront Origin Access Control (OAC)** kết hợp cấp quyền cho service principal `cloudfront.amazonaws.com` (kèm điều kiện `aws:SourceArn`) trên cả **S3 Bucket Policy** và **KMS Key Policy** (`kms:Decrypt`, `kms:GenerateDataKey*`).

- **A:** Legacy CloudFront Origin Access Identity (OAI) KHÔNG hỗ trợ truy cập S3 object được mã hóa bằng SSE-KMS; bắt buộc phải dùng Origin Access Control (OAC).
- **B:** S3 static website endpoint không hỗ trợ HTTPS tới origin và không hỗ trợ OAC/SSE-KMS theo cách an toàn; ngoài ra KMS key policy không kiểm tra HTTP Referer header.
- **C (Đúng):** Chính xác! **CloudFront Origin Access Control (OAC)** hỗ trợ xác thực SigV4 và làm việc trực tiếp với S3 mã hóa **SSE-KMS** (điều mà OAI cũ không hỗ trợ). Chỉ cần cấp quyền `s3:GetObject` trong bucket policy và `kms:Decrypt` trong KMS key policy cho `cloudfront.amazonaws.com` kèm điều kiện `aws:SourceArn` trỏ tới ARN của CloudFront distribution.
- **D:** Mở S3 bucket công khai sẽ cho phép bất kỳ ai tải thẳng từ S3 URL mà bỏ qua hoàn toàn CloudFront và Signed URLs.

</details>

### Câu 8 `hard`

A large enterprise with 100 AWS accounts in AWS Organizations wants to centrally enforce baseline AWS WAF Web ACLs on all Application Load Balancers, automatically remediate overly permissive VPC Security Groups, and ensure every newly created account automatically inherits these network protections without manual intervention. Which TWO capabilities of AWS Firewall Manager enable this architecture? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** AWS Firewall Manager replaces AWS IAM Identity Center to enforce multi-factor authentication for all console logins.
- **B.** Firewall Manager integrates with Organizations and AWS Config to auto-apply WAF policies to existing and new ALBs.
- **C.** AWS Firewall Manager can only be administered from the AWS Organizations management account and does not support a delegated administrator account.
- **D.** Firewall Manager Security Group audit policies detect and auto-remediate non-compliant SG rules across member accounts.
- **E.** AWS Firewall Manager works without enabling AWS Config in the member accounts.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp lớn với 100 tài khoản AWS trong AWS Organizations muốn thực thi tập trung các AWS WAF Web ACL cơ sở trên tất cả các Application Load Balancer, tự động khắc phục các VPC Security Group quá rộng và đảm bảo mọi tài khoản mới tạo tự động kế thừa các biện pháp bảo vệ mạng này mà không cần can thiệp thủ công. HAI khả năng nào của AWS Firewall Manager cho phép kiến trúc này? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

**AWS Firewall Manager** là công cụ quản trị tập trung các kiểm soát mạng đa tài khoản (WAF, Shield Advanced, Security Groups, Network Firewall, DNS Firewall). Điều kiện tiên quyết: bật **AWS Organizations (All Features)**, bật **AWS Config** ở mọi member account/Region, và chỉ định **Delegated Administrator**.

- **A:** Firewall Manager chỉ quản lý tập trung các chính sách bảo mật mạng/biên (WAF, Shield Advanced, Security Groups, Network Firewall, Route 53 DNS Firewall), không quản lý danh tính hay MFA.
- **B (Đúng):** Chính xác! AWS Firewall Manager tích hợp chặt chẽ với AWS Organizations và AWS Config để tự động triển khai và duy trì chính sách AWS WAF trên toàn bộ ALB/CloudFront/API Gateway hiện có lẫn tài nguyên mới tạo trong các account/OU mục tiêu.
- **C:** Ngược lại, AWS Firewall Manager yêu cầu chỉ định một tài khoản **Delegated Administrator** (ví dụ tài khoản Security Tooling) để quản trị tập trung các chính sách firewall.
- **D (Đúng):** Chính xác! Firewall Manager cung cấp loại chính sách **Audit and enforcement of security group rules** cho phép kiểm tra và bật tự động khắc phục (auto-remediation) các rule Security Group không tuân thủ trên toàn bộ tổ chức.
- **E:** Một điều kiện tiên quyết (prerequisite) bắt buộc của AWS Firewall Manager là phải bật **AWS Config** trên tất cả các tài khoản thành viên và Region thuộc phạm vi quản lý.

</details>

### Câu 9 `hard`

A company hosts a public web application on an Application Load Balancer (ALB) behind Amazon CloudFront with AWS WAF attached to the CloudFront distribution. A penetration test reveals that attackers can discover the ALB's DNS name and send malicious HTTP requests directly to the ALB, bypassing AWS WAF completely. Which solution BEST prevents origin bypass with minimal ongoing operational overhead?

- **A.** Restrict the ALB security group inbound rule to the AWS-managed CloudFront origin-facing prefix list only.
- **B.** Create a Lambda function that subscribes to the AmazonIpSpaceChanged SNS topic to update a Network ACL on the ALB subnet with CloudFront IP ranges.
- **C.** Move the ALB into private subnets and connect CloudFront to the ALB using an S3 Origin Access Control (OAC).
- **D.** Restrict the ALB SG to the CloudFront prefix list, inject a custom secret header in CloudFront, and validate it via an ALB listener rule.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ một ứng dụng web công khai trên Application Load Balancer (ALB) phía sau Amazon CloudFront với AWS WAF được gắn vào CloudFront distribution. Một đợt kiểm thử xâm nhập phát hiện kẻ tấn công có thể tìm ra tên DNS của ALB và gửi các HTTP request độc hại trực tiếp tới ALB, vượt qua hoàn toàn AWS WAF. Giải pháp nào ngăn chặn việc đi vòng qua origin (origin bypass) TỐT NHẤT với chi phí vận hành liên tục tối thiểu?

**Đáp án đúng:** **D**

Phòng chống Origin Bypass cho ALB sau CloudFront là mẫu kiến trúc kinh điển trong Domain 3: luôn kết hợp **CloudFront Managed Prefix List** trên ALB Security Group (chặn Internet trực tiếp) VÀ **Custom Secret Header** kiểm tra tại ALB Listener Rule (chặn distribution giả mạo từ tài khoản AWS khác).

- **A:** Chỉ dùng Prefix List là chưa đủ vì bất kỳ ai cũng có thể tạo một CloudFront distribution khác trên tài khoản AWS của họ và trỏ Origin về ALB của bạn để vượt qua WAF của bạn.
- **B:** NACL có giới hạn cứng rất thấp về số lượng rule (mặc định 20, tối đa 40), không thể chứa nổi toàn bộ dải IP của CloudFront, đồng thời tốn công bảo trì Lambda so với Managed Prefix List.
- **C:** Origin Access Control (OAC) dành cho S3/Lambda Function URLs/MediaPackage; với ALB trong private subnet cần dùng CloudFront VPC Origins chứ không phải S3 OAC.
- **D (Đúng):** Chính xác! Kết hợp 2 lớp: (1) Security Group dùng CloudFront Managed Prefix List đảm bảo chỉ hạ tầng CloudFront mới kết nối được tới ALB, và (2) Custom Secret Header + ALB Listener Rule đảm bảo chỉ đúng CloudFront distribution của công ty bạn mới được phục vụ (chống kẻ tấn công tạo CloudFront distribution riêng trỏ vào ALB của bạn).

</details>

### Câu 10 `medium`

A large e-commerce company experiences frequent Layer 3/4 UDP reflection DDoS attacks and HTTP flood Layer 7 attacks against its CloudFront distributions and Application Load Balancers across 30 AWS accounts. The company wants 24/7 access to AWS DDoS experts during an attack, financial protection against scaling charges caused by DDoS traffic, and centralized enforcement of WAF rules across all accounts. Which combination of services meets these requirements?

- **A.** AWS Shield Standard and Amazon GuardDuty
- **B.** AWS Shield Advanced and AWS Firewall Manager
- **C.** AWS Network Firewall and Amazon Inspector
- **D.** AWS WAF Rate-based rules configured individually in each account and AWS Trusted Advisor

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty thương mại điện tử lớn thường xuyên hứng chịu các cuộc tấn công DDoS khuếch đại UDP Layer 3/4 và các cuộc tấn công ngập lụt HTTP Layer 7 nhắm vào các CloudFront distribution và Application Load Balancer trên 30 tài khoản AWS. Công ty muốn có quyền tiếp cận 24/7 với các chuyên gia DDoS của AWS trong suốt cuộc tấn công, bảo vệ tài chính trước các chi phí scale do lưu lượng DDoS gây ra và thực thi tập trung các quy tắc WAF trên tất cả các tài khoản. Sự kết hợp dịch vụ nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **B**

Nhận diện nhanh từ khóa Domain 3: '24/7 DDoS experts (SRT)' + 'financial/cost protection against scaling charges' → **AWS Shield Advanced**; 'centralized WAF/Shield/SG enforcement across AWS Organizations' → **AWS Firewall Manager**.

- **A:** Shield Standard không có 24/7 SRT, không có Cost Protection và không bảo vệ Layer 7; GuardDuty là dịch vụ phát hiện mối đe dọa chứ không quản lý WAF tập trung.
- **B (Đúng):** Chính xác! AWS Shield Advanced cung cấp truy cập 24/7 tới AWS Shield Response Team (SRT), Cost Protection hoàn chi phí scale-out do DDoS, và tự động giảm thiểu L7; AWS Firewall Manager giúp áp đặt tập trung chính sách Shield Advanced và WAF xuyên suốt toàn bộ 30 tài khoản trong AWS Organizations.
- **C:** Network Firewall hoạt động trong VPC (không gắn lên CloudFront), không cung cấp DDoS Cost Protection hay SRT; Inspector dùng để quét lỗ hổng CVE.
- **D:** Cấu hình thủ công ở từng tài khoản không đáp ứng yêu cầu quản trị tập trung và cũng không có 24/7 SRT hay DDoS Cost Protection.

</details>

---

[Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md)
