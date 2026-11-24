# Chương 07 – AWS Fundamentals: ELB + ASG

> **Nguồn:** 18 video của chương + *High Availability & Scalability Quiz*.
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay (2026, kỳ thi **DVA-C02**). Video gốc dùng Amazon Linux 2 và `t2.micro`; Amazon Linux 2 đã **hết hỗ trợ (30/6/2026)**, nên khi làm lại hands-on hãy dùng **Amazon Linux 2023** và loại instance thuộc free tier của tài khoản bạn (`t2.micro` hoặc `t3.micro` tuỳ region).

## Mục tiêu chương

Sau chương này bạn có thể:

- Phân biệt **scalability theo chiều dọc / chiều ngang** và **high availability**.
- Hiểu vai trò của **Elastic Load Balancing (ELB)**, health check, và cách bảo mật bằng **security group tham chiếu security group**.
- Phân biệt 4 loại load balancer: **CLB, ALB, NLB, GWLB**, và chọn đúng loại theo đề bài.
- Cấu hình **ALB** (target group, listener rule theo path/host/query string/header, fixed response), **NLB** (IP tĩnh, TCP/UDP).
- Nắm các tính năng chung của ELB: **Sticky Sessions**, **Cross-Zone Load Balancing**, **SSL/TLS + SNI**, **Connection Draining / Deregistration Delay**.
- Tạo **Auto Scaling Group (ASG)** với **Launch Template**, gắn vào ALB, dùng health check của ELB.
- Chọn **scaling policy** phù hợp (target tracking, step/simple, scheduled, predictive), hiểu **cooldown**, và cập nhật ASG bằng **Instance Refresh**.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001 | High Availability and Scalability | Bài 1 – Scalability và High Availability |
| 002 | Elastic Load Balancing (ELB) Overview | Bài 2 – Tổng quan Elastic Load Balancing |
| 004–006 | Application Load Balancer (ALB) (+ Hands On Part 1, Part 2) | Bài 3 – Application Load Balancer (ALB) |
| 007–008 | Network Load Balancer (NLB) | Bài 4 – Network Load Balancer (NLB) |
| 009 | Gateway Load Balancer (GWLB) | Bài 5 – Gateway Load Balancer (GWLB) |
| 010 | Elastic Load Balancer – Sticky Sessions | Bài 6 – Sticky Sessions (Session Affinity) |
| 011 | Elastic Load Balancer – Cross Zone Load Balancing | Bài 7 – Cross-Zone Load Balancing |
| 012–013 | Elastic Load Balancer – SSL Certificates | Bài 8 – SSL/TLS Certificates và SNI |
| 014 | Elastic Load Balancer – Connection Draining | Bài 9 – Connection Draining / Deregistration Delay |
| 015–016 | Auto Scaling Groups (ASG) Overview | Bài 10 – Auto Scaling Group (ASG) |
| 017–018 | Auto Scaling Groups – Scaling Policies | Bài 11 – Scaling Policies |
| 019 | Auto Scaling Groups – Instance Refresh | Bài 12 – Instance Refresh |
| Quiz | High Availability & Scalability Quiz | Câu hỏi ôn tập |

> Không có video 003 trong nguồn (số thứ tự nhảy từ 002 sang 004). Trong các phiên bản cũ của khoá, đây là bài về **Classic Load Balancer**, đã bị lược bỏ vì CLB là thế hệ cũ.

---

## Bài 1 – Scalability và High Availability

### Lý thuyết

- **Scalability (khả năng mở rộng)**: hệ thống/ứng dụng xử lý được tải lớn hơn bằng cách thích nghi. Có 2 loại:
  - **Vertical scalability** (mở rộng theo chiều dọc).
  - **Horizontal scalability** (mở rộng theo chiều ngang), còn gọi là **elasticity**.
- Scalability **khác** high availability: liên quan nhưng không giống nhau.

Ví dụ tổng đài (call center) dùng trong video:

| Khái niệm | Ví dụ tổng đài | Trên AWS |
|---|---|---|
| **Vertical scaling** (scale **up/down**) | Thay nhân viên junior (5 cuộc gọi/phút) bằng nhân viên senior (10 cuộc gọi/phút) | Tăng cỡ instance: `t2.micro` → `t2.large` |
| **Horizontal scaling** (scale **out/in**) | Thuê thêm nhân viên: 1 → 2 → 3 → 6 người | Tăng/giảm **số lượng** instance (ASG, Load Balancer) |
| **High availability** | 3 nhân viên ở toà nhà New York + 3 ở San Francisco; một toà mất kết nối thì toà kia vẫn nhận cuộc gọi | Chạy ứng dụng trên **ít nhất 2 AZ**; ASG/Load Balancer **multi-AZ** |

#### Vertical scaling

- Tăng **kích thước** instance.
- Phổ biến cho **hệ thống không phân tán**, ví dụ **database** (RDS, ElastiCache có thể scale bằng cách nâng instance type).
- Luôn có **giới hạn phần cứng**. Video lấy ví dụ: nhỏ nhất là `t2.nano` (0,5 GB RAM, 1 vCPU), lớn nhất là `u-12tb1.metal` (12,3 TB RAM, 448 vCPU). Hiện nay đã có các instance High Memory lớn hơn nữa.

#### Horizontal scaling

- Tăng **số lượng** instance/hệ thống.
- Đòi hỏi **hệ thống phân tán**; phổ biến với web app/ứng dụng hiện đại. Không phải ứng dụng nào cũng phân tán được.
- Trên cloud việc này rất dễ: tạo thêm EC2 chỉ trong vài giây.
- Thuật ngữ AWS: **scale out** (thêm instance), **scale in** (bớt instance).

#### High availability

- Thường đi kèm horizontal scaling, nhưng không phải lúc nào cũng vậy.
- Chạy ứng dụng ở **ít nhất 2 data center (2 AZ)** để **sống sót khi mất một data center**.
- Có thể **passive** (ví dụ **RDS Multi-AZ**: bản standby chờ sẵn) hoặc **active** (horizontal scaling: tất cả cùng nhận tải).

### Ghi nhớ cho kỳ thi

- `r4.large` → `r4.4xlarge`: **vertical**. ASG tăng/giảm số instance: **horizontal**.
- **Scale up/down** = vertical; **scale out/in** = horizontal.
- **High availability** = **multi-AZ** (ASG multi-AZ, Load Balancer multi-AZ).
- Đề hay cố tình đánh lừa giữa các thuật ngữ này: hãy nhớ ví dụ tổng đài.

---

## Bài 2 – Tổng quan Elastic Load Balancing

### Lý thuyết

#### Load balancer là gì?

- Là một (hoặc một nhóm) server **chuyển tiếp traffic** tới nhiều EC2 instance/server ở phía sau (backend/downstream).
- Mỗi user mới được phân bổ tới một instance khác nhau; user **không biết** mình đang được phục vụ bởi instance nào, chỉ biết **một endpoint duy nhất** là load balancer.

#### Vì sao dùng load balancer?

- **Phân tán tải** cho nhiều instance phía sau.
- Cung cấp **một điểm truy cập duy nhất** (DNS) cho ứng dụng.
- **Xử lý lỗi của instance một cách liền mạch** (nhờ health check).
- **Health check** định kỳ cho instance.
- **SSL termination** (HTTPS) cho website.
- **Stickiness** bằng cookie.
- **High availability** trên nhiều AZ.
- **Tách traffic public và private**.

#### Vì sao dùng Elastic Load Balancer (ELB)?

- ELB là **load balancer được quản lý (managed)**: AWS lo nâng cấp, bảo trì, high availability; bạn chỉ chỉnh một số tham số cấu hình.
- Rẻ hơn và đỡ cực hơn nhiều so với tự dựng load balancer (tự scale là một "cơn ác mộng").
- Tích hợp với nhiều dịch vụ: EC2, **Auto Scaling Groups**, **Amazon ECS**, **AWS Certificate Manager (ACM)**, **CloudWatch**, **Route 53**, **AWS WAF**, **AWS Global Accelerator**…

