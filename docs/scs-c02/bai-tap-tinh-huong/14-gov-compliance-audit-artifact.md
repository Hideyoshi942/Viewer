# Bài tập tình huống — Quản trị Tuân thủ: Conformance Packs, Audit Manager, Trusted Advisor & Artifact

> AWS Config Conformance Packs, AWS Audit Manager, Security Hub Compliance Standards (CIS/PCI-DSS), AWS Trusted Advisor và AWS Artifact.
> **Số câu hỏi:** 12 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A compliance team needs to deploy a standardized bundle of 45 AWS Config managed rules and associated Systems Manager Automation remediation actions aligned with PCI DSS across all 60 member accounts in an AWS Organization. The solution must prevent member account administrators from modifying or deleting the deployed compliance rules and must be managed as a single deployable entity. Which AWS feature should the team use?

- **A.** Deploy individual AWS Config managed rules and SSM remediation documents in each member account using Terraform.
- **B.** Use AWS Trusted Advisor Organizational View to enforce PCI DSS rules and remediation across all accounts.
- **C.** AWS Config Organization Conformance Packs deployed from the management account or a delegated admin account.
- **D.** Use AWS Artifact Agreements to deploy and enforce immutable PCI DSS compliance checks across member accounts.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm tuân thủ cần triển khai một gói chuẩn hóa gồm 45 quy tắc được quản lý của AWS Config và các hành động khắc phục Systems Manager Automation liên kết phù hợp với PCI DSS trên tất cả 60 tài khoản thành viên trong một AWS Organization. Giải pháp phải ngăn quản trị viên tài khoản thành viên sửa đổi hoặc xóa các quy tắc tuân thủ đã triển khai và phải được quản lý như một thực thể có thể triển khai duy nhất. Nhóm nên sử dụng tính năng AWS nào?

**Đáp án đúng:** **C**

AWS Config Conformance Packs (đặc biệt là Organization Conformance Packs) gom nhiều Config rules + remediation actions vào một YAML template duy nhất. Điểm mạnh nổi bật là tính bất biến đối với member account (immutable — admin member account không thể sửa/xóa rule do Organization Conformance Pack tạo ra).

- **A:** Triển khai từng rule rời rạc trong từng member account không gói thành một thực thể quản lý duy nhất và cho phép admin của member account tự ý sửa hoặc xóa Config rule.
- **B:** Trusted Advisor chỉ cung cấp các kiểm tra khuyến nghị (best practice checks), không cho phép triển khai bộ 45 AWS Config rules kèm SSM Automation remediation actions.
- **C (Đúng):** Chính xác! AWS Config Organization Conformance Pack đóng gói tập hợp các Config rules và remediation actions vào một template YAML duy nhất (có sẵn mẫu PCI DSS, HIPAA, CIS...), triển khai đồng loạt toàn Organization và ngăn quản trị viên member account sửa hoặc xóa các rule này.
- **D:** AWS Artifact dùng để tải báo cáo tuân thủ của chính AWS (như SOC 2, PCI DSS Attestation of Compliance) và ký thỏa thuận như BAA, không kiểm tra cấu hình tài nguyên của khách hàng.

</details>

### Câu 2 `medium`

A publicly traded company spends weeks every quarter manually collecting screenshots, CloudTrail exports, AWS Config compliance snapshots, and Security Hub findings to prove adherence to SOC 2 and ISO 27001 controls for external auditors. The CISO wants to automate continuous evidence collection and map collected artifacts directly to control requirements in auditor-ready assessment reports. Which AWS service should the company adopt?

- **A.** AWS Audit Manager
- **B.** AWS Artifact
- **C.** Amazon Inspector
- **D.** AWS Systems Manager Compliance

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty niêm yết đại chúng tốn nhiều tuần mỗi quý để thu thập thủ công ảnh chụp màn hình, xuất dữ liệu CloudTrail, ảnh chụp tuân thủ AWS Config và các finding Security Hub nhằm chứng minh việc tuân thủ các biện pháp kiểm soát SOC 2 và ISO 27001 cho kiểm toán viên bên ngoài. CISO muốn tự động hóa việc thu thập bằng chứng liên tục và ánh xạ trực tiếp các hiện vật đã thu thập tới các yêu cầu kiểm soát trong báo cáo đánh giá sẵn sàng cho kiểm toán. Công ty nên áp dụng dịch vụ AWS nào?

**Đáp án đúng:** **A**

