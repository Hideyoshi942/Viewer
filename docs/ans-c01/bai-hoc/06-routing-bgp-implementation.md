# Triển khai Định tuyến BGP, DNS Hybrid & PrivateLink / VPC Lattice

Domain 2 (**Network Implementation – 26%**) tập trung vào kỹ năng cấu hình thực chiến: kiểm soát luồng traffic đối xứng/bất đối xứng bằng **BGP**, thiết kế **Direct Connect VIF & DXGW**, tích hợp **Hybrid DNS với Route 53 Resolver**, và kết nối ứng dụng ở Layer 4/Layer 7 với **PrivateLink** và **VPC Lattice**.

---

## 1. Cơ chế chọn đường BGP (BGP Path Selection) trên AWS

Khi có nhiều đường kết nối từ On-Premises tới AWS (ví dụ: 2 DX connections, hoặc DX + Site-to-Site VPN), hiểu chính xác thứ tự ưu tiên định tuyến của AWS là **bắt buộc** để vượt qua ANS-C01.

### Thứ tự ưu tiên từ AWS → On-Premises (Outbound từ AWS)
1. **Longest Prefix Match (LPM)**: Luôn thắng tuyệt đối! Ví dụ `/25` luôn ưu tiên hơn `/24`, bất kể là Static, DX hay VPN.
2. **Route Origin / Priority** (khi cùng prefix length trên VGW):
   - Static routes trên VGW > BGP propagated từ **Direct Connect** > BGP propagated từ **Site-to-Site VPN**.
   - *Lưu ý trên Transit Gateway (TGW)*: Static route trên TGW Route Table ưu tiên hơn Propagated route. Với các đường BGP cùng prefix: **DX > VPN**.
3. **BGP Local Preference** (dùng BGP Community tags từ On-Premises quảng bá lên AWS):
   - `7224:7100` → Low preference (ưu tiên thấp)
   - `7224:7200` → Medium preference (mặc định)
   - `7224:7300` → High preference (ưu tiên cao nhất — chọn làm Active path)
4. **AS_PATH Length**: Đường có ít AS hop hơn được chọn. Dùng **AS_PATH Prepending** trên đường Backup để làm nó kém ưu tiên hơn.
5. **MED (Multi-Exit Discriminator)**: Giá trị **thấp hơn** thắng (chỉ so sánh khi các đường đến từ **cùng một Neighbor ASN**).

> **Exam Tip**: **BGP Local Preference** (`7224:7300`) có độ ưu tiên **cao hơn** `AS_PATH` và `MED`, nhưng **thấp hơn** Longest Prefix Match! Nếu muốn phân tách Active/Passive cho 2 DX connections cùng ASN và cùng prefix, ưu tiên dùng **BGP Community Local Preference** hoặc **AS_PATH Prepending**.

### BGP Communities cho Public VIF (Kiểm soát phạm vi quảng bá)
Khi dùng Public VIF để truy cập AWS Public Services (S3, DynamoDB), bạn gắn Community tag để giới hạn AWS quảng bá prefix của bạn tới đâu:
- `7224:9100` — Chỉ trong **Local AWS Region**.
- `7224:9200` — Tất cả các Region trong **cùng lục địa (Continent)**.
- `7224:9300` — **Global** (tất cả AWS public Regions).

### BFD (Bidirectional Forwarding Detection)
- Mặc định BGP hold timer trên AWS Direct Connect là **90 giây** (keepalive 30s).
- Bật **BFD** trên Direct Connect VIF giúp phát hiện đứt liên kết L2/L3 trong vòng **< 1 giây** (mặc định AWS: minimum interval 300ms, multiplier 3 = 900ms), kích hoạt failover BGP gần như tức thì.

---

## 2. Direct Connect VIFs & Direct Connect Gateway (DXGW)

| Loại VIF | Đích kết nối | Mục đích & Giới hạn quan trọng |
| :--- | :--- | :--- |
| **Private VIF** | VGW hoặc DXGW (→ tối đa 20 VGW) | Truy cập private IP trong VPC. Không hỗ trợ Transit Gateway. |
| **Public VIF** | AWS Public Endpoints (S3, SQS, VPN) | Yêu cầu Public IPv4 (hoặc IPv6) thuộc sở hữu của bạn; hỗ trợ BGP Community `9100/9200/9300`. |
| **Transit VIF** | **Bắt buộc qua DXGW** → tối đa 6 TGW | Kết nối DX tới nhiều TGW đa Region. Cần Hosted Connection ≥ 1 Gbps hoặc Dedicated Connection. |

