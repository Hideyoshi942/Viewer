# Bài tập tình huống — Chủ đề 2: Enterprise Landing Zone — Control Tower, CfCT, AFT, Service Catalog & AWS RAM

> Tự động hóa Account Factory (AFT), Customizations for Control Tower (CfCT), Guardrails, AWS Service Catalog và chia sẻ tài nguyên qua AWS RAM.
> **Số câu hỏi:** 14 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

An enterprise operates 80 AWS accounts connected to a centralized AWS Transit Gateway in a Network Services account, which also connects to on-premises data centers over AWS Direct Connect. Workloads in all 80 spoke VPCs must resolve internal on-premises domain names under corp.internal, and on-premises servers must resolve Amazon Route 53 Private Hosted Zone (PHZ) records under aws.corp.internal. The architecture must minimize cost and operational overhead. Which solution meets these requirements?

- **A.** Deploy Route 53 Resolver Inbound and Outbound endpoints in every spoke VPC, configure forwarding rules in each account, and manually replicate Private Hosted Zone records across all 80 VPCs.
- **B.** Enable DNS hostnames on the Transit Gateway and configure a custom DHCP Options Set in every spoke VPC pointing directly to the on-premises DNS servers over Direct Connect.
- **C.** Deploy centralized Route 53 Resolver Inbound/Outbound endpoints in the Network Services VPC, associate PHZs with it, create an Outbound rule for corp.internal, and share via AWS RAM.
- **D.** Configure Amazon Route 53 Public Hosted Zones for corp.internal and aws.corp.internal, restrict access using VPC Endpoint Policies, and route DNS queries over an Internet Gateway.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp vận hành 80 AWS account kết nối tới một AWS Transit Gateway tập trung trong tài khoản Network Services, nơi cũng kết nối tới các trung tâm dữ liệu on-premises qua AWS Direct Connect. Các workload trong cả 80 spoke VPC phải phân giải tên miền nội bộ on-premises dưới corp.internal, và các máy chủ on-premises phải phân giải các bản ghi Amazon Route 53 Private Hosted Zone (PHZ) dưới aws.corp.internal. Kiến trúc phải giảm thiểu chi phí và chi phí vận hành. Giải pháp nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **C**

Kiến trúc Hybrid DNS tối ưu chi phí cho tổ chức nhiều tài khoản là tập trung **Route 53 Resolver Inbound & Outbound Endpoints** tại một Shared Services/Network VPC, sau đó chia sẻ **Resolver Forwarding Rules** qua **AWS RAM** cho tất cả các tài khoản thành viên.

- **A:** Triển khai Inbound và Outbound endpoints trên cả 80 spoke VPCs sẽ tốn hàng trăm ENI (tính phí theo giờ trên mỗi ENI) và gây gánh nặng vận hành cực lớn.
- **B:** Transit Gateway chỉ hỗ trợ bật DNS support cho VPC attachment (cho phép phân giải public IP sang private IP), không làm DNS forwarder. Nếu trỏ DHCP Options Set trực tiếp về DNS on-premises thì các spoke VPC sẽ mất khả năng phân giải AWS-provided DNS và Route 53 Private Hosted Zones cục bộ.
- **C (Đúng):** Chính xác. Mô hình DNS Hub-and-Spoke chuẩn trên AWS đặt Inbound/Outbound endpoints tập trung tại Network Services VPC, gắn các PHZ cần phân giải từ on-premises vào VPC này (để on-premises query qua Inbound endpoint), và chia sẻ Outbound Forwarding Rule (cho corp.internal) qua AWS RAM tới 80 spoke VPCs mà không cần tạo Outbound endpoint ở từng spoke.
- **D:** Public Hosted Zones công khai bản ghi DNS ra Internet, vi phạm yêu cầu bảo mật nội bộ và không thể bảo vệ bản ghi DNS bằng VPC Endpoint Policies.

</details>

### Câu 2 `medium`

A media streaming company runs high-throughput microservices across 12 AWS accounts within AWS Organizations. Currently, each account has its own VPC connected via AWS Transit Gateway, resulting in high Transit Gateway data processing charges and IPv4 address exhaustion. The microservices communicate heavily with each other using private IPs, and teams need to retain independent IAM permissions to launch and manage their own EC2 instances and Security Groups. How can the Solutions Architect reduce networking costs and conserve IPv4 space?

- **A.** Replace the centralized AWS Transit Gateway with a full mesh of VPC Peering connections between all 12 workload accounts and manage route tables individually.
- **B.** Expose every microservice through AWS PrivateLink VPC Endpoint Services and Network Load Balancers so private IP traffic bypasses the Transit Gateway.
- **C.** Consolidate all microservices into a single AWS Organizations Management account and a single VPC to eliminate Transit Gateway data processing charges.
- **D.** Create a centralized VPC in a Network account and share its subnets with the 12 workload accounts using AWS Resource Access Manager (AWS RAM).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty phát trực tuyến truyền thông chạy các microservice thông lượng cao trên 12 AWS account trong AWS Organizations. Hiện tại, mỗi account có VPC riêng kết nối qua AWS Transit Gateway, dẫn đến chi phí xử lý dữ liệu Transit Gateway cao và cạn kiệt địa chỉ IPv4. Các microservice giao tiếp nhiều với nhau bằng IP riêng tư, và các nhóm cần giữ quyền IAM độc lập để khởi chạy và quản lý EC2 instance cũng như Security Group của riêng họ. Solutions Architect có thể giảm chi phí mạng và tiết kiệm không gian IPv4 bằng cách nào?

**Đáp án đúng:** **D**

**AWS RAM VPC Subnet Sharing** cho phép tách biệt quyền sở hữu hạ tầng mạng (Network account) và quyền sở hữu tài nguyên ứng dụng (Participant accounts), giúp loại bỏ phí Transit Gateway cho lưu lượng nội bộ, tránh phân mảnh dải IPv4, và vẫn duy trì cách ly tài khoản ở tầng IAM/billing.

