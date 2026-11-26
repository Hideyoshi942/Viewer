# Bài tập tình huống — EC2 Auto Scaling Nâng cao, Warm Pools & Lifecycle Hooks

> Target Tracking, Step/Predictive Scaling, Warm Pools, ASG Lifecycle Hooks, Mixed Instances Policy, ELB Health Checks và Multi-AZ High Availability.
> **Số câu hỏi:** 10 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A compliance team requires that whenever an Amazon EC2 instance in an Auto Scaling Group (ASG) is scaled in, all local diagnostic logs and heap dumps must be compressed and uploaded to an Amazon S3 bucket before the instance is terminated. The upload process typically takes 3 to 5 minutes. What is the MOST reliable and scalable way to implement this requirement?

- **A.** Add an ASG EC2_INSTANCE_TERMINATING lifecycle hook (15-min heartbeat), invoke SSM Run Command via EventBridge to upload logs, and call CompleteLifecycleAction.
- **B.** Configure a systemd shutdown script on the EC2 instance to compress and upload logs to Amazon S3 whenever the Linux OS receives a SIGTERM signal.
- **C.** Increase the Auto Scaling Group default cooldown period to 600 seconds and schedule a Linux cron job every minute to sync application logs to S3.
- **D.** Enable Termination Protection on all EC2 instances in the ASG and use an AWS Lambda function to upload logs and disable instance protection.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm tuân thủ yêu cầu rằng mỗi khi một Amazon EC2 instance trong Auto Scaling Group (ASG) bị scale in, tất cả log chẩn đoán cục bộ và heap dump phải được nén và tải lên một Amazon S3 bucket trước khi instance bị terminate. Quá trình tải lên thường mất từ 3 đến 5 phút. Cách ĐÁNG TIN CẬY NHẤT và có khả năng mở rộng nhất để triển khai yêu cầu này là gì?

**Đáp án đúng:** **A**

ASG Lifecycle Hooks (Terminating:Wait) kết hợp EventBridge và Systems Manager Run Command là mẫu kiến trúc chuẩn trên AWS để thực hiện các tác vụ dọn dẹp hoặc thu thập log (offloading logs) trước khi EC2 instance bị hủy khi scale-in.

- **A (Đúng):** Chính xác! ASG Lifecycle Hook (EC2_INSTANCE_TERMINATING) sẽ giữ instance ở trạng thái Terminating:Wait trong khoảng thời gian heartbeat timeout. EventBridge bắt sự kiện này, chạy SSM Run Command để nén và đẩy log lên S3, sau đó gọi CompleteLifecycleAction để ASG tiến hành terminate sạch sẽ.
- **B:** Sai. Thời gian shutdown mặc định của OS và EC2 termination rất ngắn, không đảm bảo đủ 3-5 phút để nén và tải dữ liệu lớn lên S3.
- **C:** Sai. Cooldown period chỉ trì hoãn hành động scale tiếp theo, không tạm dừng quá trình terminate của instance hiện tại.
- **D:** Sai. Bật Termination Protection làm ASG không thể tự động scale in bình thường và tạo ra quy trình thủ công phức tạp.

</details>

### Câu 2 `hard`

An e-commerce application runs on an Amazon EC2 Auto Scaling Group (ASG). Bootstrapping a new instance from scratch takes 8 minutes due to large ML model downloads and JVM warm-up, causing latency spikes during sudden traffic surges. In addition, the DevOps team needs an automated way to roll out monthly golden AMI updates across the fleet in controlled batches of 25% with a pause for validation between batches. Which TWO Auto Scaling features should the team configure? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Set the ASG HealthCheckGracePeriod to 30 seconds so newly launched EC2 instances begin serving application traffic immediately after launch.
- **B.** Configure an ASG Warm Pool with instances in the Stopped state so pre-initialized instances join rapidly while minimizing compute costs.
- **C.** Attach a Step Scaling policy with a 1-second cooldown period and a 10-second CloudWatch evaluation interval to launch extra instances proactively.
- **D.** Use ASG Instance Refresh with CheckpointPercentages [25, 50, 75, 100] and CheckpointDelay to roll out the new Launch Template AMI.
- **E.** Configure the ASG MixedInstancesPolicy to use EC2 Spot Instances exclusively with the lowest-price allocation strategy across all subnets.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng thương mại điện tử chạy trên Amazon EC2 Auto Scaling Group (ASG). Việc khởi tạo một instance mới từ đầu mất 8 phút do phải tải các mô hình ML lớn và làm nóng JVM, gây ra các đợt tăng độ trễ khi lưu lượng tăng đột biến. Ngoài ra, nhóm DevOps cần một cách tự động để triển khai các bản cập nhật golden AMI hàng tháng trên toàn bộ đội ngũ theo từng đợt kiểm soát 25% có tạm dừng để xác thực giữa các đợt. Nhóm nên cấu hình HAI tính năng Auto Scaling nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

