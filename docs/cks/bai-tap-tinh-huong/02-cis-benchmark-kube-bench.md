# Bài tập tình huống — 2. Đánh giá & Khắc phục CIS Benchmark với kube-bench

> Chạy kube-bench trên Control Plane và Worker Node để phát hiện lỗ hổng cấu hình kube-apiserver, kubelet, etcd và khắc phục theo chuẩn CIS.
> **Số câu hỏi:** 3 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

After running kube-bench on a Kubernetes control plane node, test 1.2.15 fails because --profiling is not disabled on kube-apiserver. Where and how should you remediate this finding on a kubeadm-provisioned cluster?

- **A.** Add --profiling=false to /etc/kubernetes/manifests/kube-apiserver.yaml and let kubelet automatically recreate the static Pod.
- **B.** Edit the kube-apiserver Deployment in the kube-system namespace using kubectl edit deployment kube-apiserver.
- **C.** Add profiling: false to /var/lib/kubelet/config.yaml on all control plane nodes and run systemctl restart kubelet to apply it.
- **D.** Set --profiling=false in /etc/kubernetes/manifests/etcd.yaml to disable API server profiling endpoints.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Sau khi chạy kube-bench trên một Kubernetes control plane node, bài kiểm tra 1.2.15 báo thất bại vì --profiling chưa được tắt trên kube-apiserver. Bạn nên khắc phục phát hiện này ở đâu và như thế nào trên một cluster được khởi tạo bằng kubeadm?

**Đáp án đúng:** **A**

Theo CIS Kubernetes Benchmark, cần vô hiệu hóa profiling (--profiling=false) trên các control plane component (kube-apiserver, kube-controller-manager, kube-scheduler) bằng cách chỉnh sửa static pod manifest trong /etc/kubernetes/manifests/.

- **A (Đúng):** Chính xác! Trên cụm kubeadm, kube-apiserver chạy dưới dạng static Pod từ /etc/kubernetes/manifests/kube-apiserver.yaml. Thêm --profiling=false sẽ tắt endpoint pprof tránh lộ thông tin bộ nhớ/CPU, và kubelet sẽ tự động khởi tạo lại Pod.
- **B:** Sai. Trong cụm kubeadm, kube-apiserver là static Pod do kubelet quản lý trực tiếp từ file manifest trên host, không phải Deployment.
- **C:** Sai. File /var/lib/kubelet/config.yaml cấu hình cho kubelet, không áp dụng cho các tham số của kube-apiserver.
- **D:** Sai. etcd.yaml chỉ cấu hình cho etcd, không ảnh hưởng tới tham số --profiling của kube-apiserver.

</details>

### Câu 2 `hard`

A kube-bench audit flags two CIS Benchmark failures on a worker node: (1) kubelet allows anonymous authentication, and (2) kubelet authorization mode is set to AlwaysAllow. Which TWO changes in /var/lib/kubelet/config.yaml fix both findings? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Set readOnlyPort to 10255 for metrics scraping.
- **B.** Set authorization.mode to AlwaysAllow.
- **C.** Set authentication.webhook.enabled to false.
- **D.** Set authorization.mode to Webhook.
- **E.** Set authentication.anonymous.enabled to false.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một cuộc kiểm tra kube-bench gắn cờ hai lỗi CIS Benchmark trên một worker node: (1) kubelet cho phép xác thực ẩn danh (anonymous authentication), và (2) chế độ ủy quyền (authorization mode) của kubelet được đặt thành AlwaysAllow. HAI thay đổi nào trong /var/lib/kubelet/config.yaml khắc phục cả hai phát hiện này? (Chọn HAI đáp án.)

**Đáp án đúng:** **D, E**

Theo CIS Benchmark cho Worker Node (Section 4.2), kubelet cần cấu hình authentication.anonymous.enabled: false, authorization.mode: Webhook và readOnlyPort: 0 trong /var/lib/kubelet/config.yaml, sau đó restart dịch vụ kubelet.

- **A:** Sai. Cổng readOnlyPort 10255 làm lộ thông tin Pod/Node mà không cần xác thực; CIS yêu cầu đặt readOnlyPort: 0.
- **B:** Sai. AlwaysAllow chính là cấu hình gây lỗi bảo mật cần phải thay thế.
- **C:** Sai. Cần bật authentication.webhook.enabled: true để kubelet xác thực bearer token qua API Server.
- **D (Đúng):** Chính xác! Đặt authorization.mode thành Webhook buộc kubelet ủy quyền kiểm tra quyền truy cập qua kube-apiserver (SubjectAccessReview) thay vì cho phép mọi yêu cầu.
- **E (Đúng):** Chính xác! Tắt anonymous authentication trên kubelet ngăn chặn các kết nối chưa xác thực tới cổng 10250.

</details>

### Câu 3 `medium`

Running 'kube-bench run --targets node' on a worker node reports FAIL for CIS check 4.2.1 (anonymous-auth is enabled) and 4.2.2 (authorization-mode is set to AlwaysAllow). Where should you remediate these settings and how do you apply the changes?

- **A.** Edit /etc/kubernetes/kubelet.conf to disable anonymous-auth and run 'kubectl rollout restart daemonset kube-proxy -n kube-system' across nodes.
- **B.** Edit /etc/kubernetes/manifests/etcd.yaml to set --client-cert-auth=false and restart the containerd service.
- **C.** Edit /var/lib/kubelet/config.yaml to set authentication.anonymous.enabled: false and authorization.mode: Webhook, then restart kubelet.
- **D.** Edit /etc/kubernetes/manifests/kube-apiserver.yaml to set --anonymous-auth=false and wait for the static Pod to restart.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Chạy 'kube-bench run --targets node' trên một worker node báo FAIL cho kiểm tra CIS 4.2.1 (anonymous-auth đang bật) và 4.2.2 (authorization-mode được đặt thành AlwaysAllow). Bạn nên khắc phục các thiết lập này ở đâu và làm thế nào để áp dụng thay đổi?

**Đáp án đúng:** **C**

Khi khắc phục các cảnh báo CIS Benchmark mục 4.2.x (Kubelet), cần sửa /var/lib/kubelet/config.yaml (tắt anonymous auth, đặt authorization mode là Webhook) rồi restart dịch vụ systemd kubelet.

- **A:** Sai. kubelet.conf là file kubeconfig để kubelet kết nối API server, không chứa cấu hình anonymous-auth/authorization-mode và không liên quan đến kube-proxy.
- **B:** Sai. Tắt client-cert-auth trên etcd thậm chí còn làm giảm nghiêm trọng độ bảo mật của cụm.
- **C (Đúng):** Chính xác! Mục CIS 4.2.x kiểm tra cấu hình kubelet trên worker node. File cấu hình chuẩn là /var/lib/kubelet/config.yaml và cần khởi động lại dịch vụ kubelet để áp dụng.
- **D:** Sai. kube-apiserver.yaml thuộc Control Plane (CIS section 1.2), không phải cấu hình kubelet trên Worker Node (CIS section 4.2).

</details>

---

[Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md)
