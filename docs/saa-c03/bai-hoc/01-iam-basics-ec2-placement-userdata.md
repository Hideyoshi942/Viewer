# Bài 3: Nhập môn IAM, EC2 Instances, Placement Groups & IMDSv2

Trước khi thiết kế các kiến trúc phức tạp trên AWS, một Solutions Architect cần nắm vững nền tảng cốt lõi: **Hạ tầng toàn cầu AWS (Global Infrastructure)**, **Quản lý danh tính và truy cập (IAM)**, và **Amazon EC2** — từ cách chọn Instance Type, mô hình mua tiết kiệm chi phí, Placement Groups cho hiệu năng/độ sẵn sàng cao, đến bảo mật Instance Metadata với **IMDSv2**.

---

## 1. AWS Global Infrastructure

Hạ tầng toàn cầu của AWS được thiết kế để đảm bảo độ trễ thấp, khả năng chịu lỗi cao và tuân thủ quy định lưu trữ dữ liệu theo khu vực địa lý.

| Thành phần | Mô tả kỹ thuật | Đặc điểm & Use Case |
| :--- | :--- | :--- |
| **AWS Region** | Một cụm các trung tâm dữ liệu tách biệt về mặt địa lý (ví dụ: `us-east-1`, `ap-southeast-1`). | Độc lập hoàn toàn; dữ liệu không tự động rời khỏi Region trừ khi bạn cấu hình sao chép. Chọn Region dựa trên: **Compliance** (tuân thủ pháp lý), **Latency** (gần user), **Service Availability**, **Pricing**. |
| **Availability Zone (AZ)** | Gồm 1 hoặc nhiều Data Center độc lập về nguồn điện, làm mát và mạng vật lý trong một Region (thường có tối thiểu 3 AZ/Region). | Kết nối với nhau qua cáp quang tốc độ cực cao, độ trễ thấp (< 1–2 ms). Dùng để triển khai **High Availability (Multi-AZ)**. |
| **Edge Location (POP)** | Hơn 600+ điểm hiện diện trên toàn cầu, tách biệt với Region. | Phục vụ **Amazon CloudFront** (CDN cache nội dung tĩnh/động), **Route 53** (DNS), **AWS WAF**, **AWS Shield**. |
| **AWS Local Zones** | Phần mở rộng của AWS Region đặt tại các thành phố lớn gần người dùng cuối. | Yêu cầu độ trễ cực thấp (single-digit millisecond) cho gaming, media rendering, real-time streaming. |
| **AWS Wavelength** | Đưa dịch vụ AWS Compute/Storage vào bên trong mạng 5G của nhà mạng viễn thông. | Ứng dụng IoT, xe tự hành, AR/VR qua mạng 5G với độ trễ siêu thấp. |

> **Exam Tip**: Khi đề bài yêu cầu *"low latency for global users"* để phân phối nội dung tĩnh/video, đáp án là **CloudFront (Edge Locations)**. Khi yêu cầu *"data residency / compliance"* tại một quốc gia cụ thể, yếu tố quyết định là **AWS Region**. Khi yêu cầu *"high availability within a Region"*, hãy triển khai trên **Multi-AZ**.

---

## 2. Nhập môn AWS IAM (Identity and Access Management)

**IAM** là dịch vụ **Global** (không gắn với một Region cụ thể) dùng để quản lý xác thực (Authentication) và phân quyền (Authorization) trên AWS.

### 2.1. Các khái niệm cốt lõi

- **Root User**: Tài khoản tạo ra khi đăng ký AWS. Có toàn quyền không giới hạn.
  - **Best Practice**: Không dùng Root User cho công việc hàng ngày; bật **MFA (Multi-Factor Authentication)** cho Root User; xóa Access Keys của Root User; tạo một IAM Admin User riêng.