ASG Warm Pools (trạng thái Stopped) tối ưu hóa thời gian scale-out cho các workload có thời gian khởi tạo lâu mà vẫn tiết kiệm chi phí compute. Trong khi đó, ASG Instance Refresh với CheckpointPercentages giúp triển khai AMI/Launch Template mới theo từng đợt an toàn.

- **A:** Sai. Giảm HealthCheckGracePeriod xuống 30 giây khi app cần 8 phút khởi động sẽ khiến ASG liên tục đánh dấu instance là unhealthy và terminate.
- **B (Đúng):** Chính xác! Warm Pool với trạng thái Stopped cho phép chạy trước quá trình bootstrap (tải ML model, khởi tạo ổ đĩa), sau đó dừng instance để không tốn phí EC2 compute (chỉ tốn phí EBS), giúp rút ngắn thời gian scale-out từ 8 phút xuống vài chục giây.
- **C:** Sai. Step Scaling không giải quyết được thời gian bootstrap 8 phút của từng instance mới khởi chạy.
- **D (Đúng):** Chính xác! ASG Instance Refresh hỗ trợ thay thế instance theo đợt (phased rollout) bằng CheckpointPercentages và CheckpointDelay để đội ngũ xác minh độ ổn định giữa các đợt cập nhật AMI mới.
- **E:** Sai. Dùng hoàn toàn Spot Instances làm tăng nguy cơ bị thu hồi đột ngột và không giải quyết bài toán thời gian khởi tạo hay cập nhật AMI theo đợt.

</details>

### Câu 3 `medium`

A media streaming service runs on an Amazon EC2 Auto Scaling Group (ASG). Traffic follows a highly predictable daily pattern—surging 5x every weekday at 08:00 AM—but also experiences occasional unpredictable viral spikes during breaking news events. Currently, using only a Target Tracking Scaling policy causes 4 minutes of elevated latency every weekday at 08:00 AM while new instances launch. What is the BEST scaling strategy to eliminate morning latency while still handling unexpected viral bursts?

- **A.** Replace the Target Tracking Scaling policy with a Simple Scaling policy triggered at a 30% average CPU utilization threshold.
- **B.** Increase the Auto Scaling Group Minimum Capacity to the 5x peak capacity permanently across all Availability Zones.
- **C.** Enable Predictive Scaling in ForecastOnly mode and delete the existing Target Tracking Scaling policy from the Auto Scaling Group.
- **D.** Combine ASG Predictive Scaling (ForecastAndScale) ahead of the 08:00 AM surge with Target Tracking Scaling for viral spikes.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một dịch vụ phát trực tuyến phương tiện chạy trên Amazon EC2 Auto Scaling Group (ASG). Lưu lượng tuân theo mô hình hàng ngày rất dễ dự đoán—tăng gấp 5 lần vào lúc 08:00 sáng mỗi ngày trong tuần—nhưng cũng thỉnh thoảng gặp các đợt tăng đột biến lan truyền (viral) không thể dự đoán trong các sự kiện tin tức nóng hổi. Hiện tại, việc chỉ sử dụng chính sách Target Tracking Scaling gây ra 4 phút độ trễ tăng cao vào mỗi 08:00 sáng các ngày trong tuần trong khi các instance mới khởi chạy. Chiến lược mở rộng TỐT NHẤT để loại bỏ độ trễ buổi sáng mà vẫn xử lý được các đợt bùng nổ bất ngờ là gì?

