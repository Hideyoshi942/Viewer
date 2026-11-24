# Bài tập tình huống — Chủ đề 4: Lưu trữ & Phân phối nội dung — Amazon S3 & CloudFront

> S3 Storage Classes, Versioning, Lifecycle, Multipart Upload, S3 Select, CloudFront OAC, Signed URLs & Signed Cookies.
> **Số câu hỏi:** 23 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án & Giải thích chi tiết**.

---

### Câu 1 `medium`

A media processing application uploads 2 GB video files to Amazon S3 from a backend service. Occasionally, network interruptions cause an upload to fail midway, leaving orphaned parts in S3 that still incur storage charges. Which combination of S3 features should the developer use to improve upload reliability/throughput AND automatically clean up failed uploads?

- **A.** Enable Cross-Region Replication (CRR) on the destination S3 bucket to automatically clean up incomplete upload parts.
- **B.** Enable S3 Object Lock in Compliance mode and configure an S3 Intelligent-Tiering archive rule to transition failed multipart uploads.
- **C.** Use S3 Multipart Upload in the AWS SDK and configure an S3 Lifecycle rule with `AbortIncompleteMultipartUpload` after 7 days.
- **D.** Use S3 Single-PUT upload with `Content-MD5` checksum verification and enable S3 Versioning on the destination bucket.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Best practices cho **Amazon S3 Upload** file lớn:
- **Multipart Upload**: Khuyến nghị cho file từ **100 MB** trở lên; bắt buộc với file **> 5 GB** (tối đa **5 TB**).
- **`AbortIncompleteMultipartUpload`**: Cấu hình trong S3 Lifecycle Policy để tự động dọn các part upload dở dang sau N ngày, tránh phát sinh chi phí ẩn.

- **A:** Sai vì CRR dùng để sao lưu sang Region khác, không giải quyết việc upload file lớn hay dọn dẹp multipart upload lỗi.
- **B:** Sai vì Object Lock dùng để chống xóa/sửa (WORM), còn Intelligent-Tiering dùng để tối ưu storage class theo tần suất truy cập.
- **C (Đúng):** Đúng! AWS khuyến nghị dùng S3 Multipart Upload cho file >= 100 MB (bắt buộc với file > 5 GB) để tải song song từng phần và chỉ upload lại phần lỗi. Lifecycle rule `AbortIncompleteMultipartUpload` tự động xóa các mảnh dở dang để tránh tốn phí lưu trữ.
- **D:** Sai vì Single-PUT không chia nhỏ file nên khi rớt mạng phải upload lại từ đầu toàn bộ 2 GB.

</details>

### Câu 2 `easy`

A developer configures an Amazon S3 bucket event notification to trigger an AWS Lambda function whenever a new `.csv` file is uploaded. When saving the event notification in S3, an error states: `Unable to validate the following destination configurations`. What permission is required to allow Amazon S3 to invoke the Lambda function?

- **A.** Attach `lambda:InvokeFunction` to the Lambda function's IAM Execution Role so Amazon S3 can invoke the function.
- **B.** Add `s3.amazonaws.com` to the S3 bucket's CORS configuration with `AllowedMethods: ["POST"]` for Lambda triggers.
- **C.** Enable S3 Transfer Acceleration on the bucket so event notifications are delivered over AWS edge locations to Lambda.
- **D.** Add a statement to the Lambda function's Resource-based Policy allowing principal `s3.amazonaws.com` to call `lambda:InvokeFunction`.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Phân biệt 2 loại Role/Policy của **AWS Lambda**:
- **Execution Role (IAM Role)**: Quyền để **Lambda gọi ra ngoài** (S3, DynamoDB, SQS, CloudWatch Logs...).
- **Resource-based Policy (Function Policy)**: Quyền để **bên ngoài gọi vào Lambda** (`s3.amazonaws.com`, `apigateway.amazonaws.com`, `events.amazonaws.com`, cross-account...).

- **A:** Sai vì **Execution Role** quy định những dịch vụ nào mà *bên trong code Lambda* được phép gọi (như đọc S3, ghi DynamoDB), không phải quyền cho phép dịch vụ bên ngoài gọi vào Lambda.
- **B:** Sai vì CORS chỉ áp dụng cho HTTP request từ trình duyệt.
- **C:** Sai vì Transfer Acceleration chỉ tăng tốc upload/download qua CloudFront Edge.
- **D (Đúng):** Đúng! Để các dịch vụ như S3, API Gateway, EventBridge, hoặc SNS gọi được Lambda, phải cấp quyền trong **Lambda Resource-based Policy** (ví dụ qua `aws lambda add-permission --principal s3.amazonaws.com`).

</details>

### Câu 3 `medium`

A fintech company must archive transaction records in Amazon S3 for 7 years to satisfy financial regulations. During this 7-year retention period, NO user—not even the AWS account root user—must be able to delete or overwrite any object version. Which S3 feature and mode must be enabled?

- **A.** Enable S3 Object Lock in Governance mode with a 7-year retention period so admins can override locks if needed.
- **B.** Use an S3 Lifecycle rule to transition objects to Glacier Deep Archive without Object Lock.
- **C.** Enable S3 Object Lock in Compliance mode with a 7-year retention period (requires S3 Versioning).
- **D.** Enable S3 Bucket Versioning with MFA Delete enabled on the bucket without configuring S3 Object Lock.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Phân biệt 2 chế độ **S3 Object Lock (WORM)**:
- **Compliance Mode**: Không ai (kể cả **Root User**) có thể xóa/sửa object hoặc rút ngắn retention period.
- **Governance Mode**: Chặn xóa thông thường, nhưng user có quyền `s3:BypassGovernanceRetention` vẫn xóa/chỉnh được.

