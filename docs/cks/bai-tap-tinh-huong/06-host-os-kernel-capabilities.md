# Bài tập tình huống — 6. Gia cố Host OS, Kernel & Linux Capabilities

> Thu nhỏ bề mặt tấn công trên Node (tắt service/port thừa với ss), tinh chỉnh kernel qua sysctl, drop ALL Linux Capabilities và chỉ cấp quyền tối thiểu (như NET_BIND_SERVICE).
> **Số câu hỏi:** 4 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

During a host OS hardening check on a worker node, you discover an unnecessary legacy service listening on TCP port 23 (telnet) and an unrequired package 'ncat' installed. Which set of commands verifies open ports and disables the unnecessary service?

- **A.** ps aux | grep kubelet followed by kill -9 on PID 1 to terminate all legacy host services immediately.
- **B.** kubectl get svc -A to inspect node ports, followed by kubeadm reset on the node.
- **C.** chmod 000 /etc/services to block all unnecessary TCP/UDP ports on the worker host.
- **D.** ss -tulnp to inspect listening sockets, followed by systemctl disable --now telnet.socket.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong quá trình kiểm tra tăng cường bảo mật hệ điều hành host trên một worker node, bạn phát hiện một dịch vụ cũ không cần thiết đang lắng nghe trên cổng TCP 23 (telnet) và một gói không bắt buộc 'ncat' đã được cài đặt. Bộ lệnh nào kiểm tra các cổng đang mở và vô hiệu hóa dịch vụ không cần thiết đó?

**Đáp án đúng:** **D**

Giảm bề mặt tấn công OS Host (Domain 3) bao gồm kiểm tra socket đang mở (ss -tulnp / netstat), gỡ bỏ gói phần mềm không cần thiết và tắt các daemon dư thừa bằng systemctl disable --now.

- **A:** Sai. Không liên quan tới việc kiểm tra cổng mạng đang mở của các dịch vụ dư thừa.
- **B:** Sai. kubectl get svc chỉ xem Service trong Kubernetes, không thấy dịch vụ OS host; kubeadm reset sẽ phá hủy node khỏi cụm.
- **C:** Sai. /etc/services chỉ là bảng ánh xạ tên dịch vụ sang số cổng, không điều khiển firewall hay dịch vụ đang chạy.
- **D (Đúng):** Chính xác! ss -tulnp liệt kê toàn bộ cổng TCP/UDP đang lắng nghe kèm tiến trình, và systemctl disable --now dừng đồng thời vô hiệu hóa dịch vụ khi khởi động lại.

</details>

### Câu 2 `hard`

Which TWO Linux kernel and host-level hardening practices directly reduce the attack surface of Kubernetes worker nodes? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Set net.ipv4.ip_forward=0 in /etc/sysctl.conf on all Kubernetes worker nodes.
- **B.** Restrict SSH access by disabling root login (PermitRootLogin no) and password authentication (PasswordAuthentication no).
- **C.** Disable unused kernel modules (such as usb-storage or cramfs) via /etc/modprobe.d/.
- **D.** Mount /var/lib/kubelet with the noexec and nosuid options in /etc/fstab.
- **E.** Disable swap only temporarily via swapoff -a without removing it from /etc/fstab.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** HAI biện pháp tăng cường bảo mật (hardening) ở cấp Linux kernel và host nào trực tiếp làm giảm bề mặt tấn công (attack surface) của các Kubernetes worker node? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, C**

Gia cố Host OS cần cân bằng giữa bảo mật (tắt module thừa, gia cố SSH, cấu hình UFW/iptables, gỡ gói thừa) và giữ nguyên các yêu cầu vận hành của Kubernetes như ip_forward=1.

- **A:** Sai. Kubernetes CNI và kube-proxy bắt buộc cần net.ipv4.ip_forward=1 để định tuyến lưu lượng giữa các Pod và Service.
- **B (Đúng):** Chính xác! Gia cố SSH bằng cách tắt đăng nhập root trực tiếp và bắt buộc dùng SSH key giảm thiểu nguy cơ brute-force vào node.
- **C (Đúng):** Chính xác! Vô hiệu hóa các kernel module không dùng tới (blacklist / install /bin/true) giúp ngăn chặn khai thác lỗ hổng driver hoặc gắn thiết bị lưu trữ trái phép.
- **D:** Sai. Gắn noexec lên thư mục dữ liệu container/kubelet có thể làm hỏng quá trình thực thi binary hoặc CSI plugins.
- **E:** Sai. Việc quên xóa swap khỏi /etc/fstab sẽ khiến kubelet lỗi khi node reboot.

