# Chương 29 – Advanced Identity

> **Nguồn:** 4 video của chương + *Advanced IAM Quiz*.
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay (kỳ thi hiện tại là **DVA-C02**).

## Mục tiêu chương

Sau chương này bạn có thể:

- Liệt kê các API chính của **AWS STS** và biết khi nào dùng `AssumeRole`, `GetSessionToken`, `GetCallerIdentity`, `DecodeAuthorizationMessage`.
- Thực hiện **assume role** trong cùng tài khoản và **cross-account**; dùng STS với **MFA**.
- Giải thích mô hình **đánh giá policy** của IAM (explicit deny → allow → implicit deny) và cách IAM policy kết hợp với **S3 bucket policy**.
- Viết **dynamic policy** với biến `${aws:username}`.
- Phân biệt **AWS managed policy**, **customer managed policy** và **inline policy**.
- Hiểu quyền **`iam:PassRole`** và **trust policy** khi gán role cho dịch vụ AWS.
- Phân biệt 3 loại **AWS Directory Service**: Managed Microsoft AD, AD Connector, Simple AD.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001 | STS Overview | Bài 1 – AWS STS (Security Token Service) |
| 002 | Advanced IAM | Bài 2 – IAM nâng cao: đánh giá policy, dynamic policy, các loại policy |
| 003 | Granting a User Permissions to Pass a Role to an AWS Service | Bài 3 – `iam:PassRole` và Trust Policy |
| 004 | AWS Directory Services | Bài 4 – AWS Directory Services |
| Quiz | Advanced IAM Quiz | Câu hỏi ôn tập |

---

## Bài 1 – AWS STS (Security Token Service)

### Lý thuyết

- **STS** cấp **credentials bảo mật tạm thời** để truy cập tài nguyên AWS (video nói "tối đa 1 giờ"; xem phần cập nhật ở *Kiến thức thực tế*).
- Các API cần biết ở mức tổng quan:

| API | Dùng khi nào |
|---|---|
| **`AssumeRole`** | Assume một IAM Role trong **cùng tài khoản** hoặc **tài khoản khác (cross-account)**. Quan trọng nhất. |
| `AssumeRoleWithSAML` | Người dùng đăng nhập qua **SAML 2.0** (IdP doanh nghiệp) → nhận credentials tạm thời. |
| `AssumeRoleWithWebIdentity` | Người dùng đăng nhập qua IdP web (Facebook, Google, OIDC). AWS khuyến nghị dùng **Cognito Identity Pools** thay vì gọi trực tiếp API này cho ứng dụng mobile/web. |
| **`GetSessionToken`** | Lấy credentials tạm thời khi dùng **MFA** (cho IAM user hoặc root). |
| `GetFederationToken` | Lấy credentials tạm thời cho một **federated user**. |
| **`GetCallerIdentity`** | Trả về thông tin IAM user/role đang gọi API và **số tài khoản**. Dùng khi "không biết mình là ai". |
| **`DecodeAuthorizationMessage`** | **Giải mã thông báo lỗi** khi một AWS API bị từ chối (encoded authorization failure message). |

> 4 API quan trọng nhất cho kỳ thi: **AssumeRole, GetSessionToken, GetCallerIdentity, DecodeAuthorizationMessage**.

#### Assume Role bằng STS

1. Định nghĩa một **IAM Role** trong tài khoản của bạn (cùng tài khoản) hoặc ở tài khoản khác (cross-account).
2. Xác định **principal nào được phép** assume role đó (trust policy) và cấp quyền bằng IAM policy.
3. Gọi **`sts:AssumeRole`** để "đóng vai" (impersonate) role.
4. STS kiểm tra quyền, rồi trả về **credentials tạm thời** (theo video: hiệu lực **15 phút đến 1 giờ**). Từ đó bạn hành động như thể mình là role.

**Cross-account:** tạo role ở tài khoản đích, cấu hình quyền đúng ở **cả hai phía** (tài khoản nguồn cho phép user gọi `sts:AssumeRole`; trust policy ở tài khoản đích cho phép tài khoản/principal nguồn), rồi gọi `AssumeRole`. Ví dụ: role ở tài khoản đích cho phép đọc một S3 bucket → sau khi assume, bạn truy cập được bucket đó.

