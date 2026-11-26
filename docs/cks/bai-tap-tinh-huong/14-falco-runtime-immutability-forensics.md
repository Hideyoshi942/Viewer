# Bài tập tình huống — 14. Giám sát Runtime với Falco, Container Immutability & Forensics

> Viết/tùy chỉnh Falco rules phát hiện truy cập trái phép, cấu hình readOnlyRootFilesystem: true + emptyDir, điều tra sự cố bằng crictl và cô lập Pod bị xâm nhập.
> **Số câu hỏi:** 6 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

You are writing a custom Falco rule to detect when any container spawns an interactive shell (sh or bash) and want the alert output to include the Kubernetes Pod name and Namespace. Which Falco output fields should be used?

- **A.** %docker.pod.name and %docker.ns.name
- **B.** %pod.metadata.name and %pod.metadata.namespace
- **C.** %k8s.pod.name and %k8s.ns.name
- **D.** %kube.pod and %kube.namespace

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn đang viết một Falco rule tùy chỉnh để phát hiện khi bất kỳ container nào mở một shell tương tác (sh hoặc bash) và muốn thông báo cảnh báo đính kèm tên Pod cùng Namespace Kubernetes. Nên sử dụng các trường output nào của Falco?

**Đáp án đúng:** **C**

Falco sử dụng bộ trường %k8s.pod.name, %k8s.ns.name, %container.name, %proc.name, %proc.cmdline, %fd.name để cung cấp ngữ cảnh chi tiết cho đội ngũ SOC/forensics.

- **A:** Sai. Không tồn tại các trường %docker.pod.name trong Falco.
- **B:** Sai. Đây là cú pháp trường của Kubernetes YAML, không phải field name hợp lệ trong Falco.
- **C (Đúng):** Chính xác! Trong Falco, %k8s.pod.name xuất tên Pod và %k8s.ns.name xuất tên Namespace (cùng các trường phổ biến như %container.id, %proc.cmdline, %user.name).
- **D:** Sai. Tiền tố đúng của Falco cho metadata Kubernetes là k8s.*.

</details>

### Câu 2 `medium`

To enforce container immutability at runtime so an attacker cannot modify application binaries or drop malware scripts onto the container's root filesystem, which securityContext setting should be applied?

- **A.** terminationGracePeriodSeconds: 0 on the Pod spec to kill modified containers immediately.
- **B.** allowPrivilegeEscalation: true with an emptyDir volume mounted over the container root.
- **C.** imagePullPolicy: Always on the container spec to re-verify image layers on restart.
- **D.** readOnlyRootFilesystem: true (with emptyDir volumes mounted only for required writable paths like /tmp).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Để thực thi tính bất biến của container khi chạy (runtime) sao cho kẻ tấn công không thể sửa đổi binary ứng dụng hoặc thả các script mã độc vào root filesystem của container, nên áp dụng thiết lập securityContext nào?

**Đáp án đúng:** **D**

Container bất biến (Immutable Containers) sử dụng readOnlyRootFilesystem: true kết hợp chạy non-root giúp vô hiệu hóa phần lớn kỹ thuật persistence và dropper malware tại runtime.

- **A:** Sai. Tham số này chỉ quy định thời gian chờ khi tắt Pod.
- **B:** Sai. allowPrivilegeEscalation: true làm giảm bảo mật và không khóa quyền ghi lên root filesystem.
- **C:** Sai. imagePullPolicy chỉ điều khiển việc tải image từ registry khi khởi tạo Pod, không làm filesystem trở nên bất biến.
- **D (Đúng):** Chính xác! readOnlyRootFilesystem: true biến toàn bộ root filesystem của container thành chỉ đọc, ngăn chặn ghi file độc hại; nếu app cần thư mục tạm thì mount riêng emptyDir.

</details>

### Câu 3 `hard`

Falco alerts that a compromised Pod in the 'web' namespace is running a crypto-miner binary from /tmp/xmrig. Which TWO immediate incident-response steps preserve forensic evidence while containing the threat? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Disable Falco rules temporarily on the worker node to reduce noise in journalctl.
- **B.** Capture runtime evidence such as running processes, network connections, and logs (kubectl logs / crictl inspect) before deleting or scaling down the Pod.
- **C.** Immediately run kubectl delete pod --grace-period=0 --force before collecting any logs or process state.
- **D.** Apply a deny-all NetworkPolicy to isolate the compromised Pod from external C2 servers and other cluster Pods.
- **E.** Restart the entire Kubernetes worker node immediately to clear /tmp inside the container.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Falco cảnh báo rằng một Pod bị xâm nhập trong namespace 'web' đang chạy một binary đào tiền ảo từ /tmp/xmrig. HAI bước ứng phó sự cố ngay lập tức nào giúp bảo toàn bằng chứng điều tra số (forensic evidence) trong khi vẫn cô lập được mối đe dọa? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, D**

