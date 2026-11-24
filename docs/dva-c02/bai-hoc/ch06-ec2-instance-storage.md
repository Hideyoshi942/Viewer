# Chương 06 – EC2 Instance Storage

> **Nguồn:** 13 video của chương + *EC2 Data Management Quiz*.
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay (2026). Kỳ thi hiện tại là **DVA-C02**; chủ đề lưu trữ EC2 vẫn xuất hiện nhưng ở mức nền tảng (giống SAA/CCP).

## Mục tiêu chương

Sau chương này bạn có thể:

- Giải thích **EBS volume** là gì, tính chất "network drive", gắn với **một AZ**, và thuộc tính **Delete on Termination**.
- Tạo, gắn, format, mount EBS volume; di chuyển volume sang AZ/Region khác bằng **EBS Snapshot**.
- Dùng các tính năng snapshot: **Snapshot Archive**, **Recycle Bin**, **Fast Snapshot Restore (FSR)**.
- Hiểu **AMI** (public, tự tạo, Marketplace), quy trình tạo AMI và tính chất **gắn với Region**.
- Biết khi nào dùng **EC2 Instance Store** (hiệu năng I/O cực cao, dữ liệu tạm thời).
- Phân biệt 6 loại EBS volume: **gp2, gp3, io1, io2 Block Express, st1, sc1**.
- Hiểu **EBS Multi-Attach** (io1/io2, cùng AZ, tối đa 16 instance).
- Sử dụng **Amazon EFS** (NFS dùng chung đa AZ): performance mode, throughput mode, storage class, lifecycle policy.
- So sánh **EBS vs EFS vs Instance Store** để chọn đúng trong câu hỏi thi.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001–002 | EBS Overview | Bài 1 – Amazon EBS Volume |
| 003–004 | EBS Snapshots | Bài 2 – EBS Snapshots |
| 005–006 | AMI Overview | Bài 3 – Amazon Machine Image (AMI) |
| 007 | EC2 Instance Store | Bài 4 – EC2 Instance Store |
| 008 | EBS Volume Types | Bài 5 – Các loại EBS Volume |
| 009 | EBS Multi-Attach | Bài 6 – EBS Multi-Attach |
| 010–011 | Amazon EFS | Bài 7 – Amazon EFS |
| 012 | EFS vs EBS | Bài 8 – So sánh EBS, EFS và Instance Store |
| 013 | EBS & EFS – Section Cleanup | Bài 9 – Dọn dẹp tài nguyên |
| Quiz | EC2 Data Management Quiz | Câu hỏi ôn tập |

---

## Bài 1 – Amazon EBS Volume

### Lý thuyết

- **EBS (Elastic Block Store) volume** là một **ổ đĩa mạng (network drive)** gắn vào EC2 instance khi instance đang chạy. Thực ra ta đã dùng nó từ đầu khoá: ổ root của EC2 chính là một EBS volume.
- Mục đích: **giữ dữ liệu ngay cả khi instance bị terminate**. Có thể tạo instance mới rồi mount lại volume cũ để lấy lại dữ liệu.
- Hình dung: EBS giống một **"USB qua mạng"**: rút ra khỏi máy này, cắm sang máy khác, nhưng kết nối qua network chứ không cắm vật lý.
- Đặc điểm chính:

| Đặc điểm | Chi tiết |
|---|---|
| Kết nối | Qua **mạng** → có một chút **độ trễ (latency)** so với ổ vật lý |
| Gắn/tháo | Detach khỏi instance này và attach vào instance khác **rất nhanh** → hữu ích cho failover |
| Số instance | Ở mức CCP/cơ bản: **1 volume chỉ gắn vào 1 instance tại một thời điểm** (ngoại lệ: Multi-Attach, Bài 6) |
| Ngược lại | **1 instance có thể gắn nhiều EBS volume** |
| Phạm vi | **Bị khoá trong 1 Availability Zone**: volume ở `us-east-1a` không gắn được vào instance ở `us-east-1b` |
| Di chuyển AZ | Phải dùng **snapshot** rồi restore ở AZ khác (Bài 2) |
| Dung lượng | Phải **provision trước**: số GB và **IOPS** (I/O operations per second); bị tính tiền theo dung lượng đã provision, có thể tăng dần theo thời gian |
| Trạng thái | Có thể tạo volume và **để không gắn (unattached)**, gắn theo nhu cầu |

#### Thuộc tính Delete on Termination

| Volume | Mặc định Delete on Termination | Khi terminate instance |
|---|---|---|
| **Root volume** | **Bật** (Yes) | Bị xoá cùng instance |
| **Volume gắn thêm** | **Tắt** (No) | Được giữ lại (trạng thái *available*) |

- Có thể đổi thuộc tính này khi launch instance (*Storage → Advanced*) hoặc sau đó bằng CLI.
- Use case thi: **muốn giữ lại root volume sau khi terminate** (ví dụ để lưu dữ liệu, điều tra sự cố) → **tắt Delete on Termination** cho root volume.

### Kiến thức thực tế

- **gp3 là mặc định khuyến nghị** cho volume mới (rẻ hơn gp2 khoảng 20% theo giá niêm yết và có hiệu năng nền cố định). Video dùng gp2 vì quay từ trước.
- **Elastic Volumes:** có thể tăng dung lượng, đổi loại volume (gp2 → gp3), đổi IOPS/throughput **khi volume đang gắn và đang chạy**, không cần detach. Sau khi tăng dung lượng phải **mở rộng partition và file system**:

  ```bash
  aws ec2 modify-volume --volume-id vol-0abc... --size 20 --volume-type gp3
  sudo growpart /dev/nvme0n1 1           # nếu là root volume có partition
  sudo xfs_growfs -d /                   # XFS (Amazon Linux mặc định)
  sudo resize2fs /dev/nvme1n1            # ext4
  ```

  Giới hạn: **không giảm được dung lượng**, và mỗi volume phải chờ khoảng **6 giờ** giữa hai lần modify.
