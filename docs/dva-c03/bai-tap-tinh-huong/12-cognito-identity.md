# Bài tập tình huống — Chủ đề 12: Xác thực ứng dụng — Amazon Cognito & Advanced Identity

> Cognito User Pools vs Identity Pools, OAuth 2.0 / OIDC / JWT, Federation với SAML & STS Web Identity.
> **Số câu hỏi:** 18 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A SaaS provider exposes a REST API through Amazon API Gateway. External partner applications authenticate using a custom Lambda Authorizer (`TOKEN` type) that validates JWTs against an external identity provider. During load testing, the Lambda Authorizer becomes a bottleneck because it is invoked on every single API request, even when the same partner sends 500 requests per second with the same JWT. How can the developer reduce invocations of the Lambda Authorizer without changing the authentication flow?

- **A.** Enable API Gateway Stage Caching with a TTL of 300 seconds and encrypt the cache data using AWS KMS.
- **B.** Switch the API Gateway endpoint type from Regional to Edge-optimized to offload JWT validation to CloudFront edge locations.
- **C.** Replace the `Authorization` header with an API Gateway API Key and Usage Plan to authenticate individual partner requests.
- **D.** Enable Authorization Caching on the Lambda Authorizer and set a non-zero `AuthorizerResultTtlInSeconds`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà cung cấp SaaS cung cấp một REST API thông qua Amazon API Gateway. Các ứng dụng đối tác bên ngoài xác thực bằng một Lambda Authorizer tùy chỉnh (loại `TOKEN`) để xác thực JWT với một identity provider bên ngoài. Trong quá trình kiểm thử tải, Lambda Authorizer trở thành nút thắt cổ chai vì nó bị gọi trên mọi API request, ngay cả khi cùng một đối tác gửi 500 request mỗi giây với cùng một JWT. Developer có thể giảm số lần gọi Lambda Authorizer mà không thay đổi luồng xác thực bằng cách nào?

**Đáp án đúng:** **D**

**API Gateway Lambda Authorizer Caching**:
- Khi bật caching (`AuthorizerResultTtlInSeconds > 0`), API Gateway cache IAM Policy trả về dựa trên Identity Source (ví dụ header `Authorization`).
- Lưu ý bẫy thi: Nếu 1 user gọi nhiều route khác nhau dùng chung 1 token, IAM Policy trả về từ Authorizer nên cấp quyền cho `arn:aws:execute-api:region:account:api-id/stage/*/*` (hoặc tất cả resource cần thiết) để tránh bị `403 Forbidden` khi cache hit ở route khác.

- **A:** Sai vì Stage Caching cache response của backend integration (GET/method response), không phải cache riêng cho kết quả IAM policy của Lambda Authorizer.
- **B:** Sai vì Edge-optimized chỉ đặt CloudFront ở phía trước API Gateway, không cache kết quả xác thực của Lambda Authorizer.
- **C:** Sai vì API Keys dùng để định danh ứng dụng và giới hạn throttling/quota (Usage Plan), KHÔNG dùng để xác thực người dùng/JWT.
- **D (Đúng):** Đúng! Bật Authorization Caching (mặc định TTL 300 giây, tối đa 3600 giây) giúp API Gateway lưu cache IAM policy trả về từ Lambda Authorizer theo key là token (với TOKEN authorizer), giảm đáng kể số lần gọi Lambda.

</details>

### Câu 2 `medium`

A web application uses Amazon Cognito User Pools for user authentication. After a user signs in, the backend API needs the user's `tenant_id` and `subscription_tier` (stored in an external Amazon DynamoDB table) to be included inside the JWT ID token issued by Cognito. Which Cognito feature allows the developer to inject these dynamic claims into the token before it is issued?

- **A.** Use a Cognito Identity Pool (Federated Identities) to issue custom signed JWT ID tokens populated with DynamoDB user attributes.
- **B.** Use a Cognito Post Confirmation Lambda Trigger to query DynamoDB and modify the issued JWT ID token after sign-in.
- **C.** Configure a Cognito Pre Token Generation Lambda Trigger to fetch the attributes from DynamoDB and add them to `claimsToAddOrOverride`.
- **D.** Configure a Cognito Pre Sign-up Lambda Trigger to query DynamoDB and inject `tenant_id` into every future JWT token.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng web sử dụng Amazon Cognito User Pools để xác thực người dùng. Sau khi người dùng đăng nhập, API backend cần `tenant_id` và `subscription_tier` của người dùng (được lưu trữ trong một bảng Amazon DynamoDB bên ngoài) được đưa vào bên trong JWT ID token do Cognito cấp. Tính năng nào của Cognito cho phép developer chèn các claim động này vào token trước khi nó được cấp?

**Đáp án đúng:** **C**

Các **Cognito User Pool Lambda Triggers** thường gặp trong đề thi:
- **Pre Sign-up**: Kiểm tra domain email, auto-confirm user.
- **Post Confirmation**: Gửi welcome email, tạo record trong DB sau khi đăng ký xong.
- **Pre Token Generation**: Thêm/sửa/xóa custom claims trong JWT token (hỗ trợ cả V2 để tùy biến Access Token).
- **Custom Message**: Tùy biến nội dung email/SMS OTP.

