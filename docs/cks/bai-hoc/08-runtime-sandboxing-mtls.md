# Sandboxing Workload (gVisor/Kata) & mTLS (Istio/Cilium) (Domain 4)

Các container thông thường chia sẻ chung một Linux Kernel của Host OS. Khi chạy mã nguồn không đáng tin cậy (multi-tenant), chúng ta cần **Sandboxing** bằng `RuntimeClass` và mã hóa giao tiếp nội bộ bằng **mTLS**.

---

## 1. Cô lập Kernel với `RuntimeClass` (gVisor & Kata Containers)

| Công nghệ | Handler phổ biến | Cơ chế cô lập | Đánh đổi (Trade-off) |
| :--- | :--- | :--- | :--- |
| `runc` (Mặc định) | `runc` | Namespace + cgroups (dùng chung Host Kernel) | Hiệu năng cao nhất, rủi ro container escape cao hơn |
| **gVisor** | `runsc` | User-space kernel viết bằng Go chặn và xử lý syscall | Chậm hơn ở I/O nặng, an toàn cao cho untrusted code |
| **Kata Containers** | `kata` / `kata-qemu` | Mỗi Pod chạy trong một MicroVM riêng có kernel độc lập | Tốn RAM/CPU khởi tạo VM, cô lập phần cứng mạnh nhất |

### Khai báo `RuntimeClass` và Áp dụng cho Pod

```yaml
apiVersion: node.k8s.io/v1
kind: RuntimeClass
metadata:
  name: gvisor
handler: runsc   # Phải khớp với tên runtime cấu hình trong /etc/containerd/config.toml
---
apiVersion: v1
kind: Pod
metadata:
  name: untrusted-sandbox-pod
spec:
  runtimeClassName: gvisor
  containers:
  - name: runner
    image: busybox:1.36
    command: ["sleep", "3600"]
```

---

## 2. Mã hóa Lưu lượng Pod-to-Pod với mTLS (Istio / Cilium)

Trong kiến trúc Zero Trust, không thể tin tưởng mạng nội bộ của cụm. Service Mesh (Istio) hoặc CNI (Cilium) cung cấp **Mutual TLS (mTLS)** tự động xoay vòng chứng chỉ giữa các Pod.

### Istio `PeerAuthentication` (Bắt buộc mTLS STRICT)

```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: checkout   # Áp dụng cho toàn bộ Pod trong namespace checkout
spec:
  mtls:
    mode: STRICT        # Từ chối mọi kết nối HTTP plaintext không có mTLS
```

- `PERMISSIVE`: Chấp nhận cả plaintext và mTLS (dùng trong giai đoạn chuyển đổi).
- `STRICT`: Chỉ chấp nhận kết nối đã mã hóa mTLS và xác thực danh tính SPIFFE của Pod nguồn.

---

## 3. Exam Tips

1. **Kiểm tra handler của containerd:** Trước khi tạo `RuntimeClass`, kiểm tra `/etc/containerd/config.toml` xem handler được đặt tên là `runsc` hay `gvisor` hay `kata` để điền đúng vào trường `handler:`.
2. **Xác minh Pod đang chạy trong gVisor:** Chạy `kubectl exec untrusted-sandbox-pod -- uname -a` hoặc `dmesg` — gVisor sẽ hiển thị kernel signature đặc trưng của `gVisor` thay vì kernel Ubuntu của Host.
3. **Sidecar Injection cho Istio:** Đảm bảo Namespace đã được gắn nhãn `istio-injection=enabled` (và Pod đã được tạo lại) thì Envoy sidecar mới được tiêm vào để thực thi `PeerAuthentication`.

---

[← Bài trước](07-microservice-pod-security-sandboxing.md) | [Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/09-runtime-sandboxing-mtls.md) | [Bài tiếp →](09-secrets-encryption-at-rest.md)
