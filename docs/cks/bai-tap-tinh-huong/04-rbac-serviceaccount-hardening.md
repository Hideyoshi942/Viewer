# Bài tập tình huống — 4. Gia cố RBAC & ServiceAccount (Least Privilege)

> Áp dụng nguyên tắc đặc quyền tối thiểu cho Role/ClusterRole, loại bỏ wildcard, tắt automountServiceAccountToken, dùng TokenRequest API và kiểm tra quyền bằng kubectl auth can-i.
> **Số câu hỏi:** 7 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A Pod in the 'app-ns' namespace does not need to interact with the Kubernetes API Server at all. What is the most effective way to prevent the Pod from automatically receiving a ServiceAccount token?

- **A.** Set automountServiceAccountToken: false on the Pod spec or on the dedicated ServiceAccount.
- **B.** Assign a ClusterRole with empty rules to the ServiceAccount so API requests return 403.
- **C.** Delete the 'default' ServiceAccount from the 'app-ns' namespace so Pods cannot mount it.
- **D.** Create a NetworkPolicy in 'app-ns' that blocks all egress traffic to the Kubernetes API server on port 6443.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một Pod trong namespace 'app-ns' hoàn toàn không cần tương tác với Kubernetes API Server. Cách hiệu quả nhất để ngăn Pod tự động nhận ServiceAccount token là gì?

**Đáp án đúng:** **A**

Nguyên tắc gia cố ServiceAccount yêu cầu tắt automountServiceAccountToken: false cho các workload không cần gọi Kubernetes API, giảm thiểu rủi ro khi container bị chiếm quyền.

- **A (Đúng):** Chính xác! Đặt automountServiceAccountToken: false trên ServiceAccount hoặc trực tiếp trên Pod spec sẽ ngăn kubelet mount token vào /var/run/secrets/kubernetes.io/serviceaccount/token.
- **B:** Sai. Token vẫn được mount vào Pod và vẫn có thể dùng để gọi các endpoint công khai hoặc khai thác lỗ hổng API Server.
- **C:** Sai. Kubernetes sẽ tự động tạo lại 'default' ServiceAccount trong namespace nếu bị xóa, và Pod sẽ không thể khởi tạo nếu thiếu ServiceAccount.
- **D:** Sai. Dù NetworkPolicy chặn kết nối mạng, token vẫn nằm trong filesystem của container và có thể bị đánh cắp để dùng từ bên ngoài hoặc qua kênh khác.

</details>

### Câu 2 `hard`

A security audit discovers a ClusterRole named 'ci-deployer' with verbs: ['*'] and resources: ['*'] bound to a ServiceAccount in the 'ci' namespace. The CI job only needs to update Deployment images in the 'staging' namespace. How should you apply the principle of least privilege?

- **A.** Grant the 'cluster-admin' ClusterRole via a RoleBinding in 'staging' with verbs: ['*'] on pods and deployments.
- **B.** Replace the ClusterRoleBinding with a Role and RoleBinding in 'staging' granting get, list, watch, update, and patch on apps/deployments.
- **C.** Keep the ClusterRoleBinding referencing 'ci-deployer' but change its metadata namespace field to 'staging' to restrict cluster-wide scope.
- **D.** Add an explicit deny rule in the 'ci-deployer' ClusterRole to block access to all namespaces except 'staging' and 'ci'.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một cuộc kiểm toán bảo mật phát hiện một ClusterRole tên 'ci-deployer' với verbs: ['*'] và resources: ['*'] được bind vào một ServiceAccount trong namespace 'ci'. Công việc CI chỉ cần cập nhật image của Deployment trong namespace 'staging'. Bạn nên áp dụng nguyên tắc đặc quyền tối thiểu (principle of least privilege) như thế nào?

**Đáp án đúng:** **B**

Kubernetes RBAC không có luật deny. Để áp dụng đặc quyền tối thiểu (Least Privilege), cần tránh wildcard ['*'], thu hẹp phạm vi từ ClusterRoleBinding sang Role + RoleBinding trong đúng namespace mục tiêu.

- **A:** Sai. Gắn cluster-admin (dù qua RoleBinding) vẫn cấp toàn quyền trong namespace 'staging', bao gồm đọc Secrets và leo thang đặc quyền.
- **B (Đúng):** Chính xác! Giới hạn phạm vi bằng Role + RoleBinding trong namespace 'staging' và chỉ cấp đúng các verbs cần thiết trên tài nguyên deployments thuộc nhóm apps.
- **C:** Sai. ClusterRoleBinding luôn cấp quyền trên toàn cụm (cluster-wide), không thể giới hạn theo namespace.
- **D:** Sai. Kubernetes RBAC là mô hình thuần cho phép (additive/allow-only), không hỗ trợ luật deny.

</details>

### Câu 3 `hard`

