# Bài tập tình huống — DevSecOps, Bảo mật Dữ liệu & Phát hiện Mối đe dọa

> GuardDuty, Amazon Inspector, Security Hub, Amazon Macie, KMS Key Policies, Secrets Manager Rotation, CodeGuru Security và Bảo mật Pipeline CI/CD.
> **Số câu hỏi:** 17 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A DevSecOps team uses AWS CodePipeline and AWS CodeBuild to build Docker images, push them to Amazon ECR, and deploy them to Amazon EKS. Security policy mandates that any container image with CRITICAL or HIGH OS or programming language package vulnerabilities MUST automatically fail the pipeline before reaching the deployment stage. How should the team implement this security gate with the LEAST management overhead?

- **A.** Enable Inspector Enhanced Scanning on ECR, push a staging tag in CodeBuild, query scan findings via AWS CLI, and fail on CRITICAL or HIGH findings.
- **B.** Enable ECR Basic Scanning, deploy the container image to Amazon EKS first, and rely on Amazon GuardDuty Runtime Monitoring to delete vulnerable pods.
- **C.** Launch a dedicated EC2 instance inside the CodeBuild build phase to run manual penetration tests against the container image before pushing to ECR.
- **D.** Use AWS Config managed compliance rules to statically scan Dockerfiles stored in AWS CodeCommit repositories for vulnerable language dependencies.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm DevSecOps sử dụng AWS CodePipeline và AWS CodeBuild để build Docker image, đẩy chúng lên Amazon ECR và triển khai lên Amazon EKS. Chính sách bảo mật bắt buộc bất kỳ container image nào có lỗ hổng gói phần mềm OS hoặc ngôn ngữ lập trình ở mức CRITICAL hoặc HIGH PHẢI tự động làm pipeline thất bại trước khi tới giai đoạn triển khai. Nhóm nên triển khai cổng bảo mật này như thế nào với chi phí quản lý ÍT NHẤT?

**Đáp án đúng:** **A**

Amazon Inspector Enhanced Scanning trên ECR hỗ trợ quét sâu cả OS và thư viện ngôn ngữ lập trình (Java, Python, Node.js...). Tích hợp kiểm tra kết quả scan ngay trong bước CodeBuild tạo thành một DevSecOps security gate hiệu quả, ngăn image lỗi lọt vào môi trường Production.

- **A (Đúng):** Chính xác! Amazon Inspector Enhanced Scanning tự động quét cả OS packages và programming language dependencies ngay khi image được push lên ECR. CodeBuild kiểm tra kết quả quét và trả về exit code khác 0 để chặn pipeline nếu phát hiện lỗ hổng CRITICAL hoặc HIGH.
- **B:** Sai. ECR Basic Scanning chỉ quét OS packages (không quét language packages), và triển khai image có lỗ hổng lên EKS trước là vi phạm yêu cầu chặn ngay tại CI/CD gate.
- **C:** Sai. Khởi chạy EC2 thủ công trong lúc build rất chậm và tốn công vận hành.
- **D:** Sai. AWS Config đánh giá cấu hình tài nguyên AWS, không quét lỗ hổng CVE bên trong Dockerfile hay container image.

</details>

### Câu 2 `hard`

A high-availability web application connects to an Amazon RDS for PostgreSQL Multi-AZ database using credentials stored in AWS Secrets Manager. When the team enabled automatic 30-day secret rotation using the single-user rotation strategy, active application instances experienced brief authentication failures during every rotation window because cached passwords became invalid. Which TWO changes should the DevOps engineer implement to achieve zero-downtime credential rotation? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Configure the rotation Lambda function to restart all Amazon EC2 instances in the Auto Scaling Group immediately after updating the RDS password.
- **B.** Switch Secrets Manager rotation to the alternating users strategy so two database users alternate between AWSCURRENT and AWSPENDING labels.
- **C.** Move the database password to AWS Systems Manager Parameter Store SecureString because Parameter Store handles zero-downtime RDS rotation natively.
- **D.** Configure the application to catch DB authentication errors, refresh the secret using the Secrets Manager caching client, and retry the connection.
- **E.** Disable SSL/TLS connections to Amazon RDS during the 5-minute rotation window to allow passwordless fallback authentication for clients.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng web độ sẵn sàng cao kết nối tới cơ sở dữ liệu Amazon RDS for PostgreSQL Multi-AZ bằng thông tin xác thực lưu trong AWS Secrets Manager. Khi nhóm bật tính năng xoay vòng bí mật tự động mỗi 30 ngày bằng chiến lược xoay vòng một người dùng (single-user rotation), các instance ứng dụng đang hoạt động gặp phải các lỗi xác thực ngắn trong mỗi khung giờ xoay vòng vì mật khẩu được cache trở nên không hợp lệ. Kỹ sư DevOps nên thực hiện HAI thay đổi nào để đạt được xoay vòng thông tin xác thực không gián đoạn (zero-downtime)? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Trong AWS Secrets Manager, chiến lược Single User đổi mật khẩu của đúng user đang chạy nên dễ làm đứt kết nối ứng dụng có cache. Để xoay vòng mật khẩu RDS zero-downtime, hãy dùng chiến lược Alternating Users kết hợp với Secrets Manager client-side caching và cơ chế refresh/retry trong ứng dụng.

- **A:** Sai. Khởi động lại toàn bộ EC2 instances sẽ gây gián đoạn dịch vụ (downtime), đi ngược lại yêu cầu zero-downtime.
- **B (Đúng):** Chính xác! Chiến lược Alternating Users sử dụng hai tài khoản DB luân phiên (user A và user B). Khi user mới (AWSPENDING) được đổi mật khẩu và kích hoạt thành AWSCURRENT, user cũ (AWSPREVIOUS) vẫn hợp lệ cho đến kỳ xoay vòng tiếp theo, giúp ứng dụng không bao giờ bị lỗi xác thực đột ngột.
- **C:** Sai. Parameter Store không có tính năng tự động xoay vòng (automatic rotation) mật khẩu RDS như Secrets Manager.
- **D (Đúng):** Chính xác! Ứng dụng nên sử dụng Secrets Manager caching client (hoặc cơ chế refresh secret khi gặp lỗi xác thực) để nhanh chóng chuyển sang credential AWSCURRENT mới mà không cần khởi động lại ứng dụng.
- **E:** Sai. Tắt SSL/TLS gây mất an toàn nghiêm trọng và cũng không tạo ra cơ chế đăng nhập không mật khẩu.

</details>

### Câu 3 `hard`

A security team uses Amazon GuardDuty aggregated into AWS Security Hub across all accounts. When GuardDuty detects a high-severity CryptoCurrency:EC2/BitcoinTool.B!DNS finding on an Amazon EC2 instance, the incident response playbook requires automatically isolating the compromised instance from the network within 1 minute while preserving its EBS volumes and memory state for forensic analysis—without terminating the instance. Which automated workflow meets these requirements?

