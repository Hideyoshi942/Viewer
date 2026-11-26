# Bài tập tình huống — Auto-Remediation, SSM Automation & Incident Manager

> Systems Manager Automation Runbooks, Incident Manager Response Plans, OpsCenter OpsItems, AWS Config Auto-Remediation và Lambda Remediation Workflows.
> **Số câu hỏi:** 9 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A large enterprise running workloads across 40 AWS accounts in AWS Organizations wants to automate responses to AWS-scheduled Amazon EC2 hardware retirement events. Whenever AWS schedules an EC2 instance for retirement in any member account, a centralized operations account must automatically receive the event, notify the workload owner, and trigger an AWS Systems Manager Automation runbook to stop and start the instance during the next approved maintenance window. How should the DevOps team architect this?

- **A.** Configure AWS CloudTrail management trails in every member account to log EC2 hardware retirement notices and forward them to CloudWatch Logs.
- **B.** Deploy an AWS Lambda function in each of the 40 member accounts to scrape the public AWS Service Health Dashboard RSS feed every 10 minutes.
- **C.** Enable AWS Health Organizational View, match aws.health EC2 retirement events in EventBridge, and trigger SSM Automation and SNS notifications.
- **D.** Use AWS Trusted Advisor fault tolerance checks in the management account to automatically reboot EC2 instances scheduled for hardware retirement.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp lớn chạy các workload trên 40 tài khoản AWS trong AWS Organizations muốn tự động hóa phản ứng đối với các sự kiện ngừng hoạt động phần cứng Amazon EC2 do AWS lên lịch. Mỗi khi AWS lên lịch ngừng hoạt động một EC2 instance trong bất kỳ tài khoản thành viên nào, một tài khoản vận hành tập trung phải tự động nhận sự kiện, thông báo cho chủ sở hữu workload và kích hoạt một AWS Systems Manager Automation runbook để dừng và khởi động lại instance trong khung giờ bảo trì được phê duyệt tiếp theo. Nhóm DevOps nên thiết kế kiến trúc này như thế nào?

**Đáp án đúng:** **C**

Các sự kiện bảo trì phần cứng (EC2 retirement/scheduled changes) được phát ra qua AWS Health. Kết hợp AWS Health Organizational View với EventBridge và SSM Automation giúp tự động hóa hoàn toàn việc xử lý sự cố chủ động trên quy mô nhiều tài khoản.

- **A:** Sai. Thông báo bảo trì/retirement phần cứng từ AWS được phát qua AWS Health, không phải là CloudTrail API call.
- **B:** Sai. Public Service Health Dashboard chỉ hiển thị sự cố dịch vụ chung toàn vùng, không hiển thị thông báo retirement cụ thể cho từng EC2 instance của tài khoản.
- **C (Đúng):** Chính xác! AWS Health tích hợp với AWS Organizations (Organizational View) cho phép tài khoản Delegated Administrator nhận sự kiện aws.health tập trung qua EventBridge từ mọi member account, sau đó kích hoạt tự động SSM Automation để stop/start instance (chuyển sang phần cứng mới) và gửi thông báo SNS.
- **D:** Sai. Trusted Advisor không tự động reboot instance; hơn nữa reboot không di chuyển EC2 sang host phần cứng mới (cần stop và start lại instance).

</details>

### Câu 2 `hard`

A security operations team requires near-real-time automated remediation whenever anyone adds an inbound Security Group rule allowing SSH (TCP port 22) from 0.0.0.0/0 in a Production AWS account. The offending rule must be revoked within seconds, and an operational ticket must be automatically created in AWS Systems Manager OpsCenter with details of the IAM principal who made the change. Which solution delivers the fastest and most maintainable automation?

