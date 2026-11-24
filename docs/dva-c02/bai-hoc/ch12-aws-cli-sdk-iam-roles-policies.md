# Chương 12 – AWS CLI, SDK, IAM Roles & Policies

> **Nguồn:** 7 video của chương + *Quiz 9 – AWS IAM, CLI, & SDK Quiz*.
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay.

## Mục tiêu chương

Sau chương này bạn có thể:

- Giải thích EC2 Instance Metadata Service (IMDS), phân biệt IMDSv1 và IMDSv2, và truy vấn metadata/credentials từ bên trong EC2.
- Quản lý nhiều tài khoản AWS bằng **CLI profiles**.
- Dùng **MFA** với CLI thông qua `sts get-session-token`.
- Hiểu vai trò của **AWS SDK** và thời điểm dùng SDK thay cho CLI.
- Xử lý lỗi throttling bằng **Exponential Backoff**, phân biệt *API rate limit* và *Service Quota*.
- Hiểu cách AWS xác thực request bằng **Signature Version 4 (SigV4)**.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001–002 | AWS EC2 Instance Metadata | Bài 1 – EC2 Instance Metadata Service (IMDS) |
| 003 | AWS CLI Profiles | Bài 2 – AWS CLI Profiles |
| 004 | AWS CLI with MFA | Bài 3 – Dùng MFA với AWS CLI |
| 005 | AWS SDK Overview | Bài 4 – AWS SDK |
| 006 | Exponential Backoff & Service Limit Increase | Bài 5 – Giới hạn của AWS và Exponential Backoff |
| 007 | AWS Signature v4 Signing (SigV4) | Bài 6 – AWS Signature Version 4 (SigV4) |
| Quiz 9 | AWS IAM, CLI, & SDK Quiz | Câu hỏi ôn tập |

---

## Bài 1 – EC2 Instance Metadata Service (IMDS)

### Lý thuyết

- **IMDS** cho phép một EC2 instance **tự biết thông tin về chính nó** mà **không cần IAM Role**.
- Địa chỉ cố định (link-local, chỉ truy cập được từ bên trong instance):
  `http://169.254.169.254/latest/`
  - `.../meta-data/`: **metadata**, tức thông tin về instance (instance-id, hostname, local-ipv4, public-ipv4, AZ, AMI…).
  - `.../user-data`: **user data**, tức script khởi động (bootstrap) của instance.
- Từ IMDS bạn **lấy được tên IAM Role** và **credentials tạm thời** của role, nhưng **không xem được IAM Policy** gắn vào role.
- Quy ước đường dẫn: có dấu `/` ở cuối là "thư mục" (còn mục con), không có `/` là một giá trị.

#### IMDSv1 và IMDSv2

| | IMDSv1 | IMDSv2 |
|---|---|---|
| Cách gọi | Gọi thẳng URL bằng `GET` | 2 bước: lấy **session token** bằng `PUT`, rồi gọi URL kèm token trong header |
| Bảo mật | Thấp, dễ bị khai thác qua lỗ hổng SSRF | Cao hơn, là **mặc định** trên Amazon Linux 2023 |
| Khi gọi kiểu v1 trên AL2023 | — | Trả về **401 Unauthorized** |

### Kiến thức thực tế

- **CLI và SDK tự động** lấy credentials từ IMDS khi chạy trên EC2 có role. Bạn không phải tự gọi các URL trên trong code; bài hands-on chỉ để hiểu cơ chế bên dưới.
- **Bắt buộc IMDSv2** cho instance cũ:

  ```bash
  aws ec2 modify-instance-metadata-options --instance-id i-0123456789abcdef0 \
    --http-tokens required --http-endpoint enabled
  ```

  Có thể ép buộc ở cấp tổ chức bằng điều kiện IAM `ec2:MetadataHttpTokens = required` hoặc qua *EC2 account-level defaults*.
- **Container trên EC2** (Docker, EKS) gọi IMDSv2 có thể bị timeout vì mặc định `http-put-response-hop-limit = 1`. Tăng lên **2** nếu container cần truy cập IMDS. Với ECS/EKS, nên dùng **task role / IRSA / Pod Identity** thay vì role của node.
- **Không bao giờ** chạy `aws configure` với access key cá nhân trên EC2. Luôn dùng **IAM Role (Instance Profile)**.

