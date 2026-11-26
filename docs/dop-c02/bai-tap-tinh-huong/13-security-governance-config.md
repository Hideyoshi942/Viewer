# Bài tập tình huống — Tuân thủ Tự động: AWS Config, Organizations SCP & Control Tower

> AWS Config Rules & Conformance Packs, AWS Organizations SCPs, Control Tower Guardrails, IAM Access Analyzer và CloudTrail Organization Trail.
> **Số câu hỏi:** 8 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A security architect manages an AWS Organizations structure with 50 member accounts. To meet data residency and audit requirements, the architect wants to apply a Service Control Policy (SCP) to the Workloads OU that: (1) prevents ANY user—including member account root users—from stopping AWS CloudTrail or deleting AWS Config recorders, and (2) denies launching resources outside us-east-1 and eu-west-1, WITHOUT breaking global AWS services such as IAM, CloudFront, Route 53, and STS. How should the SCP be structured?

- **A.** Add a Deny statement on Action: '*' with a StringNotEquals condition on aws:RequestedRegion allowing only us-east-1 and eu-west-1.
- **B.** Attach the SCP directly to the AWS Organizations management account so it automatically enforces restrictions on the management account and all member accounts.
- **C.** Use an IAM Permissions Boundary instead of an SCP across all roles so that member account root users are also restricted from non-approved Regions.
- **D.** Deny cloudtrail:StopLogging and config:DeleteConfigurationRecorder, plus Deny with NotAction (global services) and StringNotEquals on aws:RequestedRegion.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiến trúc sư bảo mật quản lý cấu trúc AWS Organizations với 50 tài khoản thành viên. Để đáp ứng các yêu cầu về lưu trú dữ liệu và kiểm toán, kiến trúc sư muốn áp dụng một Service Control Policy (SCP) cho Workloads OU để: (1) ngăn chặn BẤT KỲ người dùng nào—bao gồm cả root user của tài khoản thành viên—dừng AWS CloudTrail hoặc xóa các AWS Config recorder, và (2) từ chối khởi chạy tài nguyên bên ngoài us-east-1 và eu-west-1, MÀ KHÔNG làm hỏng các dịch vụ AWS toàn cầu như IAM, CloudFront, Route 53 và STS. SCP nên được cấu trúc như thế nào?

**Đáp án đúng:** **D**

Mẫu SCP giới hạn Region (Region Restriction SCP) chuẩn của AWS luôn sử dụng `Effect: Deny` + `NotAction` (loại trừ các global services như iam, sts, cloudfront, route53, support...) + `Condition: StringNotEquals aws:RequestedRegion`. Ngoài ra cần nhớ SCP chặn được cả root user của member account nhưng không tác động lên Management Account.

- **A:** Sai. Dùng Action: '*' mà không loại trừ (NotAction) các dịch vụ toàn cầu sẽ làm hỏng IAM, Route 53, CloudFront và các cuộc gọi control plane toàn cầu.
- **B:** Sai. SCP KHÔNG BAO GIỜ có hiệu lực lên chính Management Account, và yêu cầu đề bài chỉ rõ áp dụng cho Workloads OU.
- **C:** Sai. IAM Permissions Boundary không áp dụng cho root user của member account; chỉ có SCP mới giới hạn được root user của member account.
- **D (Đúng):** Chính xác! SCP áp dụng cho mọi principal trong member account kể cả root user. Để chặn chạy tài nguyên ngoài vùng cho phép mà không làm hỏng các dịch vụ toàn cầu (vốn luôn thực thi tại us-east-1 như IAM, CloudFront, Route 53, STS), bắt buộc phải dùng NotAction liệt kê các dịch vụ toàn cầu kết hợp điều kiện StringNotEquals trên aws:RequestedRegion.

</details>

### Câu 2 `hard`

A DevSecOps team wants to shift IAM security left into their CI/CD pipeline. Whenever a developer submits a pull request modifying AWS CloudFormation templates containing IAM policies or S3 bucket policies, an automated check in AWS CodeBuild must statically validate the policies against AWS IAM best practices (detecting overly permissive wildcards or syntax errors) AND mathematically verify that the updated policy does NOT grant any new administrative or external cross-account permissions compared to the baseline policy—before the CloudFormation stack is deployed. Which AWS capability should the team integrate into CodeBuild?

