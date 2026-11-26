# Bài tập tình huống — 10. Cô lập Lưu lượng Mạng với NetworkPolicy (Ingress & Egress)

> Thiết kế Default Deny, phân biệt logic AND vs OR giữa podSelector và namespaceSelector, mở cổng DNS Egress (UDP/TCP 53) và dùng nhãn kubernetes.io/metadata.name.
> **Số câu hỏi:** 5 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

An administrator applies a default-deny Egress `NetworkPolicy` (`policyTypes: ["Egress"]` with an empty `egress: []`) to all Pods in the `secure` namespace. Later, the administrator adds an Egress rule allowing TCP port 443 to `10.96.0.0/12`, but applications inside the `secure` namespace still fail whenever they try to connect to services by hostname (`https://payment-svc.default.svc.cluster.local`). Why are hostname connections failing?

- **A.** The Egress `NetworkPolicy` blocks DNS resolution because it does not allow outbound UDP and TCP traffic on port 53 to the `CoreDNS` (`kube-dns`) Pods.
- **B.** Kubernetes `NetworkPolicy` does not support filtering egress traffic on TCP port 443 without an external CNI plugin like Cilium.
- **C.** `CoreDNS` only resolves cross-namespace service names over ICMP ping packets rather than standard TCP/UDP sockets.
- **D.** The `secure` namespace must be labeled or renamed to `kube-public` before CoreDNS will answer queries from its Pods.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Quản trị viên áp dụng một Egress `NetworkPolicy` chặn mặc định (`policyTypes: ["Egress"]` với `egress: []` rỗng) cho tất cả Pod trong namespace `secure`. Sau đó, quản trị viên thêm một quy tắc Egress cho phép cổng TCP 443 tới `10.96.0.0/12`, nhưng các ứng dụng bên trong namespace `secure` vẫn thất bại mỗi khi cố kết nối tới service bằng hostname (`https://payment-svc.default.svc.cluster.local`). Tại sao các kết nối bằng hostname lại thất bại?

**Đáp án đúng:** **A**

Bẫy kinh điển khi viết **Egress NetworkPolicy** trong CKA: Hễ đề bài yêu cầu giới hạn Egress nhưng Pod vẫn cần gọi theo tên miền -> Luôn nhớ mở thêm cổng **53 (UDP & TCP)** cho DNS!

- **A (Đúng):** Đúng! Khi bật `policyTypes: ["Egress"]`, mọi kết nối đi ra (kể cả truy vấn DNS tới CoreDNS ở cổng 53) đều bị chặn trừ khi bạn thêm rule cho phép cổng **UDP 53 và TCP 53** trong mục `egress`.
- **B:** Sai vì `NetworkPolicy` hỗ trợ mọi cổng TCP, UDP và SCTP.
- **C:** Sai vì DNS hoạt động trên cổng UDP 53 và TCP 53.
- **D:** Sai vì tên namespace không ảnh hưởng đến việc mở cổng DNS.

</details>

### Câu 2 `hard`

You apply an Egress `NetworkPolicy` to all Pods in namespace `app` that only allows TCP traffic to `10.20.0.0/16` on port `443`. Immediately afterward, Pods in `app` fail to resolve external and internal Service hostnames like `db.data.svc.cluster.local`. What is the root cause?

- **A.** Egress NetworkPolicies automatically disable `kube-proxy` iptables and IPVS rules on all worker nodes in the cluster.
- **B.** CoreDNS Pods require `hostNetwork: true` and dedicated node taints whenever Egress NetworkPolicies are enabled in a namespace.
- **C.** The CIDR `10.20.0.0/16` conflicts with the ClusterIP service range, causing CoreDNS to drop all lookup requests.
- **D.** Enabling an Egress `NetworkPolicy` blocks all unlisted egress traffic by default, including UDP/TCP port 53 to `kube-dns` (CoreDNS).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn áp dụng một Egress `NetworkPolicy` cho tất cả các Pod trong namespace `app` chỉ cho phép lưu lượng TCP tới `10.20.0.0/16` trên cổng `443`. Ngay sau đó, các Pod trong `app` không thể phân giải được các hostname Service bên ngoài và nội bộ như `db.data.svc.cluster.local`. Nguyên nhân gốc rễ là gì?

**Đáp án đúng:** **D**

Khi viết Egress `NetworkPolicy`, luôn phải thêm rule cho phép cổng **UDP 53 và TCP 53** tới `kube-dns` (trong `kube-system`) nếu Pod cần phân giải tên miền.

- **A:** Sai vì NetworkPolicy không tắt `kube-proxy`.
- **B:** Sai vì CoreDNS chạy trên Pod network bình thường và không yêu cầu `hostNetwork: true`.
- **C:** Sai vì ngay cả khi CIDR không xung đột, việc thiếu rule mở cổng 53 vẫn làm lỗi DNS.
- **D (Đúng):** Đúng! Khi `policyTypes` có `Egress`, mọi kết nối đi ra không được liệt kê (bao gồm cổng UDP/TCP 53 tới CoreDNS) đều bị chặn, khiến Pod không phân giải được DNS.

</details>

### Câu 3 `easy`

Which `NetworkPolicy` manifest denies all incoming (Ingress) traffic to all Pods in the `restricted` namespace?

