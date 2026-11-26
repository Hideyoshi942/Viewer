# Edge Networking: Amazon CloudFront, AWS Global Accelerator & Anycast

Trong Domain 1 (**Network Design**), việc tối ưu hóa lưu lượng người dùng toàn cầu đòi hỏi nắm vững sự khác biệt kiến trúc giữa **Amazon CloudFront** (Layer 7 CDN) và **AWS Global Accelerator** (Layer 4 Anycast Network).

---

## 1. So sánh chuyên sâu: CloudFront vs. Global Accelerator

| Tiêu chí | Amazon CloudFront | AWS Global Accelerator |
| :--- | :--- | :--- |
| **Tầng OSI** | **Layer 7** (HTTP/HTTPS, WebSocket, gRPC) | **Layer 4** (TCP, UDP) |
| **Địa chỉ IP** | IP động (thay đổi theo Edge Location, hỗ trợ Anycast DNS) | **2 IPv4 Anycast tĩnh** (Static Anycast IPs, hỗ trợ Bring Your Own IP - BYOIP) |
| **Caching** | Cache nội dung tĩnh/động tại Edge Locations & Regional Edge Caches | **Không cache** (pass-through trực tiếp tới Origin qua AWS Backbone) |
| **Failover** | Origin Groups (Failover dựa trên HTTP status codes 4xx/5xx) | Health Checks liên tục ở Layer 4/7; chuyển hướng **< 30 giây** không phụ thuộc DNS TTL |
| **Giao thức đặc thù** | Không hỗ trợ non-HTTP (như VoIP, Gaming UDP, MQTT TCP thuần) | Hỗ trợ mọi **TCP/UDP** (Gaming, IoT, Financial FIX, VoIP) |
| **Bảo mật biên** | Tích hợp trực tiếp **AWS WAF**, **OAC** (cho S3), Lambda@Edge / CloudFront Functions | Tích hợp **AWS Shield Standard/Advanced** ở lớp L3/L4 |

> **Exam Tip**:
> - Đề bài yêu cầu **Static IP addresses** để khách hàng whitelist trên firewall đối tác + **non-HTTP (UDP/TCP)** hoặc **instant multi-Region failover không bị ảnh hưởng bởi DNS caching** $\rightarrow$ **AWS Global Accelerator**.
> - Đề bài yêu cầu **caching**, **TLS termination tại Edge**, **chặn tấn công L7 bằng AWS WAF**, hoặc **chạy logic nhẹ tại Edge (CloudFront Functions)** $\rightarrow$ **Amazon CloudFront**.

---

## 2. Kiến trúc Bảo mật Origin cho CloudFront

1. **Origin Access Control (OAC)** cho S3:
   - Thay thế OAI (Origin Access Identity) cũ.
   - Hỗ trợ **SSE-KMS**, dynamic PUT/POST requests, và mọi AWS Region (kể cả opt-in Regions).
2. **Custom Origin (ALB/EC2) Security**:
   - Dùng **AWS Managed Prefix List for CloudFront** (`com.amazonaws.global.cloudfront.origin-facing`) trong Security Group của ALB để chỉ cho phép IP của CloudFront kết nối tới ALB.
   - Kết hợp thêm **Custom HTTP Header** (ví dụ `X-Origin-Verify`) kiểm tra tại ALB Listener Rule để chống truy cập vòng qua CloudFront.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipalReadOnly",
      "Effect": "Allow",
      "Principal": { "Service": "cloudfront.amazonaws.com" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-secure-static-bucket/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::123456789012:distribution/E1234567890ABC"
        }
      }
    }
  ]
}
```

---

## 3. Global Accelerator: Standard vs. Custom Routing

- **Standard Accelerator**: Tự động định tuyến tới Endpoint khỏe mạnh gần người dùng nhất (ALB, NLB, EC2, Elastic IP) dựa trên **Traffic Dial** (0–100%) và **Endpoint Weights**. Hỗ trợ **Client IP Preservation** cho ALB, NLB (có điều kiện) và EC2.
- **Custom Routing Accelerator**: Cho phép ánh xạ **1-to-1** từ `(Accelerator IP, Port)` tới một `(EC2 Private IP, Port)` cụ thể trong VPC — cực kỳ hữu ích cho **Multiplayer Gaming** hoặc **VoIP** khi người chơi cần kết nối đúng tới một game server cụ thể.

```bash
# Kiểm tra Managed Prefix List ID của CloudFront trong Region hiện tại
aws ec2 describe-managed-prefix-lists \
  --filters Name=prefix-list-name,Values=com.amazonaws.global.cloudfront.origin-facing \
  --query "PrefixLists[0].PrefixListId"
```

---

[← Bài trước](03-dx-lag-macsec-resiliency-tgw-multicast.md) | [Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/04-edge-cloudfront-ga.md) | [Bài tiếp →](05-ipv6-dual-stack-ipam-prefix-lists.md)
