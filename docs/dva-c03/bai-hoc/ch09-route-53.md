# Chương 09 – Route 53

> **Nguồn:** 19 video của chương + *Route 53 Quiz*.
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay (2026).

## Mục tiêu chương

Sau chương này bạn có thể:

- Giải thích cách hệ thống **DNS** phân giải một tên miền thành địa chỉ IP và các thuật ngữ cơ bản (TLD, SLD, FQDN, zone file, name server…).
- Hiểu **Amazon Route 53**: DNS có thẩm quyền (authoritative), domain registrar, **public/private hosted zone**, các loại record quan trọng (**A, AAAA, CNAME, NS**).
- Đăng ký domain, tạo record và kiểm tra bằng **`dig` / `nslookup`**.
- Hiểu ảnh hưởng của **TTL** tới cache và việc thay đổi record.
- Phân biệt **CNAME và Alias**, biết khi nào bắt buộc dùng Alias (zone apex).
- Nắm toàn bộ **routing policy**: Simple, Weighted, Latency, Failover, Geolocation, Geoproximity, IP-based, Multi-Value.
- Cấu hình **Health Check** (endpoint, calculated, CloudWatch Alarm) và dùng nó cho DNS failover.
- Dùng Route 53 làm DNS cho domain mua ở **registrar bên thứ ba**.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001 | What is a DNS | Bài 1 – DNS là gì |
| 002 | Route 53 Overview | Bài 2 – Tổng quan Route 53, record và hosted zone |
| 003 | Route 53 - Registering a domain | Bài 3 – Đăng ký domain |
| 004 | Route 53 - Creating our first records | Bài 4 – Tạo record đầu tiên, `dig` và `nslookup` |
| 005 | Route 53 - EC2 Setup | Bài 5 – Chuẩn bị hạ tầng EC2 + ALB cho các bài lab |
| 006 | Route 53 - TTL | Bài 6 – TTL (Time To Live) |
| 007 | Route 53 CNAME vs Alias | Bài 7 – CNAME và Alias |
| 008 | Routing Policy - Simple | Bài 8 – Routing policy và Simple routing |
| 009 | Routing Policy - Weighted | Bài 9 – Weighted routing |
| 010 | Routing Policy - Latency | Bài 10 – Latency-based routing |
| 011–012 | Route 53 Health Checks | Bài 11 – Health Checks |
| 013 | Routing Policy - Failover | Bài 12 – Failover routing |
| 014 | Routing Policy - Geolocation | Bài 13 – Geolocation routing |
| 015 | Routing Policy - Geoproximity | Bài 14 – Geoproximity routing |
| 016 | Routing Policy - IP-based | Bài 15 – IP-based routing |
| 017 | Routing Policy - Multi Value | Bài 16 – Multi-Value Answer routing |
| 018 | 3rd Party Domains & Route 53 | Bài 17 – Domain mua ở bên thứ ba và Route 53 |
| 019 | Route 53 - Section Cleanup | Bài 18 – Dọn dẹp tài nguyên |
| Quiz | Route 53 Quiz | Câu hỏi ôn tập |

---

## Bài 1 – DNS là gì

### Lý thuyết

- **DNS (Domain Name System)** dịch **tên máy (hostname) thân thiện với con người** thành **địa chỉ IP** của server đích. Ví dụ gõ `www.google.com` thì trình duyệt nhận về một IP rồi mới kết nối tới đó.
- DNS là "xương sống" của Internet và có **cấu trúc phân cấp**: `.com` → `example.com` → `www.example.com`, `api.example.com`…

#### Thuật ngữ

| Thuật ngữ | Ý nghĩa | Ví dụ |
|---|---|---|
| **Domain Registrar** | Nơi đăng ký (mua) tên miền | Amazon Route 53, GoDaddy… |
| **DNS Records** | Bản ghi DNS, có nhiều loại | A, AAAA, CNAME, NS… |
| **Zone File** | Tập hợp tất cả DNS record của một domain | — |
| **Name Server** | Server thực sự trả lời (resolve) truy vấn DNS | — |
| **TLD** (Top Level Domain) | Tên miền cấp cao nhất | `.com`, `.us`, `.in`, `.gov`, `.org` |
| **SLD** (Second Level Domain) | Tên miền cấp hai | `amazon.com`, `google.com` |

Phân tích URL `http://api.www.example.com.`:

| Thành phần | Tên gọi |
|---|---|
| `.` (dấu chấm cuối cùng) | **Root** – gốc của mọi tên miền |
| `.com` | **TLD** |
| `example.com` | **SLD** |
| `www.example.com` | **Sub domain** |
| `api.www.example.com` | **FQDN** (Fully Qualified Domain Name) |
| `http` | **Protocol** |
| Toàn bộ chuỗi | **URL** |

#### Quá trình phân giải DNS

Giả sử web server có public IP `9.10.11.12` và ta muốn truy cập bằng `example.com`:

1. Trình duyệt hỏi **Local DNS Server** (do công ty quản lý hoặc ISP cấp động): "`example.com` là gì?".
2. Local DNS chưa từng thấy truy vấn này nên hỏi **Root DNS Server** (do **ICANN** quản lý). Root trả lời: "Tôi không biết `example.com`, nhưng tôi biết `.com`: là record **NS**, hãy hỏi `1.2.3.4`".
3. Local DNS hỏi **TLD DNS Server** `.com` (do **IANA** quản lý). TLD trả lời: "Tôi biết `example.com` có name server ở `5.6.7.8`".
4. Local DNS hỏi **SLD DNS Server** (do domain registrar/DNS provider quản lý, ví dụ Route 53). Server này trả lời: "`example.com` là **record A**, giá trị `9.10.11.12`".
5. Local DNS **cache** kết quả (để lần sau trả lời ngay) và trả về trình duyệt. Trình duyệt kết nối tới `9.10.11.12`.

