# Bài 8: Direct Connect Resiliency (LAG, MACsec, Resiliency Toolkit) & Transit Gateway Multicast

Trong kỳ thi **AWS Certified Advanced Networking - Specialty (ANS-C01)**, việc thiết kế kết nối **AWS Direct Connect (DX)** đạt độ sẵn sàng cao (High Availability), bảo mật ở tầng vật lý/Layer 2 và triển khai **Multicast** trên đám mây là những chủ đề phân loại thí sinh trình độ chuyên gia. Bài học này đi sâu vào **Direct Connect Resiliency Toolkit**, **Link Aggregation Group (LAG)**, **MACsec**, và **AWS Transit Gateway Multicast**.

---

## 1. AWS Direct Connect Resiliency Toolkit

AWS cung cấp **Resiliency Toolkit** trong console Direct Connect để hướng dẫn khách hàng thiết kế kiến trúc đạt đúng **SLA** (Service Level Agreement) mong muốn.

| Mô hình (Model) | Số lượng DX Locations | Số lượng Connections | Mục tiêu SLA & Khả năng chịu lỗi | Use Case phù hợp |
| :--- | :--- | :--- | :--- | :--- |
| **Development and Test** | **1** Location | **2** Connections (tới 2 thiết bị AWS khác nhau tại 1 location) | Không có SLA 99.9%+; chịu được lỗi thiết bị/cổng đơn lẻ nhưng **không chịu được lỗi toàn bộ DX Location** | Môi trường Dev/Test, non-critical workloads |
| **High Resiliency** | **2** Locations | **2** Connections (mỗi location 1 connection) | Đạt **99.9% SLA**; chịu được lỗi mất điện/đứt cáp tại 1 DX Location | Production workloads thông thường |
| **Maximum Resiliency** | **2** Locations | **4** Connections (mỗi location 2 connections tới 2 thiết bị riêng biệt) | Đạt **99.99% SLA**; chịu được đồng thời lỗi 1 DX Location **và** lỗi 1 thiết bị/router ở location còn lại | Mission-critical workloads (tài chính, ngân hàng, y tế) |

> **Exam Tip**: Hãy nhớ con số SLA chính xác cho kỳ thi ANS-C01:
> - **High Resiliency** (2 locations, tối thiểu 2 connections) = **99.9% SLA**.
> - **Maximum Resiliency** (2 locations, tối thiểu 4 connections) = **99.99% SLA**.
> - Mọi mô hình chỉ dùng **1 DX Location** (kể cả có nhiều connections hay LAG) **không bao giờ** đạt được 99.9% SLA vì vẫn tồn tại Single Point of Failure ở cấp độ Location.

---

## 2. Link Aggregation Group (LAG) trên Direct Connect

**Link Aggregation Group (LAG)** cho phép gộp nhiều kết nối **Dedicated Connections** (cùng tốc độ, tại cùng 1 DX Location, kết nối tới cùng 1 DX endpoint) thành một kết nối logic duy nhất sử dụng giao thức **LACP (Link Aggregation Control Protocol - IEEE 802.3ad)**.

### 2.1. Đặc điểm kỹ thuật & Giới hạn quan trọng
- **Chế độ hoạt động**: **Active / Active** (cân bằng tải traffic qua tất cả các link thành viên; không hỗ trợ Active/Standby theo kiểu LACP passive-only nếu muốn tận dụng băng thông, nhưng hỗ trợ failover tự động khi 1 port đứt).
- **Điều kiện đồng nhất**: Tất cả các connection trong một LAG phải có **cùng băng thông (port speed)** và kết thúc tại **cùng một AWS Direct Connect endpoint**.
- **Số lượng port tối đa trong một LAG**:
  - **1 Gbps và 10 Gbps**: Tối đa **4 connections** trong một LAG (tổng băng thông tối đa 40 Gbps).
  - **100 Gbps**: Tối đa **2 connections** trong một LAG (tổng băng thông tối đa 200 Gbps). *(Lưu ý: Một số tài liệu/bài thi cũ có thể nhắc giới hạn 4 ports cho 1G/10G và 2 ports cho 100G; đối với Hosted Connections, LAG **không được hỗ trợ**).*
- **Minimum Links Threshold**: Bạn có thể cấu hình số lượng link tối thiểu hoạt động (`minimum-links`). Nếu số link sống giảm xuống dưới ngưỡng này, toàn bộ LAG sẽ chuyển sang trạng thái DOWN để ép traffic failover sang đường dự phòng khác (ví dụ: sang DX Location thứ 2 hoặc Site-to-Site VPN) nhằm tránh nghẽn cổ chai.

