# Bài tập tình huống — 13. Xử lý Sự cố Control Plane, Worker Nodes & kubelet

> Quy trình chẩn đoán Node NotReady (systemctl status kubelet, journalctl), sửa lỗi Static Pod manifests khi API Server sập bằng crictl và kiểm tra chứng chỉ TLS.
> **Số câu hỏi:** 5 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A Pod named `payment-worker` is in the `CrashLoopBackOff` state because its container crashes immediately upon startup and is restarted repeatedly by `kubelet`. Which `kubectl` command allows the administrator to inspect the stdout/stderr logs from the PREVIOUS crashed container instance?

- **A.** `kubectl logs payment-worker --previous` (or `-p`)
- **B.** `kubectl exec -it payment-worker -- /bin/sh -c "cat /var/log/app"`
- **C.** `kubectl label pod payment-worker status=fixed --overwrite`
- **D.** `kubectl port-forward pod/payment-worker 8080:80`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một Pod tên `payment-worker` đang ở trạng thái `CrashLoopBackOff` vì container của nó bị crash ngay khi khởi động và bị `kubelet` khởi động lại liên tục. Lệnh `kubectl` nào cho phép quản trị viên kiểm tra log stdout/stderr từ instance container bị crash TRƯỚC ĐÓ?

**Đáp án đúng:** **A**

Khi xử lý Pod bị **`CrashLoopBackOff`**, luôn chạy 2 lệnh sau:
1. **`kubectl logs <pod-name> --previous`** (xem thông báo lỗi in ra ngay trước khi tiến trình thoát).
2. **`kubectl describe pod <pod-name>`** (kiểm tra `Exit Code`: ví dụ `Exit Code 137` là bị `OOMKilled` do thiếu bộ nhớ `resources.limits.memory`; `Exit Code 127` là gõ sai tên lệnh `command`).

- **A (Đúng):** Đúng! Cờ `--previous` (viết tắt `-p`) trong lệnh `kubectl logs <pod> --previous` cho phép đọc toàn bộ log lỗi của phiên bản container vừa bị sập trước khi nó khởi động lại.
- **B:** Sai vì khi container đã bị sập (`CrashLoopBackOff`), bạn không thể `kubectl exec` vào bên trong tiến trình đã dừng.
- **C:** Sai vì gắn nhãn không giúp đọc log lỗi.
- **D:** Sai vì `port-forward` chỉ chuyển tiếp cổng mạng chứ không xem được log của tiến trình đã sập.

</details>

### Câu 2 `hard`

After editing `/etc/kubernetes/manifests/kube-apiserver.yaml`, `kubectl` commands fail with `The connection to the server 10.0.0.10:6443 was refused`. Running `crictl ps -a` shows no `kube-apiserver` container at all (not even an Exited one). Where should you look next to find why `kubelet` did not start the static Pod?

- **A.** Run `kubectl logs kube-apiserver-controlplane -n kube-system --previous` to inspect the crashed container stdout logs.
- **B.** Check `/etc/cni/net.d/` on the control plane node for missing CNI network plugin configuration files.
- **C.** Run `systemctl status kube-apiserver` and `journalctl -u kube-apiserver` on the control plane node.
- **D.** Run `journalctl -u kubelet -n 50 --no-pager` on the control plane node to check for YAML syntax/parsing errors.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Sau khi chỉnh sửa `/etc/kubernetes/manifests/kube-apiserver.yaml`, các lệnh `kubectl` thất bại với lỗi `The connection to the server 10.0.0.10:6443 was refused`. Chạy `crictl ps -a` không thấy container `kube-apiserver` nào cả (thậm chí không có container ở trạng thái Exited). Bạn nên kiểm tra ở đâu tiếp theo để tìm nguyên nhân `kubelet` không khởi chạy static Pod này?

**Đáp án đúng:** **D**

Khi sửa Static Pod manifest bị sai indentation/YAML syntax, `kubelet` sẽ từ chối tạo container mới và ghi lỗi vào `journalctl -u kubelet`.

- **A:** Sai vì `kube-apiserver` đang sập nên mọi lệnh `kubectl` đều thất bại với `connection refused`.
- **B:** Sai vì `kube-apiserver` sử dụng `hostNetwork: true`, không phụ thuộc vào CNI để khởi chạy.
- **C:** Sai vì trên cụm `kubeadm`, `kube-apiserver` chạy dưới dạng Static Pod chứ không phải dịch vụ `systemd`.
- **D (Đúng):** Đúng! Nếu `crictl ps -a` không thấy container mới nào được tạo, nguyên nhân phổ biến nhất là file YAML trong `/etc/kubernetes/manifests/` bị lỗi cú pháp khiến `kubelet` không parse được — log lỗi này nằm trong `journalctl -u kubelet`.

</details>

### Câu 3 `medium`

A worker node `node02` shows status `NotReady`. You SSH into `node02`, run `systemctl status kubelet`, and see it is `active (running)`, but `journalctl -u kubelet` logs `connection refused` to `10.0.0.10:6444` (while the API server listens on port `6443`). Which file on `node02` must you fix?

- **A.** /etc/kubernetes/kubelet.conf
- **B.** /etc/kubernetes/manifests/kube-apiserver.yaml
- **C.** /etc/cni/net.d/10-calico.conflist
- **D.** /etc/hosts

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một worker node `node02` hiển thị trạng thái `NotReady`. Bạn SSH vào `node02`, chạy `systemctl status kubelet`, và thấy nó đang `active (running)`, nhưng `journalctl -u kubelet` ghi log `connection refused` tới `10.0.0.10:6444` (trong khi API server lắng nghe trên cổng `6443`). Bạn phải sửa tệp nào trên `node02`?

