# Bài tập tình huống — AWS KMS Chuyên sâu, Grants, Multi-Region Keys & CloudHSM

> KMS Key Policies vs IAM Policies, KMS Grants, Envelope Encryption, Imported Key Material, Custom Key Store (CloudHSM), Multi-Region Keys & Deletion.
> **Số câu hỏi:** 15 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A security administrator edits the key policy of a Customer Managed AWS KMS key used to encrypt a production Amazon RDS database. By mistake, the administrator removes the default statement granting permissions to the AWS account root user (arn:aws:iam::111122223333:root) and leaves only a single IAM role as the key administrator. One week later, that IAM role is deleted. Now, even the AWS account root user receives an AccessDeniedException when attempting to update the KMS key policy. How can the company regain administrative control over this KMS key?

- **A.** Log in as the AWS account root user and attach an IAM AdministratorAccess policy to override the KMS key policy.
- **B.** Recreate an IAM role with the exact same name so it automatically matches the Principal ARN in the KMS key policy.
- **C.** Schedule the KMS key for deletion and then cancel deletion to reset the key policy to its default state.
- **D.** Contact AWS Support using the AWS account root user credentials to restore access to the unmanageable KMS key.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một quản trị viên bảo mật chỉnh sửa key policy của một Customer Managed AWS KMS key dùng để mã hóa cơ sở dữ liệu Amazon RDS production. Do nhầm lẫn, quản trị viên đã xóa câu lệnh mặc định cấp quyền cho root user của tài khoản AWS (arn:aws:iam::111122223333:root) và chỉ để lại một IAM role duy nhất làm key administrator. Một tuần sau, IAM role đó bị xóa. Hiện tại, ngay cả root user của tài khoản AWS cũng nhận lỗi AccessDeniedException khi cố gắng cập nhật KMS key policy. Công ty có thể giành lại quyền kiểm soát quản trị đối với KMS key này bằng cách nào?

**Đáp án đúng:** **D**

KMS Key Policy Lockout là một tình huống thực tế và rất hay thi trong SCS-C02: (1) Nếu xóa `arn:aws:iam::<account-id>:root` khỏi Key Policy và xóa luôn principal quản trị duy nhất, key trở nên unmanageable, (2) Tạo lại IAM role cùng tên KHÔNG giải quyết được vì KMS lưu Principal Unique ID ngầm, và (3) Cách duy nhất để khôi phục là liên hệ **AWS Support** bằng root user.

- **A:** KMS là dịch vụ đặc biệt: nếu Key Policy KHÔNG có statement cấp quyền cho arn:aws:iam::<account-id>:root, thì mọi IAM policy (kể cả AdministratorAccess) đều KHÔNG có hiệu lực với key đó. Thậm chí root user cũng không thể tự gọi PutKeyPolicy để sửa.
- **B:** Khi một IAM role bị xóa, AWS KMS chuyển ARN trong Key Policy thành Unique Principal ID (ví dụ AROA...) nội bộ; tạo lại role cùng tên sẽ có Unique ID mới hoàn toàn nên vẫn không khớp và không truy cập được key.
- **C:** Không ai có quyền gọi ScheduleKeyDeletion trên một key đã bị lockout, và kể cả có hủy lịch xóa thì hành động đó cũng không reset Key Policy về mặc định.
- **D (Đúng):** Chính xác! Khi KMS key rơi vào trạng thái unmanageable (không còn principal hợp lệ nào có quyền kms:PutKeyPolicy và đã xóa statement của account root), cách DUY NHẤT để khôi phục quyền quản trị key là mở yêu cầu với AWS Support bằng tài khoản root user.

</details>

### Câu 2 `hard`

A SaaS platform encrypts tenant data using a shared Customer Managed KMS key. Whenever a short-lived batch processing job starts for a specific tenant, the platform must programmatically delegate temporary kms:Decrypt permissions to the job's IAM role—strictly scoped to ciphertexts that match EncryptionContextEquals tenant_id=12345—and revoke that access immediately when the job completes, without hitting the 32 KB KMS key policy size limit. Which KMS feature should the architect use?

- **A.** KMS Grants created with a GrantConstraints encryption context and revoked via RetireGrant or RevokeGrant upon job completion.
- **B.** Dynamically append and remove statements in the KMS Key Policy using PutKeyPolicy for every batch job.
- **C.** Create dedicated KMS Key Aliases mapped directly to each tenant's batch processing IAM role.
- **D.** Use AWS KMS Multi-Region Keys and provision a separate replica key for each tenant batch job.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nền tảng SaaS mã hóa dữ liệu của khách hàng bằng một Customer Managed KMS key dùng chung. Mỗi khi một job xử lý hàng loạt ngắn hạn khởi chạy cho một khách hàng cụ thể, nền tảng phải ủy quyền theo chương trình quyền kms:Decrypt tạm thời cho IAM role của job—giới hạn nghiêm ngặt cho các bản mã khớp với EncryptionContextEquals tenant_id=12345—và thu hồi quyền truy cập đó ngay khi job hoàn tất, mà không chạm giới hạn kích thước 32 KB của KMS key policy. Kiến trúc sư nên sử dụng tính năng KMS nào?

**Đáp án đúng:** **A**

KMS Grants là cơ chế ủy quyền linh hoạt bổ trợ cho Key Policy: lý tưởng cho các kịch bản cấp quyền tạm thời theo lập trình (như EBS/RDS/workloads ngắn hạn), không làm phình Key Policy (giới hạn 32 KB), hỗ trợ `GrantConstraints` (ràng buộc `EncryptionContext`), và thu hồi ngay lập tức bằng `RetireGrant` hoặc `RevokeGrant`.

