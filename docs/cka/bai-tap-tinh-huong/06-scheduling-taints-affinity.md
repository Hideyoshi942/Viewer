# Bài tập tình huống — 6. Lập lịch Pod Nâng cao — Taints/Tolerations, NodeAffinity & DaemonSet

> Điều khiển kube-scheduler với nodeName, nodeSelector, Taints & Tolerations (NoSchedule, PreferNoSchedule, NoExecute), NodeAffinity, PodAffinity/Anti-Affinity và DaemonSet.
> **Số câu hỏi:** 4 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A log collection agent must run exactly one Pod on every single worker node in the cluster, and automatically start a Pod on any new worker node that joins the cluster in the future. Which Kubernetes workload resource is designed for this requirement?

- **A.** DaemonSet
- **B.** Deployment with `replicas: 3`
- **C.** CronJob
- **D.** ConfigMap

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một agent thu thập log phải chạy chính xác một Pod trên mọi worker node trong cluster, và tự động khởi chạy một Pod trên bất kỳ worker node mới nào tham gia cluster trong tương lai. Tài nguyên workload Kubernetes nào được thiết kế cho yêu cầu này?

**Đáp án đúng:** **A**

Khi đề bài yêu cầu **chạy đúng 1 Pod trên mỗi Node trong cụm (logging agent, monitoring agent, CNI network plugin)** -> Chọn ngay **DaemonSet**.

- **A (Đúng):** Đúng! **DaemonSet** đảm bảo tất cả (hoặc một tập hợp) các Node trong cụm đều chạy đúng 1 bản sao của Pod, và tự động triển khai Pod lên Node mới ngay khi Node đó gia nhập cụm.
- **B:** Sai vì Deployment có thể đặt nhiều Pod lên cùng 1 Node và không tự động tăng số bản sao khi cụm thêm Node mới.
- **C:** Sai vì CronJob chỉ chạy tác vụ định kỳ theo lịch biểu thời gian rồi kết thúc.
- **D:** Sai vì ConfigMap chỉ dùng để lưu trữ dữ liệu cấu hình key-value.

</details>

### Câu 2 `medium`

A `DaemonSet` named `log-collector` in the `logging` namespace is running on all worker nodes, but it is NOT scheduled onto the `controlplane` node. What should you add to the `DaemonSet` Pod template to schedule it onto `controlplane` as well?

- **A.** A `toleration` matching key `node-role.kubernetes.io/control-plane` with `operator: Exists` and `effect: NoSchedule`.
- **B.** Set `priorityClassName: system-node-critical` in `spec.template.spec` without adding any tolerations to bypass node taints.
- **C.** Increase `spec.replicas` on the `DaemonSet` by 1 so the controller schedules an additional Pod onto the `controlplane` node.
- **D.** A `nodeSelector` with `node-role.kubernetes.io/control-plane: ""` without any tolerations.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một `DaemonSet` tên `log-collector` trong namespace `logging` đang chạy trên tất cả các worker node, nhưng KHÔNG được lập lịch lên node `controlplane`. Bạn nên thêm gì vào Pod template của `DaemonSet` để lập lịch cho nó chạy trên cả `controlplane`?

**Đáp án đúng:** **A**

Để DaemonSet chạy được cả trên Control Plane, cần thêm `tolerations` khớp với taint `node-role.kubernetes.io/control-plane:NoSchedule` vào `spec.template.spec.tolerations`.

- **A (Đúng):** Đúng! Node Control Plane mặc định có taint `node-role.kubernetes.io/control-plane:NoSchedule`. Thêm Toleration tương ứng vào DaemonSet sẽ cho phép Pod chạy trên Control Plane.
- **B:** Sai vì `priorityClassName` không thay thế cho Toleration.
- **C:** Sai vì `DaemonSet` không có trường `spec.replicas`.
- **D:** Sai vì `nodeSelector` chỉ chọn nhãn nhưng không vượt qua được Taint `NoSchedule` trên Control Plane; hơn nữa nó còn loại bỏ các Worker node.

</details>

### Câu 3 `medium`

A Pod `web-1` is currently `Pending` because `kube-scheduler` is down, and you want to manually schedule it onto `worker-01`. What happens if you run `kubectl edit pod web-1` and add `spec.nodeName: worker-01`?

