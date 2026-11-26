# Bài tập tình huống — 3. Bảo mật Cụm — RBAC, ServiceAccount, CSR & Kubeconfig

> Phân quyền Role, ClusterRole, RoleBinding, ClusterRoleBinding; kiểm tra quyền với kubectl auth can-i; phê duyệt CertificateSigningRequest (CSR) và cấu hình Kubeconfig multi-context.
> **Số câu hỏi:** 8 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A monitoring agent running under the `prometheus-sa` ServiceAccount in the `monitoring` namespace needs read-only permissions (`get`, `list`, `watch`) to view `nodes` and `persistentvolumes` across the ENTIRE Kubernetes cluster. Because `nodes` and `persistentvolumes` are cluster-scoped (non-namespaced) resources, which combination of RBAC objects must the administrator create?

- **A.** Create a namespaced `Role` granting `get,list,watch` on `nodes` and `persistentvolumes`, and bind it with a `RoleBinding` inside the `monitoring` namespace.
- **B.** Create a `ClusterRole` granting `get,list,watch` on `nodes` and `persistentvolumes`, and bind it using a namespaced `RoleBinding` in the `default` namespace.
- **C.** Create a `ClusterRole` granting `get,list,watch` on `nodes` and `persistentvolumes`, and bind it to `monitoring:prometheus-sa` using a `ClusterRoleBinding`.
- **D.** Create a `NetworkPolicy` and a `ServiceAccount` token projection inside the `monitoring` namespace to allow cross-namespace API server queries.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một monitoring agent chạy dưới ServiceAccount `prometheus-sa` trong namespace `monitoring` cần quyền chỉ đọc (`get`, `list`, `watch`) để xem `nodes` và `persistentvolumes` trên TOÀN BỘ Kubernetes cluster. Vì `nodes` và `persistentvolumes` là tài nguyên cấp cluster (không thuộc namespace), quản trị viên phải tạo tổ hợp các đối tượng RBAC nào?

**Đáp án đúng:** **C**

Để kiểm tra danh sách tài nguyên nào thuộc cấp cụm (non-namespaced), trong phòng thi bạn chạy:
`kubectl api-resources --namespaced=false`
Với mọi tài nguyên `namespaced=false` (`nodes`, `pv`, `storageclasses`, `namespaces`), bắt buộc dùng **`ClusterRole` + `ClusterRoleBinding`**.

- **A:** Sai vì `Role` và `RoleBinding` chỉ cấp quyền được cho các tài nguyên nằm bên trong 1 namespace cụ thể, không thể cấp quyền trên tài nguyên cấp cụm như `nodes` hay `persistentvolumes`.
- **B:** Sai vì gắn `ClusterRole` bằng `RoleBinding` vẫn chỉ giới hạn phạm vi quyền trong namespace đó, không truy cập được tài nguyên cấp cụm như `nodes`.
- **C (Đúng):** Đúng! Các tài nguyên cấp cụm (`nodes`, `persistentvolumes`, `namespaces`, `storageclasses`) không thuộc namespace nào nên bắt buộc phải dùng **`ClusterRole`** kết hợp với **`ClusterRoleBinding`**.
- **D:** Sai vì `NetworkPolicy` kiểm soát kết nối mạng giữa các Pod chứ không phân quyền gọi Kubernetes API.

</details>

### Câu 2 `medium`

After configuring RBAC roles for a user named `jane`, an administrator wants to quickly verify from the command line whether `jane` is authorized to delete `pods` in the `production` namespace. Which `kubectl` command performs this check?

- **A.** `kubectl get rbac -n production --field-selector=subject=jane`
- **B.** `kubectl describe user jane --namespace=production --show-rbac`
- **C.** `kubectl config use-context jane && kubectl get pods -n production`
- **D.** `kubectl auth can-i delete pods -n production --as=jane`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Sau khi cấu hình các role RBAC cho người dùng tên `jane`, quản trị viên muốn kiểm tra nhanh từ dòng lệnh xem `jane` có được phép xóa `pods` trong namespace `production` hay không. Lệnh `kubectl` nào thực hiện kiểm tra này?

**Đáp án đúng:** **D**

Lệnh kiểm tra nhanh phân quyền RBAC trong kỳ thi CKA:
- Cho User: `kubectl auth can-i create deployments -n dev --as=jane`
- Cho ServiceAccount: `kubectl auth can-i list secrets -n dev --as=system:serviceaccount:dev:my-sa`

- **A:** Sai vì không có loại tài nguyên tên là `rbac`.
- **B:** Sai vì Kubernetes không có đối tượng tài nguyên `user` để `kubectl describe`.
- **C:** Sai vì lệnh này chỉ chuyển đổi context trong kubeconfig chứ không kiểm tra quyền của một hành động cụ thể.
- **D (Đúng):** Đúng! Lệnh `kubectl auth can-i <verb> <resource> -n <namespace> --as=<user>` trả về `yes` hoặc `no` ngay lập tức để kiểm tra phân quyền RBAC.

</details>

### Câu 3 `easy`