```
Browser ──> Local DNS ──> Root (ICANN)        : ".com NS 1.2.3.4"
                     ──> TLD .com (IANA)      : "example.com NS 5.6.7.8"
                     ──> SLD (Route 53)       : "example.com A 9.10.11.12"
Browser <── Local DNS (cache) ── trả về 9.10.11.12
```

### Kiến thức thực tế

- Bạn có thể tự quan sát toàn bộ chuỗi phân giải bằng:

  ```bash
  dig +trace example.com
  ```

- Ngoài local DNS, chính hệ điều hành và trình duyệt cũng **cache** kết quả DNS. Khi thử nghiệm thay đổi record mà "không thấy tác dụng", hãy nghĩ tới cache (xem Bài 6).
  - Windows: `ipconfig /flushdns`; macOS: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`.

### Ghi nhớ cho kỳ thi

- DNS dịch **hostname → IP**. Nắm được các thuật ngữ **TLD, SLD, FQDN, NS, zone file**.
- Đây là kiến thức nền, đề DVA ít hỏi trực tiếp.

---

## Bài 2 – Tổng quan Route 53, record và hosted zone

### Lý thuyết

- **Amazon Route 53** là dịch vụ DNS **có tính sẵn sàng cao, mở rộng tốt, được quản lý hoàn toàn** và **authoritative** (có thẩm quyền): **khách hàng tự cập nhật được DNS record**, có toàn quyền kiểm soát DNS.
- Route 53 đồng thời là **Domain Registrar** (mua domain được).
- Có khả năng **kiểm tra sức khoẻ (health check)** tài nguyên.
- Là **dịch vụ AWS duy nhất có SLA 100% availability**.
- Tên "53" đến từ **cổng 53** – cổng truyền thống của dịch vụ DNS.

Ví dụ: client muốn truy cập `example.com` → Route 53 (trong hosted zone có record A) trả lời `54.22.33.44` → client kết nối thẳng tới EC2.

#### Cấu trúc một record

| Thành phần | Ý nghĩa | Ví dụ |
|---|---|---|
| Domain/subdomain name | Tên | `example.com` |
| Record type | Loại record | `A`, `AAAA` |
| Value | Giá trị | `12.34.56.78` |
| Routing policy | Cách Route 53 trả lời truy vấn | Simple, Weighted… |
| TTL | Thời gian record được cache ở DNS resolver | `300` |

Route 53 hỗ trợ các loại record:

- **Phải biết:** `A`, `AAAA`, `CNAME`, `NS`.
- **Nâng cao (không cần cho kỳ thi):** `CAA`, `DS`, `MX`, `NAPTR`, `PTR`, `SOA`, `TXT`, `SPF`, `SRV`.

#### Các loại record quan trọng

| Record | Ánh xạ | Ví dụ / lưu ý |
|---|---|---|
| **A** | hostname → **IPv4** | `example.com → 1.2.3.4` |
| **AAAA** | hostname → **IPv6** | `example.com → 2001:db8::1` |
| **CNAME** | hostname → **hostname khác** (đích có thể là A hoặc AAAA) | **Không** tạo được CNAME cho **Zone Apex** (`example.com`), nhưng được cho `www.example.com` |
| **NS** | Name Server của hosted zone | Tên DNS hoặc IP của các server trả lời truy vấn cho hosted zone; quyết định traffic tới domain được định tuyến thế nào |

#### Hosted Zone

- **Hosted zone** là **container chứa các record**, định nghĩa cách định tuyến traffic tới một domain và các subdomain của nó.

| | Public Hosted Zone | Private Hosted Zone |
|---|---|---|
| Dành cho | Domain public (vd `mypublicdomain.com`) | Domain nội bộ (vd `application1.company.internal`) |
| Ai truy vấn được | **Bất kỳ ai trên Internet** | **Chỉ từ bên trong VPC** đã liên kết |
| Ví dụ | Trình duyệt hỏi `example.com` → trả IP public | EC2 hỏi `api.example.internal` → trả IP private `10.0.0.10` |

Ví dụ private hosted zone: `webapp.example.internal` (EC2 thứ nhất), `api.example.internal` (EC2 thứ hai), `database.example.internal` (database). Các thành phần tìm nhau qua tên miền nội bộ, Route 53 trả về IP private.

#### Chi phí (theo video)

- **0,50 USD/tháng cho mỗi hosted zone** – Route 53 **không miễn phí**.
- Đăng ký domain: tối thiểu **khoảng 12 USD/năm**.

### Kiến thức thực tế

- Giá hosted zone hiện vẫn là **0,50 USD/tháng** cho 25 hosted zone đầu tiên; truy vấn chuẩn tính **0,40 USD/1 triệu truy vấn** (1 tỷ truy vấn đầu tiên/tháng). Hosted zone xoá trong vòng 12 giờ sau khi tạo thì không bị tính phí tháng.
- **Giá domain thay đổi theo TLD và theo thời gian** (`.com` hiện cao hơn mức 12 USD của video). Hãy xem bảng giá Route 53 Domains trước khi mua.
- **Private hosted zone** chỉ hoạt động khi VPC bật hai thuộc tính `enableDnsSupport` và `enableDnsHostnames`. Một private hosted zone có thể gắn với nhiều VPC (kể cả VPC ở tài khoản khác, qua authorization).
- Nên dùng hậu tố **`.internal`** cho domain nội bộ; tránh dùng `.local` (xung đột với mDNS).
- Muốn on-premises phân giải được private hosted zone (và ngược lại) thì dùng **Route 53 Resolver inbound/outbound endpoints** (ngoài phạm vi DVA).

### Ghi nhớ cho kỳ thi

- Route 53: **authoritative DNS**, **registrar**, **health check**, **SLA 100%**.
- 4 record phải nhớ: **A (IPv4), AAAA (IPv6), CNAME (hostname → hostname, không dùng cho apex), NS**.
- **Public hosted zone** cho Internet; **private hosted zone** chỉ trong VPC.

---

## Bài 3 – Đăng ký domain

### Kiến thức thực tế

- Nếu chỉ để học, có thể **không mua domain**: tạo một **private hosted zone** gắn với VPC và thử record từ EC2 bên trong VPC (vẫn tốn 0,50 USD/tháng cho hosted zone).
- Nếu xoá hosted zone mặc định rồi tạo lại, hosted zone mới sẽ có **bộ NS khác**; khi đó phải cập nhật lại name server trong phần cấu hình domain (*Registered domains → Edit name servers*), nếu không domain sẽ không phân giải được.

### Ghi nhớ cho kỳ thi

- Đăng ký domain trên Route 53 sẽ **tự tạo public hosted zone** kèm **NS** và **SOA**.

---

## Bài 4 – Tạo record đầu tiên, `dig` và `nslookup`

### Kiến thức thực tế

- `Action` có 3 giá trị: `CREATE` (lỗi nếu đã có), `DELETE` (phải khớp chính xác record), **`UPSERT`** (tạo hoặc cập nhật – dùng phổ biến nhất trong script/CI).
- Hỏi thẳng name server của Route 53 để bỏ qua cache của resolver trung gian:

  ```bash
  dig test.example.com @ns-123.awsdns-45.com
  dig +short test.example.com          # chỉ in giá trị
  dig NS example.com +short            # xem name server của domain
  ```

- Trên Windows (PowerShell): `Resolve-DnsName test.example.com` hoặc `nslookup`.
- Có thể kiểm tra câu trả lời của Route 53 mà không cần dig bằng `aws route53 test-dns-answer --hosted-zone-id ... --record-name test.example.com --record-type A`.

### Ghi nhớ cho kỳ thi

- Kỳ thi không hỏi cú pháp `dig`, nhưng hiểu record A, TTL và cách kiểm tra giúp bạn trả lời các câu tình huống.

---

## Bài 5 – Chuẩn bị hạ tầng EC2 + ALB cho các bài lab

### Kiến thức thực tế

- **Public IPv4 bị tính phí từ 02/2024** (khoảng 0,005 USD/giờ/IP, kể cả IP gắn với instance đang chạy). 3 EC2 + ALB (ALB dùng một public IP mỗi AZ) chạy nhiều ngày sẽ phát sinh chi phí – nhớ dọn dẹp (Bài 18).
- ALB cũng tính phí theo giờ + LCU; không thuộc diện miễn phí lâu dài.
- Free Tier của AWS đã thay đổi từ **15/07/2025**: tài khoản mới nhận **credit** thay vì mô hình 750 giờ/tháng như trước. Kiểm tra loại Free Tier của tài khoản bạn.
- **Amazon Linux 2 đã hết hạn hỗ trợ (EOL 30/06/2026)**, nên dùng Amazon Linux 2023 cho mọi lab mới.

### Ghi nhớ cho kỳ thi

- Bài chuẩn bị, không có kiến thức thi riêng.

---

## Bài 6 – TTL (Time To Live)

### Lý thuyết

- **TTL** yêu cầu client: "Hãy **cache** kết quả này trong khoảng thời gian TTL". Trong thời gian đó, client **không hỏi lại DNS** mà dùng luôn kết quả đã cache.
- Mục đích: không truy vấn DNS quá thường xuyên vì record ít thay đổi.

| | TTL cao (vd 24 giờ) | TTL thấp (vd 60 giây) |
|---|---|---|
| Traffic lên Route 53 | **Ít** → rẻ hơn | **Nhiều** → tốn tiền hơn (tính phí theo số truy vấn) |
| Record lỗi thời | Client có thể dùng record **cũ lâu** (tới 24h sau khi đổi) | Record lỗi thời trong **thời gian ngắn** |
| Đổi record | Chậm | Nhanh, dễ dàng |

- **Chiến lược đổi record:** hạ TTL xuống thấp trước (vd chờ 24h để mọi client nhận TTL mới), sau đó đổi giá trị record (lan toả nhanh), rồi tăng TTL trở lại.
- TTL **bắt buộc** với mọi record, **trừ Alias record** (Bài 7).

### Kiến thức thực tế

- Giá trị TTL thường gặp: **300 giây** (mặc định console) cho record hay đổi; **3600–86400** cho record ổn định (MX, NS).
- Một số resolver/trình duyệt **không tôn trọng hoàn toàn TTL** (cache lâu hơn hoặc ngắn hơn), nên khi migration quan trọng hãy hạ TTL **trước** ít nhất bằng TTL cũ và giữ hệ thống cũ chạy thêm một thời gian.
- TTL của record **NS** (mặc định 172800 = 2 ngày) ảnh hưởng tới thời gian chuyển DNS provider.

### Ghi nhớ cho kỳ thi

- Đã đổi record nhưng người dùng **vẫn tới server cũ** → nguyên nhân là **TTL** (cache).
- TTL cao: ít truy vấn, rẻ, nhưng chậm cập nhật. TTL thấp: ngược lại.
- Alias record **không đặt TTL** được.

---

## Bài 7 – CNAME và Alias

### Lý thuyết

Tài nguyên AWS như **Load Balancer** hay **CloudFront** cung cấp một **hostname** (vd `lb1-1234.us-east-2.elb.amazonaws.com`). Ta muốn trỏ `myapp.mydomain.com` tới hostname đó. Có 2 lựa chọn:

| | **CNAME** | **Alias** |
|---|---|---|
| Trỏ tới | **Bất kỳ hostname nào** (`app.mydomain.com → blabla.anything.com`) | **Tài nguyên AWS** (`app.mydomain.com → blabla.amazonaws.com`) |
| Root domain (Zone Apex, `mydomain.com`) | **Không** | **Có** (cả root và non-root) |
| Chuẩn DNS? | Chuẩn DNS | **Mở rộng riêng của Route 53** |
| Loại record | CNAME | **A** hoặc **AAAA** |
| TTL | Tự đặt | **Không đặt được**, Route 53 tự đặt |
| Phí truy vấn | Có | **Miễn phí** |
| Health check | — | Có sẵn (**Evaluate target health**) |
| IP của đích thay đổi | — | **Tự động nhận biết** |

#### Đích (target) của Alias record

- Elastic Load Balancers
- CloudFront Distributions
- API Gateway
- Elastic Beanstalk environments
- **S3 Websites** (bucket bật static website hosting, **không phải** S3 bucket thường)
- VPC Interface Endpoints
- Global Accelerator accelerator
- Route 53 record **trong cùng hosted zone**

> **Không thể** tạo Alias tới **DNS name của EC2**.

### Kiến thức thực tế

- Với **CloudFront**, Hosted Zone ID của alias luôn là `Z2FDTNDATAQYW2`.
- Muốn hỗ trợ IPv6 cho ALB/CloudFront: tạo **thêm một Alias AAAA** cùng tên.
- **RDS endpoint** cũng không là đích Alias; dùng **CNAME** (vd `db.example.internal` → endpoint RDS trong private hosted zone).
- Alias `www.example.com → example.com` (record khác trong cùng zone) là cách phổ biến để gom 2 tên về một chỗ.
- Nếu dùng S3 website làm đích Alias, **tên bucket phải trùng tên domain** (vd bucket `example.com`).

### Ghi nhớ cho kỳ thi

- Trỏ **root domain (zone apex)** tới ELB/CloudFront → **Alias**, không phải CNAME.
- Alias: chỉ trỏ tới tài nguyên AWS, loại **A/AAAA**, **miễn phí**, **không đặt TTL**, có health check.
- **Không** Alias tới **EC2 DNS name**.

---

## Bài 8 – Routing policy và Simple routing

### Lý thuyết

- **Routing policy** quyết định **cách Route 53 trả lời truy vấn DNS**.
- Đừng nhầm "routing" ở đây với routing của load balancer: **traffic không đi qua DNS**. DNS chỉ trả lời câu hỏi, client tự kết nối tới endpoint nhận được.
- Route 53 hỗ trợ: **Simple, Weighted, Failover, Latency based, Geolocation, Multi-Value Answer, Geoproximity** (và **IP-based**, Bài 15).

#### Simple routing

- Thường định tuyến tới **một tài nguyên**.
- Có thể khai báo **nhiều giá trị trong cùng một record**; khi đó Route 53 trả về **tất cả**, và **client chọn ngẫu nhiên** một giá trị.
- Nếu dùng **Alias** với Simple thì chỉ được **một** đích AWS.
- **Không** gắn được health check.

### Kiến thức thực tế

- Simple với nhiều IP **không có health check**: nếu một server chết, client vẫn có thể nhận IP đó. Cần health check → dùng **Multi-Value Answer** (Bài 16).
- Trong cùng hosted zone, mỗi cặp (tên, loại) chỉ có **một** record Simple; các policy khác cho phép nhiều record cùng tên phân biệt bằng **Set ID** (`SetIdentifier`).

### Ghi nhớ cho kỳ thi

- DNS **không định tuyến traffic**, chỉ trả lời truy vấn.
- Simple: nhiều giá trị → **client chọn ngẫu nhiên**; **không health check**.

---

## Bài 9 – Weighted routing

### Lý thuyết

- Điều khiển **tỷ lệ phần trăm request** tới từng tài nguyên bằng **trọng số (weight)**.
- Tỷ lệ traffic tới một record = `weight của record / tổng weight của tất cả record`. Trọng số **không cần cộng lại bằng 100**.
- Ví dụ weight 70 – 20 – 10 → 70% / 20% / 10% câu trả lời DNS.
- Các record phải **cùng tên và cùng loại**; **gắn được health check**.
- Use case: **cân bằng tải giữa các region**, **thử phiên bản mới** với một lượng nhỏ traffic (canary).
- **Weight = 0** cho một record → **ngừng gửi traffic** tới tài nguyên đó (dịch chuyển traffic dần).
- **Tất cả record đều weight = 0** → trả về tất cả **với trọng số bằng nhau**.

### Kiến thức thực tế

- Tỷ lệ là **theo câu trả lời DNS**, không phải theo request HTTP: resolver lớn cache kết quả và phục vụ nhiều người dùng, nên phân bố thực tế có thể lệch so với trọng số.
- Blue/green deployment với Elastic Beanstalk hoặc 2 ALB: bắt đầu 95/5, tăng dần, cuối cùng 0/100. Muốn chia traffic chính xác theo request trong cùng một ALB thì dùng **weighted target groups của ALB** thay vì DNS.

### Ghi nhớ cho kỳ thi

- "Chuyển **x% traffic** sang phiên bản/môi trường mới" → **Weighted**.
- Weight 0 → ngừng gửi; tất cả 0 → chia đều.

---

## Bài 10 – Latency-based routing

### Lý thuyết

- Chuyển hướng tới tài nguyên có **độ trễ thấp nhất** đối với người dùng – hữu ích khi **latency là ưu tiên hàng đầu**.
- Latency được đo dựa trên **tốc độ kết nối giữa người dùng và AWS Region** gắn với record. Ví dụ người dùng ở Đức có thể được chuyển sang Mỹ nếu đó là nơi có latency thấp nhất với họ.
- **Gắn được health check**.
- Ví dụ: app chạy ở `us-east-1` và `ap-southeast-1`; người dùng toàn cầu sẽ được chuyển tới region có latency thấp nhất với mình.

### Kiến thức thực tế

- Route 53 định tuyến theo **vị trí của DNS resolver** của người dùng (hoặc thông tin **EDNS Client Subnet** nếu resolver hỗ trợ), không phải vị trí chính xác của thiết bị. Người dùng dùng resolver công cộng ở xa có thể bị định tuyến không tối ưu.
- Dữ liệu latency được AWS cập nhật theo thời gian, nên cùng một vị trí có thể nhận region khác nhau ở các thời điểm khác nhau.
- Kết hợp **Latency + health check** là mẫu kiến trúc active-active multi-region phổ biến.

### Ghi nhớ cho kỳ thi

- "Giảm thời gian phản hồi / trải nghiệm tốt nhất cho người dùng toàn cầu" → **Latency**.
- Latency ≠ Geolocation: latency dựa trên **độ trễ mạng**, geolocation dựa trên **vị trí địa lý**.

---

## Bài 11 – Health Checks

### Lý thuyết

- Health check dùng chủ yếu để kiểm tra **tài nguyên public** (có cách cho tài nguyên private, xem bên dưới).
- Ví dụ: 2 ALB public ở 2 region (multi-region để HA). Route 53 trả về ALB gần nhất (latency). Nếu một region chết, không được gửi người dùng tới đó → tạo health check cho mỗi region và gắn vào record → **DNS failover tự động**.
- Health check có **metric riêng**, xem được trong **CloudWatch**.

#### 3 loại health check

| Loại | Giám sát |
|---|---|
| **Endpoint** | Endpoint public: ứng dụng, server, tài nguyên AWS khác |
| **Calculated** | **Các health check khác** |
| **CloudWatch Alarm** | Trạng thái của một CloudWatch Alarm – nhiều quyền kiểm soát hơn, dùng cho **tài nguyên private** |

#### Health check cho endpoint

- Khoảng **15 health checker toàn cầu** gửi request tới endpoint (route bạn chỉ định).
- Có thể đặt **ngưỡng healthy/unhealthy** (*failure threshold*).
- **Interval:** **30 giây** (standard) hoặc **10 giây** (*fast*, đắt hơn).
- Giao thức: **HTTP, HTTPS, TCP**.
- Nếu **> 18% health checker** báo healthy → Route 53 coi là **healthy**; ngược lại là unhealthy.
- Có thể **chọn location** của health checker.
- Chỉ pass khi nhận mã **2xx hoặc 3xx**.
- Với response dạng text, có thể kiểm tra **5.120 byte đầu tiên** của response để tìm một chuỗi (*string matching*).
- **Mạng:** endpoint phải **cho phép request từ dải IP của Route 53 health checkers** (security group, NACL, firewall).

#### Calculated health check

- **Kết hợp kết quả nhiều health check** thành một.
- Health check **cha (parent)** dựa trên các health check **con (child)**, điều kiện kết hợp: **OR, AND, NOT**.
- Tối đa **256 child health check**; chỉ định **bao nhiêu child phải pass** để parent pass.
- Use case: **bảo trì website** mà không làm tất cả health check fail.

#### Health check cho tài nguyên private

- Health checker nằm trên Internet công cộng, **ngoài VPC** → **không truy cập được endpoint private** (private VPC hay on-premises).
- Cách làm: tạo **CloudWatch Metric** cho tài nguyên (vd EC2 trong private subnet) → tạo **CloudWatch Alarm** trên metric → tạo **health check giám sát alarm**. Khi alarm chuyển sang trạng thái `ALARM`, health check tự động **unhealthy**.

### Kiến thức thực tế

- Dải IP của health checker nằm trong `https://ip-ranges.amazonaws.com/ip-ranges.json` (service **`ROUTE53_HEALTHCHECKS`**). Có thể dùng **AWS-managed prefix list** cho Route 53 health checks trong security group thay vì tự liệt kê IP.
- Metric CloudWatch của health check (`HealthCheckStatus`, `HealthCheckPercentageHealthy`) nằm ở **region `us-east-1`**, nên alarm + SNS cho health check phải tạo ở `us-east-1`.
- Chi phí: health check tính phí theo tháng, endpoint ngoài AWS đắt hơn endpoint AWS; các tuỳ chọn **HTTPS, string matching, fast interval, latency measurement** tính thêm phí. Xem bảng giá Route 53 trước khi bật hàng loạt.
- Nên tạo endpoint **`/health`** kiểm tra cả phụ thuộc quan trọng (DB, cache) nhưng phải **nhẹ**, vì sẽ bị gọi liên tục từ nhiều location.
- Với Alias tới ELB, dùng **Evaluate target health = Yes** thay cho tạo health check riêng.

