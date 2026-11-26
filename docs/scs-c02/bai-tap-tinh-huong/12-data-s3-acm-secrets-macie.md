# Bài tập tình huống — Bảo vệ Dữ liệu: S3 Encryption/Object Lock, ACM Private CA, Secrets Manager & Macie

> S3 SSE-S3/KMS/C & Bucket Keys, S3 Object Lock (WORM), ACM & ACM Private CA, Secrets Manager Rotation, DynamoDB/RDS Encryption và Amazon Macie.
> **Số câu hỏi:** 9 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A healthcare company stores millions of encrypted medical imaging files in an Amazon S3 bucket using SSE-KMS with a Customer Managed Key. Due to high read/write volume, the company is experiencing high AWS KMS request costs and occasional KMS throttling errors. Additionally, regulatory rules mandate that once an imaging file is uploaded, NO user—including the AWS account root user—can delete or overwrite it for 7 years. Which combination of S3 features meets BOTH requirements?

- **A.** Enable S3 Bucket Keys on the bucket and configure S3 Object Lock in Governance Mode with a 7-year default retention period.
- **B.** Enable S3 Bucket Keys on the bucket and configure S3 Object Lock in Compliance Mode with a 7-year default retention period.
- **C.** Switch to SSE-S3 encryption and enable S3 MFA Delete on the bucket.
- **D.** Enable S3 Transfer Acceleration and configure an S3 Bucket Policy denying s3:DeleteObject for all IAM roles.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty y tế lưu trữ hàng triệu tệp hình ảnh y tế được mã hóa trong một Amazon S3 bucket bằng SSE-KMS với Customer Managed Key. Do khối lượng đọc/ghi cao, công ty đang chịu chi phí request AWS KMS cao và thỉnh thoảng gặp lỗi KMS throttling. Ngoài ra, quy định bắt buộc một khi tệp hình ảnh đã được tải lên, KHÔNG một người dùng nào—kể cả root user của tài khoản AWS—có thể xóa hoặc ghi đè nó trong 7 năm. Sự kết hợp các tính năng S3 nào đáp ứng CẢ HAI yêu cầu?

**Đáp án đúng:** **B**

Hai tính năng S3 quan trọng trong Domain 5 của SCS-C02: (1) **S3 Bucket Keys** giảm tới 99% chi phí và request rate tới KMS khi dùng SSE-KMS trên lưu lượng lớn, (2) **S3 Object Lock Compliance Mode** (WORM) bảo vệ dữ liệu tuyệt đối trước cả root user trong suốt thời gian retention (khác với Governance Mode có thể bypass).

- **A:** Governance Mode cho phép người dùng có quyền đặc biệt (s3:BypassGovernanceRetention) hoặc root user ghi đè/xóa object trước hạn, không đáp ứng yêu cầu pháp lý 'kể cả root user cũng không được xóa'.
- **B (Đúng):** Chính xác! S3 Bucket Keys tạo một khóa dữ liệu cấp bucket từ KMS để S3 tự dùng sinh khóa cho từng object, giúp giảm tới 99% số lượng lời gọi API KMS (giảm chi phí và hết throttling). S3 Object Lock ở chế độ Compliance Mode đảm bảo ngay cả root user cũng không thể xóa hay rút ngắn thời gian lưu giữ 7 năm.
- **C:** Chuyển sang SSE-S3 vi phạm yêu cầu dùng Customer Managed Key (SSE-KMS), và MFA Delete vẫn cho phép root user xóa object nếu có thiết bị MFA.
- **D:** S3 Transfer Acceleration không giảm số lượng gọi API KMS, và S3 Bucket Policy có thể bị root user gỡ bỏ hoặc sửa đổi để xóa dữ liệu.

</details>

### Câu 2 `hard`

An enterprise operates 25 AWS accounts inside an AWS Organization and needs to enforce mutual TLS (mTLS) authentication between internal microservices across all accounts using private X.509 certificates. To minimize cost (avoiding paying for 25 separate Certificate Authorities) while automating certificate issuance and renewal via AWS Certificate Manager (ACM), which architecture should the security architect deploy?