- **A.** Configure an EventBridge rule to invoke an AWS Lambda function that calls ec2:TerminateInstances on the compromised instance and deletes its IAM role.
- **B.** Configure AWS WAF Web ACL IP set rules to block the private IP address of the compromised EC2 instance from making outbound API calls.
- **C.** Use EventBridge on Security Hub GuardDuty findings to run Step Functions that apply a no-rule quarantine Security Group, snapshot EBS, and notify.
- **D.** Configure Amazon GuardDuty to automatically stop the compromised EC2 instance by enabling GuardDuty Auto-Remediation in the AWS console.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm bảo mật sử dụng Amazon GuardDuty được tổng hợp vào AWS Security Hub trên tất cả các tài khoản. Khi GuardDuty phát hiện một finding mức độ nghiêm trọng cao là CryptoCurrency:EC2/BitcoinTool.B!DNS trên một Amazon EC2 instance, playbook ứng phó sự cố yêu cầu tự động cô lập instance bị xâm phạm khỏi mạng trong vòng 1 phút trong khi vẫn giữ nguyên các EBS volume và trạng thái bộ nhớ để phân tích điều tra số (forensic)—mà không terminate instance. Quy trình tự động hóa nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **C**

Quy trình cách ly EC2 chuẩn Forensics trên AWS sử dụng GuardDuty -> Security Hub -> EventBridge -> Step Functions/Lambda để: (1) gắn Quarantine Security Group (không có rule inbound/outbound), (2) thu hồi phiên IAM role nếu cần, (3) chụp EBS snapshot, và (4) giữ instance sống để phân tích bộ nhớ.

- **A:** Sai. Terminate instance sẽ làm mất toàn bộ bộ nhớ (memory state) và có thể xóa EBS root volume (DeleteOnTermination), phá hủy bằng chứng forensics.
- **B:** Sai. AWS WAF chỉ lọc lưu lượng HTTP/HTTPS đi vào ALB/CloudFront/API Gateway, không thể cách ly lưu lượng mạng outbound của EC2 instance.
- **C (Đúng):** Chính xác! Thay thế Security Group của EC2 bằng một Quarantine Security Group (chặn toàn bộ inbound và outbound) giúp cách ly mạng tức thì mà vẫn giữ nguyên instance đang chạy (giữ memory state) và tạo EBS snapshot phục vụ điều tra số (forensics).
- **D:** Sai. GuardDuty là dịch vụ phát hiện mối đe dọa (threat detection), không có nút Auto-Remediation tự động stop EC2; hơn nữa stop instance sẽ làm mất memory state.

</details>

### Câu 4 `medium`

An organization requires that every Amazon S3 bucket across its Production account must have S3 Block Public Access enabled and default server-side encryption configured. If a developer creates a non-compliant bucket or disables Block Public Access, the system must automatically detect the violation and re-enable Block Public Access without manual intervention, while maintaining a continuous compliance audit trail. What is the MOST operationally efficient solution?

- **A.** Schedule an AWS Lambda function via EventBridge cron every 12 hours to list all Amazon S3 buckets and overwrite their bucket policies.
- **B.** Enable S3 Server Access Logging on all buckets and analyze the raw access logs with Amazon Athena weekly to detect public bucket ACLs.
- **C.** Enable Amazon Macie on the Production account to automatically enable S3 Block Public Access on all non-compliant Amazon S3 buckets.
- **D.** Enable AWS Config s3-bucket-level-public-access-prohibited rules with Automatic Remediation using AWS-ConfigureS3BucketPublicAccessBlock.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức yêu cầu mọi Amazon S3 bucket trong tài khoản Production phải bật S3 Block Public Access và cấu hình mã hóa phía máy chủ mặc định. Nếu nhà phát triển tạo một bucket không tuân thủ hoặc tắt Block Public Access, hệ thống phải tự động phát hiện vi phạm và bật lại Block Public Access mà không cần can thiệp thủ công, đồng thời duy trì nhật ký kiểm toán tuân thủ liên tục. Giải pháp hiệu quả về mặt vận hành NHẤT là gì?

**Đáp án đúng:** **D**

AWS Config Managed Rules kết hợp với Automatic Remediation sử dụng SSM Automation runbook có sẵn của AWS là giải pháp chuẩn, ít mã nguồn tùy chỉnh nhất cho bài toán continuous compliance và tự động khắc phục cấu hình sai lệch.

- **A:** Sai. Chạy cron 12 giờ/lần có độ trễ phát hiện lớn, không có compliance audit trail chuẩn và ghi đè bucket policy có thể làm hỏng quyền truy cập hợp lệ của ứng dụng.
- **B:** Sai. S3 Server Access Logging chỉ ghi nhận request truy cập dữ liệu, không tự động khắc phục cấu hình Block Public Access.
- **C:** Sai. Amazon Macie phát hiện dữ liệu nhạy cảm (PII) và cảnh báo cấu hình S3, nhưng không tự động thực thi remediation bật Block Public Access.
- **D (Đúng):** Chính xác! AWS Config vừa cung cấp lịch sử kiểm toán tuân thủ liên tục (compliance audit trail), vừa hỗ trợ Automatic Remediation gắn trực tiếp với SSM Automation document có sẵn (AWS-ConfigureS3BucketPublicAccessBlock) để tự động khắc phục mà không cần viết code.

</details>

### Câu 5 `medium`

External auditors require a centralized, immutable, and tamper-evident audit log of all AWS API activity across every existing and future AWS account in AWS Organizations. Logs must be stored in a dedicated Log Archive account for 7 years, encrypted with a Customer Managed KMS key, and auditors must be able to cryptographically verify that no log file was modified or deleted after delivery—even if a privileged administrator in the Log Archive account is compromised. Which combination of features satisfies ALL requirements?

- **A.** Create a CloudTrail Organization Trail (multi-Region) with Log File Validation and SSE-KMS (CMK) to a Log Archive S3 bucket with Object Lock Compliance (7 years).
- **B.** Enable individual CloudTrail trails in each member account delivering to local S3 buckets with S3 Versioning enabled and SSE-S3 encryption.
- **C.** Create a multi-Region CloudTrail Organization Trail delivering events to Amazon CloudWatch Logs with a 7-year log group retention policy.
- **D.** Create a CloudTrail Organization Trail delivering logs to an S3 bucket with S3 Object Lock in Governance mode and MFA Delete disabled.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Kiểm toán viên bên ngoài yêu cầu một nhật ký kiểm toán tập trung, bất biến và có khả năng phát hiện giả mạo (tamper-evident) về mọi hoạt động AWS API trên tất cả các tài khoản AWS hiện tại và tương lai trong AWS Organizations. Log phải được lưu trữ trong một tài khoản Log Archive chuyên dụng trong 7 năm, mã hóa bằng Customer Managed KMS key và kiểm toán viên phải có thể xác minh bằng mật mã rằng không có tệp log nào bị sửa đổi hoặc xóa sau khi phân phối—ngay cả khi một quản trị viên có đặc quyền trong tài khoản Log Archive bị xâm phạm. Sự kết hợp các tính năng nào đáp ứng TẤT CẢ các yêu cầu?