### Ghi nhớ cho kỳ thi

- 3 loại: **Endpoint, Calculated (health check khác), CloudWatch Alarm**. Không có health check "giám sát SQS queue" hay tài nguyên tuỳ ý khác.
- **Tài nguyên private** → health check dựa trên **CloudWatch Alarm**.
- ~15 checker, **> 18%** healthy là healthy, **2xx/3xx**, **5.120 byte** string matching, **30s / 10s**, phải mở firewall cho IP checker.
- Calculated: **OR/AND/NOT**, tối đa **256** child.

---

## Bài 12 – Failover routing (Active-Passive)

### Lý thuyết

- Một record **Primary** và một record **Secondary** (disaster recovery). Chỉ có **một primary và một secondary**.
- Record primary **bắt buộc gắn health check**. Secondary có thể gắn (tuỳ chọn).
- Khi health check của primary **unhealthy**, Route 53 **tự động failover**, trả về record secondary. Client luôn nhận tài nguyên được coi là healthy.

### Kiến thức thực tế

- Secondary thường là **trang tĩnh trên S3 website / CloudFront** ("Hệ thống đang bảo trì") hoặc môi trường DR ở region khác.
- Thời gian failover thực tế ≈ thời gian health check phát hiện lỗi (interval × failure threshold) + **TTL**. Để failover nhanh: fast interval (10s), threshold thấp, TTL ngắn (vd 60s).
- Với hệ thống cần kiểm soát failover chặt chẽ hơn, AWS có **Route 53 Application Recovery Controller (ARC)** (ngoài phạm vi DVA).

