# Bài tập tình huống — Chủ đề 8: Multi-Account IaC & CI/CD Automation — CloudFormation StackSets, CDK, CodePipeline Cross-Account & Deployment Strategies

> CloudFormation StackSets (Service-Managed vs Self-Managed), Cross-Account CodePipeline với CMK, Blue/Green, Canary & Linear deployments.
> **Số câu hỏi:** 7 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A platform engineering team manages 120 AWS accounts organized into Organizational Units (OUs) in AWS Organizations. They need to deploy and maintain a standard set of Amazon EventBridge rules and IAM read-only audit roles across all existing and future accounts in the Production and Staging OUs. The team wants to manage deployments from a dedicated Security Tooling member account rather than the Organizations Management account, without manually creating IAM execution roles in every target account. Which CloudFormation StackSets configuration should they use?

- **A.** Use AWS Systems Manager Distributor and State Manager associations to push CloudFormation templates to all accounts in the Production and Staging OUs.
- **B.** Create a StackSet with Service-Managed permissions directly inside the Management account because Delegated Administrators cannot deploy IAM audit roles.
- **C.** Register Security Tooling as a Delegated Administrator for CloudFormation StackSets and create a Service-Managed StackSet targeting Production and Staging OUs.
- **D.** Configure CloudFormation StackSets with Self-Managed permissions in the Security Tooling account and enable Automatic Deployment on the Production and Staging OUs without IAM roles.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ sư nền tảng quản lý 120 AWS account được tổ chức thành các Organizational Unit (OU) trong AWS Organizations. Họ cần triển khai và duy trì một bộ quy tắc Amazon EventBridge chuẩn và các IAM role kiểm toán chỉ đọc trên tất cả các account hiện có và tương lai trong Production OU và Staging OU. Nhóm muốn quản lý việc triển khai từ một Security Tooling member account chuyên dụng thay vì Organizations Management account, mà không cần tạo thủ công các IAM execution role trong từng tài khoản đích. Họ nên sử dụng cấu hình CloudFormation StackSets nào?

**Đáp án đúng:** **C**

Trong môi trường AWS Organizations, **CloudFormation StackSets với Service-Managed permissions + Delegated Administrator** là best practice để tự động hóa triển khai hạ tầng theo OU mà không cần tự quản lý IAM execution roles hay sử dụng Management account.

- **A:** Systems Manager Distributor dùng để phân phối gói phần mềm lên các EC2/managed instances, không dùng để triển khai CloudFormation stacks đa tài khoản.
- **B:** Delegated Administrator hoàn toàn có thể triển khai IAM resources (với CAPABILITY_IAM/CAPABILITY_NAMED_IAM) cho member accounts trong phạm vi OU được ủy quyền; không nên vận hành hàng ngày trong Management account.
- **C (Đúng):** Chính xác. Service-Managed permissions tích hợp sâu với AWS Organizations: tự động tạo IAM roles cần thiết ở các tài khoản đích, hỗ trợ Automatic Deployment (tự triển khai khi có tài khoản mới gia nhập OU và tự xóa khi rời OU), và hỗ trợ ủy quyền quản trị (Delegated Administrator) cho member account như Security Tooling.
- **D:** Self-Managed permissions yêu cầu bạn phải tự tạo IAM administration role và execution role ở từng tài khoản đích, đồng thời KHÔNG hỗ trợ Automatic Deployment theo OU.

</details>

### Câu 2 `hard`

