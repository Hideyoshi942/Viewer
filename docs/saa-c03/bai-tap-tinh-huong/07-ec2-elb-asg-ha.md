# Bài tập tình huống — Chủ đề 7: Compute, Load Balancing & Auto Scaling — EC2, ALB, NLB, GWLB & Auto Scaling Groups

> ALB vs NLB vs Gateway Load Balancer (GWLB), Target Tracking & Predictive Auto Scaling, Cross-Zone Load Balancing & Multi-AZ High Availability.
> **Số câu hỏi:** 5 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A company wants to deploy a fleet of third-party virtual network firewall appliances on Amazon EC2 instances to inspect all ingress and egress traffic across multiple VPCs before the traffic reaches application servers. The solution must scale the firewall appliances horizontally and operate transparently at Layer 3. Which load balancer is specifically built for this use case?

- **A.** Application Load Balancer (ALB) with Layer 7 host-based listener forwarding rules
- **B.** Gateway Load Balancer (GWLB) combined with Gateway Load Balancer Endpoints (GWLBE)
- **C.** Classic Load Balancer (CLB) configured with TCP passthrough and Proxy Protocol
- **D.** Amazon API Gateway REST API with private VPC Link integration endpoints

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty muốn triển khai một cụm thiết bị tường lửa mạng ảo của bên thứ ba trên các Amazon EC2 instance để kiểm tra toàn bộ lưu lượng ingress và egress qua nhiều VPC trước khi lưu lượng đến máy chủ ứng dụng. Giải pháp phải mở rộng quy mô các thiết bị tường lửa theo chiều ngang và hoạt động minh bạch ở Layer 3. Loại load balancer nào được xây dựng riêng cho trường hợp sử dụng này?

**Đáp án đúng:** **B**

Hễ thấy từ khóa **`third-party virtual security appliances` / `inline firewall / IDS / IPS / deep packet inspection at Layer 3`** -> Chọn ngay **Gateway Load Balancer (GWLB)**!

- **A:** Sai vì ALB hoạt động ở tầng 7 (HTTP/HTTPS), không thể kiểm tra gói tin trong suốt ở tầng 3 cho mọi giao thức mạng.
- **B (Đúng):** Đúng! **Gateway Load Balancer (GWLB)** hoạt động ở tầng 3 (Network Layer, giao thức GENEVE cổng 6081) chuyên dùng để triển khai, cân bằng tải và mở rộng cụm thiết bị mạng/tường lửa ảo của bên thứ ba (Firewall, IDS/IPS).
- **C:** Sai vì CLB là thế hệ cũ đã ngừng khuyến nghị và không hỗ trợ GENEVE/Layer 3 inspection.
- **D:** Sai vì API Gateway chỉ quản lý REST/HTTP/WebSocket APIs.

</details>

### Câu 2 `medium`

An e-commerce application uses an Application Load Balancer (ALB) and an Amazon EC2 Auto Scaling group (ASG). Occasionally, the web server process (Nginx) on an EC2 instance crashes even though the underlying EC2 operating system and hardware remain healthy. As a result, the ASG does not replace the broken instance. How can the architect ensure the ASG automatically replaces instances with crashed web processes?

- **A.** Enable Sticky Sessions (session affinity) on the Application Load Balancer Target Group.
- **B.** Increase the Auto Scaling group default cooldown period to allow more time for Nginx restarts.
- **C.** Replace the Application Load Balancer with a Layer 4 Network Load Balancer (NLB).
- **D.** Change the Auto Scaling group Health Check type from `EC2` to `ELB`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng thương mại điện tử sử dụng Application Load Balancer (ALB) và Amazon EC2 Auto Scaling group (ASG). Thỉnh thoảng, tiến trình máy chủ web (Nginx) trên một EC2 instance bị sập mặc dù hệ điều hành và phần cứng EC2 bên dưới vẫn hoạt động bình thường. Do đó, ASG không thay thế instance bị lỗi. Làm thế nào kiến trúc sư có thể đảm bảo ASG tự động thay thế các instance có tiến trình web bị sập?

**Đáp án đúng:** **D**