Quy trình ứng phó sự cố (Incident Response & Forensics) chuẩn CKS: Cô lập (NetworkPolicy / cordon) -> Thu thập bằng chứng (logs, proc, /proc/<pid>/exe, audit log) -> Loại bỏ (delete Pod / rotate Secrets bị lộ).

- **A:** Sai. Tắt công cụ phát hiện khi đang có sự cố xâm nhập sẽ làm mất tầm nhìn giám sát.
- **B (Đúng):** Chính xác! Nếu xóa Pod ngay lập tức, toàn bộ dữ liệu bộ nhớ, filesystem tạm và log container sẽ bị mất, gây khó khăn cho điều tra nguyên nhân gốc.
- **C:** Sai. Xóa cưỡng bức ngay lập tức sẽ tiêu hủy bằng chứng forensics quan trọng.
- **D (Đúng):** Chính xác! Cô lập mạng bằng NetworkPolicy cắt đứt kết nối tới máy chủ C2 và ngăn lây lan ngang (lateral movement) mà không làm mất trạng thái tiến trình trong bộ nhớ.
- **E:** Sai. Reboot node làm gián đoạn các workload sạch khác và xóa sạch bằng chứng volatile.

</details>

### Câu 4 `medium`

You want to customize a Falco rule on a worker node to alert whenever any container opens /etc/shadow for reading, and include the Kubernetes Pod name and namespace in the alert output. Where should you place the rule and which output fields should you use?

- **A.** Create a Kubernetes ConfigMap named falco-rules in the default namespace and use %evt.pod and %evt.ns in the output.
- **B.** Add the rule to /etc/falco/falco_rules.local.yaml and include %k8s.pod.name and %k8s.ns.name in the output string.
- **C.** Modify /etc/falco/falco.yaml directly and use %pod.id and %namespace.id in the output string.
- **D.** Edit /etc/kubernetes/audit/policy.yaml to match fd.name = /etc/shadow at RequestResponse level.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn muốn tùy chỉnh một Falco rule trên worker node để cảnh báo mỗi khi bất kỳ container nào mở /etc/shadow để đọc, và đính kèm tên Pod cùng namespace Kubernetes trong thông báo cảnh báo. Bạn nên đặt rule ở đâu và sử dụng các trường output nào?

**Đáp án đúng:** **B**

Falco rules tùy chỉnh luôn được đặt tại /etc/falco/falco_rules.local.yaml (kiểm tra cú pháp bằng 'falco -V'), sử dụng các field chuẩn như %evt.time, %user.uid, %proc.name, %k8s.pod.name và %k8s.ns.name.

- **A:** Sai. Khi Falco chạy dạng systemd service trên Node, nó đọc file cục bộ trên Host, và không tồn tại trường %evt.pod.
- **B (Đúng):** Chính xác! Mọi tùy chỉnh hoặc ghi đè Falco rule phải đặt trong /etc/falco/falco_rules.local.yaml để tránh bị ghi đè khi nâng cấp, và sử dụng các trường %k8s.pod.name, %k8s.ns.name để in ngữ cảnh Kubernetes.
- **C:** Sai. falco.yaml là file cấu hình daemon (output channels, log level), không phải nơi viết rules, và tên trường Kubernetes trong Falco là %k8s.pod.name và %k8s.ns.name.
- **D:** Sai. Kubernetes Audit Policy chỉ theo dõi lời gọi Kubernetes API, không theo dõi system call mở file (/etc/shadow) bên trong container.

</details>

### Câu 5 `medium`

A web application container is hardened with 'readOnlyRootFilesystem: true' to ensure container immutability at runtime. However, the container crashes on startup because NGINX tries to write temporary files to '/var/cache/nginx' and '/var/run'. How do you fix this while preserving immutability?