Phân biệt rõ trong Domain 6: **AWS Artifact** = tải báo cáo tuân thủ CỦA AWS (trách nhiệm của AWS trong Shared Responsibility Model); **AWS Audit Manager** = tự động thu thập bằng chứng tuân thủ CỦA KHÁCH HÀNG trên AWS để nộp cho kiểm toán viên theo các khung SOC 2, PCI DSS, HIPAA, ISO 27001.

- **A (Đúng):** Chính xác! AWS Audit Manager tự động và liên tục thu thập bằng chứng (evidence) từ CloudTrail, AWS Config, Security Hub và các lệnh gọi AWS API, ánh xạ trực tiếp vào các bộ khung chuẩn (SOC 2, ISO 27001, PCI DSS, HIPAA...) để xuất báo cáo đánh giá (assessment report) sẵn sàng cho kiểm toán viên.
- **B:** AWS Artifact cung cấp báo cáo tuân thủ của hạ tầng AWS (Security OF the Cloud), không thu thập bằng chứng cấu hình và vận hành tài nguyên của khách hàng (Security IN the Cloud).
- **C:** Amazon Inspector chỉ quét lỗ hổng CVE phần mềm và khả năng truy cập mạng, không quản lý bộ khung kiểm toán SOC 2/ISO 27001 hay tổng hợp bằng chứng kiểm toán.
- **D:** SSM Compliance chỉ theo dõi trạng thái bản vá (patching) và cấu hình OS trên các managed nodes, không thu thập bằng chứng đa dịch vụ cho SOC 2/ISO 27001.

</details>

### Câu 3 `hard`

An enterprise is designing its multi-account AWS Organizations security architecture. Currently, security analysts log into the Organizations Management Account every day to review Amazon GuardDuty findings, manage AWS Security Hub standards, run Amazon Macie discovery jobs, and review IAM Access Analyzer findings. A cloud security review flags this design as a high-severity architectural risk. How should the enterprise redesign this setup following AWS security best practices?

- **A.** Keep all security services in the Management Account, but create separate read-only IAM users with hardware MFA for the security analysts.
- **B.** Designate a Security Tooling account as Delegated Admin for GuardDuty, Security Hub, Macie, and Access Analyzer.
- **C.** Move the Management Account into a dedicated Security Organizational Unit (OU) and attach a restrictive SCP to it.
- **D.** Enable GuardDuty, Security Hub, and Macie independently in each member account without Organizations integration so each application team manages its own findings.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp đang thiết kế kiến trúc bảo mật AWS Organizations đa tài khoản của mình. Hiện tại, các chuyên viên phân tích bảo mật đăng nhập vào Organizations Management Account hàng ngày để xem xét các finding Amazon GuardDuty, quản lý tiêu chuẩn AWS Security Hub, chạy các job khám phá Amazon Macie và xem xét các finding IAM Access Analyzer. Một đợt đánh giá bảo mật đám mây gắn cờ thiết kế này là rủi ro kiến trúc mức độ nghiêm trọng cao. Doanh nghiệp nên thiết kế lại cấu hình này theo các thực tiễn tốt nhất về bảo mật của AWS như thế nào?

**Đáp án đúng:** **B**

Nguyên tắc quản trị đa tài khoản cốt lõi trong SCS-C02: KHÔNG vận hành các công cụ bảo mật hàng ngày trong **Organizations Management Account** (vì SCP không tác động lên Management Account). Luôn chỉ định một member account chuyên biệt (Security Tooling account) làm **Delegated Administrator** cho Security Hub, GuardDuty, Macie, IAM Access Analyzer, Firewall Manager và Audit Manager.

- **A:** Best practice của AWS là hạn chế tối đa mọi hoạt động vận hành hàng ngày trong Management Account (vì SCP không áp dụng lên Management Account và đây là tài khoản có rủi ro blast radius lớn nhất).
- **B (Đúng):** Chính xác! AWS Organizations hỗ trợ Delegated Administrator cho GuardDuty, Security Hub, Macie, IAM Access Analyzer, Firewall Manager, Config, Audit Manager... Việc ủy quyền sang tài khoản Security Tooling chuyên biệt giúp giảm blast radius của Management Account và áp dụng được SCP bảo vệ tài khoản vận hành bảo mật.
- **C:** Management Account không thể bị giới hạn bởi SCP ngay cả khi gắn SCP lên Root hay OU, và không thể di chuyển Management Account vào trong một OU.
- **D:** Tách rời không tích hợp Organizations làm mất tầm nhìn tập trung (centralized visibility) và cho phép chủ tài khoản ứng dụng tự ý tắt các dịch vụ phát hiện mối đe dọa.

