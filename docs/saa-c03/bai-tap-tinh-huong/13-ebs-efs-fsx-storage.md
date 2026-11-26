# Bài tập tình huống — Chủ đề 13: Chuyên sâu Block & File Storage — EBS, Instance Store, EFS & Amazon FSx

> EBS gp3/io2/st1/sc1, EBS Multi-Attach & Snapshots, Instance Store, Amazon EFS (Performance & Throughput Modes) & FSx (Windows, Lustre, NetApp ONTAP, OpenZFS).
> **Số câu hỏi:** 9 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A company runs a legacy enterprise application across 10 Windows Server Amazon EC2 instances distributed across multiple Availability Zones. All 10 instances need to mount a shared network file system simultaneously using the SMB protocol, enforced with Microsoft Active Directory user permissions and NTFS access control lists (ACLs). Which AWS storage service meets these requirements?

- **A.** Amazon EFS (Elastic File System)
- **B.** Amazon EBS gp3 volume attached to all 10 instances across 3 AZs
- **C.** Amazon S3 Glacier Flexible Retrieval
- **D.** Amazon FSx for Windows File Server

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty chạy một ứng dụng doanh nghiệp kế thừa trên 10 Amazon EC2 instance Windows Server phân bố trên nhiều Availability Zone. Cả 10 instance cần gắn kết (mount) đồng thời một hệ thống tệp mạng dùng chung bằng giao thức SMB, được thực thi với quyền người dùng Microsoft Active Directory và danh sách kiểm soát truy cập (ACL) NTFS. Dịch vụ lưu trữ AWS nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **D**

Cứ gặp **Windows EC2 + Shared file system + SMB + NTFS + Active Directory** -> Chọn ngay **Amazon FSx for Windows File Server**.

- **A:** Sai vì Amazon EFS sử dụng giao thức NFSv4 dành cho Linux, không hỗ trợ SMB hay NTFS Active Directory cho Windows.
- **B:** Sai vì EBS bị giới hạn trong 1 AZ duy nhất và gp3 không hỗ trợ Multi-Attach.
- **C:** Sai vì S3 Glacier là kho lưu trữ đối tượng offline, không phải hệ thống tệp SMB.
- **D (Đúng):** Đúng! **Amazon FSx for Windows File Server** cung cấp hệ thống tệp chia sẻ Windows gốc hỗ trợ đầy đủ giao thức SMB, NTFS, Microsoft Active Directory và triển khai Multi-AZ.

</details>

### Câu 2 `easy`

A company runs hundreds of Amazon EC2 instances using `gp2` EBS volumes. A solutions architect wants to immediately reduce EBS storage costs by 20% while maintaining or improving baseline IOPS performance without changing volume sizes. What should the architect recommend?

- **A.** Modify the EBS volumes from `gp2` to `gp3`.
- **B.** Modify the EBS volumes from `gp2` to `io2`.
- **C.** Migrate the boot volumes from `gp2` to `st1`.
- **D.** Migrate all EBS volumes to Amazon EFS.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty vận hành hàng trăm Amazon EC2 instance sử dụng các `gp2` EBS volume. Một solutions architect muốn giảm ngay 20% chi phí lưu trữ EBS trong khi vẫn duy trì hoặc cải thiện hiệu năng IOPS cơ sở mà không thay đổi kích thước volume. Kiến trúc sư nên đề xuất gì?

**Đáp án đúng:** **A**

Tối ưu chi phí EBS đơn giản và hiệu quả nhất hiện nay là chuyển toàn bộ **`gp2` sang `gp3`** (rẻ hơn 20%, hiệu năng tốt hơn).

- **A (Đúng):** Đúng! Chuyển từ `gp2` sang **`gp3`** giúp **giảm ngay 20% chi phí** mỗi GB, đồng thời cung cấp sẵn baseline 3,000 IOPS và 125 MB/s miễn phí mà không cần tăng dung lượng ổ đĩa.
- **B:** Sai vì `io2` đắt hơn `gp2` rất nhiều.
- **C:** Sai vì `st1` (HDD) không thể dùng làm Boot Volume cho EC2.
- **D:** Sai vì EFS đắt hơn EBS khoảng 3 lần trên mỗi GB.

</details>

### Câu 3 `medium`

A company runs a Windows-based ERP application on Amazon EC2 instances across multiple Availability Zones. The application requires a shared file system that supports the SMB protocol, NTFS permissions, and integration with the company's existing Microsoft Active Directory. Which AWS storage service should the solutions architect choose?

