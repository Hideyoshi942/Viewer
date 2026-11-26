# Bài tập tình huống — 7. Kiểm soát Syscall với AppArmor & Seccomp Profiles

> Nạp profile AppArmor bằng apparmor_parser, áp dụng Seccomp RuntimeDefault/Localhost (/var/lib/kubelet/seccomp) cho Pod và xác minh trạng thái từ /proc/1/status.
> **Số câu hỏi:** 6 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

You have written a new AppArmor profile at /etc/apparmor.d/k8s-restricted-nginx on a worker node. Which command loads this profile into the kernel in enforce mode?

- **A.** sudo apparmor_parser -q /etc/apparmor.d/k8s-restricted-nginx
- **B.** kubectl apply -f /etc/apparmor.d/k8s-restricted-nginx
- **C.** sudo sysctl -p /etc/apparmor.d/k8s-restricted-nginx
- **D.** sudo aa-status --load /etc/apparmor.d/k8s-restricted-nginx --enforce

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn đã viết một AppArmor profile mới tại /etc/apparmor.d/k8s-restricted-nginx trên một worker node. Lệnh nào nạp profile này vào kernel ở chế độ enforce?

**Đáp án đúng:** **A**

Trên từng worker node nơi Pod có thể chạy, cần nạp AppArmor profile bằng apparmor_parser -q <file> và kiểm tra lại bằng aa-status trước khi tham chiếu trong Pod.

- **A (Đúng):** Chính xác! apparmor_parser -q nạp profile vào nhân Linux ở chế độ enforce mặc định (nếu muốn reload thì dùng -r, complain mode dùng -C).
- **B:** Sai. AppArmor profile là file cấu hình cấp OS trên từng worker node, không phải tài nguyên Kubernetes API.
- **C:** Sai. sysctl dùng để cấu hình tham số nhân Linux (/etc/sysctl.conf), không dùng cho AppArmor.
- **D:** Sai. aa-status chỉ dùng để liệt kê trạng thái các profile đã nạp, không dùng để nạp profile mới.

</details>

### Câu 2 `hard`

A Pod fails to start with the error 'Blocked by AppArmor' or 'Cannot enforce AppArmor profile' after you set localhost/custom-profile in its securityContext. What is the most common cause?

- **A.** The profile name in the Pod YAML must use the kube-system namespace prefix.
- **B.** The AppArmor profile is not loaded on the specific worker node where the Pod was scheduled.
- **C.** AppArmor profiles must be stored inside a Kubernetes ConfigMap mounted at /etc/apparmor.d on every Pod.
- **D.** AppArmor requires privileged: true and CAP_SYS_ADMIN on the container securityContext.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một Pod không thể khởi động với lỗi 'Blocked by AppArmor' hoặc 'Cannot enforce AppArmor profile' sau khi bạn thiết lập localhost/custom-profile trong securityContext của nó. Nguyên nhân phổ biến nhất là gì?

**Đáp án đúng:** **B**

Trong môi trường nhiều node, khi áp dụng AppArmor hoặc Seccomp Localhost profile, phải đảm bảo file/profile đã tồn tại và được nạp trên tất cả các worker node (hoặc dùng nodeName/nodeSelector chỉ định đúng node đã nạp).

- **A:** Sai. Tên profile AppArmor không gắn với namespace Kubernetes.
- **B (Đúng):** Chính xác! AppArmor profile phải được nạp trực tiếp trên worker node chạy Pod đó. Nếu cụm có nhiều node mà bạn chỉ nạp trên node01, Pod bị schedule sang node02 sẽ báo lỗi.
- **C:** Sai. Kubelet đọc profile đã được nạp trong nhân Linux của host node, không đọc từ ConfigMap bên trong Pod.
- **D:** Sai. Container chạy privileged: true thực tế sẽ bỏ qua các giới hạn bảo mật, không cần thiết để dùng AppArmor.

</details>

### Câu 3 `medium`

You want to apply a custom Seccomp profile stored at /var/lib/kubelet/seccomp/profiles/audit.json on the worker node to a Pod's container. How should seccompProfile be configured in the Pod YAML?

- **A.** Set seccompProfile.type: Localhost and seccompProfile.localhostProfile: /var/lib/kubelet/seccomp/profiles/audit.json.
- **B.** Set seccompProfile.type: RuntimeDefault and seccompProfile.localhostProfile: /var/lib/kubelet/seccomp/profiles/audit.json.
- **C.** Set seccompProfile.type: Localhost and seccompProfile.localhostProfile: profiles/audit.json.
- **D.** Set seccompProfile.type: Unconfined and mount audit.json as a Secret.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn muốn áp dụng một Seccomp profile tùy chỉnh được lưu tại /var/lib/kubelet/seccomp/profiles/audit.json trên worker node cho container của một Pod. seccompProfile nên được cấu hình như thế nào trong tệp Pod YAML?

**Đáp án đúng:** **C**

Với Seccomp type: Localhost, giá trị localhostProfile là đường dẫn tương đối bên trong /var/lib/kubelet/seccomp/. Ví dụ file nằm tại /var/lib/kubelet/seccomp/profiles/audit.json thì khai báo profiles/audit.json.

- **A:** Sai. Không truyền đường dẫn tuyệt đối bắt đầu bằng /var/lib/kubelet/seccomp/; kubelet tự ghép đường dẫn gốc đó.
- **B:** Sai. RuntimeDefault dùng profile mặc định của container runtime và không cho phép chỉ định localhostProfile.
- **C (Đúng):** Chính xác! Đường dẫn localhostProfile luôn tính tương đối từ thư mục gốc seccomp của kubelet (/var/lib/kubelet/seccomp/), do đó giá trị đúng là profiles/audit.json.
- **D:** Sai. Unconfined tắt hoàn toàn Seccomp, không áp dụng profile giới hạn syscall nào.