A DevOps team hosts a centralized CI/CD pipeline using AWS CodePipeline in a Shared Tools account to deploy AWS CloudFormation stacks into separate Development, Staging, and Production accounts. The pipeline stores build artifacts in an Amazon S3 bucket in the Shared Tools account. Security mandates that all pipeline artifacts must be encrypted at rest with a customer-managed key and that deployments into the Production account follow least privilege. Which TWO configurations are required for this cross-account pipeline to succeed? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Configure an AWS Organizations Service Control Policy (SCP) to grant the CodePipeline service role direct write access to the Production account without assuming an IAM role.
- **B.** Encrypt the S3 artifact bucket with a customer-managed AWS KMS key whose key policy grants kms:Decrypt and kms:DescribeKey to the cross-account IAM deployment roles in the target accounts.
- **C.** Create a cross-account IAM role in each target account trusting Shared Tools, plus a CloudFormation service role in each target account to provision stack resources.
- **D.** Replicate the S3 artifact bucket into every target account using S3 Cross-Region Replication and KMS re-encryption before CodePipeline invokes CloudFormation.
- **E.** Use the default AWS-managed S3 KMS key (aws/s3) on the artifact bucket and attach an S3 bucket policy allowing cross-account read access from the target account VPCs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm DevOps lưu trữ pipeline CI/CD tập trung bằng AWS CodePipeline trong tài khoản Shared Tools để triển khai các AWS CloudFormation stack vào các tài khoản Development, Staging và Production riêng biệt. Pipeline lưu các build artifact trong một Amazon S3 bucket tại tài khoản Shared Tools. Bộ phận bảo mật yêu cầu tất cả pipeline artifact phải được mã hóa khi lưu trữ bằng customer-managed key và việc triển khai vào tài khoản Production phải tuân thủ nguyên tắc đặc quyền tối thiểu. Cần HAI cấu hình nào để pipeline đa tài khoản này hoạt động thành công? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, C**

Kiến trúc **Multi-Account CI/CD với CodePipeline** bắt buộc phải có: (1) S3 artifact bucket mã hóa bằng **KMS Customer Managed Key (CMK)** có key policy cho phép target accounts giải mã, và (2) cặp **Cross-Account IAM Role** (cho CodePipeline assume) + **CloudFormation Service Role** tại từng tài khoản đích.

- **A:** SCP không bao giờ cấp quyền (grant permissions); SCP chỉ giới hạn quyền tối đa và không thể thay thế cơ chế STS AssumeRole cross-account.
- **B (Đúng):** Chính xác. Không thể dùng AWS-managed key (aws/s3) cho truy cập cross-account vì không sửa được key policy. Phải dùng Customer Managed Key (CMK) và cấp quyền Decrypt/DescribeKey trong key policy cho các IAM role của tài khoản đích (Dev/Stage/Prod) để chúng đọc được artifact.
- **C (Đúng):** Chính xác. CodePipeline ở Tools account cần assume một cross-account role trong Production account để gọi CloudFormation action, và CloudFormation action đó sử dụng một CloudFormation execution/service role riêng trong Production account để tạo tài nguyên theo đúng nguyên tắc least privilege.
- **D:** Không cần sao chép S3 bucket sang từng tài khoản; các target account đọc trực tiếp artifact từ bucket trung tâm thông qua bucket policy và KMS key policy.
- **E:** AWS-managed key (aws/s3) không cho phép chia sẻ cross-account, và không bao giờ dùng public read access cho bucket chứa build artifacts.

</details>

### Câu 3 `medium`

A managed service provider (MSP) needs to deploy a standardized monitoring CloudFormation template into 25 customer AWS accounts that belong to completely different AWS Organizations (and some standalone accounts). The MSP wants to manage updates, rollback thresholds, and drift detection centrally from its own Operations AWS account. Which CloudFormation StackSets permission model and deployment configuration should the MSP use?

- **A.** Share the CloudFormation template via AWS Resource Access Manager (RAM) because AWS RAM automatically deploys CloudFormation stacks into external accounts.
- **B.** Use StackSets with Self-Managed permissions by creating StackSetAdministrationRole in the MSP account and StackSetExecutionRole in each of the 25 customer accounts.
- **C.** Use AWS Control Tower Account Factory to enroll all 25 external customer accounts into the MSP's AWS Organization automatically without customer consent.
- **D.** Use CloudFormation StackSets with Service-Managed permissions because Service-Managed permissions work seamlessly across different external AWS Organizations and standalone accounts.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà cung cấp dịch vụ được quản lý (MSP) cần triển khai một CloudFormation template giám sát chuẩn hóa vào 25 AWS account của khách hàng thuộc các AWS Organizations hoàn toàn khác nhau (và một số tài khoản độc lập). MSP muốn quản lý các bản cập nhật, ngưỡng rollback và phát hiện sai lệch cấu hình (drift detection) tập trung từ tài khoản Operations AWS của riêng mình. MSP nên sử dụng mô hình cấp quyền và cấu hình triển khai CloudFormation StackSets nào?

**Đáp án đúng:** **B**

Phân biệt rõ 2 mô hình **CloudFormation StackSets**: dùng **Service-Managed** khi tất cả tài khoản nằm trong CÙNG AWS Organization (hỗ trợ auto-deploy theo OU); dùng **Self-Managed** khi triển khai tới tài khoản độc lập hoặc nằm khác AWS Organization (như kịch bản MSP/Partner).

