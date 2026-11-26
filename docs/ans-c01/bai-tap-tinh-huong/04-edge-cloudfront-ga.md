# Bài tập tình huống — Edge Networking: Amazon CloudFront, AWS Global Accelerator & Anycast

> So sánh Layer 7 CloudFront vs Layer 4 Global Accelerator, Origin Access Control (OAC), Anycast IP, Custom Routing và tối ưu độ trễ toàn cầu.
> **Số câu hỏi:** 6 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A global gaming company runs a real-time multiplayer backend using custom UDP protocols on EC2 instances across us-east-1, eu-west-1, and ap-southeast-1. Players experience high jitter and packet loss over the public internet. The company needs static anycast IP addresses and automatic regional failover in under 30 seconds. Which service should be used?

- **A.** AWS Transit Gateway Inter-Region Peering with Network Load Balancers.
- **B.** AWS Global Accelerator with Standard Accelerators and UDP listeners.
- **C.** Amazon Route 53 Latency-Based Routing with Health Checks.
- **D.** Amazon CloudFront with UDP origin support and Origin Failover.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty game toàn cầu vận hành backend nhiều người chơi theo thời gian thực sử dụng các giao thức UDP tùy chỉnh trên các EC2 instance tại us-east-1, eu-west-1 và ap-southeast-1. Người chơi gặp tình trạng jitter cao và mất gói qua internet công cộng. Công ty cần các địa chỉ IP anycast tĩnh và chuyển đổi dự phòng theo Region tự động trong dưới 30 giây. Nên sử dụng dịch vụ nào?

**Đáp án đúng:** **B**

AWS Global Accelerator là lựa chọn chuẩn cho các ứng dụng non-HTTP (như gaming UDP, VoIP, IoT) cần static Anycast IP, tối ưu đường truyền trên AWS global network và failover nhanh.

- **A:** Transit Gateway Inter-Region Peering kết nối nội bộ giữa các VPC, không cung cấp điểm vào Anycast từ người chơi trên Internet.
- **B (Đúng):** Chính xác. AWS Global Accelerator cung cấp 2 IPv4 Anycast tĩnh, hỗ trợ cả TCP và UDP, định tuyến traffic qua mạng xương sống AWS để giảm jitter và tự động failover giữa các Region.
- **C:** Route 53 không cung cấp static Anycast IP, không tối ưu đường truyền qua backbone AWS cho UDP và phụ thuộc TTL DNS khi failover.
- **D:** CloudFront chỉ hỗ trợ HTTP/HTTPS (TCP), không hỗ trợ custom UDP protocols hay cung cấp cặp Anycast IP tĩnh.

</details>

### Câu 2 `hard`

A gaming company hosts latency-sensitive multiplayer servers behind Network Load Balancers (NLBs) in us-east-1 and eu-central-1. Players connect from mobile clients worldwide using custom UDP protocols on ports 7777-7780. The company needs static anycast IP addresses, automatic health-based regional failover within 30 seconds, and optimal routing over the AWS global network. Which service should the company place in front of the NLBs?

- **A.** Amazon CloudFront with a custom origin pointing to the Network Load Balancers and Origin Failover configured for custom UDP ports.
- **B.** AWS Global Accelerator with custom routing accelerators mapping player source IPs directly to NLB private IP addresses across both Regions.
- **C.** AWS Global Accelerator with standard accelerators, UDP listeners on ports 7777-7780, and endpoint groups in us-east-1 and eu-central-1.
- **D.** Amazon Route 53 with Latency-based routing, active health checks, static IP records, and a 60-second DNS TTL.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty game lưu trữ các máy chủ nhiều người chơi nhạy cảm với độ trễ phía sau các Network Load Balancer (NLB) tại us-east-1 và eu-central-1. Người chơi kết nối từ các thiết bị di động trên toàn cầu bằng các giao thức UDP tùy chỉnh trên cổng 7777-7780. Công ty cần các địa chỉ IP anycast tĩnh, chuyển đổi dự phòng theo Region tự động dựa trên tình trạng sức khỏe trong vòng 30 giây và định tuyến tối ưu qua mạng toàn cầu của AWS. Công ty nên đặt dịch vụ nào phía trước các NLB?