- **A.** Mount the worker host's /var/run directory into the container using a hostPath volume.
- **B.** Remove readOnlyRootFilesystem: true so NGINX can write temporary files anywhere on the container filesystem.
- **C.** Keep readOnlyRootFilesystem: true and mount emptyDir volumes at /var/cache/nginx and /var/run.
- **D.** Set privileged: true on the container securityContext to bypass the read-only filesystem.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một container ứng dụng web được tăng cường bảo mật với 'readOnlyRootFilesystem: true' để đảm bảo tính bất biến của container khi chạy (runtime). Tuy nhiên, container bị crash khi khởi động vì NGINX cố ghi các tệp tạm vào '/var/cache/nginx' và '/var/run'. Làm thế nào để khắc phục lỗi này mà vẫn giữ được tính bất biến?

**Đáp án đúng:** **C**

Mẫu chuẩn cho Immutable Container: bật securityContext.readOnlyRootFilesystem: true và chỉ cấp quyền ghi hạn chế vào các đường dẫn tạm cụ thể thông qua emptyDir volumes.

- **A:** Sai nghiêm trọng! Mount /var/run của máy chủ Host vào container có thể làm lộ socket containerd/docker và dẫn tới chiếm quyền toàn bộ Node.
- **B:** Sai. Gỡ bỏ readOnlyRootFilesystem: true sẽ phá vỡ tính bất biến, cho phép kẻ tấn công tải mã độc hoặc sửa tệp hệ thống khi container đang chạy.
- **C (Đúng):** Chính xác! Giữ nguyên readOnlyRootFilesystem: true và mount các volume tạm emptyDir vào đúng những thư mục ứng dụng cần ghi giúp giữ nguyên tính bất biến của toàn bộ hệ thống tệp gốc.
- **D:** Sai. privileged: true làm mất hoàn toàn tính bảo mật của container.

</details>

### Câu 6 `hard`

Falco alerts that a running Pod 'web-7c9d' in the 'prod' namespace is spawning an unexpected process making outbound connections to a suspected command-and-control server. You want to preserve forensic evidence before terminating the workload. Which TWO steps should you take first? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Inspect container runtime details, PID, /proc/<pid>/fd, and /proc/<pid>/exe on the node using crictl, and review Kubernetes Audit Logs.
- **B.** Immediately delete the Pod using 'kubectl delete pod web-7c9d -n prod --force --grace-period=0' before collecting any logs.
- **C.** Immediately restart the worker node using 'systemctl reboot' to clear all suspicious processes from memory.
- **D.** Disable the Falco systemd service on the worker node to reduce CPU load during the investigation.
- **E.** Isolate the compromised Pod using a deny-all Ingress and Egress NetworkPolicy (or remove Service selector labels) without deleting it.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Falco cảnh báo rằng một Pod đang chạy 'web-7c9d' trong namespace 'prod' đang sinh ra một tiến trình bất thường thực hiện kết nối ra ngoài tới một máy chủ bị nghi ngờ là command-and-control. Bạn muốn bảo toàn bằng chứng điều tra số (forensic evidence) trước khi chấm dứt workload. Bạn nên thực hiện HAI bước nào trước tiên? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, E**

Quy trình phản ứng sự cố (Incident Response & Forensics) chuẩn CKS: Cô lập mạng trước (NetworkPolicy) để cắt kết nối độc hại → Thu thập bằng chứng (crictl, /proc, Audit Logs) → Xử lý nguyên nhân gốc rễ (Deployment/Image/RBAC) rồi mới xóa workload.

- **A (Đúng):** Chính xác! Thu thập bằng chứng qua crictl inspect, /proc/<pid> và kiểm tra Kubernetes Audit Logs giúp xác định kẻ tấn công đã vào bằng cách nào và tránh tái nhiễm.
- **B:** Sai. Xóa cưỡng bức ngay lập tức sẽ làm mất sạch bằng chứng trong bộ nhớ/container, và nếu Pod thuộc Deployment thì Kubernetes sẽ lập tức tạo lại Pod mới có cùng lỗ hổng.
- **C:** Sai. Khởi động lại Node làm gián đoạn các workload lành mạnh khác và xóa mất bằng chứng điều tra.
- **D:** Sai. Không bao giờ tắt công cụ giám sát runtime khi đang xảy ra sự cố xâm nhập.
- **E (Đúng):** Chính xác! Cô lập mạng bằng NetworkPolicy giúp cắt đứt ngay kết nối C2 và ngăn lây lan sang các Pod khác trong khi vẫn giữ nguyên trạng thái bộ nhớ/tiến trình để điều tra (forensics).

</details>

---

[Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md)