### Ghi nhớ cho kỳ thi

- Active-passive, DR → **Failover**. **Primary bắt buộc health check**.

---

## Bài 13 – Geolocation routing

### Lý thuyết

- **Khác hẳn latency-based**: định tuyến dựa trên **vị trí thực của người dùng**.
- Chỉ định theo **châu lục**, **quốc gia** hoặc **bang của Mỹ**; nếu có chồng lấn, **vị trí cụ thể nhất** được chọn.
- Nên tạo **record Default** cho trường hợp không khớp vị trí nào.
- Use case: **bản địa hoá website**, **hạn chế phân phối nội dung** (vd bản quyền theo quốc gia), cân bằng tải…
- **Gắn được health check**.
- Ví dụ: người dùng Đức → IP bản tiếng Đức; Pháp → IP bản tiếng Pháp; còn lại → Default (bản tiếng Anh).

### Kiến thức thực tế

- **Không có record Default** và vị trí người dùng không khớp → Route 53 trả **"no answer"** (client không phân giải được). Đây chính là cách **chặn truy cập theo quốc gia** ở mức DNS: chỉ tạo record cho quốc gia được phép.
- Chặn theo DNS chỉ là một lớp, người dùng có thể vượt qua bằng VPN hoặc truy cập thẳng IP. Muốn chặn chặt hơn: **CloudFront geo restriction** hoặc **AWS WAF** (geo match).
- Vị trí xác định theo IP của resolver/EDNS Client Subnet, có thể không chính xác 100%.

