# Bài tập tình huống — 5. Deployments, Rolling Updates, ConfigMap, Secret & Health Probes

> Chiến lược RollingUpdate vs Recreate, rollout history/undo; truyền cấu hình qua ConfigMap và Secret; cấu hình Liveness, Readiness và Startup Probes.
> **Số câu hỏi:** 3 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

An application container occasionally freezes due to an internal deadlock while its process ID remains running. When this deadlock happens, the container can no longer respond to HTTP `/healthz` requests on port 8080 and must be automatically restarted by `kubelet`. Which probe should the administrator configure on the container?

- **A.** An HTTP `readinessProbe` alone targeting `/healthz` on port 8080.
- **B.** A `ResourceQuota` object limiting container memory in the namespace.
- **C.** A `nodeSelector` field pinning the Pod to a high-CPU worker node.
- **D.** An HTTP `livenessProbe` targeting `/healthz` on port 8080.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một container ứng dụng thỉnh thoảng bị treo do deadlock nội bộ trong khi process ID của nó vẫn đang chạy. Khi deadlock này xảy ra, container không thể phản hồi các yêu cầu HTTP `/healthz` trên cổng 8080 nữa và phải được `kubelet` tự động khởi động lại. Quản trị viên nên cấu hình probe nào trên container?

**Đáp án đúng:** **D**

Nhớ rõ sự khác biệt hành vi khi Probe thất bại:
- **`livenessProbe` fail** -> **Restart container**.
- **`readinessProbe` fail** -> **Remove Pod IP from Service Endpoints** (không restart).

- **A:** Sai vì khi `readinessProbe` thất bại, Kubernetes chỉ tạm ngừng gửi lưu lượng Service vào Pod đó chứ KHÔNG khởi động lại container bị treo.
- **B:** Sai vì `ResourceQuota` giới hạn tổng tài nguyên của cả một Namespace.
- **C:** Sai vì `nodeSelector` chỉ dùng để chọn Node khi lập lịch.
- **D (Đúng):** Đúng! `livenessProbe` kiểm tra xem ứng dụng còn hoạt động bình thường hay đã bị treo (deadlock); nếu thất bại vượt ngưỡng `failureThreshold`, `kubelet` sẽ tự động giết và khởi động lại (restart) container.

</details>

### Câu 2 `medium`

A Pod mounts a `ConfigMap` named `app-config` as files inside a volume at `/etc/config`. When an administrator updates a value inside the `app-config` ConfigMap using `kubectl edit configmap app-config`, what happens to the mounted files inside the running Pod?

- **A.** Mounted `ConfigMap` volumes can never be updated under any circumstances without deleting and recreating the Pod.
- **B.** The Pod is immediately deleted by `kube-scheduler` and recreated by its ReplicaSet with the updated configuration files.
- **C.** The `ConfigMap` is automatically converted into a `PersistentVolume` and remounted by `kube-controller-manager`.
- **D.** The mounted files in `/etc/config` are automatically updated after a brief sync period (unless the volume mount uses `subPath`).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một Pod mount một `ConfigMap` tên `app-config` dưới dạng các tệp bên trong một volume tại `/etc/config`. Khi quản trị viên cập nhật một giá trị bên trong ConfigMap `app-config` bằng lệnh `kubectl edit configmap app-config`, điều gì xảy ra với các tệp đã mount bên trong Pod đang chạy?

**Đáp án đúng:** **D**

Điểm tinh tế cần nhớ về cập nhật **ConfigMap / Secret** trong Pod đang chạy:
- **Mount thành thư mục Volume**: Tự động cập nhật sau ~1 phút.
- **Mount bằng `subPath` hoặc truyền qua biến môi trường (`env` / `envFrom`)**: **KHÔNG tự cập nhật** (phải `kubectl rollout restart` lại Pod).

- **A:** Sai vì mount volume thông thường (không dùng `subPath`) vẫn được `kubelet` cập nhật định kỳ.
- **B:** Sai vì sửa ConfigMap không bao giờ tự động xóa Pod.
- **C:** Sai vì ConfigMap lưu trong `etcd`, không biến thành `PersistentVolume`.
- **D (Đúng):** Đúng! Khi một `ConfigMap` hoặc `Secret` được mount dưới dạng thư mục volume thông thường, `kubelet` sẽ tự động đồng bộ và cập nhật nội dung file bên trong Pod đang chạy (ngoại trừ trường hợp mount 1 file lẻ bằng `subPath` hoặc truyền qua biến môi trường `env` thì không tự cập nhật).

</details>

### Câu 3 `easy`

An application container in a Pod starts up slowly (taking ~45 seconds before listening on port 8080), but its `livenessProbe` has `initialDelaySeconds: 10, periodSeconds: 5, failureThreshold: 3`. As a result, `kubelet` keeps restarting the container before it finishes starting. Which probe should you add to solve this cleanly?

- **A.** postStart hook
- **B.** startupProbe
- **C.** preStop hook
- **D.** readinessProbe

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một container ứng dụng trong Pod khởi động chậm (mất khoảng 45 giây trước khi lắng nghe trên cổng 8080), nhưng `livenessProbe` của nó có `initialDelaySeconds: 10, periodSeconds: 5, failureThreshold: 3`. Do đó, `kubelet` liên tục khởi động lại container trước khi nó kịp khởi động xong. Bạn nên thêm probe nào để giải quyết vấn đề này một cách gọn gàng?

**Đáp án đúng:** **B**

`startupProbe` được thiết kế riêng cho các ứng dụng khởi động chậm: chỉ khi `startupProbe` pass thì `livenessProbe` và `readinessProbe` mới bắt đầu hoạt động.

- **A:** Sai vì `postStart` không tạm hoãn `livenessProbe`.
- **B (Đúng):** Đúng! `startupProbe` vô hiệu hóa `livenessProbe` và `readinessProbe` cho đến khi ứng dụng khởi động thành công, rất phù hợp cho các app khởi động chậm.
- **C:** Sai vì `preStop` chỉ chạy khi container sắp bị dừng (shutdown).
- **D:** Sai vì `readinessProbe` chỉ điều khiển việc gắn/gỡ Pod khỏi Service Endpoints, không ngăn `livenessProbe` restart container.

</details>

---

[Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md)