- **IAM User**: Đại diện cho một người dùng hoặc ứng dụng cụ thể cần tương tác lâu dài với AWS (có Username/Password hoặc Access Key ID/Secret Access Key).
- **IAM Group**: Tập hợp các IAM Users để gán quyền đồng loạt (Group chỉ chứa Users, **không thể chứa Group khác**).
- **IAM Policy**: Tài liệu JSON định nghĩa quyền (Allow hoặc Deny).
- **IAM Role**: Danh tính tạm thời với quyền hạn xác định, được **assume** (đảm nhận) bởi AWS Services (như EC2, Lambda), IAM Users, hoặc tài khoản AWS khác thông qua **AWS STS (Security Token Service)** cấp phát temporary credentials.

### 2.2. Cấu trúc một IAM Policy JSON

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowReadOnlyS3SpecificBucket",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-company-reports",
        "arn:aws:s3:::my-company-reports/*"
      ],
      "Condition": {
        "Bool": {
          "aws:MultiFactorAuthPresent": "true"
        }
      }
    }
  ]
}
```

### 2.3. IAM Roles for EC2 (Instance Profile) & Best Practices

Tuyệt đối **không** lưu trữ `AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY` bên trong mã nguồn hoặc file cấu hình trên EC2 instance. Thay vào đó:

1. Tạo một **IAM Role** với Trust Policy cho phép `ec2.amazonaws.com` assume role.
2. Gán IAM Policy theo nguyên tắc **Least Privilege** (quyền tối thiểu cần thiết).
3. Gắn IAM Role vào EC2 instance (thông qua **Instance Profile**). AWS SDK/CLI trên EC2 sẽ tự động lấy temporary credentials từ Instance Metadata Service.

Các công cụ hỗ trợ bảo mật IAM thường gặp trong SAA-C03:
- **IAM Access Analyzer**: Xác định tài nguyên (S3, IAM Roles, KMS, SQS...) đang bị chia sẻ ra bên ngoài AWS Account hoặc Organization.
- **IAM Credentials Report**: Xuất báo cáo CSV trạng thái toàn bộ IAM Users (lần cuối đổi mật khẩu, trạng thái MFA, tuổi của Access Keys).
- **IAM Access Advisor**: Xem các dịch vụ mà một User/Role đã thực sự sử dụng gần đây để thu hồi quyền dư thừa.

> **Exam Tip**: Nguyên tắc vàng của IAM Evaluation Logic: Mặc định mọi thứ đều bị **Implicit Deny**. Một **Explicit Deny** (trong SCP, Resource Policy hoặc Identity Policy) **luôn thắng** mọi **Allow**. Nếu đề bài hỏi cách cấp quyền cho EC2 truy cập S3/DynamoDB an toàn nhất, luôn chọn **IAM Role attached to EC2** (không bao giờ dùng IAM User Access Keys).

---

## 3. Amazon EC2 Instance Types & Quy ước đặt tên

Quy ước đặt tên EC2 Instance: ví dụ `m6i.2xlarge`
- `m`: **Instance Family** (General Purpose)
- `6`: **Generation** (thế hệ thứ 6)
- `i`: **Processor / Additional Capability** (`i` = Intel, `a` = AMD, `g` = AWS Graviton ARM, `n` = Network optimized, `d` = NVMe Instance Store)
- `2xlarge`: **Instance Size** (quy mô vCPU và RAM)

| Family | Nhóm | Đặc điểm nổi bật | Use Case điển hình trên đề thi |
| :--- | :--- | :--- | :--- |
| **T / M** (`t3`, `t4g`, `m6i`, `m7g`) | **General Purpose** | Cân bằng giữa Compute, Memory và Networking. Dòng `T` hỗ trợ **Burstable** (CPU Credits). | Web servers, microservices, code repositories, dev/test (`T`), enterprise apps (`M`). |
| **C** (`c6i`, `c7g`, `c6in`) | **Compute Optimized** | Tỷ lệ vCPU/RAM cao, hiệu năng xử lý tính toán mạnh. | Batch processing, media transcoding, high-performance web servers, gaming servers, scientific modeling. |
| **R / X / z1d** (`r6i`, `x2gd`, `u-6tb1`) | **Memory Optimized** | Dung lượng RAM cực lớn so với vCPU. | In-memory databases (Redis, Memcached), SAP HANA, real-time big data analytics. |
| **I / D / H** (`i4i`, `d3en`, `h1`) | **Storage Optimized** | Tối ưu cho đọc/ghi tuần tự hoặc ngẫu nhiên IOPS cực cao trên local NVMe/HDD. | NoSQL databases (Cassandra, MongoDB), data warehousing, Elasticsearch/OpenSearch, distributed file systems. |
| **P / G / Inf / Trn** (`p5`, `g5`, `inf2`, `trn1`) | **Accelerated Computing** | Trang bị GPU hoặc chip chuyên dụng (AWS Inferentia, Trainium). | Machine Learning training (`P`, `Trn`), ML inference (`Inf`, `G`), 3D rendering, video encoding (`G`). |

> **Exam Tip**: Các dòng chip **AWS Graviton** (hậu tố `g`, ví dụ `c7g`, `m7g`, `r7g`) sử dụng kiến trúc ARM64 cho hiệu năng/giá thành (price-performance) tốt hơn tới 40% so với x86 nếu ứng dụng tương thích ARM (Linux, containers, Java/Python/Node.js).

---

## 4. Các Mô hình Mua EC2 (Purchasing Options)

Hiểu rõ sự đánh đổi giữa **Chi phí (Cost)**, **Cam kết (Commitment)** và **Khả năng gián đoạn (Interruption)** là trọng tâm của Domain 4.

| Mô hình | Giảm giá | Cam kết | Khả năng bị thu hồi | Use Case phù hợp |
| :--- | :--- | :--- | :--- | :--- |
| **On-Demand** | 0% (Giá chuẩn) | Không | Không | Workload ngắn hạn, không thể đoán trước, không được phép gián đoạn. |
| **Spot Instances** | Lên tới **90%** | Không | **Có** (AWS báo trước **2 phút** qua EC2 Metadata / EventBridge) | Stateless, fault-tolerant, batch jobs, CI/CD, big data (EMR), container workers. **Không dùng** cho DB hoặc critical single-node apps. |
| **Reserved Instances (RI)** | Lên tới **72%** | 1 năm hoặc 3 năm | Không | Workload ổn định, chạy 24/7 (Steady-state). **Standard RI** (giảm sâu nhất, cố định family) vs **Convertible RI** (được đổi family/OS). |
| **Savings Plans** | Lên tới **72%** | Cam kết mức chi tiêu `$/hour` trong 1 hoặc 3 năm | Không | **Compute Savings Plans** (linh hoạt nhất: áp dụng cho EC2 mọi family/Region, Fargate, Lambda) vs **EC2 Instance Savings Plans** (gắn 1 family & 1 Region, giảm sâu hơn). |
| **Dedicated Hosts** | Cao nhất | On-Demand hoặc Reservation | Không (Server vật lý riêng) | Yêu cầu **BYOL (Bring Your Own License)** tính theo per-socket/per-core (Windows Server, SQL Server, Oracle) hoặc compliance cô lập phần cứng vật lý. |
| **Dedicated Instances** | Cao | On-Demand / RI / SP | Không | Chạy trên phần cứng riêng cho 1 AWS Account, nhưng **không giữ cố định host vật lý** sau khi stop/start và không hỗ trợ BYOL theo socket. |
| **Capacity Reservations** | Giá On-Demand | Không cần cam kết 1–3 năm | Không | Đảm bảo luôn có sẵn dung lượng EC2 tại một **AZ cụ thể** cho sự kiện quan trọng hoặc DR. |

> **Exam Tip**: Phân biệt **Dedicated Host** vs **Dedicated Instance**: Nếu đề bài nhắc tới *"existing per-socket, per-core, or per-VM software licenses (BYOL)"* hoặc *"visibility into sockets and physical cores"*, đáp án bắt buộc là **EC2 Dedicated Hosts**. Nếu đề bài cần tiết kiệm chi phí linh hoạt cho cả EC2 và **AWS Fargate / Lambda**, chọn **Compute Savings Plans**.

---

## 5. EC2 Placement Groups

Khi khởi chạy nhiều EC2 instances, bạn có thể kiểm soát cách AWS đặt chúng lên phần cứng vật lý thông qua **Placement Groups**:

| Chiến lược | Cơ chế vật lý | Giới hạn & Phạm vi | Use Case |
| :--- | :--- | :--- | :--- |
| **Cluster** | Gom các instances **sát nhau trong cùng 1 rack/AZ**. | Chỉ trong **1 AZ**. Tối ưu tốc độ mạng (lên tới 100 Gbps, low latency), nhưng rủi ro mất điện/rack ảnh hưởng toàn bộ nhóm. | High Performance Computing (HPC), ứng dụng tight-coupled node-to-node communication. |
| **Spread** | Đặt mỗi instance trên một **phần cứng vật lý (rack/power/network) hoàn toàn riêng biệt**. | Tối đa **7 instances per AZ** trong một Spread Placement Group (có thể trải rộng nhiều AZ). | Ứng dụng trọng yếu cần giảm thiểu rủi ro lỗi đồng thời (blast radius nhỏ nhất). |
| **Partition** | Chia nhóm thành các **Partition** (tối đa **7 partitions per AZ**). Mỗi partition có rack riêng, nhiều instances có thể nằm chung 1 partition. | Có thể trải rộng nhiều AZ, chứa hàng trăm instances. EC2 có thể đọc số Partition từ Instance Metadata. | Big Data phân tán có nhận thức topology: **HDFS, HBase, Cassandra, Apache Kafka**. |

> **Exam Tip**: Nếu đề bài nói cần triển khai **100 nodes Kafka/Cassandra** và muốn phân tách lỗi theo rack, **Spread** sẽ thất bại vì giới hạn 7 instances/AZ — đáp án đúng phải là **Partition Placement Group**.

---

## 6. EC2 User Data vs Instance Metadata (IMDSv2)

### 6.1. EC2 User Data
- Là đoạn script (Bash hoặc PowerShell) chạy **một lần duy nhất** (mặc định) khi EC2 instance khởi động lần đầu tiên (bootstrapping).
- Chạy với quyền **root** (Linux) hoặc Administrator (Windows).
- Dùng để cài đặt packages, cập nhật hệ điều hành, tải file cấu hình từ S3.
- **Lưu ý bảo mật**: Không chứa mật khẩu hoặc secret thô trong User Data vì bất kỳ user nào trên instance (hoặc có quyền `ec2:DescribeInstanceAttribute`) đều đọc được.

### 6.2. Instance Metadata Service (IMDSv1 vs IMDSv2)
Mọi EC2 instance đều có thể truy vấn thông tin của chính nó (Public IP, Instance ID, Placement Partition, IAM Role temporary credentials) tại địa chỉ link-local: `http://169.254.169.254/latest/meta-data/`.

