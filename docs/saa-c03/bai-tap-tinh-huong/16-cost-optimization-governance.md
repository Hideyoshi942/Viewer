# Bài tập tình huống — Chủ đề 16: Tối ưu Chi phí — Savings Plans, Spot Instances, S3 Tiering, Data Transfer & Billing Tools

> EC2 Purchasing Models (On-Demand, Spot, Reserved, Compute vs EC2 Instance Savings Plans), giảm chi phí NAT Gateway, AWS Budgets, Cost Explorer & Compute Optimizer.
> **Số câu hỏi:** 12 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A media rendering studio needs to run a nightly batch video transcoding job that takes approximately 3 hours to complete. The transcoding application is stateless, checkpoints its progress to Amazon S3 every minute, and can easily resume if an instance is interrupted. Which EC2 purchasing option provides the LOWEST cost for the worker nodes?

- **A.** 3-Year No Upfront Dedicated Hosts
- **B.** On-Demand Capacity Reservations
- **C.** Amazon EC2 Spot Instances
- **D.** EC2 Dedicated Instances

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một studio kết xuất đồ họa (media rendering) cần chạy một tác vụ chuyển mã video theo lô (batch) hàng đêm mất khoảng 3 giờ để hoàn thành. Ứng dụng chuyển mã không lưu trạng thái (stateless), lưu điểm kiểm tra (checkpoint) tiến trình lên Amazon S3 mỗi phút và có thể dễ dàng tiếp tục nếu một instance bị gián đoạn. Tùy chọn mua EC2 nào mang lại chi phí THẤP NHẤT cho các worker node?

**Đáp án đúng:** **C**

Cứ gặp bài toán **`batch processing`, `stateless`, `fault-tolerant / can handle interruptions`, `lowest cost`** -> Chọn ngay **EC2 Spot Instances** (giảm tới 90%).

- **A:** Sai vì Dedicated Hosts đắt đỏ và cam kết 3 năm hoàn toàn dư thừa cho tác vụ chỉ chạy 3 giờ mỗi đêm.
- **B:** Sai vì tính theo mức giá On-Demand đầy đủ kể cả khi không bật máy.
- **C (Đúng):** Đúng! **EC2 Spot Instances** cung cấp mức giảm giá lên tới **90%** so với On-Demand, cực kỳ lý tưởng cho các tác vụ xử lý lô (batch jobs), stateless và chịu được gián đoạn nhờ cơ chế checkpointing.
- **D:** Sai vì không giảm chi phí như Spot Instances.

</details>

### Câu 2 `medium`

A company wants to set a strict monthly AWS spending threshold of $10,000 for its Development account. When actual spend reaches 80% ($8,000), an email alert must be sent to the engineering manager; if actual spend reaches 100% ($10,000), the system must automatically apply an IAM policy or SCP that prevents developers from launching any new EC2 or RDS instances for the remainder of the month. Which AWS service provides this capability?

- **A.** AWS Pricing Calculator for monthly cost estimation
- **B.** AWS Cost and Usage Report (CUR) delivered to S3 alone
- **C.** AWS Artifact compliance report portal
- **D.** AWS Budgets configured with automated AWS Budgets Actions

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty muốn đặt ngưỡng chi tiêu AWS hàng tháng nghiêm ngặt là 10.000 USD cho Development account. Khi chi tiêu thực tế đạt 80% (8.000 USD), hệ thống phải gửi email cảnh báo cho quản lý kỹ thuật; nếu chi tiêu thực tế đạt 100% (10.000 USD), hệ thống phải tự động áp dụng một IAM policy hoặc SCP ngăn các lập trình viên khởi chạy bất kỳ EC2 hoặc RDS instance mới nào trong phần còn lại của tháng. Dịch vụ AWS nào cung cấp khả năng này?

**Đáp án đúng:** **D**

Phân biệt các công cụ Quản trị Chi phí trong đề SAA-C03:
- **AWS Pricing Calculator**: Ước tính chi phí giải pháp **trước khi xây dựng**.
- **AWS Cost Explorer**: Trực quan hóa lịch sử chi phí và **dự báo (forecast) 12 tháng tới** + gợi ý mua Savings Plans.
- **AWS Budgets + Budgets Actions**: Đặt ngân sách cảnh báo và **tự động thực thi hành động (gắn IAM/SCP/Stop EC2)** khi vượt ngân sách.
- **AWS Compute Optimizer**: Dùng ML phân tích CloudWatch metrics để gợi ý **hạ/nâng cấu hình (right-sizing)** cho EC2, EBS, Lambda, ECS Fargate.

