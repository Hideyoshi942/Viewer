# Bài 11: Edge & Hybrid Compute — AWS Outposts, Local Zones, Wavelength & License Manager

Trong kỳ thi **AWS Certified Solutions Architect - Professional (SAP-C02)**, các bài toán về **ultra-low latency**, **data residency** (lưu trữ dữ liệu tại chỗ vì quy định pháp lý), **local data processing** và **quản lý bản quyền phần mềm doanh nghiệp (BYOL)** xuất hiện ngày càng nhiều. Để giải quyết đúng, bạn cần phân biệt rạch ròi giữa **AWS Outposts**, **AWS Local Zones**, **AWS Wavelength**, cũng như cách tối ưu hóa chi phí bản quyền với **AWS License Manager** và **AWS Marketplace Private Offers**.

---

## 1. So sánh tổng quan: Outposts vs. Local Zones vs. Wavelength

| Tiêu chí | AWS Outposts | AWS Local Zones | AWS Wavelength |
| :--- | :--- | :--- | :--- |
| **Vị trí vật lý** | Đặt ngay trong **on-premises data center** của khách hàng | Đặt tại các **metropolitan areas** (trung tâm đô thị lớn) do AWS quản lý | Đặt ngay trong **5G telecom carrier data center** (nhà mạng viễn thông) |
| **Đối tượng phục vụ** | Data residency, local processing, kết nối trực tiếp tới hệ thống on-prem cũ | Single-digit millisecond latency cho end-user tại thành phố lớn (gaming, media, fintech) | Ultra-low latency cho thiết bị di động 5G (AR/VR, IoT, xe tự hành, video analytics) |
| **Quản lý hạ tầng** | AWS quản lý phần cứng & control plane; khách hàng lo nguồn điện, làm mát, mạng vật lý | AWS quản lý 100% cơ sở hạ tầng (như một extension của Region) | AWS quản lý Wavelength Zone; nhà mạng quản lý hạ tầng 5G & Carrier Gateway |
| **Kết nối mạng ra ngoài** | **Local Gateway (LGW)** ra mạng on-premises; Service Link về AWS Region | Internet Gateway (IGW) trực tiếp tại Local Zone; kết nối về Parent Region | **Carrier Gateway (CAGW)** ra mạng 5G/Internet; không có IGW thông thường |
| **Lưu trữ S3 tại chỗ** | Có (**S3 on Outposts** với Bucket & Access Points riêng) | Không (dùng S3 ở Parent Region hoặc EBS tại Local Zone) | Không (dùng EBS tại Wavelength Zone, S3 ở Parent Region) |

> **Exam Tip**: Nếu đề bài nhắc đến **"on-premises data residency"** hoặc **"kết nối độ trễ cực thấp với máy móc nhà máy / hệ thống mainframe tại chỗ"** → chọn **AWS Outposts**. Nếu đề bài nói **"người dùng cuối tại một thành phố lớn (không có AWS Region) cần single-digit ms latency mà không muốn tự vận hành phần cứng"** → chọn **AWS Local Zones**. Nếu đề bài nhấn mạnh **"5G mobile users / IoT devices kết nối qua mạng di động"** → chọn **AWS Wavelength**.

---

## 2. Kiến trúc chuyên sâu: AWS Outposts

AWS Outposts mang hạ tầng, dịch vụ và API của AWS đặt trực tiếp tại trung tâm dữ liệu on-premises của doanh nghiệp, kết nối về một **Parent AWS Region** thông qua **Service Link**.

### 2.1. Outposts Rack vs. Outposts Servers

| Đặc điểm | AWS Outposts Rack | AWS Outposts Servers |
| :--- | :--- | :--- |
| **Kích thước** | Tủ rack tiêu chuẩn 42U (1 đến nhiều rack) | Server 1U hoặc 2U (gọn nhẹ) |
| **Môi trường phù hợp** | Data center doanh nghiệp có nguồn điện, làm mát chuẩn | Chi nhánh, cửa hàng bán lẻ, bệnh viện, nhà máy không gian hẹp |
| **Lưu trữ hỗ trợ** | EBS, **S3 on Outposts**, RDS, EKS, ECS, EMR | Instance store (NVMe), không hỗ trợ EBS snapshots/S3 on Outposts như Rack |
| **Kết nối on-prem** | **Local Gateway (LGW)** | **Local Network Interface (LNI)** |

### 2.2. Mạng và Lưu trữ trên Outposts Rack

- **Service Link**: Kết nối VPN mã hóa (qua Direct Connect hoặc Internet) giữa Outposts và Parent Region để đồng bộ control plane, CloudWatch metrics, và truy cập các dịch vụ chỉ có ở Region (như DynamoDB, S3 Region).
- **Local Gateway (LGW)**: Thành phần định tuyến Layer 3 cho phép các EC2 instance trên Outposts giao tiếp trực tiếp với mạng LAN/WAN on-premises với độ trễ microsecond mà không cần vòng qua AWS Region.
  - Hỗ trợ **Customer-Owned IP (CoIP)** pools: gán IP nội bộ của doanh nghiệp cho các workload trên Outposts.