### Ghi nhớ cho kỳ thi

- URL metadata: **`http://169.254.169.254/latest/meta-data`**. Đề hay đưa đáp án nhiễu kiểu `254.169.254.169`.
- `meta-data` là thông tin instance; `user-data` là script khởi động.
- Lấy được **tên role và credentials tạm thời**, **không** lấy được **policy**.
- CLI trên EC2 có role dùng **Instance Metadata** để lấy credentials **tạm thời**.

---

## Bài 2 – AWS CLI Profiles

### Lý thuyết

- Cấu hình CLI nằm trong thư mục `~/.aws/` (Windows: `%USERPROFILE%\.aws\`):
  - `credentials`: access key / secret key.
  - `config`: region, output format.
- `aws configure` ghi vào profile **`default`**.
- Khi có **nhiều tài khoản AWS**, tạo thêm **profile có tên**:

  ```bash
  aws configure --profile my-other-account
  ```

- Mặc định lệnh chạy với `default`. Muốn dùng profile khác thì thêm `--profile`:

  ```bash
  aws s3 ls                              # dùng profile default
  aws s3 ls --profile my-other-account   # dùng profile khác
  ```

Nội dung file sau khi cấu hình:

```ini
# ~/.aws/credentials
[default]
aws_access_key_id = AKIA...
aws_secret_access_key = ...

[my-other-account]
aws_access_key_id = AKIA...
aws_secret_access_key = ...
```

```ini
# ~/.aws/config
[default]
region = ap-southeast-1

[profile my-other-account]
region = us-west-2
```

> Lưu ý: trong `config`, profile khác `default` phải viết là `[profile ten]`; trong `credentials` thì chỉ viết `[ten]`.

### Kiến thức thực tế

- Đặt profile mặc định cho cả phiên terminal thay vì gõ `--profile` mỗi lần:

  ```bash
  export AWS_PROFILE=my-other-account        # Linux/macOS
  $env:AWS_PROFILE = "my-other-account"      # PowerShell
  ```

- Kiểm tra mình đang là ai trước khi chạy lệnh nguy hiểm:

  ```bash
  aws sts get-caller-identity --profile my-other-account
  ```

- **Thực tế hiện nay** nên dùng **IAM Identity Center (SSO)** thay cho access key dài hạn:

  ```bash
  aws configure sso          # thiết lập 1 lần
  aws sso login --profile dev
  ```

- **Assume role sang tài khoản khác** bằng profile, không cần tạo access key ở tài khoản đích:

  ```ini
  [profile prod-admin]
  role_arn = arn:aws:iam::111122223333:role/Admin
  source_profile = default
  mfa_serial = arn:aws:iam::444455556666:mfa/kiet
  ```

- **Thứ tự ưu tiên credentials** (credential provider chain) của CLI/SDK: tham số dòng lệnh → biến môi trường (`AWS_ACCESS_KEY_ID`…) → file `credentials`/`config` (bao gồm SSO, assume role) → container credentials (ECS) → **instance profile (IMDS)**.

### Ghi nhớ cho kỳ thi

- Bài này ít xuất hiện trong đề, nhưng là kỹ năng bắt buộc của developer.
- Nắm thứ tự ưu tiên credentials vì đề hay hỏi: "biến môi trường ghi đè file config".

---

## Bài 3 – Dùng MFA với AWS CLI

### Lý thuyết

- Để gọi API với MFA từ CLI/SDK, bạn phải tạo **phiên tạm thời** bằng API **`STS GetSessionToken`**.
- Truyền vào: **serial number (ARN)** của thiết bị MFA, **mã token** hiện tại, và (tuỳ chọn) thời lượng phiên.
- Nhận về **credentials tạm thời** gồm `AccessKeyId`, `SecretAccessKey`, `SessionToken` và `Expiration`.

### Kiến thức thực tế

- Access key tạm thời bắt đầu bằng **`ASIA`**; access key dài hạn bắt đầu bằng **`AKIA`**.
- Thời lượng `GetSessionToken`: mặc định **12 giờ**, từ 15 phút đến 36 giờ (tài khoản root tối đa 1 giờ).
- Dùng MFA để **bắt buộc** cho hành động nhạy cảm bằng điều kiện trong policy:

  ```json
  {
    "Effect": "Deny",
    "Action": ["ec2:TerminateInstances"],
    "Resource": "*",
    "Condition": { "BoolIfExists": { "aws:MultiFactorAuthPresent": "false" } }
  }
  ```

- Không muốn sửa file thủ công thì cấu hình `mfa_serial` trong profile assume role (xem Bài 2); CLI sẽ tự hỏi mã MFA.

### Ghi nhớ cho kỳ thi

- Gọi API bảo vệ bằng MFA thì dùng **`STS GetSessionToken`**. Đề hay đưa đáp án nhiễu `GetFederationToken` hoặc `IAM GetMFAToken` (API này không tồn tại).
- Kết quả gồm 3 thành phần: **Access Key ID, Secret Access Key, Session Token**.

---

## Bài 4 – AWS SDK

### Lý thuyết

- **SDK (Software Development Kit)** dùng để gọi AWS API **trực tiếp từ code ứng dụng**, thay vì dùng CLI.
- SDK chính thức có cho nhiều ngôn ngữ: Java, .NET, Node.js/JavaScript, PHP, Python (**boto3**), Go, Ruby, C++, Rust, Kotlin, Swift…
- **AWS CLI v1 được viết bằng Python và dùng boto3** (botocore).
- Dùng SDK khi ứng dụng cần tương tác với dịch vụ AWS (ví dụ đọc/ghi DynamoDB, upload S3). Phần Lambda trong khoá sẽ dùng SDK nhiều.

### Kiến thức thực tế

Ví dụ upload file lên S3 bằng Python (boto3) và Node.js (SDK v3):

```python
import boto3

s3 = boto3.client("s3", region_name="ap-southeast-1")
s3.upload_file("report.pdf", "my-bucket", "reports/report.pdf")
# Không truyền access key: SDK tự tìm theo credential provider chain
```

```javascript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: "ap-southeast-1" });
await s3.send(new PutObjectCommand({
  Bucket: "my-bucket",
  Key: "hello.txt",
  Body: "Hello AWS",
}));
```

- **Không bao giờ hard-code** access key trong code. Trên EC2/Lambda/ECS thì dùng role. Trên máy local thì dùng profile/SSO. Trên server on-premises thì dùng IAM user riêng cho ứng dụng (hoặc *IAM Roles Anywhere*).
- Nếu không chỉ định region, nhiều SDK mặc định dùng **`us-east-1`** hoặc báo lỗi thiếu region. Hãy luôn cấu hình region rõ ràng.

### Ghi nhớ cho kỳ thi

- Ứng dụng cần gọi AWS API thì dùng **SDK**.
- Đề cũ hỏi "AWS CLI cần runtime gì" với đáp án **Python**. Thực tế **CLI v2** đã đóng gói sẵn trình thông dịch, không cần cài Python riêng.

---

## Bài 5 – Giới hạn của AWS và Exponential Backoff

### Lý thuyết

#### Hai loại giới hạn

| Loại | Ý nghĩa | Ví dụ | Khi vượt thường xuyên |
|---|---|---|---|
| **API Rate Limits** | Số lần gọi API trong một khoảng thời gian | EC2 `DescribeInstances` khoảng 100 call/s; S3 `GetObject` **5.500 GET/s mỗi prefix** | Xin **tăng API throttling limit** |
| **Service Quotas** (Service Limits) | Số lượng tài nguyên được chạy | On-Demand Standard instances: 1.152 vCPU | Mở ticket hoặc dùng **Service Quotas API** |

#### Exponential Backoff

- Dùng khi gặp lỗi **tạm thời** do bị throttle (`ThrottlingException`).
- **SDK đã tích hợp sẵn** cơ chế retry này. Nếu bạn **tự gọi HTTP API** thì phải tự cài đặt.
- **Chỉ retry** với lỗi **5xx** (lỗi server) và lỗi throttling.
- **Không retry** lỗi **4xx** (lỗi client), vì gửi lại vẫn sai.
- Cách hoạt động: mỗi lần retry, thời gian chờ **tăng gấp đôi**, ví dụ 1s → 2s → 4s → 8s → 16s. Khi nhiều client cùng làm vậy, tải lên server giảm dần và server phục hồi được.

### Kiến thức thực tế

- AWS khuyến nghị **exponential backoff có jitter** (thêm độ ngẫu nhiên), để tránh việc hàng nghìn client retry **cùng lúc** gây quá tải lần nữa.

  ```python
  import random, time
  from botocore.exceptions import ClientError

  def call_with_backoff(fn, max_retries=6, base=0.5, cap=20):
      for attempt in range(max_retries):
          try:
              return fn()
          except ClientError as e:
              status = e.response["ResponseMetadata"]["HTTPStatusCode"]
              code = e.response["Error"]["Code"]
              retryable = status >= 500 or code in ("ThrottlingException", "Throttling",
                                                    "TooManyRequestsException",
                                                    "ProvisionedThroughputExceededException")
              if not retryable or attempt == max_retries - 1:
                  raise
              time.sleep(random.uniform(0, min(cap, base * 2 ** attempt)))  # "full jitter"
  ```

- Thường **không cần tự viết**: cấu hình retry của SDK là đủ.

  ```python
  from botocore.config import Config
  s3 = boto3.client("s3", config=Config(retries={"max_attempts": 10, "mode": "adaptive"}))
  ```

  CLI dùng biến môi trường `AWS_RETRY_MODE=standard|adaptive` và `AWS_MAX_ATTEMPTS=10`.
- Xem và xin tăng quota trên console **Service Quotas**, hoặc bằng CLI:

  ```bash
  aws service-quotas list-service-quotas --service-code ec2
  aws service-quotas request-service-quota-increase \
    --service-code ec2 --quota-code L-1216C47A --desired-value 256
  ```

- Với S3, có thể **tăng throughput** bằng cách chia dữ liệu ra **nhiều prefix**, vì giới hạn tính theo từng prefix.

### Ghi nhớ cho kỳ thi

- Gặp **`ThrottlingException`** hoặc vượt giới hạn API/giây thì chọn **Exponential Backoff**, không chọn backoff tuyến tính hay gọi đều đặn.
- **Retry 5xx và throttling, không retry 4xx.**
- Bị throttle **liên tục** do tải thật sự cao thì **xin tăng limit**.

---

## Bài 6 – AWS Signature Version 4 (SigV4)

### Lý thuyết

- Mọi request HTTP tới AWS API phải được **ký** bằng credentials (access key + secret key) để AWS biết **bạn là ai** và **có quyền** hay không.
- Chuẩn ký hiện nay là **SigV4**.
- **CLI và SDK tự ký** cho bạn. Chỉ khi tự viết code gọi HTTP API trực tiếp thì mới phải tự ký.
- Một số request không cần ký, ví dụ đọc **object public** trên S3.
- Không cần biết chi tiết 4 bước ký, nhưng cần nhớ **2 cách gửi chữ ký**:
  1. **HTTP header `Authorization`** (cách CLI/SDK dùng):

     ```
     Authorization: AWS4-HMAC-SHA256 Credential=AKIA.../20261014/ap-southeast-1/s3/aws4_request,
       SignedHeaders=host;x-amz-date, Signature=fe5f80f77d5fa3beca038a248ff027d0...
     ```

  2. **Query string** trong URL, với chữ ký nằm ở tham số **`X-Amz-Signature`**:

     ```
     https://bucket.s3.amazonaws.com/coffee.jpg
       ?X-Amz-Algorithm=AWS4-HMAC-SHA256
       &X-Amz-Credential=.../20261014/ap-southeast-1/s3/aws4_request
       &X-Amz-Date=20261014T120000Z
       &X-Amz-Expires=300
       &X-Amz-SignedHeaders=host
       &X-Amz-Security-Token=...
       &X-Amz-Signature=...
     ```

- Trong video, khi mở file private trên S3 bằng nút *Open*, console sinh ra URL dạng thứ hai (**pre-signed URL**).

### Kiến thức thực tế

- Tạo **pre-signed URL** để chia sẻ file private có thời hạn:

  ```bash
  aws s3 presign s3://my-bucket/coffee.jpg --expires-in 300
  ```

  ```python
  url = boto3.client("s3").generate_presigned_url(
      "get_object", Params={"Bucket": "my-bucket", "Key": "coffee.jpg"}, ExpiresIn=300)
  ```

- Gặp lỗi **`SignatureDoesNotMatch`** hoặc **`RequestTimeTooSkewed`** thì thường do **sai lệch giờ hệ thống** (chữ ký có timestamp, AWS chỉ chấp nhận lệch khoảng 15 phút) hoặc sai secret key / region.
- Khi tự gọi API (ví dụ API Gateway dùng IAM auth, OpenSearch), đừng tự cài thuật toán ký. Hãy dùng thư viện có sẵn như `botocore.auth.SigV4Auth`, `@aws-sdk/signature-v4` hoặc `aws-sigv4-proxy`.
- **SigV4a** là biến thể ký đa region (dùng cho S3 Multi-Region Access Points). Chỉ cần biết tên.

### Ghi nhớ cho kỳ thi

- Tự viết code gọi AWS API thì phải ký bằng **SigV4** (không phải SigV1/2/3).
- 2 cách truyền chữ ký: **header `Authorization`** hoặc **query string `X-Amz-Signature`**.

---

## Tổng kết chương

| Chủ đề | Điều cần nhớ |
|---|---|
| IMDS | `169.254.169.254/latest/meta-data`; lấy được role name và credentials tạm thời, không lấy được policy; IMDSv2 cần token qua `PUT` |
| Credentials trên EC2 | Luôn dùng **IAM Role**, không bao giờ `aws configure` key cá nhân |
| On-premises | IAM user riêng cho ứng dụng + biến môi trường (không hard-code trong code; role không gắn được cho máy on-prem trừ khi dùng IAM Roles Anywhere) |
| CLI profiles | `aws configure --profile X`, `--profile X`, `AWS_PROFILE` |
| MFA + CLI | `sts get-session-token` cho ra 3 giá trị tạm thời |
| SDK | Gọi API từ code; CLI v1 dựa trên boto3 |
| Limits | API rate limit và Service Quotas |
| Throttling | Exponential backoff (có jitter); retry 5xx, không retry 4xx |
| SigV4 | Header `Authorization` hoặc query `X-Amz-Signature` |
| Debug quyền | So sánh policy bằng **IAM Policy Simulator** |

---

## Câu hỏi ôn tập

*Nguồn: Quiz 9 – AWS IAM, CLI, & SDK Quiz. Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Ứng dụng chạy trên EC2 cần upload object lên S3 bằng `PutObject` nhưng thiếu quyền. Bạn nên làm gì?

- A. Vào EC2, chạy `aws configure` và nhập IAM credentials cá nhân của bạn
- B. Nhờ admin gắn IAM Policy cho phép thao tác này vào IAM Role của EC2
- C. Export biến môi trường chứa IAM credentials của bạn trên EC2
- D. Dùng EC2 Metadata API

<details><summary>Đáp án</summary>

**B.** IAM Role là cách đúng để cấp quyền cho EC2. Không bao giờ đặt credentials cá nhân trên EC2 (A, C). Metadata API chỉ cho instance biết thông tin về chính nó, không cấp thêm quyền (D).
</details>

**Câu 2.** Bạn và đồng nghiệp cùng phát triển một ứng dụng gọi AWS API. Máy đồng nghiệp chạy bình thường, còn bạn bị lỗi *API Authorization Exception*. Bạn nên làm gì?

- A. Gửi Access Key và Secret Key của bạn cho đồng nghiệp để tái hiện lỗi
- B. Xin IAM credentials của đồng nghiệp để dùng
- C. So sánh IAM Policy của hai người bằng **AWS Policy Simulator**
- D. Nhờ đồng nghiệp tạo EC2, đặt credentials của họ vào đó rồi bạn chạy ứng dụng trên EC2

<details><summary>Đáp án</summary>

**C.** Không bao giờ chia sẻ credentials (A, B, D). Policy Simulator giúp tìm ra khác biệt về quyền.
</details>

**Câu 3.** Bạn đã SSH vào một EC2 Linux và muốn lấy instance ID. Cách tốt nhất là gì?

- A. Tạo IAM Role cho EC2 để gọi `describe-instances`
- B. Truy vấn user data tại `http://169.254.169.254/latest/user-data`
- C. Truy vấn metadata tại `http://254.169.254.169/latest/meta-data`
- D. Truy vấn metadata tại `http://169.254.169.254/latest/meta-data`