#### Health checks

- Cách để ELB kiểm tra instance có hoạt động đúng không; nếu không thì **ngừng gửi traffic** tới instance đó.
- Thực hiện trên một **port** và một **route**, ví dụ: protocol `HTTP`, port `4567`, endpoint `/health`.
- Instance không trả về **`200 OK`** → bị đánh dấu **unhealthy**.

#### 4 loại load balancer được quản lý trên AWS

| Loại | Năm | Thế hệ | Giao thức | Tầng OSI |
|---|---|---|---|---|
| **Classic Load Balancer (CLB)** | 2009 | V1 – thế hệ cũ, **deprecated** | HTTP, HTTPS, TCP, SSL (secure TCP) | 4 và 7 |
| **Application Load Balancer (ALB)** | 2016 | V2 – thế hệ mới | HTTP, HTTPS, WebSocket | 7 |
| **Network Load Balancer (NLB)** | 2017 | V2 – thế hệ mới | TCP, TLS (secure TCP), UDP | 4 |
| **Gateway Load Balancer (GWLB)** | 2020 | Thế hệ mới | IP (tầng mạng) | 3 |

- Nên dùng **load balancer thế hệ mới** vì nhiều tính năng hơn. CLB vẫn tạo được nhưng console đánh dấu là thế hệ cũ.
- Load balancer có thể là **internal** (private, chỉ truy cập trong mạng) hoặc **external / internet-facing** (public, cho website).

#### Security group cho load balancer

| Đối tượng | Inbound rule |
|---|---|
| **Security group của Load Balancer** | HTTP **80** và HTTPS **443** từ **`0.0.0.0/0`** (mọi nơi) |
| **Security group của EC2** | HTTP **80** với **source = security group của Load Balancer** (không phải dải IP) |

Nhờ tham chiếu security group, EC2 **chỉ nhận traffic đi từ load balancer**, tăng cường bảo mật.

### Kiến thức thực tế

- Tạo rule "EC2 chỉ nhận traffic từ ALB" bằng CLI:

  ```bash
  aws ec2 authorize-security-group-ingress \
    --group-id sg-0ec2instance000000 \
    --protocol tcp --port 80 \
    --source-group sg-0alb0000000000000
  ```

- ELB tính phí theo **giờ chạy** cộng với đơn vị dung lượng (**LCU** cho ALB, **NLCU** cho NLB, **GLCU** cho GWLB). Load balancer để không vẫn tốn tiền, nên **xoá sau khi làm hands-on**.
- Từ 2/2024, AWS tính phí cho **mọi địa chỉ public IPv4** (kể cả IP của load balancer internet-facing và EC2 có public IP). Đây là thêm một lý do để EC2 phía sau ELB nằm trong **private subnet**.
- **CLB**: EC2-Classic đã bị khai tử từ 2023; CLB vẫn chạy trong VPC nhưng AWS khuyến nghị **migrate sang ALB/NLB** (console có công cụ *Migrate*). Đề DVA-C02 hầu như không hỏi sâu về CLB.

### Ghi nhớ cho kỳ thi

- ELB cho **một DNS name cố định**, health check, SSL termination, stickiness, multi-AZ.
- Health check trả về khác **200** → unhealthy → không nhận traffic.
- EC2 sau ELB: security group cho phép traffic **từ security group của ELB**.
- HTTP/HTTPS/WebSocket → **ALB**; TCP/UDP/hiệu năng cực cao → **NLB**; tầng 3, appliance bảo mật → **GWLB**.

---

## Bài 3 – Application Load Balancer (ALB)

### Lý thuyết

- **Tầng 7 (HTTP)** only.
- Cân bằng tải tới **nhiều ứng dụng HTTP trên nhiều máy**, các máy này được gom thành **target group**.
- Cân bằng tải tới **nhiều ứng dụng trên cùng một EC2** (ví dụ container với **ECS**).
- Hỗ trợ **HTTP/2** và **WebSocket**.
- Hỗ trợ **redirect**, ví dụ tự chuyển **HTTP → HTTPS** ngay tại load balancer.

#### Routing tới các target group

| Kiểu routing | Ví dụ |
|---|---|
| Theo **path** của URL | `example.com/users` và `example.com/posts` |
| Theo **hostname** | `one.example.com` và `other.example.com` |
| Theo **query string / header** | `example.com/users?id=123&order=false` |

- ALB rất hợp với **microservices** và **ứng dụng dạng container** (Docker, Amazon ECS) nhờ tính năng **port mapping** cho phép chuyển tới **port động** trên ECS instance.
- So với CLB: muốn nhiều ứng dụng sau CLB thì phải **mỗi ứng dụng một CLB**; với ALB thì **một ALB** đứng trước **nhiều ứng dụng**.

Ví dụ: một ALB public, route `/user` tới target group "User app", route `/search` tới target group "Search app". Hai microservice độc lập, mỗi target group có health check riêng, nhưng dùng chung một ALB.

#### Target group của ALB có thể là

- **EC2 instances** (có thể được quản lý bởi **Auto Scaling Group**) – HTTP.
- **ECS tasks** (do ECS quản lý) – HTTP.
- **Lambda functions** – request HTTP được chuyển thành một **JSON event** (ít người biết; Lambda là nền tảng của serverless).
- **IP addresses** – **phải là private IP** (ví dụ server on-premises).

ALB route được tới **nhiều target group**; **health check thực hiện ở cấp target group**.

Ví dụ query string: target group 1 là EC2 trên AWS, target group 2 là server on-premises (đăng ký bằng private IP). Request có `?Platform=Mobile` → target group 1; `?Platform=Desktop` → target group 2.

#### Điều cần biết thêm

- ALB có **hostname cố định** (`XXX.region.elb.amazonaws.com`), **không** có IP tĩnh.
- Server ứng dụng **không thấy IP thật của client**. ALB thực hiện **connection termination** và mở kết nối mới tới EC2 bằng **private IP của ALB**. Thông tin về client nằm trong header:

  | Header | Nội dung |
  |---|---|
  | **`X-Forwarded-For`** | **IP của client** |
  | `X-Forwarded-Port` | Port client đã dùng |
  | `X-Forwarded-Proto` | Protocol client đã dùng (http/https) |

### Kiến thức thực tế

- **Lấy IP client trong code** (Python Flask). `X-Forwarded-For` có thể là danh sách `client, proxy1, proxy2`; IP gốc là phần tử **đầu tiên** (nhưng client có thể tự chèn giá trị giả, nên phần tử cuối do ALB thêm là đáng tin nhất):

  ```python
  from flask import Flask, request
  app = Flask(__name__)

  @app.route("/")
  def index():
      xff = request.headers.get("X-Forwarded-For", request.remote_addr)
      client_ip = xff.split(",")[0].strip()
      proto = request.headers.get("X-Forwarded-Proto", "http")
      return f"Client IP: {client_ip}, protocol: {proto}"
  ```

  Với Apache/Nginx, cấu hình log format để ghi `%{X-Forwarded-For}i` thay vì IP của ALB.
- **Redirect HTTP → HTTPS** (rất hay dùng):

  ```bash
  aws elbv2 modify-listener --listener-arn $LISTENER_ARN \
    --default-actions '[{"Type":"redirect","RedirectConfig":{"Protocol":"HTTPS","Port":"443","StatusCode":"HTTP_301"}}]'
  ```

