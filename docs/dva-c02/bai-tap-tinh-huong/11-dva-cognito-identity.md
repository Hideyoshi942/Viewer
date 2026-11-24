# Bài tập tình huống — Chủ đề 11: Xác thực ứng dụng — Amazon Cognito & Advanced Identity

> Cognito User Pools vs Identity Pools, OAuth 2.0 / OIDC / JWT, Federation với SAML & STS Web Identity.
> **Số câu hỏi:** 18 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án & Giải thích chi tiết**.

---

### Câu 1 `hard`

A SaaS provider exposes a REST API through Amazon API Gateway. External partner applications authenticate using a custom Lambda Authorizer (`TOKEN` type) that validates JWTs against an external identity provider. During load testing, the Lambda Authorizer becomes a bottleneck because it is invoked on every single API request, even when the same partner sends 500 requests per second with the same JWT. How can the developer reduce invocations of the Lambda Authorizer without changing the authentication flow?

- **A.** Switch the Amazon API Gateway REST API endpoint type from Regional to Edge-optimized to offload Lambda Authorizer calls to CloudFront.
- **B.** Enable Authorization Caching on the Lambda Authorizer and set a non-zero `AuthorizerResultTtlInSeconds`.
- **C.** Enable Amazon API Gateway Stage Caching with a TTL of 300 seconds and encrypt cached responses using AWS KMS.
- **D.** Replace the `Authorization` header with an API Gateway API Key and Usage Plan for user authentication.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

**API Gateway Lambda Authorizer Caching**:
- Khi bật caching (`AuthorizerResultTtlInSeconds > 0`), API Gateway cache IAM Policy trả về dựa trên Identity Source (ví dụ header `Authorization`).
- Lưu ý bẫy thi: Nếu 1 user gọi nhiều route khác nhau dùng chung 1 token, IAM Policy trả về từ Authorizer nên cấp quyền cho `arn:aws:execute-api:region:account:api-id/stage/*/*` (hoặc tất cả resource cần thiết) để tránh bị `403 Forbidden` khi cache hit ở route khác.

- **A:** Sai vì Edge-optimized chỉ đặt CloudFront ở phía trước API Gateway, không cache kết quả xác thực của Lambda Authorizer.
- **B (Đúng):** Đúng! Bật Authorization Caching (mặc định TTL 300 giây, tối đa 3600 giây) giúp API Gateway lưu cache IAM policy trả về từ Lambda Authorizer theo key là token (với TOKEN authorizer), giảm đáng kể số lần gọi Lambda.
- **C:** Sai vì Stage Caching cache response của backend integration (GET/method response), không phải cache riêng cho kết quả IAM policy của Lambda Authorizer.
- **D:** Sai vì API Keys dùng để định danh ứng dụng và giới hạn throttling/quota (Usage Plan), KHÔNG dùng để xác thực người dùng/JWT.

</details>

### Câu 2 `medium`

A web application uses Amazon Cognito User Pools for user authentication. After a user signs in, the backend API needs the user's `tenant_id` and `subscription_tier` (stored in an external Amazon DynamoDB table) to be included inside the JWT ID token issued by Cognito. Which Cognito feature allows the developer to inject these dynamic claims into the token before it is issued?

- **A.** Configure a Cognito Pre Sign-up Lambda Trigger to query DynamoDB and inject `tenant_id` into every future JWT token.
- **B.** Use a Cognito Identity Pool (Federated Identities) to issue JWT ID tokens populated with custom DynamoDB claims.
- **C.** Configure a Cognito Pre Token Generation Lambda Trigger to fetch the attributes from DynamoDB and add them to `claimsToAddOrOverride`.
- **D.** Use a Cognito Post Confirmation Lambda Trigger to query DynamoDB and modify the issued JWT ID token.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Các **Cognito User Pool Lambda Triggers** thường gặp trong đề thi:
- **Pre Sign-up**: Kiểm tra domain email, auto-confirm user.
- **Post Confirmation**: Gửi welcome email, tạo record trong DB sau khi đăng ký xong.
- **Pre Token Generation**: Thêm/sửa/xóa custom claims trong JWT token (hỗ trợ cả V2 để tùy biến Access Token).
- **Custom Message**: Tùy biến nội dung email/SMS OTP.