- **A.** Deploy the CloudFormation stack to Production first and wait for Amazon GuardDuty to alert on anomalous IAM role usage.
- **B.** Use AWS CloudTrail Insights inside CodeBuild to analyze historical IAM policy changes and flag overly permissive actions.
- **C.** Integrate IAM Access Analyzer checks (ValidatePolicy, CheckNoNewAccess, CheckAccessNotGranted) in CodeBuild to fail builds on violations.
- **D.** Run aws cloudformation detect-stack-drift inside the CodeBuild pre_build phase before merging the pull request.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm DevSecOps muốn đưa bảo mật IAM vào giai đoạn sớm hơn trong CI/CD pipeline của họ. Mỗi khi nhà phát triển gửi một pull request sửa đổi các AWS CloudFormation template chứa IAM policy hoặc S3 bucket policy, một bước kiểm tra tự động trong AWS CodeBuild phải xác thực tĩnh các policy theo các thực tiễn tốt nhất của AWS IAM (phát hiện các ký tự đại diện quá rộng hoặc lỗi cú pháp) VÀ xác minh bằng toán học rằng policy được cập nhật KHÔNG cấp thêm bất kỳ quyền quản trị hoặc quyền cross-account bên ngoài nào so với policy cơ sở—trước khi CloudFormation stack được triển khai. Nhóm nên tích hợp khả năng AWS nào vào CodeBuild?

**Đáp án đúng:** **C**

AWS IAM Access Analyzer không chỉ phát hiện tài nguyên chia sẻ ra bên ngoài mà còn cung cấp các API `ValidatePolicy`, `CheckNoNewAccess`, và `CheckAccessNotGranted` chuyên biệt cho DevSecOps shift-left ngay trong giai đoạn CI/CD (CodeBuild/GitHub Actions) trước khi hạ tầng được triển khai.

- **A:** Sai. Triển khai lên Production trước rồi mới chờ GuardDuty phát hiện là đi ngược hoàn toàn với nguyên tắc shift-left và yêu cầu chặn trước khi deploy.
- **B:** Sai. CloudTrail Insights phát hiện bất thường khối lượng gọi API trong quá khứ/hiện tại, không kiểm tra tĩnh file IAM policy trong pull request.
- **C (Đúng):** Chính xác! AWS IAM Access Analyzer cung cấp các API kiểm tra chính sách tự động ngay trong CI/CD (ValidatePolicy kiểm tra cú pháp & best practices, CheckNoNewAccess và CheckAccessNotGranted dùng suy luận toán học/automated reasoning để chứng minh policy mới không cấp thêm quyền vượt chuẩn so với baseline trước khi deploy).
- **D:** Sai. Drift detection kiểm tra sự sai lệch của stack đã triển khai, không đánh giá bảo mật của IAM policy mới trong PR.

</details>

### Câu 3 `medium`

A security governance team oversees 50 AWS accounts in AWS Organizations. They need a centralized compliance dashboard in a delegated Security account showing all Amazon EC2 security groups across all accounts and Regions that allow unrestricted SSH (port 22 from 0.0.0.0/0). Furthermore, whenever such a rule is detected in any member account, the unrestricted ingress rule must be automatically revoked within minutes without manual intervention. What is the MOST scalable architecture?

- **A.** Deploy an Organization Config Rule (restricted-ssh) with SSM Automation auto-remediation, and aggregate compliance via AWS Config Aggregator.
- **B.** Create an AWS CloudTrail trail in each of the 50 member accounts and run a daily Amazon Athena query to email account owners on violations.
- **C.** Use Amazon GuardDuty Runtime Monitoring to automatically modify EC2 security group rules whenever unauthorized SSH traffic is detected.
- **D.** Attach an AWS Organizations Service Control Policy (SCP) that denies all ec2:AuthorizeSecurityGroupIngress API calls across all 50 accounts.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm quản trị bảo mật giám sát 50 tài khoản AWS trong AWS Organizations. Họ cần một bảng điều khiển tuân thủ tập trung trong một tài khoản Security được ủy quyền hiển thị tất cả các Amazon EC2 security group trên mọi tài khoản và Region cho phép SSH không giới hạn (port 22 từ 0.0.0.0/0). Hơn nữa, bất cứ khi nào phát hiện quy tắc như vậy ở bất kỳ tài khoản thành viên nào, quy tắc ingress không giới hạn đó phải tự động bị thu hồi trong vài phút mà không cần can thiệp thủ công. Kiến trúc CÓ KHẢ NĂNG MỞ RỘNG NHẤT là gì?