- **S3 on Outposts**: Cung cấp object storage cục bộ ngay trên phần cứng Outposts (sử dụng lớp lưu trữ `OUTPOSTS`).
  - Dữ liệu được mã hóa mặc định bằng SSE-S3 hoặc SSE-C.
  - Sử dụng **S3 Access Points** và **Outposts Bucket** để truy cập dữ liệu cục bộ qua LGW hoặc qua Region VPC.
  - Có thể kết hợp **AWS DataSync** để đồng bộ dữ liệu định kỳ lên S3 ở Parent Region khi cần backup/archiving.

```
[On-Premises LAN / Mainframe]
        ▲
        │ (Local Traffic / CoIP)
        ▼
[Local Gateway (LGW)] ◄──► [Outposts Subnet: EC2, EKS, RDS, S3 on Outposts]
                                        │
                                (Service Link: DX / VPN)
                                        ▼
                            [Parent AWS Region (Control Plane)]
```

> **Exam Tip**: Outposts **phụ thuộc vào Parent Region** cho Control Plane. Nếu **Service Link bị đứt**, các workload đang chạy trên Outposts vẫn tiếp tục hoạt động cục bộ (data plane), nhưng bạn **không thể** chạy API điều khiển mới (như launch EC2 mới hoặc Auto Scaling) và **không thể** truy cập các dịch vụ chỉ nằm ở Region cho đến khi Service Link khôi phục.

---

## 3. AWS Local Zones & AWS Wavelength

### 3.1. AWS Local Zones
- Là một phần mở rộng (extension) của một **AWS Parent Region**, đặt tại các thành phố lớn (ví dụ: Los Angeles, Boston, Bangkok, Hanoi/HCM tùy mở rộng).
- Khi tạo Subnet trong VPC, bạn chỉ cần **opt-in Local Zone** và chọn Availability Zone ID của Local Zone đó.
- Workload tại Local Zone sử dụng **chung VPC, chung Security Group, chung IAM** với Parent Region.
- Hỗ trợ các dịch vụ compute & storage độ trễ thấp: EC2, EBS (`gp2`, `gp3`, `io1`), ECS, EKS, Application Load Balancer (ALB), NAT Gateway, ElastiCache, RDS.
- **Use case điển hình**:
  - Di chuyển ứng dụng từ on-prem lên cloud nhưng database/latency yêu cầu < 10ms tới người dùng tại thành phố đó.
  - Real-time multiplayer gaming, live video transcoding, VDI (Virtual Desktops) cho kỹ sư đồ họa.

### 3.2. AWS Wavelength
- Nhúng trực tiếp hạ tầng AWS compute & storage vào **biên mạng 5G của nhà mạng viễn thông (CSP)**, giúp lưu lượng từ thiết bị 5G đi thẳng tới EC2/EKS trong **Wavelength Zone** mà **không phải đi qua Internet công cộng** (loại bỏ nhiều hop mạng).
- **Carrier Gateway (CAGW)**: Thay thế cho Internet Gateway đối với các Wavelength Subnet. CAGW thực hiện NAT từ VPC IP sang **Carrier IP** (dải IP của nhà mạng cấp cho Wavelength Zone) để giao tiếp với thiết bị 5G.
- Lưu ý: Traffic từ Wavelength Zone đi ra Internet công cộng (nếu cần) phải vòng qua Carrier Gateway hoặc đi về Parent Region.

> **Exam Tip**: Trong VPC có Wavelength Subnet, nếu đề thi hỏi thành phần nào cho phép kết nối hai chiều giữa Wavelength Subnet và thiết bị 5G trên mạng viễn thông, đáp án chính xác là **Carrier Gateway (CAGW)** (không phải Internet Gateway hay Transit Gateway).

---

## 4. Quản lý bản quyền phần mềm: AWS License Manager & Dedicated Hosts

Các doanh nghiệp lớn khi migrate **Windows Server, SQL Server, Oracle Database, SAP** lên AWS thường muốn tận dụng bản quyền hiện có (**BYOL - Bring Your Own License**) để tiết kiệm chi phí thay vì mua License Included từ AWS.

### 4.1. AWS License Manager
Là dịch vụ miễn phí giúp theo dõi, quản lý và thực thi các quy tắc bản quyền phần mềm trên cả **AWS** và **môi trường on-premises**:

1. **License Configurations (Quy tắc bản quyền)**:
   - Theo dõi theo **vCPU**, **Physical Cores**, **Physical Sockets**, hoặc **Instances**.
   - Hỗ trợ **Hard Limit** (chặn launch EC2 mới nếu vượt quá số license cho phép) hoặc **Soft Limit** (chỉ gửi cảnh báo qua SNS/CloudWatch).