- **A:** Sai vì Pre Sign-up Trigger chỉ chạy lúc đăng ký để kiểm tra/chặn hoặc auto-confirm user mới, không can thiệp vào JWT lúc đăng nhập.
- **B:** Sai vì Identity Pool dùng để đổi token lấy AWS IAM Temporary Credentials (STS), không dùng để phát hành/tùy biến JWT ID token của User Pool.
- **C (Đúng):** Đúng! Cognito **Pre Token Generation Lambda Trigger** chạy ngay trước khi Cognito phát hành JWT token, cho phép đọc dữ liệu từ nguồn ngoài (như DynamoDB) và thêm/ghi đè claims (`claimsToAddOrOverride`) hoặc xóa claims trong token.
- **D:** Sai vì Post Confirmation Trigger chỉ chạy một lần duy nhất ngay sau khi người dùng xác nhận đăng ký tài khoản (ví dụ để gửi email chào mừng hoặc ghi DB), không chạy mỗi lần đăng nhập để sửa JWT.

</details>

### Câu 3 `medium` *(Chọn nhiều đáp án)*

A company hosts a REST API on Amazon API Gateway. The API must only accept requests from authenticated mobile app users (who log in via Amazon Cognito User Pools) AND must block all traffic except from a specific corporate VPN IP range (`203.0.113.0/24`). Which TWO configurations should the developer implement? (Choose two.)

- **A.** Use an API Gateway Usage Plan with an API Key to restrict client access by source IP CIDR block `203.0.113.0/24`.
- **B.** Configure an EC2 Security Group directly on the API Gateway Regional endpoint to restrict inbound CIDR traffic.
- **C.** Attach an API Gateway Resource Policy with an Explicit `Deny` for `NotIpAddress` outside `203.0.113.0/24`.
- **D.** Disable TLS 1.2 on the API Gateway custom domain.
- **E.** Attach a Cognito User Pool Authorizer to the API Gateway methods.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**, **E**

Các lớp bảo mật của **Amazon API Gateway**:
- **Xác thực người dùng**: Cognito User Pool Authorizer (JWT), Lambda Authorizer, hoặc IAM SigV4.
- **Chặn/cho phép IP hoặc VPC**: **API Gateway Resource Policy** (hoặc **AWS WAF**).

- **A:** Sai vì Usage Plan chỉ giới hạn rate/burst/quota theo API Key, không lọc theo IP.
- **B:** Sai vì API Gateway là dịch vụ managed không gắn trực tiếp Security Group (trừ VPC Link tới backend hoặc Private API dùng VPC Endpoint Security Group).
- **C (Đúng):** Đúng! API Gateway Resource Policy hỗ trợ lọc địa chỉ IP nguồn (`aws:SourceIp`) với `Deny` / `NotIpAddress` để chỉ cho phép dải IP VPN của công ty.
- **D:** Sai vì tắt TLS 1.2 làm giảm bảo mật chứ không xác thực user hay lọc IP.
- **E (Đúng):** Đúng! Cognito User Pool Authorizer tự động xác thực JWT token do Cognito cấp cho người dùng mobile app trước khi cho phép gọi backend.

</details>

### Câu 4 `medium`

A developer is building an application where thousands of authenticated Amazon Cognito users store personal profile items in a single Amazon DynamoDB table (`UserProfiles`). The partition key is `userId` (set to the Cognito Identity ID). Using a single shared IAM role for all authenticated users, how can the developer ensure each user can ONLY read and write their own DynamoDB item?

- **A.** Add a `Condition` using `ForAllValues:StringEquals` on `dynamodb:LeadingKeys` equal to `${cognito-identity.amazonaws.com:sub}`.
- **B.** Create a separate IAM User and inline IAM Policy for each Cognito user using the `cognito-identity.amazonaws.com:sub` identifier.
- **C.** Create a separate DynamoDB table for every registered Cognito user and grant table-level IAM permissions per user.
- **D.** Use the `dynamodb:Select` condition key with `SPECIFIC_ATTRIBUTES` to restrict item access to the authenticated user.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

**DynamoDB Fine-Grained Access Control** với IAM Policy Variables:
- **`dynamodb:LeadingKeys`**: Giới hạn quyền truy cập theo giá trị **Partition Key** (dùng `${cognito-identity.amazonaws.com:sub}` cho Cognito hoặc `${aws:username}` cho IAM user).
- **`dynamodb:Attributes`**: Giới hạn chỉ được đọc/ghi một số cột (attributes) cụ thể.