- **Mã hoá EBS:** bật *EBS encryption by default* ở cấp Region (EC2 → Settings) để mọi volume mới đều được mã hoá bằng KMS. Volume mã hoá thì snapshot và volume tạo từ snapshot đó cũng mã hoá.
- Volume **unattached vẫn bị tính tiền**. Volume "mồ côi" sau khi terminate instance là nguồn lãng phí phổ biến; kiểm tra định kỳ:

  ```bash
  aws ec2 describe-volumes --filters Name=status,Values=available \
    --query "Volumes[].{ID:VolumeId,Size:Size,AZ:AvailabilityZone}"
  ```

- Lỗi hay gặp: `mount: wrong fs type` do quên `mkfs`; instance không boot được sau reboot do dòng `/etc/fstab` sai (luôn thêm `nofail`).

### Ghi nhớ cho kỳ thi

- EBS = **network drive**, **1 AZ**, (mặc định) **1 instance tại một thời điểm**; 1 instance có thể gắn nhiều volume.
- Muốn chuyển volume sang AZ khác → **snapshot**.
- **Root volume bị xoá** khi terminate (Delete on Termination bật); **volume phụ được giữ**. Muốn giữ root → tắt Delete on Termination.

---

## Bài 2 – EBS Snapshots

### Lý thuyết

- **EBS Snapshot** là bản **backup tại một thời điểm** của EBS volume.
- **Không bắt buộc detach** volume khi chụp snapshot, nhưng **được khuyến nghị** (để dữ liệu nhất quán).
- Snapshot có thể **copy sang AZ khác hoặc Region khác**. Đây là cách "di chuyển" EBS volume giữa các AZ: chụp snapshot volume ở `us-east-1a` → restore thành volume mới ở `us-east-1b`.

#### Các tính năng snapshot

| Tính năng | Mô tả | Lưu ý |
|---|---|---|
| **EBS Snapshot Archive** | Chuyển snapshot sang **archive tier** rẻ hơn **tới 75%** | Restore mất **24–72 giờ**, không tức thì |
| **Recycle Bin** | Snapshot bị xoá sẽ vào thùng rác thay vì mất vĩnh viễn → khôi phục khi **xoá nhầm** | Thời gian lưu giữ (retention) **1 ngày – 1 năm**; áp dụng cho EBS Snapshots và AMIs |
| **Fast Snapshot Restore (FSR)** | Ép **khởi tạo đầy đủ** snapshot để volume tạo ra **không có latency ở lần đọc đầu tiên** | Hữu ích khi snapshot rất lớn, cần tạo volume/instance thật nhanh; **rất tốn tiền** |

### Kiến thức thực tế

- Snapshot là **incremental**: lần đầu chụp toàn bộ block đã dùng, các lần sau chỉ lưu block thay đổi. Xoá một snapshot cũ không làm hỏng các snapshot sau (AWS tự giữ các block còn được tham chiếu).
- Snapshot được lưu trong S3 do AWS quản lý (bạn không thấy trong bucket của mình), có phạm vi **Region**.
- Volume tạo từ snapshot được **lazy-load**: block chỉ được tải về khi đọc lần đầu, nên lần đọc đầu chậm. Cách xử lý: bật **FSR** (tính phí theo từng snapshot × từng AZ × giờ) hoặc tự "làm nóng" volume bằng cách đọc toàn bộ block:

  ```bash
  sudo fio --filename=/dev/nvme1n1 --rw=read --bs=1M --iodepth=32 \
    --ioengine=libaio --direct=1 --name=volume-initialize
  aws ec2 enable-fast-snapshot-restores --availability-zones eu-west-1a \
    --source-snapshot-ids snap-0abc...
  ```

- **Snapshot Archive** có thời gian lưu tối thiểu **90 ngày** (xoá/restore sớm vẫn bị tính đủ 90 ngày). Phù hợp cho snapshot lưu trữ dài hạn, tuân thủ quy định, ít khi cần restore.
- **Tự động hoá backup:** dùng **Amazon Data Lifecycle Manager (DLM)** hoặc **AWS Backup** để chụp snapshot theo lịch, giữ N bản, copy chéo Region, thay vì làm thủ công.
- Chuyển volume **không mã hoá → mã hoá**: snapshot → `copy-snapshot --encrypted` (hoặc tạo volume từ snapshot với tuỳ chọn encrypt) → tạo volume mới.
- **Rule lock** của Recycle Bin: khi khoá, rule không thể bị xoá/sửa cho đến hết thời gian unlock delay, giúp chống việc kẻ tấn công xoá cả backup lẫn rule (bảo vệ khỏi ransomware).

### Ghi nhớ cho kỳ thi

- Di chuyển EBS volume sang **AZ/Region khác** → **snapshot** rồi restore/copy.
- **Archive**: rẻ hơn tới 75%, restore 24–72 giờ.
- **Recycle Bin**: chống xoá nhầm snapshot/AMI, retention 1 ngày – 1 năm.
- **FSR**: không latency lần đầu, đắt.

---

## Bài 3 – Amazon Machine Image (AMI)

### Lý thuyết

- **AMI (Amazon Machine Image)** là bản **tuỳ biến của EC2 instance**: chứa hệ điều hành, cấu hình, phần mềm, công cụ monitoring…
- Lợi ích khi tự tạo AMI: **boot và cấu hình nhanh hơn**, vì phần mềm cần cài đã được **đóng gói sẵn** trong AMI.
- AMI được **tạo cho một Region cụ thể**, có thể **copy sang Region khác** để tận dụng hạ tầng toàn cầu.
- Ba nguồn AMI:

| Loại | Ai tạo | Ví dụ / ghi chú |
|---|---|---|
| **Public AMI** | AWS cung cấp | Amazon Linux 2 (video), hiện nay là **Amazon Linux 2023** |
| **AMI tự tạo** | Bạn | Bạn phải tự tạo và **bảo trì**; có công cụ tự động hoá |
| **AWS Marketplace AMI** | Bên thứ ba (vendor) | Có thể bị bán kèm phí; bạn cũng có thể bán AMI của mình trên Marketplace |

