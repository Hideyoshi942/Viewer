# Bảo mật Workload Hiện đại: IMDSv2, EKS/ECS, Serverless & Nitro Enclaves

Domain 3 (**Infrastructure Security — 20%**) có tỷ trọng cao nhất trong kỳ thi **AWS Certified Security - Specialty (SCS-C02)**. Bên cạnh mạng biên (WAF, Shield, Network Firewall), đề thi ngày càng tập trung mạnh vào bảo mật ở lớp **Compute & Workload**: chặn đánh cắp credential qua SSRF với **IMDSv2**, phát hiện mối đe dọa runtime với **GuardDuty Runtime Monitoring**, quét lỗ hổng container/Lambda với **Amazon Inspector**, ký mã nguồn với **AWS Signer**, phân quyền tối thiểu trên **EKS/ECS**, tính toán bảo mật với **Nitro Enclaves**, và phân tích gói tin chuyên sâu bằng **VPC Traffic Mirroring**.

---

## 1. Bảo vệ EC2 Instance Metadata Service với IMDSv2

**IMDS** (`http://169.254.169.254/latest/meta-data/`) cung cấp temporary IAM credentials cho EC2 Instance Profile.
- **Lỗ hổng của IMDSv1**: Chỉ dùng yêu cầu `GET` đơn giản (request/response). Nếu ứng dụng web trên EC2 bị lỗ hổng **SSRF (Server-Side Request Forgery)** hoặc lỗi cấu hình reverse proxy, kẻ tấn công có thể ép server gọi `GET http://169.254.169.254/...` để đánh cắp IAM Role credentials.
- **Cơ chế bảo vệ của IMDSv2** (Session-oriented):
  1. Bắt buộc gửi yêu cầu **`PUT`** tới `/latest/api/token` kèm header `X-aws-ec2-metadata-token-ttl-seconds` để lấy **Session Token** (đa số lỗ hổng SSRF chỉ hỗ trợ `GET` và không cho phép chèn custom header).
  2. Chặn yêu cầu có chứa header `X-Forwarded-For` (chống tấn công qua open proxy/WAF misconfiguration).
  3. Dùng Token đó trong header `X-aws-ec2-metadata-token` cho các lệnh `GET` tiếp theo.
  4. **IP Hop Limit mặc định = 1**: Gói tin phản hồi từ IMDS có TTL = 1.

### Bẫy Hop Limit = 1 đối với Container trên EC2!
- Khi chạy **Docker / ECS / EKS** trên EC2 (chế độ `bridge` networking), traffic từ container tới IMDS phải đi qua 2 hop (Container → Host bridge → IMDS).
- **Best Practice bảo mật**: Giữ **`HttpPutResponseHopLimit = 1`** để **CHẶN hoàn toàn** các container trên EC2 đánh cắp quyền của **EC2 Node Instance Profile**, và bắt buộc container phải lấy quyền riêng thông qua **ECS Task Role** hoặc **EKS IRSA / Pod Identity**!

### Cưỡng chế IMDSv2 trên toàn tổ chức

1. **Cấp EC2 Instance / Launch Template**:
   ```bash
   aws ec2 modify-instance-metadata-options \
     --instance-id i-0123456789abcdef0 \
     --http-tokens required \
     --http-put-response-hop-limit 1 \
     --http-endpoint enabled
   ```