### Ghi nhớ cho kỳ thi

- Theo **vị trí người dùng** (bản địa hoá, giới hạn nội dung, yêu cầu pháp lý theo quốc gia) → **Geolocation**.
- Nhớ tạo **Default record**.

---

## Bài 14 – Geoproximity routing

### Lý thuyết

- Định tuyến dựa trên **vị trí địa lý của người dùng và của tài nguyên**.
- Dùng tham số **bias** để **dịch chuyển nhiều/ít traffic hơn** tới tài nguyên:
  - **Mở rộng** vùng (nhiều traffic hơn): tăng bias lên **1 đến 99**.
  - **Thu hẹp** vùng (ít traffic hơn): giảm bias xuống **-1 đến -99**.
- Tài nguyên có thể là:
  - **Tài nguyên AWS**: chỉ định **AWS region**.
  - **Không phải AWS** (vd data center on-premises): chỉ định **vĩ độ và kinh độ (latitude/longitude)**.
- Theo video: phải dùng **Route 53 Traffic Flow** (nâng cao) để tận dụng bias.

#### Ví dụ minh hoạ

| Kịch bản | Kết quả |
|---|---|
| `us-west-1` bias 0, `us-east-1` bias 0 | Đường chia nằm giữa 2 region; người dùng phía tây → `us-west-1`, phía đông → `us-east-1` (giống "đi tới region gần nhất") |
| `us-west-1` bias 0, `us-east-1` bias **50** | Đường chia **dịch sang trái (về phía tây)**; vùng của `us-east-1` lớn hơn → **nhiều người dùng hơn** về `us-east-1` |