**Đáp án đúng:** **A**

Bộ tứ tiêu chuẩn vàng cho Audit Logging cấp doanh nghiệp trên AWS: (1) CloudTrail Organization Trail (multi-Region), (2) Log File Validation (xác thực mật mã chống sửa đổi), (3) Customer Managed KMS Key, và (4) S3 Object Lock ở chế độ Compliance Mode tại tài khoản Log Archive chuyên biệt.

- **A (Đúng):** Chính xác! Organization Trail tự động ghi log mọi tài khoản hiện tại và tương lai trong Organizations; Log File Validation tạo chuỗi chữ ký số SHA-256/RSA để kiểm chứng tính toàn vẹn mật mã (tamper-evident); S3 Object Lock chế độ Compliance mode 7 năm đảm bảo bất biến tuyệt đối ngay cả trước admin hoặc root user.
- **B:** Sai. Không tự động áp dụng cho tài khoản mới trong tương lai, không tập trung về Log Archive account, không dùng CMK và S3 Versioning không ngăn admin xóa version hay tắt logging.
- **C:** Sai. CloudWatch Logs không có tính năng Log File Validation bằng chữ ký mật mã hay S3 Object Lock Compliance mode chống xóa từ admin.
- **D:** Sai. Governance mode cho phép admin có quyền đặc biệt (s3:BypassGovernanceRetention) ghi đè và xóa log trước hạn 7 năm, không đáp ứng yêu cầu chống admin bị xâm nhập.

</details>

### Câu 6 `medium`

A retail enterprise stores terabytes of customer analytics files across hundreds of Amazon S3 buckets in multiple AWS Organizations accounts. Data privacy regulations mandate automated discovery of accidentally uploaded Personally Identifiable Information (PII) such as credit card numbers and national IDs. Whenever PII is discovered in an S3 object, the system must centrally record the finding in AWS Security Hub AND automatically tag the S3 object as 'Sensitivity=Restricted' while moving it to a quarantined S3 bucket within minutes. Which architecture achieves this?

- **A.** Enable Amazon Inspector on all Amazon S3 buckets to scan object contents for PII and trigger an SSM Automation remediation document.
- **B.** Enable Amazon GuardDuty S3 Protection across the organization to inspect inside CSV and Parquet files for unmasked credit card numbers.
- **C.** Enable AWS Config managed rule s3-bucket-ssl-requests-only and attach an automatic remediation Lambda function to quarantine objects containing PII.
- **D.** Enable Amazon Macie automated sensitive data discovery via delegated admin, route Security Hub findings via EventBridge to Lambda to quarantine.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp bán lẻ lưu trữ hàng terabyte tệp phân tích khách hàng trên hàng trăm Amazon S3 bucket trong nhiều tài khoản AWS Organizations. Quy định bảo vệ dữ liệu cá nhân bắt buộc tự động phát hiện Thông tin Nhận dạng Cá nhân (PII) vô tình tải lên như số thẻ tín dụng và số định danh quốc gia. Mỗi khi phát hiện PII trong một đối tượng S3, hệ thống phải ghi nhận phát hiện tập trung vào AWS Security Hub VÀ tự động gắn thẻ đối tượng S3 là 'Sensitivity=Restricted' đồng thời di chuyển nó sang một S3 bucket cách ly trong vòng vài phút. Kiến trúc nào đạt được điều này?

**Đáp án đúng:** **D**

Cần phân biệt rõ vai trò các dịch vụ bảo mật S3 trong kỳ thi DOP-C02: Amazon Macie quét nội dung object để phát hiện dữ liệu nhạy cảm/PII; GuardDuty S3 Protection phát hiện hành vi truy cập bất thường/malware; AWS Config kiểm tra cấu hình bảo mật của bucket. Kết hợp Macie -> Security Hub + EventBridge -> Lambda tạo thành quy trình bảo vệ dữ liệu tự động khép kín.

- **A:** Sai. Amazon Inspector quét lỗ hổng CVE trên EC2, ECR và Lambda, không quét nội dung file trên S3 để tìm dữ liệu PII.
- **B:** Sai. GuardDuty S3 Protection phân tích S3 CloudTrail data events (hành vi truy cập bất thường) và malware scanning, KHÔNG quét nội dung văn bản để phân loại PII như Amazon Macie.
- **C:** Sai. AWS Config chỉ kiểm tra cấu hình metadata của bucket (như bắt buộc SSL), không đọc nội dung dữ liệu bên trong object để phát hiện PII.
- **D (Đúng):** Chính xác! Amazon Macie chuyên dùng để phát hiện dữ liệu nhạy cảm (PII) trong Amazon S3 ở quy mô AWS Organizations (hỗ trợ automated sensitive data discovery), tự động đẩy finding sang Security Hub và phát sự kiện EventBridge để Lambda tự động gắn tag và cách ly object vi phạm.

</details>

### Câu 7 `medium`

A software vendor selling to government agencies must continuously scan all container images stored in Amazon ECR for OS and programming language package vulnerabilities, automatically re-scan images whenever new CVEs are published, and generate standardized Software Bill of Materials (SBOM) reports in CycloneDX format stored in an encrypted Amazon S3 bucket for customer audits. Which AWS service configuration meets these requirements with the LEAST operational overhead?

- **A.** Enable Amazon ECR Basic Scanning (Clair) and run a scheduled CodeBuild job to parse container image layers into CSV vulnerability reports.
- **B.** Enable Amazon Macie on the ECR repositories to detect vulnerable third-party libraries and export formatted PDF compliance reports to S3.
- **C.** Enable Inspector ECR Enhanced Scanning (continuous) and use CreateSbomExport to export CycloneDX or SPDX 2.3 SBOMs to KMS-encrypted S3.
- **D.** Deploy a fleet of EC2 instances running open-source vulnerability scanners that pull and inspect every ECR container image nightly.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà cung cấp phần mềm bán hàng cho các cơ quan chính phủ phải liên tục quét tất cả các container image lưu trữ trong Amazon ECR để tìm lỗ hổng của gói OS và ngôn ngữ lập trình, tự động quét lại image mỗi khi có CVE mới được công bố và tạo các báo cáo Software Bill of Materials (SBOM) chuẩn hóa ở định dạng CycloneDX lưu trữ trong một Amazon S3 bucket được mã hóa phục vụ kiểm toán khách hàng. Cấu hình dịch vụ AWS nào đáp ứng các yêu cầu này với chi phí vận hành ÍT NHẤT?

**Đáp án đúng:** **C**

