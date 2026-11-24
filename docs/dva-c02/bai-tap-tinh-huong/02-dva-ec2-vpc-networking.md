# Bài tập tình huống — Chủ đề 2: EC2, Storage, ELB/ASG, VPC & Route 53

> EC2 Instance Types, IMDSv2, EBS/EFS, ALB/NLB, Auto Scaling, VPC Subnets/Security Groups/Endpoints và Route 53.
> **Số câu hỏi:** 6 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án & Giải thích chi tiết**.

---

### Câu 1 `medium`

A legacy application running on Amazon EC2 reads its temporary IAM credentials by querying `http://169.254.169.254/latest/meta-data/iam/security-credentials/` using simple HTTP `GET` requests without a session token. A security audit requires enforcing **IMDSv2** to protect against Server-Side Request Forgery (SSRF) vulnerabilities. What changes when IMDSv2 is enforced on the EC2 instance?

- **A.** Issue an HTTP `PUT` to `http://169.254.169.254/latest/api/token` with `X-aws-ec2-metadata-token-ttl-seconds`, then pass the token in `X-aws-ec2-metadata-token`.
- **B.** IMDSv2 completely disables IAM Instance Profiles on Amazon EC2, requiring applications to use static IAM User access keys instead.
- **C.** The EC2 instance metadata link-local IPv4 address changes from `169.254.169.254` to the VPC router address `10.0.0.1` when IMDSv2 is enforced on the EC2 instance.
- **D.** The application must pass the EC2 root user password or instance ID encoded in Base64 inside the HTTP `Authorization` header on GET requests.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

**EC2 Instance Metadata Service v2 (IMDSv2)**:
- Chống **SSRF** bằng yêu cầu **session-oriented (`PUT` lấy token -> `GET` kèm token)**.
- Đặt `HttpTokens: required` trên Launch Template / Instance Metadata Options để ép buộc IMDSv2.

- **A (Đúng):** Đúng! **IMDSv2** là cơ chế session-oriented: bắt buộc dùng HTTP **`PUT`** kèm header TTL để lấy session token trước, sau đó truyền token đó qua header `X-aws-ec2-metadata-token` khi `GET` metadata — giúp chặn các lỗ hổng SSRF vốn chỉ thực hiện được HTTP `GET` đơn giản.
- **B:** Sai vì IMDSv2 vẫn cấp temporary credentials từ IAM Instance Profile bình thường, chỉ thêm lớp bảo mật session token.
- **C:** Sai vì cả IMDSv1 và IMDSv2 đều dùng chung địa chỉ link-local `169.254.169.254`.
- **D:** Sai vì IMDSv2 dùng session token nội bộ do `PUT /latest/api/token` cấp, không dùng mật khẩu.

</details>

### Câu 2 `medium` *(Chọn nhiều đáp án)*

A developer is configuring an Application Load Balancer (ALB) Target Group for an Auto Scaling Group of EC2 web servers. The team wants to ensure that: (1) unhealthy instances are quickly detected and replaced by the Auto Scaling Group, and (2) the ALB routes `/api/*` requests to the `api-tg` Target Group and `/static/*` requests to the `static-tg` Target Group. Which TWO configurations are required? (Choose two.)

- **A.** Disable ALB health checks on both Target Groups so unhealthy instances remain in service during traffic spikes.
- **B.** Create Path-based Listener Rules on the ALB Listener (`/api/*` -> `api-tg`, `/static/*` -> `static-tg`).
- **C.** Keep the ASG Health Check Type as `EC2` so failed web processes are replaced automatically.
- **D.** Set the Auto Scaling Group's Health Check Type to `ELB` (so ASG replaces EC2 instances that fail ALB target health checks, not just EC2 status checks).
- **E.** Replace the ALB with a Network Load Balancer (NLB) to perform HTTP `/api/*` path-based routing.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**, **D**

**EC2 Auto Scaling + ALB**:
- Luôn đổi ASG Health Check Type từ `EC2` sang **`ELB`** khi chạy sau Load Balancer.
- **ALB (Layer 7)** hỗ trợ định tuyến theo Path, Host, Header, Query String.