#### STS với MFA

- Dùng **`GetSessionToken`** sau khi xác thực bằng thiết bị MFA.
- IAM policy cần **điều kiện** `aws:MultiFactorAuthPresent: true`. Ví dụ: chỉ cho phép `StopInstances`/`TerminateInstances` khi có MFA.
- `GetSessionToken` trả về **3 thành phần**: Access Key ID, Secret Access Key, **Session Token**, kèm **thời điểm hết hạn** (Expiration) để biết khi nào cần làm mới.

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["ec2:StopInstances", "ec2:TerminateInstances"],
    "Resource": "*",
    "Condition": { "Bool": { "aws:MultiFactorAuthPresent": "true" } }
  }]
}
```

### Kiến thức thực tế

- **Cập nhật thời lượng phiên** (video nói tối đa 1 giờ, đó là giá trị **mặc định** của `AssumeRole`):
  - `AssumeRole`: từ **15 phút** đến **MaxSessionDuration** của role (cấu hình được **1–12 giờ**).
  - **Role chaining** (dùng credentials của role để assume role khác): tối đa **1 giờ**.
  - `GetSessionToken`: 15 phút – 36 giờ, mặc định 12 giờ (root tối đa 1 giờ).
- Assume role bằng SDK Python (boto3):

  ```python
  import boto3

  sts = boto3.client("sts")
  resp = sts.assume_role(
      RoleArn="arn:aws:iam::111122223333:role/CrossAccountS3Read",
      RoleSessionName="app-session",
      DurationSeconds=3600,
  )
  c = resp["Credentials"]
  s3 = boto3.client(
      "s3",
      aws_access_key_id=c["AccessKeyId"],
      aws_secret_access_key=c["SecretAccessKey"],
      aws_session_token=c["SessionToken"],
  )
  print(s3.list_buckets()["Buckets"])
  ```

- Cách gọn hơn trên máy dev: khai báo profile `role_arn` + `source_profile` trong `~/.aws/config`, CLI/SDK tự gọi `AssumeRole` và tự làm mới.
- **ExternalId**: khi cho bên thứ ba (SaaS) assume role vào tài khoản của bạn, thêm điều kiện `sts:ExternalId` trong trust policy để chống *confused deputy*.
- `AssumeRoleWithWebIdentity` vẫn được dùng nhiều ngày nay dưới dạng **OIDC federation**: GitHub Actions deploy vào AWS không cần access key, EKS **IRSA**.
- Ưu tiên dùng **STS regional endpoint** (ví dụ `sts.ap-southeast-1.amazonaws.com`) thay vì endpoint global `sts.amazonaws.com` để giảm độ trễ và tăng tính sẵn sàng.
- Khi làm việc cho nhiều tài khoản/khách hàng, thực tế hiện nay dùng **IAM Identity Center** (trước đây là **AWS SSO**) để cấp quyền truy cập tạm thời thay vì tạo IAM user ở từng tài khoản.

### Ghi nhớ cho kỳ thi

- Truy cập **tài khoản khác** → **STS `AssumeRole`** (không phải xin IAM user hay access key).
- API có **MFA** → **`GetSessionToken`** + điều kiện `aws:MultiFactorAuthPresent`.
- "Tôi là ai / tài khoản nào?" → **`GetCallerIdentity`**.
- Thông báo lỗi bị mã hoá → **`DecodeAuthorizationMessage`**.
- Đăng nhập Google/Facebook cho app mobile → **Cognito Identity Pools** (thay cho gọi trực tiếp `AssumeRoleWithWebIdentity`).

---

## Bài 2 – IAM nâng cao: đánh giá policy, dynamic policy, các loại policy

### Lý thuyết

#### Mô hình đánh giá policy (đơn giản hoá)

1. Quyết định **bắt đầu là Deny** (mặc định không được phép – *implicit deny*).
2. Thu thập **tất cả policy áp dụng** cho request.
3. Có **explicit Deny** không? → Có: **Deny** (kết thúc, bất kể có Allow).
4. Có **Allow** không? → Có: **Allow**.
5. Không có gì → **Deny**.

> Nếu policy có **cả explicit Deny lẫn explicit Allow** cho cùng hành động → **Deny thắng**, vì explicit deny được xét trước.

#### IAM Policy và S3 Bucket Policy

- **IAM policy** gắn vào user, role, group; **S3 bucket policy** gắn vào bucket. Cả hai đều định nghĩa ai làm được gì trên bucket.
- Khi một IAM principal thao tác trên S3, AWS đánh giá **hợp (union)** của IAM policy và bucket policy, rồi áp dụng mô hình ở trên.
- Hệ quả: dù bạn **xoá quyền S3 khỏi IAM policy** của EC2, nếu **bucket policy vẫn cho phép** role đó thì EC2 vẫn làm được.

| # | IAM Role của EC2 | S3 Bucket Policy | Kết quả |
|---|---|---|---|
| 1 | Allow đọc/ghi `my-bucket` | Không có | **Được** đọc/ghi |
| 2 | Allow đọc/ghi | **Explicit Deny** cho role đó | **Không được** (deny thắng) |
| 3 | Không có quyền S3 | **Allow** đọc/ghi cho role đó | **Được** đọc/ghi |
| 4 | **Explicit Deny** | Allow | **Không được** |

#### Dynamic policy với biến `${aws:username}`

- Bài toán: mỗi user có thư mục riêng `/home/<username>` trong S3 bucket và chỉ đọc/ghi được thư mục của mình.
- **Cách 1 (không scale):** mỗi user một policy (`/home/georges`, `/home/sarah`, `/home/matt`…). Thêm user là phải thêm policy.
- **Cách 2 (đúng):** **một policy duy nhất** dùng biến `${aws:username}`, được thay bằng tên user **tại thời điểm đánh giá**. Gắn policy này cho tất cả user (ví dụ qua một group).

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListOwnPrefix",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::users-data",
      "Condition": { "StringLike": { "s3:prefix": ["home/${aws:username}/*"] } }
    },
    {
      "Sid": "RWOwnFolder",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::users-data/home/${aws:username}/*"
    }
  ]
}
```

