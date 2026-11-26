# Bài tập tình huống — Bảo mật VPC: Security Groups, NACLs, Network Firewall & Traffic Mirroring

> Security Groups vs Network ACLs, AWS Network Firewall (Suricata Rules, TLS Inspection), Gateway Load Balancer, VPC Traffic Mirroring và PrivateLink.
> **Số câu hỏi:** 11 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A security architect deploys AWS Network Firewall in a centralized Inspection VPC connected via AWS Transit Gateway to inspect all egress HTTPS traffic from spoke VPCs. The company requires blocking outbound connections to unauthorized domains using SNI/HTTP Host inspection and applying Suricata-compatible IPS signatures, while ensuring return traffic for established flows always traverses the same firewall endpoint. Which configuration satisfies these requirements?

- **A.** Configure AWS Network Firewall Stateless Rule Groups with domain-list filtering and disable Appliance Mode on the Transit Gateway VPC attachment.
- **B.** Configure Network Firewall Stateful Rule Groups (Domain List, Suricata IPS) and enable Appliance Mode on the TGW attachment.
- **C.** Use Network ACLs on the Transit Gateway subnets to inspect SNI headers and forward matched packets to AWS WAF.
- **D.** Enable AWS Network Firewall Stateless Rule Groups with aws:pass action so all traffic bypasses the stateful engine for lower latency.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiến trúc sư bảo mật triển khai AWS Network Firewall trong một Inspection VPC tập trung được kết nối qua AWS Transit Gateway để kiểm tra toàn bộ lưu lượng HTTPS đi ra (egress) từ các spoke VPC. Công ty yêu cầu chặn các kết nối đi ra tới các tên miền trái phép bằng cách kiểm tra SNI/HTTP Host và áp dụng các chữ ký IPS tương thích Suricata, đồng thời đảm bảo lưu lượng quay về cho các luồng đã thiết lập luôn đi qua cùng một firewall endpoint. Cấu hình nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **B**

Hai điểm mấu chốt khi triển khai AWS Network Firewall tập trung qua Transit Gateway: (1) Lọc tên miền (SNI/Host) và Suricata IPS thuộc về **Stateful Rule Groups** (stateless engine phải chuyển tiếp bằng `aws:forward_to_sfe`), và (2) Bắt buộc bật **Appliance Mode** trên Transit Gateway VPC attachment của Inspection VPC để tránh lỗi asymmetric routing giữa các AZ.

- **A:** Stateless Rule Groups chỉ kiểm tra 5-tuple IP/port/protocol, không hỗ trợ lọc tên miền (SNI/HTTP Host) hay Suricata IPS. Hơn nữa, tắt Appliance Mode trên TGW sẽ gây định tuyến bất đối xứng (asymmetric routing) làm đứt kết nối stateful.
- **B (Đúng):** Chính xác! Stateful Rule Groups của AWS Network Firewall hỗ trợ lọc tên miền (SNI/HTTP Host) và luật Suricata IPS. Bật Appliance Mode trên Transit Gateway attachment của Inspection VPC đảm bảo cả chiều đi và chiều về của một phiên TCP đều đi qua cùng một Availability Zone và cùng một Network Firewall endpoint.
- **C:** Network ACL hoạt động ở Layer 3/4, không thể đọc SNI header ở Layer 7 và cũng không thể chuyển tiếp lưu lượng sang AWS WAF.
- **D:** Hành động aws:pass trong stateless rule sẽ bỏ qua hoàn toàn stateful engine, khiến các luật Suricata IPS và lọc tên miền không bao giờ được thực thi (phải dùng aws:forward_to_sfe).

</details>

### Câu 2 `hard`

A healthcare enterprise wants AWS Network Firewall to perform deep packet inspection (Suricata IPS rules) on encrypted INBOUND HTTPS traffic destined for web applications hosted in its VPC, without modifying the backend EC2 web servers. The company already manages the public SSL/TLS certificates for its domains in AWS Certificate Manager (ACM). How should the security engineer configure AWS Network Firewall to inspect this encrypted inbound traffic?