- **A:** Full-mesh VPC Peering giữa 12 VPC cần 66 kết nối, không giải quyết được vấn đề cạn kiệt địa chỉ IPv4 (vì mỗi VPC vẫn cần dải CIDR riêng) và gây phức tạp quản trị route table.
- **B:** PrivateLink phát sinh phí giờ cho từng Interface Endpoint và phí xử lý dữ liệu theo GB, đắt hơn và phức tạp hơn nhiều so với VPC Sharing cho giao tiếp nội bộ mật độ cao.
- **C:** Gộp tất cả vào một tài khoản duy nhất phá vỡ ranh giới cách ly bảo mật (blast radius), giới hạn hạn mức dịch vụ và yêu cầu tự chủ IAM của từng team.
- **D (Đúng):** Chính xác. VPC Subnet Sharing qua AWS RAM cho phép nhiều tài khoản cùng triển khai EC2/RDS/ENI vào chung một VPC (tối ưu hóa không gian IPv4 và loại bỏ hoàn toàn phí xử lý dữ liệu Transit Gateway giữa các dịch vụ), trong khi mỗi tài khoản tham gia vẫn sở hữu và quản lý độc lập tài nguyên và Security Groups của riêng mình.

</details>

### Câu 3 `medium`

A large retail enterprise is adopting AWS Control Tower to govern its multi-account landing zone. Whenever a new workload account is provisioned through Account Factory, the security and platform teams must automatically deploy a standardized baseline consisting of custom VPC layouts, IAM roles, and specific AWS Config rules tailored to whether the account is designated as PCI or Non-PCI. The solution must require minimal custom scripting and integrate natively with Control Tower. What should the Solutions Architect recommend?

- **A.** Manually run AWS CloudFormation templates in each newly created account after AWS Control Tower Account Factory completes provisioning.
- **B.** Use AWS Control Tower Account Factory Customization (AFC) with AWS Service Catalog blueprints to apply PCI or Non-PCI baselines automatically during account vending.
- **C.** Configure an Amazon EventBridge rule in every member account to trigger an AWS Lambda function that calls the AWS CLI to provision custom VPCs, IAM roles, and AWS Config rules.
- **D.** Attach a Service Control Policy (SCP) to the Root OU that automatically deploys and enforces the required VPC layouts, IAM roles, and AWS Config rules in new accounts.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp bán lẻ lớn đang áp dụng AWS Control Tower để quản trị landing zone đa tài khoản của mình. Bất cứ khi nào một workload account mới được cấp phát qua Account Factory, nhóm bảo mật và nền tảng phải tự động triển khai một cấu hình cơ sở chuẩn hóa gồm bố cục VPC tùy chỉnh, các IAM role và các quy tắc AWS Config cụ thể tùy theo tài khoản đó được chỉ định là PCI hay Non-PCI. Giải pháp phải yêu cầu ít viết script tùy chỉnh nhất và tích hợp nguyên bản với Control Tower. Solutions Architect nên đề xuất gì?

**Đáp án đúng:** **B**

**AWS Control Tower Account Factory Customization (AFC)** (sử dụng AWS Service Catalog blueprints) cho phép chuẩn hóa và tự động hóa việc triển khai các cấu hình đặc thù (như PCI vs Non-PCI) ngay trong quy trình tạo tài khoản mới của Control Tower.

- **A:** Thao tác thủ công vi phạm yêu cầu tự động hóa và dễ gây lệch cấu hình (configuration drift).
- **B (Đúng):** Chính xác. Account Factory Customization (AFC) tích hợp trực tiếp với AWS Service Catalog trong Control Tower, cho phép chọn các blueprint (PCI hoặc Non-PCI) để tự động triển khai VPC, IAM roles và Config rules ngay khi cấp phát tài khoản mới với ít mã tùy biến nhất.
- **C:** Tạo rule EventBridge trong từng member account và tự viết script Lambda gọi CLI làm tăng gánh nặng bảo trì và không hoạt động trước khi tài khoản mới được bootstrap.
- **D:** SCP chỉ là chính sách kiểm soát quyền tối đa (preventive guardrail), không có khả năng khởi tạo hay cấp phát tài nguyên AWS.

</details>

### Câu 4 `medium`

A financial institution wants application developers to self-service provision compliant Amazon RDS PostgreSQL databases and Amazon EKS clusters. Security policy strictly forbids granting developers direct IAM permissions to create RDS instances, EKS clusters, or KMS keys. All provisioned stacks must follow pre-approved CloudFormation templates maintained by the central Cloud Platform team and be shared across 40 AWS accounts. Which solution meets these requirements?

- **A.** Store the CloudFormation templates in an S3 bucket shared with all 40 accounts and grant developers direct cloudformation:CreateStack IAM permissions to provision stacks.
- **B.** Grant developers AdministratorAccess in all 40 accounts and attach an IAM Permissions Boundary that denies RDS, EKS, and KMS resource deletion.
- **C.** Create AWS Service Catalog products from the approved templates, attach Launch Constraints, share the Portfolio across the Organization, and grant AWSServiceCatalogEndUserFullAccess.
- **D.** Use AWS Config Remediation actions with Systems Manager Automation to automatically terminate any RDS or EKS resources created outside of approved tags.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức tài chính muốn các lập trình viên ứng dụng tự phục vụ cấp phát các cơ sở dữ liệu Amazon RDS PostgreSQL và cụm Amazon EKS đạt chuẩn tuân thủ. Chính sách bảo mật nghiêm cấm cấp trực tiếp quyền IAM cho lập trình viên để tạo RDS instance, cụm EKS hoặc khóa KMS. Tất cả các stack được cấp phát phải tuân theo các CloudFormation template đã được phê duyệt trước do nhóm Cloud Platform trung tâm duy trì và được chia sẻ trên 40 AWS account. Giải pháp nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **C**