Để ASG thay thế instance khi **ứng dụng bên trong bị treo/crash** (nhưng EC2 OS vẫn sống) → Đổi **ASG Health Check Type sang `ELB`**.

- **A:** Sai vì Sticky Sessions chỉ giữ người dùng dính vào 1 instance, không giúp ASG phát hiện lỗi ứng dụng.
- **B:** Sai vì cooldown chỉ làm chậm chu kỳ scale tiếp theo.
- **C:** Sai vì vấn đề nằm ở cấu hình Health Check Type của ASG đang để `EC2`.
- **D (Đúng):** Đúng! Mặc định ASG chỉ kiểm tra `EC2` status check. Đổi sang **`ELB` Health Check** sẽ giúp ASG dựa vào kết quả kiểm tra HTTP endpoint của ALB; nếu Nginx chết và ALB báo Unhealthy, ASG sẽ tự động thay thế instance.

</details>

### Câu 3 `medium`

A company runs a stateless video rendering batch processing job on Amazon EC2. The job can be interrupted and resumed from checkpoints stored in Amazon S3. Currently, the job runs on On-Demand `c5.4xlarge` instances inside an Auto Scaling Group, resulting in high monthly compute costs. Which TWO actions will maximize cost savings while maintaining fault tolerance? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Purchase 3-year All Upfront Standard Reserved Instances to cover the temporary batch rendering job.
- **B.** Configure the Auto Scaling Group to use Spot Instances with a diversified list of instance types (e.g., `c5.4xlarge`, `c5a.4xlarge`).
- **C.** Migrate the video rendering batch job onto Amazon EC2 Dedicated Hosts with single-tenant hardware.
- **D.** Use the `price-capacity-optimized` allocation strategy for the Spot capacity in the Auto Scaling Group.
- **E.** Restrict the Auto Scaling Group to a single Availability Zone and a single Spot instance type to simplify capacity.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty chạy tác vụ xử lý kết xuất video theo lô (batch) không lưu trạng thái trên Amazon EC2. Tác vụ có thể bị gián đoạn và tiếp tục lại từ các checkpoint lưu trong Amazon S3. Hiện tại, tác vụ chạy trên các On-Demand instance `c5.4xlarge` bên trong một Auto Scaling Group, dẫn đến chi phí compute hàng tháng cao. HAI hành động nào sẽ tối đa hóa mức tiết kiệm chi phí trong khi vẫn duy trì khả năng chịu lỗi? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Best Practice cho **EC2 Spot Instances trong ASG**: Đa dạng hóa **nhiều Instance Types + nhiều AZ** và dùng chiến lược **`price-capacity-optimized`**.

- **A:** Sai vì batch job chạy không liên tục và có thể dùng Spot rẻ hơn tới 90% so với tối đa 72% của RI.
- **B (Đúng):** Đúng! **Spot Instances** giúp giảm tới **90%** chi phí cho tác vụ chịu gián đoạn (checkpointing trên S3), và đa dạng hóa nhiều loại instance giúp giảm tối đa nguy cơ bị thu hồi đồng loạt.
- **C:** Sai vì Dedicated Hosts đắt hơn rất nhiều.
- **D (Đúng):** Đúng! Chiến lược **`price-capacity-optimized`** chọn các Spot pool vừa có dung lượng dồi dào (ít bị thu hồi) vừa có giá thấp.
- **E:** Sai vì giới hạn 1 AZ và 1 loại instance làm tăng mạnh rủi ro hết Spot capacity.

</details>

### Câu 4 `medium`

A microservices application is hosted on Amazon ECS behind a single Application Load Balancer (ALB). Requests to `api.example.com/orders/*` must route to the Orders target group, while requests to `api.example.com/payments/*` must route to the Payments target group. How should the solutions architect configure the ALB?

