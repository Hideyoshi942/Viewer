# Domain 6: Quản trị Bảo mật & Tuân thủ Đa tài khoản (14%)

Domain 6 tập trung vào chiến lược quản trị bảo mật quy mô doanh nghiệp trên nhiều tài khoản AWS (Multi-Account Strategy), thiết lập các hàng rào bảo vệ (Guardrails), tự động hóa bằng chứng kiểm toán và bảo vệ tài khoản Root.

## 1. Kiến trúc Đa tài khoản & AWS Control Tower

Khuyến nghị của AWS (AWS Security Reference Architecture - SRA) là tách biệt workload theo nhiều tài khoản trong **AWS Organizations** thay vì dồn vào một tài khoản duy nhất để giảm **Blast Radius**:

- **Management Account**: Chỉ dùng để quản lý thanh toán (Consolidated Billing), AWS Organizations và SCP/RCP. **KHÔNG chạy workload ứng dụng** tại đây (vì SCP không có tác dụng lên Management Account).
- **Security OU**:
  - **Log Archive Account**: Nơi lưu trữ tập trung, bất biến (read-only / Object Lock) cho CloudTrail, AWS Config, VPC Flow Logs.
  - **Security Tooling (Audit) Account**: Được chỉ định làm **Delegated Administrator** cho GuardDuty, Security Hub, Macie, Inspector, IAM Access Analyzer, Detective và Firewall Manager.
- **Workloads OU** (Dev / Staging / Prod): Chạy ứng dụng thực tế với các SCP riêng biệt.

### AWS Control Tower & Hệ thống Guardrails (Controls)
AWS Control Tower tự động thiết lập Landing Zone đa tài khoản với 3 loại Controls:
1. **Preventive Controls (Phòng ngừa)**: Thực thi bằng **SCPs** (Service Control Policies) hoặc **RCPs** (Resource Control Policies). Trạng thái luôn là `Enforced` hoặc `Not enabled` — ngăn chặn ngay từ đầu các hành vi sai phạm (ví dụ: cấm tắt CloudTrail, cấm tạo tài nguyên ngoài Region cho phép).
2. **Detective Controls (Phát hiện)**: Thực thi bằng **AWS Config Rules** hoặc **Security Hub Controls**. Phát hiện tài nguyên vi phạm sau khi tạo (ví dụ: phát hiện S3 bucket public, EBS không mã hóa) và báo cáo trạng thái `Compliant` / `Noncompliant`.
3. **Proactive Controls (Chủ động)**: Thực thi bằng **CloudFormation Hooks** — kiểm tra template trước khi tài nguyên kịp được khởi tạo qua CloudFormation.

> **Exam Tip**: **SCP** không bao giờ áp dụng cho **Management Account** và không ảnh hưởng tới **Service-Linked Roles (SLR)** cũng như tài nguyên mà principal ngoài Organization truy cập qua Resource Policy. Ngược lại, **RCP (Resource Control Policy)** giúp thiết lập trần quyền ở cấp độ tài nguyên (S3, STS, KMS, SQS, Secrets Manager) trong Organization, giúp chặn cả truy cập từ bên ngoài Organization vào tài nguyên bên trong!