</details>

### Câu 4 `medium`

A rapidly growing startup is migrating to a multi-account AWS environment and needs a prescriptive Landing Zone that automatically provisions new member accounts with standardized VPC baselines, centralized CloudTrail and Config logging to a Log Archive account, IAM Identity Center SSO access, and pre-built preventive (SCP) and detective (AWS Config) security guardrails applied automatically to Organizational Units. Which AWS service provides this with the LEAST setup effort?

- **A.** AWS Service Catalog deployed standalone in a single AWS account with CloudFormation templates.
- **B.** AWS Config Aggregator combined with Amazon GuardDuty across all member accounts.
- **C.** AWS Control Tower with Account Factory and Control Tower Controls (Guardrails).
- **D.** AWS Systems Manager Fleet Manager with Resource Data Sync enabled across Regions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty khởi nghiệp đang phát triển nhanh đang di chuyển sang môi trường AWS đa tài khoản và cần một Landing Zone chuẩn hóa tự động cấp phát các tài khoản thành viên mới với các đường cơ sở VPC chuẩn hóa, ghi nhật ký CloudTrail và Config tập trung vào tài khoản Log Archive, truy cập SSO qua IAM Identity Center và các guardrail bảo mật phòng ngừa (SCP) cũng như phát hiện (AWS Config) dựng sẵn được áp dụng tự động cho các Organizational Unit. Dịch vụ AWS nào cung cấp điều này với ÍT nỗ lực thiết lập nhất?

**Đáp án đúng:** **C**

**AWS Control Tower** là dịch vụ quản trị Landing Zone đa tài khoản nhanh nhất trên AWS, tự động hóa 3 lớp kiểm soát (Controls): **Preventive** (dùng SCP/RCP), **Proactive** (dùng CloudFormation Hooks kiểm tra trước khi deploy), và **Detective** (dùng AWS Config/Security Hub phát hiện drift).

- **A:** AWS Service Catalog chỉ quản lý danh mục sản phẩm CloudFormation/Terraform (và được Control Tower dùng bên dưới cho Account Factory), tự nó không dựng Landing Zone hay bộ guardrails đa tài khoản.
- **B:** Config Aggregator và GuardDuty chỉ cung cấp khả năng giám sát/phát hiện, không tự động dựng Landing Zone, Account Factory hay triển khai preventive SCP guardrails.
- **C (Đúng):** Chính xác! AWS Control Tower tự động dựng chuẩn Multi-Account Landing Zone (tạo sẵn Log Archive & Audit accounts, cấu hình IAM Identity Center, Organization CloudTrail/Config), cung cấp Account Factory để cấp phát tài khoản mới và bộ Controls gồm Preventive (SCP/RCP), Detective (AWS Config/Security Hub) và Proactive (CloudFormation Hooks).
- **D:** Fleet Manager dùng để quản lý các server/EC2 managed nodes, không phải dịch vụ dựng multi-account Landing Zone.

</details>

### Câu 5 `hard`

A Chief Compliance Officer asks the cloud security team to complete two governance tasks across the company's AWS Organization:
1) Obtain AWS's official third-party SOC 2 Type II report and PCI DSS Attestation of Compliance (AOC) to demonstrate the security of AWS's underlying physical data centers and hypervisors to regulators.
2) Enforce an organization-wide preventive guardrail directly on supported AWS resources (such as S3 buckets, KMS keys, and SQS queues) across all member accounts to block any external principal outside the AWS Organization from accessing those resources—even if a member account administrator misconfigures a resource-based policy.
Which TWO AWS services or features should the team use? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Use AWS Audit Manager to download AWS's physical data center SOC 2 Type II audit report.
- **B.** Use AWS Artifact to download AWS's SOC 2 Type II report and PCI DSS Attestation of Compliance (AOC).
- **C.** Attach an SCP to block anonymous or external AWS accounts from calling s3:GetObject via a public bucket policy.
- **D.** Attach a Resource Control Policy (RCP) to member OUs denying resource access when aws:PrincipalOrgID does not match.
- **E.** Use AWS Trusted Advisor to enforce preventive resource-based access blocks across all member accounts.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một Giám đốc Tuân thủ (CCO) yêu cầu nhóm bảo mật đám mây hoàn thành hai nhiệm vụ quản trị trên toàn bộ AWS Organization của công ty:
> 1) Lấy báo cáo SOC 2 Type II chính thức của bên thứ ba và Chứng nhận Tuân thủ PCI DSS (AOC) của AWS để chứng minh tính bảo mật của các trung tâm dữ liệu vật lý và hypervisor bên dưới của AWS với các cơ quan quản lý.
> 2) Thực thi một guardrail phòng ngừa trên toàn tổ chức trực tiếp trên các tài nguyên AWS được hỗ trợ (như S3 bucket, KMS key và SQS queue) trên tất cả các tài khoản thành viên để chặn bất kỳ principal bên ngoài nào nằm ngoài AWS Organization truy cập vào các tài nguyên đó—ngay cả khi quản trị viên tài khoản thành viên cấu hình sai resource-based policy.
> Nhóm nên sử dụng HAI dịch vụ hoặc tính năng AWS nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Hai điểm kiến thức quản trị cực kỳ sắc nét của SCS-C02: (1) **AWS Artifact** cung cấp báo cáo tuân thủ hạ tầng AWS (SOC 2, PCI DSS AOC, ISO 27001), và (2) **Resource Control Policies (RCPs)** bổ sung mảnh ghép mà SCP không làm được: giới hạn quyền truy cập trực tiếp lên **tài nguyên** (kể cả khi request đến từ principal bên ngoài Organization), giúp xây dựng Data Perimeter bất khả xâm phạm ở cấp AWS Organizations.

