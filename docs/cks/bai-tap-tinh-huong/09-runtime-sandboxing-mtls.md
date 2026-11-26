# Bài tập tình huống — 9. Sandboxing Workload (gVisor/Kata) & mTLS (Istio/Cilium)

> Cô lập workload không đáng tin cậy bằng RuntimeClass (gVisor runsc / Kata Containers) và mã hóa lưu lượng Pod-to-Pod bằng mTLS STRICT với Istio/Cilium.
> **Số câu hỏi:** 4 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

You need to isolate untrusted multi-tenant workloads using gVisor so they do not share the host Linux kernel directly. A RuntimeClass named 'gvisor' with handler 'runsc' already exists in the cluster. How do you schedule a Pod to use this sandbox?

- **A.** Set spec.containers[0].imagePullPolicy: runsc.
- **B.** Set spec.runtimeClassName: gvisor in the Pod specification.
- **C.** Add the annotation container.runtime/class: runsc to Pod metadata.
- **D.** Add securityContext.seccompProfile.type: gvisor to the container.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn cần cô lập các workload đa người dùng (multi-tenant) không đáng tin cậy bằng gVisor để chúng không dùng chung trực tiếp Linux kernel của host. Một RuntimeClass tên 'gvisor' với handler 'runsc' đã tồn tại trong cluster. Làm thế nào để bạn lập lịch một Pod sử dụng sandbox này?

**Đáp án đúng:** **B**

RuntimeClass cho phép chọn container runtime thay thế (gVisor 'runsc' hoặc Kata Containers 'kata') ở mức Pod thông qua trường spec.runtimeClassName.

- **A:** Sai. imagePullPolicy chỉ nhận giá trị Always, IfNotPresent hoặc Never.
- **B (Đúng):** Chính xác! Trường spec.runtimeClassName: gvisor chỉ định kubelet sử dụng handler runsc (gVisor) đã khai báo trong RuntimeClass tương ứng.
- **C:** Sai. Kubernetes sử dụng trường chính thức spec.runtimeClassName, không dùng annotation.
- **D:** Sai. seccompProfile không có giá trị gvisor.

</details>

### Câu 2 `medium`

In an Istio service mesh, you want to enforce mutual TLS (mTLS) strictly across all workloads in the 'payments' namespace so plaintext Pod-to-Pod traffic is rejected. Which resource and mode should you apply?

- **A.** A Kubernetes NetworkPolicy in 'payments' with spec.mtls.mode set to STRICT.
- **B.** A PeerAuthentication resource in 'payments' with spec.mtls.mode: PERMISSIVE for all workloads.
- **C.** A VirtualService in 'payments' with trafficPolicy.tls.mode set to DISABLE.
- **D.** A PeerAuthentication resource in the 'payments' namespace with spec.mtls.mode: STRICT.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong một Istio service mesh, bạn muốn thực thi nghiêm ngặt mutual TLS (mTLS) trên tất cả các workload trong namespace 'payments' để lưu lượng Pod-to-Pod dạng plaintext bị từ chối. Bạn nên áp dụng tài nguyên và mode nào?

**Đáp án đúng:** **D**

Mã hóa Pod-to-Pod (mTLS) bằng Service Mesh (Istio PeerAuthentication STRICT) hoặc CNI (Cilium WireGuard/IPsec) là trọng tâm quan trọng trong Domain 4 CKS.

- **A:** Sai. NetworkPolicy chuẩn của Kubernetes chỉ lọc L3/L4 (IP/Port), không hỗ trợ cấu hình mTLS.
- **B:** Sai. Chế độ PERMISSIVE vẫn cho phép cả lưu lượng plaintext lẫn mTLS.
- **C:** Sai. VirtualService điều khiển định tuyến L7, không dùng để ép buộc mTLS ở mức xác thực peer.
- **D (Đúng):** Chính xác! PeerAuthentication với mtls.mode: STRICT trong namespace 'payments' bắt buộc mọi kết nối tới workload trong namespace này phải dùng mTLS.

</details>

### Câu 3 `medium`

Your organization runs untrusted multi-tenant code submitted by external users inside Kubernetes Pods. Standard Linux namespaces and cgroups are deemed insufficient because all containers still share the same host Linux kernel. Which Kubernetes feature should you implement to strongly isolate these workloads?