**Đáp án đúng:** **A**

AWS Config Aggregator (cấp Organization) cung cấp góc nhìn tuân thủ đa tài khoản, đa Region tập trung; kết hợp AWS Config Managed Rules (restricted-ssh) và SSM Automation Auto-Remediation để tự động khắc phục cấu hình sai lệch tức thời.

- **A (Đúng):** Chính xác! AWS Config Organization Rules / Conformance Packs triển khai đồng bộ rule restricted-ssh trên toàn tổ chức, kết hợp Auto-Remediation bằng SSM Automation document tự động gỡ rule SSH 0.0.0.0/0 khi phát hiện vi phạm, và AWS Config Aggregator tổng hợp toàn bộ trạng thái tuân thủ về tài khoản Security tập trung.
- **B:** Sai. Quét hàng ngày và gửi email thủ công không đáp ứng yêu cầu tự động khắc phục trong vài phút (within minutes without manual intervention).
- **C:** Sai. GuardDuty là dịch vụ phát hiện mối đe dọa (threat detection), không tự động sửa đổi Security Group và không phải công cụ kiểm tra cấu hình tuân thủ tập trung như AWS Config.
- **D:** Sai. Chặn toàn bộ ec2:AuthorizeSecurityGroupIngress sẽ khiến các team không thể mở bất kỳ port hợp lệ nào (như 443 hoặc nội bộ VPC), làm gián đoạn hoạt động.

</details>

### Câu 4 `hard`

A regulated enterprise must retain AWS API audit logs across all accounts in AWS Organizations for 7 years in an immutable format. Security analysts frequently need to run ad-hoc SQL queries across multi-year audit logs during incident investigations without managing S3 bucket partitions, AWS Glue crawlers, or Athena table schemas. Which AWS CloudTrail feature is BEST suited for this use case?

- **A.** Use CloudTrail Event History in the management account to search and filter API calls across all member accounts for the past 7 years.
- **B.** Create a CloudTrail Lake Organization Event Data Store with 7-year retention and run SQL queries directly in CloudTrail Lake.
- **C.** Stream all CloudTrail organization logs to Amazon CloudWatch Logs with 7-year retention and run CloudWatch Logs Insights queries.
- **D.** Deliver CloudTrail logs to Amazon S3 and use S3 Select API calls to run SQL aggregations across millions of gzipped JSON files.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp được quản lý chặt chẽ phải lưu giữ nhật ký kiểm toán AWS API trên tất cả các tài khoản trong AWS Organizations trong 7 năm ở định dạng bất biến. Các chuyên viên phân tích bảo mật thường xuyên cần chạy các truy vấn SQL ad-hoc trên nhật ký kiểm toán nhiều năm trong quá trình điều tra sự cố mà không cần quản lý phân vùng S3 bucket, AWS Glue crawler hay schema bảng Athena. Tính năng AWS CloudTrail nào PHÙ HỢP NHẤT cho trường hợp sử dụng này?

**Đáp án đúng:** **B**

AWS CloudTrail Lake là kho dữ liệu audit quản lý hoàn toàn (managed immutable data lake), lưu trữ tối ưu lên tới 7–10 năm, tự động thu thập đa tài khoản và cho phép truy vấn SQL trực tiếp mà không cần dựng hạ tầng S3/Glue/Athena.

- **A:** Sai. CloudTrail Event History chỉ lưu trữ 90 ngày gần nhất, chỉ hiển thị management events trong một tài khoản/Region đơn lẻ và không hỗ trợ SQL.
- **B (Đúng):** Chính xác! AWS CloudTrail Lake cung cấp Event Data Store bất biến (immutable), lưu trữ chuẩn hóa sẵn tới 7 năm (hoặc 10 năm với gói mở rộng), hỗ trợ thu thập toàn bộ AWS Organizations và cho phép truy vấn SQL trực tiếp mà không cần quản lý S3 bucket, Glue crawler hay Athena partition.
- **C:** Sai. Lưu trữ 7 năm toàn bộ CloudTrail của cả Organization trên CloudWatch Logs rất đắt đỏ và CloudWatch Logs Insights không dùng chuẩn SQL cũng như không tối ưu cho truy vấn dữ liệu nhiều năm như CloudTrail Lake.
- **D:** Sai. S3 Select chỉ truy vấn từng object đơn lẻ, không thể chạy SQL tổng hợp xuyên suốt hàng triệu file nhiều năm.

