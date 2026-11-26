# Bài tập tình huống — Bảo mật Compute & Workload: EC2 IMDSv2, Inspector, SSM & Containers

> EC2 IMDSv2, SSM Session Manager & Patch Manager, Amazon Inspector (EC2/ECR/Lambda), ECS/EKS Pod Security và AWS Nitro Enclaves.
> **Số câu hỏi:** 6 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A security team wants to prevent compromised EC2 instances in private VPCs from exfiltrating data via DNS tunneling or resolving known command-and-control (C2) malware domains. The solution must block queries to AWS-managed malicious domain lists, allow only approved corporate domains, and return an NXDOMAIN response for blocked queries without deploying proxy instances inside the VPCs. Which AWS service should be configured?

- **A.** AWS WAF with Amazon IP Reputation List attached to the VPC Internet Gateway.
- **B.** Route 53 Public Hosted Zone with DNSSEC signing enabled.
- **C.** VPC Security Group outbound rules blocking UDP port 53 to 0.0.0.0/0.
- **D.** Amazon Route 53 Resolver DNS Firewall associated with the VPCs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm bảo mật muốn ngăn chặn các EC2 instance bị xâm phạm trong các private VPC trích xuất dữ liệu qua đường hầm DNS hoặc phân giải các tên miền phần mềm độc hại command-and-control (C2) đã biết. Giải pháp phải chặn các truy vấn tới danh sách tên miền độc hại do AWS quản lý, chỉ cho phép các tên miền doanh nghiệp đã phê duyệt và trả về phản hồi NXDOMAIN cho các truy vấn bị chặn mà không cần triển khai các proxy instance bên trong VPC. Nên cấu hình dịch vụ AWS nào?

**Đáp án đúng:** **D**

Route 53 Resolver DNS Firewall bảo vệ lưu lượng DNS đi ra (outbound DNS filtering) ở cấp VPC mà không cần hạ tầng proxy. Kết hợp với việc chặn outbound UDP/TCP port 53 đi thẳng ra ngoài (ép mọi EC2 phải đi qua VPC Resolver) và bật DNS Query Logs sẽ tạo lớp phòng thủ vững chắc chống DNS exfiltration và C2.

- **A:** AWS WAF không thể gắn lên Internet Gateway và chỉ lọc HTTP/HTTPS (Layer 7), không lọc truy vấn DNS.
- **B:** DNSSEC xác thực tính toàn vẹn của bản ghi DNS cho tên miền công cộng của bạn, không chặn được việc EC2 trong VPC truy vấn ra các tên miền độc hại bên ngoài.
- **C:** Chặn UDP port 53 ở Security Group không chặn được truy vấn tới VPC Resolver nội bộ (169.254.169.253 / VPC+2) và không cho phép lọc theo danh sách tên miền hay trả về NXDOMAIN.
- **D (Đúng):** Chính xác! Route 53 Resolver DNS Firewall lọc các truy vấn DNS đi ra từ VPC ngay tại tầng Route 53 Resolver (không cần proxy), hỗ trợ AWS Managed Domain Lists (malware, botnet C2), custom allow/block lists và trả về NXDOMAIN/NODATA/OVERRIDE khi chặn.

</details>

### Câu 2 `hard`

A company hosts containerized applications on Amazon EKS worker nodes (EC2 instances) that use IAM Roles for Service Accounts (IRSA). A penetration test reveals that a Server-Side Request Forgery (SSRF) vulnerability inside a web application container allowed an attacker to retrieve the underlying EC2 node's IAM role credentials from 169.254.169.254. Which TWO configurations should the security team apply to remediate this vulnerability and prevent future deployments from being exposed? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Enforce IMDSv2 by setting HttpTokens to required and HttpPutResponseHopLimit to 1 on the EC2 worker nodes.
- **B.** Set HttpPutResponseHopLimit to 2 on the EC2 worker nodes so containers can authenticate directly with IMDSv2.
- **C.** Add an outbound Network ACL rule denying traffic to 169.254.169.254/32 on the worker node subnet.
- **D.** Apply an Organizations SCP denying ec2:RunInstances unless ec2:MetadataHttpTokens equals required.
- **E.** Disable Instance Metadata Service completely (HttpEndpoint=disabled) on all EKS worker nodes.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ các ứng dụng container hóa trên các worker node Amazon EKS (EC2 instance) sử dụng IAM Roles for Service Accounts (IRSA). Một đợt kiểm thử xâm nhập phát hiện một lỗ hổng Server-Side Request Forgery (SSRF) bên trong một container ứng dụng web cho phép kẻ tấn công lấy được thông tin xác thực IAM role của EC2 node bên dưới từ 169.254.169.254. Nhóm bảo mật nên áp dụng HAI cấu hình nào để khắc phục lỗ hổng này và ngăn chặn các lần triển khai trong tương lai bị lộ? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, D**

