# Chương 05 – EC2 Fundamentals

> **Nguồn:** 13 video của chương + *EC2 Fundamentals Quiz* (11 câu).
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay (2026). Video quay với **Amazon Linux 2** và `t2.micro`; tài liệu này đã cập nhật sang **Amazon Linux 2023 (AL2023)** và các thay đổi mới (Free Tier, phí public IPv4…). Kỳ thi hiện tại là **DVA-C02**.

## Mục tiêu chương

Sau chương này bạn có thể:

- Thiết lập **AWS Budgets** và đọc hoá đơn để không bị "sốc" chi phí khi học.
- Giải thích EC2 là gì, các thành phần khi cấu hình một instance, và cách dùng **EC2 User Data** để bootstrap.
- Tạo một EC2 instance chạy web server, hiểu vòng đời **start / stop / terminate** và sự thay đổi của public IP.
- Đọc tên **instance type** (ví dụ `m5.2xlarge`) và chọn đúng nhóm: General Purpose, Compute/Memory/Storage Optimized.
- Cấu hình **Security Group**, phân biệt lỗi *timeout* và *connection refused*, nhớ các port kinh điển.
- Kết nối vào instance bằng **SSH** (Mac/Linux/Windows), **PuTTY**, **EC2 Instance Connect**.
- Cấp quyền cho EC2 bằng **IAM Role** thay vì access key.
- Chọn đúng **phương thức mua EC2**: On-Demand, Reserved, Savings Plans, Spot, Dedicated Host/Instance, Capacity Reservation.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001 | AWS Budget Setup | Bài 1 – Thiết lập AWS Budgets và theo dõi chi phí |
| 002–003 | EC2 Basics + Create an EC2 Instance with EC2 User Data | Bài 2 – EC2 cơ bản, User Data và instance đầu tiên |
| 004 | EC2 Instance Types Basics | Bài 3 – EC2 Instance Types |
| 005–006 | Security Groups & Classic Ports Overview | Bài 4 – Security Groups và các port kinh điển |
| 007–010 | SSH Overview, SSH trên Linux/Mac, Windows (PuTTY), Windows 10 | Bài 5 – Kết nối SSH vào EC2 |
| 012 | EC2 Instance Connect | Bài 6 – EC2 Instance Connect |
| 013 | EC2 Instance Roles Demo | Bài 7 – IAM Role cho EC2 |
| 014 | EC2 Instance Purchasing Options | Bài 8 – Các phương thức mua EC2 |
| Quiz | EC2 Fundamentals Quiz | Câu hỏi ôn tập |

---

## Bài 1 – Thiết lập AWS Budgets và theo dõi chi phí

### Lý thuyết

- Trước khi tạo tài nguyên, nên đặt **budget + cảnh báo** để không tốn tiền ngoài ý muốn. Nếu làm theo khoá học cẩn thận thì gần như không tốn phí, nhưng budget là "lưới an toàn" khi lỡ quên tắt tài nguyên.
- **IAM user dù có quyền Administrator vẫn có thể bị `Access Denied`** trong Billing console. Nguyên nhân: tuỳ chọn **IAM user and role access to Billing information** đang tắt.
  - Cách bật: đăng nhập **root account** → menu tên tài khoản → **Account** → kéo xuống mục *IAM user and role access to Billing information* → **Edit → Activate IAM Access**.
  - Sau khi bật, IAM user có quyền phù hợp (ví dụ admin) mới xem được dữ liệu billing.
- Các màn hình quan trọng trong **Billing and Cost Management**:

| Màn hình | Dùng để |
|---|---|
| **Home / Dashboard** | Chi phí từ đầu tháng (month-to-date), dự báo cả tháng (forecast), tổng tháng trước, chi phí theo tháng |
| **Bills** | Chọn một tháng → kéo xuống **Charges by service** để xem chi tiết từng dịch vụ, từng region, từng loại phí (ví dụ EC2 gồm NAT Gateway, EBS, Elastic IP…) |
| **Free Tier** | Xem mức dùng hiện tại và dự báo so với hạn mức Free Tier; nếu dự báo chuyển **đỏ** nghĩa là sẽ bị tính phí |
| **Budgets** | Tạo ngân sách và gửi cảnh báo email khi vượt ngưỡng |

- Hai mẫu budget dùng trong video (*Use a template – simplified*):

| Template | Cấu hình | Khi nào gửi email |
|---|---|---|
| **Zero spend budget** | Tên `My Zero-Spend Budget`, nhập email | Ngay khi chi phí vượt **$0.01** |
| **Monthly cost budget** | Ngân sách ví dụ **$10/tháng** | Khi chi phí **thực tế** đạt **85%**, **100%**, và khi chi phí **dự báo** đạt **100%** |

- Forecast có thể báo *Data unavailable* với tài khoản mới vì chưa đủ dữ liệu lịch sử.

### Kiến thức thực tế

- **Free Tier đã thay đổi (từ 15/07/2025):** tài khoản tạo **sau** mốc này dùng mô hình **credit** (Free plan / Paid plan, nhận credit khi đăng ký và khi hoàn thành một số hoạt động) thay cho kiểu "12 tháng miễn phí 750 giờ t2.micro" như trong video. Tài khoản tạo trước mốc này vẫn theo Free Tier cũ. Hãy xem trang **Free Tier** trong console của chính bạn để biết mình thuộc loại nào.
- Với các tài khoản tạo gần đây, quyền truy cập billing cho IAM thường đã được bật sẵn; quyền billing hiện được kiểm soát bằng các action chi tiết (`billing:*`, `ce:*`, `budgets:*`…).
- Các thủ phạm tốn tiền phổ biến khi học: **NAT Gateway**, **Elastic IP / public IPv4**, EBS volume/snapshot bị bỏ quên, Load Balancer, RDS chạy quên tắt.
- **Public IPv4 bị tính phí từ 01/02/2024** (khoảng $0.005/giờ mỗi địa chỉ, kể cả IP đang gắn vào instance đang chạy). Đây là lý do bạn có thể thấy một khoản phí nhỏ trong mục *VPC* dù đang dùng instance "miễn phí".
- Có thể dùng thêm **Cost Anomaly Detection** (phát hiện chi phí bất thường) và **Cost Explorer** để phân tích chi tiết theo dịch vụ/tag.
- **Budget không tự tắt tài nguyên** – nó chỉ cảnh báo. Muốn tự động hành động (gắn SCP/IAM policy, stop EC2/RDS) thì cấu hình **Budget Actions**.