</details>

### Câu 5 `hard`

A platform team wants to empower application developers in sandbox and development AWS accounts to create their own IAM roles for AWS Lambda functions and Amazon ECS tasks without waiting on a central security ticket. However, security must strictly prevent developers from creating a role with AdministratorAccess (privilege escalation) or attaching policies that modify AWS CloudTrail or IAM itself. How should the DevOps architect safely delegate IAM role creation?

- **A.** Grant developers AdministratorAccess in development accounts and rely on Amazon GuardDuty alerts if they modify CloudTrail trails.
- **B.** Use an AWS Organizations Service Control Policy (SCP) to deny iam:CreateRole and iam:AttachRolePolicy across all development accounts.
- **C.** Require developers to share a single pre-created IAM role with wildcard (*) permissions across all Lambda functions and ECS tasks.
- **D.** Allow iam:CreateRole ONLY with an iam:PermissionsBoundary condition pointing to an approved boundary ARN, and deny boundary edits.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm nền tảng muốn trao quyền cho các nhà phát triển ứng dụng trong các tài khoản AWS sandbox và development tự tạo các IAM role riêng cho AWS Lambda function và Amazon ECS task mà không cần chờ ticket bảo mật trung tâm. Tuy nhiên, bộ phận bảo mật phải ngăn chặn nghiêm ngặt việc nhà phát triển tạo role có AdministratorAccess (leo thang đặc quyền) hoặc gắn các policy sửa đổi AWS CloudTrail hay chính IAM. Kiến trúc sư DevOps nên ủy quyền tạo IAM role một cách an toàn như thế nào?

**Đáp án đúng:** **D**

IAM Permissions Boundaries kết hợp điều kiện iam:PermissionsBoundary là mẫu thiết kế chuẩn để ủy quyền tạo IAM Role (delegated IAM administration) an toàn mà không lo leo thang đặc quyền (privilege escalation).

- **A:** Sai. Cấp AdministratorAccess cho phép leo thang đặc quyền và xóa/tắt CloudTrail ngay lập tức; GuardDuty chỉ là phát hiện sau sự cố chứ không ngăn chặn chủ động.
- **B:** Sai. Chặn hoàn toàn iam:CreateRole làm mất mục tiêu ủy quyền tự phục vụ cho developer tạo role cho Lambda/ECS.
- **C:** Sai. Dùng chung một role có quyền wildcard (*) vi phạm nghiêm trọng nguyên tắc đặc quyền tối thiểu (least privilege).
- **D (Đúng):** Chính xác! Kết hợp IAM Condition key iam:PermissionsBoundary trên quyền iam:CreateRole và iam:PutRolePermissionsBoundary buộc mọi role do developer tạo ra đều phải gắn sẵn Permissions Boundary giới hạn trần quyền tối đa (không thể vượt qua boundary dù họ có tự gắn AdministratorAccess), ngăn chặn triệt để leo thang đặc quyền.

</details>

### Câu 6 `hard`

