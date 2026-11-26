# Gateway Load Balancer (GWLB), GENEVE & Centralized Inspection

Trong các doanh nghiệp lớn, yêu cầu kiểm tra lưu lượng (Deep Packet Inspection, IDS/IPS, Next-Gen Firewall từ Palo Alto, Fortinet, Check Point hoặc Suricata) đòi hỏi khả năng scale ngang và tính sẵn sàng cao mà không phá vỡ địa chỉ IP gốc của gói tin. **AWS Gateway Load Balancer (GWLB)** giải quyết bài toán này ở **Layer 3 (Gateway)** bằng giao thức **GENEVE**.

## 1. Kiến trúc GWLB & Giao thức GENEVE (UDP 6081)

GWLB kết hợp vai trò của Transparent Network Gateway (Layer 3) và Load Balancer:
- **Bump-in-the-wire**: GWLB không terminate kết nối TCP/UDP mà forward nguyên vẹn gói tin IP (giữ nguyên Source IP và Destination IP ban đầu).
- **GENEVE Encapsulation (UDP Port 6081)**: GWLB đóng gói gói tin gốc vào header GENEVE (chứa Flow Cookie / 5-tuple metadata) trước khi gửi tới Target Group chứa các Firewall Appliances. Appliance giải mã GENEVE, kiểm tra gói tin (Allow/Drop), rồi đóng gói lại GENEVE trả về GWLB qua cùng UDP port 6081.
- **Sticky Flow (5-tuple / 3-tuple)**: GWLB đảm bảo cả chiều đi và chiều về của một flow đi qua **cùng một Firewall Appliance** (stateful inspection).
- **Cross-Zone Load Balancing**: Mặc định **tắt** trên GWLB (nên bật hoặc thiết kế Endpoint + Appliance theo từng AZ để tối ưu latency và chi phí cross-AZ).

```text
[Client/TGW] ---> [GWLB Endpoint (GWLBE)] ===(PrivateLink)===> [GWLB] ===(GENEVE UDP 6081)===> [Firewall Appliance]
                                                                 ^                                     |
                                                                 +========(GENEVE UDP 6081)============+
```

> **Exam Tip**: Security Group gắn vào Firewall Appliance trong Target Group của GWLB bắt buộc phải cho phép **UDP port 6081** từ IP của GWLB (hoặc CIDR subnet chứa GWLB) cho cả **Inbound** (nhận traffic) và **Health Check** (TCP/HTTP/HTTPS tới port health check của appliance).

## 2. Gateway Load Balancer Endpoint (GWLBE) & Asymmetric Routing

**GWLBE** là một VPC Endpoint kiểu `GatewayLoadBalancer` (dựa trên AWS PrivateLink). Bạn đặt GWLBE vào subnet định tuyến trong Spoke VPC hoặc Inspection VPC, sau đó chỉnh **VPC Route Table** để ép traffic đi qua GWLBE trước khi tới đích.

### Vấn đề Asymmetric Routing trên Transit Gateway & Appliance Mode
Khi triển khai **Centralized Inspection VPC** gắn vào **Transit Gateway (TGW)**:
- TGW mặc định định tuyến theo nguyên tắc **keep traffic in the same AZ** để giảm latency.
- Nếu Spoke A ở `AZ-1` gửi gói tin tới Spoke B ở `AZ-2` qua Inspection VPC: chiều đi TGW đẩy vào ENI của Inspection VPC tại `AZ-1` -> qua GWLBE `AZ-1` -> Firewall `AZ-1` lưu state. Nhưng chiều về từ Spoke B (`AZ-2`), TGW đẩy vào ENI của Inspection VPC tại `AZ-2` -> GWLBE `AZ-2` -> Firewall `AZ-2` **không có state của phiên TCP** -> **DROP gói tin**!
- **Giải pháp bắt buộc**: Bật **`Appliance Mode`** (`--options ApplianceModeSupport=enable`) trên TGW Attachment của Inspection VPC. Khi bật Appliance Mode, TGW dùng thuật toán hash 5-tuple để chọn **cùng một AZ** cho cả chiều đi và chiều về của flow đó.