- **A.** Request public ACM certificates for internal *.corp.local domain names in each member account.
- **B.** Deploy a separate AWS Private CA in every member account and export the root CA private keys to an S3 bucket.
- **C.** Use AWS KMS asymmetric signing keys to directly replace X.509 certificates in TLS handshakes.
- **D.** Create a central Private CA in a Security account, share it via AWS RAM, and issue/renew certs in member accounts via ACM.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp vận hành 25 tài khoản AWS bên trong một AWS Organization và cần thực thi xác thực mutual TLS (mTLS) giữa các microservice nội bộ trên tất cả tài khoản bằng chứng chỉ X.509 riêng tư. Để giảm thiểu chi phí (tránh phải trả tiền cho 25 Certificate Authority riêng biệt) trong khi tự động hóa việc cấp phát và gia hạn chứng chỉ qua AWS Certificate Manager (ACM), kiến trúc sư bảo mật nên triển khai kiến trúc nào?

**Đáp án đúng:** **D**

Trong kiến trúc đa tài khoản với **AWS Private CA (ACM PCA)**: luôn triển khai tập trung (Root CA + Subordinate CA) ở tài khoản Security/PKI rồi chia sẻ bằng **AWS RAM** cho các member account để tối ưu chi phí và quản trị tập trung vòng đời chứng chỉ/CRL/OCSP.

- **A:** ACM Public Certificates chỉ cấp cho tên miền công cộng hợp lệ (DNS/Email validation) và không thể export private key để dùng cho mTLS giữa các microservice nội bộ với tên miền .local.
- **B:** Tạo 25 Private CA riêng tốn kém chi phí gấp 25 lần, và AWS Private CA không cho phép export root CA private key (private key nằm trong HSM).
- **C:** KMS asymmetric key không thể thay thế hạ tầng PKI/X.509 certificate và chuỗi tin cậy CA dùng trong bắt tay mTLS chuẩn.
- **D (Đúng):** Chính xác! AWS Private CA có chi phí cố định hàng tháng khá cao cho mỗi CA; best practice của AWS là tạo Private CA tập trung trong tài khoản Security/Shared Services rồi chia sẻ qua AWS RAM (Resource Access Manager) cho toàn Organization để các member account tự cấp phát và gia hạn tự động chứng chỉ nội bộ qua ACM.

</details>

### Câu 3 `hard`

A high-throughput e-commerce application connects to an Amazon Aurora PostgreSQL cluster in private subnets using credentials stored in AWS Secrets Manager. The security team enables automatic 30-day secret rotation, but after the first rotation occurs, several active application instances experience temporary authentication failures until they refresh their connection pools. How should the security engineer configure Secrets Manager rotation to achieve ZERO application downtime during credential rotation?

- **A.** Switch rotation from Single User to Alternating Users with a VPC Lambda alternating between two DB users for zero downtime.
- **B.** Disable automatic rotation in Secrets Manager and store the Aurora password in AWS Systems Manager Parameter Store as a SecureString.
- **C.** Configure the Secrets Manager Lambda rotation function to reboot the Aurora writer instance after updating the password.
- **D.** Change the Secrets Manager KMS key to an AWS managed key so password updates propagate instantaneously to application memory.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng thương mại điện tử thông lượng cao kết nối tới cụm Amazon Aurora PostgreSQL trong các private subnet bằng thông tin xác thực lưu trong AWS Secrets Manager. Nhóm bảo mật bật tính năng xoay vòng bí mật tự động mỗi 30 ngày, nhưng sau lần xoay vòng đầu tiên diễn ra, một số instance ứng dụng đang hoạt động gặp phải các lỗi xác thực tạm thời cho đến khi chúng làm mới connection pool của mình. Kỹ sư bảo mật nên cấu hình xoay vòng Secrets Manager như thế nào để đạt được thời gian ngừng hoạt động BẰNG KHÔNG (zero downtime) trong quá trình xoay vòng thông tin xác thực?

**Đáp án đúng:** **A**

AWS Secrets Manager hỗ trợ 2 chiến lược xoay vòng (Rotation Strategies) cho database: (1) **Single User** (đơn giản, dùng cho hệ thống chịu được gián đoạn ngắn hoặc đọc lại secret ngay khi lỗi), và (2) **Alternating Users** (luân phiên 2 tài khoản DB, dùng thêm một master secret để đổi mật khẩu, đảm bảo **zero-downtime** cho hệ thống production lưu lượng cao).

