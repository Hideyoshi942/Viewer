# Chuyên sâu Hybrid Networking: Direct Connect, BGP, Transit Gateway, Hybrid DNS & Centralized Inspection

Trong đề thi **AWS Certified Solutions Architect - Professional (SAP-C02)**, các câu hỏi thuộc Domain 1 về mạng lai (Hybrid Networking) quy mô doanh nghiệp luôn thuộc nhóm khó nhất. Bài học này đi sâu vào cơ chế định tuyến BGP qua Direct Connect (DX), kiến trúc đa vùng (Multi-Region) với Direct Connect Gateway (DXGW) + Transit Gateway (TGW), kết nối VPN mã hóa qua DX, phân giải DNS hai chiều với Route 53 Resolver, và mô hình Centralized Egress/Inspection dùng AWS Network Firewall + Gateway Load Balancer (GWLB).

---

## 1. Direct Connect Virtual Interfaces (VIFs): Chọn đúng loại kết nối

Một kết nối vật lý AWS Direct Connect (Dedicated hoặc Hosted Connection) chỉ cung cấp tầng liên kết (Layer 2). Để truyền lưu lượng IP vào AWS, bạn **bắt buộc** phải tạo Virtual Interface (VIF) kèm phiên BGP (Border Gateway Protocol).

| Loại VIF | Đích đến (Target) | Phạm vi truy cập | Hỗ trợ DX Gateway? | Tình huống sử dụng điển hình |
| :--- | :--- | :--- | :--- | :--- |
| **Private VIF** | Virtual Private Gateway (VGW) hoặc DXGW | VPC Private IPs (1 VPC qua VGW, hoặc tối đa 20 VGW qua DXGW) | Có | Kết nối thẳng vào VPC không cần Transit Gateway (quy mô nhỏ/trung bình). |
| **Public VIF** | AWS Public Services (S3, DynamoDB, EC2 Public IP, VPN Endpoints) | Tất cả AWS Public Endpoints toàn cầu (trừ China) | Không | Truy cập S3/DynamoDB qua đường truyền riêng, hoặc thiết lập **Site-to-Site VPN over Direct Connect** để mã hóa IPsec. |
| **Transit VIF** | Direct Connect Gateway (DXGW) gắn với Transit Gateway (TGW) | Hàng trăm/nghìn VPC trên nhiều Account & nhiều Region thông qua tối đa **6 TGW** trên mỗi DXGW | **Bắt buộc** | Kiến trúc Hub-and-Spoke quy mô doanh nghiệp (Multi-Account, Multi-Region). |

> **Exam Tip**: **Transit VIF** chỉ hỗ trợ trên **Dedicated Connection** hoặc **Hosted Connection có băng thông >= 1 Gbps** (từ 1G, 2G, 5G, 10G). Nếu đề bài cho Hosted Connection 500 Mbps và yêu cầu nối vào Transit Gateway, đáp án bắt buộc phải nâng cấp lên >= 1 Gbps hoặc dùng Private VIF / VPN!

### Giới hạn quan trọng của Direct Connect Gateway (DXGW)
- **DXGW là tài nguyên Global**: Cho phép kết nối từ bất kỳ DX Location nào tới các VGW hoặc TGW ở hầu hết mọi AWS Region.
- **Không định tuyến bắc cầu (No Transitive Routing giữa các VGW/TGW)**: DXGW chỉ cho phép lưu lượng đi giữa On-Premises ↔ VGW/TGW. Lưu lượng từ VPC-A (gắn VGW-A) **không thể** đi qua DXGW để sang VPC-B (gắn VGW-B). Muốn kết nối liên vùng giữa các VPC, phải dùng **Transit Gateway Inter-Region Peering**.
- **Giới hạn prefix**: TGW Association trên DXGW cho phép quảng bá tối đa **200 CIDR prefixes** (Allowed Prefixes) về On-Premises (nên dùng **route summarization / supernetting**, ví dụ `10.0.0.0/16` thay vì quảng bá từng `/24`).

---

## 2. Kiến trúc Direct Connect Gateway + Transit Gateway Multi-Region

```text
                        [ On-Premises Data Center ]
                           (Customer Routers x2)
                             /               \
               Transit VIF 1/                 \Transit VIF 2
                           /                   \
             +-----------------------------------------------+
             |       AWS Direct Connect Gateway (Global)     |
             +-----------------------------------------------+
                 /                                       \
     TGW Association (us-east-1)               TGW Association (eu-west-1)
               /                                           \
    +--------------------+     TGW Inter-Region     +--------------------+
    |  TGW (us-east-1)   | <====== Peering =======> |  TGW (eu-west-1)   |
    +--------------------+                          +--------------------+
      |        |        |                             |        |
    VPC-1    VPC-2   Inspection VPC                 VPC-3    VPC-4
```