- **A.** Enable Amazon Inspector network reachability scans on an hourly schedule and send findings via EventBridge to an Amazon SNS topic.
- **B.** Use VPC Flow Logs with a CloudWatch Metric Filter to detect inbound SSH packets from the internet and automatically terminate the EC2 instance.
- **C.** Run a nightly AWS CloudFormation Drift Detection job across all stacks and revert the entire VPC stack when Security Group drift is detected.
- **D.** Use EventBridge on CloudTrail AuthorizeSecurityGroupIngress to invoke Lambda, revoke port 22 from 0.0.0.0/0, and call ssm:CreateOpsItem.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm vận hành bảo mật yêu cầu khắc phục tự động theo thời gian gần thực bất cứ khi nào có ai đó thêm một quy tắc inbound Security Group cho phép SSH (TCP port 22) từ 0.0.0.0/0 trong tài khoản AWS Production. Quy tắc vi phạm phải bị thu hồi trong vài giây và một ticket vận hành phải tự động được tạo trong AWS Systems Manager OpsCenter kèm thông tin chi tiết về IAM principal đã thực hiện thay đổi. Giải pháp nào mang lại khả năng tự động hóa nhanh nhất và dễ bảo trì nhất?

**Đáp án đúng:** **D**

Mẫu Event-Driven Auto-Remediation sử dụng CloudTrail -> EventBridge -> Lambda/SSM Automation -> SSM OpsCenter cung cấp tốc độ phản ứng tính bằng giây, thu hồi chính xác rule vi phạm và lưu vết người thực hiện để điều tra.

- **A:** Sai. Chạy theo lịch hàng giờ không đáp ứng yêu cầu khắc phục trong vài giây và Inspector không tự động thu hồi Security Group rule.
- **B:** Sai. Terminate EC2 instance gây gián đoạn dịch vụ Production và chỉ phát hiện sau khi đã có traffic SSH đi vào.
- **C:** Sai. Chạy hàng đêm quá chậm so với yêu cầu near-real-time và Drift Detection không tự động thu hồi rule.
- **D (Đúng):** Chính xác! EventBridge bắt trực tiếp sự kiện CloudTrail AuthorizeSecurityGroupIngress chỉ trong vài giây (nhanh hơn chu kỳ đánh giá của Config periodic rule), gọi Lambda/SSM Automation để thu hồi ngay rule vi phạm và tạo OpsItem trong SSM OpsCenter kèm đầy đủ thông tin userIdentity.

</details>

### Câu 3 `medium`

A reliability engineering team wants to standardize critical production incident management natively within AWS. When a critical Amazon CloudWatch Alarm fires, the system must automatically create an incident record, page the primary on-call engineer via SMS/voice (and escalate to the secondary engineer after 10 minutes if unacknowledged), post updates to a dedicated Slack channel, execute an initial diagnostic AWS Systems Manager Automation runbook, and generate a post-incident analysis timeline. Which AWS service provides this end-to-end workflow?

- **A.** Amazon EventBridge Pipes connected directly to Amazon SES to send formatted incident alert emails to the engineering mailing list.
- **B.** AWS Personal Health Dashboard integrated with the AWS Support API and an automated Amazon SNS email distribution list.
- **C.** AWS Systems Manager Incident Manager with Contacts, Escalation Plan, AWS Chatbot Slack channel, and a Response Plan linked to SSM Automation.
- **D.** Amazon CloudWatch Synthetics browser canaries paired with an Amazon SNS email subscription and a static Amazon S3 runbook.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ thuật độ tin cậy muốn chuẩn hóa quy trình quản lý sự cố production quan trọng ngay trong AWS. Khi một Amazon CloudWatch Alarm quan trọng kích hoạt, hệ thống phải tự động tạo một bản ghi sự cố, gọi điện/nhắn tin SMS cho kỹ sư trực chính (và chuyển cấp lên kỹ sư dự phòng sau 10 phút nếu chưa được xác nhận), đăng cập nhật lên một kênh Slack chuyên dụng, thực thi một AWS Systems Manager Automation runbook chẩn đoán ban đầu và tạo dòng thời gian phân tích sau sự cố. Dịch vụ AWS nào cung cấp quy trình đầu cuối này?