- **A:** AWS RAM không có tính năng tự động triển khai CloudFormation stacks.
- **B (Đúng):** Chính xác. Khi triển khai StackSets tới các tài khoản nằm ngoài AWS Organization của bạn (tài khoản khách hàng độc lập hoặc thuộc Organization khác), bắt buộc phải dùng mô hình Self-Managed permissions với cặp IAM role: AdministrationRole tại tài khoản quản trị (MSP) và ExecutionRole tại mỗi tài khoản đích.
- **C:** Các tài khoản khách hàng thuộc các AWS Organizations độc lập khác nhau; không thể và không nên gộp chúng vào chung Organization của MSP chỉ để triển khai monitoring template.
- **D:** Service-Managed permissions CHỈ hoạt động bên trong CÙNG MỘT AWS Organization (quản lý từ Management account hoặc Delegated Administrator của Organization đó).

</details>

### Câu 4 `hard`

A conglomerate recently acquired three technology companies whose production VPCs across 15 AWS accounts all use the same overlapping 10.0.0.0/16 CIDR block. Microservices running on Amazon EKS, AWS Lambda, and Amazon EC2 in these accounts must securely communicate over HTTP/gRPC with fine-grained IAM authorization and weighted canary traffic routing, without re-IPing any VPCs or managing complex NAT/proxy fleets. Which AWS networking solution best meets these requirements with the LEAST operational overhead?

- **A.** Create an Amazon VPC Lattice service network, associate all 15 VPCs, register services and target groups, and enforce IAM auth policies with weighted routing.
- **B.** Attach all 15 VPCs to an AWS Transit Gateway and configure static NAT appliances in a centralized inspection VPC to translate overlapping 10.0.0.0/16 IP addresses across accounts.
- **C.** Expose every microservice through an Internet-facing Application Load Balancer protected by AWS WAF and restrict access using Elastic IP allowlists.
- **D.** Establish full-mesh VPC Peering connections between all 15 VPCs and deploy Envoy sidecar proxies with AWS App Mesh in every member account.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tập đoàn gần đây đã mua lại ba công ty công nghệ có các VPC production trên 15 AWS account đều sử dụng cùng dải CIDR trùng lặp 10.0.0.0/16. Các microservice chạy trên Amazon EKS, AWS Lambda và Amazon EC2 trong các account này phải giao tiếp an toàn qua HTTP/gRPC với phân quyền IAM chi tiết và định tuyến lưu lượng canary theo trọng số, mà không cần đổi dải IP cho bất kỳ VPC nào hay quản lý các cụm NAT/proxy phức tạp. Giải pháp mạng AWS nào đáp ứng tốt nhất các yêu cầu này với chi phí vận hành THẤP NHẤT?

**Đáp án đúng:** **A**

**Amazon VPC Lattice** là giải pháp tối ưu cho bài toán giao tiếp microservice xuyên tài khoản/xuyên VPC có **overlapping CIDR**, hỗ trợ đa dạng compute (EC2, EKS, ECS, Lambda), tích hợp sẵn **IAM Auth Policies** và **weighted routing** mà không cần quản lý hạ tầng mạng phức tạp.

- **A (Đúng):** Chính xác. Amazon VPC Lattice là dịch vụ application-layer networking (L7) được quản lý hoàn toàn, tự động xử lý các VPC có CIDR trùng lặp (overlapping CIDRs) xuyên tài khoản mà không cần re-IP hay dựng NAT. Nó hỗ trợ trực tiếp EKS, Lambda, EC2, xác thực IAM ở mức request (auth policies), và phân bổ lưu lượng theo trọng số (weighted routing) cho canary deployment.
- **B:** Transit Gateway không thể định tuyến trực tiếp giữa các VPC trùng CIDR (overlapping CIDRs). Việc dựng cụm thiết bị NAT tập trung để dịch địa chỉ IP cho 15 VPC vừa tốn nhiều công sức vận hành (high operational overhead), vừa không cung cấp xác thực IAM ở tầng ứng dụng hay canary traffic routing.
- **C:** Đưa giao tiếp nội bộ giữa các microservice ra Internet công cộng làm tăng bề mặt tấn công, tăng chi phí data transfer và không đáp ứng xác thực IAM tinh gọn ở mức dịch vụ.
- **D:** VPC Peering hoàn toàn không hỗ trợ các VPC có dải CIDR trùng lặp nhau.