2. **Tích hợp với Dedicated Hosts (EC2 Dedicated Hosts)**:
   - Các phần mềm như **Oracle Database** hoặc **SQL Server (BYOL với Software Assurance)** yêu cầu cấp phép theo **Physical Cores / Sockets** của máy chủ vật lý, không cho phép chạy trên shared tenancy EC2.
   - **Host Resource Groups** + **License Manager** tự động hóa việc:
     - Tự động cấp phát (Auto-allocate) Dedicated Host mới khi cần scale.
     - Tự động thu hồi (Auto-release) Dedicated Host khi không còn instance chạy.
     - Hỗ trợ **Host Recovery** (tự động khởi động lại instance trên Dedicated Host khác nếu phần cứng vật lý lỗi).
3. **Automated Discovery**:
   - Kết hợp với **AWS Systems Manager (SSM) Inventory** để tự động quét phần mềm đã cài trên EC2 và on-premises servers, đối chiếu với quy tắc bản quyền.
4. **Cross-Account License Tracking**:
   - Tích hợp với **AWS Organizations** để quản lý tập trung bản quyền từ Management Account hoặc Delegated Administrator cho toàn bộ các Member Accounts.

```json
{
  "Name": "Oracle-EE-Physical-Cores-Rule",
  "LicenseCountingType": "Core",
  "LicenseCount": 64,
  "LicenseCountHardLimit": true,
  "ProductInformationList": [
    {
      "ResourceType": "SSM_MANAGED",
      "ProductInformationFilterList": [
        {
          "ProductInformationFilterName": "Application Name",
          "ProductInformationFilterValue": ["Oracle Database Enterprise Edition"],
          "ProductInformationFilterComparator": "EQUALS"
        }
      ]
    }
  ]
}
```

> **Exam Tip**: Khi đề bài yêu cầu **BYOL theo Physical Socket/Core**, **tự động quản lý Dedicated Hosts khi Auto Scaling**, và **ngăn chặn vi phạm bản quyền (hard limit)** trên nhiều AWS accounts → luôn chọn **AWS License Manager** kết hợp **EC2 Dedicated Hosts (Host Resource Groups)** và **AWS Organizations**.

---

## 5. AWS Marketplace Private Offers & Governance

Khi doanh nghiệp mua phần mềm bên thứ ba (ISV - như Palo Alto, Snowflake, Datadog, Red Hat) qua AWS Marketplace, bài toán SAP-C02 thường xoay quanh **giá ưu đãi, hợp đồng tùy chỉnh, kiểm soát mua sắm và thanh toán tập trung**:

- **AWS Marketplace Private Offers**:
  - Cho phép nhà cung cấp (ISV) hoặc Channel Partner tạo báo giá riêng (**custom pricing**, **custom EULA**, **flexible payment schedule**) chỉ hiển thị cho một AWS Account hoặc toàn bộ **AWS Organization** của khách hàng.
  - Chi phí mua qua Marketplace Private Offer được gộp chung vào hóa đơn AWS hàng tháng (**Consolidated Billing**) và có thể được tính vào cam kết chi tiêu (**EDP - Enterprise Discount Program**) của doanh nghiệp với AWS.
- **Private Marketplace**:
  - Cho phép doanh nghiệp tạo một "cửa hàng nội bộ" chỉ chứa các sản phẩm phần mềm đã được bộ phận Security & Procurement phê duyệt, ngăn nhân viên tự ý deploy phần mềm không đạt chuẩn.
- **Tích hợp AWS Service Catalog & License Manager**:
  - Quản trị viên có thể phân phối license phần mềm mua từ AWS Marketplace (ví dụ: SaaS hoặc AMI-based) tới các Member Accounts thông qua **AWS License Manager** (Marketplace-managed entitlements).

---

## 6. Tóm tắt kiến trúc & Checklist cho kỳ thi SAP-C02

1. **Data residency tại chỗ / Kết nối on-prem microsecond**: **AWS Outposts** + **Local Gateway (LGW)** + **S3 on Outposts**.
2. **Độ trễ < 10ms tại thành phố lớn (không cần quản lý phần cứng)**: **AWS Local Zones**.
3. **Độ trễ cực thấp cho mạng di động 5G**: **AWS Wavelength** + **Carrier Gateway (CAGW)**.
4. **BYOL (Oracle, SQL Server, Windows) theo Core/Socket**: **AWS License Manager** (Hard Limit) + **EC2 Dedicated Hosts** (Host Resource Groups).
5. **Mua phần mềm bên thứ ba với giá thỏa thuận riêng & gộp hóa đơn EDP**: **AWS Marketplace Private Offers** + **Private Marketplace** để kiểm soát danh mục được phép sử dụng.

---

[← Bài trước](05-global-traffic-cloudfront-accelerator.md) | [Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/06-edge-hybrid-compute.md) | [Bài tiếp →](07-enterprise-security-iac-cicd.md)