- **A.** Upload the TLS private key directly into an AWS Network Firewall Stateless Rule Group.
- **B.** Enable TLS termination on the VPC Internet Gateway and forward plaintext HTTP traffic to AWS Network Firewall.
- **C.** Use AWS Private Certificate Authority to issue a self-signed certificate and push it to all public internet browsers accessing the website.
- **D.** Create a Network Firewall TLS inspection configuration with the ACM server certificate and attach it with Suricata rules.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp y tế muốn AWS Network Firewall thực hiện kiểm tra gói tin sâu (quy tắc Suricata IPS) đối với lưu lượng HTTPS ĐI VÀO (INBOUND) được mã hóa hướng tới các ứng dụng web lưu trữ trong VPC của mình, mà không sửa đổi các máy chủ web EC2 phía sau. Công ty đã quản lý các chứng chỉ SSL/TLS công khai cho các tên miền của mình trong AWS Certificate Manager (ACM). Kỹ sư bảo mật nên cấu hình AWS Network Firewall như thế nào để kiểm tra lưu lượng đi vào được mã hóa này?

**Đáp án đúng:** **D**

Cần phân biệt 2 chế độ **TLS Inspection** trong AWS Network Firewall: (1) **Inbound TLS Inspection** (lưu lượng từ internet vào ứng dụng VPC) → dùng Server Certificate từ **ACM**, (2) **Outbound TLS Inspection** (lưu lượng egress từ EC2 trong VPC ra internet) → dùng CA certificate từ **AWS Private CA** (cần cài trust store trên client/EC2 nội bộ).

- **A:** Stateless Rule Groups không hỗ trợ giải mã TLS hay lưu trữ private key; TLS Inspection phải cấu hình qua TLS Inspection Configuration tích hợp ACM và chỉ hoạt động với Stateful engine.
- **B:** VPC Internet Gateway là thành phần định tuyến Layer 3/NAT, không có khả năng TLS termination.
- **C:** Private CA dùng cho Outbound TLS Inspection (doanh nghiệp kiểm soát client nội bộ để cài đặt root CA tin cậy) hoặc mTLS nội bộ, không thể đẩy root CA riêng tới trình duyệt của người dùng internet công cộng.
- **D (Đúng):** Chính xác! AWS Network Firewall hỗ trợ Inbound TLS Inspection bằng cách cấu hình TLS Inspection Configuration liên kết trực tiếp với server certificate trong ACM; firewall sẽ giải mã lưu lượng TLS đi vào, chạy qua các stateful Suricata IPS rules, rồi mã hóa lại trước khi chuyển tới backend.

</details>

### Câu 3 `medium`

A security policy prohibits opening inbound SSH (port 22) or RDP (port 3389) on any EC2 instances and forbids deploying bastion hosts or assigning public IP addresses to application servers in private subnets. Operations engineers still need interactive shell access to troubleshoot Linux EC2 instances, and every executed command must be logged to an encrypted Amazon S3 bucket for audit purposes. Which solution meets all requirements?

- **A.** Use Amazon EC2 Instance Connect with a public IPv4 address assigned temporarily during troubleshooting sessions.
- **B.** Use SSM Session Manager with an IAM instance profile, VPC Interface Endpoints (ssm, ssmmessages, ec2messages), and S3 logging.
- **C.** Deploy an AWS Client VPN endpoint and allow inbound SSH port 22 from the VPN CIDR on all EC2 Security Groups.
- **D.** Enable VPC Traffic Mirroring on the EC2 instances and use AWS Systems Manager Patch Manager to open an interactive shell.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một chính sách bảo mật nghiêm cấm mở inbound SSH (port 22) hoặc RDP (port 3389) trên bất kỳ EC2 instance nào và cấm triển khai bastion host hoặc gán địa chỉ IP công khai cho các máy chủ ứng dụng trong private subnet. Các kỹ sư vận hành vẫn cần quyền truy cập shell tương tác để khắc phục sự cố các Linux EC2 instance, và mọi lệnh được thực thi phải được ghi lại vào một Amazon S3 bucket được mã hóa phục vụ mục đích kiểm toán. Giải pháp nào đáp ứng tất cả các yêu cầu?

**Đáp án đúng:** **B**

AWS Systems Manager **Session Manager** là câu trả lời chuẩn nhất khi đề bài yêu cầu: bỏ bastion host, không mở inbound port 22/3389, quản lý quyền bằng IAM, và ghi log audit toàn bộ phiên lệnh ra S3/CloudWatch Logs (có mã hóa KMS). Trong private subnet không có NAT Gateway, cần tạo 3 VPC Interface Endpoints: `com.amazonaws.<region>.ssm`, `ssmmessages`, và `ec2messages`.

