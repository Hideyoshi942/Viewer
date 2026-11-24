# Chương 10 – VPC Fundamentals

> **Nguồn:** 6 video của chương + *VPC Quiz*.
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay (2026). Các video trong chương chỉ có lý thuyết (không có hands-on); các lệnh CLI trong tài liệu là phần bổ sung để bạn tự thực hành.

## Mục tiêu chương

Sau chương này bạn có thể:

- Giải thích **VPC**, **subnet** (public/private), **route table**, **Internet Gateway**, **NAT Gateway / NAT Instance**.
- Phân biệt **Security Group** và **Network ACL**, hiểu **stateful** và **stateless**.
- Biết dùng **VPC Flow Logs** để điều tra sự cố kết nối.
- Hiểu các cách kết nối: **VPC Peering**, **VPC Endpoints** (Gateway/Interface), **Site-to-Site VPN**, **Direct Connect**.
- Đọc hiểu kiến trúc **3 tầng (three-tier)**, **LAMP stack** và **WordPress** trên AWS.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001 | VPC Fundamentals - Section Introduction | Bài 1 – Giới thiệu chương |
| 002 | VPC, Subnets, IGW and NAT | Bài 2 – VPC, Subnet, Internet Gateway và NAT |
| 003 | NACL, SG, VPC Flow Logs | Bài 3 – Network ACL, Security Group và VPC Flow Logs |
| 004 | VPC Peering, Endpoints, VPN, DX | Bài 4 – VPC Peering, VPC Endpoints, Site-to-Site VPN, Direct Connect |
| 005 | VPC Cheat Sheet & Closing Comments | Bài 5 – Tóm tắt VPC (cheat sheet) |
| 006 | Three Tier Architecture | Bài 6 – Kiến trúc 3 tầng, LAMP và WordPress |
| Quiz | VPC Quiz | Câu hỏi ôn tập |

---

## Bài 1 – Giới thiệu chương

### Lý thuyết

- **VPC (Virtual Private Cloud)** cần nắm **sâu** ở kỳ thi Solutions Architect Associate và SysOps Administrator Associate. Với **Developer Associate**, chỉ cần hiểu **ở mức tổng quan** vì thường chỉ có khoảng **1–3 câu** về VPC.
- Các khái niệm cần biết: **VPC, Subnets, Internet Gateway, NAT Gateway, Security Groups, Network ACL (NACL), VPC Flow Logs, VPC Peering, VPC Endpoints, Site-to-Site VPN, Direct Connect**.
- Các phần sau của khoá (vd Lambda trong VPC) sẽ nhắc lại khái niệm VPC khi cần, nên không cần nhớ hết ngay. Nếu đã học phần VPC của SAA/SysOps có thể bỏ qua hoặc xem lại để ôn.

### Ghi nhớ cho kỳ thi

- DVA hỏi VPC ở mức khái niệm: **subnet public/private, IGW, NAT, SG vs NACL, Flow Logs, Peering, Endpoints, VPN vs Direct Connect**.

---

## Bài 2 – VPC, Subnet, Internet Gateway và NAT

### Lý thuyết

#### VPC và Subnet

- **VPC** là **mạng riêng (private network)** trong AWS Cloud để triển khai tài nguyên. VPC là **tài nguyên cấp Region** (2 region thì có 2 VPC khác nhau).
- VPC có một **dải IP (CIDR range)** – tập IP được phép dùng trong VPC.
- **Subnet** chia nhỏ (partition) mạng bên trong VPC, và được định nghĩa **ở cấp Availability Zone**.

| | Public Subnet | Private Subnet |
|---|---|---|
| Truy cập Internet | **Truy cập được Internet và được truy cập từ Internet** | **Không** truy cập được từ Internet |
| Ví dụ đặt gì | Load balancer, NAT Gateway, bastion host | Ứng dụng, database |
| Mục đích | Phục vụ public | **Bảo mật, riêng tư hơn** |

- **Route table** định nghĩa cách traffic đi **ra Internet và giữa các subnet**.
- Kiến trúc thường gặp: 1 Region → 1 VPC (CIDR) → 2 AZ, mỗi AZ có **1 public subnet + 1 private subnet**, EC2 đặt vào subnet tuỳ nhu cầu.
- **Default VPC**: AWS tạo sẵn **1 VPC mặc định ở mỗi region**, chỉ có **public subnet** (mỗi AZ một public subnet), **không có private subnet**. Từ đầu khoá tới giờ ta luôn dùng default VPC.

