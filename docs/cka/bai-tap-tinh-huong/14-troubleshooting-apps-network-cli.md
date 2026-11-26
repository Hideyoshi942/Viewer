# Bài tập tình huống — 14. Debug Ứng dụng, Mạng & Kỹ năng kubectl/JSONPath Thực chiến

> Khắc phục CrashLoopBackOff/ImagePullBackOff/Pending, dùng kubectl debug ephemeral container cho distroless Pod, kiểm tra Endpoints/DNS và tăng tốc làm bài bằng JSONPath & imperative CLI.
> **Số câu hỏi:** 10 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

An administrator creates three new Pods, and all three remain indefinitely in the `Pending` state. Running `kubectl describe pod` shows zero scheduling events (no `FailedScheduling` message at all). Checking `kubectl get pods -n kube-system` reveals that `kube-scheduler-controlplane` is in `ImagePullBackOff`. Where should the administrator go to fix the `kube-scheduler` image name?

- **A.** Delete `/var/lib/etcd/member` on the `controlplane` node and restart the `kubelet` systemd service.
- **B.** Edit `/etc/kubernetes/manifests/kube-scheduler.yaml` on the `controlplane` node and correct the container image tag.
- **C.** Restart the `coredns` Deployment in `kube-system` and clear the local containerd image cache on worker nodes.
- **D.** Run `kubectl edit deployment kube-scheduler -n kube-system` and update `spec.template.spec.containers[0].image` directly.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Quản trị viên tạo ba Pod mới, và cả ba đều nằm mãi ở trạng thái `Pending`. Chạy `kubectl describe pod` không hiển thị bất kỳ sự kiện lập lịch nào (không có thông báo `FailedScheduling` nào). Kiểm tra `kubectl get pods -n kube-system` cho thấy `kube-scheduler-controlplane` đang ở trạng thái `ImagePullBackOff`. Quản trị viên nên vào đâu để sửa tên image của `kube-scheduler`?

**Đáp án đúng:** **B**

Nếu Pod mới tạo bị kẹt `Pending` mà trong `Events` của `kubectl describe pod` **trống trơn (không có cả thông báo lỗi lập lịch)** -> Thủ phạm 99% là **`kube-scheduler`** đang bị dừng hoặc lỗi cấu hình trong **`/etc/kubernetes/manifests/kube-scheduler.yaml`**!

- **A:** Sai vì xóa `etcd` sẽ làm mất toàn bộ dữ liệu của cụm.
- **B (Đúng):** Đúng! `kube-scheduler` là một Static Pod của Control Plane nên file cấu hình gốc của nó nằm tại `/etc/kubernetes/manifests/kube-scheduler.yaml` trên node `controlplane`. Ngay khi lưu file, `kubelet` sẽ tự động cập nhật lại Pod.
- **C:** Sai vì `coredns` không chịu trách nhiệm lập lịch Pod.
- **D:** Sai vì `kube-scheduler` là một Static Pod chứ không phải là một Deployment, và mọi chỉnh sửa trực tiếp qua API lên một mirror Static Pod sẽ bị `kubelet` ghi đè lại từ file trong `/etc/kubernetes/manifests/`.

</details>

### Câu 2 `medium`

A Service named `web-svc` is targeting Pods with the selector `app=webapp,tier=frontend`, and forwards traffic to `targetPort: 8080`. However, `curl` requests to the `web-svc` ClusterIP fail with `Connection refused`. Running `kubectl get endpoints web-svc` shows `<none>`. What is the MOST likely cause of this issue?

- **A.** `etcd` has run out of disk space, preventing `kube-apiserver` from persisting new Service and Endpoint objects.
- **B.** The worker node's swap memory is disabled, causing `kube-proxy` iptables rules to drop cluster service traffic.
- **C.** None of the running Pods have labels that match the Service's `spec.selector` (`app=webapp,tier=frontend`), or the matching Pods are failing their `readinessProbe`.
- **D.** The `Service` type is configured as `ClusterIP` instead of `LoadBalancer`, so Kubernetes does not populate Endpoints.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một Service tên `web-svc` đang nhắm tới các Pod có selector `app=webapp,tier=frontend`, và chuyển tiếp lưu lượng tới `targetPort: 8080`. Tuy nhiên, các yêu cầu `curl` tới ClusterIP của `web-svc` thất bại với lỗi `Connection refused`. Chạy `kubectl get endpoints web-svc` hiển thị `<none>`. Nguyên nhân CÓ KHẢ NĂNG CAO NHẤT của sự cố này là gì?

**Đáp án đúng:** **C**