- Các tính năng ALB đáng biết thêm: **weighted target groups** (chia % traffic giữa 2 target group, dùng cho blue/green, canary), **authenticate action** (đăng nhập bằng **Cognito** hoặc **OIDC** ngay tại ALB), **gRPC**, **mutual TLS (mTLS)**, tích hợp **AWS WAF**.
- **Lambda làm target**: ALB gửi event JSON gồm `httpMethod`, `path`, `headers`, `queryStringParameters`, `body`; Lambda phải trả về `statusCode`, `headers`, `body`. Cần resource policy cho phép `elasticloadbalancing.amazonaws.com` invoke hàm.
- **Health check**: ALB đánh giá theo `HealthyThresholdCount`, `UnhealthyThresholdCount`, `HealthCheckIntervalSeconds`, `HealthCheckTimeoutSeconds`, `Matcher` (mã thành công, có thể là `200-399`). Nên làm endpoint `/health` nhẹ, **không** phụ thuộc DB nặng, tránh việc DB chậm làm toàn bộ fleet bị đánh unhealthy.
- **Lỗi hay gặp**: `502 Bad Gateway` (target trả response sai hoặc đóng kết nối, thường do keep-alive timeout của app nhỏ hơn idle timeout 60 giây của ALB), `503 Service Unavailable` (target group **không có target healthy** nào), `504 Gateway Timeout` (target phản hồi chậm hơn idle timeout).

### Ghi nhớ cho kỳ thi

- ALB = **tầng 7**: HTTP, HTTPS, WebSocket, HTTP/2. **Không** hỗ trợ TCP thuần (đó là NLB).
- Routing theo **path, hostname, query string, HTTP header** (và method, source IP). **Không** routing theo **vị trí địa lý** của client (việc đó là của Route 53 / CloudFront).
- Target: **EC2, ECS tasks, Lambda, private IP**. **Không** đăng ký NLB làm target của ALB (chiều ngược lại NLB → ALB thì được).
- IP client nằm ở **`X-Forwarded-For`**; port ở `X-Forwarded-Port`; protocol ở `X-Forwarded-Proto`.
- ALB có **DNS name cố định**, **không có IP tĩnh**, không gắn được Elastic IP.
- Lỗi **503** = không có target healthy.

---

## Bài 4 – Network Load Balancer (NLB)

### Lý thuyết

- **Tầng 4**: cho phép **forward traffic TCP và UDP** tới instance (và TLS – secure TCP).
- Xử lý **hàng triệu request mỗi giây**.
- **Độ trễ cực thấp**: khoảng **~100 ms** so với **~400 ms** của ALB (con số minh hoạ trong khoá học).
- NLB có **một IP tĩnh cho mỗi AZ**, và hỗ trợ gắn **Elastic IP** (rất hữu ích khi khách hàng cần **whitelist** một tập IP cố định).
- Dùng cho **hiệu năng cực cao**, traffic **TCP hoặc UDP**.
- NLB **không thuộc free tier**.

#### Target group của NLB có thể là

| Target | Ghi chú |
|---|---|
| **EC2 instances** | Traffic TCP/UDP được gửi thẳng tới instance |
| **IP addresses** | **Phải là private IP**, ví dụ EC2 hoặc server **on-premises** |
| **Application Load Balancer** | **NLB đứng trước ALB**: vừa có **IP tĩnh** (nhờ NLB) vừa có **routing HTTP** (nhờ ALB) |

- **Health check** của NLB hỗ trợ **TCP, HTTP và HTTPS**.

#### NLB khác ALB ở đâu?

| Tiêu chí | ALB | NLB |
|---|---|---|
| Tầng OSI | 7 | 4 |
| Giao thức | HTTP, HTTPS, WebSocket, gRPC | TCP, UDP, TLS, TCP_UDP |
| IP | Không có IP tĩnh, chỉ DNS name | **1 IP tĩnh/AZ**, gắn được **Elastic IP** |
| Routing theo nội dung | Path, host, header, query string | Không (chỉ theo port/protocol) |
| IP client | Nằm trong `X-Forwarded-For` | Instance target: **giữ nguyên IP client** (client IP preservation) |
| Target | EC2, ECS, Lambda, private IP | EC2, private IP, **ALB** |
| Cross-zone mặc định | Bật | **Tắt** |

### Kiến thức thực tế

- **Security group cho NLB**: phải gắn **lúc tạo**; NLB tạo ra mà không có security group thì sau này **không thêm được** (phải tạo lại). Nên luôn gắn SG khi tạo để EC2 có thể tham chiếu SG của NLB giống mô hình ALB.
- **Client IP preservation**: với target type `instance`, EC2 thấy **IP thật của client**. Với target type `ip`, mặc định IP client **không** được giữ cho TCP/TLS; có thể bật attribute `preserve_client_ip.enabled` hoặc dùng **Proxy Protocol v2** để truyền IP client.
- **NLB → ALB** (target type `alb`): mẫu kiến trúc phổ biến khi cần **IP tĩnh + routing HTTP**, hoặc khi muốn expose ứng dụng qua **AWS PrivateLink** (VPC endpoint service chỉ đứng sau NLB/GWLB).
- **TLS listener**: NLB terminate TLS bằng chứng chỉ ACM, hỗ trợ **SNI**; hoặc dùng listener TCP:443 để **TLS passthrough** (target tự giải mã, đảm bảo end-to-end encryption).
- **UDP**: dùng cho game, DNS, VoIP, IoT. Listener `TCP_UDP` cho phép cùng một port nhận cả TCP lẫn UDP.
- NLB có **idle timeout TCP mặc định 350 giây** (chỉnh được từ 2024), UDP 120 giây.

### Ghi nhớ cho kỳ thi

- **TCP/UDP**, **hiệu năng cực cao**, **độ trễ thấp**, hàng triệu request/giây → **NLB**.
- Cần **IP tĩnh / Elastic IP** cho load balancer → **NLB** (ALB không có).
- Target của NLB: **EC2, private IP, ALB**.
- Health check NLB: **TCP, HTTP, HTTPS**.
- NLB **không thuộc free tier**.

---

## Bài 5 – Gateway Load Balancer (GWLB)

### Lý thuyết

- Dùng để **triển khai, scale và quản lý một nhóm (fleet) virtual appliance mạng của bên thứ ba** trên AWS.
- Ví dụ appliance: **Firewall**, **Intrusion Detection and Prevention Systems (IDPS)**, **Deep Packet Inspection**, hệ thống **sửa đổi payload**…
- Hoạt động ở **tầng 3 (Network layer)** – xử lý **IP packet**.
- Kết hợp 2 chức năng:
  - **Transparent Network Gateway**: một điểm vào/ra duy nhất cho mọi traffic.
  - **Load Balancer**: phân tải traffic tới các virtual appliance.
- Dùng **giao thức GENEVE** trên **port 6081** (chi tiết đề hay hỏi).

#### Luồng traffic

```
User ──► GWLB ──► Target group (virtual appliances: firewall, IDS...)
                     │ phân tích: cho qua hoặc drop
App  ◄── GWLB ◄──────┘
```

1. **Route table của VPC** được sửa để mọi traffic từ user **đi vào GWLB** trước (qua **Gateway Load Balancer Endpoint**).
2. GWLB phân tải traffic tới các **virtual appliance** trong target group.
3. Appliance phân tích traffic: nếu ổn thì **gửi lại GWLB**; nếu không thì **drop**.
4. GWLB chuyển traffic tới **ứng dụng** đích.
5. Với user và ứng dụng, mọi thứ **trong suốt**: họ không biết traffic đã đi qua appliance.

#### Target group của GWLB

- **EC2 instances**.
- **IP addresses** – phải là **private IP** (appliance chạy on-premises hoặc trên EC2).

### Kiến thức thực tế

- Kiến trúc thực tế: một **Security VPC** (hay *inspection VPC*) chứa GWLB + fleet firewall; các VPC ứng dụng tạo **GWLB Endpoint** (một loại VPC endpoint dựa trên PrivateLink) và route traffic qua endpoint đó. Có thể kết hợp **Transit Gateway** cho mô hình kiểm tra tập trung nhiều VPC.
- Appliance thường lấy từ **AWS Marketplace** (Palo Alto, Fortinet, Check Point…).
- Nếu chỉ cần firewall được quản lý mà không muốn tự vận hành appliance, AWS có **AWS Network Firewall**.
- GWLB tính phí theo giờ + **GLCU**; health check tới appliance dùng TCP/HTTP/HTTPS.
- Với DVA-C02, GWLB ít xuất hiện; chỉ cần nhận ra từ khoá.

### Ghi nhớ cho kỳ thi