- **A:** EC2 Instance Connect truyền thống vẫn yêu cầu mở cổng SSH 22 và dùng public IP, vi phạm yêu cầu không mở cổng 22 và không gán public IP (và cũng không tự ghi log toàn bộ lệnh shell ra S3 như Session Manager).
- **B (Đúng):** Chính xác! SSM Session Manager không cần mở bất kỳ cổng inbound nào (không cần port 22/3389, không cần bastion, không cần public IP), xác thực và phân quyền bằng IAM, hoạt động hoàn toàn trong private subnet qua 3 VPC Interface Endpoints (ssm, ssmmessages, ec2messages) và hỗ trợ ghi toàn bộ session log mã hóa KMS ra S3 hoặc CloudWatch Logs.
- **C:** Giải pháp này vẫn yêu cầu mở inbound SSH port 22 trên Security Group của các EC2 instance và không tự động ghi log chi tiết từng câu lệnh shell ra S3.
- **D:** Patch Manager dùng để vá lỗi hệ điều hành tự động, không cung cấp interactive shell; VPC Traffic Mirroring dùng để sao chép gói tin mạng chứ không phải truy cập quản trị.

</details>

### Câu 4 `hard`

A regulatory mandate requires out-of-band full-packet capture (including Layer 7 payloads) of all network traffic entering and leaving a fleet of Nitro-based EC2 instances for a third-party intrusion detection appliance (IDS) running in the same VPC. The solution must NOT require installing any packet-capture agents on the source EC2 instances and must NOT add latency to production traffic. Which AWS feature should the security architect implement?

- **A.** Amazon VPC Flow Logs with Custom Format streaming to Amazon Kinesis Data Streams for real-time packet inspection.
- **B.** AWS Network Firewall deployed inline in the VPC route table with Suricata rules forwarding packets to the IDS.
- **C.** VPC Traffic Mirroring on source EC2 ENIs sending VXLAN packets to an NLB fronting the third-party IDS fleet.
- **D.** AWS CloudTrail Data Events enabled on the EC2 Elastic Network Interfaces to capture full network payloads.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một quy định bắt buộc phải thu thập toàn bộ gói tin ngoài băng tần (out-of-band full-packet capture, bao gồm cả payload Layer 7) của tất cả lưu lượng mạng đi vào và đi ra một đội ngũ EC2 instance dựa trên Nitro cho một thiết bị phát hiện xâm nhập (IDS) của bên thứ ba chạy trong cùng VPC. Giải pháp KHÔNG ĐƯỢC yêu cầu cài đặt bất kỳ agent thu thập gói tin nào trên các EC2 instance nguồn và KHÔNG ĐƯỢC làm tăng độ trễ cho lưu lượng production. Kiến trúc sư bảo mật nên triển khai tính năng AWS nào?

**Đáp án đúng:** **C**

Nhớ rõ sự khác biệt: **VPC Flow Logs** = chỉ có metadata (không có payload); **VPC Traffic Mirroring** = sao chép nguyên vẹn gói tin (full-packet capture, gồm cả payload) qua VXLAN ở tầng Nitro hypervisor (không cần agent, out-of-band, không tăng độ trễ) tới target (ENI, NLB, hoặc GWLB Endpoint).

- **A:** VPC Flow Logs chỉ ghi lại metadata của luồng mạng (IP, port, protocol, bytes, TCP flags), KHÔNG ghi lại nội dung payload gói tin (full-packet capture).
- **B:** AWS Network Firewall hoạt động inline (trên đường đi trực tiếp của lưu lượng), không phải giải pháp out-of-band full-packet capture gửi tới thiết bị IDS bên thứ ba.
- **C (Đúng):** Chính xác! VPC Traffic Mirroring sao chép toàn bộ nội dung gói tin mạng (raw packets gồm cả payload) trực tiếp từ ENI của EC2 chạy trên Nitro System (không cần agent trên OS, hoạt động out-of-band nên không làm tăng độ trễ lưu lượng production) và gửi qua gói tin VXLAN tới target là ENI, NLB hoặc Gateway Load Balancer Endpoint của hệ thống IDS.
- **D:** CloudTrail ghi nhận các lệnh gọi AWS API, không hỗ trợ bắt gói tin mạng (packet capture) trên ENI.

