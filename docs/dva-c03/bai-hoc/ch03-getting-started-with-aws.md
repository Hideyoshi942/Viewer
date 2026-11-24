# Chương 03 – Getting started with AWS

> **Nguồn:** 3 video của chương (chương không có quiz; phần câu hỏi ôn tập ở cuối là **câu hỏi tự soạn**).
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay. Kỳ thi hiện tại là **DVA-C02** (khoá học gốc mang mã DVA-C01).

## Mục tiêu chương

Sau chương này bạn có thể:

- Tóm tắt lịch sử và vị thế của AWS trên thị trường cloud.
- Giải thích hạ tầng toàn cầu của AWS: **Region**, **Availability Zone (AZ)**, **data center**, **Edge Location / Point of Presence (PoP)**.
- Nêu **4 tiêu chí chọn Region**: compliance, latency, tính sẵn có của dịch vụ, giá.
- Phân biệt **dịch vụ global** và **dịch vụ theo region (region-scoped)**.
- Làm quen với AWS Management Console: region selector, thanh tìm kiếm, danh sách dịch vụ, trang kiểm tra dịch vụ theo region.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001 | AWS Cloud Overview - Regions & AZ | Bài 1 – Tổng quan AWS Cloud, Region và AZ |
| 002 | [Important] AWS Console UI Update | Bài 2 – Lưu ý về giao diện Console mới |
| 003 | Tour of the AWS Console & Services in AWS | Bài 3 – Tham quan AWS Console |
| — | (không có quiz) | Câu hỏi ôn tập (tự soạn) |

---

## Bài 1 – Tổng quan AWS Cloud, Region và AZ

### Lý thuyết

#### Lịch sử và vị thế của AWS

| Mốc | Sự kiện |
|---|---|
| 2002 | AWS ra đời **nội bộ** tại amazon.com: Amazon nhận ra hạ tầng IT là thế mạnh và có thể "làm IT cho người khác" |
| 2004 | Dịch vụ công khai đầu tiên: **SQS** |
| 2006 | Ra mắt lại với **SQS, S3, EC2** |
| Sau đó | Mở rộng ra ngoài nước Mỹ (châu Âu…) |

- Khách hàng tiêu biểu: Dropbox, Netflix, Airbnb, NASA, McDonald's, 21st Century Fox, Activision…
- Theo video (số liệu 2023–2024): AWS là **Leader** trong Gartner Magic Quadrant nhiều năm liền, doanh thu khoảng 90 tỷ USD (2023), chiếm khoảng 31% thị phần (Q1 2024, Microsoft đứng thứ hai với khoảng 25%), hơn 1 triệu người dùng hoạt động.
- Có thể xây gần như mọi thứ trên AWS: chuyển IT doanh nghiệp lên cloud, backup & storage, big data analytics, host website, backend cho mobile/social app, game server…

#### Hạ tầng toàn cầu

| Khái niệm | Ý nghĩa |
|---|---|
| **Region** | Một **cụm data center** tại một khu vực địa lý (vd Ohio, Singapore, Sydney, Tokyo). Có tên/mã như `us-east-1`, `eu-west-3`. Các region nối với nhau bằng **mạng riêng của AWS** |
| **Availability Zone (AZ)** | Một region có nhiều AZ: thường là **3**, tối thiểu 3, tối đa 6. Mỗi AZ gồm **một hoặc nhiều data center rời rạc**, có nguồn điện, mạng, kết nối **dự phòng** |
| **Data center** | Thành phần vật lý trong AZ (AWS không công bố mỗi AZ có bao nhiêu data center) |
| **Edge Location / Point of Presence** | Hơn 400 PoP ở khoảng 90 thành phố, 40 quốc gia (theo video), dùng để **phân phối nội dung tới người dùng với độ trễ thấp nhất** (CloudFront, Route 53…) |

Ví dụ region Sydney: mã `ap-southeast-2`, có các AZ `ap-southeast-2a`, `ap-southeast-2b`, `ap-southeast-2c`.

