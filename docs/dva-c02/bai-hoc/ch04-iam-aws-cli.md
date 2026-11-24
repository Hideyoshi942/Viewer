# Chương 04 – IAM & AWS CLI

> **Nguồn:** Thư mục chương **không có transcript video**; tài liệu này được biên soạn từ **đề cương (syllabus) của section "IAM & AWS CLI"** trong khoá học và kiến thức chuẩn về IAM/AWS CLI theo tài liệu AWS. Số thứ tự video bên dưới là **ước lượng theo thứ tự đề cương**, có thể lệch so với khoá học thực tế. Phần câu hỏi ôn tập được soạn theo phong cách *IAM & AWS CLI Quiz*, không phải bản chép lại quiz gốc.
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung để bám sát thực tế hiện nay (2026). Chương này là **phần nền tảng**; các chủ đề nâng cao (IMDS, CLI profiles, MFA với CLI qua STS, SDK, exponential backoff, SigV4) nằm ở **Chương 12 – AWS CLI, SDK, IAM Roles & Policies**. Kỳ thi hiện tại là **DVA-C02**.

## Mục tiêu chương

Sau chương này bạn có thể:

- Giải thích **IAM** là gì, vì sao **không dùng root account** cho công việc hằng ngày.
- Tạo **IAM Users**, **Groups**, gán quyền bằng **IAM Policies** và đọc hiểu cấu trúc **policy JSON** (Effect, Action, Resource, Condition…).
- Thiết lập **password policy** và **MFA** (virtual MFA, passkey/security key, hardware TOTP token).
- Phân biệt 3 cách truy cập AWS: **Management Console**, **AWS CLI**, **AWS SDK**; tạo và bảo vệ **Access Keys**.
- Cài đặt **AWS CLI v2** trên Windows/Mac/Linux, chạy `aws configure`, `aws sts get-caller-identity`, và dùng **AWS CloudShell**.
- Tạo **IAM Role** cho dịch vụ AWS (ví dụ EC2, Lambda) và hiểu **trust policy**.
- Dùng **IAM Credentials Report** và **IAM Access Advisor** để kiểm tra bảo mật.
- Nắm **IAM best practices**, **Shared Responsibility Model** cho IAM, và vì sao **IAM Identity Center** là lựa chọn hiện đại cho người dùng.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001–003 | Section Introduction; IAM Introduction: Users, Groups, Policies; IAM Users & Groups Hands On | Bài 1 – Giới thiệu IAM: Users và Groups |
| 004–005 | IAM Policies; IAM Policies Hands On | Bài 2 – IAM Policies |
| 006–007 | IAM MFA Overview; IAM MFA Hands On | Bài 3 – Password Policy và MFA |
| 008 | AWS Access Keys, CLI and SDK | Bài 4 – Access Keys, CLI và SDK |
| 009–012 | AWS CLI Setup on Windows / Mac / Linux; AWS CLI Hands On | Bài 5 – Cài đặt và sử dụng AWS CLI |
| 013 | AWS CloudShell | Bài 6 – AWS CloudShell |
| 014–015 | IAM Roles for AWS Services; IAM Roles Hands On | Bài 7 – IAM Roles cho dịch vụ AWS |
| 016–017 | IAM Security Tools; IAM Security Tools Hands On | Bài 8 – IAM Security Tools: Credentials Report và Access Advisor |
| 018–019 | IAM Best Practices; IAM Summary | Bài 9 – IAM Best Practices, Shared Responsibility và tổng kết |
| Quiz | IAM & AWS CLI Quiz | Câu hỏi ôn tập |

---

## Bài 1 – Giới thiệu IAM: Users và Groups

### Lý thuyết

#### IAM là gì

- **IAM = Identity and Access Management**, là **dịch vụ global** (không gắn với region nào). Users, groups, roles, policies tạo ra dùng được ở mọi region.
- IAM trả lời 2 câu hỏi:
  - **Authentication** – *Bạn là ai?* (user, role, mật khẩu, access key, MFA).
  - **Authorization** – *Bạn được làm gì?* (policies).
- IAM **miễn phí**; bạn chỉ trả tiền cho tài nguyên mà các identity tạo ra.

#### Root account

- **Root user** được tạo khi đăng ký tài khoản AWS (đăng nhập bằng email + mật khẩu), có **toàn quyền không thể giới hạn bằng IAM policy**.
- Best practice: **chỉ dùng root để tạo tài khoản ban đầu và cho một số tác vụ bắt buộc root**; **không dùng và không chia sẻ** root cho công việc hằng ngày.
- Một số tác vụ **chỉ root làm được**: đổi thông tin tài khoản (email, tên, mật khẩu root), đóng tài khoản, đổi **AWS Support plan**, khôi phục quyền khi IAM admin bị khoá, cấu hình một số tính năng billing (ví dụ bật *IAM access to Billing* – xem Chương 05), đăng ký làm seller Reserved Instance Marketplace.

#### Users và Groups

| Khái niệm | Mô tả |
|---|---|
| **IAM User** | Đại diện cho **một người** (hoặc một ứng dụng) trong tổ chức; có thông tin đăng nhập dài hạn (password, access key) |
| **IAM Group** | Tập hợp **users**; gán policy cho group thì mọi user trong group thừa hưởng quyền |
| Quy tắc | **Group chỉ chứa users, không chứa group khác** (không lồng nhau) |
| Quy tắc | **User không bắt buộc thuộc group nào**, và **một user có thể thuộc nhiều group** |

