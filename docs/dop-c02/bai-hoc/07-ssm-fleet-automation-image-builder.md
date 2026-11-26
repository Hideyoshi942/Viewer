# Tự động hóa Fleet & Phản hồi Sự cố: Systems Manager Suite, EC2 Image Builder & Incident Manager

Trong kỳ thi **AWS Certified DevOps Engineer - Professional (DOP-C02)**, **AWS Systems Manager (SSM)** là xương sống cho cả việc vận hành hàng nghìn máy chủ (EC2 & On-Premises Hybrid Activations) lẫn tự động hóa phản hồi sự cố (Domain 5 - 14%). Bài học này hệ thống hóa sự khác biệt giữa từng công cụ trong SSM Suite, quy trình tạo Golden AMI với **EC2 Image Builder**, và chuỗi tự động hóa sự cố **EventBridge → Incident Manager / OpsCenter**.

---

## 1. Phân biệt Các Công cụ Thực thi trong AWS Systems Manager

Đề thi DOP-C02 rất thường xuyên đưa ra 4 đáp án đều là tính năng của SSM. Nắm vững bảng phân biệt sau sẽ giúp chọn đúng ngay lập tức:

| Công cụ SSM | Bản chất & Cách kích hoạt | Trường hợp sử dụng chuẩn trong bài thi |
| :--- | :--- | :--- |
| **Run Command** | Chạy lệnh/script **ad-hoc (một lần)** trên nhiều managed nodes cùng lúc theo Tag hoặc Instance ID. Hỗ trợ `Rate Control` (Concurrency & Error Threshold). | Chạy lệnh điều tra sự cố tức thì, restart service khẩn cấp, chạy script thu thập log trên 500 EC2 mà không cần SSH/Bastion. |
| **State Manager** | Chạy **định kỳ theo lịch (Association)** để duy trì cấu hình mong muốn (**anti-drift**). | Đảm bảo CloudWatch Agent luôn được cài & chạy, đảm bảo firewall rules hoặc antivirus config không bị thay đổi lệch chuẩn trên toàn fleet. |
| **Automation (Runbooks)** | Thực thi **workflow nhiều bước** (gọi AWS API, chạy script, đợi approval, gọi Lambda) — **không bắt buộc instance phải có SSM Agent** cho các bước gọi AWS API. | Tự động remediate AWS Config non-compliant (VD: đóng Security Group, bật S3 encryption), tạo AMI, chạy quy trình failover/DR hoặc approval workflow đa tài khoản. |
| **Patch Manager** | Quét (`Scan`) và cài đặt bản vá OS/ứng dụng tự động theo **Patch Baselines**, **Patch Groups** và **Maintenance Windows**. | Đáp ứng tuân thủ vá lỗ hổng bảo mật định kỳ hàng tháng (VD: chỉ vá Critical security patches sau 7 ngày phát hành) cho Windows & Linux. |
| **Distributor** | Đóng gói, quản lý phiên bản và phân phối **phần mềm/agent tùy chỉnh** (custom packages) lên managed nodes. | Phát hành nội bộ một agent giám sát tự viết (`.deb`, `.rpm`, `.msi`) cho hàng nghìn server, cài 1 lần (qua Run Command) hoặc tự động cập nhật khi có version mới (qua **State Manager**). |
| **Session Manager** | Cung cấp shell tương tác bảo mật qua IAM, **không mở port 22/3389**, không cần Bastion Host, ghi toàn bộ session log vào **S3 / CloudWatch Logs**. | Thay thế SSH/RDP truyền thống để đạt chuẩn bảo mật & audit mọi câu lệnh admin gõ vào server. |

> **Exam Tip**: Điều kiện tiên quyết để EC2 (hoặc On-Premises server) xuất hiện trong **SSM Fleet Manager**:
> 1. Có **SSM Agent** đang chạy.
> 2. Gắn IAM Instance Profile chứa policy **`AmazonSSMManagedInstanceCore`** (với On-Premises là Hybrid Activation IAM Role).
> 3. Có kết nối mạng HTTPS (port 443) tới các endpoints: `ssm`, `ssmmessages`, `ec2messages` (qua NAT Gateway hoặc **3 VPC Interface Endpoints** tương ứng trong môi trường air-gapped/private hoàn toàn).

---

## 2. SSM Patch Manager: Patch Baselines, Patch Groups & Maintenance Windows

Để vá hàng nghìn server an toàn mà không làm sập production, Patch Manager sử dụng mô hình 3 lớp:

1. **Patch Baselines**: Quy định *bản vá nào được phép cài* (Approval Rules theo Classification như `Security`/`Critical`, Severity, và **Auto-approval delay** — VD: đợi 7 ngày sau ngày phát hành mới tự động approve để tránh bản vá lỗi) và danh sách Exception (Approved/Rejected patches).
2. **Patch Groups**: Liên kết tập hợp instance với một Patch Baseline cụ thể bằng **EC2 Tag chính xác có key là `Patch Group`** (phân biệt chữ hoa/thường, có khoảng trắng!). Ví dụ:
   - `Patch Group = Prod-Web` → gắn với Baseline vá chậm (delay 7 ngày) và chạy Maintenance Window vào 2:00 AM Chủ Nhật.
   - `Patch Group = Dev-Web` → gắn với Baseline vá ngay (delay 0 ngày) để test trước vào Thứ Tư.
3. **Maintenance Windows**: Xác định *thời điểm* (Cron/Rate), *thời lượng* (Duration), *Cutoff* (ngừng khởi chạy task mới trước khi hết cửa sổ), *Targets* (theo Tag/Patch Group) và *Tasks* (chạy document `AWS-RunPatchBaseline` với `Operation=Install` hoặc `Scan`).

> **Exam Tip**:
> - Một instance chỉ thuộc về **tối đa 1 Patch Group** (do chỉ có 1 tag key `Patch Group`). Nếu instance không có tag `Patch Group`, nó sẽ dùng **Default Patch Baseline** của hệ điều hành đó.
> - Để xem báo cáo tuân thủ vá lỗi tập trung trên nhiều AWS Accounts & Regions → kết hợp **SSM Quick Setup / Resource Data Sync** đẩy dữ liệu compliance về một **S3 Bucket trung tâm** rồi truy vấn bằng **Amazon Athena + QuickSight**.

---

## 3. EC2 Image Builder: Xây dựng Golden AMI & Container Image Tự động

Thay vì boot EC2 từ AMI gốc rồi mất 10 phút chạy User Data cài đặt (gây chậm Auto Scaling và tăng nguy cơ lỗi khi package repo ngoài bị sập), chuẩn DevOps là **baking Golden AMI** bằng **EC2 Image Builder**.

### Kiến trúc Pipeline của EC2 Image Builder

```text
[Source AMI / Base Image]
        │
        ▼
[Image Recipe] = Base Image + Build Components (YAML) + Test Components (YAML) + EBS Volumes
        │
        ▼
[Infrastructure Configuration] = Instance Type, IAM Instance Profile, Subnet/SG, S3 Logs, SNS Topic
        │
        ▼
[Build Instance] ──► Chạy Build Components ──► Tạo Snapshot/AMI tạm
        │
        ▼
[Test Instance]  ──► Boot từ AMI mới ──► Chạy Test Components (VD: reboot-test, STIG/CIS check)
        │ (Pass 100%)
        ▼
[Distribution Settings] ──► Copy & Encrypt AMI sang nhiều Regions + Share Cross-Account / Organizations OU + Cập nhật Launch Template
```

### Điểm nhấn cần nhớ cho kỳ thi DOP-C02
- **Component YAML**: Định nghĩa các bước `build`, `validate`, `test` bằng cấu trúc YAML (hỗ trợ chạy bash/PowerShell, tích hợp sẵn các AWS-managed components như `update-linux`, `aws-cli-version-2`, `amazon-cloudwatch-agent-linux`, `stig-build-linux`).
- **Tích hợp Inspector / Vulnerability Scanning**: Có thể bật **Amazon Inspector** scan tự động trong Image Builder pipeline; nếu phát hiện CVE nghiêm trọng → fail pipeline, không phân phối AMI.
- **Distribution Settings**:
  - Tự động copy AMI sang nhiều Regions, **mã hóa lại bằng KMS Key của từng Region/Target Account**.
  - Chia sẻ trực tiếp với danh sách AWS Account ID hoặc **AWS Organizations / OU**.
  - Tự động cập nhật phiên bản mới cho **EC2 Launch Template** hoặc kích hoạt **EventBridge → SSM Parameter Store** lưu AMI ID mới nhất (`/golden-ami/web/latest`) để CloudFormation/ASG tự lấy.

---

## 4. Tự động hóa Phản hồi Sự cố: EventBridge + OpsCenter + Incident Manager

