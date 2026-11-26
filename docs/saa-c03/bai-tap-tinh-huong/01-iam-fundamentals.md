# Bài tập tình huống — Chủ đề 1: IAM Fundamentals, Roles, Policies & EC2 IMDSv2

> IAM Users, Groups, Roles, Policy Evaluation Logic, Permission Boundaries, STS AssumeRole, EC2 Instance Profiles, Placement Groups & IMDSv2.
> **Số câu hỏi:** 6 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A company is deploying a mission-critical distributed database cluster consisting of 5 Amazon EC2 instances within a single Availability Zone. To minimize the risk of simultaneous hardware failure, the solutions architect must ensure that each of the 5 EC2 instances runs on completely separate underlying physical rack hardware with its own network and power source. Which EC2 Placement Group strategy should be used?

- **A.** Cluster Placement Group
- **B.** Auto Scaling Group without a placement group
- **C.** Spread Placement Group
- **D.** AWS Lambda

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty đang triển khai một cụm cơ sở dữ liệu phân tán quan trọng gồm 5 Amazon EC2 instance trong cùng một Availability Zone. Để giảm thiểu rủi ro hỏng phần cứng đồng thời, solutions architect phải đảm bảo mỗi EC2 instance trong số 5 instance này chạy trên phần cứng rack vật lý hoàn toàn tách biệt với nguồn điện và mạng riêng. Nên sử dụng chiến lược EC2 Placement Group nào?

**Đáp án đúng:** **C**

Nhớ nhanh:
- **Số lượng máy ít (<= 7 máy/AZ) + Cần cô lập phần cứng tuyệt đối (Critical instances)** -> **Spread Placement Group**.
- **Số lượng máy lớn (hàng chục/hàng trăm máy: Hadoop, Cassandra, Kafka) + Cần cô lập theo từng phân vùng rack** -> **Partition Placement Group**.
- **Cần độ trễ mạng cực thấp 10–100 Gbps trong 1 AZ (HPC)** -> **Cluster Placement Group**.

- **A:** Sai vì Cluster Placement Group gom tất cả máy vào CÙNG một Rack vật lý để tối ưu tốc độ mạng, nên nếu Rack đó mất điện thì cả 5 máy sập cùng lúc.
- **B:** Sai vì không có cam kết cứng rằng 5 máy trong cùng 1 AZ sẽ nằm trên 5 Rack khác nhau.
- **C (Đúng):** Đúng! **Spread Placement Group** đặt mỗi máy chủ EC2 trên một Rack phần cứng vật lý hoàn toàn riêng biệt (hỗ trợ tối đa 7 instances trên mỗi AZ cho mỗi nhóm), phù hợp hoàn hảo cho 5 máy chủ cực kỳ quan trọng.
- **D:** Sai vì đề bài yêu cầu chạy cụm 5 máy chủ cơ sở dữ liệu EC2.

</details>

### Câu 2 `medium`

An Amazon EC2 Auto Scaling group scales out based on average CPU utilization. Because each new EC2 instance takes 4 minutes to run its User Data bootstrap script before it can serve traffic, the Auto Scaling group repeatedly triggers additional scale-out actions while the first new instance is still booting, resulting in over-provisioning. What is the BEST way to prevent these premature scale-out events AND speed up instance launch times?

- **A.** Bake a Golden AMI using EC2 Image Builder (or use Auto Scaling Warm Pools) and configure an appropriate Instance Warmup period.
- **B.** Delete the Auto Scaling group and launch 100 EC2 instances manually in advance to avoid scaling delays during traffic spikes.
- **C.** Set the Auto Scaling group default cooldown and instance warmup periods to 0 seconds so new instances scale continuously.
- **D.** Replace the Application Load Balancer with Amazon Route 53 Simple Routing to distribute traffic across uninitialized instances.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một Amazon EC2 Auto Scaling group thực hiện scale out dựa trên mức sử dụng CPU trung bình. Vì mỗi EC2 instance mới mất 4 phút để chạy tập lệnh khởi tạo User Data trước khi có thể phục vụ lưu lượng, Auto Scaling group liên tục kích hoạt thêm các hành động scale-out trong khi instance mới đầu tiên vẫn đang khởi động, dẫn đến cấp phát dư thừa (over-provisioning). Cách TỐT NHẤT để ngăn chặn các sự kiện scale-out sớm này ĐỒNG THỜI tăng tốc thời gian khởi chạy instance là gì?

**Đáp án đúng:** **A**