- **A:** AWS Audit Manager thu thập bằng chứng tuân thủ của tài nguyên khách hàng (Security IN the Cloud), không phải nơi tải báo cáo kiểm toán trung tâm dữ liệu vật lý của AWS (đó là AWS Artifact).
- **B (Đúng):** Chính xác! AWS Artifact là cổng thông tin tự phục vụ cung cấp theo yêu cầu các báo cáo tuân thủ và chứng nhận của chính hạ tầng AWS (SOC 1/2/3, PCI DSS AOC, ISO 27001) cũng như quản lý các thỏa thuận pháp lý như HIPAA BAA.
- **C:** SCP chỉ áp dụng lên IAM principals THUỘC các member account trong Organization của bạn, KHÔNG áp dụng lên các danh tính ẩn danh (anonymous) hoặc tài khoản bên ngoài Organization truy cập qua resource-based policy. Để chặn ở cấp tài nguyên phải dùng RCP (hoặc S3 Block Public Access).
- **D (Đúng):** Chính xác! Resource Control Policies (RCPs) là loại chính sách quản trị ở cấp AWS Organizations đặt mức quyền tối đa trực tiếp lên TÀI NGUYÊN (S3, STS, KMS, SQS, Secrets Manager) trong member accounts—khác với SCP chỉ giới hạn danh tính (IAM principals) bên trong Organization, RCP chặn được cả danh tính bên ngoài gọi vào tài nguyên bị cấu hình sai resource policy.
- **E:** Trusted Advisor chỉ là công cụ kiểm tra khuyến nghị (advisory/detective), không có chức năng thực thi preventive guardrails.

</details>

### Câu 6 `hard`

A company manages 60 AWS accounts with AWS Control Tower. The security team wants to prevent developers from deploying Amazon RDS instances without encryption enabled BEFORE the CloudFormation stack even creates the non-compliant database, rather than only detecting it after creation. Which type of AWS Control Tower control should the team enable on the target Organizational Units?

- **A.** Detective controls implemented via AWS Config managed rules.
- **B.** AWS Audit Manager continuous compliance assessments.
- **C.** Proactive controls implemented via AWS CloudFormation hooks.
- **D.** AWS Security Hub CIS AWS Foundations Benchmark standards.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty quản lý 60 tài khoản AWS bằng AWS Control Tower. Nhóm bảo mật muốn ngăn chặn các nhà phát triển triển khai Amazon RDS instance mà không bật mã hóa TRƯỚC KHI CloudFormation stack kịp tạo cơ sở dữ liệu không tuân thủ, thay vì chỉ phát hiện sau khi đã tạo. Nhóm nên bật loại kiểm soát AWS Control Tower nào trên các Organizational Unit mục tiêu?

**Đáp án đúng:** **C**

AWS Control Tower phân loại 3 nhóm kiểm soát: **Preventive** (dùng SCP/RCP để chặn API gọi trực tiếp), **Proactive** (dùng **CloudFormation Hooks** để kiểm tra và chặn tài nguyên không tuân thủ trước khi provision qua CloudFormation), và **Detective** (dùng **AWS Config / Security Hub** để phát hiện sau khi tạo).

