# AWS Control Tower, CfCT, AFT, Service Catalog & AWS RAM

Trong kỳ thi **AWS Certified Solutions Architect - Professional (SAP-C02)**, bài toán thiết kế **Multi-Account Landing Zone** ở quy mô doanh nghiệp xuất hiện với tần suất rất cao. Doanh nghiệp không chỉ cần tạo tài khoản nhanh chóng mà còn phải tự động áp dụng **guardrails**, triển khai **baseline infrastructure** (VPC, IAM, logging), quản trị danh mục sản phẩm chuẩn hóa (**Service Catalog**), và chia sẻ tài nguyên xuyên tài khoản (**AWS RAM**).

---

## 1. AWS Control Tower & Landing Zone Architecture

**AWS Control Tower** là dịch vụ managed giúp thiết lập và quản trị môi trường multi-account an toàn (Landing Zone) dựa trên best practices của AWS, điều phối nhiều dịch vụ nền tảng như **AWS Organizations**, **AWS IAM Identity Center**, **AWS Service Catalog**, **AWS CloudTrail**, **AWS Config**, và **AWS CloudFormation StackSets**.

### Cấu trúc Core Accounts & OUs mặc định

| Thành phần | Tài khoản / OU | Chức năng cốt lõi |
| :--- | :--- | :--- |
| **Management Account** | Root / Management | Quản lý Organizations, billing, Control Tower console, không chạy workload |
| **Security OU** | **Log Archive** Account | Lưu trữ tập trung bản sao bất biến (immutable) của CloudTrail logs và AWS Config snapshots trong S3 |
| **Security OU** | **Audit (Security Tooling)** Account | Tài khoản chuyên biệt cho Security/Compliance team thực hiện cross-account audit (read-only/admin roles), nhận SNS notifications |
| **Sandbox / Workloads OU** | Member Accounts | Các tài khoản được cấp phát qua Account Factory cho Dev, Staging, Prod |

### Kiến trúc Guardrails (Controls): Preventive vs Detective vs Proactive

Control Tower phân loại controls theo **3 nhóm hành vi** và **3 mức độ áp dụng** (Mandatory, Strongly Recommended, Elective):

| Loại Control | Cơ chế kỹ thuật nền tảng | Thời điểm đánh giá | Hành động khi vi phạm |
| :--- | :--- | :--- | :--- |
| **Preventive** | **Service Control Policies (SCPs)** trên AWS Organizations | Trước khi API call thực thi (Real-time API interception) | **Chặn (Deny)** hành động ngay lập tức, không cho phép tạo/sửa tài nguyên vi phạm |
| **Detective** | **AWS Config Rules** (+ AWS Lambda remediation nếu cần) | Sau khi tài nguyên được tạo hoặc thay đổi cấu hình | **Phát hiện & Cảnh báo** trạng thái `NON_COMPLIANT` trên Control Tower dashboard / Security Hub |
| **Proactive** | **AWS CloudFormation Hooks** | Trước khi CloudFormation (hoặc IaC tích hợp) provision tài nguyên | **Chặn (Fail)** quá trình triển khai stack trước khi tài nguyên được tạo nếu không đạt chuẩn |

> **Exam Tip**: Nếu đề bài yêu cầu *"ngăn chặn tuyệt đối"* (prevent) người dùng tắt CloudTrail hoặc tạo S3 bucket public dù họ có quyền AdministratorAccess trong member account -> chọn **Preventive Control (SCP)**. Nếu đề bài yêu cầu *"kiểm tra, ghi nhận trạng thái tuân thủ (compliance status) và phát cảnh báo"* khi EBS volume không mã hóa -> chọn **Detective Control (AWS Config Rule)**. Nếu cần *"chặn ngay trong bước CloudFormation deployment trước khi tài nguyên được tạo"* -> chọn **Proactive Control (CloudFormation Hooks)**.

---

## 2. Account Factory, AFT & Customizations for AWS Control Tower (CfCT)

Khi tạo tài khoản mới qua **Account Factory** (sử dụng AWS Service Catalog ở tầng dưới), doanh nghiệp thường cần tự động hóa việc cài đặt hạ tầng bổ sung (custom VPC, transit gateway attachment, IAM roles, GuardDuty, custom SCPs). AWS cung cấp 2 giải pháp chính tùy theo công cụ IaC của team:

### So sánh Account Factory, CfCT và AFT