> Lưu ý: biến policy chỉ hoạt động khi có `"Version": "2012-10-17"`.

#### Ba loại policy

| | AWS Managed Policy | Customer Managed Policy | Inline Policy |
|---|---|---|---|
| Ai tạo/quản lý | AWS | Bạn | Bạn, nhúng trực tiếp vào 1 principal |
| Tái sử dụng | Có | Có, gắn cho nhiều principal | **Không**, quan hệ 1–1 với principal |
| Version / rollback | AWS tự cập nhật khi có service/API mới | **Có versioning**, rollback được | Không |
| Quản lý thay đổi | – | Tập trung, xem được ai dùng (*Policy usage*) | Khó kiểm toán |
| Khi xoá principal | – | Policy vẫn còn | **Policy bị xoá theo** |
| Dùng khi | Quyền admin, power user, theo job function | **Best practice** cho quyền chi tiết | Trường hợp đặc biệt cần gắn chặt với 1 principal |

### Kiến thức thực tế

- **Giới hạn kích thước** (ký tự, không tính khoảng trắng):
  - Inline policy (tổng cho mỗi principal): user **2.048**, group **5.120**, role **10.240**.
  - Managed policy: **6.144** ký tự mỗi policy; mỗi customer managed policy giữ tối đa **5 version**.
- Mô hình đánh giá đầy đủ ngày nay còn có: **SCP / RCP** (AWS Organizations), **permissions boundary**, **session policy**, **resource-based policy**. Explicit deny ở bất kỳ lớp nào đều thắng.
- **Cross-account** khác cùng tài khoản: truy cập bucket ở tài khoản khác cần **cả** IAM policy phía người gọi **và** bucket policy phía chủ bucket cùng cho phép (không chỉ "union").
- Các biến policy hữu ích khác: `${aws:userid}`, `${aws:PrincipalTag/team}`, `${aws:SourceIp}`… Kết hợp tag để làm **ABAC** (attribute-based access control).
- Kiểm tra policy trước khi áp dụng: **IAM Policy Simulator**, **IAM Access Analyzer** (policy validation, unused access).
- Với user dùng ứng dụng mobile/web (Cognito Identity Pools), biến tương ứng là `${cognito-identity.amazonaws.com:sub}`.