- **A (Đúng):** Đúng! Fine-grained access control trong DynamoDB sử dụng `dynamodb:LeadingKeys` kết hợp biến chính sách IAM `${cognito-identity.amazonaws.com:sub}` cho phép 1 IAM Role duy nhất giới hạn mỗi user chỉ truy cập đúng Partition Key trùng với Cognito Identity ID của mình.
- **B:** Sai vì Cognito Identity Pool sinh temporary STS credentials cho hàng nghìn/triệu người dùng mà không cần tạo IAM User (IAM User giới hạn 5,000/account).
- **C:** Sai vì tạo hàng nghìn bảng DynamoDB riêng lẻ vi phạm thiết kế, chạm giới hạn số bảng mỗi account và tốn chi phí quản lý.
- **D:** Sai vì `dynamodb:Select` chỉ kiểm soát việc trả về tất cả thuộc tính hay một số thuộc tính, không giới hạn theo Partition Key của từng user.

</details>

### Câu 5 `medium`

A startup is building a new serverless backend with Amazon API Gateway and AWS Lambda. The API only needs JWT-based authorization with Amazon Cognito, CORS support, and simple Lambda proxy integrations, with no need for API Keys, Usage Plans, request/response VTL mapping templates, or edge caching. Which API Gateway type offers the LOWEST cost and latency?

- **A.** Private REST API
- **B.** HTTP API
- **C.** WebSocket API
- **D.** Edge-optimized REST API

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Chọn loại **Amazon API Gateway** đúng nhu cầu:
- **HTTP API**: Rẻ nhất (~70% rẻ hơn REST API), độ trễ thấp nhất, có JWT Authorizer & CORS.
- **REST API**: Đầy đủ tính năng doanh nghiệp (API Keys/Usage Plans, VTL Mapping Templates, Stage Caching, WAF tích hợp trực tiếp, Private API).
- **WebSocket API**: Kết nối hai chiều thời gian thực (`$connect`, `$disconnect`, `$default`).

- **A:** Sai vì Private REST API chỉ truy cập được từ bên trong VPC qua Interface VPC Endpoint.
- **B (Đúng):** Đúng! **HTTP API** của API Gateway rẻ hơn tới ~70% và có độ trễ thấp hơn REST API, hỗ trợ sẵn JWT Authorizer (OIDC/OAuth 2.0 như Cognito), CORS, và Lambda/HTTP proxy integration.
- **C:** Sai vì WebSocket API dùng cho giao tiếp hai chiều persistent (chat, real-time dashboard), không phù hợp cho API REST/HTTP thông thường.
- **D:** Sai vì REST API đắt hơn nhiều và chỉ cần thiết khi bạn dùng Usage Plans/API Keys, VTL Mapping Templates, Request Validation, hoặc API Gateway Stage Caching.

</details>

### Câu 6 `medium`

A mobile application allows users to sign up and sign in with email and password using Amazon Cognito. After signing in, the mobile app needs to upload photos directly from the device to a private Amazon S3 bucket without routing the traffic through a backend server. How should the developer configure Amazon Cognito?

- **A.** Configure the Amazon Cognito User Pool directly to issue temporary AWS STS `AccessKeyId` and `SecretAccessKey` credentials for Amazon S3 uploads.
- **B.** Use a Cognito Identity Pool alone without any authentication provider for user sign-up and password reset.
- **C.** Embed a long-term IAM User Access Key and Secret Access Key inside the mobile app binary for direct Amazon S3 uploads.
- **D.** Authenticate with a Cognito User Pool, then exchange the JWT token with a Cognito Identity Pool for temporary STS credentials with S3 permissions.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Phân biệt cốt lõi **Cognito User Pool vs Identity Pool**:
- **User Pool**: Thư mục người dùng (**Authentication** — đăng ký, đăng nhập, MFA, cấp JWT).
- **Identity Pool**: Cấp quyền truy cập dịch vụ AWS (**Authorization** — đổi JWT của User Pool/Google/Apple lấy **AWS STS Temporary Credentials**).

- **A:** Sai vì Cognito User Pool chỉ cấp OIDC/OAuth2 JWT tokens (ID, Access, Refresh tokens), không cấp AWS IAM/STS credentials.
- **B:** Sai vì Identity Pool không lưu danh bạ user/mật khẩu hay hỗ trợ đăng ký/quên mật khẩu; vai trò đó thuộc về User Pool.
- **C:** Sai vì nhúng Access Key dài hạn vào mobile app rất dễ bị dịch ngược và đánh cắp.
- **D (Đúng):** Đúng! **Cognito User Pool** quản lý đăng ký/đăng nhập và cấp JWT token; **Cognito Identity Pool** (Federated Identities) đổi JWT token đó lấy **Temporary AWS Credentials (STS)** gắn với IAM Role cho phép mobile app gọi thẳng `s3:PutObject`.

</details>

### Câu 7 `medium`

