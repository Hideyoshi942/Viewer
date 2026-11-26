# Bài tập tình huống — AWS PrivateLink, Amazon VPC Lattice & Load Balancing (ALB/NLB)

> Triển khai Interface/Gateway Endpoints, PrivateLink Endpoint Services, VPC Lattice Service Networks và tối ưu ALB/NLB (Cross-Zone, Proxy Protocol v2).
> **Số câu hỏi:** 5 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A fintech company wants to expose a payment processing microservice running on Amazon EKS in a provider VPC to 300 consumer VPCs across multiple AWS accounts. Some consumer VPCs have overlapping IPv4 CIDR blocks with the provider VPC. The company wants to ensure traffic never traverses the public internet, requires no VPC peering or Transit Gateway routing management, and only allows consumer-initiated connections. Which AWS service should be used?

- **A.** AWS Transit Gateway with separate route tables for each consumer VPC and NAT Gateways to translate overlapping CIDRs.
- **B.** AWS PrivateLink with a Network Load Balancer in the provider VPC and Interface VPC Endpoints in the consumer VPCs.
- **C.** VPC Peering between the provider VPC and each of the 300 consumer VPCs.
- **D.** Gateway VPC Endpoints in each consumer VPC pointing to the provider's Application Load Balancer.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty fintech muốn cung cấp một microservice xử lý thanh toán chạy trên Amazon EKS trong một provider VPC cho 300 consumer VPC trên nhiều tài khoản AWS. Một số consumer VPC có dải IPv4 CIDR trùng lặp với provider VPC. Công ty muốn đảm bảo lưu lượng không bao giờ đi qua internet công cộng, không yêu cầu quản lý định tuyến VPC peering hay Transit Gateway, và chỉ cho phép các kết nối do consumer khởi tạo. Nên sử dụng dịch vụ AWS nào?

**Đáp án đúng:** **B**

AWS PrivateLink giải quyết triệt để bài toán cung cấp dịch vụ cho hàng trăm consumer VPC kể cả khi trùng CIDR, đảm bảo traffic hoàn toàn nằm trên mạng nội bộ AWS và chỉ cho phép khởi tạo kết nối một chiều từ consumer.

- **A:** Quản lý NAT trên 300 VPC có CIDR trùng lặp qua TGW rất phức tạp và tốn kém vận hành hơn nhiều so với PrivateLink.
- **B (Đúng):** Chính xác. AWS PrivateLink (Endpoint Service gắn với NLB/GWLB và Interface Endpoint ở consumer VPC) hoạt động ở tầng kết nối riêng tư, hỗ trợ CIDR trùng lặp, chỉ cho phép kết nối một chiều từ consumer tới provider và không cần VPC Peering hay TGW.
- **C:** VPC Peering không hỗ trợ kết nối giữa các VPC có CIDR trùng lặp và vượt quá giới hạn tối đa 125 peering connections trên mỗi VPC.
- **D:** Gateway VPC Endpoint chỉ hỗ trợ duy nhất Amazon S3 và DynamoDB, không hỗ trợ dịch vụ tùy chỉnh hay ALB.

</details>

### Câu 2 `hard`

An engineering organization has 40 microservices distributed across EC2, EKS, and AWS Lambda in multiple VPCs with overlapping IPv4 CIDRs. The platform team needs Layer 7 HTTP/gRPC path-based routing, weighted canary deployments (90/10 split), and IAM-based service-to-service authentication without managing sidecar proxies or Transit Gateway route tables. Which service provides this capability?

- **A.** Amazon API Gateway Private REST APIs combined with full-mesh VPC Peering and IAM authorizers.
- **B.** AWS Transit Gateway with ECMP routing, separate route tables, and Network Firewall TLS inspection.
- **C.** AWS PrivateLink with Application Load Balancers and custom Envoy sidecar proxies deployed in every microservice VPC.
- **D.** Amazon VPC Lattice with a Service Network, HTTP/gRPC listeners, weighted target groups, and IAM auth policies.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một tổ chức kỹ thuật có 40 microservice phân tán trên EC2, EKS và AWS Lambda trong nhiều VPC có dải IPv4 CIDR trùng lặp. Đội ngũ nền tảng cần định tuyến dựa trên đường dẫn HTTP/gRPC Layer 7, triển khai canary theo trọng số (chia 90/10) và xác thực service-to-service dựa trên IAM mà không cần quản lý sidecar proxy hay route table của Transit Gateway. Dịch vụ nào cung cấp khả năng này?

**Đáp án đúng:** **D**

Amazon VPC Lattice cung cấp tầng ứng dụng (Layer 7) cho giao tiếp service-to-service giữa EC2, containers và Lambda trên nhiều VPC (hỗ trợ cả overlapping CIDR), tích hợp sẵn traffic splitting (canary) và IAM SigV4 authentication.