- Các AZ **cách ly với nhau** để sự cố (thiên tai, mất điện) ở một AZ **không lan** sang AZ khác.
- Các AZ trong cùng region được nối với nhau bằng mạng **băng thông cao, độ trễ cực thấp**, và tập hợp lại tạo thành một region.

#### Chọn Region như thế nào? (câu hỏi hay gặp)

Câu trả lời là "tuỳ trường hợp", dựa trên 4 yếu tố:

| Yếu tố | Giải thích | Ví dụ |
|---|---|---|
| **Compliance** (tuân thủ pháp lý, data governance) | Chính phủ có thể yêu cầu dữ liệu không được rời khỏi quốc gia nếu không có sự cho phép | Dữ liệu ở Pháp phải ở Pháp nên chọn region Paris (`eu-west-3`) |
| **Latency** (độ trễ) | Đặt ứng dụng **gần người dùng** | Người dùng ở Mỹ thì không nên deploy ở Úc |
| **Dịch vụ có sẵn** | **Không phải region nào cũng có đủ dịch vụ/tính năng** | Kiểm tra trước khi chọn region |
| **Pricing** (giá) | Giá **khác nhau giữa các region** | Xem trang pricing của từng dịch vụ |

#### Dịch vụ global và dịch vụ theo region

| Loại | Ví dụ |
|---|---|
| **Global** | IAM, Route 53, CloudFront, WAF |
| **Region-scoped** (đa số) | EC2, Elastic Beanstalk, Lambda, Rekognition… |

- Dùng một dịch vụ region-scoped ở region khác thì giống như **bắt đầu dùng lại từ đầu**: tài nguyên ở region này không hiện ở region kia.
- Muốn biết dịch vụ có ở region nào thì tra **bảng dịch vụ theo region** (Regional Services / Region table).

### Kiến thức thực tế

- **Số liệu trong video đã cũ.** Số region, AZ và PoP tăng liên tục. Hãy xem số mới nhất tại trang *AWS Global Infrastructure* (`aws.amazon.com/about-aws/global-infrastructure`). Đề thi không hỏi con số cụ thể.
- **Không phải mọi region đều bật sẵn.** Các region ra mắt từ 2019 trở đi (vd `ap-east-1` Hong Kong, `me-south-1` Bahrain, `af-south-1` Cape Town, `ap-southeast-3` Jakarta…) là **opt-in region**: phải bật trong *Account → AWS Regions* trước khi dùng.

  ```bash
  # Liệt kê region và trạng thái opt-in
  aws ec2 describe-regions --all-regions \
    --query "Regions[].{Name:RegionName,Status:OptInStatus}" --output table

  # Liệt kê AZ của region hiện tại (kèm Zone ID)
  aws ec2 describe-availability-zones --region ap-southeast-1 \
    --query "AvailabilityZones[].{Name:ZoneName,Id:ZoneId}" --output table
  ```

- **AZ Name và AZ ID:** tên `us-east-1a` ở tài khoản A **có thể là AZ vật lý khác** với `us-east-1a` ở tài khoản B (AWS xáo trộn ánh xạ để cân tải). Khi cần khớp AZ giữa nhiều tài khoản, dùng **AZ ID** (vd `use1-az1`).
- **Các mở rộng của hạ tầng** (biết tên là đủ): **Local Zones** (đưa compute/storage tới gần thành phố lớn), **Wavelength Zones** (hạ tầng trong mạng 5G của nhà mạng), **Outposts** (rack AWS đặt tại data center của bạn).
- **Thiết kế high availability:** luôn trải tài nguyên quan trọng (EC2 sau ELB, RDS Multi-AZ…) trên **ít nhất 2 AZ**. Một AZ hỏng không được làm sập ứng dụng.
- **Trong code/CLI luôn chỉ định region rõ ràng** (`--region`, `AWS_REGION`, `region_name=`). Lỗi kinh điển là tạo tài nguyên ở một region rồi đi tìm ở region khác.

  ```python
  import boto3
  ec2 = boto3.client("ec2", region_name="ap-southeast-1")
  print([az["ZoneName"] for az in ec2.describe_availability_zones()["AvailabilityZones"]])
  ```

### Ghi nhớ cho kỳ thi