#### Internet Gateway (IGW)

- **IGW** giúp các instance trong VPC **kết nối Internet**. IGW gắn vào VPC.
- **Public subnet có route trực tiếp tới IGW** – đó chính là điều làm subnet trở thành "public".

#### NAT Gateway / NAT Instance

- Bài toán: EC2 trong **private subnet** cần **ra Internet** (vd tải bản cập nhật phần mềm) nhưng **không cho Internet truy cập vào**.
- Giải pháp: **NAT Gateway** hoặc **NAT Instance** – cùng chức năng:

| | NAT Gateway | NAT Instance |
|---|---|---|
| Quản lý | **AWS-managed** (không lo provisioning, scaling) | **Tự quản lý** (là một EC2) |
| Mở rộng | Tự động | Tự lo |

- Cách hoạt động:
  1. Đặt NAT Gateway/Instance trong **public subnet**.
  2. **Private subnet có route** tới NAT.
  3. NAT có route tới **IGW** (vì nằm trong public subnet) → private subnet ra được Internet qua NAT mà vẫn private.

```
Internet
   │
  IGW
   │
┌──┴──────────── VPC (10.0.0.0/16) ───────────────┐
│ Public subnet  (route 0.0.0.0/0 → IGW)          │
│    NAT Gateway, ALB                             │
│ Private subnet (route 0.0.0.0/0 → NAT Gateway)  │
│    EC2 ứng dụng                                 │
└─────────────────────────────────────────────────┘
```

- NAT Gateway sẽ xuất hiện lại khi học **Lambda trong VPC** (Lambda trong VPC cần NAT Gateway để ra Internet).

### Kiến thức thực tế

Dựng nhanh một VPC có public + private subnet bằng CLI:

```bash
# VPC và subnet
VPC_ID=$(aws ec2 create-vpc --cidr-block 10.0.0.0/16 --query Vpc.VpcId --output text)
PUB=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.1.0/24 \
  --availability-zone ap-southeast-1a --query Subnet.SubnetId --output text)
PRIV=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.2.0/24 \
  --availability-zone ap-southeast-1a --query Subnet.SubnetId --output text)

# Internet Gateway + route table public
IGW=$(aws ec2 create-internet-gateway --query InternetGateway.InternetGatewayId --output text)
aws ec2 attach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC_ID
PUB_RT=$(aws ec2 create-route-table --vpc-id $VPC_ID --query RouteTable.RouteTableId --output text)
aws ec2 create-route --route-table-id $PUB_RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW
aws ec2 associate-route-table --route-table-id $PUB_RT --subnet-id $PUB
aws ec2 modify-subnet-attribute --subnet-id $PUB --map-public-ip-on-launch

# NAT Gateway (trong public subnet, cần Elastic IP) + route table private
EIP=$(aws ec2 allocate-address --domain vpc --query AllocationId --output text)
NAT=$(aws ec2 create-nat-gateway --subnet-id $PUB --allocation-id $EIP \
  --query NatGateway.NatGatewayId --output text)
aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT
PRIV_RT=$(aws ec2 create-route-table --vpc-id $VPC_ID --query RouteTable.RouteTableId --output text)
aws ec2 create-route --route-table-id $PRIV_RT --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT
aws ec2 associate-route-table --route-table-id $PRIV_RT --subnet-id $PRIV
```

- Console có wizard **VPC → Create VPC → "VPC and more"** dựng sẵn VPC, subnet public/private ở nhiều AZ, IGW, NAT Gateway, route table – tiện cho lab.
- **Chi phí NAT Gateway** (đáng chú ý nhất trong VPC): tính **theo giờ** (khoảng **0,045 USD/giờ** ở `us-east-1`) **cộng phí xử lý dữ liệu** (khoảng **0,045 USD/GB**), cộng thêm phí **public IPv4** của Elastic IP. Một NAT Gateway chạy cả tháng tốn khoảng 30+ USD dù không có traffic. Nhớ **xoá NAT Gateway và release Elastic IP** sau lab.
- Truy cập S3/DynamoDB từ private subnet qua NAT Gateway sẽ mất phí xử lý dữ liệu; dùng **Gateway Endpoint** (Bài 4, miễn phí) để tiết kiệm.
- Để HA, đặt **mỗi AZ một NAT Gateway** (NAT Gateway chỉ dự phòng trong phạm vi AZ của nó).
- **Public IPv4 bị tính phí từ 02/2024** (khoảng 0,005 USD/giờ/IP) – áp dụng cho EC2 có public IP, Elastic IP, NAT Gateway, ALB… Xu hướng hiện nay là hạn chế public IP, đặt workload trong private subnet.
- Một số con số cần biết: CIDR của VPC từ **/16 đến /28**; AWS **giữ lại 5 IP** trong mỗi subnet; default VPC dùng CIDR `172.31.0.0/16`.
- Subnet "public" còn cần instance có **public IP / Elastic IP**; có route tới IGW mà instance không có public IP thì vẫn không ra Internet được.

