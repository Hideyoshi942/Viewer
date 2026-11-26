# Bài tập tình huống — Chủ đề 5: Global Traffic, Edge Caching & Security — CloudFront Origin Shield, Global Accelerator, WAF & Shield Advanced

> CloudFront Origin Shield, OAC, Lambda@Edge vs CloudFront Functions, AWS Global Accelerator Static Anycast IPs, AWS Firewall Manager & Shield Advanced.
> **Số câu hỏi:** 8 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A global news publisher delivers web assets through Amazon CloudFront backed by an Application Load Balancer (ALB) origin in eu-west-1. During breaking news events, traffic surges cause multiple Regional Edge Caches to simultaneously request the same uncached articles, overwhelming the ALB origin. Additionally, the security team wants to perform lightweight HTTP security header injection and URL normalization on every viewer request at minimal cost, while also executing complex personalized A/B testing logic that queries an Amazon DynamoDB table on cache misses. Which TWO architectural changes should the Solutions Architect implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Use CloudFront Functions on Origin Request events to query Amazon DynamoDB directly because CloudFront Functions have lower latency than Lambda@Edge.
- **B.** Use CloudFront Functions on Viewer Request/Response for header injection/URL normalization, and Lambda@Edge on Origin Request to query DynamoDB.
- **C.** Disable Regional Edge Caches in the CloudFront distribution so Edge Locations fetch directly from the ALB origin.
- **D.** Enable CloudFront Origin Shield in eu-west-1 to consolidate origin fetches from all Regional Edge Caches into a single caching layer.
- **E.** Use Lambda@Edge on Viewer Request events for all header injection, URL normalization, and DynamoDB A/B testing queries in a single unified function.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà xuất bản tin tức toàn cầu phân phối tài nguyên web qua Amazon CloudFront với origin là Application Load Balancer (ALB) tại eu-west-1. Trong các sự kiện tin nóng, lưu lượng tăng đột biến khiến nhiều Regional Edge Cache đồng thời yêu cầu cùng các bài viết chưa được lưu bộ nhớ đệm, làm quá tải ALB origin. Ngoài ra, nhóm bảo mật muốn thực hiện chèn HTTP security header nhẹ và chuẩn hóa URL trên mọi yêu cầu của người xem với chi phí tối thiểu, đồng thời thực thi logic thử nghiệm A/B cá nhân hóa phức tạp có truy vấn bảng Amazon DynamoDB khi xảy ra cache miss. Solutions Architect nên triển khai HAI thay đổi kiến trúc nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Bài toán tối ưu Edge điển hình: bật **CloudFront Origin Shield** tại Region của Origin để bảo vệ Origin khỏi cache-miss storm; dùng **CloudFront Functions** (Viewer Request/Response) cho tác vụ nhẹ giá rẻ, và **Lambda@Edge** (Origin Request) cho logic phức tạp cần gọi mạng (DynamoDB).

- **A:** CloudFront Functions không hỗ trợ truy cập mạng (không thể gọi DynamoDB) và chỉ hỗ trợ sự kiện Viewer Request / Viewer Response, không hỗ trợ Origin Request.
- **B (Đúng):** Chính xác. CloudFront Functions chạy ở hàng trăm Edge Locations với thời gian khởi chạy dưới 1ms và chi phí cực rẻ (phù hợp thao tác nhẹ trên mọi Viewer Request, không hỗ trợ gọi mạng). Lambda@Edge chạy ở Regional Edge Caches, hỗ trợ gọi mạng tới DynamoDB và đặt tại Origin Request để chỉ thực thi khi cache miss.
- **C:** Tắt (hoặc bỏ qua) Regional Edge Caches sẽ khiến hàng trăm Edge Locations gọi thẳng vào ALB, làm tình trạng quá tải origin nghiêm trọng hơn nhiều.
- **D (Đúng):** Chính xác. CloudFront Origin Shield bổ sung thêm một lớp cache tập trung gần Origin nhất (eu-west-1), giúp gom tất cả các cache miss từ nhiều Regional Edge Caches về một điểm duy nhất, giảm tải tối đa cho ALB origin.
- **E:** Chạy Lambda@Edge kèm truy vấn DynamoDB trên MỌI Viewer Request sẽ cực kỳ tốn kém chi phí và tăng độ trễ ngay cả với các request đáng lẽ đã cache hit.

