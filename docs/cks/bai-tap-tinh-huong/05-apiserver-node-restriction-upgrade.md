# Bài tập tình huống — 5. Gia cố API Server, NodeRestriction & Nâng cấp An toàn

> Tắt anonymous-auth, bật authorization-mode=Node,RBAC và admission plugin NodeRestriction, bảo mật kubelet API và quy trình nâng cấp cụm an toàn.
> **Số câu hỏi:** 3 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

Which kube-apiserver flag ensures that each kubelet can only modify Node and Pod objects associated with its own node name, preventing a compromised node from altering Pods on other nodes?

- **A.** --service-account-lookup=false --tls
- **B.** --authorization-mode=Node,RBAC,AlwaysAllow,Webhook
- **C.** --enable-admission-plugins=NodeRestriction
- **D.** --enable-bootstrap-token-auth=true

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Cờ (flag) nào của kube-apiserver đảm bảo rằng mỗi kubelet chỉ có thể sửa đổi các đối tượng Node và Pod gắn với tên node của chính nó, ngăn chặn một node bị xâm nhập sửa đổi các Pod trên các node khác?

**Đáp án đúng:** **C**

Kết hợp --authorization-mode=Node,RBAC cùng admission plugin NodeRestriction giúp cô lập thiệt hại nếu một worker node bị xâm nhập, ngăn node đó sửa label hoặc Pod của node khác.

- **A:** Sai. Cờ này liên quan đến kiểm tra tồn tại của ServiceAccount token trong etcd và cần luôn bật true.
- **B:** Sai. AlwaysAllow bỏ qua hoàn toàn kiểm tra phân quyền, cực kỳ nguy hiểm.
- **C (Đúng):** Chính xác! Admission plugin NodeRestriction giới hạn quyền của kubelet, chỉ cho phép cập nhật đối tượng Node của chính nó và các Pod đang chạy trên node đó.
- **D:** Sai. Cờ này dùng cho quá trình kubeadm join node mới bằng bootstrap token, không giới hạn quyền sửa Pod của kubelet.

</details>

### Câu 2 `medium`

Before upgrading a worker node from Kubernetes v1.29 to v1.30 using kubeadm, which command safely evicts running Pods and marks the node unschedulable?

- **A.** kubectl cordon <node-name> --force --evict-all-pods
- **B.** kubectl taint nodes <node-name> upgrade=true:NoSchedule --overwrite=true
- **C.** kubectl delete node <node-name> --grace-period=0 --force
- **D.** kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trước khi nâng cấp một worker node từ Kubernetes v1.29 lên v1.30 bằng kubeadm, lệnh nào evict an toàn các Pod đang chạy và đánh dấu node là unschedulable?

**Đáp án đúng:** **D**

Quy trình nâng cấp node chuẩn trong Kubernetes: kubectl drain -> nâng cấp kubeadm/kubelet/kubectl -> restart kubelet -> kubectl uncordon.

- **A:** Sai. kubectl cordon chỉ ngăn Pod mới lập lịch vào node, không di dời các Pod đang chạy.
- **B:** Sai. Taint NoSchedule không đẩy các Pod hiện đang chạy ra khỏi node.
- **C:** Sai. Xóa đối tượng Node sẽ làm gián đoạn trạng thái cụm và mất đăng ký node thay vì nâng cấp an toàn.
- **D (Đúng):** Chính xác! kubectl drain vừa đánh dấu node unschedulable (cordon) vừa evict các Pod an toàn sang node khác (tôn trọng PodDisruptionBudget).

</details>

### Câu 3 `hard`

Why should the 'NodeRestriction' admission plugin be enabled alongside '--authorization-mode=Node,RBAC' on kube-apiserver?

- **A.** It automatically drains worker nodes whenever a Pod fails its livenessProbe or exceeds memory limits.
- **B.** It blocks container images with CRITICAL CVEs from being pulled by kubelet during Pod admission.
- **C.** It encrypts all network traffic between kubelet, kube-apiserver, and etcd using AES-CBC and mutual TLS client certificates.
- **D.** It restricts a compromised kubelet to modifying only its own Node and bound Pods, preventing lateral movement across nodes.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Tại sao admission plugin 'NodeRestriction' nên được bật cùng với '--authorization-mode=Node,RBAC' trên kube-apiserver?

**Đáp án đúng:** **D**

Kết hợp --authorization-mode=Node,RBAC với --enable-admission-plugins=NodeRestriction là chuẩn CIS Benchmark nhằm giới hạn thiệt hại nếu một Worker Node bị chiếm quyền điều khiển.

- **A:** Sai. NodeRestriction là admission controller bảo vệ API server khỏi kubelet bị xâm nhập, không thực hiện drain node.
- **B:** Sai. Kiểm duyệt container image là nhiệm vụ của ImagePolicyWebhook hoặc công cụ quét chuỗi cung ứng, không phải NodeRestriction.
- **C:** Sai. Kubelet không giao tiếp trực tiếp với etcd, và AES-CBC là cơ chế mã hóa dữ liệu nghỉ trong etcd.
- **D (Đúng):** Chính xác! Node Authorizer giới hạn quyền đọc/ghi cơ bản của kubelet, còn Admission Plugin NodeRestriction siết chặt hơn nữa: ngăn kubelet sửa nhãn bảo mật (như node-restriction.kubernetes.io/*) hoặc can thiệp vào Node/Pod của máy chủ khác.

</details>

---

[Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md)
