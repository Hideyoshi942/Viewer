# Domain 3: Bảo mật Hạ tầng & Mạng Biên (20%)

Domain 3 có trọng số **cao nhất** trong kỳ thi **SCS-C02 (20%)**, bao phủ phòng thủ nhiều lớp (Defense-in-Depth) từ Edge (CloudFront, WAF, Shield), Network (VPC, Network Firewall, Traffic Mirroring) cho tới Compute (EC2, ECS/EKS, Inspector, Systems Manager).

## 1. Bảo mật Mạng Biên: AWS WAF, Shield Advanced & Firewall Manager

| Dịch vụ | Tầng OSI | Tài nguyên hỗ trợ | Điểm nhấn cốt lõi trong đề thi |
| :--- | :--- | :--- | :--- |
| **AWS WAF** | Layer 7 (HTTP/S) | CloudFront, ALB, API Gateway, AppSync, Cognito User Pools, Verified Access | Chống SQLi, XSS, Bot Control, Geo-blocking, **Rate-based rules** (chặn IP gửi quá X request/5 phút), hỗ trợ Regex & Custom Headers |
| **AWS Shield Standard** | Layer 3 / 4 | Tự động miễn phí cho mọi khách hàng AWS (CloudFront, Route 53, Global Accelerator) | Chống SYN/UDP flood, Reflection attacks |
| **AWS Shield Advanced** | Layer 3 / 4 / 7 | CloudFront, Route 53, Global Accelerator, ALB, EIP (EC2/NLB) | Truy cập 24/7 **AWS Shield Response Team (SRT)**, **Cost Protection** (hoàn tiền nếu bị DDoS gây scale-out), tự động tạo WAF Layer 7 mitigation, bao gồm phí WAF & Firewall Manager |
| **AWS Firewall Manager** | Quản trị tập trung | WAF, Shield Advanced, VPC Security Groups, AWS Network Firewall, Route 53 Resolver DNS Firewall | Áp đặt **Security Policies** xuyên suốt AWS Organizations; tự động áp rule cho tài nguyên mới tạo hoặc tự động sửa các Security Group mở `0.0.0.0/0` |

> **Exam Tip**: Khi đề thi yêu cầu **chặn người dùng truy cập trực tiếp vào ALB (Origin Bypass)** mà bắt buộc mọi traffic phải đi qua CloudFront + WAF:
> 1. Sử dụng **CloudFront Managed Prefix List** (`com.amazonaws.global.cloudfront.origin-facing`) trong Inbound rule của ALB Security Group.
> 2. Cấu hình CloudFront chèn thêm một **Custom Secret Header** (ví dụ `X-Origin-Verify`, xoay vòng định kỳ bằng Secrets Manager + Lambda) và cấu hình **ALB Listener Rule** chỉ forward request có đúng header này, còn lại trả về `403 Forbidden`.

## 2. Phòng thủ Mạng VPC: Security Group vs. NACL vs. Network Firewall

### So sánh nhanh các lớp tường lửa trong VPC
- **Security Group (SG)**: Stateful, hoạt động ở cấp ENI, chỉ hỗ trợ **Allow rules**, hỗ trợ tham chiếu chéo SG khác và Prefix Lists.
- **Network ACL (NACL)**: Stateless, hoạt động ở cấp Subnet, hỗ trợ **Allow & Deny rules** (đánh giá theo thứ tự số từ nhỏ đến lớn). Dùng để **chặn cứng một dải IP độc hại cụ thể** trước khi vào subnet (nhớ mở **Ephemeral Ports `1024-65535`** ở chiều ngược lại).
- **AWS Network Firewall**: Stateful/Stateless Managed Firewall (hỗ trợ **Suricata IPS rules**), lọc domain FQDN (TLS SNI / HTTP Host header), kiểm tra sâu gói tin (Deep Packet Inspection - DPI).
  - **Mô hình triển khai chuẩn**: Đặt Network Firewall Endpoint trong **Firewall Subnet** riêng nằm giữa Internet Gateway (IGW) và Public/NAT Subnet (sử dụng **IGW Ingress Routing**), hoặc đặt tập trung tại **Inspection VPC** kết nối qua **AWS Transit Gateway** (nhớ bật **Appliance Mode** trên TGW Attachment để tránh asymmetric routing!).