- **A.** Replace the ALB with a Network Load Balancer and configure URL path-based routing rules on TCP.
- **B.** Deploy two separate ALBs, one for Orders and one for Payments, behind a Classic Load Balancer.
- **C.** Use Amazon Route 53 path-based routing records to point `/orders/*` and `/payments/*` to different ECS services.
- **D.** Configure path-based routing on the ALB HTTPS listener to forward `/orders/*` and `/payments/*` to target groups.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng microservice được lưu trữ trên Amazon ECS phía sau một Application Load Balancer (ALB) duy nhất. Các yêu cầu tới `api.example.com/orders/*` phải được định tuyến đến Orders target group, trong khi các yêu cầu tới `api.example.com/payments/*` phải được định tuyến đến Payments target group. Solutions architect nên cấu hình ALB như thế nào?

**Đáp án đúng:** **D**

Điều hướng dựa trên **URL path (`/orders/*`)**, **Hostname (`orders.example.com`)**, **HTTP headers**, hoặc **Query string** -> Tính năng đặc trưng của **Application Load Balancer (ALB)**.

- **A:** Sai vì Network Load Balancer hoạt động ở Layer 4 nên không đọc được URL path HTTP như `/orders/*`.
- **B:** Sai vì hoàn toàn không cần thiết và tốn kém gấp đôi chi phí khi một ALB duy nhất đã hỗ trợ path-based routing.
- **C:** Sai vì Route 53 là dịch vụ DNS chỉ phân giải tên miền (`api.example.com`), không thấy được URL path.
- **D (Đúng):** Đúng! Application Load Balancer hoạt động ở Layer 7, hỗ trợ Path-based routing và Host-based routing để điều hướng lưu lượng từ một ALB duy nhất tới nhiều microservice target groups.

</details>

### Câu 5 `medium`

An e-commerce company has predictable daily traffic surges every weekday morning at 9:00 AM when employees log in, followed by unpredictable flash-sale spikes during the afternoon. The web tier runs on an Amazon EC2 Auto Scaling group. Which TWO scaling policies should the solutions architect combine to ensure capacity is ready before 9:00 AM and can also react to afternoon flash sales? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Set the Auto Scaling group minimum, desired, and maximum capacity to the peak flash-sale size 24/7.
- **B.** Configure a Scheduled Scaling policy to scale out the Auto Scaling group shortly before 9:00 AM on weekdays.
- **C.** Configure a Target Tracking Scaling policy (e.g., 60% average CPU) to handle unpredictable afternoon spikes.
- **D.** Configure Manual Scaling only and have an operator adjust capacity via the AWS Management Console.
- **E.** Disable Auto Scaling health checks so instances are never replaced during unexpected traffic spikes.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty thương mại điện tử có lưu lượng truy cập tăng vọt có thể dự đoán trước vào mỗi sáng các ngày trong tuần lúc 9:00 sáng khi nhân viên đăng nhập, tiếp theo là các đợt tăng đột biến flash-sale khó đoán vào buổi chiều. Tầng web chạy trên một Amazon EC2 Auto Scaling group. Solutions architect nên kết hợp HAI chính sách mở rộng (scaling policy) nào để đảm bảo công suất sẵn sàng trước 9:00 sáng và cũng có thể phản ứng với các đợt flash sale buổi chiều? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, C**

Chiến lược kết hợp **EC2 Auto Scaling** chuẩn mực: **Scheduled Scaling** (hoặc Predictive Scaling) cho tải lặp lại theo lịch + **Target Tracking Scaling** cho biến động tải bất ngờ.

- **A:** Sai vì chạy cấu hình đỉnh 24/7 gây lãng phí chi phí nghiêm trọng và mất ý nghĩa của Auto Scaling.
- **B (Đúng):** Đúng! Scheduled Scaling lý tưởng cho các đợt tăng tải có lịch trình cố định, dự đoán trước chính xác thời gian (như 9:00 AM các ngày trong tuần).
- **C (Đúng):** Đúng! Target Tracking Scaling tự động tăng/giảm số lượng EC2 để duy trì chỉ số mục tiêu (CPU hoặc ALB RequestCountPerTarget) khi có flash-sale bất ngờ vào buổi chiều.
- **D:** Sai vì thao tác thủ công không đáp ứng kịp các đợt flash-sale bất ngờ và tốn nhân lực.
- **E:** Sai vì tắt health check sẽ khiến các instance bị lỗi tiếp tục nhận traffic và làm hỏng trải nghiệm người dùng.

</details>

---

[Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md)