#### Quy trình tạo AMI từ EC2

1. Khởi chạy EC2 instance và **tuỳ biến** (cài phần mềm, cấu hình).
2. **Stop instance** để đảm bảo toàn vẹn dữ liệu.
3. **Build AMI** từ instance → AWS đồng thời tạo **EBS snapshots** phía sau.
4. **Launch instance mới từ AMI**, kể cả ở AZ khác: ví dụ instance gốc ở `us-east-1a` → tạo custom AMI → launch ở `us-east-1b` → có bản sao của instance.

### Kiến thức thực tế

- **Copy AMI sang Region khác** (bắt buộc nếu muốn launch ở Region khác):

  ```bash
  aws ec2 copy-image --source-region eu-west-1 --source-image-id ami-0abc... \
    --region us-east-1 --name "demo-image-us"
  ```

- **Deregister AMI không tự xoá snapshot** phía sau: phải xoá snapshot riêng, nếu không vẫn bị tính phí lưu trữ.
- **Chia sẻ AMI** cho tài khoản khác: `aws ec2 modify-image-attribute --image-id ami-... --launch-permission "Add=[{UserId=111122223333}]"`. Nếu AMI mã hoá bằng KMS key tự quản lý thì còn phải chia sẻ quyền dùng KMS key.
- **Cập nhật 2026:** **Amazon Linux 2 đã hết hạn hỗ trợ (end of support 30/06/2026)**. Dùng **Amazon Linux 2023** cho mọi instance mới; AL2023 dùng `dnf` (lệnh `yum` vẫn chạy như alias).
- **Tự động build AMI:** dùng **EC2 Image Builder** (pipeline tự cài phần mềm, vá lỗi, test và phân phối AMI chéo Region/tài khoản) hoặc Packer.
- Mô hình **"golden AMI" + user data nhỏ**: cài phần nặng vào AMI, chỉ cấu hình động (biến môi trường, file config) trong user data → boot nhanh, phù hợp Auto Scaling.
- Trên AWS Marketplace, AMI có thể bị tính **phí phần mềm theo giờ** ngoài phí EC2, cần đọc kỹ trước khi dùng.

### Ghi nhớ cho kỳ thi

- AMI **gắn với Region**; muốn dùng ở Region khác → **copy AMI** sang Region đó.
- Tạo AMI sẽ tạo **EBS snapshots** phía sau.
- Mục đích của custom AMI: **giảm thời gian boot/cấu hình**.
- 3 loại: Public (AWS), tự tạo, Marketplace.

---

## Bài 4 – EC2 Instance Store

### Lý thuyết

- EBS là ổ mạng, hiệu năng tốt nhưng **có giới hạn**. Khi cần hiệu năng **cao hơn nữa**, dùng **ổ cứng vật lý gắn trực tiếp vào máy chủ host**: đó là **EC2 Instance Store**.
- Chỉ một số loại instance có instance store (ví dụ họ `i3`, `i4i`, `d3`, các biến thể có hậu tố `d` như `m5d`, `c6gd`…).

| Đặc điểm | Instance Store |
|---|---|
| Hiệu năng | **I/O và throughput rất cao** (gắn vật lý) |
| Độ bền | **Ephemeral (tạm thời)**: dữ liệu **mất khi stop hoặc terminate** instance |
| Phần cứng hỏng | Máy chủ host hỏng → **mất dữ liệu** |
| Trách nhiệm | **Bạn tự backup và replicate** |
| Use case | Buffer, cache, scratch data, nội dung tạm thời |
| Không phù hợp | Lưu trữ lâu dài (dùng EBS) |

- Ví dụ minh hoạ (không cần nhớ số): instance `i3` lớn nhất đạt khoảng **3,3 triệu Random Read IOPS** và **1,4 triệu Write IOPS**, trong khi một volume gp2 tối đa **16.000 IOPS** (video nói nhầm "32.000"; con số đúng của gp2 là 16.000).

### Kiến thức thực tế

- Dữ liệu instance store **vẫn còn khi reboot**, nhưng **mất khi stop, hibernate hoặc terminate** (và khi instance bị dời sang host khác).
- Instance store **không detach/attach** được sang instance khác, không có snapshot. Muốn backup phải tự copy dữ liệu (ví dụ lên S3 hoặc EBS).
- Instance store đã được tính vào giá instance (không có phí riêng); với instance Nitro nó hiện là thiết bị NVMe, cần tự format/mount mỗi lần instance khởi động lại trên host mới:

  ```bash
  lsblk                                   # tìm thiết bị "Amazon EC2 NVMe Instance Storage"
  sudo mkfs -t xfs /dev/nvme1n1
  sudo mkdir -p /scratch && sudo mount /dev/nvme1n1 /scratch
  ```

- Ví dụ thực tế: cache tạm cho Elasticsearch/Cassandra có replication, dữ liệu trung gian của Spark/Hadoop, swap, thư mục tmp cho xử lý video.

### Ghi nhớ cho kỳ thi

- Thấy "**ổ gắn phần cứng hiệu năng rất cao**", "**IOPS cực lớn**" (vượt khả năng EBS) → **Instance Store**.
- Instance store = **ephemeral**, mất khi stop/terminate; dùng cho **cache/buffer/temp**.

---

## Bài 5 – Các loại EBS Volume

### Lý thuyết

- EBS có **6 loại volume**, chia thành 4 nhóm:

| Nhóm | Loại | Mô tả |
|---|---|---|
| General Purpose SSD | **gp2, gp3** | Cân bằng giá/hiệu năng cho đa số workload (dùng xuyên suốt khoá học) |
| Provisioned IOPS SSD | **io1, io2 Block Express** | Hiệu năng cao nhất, cho workload **mission-critical**, độ trễ thấp, throughput cao |
| Throughput Optimized HDD | **st1** | HDD giá thấp, cho workload **truy cập thường xuyên, nặng throughput** |
| Cold HDD | **sc1** | HDD **rẻ nhất**, cho dữ liệu **ít truy cập** |