- **A (Đúng):** Chính xác! KMS Grants được thiết kế cho việc ủy quyền tạm thời và theo lập trình (programmatic delegation) mà không cần sửa Key Policy (tránh giới hạn 32 KB của Key Policy), hỗ trợ GrantConstraints (EncryptionContextEquals / EncryptionContextSubset) và có thể thu hồi tức thì qua RetireGrant/RevokeGrant.
- **B:** Sửa Key Policy liên tục dễ chạm giới hạn 32 KB, gây race condition khi nhiều batch job chạy đồng thời và không phải mẫu thiết kế được khuyến nghị cho ủy quyền tạm thời.
- **C:** KMS Key Alias chỉ là tên thân thiện trỏ đến KMS key, không cung cấp cơ chế ủy quyền tạm thời hay ràng buộc EncryptionContext cho từng batch job.
- **D:** Multi-Region Keys dùng để mã hóa/giải mã dữ liệu đồng bộ giữa các AWS Region khác nhau, không dùng để ủy quyền tạm thời cho từng batch job.

</details>

### Câu 3 `hard`

A defense contractor must migrate a highly regulated application to AWS with two distinct cryptographic requirements:
1) Cryptographic operations for System A must execute exclusively inside single-tenant, FIPS 140-2 Level 3 validated hardware security modules directly controlled by the customer, while still integrating natively with Amazon EBS and Amazon RDS via AWS KMS APIs.
2) System B requires the ability to generate key material on-premises, import it into AWS KMS, and immediately render encrypted data unreadable within seconds if an emergency occurs.
Which TWO AWS KMS key origin options satisfy System A and System B respectively? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** For System A, use standard AWS KMS multi-tenant HSMs with AWS managed keys.
- **B.** For System A, create an AWS KMS Custom Key Store backed by an AWS CloudHSM cluster.
- **C.** For System B, create a standard AWS KMS Customer Managed Key and call ScheduleKeyDeletion with a 0-day waiting period.
- **D.** For System B, use AWS KMS Multi-Region Keys to delete key material instantly across all Regions.
- **E.** For System B, use External (Imported) Key Material and call DeleteImportedKeyMaterial for instant erasure.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà thầu quốc phòng phải di chuyển một ứng dụng được quản lý chặt chẽ lên AWS với hai yêu cầu mật mã riêng biệt:
> 1) Các thao tác mật mã cho Hệ thống A phải thực thi độc quyền bên trong các mô-đun bảo mật phần cứng (HSM) đơn thuê đạt chuẩn FIPS 140-2 Level 3 do khách hàng trực tiếp kiểm soát, đồng thời vẫn tích hợp nguyên bản với Amazon EBS và Amazon RDS qua AWS KMS API.
> 2) Hệ thống B yêu cầu khả năng tạo vật liệu khóa tại chỗ (on-premises), nhập vào AWS KMS và ngay lập tức làm cho dữ liệu đã mã hóa không thể đọc được trong vài giây nếu xảy ra trường hợp khẩn cấp.
> HAI tùy chọn nguồn khóa AWS KMS nào đáp ứng Hệ thống A và Hệ thống B tương ứng? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, E**

Nắm vững 3 nguồn gốc (Key Material Origin) của AWS KMS: (1) `AWS_KMS` (multi-tenant HSM, hỗ trợ xoay vòng tự động, chờ xóa 7–30 ngày), (2) `EXTERNAL` / Imported Key Material (BYOK, xóa tức thì bằng `DeleteImportedKeyMaterial`, không hỗ trợ auto-rotation), và (3) `AWS_CLOUDHSM` Custom Key Store (single-tenant FIPS 140-2 Level 3 HSM tích hợp KMS API).

- **A:** KMS tiêu chuẩn sử dụng HSM dùng chung (multi-tenant), không đáp ứng yêu cầu single-tenant HSM của System A.
- **B (Đúng):** Chính xác! AWS KMS Custom Key Store kết hợp với AWS CloudHSM cluster giúp toàn bộ key material được lưu trữ và thực thi mật mã trên phần cứng HSM đơn khách hàng (single-tenant) đạt chuẩn FIPS 140-2 Level 3 do khách hàng kiểm soát, đồng thời vẫn dùng được API KMS với các dịch vụ như EBS, RDS, S3.
- **C:** ScheduleKeyDeletion trong AWS KMS bắt buộc thời gian chờ tối thiểu là 7 ngày (tối đa 30 ngày), không hỗ trợ 0 ngày.
- **D:** Multi-Region Keys sinh key material trong AWS KMS vẫn chịu thời gian chờ xóa tối thiểu 7 ngày khi xóa key, không đáp ứng yêu cầu sinh key tại on-premises và xóa tức thì.
- **E (Đúng):** Chính xác! KMS Imported Key Material (BYOK) cho phép sinh key material tại on-premises, nhập vào KMS và xóa ngay lập tức trong vài giây bằng API DeleteImportedKeyMaterial mà không phải chờ thời gian chờ xóa 7–30 ngày như KMS key thông thường.

</details>

### Câu 4 `hard`

A global fintech application runs active-active in us-east-1 and eu-west-1 using Amazon DynamoDB Global Tables and client-side encryption via the AWS Encryption SDK. Data encrypted in us-east-1 is replicated to eu-west-1 and must be decrypted locally in eu-west-1 with ultra-low latency and without making cross-Region AWS KMS API calls, even if us-east-1 experiences a complete regional outage. Which AWS KMS feature should the architect use?

- **A.** Create two independent single-Region Customer Managed Keys with the same Key Alias in us-east-1 and eu-west-1.
- **B.** Use a single-Region Customer Managed Key in us-east-1 and configure VPC Peering so eu-west-1 applications call the us-east-1 KMS endpoint.
- **C.** Use KMS Multi-Region Keys (Primary in us-east-1, Replica in eu-west-1) sharing the same key ID and key material.
- **D.** Use AWS CloudHSM with manual backup copy to S3 Cross-Region Replication.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng fintech toàn cầu chạy active-active tại us-east-1 và eu-west-1 sử dụng Amazon DynamoDB Global Tables và mã hóa phía máy khách thông qua AWS Encryption SDK. Dữ liệu được mã hóa tại us-east-1 được sao chép sang eu-west-1 và phải được giải mã cục bộ tại eu-west-1 với độ trễ cực thấp và không thực hiện các lệnh gọi AWS KMS API cross-Region, ngay cả khi us-east-1 gặp sự cố gián đoạn toàn vùng. Kiến trúc sư nên sử dụng tính năng AWS KMS nào?

**Đáp án đúng:** **C**

