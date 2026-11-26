# Bài tập tình huống — Chủ đề 6: Edge & Hybrid Compute — AWS Outposts, Local Zones, Wavelength & License Manager

> Chạy AWS workloads tại on-premises với AWS Outposts, ultra-low latency với Local Zones/Wavelength và quản lý BYOL với AWS License Manager.
> **Số câu hỏi:** 3 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A hospital network runs real-time MRI image reconstruction software that requires sub-2-millisecond network latency to physical MRI scanners inside its campus data center and strict local data residency so raw patient scans never leave the hospital premises. At the same time, the IT team wants to manage the compute and storage infrastructure using standard AWS APIs, Amazon EC2, Amazon EBS, and Amazon EKS control planes. Which AWS hybrid infrastructure service meets these requirements?

- **A.** Deploy an AWS Outposts rack on-premises connected via Local Gateway (LGW) to run EC2/EKS worker nodes with local EBS and S3 on Outposts.
- **B.** Provision EC2 GPU instances in the nearest AWS Region and connect the hospital data center over a redundant 10 Gbps AWS Direct Connect link.
- **C.** Use AWS Snowcone edge devices connected directly to the MRI scanners and physically ship the encrypted devices to AWS every night.
- **D.** Deploy the real-time MRI image reconstruction software in an AWS Wavelength Zone embedded inside a 5G carrier network.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một mạng lưới bệnh viện vận hành phần mềm tái tạo ảnh MRI theo thời gian thực, yêu cầu độ trễ mạng dưới 2 mili-giây tới các máy quét MRI vật lý bên trong trung tâm dữ liệu trong khuôn viên bệnh viện và yêu cầu lưu trú dữ liệu tại chỗ nghiêm ngặt để ảnh quét thô của bệnh nhân không bao giờ rời khỏi cơ sở bệnh viện. Đồng thời, đội ngũ CNTT muốn quản lý hạ tầng compute và lưu trữ bằng các API AWS tiêu chuẩn, control plane của Amazon EC2, Amazon EBS và Amazon EKS. Dịch vụ hạ tầng hybrid AWS nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **A**

**AWS Outposts** là lựa chọn duy nhất khi bài toán kết hợp cả 3 yếu tố: **độ trễ siêu thấp tới thiết bị on-premises**, **ràng buộc data residency ngay trong tòa nhà khách hàng**, và **trải nghiệm AWS API/EC2/EKS đồng nhất**.

- **A (Đúng):** Chính xác. AWS Outposts Rack đặt phần cứng được AWS quản lý trực tiếp ngay trong data center của bệnh viện, cung cấp độ trễ dưới 2ms tới máy quét MRI qua Local Gateway (LGW), đảm bảo dữ liệu thô lưu cục bộ (data residency) trên EBS/S3 on Outposts mà vẫn dùng chung API và control plane của AWS.
- **B:** Đưa ảnh MRI thô lên AWS Region vi phạm yêu cầu lưu trữ dữ liệu tại chỗ (local data residency) không được rời khỏi khuôn viên bệnh viện và khó đảm bảo độ trễ dưới 2ms.
- **C:** Snowcone dùng cho môi trường biên ngắt kết nối (disconnected edge) và không cung cấp hạ tầng EC2/EKS/EBS đồng bộ liên tục với AWS API trong data center bệnh viện.
- **D:** AWS Wavelength Zone đặt tại hạ tầng nhà mạng viễn thông 5G cho thiết bị di động, không nằm trong khuôn viên data center của bệnh viện nên không đáp ứng yêu cầu dữ liệu không rời khỏi cơ sở y tế.

</details>

### Câu 2 `medium`

A visual effects studio in Los Angeles is migrating its interactive 3D rendering workstations from an on-premises facility to AWS. Artists require single-digit millisecond latency from the Los Angeles metropolitan area to GPU-accelerated EC2 instances, while the nearest AWS Region (us-west-1 or us-west-2) introduces 25-40 ms of round-trip latency. The studio does not want to lease physical rack space or maintain any on-premises hardware. Which AWS infrastructure option should the architect select?

- **A.** Deploy an AWS Outposts 42U rack inside the Los Angeles studio office and manage the physical hardware lifecycle on-premises.
- **B.** Extend the studio's VPC in us-west-2 by creating a subnet in the Los Angeles AWS Local Zone and launch the GPU EC2 instances in that Local Zone subnet.
- **C.** Place an Amazon CloudFront distribution with Origin Shield in front of the GPU rendering workstations running in us-west-2.
- **D.** Enable AWS Global Accelerator with static Anycast IP addresses in front of an Application Load Balancer in us-west-2 for all Los Angeles artist workstations.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một studio hiệu ứng hình ảnh tại Los Angeles đang di chuyển các máy trạm kết xuất 3D tương tác từ cơ sở on-premises lên AWS. Các nghệ sĩ yêu cầu độ trễ mức một chữ số mili-giây từ khu vực đô thị Los Angeles tới các EC2 instance tăng tốc GPU, trong khi AWS Region gần nhất (us-west-1 hoặc us-west-2) có độ trễ khứ hồi 25-40 ms. Studio không muốn thuê không gian rack vật lý hoặc bảo trì bất kỳ phần cứng on-premises nào. Kiến trúc sư nên chọn tùy chọn hạ tầng AWS nào?

