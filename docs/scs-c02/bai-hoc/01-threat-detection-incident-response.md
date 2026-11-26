# Domain 1: Phát hiện Mối đe dọa & Ứng phó Sự cố (14%)

Trong kỳ thi **SCS-C02**, Domain 1 tập trung vào khả năng phát hiện sớm hành vi bất thường, tự động hóa quy trình ứng phó (Automated Remediation), cô lập tài nguyên bị xâm nhập (Containment) mà vẫn bảo toàn chứng cứ số (Forensics).

## 1. Hệ sinh thái Phát hiện & Điều tra Mối đe dọa

| Dịch vụ | Vai trò cốt lõi | Nguồn dữ liệu chính | Tình huống sử dụng trong đề thi |
| :--- | :--- | :--- | :--- |
| **Amazon GuardDuty** | Threat Detection liên tục bằng ML & Threat Intel | CloudTrail (Mgmt & S3 Data), VPC Flow Logs, DNS Logs, EKS Audit, EBS Malware, RDS Login, Lambda | Phát hiện đào coin (CryptoMining), rò rỉ IAM key, giao tiếp C&C, quét cổng |
| **AWS Security Hub** | Trung tâm tổng hợp findings theo chuẩn **ASFF** & kiểm tra Compliance | GuardDuty, Inspector, Macie, Firewall Manager, Config, IAM Access Analyzer | Xem tập trung đa tài khoản (Delegated Admin), chạy CIS / FSBP / PCI-DSS |
| **Amazon Detective** | Điều tra nguyên nhân gốc rễ (Root Cause Investigation) bằng đồ thị hành vi | Tự động kéo CloudTrail, VPC Flow Logs, EKS Audit, GuardDuty findings | Phân tích chuỗi tấn công, xem IP nào đã gọi API gì trong 12 tháng qua |

> **Exam Tip**: **GuardDuty** KHÔNG yêu cầu bạn phải bật trước CloudTrail, VPC Flow Logs hay Route 53 Resolver Query Logs trong tài khoản; nó đọc trực tiếp luồng dữ liệu độc lập từ hạ tầng AWS ở tầng control/data plane mà không ảnh hưởng hiệu năng workload.

### Cấu hình GuardDuty Đa tài khoản & Threat Lists
- Sử dụng **AWS Organizations** để chỉ định một tài khoản **Delegated Administrator** (thường là Security Tooling Account) quản lý GuardDuty cho toàn bộ member accounts và tự động bật cho tài khoản mới.
- **Trusted IP Lists**: Danh sách IP tin cậy (ví dụ: scanner nội bộ hợp pháp) để giảm false positives. Chỉ hỗ trợ tối đa 1 Trusted IP List mỗi Region (tối đa 2.000 IP/CIDR) và phải lưu file trên S3.
- **Threat IP Lists**: Danh sách IP độc hại tùy chỉnh từ hệ thống Threat Intelligence bên ngoài (tối đa 6 danh sách mỗi Region).
- **Suppression Rules**: Lọc tự động lưu trữ (auto-archive) các findings đã xác nhận an toàn dựa trên tiêu chí cụ thể (ví dụ: loại finding + tag/instance ID).

## 2. Tự động hóa Ứng phó Sự cố với Amazon EventBridge

Mô hình chuẩn để phản ứng theo thời gian thực trong đề thi SCS-C02 là:
`GuardDuty / Security Hub Finding` → **Amazon EventBridge Rule** → **Target** (Lambda / Step Functions / SSM Automation Runbook / SNS).

```json
{
  "source": ["aws.guardduty"],
  "detail-type": ["GuardDuty Finding"],
  "detail": {
    "severity": [{ "numeric": [">=", 7] }],
    "type": [{ "prefix": "UnauthorizedAccess:EC2" }]
  }
}
```

### Quy trình xử lý Security Hub Custom Actions
- Security Hub tự động đẩy mọi finding mới/cập nhật sang EventBridge (`Security Hub Findings - Imported`).
- Nếu cần con người phê duyệt trước khi xử lý (human-in-the-loop), tạo **Custom Action** trong Security Hub; khi analyst bấm nút Custom Action, EventBridge nhận event `Security Hub Findings - Custom Action` và kích hoạt Lambda/SSM Automation.

## 3. Playbook Cô lập & Pháp chứng EC2 (EC2 Isolation & Forensics)

Khi một EC2 instance bị nghi ngờ nhiễm mã độc hoặc bị chiếm quyền (ví dụ: GuardDuty báo `Backdoor:EC2/C&CActivity.B!DNS`), **TUYỆT ĐỐI KHÔNG** terminate hoặc stop instance ngay lập tức nếu cần thu thập dữ liệu RAM (volatile memory).

