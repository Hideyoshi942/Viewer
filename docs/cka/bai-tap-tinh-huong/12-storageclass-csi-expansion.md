# Bài tập tình huống — 12. StorageClass, Dynamic Provisioning, CSI & Volume Expansion

> Cấp phát động với StorageClass, phân biệt volumeBindingMode Immediate vs WaitForFirstConsumer, bật allowVolumeExpansion để mở rộng dung lượng PVC không gián đoạn.
> **Số câu hỏi:** 7 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A Deployment named `checkout-api` was recently updated from image `checkout:v1` to `checkout:v2`, but the new `v2` Pods are crashing due to an invalid image tag. Which command immediately rolls the Deployment back to the previous working revision?

- **A.** `kubectl rollout status deployment/checkout-api`
- **B.** `kubectl delete deployment/checkout-api`
- **C.** `kubectl rollout undo deployment/checkout-api`
- **D.** `kubectl scale deployment/checkout-api --replicas=0`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một Deployment tên `checkout-api` gần đây đã được cập nhật từ image `checkout:v1` lên `checkout:v2`, nhưng các Pod `v2` mới đang bị crash do image tag không hợp lệ. Lệnh nào ngay lập tức roll back Deployment về revision hoạt động trước đó?

**Đáp án đúng:** **C**

Bộ 3 câu lệnh quản lý Rollout của Deployment trong CKA:
- Xem lịch sử các bản cập nhật: `kubectl rollout history deployment/<name>`
- Kiểm tra trạng thái triển khai: `kubectl rollout status deployment/<name>`
- Khôi phục về bản trước: `kubectl rollout undo deployment/<name> [--to-revision=1]`

- **A:** Sai vì `rollout status` chỉ xem tiến trình triển khai chứ không thực hiện rollback.
- **B:** Sai vì xóa toàn bộ Deployment đang chạy.
- **C (Đúng):** Đúng! Lệnh `kubectl rollout undo deployment/<name>` ngay lập tức khôi phục Deployment về phiên bản (revision) liền trước đó (hoặc dùng `--to-revision=<N>` để về một bản cụ thể).
- **D:** Sai vì lệnh này tắt toàn bộ Pod của ứng dụng về 0.

</details>

### Câu 2 `medium`

In a multi-zone cloud Kubernetes cluster, dynamic volume provisioning is configured using a `StorageClass` for single-zone block storage volumes. Occasionally, when a `PersistentVolumeClaim` (PVC) is created, the storage volume is provisioned in Availability Zone A, but the Pod that uses the PVC cannot be scheduled in Zone A due to CPU constraints and instead gets stuck in `Pending` because it needs to run in Zone B. Which `StorageClass` setting prevents this zone mismatch?

- **A.** `allowVolumeExpansion: false` on the default StorageClass
- **B.** `volumeBindingMode: Immediate` on the StorageClass
- **C.** `volumeBindingMode: WaitForFirstConsumer`
- **D.** `reclaimPolicy: Delete` with `allowVolumeExpansion: true`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong một cloud Kubernetes cluster đa vùng (multi-zone), dynamic volume provisioning được cấu hình bằng một `StorageClass` cho các block storage volume đơn vùng. Thỉnh thoảng, khi một `PersistentVolumeClaim` (PVC) được tạo, storage volume được cấp phát ở Availability Zone A, nhưng Pod sử dụng PVC đó không thể được lập lịch ở Zone A do thiếu CPU và bị kẹt ở trạng thái `Pending` vì nó cần chạy ở Zone B. Thiết lập `StorageClass` nào giúp ngăn ngừa tình trạng lệch vùng này?

**Đáp án đúng:** **C**

Trong đề thi CKA, khi câu hỏi yêu cầu tạo một `StorageClass` mà **trì hoãn việc cấp phát ổ đĩa cho đến khi có Pod sử dụng PVC được lập lịch** -> Luôn đặt **`volumeBindingMode: WaitForFirstConsumer`**!

- **A:** Sai vì trường này chỉ bật/tắt tính năng mở rộng dung lượng ổ đĩa.
- **B:** Sai vì `Immediate` tạo ổ đĩa ngay khi tạo PVC (trước khi biết Pod sẽ chạy ở Node/AZ nào), chính là nguyên nhân gây ra lỗi lệch AZ.
- **C (Đúng):** Đúng! `volumeBindingMode: WaitForFirstConsumer` trì hoãn việc cấp phát và gắn ổ đĩa PV cho đến khi Pod sử dụng PVC đó được Scheduler chọn Node cụ thể, đảm bảo ổ đĩa luôn được tạo đúng cùng Availability Zone với Node của Pod.
- **D:** Sai vì `reclaimPolicy` chỉ quy định hành vi khi xóa PVC.

