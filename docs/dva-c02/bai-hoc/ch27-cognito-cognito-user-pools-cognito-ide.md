# Chương 27 – Cognito: Cognito User Pools, Cognito Identity Pools & Cognito Sync

> **Nguồn:** 8 video của chương + *Cognito Quiz* (6 câu).
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay (2026). Kỳ thi hiện tại là **DVA-C02**. Một số điểm đã thay đổi so với thời điểm quay video:
> - **Hosted UI** đã được thay bằng **Managed Login** (từ 11/2024; Hosted UI vẫn gọi là *classic*).
> - Cognito User Pools có **feature plans** (Lite / Essentials / Plus); tính năng *advanced security* (adaptive authentication, compromised credentials) nay gọi là **threat protection** và thuộc gói **Plus**.
> - **Cognito Sync** (có trong tên chương) đã lỗi thời – AWS khuyến nghị dùng **AWS AppSync** để đồng bộ dữ liệu người dùng. Không có video riêng về Cognito Sync trong chương này.

## Mục tiêu chương

Sau chương này bạn có thể:

- Giải thích **Amazon Cognito** dùng để làm gì và khác IAM ở đâu.
- Mô tả **Cognito User Pools (CUP)**: đăng ký/đăng nhập, MFA, federation, JWT, tích hợp API Gateway và ALB.
- Tạo User Pool, đăng ký user qua **Managed Login**.
- Dùng **Lambda triggers**, custom domain (ACM **us-east-1**), **adaptive authentication**, và đọc/verify **JWT**.
- Cấu hình **ALB authentication** với Cognito User Pools hoặc OIDC IdP.
- Mô tả **Cognito Identity Pools**: đổi token lấy **credentials AWS tạm thời**, guest access, IAM role, **policy variables**.
- Phân biệt rõ **User Pools (authentication)** và **Identity Pools (authorization)**.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001 | Cognito Overview | Bài 1 – Tổng quan Amazon Cognito |
| 002–003 | Cognito User Pools | Bài 2 – Cognito User Pools |
| 004 | Cognito User Pools – Others | Bài 3 – User Pools nâng cao: Lambda triggers, Hosted UI/Managed Login, custom domain, adaptive authentication, JWT |
| 005 | Application Load Balancer – User Authentication | Bài 4 – Xác thực người dùng trên ALB |
| 006–007 | Cognito Identity Pools | Bài 5 – Cognito Identity Pools |
| 008 | Cognito User Pools vs Cognito Identity Pools | Bài 6 – So sánh User Pools và Identity Pools |
| Quiz | Cognito Quiz | Câu hỏi ôn tập |

---

## Bài 1 – Tổng quan Amazon Cognito

### Lý thuyết

- **Amazon Cognito** cung cấp **danh tính (identity)** cho người dùng để tương tác với **ứng dụng web và mobile**.
- Những người dùng này thường **nằm ngoài tài khoản AWS** – tên "Cognito" ám chỉ việc cấp danh tính cho những người dùng mà ta "chưa biết" (incognito).
- Hai dịch vụ con:

| Dịch vụ | Chức năng | Tích hợp |
|---|---|---|
| **Cognito User Pools** | Chức năng **đăng nhập (sign-in)** cho người dùng ứng dụng | **API Gateway**, **Application Load Balancer** |
| **Cognito Identity Pools** (trước đây gọi là **Federated Identity**) | Cấp **credentials AWS tạm thời** cho người dùng để truy cập trực tiếp tài nguyên AWS | Tích hợp tốt với Cognito User Pools |

- **Cognito vs IAM:** IAM dành cho người/dịch vụ **trong** tổ chức quản trị AWS; Cognito dành cho **người dùng cuối** của ứng dụng web/mobile, nằm **ngoài** AWS.
- Từ khoá nhận biết trong đề: **"hàng trăm/hàng nghìn người dùng", "mobile users", "xác thực bằng SAML/Google/Facebook…"** → Cognito.

### Kiến thức thực tế

- Cognito được tích hợp mạnh với **AWS Amplify** (thư viện frontend/mobile) – trong thực tế, đa số ứng dụng React/React Native/Flutter dùng Amplify `Auth` để gọi Cognito thay vì gọi API thô.
- Tính phí User Pools theo **MAU (Monthly Active Users)** và theo feature plan; Identity Pools không tính phí riêng (bạn trả cho dịch vụ AWS mà user truy cập).
- Cognito là dịch vụ **regional**: User Pool và Identity Pool nằm trong một region.

### Ghi nhớ cho kỳ thi

- Người dùng ứng dụng web/mobile (không phải nhân viên quản trị AWS) → **Cognito**, không tạo IAM user.
- **User Pools = đăng nhập**, **Identity Pools = credentials AWS**.

---

## Bài 2 – Cognito User Pools

### Lý thuyết

- **Cognito User Pools (CUP)** = **database người dùng serverless** cho ứng dụng web/mobile.
- Tính năng:
  - Đăng nhập đơn giản bằng **username hoặc email + password**.
  - **Reset mật khẩu**.
  - **Xác minh email và số điện thoại**.
  - **MFA (Multi-Factor Authentication)**.
  - **Federated Identities**: đăng nhập bằng **Google, Facebook, SAML**…
  - **Chặn user nếu credentials bị lộ** ở nơi khác (AWS quét các bộ credentials bị rò rỉ).