**Đáp án đúng:** **A**

Trên Worker node, `/etc/kubernetes/kubelet.conf` định nghĩa endpoint kết nối tới `kube-apiserver` (mặc định cổng `6443`). Sau khi sửa, chạy `systemctl restart kubelet`.

- **A (Đúng):** Đúng! `/etc/kubernetes/kubelet.conf` là file kubeconfig của `kubelet`, chứa địa chỉ `server: https://<control-plane>:6443`. Sửa cổng `6444` về `6443` rồi `systemctl restart kubelet` sẽ khắc phục lỗi.
- **B:** Sai vì file này nằm trên Control Plane node chứ không phải trên Worker node `node02`.
- **C:** Sai vì đây là file cấu hình CNI network plugin, không chứa địa chỉ API server cho `kubelet`.
- **D:** Sai vì lỗi nằm ở sai số cổng `6444` chứ không phải phân giải tên miền.

</details>

### Câu 4 `medium`

A newly created Pod is stuck in `ContainerCreating` for several minutes, and `kubectl describe pod` shows `FailedCreatePodSandBox: network plugin is not ready: cni config uninitialized`. What is the most likely cause?

- **A.** No CNI network plugin (e.g., Calico, Flannel, Cilium) is installed or its DaemonSet Pods are failing, leaving `/etc/cni/net.d/` empty.
- **B.** The `PersistentVolumeClaim` has `storageClassName: wrong-sc`, so the CSI driver cannot attach the Pod's network interface.
- **C.** The Pod's `livenessProbe` is failing on port 8080, preventing the container runtime from initializing the network namespace.
- **D.** The container image tag does not exist in Docker Hub or the node lacks registry credentials, causing `kubelet` to halt sandbox creation.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một Pod mới tạo bị kẹt ở trạng thái `ContainerCreating` trong vài phút, và `kubectl describe pod` hiển thị `FailedCreatePodSandBox: network plugin is not ready: cni config uninitialized`. Nguyên nhân có khả năng cao nhất là gì?

**Đáp án đúng:** **A**

Lỗi `cni config uninitialized` xuất hiện khi cụm chưa cài CNI hoặc CNI Pods trong `kube-system` đang lỗi.

- **A (Đúng):** Đúng! Thông báo `cni config uninitialized` cho thấy Node chưa có cấu hình CNI trong `/etc/cni/net.d/` (chưa cài CNI plugin hoặc CNI DaemonSet bị lỗi).
- **B:** Sai vì PVC chưa Bound sẽ khiến Pod kẹt ở `Pending` với thông báo `unbound immediate PersistentVolumeClaims`.
- **C:** Sai vì `livenessProbe` chỉ chạy sau khi container đã khởi động xong.
- **D:** Sai vì lỗi sai tag image sẽ hiển thị `ImagePullBackOff` hoặc `ErrImagePull`, không phải `cni config uninitialized`.

</details>

### Câu 5 `medium`

While running `kubectl get nodes`, an administrator notices that `worker-node-02` is in the `NotReady` state. After SSHing into `worker-node-02` and inspecting `journalctl -u kubelet`, the logs show `connection refused` to `https://10.0.0.10:6444`, whereas `kube-apiserver` is actually listening on port `6443`. How should the administrator fix this issue?

- **A.** Update the server port from `6444` to `6443` in `/etc/kubernetes/kubelet.conf` on `worker-node-02` and run `systemctl restart kubelet`.
- **B.** Delete all `coredns` Pods in the `kube-system` namespace so the Deployment recreates them with updated API server endpoints.
- **C.** Edit `/etc/resolv.conf` on `worker-node-02` to add the control plane IP and restart `systemd-resolved` to fix cluster DNS resolution.
- **D.** Modify the member peer URL port in `/var/lib/etcd/member` on `worker-node-02` and restart the local `etcd` systemd service.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Khi chạy `kubectl get nodes`, quản trị viên thấy `worker-node-02` đang ở trạng thái `NotReady`. Sau khi SSH vào `worker-node-02` và kiểm tra `journalctl -u kubelet`, log hiển thị lỗi `connection refused` tới `https://10.0.0.10:6444`, trong khi `kube-apiserver` thực tế đang lắng nghe trên cổng `6443`. Quản trị viên cần khắc phục sự cố này bằng cách nào?

**Đáp án đúng:** **A**

Một trong những bài lab kinh điển nhất của Domain Troubleshooting (30% điểm CKA): `kubelet` trên worker node không lên `Ready` do: (1) dịch vụ `kubelet` bị dừng, (2) sai cổng API Server (`6443`) hoặc sai đường dẫn chứng chỉ trong `/etc/kubernetes/kubelet.conf` hoặc `/var/lib/kubelet/config.yaml`.

- **A (Đúng):** Đúng! Dịch vụ `kubelet` trên worker node sử dụng file `/etc/kubernetes/kubelet.conf` để biết địa chỉ IP và cổng của `kube-apiserver`.
- **B:** Sai vì `coredns` phục vụ phân giải DNS bên trong Pod, không liên quan đến kết nối trực tiếp bằng IP từ `kubelet` tới `kube-apiserver`.
- **C:** Sai vì `/etc/resolv.conf` chỉ cấu hình máy chủ phân giải tên miền DNS chứ không quy định cổng kết nối API Server của `kubelet`.
- **D:** Sai vì worker node không chạy `etcd`.

</details>

---

[Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md)
