# Ứng phó Sự cố, EC2 Forensics & Auto-Remediation Playbooks

Domain 1 của **AWS Certified Security - Specialty (SCS-C02)** không chỉ kiểm tra việc phát hiện mối đe dọa (GuardDuty, Security Hub, Detective) mà còn đi sâu vào **quy trình ứng phó sự cố chuẩn (Incident Response Playbooks)**, **bảo toàn bằng chứng số (Forensics)** và **tự động cô lập/khắc phục (Auto-Remediation)**.

---

## 1. Playbook Cô lập & Forensics cho EC2 Bị Xâm nhập

Khi GuardDuty phát hiện một EC2 instance đang giao tiếp với C2 server hoặc đào coin (CryptoCurrency), **TUYỆT ĐỐI KHÔNG terminate hoặc stop ngay lập tức** (vì Stop/Terminate sẽ làm mất dữ liệu RAM/volatile memory và có thể kích hoạt Auto Scaling xóa mất máy chủ).

**Thứ tự cô lập & thu thập bằng chứng chuẩn AWS:**
1. **Gỡ khỏi Auto Scaling Group (ASG) & Load Balancer:** Dùng `DetachInstances` để ASG không terminate instance và không tạo instance mới thay thế mất dấu, đồng thời ngừng nhận traffic từ ALB/NLB.
2. **Cô lập mạng (Network Isolation):** Thay Security Group hiện tại bằng một **Forensic Isolation Security Group** không có bất kỳ Inbound/Outbound rule nào (chỉ mở outbound tới Forensic S3/Collector nếu cần). *Lưu ý:* Không dùng NACL nếu làm ảnh hưởng các instance sạch khác trong cùng subnet!
3. **Thu hồi IAM Credentials:** Gắn IAM Policy `AWSDenyAll` hoặc thu hồi session token (`aws:TokenIssueTime` condition) của IAM Instance Profile Role để ngăn kẻ tấn công tiếp tục gọi AWS API.
4. **Chụp EBS Snapshot & Memory Dump:**
   - Bật **Termination Protection** (`DisableApiTermination`).
   - Tạo **EBS Snapshot** (nếu mã hóa bằng KMS, đảm bảo Forensic account có quyền giải mã KMS key).
   - Dùng **SSM Run Command** (nếu đã cài SSM Agent) để dump memory (`LiME`) đẩy vào S3 Forensic Bucket có Object Lock.
5. **Phân tích trong Clean Room VPC:** Restore EBS Snapshot thành volume mới và gắn vào một máy trạm phân tích nằm trong **Forensic VPC cô lập**.

---

## 2. Playbook Xử lý IAM Access Key Bị Lộ (Compromised Credentials)

1. **Vô hiệu hóa ngay lập tức (Deactivate, không xóa ngay nếu cần audit):** Cập nhật Access Key status thành `Inactive` (giữ lại AccessKeyId để truy vết CloudTrail).
2. **Thu hồi Active Sessions:** Gắn inline policy `Deny` mọi hành động với điều kiện `aws:TokenIssueTime < <thời_điểm_hiện_tại>` để vô hiệu hóa toàn bộ STS temporary credentials đã cấp trước đó.
3. **Kiểm tra Persistence (Dấu vết duy trì quyền truy cập):** Kiểm tra CloudTrail xem kẻ tấn công có tạo thêm IAM User mới, Access Key thứ 2, Lambda backdoor, hoặc sửa Trust Policy của IAM Role hay không.
4. **Xoay vòng Secrets:** Rotate toàn bộ DB passwords, API keys mà user/role đó có quyền truy cập.

---

## 3. Tự động hóa Phản hồi với EventBridge & Step Functions

```json
{
  "source": ["aws.guardduty"],
  "detail-type": ["GuardDuty Finding"],
  "detail": {
    "severity": [{ "numeric": [">=", 7] }],
    "type": [{ "prefix": "UnauthorizedAccess:EC2/" }]
  }
}
```

- **EventBridge Rule** bắt GuardDuty High Severity Finding -> kích hoạt **Step Functions** hoặc **SSM Automation** thực hiện: Isolate SG -> Snapshot EBS -> Tag `Quarantined=true` -> Gửi thông báo qua SNS/Slack.
- **AWS Systems Manager Incident Manager:** Quản lý On-call, Escalation Plans và Post-Incident Analysis cho các sự cố bảo mật nghiêm trọng.

---

---

[← Bài trước](01-threat-detection-incident-response.md) | [Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/02-ir-playbooks-forensics-remediation.md) | [Bài tiếp →](03-security-logging-monitoring.md)