Which TWO actions harden the Kubernetes API Server against unauthenticated access and unauthorized RBAC escalation? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Set --insecure-port=8080 and --insecure-bind-address=0.0.0.0 on kube-apiserver.
- **B.** Grant pods/exec permission to all authenticated users in default namespace.
- **C.** Set --anonymous-auth=false on kube-apiserver.
- **D.** Enable --authorization-mode=ABAC,AlwaysAllow on kube-apiserver for fallback.
- **E.** Remove any ClusterRoleBinding that binds system:anonymous or system:unauthenticated to cluster-admin or view roles.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** HAI hành động nào giúp tăng cường bảo mật (hardening) Kubernetes API Server chống lại truy cập không xác thực và leo thang đặc quyền RBAC trái phép? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Gia cố API Server gồm việc tắt --anonymous-auth=false, dùng --authorization-mode=Node,RBAC và kiểm toán xóa mọi ClusterRoleBinding gán quyền cho system:anonymous hoặc system:unauthenticated.

- **A:** Sai. Cổng insecure-port bỏ qua xác thực/TLS và đã bị loại bỏ trong các phiên bản Kubernetes mới.
- **B:** Sai. Quyền pods/exec rất nhạy cảm, cho phép chạy lệnh tùy ý bên trong container nên không được cấp rộng rãi.
- **C (Đúng):** Chính xác! Tắt --anonymous-auth=false buộc mọi yêu cầu tới API Server phải được xác thực, từ chối các request ẩn danh.
- **D:** Sai. AlwaysAllow vô hiệu hóa kiểm tra phân quyền; chuẩn bảo mật phải dùng Node,RBAC.
- **E (Đúng):** Chính xác! Rà soát và xóa bỏ các binding cấp quyền cho system:anonymous hoặc system:unauthenticated là bước bắt buộc để đóng lỗ hổng truy cập không xác thực.

</details>

### Câu 4 `medium`

A Pod running in the 'analytics' namespace does not need to interact with the Kubernetes API server at all. You want to prevent an attacker who compromises the container from using a mounted ServiceAccount token. What is the best way to achieve this?

- **A.** Create a ServiceAccount with automountServiceAccountToken: false and set automountServiceAccountToken: false in the Pod spec.
- **B.** Set readOnlyRootFilesystem: true on the container so the projected ServiceAccount token cannot be read.
- **C.** Disable RBAC on kube-apiserver so all mounted ServiceAccount tokens are ignored by default.
- **D.** Delete the default ServiceAccount in the 'analytics' namespace so kubelet skips token mounting.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một Pod chạy trong namespace 'analytics' hoàn toàn không cần tương tác với Kubernetes API server. Bạn muốn ngăn chặn kẻ tấn công sau khi chiếm quyền container sử dụng ServiceAccount token được mount sẵn. Cách tốt nhất để đạt được điều này là gì?

**Đáp án đúng:** **A**

Với các workload không cần giao tiếp Kubernetes API, thực hành tốt nhất là tạo ServiceAccount riêng có automountServiceAccountToken: false và đặt tương tự ở cấp Pod spec.

- **A (Đúng):** Chính xác! Tắt automountServiceAccountToken trên cả ServiceAccount riêng lẫn Pod spec đảm bảo kubelet không mount tệp token vào /var/run/secrets/kubernetes.io/serviceaccount/token.
- **B:** Sai. readOnlyRootFilesystem chỉ chặn ghi vào hệ thống tệp gốc, kẻ tấn công vẫn có thể đọc tệp token được mount vào container.
- **C:** Sai. Tắt RBAC sẽ phá hủy cơ chế phân quyền của toàn cụm Kubernetes.
- **D:** Sai. ServiceAccount controller sẽ tự động tạo lại ServiceAccount 'default' ngay sau khi bị xóa.

</details>

### Câu 5 `hard`

During a security audit, you discover a ClusterRoleBinding named 'dev-debug' that grants the 'system:unauthenticated' group the 'cluster-admin' ClusterRole. Additionally, kube-apiserver has '--anonymous-auth=true'. What is the immediate security impact and the correct remediation?

- **A.** No security impact exists as long as etcd encryption at rest with aescbc is enabled on kube-apiserver.
- **B.** Unauthenticated clients on port 6443 get cluster-admin access; delete 'dev-debug' and set '--anonymous-auth=false' in kube-apiserver.yaml.
- **C.** Only Pods inside kube-system are affected; restart kube-controller-manager to clear the stale ClusterRoleBinding.
- **D.** Only read-only access is granted; convert the ClusterRoleBinding 'dev-debug' to a RoleBinding in the default namespace and restart apiserver.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong quá trình kiểm toán bảo mật, bạn phát hiện một ClusterRoleBinding tên 'dev-debug' cấp ClusterRole 'cluster-admin' cho nhóm 'system:unauthenticated'. Ngoài ra, kube-apiserver đang bật '--anonymous-auth=true'. Tác động bảo mật tức thời và biện pháp khắc phục đúng là gì?

**Đáp án đúng:** **B**

Gán quyền RBAC cho system:anonymous hoặc system:unauthenticated kết hợp với --anonymous-auth=true là lỗ hổng cực kỳ nghiêm trọng. Phải xóa bỏ binding này và đặt --anonymous-auth=false trên kube-apiserver.