**Đáp án đúng:** **D**

Kết hợp Predictive Scaling (ForecastAndScale) cho lưu lượng có tính chu kỳ lặp lại với Target Tracking Scaling (Dynamic Scaling) cho các đột biến không lường trước là kiến trúc Auto Scaling tối ưu nhất cả về hiệu năng lẫn chi phí.

- **A:** Sai. Simple Scaling vẫn là cơ chế phản ứng thụ động (reactive) sau khi tải đã tăng và không tối ưu chi phí khi đặt ngưỡng quá thấp.
- **B:** Sai. Giữ nguyên mức capacity gấp 5 lần cả ngày gây lãng phí chi phí EC2 rất lớn ngoài giờ cao điểm.
- **C:** Sai. ForecastOnly chỉ vẽ biểu đồ dự báo chứ không thực sự scale instance, và xóa Target Tracking sẽ làm hệ thống không ứng phó được với viral spikes bất ngờ.
- **D (Đúng):** Chính xác! Predictive Scaling (chế độ ForecastAndScale) dùng Machine Learning phân tích lịch sử lưu lượng để tự động mở rộng năng lực TRƯỚC khung giờ cao điểm 08:00 sáng, kết hợp song song với Target Tracking Scaling để phản ứng nhanh với các đợt tăng đột biến bất thường.

</details>

### Câu 4 `medium`

A media streaming platform runs a Windows-based transcoding application on an Amazon EC2 Auto Scaling group (ASG). During live sports events, traffic spikes sharply within 2 minutes. However, newly launched instances take 12 minutes to boot, download a 15 GB codec bundle, and warm up application caches before passing ALB health checks. Keeping extra running instances idle 24/7 is too expensive. How can the DevOps engineer reduce scale-out latency to under 2 minutes while minimizing compute costs?

- **A.** Lower the Application Load Balancer target group health check interval to 5 seconds and set the healthy threshold count to 2 consecutive checks.
- **B.** Switch the Auto Scaling policy from Target Tracking Scaling to Simple Scaling with a 60-second default cooldown period and 1-minute CloudWatch alarms.
- **C.** Configure an ASG Warm Pool in the Stopped state, pre-initialize instances via User Data/lifecycle hooks, and enable ReuseOnScaleIn.
- **D.** Double the Auto Scaling group minimum capacity so pre-warmed idle On-Demand EC2 instances are always running continuously across all AZs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng phát trực tuyến phương tiện chạy ứng dụng chuyển mã trên nền tảng Windows trên một Amazon EC2 Auto Scaling group (ASG). Trong các sự kiện thể thao trực tiếp, lưu lượng tăng vọt mạnh trong vòng 2 phút. Tuy nhiên, các instance mới khởi chạy mất 12 phút để khởi động, tải gói codec 15 GB và làm nóng bộ nhớ đệm ứng dụng trước khi vượt qua kiểm tra sức khỏe của ALB. Việc giữ thêm các instance chạy nhàn rỗi 24/7 quá tốn kém. Kỹ sư DevOps có thể giảm độ trễ scale-out xuống dưới 2 phút đồng thời giảm thiểu chi phí tính toán bằng cách nào?

**Đáp án đúng:** **C**

EC2 Auto Scaling Warm Pools (trạng thái Stopped hoặc Hibernated) là giải pháp tối ưu cho các ứng dụng có thời gian khởi động/bootstrap dài nhưng cần scale-out cực nhanh với chi phí thấp (chỉ trả phí EBS volume thay vì phí compute EC2 liên tục).