- **A:** Sai vì Identity Pool dùng để đổi token lấy AWS IAM Temporary Credentials (STS), không dùng để phát hành/tùy biến JWT ID token của User Pool.
- **B:** Sai vì Post Confirmation Trigger chỉ chạy một lần duy nhất ngay sau khi người dùng xác nhận đăng ký tài khoản (ví dụ để gửi email chào mừng hoặc ghi DB), không chạy mỗi lần đăng nhập để sửa JWT.
- **C (Đúng):** Đúng! Cognito **Pre Token Generation Lambda Trigger** chạy ngay trước khi Cognito phát hành JWT token, cho phép đọc dữ liệu từ nguồn ngoài (như DynamoDB) và thêm/ghi đè claims (`claimsToAddOrOverride`) hoặc xóa claims trong token.
- **D:** Sai vì Pre Sign-up Trigger chỉ chạy lúc đăng ký để kiểm tra/chặn hoặc auto-confirm user mới, không can thiệp vào JWT lúc đăng nhập.

</details>

### Câu 3 `medium`

A company hosts a REST API on Amazon API Gateway. The API must only accept requests from authenticated mobile app users (who log in via Amazon Cognito User Pools) AND must block all traffic except from a specific corporate VPN IP range (`203.0.113.0/24`). Which TWO configurations should the developer implement? (Choose two.)

- **A.** Attach a Cognito User Pool Authorizer to the API Gateway methods.
- **B.** Attach an API Gateway Resource Policy with an Explicit `Deny` for `NotIpAddress` outside `203.0.113.0/24`.
- **C.** Configure an EC2 Security Group directly on the API Gateway Regional endpoint allowing inbound TCP 443 only from `203.0.113.0/24`.
- **D.** Use an API Gateway Usage Plan with an API Key to restrict incoming requests by the corporate VPN source IP CIDR.
- **E.** Disable TLS 1.2 on the API Gateway custom domain name and enforce mutual TLS (mTLS) with a self-signed certificate.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ một REST API trên Amazon API Gateway. API chỉ được chấp nhận request từ người dùng ứng dụng di động đã xác thực (đăng nhập qua Amazon Cognito User Pools) VÀ phải chặn toàn bộ lưu lượng ngoại trừ từ dải IP VPN công ty cụ thể (`203.0.113.0/24`). Developer nên triển khai HAI cấu hình nào? (Chọn hai đáp án.)

**Đáp án đúng:** **A, B**

Các lớp bảo mật của **Amazon API Gateway**:
- **Xác thực người dùng**: Cognito User Pool Authorizer (JWT), Lambda Authorizer, hoặc IAM SigV4.
- **Chặn/cho phép IP hoặc VPC**: **API Gateway Resource Policy** (hoặc **AWS WAF**).

- **A (Đúng):** Đúng! Cognito User Pool Authorizer tự động xác thực JWT token do Cognito cấp cho người dùng mobile app trước khi cho phép gọi backend.
- **B (Đúng):** Đúng! API Gateway Resource Policy hỗ trợ lọc địa chỉ IP nguồn (`aws:SourceIp`) với `Deny` / `NotIpAddress` để chỉ cho phép dải IP VPN của công ty.
- **C:** Sai vì API Gateway là dịch vụ managed không gắn trực tiếp Security Group (trừ VPC Link tới backend hoặc Private API dùng VPC Endpoint Security Group).
- **D:** Sai vì Usage Plan chỉ giới hạn rate/burst/quota theo API Key, không lọc theo IP.
- **E:** Sai vì tắt TLS 1.2 làm giảm bảo mật chứ không xác thực user hay lọc IP.

</details>

### Câu 4 `medium`

A developer is building an application where thousands of authenticated Amazon Cognito users store personal profile items in a single Amazon DynamoDB table (`UserProfiles`). The partition key is `userId` (set to the Cognito Identity ID). Using a single shared IAM role for all authenticated users, how can the developer ensure each user can ONLY read and write their own DynamoDB item?

- **A.** Create a dedicated AWS IAM User and inline IAM Policy scoped to each Cognito user's `userId` partition key.
- **B.** Create a separate Amazon DynamoDB table (`UserProfiles_<userId>`) for every registered Cognito User Pool user immediately upon sign-up.
- **C.** Add a `Condition` using `ForAllValues:StringEquals` on `dynamodb:LeadingKeys` equal to `${cognito-identity.amazonaws.com:sub}`.
- **D.** Use the `dynamodb:Select` IAM condition key with `SPECIFIC_ATTRIBUTES` to restrict item-level reads and writes.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer đang xây dựng một ứng dụng nơi hàng nghìn người dùng Amazon Cognito đã xác thực lưu trữ các item hồ sơ cá nhân trong một bảng Amazon DynamoDB duy nhất (`UserProfiles`). Partition key là `userId` (được đặt bằng Cognito Identity ID). Sử dụng một IAM role dùng chung duy nhất cho tất cả người dùng đã xác thực, làm thế nào developer có thể đảm bảo mỗi người dùng CHỈ có thể đọc và ghi DynamoDB item của riêng mình?

**Đáp án đúng:** **C**

**DynamoDB Fine-Grained Access Control** với IAM Policy Variables:
- **`dynamodb:LeadingKeys`**: Giới hạn quyền truy cập theo giá trị **Partition Key** (dùng `${cognito-identity.amazonaws.com:sub}` cho Cognito hoặc `${aws:username}` cho IAM user).
- **`dynamodb:Attributes`**: Giới hạn chỉ được đọc/ghi một số cột (attributes) cụ thể.

