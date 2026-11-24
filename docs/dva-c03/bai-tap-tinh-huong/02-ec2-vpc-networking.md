# Bài tập tình huống — Chủ đề 2: EC2, Storage, ELB/ASG, VPC & Route 53

> EC2 Instance Types, IMDSv2, EBS/EFS, ALB/NLB, Auto Scaling, VPC Subnets/Security Groups/Endpoints và Route 53.
> **Số câu hỏi:** 6 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A legacy application running on Amazon EC2 reads its temporary IAM credentials by querying `http://169.254.169.254/latest/meta-data/iam/security-credentials/` using simple HTTP `GET` requests without a session token. A security audit requires enforcing **IMDSv2** to protect against Server-Side Request Forgery (SSRF) vulnerabilities. What changes when IMDSv2 is enforced on the EC2 instance?

- **A.** The EC2 instance metadata link-local IP address changes from `169.254.169.254` to `10.0.0.1` when IMDSv2 is enforced.
- **B.** Send an HTTP `PUT` to `http://169.254.169.254/latest/api/token` with `X-aws-ec2-metadata-token-ttl-seconds`, then pass the token in `X-aws-ec2-metadata-token` on `GET`.
- **C.** IMDSv2 disables IAM Instance Profiles on EC2 instances completely, requiring static IAM Access Keys in environment variables.
- **D.** The application must pass the EC2 root user password encoded in Base64 inside the HTTP `Authorization` header on `GET` calls.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng cũ chạy trên Amazon EC2 đọc các thông tin xác thực IAM tạm thời của nó bằng cách truy vấn `http://169.254.169.254/latest/meta-data/iam/security-credentials/` thông qua các HTTP `GET` request đơn giản mà không có session token. Một cuộc kiểm toán bảo mật yêu cầu thực thi **IMDSv2** để bảo vệ khỏi các lỗ hổng Server-Side Request Forgery (SSRF). Điều gì thay đổi khi IMDSv2 được thực thi trên EC2 instance?

**Đáp án đúng:** **B**

**EC2 Instance Metadata Service v2 (IMDSv2)**:
- Chống **SSRF** bằng yêu cầu **session-oriented (`PUT` lấy token -> `GET` kèm token)**.
- Đặt `HttpTokens: required` trên Launch Template / Instance Metadata Options để ép buộc IMDSv2.

- **A:** Sai vì cả IMDSv1 và IMDSv2 đều dùng chung địa chỉ link-local `169.254.169.254`.
- **B (Đúng):** Đúng! **IMDSv2** là cơ chế session-oriented: bắt buộc dùng HTTP **`PUT`** kèm header TTL để lấy session token trước, sau đó truyền token đó qua header `X-aws-ec2-metadata-token` khi `GET` metadata — giúp chặn các lỗ hổng SSRF vốn chỉ thực hiện được HTTP `GET` đơn giản.
- **C:** Sai vì IMDSv2 vẫn cấp temporary credentials từ IAM Instance Profile bình thường, chỉ thêm lớp bảo mật session token.
- **D:** Sai vì IMDSv2 dùng session token nội bộ do `PUT /latest/api/token` cấp, không dùng mật khẩu.

</details>

### Câu 2 `medium`

A developer is configuring an Application Load Balancer (ALB) Target Group for an Auto Scaling Group of EC2 web servers. The team wants to ensure that: (1) unhealthy instances are quickly detected and replaced by the Auto Scaling Group, and (2) the ALB routes `/api/*` requests to the `api-tg` Target Group and `/static/*` requests to the `static-tg` Target Group. Which TWO configurations are required? (Choose two.)

- **A.** Replace the ALB with a Network Load Balancer (NLB) to perform Layer 7 HTTP `/api/*` path-based routing.
- **B.** Keep the Auto Scaling Group Health Check Type as `EC2` so crashed web application processes are replaced automatically.
- **C.** Set the Auto Scaling Group's Health Check Type to `ELB` so ASG replaces EC2 instances failing ALB target health checks.
- **D.** Disable ALB health checks on both Target Groups so intermittent application errors do not drop targets.
- **E.** Create Path-based Listener Rules on the ALB Listener (`/api/*` -> `api-tg`, `/static/*` -> `static-tg`).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer đang cấu hình một Application Load Balancer (ALB) Target Group cho một Auto Scaling Group gồm các máy chủ web EC2. Nhóm muốn đảm bảo rằng: (1) các instance không khỏe mạnh (unhealthy) được phát hiện nhanh chóng và thay thế bởi Auto Scaling Group, và (2) ALB định tuyến các request `/api/*` tới Target Group `api-tg` và các request `/static/*` tới Target Group `static-tg`. Cần HAI cấu hình nào? (Chọn hai đáp án.)

**Đáp án đúng:** **C, E**

**EC2 Auto Scaling + ALB**:
- Luôn đổi ASG Health Check Type từ `EC2` sang **`ELB`** khi chạy sau Load Balancer.
- **ALB (Layer 7)** hỗ trợ định tuyến theo Path, Host, Header, Query String.