- **A:** Sai vì Pricing Calculator chỉ là công cụ web dùng để ước tính chi phí thiết kế trước khi triển khai, không theo dõi hóa đơn thực tế hay thực thi hành động chặn.
- **B:** Sai vì CUR chỉ xuất file báo cáo chi tiết ra S3 chứ không tự động gửi cảnh báo hay chặn tạo tài nguyên.
- **C:** Sai vì Artifact là nơi tải chứng nhận tuân thủ bảo mật.
- **D (Đúng):** Đúng! **AWS Budgets** cho phép đặt ngưỡng cảnh báo chi phí thực tế hoặc dự báo (Forecasted), và **AWS Budgets Actions** có thể tự động gắn IAM Policy / SCP hoặc dừng các EC2/RDS instances khi vượt ngưỡng ngân sách.

</details>

### Câu 3 `medium`

An engineering team suspects that many of their 300 Amazon EC2 instances, Amazon EBS volumes, and AWS Lambda functions are over-provisioned with far more CPU, memory, and IOPS than necessary. Which AWS service uses machine learning to analyze historical Amazon CloudWatch utilization metrics and provides specific right-sizing recommendations to reduce costs?

- **A.** AWS Compute Optimizer
- **B.** Amazon Inspector Agent
- **C.** AWS Shield Standard
- **D.** AWS Secrets Manager

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ kỹ sư nghi ngờ rằng nhiều trong số 300 Amazon EC2 instance, Amazon EBS volume và hàm AWS Lambda của họ đang được cấp phát dư thừa CPU, bộ nhớ và IOPS hơn mức cần thiết. Dịch vụ AWS nào sử dụng machine learning để phân tích các chỉ số sử dụng Amazon CloudWatch lịch sử và đưa ra khuyến nghị điều chỉnh kích thước (right-sizing) cụ thể nhằm giảm chi phí?

**Đáp án đúng:** **A**

Khi gặp bài toán **`right-sizing recommendations` cho EC2, EBS, Lambda, ECS Fargate dựa trên Machine Learning phân tích lịch sử sử dụng** -> Đáp án chuẩn là **AWS Compute Optimizer**.

- **A (Đúng):** Đúng! **AWS Compute Optimizer** sử dụng Machine Learning để phân tích lịch sử sử dụng tài nguyên trên CloudWatch và đưa ra khuyến nghị chọn lại kích thước (Right-sizing) tối ưu cho EC2, Auto Scaling Groups, EBS volumes, ECS on Fargate và Lambda.
- **B:** Sai vì Inspector chỉ quét lỗ hổng bảo mật CVE.
- **C:** Sai vì Shield dùng để chống tấn công DDoS.
- **D:** Sai vì Secrets Manager dùng để lưu mật khẩu.

</details>

### Câu 4 `medium`

A finance team needs to prevent unexpected cloud spending across 25 AWS accounts. They want to receive an immediate email alert if monthly spending is forecasted to exceed $10,000 AND automatically restrict developers from launching new EC2 instances if the budget is breached. Which TWO AWS services or features should they configure? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Configure AWS Cost Explorer automation rules to automatically terminate running EC2 instances on breach.
- **B.** Enable Amazon Macie across all 25 AWS accounts to detect and block excessive EC2 API provisioning.
- **C.** Configure AWS Budgets with a forecasted cost threshold and email notifications.
- **D.** Configure AWS Budgets Actions to attach a restrictive IAM policy or SCP when the threshold is exceeded.
- **E.** Use AWS Trusted Advisor cost optimization checks to automatically deny EC2 RunInstances API calls.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm tài chính cần ngăn chặn chi tiêu đám mây ngoài dự kiến trên 25 AWS account. Họ muốn nhận email cảnh báo ngay lập tức nếu chi tiêu hàng tháng được dự báo vượt quá 10.000 USD VÀ tự động hạn chế lập trình viên khởi chạy các EC2 instance mới nếu ngân sách bị vượt. Họ nên cấu hình HAI dịch vụ hoặc tính năng AWS nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, D**

**AWS Budgets** kết hợp **AWS Budgets Actions** là giải pháp chuẩn để vừa cảnh báo vượt ngân sách vừa tự động áp dụng chính sách kiểm soát chi tiêu.