### Ghi nhớ cho kỳ thi

- **Explicit Deny > Allow > Implicit Deny.**
- Thao tác S3 = **union** IAM policy + bucket policy. Xoá quyền khỏi role mà vẫn đọc được → do **bucket policy** cho phép.
- Thư mục riêng cho từng user → **một customer managed policy** với **`${aws:username}`**, gắn cho **group**.
- Customer managed policy là best practice (tái sử dụng, versioning). Inline policy bị xoá cùng principal.

---

## Bài 3 – `iam:PassRole` và Trust Policy

### Lý thuyết

- Khi cấu hình nhiều dịch vụ AWS, ta **truyền (pass) một IAM Role** cho dịch vụ, thường lúc khởi tạo. Sau đó dịch vụ **assume** role để thực hiện hành động.
- Ví dụ: gán instance role cho **EC2**, execution role cho **Lambda**, task role cho **ECS task**, service role cho **CodePipeline**.
- Để pass role cho dịch vụ, người dùng cần quyền **`iam:PassRole`** (thường kèm **`iam:GetRole`** để xem role đang được pass).

Ví dụ policy: toàn quyền EC2, nhưng **chỉ được pass role `S3Access`** cho instance:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": "ec2:*", "Resource": "*" },
    {
      "Effect": "Allow",
      "Action": ["iam:PassRole", "iam:GetRole"],
      "Resource": "arn:aws:iam::123456789012:role/S3Access"
    }
  ]
}
```

#### Có thể pass bất kỳ role nào cho bất kỳ dịch vụ nào?

- **Không.** Role chỉ được pass cho dịch vụ mà **trust policy** của role cho phép assume.
- **Trust policy** (Trust relationships) xác định **ai/dịch vụ nào** được assume role:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "ec2.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
```

- Tóm lại, để pass role cần **2 điều kiện**:
  1. Role có **trust policy** cho phép dịch vụ đích assume.
  2. Người dùng có quyền **`iam:PassRole`** trên role đó.

### Kiến thức thực tế

- Giới hạn chặt hơn bằng điều kiện **`iam:PassedToService`** để role chỉ được pass cho đúng dịch vụ:

  ```json
  {
    "Effect": "Allow",
    "Action": "iam:PassRole",
    "Resource": "arn:aws:iam::123456789012:role/lambda-*",
    "Condition": { "StringEquals": { "iam:PassedToService": "lambda.amazonaws.com" } }
  }
  ```

- **Không bao giờ** cấp `iam:PassRole` với `"Resource": "*"` cho developer: họ có thể pass một role admin cho Lambda/EC2 rồi leo thang đặc quyền (privilege escalation).
- EC2 thực chất dùng **instance profile** bọc role; console tự tạo instance profile cùng tên, còn CLI/CloudFormation phải tạo riêng (`AWS::IAM::InstanceProfile`).
- Lỗi hay gặp khi deploy CloudFormation/SAM/CDK: thiếu `iam:PassRole` cho người/pipeline chạy deploy.

### Ghi nhớ cho kỳ thi

- Gán role cho dịch vụ AWS → cần **`iam:PassRole`**.
- Dịch vụ nào assume được role → do **trust policy** quyết định (`Principal: { "Service": "..." }`).
- Đọc policy: `iam:PassRole` với `Resource: role/RDS-*` nghĩa là chỉ pass được các role có tên bắt đầu bằng `RDS-`.

---

## Bài 4 – AWS Directory Services

### Lý thuyết

#### Microsoft Active Directory (AD) là gì?

- Phần mềm chạy trên Windows Server có **AD Domain Services**.
- Là **cơ sở dữ liệu các đối tượng**: user account, computer, printer, file share, security group.
- **Quản lý bảo mật tập trung**: tạo tài khoản, gán quyền.
- Đối tượng tổ chức thành **tree**; nhóm các tree gọi là **forest**.
- Ví dụ: tạo user `John` trên **Domain Controller**; mọi máy Windows trong mạng kết nối với domain controller nên John đăng nhập được từ bất kỳ máy nào.

#### AWS Directory Service – 3 lựa chọn