### Ghi nhớ cho kỳ thi

- Kiến thức billing ít xuất hiện trong DVA-C02, nhưng cần nhớ: **IAM admin không xem được billing** nếu root chưa bật *IAM access to Billing*.
- **AWS Budgets** = cảnh báo theo ngưỡng (thực tế/dự báo); **Cost Explorer** = phân tích/biểu đồ chi phí.

---

## Bài 2 – EC2 cơ bản, User Data và instance đầu tiên

### Lý thuyết

#### EC2 là gì

- **EC2 = Elastic Compute Cloud**, là dịch vụ **IaaS (Infrastructure as a Service)** phổ biến nhất của AWS.
- EC2 không chỉ là một dịch vụ mà là một tập hợp:

| Khả năng | Thành phần |
|---|---|
| Thuê máy ảo | **EC2 instances** |
| Lưu dữ liệu trên ổ đĩa ảo | **EBS volumes** |
| Phân phối tải giữa các máy | **ELB (Elastic Load Balancer)** |
| Tự động co giãn | **ASG (Auto Scaling Group)** |

- Hiểu EC2 là nền tảng để hiểu cloud: **thuê compute theo nhu cầu (on-demand)**, có ngay trong vài giây.

#### Các tuỳ chọn khi cấu hình instance

| Thành phần | Lựa chọn |
|---|---|
| **Hệ điều hành** | Linux (phổ biến nhất), Windows, macOS |
| **CPU** | Số vCPU/core |
| **RAM** | Dung lượng bộ nhớ |
| **Storage** | Gắn qua mạng (**EBS**, **EFS**) hoặc gắn phần cứng (**EC2 Instance Store**) |
| **Network** | Tốc độ card mạng, loại public IP |
| **Firewall** | **Security Group** |
| **Bootstrap script** | **EC2 User Data** |

#### EC2 User Data

- **Bootstrapping** = chạy lệnh khi máy khởi động.
- Script User Data **chỉ chạy một lần, ở lần khởi động đầu tiên** của instance, không chạy lại khi reboot/stop-start (mặc định).
- Mục đích: tự động hoá tác vụ khởi động như **cài bản cập nhật, cài phần mềm, tải file từ internet**…
- Script càng nhiều việc thì instance càng mất nhiều thời gian lúc boot.
- **User Data chạy bằng user `root`** → các lệnh đã có quyền sudo, không cần ghi `sudo`.

#### Các tham số khi Launch Instance (theo hands-on)

| Tham số | Giá trị dùng trong video | Ghi chú |
|---|---|---|
| **Name and tags** | `My First Instance` | Tag `Name` |
| **AMI** (Application and OS Images) | Amazon Linux 2, 64-bit x86 | Hiện nay chọn **Amazon Linux 2023** |
| **Instance type** | `t2.micro` (Free Tier) | Nếu region không có t2 thì dùng `t3.micro` |
| **Key pair** | Tạo mới `EC2 Tutorial`, loại **RSA** | `.pem` cho Mac/Linux/Windows 10+; `.ppk` cho PuTTY (Windows 7/8) |
| **Network settings** | Auto-assign public IP; tạo SG `launch-wizard-1` | Cho phép **SSH (22)** và **HTTP (80)** từ anywhere |
| **Storage** | 8 GiB root volume (gp2 trong video) | Free Tier cũ: tối đa 30 GB EBS; **Delete on termination = Yes** |
| **Advanced details → User data** | Script cài `httpd` | Chạy lần đầu boot |

- **Delete on termination** mặc định **bật** cho root volume: terminate instance thì root volume cũng bị xoá.

#### Trạng thái và vòng đời instance

| Hành động | Ý nghĩa | Tính phí compute? | Dữ liệu EBS |
|---|---|---|---|
| **Running** | Đang chạy | Có | Giữ |
| **Stop** | Tắt máy | **Không** (nhưng EBS vẫn tính phí lưu trữ) | **Giữ** |
| **Start** | Bật lại | Có | Giữ |
| **Terminate** | Xoá vĩnh viễn instance | Không | Root volume bị xoá (nếu Delete on termination) |

- **Public IPv4 có thể thay đổi sau khi stop rồi start**, còn **private IPv4 luôn giữ nguyên**.
- **Public IP** dùng để truy cập từ internet; **private IP** dùng để truy cập nội bộ trong mạng AWS.
- Trang web trả về `Hello World from ip-172-31-...` – đó là **private DNS/IP**, dù ta truy cập bằng public IP.

### Kiến thức thực tế

- **Amazon Linux 2 đã hết hạn hỗ trợ (end of support 30/06/2026)**. Dùng **Amazon Linux 2023**: trình quản lý gói là **`dnf`**, mặc định **IMDSv2-only**, root volume mặc định **gp3**.
- **Phí public IPv4 (từ 02/2024):** mỗi public IPv4 tính khoảng $0.005/giờ. Instance chỉ cần gọi ra ngoài thì có thể đặt trong private subnet + NAT, hoặc dùng IPv6.
- Muốn **public IP cố định** qua các lần stop/start → dùng **Elastic IP** (cũng bị tính phí như public IPv4).
- **Debug User Data:** log nằm ở `/var/log/cloud-init-output.log`. Xem lại user data từ bên trong instance (IMDSv2):

  ```bash
  TOKEN=$(curl -s -X PUT http://169.254.169.254/latest/api/token -H "X-aws-ec2-metadata-token-ttl-seconds: 300")
  curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/user-data
  ```

- User Data giới hạn **16 KB** (trước khi base64). Script dài nên đặt trên S3 và User Data chỉ tải về rồi chạy; hoặc tạo **AMI dựng sẵn** (golden AMI) để boot nhanh hơn.
- Muốn User Data chạy **mỗi lần boot** thì phải dùng định dạng MIME multi-part với `cloud_final_modules: [scripts-user, always]` – mặc định chỉ chạy lần đầu.
- **Stop** khác **Hibernate**: hibernate lưu RAM xuống root EBS (phải mã hoá) để khởi động lại nhanh với trạng thái bộ nhớ.
- Dùng **Termination protection** (`DisableApiTermination`) cho instance quan trọng để tránh terminate nhầm.

