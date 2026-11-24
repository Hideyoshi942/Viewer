# Chương 01 – Course Introduction – AWS Certified Developer Associate

> **Nguồn:** 4 video của chương (001, 003, 005, 006). Chương này không có quiz.
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay (2026), bao gồm thông tin kỳ thi **DVA-C02**.

## Mục tiêu chương

Sau chương này bạn có thể:

- Nắm được phạm vi khoá học và kỳ thi **AWS Certified Developer – Associate (DVA-C02)**.
- Tạo một **tài khoản AWS** mới, hiểu sự khác nhau giữa **Free plan** và **Paid plan**.
- Biết cách học hiệu quả với khoá học (đặt mục tiêu, học kèm hands-on).

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001 | Course Introduction | Bài 1 – Giới thiệu khoá học |
| 003 | Creating an AWS Account | Bài 2 – Tạo tài khoản AWS |
| 005–006 | Important Message, About your instructor | Bài 3 – Lời nhắn & giới thiệu giảng viên |

---

## Bài 1 – Giới thiệu khoá học

### Lý thuyết

- Khoá học chuẩn bị cho kỳ thi **DVA-C02**, giảng viên **Stephane Maarek**.
- Khoá học bao phủ **hơn 30 dịch vụ AWS**, đi từng bước; người mới học IT/AWS vẫn theo được, không cần vội.
- **Không bắt buộc là developer** để thi đậu, nhưng có nền tảng lập trình sẽ giúp ích nhiều.
- Nếu đã có chứng chỉ **Solutions Architect Associate**: vẫn nên xem lại các bài nền tảng (các section đầu), nội dung riêng cho Developer bắt đầu nhiều từ sau section 7.
- **AWS là gì?** Một **cloud provider** cung cấp dịch vụ và server **on-demand**, **scale dễ dàng**. Nhờ AWS, một website phục vụ hàng triệu người có thể chỉ cần 3–5 kỹ sư. AWS vận hành amazon.com, Netflix…
- Giảng viên ví AWS như "**một nắm mì spaghetti**" – rất nhiều dịch vụ đan xen; khoá học sẽ giúp bạn đi qua từng phần cần cho kỳ thi.

### Kiến thức thực tế – Thông tin kỳ thi DVA-C02 (2026)

| Mục | Thông tin |
|---|---|
| Mã kỳ thi | **DVA-C02** (thay thế DVA-C01 từ đầu năm 2023) |
| Số câu | **65 câu** (50 câu tính điểm + 15 câu thử nghiệm không tính điểm, không biết câu nào) |
| Dạng câu | Multiple choice (1 đáp án) và multiple response (nhiều đáp án) |
| Thời gian | **130 phút** |
| Điểm đậu | **720 / 1000** (thang điểm scaled) |
| Lệ phí | **150 USD** |
| Hình thức | Tại trung tâm khảo thí **Pearson VUE** hoặc **thi online** có giám sát |
| Hiệu lực | **3 năm** |
| Ngôn ngữ | Có nhiều ngôn ngữ (Anh, Nhật, Hàn, Trung giản thể, Bồ Đào Nha (Brazil)…) |

**Các domain của DVA-C02:**

| Domain | Tỉ trọng |
|---|---|
| 1. Development with AWS Services | 32% |
| 2. Security | 26% |
| 3. Deployment | 24% |
| 4. Troubleshooting and Optimization | 18% |

**Mẹo về kỳ thi:**

- Thí sinh **không dùng tiếng Anh là ngôn ngữ mẹ đẻ** có thể đăng ký **ESL +30 phút** (accommodation) trong tài khoản AWS Certification **trước khi** đặt lịch thi.
- Thi đậu một chứng chỉ AWS sẽ nhận **voucher giảm 50%** cho lần thi tiếp theo (xem trong *AWS Certification account → Benefits*).
- Không bị trừ điểm khi trả lời sai → **đừng bỏ trống câu nào**.
- Luôn kiểm tra **exam guide chính thức** trên trang AWS Certification trước khi thi, vì AWS có thể cập nhật danh sách dịch vụ trong phạm vi.
- Khoá học được quay qua nhiều năm, nên một số tên dịch vụ trong video đã đổi (ví dụ *Kinesis Data Firehose → Amazon Data Firehose*, *Kinesis Data Analytics → Managed Service for Apache Flink*, *AWS SSO → IAM Identity Center*). Các file bài học sẽ ghi chú các thay đổi này.

### Ghi nhớ cho kỳ thi