- **A (Đúng):** Chính xác! Chiến lược Single User đổi mật khẩu ngay trên 1 tài khoản DB duy nhất nên các ứng dụng đang cache mật khẩu cũ sẽ bị lỗi xác thực tạm thời. Chiến lược Alternating Users (luân phiên 2 user A/B) giữ user cũ (AWSPREVIOUS) vẫn hoạt động song song trong khi kích hoạt user mới (AWSCURRENT), đảm bảo zero-downtime khi xoay vòng mật khẩu.
- **B:** Parameter Store không có tính năng xoay vòng tự động tích hợp sẵn như Secrets Manager, và tắt xoay vòng vi phạm yêu cầu bảo mật xoay vòng mỗi 30 ngày.
- **C:** Reboot Aurora writer instance sẽ gây gián đoạn dịch vụ (downtime) nghiêm trọng hơn nhiều.
- **D:** Loại KMS key không ảnh hưởng đến việc ứng dụng đang cache mật khẩu cũ trong bộ nhớ hay chiến lược xoay vòng Single User vs Alternating Users.

</details>

### Câu 4 `hard`

A company stores database credentials for a high-throughput Amazon Aurora MySQL cluster in AWS Secrets Manager. The security team requires automatic password rotation every 30 days with ZERO application downtime or failed database connections during the rotation window. Which TWO steps are required to implement this rotation strategy? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Configure Secrets Manager to use the single-user rotation strategy so that only one database account exists at any time.
- **B.** Use the alternating users (dual-user) rotation strategy with a superuser secret managing two cloned DB accounts.
- **C.** Store the database credentials in AWS Systems Manager Parameter Store Standard tier with automatic RDS rotation enabled.
- **D.** Retrieve credentials via Secrets Manager SDK caching with automatic refresh on authentication failure rather than hardcoding.
- **E.** Restart the Aurora DB cluster after each Secrets Manager rotation to flush old connection pools.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ thông tin xác thực cơ sở dữ liệu cho một cụm Amazon Aurora MySQL thông lượng cao trong AWS Secrets Manager. Nhóm bảo mật yêu cầu xoay vòng mật khẩu tự động mỗi 30 ngày với THỜI GIAN NGỪNG HOẠT ĐỘNG BẰNG KHÔNG hoặc không có kết nối cơ sở dữ liệu bị lỗi nào trong khung giờ xoay vòng. Cần HAI bước nào để triển khai chiến lược xoay vòng này? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Để xoay vòng mật khẩu cơ sở dữ liệu trong **AWS Secrets Manager** với **zero downtime** trên hệ thống production tải cao, cần dùng chiến lược **Alternating Users (Dual-User)** kết hợp với việc ứng dụng đọc secret qua SDK caching và tự động refresh khi có thay đổi phiên bản `AWSCURRENT`.

- **A:** Chiến lược Single-User rotation đổi trực tiếp mật khẩu của user đang hoạt động, có thể làm gián đoạn các kết nối mới trong khoảng thời gian ứng dụng chưa cập nhật cache (không đảm bảo zero downtime cho hệ thống tải cao).
- **B (Đúng):** Chính xác! Chiến lược luân phiên 2 người dùng (Alternating Users / Dual-User rotation) sử dụng một tài khoản superuser để cập nhật mật khẩu cho người dùng dự phòng (clone user) trong khi ứng dụng vẫn đang dùng kết nối của người dùng hiện tại, sau đó mới chuyển đổi nhãn `AWSCURRENT`, đảm bảo zero downtime.
- **C:** Systems Manager Parameter Store không có tính năng tự động xoay vòng mật khẩu cơ sở dữ liệu (automatic rotation) tích hợp sẵn như AWS Secrets Manager.
- **D (Đúng):** Chính xác! Ứng dụng cần sử dụng cơ chế cache bí mật và tự động làm mới (refresh) khi gặp lỗi xác thực hoặc hết TTL để chuyển sang cặp user/password mới một cách mượt mà mà không cần khởi động lại ứng dụng.
- **E:** Khởi động lại Aurora DB cluster sẽ gây downtime trực tiếp, hoàn toàn trái ngược với yêu cầu zero downtime.

</details>

### Câu 5 `hard`

A logistics enterprise uses Amazon Macie to discover sensitive data in Amazon S3. In addition to standard PII like credit card numbers, the company needs Macie to detect proprietary internal shipment tracking codes formatted as SHIP- followed by 8 digits whenever the word "confidential" appears nearby, while ignoring test tracking codes such as SHIP-00000000 that appear in QA files. How should the security team configure Amazon Macie?