</details>

### Câu 5 `hard`

A DevSecOps team needs to continuously detect software vulnerabilities (CVEs) across EC2 instances, container images stored in Amazon ECR, and AWS Lambda functions, and then automatically apply approved OS security patches to EC2 instances located in isolated private subnets with no internet access. Which TWO AWS services/configurations should the team implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Enable Amazon GuardDuty Runtime Monitoring to automatically install missing OS security patches on EC2 instances.
- **B.** Use AWS Trusted Advisor to continuously scan Amazon ECR container images and AWS Lambda layers for OS and language package CVEs.
- **C.** Enable Amazon Inspector across the Organization to continuously scan EC2, ECR images, and Lambda functions for CVEs.
- **D.** Configure AWS Config managed rules to execute yum update directly on private EC2 instances during maintenance windows.
- **E.** Use SSM Patch Manager with Patch Baselines, VPC Interface Endpoints, and an S3 Gateway Endpoint for private EC2 patching.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm DevSecOps cần liên tục phát hiện các lỗ hổng phần mềm (CVE) trên các EC2 instance, container image lưu trữ trong Amazon ECR và AWS Lambda function, sau đó tự động áp dụng các bản vá bảo mật OS đã phê duyệt cho các EC2 instance đặt trong các private subnet biệt lập không có truy cập internet. Nhóm nên triển khai HAI dịch vụ/cấu hình AWS nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Cặp bài trùng quản trị lỗ hổng (Vulnerability Management) trên AWS: **Amazon Inspector** (quét liên tục CVE trên EC2, ECR, Lambda — dùng chung SSM Agent cho EC2) + **AWS Systems Manager Patch Manager** (vá lỗi OS tự động theo Patch Baseline & Maintenance Window, hoạt động được trong private subnet qua VPC Endpoints).

- **A:** GuardDuty Runtime Monitoring chỉ phát hiện mối đe dọa thời gian thực (threat detection), không phải công cụ quét CVE toàn diện cho ECR/Lambda và không tự động vá lỗi OS.
- **B:** Trusted Advisor không có chức năng quét lỗ hổng CVE trong ECR images hay Lambda functions.
- **C (Đúng):** Chính xác! Amazon Inspector v2 tự động quét liên tục lỗ hổng phần mềm (CVE) và network reachability trên cả 3 loại tài nguyên: EC2 (tận dụng SSM Agent sẵn có), ECR container images (khi push và liên tục khi có CVE mới) và Lambda functions/layers.
- **D:** AWS Config chỉ đánh giá trạng thái cấu hình tài nguyên AWS, không tự thực thi lệnh vá lỗi hệ điều hành bên trong EC2.
- **E (Đúng):** Chính xác! SSM Patch Manager kết hợp Patch Baselines và Maintenance Windows tự động vá lỗi hệ điều hành cho EC2; trong private subnet không có Internet, cần dùng VPC Interface Endpoints cho SSM và S3 Gateway Endpoint (để tải Amazon Linux repo từ S3) hoặc private package repository nội bộ.

</details>

### Câu 6 `hard`

A security engineer deploys AWS Network Firewall in a centralized inspection VPC to inspect all outbound HTTP and HTTPS traffic from spoke VPCs. The company requires blocking access to all external domains except a strict allowlist of approved partner domains, while also applying custom Suricata intrusion prevention rules that must be evaluated in a deterministic priority order. How should the engineer configure the AWS Network Firewall policy?

- **A.** Configure the stateless rule engine with domain-based FQDN allowlists and set the default action to Pass.
- **B.** Use the Default stateful rule evaluation order so that Drop rules are always evaluated before Pass rules regardless of priority.
- **C.** Deploy a Route 53 Resolver DNS Firewall instead of AWS Network Firewall to inspect HTTP payloads with Suricata rules.
- **D.** Use Strict rule order with default Drop, a stateful domain allowlist, and prioritized Suricata rule groups.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư bảo mật triển khai AWS Network Firewall trong một inspection VPC tập trung để kiểm tra toàn bộ lưu lượng HTTP và HTTPS đi ra từ các spoke VPC. Công ty yêu cầu chặn truy cập tới tất cả tên miền bên ngoài ngoại trừ một danh sách cho phép nghiêm ngặt các tên miền đối tác đã phê duyệt, đồng thời áp dụng các quy tắc ngăn chặn xâm nhập Suricata tùy chỉnh phải được đánh giá theo thứ tự ưu tiên xác định. Kỹ sư nên cấu hình AWS Network Firewall policy như thế nào?