</details>

### Câu 2 `medium`

A global fintech company operates a real-time TCP-based FIX financial messaging protocol and HTTPS API across us-east-1 and ap-southeast-1. Enterprise banking partners strictly require whitelisting only two static IP addresses in their corporate firewalls and mandate that regional failovers occur within seconds without being impacted by client-side DNS resolver caching. Which AWS service should the Solutions Architect place in front of the regional load balancers?

- **A.** AWS Global Accelerator with two static Anycast IPs routing traffic to Network Load Balancers in us-east-1 and ap-southeast-1.
- **B.** Static Elastic IP addresses attached directly to an Application Load Balancer in both us-east-1 and ap-southeast-1.
- **C.** Amazon Route 53 with Latency-Based Routing, active Health Checks, and a 10-second DNS TTL across both Regions.
- **D.** Amazon CloudFront distribution configured with Origin Failover and a static IP allowlist for banking partners.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty fintech toàn cầu vận hành giao thức nhắn tin tài chính FIX dựa trên TCP theo thời gian thực và HTTPS API trên us-east-1 và ap-southeast-1. Các đối tác ngân hàng doanh nghiệp yêu cầu nghiêm ngặt chỉ đưa vào danh sách cho phép hai địa chỉ IP tĩnh trong tường lửa công ty và bắt buộc quá trình chuyển đổi dự phòng khu vực phải diễn ra trong vài giây mà không bị ảnh hưởng bởi bộ nhớ đệm DNS phía client. Solutions Architect nên đặt dịch vụ AWS nào phía trước các load balancer khu vực?

**Đáp án đúng:** **A**

Bất cứ khi nào câu hỏi đề cập đến **2 địa chỉ IP tĩnh cố định (firewall whitelisting)**, **giao thức TCP/UDP phi HTTP**, và **failover tức thì không bị ảnh hưởng bởi DNS caching**, đáp án chính xác là **AWS Global Accelerator**.

- **A (Đúng):** Chính xác. AWS Global Accelerator cung cấp đúng 2 địa chỉ IP tĩnh Anycast (hoặc BYOIP) để đối tác ngân hàng whitelist, hỗ trợ mọi lưu lượng TCP/UDP (bao gồm FIX protocol và HTTPS), đi trên mạng backbone toàn cầu của AWS, và chuyển hướng failover ngay lập tức ở tầng mạng mà hoàn toàn không phụ thuộc vào DNS caching.
- **B:** ALB không hỗ trợ gắn Elastic IP trực tiếp và không hỗ trợ giao thức TCP phi HTTP như FIX.
- **C:** Route 53 không cung cấp 2 địa chỉ IP tĩnh cố định cho cả hai Region, và nhiều DNS resolver doanh nghiệp bỏ qua TTL thấp dẫn đến trễ failover.
- **D:** CloudFront chỉ hỗ trợ HTTP/HTTPS (không hỗ trợ giao thức TCP phi HTTP như FIX) và sử dụng dải IP rộng thay đổi theo Edge Location thay vì 2 địa chỉ Anycast IP tĩnh.

</details>

### Câu 3 `hard`