**AWS KMS Multi-Region Keys** (`mrk-...`) là giải pháp chuẩn cho kiến trúc Active-Active đa Region (DynamoDB Global Tables, Aurora Global Database, S3 CRR, client-side AWS Encryption SDK): mã hóa ở Region A và giải mã cục bộ tại Region B không cần cross-Region API call, có khả năng độc lập quản lý Key Policy riêng ở mỗi Region.

- **A:** Hai single-Region KMS key độc lập có key material hoàn toàn khác nhau dù đặt cùng Alias, nên key ở eu-west-1 không thể giải mã ciphertext được mã hóa bởi key ở us-east-1.
- **B:** Gọi API KMS xuyên Region làm tăng độ trễ và vi phạm yêu cầu phải giải mã được cục bộ ngay cả khi us-east-1 gặp sự cố toàn vùng.
- **C (Đúng):** Chính xác! AWS KMS Multi-Region Keys (có tiền tố mrk-) chia sẻ cùng Key ID và cùng key material giữa Primary Key (us-east-1) và Replica Key (eu-west-1), cho phép mã hóa ở một Region và giải mã cục bộ ở Region khác mà không cần gọi API KMS xuyên Region và vẫn hoạt động bình thường khi us-east-1 gặp sự cố.
- **D:** Sao chép backup CloudHSM thủ công không đáp ứng yêu cầu giải mã active-active tức thời tích hợp đơn giản với AWS Encryption SDK như KMS Multi-Region Keys.

</details>

### Câu 5 `hard`

A security architect is comparing AWS KMS key configurations for a compliance audit. Which TWO statements accurately describe the behavior and limitations of AWS KMS Imported Key Material (BYOK) and CloudHSM Custom Key Stores? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** AWS KMS automatically backs up imported key material across multiple Regions so customers never need to keep an on-premises copy.
- **B.** When using a CloudHSM custom key store, AWS Support can recover lost key material from the CloudHSM cluster if the customer loses all Crypto Officer (CO) credentials.
- **C.** Auto-rotation is unsupported for BYOK and CloudHSM custom key stores; rotate manually by creating a new key and updating aliases.
- **D.** Enabling automatic key rotation on an AWS_KMS symmetric key automatically re-encrypts all existing data stored in Amazon S3 and Amazon EBS.
- **E.** If imported key material is deleted or expires, only the exact original key material can be re-imported into that KMS key ID.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kiến trúc sư bảo mật đang so sánh các cấu hình AWS KMS key cho một đợt kiểm toán tuân thủ. HAI phát biểu nào mô tả chính xác hành vi và giới hạn của AWS KMS Imported Key Material (BYOK) và CloudHSM Custom Key Stores? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Các quy tắc cốt lõi về **KMS Key Rotation & Imported Key Material** rất hay kiểm tra trong SCS-C02: (1) Auto-rotation CHỈ hỗ trợ symmetric `AWS_KMS` CMK (không hỗ trợ BYOK, CloudHSM, Asymmetric, HMAC), (2) Auto-rotation không tự re-encrypt dữ liệu cũ, (3) Imported Key Material khi re-import bắt buộc phải là **đúng key material gốc ban đầu**, và khách hàng tự chịu trách nhiệm sao lưu key gốc.

- **A:** Sai! AWS KMS KHÔNG đảm bảo độ bền lâu dài giống như AWS_KMS key cho imported key material và khách hàng hoàn toàn chịu trách nhiệm lưu giữ bản sao lưu an toàn của key material gốc tại on-premises.
- **B:** AWS CloudHSM là single-tenant HSM do khách hàng quản lý hoàn toàn; AWS KHÔNG có quyền truy cập vào key material hay khôi phục mật khẩu Crypto Officer (CO) nếu khách hàng làm mất.
- **C (Đúng):** Chính xác! Tính năng automatic key rotation của AWS KMS chỉ hỗ trợ cho symmetric Customer Managed Keys có nguồn gốc AWS_KMS (do AWS KMS sinh ra). Với Imported Key Material (EXTERNAL), Asymmetric keys, HMAC keys và CloudHSM Custom Key Store, phải thực hiện xoay vòng thủ công (tạo key mới và trỏ lại Alias).
- **D:** Automatic key rotation trong KMS chỉ tạo phiên bản key material mới cho dữ liệu mã hóa MỚI và giữ nguyên các phiên bản cũ để giải mã dữ liệu cũ; nó KHÔNG tự động re-encrypt dữ liệu đã lưu sẵn trên S3 hay EBS.
- **E (Đúng):** Chính xác! Một khi đã nhập key material vào một KMS key ID, KMS gắn chặt key ID đó với đúng key material ban đầu. Nếu xóa hoặc hết hạn, bạn CHỈ có thể nhập lại đúng bản sao lưu key material gốc ban đầu (không thể nhập một key material mới khác vào cùng key ID đó).

</details>

### Câu 6 `hard`

A regulated European bank must store sensitive customer records in Amazon S3 and Amazon EBS encrypted with AWS KMS, but local financial regulations mandate that the cryptographic keys must reside exclusively inside the bank's on-premises Hardware Security Modules (HSMs) and that every encryption and decryption operation must occur on-premises outside AWS data centers. Which AWS KMS feature satisfies this requirement?

- **A.** Create an AWS KMS Custom Key Store backed by an AWS CloudHSM cluster in the same AWS Region.
- **B.** Import the bank's on-premises key material into an AWS KMS key using the EXTERNAL key material origin.
- **C.** Create an AWS KMS External Key Store (XKS) connected via an External Key Store proxy to the bank's on-premises HSMs.
- **D.** Enable S3 Server-Side Encryption with Customer-Provided Keys (SSE-C) for both Amazon S3 and Amazon EBS.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ngân hàng châu Âu được quản lý chặt chẽ phải lưu trữ hồ sơ khách hàng nhạy cảm trong Amazon S3 và Amazon EBS được mã hóa bằng AWS KMS, nhưng quy định tài chính địa phương bắt buộc các khóa mật mã phải nằm độc quyền bên trong các Mô-đun Bảo mật Phần cứng (HSM) tại chỗ của ngân hàng và mọi thao tác mã hóa và giải mã phải diễn ra tại chỗ bên ngoài các trung tâm dữ liệu AWS. Tính năng AWS KMS nào đáp ứng yêu cầu này?