- **A:** Sai vì tắt/bỏ qua health check sẽ khiến ALB vẫn gửi traffic vào instance lỗi.
- **B (Đúng):** Đúng! **ALB Listener Rules** (Layer 7) hỗ trợ định tuyến theo Path (`/api/*`), Host header (`api.example.com`), HTTP headers, và Query strings.
- **C:** Sai vì nếu process web bị crash nhưng OS EC2 vẫn chạy, `EC2` health check vẫn báo Healthy và ASG sẽ không thay thế instance.
- **D (Đúng):** Đúng! Mặc định ASG chỉ kiểm tra **EC2 Status Check** (máy ảo có bật không). Chuyển sang **`ELB` Health Check** giúp ASG tự động terminate và thay thế instance ngay khi ứng dụng web bị treo và fail ALB health check.
- **E:** Sai vì NLB hoạt động ở Layer 4 (TCP/UDP/TLS), không đọc được HTTP URL path `/api/*`.

</details>

### Câu 3 `medium` *(Chọn nhiều đáp án)*

A company hosts a web application behind an Application Load Balancer (ALB) and wants to enforce HTTPS (TLS 1.3) for all client traffic while automatically redirecting any incoming HTTP (port 80) requests to HTTPS (port 443). Which TWO configurations are required on the ALB? (Choose two.)

- **A.** Delete the HTTP (port 80) Listener so browsers automatically upgrade without a redirect.
- **B.** Use an ACM certificate created in `us-east-1` even though the ALB is in `ap-southeast-1`.
- **C.** Terminate TLS 1.3 inside an Amazon SQS queue before forwarding HTTP requests to the ALB target group.
- **D.** Attach an ACM TLS certificate to the ALB HTTPS (443) Listener with a TLS 1.3 Security Policy (e.g., `ELBSecurityPolicy-TLS13-1-2-2021-06`).
- **E.** Configure a Redirect action (`HTTP 301` to `HTTPS://#{host}:443/#{path}?#{query}`) on the ALB HTTP (port 80) Listener.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**, **E**

**ALB HTTPS & Redirect**:
- ACM Certificate cho ALB phải ở **cùng Region** với ALB.
- Port 80 Listener dùng **Redirect Action** (`301`) sang port 443.
- Port 443 Listener chọn **TLS Security Policy** phù hợp.

- **A:** Sai vì xóa port 80 sẽ khiến người dùng gõ `http://...` bị timeout/connection refused thay vì tự chuyển sang `https://...`.
- **B:** Sai vì chứng chỉ ACM gắn lên **ALB** bắt buộc phải tạo ở **cùng Region** với ALB (`ap-southeast-1`), không phải `us-east-1` như CloudFront.
- **C:** Sai vì SQS không làm nhiệm vụ ALB TLS termination.
- **D (Đúng):** Đúng! ALB HTTPS Listener sử dụng chứng chỉ **ACM** (tạo ở cùng Region với ALB) và **SSL/TLS Security Policy** hỗ trợ TLS 1.3.
- **E (Đúng):** Đúng! ALB Listener port 80 hỗ trợ sẵn **Redirect Action** chuyển thẳng toàn bộ HTTP sang HTTPS (301 Permanent Redirect) mà không cần chuyển request xuống EC2/ECS backend.

</details>

### Câu 4 `medium`

A developer notices that an Application Load Balancer (ALB) is returning `HTTP 502 Bad Gateway` errors intermittently to clients. The backend targets are EC2 instances running a Node.js web server. What is a very common cause of intermittent `502 Bad Gateway` errors between an ALB and a Node.js backend?

- **A.** The Application Load Balancer is missing an S3 Bucket Policy for HTTP 502 error logging.
- **B.** The backend EC2 instance has IMDSv2 enforced, which blocks ALB health check headers.
- **C.** The ALB Target Group has Sticky Sessions disabled, causing HTTP 502 connection resets.
- **D.** Node.js `keepAliveTimeout` (5s) is shorter than the ALB idle timeout (60s), so Node.js closes TCP connections as ALB reuses them.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Gỡ lỗi **`HTTP 502 Bad Gateway` trên ALB**:
- Nguyên nhân phổ biến: Backend đóng kết nối sớm (**`keepAliveTimeout` < ALB Idle Timeout 60s**), hoặc backend trả về HTTP response sai chuẩn / header quá lớn.