- **A.** Modify the AWS Managed Data Identifier for Credit Card Numbers to include the SHIP- prefix.
- **B.** Configure Amazon GuardDuty S3 Protection with a custom regex threat list for shipment codes.
- **C.** Create an AWS WAF regex match set and associate it with the S3 bucket to filter sensitive data.
- **D.** Create a Macie Custom Data Identifier (regex SHIP-\d{8}, keyword "confidential") and ignore "SHIP-00000000".

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp logistics sử dụng Amazon Macie để khám phá dữ liệu nhạy cảm trong Amazon S3. Ngoài PII tiêu chuẩn như số thẻ tín dụng, công ty cần Macie phát hiện các mã theo dõi lô hàng nội bộ độc quyền có định dạng SHIP- theo sau là 8 chữ số bất cứ khi nào từ "confidential" xuất hiện gần đó, đồng thời bỏ qua các mã theo dõi thử nghiệm như SHIP-00000000 xuất hiện trong các tệp QA. Nhóm bảo mật nên cấu hình Amazon Macie như thế nào?

**Đáp án đúng:** **D**

Trong **Amazon Macie**, khi cần phát hiện định dạng dữ liệu nội bộ đặc thù của doanh nghiệp, hãy tạo **Custom Data Identifier** (gồm `regex`, `keywords`, `ignore words`, `maximumMatchDistance`), và dùng **Allow Lists** để loại trừ các chuỗi mẫu/test đã biết nhằm giảm cảnh báo giả (false positives).

- **A:** AWS Managed Data Identifiers do AWS quản lý cố định, khách hàng không thể chỉnh sửa biểu thức bên trong chúng.
- **B:** GuardDuty S3 Protection không quét nội dung bên trong file S3 theo regex để tìm mã nội bộ; nó chỉ phân tích hành vi gọi API CloudTrail S3.
- **C:** AWS WAF không thể gắn trực tiếp lên S3 bucket và không dùng để quét phân loại dữ liệu lưu trữ trên S3.
- **D (Đúng):** Chính xác! **Macie Custom Data Identifiers** cho phép định nghĩa mẫu dữ liệu độc quyền bằng biểu thức chính quy (regex), yêu cầu từ khóa lân cận (`keywords` như "confidential") và loại trừ các chuỗi mẫu/giả mạo bằng `ignore words` hoặc **Macie Allow List**.

</details>

### Câu 6 `hard`

A payment processing application stores transaction logs in an Amazon S3 bucket. To comply with PCI DSS 4.0, the security team must enforce at the S3 bucket level that ALL requests use HTTPS AND that any client attempting to connect with deprecated TLS 1.0 or TLS 1.1 protocols is explicitly denied. Which S3 bucket policy statements should the team attach?

- **A.** Add a Deny statement for aws:SecureTransport=false and a second Deny for s3:TlsVersion NumericLessThan 1.2.
- **B.** Add an Allow statement with Bool condition aws:SecureTransport set to true and remove all other Deny statements.
- **C.** Enable S3 Default Encryption with SSE-KMS, which automatically rejects HTTP and TLS 1.1 connections.
- **D.** Configure S3 Block Public Access on the bucket to enforce TLS 1.2 or higher.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng xử lý thanh toán lưu trữ nhật ký giao dịch trong một Amazon S3 bucket. Để tuân thủ PCI DSS 4.0, nhóm bảo mật phải thực thi ở cấp độ S3 bucket rằng TẤT CẢ các request đều sử dụng HTTPS VÀ bất kỳ client nào cố gắng kết nối bằng các giao thức TLS 1.0 hoặc TLS 1.1 lỗi thời đều bị từ chối rõ ràng. Nhóm nên gắn các câu lệnh S3 bucket policy nào?

**Đáp án đúng:** **A**

Để thực thi mã hóa đường truyền (encryption in transit) chuẩn PCI DSS trên S3 Bucket Policy, cần dùng **explicit Deny** kết hợp 2 điều kiện: `Bool: { "aws:SecureTransport": "false" }` (chặn HTTP) và `NumericLessThan: { "s3:TlsVersion": "1.2" }` (chặn TLS 1.0/1.1).