- **A:** Sai vì Cost Explorer chỉ dùng để xem biểu đồ và dự báo, không có chức năng tự động thực thi hành động chặn.
- **B:** Sai vì Macie là dịch vụ bảo mật dữ liệu PII trên S3.
- **C (Đúng):** Đúng! **AWS Budgets** hỗ trợ cảnh báo dựa trên chi phí thực tế (Actual) lẫn chi phí dự báo (Forecasted).
- **D (Đúng):** Đúng! **AWS Budgets Actions** có thể tự động gắn IAM Policy/SCP (hoặc tắt EC2/RDS) ngay khi ngân sách bị vượt ngưỡng.
- **E:** Sai vì Trusted Advisor chỉ đưa ra khuyến nghị, không tự động chặn API.

</details>

### Câu 5 `medium`

An enterprise is migrating an on-premises Microsoft SQL Server Enterprise workload to Amazon EC2. Due to strict Microsoft licensing agreements (Bring Your Own License - BYOL), the license cost is calculated based on the number of physical sockets and physical cores on the underlying server hardware. Which EC2 tenancy model must the company use?

- **A.** EC2 Dedicated Instances
- **B.** EC2 Dedicated Hosts
- **C.** EC2 Spot Instances
- **D.** EC2 On-Demand Shared Tenancy

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp đang di chuyển workload Microsoft SQL Server Enterprise on-premises lên Amazon EC2. Do các thỏa thuận cấp phép nghiêm ngặt của Microsoft (Bring Your Own License - BYOL), chi phí bản quyền được tính dựa trên số lượng socket vật lý và nhân vật lý trên phần cứng máy chủ bên dưới. Công ty phải sử dụng mô hình thuê (tenancy model) EC2 nào?

**Đáp án đúng:** **B**

Nhớ quy tắc phân biệt: **BYOL tính theo Sockets / Physical Cores** → **Dedicated Hosts**. Chỉ cần cách ly phần cứng vật lý đơn thuần → Dedicated Instances.

- **A:** Sai vì Dedicated Instances tuy chạy trên phần cứng riêng nhưng KHÔNG cung cấp thông tin về Sockets và Physical Cores vật lý để đáp ứng điều khoản BYOL theo core/socket.
- **B (Đúng):** Đúng! **EC2 Dedicated Hosts** cung cấp cho bạn quyền kiểm soát toàn bộ máy chủ vật lý và hiển thị chính xác số **Sockets và Physical Cores**, bắt buộc cho các giấy phép **BYOL** (SQL Server, Oracle, Windows Server).
- **C:** Sai vì Spot Instances chạy trên phần cứng dùng chung và có thể bị thu hồi bất cứ lúc nào.
- **D:** Sai vì Shared Tenancy không đáp ứng yêu cầu BYOL theo physical cores/sockets.

</details>

### Câu 6 `medium`

A genomics company runs batch image-processing jobs that are stateless, checkpointed every 2 minutes, and can tolerate interruptions without impacting business SLAs. Which EC2 purchasing option delivers the lowest possible compute cost for this workload?

- **A.** Amazon EC2 On-Demand Instances
- **B.** Convertible Reserved Instances
- **C.** Amazon EC2 Dedicated Hosts
- **D.** Amazon EC2 Spot Instances

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty gen học chạy các tác vụ xử lý ảnh theo lô (batch) không lưu trạng thái, lưu checkpoint mỗi 2 phút và có thể chịu được gián đoạn mà không ảnh hưởng đến SLA kinh doanh. Tùy chọn mua EC2 nào mang lại chi phí compute thấp nhất có thể cho workload này?

**Đáp án đúng:** **D**

Từ khóa vàng trong SAA-C03: **stateless, fault-tolerant, batch processing, can tolerate interruptions, lowest cost** -> **EC2 Spot Instances** (tiết kiệm tới 90%).

- **A:** Sai vì On-Demand có chi phí cao nhất.
- **B:** Sai vì Reserved Instances đắt hơn nhiều so với Spot Instances và phù hợp cho workload chạy đều đặn lâu dài.
- **C:** Sai vì Dedicated Hosts là lựa chọn đắt nhất, dùng cho bài toán bản quyền phần mềm (BYOL) gắn với socket/core vật lý.
- **D (Đúng):** Đúng! EC2 Spot Instances giúp tiết kiệm tới 90% so với On-Demand và là lựa chọn rẻ nhất cho các tác vụ batch, stateless, có khả năng chịu gián đoạn (fault-tolerant/checkpointed).

</details>

