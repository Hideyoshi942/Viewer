# AWS PrivateLink, Amazon VPC Lattice & Load Balancing (ALB/NLB)

Domain 2 (**Network Implementation – 26%**) kiểm tra khả năng triển khai kết nối dịch vụ riêng tư ở quy mô lớn và tinh chỉnh Load Balancer (ALB/NLB) cho các kiến trúc phức tạp.

---

## 1. AWS PrivateLink vs. Amazon VPC Lattice

| Tiêu chí | AWS PrivateLink | Amazon VPC Lattice |
| :--- | :--- | :--- |
| **Tầng hoạt động** | **Layer 4** (TCP/UDP) qua Network Load Balancer (NLB) | **Layer 7** (HTTP, HTTPS, gRPC) |
| **Mô hình kết nối** | Point-to-point giữa Endpoint Service (Provider) và Interface Endpoint (Consumer) | Service Network mesh kết nối nhiều VPC/Account (EC2, ECS, EKS, Lambda) |
| **Overlapping CIDR** | Hỗ trợ hoàn toàn | Hỗ trợ hoàn toàn (tự động xử lý NAT/IPv6 link-local) |
| **Routing & Auth** | Không có L7 routing; kiểm soát bằng Endpoint Policy & Security Group | Path/Header-based routing, **Weighted Canary**, **IAM Auth Policies** |
| **Khi nào chọn?** | Cung cấp dịch vụ SaaS/B2B cho đối tác ngoài Organization, hoặc TCP/UDP thuần | Microservices nội bộ đa VPC/EKS/Lambda cần AuthZ & Traffic Splitting |

> **Exam Tip**: Khi đề bài cần **cung cấp dịch vụ cho khách hàng/đối tác bên ngoài** (cross-account SaaS) có **Overlapping CIDR** mà chỉ cho phép kết nối 1 chiều từ Consumer $\rightarrow$ Provider $\rightarrow$ **AWS PrivateLink**. Nếu là giao tiếp **service-to-service HTTP/gRPC nội bộ** giữa nhiều VPC/EKS/Lambda với **IAM authorization** $\rightarrow$ **Amazon VPC Lattice**.

---

## 2. Tinh chỉnh Network Load Balancer (NLB) & Application Load Balancer (ALB)

### NLB: Preserve Client IP & Proxy Protocol v2
- **Preserve Client IP**: Mặc định bật với **Instance** hoặc **ALB** target; cần lưu ý với **IP target** (hoặc khi đi qua PrivateLink): nếu bật Preserve Client IP mà target nằm sau Transit Gateway/Peering, return traffic có thể bị **asymmetric routing** (nên tắt nếu gặp lỗi timeout với remote IP targets, hoặc bật **Proxy Protocol v2** để đọc IP gốc ở tầng ứng dụng).
- **Cross-Zone Load Balancing**:
  - **ALB**: Luôn **BẬT** mặc định (không thể tắt).
  - **NLB**: Mặc định **TẮT** (giảm chi phí cross-AZ data transfer và giữ độ trễ thấp). Nếu phân bố target không đều giữa các AZ, cần chủ động bật.

### Cấu hình PrivateLink Private DNS Name
Để Consumer gọi dịch vụ qua tên miền tùy chỉnh (ví dụ `api.partner.internal`) thay vì DNS mặc định của VPC Endpoint (`vpce-xxxx.amazonaws.com`):
1. Provider cấu hình **Private DNS Name** trên Endpoint Service.
2. Provider thực hiện **Domain Ownership Verification** bằng cách thêm bản ghi **TXT** vào Public DNS của tên miền đó.
3. Consumer bật `PrivateDnsEnabled: true` trên Interface Endpoint (yêu cầu VPC bật `enableDnsHostnames` và `enableDnsSupport`).

```bash
# Tạo VPC Endpoint Service gắn với NLB và yêu cầu xác nhận kết nối (Acceptance Required)
aws ec2 create-vpc-endpoint-service-configuration \
  --network-load-balancer-arns arn:aws:elasticloadbalancing:ap-southeast-1:123456789012:loadbalancer/net/my-nlb/abc123 \
  --acceptance-required \
  --private-dns-name api.internal.example.com
```

---

## 3. Xử lý sự cố thường gặp với ALB/NLB & PrivateLink

- **NLB Hairpinning**: Khi một client và target nằm trên **cùng một EC2 instance** (ví dụ cùng host port) gọi qua NLB có bật **Preserve Client IP**, gói tin quay về bị drop vì source IP = destination IP. Khắc phục: tắt Preserve Client IP hoặc tách client/target ra instance khác nhau.
- **NLB Idle Timeout**: Cố định ở **350 giây** cho kết nối TCP (không thể thay đổi; ứng dụng cần gửi TCP Keepalive nếu giữ kết nối lâu hơn).
- **ALB Target Group Deregistration Delay**: Mặc định **300 giây**; giảm xuống (ví dụ 30s) để tăng tốc độ deploy Blue/Green hoặc Rolling Update.

---

## 4. Kiến trúc Tham chiếu: VPC Lattice Service Network & IAM Auth Policy

Với **Amazon VPC Lattice**, bạn có thể áp dụng xác thực IAM SigV4 ngay ở tầng mạng dịch vụ mà không cần viết code xác thực phức tạp trong từng microservice:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "AWS": "arn:aws:iam::111122223333:role/OrderServiceRole" },
      "Action": "vpc-lattice-svcs:Invoke",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "vpc-lattice-svcs:RequestMethod": "GET"
        }
      }
    }
  ]
}
```

---

[← Bài trước](07-dnssec-route53-traffic-flow-private-dns.md) | [Mục lục ANS-C01](../00-tong-quan-va-lo-trinh-ans-c01.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/08-privatelink-lattice-elb.md) | [Bài tiếp →](09-monitoring-troubleshooting.md)