Kịch bản EKS + SSRF + IMDSv2 là câu hỏi cực kỳ phổ biến trong SCS-C02: (1) Bật `HttpTokens=required` (IMDSv2) chống SSRF, (2) Nếu dùng IRSA/Pod Identity và muốn chặn pod chạm vào EC2 node role, đặt `HttpPutResponseHopLimit=1` (chỉ đặt = 2 khi thực sự muốn container dùng IMDSv2 của host), và (3) Dùng SCP với `ec2:MetadataHttpTokens` để ép buộc toàn tổ chức.

- **A (Đúng):** Chính xác! Bật IMDSv2 (HttpTokens=required) chống SSRF vì yêu cầu PUT request kèm header đặc biệt để lấy session token. Đặt HttpPutResponseHopLimit=1 đảm bảo gói tin trả về từ IMDS không thể đi qua bridge network thêm 1 hop nữa để vào trong pod/container, ngăn chặn hoàn toàn container lấy quyền của EC2 node trong khi node vẫn dùng được IMDS và pod dùng IRSA.
- **B:** Đặt hop limit = 2 chính là cho phép container truy cập được vào IMDS của EC2 node! Vì hệ thống đã dùng IRSA cho pod, ta cần đặt hop limit = 1 để CHẶN container lấy credentials của EC2 node.
- **C:** Địa chỉ link-local 169.254.169.254 nằm cục bộ trên hypervisor của EC2, lưu lượng tới địa chỉ này không đi qua subnet router nên Network ACL không có tác dụng chặn.
- **D (Đúng):** Chính xác! SCP với condition key ec2:MetadataHttpTokens = required (dùng StringNotEquals trong Deny) là guardrail phòng ngừa (preventive guardrail) đảm bảo không ai có thể khởi chạy EC2 instance mới với IMDSv1 trong tương lai.
- **E:** Tắt hoàn toàn IMDS trên EKS worker nodes sẽ làm hỏng kubelet, AWS VPC CNI plugin và các dịch vụ hệ thống trên node cần lấy instance identity/credentials của chính EC2 node.

</details>

### Câu 3 `hard`

A company hosts containerized applications on Amazon EC2 instances behind an Application Load Balancer. A recent security audit revealed that an application vulnerability (SSRF) could allow an attacker inside a Docker container to query the EC2 Instance Metadata Service (IMDS) and steal the EC2 instance profile credentials. How should the security engineer harden IMDS to prevent SSRF attacks while still allowing legitimate processes on the host and inside containers to use IMDS securely?

- **A.** Disable the 169.254.169.254 route in the VPC route table so that no EC2 instance can reach IMDS.
- **B.** Attach a VPC security group outbound rule denying TCP port 80 to 169.254.169.254/32.
- **C.** Enforce IMDSv2 (HttpTokens=required) and set HttpPutResponseHopLimit to 1 (host only) or 2 (containers).
- **D.** Configure an IAM permission boundary on the EC2 instance profile to deny access to the IMDS API.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ các ứng dụng container hóa trên các Amazon EC2 instance phía sau Application Load Balancer. Một đợt kiểm toán bảo mật gần đây tiết lộ rằng một lỗ hổng ứng dụng (SSRF) có thể cho phép kẻ tấn công bên trong Docker container truy vấn EC2 Instance Metadata Service (IMDS) và đánh cắp thông tin xác thực EC2 instance profile. Kỹ sư bảo mật nên tăng cường bảo mật IMDS như thế nào để ngăn chặn các cuộc tấn công SSRF trong khi vẫn cho phép các tiến trình hợp pháp trên máy chủ và bên trong container sử dụng IMDS một cách an toàn?

**Đáp án đúng:** **C**

**IMDSv2** (`HttpTokens=required`) sử dụng yêu cầu `PUT` để lấy session token kèm header `X-aws-ec2-metadata-token-ttl-seconds`, bảo vệ hiệu quả trước SSRF và open reverse proxies. Thuộc tính `HttpPutResponseHopLimit=1` ngăn các container đứng sau lớp NAT/bridge của Docker lấy token từ IMDS (đặt `=2` nếu container cần dùng IMDSv2).