**AWS Service Catalog** với **Launch Constraints** là kiến trúc chuẩn giúp triển khai mô hình self-service tuân thủ quy chuẩn (compliant self-service) mà không cần cấp quyền IAM trực tiếp cho người dùng cuối tạo các dịch vụ hạ tầng.

- **A:** Khi gọi cloudformation:CreateStack bằng quyền của chính developer, CloudFormation vẫn yêu cầu developer phải có quyền tạo RDS, EKS và KMS trừ khi có cơ chế PassRole/Service Catalog Launch Constraint.
- **B:** Cấp AdministratorAccess vi phạm nguyên tắc least privilege và cho phép developer tự tạo RDS/EKS không tuân thủ template chuẩn.
- **C (Đúng):** Chính xác. AWS Service Catalog kết hợp Launch Constraint (gắn một IAM Role có quyền tạo RDS/EKS/KMS vào sản phẩm) cho phép developer chỉ cần quyền end-user của Service Catalog để tự khởi chạy hạ tầng chuẩn hóa mà không hề có quyền tạo trực tiếp tài nguyên nhạy cảm.
- **D:** Đây là cơ chế phát hiện và xử lý hậu kiểm (detective/reactive), vẫn phải cấp quyền tạo trực tiếp cho developer — vi phạm yêu cầu ngăn chặn từ đầu (preventive).

</details>

### Câu 5 `hard`

A retail analytics group is migrating its legacy on-premises SFTP ingestion servers and enterprise data warehouse to a modern AWS data lake. External suppliers must continue uploading daily CSV inventory feeds over SFTP using their existing SSH keys and usernames stored in an external identity provider, with files landing directly in Amazon S3. Once cataloged in the central Data Lake account, analysts in 15 separate consumer AWS accounts must query specific tables and columns in Amazon Athena with fine-grained column-level and row-level security without copying data or managing complex IAM/S3 bucket policies in every account. Which TWO services and patterns should the Solutions Architect implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Require all external suppliers to rewrite their SFTP ingestion scripts to use the AWS SDK with dedicated IAM Users and direct Amazon S3 PutObject API calls.
- **B.** Replicate the S3 data lake bucket into each of the 15 consumer accounts using S3 Same-Region Replication and write separate S3 bucket policies for column-level and row-level filtering.
- **C.** Deploy AWS Transfer Family (SFTP-enabled) backed by Amazon S3 and integrate it with a custom identity provider (via AWS Lambda or API Gateway) to authenticate existing supplier usernames and SSH keys.
- **D.** Host an open-source OpenSSH server on a single EC2 instance in a public subnet and run a cron job every hour to sync uploaded supplier CSV files to Amazon S3.
- **E.** Use AWS Lake Formation with Tag-Based Access Control (LF-TBAC) and AWS RAM to centrally govern and share Glue Data Catalog tables with column-level and row-level permissions across the 15 consumer accounts.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm phân tích bán lẻ đang di chuyển các máy chủ tiếp nhận SFTP và kho dữ liệu doanh nghiệp kế thừa on-premises lên một AWS data lake hiện đại. Các nhà cung cấp bên ngoài phải tiếp tục tải lên nguồn cấp dữ liệu tồn kho CSV hàng ngày qua SFTP bằng khóa SSH và tên người dùng hiện có lưu trong một nhà cung cấp danh tính bên ngoài, với các tệp được đưa trực tiếp vào Amazon S3. Sau khi được lập danh mục trong tài khoản Data Lake trung tâm, các nhà phân tích ở 15 AWS account tiêu thụ riêng biệt phải truy vấn các bảng và cột cụ thể trong Amazon Athena với bảo mật chi tiết ở cấp cột và cấp hàng mà không cần sao chép dữ liệu hoặc quản lý các IAM/S3 bucket policy phức tạp trong từng tài khoản. Solutions Architect nên triển khai HAI dịch vụ và mẫu hình nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Hiện đại hóa Data Ingestion & Cross-Account Data Lake Governance: dùng **AWS Transfer Family (SFTP + Custom IdP)** để thay thế máy chủ SFTP cũ ghi thẳng vào S3, và dùng **AWS Lake Formation (LF-TBAC + AWS RAM)** để chia sẻ dữ liệu cross-account kèm bảo mật mức cột/dòng không cần nhân bản dữ liệu.

- **A:** Yêu cầu bài toán nêu rõ các nhà cung cấp phải tiếp tục upload qua giao thức SFTP với SSH keys hiện có.
- **B:** S3 bucket policy chỉ kiểm soát ở mức bucket/prefix/object, không hỗ trợ column-level hay row-level security, và việc nhân bản dữ liệu sang 15 tài khoản làm tăng gấp 15 lần chi phí lưu trữ.
- **C (Đúng):** Chính xác. AWS Transfer Family cung cấp endpoint SFTP hoàn toàn do AWS quản lý, ghi dữ liệu trực tiếp vào Amazon S3 và hỗ trợ Custom Identity Provider (Lambda/API Gateway) để giữ nguyên username và SSH key hiện tại của các nhà cung cấp mà không gián đoạn tích hợp.
- **D:** Tự vận hành OpenSSH trên 1 EC2 tạo điểm lỗi đơn (SPOF), gánh nặng vá lỗi bảo mật và không phải kiến trúc hiện đại hóa serverless.
- **E (Đúng):** Chính xác. AWS Lake Formation kết hợp LF-TBAC và AWS RAM cho phép quản trị tập trung, chia sẻ bảng dữ liệu cross-account tới 15 tài khoản phân tích (Athena) với kiểm soát chi tiết tới từng cột (column-level) và từng dòng (row-level) mà không cần sao chép dữ liệu hay viết S3 bucket policy phức tạp.

</details>

### Câu 6 `hard`