Amazon Inspector (ECR Enhanced Scanning) hỗ trợ quét lỗ hổng liên tục (continuous scanning) cho cả OS và application packages, tự động phát hiện CVE mới công bố và tích hợp sẵn tính năng xuất SBOM định dạng CycloneDX/SPDX trực tiếp lên Amazon S3.

- **A:** Sai. ECR Basic Scanning chỉ quét OS package (không quét sâu programming language package và không tự động re-scan liên tục theo CVE mới như Enhanced Scanning), đồng thời không xuất chuẩn CycloneDX SBOM.
- **B:** Sai. Amazon Macie dùng để phát hiện dữ liệu nhạy cảm (PII) trên Amazon S3, không quét lỗ hổng CVE container image hay xuất SBOM.
- **C (Đúng):** Chính xác! Amazon Inspector tích hợp với ECR (Enhanced Scanning) cung cấp quét liên tục cả OS và gói ngôn ngữ lập trình (Java, Python, Node.js, Go...), tự động quét lại khi có CVE mới và hỗ trợ xuất SBOM chuẩn CycloneDX 1.4 / SPDX 2.3 trực tiếp ra S3 có mã hóa KMS.
- **D:** Sai. Tự vận hành cụm EC2 quét hàng đêm vừa tốn công bảo trì vừa không có tính năng re-scan liên tục khi có CVE mới.

</details>

### Câu 8 `medium`

A DevSecOps team wants to shift security left in their CI/CD pipelines for Python and Java microservices. They need automated static code analysis to detect hardcoded AWS credentials, SQL injection flaws, and insecure cryptographic usage directly during pull requests and builds, as well as automated validation that IAM policies defined in pull requests do not grant overly permissive access or contain syntax errors before deployment. Which TWO AWS services or features should the team integrate into their CI/CD workflow? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Run Amazon Detective inside AWS CodeBuild build containers to statically scan Java source code before compilation.
- **B.** Integrate Amazon CodeGuru Security (or Amazon Q Developer scans) into CI/CD for SAST vulnerability and hardcoded secrets detection.
- **C.** Enable AWS Shield Advanced on the Git repository endpoint to block SQL injection payloads in pull requests.
- **D.** Integrate IAM Access Analyzer custom policy checks (ValidatePolicy, CheckNoNewAccess, CheckAccessNotGranted) into CI/CD before deploy.
- **E.** Use AWS Artifact compliance reports to automatically scan Python source code for hardcoded AWS IAM access keys.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm DevSecOps muốn đưa bảo mật vào giai đoạn sớm hơn trong các CI/CD pipeline cho microservice Python và Java của họ. Họ cần phân tích mã tĩnh tự động để phát hiện thông tin xác thực AWS bị hardcode, lỗ hổng SQL injection và việc sử dụng mật mã không an toàn trực tiếp trong các pull request và bản build, cũng như xác thực tự động rằng các IAM policy được định nghĩa trong pull request không cấp quyền truy cập quá rộng hoặc chứa lỗi cú pháp trước khi triển khai. Nhóm nên tích hợp HAI dịch vụ hoặc tính năng AWS nào vào quy trình CI/CD của họ? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Shift-left DevSecOps trên AWS kết hợp Amazon CodeGuru Security / Amazon Q Developer cho SAST & secrets detection trong mã nguồn, cùng IAM Access Analyzer Policy Checks để kiểm định IAM policy trước khi triển khai.

- **A:** Sai. Amazon Detective dùng để điều tra nguyên nhân gốc rễ các sự cố bảo mật runtime từ CloudTrail/VPC Flow Logs/GuardDuty, không phải công cụ quét mã nguồn tĩnh (SAST).
- **B (Đúng):** Chính xác! Amazon CodeGuru Security / Amazon Q Developer cung cấp phân tích mã nguồn tĩnh (SAST) bằng ML để phát hiện hardcoded secrets, SQL injection, lỗ hổng OWASP Top 10 và đưa ra gợi ý vá lỗi ngay trong PR/CI pipeline.
- **C:** Sai. AWS Shield Advanced là dịch vụ chống tấn công DDoS ở tầng mạng/ứng dụng, không phân tích mã nguồn trong CI/CD.
- **D (Đúng):** Chính xác! IAM Access Analyzer Policy Validation & Custom Policy Checks tích hợp dễ dàng vào CI/CD để kiểm tra lỗi cú pháp, cảnh báo bảo mật và chặn các IAM policy cấp quyền quá rộng hoặc mở rộng quyền ngoài ý muốn trước khi deploy.
- **E:** Sai. AWS Artifact chỉ là cổng tải các báo cáo tuân thủ (SOC 2, ISO, PCI-DSS) và thỏa thuận của AWS, không có chức năng quét mã nguồn.

</details>

### Câu 9 `hard`

A high-traffic financial application connects to an Amazon RDS PostgreSQL database using credentials stored in AWS Secrets Manager. Security policy mandates rotating the database password every 30 days. However, when the team enabled Secrets Manager rotation using the single-user rotation strategy, active application instances experienced brief authentication failures during rotation because their cached connection pools still held the old password. How should the DevOps engineer configure Secrets Manager rotation to achieve ZERO-downtime password rotation?

- **A.** Increase the AWS Secrets Manager automatic rotation interval from 30 days to 365 days to reduce the frequency of authentication errors.
- **B.** Disable database connection pooling in the application so every SQL query invokes secretsmanager:GetSecretValue directly.
- **C.** Switch to Secrets Manager alternating users (multi-user) rotation so AWSCURRENT and AWSPREVIOUS DB users remain valid concurrently.
- **D.** Move the database password to AWS Systems Manager Parameter Store Standard Tier with an EventBridge rotation cron rule.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng tài chính lưu lượng cao kết nối tới cơ sở dữ liệu Amazon RDS PostgreSQL bằng thông tin xác thực lưu trong AWS Secrets Manager. Chính sách bảo mật bắt buộc xoay vòng mật khẩu cơ sở dữ liệu mỗi 30 ngày. Tuy nhiên, khi nhóm bật tính năng xoay vòng Secrets Manager bằng chiến lược xoay vòng một người dùng (single-user rotation), các instance ứng dụng đang hoạt động gặp phải các lỗi xác thực ngắn trong quá trình xoay vòng vì các connection pool được cache của chúng vẫn giữ mật khẩu cũ. Kỹ sư DevOps nên cấu hình xoay vòng Secrets Manager như thế nào để đạt được xoay vòng mật khẩu KHÔNG GIÁN ĐOẠN (zero-downtime)?

**Đáp án đúng:** **C**

AWS Secrets Manager hỗ trợ hai chiến lược xoay vòng cho DB: Single-user (đổi mật khẩu trực tiếp trên 1 user, có thể gây gián đoạn ngắn) và Alternating Users / Multi-user (luân phiên 2 user DB riêng biệt để đảm bảo zero-downtime cho hệ thống high-traffic).