- **A:** Sai vì NLB hoạt động ở Layer 4 (TCP/UDP/TLS), không đọc được HTTP URL path `/api/*`.
- **B:** Sai vì nếu process web bị crash nhưng OS EC2 vẫn chạy, `EC2` health check vẫn báo Healthy và ASG sẽ không thay thế instance.
- **C (Đúng):** Đúng! Mặc định ASG chỉ kiểm tra **EC2 Status Check** (máy ảo có bật không). Chuyển sang **`ELB` Health Check** giúp ASG tự động terminate và thay thế instance ngay khi ứng dụng web bị treo và fail ALB health check.
- **D:** Sai vì tắt/bỏ qua health check sẽ khiến ALB vẫn gửi traffic vào instance lỗi.
- **E (Đúng):** Đúng! **ALB Listener Rules** (Layer 7) hỗ trợ định tuyến theo Path (`/api/*`), Host header (`api.example.com`), HTTP headers, và Query strings.

</details>

### Câu 3 `medium`

A company hosts a web application behind an Application Load Balancer (ALB) and wants to enforce HTTPS (TLS 1.3) for all client traffic while automatically redirecting any incoming HTTP (port 80) requests to HTTPS (port 443). Which TWO configurations are required on the ALB? (Choose two.)

- **A.** Use an AWS Certificate Manager (ACM) TLS certificate created in `us-east-1` even though the Application Load Balancer is deployed in `ap-southeast-1`.
- **B.** Attach an ACM TLS certificate to the ALB HTTPS (443) Listener with a TLS 1.3 Security Policy (e.g., `ELBSecurityPolicy-TLS13-1-2-2021-06`).
- **C.** Delete the HTTP (port 80) Listener on the ALB so client browsers automatically upgrade connections without a redirect.
- **D.** Configure a Redirect action (`HTTP 301` to `HTTPS://#{host}:443/#{path}?#{query}`) on the ALB HTTP (port 80) Listener.
- **E.** Terminate incoming client TLS 1.3 connections inside an Amazon SQS standard queue before forwarding to the ALB.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ một ứng dụng web phía sau một Application Load Balancer (ALB) và muốn bắt buộc sử dụng HTTPS (TLS 1.3) cho toàn bộ lưu lượng client đồng thời tự động chuyển hướng mọi request HTTP (cổng 80) đến sang HTTPS (cổng 443). Cần HAI cấu hình nào trên ALB? (Chọn hai đáp án.)

**Đáp án đúng:** **B, D**

**ALB HTTPS & Redirect**:
- ACM Certificate cho ALB phải ở **cùng Region** với ALB.
- Port 80 Listener dùng **Redirect Action** (`301`) sang port 443.
- Port 443 Listener chọn **TLS Security Policy** phù hợp.

- **A:** Sai vì chứng chỉ ACM gắn lên **ALB** bắt buộc phải tạo ở **cùng Region** với ALB (`ap-southeast-1`), không phải `us-east-1` như CloudFront.
- **B (Đúng):** Đúng! ALB HTTPS Listener sử dụng chứng chỉ **ACM** (tạo ở cùng Region với ALB) và **SSL/TLS Security Policy** hỗ trợ TLS 1.3.
- **C:** Sai vì xóa port 80 sẽ khiến người dùng gõ `http://...` bị timeout/connection refused thay vì tự chuyển sang `https://...`.
- **D (Đúng):** Đúng! ALB Listener port 80 hỗ trợ sẵn **Redirect Action** chuyển thẳng toàn bộ HTTP sang HTTPS (301 Permanent Redirect) mà không cần chuyển request xuống EC2/ECS backend.
- **E:** Sai vì SQS không làm nhiệm vụ ALB TLS termination.

</details>

### Câu 4 `medium`

A developer notices that an Application Load Balancer (ALB) is returning `HTTP 502 Bad Gateway` errors intermittently to clients. The backend targets are EC2 instances running a Node.js web server. What is a very common cause of intermittent `502 Bad Gateway` errors between an ALB and a Node.js backend?

- **A.** The Application Load Balancer is missing an Amazon S3 Bucket Policy to forward HTTP responses to external internet clients.
- **B.** Node.js's `keepAliveTimeout` (default 5s) is shorter than ALB's idle timeout (60s), so Node.js closes the socket as ALB reuses it.
- **C.** The backend EC2 instance has IMDSv2 (`HttpTokens: required`) enabled, blocking ALB health checks.
- **D.** The ALB Target Group has Sticky Sessions (`stickiness.enabled`) disabled for Node.js backend targets.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer nhận thấy Application Load Balancer (ALB) thỉnh thoảng trả về lỗi `HTTP 502 Bad Gateway` cho các client. Các backend target là các EC2 instance đang chạy máy chủ web Node.js. Nguyên nhân rất phổ biến của lỗi `502 Bad Gateway` gián đoạn giữa ALB và backend Node.js là gì?

**Đáp án đúng:** **B**

