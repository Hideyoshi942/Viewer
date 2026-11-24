# Chương 15 – CloudFront

> **Nguồn:** 12 video của chương + *CloudFront Quiz* (9 câu).
> **Ghi chú:** Phần *Kiến thức thực tế* là phần bổ sung ngoài video để bám sát thực tế hiện nay (2026). Kỳ thi hiện hành là **DVA-C02**. Bài 12 (CloudFront Functions và Lambda@Edge) là phần bổ sung ngoài video nhưng thường xuất hiện trong đề.

## Mục tiêu chương

Sau chương này bạn có thể:

- Giải thích **CloudFront** (CDN), edge location, các loại **origin** và phân biệt CloudFront với **S3 Cross-Region Replication**.
- Tạo distribution phục vụ S3 bucket **private** bằng **Origin Access Control (OAC)**.
- Hiểu **Cache Key**, **Cache Policy**, **Origin Request Policy**, **TTL** và tối ưu **cache hit ratio**.
- Cấu hình **Cache Behaviors** theo path pattern và thực hiện **Cache Invalidation**.
- Kết nối CloudFront tới ALB/EC2 qua **VPC Origins** (cách mới) hoặc public origin (cách cũ).
- Dùng **Geo Restriction**, **Signed URL / Signed Cookie** với **Trusted Key Group**.
- Nắm các khái niệm nâng cao: **Price Classes**, multiple origins, **Origin Groups** (failover), **Field-Level Encryption**, **Real-time Logs**.
- Phân biệt **CloudFront Functions** và **Lambda@Edge**.

## Danh sách bài học

| # | Video | Bài học |
|---|---|---|
| 001 | CloudFront - Overview | Bài 1 – Tổng quan CloudFront |
| 002 | CloudFront Hands On | Bài 2 – Tạo distribution cho S3 với OAC |
| 003, 006 (phần 1) | Caching & Caching Policies | Bài 3 – Caching, Cache Policy và Origin Request Policy |
| 005, 006 (phần 2) | Cache Behaviors | Bài 4 – Cache Behaviors |
| 004, 006 (phần 3) | Cache Invalidations | Bài 5 – Cache Invalidation |
| 007 | ALB/EC2 as an Origin | Bài 6 – ALB/EC2 làm origin và VPC Origins |
| 008 | Geo Restriction | Bài 7 – Geo Restriction |
| 009 | Signed URL / Cookies | Bài 8 – Signed URL và Signed Cookie |
| 010 | Signed URL - Key Groups + Hands On | Bài 9 – Trusted Key Group |
| 011 | CloudFront Advanced Concepts | Bài 10 – Price Classes, Origin Groups, Field-Level Encryption |
| 012 | CloudFront - Real Time Logs | Bài 11 – Real-time Logs |
| (bổ sung) | — | Bài 12 – CloudFront Functions và Lambda@Edge |
| Quiz | CloudFront Quiz | Câu hỏi ôn tập |

---

## Bài 1 – Tổng quan CloudFront

### Lý thuyết

- **CloudFront** là **Content Delivery Network (CDN)**. Đề thi nhắc tới **CDN → nghĩ ngay CloudFront**.
- **Tăng hiệu năng đọc** bằng cách **cache nội dung tại các edge location** trên toàn cầu → người dùng ở mọi nơi có **độ trễ thấp**, trải nghiệm tốt hơn.
- Gồm hàng trăm **Points of Presence (PoP)**: edge location và regional edge cache.
- **Chống DDoS**: nội dung phân tán toàn cầu, kết hợp **AWS Shield** và **WAF** (chương Security).
- Ví dụ: S3 bucket (website) ở **Úc**, người dùng ở **Mỹ** gọi tới edge location ở Mỹ → edge lấy nội dung từ Úc rồi cache lại. Người dùng Mỹ tiếp theo được phục vụ **ngay từ edge**, không phải đi tới Úc.

#### Các loại origin

| Origin | Mô tả |
|---|---|
| **S3 bucket** | Phân phối và cache file tại edge; cũng có thể **upload file vào S3 qua CloudFront**. Bảo mật kết nối CloudFront ↔ S3 bằng **Origin Access Control (OAC)** |
| **VPC Origin** | Ứng dụng nằm trong **private subnet**: private ALB, private NLB, private EC2 instance |
| **Custom origin (HTTP)** | **S3 static website** (phải bật static website hosting trước), hoặc bất kỳ **public HTTP backend** nào (ví dụ public ALB) |

#### Cách hoạt động

1. Client gửi HTTP request tới **edge location** gần nhất.
2. Edge kiểm tra **cache**. Có → trả về ngay.
3. Không có → **forward tới origin**, nhận kết quả, **lưu vào cache local**, trả cho client.
4. Client khác yêu cầu cùng nội dung tại cùng edge → phục vụ từ cache.

Với S3 origin: edge location (Los Angeles, São Paulo…) lấy dữ liệu từ bucket qua **mạng riêng của AWS**; bucket được bảo vệ bằng **OAC + bucket policy**.

#### CloudFront hay S3 Cross-Region Replication (CRR)?

| | CloudFront | S3 Cross-Region Replication |
|---|---|---|
| Phạm vi | **Mạng edge toàn cầu** (video: ~216 PoP) | Phải cấu hình **cho từng region** cần replicate |
| Cơ chế | File được **cache** tại edge (ví dụ TTL 1 ngày) | File được cập nhật **gần real-time**, **không cache** |
| Truy cập | Đọc qua CDN | Bản sao **chỉ đọc** |
| Phù hợp | **Nội dung tĩnh** cần có mặt ở mọi nơi | **Nội dung động**, cần độ trễ thấp ở **một vài region** |

### Kiến thức thực tế

- **Cập nhật số liệu:** con số ~216 PoP trong video đã cũ; hiện AWS công bố mạng CloudFront có **hơn 600 PoP** cùng các **Regional Edge Cache** (tầng cache trung gian giữa edge và origin, giúp giảm tải origin). Hãy coi con số cụ thể là thay đổi theo thời gian.
- **Origin Shield**: thêm một lớp cache tập trung ở một region trước origin → tăng cache hit, giảm số request về origin (tính phí thêm).
- Ngoài S3/ALB/EC2, CloudFront còn hỗ trợ origin là **API Gateway**, **Lambda Function URL**, **Elemental MediaPackage/MediaStore**…
- CloudFront hỗ trợ **HTTP/2, HTTP/3**, nén **Gzip/Brotli**, **TLS** miễn phí qua **ACM** (chứng chỉ cho CloudFront **bắt buộc tạo ở `us-east-1`**).
- Data transfer từ origin AWS (S3, ALB, EC2) **về CloudFront miễn phí**; bạn trả phí data transfer **ra Internet từ CloudFront** và số request.