- Một volume được đặc trưng bởi **Size, Throughput, IOPS**. Khi phân vân, luôn tra tài liệu.
- **Chỉ gp2, gp3, io1, io2 dùng làm boot volume** (nơi chạy OS root). st1/sc1 **không** làm boot volume. (Ngoài ra loại cũ *Magnetic standard* cũng boot được.)

#### General Purpose SSD: gp2 vs gp3

| | **gp2** (thế hệ cũ) | **gp3** (thế hệ mới) |
|---|---|---|
| Use case | Boot volume, virtual desktop, dev/test; chi phí hợp lý, độ trễ thấp | Như gp2 |
| Dung lượng | 1 GiB – 16 TiB | 1 GiB – 16 TiB (video); **nay tới 64 TiB** (xem dưới) |
| IOPS | **Gắn với dung lượng**: **3 IOPS/GB**, tối đa 16.000 IOPS (đạt ở **5.334 GB**); volume nhỏ **burst tới 3.000 IOPS** | Nền **3.000 IOPS** + **125 MB/s** bất kể dung lượng; tăng IOPS lên 16.000 và throughput lên 1.000 MB/s **độc lập** (video) |
| Đặc điểm cần nhớ | Size và IOPS **liên kết** | IOPS và throughput **độc lập** với size |

#### Provisioned IOPS SSD: io1 vs io2 Block Express

- Dùng cho ứng dụng **quan trọng cần IOPS ổn định**, hoặc cần **hơn 16.000 IOPS**.
- Hợp với **database nhạy cảm với hiệu năng và tính nhất quán của storage**.

| | **io1** | **io2 Block Express** |
|---|---|---|
| Dung lượng | **4 GiB** – 16 TiB (video nói nhầm "4 TB") | 4 GiB – **64 TiB** |
| Max IOPS | **64.000** trên instance **Nitro**; **32.000** trên instance khác | **256.000** |
| Tỉ lệ IOPS/GiB | 50:1 | **1.000:1** |
| Độ trễ | Thấp | **Dưới 1 ms (sub-millisecond)** |
| IOPS độc lập size | Có | Có |
| Multi-Attach | Hỗ trợ | Hỗ trợ |

- Muốn **vượt 32.000 IOPS** → cần **instance EC2 Nitro** với io1/io2.

#### HDD: st1 vs sc1

| | **st1** – Throughput Optimized HDD | **sc1** – Cold HDD |
|---|---|---|
| Use case | Big data, data warehouse, xử lý log | Dữ liệu archive, ít truy cập, cần **chi phí thấp nhất** |
| Dung lượng | 125 GiB – 16 TiB | 125 GiB – 16 TiB |
| Max throughput | **500 MB/s** | **250 MB/s** |
| Max IOPS | **500** | **250** |
| Boot volume | Không | Không |

> Không cần thuộc hết con số; cần hiểu **khác biệt ở mức cao**: gp (đa dụng) vs io (database, IOPS cao) vs st1 (throughput cao) vs sc1 (rẻ nhất).

#### Bảng tổng hợp chọn loại volume

| Nhu cầu | Chọn |
|---|---|
| Mặc định, boot volume, dev/test, web server | **gp3** |
| Database cần IOPS cao ổn định, > 16.000 IOPS, sub-ms | **io2 Block Express** (io1 là thế hệ cũ) |
| Gắn chung 1 volume cho nhiều instance cùng AZ | **io1/io2 + Multi-Attach** |
| Big data, log, data warehouse đọc tuần tự | **st1** |
| Dữ liệu lạnh, chi phí thấp nhất | **sc1** |
| IOPS vượt cả io2 (hàng trăm nghìn – triệu), chấp nhận mất dữ liệu | **Instance Store** |

### Kiến thức thực tế

- **Cập nhật giới hạn gp3 (từ 09/2025):** gp3 hỗ trợ tới **64 TiB**, **80.000 IOPS** và **2.000 MiB/s** throughput (trước đây 16 TiB / 16.000 IOPS / 1.000 MiB/s như video). Đề thi có thể vẫn dùng con số cũ; khi làm bài hãy theo ngữ cảnh đề.
- gp3 có tỉ lệ ràng buộc: tối đa **500 IOPS/GiB** và throughput tối đa **0,25 MiB/s cho mỗi IOPS** đã provision.
- **Chuyển gp2 → gp3** thường giảm chi phí mà không downtime:

  ```bash
  aws ec2 modify-volume --volume-id vol-0abc... --volume-type gp3 --iops 3000 --throughput 125
  aws ec2 describe-volumes-modifications --volume-ids vol-0abc...
  ```

- **Mọi volume io2 hiện nay đều là io2 Block Express**; io2 có độ bền **99,999%**, các loại khác khoảng 99,8–99,9%. Vì vậy với workload mới nên chọn **io2** thay vì io1.
- Tạo volume io2 với IOPS chỉ định:

  ```bash
  aws ec2 create-volume --volume-type io2 --size 100 --iops 20000 --availability-zone eu-west-1a
  ```

- Hiệu năng thực tế còn bị giới hạn bởi **băng thông EBS của loại instance** (EBS-optimized bandwidth). Volume 64.000 IOPS gắn vào instance nhỏ vẫn không đạt được 64.000 IOPS.
- **RAID 0** nhiều volume (gp2/gp3/io2) để cộng dồn IOPS/throughput vượt giới hạn 1 volume; đổi lại, hỏng 1 volume là mất toàn bộ array.
- Chi phí: gp3/gp2 tính theo GB-tháng; gp3 tính thêm phần IOPS/throughput vượt nền; io1/io2 tính theo GB **và** IOPS provision (đắt); st1/sc1 rẻ nhất theo GB.

### Ghi nhớ cho kỳ thi

