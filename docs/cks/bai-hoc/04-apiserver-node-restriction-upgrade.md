# Gia cố API Server, NodeRestriction & Nâng cấp An toàn (Domain 2)

`kube-apiserver` là cửa ngõ duy nhất giao tiếp với `etcd` và điều phối toàn bộ cụm. Gia cố API Server, bật `NodeRestriction` và bảo vệ `kubelet` API là những bài tập thực hành phổ biến nhất trong Domain 2 (Cluster Hardening — 15%).

---

## 1. Các Cờ Gia cố `kube-apiserver` Quan trọng

File manifest nằm tại `/etc/kubernetes/manifests/kube-apiserver.yaml`.

| Cờ cấu hình | Giá trị An toàn | Rủi ro nếu cấu hình sai |
| :--- | :--- | :--- |
| `--anonymous-auth` | `false` | Cho phép request không xác thực truy cập API Server |
| `--authorization-mode` | `Node,RBAC` | `AlwaysAllow` bỏ qua mọi kiểm tra quyền RBAC! |
| `--enable-admission-plugins` | `...,NodeRestriction` | Thiếu `NodeRestriction` cho phép kubelet sửa nhãn/object của Node khác |
| `--insecure-port` | Không dùng (đã bỏ ở K8s mới) | Mở cổng HTTP không mã hóa, không xác thực |
| `--profiling` | `false` | Lộ thông tin debug/memory của API Server |

```yaml
# Trích đoạn /etc/kubernetes/manifests/kube-apiserver.yaml
spec:
  containers:
  - command:
    - kube-apiserver
    - --anonymous-auth=false
    - --authorization-mode=Node,RBAC
    - --enable-admission-plugins=NodeRestriction
    - --profiling=false
```

---

## 2. Cơ chế Bảo vệ của `NodeRestriction` Admission Plugin

Khi `--authorization-mode=Node,RBAC` được bật cùng `--enable-admission-plugins=NodeRestriction`:
- Một `kubelet` trên Node A chỉ được phép sửa đối tượng `Node` mang tên Node A và các `Pod` đang gán cho Node A.
- `kubelet` bị **chặn** sửa các nhãn nhạy cảm có tiền tố `node-restriction.kubernetes.io/*` (nhằm ngăn kẻ tấn công chiếm quyền Node rồi tự gắn nhãn để kéo các Pod nhạy cảm về Node của mình).

---

## 3. Gia cố Kubelet API (`/var/lib/kubelet/config.yaml`)

Mặc định cổng `10250` của kubelet có thể bị khai thác nếu bật xác thực ẩn danh:

```yaml
# /var/lib/kubelet/config.yaml
authentication:
  anonymous:
    enabled: false          # Cấm truy cập ẩn danh vào kubelet API
  webhook:
    enabled: true
authorization:
  mode: Webhook             # Ủy quyền cho API Server kiểm tra RBAC thay vì AlwaysAllow
readOnlyPort: 0             # Tắt cổng 10255 read-only không xác thực
```

Sau khi sửa `/var/lib/kubelet/config.yaml`, bắt buộc phải khởi động lại kubelet:

```bash
sudo systemctl daemon-reload
sudo systemctl restart kubelet
```

---

## 4. Exam Tips — Sửa `kube-apiserver.yaml` An toàn

1. **Sao lưu trước khi sửa:** Luôn `cp /etc/kubernetes/manifests/kube-apiserver.yaml /tmp/kube-apiserver.yaml.bak` (lưu ý: để ở `/tmp/`, **không** để file `.bak` trong `/etc/kubernetes/manifests/` vì kubelet sẽ đọc tất cả file trong thư mục đó!).
2. **Debug khi API Server không lên:** Nếu `kubectl` báo `connection refused`, dùng `crictl ps -a | grep kube-apiserver` và `crictl logs <container-id>` để xem cờ nào bị gõ sai chính tả.
3. **Nâng cấp cụm an toàn:** Luôn `kubectl drain <node> --ignore-daemonsets` trước khi chạy `kubeadm upgrade`, kiểm tra lại các tham số bảo mật tùy chỉnh sau khi nâng cấp vì `kubeadm` có thể reset manifest về mặc định.

---

[← Bài trước](03-cluster-hardening-rbac-api.md) | [Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/05-apiserver-node-restriction-upgrade.md) | [Bài tiếp →](05-host-os-kernel-capabilities.md)