- **A:** Sai. Vi phạm chính sách bảo mật xoay vòng 30 ngày và vẫn gây lỗi xác thực mỗi khi xoay vòng.
- **B:** Sai. Tắt connection pooling và gọi GetSecretValue trên mọi truy vấn SQL sẽ phá hủy hiệu năng ứng dụng, gây throttling Secrets Manager và tăng chi phí API cực lớn.
- **C (Đúng):** Chính xác! Chiến lược Alternating Users (multi-user) của Secrets Manager sử dụng 2 tài khoản DB luân phiên nhau (một user gắn nhãn AWSCURRENT, user còn lại gắn nhãn AWSPREVIOUS vẫn còn hiệu lực). Nhờ đó các connection pool cũ vẫn hoạt động bình thường cho đến khi tự làm mới secret mà hoàn toàn không có downtime.
- **D:** Sai. Parameter Store không có sẵn tính năng xoay vòng mật khẩu RDS luân phiên hai user như Secrets Manager.

</details>

### Câu 10 `medium`

A multi-account AWS Organization uses Amazon GuardDuty, Amazon Inspector, Amazon Macie, and AWS Config across 60 accounts. The security team struggles because findings are scattered across multiple consoles and formats. They want a single delegated Security account to aggregate all security findings in a standardized format, automatically score accounts against the AWS Foundational Security Best Practices (FSBP) and CIS AWS Foundations benchmarks, and allow analysts to click a single custom action button in the console to trigger an automated EC2 quarantine workflow via Amazon EventBridge and AWS Step Functions. Which AWS service serves as the central hub?

- **A.** AWS Security Hub with delegated admin, FSBP/CIS standards, cross-Region aggregation, and a Custom Action triggering EventBridge/Step Functions.
- **B.** AWS Trusted Advisor in the management account with Business Support plan enabled across all member accounts and Regions.
- **C.** Amazon Detective configured across AWS Organizations as the central FSBP and CIS compliance scoring and remediation tool.
- **D.** AWS Audit Manager configured with custom assessment frameworks to aggregate real-time GuardDuty findings and quarantine EC2 instances.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một AWS Organization đa tài khoản sử dụng Amazon GuardDuty, Amazon Inspector, Amazon Macie và AWS Config trên 60 tài khoản. Nhóm bảo mật gặp khó khăn vì các finding bị phân tán trên nhiều bảng điều khiển và định dạng khác nhau. Họ muốn một tài khoản Security được ủy quyền duy nhất để tổng hợp tất cả các finding bảo mật theo một định dạng chuẩn hóa, tự động chấm điểm các tài khoản theo các bộ tiêu chuẩn AWS Foundational Security Best Practices (FSBP) và CIS AWS Foundations, đồng thời cho phép các chuyên viên phân tích nhấp vào một nút hành động tùy chỉnh duy nhất trong bảng điều khiển để kích hoạt quy trình cách ly EC2 tự động qua Amazon EventBridge và AWS Step Functions. Dịch vụ AWS nào đóng vai trò là trung tâm điều phối?

**Đáp án đúng:** **A**

AWS Security Hub (với Delegated Admin + Cross-Region Aggregation) chuẩn hóa mọi finding từ GuardDuty, Inspector, Macie, IAM Access Analyzer, Config về chuẩn ASFF, chấm điểm FSBP/CIS và hỗ trợ phản ứng tự động hoặc bán tự động (Custom Actions) qua EventBridge.

- **A (Đúng):** Chính xác! AWS Security Hub là trung tâm tổng hợp phát hiện bảo mật chuẩn hóa theo định dạng ASFF (AWS Security Finding Format) từ GuardDuty, Inspector, Macie, Config..., hỗ trợ đánh giá chuẩn FSBP/CIS xuyên suốt Organization, gom đa Region và hỗ trợ Custom Actions gửi trực tiếp sự kiện sang EventBridge để chạy Step Functions/Lambda xử lý sự cố.
- **B:** Sai. Trusted Advisor không tổng hợp findings từ GuardDuty/Inspector/Macie theo chuẩn ASFF và không có tính năng Custom Action gọi EventBridge.
- **C:** Sai. Amazon Detective dùng để điều tra đồ thị mối quan hệ sự cố bảo mật, không chấm điểm tuân thủ CIS/FSBP hay cung cấp Custom Action button.
- **D:** Sai. AWS Audit Manager dùng để thu thập bằng chứng phục vụ kiểm toán, không phải trung tâm gom findings thời gian thực hay cách ly EC2.

</details>

### Câu 11 `hard`

A large enterprise using AWS Organizations wants a data perimeter guardrail guaranteeing that NO Amazon S3 bucket, Amazon SQS queue, or AWS KMS key owned by any member account can EVER be accessed by an external AWS principal outside the organization—even if a developer accidentally attaches an overly permissive resource-based policy (such as Principal: "*") to an S3 bucket. Service Control Policies (SCPs) alone do not restrict external principals from another AWS account calling into an S3 bucket. Which AWS Organizations policy type enforces this centrally across all accounts?

- **A.** Attach a Resource Control Policy (RCP) denying s3:*, sqs:*, and kms:* when aws:PrincipalOrgID differs (except aws:PrincipalIsAWSService).
- **B.** Attach a Service Control Policy (SCP) denying s3:GetObject, sqs:*, and kms:* when aws:PrincipalOrgID does not match the organization ID.
- **C.** Enable AWS IAM Access Analyzer in each member account to automatically block external principals on the data plane in real time.
- **D.** Attach an AWS Organizations Tag Policy requiring an Environment and DataClassification tag on every Amazon S3 bucket across the organization.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp lớn sử dụng AWS Organizations muốn có một guardrail vành đai dữ liệu (data perimeter) đảm bảo rằng KHÔNG một Amazon S3 bucket, Amazon SQS queue hoặc AWS KMS key nào thuộc sở hữu của bất kỳ tài khoản thành viên nào CÓ THỂ BAO GIỜ bị truy cập bởi một AWS principal bên ngoài tổ chức—ngay cả khi nhà phát triển vô tình gắn một resource-based policy quá rộng (như Principal: "*") vào một S3 bucket. Chỉ riêng Service Control Policies (SCPs) không hạn chế được các principal bên ngoài từ một tài khoản AWS khác gọi vào S3 bucket. Loại policy nào của AWS Organizations thực thi điều này một cách tập trung trên tất cả các tài khoản?

**Đáp án đúng:** **A**

Phân biệt cốt lõi trong Data Perimeter trên AWS Organizations: SCP (Service Control Policy) giới hạn quyền tối đa của IDENTITIES bên trong tổ chức, còn RCP (Resource Control Policy) giới hạn quyền tối đa lên RESOURCES bên trong tổ chức trước mọi đối tượng gọi tới (kể cả external principals).