- **Đăng nhập thành công → trả về JWT (JSON Web Token).**

#### Kiến trúc

```
Web/Mobile app ──login──▶ Cognito User Pool (database user nội bộ)
       ◀──── JWT ────────┘
                         ├── Federation: Social IdP (Login with Amazon, Google, Facebook, Apple)
                         └── Federation: SAML / OpenID Connect (OIDC) IdP
```

#### Tích hợp

| Dịch vụ | Cách hoạt động |
|---|---|
| **API Gateway** | User đăng nhập CUP → nhận JWT → gửi JWT kèm request tới API Gateway → API Gateway **xác thực token (Cognito authorizer)** → cho phép gọi backend |
| **Application Load Balancer** | Dùng **listener và rule** của ALB để xác thực user với CUP → sau đó forward tới **Target Group** (EC2, Lambda, ECS) |

#### Các mục cấu hình User Pool (theo hands-on, console mới)

| Mục | Nội dung |
|---|---|
| **App clients** | Ứng dụng kết nối vào user pool (ở đây là web app) |
| **Users** | Danh sách user; có thể tạo user bằng email + mật khẩu tạm |
| **Groups** | Nhóm user |
| **Authentication methods** | **Email**: mặc định gửi bằng Cognito – chỉ để test, giới hạn **50 email/ngày**; production dùng **Amazon SES** (cấu hình *From*, *Reply-to*). **SMS**. **Password policy** (độ dài tối thiểu, hết hạn mật khẩu tạm, yêu cầu ký tự). **Passkey** (sinh trắc học, không cần mật khẩu) |
| **Sign-in** | Định danh đăng nhập (email/phone/username – **không sửa được** sau khi tạo); **MFA** (Required/Optional/No); cách khôi phục tài khoản |
| **Sign-up** | Xác minh user (email/SMS), **required attributes** (không sửa được sau khi tạo), **custom attributes** (string/number), cho phép **self-registration** |
| **Social and external providers** | Federated IdP: **Facebook, Google, Login with Amazon, Sign in with Apple, SAML, OIDC** |
| **Extensions** | **Lambda triggers** (sau sign-up, sau authentication, custom auth, custom message…) |
| **Threat protection / Security** | **AWS WAF** để giám sát request; **threat protection** (adaptive authentication, compromised credentials); **log streaming** |
| **Branding → Domain** | Domain Cognito tự sinh (prefix) hoặc **custom domain** (ví dụ dùng Route 53) |
| **Branding → Managed login** | Tuỳ biến giao diện login (style, trang sign-in, reset password…). Trước đây là **Hosted UI** |
| **Message templates** | Sửa nội dung email/SMS xác minh theo thương hiệu |

### Kiến thức thực tế

- Đăng nhập trả về **3 token**:

| Token | Dùng để |
|---|---|
| **ID token** (JWT) | Chứa thông tin danh tính user (claims: `sub`, `email`, `cognito:groups`…) – dùng ở frontend, gửi lên Identity Pool |
| **Access token** (JWT) | Ủy quyền gọi API (chứa `scope`, `cognito:groups`) – gửi lên API Gateway/backend |
| **Refresh token** | Lấy ID/Access token mới khi hết hạn (mặc định ID/Access token 1 giờ; refresh token 30 ngày, cấu hình được) |

- Ví dụ đăng nhập bằng **Amplify JS v6**:

  ```javascript
  import { Amplify } from "aws-amplify";
  import { signUp, signIn, fetchAuthSession } from "aws-amplify/auth";

  Amplify.configure({
    Auth: { Cognito: { userPoolId: "ap-southeast-1_AbCdEf123", userPoolClientId: "1example23456789" } },
  });

  await signIn({ username: "demo@example.com", password: "Passw0rd!" });
  const { tokens } = await fetchAuthSession();
  const idToken = tokens.idToken.toString();   // gửi lên API Gateway trong header Authorization
  ```

- Gọi API Gateway có **Cognito User Pool authorizer**: gửi token trong header `Authorization` (mặc định), API Gateway tự kiểm tra chữ ký, hạn dùng, issuer.

  ```bash
  curl -H "Authorization: $ID_TOKEN" https://abc123.execute-api.ap-southeast-1.amazonaws.com/prod/items
  ```

- **Production phải cấu hình SES** cho email – giới hạn email mặc định của Cognito rất thấp và không phù hợp chạy thật.
- **Sign-in identifiers và required attributes không đổi được sau khi tạo pool** → thiết kế kỹ từ đầu; muốn đổi phải tạo pool mới và migrate user (dùng trigger *User migration*).
- **App client secret:** ứng dụng chạy trên trình duyệt/mobile **không được** dùng client secret (không giữ bí mật được); chỉ backend (confidential client) mới dùng secret.
- **Feature plans (từ 11/2024):** *Lite* (tính năng cơ bản), *Essentials* (mặc định cho pool mới – có Managed Login, passwordless/passkey, tuỳ biến access token), *Plus* (thêm threat protection). Kiểm tra plan trước khi dùng tính năng nâng cao.