**Đáp án đúng:** **C**

Phân biệt 3 mô hình khóa nâng cao của KMS: **Imported Key Material** (BYOK - khóa nạp vào HSM của AWS), **CloudHSM Custom Key Store** (HSM single-tenant nằm trong AWS), và **External Key Store (XKS)** (khóa nằm hoàn toàn trên HSM bên ngoài AWS / on-premises, kết nối qua XKS Proxy).

- **A:** CloudHSM Custom Key Store lưu khóa trên HSM chuyên dụng nhưng HSM này vẫn nằm trong trung tâm dữ liệu AWS, không đáp ứng yêu cầu lưu khóa và thực thi mật mã hoàn toàn ở on-premises ngoài AWS.
- **B:** Imported Key Material (BYOK) sao chép bản sao khóa vào trong KMS HSM của AWS và thực hiện mã hóa/giải mã bên trong AWS, vi phạm yêu cầu khóa chỉ tồn tại và xử lý ở on-premises.
- **C (Đúng):** Chính xác! AWS KMS External Key Store (XKS) kết nối KMS với HSM bên ngoài AWS (on-premises hoặc colocation) thông qua XKS Proxy, đảm bảo key material không bao giờ rời khỏi HSM on-premises và mọi phép toán mật mã đều thực thi bên ngoài trung tâm dữ liệu AWS.
- **D:** SSE-C gửi khóa mã hóa lên S3 để AWS thực hiện mã hóa trên hạ tầng AWS, và Amazon EBS hoàn toàn không hỗ trợ SSE-C.

</details>

### Câu 7 `hard`

A company encrypts sensitive objects in an Amazon S3 bucket using a customer managed AWS KMS key. A data analytics IAM role has kms:Decrypt permissions on the KMS key, but the security team wants to ensure that the role can ONLY use this KMS key when accessing data through Amazon S3 in us-east-1—preventing the role from calling kms:Decrypt directly via the AWS CLI on arbitrary ciphertexts. Which condition key should be added to the KMS key policy?

- **A.** Add a StringEquals condition requiring aws:CalledVia to equal ec2.amazonaws.com.
- **B.** Add a StringEquals condition requiring kms:CallerAccount to equal the S3 service principal account ID.
- **C.** Add a Bool condition requiring kms:GrantIsForAWSResource to be true on the Decrypt statement.
- **D.** Add a StringEquals condition requiring kms:ViaService to equal s3.us-east-1.amazonaws.com.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty mã hóa các đối tượng nhạy cảm trong một Amazon S3 bucket bằng customer managed AWS KMS key. Một IAM role phân tích dữ liệu có quyền kms:Decrypt trên KMS key đó, nhưng nhóm bảo mật muốn đảm bảo role này CHỈ có thể sử dụng KMS key này khi truy cập dữ liệu thông qua Amazon S3 tại us-east-1—ngăn role gọi trực tiếp kms:Decrypt qua AWS CLI trên các bản mã tùy ý. Nên thêm condition key nào vào KMS key policy?

**Đáp án đúng:** **D**

Điều kiện **`kms:ViaService`** (ví dụ `s3.us-east-1.amazonaws.com`) trong KMS Key Policy hoặc IAM Policy là cơ chế chuẩn để buộc mọi thao tác sử dụng khóa (như `kms:Decrypt`, `kms:GenerateDataKey`) phải đi qua một dịch vụ AWS cụ thể ở một Region cụ thể, ngăn lạm dụng khóa trực tiếp qua API/CLI.

- **A:** Yêu cầu chỉ cho phép giải mã thông qua Amazon S3 ở `us-east-1`, không phải `ec2.amazonaws.com`.
- **B:** `kms:CallerAccount` kiểm tra AWS Account ID của người gọi (principal), không giới hạn dịch vụ trung gian được phép gọi KMS.
- **C:** `kms:GrantIsForAWSResource` chỉ áp dụng cho hành động tạo grant (`kms:CreateGrant`) cho dịch vụ AWS, không kiểm soát hành động `kms:Decrypt` thông thường.
- **D (Đúng):** Chính xác! Điều kiện `kms:ViaService` giới hạn việc sử dụng KMS key chỉ được phép khi yêu cầu được chuyển tiếp thông qua dịch vụ AWS cụ thể tại Region chỉ định (`s3.us-east-1.amazonaws.com`), chặn mọi lệnh gọi trực tiếp `kms:Decrypt` từ AWS CLI hoặc dịch vụ khác.

</details>

### Câu 8 `hard`

A healthcare company processes highly sensitive patient genomic data inside Amazon EC2 instances. Even AWS administrators with root SSH or SSM access to the EC2 host operating system must NOT be able to inspect the plaintext data in memory or decrypt the KMS-encrypted genomic files. Only a specific, cryptographically verified application binary should be authorized by AWS KMS to decrypt the data. Which architecture meets this requirement?

- **A.** Run the app in an AWS Nitro Enclave and restrict the KMS key policy using kms:RecipientAttestation:ImageSha384 (PCR0).
- **B.** Store the genomic data on an encrypted EBS volume and revoke ssm:StartSession permissions from all EC2 administrators.
- **C.** Use AWS KMS Encryption Context containing the application's filename in the key policy.
- **D.** Deploy the application on AWS Fargate with EBS encryption enabled and use a VPC Endpoint for KMS.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty y tế xử lý dữ liệu bộ gen bệnh nhân cực kỳ nhạy cảm bên trong các Amazon EC2 instance. Ngay cả các quản trị viên AWS có quyền root SSH hoặc SSM vào hệ điều hành máy chủ EC2 cũng KHÔNG ĐƯỢC PHÉP kiểm tra dữ liệu văn bản thuần trong bộ nhớ hoặc giải mã các tệp bộ gen được mã hóa bằng KMS. Chỉ một tệp nhị phân ứng dụng cụ thể, được xác minh bằng mật mã mới được AWS KMS ủy quyền giải mã dữ liệu. Kiến trúc nào đáp ứng yêu cầu này?

