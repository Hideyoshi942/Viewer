# Bài tập tình huống — 11. Lưu trữ — Volumes, PersistentVolume (PV) & PersistentVolumeClaim (PVC)

> So sánh emptyDir và hostPath; vòng đời PV/PVC, Access Modes (RWO, RWX, ROX, RWOP), Reclaim Policy (Retain vs Delete) và quy trình Static Binding.
> **Số câu hỏi:** 5 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A Pod requires an initialization step that downloads a configuration file from an internal server into a shared `emptyDir` volume and exits completely BEFORE the main `nginx` application container starts. However, a second helper container (`log-shipper`) must start alongside `nginx` and continue running for the entire lifecycle of the Pod. How should these containers be defined in the Pod specification?

- **A.** Configure a `StorageClass` with a custom CSI provisioner script to download the config and stream logs before `kube-scheduler` binds the Pod.
- **B.** Define the config downloader in `spec.initContainers`, and define `nginx` and `log-shipper` in `spec.containers` (or a native sidecar with `restartPolicy: Always`).
- **C.** Create three separate Deployments with a shared `ReadWriteMany` PVC because a Kubernetes Pod can only ever execute a single container process.
- **D.** Place all three containers inside `spec.initContainers` without any `restartPolicy` so `kubelet` launches them sequentially and keeps them running.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một Pod yêu cầu bước khởi tạo để tải tệp cấu hình từ máy chủ nội bộ vào một volume `emptyDir` dùng chung và thoát hoàn toàn TRƯỚC KHI container ứng dụng `nginx` chính khởi động. Tuy nhiên, một container hỗ trợ thứ hai (`log-shipper`) phải khởi động cùng với `nginx` và tiếp tục chạy trong suốt vòng đời của Pod. Các container này nên được định nghĩa như thế nào trong Pod specification?

**Đáp án đúng:** **B**

Ghi nhớ trong CKA:
- **`initContainers`**: Chạy tuần tự và phải kết thúc thành công (`Exit 0`) trước khi container chính khởi động.
- **Multi-container Pod (Sidecar pattern)**: Chia sẻ chung không gian mạng (`localhost`) và có thể chia sẻ chung thư mục qua volume **`emptyDir`**.

- **A:** Sai vì `StorageClass` chỉ định nghĩa trình cấp phát ổ đĩa.
- **B (Đúng):** Đúng! Các `initContainers` thông thường luôn chạy tuần tự đến khi hoàn tất (`Completed`) trước khi các container ứng dụng chính khởi chạy; trong khi sidecar container chạy song song suốt vòng đời của Pod.
- **C:** Sai vì một Pod có thể chứa nhiều container dùng chung mạng `localhost` và dùng chung ổ đĩa `emptyDir`.
- **D:** Sai vì nếu đặt container chính trong `initContainers` thông thường, Kubernetes sẽ đợi nó kết thúc mới chuyển sang bước tiếp theo khiến Pod không bao giờ vào trạng thái `Ready`.

</details>

### Câu 2 `medium`

A `Deployment` runs 4 replicas of a web application spread across 3 different worker nodes. All 4 Pods must mount and write to the exact same shared persistent storage volume simultaneously. Which `accessModes` value must the `PersistentVolume` and `PersistentVolumeClaim` support?

- **A.** `ReadWriteOnce` (`RWO`)
- **B.** `ReadWriteMany` (`RWX`)
- **C.** `ReadOnlyMany` (`ROX`)
- **D.** `ReadWriteOncePod` (`RWOP`)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một `Deployment` chạy 4 replica của một ứng dụng web trải đều trên 3 worker node khác nhau. Cả 4 Pod phải mount và ghi đồng thời vào cùng một persistent storage volume dùng chung. Giá trị `accessModes` nào mà `PersistentVolume` và `PersistentVolumeClaim` phải hỗ trợ?

**Đáp án đúng:** **B**

Tóm tắt 4 `accessModes` của PV/PVC trong Kubernetes:
- **`ReadWriteOnce` (`RWO`)**: Đọc-ghi bởi **1 Node**.
- **`ReadOnlyMany` (`ROX`)**: Chỉ-đọc bởi **nhiều Nodes**.
- **`ReadWriteMany` (`RWX`)**: Đọc-ghi bởi **nhiều Nodes cùng lúc**.
- **`ReadWriteOncePod` (`RWOP`)**: Đọc-ghi bởi **duy nhất 1 Pod** trong toàn cụm.

- **A:** Sai vì `ReadWriteOnce` chỉ cho phép ổ đĩa được gắn đọc-ghi trên **1 Node duy nhất**; các Pod nằm ở 2 Node còn lại sẽ gặp lỗi `Multi-Attach error`.
- **B (Đúng):** Đúng! **`ReadWriteMany` (`RWX`)** là chế độ duy nhất cho phép nhiều Node khác nhau cùng mount một ổ đĩa ở chế độ Đọc-Ghi đồng thời (ví dụ: NFS, CephFS, AWS EFS).
- **C:** Sai vì `ReadOnlyMany` không cho phép các Pod ghi dữ liệu vào ổ đĩa.
- **D:** Sai vì `ReadWriteOncePod` chỉ cho phép duy nhất **1 Pod** trong toàn cụm được mount ổ đĩa.

</details>

### Câu 3 `easy`

Which `accessMode` allows a `PersistentVolume` to be mounted as read-write by multiple Pods running on DIFFERENT nodes simultaneously?