### Ghi nhớ cho kỳ thi

- VPC: **cấp Region**; Subnet: **cấp AZ**.
- Public subnet = có **route tới IGW**.
- Private subnet ra Internet → **NAT Gateway** (AWS-managed, scale tự động – ít quản trị nhất) hoặc NAT Instance (tự quản lý).
- Default VPC: 1/region, chỉ có public subnet.

---

## Bài 3 – Network ACL, Security Group và VPC Flow Logs

### Lý thuyết

#### Network ACL (NACL)

- **Firewall kiểm soát traffic vào/ra subnet**.
- Có cả rule **ALLOW** và **DENY** (tường minh).
- **Gắn ở cấp subnet**; rule chỉ chứa **địa chỉ IP**.
- Là **lớp phòng thủ đầu tiên** của subnet: traffic từ Internet đi qua NACL trước, chưa tới EC2.
- **Default NACL** của default VPC **cho phép tất cả vào và ra** → vì vậy trong khoá học chưa phải sửa NACL (và chương này cũng không có hands-on).

#### Security Group (SG)

- **Firewall kiểm soát traffic vào/ra một ENI (Elastic Network Interface) hoặc EC2 instance**.
- **Chỉ có rule ALLOW**.
- Rule có thể tham chiếu **địa chỉ IP** hoặc **security group khác**.
- Là **lớp phòng thủ thứ hai**: sau NACL, traffic qua SG rồi mới tới EC2.

#### So sánh

| | Security Group | Network ACL |
|---|---|---|
| Phạm vi | **Instance / ENI** | **Subnet** |
| Loại rule | Chỉ **Allow** | **Allow và Deny** |
| Trạng thái | **Stateful**: traffic phản hồi **tự động được phép**, bất kể rule | **Stateless**: traffic phản hồi phải được **cho phép tường minh** (cả chiều vào và ra) |
| Đánh giá rule | Xét **tất cả rule** trước khi quyết định | Xét **theo thứ tự số rule** (nhỏ trước), khớp rule nào dừng ở đó |
| Áp dụng | Chỉ cho instance được gắn SG | Tự động cho mọi instance trong subnet |

(Bảng chi tiết là kiến thức của SAA/SysOps; với DVA chủ yếu cần nhớ **cấp áp dụng, allow/deny, stateful/stateless**.)

#### VPC Flow Logs

- **Ghi lại thông tin về toàn bộ IP traffic** đi qua các interface:
  - **VPC** Flow Logs
  - **Subnet** Flow Logs
  - **ENI** Flow Logs
- Dùng để **giám sát và xử lý sự cố kết nối**, ví dụ:
  - Subnet không ra được Internet.
  - Subnet này không nói chuyện được với subnet kia.
  - Internet không vào được subnet.
- Ghi cả traffic **được cho phép (ACCEPT)** và **bị từ chối (REJECT)**.
- Ghi cả traffic của **dịch vụ AWS-managed** chạy trong VPC: **ELB, ElastiCache, RDS, Aurora**…
- Đích gửi log: **Amazon S3**, **CloudWatch Logs**, **Kinesis Data Firehose**.

### Kiến thức thực tế

- **Cập nhật tên dịch vụ:** **Kinesis Data Firehose** đã được đổi tên thành **Amazon Data Firehose** (02/2024). Đề thi và tài liệu cũ vẫn có thể dùng tên cũ.
- Ví dụ rule **SG tham chiếu SG** (mẫu cực kỳ phổ biến: chỉ ALB được vào EC2):

  ```bash
  aws ec2 authorize-security-group-ingress \
    --group-id sg-ec2app0000000000 \
    --protocol tcp --port 80 \
    --source-group sg-alb000000000000
  ```