**Đáp án đúng:** **C**

AWS Systems Manager Incident Manager là nền tảng điều phối phản hồi sự cố (incident response) native trên AWS, kết nối CloudWatch Alarms/EventBridge với Response Plans, Escalation Plans, AWS Chatbot (Slack/Teams), SSM Automation runbooks và Post-Incident Analysis.

- **A:** Sai. EventBridge Pipes + SES không có tính năng gọi điện/SMS leo thang theo lịch trực (escalation plan), không tích hợp quản lý timeline sự cố hay post-incident analysis.
- **B:** Sai. AWS Health Dashboard chỉ thông báo sự cố phía hạ tầng AWS, không phải nền tảng điều phối on-call incident response cho ứng dụng của doanh nghiệp.
- **C (Đúng):** Chính xác! AWS Systems Manager Incident Manager hỗ trợ trọn gói quy trình quản lý sự cố: Contacts & Escalation Plans (gọi điện/SMS và leo thang nếu không phản hồi), tích hợp AWS Chatbot (Slack/Teams), tự động chạy SSM Automation runbook chẩn đoán, ghi nhận timeline và tạo mẫu Post-Incident Analysis.
- **D:** Sai. Synthetics chỉ dùng để giám sát chủ động (canaries), không cung cấp escalation plan, runbook execution hay post-incident analysis.

</details>

### Câu 4 `medium`

A DevOps organization wants to standardize its Sev-1 production outage response. When a critical Amazon CloudWatch alarm transitions to ALARM state, the system must automatically create an incident record, page the primary on-call engineer via SMS/voice, escalate to the secondary engineer if unacknowledged after 10 minutes, post updates into a dedicated Slack channel, automatically kick off an AWS Systems Manager Automation diagnostic runbook, and generate a structured post-incident analysis template once resolved. Which AWS service natively orchestrates this entire workflow?

- **A.** AWS Systems Manager OpsCenter with manual OpsItems created by on-call operators and linked to an Amazon S3 runbook repository.
- **B.** Amazon SNS topic sending alert emails to an engineering distribution list combined with AWS Support API case creation.
- **C.** AWS Personal Health Dashboard integrated with AWS Config conformance packs and an Amazon SES notification distribution list.
- **D.** SSM Incident Manager with a Response Plan, Contacts/Escalation Plans, AWS Chatbot Slack integration, and an SSM Automation runbook.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức DevOps muốn chuẩn hóa quy trình ứng phó sự cố production mức Sev-1. Khi một Amazon CloudWatch alarm quan trọng chuyển sang trạng thái ALARM, hệ thống phải tự động tạo bản ghi sự cố, gọi điện/nhắn tin SMS cho kỹ sư trực chính, chuyển cấp lên kỹ sư dự phòng nếu không được xác nhận sau 10 phút, đăng cập nhật vào một kênh Slack chuyên dụng, tự động khởi chạy một AWS Systems Manager Automation runbook chẩn đoán và tạo mẫu phân tích sau sự cố có cấu trúc sau khi được giải quyết. Dịch vụ AWS nào điều phối toàn bộ quy trình này một cách nguyên bản?

**Đáp án đúng:** **D**

AWS Systems Manager Incident Manager là công cụ điều phối sự cố nghiêm trọng (Sev-1) gốc trên AWS với đầy đủ Response Plans, On-call Schedules, Escalation Plans, ChatOps (Slack/Teams), Auto-runbook và Post-incident analysis.