A company uses Amazon Cognito User Pools and wants to implement a passwordless login flow where users enter their email address, receive a custom 6-digit one-time code via a third-party email provider, and submit the code to authenticate. Which Cognito User Pool Lambda Triggers must be implemented to build this custom authentication flow?

- **A.** `PreSignUp`, `PostConfirmation`, `PostAuthentication`, and `TokenGeneration` triggers
- **B.** `DefineAuthChallenge`, `CreateAuthChallenge`, and `VerifyAuthChallengeResponse`
- **C.** `CustomMessage` only
- **D.** `PreTokenGeneration` and `UserMigration`

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

**Cognito Custom Authentication Flow** gồm 3 Lambda triggers:
1. **`DefineAuthChallenge`**: Xác định bước tiếp theo (cấp challenge hay phát hành token).
2. **`CreateAuthChallenge`**: Sinh OTP/CAPTCHA và gửi qua kênh ngoài.
3. **`VerifyAuthChallengeResponse`**: Kiểm tra câu trả lời của người dùng.

- **A:** Sai vì các trigger này phục vụ vòng đời đăng ký và ghi nhận sau đăng nhập, không tạo/xác minh thử thách đăng nhập tùy chỉnh.
- **B (Đúng):** Đúng! Bộ 3 Lambda Triggers cho **Custom Authentication Flow** trong Cognito User Pool là: `DefineAuthChallenge` (điều phối chuỗi thử thách), `CreateAuthChallenge` (tạo và gửi OTP), và `VerifyAuthChallengeResponse` (kiểm tra mã người dùng nhập).
- **C:** Sai vì `CustomMessage` chỉ tùy biến nội dung text/HTML của email/SMS mặc định từ Cognito, không tự tạo luồng đăng nhập không mật khẩu qua nhà cung cấp thứ ba.
- **D:** Sai vì `PreTokenGeneration` chỉ sửa claims trong JWT, còn `UserMigration` dùng để di chuyển user từ hệ thống cũ sang Cognito.

</details>

### Câu 8 `medium`

A company stores all user accounts in an Amazon Cognito User Pool. The mobile app allows users to sign in with username/password, and also supports "Sign in with Google" and "Sign in with Apple". After authentication, how does the application verify the user's identity on a custom REST API backend?

- **A.** The backend calls `sts:GetCallerIdentity` using the user's email address to validate the Cognito session.
- **B.** The client sends the Cognito JWT ID/Access Token in `Authorization`, and the backend verifies its signature via Cognito's JWKS.
- **C.** The client sends the user's plaintext Google OAuth password to the backend API over HTTPS on every call.
- **D.** The client sends the long-lived Cognito Refresh Token in the `Authorization` header on every backend API request for signature validation.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

3 loại Token của **Cognito User Pool**:
- **ID Token (JWT)**: Chứa thông tin định danh user (`sub`, `email`, `cognito:groups`, custom attributes).
- **Access Token (JWT)**: Chứa `scope` và `client_id` dùng để ủy quyền gọi API.
- **Refresh Token**: Dùng để lấy lại ID/Access Token mới (thời hạn mặc định 30 ngày).

- **A:** Sai vì `sts:GetCallerIdentity` chỉ kiểm tra IAM credentials hiện tại chứ không xác thực JWT của Cognito User Pool.
- **B (Đúng):** Đúng! Khi tích hợp Google/Apple qua **Cognito User Pool (Federated Sign-In)**, Cognito chuẩn hóa và cấp ra các **JWT Tokens (ID, Access, Refresh)** đã ký bằng khóa riêng của Cognito; API Gateway/Backend chỉ cần kiểm tra chữ ký JWT bằng public JWKS của User Pool.
- **C:** Sai vì OAuth/OIDC không bao giờ chia sẻ mật khẩu Google của người dùng cho ứng dụng bên thứ ba.
- **D:** Sai vì Refresh Token chỉ dùng để xin cấp lại Access/ID Token mới khi hết hạn, không gửi kèm mỗi request API.

</details>

### Câu 9 `medium`

A developer uses Amazon Cognito Identity Pools to grant authenticated users temporary AWS credentials to upload files to an Amazon S3 bucket (`user-uploads`). Each user must ONLY be able to read and write objects under their own folder `s3://user-uploads/${cognito-identity.amazonaws.com:sub}/*`. Where should this IAM policy be attached?