- Region = cụm data center; **AZ = 1 hoặc nhiều data center rời rạc, cách ly sự cố**; thường 3 AZ/region (min 3, max 6).
- Chọn region theo **compliance, latency, dịch vụ có sẵn, giá**.
- **IAM, Route 53, CloudFront, WAF là global**; còn lại đa số là region-scoped.
- Edge Location / PoP dùng để phân phối nội dung độ trễ thấp (CloudFront).

---

## Bài 2 – Lưu ý về giao diện Console mới

### Lý thuyết

- AWS Console đã đổi giao diện: nền trắng sáng hơn, nút **bo tròn** màu xanh đậm (giao diện cũ có màu xám, xanh nhạt, nút vuông).
- **Khác về hình thức, nhưng cách dùng (usability) giữ nguyên.** Nếu video quay trên giao diện cũ, bạn vẫn thao tác được trên giao diện mới.

### Kiến thức thực tế

- Console được AWS cập nhật liên tục. Vị trí menu có thể khác video nhưng **tên tính năng và khái niệm thì giữ nguyên**. Khi không tìm thấy nút, hãy dùng **thanh tìm kiếm** (phím tắt `Alt+S` trên Windows, `Option+S` trên macOS) để nhảy thẳng tới dịch vụ hoặc tính năng.
- Một số điểm đổi mới đáng chú ý:
  - **Multi-session:** đăng nhập tối đa **5 danh tính** (nhiều tài khoản/role) cùng lúc trong một trình duyệt. Bật trong menu tài khoản ở góc phải trên.
  - **Unified Settings:** đặt ngôn ngữ, region mặc định, chế độ sáng/tối (dark mode) cho console.
  - **CloudShell** (biểu tượng terminal trên thanh trên cùng): shell có sẵn AWS CLI, đã xác thực bằng danh tính đang đăng nhập console, rất tiện cho các bài hands-on.
- Khi console thay đổi quá nhiều, **AWS CLI** là cách thao tác ổn định nhất: cú pháp lệnh hiếm khi thay đổi.

### Ghi nhớ cho kỳ thi

- Không có nội dung thi. Giao diện console không bao giờ là trọng tâm của đề thi.

---

## Bài 3 – Tham quan AWS Console

### Lý thuyết

- **Console Home** gồm: danh sách dịch vụ truy cập gần đây (*Recently visited*), tình trạng sức khoẻ dịch vụ (*AWS Health*), thông tin chi phí và mức sử dụng (*Cost and usage*), các hướng dẫn xây giải pháp. Trang này thay đổi thường xuyên.
- **Region selector** (góc phải trên): chọn region **gần bạn về địa lý** để có độ trễ thấp nhất (vd ở Việt Nam có thể chọn Singapore `ap-southeast-1`). Bạn **không cần ở trong region đó** về mặt vật lý mới dùng được.
- **Tìm dịch vụ** theo 2 cách:
  1. Menu **Services** ở góc trái trên: xem theo **thứ tự alphabet** hoặc theo **nhóm (category)**, vd Compute, Storage…
  2. **Thanh tìm kiếm**: gõ tên dịch vụ (vd `route 53`), kết quả gồm dịch vụ, **tính năng (features)** của dịch vụ (nhảy thẳng tới, vd mục *Domain names* của Route 53), blog, bài viết knowledge base, tài liệu.
- **Dịch vụ global**: mở **Route 53** thì góc phải trên hiện chữ **Global**, tức không cần chọn region; ở region nào cũng thấy cùng một giao diện. Đây là **ngoại lệ**, không phải quy tắc.
- **Dịch vụ theo region**: mở **EC2** thì góc phải trên hiện tên region (vd *Ireland*). Đổi region (vd sang *Canada*) thì danh sách tài nguyên khác hẳn. Vì vậy hãy **giữ nguyên một region trong suốt khoá học**.
- **AWS Regional Services list** (tìm "AWS global infrastructure" trên Google): bảng các dịch vụ có ở từng region. Nếu một dịch vụ trong bài hands-on không có ở region của bạn, hãy tra bảng này và **đổi region** nếu cần.

### Kiến thức thực tế