- **A:** Sai vì trong **Governance mode**, người dùng có quyền đặc biệt `s3:BypassGovernanceRetention` vẫn có thể xóa hoặc rút ngắn thời gian khóa.
- **B:** Sai vì Lifecycle Glacier Deep Archive chỉ giảm chi phí lưu trữ, không ngăn cản người dùng có quyền `s3:DeleteObject` xóa file.
- **C (Đúng):** Đúng! **S3 Object Lock (Compliance mode)** đảm bảo một object version không thể bị ghi đè hay xóa bởi **bất kỳ ai kể cả AWS Root User**, và thời hạn lưu giữ không thể rút ngắn (chỉ có thể bật Object Lock khi tạo bucket mới hoặc bật trên bucket đã có Versioning).
- **D:** Sai vì với MFA Delete, AWS Root User có thiết bị MFA vẫn có thể xóa vĩnh viễn object version.

</details>

### Câu 4 `medium`

A web application behind Amazon CloudFront needs to inspect incoming viewer requests at the edge and add a `Strict-Transport-Security` HTTP response header as well as normalize URL paths (e.g., rewriting `/docs/` to `/docs/index.html`). The logic is simple JavaScript under 10 KB, requires no network or filesystem access, and must execute at sub-millisecond latency with the lowest cost. Which CloudFront compute option should the developer choose?

- **A.** CloudFront Functions
- **B.** Lambda@Edge
- **C.** AWS Lambda in `us-east-1` invoked via API Gateway
- **D.** AWS AppConfig at the origin

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

So sánh **CloudFront Functions** vs **Lambda@Edge**:
- **CloudFront Functions**: Chỉ **JavaScript**, chỉ chạy ở **Viewer Request / Viewer Response**, kích thước ≤ **10 KB**, chạy < **1 ms**, **không** gọi mạng/filesystem, rẻ nhất.
- **Lambda@Edge**: **Node.js / Python**, chạy được cả **Origin Request / Origin Response**, gọi được mạng/AWS SDK, xử lý request body.

- **A (Đúng):** Đúng! **CloudFront Functions** chạy nhẹ bằng JavaScript tại 400+ Edge locations với thời gian thực thi dưới 1 ms, chi phí rẻ hơn ~6 lần so với Lambda@Edge — lý tưởng cho URL rewrite, header manipulation, và JWT validation nhẹ.
- **B:** Sai vì Lambda@Edge đắt hơn và độ trễ cao hơn, chỉ nên dùng khi cần Node.js/Python đầy đủ, gọi mạng ra ngoài (DynamoDB/API), xử lý body lớn, hoặc chạy ở sự kiện Origin Request/Origin Response.
- **C:** Sai vì gọi về một Region cố định sẽ mất lợi ích chạy phân tán tại Edge.
- **D:** Sai vì AppConfig là dịch vụ quản lý cấu hình/feature flag, không xử lý HTTP request/response tại CloudFront Edge.

</details>

### Câu 5 `medium`

An IAM user in an AWS account governed by AWS Organizations has an IAM Identity Policy granting `s3:*` on all buckets. The account belongs to an Organizational Unit (OU) with a Service Control Policy (SCP) that explicitly allows only `ec2:*` and `lambda:*` (no `s3:*`). What happens when the IAM user attempts to call `s3:ListBuckets`?

- **A.** The request is allowed only if the user belongs to the `Administrators` IAM group.
- **B.** The request is explicitly denied by the S3 bucket policy.
- **C.** The request is implicitly denied because the SCP does not allow `s3:*`.
- **D.** The request is allowed because the IAM Identity Policy explicitly allows `s3:*`.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

**IAM Policy Evaluation Logic** (khi có AWS Organizations):
- **Explicit Deny** ở bất kỳ đâu (SCP, Resource Policy, Identity Policy, Permissions Boundary, Session Policy) -> **DENY**.
- Để được **ALLOW** (với same-account IAM identity): Phải có `Allow` trong **SCP** (nếu dùng Organizations) **VÀ** **Permissions Boundary** (nếu có) **VÀ** **Identity Policy / Resource Policy**.

- **A:** Sai vì SCP áp dụng cho toàn bộ IAM Users, Roles và thậm chí cả **Root User** của member account.
- **B:** Sai vì đây là **Implicit Deny** do thiếu `Allow` trong SCP, không phải Explicit Deny từ S3 bucket policy.
- **C (Đúng):** Đúng! Trong logic đánh giá quyền của AWS Organizations, một hành động chỉ được phép khi **CẢ** SCP (ở mọi tầng OU/Account) **VÀ** IAM Identity/Resource Policy đều cho phép (và không có Explicit Deny). Nếu SCP không có `Allow` cho `s3:*`, hành động bị **Implicit Deny**.
- **D:** Sai vì IAM Identity Policy không thể vượt qua giới hạn trần của SCP.

</details>

### Câu 6 `medium`

A developer deploys a static website to Amazon S3 fronted by an Amazon CloudFront distribution in the `ap-southeast-1` Region. When attempting to attach a newly provisioned AWS Certificate Manager (ACM) TLS certificate (`*.example.com`) to the CloudFront distribution, the certificate does not appear in the CloudFront dropdown list. Why?

