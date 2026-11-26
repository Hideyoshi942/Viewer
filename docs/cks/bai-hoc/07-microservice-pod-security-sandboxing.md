# Domain 4: Giảm thiểu Lỗ hổng Microservices (20%)

Domain 4 có tỷ trọng cao (20%) và bao phủ các lớp phòng thủ trực tiếp bảo vệ workload: **Pod Security Standards (PSS/PSA)**, **OPA Gatekeeper**, **Container Sandboxing (gVisor/Kata)**, **mTLS giữa các Pod** và **Mã hóa Secrets trong etcd (Encryption at Rest)**.

## 1. Pod Security Standards (PSS) & Pod Security Admission (PSA)

**Pod Security Admission** là admission controller tích hợp sẵn (thay thế hoàn toàn PodSecurityPolicy cũ), thực thi 3 mức **Pod Security Standards** bằng cách gắn label lên Namespace:

| Mức PSS | Ý nghĩa | Các yêu cầu chính |
| :--- | :--- | :--- |
| `privileged` | Không hạn chế | Cho phép mọi cấu hình (chỉ dùng cho workload hệ thống như CNI). |
| `baseline` | Ngăn leo thang đặc quyền rõ ràng | Cấm `privileged`, `hostNetwork/PID/IPC`, `hostPath`, thêm capability nguy hiểm. |
| `restricted` | Tuân thủ thực hành tốt nhất (Hardened) | Bao gồm `baseline` + bắt buộc `runAsNonRoot: true`, `allowPrivilegeEscalation: false`, `capabilities.drop: ["ALL"]`, `seccompProfile: RuntimeDefault/Localhost`. |

### 3 chế độ thực thi (Modes) trên Namespace
- `enforce`: **Từ chối** tạo Pod nếu vi phạm.
- `audit`: Cho phép tạo Pod nhưng ghi lại sự kiện vào **Audit Log**.
- `warn`: Cho phép tạo Pod nhưng trả về **cảnh báo** cho người dùng `kubectl`.

```bash
kubectl label namespace prod \
  pod-security.kubernetes.io/enforce=restricted \
  pod-security.kubernetes.io/enforce-version=latest \
  pod-security.kubernetes.io/warn=restricted \
  pod-security.kubernetes.io/audit=restricted
```

### Pod mẫu đạt chuẩn PSS `restricted`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: restricted-pod
  namespace: prod
spec:
  securityContext:
    runAsNonRoot: true
    seccompProfile:
      type: RuntimeDefault
  containers:
    - name: app
      image: nginxinc/nginx-unprivileged:1.27
      securityContext:
        allowPrivilegeEscalation: false
        capabilities:
          drop: ["ALL"]
```

## 2. OPA Gatekeeper — Policy as Code với Rego

Khi PSS chưa đủ chi tiết (ví dụ: bắt buộc mọi Pod phải có label `owner`, hoặc chỉ cho phép kéo image từ registry nội bộ), ta sử dụng **OPA Gatekeeper** (Validating Admission Webhook dựa trên CRD):
1. **`ConstraintTemplate`**: Định nghĩa logic Rego và schema tham số.
2. **`Constraint`**: Áp dụng template lên các resource/namespace cụ thể.

```yaml
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8srequiredlabels
spec:
  crd:
    spec:
      names:
        kind: K8sRequiredLabels
      validation:
        openAPIV3Schema:
          type: object
          properties:
            labels:
              type: array
              items: { type: string }
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequiredlabels
        violation[{"msg": msg}] {
          provided := {label | input.review.object.metadata.labels[label]}
          required := {label | label := input.parameters.labels[_]}
          missing := required - provided
          count(missing) > 0
          msg := sprintf("Missing required labels: %v", [missing])
        }
```

## 3. Container Sandboxing với `RuntimeClass` (gVisor & Kata Containers)

Để cô lập mạnh hơn cho các workload không tin cậy (multi-tenant, chạy code người dùng), dùng **RuntimeClass** trỏ tới sandboxed runtime:
- **gVisor (`runsc`)**: User-space kernel chặn và mô phỏng syscall trước khi chạm tới host kernel.
- **Kata Containers**: Chạy mỗi Pod bên trong một micro-VM nhẹ có nhân Linux riêng biệt.

```yaml
apiVersion: node.k8s.io/v1
kind: RuntimeClass
metadata:
  name: gvisor
handler: runsc
---
apiVersion: v1
kind: Pod
metadata:
  name: sandboxed-pod
spec:
  runtimeClassName: gvisor
  containers:
    - name: app
      image: nginx:1.27-alpine
```

## 4. Mã hóa Lưu lượng Pod-to-Pod với mTLS (Istio / Cilium)

Mặc định giao tiếp giữa các Pod là bản rõ (plaintext). **Mutual TLS (mTLS)** xác thực hai chiều bằng chứng chỉ X.509 (thường cấp phát theo chuẩn SPIFFE) và mã hóa toàn bộ lưu lượng:
- **Istio**: Bật sidecar injection (`kubectl label ns prod istio-injection=enabled`) và tạo `PeerAuthentication` với `mtls.mode: STRICT`.
- **Cilium**: Hỗ trợ mã hóa minh bạch ở tầng mạng bằng WireGuard/IPsec hoặc Cilium Service Mesh mTLS (không cần sidecar proxy).

## 5. Mã hóa Secrets trong etcd (Encryption at Rest)

Mặc định Kubernetes chỉ mã hóa Base64 cho `Secret` trong `etcd` (ai đọc được `etcd` sẽ đọc được bản rõ). Để bật **Encryption at Rest**:

1. Tạo file `/etc/kubernetes/enc/ec.yaml`:
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
              secret: <32-byte-base64-encoded-key>
      - identity: {}
```
2. Thêm cờ `--encryption-provider-config=/etc/kubernetes/enc/ec.yaml` và mount volume `/etc/kubernetes/enc` vào `/etc/kubernetes/manifests/kube-apiserver.yaml`.
3. **Mã hóa lại các Secrets đã tồn tại trước đó** (cực kỳ hay bị quên!):
```bash
kubectl get secrets --all-namespaces -o json | kubectl replace -f -
```

> **Exam Tip**: Thứ tự `providers` trong `EncryptionConfiguration` rất quan trọng! Provider **đầu tiên** (`aescbc` hoặc `kms`) được dùng để **mã hóa khi ghi mới**; các provider phía sau (bao gồm `identity: {}`) chỉ dùng để **giải mã khi đọc** dữ liệu cũ chưa mã hóa. Nếu đặt `identity: {}` lên đầu, Secrets mới sẽ KHÔNG được mã hóa!

---

[← Bài trước](06-system-hardening-apparmor-seccomp.md) | [Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/08-pod-security-standards-opa.md) | [Bài tiếp →](08-runtime-sandboxing-mtls.md)