Trong đề SAA-C03, khi máy EC2 trong ASG **khởi động chậm do cài đặt nhiều phần mềm trong User Data** -> Giải pháp chuẩn là tạo **Golden AMI (EC2 Image Builder)** hoặc dùng **ASG Warm Pools** + chỉnh **Instance Warmup**.

- **A (Đúng):** Đúng! Sử dụng **Golden AMI (EC2 Image Builder)** hoặc **Warm Pools** giúp rút ngắn thời gian khởi động xuống vài chục giây, và cấu hình **Instance Warmup** ngăn Auto Scaling tính chỉ số hoặc kích hoạt thêm máy mới khi máy vừa tạo còn đang khởi động.
- **B:** Sai vì gây lãng phí chi phí và mất tính co giãn tự động.
- **C:** Sai vì đặt Cooldown = 0 giây càng làm hệ thống scale-out liên tục nhanh hơn trong lúc máy mới chưa kịp khởi động xong.
- **D:** Sai vì không giải quyết được thời gian cài đặt User Data hay hành vi của Auto Scaling.

</details>

### Câu 3 `medium`

A high-performance computing (HPC) application runs on 32 Amazon EC2 instances that frequently exchange large datasets with ultra-low network latency and 100 Gbps throughput. Which EC2 Placement Group strategy should be used?

- **A.** Spread Placement Group
- **B.** Cluster Placement Group
- **C.** Partition Placement Group
- **D.** Multi-AZ Auto Scaling Group

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng tính toán hiệu năng cao (HPC) chạy trên 32 Amazon EC2 instance thường xuyên trao đổi các tập dữ liệu lớn với độ trễ mạng cực thấp và thông lượng 100 Gbps. Nên sử dụng chiến lược EC2 Placement Group nào?

**Đáp án đúng:** **B**

**HPC / Tightly-coupled workloads cần mạng 10-100 Gbps độ trễ thấp nhất** → **Cluster Placement Group**.

- **A:** Sai vì Spread Placement Group đặt các máy lên các rack khác nhau và giới hạn tối đa 7 instances/AZ.
- **B (Đúng):** Đúng! **Cluster Placement Group** đặt tất cả các EC2 instances sát nhau trong cùng 1 rack/AZ để đạt băng thông mạng tối đa (lên tới 100 Gbps) và độ trễ thấp nhất cho HPC.
- **C:** Sai vì Partition Placement Group dùng để tách cụm dữ liệu lớn (Hadoop, Cassandra, Kafka) ra các rack độc lập nhằm giảm rủi ro hỏng phần cứng hàng loạt.
- **D:** Sai vì chạy trải qua nhiều AZ làm tăng độ trễ mạng và tốn phí Cross-AZ data transfer.

</details>

### Câu 4 `medium`

A third-party vendor provides a SaaS analytics tool that needs read-only access to an Amazon S3 bucket in your AWS account. To follow AWS security best practices and prevent the 'Confused Deputy' problem, how should you grant access to the vendor?

- **A.** Create a cross-account IAM Role trusting the vendor's AWS account ID, and require a unique `sts:ExternalId` condition in the trust policy.
- **B.** Create an IAM user with S3 read-only permissions and send the Access Key ID and Secret Access Key to the vendor.
- **C.** Make the Amazon S3 bucket publicly accessible and attach a bucket policy restricting `s3:GetObject` by the vendor's IP address.
- **D.** Invite the vendor's external IAM users directly as member accounts into your AWS Organization management structure.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà cung cấp bên thứ ba cung cấp công cụ phân tích SaaS cần quyền chỉ đọc đối với một Amazon S3 bucket trong AWS account của bạn. Để tuân thủ các thực hành tốt nhất về bảo mật của AWS và ngăn chặn vấn đề 'Confused Deputy', bạn nên cấp quyền truy cập cho nhà cung cấp bằng cách nào?

**Đáp án đúng:** **A**

Khi cấp quyền Cross-Account cho **bên thứ 3 (Third-party vendor)** và chống **Confused Deputy** → **Cross-account IAM Role + `sts:ExternalId`**.

- **A (Đúng):** Đúng! **Cross-Account IAM Role kèm điều kiện `sts:ExternalId`** là chuẩn bảo mật của AWS để chống tấn công **Confused Deputy** khi cấp quyền cho bên thứ 3.
- **B:** Sai vì tạo IAM User với Access Key tĩnh cho bên thứ 3 rất mất an toàn và dễ bị lộ.
- **C:** Sai vì mở public bucket có thể vi phạm chính sách S3 Block Public Access và kém an toàn hơn IAM Role.
- **D:** Sai vì không thể thêm tài khoản bên thứ 3 vào quản lý nội bộ như vậy chỉ để đọc 1 bucket.

