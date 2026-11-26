# Bài 13: Chuyên sâu Block & File Storage — EBS, Instance Store, EFS & Amazon FSx

Trong kỳ thi SAA-C03, việc chọn đúng dịch vụ lưu trữ cho từng workload là kỹ năng bắt buộc. Bạn phải phân biệt rạch ròi giữa **Block Storage** (EBS, Instance Store) và **File Storage** (EFS, FSx), cũng như nắm vững thông số IOPS, Throughput, khả năng Multi-AZ và hệ điều hành hỗ trợ của từng loại.

---

## 1. Amazon EBS (Elastic Block Store)

**Amazon EBS** là ổ đĩa mạng (network-attached block storage) gắn vào EC2 instance.
- **Phạm vi**: EBS volume nằm trong **một Availability Zone (AZ) duy nhất**. Muốn chuyển sang AZ khác phải tạo **EBS Snapshot** rồi restore sang AZ mới.
- **Tính bền vững (Persistence)**: Dữ liệu vẫn tồn tại độc lập ngay cả khi EC2 instance bị Stop hoặc Terminate (nếu tắt tùy chọn *Delete on Termination*).

### 1.1. So sánh 6 loại EBS Volume Types

| Loại Volume | Nhóm | Dung lượng | Max IOPS / Volume | Max Throughput | Boot Volume? | Use Case điển hình |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`gp3`** | General Purpose SSD | 1 GiB – 16 TiB | **16,000 IOPS** (3,000 free baseline) | **1,000 MiB/s** (125 MiB/s free baseline) | Có | **Mặc định khuyên dùng**. Tách rời IOPS/Throughput khỏi dung lượng; rẻ hơn `gp2` ~20%. |
| **`gp2`** | General Purpose SSD | 1 GiB – 16 TiB | 16,000 IOPS (3 IOPS/GiB, burst 3,000) | 250 MiB/s | Có | Thế hệ cũ của `gp3` (IOPS phụ thuộc vào dung lượng ổ đĩa). |
| **`io1`** | Provisioned IOPS SSD | 4 GiB – 16 TiB | 64,000 IOPS (Nitro) | 1,000 MiB/s | Có | Database quan trọng cần IOPS ổn định, độ trễ thấp (độ bền 99.8%–99.9%). |
| **`io2`** | Provisioned IOPS SSD | 4 GiB – 16 TiB | 64,000 IOPS | 1,000 MiB/s | Có | Độ bền cực cao **99.999% (5 nines)**, tỷ lệ 500 IOPS/GiB. |
| **`io2 Block Express`** | Provisioned IOPS SSD | 4 GiB – 64 TiB | **256,000 IOPS** | **4,000 MiB/s** | Có | Workload khắt khe nhất: SAP HANA, Oracle, SQL Server, SAS Analytics (sub-millisecond latency). |
| **`st1`** | Throughput Optimized HDD | 125 GiB – 16 TiB | 500 IOPS | **500 MiB/s** | **Không** | Big Data, Data Warehouses, Kafka, Log processing (đọc/ghi **tuần tự** dung lượng lớn). |
| **`sc1`** | Cold HDD | 125 GiB – 16 TiB | 250 IOPS | 250 MiB/s | **Không** | Dữ liệu ít truy cập, chi phí thấp nhất trên EBS. |

> **Exam Tip**:
> - Nếu đề bài cần **tăng IOPS mà không cần tăng dung lượng** (decouple IOPS from storage size) với chi phí tối ưu: chuyển từ `gp2` sang **`gp3`**.
> - Nếu đề bài cần **> 64,000 IOPS** trên một EBS volume duy nhất: chọn **`io2 Block Express`**.
> - `st1` và `sc1` là HDD nên **không thể làm Boot Volume (Root Volume)**.

### 1.2. EBS Snapshots, Fast Snapshot Restore (FSR) & DLM

- **EBS Snapshots**: Sao lưu gia tăng (**incremental**) — chỉ lưu các block dữ liệu thay đổi kể từ snapshot trước đó và được lưu ngầm trên **Amazon S3**.
- **Cross-Region Copy & Encryption**:
  - Snapshot của một volume đã mã hóa (KMS) sẽ tự động được mã hóa.
  - Có thể sao chép Snapshot sang Region khác (dùng cho DR) hoặc chia sẻ cho AWS Account khác.
  - Để mã hóa một EBS volume chưa mã hóa: Tạo Snapshot -> Copy Snapshot kèm bật Encryption -> Restore thành Volume mới.