A large enterprise manages 200 AWS accounts in AWS Organizations and frequently provisions new VPCs across multiple Regions. Teams have accidentally created overlapping CIDR blocks, breaking Transit Gateway connectivity. The networking team wants to centralize IPv4 address planning in a dedicated Network Services account, automate CIDR assignment when member accounts create VPCs, and audit IP utilization across the entire Organization without granting member accounts access to the management account. Which TWO actions should the Solutions Architect take? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Deploy Amazon Route 53 Resolver Inbound and Outbound Endpoints in every member account to synchronize and prevent overlapping VPC CIDR tables.
- **B.** Configure an AWS Organizations Service Control Policy (SCP) that automatically rewrites overlapping VPC CIDR blocks during CreateVpc API calls across accounts.
- **C.** Register the Network Services account as the delegated administrator for Amazon VPC IP Address Manager (IPAM) in AWS Organizations.
- **D.** Create hierarchical IPAM pools (top-level and regional pools) in the Network Services account and share them with member accounts or OUs using AWS Resource Access Manager (RAM).
- **E.** Enable AWS Config in the management account only, because AWS Config automatically blocks overlapping VPC CIDR creation across all member accounts in AWS Organizations.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp lớn quản lý 200 AWS account trong AWS Organizations và thường xuyên cấp phát các VPC mới trên nhiều Region. Các nhóm đã vô tình tạo các dải CIDR trùng lặp, làm gián đoạn kết nối Transit Gateway. Nhóm mạng muốn tập trung hóa việc lập kế hoạch địa chỉ IPv4 trong một tài khoản Network Services chuyên dụng, tự động cấp phát CIDR khi các member account tạo VPC, và kiểm toán mức sử dụng IP trên toàn Organization mà không cấp quyền truy cập management account cho các member account. Solutions Architect nên thực hiện HAI hành động nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, D**

Mẫu thiết kế chuẩn để chống trùng lặp CIDR ở quy mô đa tài khoản là **Amazon VPC IPAM** kết hợp **Delegated Administrator** (đặt ở Network account) và chia sẻ **IPAM Pools** qua **AWS RAM** để các member account tự động lấy dải IP sạch khi khởi tạo VPC.

- **A:** Route 53 Resolver dùng để phân giải tên miền DNS giữa on-premises và VPC, không liên quan đến cấp phát hay quản lý CIDR block.
- **B:** SCP chỉ có tác dụng giới hạn quyền (Allow/Deny), không thể biến đổi hay tự động viết lại tham số CIDR của API CreateVpc.
- **C (Đúng):** Chính xác. Chỉ định Network Services account làm Delegated Administrator cho Amazon VPC IPAM cho phép đội mạng quản lý, giám sát và lập kế hoạch dải IP trên toàn bộ 200 tài khoản trong AWS Organizations mà không cần đụng tới management account.
- **D (Đúng):** Chính xác. Chia sẻ các regional IPAM pool qua AWS RAM cho phép các member account tự động xin cấp phát CIDR không trùng lặp từ pool khi tạo VPC mới (qua Console, CLI hoặc CloudFormation/Terraform).
- **E:** AWS Config là công cụ kiểm soát phát hiện (detective control) chứ không ngăn chặn (preventive) việc tạo VPC trùng CIDR, và bật riêng lẻ ở management account cũng không tự theo dõi toàn Organization nếu không dùng Aggregator/Organization Rules.

</details>

### Câu 7 `medium`

A rapidly growing software company uses AWS Control Tower to manage its multi-account Landing Zone. The cloud platform team wants to standardize new account provisioning using GitOps so that every new account automatically receives custom Terraform-defined IAM roles, VPC baselines, and third-party Datadog monitoring integrations, while also enforcing both preventive guardrails (blocking root user actions) and detective guardrails (alerting on unencrypted EBS volumes). Which TWO approaches should the team implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Implement preventive controls exclusively using AWS Config rules, because AWS Config evaluates and blocks non-compliant API calls before they execute.
- **B.** Deploy AWS Control Tower Account Factory for Terraform (AFT) to automate GitOps-driven account vending and post-provisioning Terraform customizations.
- **C.** Create an IAM User with AdministratorAccess in the management account and share its access keys with every developer to run Terraform deployments from their laptops.
- **D.** Disable AWS Organizations Consolidated Billing so each Control Tower member account can be customized independently with Terraform.
- **E.** Enable AWS Control Tower preventive controls (SCPs) to block root user actions and detective controls (AWS Config rules) to detect unencrypted EBS volumes.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty phần mềm đang phát triển nhanh sử dụng AWS Control Tower để quản lý Landing Zone đa tài khoản của mình. Nhóm nền tảng đám mây muốn chuẩn hóa việc cấp phát tài khoản mới bằng GitOps sao cho mọi tài khoản mới tự động nhận được các IAM role, VPC cơ sở định nghĩa bằng Terraform tùy chỉnh và tích hợp giám sát Datadog của bên thứ ba, đồng thời thực thi cả các hàng rào phòng ngừa (chặn hành động của root user) lẫn hàng rào phát hiện (cảnh báo về EBS volume chưa mã hóa). Nhóm nên triển khai HAI phương pháp nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, E**

Trong **AWS Control Tower**, hãy nhớ: **Preventive Controls = SCPs**, **Detective Controls = AWS Config Rules / Security Hub**, và tự động hóa tùy biến tài khoản mới theo chuẩn Terraform GitOps dùng **Account Factory for Terraform (AFT)**.