**Đáp án đúng:** **C**

AWS Global Accelerator là lựa chọn chuẩn cho các ứng dụng non-HTTP (TCP/UDP), cần IP anycast tĩnh, độ trễ thấp qua AWS global network và khả năng failover nhanh không phụ thuộc DNS cache.

- **A:** Amazon CloudFront chỉ hỗ trợ giao thức HTTP/HTTPS (TCP), không hỗ trợ lưu lượng UDP tùy chỉnh như game server.
- **B:** Custom routing accelerator dùng để map tới từng EC2 instance IP cụ thể trong subnet, không hỗ trợ NLB làm endpoint và không phù hợp cho việc phân phối tải qua NLB.
- **C (Đúng):** Chính xác. AWS Global Accelerator cung cấp 2 IP anycast tĩnh, hỗ trợ cả TCP và UDP, định tuyến lưu lượng qua AWS global backbone từ edge location gần nhất và thực hiện health check/failover gần như tức thời (dưới 30 giây).
- **D:** Route 53 không cung cấp địa chỉ IP anycast tĩnh và chịu ảnh hưởng của DNS caching ở client/ISP nên không đảm bảo failover dưới 30 giây cũng như không tối ưu đường đi qua AWS backbone.

</details>

### Câu 3 `medium`

A company hosts a static web application on Amazon S3 behind Amazon CloudFront. Users in Europe and North America upload large video files (up to 5 GB) via presigned URLs, and download dynamically generated manifests from an Application Load Balancer (ALB) in us-east-1. The company notices slow upload speeds from Europe and wants to optimize both upload latency and origin failover for the dynamic manifests. Which CloudFront configuration should be used?

- **A.** Enable CloudFront Geo Restriction for Europe and use Lambda@Edge Viewer Request functions to buffer 5 GB video uploads before writing to S3.
- **B.** Use S3 Transfer Acceleration for uploads and configure CloudFront Origin Groups with primary ALB in us-east-1 and secondary ALB in eu-west-1.
- **C.** Deploy an AWS Direct Connect connection from every user's ISP to S3 and configure Route 53 Failover routing.
- **D.** Enable CloudFront Origin Shield in eu-west-1 for all 5 GB PUT upload requests and route dynamic manifests through an S3 static website bucket.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ một ứng dụng web tĩnh trên Amazon S3 phía sau Amazon CloudFront. Người dùng ở châu Âu và Bắc Mỹ tải lên các tệp video lớn (lên đến 5 GB) qua presigned URL, và tải xuống các manifest được tạo động từ một Application Load Balancer (ALB) tại us-east-1. Công ty nhận thấy tốc độ tải lên từ châu Âu chậm và muốn tối ưu hóa cả độ trễ tải lên lẫn khả năng chuyển đổi dự phòng origin cho các manifest động. Nên sử dụng cấu hình CloudFront nào?

**Đáp án đúng:** **B**

S3 Transfer Acceleration tận dụng mạng lưới Edge Location của CloudFront để tăng tốc upload file lớn đường dài, trong khi CloudFront Origin Groups cung cấp cơ chế active-passive failover giữa các origin (như ALB ở hai Region khác nhau).

- **A:** Lambda@Edge có giới hạn kích thước payload và thời gian thực thi nhỏ (vài MB / vài giây), hoàn toàn không thể buffer file 5 GB.
- **B (Đúng):** Chính xác. S3 Transfer Acceleration tối ưu hóa việc upload file lớn từ xa qua CloudFront edge locations, còn CloudFront Origin Groups hỗ trợ failover tự động giữa hai ALB origin khi gặp lỗi 5xx.
- **C:** Không thể triển khai Direct Connect tới từng người dùng cuối trên Internet.
- **D:** Origin Shield dùng để giảm tải cache miss cho GET request, không tối ưu hóa upload trực tiếp lên S3 và S3 không xử lý dynamic manifests của ALB.

</details>

### Câu 4 `hard`

A media streaming platform uses Amazon CloudFront in front of an Application Load Balancer (ALB) in us-east-1. During peak live-stream events, cache miss spikes overwhelm the ALB and backend origin servers. The platform also needs to run lightweight header manipulation and A/B testing logic on every viewer request with sub-millisecond execution at CloudFront edge locations worldwide. Which CloudFront features should the architect combine?