**Đáp án đúng:** **D**

Trong **AWS Network Firewall**, **Strict evaluation order** cho phép kiểm soát chính xác thứ tự thực thi các stateful rule group (Suricata, Domain List) theo số thứ tự ưu tiên (priority) kết hợp với **default actions** (như `aws:drop_strict` hoặc `aws:drop_established`) để triển khai mô hình allowlist chặt chẽ.

- **A:** Stateless engine trong AWS Network Firewall chỉ hỗ trợ lọc theo 5-tuple (IP, port, protocol), KHÔNG hỗ trợ lọc theo tên miền (FQDN/SNI) hay quy tắc Suricata.
- **B:** Chế độ Default order (action order) đánh giá theo thứ tự cố định Pass -> Drop -> Alert và KHÔNG hỗ trợ thứ tự ưu tiên tùy chỉnh xác định (deterministic priority order) giữa các rule group; cần dùng Strict order.
- **C:** Route 53 Resolver DNS Firewall chỉ lọc các truy vấn DNS, không thể kiểm tra lưu lượng HTTP/HTTPS hay chạy các rule IPS Suricata.
- **D (Đúng):** Chính xác! Chế độ Strict evaluation order trong AWS Network Firewall cho phép đánh giá các stateful rule group theo đúng thứ tự ưu tiên (priority) đã chỉ định, kết hợp với default action Drop (Drop all / Drop established) và stateful domain list Allow cho các tên miền đối tác được phê duyệt.

</details>

### Câu 7 `hard`

A security architect is designing a private VPC architecture where Amazon EC2 instances in private subnets must access Amazon S3 buckets and AWS Systems Manager without traversing the public internet. Additionally, the architect must ensure that the S3 VPC endpoint can ONLY be used to access buckets owned by the company's AWS Organization. Which TWO configurations should the architect implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Attach a VPC Endpoint Policy using the aws:PrincipalOrgID condition key to prevent access to external S3 buckets.
- **B.** Deploy an S3 Gateway Endpoint and PrivateLink Interface Endpoints for ssm, ssmmessages, and ec2messages with private DNS.
- **C.** Deploy a NAT Gateway in the private subnet to route Systems Manager traffic privately to the AWS backbone.
- **D.** Attach a VPC Endpoint Policy to the S3 Gateway Endpoint allowing access only when aws:ResourceOrgID matches your Org ID.
- **E.** Create an S3 Access Point with a public internet origin and restrict it using a VPC Network ACL.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiến trúc sư bảo mật đang thiết kế kiến trúc VPC riêng tư nơi các Amazon EC2 instance trong các private subnet phải truy cập Amazon S3 bucket và AWS Systems Manager mà không đi qua internet công cộng. Ngoài ra, kiến trúc sư phải đảm bảo S3 VPC endpoint CHỈ có thể được sử dụng để truy cập các bucket thuộc sở hữu của AWS Organization của công ty. Kiến trúc sư nên triển khai HAI cấu hình nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Để kết nối hoàn toàn riêng tư và chống data exfiltration: dùng **Gateway Endpoint** cho S3 + **Interface Endpoints** (`ssm`, `ssmmessages`, `ec2messages`) cho Systems Manager, kết hợp **VPC Endpoint Policy** kiểm tra **`aws:ResourceOrgID`** (chủ sở hữu tài nguyên đích) để chặn truy cập tới các S3 bucket bên ngoài Organization.