- **A (Đúng):** Chính xác! Mệnh đề Deny với `aws:SecureTransport: false` chặn mọi yêu cầu HTTP không mã hóa, và mệnh đề Deny thứ hai với `NumericLessThan` trên `s3:TlsVersion: 1.2` chặn mọi kết nối HTTPS sử dụng phiên bản TLS cũ (1.0 hoặc 1.1), buộc mọi kết nối phải dùng TLS 1.2 trở lên.
- **B:** Chỉ viết mệnh đề Allow với `aws:SecureTransport: true` KHÔNG chặn được các IAM user/role vốn đã được cấp quyền S3 trong IAM policy của họ truy cập bằng HTTP hoặc TLS 1.0; bắt buộc phải dùng **explicit Deny**.
- **C:** SSE-KMS chỉ mã hóa dữ liệu lúc lưu trữ (encryption at rest), không ngăn chặn giao thức truyền tải không an toàn (HTTP hay TLS cũ) ở tầng kết nối.
- **D:** S3 Block Public Access chỉ chặn cấu hình ACL/policy mở công khai bucket, không kiểm tra phiên bản TLS hay HTTPS.

</details>

### Câu 7 `hard`

An enterprise operates 45 AWS accounts and requires mutual TLS (mTLS) private X.509 certificates for internal microservices running on Application Load Balancers and EC2 instances across all accounts. Deploying a separate AWS Private Certificate Authority (Private CA) in each of the 45 accounts is prohibitively expensive. How should the security team architect a cost-effective, centralized private PKI that allows member accounts to request and automatically renew private certificates via AWS Certificate Manager (ACM)?

- **A.** Request public ACM certificates for internal .corp domains in the Security Tooling account and export their private keys to member accounts.
- **B.** Create a single AWS Private CA in the management account and copy the CA private key into AWS Secrets Manager across all 45 accounts.
- **C.** Deploy a centralized AWS Private CA in the Security Tooling account and share the subordinate CA with the Organization using AWS RAM.
- **D.** Use AWS IAM Server Certificates to automatically issue, distribute, and renew mTLS X.509 certificates across AWS Organizations accounts.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một doanh nghiệp vận hành 45 tài khoản AWS và yêu cầu chứng chỉ X.509 riêng tư cho mutual TLS (mTLS) đối với các microservice nội bộ chạy trên Application Load Balancer và EC2 instance trên tất cả tài khoản. Việc triển khai một AWS Private Certificate Authority (Private CA) riêng biệt trong mỗi tài khoản trong số 45 tài khoản là quá tốn kém. Nhóm bảo mật nên thiết kế một PKI riêng tư tập trung, tiết kiệm chi phí cho phép các tài khoản thành viên yêu cầu và tự động gia hạn chứng chỉ riêng tư qua AWS Certificate Manager (ACM) như thế nào?

**Đáp án đúng:** **C**

Kiến trúc PKI tiết kiệm chi phí và chuẩn hóa trên AWS Organizations: tạo **AWS Private CA** tập trung tại tài khoản Security/Shared Services và chia sẻ qua **AWS RAM** cho các member account để tích hợp trực tiếp với **ACM** (tự động cấp phát và tự động gia hạn chứng chỉ nội bộ).

- **A:** ACM Public CA không cấp chứng chỉ cho tên miền nội bộ không công khai (như `.corp`), và ACM hoàn toàn không cho phép xuất private key của public certificates.
- **B:** Không thể xuất CA private key ra khỏi AWS Private CA, và chia sẻ khóa gốc CA sang 45 tài khoản là sai nguyên tắc bảo mật PKI.
- **C (Đúng):** Chính xác! Triển khai **AWS Private CA** tập trung (Root CA + Subordinate CA) trong tài khoản Security Tooling và chia sẻ Subordinate CA tới toàn bộ AWS Organization qua **AWS RAM** giúp tiết kiệm chi phí hàng chục CA, đồng thời cho phép từng member account dùng ACM cấp phát và tự động gia hạn (auto-renew) chứng chỉ riêng tư trực tiếp.
- **D:** IAM Server Certificates là kho lưu trữ chứng chỉ cũ (legacy), không có chức năng làm CA cấp phát hay tự động gia hạn chứng chỉ.

</details>

### Câu 8 `hard`

A high-traffic media platform stores millions of objects in an Amazon S3 bucket encrypted with SSE-KMS using a Customer Managed Key (CMK). During peak hours, the application experiences HTTP 503 SlowDown and KMS ThrottlingException errors, and the monthly AWS KMS API bill has spiked dramatically. Which change will resolve the throttling and reduce KMS costs with MINIMAL application changes?