A high-profile ticketing website runs behind an Application Load Balancer (ALB) fronted by Amazon CloudFront. During major concert launches, attackers launch volumetric Layer 3/4 DDoS attacks, HTTP flood Layer 7 attacks, and attempt to bypass CloudFront by sending requests directly to the ALB's public DNS name. The company requires 24/7 access to the AWS Shield Response Team (SRT), DDoS cost protection for scaling bills, automatic Layer 7 mitigation, and strict enforcement that the ALB only accepts traffic originating from CloudFront. Which TWO solutions should the Solutions Architect implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Subscribe to AWS Shield Advanced, protect the CloudFront distribution, and attach an AWS WAF Web ACL with rate-based rules and Automatic Application Layer DDoS Mitigation enabled.
- **B.** Rely on AWS Shield Standard because it includes 24/7 Shield Response Team (SRT) engagement and DDoS scaling cost protection at no additional charge.
- **C.** Restrict the ALB's Security Group to the CloudFront managed prefix list AND configure CloudFront to inject a custom secret HTTP header validated by an ALB listener rule.
- **D.** Enable Amazon GuardDuty with EKS and S3 Protection on the ALB to automatically detect and block Layer 7 HTTP flood attacks in real time.
- **E.** Move the ALB into private subnets with no public IP addresses because CloudFront natively connects directly to internal ALBs without VPC Origins or public endpoints.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một trang web bán vé nổi tiếng chạy phía sau Application Load Balancer (ALB) có Amazon CloudFront đứng trước. Trong các đợt mở bán vé hòa nhạc lớn, kẻ tấn công tung ra các cuộc tấn công DDoS lưu lượng lớn ở Layer 3/4, tấn công HTTP flood ở Layer 7 và cố gắng bỏ qua CloudFront bằng cách gửi yêu cầu trực tiếp tới tên DNS công khai của ALB. Công ty yêu cầu quyền liên hệ 24/7 với AWS Shield Response Team (SRT), bảo vệ chi phí DDoS cho hóa đơn mở rộng quy mô, giảm thiểu Layer 7 tự động và thực thi nghiêm ngặt việc ALB chỉ chấp nhận lưu lượng xuất phát từ CloudFront. Solutions Architect nên triển khai HAI giải pháp nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, C**

Bảo vệ web quy mô lớn chống DDoS & Origin Bypass gồm 2 lớp: (1) **AWS Shield Advanced + AWS WAF (rate-based + auto L7 mitigation)** trên CloudFront để có SRT và Cost Protection, và (2) khóa chặt ALB bằng **CloudFront Managed Prefix List + Custom Secret Header validation** (chống kẻ xấu dùng CloudFront distribution khác để bypass).

- **A (Đúng):** Chính xác. AWS Shield Advanced cung cấp hỗ trợ 24/7 từ đội Shield Response Team (SRT), bảo vệ chi phí mở rộng (DDoS Cost Protection), tự động chống tấn công Layer 7 kết hợp với AWS WAF rate-based rules gắn tại CloudFront (và không tốn phí WAF cơ bản khi dùng Shield Advanced).
- **B:** AWS Shield Standard chỉ bảo vệ cơ bản Layer 3/4, KHÔNG có SRT 24/7, không có DDoS Cost Protection và không tự động chống Layer 7.
- **C (Đúng):** Chính xác. Chỉ giới hạn Security Group bằng CloudFront managed prefix list là chưa đủ vì kẻ tấn công có thể tạo một CloudFront distribution khác của chính họ trỏ tới ALB của bạn. Kết hợp Managed Prefix List + Custom Secret Header (kiểm tra trên ALB Listener Rule và xoay vòng bằng Secrets Manager) đảm bảo 100% traffic chỉ đến từ đúng CloudFront distribution của bạn.
- **D:** GuardDuty là dịch vụ phát hiện mối đe dọa (detective), không nằm inline để chặn HTTP flood theo thời gian thực như AWS WAF.
- **E:** Theo mặc định nếu không cấu hình CloudFront VPC Origins, CloudFront không thể kết nối trực tiếp tới một internal ALB không có public IP; phương án chuẩn truyền thống để khóa public ALB là Managed Prefix List + Custom Secret Header.

</details>

### Câu 4 `medium`