- **A.** Mount a ConfigMap containing iptables firewall rules into each untrusted application Pod.
- **B.** Enable Pod Security Admission at the 'baseline' level across all multi-tenant namespaces.
- **C.** Define a RuntimeClass backed by gVisor (runsc) or Kata Containers, and reference it via spec.runtimeClassName in the Pod.
- **D.** Create a separate Namespace and ResourceQuota for each untrusted user to isolate Linux kernel syscalls and cgroup resource limits.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Tổ chức của bạn chạy mã đa người dùng (multi-tenant) không đáng tin cậy do người dùng bên ngoài gửi lên bên trong các Kubernetes Pod. Linux namespaces và cgroups tiêu chuẩn được coi là chưa đủ vì tất cả container vẫn dùng chung cùng một Linux kernel của host. Bạn nên triển khai tính năng Kubernetes nào để cô lập mạnh mẽ các workload này?

**Đáp án đúng:** **C**

Container Sandboxing bằng RuntimeClass (gVisor/runsc hoặc Kata Containers) tạo thêm một lớp ranh giới bảo mật (user-space kernel hoặc micro-VM) giữa ứng dụng không tin cậy và Host OS kernel.

- **A:** Sai. ConfigMap không có tác dụng cô lập tiến trình container khỏi nhân hệ điều hành.
- **B:** Sai. PSS baseline chỉ chặn các cấu hình nguy hiểm rõ ràng như privileged/hostPath, không cung cấp lớp kernel sandbox cho code không tin cậy.
- **C (Đúng):** Chính xác! RuntimeClass cho phép chạy Pod trên các sandboxed runtime như gVisor (user-space kernel chặn syscall) hoặc Kata Containers (micro-VM riêng biệt), giúp cô lập mạnh mẽ khỏi nhân Linux của máy chủ Host.
- **D:** Sai. Kubernetes Namespace chỉ cô lập logic trên Control Plane; các container vẫn dùng chung một Linux kernel trên Worker Node.

</details>

### Câu 4 `medium`

A compliance mandate requires all Pod-to-Pod network traffic inside the 'checkout' namespace to be mutually authenticated and encrypted in transit (mTLS), rejecting any plaintext connections. Which TWO approaches can enforce strict mTLS between Pods? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Use Cilium with transparent encryption (WireGuard/IPsec) or Cilium Service Mesh mTLS authentication policies across workloads.
- **B.** Configure an Ingress resource with spec.tls pointing to a TLS Secret in 'checkout'.
- **C.** Enable Istio sidecar injection on the 'checkout' namespace and apply an Istio PeerAuthentication resource with mtls.mode set to STRICT.
- **D.** Enable EncryptionConfiguration with aescbc provider on kube-apiserver for etcd.
- **E.** Apply a default-deny-ingress NetworkPolicy on the 'checkout' namespace to encrypt traffic.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một yêu cầu tuân thủ đòi hỏi toàn bộ lưu lượng mạng Pod-to-Pod bên trong namespace 'checkout' phải được xác thực hai chiều và mã hóa khi truyền tải (mTLS), từ chối mọi kết nối plaintext. HAI cách tiếp cận nào có thể thực thi mTLS nghiêm ngặt giữa các Pod? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, C**

Mã hóa lưu lượng East-West (Pod-to-Pod) bằng mTLS được triển khai thông qua Service Mesh như Istio (PeerAuthentication STRICT) hoặc CNI hiện đại như Cilium (WireGuard/mTLS).

- **A (Đúng):** Chính xác! Cilium cung cấp mã hóa minh bạch ở tầng mạng (WireGuard/IPsec) và xác thực mTLS cấp dịch vụ (SPIFFE) dựa trên eBPF mà không cần sidecar.
- **B:** Sai. Ingress TLS chỉ mã hóa lưu lượng từ client bên ngoài vào Ingress Controller (North-South), không mã hóa lưu lượng Pod-to-Pod (East-West).
- **C (Đúng):** Chính xác! Istio sidecar proxy (Envoy) kết hợp với PeerAuthentication ở chế độ STRICT buộc mọi kết nối Pod-to-Pod trong namespace phải dùng mTLS và từ chối lưu lượng bản rõ.
- **D:** Sai. EncryptionConfiguration chỉ mã hóa dữ liệu nghỉ (Secrets) trong etcd, không mã hóa lưu lượng mạng giữa các Pod.
- **E:** Sai. NetworkPolicy chỉ cho phép hoặc chặn gói tin ở Layer 3/4, không thực hiện mã hóa hay xác thực mTLS.

</details>

---

[Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md)
