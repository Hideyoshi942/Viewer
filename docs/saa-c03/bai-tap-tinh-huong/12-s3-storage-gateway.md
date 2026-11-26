# Bài tập tình huống — Chủ đề 12: Object Storage & Hybrid Storage — Amazon S3, Storage Classes, Lifecycle, CRR & Storage Gateway

> S3 Storage Classes, Intelligent-Tiering, Lifecycle Policies, S3 CRR/SRR, Object Lock (WORM), Pre-signed URLs & AWS Storage Gateway (S3 File/Volume/Tape).
> **Số câu hỏi:** 8 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A hospital archives digital X-ray images in Amazon S3. Regulatory laws require the images to be retained for 7 years. The images are rarely accessed, but when a patient arrives in the emergency room, doctors must be able to retrieve the X-ray image immediately (within milliseconds). Which S3 storage class is MOST cost-effective for this requirement?

- **A.** Amazon S3 Glacier Deep Archive storage class
- **B.** Amazon S3 One Zone-Infrequent Access storage class
- **C.** Amazon S3 Glacier Instant Retrieval storage class
- **D.** Amazon S3 Standard general-purpose storage class

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một bệnh viện lưu trữ lâu dài ảnh chụp X-quang kỹ thuật số trong Amazon S3. Quy định pháp luật yêu cầu giữ lại hình ảnh trong 7 năm. Các hình ảnh hiếm khi được truy cập, nhưng khi bệnh nhân vào phòng cấp cứu, bác sĩ phải có thể truy xuất ảnh X-quang ngay lập tức (trong vòng vài mili-giây). Lớp lưu trữ S3 nào tối ưu chi phí NHẤT cho yêu cầu này?

**Đáp án đúng:** **C**

Mẹo chọn nhanh giữa **S3 Standard-IA** và **S3 Glacier Instant Retrieval**:
- Cả hai đều truy xuất **Millisecond** và lưu trên >= 3 AZ.
- Nếu truy cập ~1 lần/tháng (lưu tối thiểu 30 ngày) -> **S3 Standard-IA**.
- Nếu dữ liệu lưu trữ hiếm khi truy cập (~1 lần/quý, lưu tối thiểu 90 ngày, ví dụ: hồ sơ y tế/tin tức cũ cần mở ngay khi cần) -> **S3 Glacier Instant Retrieval** (rẻ hơn nhiều).

- **A:** Sai vì S3 Glacier Deep Archive mất từ **12 đến 48 giờ** để khôi phục dữ liệu, không đáp ứng yêu cầu cấp cứu tức thì.
- **B:** Sai vì S3 One Zone-IA chỉ lưu trong 1 Availability Zone duy nhất; nếu AZ đó gặp thảm họa thì hồ sơ y tế bắt buộc lưu 7 năm sẽ bị mất.
- **C (Đúng):** Đúng! **S3 Glacier Instant Retrieval** được thiết kế riêng cho dữ liệu lưu trữ dài hạn, hiếm khi truy cập (khoảng 1 lần/quý) nhưng yêu cầu thời gian lấy dữ liệu **tức thì (milliseconds)** như ảnh y tế, tiết kiệm tới 68% chi phí lưu trữ so với S3 Standard-IA.
- **D:** Sai vì S3 Standard có chi phí lưu trữ cao nhất, không tối ưu cho dữ liệu lưu trữ hiếm khi đọc trong 7 năm.

</details>

### Câu 2 `medium`

A company stores 500 TB of user-generated photos and videos in Amazon S3. Access patterns vary wildly and unpredictably: some albums are viewed thousands of times for a few weeks and then rarely touched, while old albums suddenly become popular again months later. The company wants to optimize storage costs automatically WITHOUT incurring any retrieval fees when old photos are accessed. Which S3 storage class should be used?

- **A.** S3 Standard-IA
- **B.** S3 Intelligent-Tiering
- **C.** S3 Glacier Deep Archive
- **D.** Amazon EBS io2 Block Express

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ 500 TB ảnh và video do người dùng tạo trong Amazon S3. Mẫu hình truy cập thay đổi thất thường và khó đoán: một số album được xem hàng nghìn lần trong vài tuần rồi hiếm khi được đụng tới, trong khi các album cũ bỗng nhiên phổ biến trở lại nhiều tháng sau đó. Công ty muốn tự động tối ưu chi phí lưu trữ MÀ KHÔNG phát sinh bất kỳ phí truy xuất (retrieval fee) nào khi ảnh cũ được truy cập. Nên sử dụng lớp lưu trữ S3 nào?