</details>

### Câu 3 `medium`

An administrator needs to increase the size of an existing `PersistentVolumeClaim` named `db-data-pvc` from `10Gi` to `25Gi` without recreating the PVC. What prerequisite must be configured on the `StorageClass` associated with `db-data-pvc`?

- **A.** `allowVolumeExpansion: true`
- **B.** `automountServiceAccountToken: false`
- **C.** `hostNetwork: true`
- **D.** `clusterIP: None`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Quản trị viên cần tăng kích thước của một `PersistentVolumeClaim` hiện có tên `db-data-pvc` từ `10Gi` lên `25Gi` mà không tạo lại PVC. Điều kiện tiên quyết nào phải được cấu hình trên `StorageClass` liên kết với `db-data-pvc`?

**Đáp án đúng:** **A**

Khi gặp bài thi CKA yêu cầu **Resize / Expand một PVC từ 10Gi lên 25Gi**:
1. Kiểm tra `StorageClass` có `allowVolumeExpansion: true` chưa.
2. Chạy `kubectl edit pvc <name> --record` (hoặc `kubectl patch pvc`) đổi `spec.resources.requests.storage: 25Gi`.

- **A (Đúng):** Đúng! Để có thể chỉnh sửa tăng `spec.resources.requests.storage` trên một PVC đang tồn tại, đối tượng `StorageClass` của nó bắt buộc phải được bật **`allowVolumeExpansion: true`**.
- **B:** Sai vì đây là cấu hình bảo mật token của Pod/ServiceAccount.
- **C:** Sai vì `hostNetwork` là cấu hình mạng của Pod.
- **D:** Sai vì `clusterIP` là cấu hình của Service.

</details>

### Câu 4 `medium`

A Deployment `api` was updated to image `api:v2`, which causes Pods to crash. You want to roll back immediately to revision 1. Which command should you run?

- **A.** kubectl rollout restart deployment/api --revision=1
- **B.** kubectl rollout undo deployment/api --to-revision=1
- **C.** kubectl delete replicaset -l app=api --cascade=orphan
- **D.** kubectl rollback deployment/api --to-revision=1

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một Deployment `api` đã được cập nhật lên image `api:v2`, khiến các Pod bị crash. Bạn muốn roll back ngay lập tức về revision 1. Bạn nên chạy lệnh nào?

**Đáp án đúng:** **B**

Dùng `kubectl rollout history deployment/<name>` để xem các revision và `kubectl rollout undo deployment/<name> --to-revision=<N>` để rollback.

- **A:** Sai vì `rollout restart` chỉ khởi động lại các Pod hiện tại chứ không quay về phiên bản cũ.
- **B (Đúng):** Đúng! `kubectl rollout undo deployment/<name> --to-revision=1` khôi phục Deployment về đúng revision 1.
- **C:** Sai vì xóa ReplicaSet sẽ gây gián đoạn hoặc khiến Deployment tạo lại ReplicaSet mới với image `v2` bị lỗi.
- **D:** Sai cú pháp vì `kubectl` không có lệnh con `rollback`; phải dùng `kubectl rollout undo`.

</details>

### Câu 5 `medium`

A `StorageClass` named `ebs-sc` has `volumeBindingMode: WaitForFirstConsumer`. You create a `PersistentVolumeClaim` using `ebs-sc`, and no Pod uses it yet. What status will `kubectl get pvc` show?

- **A.** Lost
- **B.** Released
- **C.** Bound
- **D.** Pending

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một `StorageClass` tên `ebs-sc` có `volumeBindingMode: WaitForFirstConsumer`. Bạn tạo một `PersistentVolumeClaim` sử dụng `ebs-sc`, và chưa có Pod nào sử dụng nó. Lệnh `kubectl get pvc` sẽ hiển thị trạng thái gì?

**Đáp án đúng:** **D**

`WaitForFirstConsumer` trì hoãn việc cấp phát và gắn PV cho đến khi Pod đầu tiên dùng PVC được gán vào một Node (giúp đảm bảo ổ đĩa tạo đúng Availability Zone).