- **A.** metadata.namespace: restricted, spec.podSelector: {}, spec.policyTypes: ["Ingress"] (with no `ingress` rules)
- **B.** metadata.namespace: restricted, spec.podSelector: null, spec.ingress: [{}] (allowing all sources)
- **C.** metadata.namespace: restricted, spec.podSelector: {}, spec.action: Deny, spec.priority: 100
- **D.** metadata.namespace: restricted, spec.podSelector: {}, spec.policyTypes: ["Egress"] (with no `egress` rules)

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Manifest `NetworkPolicy` nào từ chối toàn bộ lưu lượng đi vào (Ingress) tới tất cả các Pod trong namespace `restricted`?

**Đáp án đúng:** **A**

Mẫu Default Deny Ingress chuẩn: `spec.podSelector: {}` và `spec.policyTypes: ["Ingress"]` (không khai báo mảng `ingress:`).

- **A (Đúng):** Đúng! `podSelector: {}` chọn mọi Pod trong namespace `restricted`, `policyTypes: ["Ingress"]` và bỏ trống `ingress:` tạo ra chính sách Default Deny All Ingress.
- **B:** Sai vì `ingress: [{}]` có nghĩa là cho phép TẤT CẢ lưu lượng đi vào.
- **C:** Sai vì `NetworkPolicy` chuẩn của Kubernetes không có trường `spec.action`.
- **D:** Sai vì `policyTypes: ["Egress"]` chỉ chặn lưu lượng đi ra (Egress), không chặn lưu lượng đi vào (Ingress).

</details>

### Câu 4 `medium`

Which `namespaceSelector` label is automatically present on every Kubernetes namespace (v1.21+) so you can reference a namespace by name in a `NetworkPolicy` without manually labeling it?

- **A.** app.kubernetes.io/namespace
- **B.** kubernetes.io/metadata.namespace
- **C.** kubernetes.io/metadata.name
- **D.** kube-system.kubernetes.io/name

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Label `namespaceSelector` nào tự động có mặt trên mọi Kubernetes namespace (từ v1.21 trở lên) để bạn có thể tham chiếu một namespace theo tên trong `NetworkPolicy` mà không cần gắn label thủ công?

**Đáp án đúng:** **C**

Dùng `kubernetes.io/metadata.name: <ns-name>` trong `namespaceSelector.matchLabels` là mẹo cực kỳ hữu ích khi làm bài thi CKA về `NetworkPolicy`.

- **A:** Sai vì đây là nhãn quy ước do người dùng tự gắn, không phải nhãn hệ thống tự động.
- **B:** Sai vì đây không phải là key nhãn tự động trên đối tượng Namespace.
- **C (Đúng):** Đúng! Từ Kubernetes 1.21+, mọi namespace đều tự động có nhãn `kubernetes.io/metadata.name: <namespace-name>`.
- **D:** Sai vì không tồn tại nhãn mặc định này trên Namespace.

</details>

### Câu 5 `hard`

In a `NetworkPolicy` targeting the `database` Pod in the `prod` namespace, an administrator wants to allow incoming traffic on TCP port 5432 ONLY IF the traffic originates from Pods that match BOTH conditions simultaneously: (1) the source namespace has label `env=prod` AND (2) the source Pod has label `role=backend`. How should the `ingress.from` section be written in the YAML manifest?

- **A.** Use `kubectl expose pod database --port=5432 --type=ClusterIP` with label selectors instead of creating a NetworkPolicy.
- **B.** Place `- namespaceSelector` and `- podSelector` as TWO separate list items (two leading hyphens `-`) inside `spec.ingress.from`.
- **C.** Place `namespaceSelector` and `podSelector` inside the SAME list item (a single leading hyphen `-` before `namespaceSelector`).
- **D.** Set `policyTypes: ["Egress"]`, omit the `ingress` field, and specify `podSelector` matching `role=backend` under `egress.to`.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong một `NetworkPolicy` nhắm tới Pod `database` ở namespace `prod`, quản trị viên muốn cho phép lưu lượng đi vào (incoming traffic) trên cổng TCP 5432 CHỈ KHI lưu lượng xuất phát từ các Pod thỏa mãn ĐỒNG THỜI CẢ HAI điều kiện: (1) namespace nguồn có label `env=prod` VÀ (2) Pod nguồn có label `role=backend`. Phần `ingress.from` trong YAML manifest cần được viết như thế nào?

**Đáp án đúng:** **C**

Cú pháp bẫy kinh điển nhất trong đề CKA về `NetworkPolicy`:
- **Cùng 1 dấu `-` (AND)**:
  ```yaml
  from:
  - namespaceSelector:
      matchLabels: { env: prod }
    podSelector:
      matchLabels: { role: backend }
  ```
- **Hai dấu `-` riêng (OR)**: Chỉ cần khớp 1 trong 2 điều kiện.

- **A:** Sai vì `kubectl expose` chỉ tạo Service chứ không giới hạn quyền truy cập mạng giữa các Pod.
- **B:** Sai vì hai phần tử danh sách riêng biệt (`- namespaceSelector` rồi `- podSelector`) sẽ tạo phép toán logic OR (chấp nhận mọi Pod trong namespace `env=prod` HOẶC mọi Pod `role=backend` trong cùng namespace hiện tại).
- **C (Đúng):** Đúng! Trong NetworkPolicy, đặt `namespaceSelector` và `podSelector` chung trong 1 phần tử của mảng `from` sẽ tạo phép toán logic AND (phải thỏa mãn đồng thời cả hai điều kiện).
- **D:** Sai vì yêu cầu là kiểm soát lưu lượng đi vào (Ingress) tới Pod `database`.

</details>

---

[Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md)