Mẹo debug lỗi **Service không kết nối được tới Pod** trong 10 giây:
1. Chạy `kubectl get ep <service-name>`: Nếu thấy `<none>` -> Kiểm tra ngay `kubectl get pods --show-labels` xem nhãn của Pod có bị gõ sai chữ hoa/thường so với `spec.selector` của Service không!
2. Nếu `Endpoints` đã có IP của Pod mà vẫn lỗi kết nối -> Kiểm tra **`targetPort`** của Service có khớp với **`containerPort`** thực tế mà tiến trình trong Pod đang lắng nghe hay không!

- **A:** Sai vì nếu `etcd` lỗi thì API Server sẽ không phản hồi được lệnh `kubectl get endpoints`.
- **B:** Sai vì tắt swap là yêu cầu chuẩn của Kubernetes.
- **C (Đúng):** Đúng! Khi `kubectl get endpoints <svc>` hiển thị `<none>`, nghĩa là không có bất kỳ Pod nào vừa khớp nhãn (`labels`) với `spec.selector` của Service vừa vượt qua `readinessProbe`.
- **D:** Sai vì `ClusterIP` vẫn phải tạo danh sách `Endpoints` trỏ tới IP của các Pod.

</details>

### Câu 3 `medium`

An administrator needs to find which Pod in the `prod` namespace is currently consuming the MOST CPU cores in real time. Assuming `metrics-server` is installed in the cluster, which command displays the Pods sorted by CPU usage?

- **A.** `kubectl logs -n prod --all-containers --tail=50`
- **B.** `kubectl config view --minify --raw`
- **C.** `kubectl get pods -n prod -o wide --show-labels`
- **D.** `kubectl top pods -n prod --sort-by=cpu`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Quản trị viên cần tìm xem Pod nào trong namespace `prod` hiện đang tiêu thụ NHIỀU CPU core NHẤT theo thời gian thực. Giả sử `metrics-server` đã được cài đặt trong cluster, lệnh nào hiển thị các Pod được sắp xếp theo mức sử dụng CPU?

**Đáp án đúng:** **D**

Câu hỏi ăn điểm rất nhanh trong đề CKA: Tìm Pod hoặc Node ngốn nhiều CPU/Memory nhất:
- Cho Pod: **`kubectl top pod -n <namespace> --sort-by=cpu`** (hoặc `--sort-by=memory`, thêm `-l app=xyz` nếu lọc theo label).
- Cho Node: **`kubectl top node --sort-by=cpu`**.

- **A:** Sai vì `kubectl logs` chỉ in dòng nhật ký văn bản của ứng dụng.
- **B:** Sai vì `kubectl config view` chỉ xem nội dung file kubeconfig.
- **C:** Sai vì `kubectl get pods -o wide` chỉ hiển thị IP và Node của Pod chứ không hiển thị mức tiêu thụ CPU/RAM thời gian thực.
- **D (Đúng):** Đúng! Lệnh `kubectl top pods -n <ns> --sort-by=cpu` (hoặc `--sort-by=memory`) truy vấn `metrics-server` và sắp xếp các Pod theo mức tiêu thụ CPU từ cao xuống thấp.

</details>

### Câu 4 `medium`

You need to extract the `InternalIP` of all nodes in the cluster, separated by spaces, into `/opt/node_ips.txt`. Which `kubectl` command achieves this?

- **A.** kubectl describe nodes | grep -E 'InternalIP|Addresses' | awk '{print $2}' > /opt/node_ips.txt
- **B.** kubectl get nodes -o jsonpath='{.items[*].metadata.name}' --show-labels > /opt/node_ips.txt
- **C.** kubectl get nodes -o jsonpath='{.items[*].status.addresses[?(@.type=="InternalIP")].address}' > /opt/node_ips.txt
- **D.** kubectl get nodes -o custom-columns=IP:.status.addresses[0].address > /opt/node_ips.txt

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn cần trích xuất `InternalIP` của tất cả các node trong cluster, phân tách bằng dấu cách, vào tệp `/opt/node_ips.txt`. Lệnh `kubectl` nào thực hiện điều này?

**Đáp án đúng:** **C**

Câu hỏi trích xuất dữ liệu bằng `jsonpath` rất phổ biến trong CKA. Luôn nhớ dùng `.items[*]` cho danh sách đối tượng và bộ lọc `[?(@.type=="InternalIP")]`.

- **A:** Sai vì `kubectl describe` in toàn bộ nhãn văn bản `InternalIP:` chứ không chỉ riêng địa chỉ IP.
- **B:** Sai vì `.metadata.name` trên danh sách `NodeList` là rỗng (thiếu `.items[*]`) và cũng không phải IP.
- **C (Đúng):** Đúng! Bộ lọc JSONPath `[?(@.type=="InternalIP")].address` trích xuất chính xác địa chỉ InternalIP của mọi Node, cách nhau bởi dấu cách.
- **D:** Sai vì `custom-columns` in kèm tiêu đề cột `IP` và xuống dòng từng IP, đồng thời `addresses[0]` không đảm bảo luôn là `InternalIP`.