### Ghi nhớ cho kỳ thi

- **CDN = CloudFront**; cache tại edge, giảm latency, chống DDoS (Shield, WAF).
- S3 private + CloudFront → **OAC**.
- **Nội dung tĩnh toàn cầu → CloudFront; nội dung động ở vài region cụ thể → S3 CRR.**

---

## Bài 2 – Tạo distribution cho S3 với OAC

### Lý thuyết

- Mục tiêu: phục vụ file trong **S3 bucket private** qua CloudFront mà **không cần public bucket**.
- Truy cập trực tiếp **Object URL** của S3 → **Access Denied** (object không public). Nút **Open** trên console sinh **pre-signed URL** nên mở được (nhưng ảnh nhúng trong `index.html` vẫn lỗi vì ảnh không public).
- Khi tạo distribution với tuỳ chọn **Allow private S3 bucket access to CloudFront**, AWS tự tạo **OAC** và tự cập nhật **bucket policy** cho phép distribution đọc bucket.

### Kiến thức thực tế

- Đặt **Default root object = `index.html`** để truy cập `/` không bị Access Denied.
- **OAI là cách cũ → dùng OAC.** Origin Access Identity (OAI) là cơ chế legacy; **Origin Access Control (OAC)** được khuyến nghị vì hỗ trợ mọi region (kể cả region mới), **SSE-KMS**, các method ghi (`PUT`/`POST`/`DELETE`), và ký request bằng **SigV4**. Bucket policy kiểu OAC dùng principal `cloudfront.amazonaws.com` + `AWS:SourceArn`; kiểu OAI cũ dùng principal `arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity ...`.
- Nếu bucket mã hoá **SSE-KMS**, phải thêm vào **key policy** quyền `kms:Decrypt` cho principal `cloudfront.amazonaws.com` với cùng điều kiện `AWS:SourceArn`.
- **OAC chỉ dùng với REST endpoint của S3**, không dùng với **S3 website endpoint** (website endpoint là custom origin, buộc bucket phải public). Muốn SPA/website private, dùng REST endpoint + OAC + default root object + custom error response (403/404 → `/index.html` cho SPA).
- **CloudFront flat-rate pricing plans** (Free/Pro/Business/Premium, ra mắt cuối 2025) là điểm mới mà video đang dùng; tài liệu cũ chỉ có mô hình **pay-as-you-go**. Kiểm tra trang giá để biết hạn mức hiện tại của từng plan.
- Template CloudFormation đầy đủ cho S3 + OAC + distribution:

  ```yaml
  AWSTemplateFormatVersion: "2010-09-09"
  Description: Private S3 bucket served by CloudFront with OAC

  Resources:
    ContentBucket:
      Type: AWS::S3::Bucket

    OAC:
      Type: AWS::CloudFront::OriginAccessControl
      Properties:
        OriginAccessControlConfig:
          Name: !Sub "${AWS::StackName}-oac"
          OriginAccessControlOriginType: s3
          SigningBehavior: always
          SigningProtocol: sigv4

    Distribution:
      Type: AWS::CloudFront::Distribution
      Properties:
        DistributionConfig:
          Enabled: true
          DefaultRootObject: index.html
          PriceClass: PriceClass_100
          HttpVersion: http2and3
          Origins:
            - Id: s3origin
              DomainName: !GetAtt ContentBucket.RegionalDomainName
              OriginAccessControlId: !GetAtt OAC.Id
              S3OriginConfig:
                OriginAccessIdentity: ""      # để trống khi dùng OAC
          DefaultCacheBehavior:
            TargetOriginId: s3origin
            ViewerProtocolPolicy: redirect-to-https
            CachePolicyId: 658327ea-f89d-4fab-a63d-7e88639e58f6   # Managed-CachingOptimized
            Compress: true

    BucketPolicy:
      Type: AWS::S3::BucketPolicy
      Properties:
        Bucket: !Ref ContentBucket
        PolicyDocument:
          Version: "2012-10-17"
          Statement:
            - Effect: Allow
              Principal:
                Service: cloudfront.amazonaws.com
              Action: s3:GetObject
              Resource: !Sub "${ContentBucket.Arn}/*"
              Condition:
                StringEquals:
                  AWS:SourceArn: !Sub "arn:aws:cloudfront::${AWS::AccountId}:distribution/${Distribution}"

  Outputs:
    DistributionDomainName:
      Value: !GetAtt Distribution.DomainName
    DistributionId:
      Value: !Ref Distribution
  ```

- Tạo/cập nhật distribution mất vài phút để triển khai ra toàn bộ edge (trạng thái *Deploying* → *Enabled*).

### Ghi nhớ cho kỳ thi

- Bắt buộc người dùng **chỉ truy cập S3 qua CloudFront** → **OAC + bucket policy** chỉ cho phép distribution (principal `cloudfront.amazonaws.com`, điều kiện `AWS:SourceArn`).
- Đề cũ có thể ghi **OAI** — hiểu là cơ chế tương đương đời cũ; đáp án hiện đại là **OAC**.

---

## Bài 3 – Caching, Cache Policy và Origin Request Policy

### Lý thuyết

- **Cache nằm ở từng edge location** → có bao nhiêu edge thì có bấy nhiêu cache.
- Mỗi object trong cache được định danh bằng **Cache Key**.
- Request tới edge: kiểm tra có trong cache không và đã **hết hạn (TTL)** chưa → nếu không có/hết hạn thì **forward tới origin**, kết quả trả về được **cache** cho request sau.
- Mục tiêu: **tối đa hoá cache hit ratio**, **giảm request về origin**.
- Không muốn chờ TTL hết hạn → **invalidation** (Bài 5).

#### Cache Key

- Mặc định = **hostname + resource portion của URL**. Ví dụ `mywebsite.com` + `/content/stories/example-story.html`.
- Khi nội dung thay đổi theo **người dùng, thiết bị, ngôn ngữ, vị trí**… cần thêm thông tin vào cache key: **HTTP headers, cookies, query strings** → định nghĩa bằng **Cache Policy**.

#### Cache Policy

| Thành phần | Tuỳ chọn |
|---|---|
| **HTTP Headers** | `None` / `Whitelist` (chọn header cụ thể) |
| **Cookies** | `None` / `Whitelist` / `Include All-Except` / `All` |
| **Query Strings** | `None` / `Whitelist` / `Include All-Except` / `All` |
| **TTL** | Từ **0 giây đến 1 năm** (min/max/default TTL); origin có thể điều khiển qua header **`Cache-Control`** hoặc **`Expires`** |

