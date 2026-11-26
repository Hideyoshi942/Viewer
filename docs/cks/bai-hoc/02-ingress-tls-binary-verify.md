# Bảo mật Ingress TLS, Metadata API & Xác minh Binary (Domain 1)

Trong Domain 1 (Cluster Setup — 15%), ngoài NetworkPolicy và CIS Benchmark, bạn cần nắm vững cách mã hóa lưu lượng vào cụm bằng Ingress TLS, bảo vệ Cloud Metadata API và xác minh tính toàn vẹn của các file nhị phân (binary) Kubernetes.

---

## 1. Bảo mật Ingress với TLS Termination

Mọi dịch vụ HTTP public ra ngoài cần sử dụng HTTPS với chứng chỉ TLS lưu trong `kubernetes.io/tls` Secret.

```bash
# Bước 1: Tạo TLS Secret từ cặp cert và key
kubectl create secret tls web-tls-secret \
  --cert=/etc/certs/tls.crt \
  --key=/etc/certs/tls.key \
  -n prod

# Bước 2: Khai báo Ingress sử dụng TLS Secret
cat <<EOF | kubectl apply -f -
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
    - app.secure.local
    secretName: web-tls-secret
  rules:
  - host: app.secure.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-svc
            port:
              number: 80
EOF
```

---

## 2. Chặn Truy cập Cloud Metadata API (`169.254.169.254`)

Trên AWS, GCP, Azure, bất kỳ Pod nào cũng có thể gọi tới `http://169.254.169.254/latest/meta-data/` để đánh cắp IAM credentials của Worker Node nếu không bị chặn ở tầng mạng.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-cloud-metadata
  namespace: default
spec:
  podSelector: {}
  policyTypes:
  - Egress
  egress:
  - to:
    - ipBlock:
        cidr: 0.0.0.0/0
        except:
        - 169.254.169.254/32
```

---

## 3. Xác minh Tính toàn vẹn Binary Kubernetes (Checksum Verification)

Trước khi cài đặt hoặc nâng cấp `kubeadm`, `kubelet`, `kubectl`, luôn kiểm tra SHA-256 hoặc SHA-512 checksum để phát hiện binary bị giả mạo (tampering).

```bash
# Tải binary và file checksum tương ứng
curl -LO "https://dl.k8s.io/release/v1.31.0/bin/linux/amd64/kubectl"
curl -LO "https://dl.k8s.io/release/v1.31.0/bin/linux/amd64/kubectl.sha256"

# Cách 1: Kiểm tra tự động (lưu ý hai dấu cách giữa hash và tên file)
echo "$(cat kubectl.sha256)  kubectl" | sha256sum --check
# Kết quả hợp lệ: kubectl: OK

# Cách 2: So sánh SHA-512 thủ công
sha512sum /usr/local/bin/kube-apiserver
```

---

## 4. Exam Tips

1. **TLS Secret cùng Namespace:** Secret chứa `tls.crt`/`tls.key` bắt buộc phải nằm trong cùng Namespace với `Ingress` resource.
2. **Bảo vệ Kubelet & Control Plane Node:** Trong bài thi CKS, nếu đề yêu cầu "không cho Pod ở namespace X truy cập Metadata server", hãy viết `NetworkPolicy` với `ipBlock.except: [169.254.169.254/32]`.
3. **Kiểm tra binary bị thay đổi:** Nếu phát hiện `sha256sum` hoặc `sha512sum` không khớp với giá trị chuẩn từ nhà cung cấp, hãy xóa hoặc cô lập binary đó ngay lập tức và tải lại từ nguồn chính thức.

---

[← Bài trước](01-cluster-setup-network-cis.md) | [Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/03-ingress-tls-binary-verify.md) | [Bài tiếp →](03-cluster-hardening-rbac-api.md)