A defense contractor deploys containerized workloads to Amazon EKS and serverless functions to AWS Lambda. Security compliance requires cryptographic proof that every container image and Lambda deployment package deployed in production was built by the official CI/CD pipeline and has not been overwritten or tampered with since build time. Additionally, production repositories must reject any attempt to overwrite an existing image tag (such as v1.4.2). Which TWO controls should the DevSecOps engineer implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Enable Image Tag Mutability set to IMMUTABLE on all production Amazon ECR repositories so existing image tags cannot be overwritten.
- **B.** Enable Amazon ECR Lifecycle Policies to automatically expire and delete untagged container images every 24 hours across repositories.
- **C.** Sign artifacts with AWS Signer during build and enforce verification via Lambda Code Signing (Enforce) and Kyverno/Ratify on EKS.
- **D.** Store container image SHA256 digests in a README.md file in Git and require operators to compare hashes visually before deployments.
- **E.** Enable S3 Server-Side Encryption with Amazon S3 managed keys (SSE-S3) on the shared AWS CodePipeline artifact S3 bucket.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà thầu quốc phòng triển khai các workload container lên Amazon EKS và các hàm serverless lên AWS Lambda. Tuân thủ bảo mật yêu cầu bằng chứng mật mã chứng minh rằng mọi container image và gói triển khai Lambda được triển khai trên production đều được build bởi CI/CD pipeline chính thức và chưa bị ghi đè hay giả mạo kể từ lúc build. Ngoài ra, các repository production phải từ chối mọi nỗ lực ghi đè lên một image tag hiện có (như v1.4.2). Kỹ sư DevSecOps nên triển khai HAI biện pháp kiểm soát nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, C**

Bảo vệ tính toàn vẹn chuỗi cung ứng phần mềm (Software Supply Chain Integrity) trên AWS sử dụng ECR Immutable Tags (chống ghi đè tag) kết hợp AWS Signer (ký số mật mã cho Lambda và Container Image) cùng cơ chế cưỡng chế xác thực chữ ký tại thời điểm triển khai.

- **A (Đúng):** Chính xác! Bật Image Tag Immutability (IMMUTABLE) trên ECR đảm bảo một tag phiên bản (ví dụ v1.4.2) đã đẩy lên thì không bao giờ bị ghi đè bởi một image khác.
- **B:** Sai. ECR Lifecycle Policy chỉ dọn dẹp rác lưu trữ, không ngăn ghi đè tag hay xác thực chữ ký mật mã.
- **C (Đúng):** Chính xác! AWS Signer cung cấp chữ ký số mật mã cho cả Lambda deployment package (xác thực gốc qua Lambda Code Signing Configuration ở chế độ Enforce) và container image trên ECR (qua Notation + Kyverno/Ratify admission controller trên EKS), đảm bảo chỉ artifact chính chủ chưa bị sửa đổi mới được chạy trên production.
- **D:** Sai. Đối chiếu thủ công bằng mắt không tạo ra cơ chế cưỡng chế mật mã tự động và dễ bỏ sót.
- **E:** Sai. Mã hóa lưu trữ SSE-S3 chỉ bảo vệ dữ liệu at-rest, không chứng minh được nguồn gốc build hay chống ghi đè tag container.

</details>

### Câu 7 `medium`

An enterprise uses AWS Control Tower to govern its multi-account AWS landing zone. The cloud platform team wants every newly vended AWS account to automatically inherit a standardized VPC, Transit Gateway attachment, and Terraform-managed baseline resources immediately upon account creation—while also enforcing guardrails across OUs that prevent disabling CloudTrail, proactively block non-compliant CloudFormation templates before creation, and detect drift on existing resources. Which AWS Control Tower capabilities should they combine?

- **A.** Create AWS accounts manually via the AWS Organizations console and email a Terraform configuration zip file to each account owner.
- **B.** Enable ONLY Detective Controls in AWS Control Tower so non-compliant CloudFormation stacks are blocked before resource deployment.
- **C.** Use AWS Service Catalog portfolios alone without AWS Organizations SCPs or Control Tower Preventive/Detective controls.
- **D.** Use Control Tower Account Factory for Terraform (AFT) with Preventive (SCPs), Proactive (Hooks), and Detective (Config) controls.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp sử dụng AWS Control Tower để quản trị landing zone AWS đa tài khoản của mình. Nhóm nền tảng đám mây muốn mọi tài khoản AWS mới được cấp phát tự động kế thừa một VPC chuẩn hóa, kết nối Transit Gateway và các tài nguyên cơ sở được quản lý bởi Terraform ngay khi tạo tài khoản—đồng thời thực thi các guardrail trên các OU nhằm ngăn chặn việc tắt CloudTrail, chủ động chặn các CloudFormation template không tuân thủ trước khi tạo và phát hiện sai lệch (drift) trên các tài nguyên hiện có. Họ nên kết hợp các khả năng AWS Control Tower nào?

**Đáp án đúng:** **D**