```bash
# Bật Appliance Mode trên Transit Gateway VPC Attachment của Inspection VPC
aws ec2 modify-transit-gateway-vpc-attachment \
  --transit-gateway-attachment-id tgw-attach-0inspection \
  --options ApplianceModeSupport=enable
```

> **Exam Tip**: Bất cứ khi nào thấy từ khóa *"stateful firewall in a centralized inspection VPC attached to Transit Gateway"*, *"inter-AZ traffic drops"* hoặc *"asymmetric routing"*, hãy kiểm tra ngay **Appliance Mode** trên TGW Attachment của Inspection VPC!

## 3. Ba mô hình Centralized Inspection kinh điển

### Mô hình 1: Centralized East-West Inspection (Spoke-to-Spoke)
- Tất cả Spoke VPC gắn vào `Spoke Route Table` trên TGW, có default route `0.0.0.0/0` (hoặc `10.0.0.0/8`) trỏ tới `Inspection VPC Attachment` (đã bật Appliance Mode).
- `Inspection Route Table` trên TGW nhận traffic trả về từ Inspection VPC và propagate route của từng Spoke VPC để đẩy tới đúng Spoke đích.
- Trong Inspection VPC: TGW ENI Subnet route `0.0.0.0/0` -> `GWLBE` (trong cùng AZ). GWLBE Subnet route `0.0.0.0/0` -> `TGW ENI`.

### Mô hình 2: Centralized Egress Inspection (Spoke -> Internet)
- Inspection VPC đóng vai trò luôn là **Egress VPC** (chứa NAT Gateway + IGW ở Public Subnet).
- Luồng đi: `Spoke VPC` -> `TGW` -> `Inspection TGW ENI` -> `GWLBE` -> `Firewall` -> `GWLBE` -> `NAT Gateway` -> `IGW` -> `Internet`.
- Luồng về: `IGW` -> `NAT Gateway` (dùng **Ingress Routing** gắn Route Table vào IGW hoặc subnet NAT Gateway trỏ CIDR Spoke về `GWLBE`) -> `Firewall` -> `TGW` -> `Spoke VPC`.

### Mô hình 3: Centralized Ingress Inspection (Internet -> ALB/Workload)
- **Distributed Ingress với GWLBE**: Đặt IGW tại Edge/Workload VPC, gắn **Edge Route Table** trực tiếp vào **Internet Gateway (IGW Ingress Routing)** để ép traffic từ Internet vào `ALB` phải đi vòng qua `GWLBE` trước:
  - IGW Route Table: `<Public/ALB Subnet CIDR>` -> `gwlbe-az1`.
  - GWLBE Subnet Route Table: `0.0.0.0/0` -> `igw-xxxx` (chiều ra), `<ALB Subnet CIDR>` -> `local`.
  - ALB Subnet Route Table: `0.0.0.0/0` -> `gwlbe-az1` (chiều về bắt buộc đi qua cùng GWLBE để giữ symmetric!).

| Mô hình | Thành phần cốt lõi | Lưu ý Route Table quan trọng |
| :--- | :--- | :--- |
| **East-West** | TGW + Inspection VPC + GWLB/GWLBE | Bật **Appliance Mode** trên TGW Attachment của Inspection VPC |
| **Centralized Egress** | TGW + Inspection VPC + NAT GW + IGW | NAT GW subnet trỏ CIDR Spoke về GWLBE để kiểm tra cả chiều về |
| **Ingress Inspection** | IGW Edge Association + GWLBE + ALB | Dùng **IGW Ingress Routing** trỏ Subnet CIDR của ALB về GWLBE |

> **Exam Tip**: **AWS Network Firewall** thực chất được xây dựng dựa trên kiến trúc GWLB/GWLBE ở bên dưới, nên mọi nguyên tắc **IGW Ingress Routing**, **Appliance Mode** trên TGW và **symmetric routing theo từng AZ** đều áp dụng tương tự cho cả GWLB và AWS Network Firewall!

---

[← Bài trước](10-vpc-flow-logs-traffic-mirroring.md) | [Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/11-gwlb-centralized-inspection.md) | [Bài tiếp →](12-network-security-inspection.md)