- **A (Đúng):** Chính xác! AWS Organizations Resource Control Policies (RCPs) đặt trần quyền tối đa trực tiếp lên TÀI NGUYÊN (S3, SQS, KMS, STS, Secrets Manager...) trong tổ chức—ngay cả khi request đến từ một principal bên ngoài tài khoản/tổ chức (điều mà SCP không thể chặn vì SCP chỉ áp dụng cho IAM principal bên trong tổ chức).
- **B:** Sai. SCP chỉ đánh giá và giới hạn các IAM principal THUỘC VỀ tổ chức của bạn; một kẻ tấn công dùng IAM user từ tài khoản AWS bên ngoài gọi vào S3 bucket public sẽ KHÔNG bị đánh giá bởi SCP của bạn.
- **C:** Sai. IAM Access Analyzer là công cụ phát hiện (detective) tạo finding về chia sẻ bên ngoài, không phải cơ chế chặn chủ động ở tầng data plane như RCP.
- **D:** Sai. Tag Policy chỉ chuẩn hóa giá trị tag, không kiểm soát quyền truy cập vào S3/SQS/KMS.

</details>

### Câu 12 `medium`

A retail conglomerate has over 400 Amazon S3 buckets spread across 35 AWS accounts in AWS Organizations. Data governance officers suspect that analytics pipelines may have inadvertently copied unmasked customer PII (passport numbers, credit card numbers, and dates of birth) and accidental AWS secret keys into non-production S3 buckets. They need an automated, continuous, organization-wide solution that evaluates S3 bucket security posture, continuously discovers sensitive data across buckets with minimal cost, and sends findings to AWS Security Hub and Amazon EventBridge for automated alerting. Which AWS service should they enable?

- **A.** Enable Amazon Inspector S3 bucket scanning across all 35 member accounts to detect exposed passport numbers and credentials.
- **B.** Enable Amazon Macie Automated Sensitive Data Discovery via delegated admin, sending findings to Security Hub and EventBridge.
- **C.** Enable Amazon GuardDuty S3 Protection to automatically classify passport numbers and dates of birth inside Amazon S3 objects.
- **D.** Use AWS Glue Data Catalog crawlers to detect credit card numbers in S3 buckets and send findings to AWS Security Hub.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tập đoàn bán lẻ có hơn 400 Amazon S3 bucket trải rộng trên 35 tài khoản AWS trong AWS Organizations. Các nhân viên quản trị dữ liệu nghi ngờ rằng các pipeline phân tích có thể đã vô tình sao chép PII khách hàng chưa được che (số hộ chiếu, số thẻ tín dụng và ngày sinh) cũng như các AWS secret key vô tình bị lộ vào các S3 bucket không phải production. Họ cần một giải pháp tự động, liên tục trên toàn tổ chức để đánh giá tình trạng bảo mật S3 bucket, liên tục phát hiện dữ liệu nhạy cảm trên các bucket với chi phí tối thiểu và gửi các finding tới AWS Security Hub và Amazon EventBridge để cảnh báo tự động. Họ nên bật dịch vụ AWS nào?

**Đáp án đúng:** **B**

Amazon Macie (với Automated Sensitive Data Discovery ở cấp AWS Organizations) là dịch vụ chuyên biệt sử dụng ML và pattern matching để liên tục phát hiện dữ liệu nhạy cảm (PII, PHI, thông tin tài chính, AWS keys) trong Amazon S3 và tích hợp sẵn Security Hub/EventBridge.

- **A:** Sai. Amazon Inspector quét lỗ hổng CVE trên EC2, ECR và Lambda, không quét phát hiện dữ liệu nhạy cảm PII trên Amazon S3.
- **B (Đúng):** Chính xác! Amazon Macie hỗ trợ triển khai toàn Organization qua delegated administrator, cung cấp tính năng Automated Sensitive Data Discovery sử dụng lấy mẫu thông minh chi phí thấp để liên tục phát hiện PII (hộ chiếu, thẻ tín dụng, ngày sinh) và AWS credentials trên hàng trăm S3 bucket, đồng thời đẩy finding thẳng sang Security Hub và EventBridge.
- **C:** Sai. GuardDuty S3 Protection phân tích S3 Data Events (CloudTrail) để phát hiện hành vi truy cập bất thường/tấn công, không đọc nội dung file để phân loại PII như Macie.
- **D:** Sai. Glue Crawler chỉ suy luận schema bảng dữ liệu, không phải công cụ bảo mật phân loại PII/credentials và không tích hợp sẵn findings với Security Hub.

</details>

### Câu 13 `hard`

A global fintech platform uses client-side encryption (via the AWS Encryption SDK) to encrypt sensitive transaction payloads before storing them in an Amazon DynamoDB Global Table replicated between us-east-1 and eu-west-1. The architecture must allow services in eu-west-1 to decrypt records originally encrypted in us-east-1 locally within eu-west-1 WITHOUT making cross-Region network calls to us-east-1 KMS (for both low latency and regional resilience during a us-east-1 outage), and must automatically rotate cryptographic key material every year. Which AWS KMS design meets ALL requirements?

- **A.** Create two independent single-Region KMS CMKs in us-east-1 and eu-west-1 configured with the exact same KMS Key Alias name.
- **B.** Use a single-Region KMS CMK in us-east-1 and configure applications in eu-west-1 to call kms:Decrypt cross-Region over VPC Peering.
- **C.** Create a Multi-Region Primary Key (mrk-*) with annual rotation in us-east-1, replicate it to eu-west-1, and call local endpoints.
- **D.** Import the same raw AES-256 key material manually into two single-Region KMS keys and enable AWS KMS automatic annual key rotation.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng fintech toàn cầu sử dụng mã hóa phía máy khách (thông qua AWS Encryption SDK) để mã hóa các payload giao dịch nhạy cảm trước khi lưu trữ chúng trong một Amazon DynamoDB Global Table được sao chép giữa us-east-1 và eu-west-1. Kiến trúc phải cho phép các dịch vụ tại eu-west-1 giải mã các bản ghi ban đầu được mã hóa tại us-east-1 một cách cục bộ bên trong eu-west-1 MÀ KHÔNG thực hiện các cuộc gọi mạng cross-Region tới KMS ở us-east-1 (vì cả độ trễ thấp lẫn khả năng chống chịu theo vùng khi us-east-1 gặp sự cố), và phải tự động xoay vòng vật liệu khóa mật mã mỗi năm. Thiết kế AWS KMS nào đáp ứng TẤT CẢ các yêu cầu?

**Đáp án đúng:** **C**

AWS KMS Multi-Region Keys (mrk-*) giải quyết bài toán mã hóa/giải mã cục bộ trong kiến trúc Multi-Region Active-Active (như DynamoDB Global Tables + client-side encryption) mà không cần gọi xuyên Region hay mã hóa lại dữ liệu, đồng thời hỗ trợ tự động xoay vòng key hàng năm.

