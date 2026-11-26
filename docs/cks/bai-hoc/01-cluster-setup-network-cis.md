# Domain 1: Thiết lập Cụm An toàn (15%)

Domain 1 tập trung vào việc xây dựng nền tảng cụm Kubernetes an toàn ngay từ giai đoạn thiết lập: cô lập mạng ở tầng Pod, kiểm tra tuân thủ **CIS Kubernetes Benchmark**, bảo vệ điểm vào **Ingress bằng TLS**, bảo vệ **Metadata API** trên cloud và **xác minh tính toàn vẹn nhị phân (Binary Verification)** trước khi triển khai.

## 1. NetworkPolicy — Nguyên tắc Default Deny & Cô lập Lưu lượng

Mặc định trong Kubernetes, mọi Pod có thể giao tiếp tự do với mọi Pod khác (flat network). **NetworkPolicy** là tài nguyên cấp Namespace giúp áp dụng mô hình **Zero Trust** tại Layer 3/4, yêu cầu CNI plugin hỗ trợ (Calico, Cilium, Weave Net — *lưu ý Flannel mặc định không thực thi NetworkPolicy*).

### Mẫu Default Deny All (Ingress + Egress)

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: prod
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

### Cho phép lưu lượng có chọn lọc (kèm DNS Egress)

Khi đã bật `Egress` deny, Pod sẽ **không thể phân giải DNS** nếu không mở cổng UDP/TCP 53 tới `kube-dns`/`CoreDNS`.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-api-and-dns
  namespace: prod
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: web
          podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 8080
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: kube-system
          podSelector:
            matchLabels:
              k8s-app: kube-dns
      ports:
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 53
```

> **Exam Tip**: Chú ý dấu gạch ngang `-` trong `from` / `to`: nếu `namespaceSelector` và `podSelector` nằm trong **cùng một phần tử mảng** (không có `-` ở mục thứ hai), chúng kết hợp theo toán tử **AND**. Nếu tách thành 2 phần tử có dấu `-` riêng biệt, chúng kết hợp theo toán tử **OR** — đây là bẫy rất phổ biến trong bài thi CKS!

## 2. CIS Kubernetes Benchmark & `kube-bench`

**CIS Benchmark** là bộ tiêu chuẩn cấu hình an toàn cho Control Plane (`kube-apiserver`, `kube-controller-manager`, `kube-scheduler`, `etcd`) và Worker Nodes (`kubelet`). Công cụ `kube-bench` của Aqua Security tự động kiểm tra các mục này.

```bash
# Chạy kiểm tra tổng thể trên Control Plane node
kube-bench run --targets master,etcd

# Chạy kiểm tra trên Worker node (kubelet & policies)
kube-bench run --targets node

# Chỉ chạy một mục cụ thể (ví dụ kiểm tra 1.2.15 và 4.2.1)
kube-bench run --targets master --check 1.2.15
kube-bench run --targets node --check 4.2.1
```

### Các lỗi CIS hay gặp và cách khắc phục

| Thành phần | Mục CIS phổ biến | File cấu hình cần sửa | Giá trị an toàn |
| :--- | :--- | :--- | :--- |
| `kube-apiserver` | `--profiling` / `--anonymous-auth` | `/etc/kubernetes/manifests/kube-apiserver.yaml` | `--profiling=false`, `--anonymous-auth=false` |
| `etcd` | `--client-cert-auth`, `--auto-tls` | `/etc/kubernetes/manifests/etcd.yaml` | `--client-cert-auth=true`, `--auto-tls=false` |
| `kubelet` | `authentication.anonymous.enabled` | `/var/lib/kubelet/config.yaml` | `enabled: false`, `authorization.mode: Webhook` |
| `kubelet` | `--protect-kernel-defaults` | `/var/lib/kubelet/config.yaml` | `protectKernelDefaults: true` |
| Quyền file | Quyền sở hữu & permission manifest | `/etc/kubernetes/manifests/*.yaml` | `chmod 600`, `chown root:root` |

Sau khi sửa `/var/lib/kubelet/config.yaml`, luôn chạy:

```bash
systemctl daemon-reload && systemctl restart kubelet
systemctl status kubelet
```

## 3. Bảo mật Ingress với TLS & Chặn Metadata Endpoint

Để mã hóa lưu lượng từ client tới Ingress Controller, tạo `kubernetes.io/tls` Secret và khai báo trong `spec.tls`:

```bash
kubectl create secret tls app-tls-secret \
  --cert=/etc/certs/tls.crt \
  --key=/etc/certs/tls.key -n prod
```

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: secure-ingress
  namespace: prod
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - app.example.com
      secretName: app-tls-secret
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-svc
                port:
                  number: 80
```

Ngoài ra, trên môi trường Cloud (AWS/GCP/Azure), dùng `NetworkPolicy` chặn `egress` tới `169.254.169.254/32` (Cloud Metadata Service) bằng `ipBlock.except: ["169.254.169.254/32"]` để ngăn Pod bị khai thác SSRF đánh cắp IAM credentials của Node.

## 4. Xác minh Nhị phân Nền tảng (Binary Verification)

Trước khi cài đặt hoặc nâng cấp `kubeadm`, `kubelet`, `kubectl`, luôn kiểm tra checksum SHA512/SHA256 để chống tấn công giả mạo nhị phân:

```bash
# So sánh SHA512 của file thực thi với giá trị chính thức
sha512sum /usr/bin/kubelet
echo "<official-sha512-hash>  /usr/bin/kubelet" | sha512sum --check
```

> **Exam Tip**: Khi đề thi yêu cầu kiểm tra các binary trong thư mục và xóa file không khớp checksum, hãy dùng `sha512sum` (hoặc `sha256sum` theo đúng file hash đề cung cấp) để kiểm chứng chính xác từng file trước khi xóa.

---

[Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/01-network-policies-security.md) | [Bài tiếp →](02-ingress-tls-binary-verify.md)