### Quy tắc vàng với Direct Connect Gateway (DXGW)
- DXGW là **Global resource** cho phép 1 kết nối DX ở bất kỳ đâu truy cập tới nhiều VPC/TGW ở **nhiều AWS Region** và **nhiều AWS Account** khác nhau.
- **KHÔNG hỗ trợ transitive routing giữa các VGW/TGW** gắn vào cùng 1 DXGW (VPC A không thể đi qua DXGW để sang VPC B).
- **Giới hạn BGP routes**:
  - Private VIF / Transit VIF: tối đa **100 routes** từ On-Premises lên AWS (nếu vượt quá → BGP session bị ngắt! Phải dùng **Route Summarization**).
  - DXGW → TGW Association: cấu hình **Allowed Prefixes** (tối đa **200 prefixes** quảng bá từ AWS về On-Premises qua DXGW).

---

## 3. Hybrid DNS với Amazon Route 53 Resolver

Để phân giải tên miền hai chiều giữa VPC và On-Premises DNS Server qua Direct Connect / VPN:

1. **Inbound Endpoint**: Cấp các ENI (IP private) trong VPC để **On-Premises DNS** forward truy vấn cho Private Hosted Zones (PHZ) của AWS (ví dụ: `aws.corp.internal`).
2. **Outbound Endpoint + Forwarding Rules**: Cấp các ENI trong VPC kèm **Forwarding Rules** để **EC2 trong VPC** forward truy vấn (ví dụ: `onprem.corp.local`) về DNS Server tại Data Center.
   - **Rule Sharing**: Dùng **AWS RAM (Resource Access Manager)** chia sẻ Outbound Forwarding Rules cho toàn bộ AWS Organizations, tránh tạo Outbound Endpoint tốn kém ở từng VPC.
   - **System Rules vs. Conditional Forwarding**: Route 53 Resolver ưu tiên **Longest Domain Match** (ví dụ `app.corp.local` thắng `corp.local`).
   - **Autodefined System Rules**: Có thể override (ví dụ disable reverse DNS lookup cho RFC 1918) để chuyển tiếp truy vấn PTR về On-Premises.

> **Exam Tip**: Trong kiến trúc Multi-Account, mô hình chuẩn (Centralized DNS) là đặt **1 cặp Inbound + Outbound Endpoints** tại **Shared Services VPC**, liên kết tất cả Private Hosted Zones (PHZ) vào Shared Services VPC để On-Premises phân giải qua Inbound Endpoint, và chia sẻ **Forwarding Rules qua AWS RAM** để các Spoke VPC phân giải tên miền On-Premises.

---

## 4. AWS PrivateLink vs. Amazon VPC Lattice vs. VPC Peering

| Đặc điểm | VPC Peering | AWS PrivateLink | Amazon VPC Lattice |
| :--- | :--- | :--- | :--- |
| **Layer** | Layer 3 (IP Routing) | Layer 4 (TCP/UDP via NLB/GWLB) | **Layer 7** (HTTP/HTTPS, gRPC) |
| **Overlapping CIDR** | **Không hỗ trợ** | **Hỗ trợ hoàn toàn** | **Hỗ trợ hoàn toàn** (IPv4 & IPv6) |
| **Hướng kết nối** | Hai chiều (Bidirectional) | Một chiều (Consumer → Provider) | Service-to-service qua Service Network |
| **Auth & Routing** | SG / NACL | Endpoint Policy / SG | **IAM Auth Policy** (SigV4), Weighted routing (Blue/Green, Canary), TLS |
| **Quy mô** | Phức tạp khi nhiều VPC (không transitive) | Hàng nghìn Consumer VPCs | Hàng nghìn microservices across VPCs & Accounts không cần TGW |

```bash
# Kiểm tra trạng thái BGP và Prefix quảng bá qua Direct Connect Gateway bằng AWS CLI
aws directconnect describe-direct-connect-gateway-associations \
  --direct-connect-gateway-id dxgw-0123456789abcdef0
```

---

[← Bài trước](05-ipv6-dual-stack-ipam-prefix-lists.md) | [Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/06-bgp-dx-vpn-routing.md) | [Bài tiếp →](07-dnssec-route53-traffic-flow-private-dns.md)