- **A.** The edit will be rejected because `spec.nodeName` is immutable on an existing Pod; you must export the YAML, add `nodeName`, and run `kubectl replace --force -f pod.yaml`.
- **B.** The Pod immediately starts running on `worker-01` as soon as `kubelet` watches the updated `spec.nodeName` field in etcd.
- **C.** The Pod moves to `Terminating` and is deleted permanently because `kube-scheduler` is unavailable to validate the binding.
- **D.** You must create a `Binding` object only; `spec.nodeName` cannot be set in Pod YAML manifests even during initial creation.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một Pod `web-1` hiện đang ở trạng thái `Pending` vì `kube-scheduler` đang bị ngừng, và bạn muốn lập lịch thủ công cho nó chạy trên `worker-01`. Điều gì xảy ra nếu bạn chạy `kubectl edit pod web-1` và thêm `spec.nodeName: worker-01`?

**Đáp án đúng:** **A**

Khi chỉnh sửa các trường bất biến của Pod (`nodeName`, `containers[].ports`, `volumes`), hãy dùng `kubectl get pod <name> -o yaml > pod.yaml`, sửa file rồi `kubectl replace --force -f pod.yaml`.

- **A (Đúng):** Đúng! `spec.nodeName` là trường bất biến sau khi Pod đã tạo. Bạn phải xuất YAML (hoặc sửa file gốc), thêm `nodeName: worker-01` và dùng `kubectl replace --force -f`.
- **B:** Sai vì API Server từ chối cập nhật trường `spec.nodeName` qua `kubectl edit`.
- **C:** Sai vì `kubectl edit` thất bại sẽ không xóa Pod.
- **D:** Sai vì bạn hoàn toàn có thể đặt `spec.nodeName` trực tiếp trong Pod YAML khi tạo mới hoặc dùng `kubectl replace --force`.

</details>

### Câu 4 `medium`

Node `worker-gpu-01` is tainted with `kubectl taint nodes worker-gpu-01 accelerator=nvidia:NoSchedule`. An existing Pod without any tolerations was already running on `worker-gpu-01` before the taint was applied, and a new Pod without any tolerations is now created. What will happen?

- **A.** The existing Pod is immediately evicted from `worker-gpu-01`, and the new Pod will not be scheduled onto `worker-gpu-01`.
- **B.** The existing Pod continues running on `worker-gpu-01`, while the new Pod without a matching toleration will not be scheduled onto `worker-gpu-01`.
- **C.** Node `worker-gpu-01` transitions to the `NotReady` state until at least one Pod with a matching toleration is scheduled onto it.
- **D.** Both the existing Pod and the new Pod will run on `worker-gpu-01` because `NoSchedule` only emits a scheduling warning event.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Node `worker-gpu-01` được gắn taint bằng lệnh `kubectl taint nodes worker-gpu-01 accelerator=nvidia:NoSchedule`. Một Pod hiện có không có toleration nào đã chạy sẵn trên `worker-gpu-01` trước khi taint được áp dụng, và một Pod mới không có toleration nào vừa được tạo. Điều gì sẽ xảy ra?

**Đáp án đúng:** **B**

Phân biệt 3 hiệu ứng Taint trong Kubernetes:
- **`NoSchedule`**: Không lập lịch Pod mới (nếu thiếu Toleration), giữ nguyên Pod đang chạy.
- **`PreferNoSchedule`**: Ưu tiên tránh lập lịch Pod mới lên node nhưng không bắt buộc cứng.
- **`NoExecute`**: Vừa chặn Pod mới, vừa **trục xuất (evict) ngay lập tức** các Pod đang chạy nếu không có Toleration.

- **A:** Sai vì hiệu ứng trục xuất Pod đang chạy là của `NoExecute`, không phải của `NoSchedule`.
- **B (Đúng):** Đúng! Hiệu ứng `NoSchedule` chỉ chặn việc lập lịch các Pod mới không có Toleration khớp, nhưng KHÔNG trục xuất các Pod đã chạy sẵn trên node đó.
- **C:** Sai vì đánh Taint lên node hoàn toàn không làm thay đổi trạng thái sức khỏe `Ready` của node.
- **D:** Sai vì Pod mới thiếu Toleration khớp với Taint `NoSchedule` nên sẽ bị bộ lập lịch từ chối đặt lên node này.

</details>

---

[Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md)