A global news website serves static media from Amazon S3 and dynamic article pages from an Application Load Balancer in us-east-1 through Amazon CloudFront. During breaking news events, the origin ALB experiences CPU spikes due to simultaneous cache misses from dozens of Regional Edge Caches worldwide, and the cache hit ratio is only 45% because CloudFront forwards all viewer cookies and query strings to the origin. Additionally, security audits flagged that the S3 bucket is still using legacy Origin Access Identity (OAI) without KMS SSE-KMS support. Which TWO improvements should the Solutions Architect implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Enable Amazon CloudFront Origin Shield in us-east-1 to consolidate origin fetches into a single caching layer in front of the ALB.
- **B.** Configure CloudFront to forward the Host, User-Agent, and all Cookie headers in the Cache Key to maximize cache accuracy across Edge Locations.
- **C.** Disable Regional Edge Caches in CloudFront so all Edge Locations fetch directly from the ALB.
- **D.** Create a custom CloudFront Cache Policy including only needed query strings and migrate the S3 origin from OAI to Origin Access Control (OAC).
- **E.** Make the S3 bucket publicly readable via a bucket policy so CloudFront can fetch SSE-KMS encrypted objects without OAI or OAC authentication.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một trang web tin tức toàn cầu phục vụ phương tiện tĩnh từ Amazon S3 và các trang bài viết động từ một Application Load Balancer tại us-east-1 thông qua Amazon CloudFront. Trong các sự kiện tin nóng, ALB origin gặp tình trạng CPU tăng vọt do cache miss đồng thời từ hàng chục Regional Edge Cache trên toàn thế giới, và tỷ lệ cache hit chỉ đạt 45% vì CloudFront chuyển tiếp toàn bộ cookie và query string của người xem tới origin. Ngoài ra, kiểm toán bảo mật cảnh báo rằng S3 bucket vẫn đang sử dụng Origin Access Identity (OAI) cũ không hỗ trợ KMS SSE-KMS. Solutions Architect nên triển khai HAI cải tiến nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, D**

Để tối ưu hiệu năng và bảo mật cho **CloudFront**: dùng **Origin Shield** để gom cache miss bảo vệ origin, tinh gọn **Cache Policy** (bỏ cookies/query strings thừa) để tăng Cache Hit Ratio, và nâng cấp từ OAI lên **Origin Access Control (OAC)** để hỗ trợ **S3 SSE-KMS**.

- **A (Đúng):** Chính xác. CloudFront Origin Shield tạo thêm một lớp cache tập trung tại Region gần origin nhất (us-east-1), gom các yêu cầu cache miss từ hàng chục Regional Edge Caches trên toàn cầu thành một request duy nhất tới ALB, giảm tải CPU cho origin cực mạnh.
- **B:** Đưa User-Agent và toàn bộ Cookie vào Cache Key sẽ làm phân mảnh cache nghiêm trọng, khiến Cache Hit Ratio tụt giảm mạnh hơn nữa.
- **C:** Tắt Regional Edge Caches (không làm được và nếu làm sẽ phản tác dụng) khiến hàng trăm Edge Location gọi thẳng về ALB, làm tăng vọt tải origin.
- **D (Đúng):** Chính xác. Loại bỏ cookies/query strings không cần thiết khỏi Cache Key trong Cache Policy sẽ nâng tỷ lệ Cache Hit Ratio lên rất cao. Đồng thời chuyển từ OAI (legacy) sang Origin Access Control (OAC) hỗ trợ đầy đủ mã hóa SSE-KMS trên S3 và chữ ký SigV4 ngắn hạn bảo mật hơn.
- **E:** Mở công khai S3 bucket vi phạm nghiêm trọng bảo mật và vẫn không giải quyết được quyền giải mã KMS key (cần OAC + KMS key policy).

</details>

### Câu 5 `hard`