**Đáp án đúng:** **B**

Từ khóa nhận diện **S3 Intelligent-Tiering**: `unknown or unpredictable access patterns`, `automatic cost savings`, `no retrieval charges / no operational overhead`.

- **A:** Sai vì S3 Standard-IA có thu phí trên mỗi GB dữ liệu được đọc (retrieval fee), nên nếu dữ liệu bất ngờ được truy cập nhiều trở lại thì chi phí sẽ tăng vọt.
- **B (Đúng):** Đúng! **S3 Intelligent-Tiering** tự động theo dõi tần suất truy cập và di chuyển đối tượng giữa các tầng (Frequent, Infrequent, Archive Instant Access) với một khoản phí giám sát cực nhỏ mà **KHÔNG thu phí lấy dữ liệu (No retrieval fees)**.
- **C:** Sai vì không thể mở xem ảnh trực tiếp (mất 12–48 giờ để khôi phục) và có phí khôi phục.
- **D:** Sai vì EBS io2 đắt gấp nhiều lần S3 và chỉ gắn cho EC2.

</details>

### Câu 3 `medium`

A company stores millions of medical X-ray images in Amazon S3. Regulatory rules require keeping the images for 10 years. The images are rarely accessed (once or twice a year), but when a doctor requests an image, it must be retrieved within milliseconds. Which S3 storage class is the most cost-effective?

- **A.** S3 Glacier Instant Retrieval
- **B.** S3 Glacier Deep Archive
- **C.** S3 Standard
- **D.** S3 One Zone-IA

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ hàng triệu ảnh chụp X-quang y tế trong Amazon S3. Quy định pháp luật yêu cầu giữ lại hình ảnh trong 10 năm. Các hình ảnh hiếm khi được truy cập (một hoặc hai lần mỗi năm), nhưng khi bác sĩ yêu cầu một hình ảnh, nó phải được truy xuất trong vòng vài mili-giây. Lớp lưu trữ S3 nào tối ưu chi phí nhất?

**Đáp án đúng:** **A**

Dữ liệu lưu dài hạn (ít đọc, 1-2 lần/năm) nhưng yêu cầu **immediate / millisecond retrieval** → **S3 Glacier Instant Retrieval**.

- **A (Đúng):** Đúng! **S3 Glacier Instant Retrieval** được thiết kế riêng cho dữ liệu lưu trữ dài hạn, đọc 1-2 lần/năm nhưng cần truy xuất **tức thì (millisecond)** với chi phí rẻ hơn nhiều so với Standard-IA.
- **B:** Sai vì Glacier Deep Archive mất 12 đến 48 giờ để khôi phục dữ liệu, không đáp ứng yêu cầu tải về ngay trong vài mili-giây.
- **C:** Sai vì S3 Standard đắt nhất, không tối ưu cho dữ liệu lưu trữ 10 năm ít đọc.
- **D:** Sai vì One Zone-IA chỉ lưu ở 1 AZ duy nhất (rủi ro mất dữ liệu y tế quan trọng nếu AZ gặp sự cố) và đắt hơn Glacier Instant Retrieval.

</details>

### Câu 4 `medium`

A media agency has an on-premises network-attached storage (NAS) system running out of space. They want to migrate older files to Amazon S3 while keeping recently accessed files cached locally on-premises for low-latency access over NFS/SMB, and they want the files in S3 to be stored as native S3 objects so other AWS services can process them directly. Which AWS Storage Gateway configuration should they deploy?

- **A.** Volume Gateway (Cached Volumes)
- **B.** Tape Gateway
- **C.** AWS Snowball Edge
- **D.** Amazon S3 File Gateway

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty truyền thông có hệ thống lưu trữ gắn mạng (NAS) on-premises sắp hết dung lượng. Họ muốn di chuyển các tệp cũ hơn lên Amazon S3 trong khi vẫn giữ các tệp mới truy cập gần đây được lưu bộ nhớ đệm (cache) cục bộ tại chỗ để truy cập độ trễ thấp qua NFS/SMB, đồng thời muốn các tệp trong S3 được lưu dưới dạng S3 object nguyên bản để các dịch vụ AWS khác có thể xử lý trực tiếp. Họ nên triển khai cấu hình AWS Storage Gateway nào?

**Đáp án đúng:** **D**

Khi cần truy cập qua NFS/SMB tại on-premises kèm local cache độ trễ thấp và lưu trực tiếp thành native S3 objects, chọn **Amazon S3 File Gateway**.