- **A:** AWS Config chỉ là cơ chế phát hiện (detective), nó kiểm tra sau khi tài nguyên đã được tạo/sửa đổi chứ không chặn API call trước khi thực thi.
- **B (Đúng):** Chính xác. Account Factory for Terraform (AFT) tích hợp trực tiếp với AWS Control Tower, cung cấp quy trình GitOps tự động hóa việc cấp phát tài khoản mới và chạy các bộ Terraform customization (IAM roles, VPC baseline, tích hợp Datadog) ngay sau khi tài khoản được tạo.
- **C:** Chia sẻ khóa IAM User có quyền AdministratorAccess của management account là lỗi bảo mật nghiêm trọng và đi ngược hoàn toàn với mô hình GitOps/Control Tower.
- **D:** AWS Control Tower yêu cầu bắt buộc AWS Organizations với All Features (bao gồm Consolidated Billing) và không thể tắt tính năng này.
- **E (Đúng):** Chính xác. Trong AWS Control Tower, Preventive Controls được thực thi bằng AWS Organizations SCPs (chặn cứng hành động không được phép như root user actions), còn Detective Controls được thực thi bằng AWS Config rules (phát hiện và cảnh báo tài nguyên vi phạm như EBS chưa mã hóa).

</details>

### Câu 8 `hard`

An enterprise with 50 AWS accounts connected to an on-premises Active Directory DNS infrastructure over Direct Connect needs bidirectional hybrid DNS resolution: workloads in all 50 AWS VPCs must resolve internal corp.local domains hosted on-premises, and on-premises workstations must resolve private aws.corp.internal domains hosted in Amazon Route 53 Private Hosted Zones. The networking team wants to minimize hourly endpoint costs by avoiding deploying DNS endpoints in every spoke VPC. What is the MOST cost-effective and scalable architecture?

- **A.** Share the Route 53 Resolver Outbound Endpoint directly with all 50 spoke accounts using AWS RAM without creating a Forwarding Rule.
- **B.** Deploy Route 53 Resolver Inbound/Outbound Endpoints in Shared Services VPC, share corp.local Forwarding Rule via AWS RAM, and associate PHZs.
- **C.** Create a Route 53 Public Hosted Zone for aws.corp.internal and configure full-mesh VPC Peering to on-premises over Direct Connect.
- **D.** Deploy Route 53 Resolver Inbound and Outbound Endpoints in all 50 spoke VPCs and configure conditional forwarders on-premises pointing to all 100 endpoint IPs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp có 50 AWS account kết nối tới hạ tầng DNS Active Directory on-premises qua Direct Connect cần phân giải DNS lai hai chiều: các workload trong cả 50 AWS VPC phải phân giải tên miền nội bộ corp.local lưu trữ tại chỗ, và các máy trạm on-premises phải phân giải tên miền riêng tư aws.corp.internal lưu trữ trong Amazon Route 53 Private Hosted Zones. Nhóm mạng muốn giảm thiểu chi phí endpoint theo giờ bằng cách tránh triển khai DNS endpoint trong mọi spoke VPC. Kiến trúc tối ưu chi phí và có khả năng mở rộng NHẤT là gì?

**Đáp án đúng:** **B**

Kiến trúc **Centralized Hybrid DNS** chuẩn gồm: đặt **Inbound + Outbound Route 53 Resolver Endpoints** duy nhất tại **Shared Services VPC**, chia sẻ **Forwarding Rules** sang các spoke account bằng **AWS RAM**, và gắn **Private Hosted Zones** vào Shared Services VPC để chiều Inbound hoạt động.

- **A:** AWS RAM dùng để chia sẻ Route 53 Resolver Forwarding Rules (không chia sẻ trực tiếp đối tượng Endpoint), và nếu không có Forwarding Rule thì Route 53 Resolver sẽ không biết phải chuyển tiếp domain corp.local về IP nào ở on-premises.
- **B (Đúng):** Chính xác. Đây là mẫu Hybrid DNS tập trung chuẩn SAP-C02: chỉ cần đặt 1 Inbound Endpoint và 1 Outbound Endpoint duy nhất trong Shared Services VPC (tiết kiệm tối đa chi phí mỗi ENI/giờ), chia sẻ Outbound Forwarding Rule cho 50 tài khoản qua AWS RAM (để VPC spoke phân giải corp.local), và associate các Private Hosted Zone với Shared Services VPC (để Inbound Endpoint phân giải cho on-premises).
- **C:** Đưa bản ghi nội bộ lên Public Hosted Zone làm lộ cấu trúc mạng nội bộ ra Internet, và VPC Peering không thể kết nối tới on-premises.
- **D:** Triển khai cặp Inbound/Outbound Endpoint trong cả 50 VPC sẽ tốn hàng trăm ENI tính phí theo giờ và tạo cơn ác mộng cấu hình conditional forwarder ở on-premises.

</details>

### Câu 9 `hard`

A mid-sized fintech company separates workloads into 12 AWS member accounts for billing and IAM blast-radius isolation, yet its network engineering team is small and wants to manage only ONE centralized VPC (with a single set of NAT Gateways, VPC Endpoints, and Direct Connect attachments) without paying for Transit Gateway per-attachment fees or cross-VPC data processing charges. Application teams in the 12 member accounts must still be able to launch EC2, RDS, and Lambda resources into private subnets while remaining completely isolated from modifying VPC route tables or viewing other accounts' resources. Which VPC design achieves this?

- **A.** Attach 12 separate member account VPCs to a centralized AWS Transit Gateway with shared route tables and NAT Gateways.
- **B.** Merge all 12 AWS member accounts back into a single consolidated AWS account to share one centralized VPC and NAT Gateway.
- **C.** Create 12 separate VPCs across all member accounts and connect them in a full mesh using 66 bilateral VPC Peering connections and custom route tables.
- **D.** Create one centralized VPC in a Network Owner account and share its private subnets with the 12 accounts via AWS RAM VPC Sharing.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty fintech quy mô vừa tách các workload thành 12 AWS member account để cô lập thanh toán và phạm vi ảnh hưởng IAM, nhưng nhóm kỹ sư mạng của họ nhỏ và chỉ muốn quản lý MỘT VPC tập trung duy nhất (với một bộ NAT Gateway, VPC Endpoint và kết nối Direct Connect duy nhất) mà không phải trả phí mỗi attachment của Transit Gateway hay phí xử lý dữ liệu liên VPC. Các nhóm ứng dụng trong 12 member account vẫn phải có thể khởi chạy tài nguyên EC2, RDS và Lambda vào các private subnet trong khi hoàn toàn bị cô lập khỏi việc chỉnh sửa route table của VPC hoặc xem tài nguyên của các account khác. Thiết kế VPC nào đạt được điều này?