- **A.** The ACM certificate was created in `ap-southeast-1` instead of `us-east-1` (N. Virginia), which is required by Amazon CloudFront.
- **B.** CloudFront requires the ACM certificate to be stored in an S3 bucket first.
- **C.** Wildcard certificates (`*.example.com`) are not supported by CloudFront.
- **D.** AWS Certificate Manager (ACM) public certificates cannot be used with Amazon CloudFront; only self-signed certificates are supported.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Quy tắc Region cho **AWS Certificate Manager (ACM)**:
- **Amazon CloudFront** (và Edge-optimized API Gateway): Bắt buộc tạo ACM certificate ở **`us-east-1` (N. Virginia)**.
- **Application Load Balancer (ALB) / Regional API Gateway**: Tạo ACM certificate ở **cùng Region** với ALB/API Gateway đó.

- **A (Đúng):** Đúng! Amazon CloudFront là dịch vụ toàn cầu và **bắt buộc** chứng chỉ SSL/TLS từ **AWS Certificate Manager (ACM)** phải được tạo (hoặc import) tại Region **`us-east-1` (N. Virginia)**.
- **B:** Sai vì ACM không lưu chứng chỉ trong S3.
- **C:** Sai vì CloudFront hỗ trợ đầy đủ chứng chỉ wildcard `*.example.com`.
- **D:** Sai vì ACM tích hợp trực tiếp và miễn phí với CloudFront (với điều kiện nằm ở `us-east-1`).

</details>

### Câu 7 `medium`

A data analytics worker on Amazon EC2 needs to download a 10 GB uncompressed file from Amazon S3 as quickly as possible. Currently, the single-threaded download takes too long. Which S3 performance optimization technique allows the application to download different parts of the same object in parallel?

- **A.** Use S3 Multipart Upload in reverse to download chunks of the 10 GB object concurrently.
- **B.** Transition the 10 GB object to S3 Glacier Flexible Retrieval to unlock expedited parallel downloads.
- **C.** Enable S3 Bucket Versioning and Cross-Region Replication on the bucket to parallelize reads.
- **D.** Use S3 Byte-Range Fetches (HTTP `Range` header) across multiple concurrent threads to download chunks of the 10 GB object in parallel.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Cặp tối ưu băng thông **Amazon S3**:
- **Tải lên (Upload) nhanh**: **S3 Multipart Upload** + **S3 Transfer Acceleration** (qua CloudFront Edge).
- **Tải xuống (Download) nhanh**: **S3 Byte-Range Fetches** (tải song song các dải byte) + **CloudFront** (nếu nhiều người tải lại).

- **A:** Sai vì Multipart Upload chỉ dùng để **tải lên (Upload)**; để **tải xuống (Download)** song song phải dùng **Byte-Range Fetches**.
- **B:** Sai vì Glacier có thời gian khôi phục từ vài phút đến vài giờ, không phải để tải nhanh.
- **C:** Sai vì Versioning chỉ lưu nhiều phiên bản của object, không tăng tốc độ tải xuống.
- **D (Đúng):** Đúng! **S3 Byte-Range Fetches** (truyền header `Range: bytes=0-10485759` trong `GetObject`) cho phép tải song song nhiều đoạn của cùng một object lớn, tăng tốc độ tải xuống gấp nhiều lần (AWS SDK TransferManager cũng tự động dùng kỹ thuật này).

</details>

### Câu 8 `medium`

A media company distributes 4K video files from Amazon S3 through Amazon CloudFront. The company wants to restrict access to paid subscribers only, and each subscriber's access link should expire in 15 minutes and work across multiple video segments (HLS `.m3u8` and `.ts` files) without generating a separate URL for every single segment. Which CloudFront feature should the developer implement?

- **A.** CloudFront Signed Cookies
- **B.** S3 Pre-signed URLs bypassing CloudFront
- **C.** CloudFront Origin Access Control (OAC) alone
- **D.** CloudFront Signed URLs

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Phân biệt **CloudFront Signed URLs vs Signed Cookies**:
- **Signed URLs**: Cho **1 file cụ thể** (ví dụ tải 1 file ZIP/PDF), dùng được cho mọi client kể cả không hỗ trợ cookie.
- **Signed Cookies**: Cho **nhiều file** (video streaming HLS, website nội bộ), không cần đổi URL của từng tài nguyên.

- **A (Đúng):** Đúng! **CloudFront Signed Cookies** cho phép cấp quyền truy cập vào **nhiều file/đường dẫn** (như hàng trăm file `.ts` của video HLS hoặc toàn bộ khu vực thành viên) chỉ bằng 1 lần xác thực cookie, có thời hạn hết hạn (15 phút).
- **B:** Sai vì S3 Pre-signed URLs cũng chỉ áp dụng cho từng object đơn lẻ và bỏ qua lợi ích cache toàn cầu của CloudFront.
- **C:** Sai vì OAC chỉ bảo vệ kết nối giữa CloudFront và S3, không kiểm soát từng subscriber phía trình duyệt.
- **D:** Sai vì Signed URL chỉ cấp quyền cho **1 file duy nhất** mỗi URL, không tiện cho luồng video HLS gồm nhiều segment `.ts`.

</details>

### Câu 9 `medium`