A global fintech platform deploys a stateless REST API on Amazon ECS Fargate behind Application Load Balancers in us-east-1 and eu-west-1, backed by Amazon DynamoDB Global Tables. Users worldwide must connect to a fixed pair of static Anycast IP addresses (required for enterprise customer firewall allowlisting), automatically route to the nearest healthy Region, and experience automatic failover in under 30 seconds without waiting for client DNS cache TTL expiration if one Region fails. Which TWO design elements should the Solutions Architect implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Enable strongly consistent reads across all AWS Regions in Amazon DynamoDB Global Tables to prevent stale data reads.
- **B.** Use AWS Global Accelerator in front of the ALBs in us-east-1 and eu-west-1 for two static Anycast IPs and sub-30-second regional failover.
- **C.** Deploy an Amazon CloudFront distribution with two static Anycast IP addresses and origin failover between us-east-1 and eu-west-1.
- **D.** Use Amazon Route 53 Latency-Based Routing with a 300-second TTL and health checks instead of Global Accelerator to satisfy static IP allowlisting.
- **E.** Configure DynamoDB Global Tables and ECS in both Regions for Active-Active writes, using idempotent keys and eventual consistency.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng fintech toàn cầu triển khai một REST API không lưu trạng thái trên Amazon ECS Fargate phía sau các Application Load Balancer tại us-east-1 và eu-west-1, được hỗ trợ bởi Amazon DynamoDB Global Tables. Người dùng trên toàn thế giới phải kết nối tới một cặp địa chỉ IP Anycast tĩnh cố định (bắt buộc để đưa vào danh sách cho phép trên tường lửa khách hàng doanh nghiệp), tự động định tuyến tới Region khỏe mạnh gần nhất, và trải qua chuyển đổi dự phòng tự động trong chưa đầy 30 giây mà không phải chờ hết hạn TTL bộ nhớ đệm DNS phía client nếu một Region gặp sự cố. Solutions Architect nên triển khai HAI thành phần thiết kế nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, E**

Khi bài toán **Multi-Region Active-Active** đòi hỏi **Static Anycast IP cho firewall allowlisting** và **failover cực nhanh không bị kẹt DNS TTL**, hãy kết hợp **AWS Global Accelerator** ở tầng mạng với **DynamoDB Global Tables** (thiết kế idempotent / last-writer-wins) ở tầng dữ liệu.

- **A:** DynamoDB Global Tables chỉ hỗ trợ strongly consistent reads trong CÙNG một Region; giữa các Region khác nhau luôn là eventually consistent.
- **B (Đúng):** Chính xác. AWS Global Accelerator cung cấp cố định 2 địa chỉ IP tĩnh Anycast toàn cầu (đáp ứng yêu cầu firewall allowlist của khách hàng doanh nghiệp), định tuyến người dùng tới Region khỏe mạnh gần nhất qua mạng backbone AWS, và tự động failover trong vòng vài chục giây mà không phụ thuộc vào DNS TTL cache của client.
- **C:** CloudFront sử dụng dải IP động rất rộng (không cung cấp cố định 2 IP tĩnh Anycast đơn lẻ để khách hàng đưa vào firewall allowlist như Global Accelerator).
- **D:** ALB không có IP tĩnh cố định để allowlist và Route 53 với TTL 300 giây phụ thuộc vào DNS cache của client nên không thể đảm bảo failover dưới 30 giây.
- **E (Đúng):** Chính xác. Với kiến trúc Active-Active dùng DynamoDB Global Tables (đồng bộ bất đồng bộ đa vùng theo cơ chế last-writer-wins), ứng dụng ở cả hai Region cần thiết kế idempotent và xử lý nhất quán cuối cùng (eventual consistency) để đảm bảo an toàn giao dịch.

</details>

### Câu 6 `hard`

A financial services company uses AWS Organizations with 60 member accounts. Compliance mandates that no resources can be provisioned outside us-east-1 and eu-west-1. However, developers must still be able to manage IAM roles, Amazon CloudFront distributions, and Amazon Route 53 records. A Solutions Architect attaches a Service Control Policy (SCP) to the Root OU that denies all actions when aws:RequestedRegion is not us-east-1 or eu-west-1. After applying the SCP, IAM and Route 53 API calls fail. How should the Solutions Architect fix the SCP?