- **A:** Sai vì Volume Gateway dùng giao thức iSCSI Block và lưu dữ liệu dưới dạng EBS Snapshots, không phải native S3 objects.
- **B:** Sai vì Tape Gateway giả lập băng từ ảo (VTL) cho phần mềm backup.
- **C:** Sai vì Snowball là thiết bị copy một lần, không cung cấp local cache liên tục qua NFS/SMB.
- **D (Đúng):** Đúng! **S3 File Gateway** cung cấp giao diện NFS/SMB tại on-premises kèm local cache, đồng thời lưu file lên S3 dưới dạng **native S3 objects**.

</details>

### Câu 5 `medium`

A company stores 500 TB of log files in an Amazon S3 bucket. Some logs are accessed frequently for 2 weeks, others are accessed unpredictably by different teams over several months, and the company wants to automatically optimize storage costs without paying retrieval fees or writing complex lifecycle rules. Which S3 storage class is best suited?

- **A.** S3 Standard-IA
- **B.** S3 Glacier Flexible Retrieval
- **C.** S3 One Zone-IA
- **D.** S3 Intelligent-Tiering

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ 500 TB tệp log trong một Amazon S3 bucket. Một số log được truy cập thường xuyên trong 2 tuần, số khác được các nhóm khác nhau truy cập thất thường trong vài tháng, và công ty muốn tự động tối ưu chi phí lưu trữ mà không phải trả phí truy xuất hoặc viết các quy tắc vòng đời (lifecycle rule) phức tạp. Lớp lưu trữ S3 nào phù hợp nhất?

**Đáp án đúng:** **D**

Từ khóa **unknown or unpredictable access patterns** + **no retrieval fees** → **S3 Intelligent-Tiering**.

- **A:** Sai vì Standard-IA có tính phí truy xuất (retrieval fee) mỗi GB và yêu cầu lưu tối thiểu 30 ngày.
- **B:** Sai vì Glacier Flexible Retrieval mất hàng giờ để khôi phục và có phí truy xuất.
- **C:** Sai vì One Zone-IA có phí truy xuất và chỉ lưu ở 1 AZ.
- **D (Đúng):** Đúng! **S3 Intelligent-Tiering** tự động di chuyển object giữa các tầng Frequent, Infrequent và Archive Instant Access dựa trên mẫu truy cập **không đoán trước** mà **không tính phí truy xuất (zero retrieval fees)**.

</details>

### Câu 6 `hard`

A global media company uploads large 10 GB video files from remote studios worldwide to a central Amazon S3 bucket in `us-east-1`. Users report slow upload speeds and occasional timeouts over long-distance internet links. Which TWO S3 features should the solutions architect implement to maximize upload speed and reliability? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Enable S3 Cross-Region Replication on the `us-east-1` bucket to replicate incoming objects across Regions.
- **B.** Change the default S3 storage class to S3 Glacier Instant Retrieval during the initial file upload.
- **C.** Enable S3 Transfer Acceleration on the destination bucket so uploads route through nearby AWS Edge Locations.
- **D.** Enable S3 Requester Pays on the destination bucket so remote studios cover transfer bandwidth.
- **E.** Use S3 Multipart Upload to split each 10 GB file into smaller parts and upload them in parallel.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty truyền thông toàn cầu tải lên các tệp video lớn 10 GB từ các studio ở xa trên khắp thế giới tới một Amazon S3 bucket trung tâm tại `us-east-1`. Người dùng báo cáo tốc độ tải lên chậm và thỉnh thoảng bị timeout qua các đường truyền internet đường dài. Solutions architect nên triển khai HAI tính năng S3 nào để tối đa hóa tốc độ tải lên và độ tin cậy? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Tăng tốc và tăng độ ổn định khi upload file lớn (> 100 MB, đặc biệt vài GB) từ khắp thế giới lên S3: **S3 Transfer Acceleration** (qua Edge Locations) + **S3 Multipart Upload** (upload song song và resume từng phần).

- **A:** Sai vì Cross-Region Replication sao chép dữ liệu sau khi đã upload xong vào bucket nguồn, không cải thiện tốc độ upload ban đầu.
- **B:** Sai vì lớp lưu trữ không ảnh hưởng đến tốc độ truyền tải mạng khi upload.
- **C (Đúng):** Đúng! S3 Transfer Acceleration tận dụng mạng lưới Edge Locations của CloudFront và đường truyền xương sống tối ưu của AWS để tăng tốc độ upload từ xa.
- **D:** Sai vì Requester Pays chỉ thay đổi đối tượng trả phí truyền dữ liệu, không tăng tốc độ upload.
- **E (Đúng):** Đúng! S3 Multipart Upload chia nhỏ file lớn thành nhiều phần để tải lên song song (tăng tốc độ) và chỉ cần upload lại phần bị lỗi nếu rớt mạng (tăng độ tin cậy).

