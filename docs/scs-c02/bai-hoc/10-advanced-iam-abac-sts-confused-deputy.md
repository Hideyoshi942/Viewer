# IAM Chuyên sâu: ABAC, Confused Deputy, Data Perimeter & Federation Hiện đại

Trong kỳ thi **AWS Certified Security - Specialty (SCS-C02)**, Domain 4 (IAM) không chỉ dừng ở việc hiểu `Allow` vs `Deny`. Các câu hỏi ở cấp độ Specialty tập trung sâu vào **Attribute-Based Access Control (ABAC)** quy mô lớn, phòng chống tấn công **Confused Deputy**, xây dựng **Data Perimeter** bằng Global Condition Keys, phân tách quyền truy cập S3 bằng **Access Points & VPC Endpoint Policy**, và loại bỏ long-lived credentials thông qua **IAM Roles Anywhere** & **OIDC Federation**.

---

## 1. Attribute-Based Access Control (ABAC) quy mô lớn

Mô hình **RBAC (Role-Based Access Control)** truyền thống yêu cầu cập nhật IAM Policy mỗi khi có dự án hoặc tài nguyên mới. **ABAC** giải quyết vấn đề này bằng cách cấp quyền dựa trên **Tags (Attributes)** gắn trên Principal (IAM Role/User/Session) và Resource.

### Các Condition Keys cốt lõi trong ABAC

| Condition Key | Ý nghĩa & Phạm vi áp dụng | Ví dụ sử dụng thực tế |
| :--- | :--- | :--- |
| `aws:PrincipalTag/key-name` | Kiểm tra tag gắn trên IAM Principal (hoặc **Session Tag** truyền từ IdP/STS) đang thực hiện request | Chỉ cho phép user có tag `Department=Finance` gọi API |
| `aws:ResourceTag/key-name` | Kiểm tra tag hiện có trên tài nguyên AWS đích | Chỉ cho phép Start/Stop EC2 có cùng tag `Project` với Principal |
| `aws:RequestTag/key-name` | Kiểm tra tag được truyền vào trong **API request tạo/sửa tag** (ví dụ `RunInstances`, `CreateSecret`, `TagResource`) | Bắt buộc khi tạo tài nguyên phải gắn tag `CostCenter` khớp với Principal |
| `aws:TagKeys` | Danh sách tất cả các **tag keys** (chỉ tên key, không gồm value) xuất hiện trong request | Dùng với `ForAllValues:StringEquals` để ngăn user tự ý thêm tag lạ (như `Admin=true`) |

### Mẫu Policy ABAC chuẩn cho kỳ thi SCS-C02

Ví dụ sau cho phép developer chỉ thao tác trên Secrets Manager thuộc đúng dự án của họ, đồng thời **ngăn chặn privilege escalation** (ngăn họ tự sửa tag trên tài nguyên để chiếm quyền):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAccessMatchingProjectTag",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:PutSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:ResourceTag/Project": "${aws:PrincipalTag/Project}",
          "aws:ResourceTag/Env": "${aws:PrincipalTag/Env}"
        }
      }
    },
    {
      "Sid": "EnforceTagOnCreate",
      "Effect": "Allow",
      "Action": "secretsmanager:CreateSecret",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:RequestTag/Project": "${aws:PrincipalTag/Project}"
        },
        "ForAllValues:StringEquals": {
          "aws:TagKeys": ["Project", "Env", "Owner"]
        }
      }
    },
    {
      "Sid": "DenyChangingProjectTag",
      "Effect": "Deny",
      "Action": [
        "secretsmanager:TagResource",
        "secretsmanager:UntagResource"
      ],
      "Resource": "*",
      "Condition": {
        "ForAnyValue:StringEquals": {
          "aws:TagKeys": ["Project", "Env"]
        }
      }
    }
  ]
}
```

> **Exam Tip**: Lỗ hổng kinh điển của ABAC là quên chặn quyền `TagResource` / `UntagResource` hoặc `CreateTags`! Nếu developer có quyền gắn tag `Project=Alpha` lên một tài nguyên của team khác (hoặc gỡ tag), toàn bộ cơ chế ABAC sẽ bị vô hiệu hóa. Ngoài ra, khi liên kết với IdP (SAML 2.0 / OIDC), hãy dùng **STS Session Tags** (`sts:TagSession` trong Trust Policy) để truyền thuộc tính động từ doanh nghiệp sang `aws:PrincipalTag`.

---

## 2. Phòng chống tấn công Confused Deputy (Cross-Service & Cross-Account)

**Confused Deputy Problem** xảy ra khi một thực thể không có quyền trực tiếp (kẻ tấn công) lừa một thực thể có quyền cao hơn (**Deputy** — có thể là một AWS Service như CloudTrail/EventBridge hoặc một bên thứ 3 SaaS) thực hiện hành động trái phép trên tài nguyên của nạn nhân.

### 2.1. Cross-Service Confused Deputy (AWS Service là Deputy)

Khi bạn cấp quyền cho một AWS Service (ví dụ: `s3.amazonaws.com`, `delivery.logs.amazonaws.com`, `sns.amazonaws.com`) truy cập tài nguyên hoặc assume IAM Role trong tài khoản của bạn, kẻ tấn công từ tài khoản khác có thể cấu hình dịch vụ đó trỏ về ARN tài nguyên của bạn.

**Cách phòng chống**: Luôn giới hạn bằng `aws:SourceArn` và/hoặc `aws:SourceAccount` (hoặc `aws:SourceOrgID`) trong **Resource-based Policy** hoặc **IAM Role Trust Policy**.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudTrailWritePreventConfusedDeputy",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudtrail.amazonaws.com"
      },
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::corp-audit-logs/AWSLogs/111122223333/*",
      "Condition": {
        "StringEquals": {
          "s3:x-amz-acl": "bucket-owner-full-control",
          "aws:SourceAccount": "111122223333"
        },
        "ArnLike": {
          "aws:SourceArn": "arn:aws:cloudtrail:us-east-1:111122223333:trail/org-trail"
        }
      }
    }
  ]
}
```