<details><summary>Đáp án</summary>

**D.** A làm được nhưng thừa, vì phải cấp role cho mọi instance. B là user data (script khởi động), không phải metadata. C sai địa chỉ IP.
</details>

**Câu 4.** AWS CLI cần ______ làm runtime.

- A. Java  B. Golang  C. Python  D. C#

<details><summary>Đáp án</summary>

**C. Python** (đáp án theo đề). Thực tế CLI v2 đã đóng gói sẵn runtime nên không cần cài Python riêng.
</details>

**Câu 5.** Ứng dụng chạy trên server on-premises cần gọi API tới S3. Cách an toàn nhất là gì?

- A. Tạo IAM user riêng cho ứng dụng, sinh credentials và đặt vào **biến môi trường**
- B. Trên server, chạy `aws configure` với credentials cá nhân của bạn
- C. Tạo IAM user riêng cho ứng dụng và đặt credentials **trong code**
- D. Gắn IAM Role cho server on-premises

<details><summary>Đáp án</summary>

**A.** Dùng user riêng để tách biệt người dùng và ứng dụng. B dùng credentials cá nhân, sai. C hard-code trong code, sai. D sai vì IAM Role không gắn trực tiếp được cho server on-premises (thực tế có thể dùng *IAM Roles Anywhere*, nhưng đề không xét).
</details>