- **A:** Sai vì ALB không cần S3 Bucket Policy để forward traffic tới EC2.
- **B:** Sai vì IMDSv2 không gây lỗi `502` từ ALB.
- **C:** Sai vì tắt Sticky Sessions không gây `502 Bad Gateway`.
- **D (Đúng):** Đúng! Đây là lỗi kinh điển trong thực tế và đề thi: khi **backend `keepAliveTimeout` < ALB `Idle Timeout` (60s)**, backend tự đóng kết nối TCP đúng lúc ALB gửi request qua kết nối đó -> ALB trả về **`502 Bad Gateway`**. Khắc phục bằng cách đặt `keepAliveTimeout` của backend **lớn hơn** ALB idle timeout (ví dụ 65s).

</details>

### Câu 5 `medium`

A developer runs an application on Amazon EC2 instances behind an Application Load Balancer. After enforcing IMDSv2 (`HttpTokens: required`) on the EC2 instances, a legacy bash script running on the instance starts receiving `HTTP 401 Unauthorized` when calling `curl http://169.254.169.254/latest/meta-data/instance-id`. How should the developer fix the script?

- **A.** Change the metadata request URL protocol from `http://` to `https://` when calling `169.254.169.254`.
- **B.** Add an outbound Security Group rule allowing TCP port 443 to `169.254.169.254/32` on the EC2 instance.
- **C.** Send a `PUT` to `http://169.254.169.254/latest/api/token` with `X-aws-ec2-metadata-token-ttl-seconds`, then pass it in `X-aws-ec2-metadata-token`.
- **D.** Pass the IAM Instance Profile ARN in the HTTP `Authorization: Bearer` header on metadata `GET` requests.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Khi bật **IMDSv2 (`HttpTokens: required`)**, mọi request `GET` không kèm token hợp lệ đều nhận `401 Unauthorized`. Quy trình đúng là:
1. `TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")`
2. `curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id`

- **A:** Sai vì IMDS luôn chạy trên link-local `http://169.254.169.254`.
- **B:** Sai vì lỗi 401 là do thiếu IMDSv2 session token, không phải do Security Group.
- **C (Đúng):** Đúng! IMDSv2 yêu cầu session-oriented token: bước 1 gọi `PUT /latest/api/token` kèm TTL header, bước 2 truyền token qua `X-aws-ec2-metadata-token`.
- **D:** Sai vì IMDSv2 không dùng Bearer ARN header.

</details>

### Câu 6 `medium`

An Auto Scaling Group takes 8 minutes to launch new EC2 instances during traffic spikes because the User Data script installs packages, compiles native dependencies, and downloads application code on every boot. How can a developer minimize instance launch time so the ASG responds rapidly to spikes?

- **A.** Switch from an EC2 Launch Template to a legacy Launch Configuration to speed up boot.
- **B.** Move the dependency installation commands from EC2 User Data to a CloudWatch Event rule.
- **C.** Increase the User Data script size beyond 16 KB using gzip and base64 compression.
- **D.** Create a Golden AMI with all dependencies and application binaries pre-installed, and reference it in the Launch Template.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

**Golden AMI** là giải pháp chuẩn để giảm thời gian khởi tạo EC2 trong Auto Scaling Group.

- **A:** Sai, Launch Configuration là bản cũ và không giúp boot nhanh hơn.
- **B:** Sai, vẫn mất thời gian cài đặt trên instance mới.
- **C:** Sai, giới hạn User Data vẫn là 16 KB và không giải quyết tốc độ boot.
- **D (Đúng):** Đúng! Dùng **Golden AMI** (tạo bằng EC2 Image Builder hoặc Packer) giúp loại bỏ thời gian cài đặt lúc boot, rút ngắn thời gian scale-out xuống tối đa.

</details>

---

[← Bộ trước](01-dva-iam-cli-sdk.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Bộ tiếp theo →](03-dva-rds-aurora-elasticache.md)