- **A:** Địa chỉ link-local `169.254.169.254` được xử lý cục bộ bởi hypervisor chứ không đi qua VPC route table; hơn nữa tắt hoàn toàn IMDS sẽ làm các tiến trình hợp lệ không lấy được metadata.
- **B:** Security Group không lọc lưu lượng link-local tới IMDS (`169.254.169.254`), và nếu chặn hoàn toàn thì các tiến trình hợp lệ trên host cũng không dùng được.
- **C (Đúng):** Chính xác! Bật bắt buộc IMDSv2 (`HttpTokens=required`) yêu cầu một phiên PUT có header đặc biệt để lấy token trước khi GET metadata, qua đó vô hiệu hóa hầu hết các lỗ hổng SSRF thông thường. Đồng thời cấu hình `HttpPutResponseHopLimit=1` ngăn container truy cập IMDS qua bridge network (hoặc `=2` nếu container thực sự cần truy cập nhưng vẫn được bảo vệ bởi cơ chế session token của IMDSv2).
- **D:** IMDS là dịch vụ cục bộ cung cấp credentials cho instance, không phải lời gọi AWS API được kiểm soát bởi IAM permission boundary.

</details>

### Câu 4 `hard`

A financial services company deploys serverless applications on AWS Lambda. To prevent supply-chain attacks where an unauthorized or tampered deployment package is uploaded directly to a Lambda function, the security team must ensure that AWS Lambda REJECTS any code deployment unless the package has been cryptographically signed by the company's trusted CI/CD signing profile. Which AWS capability should the team implement?

- **A.** Enable Amazon Inspector Lambda code scanning so that unsigned deployment packages are blocked during UpdateFunctionCode.
- **B.** Encrypt the Lambda ZIP deployment package using SSE-S3 with AES-256 before uploading the artifact to Amazon S3.
- **C.** Attach a Lambda Code Signing Configuration referencing an AWS Signer profile with UntrustedArtifactOnDeployment set to Enforce.
- **D.** Enable AWS CloudTrail Log File Validation on the S3 bucket that stores Lambda deployment artifacts for integrity checks.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty dịch vụ tài chính triển khai các ứng dụng serverless trên AWS Lambda. Để ngăn chặn các cuộc tấn công chuỗi cung ứng nơi một gói triển khai trái phép hoặc bị giả mạo được tải trực tiếp lên một Lambda function, nhóm bảo mật phải đảm bảo rằng AWS Lambda TỪ CHỐI mọi lần triển khai mã trừ khi gói đó đã được ký mật mã bởi hồ sơ ký CI/CD đáng tin cậy của công ty. Nhóm nên triển khai khả năng AWS nào?

**Đáp án đúng:** **C**

**AWS Signer + Lambda Code Signing Configuration** (chế độ `Enforce`) giúp bảo vệ chuỗi cung ứng phần mềm (software supply chain) bằng cách xác minh chữ ký số mật mã trước khi cho phép triển khai hoặc cập nhật mã nguồn AWS Lambda.

- **A:** Amazon Inspector chỉ quét lỗ hổng bảo mật sau khi hàm Lambda đã được triển khai, không có cơ chế xác minh chữ ký số để chặn triển khai mã không tin cậy.
- **B:** SSE-S3 chỉ mã hóa file trên S3 ở trạng thái nghỉ, không xác minh nguồn gốc hay chữ ký số của gói mã khi triển khai lên Lambda.
- **C (Đúng):** Chính xác! **AWS Signer** tích hợp trực tiếp với **AWS Lambda Code Signing Configuration**: khi đặt chính sách `UntrustedArtifactOnDeployment = Enforce`, Lambda sẽ kiểm tra chữ ký mật mã của gói triển khai và từ chối (reject) mọi gói mã không được ký bởi signing profile tin cậy hoặc đã bị sửa đổi.
- **D:** CloudTrail Log File Validation chỉ xác minh tính toàn vẹn của tệp nhật ký CloudTrail, không kiểm tra chữ ký gói mã nguồn Lambda.

</details>

### Câu 5 `hard`

A vulnerability management team needs to prioritize patching across 400 Amazon EC2 instances and 150 Amazon ECR container repositories. Rather than treating every critical CVE equally, the team wants an AWS service that automatically correlates software package vulnerabilities with network reachability (identifying which EC2 instances are actually reachable from the internet via an Internet Gateway or Load Balancer) and can export Software Bills of Materials (SBOMs) in CycloneDX format to Amazon S3. Which AWS service provides these capabilities?

- **A.** Amazon GuardDuty Malware Protection for EC2 and S3 buckets.
- **B.** AWS Network Access Analyzer with custom VPC reachability scopes.
- **C.** AWS Trusted Advisor Fault Tolerance and Security checks.
- **D.** Amazon Inspector with EC2 and ECR enhanced scanning enabled.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm quản lý lỗ hổng cần ưu tiên việc vá lỗi trên 400 Amazon EC2 instance và 150 Amazon ECR container repository. Thay vì đối xử với mọi CVE nghiêm trọng như nhau, nhóm muốn một dịch vụ AWS tự động tương quan các lỗ hổng gói phần mềm với khả năng tiếp cận mạng (xác định EC2 instance nào thực sự có thể truy cập được từ internet qua Internet Gateway hoặc Load Balancer) và có thể xuất Software Bills of Materials (SBOMs) ở định dạng CycloneDX sang Amazon S3. Dịch vụ AWS nào cung cấp các khả năng này?