- Có thể tự tạo hoặc dùng **managed policy** của AWS.
- **Rất quan trọng:** mọi header, cookie, query string **nằm trong cache key** sẽ **tự động được forward tới origin**.
- Ví dụ header: request có `Accept-Language: fr-fr` (muốn đọc blog tiếng Pháp):
  - **None**: header không vào cache key và **không được forward** → **hiệu năng cache tốt nhất**.
  - **Whitelist** `Accept-Language`: header vào cache key và được forward → origin trả đúng ngôn ngữ.
- Ví dụ query string: `/image/cat.jpg?border=red&size=large`:
  - **None**: không vào cache key, không forward.
  - **Whitelist**: chỉ những query string được chọn.
  - **Include All-Except**: tất cả trừ danh sách loại bỏ.
  - **All**: tất cả vào cache key và được forward → **hiệu năng cache kém nhất**.

#### Origin Request Policy

- Muốn **gửi thêm** thông tin tới origin **nhưng không đưa vào cache key** → **Origin Request Policy**.
- Có thể thêm: HTTP headers, cookies, query strings; thêm **custom header** hoặc **CloudFront HTTP headers** (ví dụ `CloudFront-Viewer-Country`) dù viewer không gửi — ví dụ truyền **API key / secret header** tới origin.
- Tự tạo hoặc dùng managed policy.

#### So sánh

| | Cache Policy | Origin Request Policy |
|---|---|---|
| Quyết định | **Cache key** + TTL | **Những gì gửi thêm tới origin** |
| Ảnh hưởng cache | Có (càng nhiều thành phần → càng ít cache hit) | **Không** |
| Ví dụ | Cache theo hostname, resource, header `Authorization` | Gửi thêm `User-Agent`, cookie `session_id`, query `ref` tới origin |

### Kiến thức thực tế

- Managed policy hay dùng:

| Policy | Dùng khi |
|---|---|
| `Managed-CachingOptimized` | Nội dung tĩnh (S3) — cache key tối giản, bật nén |
| `Managed-CachingDisabled` | API/nội dung động không cache (TTL 0) |
| Origin request `Managed-AllViewer` | Forward mọi header/cookie/query tới origin (ALB/EC2) |
| Origin request `Managed-AllViewerExceptHostHeader` | Origin là **API Gateway / Lambda Function URL** (không được forward `Host` header của viewer, nếu không sẽ lỗi 403) |
| Origin request `Managed-CORS-S3Origin` | S3 origin cần header CORS (`Origin`…) |

- Giá trị TTL mặc định khi origin không gửi `Cache-Control`: default TTL **86.400 giây (1 ngày)**, max TTL **31.536.000 giây (1 năm)**.
- `Cache-Control: max-age` (và `s-maxage` dành riêng cho cache chia sẻ như CDN) từ origin sẽ được dùng nếu nằm trong khoảng min–max TTL của cache policy.
- **Lỗi hay gặp:** forward **tất cả** cookie/header (ví dụ cookie analytics thay đổi theo từng user) → cache key gần như duy nhất cho mỗi request → cache hit ratio ≈ 0, origin quá tải. Chỉ đưa vào cache key những gì **thật sự làm nội dung khác đi**.
- **Cập nhật:** cấu hình kiểu cũ *Legacy cache settings* (forward headers/cookies/query trực tiếp trong behavior) vẫn còn nhưng AWS khuyến nghị dùng **Cache Policy + Origin Request Policy**. Ngoài ra có **Response Headers Policy** để thêm header trả về viewer (CORS, security headers như HSTS, CSP).
- Theo dõi **cache hit rate** trong CloudFront console (Reports & analytics → Cache statistics) hoặc metric CloudWatch (cần bật additional metrics).

### Ghi nhớ cho kỳ thi

- Cache key mặc định: **hostname + URL path**; mở rộng bằng **headers, cookies, query strings** qua **Cache Policy**. **Không cache theo HTTP method**.
- Thành phần trong cache key **tự động forward** tới origin.
- Cần gửi thêm tới origin mà **không ảnh hưởng cache** → **Origin Request Policy**.
- Càng ít thành phần trong cache key → cache hit càng cao.

---

## Bài 4 – Cache Behaviors

### Lý thuyết

- **Cache behavior** = cấu hình riêng (origin, cache policy, …) cho từng **URL path pattern**. Ví dụ:
  - `/images/*` → S3 bucket
  - `/api/*` → Application Load Balancer
  - `/*` → origin mặc định (**default cache behavior**)
- Có thể route tới **origin** hoặc **origin group** khác nhau theo loại nội dung/path.
- **Default cache behavior** luôn là `/*` và **luôn được xử lý cuối cùng**: CloudFront tìm behavior khớp **cụ thể nhất** trước, không có thì dùng default.

#### Use case 1: Chặn truy cập S3 khi chưa đăng nhập

1. Behavior `/login` → origin **EC2 instance**. EC2 xác thực user rồi **sinh CloudFront Signed Cookies** trả về.
2. Default behavior `/*` → S3 bucket, cấu hình **chỉ chấp nhận request có signed cookies**.
3. User chưa login truy cập `/*` → bị từ chối → chuyển hướng về `/login`. User đã login dùng signed cookie để truy cập file S3.

#### Use case 2: Tối đa hoá cache hit

- **Nội dung tĩnh** → S3: cache policy **không có header/session** → cache theo resource → cache hit tối đa.
- **Nội dung động** (REST API) → ALB + EC2: cache theo **header, cookie** phù hợp với cache policy đã định nghĩa.

### Kiến thức thực tế

- Mỗi behavior cấu hình riêng: **Allowed HTTP methods** (`GET, HEAD` / `+OPTIONS` / tất cả), **Viewer protocol policy** (HTTP and HTTPS / Redirect HTTP to HTTPS / HTTPS only), **Restrict viewer access** (signed URL/cookie), nén, function associations (CloudFront Functions/Lambda@Edge), response headers policy.
- Chỉ request **GET, HEAD** (và tuỳ chọn **OPTIONS**) được cache; `POST/PUT/DELETE` luôn đi thẳng tới origin.
- Path pattern **phân biệt hoa thường**, hỗ trợ `*` và `?`.
- Pattern phổ biến: một domain duy nhất cho cả frontend (S3) và backend (`/api/*` → ALB/API Gateway) → **tránh CORS** vì cùng origin.

### Ghi nhớ cho kỳ thi

- Route theo path đến origin khác nhau → **Cache Behaviors**; default là `/*`, xử lý **cuối cùng**.
- Kết hợp behavior `/login` + **signed cookies** để chặn truy cập nội dung.

---

## Bài 5 – Cache Invalidation

### Lý thuyết