- Ví dụ NACL: vì **stateless**, nếu cho phép HTTP vào (port 80) thì phải cho phép **chiều ra tới cổng tạm (ephemeral ports) 1024–65535** cho traffic phản hồi:

  ```bash
  aws ec2 create-network-acl-entry --network-acl-id acl-0123456789abcdef0 \
    --ingress --rule-number 100 --protocol tcp --port-range From=80,To=80 \
    --cidr-block 0.0.0.0/0 --rule-action allow
  aws ec2 create-network-acl-entry --network-acl-id acl-0123456789abcdef0 \
    --egress --rule-number 100 --protocol tcp --port-range From=1024,To=65535 \
    --cidr-block 0.0.0.0/0 --rule-action allow
  ```

- NACL hữu ích để **chặn (DENY) một IP/dải IP cụ thể** – việc SG không làm được.
- Bật Flow Logs gửi về CloudWatch Logs:

  ```bash
  aws ec2 create-flow-logs \
    --resource-type VPC --resource-ids vpc-0123456789abcdef0 \
    --traffic-type ALL \
    --log-destination-type cloud-watch-logs \
    --log-group-name /vpc/flow-logs \
    --deliver-logs-permission-arn arn:aws:iam::123456789012:role/VPCFlowLogsRole
  ```

  Một dòng log (định dạng mặc định):

  ```
  2 123456789012 eni-0a1b2c3d 203.0.113.5 10.0.1.25 49152 22 6 10 840 1760000000 1760000060 REJECT OK
  ```

  Các trường: `version account-id interface-id srcaddr dstaddr srcport dstport protocol packets bytes start end action log-status`. Dòng trên: IP `203.0.113.5` cố SSH (port 22, protocol 6 = TCP) vào `10.0.1.25` và bị **REJECT** → kiểm tra SG/NACL.
- Mẹo đọc Flow Logs: **inbound ACCEPT nhưng outbound REJECT** → thường do **NACL** (stateless); SG là stateful nên không gây hiện tượng này.
- Flow Logs **không ghi nội dung gói tin** (payload). Cần xem nội dung thì dùng **VPC Traffic Mirroring**. Flow Logs cũng không ghi một số traffic như truy vấn tới Amazon DNS server, IMDS (`169.254.169.254`), DHCP.
- Phân tích Flow Logs trên S3 bằng **Amazon Athena**, hoặc trên CloudWatch Logs bằng **Logs Insights**.

### Ghi nhớ cho kỳ thi

- **SG: cấp instance/ENI, chỉ allow, stateful, tham chiếu được SG khác.**
- **NACL: cấp subnet, allow + deny, stateless.**
- Thu thập thông tin IP traffic trong VPC → **VPC Flow Logs** (không phải "CloudWatch Traffic Logs" – không tồn tại).
- Flow Logs gửi tới **S3, CloudWatch Logs, (Kinesis/Amazon) Data Firehose**.

---

## Bài 4 – VPC Peering, VPC Endpoints, Site-to-Site VPN, Direct Connect

### Lý thuyết

#### VPC Peering

- Kết nối **2 VPC** (khác account hoặc khác region đều được) một cách **private qua mạng của AWS**, khiến chúng hoạt động **như cùng một mạng**.
- Điều kiện: **dải IP (CIDR) của 2 VPC không được chồng lấn** (overlap) – nếu chồng lấn, mạng không biết gửi gói tin tới đâu.
- **Không có tính bắc cầu (non-transitive)**: nếu A–B và A–C được peer thì **B và C vẫn không nói chuyện được** với nhau; muốn vậy phải tạo peering **B–C** riêng. Càng nhiều VPC càng phải tạo nhiều peering.

#### VPC Endpoints (rất quan trọng cho kỳ thi)

- Mọi dịch vụ AWS đều **public**. Thông thường EC2 gọi dịch vụ AWS qua đường public.
- **VPC Endpoint** cho phép kết nối tới dịch vụ AWS qua **mạng private** thay vì Internet công cộng → **bảo mật hơn, latency thấp hơn**; EC2 trong **private subnet** (không có Internet) vẫn gọi được dịch vụ AWS.

| | Gateway Endpoint | Interface Endpoint |
|---|---|---|
| Dịch vụ | **Chỉ S3 và DynamoDB** | **Hầu hết các dịch vụ còn lại** (vd CloudWatch) |
| Cơ chế | Mục tiêu (target) trong **route table** | Một **ENI có IP private** trong subnet (**PrivateLink**) |