- **A:** Detective controls (AWS Config rules) chỉ phát hiện sự không tuân thủ SAU khi tài nguyên đã được tạo ra, không ngăn chặn trước khi CloudFormation triển khai.
- **B:** AWS Audit Manager chỉ thu thập bằng chứng kiểm toán cho báo cáo tuân thủ, không chặn việc triển khai tài nguyên.
- **C (Đúng):** Chính xác! AWS Control Tower Proactive Controls được thực thi bằng AWS CloudFormation Hooks, kiểm tra tài nguyên trong template ngay trước khi CloudFormation tiến hành khởi tạo (pre-provisioning) và chặn triển khai nếu không tuân thủ (như RDS không bật mã hóa).
- **D:** Security Hub kiểm tra trạng thái tuân thủ sau khi tài nguyên đã tồn tại (detective), không chặn trước khi CloudFormation tạo tài nguyên.

</details>

### Câu 7 `hard`

A healthcare organization must continuously collect automated evidence mapped to HIPAA security controls across 35 AWS accounts so that internal compliance officers can generate audit-ready assessment reports without manually taking screenshots of AWS Console configurations. Which AWS service is purpose-built for this requirement?

- **A.** AWS Artifact to download compliance reports for the company's custom EC2 and S3 configurations.
- **B.** AWS Audit Manager with the prebuilt HIPAA framework enabled from a delegated administrator account.
- **C.** AWS Trusted Advisor Security checks aggregated in the management account.
- **D.** AWS Systems Manager Compliance to map CloudTrail logs to HIPAA controls.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức y tế phải liên tục thu thập bằng chứng tự động được ánh xạ tới các biện pháp kiểm soát bảo mật HIPAA trên 35 tài khoản AWS để các nhân viên tuân thủ nội bộ có thể tạo báo cáo đánh giá sẵn sàng cho kiểm toán mà không cần chụp ảnh màn hình thủ công các cấu hình AWS Console. Dịch vụ AWS nào được thiết kế chuyên biệt cho yêu cầu này?

**Đáp án đúng:** **B**

Phân biệt rõ trong Domain 6: **AWS Artifact** cung cấp báo cáo tuân thủ của **AWS** (SOC, ISO, PCI của AWS), còn **AWS Audit Manager** tự động thu thập bằng chứng tuân thủ cho **workload của khách hàng** và ánh xạ theo các framework như HIPAA, PCI DSS, GDPR để xuất báo cáo kiểm toán.

- **A:** AWS Artifact chỉ cung cấp các chứng chỉ và báo cáo tuân thủ về hạ tầng của chính AWS (trách nhiệm của AWS trong Shared Responsibility Model), không thu thập bằng chứng cấu hình tài nguyên của khách hàng.
- **B (Đúng):** Chính xác! AWS Audit Manager tự động thu thập liên tục bằng chứng kiểm toán từ CloudTrail, AWS Config, Security Hub và API calls, ánh xạ sẵn theo các khung tiêu chuẩn (như HIPAA, PCI DSS, SOC 2) và xuất báo cáo sẵn sàng cho kiểm toán viên.
- **C:** Trusted Advisor chỉ đưa ra các khuyến nghị tối ưu và kiểm tra bảo mật cơ bản, không thu thập bằng chứng theo khung kiểm soát HIPAA hay tạo assessment report cho kiểm toán.
- **D:** SSM Compliance chủ yếu theo dõi trạng thái vá lỗi (Patch Manager) và Association (State Manager) trên các managed nodes (EC2/on-premises), không phải công cụ thu thập bằng chứng kiểm toán HIPAA toàn diện đa tài khoản.

</details>

### Câu 8 `hard`

A governance team wants to deploy a standardized bundle of 25 AWS Config compliance rules (such as checking S3 encryption, RDS public accessibility, and EBS encryption) across all 50 member accounts in AWS Organizations as a single unit, and automatically remediate non-compliant S3 buckets by enabling default encryption without writing custom Lambda functions. Which solution meets these requirements?

- **A.** Enable AWS Trusted Advisor across all accounts and configure it to run SSM Automation documents automatically.
- **B.** Deploy 25 separate EventBridge rules and custom Lambda functions manually in each of the 50 accounts.
- **C.** Deploy an AWS Config Organization Conformance Pack with SSM Automation remediation (e.g., AWS-EnableS3BucketEncryption).
- **D.** Use AWS Service Catalog to enforce continuous compliance checks on existing S3 buckets.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm quản trị muốn triển khai một gói chuẩn hóa gồm 25 quy tắc tuân thủ AWS Config (như kiểm tra mã hóa S3, khả năng truy cập công khai RDS và mã hóa EBS) trên tất cả 50 tài khoản thành viên trong AWS Organizations như một đơn vị duy nhất, và tự động khắc phục các S3 bucket không tuân thủ bằng cách bật mã hóa mặc định mà không cần viết các Lambda function tùy chỉnh. Giải pháp nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **C**