- **A:** Sai. Hai single-Region key độc lập dù đặt cùng Alias vẫn có key ID và key material hoàn toàn khác nhau, nên key ở eu-west-1 không thể giải mã dữ liệu đã mã hóa ở us-east-1.
- **B:** Sai. Gọi kms:Decrypt xuyên Region vừa tăng độ trễ cao vừa khiến eu-west-1 sập theo nếu us-east-1 gặp sự cố (mất tính độc lập vùng).
- **C (Đúng):** Chính xác! AWS KMS Multi-Region Keys (mrk-*) có cùng Key ID và cùng key material đồng bộ giữa Primary Key (us-east-1) và Replica Key (eu-west-1). Dữ liệu mã hóa tại us-east-1 có thể giải mã cục bộ tại eu-west-1 bằng Replica Key mà không cần gọi API cross-Region, vẫn hoạt động khi us-east-1 sập và tự động đồng bộ khi bật automatic key rotation hàng năm.
- **D:** Sai. KMS keys dùng imported key material (EXTERNAL origin) KHÔNG hỗ trợ automatic key rotation hàng năm, và hai key single-Region vẫn khác Key ID nên AWS Encryption SDK sẽ không tự nhận diện khớp key.

</details>

### Câu 14 `hard`

Following a penetration test that uncovered a Server-Side Request Forgery (SSRF) vulnerability on a web application running on Amazon EC2 and Amazon EKS worker nodes, the security team mandates enforcing Instance Metadata Service Version 2 (IMDSv2) across the entire AWS Organization. They want to prevent ANY new EC2 instance from being launched with IMDSv1 enabled, ensure containerized workloads cannot bypass hop limits to steal node IAM credentials, and detect any existing running EC2 instances still allowing IMDSv1. Which TWO controls should the DevSecOps engineer implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Block all outbound network traffic to 169.254.169.254 in every EC2 Security Group across all member accounts and Regions.
- **B.** Set HttpPutResponseHopLimit to 64 on all Amazon EKS worker nodes to protect container pods against SSRF metadata attacks.
- **C.** Disable IAM instance profiles on all EC2 instances and store static IAM access keys inside /etc/environment on the OS.
- **D.** Attach an SCP requiring ec2:MetadataHttpTokens=required on RunInstances and set account-level EC2 IMDS Defaults to HttpTokens=required.
- **E.** Enable the AWS Config ec2-imdsv2-check rule with SSM remediation (AWS-ModifyInstanceMetadataOptions) for existing EC2 instances.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Sau một đợt kiểm thử xâm nhập phát hiện lỗ hổng Server-Side Request Forgery (SSRF) trên một ứng dụng web chạy trên các Amazon EC2 và worker node Amazon EKS, nhóm bảo mật yêu cầu thực thi Instance Metadata Service Version 2 (IMDSv2) trên toàn bộ AWS Organization. Họ muốn ngăn chặn BẤT KỲ EC2 instance mới nào được khởi chạy với IMDSv1 được bật, đảm bảo các workload container không thể vượt qua giới hạn hop để đánh cắp thông tin xác thực IAM của node và phát hiện bất kỳ EC2 instance đang chạy hiện có nào vẫn cho phép IMDSv1. Kỹ sư DevSecOps nên triển khai HAI biện pháp kiểm soát nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **D, E**

Cưỡng chế IMDSv2 toàn diện chống SSRF trên AWS gồm: (1) Phòng ngừa bằng SCP (điều kiện ec2:MetadataHttpTokens=required, hop limit=1) + EC2 Account-level IMDS Defaults cho instance mới, và (2) Phát hiện/khắc phục cho instance cũ bằng AWS Config rule ec2-imdsv2-check + SSM Automation.

- **A:** Sai. Địa chỉ link-local 169.254.169.254 (IMDS) không đi qua lớp lọc của VPC Security Group hay NACL, nên chặn trong Security Group hoàn toàn không có tác dụng (và chặn IMDS hoàn toàn sẽ làm hỏng các agent hợp lệ cần IMDSv2).
- **B:** Sai. Tăng hop limit lên 64 lại MỞ RỘNG bề mặt tấn công (cho phép container/proxy nhiều lớp hop gọi lấy token IMDSv2 của host node). Để chống container đánh cắp quyền node, phải đặt hop limit = 1 và dùng EKS Pod Identity / IRSA.
- **C:** Sai. Lưu static IAM access keys trong file cấu hình OS là anti-pattern bảo mật nghiêm trọng, nguy hiểm hơn nhiều so với dùng IMDSv2.
- **D (Đúng):** Chính xác! SCP chặn ec2:RunInstances nếu không đặt ec2:MetadataHttpTokens=required (và giới hạn hop limit = 1 để container không gọi trộm IMDS của host node khi đã dùng IRSA/Pod Identity) kết hợp EC2 Account-level IMDS Defaults ngăn chặn triệt để việc tạo mới instance bật IMDSv1.
- **E (Đúng):** Chính xác! AWS Config managed rule ec2-imdsv2-check tự động phát hiện mọi EC2 instance đang chạy chưa bắt buộc IMDSv2 (HttpTokens != required) và có thể gắn SSM Automation remediation để tự động nâng cấp sang IMDSv2.

</details>

### Câu 15 `hard`

A DevSecOps team wants to shift security left in their container and serverless CI/CD pipeline. They must ensure that: (1) Container images pushed to Amazon ECR are continuously scanned for OS and programming language CVEs and blocked from production deployment if Critical vulnerabilities exist; and (2) Only cryptographically signed Lambda deployment packages built by the official CI/CD pipeline can be deployed to Production. Which TWO solutions should be implemented? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Enable Amazon Macie automated discovery jobs on Amazon ECR repositories to scan container image layers for OS and language CVEs.
- **B.** Enable Amazon Inspector Enhanced Scanning on ECR and add a CodeBuild/EventBridge gate that blocks promotion on CRITICAL findings.
- **C.** Use AWS Certificate Manager (ACM) private certificates to digitally sign Lambda ZIP packages before uploading them to Amazon S3.
- **D.** Sign Lambda packages with AWS Signer during build and attach a Code Signing Configuration with UntrustedArtifactOnDeployment=Enforce.
- **E.** Enable AWS Shield Advanced and WAF rate-based rules on the CodePipeline endpoint to block vulnerable container deployments.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm DevSecOps muốn đưa bảo mật vào giai đoạn sớm hơn (shift left) trong CI/CD pipeline cho container và serverless của họ. Họ phải đảm bảo rằng: (1) Các container image đẩy lên Amazon ECR được quét liên tục để phát hiện lỗ hổng CVE của OS và ngôn ngữ lập trình, đồng thời bị chặn triển khai lên production nếu tồn tại lỗ hổng mức Critical; và (2) Chỉ các gói triển khai Lambda được ký mật mã bởi CI/CD pipeline chính thức mới có thể được triển khai lên Production. Nên triển khai HAI giải pháp nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Trong Shift-Left DevSecOps trên AWS: Amazon Inspector đảm nhận quét lỗ hổng CVE liên tục cho ECR/EC2/Lambda; AWS Signer + Lambda Code Signing Config (`Enforce`) đảm bảo tính toàn vẹn và nguồn gốc của gói triển khai.