- **A.** Attach the IAM Role directly to the Amazon S3 bucket's CORS configuration for authenticated mobile uploads.
- **B.** Attach it to the Cognito User Pool's Pre Sign-up Lambda execution role with a `${aws:username}` condition.
- **C.** Create one dedicated AWS IAM User and inline S3 policy per Cognito user in AWS IAM.
- **D.** Attach it to the Authenticated IAM Role configured in the Cognito Identity Pool, using the `${cognito-identity.amazonaws.com:sub}` policy variable.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Phân quyền **S3 theo từng user với Cognito Identity Pool**:
- Gắn vào **Authenticated Role** của Identity Pool.
- Dùng Resource: `arn:aws:s3:::user-uploads/${cognito-identity.amazonaws.com:sub}/*`.

- **A:** Sai vì cấu hình CORS không chứa IAM Role.
- **B:** Sai vì Execution Role của Pre Sign-up Lambda chỉ cấp quyền cho hàm Lambda đó chạy lúc đăng ký, không cấp quyền S3 cho mobile app.
- **C:** Sai vì Identity Pool dùng STS temporary credentials cho hàng triệu user mà không tạo IAM User.
- **D (Đúng):** Đúng! Cognito **Identity Pool** gán một **Authenticated IAM Role** cho người dùng đã đăng nhập; dùng biến chính sách `${cognito-identity.amazonaws.com:sub}` trong Resource ARN giúp cô lập thư mục S3 riêng cho từng user.

</details>

### Câu 10 `medium`

A web application uses Amazon API Gateway REST API with **IAM Authorization** (`AWS_IAM`). An external user authenticates via Amazon Cognito Identity Pool and receives temporary STS credentials (`AccessKeyId`, `SecretAccessKey`, `SessionToken`). What must the client application do when sending HTTP requests to the IAM-protected API Gateway endpoint?

- **A.** Send the Cognito User Pool JWT directly in the `x-api-key` header for IAM-authorized API Gateway methods.
- **B.** Sign each HTTP request using AWS Signature Version 4 (SigV4) with the temporary STS credentials (including the `X-Amz-Security-Token` header).
- **C.** Use HTTP Basic Authentication with the IAM Role ARN as the username and the STS SessionToken as password.
- **D.** Pass the temporary STS `SecretAccessKey` in plaintext inside the URL query string of every API request.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

So sánh các cơ chế xác thực trên **API Gateway**:
- **`AWS_IAM`**: Dùng **SigV4** (ký request bằng IAM/STS credentials); cấp quyền qua `execute-api:Invoke`.
- **`COGNITO_USER_POOLS`**: Truyền JWT trong `Authorization` header.
- **`Lambda Authorizer` (`TOKEN`/`REQUEST`)**: Kiểm tra custom token/headers bằng hàm Lambda.

- **A:** Sai vì `x-api-key` chỉ dùng cho Usage Plans, còn `AWS_IAM` authorizer yêu cầu chữ ký SigV4.
- **B (Đúng):** Đúng! API Gateway bật `AWS_IAM` authorization yêu cầu mọi HTTP request phải được ký bằng **AWS Signature Version 4 (SigV4)** sử dụng STS credentials (gửi kèm `Authorization` signature và `X-Amz-Security-Token`).
- **C:** Sai vì API Gateway không dùng HTTP Basic Auth cho `AWS_IAM`.
- **D:** Sai và cực kỳ mất an toàn; `SecretAccessKey` chỉ dùng để tính toán chữ ký SigV4 ở phía client, không bao giờ gửi qua mạng.

</details>

### Câu 11 `medium`

An application uses Amazon Cognito User Pools and needs to securely store user passwords and allow users to sign in with an email address instead of a separate username. Additionally, users should be able to recover forgotten passwords via an SMS or email verification code, and compromised passwords must be blocked automatically. Which Cognito User Pool feature detects and blocks compromised passwords?

- **A.** Enable Cognito Advanced Security Features (Compromised Credentials Detection and Adaptive Authentication).
- **B.** Store user passwords in Amazon DynamoDB in plaintext and validate compromised credentials in a Pre Authentication Lambda trigger.
- **C.** Enable Cognito Identity Pool Unauthenticated Access so brute-force login attempts are routed to guest roles.
- **D.** Configure a Cognito User Pool App Client without a client secret to enforce adaptive risk-based MFA.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

**Cognito User Pool Security**:
- **Advanced Security**: Compromised Credentials + Adaptive Authentication (risk-based MFA).
- **Sign-in aliases**: Cho phép đăng nhập bằng `email` hoặc `phone_number` (cấu hình lúc tạo User Pool).