- **A:** `aws:PrincipalOrgID` chỉ kiểm tra danh tính người gọi (caller) có thuộc Organization hay không, KHÔNG chặn việc nhân viên/kẻ tấn công dùng tài khoản nội bộ tải dữ liệu lên một S3 bucket thuộc Organization bên ngoài. Phải dùng `aws:ResourceOrgID` để kiểm tra chủ sở hữu tài nguyên đích.
- **B (Đúng):** Chính xác! Gateway VPC Endpoint cho S3 (miễn phí) và 3 Interface VPC Endpoints (`ssm`, `ssmmessages`, `ec2messages`) với Private DNS enabled cho phép EC2 trong private subnet kết nối hoàn toàn riêng tư tới S3 và Systems Manager mà không cần Internet Gateway hay NAT Gateway.
- **C:** NAT Gateway phải đặt trong public subnet và gửi lưu lượng ra Internet Gateway (public internet), không đáp ứng yêu cầu không đi qua public internet.
- **D (Đúng):** Chính xác! Điều kiện `aws:ResourceOrgID` trong VPC Endpoint Policy đảm bảo endpoint này chỉ có thể truy cập các S3 bucket thuộc AWS Organization của công ty, ngăn chặn việc tuồn dữ liệu (data exfiltration) sang S3 bucket của tài khoản bên ngoài.
- **E:** S3 Access Point với public origin vẫn đi qua public internet nếu không có VPC endpoint, và NACL không thể lọc theo tên miền hay AWS Organization ID của S3 bucket.

</details>

### Câu 8 `hard`

A security team uses AWS Network Firewall in a centralized inspection VPC to inspect inbound HTTPS traffic destined for web servers in spoke VPCs. Currently, the firewall's Suricata IPS rules cannot detect SQL injection payloads or malware signatures inside encrypted HTTPS traffic because the payloads are encrypted with TLS. The team wants AWS Network Firewall to decrypt, inspect, and re-encrypt this inbound TLS traffic. What must the team configure?

- **A.** Enable TLS decryption in the VPC Transit Gateway route table and import the private key into AWS Secrets Manager.
- **B.** Add a stateless rule in AWS Network Firewall to strip TLS headers on TCP port 443 before passing traffic to the stateful engine.
- **C.** Configure VPC Traffic Mirroring to send decrypted TLS sessions to AWS Network Firewall.
- **D.** Create an Inbound TLS inspection configuration in Network Firewall with the ACM server certificate and attach it to the policy.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm bảo mật sử dụng AWS Network Firewall trong một inspection VPC tập trung để kiểm tra lưu lượng HTTPS đi vào hướng tới các máy chủ web trong các spoke VPC. Hiện tại, các quy tắc Suricata IPS của tường lửa không thể phát hiện các payload SQL injection hoặc chữ ký phần mềm độc hại bên trong lưu lượng HTTPS được mã hóa vì các payload được mã hóa bằng TLS. Nhóm muốn AWS Network Firewall giải mã, kiểm tra và mã hóa lại lưu lượng TLS đi vào này. Nhóm phải cấu hình gì?

**Đáp án đúng:** **D**

**AWS Network Firewall TLS Inspection** cho phép kiểm tra sâu (deep packet inspection) lưu lượng mã hóa TLS mà không cần bên thứ ba: với **Inbound TLS inspection**, gắn chứng chỉ server từ **ACM**; với **Outbound TLS inspection**, sử dụng CA certificate từ **ACM Private CA** để ký động chứng chỉ cho phiên outbound.

- **A:** AWS Transit Gateway chỉ định tuyến ở tầng 3 (IP), hoàn toàn không có khả năng giải mã hay kiểm tra lưu lượng TLS.
- **B:** Stateless rules chỉ lọc/chuyển tiếp gói tin theo 5-tuple, không thể giải mã hay bóc tách phiên TLS.
- **C:** VPC Traffic Mirroring chỉ sao chép bản sao gói tin nguyên gốc (vẫn đang mã hóa) để phân tích thụ động (out-of-band), không giải mã TLS và không chặn inline như Network Firewall.
- **D (Đúng):** Chính xác! AWS Network Firewall hỗ trợ tích hợp TLS Inspection: đối với lưu lượng inbound, người quản trị tạo TLS inspection configuration ở chế độ Inbound, gắn chứng chỉ SSL/TLS của server (lưu trong ACM) vào cấu hình này để firewall giải mã, chạy các stateful Suricata rules kiểm tra payload rồi mã hóa lại trước khi chuyển tới đích.

</details>

### Câu 9 `hard`

A defense contractor runs sensitive workloads on Nitro-based Amazon EC2 instances and is required by regulation to perform out-of-band deep packet inspection (full packet payload capture) using a third-party Zeek/Suricata intrusion detection appliance fleet behind a Network Load Balancer—WITHOUT introducing any inline latency or installing packet-capture agents inside the EC2 guest operating systems. Which AWS VPC feature meets this requirement?