### SCP Mẫu: Giới hạn Region (Region Restriction)
Lưu ý cực kỳ quan trọng khi viết SCP giới hạn Region: **PHẢI miễn trừ các Global Services** (`iam`, `sts`, `organizations`, `route53`, `cloudfront`, `waf`, `support`, `budgets`...) nếu không toàn bộ thao tác IAM/Console sẽ bị khóa!

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyAllOutsideApprovedRegions",
      "Effect": "Deny",
      "NotAction": [
        "iam:*",
        "organizations:*",
        "route53:*",
        "cloudfront:*",
        "sts:*",
        "support:*",
        "globalaccelerator:*"
      ],
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "aws:RequestedRegion": ["ap-southeast-1", "us-east-1"]
        }
      }
    }
  ]
}
```

## 2. Delegated Administrator (Quản trị viên Ủy quyền)

Trong mô hình bảo mật chuẩn, bạn không nên cấp quyền cho đội SOC đăng nhập vào Management Account. Thay vào đó, bật **Trusted Access** trong AWS Organizations và đăng ký **Security Tooling Account** làm **Delegated Administrator** cho các dịch vụ bảo mật:
- GuardDuty, Security Hub, Detective, Inspector, Macie, Firewall Manager, IAM Access Analyzer, CloudTrail, AWS Config, AWS Audit Manager.
- *Lưu ý*: AWS Firewall Manager yêu cầu một tài khoản chuyên dụng (không nên là Management Account) và bật AWS Config trên tất cả tài khoản thành viên.

## 3. Công cụ Quản trị Tuân thủ & Kiểm toán

| Dịch vụ | Mục đích chính | Khi nào chọn trong đề thi? |
| :--- | :--- | :--- |
| **AWS Config Conformance Packs** | Tập hợp đóng gói (YAML template) gồm nhiều Config Rules + SSM Remediation Actions triển khai đồng loạt qua AWS Organizations | Triển khai nhanh bộ quy tắc tuân thủ (Operational Best Practices for PCI-DSS, HIPAA, NIST, CIS) xuyên suốt toàn bộ Organization |
| **AWS Audit Manager** | Tự động thu thập bằng chứng kiểm toán (evidence) liên tục từ CloudTrail, Config, Security Hub, API calls và xuất báo cáo chuẩn cho Auditor | Chuẩn bị hồ sơ kiểm toán (Audit-ready reports) cho SOC 2, ISO 27001, PCI-DSS, GDPR mà không cần chụp ảnh màn hình thủ công |
| **AWS Artifact** | Cổng tải về miễn phí các báo cáo tuân thủ của chính AWS (SOC 2, ISO 27001, PCI AoC) và ký thỏa thuận pháp lý (**BAA** cho HIPAA, **DPA**) | Khi Auditor yêu cầu bằng chứng tuân thủ **hạ tầng vật lý / phần trách nhiệm của AWS** (Shared Responsibility Model) |
| **AWS Trusted Advisor** | Kiểm tra best practices (Security, Cost, Performance, Fault Tolerance, Service Limits); gói Business/Enterprise mở khóa toàn bộ Security checks | Cảnh báo nhanh các lỗi cấu hình phổ biến (Exposed Access Keys, Root MFA chưa bật, S3 bucket permissions, Security Groups mở port 22/3389) |
| **AWS Service Catalog** | Cung cấp danh mục sản phẩm CloudFormation đã được duyệt sẵn (pre-approved templates) cho developer tự khởi chạy với **Launch Constraints** | Cho phép developer triển khai hạ tầng an toàn mà không cần cấp trực tiếp quyền tạo tài nguyên (IAM Least Privilege) |

## 4. Bảo vệ Tài khoản Root (Account Root User Protection)

- Bật **Centralized Root Access Management** trong AWS Organizations: Cho phép xóa bỏ hoàn toàn Root credentials (mật khẩu, access keys, MFA) của các member accounts và chỉ cấp quyền thực hiện các tác vụ đặc quyền ngắn hạn (`AssumeRoot`) từ Management Account / Delegated Admin khi thực sự cần (ví dụ: mở khóa S3 bucket policy bị khóa nhầm).
- Nếu member account vẫn còn Root user:
  - **Không bao giờ** tạo Access Keys cho Root User.
  - Bật **Hardware MFA** (FIDO2/WebAuthn hoặc Hardware TOTP).
  - Sử dụng **SCP** để chặn hoàn toàn hành động của Root user (`"StringLike": {"aws:PrincipalArn": "arn:aws:iam::*:root"}`) trong các member accounts.
  - Tạo **EventBridge Rule** bắt sự kiện `ConsoleLogin` của `userIdentity.type = Root` và gửi cảnh báo khẩn cấp qua SNS.

> **Exam Tip**: Hãy phân biệt rạch ròi 3 dịch vụ hay bị nhầm:
> - Cần báo cáo tuân thủ của **hạ tầng AWS** (ví dụ: AWS có đạt PCI-DSS/SOC 2 không?) → **AWS Artifact**.
> - Cần tự động thu thập bằng chứng tuân thủ cho **workload của công ty** để nộp kiểm toán viên → **AWS Audit Manager**.
> - Cần đánh giá liên tục và **tự động sửa lỗi cấu hình** (remediation) hàng loạt trên toàn Organization → **AWS Config Conformance Packs**.

---

[← Bài trước](12-kms-cryptography-acm-pca-secrets.md) | [Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/13-gov-organizations-control-tower.md) | [Bài tiếp →](14-compliance-conformance-audit-manager.md)