- **S3 là trường hợp dễ nhầm**: console S3 hiện chữ *Global* và liệt kê bucket của mọi region, nhưng **mỗi bucket thuộc về một region cụ thể**, và tên bucket phải là duy nhất trên toàn cầu. S3 vẫn là dịch vụ region-scoped về mặt dữ liệu.
- **IAM là global**: user, role, policy tạo một lần dùng cho mọi region.
- Tài khoản mới: chương trình **Free Tier** của AWS đã thay đổi từ giữa năm 2025 (tài khoản mới nhận **credit** và có "free plan" giới hạn thời gian thay vì mô hình 12 tháng cũ). Trước khi làm hands-on hãy xem trang Free Tier hiện hành và **đặt AWS Budgets** để nhận cảnh báo chi phí.

  ```bash
  # Ví dụ: budget 10 USD/tháng, cảnh báo qua email khi chi phí thực tế vượt 80%
  aws budgets create-budget --account-id 123456789012 \
    --budget '{"BudgetName":"monthly-10usd","BudgetLimit":{"Amount":"10","Unit":"USD"},"TimeUnit":"MONTHLY","BudgetType":"COST"}' \
    --notifications-with-subscribers '[{"Notification":{"NotificationType":"ACTUAL","ComparisonOperator":"GREATER_THAN","Threshold":80,"ThresholdType":"PERCENTAGE"},"Subscribers":[{"SubscriptionType":"EMAIL","Address":"ban@example.com"}]}]'
  ```

- Không dùng **root user** cho công việc hằng ngày: bật MFA cho root, tạo IAM user/Identity Center user cho bản thân (xem chương 04).

### Ghi nhớ cho kỳ thi

- Console của dịch vụ **global** (IAM, Route 53, CloudFront, WAF) không yêu cầu chọn region.
- Tài nguyên region-scoped **chỉ thấy được ở region đã tạo**.
- Dịch vụ không có ở mọi region, nên kiểm tra danh sách dịch vụ theo region.

---

## Tổng kết chương

| Chủ đề | Điều cần nhớ |
|---|---|
| Lịch sử | 2002 nội bộ; 2004 SQS; 2006 SQS + S3 + EC2 |
| Region | Cụm data center, có mã như `us-east-1`; đa số dịch vụ là region-scoped |
| AZ | Thường 3 (min 3, max 6) mỗi region; 1+ data center rời rạc, dự phòng, cách ly sự cố; nối bằng mạng độ trễ cực thấp |
| Edge Location / PoP | Phân phối nội dung độ trễ thấp (CloudFront…) |
| Chọn region | Compliance, Latency, Dịch vụ có sẵn, Giá |
| Dịch vụ global | IAM, Route 53, CloudFront, WAF |
| Console | Region selector, Services menu, thanh tìm kiếm (dịch vụ + features), CloudShell |
| Tra dịch vụ theo region | Regional Services List hoặc SSM public parameters `/aws/service/global-infrastructure/...` |

---

## Câu hỏi ôn tập

*Chương này không có quiz trong khoá học. Các câu dưới đây là **câu hỏi tự soạn** theo phong cách đề thi. Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Một công ty Pháp phải đảm bảo dữ liệu khách hàng không rời khỏi lãnh thổ Pháp theo quy định pháp luật. Yếu tố nào là **quyết định** khi chọn AWS Region?

- A. Giá dịch vụ thấp nhất
- B. Compliance (tuân thủ quy định về dữ liệu)
- C. Số lượng AZ nhiều nhất
- D. Region có nhiều dịch vụ mới nhất

<details><summary>Đáp án</summary>

**B.** Khi có ràng buộc pháp lý về nơi lưu dữ liệu, compliance là yếu tố bắt buộc. Các yếu tố khác (giá, dịch vụ, latency) chỉ xét sau khi đã đáp ứng compliance.
</details>

**Câu 2.** Phát biểu nào đúng về Availability Zone?

- A. Mỗi AZ là đúng một data center
- B. Mỗi AZ gồm một hoặc nhiều data center rời rạc, có nguồn điện, mạng và kết nối dự phòng, được cách ly khỏi sự cố của AZ khác
- C. Các AZ trong một region dùng chung nguồn điện
- D. Mỗi region có đúng 2 AZ