</details>

### Câu 4 `medium`

You created an AppArmor profile file at /etc/apparmor.d/k8s-deny-write on worker-1 with 'profile deny-write-profile flags=(attach_disconnected) { ... }' and loaded it using 'apparmor_parser -q'. However, when you deploy a Pod specifying 'localhostProfile: k8s-deny-write', the Pod fails to start with a container creation error. Why?

- **A.** The Pod's localhostProfile must match the profile name declared inside the file ('deny-write-profile'), not the filename ('k8s-deny-write').
- **B.** AppArmor requires privileged: true to be set on the container securityContext for enforcement.
- **C.** AppArmor profiles must be stored inside /var/lib/kubelet/seccomp/ instead of /etc/apparmor.d/ to be loaded.
- **D.** You must restart kube-apiserver on the control plane node after loading an AppArmor profile on any worker node in the Kubernetes cluster.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn đã tạo một tệp AppArmor profile tại /etc/apparmor.d/k8s-deny-write trên worker-1 với 'profile deny-write-profile flags=(attach_disconnected) { ... }' và nạp nó bằng 'apparmor_parser -q'. Tuy nhiên, khi bạn triển khai một Pod chỉ định 'localhostProfile: k8s-deny-write', Pod không thể khởi động với lỗi tạo container. Tại sao?

**Đáp án đúng:** **A**

Luôn dùng 'aa-status' để kiểm tra chính xác tên AppArmor profile đã được nạp vào nhân Linux, và điền đúng tên đó vào securityContext.appArmorProfile.localhostProfile của Pod.

- **A (Đúng):** Chính xác! AppArmor nhận diện profile dựa trên tên khai báo sau từ khóa 'profile' bên trong tệp ('deny-write-profile', hiển thị trong lệnh aa-status), không phải tên file trên ổ đĩa.
- **B:** Sai. Không cần và không nên đặt privileged: true khi dùng AppArmor.
- **C:** Sai. /var/lib/kubelet/seccomp/ là thư mục dành cho Seccomp JSON profile, không phải AppArmor.
- **D:** Sai. AppArmor thực thi ở nhân Linux trên Worker Node; kube-apiserver không cần khởi động lại.

</details>

### Câu 5 `medium`

You want to apply a custom Seccomp JSON profile named 'audit.json' to a Pod via 'seccompProfile.type: Localhost' and 'localhostProfile: profiles/audit.json'. Where must the file be placed on the worker node running the Pod?

- **A.** /etc/kubernetes/seccomp/profiles/audit.json
- **B.** /var/lib/kubelet/seccomp/profiles/audit.json
- **C.** /usr/local/share/kubernetes/seccomp/profiles/audit.json
- **D.** /etc/apparmor.d/profiles/audit.json

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn muốn áp dụng một tệp Seccomp JSON profile tùy chỉnh tên 'audit.json' cho một Pod thông qua 'seccompProfile.type: Localhost' và 'localhostProfile: profiles/audit.json'. Tệp này phải được đặt ở đâu trên worker node chạy Pod đó?

**Đáp án đúng:** **B**

Khi sử dụng seccompProfile.type: Localhost, đường dẫn trong localhostProfile được kubelet ghép trực tiếp sau thư mục gốc /var/lib/kubelet/seccomp/ trên các Worker Node.

- **A:** Sai. Đường dẫn mặc định của kubelet là /var/lib/kubelet/seccomp/, không phải /etc/kubernetes/seccomp/.
- **B (Đúng):** Chính xác! Kubelet luôn tìm kiếm các Seccomp Localhost profile tương đối so với thư mục gốc /var/lib/kubelet/seccomp/ trên Worker Node.
- **C:** Sai. Đây không phải đường dẫn mặc định kubelet sử dụng để nạp Seccomp profile.
- **D:** Sai. /etc/apparmor.d/ là thư mục chứa cấu hình AppArmor, không phải Seccomp.

</details>

### Câu 6 `easy`

How can you quickly verify from inside a running container that a Seccomp filter profile is actively enforced on its main process (PID 1)?

- **A.** Check if /etc/seccomp.conf exists inside the container.
- **B.** Run 'aa-status --verbose' inside the container and confirm the Seccomp profile value is 'enforce'.
- **C.** Run 'grep Seccomp /proc/1/status' inside the container and confirm the value is 2.
- **D.** Run 'kubectl get seccompprofiles -A' on the control plane.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Làm thế nào để bạn kiểm tra nhanh từ bên trong một container đang chạy xem Seccomp filter profile có đang được thực thi trên tiến trình chính (PID 1) của nó hay không?

**Đáp án đúng:** **C**

Kiểm tra trường Seccomp trong /proc/1/status (kết quả Seccomp: 2) là cách nhanh và chính xác nhất để xác nhận Seccomp filter đang hoạt động trên container.

- **A:** Sai. Seccomp là cơ chế lọc syscall ở nhân Linux, không lưu tệp /etc/seccomp.conf bên trong container.
- **B:** Sai. aa-status kiểm tra AppArmor trên Host, không phải trạng thái Seccomp.
- **C (Đúng):** Chính xác! Trong /proc/<pid>/status, giá trị Seccomp: 0 nghĩa là tắt (disabled), 1 là chế độ strict, và 2 là chế độ filter (đang áp dụng Seccomp profile).
- **D:** Sai. Kubernetes không có tài nguyên mặc định tên là seccompprofiles.

</details>

---

[Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md)