</details>

### Câu 5 `medium`

A security engineering team must deploy a standardized set of Amazon GuardDuty, AWS Config, and IAM Password Policy resources to 80 member accounts across 4 AWS Regions inside AWS Organizations. Whenever a new account is created and placed in the Workloads OU, these security baselines must be deployed automatically without manual intervention, except for two legacy accounts inside the Workloads OU that must be excluded. Which deployment strategy meets these requirements?

- **A.** Create a Service-Managed StackSet targeting the Workloads OU with Automatic Deployment enabled, and set AccountFilterType to DIFFERENCE to exclude the two legacy accounts.
- **B.** Use AWS Systems Manager Distributor to push the CloudFormation templates to all member accounts.
- **C.** Create an AWS CloudFormation StackSet with Self-Managed permissions and run an EventBridge scheduled Lambda function to detect new accounts and call CreateStackInstances.
- **D.** Publish the CloudFormation security baseline template in AWS Service Catalog and require each member account owner to launch the product manually.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ sư bảo mật phải triển khai một bộ tài nguyên chuẩn hóa gồm Amazon GuardDuty, AWS Config và IAM Password Policy tới 80 member account trên 4 AWS Region trong AWS Organizations. Bất cứ khi nào một tài khoản mới được tạo và đặt vào Workloads OU, các cấu hình bảo mật cơ sở này phải được triển khai tự động mà không cần can thiệp thủ công, ngoại trừ hai tài khoản kế thừa bên trong Workloads OU phải được loại trừ. Chiến lược triển khai nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **A**

**AWS CloudFormation StackSets (Service-Managed Permissions)** với **Auto-Deployment** và bộ lọc **AccountFilterType (DIFFERENCE / INTERSECTION)** là công cụ chuẩn để triển khai baseline đa tài khoản/đa Region tự động theo OU trong AWS Organizations.

- **A (Đúng):** Chính xác. CloudFormation StackSets với Service-Managed permissions tích hợp trực tiếp với AWS Organizations, hỗ trợ Automatic Deployment (tự động triển khai khi có tài khoản mới gia nhập OU) và hỗ trợ tham số AccountFilterType = DIFFERENCE để loại trừ chính xác 2 tài khoản legacy trong cùng OU.
- **B:** SSM Distributor dùng để phân phối gói phần mềm (software packages/agents) lên EC2 instances, không dùng để triển khai CloudFormation templates ở cấp độ AWS account.
- **C:** Self-Managed permissions đòi hỏi tự tạo IAM execution role ở từng tài khoản và tự viết script Lambda theo dõi tài khoản mới — tốn nhiều công vận hành hơn so với Service-Managed StackSets.
- **D:** Yêu cầu chủ tài khoản tự triển khai thủ công không đáp ứng yêu cầu tự động hóa (automatic deployment) và không đảm bảo tính tuân thủ bắt buộc.

</details>

### Câu 6 `medium`

A retail chain operates 25 legacy Java Spring Boot and ASP.NET Core web applications running on on-premises virtual machines. The company wants to quickly replatform these applications into Docker containers running on Amazon ECS and Amazon EKS with standardized Dockerfiles, Kubernetes manifests/ECS task definitions, and automated AWS CodePipeline CI/CD pipelines—without requiring developers to manually write containerization artifacts from scratch for each application. Which AWS tool automates this process?

- **A.** AWS Elastic Beanstalk
- **B.** AWS Migration Hub Refactor Spaces
- **C.** AWS Application Discovery Service
- **D.** AWS App2Container (A2C)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một chuỗi bán lẻ vận hành 25 ứng dụng web Java Spring Boot và ASP.NET Core kế thừa chạy trên các máy ảo on-premises. Công ty muốn nhanh chóng chuyển đổi nền tảng (replatform) các ứng dụng này thành các Docker container chạy trên Amazon ECS và Amazon EKS với Dockerfile chuẩn hóa, Kubernetes manifest/ECS task definition và pipeline CI/CD AWS CodePipeline tự động—mà không yêu cầu lập trình viên viết thủ công các tệp đóng gói container từ đầu cho từng ứng dụng. Công cụ AWS nào tự động hóa quy trình này?

**Đáp án đúng:** **D**

