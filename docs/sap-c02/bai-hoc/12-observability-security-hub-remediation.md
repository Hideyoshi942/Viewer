# Enterprise Observability, Audit & Automated Remediation — CloudWatch Cross-Account, X-Ray, Config, Security Hub & SSM

Trong doanh nghiệp lớn có hàng trăm tài khoản AWS, việc giám sát phân tán là bất khả thi. SAP-C02 tập trung vào mô hình **Centralized Observability** và **Event-Driven Automated Remediation** (tự động phát hiện và khắc phục sự cố bảo mật/vận hành không cần can thiệp thủ công).

---

## 1. Centralized Observability (CloudWatch Cross-Account & AWS X-Ray)

- **CloudWatch Cross-Account Observability**: Thiết lập **Monitoring Account** trung tâm để xem tập trung Logs, Metrics và Traces từ hàng trăm **Source Accounts** (qua AWS Organizations OUs) mà không cần copy dữ liệu trùng lặp.
- **CloudWatch Logs Subscription Filters**: Đẩy log thời gian thực từ nhiều tài khoản về một **Kinesis Data Streams / Firehose** trung tâm để lưu trữ lên S3 (Archive) hoặc phân tích bằng OpenSearch.
- **AWS X-Ray / CloudWatch Application Signals**: Distributed tracing cho Microservices (Lambda, ECS, EKS, API Gateway) để tìm **bottleneck** (VD: service nào gây độ trễ cao, lỗi 5xx ở downstream).
- **CloudWatch Contributor Insights**: Tìm **Top-N** IP gây tải cao nhất hoặc DynamoDB Partition Key bị hot key.

---

## 2. Centralized Security & Compliance (Security Hub, GuardDuty, Config)

| Dịch vụ | Vai trò trong kiến trúc Multi-Account |
| :--- | :--- |
| **AWS CloudTrail (Organization Trail)** | Ghi lại mọi API calls trên **toàn bộ tài khoản** trong Organization (tự động bao gồm account mới), lưu về **Log Archive Account** có **Log File Validation** + **S3 Object Lock**. |
| **AWS Config Aggregator** | Tổng hợp trạng thái cấu hình và mức độ tuân thủ (**AWS Config Rules / Conformance Packs**) từ mọi tài khoản & Region về **Security/Audit Account**. |
| **Amazon GuardDuty (Delegated Admin)** | Phát hiện mối đe dọa bằng ML (CloudTrail, VPC Flow Logs, DNS Logs, EKS Audit Logs, S3, RDS, Malware Protection) tập trung tại Security Account. |
| **AWS Security Hub** | **Trung tâm tổng hợp findings** theo chuẩn **ASFF** từ GuardDuty, Inspector, Macie, Firewall Manager, IAM Access Analyzer và AWS Config. |

---

## 3. Event-Driven Automated Remediation (Tự động Khắc phục Sự cố)

Mô hình kinh điển xuất hiện liên tục trong đề thi **SAP-C02**:
1. **Phát hiện vi phạm**:
   - *Vi phạm cấu hình* (VD: S3 bucket bị mở public, Security Group mở port `0.0.0.0/0` SSH): **AWS Config Rule** đánh dấu `NON_COMPLIANT` -> kích hoạt **SSM Automation Document** (Auto-Remediation) hoặc **EventBridge**.
   - *Mối đe dọa bảo mật* (VD: EC2 bị nhiễm crypto-miner): **GuardDuty** gửi finding tới **Security Hub / EventBridge** -> kích hoạt **AWS Lambda** hoặc **Step Functions** để cô lập EC2 (gắn Security Group deny-all), chụp **EBS Snapshot** để forensics và gửi thông báo SNS.

```json
{
  "source": ["aws.guardduty"],
  "detail-type": ["GuardDuty Finding"],
  "detail": {
    "severity": [{ "numeric": [">=", 7] }],
    "type": [{ "prefix": "CryptoCurrency:EC2" }]
  }
}
```

---

## 4. Quản trị Vận hành với AWS Systems Manager (SSM)

- **SSM Session Manager**: Truy cập shell EC2 trong Private Subnet **không cần mở port 22/3389**, không cần Bastion Host, không cần SSH Key, toàn bộ session logs được ghi lại lên CloudWatch Logs / S3.
- **SSM Patch Manager**: Tự động vá lỗi OS theo **Maintenance Windows** dựa trên Resource Tags trên cả EC2 và On-premises servers (Hybrid Activations).

> [!TIP]
> **Exam Tip (SAP-C02)**:
> - Cần **tự động khắc phục cấu hình sai** (VD: EBS chưa mã hóa, SG mở port 22) trên nhiều tài khoản -> **AWS Config + Config Aggregator + SSM Automation Remediation**.
> - Cần **tổng hợp cảnh báo bảo mật từ GuardDuty, Inspector, Macie** về một bảng điều khiển duy nhất -> **AWS Security Hub (Delegated Administrator)**.

---

[← Bài trước](11-continuous-improvement-finops.md) | [Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/12-observability-incident-response.md) | [Bài tiếp →](13-migration-7rs-modernization.md)