### Kiến thức thực tế

- **Cập nhật:** từ năm 2024, Route 53 hỗ trợ tạo **record Geoproximity trực tiếp** trong console/API (tham số `GeoProximityLocation`), **không còn bắt buộc** dùng Traffic Flow như video nói. Traffic Flow vẫn dùng được và hữu ích khi cần cây quy tắc phức tạp, nhưng mỗi traffic policy record tính phí riêng theo tháng.

  ```json
  {
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "geoprox.example.com", "Type": "A", "SetIdentifier": "us-east-1",
      "GeoProximityLocation": { "AWSRegion": "us-east-1", "Bias": 50 },
      "TTL": 60, "ResourceRecords": [{ "Value": "54.85.20.20" }]
    }
  }
  ```

  Tài nguyên on-premises dùng `"Coordinates": { "Latitude": "10.82", "Longitude": "106.63" }` thay cho `AWSRegion`.
- Traffic Flow có trình soạn thảo trực quan cho phép **lồng nhiều policy** (vd geolocation → weighted → failover) và lưu thành **traffic policy có version**.

### Ghi nhớ cho kỳ thi

- Cần **dịch chuyển traffic từ region này sang region khác** dựa trên địa lý → **Geoproximity** + **tăng bias**.
- Bias dương: mở rộng (nhiều traffic hơn); âm: thu hẹp.

---

## Bài 15 – IP-based routing

### Lý thuyết

- Định tuyến dựa trên **địa chỉ IP của client**.
- Khai báo danh sách **CIDR** (dải IP của client) và chỉ định mỗi CIDR gửi tới **location/endpoint** nào.
- Use case: **tối ưu hiệu năng** (biết trước IP), **giảm chi phí mạng** (biết traffic đến từ đâu). Ví dụ: định tuyến người dùng của một **ISP cụ thể** (dùng một dải CIDR) tới một endpoint riêng.

Ví dụ:

| Location | CIDR | Record `example.com` trả về |
|---|---|---|
| `location-1` | `203.0.113.0/24` | `1.2.3.4` (EC2 thứ nhất) |
| `location-2` | `200.5.4.0/24` | `5.6.7.8` (EC2 thứ hai) |

User A có IP thuộc `203.0.113.0/24` → nhận `1.2.3.4`; User B có IP thuộc `200.5.4.0/24` → nhận `5.6.7.8`.

### Kiến thức thực tế

IP-based routing dùng **CIDR collection**:

```bash
# 1. Tạo CIDR collection
aws route53 create-cidr-collection --name isp-collection --caller-reference cc-$(date +%s)

# 2. Thêm location và CIDR block
aws route53 change-cidr-collection --id <collection-id> --changes '[
  {"LocationName":"location-1","Action":"PUT","CidrList":["203.0.113.0/24"]},
  {"LocationName":"location-2","Action":"PUT","CidrList":["200.5.4.0/24"]}
]'
```

```json
{
  "Action": "UPSERT",
  "ResourceRecordSet": {
    "Name": "example.com", "Type": "A", "SetIdentifier": "loc1",
    "CidrRoutingConfig": { "CollectionId": "<collection-id>", "LocationName": "location-1" },
    "TTL": 60, "ResourceRecords": [{ "Value": "1.2.3.4" }]
  }
}
```