- **A.** Move the SCP from the Root OU to the Management account so global services are exempted automatically.
- **B.** Change the SCP Effect to Allow and explicitly list all regional actions permitted in us-east-1 and eu-west-1.
- **C.** Attach an IAM policy to every developer role that explicitly allows iam:*, route53:*, and cloudfront:* across all Regions to override the SCP.
- **D.** Replace Action with NotAction in the Deny statement and list global services such as iam:*, route53:*, cloudfront:*, and sts:*.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty dịch vụ tài chính sử dụng AWS Organizations với 60 member account. Quy định tuân thủ bắt buộc không được cấp phát tài nguyên nào ngoài us-east-1 và eu-west-1. Tuy nhiên, lập trình viên vẫn phải có thể quản lý IAM role, Amazon CloudFront distribution và bản ghi Amazon Route 53. Một Solutions Architect gắn một Service Control Policy (SCP) vào Root OU để từ chối mọi hành động khi aws:RequestedRegion không phải là us-east-1 hoặc eu-west-1. Sau khi áp dụng SCP, các lệnh gọi IAM và Route 53 API bị lỗi. Solutions Architect nên sửa SCP như thế nào?

**Đáp án đúng:** **D**

Trong AWS Organizations, Region Deny SCP phải sử dụng cấu trúc `Effect: Deny` kết hợp `NotAction` cho danh sách các dịch vụ global (`iam:*`, `sts:*`, `route53:*`, `cloudfront:*`, `organizations:*`, `support:*`) và điều kiện `StringNotEquals: { aws:RequestedRegion: [...] }`.

- **A:** SCP không áp dụng cho Management Account và việc di chuyển SCP khỏi Root OU sẽ làm mất tác dụng kiểm soát trên toàn bộ member accounts.
- **B:** Liệt kê thủ công toàn bộ hành động của hàng trăm dịch vụ AWS theo kiểu Allow-list rất dễ sai sót, vượt giới hạn kích thước SCP (5,120 bytes) và vẫn sẽ chặn global services nếu không loại trừ.
- **C:** IAM Allow KHÔNG BAO GIỜ ghi đè được Explicit Deny từ SCP. Quyền hiệu lực luôn là phép giao giữa SCP và IAM.
- **D (Đúng):** Chính xác. Các dịch vụ global luôn có aws:RequestedRegion là us-east-1 hoặc xử lý ở endpoint toàn cầu. Dùng Deny kết hợp NotAction loại trừ các dịch vụ global là best practice chuẩn của AWS cho Region Deny SCP.

</details>

### Câu 7 `hard`

A gaming company hosts a real-time multiplayer backend using UDP and TCP on Amazon EKS clusters in us-west-2 and ap-northeast-1. Enterprise players connect from corporate networks that require firewall IP allowlisting and aggressively cache DNS records for up to 24 hours. The company needs automatic multi-region failover in under 60 seconds with minimal latency. Which AWS service should be placed in front of the EKS clusters?

- **A.** Amazon CloudFront with Origin Failover configured across both Regions.
- **B.** Amazon Route 53 Latency-Based Routing with Health Checks and a 10-second TTL.
- **C.** An Application Load Balancer in us-west-2 with cross-region IP targets pointing to ap-northeast-1.
- **D.** AWS Global Accelerator with endpoint groups pointing to Network Load Balancers in both Regions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty game lưu trữ backend nhiều người chơi thời gian thực sử dụng UDP và TCP trên các cụm Amazon EKS tại us-west-2 và ap-northeast-1. Người chơi doanh nghiệp kết nối từ mạng công ty yêu cầu đưa IP vào danh sách cho phép trên tường lửa và lưu bộ nhớ đệm bản ghi DNS mạnh mẽ lên tới 24 giờ. Công ty cần chuyển đổi dự phòng đa khu vực tự động trong vòng chưa đầy 60 giây với độ trễ tối thiểu. Nên đặt dịch vụ AWS nào phía trước các cụm EKS?

**Đáp án đúng:** **D**

Mỗi khi câu hỏi thi SAP-C02 có các dấu hiệu: **TCP/UDP (non-HTTP)**, **Static IP cho firewall allowlisting**, và **client cache DNS quá lâu** cần failover tức thì → đáp án chắc chắn là **AWS Global Accelerator**.