- **A.** ReadWriteOnce (RWO)
- **B.** ReadWriteMany (RWX)
- **C.** ReadWriteOncePod (RWOP)
- **D.** ReadOnlyMany (ROX)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** `accessMode` nào cho phép một `PersistentVolume` được mount ở chế độ đọc-ghi (read-write) bởi nhiều Pod chạy trên các node KHÁC NHAU cùng một lúc?

**Đáp án đúng:** **B**

Phân biệt 4 Access Modes: `RWO` (1 Node R/W), `ROX` (nhiều Node Read-Only), `RWX` (nhiều Node R/W), `RWOP` (1 Pod R/W).

- **A:** Sai vì `RWO` chỉ cho phép gắn đọc-ghi bởi 1 Node tại một thời điểm.
- **B (Đúng):** Đúng! `ReadWriteMany` (`RWX`) cho phép nhiều Node gắn ổ đĩa ở chế độ đọc-ghi đồng thời (ví dụ NFS, AWS EFS, CephFS).
- **C:** Sai vì `RWOP` giới hạn chỉ duy nhất 1 Pod được gắn đọc-ghi.
- **D:** Sai vì `ROX` chỉ cho phép đọc (read-only), không cho ghi.

</details>

### Câu 4 `medium`

A `PersistentVolume` `pv-data` has `persistentVolumeReclaimPolicy: Retain` and is currently in the `Released` state after its old PVC was deleted. You want a new PVC `new-claim` to bind to `pv-data` and reuse the existing data. What must you do?

- **A.** Remove the `spec.claimRef` section from `pv-data` so its status transitions back to `Available`.
- **B.** Change `persistentVolumeReclaimPolicy` on `pv-data` to `Delete` and then back to `Retain`.
- **C.** Set `status.phase: Available` directly using `kubectl edit pv pv-data --subresource=status`.
- **D.** Run `kubectl rollout restart pv/pv-data` to reinitialize the volume binding.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một `PersistentVolume` `pv-data` có `persistentVolumeReclaimPolicy: Retain` và hiện đang ở trạng thái `Released` sau khi PVC cũ của nó bị xóa. Bạn muốn một PVC mới `new-claim` bind vào `pv-data` và tái sử dụng dữ liệu hiện có. Bạn phải làm gì?

**Đáp án đúng:** **A**

Lệnh nhanh nhất trong phòng thi để giải phóng PV trạng thái `Released`: `kubectl patch pv pv-data --type json -p='[{"op":"remove","path":"/spec/claimRef"}]'`.

- **A (Đúng):** Đúng! Khi xóa `spec.claimRef` khỏi PV đang ở trạng thái `Released`, PV sẽ chuyển về `Available` và PVC mới có thể bind vào mà vẫn giữ nguyên dữ liệu.
- **B:** Sai vì đổi sang `Delete` sẽ khiến PV và dữ liệu bị xóa ngay lập tức.
- **C:** Sai vì trường `status` được controller quản lý; bạn không thể sửa trực tiếp `status.phase` bằng `kubectl edit`.
- **D:** Sai vì `kubectl rollout restart` không áp dụng cho `PersistentVolume`.

</details>

### Câu 5 `medium`

A `PersistentVolume` (PV) configured with `persistentVolumeReclaimPolicy: Retain` is currently `Bound` to a `PersistentVolumeClaim` (PVC). When an administrator deletes the PVC, what happens to the PV and its underlying data?

- **A.** The PV immediately returns to the `Available` status and can be bound to any new PVC without administrator intervention or data cleanup.
- **B.** Both the PV object in Kubernetes and the underlying storage volume on the backend provider are deleted immediately upon PVC deletion.
- **C.** The PVC deletion hangs indefinitely in `Terminating` state due to the `pv-protection` finalizer even when no Pods are mounting the PVC.
- **D.** The PV transitions to the `Released` status, the data remains intact, and the PV cannot be bound to a new PVC until an administrator manually clears `spec.claimRef` on the PV.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một `PersistentVolume` (PV) được cấu hình với `persistentVolumeReclaimPolicy: Retain` hiện đang ở trạng thái `Bound` với một `PersistentVolumeClaim` (PVC). Khi quản trị viên xóa PVC đó, điều gì xảy ra với PV và dữ liệu bên dưới của nó?

**Đáp án đúng:** **D**

Vòng đời PV khi xóa PVC với `ReclaimPolicy: Retain`: `Bound` -> (xóa PVC) -> **`Released`** -> (xóa `spec.claimRef` trên PV) -> **`Available`**.

- **A:** Sai vì ở chế độ `Retain`, PV dừng ở trạng thái `Released` để bảo vệ dữ liệu cũ không bị PVC khác đọc nhầm trước khi admin xử lý.
- **B:** Sai vì đó là hành vi của chính sách `Delete`, không phải `Retain`.
- **C:** Sai vì PVC chỉ bị giữ lại bởi finalizer `kubernetes.io/pvc-protection` khi vẫn còn một Pod đang chạy và mount PVC đó.
- **D (Đúng):** Đúng! Với chính sách `Retain`, sau khi PVC bị xóa, PV chuyển sang trạng thái `Released` (vẫn giữ thông tin `claimRef` của PVC cũ). Để tái sử dụng PV đó cho PVC mới, quản trị viên phải xóa phần `spec.claimRef` để PV quay về trạng thái `Available`.

</details>

---

[Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md)