- **A:** Sai. Amazon Macie dùng để phát hiện dữ liệu nhạy cảm PII trong Amazon S3, không quét lỗ hổng CVE trong ECR container image.
- **B (Đúng):** Chính xác! Amazon Inspector (ECR Enhanced Scanning) quét liên tục cả lỗ hổng OS lẫn thư viện ngôn ngữ lập trình (programming language packages) ngay khi push image và khi có CVE mới, cho phép chặn deploy nếu có lỗi Critical.
- **C:** Sai. ACM dùng để cấp phát và quản lý chứng chỉ SSL/TLS cho HTTPS, không dùng để ký số mã nguồn Lambda (nhiệm vụ của AWS Signer).
- **D (Đúng):** Chính xác! AWS Signer kết hợp Lambda Code Signing Configuration ở chế độ Enforce đảm bảo Lambda từ chối triển khai mọi gói code chưa được ký số hợp lệ bởi pipeline chính thức.
- **E:** Sai. AWS Shield Advanced là dịch vụ chống tấn công DDoS, không liên quan đến quét CVE hay ký số phần mềm.

</details>

### Câu 16 `medium`

A compliance auditor requires that AWS CloudTrail audit logs from every account in AWS Organizations be centralized in a dedicated Log Archive account, encrypted with a Customer Managed KMS key, cryptographically verifiable against tampering, and protected so that even the Log Archive account's root user cannot delete or overwrite log files for 7 years. What should the DevOps engineer configure?

- **A.** Create an Organization Trail delivering logs to an S3 bucket with S3 Object Lock in Governance Mode and a bucket policy denying s3:DeleteObject.
- **B.** Enable CloudTrail Insights in each member account and store logs in local CloudWatch Log Groups configured with a 7-year retention policy.
- **C.** Create an Organization Trail to a Log Archive S3 bucket with KMS CMK, Log File Validation, and S3 Object Lock in Compliance Mode (7 years).
- **D.** Deliver CloudTrail logs from each account to Amazon S3 with Server-Side Encryption (SSE-S3) and enable S3 Server Access Logging for auditing.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiểm toán viên tuân thủ yêu cầu rằng nhật ký kiểm toán AWS CloudTrail từ mọi tài khoản trong AWS Organizations phải được tập trung vào một tài khoản Log Archive chuyên dụng, mã hóa bằng Customer Managed KMS key, có thể xác minh bằng mật mã chống giả mạo và được bảo vệ sao cho ngay cả root user của tài khoản Log Archive cũng không thể xóa hoặc ghi đè các tệp log trong 7 năm. Kỹ sư DevOps nên cấu hình gì?

**Đáp án đúng:** **C**

Bộ tứ bất biến cho Audit Logging đạt chuẩn kiểm toán khắt khe: (1) Organization Trail về Log Archive Account, (2) KMS CMK, (3) CloudTrail Log File Validation (chống sửa đổi), và (4) S3 Object Lock Compliance Mode (WORM - ngay cả Root cũng không thể xóa).

- **A:** Sai. Governance Mode vẫn cho phép người dùng có quyền đặc biệt (s3:BypassGovernanceRetention) hoặc Root user xóa file; yêu cầu bắt buộc phải dùng Compliance Mode.
- **B:** Sai. Không tập trung về Log Archive account, và quản trị viên member account vẫn có thể sửa/xóa Log Group nếu không có cơ chế WORM.
- **C (Đúng):** Chính xác! Organization Trail gom log toàn bộ Org; Log File Validation tạo chuỗi hash SHA-256 kiểm chứng chống giả mạo; S3 Object Lock ở chế độ Compliance Mode (WORM) ngăn ngay cả Root User xóa/ghi đè file log trong suốt 7 năm.
- **D:** Sai. Thiếu mã hóa KMS CMK, thiếu Log File Validation và thiếu S3 Object Lock Compliance Mode để chống Root user xóa log.

</details>

### Câu 17 `medium`

A security review reveals that several production IAM roles have overly broad AdministratorAccess permissions. The DevOps team needs an automated way to generate least-privilege IAM policies based on the actual AWS API actions those roles have invoked over the past 90 days, as well as continuously detect any S3 buckets or KMS keys accidentally shared outside the AWS Organization. Which service should they use?

- **A.** Amazon GuardDuty with S3 Protection and Malware Protection enabled across the entire AWS Organization.
- **B.** AWS Trusted Advisor Security Checks combined with AWS Personal Health Dashboard notifications.
- **C.** AWS Secrets Manager with Automatic Rotation enabled via custom AWS Lambda rotation functions.
- **D.** AWS IAM Access Analyzer (Policy Generation from CloudTrail logs and Organization External Access Analyzer).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đợt đánh giá bảo mật phát hiện nhiều IAM role trên production có quyền AdministratorAccess quá rộng. Nhóm DevOps cần một cách tự động để tạo các IAM policy theo nguyên tắc đặc quyền tối thiểu (least-privilege) dựa trên các hành động AWS API thực tế mà các role đó đã gọi trong 90 ngày qua, đồng thời liên tục phát hiện bất kỳ S3 bucket hoặc KMS key nào vô tình bị chia sẻ ra bên ngoài AWS Organization. Họ nên sử dụng dịch vụ nào?

**Đáp án đúng:** **D**

AWS IAM Access Analyzer cung cấp 3 năng lực đắc lực cho DevSecOps: (1) External Access Analysis (phát hiện chia sẻ ngoài Zone of Trust), (2) Unused Access Analysis (tìm quyền thừa), và (3) Policy Generation (sinh Least-Privilege Policy từ CloudTrail).

- **A:** Sai. GuardDuty phát hiện hành vi tấn công/bất thường, không có chức năng tự động sinh Least-Privilege IAM Policy từ lịch sử CloudTrail.
- **B:** Sai. Trusted Advisor chỉ cảnh báo cơ bản ở mức tổng quan, không sinh được fine-grained IAM policy từ 90 ngày CloudTrail.
- **C:** Sai. Secrets Manager quản lý và xoay vòng thông tin đăng nhập (password/API key), không phân tích quyền IAM hay tài nguyên chia sẻ công khai.
- **D (Đúng):** Chính xác! IAM Access Analyzer có tính năng Policy Generation đọc lịch sử CloudTrail (tối đa 90 ngày) để tự động sinh Least-Privilege IAM Policy, đồng thời External Access Analyzer ở cấp Organization liên tục phát hiện S3/KMS/IAM Role bị chia sẻ ra ngoài Zone of Trust.

</details>

---

[Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md)