Khi hệ thống gặp sự cố ở tầng production, mục tiêu của Domain 5 là giảm **MTTD (Mean Time to Detect)** và **MTTR (Mean Time to Resolve)** thông qua kiến trúc Event-Driven:

### 4.1. Luồng phản hồi sự cố chuẩn (End-to-End)

1. **Phát hiện (Detection)**: CloudWatch Alarm (hoặc **Composite Alarm** để chống bão cảnh báo - alarm storm), GuardDuty Finding, AWS Health Event, hoặc EventBridge Rule bắt sự kiện lỗi (VD: ECS Task stopped bất thường, RDS Failover).
2. **Điều phối (Routing)**: **Amazon EventBridge** nhận sự kiện và rẽ nhánh:
   - **Nhánh tự động sửa (Auto-Remediation)**: Gọi **SSM Automation Runbook** hoặc **AWS Lambda** xử lý sự cố đã biết (VD: xóa disk đầy, cách ly EC2 bị nhiễm malware, thay thế node lỗi).
   - **Nhánh sự cố nghiêm trọng cần con người**: Kích hoạt **SSM Incident Manager** (với sự cố P1/P2 cần war-room) hoặc tạo **OpsItem** trong **SSM OpsCenter** (với sự cố vận hành thường ngày).

### 4.2. Phân biệt SSM OpsCenter vs SSM Incident Manager

| Tiêu chí | AWS Systems Manager OpsCenter | AWS Systems Manager Incident Manager |
| :--- | :--- | :--- |
| **Mức độ sự cố** | Sự cố vận hành thông thường (tạo **OpsItems** từ CloudWatch, EventBridge, Security Hub, Config). | Sự cố **nghiêm trọng (Critical Incidents)** ảnh hưởng SLA/khách hàng, cần huy động đội ngũ khẩn cấp. |
| **Cơ chế Escalation** | Không có lịch trực (on-call schedule) hay escalation tự động. | Có **Contacts**, **On-call Schedules**, và **Escalation Plans** (gọi điện thoại, SMS, email lần lượt qua các cấp nếu kỹ sư trực không xác nhận). |
| **Cộng tác & Runbook** | Đính kèm SSM Automation Runbook để kỹ sư bấm chạy thủ công/tự động, tích hợp Jira/ServiceNow. | Tự động tạo **Response Plan**: mở phòng chat **Slack / Microsoft Teams** qua AWS Chatbot, chạy sẵn SSM Automation Runbook thu thập log, gom metrics/timeline tự động. |
| **Hậu sự cố (Post-Incident)** | Đóng OpsItem khi xong. | Tự động tạo **Post-Incident Analysis (COE - Correction of Errors)** với timeline đầy đủ các bước đã làm để rút kinh nghiệm và tạo action items. |

> **Exam Tip**: Khi đề bài nhắc tới các từ khóa: *"on-call escalation plan"*, *"page engineers via SMS/voice"*, *"chat channel collaboration (Slack/Teams)"*, *"pre-configured Response Plan"*, và *"post-incident analysis (COE)"* → đáp án chính xác 100% là **AWS Systems Manager Incident Manager** (không phải chỉ dùng SNS thuần túy).

---

## 5. Checklist Ôn thi Nhanh (DOP-C02 Domain 5 & 2)

- [ ] **Run Command** = chạy lệnh 1 lần; **State Manager** = duy trì cấu hình định kỳ (anti-drift); **Automation** = workflow AWS API nhiều bước; **Distributor** = đóng gói & phân phối custom package.
- [ ] **Patch Manager** dùng tag **`Patch Group`** (exact key) để map instance vào Patch Baseline và chạy trong **Maintenance Windows**.
- [ ] Private EC2 không có internet muốn dùng SSM cần **3 VPC Interface Endpoints**: `ssm`, `ssmmessages`, `ec2messages` + IAM Role `AmazonSSMManagedInstanceCore`.
- [ ] **EC2 Image Builder** build → test → encrypt → phân phối Golden AMI đa vùng / đa tài khoản (hỗ trợ share qua AWS Organizations OU).
- [ ] **SSM Incident Manager** xử lý sự cố khẩn cấp bằng Response Plan, On-call Escalation, ChatOps (AWS Chatbot) và tự động lập **Post-Incident Analysis**.

---

[← Bài trước](06-cloudformation-cdk-ssm-iac.md) | [Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/06-iac-ssm-image-builder.md) | [Bài tiếp →](08-resilience-autoscaling-dr-fis.md)