**Đáp án đúng:** **D**

**AWS RAM VPC Sharing** là lựa chọn tuyệt vời khi doanh nghiệp muốn **tách biệt IAM/Billing đa tài khoản** nhưng chỉ muốn **quản lý một VPC tập trung duy nhất**, tái sử dụng tối đa IPv4 CIDR, NAT Gateways, VPC Endpoints và tiết kiệm hoàn toàn phí Transit Gateway.

- **A:** Đề bài yêu cầu rõ ràng tránh trả phí Transit Gateway per-attachment và phí xử lý dữ liệu cross-VPC, đồng thời chỉ quản lý 1 VPC duy nhất.
- **B:** Gộp chung về 1 tài khoản làm mất hoàn toàn lợi ích tách biệt blast-radius IAM và billing của kiến trúc đa tài khoản.
- **C:** 12 VPC riêng biệt bắt buộc phải triển khai 12 bộ NAT Gateway và VPC Endpoints riêng (vì VPC Peering không hỗ trợ transitive routing qua NAT Gateway hay Direct Connect), tốn kém chi phí và công quản trị.
- **D (Đúng):** Chính xác. VPC Sharing qua AWS RAM cho phép một tài khoản chủ sở hữu (Network Owner) quản lý tập trung duy nhất 1 VPC (Route Tables, NAT Gateways, VPC Endpoints, Direct Connect) và chia sẻ các subnet cho các tài khoản thành viên (Participants). Các tài khoản thành viên tự tạo và quản lý EC2/RDS/Lambda của riêng họ trong subnet đó (tách biệt IAM & Billing), không thể sửa đổi cấu hình mạng VPC và hoàn toàn không tốn phí Transit Gateway.

</details>

### Câu 10 `hard`

A regulated enterprise wants developers across 60 member accounts in AWS Organizations to self-service provision pre-approved, security-hardened Amazon RDS clusters and Amazon EMR clusters. However, security policy strictly forbids granting developers direct IAM permissions to call rds:CreateDBCluster, emr:RunJobFlow, or iam:CreateRole. Instead, developers must only be able to launch centrally vetted templates managed by the Cloud Engineering team. Which TWO AWS Service Catalog configurations should the Solutions Architect implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Grant developers PowerUserAccess in IAM Identity Center and instruct them to only launch CloudFormation templates stored in a central S3 bucket.
- **B.** Configure Service Catalog Launch Constraints (referencing a local IAM role in each spoke account) so Service Catalog provisions RDS/EMR on the user's behalf.
- **C.** Deploy AWS Systems Manager State Manager to let developers launch RDS clusters directly from the RDS Console.
- **D.** Create a Service Catalog Portfolio of vetted CloudFormation products in a hub account and share it across the Organization using Organizations integration.
- **E.** Use AWS Service Catalog TagOptions exclusively, because TagOptions automatically grant temporary rds:CreateDBCluster and emr:RunJobFlow permissions to developers.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp chịu quản lý chặt chẽ muốn các lập trình viên trên 60 member account trong AWS Organizations tự phục vụ cấp phát các cụm Amazon RDS và cụm Amazon EMR đã được phê duyệt trước và tăng cường bảo mật. Tuy nhiên, chính sách bảo mật nghiêm cấm cấp trực tiếp quyền IAM cho lập trình viên để gọi rds:CreateDBCluster, emr:RunJobFlow hoặc iam:CreateRole. Thay vào đó, lập trình viên chỉ được phép khởi chạy các template đã được thẩm định tập trung do nhóm Cloud Engineering quản lý. Solutions Architect nên triển khai HAI cấu hình AWS Service Catalog nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

**AWS Service Catalog** (chia sẻ Portfolio qua **AWS Organizations**) kết hợp **Launch Constraints** là giải pháp chuẩn mực để cung cấp **Self-Service có kiểm soát**: lập trình viên triển khai được hạ tầng phức tạp mà **không cần bất kỳ quyền tạo tài nguyên trực tiếp (EC2/RDS/EMR/IAM)** nào.

- **A:** Cấp PowerUserAccess vi phạm trực tiếp yêu cầu cấm cấp quyền rds:CreateDBCluster và emr:RunJobFlow cho lập trình viên.
- **B (Đúng):** Chính xác. Launch Constraints là tính năng cốt lõi của AWS Service Catalog cho phép người dùng cuối (developers) chỉ cần quyền tối thiểu của Service Catalog (không cần quyền rds:CreateDBCluster, emr:RunJobFlow hay iam:CreateRole) nhưng vẫn triển khai được tài nguyên chuẩn bảo mật thông qua IAM Role được gắn trong Launch Constraint.
- **C:** SSM State Manager dùng để duy trì cấu hình máy chủ EC2, không cho phép lập trình viên self-service tạo RDS/EMR mà không có quyền IAM trực tiếp.
- **D (Đúng):** Chính xác. Tạo Portfolio tập trung chứa các sản phẩm CloudFormation đã được thẩm định bảo mật trong tài khoản hub và chia sẻ toàn Organization/OU qua tích hợp AWS Service Catalog + AWS Organizations giúp phân phối sản phẩm đồng bộ cho 60 tài khoản.
- **E:** TagOptions chỉ dùng để bắt buộc gắn tag chuẩn hóa lên tài nguyên khi khởi tạo qua Service Catalog, không có chức năng ủy quyền IAM như Launch Constraints.

</details>

### Câu 11 `medium`

A company has 30 AWS accounts in AWS Organizations and an on-premises data center connected via AWS Direct Connect to a Shared Services VPC. Workloads in all 30 accounts need to resolve private DNS records hosted on on-premises Active Directory DNS servers (corp.internal), and on-premises users need to resolve records in an Amazon Route 53 Private Hosted Zone (aws.internal). Which architecture meets these requirements with the LOWEST operational overhead and cost?