**AWS Config Organization Conformance Packs** cho phép triển khai hàng chục Config rules kèm **SSM Automation remediation actions** đồng loạt tới mọi tài khoản trong AWS Organizations như một thực thể duy nhất, giúp quản trị tuân thủ ở quy mô lớn mà không cần tự duy trì mã nguồn Lambda.

- **A:** Trusted Advisor không hỗ trợ đóng gói Conformance Pack hay trực tiếp kích hoạt SSM Automation remediation trên toàn Organization như AWS Config.
- **B:** Tự viết và triển khai thủ công 25 Lambda/EventBridge trên 50 tài khoản trái ngược hoàn toàn với yêu cầu triển khai tập trung thành một khối duy nhất và không viết Lambda tùy chỉnh.
- **C (Đúng):** Chính xác! **AWS Config Organization Conformance Pack** đóng gói tập hợp nhiều Config rules và các hành động tự động khắc phục (**SSM Automation documents** có sẵn như `AWS-EnableS3BucketEncryption`) thành một YAML template duy nhất và triển khai đồng loạt trên toàn bộ AWS Organizations mà không cần tự viết code Lambda.
- **D:** AWS Service Catalog dùng để quản lý danh mục sản phẩm được phê duyệt khi khởi tạo (provisioning), không thực hiện kiểm tra tuân thủ liên tục và tự động khắc phục tài nguyên đang chạy như AWS Config Conformance Packs.

</details>

### Câu 9 `hard`

A company is building a multi-account AWS Landing Zone using AWS Control Tower and wants to follow AWS security best practices for delegated administration and account guardrails. Which TWO architectural practices are recommended? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Grant all security analysts direct console access to the AWS Organizations management account so they can view GuardDuty and Security Hub findings.
- **B.** Rely solely on Control Tower detective controls to prevent member accounts from leaving the AWS Organization.
- **C.** Designate the Audit/Security Tooling account as delegated admin for GuardDuty, Security Hub, Detective, and Access Analyzer.
- **D.** Disable AWS Control Tower Account Factory so that new accounts are created manually with unique root passwords shared via email.
- **E.** Combine preventive controls (SCPs) for high-risk actions with detective controls (AWS Config/Security Hub) across all OUs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty đang xây dựng AWS Landing Zone đa tài khoản bằng AWS Control Tower và muốn tuân theo các thực tiễn tốt nhất về bảo mật của AWS cho việc ủy quyền quản trị và các guardrail tài khoản. HAI thực tiễn kiến trúc nào được khuyến nghị? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Hai nguyên tắc vàng khi thiết kế **Multi-Account Security Governance (Control Tower)**: (1) Hạn chế tối đa truy cập vào **Management Account** bằng cách dùng **Delegated Administrator** (Security Tooling/Audit account) cho các dịch vụ bảo mật; (2) Kết hợp **Preventive (SCP)**, **Proactive (CFN Hooks)** và **Detective (Config/Security Hub)** controls.

- **A:** Cấp quyền đăng nhập trực tiếp vào Management Account cho đội ngũ vận hành bảo mật là vi phạm nghiêm trọng best practice vì Management Account không bị giới hạn bởi SCP.
- **B:** Detective controls chỉ phát hiện sau khi sự việc xảy ra; để ngăn chặn member account rời khỏi Organization, bắt buộc phải dùng **Preventive control** (SCP chặn `organizations:LeaveOrganization`).
- **C (Đúng):** Chính xác! Ủy quyền quản trị (Delegated Administrator) các dịch vụ bảo mật cho tài khoản Security Tooling/Audit riêng biệt giúp hạn chế tối đa số lượng người dùng và thao tác trên Management Account, tuân thủ nguyên tắc tách biệt nhiệm vụ (separation of duties).
- **D:** Tắt Account Factory và chia sẻ mật khẩu root qua email làm mất tính chuẩn hóa baseline bảo mật và tạo rủi ro lộ lọt thông tin cực lớn.
- **E (Đúng):** Chính xác! Áp dụng phòng thủ theo chiều sâu (defense-in-depth) trong Control Tower bằng cách kết hợp **Preventive controls** (SCP chặn hành vi nguy hiểm từ gốc) và **Detective controls** (AWS Config/Security Hub phát hiện sai lệch cấu hình).