**Đáp án đúng:** **B**

Phân biệt bộ ba Edge/Hybrid của AWS: **AWS Outposts** (đặt ngay trong data center khách hàng), **AWS Local Zones** (đặt tại đô thị lớn gần người dùng cuối mà không cần quản lý phần cứng), và **AWS Wavelength** (đặt trong mạng 5G nhà mạng viễn thông).

- **A:** Đề bài nêu rõ studio không muốn thuê không gian rack vật lý hay duy trì hạ tầng phần cứng on-premises, nên Outposts không phù hợp.
- **B (Đúng):** Chính xác. AWS Local Zones đặt hạ tầng compute, storage và database của AWS ngay tại các đô thị lớn (như Los Angeles, Boston, Miami...) mà không có AWS Region, cho phép đạt độ trễ một chữ số mili-giây (single-digit ms) mà không cần thuê rack hay vận hành phần cứng on-premises như Outposts.
- **C:** CloudFront là mạng CDN phân phối nội dung web/HTTP, không thể giảm độ trễ mạng xuống dưới 10ms cho phiên kết nối tương tác trực tiếp tới máy trạm 3D GPU.
- **D:** Global Accelerator tối ưu đường đi qua AWS backbone nhưng vẫn bị giới hạn bởi tốc độ ánh sáng tới us-west-2 (Oregon), không thể giảm độ trễ từ Los Angeles xuống single-digit millisecond như Local Zone đặt ngay tại Los Angeles.

</details>

### Câu 3 `medium`

An automotive technology startup builds a real-time collision avoidance service for connected vehicles operating over 5G mobile networks. Vehicle telemetry must be processed by containerized inference services with ultra-low latency (under 10 ms) without traversing the public internet from the telecom carrier's 5G network to an AWS Region. Which AWS service architecture should be used?

- **A.** Extend the VPC into AWS Wavelength Zones inside the 5G carrier's data centers with a Carrier Gateway and run inference pods on EC2/EKS.
- **B.** Use AWS IoT Greengrass core software running on a single Amazon EC2 instance in us-east-1 over a Site-to-Site VPN connection.
- **C.** Deploy Amazon EKS clusters in an AWS Local Zone and route 5G vehicle telemetry over the public internet through an Internet Gateway.
- **D.** Deploy AWS Lambda@Edge functions at Amazon CloudFront Regional Edge Caches to run real-time containerized collision avoidance inference.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty khởi nghiệp công nghệ ô tô xây dựng dịch vụ tránh va chạm theo thời gian thực cho các phương tiện kết nối hoạt động trên mạng di động 5G. Dữ liệu đo từ xa của xe phải được xử lý bởi các dịch vụ suy luận dạng container với độ trễ cực thấp (dưới 10 ms) mà không đi qua internet công cộng từ mạng 5G của nhà mạng viễn thông tới một AWS Region. Nên sử dụng kiến trúc dịch vụ AWS nào?

**Đáp án đúng:** **A**

**AWS Wavelength Zones** (kết hợp **Carrier Gateway**) là giải pháp duy nhất đặt compute AWS ngay bên trong mạng **5G của nhà mạng viễn thông** để phục vụ xe tự hành, AR/VR di động và game di động thời gian thực mà không đi qua Internet công cộng.

- **A (Đúng):** Chính xác. AWS Wavelength nhúng trực tiếp hạ tầng compute/storage AWS vào rìa mạng 5G của nhà mạng viễn thông (CSP), cho phép lưu lượng từ thiết bị 5G đi thẳng qua Carrier Gateway vào ứng dụng mà không cần nhảy qua Internet công cộng tới AWS Region, đạt độ trễ siêu thấp.
- **B:** Chạy IoT Greengrass trên EC2 ở us-east-1 không giải quyết được vấn đề độ trễ đường truyền mạng từ xe kết nối 5G về AWS Region.
- **C:** Lưu lượng từ mạng 5G tới AWS Local Zone vẫn phải đi qua Internet Gateway/Internet công cộng, tạo thêm số hop mạng và độ trễ cao hơn so với Wavelength nằm ngay trong mạng lõi 5G của nhà mạng.
- **D:** Lambda@Edge chỉ chạy các hàm nhẹ can thiệp HTTP request/response của CloudFront (không hỗ trợ container inference nặng/GPU) và lưu lượng 5G vẫn phải rời mạng nhà mạng ra Internet tới CloudFront PoP.

</details>

---

[Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md)