- **A:** VPC Peering không hỗ trợ overlapping CIDRs và mô hình API Gateway không tự động hóa service-to-service mesh không sidecar giữa EC2/EKS/Lambda như VPC Lattice.
- **B:** Transit Gateway hoạt động ở Layer 3, không hỗ trợ L7 HTTP/gRPC routing, weighted canary hay xử lý trùng CIDR.
- **C:** PrivateLink hoạt động ở Layer 4 (qua NLB) và không cung cấp cơ chế service directory/L7 routing/IAM auth policy thống nhất cho cả Lambda và EKS như VPC Lattice.
- **D (Đúng):** Chính xác. Amazon VPC Lattice là service networking layer được quản lý hoàn toàn, hỗ trợ kết nối chéo VPC (kể cả trùng CIDR) cho EC2, EKS và Lambda, cung cấp định tuyến L7 (path/header/weighted) và xác thực IAM auth policy mà không cần sidecar.

</details>

### Câu 3 `hard`

A platform team exposes an internal REST API via AWS PrivateLink (an Interface VPC Endpoint in a consumer VPC connected to an Endpoint Service backed by an NLB in a provider VPC). The provider application needs to know the exact VPC Endpoint ID (`vpce-xxxx`) that originated each TCP connection for tenant billing and audit logging, without modifying the application's HTTP headers. Which NLB setting enables this?

- **A.** Enable Proxy Protocol v2 on the NLB target group.
- **B.** Enable Client IP Preservation on the NLB target group.
- **C.** Configure an X-Forwarded-For header rule on the NLB listener.
- **D.** Enable Cross-Zone Load Balancing on the NLB.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đội ngũ nền tảng cung cấp một REST API nội bộ qua AWS PrivateLink (một Interface VPC Endpoint trong consumer VPC kết nối đến một Endpoint Service được hậu thuẫn bởi NLB trong provider VPC). Ứng dụng provider cần biết chính xác VPC Endpoint ID (`vpce-xxxx`) đã khởi tạo từng kết nối TCP để tính phí thuê bao (tenant billing) và ghi nhật ký kiểm toán, mà không cần sửa đổi HTTP header của ứng dụng. Thiết lập NLB nào cho phép điều này?

**Đáp án đúng:** **A**

Khi cung cấp dịch vụ qua AWS PrivateLink, bật Proxy Protocol v2 trên NLB Target Group là cách chuẩn để backend nhận biết được `vpce-id` (ID của Interface Endpoint phía consumer) thông qua trường AWS TLV mở rộng trong Proxy Protocol v2.

- **A (Đúng):** Chính xác. Khi bật Proxy Protocol v2 trên NLB Target Group phía sau PrivateLink Endpoint Service, NLB sẽ chèn thêm header nhị phân Proxy Protocol v2 chứa TLV (Type-Length-Value) với `PP2_SUBTYPE_AWS_VPCE_ID`, cho phép backend đọc được chính xác `vpce-id` của consumer.
- **B:** Với lưu lượng đi qua PrivateLink, Client IP Preservation không giữ được IP gốc của consumer (vì có thể trùng CIDR); backend chỉ nhận IP của NLB hoặc cần Proxy Protocol v2 để lấy `vpce-id`.
- **C:** NLB hoạt động ở Layer 4 (TCP/UDP) nên không hỗ trợ đọc hay chèn HTTP header như `X-Forwarded-For`.
- **D:** Cross-Zone Load Balancing chỉ phân phối tải đều qua các AZ, không truyền `vpce-id` tới backend.

</details>

### Câu 4 `hard`

A global company is implementing Amazon VPC Lattice to connect 20 microservices running across Amazon EKS and AWS Lambda in multiple AWS accounts. The security team requires end-to-end encryption (TLS), fine-grained authorization so that only the `billing` service IAM role can invoke the `POST /charge` endpoint on the `payment` service, and centralized access logging. Which TWO configurations should the team implement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Deploy Envoy sidecar proxies on every AWS Lambda function and EKS pod to enforce mTLS and IAM policies.
- **B.** Attach a Security Group to the VPC Lattice Service Network allowing HTTP method `POST /charge` from `billing`.
- **C.** Use full-mesh VPC Peering between all 20 accounts because VPC Lattice requires direct VPC Peering to route microservice traffic.
- **D.** Configure an HTTPS listener on the `payment` service with TLS and an IAM Auth Policy restricting `POST /charge` to `billing`.
- **E.** Enable VPC Lattice Service Network Access Logs and send them to Amazon CloudWatch Logs, Amazon S3, or Amazon Data Firehose.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty toàn cầu đang triển khai Amazon VPC Lattice để kết nối 20 microservice chạy trên Amazon EKS và AWS Lambda trong nhiều tài khoản AWS. Đội ngũ bảo mật yêu cầu mã hóa đầu-cuối (TLS), phân quyền chi tiết để chỉ IAM role của dịch vụ `billing` mới có thể gọi endpoint `POST /charge` trên dịch vụ `payment`, và ghi nhật ký truy cập tập trung. Đội ngũ nên triển khai HAI cấu hình nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **D, E**