Ví dụ trong khoá học:

```
Group "Developers":  Alice, Bob, Charles
Group "Operations":  David, Edward
Group "Audit Team":  Charles, David      ← Charles và David thuộc 2 group
User không có group: Fred
```

- Quyền của một user = **hợp (union)** các policy từ mọi group + policy gán trực tiếp (inline/managed) – trừ khi có **Deny** tường minh.

### Kiến thức thực tế

- **IAM Identity Center (trước đây là AWS SSO)** là cách AWS **khuyến nghị hiện nay** cho người dùng là con người: user đăng nhập một cổng (access portal), nhận **credentials tạm thời** qua *permission sets*, dùng chung cho nhiều tài khoản trong AWS Organizations. IAM user với mật khẩu/access key dài hạn chỉ nên dùng cho trường hợp đặc biệt (tài khoản học tập, break-glass, hệ thống cũ không hỗ trợ role).
- Khoá học dùng IAM user + group `admin` vì đơn giản cho người mới; trong công ty, hãy hỏi team platform xem đã có Identity Center chưa.
- **Giới hạn mặc định đáng nhớ:** 5.000 IAM users mỗi tài khoản, 300 groups mỗi tài khoản (có thể xin tăng), một user thuộc tối đa **10 groups**.
- Ngoài alias, sign-in URL dạng `https://<account-id>.signin.aws.amazon.com/console` luôn hoạt động.

### Ghi nhớ cho kỳ thi

- IAM là **dịch vụ global**.
- **Root account: không dùng, không chia sẻ**; tạo IAM user/admin để làm việc.
- **Groups chỉ chứa users**, không lồng groups; user có thể ở **0, 1 hoặc nhiều** group.

---

## Bài 2 – IAM Policies

### Lý thuyết

#### Policy là gì

- **IAM Policy** là **tài liệu JSON** mô tả quyền: được/không được gọi API nào trên tài nguyên nào.
- Gắn được cho **user, group, role**. AWS áp dụng nguyên tắc **least privilege**: chỉ cấp **đúng và đủ** quyền cần thiết.
- Các cách gắn policy:

| Loại | Đặc điểm |
|---|---|
| **AWS managed policy** | Do AWS tạo và cập nhật (ví dụ `AdministratorAccess`, `IAMReadOnlyAccess`, `AmazonS3ReadOnlyAccess`) |
| **Customer managed policy** | Bạn tự tạo, tái sử dụng được cho nhiều identity, có versioning (tối đa 5 version) |
| **Inline policy** | Gắn trực tiếp vào **một** user/group/role, xoá identity thì policy mất theo |

- Ví dụ thừa kế: Charles ở group *Developers* và *Audit Team* nhận quyền của **cả hai group**; Fred không có group nhưng có **inline policy** riêng.

#### Cấu trúc policy JSON

```json
{
  "Version": "2012-10-17",
  "Id": "S3-Account-Permissions",
  "Statement": [
    {
      "Sid": "AllowReadOnlyOnBucket",
      "Effect": "Allow",
      "Principal": { "AWS": ["arn:aws:iam::123456789012:root"] },
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": ["arn:aws:s3:::mybucket/*"],
      "Condition": { "Bool": { "aws:SecureTransport": "true" } }
    }
  ]
}
```

| Thành phần | Bắt buộc? | Ý nghĩa |
|---|---|---|
| **Version** | Nên có | Phiên bản ngôn ngữ policy, luôn dùng **`"2012-10-17"`** (không phải ngày bạn viết) |
| **Id** | Tuỳ chọn | Định danh policy |
| **Statement** | **Bắt buộc** | Một hoặc nhiều statement |
| **Sid** | Tuỳ chọn | Định danh statement |
| **Effect** | **Bắt buộc** | `Allow` hoặc `Deny` |
| **Principal** | Chỉ trong **resource-based policy** (S3 bucket policy, trust policy…) | Account/user/role/service mà policy áp dụng |
| **Action** | **Bắt buộc** | Danh sách API được allow/deny (`service:Action`, hỗ trợ `*`) |
| **Resource** | Bắt buộc với identity-based policy | ARN tài nguyên áp dụng |
| **Condition** | Tuỳ chọn | Điều kiện để statement có hiệu lực (IP, MFA, tag, thời gian…) |

#### Logic đánh giá (rút gọn)

1. Mặc định **mọi thứ bị từ chối** (implicit deny).
2. Có một **Allow** phù hợp → được phép…
3. …trừ khi có **Deny tường minh (explicit Deny)** ở bất kỳ đâu → **Deny luôn thắng**.

#### Ví dụ policy hay gặp

`AdministratorAccess` (AWS managed):

```json
{
  "Version": "2012-10-17",
  "Statement": [{ "Effect": "Allow", "Action": "*", "Resource": "*" }]
}
```

`IAMReadOnlyAccess` (rút gọn) – dùng wildcard `Get*`, `List*`:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["iam:GenerateCredentialReport", "iam:GenerateServiceLastAccessedDetails",
               "iam:Get*", "iam:List*", "iam:SimulateCustomPolicy", "iam:SimulatePrincipalPolicy"],
    "Resource": "*"
  }]
}
```

Customer managed policy: cho phép đọc một bucket, **cấm xoá** object:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadAppBucket",
      "Effect": "Allow",
      "Action": ["s3:ListBucket", "s3:GetObject"],
      "Resource": ["arn:aws:s3:::my-app-bucket", "arn:aws:s3:::my-app-bucket/*"]
    },
    {
      "Sid": "NeverDelete",
      "Effect": "Deny",
      "Action": "s3:DeleteObject",
      "Resource": "arn:aws:s3:::my-app-bucket/*"
    }
  ]
}
```