**Đáp án đúng:** **D**

**Amazon Inspector** là dịch vụ quản lý lỗ hổng tự động và liên tục cho **EC2, ECR và Lambda**, nổi bật với khả năng chấm điểm ưu tiên dựa trên **network reachability** + exploitability và hỗ trợ xuất **SBOM** (CycloneDX / SPDX) tập trung về S3.

- **A:** GuardDuty Malware Protection phát hiện phần mềm độc hại (virus/trojan) chứ không quét lỗ hổng CVE của gói phần mềm, không phân tích network reachability và không xuất SBOM.
- **B:** VPC Network Access Analyzer chỉ kiểm tra đường đi mạng (network paths) trong VPC, không quét lỗ hổng phần mềm CVE trên EC2/ECR và không xuất SBOM.
- **C:** Trusted Advisor không quét lỗ hổng CVE trong gói phần mềm OS/container hay xuất SBOM.
- **D (Đúng):** Chính xác! **Amazon Inspector** (v2) tự động quét liên tục lỗ hổng phần mềm trên EC2, ECR và Lambda, kết hợp phân tích **network reachability** (tính điểm rủi ro Inspector score dựa trên khả năng tiếp cận từ Internet và khả năng khai thác), đồng thời hỗ trợ xuất **SBOM** chuẩn CycloneDX hoặc SPDX sang Amazon S3.

</details>

### Câu 6 `hard`

A security engineer is hardening a production Amazon EKS cluster that processes payment data. The engineer must ensure that: (1) Kubernetes Secrets stored in etcd are encrypted using a customer managed AWS KMS key, and (2) pods accessing Amazon S3 and DynamoDB receive least-privilege IAM credentials scoped only to their specific service account rather than inheriting the broader IAM role of the EC2 worker node. Which TWO configurations should the engineer implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Enable Amazon EKS envelope encryption for Kubernetes Secrets stored in etcd using a customer managed AWS KMS key.
- **B.** Attach the S3 and DynamoDB permissions directly to the EC2 worker node instance profile so all pods share the same credentials.
- **C.** Enable public-only access on the EKS cluster API server endpoint with 0.0.0.0/0 CIDR allowed for remote kubectl administration.
- **D.** Use EKS Pod Identity or IRSA to map least-privilege IAM roles to Service Accounts, and block pod access to EC2 IMDS.
- **E.** Store long-lived IAM user access keys inside plain-text Kubernetes ConfigMaps mounted as environment variables into each pod.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư bảo mật đang tăng cường bảo mật cho một cụm Amazon EKS production xử lý dữ liệu thanh toán. Kỹ sư phải đảm bảo rằng: (1) Các Kubernetes Secret lưu trữ trong etcd được mã hóa bằng customer managed AWS KMS key, và (2) các pod truy cập Amazon S3 và DynamoDB nhận thông tin xác thực IAM đặc quyền tối thiểu chỉ giới hạn trong service account cụ thể của chúng thay vì kế thừa IAM role rộng hơn của EC2 worker node. Kỹ sư nên triển khai HAI cấu hình nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, D**

Best practices bảo mật **Amazon EKS**: (1) Bật **KMS Envelope Encryption** cho Kubernetes Secrets trong etcd; (2) Dùng **EKS Pod Identity** hoặc **IRSA** để cấp quyền IAM tối thiểu cho từng pod thay vì dùng chung EC2 node role (và chặn IMDS với `HttpPutResponseHopLimit=1`); (3) Giới hạn EKS API endpoint ở chế độ Private hoặc Private+Public kèm CIDR allowlist.

- **A (Đúng):** Chính xác! Bật **EKS Secrets Encryption** (envelope encryption) sử dụng Customer Managed KMS Key sẽ mã hóa mọi Kubernetes Secrets trước khi lưu vào etcd của EKS control plane.
- **B:** Gán quyền ứng dụng trực tiếp vào EC2 worker node role làm tăng bán kính ảnh hưởng (blast radius) vì bất kỳ pod nào bị xâm nhập trên node đều lấy được quyền đó.
- **C:** Mở công khai EKS API server endpoint cho `0.0.0.0/0` làm tăng bề mặt tấn công thay vì tăng cường bảo mật (hardening).
- **D (Đúng):** Chính xác! **EKS Pod Identity** (hoặc **IRSA**) gán IAM Role riêng biệt theo nguyên tắc least privilege cho từng Kubernetes Service Account của pod, tránh việc mọi pod trên cùng node kế thừa chung EC2 worker node IAM role.
- **E:** Lưu IAM access keys dài hạn trong ConfigMap dạng văn bản rõ là sai lầm bảo mật nghiêm trọng.

</details>

---

[Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md)