- **A:** Sai. Giảm thời gian health check không rút ngắn được 12 phút boot OS và tải 15 GB dữ liệu.
- **B:** Sai. Đổi chính sách scaling không thay đổi thời gian khởi động 12 phút của từng EC2 instance mới.
- **C (Đúng):** Chính xác! ASG Warm Pool ở trạng thái Stopped cho phép khởi tạo trước toàn bộ OS và tải sẵn 15 GB codec vào EBS rồi tắt máy (không tốn tiền compute EC2, chỉ tốn chi phí lưu trữ EBS). Khi traffic tăng đột biến, ASG chỉ cần start lại instance đã cài sẵn trong chưa đầy 1-2 phút. ReuseOnScaleIn giúp tái sử dụng instance khi scale-in.
- **D:** Sai. Duy trì instance chạy 24/7 vi phạm yêu cầu tối ưu chi phí compute của đề bài.

</details>

### Câu 5 `medium`

A stateless web application runs on an Amazon EC2 Auto Scaling group (ASG) with a baseline requirement of 4 guaranteed instances and peak scaling up to 40 instances. The DevOps team wants to reduce compute costs by using Amazon EC2 Spot Instances for capacity above the baseline while minimizing the risk of Spot interruptions and proactively replacing Spot instances before they are reclaimed by AWS. Which TWO configurations should the team apply to the ASG? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Configure a Mixed Instances Policy with OnDemandBaseCapacity=4, low/zero OnDemandPercentageAboveBaseCapacity, and price-capacity-optimized Spot.
- **B.** Set SpotAllocationStrategy to lowest-price with SpotInstancePools set to 1 across all Availability Zones to minimize hourly EC2 instance costs.
- **C.** Use a single instance type in the EC2 Launch Template and set a maximum Spot bid price strictly lower than the On-Demand hourly price.
- **D.** Enable Capacity Rebalancing on the Auto Scaling group to proactively launch a replacement Spot instance upon rebalance recommendation signals.
- **E.** Disable Elastic Load Balancing health checks on the Auto Scaling group so Spot instance interruptions do not trigger replacement launches.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng web phi trạng thái chạy trên Amazon EC2 Auto Scaling group (ASG) với yêu cầu cơ sở là 4 instance được đảm bảo và mở rộng tối đa lên 40 instance. Nhóm DevOps muốn giảm chi phí tính toán bằng cách sử dụng Amazon EC2 Spot Instance cho phần công suất vượt mức cơ sở đồng thời giảm thiểu rủi ro bị gián đoạn Spot và chủ động thay thế các Spot instance trước khi chúng bị AWS thu hồi. Nhóm nên áp dụng HAI cấu hình nào cho ASG? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, D**

Best practice chạy Spot trên EC2 Auto Scaling: dùng Mixed Instances Policy đa dạng instance type với OnDemandBaseCapacity cho phần nền, chiến lược phân bổ price-capacity-optimized, và bật Capacity Rebalancing để thay thế chủ động khi nhận tín hiệu rebalance recommendation.

- **A (Đúng):** Chính xác! Mixed Instances Policy với OnDemandBaseCapacity=4 giữ 4 instance On-Demand làm nền ổn định, phần vượt mức dùng Spot kết hợp chiến lược price-capacity-optimized giúp chọn các Spot pool vừa tối ưu giá vừa có dung lượng dồi dào, ít bị thu hồi nhất.
- **B:** Sai. Chiến lược lowest-price chỉ chọn 1 pool rẻ nhất rất dễ bị gián đoạn hàng loạt (high interruption rate), đi ngược yêu cầu giảm thiểu rủi ro Spot interruption.
- **C:** Sai. Chỉ dùng 1 loại instance và giới hạn giá tối đa thấp làm tăng mạnh nguy cơ bị thu hồi Spot và thiếu dung lượng khi scale-out.
- **D (Đúng):** Chính xác! Capacity Rebalancing lắng nghe tín hiệu EC2 instance rebalance recommendation (phát ra sớm hơn thông báo 2 phút thu hồi) để chủ động khởi chạy Spot instance thay thế trước khi instance cũ bị thu hồi.
- **E:** Sai. Tắt ELB health check làm giảm khả năng phát hiện lỗi ứng dụng và không giúp ngăn ngừa Spot interruption.

</details>