- **A:** Sai vì Cognito Identity Pool sinh temporary STS credentials cho hàng nghìn/triệu người dùng mà không cần tạo IAM User (IAM User giới hạn 5,000/account).
- **B:** Sai vì tạo hàng nghìn bảng DynamoDB riêng lẻ vi phạm thiết kế, chạm giới hạn số bảng mỗi account và tốn chi phí quản lý.
- **C (Đúng):** Đúng! Fine-grained access control trong DynamoDB sử dụng `dynamodb:LeadingKeys` kết hợp biến chính sách IAM `${cognito-identity.amazonaws.com:sub}` cho phép 1 IAM Role duy nhất giới hạn mỗi user chỉ truy cập đúng Partition Key trùng với Cognito Identity ID của mình.
- **D:** Sai vì `dynamodb:Select` chỉ kiểm soát việc trả về tất cả thuộc tính hay một số thuộc tính, không giới hạn theo Partition Key của từng user.

</details>

### Câu 5 `medium`

A startup is building a new serverless backend with Amazon API Gateway and AWS Lambda. The API only needs JWT-based authorization with Amazon Cognito, CORS support, and simple Lambda proxy integrations, with no need for API Keys, Usage Plans, request/response VTL mapping templates, or edge caching. Which API Gateway type offers the LOWEST cost and latency?

- **A.** HTTP API
- **B.** Edge-optimized REST API
- **C.** WebSocket API
- **D.** Private REST API

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một startup đang xây dựng một backend serverless mới với Amazon API Gateway và AWS Lambda. API chỉ cần phân quyền dựa trên JWT với Amazon Cognito, hỗ trợ CORS và các tích hợp Lambda proxy đơn giản, không cần API Key, Usage Plan, VTL mapping template cho request/response hay edge caching. Loại API Gateway nào mang lại chi phí và độ trễ THẤP NHẤT?

**Đáp án đúng:** **A**

Chọn loại **Amazon API Gateway** đúng nhu cầu:
- **HTTP API**: Rẻ nhất (~70% rẻ hơn REST API), độ trễ thấp nhất, có JWT Authorizer & CORS.
- **REST API**: Đầy đủ tính năng doanh nghiệp (API Keys/Usage Plans, VTL Mapping Templates, Stage Caching, WAF tích hợp trực tiếp, Private API).
- **WebSocket API**: Kết nối hai chiều thời gian thực (`$connect`, `$disconnect`, `$default`).

- **A (Đúng):** Đúng! **HTTP API** của API Gateway rẻ hơn tới ~70% và có độ trễ thấp hơn REST API, hỗ trợ sẵn JWT Authorizer (OIDC/OAuth 2.0 như Cognito), CORS, và Lambda/HTTP proxy integration.
- **B:** Sai vì REST API đắt hơn nhiều và chỉ cần thiết khi bạn dùng Usage Plans/API Keys, VTL Mapping Templates, Request Validation, hoặc API Gateway Stage Caching.
- **C:** Sai vì WebSocket API dùng cho giao tiếp hai chiều persistent (chat, real-time dashboard), không phù hợp cho API REST/HTTP thông thường.
- **D:** Sai vì Private REST API chỉ truy cập được từ bên trong VPC qua Interface VPC Endpoint.

</details>

### Câu 6 `medium`

A mobile application allows users to sign up and sign in with email and password using Amazon Cognito. After signing in, the mobile app needs to upload photos directly from the device to a private Amazon S3 bucket without routing the traffic through a backend server. How should the developer configure Amazon Cognito?

- **A.** Configure the Cognito User Pool directly to issue temporary AWS STS `AccessKeyId` and `SecretAccessKey` credentials upon sign-in.
- **B.** Embed a long-term IAM User Access Key and Secret Key inside the mobile app binary and restrict prefixes in client-side code.
- **C.** Use a Cognito Identity Pool alone without any authentication provider to handle user registration, sign-up, and password reset.
- **D.** Authenticate users with a Cognito User Pool, then exchange the JWT token via a Cognito Identity Pool for temporary STS credentials with S3 permissions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng di động cho phép người dùng đăng ký và đăng nhập bằng email và mật khẩu thông qua Amazon Cognito. Sau khi đăng nhập, ứng dụng di động cần tải ảnh trực tiếp từ thiết bị lên một Amazon S3 bucket riêng tư mà không cần định tuyến lưu lượng qua máy chủ backend. Developer nên cấu hình Amazon Cognito như thế nào?

**Đáp án đúng:** **D**

Phân biệt cốt lõi **Cognito User Pool vs Identity Pool**:
- **User Pool**: Thư mục người dùng (**Authentication** — đăng ký, đăng nhập, MFA, cấp JWT).
- **Identity Pool**: Cấp quyền truy cập dịch vụ AWS (**Authorization** — đổi JWT của User Pool/Google/Apple lấy **AWS STS Temporary Credentials**).

- **A:** Sai vì Cognito User Pool chỉ cấp OIDC/OAuth2 JWT tokens (ID, Access, Refresh tokens), không cấp AWS IAM/STS credentials.
- **B:** Sai vì nhúng Access Key dài hạn vào mobile app rất dễ bị dịch ngược và đánh cắp.
- **C:** Sai vì Identity Pool không lưu danh bạ user/mật khẩu hay hỗ trợ đăng ký/quên mật khẩu; vai trò đó thuộc về User Pool.
- **D (Đúng):** Đúng! **Cognito User Pool** quản lý đăng ký/đăng nhập và cấp JWT token; **Cognito Identity Pool** (Federated Identities) đổi JWT token đó lấy **Temporary AWS Credentials (STS)** gắn với IAM Role cho phép mobile app gọi thẳng `s3:PutObject`.

</details>

### Câu 7 `medium`

A company uses Amazon Cognito User Pools and wants to implement a passwordless login flow where users enter their email address, receive a custom 6-digit one-time code via a third-party email provider, and submit the code to authenticate. Which Cognito User Pool Lambda Triggers must be implemented to build this custom authentication flow?