- **Boot volume: gp2, gp3, io1, io2** (không phải st1/sc1).
- **gp2: IOPS gắn với size (3 IOPS/GB, max 16.000 ở 5.334 GB)**; **gp3: IOPS/throughput độc lập** với size.
- Database nhạy cảm hiệu năng, cần > 16.000 IOPS → **io1/io2**. **> 32.000 IOPS → cần Nitro.**
- io2 Block Express: **64 TiB, 256.000 IOPS, sub-ms**.
- st1 = throughput (big data/log); sc1 = rẻ nhất (archive).
- gp2 đã max IOPS → tăng size **không** giúp; dùng **RAID 0** hoặc **đổi sang io1/io2**.

---

## Bài 6 – EBS Multi-Attach

### Lý thuyết

- **Multi-Attach** cho phép gắn **cùng một EBS volume vào nhiều EC2 instance trong cùng một AZ**.
- Chỉ có ở **họ io1 và io2**.
- Mỗi instance có **toàn quyền đọc và ghi** đồng thời trên volume hiệu năng cao.
- Use case:
  - Tăng **tính sẵn sàng** cho ứng dụng **clustered Linux** (ví dụ Teradata).
  - Ứng dụng phải tự quản lý **thao tác ghi đồng thời (concurrent writes)**.
- Giới hạn:

| Giới hạn | Giá trị |
|---|---|
| Phạm vi | **Chỉ trong 1 AZ** (không gắn chéo AZ) |
| Số instance tối đa | **16 EC2 instance** cùng lúc (nhớ số **16** cho kỳ thi) |
| File system | Phải dùng **file system cluster-aware** (không phải XFS, ext4) |

### Kiến thức thực tế

- Bật khi tạo volume (và instance phải là **Nitro**):

  ```bash
  aws ec2 create-volume --volume-type io2 --size 100 --iops 3000 \
    --multi-attach-enabled --availability-zone eu-west-1a
  aws ec2 attach-volume --volume-id vol-0abc... --instance-id i-aaa --device /dev/sdf
  aws ec2 attach-volume --volume-id vol-0abc... --instance-id i-bbb --device /dev/sdf
  ```

- File system cluster-aware ví dụ: **GFS2**, **OCFS2**. Nếu mount cùng một volume XFS/ext4 trên nhiều máy và cùng ghi → **hỏng dữ liệu (data corruption)**.
- Multi-Attach là ổ **block** dùng chung, ứng dụng phải tự đồng bộ hoá (I/O fencing, lock). Nếu chỉ cần **chia sẻ file** giữa nhiều instance, nhất là **khác AZ**, hãy dùng **EFS** (Bài 7) – đơn giản và đúng mục đích hơn nhiều.

### Ghi nhớ cho kỳ thi

- Multi-Attach = **1 volume → nhiều instance, cùng AZ**, chỉ **io1/io2**, tối đa **16** instance, cần **cluster-aware FS**.
- Đáp án nhiễu "nhiều AZ" là **sai**.

---

## Bài 7 – Amazon EFS (Elastic File System)

### Lý thuyết

- **EFS** là **NFS (Network File System) được quản lý**, có thể **mount trên nhiều EC2 instance**, kể cả instance **ở các AZ khác nhau**. Đây là điểm mạnh nhất của EFS.
- **Highly available, scalable**, nhưng **đắt**: khoảng **3 lần giá gp2** (theo video); **trả tiền theo dung lượng dùng thực tế**, không cần provision trước.
- Kiến trúc: EFS file system được bao bởi một **security group**; EC2 ở `us-east-1a`, `us-east-1b`, `us-east-1c` đều kết nối **cùng lúc** vào cùng một file system.
- Đặc điểm:

| Đặc điểm | Chi tiết |
|---|---|
| Use case | Content management, web serving, chia sẻ dữ liệu, **WordPress** |
| Giao thức | **NFS** (NFSv4.1), cổng **2049** |
| Kiểm soát truy cập | **Security group** |
| Hệ điều hành | **Chỉ AMI Linux**, **không hỗ trợ Windows** |
| Mã hoá | Encryption at rest bằng **KMS** |
| File system | Chuẩn **POSIX** của Linux, API file chuẩn |
| Dung lượng | **Tự scale**, không cần lên kế hoạch; trả tiền theo GB sử dụng |

#### Quy mô và hiệu năng

- **Hàng nghìn NFS client đồng thời**, throughput **10 GB/s+**, tự tăng lên quy mô **petabyte**.

**Performance mode** (chọn lúc tạo file system):

| Mode | Đặc điểm | Use case |
|---|---|---|
| **General Purpose** (mặc định) | Độ trễ thấp | Latency-sensitive: web server, CMS… |
| **Max I/O** | Độ trễ cao hơn, throughput cao hơn, song song cao | Big data, xử lý media |

**Throughput mode:**

| Mode | Đặc điểm |
|---|---|
| **Bursting** | Throughput tăng theo dung lượng lưu trữ. Ví dụ 1 TB → 50 MiB/s, burst tới 100 MiB/s |
| **Provisioned** | Đặt throughput **không phụ thuộc dung lượng**, ví dụ 1 GiB/s cho 1 TB lưu trữ; trả tiền trước cho throughput đã đặt |
| **Elastic** | **Tự scale lên/xuống theo workload**, trả theo mức dùng. Video: tới 3 GiB/s đọc và 1 GiB/s ghi. Phù hợp **workload khó đoán**. **Được AWS khuyến nghị** |

#### Storage classes

**Storage tiers** (lifecycle management – chuyển file sau N ngày):

| Tier | Dùng cho | Giá |
|---|---|---|
| **Standard** | File truy cập thường xuyên | Giá lưu trữ cao nhất |
| **Infrequent Access (EFS-IA)** | File ít truy cập | Lưu trữ rẻ hơn, **có phí khi đọc file** |
| **Archive** | Dữ liệu hiếm khi truy cập (vài lần/năm) | Rẻ nhất để lưu trữ |