- Khi cập nhật origin, edge **không biết** và chỉ lấy nội dung mới **khi TTL hết hạn**.
- Muốn người dùng thấy nội dung mới **ngay** → **CloudFront Invalidation**: buộc làm mới toàn bộ hoặc một phần cache (bỏ qua TTL).
- Truyền vào **file path**: tất cả `/*` hoặc path cụ thể như `/index.html`, `/images/*`.
- Ví dụ: TTL file = 1 ngày; admin cập nhật `index.html` và ảnh trong S3 → invalidate `/index.html` và `/images/*` → CloudFront yêu cầu mọi edge xoá các file đó khỏi cache → request tiếp theo edge không thấy trong cache → lấy bản mới từ origin.

### Kiến thức thực tế

- **Chi phí:** mỗi tháng **1.000 path invalidation đầu tiên miễn phí**, sau đó tính phí theo path. Một path wildcard như `/images/*` (hoặc `/*`) **tính là 1 path** dù xoá hàng nghìn file.
- **Best practice thay vì invalidation:** dùng **tên file có version/hash** (`app.3f9a1c.js`, `style.v2.css`) với TTL dài; chỉ `index.html` có TTL ngắn (hoặc `Cache-Control: no-cache`) hoặc invalidate riêng `index.html`. Các framework (React/Vite/Angular) tự sinh tên có hash khi build.
- Pipeline deploy SPA điển hình:

  ```bash
  aws s3 sync ./dist s3://my-spa-bucket --delete
  aws cloudfront create-invalidation --distribution-id EDFDVBD6EXAMPLE --paths "/index.html"
  ```

- Invalidation chỉ xoá cache tại CloudFront, **không xoá cache trình duyệt** người dùng (điều khiển bằng `Cache-Control` trả về).
- Invalidation không tức thì (thường vài chục giây đến vài phút).

### Ghi nhớ cho kỳ thi

- Đã cập nhật nội dung mà người dùng vẫn thấy bản cũ, muốn áp dụng ngay → **CloudFront Invalidation** (không phải xoá/tạo lại distribution, không phải bảo người dùng xoá cache trình duyệt).

---

## Bài 6 – ALB/EC2 làm origin và VPC Origins

### Lý thuyết

#### Cách mới (khuyến nghị): VPC Origins

- Phân phối nội dung **trực tiếp từ ứng dụng trong private subnet**; mọi thứ **giữ private**, không cần expose ra Internet.
- Hỗ trợ: **private ALB, private NLB, private EC2 instance**.
- Users → edge locations → CloudFront → **VPC origin** → ALB/NLB/EC2 trong private subnet.
- **An toàn nhất** về mạng: ứng dụng vẫn private, bạn chọn những gì expose qua CloudFront.

#### Cách cũ: Public network

- **EC2 làm origin**: EC2 phải **public**; security group cho phép **danh sách public IP của các edge location** (lấy từ danh sách IP CloudFront do AWS công bố).
- **ALB làm origin**: ALB phải **public**, security group cho phép IP của edge locations; EC2 phía sau có thể **private**, ALB ↔ EC2 dùng security group (EC2 SG cho phép SG của ALB).
- Nhược điểm: tốn công tìm danh sách IP và cập nhật SG; nếu ai đó **sửa security group**, ứng dụng có thể bị lộ ra Internet ngoài CloudFront.

| | VPC Origins | Public origin |
|---|---|---|
| ALB/EC2 | **Private** (private subnet) | **Public** |
| Bảo vệ | Không có đường vào từ Internet | Dựa vào SG giới hạn IP CloudFront |
| Công sức | Thấp | Phải duy trì danh sách IP |

### Kiến thức thực tế

- **VPC Origins** ra mắt cuối năm 2024. Trong giao diện plan mới (video 002), VPC origin chỉ có ở plan **Business** trở lên, hoặc với **pay-as-you-go**.
- **Cập nhật cho cách public:** không cần chép tay danh sách IP nữa — dùng **AWS-managed prefix list `com.amazonaws.global.cloudfront.origin-facing`** trong inbound rule của security group ALB:

  ```bash
  PL_ID=$(aws ec2 describe-managed-prefix-lists \
    --filters Name=prefix-list-name,Values=com.amazonaws.global.cloudfront.origin-facing \
    --query "PrefixLists[0].PrefixListId" --output text)
  aws ec2 authorize-security-group-ingress --group-id sg-0alb1234567890 \
    --ip-permissions "IpProtocol=tcp,FromPort=443,ToPort=443,PrefixListIds=[{PrefixListId=$PL_ID}]"
  ```

  Prefix list chiếm nhiều "rule" trong quota của security group, có thể cần xin tăng quota rules per SG.
- Prefix list chỉ đảm bảo request **đến từ CloudFront**, chưa đảm bảo đến từ **distribution của bạn**. Bổ sung: CloudFront gửi **custom origin header bí mật** (ví dụ `X-Origin-Verify: <secret>`) và ALB listener rule/WAF chỉ chấp nhận request có header đó.
- Giữa CloudFront và origin nên dùng **HTTPS** (`OriginProtocolPolicy: https-only`), chứng chỉ trên ALB phải khớp với domain origin.

### Ghi nhớ cho kỳ thi

- Private ALB/NLB/EC2 phía sau CloudFront → **VPC Origins**.
- Cách cũ: origin public, security group cho phép **IP của CloudFront edge** (nay dùng managed prefix list).

---

## Bài 7 – Geo Restriction

### Lý thuyết

- Giới hạn ai truy cập distribution dựa trên **quốc gia** của người dùng:
  - **Allowlist**: danh sách quốc gia **được phép**.
  - **Blocklist**: danh sách quốc gia **bị chặn**.
- Quốc gia xác định bằng **cơ sở dữ liệu Geo-IP của bên thứ ba** (map IP → quốc gia).
- Use case: **luật bản quyền** — kiểm soát truy cập nội dung theo quốc gia.

### Kiến thức thực tế

- Người dùng bị chặn nhận **HTTP 403 (Forbidden)**; có thể cấu hình **custom error page** cho mã 403.
- Geo restriction áp dụng cho **toàn distribution**. Muốn chặn theo quốc gia **chỉ trên một số path**, hoặc kết hợp nhiều điều kiện (IP, rate limit…) → dùng **AWS WAF** với **geo match rule** gắn vào distribution.
- Muốn nội dung khác nhau theo quốc gia (không chặn) → forward header `CloudFront-Viewer-Country` tới origin hoặc xử lý bằng CloudFront Functions.
- Geo-IP không tuyệt đối chính xác (VPN, proxy có thể vượt qua).

### Ghi nhớ cho kỳ thi

- Chỉ cho phép/chặn người dùng theo **quốc gia** → **CloudFront Geo Restriction** (không phải Security Group, không phải Route 53).

---

## Bài 8 – Signed URL và Signed Cookie

### Lý thuyết