- **A.** `PreSignUp`, `PostConfirmation`, and `PostAuthentication` Cognito Lambda triggers
- **B.** `DefineAuthChallenge`, `CreateAuthChallenge`, and `VerifyAuthChallengeResponse`
- **C.** `PreTokenGeneration`, `UserMigration`, and `CustomEmailSender` triggers
- **D.** `CustomMessage` Lambda trigger only with Cognito Hosted UI enabled

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty sử dụng Amazon Cognito User Pools và muốn triển khai luồng đăng nhập không mật khẩu (passwordless), trong đó người dùng nhập địa chỉ email, nhận mã dùng một lần 6 chữ số tùy chỉnh qua một nhà cung cấp email bên thứ ba và gửi mã đó để xác thực. Những Cognito User Pool Lambda Trigger nào phải được triển khai để xây dựng luồng xác thực tùy chỉnh này?

**Đáp án đúng:** **B**

**Cognito Custom Authentication Flow** gồm 3 Lambda triggers:
1. **`DefineAuthChallenge`**: Xác định bước tiếp theo (cấp challenge hay phát hành token).
2. **`CreateAuthChallenge`**: Sinh OTP/CAPTCHA và gửi qua kênh ngoài.
3. **`VerifyAuthChallengeResponse`**: Kiểm tra câu trả lời của người dùng.

- **A:** Sai vì các trigger này phục vụ vòng đời đăng ký và ghi nhận sau đăng nhập, không tạo/xác minh thử thách đăng nhập tùy chỉnh.
- **B (Đúng):** Đúng! Bộ 3 Lambda Triggers cho **Custom Authentication Flow** trong Cognito User Pool là: `DefineAuthChallenge` (điều phối chuỗi thử thách), `CreateAuthChallenge` (tạo và gửi OTP), và `VerifyAuthChallengeResponse` (kiểm tra mã người dùng nhập).
- **C:** Sai vì `PreTokenGeneration` chỉ sửa claims trong JWT, còn `UserMigration` dùng để di chuyển user từ hệ thống cũ sang Cognito.
- **D:** Sai vì `CustomMessage` chỉ tùy biến nội dung text/HTML của email/SMS mặc định từ Cognito, không tự tạo luồng đăng nhập không mật khẩu qua nhà cung cấp thứ ba.

</details>

### Câu 8 `medium`

A company stores all user accounts in an Amazon Cognito User Pool. The mobile app allows users to sign in with username/password, and also supports "Sign in with Google" and "Sign in with Apple". After authentication, how does the application verify the user's identity on a custom REST API backend?

- **A.** The mobile client sends the Cognito Refresh Token in the `Authorization` header on every backend API request.
- **B.** The client sends the Cognito ID/Access JWT in `Authorization`, and the backend (or API Gateway) verifies it against Cognito's JWKS.
- **C.** The backend calls `sts:GetCallerIdentity` using the federated user's email address to validate the session.
- **D.** The mobile client sends the user's plaintext Google or Apple password to the backend for OIDC verification.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ tất cả tài khoản người dùng trong một Amazon Cognito User Pool. Ứng dụng di động cho phép người dùng đăng nhập bằng tên đăng nhập/mật khẩu, đồng thời hỗ trợ "Sign in with Google" và "Sign in with Apple". Sau khi xác thực, ứng dụng xác minh danh tính người dùng trên một backend REST API tùy chỉnh như thế nào?

**Đáp án đúng:** **B**

3 loại Token của **Cognito User Pool**:
- **ID Token (JWT)**: Chứa thông tin định danh user (`sub`, `email`, `cognito:groups`, custom attributes).
- **Access Token (JWT)**: Chứa `scope` và `client_id` dùng để ủy quyền gọi API.
- **Refresh Token**: Dùng để lấy lại ID/Access Token mới (thời hạn mặc định 30 ngày).

- **A:** Sai vì Refresh Token chỉ dùng để xin cấp lại Access/ID Token mới khi hết hạn, không gửi kèm mỗi request API.
- **B (Đúng):** Đúng! Khi tích hợp Google/Apple qua **Cognito User Pool (Federated Sign-In)**, Cognito chuẩn hóa và cấp ra các **JWT Tokens (ID, Access, Refresh)** đã ký bằng khóa riêng của Cognito; API Gateway/Backend chỉ cần kiểm tra chữ ký JWT bằng public JWKS của User Pool.
- **C:** Sai vì `sts:GetCallerIdentity` chỉ kiểm tra IAM credentials hiện tại chứ không xác thực JWT của Cognito User Pool.
- **D:** Sai vì OAuth/OIDC không bao giờ chia sẻ mật khẩu Google của người dùng cho ứng dụng bên thứ ba.

</details>

### Câu 9 `medium`

A developer uses Amazon Cognito Identity Pools to grant authenticated users temporary AWS credentials to upload files to an Amazon S3 bucket (`user-uploads`). Each user must ONLY be able to read and write objects under their own folder `s3://user-uploads/${cognito-identity.amazonaws.com:sub}/*`. Where should this IAM policy be attached?

- **A.** Attach the S3 policy to the Cognito User Pool's Pre Sign-up Lambda execution role for user uploads.
- **B.** Programmatically create one dedicated IAM User and inline S3 policy per Cognito user in AWS IAM.
- **C.** Attach it to the Authenticated IAM Role in the Cognito Identity Pool using the `${cognito-identity.amazonaws.com:sub}` variable.
- **D.** Attach the IAM Role ARN directly inside the Amazon S3 bucket's Cross-Origin Resource Sharing (CORS) rules.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer sử dụng Amazon Cognito Identity Pools để cấp cho người dùng đã xác thực các thông tin xác thực AWS tạm thời nhằm tải tệp lên một Amazon S3 bucket (`user-uploads`). Mỗi người dùng CHỈ được phép đọc và ghi các object dưới thư mục riêng của họ `s3://user-uploads/${cognito-identity.amazonaws.com:sub}/*`. IAM policy này nên được gắn ở đâu?