- **A:** Sai. Mã hóa etcd at rest chỉ bảo vệ dữ liệu trên đĩa; API server sẽ tự động giải mã Secrets khi trả về cho client có quyền cluster-admin.
- **B (Đúng):** Chính xác! Khi bật anonymous-auth và gán cluster-admin cho system:unauthenticated, bất kỳ ai kết nối được tới API Server đều có toàn quyền kiểm soát cụm mà không cần xác thực. Cần xóa ngay ClusterRoleBinding đó và tắt anonymous-auth.
- **C:** Sai. Lỗ hổng này ảnh hưởng toàn bộ cụm từ bất kỳ client nào truy cập được API Server, và restart controller-manager không xóa ClusterRoleBinding.
- **D:** Sai. cluster-admin cấp toàn quyền đọc/ghi/xóa mọi tài nguyên, và không bao giờ nên cấp quyền cho system:unauthenticated.

</details>

### Câu 6 `medium`

You want to verify whether the ServiceAccount 'ci-runner' in the 'devops' namespace is permitted to read Secrets in the 'prod' namespace without actually reading any Secret. Which kubectl command should you run?

- **A.** kubectl get secrets -n prod --serviceaccount=devops:ci-runner --dry-run=server -o name
- **B.** kubectl describe serviceaccount ci-runner -n devops --show-rbac-bindings
- **C.** kubectl auth can-i get secrets -n prod --as=system:serviceaccount:devops:ci-runner
- **D.** kubectl auth can-i get secrets -n prod --as=ci-runner --as-group=devops

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn muốn xác minh xem ServiceAccount 'ci-runner' trong namespace 'devops' có được phép đọc Secrets trong namespace 'prod' hay không mà không thực sự đọc bất kỳ Secret nào. Bạn nên chạy lệnh kubectl nào?

**Đáp án đúng:** **C**

Cú pháp chuẩn để kiểm tra quyền RBAC của một ServiceAccount là: kubectl auth can-i <verb> <resource> -n <target-ns> --as=system:serviceaccount:<sa-ns>:<sa-name>.

- **A:** Sai. Không có cờ --serviceaccount cho lệnh kubectl get.
- **B:** Sai. kubectl describe sa không có cờ --show-rbac và không liệt kê các quyền RBAC gắn với ServiceAccount.
- **C (Đúng):** Chính xác! Lệnh 'kubectl auth can-i' với cờ '--as=system:serviceaccount:<namespace>:<sa-name>' mô phỏng kiểm tra quyền RBAC (SubjectAccessReview) mà không thực sự truy cập tài nguyên.
- **D:** Sai. Khi thiếu tiền tố 'system:serviceaccount:devops:', Kubernetes hiểu 'ci-runner' là một User bình thường chứ không phải ServiceAccount trong namespace devops.

</details>

### Câu 7 `medium`

A developer requests RBAC permissions in the 'staging' namespace to inspect application logs and restart Deployments. Which TWO RBAC permissions should you AVOID granting because they create severe privilege escalation risks? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** verbs: ["get"] on resources: ["pods/log"]
- **B.** verbs: ["create"] on resources: ["pods/exec"] and verbs: ["get", "list"] on resources: ["secrets"]
- **C.** verbs: ["patch"] on resources: ["deployments"] with specific resourceNames
- **D.** verbs: ["get", "list", "watch"] on resources: ["pods"]
- **E.** verbs: ["*"] on resources: ["*"] in apiGroups: ["*"]

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một nhà phát triển yêu cầu quyền RBAC trong namespace 'staging' để xem log ứng dụng và khởi động lại Deployments. Bạn nên TRÁNH cấp HAI quyền RBAC nào vì chúng tạo ra rủi ro leo thang đặc quyền nghiêm trọng? (Chọn HAI đáp án.)

**Đáp án đúng:** **B, E**

Khi thiết kế RBAC chuẩn CKS, cần tránh wildcard ('*') và các quyền nhạy cảm không cần thiết như đọc secrets, pods/exec, impersonate hay bind/escalate roles.

- **A:** Sai. Quyền get trên pods/log là quyền tối thiểu và hợp lý để xem log ứng dụng.
- **B (Đúng):** Chính xác! Quyền pods/exec cho phép thực thi lệnh tùy ý bên trong container để đánh cắp token của ServiceAccount khác, còn quyền đọc secrets làm lộ toàn bộ thông tin nhạy cảm trong namespace.
- **C:** Sai. Quyền patch giới hạn bằng resourceNames trên deployments là cách an toàn để cho phép rollout restart.
- **D:** Sai. Quyền chỉ đọc trên pods là cần thiết để liệt kê Pod cần xem log và không gây leo thang đặc quyền trực tiếp.
- **E (Đúng):** Chính xác! Cấp wildcard '*' cho mọi tài nguyên và hành động vi phạm nghiêm trọng nguyên tắc đặc quyền tối thiểu (Least Privilege).

</details>

---

[Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md)