- Từ khoá: **third-party virtual appliances**, **firewall**, **IDS/IPS**, **deep packet inspection**, **tầng 3**, **IP packets** → **GWLB**.
- **GENEVE – port 6081** → **GWLB**.
- Target: **EC2 instances, private IP**.

---

## Bài 6 – Sticky Sessions (Session Affinity)

### Lý thuyết

- **Stickiness**: cùng một client luôn được chuyển tới **cùng một instance** phía sau load balancer.
- Hoạt động với **CLB, ALB và NLB**.
- Với CLB và ALB, cơ chế dựa trên **cookie** có **thời hạn (expiration)** do bạn kiểm soát. Khi cookie hết hạn, client có thể được chuyển sang instance khác.
- Với NLB, stickiness hoạt động **không cần cookie** (dựa trên IP nguồn).
- **Use case**: đảm bảo user **không mất session data** (ví dụ thông tin đăng nhập lưu trên instance).
- **Nhược điểm**: có thể gây **mất cân bằng tải** giữa các instance (một số instance nhận nhiều user "dính" hơn).

#### Tên cookie

| Loại cookie | Ai tạo | Tên cookie |
|---|---|---|
| **Application-based – Custom cookie** | **Target** (ứng dụng) tạo | Tên tự chọn, có thể kèm attribute riêng. **Chỉ định riêng cho từng target group**. **Không được** dùng tên `AWSALB`, `AWSALBAPP`, `AWSALBTG` (ELB đã dành riêng) |
| **Application-based – Application cookie** | **Load balancer** tạo | `AWSALBAPP` |
| **Duration-based cookie** | **Load balancer** tạo | `AWSALB` (ALB), `AWSELB` (CLB) |

- **Duration-based**: thời hạn do **load balancer** đặt (từ **1 giây đến 7 ngày**).
- **Application-based**: thời hạn do **ứng dụng** quyết định (theo cookie của ứng dụng).

### Kiến thức thực tế

- Thực tế nên thiết kế ứng dụng **stateless**: lưu session vào **ElastiCache (Redis/Valkey)** hoặc **DynamoDB** thay vì trên instance. Khi đó không cần sticky session, và scale in/out hay instance refresh không làm user bị đăng xuất.
- Sticky session gây vấn đề khi **scale in** hoặc instance bị thay thế: user đang dính instance đó sẽ mất session.
- Với **weighted target groups** (blue/green), ALB có thêm **target group stickiness** (cookie `AWSALBTG`) để giữ user ở cùng một target group trong lúc chuyển dần traffic.
- Cookie `AWSALBCORS` là bản sao của `AWSALB` có `SameSite=None; Secure` để hoạt động với request CORS.
- NLB: stickiness dựa trên **source IP**; các client sau cùng một NAT sẽ dính vào cùng một target.

### Ghi nhớ cho kỳ thi

- Sticky sessions: **CLB, ALB, NLB**; ALB/CLB dùng **cookie**.
- Cookie do LB tạo: **`AWSALB`** (duration-based), **`AWSALBAPP`** (application cookie); CLB: `AWSELB`.
- Tên reserved, không dùng cho custom cookie: **`AWSALB`, `AWSALBAPP`, `AWSALBTG`**.
- Đề: "user bị mất session / phải đăng nhập lại liên tục" → bật **sticky sessions** (hoặc lưu session ra ElastiCache/DynamoDB).
- Đề: "một instance quá tải trong khi các instance khác rảnh" sau khi bật stickiness → nguyên nhân là **stickiness gây mất cân bằng**.

---

## Bài 7 – Cross-Zone Load Balancing

### Lý thuyết

- **Cross-zone load balancing**: mỗi node của load balancer phân tải **đều cho tất cả instance đã đăng ký ở mọi AZ**, không chỉ trong AZ của mình.
- Load balancer có **một node trong mỗi AZ**; client (qua DNS) gửi traffic **chia đều cho các node**, ví dụ 2 AZ thì mỗi node nhận 50%.

Ví dụ trong video: **AZ1 có 2 instance**, **AZ2 có 8 instance** (tổng 10).

| Chế độ | Mỗi LB node nhận | Mỗi instance ở AZ1 nhận | Mỗi instance ở AZ2 nhận |
|---|---|---|---|
| **Có** cross-zone | 50% | **10%** (100% chia đều cho 10 instance) | **10%** |
| **Không** cross-zone | 50% | **25%** (50% / 2) | **6,25%** (50% / 8) |

- Có cross-zone: traffic **chia đều cho mọi instance**, bất kể AZ.
- Không cross-zone: traffic **chỉ ở lại trong AZ** của node nhận; nếu số instance giữa các AZ chênh lệch thì instance ở AZ ít instance bị tải nặng hơn.
- Cả hai chế độ đều có use case; không chế độ nào "luôn đúng".

#### Mặc định và chi phí

| Load balancer | Mặc định | Chi phí data inter-AZ khi bật |
|---|---|---|
| **ALB** | **Bật** (có thể **tắt ở cấp target group**) | **Không tính phí** |
| **NLB** | **Tắt** | **Có tính phí** |
| **GWLB** | **Tắt** | **Có tính phí** |
| **CLB** | **Tắt** | **Không tính phí** |

### Kiến thức thực tế

- **Khi nào tắt cross-zone?** Khi muốn giảm phí data inter-AZ (NLB), hoặc cô lập lỗi theo AZ (*AZ independence*): một AZ hỏng không kéo theo traffic từ AZ khác. Khi đó cần **phân bố instance đều giữa các AZ** (ASG làm điều này tự động với *AZ rebalancing*).
- **Khi nào bật?** Số instance giữa các AZ không đều, hoặc client cache DNS và dồn vào một node (thường gặp với NLB).
- ALB hỗ trợ các thuật toán routing: **Round robin** (mặc định), **Least outstanding requests**, và **Weighted random** (kết hợp *Automatic Target Weights* để tránh target bất thường).
- NLB/ALB hỗ trợ **zonal shift** (Amazon Application Recovery Controller) để tạm rút traffic khỏi một AZ có vấn đề.

### Ghi nhớ cho kỳ thi

- ALB: cross-zone **bật mặc định, miễn phí** inter-AZ.
- NLB & GWLB: **tắt mặc định**, bật thì **trả phí** inter-AZ.
- CLB: tắt mặc định, bật thì miễn phí.
- Bài toán chia %: có cross-zone → **chia đều mọi instance**; không có → **chia đều theo AZ trước**, rồi chia cho instance trong AZ.

---

## Bài 8 – SSL/TLS Certificates và SNI

### Lý thuyết

#### SSL/TLS cơ bản

- **SSL certificate** cho phép traffic giữa client và load balancer được **mã hoá khi truyền (in-flight encryption)**.
- **SSL** = Secure Sockets Layer; **TLS** = Transport Layer Security, là phiên bản mới hơn. Ngày nay chủ yếu dùng **TLS**, nhưng người ta vẫn quen gọi là "SSL".
- Certificate public được cấp bởi **Certificate Authority (CA)**: Comodo, Symantec, GoDaddy, GlobalSign, DigiCert, Let's Encrypt…
- Certificate có **ngày hết hạn** và phải **gia hạn**.

#### SSL trên load balancer

```
User ──HTTPS (mã hoá, qua Internet)──► Load Balancer ──HTTP (trong VPC private)──► EC2
```

- Load balancer dùng certificate **X.509** (SSL/TLS server certificate).
- Quản lý certificate bằng **ACM (AWS Certificate Manager)**; có thể **tự upload** certificate của mình lên ACM.
- **HTTPS listener**:
  - Phải chỉ định **default certificate**.
  - Có thể thêm **danh sách certificate** để hỗ trợ **nhiều domain**.
  - **Client dùng SNI** để chỉ định hostname muốn truy cập.
  - Có thể chọn **security policy** để hỗ trợ client đời cũ (legacy SSL/TLS).

#### SNI – Server Name Indication