A developer accidentally deployed a buggy CSS file (`styles.css`) to an Amazon S3 bucket behind Amazon CloudFront. The developer uploaded the fixed `styles.css` to S3, but users still see the broken version because CloudFront's Cache TTL is set to 24 hours. What is the fastest way to force CloudFront edge locations to immediately serve the updated `styles.css`?

- **A.** Enable S3 Versioning on the origin S3 bucket so CloudFront automatically serves the latest CSS version.
- **B.** Delete and recreate the entire CloudFront distribution to flush all cached files across all global edge locations immediately on deploy.
- **C.** Create a CloudFront Invalidation for `/styles.css` (or use versioned filenames like `styles.v2.css` in future deployments).
- **D.** Restart the origin S3 bucket via the AWS CLI so edge locations clear stale cached objects.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Xử lý cache cũ trên **CloudFront**:
- Khẩn cấp ngay lập tức: **CloudFront Invalidation** (1,000 paths miễn phí/tháng; dùng `/styles.css` hoặc `/*`).
- Best practice CI/CD: **File versioning / cache busting** (`app.<hash>.js`).

- **A:** Sai vì S3 Versioning không tự động xóa cache đang nằm trên CloudFront Edge.
- **B:** Sai vì xóa và tạo lại distribution làm đổi domain name, mất nhiều thời gian và gây downtime.
- **C (Đúng):** Đúng! **CloudFront Invalidation** (`aws cloudformation` / `aws cloudfront create-invalidation --paths /styles.css`) xóa ngay cache cũ tại tất cả Edge locations. Về lâu dài, dùng **versioned filenames** (`styles.v2.css`) là best practice miễn phí.
- **D:** Sai vì S3 không có khái niệm restart.

</details>

### Câu 10 `medium`

A company stores billions of small JSON log files in Amazon S3. An AWS Lambda function occasionally needs to read just 3 specific columns (`userId`, `timestamp`, `errorCode`) from a single large 200 MB uncompressed CSV/JSON file in S3 without downloading all 200 MB into Lambda memory. Which S3 feature filters and returns only the required bytes directly from S3?

- **A.** S3 Inventory
- **B.** S3 Lifecycle Policy
- **C.** S3 Cross-Region Replication (CRR) rule
- **D.** S3 Select (`SelectObjectContent`)

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

**S3 Select** vs **Amazon Athena**:
- **S3 Select**: Lọc dữ liệu bằng SQL trên **1 object đơn lẻ** (rất nhanh cho Lambda).
- **Amazon Athena**: Truy vấn SQL phân tán trên **hàng nghìn/triệu object** trong S3.

- **A:** Sai vì S3 Inventory chỉ xuất báo cáo danh sách metadata các object trong bucket.
- **B:** Sai vì Lifecycle Policy dùng để chuyển storage class hoặc xóa object theo tuổi.
- **C:** Sai vì CRR dùng để sao chép object sang Region khác.
- **D (Đúng):** Đúng! **S3 Select** cho phép chạy câu lệnh SQL đơn giản trực tiếp trên một object S3 (CSV, JSON, Parquet) để S3 lọc và chỉ trả về đúng các cột/dòng cần thiết, giảm tới 80% dữ liệu truyền về Lambda.

</details>

### Câu 11 `easy`

An application uploads objects to an Amazon S3 bucket (`my-app-data`) using `PutObject`. Immediately after `PutObject` returns HTTP 200, another microservice calls `GetObject` or `ListObjectsV2` on the same key. What is Amazon S3's consistency model for new object writes, overwrites, and deletes?

- **A.** Strong read-after-write consistency in Amazon S3 is only available when S3 Bucket Versioning is disabled.
- **B.** Amazon S3 provides eventual consistency for overwrites (`PUT`) and `DELETE`s, and strong consistency only for new `PUT`s.
- **C.** Amazon S3 provides strong read-after-write consistency for all `PUT`s (new and overwrites), `DELETE`s, and `ListObjects` operations.
- **D.** Strong read-after-write consistency requires passing `ConsistentRead=True` to the S3 `GetObject` API.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

**Amazon S3 Consistency Model**:
- **Strong Read-After-Write Consistency** cho tất cả: `PUT` (mới & ghi đè), `DELETE`, và `LIST` (miễn phí, mặc định trên toàn bộ S3).

- **A:** Sai vì Strong Consistency áp dụng mặc định cho mọi S3 bucket bất kể có bật Versioning hay không.
- **B:** Sai vì đó là mô hình cũ trước cuối năm 2020; hiện nay S3 đã hỗ trợ Strong Consistency toàn diện.
- **C (Đúng):** Đúng! Từ tháng 12/2020, Amazon S3 cung cấp **Strong Read-After-Write Consistency** cho mọi thao tác tạo mới, ghi đè (`PUT`), xóa (`DELETE`) và liệt kê (`LIST`) — không còn eventual consistency cho overwrite/delete như trước đây.
- **D:** Sai vì `ConsistentRead` là tham số của DynamoDB, không phải S3 `GetObject`.

</details>

### Câu 12 `medium`

A mobile application has users uploading 500 MB video files directly to an Amazon S3 bucket in `us-east-1` from Asia, Europe, and South America. Users far from `us-east-1` complain about slow upload speeds. Which S3 feature speeds up uploads over the public internet using AWS edge locations?