- **A (Đúng):** Đúng! **Cognito Advanced Security** cung cấp **Compromised Credentials Detection** (tự động phát hiện mật khẩu bị lộ trong các vụ rò rỉ dữ liệu công khai và bắt buộc đổi) cùng **Adaptive Authentication** (đánh giá rủi ro đăng nhập bất thường để yêu cầu MFA).
- **B:** Sai và vi phạm bảo mật nghiêm trọng.
- **C:** Sai vì Unauthenticated Access cho phép khách vãng lai lấy STS credentials tạm thời, không liên quan đến kiểm tra mật khẩu bị lộ.
- **D:** Sai vì App Client secret chỉ dùng để xác thực ứng dụng backend (confidential client), không phát hiện mật khẩu bị rò rỉ.

</details>

### Câu 12 `medium`

A mobile app uses Amazon Cognito User Pools and receives an ID token, Access token, and Refresh token upon login. When the Access token expires after 1 hour, how should the mobile app obtain a new Access token without prompting the user to re-enter their username and password?

- **A.** Call Cognito `InitiateAuth` with `AuthFlow: "REFRESH_TOKEN_AUTH"` (passing the `REFRESH_TOKEN`) to obtain fresh ID and Access tokens.
- **B.** Call `sts:AssumeRoleWithWebIdentity` to renew the Cognito User Pool Access and ID tokens automatically.
- **C.** Cache the user's plaintext password in `localStorage` and re-submit it every hour.
- **D.** Set the Access Token validity to 10 years in the Cognito App Client configuration so token renewal is completely unnecessary for users.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Thời hạn Token trong **Cognito User Pool**:
- **Access / ID Token**: 5 phút – **24 giờ** (mặc định 1 giờ).
- **Refresh Token**: 60 phút – **10 năm** (mặc định 30 ngày), dùng với `REFRESH_TOKEN_AUTH`.

- **A (Đúng):** Đúng! Dùng **Refresh Token** gọi `InitiateAuth` (`REFRESH_TOKEN_AUTH`) để đổi lấy ID Token và Access Token mới một cách âm thầm mà không bắt người dùng đăng nhập lại.
- **B:** Sai vì `AssumeRoleWithWebIdentity` cấp AWS STS temporary credentials, không cấp lại Cognito JWT Access Token.
- **C:** Sai vì lưu mật khẩu plaintext ở client là lỗ hổng bảo mật nghiêm trọng.
- **D:** Sai vì Access Token của Cognito có thời hạn tối đa chỉ **24 giờ** (không thể đặt 10 năm).

</details>

### Câu 13 `medium`

A company hosts a REST API on Amazon API Gateway with a custom domain (`api.example.com`). Security requirements mandate that API clients authenticate using **Mutual TLS (mTLS)** in addition to a Cognito JWT token, so only devices possessing a client certificate signed by the company's internal Certificate Authority (CA) can establish a TLS connection. How should the developer configure mTLS on API Gateway?

- **A.** Upload the CA truststore PEM bundle to an S3 bucket and enable Mutual TLS on the API Gateway Regional Custom Domain.
- **B.** Store the CA truststore PEM bundle inside AWS Secrets Manager and attach it to an Edge-optimized API Gateway endpoint.
- **C.** Enable AWS WAF Rate-based rules on the API Gateway stage to verify and authenticate X.509 client certificates.
- **D.** Validate the client X.509 certificate inside a Lambda Authorizer without configuring Mutual TLS on the API Gateway custom domain.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

**API Gateway Mutual TLS (mTLS)**:
- Chỉ hỗ trợ **Regional Custom Domain Names** (REST API & HTTP API).
- Truststore (`.pem`) lưu trên **Amazon S3** (khuyến nghị bật S3 Versioning).
- Thông tin chứng chỉ client được truyền vào `$context.identity.clientCert.*` cho Lambda/Authorizer.

- **A (Đúng):** Đúng! API Gateway hỗ trợ **Mutual TLS (mTLS)** trên **Regional Custom Domain Name** (hỗ trợ cả REST API và HTTP API) bằng cách upload file PEM truststore lên **Amazon S3** (nên bật S3 Versioning) và trỏ `TruststoreUri` tới S3.
- **B:** Sai vì mTLS của API Gateway chỉ hỗ trợ **Regional** Custom Domain Name (không hỗ trợ Edge-optimized) và đọc truststore từ **Amazon S3**, không phải Secrets Manager.
- **C:** Sai vì AWS WAF rate-based rule đếm số request theo IP, không xác thực chuỗi chứng chỉ mTLS X.509.
- **D:** Sai vì bắt tay mTLS diễn ra ở tầng TLS handshake trước khi vào Lambda Authorizer; nếu không bật mTLS trên Custom Domain, API Gateway sẽ không yêu cầu client certificate.

</details>