**Đáp án đúng:** **A**

**AWS Nitro Enclaves** cung cấp môi trường cô lập phần cứng không có truy cập tương tác (no SSH/root access). Tích hợp **KMS Cryptographic Attestation** kiểm tra giá trị băm **PCR0** (`kms:RecipientAttestation:ImageSha384`) trong KMS Key Policy đảm bảo chỉ đúng Enclave image đã được phê duyệt mới có thể nhận plaintext từ KMS.

- **A (Đúng):** Chính xác! AWS Nitro Enclaves tạo môi trường tính toán cô lập hoàn toàn (không có SSH, không có bộ nhớ dùng chung hay ổ đĩa lưu trữ với EC2 host). Khi Enclave gửi yêu cầu giải mã tới KMS kèm tài liệu chứng thực mật mã (attestation document), KMS kiểm tra mã băm PCR0 (`kms:RecipientAttestation:ImageSha384`) trong key policy và trả về dữ liệu được mã hóa bằng public key của chính Enclave nên ngay cả root trên EC2 host cũng không đọc được.
- **B:** Thu hồi SSM không bảo vệ dữ liệu trong bộ nhớ RAM trước các admin có quyền khác hoặc quy trình trên host, cũng không xác thực mật mã đối với binary ứng dụng ở tầng KMS.
- **C:** Encryption Context chỉ là cặp key-value văn bản do người gọi tự truyền vào nên bất kỳ ai có quyền KMS đều có thể giả mạo chuỗi tên file đó; nó không cung cấp chứng thực mật mã phần cứng như Nitro Enclaves.
- **D:** Fargate không cung cấp cơ chế cryptographic attestation (PCR0) tích hợp trực tiếp với điều kiện `kms:RecipientAttestation` của KMS để khóa quyền giải mã vào duy nhất một binary đã kiểm chứng.

</details>

### Câu 9 `hard`

A software company distributes firmware updates to millions of IoT devices. The company wants to digitally sign each firmware package inside AWS so that the private signing key NEVER leaves FIPS 140-2/140-3 validated hardware security modules, while allowing IoT devices in the field to verify the firmware signature offline using the corresponding public key without calling AWS APIs. Which AWS KMS configuration meets this requirement?

- **A.** Create a symmetric AWS KMS key, generate an HMAC tag using kms:GenerateMac, and embed the symmetric key in the IoT devices for offline verification.
- **B.** Create an asymmetric KMS key (SIGN_VERIFY), sign digests via kms:Sign, and embed the kms:GetPublicKey output in IoT devices.
- **C.** Create an asymmetric AWS KMS key with key usage set to ENCRYPT_DECRYPT and use kms:Sign to generate firmware signatures.
- **D.** Use AWS KMS GenerateDataKey to create a data key pair and export the private key to an S3 bucket for the CI/CD pipeline.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty phần mềm phân phối các bản cập nhật firmware tới hàng triệu thiết bị IoT. Công ty muốn ký số từng gói firmware bên trong AWS sao cho khóa ký riêng tư KHÔNG BAO GIỜ rời khỏi các mô-đun bảo mật phần cứng đạt chuẩn FIPS 140-2/140-3, đồng thời cho phép các thiết bị IoT ngoài thực tế xác minh chữ ký firmware ngoại tuyến bằng khóa công khai tương ứng mà không cần gọi AWS API. Cấu hình AWS KMS nào đáp ứng yêu cầu này?

**Đáp án đúng:** **B**

Với bài toán **ký số (digital signing)** và **xác minh offline** bằng public key: tạo **Asymmetric KMS Key** với `KeyUsage = SIGN_VERIFY` (RSA hoặc ECC), dùng `kms:Sign` (truyền digest nếu payload > 4 KB) và phân phối public key qua `kms:GetPublicKey`. Private key không bao giờ rời khỏi KMS HSM.

- **A:** KMS không bao giờ cho phép xuất (export) khóa đối xứng ra ngoài HSM để nhúng vào thiết bị IoT; và ngay cả khi nhúng khóa bí mật vào thiết bị thì kẻ tấn công trích xuất được sẽ giả mạo được chữ ký.
- **B (Đúng):** Chính xác! Khóa bất đối xứng (Asymmetric KMS Key) với `KeyUsage = SIGN_VERIFY` giữ khóa bí mật (private key) an toàn tuyệt đối bên trong HSM của AWS KMS (không bao giờ xuất ra ngoài). Hệ thống build ký bằng `kms:Sign`, còn thiết bị IoT chỉ cần nhúng public key (lấy từ `kms:GetPublicKey`) để xác minh chữ ký hoàn toàn offline.
- **C:** Trong AWS KMS, một khóa bất đối xứng chỉ được chọn MỘT mục đích sử dụng cố định khi tạo (`ENCRYPT_DECRYPT` hoặc `SIGN_VERIFY`); khóa `ENCRYPT_DECRYPT` không thể dùng cho API `kms:Sign`.
- **D:** Xuất private key ra S3 vi phạm yêu cầu khóa bí mật không bao giờ rời khỏi HSM.

</details>

### Câu 10 `hard`

A multi-tenant application encrypts each customer's database records using a shared AWS KMS symmetric key. The security architect wants to ensure that even if a malicious insider swaps the encrypted ciphertext of Tenant A's record into Tenant B's database row, decrypting Tenant B's row will fail cryptographically—and also wants to restrict an IAM role in the KMS key policy so it can ONLY decrypt records belonging to Tenant B. Which KMS feature should the architect use?

- **A.** Store the tenant ID in the KMS key's AWS resource tags and pass it in the CloudTrail userAgent string.
- **B.** Use KMS Key Aliases named after each tenant to prevent ciphertext swapping between database rows.
- **C.** Pass TenantID as KMS Encryption Context on Encrypt/Decrypt and enforce kms:EncryptionContext:TenantID in the key policy.
- **D.** Enable automatic annual key rotation on the shared symmetric AWS KMS key.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng đa khách hàng (multi-tenant) mã hóa các bản ghi cơ sở dữ liệu của từng khách hàng bằng một khóa đối xứng AWS KMS dùng chung. Kiến trúc sư bảo mật muốn đảm bảo rằng ngay cả khi một kẻ nội gián độc hại tráo đổi bản mã đã mã hóa của bản ghi Khách hàng A vào hàng cơ sở dữ liệu của Khách hàng B, việc giải mã hàng của Khách hàng B sẽ thất bại về mặt mật mã—và cũng muốn giới hạn một IAM role trong KMS key policy để nó CHỈ có thể giải mã các bản ghi thuộc về Khách hàng B. Kiến trúc sư nên sử dụng tính năng KMS nào?