**AWS App2Container (A2C)** là công cụ chuyên dụng để hiện đại hóa/Replatform nhanh các ứng dụng **Java và .NET** đang chạy trên VM sang **Docker containers trên Amazon ECS/EKS** kèm tự động sinh **CI/CD pipeline**.

- **A:** Elastic Beanstalk là nền tảng PaaS để chạy ứng dụng từ mã nguồn/gói build sẵn, không phải công cụ phân tích VM on-premises để tự động container hóa và sinh manifest cho EKS/ECS.
- **B:** Refactor Spaces dùng để dựng tầng định tuyến Strangler Fig giữa monolith và microservices, không phải công cụ tự động đóng gói ứng dụng Java/.NET thành Docker container.
- **C:** Application Discovery Service chỉ thu thập thông tin cấu hình máy chủ, mức sử dụng tài nguyên và phụ thuộc mạng để lập kế hoạch di chuyển, không đóng gói ứng dụng thành container.
- **D (Đúng):** Chính xác. AWS App2Container (A2C) là công cụ dòng lệnh tự động phân tích các ứng dụng Java và .NET đang chạy trên máy chủ vật lý/VM on-premises hoặc EC2, tự động trích xuất đóng gói thành container image (Dockerfile), sinh sẵn ECS Task Definition / EKS Kubernetes manifests và tạo luôn pipeline CI/CD trên AWS CodePipeline.

</details>

### Câu 7 `hard`

A company centralizes its CI/CD pipeline in a Shared Tooling account using AWS CodePipeline and AWS CodeBuild. The pipeline deploys CloudFormation stacks to a separate Production account using a cross-account IAM deployment role. When the pipeline runs, the deploy stage in the Production account fails with an AccessDenied error while attempting to read the build artifact from the S3 artifact bucket in the Tooling account. The S3 bucket uses default SSE-KMS encryption with the AWS-managed key (aws/s3). What is the root cause and fix?

- **A.** AWS CodePipeline does not support cross-account CloudFormation deployments; move the entire CodePipeline and CodeBuild project into the Production account.
- **B.** The cross-account Production deployment IAM role is missing the AdministratorAccess AWS managed policy; attach AdministratorAccess directly to the deployment role.
- **C.** AWS-managed KMS keys cannot have their key policies modified for cross-account access; switch the S3 artifact bucket to a Customer Managed Key (CMK) and grant kms:Decrypt to the Production deployment role.
- **D.** Disable S3 Block Public Access on the artifact bucket in the Tooling account and attach a bucket policy allowing the Production account to download over HTTPS.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty tập trung hóa pipeline CI/CD của mình trong một Shared Tooling account bằng AWS CodePipeline và AWS CodeBuild. Pipeline triển khai các CloudFormation stack tới một Production account riêng biệt bằng một cross-account IAM deployment role. Khi pipeline chạy, giai đoạn deploy trong Production account bị lỗi AccessDenied khi cố gắng đọc build artifact từ S3 artifact bucket trong Tooling account. S3 bucket sử dụng mã hóa SSE-KMS mặc định với khóa do AWS quản lý (aws/s3). Nguyên nhân gốc rễ và cách khắc phục là gì?

**Đáp án đúng:** **C**

Một bẫy cực kỳ phổ biến trong bài thi SAP-C02 về Multi-Account CI/CD: mọi tài nguyên chia sẻ xuyên tài khoản có mã hóa KMS (như CodePipeline S3 Artifact Bucket, EBS Snapshots, RDS Snapshots) **bắt buộc phải dùng Customer Managed Key (CMK)** thay vì AWS-managed key.

- **A:** CodePipeline hoàn toàn hỗ trợ triển khai cross-account thông qua STS AssumeRole; không cần nhân bản pipeline sang Production account.
- **B:** Ngay cả khi gắn AdministratorAccess ở Production account, nó vẫn không thể giải mã AWS-managed key (`aws/s3`) nằm ở Tooling account.
- **C (Đúng):** Chính xác. Không thể sửa Key Policy của AWS-managed key (`aws/s3`) để cấp quyền cho tài khoản khác. Bắt buộc phải chuyển sang KMS Customer Managed Key (CMK) và cấp quyền `kms:Decrypt` cùng S3 Bucket Policy cho Production role.
- **D:** Mở public artifact bucket là lỗ hổng bảo mật nghiêm trọng làm lộ mã nguồn và cấu hình hạ tầng.

</details>

---

[Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md)