AWS Control Tower cung cấp Account Factory for Terraform (AFT) cho tùy biến tài khoản tự động bằng Terraform, cùng hệ thống kiểm soát 3 lớp: Preventive (SCP/RCP), Proactive (CloudFormation Hooks) và Detective (AWS Config).

- **A:** Sai. Tạo thủ công và gửi file zip không đảm bảo tự động hóa, nhất quán hay tuân thủ landing zone.
- **B:** Sai. Detective Controls (AWS Config) chỉ phát hiện SAU khi tài nguyên đã tạo, không thể chặn chủ động trước khi tạo (đó là vai trò của Proactive Controls dùng CloudFormation Hooks).
- **C:** Sai. Service Catalog một mình không cung cấp cơ chế account vending đa tài khoản cùng Preventive/Proactive/Detective controls ở cấp OU như Control Tower.
- **D (Đúng):** Chính xác! Account Factory for Terraform (AFT) tích hợp trực tiếp với Control Tower Account Factory để tự động chạy pipeline Terraform cấu hình VPC/TGW/baseline ngay khi tạo tài khoản mới. Bộ 3 Control của Control Tower gồm Preventive (SCP/RCP), Proactive (CloudFormation Hooks) và Detective (AWS Config/Security Hub) đáp ứng đầy đủ các yêu cầu kiểm soát.

</details>

### Câu 8 `hard`

A regulated company operating under AWS Organizations must enforce two strict rules across all 40 member accounts: (1) No IAM principal—including account administrators—may ever disable AWS CloudTrail or launch resources outside us-east-1 and eu-west-1; (2) Any existing or newly created Security Group that allows SSH (port 22) from 0.0.0.0/0 must be automatically revoked within minutes. Which combination of services satisfies BOTH requirements?

- **A.** Use AWS Config Rules to prevent users from launching resources in unauthorized Regions and IAM Permission Boundaries to revoke Security Group rules.
- **B.** Enable Amazon GuardDuty in all member accounts to block CloudTrail API modifications and automatically edit public Security Group ingress rules.
- **C.** Use AWS WAF web ACLs with managed IP reputation rules across all member accounts to block unauthorized AWS Regions and public SSH traffic.
- **D.** Attach Organizations SCPs to protect CloudTrail and restrict Regions, and deploy the AWS Config restricted-ssh rule with SSM Automation remediation.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty hoạt động trong lĩnh vực được quản lý chặt chẽ sử dụng AWS Organizations phải thực thi hai quy tắc nghiêm ngặt trên tất cả 40 tài khoản thành viên: (1) Không một IAM principal nào—kể cả quản trị viên tài khoản—được phép tắt AWS CloudTrail hoặc khởi chạy tài nguyên bên ngoài us-east-1 và eu-west-1; (2) Bất kỳ Security Group hiện có hoặc mới tạo nào cho phép SSH (port 22) từ 0.0.0.0/0 phải tự động bị thu hồi trong vòng vài phút. Sự kết hợp dịch vụ nào đáp ứng CẢ HAI yêu cầu?

**Đáp án đúng:** **D**

Nguyên tắc cốt lõi của DevSecOps đa tài khoản: Dùng SCP (Preventive) để ngăn chặn tuyệt đối hành vi bị cấm; dùng AWS Config Rules + SSM Automation (Detective + Auto-Remediation) để phát hiện và tự động khắc phục cấu hình sai lệch.

- **A:** Sai. AWS Config là Detective (phát hiện sau khi tạo), không ngăn chặn (prevent) trước khi tạo; IAM Permission Boundaries cũng không tự động sửa Security Group đã tồn tại.
- **B:** Sai. GuardDuty là dịch vụ phát hiện mối đe dọa (threat detection), không chặn hành động API và không tự động sửa Security Group.
- **C:** Sai. AWS WAF hoạt động ở Layer 7 (HTTP/HTTPS) cho CloudFront/ALB/API Gateway, không kiểm soát API Region hay cổng SSH Layer 4 trên Security Group.
- **D (Đúng):** Chính xác! SCP là Preventive Guardrail chặn tuyệt đối (kể cả Admin của Member Account) không cho tắt CloudTrail hoặc tạo tài nguyên sai Region; AWS Config Rule (restricted-ssh) + SSM Automation là Detective & Responsive Control tự động phát hiện và gỡ rule 0.0.0.0/0 port 22.

</details>

---

[Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md)