- Use case: distribution **private**, chia sẻ **nội dung trả phí (premium)** cho người dùng toàn cầu và **kiểm soát ai được truy cập gì**.
- Khi tạo signed URL/cookie, gắn kèm **policy** gồm:
  - **Thời điểm hết hạn** của URL/cookie.
  - **Dải IP** được phép truy cập (nên dùng nếu biết IP của client).
  - **Trusted signers**: tài khoản/khoá nào được phép tạo signed URL.
- Thời hạn nên đặt bao lâu?
  - Nội dung chia sẻ (phim, nhạc): **ngắn**, vài phút.
  - Nội dung riêng của user dùng lâu dài: có thể **nhiều năm**.

| | Signed URL | Signed Cookie |
|---|---|---|
| Phạm vi | **Một file** / mỗi URL | **Nhiều file**, cookie tái sử dụng |
| Ví dụ | 100 file → 100 URL | 1 cookie cho nhiều file |

#### Luồng hoạt động

1. S3 bucket chỉ cho CloudFront truy cập (OAC).
2. Client **xác thực** với **ứng dụng của bạn** (tự viết).
3. Ứng dụng dùng **AWS SDK** sinh **signed URL** (hoặc cookie) của CloudFront, trả cho client.
4. Client dùng signed URL để lấy object **qua CloudFront**.

#### CloudFront Signed URL hay S3 Pre-Signed URL?

| | CloudFront Signed URL | S3 Pre-Signed URL |
|---|---|---|
| Phạm vi | Truy cập một **path**, **bất kể origin** (S3, HTTP backend…) | Chỉ object **S3** |
| Khoá ký | Khoá **toàn tài khoản / key group** (cách cũ: chỉ root quản lý) | **IAM principal** người ký — request mang quyền của người ký |
| Bộ lọc | IP, path, ngày bắt đầu, hết hạn | Thời hạn giới hạn |
| Cache | **Tận dụng cache CloudFront** | Client truy cập **trực tiếp S3** |
| Khi dùng | Phân phối qua CloudFront trước S3 (S3 bị khoá bằng OAC) | Phân phối trực tiếp từ S3, không dùng CloudFront |

- Nếu S3 đã chặn bằng bucket policy chỉ cho CloudFront (video gọi là OAI — nay là **OAC**) thì S3 pre-signed URL **không dùng được**; phải dùng **CloudFront signed URL**.

### Kiến thức thực tế

- Hai loại policy: **canned policy** (chỉ thời hạn hết hạn, URL ngắn hơn) và **custom policy** (thêm thời điểm bắt đầu, dải IP, path wildcard — dùng được cho nhiều file).
- Bật trên behavior: **Restrict viewer access = Yes** → chọn **Trusted key groups**. Khi đó request **không có chữ ký hợp lệ** sẽ bị **403**.
- Ví dụ sinh signed URL bằng Python (boto3 + thư viện `cryptography`):

  ```python
  from datetime import datetime, timedelta, timezone
  from botocore.signers import CloudFrontSigner
  from cryptography.hazmat.primitives import hashes, serialization
  from cryptography.hazmat.primitives.asymmetric import padding

  def rsa_signer(message):
      with open("private_key.pem", "rb") as f:
          key = serialization.load_pem_private_key(f.read(), password=None)
      return key.sign(message, padding.PKCS1v15(), hashes.SHA1())

  signer = CloudFrontSigner("K2JCJMDEHXQW5F", rsa_signer)   # ID của public key trong CloudFront
  url = signer.generate_presigned_url(
      "https://d111111abcdef8.cloudfront.net/videos/movie.mp4",
      date_less_than=datetime.now(timezone.utc) + timedelta(minutes=10))
  print(url)   # ...?Expires=...&Signature=...&Key-Pair-Id=K2JCJMDEHXQW5F
  ```

  Node.js (SDK v3):

  ```javascript
  import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

  const url = getSignedUrl({
    url: "https://d111111abcdef8.cloudfront.net/videos/movie.mp4",
    keyPairId: "K2JCJMDEHXQW5F",
    privateKey: process.env.CF_PRIVATE_KEY,
    dateLessThan: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });
  ```

  Signed cookie gồm 3 cookie: `CloudFront-Policy` (hoặc `CloudFront-Expires` với canned policy), `CloudFront-Signature`, `CloudFront-Key-Pair-Id`; SDK có hàm `getSignedCookies` tương ứng.
- **Bảo mật private key**: lưu trong **Secrets Manager** hoặc **SSM Parameter Store (SecureString)**, ứng dụng đọc lúc chạy; không commit vào Git.
- Signed URL có thời hạn quá ngắn + **lệch đồng hồ server** → lỗi 403 "expired". Đồng bộ thời gian (NTP / Amazon Time Sync).

### Ghi nhớ cho kỳ thi

- Phân phối **nội dung trả phí** qua CloudFront → **CloudFront Signed URL/Cookie**.
- **Một file → Signed URL; nhiều file (hàng trăm file) → Signed Cookie.**
- Có CloudFront phía trước S3 → **CloudFront signed URL**; truy cập S3 trực tiếp → **S3 pre-signed URL**.

---

## Bài 9 – Trusted Key Group

### Lý thuyết

| | **Trusted Key Group** (khuyến nghị) | **CloudFront Key Pair** (cũ) |
|---|---|---|
| Quản lý | Qua **API**, tạo và **xoay vòng (rotate)** khoá tự động được | Chỉ bằng **root account** + console, **không có API** |
| Phân quyền | Dùng **IAM** để kiểm soát ai quản lý key group/public key | Bắt buộc dùng root (không khuyến nghị) |
| Phạm vi | Gắn vào từng distribution/behavior | Áp dụng cho mọi distribution của tài khoản |

- Có thể tạo **một hoặc nhiều trusted key group** cho distribution.
- Bạn **tự sinh cặp khoá RSA**:
  - **Private key** → ứng dụng (ví dụ EC2) dùng để **ký** URL.
  - **Public key** → **upload lên CloudFront** để **xác minh** chữ ký.

### Kiến thức thực tế

- **Xoay vòng khoá không gián đoạn:** thêm public key mới vào key group (cùng lúc tồn tại 2 key) → chuyển ứng dụng sang ký bằng private key mới → khi các URL cũ hết hạn, xoá public key cũ.
- **Cập nhật:** AWS không khuyến nghị dùng CloudFront key pair của root; tài liệu hiện tại coi trusted key group là cách chuẩn. Tham số `Key-Pair-Id` trong URL giờ là **ID của public key**.

### Ghi nhớ cho kỳ thi

- Khuyến nghị dùng **Trusted Key Group** thay cho **CloudFront Key Pair** (cần root, không có API).
- Private key ở ứng dụng ký URL; public key ở CloudFront xác minh.

---

## Bài 10 – Price Classes, Origin Groups, Field-Level Encryption

### Lý thuyết

#### Price Classes