- **A:** Sai. OpsCenter quản lý các vấn đề vận hành (OpsItems) mức thông thường nhưng không có tính năng paging SMS/voice, escalation plan hay post-incident analysis như Incident Manager.
- **B:** Sai. SNS email không có cơ chế nhận xác nhận (acknowledgement), không có escalation sau 10 phút và không tự tạo post-incident analysis.
- **C:** Sai. AWS Health Dashboard chỉ thông báo sự cố từ phía hạ tầng AWS, không điều phối phản hồi sự cố ứng dụng kèm on-call escalation.
- **D (Đúng):** Chính xác! AWS Systems Manager Incident Manager đáp ứng trọn gói: Response Plan kích hoạt trực tiếp từ CloudWatch Alarm/EventBridge, tự động gọi Contacts/Escalation Plan (SMS/voice), tích hợp Slack qua AWS Chatbot, tự chạy SSM Automation runbook thu thập chẩn đoán và tạo sẵn mẫu Post-incident analysis.

</details>

### Câu 5 `medium`

A large enterprise with 100 AWS accounts in AWS Organizations wants to proactively automate responses whenever AWS schedules an Amazon EC2 instance retirement (AWS_EC2_INSTANCE_RETIREMENT_SCHEDULED) or detects degraded underlying hardware in any member account. When such a notification occurs, the platform must centrally create a Jira ticket, notify the owning team in Slack, and automatically trigger an AWS Systems Manager Automation runbook to safely stop and start (or replace) the affected instance during non-peak hours. Which architecture is BEST?

- **A.** Have an on-call engineer log into the AWS Health Dashboard of each of the 100 member accounts every morning to check for retirement notices.
- **B.** Enable AWS Health Organizational View and StackSets-deployed EventBridge rules forwarding aws.health to a central bus for SSM/Slack/Jira.
- **C.** Enable AWS CloudTrail Insights in the management account to automatically detect upcoming EC2 hardware retirement schedules.
- **D.** Monitor EC2 CPUUtilization and StatusCheckFailed metrics with CloudWatch Alarms to predict when AWS will schedule hardware retirement.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp lớn với 100 tài khoản AWS trong AWS Organizations muốn chủ động tự động hóa phản ứng bất cứ khi nào AWS lên lịch ngừng hoạt động một Amazon EC2 instance (AWS_EC2_INSTANCE_RETIREMENT_SCHEDULED) hoặc phát hiện phần cứng bên dưới bị suy giảm trong bất kỳ tài khoản thành viên nào. Khi thông báo như vậy xảy ra, nền tảng phải tạo một ticket Jira tập trung, thông báo cho nhóm sở hữu trên Slack và tự động kích hoạt một AWS Systems Manager Automation runbook để dừng và khởi động lại (hoặc thay thế) instance bị ảnh hưởng một cách an toàn ngoài giờ cao điểm. Kiến trúc nào là TỐT NHẤT?

**Đáp án đúng:** **B**

AWS Health kết hợp Amazon EventBridge (source: aws.health) là kênh tự động hóa chuẩn để phản ứng chủ động với các sự kiện hạ tầng AWS (EC2 retirement, EBS degradation, certificate expiration) trên toàn AWS Organizations.

- **A:** Sai. Kiểm tra thủ công 100 tài khoản mỗi sáng không thể mở rộng và không có tính tự động hóa.
- **B (Đúng):** Chính xác! Sự kiện từ AWS Health (source: aws.health) phát trực tiếp vào EventBridge theo thời gian thực. Gom sự kiện từ các member account về EventBridge bus trung tâm (triển khai bằng StackSets) kết hợp AWS Health Organizational View cho phép tự động mở ticket Jira, báo Slack và kích hoạt SSM Automation xử lý instance sắp retirement.
- **C:** Sai. CloudTrail Insights phát hiện bất thường về tần suất gọi API, không phát thông báo lịch bảo trì/retirement phần cứng của AWS.
- **D:** Sai. CPUUtilization không thể biết trước lịch bảo trì phần cứng hay retirement của AWS.

</details>

### Câu 6 `medium`

An operations center manages 45 AWS accounts across 4 Regions. Engineers currently waste time switching between AWS Config, CloudWatch Alarms, EC2 console, and Security Hub to triage routine operational issues such as unattached EBS volumes, failing EC2 status checks, or non-compliant resources. The operations lead wants a single centralized AWS console view that aggregates operational work items across all accounts and Regions, links each issue to contextual resource metadata, and recommends pre-built AWS Systems Manager Automation runbooks to resolve them in one click. Which combination of AWS Systems Manager features should they enable?