### Ghi nhớ cho kỳ thi

- **User Data = bootstrap script, chạy 1 lần lúc khởi động đầu tiên, với quyền root.** Câu hỏi "cài phần mềm/cập nhật OS khi launch hàng loạt instance" → **User Data**.
- **Stop/start → public IPv4 có thể đổi**, private IP giữ nguyên; muốn IP cố định → **Elastic IP**.
- Root EBS mặc định **Delete on termination = true**.
- Truy cập web bị **timeout** → kiểm tra **Security Group** (và dùng đúng `http://`).

---

## Bài 3 – EC2 Instance Types

### Lý thuyết

#### Quy ước đặt tên

Ví dụ **`m5.2xlarge`**:

| Phần | Ý nghĩa |
|---|---|
| `m` | **Instance class** (ở đây: General Purpose) |
| `5` | **Generation** – thế hệ phần cứng; cải tiến tiếp sẽ là m6, m7… |
| `2xlarge` | **Size** trong class: nano, micro, small, medium, large, xlarge, 2xlarge, 4xlarge… Size càng lớn thì càng nhiều vCPU, RAM |

#### Các nhóm instance cần biết cho kỳ thi

| Nhóm | Đặc điểm | Use case | Ví dụ family |
|---|---|---|---|
| **General Purpose** | Cân bằng compute, memory, networking | Web server, code repository, đa dạng workload | T (t2, t3…), M |
| **Compute Optimized** | CPU hiệu năng cao | Batch processing, **media transcoding**, high-performance web server, **HPC**, scientific modeling & **machine learning**, **dedicated gaming server** | **C** (c5, c6…) |
| **Memory Optimized** | Xử lý nhanh tập dữ liệu lớn **trong RAM** | Database quan hệ/NoSQL hiệu năng cao, **in-memory database**, distributed web-scale cache (ví dụ **ElastiCache**), in-memory DB cho **BI**, xử lý realtime dữ liệu lớn phi cấu trúc | **R** (R = RAM), X1, High Memory, z1d |
| **Storage Optimized** | Đọc/ghi tuần tự, tốc độ cao trên **local storage** | **OLTP tần suất cao**, database quan hệ & NoSQL, cache cho in-memory DB (ví dụ Redis), **data warehousing**, distributed file system | **I**, **D**, **H1** |

- Không cần thuộc tên family, chỉ cần map **use case → nhóm**.

#### So sánh vài instance (theo video)

| Instance | vCPU | Memory | Nhận xét |
|---|---|---|---|
| `t2.micro` | 1 | 1 GiB | Free Tier (cũ) |
| `r5.16xlarge` | 64 (video nói 16) | 512 GiB | Thiên về RAM |
| `c5d.4xlarge` | 16 | 32 GiB | Thiên về CPU, ít RAM |

> Lưu ý: video nói `r5.16xlarge` có 16 vCPU, thực tế là **64 vCPU / 512 GiB**. Ý chính vẫn đúng: R thiên về RAM, C thiên về CPU.

- Tham khảo: trang **Amazon EC2 Instance Types** của AWS và website cộng đồng **ec2instances.info** (so sánh vCPU, RAM, giá On-Demand/Reserved…).

### Kiến thức thực tế

- **Hậu tố thường gặp** trong tên instance: `g` = AWS **Graviton** (ARM, ví dụ `m7g`, `t4g`), `a` = AMD, `i` = Intel (ví dụ `m7i`), `d` = có **NVMe instance store** local, `n` = mạng tốc độ cao, `flex` = biến thể giá rẻ hơn (`m7i-flex`, `c7i-flex`).
- **Graviton** thường có giá/hiệu năng tốt hơn x86 tương đương; ứng dụng Java, Node.js, Python, Go, container đa kiến trúc thường chạy được ngay (cần AMI/image **arm64**).
- **T family (burstable)**: tích **CPU credits** khi rảnh, tiêu khi tải cao. Hết credit thì CPU bị giới hạn ở baseline (chế độ *standard*), hoặc bị tính thêm phí (chế độ *unlimited* – mặc định của t3/t4g). Không phù hợp cho tải CPU cao liên tục.
- Đổi instance type: **stop → Actions → Instance settings → Change instance type → start** (EBS-backed).

  ```bash
  aws ec2 modify-instance-attribute --instance-id i-0123456789abcdef0 \
    --instance-type '{"Value":"t3.small"}'
  ```

- Liệt kê nhanh thông số bằng CLI:

  ```bash
  aws ec2 describe-instance-types --instance-types t3.micro c5d.4xlarge r5.16xlarge \
    --query 'InstanceTypes[].[InstanceType,VCpuInfo.DefaultVCpus,MemoryInfo.SizeInMiB]' --output table
  ```

- Ngoài 4 nhóm trên còn **Accelerated Computing** (GPU – P, G; Inferentia/Trainium – Inf, Trn) và **HPC Optimized** (Hpc).

### Ghi nhớ cho kỳ thi

- **HPC, batch, transcoding, ML, gaming server → Compute Optimized.**
- **In-memory database, cache, BI realtime → Memory Optimized.**
- **OLTP tần suất cao, data warehouse, distributed file system → Storage Optimized.**
- **Web server, workload cân bằng → General Purpose.**

---

## Bài 4 – Security Groups và các port kinh điển

### Lý thuyết

- **Security Group (SG)** là **firewall bao quanh EC2 instance**, kiểm soát traffic **vào (inbound)** và **ra (outbound)**.
- SG **chỉ có rule Allow** (không có rule Deny).
- Rule có thể tham chiếu **dải IP** (IPv4/IPv6, CIDR) hoặc **Security Group khác**.
- Một rule gồm: **Type**, **Protocol** (TCP/UDP…), **Port range**, **Source** (với inbound) hoặc **Destination** (với outbound).
  - `0.0.0.0/0` = mọi địa chỉ IPv4; `::/0` = mọi địa chỉ IPv6; `x.x.x.x/32` = đúng một IP.
- **Mặc định:** **mọi inbound bị chặn**, **mọi outbound được phép**.

#### Những điều cần biết