</details>

### Câu 10 `hard`

A healthcare startup is preparing to migrate Protected Health Information (PHI) into its AWS Organization. Before storing any PHI on AWS, the company's legal and compliance officers must formally execute an AWS Business Associate Addendum (BAA) covering all accounts in the Organization and download AWS's latest SOC 2 Type II and ISO 27001 third-party audit reports to provide to hospital partners. Where should the officers complete both tasks?

- **A.** Use AWS Audit Manager to sign the organization-wide HIPAA BAA and download AWS's latest SOC 2 Type II audit report.
- **B.** Use AWS Security Hub in the delegated administrator account to accept the HIPAA BAA across all member accounts.
- **C.** Use AWS Trusted Advisor in the management account to generate and download AWS's ISO 27001 and SOC 2 certifications.
- **D.** Use AWS Artifact in the management account to accept the organization-level BAA and download SOC 2 and ISO 27001 reports.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty khởi nghiệp y tế đang chuẩn bị di chuyển Thông tin Sức khỏe được Bảo vệ (PHI) vào AWS Organization của mình. Trước khi lưu trữ bất kỳ PHI nào trên AWS, các nhân viên pháp lý và tuân thủ của công ty phải ký kết chính thức một Phụ lục Đối tác Kinh doanh AWS (BAA) bao phủ tất cả tài khoản trong Organization và tải xuống các báo cáo kiểm toán bên thứ ba SOC 2 Type II và ISO 27001 mới nhất của AWS để cung cấp cho các đối tác bệnh viện. Các nhân viên nên hoàn thành cả hai tác vụ ở đâu?

**Đáp án đúng:** **D**

Ghi nhớ nhanh về **AWS Artifact**: đây là cổng tự phục vụ duy nhất cho **Compliance của chính AWS** — gồm **Artifact Reports** (tải báo cáo SOC, ISO, PCI của AWS) và **Artifact Agreements** (ký kết **HIPAA BAA**, GDPR DPA cho từng tài khoản hoặc toàn bộ AWS Organizations).

- **A:** AWS Audit Manager dùng để thu thập bằng chứng tuân thủ cho workload CỦA KHÁCH HÀNG, không phải nơi ký kết thỏa thuận BAA hay tải báo cáo kiểm toán hạ tầng của AWS.
- **B:** Security Hub tổng hợp security findings và kiểm tra tiêu chuẩn cấu hình, không quản lý thỏa thuận pháp lý BAA hay báo cáo kiểm toán của AWS.
- **C:** Trusted Advisor chỉ đưa ra khuyến nghị tối ưu hóa và bảo mật tài khoản, không cung cấp chứng chỉ ISO/SOC hay ký kết BAA.
- **D (Đúng):** Chính xác! **AWS Artifact** có 2 chức năng cốt lõi: (1) **AWS Artifact Agreements** để xem xét và ký kết trực tuyến các thỏa thuận pháp lý như **HIPAA BAA** (có thể áp dụng cho toàn bộ AWS Organization từ Management Account); và (2) **AWS Artifact Reports** để tải về các báo cáo kiểm toán độc lập của AWS (SOC 1/2/3, ISO 27001, PCI DSS).

</details>

### Câu 11 `medium`

A company is preparing for an external PCI-DSS and SOC 2 audit. The auditor requests two distinct sets of documentation: (1) official compliance reports proving that AWS's underlying physical data centers and cloud infrastructure meet PCI-DSS and SOC 2 standards, and (2) continuously collected evidence proving that the company's own AWS accounts and workloads adhere to PCI-DSS controls. Which pair of AWS services should the security team use?

- **A.** AWS Audit Manager for AWS's physical data center reports, and AWS Trusted Advisor for PCI-DSS workload evidence.
- **B.** AWS Artifact for AWS infrastructure reports, and AWS Audit Manager for continuous workload evidence collection.
- **C.** AWS Security Hub for AWS's infrastructure reports, and AWS Artifact for customer workload evidence.
- **D.** AWS Config Conformance Packs for AWS's infrastructure reports, and Amazon Inspector for SOC 2 evidence collection.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty đang chuẩn bị cho một đợt kiểm toán PCI-DSS và SOC 2 bên ngoài. Kiểm toán viên yêu cầu hai bộ tài liệu riêng biệt: (1) các báo cáo tuân thủ chính thức chứng minh rằng các trung tâm dữ liệu vật lý và hạ tầng đám mây bên dưới của AWS đáp ứng các tiêu chuẩn PCI-DSS và SOC 2, và (2) bằng chứng được thu thập liên tục chứng minh rằng các tài khoản và workload AWS của chính công ty tuân thủ các biện pháp kiểm soát PCI-DSS. Nhóm bảo mật nên sử dụng cặp dịch vụ AWS nào?