- Video cho rằng DVA có thể không hỏi sâu sự khác biệt Gateway/Interface, nhưng **quiz có hỏi** "2 dịch vụ có Gateway Endpoint là gì" → nhớ **S3 & DynamoDB**.
- Quy tắc: đề hỏi **kết nối private tới dịch vụ AWS** → **VPC Endpoint**.

#### Kết nối on-premises với VPC

| | **Site-to-Site VPN** | **Direct Connect (DX)** |
|---|---|---|
| Kết nối | VPN appliance on-premises ↔ AWS | **Đường truyền vật lý** riêng tới AWS |
| Đi qua | **Internet công cộng** | **Mạng private**, không qua Internet |
| Mã hoá | **Tự động mã hoá** | (đường riêng, bảo mật và nhanh) |
| Thời gian thiết lập | **Vài phút**, dễ và nhanh | **Ít nhất 1 tháng** |
| Đặc điểm | Rẻ, nhanh triển khai | Ổn định, nhanh, private |

Cả hai cùng mục đích (nối data center/văn phòng với VPC) nhưng khác cách thức và thời gian triển khai.

### Kiến thức thực tế

- **Gateway Endpoint miễn phí**; **Interface Endpoint tính phí theo giờ mỗi AZ + theo GB** dữ liệu.
- Tạo Gateway Endpoint cho S3:

  ```bash
  aws ec2 create-vpc-endpoint --vpc-id vpc-0123456789abcdef0 \
    --vpc-endpoint-type Gateway \
    --service-name com.amazonaws.ap-southeast-1.s3 \
    --route-table-ids rtb-0123456789abcdef0
  ```

  Tạo Interface Endpoint cho CloudWatch Logs (bật Private DNS để SDK dùng tên mặc định `logs.<region>.amazonaws.com` mà không phải sửa code):

  ```bash
  aws ec2 create-vpc-endpoint --vpc-id vpc-0123456789abcdef0 \
    --vpc-endpoint-type Interface \
    --service-name com.amazonaws.ap-southeast-1.logs \
    --subnet-ids subnet-aaa subnet-bbb \
    --security-group-ids sg-0123456789abcdef0 \
    --private-dns-enabled
  ```

  Security group của Interface Endpoint phải cho phép **HTTPS (443)** từ các instance.
- **Cập nhật:** ngoài Gateway Endpoint, **S3** và **DynamoDB** (từ 2024) nay cũng có **Interface Endpoint** (PrivateLink), hữu ích khi cần truy cập từ on-premises qua VPN/DX hoặc từ VPC khác. Tuy vậy **Gateway Endpoint vẫn chỉ có cho S3 và DynamoDB** – đáp án của đề không đổi.
- Có thể gắn **endpoint policy** (vd chỉ cho phép truy cập một bucket nhất định), và bucket policy dùng điều kiện `aws:SourceVpce` để chỉ chấp nhận truy cập qua endpoint.
- Nhiều VPC cần kết nối lẫn nhau (có tính bắc cầu) → dùng **AWS Transit Gateway** (mô hình hub-and-spoke) thay vì mesh peering.
- Peering: sau khi tạo và **accept** kết nối, phải **thêm route** ở **cả hai** VPC thì mới thông:

  ```bash
  aws ec2 create-vpc-peering-connection --vpc-id vpc-aaa --peer-vpc-id vpc-bbb
  aws ec2 accept-vpc-peering-connection --vpc-peering-connection-id pcx-0123456789abcdef0
  aws ec2 create-route --route-table-id rtb-aaa --destination-cidr-block 10.1.0.0/16 \
    --vpc-peering-connection-id pcx-0123456789abcdef0
  ```

- Site-to-Site VPN: phía AWS dùng **Virtual Private Gateway** hoặc **Transit Gateway**, phía on-premises là **Customer Gateway**. Có tính phí theo giờ kết nối + data transfer out.
- Direct Connect **không mã hoá mặc định**; nếu yêu cầu mã hoá có thể chạy **VPN trên DX** hoặc dùng **MACsec** (trên một số cổng tốc độ cao). Phương án HA phổ biến: DX chính + Site-to-Site VPN làm dự phòng.

### Ghi nhớ cho kỳ thi

- **VPC Peering**: CIDR **không chồng lấn**, **không bắc cầu** → 3 VPC cần **3** kết nối (A-B, A-C, B-C).
- **Truy cập private tới dịch vụ AWS** → **VPC Endpoint**. **Gateway Endpoint: chỉ S3 & DynamoDB**; còn lại là Interface Endpoint (PrivateLink, IP private).
- **Site-to-Site VPN**: qua Internet, mã hoá, nhanh triển khai.
- **Direct Connect**: đường riêng **không qua Internet**, ổn định, mất **≥ 1 tháng** để thiết lập.

