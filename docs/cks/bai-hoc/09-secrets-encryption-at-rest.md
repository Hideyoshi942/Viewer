# Quản lý Secrets & Mã hóa Dữ liệu trong etcd (Domain 4)

Mặc định, Kubernetes `Secret` chỉ được mã hóa **Base64** (không phải encryption!) khi lưu trong `etcd`. Bất kỳ ai đọc được snapshot của `etcd` đều có thể giải mã toàn bộ mật khẩu và token. CKS yêu cầu bạn cấu hình **Encryption at Rest** trên `kube-apiserver`.

---

## 1. So sánh các Provider Mã hóa trong `EncryptionConfiguration`

| Provider | Thuật toán | Tốc độ | Bảo mật |
| :--- | :--- | :--- | :--- |
| `identity` | Không mã hóa (plaintext) | Nhanh nhất | Không an toàn (chỉ dùng làm fallback đọc dữ liệu cũ) |
| `aescbc` | AES-CBC với PKCS#7 padding (khóa 32-byte) | Nhanh | Khuyên dùng rộng rãi trong CKS |
| `secretbox` | XSalsa20 & Poly1305 | Nhanh | Rất an toàn, hỗ trợ authenticated encryption |
| `kms` (v2) | Envelope encryption với KMS ngoài (AWS/GCP/Vault) | Phụ thuộc mạng | An toàn nhất cho Production |

---

## 2. Quy trình 4 Bước Bật Encryption at Rest

### Bước 1: Tạo khóa ngẫu nhiên 32-byte mã hóa Base64

```bash
head -c 32 /dev/urandom | base64
# Ví dụ output: Y2tzLWVuY3J5cHRpb24ta2V5LTMyLWJ5dGVzISE=
```

### Bước 2: Tạo file `/etc/kubernetes/enc/enc.yaml`

```yaml
apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
  - resources:
      - secrets
    providers:
      - aescbc:
          keys:
            - name: key1
              secret: Y2tzLWVuY3J5cHRpb24ta2V5LTMyLWJ5dGVzISE=
      - identity: {}   # BẮT BUỘC đặt ở CUỐI CÙNG để đọc các Secret cũ chưa mã hóa!
```

> [!CAUTION]
> **Bẫy kinh điển:** Nếu bạn đặt `identity: {}` lên **đầu tiên**, API Server sẽ sử dụng provider đầu tiên để ghi dữ liệu mới — đồng nghĩa với việc các Secret mới tạo vẫn **KHÔNG được mã hóa**!

### Bước 3: Mount file vào `/etc/kubernetes/manifests/kube-apiserver.yaml`

Thêm cờ và volume mount vào `kube-apiserver.yaml`:

```yaml
    - --encryption-provider-config=/etc/kubernetes/enc/enc.yaml
    ...
    volumeMounts:
    - mountPath: /etc/kubernetes/enc
      name: enc
      readOnly: true
  volumes:
  - hostPath:
      path: /etc/kubernetes/enc
      type: DirectoryOrCreate
    name: enc
```

### Bước 4: Re-encrypt toàn bộ Secrets hiện có trong etcd

Cấu hình mới chỉ mã hóa các Secret **tạo mới hoặc cập nhật sau này**. Để mã hóa lại toàn bộ Secrets cũ đang nằm sẵn trong `etcd`:

```bash
kubectl get secrets --all-namespaces -o json | kubectl replace -f -
```

---

## 3. Xác minh Secret đã được Mã hóa trong etcd

```bash
ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  get /registry/secrets/default/my-secret | hexdump -C
# Nếu thấy tiền tố "k8s:enc:aescbc:v1:key1:" -> Thành công!
```

---

[← Bài trước](08-runtime-sandboxing-mtls.md) | [Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/10-secrets-encryption-at-rest.md) | [Bài tiếp →](10-supply-chain-trivy-sbom-admission.md)