- Giải quyết bài toán **load nhiều SSL certificate lên một web server** (để phục vụ nhiều website).
- Là giao thức mới hơn, yêu cầu **client chỉ ra hostname** của server đích **trong lúc SSL handshake ban đầu**. Server tìm certificate đúng, hoặc trả về certificate mặc định.
- **Chỉ hoạt động với ALB, NLB (thế hệ mới) và CloudFront**. **Không** hoạt động với CLB.

Ví dụ: ALB có 2 target group `www.mycorp.com` và `domain1.example.com`, ALB gắn 2 certificate tương ứng. Client gửi hostname `www.mycorp.com` trong handshake → ALB dùng certificate của `www.mycorp.com` và route tới target group tương ứng.

#### Hỗ trợ theo loại load balancer

| Load balancer | Số certificate | Ghi chú |
|---|---|---|
| **CLB** (v1) | **Chỉ 1** | Nhiều hostname nhiều certificate → **nhiều CLB** |
| **ALB** (v2) | **Nhiều** listener, mỗi listener **nhiều certificate** | Dùng **SNI** |
| **NLB** (v2) | **Nhiều** listener, mỗi listener **nhiều certificate** | Dùng **SNI** |

### Kiến thức thực tế

- Certificate **public từ ACM là miễn phí** khi dùng với dịch vụ tích hợp (ELB, CloudFront…) và **tự động gia hạn** (khi validate bằng DNS). Certificate tự import thì **không** tự gia hạn: phải theo dõi qua EventBridge / metric `DaysToExpiry`.
- Certificate ACM **gắn theo region**: ALB ở `ap-southeast-1` cần certificate ở `ap-southeast-1`; riêng **CloudFront** bắt buộc certificate ở **`us-east-1`**.
- Mẫu chuẩn: listener **HTTP:80 redirect sang HTTPS:443**, listener 443 terminate TLS. Nếu yêu cầu **mã hoá end-to-end**, cho target group dùng **HTTPS** (ALB mã hoá lại tới EC2) hoặc dùng NLB **TCP passthrough**.
- Một listener có giới hạn số certificate (quota mặc định khoảng **25 certificate** ngoài default); dùng **wildcard** (`*.example.com`) hoặc SAN để tiết kiệm.
- Ứng dụng phía sau biết request gốc là HTTPS qua header **`X-Forwarded-Proto: https`**.

### Ghi nhớ cho kỳ thi

- **SNI** = nhiều certificate cho nhiều domain trên **một** load balancer → **ALB, NLB, CloudFront**; **CLB không hỗ trợ**.
- CLB: **1 certificate** → nhiều domain thì cần **nhiều CLB**.
- Quản lý certificate → **ACM**; HTTPS listener **phải có default certificate**.
- Muốn hỗ trợ client đời cũ → chọn **security policy** phù hợp trên listener.

---

## Bài 9 – Connection Draining / Deregistration Delay

### Lý thuyết

- Tên gọi khác nhau theo loại load balancer:
  - **CLB**: **Connection Draining**.
  - **ALB & NLB**: **Deregistration Delay** (cấu hình ở **target group**).
- Ý nghĩa: **thời gian cho phép các request đang xử lý (in-flight) hoàn tất** khi instance đang **bị deregister** hoặc **unhealthy**.
- Trong thời gian draining, ELB **ngừng gửi request mới** tới instance đó; request mới được chuyển sang các instance khác. Kết nối đang mở vẫn được giữ cho tới khi xong hoặc hết thời gian.
- Giá trị: **1 đến 3600 giây**, **mặc định 300 giây** (5 phút).
- Đặt **0** để **tắt** draining.
- Chọn giá trị **thấp** nếu request của bạn **ngắn** (ví dụ request < 1 giây → có thể đặt 30 giây). Giá trị cao làm việc deregister/thay thế instance chậm hơn.

```
                     ┌── (chỉ hoàn tất kết nối cũ) ──► EC2 A  [DRAINING]
User ──► ELB ────────┼── request mới ─────────────────► EC2 B
                     └── request mới ─────────────────► EC2 C
```

### Kiến thức thực tế

- ASG **chờ hết deregistration delay** trước khi terminate instance gắn với target group. Delay 300 giây làm **scale in** và **instance refresh** chậm hơn đáng kể → nên giảm khi ứng dụng có request ngắn.
- Với **WebSocket** hoặc upload/download dài, cần delay đủ lớn; ứng dụng cũng nên **xử lý tín hiệu SIGTERM** để đóng kết nối gọn gàng (graceful shutdown).
- Có thể kết hợp **lifecycle hook `Terminating:Wait`** của ASG để chạy logic dọn dẹp (flush log, hoàn tất job) trước khi instance bị terminate.
- NLB có thêm attribute `deregistration_delay.connection_termination.enabled` để **đóng hẳn kết nối** khi hết delay.
- ALB còn có **slow start** (`slow_start.duration_seconds`): ngược lại với draining, giúp instance **mới** nhận traffic tăng dần thay vì nhận ngay phần chia đầy đủ (hữu ích khi app cần warm-up cache/JIT).

### Ghi nhớ cho kỳ thi

- CLB = **Connection Draining**; ALB/NLB = **Deregistration Delay**.
- **1–3600 giây**, mặc định **300 giây**, **0 = tắt**.
- Request ngắn → đặt **giá trị thấp**; đề hỏi "instance terminate quá lâu khi scale in" → giảm deregistration delay.
- Đề hỏi "user bị lỗi khi instance bị gỡ khỏi LB" → bật/tăng **connection draining / deregistration delay**.

---

## Bài 10 – Auto Scaling Group (ASG)

### Lý thuyết

#### ASG là gì?

- Trong thực tế, **tải** của website/ứng dụng **thay đổi** theo thời gian. Trên cloud có thể tạo và xoá server rất nhanh.
- Mục tiêu của **Auto Scaling Group (ASG)**:
  - **Scale out** (thêm EC2) khi tải tăng.
  - **Scale in** (bớt EC2) khi tải giảm.
  - Đảm bảo luôn có số instance **tối thiểu và tối đa**.
  - **Tự đăng ký instance mới vào load balancer**.
  - **Tạo lại EC2** khi instance trước đó bị terminate (ví dụ vì unhealthy).
- **ASG miễn phí**: bạn chỉ trả tiền cho tài nguyên bên dưới (EC2, EBS…).

#### Kích thước ASG

```
|◄──────────────────── Maximum capacity ────────────────────►|
|◄──── Minimum capacity ────►|                                |
|◄──────── Desired capacity ────────►|                        |
[EC2][EC2]  [EC2][EC2]         [EC2]   ◄── scale out ──►
```

| Tham số | Ý nghĩa |
|---|---|
| **Minimum capacity** | Số instance tối thiểu luôn chạy |
| **Desired capacity** | Số instance ASG cố gắng duy trì hiện tại |
| **Maximum capacity** | Số instance tối đa khi scale out |

Ràng buộc: `min ≤ desired ≤ max`.

#### ASG với load balancer

- EC2 trong ASG được **tự động đăng ký** vào target group của ELB; ELB phân tải cho mọi instance.
- ASG có thể dùng **health check của ELB**: instance bị ELB đánh **unhealthy** sẽ bị ASG **terminate và thay mới**.

#### Launch Template

ASG cần **Launch Template** (Launch Configuration cũ đã **deprecated**) chứa thông tin để tạo EC2:

- **AMI + instance type**.
- **EC2 User Data**.
- **EBS volumes**.
- **Security groups**.
- **SSH key pair**.
- **IAM role** cho EC2 (instance profile).
- Thông tin **network + subnet**.
- Thông tin **load balancer** (cấu hình ở ASG).

Ngoài ra khi tạo ASG cần đặt **min/max/initial capacity** và **scaling policies**.

#### CloudWatch alarms và scaling

- Có thể scale ASG dựa trên **CloudWatch alarm**.
- Alarm theo dõi một **metric** (ví dụ **Average CPU**, hoặc metric tuỳ chỉnh).
- Metric như Average CPU được tính **trên toàn bộ instance của ASG** (trung bình).
- Dựa trên alarm:
  - Tạo **scale-out policy** (tăng số instance).
  - Tạo **scale-in policy** (giảm số instance).