- **A.** Amazon EFS (Elastic File System)
- **B.** Amazon FSx for Lustre
- **C.** Amazon EBS Multi-Attach
- **D.** Amazon FSx for Windows File Server

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty chạy ứng dụng ERP nền tảng Windows trên các Amazon EC2 instance qua nhiều Availability Zone. Ứng dụng yêu cầu một hệ thống tệp dùng chung hỗ trợ giao thức SMB, quyền NTFS và tích hợp với Microsoft Active Directory hiện có của công ty. Solutions architect nên chọn dịch vụ lưu trữ AWS nào?

**Đáp án đúng:** **D**

Cứ thấy từ khóa **Windows + SMB + NTFS + Active Directory** → **Amazon FSx for Windows File Server**.

- **A:** Sai vì Amazon EFS chỉ hỗ trợ Linux thông qua giao thức NFSv4, không hỗ trợ SMB hay NTFS.
- **B:** Sai vì FSx for Lustre tối ưu cho HPC/Linux, không dùng cho Windows SMB/AD.
- **C:** Sai vì EBS Multi-Attach chỉ hoạt động trong cùng 1 AZ (không hỗ trợ Multi-AZ) và không phải dịch vụ SMB file share.
- **D (Đúng):** Đúng! **Amazon FSx for Windows File Server** cung cấp hệ thống tệp Windows được quản lý hoàn toàn với giao thức **SMB, NTFS ACLs, và tích hợp Active Directory**.

</details>

### Câu 4 `medium`

A machine learning research team needs a high-performance shared file system capable of hundreds of GB/s throughput to train deep learning models on EC2 GPU instances. The training dataset is stored in Amazon S3, and the team wants the file system to transparently load data from S3 and write trained model checkpoints back to S3. Which service meets these requirements?

- **A.** Amazon EFS with Max I/O performance mode
- **B.** AWS Storage Gateway S3 File Gateway
- **C.** Amazon FSx for Lustre
- **D.** Amazon EBS `st1` volumes

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm nghiên cứu machine learning cần một hệ thống tệp dùng chung hiệu năng cao có khả năng đạt thông lượng hàng trăm GB/s để huấn luyện các mô hình deep learning trên các EC2 GPU instance. Tập dữ liệu huấn luyện được lưu trong Amazon S3, và nhóm muốn hệ thống tệp tự động nạp dữ liệu từ S3 một cách minh bạch và ghi các checkpoint của mô hình đã huấn luyện trở lại S3. Dịch vụ nào đáp ứng các yêu cầu này?

**Đáp án đúng:** **C**

**HPC / Machine Learning + Tốc độ hàng trăm GB/s + Tích hợp trực tiếp S3** → **Amazon FSx for Lustre**.

- **A:** Sai vì EFS không đồng bộ hai chiều trực tiếp với S3 và không đạt thông lượng hàng trăm GB/s như Lustre.
- **B:** Sai vì S3 File Gateway dùng để kết nối on-premises với S3, không tối ưu cho cụm GPU HPC.
- **C (Đúng):** Đúng! **Amazon FSx for Lustre** là hệ thống tệp song song (parallel file system) cho **HPC & ML**, đạt thông lượng hàng trăm GB/s và tích hợp đồng bộ trực tiếp với **Amazon S3**.
- **D:** Sai vì `st1` chỉ đạt tối đa 500 MB/s và chỉ gắn cho 1 EC2 duy nhất.

</details>

### Câu 5 `medium`

A media company needs a shared POSIX-compliant file system that can be mounted concurrently by hundreds of Linux EC2 instances across multiple Availability Zones. The file system must automatically scale its storage capacity without manual provisioning. Which AWS storage service should be used?

- **A.** Amazon EBS Multi-Attach with `gp3` volumes
- **B.** Amazon FSx for Windows File Server
- **C.** Amazon S3 mounted via AWS Storage Gateway File Gateway
- **D.** Amazon EFS (Elastic File System)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty truyền thông cần một hệ thống tệp dùng chung tuân thủ POSIX có thể được gắn kết đồng thời bởi hàng trăm Linux EC2 instance trên nhiều Availability Zone. Hệ thống tệp phải tự động mở rộng dung lượng lưu trữ mà không cần cấp phát thủ công. Nên sử dụng dịch vụ lưu trữ AWS nào?

**Đáp án đúng:** **D**

Phân biệt nhanh File Storage trong SAA-C03: **Linux + Multi-AZ + Auto-scaling** -> **Amazon EFS**; **Windows + SMB + AD** -> **FSx for Windows**; **HPC / ML siêu nhanh** -> **FSx for Lustre**.