### Quy tắc thiết kế Multi-Region với TGW + DXGW
1. **Giao tiếp On-Premises ↔ AWS (nhiều Region)**: Đi qua `Customer Router → Transit VIF → DXGW → TGW (Region A hoặc Region B)`.
2. **Giao tiếp East-West giữa Region A và Region B**: Đi qua **TGW Inter-Region Peering** (mạng backbone riêng của AWS, được mã hóa tự động, lưu ý phải cấu hình **static route** giữa hai TGW vì TGW Peering **không** hỗ trợ dynamic BGP route propagation).
3. **Resilience Model (Độ sẵn sàng cao)**:
   - **High Resiliency**: 2 kết nối DX tại **2 DX Locations khác nhau** (2 thiết bị khác nhau, 2 router khác nhau).
   - **Maximum Resiliency (Mission-Critical SLA 99.99%)**: **4 kết nối DX** trải đều trên **2 DX Locations khác nhau** (mỗi location 2 kết nối tới 2 thiết bị AWS khác nhau).

---

## 3. Điều khiển định tuyến BGP: Active/Active vs Active/Passive

Trong bài thi SAP-C02, AWS thường kiểm tra khả năng điều khiển hướng đi của lưu lượng (Traffic Engineering) cho cả chiều **Outbound (AWS → On-Premises)** và chiều **Inbound (On-Premises → AWS)**.

### Thứ tự ưu tiên chọn đường (Route Selection) trên AWS
Khi AWS học được cùng một dải mạng On-Premises qua nhiều đường, AWS chọn đường theo thứ tự:
1. **Longest Prefix Match** (ví dụ `/24` luôn thắng `/16`, bất kể đường nào).
2. Nếu độ dài prefix bằng nhau:
   - **DX Private/Transit VIF** được ưu tiên hơn **Site-to-Site VPN** (khi gắn chung VGW hoặc TGW).
   - **BGP Local Preference** (chỉ áp dụng cho đường DX bằng BGP Community Tags).
   - **Shortest AS_PATH** (ít AS hop hơn được ưu tiên).
   - **Lowest MED (Multi-Exit Discriminator)** (khi cùng một ASN).

### Bảng điều khiển BGP Active/Passive trên Direct Connect

| Chiều lưu lượng | Cơ chế điều khiển | Cách cấu hình Active/Passive | Ghi chú Exam |
| :--- | :--- | :--- | :--- |
| **AWS → On-Premises** (Outbound từ AWS) | **BGP Community Tags** (điều chỉnh Local Preference trên AWS) | Gắn community `7224:7300` (**High preference**) cho đường Active; `7224:7100` (**Low preference**) cho đường Passive (`7224:7200` là Medium). | **Ưu tiên cao nhất** trên AWS, mạnh hơn cả AS_PATH prepending! |
| **AWS → On-Premises** (Khi không dùng Community Tags) | **AS_PATH Prepending** (từ router On-Premises) | Lặp lại ASN của On-Premises nhiều lần trên đường Passive khi quảng bá sang AWS. | Chỉ có tác dụng nếu cả 2 đường có cùng Local Preference và cùng độ dài prefix. |
| **AWS → On-Premises** (Fallback cuối) | **MED (Multi-Exit Discriminator)** | Đặt MED thấp hơn trên đường Active, cao hơn trên đường Passive. | Chỉ so sánh khi 2 đường có **cùng ASN** và cùng độ dài AS_PATH. |
| **On-Premises → AWS** (Inbound vào AWS) | **Local Preference** (trên router On-Premises) | Cấu hình Local Preference cao hơn trên router nội bộ cho đường Active. | Luôn dùng Local Preference (giá trị cao thắng) để điều khiển chiều đi ra từ mạng On-Premises. |
| **Active/Active (ECMP)** | **Equal-Cost Multi-Path** | Quảng bá cùng prefix, cùng Local Preference, cùng độ dài AS_PATH trên cả 2 đường (bật ECMP trên TGW nếu dùng nhiều VPN/DX). | Đảm bảo lưu lượng không bị Asymmetric Routing làm drop gói tin ở Stateful Firewall. |

### BFD (Bidirectional Forwarding Detection)
- Mặc định BGP Hold Timer là **90 giây** (Keepalive 30s) — quá chậm cho ứng dụng nhạy cảm độ trễ (VoIP, giao dịch tài chính).
- Bật **Asynchronous BFD** trên Direct Connect VIF cho phép phát hiện đứt kết nối trong **dưới 1 giây** (mặc định AWS liveness detection interval = 300ms, multiplier = 3 → ~900ms failover).

> **Exam Tip**: Thấy từ khóa **"sub-second failover"** hoặc **"fast BGP failover on Direct Connect"** → chọn ngay **enable Bidirectional Forwarding Detection (BFD)**.