- **A.** Enable AWS Systems Manager Parameter Store and Fleet Manager only across all member accounts and Regions.
- **B.** Enable SSM Explorer (Organizations sync) and SSM OpsCenter to ingest OpsItems from EventBridge/Config/Security Hub with runbooks.
- **C.** Use Amazon Inspector across AWS Organizations as the centralized operational ticketing and runbook remediation dashboard.
- **D.** Enable AWS Cost Explorer and AWS Budgets to track EC2 status check failures and AWS Config compliance findings.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một trung tâm vận hành quản lý 45 tài khoản AWS trên 4 Region. Các kỹ sư hiện đang lãng phí thời gian chuyển đổi qua lại giữa AWS Config, CloudWatch Alarms, EC2 console và Security Hub để phân loại các vấn đề vận hành thường ngày như EBS volume chưa gắn, kiểm tra trạng thái EC2 bị lỗi hoặc tài nguyên không tuân thủ. Trưởng nhóm vận hành muốn một chế độ xem bảng điều khiển AWS tập trung duy nhất tổng hợp các mục công việc vận hành trên tất cả tài khoản và Region, liên kết từng vấn đề với siêu dữ liệu tài nguyên theo ngữ cảnh và đề xuất các AWS Systems Manager Automation runbook dựng sẵn để giải quyết chúng chỉ bằng một cú nhấp chuột. Họ nên bật sự kết hợp các tính năng AWS Systems Manager nào?

**Đáp án đúng:** **B**

AWS Systems Manager Explorer (bảng tổng quan đa tài khoản/Region) kết hợp OpsCenter (quản lý OpsItems kèm ngữ cảnh và SSM Automation runbooks đề xuất) là trung tâm điều hành tác vụ vận hành hằng ngày (routine ops) trên AWS.

- **A:** Sai. Parameter Store lưu biến cấu hình còn Fleet Manager quản lý node OS, không tổng hợp OpsItems hay đề xuất runbook từ Config/Security Hub.
- **B (Đúng):** Chính xác! SSM Explorer cung cấp bảng điều khiển tổng hợp đa tài khoản, đa Region (OpsData), còn SSM OpsCenter gom các vấn đề vận hành thành OpsItems (tự động từ EventBridge/CloudWatch/Config/Security Hub), đính kèm ngữ cảnh tài nguyên và đề xuất sẵn SSM Automation runbook để xử lý nhanh.
- **C:** Sai. Amazon Inspector chỉ quét lỗ hổng CVE trên EC2/ECR/Lambda, không quản lý OpsItems vận hành tổng quát như EBS unattached hay EC2 status checks.
- **D:** Sai. AWS Cost Explorer chỉ phân tích chi phí và mức sử dụng tài nguyên, không xử lý sự cố vận hành.

</details>

### Câu 7 `medium`

An SRE team wants to practice ChatOps in a dedicated Slack incident channel. During an outage, engineers in the channel need to receive formatted Amazon CloudWatch Alarm and AWS Security Hub notifications, run read-only AWS CLI diagnostic commands (such as describing EC2 instances or viewing CloudWatch graphs), and execute a specific approved AWS Systems Manager Automation runbook directly from Slack. However, security requires a hard ceiling ensuring that NO engineer in the Slack channel can ever run destructive commands like ec2:TerminateInstances or s3:DeleteBucket, even if the channel's IAM role were accidentally over-privileged. How should the DevOps engineer configure this?