| Đặc điểm | Chi tiết |
|---|---|
| Quan hệ nhiều–nhiều | Một SG gắn được cho **nhiều instance**; một instance gắn được **nhiều SG** (rule cộng dồn) |
| Phạm vi | Gắn với tổ hợp **Region / VPC**. Sang region khác hoặc VPC khác phải tạo SG mới |
| Nằm "ngoài" EC2 | Traffic bị chặn thì **instance không hề thấy** – không phải ứng dụng chạy trong EC2 |
| Best practice | Nên tách **một SG riêng cho SSH** vì SSH là phần dễ cấu hình sai và nhạy cảm nhất |

#### Chẩn đoán lỗi kết nối

| Hiện tượng | Nguyên nhân |
|---|---|
| **Timeout** (treo, chờ mãi rồi lỗi) | **100% do Security Group** (chặn traffic) – kiểm tra lại rule |
| **Connection refused** | SG **đã cho qua**, nhưng **ứng dụng lỗi hoặc chưa chạy** trên port đó |

#### Tham chiếu Security Group từ Security Group khác

- Ví dụ: SG-1 của instance A có inbound rule cho phép **SG-1** và **SG-2**.
  - Instance B gắn **SG-2** → kết nối vào A được.
  - Instance C gắn **SG-1** → kết nối vào A được.
  - Instance D gắn **SG-3** → **bị chặn**, vì SG-3 không có trong inbound rule.
- Lợi ích: **không cần quan tâm IP** của instance, chỉ cần gắn đúng SG. Đây là pattern rất phổ biến với **Load Balancer** (chỉ cho phép traffic từ SG của ALB vào EC2).

#### Các port kinh điển cần nhớ

| Port | Giao thức | Dùng để |
|---|---|---|
| **22** | **SSH** (Secure Shell) | Đăng nhập vào **Linux instance** |
| **21** | **FTP** | Upload file vào file share |
| **22** | **SFTP** | Upload file an toàn qua SSH |
| **80** | **HTTP** | Truy cập website không bảo mật |
| **443** | **HTTPS** | Truy cập website bảo mật (chuẩn hiện nay) |
| **3389** | **RDP** (Remote Desktop Protocol) | Đăng nhập vào **Windows instance** |

### Kiến thức thực tế

- SG là **stateful**: traffic trả lời cho một kết nối đã được phép sẽ tự động được cho qua, không cần rule chiều ngược lại. Ngược lại, **NACL** (Network ACL) ở **cấp subnet** là **stateless**, có cả rule **Allow và Deny**.
- **Không mở SSH/RDP từ 0.0.0.0/0** ở môi trường thật. Dùng **My IP**, VPN, **EC2 Instance Connect Endpoint** hoặc **SSM Session Manager** (không cần mở port 22).
- Giới hạn mặc định (có thể xin tăng): **5 SG mỗi network interface**, **60 inbound + 60 outbound rule mỗi SG**.
- Các port DB hay gặp (dùng ở các chương sau): MySQL/Aurora **3306**, PostgreSQL **5432**, MS SQL **1433**, Oracle **1521**, Redis **6379**, Memcached **11211**.
- Thay đổi rule SG có hiệu lực **gần như ngay lập tức**, không cần reboot instance.
- Dùng **Reachability Analyzer** (VPC) để debug đường đi mạng khi không chắc lỗi ở SG, NACL hay route table.

### Ghi nhớ cho kỳ thi

- Kiểm soát traffic vào/ra **EC2 instance** → **Security Group** (NACL ở cấp subnet; IAM policy không kiểm soát traffic mạng).
- **Timeout = Security Group; Connection refused = ứng dụng.**
- Mặc định: **inbound chặn hết, outbound mở hết**. SG **chỉ có Allow**.
- SG gắn được cho **nhiều instance** (trong cùng Region/VPC) – câu "SG chỉ gắn được một instance" là **Sai**.
- Port: **22 SSH/SFTP, 21 FTP, 80 HTTP, 443 HTTPS, 3389 RDP**.

---

## Bài 5 – Kết nối SSH vào EC2

### Lý thuyết

- **SSH (Secure Shell)** cho phép điều khiển máy chủ từ xa bằng **dòng lệnh**, qua **port 22**. Đây là một trong những thao tác quan trọng nhất khi làm việc với EC2 Linux.
- Điều kiện để SSH được: instance có **public IP**, SG có rule **SSH port 22** cho IP của bạn, và bạn có **private key** của key pair.
- Chọn công cụ theo hệ điều hành:

| Hệ điều hành của bạn | SSH (lệnh `ssh`) | PuTTY | EC2 Instance Connect (trình duyệt) |
|---|---|---|---|
| Mac | ✔ | | ✔ |
| Linux | ✔ | | ✔ |
| Windows < 10 | | ✔ | ✔ |
| Windows ≥ 10 | ✔ | ✔ | ✔ |

- **User mặc định** của Amazon Linux là **`ec2-user`**. Cú pháp: `ssh -i <file.pem> ec2-user@<public-ip>`.
- Lời khuyên của giảng viên: SSH là phần gây nhiều lỗi nhất cho học viên. Nếu không làm được thì xem lại SG, lệnh, lỗi chính tả; thử EC2 Instance Connect. **Chỉ cần một cách hoạt động là đủ**; khoá học không dùng SSH nhiều.

### Kiến thức thực tế

- **User mặc định theo AMI:** Amazon Linux → `ec2-user`; Ubuntu → `ubuntu`; Debian → `admin`; RHEL → `ec2-user`; SUSE → `ec2-user`; Bitnami → `bitnami`. Sai user cũng gây lỗi `Permission denied (publickey)`.
- Dùng `~/.ssh/config` để khỏi gõ lại tham số:

  ```
  Host ec2-demo
      HostName 3.250.10.20
      User ec2-user
      IdentityFile ~/aws-course/EC2Tutorial.pem
  ```

  Sau đó chỉ cần `ssh ec2-demo`.
- Bản PuTTY mới (từ 0.75+) có thể dùng file `.ppk` định dạng v3; PuTTYgen vẫn chuyển đổi được hai chiều.
- Key pair có thể là **RSA** hoặc **ED25519** (ED25519 không dùng được cho Windows instance). **AWS không lưu private key** – mất file là không SSH bằng key đó được nữa (phải dùng Instance Connect/Session Manager hoặc gắn volume sang instance khác để sửa `authorized_keys`).
- **Checklist khi SSH lỗi:**
  1. *Timeout* → SG chưa mở port 22 cho IP của bạn / instance không có public IP / subnet không có route ra Internet Gateway / NACL chặn.
  2. *Connection refused* → instance chưa boot xong hoặc dịch vụ sshd lỗi.
  3. *Permission denied (publickey)* → sai key, sai user, hoặc file key không đúng.
  4. *Unprotected private key file* → `chmod 400` (Mac/Linux) hoặc `icacls` (Windows).