**Đáp án đúng:** **C**

Phân quyền **S3 theo từng user với Cognito Identity Pool**:
- Gắn vào **Authenticated Role** của Identity Pool.
- Dùng Resource: `arn:aws:s3:::user-uploads/${cognito-identity.amazonaws.com:sub}/*`.

- **A:** Sai vì Execution Role của Pre Sign-up Lambda chỉ cấp quyền cho hàm Lambda đó chạy lúc đăng ký, không cấp quyền S3 cho mobile app.
- **B:** Sai vì Identity Pool dùng STS temporary credentials cho hàng triệu user mà không tạo IAM User.
- **C (Đúng):** Đúng! Cognito **Identity Pool** gán một **Authenticated IAM Role** cho người dùng đã đăng nhập; dùng biến chính sách `${cognito-identity.amazonaws.com:sub}` trong Resource ARN giúp cô lập thư mục S3 riêng cho từng user.
- **D:** Sai vì cấu hình CORS không chứa IAM Role.

</details>

### Câu 10 `medium`

A web application uses Amazon API Gateway REST API with **IAM Authorization** (`AWS_IAM`). An external user authenticates via Amazon Cognito Identity Pool and receives temporary STS credentials (`AccessKeyId`, `SecretAccessKey`, `SessionToken`). What must the client application do when sending HTTP requests to the IAM-protected API Gateway endpoint?

- **A.** Send the Cognito User Pool JWT directly in the `x-api-key` header on every API Gateway request.
- **B.** Pass the temporary STS `SecretAccessKey` in plaintext inside the HTTP URL query string.
- **C.** Sign each HTTP request using AWS Signature Version 4 (SigV4) with temporary STS credentials (including `X-Amz-Security-Token`).
- **D.** Use HTTP Basic Authentication with the Cognito Authenticated IAM Role ARN as the username.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng web sử dụng Amazon API Gateway REST API với **IAM Authorization** (`AWS_IAM`). Một người dùng bên ngoài xác thực qua Amazon Cognito Identity Pool và nhận được thông tin xác thực STS tạm thời (`AccessKeyId`, `SecretAccessKey`, `SessionToken`). Ứng dụng client phải làm gì khi gửi các HTTP request tới endpoint API Gateway được bảo vệ bởi IAM?

**Đáp án đúng:** **C**

So sánh các cơ chế xác thực trên **API Gateway**:
- **`AWS_IAM`**: Dùng **SigV4** (ký request bằng IAM/STS credentials); cấp quyền qua `execute-api:Invoke`.
- **`COGNITO_USER_POOLS`**: Truyền JWT trong `Authorization` header.
- **`Lambda Authorizer` (`TOKEN`/`REQUEST`)**: Kiểm tra custom token/headers bằng hàm Lambda.

- **A:** Sai vì `x-api-key` chỉ dùng cho Usage Plans, còn `AWS_IAM` authorizer yêu cầu chữ ký SigV4.
- **B:** Sai và cực kỳ mất an toàn; `SecretAccessKey` chỉ dùng để tính toán chữ ký SigV4 ở phía client, không bao giờ gửi qua mạng.
- **C (Đúng):** Đúng! API Gateway bật `AWS_IAM` authorization yêu cầu mọi HTTP request phải được ký bằng **AWS Signature Version 4 (SigV4)** sử dụng STS credentials (gửi kèm `Authorization` signature và `X-Amz-Security-Token`).
- **D:** Sai vì API Gateway không dùng HTTP Basic Auth cho `AWS_IAM`.

</details>

### Câu 11 `medium`

An application uses Amazon Cognito User Pools and needs to securely store user passwords and allow users to sign in with an email address instead of a separate username. Additionally, users should be able to recover forgotten passwords via an SMS or email verification code, and compromised passwords must be blocked automatically. Which Cognito User Pool feature detects and blocks compromised passwords?

- **A.** Enable Amazon Cognito Identity Pool Unauthenticated Guest Access for all mobile sign-in attempts.
- **B.** Configure a Cognito User Pool App Client without a client secret and rely on implicit OAuth flow.
- **C.** Store user passwords in an Amazon DynamoDB table in plaintext so a Lambda trigger can check public breach lists.
- **D.** Enable Cognito Advanced Security Features (Compromised Credentials Detection and Adaptive Authentication).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng sử dụng Amazon Cognito User Pools và cần lưu trữ mật khẩu người dùng an toàn cũng như cho phép người dùng đăng nhập bằng địa chỉ email thay vì tên đăng nhập riêng. Ngoài ra, người dùng phải có thể khôi phục mật khẩu bị quên qua mã xác minh SMS hoặc email, và các mật khẩu bị lộ (compromised) phải bị chặn tự động. Tính năng nào của Cognito User Pool phát hiện và chặn các mật khẩu bị lộ?

**Đáp án đúng:** **D**

**Cognito User Pool Security**:
- **Advanced Security**: Compromised Credentials + Adaptive Authentication (risk-based MFA).
- **Sign-in aliases**: Cho phép đăng nhập bằng `email` hoặc `phone_number` (cấu hình lúc tạo User Pool).