### 2.2. Lưu ý về thiết kế High Availability với LAG
- Vì tất cả các cổng trong một LAG đều cắm vào **cùng một thiết bị router của AWS** tại **cùng một DX Location**, nên **LAG chỉ cung cấp port-level redundancy và tăng băng thông**, **KHÔNG** cung cấp device-level redundancy hay location-level redundancy.
- Muốn đạt High/Maximum Resiliency, bạn vẫn phải tạo **ít nhất 2 LAG** ở **2 DX Locations khác nhau** (hoặc trên 2 thiết bị khác nhau).

> **Exam Tip**: Nếu câu hỏi yêu cầu **gộp băng thông từ 10 Gbps lên 30 Gbps** mà vẫn quản lý qua **một Virtual Interface (VIF) duy nhất** → chọn **Direct Connect LAG**. Nếu câu hỏi yêu cầu **tối đa hóa SLA (99.99%)** → không chỉ dùng 1 LAG, mà phải triển khai **đa DX Location**.

---

## 3. Bảo mật tầng 2 với MACsec (IEEE 802.1AE)

Theo mặc định, **AWS Direct Connect không mã hóa dữ liệu** khi đi qua đường truyền vật lý (fiber) giữa router của khách hàng và AWS Direct Connect endpoint. Trước đây, để mã hóa, khách hàng phải chạy **IPsec VPN** phía trên Direct Connect (tạo overhead, giảm MTU, giới hạn băng thông 1.25 Gbps mỗi tunnel).

**MACsec (Media Access Control Security - IEEE 802.1AE)** giải quyết triệt để vấn đề này ở **Layer 2 (Data Link Layer)**:

- **Cơ chế**: Mã hóa **hop-by-hop** (từng chặng vật lý) trực tiếp trên phần cứng giữa thiết bị router của khách hàng (Customer Router) và thiết bị AWS Direct Connect endpoint.
- **Ưu điểm vượt trội**: Đạt **line-rate encryption** (mã hóa ở tốc độ tối đa của đường truyền **10 Gbps** hoặc **100 Gbps**) với độ trễ gần như bằng không, không làm tốn CPU hay giảm băng thông như IPsec.
- **Điều kiện áp dụng (Bắt buộc nhớ cho kỳ thi)**:
  1. Chỉ hỗ trợ trên **Dedicated Connections** tốc độ **10 Gbps** và **100 Gbps** (KHÔNG hỗ trợ 1 Gbps, KHÔNG hỗ trợ Hosted Connections).
  2. Thiết bị của khách hàng (Customer Router) phải hỗ trợ **MACsec (802.1AE)** và **MKA (MACsec Key Agreement)** với thuật toán **AES-GCM-128** hoặc **AES-GCM-256**.
  3. **Quản lý khóa (CKN / CAK)**: Sử dụng **AWS Secrets Manager** để lưu trữ **Connectivity Association Key Name (CKN)** và **Connectivity Association Key (CAK)** phục vụ bắt tay MKA và xoay vòng khóa (key rotation) không gián đoạn kết nối.
- **Giới hạn phạm vi mã hóa**: MACsec chỉ mã hóa đoạn kết nối vật lý từ **Customer Router tới AWS DX Endpoint**. Traffic đi sâu vào bên trong mạng lõi AWS (AWS Backbone) đã được AWS bảo vệ và mã hóa tự động giữa các hạ tầng vật lý. Nếu khách hàng yêu cầu **end-to-end encryption** từ ứng dụng on-prem tới tận EC2 instance, vẫn cần **TLS** (Layer 7/4) hoặc **IPsec** (Layer 3).

```
[Customer Router] ═══(MACsec Layer 2: 10G/100G)═══► [AWS DX Endpoint] ───(AWS Backbone)───► [VPC / EC2]
        ▲
   CKN / CAK lưu trong
   AWS Secrets Manager
```

> **Exam Tip**:
> - Đề bài yêu cầu **"mã hóa toàn bộ traffic trên đường truyền Direct Connect 10 Gbps / 100 Gbps với line-rate throughput (không bị giới hạn băng thông 1.25 Gbps của IPsec)"** → chọn **MACsec trên Dedicated Connection**.
> - Nếu đề bài dùng **Hosted Connection** (mua qua APN Partner) và cần mã hóa trên DX → **không thể dùng MACsec**, phải dùng **IPsec VPN over Direct Connect** (qua Public VIF tới AWS Site-to-Site VPN hoặc tới Transit Gateway / EC2).

---

## 4. AWS Transit Gateway Multicast