- Môi trường thật: nên thay SSH mở internet bằng **SSM Session Manager** (không cần port 22, không cần key, có log audit) hoặc **EC2 Instance Connect Endpoint**.

### Ghi nhớ cho kỳ thi

- SSH dùng **port 22**, cần **private key** (`.pem`/`.ppk`), user `ec2-user` cho Amazon Linux.
- SSH **timeout** → luôn nghĩ đến **Security Group** đầu tiên.
- Lỗi quyền file key → `chmod 0400`.

---

## Bài 6 – EC2 Instance Connect

### Lý thuyết

- **EC2 Instance Connect** mở **phiên SSH ngay trong trình duyệt**, hoạt động trên Mac, Linux, Windows mọi phiên bản.
- **Không cần quản lý SSH key**: khi kết nối, AWS **đẩy một public key tạm thời** lên instance rồi thiết lập kết nối.
- Username tự điền là **`ec2-user`** (AWS đoán từ AMI Amazon Linux); có thể đổi nhưng với Amazon Linux phải là `ec2-user`.
- Thời điểm quay video, Instance Connect chỉ chạy sẵn trên Amazon Linux 2 – đó là lý do khoá học dùng AMI Amazon Linux.
- **Bên dưới vẫn là SSH** → Security Group **vẫn phải mở port 22**. Xoá rule SSH thì Instance Connect báo lỗi không kết nối được.
- Một số trường hợp cần mở thêm rule **SSH từ Anywhere-IPv6 (`::/0`)** ngoài IPv4, tuỳ cấu hình mạng.

### Kiến thức thực tế

- Hiện nay EC2 Instance Connect **cài sẵn** trên **Amazon Linux 2023** và **Ubuntu** (bản mới); các distro khác có thể cài gói `ec2-instance-connect`.
- **Không nên mở 22 cho 0.0.0.0/0** chỉ để dùng Instance Connect: AWS cung cấp **managed prefix list** cho dải IP của dịch vụ EC2 Instance Connect theo region (tên dạng `com.amazonaws.<region>.ec2-instance-connect`) – dùng làm *Source* của rule SSH.
- **EC2 Instance Connect Endpoint (EIC Endpoint, ra mắt 2023):** SSH/RDP vào instance **trong private subnet, không cần public IP**, không cần bastion host. Dùng `aws ec2-instance-connect ssh --instance-id ... --connection-type eice`.
- Quyền IAM cần cho người dùng: `ec2-instance-connect:SendSSHPublicKey` (có thể giới hạn theo instance và `ec2:osuser`). Với endpoint thêm `ec2-instance-connect:OpenTunnel`.
- **SSM Session Manager** là lựa chọn thay thế khác: không cần port 22 inbound, không cần key; instance cần SSM Agent và role có policy `AmazonSSMManagedInstanceCore`.

### Ghi nhớ cho kỳ thi

- EC2 Instance Connect = SSH qua trình duyệt, dùng **key tạm thời**, **vẫn cần port 22** trong SG.
- Truy cập instance private không mở SSH ra internet → nghĩ đến **Session Manager** hoặc **EC2 Instance Connect Endpoint**.

---

## Bài 7 – IAM Role cho EC2

### Lý thuyết

- Amazon Linux có cài sẵn **AWS CLI**. Chạy `aws iam list-users` khi chưa có credentials → lỗi *Unable to locate credentials. You can configure credentials by running "aws configure"*.
- **Tuyệt đối không chạy `aws configure` với Access Key ID / Secret Access Key cá nhân trên EC2.** Bất kỳ ai khác trong tài khoản có thể kết nối vào instance (ví dụ qua Instance Connect) và đọc được credentials đó.
- Cách đúng: **gắn IAM Role** cho instance. Role cung cấp **credentials tạm thời**, tự động xoay vòng; CLI/SDK tự lấy qua Instance Metadata.
- Quyền của instance thay đổi **theo policy gắn vào role**: gỡ policy thì lệnh bị **AccessDenied**; gắn lại thì chạy được (có thể mất vài giây để thay đổi IAM lan truyền).

### Kiến thức thực tế

- EC2 gắn role thông qua **Instance Profile** (một "vỏ bọc" chứa đúng 1 role). Console tạo tự động, còn CLI/CloudFormation phải tạo riêng (`AWS::IAM::InstanceProfile`).
- Code SDK **không cần truyền credentials** – SDK tự tìm theo credential provider chain và lấy từ IMDS:

  ```python
  import boto3
  iam = boto3.client("iam")
  for u in iam.list_users()["Users"]:
      print(u["UserName"])
  ```

- Mỗi instance tại một thời điểm chỉ gắn được **1 instance profile** (1 role); có thể thay role khi instance đang chạy (`replace-iam-instance-profile-association`).
- Người gắn role cho instance cần quyền **`iam:PassRole`** đối với role đó – lỗi hay gặp khi developer launch EC2 có role.
- Áp dụng **least privilege**: đừng gắn `AdministratorAccess` cho role của instance.

### Ghi nhớ cho kỳ thi

- **Cấp quyền AWS cho ứng dụng trên EC2 → IAM Role** (không bao giờ dùng `aws configure` hay biến môi trường chứa key cá nhân).
- Role cung cấp **credentials tạm thời** qua **Instance Metadata**.
- Thiếu quyền → **sửa policy của role**, không thay bằng key cá nhân.
- Gặp lỗi khi gắn role → kiểm tra **`iam:PassRole`**.

---

## Bài 8 – Các phương thức mua EC2

### Lý thuyết

#### Tổng quan