**Đáp án đúng:** **C**

**AWS KMS Encryption Context** đóng vai trò **Additional Authenticated Data (AAD)** trong mã hóa xác thực (authenticated encryption): (1) Bảo vệ tính toàn vẹn và chống tráo đổi bản mã (ciphertext tampering/swapping); (2) Dùng làm điều kiện phân quyền chi tiết (`kms:EncryptionContext:<key>`) trong Key Policy/IAM Policy; (3) Ghi lại dạng rõ trong CloudTrail để kiểm toán (lưu ý: không đặt dữ liệu bí mật vào Encryption Context vì nó xuất hiện dạng plaintext trong CloudTrail).

- **A:** Resource tag của KMS key chỉ mô tả chính khóa đó, không gắn vào từng bản mã (ciphertext) và không ngăn được hành vi tráo đổi bản mã giữa các bản ghi.
- **B:** Key Alias chỉ là tên thân thiện trỏ về cùng một KMS key; nó không tham gia vào phép toán mật mã xác thực (AAD) nên không ngăn được tráo đổi ciphertext.
- **C (Đúng):** Chính xác! **KMS Encryption Context** là dữ liệu xác thực bổ sung (Additional Authenticated Data - AAD) được gắn mật mã vào bản mã (ciphertext): nếu bản mã của Tenant A bị tráo sang hàng của Tenant B và giải mã với `TenantID=TenantB`, KMS sẽ báo lỗi `InvalidCiphertextException`. Đồng thời có thể dùng điều kiện `kms:EncryptionContext:TenantID` trong key policy để giới hạn quyền giải mã theo từng tenant.
- **D:** Xoay vòng khóa tự động không ngăn được việc tráo đổi bản mã giữa các bản ghi của các tenant dùng chung khóa.

</details>

### Câu 11 `hard`

A data processing service dynamically spawns short-lived worker IAM roles that need temporary kms:Decrypt access to a customer managed AWS KMS key—ONLY when a specific Encryption Context is present—and must lose access as soon as their batch job finishes, without repeatedly modifying the KMS key policy (which is subject to a 32 KB size limit and eventual consistency). Which AWS KMS mechanism is designed for this programmatic temporary delegation?

- **A.** Create KMS Grants via kms:CreateGrant with EncryptionContextEquals constraints and a RetiringPrincipal to retire access after job completion.
- **B.** Dynamically append and remove JSON principal statements in the KMS Key Policy via kms:PutKeyPolicy for every individual batch job run.
- **C.** Create a dedicated customer managed KMS key for every short-lived batch job and schedule each temporary key for deletion afterward.
- **D.** Export and share the KMS key's raw symmetric key material with each short-lived worker role via AWS Secrets Manager secrets.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một dịch vụ xử lý dữ liệu tự động tạo các worker IAM role ngắn hạn cần quyền truy cập kms:Decrypt tạm thời tới một customer managed AWS KMS key—CHỈ KHI có một Encryption Context cụ thể—và phải mất quyền truy cập ngay khi batch job của chúng kết thúc, mà không phải sửa đổi lặp đi lặp lại KMS key policy (vốn bị giới hạn kích thước 32 KB và tính nhất quán cuối cùng). Cơ chế AWS KMS nào được thiết kế cho việc ủy quyền tạm thời theo chương trình này?

**Đáp án đúng:** **A**

**AWS KMS Grants** là cơ chế ủy quyền tạm thời, có thể lập trình (programmatic) mà không cần sửa đổi KMS Key Policy. Grant hỗ trợ **GranteePrincipal**, **RetiringPrincipal**, và **GrantConstraints** (bắt buộc khớp Encryption Context) và có thể thu hồi tức thì qua `RetireGrant` hoặc `RevokeGrant`.

- **A (Đúng):** Chính xác! **AWS KMS Grants** được thiết kế cho việc cấp quyền tạm thời theo chương trình (programmatic delegation) mà không cần chỉnh sửa KMS Key Policy (tránh giới hạn 32 KB của Key Policy). Grant hỗ trợ `GrantConstraints` (bắt buộc đúng Encryption Context) và `RetiringPrincipal` để thu hồi quyền ngay khi batch job hoàn tất.
- **B:** Liên tục gọi `kms:PutKeyPolicy` cho từng batch job vừa dễ chạm giới hạn 32 KB của Key Policy, vừa có nguy cơ race condition/ghi đè policy khi nhiều job chạy đồng thời.
- **C:** Dữ liệu đã được mã hóa sẵn bằng KMS key hiện tại; tạo khóa mới không thể giải mã dữ liệu cũ, chưa kể tốn chi phí và phải chờ tối thiểu 7 ngày để xóa khóa.
- **D:** AWS KMS không bao giờ cho phép xuất (export) raw key material ra khỏi HSM.

</details>

### Câu 12 `hard`

A global financial application uses client-side encryption with the AWS Encryption SDK to encrypt sensitive records in us-east-1 and replicates the encrypted records to eu-west-1 via Amazon DynamoDB Global Tables. To meet strict latency and disaster recovery requirements, applications in eu-west-1 must be able to decrypt the replicated records locally using eu-west-1 KMS endpoints—WITHOUT making cross-Region network calls to us-east-1 and WITHOUT re-encrypting the data during replication. Which AWS KMS feature enables this?