- **A.** Enable S3 Intelligent-Tiering on the bucket to automatically accelerate cross-region uploads.
- **B.** Enable S3 Cross-Region Replication (CRR) from `us-east-1` to `ap-southeast-1`.
- **C.** Enable S3 Requester Pays on the destination bucket so client uploads bypass standard public internet routing.
- **D.** Enable S3 Transfer Acceleration and point uploads to `<bucket>.s3-accelerate.amazonaws.com`.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

**S3 Transfer Acceleration**:
- Dùng endpoint `<bucket>.s3-accelerate.amazonaws.com`.
- Đi qua **CloudFront Edge Locations** + AWS Backbone Network.
- Tên bucket **không được chứa dấu chấm (`.`)** để tương thích TLS wildcard.

- **A:** Sai vì Intelligent-Tiering chỉ tự động chuyển đổi tầng lưu trữ để tiết kiệm chi phí.
- **B:** Sai vì CRR sao chép dữ liệu *sau khi* đã upload vào `us-east-1`, không tăng tốc độ upload ban đầu.
- **C:** Sai vì Requester Pays chỉ chuyển phí truyền dữ liệu cho người tải, không tăng tốc mạng.
- **D (Đúng):** Đúng! **S3 Transfer Acceleration** định tuyến người dùng tới **CloudFront Edge Location** gần nhất, sau đó đi qua mạng backbone riêng tối ưu của AWS về thẳng S3 bucket ở `us-east-1` (nhanh hơn 50–500% cho upload xuyên lục địa).

</details>

### Câu 13 `medium` *(Chọn nhiều đáp án)*

A company uses Amazon S3 to store customer-uploaded documents. Compliance rules require that: (1) deleted or overwritten documents can be recovered for 90 days, and (2) all objects in `us-east-1` are automatically replicated to a disaster-recovery bucket in `eu-west-1` as soon as they are uploaded. Which TWO S3 features must be enabled on BOTH the source and destination buckets? (Choose two.)

- **A.** Enable S3 Transfer Acceleration on the destination bucket to replicate objects across Regions.
- **B.** Enable S3 Static Website Hosting on both the source and destination buckets before enabling CRR.
- **C.** Configure S3 Cross-Region Replication (CRR) on the source bucket with an IAM replication role pointing to the destination bucket.
- **D.** Enable S3 Versioning on both the source (`us-east-1`) and destination (`eu-west-1`) buckets.
- **E.** Use an S3 Lifecycle rule to expire noncurrent versions immediately after 1 day.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**, **D**

**Amazon S3 Replication (CRR / SRR)**:
- Bắt buộc bật **S3 Versioning** trên **CẢ 2 bucket (nguồn và đích)**.
- Chỉ sao chép các object mới từ thời điểm bật trở đi (muốn chép dữ liệu cũ dùng **S3 Batch Replication**).
- Delete markers mặc định **không** được replicate (trừ khi bật tùy chọn riêng).

- **A:** Sai vì Transfer Acceleration không dùng để sao chép dữ liệu giữa hai S3 bucket.
- **B:** Sai vì Static Website Hosting không liên quan đến Versioning hay Replication.
- **C (Đúng):** Đúng! **S3 CRR** tự động sao chép bất đồng bộ các object mới upload từ `us-east-1` sang `eu-west-1`.
- **D (Đúng):** Đúng! S3 Versioning giúp khôi phục file bị xóa/ghi đè, đồng thời là **điều kiện bắt buộc** trên cả bucket nguồn và bucket đích để bật Cross-Region Replication (CRR).
- **E:** Sai vì xóa phiên bản cũ sau 1 ngày sẽ vi phạm yêu cầu khôi phục trong 90 ngày.

</details>

### Câu 14 `medium` *(Chọn nhiều đáp án)*

A web application behind Amazon CloudFront serves personalized user dashboards at `/api/profile` (authenticated via the `Authorization` header) and public product images at `/images/*`. Currently, users occasionally see another user's `/api/profile` response! Which TWO CloudFront configurations fix this data leak while keeping `/images/*` cached efficiently? (Choose two.)

- **A.** Disable HTTPS on the `/api/*` Cache Behavior so CloudFront skips caching `Authorization` headers.
- **B.** Create a CloudFront Cache Behavior for `/api/*` using `CachingDisabled` (or include `Authorization` in the Cache Key).
- **C.** Keep a separate Cache Behavior for `/images/*` with `CachingOptimized` enabled so static images continue to be served from edge caches.
- **D.** Enable S3 Object Lock on the API Gateway origin to prevent CloudFront from caching dynamic JSON.
- **E.** Set the Default TTL to `31536000` seconds on the `/api/*` Cache Behavior.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**, **C**

**CloudFront Cache Behaviors**:
- Cho phép cấu hình chính sách cache khác nhau theo **Path Pattern** (`/api/*` vs `/images/*`).
- Với API động/cá nhân hóa: dùng **`CachingDisabled`** (hoặc đưa header/cookie định danh vào **Cache Key**).