- Location đặc biệt **`*`** đóng vai trò **default** cho IP không khớp CIDR nào.
- Route 53 so khớp với IP của resolver hoặc EDNS Client Subnet (nếu có).

### Ghi nhớ cho kỳ thi

- Định tuyến theo **dải IP (CIDR) của client** → **IP-based routing**.

---

## Bài 16 – Multi-Value Answer routing

### Lý thuyết

- Dùng khi muốn định tuyến tới **nhiều tài nguyên**; Route 53 trả về **nhiều giá trị**.
- **Gắn được health check** → chỉ trả về các giá trị có **health check healthy**.
- Tối đa **8 record healthy** cho mỗi truy vấn Multi-Value.
- **Không thay thế ELB**: đây là **cân bằng tải phía client** (client chọn một trong các giá trị nhận được).

| | Simple (nhiều giá trị) | Multi-Value Answer |
|---|---|---|
| Health check | **Không** | **Có** |
| Có thể trả IP chết | Có | Không (chỉ trả record healthy) |
| Số giá trị trả về | Tất cả | Tối đa 8 healthy |

### Kiến thức thực tế

- Record Multi-Value **không gắn health check** thì luôn được coi là healthy.
- Phù hợp cho cụm server nhỏ không muốn trả phí ELB, hoặc phân phối kết nối tới nhiều endpoint UDP/TCP. Với web app thật, ALB/NLB vẫn là lựa chọn tốt hơn.

### Ghi nhớ cho kỳ thi

- Multi-Value: **nhiều giá trị + health check**, tối đa **8**, **không thay thế ELB**.
- Khác Simple ở chỗ **có health check**.

---

## Bài 17 – Domain mua ở bên thứ ba và Route 53

### Lý thuyết

- Cần phân biệt **Domain Registrar** và **DNS Service**:
  - Có thể mua domain ở **bất kỳ registrar nào** (trả phí hằng năm): Amazon Registrar (qua Route 53), GoDaddy…
  - Registrar thường kèm luôn **dịch vụ DNS** để quản lý record.
- Các tổ hợp hợp lệ:
  - Mua domain ở Amazon Registrar nhưng **không dùng** Route 53 làm DNS.
  - Mua domain ở **GoDaddy** nhưng dùng **Route 53** để quản lý DNS record.

#### Cách dùng Route 53 cho domain mua ở GoDaddy

1. Trong Route 53, tạo **Public Hosted Zone** cho domain (vd `example.com`).
2. Trong *Hosted zone details*, lấy **4 name server** (record NS).
3. Trên website GoDaddy, mục **Name Servers** → chọn **custom name servers** → nhập 4 name server của Route 53.
4. Từ đó mọi truy vấn DNS cho domain sẽ được trả lời bởi Route 53; quản lý record trong console Route 53.

> Registrar trông giống nhưng **khác** DNS service, dù hầu hết registrar đều có tính năng DNS.

### Kiến thức thực tế

- **Cập nhật:** **Google Domains** (được nhắc trong video) đã ngừng hoạt động; mảng kinh doanh được chuyển cho **Squarespace** (2023).
- Trước khi đổi NS, hãy **tạo đủ record** trong Route 53 (đặc biệt **MX** cho email, TXT xác minh) để tránh gián đoạn.
- Việc đổi NS lan truyền theo TTL của record NS ở TLD (có thể tới 48 giờ).
- Nếu domain bật **DNSSEC** ở registrar cũ, cần tắt/cấu hình lại trước khi chuyển DNS sang Route 53, nếu không domain có thể không phân giải được.
- **Domain transfer** (chuyển cả registrar sang Route 53) là việc khác, không cần thiết nếu chỉ muốn dùng DNS của Route 53.

### Ghi nhớ cho kỳ thi

- Domain mua ở bên thứ ba + dùng Route 53 làm DNS → **tạo Public Hosted Zone**, rồi **cập nhật NS record ở registrar bên thứ ba** trỏ về name server của Route 53.
- **Không** phải private hosted zone, **không** phải sửa NS trong Route 53, **không** cần domain transfer.

---

## Bài 18 – Dọn dẹp tài nguyên

### Kiến thức thực tế

- Đừng quên các **public IPv4** / **Elastic IP** chưa gắn: đều bị tính phí.
- Nếu xoá hosted zone nhưng vẫn giữ domain, domain sẽ không phân giải được; khi tạo lại hosted zone phải cập nhật NS mới cho domain.

### Ghi nhớ cho kỳ thi

- Không có kiến thức thi riêng.

---

## Tổng kết chương

| Chủ đề | Điều cần nhớ |
|---|---|
| DNS | Dịch hostname → IP; phân cấp Root → TLD → SLD; record được cache theo TTL |
| Route 53 | Authoritative DNS, registrar, health check, **SLA 100%**, cổng 53 |
| Record | **A** (IPv4), **AAAA** (IPv6), **CNAME** (hostname → hostname, không ở apex), **NS** |
| Hosted zone | Public (Internet) / Private (trong VPC); 0,50 USD/tháng |
| TTL | Cao: ít truy vấn, chậm cập nhật; thấp: ngược lại; Alias không có TTL |
| CNAME vs Alias | **Zone apex → Alias**; Alias chỉ tới tài nguyên AWS, miễn phí, A/AAAA; không Alias tới EC2 DNS name |
| Simple | 1 hoặc nhiều giá trị, client chọn ngẫu nhiên, **không health check** |
| Weighted | Chia % traffic theo trọng số; canary/thử phiên bản mới |
| Latency | Region có latency thấp nhất với người dùng |
| Failover | Primary (bắt buộc health check) / Secondary |
| Geolocation | Theo vị trí người dùng (châu lục/quốc gia/bang); cần Default |
| Geoproximity | Theo vị trí user + tài nguyên, dùng **bias** để dịch traffic |
| IP-based | Theo CIDR của client (CIDR collection) |
| Multi-Value | Tối đa 8 giá trị healthy, client-side LB, không thay ELB |
| Health check | Endpoint / Calculated / CloudWatch Alarm (cho private); >18% healthy; 2xx/3xx |
| Domain bên thứ ba | Public hosted zone + cập nhật NS ở registrar |