### Câu 6 `medium`

A company runs a customer-facing web application on an Amazon EC2 Auto Scaling group (ASG) with 20 instances behind an Application Load Balancer. Every month, a new hardened golden AMI is released via EC2 Image Builder. The DevOps team needs to roll out the new Launch Template version across all 20 instances with zero downtime, pause automatically after replacing 20% and 50% of the fleet for 10 minutes each to allow verification, and automatically roll back to the previous Launch Template if an ALB 5XX CloudWatch alarm enters ALARM state during the rollout. What is the MOST native and operationally simple way to achieve this?

- **A.** Start an ASG Instance Refresh with MinHealthyPercentage=90, Checkpoints [20, 50, 100] (600s delay), and AutoRollback on the ALB 5XX alarm.
- **B.** Manually terminate 4 EC2 instances at a time from the EC2 console and monitor CloudWatch dashboards before terminating the next batch.
- **C.** Double the ASG desired capacity, wait 20 minutes for health checks, and then halve desired capacity using the OldestInstance termination policy.
- **D.** Use AWS Systems Manager Patch Manager with Maintenance Windows to replace the underlying AMI of running EC2 instances in place.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty chạy ứng dụng web hướng khách hàng trên Amazon EC2 Auto Scaling group (ASG) với 20 instance phía sau Application Load Balancer. Mỗi tháng, một golden AMI đã được hardening mới được phát hành qua EC2 Image Builder. Nhóm DevOps cần triển khai phiên bản Launch Template mới trên cả 20 instance với thời gian ngừng hoạt động bằng không, tự động tạm dừng sau khi thay thế 20% và 50% đội ngũ trong 10 phút mỗi lần để cho phép xác minh, và tự động rollback về Launch Template trước đó nếu một ALB 5XX CloudWatch alarm chuyển sang trạng thái ALARM trong quá trình triển khai. Cách NGUYÊN BẢN NHẤT và đơn giản nhất về mặt vận hành để đạt được điều này là gì?

**Đáp án đúng:** **A**

EC2 Auto Scaling Instance Refresh là tính năng chuẩn cho immutable infrastructure rollout (cập nhật Golden AMI/Launch Template) với đầy đủ kiểm soát Min/MaxHealthyPercentage, Checkpoints (canary baking) và AutoRollback theo CloudWatch Alarm.

- **A (Đúng):** Chính xác! EC2 Auto Scaling Instance Refresh hỗ trợ nguyên bản việc thay thế dần toàn bộ fleet theo Launch Template mới (không downtime với MinHealthyPercentage/MaxHealthyPercentage), hỗ trợ Checkpoints (tạm dừng tại 20%, 50% trong 600 giây) và AutoRollback tự động dựa trên CloudWatch Alarm.
- **B:** Sai. Thao tác thủ công tốn công sức, dễ sai sót và không có cơ chế tự động rollback khi alarm báo lỗi.
- **C:** Sai. Cách này không có các mốc checkpoint kiểm soát 20%/50% và không tự động rollback về Launch Template cũ khi ALB 5XX tăng cao.
- **D:** Sai. SSM Patch Manager chỉ cài đặt bản vá OS trên instance đang chạy, không thể thay thế AMI gốc của EC2 instance.

</details>

### Câu 7 `hard`

A video rendering worker fleet runs on an Amazon EC2 Auto Scaling group (ASG) polling jobs from an Amazon SQS queue. Each rendering job takes between 5 and 25 minutes to complete. During scale-in events, ASG frequently terminates instances mid-job, causing wasted compute and corrupted temporary outputs. The DevOps team needs to ensure that when an instance is selected for scale-in, it stops polling new SQS messages, finishes its current rendering job (up to 30 minutes), uploads final diagnostic logs to Amazon S3, and only then allows ASG to terminate the instance. How should the engineer implement this?