- **A:** CloudFront chỉ hỗ trợ giao thức HTTP/HTTPS và WebSockets (Layer 7), không hỗ trợ giao thức UDP/TCP thuần túy của game server.
- **B:** Mặc dù TTL đặt 10 giây, đề bài nêu rõ mạng doanh nghiệp cache DNS tới 24 giờ (bỏ qua TTL), khiến DNS failover không thể đạt < 60 giây, đồng thời Route 53 không cấp Static Anycast IP cho firewall allowlisting.
- **C:** ALB chỉ hỗ trợ HTTP/HTTPS (không hỗ trợ UDP), không có Static IP cố định và đặt ở một Region duy nhất sẽ tạo thành Single Point of Failure.
- **D (Đúng):** Chính xác. AWS Global Accelerator hoạt động ở Layer 4 (hỗ trợ cả TCP và UDP), cung cấp 2 Static Anycast IP cố định cho firewall allowlisting, định tuyến qua mạng xương sống AWS và failover < 30 giây hoàn toàn không phụ thuộc DNS caching.

</details>

### Câu 8 `hard`

A global media streaming platform serves user-generated images stored in Amazon S3 across us-east-1 and eu-central-1. The platform wants a single global S3 endpoint that automatically routes reads and writes to the nearest S3 bucket, supports active-active replication with a guaranteed 15-minute replication SLA, and protects origins from sudden cache-miss spikes on Amazon CloudFront. Which TWO features should the Solutions Architect implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Deploy an Amazon ElastiCache for Memcached cluster in front of Amazon CloudFront edge locations to cache frequently requested Amazon S3 media objects.
- **B.** Enable Amazon CloudFront Origin Shield in front of the S3 origin to consolidate cache misses and maximize cache hit ratios.
- **C.** Enable Amazon S3 Transfer Acceleration on both regional buckets and configure Amazon CloudFront to point directly to both S3 bucket endpoints simultaneously.
- **D.** Configure an Amazon S3 Multi-Region Access Point (MRAP) with bidirectional S3 Cross-Region Replication (CRR) and S3 Replication Time Control (RTC).
- **E.** Configure an AWS DataSync task scheduled every 15 minutes to copy objects bidirectionally between the two Amazon S3 buckets across us-east-1 and eu-central-1.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng phát trực tuyến truyền thông toàn cầu phục vụ hình ảnh do người dùng tạo lưu trong Amazon S3 tại us-east-1 và eu-central-1. Nền tảng muốn một điểm cuối S3 toàn cầu duy nhất tự động định tuyến thao tác đọc và ghi tới S3 bucket gần nhất, hỗ trợ sao chép active-active với SLA sao chép đảm bảo 15 phút, và bảo vệ origin khỏi các đợt tăng đột biến cache-miss trên Amazon CloudFront. Solutions Architect nên triển khai HAI tính năng nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Sự kết hợp giữa **S3 Multi-Region Access Points (MRAP) + S3 CRR/RTC** (định tuyến toàn cầu + SLA đồng bộ 15 phút) và **CloudFront Origin Shield** (bảo vệ Origin trước đột biến cache-miss) là bộ đôi kiến trúc lưu trữ/CDN đa vùng tối ưu nhất trên AWS.

- **A:** ElastiCache nằm trong VPC và không thể đặt phía trước CloudFront (Edge network) để chặn cache-miss spikes của CDN.
- **B (Đúng):** Chính xác. CloudFront Origin Shield thêm một lớp caching tập trung giúp gom các yêu cầu cache-miss từ nhiều Regional Edge Caches, bảo vệ origin khỏi tải đột biến và tăng cache hit ratio.
- **C:** S3 Transfer Acceleration dùng để tăng tốc upload trực tiếp của client lên 1 bucket cụ thể, không cung cấp global multi-region routing endpoint hay SLA replication 15 phút.
- **D (Đúng):** Chính xác. S3 MRAP cung cấp 1 global endpoint duy nhất chạy trên Global Accelerator tự định tuyến đến bucket gần nhất; kết hợp CRR hai chiều và S3 RTC đảm bảo SLA 99.99% object đồng bộ trong 15 phút.
- **E:** DataSync chạy theo lịch không cung cấp SLA replication 99.99% trong 15 phút cho từng object như S3 CRR + RTC và dễ gây xung đột khi chạy hai chiều thủ công.

</details>

---

[Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md)