### Ghi nhớ cho kỳ thi

- CUP = **database user serverless**: sign-up/sign-in, reset password, xác minh email/phone, **MFA**, **federation** (Google, Facebook, SAML, OIDC).
- **Đăng nhập thành công → JWT** (không phải SAML token, không phải username/password).
- CUP tích hợp **API Gateway** và **Application Load Balancer** (**không** tích hợp Classic Load Balancer).
- Xác thực user qua Facebook trước khi gọi API Gateway → **CUP (federation Facebook) + Cognito authorizer**.

---

## Bài 3 – User Pools nâng cao: Lambda triggers, Hosted UI/Managed Login, custom domain, adaptive authentication, JWT

### Lý thuyết

#### Lambda Triggers

- CUP có thể **gọi Lambda function đồng bộ (synchronously)** khi xảy ra một số sự kiện.

| Luồng | Trigger | Ví dụ use case |
|---|---|---|
| **Authentication Events** | **Pre Authentication** | Logic tuỳ chỉnh để **chấp nhận hoặc từ chối** yêu cầu đăng nhập |
| | **Post Authentication** | **Ghi log sự kiện** sau khi đăng nhập thành công cho analytics tuỳ chỉnh |
| | **Pre Token Generation** | **Thêm hoặc bỏ claims** trong token |
| **Sign-Up** | **Pre Sign-up** | Logic tuỳ chỉnh để chấp nhận/từ chối đăng ký |
| | **Post Confirmation** | Gửi **lời chào** tuỳ chỉnh, ghi log analytics sau khi user xác nhận đăng ký |
| | **Migrate User** | Chuyển user từ thư mục user cũ sang user pool khi họ đăng nhập |
| **Messages** | **Custom Message** | Tuỳ biến nội dung tin nhắn gửi user (email/SMS) |
| **Token Creation** | **Pre Token Generation** | Thêm/bỏ thuộc tính trong **ID token** |

#### Hosted Authentication UI (nay là Managed Login)

- Cognito có **giao diện xác thực dựng sẵn**, không cần tự lập trình UI đăng ký/đăng nhập.
- Đã tích hợp sẵn **social login, OIDC, SAML**.
- Có thể tuỳ biến **logo** và **CSS** để trông như thuộc website của bạn (không tuỳ biến được JavaScript bên dưới).

#### Custom domain cho Hosted UI

- Muốn host UI trên **domain riêng** (ví dụ `auth.example.com`):
  - **Bắt buộc** có certificate HTTPS trong **ACM**, và **certificate phải ở region `us-east-1`** – **không có lựa chọn khác**, kể cả khi user pool ở region khác (ví dụ eu-west-1).
  - Custom domain cấu hình trong phần **App Integration** của User Pool (cấu hình chung cho mọi app client). Trong console mới: **Branding → Domain**.

#### Adaptive Authentication

- User đăng nhập bình thường bằng username/password; nếu **đăng nhập đáng ngờ** thì Cognito **chặn** hoặc **yêu cầu MFA**.
- Mỗi lần đăng nhập được Cognito chấm **risk score: Low / Medium / High** – khả năng yêu cầu đến từ kẻ tấn công.
- User chỉ bị yêu cầu MFA **khi phát hiện rủi ro** (ví dụ đăng nhập từ địa điểm mới).
- Risk score dựa trên: cùng thiết bị quen thuộc hay không, **vị trí**, **địa chỉ IP**…
- Có **account takeover protection**, **phát hiện credentials bị lộ**, xác minh qua phone/email.
- Mọi hoạt động (lần đăng nhập, risk score, challenge thất bại…) được ghi vào **CloudWatch Logs**.

#### Giải mã JWT

- JWT được **mã hoá Base64**, gồm 3 phần: **Header . Payload . Signature**.
- **Phải verify signature** trước khi tin nội dung payload – nếu không, ai cũng có thể tự khai một user bất kỳ. Dùng thư viện có sẵn để verify.
- **Payload** chứa thông tin user:
  - **`sub`** (UUID) – **user ID** trong database của Cognito User Pool. Dùng `sub` để tra thêm mọi thuộc tính của user (email, given_name, phone…).
  - `cognito:username`, `cognito:groups`, `exp` (hạn token)…

Ví dụ payload ID token sau khi giải mã:

```json
{
  "sub": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "cognito:groups": ["admin"],
  "email_verified": true,
  "iss": "https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_AbCdEf123",
  "cognito:username": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "aud": "1example23456789",
  "token_use": "id",
  "auth_time": 1760400000,
  "exp": 1760403600,
  "iat": 1760400000,
  "email": "demo@example.com"
}
```

### Kiến thức thực tế