</details>

### Câu 5 `medium`

A company runs a distributed Apache Cassandra cluster on Amazon EC2 instances and wants to minimize the risk of correlated hardware failures while maintaining high network performance. Additionally, the company runs a separate 4-node license server cluster where no two nodes can share the same underlying rack hardware. Which TWO Placement Group strategies should be used respectively? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Use a Partition Placement Group for the Apache Cassandra cluster.
- **B.** Use a Spread Placement Group for the 4-node license server cluster.
- **C.** Use a Cluster Placement Group for the 4-node license server cluster.
- **D.** Use a Spread Placement Group for a 100-node Cassandra cluster in a single AZ.
- **E.** Use Dedicated Hosts without Placement Groups for Cassandra.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty chạy cụm Apache Cassandra phân tán trên các Amazon EC2 instance và muốn giảm thiểu rủi ro lỗi phần cứng tương quan (correlated hardware failures) trong khi vẫn duy trì hiệu năng mạng cao. Ngoài ra, công ty chạy riêng một cụm máy chủ cấp phép 4 node mà không có hai node nào được dùng chung phần cứng rack bên dưới. Nên sử dụng HAI chiến lược Placement Group nào tương ứng? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, B**

Nhớ phân biệt: **Hadoop/Cassandra/Kafka quy mô lớn** -> **Partition**; **<= 7 máy cực kỳ quan trọng khác rack** -> **Spread**; **HPC độ trễ thấp** -> **Cluster**.

- **A (Đúng):** Đúng! **Partition Placement Group** chia cụm lớn (Cassandra, Hadoop, Kafka) thành các phân vùng rack độc lập, giúp hệ thống phân tán nhận biết topology để đặt bản sao dữ liệu sang rack khác.
- **B (Đúng):** Đúng! **Spread Placement Group** đảm bảo mỗi EC2 (tối đa 7/AZ) nằm trên một rack phần cứng hoàn toàn riêng biệt.
- **C:** Sai vì Cluster Placement Group gom tất cả vào cùng 1 rack, tăng rủi ro chết cả cụm nếu rack hỏng.
- **D:** Sai vì Spread Placement Group giới hạn tối đa chỉ **7 instances mỗi AZ**.
- **E:** Sai vì Dedicated Hosts quá đắt và không tự động chia partition topology cho Cassandra.

</details>

### Câu 6 `hard`

A company is granting a third-party SaaS monitoring vendor read-only access to its AWS account via a cross-account IAM role. The security team wants to prevent the 'confused deputy' problem, where another customer of the same SaaS vendor might trick the vendor into accessing this company's AWS resources. What should the solutions architect add to the IAM role's trust policy?

- **A.** Attach an IAM Permissions Boundary to the cross-account role.
- **B.** Add a `Condition` block requiring `sts:ExternalId` with a unique secret string provided by the SaaS vendor.
- **C.** Require the `aws:MultiFactorAuthPresent` condition in the trust policy for the SaaS vendor's automated service.
- **D.** Create an IAM user with static access keys instead of an IAM role.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty đang cấp quyền chỉ đọc vào AWS account của mình cho một nhà cung cấp giám sát SaaS bên thứ ba thông qua một cross-account IAM role. Nhóm bảo mật muốn ngăn chặn vấn đề 'confused deputy', nơi một khách hàng khác của cùng nhà cung cấp SaaS có thể đánh lừa nhà cung cấp truy cập vào tài nguyên AWS của công ty này. Solutions architect nên thêm gì vào trust policy của IAM role?

**Đáp án đúng:** **B**

Trong đề thi SAA-C03, khi nhắc đến **third-party vendor + cross-account IAM role + confused deputy problem** -> Đáp án luôn là dùng **`sts:ExternalId`** trong Trust Policy.

- **A:** Sai vì Permissions Boundary giới hạn quyền tối đa của role nhưng không xác minh được khách hàng nào đang yêu cầu SaaS vendor gọi `sts:AssumeRole`.
- **B (Đúng):** Đúng! `sts:ExternalId` trong Trust Policy của IAM Role là cơ chế chuẩn mực của AWS để chống lại tấn công 'confused deputy' khi cấp quyền cross-account cho bên thứ ba (SaaS vendor).
- **C:** Sai vì hệ thống tự động (machine-to-machine) của SaaS vendor không thể nhập mã MFA thủ công khi gọi `AssumeRole`.
- **D:** Sai vì cấp static access keys cho bên thứ ba là thực hành bảo mật kém và không giải quyết bài toán cross-account role.

</details>

---

[Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md)
