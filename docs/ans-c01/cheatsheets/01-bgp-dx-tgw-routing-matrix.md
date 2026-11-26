# Cheatsheet 1: BGP, Direct Connect & Transit Gateway Routing Matrix

Tài liệu tra cứu nhanh cho các quyết định định tuyến, giới hạn dịch vụ và bảng so sánh trọng yếu trong Domain 1 & Domain 2 của **ANS-C01**.

---

## 1. Thứ tự Ưu tiên Chọn đường (AWS → On-Premises)

| Thứ tự | Tiêu chí | Ghi chú thi cử |
| :---: | :--- | :--- |
| **1** | **Longest Prefix Match (LPM)** | `/25` luôn thắng `/24`, bất kể Static, DX hay VPN |
| **2** | **Static Route vs. Propagated** | Static route (VGW/TGW) luôn thắng BGP Propagated cùng prefix |
| **3** | **Direct Connect vs. Site-to-Site VPN** | Cùng prefix length: **DX luôn thắng VPN** |
| **4** | **BGP Local Preference (Community)** | `7224:7300` (High) > `7224:7200` (Medium/Default) > `7224:7100` (Low) |
| **5** | **Shortest AS_PATH** | Dùng **AS_PATH Prepending** trên đường Backup |
| **6** | **Lowest MED** | Chỉ so sánh khi nhận từ **cùng Neighbor ASN** |

---

## 2. Direct Connect BGP Communities & Quotas

### BGP Communities
| Community Tag | Loại VIF | Ý nghĩa |
| :--- | :--- | :--- |
| `7224:7100` / `7200` / `7300` | Private / Transit VIF | Local Preference: Low / Medium (Default) / High |
| `7224:9100` | Public VIF | Quảng bá prefix chỉ trong **Local AWS Region** |
| `7224:9200` | Public VIF | Quảng bá trong **cùng lục địa (Continent)** |
| `7224:9300` | Public VIF | Quảng bá **Global** (toàn bộ AWS Public Regions) |
| `no-export` | Public VIF | Không quảng bá ra ngoài AWS AS (`7224`) |

### Direct Connect Quotas & Limits cần thuộc lòng
- **Max BGP routes từ On-Premises lên Private/Transit VIF**: **100 routes** (vượt quá → drop BGP session!).
- **Max BGP routes từ On-Premises lên Public VIF**: **1,000 routes**.
- **Max Allowed Prefixes từ DXGW → TGW Association**: **200 prefixes**.
- **Max VGWs per DXGW**: **20** | **Max TGWs per DXGW**: **6** (lưu ý giới hạn có thể điều chỉnh, con số chuẩn thi là 10-20 VGW / 3-6 TGW).
- **Hosted Connection**: Chỉ **1 VIF duy nhất**, **không hỗ trợ LAG**; Transit VIF yêu cầu băng thông **≥ 1 Gbps**.
- **BFD Default**: Interval `300 ms`, Multiplier `3` → Failover **< 1 giây** (so với BGP hold timer 90s).
- **MTU chuẩn**: VPC Internal = `9001`, TGW = `8500`, DX Private/Transit VIF = `8500` (Jumbo) hoặc `1500`, DX Public VIF = `1500`, Site-to-Site VPN = `1446` (TCP MSS = `1379`).

---

## 3. Ma trận Lựa chọn Kiến trúc Kết nối

| Yêu cầu bài toán | Dịch vụ / Giải pháp chuẩn |
| :--- | :--- |
| Multi-Region global WAN với quản trị phân đoạn (Segments) tập trung | **AWS Cloud WAN** |
| Hub-and-Spoke trong 1 Region, hoặc cần **IP Multicast (IGMPv2)** | **AWS Transit Gateway (TGW)** |
| Tăng băng thông Site-to-Site VPN vượt 1.25 Gbps | **TGW + ECMP** (nhiều VPN connections) |
| Truy cập dịch vụ giữa 2 VPC bị **Overlapping CIDR** (Layer 4) | **AWS PrivateLink** (NLB + Endpoint Service) |
| Microservices Layer 7 (HTTP/gRPC) đa VPC/Account có IAM Auth & Canary | **Amazon VPC Lattice** |
| 2 VPC bị Overlapping CIDR cần kết nối hai chiều qua TGW | **Private NAT Gateway** + RFC 6598 (`100.64.0.0/10`) |
| Ứng dụng Non-HTTP (TCP/UDP, Gaming, VoIP) cần Static Anycast IP & Failover nhanh | **AWS Global Accelerator** |
| Ứng dụng HTTP/HTTPS cần Edge Caching, TLS offload, Lambda@Edge | **Amazon CloudFront** |
| Workload IPv6-only trong VPC cần gọi endpoint IPv4-only | **DNS64 + NAT64** (trên NAT Gateway) |
| Chặn inbound Internet cho IPv6 nhưng cho phép outbound | **Egress-Only Internet Gateway (EIGW)** |

---

[Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md)