- **A.** Deploy Route 53 Resolver Inbound and Outbound endpoints in the Shared Services VPC, associate the Private Hosted Zone with the Shared Services VPC, and share the Outbound Resolver forwarding rules with all member accounts via AWS RAM.
- **B.** Run self-managed BIND DNS forwarder EC2 instances in Auto Scaling groups in every member account and replicate DNS zones across all VPCs over the AWS Direct Connect connection.
- **C.** Deploy Route 53 Resolver Inbound and Outbound endpoints in every member account VPC, configure conditional forwarders in each account, and replicate Private Hosted Zone records manually across all 30 accounts.
- **D.** Create a Route 53 Public Hosted Zone for aws.internal, configure full-mesh VPC Peering between all 30 accounts and the Shared Services VPC, and forward DNS queries over the internet.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có 30 AWS account trong AWS Organizations và một trung tâm dữ liệu on-premises kết nối qua AWS Direct Connect tới một Shared Services VPC. Các workload trong cả 30 account cần phân giải các bản ghi DNS nội bộ được lưu trữ trên máy chủ DNS Active Directory on-premises (corp.internal), và người dùng on-premises cần phân giải các bản ghi trong một Amazon Route 53 Private Hosted Zone (aws.internal). Kiến trúc nào đáp ứng các yêu cầu này với chi phí vận hành và tiền bạc THẤP NHẤT?

**Đáp án đúng:** **A**

Mô hình chuẩn cho Hybrid DNS đa tài khoản là tập trung **Route 53 Resolver Inbound & Outbound Endpoints** tại một tài khoản Shared Services/Network duy nhất, sau đó chia sẻ **Forwarding Rules** sang toàn bộ member accounts bằng **AWS RAM**.

- **A (Đúng):** Chính xác. Tập trung Inbound/Outbound endpoints tại Shared Services VPC và dùng AWS Resource Access Manager (RAM) chia sẻ Outbound Forwarding Rules cho toàn bộ Organization là kiến trúc Hybrid DNS chuẩn nhất và tiết kiệm chi phí nhất.
- **B:** Tự vận hành BIND trên EC2 ở 30 tài khoản làm tăng nặng chi phí quản trị, vá lỗi và rủi ro downtime so với Route 53 Resolver managed service.
- **C:** Triển khai Inbound và Outbound endpoints ở tất cả 30 tài khoản gây lãng phí chi phí cực lớn (tính phí theo giờ cho mỗi ENI) và tốn rất nhiều công sức vận hành.
- **D:** Public Hosted Zone làm lộ bản ghi DNS nội bộ ra Internet và không giải quyết được nhu cầu phân giải domain corp.internal từ AWS về on-premises.

</details>

### Câu 12 `medium`

A media company operates 12 AWS accounts within AWS Organizations. Application teams in different accounts exchange terabytes of data daily between EC2 instances in the same AWS Region. Currently, each account has its own VPC connected via an AWS Transit Gateway, resulting in high Transit Gateway data processing charges and IP address fragmentation. The company wants to eliminate Transit Gateway data processing fees between these accounts while maintaining strict IAM resource isolation per account. What should a Solutions Architect recommend?

- **A.** Replace the centralized AWS Transit Gateway with full-mesh VPC Peering connections between all 12 member accounts and update every subnet route table individually.
- **B.** Consolidate all 12 AWS accounts into a single AWS Organizations Management account and deploy all application workloads inside one shared multi-AZ VPC.
- **C.** Deploy AWS PrivateLink Interface VPC Endpoints and Network Load Balancers in each account so EC2 instances communicate privately across VPCs.
- **D.** Create a centralized VPC in a Network account and share its subnets with the 12 member accounts using AWS Resource Access Manager (RAM).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty truyền thông vận hành 12 AWS account trong AWS Organizations. Các nhóm ứng dụng ở các account khác nhau trao đổi hàng terabyte dữ liệu mỗi ngày giữa các EC2 instance trong cùng một AWS Region. Hiện tại, mỗi account có VPC riêng được kết nối qua một AWS Transit Gateway, dẫn đến chi phí xử lý dữ liệu Transit Gateway cao và phân mảnh địa chỉ IP. Công ty muốn loại bỏ phí xử lý dữ liệu Transit Gateway giữa các account này trong khi vẫn duy trì cách ly tài nguyên IAM nghiêm ngặt theo từng account. Solutions Architect nên đề xuất gì?

**Đáp án đúng:** **D**

**VPC Sharing thông qua AWS RAM** là lựa chọn tối ưu khi nhiều AWS accounts trong cùng tổ chức cần giao tiếp lưu lượng lớn trong cùng Region: tiết kiệm tối đa phí data transfer của Transit Gateway, dùng chung dải IP hiệu quả và vẫn đảm bảo tính độc lập về IAM ownership của từng tài khoản.

- **A:** Full-mesh VPC Peering cho 12 VPC cần tới 66 kết nối (N*(N-1)/2), rất khó quản trị và vẫn không giải quyết được vấn đề phân mảnh dải IP.
- **B:** Gom toàn bộ vào 1 account phá vỡ ranh giới cách ly IAM, billing và blast radius giữa các team, vi phạm yêu cầu giữ IAM isolation theo từng account.
- **C:** PrivateLink vẫn tính phí theo giờ cho mỗi endpoint và phí xử lý dữ liệu theo GB, đồng thời không giải quyết bài toán phân mảnh IP.
- **D (Đúng):** Chính xác. VPC Sharing qua AWS RAM cho phép nhiều tài khoản triển khai EC2 trong cùng subnet/VPC, loại bỏ hoàn toàn phí Transit Gateway data processing, tối ưu hóa dải IP, trong khi mỗi tài khoản vẫn sở hữu và cách ly tài nguyên EC2/Security Group của riêng mình qua IAM.