- **Lambda trigger mẫu – Post Authentication ghi log đăng nhập** (ví dụ cho câu hỏi "lưu mọi lần login thành công vào RDS"):

  ```python
  # Lambda (Python) gắn vào trigger Post authentication
  import json, os, datetime
  import pymysql  # đóng gói kèm layer

  def lambda_handler(event, context):
      user_sub = event["request"]["userAttributes"]["sub"]
      email = event["request"]["userAttributes"].get("email")
      conn = pymysql.connect(host=os.environ["DB_HOST"], user=os.environ["DB_USER"],
                             password=os.environ["DB_PASS"], database="audit")
      with conn.cursor() as cur:
          cur.execute("INSERT INTO logins(sub, email, ts) VALUES (%s, %s, %s)",
                      (user_sub, email, datetime.datetime.utcnow()))
      conn.commit()
      return event   # BẮT BUỘC trả lại event cho Cognito
  ```

  Gắn trigger bằng CLI (Lambda cũng cần resource-based policy cho `cognito-idp.amazonaws.com`):

  ```bash
  aws lambda add-permission --function-name PostAuthLogger --statement-id cognito \
    --action lambda:InvokeFunction --principal cognito-idp.amazonaws.com \
    --source-arn arn:aws:cognito-idp:ap-southeast-1:123456789012:userpool/ap-southeast-1_AbCdEf123
  aws cognito-idp update-user-pool --user-pool-id ap-southeast-1_AbCdEf123 \
    --lambda-config PostAuthentication=arn:aws:lambda:ap-southeast-1:123456789012:function:PostAuthLogger
  ```

  > Lưu ý: `update-user-pool` **ghi đè** các cấu hình không truyền vào về mặc định – trong thực tế nên dùng console, CloudFormation/CDK hoặc truyền đủ tham số.

- Lambda trigger phải trả về **trong khoảng 5 giây**, nếu không Cognito coi là lỗi (có thể retry tối đa 3 lần). Tránh xử lý nặng trong trigger; nếu cần, đẩy vào SQS/EventBridge.
- **Pre Token Generation V2** (event version `V2_0`, từ 12/2023, cần plan Essentials/Plus) cho phép tuỳ biến cả **access token** (thêm scopes/claims), không chỉ ID token.
- **Verify JWT ở backend** bằng thư viện chính thức `aws-jwt-verify` (Node.js):

  ```javascript
  import { CognitoJwtVerifier } from "aws-jwt-verify";

  const verifier = CognitoJwtVerifier.create({
    userPoolId: "ap-southeast-1_AbCdEf123",
    tokenUse: "access",            // hoặc "id"
    clientId: "1example23456789",
  });
  const payload = await verifier.verify(token); // ném lỗi nếu chữ ký/hạn/issuer sai
  console.log(payload.sub);
  ```

  Khoá công khai (JWKS) để verify nằm ở `https://cognito-idp.<region>.amazonaws.com/<userPoolId>/.well-known/jwks.json`.
- **Managed Login (từ 11/2024)** thay cho Hosted UI: tuỳ biến bằng **branding editor** (style, màu, logo, background, layout) hoặc API `CreateManagedLoginBranding`, không còn chỉ là chỉnh CSS. Hosted UI cũ vẫn tồn tại dưới tên *Hosted UI (classic)*. Custom domain vẫn cần **ACM certificate ở us-east-1**.
- **Adaptive authentication** + **compromised credentials** nay thuộc **threat protection** (trước gọi là *advanced security features*), yêu cầu **feature plan Plus**; có chế độ **Audit-only** (chỉ ghi log) và **Full-function** (hành động).

### Ghi nhớ cho kỳ thi

- Ghi log mỗi lần **đăng nhập thành công** → **Post Authentication** Lambda trigger (không phải Pre Authentication).
- Chấp nhận/từ chối đăng nhập → **Pre Authentication**; thêm/bỏ claims → **Pre Token Generation**; migrate user cũ → **Migrate User**.
- Hosted UI tuỳ biến được **logo, CSS, URL (custom domain)** – **không** tuỳ biến được **JavaScript**.
- Custom domain cho Hosted UI/Managed Login → **ACM certificate ở us-east-1** (bắt buộc).
- Đăng nhập đáng ngờ → yêu cầu MFA → **Adaptive Authentication**.
- JWT: **verify signature** trước khi tin payload; **`sub`** = user ID.

---

## Bài 4 – Xác thực người dùng trên Application Load Balancer

### Lý thuyết

- ALB có thể **xác thực người dùng** thay cho ứng dụng → ứng dụng chỉ cần tập trung vào **business logic**.
- Hai cách:

| Cách | Dùng khi |
|---|---|
| **Identity Provider (IdP) chuẩn OpenID Connect (OIDC-compliant)** – `authenticate-oidc` | Tích hợp trực tiếp với IdP OIDC bất kỳ, **không qua** Cognito |
| **Cognito User Pools** – `authenticate-cognito` | **Social IdP** (Login with Amazon, Facebook, Google) hoặc **corporate identities** dùng **SAML, LDAP, Microsoft AD** |

- **Bắt buộc dùng HTTPS listener** để đặt rule `authenticate-oidc` hoặc `authenticate-cognito`.
- Listener rule thường có **2 action**: (1) **authenticate**, (2) **forward** tới target group.
- **OnUnauthenticatedRequest** – khi user chưa đăng nhập:

| Giá trị | Hành vi |
|---|---|
| **authenticate** (mặc định) | Chuyển user tới trang đăng nhập |
| **deny** | Trả lỗi **401 Unauthorized** |
| **allow** | Cho qua (hữu ích cho **trang login** hoặc trang public) |

