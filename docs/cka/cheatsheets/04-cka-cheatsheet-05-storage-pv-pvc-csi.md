# Cheatsheet CKA: Lưu trữ Kubernetes — PV, PVC, StorageClass & CSI (10%)

## 1. Access Modes
- **`ReadWriteOnce` (`RWO`)**: Đọc/ghi bởi **1 Node** (nhiều Pod trên cùng Node vẫn dùng chung được).
- **`ReadOnlyMany` (`ROX`)**: Chỉ-đọc bởi **nhiều Node**.
- **`ReadWriteMany` (`RWX`)**: Đọc/ghi bởi **nhiều Node** đồng thời (NFS, EFS, CephFS).
- **`ReadWriteOncePod` (`RWOP`)**: Đọc/ghi bởi **duy nhất 1 Pod** trong toàn cụm.

## 2. Điều kiện để PVC `Bound` với PV
1. `storageClassName` khớp nhau.
2. `accessModes` của PV bao hàm PVC.
3. `capacity.storage` của PV **>=** `resources.requests.storage` của PVC.
4. `volumeMode` (`Filesystem` hoặc `Block`) khớp nhau.

## 3. Reclaim Policy & Xử lý PV bị `Released`
- **`Delete`**: Xóa PVC -> xóa luôn PV và ổ đĩa vật lý.
- **`Retain`**: Xóa PVC -> giữ dữ liệu, PV chuyển sang trạng thái **`Released`**.
- **Đưa PV từ `Released` về `Available`**:
  ```bash
  kubectl patch pv <pv-name> --type json -p='[{"op": "remove", "path": "/spec/claimRef"}]'
  ```

## 4. StorageClass & Volume Expansion
- **`volumeBindingMode: WaitForFirstConsumer`**: Đợi Pod được lập lịch lên Node rồi mới tạo PV (tránh lỗi khác Availability Zone).
- **`volumeBindingMode: Immediate`**: Tạo PV ngay khi tạo PVC.
- **Mở rộng dung lượng PVC**:
  1. Đảm bảo `StorageClass` có `allowVolumeExpansion: true`.
  2. Tăng `spec.resources.requests.storage` trên PVC (không được giảm):
     ```bash
     kubectl patch pvc my-pvc -p '{"spec":{"resources":{"requests":{"storage":"10Gi"}}}}'
     ```
  3. Nếu PVC báo `FileSystemResizePending`, restart Pod đang gắn PVC đó.

---

[Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md)