</details>

### Câu 13 `medium`

An enterprise platform team wants developers across 50 AWS accounts to self-provision approved, compliant architectures (such as encrypted RDS databases and standardized EKS clusters). However, security policy strictly prohibits granting developers direct IAM permissions to call rds:*, eks:*, or ec2:* APIs. Which AWS service and configuration meets this requirement?

- **A.** Use AWS CloudFormation StackSets from the Management account to grant developers direct self-service deployment access across all 50 member accounts.
- **B.** Grant developers full administrative permissions via IAM Identity Center and rely on AWS Config detective rules with SSM Automation runbooks to delete non-compliant resources.
- **C.** Package the approved CloudFormation templates as AWS Service Catalog Products, share the Portfolio across AWS Organizations, and configure Launch Constraints with dedicated IAM roles.
- **D.** Publish approved AWS CloudFormation templates in a centralized Amazon S3 bucket and grant developers direct cloudformation:CreateStack IAM permissions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm nền tảng doanh nghiệp muốn các lập trình viên trên 50 AWS account có thể tự cấp phát các kiến trúc tuân thủ đã được phê duyệt (như cơ sở dữ liệu RDS được mã hóa và các cụm EKS chuẩn hóa). Tuy nhiên, chính sách bảo mật nghiêm cấm cấp trực tiếp quyền IAM cho lập trình viên để gọi các API rds:*, eks:* hoặc ec2:*. Dịch vụ AWS và cấu hình nào đáp ứng yêu cầu này?

**Đáp án đúng:** **C**

**AWS Service Catalog** với **Launch Constraints** là giải pháp chuẩn của AWS cho mô hình *Self-Service Infrastructure with Least Privilege*: nhà phát triển tự khởi tạo kiến trúc chuẩn đã duyệt mà không cần bất kỳ quyền IAM trực tiếp nào lên các dịch vụ bên dưới.

- **A:** StackSets dành cho quản trị viên triển khai hạ tầng nền tảng đồng loạt xuống các tài khoản, không phải cổng self-service cho developer và tuyệt đối không cấp quyền truy cập Management Account cho developer.
- **B:** Cấp toàn quyền rồi mới kiểm tra sau (detective) vi phạm trực tiếp yêu cầu bảo mật cấm cấp quyền `rds:*`, `eks:*`, `ec2:*` cho developer.
- **C (Đúng):** Chính xác. AWS Service Catalog kết hợp Launch Constraints cho phép gán một IAM Role chuyên biệt cho từng Product. Developer chỉ cần quyền khởi chạy Product trên Service Catalog mà hoàn toàn không cần quyền trực tiếp trên RDS, EKS hay EC2.
- **D:** Khi developer chạy CloudFormation trực tiếp bằng quyền của chính họ, CloudFormation sẽ thất bại nếu developer không có quyền `rds:*` hoặc `eks:*` (trừ khi cấu hình phức tạp hơn với pass-role bị hạn chế).

</details>

### Câu 14 `hard`

A large enterprise uses AWS Organizations with AWS Control Tower. The security team needs to automatically deploy a baseline set of IAM roles and CloudWatch alarms whenever a new AWS account is added to the Production OU, and also ensure that a third-party cloud security posture management (CSPM) SaaS vendor can safely audit all accounts without risking the Confused Deputy problem. Which TWO actions should the Solutions Architect take? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Configure the cross-account IAM audit role's trust policy to require a unique sts:ExternalId condition provided by the SaaS vendor.
- **B.** Create an IAM user with static access keys in each account and share the keys with the CSPM vendor via AWS Secrets Manager.
- **C.** Attach a Service Control Policy (SCP) to the Production OU that automatically executes CloudFormation templates upon account creation.
- **D.** Use AWS KMS Imported Key Material to sign all API calls made by the third-party CSPM vendor.
- **E.** Use AWS CloudFormation StackSets with service-managed permissions and auto-deployment enabled targeting the Production OU.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp lớn sử dụng AWS Organizations cùng với AWS Control Tower. Nhóm bảo mật cần tự động triển khai một bộ cơ sở gồm các IAM role và CloudWatch alarm bất cứ khi nào một AWS account mới được thêm vào Production OU, đồng thời đảm bảo một nhà cung cấp SaaS quản lý tư thế bảo mật đám mây (CSPM) bên thứ ba có thể kiểm toán an toàn tất cả các account mà không gặp rủi ro Confused Deputy. Solutions Architect nên thực hiện HAI hành động nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, E**

Bài toán kết hợp hai best practice trọng tâm của Domain 2: **CloudFormation StackSets (Service-Managed + Auto-Deployment)** để tự động triển khai baseline cho tài khoản mới trong OU, và **Cross-Account Role + `sts:ExternalId`** để ngăn chặn lỗ hổng **Confused Deputy** với đối tác SaaS.

- **A (Đúng):** Chính xác. Điều kiện `sts:ExternalId` trong Trust Policy của Cross-Account Role là biện pháp chuẩn bắt buộc để chống tấn công Confused Deputy khi tích hợp với đối tác SaaS bên thứ ba.
- **B:** Tuyệt đối không dùng IAM User và static access keys lâu dài cho tích hợp bên thứ ba; luôn sử dụng STS AssumeRole với thông tin xác thực tạm thời.
- **C:** SCP chỉ có tác dụng giới hạn quyền (guardrail), không có khả năng khởi chạy hay triển khai tài nguyên CloudFormation.
- **D:** KMS Imported Key Material dùng để mã hóa dữ liệu, không liên quan đến cơ chế xác thực STS hay phòng chống Confused Deputy.
- **E (Đúng):** Chính xác. CloudFormation StackSets với Service-Managed Permissions và Auto-Deployment tự động triển khai baseline stack ngay lập tức mỗi khi có tài khoản mới gia nhập Production OU.

</details>

---

[Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md)