**Câu 6.** Khi EC2 có gắn IAM Role và bạn chạy AWS CLI trên instance, CLI dùng ______ để lấy credentials ______.

- A. Instance user data, tạm thời
- B. Instance Metadata, tạm thời
- C. Instance user data, vĩnh viễn
- D. Instance Metadata, vĩnh viễn

<details><summary>Đáp án</summary>

**B.** CLI lấy credentials tạm thời từ Instance Metadata, và chúng được tự động làm mới.
</details>

**Câu 7.** Khi EC2 gắn IAM Role, bạn có thể lấy được cả tên role lẫn các IAM Policy gắn vào role. (Đúng/Sai)

<details><summary>Đáp án</summary>

**Sai.** Từ IMDS chỉ lấy được tên role (và credentials tạm thời), không lấy được policy.
</details>

**Câu 8.** Các lời gọi API tới AWS KMS bắt đầu bị throttle vì vượt số lần gọi tối đa mỗi giây. Bạn nên làm gì?

- A. Gọi API mỗi 10 ms
- B. Dùng chiến lược **Exponential Backoff**
- C. Dùng chiến lược Linear Backoff

<details><summary>Đáp án</summary>

**B.** Chờ tăng dần theo cấp số nhân để giảm tải. Nếu throttle kéo dài do tải thật sự cao thì xin tăng quota KMS.
</details>

**Câu 9.** Trước khi gọi API được bảo vệ bằng MFA, bạn cần dùng ______ để lấy credentials tạm thời.

- A. STS `GetSessionToken`
- B. STS `GetFederationToken`
- C. IAM `GetMFAToken`

<details><summary>Đáp án</summary>

**A.** `GetFederationToken` dùng cho người dùng liên kết (federated user), còn `IAM GetMFAToken` không tồn tại.
</details>

**Câu 10.** CLI và SDK tự ký request bằng access key. Nếu tự viết code, bạn phải ký request bằng ______.

- A. SigV1  B. SigV2  C. SigV3  D. SigV4

<details><summary>Đáp án</summary>

**D. SigV4.**
</details>

---

[← Chương 11](ch11-amazon-s3-introduction.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Chương 13 →](ch13-advanced-amazon-s3.md)