#### Luồng với Cognito User Pools

1. User gửi `GET /api/data` tới ALB (HTTPS).
2. ALB có action **authenticate-cognito** → Cognito xác thực user.
3. ALB forward request tới backend (ví dụ **Amazon ECS**) **kèm thông tin user** từ Cognito → backend trả response tuỳ theo user.

**Các bước cấu hình:**
1. Tạo **Cognito User Pool, App client, Domain**.
2. Đảm bảo **ID token** được trả về (mặc định của Cognito User Pools).
3. Nếu cần, thêm **social/corporate IdP** vào User Pool.
4. Cấu hình các **URL redirect** cần thiết.
5. Cho phép domain của Cognito redirect về domain ALB: **callback URL** của app client dạng `https://<DNS-của-ALB>/oauth2/idpresponse` (hoặc custom domain của bạn).
6. Gắn User Pool + App client vào listener rule của ALB.

#### Luồng với OIDC IdP (không qua Cognito)

1. User gửi request HTTPS tới ALB.
2. ALB **redirect** user tới **Authorization endpoint** của IdP để xác thực.
3. IdP trả về **authorization code** (authorization grant) cho ALB.
4. ALB gửi code tới **Token endpoint** → đổi lấy **ID token + Access token**.
5. ALB gửi access token tới **User Info endpoint** → đổi lấy **user claims** (user ID, thuộc tính…).
6. ALB forward request gốc **kèm user claims** tới backend (ví dụ ECS) → trả response cho user.

**Cần cấu hình:** Issuer, **Authorization endpoint**, **Token endpoint**, **User info endpoint**, **Client ID**, **Client secret**, và **redirect** về `https://<DNS-của-ALB>/oauth2/idpresponse`.

### Kiến thức thực tế

- Sau khi xác thực, ALB thêm các **HTTP header** vào request gửi backend:
  - `x-amzn-oidc-accesstoken` – access token.
  - `x-amzn-oidc-identity` – user ID (`sub`).
  - `x-amzn-oidc-data` – **user claims** dạng JWT do **ALB ký (ES256)**. Backend nên **verify chữ ký** bằng public key của ALB (lấy theo `kid` từ `https://public-keys.auth.elb.<region>.amazonaws.com/<kid>`) và kiểm tra trường `signer` là ARN của ALB.
- ALB lưu phiên đăng nhập bằng **cookie** `AWSELBAuthSessionCookie` (mặc định session timeout 7 ngày, cấu hình được).
- App client dùng cho ALB **phải có client secret** và bật **Authorization code grant**.
- Backend **không nên public trực tiếp** – SG của target chỉ cho phép traffic từ SG của ALB, để không ai bypass bước xác thực.
- Cách này không áp dụng cho **Classic Load Balancer** hay **Network Load Balancer**.

### Ghi nhớ cho kỳ thi

- ALB xác thực user: **authenticate-cognito** (social/SAML/LDAP/AD qua CUP) hoặc **authenticate-oidc** (IdP OIDC trực tiếp).
- **Phải là HTTPS listener.**
- Chưa đăng nhập: **authenticate** (mặc định) / **deny** / **allow**.
- OIDC: authorization endpoint → **code** → token endpoint → **ID + access token** → user info endpoint → **claims** → backend.

---

## Bài 5 – Cognito Identity Pools

### Lý thuyết

- **Cognito Identity Pools** (còn gọi **Federated Identities**) – tên gây nhầm lẫn vì **khác hẳn** User Pools dù cùng "ô" Cognito.
- Bài toán: người dùng **ngoài AWS** (web/mobile) cần truy cập **trực tiếp** tài nguyên AWS như **DynamoDB table, S3 bucket** → cần **credentials AWS tạm thời**.
  - **Không tạo IAM user** cho họ: quá nhiều user, **không scale**, và ta **không tin tưởng** họ.
- Identity Pool cho phép user **đăng nhập qua bên thứ ba tin cậy**:
  - **Public providers:** Login with Amazon, Facebook, Google, Apple.
  - **Cognito User Pool**.
  - **OpenID Connect providers** và **SAML Identity Providers**.
  - **Developer Authenticated Identities** – máy chủ đăng nhập tuỳ chỉnh của bạn.
- Hỗ trợ **unauthenticated (guest) access** – định nghĩa policy riêng cho khách.
- Có credentials rồi, user gọi dịch vụ AWS **trực tiếp bằng SDK** hoặc qua **API Gateway**.
- Policy của credentials do **Identity Pool định nghĩa**, và có thể tuỳ biến theo **user_id** để kiểm soát chi tiết (fine-grained).

#### Luồng hoạt động

```
1. App ──login──▶ IdP (Cognito User Pool / Google / Facebook / SAML / OIDC) ──▶ token
2. App ──token──▶ Cognito Identity Pool
3. Identity Pool verify token với IdP
4. Identity Pool ──▶ STS: lấy credentials tạm thời
5. Credentials ──▶ App
6. App ──gọi trực tiếp──▶ S3 / DynamoDB (theo IAM policy của role)
```

#### Identity Pools + User Pools

