# Lưu trữ trong Kubernetes: PV, PVC, StorageClass & CSI (Domain 4 — 10%)

Domain 4 chiếm **10% điểm thi** CKA. Các bài tập thường yêu cầu tạo `PersistentVolume` (Static Provisioning), gắn `PersistentVolumeClaim` vào Pod, cấu hình `StorageClass` (`WaitForFirstConsumer`), mở rộng dung lượng PVC (`allowVolumeExpansion`), hoặc xử lý PV bị kẹt ở trạng thái `Released`.

---

## 1. Kiến trúc PV, PVC & Ba Chế độ Truy cập (Access Modes)

- **`PersistentVolume` (`PV`)**: Tài nguyên lưu trữ cấp cụm (**cluster-scoped** — không thuộc namespace nào).
- **`PersistentVolumeClaim` (`PVC`)**: Yêu cầu cấp phát dung lượng do người dùng/Pod tạo trong một **namespace** cụ thể (**namespace-scoped**).
- Để một PVC gắn (`Bound`) được với một PV có sẵn:
  1. `storageClassName` phải khớp nhau.
  2. `accessModes` của PV phải bao hàm `accessModes` của PVC.
  3. `capacity.storage` của PV phải **>=** `resources.requests.storage` của PVC.
  4. `volumeMode` (`Filesystem` hoặc `Block`) phải khớp nhau.

| Access Mode | Viết tắt | Ý nghĩa thực tế | Ví dụ Backend CSI |
| :--- | :--- | :--- | :--- |
| **`ReadWriteOnce`** | `RWO` | Gắn đọc-ghi bởi **1 Node duy nhất** tại một thời điểm (nhiều Pod trên cùng Node đó vẫn dùng chung được) | AWS EBS, GCP PD, local-path |
| **`ReadOnlyMany`** | `ROX` | Gắn chỉ-đọc bởi **nhiều Node** đồng thời | NFS, EBS snapshot read-only |
| **`ReadWriteMany`** | `RWX` | Gắn đọc-ghi bởi **nhiều Node đồng thời** | NFS, AWS EFS, CephFS, Azure Files |
| **`ReadWriteOncePod`** | `RWOP` | Gắn đọc-ghi bởi **duy nhất 1 Pod** trong toàn cụm (CSI K8s 1.29+) | CSI drivers hỗ trợ RWOP |

---

## 2. Static Provisioning: Mẫu YAML PV + PVC + Pod Chuẩn CKA

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: app-pv
spec:
  capacity:
    storage: 5Gi
  volumeMode: Filesystem
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: manual
  hostPath:
    path: /mnt/data
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-pvc
  namespace: default
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: manual
  resources:
    requests:
      storage: 2Gi
---
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
  - name: nginx
    image: nginx:1.25
    volumeMounts:
    - mountPath: "/usr/share/nginx/html"
      name: data-vol
  volumes:
  - name: data-vol
    persistentVolumeClaim:
      claimName: app-pvc
```

---

## 3. Reclaim Policy & Xử lý PV bị kẹt ở trạng thái `Released`

Khi PVC bị xóa (`kubectl delete pvc app-pvc`), số phận của PV gắn với nó phụ thuộc vào `persistentVolumeReclaimPolicy`:
- **`Delete`** (mặc định với Dynamic Provisioning): Xóa cả PV lẫn ổ đĩa vật lý trên Cloud/Storage backend.
- **`Retain`** (thường dùng với dữ liệu quan trọng/Static PV): Giữ nguyên dữ liệu và chuyển PV sang trạng thái **`Released`**. Lúc này PVC mới **không thể** bind vào PV đó được.

### Cách đưa PV từ `Released` về lại `Available` (rất hay gặp trong CKA)
```bash
# Chỉnh sửa PV và xóa toàn bộ khối spec.claimRef
kubectl edit pv app-pv
# Hoặc dùng kubectl patch một dòng:
kubectl patch pv app-pv --type json -p='[{"op": "remove", "path": "/spec/claimRef"}]'
```
Ngay sau khi xóa `spec.claimRef`, PV chuyển về trạng thái `Available` và sẵn sàng cho PVC mới bind vào mà không mất dữ liệu cũ.

---

## 4. Dynamic Provisioning với `StorageClass` & `CSI`

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: ebs.csi.aws.com        # Hoặc kubernetes.io/no-provisioner cho Local PV
reclaimPolicy: Delete               # Delete hoặc Retain
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
```

### So sánh `volumeBindingMode`
- **`Immediate`** (mặc định nếu không khai báo): Tạo PV ngay lập tức khi PVC được tạo, bất chấp Pod sẽ chạy ở Node/AZ nào -> có thể dẫn đến lỗi Pod bị `Pending` vì Node nằm ở AZ khác với ổ đĩa PV.
- **`WaitForFirstConsumer`** (khuyến nghị cho cloud & local storage): Trì hoãn việc cấp phát PV cho đến khi có Pod đầu tiên tham chiếu tới PVC được `kube-scheduler` chọn Node -> đảm bảo PV được tạo đúng Availability Zone / đúng Node của Pod!

---

## 5. Mở rộng Dung lượng Ổ đĩa (`Volume Expansion`)

1. Kiểm tra `StorageClass` có **`allowVolumeExpansion: true`** chưa (nếu chưa, có thể patch `StorageClass`: `kubectl patch sc fast-ssd -p '{"allowVolumeExpansion": true}'`).
2. Chỉnh sửa `spec.resources.requests.storage` trên PVC tăng lên (tuyệt đối không được giảm):
   ```bash
   kubectl patch pvc app-pvc -p '{"spec":{"resources":{"requests":{"storage":"10Gi"}}}}'
   ```
3. Kiểm tra `kubectl get pvc app-pvc` và `kubectl describe pvc app-pvc`:
   - Nếu thấy condition `FileSystemResizePending`, hãy xóa/tạo lại Pod (hoặc chờ Pod restart nếu CSI yêu cầu offline resize) để hệ điều hành hoàn tất mở rộng filesystem.

---

[← Bài trước](10-network-policies.md) | [Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/11-pv-pvc-volumes.md) | [Bài tiếp →](12-storageclass-csi-expansion.md)