- Chi phí **data transfer out** khác nhau theo **khu vực địa lý** của edge location. Ví dụ trong video (bảng giá tại thời điểm quay): 10 TB đầu tại **Mỹ/Mexico/Canada ~$0,085/GB**, **Ấn Độ ~$0,17/GB** (gấp khoảng 2 lần). Càng truyền nhiều thì đơn giá càng giảm (trên 5 PB tại Mỹ chỉ còn khoảng $0,02/GB).
- Có thể **giảm số edge location** để tiết kiệm:

| Price Class | Edge locations dùng | Đặc điểm |
|---|---|---|
| **Price Class All** | **Tất cả** region | Hiệu năng tốt nhất, chi phí cao nhất |
| **Price Class 200** | Hầu hết region, **loại bỏ những region đắt nhất** | Cân bằng |
| **Price Class 100** | **Chỉ các region rẻ nhất** (Bắc Mỹ, Châu Âu) | Rẻ nhất |

#### Multiple Origins

- Route tới **origin khác nhau** theo **content type** hoặc **path pattern** qua **cache behaviors**: `/images/*`, `/api/*` → ALB, `/*` → S3 (nội dung tĩnh).

#### Origin Groups (failover)

- Mục đích: **tăng tính sẵn sàng** và **failover** khi một origin lỗi.
- **Origin group = 1 primary origin + 1 secondary origin**. Primary trả lỗi → CloudFront **thử lại cùng request** trên secondary.
- Ví dụ 2 EC2: request tới EC2 A lỗi → retry trên EC2 B → trả 200 OK.
- Với **S3 + CRR**: primary bucket và secondary bucket ở **2 region khác nhau**, bật **replication** A → B. Primary gặp sự cố cấp region → CloudFront chuyển sang bucket region khác → đạt **HA và disaster recovery cấp region**.

#### Field-Level Encryption

- Bảo vệ **thông tin nhạy cảm xuyên suốt stack ứng dụng**, là lớp bảo mật **bổ sung cho HTTPS** (encryption in flight).
- **Edge location mã hoá** các trường nhạy cảm bằng **public key** (mã hoá **bất đối xứng**); chỉ ai có **private key** mới giải mã được.
- Áp dụng cho **POST request**, chỉ định tới **10 trường** (ví dụ số thẻ tín dụng) và public key dùng để mã hoá.
- Luồng: Client → (HTTPS) edge → CloudFront → (HTTPS) ALB → (HTTPS) web server. Trường thẻ tín dụng được **mã hoá ngay tại edge**; CloudFront, ALB **không đọc được**; chỉ **web server** có private key (và logic tự viết) mới **giải mã**.

### Kiến thức thực tế

- **Lưu ý về số liệu giá:** đơn giá trong video chỉ để minh hoạ và thay đổi theo thời gian; xem trang *Amazon CloudFront Pricing* để có giá hiện tại. Price class cấu hình trong distribution settings (`PriceClass_100`, `PriceClass_200`, `PriceClass_All`). Người dùng ở khu vực bị loại vẫn truy cập được, chỉ là được phục vụ từ edge xa hơn (latency cao hơn).
- **Origin failover**:
  - Chỉ áp dụng cho request **GET, HEAD, OPTIONS**.
  - Bạn chọn **mã lỗi** kích hoạt failover (ví dụ 500, 502, 503, 504, 403, 404); lỗi **kết nối/timeout** tới primary cũng kích hoạt failover.
  - Failover xảy ra **theo từng request**, không chuyển hẳn sang secondary.

  ```yaml
  DistributionConfig:
    OriginGroups:
      Quantity: 1
      Items:
        - Id: s3-failover-group
          FailoverCriteria:
            StatusCodes:
              Quantity: 4
              Items: [500, 502, 503, 504]
          Members:
            Quantity: 2
            Items:
              - OriginId: s3-primary-us-east-1
              - OriginId: s3-secondary-eu-west-1
    DefaultCacheBehavior:
      TargetOriginId: s3-failover-group     # behavior trỏ tới origin group
  ```

- **Field-level encryption** cần tạo **public key** và **field-level encryption profile/configuration** rồi gắn vào cache behavior; chỉ hoạt động khi origin dùng **HTTPS**. Với nhiều hệ thống hiện đại, dữ liệu thẻ thường được xử lý bằng tokenization của cổng thanh toán; tuy vậy đề thi vẫn có thể hỏi khái niệm này.

### Ghi nhớ cho kỳ thi

- Giảm chi phí CloudFront → **Price Class** (100 rẻ nhất, All đắt nhất).
- HA/failover origin → **Origin Group** (primary + secondary); S3 + CRR → DR cấp region.
- Mã hoá một số trường nhạy cảm (thẻ tín dụng) tại edge, chỉ backend giải mã → **Field-Level Encryption** (bất đối xứng, tối đa 10 trường, POST).

---

## Bài 11 – Real-time Logs

### Lý thuyết

- Gửi **mọi request** CloudFront nhận được, theo **thời gian thực**, vào **Kinesis Data Streams** → để **giám sát, phân tích, hành động** dựa trên hiệu năng phân phối nội dung.
- Kiến trúc:
  - **Real-time**: CloudFront → **Kinesis Data Streams** → **Lambda** xử lý record.
  - **Near real-time**: CloudFront → **Kinesis Data Streams** (bắt buộc, vì CloudFront chỉ gửi được vào KDS) → **Kinesis Data Firehose** gom theo batch → **S3, OpenSearch**…
- Cấu hình:
  - **Sampling rate**: **% request** được ghi (traffic rất lớn thì chỉ lấy mẫu).
  - **Các trường (fields)** cần ghi.
  - **Cache behaviors / path pattern** áp dụng (ví dụ chỉ `/images/*`).

### Kiến thức thực tế

- **Cập nhật tên dịch vụ:** *Kinesis Data Firehose* đã đổi tên thành **Amazon Data Firehose** (2024).
- Tạo real-time log config bằng CLI:

  ```bash
  aws cloudfront create-realtime-log-config \
    --name demo-realtime-logs \
    --sampling-rate 10 \
    --fields timestamp c-ip sc-status cs-uri-stem x-edge-location x-edge-result-type time-taken \
    --end-points "StreamType=Kinesis,KinesisStreamConfig={RoleARN=arn:aws:iam::123456789012:role/CloudFrontRealtimeLogRole,StreamARN=arn:aws:kinesis:us-east-1:123456789012:stream/cf-logs}"
  ```

  Sau đó gắn config vào cache behavior (`RealtimeLogConfigArn`). Role phải cho phép CloudFront ghi vào stream (`kinesis:PutRecord(s)`, `kinesis:DescribeStreamSummary`, `kinesis:DescribeStream`).