- **IMDSv1 (Cũ - Request/Response)**: Chỉ cần gửi một lệnh `GET` đơn giản. Dễ bị tấn công **SSRF (Server-Side Request Forgery)** nếu ứng dụng web bị lỗi cho phép kẻ tấn công ép server gọi `http://169.254.169.254/latest/meta-data/iam/security-credentials/` và đánh cắp IAM Role credentials.
- **IMDSv2 (Khuyên dùng - Session-oriented)**:
  - Yêu cầu gửi lệnh `PUT` kèm header `X-aws-ec2-metadata-token-ttl-seconds` để lấy một **Session Token** trước, sau đó mới dùng token này trong header `X-aws-ec2-metadata-token` cho các lệnh `GET`.
  - Chặn đứng phần lớn các cuộc tấn công SSRF (vì SSRF thường chỉ thực hiện được `GET` và không thể chèn custom HTTP header qua `PUT`).

```bash
# Ví dụ sử dụng IMDSv2 trên Linux EC2
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

curl -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/iam/security-credentials/
```

> **Exam Tip**: Khi đề bài hỏi làm thế nào để **bảo vệ EC2 Instance Metadata khỏi tấn công SSRF** hoặc ngăn chặn đánh cắp IAM Role credentials trên EC2, đáp án luôn là **bắt buộc sử dụng IMDSv2** (`HttpTokens: required`).

---

[Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/01-iam-fundamentals.md) | [Bài tiếp →](02-iam-org-security.md)