- **A.** Create two separate single-Region AWS KMS keys in us-east-1 and eu-west-1 configured with the exact same key alias name.
- **B.** Create an AWS KMS Multi-Region primary key in us-east-1 and replicate it to eu-west-1 with the same mrk- key ID and key material.
- **C.** Use an AWS-managed aws/dynamodb key because AWS automatically replicates aws/dynamodb key material across all Regions.
- **D.** Export the key material from the us-east-1 KMS key and import it into eu-west-1 using the kms:ImportKeyMaterial API.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng tài chính toàn cầu sử dụng mã hóa phía máy khách với AWS Encryption SDK để mã hóa các bản ghi nhạy cảm tại us-east-1 và sao chép các bản ghi đã mã hóa sang eu-west-1 thông qua Amazon DynamoDB Global Tables. Để đáp ứng các yêu cầu nghiêm ngặt về độ trễ và khôi phục sau thảm họa, các ứng dụng tại eu-west-1 phải có thể giải mã cục bộ các bản ghi được sao chép bằng các KMS endpoint tại eu-west-1—MÀ KHÔNG thực hiện các cuộc gọi mạng cross-Region tới us-east-1 và KHÔNG mã hóa lại dữ liệu trong quá trình sao chép. Tính năng AWS KMS nào cho phép điều này?

**Đáp án đúng:** **B**

**AWS KMS Multi-Region Keys (`mrk-...`)** là khóa liên vùng có chung Key ID và key material nhưng vẫn giữ Key Policy, Grants, Tags và trạng thái độc lập ở từng Region. Cực kỳ lý tưởng cho **Client-Side Encryption + Global Tables / S3 CRR / Active-Active DR** giúp mã hóa ở Region A và giải mã cục bộ ở Region B không cần gọi xuyên Region.

- **A:** Hai single-Region KMS key dù đặt cùng Alias vẫn có key material và Key ID hoàn toàn khác nhau, nên khóa ở `eu-west-1` không thể giải mã dữ liệu đã mã hóa bởi khóa ở `us-east-1`.
- **B (Đúng):** Chính xác! **AWS KMS Multi-Region Keys** (có tiền tố `mrk-`) cho phép tạo khóa chính ở một Region và nhân bản (replicate) sang các Region khác với **cùng Key ID và cùng key material**, giúp bản mã tạo ra ở `us-east-1` có thể được giải mã trực tiếp và cục bộ tại `eu-west-1` mà không cần gọi API xuyên Region hay mã hóa lại dữ liệu.
- **C:** AWS managed keys luôn là single-Region key với key material riêng biệt ở từng Region, và không thể dùng cho client-side encryption với AWS Encryption SDK.
- **D:** KMS không bao giờ cho phép xuất (export) key material từ một KMS key đã tạo.

</details>

### Câu 13 `hard`

A company configures Amazon S3 Cross-Region Replication (CRR) to replicate objects encrypted with a customer managed AWS KMS key (SSE-KMS) from a source bucket in us-east-1 to a destination bucket in eu-central-1. Although S3 Versioning is enabled on both buckets, newly uploaded SSE-KMS objects are failing to replicate while unencrypted test objects replicate successfully. Which TWO configuration steps are required to fix SSE-KMS object replication? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Disable S3 Bucket Keys on both the source and destination buckets because S3 CRR does not support S3 Bucket Keys for replication.
- **B.** Change the source bucket encryption to SSE-C because S3 CRR automatically replicates SSE-C encrypted objects across AWS Regions.
- **C.** Enable "Replicate objects encrypted with AWS KMS" in the S3 replication rule and specify the destination KMS key in eu-central-1.
- **D.** Grant the s3.amazonaws.com service principal the kms:ScheduleKeyDeletion permission on the source KMS key in us-east-1.
- **E.** Grant the S3 replication IAM role kms:Decrypt on the source KMS key in us-east-1 and kms:Encrypt on the destination KMS key.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty cấu hình Amazon S3 Cross-Region Replication (CRR) để sao chép các đối tượng được mã hóa bằng customer managed AWS KMS key (SSE-KMS) từ một source bucket tại us-east-1 sang một destination bucket tại eu-central-1. Mặc dù S3 Versioning đã được bật trên cả hai bucket, các đối tượng SSE-KMS mới tải lên vẫn không thể sao chép trong khi các đối tượng thử nghiệm không mã hóa sao chép thành công. Cần HAI bước cấu hình nào để khắc phục việc sao chép đối tượng SSE-KMS? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Checklist khắc phục sự cố **S3 CRR với SSE-KMS**: (1) Bật **Versioning** trên cả 2 bucket; (2) Bật rõ tùy chọn **Replicate objects encrypted with AWS KMS** và chọn destination KMS key; (3) Cấp cho Replication IAM Role quyền **`kms:Decrypt`** trên khóa nguồn và **`kms:Encrypt`** trên khóa đích. Lưu ý: S3 CRR **không** hỗ trợ SSE-C.

- **A:** S3 CRR hỗ trợ hoàn toàn S3 Bucket Keys (thậm chí S3 Bucket Keys còn giúp giảm mạnh chi phí gọi KMS API khi nhân bản lượng lớn object).
- **B:** Ngược lại, Amazon S3 CRR hoàn toàn KHÔNG hỗ trợ nhân bản các object được mã hóa bằng **SSE-C** (vì AWS không lưu trữ khóa của khách hàng).
- **C (Đúng):** Chính xác! Mặc định S3 Replication KHÔNG tự động nhân bản các object mã hóa bằng SSE-KMS; bắt buộc phải bật tùy chọn **Replicate objects encrypted with AWS KMS** trong replication rule và chỉ định KMS key đích tại Region `eu-central-1`.
- **D:** S3 replication hoàn toàn không cần và không bao giờ nên được cấp quyền hủy khóa (`kms:ScheduleKeyDeletion`).
- **E (Đúng):** Chính xác! Trong quá trình nhân bản SSE-KMS, S3 dùng replication IAM role để giải mã object bằng KMS key nguồn (`kms:Decrypt`) và mã hóa lại bằng KMS key đích (`kms:Encrypt`). Thiếu một trong hai quyền này sẽ khiến replication thất bại.

</details>

### Câu 14 `hard`

A data engineering team in Account A encrypts an Amazon EBS volume using the default AWS managed key (aws/ebs) and creates a snapshot to share with a forensic analysis team in Account B. However, when attempting to share the snapshot with Account B, the operation fails. What is the root cause and how should the team resolve this?