Which imperative command creates a `Role` named `pod-reader` in the `payments` namespace that allows `get`, `list`, and `watch` on Pods?

- **A.** kubectl create rolebinding pod-reader --verb=get,list,watch --resource=pods -n payments
- **B.** kubectl auth can-i create role pod-reader -n payments
- **C.** kubectl create role pod-reader --verb=get,list,watch --resource=pods -n payments
- **D.** kubectl create clusterrole pod-reader --verb=get,list,watch --resource=pods -n payments

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Lệnh imperative nào tạo một `Role` tên `pod-reader` trong namespace `payments` cho phép thực hiện `get`, `list` và `watch` trên Pods?

**Đáp án đúng:** **C**

Lệnh `kubectl create role <name> --verb=... --resource=... -n <ns>` giúp tạo nhanh `Role` trong kỳ thi CKA mà không cần viết YAML từ đầu.

- **A:** Sai vì `RoleBinding` dùng để gán `Role`/`ClusterRole` cho user/SA chứ không định nghĩa `--verb` và `--resource`.
- **B:** Sai vì `kubectl auth can-i` chỉ dùng để kiểm tra quyền chứ không tạo tài nguyên.
- **C (Đúng):** Đúng! Đây là cú pháp imperative chuẩn của `kubectl create role` với `--verb`, `--resource` và `-n`.
- **D:** Sai vì `ClusterRole` là tài nguyên cấp cụm, không thuộc namespace `payments`.

</details>

### Câu 4 `medium`

A user `alice` has submitted a `CertificateSigningRequest` named `alice-csr`. After running `kubectl certificate approve alice-csr`, how do you extract the signed client certificate into a file named `alice.crt`?

- **A.** kubectl get csr alice-csr -o jsonpath='{.spec.request}' | base64 -d > alice.crt
- **B.** kubectl get secret alice-csr -o jsonpath='{.data.tls\.crt}' | base64 -d > alice.crt
- **C.** kubectl cp kube-system/kube-apiserver:/etc/kubernetes/pki/ca.crt alice.crt
- **D.** kubectl get csr alice-csr -o jsonpath='{.status.certificate}' | base64 -d > alice.crt

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Người dùng `alice` đã gửi một `CertificateSigningRequest` tên `alice-csr`. Sau khi chạy `kubectl certificate approve alice-csr`, làm thế nào để bạn trích xuất client certificate đã ký vào tệp tên `alice.crt`?

**Đáp án đúng:** **D**

Sau khi `kubectl certificate approve <csr>`, chứng chỉ X.509 đã ký nằm tại `.status.certificate` (mã hóa base64). Giải mã bằng `base64 -d` để lấy file `.crt`.

- **A:** Sai vì `.spec.request` chứa yêu cầu CSR gốc chưa được ký chứ không phải chứng chỉ đã ký.
- **B:** Sai vì CSR không tự động tạo Secret tên `alice-csr`.
- **C:** Sai vì `ca.crt` là chứng chỉ gốc của CA chứ không phải client certificate của `alice`.
- **D (Đúng):** Đúng! Chứng chỉ đã ký được lưu ở dạng base64 trong trường `.status.certificate` của đối tượng CSR, cần decode bằng `base64 -d`.

</details>

### Câu 5 `hard`

An administrator created a `ServiceAccount` named `ci-bot` in namespace `cicd` and needs to grant it permissions to `get` and `list` `nodes` across the entire cluster. Which RBAC binding should be used?

- **A.** A `RoleBinding` in namespace `cicd` referencing a namespaced `Role` that grants `get, list` on `nodes`
- **B.** A `ClusterRoleBinding` referencing a `ClusterRole` that grants `get, list` on `nodes`
- **C.** A `RoleBinding` in namespace `kube-system` referencing a `ClusterRole` for `nodes`
- **D.** A `NetworkPolicy` in namespace `cicd` allowing `ci-bot` Pods to access API server port 6443

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Quản trị viên đã tạo một `ServiceAccount` tên `ci-bot` trong namespace `cicd` và cần cấp cho nó quyền `get` và `list` `nodes` trên toàn bộ cluster. Nên sử dụng RBAC binding nào?

**Đáp án đúng:** **B**

Với các tài nguyên cluster-scoped (`nodes`, `persistentvolumes`, `namespaces`, `clusterroles`), bắt buộc phải dùng `ClusterRole` + `ClusterRoleBinding`.

- **A:** Sai vì `Role` và `RoleBinding` chỉ có hiệu lực trong phạm vi một namespace, không áp dụng cho tài nguyên cấp cụm như `nodes`.
- **B (Đúng):** Đúng! `nodes` là tài nguyên cấp cụm (cluster-scoped), nên bắt buộc phải dùng `ClusterRole` kết hợp với `ClusterRoleBinding`.
- **C:** Sai vì `ClusterRole` kết hợp `RoleBinding` chỉ cấp quyền trong namespace của `RoleBinding` đó, không cấp quyền đọc `nodes` toàn cụm.
- **D:** Sai vì `NetworkPolicy` kiểm soát lưu lượng mạng tầng L3/L4, không phải phân quyền API RBAC.