- Kỳ thi hiện tại là **DVA-C02**: 65 câu, 130 phút, đậu 720/1000.
- Domain nặng nhất là **Development with AWS Services** (32%), sau đó là **Security** (26%).

---

## Bài 2 – Tạo tài khoản AWS

### Lý thuyết

- Tài khoản AWS gắn với một **root user email** và **account name**.
- Mật khẩu root: tối thiểu **8 ký tự**, có ít nhất **3 trong 4 loại**: chữ hoa, chữ thường, số, ký tự đặc biệt. **Tuyệt đối không làm mất** mật khẩu này.
- **Account plan** – hai lựa chọn:

| | **Free plan** | **Paid plan** |
|---|---|---|
| Credits | Khởi đầu khoảng **100 USD** credit, nhận tới **200 USD** tổng cộng | Cũng nhận credits như trên |
| Thẻ tín dụng | Vẫn phải nhập để **xác minh** (chống gian lận), **không bị trừ tiền** | Bị tính tiền khi dùng vượt credits |
| Hết credits | Tài khoản **tự đóng** | Tiếp tục chạy, trừ tiền vào thẻ |
| Phù hợp | **Học tập** an toàn | Workload **production** |

- Khoá học dùng **Free plan**: đủ credits để học. Nếu cần dịch vụ chỉ có ở gói trả phí, AWS sẽ nhắc nâng cấp (bạn tự quyết định).
- AWS có thể tạm giữ **1 USD** để xác minh thẻ, sau đó hoàn lại.
- Xác minh thêm bằng **số điện thoại**.
- **Support plan**: chọn **Basic support** (miễn phí).

### Kiến thức thực tế

- **Cập nhật:** mô hình **Free plan / Paid plan với credits** được AWS áp dụng cho **tài khoản mới từ 15/7/2025**, thay cho mô hình "Free Tier 12 tháng" cũ (tài khoản cũ vẫn theo Free Tier cũ). Free plan có thời hạn giới hạn (khoảng 6 tháng) hoặc tới khi hết credits; một số dịch vụ không dùng được ở Free plan. Kiểm tra trang *AWS Free Tier* để biết điều kiện chính xác hiện hành.
- Việc **nên làm ngay** sau khi tạo tài khoản (sẽ học kỹ ở chương IAM):
  - Bật **MFA cho root user**.
  - Tạo **user quản trị** (qua **IAM Identity Center** hoặc IAM user) và **không dùng root** cho công việc hằng ngày.
  - **Không tạo access key cho root**.
  - Tạo **AWS Budget** cảnh báo chi phí (ví dụ 5–10 USD/tháng):

    ```bash
    aws budgets create-budget --account-id 123456789012 \
      --budget '{"BudgetName":"monthly-10usd","BudgetLimit":{"Amount":"10","Unit":"USD"},"TimeUnit":"MONTHLY","BudgetType":"COST"}' \
      --notifications-with-subscribers '[{"Notification":{"NotificationType":"ACTUAL","ComparisonOperator":"GREATER_THAN","Threshold":80,"ThresholdType":"PERCENTAGE"},"Subscribers":[{"SubscriptionType":"EMAIL","Address":"you@example.com"}]}]'
    ```

- Chọn một **region** cố định để học (ví dụ `us-east-1` hoặc `ap-southeast-1`) giúp dễ dọn dẹp về sau – xem Chương 32.

### Ghi nhớ cho kỳ thi

- Phần tạo tài khoản không thi, nhưng **bảo vệ root user** (MFA, không dùng access key root) là kiến thức Security hay xuất hiện.

---

## Bài 3 – Lời nhắn & giới thiệu giảng viên

### Lý thuyết

- **Đánh giá khoá học**: Udemy sẽ hỏi bạn chấm sao – điểm áp dụng cho **toàn bộ khoá**; có thể chọn *Ask me later* nếu chưa sẵn sàng.
- Khoá học bắt đầu từ **nền tảng**; người đã có chứng chỉ Solutions Architect có thể lướt nhanh hoặc xem lại để ôn.
- **Giảng viên Stephane Maarek**: người Pháp, từng sống ở Mỹ, Úc và hiện ở Bồ Đào Nha; chuyên về **AWS certifications** và **Apache Kafka**; từng là data analyst, big data engineer, developer, solutions architect.
- Kết nối với giảng viên qua **LinkedIn** (tin tức AWS, khoá mới, chúc mừng học viên – đăng bài và tag khi thi đậu) và **Instagram** (gặp gỡ học viên khắp thế giới).
- **Đặt mục tiêu** học tập (ví dụ hoàn thành khoá trong 3 tuần) để tăng khả năng hoàn thành.
- Xem lại video bao nhiêu lần cũng được; chỉnh **tốc độ phát** cho phù hợp.