- **A:** Sai vì tắt HTTPS làm lộ `Authorization` token trên mạng.
- **B (Đúng):** Đúng! Lỗi lộ dữ liệu xảy ra do CloudFront cache `/api/profile` mà không phân biệt theo user (`Authorization` header). Tách Cache Behavior riêng cho `/api/*` với `CachingDisabled` (hoặc đưa `Authorization` vào Cache Key + dùng `AllViewerExceptHostHeader` Origin Request Policy) sẽ khắc phục triệt để.
- **C (Đúng):** Đúng! Giữ Behavior riêng cho `/images/*` dùng `CachingOptimized` đảm bảo hiệu năng cao và giảm tải origin cho ảnh tĩnh.
- **D:** Sai vì Object Lock chỉ áp dụng cho S3 bucket.
- **E:** Sai vì tăng TTL lên 1 năm sẽ làm rò rỉ dữ liệu user càng nghiêm trọng hơn.

</details>

### Câu 15 `medium`

An Amazon S3 bucket (`partner-dropzone`) receives files uploaded by an external AWS account (`999988887777`). Previously, objects uploaded by the external account could not be read by the bucket owner (`111122223333`) unless the uploader passed `--acl bucket-owner-full-control`. How should the bucket owner ensure they ALWAYS own and have full access to every object uploaded to their bucket, regardless of what ACL the uploader sets?

- **A.** Set S3 Object Ownership to `Object writer` so uploaded objects are automatically owned by the bucket owner.
- **B.** Enable S3 Versioning on the bucket to automatically transfer object ownership to the bucket owner.
- **C.** Set S3 Object Ownership to Bucket owner enforced (which disables ACLs on the bucket).
- **D.** Enable S3 Requester Pays on the bucket so cross-account uploaders retain ownership of their objects.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

**S3 Object Ownership**:
- **`Bucket owner enforced`** (khuyến nghị): Tắt ACLs, chủ bucket sở hữu 100% objects.
- Nếu vẫn cần ACL cũ: bắt buộc người upload truyền `--acl bucket-owner-full-control` qua điều kiện Bucket Policy.

- **A:** Sai vì `Object writer` giữ quyền sở hữu thuộc về tài khoản đã upload object.
- **B:** Sai vì Versioning không thay đổi quyền sở hữu object cross-account.
- **C (Đúng):** Đúng! Chế độ **Bucket owner enforced** (mặc định trên S3 bucket mới) vô hiệu hóa hoàn toàn S3 ACLs, đảm bảo **chủ sở hữu bucket luôn là chủ sở hữu hợp pháp** của mọi object được upload lên (kể cả từ tài khoản khác) mà không cần `--acl bucket-owner-full-control`.
- **D:** Sai vì Requester Pays chỉ chuyển phí truyền dữ liệu sang người gọi API.

</details>

### Câu 16 `medium`

A company stores billions of small log files in an Amazon S3 bucket (`app-logs`) and runs Amazon Athena queries over them. Queries are slow and expensive because Athena has to open thousands of tiny 5 KB files and scan the entire bucket. Which two optimizations will dramatically speed up Athena queries and reduce S3/Athena costs?

- **A.** Partition S3 keys by date/region (`year=2026/...`) and compact small JSON files into Apache Parquet via Firehose or AWS Glue.
- **B.** Store all logs in Amazon S3 Glacier Deep Archive while querying them live with Athena.
- **C.** Enable S3 Versioning and S3 Transfer Acceleration on the analytics bucket to speed up Amazon Athena SQL queries significantly on small files.
- **D.** Split every 5 KB JSON log file into smaller 1 KB files so Athena can scan them in parallel.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Tối ưu **S3 + Amazon Athena**:
1. **Partitioning** (`year=/month=/day=`).
2. **Columnar format** (**Apache Parquet** / ORC) + nén (Snappy/GZIP) + gộp file nhỏ thành file lớn (128 MB+).

- **A (Đúng):** Đúng! **Partitioning** (`year=.../month=.../day=...`) giúp Athena bỏ qua các thư mục không cần đọc (partition pruning), còn **Apache Parquet** (nén dạng cột, gộp file lớn ~128 MB) giúp Athena chỉ đọc đúng cột cần thiết -> giảm tới 90% chi phí và thời gian truy vấn.
- **B:** Sai vì Athena không thể truy vấn trực tiếp các object đang ở trạng thái archived trong Glacier Deep Archive (phải restore trước).
- **C:** Sai vì Versioning và Transfer Acceleration không tối ưu tốc độ quét dữ liệu của Athena.
- **D:** Sai vì file càng nhỏ càng làm tăng overhead gọi S3 `GET` của Athena.

</details>

### Câu 17 `medium`

A developer is troubleshooting a serverless workflow where an AWS Lambda function is supposed to be triggered by an Amazon S3 `ObjectCreated:*` event notification, but the Lambda function is never invoked when files are uploaded to `s3://my-bucket/invoices/test.pdf`. All other files in `s3://my-bucket/uploads/` trigger a different Lambda. Which two things should the developer check first?

- **A.** Verify S3 Event Notification prefix/suffix filters don't overlap and the Lambda Policy grants `lambda:InvokeFunction` to `s3.amazonaws.com`.
- **B.** Verify that the Lambda function has `ReservedConcurrency` set to `0` so S3 events can invoke it.
- **C.** Verify that the S3 bucket has Static Website Hosting enabled on its properties so event triggers fire.
- **D.** Verify that the S3 bucket has Block Public Access disabled and is publicly readable by anyone.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Gỡ lỗi **S3 Event Notifications -> Lambda**:
1. Kiểm tra **Prefix/Suffix filters** (không được trùng/chồng lấn cho cùng event type).
2. Kiểm tra **Lambda Resource-based Policy** (`s3.amazonaws.com` + `aws:SourceArn`).
3. Mẹo nâng cao: Nếu cần nhiều đích nhận cùng 1 sự kiện S3 mà không lo chồng lấn prefix -> bật **S3 Event Notifications -> Amazon EventBridge**.