> Lưu ý: `s3:ListBucket` áp lên **ARN bucket** (`arn:aws:s3:::my-app-bucket`), còn `s3:GetObject` áp lên **ARN object** (`.../*`). Đây là lỗi rất hay gặp.

### Kiến thức thực tế

- **IAM Access Analyzer → Policy validation** kiểm tra policy khi bạn viết (lỗi cú pháp, cảnh báo bảo mật như `iam:PassRole` với `Resource: "*"`). Access Analyzer còn **generate policy** dựa trên lịch sử CloudTrail để đạt least privilege.
- **IAM Policy Simulator** dùng để thử "user này có được gọi API X không" – xem thêm Chương 12.
- Thứ tự thực tế khi đánh giá còn có **SCP** (Organizations), **permissions boundary**, **session policy**, **resource-based policy** – sẽ gặp ở Chương 29/30.
- Ưu tiên **customer managed policy** hơn inline (tái sử dụng, versioning, dễ audit). Inline chỉ dùng khi muốn ràng buộc chặt 1–1 với identity.
- Giới hạn: managed policy tối đa **6.144 ký tự**; mỗi user/role gắn tối đa **10 managed policies** mặc định (có thể xin tăng đến 20).

### Ghi nhớ cho kỳ thi

- Policy = JSON, gồm **Version, Statement (Effect, Action, Resource, [Principal], [Condition])**.
- **Explicit Deny > Allow > implicit deny.**
- Nguyên tắc **least privilege**.
- `Principal` xuất hiện trong **resource-based policy / trust policy**, không có trong identity-based policy gắn cho user.

---

## Bài 3 – Password Policy và MFA

### Lý thuyết

#### Password policy

- Mật khẩu mạnh = tài khoản an toàn hơn. Trong IAM có thể cấu hình **password policy** cho IAM users:

| Tuỳ chọn | Ví dụ |
|---|---|
| Độ dài tối thiểu | ≥ 14 ký tự |
| Yêu cầu loại ký tự | Chữ hoa, chữ thường, số, ký tự đặc biệt |
| Cho phép user tự đổi mật khẩu | Allow users to change their own password |
| Hết hạn mật khẩu | Ví dụ sau 90 ngày |
| Chống dùng lại | Không cho dùng lại N mật khẩu gần nhất |
| Khi hết hạn | Yêu cầu admin reset hay user tự đổi |

- Password policy **không áp dụng cho root user**.

#### MFA – Multi-Factor Authentication

- **MFA = thứ bạn biết (password) + thứ bạn có (thiết bị)**. Kẻ xấu lấy được mật khẩu vẫn không đăng nhập được nếu không có thiết bị.
- **Bắt buộc** bật MFA cho **root** và rất nên bật cho mọi IAM user.

| Loại MFA | Ví dụ | Ghi chú |
|---|---|---|
| **Virtual MFA device** (TOTP app) | Google Authenticator, Microsoft Authenticator, Authy, 1Password… | Một app chứa được nhiều token (nhiều account/user) |
| **Passkey / FIDO2 security key** | YubiKey, Titan key, passkey trong iCloud Keychain/Google Password Manager/Windows Hello | Chống phishing tốt nhất; một khoá vật lý dùng cho nhiều root/IAM user |
| **Hardware TOTP token** | Token key fob (Thales/Gemalto) | Thiết bị hiển thị mã 6 số |
| **Hardware TOTP cho AWS GovCloud (US)** | SurePassID | Chỉ cho GovCloud |

> Video gọi loại thứ 2 là **U2F Security Key**. Hiện nay console gọi là **Passkey or security key** (chuẩn FIDO2/WebAuthn, bao gồm cả passkey đồng bộ trên điện thoại/laptop).

### Kiến thức thực tế

