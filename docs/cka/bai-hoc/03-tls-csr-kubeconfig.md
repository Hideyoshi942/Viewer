# Quản lý Chứng chỉ TLS (CSR), Kubeconfig & Gia hạn Chứng chỉ (Domain 1)

Trong Kubernetes, mọi kết nối tới `kube-apiserver` đều được xác thực qua TLS (X.509 Client Certificate) hoặc Token. Đề thi CKA thường có câu hỏi yêu cầu tạo một User mới bằng **CertificateSigningRequest (CSR)**, cấp quyền RBAC và cấu hình file `kubeconfig` cho User đó.

---

## 1. Quy trình 5 Bước Tạo User Mới bằng `CertificateSigningRequest` (CSR)

Giả sử đề bài yêu cầu tạo user tên `alice` thuộc group `developers`:

### Bước 1: Tạo Private Key và CSR bằng `openssl`
```bash
# Tạo private key 2048-bit
openssl genrsa -out alice.key 2048

# Tạo Certificate Signing Request (CN = username, O = group)
openssl req -new -key alice.key -out alice.csr -subj "/CN=alice/O=developers"

# Mã hóa base64 thành 1 dòng duy nhất để đưa vào YAML
cat alice.csr | base64 | tr -d '\n'
```

### Bước 2: Tạo đối tượng `CertificateSigningRequest` (`certificates.k8s.io/v1`)
```yaml
apiVersion: certificates.k8s.io/v1
kind: CertificateSigningRequest
metadata:
  name: alice-csr
spec:
  request: <CHUỖI_BASE64_TỪ_BƯỚC_1>
  signerName: kubernetes.io/kube-apiserver-client
  expirationSeconds: 86400   # Tùy chọn (ví dụ 24h)
  usages:
  - client auth
```
```bash
kubectl apply -f alice-csr.yaml
```

### Bước 3: Phê duyệt (`approve`) CSR
```bash
kubectl get csr
kubectl certificate approve alice-csr
# (Nếu cần từ chối dùng: kubectl certificate deny alice-csr)
```

### Bước 4: Trích xuất Chứng chỉ Đã Ký từ trường `.status.certificate`
```bash
kubectl get csr alice-csr -o jsonpath='{.status.certificate}' | base64 -d > alice.crt
```

### Bước 5: Gắn vào `kubeconfig` và Kiểm tra
```bash
# Thêm thông tin user với cặp cert/key mới
kubectl config set-credentials alice \
  --client-certificate=alice.crt \
  --client-key=alice.key \
  --embed-certs=true

# Tạo context mới trỏ tới cluster hiện tại
kubectl config set-context alice-context \
  --cluster=kubernetes \
  --user=alice \
  --namespace=dev

# Kiểm tra quyền bằng context mới
kubectl --context=alice-context get pods
```

---

## 2. Quản lý File `kubeconfig` (`kubectl config`)

File kubeconfig mặc định nằm tại `~/.kube/config` (hoặc được chỉ định qua biến môi trường `KUBECONFIG`).

```bash
# Xem danh sách các context và cluster hiện có
kubectl config get-contexts
kubectl config current-context

# Chuyển đổi context đang hoạt động
kubectl config use-context k8s-prod

# Xem toàn bộ nội dung kubeconfig kèm dữ liệu cert/key gốc (không bị che REDACTED)
kubectl config view --raw

# Xuất riêng một context ra file kubeconfig độc lập
kubectl config view --minify --flatten --context=alice-context > alice.kubeconfig
```

### Cấu trúc 3 phần cốt lõi của `kubeconfig`
1. **`clusters`**: Địa chỉ `server` (ví dụ `https://10.0.0.10:6443`) và `certificate-authority-data` (CA của cụm).
2. **`users`**: Thông tin xác thực (`client-certificate-data` + `client-key-data`, hoặc `token`).
3. **`contexts`**: Cầu nối ghép 1 `cluster` + 1 `user` + 1 `namespace` mặc định.

---

## 3. ServiceAccount Token & Gia hạn Chứng chỉ Cụm `kubeadm`

### 3.1. Tạo Token ngắn hạn cho ServiceAccount (K8s 1.24+)
Từ Kubernetes 1.24 trở đi, tạo `ServiceAccount` **không tự động sinh Secret token** nữa. Để lấy token:
```bash
kubectl create token app-sa -n dev --duration=1h
```

### 3.2. Kiểm tra Hạn & Gia hạn Chứng chỉ Control Plane bằng `kubeadm`
Chứng chỉ do `kubeadm` tạo mặc định có hạn **1 năm**. Khi chứng chỉ hết hạn, `kubectl` và `kubelet` sẽ báo lỗi `x509: certificate has expired`.

```bash
# Kiểm tra ngày hết hạn của tất cả chứng chỉ Control Plane
kubeadm certs check-expiration

# Gia hạn toàn bộ chứng chỉ Control Plane
kubeadm certs renew all

# Sau khi renew, phải khởi động lại các Static Pod Control Plane (apiserver, controller-manager, scheduler)
crictl pods
# Hoặc di chuyển tạm các file trong /etc/kubernetes/manifests/ ra ngoài rồi chuyển lại để kubelet recreate
```

---

[← Bài trước](02-etcd-backup-restore.md) | [Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/03-rbac-tls-kubeconfig.md) | [Bài tiếp →](04-helm-kustomize.md)