- Dùng CUP làm nơi **tập trung toàn bộ user** (database nội bộ, và federation social/SAML/OIDC qua CUP – mọi user đều xuất hiện trong CUP).
- App đăng nhập CUP → nhận **JWT** → đổi JWT ở Identity Pool → Identity Pool verify → gọi **STS** → trả credentials → app truy cập AWS trực tiếp.

#### Gán IAM Role cho user

- Định nghĩa **IAM role mặc định** cho **authenticated users** và cho **guest users** (mỗi loại một role).
- Định nghĩa **rules** để chọn role cho từng user dựa trên **user ID / claims trong token**.
- Tuỳ biến policy bằng **policy variables** để user chỉ truy cập đúng phần của mình.
- Credentials lấy từ **STS** qua API **`AssumeRoleWithWebIdentity`** (video đọc nhầm thành "AssumeRoleForWebIdentity").
- Các role phải có **trust policy** cho phép **Cognito Identity Pools** (`cognito-identity.amazonaws.com`).

#### Ví dụ policy

**Guest user** – chỉ được đọc một object cụ thể:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject"],
    "Resource": ["arn:aws:s3:::mybucket/assets/my_picture.jpg"]
  }]
}
```

**Authenticated user** – chỉ truy cập prefix S3 mang **identity ID** của chính mình (policy variable):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": ["arn:aws:s3:::mybucket"],
      "Condition": { "StringLike": { "s3:prefix": ["${cognito-identity.amazonaws.com:sub}/*"] } }
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": ["arn:aws:s3:::mybucket/${cognito-identity.amazonaws.com:sub}/*"]
    }
  ]
}
```

**DynamoDB – row-level security** với `dynamodb:LeadingKeys` (partition key phải bằng identity ID của user):

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["dynamodb:GetItem", "dynamodb:BatchGetItem", "dynamodb:Query",
               "dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:DeleteItem",
               "dynamodb:BatchWriteItem"],
    "Resource": ["arn:aws:dynamodb:us-west-2:123456789012:table/MyTable"],
    "Condition": {
      "ForAllValues:StringEquals": {
        "dynamodb:LeadingKeys": ["${cognito-identity.amazonaws.com:sub}"]
      }
    }
  }]
}
```

### Kiến thức thực tế

- Phía ứng dụng (JavaScript SDK v3) – lấy credentials từ Identity Pool rồi gọi S3 trực tiếp:

  ```javascript
  import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
  import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

  const region = "ap-southeast-1";
  const s3 = new S3Client({
    region,
    credentials: fromCognitoIdentityPool({
      clientConfig: { region },
      identityPoolId: "ap-southeast-1:11111111-2222-3333-4444-555555555555",
      logins: {
        "cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_AbCdEf123": idToken,
      },
    }),
  });
  // identityId của user chính là giá trị ${cognito-identity.amazonaws.com:sub}
  await s3.send(new ListObjectsV2Command({ Bucket: "mybucket", Prefix: `${identityId}/` }));
  ```

  Với Amplify, `fetchAuthSession()` trả về cả `credentials` và `identityId` tự động.
- **Hai luồng xác thực của Identity Pool:**
  - **Enhanced (simplified) flow** – mặc định, khuyến nghị: `GetId` → `GetCredentialsForIdentity` (Cognito tự gọi STS).
  - **Basic (classic) flow**: `GetId` → `GetOpenIdToken` → app tự gọi **STS `AssumeRoleWithWebIdentity`**. Đây là tuỳ chọn *Basic authentication* trong console.
- **Lưu ý:** biến `${cognito-identity.amazonaws.com:sub}` là **Identity ID** của Identity Pool (dạng `region:uuid`), **khác** với `sub` của User Pool.
- **Attributes for access control (ABAC):** map claim của token thành **session tag** (`aws:PrincipalTag/...`), dùng trong policy – cần `sts:TagSession` trong trust policy.
- **Bảo mật guest access:** chỉ cấp quyền tối thiểu; credentials guest ai cũng lấy được (chỉ cần Identity Pool ID nằm trong app).
- Trust policy **luôn có điều kiện `aud` = Identity Pool ID** và `amr` – nếu thiếu, identity pool khác cũng có thể assume role của bạn.

### Ghi nhớ cho kỳ thi

- User ứng dụng cần **truy cập trực tiếp S3/DynamoDB** → **Cognito Identity Pools** (credentials tạm thời từ **STS**).
- Hỗ trợ **guest (unauthenticated)** users.
- Role mặc định cho authenticated và guest; chọn role theo **rules**; quyền chi tiết bằng **policy variables** `${cognito-identity.amazonaws.com:sub}`.
- DynamoDB row-level security → điều kiện **`dynamodb:LeadingKeys`**.
- Trust policy của role: principal **`cognito-identity.amazonaws.com`**, action **`sts:AssumeRoleWithWebIdentity`**.

---

## Bài 6 – So sánh Cognito User Pools và Cognito Identity Pools

### Lý thuyết

| | **Cognito User Pools** | **Cognito Identity Pools** |
|---|---|---|
| Mục đích | **Authentication** – xác minh danh tính | **Authorization** – kiểm soát truy cập **vào AWS** |
| Bản chất | **Database user** cho web/mobile app | Đổi token lấy **credentials AWS tạm thời** |
| Đăng nhập | Nội bộ + federation: social (Google, Facebook, Amazon), OIDC, SAML (corporate) | Token từ social, OIDC, SAML, developer authenticated **hoặc Cognito User Pools** |
| Guest (unauthenticated) | Không | **Có** |
| Tuỳ biến | Hosted UI/Managed Login (logo…), **Lambda triggers** trong luồng auth, **adaptive authentication** (MFA khi có rủi ro) | User được map vào **IAM roles & policies**, dùng **policy variables** |
| Kết quả trả về | **JWT** (ID, access, refresh token) | **AWS credentials** (Access Key, Secret Key, Session Token) |
| Dùng một mình? | Có (chỉ cần database user) | Có (với IdP khác), hoặc kết hợp CUP |

- Chỉ cần database user cho app mobile → **User Pools**.
- User cần vào **DynamoDB/S3** của bạn → cần **authorization** → **Identity Pools**.
- **Kết hợp = authentication (CUP) + authorization (CIP)** – best practice:

```
Web/Mobile app
   │ 1. Login → nhận token          (Cognito User Pools: database nội bộ + federation SAML/OIDC/Google/Facebook)
   │ 2. Đổi token lấy credentials   (Cognito Identity Pools ──▶ STS)
   │ 3. Gọi API AWS trực tiếp        (S3 bucket private, DynamoDB table – per-user security bằng IAM policy)