---

## Bài 5 – Tóm tắt VPC (cheat sheet)

### Lý thuyết

| Khái niệm | Tóm tắt |
|---|---|
| **VPC** | Virtual Private Cloud; mỗi region có **1 default VPC** (dùng suốt khoá học khi tạo EC2) |
| **Subnets** | Gắn với **một AZ**, là phân vùng mạng của VPC; nơi ta launch EC2 |
| **Internet Gateway** | Ở **cấp VPC**, cho phép instance trong **public subnet** truy cập Internet |
| **NAT Gateway / NAT Instance** | Cho instance trong **private subnet** truy cập Internet |
| **NACL** | Firewall **stateless** ở **cấp subnet**, rule inbound/outbound |
| **Security Group** | Firewall **stateful** ở **cấp EC2/ENI**, tham chiếu được SG khác |
| **VPC Peering** | Nối 2 VPC có CIDR **không chồng lấn**, **không bắc cầu** |
| **VPC Endpoints** | Truy cập **private** tới dịch vụ AWS từ trong VPC |
| **VPC Flow Logs** | Log network traffic để debug (access denied, traffic bị chặn/cho phép) |
| **Site-to-Site VPN** | VPN qua **Internet công cộng** từ on-premises tới AWS |
| **Direct Connect** | Kết nối **private trực tiếp** tới AWS |

- Không cần lo nếu chưa hiểu hết: các phần sau của khoá sẽ nhắc lại những tính năng VPC cần thiết.

### Ghi nhớ cho kỳ thi

- Học thuộc bảng trên là đủ cho phần lớn câu hỏi VPC trong DVA.

---

## Bài 6 – Kiến trúc 3 tầng, LAMP và WordPress

### Lý thuyết

#### Kiến trúc 3 tầng (Three-tier architecture)

Kiến trúc rất hay xuất hiện trong câu hỏi tình huống:

| Tầng | Thành phần | Vị trí | Lý do |
|---|---|---|---|
| 0 – DNS | **Route 53** | — | Người dùng truy vấn DNS để tìm ELB |
| 1 – Web/Public | **ELB** trải trên nhiều AZ | **Public subnet** | Phải truy cập được từ Internet |
| 2 – Application | **EC2 trong Auto Scaling Group** (3 AZ) | **Private subnet** | Chỉ cần nhận traffic từ ELB, không cần public → **an toàn hơn** |
| 3 – Data | **Amazon RDS** (đọc/ghi dữ liệu), **ElastiCache** (cache dữ liệu RDS, lưu **session** của web app) | **Private subnet sâu hơn** (*data subnet*) | Cô lập dữ liệu |

- ELB gửi traffic từ public subnet tới private subnet nhờ **route table**.

```
Users ─DNS─> Route 53
  │
  ▼
[Public subnets: ELB (multi-AZ)]
  │
  ▼
[Private subnets: EC2 Auto Scaling Group – AZ1, AZ2, AZ3]
  │
  ▼
[Data subnets: RDS, ElastiCache]
```

#### LAMP stack trên EC2

| Chữ | Thành phần | Trên AWS |
|---|---|---|
| **L** | Linux | Hệ điều hành của EC2 |
| **A** | Apache | Web server chạy trên EC2 |
| **M** | MySQL | Database, vd **MySQL trên RDS** |
| **P** | PHP | Logic ứng dụng, render trang web, chạy trên EC2 |

- Có thể thêm **Redis/Memcached (ElastiCache)** làm lớp cache.
- Lưu dữ liệu/cache cục bộ hoặc phần mềm ứng dụng: dùng **EBS** gắn vào EC2.

#### WordPress trên AWS

- Cùng kiến trúc: tầng load balancer + tầng ứng dụng (EC2 nhiều AZ).
- Người dùng upload **ảnh** qua ELB tới một EC2; các EC2 khác cũng cần thấy ảnh đó → dùng **Amazon EFS** (network file system), EFS tạo **ENI ở mỗi AZ**, mọi EC2 cùng mount và chia sẻ file.
- AWS có sơ đồ tham chiếu đầy đủ cho WordPress (NAT Gateway, IGW, ASG, nhiều subnet, Aurora, EFS, CloudFront, S3…) – tới thời điểm này bạn đã hiểu được gần hết, trừ CloudFront và S3 (sẽ học sau).