- Từ 2022, mỗi root/IAM user gắn được **tối đa 8 thiết bị MFA** (nên đăng ký ít nhất 2 để có dự phòng).
- Từ 2024–2025 AWS **bắt buộc MFA cho root user** (bắt đầu với management account của Organizations, sau đó mở rộng sang các tài khoản standalone/member). Với Organizations còn có **Centralized root access management** – xoá hẳn credentials root ở member account.
- Ưu tiên **passkey/security key** vì chống phishing; TOTP vẫn có thể bị lừa nhập mã vào trang giả.
- Yêu cầu MFA cho thao tác nhạy cảm bằng condition `aws:MultiFactorAuthPresent`:

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [{
      "Sid": "DenyStopTerminateWithoutMFA",
      "Effect": "Deny",
      "Action": ["ec2:StopInstances", "ec2:TerminateInstances"],
      "Resource": "*",
      "Condition": { "BoolIfExists": { "aws:MultiFactorAuthPresent": "false" } }
    }]
  }
  ```

- Dùng MFA với CLI (lấy session token qua STS) được trình bày ở **Chương 12 – Bài 3**.
- Với IAM Identity Center, MFA được cấu hình tập trung ở Identity Center (hoặc ở IdP bên ngoài như Entra ID, Okta).

### Ghi nhớ cho kỳ thi

- Bảo vệ user: **password policy mạnh + MFA**.
- Các loại MFA: **virtual MFA**, **passkey/U2F/FIDO security key**, **hardware key fob (TOTP)**, **hardware key fob cho GovCloud**.
- **Root account luôn phải bật MFA.**

---

## Bài 4 – Access Keys, CLI và SDK

### Lý thuyết

Có **3 cách** truy cập AWS:

| Cách | Bảo vệ bởi | Dùng khi |
|---|---|---|
| **AWS Management Console** | Password + MFA | Thao tác qua giao diện web |
| **AWS CLI** (Command Line Interface) | **Access Keys** | Dòng lệnh, script, tự động hoá |
| **AWS SDK** (Software Development Kit) | **Access Keys** | Gọi AWS API từ code ứng dụng |

#### Access Keys

- Tạo trong console (**IAM → Users → Security credentials**). **Mỗi user tự quản lý access key của mình.**
- Gồm 2 phần:
  - **Access Key ID** ≈ username (dạng `AKIA...`).
  - **Secret Access Key** ≈ password – **chỉ hiển thị một lần** khi tạo.
- **Access key là bí mật như mật khẩu – không chia sẻ**, không commit lên Git, không gửi qua chat.
- Ví dụ định dạng (giả):

  ```
  Access Key ID:     AKIAIOSFODNN7EXAMPLE
  Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
  ```

#### AWS CLI

- Công cụ dòng lệnh tương tác trực tiếp với **public API** của dịch vụ AWS. Lệnh dạng `aws <service> <operation> [options]`.
- Thay thế được console cho hầu hết thao tác, viết script tự động hoá.
- **Mã nguồn mở**: <https://github.com/aws/aws-cli>.

#### AWS SDK

- Bộ thư viện theo ngôn ngữ, để **nhúng vào ứng dụng** gọi AWS API.
- Hỗ trợ: JavaScript/TypeScript (browser + Node.js), Python (**boto3**), Java, .NET, Go, PHP, Ruby, C++, Rust, Kotlin, Swift…; Mobile (Android, iOS); IoT Device SDK (Embedded C, Arduino…).
- Ví dụ: **AWS CLI v1 được xây dựng trên Python SDK (boto3/botocore)**.

### Kiến thức thực tế

- Khi tạo access key, console bắt chọn **use case** (CLI, local code, chạy trên AWS compute, third-party…) và **gợi ý phương án tốt hơn**: dùng **IAM Identity Center** (`aws configure sso`) cho CLI, dùng **IAM Role** cho code chạy trên AWS. Đây là tín hiệu rõ ràng: **access key dài hạn là phương án cuối cùng**.
- Mỗi IAM user có tối đa **2 access keys** – để **xoay vòng (rotate)**: tạo key mới → cập nhật ứng dụng → **Deactivate** key cũ → kiểm tra → **Delete**.
- Bị lộ key: **deactivate ngay**, kiểm tra **CloudTrail**, xoá tài nguyên lạ; AWS có thể tự gắn policy `AWSCompromisedKeyQuarantineV3` khi phát hiện key bị đăng công khai trên GitHub.
- **Không nên tạo access key cho root** (kiểm tra bằng Credentials Report – Bài 8).
- Công cụ quét bí mật như `git-secrets`, GitHub secret scanning giúp tránh commit nhầm key.

### Ghi nhớ cho kỳ thi

- Console → **password + MFA**; CLI/SDK → **access keys**.
- **Access Key ID ≈ username, Secret Access Key ≈ password**; không chia sẻ.
- SDK dùng để gọi AWS **từ code ứng dụng**; CLI dùng **từ terminal**.

---

## Bài 5 – Cài đặt và sử dụng AWS CLI

### Lý thuyết

- Khoá học dùng **AWS CLI version 2** (v1 đã cũ, chỉ còn để tương thích).
- Sau khi cài, kiểm tra bằng `aws --version` → kết quả dạng `aws-cli/2.x.y Python/3.x ...`.
- `aws configure` hỏi 4 giá trị và lưu vào file trong thư mục home:

| Giá trị | Lưu ở |
|---|---|
| AWS Access Key ID | `~/.aws/credentials` |
| AWS Secret Access Key | `~/.aws/credentials` |
| Default region name (ví dụ `eu-west-1`, `us-east-1`) | `~/.aws/config` |
| Default output format (`json`, `yaml`, `text`, `table`) | `~/.aws/config` |

- Trên Windows: `C:\Users\<tên>\.aws\`.
- **Quyền của CLI = quyền của IAM user sở hữu access key.** Gỡ quyền trong IAM thì lệnh CLI bị `AccessDenied` – giống hệt console.

### Kiến thức thực tế

- **Thứ tự CLI tìm credentials** (rút gọn): tham số dòng lệnh (`--profile`, `--region`) → **biến môi trường** (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`, `AWS_PROFILE`, `AWS_REGION`) → `~/.aws/credentials` & `~/.aws/config` (bao gồm SSO, `credential_process`) → container credentials (ECS) → **instance profile** (EC2 IMDS). Chi tiết profile xem **Chương 12 – Bài 2**.
- **Cách hiện đại thay cho access key dài hạn trên máy dev:**
  - `aws configure sso` + `aws sso login` (IAM Identity Center) → credentials tạm thời, tự hết hạn.
  - `aws login` (CLI v2 bản mới) – đăng nhập CLI bằng chính phiên đăng nhập console, không cần tạo access key.