### Câu 14 `medium`

A company wants to allow corporate employees to log into an internal AWS-hosted developer portal using their existing Active Directory / Okta credentials (SAML 2.0) and receive temporary AWS console/API access without creating individual IAM Users in AWS. Which AWS IAM / STS integration supports SAML 2.0 federation?

- **A.** Use `sts:AssumeRoleWithWebIdentity` with SAML 2.0 XML assertions signed by the corporate Active Directory.
- **B.** Use `sts:GetFederationToken` with an IAM User's root password to issue temporary developer credentials.
- **C.** Create dedicated IAM Users for every employee in AWS IAM and synchronize their corporate Active Directory passwords manually each month.
- **D.** Create an IAM SAML 2.0 Identity Provider, configure a trusting IAM Role, and use `sts:AssumeRoleWithSAML` (or IAM Identity Center).

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Phân biệt các API **AWS STS**:
- **`AssumeRole`**: Chuyển đổi sang IAM Role (cùng account hoặc cross-account).
- **`AssumeRoleWithSAML`**: Đăng nhập liên kết **SAML 2.0** (Okta, ADFS).
- **`AssumeRoleWithWebIdentity`**: Đăng nhập liên kết **OIDC** (Google, Apple, Cognito, GitHub Actions OIDC).
- **`GetSessionToken`**: Lấy token tạm thời kèm **MFA** cho IAM User.

- **A:** Sai vì `AssumeRoleWithWebIdentity` dành cho **OIDC / OAuth 2.0** (Google, Facebook, Cognito, GitHub Actions), còn SAML 2.0 dùng `AssumeRoleWithSAML`.
- **B:** Sai vì `GetFederationToken` dùng cho custom identity broker chứ không phải luồng chuẩn SAML 2.0.
- **C:** Sai vì đề bài yêu cầu không tạo IAM Users riêng lẻ.
- **D (Đúng):** Đúng! AWS hỗ trợ đăng nhập liên kết SAML 2.0 từ Okta/AD thông qua **IAM SAML 2.0 Identity Provider + `sts:AssumeRoleWithSAML`** (hoặc dùng **AWS IAM Identity Center** làm trung tâm quản lý SSO hiện đại cho nhiều AWS accounts).

</details>

### Câu 15 `medium`

A GitHub Actions workflow needs to deploy an AWS SAM application into an AWS account without storing long-lived `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` secrets in GitHub. What is the AWS-recommended way to authenticate GitHub Actions?

- **A.** Run `aws sts get-session-token` inside the GitHub Actions workflow without providing any IAM credentials.
- **B.** Configure an IAM OIDC Identity Provider for `token.actions.githubusercontent.com` and assume an IAM Role via `sts:AssumeRoleWithWebIdentity`.
- **C.** Store an IAM `AdministratorAccess` Access Key in a public Amazon S3 bucket for GitHub Actions runners to download.
- **D.** Hardcode the AWS account Root User credentials inside `.github/workflows/deploy.yml` as workflow environment variables for CI/CD deployment to AWS.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Best practice **CI/CD Authentication (GitHub Actions -> AWS)**:
- Dùng **OIDC Federation (`AssumeRoleWithWebIdentity`)** + `aws-actions/configure-aws-credentials`.
- Khóa điều kiện `StringLike` trên `token.actions.githubusercontent.com:sub` (ví dụ `repo:org/repo:ref:refs/heads/main`).

- **A:** Sai vì `get-session-token` yêu cầu phải có IAM User credentials sẵn từ trước.
- **B (Đúng):** Đúng! Kết nối **GitHub Actions OIDC** với **IAM OIDC Identity Provider** cho phép workflow gọi `sts:AssumeRoleWithWebIdentity` lấy temporary credentials ngay lúc chạy (và giới hạn theo `sub` repo/branch cụ thể) mà **không cần lưu Access Key dài hạn**.
- **C:** Sai vì lộ Access Key lên S3 public sẽ dẫn đến mất tài khoản AWS ngay lập tức.
- **D:** Sai và cực kỳ nguy hiểm.

</details>

### Câu 16 `medium`

An Amazon Cognito User Pool has users organized into two Cognito Groups: `Admins` (precedence 1) and `Editors` (precedence 10). Each group is associated with a different IAM Role in a Cognito Identity Pool (`Choose role from token`). If a user belongs to BOTH `Admins` and `Editors`, how does Cognito decide which IAM Role is assigned?

