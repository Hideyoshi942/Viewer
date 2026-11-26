# ImagePolicyWebhook, Dockerfile Hardening & Static Analysis (Domain 5)

Domain 5 (Supply Chain Security — 20%) không chỉ kiểm tra quét lỗ hổng mà còn đòi hỏi bạn biết chặn image không an toàn tại cổng vào cụm (`ImagePolicyWebhook`), tối ưu `Dockerfile` và phân tích tĩnh YAML.

---

## 1. Cấu hình `ImagePolicyWebhook` Admission Controller

`ImagePolicyWebhook` gọi một Webhook server bên ngoài mỗi khi có Pod được tạo để quyết định `allow` hay `deny` image.

### Bước 1: Bật plugin trên `kube-apiserver.yaml`

```yaml
    - --enable-admission-plugins=NodeRestriction,ImagePolicyWebhook
    - --admission-control-config-file=/etc/kubernetes/admission/admission-config.yaml
```
*(Đừng quên mount thư mục `/etc/kubernetes/admission` vào Static Pod `kube-apiserver`!)*

### Bước 2: Cấu hình `admission-config.yaml` & `kubeconfig`

```yaml
# /etc/kubernetes/admission/admission-config.yaml
apiVersion: apiserver.config.k8s.io/v1
kind: AdmissionConfiguration
plugins:
  - name: ImagePolicyWebhook
    configuration:
      imagePolicy:
        kubeConfigFile: /etc/kubernetes/admission/webhook-kubeconfig.yaml
        allowTTL: 50
        denyTTL: 50
        retryBackoff: 500
        defaultAllow: false   # QUAN TRỌNG: Từ chối Pod nếu Webhook server bị lỗi/unreachable!
```

> [!IMPORTANT]
> Trong đề thi CKS, `defaultAllow: false` là yêu cầu bắt buộc (fail-closed) để đảm bảo không ai lách luật bằng cách làm sập Webhook server.

---

## 2. Dockerfile Hardening (Multi-stage, Distroless, Non-Root)

So sánh Dockerfile kém an toàn và Dockerfile đạt chuẩn CKS:

```dockerfile
# --- KÉM AN TOÀN ---
FROM golang:1.22           # Chứa cả compiler, shell, curl, gói OS thừa (~800MB)
COPY . /app
RUN go build -o /server
CMD ["/server"]            # Chạy bằng root (UID 0)!

# --- CHUẨN CKS (Multi-stage + Distroless + Non-root) ---
FROM golang:1.22-alpine AS builder
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /server .

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=builder /server /server
USER 65532:65532           # Chạy bằng non-root user
ENTRYPOINT ["/server"]
```

---

## 3. Phân tích Tĩnh (Static Analysis) YAML & Dockerfile

Trước khi deploy lên cụm, sử dụng các công cụ phân tích tĩnh để phát hiện cấu hình rủi ro:

```bash
# Kubesec: Chấm điểm rủi ro bảo mật cho Pod/Deployment YAML
kubesec scan deployment.yaml

# KubeLinter: Kiểm tra vi phạm best-practice (thiếu readOnlyRootFilesystem, chạy root...)
kube-linter lint deployment.yaml

# Hadolint: Kiểm tra lỗ hổng & best-practice trong Dockerfile
hadolint Dockerfile
```

---

## 4. Exam Tips

1. Khi sửa `ImagePolicyWebhook`, luôn kiểm tra kỹ đường dẫn `kubeConfigFile` bên trong `admission-config.yaml` phải là đường dẫn **bên trong container `kube-apiserver`** (khớp với `volumeMounts.mountPath`).
2. Với câu hỏi sửa Dockerfile trong phòng thi: **không** chạy `docker build` nếu đề không yêu cầu, nhưng phải đảm bảo sửa đúng `FROM` (dùng tag cố định hoặc `@sha256:`), thêm `USER` non-root, và loại bỏ các lệnh `ADD` URL từ xa hoặc `chmod 777`.

---

[← Bài trước](10-supply-chain-trivy-sbom-admission.md) | [Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/12-admission-dockerfile-static-analysis.md) | [Bài tiếp →](12-runtime-falco-audit-logs.md)