| Tiêu chí | Account Factory (Native) | Customizations for AWS Control Tower (CfCT) | Account Factory for Terraform (AFT) |
| :--- | :--- | :--- | :--- |
| **Công cụ IaC** | Service Catalog + CloudFormation cơ bản | **AWS CloudFormation** (StackSets) + **SCPs** | **Terraform** (Terraform Cloud, Enterprise, hoặc OSS với CodePipeline/CodeBuild) |
| **Cơ chế kích hoạt** | Thủ công qua Console hoặc Service Catalog API | Git repo (CodeCommit/S3) + CodePipeline + Step Functions + EventBridge (`CreateManagedAccount`) | GitOps pipeline (4 repos: `aft-account-request`, `aft-global-customizations`, `aft-account-customizations`, `aft-account-provisioning-customizations`) |
| **Phạm vi áp dụng** | Cấu hình mạng mặc định khi tạo account | Áp dụng cho **OUs** và **Accounts** (cả account mới và account đã tồn tại) | Quản lý toàn bộ vòng đời account request và Terraform customizations |
| **Use Case chuẩn** | Nhu cầu đơn giản, ít tùy biến | Tổ chức dùng CloudFormation muốn tự động đẩy StackSets & SCPs theo OU | Tổ chức chuẩn hóa Terraform cho multi-account provisioning |

### Ví dụ cấu hình `manifest.yaml` trong CfCT

CfCT sử dụng file `manifest.yaml` để định nghĩa danh sách SCPs và CloudFormation StackSets cần triển khai tới từng OU hoặc Account:

```yaml
region: ap-southeast-1
version: 2021-03-15

resources:
  - name: restrict-regions-scp
    resource_file: policies/restrict-regions.json
    deploy_method: scp
    deployment_targets:
      organizational_units:
        - Workloads
        - Sandbox

  - name: baseline-vpc-flowlogs
    resource_file: templates/vpc-baseline.yaml
    parameter_file: parameters/vpc-baseline.json
    deploy_method: stack_set
    deployment_targets:
      organizational_units:
        - Workloads
    regions:
      - ap-southeast-1
      - us-east-1
```

> **Exam Tip**: Khi câu hỏi SAP-C02 nhắc đến *"tự động triển khai CloudFormation StackSets và SCPs mỗi khi một tài khoản mới được tạo qua Control Tower Account Factory hoặc khi tài khoản được chuyển giữa các OU"*, đáp án chuẩn là **Customizations for AWS Control Tower (CfCT)** (hoặc EventBridge rule lắng nghe sự kiện `CreateManagedAccount` từ Control Tower kích hoạt Lambda/Step Functions). Nếu đề bài nhấn mạnh team sử dụng **Terraform** làm chuẩn IaC -> chọn **Account Factory for Terraform (AFT)**.

---

## 3. AWS Service Catalog — Quản trị Self-Service IaC tập trung

**AWS Service Catalog** cho phép Platform/Cloud Center of Excellence (CCoE) đóng gói các mẫu kiến trúc đã được phê duyệt (CloudFormation templates hoặc Terraform configurations) thành danh mục sản phẩm (**Products**) để developer tự triển khai (**Self-service**) mà không cần quyền IAM trực tiếp để tạo từng tài nguyên lẻ.

### Các khái niệm cốt lõi trong Service Catalog

1. **Product**: Một tài nguyên hoặc tập hợp tài nguyên CNTT (ví dụ: `Standard-3Tier-WebApp`, `Compliant-RDS-Postgres`) được định nghĩa bởi CloudFormation template và có quản lý phiên bản (**Provisioning Artifacts / Versions**).
2. **Portfolio**: Tập hợp các Products cùng với cấu hình phân quyền (**IAM Users, Groups, Roles**) và các ràng buộc (**Constraints**).
3. **Launch Constraint (Cực kỳ quan trọng cho bài thi!)**:
   - Gắn một **IAM Role** cụ thể vào Product trong Portfolio.
   - Khi end-user launch Product, Service Catalog sẽ **assume Launch Role** đó để tạo tài nguyên (EC2, RDS, VPC...) thay cho user.
   - End-user **chỉ cần quyền `AWSServiceCatalogEndUserFullAccess`** (quyền trên Service Catalog) mà **không cần bất kỳ quyền tạo EC2/RDS/VPC trực tiếp nào** (Least Privilege).
4. **Template Constraint**: Giới hạn các giá trị tham số (parameters) mà user được phép nhập khi launch (ví dụ: chỉ cho phép chọn `t3.micro` hoặc `t3.small` cho môi trường Dev).
5. **TagOptions**: Tự động ép buộc gắn tags chuẩn (ví dụ `CostCenter`, `Environment`) lên mọi tài nguyên được tạo qua Service Catalog.
6. **Portfolio Sharing**: Chia sẻ Portfolio từ tài khoản trung tâm (Hub) sang các member accounts hoặc toàn bộ **AWS Organizations / OUs**.

### Ví dụ Launch Constraint & Template Constraint (CloudFormation / CLI Pattern)

```json
{
  "Rules": {
    "AllowedInstanceTypes": {
      "Values": ["t3.micro", "t3.small", "t3.medium"]
    }
  }
}
```

> **Exam Tip**: Bất cứ khi nào đề bài nói: *"Developer cần tự tạo môi trường (EC2, RDS, S3) theo chuẩn công ty nhưng Security team KHÔNG muốn cấp quyền IAM tạo EC2/RDS trực tiếp cho Developer để tránh họ cấu hình sai bảo mật"* -> Đáp án gần như chắc chắn là **AWS Service Catalog kết hợp Launch Constraint (IAM Role)** và **Template Constraint**. Kết hợp với **AWS Organizations Portfolio Sharing** để phân phối xuyên tài khoản.