- **A.** Place AWS Global Accelerator in front of CloudFront Edge Locations to cache HTTP responses and run A/B testing.
- **B.** Disable CloudFront caching and enable HTTP/3 QUIC on the Application Load Balancer directly for sub-millisecond edge logic.
- **C.** Enable CloudFront Origin Shield in us-east-1 and use CloudFront Functions for viewer header manipulation and A/B testing.
- **D.** Use Lambda@Edge on Origin Response for sub-millisecond viewer header manipulation and deploy a second ALB in us-east-1 for A/B testing.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng phát trực tuyến truyền thông sử dụng Amazon CloudFront phía trước một Application Load Balancer (ALB) tại us-east-1. Trong các sự kiện phát trực tiếp cao điểm, các đợt tăng đột biến cache miss làm quá tải ALB và các máy chủ origin backend. Nền tảng cũng cần chạy logic thao tác header gọn nhẹ và kiểm thử A/B trên mọi yêu cầu của người xem với thời gian thực thi dưới một mili-giây tại các edge location của CloudFront trên toàn cầu. Kiến trúc sư nên kết hợp các tính năng CloudFront nào?

**Đáp án đúng:** **C**

CloudFront Origin Shield đóng vai trò là lớp cache tập trung giúp bảo vệ origin khỏi bão cache-miss từ nhiều Regional Edge Caches. CloudFront Functions chạy cực nhanh (<1ms) ở mọi edge location cho các tác vụ nhẹ trên viewer request/response như A/B testing, URL rewrite, header manipulation.

- **A:** Global Accelerator không làm nhiệm vụ HTTP caching và không đặt trước CloudFront.
- **B:** Tắt caching trên CloudFront sẽ làm tình trạng quá tải ALB trở nên trầm trọng hơn.
- **C (Đúng):** Chính xác. CloudFront Origin Shield tạo thêm một lớp caching tập trung gần origin giúp giảm mạnh lượng request cache-miss dồn về ALB, trong khi CloudFront Functions chạy ở mọi edge location với độ trễ dưới 1ms (sub-millisecond) rất lý tưởng cho A/B testing và chỉnh sửa header.
- **D:** Lambda@Edge chỉ chạy ở Regional Edge Caches (không phải mọi edge location) với chi phí và độ trễ khởi tạo cao hơn CloudFront Functions, và không giải quyết bài toán gộp cache miss như Origin Shield.

</details>

### Câu 5 `hard`

A global SaaS company has a legacy client base whose corporate firewalls only allow outbound connections to a fixed list of static IPv4 addresses. The company hosts its API on Application Load Balancers (ALBs) across three Regions and wants to provide exactly two static IPv4 addresses globally, route client traffic via the AWS global backbone, and preserve the original client source IP address in the HTTP requests reaching the backend EC2 targets. Which architecture meets all requirements?

- **A.** Place Global Accelerator in front of the regional ALBs, providing two static anycast IPv4s and preserving client IP via X-Forwarded-For.
- **B.** Use Amazon CloudFront with Anycast Static IPs and forward traffic to Network Load Balancers across all three Regions.
- **C.** Deploy a Network Load Balancer in us-east-1 with two Elastic IPs and forward traffic to ALBs in eu-west-1 and ap-southeast-1 over VPC Peering.
- **D.** Assign two Elastic IPs directly to an Application Load Balancer and configure Amazon Route 53 Geolocation routing.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty SaaS toàn cầu có tập khách hàng cũ mà tường lửa doanh nghiệp của họ chỉ cho phép kết nối đi ra đến một danh sách cố định gồm các địa chỉ IPv4 tĩnh. Công ty lưu trữ API của mình trên các Application Load Balancer (ALB) trên ba Region và muốn cung cấp chính xác hai địa chỉ IPv4 tĩnh trên toàn cầu, định tuyến lưu lượng client qua mạng trục toàn cầu của AWS và bảo toàn địa chỉ IP nguồn gốc của client trong các yêu cầu HTTP đến các EC2 target backend. Kiến trúc nào đáp ứng tất cả các yêu cầu?

