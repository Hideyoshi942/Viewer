# Quản trị etcd — Sao lưu (Snapshot) & Khôi phục Cụm (Domain 1)

`etcd` là cơ sở dữ liệu Key-Value phân tán lưu trữ toàn bộ trạng thái (state) của cụm Kubernetes. Trong kỳ thi CKA, câu hỏi **etcd backup & restore** gần như chắc chắn xuất hiện và chiếm tỷ trọng điểm rất cao.

---

## 1. Kiến trúc & Vị trí Chứng chỉ TLS của etcd

Trên cụm cài đặt bằng `kubeadm`, `etcd` chạy dưới dạng Static Pod định nghĩa tại `/etc/kubernetes/manifests/etcd.yaml`. Mọi giao tiếp với `etcd` đều bắt buộc xác thực mTLS.

| Tham số CLI (`etcdctl`) | Cờ tương ứng trong `etcd.yaml` | Giá trị mặc định trên `kubeadm` |
| :--- | :--- | :--- |
| `--endpoints` | `--listen-client-urls` | `https://127.0.0.1:2379` |
| `--cacert` | `--trusted-ca-file` | `/etc/kubernetes/pki/etcd/ca.crt` |
| `--cert` | `--cert-file` | `/etc/kubernetes/pki/etcd/server.crt` |
| `--key` | `--key-file` | `/etc/kubernetes/pki/etcd/server.key` |

> [!TIP]
> Luôn kiểm tra trước `cat /etc/kubernetes/manifests/etcd.yaml | grep -E "trusted-ca-file|cert-file|key-file|data-dir|listen-client-urls"` để lấy chính xác đường dẫn chứng chỉ (trong một số bài lab, chứng chỉ có thể nằm ở thư mục khác).

---

## 2. Sao lưu etcd (Snapshot Save)

Bắt buộc phải đặt biến môi trường `ETCDCTL_API=3` (hoặc dùng `etcdctl` v3.5+ mặc định API v3).

```bash
ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  snapshot save /opt/etcd-backup.db

# Kiểm tra tính toàn vẹn của file snapshot vừa tạo
ETCDCTL_API=3 etcdctl snapshot status /opt/etcd-backup.db --write-out=table
```

---

## 3. Khôi phục etcd (Snapshot Restore) — Quy trình 4 Bước Chuẩn

Khi khôi phục từ snapshot, **KHÔNG** ghi đè trực tiếp lên `--data-dir` cũ (`/var/lib/etcd`) khi etcd đang chạy. Hãy restore ra một thư mục mới (ví dụ `/var/lib/etcd-from-backup`), sau đó cập nhật Static Pod manifest của `etcd`.

```bash
# Bước 1: Restore snapshot ra thư mục mới (không cần truyền TLS flags khi restore)
ETCDCTL_API=3 etcdctl snapshot restore /opt/etcd-backup.db \
  --data-dir=/var/lib/etcd-from-backup

# Bước 2: Mở file /etc/kubernetes/manifests/etcd.yaml và sửa hostPath của volume etcd-data
sudo vi /etc/kubernetes/manifests/etcd.yaml
```

Trong `/etc/kubernetes/manifests/etcd.yaml`, tìm đến phần `volumes:` ở cuối file:

```yaml
  volumes:
  - hostPath:
      path: /etc/kubernetes/pki/etcd
      type: DirectoryOrCreate
    name: etcd-certs
  - hostPath:
      path: /var/lib/etcd-from-backup   # <--- Sửa từ /var/lib/etcd thành thư mục mới
      type: DirectoryOrCreate
    name: etcd-data
```

```bash
# Bước 3: Theo dõi kubelet tự động khởi động lại Static Pod etcd và kube-apiserver
watch crictl ps

# Bước 4: Xác minh dữ liệu cụm đã quay về trạng thái snapshot
kubectl get pods -A
```

---

## 4. Exam Tips — Bẫy Thường Gặp

1. **Chạy `etcdctl` ở đâu?** Nếu đang đứng trên node `student`/`workstation`, hãy `ssh` sang Control Plane node trước khi chạy `etcdctl`, hoặc truyền `--endpoints=https://<CONTROL_PLANE_IP>:2379` kèm chứng chỉ tương ứng.
2. **Sửa nhầm `volumeMounts.mountPath`:** Trong `etcd.yaml`, **chỉ sửa `volumes[].hostPath.path`**, tuyệt đối **không sửa `volumeMounts[].mountPath`** (`/var/lib/etcd`) hoặc `--data-dir` trong container command trừ khi đề bài yêu cầu.
3. **Chờ 30–60 giây:** Sau khi sửa `etcd.yaml`, `kube-apiserver` có thể mất vài chục giây để kết nối lại với etcd mới và trả về kết quả cho `kubectl`.

---

[← Bài trước](01-kubeadm-etcd-rbac.md) | [Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/02-etcd-backup-restore.md) | [Bài tiếp →](03-tls-csr-kubeconfig.md)