- **A (Đúng):** Đúng! Amazon S3 **không cho phép các Event Notification có prefix/suffix chồng lấn** cho cùng một loại sự kiện trên cùng bucket, và S3 bắt buộc phải có quyền trong **Lambda Resource-based Policy** để gọi hàm.
- **B:** Sai vì đặt `ReservedConcurrency = 0` sẽ chặn hoàn toàn hàm Lambda không cho chạy.
- **C:** Sai vì Static Website Hosting không liên quan đến S3 Event Notifications.
- **D:** Sai vì S3 Event Notifications hoạt động bình thường trên private buckets.

</details>

### Câu 18 `medium`

An Amazon EC2 Auto Scaling Group needs to run a custom cleanup script to flush application logs to S3 before an instance is terminated during a scale-in event. Which feature allows pausing instance termination until the script completes?

- **A.** ALB Target Group Deregistration Delay (`deregistration_delay.timeout_seconds`)
- **B.** Termination Protection on the EC2 instance (`disableApiTermination`)
- **C.** EC2 Auto Scaling Lifecycle Hooks (`autoscaling:EC2_INSTANCE_TERMINATING`)
- **D.** EC2 User Data shutdown script (`cloud-init` final hook)

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

**ASG Lifecycle Hooks** (`EC2_INSTANCE_LAUNCHING` / `EC2_INSTANCE_TERMINATING`) tạm dừng quá trình tạo hoặc hủy instance để thực hiện tác vụ chuẩn bị hoặc dọn dẹp.

- **A:** Sai vì Deregistration Delay chỉ đợi request HTTP đang dở hoàn tất ở Load Balancer, không điều phối chạy script flush log trước khi ASG terminate.
- **B:** Sai vì Termination Protection chỉ ngăn xóa tay trên console/API, không dùng để chạy hook khi ASG scale-in.
- **C (Đúng):** Đúng! **Auto Scaling Lifecycle Hooks** giữ instance ở trạng thái `Terminating:Wait` (tối đa tới 48 giờ nếu heartbeat, mặc định 3600s) để chạy script/Lambda xong rồi gọi `CompleteLifecycleAction`.
- **D:** Sai vì User Data chỉ chạy lúc khởi động (boot), không chạy lúc tắt.

</details>

### Câu 19 `easy`

A Lambda function needs to access a private Amazon RDS instance inside a VPC and also read files from Amazon S3. After placing the Lambda function inside private subnets of the VPC, it can connect to RDS, but S3 calls time out. What is the simplest, most cost-effective fix for S3 access?

- **A.** Move the Lambda function into a public subnet without a NAT Gateway to access S3.
- **B.** Create an S3 Interface Endpoint (PrivateLink) instead of Gateway Endpoint to save costs.
- **C.** Create an S3 Gateway VPC Endpoint and associate it with the Lambda subnets' route tables.
- **D.** Attach a Public IP address directly to the Lambda function's ENI for S3 internet routing access.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Lambda trong VPC cần gọi **S3 hoặc DynamoDB** -> luôn ưu tiên **Gateway VPC Endpoint** (miễn phí, bảo mật nội bộ).

- **A:** Sai vì Lambda trong public subnet cũng không có Public IP nên vẫn không ra Internet được.
- **B:** Sai vì Interface Endpoint tính phí theo giờ và GB, còn **Gateway Endpoint cho S3/DynamoDB miễn phí hoàn toàn**.
- **C (Đúng):** Đúng! **Gateway VPC Endpoint** cho S3 (và DynamoDB) hoàn toàn **miễn phí**, giữ traffic nội bộ trong AWS và không cần NAT Gateway.
- **D:** Sai vì Lambda trong VPC không được cấp Public IP.

</details>

### Câu 20 `medium`

A developer must upload 50 GB video files from an on-premises server to Amazon S3 over a high-latency international link. Uploads frequently fail mid-way and must restart from scratch. Which two S3 features should the developer combine to maximize speed and resilience?

- **A.** Use S3 Cross-Region Replication (CRR) and S3 Intelligent-Tiering.
- **B.** Use S3 Presigned POST with Byte-Range Fetches.
- **C.** Use S3 Multipart Upload and enable S3 Transfer Acceleration.
- **D.** Use Single-PUT upload and S3 Glacier Instant Retrieval.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **C**

Upload file lớn (>5 GB) qua mạng xa: **S3 Multipart Upload** (song song + chịu lỗi từng phần) + **S3 Transfer Acceleration** (tối ưu đường truyền qua Edge).

- **A:** Sai vì đây là tính năng sao lưu và phân tầng sau khi đã lên S3.
- **B:** Sai vì Byte-Range Fetches dùng cho **download**, không phải upload.
- **C (Đúng):** Đúng! **Multipart Upload** (bắt buộc cho file >5 GB) chia nhỏ file thành nhiều part upload song song và chỉ retry part lỗi; **Transfer Acceleration** định tuyến qua CloudFront Edge Locations để tăng tốc xuyên lục địa.
- **D:** Sai vì Single-PUT tối đa chỉ 5 GB.

</details>

### Câu 21 `medium`