```

### Kiến thức thực tế

- **Cognito Sync (đã lỗi thời):** từng là tính năng của Identity Pools để **đồng bộ dữ liệu người dùng** (preferences, game state – dataset tối đa 1 MB, key-value) giữa các thiết bị, dùng push sync qua SNS. AWS hiện **khuyến nghị dùng AWS AppSync** (GraphQL, realtime subscriptions, offline sync với Amplify DataStore). Đề DVA-C02 không còn tập trung vào Cognito Sync; nếu gặp đáp án "Cognito Sync" cho bài toán xác thực/phân quyền thì đó là **đáp án nhiễu**.
- Mẫu kiến trúc phổ biến hiện nay:
  - **SPA/mobile → CUP → API Gateway (Cognito authorizer) → Lambda → DynamoDB**: không cần Identity Pool, quyền nằm ở Lambda role.
  - **SPA/mobile → CUP → Identity Pool → S3 trực tiếp** (upload ảnh, file): giảm tải backend, phân quyền theo prefix.
  - Upload S3 có thể thay bằng **pre-signed URL** do backend tạo nếu không muốn cấp credentials AWS cho client.
- **API Gateway có 2 cách dùng Cognito:** *Cognito User Pool authorizer* (gửi JWT) hoặc *IAM authorization* (client ký SigV4 bằng credentials từ Identity Pool).
- Với workforce (nhân viên nội bộ truy cập console/CLI AWS) → dùng **IAM Identity Center**, không phải Cognito.

### Ghi nhớ cho kỳ thi

- **User Pools = authentication (ai bạn là) → JWT.**
- **Identity Pools = authorization vào AWS (bạn được làm gì) → credentials tạm thời từ STS.**
- Login bằng mạng xã hội (Twitter, Facebook…) **và** truy cập trực tiếp dữ liệu riêng trên DynamoDB/S3 → **Identity Pools**.
- Guest access → chỉ **Identity Pools** có.

---

## Tổng kết chương

| Chủ đề | Điều cần nhớ |
|---|---|
| Cognito | Danh tính cho **người dùng web/mobile ngoài AWS** (không dùng IAM user) |
| User Pools | Database user serverless: sign-up/in, reset password, verify email/phone, MFA, federation (Google, Facebook, SAML, OIDC), chặn credentials bị lộ → trả **JWT** |
| Tích hợp CUP | **API Gateway** (Cognito authorizer) và **ALB** – không có Classic LB |
| Lambda triggers | Pre/Post Authentication, Pre Token Generation, Pre Sign-up, Post Confirmation, Migrate User, Custom Message (gọi đồng bộ) |
| Hosted UI / Managed Login | UI dựng sẵn; tuỳ biến logo, CSS, custom domain (không phải JavaScript); custom domain cần **ACM ở us-east-1** |
| Adaptive authentication | Risk score Low/Medium/High → chặn hoặc yêu cầu MFA; log ở CloudWatch Logs; nay thuộc *threat protection* (plan Plus) |
| JWT | Header.Payload.Signature (Base64); **verify signature**; `sub` = user ID |
| ALB auth | HTTPS listener; `authenticate-cognito` hoặc `authenticate-oidc`; unauthenticated: authenticate/deny/allow |
| Identity Pools | Đổi token lấy **credentials tạm thời** qua **STS AssumeRoleWithWebIdentity**; hỗ trợ **guest**; role authenticated/guest; rules; policy variables |
| Policy variables | `${cognito-identity.amazonaws.com:sub}` cho prefix S3; `dynamodb:LeadingKeys` cho row-level security |
| CUP vs CIP | CUP = **authentication**; CIP = **authorization** vào AWS; kết hợp là best practice |
| Cập nhật 2026 | Hosted UI → **Managed Login**; feature plans Lite/Essentials/Plus; advanced security → threat protection; **Cognito Sync → AppSync** |

---

## Câu hỏi ôn tập

*Nguồn: Cognito Quiz. Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Bạn có ứng dụng chia sẻ ảnh và muốn người dùng đăng nhập bằng Twitter. Người dùng cũng cần quyền **truy cập trực tiếp** dữ liệu của chính họ trong bảng DynamoDB `Users` và ảnh của chính họ trong một S3 bucket chứa ảnh của mọi người dùng. Bạn có thể dùng gì?

- A. Cognito User Pools
- B. Cognito Identity Pools
- C. Cognito Sync
- D. IAM Roles

<details><summary>Đáp án</summary>

**B. Cognito Identity Pools.** Identity Pools cho phép đăng nhập qua IdP bên thứ ba (Twitter, Facebook, Google…) rồi cấp **credentials AWS tạm thời** để truy cập trực tiếp DynamoDB/S3; kết hợp **policy variables** (`${cognito-identity.amazonaws.com:sub}`, `dynamodb:LeadingKeys`) để mỗi user chỉ truy cập dữ liệu của mình. User Pools (A) chỉ xác thực và trả JWT, không cấp quyền truy cập AWS. Cognito Sync (C) dùng đồng bộ dữ liệu, đã lỗi thời. IAM Roles (D) là thành phần bên dưới nhưng tự nó không xử lý đăng nhập Twitter.
</details>

**Câu 2.** Bạn muốn xác thực người dùng bằng Facebook trước khi họ gửi request tới API trên API Gateway. Nên dùng gì để tích hợp xác thực liền mạch?

- A. Cognito Sync
- B. DynamoDB Table với Lambda Authorizer
- C. Cognito User Pools
- D. Cognito Federated Identity Pools

<details><summary>Đáp án</summary>

**C. Cognito User Pools.** CUP hỗ trợ federation với Facebook và tích hợp **native** với API Gateway qua **Cognito User Pool authorizer**: user đăng nhập → nhận JWT → gửi JWT lên API Gateway để kiểm tra. B tự xây được nhưng không "liền mạch". D (Identity Pools) cấp credentials AWS, dùng cho việc truy cập trực tiếp dịch vụ AWS chứ không phải cách tích hợp xác thực tiêu chuẩn cho API Gateway. A không liên quan.
</details>

**Câu 3.** Ứng dụng dùng Cognito User Pools để xác thực người dùng. Có yêu cầu ghi lại **mọi lần đăng nhập thành công** vào một RDS DB instance để phân tích hoạt động sau này. Bạn nên làm gì?

- A. Bật tích hợp Cognito & RDS
- B. Viết hook **Pre-Authentication** bằng Lambda
- C. Viết hook **Post-Authentication** bằng Lambda

<details><summary>Đáp án</summary>

**C. Post-Authentication Lambda trigger.** Trigger này chạy **sau khi đăng nhập thành công** – đúng chỗ để ghi log vào RDS. Pre-Authentication (B) chạy **trước** khi xác thực, chưa biết đăng nhập có thành công hay không (dùng để chấp nhận/từ chối). Tích hợp "Cognito & RDS" (A) **không tồn tại**.
</details>

**Câu 4.** Bạn có thể tuỳ biến những thứ sau trong Cognito Hosted UI, NGOẠI TRỪ ...

- A. CSS
- B. Logo
- C. JavaScript bên dưới
- D. URL

<details><summary>Đáp án</summary>

**C. JavaScript bên dưới.** Hosted UI cho phép tuỳ biến **logo**, **CSS** và **URL** (custom domain, cần ACM certificate ở us-east-1), nhưng không cho sửa JavaScript. (Hiện nay Hosted UI được thay bằng **Managed Login** với trình chỉnh branding mạnh hơn, nhưng vẫn không chèn được JavaScript tuỳ ý.)
</details>

**Câu 5.** Sau khi đăng nhập thành công bằng Cognito User Pools, nó gửi về ...

- A. JSON Web Token (JWT)
- B. SAML Token
- C. Username và Password

<details><summary>Đáp án</summary>

**A. JSON Web Token (JWT).** CUP trả về ID token, access token (đều là JWT) và refresh token. SAML (B) chỉ là giao thức federation với IdP doanh nghiệp, không phải thứ CUP trả cho app. C sai – không bao giờ trả lại mật khẩu.
</details>

**Câu 6.** Cognito User Pools tích hợp với các dịch vụ AWS sau để xác thực request, NGOẠI TRỪ ...

- A. API Gateway
- B. Classic Load Balancer
- C. Application Load Balancer

<details><summary>Đáp án</summary>

**B. Classic Load Balancer.** CUP tích hợp native với **API Gateway** (Cognito authorizer) và **Application Load Balancer** (action `authenticate-cognito` trên HTTPS listener). Classic Load Balancer không hỗ trợ xác thực người dùng.
</details>

---

[← Chương 26](ch26-cloud-development-kit-cdk.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Chương 28 →](ch28-other-serverless-step-functions-appsyn.md)
