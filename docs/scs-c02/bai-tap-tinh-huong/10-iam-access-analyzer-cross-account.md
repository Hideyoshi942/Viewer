# Bài tập tình huống — IAM Access Analyzer, Cross-Account Access & S3 Access Grants

> IAM Access Analyzer (External/Unused Access & Policy Validation), Cross-Account IAM Roles, S3 Bucket Policies, VPC Endpoint Policies và S3 Access Grants.
> **Số câu hỏi:** 12 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A developer assumes an IAM role in a member account of an AWS Organization. The following policies apply to the session:
- Organization SCP: Allows all S3 and EC2 actions, explicitly denies s3:DeleteBucket.
- IAM Role Permissions Boundary: Allows s3:GetObject, s3:PutObject, and s3:DeleteObject on arn:aws:s3:::app-data-bucket/*.
- IAM Role Identity-Based Policy: Allows s3:* on arn:aws:s3:::app-data-bucket/*.
- STS AssumeRole Session Policy: Allows s3:GetObject and s3:PutObject on arn:aws:s3:::app-data-bucket/*.
- S3 Bucket Policy (same account): Allows the IAM role s3:GetObject, s3:PutObject, and s3:DeleteObject.
Which S3 actions can the developer successfully perform on objects in arn:aws:s3:::app-data-bucket/*?

- **A.** s3:GetObject, s3:PutObject, and s3:DeleteObject because the S3 bucket policy explicitly grants all three actions in the same account.
- **B.** Only s3:GetObject and s3:PutObject.
- **C.** All s3:* actions except s3:DeleteBucket because the SCP only denies s3:DeleteBucket.
- **D.** No S3 actions because the SCP explicitly denies s3:DeleteBucket, which invalidates the wildcard s3:* statement.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà phát triển assume một IAM role trong một tài khoản thành viên của một AWS Organization. Các policy sau đây áp dụng cho phiên làm việc:
> - Organization SCP: Cho phép tất cả hành động S3 và EC2, từ chối rõ ràng s3:DeleteBucket.
> - IAM Role Permissions Boundary: Cho phép s3:GetObject, s3:PutObject và s3:DeleteObject trên arn:aws:s3:::app-data-bucket/*.
> - IAM Role Identity-Based Policy: Cho phép s3:* trên arn:aws:s3:::app-data-bucket/*.
> - STS AssumeRole Session Policy: Cho phép s3:GetObject và s3:PutObject trên arn:aws:s3:::app-data-bucket/*.
> - S3 Bucket Policy (cùng tài khoản): Cho phép IAM role thực hiện s3:GetObject, s3:PutObject và s3:DeleteObject.
> Nhà phát triển có thể thực hiện thành công những hành động S3 nào đối với các đối tượng trong arn:aws:s3:::app-data-bucket/*?

**Đáp án đúng:** **B**

Quy tắc vàng của IAM Policy Evaluation Logic (cùng tài khoản, có SCP + Permissions Boundary + Session Policy): (1) Bất kỳ Explicit Deny ở bất kỳ lớp nào đều thắng tuyệt đối, (2) Phải được Allow ở TẤT CẢ các lớp giới hạn áp dụng: `SCP ∩ Permissions Boundary ∩ Session Policy ∩ Identity-Based Policy`. Ở đây Session Policy chỉ cho phép `s3:GetObject` và `s3:PutObject`, nên đó là 2 hành động duy nhất được phép.

- **A:** Sai! Mặc dù trong cùng tài khoản Resource-based policy có thể cấp quyền thay cho Identity-based policy, nhưng khi có Session Policy hoặc Permissions Boundary, hành động vẫn bị giới hạn bởi giao điểm (intersection) của Session Policy và SCP.
- **B (Đúng):** Chính xác! Trong IAM Policy Evaluation Logic, quyền thực tế của một phiên có Session Policy là phần GIAO (intersection) của SCP, Permissions Boundary, Identity-Based Policy và Session Policy (trừ trường hợp resource policy trong cùng tài khoản không miễn trừ cho Session Policy đối với quyền không nằm trong Session Policy khi gọi bằng assumed role). Vì Session Policy chỉ cho phép s3:GetObject và s3:PutObject, nên s3:DeleteObject bị Implicit Deny.
- **C:** Permissions Boundary và Session Policy đều thu hẹp phạm vi quyền tối đa của IAM Role; không thể thực hiện mọi hành động s3:*.
- **D:** Explicit Deny cho s3:DeleteBucket chỉ chặn đúng hành động s3:DeleteBucket, không làm vô hiệu hóa các hành động khác như s3:GetObject hay s3:PutObject.

</details>

### Câu 2 `hard`

A security architect is implementing a data perimeter for a sensitive Amazon S3 bucket in a centralized Data Lake account. The bucket must be accessible ONLY by IAM principals belonging to the company's AWS Organization (o-abc1234567), while still allowing AWS services (such as CloudTrail and Amazon Athena) to operate on behalf of those principals. Which S3 bucket policy condition should the architect add to an Explicit Deny statement?

- **A.** Deny all actions where StringNotEquals aws:PrincipalOrgID is o-abc1234567 AND Bool aws:PrincipalIsAWSService is false.
- **B.** Deny all actions where StringNotEquals aws:ResourceOrgID is o-abc1234567 for all S3 bucket requests.
- **C.** Allow all actions where StringEquals aws:PrincipalOrgID is o-abc1234567 and remove all other statements.
- **D.** Deny all actions where StringNotEquals aws:SourceAccount is the Data Lake account ID across the bucket.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiến trúc sư bảo mật đang triển khai vành đai dữ liệu (data perimeter) cho một Amazon S3 bucket nhạy cảm trong tài khoản Data Lake tập trung. Bucket này CHỈ được phép truy cập bởi các IAM principal thuộc AWS Organization của công ty (o-abc1234567), trong khi vẫn cho phép các dịch vụ AWS (như CloudTrail và Amazon Athena) hoạt động thay mặt cho các principal đó. Kiến trúc sư nên thêm điều kiện S3 bucket policy nào vào câu lệnh Explicit Deny?

**Đáp án đúng:** **A**

Trong thiết kế AWS Data Perimeter trên Resource-based Policy (như S3 Bucket Policy), để đảm bảo chỉ danh tính thuộc Organization mới truy cập được mà không làm hỏng tích hợp AWS Services, ta dùng `Deny` kết hợp `StringNotEqualsIfExists: { "aws:PrincipalOrgID": "o-..." }` và `Bool: { "aws:PrincipalIsAWSService": "false" }`.

- **A (Đúng):** Chính xác! Đây là mẫu Data Perimeter chuẩn của AWS: dùng Explicit Deny khi aws:PrincipalOrgID khác ID của Organization, kết hợp điều kiện Bool aws:PrincipalIsAWSService = false (hoặc kiểm tra aws:ViaAWSService) để không vô tình chặn các AWS service principals hợp lệ khi truy cập thay mặt người dùng.
- **B:** aws:ResourceOrgID kiểm tra tổ chức sở hữu TÀI NGUYÊN (chính là bucket này), không kiểm tra danh tính người gọi (principal). Phải dùng aws:PrincipalOrgID trong resource-based policy.
- **C:** Chỉ dùng Allow với aws:PrincipalOrgID không ngăn được việc cấp quyền nhầm từ các statement khác và có thể mở rộng quyền quá mức cho mọi tài khoản trong Organization nếu không kết hợp điều kiện phù hợp; Data Perimeter chuẩn luôn dùng Explicit Deny làm rào chắn bảo vệ.
- **D:** aws:SourceAccount chỉ tồn tại khi một AWS service gọi thay mặt tài khoản, không có mặt trong các lời gọi trực tiếp từ IAM user/role của các tài khoản thành viên khác trong Organization.

</details>

### Câu 3 `hard`

A security engineer configures an Amazon S3 bucket policy to allow the AWS CloudTrail service principal (cloudtrail.amazonaws.com) to write log files into a centralized Log Archive bucket. During a security review, an auditor flags a potential cross-service Confused Deputy vulnerability because another AWS customer could configure their trail to write logs to this bucket if they guessed the bucket name. How should the engineer remediate this risk?

- **A.** Add an sts:ExternalId condition key to the S3 bucket policy statement for cloudtrail.amazonaws.com.
- **B.** Replace the Principal cloudtrail.amazonaws.com with aws:PrincipalOrgID in the S3 bucket policy.
- **C.** Add aws:SourceArn and aws:SourceAccount conditions to the cloudtrail.amazonaws.com statement for your trail.
- **D.** Enable S3 Block Public Access on the centralized Log Archive Amazon S3 bucket.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư bảo mật cấu hình một Amazon S3 bucket policy để cho phép service principal của AWS CloudTrail (cloudtrail.amazonaws.com) ghi các tệp nhật ký vào một Log Archive bucket tập trung. Trong một đợt đánh giá bảo mật, một kiểm toán viên cảnh báo về lỗ hổng Confused Deputy giữa các dịch vụ (cross-service Confused Deputy) tiềm ẩn vì một khách hàng AWS khác có thể cấu hình trail của họ ghi nhật ký vào bucket này nếu họ đoán được tên bucket. Kỹ sư nên khắc phục rủi ro này như thế nào?

**Đáp án đúng:** **C**

Phân biệt 2 kỹ thuật chống **Confused Deputy** trong SCS-C02: (1) **Cross-service Confused Deputy** (khi cấp quyền cho AWS Service Principal như CloudTrail, Config, S3, SNS) → dùng `aws:SourceArn` và `aws:SourceAccount` (hoặc `aws:SourceOrgID`), (2) **Cross-account third-party Confused Deputy** (khi bên thứ ba gọi `sts:AssumeRole`) → dùng `sts:ExternalId`.

- **A:** sts:ExternalId dùng cho cross-account IAM Role Trust Policy với bên thứ ba (third-party SaaS) gọi sts:AssumeRole, không dùng cho AWS service principal trong S3 bucket policy.
- **B:** Service principal cloudtrail.amazonaws.com không thuộc AWS Organization của khách hàng nên không có aws:PrincipalOrgID; làm vậy sẽ chặn luôn việc ghi log hợp lệ.
- **C (Đúng):** Chính xác! Để chống tấn công Cross-Service Confused Deputy khi cấp quyền cho một AWS service principal (như cloudtrail.amazonaws.com), bắt buộc phải giới hạn bằng condition key aws:SourceArn (ARN cụ thể của trail) và/hoặc aws:SourceAccount (ID tài khoản sở hữu trail).
- **D:** S3 Block Public Access ngăn truy cập công khai (anonymous/public), nhưng không ngăn được tấn công Confused Deputy thông qua service principal cloudtrail.amazonaws.com.

</details>

### Câu 4 `hard`

A security team wants to enforce least-privilege IAM practices across an AWS Organization by (1) continuously identifying unused IAM roles, unused access keys, and unused service permissions across all member accounts, and (2) automatically blocking CI/CD deployments if a newly authored IAM policy grants overly permissive administrative privileges or violates security best practices. Which TWO AWS IAM Access Analyzer capabilities should the team use? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Create an IAM Access Analyzer external access analyzer to automatically detect unused IAM user passwords and access keys.
- **B.** Use AWS IAM Credential Report to block CI/CD pipelines from deploying overly permissive JSON policies.
- **C.** Create an IAM Access Analyzer unused access analyzer at the Organization level from a delegated admin account.
- **D.** Enable Amazon Macie to analyze IAM policies for unused permissions across all member accounts in the Organization.
- **E.** Integrate ValidatePolicy and custom policy checks (CheckNoNewAccess / CheckAccessNotGranted) into the CI/CD pipeline.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm bảo mật muốn thực thi các thực tiễn IAM đặc quyền tối thiểu trên toàn bộ AWS Organization bằng cách (1) liên tục xác định các IAM role không sử dụng, access key không sử dụng và quyền dịch vụ không sử dụng trên tất cả tài khoản thành viên, và (2) tự động chặn các lần triển khai CI/CD nếu một IAM policy mới soạn thảo cấp đặc quyền quản trị quá rộng hoặc vi phạm các thực tiễn tốt nhất về bảo mật. Nhóm nên sử dụng HAI khả năng nào của AWS IAM Access Analyzer? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

IAM Access Analyzer hiện có 4 nhóm tính năng lớn thường xuất hiện trong SCS-C02: (1) External Access Analyzer, (2) Unused Access Analyzer (tìm role/key/permission thừa), (3) Policy Generation (sinh least-privilege policy từ CloudTrail), và (4) Policy Validation + Custom Policy Checks (`CheckAccessNotGranted`, `CheckNoNewAccess`) cho CI/CD.

- **A:** External Access Analyzer chỉ phát hiện các tài nguyên (S3, KMS, IAM Role, SQS...) được chia sẻ ra bên ngoài vùng tin cậy (zone of trust), không phát hiện unused access keys hay unused permissions.
- **B:** IAM Credential Report là file CSV báo cáo trạng thái mật khẩu/MFA/access key của IAM users hiện tại, không có khả năng kiểm duyệt nội dung IAM policy JSON trong CI/CD.
- **C (Đúng):** Chính xác! IAM Access Analyzer Unused Access Analyzer (thiết lập ở cấp Organization) liên tục quét và tạo findings cho các IAM role không sử dụng, access key/mật khẩu không sử dụng và các service/action permissions không được sử dụng trong khoảng thời gian theo dõi.
- **D:** Amazon Macie dùng để phát hiện dữ liệu nhạy cảm (PII/PHI) trong S3, không phân tích quyền IAM.
- **E (Đúng):** Chính xác! IAM Access Analyzer cung cấp API ValidatePolicy (kiểm tra lỗi cú pháp và hơn 100 security warnings) và Custom Policy Checks (CheckNoNewAccess, CheckAccessNotGranted, CheckNoPublicAccess) dùng lý thuyết toán học Automated Reasoning để chặn policy quá rộng ngay trong CI/CD trước khi deploy.

</details>

### Câu 5 `hard`

An IAM role named AppRole in Account A needs to read objects from an Amazon S3 bucket named corp-shared-data in Account B. The bucket policy in Account B explicitly grants s3:GetObject to arn:aws:iam::ACCOUNT_A:role/AppRole, and there are no SCPs, Permissions Boundaries, or Explicit Denies in either account. However, when AppRole attempts to call s3:GetObject on the bucket, it receives an AccessDenied error. What is the MOST likely cause?

- **A.** S3 bucket policies cannot grant access to IAM roles in another AWS account; AppRole must first call sts:AssumeRole into Account B.
- **B.** S3 Block Public Access is enabled on corp-shared-data, which blocks all cross-account bucket policy statements.
- **C.** AppRole in Account A must be attached to an AWS Organizations Delegated Administrator policy before accessing Account B.
- **D.** The IAM identity-based policy attached to AppRole in Account A does not explicitly allow s3:GetObject on arn:aws:s3:::corp-shared-data/*.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một IAM role tên là AppRole trong Tài khoản A cần đọc các đối tượng từ một Amazon S3 bucket tên là corp-shared-data trong Tài khoản B. Bucket policy trong Tài khoản B cấp quyền rõ ràng s3:GetObject cho arn:aws:iam::ACCOUNT_A:role/AppRole, và không có SCP, Permissions Boundary hay Explicit Deny nào trong cả hai tài khoản. Tuy nhiên, khi AppRole cố gắng gọi s3:GetObject trên bucket đó, nó nhận được lỗi AccessDenied. Nguyên nhân CÓ KHẢ NĂNG NHẤT là gì?

**Đáp án đúng:** **D**

Quy tắc phân biệt **Same-Account** vs **Cross-Account** trong IAM Policy Evaluation Logic cực kỳ hay bị bẫy trong SCS-C02: Trong **Same-Account**, chỉ cần Identity-based Policy **HOẶC** Resource-based Policy có `Allow` là đủ (miễn không có Deny). Trong **Cross-Account**, BẮT BUỘC phải có `Allow` ở **CẢ HAI** (Identity-based Policy ở tài khoản nguồn **VÀ** Resource-based Policy ở tài khoản đích).

- **A:** S3 bucket policy hoàn toàn hỗ trợ cấp quyền trực tiếp cho IAM role/user của tài khoản khác mà không bắt buộc phải AssumeRole, miễn là cả hai phía đều có Allow.
- **B:** S3 Block Public Access chỉ chặn các policy cấp quyền công khai (như Principal: '*'), không chặn việc cấp quyền cross-account cho một IAM Role ARN cụ thể.
- **C:** Delegated Administrator là tính năng quản trị dịch vụ AWS Organizations, hoàn toàn không liên quan đến quyền đọc S3 cross-account.
- **D (Đúng):** Chính xác! Đối với truy cập CROSS-ACCOUNT (giữa hai tài khoản AWS khác nhau), yêu cầu BẮT BUỘC phải được Allow ở CẢ HAI phía: (1) Identity-based policy của AppRole trong Account A VÀ (2) Resource-based policy (S3 Bucket Policy) trong Account B. (Khác với truy cập trong cùng 1 tài khoản chỉ cần 1 trong 2 phía Allow).

</details>

### Câu 6 `hard`

A company integrates a third-party Cloud Security Posture Management (CSPM) SaaS vendor that monitors AWS accounts by assuming a read-only IAM role in each customer's AWS account. To prevent a malicious customer of the same SaaS vendor from tricking the vendor into assuming this company's IAM role (the cross-account Confused Deputy problem), how should the security engineer configure the IAM role's trust policy?

- **A.** Include a Condition requiring StringEquals on sts:ExternalId with a unique, unguessable value generated by the SaaS vendor.
- **B.** Include a Condition in the IAM role trust policy requiring aws:SourceArn to match the SaaS vendor's AWS account ID.
- **C.** Include a Condition requiring aws:MultiFactorAuthPresent to be true for the SaaS vendor's automated backend service.
- **D.** Attach an inline Permissions Boundary to the SaaS vendor's IAM role inside the vendor's AWS account.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty tích hợp với một nhà cung cấp SaaS Cloud Security Posture Management (CSPM) bên thứ ba để giám sát các tài khoản AWS bằng cách assume một IAM role chỉ đọc trong mỗi tài khoản AWS của khách hàng. Để ngăn một khách hàng độc hại của cùng nhà cung cấp SaaS đó đánh lừa nhà cung cấp assume IAM role của công ty này (vấn đề Confused Deputy cross-account), kỹ sư bảo mật nên cấu hình trust policy của IAM role như thế nào?

**Đáp án đúng:** **A**

Khi cấp quyền `sts:AssumeRole` cho một bên thứ ba (third-party SaaS vendor), luôn sử dụng **`sts:ExternalId`** trong Trust Policy (và giá trị `ExternalId` phải do **bên thứ ba sinh ra** cho riêng bạn, không để khách hàng tự chọn chuỗi dễ đoán).

- **A (Đúng):** Chính xác! Để phòng chống tấn công Confused Deputy với đối tác SaaS bên thứ ba (third-party cross-account AssumeRole), AWS khuyến nghị bắt buộc sử dụng condition key sts:ExternalId với giá trị duy nhất do bên thứ ba (vendor) cấp và không thể đoán trước.
- **B:** aws:SourceArn dùng để chống Cross-Service Confused Deputy cho AWS Service Principal (như cloudtrail.amazonaws.com), không áp dụng cho lời gọi sts:AssumeRole từ IAM principal của bên thứ ba.
- **C:** Hệ thống tự động hóa (automated backend) của SaaS vendor sử dụng IAM role để gọi sts:AssumeRole, không có thao tác nhập mã MFA thủ công từ con người nên đặt điều kiện này sẽ làm hỏng tích hợp.
- **D:** Khách hàng không có quyền quản trị tài khoản AWS của nhà cung cấp SaaS để gắn Permissions Boundary lên role của họ.

</details>

### Câu 7 `hard`

A security architect must establish a network and resource data perimeter for private EC2 workloads accessing Amazon S3 through a Gateway VPC Endpoint:
1) Compromised EC2 instances in the VPC must be prevented from exfiltrating data to any S3 bucket owned by an external AWS account outside the company's AWS Organization (o-xyz9876543).
2) The company's confidential S3 bucket must ONLY accept requests originating from that specific Gateway VPC Endpoint (vpce-0123456789abcdef0).
Which TWO policies should the architect implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Attach a VPC Endpoint Policy to vpce-0123456789abcdef0 allowing S3 actions ONLY when aws:ResourceOrgID equals o-xyz9876543.
- **B.** Attach a VPC Endpoint Policy to vpce-0123456789abcdef0 using aws:PrincipalOrgID instead of aws:ResourceOrgID to block external S3 buckets.
- **C.** Add an S3 Bucket Policy using aws:SourceIp set to the private CIDR range 10.0.0.0/16 of the VPC.
- **D.** Attach an S3 Bucket Policy with Explicit Deny where StringNotEquals aws:SourceVpce is vpce-0123456789abcdef0.
- **E.** Configure a Security Group on the Gateway VPC Endpoint to filter S3 bucket names.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiến trúc sư bảo mật phải thiết lập vành đai dữ liệu mạng và tài nguyên cho các workload EC2 riêng tư truy cập Amazon S3 thông qua một Gateway VPC Endpoint:
> 1) Các EC2 instance bị xâm phạm trong VPC phải bị ngăn chặn trích xuất dữ liệu sang bất kỳ S3 bucket nào thuộc sở hữu của một tài khoản AWS bên ngoài nằm ngoài AWS Organization của công ty (o-xyz9876543).
> 2) S3 bucket bảo mật của công ty CHỈ được chấp nhận các request bắt nguồn từ Gateway VPC Endpoint cụ thể đó (vpce-0123456789abcdef0).
> Kiến trúc sư nên triển khai HAI policy nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, D**

Nhớ chính xác 3 condition key kinh điển của **VPC Endpoint Data Perimeter**: (1) `aws:ResourceOrgID` trong VPC Endpoint Policy để chặn exfiltration sang bucket ngoài Organization, (2) `aws:SourceVpce` / `aws:SourceVpc` trong S3 Bucket Policy để khóa bucket chỉ cho truy cập từ VPC/VPCe nội bộ, và (3) KHÔNG dùng `aws:SourceIp` với private IP cho lưu lượng qua VPC Endpoint.

- **A (Đúng):** Chính xác! VPC Endpoint Policy với điều kiện aws:ResourceOrgID = o-xyz9876543 ngăn chặn EC2 trong VPC ghi dữ liệu sang các S3 bucket thuộc tài khoản ngoài Organization (chống data exfiltration qua VPC Endpoint).
- **B:** aws:PrincipalOrgID chỉ kiểm tra danh tính người gọi (EC2 trong VPC đã thuộc Organization sẵn rồi), KHÔNG chặn được việc gọi sang S3 bucket thuộc tài khoản bên ngoài! Phải dùng aws:ResourceOrgID để kiểm tra tổ chức sở hữu S3 bucket đích.
- **C:** AWS KHÔNG hỗ trợ sử dụng aws:SourceIp với dải IP private (RFC 1918) để kiểm soát truy cập qua VPC Endpoint trong S3 Bucket Policy; bắt buộc phải dùng aws:SourceVpc hoặc aws:SourceVpce.
- **D (Đúng):** Chính xác! S3 Bucket Policy sử dụng Explicit Deny với condition StringNotEquals aws:SourceVpce = vpce-0123456789abcdef0 đảm bảo chỉ các request đi qua đúng VPC Endpoint đó mới được truy cập bucket (ngăn truy cập từ internet hay VPC khác, kể cả khi bị lộ IAM credentials).
- **E:** Gateway VPC Endpoint (cho S3/DynamoDB) không sử dụng Security Group (chỉ Interface VPC Endpoint mới dùng Security Group), và Security Group cũng không thể lọc theo tên S3 bucket.

</details>

### Câu 8 `hard`

A CISO wants a centralized dashboard across all 90 accounts in AWS Organizations that continuously identifies unused IAM roles, unused IAM user passwords and access keys older than 90 days, and overly permissive policies containing services or actions that an IAM role has never invoked—so engineering teams can right-size permissions to least privilege. Which AWS feature provides this organization-wide continuous analysis?

- **A.** Create an organization-level Unused Access Analyzer in AWS IAM Access Analyzer from the delegated administrator account.
- **B.** Create an External Access Analyzer in AWS IAM Access Analyzer to detect unused IAM roles.
- **C.** Enable AWS IAM Policy Simulator across all 90 accounts via AWS Organizations.
- **D.** Run the IAM Credential Report in the management account to inspect unused permissions in all 90 member accounts.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một CISO muốn có một bảng điều khiển tập trung trên tất cả 90 tài khoản trong AWS Organizations để liên tục xác định các IAM role không sử dụng, mật khẩu và access key của IAM user không sử dụng quá 90 ngày, và các policy quá rộng chứa các dịch vụ hoặc hành động mà một IAM role chưa từng gọi—để các nhóm kỹ thuật có thể điều chỉnh quyền về mức đặc quyền tối thiểu. Tính năng AWS nào cung cấp khả năng phân tích liên tục trên toàn tổ chức này?

**Đáp án đúng:** **A**

Phân biệt 2 loại analyzer của **IAM Access Analyzer**: **External Access Analyzer** phát hiện tài nguyên bị chia sẻ ra ngoài zone of trust (dùng automated reasoning trên resource policies); **Unused Access Analyzer** liên tục phát hiện unused roles, unused access keys/passwords và **unused permissions** trên toàn Organization để thực thi least privilege.

- **A (Đúng):** Chính xác! **IAM Access Analyzer Unused Access Analyzer** (có thể tạo ở cấp AWS Organization từ delegated administrator) liên tục quét toàn bộ tài khoản để phát hiện IAM roles không sử dụng, access keys/passwords không sử dụng vượt quá ngưỡng (ví dụ 90 ngày) và cả các quyền (services/actions) đã cấp nhưng không bao giờ được sử dụng để tinh gọn về least privilege.
- **B:** External Access Analyzer chỉ phân tích resource-based policies để phát hiện tài nguyên đang bị chia sẻ ra bên ngoài zone of trust (tài khoản/Organization khác), không phát hiện unused IAM roles hay unused permissions.
- **C:** IAM Policy Simulator là công cụ kiểm thử thủ công xem một policy có cho phép/từ chối một API call cụ thể hay không, không phân tích lịch sử sử dụng thực tế trên toàn Organization.
- **D:** IAM Credential Report chỉ báo cáo trạng thái mật khẩu/access key/MFA của IAM users trong một tài khoản đơn lẻ, không báo cáo unused IAM roles hay unused service/action permissions trên toàn Organization.

</details>

### Câu 9 `hard`

A company grants a third-party SaaS cost-optimization vendor read-only access to its AWS account via a cross-account IAM role, and also configures Amazon S3 to publish event notifications to an Amazon SNS topic. The security architect must prevent the confused deputy problem in BOTH scenarios. Which TWO controls should the architect implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Require a unique, vendor-provided sts:ExternalId condition in the cross-account IAM role's trust policy.
- **B.** Allow the company to choose a simple, easy-to-remember ExternalId such as the company's public name.
- **C.** Remove the Principal element from the SNS topic policy so only internal services can publish to it.
- **D.** Restrict the SNS topic policy for s3.amazonaws.com using aws:SourceArn and aws:SourceAccount conditions.
- **E.** Use aws:PrincipalOrgID on the third-party SaaS vendor's IAM role trust policy to restrict access to the company's own Organization.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty cấp cho nhà cung cấp SaaS tối ưu hóa chi phí bên thứ ba quyền truy cập chỉ đọc vào tài khoản AWS của mình thông qua cross-account IAM role, đồng thời cấu hình Amazon S3 để xuất bản thông báo sự kiện tới một Amazon SNS topic. Kiến trúc sư bảo mật phải ngăn chặn vấn đề confused deputy trong CẢ HAI kịch bản. Kiến trúc sư nên triển khai HAI biện pháp kiểm soát nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, D**

Phòng chống **Confused Deputy** trong 2 tình huống chuẩn SCS-C02: (1) **Third-party cross-account IAM role** → dùng **`sts:ExternalId`** (do vendor sinh ngẫu nhiên); (2) **AWS Service Principal** gọi tới tài nguyên (S3 → SNS/SQS/Lambda, CloudFront → S3/KMS) → dùng **`aws:SourceArn`** và **`aws:SourceAccount`**.

- **A (Đúng):** Chính xác! Khi cấp quyền cho bên thứ ba (SaaS vendor) assume cross-account IAM role, điều kiện `sts:ExternalId` (mã định danh duy nhất do vendor sinh ra cho khách hàng) trong Trust Policy ngăn chặn một khách hàng khác của cùng vendor lừa vendor truy cập vào tài khoản AWS của bạn (cross-account confused deputy).
- **B:** ExternalId phải là giá trị ngẫu nhiên, duy nhất do bên thứ ba (vendor) tạo ra và kiểm soát, tuyệt đối không để khách hàng tự chọn chuỗi dễ đoán như tên công ty.
- **C:** Resource-based policy bắt buộc phải có phần tử `Principal`; hơn nữa bỏ Principal là cú pháp JSON không hợp lệ.
- **D (Đúng):** Chính xác! Khi cấp quyền cho một AWS service principal (như `s3.amazonaws.com`) truy cập tài nguyên (như SNS topic), luôn phải bổ sung điều kiện `aws:SourceArn` và/hoặc `aws:SourceAccount` để chống **cross-service confused deputy**.
- **E:** Tài khoản AWS của bên thứ ba (SaaS vendor) nằm NGOÀI AWS Organization của công ty, nên đặt `aws:PrincipalOrgID` bằng Organization của công ty sẽ chặn luôn vendor hợp lệ.

</details>

### Câu 10 `hard`

A DevSecOps team wants to add an automated security gate in their CI/CD pipeline before deploying Terraform or CloudFormation templates. Specifically, whenever a developer modifies an IAM policy JSON, the pipeline must automatically verify—using mathematical automated reasoning rather than simple regex matching—that the updated policy does NOT grant critical actions such as iam:CreateAccessKey or s3:DeleteBucket and does NOT expand permissions beyond an approved reference baseline policy. Which AWS IAM Access Analyzer API capability should the pipeline invoke?

- **A.** Call IAM Access Analyzer ValidatePolicy, which enforces custom organizational reference baseline policies automatically.
- **B.** Deploy the IAM policy to production first and wait for Amazon GuardDuty to alert if the policy is overly permissive.
- **C.** Use IAM Access Analyzer GeneratePolicy to block pull requests that contain wildcard characters in IAM statements.
- **D.** Call IAM Access Analyzer Custom Policy Checks (CheckAccessNotGranted and CheckNoNewAccess) in the CI/CD pipeline.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm DevSecOps muốn thêm một cổng bảo mật tự động trong CI/CD pipeline của họ trước khi triển khai các Terraform hoặc CloudFormation template. Cụ thể, mỗi khi nhà phát triển sửa đổi một tệp JSON IAM policy, pipeline phải tự động xác minh—bằng lập luận toán học tự động thay vì khớp regex đơn giản—rằng policy được cập nhật KHÔNG cấp các hành động quan trọng như iam:CreateAccessKey hoặc s3:DeleteBucket và KHÔNG mở rộng quyền vượt quá một policy cơ sở tham chiếu đã được phê duyệt. Pipeline nên gọi khả năng AWS IAM Access Analyzer API nào?

**Đáp án đúng:** **D**

**IAM Access Analyzer Custom Policy Checks** hỗ trợ shift-left security trong CI/CD bằng automated reasoning với 3 API chính: **`CheckAccessNotGranted`** (đảm bảo không cấp action/resource bị cấm), **`CheckNoNewAccess`** (đảm bảo không nới rộng quyền so với policy chuẩn), và **`CheckNoPublicAccess`** (đảm bảo resource policy không mở public).

- **A:** `ValidatePolicy` chỉ kiểm tra cú pháp JSON và các khuyến nghị chung của AWS (errors/security warnings), KHÔNG kiểm tra danh sách hành động cấm tùy chỉnh hay so sánh mở rộng quyền với baseline policy như `CheckAccessNotGranted` và `CheckNoNewAccess`.
- **B:** Triển khai lên production trước rồi mới chờ phát hiện là sai hoàn toàn với yêu cầu kiểm soát trước khi triển khai (CI/CD security gate), và GuardDuty cũng không kiểm tra tĩnh IAM policy JSON.
- **C:** `GeneratePolicy` sinh policy dựa trên lịch sử CloudTrail của một role đang chạy, không phải công cụ kiểm tra chính sách tùy chỉnh trong CI/CD trước khi triển khai.
- **D (Đúng):** Chính xác! **IAM Access Analyzer Custom Policy Checks** sử dụng automated reasoning để kiểm tra policy trước khi triển khai (shift-left): `CheckAccessNotGranted` xác minh policy không cấp các hành động bị cấm (như `iam:CreateAccessKey`, `s3:DeleteBucket`), và `CheckNoNewAccess` xác minh policy mới không mở rộng quyền vượt quá policy chuẩn tham chiếu.

</details>

### Câu 11 `hard`

A company secures an Amazon S3 bucket containing financial reports with a bucket policy that explicitly denies all actions unless aws:SourceIp matches the corporate office CIDR range. After deploying this policy, data analysts report that Amazon Athena queries against the bucket fail with AccessDenied, even when initiated from the corporate office network. How should the security engineer fix this without weakening the IP restriction for direct user access?

- **A.** Add the IP ranges of Amazon Athena to the aws:SourceIp allow list in the S3 bucket policy.
- **B.** Grant the analysts AdministratorAccess in their IAM identity-based policies so they override the S3 bucket policy.
- **C.** Add a Condition with 'Bool': { 'aws:ViaAWSService': 'false' } to the explicit Deny statement in the S3 bucket policy.
- **D.** Replace aws:SourceIp with aws:PrincipalOrgID and remove the IP restriction completely.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty bảo vệ một Amazon S3 bucket chứa báo cáo tài chính bằng một bucket policy từ chối rõ ràng tất cả hành động trừ khi aws:SourceIp khớp với dải CIDR văn phòng công ty. Sau khi triển khai policy này, các chuyên viên phân tích dữ liệu báo cáo rằng các truy vấn Amazon Athena vào bucket thất bại với lỗi AccessDenied, ngay cả khi được khởi chạy từ mạng văn phòng công ty. Kỹ sư bảo mật nên khắc phục điều này như thế nào mà không làm suy yếu hạn chế IP đối với quyền truy cập trực tiếp của người dùng?

**Đáp án đúng:** **C**

Condition key **`aws:ViaAWSService`** (và **`aws:CalledVia`**) là chìa khóa giải quyết bài toán xung đột giữa lệnh `Deny` theo `aws:SourceIp` / `aws:SourceVpc` với các dịch vụ AWS gọi S3/KMS thay mặt người dùng như Athena, CloudFormation, Glue hay QuickSight.

- **A:** Amazon Athena không cung cấp dải IP cố định dành riêng cho bạn và đây không phải cơ chế xác thực an toàn (nhiều khách hàng dùng chung dải IP AWS).
- **B:** Trong IAM Policy Evaluation Logic, Explicit Deny trong Bucket Policy luôn thắng mọi Allow trong Identity Policy, kể cả AdministratorAccess.
- **C (Đúng):** Chính xác! Khi Amazon Athena truy cập S3 thay mặt người dùng, địa chỉ IP nguồn là của dịch vụ AWS nên không khớp aws:SourceIp của văn phòng. Thêm điều kiện aws:ViaAWSService = false vào lệnh Deny sẽ miễn trừ các lời gọi đi qua dịch vụ AWS trong khi vẫn chặn truy cập trực tiếp từ IP bên ngoài văn phòng.
- **D:** Bỏ giới hạn IP sẽ làm suy yếu yêu cầu bảo mật ban đầu của đề bài (không được làm yếu giới hạn IP đối với truy cập trực tiếp của người dùng).

</details>

### Câu 12 `medium`

A security engineer wants to enforce least privilege on an existing IAM role that currently has overly broad permissions in production, without breaking the running application. The engineer wants AWS to automatically generate a fine-grained IAM policy based on the role's actual API usage over the past 60 days. Which tool should the engineer use?

- **A.** IAM Policy Simulator permission testing tool
- **B.** IAM Access Analyzer policy generation
- **C.** AWS Trusted Advisor security checks
- **D.** AWS Security Hub CIS AWS Foundations Benchmark

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư bảo mật muốn thực thi nguyên tắc đặc quyền tối thiểu (least privilege) trên một IAM role hiện có vốn đang có quyền quá rộng trên production, mà không làm gián đoạn ứng dụng đang chạy. Kỹ sư muốn AWS tự động tạo một IAM policy chi tiết dựa trên mức sử dụng API thực tế của role đó trong 60 ngày qua. Kỹ sư nên sử dụng công cụ nào?

**Đáp án đúng:** **B**

**IAM Access Analyzer** cung cấp trọn bộ 3 năng lực cốt lõi: (1) External Access & Unused Access findings, (2) Policy Validation (kiểm tra cú pháp/bảo mật), và (3) **Policy Generation** (tự động tạo Least-Privilege Policy dựa trên dữ liệu CloudTrail tối đa 90 ngày).

- **A:** IAM Policy Simulator chỉ dùng để kiểm thử xem một policy hiện có sẽ Allow hay Deny một hành động cụ thể, không tự sinh policy mới từ CloudTrail.
- **B (Đúng):** Chính xác! IAM Access Analyzer Policy Generation phân tích lịch sử hoạt động CloudTrail của IAM User/Role (tối đa 90 ngày) để tự động sinh ra một Least-Privilege IAM Policy bám sát các API thực sự được gọi.
- **C:** Trusted Advisor chỉ kiểm tra một số best practices cơ bản (như Root MFA, Exposed Keys), không phân tích lịch sử CloudTrail để sinh least-privilege policy.
- **D:** CIS Benchmark trong Security Hub đánh giá tuân thủ cấu hình bảo mật chung, không tạo IAM policy từ lịch sử sử dụng thực tế.

</details>

---

[Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md)