- **A.** aws/ebs snapshots cannot be shared cross-account; copy and re-encrypt with a CMK, update its key policy, and share the copy.
- **B.** Edit the key policy of the aws/ebs key in Account A to allow Account B to call kms:Decrypt and kms:CreateGrant, then share the snapshot.
- **C.** Create a KMS Grant on the aws/ebs key for Account B's root user and share the snapshot via AWS Resource Access Manager (RAM).
- **D.** Enable Automatic Key Rotation on the aws/ebs key so that cross-account snapshot sharing is unlocked.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhóm kỹ thuật dữ liệu trong Tài khoản A mã hóa một Amazon EBS volume bằng AWS managed key mặc định (aws/ebs) và tạo một snapshot để chia sẻ với nhóm phân tích điều tra số trong Tài khoản B. Tuy nhiên, khi cố gắng chia sẻ snapshot với Tài khoản B, thao tác thất bại. Nguyên nhân gốc rễ là gì và nhóm nên giải quyết vấn đề này như thế nào?

**Đáp án đúng:** **A**

Quy tắc bất di bất dịch trong Domain 5: **AWS Managed Keys (`aws/s3`, `aws/ebs`, `aws/rds`) KHÔNG BAO GIỜ chia sẻ được Cross-Account** vì không thể sửa Key Policy. Muốn chia sẻ dữ liệu mã hóa sang tài khoản khác, luôn phải dùng **Customer Managed Key (CMK)** và cấp quyền ở cả Key Policy (Account A) lẫn IAM Policy (Account B).

- **A (Đúng):** Chính xác! AWS Managed Key (aws/ebs) có Key Policy chỉ đọc (read-only) nên KHÔNG THỂ sửa để cấp quyền cho tài khoản khác. Phải copy snapshot và mã hóa lại bằng Customer Managed Key (CMK), sau đó cấp quyền KMS Key Policy cho Account B rồi mới chia sẻ snapshot.
- **B:** Không thể chỉnh sửa Key Policy của AWS Managed Key (aws/ebs).
- **C:** Không thể cấp KMS Grant xuyên tài khoản cho AWS Managed Key (aws/ebs) để chia sẻ EBS snapshot, và EBS snapshot chia sẻ trực tiếp bằng ModifySnapshotAttribute chứ không qua RAM.
- **D:** Automatic Key Rotation không liên quan đến khả năng chia sẻ snapshot xuyên tài khoản (và aws/ebs vốn đã tự động xoay vòng mỗi năm).

</details>

### Câu 15 `hard`

A regulated banking customer has strict cryptographic compliance requirements: (1) They must be able to immediately and irreversibly render KMS-encrypted data unreadable within seconds in an emergency (crypto-shredding) rather than waiting 7 days, and (2) Another legacy payment application requires direct integration with a FIPS 140-3 Level 3 single-tenant hardware security module using the PKCS#11 API. Which TWO AWS KMS / CloudHSM features meet these two requirements? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Use a standard AWS-generated KMS CMK and call ScheduleKeyDeletion with PendingWindowInDays set to 0.
- **B.** Use a KMS CMK with Imported Key Material (BYOK) and call DeleteImportedKeyMaterial for immediate crypto-shredding.
- **C.** Enable Automatic Key Rotation on the KMS CMK with Imported Key Material to satisfy compliance.
- **D.** Deploy a multi-AZ AWS CloudHSM cluster (at least two HSMs) and connect via the CloudHSM PKCS#11 library.
- **E.** Connect the legacy payment application directly to AWS KMS using the PKCS#11 interface.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một khách hàng ngân hàng được quản lý chặt chẽ có các yêu cầu tuân thủ mật mã nghiêm ngặt: (1) Họ phải có khả năng làm cho dữ liệu được mã hóa bằng KMS trở nên không thể đọc được ngay lập tức và không thể đảo ngược trong vòng vài giây trong trường hợp khẩn cấp (crypto-shredding) thay vì phải chờ 7 ngày, và (2) Một ứng dụng thanh toán kế thừa khác yêu cầu tích hợp trực tiếp với mô-đun bảo mật phần cứng (HSM) đơn thuê chuẩn FIPS 140-3 Level 3 bằng PKCS#11 API. HAI tính năng AWS KMS / CloudHSM nào đáp ứng hai yêu cầu này? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Phân biệt rõ trong Domain 5: (1) Cần xóa vật liệu khóa tức thì (không chờ 7 ngày) trên KMS → **Imported Key Material (`DeleteImportedKeyMaterial`)** (nhớ nhược điểm là không hỗ trợ Automatic Key Rotation); (2) Cần **Single-tenant HSM** hoặc giao thức **PKCS#11 / JCE / CNG / OpenSSL** → **AWS CloudHSM** (luôn triển khai ≥ 2 HSM ở 2 AZ).

- **A:** AWS KMS không cho phép PendingWindowInDays = 0; giá trị tối thiểu bắt buộc là 7 ngày (tối đa 30 ngày).
- **B (Đúng):** Chính xác! Với KMS CMK dùng Imported Key Material (BYOK), lệnh DeleteImportedKeyMaterial xóa vật liệu khóa ngay lập tức trong vài giây (không phải chờ 7–30 ngày như KMS-generated key), giúp vô hiệu hóa dữ liệu tức thì.
- **C:** KMS CMK với Imported Key Material KHÔNG hỗ trợ Automatic Key Rotation (phải xoay khóa thủ công bằng cách tạo key mới và đổi Alias).
- **D (Đúng):** Chính xác! AWS CloudHSM cung cấp single-tenant HSM chuẩn FIPS 140-2/3 Level 3, hỗ trợ trực tiếp giao thức chuẩn công nghiệp PKCS#11, JCE, CNG và OpenSSL (cần ít nhất 2 HSM ở 2 AZ để đảm bảo HA).
- **E:** AWS KMS không hỗ trợ giao thức PKCS#11 mà chỉ làm việc qua AWS KMS API; cần PKCS#11/JCE/CNG thì bắt buộc chọn AWS CloudHSM.

</details>

---

[Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md)