- So sánh với **standard logs** (access logs): miễn phí phần tạo log (chỉ trả phí lưu trữ/đích), có độ trễ (thường vài phút), ghi toàn bộ request. Từ cuối 2024, standard logs (v2) có thể gửi tới **S3, CloudWatch Logs hoặc Amazon Data Firehose**. Real-time logs tính phí theo số log line, cộng chi phí Kinesis.
- Theo dõi tổng quan không cần log: **CloudWatch metrics** của CloudFront (Requests, BytesDownloaded, 4xxErrorRate, 5xxErrorRate…) nằm ở **us-east-1**.

### Ghi nhớ cho kỳ thi

- Log request CloudFront theo **thời gian thực** → **Real-time logs → Kinesis Data Streams** (rồi Lambda / Firehose).
- Có **sampling rate**, chọn **fields** và **cache behavior**.

---

## Bài 12 – CloudFront Functions và Lambda@Edge

*Bổ sung ngoài video — chủ đề có trong DVA-C02*

### Lý thuyết

Cả hai cho phép chạy code **tại edge** để tuỳ biến request/response (viết lại URL, chuyển hướng, thêm header, xác thực, A/B testing…).

| | **CloudFront Functions** | **Lambda@Edge** |
|---|---|---|
| Ngôn ngữ | JavaScript (runtime riêng của CloudFront) | **Node.js, Python** |
| Sự kiện | **Viewer Request, Viewer Response** | **Viewer Request/Response, Origin Request/Response** |
| Quy mô | **Hàng triệu request/giây** | Hàng nghìn request/giây |
| Thời gian chạy tối đa | **< 1 ms** | 5 giây (viewer), 30 giây (origin) |
| Bộ nhớ tối đa | 2 MB | 128 MB (viewer) đến 10 GB (origin) |
| Kích thước code | 10 KB | 1 MB (viewer), 50 MB (origin) |
| Truy cập mạng / file system | **Không** | **Có** |
| Truy cập request body | **Không** | **Có** |
| Triển khai | Trực tiếp trong CloudFront | Tạo Lambda ở **us-east-1**, CloudFront replicate ra các region |
| Giá | Rẻ (khoảng 1/6 Lambda@Edge) | Đắt hơn |

- **Dùng CloudFront Functions khi:** chuẩn hoá cache key (sắp xếp/lọc query string, header), **viết lại/chuyển hướng URL**, chèn/sửa header, **xác thực token đơn giản** (ví dụ JWT ký HMAC), thêm security headers.
- **Dùng Lambda@Edge khi:** cần thời gian xử lý dài hơn, **gọi dịch vụ bên ngoài/SDK** (DynamoDB, Cognito…), đọc/sửa **body**, cần thư viện bên thứ ba, chọn origin động.

### Kiến thức thực tế

- Ví dụ CloudFront Function: chuyển hướng `/` của SPA và thêm `index.html` cho thư mục (viewer request):

  ```javascript
  function handler(event) {
    var request = event.request;
    var uri = request.uri;
    if (uri.endsWith('/')) {
      request.uri += 'index.html';
    } else if (!uri.includes('.')) {
      request.uri += '/index.html';
    }
    return request;
  }
  ```

- **CloudFront KeyValueStore** (2023): kho key-value toàn cục, CloudFront Functions đọc được với độ trễ thấp (cấu hình redirect, feature flag, A/B) mà không cần deploy lại function.
- Một cache behavior có thể dùng **cả hai**, nhưng mỗi loại sự kiện (ví dụ viewer request) chỉ gắn **một** function.
- Log của Lambda@Edge nằm trong CloudWatch Logs **ở region gần edge** đã thực thi (tên log group có tiền tố `/aws/lambda/us-east-1.<tên function>`), không chỉ ở us-east-1.

### Ghi nhớ cho kỳ thi

- Logic nhẹ, cực nhanh, khối lượng lớn, chỉ viewer events → **CloudFront Functions**.
- Cần origin events, truy cập mạng/body, chạy lâu hơn, Python → **Lambda@Edge**.

---

## Tổng kết chương

| Chủ đề | Điều cần nhớ |
|---|---|
| CloudFront | CDN, cache tại edge, giảm latency, chống DDoS (Shield/WAF) |
| Origins | S3 (OAC), VPC origin (private ALB/NLB/EC2), custom HTTP (S3 website, public ALB) |
| CloudFront vs S3 CRR | Tĩnh toàn cầu → CloudFront; động, vài region → CRR |
| OAC | Thay thế OAI; bucket policy principal `cloudfront.amazonaws.com` + `AWS:SourceArn` |
| Cache key | Mặc định hostname + path; thêm headers/cookies/query qua **Cache Policy**; TTL 0 giây – 1 năm |
| Origin Request Policy | Gửi thêm thông tin tới origin **không** ảnh hưởng cache key |
| Cache Behaviors | Path pattern → origin/cấu hình riêng; default `/*` xử lý cuối |
| Invalidation | Làm mới cache ngay (`/*`, `/images/*`); best practice: tên file có version |
| ALB/EC2 origin | Mới: **VPC Origins**; cũ: public + SG cho phép IP CloudFront (managed prefix list) |
| Geo Restriction | Allowlist/Blocklist quốc gia; dùng cho bản quyền |
| Signed URL/Cookie | URL: 1 file; Cookie: nhiều file; dùng **Trusted Key Group** (không dùng key pair root) |
| CloudFront signed URL vs S3 pre-signed URL | Qua CloudFront (mọi origin, có cache) vs trực tiếp S3 (quyền của IAM người ký) |
| Price Classes | All / 200 / 100 (rẻ nhất) |
| Origin Groups | Primary + secondary, failover; S3 + CRR → DR cấp region |
| Field-Level Encryption | Mã hoá bất đối xứng tại edge, tối đa 10 trường POST |
| Real-time logs | → Kinesis Data Streams (→ Lambda / Data Firehose), có sampling |
| Edge compute | CloudFront Functions (nhẹ, viewer) vs Lambda@Edge (mạnh, cả origin) |

---

## Câu hỏi ôn tập

*Nguồn: CloudFront Quiz. Đáp án và giải thích nằm cuối mỗi câu (bấm để mở).*

**Câu 1.** Bạn có nội dung trả phí lưu trong S3 bucket. Bạn muốn phân phối toàn cầu nên đã tạo CloudFront distribution và cấu hình S3 bucket chỉ trao đổi dữ liệu với distribution. Tính năng CloudFront nào cho phép phân phối nội dung trả phí này một cách an toàn?

- A. Origin Access Control
- B. S3 Pre-Signed URL
- C. CloudFront Signed URL
- D. CloudFront Invalidations

<details><summary>Đáp án</summary>