- **A.** Cognito denies login and throws an authorization error whenever a user belongs to multiple groups.
- **B.** Cognito assigns the IAM Role of the group with the lowest precedence integer (`Admins`, precedence `1`).
- **C.** Cognito assigns the IAM Role of the group with the highest precedence integer (`Editors`, precedence `10`).
- **D.** Cognito automatically merges the permissions of both IAM Roles into a single combined STS session.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

**Cognito Groups Precedence**:
- Số nguyên không âm: **số càng nhỏ, ưu tiên càng cao** (`1` > `10`).
- Danh sách nhóm được nhúng vào claim `cognito:groups` trong JWT ID/Access Token.

- **A:** Sai vì 1 user hoàn toàn có thể thuộc nhiều Cognito Groups.
- **B (Đúng):** Đúng! Trong Cognito User Pool Groups, giá trị **`Precedence` càng nhỏ thì độ ưu tiên càng cao** (`1` thắng `10`), nên user thuộc cả 2 nhóm sẽ nhận IAM Role của nhóm `Admins`.
- **C:** Sai vì số nhỏ hơn mới có độ ưu tiên cao hơn.
- **D:** Sai vì Cognito Identity Pool chỉ chọn **1 IAM Role duy nhất** để assume cho phiên làm việc đó.

</details>

### Câu 17 `medium`

A developer creates an Amazon API Gateway API that only needs to proxy requests to an AWS Lambda function, validate JWT tokens issued by an external OIDC provider, and minimize per-request cost and latency. Which API Gateway type should the developer choose?

- **A.** HTTP API
- **B.** Private REST API
- **C.** REST API
- **D.** WebSocket API

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Khi đề bài nhấn mạnh **JWT/OIDC Authorizer + tối ưu chi phí + độ trễ thấp** và không cần tính năng nâng cao (API Keys/Usage Plans/VTL/Cache) -> chọn **API Gateway HTTP API**.

- **A (Đúng):** Đúng! **HTTP API** rẻ hơn ~70% và độ trễ thấp hơn REST API, đồng thời tích hợp sẵn **JWT/OIDC Authorizer** và CORS.
- **B:** Sai vì đề không yêu cầu giới hạn chỉ truy cập từ trong VPC.
- **C:** Không tối ưu chi phí và độ trễ; chỉ chọn REST API khi cần Usage Plans, API Keys, Caching, VTL mapping, hoặc WAF.
- **D:** Sai vì đây là kết nối request/response chuẩn, không phải giao tiếp hai chiều persistent.

</details>

### Câu 18 `medium`

A mobile application allows users to sign in with Google or Apple accounts and then needs to grant the mobile client temporary permissions to upload profile pictures directly to a user-specific prefix in a private Amazon S3 bucket. Which authentication and authorization architecture is MOST appropriate?

- **A.** Programmatically create a dedicated AWS IAM User with inline S3 policies for every mobile user who registers in the application.
- **B.** Embed an IAM administrator access key inside the mobile application binary and restrict folder paths in client-side code.
- **C.** Use Amazon Cognito Identity Pools to exchange the provider token for temporary AWS STS credentials mapped to an IAM role with policy variables.
- **D.** Generate an AWS KMS asymmetric RSA key pair for each mobile user to sign in directly to the Amazon S3 REST API without using IAM or STS.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Mẹo phân biệt nhanh Cognito:
- **Cognito User Pools**: Quản lý đăng ký/đăng nhập (Authentication), MFA, trả về JWT (`id_token`, `access_token`) -> tích hợp tốt với API Gateway Authorizer.
- **Cognito Identity Pools (Federated Identities)**: Đổi token lấy **AWS Temporary Credentials (STS)** -> cho phép client truy cập trực tiếp tài nguyên AWS như S3, DynamoDB.

- **A:** Sai vì IAM User chỉ dành cho quản trị viên/hệ thống nội bộ và bị giới hạn quota (mặc định 5,000 IAM users/account), không dùng cho người dùng ứng dụng di động.
- **B:** Sai vì người dùng có thể dịch ngược ứng dụng di động để lấy khóa AWS và toàn quyền đọc/xóa S3 bucket.
- **C (Đúng):** Đúng! Cognito Identity Pools (Federated Identities) đổi token xác thực từ Google/Apple/Cognito User Pool lấy thông tin xác thực AWS tạm thời (STS) gắn IAM Role để gọi trực tiếp S3 SDK.
- **D:** Sai vì KMS là dịch vụ quản lý khóa mã hóa, không phải dịch vụ cấp phát phiên truy cập liên kết danh tính cho thiết bị di động.

</details>

---

[← Bộ trước](10-dva-step-functions-appsync.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Bộ tiếp theo →](12-dva-security-kms-secrets.md)