---

## 4. AWS Resource Access Manager (AWS RAM)

**AWS RAM** cho phép chia sẻ tài nguyên AWS từ một tài khoản (Owner) sang các tài khoản khác trong cùng **AWS Organizations** (hoặc OU, hoặc tài khoản bên ngoài) mà **không cần nhân bản (duplicate) tài nguyên** và **không tốn thêm chi phí chia sẻ**.

### Các tài nguyên thường gặp nhất với AWS RAM trong SAP-C02

| Dịch vụ / Tài nguyên | Lợi ích kiến trúc khi dùng AWS RAM |
| :--- | :--- |
| **VPC Subnets** | **Shared VPC**: Network Account sở hữu VPC/Subnets/NAT Gateway/IGW; Application Accounts chỉ việc đặt EC2, RDS, Lambda, EKS vào các subnets được share -> tiết kiệm chi phí NAT Gateway, đơn giản hóa IPAM và quản trị mạng tập trung |
| **Transit Gateway (TGW)** | Chia sẻ TGW từ Network Account cho hàng trăm Spoke Accounts gắn VPC attachment |
| **Route 53 Resolver Rules** | Chia sẻ Forwarding Rules (hybrid DNS) từ Hub Account cho toàn bộ Organization để mọi VPC đều phân giải được on-premises domain |
| **Network Firewall / Firewall Manager / DNS Firewall** | Chia sẻ Rule Groups và VPC associations |
| **AWS License Manager** | Chia sẻ License Configurations (BYOL - Bring Your Own License) xuyên tài khoản |
| **EC2 Dedicated Hosts / Capacity Reservations** | Chia sẻ Dedicated Hosts để tối ưu chi phí license (SQL Server, Windows, Oracle) trên nhiều tài khoản |
| **AWS Glue Data Catalog / Lake Formation** | Chia sẻ metadata tables/databases xuyên tài khoản |
| **AWS Private CA (ACM PCA)** | Chia sẻ Private Certificate Authority để các workload accounts tự issue private certificates mà không cần tạo nhiều PCA ($400/tháng/PCA) |

### Lưu ý quan trọng về Shared VPC (AWS RAM)

- **Owner Account** quản lý: VPC, Subnets, Route Tables, Network ACLs, Internet Gateway, NAT Gateway, VPC Peering, Transit Gateway Attachments.
- **Participant Account** quản lý: EC2, RDS, Lambda, ALB/NLB, Security Groups của riêng mình đặt trong shared subnets.
- **Giới hạn**: Participant **không thể** nhìn thấy hoặc sửa Route Tables/NACLs của Owner; Owner **không thể** sửa tài nguyên (EC2/SG) của Participant, nhưng có thể xem thông tin IP đang sử dụng.

> **Exam Tip**: Khi đề bài yêu cầu *"giảm thiểu chi phí NAT Gateway, đơn giản hóa quản lý CIDR/Route Table, nhưng vẫn tách biệt quyền kiểm soát workload giữa các team bằng nhiều AWS accounts"* -> Chọn **VPC Sharing với AWS RAM** thay vì tạo mỗi account một VPC riêng rồi nối qua Transit Gateway (vì Shared VPC không tốn phí TGW data processing cho traffic nội bộ trong cùng VPC!). Nếu các team cần **tự quản lý Route Table và VPC riêng biệt** -> dùng **Multi-VPC + Transit Gateway (chia sẻ qua AWS RAM)**.

---

## 5. Tổng kết Decision Matrix cho SAP-C02

| Bài toán kiến trúc | Giải pháp chuẩn AWS |
| :--- | :--- |
| Thiết lập nhanh multi-account landing zone chuẩn best practices (Log Archive, Audit, IAM Identity Center) | **AWS Control Tower** |
| Chặn hành vi nguy hiểm trên toàn bộ OU trước khi API chạy | **Preventive Guardrail (SCP)** |
| Giám sát và báo cáo compliance khi tài nguyên bị sửa sai chuẩn | **Detective Guardrail (AWS Config Rules)** |
| Chặn CloudFormation stack tạo tài nguyên sai chuẩn ngay trước khi provision | **Proactive Guardrail (CloudFormation Hooks)** |
| Tự động đẩy StackSets & SCPs mỗi khi tạo account mới trong Control Tower | **CfCT** (CloudFormation) hoặc **AFT** (Terraform) |
| Cho phép dev tự tạo hạ tầng chuẩn hóa mà không cấp quyền IAM trực tiếp | **AWS Service Catalog + Launch Constraints** |
| Chia sẻ Subnets, Transit Gateway, Route 53 Resolver Rules, ACM PCA xuyên tài khoản | **AWS Resource Access Manager (AWS RAM)** |

---

[← Bài trước](01-multi-account-hybrid-network.md) | [Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/02-control-tower-landing-zone.md) | [Bài tiếp →](03-hybrid-dns-dx-bgp-tgw-routing.md)