| Phương thức | Cam kết | Phù hợp |
|---|---|---|
| **On-Demand** | Không | Workload ngắn, giá dự đoán được, trả theo giây |
| **Reserved Instances (RI)** | 1 hoặc 3 năm | Workload dài hạn |
| **Convertible RI** | 1 hoặc 3 năm | Workload dài hạn, cần đổi instance type linh hoạt |
| **Savings Plans** | 1 hoặc 3 năm, cam kết **số tiền/giờ** | Workload dài hạn, hiện đại hơn RI |
| **Spot Instances** | Không | Workload ngắn, chịu được gián đoạn, **rẻ nhất** |
| **Dedicated Hosts** | On-Demand hoặc reserve 1/3 năm | Thuê **nguyên một server vật lý**, kiểm soát placement |
| **Dedicated Instances** | — | Không chia sẻ phần cứng với khách hàng khác |
| **Capacity Reservations** | Không có thời hạn | Giữ chỗ capacity trong **một AZ cụ thể**, bất kỳ thời lượng nào |

#### On-Demand

- **Trả theo dùng**: Linux và Windows tính **theo giây sau phút đầu tiên**; các OS khác tính **theo giờ**.
- **Giá cao nhất**, nhưng **không trả trước**, **không cam kết dài hạn**.
- Khuyến nghị cho workload **ngắn hạn, không bị gián đoạn**, **không dự đoán được** hành vi ứng dụng.

#### Reserved Instances

- Giảm giá **đến ~72%** so với On-Demand (con số có thể thay đổi theo thời gian).
- Đặt trước các thuộc tính: **instance type, region, tenancy, OS**.
- **Thời hạn: 1 năm hoặc 3 năm** (3 năm giảm nhiều hơn) – không có kỳ hạn khác.
- **Thanh toán:** No Upfront, Partial Upfront, **All Upfront** (giảm nhiều nhất).
- **Scope:** Regional hoặc Zonal (zonal = **giữ capacity** trong một AZ).
- Dùng cho ứng dụng **ổn định, chạy liên tục** (steady-state), ví dụ **database**.
- Có thể **mua/bán RI trên Reserved Instance Marketplace** khi không cần nữa.
- **Convertible RI:** đổi được **instance type, family, OS, scope, tenancy**; linh hoạt hơn nên giảm ít hơn (**đến ~66%**).

#### EC2 Savings Plans

- Giảm giá dựa trên **cam kết sử dụng dài hạn** – mức giảm tương đương RI (~72%).
- Cam kết **số tiền mỗi giờ**, ví dụ "$10/giờ trong 1 hoặc 3 năm". **Phần dùng vượt** cam kết tính giá **On-Demand**.
- **EC2 Instance Savings Plan** khoá vào **instance family + region** (ví dụ M5 ở us-east-1), nhưng **linh hoạt** về:
  - **Instance size** (m5.xlarge, m5.2xlarge…)
  - **OS** (Linux, Windows…)
  - **Tenancy** (Host, Dedicated, Default)

#### Spot Instances

- Giảm giá **mạnh nhất – đến ~90%** so với On-Demand.
- **Có thể bị thu hồi bất cứ lúc nào** (theo video: khi giá Spot vượt **max price** bạn đặt).
- Rẻ nhất trên AWS, phù hợp workload **chịu được lỗi (resilient to failure)**: **batch job, data analysis, image processing**, workload phân tán, workload có **thời gian bắt đầu/kết thúc linh hoạt**.
- **KHÔNG phù hợp cho job quan trọng (critical) hoặc database** – đề thi hay hỏi điểm này.

#### Dedicated Hosts

- Một **server vật lý** với capacity EC2 **hoàn toàn dành riêng** cho bạn.
- Use case:
  - **Yêu cầu compliance / quy định** nghiêm ngặt.
  - Dùng **license phần mềm gắn với server** hiện có (**BYOL** – tính theo **socket, core, VM**). Dedicated Host cho **visibility vào phần cứng cấp thấp** (socket, core vật lý).
- Mua **On-Demand (trả theo giây)** hoặc **Reserved 1/3 năm**.
- **Phương thức đắt nhất** vì thuê nguyên server vật lý.

#### Dedicated Instances

- Instance chạy trên **phần cứng dành riêng cho bạn**.
- Có thể **chia sẻ phần cứng với instance khác trong cùng tài khoản**; **không kiểm soát placement**.

| | Dedicated Instance | Dedicated Host |
|---|---|---|
| Phần cứng riêng cho tài khoản | Có | Có |
| Truy cập/visibility server vật lý (socket, core) | Không | **Có** |
| Kiểm soát instance placement | Không | **Có** |
| BYOL theo socket/core | Không phù hợp | **Phù hợp** |

#### Capacity Reservations

- **Giữ chỗ On-Demand capacity** trong **một AZ cụ thể**, **bất kỳ thời lượng nào**; truy cập capacity đó bất cứ khi nào cần.
- **Không cam kết thời gian** – tạo/huỷ bất cứ lúc nào.
- **Không có giảm giá** – mục đích duy nhất là giữ capacity. Muốn giảm giá thì **kết hợp với Regional RI hoặc Savings Plans**.
- Bị **tính giá On-Demand dù có chạy instance hay không**.
- Phù hợp workload **ngắn hạn, không gián đoạn**, **bắt buộc ở một AZ cụ thể**.

#### Phép so sánh "khu nghỉ dưỡng (resort)"

| Phương thức | Ví von |
|---|---|
| On-Demand | Đến lúc nào cũng được, trả **giá đầy đủ** |
| Reserved | Lên kế hoạch trước, ở lâu (1–3 năm) nên được **giảm giá tốt** |
| Savings Plans | Cam kết **chi một số tiền** nhất định mỗi tháng (ví dụ $300/tháng trong 12 tháng), được **đổi loại phòng** (king, suite, sea view…) |
| Spot | Khách sạn **giảm giá phút chót** cho phòng trống; có thể **bị đuổi** bất cứ lúc nào nếu người khác trả cao hơn |
| Dedicated Host | **Thuê cả toà nhà** resort |
| Capacity Reservation | **Đặt phòng** dù không chắc sẽ ở, nhưng nếu đến thì chắc chắn có phòng – vẫn **trả giá đầy đủ** |

#### Ví dụ giá (m4.large, us-east-1, tại một thời điểm – chỉ để minh hoạ)