### Kiến thức thực tế

- Cách học hiệu quả với bộ tài liệu này: xem video → đọc phần *Lý thuyết* → **tự làm lại Hands On** trên tài khoản của mình → đọc *Kiến thức thực tế* → làm *Câu hỏi ôn tập* → **dọn dẹp tài nguyên** sau mỗi buổi.
- Gợi ý lịch: 1–2 chương/ngày cho phần nền tảng, các chương nặng (SQS/SNS/Kinesis, Lambda, DynamoDB, API Gateway, CI/CD, Cognito, KMS) nên dành 1–2 ngày mỗi chương.
- Trước khi thi nên làm thêm **đề luyện (practice exams)** và **Official Practice Question Set** miễn phí trên **AWS Skill Builder**.

---

## Tổng kết chương

| Chủ đề | Điều cần nhớ |
|---|---|
| Kỳ thi | DVA-C02, 65 câu, 130 phút, đậu 720/1000, 150 USD, hiệu lực 3 năm |
| Domain | Development 32%, Security 26%, Deployment 24%, Troubleshooting & Optimization 18% |
| Tài khoản AWS | Root email + mật khẩu mạnh; Free plan (credits, tự đóng khi hết) vs Paid plan |
| Thẻ tín dụng | Bắt buộc để xác minh, Free plan không bị trừ tiền |
| Support | Basic (miễn phí) |
| Việc nên làm ngay | MFA cho root, không dùng root hằng ngày, tạo Budget cảnh báo |
| Cách học | Đặt mục tiêu, làm hands-on, dọn dẹp tài nguyên |

---

## Câu hỏi ôn tập

*Câu hỏi tự soạn (chương này không có quiz trong khoá học).*

**Câu 1.** Kỳ thi AWS Certified Developer – Associate hiện hành có mã là gì?

- A. DVA-C01
- B. DVA-C02
- C. SAA-C03
- D. DOP-C02

<details><summary>Đáp án</summary>

**B. DVA-C02.** DVA-C01 là phiên bản cũ; SAA-C03 là Solutions Architect Associate; DOP-C02 là DevOps Engineer Professional.
</details>

**Câu 2.** Điểm tối thiểu để đậu DVA-C02 là bao nhiêu?

- A. 650/1000
- B. 700/1000
- C. 720/1000
- D. 750/1000

<details><summary>Đáp án</summary>

**C. 720/1000.**
</details>

**Câu 3.** Domain nào chiếm tỉ trọng lớn nhất trong DVA-C02?

- A. Security
- B. Deployment
- C. Troubleshooting and Optimization
- D. Development with AWS Services

<details><summary>Đáp án</summary>

**D.** Development with AWS Services chiếm 32%.
</details>

**Câu 4.** Với tài khoản AWS dùng **Free plan**, điều gì xảy ra khi bạn dùng hết credits?

- A. AWS tự động trừ tiền vào thẻ tín dụng
- B. Tài khoản tự động bị đóng (trừ khi nâng cấp lên Paid plan)
- C. Tài khoản chuyển sang Basic support
- D. Không có gì xảy ra, dịch vụ vẫn chạy miễn phí

<details><summary>Đáp án</summary>

**B.** Free plan không tính tiền vào thẻ; khi hết credits (hoặc hết thời hạn Free plan), tài khoản bị đóng nếu bạn không nâng cấp. Paid plan mới bị trừ tiền khi vượt credits.
</details>

**Câu 5.** Sau khi tạo tài khoản AWS, hành động nào là best practice đối với root user?

- A. Tạo access key cho root để dùng với AWS CLI
- B. Dùng root user cho mọi công việc hằng ngày
- C. Bật MFA cho root user và tạo user quản trị riêng cho công việc hằng ngày
- D. Chia sẻ mật khẩu root cho cả nhóm

<details><summary>Đáp án</summary>

**C.** Root có toàn quyền và không thể giới hạn bằng IAM policy; cần bảo vệ bằng MFA, không tạo access key, chỉ dùng cho các tác vụ bắt buộc cần root.
</details>

---

[Mục lục DVA-C02](../00-tong-quan-va-lo-trinh-dva-c02.md) | [Chương 03 →](ch03-getting-started-with-aws.md)
