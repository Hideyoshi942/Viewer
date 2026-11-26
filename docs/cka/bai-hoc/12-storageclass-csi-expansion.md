# StorageClass, Dynamic Provisioning, CSI & Volume Expansion (Domain 4)

Domain 4 chiếm 10% tổng điểm CKA. Các bài tập thường yêu cầu tạo `StorageClass` với `WaitForFirstConsumer`, cấp phát PVC động và mở rộng dung lượng PVC đang sử dụng.

---

## 1. StorageClass & Dynamic Provisioning

Thay vì Admin phải tạo trước `PersistentVolume` (Static Provisioning), `StorageClass` cho phép tự động tạo PV ngay khi có `PVC` yêu cầu thông qua CSI Driver.

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-csi-sc
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: ebs.csi.aws.com        # Hoặc rancher.io/local-path, pd.csi.storage.gke.io
reclaimPolicy: Retain               # Mặc định là Delete nếu không khai báo
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true          # Bắt buộc nếu muốn resize PVC sau này
```

---

## 2. So sánh `volumeBindingMode`: Immediate vs WaitForFirstConsumer

| Chế độ | Thời điểm tạo & bind PV | Ưu điểm / Rủi ro |
| :--- | :--- | :--- |
| `Immediate` (Mặc định) | Ngay lập tức khi tạo `PVC` | Rủi ro: PV có thể được tạo ở Zone A, nhưng Pod sau đó bị schedule sang Zone B -> Pod kẹt ở `Pending`! |
| `WaitForFirstConsumer` | Trì hoãn đến khi có `Pod` sử dụng PVC được schedule | Đảm bảo PV được tạo đúng Node / Availability Zone nơi Pod chạy. **Khuyến nghị dùng trong thực tế & đề thi.** |

---

## 3. Mở rộng Dung lượng PVC (Volume Expansion)

Để tăng dung lượng một PVC đang gắn với Pod (ví dụ từ `5Gi` lên `10Gi`):

1. **Điều kiện:** `StorageClass` phải có `allowVolumeExpansion: true`.
2. **Thực hiện:** Chỉnh sửa trường `spec.resources.requests.storage` trong PVC:

```bash
kubectl patch pvc my-pvc -p '{"spec":{"resources":{"requests":{"storage":"10Gi"}}}}'
# Hoặc dùng: kubectl edit pvc my-pvc
```

3. **Theo dõi:** Kiểm tra `kubectl get pvc my-pvc` và `kubectl describe pvc my-pvc`. Một số CSI driver yêu cầu khởi động lại Pod (hoặc chờ trạng thái `FileSystemResizePending` hoàn tất) để filesystem bên trong container nhận dung lượng mới.

---

## 4. Đặt StorageClass Mặc định

```bash
# Bỏ mặc định khỏi StorageClass cũ
kubectl patch storageclass old-sc -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}'

# Đặt StorageClass mới làm mặc định
kubectl patch storageclass fast-csi-sc -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

---

## 5. Exam Tips

- Nếu đề bài yêu cầu tạo PVC sử dụng `local-path` hoặc một `StorageClass` có sẵn, hãy chạy `kubectl get sc` đầu tiên để xem tên chính xác và kiểm tra xem `allowVolumeExpansion` đã là `true` chưa.
- Không thể **giảm** dung lượng PVC (`shrink`), Kubernetes chỉ hỗ trợ **tăng** dung lượng (`expand`).

---

[← Bài trước](11-storage-pv-pvc-storageclass.md) | [Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/12-storageclass-csi-expansion.md) | [Bài tiếp →](13-troubleshooting-deep-dive.md)