---

## 4. Mã hóa dữ liệu trên Direct Connect: VPN over DX & MACsec

Bản thân Direct Connect là đường truyền riêng (không đi qua Internet công cộng) nhưng **không mã hóa mặc định** ở tầng mạng. Nếu doanh nghiệp có yêu cầu tuân thủ (PCI-DSS, HIPAA) đòi hỏi **encryption in transit** trên đường DX, bạn có 2 lựa chọn chuẩn:

1. **AWS Site-to-Site VPN over Direct Connect Public VIF** (phổ biến nhất trong đề thi):
   - Tạo **Public VIF** trên DX để định tuyến tới địa chỉ IP công cộng của AWS VPN Endpoint (VGW hoặc TGW).
   - Thiết lập hầm **IPsec VPN** chạy bên trong Public VIF đó → Đạt được cả **băng thông ổn định/độ trễ thấp của DX** lẫn **mã hóa IPsec end-to-end**.
   - Nếu cần băng thông > 1.25 Gbps cho VPN, gắn nhiều Site-to-Site VPN connections vào **Transit Gateway** và bật **ECMP** (mỗi tunnel tối đa 1.25 Gbps).
2. **MACsec (IEEE 802.1AE)**:
   - Mã hóa Layer 2 **point-to-point** trực tiếp giữa router của khách hàng và thiết bị AWS tại DX Location.
   - **Giới hạn bắt buộc nhớ**: Chỉ hỗ trợ trên **Dedicated Connection tốc độ 10 Gbps, 100 Gbps hoặc 400 Gbps** (không hỗ trợ 1 Gbps, không hỗ trợ Hosted Connection).

---

## 5. Hybrid DNS với Route 53 Resolver Endpoints

Khi doanh nghiệp vừa có tên miền nội bộ trên On-Premises (ví dụ `corp.internal` chạy trên Active Directory DNS) vừa có Private Hosted Zones (PHZ) trên AWS (ví dụ `aws.internal`), bạn cần thiết lập phân giải DNS hai chiều bằng **Route 53 Resolver**.

### Cơ chế Inbound và Outbound Endpoints
- **Inbound Endpoint**: Cung cấp các địa chỉ IP trong VPC (tối thiểu 2 ENI ở 2 AZ khác nhau). Máy chủ DNS On-Premises cấu hình **Conditional Forwarder** đẩy truy vấn cho `aws.internal` qua DX/VPN tới IP của Inbound Endpoint.
- **Outbound Endpoint + Forwarding Rules**: Cho phép VPC gửi truy vấn cho `corp.internal` ra các máy chủ DNS On-Premises thông qua DX/VPN.
  - **Rule Type = FORWARD**: Chuyển tiếp truy vấn khớp domain (ví dụ `corp.internal`) về Target IP On-Premises.
  - **Rule Type = SYSTEM**: Ghi đè một subdomain cụ thể (ví dụ `cloud.corp.internal`) để Route 53 tự phân giải nội bộ thay vì đẩy về On-Premises.

### Chia sẻ DNS tập trung cho Multi-Account (Shared Services VPC)
Thay vì tạo Resolver Endpoints ở hàng trăm VPC (tốn $0.125/giờ cho mỗi ENI), hãy áp dụng **Centralized Hybrid DNS Pattern**:
1. Đặt **Inbound Endpoint** và **Outbound Endpoint** duy nhất trong **Network / Shared Services VPC**.
2. Liên kết (Associate) tất cả các Private Hosted Zones của các Account khác vào Shared Services VPC (qua CLI `create-vpc-association-authorization` + `associate-vpc-with-hosted-zone`).
3. Sử dụng **AWS Resource Access Manager (RAM)** để chia sẻ **Outbound Forwarding Rules** từ Shared Services Account tới toàn bộ AWS Organization → Mọi Member Account chỉ cần associate Rule vào VPC của họ mà **không cần tạo thêm Outbound Endpoint**.

```bash
# Ví dụ: Tạo Outbound Forwarding Rule bằng AWS CLI
aws route53resolver create-resolver-rule \
  --creator-request-id "corp-internal-forward-01" \
  --name "Forward-Corp-Internal" \
  --rule-type FORWARD \
  --domain-name "corp.internal" \
  --resolver-endpoint-id "rslvr-out-0123456789abcdef0" \
  --target-ips Ip=192.168.10.53,Port=53 Ip=192.168.11.53,Port=53
```

> **Exam Tip**: Để chia sẻ **Resolver Forwarding Rules** cho nhiều Account, dùng **AWS RAM**. Nhưng lưu ý: Inbound/Outbound Endpoints **không** được chia sẻ trực tiếp qua RAM; chỉ có **Forwarding Rules** mới chia sẻ qua RAM được!