### Thứ tự các bước chuẩn AWS Forensics:
1. **Cô lập mạng (Network Containment)**:
   - Thay thế Security Group hiện tại bằng **Isolation Security Group** (không có Inbound rules và không có Outbound rules — hoặc chỉ cho phép Outbound tới Forensic Bastion nội bộ).
   - **Lưu ý quan trọng**: Nếu instance thuộc **Auto Scaling Group (ASG)**, phải gọi `detach-instances` (hoặc đặt vào trạng thái `Standby`) trước khi cô lập, nếu không ASG sẽ thấy health check fail và **terminate** instance làm mất chứng cứ!
   - Gỡ bỏ hoặc thu hồi **IAM Instance Profile** (attach Deny-All policy hoặc revoke session của role) để kẻ tấn công không thể dùng IMDS lấy temporary credentials.
2. **Thu thập chứng cứ (Evidence Acquisition)**:
   - Nếu cần **Memory Dump (RAM)**: Chạy SSM Run Command (khi instance còn đang chạy) để dump memory lên một S3 bucket riêng biệt (bật Object Lock + mã hóa KMS) ở Forensic Account.
   - Chụp **EBS Snapshot** của tất cả các volume đang gắn vào instance (bật **Termination Protection** trước).
   - Nếu volume được mã hóa bằng KMS CMK, cần chia sẻ quyền sử dụng KMS key + chia sẻ snapshot sang Forensic Account (hoặc copy snapshot mã hóa bằng key của Forensic Account).
3. **Phân tích ngoại tuyến**:
   - Tạo EBS volume mới từ snapshot trong **Forensic Clean-Room VPC** (không có Internet Gateway/NAT Gateway) và gắn vào một máy trạm phân tích chuyên dụng (Forensic Workstation) ở chế độ **read-only**.

> **Exam Tip**: Khi đề thi hỏi cách ngăn kẻ tấn công tiếp tục sử dụng kết nối đã thiết lập sẵn trên EC2 bị xâm nhập: **Gỡ bỏ rule trong Security Group** sẽ có hiệu lực ngay lập tức đối với luồng traffic mới, và với Security Group thay đổi trên AWS, các kết nối cũ bị ảnh hưởng khi rule bị xóa (lưu ý NACL là stateless và chặn ngay cả chiều trả về nếu thêm Deny rule ở số ưu tiên thấp nhất).

## 4. Playbook Xử lý IAM Access Key bị lộ (Compromised Credentials)

Khi phát hiện IAM Access Key bị rò rỉ trên GitHub hoặc có cảnh báo `UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration.OutsideAWS`:

1. **Vô hiệu hóa ngay lập tức (Disable, đừng vội Delete)**:
   - Đánh dấu Access Key là `Inactive` (giữ lại metadata để điều tra).
   - Đổi mật khẩu console nếu user có console access.
2. **Thu hồi mọi phiên đang hoạt động (Revoke Active Sessions)**:
   - Gắn inline policy `AWSRevokeOlderSessions` có điều kiện `aws:TokenIssueTime` < thời điểm hiện tại để vô hiệu hóa toàn bộ STS temporary credentials đã cấp trước đó.
3. **Kiểm tra & Dọn dẹp (Audit & Eradicate)**:
   - Truy vấn CloudTrail (qua Athena hoặc CloudTrail Lake) theo `userIdentity.accessKeyId` để tìm mọi tài nguyên kẻ tấn công đã tạo (ví dụ: IAM user/role ẩn, EC2 đào coin ở các Region ít dùng, Access Key phụ).
   - Dùng **AWS IAM Credential Report** và **Access Analyzer** để rà soát toàn bộ tài khoản.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Action": "*",
      "Resource": "*",
      "Condition": {
        "DateLessThan": {
          "aws:TokenIssueTime": "2026-11-19T12:00:00Z"
        }
      }
    }
  ]
}
```

> **Exam Tip**: Đối với IAM Role bị lộ temporary credentials (ví dụ từ EC2 IMDSv1), việc xóa Role hoặc thay đổi Trust Policy **KHÔNG** vô hiệu hóa ngay các token đã cấp. Bạn **BẮT BUỘC** phải gắn chính sách Deny với điều kiện `aws:TokenIssueTime` (hoặc dùng nút "Revoke active sessions" trên IAM Console — bản chất là tạo chính policy JSON trên).

---

[Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/01-ir-detection-guardduty-detective.md) | [Bài tiếp →](02-ir-playbooks-forensics-remediation.md)
