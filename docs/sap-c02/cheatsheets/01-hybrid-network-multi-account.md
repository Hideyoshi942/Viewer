# Cheatsheet: Hybrid Networking & Multi-Account Governance

## 1. Bảng Quyết định Kết nối Mạng Lai (Hybrid Connectivity)

| Yêu cầu trong đề bài | Giải pháp AWS tối ưu |
| :--- | :--- |
| Kết nối 50+ VPCs ở nhiều accounts + On-premises | **AWS Transit Gateway (TGW)** + chia sẻ TGW qua **AWS RAM** |
| Kết nối 1 Direct Connect tới nhiều VPCs ở **nhiều Region** | **Direct Connect Gateway (DXGW)** + **Transit VIF** → TGW ở từng Region |
| Mã hóa traffic đi qua Direct Connect (cổng 1Gbps hoặc mọi cổng) | **Site-to-Site VPN chạy qua Direct Connect Public VIF** (hoặc Transit VIF + IPsec) |
| Mã hóa Layer 2 trên Direct Connect 10Gbps/100Gbps Dedicated | **MACsec** (Point-to-Point giữa thiết bị khách hàng và AWS DX router) |
| SLA 99.99% (Maximum Resiliency) cho Direct Connect | ≥ 2 DX Locations, ≥ 2 Dedicated Connections mỗi location (tổng ≥ 4 connections) |
| Kiểm tra toàn bộ traffic East-West & Egress tập trung | **Inspection VPC** với **AWS Network Firewall** + bật **Appliance Mode** trên TGW Attachment |
| Giảm chi phí Data Transfer giữa nhiều account cùng tổ chức | **VPC Sharing qua AWS RAM** (dùng chung subnet, không đi qua TGW/Peering) |
| Kết nối private tới 1 dịch vụ SaaS/tài khoản khác **có dải CIDR trùng nhau** | **AWS PrivateLink** (NLB + VPC Endpoint Service → Interface VPC Endpoint) |

---

## 2. Route 53 Hybrid DNS — Nhớ Nhanh Trong 5 Giây

- **Inbound Endpoint**: Traffic đi **VÀO AWS** (On-Premises DNS Server → Conditional Forwarder → Inbound Endpoint ENI → Route 53 Private Hosted Zone).
- **Outbound Endpoint + Forwarding Rules**: Traffic đi **RA On-Premises** (EC2 trong VPC → Route 53 Resolver → Outbound Endpoint ENI → On-Premises DNS Server).
- **Multi-Account Best Practice**: Tạo Outbound Endpoint tập trung tại Network/Shared Services Account và chia sẻ **Forwarding Rules** qua **AWS RAM** (không chia sẻ endpoint, chỉ chia sẻ Rules).

---

## 3. AWS Organizations, SCP & Control Tower

| Khái niệm | Quy tắc vàng phải nhớ |
| :--- | :--- |
| **SCP Effect** | Chỉ là **guardrail (giới hạn tối đa)**, KHÔNG cấp quyền. Vẫn phải có IAM `Allow`. |
| **Ngoại lệ của SCP** | **KHÔNG** áp dụng cho Management Account và **KHÔNG** chặn Service-Linked Roles. |
| **Region Deny SCP** | Bắt buộc dùng `NotAction` cho các dịch vụ Global (`iam:*`, `sts:*`, `route53:*`, `cloudfront:*`, `organizations:*`, `support:*`). |
| **AWS Control Tower** | Tự động hóa Landing Zone: Preventive Guardrails = **SCP**, Detective Guardrails = **AWS Config Rules**, Proactive Guardrails = **CloudFormation Hooks**. |
| **Delegated Administrator** | Ủy quyền vận hành GuardDuty, Security Hub, Config, StackSets, Firewall Manager, IPAM cho **Security/Network Account** thay vì chạy ở Management Account. |

> **Exam Tip**: Nếu đề bài hỏi cách **ngăn chặn thành viên xóa CloudTrail log hoặc thay đổi VPC Flow Logs** ở toàn bộ member accounts → dùng **SCP** gắn vào Root hoặc OU (không dùng IAM Permission Boundary vì admin trong member account có thể tự tạo role mới không gắn boundary nếu không bị giới hạn kỹ).

---

[Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md)