</details>

### Câu 6 `medium`

How can an administrator verify whether the ServiceAccount `app-sa` in namespace `prod` is permitted to delete `secrets` in namespace `prod` without actually deleting any secret?

- **A.** kubectl describe serviceaccount app-sa -n prod --show-permissions
- **B.** kubectl delete secret --all --dry-run=server -n prod --as=app-sa
- **C.** kubectl auth can-i delete secrets -n prod --as=system:serviceaccount:prod:app-sa
- **D.** kubectl get rolebindings -n prod --as=system:serviceaccount:prod:app-sa

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Làm thế nào quản trị viên có thể kiểm tra xem ServiceAccount `app-sa` trong namespace `prod` có được phép xóa `secrets` trong namespace `prod` hay không mà không thực sự xóa bất kỳ secret nào?

**Đáp án đúng:** **C**

Cú pháp chuẩn kiểm tra quyền của ServiceAccount: `kubectl auth can-i <verb> <resource> -n <ns> --as=system:serviceaccount:<ns>:<sa>`.

- **A:** Sai vì `describe serviceaccount` không liệt kê các quyền `Role`/`RoleBinding` gắn với ServiceAccount đó.
- **B:** Sai vì không có cờ `--as` thì lệnh sẽ kiểm tra quyền của admin hiện tại chứ không phải của `app-sa`.
- **C (Đúng):** Đúng! `kubectl auth can-i` với cờ `--as=system:serviceaccount:<ns>:<sa-name>` kiểm tra quyền RBAC chính xác mà không thực thi hành động.
- **D:** Sai vì tên định danh đầy đủ của ServiceAccount khi giả lập `--as` phải có tiền tố `system:serviceaccount:<ns>:<name>` và lệnh này chỉ liệt kê binding chứ không kiểm tra quyền `delete secrets`.

</details>

### Câu 7 `medium`

You want to extract the `client-certificate-data` and switch the active context in your kubeconfig to `k8s-prod` stored in `/root/custom.kubeconfig`. Which command switches the context in that specific kubeconfig file?

- **A.** kubectl config set-cluster k8s-prod --kubeconfig=/root/custom.kubeconfig
- **B.** kubectl --kubeconfig=/root/custom.kubeconfig config use-context k8s-prod
- **C.** kubectl apply -f /root/custom.kubeconfig --context=k8s-prod
- **D.** kubectl config current-context k8s-prod --kubeconfig=/root/custom.kubeconfig

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn muốn trích xuất `client-certificate-data` và chuyển context đang hoạt động trong kubeconfig của mình sang `k8s-prod` được lưu trong `/root/custom.kubeconfig`. Lệnh nào chuyển context trong tệp kubeconfig cụ thể đó?

**Đáp án đúng:** **B**

Luôn dùng `kubectl config use-context <context-name>` (kèm `--kubeconfig=<path>` nếu không phải `~/.kube/config`) để chuyển context.

- **A:** Sai vì `set-cluster` dùng để định nghĩa thông tin cluster chứ không chuyển đổi context đang dùng.
- **B (Đúng):** Đúng! Cờ `--kubeconfig=/root/custom.kubeconfig` kết hợp `config use-context <name>` cập nhật context hiện hành trong đúng file kubeconfig được chỉ định.
- **C:** Sai vì kubeconfig là file cấu hình client, không phải manifest tài nguyên để `kubectl apply`.
- **D:** Sai vì `current-context` chỉ in ra tên context hiện tại, không nhận đối số để chuyển context.

</details>

### Câu 8 `medium`

Which command creates a short-lived authentication token (valid for 2 hours) for the `ServiceAccount` named `metrics-reader` in namespace `monitoring` on Kubernetes 1.24+?

- **A.** kubectl create token metrics-reader -n monitoring --duration=2h
- **B.** kubectl auth token metrics-reader -n monitoring
- **C.** kubectl get secret metrics-reader-token -n monitoring -o jsonpath='{.data.token}'
- **D.** kubeadm token create metrics-reader --ttl=2h

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Lệnh nào tạo một authentication token ngắn hạn (có hiệu lực trong 2 giờ) cho `ServiceAccount` tên `metrics-reader` trong namespace `monitoring` trên Kubernetes 1.24 trở lên?

**Đáp án đúng:** **A**

Từ Kubernetes 1.24+, `kubectl create token <sa-name> -n <ns> --duration=<time>` là cách chuẩn để tạo JWT token cho ServiceAccount.

- **A (Đúng):** Đúng! Từ Kubernetes 1.24+, `ServiceAccount` không tự động tạo Secret token vĩnh viễn; bạn dùng `kubectl create token <sa> -n <ns> --duration=2h` để xin token qua TokenRequest API.
- **B:** Sai vì `kubectl auth` không có lệnh con `token`.
- **C:** Sai vì từ K8s 1.24+, việc tạo ServiceAccount không còn tự động sinh Secret `<sa>-token-...` nữa.
- **D:** Sai vì `kubeadm token create` tạo bootstrap token để join Node mới vào cụm, không phải token cho ServiceAccount.

</details>

---

[Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md)