A video streaming platform stores private HLS video playlists and hundreds of `.ts` segment files per movie in a private Amazon S3 bucket behind Amazon CloudFront (using Origin Access Control). Paid users must be able to watch the entire movie smoothly without generating a new URL for every `.ts` segment. What should the developer use?

- **A.** CloudFront Signed URLs
- **B.** CloudFront Signed Cookies
- **C.** S3 Presigned URLs bypassing CloudFront
- **D.** Make the S3 bucket public and block `Referer` headers.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **B**

Phân biệt trong đề thi CloudFront:
- **Signed URL**: Cho **1 file cụ thể**.
- **Signed Cookies**: Cho **nhiều file / thư mục / video HLS nhiều phân đoạn**.

- **A:** Sai vì Signed URL chỉ cấp quyền cho từng file riêng lẻ (mỗi chunk `.ts` lại phải ký lại URL).
- **B (Đúng):** Đúng! **CloudFront Signed Cookies** cho phép cấp quyền truy cập hàng loạt file/đường dẫn (như toàn bộ các chunk `.ts` của video HLS) chỉ với một lần cấp cookie.
- **C:** Sai vì không tận dụng được CloudFront CDN và cũng chỉ ký từng object.
- **D:** Sai vì rất dễ giả mạo header `Referer` và vi phạm bảo mật.

</details>

### Câu 22 `medium`

A media website distributes paid training videos globally through an Amazon CloudFront distribution backed by a private Amazon S3 bucket. Whenever an authenticated subscriber purchases a course, the application needs to grant that user temporary access to stream dozens of HLS video segments (`*.ts` files) inside the `/courses/aws-dva/*` directory for 2 hours without modifying the video player URLs in the HTML page. What should the developer use?

- **A.** CloudFront Signed Cookies with a custom policy specifying the path pattern and expiration time.
- **B.** S3 Presigned URLs generated individually for each of the thousands of `.ts` segment files.
- **C.** Make the S3 bucket public and obfuscate the folder name with a random string.
- **D.** CloudFront Origin Access Control (OAC) alone without any signed URLs or cookies.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **A**

Quy tắc chọn nhanh **CloudFront Signed URL vs Signed Cookies**:
- **1 tệp đơn lẻ** (ví dụ: tải 1 file ZIP/PDF) -> **CloudFront Signed URL**.
- **Nhiều tệp** (ví dụ: HLS video streaming gồm hàng trăm file `.ts`, hoặc không muốn đổi URL tĩnh) -> **CloudFront Signed Cookies**.

- **A (Đúng):** Đúng! Khi cần cấp quyền truy cập tạm thời cho NHIỀU tệp tin (ví dụ: các phân đoạn video HLS hoặc toàn bộ thư mục khóa học) mà không muốn sửa URL của từng tệp, hãy dùng **CloudFront Signed Cookies**.
- **B:** Sai vì S3 Presigned URL đi thẳng vào S3 (bỏ qua CloudFront cache) và chỉ áp dụng cho từng tệp đơn lẻ, buộc phải viết lại URL trong manifest.
- **C:** Sai vì bất kỳ ai biết link đều có thể chia sẻ công khai.
- **D:** Sai vì OAC chỉ bảo vệ kết nối giữa CloudFront và S3 Bucket (chặn truy cập trực tiếp vào S3), nhưng không phân biệt người dùng nào đã trả phí trên CloudFront.

</details>

### Câu 23 `medium`

A web application allows authenticated users around the world to upload video files ranging from 2 GB to 15 GB directly from their browsers to a private Amazon S3 bucket without routing the file payload through backend servers. Which solution meets these requirements with the BEST upload performance?

- **A.** Enable S3 Static Website Hosting and allow public `s3:PutObject` access in the bucket policy.
- **B.** Use a single HTTP PUT request with an S3 presigned URL configured with a 7-day expiration.
- **C.** Upload the video files through an Amazon API Gateway REST endpoint connected to an AWS Lambda function that writes to S3.
- **D.** Generate S3 presigned URLs for S3 Multipart Upload and enable S3 Transfer Acceleration on the destination bucket.

<details><summary>Xem đáp án & Giải thích chi tiết</summary>

**Đáp án đúng:** **D**

Giới hạn kích thước S3 cần nhớ: Tối đa **5 GB** cho một lệnh PUT đơn lẻ; khuyến nghị dùng **Multipart Upload** cho tệp > 100 MB và **bắt buộc** dùng Multipart Upload cho tệp > 5 GB (tối đa 5 TB).

- **A:** Sai vì vi phạm nghiêm trọng yêu cầu bảo mật (mở quyền ghi công khai cho mọi người trên Internet).
- **B:** Sai vì một lệnh PUT đơn lẻ trên S3 chỉ hỗ trợ tệp tối đa 5 GB (trong khi yêu cầu lên tới 15 GB).
- **C:** Sai vì giới hạn payload tối đa của API Gateway là 10 MB và của Lambda đồng bộ là 6 MB.
- **D (Đúng):** Đúng! Tệp trên 5 GB bắt buộc phải dùng Multipart Upload; Presigned URL cho phép trình duyệt tải trực tiếp lên bucket private; S3 Transfer Acceleration tăng tốc độ tải xuyên lục địa qua mạng lưới Edge Locations của AWS.

</details>

---

[← Bộ trước](03-dva-rds-aurora-elasticache.md) | [Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Bộ tiếp theo →](05-dva-containers-ecs-ecr-eb.md)