- **A.** Set the Application Load Balancer Connection Draining (deregistration delay) to 1,800 seconds across all worker target groups.
- **B.** Enable Instance Scale-In Protection permanently on all EC2 instances in the Auto Scaling group from the launch template.
- **C.** Attach an EC2_INSTANCE_TERMINATING hook; stop polling SQS, call RecordLifecycleActionHeartbeat, and call CompleteLifecycleAction when done.
- **D.** Set the Auto Scaling Group Default Cooldown period to 1,800 seconds so EC2 instances are never terminated during active rendering jobs in flight.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ worker kết xuất video chạy trên Amazon EC2 Auto Scaling group (ASG) đang poll công việc từ một Amazon SQS queue. Mỗi công việc kết xuất mất từ 5 đến 25 phút để hoàn thành. Trong các sự kiện scale-in, ASG thường xuyên terminate các instance giữa chừng công việc, gây lãng phí tài nguyên tính toán và hỏng các đầu ra tạm thời. Nhóm DevOps cần đảm bảo rằng khi một instance được chọn để scale-in, nó sẽ ngừng poll các SQS message mới, hoàn thành công việc kết xuất hiện tại (tối đa 30 phút), tải các log chẩn đoán cuối cùng lên Amazon S3 và chỉ sau đó mới cho phép ASG terminate instance. Kỹ sư nên triển khai việc này như thế nào?

**Đáp án đúng:** **C**

EC2 Auto Scaling Lifecycle Hooks (EC2_INSTANCE_TERMINATING) kết hợp RecordLifecycleActionHeartbeat và CompleteLifecycleAction là mô hình chuẩn để thực hiện graceful shutdown, hoàn tất tác vụ nền và đẩy log/trạng thái lên S3 trước khi instance bị terminate.

- **A:** Sai. Worker chạy nền đọc SQS không nằm sau ALB cho các job rendering, và ALB deregistration delay chỉ áp dụng cho HTTP request in-flight qua ALB.
- **B:** Sai. Bật Scale-In Protection vĩnh viễn trên mọi instance sẽ khiến ASG không bao giờ scale-in được để tiết kiệm chi phí (trừ khi ứng dụng tự bật/tắt dynamic scale-in protection cho từng job, nhưng lifecycle hook là cơ chế chuẩn cho graceful draining & upload log trước khi terminate).
- **C (Đúng):** Chính xác! ASG Lifecycle Hook loại EC2_INSTANCE_TERMINATING đưa instance vào trạng thái Terminating:Wait trước khi tắt máy. Worker dừng nhận job mới từ SQS, gọi RecordLifecycleActionHeartbeat để gia hạn thời gian chờ nếu job kéo dài, và gọi CompleteLifecycleAction (CONTINUE) sau khi xong việc và đẩy log lên S3.
- **D:** Sai. Cooldown chỉ trì hoãn thời gian giữa hai sự kiện scaling liên tiếp, không ngăn ASG chấm dứt ngay một instance đang chạy dở job khi sự kiện scale-in diễn ra.

</details>

### Câu 8 `medium`

An online trading platform runs on an Amazon EC2 Auto Scaling group (ASG). Every weekday at 09:30 AM market open, CPU and request volume surge 6x within 60 seconds. Reactive Target Tracking scaling alone reacts too late because instances take 4 minutes to warm up, causing brief 503 errors at market open. At the same time, unexpected breaking news during the day can also cause unscheduled traffic bursts. Which TWO Auto Scaling configurations should the DevOps engineer combine? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Replace all scaling policies with a single Simple Scaling policy configured with a 15-minute cooldown period across the Auto Scaling group.
- **B.** Enable Predictive Scaling (ForecastAndScale) on ALB/CPU metrics to scale out ahead of the 09:30 AM weekday surge.
- **C.** Set Predictive Scaling to ForecastOnly mode permanently so it scales out automatically ahead of recurring weekday market openings.
- **D.** Keep Target Tracking active with EstimatedInstanceWarmup (~240s) so new instances do not skew metrics during intraday bursts.
- **E.** Disable Scale-In on Target Tracking so the EC2 fleet permanently stays at peak market-opening capacity all day.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng giao dịch trực tuyến chạy trên Amazon EC2 Auto Scaling group (ASG). Vào lúc 09:30 sáng mở cửa thị trường mỗi ngày trong tuần, CPU và lượng request tăng vọt gấp 6 lần trong vòng 60 giây. Việc mở rộng theo Target Tracking phản ứng đơn thuần phản ứng quá muộn vì các instance mất 4 phút để làm nóng, gây ra các lỗi 503 ngắn khi mở cửa thị trường. Đồng thời, tin tức nóng hổi bất ngờ trong ngày cũng có thể gây ra các đợt bùng nổ lưu lượng không theo lịch trình. Kỹ sư DevOps nên kết hợp HAI cấu hình Auto Scaling nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Kết hợp Predictive Scaling (ForecastAndScale) để chủ động đón đầu các đợt tăng tải có tính chu kỳ (như 09:30 AM mỗi ngày) cùng Target Tracking Scaling (với EstimatedInstanceWarmup chính xác) để ứng phó linh hoạt với các đợt tăng tải đột xuất không đoán trước.