**Đáp án đúng:** **A**

AWS Global Accelerator là dịch vụ chuẩn xác nhất để cung cấp 2 địa chỉ IPv4 anycast tĩnh toàn cầu phía trước các ALB đa Region, kết hợp khả năng Client IP Preservation giúp backend đọc được IP thật của client qua `X-Forwarded-For`.

- **A (Đúng):** Chính xác. AWS Global Accelerator cung cấp 2 IPv4 anycast tĩnh toàn cầu, định tuyến qua AWS global backbone tới ALB gần nhất và mặc định bảo toàn client IP (Client IP Preservation) ở tầng ALB (`X-Forwarded-For`).
- **B:** CloudFront Anycast Static IPs mặc định cấp 3 IP (hoặc 21 IP tùy gói) chứ không phải 2 IP như Global Accelerator, và Global Accelerator hỗ trợ client IP preservation trực tiếp tới ALB qua AWS backbone hiệu quả hơn cho bài toán multi-Region ALB.
- **C:** Mọi traffic toàn cầu đều bị kéo về us-east-1 trước khi chuyển tiếp, gây độ trễ cao và tạo single point of failure tại us-east-1.
- **D:** Không thể gán Elastic IP trực tiếp cho ALB (chỉ NLB mới hỗ trợ Elastic IP) và ALB không trải rộng qua nhiều Region bằng cùng 2 IP.

</details>

### Câu 6 `medium`

A multiplayer online gaming company hosts UDP-based game servers on Amazon EC2 fleets behind Network Load Balancers in us-west-2, eu-central-1, and ap-northeast-1. Players experience high jitter over the public Internet, corporate enterprise firewalls require two static IP addresses for allowlisting, and regional failover must occur in under 30 seconds without relying on client DNS cache expiration. Which AWS service should the architect deploy?

- **A.** AWS Transit Gateway with Inter-Region Peering and Anycast BGP routes advertised directly to the public Internet.
- **B.** AWS Global Accelerator with endpoint groups in all three Regions pointing to the regional Network Load Balancers.
- **C.** Amazon Route 53 latency-based routing with active health checks, static IP records, and a 30-second DNS TTL.
- **D.** Amazon CloudFront with Origin Groups and health checks configured for automatic UDP failover across all three Regions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty game trực tuyến nhiều người chơi lưu trữ các máy chủ game dựa trên UDP trên các cụm Amazon EC2 phía sau Network Load Balancers tại us-west-2, eu-central-1 và ap-northeast-1. Người chơi gặp tình trạng jitter cao qua Internet công cộng, tường lửa doanh nghiệp yêu cầu hai địa chỉ IP tĩnh để đưa vào danh sách cho phép (allowlist), và việc chuyển đổi dự phòng theo Region (regional failover) phải diễn ra trong dưới 30 giây mà không phụ thuộc vào thời gian hết hạn bộ nhớ đệm DNS của client. Kiến trúc sư nên triển khai dịch vụ AWS nào?

**Đáp án đúng:** **B**

AWS Global Accelerator là giải pháp chuẩn cho ứng dụng non-HTTP (TCP/UDP), yêu cầu Static Anycast IP và failover đa Region không phụ thuộc DNS caching.

- **A:** Transit Gateway không hỗ trợ quảng bá Anycast BGP trực tiếp ra Internet công cộng cho người dùng cuối.
- **B (Đúng):** AWS Global Accelerator hoạt động ở Layer 4 (TCP/UDP), cấp 2 Static Anycast IP cố định, định tuyến lưu lượng qua AWS Global Network để giảm jitter và thực hiện failover tức thì mà không phụ thuộc DNS TTL.
- **C:** Route 53 vẫn phụ thuộc vào DNS resolver caching ở phía client/ISP và không tối ưu hóa đường truyền gói tin UDP qua AWS Global Network.
- **D:** CloudFront chỉ hỗ trợ Layer 7 (HTTP/HTTPS, WebSocket, gRPC), không hỗ trợ giao thức UDP cho game server và không cấp 2 Static Anycast IP cố định.

</details>

---

[Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md)