- **A:** Sai vì EBS Multi-Attach chỉ hỗ trợ `io1`/`io2` (không hỗ trợ `gp3`), bị giới hạn trong cùng 1 AZ, tối đa 16 instances và không có hệ thống file phân tán tích hợp sẵn.
- **B:** Sai vì FSx for Windows sử dụng giao thức SMB dành cho Windows, không phải lựa chọn tối ưu cho Linux POSIX.
- **C:** Sai vì S3 File Gateway dùng để truy cập S3 từ on-premises qua NFS/SMB, không phải giải pháp POSIX file system hiệu năng cao cho EC2 Multi-AZ.
- **D (Đúng):** Đúng! Amazon EFS là hệ thống tệp NFS (POSIX-compliant) được quản lý hoàn toàn cho Linux EC2, hỗ trợ gắn đồng thời từ hàng nghìn EC2 trên nhiều AZ và tự động co giãn dung lượng.

</details>

### Câu 6 `medium`

A financial firm runs a latency-sensitive database on Amazon EC2 that requires 50,000 IOPS and sub-millisecond latency with 99.999% durability. Which Amazon EBS volume type should the solutions architect select?

- **A.** Provisioned IOPS SSD (`io2` or `io2` Block Express)
- **B.** General Purpose SSD (`gp3`) with baseline IOPS
- **C.** Throughput Optimized HDD (`st1`) magnetic volume
- **D.** EC2 Instance Store NVMe SSD ephemeral storage

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty tài chính vận hành một cơ sở dữ liệu nhạy cảm với độ trễ trên Amazon EC2, yêu cầu 50.000 IOPS và độ trễ dưới một mili-giây với độ bền 99,999%. Solutions architect nên chọn loại Amazon EBS volume nào?

**Đáp án đúng:** **A**

Ghi nhớ thông số EBS: `gp3` max **16,000 IOPS**; `io2` max **64,000 IOPS** (và **256,000 IOPS** với `io2 Block Express`) cùng độ bền **99.999%**.

- **A (Đúng):** Đúng! EBS `io2` (và `io2` Block Express) cung cấp độ bền 99.999%, độ trễ dưới 1 mili-giây và hỗ trợ tới 64,000 IOPS (hoặc 256,000 IOPS với Block Express), phù hợp cho database quan trọng.
- **B:** Sai vì `gp3` chỉ hỗ trợ tối đa 16,000 IOPS và độ bền 99.8% - 99.9%, không đạt mức 50,000 IOPS và 99.999% durability.
- **C:** Sai vì `st1` là ổ cứng từ (HDD) chỉ tối ưu throughput cho Big Data/Log, IOPS rất thấp (tối đa 500 IOPS).
- **D:** Sai vì Instance Store là lưu trữ tạm thời (ephemeral), dữ liệu sẽ mất khi stop/terminate EC2 nên không đảm bảo độ bền 99.999% lâu dài.

</details>

### Câu 7 `medium`

A research lab runs a High-Performance Computing (HPC) simulation on hundreds of Amazon EC2 instances that requires a POSIX-compliant parallel file system capable of hundreds of GB/s of throughput and sub-millisecond latencies. The training dataset is stored in Amazon S3, and results must be written back to S3 when the job finishes. Which AWS storage service is designed for this workload?

- **A.** Amazon EFS
- **B.** Amazon FSx for Windows File Server
- **C.** AWS Storage Gateway Tape Gateway
- **D.** Amazon FSx for Lustre

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một phòng thí nghiệm nghiên cứu chạy mô phỏng Tính toán Hiệu năng Cao (HPC) trên hàng trăm Amazon EC2 instance, yêu cầu một hệ thống tệp song song tuân thủ POSIX có khả năng đạt thông lượng hàng trăm GB/s và độ trễ dưới một mili-giây. Tập dữ liệu huấn luyện được lưu trong Amazon S3, và kết quả phải được ghi lại vào S3 khi tác vụ hoàn thành. Dịch vụ lưu trữ AWS nào được thiết kế cho workload này?

**Đáp án đúng:** **D**

Từ khóa: **HPC / Machine Learning / Video rendering + hundreds of GB/s + sub-millisecond + tích hợp S3** -> **Amazon FSx for Lustre**.