- **A.** Migrate the KMS CMK to an AWS CloudHSM Custom Key Store.
- **B.** Switch the bucket encryption from SSE-KMS to SSE-C so clients pass keys on every request.
- **C.** Enable S3 Bucket Keys on the Amazon S3 bucket.
- **D.** Convert the CMK into a KMS Multi-Region Key and replicate it to three Regions.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng phương tiện lưu lượng cao lưu trữ hàng triệu đối tượng trong một Amazon S3 bucket được mã hóa bằng SSE-KMS sử dụng Customer Managed Key (CMK). Trong giờ cao điểm, ứng dụng gặp các lỗi HTTP 503 SlowDown và KMS ThrottlingException, đồng thời hóa đơn AWS KMS API hàng tháng tăng vọt đáng kể. Thay đổi nào sẽ giải quyết tình trạng throttling và giảm chi phí KMS với ÍT thay đổi ứng dụng nhất?

**Đáp án đúng:** **C**

Khi thấy các triệu chứng **S3 + SSE-KMS + KMS ThrottlingException + chi phí KMS tăng vọt**, giải pháp chuẩn xác nhất luôn là bật **S3 Bucket Keys** (lưu ý: chỉ có hiệu lực cho các object mới tạo hoặc được copy lại sau khi bật).

- **A:** CloudHSM Custom Key Store còn có giới hạn thông lượng thấp hơn và chi phí cao hơn nhiều so với KMS tiêu chuẩn.
- **B:** Chuyển sang SSE-C đòi hỏi thay đổi toàn bộ code ứng dụng để tự quản lý và gửi khóa mã hóa trong mọi HTTP header, đồng thời mất khả năng audit trên CloudTrail.
- **C (Đúng):** Chính xác! S3 Bucket Keys cho phép S3 nhận một khóa cấp bucket ngắn hạn từ KMS để tự sinh Data Key cho từng object bên trong S3, giúp giảm tới 99% số lượng lời gọi API tới AWS KMS — vừa hết throttling vừa tiết kiệm chi phí ngay lập tức mà không phải sửa code ứng dụng.
- **D:** Multi-Region Keys dùng để giảm độ trễ giải mã đa Region, không giảm số lượng lời gọi KMS API từ một S3 bucket trong cùng một Region.

</details>

### Câu 9 `medium`

A healthcare company stores customer documents in dozens of Amazon S3 buckets across multiple AWS accounts. To comply with HIPAA and privacy regulations, the security team must automatically discover if any S3 buckets contain unencrypted Personally Identifiable Information (PII) or credit card numbers, and send findings to AWS Security Hub. Which AWS service should be used?

- **A.** Amazon GuardDuty S3 Protection
- **B.** AWS Config with s3-bucket-server-side-encryption-enabled
- **C.** Amazon Inspector
- **D.** Amazon Macie

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty y tế lưu trữ tài liệu khách hàng trong hàng chục Amazon S3 bucket trên nhiều tài khoản AWS. Để tuân thủ HIPAA và các quy định về quyền riêng tư, nhóm bảo mật phải tự động phát hiện xem có bất kỳ S3 bucket nào chứa Thông tin Nhận dạng Cá nhân (PII) hoặc số thẻ tín dụng không được mã hóa hay không, và gửi các finding tới AWS Security Hub. Nên sử dụng dịch vụ AWS nào?

**Đáp án đúng:** **D**

Khi câu hỏi nhắc đến tự động khám phá và phân loại **PII / Sensitive Data** bên trong **Amazon S3**, đáp án duy nhất đúng là **Amazon Macie** (hỗ trợ cả Automated Sensitive Data Discovery liên tục và Sensitive Data Discovery Jobs theo lịch).

- **A:** GuardDuty S3 Protection phân tích S3 Data Events trong CloudTrail để phát hiện hành vi truy cập bất thường (ví dụ truy xuất dữ liệu từ IP độc hại), không quét nội dung file để tìm PII.
- **B:** AWS Config chỉ kiểm tra cấu hình mã hóa của bucket, không có khả năng đọc và phân loại nội dung bên trong object để phát hiện PII hay số thẻ tín dụng.
- **C:** Amazon Inspector quét lỗ hổng phần mềm (CVE) cho EC2, ECR và Lambda, không quét dữ liệu nhạy cảm trên S3.
- **D (Đúng):** Chính xác! Amazon Macie sử dụng Machine Learning và nhận diện mẫu để tự động quét các S3 bucket đa tài khoản (qua Delegated Admin) nhằm phát hiện dữ liệu nhạy cảm (PII, thẻ tín dụng, thông tin y tế, credentials) và đẩy findings lên Security Hub.

</details>

---

[Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md)