- **A:** Sai. Simple Scaling vẫn là phản ứng thụ động (reactive) nên vẫn trễ ở 09:30 AM, và cooldown 15 phút làm chậm khả năng đáp ứng tin tức bất ngờ.
- **B (Đúng):** Chính xác! Predictive Scaling sử dụng machine learning phân tích dữ liệu lịch sử (tối thiểu 24 giờ, tối ưu 14 ngày) để dự báo và chủ động scale-out TRƯỚC giờ mở cửa thị trường 09:30 AM (tính cả buffer thời gian khởi động).
- **C:** Sai. Chế độ ForecastOnly chỉ vẽ biểu đồ dự báo để kiểm chứng độ chính xác, KHÔNG thực sự thực hiện scale-out; phải chuyển sang ForecastAndScale.
- **D (Đúng):** Chính xác! Kết hợp Target Tracking Scaling (để xử lý các đợt tăng đột biến ngoài dự báo do tin tức bất ngờ) với Predictive Scaling, đồng thời cấu hình đúng EstimatedInstanceWarmup (~240 giây) giúp tránh hiện tượng scale quá tay (over-scaling) khi instance mới chưa kịp nhận tải.
- **E:** Sai. Tắt scale-in khiến hệ thống chạy ở mức công suất đỉnh suốt ngày đêm, gây lãng phí chi phí nghiêm trọng.

</details>

### Câu 9 `hard`

A stateful video-transcoding workload runs on an Amazon EC2 Auto Scaling group. Whenever a scale-in event occurs, an instance may be in the middle of processing a 5-minute video chunk and must finish uploading the final output and diagnostic logs to Amazon S3 before termination. How should the DevOps engineer handle this reliably?

- **A.** Increase the Application Load Balancer target group deregistration delay to 600 seconds so the Auto Scaling group waits before terminating the instance.
- **B.** Configure the Auto Scaling group termination policy to OldestLaunchTemplate and enable instance scale-in protection on all running EC2 instances.
- **C.** Enable CloudWatch Detailed Monitoring on the Auto Scaling group and set the default scale-in cooldown period to 900 seconds in the scaling policy.
- **D.** Attach an EC2_INSTANCE_TERMINATING lifecycle hook, trigger EventBridge to invoke SSM Run Command or Lambda to finish uploads, and call CompleteLifecycleAction.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một workload chuyển mã video có trạng thái (stateful) chạy trên Amazon EC2 Auto Scaling group. Mỗi khi xảy ra sự kiện scale-in, một instance có thể đang xử lý dở một đoạn video dài 5 phút và phải hoàn tất việc tải kết quả đầu ra cuối cùng cùng log chẩn đoán lên Amazon S3 trước khi bị terminate. Kỹ sư DevOps nên xử lý việc này như thế nào một cách đáng tin cậy?

**Đáp án đúng:** **D**

ASG Lifecycle Hooks (`EC2_INSTANCE_TERMINATING`) kết hợp EventBridge và `CompleteLifecycleAction` là cơ chế chuẩn để thực hiện graceful shutdown, drain workload nền hoặc đẩy log cuối cùng lên S3 trước khi EC2 bị chấm dứt.