- **A:** Sai vì EFS không đạt thông lượng hàng trăm GB/s và không có cơ chế đồng bộ trực tiếp hai chiều tốc độ cao với S3 như FSx for Lustre.
- **B:** Sai vì FSx for Windows dùng giao thức SMB cho hệ sinh thái Windows/AD, không phải file system song song cho HPC.
- **C:** Sai vì Tape Gateway dùng để sao lưu lưu trữ băng từ ảo từ on-premises lên S3/Glacier.
- **D (Đúng):** Đúng! Amazon FSx for Lustre là hệ thống file song song hiệu năng siêu cao (hàng trăm GB/s, độ trễ dưới 1ms) cho HPC/ML, và tích hợp trực tiếp với Amazon S3 để nạp dữ liệu vào và đẩy kết quả ra.

</details>

### Câu 8 `medium`

A company is migrating an on-premises Microsoft Windows enterprise application to AWS. The application requires a shared file system that supports the SMB protocol, integrates with the company's existing Microsoft Active Directory, and preserves Windows NTFS permissions and Access Control Lists (ACLs). Which AWS service should be used?

- **A.** Amazon FSx for Windows File Server
- **B.** Amazon EFS (Elastic File System)
- **C.** Amazon S3 Standard Object Storage
- **D.** Amazon EBS `gp3` block volume

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty đang di chuyển một ứng dụng doanh nghiệp Microsoft Windows on-premises lên AWS. Ứng dụng yêu cầu một hệ thống tệp dùng chung hỗ trợ giao thức SMB, tích hợp với Microsoft Active Directory hiện có của công ty, và bảo toàn các quyền NTFS cũng như Access Control Lists (ACLs) của Windows. Nên sử dụng dịch vụ AWS nào?

**Đáp án đúng:** **A**

Mỗi khi đề bài nhắc đến **Windows + SMB + Active Directory + NTFS permissions** -> Đáp án chắc chắn là **Amazon FSx for Windows File Server**.

- **A (Đúng):** Đúng! Amazon FSx for Windows File Server cung cấp file server Windows gốc hỗ trợ đầy đủ SMB, NTFS ACLs, Shadow Copies và tích hợp Microsoft Active Directory.
- **B:** Sai vì EFS sử dụng giao thức NFSv4 dành cho Linux, không hỗ trợ SMB hay Windows NTFS ACLs.
- **C:** Sai vì S3 là Object Storage, không hỗ trợ SMB file share hay NTFS ACLs gốc.
- **D:** Sai vì EBS là block storage gắn vào 1 EC2 instance (không phải shared SMB file server đa máy chủ).

</details>

### Câu 9 `medium`

A research institute needs to run a high-performance computing (HPC) cluster of hundreds of Linux Amazon EC2 instances to process weather simulation datasets stored in Amazon S3. The shared file system must provide hundreds of GB/s of throughput, sub-millisecond latencies, and native bi-directional integration with the S3 bucket. Which AWS storage service should be used?

- **A.** Amazon EFS configured with Max I/O performance mode
- **B.** Amazon FSx for Lustre
- **C.** Amazon FSx for Windows File Server
- **D.** AWS Storage Gateway (S3 File Gateway)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một viện nghiên cứu cần chạy một cụm tính toán hiệu năng cao (HPC) gồm hàng trăm Amazon EC2 instance chạy Linux để xử lý các bộ dữ liệu mô phỏng thời tiết được lưu trữ trong Amazon S3. Hệ thống tệp dùng chung phải cung cấp thông lượng hàng trăm GB/s, độ trễ dưới một mili-giây và khả năng tích hợp hai chiều nguyên bản (native) với S3 bucket. Nên sử dụng dịch vụ lưu trữ AWS nào?

**Đáp án đúng:** **B**

Từ khóa **HPC (High Performance Computing) + Linux + sub-millisecond latency + S3 integration** -> Chọn ngay **Amazon FSx for Lustre**.

- **A:** Sai vì EFS là hệ thống tệp NFS đa dụng nhưng không đạt thông lượng hàng trăm GB/s và không đồng bộ gốc (native lazy-load) với S3 cho bài toán HPC như Lustre.
- **B (Đúng):** Đúng! Amazon FSx for Lustre được thiết kế chuyên biệt cho HPC, Machine Learning, xử lý dữ liệu tốc độ cực cao và tích hợp trực tiếp với Amazon S3.
- **C:** Sai vì FSx for Windows dùng giao thức SMB phục vụ môi trường Windows và Active Directory.
- **D:** Sai vì Storage Gateway dùng để kết nối máy chủ On-premises với lưu trữ đám mây AWS.

</details>

---

[Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md)