- **A.** Build a custom Slack bot on EC2 using an IAM role with AdministratorAccess and rely on Slack channel rules telling engineers not to delete resources.
- **B.** Configure AWS Chatbot for Slack with SNS, assigning a least-privilege Channel Role and a Channel Guardrail Policy blocking destructive actions.
- **C.** Use Amazon SNS Email-JSON subscriptions forwarded directly into a Slack channel webhook without using AWS Chatbot or Channel Guardrails.
- **D.** Share AWS Root account credentials in a pinned Slack channel message so on-call engineers can respond to incidents faster.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm SRE muốn thực hành ChatOps trong một kênh sự cố Slack chuyên dụng. Trong thời gian gián đoạn, các kỹ sư trong kênh cần nhận thông báo Amazon CloudWatch Alarm và AWS Security Hub đã được định dạng, chạy các lệnh chẩn đoán AWS CLI chỉ đọc (như mô tả các EC2 instance hoặc xem đồ thị CloudWatch) và thực thi một AWS Systems Manager Automation runbook cụ thể đã được phê duyệt trực tiếp từ Slack. Tuy nhiên, bộ phận bảo mật yêu cầu một giới hạn cứng đảm bảo KHÔNG một kỹ sư nào trong kênh Slack có thể chạy các lệnh phá hủy như ec2:TerminateInstances hoặc s3:DeleteBucket, ngay cả khi IAM role của kênh vô tình được cấp quá nhiều quyền. Kỹ sư DevOps nên cấu hình việc này như thế nào?

**Đáp án đúng:** **B**

AWS Chatbot (Amazon Q Developer in chat applications) cung cấp ChatOps an toàn trên Slack/Microsoft Teams với hai lớp phân quyền: Channel/User IAM Role và Channel Guardrail Policies (giới hạn quyền tối đa cho toàn bộ kênh chat).

- **A:** Sai. Cấp AdministratorAccess và chỉ dựa vào quy tắc hành chính không tạo ra rào chắn kỹ thuật (hard ceiling) chống lệnh phá hủy.
- **B (Đúng):** Chính xác! AWS Chatbot (Amazon Q Developer in chat applications) tích hợp nguyên bản với Slack/Microsoft Teams cho thông báo và chạy lệnh CLI/SSM runbook. Tính năng Channel Guardrail Policies đóng vai trò trần bảo vệ (tương tự permissions boundary) cho kênh chat, đảm bảo không ai trong kênh có thể thực thi lệnh phá hủy kể cả khi role kênh bị cấp thừa quyền.
- **C:** Sai. Chuyển tiếp email vào Slack chỉ nhận thông báo một chiều, không thể chạy lệnh chẩn đoán CLI hay kích hoạt SSM Automation runbook tương tác từ Slack.
- **D:** Sai. Chia sẻ tài khoản Root là vi phạm bảo mật nghiêm trọng nhất trên AWS.

</details>

### Câu 8 `hard`

An enterprise wants to automatically detect scheduled EC2 hardware retirement events across all 80 accounts in AWS Organizations, immediately notify the workload owner in Slack, and automatically trigger an SSM Automation runbook to safely stop and start non-ASG instances during their approved maintenance window. Which architecture should the DevOps team build?

- **A.** Configure AWS Config managed rules to scan EC2 instance hardware health every hour and send an Amazon SES email to the root account owner.
- **B.** Create a CloudWatch Alarm on StatusCheckFailed_Instance for every EC2 instance to predict underlying host hardware retirement before it happens.
- **C.** Poll the EC2 DescribeInstances and DescribeInstanceStatus APIs from a scheduled Lambda function every minute across all 80 member accounts.
- **D.** Enable AWS Health Organizational View, forward aws.health EventBridge events to a central Event Bus, and route to AWS Chatbot and SSM Automation.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp muốn tự động phát hiện các sự kiện ngừng hoạt động phần cứng EC2 theo lịch trình trên tất cả 80 tài khoản trong AWS Organizations, thông báo ngay lập tức cho chủ sở hữu workload trên Slack và tự động kích hoạt một SSM Automation runbook để dừng và khởi động lại an toàn các instance không thuộc ASG trong khung giờ bảo trì đã phê duyệt. Nhóm DevOps nên xây dựng kiến trúc nào?