**Đáp án đúng:** **B**

Phân biệt rõ theo **Shared Responsibility Model**: Tuân thủ *OF the Cloud* (báo cáo SOC 2 / PCI / ISO của chính AWS, ký BAA) → **AWS Artifact**. Thu thập bằng chứng kiểm toán *IN the Cloud* (cho ứng dụng/tài khoản của công ty) → **AWS Audit Manager**.

- **A:** Ngược vai trò: Audit Manager không chứa báo cáo trung tâm dữ liệu vật lý của AWS, còn Trusted Advisor không tạo bộ hồ sơ bằng chứng kiểm toán PCI-DSS chuyên sâu.
- **B (Đúng):** Chính xác! Theo Shared Responsibility Model: AWS Artifact cung cấp miễn phí báo cáo tuân thủ của chính hạ tầng AWS (SOC 2, PCI AoC, ISO 27001, BAA), còn AWS Audit Manager tự động thu thập bằng chứng tuân thủ cho các workload của khách hàng từ CloudTrail, Config và Security Hub.
- **C:** Security Hub chỉ kiểm tra cấu hình tài khoản của khách hàng, không cung cấp báo cáo kiểm toán hạ tầng vật lý của AWS; AWS Artifact không thu thập bằng chứng workload của khách hàng.
- **D:** Config Conformance Packs đánh giá tài nguyên của khách hàng chứ không chứng minh tuân thủ data center của AWS; Inspector chỉ quét CVE.

</details>

### Câu 12 `medium`

An enterprise uses AWS Control Tower to govern its multi-account AWS environment. The security team needs to implement three types of controls: (1) block anyone from disabling CloudTrail in member accounts, (2) detect any S3 buckets that allow public read access after creation, and (3) block non-compliant CloudFormation templates from deploying unencrypted RDS instances before resources are provisioned. Which Control Tower control categories correspond to these three requirements in order?

- **A.** Preventive control (SCP), Detective control (AWS Config), and Proactive control (CloudFormation Hooks).
- **B.** Proactive control (SCP), Preventive control (AWS Config), and Detective control (CloudFormation Hooks).
- **C.** Detective control (SCP), Proactive control (AWS Config), and Preventive control (Security Hub).
- **D.** Preventive control (AWS Config), Detective control (CloudFormation Hooks), and Proactive control (SCP).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp sử dụng AWS Control Tower để quản trị môi trường AWS đa tài khoản của mình. Nhóm bảo mật cần triển khai ba loại kiểm soát: (1) chặn bất kỳ ai tắt CloudTrail trong các tài khoản thành viên, (2) phát hiện bất kỳ S3 bucket nào cho phép quyền đọc công khai sau khi tạo, và (3) chặn các CloudFormation template không tuân thủ triển khai các RDS instance không được mã hóa trước khi tài nguyên được khởi tạo. Các danh mục kiểm soát Control Tower nào tương ứng với ba yêu cầu này theo đúng thứ tự?

**Đáp án đúng:** **A**

Nắm chắc 3 nhóm Guardrails (Controls) của **AWS Control Tower**: **Preventive** (SCP/RCP — chặn API), **Detective** (AWS Config / Security Hub — phát hiện sai phạm hiện hữu), và **Proactive** (CloudFormation Hooks — chặn trước khi tài nguyên được cấp phát qua IaC).

- **A (Đúng):** Chính xác! Trong AWS Control Tower: Preventive = SCP/RCP (ngăn chặn hành động API ngay lập tức), Detective = AWS Config Rules / Security Hub (phát hiện sai phạm sau khi tạo), Proactive = CloudFormation Hooks (kiểm tra & chặn template trước khi tài nguyên được khởi tạo).
- **B:** Sai thứ tự và sai công nghệ nền tảng: SCP là Preventive chứ không phải Proactive; AWS Config là Detective chứ không phải Preventive.
- **C:** Sai hoàn toàn ánh xạ giữa 3 nhóm Control và dịch vụ thực thi bên dưới của AWS Control Tower.
- **D:** AWS Config không phải Preventive control và CloudFormation Hooks là Proactive chứ không phải Detective.

</details>

---

[Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md)