Gỡ lỗi **`HTTP 502 Bad Gateway` trên ALB**:
- Nguyên nhân phổ biến: Backend đóng kết nối sớm (**`keepAliveTimeout` < ALB Idle Timeout 60s**), hoặc backend trả về HTTP response sai chuẩn / header quá lớn.

- **A:** Sai vì ALB không cần S3 Bucket Policy để forward traffic tới EC2.
- **B (Đúng):** Đúng! Đây là lỗi kinh điển trong thực tế và đề thi: khi **backend `keepAliveTimeout` < ALB `Idle Timeout` (60s)**, backend tự đóng kết nối TCP đúng lúc ALB gửi request qua kết nối đó -> ALB trả về **`502 Bad Gateway`**. Khắc phục bằng cách đặt `keepAliveTimeout` của backend **lớn hơn** ALB idle timeout (ví dụ 65s).
- **C:** Sai vì IMDSv2 không gây lỗi `502` từ ALB.
- **D:** Sai vì tắt Sticky Sessions không gây `502 Bad Gateway`.

</details>

### Câu 5 `medium`

A developer runs an application on Amazon EC2 instances behind an Application Load Balancer. After enforcing IMDSv2 (`HttpTokens: required`) on the EC2 instances, a legacy bash script running on the instance starts receiving `HTTP 401 Unauthorized` when calling `curl http://169.254.169.254/latest/meta-data/instance-id`. How should the developer fix the script?

- **A.** Change the EC2 metadata endpoint URL protocol from `http://` to `https://` for TLS-authenticated requests.
- **B.** Send `PUT` to `http://169.254.169.254/latest/api/token` with `X-aws-ec2-metadata-token-ttl-seconds`, then pass it in `X-aws-ec2-metadata-token` on `GET`.
- **C.** Add an outbound Security Group rule allowing TCP port 443 to `169.254.169.254/32` on the EC2 instance.
- **D.** Pass the IAM Instance Profile ARN in the HTTP `Authorization: Bearer` header on the `GET` request.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer vận hành một ứng dụng trên các Amazon EC2 instance phía sau một Application Load Balancer. Sau khi bắt buộc sử dụng IMDSv2 (`HttpTokens: required`) trên các EC2 instance, một bash script cũ chạy trên instance bắt đầu nhận được lỗi `HTTP 401 Unauthorized` khi gọi `curl http://169.254.169.254/latest/meta-data/instance-id`. Developer nên sửa script như thế nào?

**Đáp án đúng:** **B**

Khi bật **IMDSv2 (`HttpTokens: required`)**, mọi request `GET` không kèm token hợp lệ đều nhận `401 Unauthorized`. Quy trình đúng là:
1. `TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")`
2. `curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id`

- **A:** Sai vì IMDS luôn chạy trên link-local `http://169.254.169.254`.
- **B (Đúng):** Đúng! IMDSv2 yêu cầu session-oriented token: bước 1 gọi `PUT /latest/api/token` kèm TTL header, bước 2 truyền token qua `X-aws-ec2-metadata-token`.
- **C:** Sai vì lỗi 401 là do thiếu IMDSv2 session token, không phải do Security Group.
- **D:** Sai vì IMDSv2 không dùng Bearer ARN header.

</details>

### Câu 6 `medium`

An Auto Scaling Group takes 8 minutes to launch new EC2 instances during traffic spikes because the User Data script installs packages, compiles native dependencies, and downloads application code on every boot. How can a developer minimize instance launch time so the ASG responds rapidly to spikes?

- **A.** Move the OS dependency installation commands from EC2 User Data to a scheduled Amazon EventBridge rule.
- **B.** Increase the EC2 User Data script size beyond 16 KB using gzip and base64 compression.
- **C.** Create a Golden AMI with all dependencies and binaries pre-installed, and reference it in the Launch Template.
- **D.** Switch the Auto Scaling Group from an EC2 Launch Template to a legacy Launch Configuration.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một Auto Scaling Group mất 8 phút để khởi chạy các EC2 instance mới trong các đợt tăng lưu lượng đột biến vì script User Data cài đặt các gói, biên dịch các dependency gốc và tải xuống mã ứng dụng ở mỗi lần khởi động. Làm thế nào developer có thể giảm thiểu thời gian khởi chạy instance để ASG phản ứng nhanh với các đợt tăng đột biến?

**Đáp án đúng:** **C**

**Golden AMI** là giải pháp chuẩn để giảm thời gian khởi tạo EC2 trong Auto Scaling Group.

- **A:** Sai, vẫn mất thời gian cài đặt trên instance mới.
- **B:** Sai, giới hạn User Data vẫn là 16 KB và không giải quyết tốc độ boot.
- **C (Đúng):** Đúng! Dùng **Golden AMI** (tạo bằng EC2 Image Builder hoặc Packer) giúp loại bỏ thời gian cài đặt lúc boot, rút ngắn thời gian scale-out xuống tối đa.
- **D:** Sai, Launch Configuration là bản cũ và không giúp boot nhanh hơn.

</details>

---

[← Chủ đề 01](01-iam-cli-sdk.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chủ đề 03 →](03-rds-aurora-elasticache.md)