- **Route 53 Resolver DNS Firewall**: Lọc truy vấn DNS outbound từ VPC theo Domain Lists (Allow/Block/Alert) để ngăn kết nối tới domain độc hại hoặc data exfiltration qua DNS.

### VPC Traffic Mirroring
- Sao chép gói tin mạng (Layer 2–Layer 4) từ ENI của EC2 (Nitro instances) gửi đến thiết bị IDS/IPS bên thứ 3 (như Zeek, Suricata) đứng sau NLB hoặc ENI khác qua giao thức **VXLAN (UDP port 4789)**.
- Chỉ dùng để **giám sát/phân tích ngoài luồng (out-of-band)** — KHÔNG chặn được traffic trực tiếp (nếu cần chặn inline, dùng **AWS Network Firewall** hoặc **Gateway Load Balancer - GWLB**).

## 3. VPC Endpoints & PrivateLink
- **Gateway Endpoint** (miễn phí, cập nhật Route Table): Chỉ hỗ trợ **Amazon S3** và **DynamoDB**.
- **Interface Endpoint (AWS PrivateLink)**: Tạo ENI với private IP trong subnet, hỗ trợ hầu hết dịch vụ AWS khác (KMS, Secrets Manager, SSM, ECR, STS, S3 PrivateLink...).
- **VPC Endpoint Policy**: Resource policy giới hạn *ai* được truy cập *tài nguyên nào* qua Endpoint đó (ví dụ: chỉ cho phép truy cập bucket thuộc `aws:ResourceOrgID` của công ty để chống **Data Exfiltration**).

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:ResourceOrgID": "o-1234567890"
        }
      }
    }
  ]
}
```

## 4. Bảo mật Compute & Quản lý Lỗ hổng

### Amazon Inspector (v2)
- Tự động khám phá và quét lỗ hổng liên tục (CVE & Network Reachability) mà không cần lập lịch thủ công cho:
  - **Amazon EC2** (qua SSM Agent hoặc Agentless Scanning bằng EBS snapshot).
  - **Amazon ECR** (Container Images — quét khi push và tự động quét lại khi có CVE mới).
  - **AWS Lambda** (quét package dependencies và code vulnerabilities).
- Tự động đẩy findings lên **Security Hub** và **EventBridge**.

### AWS Systems Manager (SSM) cho Bảo mật Host
- **SSM Session Manager**: Thay thế hoàn toàn SSH (port 22) và RDP (port 3389). Không cần mở Inbound Security Group, không cần Bastion Host, không cần Public IP (chỉ cần VPC Interface Endpoints: `ssm`, `ssmmessages`, `ec2messages`). Hỗ trợ ghi log toàn bộ phiên lệnh vào S3/CloudWatch Logs kèm mã hóa KMS.
- **SSM Patch Manager**: Tự động vá lỗi OS theo Patch Baselines và Maintenance Windows.
- **EC2 Instance Metadata Service v2 (IMDSv2)**: Bắt buộc dùng session-oriented PUT request (`X-aws-ec2-metadata-token`) để chống lỗ hổng **SSRF** (Server-Side Request Forgery). Bật bằng `HttpTokens=required` và `HttpPutResponseHopLimit=1` (hoặc `2` cho container trên EC2).

> **Exam Tip**: Khi đề bài mô tả ứng dụng web trên EC2 bị tấn công **SSRF** làm lộ IAM Role credentials từ `http://169.254.169.254/latest/meta-data/`, giải pháp triệt để và đúng chuẩn AWS nhất là **bắt buộc sử dụng IMDSv2 (`HttpTokens=required`)** (và có thể enforce toàn Organization qua SCP chặn `ec2:RunInstances` nếu `ec2:MetadataHttpTokens` không phải `required`).

---

[← Bài trước](04-vpc-flow-logs-dns-athena-config.md) | [Mục lục SCS-C02](../00-tong-quan-va-lo-trinh-scs-c02.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/05-infra-edge-waf-shield-cloudfront.md) | [Bài tiếp →](06-vpc-network-firewall-traffic-mirroring.md)