- **Lifecycle policy**: định nghĩa sau bao nhiêu ngày file được chuyển sang tier nào. Ví dụ: file trong EFS Standard không được truy cập trong 60 ngày → tự chuyển sang EFS-IA.

**Availability & durability:**

| Kiểu | Đặc điểm | Dùng cho |
|---|---|---|
| **Standard / Regional** (Multi-AZ) | Dữ liệu trải trên nhiều AZ, chịu được sự cố AZ | **Production** |
| **One Zone** | Chỉ 1 AZ, rẻ hơn, vẫn có backup; kết hợp được với IA → **EFS One Zone-IA** | **Dev/test** |

- Dùng đúng storage class có thể **tiết kiệm tới 90% chi phí**.

### Kiến thức thực tế

- **Cập nhật hiện nay:**
  - **Elastic** là throughput mode **mặc định/khuyến nghị** trên console. Giới hạn throughput của Elastic đã được AWS nâng nhiều lần so với con số trong video; tra tài liệu *EFS quotas* khi cần số chính xác.
  - **General Purpose** là performance mode khuyến nghị cho hầu hết workload. **Max I/O** không dùng được với **Elastic** throughput và với **One Zone**.
  - Tên gọi hiện nay: **Regional** (trước là "Standard") và **One Zone**; storage class gồm **Standard, Infrequent Access (IA), Archive** (Archive ra mắt cuối 2023).
- **Windows** cần file share → dùng **Amazon FSx for Windows File Server** (SMB), không phải EFS.
- **amazon-efs-utils** cung cấp mount helper `-t efs` với **TLS (mã hoá in-transit)**, hỗ trợ **IAM authorization** (`-o tls,iam`) và **EFS Access Points** (`-o tls,accesspoint=fsap-...`).
- **EFS Access Points**: ép user/group POSIX và thư mục gốc cho từng ứng dụng; rất hay dùng với **Lambda** và **ECS/EKS** (phần sau khoá học). Lambda mount EFS qua access point để dùng chung file lớn, model ML…
- **EFS Replication**: nhân bản file system sang Region/AZ khác cho DR.
- Lỗi hay gặp:
  - `mount` bị treo/timeout → SG của EFS chưa mở **TCP 2049** từ SG của EC2, hoặc không có mount target ở AZ của instance.
  - `amazon-efs-utils` chưa cài → lỗi `unknown filesystem type 'efs'`.
  - Tên DNS `fs-xxx.efs.region.amazonaws.com` không phân giải được → VPC chưa bật *DNS resolution/DNS hostnames*.
- Chi phí: EFS Standard đắt hơn EBS khá nhiều theo GB; với dữ liệu ít truy cập, lifecycle sang IA/Archive giúp giảm mạnh. Chú ý phí đọc dữ liệu ở IA/Archive.

### Ghi nhớ cho kỳ thi

- Nhiều EC2 **ở nhiều AZ** cần **dùng chung file system NFS** → **EFS**.
- EFS: **Linux only (POSIX)**, NFS port **2049**, truy cập kiểm soát bằng **security group**, mã hoá bằng **KMS**, **pay-per-use**, tự scale.
- Performance mode: **General Purpose** (latency thấp) vs **Max I/O** (throughput cao, big data).
- Throughput mode: **Bursting / Provisioned / Elastic** (Elastic cho workload khó đoán).
- Storage tier: **Standard / IA / Archive** + **lifecycle policy**; **One Zone** cho dev, **Regional (multi-AZ)** cho prod; tiết kiệm tới **90%**.

---

## Bài 8 – So sánh EBS, EFS và Instance Store

### Lý thuyết

**EBS volume:**

- Gắn vào **1 instance tại một thời điểm** (trừ trường hợp đặc biệt **Multi-Attach** của io1/io2).
- **Khoá theo AZ**: EBS ở AZ 1 không gắn được vào EC2 ở AZ 2.
- **gp2**: IO tăng khi dung lượng đĩa tăng; **gp3 và io1**: tăng IO **độc lập** với dung lượng.
- Chuyển EBS sang AZ khác: **snapshot → restore** ở AZ mới.
- Backup EBS **tiêu tốn IO** → **không nên chạy backup lúc ứng dụng đang tải cao** vì ảnh hưởng hiệu năng.
- Root EBS volume **bị xoá mặc định** khi terminate instance (có thể tắt).

**EFS:**

- Network file system, mục tiêu là gắn vào **hàng trăm instance ở nhiều AZ**.
- Một EFS có **mount target ở nhiều AZ**, nhiều instance dùng chung (ví dụ **WordPress**).
- **Chỉ cho Linux** (POSIX).
- **Giá cao hơn EBS**, nhưng có thể dùng **storage tiers** để tiết kiệm.

**Instance Store:** gắn **vật lý** vào EC2 → mất instance là **mất dữ liệu**.

#### Bảng so sánh tổng hợp

| Tiêu chí | **EBS** | **EFS** | **Instance Store** |
|---|---|---|---|
| Loại | Block storage qua mạng | File system NFS qua mạng | Block storage vật lý trên host |
| Phạm vi | 1 AZ | Nhiều AZ (Regional) hoặc 1 AZ (One Zone) | Gắn với 1 host |
| Số instance | 1 (io1/io2 Multi-Attach: tới 16, cùng AZ) | Hàng trăm/nghìn, khác AZ | 1 (không tách rời) |
| Độ bền dữ liệu | Bền, độc lập vòng đời instance | Bền, multi-AZ | **Ephemeral**: mất khi stop/terminate/hỏng host |
| Hiệu năng | Tốt, tuỳ loại volume | Tốt, scale theo throughput mode | **Cao nhất** (IOPS hàng triệu) |
| Dung lượng | Provision trước, trả theo provision | Tự scale, trả theo dùng | Cố định theo loại instance, đã gồm trong giá |
| OS | Linux & Windows | **Chỉ Linux** | Linux & Windows |
| Backup | Snapshot (incremental), DLM, AWS Backup | AWS Backup, EFS Replication | Tự làm |
| Giá | Trung bình | Cao hơn (giảm nhờ IA/Archive) | Không phí riêng |
| Use case | Boot volume, database 1 instance | Shared content, WordPress, CMS, home dirs | Cache, buffer, scratch, temp |