**C.** CloudFront Signed URL thường được dùng để phân phối nội dung trả phí thông qua các URL được ký và sinh động cho từng người dùng. OAC (A) chỉ bảo vệ kết nối CloudFront ↔ S3 (đã cấu hình rồi), không kiểm soát người dùng cuối. S3 pre-signed URL (B) không dùng được vì bucket chỉ cho CloudFront truy cập. Invalidation (D) chỉ làm mới cache.
</details>

**Câu 2.** CloudFront distribution phục vụ website chạy trên các EC2 phía sau ALB. Mọi khách hàng đều ở Mỹ, nhưng bạn thấy có request độc hại đến từ các nước khác. Làm gì để chỉ cho phép người dùng ở Mỹ và chặn các nước khác?

- A. Dùng Origin Access Control
- B. Dùng CloudFront Geo Restriction
- C. Tạo Security Group và gắn vào CloudFront Distribution
- D. Dùng bản ghi Route 53 Latency và gắn vào CloudFront

<details><summary>Đáp án</summary>

**B.** Geo Restriction với allowlist chỉ gồm `US`. Không gắn được security group vào distribution (C); Route 53 latency record (D) dùng để định tuyến theo độ trễ, không chặn truy cập; OAC (A) dành cho S3 origin.
</details>

**Câu 3.** Bạn host website tĩnh trên S3 và tạo CloudFront distribution trỏ tới bucket. Sau một thời gian, bạn thấy người dùng vẫn truy cập trực tiếp vào S3 bucket. Bạn muốn buộc người dùng chỉ truy cập qua CloudFront. Làm thế nào?

- A. Cấu hình distribution, tạo Origin Access Control, rồi cập nhật S3 bucket policy chỉ chấp nhận request từ CloudFront distribution
- B. Gửi email bảo khách hàng không dùng endpoint S3
- C. Dùng S3 Access Points để chuyển hướng client sang CloudFront

<details><summary>Đáp án</summary>

**A.** OAC + bucket policy (principal `cloudfront.amazonaws.com`, điều kiện `AWS:SourceArn` là distribution), đồng thời bỏ quyền public của bucket. Lưu ý thực tế: OAC dùng với REST endpoint của S3, nên chuyển origin từ website endpoint sang REST endpoint.
</details>

**Câu 4.** Website chạy trên các EC2 phía sau ALB. Bạn tạo CloudFront distribution với origin là ALB. Dùng gì để cấp quyền truy cập **hàng trăm file private** do distribution phục vụ?

- A. CloudFront Signed URLs
- B. CloudFront Origin Access Control
- C. CloudFront HTTPS Encryption
- D. CloudFront Signed Cookies

<details><summary>Đáp án</summary>

**D.** Signed Cookies phù hợp khi cần truy cập **nhiều file** (một cookie cho nhiều file). Signed URL (A) phù hợp cho **từng file riêng lẻ** — hàng trăm file sẽ cần hàng trăm URL. OAC chỉ dành cho S3 origin.
</details>

**Câu 5.** Bucket policy sau làm gì?

```json
{
  "Version": "2012-10-17",
  "Id": "Mystery policy",
  "Statement": [{
    "Sid": "What could it be?",
    "Effect": "Allow",
    "Principal": { "Service": "cloudfront.amazonaws.com" },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::examplebucket/*",
    "Condition": {
      "StringEquals": {
        "AWS:SourceArn": "arn:aws:cloudfront::123456789012:distribution/EDFDVBD6EXAMPLE"
      }
    }
  }]
}
```

- A. Buộc request `GetObject` phải được mã hoá nếu đến từ CloudFront
- B. Chỉ cho phép nội dung S3 bucket được truy cập từ CloudFront distribution của bạn
- C. Chỉ cho phép request kiểu `GetObject` lên S3 bucket từ bất kỳ ai

<details><summary>Đáp án</summary>

**B.** Đây là bucket policy chuẩn của **OAC**: chỉ service principal CloudFront được `GetObject`, và chỉ khi request đến từ đúng distribution `EDFDVBD6EXAMPLE` (điều kiện `AWS:SourceArn`).
</details>

**Câu 6.** Bạn có React Single Page Application host trên S3 và phục vụ qua CloudFront. Bạn đã cập nhật ứng dụng và đẩy lên S3, nhưng bản cũ vẫn được cache ở CloudFront và người dùng vẫn thấy bản cũ. Bạn muốn bản cập nhật có hiệu lực ngay. Làm gì?

- A. Dùng CloudFront Invalidation
- B. Xoá và tạo lại CloudFront Distribution
- C. Bảo người dùng xoá cache trình duyệt hoặc dùng chế độ ẩn danh

<details><summary>Đáp án</summary>

**A.** Invalidation (ví dụ `/*` hoặc `/index.html`) buộc edge lấy bản mới từ origin. Tạo lại distribution (B) tốn thời gian, đổi domain; C không giải quyết cache ở CloudFront. Thực tế: build với tên file có hash và chỉ invalidate `index.html`.
</details>

**Câu 7.** Bạn lưu nội dung **rất động** trong S3 bucket ở `us-east-1`. Bạn muốn dữ liệu này có độ trễ thấp ở region Singapore `ap-southeast-1`. Bạn đề xuất gì?

- A. Amazon CloudFront
- B. S3 Cross-Region Replication
- C. S3 Pre-Signed URLs

<details><summary>Đáp án</summary>

**B.** S3 CRR replicate dữ liệu từ bucket ở một region sang bucket ở region khác gần real-time, phù hợp nội dung động cần độ trễ thấp ở một vài region cụ thể. CloudFront cache theo TTL nên không phù hợp nội dung thay đổi liên tục.
</details>

**Câu 8.** Với CloudFront Distribution, bạn có thể cache dựa trên các yếu tố sau, NGOẠI TRỪ ______.

- A. HTTP Headers
- B. HTTP Cookies
- C. Query String Parameters
- D. HTTP Methods

<details><summary>Đáp án</summary>

**D.** Cache policy chỉ cho đưa headers, cookies và query strings vào cache key (cùng hostname và path). HTTP method không phải thành phần của cache key; CloudFront chỉ cache response của GET/HEAD (và tuỳ chọn OPTIONS).
</details>

**Câu 9.** Khi cấu hình distribution dùng Signed URL/Cookie, nên dùng signer ______ thay vì signer ______.

- A. Trusted Key Group, CloudFront Key Pair
- B. CloudFront Key Pair, Trusted Key Group

<details><summary>Đáp án</summary>

**A.** Trusted Key Group quản lý được qua API, phân quyền bằng IAM, xoay vòng khoá dễ dàng. CloudFront Key Pair yêu cầu root account và không có API.
</details>

---

[← Chương 14](ch14-amazon-s3-security.md) | [Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md) | [Chương 16 →](ch16-ecs-ecr-fargate-docker-in-aws.md)