**Đáp án đúng:** **D**

AWS Health + Amazon EventBridge + SSM Automation / AWS Chatbot là mô hình tự động hóa phản hồi sự kiện bảo trì hạ tầng (Scheduled Changes / EC2 Retirement) chuẩn ở quy mô AWS Organizations.

- **A:** Sai. AWS Config theo dõi thay đổi cấu hình tài nguyên, không nhận thông báo bảo trì phần cứng (hardware retirement) từ AWS Health.
- **B:** Sai. StatusCheckFailed_Instance chỉ báo lỗi phần mềm/OS sau khi sự cố đã xảy ra, không báo trước lịch retirement phần cứng.
- **C:** Sai. Polling liên tục trên 80 tài khoản dễ bị API throttling và kém hiệu quả hơn nhiều so với mô hình event-driven dùng AWS Health + EventBridge.
- **D (Đúng):** Chính xác! AWS Health Organizational View gom toàn bộ thông báo bảo trì phần cứng xuyên Organization; EventBridge bắt sự kiện aws.health (EC2_INSTANCE_RETIREMENT_SCHEDULED) để tự động gửi Slack qua AWS Chatbot và chạy SSM Automation stop/start instance di chuyển sang phần cứng mới.

</details>

### Câu 9 `medium`

An SRE team wants to standardize how Severity-1 production outages are handled. When a critical CloudWatch Alarm enters the ALARM state, AWS must automatically page the primary on-call engineer (escalating to a secondary engineer after 10 minutes if unacknowledged), spin up a Slack collaboration channel, attach an SSM Automation runbook, and generate a structured post-incident analysis document afterward. Which AWS capability fulfills ALL of these requirements?

- **A.** AWS Systems Manager OpsCenter with OpsItems, SSM Automation associations, and Amazon SNS email notifications.
- **B.** AWS Security Hub custom actions integrated with Amazon EventBridge rules and Amazon SES email templates.
- **C.** AWS Systems Manager Incident Manager with Response Plans, Escalation Plans, AWS Chatbot, and Post-Incident Analysis.
- **D.** Amazon EventBridge Pipes sending CloudWatch alarm state changes directly to an Amazon DynamoDB audit table.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm SRE muốn chuẩn hóa cách xử lý các sự cố production mức độ Severity-1. Khi một CloudWatch Alarm quan trọng chuyển sang trạng thái ALARM, AWS phải tự động gọi cho kỹ sư trực chính (chuyển cấp lên kỹ sư dự phòng sau 10 phút nếu không được xác nhận), mở một kênh cộng tác Slack, đính kèm một SSM Automation runbook và tạo tài liệu phân tích sau sự cố có cấu trúc sau đó. Tính năng AWS nào đáp ứng TẤT CẢ các yêu cầu này?

**Đáp án đúng:** **C**

AWS Systems Manager Incident Manager là câu trả lời chuẩn khi đề thi nhắc đến: Response Plan, On-Call Contacts & Escalation Plan, Collaboration Chat Channel và Post-Incident Analysis (Post-mortem).

- **A:** Sai. SSM OpsCenter quản lý các ticket vận hành thường ngày (OpsItems), không có cơ chế on-call escalation plan theo thời gian hay Post-Incident Analysis chuyên biệt cho P1 outage như Incident Manager.
- **B:** Sai. Security Hub tập trung vào phát hiện bảo mật/tuân thủ, không phải công cụ quản lý lịch trực on-call và ứng phó sự cố P1.
- **C (Đúng):** Chính xác! SSM Incident Manager tích hợp trọn gói Response Plans, lịch trực/leo thang (Contacts & Escalation Plans), phòng chat Slack/Teams (AWS Chatbot), chạy SSM Runbook và mẫu báo cáo Post-Incident Analysis.
- **D:** Sai. Lưu alarm vào DynamoDB không cung cấp tính năng gọi trực ca, leo thang sự cố hay tích hợp Slack/post-mortem.

</details>

---

[Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md)