| | AWS Managed Microsoft AD | AD Connector | Simple AD |
|---|---|---|---|
| Bản chất | AD **thật** của Microsoft, do AWS quản lý | **Gateway/proxy** chuyển request về AD on-premises | Thư mục **tương thích AD**, không phải Microsoft AD |
| User quản lý ở đâu | Trên AWS (và có thể cả on-prem qua trust) | **Chỉ ở AD on-premises** | Trên AWS |
| Kết nối AD on-prem | **Trust relationship** hai chiều | Proxy trực tiếp | **Không** kết nối được |
| MFA | Có | Có | – |
| Phiên bản / quy mô | Standard (~30.000 object), Enterprise (~500.000 object) | Small (~500 user), Large (~5.000 user) | – |
| Dùng khi | Muốn AD trên cloud, quản lý user trên AWS, có MFA, trust với on-prem | Muốn **proxy** user về AD on-prem | Không có AD on-prem, chỉ cần AD đơn giản trên AWS |

- **Managed Microsoft AD + trust**: AWS tin AD on-prem và ngược lại. User không có trên AWS AD sẽ được tra cứu ở AD on-prem và ngược lại → user được **chia sẻ** giữa hai bên.
- Lý do cần directory trên AWS: các **EC2 Windows** có thể **join domain**, chia sẻ đăng nhập/credentials, đặt directory gần EC2.
- Trong console *Directory Service* có lựa chọn thứ tư là **Amazon Cognito User Pool**, chỉ là đường dẫn sang dịch vụ Cognito, không tính là Directory Service.

### Kiến thức thực tế

- Directory Service cần **2 subnet ở 2 AZ khác nhau** trong VPC (domain controller được triển khai đa AZ).
- **IAM Identity Center** (tên cũ **AWS SSO**) có thể dùng **Managed Microsoft AD** hoặc **AD Connector** làm *identity source* để nhân viên đăng nhập console/CLI bằng tài khoản AD.
- Amazon RDS for SQL Server, Amazon FSx for Windows File Server, WorkSpaces thường tích hợp với Managed Microsoft AD.
- Simple AD dựa trên Samba và có ít tính năng hơn (không có trust, không có MFA).

### Ghi nhớ cho kỳ thi

- Cần AD trên AWS **và trust** với AD on-prem, quản lý user trên cloud, MFA → **AWS Managed Microsoft AD**.
- Chỉ **proxy** xác thực về AD on-prem, user chỉ nằm on-prem → **AD Connector**.
- Không có on-prem, cần AD rẻ, đơn giản → **Simple AD**.

---

## Tổng kết chương

| Chủ đề | Điều cần nhớ |
|---|---|
| STS | Credentials tạm thời; `AssumeRole` (cùng/khác tài khoản), `GetSessionToken` (MFA), `GetCallerIdentity`, `DecodeAuthorizationMessage` |
| Cross-account | Tạo role ở tài khoản đích + trust policy; gọi `AssumeRole` |
| MFA | `GetSessionToken` + điều kiện `aws:MultiFactorAuthPresent` |
| Đánh giá policy | Explicit Deny > Allow > Implicit Deny |
| IAM + S3 | Union của IAM policy và bucket policy |
| Dynamic policy | `${aws:username}` – một policy cho mọi user |
| Loại policy | AWS managed / Customer managed (best practice, versioning) / Inline (1–1, xoá theo principal) |
| PassRole | Cần `iam:PassRole` + trust policy cho phép dịch vụ |
| Directory Service | Managed AD (trust, MFA) / AD Connector (proxy) / Simple AD (độc lập) |

---

## Câu hỏi ôn tập

*Nguồn: Advanced IAM Quiz. Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Một công ty thuê bạn làm một số việc trong tài khoản AWS của họ. Cách tốt nhất để truy cập tài khoản của họ là gì?

- A. Nhờ họ tạo một IAM user cho bạn
- B. Nhờ họ gửi cho bạn AWS Access Key và Secret Access Key
- C. Dùng dịch vụ STS để assume một IAM Role trong tài khoản của họ, nhận credentials tạm thời

<details><summary>Đáp án</summary>

