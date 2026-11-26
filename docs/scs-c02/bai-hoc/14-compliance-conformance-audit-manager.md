# Quản trị Tuân thủ: AWS Config Conformance Packs, Audit Manager, Trusted Advisor & Artifact

Domain 6 (Management and Security Governance) yêu cầu kiến trúc sư bảo mật nắm vững bộ công cụ kiểm toán, đánh giá tuân thủ liên tục và quản lý bằng chứng kiểm toán (Audit Evidence) trên toàn AWS Organizations.

---

## 1. So sánh Bộ Công cụ Tuân thủ & Kiểm toán AWS

| Dịch vụ | Chức năng chính | Khi nào chọn trong bài thi SCS-C02? |
| :--- | :--- | :--- |
| **AWS Config Conformance Packs** | Đóng gói nhiều **AWS Config Rules** + **SSM Remediation Actions** thành 1 file YAML triển khai đồng loạt qua Organizations | Cần triển khai chuẩn **Operational Best Practices for PCI-DSS / HIPAA / NIST** kèm **Auto-Remediation** trên toàn Organization |
| **AWS Audit Manager** | Tự động thu thập **Audit Evidence** (từ CloudTrail, Config, Security Hub, License Manager) theo các framework chuẩn | Cần xuất báo cáo bằng chứng sẵn sàng cho **Auditor bên ngoài** (SOC 2, PCI-DSS, ISO 27001, GDPR) |
| **AWS Artifact** | Cổng tự phục vụ tải **báo cáo tuân thủ của chính AWS** (SOC 1/2/3, ISO 27001, PCI Attestation) và ký BAA (HIPAA) | Auditor yêu cầu chứng nhận bảo mật **hạ tầng vật lý/datacenter của AWS** (Shared Responsibility Model) |
| **AWS Security Hub Standards** | Chấm điểm tuân thủ bảo mật (CIS AWS Foundations, AWS Foundational Security Best Practices) theo thời gian thực | Cần bảng điểm Security Score tổng hợp và findings từ GuardDuty/Inspector/Config |
| **AWS Trusted Advisor** | Kiểm tra Best Practices về Security (S3 public, MFA on Root, Port 22 mở), Cost, Performance | Cần kiểm tra nhanh các cấu hình rủi ro cơ bản (yêu cầu Business/Enterprise Support để mở khóa toàn bộ Security checks & EventBridge integration) |

---

## 2. Triển khai Conformance Packs Đa tài khoản (Organization)

```bash
# Triển khai Organization Conformance Pack từ tài khoản Delegated Admin
aws configservice put-organization-conformance-pack \
  --organization-conformance-pack-name "CIS-AWS-Conformance-Pack" \
  --template-s3-uri "s3://org-compliance-templates/cis-aws-foundations.yaml" \
  --excluded-accounts "111122223333"
```

> [!IMPORTANT]
> **Exam Tip (Phân biệt Audit Manager vs Artifact):**
> - **AWS Artifact:** Chứng minh **AWS** tuân thủ (phần *Security OF the Cloud* — ví dụ báo cáo SOC 2 của AWS data centers, ký BAA).
> - **AWS Audit Manager:** Chứng minh **ứng dụng và tài nguyên của BẠN** trên AWS tuân thủ (phần *Security IN the Cloud*) bằng cách tự động gom bằng chứng từ CloudTrail, Config, Security Hub.

---

## 3. Kiến trúc Giám sát Tuân thủ Tập trung Đa tài khoản

1. **Tài khoản Management (Organizations):** Chỉ dùng để quản lý Billing, SCPs và chỉ định **Delegated Administrator** cho tài khoản **Security/Audit** (không chạy workload).
2. **Tài khoản Security Tooling (Delegated Admin):**
   - Quản lý **AWS Config Aggregator** thu thập trạng thái tuân thủ toàn Organization.
   - Triển khai **Organization Conformance Packs** kèm SSM Automation Remediation.
   - Chạy **AWS Audit Manager** gom bằng chứng tự động và xuất Assessment Report lưu vào S3 Bucket có **Object Lock**.
3. **Tự động cảnh báo:** Kết nối **Trusted Advisor** và **Security Hub** với **EventBridge** -> gửi cảnh báo qua SNS/Slack khi phát hiện tài nguyên vi phạm chuẩn CIS/PCI-DSS.

```bash
# Kiểm tra trạng thái tuân thủ của Organization Conformance Pack
aws configservice describe-organization-conformance-pack-statuses \
  --organization-conformance-pack-names "CIS-AWS-Conformance-Pack"
```

> [!TIP]
> **Exam Tip:** Dùng **AWS Config Conformance Packs** khi cần vừa kiểm tra tuân thủ vừa tự động sửa lỗi (Auto-Remediation), và dùng **AWS Audit Manager** khi cần xuất báo cáo bằng chứng cho kiểm toán viên.

---

[← Bài trước](13-multi-account-security-governance.md) | [Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/14-gov-compliance-audit-artifact.md)