### 2.2. Cross-Account Confused Deputy với bên thứ 3 (SaaS Vendor)

Khi nhiều khách hàng cùng cấp IAM Role cho một SaaS vendor (ví dụ Datadog, Wiz, CrowdStrike) để vendor `sts:AssumeRole` vào tài khoản của họ:
- Nếu kẻ tấn công biết được Role ARN của bạn và nhập Role ARN đó vào dashboard của SaaS vendor dưới tài khoản của kẻ tấn công, SaaS vendor sẽ vô tình assume Role của bạn và hiển thị dữ liệu của bạn cho kẻ tấn công.
- **Cách phòng chống**: Sử dụng `sts:ExternalId` — một chuỗi bí mật duy nhất do SaaS vendor sinh ra cho riêng bạn, và bạn cấu hình bắt buộc kiểm tra trong **Trust Policy** của IAM Role.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::999988887777:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "vendor-unique-id-8f3a9c21"
        }
      }
    }
  ]
}
```

> **Exam Tip**: Phân biệt rõ hai bối cảnh trong đề thi:
> - **AWS Service** gọi sang tài nguyên/Role của bạn → dùng **`aws:SourceArn`** và **`aws:SourceAccount`** (ưu tiên cả hai, đặc biệt `aws:SourceArn` cụ thể nhất).
> - **Third-party AWS Account** (SaaS partner) gọi `sts:AssumeRole` vào tài khoản của bạn → dùng **`sts:ExternalId`**.

---

## 3. Data Perimeter: `aws:PrincipalOrgID`, `aws:ResourceOrgID`, `aws:ViaAWSService` & `aws:CalledVia`

**Data Perimeter** là tập hợp các guardrails đảm bảo chỉ **identities đáng tin cậy** truy cập **tài nguyên đáng tin cậy** từ **mạng lưới đáng tin cậy**.

### Bảng so sánh các Global Condition Keys cho Data Perimeter

| Condition Key | Chức năng | Ứng dụng trong SCP / Resource Policy / VPC Endpoint Policy |
| :--- | :--- | :--- |
| `aws:PrincipalOrgID` | Kiểm tra **Principal gọi API** có thuộc AWS Organization `o-xxxxxxxxxx` không | Gắn trong **S3 Bucket Policy** hoặc **VPC Endpoint Policy** để chặn mọi tài khoản ngoài Org truy cập bucket hoặc đi qua VPC Endpoint |
| `aws:ResourceOrgID` | Kiểm tra **Tài nguyên đích** có thuộc AWS Organization `o-xxxxxxxxxx` không | Gắn trong **SCP** hoặc **VPC Endpoint Policy** để ngăn nhân viên/malware đẩy dữ liệu ra S3 bucket thuộc tài khoản cá nhân ngoài Org (Data Exfiltration) |
| `aws:PrincipalOrgPaths` | Kiểm tra Principal thuộc một **OU (Organizational Unit)** cụ thể (ví dụ `o-xxx/r-xxxx/ou-xxxx-prod/*`) | Giới hạn truy cập tài nguyên Production chỉ cho các tài khoản nằm trong Prod OU |
| `aws:ViaAWSService` | Giá trị `true` khi một AWS Service thực hiện request **thay mặt cho Principal** (ví dụ Athena truy cập S3 thay user, CloudFormation gọi EC2) | Dùng `"Bool": { "aws:ViaAWSService": "false" }` để **ngoại lệ** các AWS Service khỏi rule chặn IP/VPC (tránh làm hỏng Athena, CloudTrail, AWS Config!) |
| `aws:CalledVia` / `aws:CalledViaFirst` / `aws:CalledViaLast` | Danh sách có thứ tự các AWS Service đã chuyển tiếp request thay mặt Principal | Chỉ cho phép truy cập KMS key hoặc S3 nếu request đi qua `athena.amazonaws.com` (chặn truy cập trực tiếp qua CLI) |
| `aws:PrincipalIsAWSService` | Giá trị `true` khi Principal thực hiện lời gọi trực tiếp là một **AWS Service Principal** (ví dụ `cloudtrail.amazonaws.com`) | Ngoại lệ cho các AWS Service Principal khi áp dụng `Deny` nếu `aws:PrincipalOrgID` không khớp |

### Mẫu Data Perimeter trong S3 Bucket Policy (Tránh bẫy làm hỏng AWS Services!)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyAccessOutsideOrgAndVpc",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::sensitive-data-lake",
        "arn:aws:s3:::sensitive-data-lake/*"
      ],
      "Condition": {
        "StringNotEqualsIfExists": {
          "aws:PrincipalOrgID": "o-1234567890",
          "aws:SourceVpce": "vpce-0a1b2c3d4e5f67890"
        },
        "Bool": {
          "aws:ViaAWSService": "false",
          "aws:PrincipalIsAWSService": "false"
        }
      }
    }
  ]
}
```

> **Exam Tip**: Khi câu hỏi yêu cầu *"Chặn mọi truy cập vào S3 từ bên ngoài VPC (`aws:SourceVpce` / `aws:SourceVpc`), NHƯNG vẫn cho phép AWS Config, CloudTrail hoặc Amazon Athena đọc/ghi bucket"*, đáp án đúng BẮT BUỘC phải có điều kiện ngoại lệ **`"Bool": { "aws:ViaAWSService": "false" }`** (cho dịch vụ chạy thay mặt user như Athena) và/hoặc **`"aws:PrincipalIsAWSService": "false"`** (cho dịch vụ chạy bằng Service Principal như CloudTrail). Nếu không có, mọi AWS managed service sẽ bị `Explicit Deny`!

---

## 4. S3 Bucket Policy vs S3 Access Points vs VPC Endpoint Policy

Khi một S3 bucket được chia sẻ cho hàng chục đội ngũ/ứng dụng (ví dụ Data Lake), việc nhồi nhét tất cả rule vào một S3 Bucket Policy (giới hạn **20 KB**) trở nên bất khả thi và rủi ro bảo mật cao.

### Kiến trúc phân tách quyền truy cập

| Cơ chế | Giới hạn & Phạm vi | Trường hợp sử dụng tối ưu |
| :--- | :--- | :--- |
| **S3 Bucket Policy** | Tối đa **20 KB** / bucket. Áp dụng ở cấp toàn bộ bucket | Đặt baseline guardrail (yêu cầu TLS `aws:SecureTransport`, yêu cầu mã hóa KMS, delegate quyền sang Access Points) |
| **S3 Access Points** | Hàng nghìn Access Point / bucket; mỗi AP có hostname, **Access Point Policy** riêng và có thể khóa **Network Origin = VPC** | Tách quyền cho từng team/ứng dụng (Finance AP, Analytics AP) với prefix & VPC riêng mà không làm phình Bucket Policy |
| **VPC Endpoint Policy** | Áp dụng trên **Gateway/Interface VPC Endpoint** | Kiểm soát luồng traffic đi **RA** từ VPC (chỉ cho phép truy cập bucket thuộc Org qua `aws:ResourceOrgID`, chặn đẩy data ra bucket lạ) |

### Delegate quản lý quyền từ Bucket Policy sang Access Points

Để ép buộc mọi truy cập đi qua Access Points (trừ tài khoản quản trị):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DelegateToAccessPointsInAccount",
      "Effect": "Allow",
      "Principal": { "AWS": "*" },
      "Action": "*",
      "Resource": [
        "arn:aws:s3:::corp-datalake",
        "arn:aws:s3:::corp-datalake/*"
      ],
      "Condition": {
        "StringEquals": {
          "s3:DataAccessPointAccount": "111122223333"
        }
      }
    }
  ]
}
```

> **Exam Tip**: Phân biệt `aws:SourceVpce` vs `aws:SourceVpc`:
> - `aws:SourceVpce`: Khớp chính xác **VPC Endpoint ID** (`vpce-xxx`). Dùng được cho cả **Gateway Endpoint** (S3/DynamoDB) và **Interface Endpoint**.
> - `aws:SourceVpc`: Khớp **VPC ID** (`vpc-xxx`). Chỉ có mặt khi request đi qua **Gateway VPC Endpoint** hoặc **Interface VPC Endpoint** (KHÔNG có mặt nếu EC2 đi qua NAT Gateway/IGW ra Internet vào public S3 endpoint!).
> - Để kiểm soát **chỉ cho phép truy cập từ VPC cụ thể**, nhớ kiểm tra cả **Bucket Policy** (kiểm soát đường vào bucket) VÀ **VPC Endpoint Policy** (kiểm soát đường ra từ VPC).

---

## 5. Loại bỏ Long-Lived Credentials: IAM Roles Anywhere & OIDC GitHub Actions

Xu hướng mạnh mẽ trong SCS-C02 là **loại bỏ hoàn toàn IAM User Access Keys** cho workload chạy ngoài AWS (on-premises server, CI/CD pipeline).

### 5.1. IAM Roles Anywhere (On-Premises Workloads với X.509 Certificate)

Cho phép các server, container hoặc ứng dụng chạy **on-premises / hybrid cloud** nhận **temporary AWS credentials** bằng chứng chỉ số **X.509** thay vì lưu cứng Access Key.

**Các thành phần kiến trúc bắt buộc**:
1. **Trust Anchor**: Chứng chỉ Root/Intermediate CA (có thể liên kết trực tiếp với **AWS Private CA** hoặc upload **External CA certificate bundle**).
2. **Profile**: Khai báo danh sách các **IAM Roles** được phép assume và tùy chọn gắn **Session Policy** để thu hẹp quyền.
3. **IAM Role Trust Policy**: Cho phép principal `rolesanywhere.amazonaws.com` thực hiện `sts:AssumeRole`, `sts:TagSession`, và `sts:SetSourceIdentity`.
4. **Credential Helper** (`aws_signing_helper`): Công cụ cài trên máy chủ on-premises, dùng private key + X.509 cert để ký request tới IAM Roles Anywhere và lấy STS temporary credentials.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "rolesanywhere.amazonaws.com"
      },
      "Action": [
        "sts:AssumeRole",
        "sts:TagSession",
        "sts:SetSourceIdentity"
      ],
      "Condition": {
        "ArnEquals": {
          "aws:SourceArn": "arn:aws:rolesanywhere:us-east-1:111122223333:trust-anchor/a1b2c3d4"
        },
        "StringEquals": {
          "aws:PrincipalTag/x509Subject/OU": "OnPrem-AppServers"
        }
      }
    }
  ]
}
```

### 5.2. OIDC Federation cho CI/CD (GitHub Actions / GitLab CI)

Thay vì tạo IAM User và lưu `AWS_ACCESS_KEY_ID` trong GitHub Secrets:
1. Tạo **IAM OIDC Identity Provider** trong AWS với URL `https://token.actions.githubusercontent.com` và Audience `sts.amazonaws.com`.
2. Tạo IAM Role với Trust Policy cho phép `sts:AssumeRoleWithWebIdentity`, bắt buộc khóa chặt claim **`sub`** (repository + branch/environment) và **`aud`**.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::111122223333:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:my-org/payment-service:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

> **Exam Tip**: Luôn kiểm tra kỹ điều kiện `sub` trong OIDC Trust Policy! Nếu đề bài đưa ra phương án chỉ kiểm tra `aud: sts.amazonaws.com` mà **không kiểm tra `sub`** (hoặc dùng `StringLike` quá rộng như `repo:*`), BẤT KỲ repository công khai nào trên GitHub cũng có thể assume Role của bạn! Đây là bẫy cực kỳ phổ biến trong các câu hỏi về CI/CD security.

---

## Tóm tắt nhanh cho phòng thi

- **ABAC**: `aws:PrincipalTag` + `aws:ResourceTag` + `aws:RequestTag` + `aws:TagKeys`, và **luôn nhớ Deny sửa/xóa tag nhạy cảm**.
- **Confused Deputy**: AWS Service → `aws:SourceArn` + `aws:SourceAccount`; SaaS bên thứ 3 → `sts:ExternalId`.
- **Data Perimeter**: `aws:PrincipalOrgID` (ai được vào), `aws:ResourceOrgID` (được đi tới tài nguyên nào), `aws:ViaAWSService: false` (tránh chặn nhầm Athena/CloudTrail/Config).
- **S3 Scale**: Bucket Policy > 20 KB hoặc nhiều team → **S3 Access Points** + khóa Network Origin là VPC.
- **No Static Keys**: On-prem có PKI/X.509 → **IAM Roles Anywhere**; GitHub Actions/GitLab → **IAM OIDC Provider + `sts:AssumeRoleWithWebIdentity`** có khóa chặt `sub` claim.

---

[← Bài trước](09-iam-identity-center-verified-access-zero-trust.md) | [Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/10-iam-access-analyzer-cross-account.md) | [Bài tiếp →](11-kms-encryption-data-protection.md)