2. **Cấp SCP / IAM Policy** (Chặn tạo EC2 không bật IMDSv2):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "RequireIMDSv2OnRunInstances",
         "Effect": "Deny",
         "Action": "ec2:RunInstances",
         "Resource": "arn:aws:ec2:*:*:instance/*",
         "Condition": {
           "StringNotEquals": {
             "ec2:MetadataHttpTokens": "required"
           }
         }
       }
     ]
   }
   ```
3. **Cấp IAM Role Policy** (Từ chối mọi API call dùng credentials lấy từ IMDSv1):
   ```json
   {
     "Sid": "DenyIMDSv1Credentials",
     "Effect": "Deny",
     "Action": "*",
     "Resource": "*",
     "Condition": {
       "NumericLessThan": {
         "ec2:RoleDelivery": "2.0"
       }
     }
   }
   ```

> **Exam Tip**: Nhớ chính xác 2 Condition Keys cực hay ra thi:
> - `ec2:MetadataHttpTokens: required` → dùng trong SCP để chặn khởi chạy EC2 mới cho phép IMDSv1.
> - `ec2:RoleDelivery: "2.0"` → dùng để chặn các lời gọi API sử dụng token lấy từ IMDSv1 (kể cả trên các EC2 cũ đang chạy).

---

## 2. GuardDuty Runtime Monitoring & Amazon Inspector (Container/Lambda/SBOM)

### 2.1. Amazon GuardDuty Runtime Monitoring
Khác với GuardDuty cơ bản (chỉ phân tích log ngoài như CloudTrail, VPC Flow Logs, DNS Logs), **GuardDuty Runtime Monitoring** sử dụng một **security agent nhẹ (eBPF-based)** chạy ở cấp OS/kernel để giám sát hành vi thời gian thực trên:
- **Amazon EKS** (cài tự động dưới dạng EKS Add-on)
- **Amazon ECS** (hỗ trợ cả **AWS Fargate** và EC2 launch type — tự động inject sidecar/agent)
- **Amazon EC2** (tự động cài đặt & quản lý thông qua SSM Agent)

**Phát hiện được các mối đe dọa mà log mạng không thấy**: Reverse shell, leo thang đặc quyền container escape, thực thi binary độc hại từ `/tmp`, truy cập tệp nhạy cảm `/etc/shadow`, hoặc đào tiền ảo (cryptomining) ở mức tiến trình OS.

### 2.2. Amazon Inspector v2: Continuous Scanning & SBOM
- **Amazon EC2**: Quét CVE phần mềm (qua SSM Agent) và **Network Reachability** (không cần agent, phân tích SG/NACL/Route Table xem cổng có bị lộ ra Internet không).
- **Amazon ECR (Container Images)**: Hỗ trợ **Enhanced Scanning** (quét liên tục cả OS packages và thư viện ngôn ngữ lập trình như npm, pip, Maven; tự động quét lại khi có CVE mới).
- **AWS Lambda**: Quét lỗ hổng trong **application dependencies** (Standard Scanning) và **custom application code** (Code Scanning — phát hiện SQLi, hardcoded secrets, insecure crypto).
- **SBOM (Software Bill of Materials)**: Inspector cho phép xuất danh sách toàn bộ thành phần phần mềm theo chuẩn **CycloneDX** hoặc **SPDX** ra S3 bucket (mã hóa KMS) để đáp ứng yêu cầu tuân thủ chuỗi cung ứng phần mềm (Supply Chain Security).

---

## 3. AWS Signer cho AWS Lambda (Code Signing)

Để đảm bảo **chỉ mã nguồn đã được ký duyệt (signed) và không bị chỉnh sửa** mới được deploy lên AWS Lambda:
1. Tạo **Signing Profile** trong **AWS Signer** (chọn nền tảng `AWSLambda-SHA384-ECDSA`).
2. Trong CI/CD pipeline, đóng gói file `.zip` lên S3 và chạy **Signing Job** để AWS Signer ký số gói code.
3. Tạo **Lambda Code Signing Configuration (CSC)** liên kết với Signing Profile ARN, chọn chính sách xử lý khi chữ ký không hợp lệ:
   - `Warn`: Vẫn cho deploy nhưng ghi log cảnh báo CloudWatch.
   - **`Enforce`**: **Từ chối (block)** hoàn toàn việc deploy nếu code không có chữ ký hợp lệ hoặc bị sửa đổi.
4. Gắn CSC vào Lambda Function.

> **Exam Tip**: AWS Signer kết hợp với Lambda CSC bảo vệ chống lại việc chỉnh sửa code trái phép (tampering) hoặc deploy artifact không rõ nguồn gốc. Lưu ý: nếu muốn **ngăn nhà phát triển tự gỡ bỏ CSC** khỏi Lambda function, hãy thêm SCP/IAM Deny cho hành động `lambda:DeleteFunctionCodeSigningConfig` và `lambda:PutFunctionCodeSigningConfig`.

---

## 4. Phân quyền tối thiểu (Least Privilege) cho EKS & ECS

### 4.1. Amazon EKS: IRSA vs EKS Pod Identity

| Tiêu chí | IRSA (IAM Roles for Service Accounts) | EKS Pod Identity (Hiện đại, khuyến nghị) |
| :--- | :--- | :--- |
| **Cơ chế xác thực** | Dùng **OIDC Identity Provider** gắn với từng EKS Cluster | Dùng **EKS Pod Identity Agent** (DaemonSet) gọi trực tiếp EKS Auth API (`pods.eks.amazonaws.com`) |
| **IAM Role Trust Policy** | Phải cấu hình riêng cho **từng Cluster OIDC URL** và `sub` (khó tái sử dụng across clusters) | Tái sử dụng **1 IAM Role cho nhiều Cluster** dễ dàng với Principal `pods.eks.amazonaws.com` + `sts:AssumeRole` & `sts:TagSession` |
| **Quản lý ánh xạ** | Gắn Annotation trên Kubernetes ServiceAccount | Quản lý tập trung qua AWS API (`CreatePodIdentityAssociation`), tự động truyền Session Tags (cluster, namespace, pod name) |

### 4.2. Amazon ECS: Task Role vs Task Execution Role

Đây là cặp khái niệm **cực hay bị nhầm lẫn** trong đề thi SCS-C02:

| Loại Role | Ai sử dụng? | Quyền điển hình cần cấp |
| :--- | :--- | :--- |
| **Task Execution Role** | **ECS Agent / Fargate infrastructure** (hạ tầng chạy container) | `ecr:GetAuthorizationToken`, `ecr:BatchGetImage` (pull image từ ECR), `logs:CreateLogStream` / `logs:PutLogEvents` (đẩy log lên CloudWatch), `secretsmanager:GetSecretValue` / `ssm:GetParameters` (inject secret vào biến môi trường lúc khởi động container) |
| **Task Role** | **Code ứng dụng chạy bên trong container** | `s3:GetObject`, `dynamodb:PutItem`, `sqs:SendMessage`, `kms:Decrypt` (khi ứng dụng tự gọi AWS SDK trong runtime) |

> **Exam Tip**: Nếu đề bài mô tả *"Container trên Fargate không thể pull image từ ECR hoặc không đẩy được log về CloudWatch Logs"*, hãy kiểm tra **Task Execution Role**. Nếu container đã chạy lên nhưng *"code ứng dụng báo AccessDenied khi đọc DynamoDB hoặc S3"*, hãy kiểm tra **Task Role**.

---

## 5. AWS Nitro Enclaves (Confidential Computing)

**AWS Nitro Enclaves** cho phép tách một phần CPU và Memory từ một EC2 instance thành một môi trường tính toán **cô lập hoàn toàn (isolated VM)** để xử lý dữ liệu siêu nhạy cảm (PII, dữ liệu y tế, khóa ký tài chính, thuật toán độc quyền).

### Đặc điểm bảo mật cốt lõi của Nitro Enclaves
- **Không có lưu trữ bền vững (No persistent storage)**, **không có quyền truy cập tương tác (No SSH/shell)**, và **không có kết nối mạng ngoài (No external networking)**.
- Chỉ giao tiếp với EC2 host (parent instance) qua một kênh cục bộ duy nhất là **vsock (Virtual Socket)**.
- **Cryptographic Attestation với AWS KMS**: Nitro Hypervisor tạo ra tài liệu chứng thực (Attestation Document) chứa các giá trị hash (PCR0, PCR1, PCR2...) của image chạy trong Enclave.
- Trong **KMS Key Policy**, bạn dùng Condition Key **`kms:RecipientAttestation:ImageSha384`** (PCR0) để đảm bảo **CHỈ đúng Enclave image đã được phê duyệt** mới giải mã được dữ liệu. Ngay cả **Root/Admin trên EC2 host** cũng không đọc được dữ liệu plaintext bên trong Enclave!

```json
{
  "Sid": "AllowDecryptOnlyFromApprovedNitroEnclave",
  "Effect": "Allow",
  "Principal": { "AWS": "arn:aws:iam::111122223333:role/EnclaveHostRole" },
  "Action": "kms:Decrypt",
  "Resource": "*",
  "Condition": {
    "StringEqualsIgnoreCase": {
      "kms:RecipientAttestation:ImageSha384": "a1b2c3d4e5f6...approved-enclave-pcr0-hash"
    }
  }
}
```

---

## 6. VPC Traffic Mirroring vs VPC Flow Logs

| Tiêu chí | VPC Flow Logs | VPC Traffic Mirroring |
| :--- | :--- | :--- |
| **Dữ liệu thu thập** | **Metadata** ở Layer 3/4 (Source/Dest IP, Port, Protocol, Action ACCEPT/REJECT, Byte count) | **Toàn bộ gói tin (Full Packet Payload)** từ Layer 2 đến Layer 7 |
| **Mục đích chính** | Điều tra kết nối mạng bị chặn, phát hiện port scan, giám sát lưu lượng tổng thể | **Deep Packet Inspection (DPI)**, IDS/IPS bên thứ 3 (Suricata, Zeek), phân tích payload tìm dữ liệu rò rỉ hoặc tấn công Layer 7 |
| **Đích đến (Destination)** | CloudWatch Logs, S3, Amazon Data Firehose | **ENI**, **Network Load Balancer (NLB)**, hoặc **Gateway Load Balancer Endpoint (GWLBE)** (đóng gói qua VXLAN UDP port 4789) |
| **Yêu cầu hạ tầng** | Bật ở cấp VPC, Subnet hoặc ENI (không phụ thuộc loại instance) | Chỉ hỗ trợ **EC2 Nitro-based instances** (và một số non-Nitro cũ được chọn lọc) |

> **Exam Tip**: Khi đề thi yêu cầu *"kiểm tra nội dung payload của gói tin (deep packet inspection / packet capture / forensic packet analysis) gửi tới thiết bị IDS/IPS bên thứ 3 mà không cài agent lên EC2"*, đáp án chuẩn là **VPC Traffic Mirroring** (với Target là NLB/GWLBE). Lưu ý: **Traffic Mirroring KHÔNG bắt được lưu lượng DNS tới Amazon DNS (`.2`), DHCP, IMDS (`169.254.169.254`), và NTP**.

---

[← Bài trước](06-vpc-network-firewall-traffic-mirroring.md) | [Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/07-infra-compute-container-ssm.md) | [Bài tiếp →](08-iam-policy-evaluation-federation.md)