- **A.** Configure Amazon VPC Traffic Mirroring on the EC2 elastic network interfaces (ENIs) targeting the Network Load Balancer with a traffic mirror filter.
- **B.** Enable VPC Flow Logs with all custom fields enabled and stream the flow records to the Zeek appliance via Kinesis.
- **C.** Route all VPC east-west and north-south traffic inline through an AWS Network Firewall endpoint with Suricata rules.
- **D.** Enable Amazon GuardDuty Runtime Monitoring to export full raw PCAP files directly to the Network Load Balancer target group.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà thầu quốc phòng chạy các workload nhạy cảm trên các Amazon EC2 instance dựa trên Nitro và được quy định bắt buộc thực hiện kiểm tra gói tin sâu ngoài băng tần (thu thập toàn bộ payload gói tin) bằng một đội ngũ thiết bị phát hiện xâm nhập Zeek/Suricata bên thứ ba phía sau Network Load Balancer—MÀ KHÔNG tạo ra bất kỳ độ trễ nội tuyến nào hoặc cài đặt agent thu thập gói tin bên trong hệ điều hành khách EC2. Tính năng AWS VPC nào đáp ứng yêu cầu này?

**Đáp án đúng:** **A**

Khi yêu cầu **out-of-band full packet inspection (payload capture)** không cần agent và không thêm độ trễ inline trên EC2 Nitro → chọn **VPC Traffic Mirroring** (đóng gói VXLAN UDP port 4789 gửi tới ENI, NLB hoặc GWLB Endpoint).

- **A (Đúng):** Chính xác! **VPC Traffic Mirroring** sao chép toàn bộ gói tin (cả header và payload, đóng gói VXLAN) trực tiếp từ ENI của EC2 Nitro sang đích (ENI, NLB hoặc Gateway Load Balancer Endpoint) để thiết bị IDS bên thứ ba (Zeek/Suricata) phân tích thụ động (out-of-band) mà không gây độ trễ inline và không cần cài agent trong OS.
- **B:** VPC Flow Logs chỉ ghi metadata tầng 3/4 (IP, port, byte count), hoàn toàn không ghi payload gói tin (packet payload) để Zeek/Suricata thực hiện deep packet inspection.
- **C:** AWS Network Firewall hoạt động inline (thêm một hop định tuyến/độ trễ) và không gửi bản sao gói tin đầy đủ out-of-band tới cụm Zeek/Suricata tùy chỉnh.
- **D:** GuardDuty Runtime Monitoring giám sát tiến trình/syscall ở tầng OS bằng eBPF, không xuất bản sao gói tin mạng raw PCAP tới NLB.

</details>

### Câu 10 `hard`

A security architect deploys AWS Network Firewall in a centralized Inspection VPC connected to multiple Spoke VPCs via AWS Transit Gateway (TGW). The Inspection VPC spans two Availability Zones, with a Network Firewall endpoint in each AZ. After routing is configured, stateful TCP connections between Spoke VPCs intermittently drop or fail. What is the MOST likely cause and fix?

- **A.** Asymmetric routing is occurring across Availability Zones; enable Appliance Mode on the Inspection VPC's Transit Gateway attachment.
- **B.** AWS Network Firewall does not support Transit Gateway; replace Transit Gateway with VPC Peering between all Spoke VPCs and the Inspection VPC.
- **C.** Network ACLs on the Firewall Subnets are blocking ephemeral return ports; disable Network ACLs on the Inspection VPC.
- **D.** Switch AWS Network Firewall from stateful rules to VPC Traffic Mirroring so return packets are inspected out-of-band.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiến trúc sư bảo mật triển khai AWS Network Firewall trong một Inspection VPC tập trung được kết nối tới nhiều Spoke VPC thông qua AWS Transit Gateway (TGW). Inspection VPC trải rộng trên hai Availability Zone, với một endpoint Network Firewall ở mỗi AZ. Sau khi cấu hình định tuyến, các kết nối TCP có trạng thái giữa các Spoke VPC thỉnh thoảng bị rớt hoặc thất bại. Nguyên nhân và cách khắc phục CÓ KHẢ NĂNG NHẤT là gì?

**Đáp án đúng:** **A**