| Loại | Giá/giảm |
|---|---|
| On-Demand | ~$0.10/giờ |
| Spot | Giảm đến ~61% (trong ví dụ) |
| Reserved 1 năm / 3 năm (No upfront → All upfront) | Giảm dần theo kỳ hạn và mức trả trước |
| EC2 Savings Plan | Tương đương mức giảm của RI |
| Convertible RI | Giảm ít hơn RI thường |
| Dedicated Host | Giá On-Demand |
| Dedicated Host Reservation | Giảm đến ~70% |
| Capacity Reservation | Giá On-Demand |

### Kiến thức thực tế

- **Spot hiện nay:** từ 2017 AWS đã bỏ mô hình "đấu giá" – giá Spot thay đổi **từ từ** theo cung cầu dài hạn, và instance bị thu hồi chủ yếu khi **AWS cần lại capacity**. Max price mặc định là **giá On-Demand** và AWS khuyến nghị không cần đặt max price. Khi bị thu hồi, instance nhận **thông báo trước 2 phút** (qua instance metadata `spot/instance-action` và EventBridge). Hành vi khi bị thu hồi: terminate, stop hoặc hibernate.
- Spot thường dùng qua **Auto Scaling Group với mixed instances policy** (kết hợp On-Demand + Spot, nhiều instance type) hoặc EC2 Fleet; chiến lược `price-capacity-optimized` giảm khả năng bị gián đoạn.

  ```bash
  aws ec2 run-instances --image-id resolve:ssm:/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 \
    --instance-type t3.micro \
    --instance-market-options 'MarketType=spot,SpotOptions={SpotInstanceType=one-time,InstanceInterruptionBehavior=terminate}'
  ```

- **Savings Plans có 2 loại chính cho compute:**
  - **Compute Savings Plans:** linh hoạt nhất – áp dụng cho **mọi family, region, OS**, cả **Fargate** và **Lambda**; giảm đến ~66%.
  - **EC2 Instance Savings Plans:** khoá family + region (như video mô tả); giảm đến ~72%.
  - AWS hiện **khuyến nghị Savings Plans thay cho RI** với EC2. RI vẫn dùng nhiều cho RDS, ElastiCache, Redshift, OpenSearch.
- **Capacity Reservation** tạo bằng CLI:

  ```bash
  aws ec2 create-capacity-reservation --instance-type m5.large --instance-platform Linux/UNIX \
    --availability-zone us-east-1a --instance-count 2 --end-date-type unlimited
  ```

  Ngoài ra có **Capacity Blocks for ML** để đặt trước GPU instance theo khung thời gian ngắn.
- Mọi con số giảm giá (72%, 66%, 90%…) là **"tối đa"** và thay đổi theo thời gian – tra **AWS Pricing Calculator** khi ước tính thật.
- Dùng **Cost Explorer → Savings Plans/RI recommendations** để biết nên cam kết bao nhiêu dựa trên mức dùng thực tế.

### Ghi nhớ cho kỳ thi

- **Giảm giá lớn nhất nhưng không dùng cho critical job/database → Spot.**
- **Chạy liên tục 1 năm / database ổn định → Reserved Instances** (hoặc Savings Plans).
- RI chỉ có kỳ hạn **1 hoặc 3 năm** (không phải "bất kỳ giữa 1 và 3 năm").
- **Compliance nghiêm ngặt + BYOL theo socket/core/visibility phần cứng → Dedicated Hosts** (đắt nhất).
- **Cần giữ capacity trong một AZ, không cam kết thời gian → Capacity Reservations** (không giảm giá).
- **Workload ngắn, không gián đoạn, không dự đoán được → On-Demand.**

---

## Tổng kết chương

| Chủ đề | Điều cần nhớ |
|---|---|
| Billing | Bật *IAM access to Billing* (root); dùng **Budgets** (zero-spend, monthly) và **Bills → Charges by service** |
| EC2 | IaaS: instance, EBS, ELB, ASG; chọn OS, CPU, RAM, storage, network, SG, user data |
| User Data | Bootstrap script, **chạy 1 lần lúc boot đầu**, quyền **root** |
| Vòng đời | Stop: không tính compute, giữ EBS; start lại **public IP có thể đổi**, private IP giữ nguyên; terminate xoá root volume |
| Instance types | `m5.2xlarge` = class + generation + size; General / Compute (HPC) / Memory (in-memory DB) / Storage (OLTP) |
| Security Group | Firewall cấp instance, chỉ Allow, stateful; inbound chặn / outbound mở mặc định; tham chiếu SG khác; Region/VPC-scoped |
| Lỗi mạng | **Timeout = SG**, **Connection refused = ứng dụng** |
| Ports | 22 SSH/SFTP, 21 FTP, 80 HTTP, 443 HTTPS, 3389 RDP |
| SSH | `ssh -i key.pem ec2-user@IP`, `chmod 0400`; PuTTY dùng `.ppk` (PuTTYgen chuyển đổi) |
| Instance Connect | SSH qua trình duyệt, key tạm thời, **vẫn cần port 22** |
| IAM Role cho EC2 | Không bao giờ `aws configure` trên EC2; dùng role/instance profile → credentials tạm thời |
| Purchasing | On-Demand / RI (1–3 năm, ~72%) / Convertible RI (~66%) / Savings Plans / Spot (~90%, không cho DB) / Dedicated Host (compliance, BYOL) / Capacity Reservation (giữ chỗ AZ, không giảm giá) |
| Cập nhật 2026 | AL2023 thay AL2; public IPv4 tính phí từ 02/2024; Free Tier mô hình credit từ 07/2025; Instance Connect Endpoint, Session Manager |

---

## Câu hỏi ôn tập

*Nguồn: EC2 Fundamentals Quiz. Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Phương thức mua EC2 nào cho mức giảm giá lớn nhất, nhưng không phù hợp cho job quan trọng hoặc database?

- A. Convertible Reserved Instances
- B. Dedicated Hosts
- C. Spot Instances

<details><summary>Đáp án</summary>

**C. Spot Instances.** Spot phù hợp workload ngắn và là phương thức rẻ nhất, nhưng kém tin cậy vì instance có thể bị thu hồi. Convertible RI (A) dành cho workload dài hạn cần linh hoạt instance nhưng không giảm nhiều nhất. Dedicated Hosts (B) dành cho compliance/licensing và là phương thức đắt nhất.
</details>

**Câu 2.** Bạn nên dùng gì để kiểm soát traffic vào và ra các EC2 instance?

- A. Network Access Control List (NACL)
- B. Security Groups
- C. IAM Policies

