# Domain 5: Bảo mật Chuỗi cung ứng (20%)

Domain 5 (20%) bảo vệ toàn bộ vòng đời phần mềm từ lúc viết `Dockerfile` và Kubernetes YAML manifest, đóng gói container image, tạo SBOM & ký số, đến khi kiểm duyệt image trước khi chạy trên cụm.

## 1. Giảm thiểu Footprint & Gia cố `Dockerfile`

Image càng lớn, càng nhiều gói OS và shell thì bề mặt tấn công càng rộng.

### Thực hành tốt nhất khi tối ưu Dockerfile
- **Dùng Multi-stage build**: Biên dịch ở stage `builder`, chỉ copy binary sang stage cuối.
- **Dùng Base Image tối giản**: `distroless` (`gcr.io/distroless/static-debian12`), `scratch` hoặc `alpine` (không chứa shell/curl/wget).
- **Ghim phiên bản cố định bằng Digest (`@sha256:...`)** thay vì dùng tag `:latest`.
- **Không chạy bằng `root`**: Tạo user non-root và khai báo `USER 10001:10001`.
- **Không lưu secrets** trong `ENV`, `ARG` hoặc layer trung gian.

```dockerfile
FROM golang:1.23-alpine AS builder
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=builder /app /app
USER 65532:65532
ENTRYPOINT ["/app"]
```

## 2. Quét lỗ hổng CVE với `trivy`

**Trivy** (Aqua Security) quét lỗ hổng OS package, thư viện ứng dụng, cấu hình sai (IaC) và secrets.

```bash
# Quét image chỉ hiển thị lỗ hổng HIGH và CRITICAL
trivy image --severity HIGH,CRITICAL nginx:1.25

# Quét và trả về exit code 1 nếu phát hiện CRITICAL (dùng trong CI/CD)
trivy image --severity CRITICAL --exit-code 1 --ignore-unfixed python:3.11-slim

# Quét nhanh tất cả image đang chạy trong một namespace
for img in $(kubectl get pods -n prod -o jsonpath='{.items[*].spec.containers[*].image}' | tr ' ' '\n' | sort -u); do
  echo "=== Scanning $img ==="
  trivy image --severity CRITICAL --quiet "$img"
done
```

> **Exam Tip**: Trong đề thi CKS, thường có câu yêu cầu quét các Pod trong namespace bằng `trivy` và **xóa các Pod chứa CVE cụ thể** (ví dụ `CVE-2023-XXXX`) hoặc có mức `CRITICAL`. Hãy dùng `trivy image -s CRITICAL` kết hợp `grep` để xác định chính xác Pod vi phạm.

## 3. SBOM (Software Bill of Materials) & Ký số Image với `cosign`

- **SBOM** là danh sách đầy đủ các thành phần phần mềm và thư viện bên trong image (định dạng chuẩn **SPDX** hoặc **CycloneDX**), giúp tra cứu tức thì khi xuất hiện lỗ hổng Zero-Day mới (như Log4Shell).
- **Cosign (Sigstore)** ký số và xác minh tính toàn vẹn của container image trước khi triển khai.

```bash
# Tạo SBOM định dạng SPDX JSON bằng trivy (hoặc bom / syft)
trivy image --format spdx-json --output sbom-spdx.json nginx:1.27-alpine

# Tạo SBOM định dạng CycloneDX bằng bom / trivy
trivy image --format cyclonedx --output sbom-cdx.json nginx:1.27-alpine

# Xác minh chữ ký Cosign của image bằng public key
cosign verify --key cosign.pub registry.example.com/app@sha256:<digest>
```

## 4. `ImagePolicyWebhook` — Kiểm duyệt Image tại Admission

`ImagePolicyWebhook` là một **Validating Admission Plugin** tích hợp sẵn trong `kube-apiserver`, gửi thông tin image tới một backend webhook bên ngoài để quyết định `allow` hay `deny`.

### 3 bước cấu hình bắt buộc trên Control Plane
1. **File `admission_config.json`** (ví dụ `/etc/kubernetes/epconfig/admission_configuration.json`):
```json
{
  "apiVersion": "apiserver.config.k8s.io/v1",
  "kind": "AdmissionConfiguration",
  "plugins": [
    {
      "name": "ImagePolicyWebhook",
      "configuration": {
        "imagePolicy": {
          "kubeConfigFile": "/etc/kubernetes/epconfig/kubeconfig.yaml",
          "allowTTL": 50,
          "denyTTL": 50,
          "retryBackoff": 500,
          "defaultAllow": false
        }
      }
    }
  ]
}
```
2. **File `kubeconfig.yaml`**: Chứa URL của webhook server (`server: https://...`), chứng chỉ CA và client cert/key để mTLS với webhook.
3. **Cập nhật `/etc/kubernetes/manifests/kube-apiserver.yaml`**:
   - Thêm `ImagePolicyWebhook` vào `--enable-admission-plugins=NodeRestriction,ImagePolicyWebhook`.
   - Thêm `--admission-control-config-file=/etc/kubernetes/epconfig/admission_configuration.json`.
   - Mount `hostPath` `/etc/kubernetes/epconfig` vào container `kube-apiserver` (`readOnly: true`).

> **Exam Tip**: Luôn đặt `"defaultAllow": false` (fail-closed)! Nếu `"defaultAllow": true` (fail-open), khi webhook server bị lỗi hoặc không thể kết nối, cụm sẽ tự động cho phép mọi image không an toàn chạy.

## 5. Phân tích tĩnh Workload (Static Analysis)

Trước khi `kubectl apply`, sử dụng công cụ phân tích tĩnh để phát hiện cấu hình mất an toàn trong YAML và Dockerfile:
- **`kubesec`**: Chấm điểm bảo mật Pod/Deployment YAML (ví dụ `kubesec scan deploy.yaml`), phát hiện `privileged: true`, thiếu `readOnlyRootFilesystem`, `runAsNonRoot`.
- **`kube-linter`** / **`trivy config`**: Kiểm tra hàng loạt manifest YAML/Helm chart theo rule bảo mật.
- **`hadolint`**: Kiểm tra Dockerfile theo best practices.

---

[← Bài trước](09-secrets-encryption-at-rest.md) | [Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/11-image-scanning-sbom-cosign.md) | [Bài tiếp →](11-admission-dockerfile-static-analysis.md)