### Câu 7 `medium`

A company has noticed a sharp increase in AWS monthly bills due to NAT Gateway data processing charges. Investigation reveals that an analytics cluster in private subnets transfers 50 TB per month to and from Amazon S3 in the same Region. What is the MOST cost-effective way to eliminate these NAT Gateway charges?

- **A.** Deploy a Gateway VPC Endpoint for Amazon S3 and update the private subnet route tables to route S3 traffic through it.
- **B.** Deploy a paid Interface VPC Endpoint (AWS PrivateLink) for Amazon S3 in the private subnets.
- **C.** Move the analytics cluster to a public subnet and assign public IP addresses to all EC2 instances.
- **D.** Replace the managed AWS NAT Gateway with a smaller self-managed EC2 NAT instance in a public subnet.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty nhận thấy hóa đơn AWS hàng tháng tăng vọt do phí xử lý dữ liệu của NAT Gateway. Điều tra cho thấy một cụm phân tích trong các private subnet truyền 50 TB mỗi tháng tới và từ Amazon S3 trong cùng Region. Cách tối ưu chi phí NHẤT để loại bỏ các khoản phí NAT Gateway này là gì?

**Đáp án đúng:** **A**

Một trong những mẹo tối ưu chi phí mạng phổ biến nhất ở SAA-C03: Giảm hóa đơn **NAT Gateway** khi truy cập S3/DynamoDB -> Dùng **Gateway VPC Endpoint** (miễn phí).

- **A (Đúng):** Đúng! Gateway VPC Endpoint cho S3 hoàn toàn miễn phí cả phí theo giờ lẫn phí xử lý dữ liệu, giúp loại bỏ hoàn toàn 50 TB lưu lượng qua NAT Gateway.
- **B:** Sai vì Interface VPC Endpoint vẫn tính phí theo giờ và theo GB dữ liệu truyền qua, không tiết kiệm bằng Gateway VPC Endpoint vốn miễn phí 100%.
- **C:** Sai vì đưa cụm phân tích ra public subnet làm giảm bảo mật nghiêm trọng.
- **D:** Sai vì NAT instance có băng thông hạn chế, khó quản lý HA và vẫn không tối ưu bằng Gateway VPC Endpoint miễn phí.

</details>

### Câu 8 `medium`

A startup wants to receive an automated email and Slack notification whenever their monthly AWS spending exceeds 80% of their $5,000 budget, or is forecasted to exceed $5,000 by the end of the month. Which AWS service provides this capability?

- **A.** AWS Cost Explorer
- **B.** AWS Trusted Advisor
- **C.** AWS Cost and Usage Report (CUR)
- **D.** AWS Budgets

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty khởi nghiệp muốn nhận thông báo tự động qua email và Slack bất cứ khi nào chi tiêu AWS hàng tháng vượt quá 80% ngân sách 5.000 USD, hoặc được dự báo vượt quá 5.000 USD vào cuối tháng. Dịch vụ AWS nào cung cấp khả năng này?

**Đáp án đúng:** **D**

Cần phân biệt công cụ quản lý chi phí: **AWS Budgets** = đặt ngưỡng và cảnh báo (actual/forecasted); **Cost Explorer** = biểu đồ phân tích xu hướng; **CUR** = báo cáo chi tiết nhất xuất ra S3.

- **A:** Sai vì Cost Explorer dùng để trực quan hóa và phân tích chi phí lịch sử/dự báo, không tự gửi cảnh báo ngân sách.
- **B:** Sai vì Trusted Advisor đưa ra khuyến nghị tối ưu hóa tài nguyên (như EC2 nhàn rỗi, EBS chưa gắn), không quản lý ngưỡng ngân sách dự báo.
- **C:** Sai vì CUR xuất dữ liệu hóa đơn chi tiết nhất ra S3 dưới dạng CSV/Parquet để phân tích bằng Athena/QuickSight.
- **D (Đúng):** Đúng! AWS Budgets cho phép thiết lập ngưỡng ngân sách và gửi cảnh báo tự động (qua Email/SNS/Chatbot tới Slack) dựa trên cả chi phí thực tế (actual) lẫn chi phí dự báo (forecasted).

</details>

### Câu 9 `medium`