</details>

### Câu 7 `medium`

A company stores 200 TB of user-generated documents in Amazon S3 Standard. Access patterns are unpredictable: some files are accessed heavily for a few days and then never again, while other old files are suddenly accessed frequently months later. The company wants to optimize S3 storage costs automatically without retrieval fees or operational overhead. Which storage class should be used?

- **A.** Amazon S3 Standard-IA
- **B.** Amazon S3 Glacier Flexible Retrieval
- **C.** Amazon S3 Intelligent-Tiering
- **D.** Amazon S3 One Zone-IA

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một công ty lưu trữ 200 TB tài liệu do người dùng tạo trong Amazon S3 Standard. Mẫu hình truy cập khó đoán: một số tệp được truy cập nhiều trong vài ngày rồi không bao giờ dùng lại, trong khi các tệp cũ khác bỗng nhiên được truy cập thường xuyên nhiều tháng sau đó. Công ty muốn tự động tối ưu chi phí lưu trữ S3 mà không mất phí truy xuất hoặc tốn công sức vận hành. Nên sử dụng lớp lưu trữ nào?

**Đáp án đúng:** **C**

Bất kỳ khi nào đề bài nói về **unpredictable / unknown / changing access patterns** trên S3 -> Chọn ngay **S3 Intelligent-Tiering**.

- **A:** Sai vì S3 Standard-IA tính phí retrieval theo mỗi GB khi đọc dữ liệu, không phù hợp khi dữ liệu cũ bất ngờ bị truy cập thường xuyên trở lại.
- **B:** Sai vì Glacier Flexible Retrieval có độ trễ truy xuất từ vài phút đến vài giờ và tính phí retrieval.
- **C (Đúng):** Đúng! S3 Intelligent-Tiering tự động di chuyển object giữa các tầng truy cập (Frequent, Infrequent, Archive Instant Access) dựa trên tần suất sử dụng thực tế với phí giám sát nhỏ và KHÔNG tính phí retrieval.
- **D:** Sai vì One Zone-IA chỉ lưu ở 1 AZ (rủi ro mất dữ liệu nếu AZ gặp sự cố) và vẫn tính phí retrieval.

</details>

### Câu 8 `medium`

A web application allows authenticated users to upload private tax documents directly to an Amazon S3 bucket without proxying the large files through the application servers. The S3 bucket must remain completely private, and each upload link should only be valid for 10 minutes. Which approach should the solutions architect implement?

- **A.** Create an individual IAM user for each authenticated web user and send the static IAM access keys to the browser.
- **B.** Make the S3 bucket public-write and delete unauthorized tax documents using an asynchronous AWS Lambda trigger.
- **C.** Have the backend generate an S3 Pre-signed URL with a 10-minute expiration and return it to the browser for upload.
- **D.** Use AWS Transfer Family (SFTP) directly inside the user's web browser over standard HTTPS connections.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một ứng dụng web cho phép người dùng đã xác thực tải trực tiếp các tài liệu thuế riêng tư lên Amazon S3 bucket mà không cần chuyển tiếp (proxy) các tệp lớn qua máy chủ ứng dụng. S3 bucket phải hoàn toàn riêng tư và mỗi liên kết tải lên chỉ có hiệu lực trong 10 phút. Solutions architect nên triển khai phương pháp nào?

**Đáp án đúng:** **C**

Khi bài toán yêu cầu **upload/download trực tiếp với private S3 bucket trong thời gian giới hạn (tính bằng phút/giờ)** mà không đi qua app server -> Đáp án luôn là **S3 Pre-signed URL**.

- **A:** Sai vì vi phạm bảo mật nghiêm trọng và không giới hạn được thời gian 10 phút dễ dàng.
- **B:** Sai vì mở public-write trên S3 là lỗ hổng bảo mật lớn, ai cũng có thể ghi đè hoặc xả rác vào bucket.
- **C (Đúng):** Đúng! S3 Pre-signed URL cho phép backend (có quyền IAM) tạo một đường dẫn tạm thời có thời hạn (10 phút) để client upload/download trực tiếp với S3 mà không cần mở public bucket hay truyền file qua app server.
- **D:** Sai vì trình duyệt web không hỗ trợ giao thức SFTP gốc và phức tạp không cần thiết.

</details>

---

[Mục lục SAA-C03](../00-tong-quan-va-lo-trinh-saa-c03.md)