- `aws configure` trên **EC2 là sai** – luôn dùng IAM Role (Bài 7, Chương 05 – Bài 7).
- Tuỳ chọn tiện lợi của CLI v2: `--cli-auto-prompt` (gợi ý lệnh tương tác), `--no-cli-pager` (hoặc `AWS_PAGER=""`) để tắt pager khi viết script, `--dry-run` với nhiều lệnh EC2 để kiểm tra quyền mà không thực hiện.
- Docker: `docker run --rm -it -v ~/.aws:/root/.aws amazon/aws-cli sts get-caller-identity`.

### Ghi nhớ cho kỳ thi

- `aws configure` lưu key vào `~/.aws/credentials`, region/output vào `~/.aws/config`.
- `aws sts get-caller-identity` → kiểm tra **mình đang là ai** (user/role nào, account nào) – lệnh đầu tiên khi debug quyền.
- CLI bị **AccessDenied** → kiểm tra **IAM policy** của identity đang dùng, không phải cài lại CLI.

---

## Bài 6 – AWS CloudShell

### Lý thuyết

- **AWS CloudShell** là **terminal chạy trong trình duyệt**, mở từ icon `>_` trên thanh điều hướng console.
- **Miễn phí**, đã cài sẵn **AWS CLI v2**, Python, Node.js, git, jq, các SDK…
- **Tự động dùng credentials của người đang đăng nhập console** → không cần `aws configure`, không cần access key.
- Region mặc định = **region đang chọn trong console** (có thể ghi đè bằng `--region`).
- Có **1 GB lưu trữ bền vững** trong thư mục `$HOME` **mỗi region** – file vẫn còn khi mở lại.
- Hỗ trợ **Upload / Download file**, chia **nhiều tab/nhiều pane**, tuỳ chỉnh font, theme.
- **Không có ở mọi region** – nếu không thấy icon, đổi sang region được hỗ trợ (ví dụ `us-east-1`, `eu-west-1`).

### Kiến thức thực tế

- File trong `$HOME` bị **xoá nếu không dùng CloudShell ở region đó trong 120 ngày**.
- **CloudShell VPC environment:** chạy CloudShell bên trong VPC/subnet bạn chọn để truy cập tài nguyên private (RDS, EC2 private) – môi trường này **không có lưu trữ bền vững**.
- Quyền dùng CloudShell kiểm soát bằng IAM (policy `AWSCloudShellFullAccess` hoặc action `cloudshell:*`); có thể chặn upload/download bằng Deny `cloudshell:GetFileUploadUrls`/`cloudshell:GetFileDownloadUrls`.
- Phù hợp cho thao tác nhanh, demo; với công việc thường xuyên vẫn nên cài CLI local cấu hình SSO.

### Ghi nhớ cho kỳ thi

- CloudShell = terminal trong browser, **dùng credentials console**, có sẵn CLI, **1 GB/region** lưu trữ bền vững, miễn phí.
- Dùng CloudShell là cách **không phải tạo access key** để chạy CLI.

---

## Bài 7 – IAM Roles cho dịch vụ AWS

### Lý thuyết

- Một số **dịch vụ AWS cần thực hiện hành động thay bạn** (gọi S3, DynamoDB, CloudWatch…). Ta cấp quyền cho chúng bằng **IAM Role**.
- **Role giống user ở chỗ có policy quyền**, nhưng **không dành cho người cố định** và **không có credentials dài hạn** – ai/cái gì được phép **assume role** sẽ nhận **credentials tạm thời** (qua AWS STS).
- Mỗi role có 2 loại policy:

| Policy | Trả lời câu hỏi |
|---|---|
| **Trust policy** (resource-based, có `Principal`) | **Ai** được assume role? (ví dụ `ec2.amazonaws.com`) |
| **Permissions policy** | Assume xong thì **được làm gì**? |

- Ví dụ role phổ biến:
  - **EC2 Instance Role** – ứng dụng trên EC2 gọi AWS API.
  - **Lambda Function Role (execution role)** – Lambda ghi log CloudWatch, đọc DynamoDB…
  - **Role cho CloudFormation**, CodeBuild, ECS task…

Trust policy cho EC2:

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

Trust policy cho Lambda chỉ khác dòng `"Service": "lambda.amazonaws.com"`.

### Kiến thức thực tế

- Console tạo role cho EC2 sẽ **tự tạo instance profile** cùng tên; CLI/IaC phải tạo riêng.
- Người gán role cho dịch vụ cần quyền **`iam:PassRole`** trên role đó – giới hạn `Resource` cụ thể, tránh `"*"`.
- Siết trust policy chống **confused deputy** bằng condition `aws:SourceAccount` / `aws:SourceArn` khi dịch vụ hỗ trợ.
- **Service-linked role**: role do dịch vụ tự tạo và quản lý (ví dụ `AWSServiceRoleForAutoScaling`), bạn không sửa được permissions.
- Workload ngoài AWS (on-prem, CI/CD) nên dùng **IAM Roles Anywhere** hoặc **OIDC federation** (GitHub Actions → `sts:AssumeRoleWithWebIdentity`) thay cho access key.

### Ghi nhớ cho kỳ thi

- **Dịch vụ AWS cần quyền → IAM Role**, không dùng access key.
- Role = permissions policy + **trust policy** (ai được assume).
- Credentials của role là **tạm thời** (STS), tự xoay vòng.

---