A company wants to audit its AWS accounts to identify underutilized Amazon EC2 instances, unattached Amazon EBS volumes, and idle Amazon RDS instances in order to reduce monthly spend. Which TWO AWS services provide automated rightsizing and idle-resource recommendations? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** AWS Systems Manager Session Manager
- **B.** AWS Compute Optimizer
- **C.** AWS CloudTrail
- **D.** AWS Trusted Advisor
- **E.** Amazon Inspector

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty muốn kiểm toán các AWS account của mình để xác định các Amazon EC2 instance sử dụng dưới mức, các Amazon EBS volume chưa gắn kết và các Amazon RDS instance nhàn rỗi nhằm giảm chi tiêu hàng tháng. HAI dịch vụ AWS nào cung cấp các khuyến nghị tự động về điều chỉnh kích thước (rightsizing) và tài nguyên nhàn rỗi? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Hai dịch vụ cốt lõi giúp phát hiện tài nguyên dư thừa và tối ưu cấu hình (rightsizing) trên AWS là **AWS Compute Optimizer** (dùng ML phân tích metrics) và **AWS Trusted Advisor** (kiểm tra các tài nguyên nhàn rỗi/chưa gắn).

- **A:** Sai vì Session Manager dùng để truy cập shell vào EC2 an toàn không cần mở port SSH.
- **B (Đúng):** Đúng! AWS Compute Optimizer sử dụng Machine Learning phân tích các chỉ số CloudWatch lịch sử để đề xuất kích thước tối ưu (rightsizing) cho EC2, Auto Scaling, EBS và Lambda.
- **C:** Sai vì CloudTrail ghi nhận lịch sử API calls chứ không phân tích hiệu suất sử dụng tài nguyên để tối ưu chi phí.
- **D (Đúng):** Đúng! AWS Trusted Advisor (mục Cost Optimization) tự động phát hiện EC2 có mức sử dụng thấp, EBS volumes không gắn kết (unattached), Elastic IP không sử dụng và RDS nhàn rỗi.
- **E:** Sai vì Inspector quét lỗ hổng bảo mật CVE, không tối ưu chi phí.

</details>

### Câu 10 `medium`

A company serves 100 TB of static images and downloadable software installers per month from an Amazon S3 bucket directly to global users over the internet. The CFO notices high monthly Data Transfer Out (DTO) costs from Amazon S3. What is the MOST cost-effective architectural change to reduce S3 outbound data transfer costs?

- **A.** Enable S3 Transfer Acceleration on the bucket to optimize global internet routing.
- **B.** Move the S3 bucket objects to the Amazon S3 Standard-IA storage class.
- **C.** Place an Amazon CloudFront distribution in front of the S3 bucket and configure caching.
- **D.** Enable S3 Cross-Region Replication to copy the bucket to three additional Regions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty phục vụ 100 TB hình ảnh tĩnh và trình cài đặt phần mềm tải xuống mỗi tháng từ một Amazon S3 bucket trực tiếp tới người dùng toàn cầu qua internet. CFO nhận thấy chi phí Data Transfer Out (DTO) hàng tháng từ Amazon S3 rất cao. Thay đổi kiến trúc tối ưu chi phí NHẤT để giảm chi phí truyền dữ liệu đi ra ngoài của S3 là gì?

**Đáp án đúng:** **C**

Mẹo tối ưu hóa **Data Transfer Cost** kinh điển: Đặt **Amazon CloudFront** trước S3/ALB/EC2 để miễn phí truyền tải từ origin ra CloudFront và tận dụng giá DTO rẻ hơn cùng cơ chế cache.

- **A:** Sai vì S3 Transfer Acceleration tính thêm phí trên mỗi GB truyền tải để tăng tốc độ, làm tăng chi phí chứ không giảm.
- **B:** Sai vì S3 Standard-IA còn tính thêm phí retrieval per-GB khi đọc dữ liệu ra ngoài, trong khi giá Data Transfer Out ra internet vẫn giữ nguyên.
- **C (Đúng):** Đúng! Truyền dữ liệu từ S3 sang CloudFront là hoàn toàn MIỄN PHÍ (không tính phí Data Transfer Out từ S3). Ngoài ra, CloudFront giảm giá DTO ra internet (và có 1 TB miễn phí mỗi tháng trong Free Tier vĩnh viễn) đồng thời cache ở edge giúp giảm số lần gọi về S3.
- **D:** Sai vì CRR phát sinh thêm phí lưu trữ ở các Region mới và phí truyền dữ liệu cross-Region.

</details>

### Câu 11 `medium`