Khi triển khai Stateful Firewall (AWS Network Firewall hoặc GWLB + 3rd-party NVA) trong mô hình Centralized Inspection VPC kết nối qua **AWS Transit Gateway**, luôn phải bật **Appliance Mode** trên TGW Attachment của Inspection VPC để đảm bảo symmetric routing qua cùng một AZ.

- **A (Đúng):** Chính xác! Mặc định Transit Gateway cố gắng giữ traffic trong cùng một AZ, khiến gói tin đi qua Firewall Endpoint ở AZ1 nhưng gói trả về lại đi qua Firewall Endpoint ở AZ2 (asymmetric routing), làm stateful firewall drop gói tin. Bật Appliance Mode trên TGW Attachment của Inspection VPC sẽ ghim cả 2 chiều của 1 luồng vào cùng 1 AZ.
- **B:** AWS Network Firewall tích hợp hoàn toàn với Transit Gateway; VPC Peering không hỗ trợ transitive routing nên không thể làm centralized inspection hub.
- **C:** Không thể tắt (disable) NACL trên VPC, và nguyên nhân rớt kết nối chập chờn (intermittently drop) trong mô hình Multi-AZ TGW + Stateful Firewall điển hình là do thiếu Appliance Mode.
- **D:** VPC Traffic Mirroring chỉ sao chép gói tin để giám sát ngoài luồng, không có chức năng tường lửa chặn gói tin inline.

</details>

### Câu 11 `medium`

A company runs containerized microservices on Amazon EC2 instances in private subnets with no internet access. Security policy prohibits opening SSH (port 22) or deploying bastion hosts, and requires preventing Server-Side Request Forgery (SSRF) attacks from stealing IAM role credentials via the EC2 metadata service. Which TWO configurations should the security engineer implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Configure SSM Session Manager with VPC Interface Endpoints (ssm, ssmmessages, ec2messages) and an EC2 IAM role.
- **B.** Add a Network ACL Deny rule blocking outbound traffic to 169.254.169.254/32 on the private subnets.
- **C.** Enable EC2 Instance Connect Endpoint and open port 22 from 0.0.0.0/0 on the EC2 security group.
- **D.** Enforce IMDSv2 by setting HttpTokens to 'required' on all EC2 instances and via an Organizations SCP.
- **E.** Enable VPC Traffic Mirroring on the EC2 instances to block SSRF HTTP GET requests to the metadata service.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty chạy các microservice container hóa trên các Amazon EC2 instance trong private subnet không có truy cập internet. Chính sách bảo mật nghiêm cấm mở SSH (port 22) hoặc triển khai bastion host, đồng thời yêu cầu ngăn chặn các cuộc tấn công Server-Side Request Forgery (SSRF) đánh cắp thông tin xác thực IAM role qua dịch vụ siêu dữ liệu EC2. Kỹ sư bảo mật nên triển khai HAI cấu hình nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, D**

Hai best practices hàng đầu cho EC2 Compute Security trong SCS-C02: (1) Thay thế SSH/Bastion bằng **SSM Session Manager** (kèm VPC Endpoints cho private subnet), và (2) Chống SSRF đánh cắp IAM Role credentials bằng **IMDSv2 (`HttpTokens=required`)**.

- **A (Đúng):** Chính xác! SSM Session Manager cho phép truy cập shell an toàn vào EC2 trong private subnet mà không cần mở port 22, không cần public IP hay bastion host, chỉ cần 3 VPC Interface Endpoints và quyền SSM.
- **B:** 169.254.169.254 là địa chỉ link-local nằm ngay trên hypervisor của host EC2, traffic này không đi qua subnet router nên NACL không thể chặn được.
- **C:** Mở port 22 từ 0.0.0.0/0 vi phạm nghiêm trọng chính sách bảo mật cấm mở SSH.
- **D (Đúng):** Chính xác! IMDSv2 yêu cầu session-oriented PUT request với custom header X-aws-ec2-metadata-token-ttl-seconds, giúp chặn hiệu quả các cuộc tấn công SSRF đánh cắp IAM credentials từ 169.254.169.254.
- **E:** VPC Traffic Mirroring chỉ sao chép traffic để phân tích out-of-band (không chặn được) và cũng không bắt được traffic nội bộ tới link-local IMDS.

</details>

---

[Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md)