## Bài 8 – IAM Security Tools: Credentials Report và Access Advisor

### Lý thuyết

| Công cụ | Phạm vi | Cho biết | Dùng để |
|---|---|---|---|
| **IAM Credentials Report** | **Cấp tài khoản (account-level)** | File **CSV** liệt kê **mọi user** (kể cả root) và trạng thái credentials: password enabled, lần dùng password cuối, ngày đổi mật khẩu, **MFA active**, access key 1/2 active, lần dùng key cuối, lần rotate… | Audit, tìm user không bật MFA, key cũ chưa xoay vòng |
| **IAM Access Advisor** (tab *Last accessed*) | **Cấp user** (cũng có cho group, role, policy) | **Các dịch vụ** mà identity **được cấp quyền** và **lần cuối truy cập** từng dịch vụ | Cắt quyền không dùng → **least privilege** |

- Mẹo nhớ: **Credentials Report = account-level, CSV, credentials**; **Access Advisor = user-level, services last accessed, permissions**.

### Kiến thức thực tế

- Credentials Report được sinh lại tối đa **mỗi 4 giờ** (gọi lại trong 4 giờ sẽ trả bản cũ).
- Access Advisor có **action-level last accessed** cho một số dịch vụ (S3, EC2, IAM, Lambda…), giúp cắt quyền chi tiết hơn.
- **IAM Access Analyzer** bổ sung:
  - **External access** – tìm tài nguyên chia sẻ ra ngoài tài khoản/tổ chức (bucket, KMS key, role…).
  - **Unused access** – liệt kê role/user/key/permission không dùng (tính phí).
  - **Policy generation & validation** (Bài 2).
- Ở quy mô tổ chức: kết hợp **AWS Security Hub**, **AWS Config** rules (ví dụ `iam-user-mfa-enabled`, `access-keys-rotated`), **CloudTrail** để audit ai gọi API gì.

### Ghi nhớ cho kỳ thi

- "Liệt kê **tất cả user** và trạng thái **credentials/MFA**" → **IAM Credentials Report**.
- "Xem **quyền dịch vụ** của **một user** và lần dùng gần nhất để cắt bớt quyền" → **IAM Access Advisor**.

---

## Bài 9 – IAM Best Practices, Shared Responsibility và tổng kết

### Lý thuyết

#### IAM Guidelines & Best Practices (theo khoá học)

1. **Không dùng root account** trừ khi thiết lập tài khoản.
2. **Một người dùng vật lý = một AWS user**; **không chia sẻ** credentials.
3. **Gán user vào group** và gán quyền cho group.
4. Tạo **password policy** mạnh.
5. Dùng và **bắt buộc MFA**.
6. Tạo và dùng **Roles** để cấp quyền cho dịch vụ AWS.
7. Dùng **Access Keys** cho truy cập lập trình (CLI/SDK) – và **giữ bí mật**.
8. **Audit quyền** bằng **Credentials Report** và **Access Advisor**.
9. **Không bao giờ chia sẻ IAM user & access keys**.

#### Shared Responsibility Model cho IAM

| AWS chịu trách nhiệm | Bạn (khách hàng) chịu trách nhiệm |
|---|---|
| Hạ tầng (bảo mật mạng toàn cầu) | Quản lý **users, groups, roles, policies** và giám sát chúng |
| Phân tích cấu hình và lỗ hổng | **Bật MFA** cho mọi tài khoản |
| Validation tuân thủ (compliance) | **Xoay vòng (rotate) keys** thường xuyên |
| | Dùng công cụ IAM để **cấp quyền phù hợp** (least privilege) |
| | **Phân tích access patterns** và review quyền |

- Tóm lại: **AWS bảo mật "của" cloud; bạn bảo mật "trong" cloud** – IAM hoàn toàn là trách nhiệm cấu hình của bạn.

#### Tổng kết thuật ngữ

| Thuật ngữ | Ý nghĩa |
|---|---|
| **Users** | Ánh xạ tới người dùng vật lý, có password cho console |
| **Groups** | Chỉ chứa users |
| **Policies** | Tài liệu JSON định nghĩa quyền cho users, groups, roles |
| **Roles** | Cho EC2 instances / dịch vụ AWS (và cho người dùng federated) |
| **Security** | MFA + password policy |
| **AWS CLI** | Quản lý dịch vụ AWS bằng dòng lệnh |
| **AWS SDK** | Quản lý dịch vụ AWS bằng ngôn ngữ lập trình |
| **Access Keys** | Truy cập AWS bằng CLI hoặc SDK |
| **Audit** | IAM Credentials Report & IAM Access Advisor |

### Kiến thức thực tế

Best practices hiện nay (theo tài liệu *Security best practices in IAM* của AWS) đi xa hơn danh sách trong video:

- **Con người → federation với IdP + IAM Identity Center** để dùng **credentials tạm thời**, thay vì IAM user dài hạn.
- **Workload → IAM Roles** (EC2 instance profile, Lambda execution role, ECS task role, IRSA/EKS Pod Identity, IAM Roles Anywhere cho on-prem, OIDC cho CI/CD).
- **Bắt buộc MFA**, ưu tiên **passkey/FIDO2** chống phishing.
- **Rotate access keys** khi buộc phải dùng key dài hạn; xoá key/user không dùng (Access Analyzer unused access).
- **Least privilege**: bắt đầu từ AWS managed policy, rồi thu hẹp bằng **customer managed policy** sinh từ access activity.
- **Guardrails** đa tài khoản: **SCP/RCP** trong AWS Organizations, **permissions boundaries** cho delegated admin.
- **Conditions** để siết thêm (`aws:SourceIp`, `aws:MultiFactorAuthPresent`, `aws:PrincipalOrgID`, tag-based ABAC).
- **Bảo vệ root:** MFA, không tạo access key cho root, dùng centralized root access management nếu có Organizations.