- **A:** Sai vì Unauthenticated Access cho phép khách vãng lai lấy STS credentials tạm thời, không liên quan đến kiểm tra mật khẩu bị lộ.
- **B:** Sai vì App Client secret chỉ dùng để xác thực ứng dụng backend (confidential client), không phát hiện mật khẩu bị rò rỉ.
- **C:** Sai và vi phạm bảo mật nghiêm trọng.
- **D (Đúng):** Đúng! **Cognito Advanced Security** cung cấp **Compromised Credentials Detection** (tự động phát hiện mật khẩu bị lộ trong các vụ rò rỉ dữ liệu công khai và bắt buộc đổi) cùng **Adaptive Authentication** (đánh giá rủi ro đăng nhập bất thường để yêu cầu MFA).

</details>

### Câu 12 `medium`

A mobile app uses Amazon Cognito User Pools and receives an ID token, Access token, and Refresh token upon login. When the Access token expires after 1 hour, how should the mobile app obtain a new Access token without prompting the user to re-enter their username and password?

- **A.** Call `sts:AssumeRoleWithWebIdentity` to renew and extend the Cognito User Pool Access and ID tokens.
- **B.** Call Cognito `InitiateAuth` with `AuthFlow: "REFRESH_TOKEN_AUTH"` (passing `REFRESH_TOKEN`) to get fresh ID and Access tokens.
- **C.** Set the Access Token validity duration to 10 years in the Cognito User Pool App Client configuration.
- **D.** Cache the user's plaintext password in browser `localStorage` and re-submit `InitiateAuth` automatically every 60 minutes in the background.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng di động sử dụng Amazon Cognito User Pools và nhận được ID token, Access token và Refresh token khi đăng nhập. Khi Access token hết hạn sau 1 giờ, ứng dụng di động nên lấy Access token mới như thế nào mà không yêu cầu người dùng nhập lại tên đăng nhập và mật khẩu?

**Đáp án đúng:** **B**

Thời hạn Token trong **Cognito User Pool**:
- **Access / ID Token**: 5 phút – **24 giờ** (mặc định 1 giờ).
- **Refresh Token**: 60 phút – **10 năm** (mặc định 30 ngày), dùng với `REFRESH_TOKEN_AUTH`.

- **A:** Sai vì `AssumeRoleWithWebIdentity` cấp AWS STS temporary credentials, không cấp lại Cognito JWT Access Token.
- **B (Đúng):** Đúng! Dùng **Refresh Token** gọi `InitiateAuth` (`REFRESH_TOKEN_AUTH`) để đổi lấy ID Token và Access Token mới một cách âm thầm mà không bắt người dùng đăng nhập lại.
- **C:** Sai vì Access Token của Cognito có thời hạn tối đa chỉ **24 giờ** (không thể đặt 10 năm).
- **D:** Sai vì lưu mật khẩu plaintext ở client là lỗ hổng bảo mật nghiêm trọng.

</details>

### Câu 13 `medium`

A company hosts a REST API on Amazon API Gateway with a custom domain (`api.example.com`). Security requirements mandate that API clients authenticate using **Mutual TLS (mTLS)** in addition to a Cognito JWT token, so only devices possessing a client certificate signed by the company's internal Certificate Authority (CA) can establish a TLS connection. How should the developer configure mTLS on API Gateway?

- **A.** Store the CA truststore PEM bundle inside AWS Secrets Manager and attach it to an Edge-optimized API Gateway custom endpoint.
- **B.** Validate the X.509 client certificate inside a Lambda Authorizer without configuring a custom domain name.
- **C.** Upload the CA truststore PEM bundle to Amazon S3 and enable Mutual TLS on the API Gateway Regional Custom Domain.
- **D.** Enable AWS WAF Rate-based rules and managed SQLi rule groups to verify partner X.509 client certificates.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ một REST API trên Amazon API Gateway với tên miền tùy chỉnh (`api.example.com`). Yêu cầu bảo mật quy định rằng các API client phải xác thực bằng **Mutual TLS (mTLS)** bên cạnh Cognito JWT token, để chỉ những thiết bị sở hữu chứng chỉ client được ký bởi Certificate Authority (CA) nội bộ của công ty mới có thể thiết lập kết nối TLS. Developer nên cấu hình mTLS trên API Gateway như thế nào?

**Đáp án đúng:** **C**

**API Gateway Mutual TLS (mTLS)**:
- Chỉ hỗ trợ **Regional Custom Domain Names** (REST API & HTTP API).
- Truststore (`.pem`) lưu trên **Amazon S3** (khuyến nghị bật S3 Versioning).
- Thông tin chứng chỉ client được truyền vào `$context.identity.clientCert.*` cho Lambda/Authorizer.

- **A:** Sai vì mTLS của API Gateway chỉ hỗ trợ **Regional** Custom Domain Name (không hỗ trợ Edge-optimized) và đọc truststore từ **Amazon S3**, không phải Secrets Manager.
- **B:** Sai vì bắt tay mTLS diễn ra ở tầng TLS handshake trước khi vào Lambda Authorizer; nếu không bật mTLS trên Custom Domain, API Gateway sẽ không yêu cầu client certificate.
- **C (Đúng):** Đúng! API Gateway hỗ trợ **Mutual TLS (mTLS)** trên **Regional Custom Domain Name** (hỗ trợ cả REST API và HTTP API) bằng cách upload file PEM truststore lên **Amazon S3** (nên bật S3 Versioning) và trỏ `TruststoreUri` tới S3.
- **D:** Sai vì AWS WAF rate-based rule đếm số request theo IP, không xác thực chuỗi chứng chỉ mTLS X.509.

</details>