</details>

### Câu 5 `medium`

A Pod `payment-api` uses a minimal `distroless` image with no `/bin/sh` or `curl` installed, and you need to inspect its network connectivity from inside the Pod's network namespace. Which command should you run?

- **A.** kubectl attach -it payment-api --container=payment-api --stdin=true
- **B.** kubectl debug -it payment-api --image=busybox:1.36 --target=payment-api
- **C.** kubectl logs payment-api --previous --all-containers=true --tail=100
- **D.** kubectl exec -it payment-api -c payment-api -- /bin/sh -c 'curl localhost'

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một Pod `payment-api` sử dụng image `distroless` tối giản không cài đặt `/bin/sh` hay `curl`, và bạn cần kiểm tra kết nối mạng của nó từ bên trong network namespace của Pod. Bạn nên chạy lệnh nào?

**Đáp án đúng:** **B**

Với các container `distroless` không có shell, dùng `kubectl debug -it <pod> --image=busybox:1.36 --target=<container>` để tạo ephemeral debug container.

- **A:** Sai vì `kubectl attach` chỉ gắn vào process chính đang chạy của container, không mở được shell mới.
- **B (Đúng):** Đúng! `kubectl debug -it` gắn một ephemeral container (ví dụ `busybox`) trực tiếp vào Pod đang chạy để debug mà không cần shell trong image gốc.
- **C:** Sai vì `kubectl logs` chỉ đọc stdout/stderr chứ không cho phép chạy lệnh kiểm tra mạng tương tác.
- **D:** Sai vì image `distroless` không có `/bin/sh` nên `kubectl exec` sẽ báo lỗi `executable file not found in $PATH`.

</details>

### Câu 6 `easy`

Which command finds the Pod consuming the highest amount of CPU in the `monitoring` namespace?

- **A.** kubectl describe pods -n monitoring | grep CPU
- **B.** crictl stats --sort=cpu
- **C.** kubectl top pods -n monitoring --sort-by=cpu
- **D.** kubectl get pods -n monitoring --sort-by=.status.cpu

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Lệnh nào tìm ra Pod tiêu thụ lượng CPU cao nhất trong namespace `monitoring`?

**Đáp án đúng:** **C**

Dùng `kubectl top pods -n <ns> --sort-by=cpu` (hoặc `--sort-by=memory`) để nhanh chóng tìm Pod ngốn tài nguyên nhất.

- **A:** Sai vì `describe` chỉ hiện `requests`/`limits` cấu hình tĩnh, không hiện mức sử dụng CPU thực tế.
- **B:** Sai vì `crictl` chỉ xem trên từng node cục bộ và không hỗ trợ lọc theo namespace Kubernetes như `kubectl top`.
- **C (Đúng):** Đúng! `kubectl top pods -n <ns> --sort-by=cpu` hiển thị mức CPU thực tế từ Metrics Server và sắp xếp giảm dần theo CPU.
- **D:** Sai vì đối tượng Pod trong API Server không có trường `.status.cpu`.

</details>

### Câu 7 `hard`

You scale a `Deployment` from `1` to `4` replicas, and `kubectl get deploy` shows `READY 1/4` with no new Pods created at all (`kubectl get rs` shows `DESIRED 4, CURRENT 1`). Checking `kube-system` Pods reveals `kube-controller-manager-controlplane` is in `CrashLoopBackOff`. Which file should you inspect to fix it?

- **A.** /var/lib/kubelet/config.yaml on the controlplane node
- **B.** /etc/kubernetes/manifests/kube-scheduler.yaml
- **C.** /etc/kubernetes/manifests/etcd.yaml on the controlplane
- **D.** /etc/kubernetes/manifests/kube-controller-manager.yaml

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn scale một `Deployment` từ `1` lên `4` replica, và `kubectl get deploy` hiển thị `READY 1/4` mà không có Pod mới nào được tạo ra (`kubectl get rs` hiển thị `DESIRED 4, CURRENT 1`). Kiểm tra các Pod trong `kube-system` cho thấy `kube-controller-manager-controlplane` đang ở trạng thái `CrashLoopBackOff`. Bạn nên kiểm tra tệp nào để khắc phục?

**Đáp án đúng:** **D**

Phân biệt rõ: `kube-controller-manager` lỗi -> không tạo được Pod mới từ ReplicaSet (`CURRENT < DESIRED`); `kube-scheduler` lỗi -> Pod được tạo nhưng kẹt ở `Pending`.