- **Fast Snapshot Restore (FSR)**: Khởi tạo trước (pre-warm) toàn bộ dữ liệu từ Snapshot xuống EBS volume mới ngay lập tức, loại bỏ hiện tượng giảm hiệu năng (latency) khi đọc block lần đầu (lazy loading). Rất đắt tiền, tính phí theo giờ cho mỗi Snapshot-AZ.
- **Amazon Data Lifecycle Manager (DLM)**: Tự động hóa lịch tạo, giữ lại (retention) và xóa EBS Snapshots / EBS-backed AMIs theo tag.
- **Recycle Bin**: Phục hồi EBS Snapshots hoặc AMIs bị xóa nhầm theo retention rule.

### 1.3. EBS Multi-Attach

- Cho phép gắn **cùng một EBS volume** vào **tối đa 16 EC2 Nitro instances** trong **cùng 1 Availability Zone**.
- **Chỉ hỗ trợ** trên **`io1`** và **`io2`** (không hỗ trợ `gp2`/`gp3`).
- **Ràng buộc quan trọng**: Các hệ điều hành chuẩn (như `ext4`, `XFS`, `NTFS`) không hỗ trợ ghi đồng thời từ nhiều máy chủ (sẽ gây hỏng dữ liệu). Ứng dụng bắt buộc phải dùng **cluster-aware file system** (như GFS2, OCFS2) hoặc tự quản lý khóa ghi ở tầng ứng dụng.

---

## 2. EC2 Instance Store (Ephemeral Storage)

**Instance Store** là các ổ đĩa SSD/NVMe gắn **vật lý trực tiếp** lên máy chủ host của EC2.

- **Hiệu năng**: Cực cao (hàng triệu IOPS, độ trễ cực thấp vì không đi qua mạng như EBS).
- **Tính tạm thời (Ephemeral)**: Dữ liệu trên Instance Store **bị mất vĩnh viễn** nếu EC2 instance bị **Stop**, **Hibernate**, **Terminate**, hoặc phần cứng host gặp sự cố. (Dữ liệu **chỉ còn** khi **Reboot**).
- **Use Case**: Cache, buffer, dữ liệu tạm (scratch data), hoặc dữ liệu đã được sao chép phân tán ở tầng ứng dụng (ví dụ: Cassandra, Elasticsearch cluster, RAID 0 tạm thời).

> **Exam Tip**: Nếu đề bài hỏi cần *"highest possible IOPS / lowest latency temporary storage"* và chấp nhận mất dữ liệu khi instance dừng, chọn **EC2 Instance Store**. Nếu cần lưu dữ liệu bền vững sau khi Stop/Start, chọn **EBS**.

---

## 3. Amazon EFS (Elastic File System)

**Amazon EFS** là dịch vụ **Network File System (NFSv4.0 / NFSv4.1)** được quản lý hoàn toàn cho **Linux** (không hỗ trợ Windows).

- **Multi-AZ & Auto-Scaling**: Là dịch vụ **Regional**, dữ liệu tự động lưu trữ phân tán trên nhiều AZ. Dung lượng tự động co giãn từ GB lên PB mà không cần cấp phát trước (pay only for what you use).
- Có thể gắn đồng thời vào **hàng nghìn EC2 instances** (qua nhiều AZ), ECS, EKS, và AWS Lambda.

### 3.1. Performance Modes & Throughput Modes

| Thuộc tính | Tùy chọn | Đặc điểm & Khi nào chọn |
| :--- | :--- | :--- |
| **Performance Mode** | **General Purpose** (Mặc định) | Độ trễ thấp nhất cho mỗi thao tác file. Phù hợp hầu hết workload: web serving, CMS, home directories. |
| | **Max I/O** | Hỗ trợ thông lượng và IOPS tổng hợp cực cao (hàng chục đến hàng trăm nghìn NFS ops/s) từ hàng trăm/nghìn instances cùng lúc, nhưng **độ trễ mỗi thao tác cao hơn** một chút. |
| **Throughput Mode** | **Elastic** (Khuyên dùng) | Tự động scale throughput lên/xuống theo nhu cầu đột biến mà không cần dự đoán trước, trả tiền theo lượng dữ liệu đọc/ghi. |
| | **Provisioned** | Đặt cố định mức throughput (MiB/s) độc lập với dung lượng lưu trữ hiện có (ví dụ: lưu 10 GB nhưng cần 500 MiB/s). |
| | **Bursting** | Throughput tỷ lệ thuận với dung lượng lưu trữ (dùng cơ chế Burst Credits). |

### 3.2. EFS Storage Classes & Lifecycle Management