### Câu 14 `medium`

A company wants to allow corporate employees to log into an internal AWS-hosted developer portal using their existing Active Directory / Okta credentials (SAML 2.0) and receive temporary AWS console/API access without creating individual IAM Users in AWS. Which AWS IAM / STS integration supports SAML 2.0 federation?

- **A.** Use `sts:GetFederationToken` with an IAM User's root account password to exchange SAML assertions for temporary STS credentials.
- **B.** Use `sts:AssumeRoleWithWebIdentity` with Okta SAML 2.0 XML assertions to obtain temporary AWS STS credentials.
- **C.** Create an IAM SAML 2.0 Identity Provider, configure a trusting IAM Role, and use `sts:AssumeRoleWithSAML` (or IAM Identity Center).
- **D.** Create dedicated IAM Users for every employee in each AWS account and sync their corporate passwords manually.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty muốn cho phép nhân viên công ty đăng nhập vào một cổng developer nội bộ lưu trữ trên AWS bằng thông tin đăng nhập Active Directory / Okta hiện có của họ (SAML 2.0) và nhận quyền truy cập AWS console/API tạm thời mà không cần tạo từng IAM User riêng lẻ trong AWS. Tích hợp AWS IAM / STS nào hỗ trợ liên kết danh tính (federation) SAML 2.0?

**Đáp án đúng:** **C**

Phân biệt các API **AWS STS**:
- **`AssumeRole`**: Chuyển đổi sang IAM Role (cùng account hoặc cross-account).
- **`AssumeRoleWithSAML`**: Đăng nhập liên kết **SAML 2.0** (Okta, ADFS).
- **`AssumeRoleWithWebIdentity`**: Đăng nhập liên kết **OIDC** (Google, Apple, Cognito, GitHub Actions OIDC).
- **`GetSessionToken`**: Lấy token tạm thời kèm **MFA** cho IAM User.

- **A:** Sai vì `GetFederationToken` dùng cho custom identity broker chứ không phải luồng chuẩn SAML 2.0.
- **B:** Sai vì `AssumeRoleWithWebIdentity` dành cho **OIDC / OAuth 2.0** (Google, Facebook, Cognito, GitHub Actions), còn SAML 2.0 dùng `AssumeRoleWithSAML`.
- **C (Đúng):** Đúng! AWS hỗ trợ đăng nhập liên kết SAML 2.0 từ Okta/AD thông qua **IAM SAML 2.0 Identity Provider + `sts:AssumeRoleWithSAML`** (hoặc dùng **AWS IAM Identity Center** làm trung tâm quản lý SSO hiện đại cho nhiều AWS accounts).
- **D:** Sai vì đề bài yêu cầu không tạo IAM Users riêng lẻ.

</details>

### Câu 15 `medium`

A GitHub Actions workflow needs to deploy an AWS SAM application into an AWS account without storing long-lived `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` secrets in GitHub. What is the AWS-recommended way to authenticate GitHub Actions?

- **A.** Store an IAM `AdministratorAccess` Access Key in a public S3 bucket for GitHub Actions workflows to download.
- **B.** Hardcode the AWS account Root User credentials inside `.github/workflows/deploy.yml` as encrypted workflow variables.
- **C.** Call `aws sts get-session-token` directly from GitHub Actions without any pre-existing AWS IAM credentials.
- **D.** Configure an IAM OIDC Identity Provider for `token.actions.githubusercontent.com` and assume an IAM Role via `sts:AssumeRoleWithWebIdentity`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một workflow GitHub Actions cần triển khai một ứng dụng AWS SAM vào một tài khoản AWS mà không cần lưu trữ các secret dài hạn `AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY` trong GitHub. Cách được AWS khuyến nghị để xác thực GitHub Actions là gì?

**Đáp án đúng:** **D**

Best practice **CI/CD Authentication (GitHub Actions -> AWS)**:
- Dùng **OIDC Federation (`AssumeRoleWithWebIdentity`)** + `aws-actions/configure-aws-credentials`.
- Khóa điều kiện `StringLike` trên `token.actions.githubusercontent.com:sub` (ví dụ `repo:org/repo:ref:refs/heads/main`).

- **A:** Sai vì lộ Access Key lên S3 public sẽ dẫn đến mất tài khoản AWS ngay lập tức.
- **B:** Sai và cực kỳ nguy hiểm.
- **C:** Sai vì `get-session-token` yêu cầu phải có IAM User credentials sẵn từ trước.
- **D (Đúng):** Đúng! Kết nối **GitHub Actions OIDC** với **IAM OIDC Identity Provider** cho phép workflow gọi `sts:AssumeRoleWithWebIdentity` lấy temporary credentials ngay lúc chạy (và giới hạn theo `sub` repo/branch cụ thể) mà **không cần lưu Access Key dài hạn**.

</details>

### Câu 16 `medium`

An Amazon Cognito User Pool has users organized into two Cognito Groups: `Admins` (precedence 1) and `Editors` (precedence 10). Each group is associated with a different IAM Role in a Cognito Identity Pool (`Choose role from token`). If a user belongs to BOTH `Admins` and `Editors`, how does Cognito decide which IAM Role is assigned?

- **A.** Cognito assigns the IAM Role of the group with the highest precedence integer (`Editors`, precedence `10`).
- **B.** Cognito assigns the IAM Role of the group with the lowest precedence integer (`Admins`, precedence `1`).
- **C.** Cognito automatically merges the IAM policies of both groups' IAM Roles into a single temporary STS session.
- **D.** Cognito denies authentication and returns an error whenever a user belongs to multiple User Pool groups.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một Amazon Cognito User Pool có người dùng được sắp xếp vào hai Cognito Group: `Admins` (precedence 1) và `Editors` (precedence 10). Mỗi nhóm được liên kết với một IAM Role khác nhau trong một Cognito Identity Pool (`Choose role from token`). Nếu một người dùng thuộc về CẢ `Admins` và `Editors`, Cognito quyết định gán IAM Role nào như thế nào?