<details><summary>Đáp án</summary>

**B. Security Groups.** SG hoạt động ở **cấp instance** và kiểm soát traffic. NACL (A) là đáp án nhiễu – hoạt động ở **cấp subnet** (sẽ học ở chương VPC). IAM Policies (C) quản lý quyền truy cập dịch vụ/tài nguyên AWS, không kiểm soát traffic mạng.
</details>

**Câu 3.** Bạn có thể đặt trước (reserve) một EC2 Reserved Instance trong bao lâu?

- A. 1 hoặc 3 năm
- B. 2 hoặc 4 năm
- C. 6 tháng hoặc 1 năm
- D. Bất kỳ thời gian nào trong khoảng 1 đến 3 năm

<details><summary>Đáp án</summary>

**A. 1 hoặc 3 năm.** RI chỉ có đúng hai kỳ hạn 1 năm hoặc 3 năm, không có kỳ hạn ở giữa (D sai).
</details>

**Câu 4.** Bạn muốn triển khai ứng dụng High-Performance Computing (HPC) trên EC2. Nên chọn loại instance nào?

- A. Storage Optimized
- B. Memory Optimized
- C. Compute Optimized
- D. General Purpose

<details><summary>Đáp án</summary>

**C. Compute Optimized.** Dành cho workload nặng tính toán cần CPU hiệu năng cao: batch processing, media transcoding, HPC, scientific modeling & machine learning, dedicated gaming server. Storage Optimized (A) cho đọc/ghi tuần tự lượng lớn trên local storage; Memory Optimized (B) cho tập dữ liệu lớn trong RAM; General Purpose (D) cho workload cân bằng.
</details>

**Câu 5.** Phương thức mua EC2 nào phù hợp cho ứng dụng chạy liên tục trên một server trong 1 năm?

- A. On-Demand Instances
- B. Spot Instances
- C. Reserved Instances

<details><summary>Đáp án</summary>

**C. Reserved Instances.** RI phù hợp workload dài hạn, đặt trước 1 hoặc 3 năm. On-Demand (A) cho workload ngắn với giá dự đoán được; Spot (B) cho workload ngắn nhưng kém tin cậy. (Thực tế, EC2 Instance/Compute Savings Plans 1 năm cũng là lựa chọn tương đương.)
</details>

**Câu 6.** Bạn chuẩn bị chạy một ứng dụng trên nhóm EC2 instance. Ứng dụng cần cài phần mềm và cập nhật một số gói OS ở lần khởi động đầu tiên. Cách tốt nhất khi launch các instance là gì?

- A. SSH vào từng instance, cài phần mềm và cập nhật gói OS thủ công
- B. Viết bash script cài phần mềm và cập nhật OS, rồi dùng script đó làm **EC2 User Data** khi launch instance
- C. Viết bash script rồi gửi cho AWS Support để họ chạy trên instance khi launch

<details><summary>Đáp án</summary>

**B.** EC2 User Data dùng để bootstrap instance bằng bash script: cài phần mềm/gói, tải file từ internet… A làm được nhưng tốn rất nhiều công sức khi có nhiều instance. C không tồn tại – AWS Support không cài phần mềm cho instance của bạn.
</details>

**Câu 7.** Bạn nên chọn loại EC2 instance nào cho một ứng dụng quan trọng dùng in-memory database?

- A. Compute Optimized
- B. Storage Optimized
- C. Memory Optimized
- D. General Purpose

<details><summary>Đáp án</summary>

**C. Memory Optimized.** Phù hợp workload cần xử lý tập dữ liệu lớn trong bộ nhớ (in-memory database, cache, BI realtime).
</details>

**Câu 8.** Bạn có ứng dụng thương mại điện tử với database OLTP đặt on-premises, nhận hàng nghìn request mỗi giây. Bạn muốn chuyển database lên EC2. Nên chọn loại instance nào cho database OLTP tần suất cao này?

- A. Compute Optimized
- B. Storage Optimized
- C. Memory Optimized
- D. General Purpose

<details><summary>Đáp án</summary>

**B. Storage Optimized.** Phù hợp workload cần đọc/ghi tốc độ cao, tuần tự lên tập dữ liệu lớn trên local storage – use case điển hình gồm **OLTP tần suất cao**, database quan hệ/NoSQL, data warehousing.
</details>

**Câu 9.** Security Group chỉ có thể gắn vào một EC2 instance. (Đúng/Sai)

- A. Sai
- B. Đúng

<details><summary>Đáp án</summary>

**A. Sai.** Một Security Group có thể gắn vào **nhiều** EC2 instance trong cùng Region/VPC; và một instance cũng có thể gắn nhiều SG.
</details>

**Câu 10.** Bạn chuẩn bị chuyển ứng dụng on-premises lên AWS. Công ty có yêu cầu compliance nghiêm ngặt buộc ứng dụng chạy trên server dành riêng, đồng thời muốn dùng license phần mềm gắn với server (server-bound) sẵn có để giảm chi phí. Phương thức mua nào phù hợp?

- A. Convertible Reserved Instances
- B. Dedicated Hosts
- C. Spot Instances

<details><summary>Đáp án</summary>

**B. Dedicated Hosts.** Phù hợp công ty có yêu cầu compliance cao hoặc phần mềm có mô hình license phức tạp (BYOL theo socket/core/VM). Đây là phương thức đắt nhất. A không đáp ứng yêu cầu server riêng; C rẻ nhưng có thể bị thu hồi và cũng không dành riêng phần cứng.
</details>

**Câu 11.** Bạn muốn triển khai một database trên EC2 và nhà cung cấp tính license dựa trên số **core vật lý** và khả năng nhìn thấy **socket** của phần cứng bên dưới. Phương thức mua nào cho phép bạn có visibility đó?

- A. Dedicated Hosts
- B. Spot Instances
- C. On-Demand
- D. Reserved Instances

<details><summary>Đáp án</summary>

**A. Dedicated Hosts.** Chỉ Dedicated Host cho bạn truy cập server vật lý và visibility vào socket, core vật lý – điều kiện để dùng license tính theo socket/core. Spot, On-Demand, Reserved (B, C, D) chạy trên phần cứng chia sẻ, không lộ thông tin này.
</details>

---

[← Chương 04](ch04-iam-aws-cli.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chương 06 →](ch06-ec2-instance-storage.md)