- **A:** Sai vì lỗi nằm ở Static Pod `kube-controller-manager` bị `CrashLoopBackOff`, không phải cấu hình `kubelet`.
- **B:** Sai vì nếu `kube-scheduler` lỗi thì Pod mới vẫn được tạo ở trạng thái `Pending`, chứ không phải `CURRENT 1` không tạo Pod nào.
- **C:** Sai vì nếu `etcd` sập thì `kubectl` sẽ không kết nối được tới API Server.
- **D (Đúng):** Đúng! ReplicaSet Controller nằm trong `kube-controller-manager`. Khi `kube-controller-manager` bị `CrashLoopBackOff`, Deployment/ReplicaSet không thể tạo thêm Pod mới. Sửa manifest tại `/etc/kubernetes/manifests/kube-controller-manager.yaml`.

</details>

### Câu 8 `easy`

Which command shows the logs of the PREVIOUS terminated container instance for container `api` inside Pod `backend-0`?

- **A.** kubectl logs backend-0 -c api --tail=1
- **B.** kubectl get events backend-0 --previous
- **C.** kubectl logs backend-0 -c api --previous
- **D.** kubectl describe pod backend-0 --previous

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Lệnh nào hiển thị log của instance container đã kết thúc TRƯỚC ĐÓ cho container `api` bên trong Pod `backend-0`?

**Đáp án đúng:** **C**

Khi debug Pod `CrashLoopBackOff`, luôn chạy `kubectl logs <pod> -c <container> --previous` để xem lỗi thực sự khiến container thoát.

- **A:** Sai vì `--tail=1` chỉ lấy dòng cuối của container hiện tại.
- **B:** Sai cú pháp và Events không chứa stdout/stderr của container.
- **C (Đúng):** Đúng! Cờ `-c <container>` chọn đúng container và `--previous` (hoặc `-p`) lấy log của lần chạy trước khi bị crash.
- **D:** Sai vì `kubectl describe` không có cờ `--previous` và không in container logs.

</details>

### Câu 9 `medium`

You want to list all PersistentVolumes sorted in ascending order by their storage capacity using `kubectl`. Which command is correct?

- **A.** kubectl get pv --order-by=capacity
- **B.** kubectl sort pv --by=.spec.capacity.storage
- **C.** kubectl get pv -o jsonpath='{.sort(.spec.capacity.storage)}'
- **D.** kubectl get pv --sort-by=.spec.capacity.storage

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn muốn liệt kê tất cả PersistentVolumes được sắp xếp theo thứ tự tăng dần về dung lượng lưu trữ bằng `kubectl`. Lệnh nào là đúng?

**Đáp án đúng:** **D**

`kubectl get <resource> --sort-by=<jsonpath>` là lệnh rất hay dùng trong CKA để sắp xếp PV theo dung lượng hoặc Events theo `.metadata.creationTimestamp`.

- **A:** Sai vì `kubectl` không có cờ `--order-by`.
- **B:** Sai vì không có lệnh con `kubectl sort`.
- **C:** Sai vì `jsonpath` của `kubectl` không có hàm `.sort()`.
- **D (Đúng):** Đúng! `--sort-by` nhận đường dẫn JSONPath tới trường cần sắp xếp (`.spec.capacity.storage`).

</details>

### Câu 10 `medium`

You want to quickly inspect the exact YAML schema and documentation for `spec.tolerations` of a Pod and verify your changes to a Deployment manifest against the live cluster before applying. Which TWO `kubectl` commands should you use? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** kubectl schema pod.spec.tolerations
- **B.** kubectl diff -f deployment.yaml
- **C.** kubectl explain pod.spec.tolerations
- **D.** kubectl validate --live deployment.yaml

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn muốn kiểm tra nhanh YAML schema và tài liệu chính xác cho `spec.tolerations` của một Pod, đồng thời xác minh các thay đổi của bạn đối với một Deployment manifest trên cluster đang chạy trước khi áp dụng. Bạn nên sử dụng HAI lệnh `kubectl` nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, C**

`kubectl explain <resource>.<field>` (hỗ trợ `--recursive`) và `kubectl diff -f <file>` là hai công cụ cực kỳ hữu ích giúp viết YAML chính xác và an toàn trong kỳ thi CKA.

- **A:** Sai vì `kubectl` không có lệnh con `schema`.
- **B (Đúng):** Đúng! `kubectl diff -f` so sánh sự khác biệt giữa manifest cục bộ và tài nguyên đang chạy trên cụm trước khi apply.
- **C (Đúng):** Đúng! `kubectl explain` tra cứu trực tiếp cấu trúc trường YAML và tài liệu API offline ngay trong phòng thi.
- **D:** Sai vì `kubectl` không có lệnh con `validate --live`.

</details>

---

[Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md)