### Ghi nhớ cho kỳ thi

- Câu hỏi "trách nhiệm của khách hàng" về IAM → **quản lý users/groups/roles/policies, bật MFA, rotate keys, least privilege, phân tích access**.
- Câu hỏi "AWS chịu trách nhiệm" → **hạ tầng, compliance validation**.
- **Không chia sẻ** user/key; **một người – một user**; **role cho dịch vụ**.

---

## Tổng kết chương

| Chủ đề | Điều cần nhớ |
|---|---|
| IAM | Dịch vụ **global**, miễn phí; Authentication + Authorization |
| Root | Không dùng/không chia sẻ; **luôn bật MFA**; không tạo access key |
| Users/Groups | Group chỉ chứa user, không lồng nhau; user thuộc 0..n group |
| Policies | JSON: Version `2012-10-17`, Statement (Sid, Effect, Principal, Action, Resource, Condition); **explicit Deny thắng**; least privilege |
| Loại policy | AWS managed / customer managed / inline |
| Password & MFA | Password policy (độ dài, ký tự, hết hạn, chống dùng lại); MFA: virtual app, passkey/security key, hardware TOTP, GovCloud token |
| Truy cập AWS | Console (password+MFA), CLI & SDK (**access keys**) |
| AWS CLI | v2; `aws configure` → `~/.aws/credentials` + `~/.aws/config`; `aws sts get-caller-identity` |
| CloudShell | Terminal trong browser, dùng credentials console, 1 GB/region |
| Roles | Credentials tạm thời; trust policy (ai assume) + permissions policy; dùng cho EC2, Lambda… |
| Security tools | **Credentials Report** (account, CSV, credentials) vs **Access Advisor** (user, services last accessed) |
| Shared responsibility | AWS: hạ tầng; Bạn: users/policies, MFA, rotate keys, least privilege |
| Cập nhật 2026 | **IAM Identity Center** cho con người; MFA root bắt buộc; passkeys; tối đa 8 MFA/user; `aws configure sso`/`aws login`; Access Analyzer unused access |

---

## Câu hỏi ôn tập

*Soạn theo phong cách IAM & AWS CLI Quiz. Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Phát biểu nào **đúng** về IAM Groups?

- A. Một group có thể chứa các group khác
- B. Một group chỉ chứa users
- C. Mỗi user bắt buộc phải thuộc đúng một group
- D. Group có thể chứa cả users và roles

<details><summary>Đáp án</summary>

**B.** Group chỉ chứa users, không lồng group (A sai), không chứa role (D sai). User có thể không thuộc group nào hoặc thuộc nhiều group (C sai).
</details>

**Câu 2.** IAM là dịch vụ thuộc phạm vi nào?

- A. Theo Availability Zone
- B. Theo Region
- C. Global
- D. Theo VPC

<details><summary>Đáp án</summary>

**C. Global.** Users, groups, roles, policies dùng chung cho mọi region.
</details>

**Câu 3.** Phát biểu nào đúng về root account?

- A. Nên dùng root cho công việc quản trị hằng ngày vì có toàn quyền
- B. Nên tạo access key cho root để dùng với CLI
- C. Chỉ dùng root để thiết lập tài khoản và các tác vụ bắt buộc root; luôn bật MFA
- D. Có thể giới hạn quyền của root bằng IAM policy gắn trực tiếp

<details><summary>Đáp án</summary>

**C.** Root không dùng hằng ngày (A), không tạo access key (B). IAM policy không giới hạn được root (D) – chỉ SCP trong Organizations mới hạn chế được root của member account.
</details>

**Câu 4.** Trong một IAM policy statement, thành phần nào là **bắt buộc**?

- A. Sid
- B. Condition
- C. Effect
- D. Id

<details><summary>Đáp án</summary>

**C. Effect** (cùng với Action, và Resource với identity-based policy). Sid, Id, Condition là tuỳ chọn.
</details>

**Câu 5.** Một user thuộc group có policy `Allow s3:*` trên mọi bucket, nhưng được gắn trực tiếp policy `Deny s3:DeleteObject` trên bucket `prod-data`. Khi user xoá object trong `prod-data` thì sao?

- A. Được phép vì Allow ở group có độ ưu tiên cao hơn
- B. Được phép vì `s3:*` bao gồm `DeleteObject`
- C. Bị từ chối vì explicit Deny luôn thắng
- D. Kết quả phụ thuộc thứ tự policy được gắn

<details><summary>Đáp án</summary>

**C.** Logic đánh giá IAM: explicit Deny thắng mọi Allow, không phụ thuộc thứ tự gắn.
</details>

**Câu 6.** Nguyên tắc nào AWS khuyến nghị khi cấp quyền IAM?

- A. Cấp `AdministratorAccess` để tránh lỗi AccessDenied
- B. Least privilege – chỉ cấp quyền cần thiết
- C. Cấp quyền theo region
- D. Mọi user dùng chung một policy

<details><summary>Đáp án</summary>

**B. Least privilege.**
</details>