### Kiến thức thực tế

- **SG chaining** là cách triển khai đúng cho kiến trúc 3 tầng:
  - SG của ALB: cho phép 80/443 từ `0.0.0.0/0`.
  - SG của EC2: cho phép 80 **từ SG của ALB**.
  - SG của RDS: cho phép 3306 **từ SG của EC2**.
- RDS/ElastiCache đặt trong **DB subnet group / cache subnet group** gồm các private subnet ở nhiều AZ; RDS Multi-AZ để HA.
- Lưu **session** trong ElastiCache (hoặc DynamoDB) giúp tầng ứng dụng **stateless**, ASG scale in/out không mất phiên đăng nhập (thay cho sticky session).
- EC2 trong private subnet cần ra Internet (cập nhật hệ điều hành, gọi API bên ngoài) → NAT Gateway; chỉ cần gọi dịch vụ AWS → cân nhắc **VPC Endpoint** để giảm chi phí NAT.
- Quản trị EC2 trong private subnet: dùng **SSM Session Manager** hoặc **EC2 Instance Connect Endpoint** thay vì bastion host mở cổng 22.
- Với WordPress, thực tế thường thêm **CloudFront + S3** cho file tĩnh/media, và **Aurora** cho database.

### Ghi nhớ cho kỳ thi

- Three-tier: **ELB ở public subnet**, **EC2 (ASG) ở private subnet**, **RDS/ElastiCache ở data subnet**.
- **Chỉ cho ALB truy cập EC2** → inbound rule của SG EC2 có **source là SG của ALB**.
- ElastiCache: cache dữ liệu DB và **lưu session**.
- Chia sẻ file giữa nhiều EC2 ở nhiều AZ → **EFS**.
- LAMP = **Linux, Apache, MySQL, PHP**.

---

## Tổng kết chương

| Chủ đề | Điều cần nhớ |
|---|---|
| VPC / Subnet | VPC cấp Region; Subnet cấp AZ; default VPC chỉ có public subnet |
| Public subnet | Route tới **IGW** (+ instance có public IP) |
| Private subnet ra Internet | **NAT Gateway** (managed, scale tự động) hoặc NAT Instance (tự quản lý, tắt Source/Dest Check); IPv6 dùng Egress-only IGW |
| Security Group | Instance/ENI, chỉ allow, **stateful**, tham chiếu SG khác |
| NACL | Subnet, allow + deny, **stateless** |
| VPC Flow Logs | Ghi IP traffic (VPC/Subnet/ENI), ACCEPT/REJECT; gửi S3, CloudWatch Logs, Data Firehose |
| VPC Peering | CIDR không chồng lấn, **không bắc cầu** |
| VPC Endpoints | Truy cập private tới dịch vụ AWS; **Gateway: S3 & DynamoDB**; Interface: còn lại (PrivateLink) |
| Site-to-Site VPN | Qua Internet, mã hoá, nhanh |
| Direct Connect | Đường riêng, không qua Internet, ≥ 1 tháng |
| Three-tier | ELB public → EC2 private → RDS/ElastiCache data subnet |
| Chi phí | NAT Gateway (giờ + GB), public IPv4 (từ 02/2024), Interface Endpoint; Gateway Endpoint miễn phí |

---

## Câu hỏi ôn tập

*Nguồn: VPC Quiz. Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Security Group hoạt động ở cấp ______, còn NACL hoạt động ở cấp ______.

- A. EC2 instance, Subnet
- B. Subnet, EC2 instance

<details><summary>Đáp án</summary>

**A.** Security Group gắn với EC2 instance/ENI; NACL gắn với subnet.
</details>

**Câu 2.** Bạn đã gắn Internet Gateway vào VPC nhưng EC2 vẫn không truy cập được Internet. Điều nào sau đây **KHÔNG** phải là nguyên nhân có thể?

- A. Route table thiếu entry
- B. EC2 không có public IP
- C. Security Group không cho phép traffic vào
- D. NACL không cho phép traffic đi ra

<details><summary>Đáp án</summary>

**C.** Security Group là **stateful**: nếu traffic được phép đi ra thì traffic phản hồi tự động được phép quay lại, nên inbound rule của SG không ngăn instance truy cập Internet. Các phương án còn lại đều có thể là nguyên nhân: thiếu route `0.0.0.0/0 → IGW` (A), không có public IP (B), NACL (stateless) chặn chiều ra (D).
</details>