### Kiến thức thực tế

- Nếu cần **lưu trữ object** (ảnh, video, backup, static website) truy cập qua HTTP → **S3** (chương 11), không phải EBS/EFS.
- Câu hỏi kiểu "nhiều instance trong Auto Scaling Group cần đọc/ghi cùng dữ liệu" → EFS. "Database cần IOPS cao trên một instance" → EBS io2. "Cache cực nhanh, mất cũng được" → Instance Store.
- Cần file share hiệu năng rất cao cho HPC → **FSx for Lustre**; cần SMB/Windows → **FSx for Windows File Server**; cần NetApp ONTAP/ZFS → FSx tương ứng.

### Ghi nhớ cho kỳ thi

- **EBS**: 1 instance, 1 AZ, chuyển AZ bằng snapshot; backup ảnh hưởng IO.
- **EFS**: nhiều instance, nhiều AZ, Linux, đắt hơn, có tiers.
- **Instance Store**: vật lý, nhanh nhất, ephemeral.

---

## Bài 9 – Dọn dẹp tài nguyên

### Kiến thức thực tế

- Các nguồn phí "ẩn" hay quên sau lab: **EBS volume available**, **snapshot**, **snapshot trong Recycle Bin**, **AMI chưa deregister**, **FSR đang bật**, **Elastic IP không gắn**, EFS.
- Dùng **AWS Budgets** cảnh báo chi phí và **Cost Explorer** lọc theo dịch vụ "EC2 – Other" (gồm EBS, snapshot) để phát hiện tài nguyên sót.

### Ghi nhớ cho kỳ thi

- Bài dọn dẹp không có kiến thức thi riêng; chỉ cần nhớ: **snapshot và volume unattached vẫn tính phí**, **deregister AMI không xoá snapshot**.

---

## Tổng kết chương

| Chủ đề | Điều cần nhớ |
|---|---|
| EBS | Network drive, **1 AZ**, 1 instance (mặc định), provision GB + IOPS; root bị xoá khi terminate, volume phụ thì không |
| Delete on Termination | Root: bật; volume phụ: tắt; muốn giữ root → tắt |
| EBS Snapshot | Backup point-in-time, incremental; copy chéo AZ/Region; cách chuyển volume sang AZ khác |
| Snapshot Archive | Rẻ hơn tới 75%, restore 24–72 giờ |
| Recycle Bin | Chống xoá nhầm snapshot/AMI, retention 1 ngày – 1 năm |
| FSR | Volume không latency lần đọc đầu, đắt |
| AMI | Region-scoped (copy để dùng Region khác); Public / tự tạo / Marketplace; tạo AMI → tạo snapshot; boot nhanh hơn |
| Instance Store | Ổ vật lý, IOPS cực cao, **ephemeral**; cache/buffer/temp |
| gp2 / gp3 | gp2: 3 IOPS/GB, max 16.000 ở 5.334 GB; gp3: nền 3.000 IOPS + 125 MB/s, chỉnh **độc lập** (nay tới 80.000 IOPS/2.000 MiB/s/64 TiB) |
| io1 / io2 BE | Database, IOPS ổn định; io1 64.000 (Nitro); io2 BE 256.000, 64 TiB, sub-ms; > 32.000 IOPS cần Nitro |
| st1 / sc1 | HDD, không boot; st1 big data/log (500 MB/s); sc1 rẻ nhất, archive (250 MB/s) |
| Boot volume | gp2, gp3, io1, io2 (và Magnetic standard) |
| Multi-Attach | io1/io2, **cùng AZ**, tối đa **16** instance, cluster-aware FS |
| EFS | NFS managed, **multi-AZ**, Linux/POSIX, port 2049, SG, KMS, pay-per-use, ~3× gp2 |
| EFS modes | Performance: General Purpose / Max I/O; Throughput: Bursting / Provisioned / **Elastic** (khuyến nghị) |
| EFS storage | Standard / IA / Archive + lifecycle policy; Regional vs One Zone; tiết kiệm tới 90% |
| Cập nhật 2026 | DVA-C02; gp3 mặc định; io2 đều là Block Express; gp3 tăng giới hạn (09/2025); AL2 hết hỗ trợ 30/06/2026 → AL2023; EFS Elastic mặc định |

---

## Câu hỏi ôn tập

*Nguồn: EC2 Data Management Quiz. Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Bạn vừa terminate một EC2 instance ở `us-east-1a`, và EBS volume gắn với nó giờ đang ở trạng thái *available*. Đồng nghiệp của bạn cố gắn volume này vào một EC2 instance ở `us-east-1b` nhưng không được. Nguyên nhân có thể là gì?

- A. Anh ấy thiếu quyền IAM
- B. EBS volume bị khoá trong một AWS Region
- C. EBS volume bị khoá trong một Availability Zone

<details><summary>Đáp án</summary>

**C.** EBS volume được tạo cho một AZ cụ thể và chỉ gắn được vào instance cùng AZ. Muốn chuyển sang AZ khác thì dùng **EBS Snapshot**: chụp snapshot rồi tạo volume mới từ snapshot ở `us-east-1b`. B sai vì phạm vi hẹp hơn Region (là AZ). A có thể gây lỗi nhưng không phải nguyên nhân phù hợp với tình huống khác AZ.
</details>

**Câu 2.** Bạn đã launch một EC2 instance với hai EBS volume: một Root volume và một EBS volume khác để lưu dữ liệu. Một tháng sau bạn định terminate instance. Hành vi mặc định đối với mỗi volume là gì?

- A. Cả Root volume và EBS volume dữ liệu đều bị xoá
- B. Root volume bị xoá, EBS volume dữ liệu không bị xoá
- C. Root volume không bị xoá, EBS volume dữ liệu bị xoá
- D. Cả hai đều không bị xoá