A company has an Amazon S3 bucket containing terabytes of failed or incomplete multipart uploads from mobile clients that never finished uploading. These incomplete parts are silently incurring significant monthly storage charges. How can the company automatically clean up these incomplete uploads at the lowest cost and effort?

- **A.** Transition all objects in the bucket to S3 Glacier Deep Archive after 1 day via Lifecycle rules.
- **B.** Write an AWS Lambda function scheduled daily via EventBridge to scan every S3 prefix and delete incomplete uploads.
- **C.** Enable S3 Versioning on the bucket so old incomplete upload parts are overwritten automatically.
- **D.** Create an S3 Lifecycle rule with the `AbortIncompleteMultipartUpload` action set to 7 days.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có một Amazon S3 bucket chứa hàng terabyte các bản tải lên nhiều phần (multipart upload) bị lỗi hoặc chưa hoàn thành từ các client di động không tải lên xong. Những phần chưa hoàn thành này đang âm thầm phát sinh chi phí lưu trữ hàng tháng đáng kể. Làm thế nào công ty có thể tự động dọn dẹp các bản tải lên chưa hoàn thành này với chi phí và công sức thấp nhất?

**Đáp án đúng:** **D**

Thực hành tốt (Best Practice) trên S3 để tránh rò rỉ chi phí ngầm từ các file upload bị đứt quãng: Bật S3 Lifecycle rule **`AbortIncompleteMultipartUpload`**.

- **A:** Sai vì Lifecycle transition chỉ áp dụng cho các object đã hoàn tất upload, không dọn dẹp các incomplete multipart upload parts.
- **B:** Sai vì tốn công viết/duy trì code Lambda và phát sinh chi phí LIST API không cần thiết so với S3 Lifecycle rule có sẵn.
- **C:** Sai vì Versioning không xóa incomplete multipart uploads.
- **D (Đúng):** Đúng! S3 Lifecycle Rule có hành động `AbortIncompleteMultipartUpload` giúp tự động xóa các phần upload dở dang sau số ngày chỉ định (ví dụ 7 ngày) hoàn toàn tự động và không cần viết code.

</details>

### Câu 12 `medium`

A company has a high-throughput data processing pipeline running across two Amazon EC2 clusters in `us-east-1` that exchange 100 TB of data per month with each other. Currently, the instances in Cluster A and Cluster B are distributed across different Availability Zones, resulting in high cross-AZ data transfer charges. How can the solutions architect minimize data transfer costs while keeping the traffic inside AWS?

- **A.** Configure Cluster A and Cluster B to communicate using their Public IPv4 addresses across the same AZ.
- **B.** Deploy an AWS Transit Gateway between Cluster A and Cluster B to consolidate inter-AZ routing.
- **C.** Route all data pipeline traffic between Cluster A and Cluster B through a central NAT Gateway.
- **D.** Place Cluster A and Cluster B in the same Availability Zone and use private IP addresses for communication.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty có pipeline xử lý dữ liệu thông lượng cao chạy trên hai cụm Amazon EC2 tại `us-east-1` trao đổi 100 TB dữ liệu mỗi tháng với nhau. Hiện tại, các instance trong Cluster A và Cluster B được phân bố trên các Availability Zone khác nhau, dẫn đến chi phí truyền dữ liệu liên AZ (cross-AZ) cao. Làm thế nào solutions architect có thể giảm thiểu chi phí truyền dữ liệu trong khi vẫn giữ lưu lượng bên trong AWS?

**Đáp án đúng:** **D**

Quy tắc vàng về **EC2 Data Transfer Cost**: Cùng AZ + **Private IP** = **Miễn phí ($0/GB)**; Khác AZ hoặc dùng **Public/Elastic IP** = **Tính phí**.

- **A:** Sai vì giao tiếp qua Public IP dù trong cùng một AZ vẫn bị AWS tính phí Data Transfer ($0.01/GB mỗi chiều).
- **B:** Sai vì Transit Gateway tính thêm phí xử lý dữ liệu ($0.02/GB) và không cần thiết trong cùng 1 VPC.
- **C:** Sai vì NAT Gateway tính phí $0.045/GB xử lý dữ liệu, làm tăng chi phí gấp nhiều lần.
- **D (Đúng):** Đúng! Giao tiếp giữa các EC2 dùng Private IP trong **cùng một Availability Zone** được miễn phí Data Transfer hoàn toàn ($0.00/GB), trong khi giao tiếp khác AZ tính phí $0.01/GB mỗi chiều ($0.02/GB hai chiều).

</details>

---

[Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md)