**Đáp án đúng:** **B**

**Cognito Groups Precedence**:
- Số nguyên không âm: **số càng nhỏ, ưu tiên càng cao** (`1` > `10`).
- Danh sách nhóm được nhúng vào claim `cognito:groups` trong JWT ID/Access Token.

- **A:** Sai vì số nhỏ hơn mới có độ ưu tiên cao hơn.
- **B (Đúng):** Đúng! Trong Cognito User Pool Groups, giá trị **`Precedence` càng nhỏ thì độ ưu tiên càng cao** (`1` thắng `10`), nên user thuộc cả 2 nhóm sẽ nhận IAM Role của nhóm `Admins`.
- **C:** Sai vì Cognito Identity Pool chỉ chọn **1 IAM Role duy nhất** để assume cho phiên làm việc đó.
- **D:** Sai vì 1 user hoàn toàn có thể thuộc nhiều Cognito Groups.

</details>

### Câu 17 `medium`

A developer creates an Amazon API Gateway API that only needs to proxy requests to an AWS Lambda function, validate JWT tokens issued by an external OIDC provider, and minimize per-request cost and latency. Which API Gateway type should the developer choose?

- **A.** HTTP API
- **B.** REST API
- **C.** WebSocket API
- **D.** Private REST API

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một developer tạo một Amazon API Gateway API chỉ cần proxy các request tới một hàm AWS Lambda, xác thực JWT token do một nhà cung cấp OIDC bên ngoài cấp và giảm thiểu chi phí cũng như độ trễ trên mỗi request. Developer nên chọn loại API Gateway nào?

**Đáp án đúng:** **A**

Khi đề bài nhấn mạnh **JWT/OIDC Authorizer + tối ưu chi phí + độ trễ thấp** và không cần tính năng nâng cao (API Keys/Usage Plans/VTL/Cache) -> chọn **API Gateway HTTP API**.

- **A (Đúng):** Đúng! **HTTP API** rẻ hơn ~70% và độ trễ thấp hơn REST API, đồng thời tích hợp sẵn **JWT/OIDC Authorizer** và CORS.
- **B:** Không tối ưu chi phí và độ trễ; chỉ chọn REST API khi cần Usage Plans, API Keys, Caching, VTL mapping, hoặc WAF.
- **C:** Sai vì đây là kết nối request/response chuẩn, không phải giao tiếp hai chiều persistent.
- **D:** Sai vì đề không yêu cầu giới hạn chỉ truy cập từ trong VPC.

</details>

### Câu 18 `medium`

A mobile application allows users to sign in with Google or Apple accounts and then needs to grant the mobile client temporary permissions to upload profile pictures directly to a user-specific prefix in a private Amazon S3 bucket. Which authentication and authorization architecture is MOST appropriate?

- **A.** Use an AWS KMS asymmetric key pair to sign S3 API requests directly from the mobile client without obtaining temporary IAM credentials from AWS STS.
- **B.** Programmatically create a dedicated AWS IAM User with a scoped inline S3 policy for every mobile user who registers in the application via AWS SDK.
- **C.** Use Amazon Cognito Identity Pools (Federated Identities) to exchange the identity provider token for temporary AWS STS credentials mapped to an IAM role with policy variables.
- **D.** Embed an IAM administrator access key inside the mobile application binary and enforce user-specific S3 prefix restrictions solely in client-side code.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng di động cho phép người dùng đăng nhập bằng tài khoản Google hoặc Apple và sau đó cần cấp cho mobile client quyền tạm thời để tải ảnh đại diện trực tiếp lên một prefix riêng theo từng người dùng trong một Amazon S3 bucket riêng tư. Kiến trúc xác thực và phân quyền nào là PHÙ HỢP NHẤT?

**Đáp án đúng:** **C**

Mẹo phân biệt nhanh Cognito:
- **Cognito User Pools**: Quản lý đăng ký/đăng nhập (Authentication), MFA, trả về JWT (`id_token`, `access_token`) -> tích hợp tốt với API Gateway Authorizer.
- **Cognito Identity Pools (Federated Identities)**: Đổi token lấy **AWS Temporary Credentials (STS)** -> cho phép client truy cập trực tiếp tài nguyên AWS như S3, DynamoDB.

- **A:** Sai vì KMS là dịch vụ quản lý khóa mã hóa, không phải dịch vụ cấp phát phiên truy cập liên kết danh tính cho thiết bị di động.
- **B:** Sai vì IAM User chỉ dành cho quản trị viên/hệ thống nội bộ và bị giới hạn quota (mặc định 5,000 IAM users/account), không dùng cho người dùng ứng dụng di động.
- **C (Đúng):** Đúng! Cognito Identity Pools (Federated Identities) đổi token xác thực từ Google/Apple/Cognito User Pool lấy thông tin xác thực AWS tạm thời (STS) gắn IAM Role để gọi trực tiếp S3 SDK.
- **D:** Sai vì người dùng có thể dịch ngược ứng dụng di động để lấy khóa AWS và toàn quyền đọc/xóa S3 bucket.

</details>

---

[← Chủ đề 11](11-ai-bedrock-q-kiro.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chủ đề 13 →](13-security-kms-secrets.md)