**Câu 7.** Thiết bị nào **không** phải là một loại MFA được IAM hỗ trợ?

- A. Ứng dụng authenticator (Google Authenticator, Authy)
- B. Passkey / FIDO security key (ví dụ YubiKey)
- C. Hardware TOTP key fob
- D. Mã OTP gửi qua SMS cho IAM user

<details><summary>Đáp án</summary>

**D.** IAM đã ngừng hỗ trợ SMS MFA cho IAM user. Các loại hợp lệ: virtual MFA, passkey/security key, hardware TOTP token (và token cho GovCloud).
</details>

**Câu 8.** Để truy cập AWS bằng CLI hoặc SDK với một IAM user, bạn cần gì?

- A. Username và password console
- B. Access Key ID và Secret Access Key
- C. Mã MFA
- D. Account alias

<details><summary>Đáp án</summary>

**B.** CLI/SDK được bảo vệ bởi access keys; password + MFA dành cho console.
</details>

**Câu 9.** Sau `aws configure`, Secret Access Key được lưu ở đâu theo mặc định?

- A. `~/.aws/config`
- B. `~/.aws/credentials`
- C. Biến môi trường `AWS_SECRET_ACCESS_KEY` vĩnh viễn
- D. Trong IAM, CLI chỉ lưu Access Key ID

<details><summary>Đáp án</summary>

**B.** Key nằm ở `~/.aws/credentials`; region và output format nằm ở `~/.aws/config`.
</details>

**Câu 10.** Lệnh nào giúp bạn biết CLI đang dùng identity nào (user/role, account)?

- A. `aws iam get-user --me`
- B. `aws configure list-identity`
- C. `aws sts get-caller-identity`
- D. `aws whoami`

<details><summary>Đáp án</summary>

**C.** `sts get-caller-identity` trả về UserId, Account, Arn và không cần quyền IAM đặc biệt nào.
</details>

**Câu 11.** Một ứng dụng chạy trên EC2 cần đọc object từ S3. Cách cấp quyền đúng là gì?

- A. Chạy `aws configure` trên instance với access key của developer
- B. Tạo IAM Role có trust policy cho `ec2.amazonaws.com` và gắn vào instance
- C. Hard-code access key trong mã nguồn
- D. Tạo IAM user riêng cho instance và lưu key vào User Data

<details><summary>Đáp án</summary>

**B.** Dịch vụ AWS cần quyền → IAM Role (credentials tạm thời, tự xoay vòng). A, C, D đều để lộ credentials dài hạn.
</details>

**Câu 12.** Bạn cần một file liệt kê **tất cả** IAM users trong tài khoản cùng trạng thái mật khẩu, MFA và access keys. Dùng công cụ nào?

- A. IAM Access Advisor
- B. IAM Credentials Report
- C. AWS CloudTrail
- D. IAM Policy Simulator

<details><summary>Đáp án</summary>

**B. Credentials Report** – báo cáo CSV cấp tài khoản. Access Advisor (A) là cấp user và nói về dịch vụ được truy cập.
</details>

**Câu 13.** Bạn muốn biết một user đã thực sự dùng những dịch vụ nào trong số dịch vụ được cấp quyền, để thu hẹp policy. Dùng công cụ nào?

- A. IAM Access Advisor
- B. IAM Credentials Report
- C. AWS Budgets
- D. AWS CloudShell

<details><summary>Đáp án</summary>

**A. Access Advisor** – hiển thị quyền dịch vụ và thời điểm truy cập gần nhất, phục vụ least privilege.
</details>

**Câu 14.** Theo Shared Responsibility Model, việc nào thuộc trách nhiệm **của AWS** đối với IAM?

- A. Bật MFA cho người dùng
- B. Xoay vòng access keys
- C. Bảo mật hạ tầng toàn cầu và compliance validation
- D. Phân tích access pattern và review quyền

<details><summary>Đáp án</summary>

**C.** A, B, D là trách nhiệm của khách hàng.
</details>

**Câu 15.** Phát biểu nào đúng về AWS CloudShell?

- A. Bạn phải chạy `aws configure` trước khi dùng CLI trong CloudShell
- B. CloudShell dùng credentials của người đang đăng nhập console và có sẵn AWS CLI
- C. Dữ liệu trong `$HOME` bị xoá mỗi lần đóng CloudShell
- D. CloudShell là dịch vụ trả phí theo giờ

<details><summary>Đáp án</summary>

**B.** CloudShell miễn phí, tự dùng credentials console, có 1 GB lưu trữ bền vững mỗi region (C sai).
</details>

**Câu 16.** Công ty có hàng trăm nhân viên cần truy cập nhiều tài khoản AWS. Cách được AWS khuyến nghị hiện nay là gì?

- A. Tạo một IAM user chung cho mỗi team và chia sẻ mật khẩu
- B. Tạo IAM user + access key riêng ở từng tài khoản cho mỗi nhân viên
- C. Dùng IAM Identity Center (kết nối IdP của công ty) với permission sets để cấp credentials tạm thời
- D. Chia sẻ root account có bật MFA

<details><summary>Đáp án</summary>

**C.** IAM Identity Center tập trung danh tính, cấp credentials tạm thời cho nhiều tài khoản. A và D vi phạm nguyên tắc không chia sẻ; B khó quản lý và dùng credentials dài hạn.
</details>

---

[← Chương 03](ch03-getting-started-with-aws.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Chương 05 →](ch05-ec2-fundamentals.md)