**Câu 3.** Bạn muốn cung cấp truy cập Internet (IPv4) cho EC2 trong private subnet, giải pháp phải **ít công quản trị nhất** và **mở rộng liền mạch**. Bạn nên dùng gì?

- A. NAT Instance với cờ Source/Destination Check tắt
- B. NAT Gateway
- C. Egress-Only Internet Gateway

<details><summary>Đáp án</summary>

**B. NAT Gateway** – dịch vụ AWS-managed, tự mở rộng. A dùng được (tạo một EC2 làm NAT) nhưng phải tự cấu hình, quản trị và không tự scale. C chỉ dành cho **IPv6**.
</details>

**Câu 4.** Khi dùng VPC Endpoints, hai dịch vụ AWS **duy nhất** có Gateway Endpoint là gì?

- A. Amazon S3 & Amazon SQS
- B. Amazon SQS & DynamoDB
- C. Amazon S3 & DynamoDB

<details><summary>Đáp án</summary>

**C. Amazon S3 & DynamoDB.** Hãy nhớ: chỉ hai dịch vụ này có VPC Gateway Endpoint; các dịch vụ khác dùng Interface Endpoint (chạy trên PrivateLink, tức một IP private trong subnet).
</details>

**Câu 5.** Bạn có 3 VPC A, B và C và muốn chúng kết nối với nhau hoàn toàn bằng VPC Peering. Bạn nên làm gì?

- A. Tạo 3 kết nối VPC Peering (A-B, A-C, B-C)
- B. Vì VPC Peering hỗ trợ bắc cầu (transitive), chỉ cần 2 kết nối (A-B, B-C)

<details><summary>Đáp án</summary>

**A.** VPC Peering **không có tính bắc cầu**, nên mỗi cặp VPC cần một kết nối riêng. (Khi số VPC lớn, dùng Transit Gateway.)
</details>

**Câu 6.** Làm thế nào để thu thập thông tin về IP traffic bên trong VPC?

- A. Bật VPC Traffic Mirroring
- B. Bật VPC Flow Logs
- C. Bật CloudWatch Traffic Logs

<details><summary>Đáp án</summary>

**B.** VPC Flow Logs ghi lại thông tin về IP traffic đi vào/ra các network interface trong VPC. A (Traffic Mirroring) **sao chép nội dung traffic** từ một ENI để kiểm tra nội dung, giám sát mối đe doạ, xử lý sự cố – không phải công cụ ghi log thông tin traffic. C không tồn tại.
</details>

**Câu 7.** Bạn cần thiết lập một kết nối **chuyên dụng** giữa data center on-premises và AWS Cloud. Kết nối phải **private, ổn định** và traffic **không được đi qua Internet**. Nên dùng dịch vụ nào?

- A. Site-to-Site VPN
- B. AWS PrivateLink
- C. Amazon EventBridge
- D. AWS Direct Connect

<details><summary>Đáp án</summary>

**D. AWS Direct Connect** – đường kết nối vật lý riêng, không qua Internet. A không phù hợp vì traffic đi qua Internet công cộng. B dùng để truy cập private tới dịch vụ (Interface Endpoint), không phải kết nối on-premises. C là event bus, không liên quan.
</details>

**Câu 8.** Một web application chạy trên nhóm EC2 do Auto Scaling Group quản lý, được expose qua Application Load Balancer. Cả EC2 và ALB nằm trong VPC có CIDR `192.168.0.0/18`. Cấu hình security group của EC2 thế nào để **chỉ ALB** truy cập được chúng trên port 80?

- A. Thêm inbound rule port 80, source `0.0.0.0/0`
- B. Thêm inbound rule port 80, source `192.168.0.0/18`
- C. Thêm inbound rule port 80, source là **Security Group của ALB**
- D. Cài SSL certificate lên ALB

<details><summary>Đáp án</summary>

**C.** Tham chiếu security group của ALB là cách an toàn nhất để chỉ ALB truy cập được EC2. A mở cho cả Internet; B cho phép mọi tài nguyên trong VPC; D không liên quan tới kiểm soát truy cập vào EC2. Tham chiếu SG trong rule là kỹ thuật rất mạnh và nhiều câu hỏi trong đề dựa vào nó – hãy nắm vững.
</details>

---

[← Chương 09](ch09-route-53.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Chương 11 →](ch11-amazon-s3-introduction.md)
