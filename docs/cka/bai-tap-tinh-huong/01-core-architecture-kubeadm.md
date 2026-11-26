# Bài tập tình huống — 1. Kiến trúc Control Plane, Static Pods & Nâng cấp cụm với kubeadm

> Kiến trúc API Server, Controller Manager, Scheduler, kubelet; quản lý Static Pods tại /etc/kubernetes/manifests; nâng cấp cụm theo quy trình drain, kubeadm upgrade apply/node và uncordon.
> **Số câu hỏi:** 4 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

An administrator needs to upgrade a `kubeadm` Kubernetes cluster from version `1.30.0` to `1.31.0`. Before upgrading the control plane node, the administrator wants to safely evict all running application Pods from `controlplane` while ignoring DaemonSet-managed Pods, and mark the node as unschedulable. Which command accomplishes this?

- **A.** `kubectl delete node controlplane`
- **B.** `kubectl drain controlplane --ignore-daemonsets`
- **C.** `kubectl taint nodes controlplane key=val:PreferNoSchedule`
- **D.** `kubectl cordon controlplane`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Quản trị viên cần nâng cấp một `kubeadm` Kubernetes cluster từ phiên bản `1.30.0` lên `1.31.0`. Trước khi nâng cấp node control plane, quản trị viên muốn evict an toàn toàn bộ các Pod ứng dụng đang chạy khỏi `controlplane` trong khi bỏ qua các Pod do DaemonSet quản lý, đồng thời đánh dấu node là unschedulable. Lệnh nào thực hiện việc này?

**Đáp án đúng:** **B**

Ba lệnh bảo trì Node bắt buộc thuộc lòng trong CKA:
- **`kubectl cordon <node>`**: Đánh dấu `SchedulingDisabled` (không nhận Pod mới, giữ nguyên Pod cũ).
- **`kubectl drain <node> --ignore-daemonsets --delete-emptydir-data`**: Cordon + trục xuất toàn bộ Pod đang chạy sang node khác.
- **`kubectl uncordon <node>`**: Cho phép lập lịch Pod trở lại sau khi nâng cấp xong.

- **A:** Sai vì `kubectl delete node` xóa hẳn đối tượng Node khỏi cụm thay vì bảo trì nâng cấp.
- **B (Đúng):** Đúng! Lệnh `kubectl drain <node> --ignore-daemonsets` vừa đánh dấu node là `SchedulingDisabled` (cordon), vừa trục xuất (evict) an toàn toàn bộ các Pod thông thường sang node khác mà bỏ qua các DaemonSet Pods.
- **C:** Sai vì `PreferNoSchedule` không trục xuất các Pod hiện tại.
- **D:** Sai vì `kubectl cordon` chỉ chặn lập lịch thêm Pod mới lên node nhưng KHÔNG di chuyển các Pod đang chạy sẵn trên node đó đi nơi khác.

</details>

### Câu 2 `medium`

An administrator wants to join a new Linux machine (`worker-03`) to an existing `kubeadm` cluster, but the original 24-hour bootstrap token generated during `kubeadm init` has expired. Which command should the administrator run on the `controlplane` node to generate a new token and print the full `kubeadm join` command in a single step?

- **A.** `kubeadm token create --print-join-command`
- **B.** `kubeadm init --skip-phases=preflight` on the controlplane
- **C.** `kubeadm reset -f && kubeadm init` on the controlplane
- **D.** `kubectl create node worker-03 --token-ttl=24h`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Quản trị viên muốn tham gia một máy Linux mới (`worker-03`) vào một `kubeadm` cluster hiện có, nhưng bootstrap token 24 giờ ban đầu được tạo trong quá trình `kubeadm init` đã hết hạn. Quản trị viên nên chạy lệnh nào trên node `controlplane` để tạo token mới và in ra đầy đủ lệnh `kubeadm join` chỉ trong một bước?

**Đáp án đúng:** **A**

Khi bài thi CKA yêu cầu **thêm một Worker Node mới vào cụm `kubeadm`**, chỉ cần đứng ở `controlplane` chạy:
`kubeadm token create --print-join-command`
Sau đó copy nguyên câu lệnh xuất ra sang chạy với quyền `sudo` trên Worker Node mới!