- **A:** Sai. ALB deregistration delay chỉ áp dụng cho các kết nối HTTP đang mở từ ALB, không áp dụng cho tác vụ nền như video transcoding hay upload log lên S3.
- **B:** Sai. Termination policy chỉ chọn instance nào bị xóa trước, vẫn sẽ cắt ngang công việc đang chạy trên instance được chọn.
- **C:** Sai. Cooldown period chỉ ngăn ASG thực hiện hoạt động scaling tiếp theo quá sớm, không tạm dừng quá trình terminate một instance đã được chọn.
- **D (Đúng):** Chính xác! Lifecycle Hook EC2_INSTANCE_TERMINATING tạm giữ instance ở trạng thái Terminating:Wait, cho phép chạy tác vụ dọn dẹp/upload S3 (có thể gia hạn bằng RecordLifecycleActionHeartbeat) rồi gọi CompleteLifecycleAction để kết thúc an toàn.

</details>

### Câu 10 `hard`

An e-commerce application experiences two distinct traffic patterns: predictable daily surges every morning at 09:00 UTC, and sudden unpredictable flash-sale spikes where EC2 instances take 8 minutes to boot and load a 15 GB in-memory product catalog. Which TWO Amazon EC2 Auto Scaling features should be combined to handle both patterns cost-effectively? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Maintain 100% of peak flash-sale capacity running continuously in the Auto Scaling group using On-Demand EC2 instances.
- **B.** Configure Predictive Scaling on the Auto Scaling group to forecast the recurring daily morning surges and scale out proactively.
- **C.** Enable Auto Scaling Instance Refresh with a 90% minimum healthy percentage to run every hour before expected peak traffic.
- **D.** Configure an Auto Scaling Warm Pool with pre-initialized Stopped instances so flash-sale spikes bring instances InService fast.
- **E.** Disable health check grace periods and ELB health checks so newly launched instances immediately receive production traffic.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng thương mại điện tử có hai mô hình lưu lượng khác biệt: mức tăng đột biến hàng ngày có thể dự đoán được vào mỗi buổi sáng lúc 09:00 UTC, và các đợt tăng đột ngột không thể dự đoán từ flash sale khi mà EC2 instance mất 8 phút để khởi động và tải danh mục sản phẩm 15 GB vào bộ nhớ. Nên kết hợp HAI tính năng nào của Amazon EC2 Auto Scaling để xử lý cả hai mô hình một cách tiết kiệm chi phí? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Bài thi DOP-C02 thường kiểm tra khả năng phân biệt và kết hợp: Predictive Scaling dành cho lưu lượng có tính chu kỳ lặp lại; Warm Pools (Stopped/Hibernated) dành cho ứng dụng boot lâu gặp traffic spike bất ngờ với chi phí thấp.

- **A:** Sai. Chạy 100% công suất đỉnh 24/7 cực kỳ tốn kém, vi phạm yêu cầu tối ưu chi phí (cost-effectively).
- **B (Đúng):** Chính xác! Predictive Scaling sử dụng Machine Learning học từ dữ liệu lịch sử để dự đoán chính xác chu kỳ tăng tải hàng ngày lúc 09:00 UTC và mở rộng trước khi tải ập đến.
- **C:** Sai. Instance Refresh dùng để thay thế dần instance khi cập nhật Launch Template/AMI mới, không dùng để tăng công suất xử lý traffic spike.
- **D (Đúng):** Chính xác! Warm Pool giữ sẵn các instance đã khởi tạo và tải xong dữ liệu ở trạng thái Stopped (chỉ tốn phí EBS, không tốn phí compute), giúp ứng phó với flash-sale đột ngột trong vài giây thay vì 8 phút.
- **E:** Sai. Tắt health check grace period sẽ khiến ASG tưởng nhầm instance đang khởi động (8 phút) bị lỗi và liên tục terminate chúng.

</details>

---

[Mục lục DOP-C02](../00-tong-quan-va-lo-trinh-dop-c02.md)