<details><summary>Đáp án</summary>

**B.** AZ có thể gồm nhiều data center và được thiết kế để sự cố không lan sang AZ khác. Region thường có 3 AZ (min 3, max 6).
</details>

**Câu 3.** Dịch vụ nào sau đây là dịch vụ **global**?

- A. Amazon EC2
- B. AWS Lambda
- C. AWS IAM
- D. AWS Elastic Beanstalk

<details><summary>Đáp án</summary>

**C.** IAM là global (cùng với Route 53, CloudFront, WAF). EC2, Lambda, Elastic Beanstalk là region-scoped.
</details>

**Câu 4.** Developer tạo một EC2 instance ở `eu-west-1`. Hôm sau mở EC2 console thì không thấy instance đâu, dù không ai xoá. Nguyên nhân khả dĩ nhất là gì?

- A. Instance bị AWS tự động terminate sau 24 giờ
- B. Console đang chọn một region khác `eu-west-1`
- C. EC2 là dịch vụ global nên instance đã chuyển sang region khác
- D. Cần quyền IAM đặc biệt để xem instance ở dashboard

<details><summary>Đáp án</summary>

**B.** EC2 là dịch vụ region-scoped: console chỉ hiển thị tài nguyên của region đang chọn. Đổi region selector về `eu-west-1` sẽ thấy instance.
</details>

**Câu 5.** Người dùng chủ yếu của ứng dụng ở Đông Nam Á, nhưng ứng dụng đang chạy ở `us-east-1` và bị phàn nàn về độ trễ. Không có ràng buộc pháp lý. Hành động nào phù hợp nhất?

- A. Tăng kích thước EC2 instance ở `us-east-1`
- B. Triển khai ứng dụng ở region gần người dùng, ví dụ `ap-southeast-1`
- C. Thêm AZ trong `us-east-1`
- D. Chuyển sang dịch vụ global

<details><summary>Đáp án</summary>

**B.** Latency phụ thuộc khoảng cách địa lý tới người dùng. Đặt ứng dụng gần người dùng (và/hoặc dùng CloudFront qua các edge location) giúp giảm độ trễ.
</details>

**Câu 6.** Thành phần hạ tầng nào của AWS được dùng chủ yếu để phân phối nội dung tới người dùng cuối với độ trễ thấp nhất?

- A. Availability Zone
- B. Region
- C. Edge Location / Point of Presence
- D. VPC

<details><summary>Đáp án</summary>

**C.** Edge Location / PoP (CloudFront, Route 53…) đặt ở rất nhiều thành phố, gần người dùng hơn nhiều so với region.
</details>

**Câu 7.** Một bài hướng dẫn yêu cầu dùng dịch vụ X, nhưng bạn không tìm thấy dịch vụ này trong console ở region đang dùng. Bạn nên làm gì trước tiên?

- A. Mở ticket với AWS Support để kích hoạt dịch vụ
- B. Kiểm tra danh sách dịch vụ theo region (Regional Services List) và chuyển sang region có hỗ trợ dịch vụ đó
- C. Tạo tài khoản AWS mới
- D. Nâng cấp lên gói Enterprise Support

<details><summary>Đáp án</summary>

**B.** Không phải region nào cũng có mọi dịch vụ. Tra bảng dịch vụ theo region rồi đổi sang region phù hợp.
</details>

**Câu 8.** Phát biểu nào **sai** về hạ tầng toàn cầu của AWS?

- A. Các region được kết nối với nhau qua mạng riêng của AWS
- B. Các AZ trong cùng region được nối bằng mạng băng thông cao, độ trễ thấp
- C. Mọi dịch vụ AWS đều có sẵn ở mọi region
- D. Giá dịch vụ có thể khác nhau giữa các region

<details><summary>Đáp án</summary>

**C** là phát biểu sai. Tính sẵn có của dịch vụ khác nhau giữa các region, đây cũng là một trong 4 tiêu chí chọn region.
</details>

---

[← Chương 01](ch01-course-introduction-aws-certified-deve.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chương 04 →](ch04-iam-aws-cli.md)