- **A (Đúng):** Đúng! Lệnh `kubeadm token create --print-join-command` tạo một bootstrap token mới và in ra đầy đủ câu lệnh `kubeadm join <ip:port> --token ... --discovery-token-ca-cert-hash sha256:...` để copy sang worker node chạy ngay.
- **B:** Sai vì `kubeadm init` dùng để khởi tạo cụm mới chứ không phải tạo lại token trên cụm đang chạy.
- **C:** Sai vì `kubeadm reset` sẽ xóa sạch cấu hình cụm hiện tại trên control plane!
- **D:** Sai vì không thể thêm máy chủ vật lý vào cụm chỉ bằng lệnh `kubectl create node`.

</details>

### Câu 3 `medium`

You are upgrading a kubeadm cluster from v1.30.2 to v1.31.0. After draining `worker-01` from the control plane and upgrading `kubeadm` on `worker-01`, which command should you run on `worker-01` before upgrading `kubelet`?

- **A.** kubeadm init phase kubelet-start
- **B.** kubeadm upgrade node
- **C.** kubeadm upgrade apply v1.31.0
- **D.** kubectl uncordon worker-01

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn đang nâng cấp một kubeadm cluster từ v1.30.2 lên v1.31.0. Sau khi drain `worker-01` từ control plane và nâng cấp `kubeadm` trên `worker-01`, bạn nên chạy lệnh nào trên `worker-01` trước khi nâng cấp `kubelet`?

**Đáp án đúng:** **B**

Quy trình nâng cấp Worker node bằng `kubeadm`: drain node -> nâng cấp `kubeadm` -> chạy `kubeadm upgrade node` -> nâng cấp `kubelet` và `kubectl` -> restart `kubelet` -> `uncordon` node.

- **A:** Sai vì lệnh này dùng khi khởi tạo cụm mới chứ không phải quy trình nâng cấp chuẩn.
- **B (Đúng):** Đúng! Trên các Worker node (và các Control Plane node phụ), bạn phải chạy `kubeadm upgrade node` để cập nhật cấu hình kubelet cục bộ.
- **C:** Sai vì `kubeadm upgrade apply` chỉ chạy trên Control Plane node đầu tiên, không chạy trên Worker node.
- **D:** Sai vì `uncordon` là bước cuối cùng sau khi đã nâng cấp xong `kubelet` và `kubectl`.

</details>

### Câu 4 `hard`

When running `kubectl drain worker-02 --ignore-daemonsets`, the command hangs with the error: `Cannot evict pod as it would violate the pod's disruption budget.` Which configuration explains why this happens?

- **A.** The Pod uses `restartPolicy: Always` inside a Deployment, which blocks voluntary eviction during node drain.
- **B.** The Pod has `resources.limits` set higher than `resources.requests`, causing `kube-scheduler` to block eviction.
- **C.** A `PodDisruptionBudget` targets the Pod with `minAvailable` equal to the current number of ready replicas (leaving `0` allowed disruptions).
- **D.** The Pod has a `livenessProbe` configured with `failureThreshold: 3` that prevents `kubelet` from terminating the container gracefully.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Khi chạy `kubectl drain worker-02 --ignore-daemonsets`, lệnh bị treo với lỗi: `Cannot evict pod as it would violate the pod's disruption budget.` Cấu hình nào giải thích lý do xảy ra điều này?

**Đáp án đúng:** **C**

`PodDisruptionBudget` (PDB) kiểm soát số Pod tối đa bị gián đoạn khi thực hiện voluntary disruption như `kubectl drain`. Nếu `ALLOWED DISRUPTIONS` bằng `0`, `drain` sẽ bị chặn.

- **A:** Sai vì mọi Pod của Deployment đều có `restartPolicy: Always` và vẫn drain bình thường nếu không bị PDB chặn.
- **B:** Sai vì QoS `Burstable` không ngăn cản `kubectl drain`.
- **C (Đúng):** Đúng! Khi PDB có `ALLOWED DISRUPTIONS = 0` (ví dụ `replicas: 2` và `minAvailable: 2`), `kubectl drain` (sử dụng Eviction API) sẽ bị chặn để bảo vệ tính sẵn sàng của ứng dụng.
- **D:** Sai vì `livenessProbe` không ngăn cản lệnh `kubectl drain`.

</details>

---

[Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md)