Mặc định, AWS VPC **không hỗ trợ native Layer 2/Layer 3 Multicast** (chỉ hỗ trợ Unicast). Để chạy các ứng dụng truyền phát một-nhiều (1-to-many) như **phân phối dữ liệu chứng khoán/tài chính (market data feeds)**, **video streaming nội bộ**, hay **IoT telemetry**, bạn phải sử dụng **AWS Transit Gateway (TGW) Multicast**.

### 4.1. Kiến trúc Transit Gateway Multicast
- **Multicast Domain**: Là một miền định tuyến multicast độc lập được tạo trên Transit Gateway (lưu ý: phải bật tùy chọn `MulticastSupport: enable` **ngay lúc tạo mới Transit Gateway**, không thể bật bổ sung cho TGW đã tạo sẵn).
- **Subnet Association**: Bạn gắn các **VPC Subnets** (chứa nguồn phát - Multicast Sources và thiết bị nhận - Multicast Receivers/Members) vào Multicast Domain.
- **Lưu ý về Nitro System**: Các EC2 instances tham gia gửi/nhận multicast traffic trên TGW **phải là Nitro-based instances** (hỗ trợ ENA).

### 4.2. Hai chế độ quản lý thành viên: IGMPv2 vs. Static Sources/Members

| Tiêu chí | Dynamic Membership (IGMPv2) | Static Sources & Members |
| :--- | :--- | :--- |
| **Cơ chế hoạt động** | EC2 Receivers tự gửi gói tin **IGMPv2 Join/Leave** để đăng ký nhận hoặc rời khỏi nhóm Multicast (`224.0.0.0/4`) | Quản trị viên cấu hình tĩnh (bằng Console/CLI/Terraform) **ENI ID** của Source và Receiver thuộc về **Multicast Group IP** nào |
| **Tính linh hoạt** | Cao — ứng dụng tự động tham gia/rời nhóm động | Thấp hơn — phải cập nhật cấu hình TGW khi thêm/bớt EC2 |
| **Use case** | Các ứng dụng doanh nghiệp chuẩn đã tích hợp sẵn giao thức IGMPv2 | Các ứng dụng legacy không hỗ trợ IGMPv2, hoặc môi trường cần kiểm soát chặt chẽ ai được phép gửi/nhận |
| **Cấu hình trên Domain** | Bật `Igmpv2Support: enable` khi tạo Multicast Domain | Tắt `Igmpv2Support` (mặc định) và dùng lệnh `register-transit-gateway-multicast-group-sources` / `members` |

### 4.3. Hạn chế quan trọng của TGW Multicast (Exam Traps)
1. **Không hỗ trợ liên kết xuyên Region / On-Premises trực tiếp qua TGW Peering hay DX**:
   - TGW Multicast chỉ hoạt động **trong phạm vi một AWS Region** (giữa các VPC gắn vào cùng một Transit Gateway).
   - **Không hỗ trợ** truyền native multicast packet qua **Direct Connect Gateway**, **Site-to-Site VPN**, hay **Inter-Region TGW Peering**.
   - *Giải pháp cho Hybrid Multicast*: Nếu cần đưa dữ liệu multicast từ on-premises lên AWS (hoặc ngược lại), phải dùng **GRE Tunnel** hoặc **IPsec/Software Router (như Cisco CSR / VyOS)** trên EC2 để đóng gói (encapsulate) multicast packet thành unicast đi qua Direct Connect, sau đó giải nén vào TGW Multicast Domain.
2. **Same-Subnet Multicast**: Lưu lượng multicast gửi từ một EC2 tới các EC2 khác **trong cùng một Subnet** vẫn đi qua Transit Gateway (hairpinning) hoặc cần cấu hình đúng nhóm để TGW nhân bản gói tin.

> **Exam Tip**:
> - Bạn **không thể** bật Multicast trên một Transit Gateway đã tồn tại; bắt buộc phải **tạo TGW mới** với `MulticastSupport=enable`.
> - Nếu đề bài hỏi cách **nhân bản dữ liệu thị trường tài chính (UDP multicast) từ on-premises qua Direct Connect vào nhiều VPC trên AWS**, đáp án KHÔNG thể là "cấu hình TGW Multicast trực tiếp qua DX VIF", mà phải là **sử dụng EC2/virtual appliance làm GRE/IPsec tunnel endpoint** để truyền qua DX rồi bơm vào **Transit Gateway Multicast Domain**.

---

[← Bài trước](02-hybrid-edge-design.md) | [Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/03-dx-resiliency-lag.md) | [Bài tiếp →](04-edge-cloudfront-global-accelerator.md)