**C.** STS cho phép truy cập cross-account: role trong tài khoản của bạn được phép assume một IAM Role ở tài khoản khác. A và B chạy được nhưng không scale: làm việc với nhiều công ty thì phải nhớ từng IAM user/mật khẩu hoặc từng bộ access key, phải đăng xuất/đăng nhập giữa các tài khoản, và credentials dài hạn kém an toàn. Tham khảo: https://docs.aws.amazon.com/IAM/latest/UserGuide/tutorial_cross-account-with-roles.html
</details>

**Câu 2.** EC2 instance có IAM role cho phép đọc/ghi bucket `my-bucket`, đã kiểm thử thành công. Sau đó bạn gỡ IAM role khỏi instance, thử lại thì thấy ghi không còn chạy nhưng đọc vẫn chạy. Nguyên nhân có khả năng nhất là gì?

- A. EC2 đang dùng credentials IAM tạm thời được cache
- B. Credentials IAM được cache trên EC2, gỡ role khỏi EC2 mất vài phút mới có hiệu lực
- C. S3 bucket policy cho phép đọc
- D. Khi đọc một bucket, có thời gian ân hạn 5 phút để đọc lại

<details><summary>Đáp án</summary>

**C.** Khi đánh giá quyền của EC2 thao tác trên S3, AWS xét **hợp (union)** của IAM policy của instance và bucket policy. Ghi bị chặn chứng tỏ credentials đã mất hiệu lực (loại A, B); việc đọc vẫn được là do bucket policy cho phép. D không tồn tại.
</details>

**Câu 3.** IAM policy sau cho phép bạn làm gì?

```json
{
  "Version": "2012-10-17",
  "Id": "Secret Policy",
  "Statement": [
    { "Sid": "EC2", "Effect": "Allow", "Action": "ec2:*", "Resource": "*" },
    { "Sid": "Passrole", "Effect": "Allow", "Action": ["iam:PassRole"],
      "Resource": "arn:aws:iam:::role/RDS-*" }
  ]
}
```

- A. Gán bất kỳ IAM role nào cho RDS instance
- B. Gán bất kỳ IAM role nào cho EC2 instance
- C. Gán quyền RDS full access cho EC2 instance
- D. Gán IAM Role cho EC2 nếu tên role bắt đầu bằng `RDS-`

<details><summary>Đáp án</summary>

**D.** Statement 1 cho toàn quyền EC2; statement 2 chỉ cho `iam:PassRole` với các role có tên khớp `RDS-*`. Vậy bạn chỉ gán được cho EC2 những role có tên bắt đầu bằng `RDS-`. Tên role không quyết định quyền bên trong nó (loại C), và policy không cho thao tác trên RDS (loại A).
</details>

**Câu 4.** Tài khoản AWS của bạn tăng lên 200 IAM user, mỗi user có dữ liệu riêng trong bucket `users-data`. Bạn muốn mỗi user có không gian riêng với prefix `/home/<username>` và có quyền đọc/ghi. Làm sao cho hiệu quả?

- A. Tạo S3 bucket policy và sửa nó mỗi khi thêm/xoá user
- B. Tạo một customer managed policy dùng biến động và gắn cho một group chứa tất cả IAM user
- C. Tạo inline policy cho từng user khi onboard
- D. Tạo một customer managed policy cho mỗi user và gắn cho user tương ứng

<details><summary>Đáp án</summary>

**B.** Dùng **dynamic policy** với `${aws:username}`: một policy duy nhất, tự thay tên user lúc đánh giá, gắn qua group. A, C, D đều phải sửa/tạo thêm mỗi khi có user mới nên không scale.
</details>

**Câu 5.** Bạn đang chạy Microsoft Active Directory on-premises để quản lý user. Bạn được giao tạo thêm một AD trên AWS và thiết lập trust relationship với AD on-premises. Nên dùng dịch vụ Directory nào?

- A. Managed Microsoft AD
- B. AD Connector
- C. Simple AD

<details><summary>Đáp án</summary>

**A.** Chỉ **AWS Managed Microsoft AD** là một AD thật trên AWS và hỗ trợ trust với AD on-prem. AD Connector chỉ là proxy (không phải AD riêng), Simple AD không kết nối được với AD on-prem.
</details>

---

[← Chương 28](ch28-other-serverless-step-functions-appsyn.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Chương 30 →](ch30-aws-security-encryption-kms-encryption.md)