<details><summary>Đáp án</summary>

**B.** Mặc định, thuộc tính **Delete On Termination** được bật cho Root volume nên nó bị xoá cùng instance. Các EBS volume khác có thuộc tính này tắt mặc định nên được giữ lại. Có thể thay đổi cả hai hành vi này khi launch hoặc bằng `modify-instance-attribute`.
</details>

**Câu 3.** Bạn có thể dùng một AMI ở Region N. Virginia (`us-east-1`) để launch EC2 instance ở bất kỳ AWS Region nào. (Đúng/Sai)

- A. Đúng
- B. Sai

<details><summary>Đáp án</summary>

**B. Sai.** AMI được tạo cho một Region cụ thể và là duy nhất trong Region đó. Không thể launch EC2 ở Region khác bằng AMI này, nhưng có thể **copy AMI** sang Region đích (`aws ec2 copy-image`) rồi dùng bản copy để tạo instance.
</details>

**Câu 4.** Những loại EBS volume nào sau đây có thể dùng làm boot volume khi tạo EC2 instance?

- A. gp2, gp3, io1, io2
- B. gp2, gp3, st1, sc1
- C. io1, io2, st1, sc1

<details><summary>Đáp án</summary>

**A.** Chỉ các loại SSD **gp2, gp3, io1, io2** (và loại cũ **Magnetic (Standard)**) mới dùng làm boot volume được. Các loại HDD **st1, sc1** không thể làm boot volume.
</details>

**Câu 5.** EBS Multi-Attach là gì?

- A. Gắn cùng một EBS volume vào nhiều EC2 instance ở nhiều AZ
- B. Gắn nhiều EBS volume trong cùng AZ vào cùng một EC2 instance
- C. Gắn cùng một EBS volume vào nhiều EC2 instance trong cùng một AZ
- D. Gắn nhiều EBS volume ở nhiều AZ vào cùng một EC2 instance

<details><summary>Đáp án</summary>

**C.** Multi-Attach cho phép gắn cùng một EBS volume (chỉ io1/io2) vào nhiều EC2 instance (tối đa 16) **trong cùng AZ**; mỗi instance có toàn quyền đọc/ghi. A sai vì không thể chéo AZ. B là việc bình thường (1 instance gắn nhiều volume), không phải Multi-Attach. D sai vì volume khác AZ không gắn được.
</details>

**Câu 6.** Bạn đã provision một EBS volume gp2 8 TB và đang thiếu IOPS. Cách nào sau đây **KHÔNG** giúp tăng hiệu năng?

- A. Mount các EBS volume theo RAID 0
- B. Chuyển sang loại volume io1
- C. Tăng dung lượng EBS volume

<details><summary>Đáp án</summary>

**C.** Volume gp2 có IOPS tối đa **16.000**, đạt được ở **5.334 GB** (3 IOPS/GB). Volume 8 TB đã ở mức tối đa nên tăng dung lượng không tăng thêm IOPS. RAID 0 (cộng dồn IOPS của nhiều volume) và chuyển sang io1 (provision IOPS tới 64.000) đều giúp tăng hiệu năng. (Thực tế hiện nay chuyển sang gp3 hoặc io2 cũng là lựa chọn tốt.)
</details>

**Câu 7.** Bạn có một nhóm EC2 instance phân bố trên nhiều AZ cùng xử lý một tập dữ liệu lớn. Bạn đề xuất gì để cùng một dữ liệu có thể truy cập như một ổ NFS từ tất cả EC2 instance?

- A. Dùng Instance Store
- B. Dùng EBS
- C. Dùng EFS

<details><summary>Đáp án</summary>

**C.** EFS là network file system (NFS) cho phép mount cùng một file system trên các EC2 instance ở **các AZ khác nhau**. A sai: Instance Store là ổ vật lý gắn với host, chỉ dùng cho một instance, phù hợp lưu trữ tạm (buffer, cache). B sai: EBS bị khoá trong một AZ và chỉ mount được trên một instance tại một thời điểm.
</details>

**Câu 8.** Bạn muốn có một cache cục bộ hiệu năng cao cho ứng dụng chạy trên EC2. Bạn không ngại mất cache khi instance bị terminate. Là Solutions Architect, bạn đề xuất cơ chế lưu trữ nào?

- A. Instance Store
- B. EBS
- C. EFS

<details><summary>Đáp án</summary>

**A.** EC2 Instance Store cho hiệu năng disk I/O tốt nhất, và yêu cầu chấp nhận mất dữ liệu khớp với tính chất ephemeral của nó. EBS (B) là ổ mạng nên I/O thấp hơn Instance Store. EFS (C) là network file system truy cập qua mạng, mount được trên nhiều instance, nhưng I/O cũng thấp hơn Instance Store.
</details>

**Câu 9.** Bạn chạy một database hiệu năng cao cần **310.000 IOPS** cho storage bên dưới. Bạn đề xuất gì?

- A. Dùng EC2 Instance Store
- B. Dùng ổ EBS gp2
- C. Dùng ổ EBS io1
- D. Dùng ổ EBS io2 Block Express

<details><summary>Đáp án</summary>

**A.** Yêu cầu chính là IOPS, và 310.000 IOPS vượt khả năng mọi loại EBS volume đơn lẻ: gp2 tối đa 16.000 (B), io1/io2 thường tối đa 64.000 (C), io2 Block Express tối đa 256.000 (D). Chỉ Instance Store đáp ứng được. Nhược điểm: dữ liệu mất khi instance bị stop (reboot thì không sao). Có thể khắc phục bằng cách replicate sang một EC2 khác cũng dùng Instance Store làm standby, hoặc thiết lập cơ chế backup dữ liệu.
</details>

---

[← Chương 05](ch05-ec2-fundamentals.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Chương 07 →](ch07-aws-fundamentals-elb-asg.md)