---

## Câu hỏi ôn tập

*Nguồn: Route 53 Quiz. Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Bạn đã mua domain `mycoolcompany.com` qua Amazon Route 53 Registrar và muốn domain này trỏ tới Elastic Load Balancer `my-elb-1234567890.us-west-2.elb.amazonaws.com`. Bạn phải dùng loại record nào của Route 53?

- A. CNAME
- B. Alias

<details><summary>Đáp án</summary>

**B. Alias.** Không thể tạo CNAME có cùng tên với nút đỉnh của DNS namespace (**Zone Apex**), ở đây chính là `mycoolcompany.com`. Alias hỗ trợ zone apex, trỏ được tới ELB, miễn phí truy vấn và tự cập nhật khi IP của ELB thay đổi.
</details>

**Câu 2.** Bạn vừa triển khai một môi trường Elastic Beanstalk mới và muốn chuyển **5%** traffic production sang môi trường này để theo dõi metric trên CloudWatch và đảm bảo không có lỗi. Loại record (routing policy) nào của Route 53 cho phép làm điều này?

- A. Simple
- B. Weighted
- C. Latency
- D. Failover

<details><summary>Đáp án</summary>

**B. Weighted.** Weighted Routing Policy cho phép chuyển một phần traffic theo trọng số (vd phần trăm). Gửi một phần traffic tới phiên bản mới của ứng dụng là use case rất phổ biến (vd weight 95 cho môi trường cũ, 5 cho môi trường mới).
</details>

**Câu 3.** Bạn đã cập nhật giá trị record `myapp.mydomain.com` trên Route 53 để trỏ tới một Elastic Load Balancer mới, nhưng người dùng vẫn bị chuyển tới ELB cũ. Nguyên nhân có thể là gì?

- A. Do Alias record
- B. Do CNAME record
- C. Do TTL
- D. Do Route 53 Health Checks

<details><summary>Đáp án</summary>

**C. Do TTL.** Mỗi DNS record có TTL (Time To Live) yêu cầu client cache giá trị trong một khoảng thời gian để không làm quá tải DNS resolver. Trong thời gian đó client vẫn dùng giá trị cũ. Cần chọn TTL cân bằng giữa thời gian cache và số lượng request tới DNS resolver.
</details>

**Câu 4.** Ứng dụng của bạn chạy ở hai AWS Region `us-west-1` và `eu-west-2`. Bạn muốn người dùng có trải nghiệm tốt nhất bằng cách giảm thiểu thời gian phản hồi từ server ứng dụng tới người dùng. Nên chọn Routing Policy nào?

- A. Latency
- B. Multi Value
- C. Weighted
- D. Geolocation

<details><summary>Đáp án</summary>

**A. Latency.** Latency Routing Policy đánh giá độ trễ giữa người dùng và các AWS Region, giúp họ nhận câu trả lời DNS giảm thiểu latency (thời gian phản hồi). Geolocation dựa trên vị trí địa lý chứ không trực tiếp tối ưu độ trễ.
</details>

**Câu 5.** Có yêu cầu pháp lý rằng người dùng ở bất kỳ quốc gia nào **ngoại trừ Pháp** đều **KHÔNG** được truy cập website của bạn. Routing Policy nào giúp bạn đạt được điều này?

- A. Latency
- B. Simple
- C. Multi Value
- D. Geolocation

<details><summary>Đáp án</summary>

**D. Geolocation.** Geolocation định tuyến theo vị trí người dùng. Chỉ tạo record cho quốc gia **France** và **không** tạo record Default; người dùng ở nơi khác sẽ nhận "no answer" và không phân giải được domain. (Thực tế nên kết hợp thêm CloudFront geo restriction hoặc AWS WAF để chặn chắc chắn hơn.)
</details>

**Câu 6.** Bạn đã mua domain trên GoDaddy và muốn dùng Route 53 làm DNS Service Provider. Bạn cần làm gì?

- A. Yêu cầu chuyển domain (domain transfer)
- B. Tạo Private Hosted Zone và cập nhật NS record ở registrar bên thứ ba
- C. Tạo Public Hosted Zone và cập nhật NS record ở registrar bên thứ ba
- D. Tạo Public Hosted Zone và cập nhật NS record trong Route 53

<details><summary>Đáp án</summary>

**C.** Public Hosted Zone dành cho người truy cập website qua Internet; NS record phải được cập nhật **ở registrar bên thứ ba** (GoDaddy) để trỏ về name server của Route 53. B sai vì Private Hosted Zone chỉ dùng cho truy vấn DNS trong mạng nội bộ (VPC), không truy cập công khai được. D sai vì phải sửa NS ở registrar chứ không phải trong Route 53. A không cần thiết (chỉ đổi DNS, không cần chuyển registrar).
</details>

**Câu 7.** Loại nào sau đây **KHÔNG** phải là Route 53 Health Check hợp lệ?

- A. Health Check giám sát SQS Queue
- B. Health Check giám sát một Endpoint
- C. Health Check giám sát các Health Check khác
- D. Health Check giám sát CloudWatch Alarm

<details><summary>Đáp án</summary>

**A.** Route 53 chỉ có 3 loại health check: giám sát **endpoint**, giám sát **health check khác** (calculated) và giám sát **CloudWatch Alarm**. Không có health check cho SQS queue (nếu thật sự cần, có thể tạo CloudWatch Alarm trên metric của SQS rồi dùng health check loại CloudWatch Alarm).
</details>

---

[← Chương 08](ch08-aws-fundamentals-rds-aurora-elasticach.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chương 10 →](ch10-vpc-fundamentals.md)