</details>

### Câu 3 `medium`

An application container must bind to TCP port 80, but your security policy forbids running the container as full root with all Linux capabilities. Which container securityContext configuration satisfies both requirements with minimal privilege?

- **A.** Add SYS_ADMIN capability to the container securityContext.
- **B.** Set hostNetwork: true so port 80 is bound directly on the host network interface without capabilities.
- **C.** Set privileged: true and drop NET_RAW capability.
- **D.** Drop ALL capabilities and add only NET_BIND_SERVICE, while keeping allowPrivilegeEscalation: false.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một container ứng dụng phải bind vào cổng TCP 80, nhưng chính sách bảo mật của bạn cấm chạy container với quyền root đầy đủ cùng tất cả Linux capabilities. Cấu hình securityContext nào của container đáp ứng cả hai yêu cầu với đặc quyền tối thiểu?

**Đáp án đúng:** **D**

Thực hành tốt nhất về Linux Capabilities là luôn 'drop: ["ALL"]' trước, sau đó chỉ 'add' đúng capability tối thiểu cần thiết (ví dụ NET_BIND_SERVICE cho cổng < 1024).

- **A:** Sai. SYS_ADMIN gần tương đương với toàn quyền root và dễ dàng bị lợi dụng để thoát container (container escape).
- **B:** Sai. hostNetwork: true phá vỡ cô lập mạng giữa Pod và Host, không giải quyết bài toán tối thiểu hóa capabilities.
- **C:** Sai. privileged: true cấp hầu như toàn bộ quyền lực của Host kernel cho container, cực kỳ mất an toàn.
- **D (Đúng):** Chính xác! Xóa sạch toàn bộ capabilities (drop: ["ALL"]) và chỉ cấp lại duy nhất NET_BIND_SERVICE cho phép tiến trình bind các cổng đặc quyền (< 1024) mà không cần quyền root đầy đủ.

</details>

### Câu 4 `medium`

You are hardening a newly provisioned Ubuntu worker node before joining it to a Kubernetes cluster. Which TWO actions directly reduce the host OS attack surface? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Disable AppArmor and SELinux on the host OS to avoid conflicts with containerd.
- **B.** Audit /etc/passwd and /etc/sudoers to remove unauthorized interactive shells and excessive sudo privileges.
- **C.** Identify unnecessary open ports and listening daemons using 'ss -tulpn', then stop, disable, and purge unused services such as apache2 or rpcbind.
- **D.** Configure kubelet to listen on read-only-port 10255 for easier cluster monitoring.
- **E.** Enable swap memory on the worker node to prevent out-of-memory kills during scans.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn đang tăng cường bảo mật (hardening) cho một Ubuntu worker node mới được cấp phát trước khi tham gia vào Kubernetes cluster. HAI hành động nào trực tiếp làm giảm bề mặt tấn công (attack surface) của hệ điều hành host? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, C**

Gia cố Host OS bắt đầu bằng việc rà soát cổng mở/dịch vụ thừa (ss -tulpn, systemctl disable/purge) và kiểm soát chặt chẽ tài khoản người dùng/sudo trên Node.

- **A:** Sai. Tắt AppArmor/SELinux làm mất đi lớp bảo vệ Mandatory Access Control (MAC) quan trọng của nhân Linux.
- **B (Đúng):** Chính xác! Kiểm soát tài khoản người dùng OS và quyền sudo đảm bảo nguyên tắc đặc quyền tối thiểu trên máy chủ Node.
- **C (Đúng):** Chính xác! Rà soát các cổng lắng nghe bằng ss -tulpn và gỡ bỏ hoàn toàn các dịch vụ không cần thiết giúp giảm trực tiếp bề mặt tấn công trên Host OS.
- **D:** Sai. CIS Benchmark yêu cầu tắt read-only-port (--read-only-port=0) vì cổng 10255 cho phép đọc thông tin Pod/Node mà không cần xác thực.
- **E:** Sai. Kubernetes khuyến nghị tắt swap để đảm bảo cô lập hiệu năng và bảo mật bộ nhớ giữa các Pod.

</details>

---

[Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md)