- **EFS Standard**: Lưu trữ Multi-AZ cho dữ liệu truy cập thường xuyên.
- **EFS Standard-IA (Infrequent Access)**: Giá rẻ hơn tới ~92% cho file ít truy cập, nhưng tính phí mỗi lần truy xuất (retrieval fee).
- **EFS One Zone / One Zone-IA**: Chỉ lưu trong **1 AZ duy nhất** (rẻ hơn ~47% so với Standard), phù hợp cho dev/test hoặc dữ liệu có thể tái tạo.
- **EFS Archive**: Chi phí thấp nhất cho dữ liệu lưu trữ dài hạn ít truy cập (truy cập vài lần/năm).
- **Lifecycle Management**: Tự động chuyển file không truy cập sau `7, 14, 30, 60, 90` ngày sang IA hoặc Archive.

---

## 4. Amazon FSx Family (Managed Third-Party File Systems)

Khi ứng dụng doanh nghiệp cần giao thức đặc thù (SMB/NTFS cho Windows) hoặc hiệu năng siêu máy tính (Lustre) hoặc tính năng lưu trữ doanh nghiệp (ONTAP/OpenZFS), hãy dùng **Amazon FSx**:

| Dịch vụ FSx | Giao thức & Hệ điều hành | Tính năng nổi bật | Use Case chuẩn thi SAA-C03 |
| :--- | :--- | :--- | :--- |
| **FSx for Windows File Server** | **SMB**, NTFS, Windows (cũng mount được từ Linux) | Tích hợp **Microsoft Active Directory**, Windows ACLs, Shadow Copies (VSS), DFS Namespaces, Multi-AZ. | Lift-and-shift ứng dụng .NET/Windows, SQL Server shared storage, Windows home directories. |
| **FSx for Lustre** | **POSIX**, Linux | Thông lượng **hàng trăm GB/s**, hàng triệu IOPS, sub-ms latency. **Tích hợp trực tiếp với Amazon S3** (đồng bộ 2 chiều). Có 2 loại: *Scratch* (tạm, rẻ, không replicate) & *Persistent* (bền vững, tự phục hồi). | **HPC (High Performance Computing)**, Machine Learning training, xử lý tài chính/video tốc độ cực cao. |
| **FSx for NetApp ONTAP** | **NFS, SMB, iSCSI** (Multi-protocol: Linux + Windows + macOS) | Snapshot tức thời, **FlexClone**, Deduplication & Compression, SnapMirror replication, tự động tiering dữ liệu ít dùng sang Capacity Pool rẻ hơn. | Doanh nghiệp đang dùng NetApp on-premises muốn di chuyển lên AWS mà không sửa kiến trúc; hoặc cần **chia sẻ cùng 1 file system cho cả Linux (NFS) và Windows (SMB)**. |
| **FSx for OpenZFS** | **NFS** (v3, v4, v4.1, v4.2) cho Linux/macOS/Windows | Xây dựng trên hệ thống file ZFS mã nguồn mở: độ trễ cực thấp (< 0.5 ms), hỗ trợ ZFS snapshots, instant cloning, nén dữ liệu. | Di chuyển hệ thống ZFS on-premises lên AWS, CI/CD build environments cần clone dữ liệu tức thì. |

---

## 5. Bảng tổng kết chọn Storage nhanh cho SAA-C03

| Yêu cầu trong câu hỏi | Dịch vụ đáp án |
| :--- | :--- |
| Shared POSIX file storage cho **Linux EC2/ECS/Lambda** trên Multi-AZ | **Amazon EFS** |
| Shared **SMB / Active Directory** file storage cho **Windows** | **Amazon FSx for Windows File Server** |
| Chia sẻ file đồng thời cho cả **Linux (NFS) và Windows (SMB)** hoặc cần **iSCSI / SnapMirror / Deduplication** | **Amazon FSx for NetApp ONTAP** |
| **HPC / ML training** cần throughput cực lớn + tích hợp **S3** | **Amazon FSx for Lustre** |
| Block storage cho **1 EC2 instance** (OS/Database) | **Amazon EBS** (`gp3` hoặc `io2 Block Express`) |
| Block storage chia sẻ cho nhiều Nitro EC2 trong **1 AZ** với cluster-aware FS | **EBS Multi-Attach** (`io1`/`io2`) |
| Temporary storage có **IOPS cao nhất**, chấp nhận mất khi Stop | **EC2 Instance Store** |

---

[← Bài trước](12-s3-lifecycle-storage-gateway-aurora.md) | [Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/13-ebs-efs-fsx-storage.md) | [Bài tiếp →](14-databases-rds-aurora-dynamodb.md)
