# Global Traffic, Edge Caching & Security — CloudFront Origin Shield, Global Accelerator, WAF & Shield Advanced

Ở cấp độ **SAP-C02**, kiến trúc sư phải thiết kế luồng traffic toàn cầu không chỉ nhanh mà còn chịu lỗi multi-region, chống DDoS quy mô lớn và tối ưu tỷ lệ cache hit để giảm tải cho Origin.

---

## 1. Amazon CloudFront vs AWS Global Accelerator

| Tiêu chí | Amazon CloudFront | AWS Global Accelerator |
| :--- | :--- | :--- |
| **Giao thức** | **HTTP / HTTPS** (Layer 7) | **TCP / UDP** (Layer 4) — hỗ trợ cả HTTP |
| **Cơ chế tối ưu** | Cache nội dung (Static & Dynamic) tại Edge Locations | Định tuyến qua **AWS Global Network** từ Edge gần nhất bằng **2 Static Anycast IPs** |
| **IP tĩnh (Static IP)** | Không cố định IP (trừ Anycast Static IPs trả phí riêng) | Cung cấp sẵn **2 Anycast IPv4 tĩnh** (dùng để whitelist firewall khách hàng) |
| **Failover** | Origin Groups (Failover chỉ trên lỗi HTTP 4xx/5xx) | Health check liên tục, **failover < 1 phút** (không phụ thuộc DNS TTL!) |
| **Use cases SAP-C02** | Web/API/Video streaming, Lambda@Edge, CloudFront Functions | Gaming, VoIP, IoT (MQTT/UDP), non-HTTP apps, hoặc yêu cầu **IP whitelisting** + **instant failover** |

---

## 2. Tối ưu Edge: CloudFront Origin Shield, OAC & Edge Compute

- **CloudFront Origin Shield**: Thêm một lớp caching tập trung (regional cache) giữa các Edge Locations và Origin. Giảm số lượng request về Origin khi có hàng trăm Edge Locations cùng cache miss -> **tăng Cache Hit Ratio** và giảm chi phí Data Transfer Out từ Origin.
- **Origin Access Control (OAC)**: Thay thế OAI cũ để bảo vệ S3 Origin, hỗ trợ **S3 SSE-KMS**, dynamic requests (`PUT`/`DELETE`), và các AWS Regions mới.
- **CloudFront Functions vs Lambda@Edge**:
  - **CloudFront Functions**: Chạy bằng JavaScript nhẹ, < 1ms, hàng triệu req/s (Viewer Request/Response only) -> dùng cho URL rewrite, header manipulation, JWT validation đơn giản.
  - **Lambda@Edge**: Chạy Node.js/Python, truy cập được Origin Request/Response, gọi external API/network, timeout tối đa 30s -> dùng cho A/B testing phức tạp, dynamic origin selection, SSR.

```json
{
  "Effect": "Allow",
  "Principal": { "Service": "cloudfront.amazonaws.com" },
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::enterprise-web-assets/*",
  "Condition": {
    "StringEquals": {
      "AWS:SourceArn": "arn:aws:cloudfront::123456789012:distribution/E1234567890ABC"
    }
  }
}
```

---

## 3. Bảo vệ Biên mạng Doanh nghiệp: AWS WAF, Shield Advanced & Firewall Manager

- **AWS Firewall Manager**: Quản trị tập trung AWS WAF rules, Shield Advanced, VPC Security Groups, AWS Network Firewall và Route 53 Resolver DNS Firewall trên **toàn bộ AWS Organizations** (tự động áp dụng cho tài khoản/tài nguyên mới tạo dựa trên Resource Tags).
- **AWS Shield Advanced**:
  - Bảo vệ DDoS Layer 3/4/7 cho CloudFront, Route 53, Global Accelerator, ALB, EIP/NLB.
  - Hỗ trợ **DRT (DDoS Response Team) 24/7**, **Proactive Engagement**, và **DDoS Cost Protection** (hoàn tiền nếu hóa đơn scale do DDoS).
  - Tự động tạo AWS WAF rules để chặn Layer 7 DDoS.

> [!TIP]
> **Exam Tip (SAP-C02)**:
> - Khách hàng yêu cầu **whitelist đúng 2 địa chỉ IP tĩnh** cho ứng dụng chạy trên ALB đa vùng và **failover không bị ảnh hưởng bởi DNS caching** -> **AWS Global Accelerator**.
> - Tổ chức có hàng trăm tài khoản cần **tự động gắn AWS WAF & Shield Advanced** cho mọi ALB/CloudFront mới tạo -> **AWS Firewall Manager** tích hợp **AWS Organizations**.

---

[← Bài trước](04-multi-region-dr-resilience.md) | [Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/05-global-traffic-cdn-edge.md) | [Bài tiếp →](06-edge-hybrid-outposts-local-zones-licensing.md)