### Kiến thức thực tế

- **Launch Configuration** đã ngừng: tài khoản mới **không tạo được** launch configuration (từ 2023), và AWS không bổ sung instance type mới cho nó. Luôn dùng **Launch Template** (có **versioning**, hỗ trợ Spot, mixed instances, nhiều network interface…).
- **Mixed instances policy**: kết hợp On-Demand + **Spot** và nhiều instance type để giảm chi phí; dùng chiến lược `price-capacity-optimized` cho Spot.
- **Health check grace period**: ASG bỏ qua health check trong khoảng thời gian này sau khi instance khởi động, tránh bị kill trước khi app sẵn sàng. Đặt vừa đủ thời gian chạy user data.
- **Lifecycle hooks** (`Launching:Wait`, `Terminating:Wait`): tạm dừng instance để cài đặt thêm hoặc dọn dẹp, kết hợp EventBridge/Lambda.
- **Warm pools**: giữ sẵn instance đã khởi tạo (stopped/hibernated) để scale out nhanh với app khởi động chậm.
- **AZ rebalancing**: ASG cố giữ số instance **đều giữa các AZ**; khi lệch sẽ launch ở AZ thiếu rồi terminate ở AZ thừa.
- **Instance scale-in protection** và **termination policies** (mặc định: chọn AZ nhiều instance nhất, rồi instance dùng launch template/configuration cũ nhất…).
- Gợi ý của AWS: bake sẵn AMI (EC2 Image Builder) để giảm thời gian khởi động thay vì cài mọi thứ trong user data.

### Ghi nhớ cho kỳ thi

- ASG: **scale out/in**, giữ **min/max**, **thay instance unhealthy**, **tự đăng ký vào ELB**. ASG **miễn phí**.
- `min ≤ desired ≤ max`.
- ASG dùng **Launch Template** (Launch Configuration đã deprecated).
- Muốn ASG thay instance mà **ELB** đánh unhealthy → bật **ELB health check** cho ASG (mặc định chỉ EC2 status check).
- Scale dựa trên **CloudWatch alarm** (metric trung bình trên toàn ASG).
- IAM role cho EC2 khai báo ở **Launch Template**.

---

## Bài 11 – Scaling Policies

### Lý thuyết

#### Dynamic Scaling

| Policy | Cách hoạt động | Ví dụ |
|---|---|---|
| **Target Tracking Scaling** | Đơn giản, dễ cấu hình nhất. Chọn **một metric và giá trị mục tiêu**, ASG tự tạo CloudWatch alarm và scale để giữ metric quanh mục tiêu | "Giữ **CPU trung bình của ASG** quanh **40%**" |
| **Simple / Step Scaling** | Tự tạo **CloudWatch alarm**; khi alarm kích hoạt thì thêm/bớt số unit. **Step**: số unit phụ thuộc mức độ vượt ngưỡng | CPU > 70% → **thêm 2 unit**; CPU < 30% → **bớt 1 unit** |

#### Scheduled Scaling

- Scale theo **lịch** khi **biết trước** mẫu sử dụng.
- Ví dụ: tăng **min capacity lên 10** lúc **5 giờ chiều thứ Sáu**.

#### Predictive Scaling

- **Dự báo tải liên tục** bằng machine learning dựa trên lịch sử, rồi **lên lịch scale trước**.
- Phù hợp với tải có **chu kỳ lặp lại** (theo ngày/tuần).

#### Metric tốt để scale

| Metric | Ý nghĩa |
|---|---|
| **CPUUtilization** | CPU trung bình trên các instance |
| **RequestCountPerTarget** | Số request trên mỗi EC2 instance; đảm bảo mỗi instance xử lý ổn định (ví dụ 1000 request/target) |
| **Average Network In / Out** | Hữu ích cho ứng dụng **bị giới hạn bởi network** (ví dụ upload/download lớn) |
| **Custom metric** | Bất kỳ metric nào bạn đẩy lên CloudWatch (ví dụ số message trong queue/instance) |

#### Scaling Cooldown

- Sau một hoạt động scaling, ASG vào **cooldown period** (mặc định **300 giây**).
- Trong cooldown, ASG **không launch hay terminate thêm instance** để **metric kịp ổn định**.
- Lời khuyên: dùng **AMI dựng sẵn (ready-to-use AMI)** để giảm thời gian cấu hình instance → instance phục vụ request nhanh hơn → có thể **giảm cooldown**.
- Bật **detailed monitoring** để có metric EC2 **mỗi 1 phút** (mặc định 5 phút).

### Kiến thức thực tế

- **Ưu tiên Target Tracking** cho hầu hết workload: ít cấu hình, tự scale in/out cân đối. Kết hợp **Predictive** cho tải có chu kỳ và **Scheduled** cho sự kiện biết trước (sale, giờ cao điểm).
- **Simple scaling** là kiểu cũ: phải chờ cooldown xong mới phản ứng tiếp. **Step scaling** phản ứng liên tục theo mức độ vượt ngưỡng, nên được ưu tiên hơn simple.
- Target tracking và step scaling dùng **instance warmup** (nên đặt *default instance warmup* ở cấp ASG) thay cho cooldown; cooldown chỉ áp dụng cho simple scaling và scale tay.
- **Scale theo SQS**: metric tốt là **backlog per instance** = `ApproximateNumberOfMessagesVisible` / số instance (đẩy làm custom metric hoặc dùng *metric math* trong target tracking).
- Scale in mặc định chậm và thận trọng hơn scale out; có thể tắt scale-in của target tracking (`DisableScaleIn`) nếu muốn chỉ scale out tự động.
- Lab tạo instance tốn tiền: nhớ đặt **Max** nhỏ khi thử stress test.

### Ghi nhớ cho kỳ thi

- **Target tracking**: "giữ CPU trung bình ở 40%" → đơn giản nhất.
- **Step/Simple**: dựa trên **CloudWatch alarm** tự tạo, thêm/bớt N unit.
- **Scheduled**: tải **biết trước theo lịch**. **Predictive**: tải **có chu kỳ**, ML dự báo.
- Metric gợi ý: **CPUUtilization**, **RequestCountPerTarget**, **Network In/Out**, custom.
- **Cooldown mặc định 300 giây**; dùng **AMI dựng sẵn** để giảm thời gian khởi động và cooldown.

---

## Bài 12 – Instance Refresh

### Lý thuyết

- Mục tiêu: **cập nhật launch template** rồi **tạo lại toàn bộ EC2 instance** trong ASG (ví dụ đổi sang AMI mới đã vá lỗi bảo mật).
- Thay vì tự terminate từng instance bằng tay, dùng tính năng gốc **Instance Refresh**: API **`StartInstanceRefresh`**.
- Tham số chính:
  - **Minimum healthy percentage**: tỷ lệ instance tối thiểu phải healthy trong suốt quá trình (ví dụ 60%) → quyết định bao nhiêu instance được thay cùng lúc.
  - **Instance warm-up time**: thời gian chờ cho tới khi instance mới được coi là **sẵn sàng** trước khi thay đợt tiếp theo.

Ví dụ trong video: ASG có các instance chạy launch template cũ (AMI cũ). Cập nhật launch template sang AMI mới → `StartInstanceRefresh` với min healthy 60% → ASG terminate khoảng 40% instance cũ, launch instance mới bằng template mới, chờ warm-up, rồi tiếp tục cho tới khi **mọi instance dùng template mới**.

```
Trước:  [old][old][old][old][old]
Đợt 1:  [new][new][old][old][old]   (≥ 60% healthy)
Đợt 2:  [new][new][new][new][old]
Xong:   [new][new][new][new][new]
```

### Kiến thức thực tế