- **A:** Sai vì `Lost` chỉ xảy ra khi PV bị mất kết nối với ổ đĩa vật lý.
- **B:** Sai vì `Released` là trạng thái của PV sau khi PVC bị xóa.
- **C:** Sai vì trạng thái `Bound` ngay lập tức chỉ xảy ra khi `volumeBindingMode` là `Immediate`.
- **D (Đúng):** Đúng! Với `WaitForFirstConsumer`, PVC sẽ giữ trạng thái `Pending` cho đến khi có một Pod sử dụng PVC đó được lập lịch lên một Node cụ thể.

</details>

### Câu 6 `medium`

You want to expand an existing `PersistentVolumeClaim` named `db-pvc` from `10Gi` to `20Gi`. After verifying that its `StorageClass` has `allowVolumeExpansion: true`, you update `spec.resources.requests.storage` to `20Gi`, and `kubectl get pvc db-pvc` shows the condition `FileSystemResizePending`. What should you do next?

- **A.** Restart (or delete and let the controller recreate) the Pod mounting `db-pvc` so the filesystem resize completes on the node.
- **B.** Edit the bound `PersistentVolume` directly to reduce its capacity back to `10Gi` and clear the condition.
- **C.** Delete `db-pvc` and recreate a new PersistentVolumeClaim with `20Gi` requested storage.
- **D.** Change `storageClassName` on `db-pvc` to `manual` so the CSI driver skips filesystem expansion.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn muốn mở rộng một `PersistentVolumeClaim` hiện có tên `db-pvc` từ `10Gi` lên `20Gi`. Sau khi xác minh `StorageClass` của nó có `allowVolumeExpansion: true`, bạn cập nhật `spec.resources.requests.storage` thành `20Gi`, và `kubectl get pvc db-pvc` hiển thị condition `FileSystemResizePending`. Bạn nên làm gì tiếp theo?

**Đáp án đúng:** **A**

Khi PVC đã mở rộng block storage và báo `FileSystemResizePending`, việc khởi động lại Pod đang gắn PVC sẽ kích hoạt kubelet hoàn tất resize filesystem.

- **A (Đúng):** Đúng! Một số CSI driver hoặc cấu hình yêu cầu Pod khởi động lại để kubelet hoàn tất bước mở rộng hệ thống tệp (`FileSystemResizePending`).
- **B:** Sai vì không thể thu nhỏ dung lượng PV/PVC.
- **C:** Sai vì xóa PVC có thể làm mất dữ liệu nếu `reclaimPolicy` là `Delete`.
- **D:** Sai vì `storageClassName` là trường bất biến trên PVC đã tạo.

</details>

### Câu 7 `medium`

A `PVC` named `app-pvc` requests `storage: 5Gi`, `accessModes: [ReadWriteOnce]`, and `storageClassName: fast`. An existing `PV` named `pv-1` has `capacity: 10Gi`, `accessModes: [ReadWriteOnce]`, and `storageClassName: standard`. Why does `app-pvc` remain `Pending`?

- **A.** Because PV capacity (`10Gi`) is larger than PVC request (`5Gi`); they must be exactly equal.
- **B.** Because `storageClassName` on the PVC (`fast`) does not match `storageClassName` on the PV (`standard`).
- **C.** Because `PersistentVolume` and `PersistentVolumeClaim` objects must always be created in the same namespace.
- **D.** Because `ReadWriteOnce` only works with `StorageClass` named `default`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một `PVC` tên `app-pvc` yêu cầu `storage: 5Gi`, `accessModes: [ReadWriteOnce]` và `storageClassName: fast`. Một `PV` hiện có tên `pv-1` có `capacity: 10Gi`, `accessModes: [ReadWriteOnce]` và `storageClassName: standard`. Tại sao `app-pvc` vẫn ở trạng thái `Pending`?

**Đáp án đúng:** **B**

4 điều kiện để PVC bind vào PV có sẵn: `storageClassName` khớp, `volumeMode` khớp, `accessModes` của PV bao hàm PVC, và `PV capacity >= PVC request`.

- **A:** Sai vì dung lượng PV chỉ cần lớn hơn hoặc bằng (`>=`) yêu cầu của PVC là hợp lệ.
- **B (Đúng):** Đúng! Để PVC bind được với PV tĩnh, `storageClassName` của cả hai bắt buộc phải khớp chính xác nhau.
- **C:** Sai vì `PersistentVolume` là tài nguyên cấp cụm (cluster-scoped), không thuộc namespace nào.
- **D:** Sai vì `ReadWriteOnce` không phụ thuộc vào tên `StorageClass`.

</details>

---

[Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md)