---

## 6. Centralized Egress & Inspection VPC với AWS Network Firewall + GWLB

Mô hình chuẩn doanh nghiệp để kiểm soát toàn bộ lưu lượng **North-South (Internet Egress/Ingress)** và **East-West (VPC-to-VPC / On-Premises-to-VPC)** mà không phải đặt NAT Gateway hay Firewall ở từng Spoke VPC:

### Kiến trúc Inspection VPC (Appliance Mode + AWS Network Firewall)

```text
Spoke VPC-A / VPC-B / On-Premises
         |
   [ Transit Gateway ]  <--- Bật Appliance Mode trên Inspection VPC Attachment!
         |
+-------------------------------------------------------------------+
|                     Inspection / Egress VPC                       |
|                                                                   |
|  [TGW Subnet AZ-a] ---> [Firewall Endpoint AZ-a] ---> [NAT GW AZ-a] ---> IGW
|  [TGW Subnet AZ-b] ---> [Firewall Endpoint AZ-b] ---> [NAT GW AZ-b] ---> IGW
+-------------------------------------------------------------------+
```

### 4 Quy tắc sống còn khi cấu hình Inspection VPC (Rất hay ra thi!)
1. **Bật TGW Appliance Mode (`ApplianceModeSupport: enable`)** trên TGW Attachment của Inspection VPC:
   - **Lý do**: Mặc định TGW giữ lưu lượng trong cùng AZ để tối ưu độ trễ. Nếu Spoke VPC-A (AZ-a) gọi Spoke VPC-B (AZ-b), gói tin đi sẽ qua Firewall AZ-a nhưng gói tin về sẽ đi qua Firewall AZ-b → **Asymmetric Routing** → Stateful Firewall drop gói tin!
   - Bật **Appliance Mode** ép TGW băm 5-tuple để đảm bảo cả chiều đi và chiều về của một flow **luôn đi qua cùng một AZ** trong Inspection VPC.
2. **Tách riêng 3 tầng Subnet trong Inspection VPC** (mỗi AZ một bộ):
   - **TGW Attachment Subnet**: Route `0.0.0.0/0` trỏ tới **Firewall Endpoint (GWLBE)** cùng AZ.
   - **Firewall Subnet**: Đặt AWS Network Firewall Endpoint (hoặc Gateway Load Balancer Endpoint - GWLBE cho Firewall bên thứ 3 như Palo Alto, Fortinet). Route `0.0.0.0/0` trỏ tới **NAT Gateway** cùng AZ; route dải CIDR nội bộ (`10.0.0.0/8`) trỏ về **TGW**.
   - **Public Subnet**: Đặt **NAT Gateway**. Route `0.0.0.0/0` trỏ tới **IGW**; route dải CIDR nội bộ (`10.0.0.0/8`) **bắt buộc trỏ lại Firewall Endpoint** cùng AZ (để kiểm tra cả gói tin return traffic từ Internet!).
3. **GWLB (Gateway Load Balancer) cho Third-Party NGFW**:
   - Dùng giao thức **GENEVE (UDP port 6081)** để đóng gói và đẩy toàn bộ lưu lượng Layer 3/4 tới cụm Auto Scaling các thiết bị firewall (Palo Alto, Check Point, Cisco) một cách trong suốt (bump-in-the-wire) mà không cần cấu hình NAT phức tạp.
4. **TGW Route Table Segmentation**:
   - **Spoke Route Table**: Chỉ có static route `0.0.0.0/0 → Inspection VPC Attachment` (không propagate các Spoke khác vào đây để ép cả East-West cũng phải qua Firewall).
   - **Inspection Route Table**: Propagate tất cả các Spoke VPC Attachment và DXGW/VPN Attachment.

---

## 7. Checklist ôn thi SAP-C02 cho Hybrid Networking

- **Private VIF** → VGW / DXGW; **Public VIF** → AWS Public Services & IPsec VPN over DX; **Transit VIF** → DXGW + TGW (yêu cầu >= 1 Gbps).
- **BGP Local Preference (Community Tags `7224:7300`)** > **AS_PATH Prepending** > **MED** khi điều khiển chiều AWS → On-Premises.
- **BFD** → Failover dưới 1 giây trên Direct Connect.
- **Route 53 Resolver**: Inbound (On-Prem → AWS), Outbound + RAM-shared Forwarding Rules (AWS → On-Prem).
- **TGW Appliance Mode** → Bắt buộc bật trên Inspection VPC Attachment để tránh Asymmetric Routing với Stateful Firewall / AWS Network Firewall / GWLB.

---

[← Bài trước](02-control-tower-cfct-service-catalog.md) | [Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/03-hybrid-dns-dx-tgw.md) | [Bài tiếp →](04-multi-region-dr-resilience.md)