- **MinHealthyPercentage = 100** + **MaxHealthyPercentage > 100** (ví dụ 110–200) = kiểu **launch before terminate**: không bao giờ giảm capacity, phù hợp production; tốn thêm instance tạm thời.
- Instance refresh tôn trọng **deregistration delay** của target group và **lifecycle hooks**, nên delay cao sẽ làm refresh lâu.
- Kết hợp **CloudWatch alarm** trong `AlarmSpecification` để **tự rollback** khi tỷ lệ lỗi 5xx tăng trong lúc refresh.
- Cập nhật AMI định kỳ: **EC2 Image Builder** tạo AMI mới → cập nhật launch template → trigger instance refresh (có thể tự động bằng EventBridge + Lambda).
- Với **CloudFormation**, thuộc tính `UpdatePolicy: AutoScalingRollingUpdate` (hoặc `AutoScalingReplacingUpdate`) cho tác dụng tương tự khi thay launch template. Với Elastic Beanstalk sẽ học các deployment policy riêng (rolling, immutable…).
- Instance refresh **không** dùng cho thay đổi desired capacity hay scaling policy; chỉ để **thay instance** theo cấu hình mới.

### Ghi nhớ cho kỳ thi

- Cập nhật AMI/launch template và thay **toàn bộ** instance của ASG → **Instance Refresh** (`StartInstanceRefresh`).
- Tham số: **Minimum healthy percentage** và **instance warm-up time**.
- Không cần tự terminate từng instance hay tạo ASG mới.

---

## Tổng kết chương

| Chủ đề | Điều cần nhớ |
|---|---|
| Scalability & HA | Vertical = scale up/down (instance lớn hơn); horizontal = scale out/in (thêm instance); HA = multi-AZ |
| ELB | Managed LB, 1 DNS name, health check (200 OK), SSL termination; EC2 chỉ nhận traffic từ SG của LB |
| ALB | Tầng 7, HTTP/HTTPS/WebSocket; routing path/host/query/header; target EC2/ECS/Lambda/private IP; IP client ở `X-Forwarded-For`; không IP tĩnh |
| NLB | Tầng 4, TCP/UDP/TLS; hiệu năng cực cao; 1 IP tĩnh/AZ, Elastic IP; target EC2/private IP/ALB |
| GWLB | Tầng 3, third-party appliance (firewall, IDS/IPS); GENEVE port 6081 |
| Sticky Sessions | CLB/ALB/NLB; cookie `AWSALB`, `AWSALBAPP`; có thể gây mất cân bằng |
| Cross-Zone | ALB bật mặc định, miễn phí; NLB/GWLB tắt mặc định, bật thì trả phí; CLB tắt, miễn phí |
| SSL/TLS & SNI | ACM; SNI cho nhiều certificate → ALB/NLB/CloudFront; CLB chỉ 1 certificate |
| Deregistration Delay | CLB: Connection Draining; 1–3600 s, mặc định 300 s, 0 = tắt |
| ASG | Min/desired/max; Launch Template; thay instance unhealthy; ELB health check; miễn phí |
| Scaling Policies | Target tracking, step/simple, scheduled, predictive; cooldown 300 s; metric CPU, RequestCountPerTarget, Network |
| Instance Refresh | `StartInstanceRefresh`, min healthy %, warm-up time |

---

## Câu hỏi ôn tập

*Nguồn: Quiz – High Availability & Scalability Quiz, bổ sung thêm câu hỏi theo phong cách DVA-C02. Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Mở rộng một EC2 instance từ `r4.large` lên `r4.4xlarge` được gọi là gì?

- A. Horizontal Scalability
- B. Vertical Scalability

<details><summary>Đáp án</summary>

**B.** Tăng kích thước instance là **vertical scaling** (scale up). Horizontal scaling là tăng **số lượng** instance.
</details>

**Câu 2.** Chạy một ứng dụng trên Auto Scaling Group có thể scale out và scale in được gọi là gì?

- A. Horizontal Scalability
- B. Vertical Scalability

<details><summary>Đáp án</summary>

**A.** ASG thêm/bớt **số lượng** instance → **horizontal scaling** (scale out/in).
</details>

**Câu 3.** Elastic Load Balancer cung cấp một ________ cố định mà bạn có thể dùng để kết nối tới website.

- A. Hostname
- B. IPv4
- C. IPv6

<details><summary>Đáp án</summary>

**A.** ELB cung cấp **DNS name (hostname) cố định**. IP của ALB có thể thay đổi theo thời gian; chỉ NLB mới có IP tĩnh mỗi AZ.
</details>

**Câu 4.** Bạn đang chạy một website trên 10 EC2 instance phía sau một ALB. Người dùng phàn nàn rằng họ liên tục phải đăng nhập lại. Bạn nên làm gì để giải quyết?

- A. Dùng NLB thay vì ALB
- B. Bật Stickiness
- C. Bật Cross-Zone Load Balancing
- D. Bật Deregistration Delay

<details><summary>Đáp án</summary>

**B.** Session đang được lưu trên từng instance; mỗi request đi tới instance khác nên mất session. **Sticky sessions** giữ client ở cùng một instance. Giải pháp lâu dài tốt hơn là lưu session ra ElastiCache/DynamoDB.
</details>

**Câu 5.** Ứng dụng của bạn chạy trên EC2 phía sau ALB. Ứng dụng cần lấy **IP của client** để ghi log. Bạn lấy IP này từ đâu?

- A. Từ header `X-Forwarded-For` của request
- B. Từ header `X-Forwarded-Proto`
- C. Từ source IP của kết nối TCP tới EC2
- D. ALB không cung cấp IP client

<details><summary>Đáp án</summary>

**A.** ALB terminate kết nối và mở kết nối mới bằng private IP của ALB, nên source IP mà EC2 thấy là IP của ALB. IP thật của client nằm trong **`X-Forwarded-For`**. `X-Forwarded-Proto` chỉ cho biết protocol.
</details>

**Câu 6.** Bạn cần một load balancer xử lý **hàng triệu request mỗi giây**, độ trễ cực thấp, với traffic **UDP** cho một game server. Loại nào phù hợp?

- A. Application Load Balancer
- B. Network Load Balancer
- C. Gateway Load Balancer
- D. Classic Load Balancer

<details><summary>Đáp án</summary>

**B.** **NLB** hoạt động ở tầng 4, hỗ trợ **TCP/UDP**, hiệu năng cực cao và độ trễ thấp. ALB chỉ HTTP/HTTPS; GWLB dành cho appliance mạng; CLB không hỗ trợ UDP.
</details>

**Câu 7.** Khách hàng doanh nghiệp yêu cầu **whitelist một tập IP cố định** để truy cập ứng dụng của bạn. Ứng dụng cần routing HTTP theo path. Kiến trúc nào phù hợp nhất?

- A. ALB gắn Elastic IP
- B. NLB với Elastic IP mỗi AZ, đặt **ALB làm target** của NLB
- C. CLB với IP tĩnh
- D. Route 53 trỏ trực tiếp tới các EC2

<details><summary>Đáp án</summary>

**B.** ALB **không** có IP tĩnh và không gắn được Elastic IP. **NLB** có IP tĩnh/Elastic IP mỗi AZ và có thể forward tới **ALB** để giữ khả năng routing tầng 7.
</details>

**Câu 8.** Bạn cần triển khai một fleet **firewall của bên thứ ba** để kiểm tra mọi IP packet đi vào VPC một cách trong suốt. Dịch vụ nào phù hợp và nó dùng giao thức gì?

- A. NLB, giao thức TCP port 443
- B. ALB, giao thức HTTP port 80
- C. GWLB, giao thức GENEVE port 6081
- D. GWLB, giao thức VXLAN port 4789

<details><summary>Đáp án</summary>

**C.** **Gateway Load Balancer** hoạt động ở tầng 3, phân tải tới virtual appliance (firewall, IDS/IPS, deep packet inspection) và dùng **GENEVE trên port 6081**.
</details>

**Câu 9.** Bạn có ALB với listener HTTPS cần phục vụ 3 website với 3 domain khác nhau, mỗi website một SSL certificate. Tính năng nào cho phép làm điều này?

