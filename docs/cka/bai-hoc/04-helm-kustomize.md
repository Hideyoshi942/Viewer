# Quản lý Gói Ứng dụng với Helm v3 & Kustomize (Domain 1)

Kỳ thi CKA cập nhật yêu cầu thí sinh sử dụng thành thạo **Helm v3** (cài đặt, nâng cấp, rollback, tùy biến `values`) và **Kustomize** (quản lý cấu hình đa môi trường không dùng template) trực tiếp qua `kubectl`.

---

## 1. Helm v3 — Quản lý Chart & Release

### 1.1. Quản lý Repository & Tìm kiếm Chart
```bash
# Thêm và cập nhật repository
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm repo list

# Tìm kiếm chart và xem các phiên bản có sẵn
helm search repo bitnami/nginx --versions
```

### 1.2. Cài đặt, Tùy biến `values` & Kiểm tra trước khi Deploy
```bash
# Xem toàn bộ giá trị mặc định của chart
helm show values bitnami/nginx > custom-values.yaml

# Cài đặt release với file values tùy biến hoặc --set
helm install my-web bitnami/nginx -n prod --create-namespace -f custom-values.yaml
helm install my-web bitnami/nginx -n prod --set replicaCount=3 --set service.type=ClusterIP

# Render manifest YAML ra stdout mà KHÔNG cài lên cụm (rất hữu ích để kiểm tra hoặc pipe vào kubectl)
helm template my-web bitnami/nginx -n prod --set replicaCount=2 > rendered.yaml
```

### 1.3. Liệt kê, Nâng cấp, Rollback & Gỡ bỏ Release
```bash
# Liệt kê release ở mọi namespace (bao gồm cả trạng thái pending/failed)
helm list -A
helm list -n prod --all

# Xem lại giá trị values đã dùng hoặc lịch sử revision của release
helm get values my-web -n prod
helm history my-web -n prod

# Nâng cấp release lên version mới hoặc thay đổi values
helm upgrade my-web bitnami/nginx -n prod --set replicaCount=4 --version 18.1.0

# Rollback về revision 1
helm rollback my-web 1 -n prod

# Gỡ release (giữ lịch sử nếu thêm --keep-history)
helm uninstall my-web -n prod
```

> **Mẹo thi CKA**: Đề bài thường cho sẵn một release đang chạy hoặc yêu cầu tìm release bị `pending-install`/`failed` để `helm uninstall` hoặc `helm upgrade`. Luôn chạy `helm list -A` đầu tiên!

---

## 2. Kustomize — Tùy biến Manifest Không Cần Template

Kustomize được tích hợp sẵn trong `kubectl` qua cờ **`-k`** (`kubectl apply -k`, `kubectl kustomize`, `kubectl delete -k`).

### 2.1. Cấu trúc thư mục Base & Overlays
```text
app/
├── base/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── kustomization.yaml
└── overlays/
    ├── dev/
    │   ├── kustomization.yaml
    │   └── replica-patch.yaml
    └── prod/
        ├── kustomization.yaml
        └── replica-patch.yaml
```

### 2.2. File `kustomization.yaml` mẫu thực chiến
```yaml
# overlays/prod/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: prod
namePrefix: prod-

resources:
- ../../base

commonLabels:
  env: production

configMapGenerator:
- name: app-env
  literals:
  - LOG_LEVEL=warn
  - CACHE_TTL=300

images:
- name: nginx
  newTag: "1.26.1"

patches:
- path: replica-patch.yaml
  target:
    kind: Deployment
    name: web
```

### 2.3. Lệnh `kubectl` với Kustomize
```bash
# Xem trước toàn bộ YAML kết quả sau khi Kustomize gộp base + overlay
kubectl kustomize app/overlays/prod

# Áp dụng trực tiếp lên cụm
kubectl apply -k app/overlays/prod

# Kiểm tra thay đổi trước khi apply
kubectl diff -k app/overlays/prod

# Xóa toàn bộ tài nguyên thuộc overlay
kubectl delete -k app/overlays/prod
```

---

## 3. So sánh nhanh Helm vs Kustomize

| Tiêu chí | Helm v3 | Kustomize |
| :--- | :--- | :--- |
| **Cơ chế hoạt động** | Go Templates (`{{ .Values.x }}`) đóng gói thành Chart | Overlay & Patch trực tiếp lên file YAML thuần |
| **Quản lý vòng đời / Rollback** | Có (`helm upgrade`, `helm rollback`, `helm history`) | Không lưu release history riêng (dùng `kubectl apply -k`) |
| **Tích hợp sẵn trong `kubectl`** | Không (cần cài CLI `helm`) | Có sẵn (`kubectl apply -k`, `kubectl kustomize`) |
| **Phù hợp nhất khi** | Đóng gói và phân phối phần mềm bên thứ 3 (Ingress, Prometheus, Redis) | Quản lý manifest nội bộ qua nhiều môi trường (`dev`/`staging`/`prod`) |

---

[← Bài trước](03-tls-csr-kubeconfig.md) | [Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/04-helm-kustomize-crd.md) | [Bài tiếp →](05-workloads-scheduling-probes.md)