Amazon VPC Lattice cung cấp cơ chế bảo mật Zero-Trust tích hợp sẵn: HTTPS listener (TLS), Auth Policies (xác thực & phân quyền theo IAM Role + HTTP Method/Path), và Access Logs tập trung ở cấp Service Network.

- **A:** AWS Lambda không chạy được Envoy sidecar và VPC Lattice được thiết kế để loại bỏ nhu cầu quản lý sidecar proxy.
- **B:** Security Group chỉ lọc ở Layer 3/4 (IP và Port), không thể lọc HTTP method hay URL path như `POST /charge`.
- **C:** VPC Lattice tự động định tuyến lưu lượng giữa các VPC được liên kết vào Service Network mà không cần VPC Peering hay Transit Gateway.
- **D (Đúng):** Chính xác. VPC Lattice hỗ trợ HTTPS listener với TLS và cho phép viết Auth Policy ở cấp service hoặc service network dựa trên IAM principal, HTTP method và path (ví dụ chỉ cho phép IAM role của `billing` gọi `POST /charge`).
- **E (Đúng):** Chính xác. Access Logs của VPC Lattice Service Network ghi nhận chi tiết mọi request L7 (source/target service, HTTP method, path, response code, IAM identity) tới S3, CloudWatch Logs hoặc Firehose.

</details>

### Câu 5 `hard`

A SaaS company develops 80 HTTP/HTTPS and gRPC microservices distributed across 25 VPCs (some with overlapping CIDR blocks) in multiple AWS accounts. Developers need zero-trust service-to-service authentication using AWS IAM, weighted Canary traffic shifting between service versions, and centralized access logging without deploying Transit Gateways or managing individual Network Load Balancers and PrivateLink endpoints for every service. Which AWS service best fits this requirement?

- **A.** AWS Cloud WAN with isolated network segments per microservice and cross-account Route 53 Resolver rules.
- **B.** AWS PrivateLink with Cross-Account Endpoint Services and Network Load Balancers in each VPC.
- **C.** AWS Transit Gateway with Application Load Balancers and Envoy proxies deployed in each of the 25 VPCs.
- **D.** Amazon VPC Lattice with a Service Network, IAM Auth Policies, and weighted target groups.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty SaaS phát triển 80 microservice HTTP/HTTPS và gRPC phân tán trên 25 VPC (một số có dải CIDR trùng lặp) trong nhiều tài khoản AWS. Các lập trình viên cần xác thực service-to-service theo mô hình zero-trust bằng AWS IAM, điều hướng lưu lượng Canary theo trọng số giữa các phiên bản dịch vụ và ghi nhật ký truy cập tập trung mà không cần triển khai Transit Gateway hay quản lý từng Network Load Balancer và PrivateLink endpoint cho mỗi dịch vụ. Dịch vụ AWS nào phù hợp nhất với yêu cầu này?

**Đáp án đúng:** **D**

Amazon VPC Lattice giải quyết bài toán kết nối microservices Layer 7 (HTTP/gRPC) quy mô lớn xuyên VPC/Account kể cả khi overlapping CIDR, tích hợp sẵn IAM Auth và Canary routing.

- **A:** Cloud WAN hoạt động ở Layer 3, không hỗ trợ Layer 7 gRPC/HTTP Canary routing hay IAM authentication.
- **B:** AWS PrivateLink hoạt động ở Layer 4, yêu cầu quản lý NLB và VPC Endpoint cho từng dịch vụ và không hỗ trợ native Layer 7 Canary routing hay IAM SigV4 auth.
- **C:** Transit Gateway không thể định tuyến trực tiếp giữa các VPC có overlapping CIDR và không cung cấp IAM service-to-service auth ở Layer 7.
- **D (Đúng):** Amazon VPC Lattice là dịch vụ kết nối ứng dụng Layer 7 (HTTP/HTTPS, gRPC) xuyên VPC/Account, hỗ trợ hoàn toàn overlapping CIDR, xác thực Zero-Trust bằng IAM Auth Policy (SigV4), Canary weighted routing mà không cần TGW hay NLB.

</details>

---

[Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md)