- A. Sticky Sessions
- B. Server Name Indication (SNI)
- C. Cross-Zone Load Balancing
- D. Phải tạo 3 load balancer riêng

<details><summary>Đáp án</summary>

**B.** **SNI** cho phép client gửi hostname trong lúc TLS handshake để load balancer chọn đúng certificate. Hỗ trợ trên **ALB, NLB và CloudFront**. Chỉ với **CLB** mới cần nhiều load balancer (CLB chỉ có 1 certificate).
</details>

**Câu 10.** Load balancer nào **không** hỗ trợ SNI?

- A. Application Load Balancer
- B. Network Load Balancer
- C. Classic Load Balancer
- D. Cả ba đều hỗ trợ

<details><summary>Đáp án</summary>

**C.** CLB chỉ hỗ trợ **một** SSL certificate; SNI chỉ có ở ALB, NLB (thế hệ mới) và CloudFront.
</details>

**Câu 11.** Bạn có một NLB trải trên 2 AZ: AZ-a có 2 instance, AZ-b có 8 instance. Cross-Zone Load Balancing đang **tắt**. Mỗi instance ở AZ-a nhận khoảng bao nhiêu phần trăm traffic?

- A. 10%
- B. 25%
- C. 6,25%
- D. 50%

<details><summary>Đáp án</summary>

**B.** Không có cross-zone, mỗi node của NLB nhận 50% traffic và chỉ chia cho instance trong AZ của mình: 50% / 2 = **25%** cho mỗi instance ở AZ-a (instance ở AZ-b nhận 50% / 8 = 6,25%). Nếu bật cross-zone thì mỗi instance nhận 10%.
</details>

**Câu 12.** Phát biểu nào **đúng** về Cross-Zone Load Balancing?

- A. Trên ALB, cross-zone tắt mặc định và tính phí data inter-AZ
- B. Trên NLB, cross-zone bật mặc định và miễn phí
- C. Trên ALB, cross-zone bật mặc định và không tính phí data inter-AZ; trên NLB tắt mặc định và tính phí nếu bật
- D. Cross-zone không áp dụng cho GWLB

<details><summary>Đáp án</summary>

**C.** ALB: **bật mặc định, miễn phí** (có thể tắt ở cấp target group). NLB và GWLB: **tắt mặc định**, bật thì **trả phí** data inter-AZ.
</details>

**Câu 13.** Ứng dụng của bạn xử lý request rất ngắn (dưới 1 giây). Khi ASG scale in, bạn thấy instance mất **5 phút** mới bị terminate. Bạn nên chỉnh gì?

- A. Giảm Deregistration Delay của target group
- B. Tăng health check grace period
- C. Tắt Cross-Zone Load Balancing
- D. Tăng scaling cooldown

<details><summary>Đáp án</summary>

**A.** **Deregistration delay** mặc định **300 giây**: ELB chờ request in-flight hoàn tất trước khi gỡ instance. Với request ngắn, đặt giá trị thấp (ví dụ 30 giây) để instance được gỡ nhanh. Giá trị hợp lệ 1–3600 giây, 0 = tắt.
</details>

**Câu 14.** Một ALB gắn với Auto Scaling Group. ALB phát hiện một instance **unhealthy**, nhưng ASG không thay thế instance đó. Nguyên nhân có thể là gì?

- A. ASG chưa bật **ELB health check**, chỉ dùng EC2 status check
- B. Cross-Zone Load Balancing đang tắt
- C. Sticky sessions đang bật
- D. Launch template không có IAM role

<details><summary>Đáp án</summary>

**A.** Mặc định ASG chỉ dùng **EC2 health check** (status check của instance). Instance vẫn "running" nhưng ứng dụng lỗi sẽ không bị thay. Bật **health check type = ELB** để ASG terminate và thay instance mà ELB đánh unhealthy.
</details>

**Câu 15.** Bạn muốn ASG giữ **CPU trung bình** của toàn nhóm quanh mức **40%**. Scaling policy nào đơn giản nhất?

- A. Simple Scaling
- B. Step Scaling
- C. Target Tracking Scaling
- D. Scheduled Scaling

<details><summary>Đáp án</summary>

**C.** **Target tracking** chỉ cần chọn metric và giá trị mục tiêu; ASG tự tạo CloudWatch alarm và scale để giữ metric quanh mục tiêu.
</details>

**Câu 16.** Website thương mại điện tử của bạn luôn có lượng truy cập tăng vọt vào **17h mỗi thứ Sáu** do chương trình khuyến mãi định kỳ. Bạn muốn có sẵn instance **trước** khi tải tăng. Nên dùng gì?

- A. Target Tracking Scaling
- B. Scheduled Scaling
- C. Simple Scaling với CPU alarm
- D. Tăng scaling cooldown

<details><summary>Đáp án</summary>

**B.** Tải **biết trước theo lịch** → **Scheduled scaling** (ví dụ nâng min capacity lên 10 lúc 17h thứ Sáu). Target tracking/simple chỉ phản ứng **sau khi** metric đã tăng. Nếu mẫu tải lặp lại nhưng không rõ giờ chính xác, có thể cân nhắc **Predictive scaling**.
</details>

**Câu 17.** Metric nào phù hợp để scale ASG sao cho **mỗi EC2 instance xử lý ổn định khoảng 1000 request** từ ALB?

- A. CPUUtilization
- B. RequestCountPerTarget
- C. Average Network In
- D. HealthyHostCount

<details><summary>Đáp án</summary>

**B.** **RequestCountPerTarget** (`ALBRequestCountPerTarget` trong target tracking) đo số request trên mỗi target, đúng với yêu cầu số request/instance ổn định.
</details>

**Câu 18.** Sau một hoạt động scaling, ASG không launch hay terminate thêm instance trong vài phút dù alarm vẫn đang kích hoạt. Đây là do tính năng nào và giá trị mặc định là bao nhiêu?

- A. Health check grace period, 60 giây
- B. Scaling cooldown, 300 giây
- C. Deregistration delay, 300 giây
- D. Instance warm-up, 0 giây

<details><summary>Đáp án</summary>

**B.** **Cooldown** (mặc định **300 giây**) cho metric thời gian ổn định trước khi scaling tiếp. Dùng AMI dựng sẵn giúp instance phục vụ nhanh hơn và cho phép giảm cooldown.
</details>

**Câu 19.** Bạn đã cập nhật launch template của ASG với một AMI mới vá lỗi bảo mật. Cách được khuyến nghị để thay **toàn bộ** instance hiện có bằng instance dùng AMI mới mà vẫn giữ ứng dụng sẵn sàng là gì?

- A. Terminate thủ công từng instance
- B. Tạo một ASG mới rồi xoá ASG cũ
- C. Dùng **Instance Refresh** (`StartInstanceRefresh`) với minimum healthy percentage phù hợp
- D. Đặt desired capacity về 0 rồi tăng lại

<details><summary>Đáp án</summary>

**C.** **Instance Refresh** thay instance theo từng đợt dựa trên **minimum healthy percentage** và **instance warm-up time**, giữ ứng dụng luôn sẵn sàng. Đặt desired = 0 gây downtime; làm thủ công thì tốn công và dễ lỗi.
</details>

**Câu 20.** Bạn muốn EC2 instance phía sau ALB **chỉ nhận traffic HTTP từ ALB**, không nhận trực tiếp từ Internet. Cấu hình security group của EC2 thế nào?

- A. Inbound HTTP 80 từ `0.0.0.0/0`
- B. Inbound HTTP 80 với source là **security group của ALB**
- C. Inbound HTTP 80 từ public IP của ALB
- D. Outbound HTTP 80 tới security group của ALB

<details><summary>Đáp án</summary>

**B.** Tham chiếu **security group của ALB** làm source. ALB không có IP cố định nên không dùng IP được; `0.0.0.0/0` cho phép truy cập trực tiếp từ Internet.
</details>

---

[← Chương 06](ch06-ec2-instance-storage.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chương 08 →](ch08-aws-fundamentals-rds-aurora-elasticach.md)

