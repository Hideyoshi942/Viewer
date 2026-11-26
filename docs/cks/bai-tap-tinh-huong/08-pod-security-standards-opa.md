# Bài tập tình huống — 8. Pod Security Standards (PSS/PSA) & OPA Gatekeeper

> Áp dụng Pod Security Admission (enforce/audit/warn với Privileged/Baseline/Restricted) qua nhãn Namespace và viết chính sách tùy chỉnh với OPA Gatekeeper (Rego).
> **Số câu hỏi:** 4 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A namespace 'finance' has the label pod-security.kubernetes.io/enforce=restricted. A developer submits a Pod manifest that fails admission. Which container securityContext configuration satisfies the 'restricted' Pod Security Standard?

- **A.** runAsNonRoot: true, allowPrivilegeEscalation: false, capabilities: {drop: ["ALL"]}, and seccompProfile: {type: RuntimeDefault}.
- **B.** runAsUser: 0, allowPrivilegeEscalation: true, and capabilities: {add: ["NET_ADMIN", "SYS_TIME"]}.
- **C.** hostNetwork: true, privileged: false, and runAsNonRoot: false with default capabilities.
- **D.** runAsNonRoot: true and capabilities: {drop: ["NET_RAW"]} without specifying any seccompProfile.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Namespace 'finance' có label pod-security.kubernetes.io/enforce=restricted. Một nhà phát triển gửi một Pod manifest bị từ chối ở bước admission. Cấu hình securityContext nào của container đáp ứng chuẩn Pod Security Standard 'restricted'?

**Đáp án đúng:** **A**

Pod Security Admission (PSA) mức restricted yêu cầu cấu hình chặt chẽ: runAsNonRoot: true, allowPrivilegeEscalation: false, capabilities.drop: ["ALL"], và seccompProfile.type: RuntimeDefault (hoặc Localhost).

- **A (Đúng):** Chính xác! Chuẩn Pod Security Standards mức restricted bắt buộc đủ 4 yếu tố: chạy non-root, không leo thang đặc quyền, drop toàn bộ capabilities (ALL) và bật seccompProfile (RuntimeDefault hoặc Localhost).
- **B:** Sai. Chạy với UID 0 (root), cho phép privilege escalation và thêm NET_ADMIN đều vi phạm mức restricted.
- **C:** Sai. hostNetwork: true bị cấm ngay từ mức baseline lẫn restricted.
- **D:** Sai. Mức restricted yêu cầu drop ALL capabilities (chỉ được add lại NET_BIND_SERVICE) và bắt buộc phải khai báo seccompProfile.

</details>

### Câu 2 `hard`

Which TWO statements accurately describe OPA Gatekeeper policy enforcement in Kubernetes? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** OPA Gatekeeper operates only as a post-deployment cron job and cannot reject Pod creation at Kubernetes admission time.
- **B.** OPA Gatekeeper replaces etcd encryption at rest for Kubernetes Secrets and ConfigMaps.
- **C.** A ConstraintTemplate defines the OpenAPI schema and Rego logic for a policy rule.
- **D.** A Constraint instantiates a ConstraintTemplate and scopes it to specific Kubernetes API groups, kinds, or namespaces.
- **E.** Setting enforcementAction: dryrun in a Constraint immediately blocks non-compliant Pods.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** HAI phát biểu nào mô tả chính xác việc thực thi chính sách bằng OPA Gatekeeper trong Kubernetes? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, D**

OPA Gatekeeper dùng cặp tài nguyên ConstraintTemplate (chứa Rego logic) và Constraint (gán phạm vi match và enforcementAction: deny/dryrun/warn) để kiểm soát chính sách tùy biến.

- **A:** Sai. Gatekeeper hoạt động như một ValidatingAdmissionWebhook, có khả năng từ chối (deny) tài nguyên ngay tại thời điểm admission.
- **B:** Sai. Gatekeeper là policy engine ở tầng admission, không thực hiện mã hóa dữ liệu trong etcd.
- **C (Đúng):** Chính xác! ConstraintTemplate chứa mã nguồn Rego (logic kiểm tra) và schema tham số đầu vào.
- **D (Đúng):** Chính xác! Constraint là đối tượng cụ thể hóa ConstraintTemplate, chỉ định match (kinds, namespaces) và các tham số thực thi.
- **E:** Sai. dryrun chỉ ghi nhận vi phạm phục vụ kiểm toán (audit) mà không chặn request; enforcementAction: deny mới chặn.

</details>

### Câu 3 `medium`

A namespace 'finance' is labeled with 'pod-security.kubernetes.io/enforce=restricted'. A developer tries to deploy a Pod that sets 'runAsNonRoot: true' and 'allowPrivilegeEscalation: false', but the admission controller rejects the Pod. Which additional fields are mandatory to pass the 'restricted' Pod Security Standard?

- **A.** capabilities.drop: ["ALL"] and seccompProfile.type set to RuntimeDefault or Localhost.
- **B.** readOnlyRootFilesystem: true, automountServiceAccountToken: false, and runAsGroup: 1000.
- **C.** An AppArmor Localhost profile annotation on every container.
- **D.** runtimeClassName: gvisor and hostNetwork: false.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Namespace 'finance' được gắn label 'pod-security.kubernetes.io/enforce=restricted'. Một nhà phát triển cố gắng triển khai một Pod có thiết lập 'runAsNonRoot: true' và 'allowPrivilegeEscalation: false', nhưng admission controller từ chối Pod đó. Những trường bổ sung nào là bắt buộc để vượt qua chuẩn Pod Security Standard 'restricted'?

**Đáp án đúng:** **A**

Để vượt qua Pod Security Admission mức 'restricted', Pod bắt buộc phải thỏa mãn: runAsNonRoot: true, allowPrivilegeEscalation: false, capabilities.drop: ["ALL"] và seccompProfile (RuntimeDefault hoặc Localhost).

- **A (Đúng):** Chính xác! Chuẩn PSS 'restricted' yêu cầu đầy đủ 4 điều kiện cốt lõi: runAsNonRoot: true, allowPrivilegeEscalation: false, capabilities.drop: ["ALL"] và seccompProfile là RuntimeDefault hoặc Localhost.
- **B:** Sai. Dù đây là các thực hành bảo mật rất tốt, chúng KHÔNG nằm trong danh sách kiểm tra bắt buộc của PSS 'restricted'.
- **C:** Sai. PSS 'restricted' chỉ giới hạn các giá trị AppArmor hợp lệ nếu có dùng, chứ không bắt buộc phải khai báo AppArmor Localhost profile.
- **D:** Sai. PSS 'restricted' không yêu cầu bắt buộc sử dụng gVisor RuntimeClass.

</details>

### Câu 4 `medium`

You need to enforce a custom organizational policy that rejects any Deployment or Pod whose metadata does not include a 'cost-center' label. Built-in Pod Security Admission cannot check custom labels. Which tool and resource pair best fulfills this requirement?

- **A.** NetworkPolicy using podSelector.matchLabels for 'cost-center' to reject unlabeled Pods.
- **B.** Falco using a custom syscall rule in /etc/falco/falco_rules.local.yaml to block Pod admission at the Kubernetes API server.
- **C.** kube-bench using a custom CIS Benchmark YAML check file on the control plane.
- **D.** OPA Gatekeeper using a ConstraintTemplate (containing Rego logic) and a corresponding Constraint targeting Pods/Deployments.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn cần thực thi một chính sách tổ chức tùy chỉnh nhằm từ chối bất kỳ Deployment hoặc Pod nào có metadata không chứa label 'cost-center'. Pod Security Admission tích hợp sẵn không thể kiểm tra các label tùy chỉnh. Cặp công cụ và tài nguyên nào đáp ứng tốt nhất yêu cầu này?

**Đáp án đúng:** **D**

OPA Gatekeeper (ConstraintTemplate + Constraint viết bằng Rego) là giải pháp Policy-as-Code tiêu chuẩn trong CKS để áp đặt các luật nghiệp vụ/bảo mật tùy biến vượt ngoài phạm vi của PSS.

- **A:** Sai. NetworkPolicy chỉ lọc lưu lượng mạng, không từ chối việc tạo tài nguyên thiếu label.
- **B:** Sai. Falco là công cụ phát hiện bất thường ở thời điểm chạy (runtime detection), không phải Validating Admission Controller để từ chối tạo Pod thiếu label.
- **C:** Sai. kube-bench chỉ đánh giá tuân thủ cấu hình CIS Benchmark trên Node/Control Plane, không chặn admission request.
- **D (Đúng):** Chính xác! OPA Gatekeeper sử dụng cặp tài nguyên ConstraintTemplate (định nghĩa logic bằng ngôn ngữ Rego) và Constraint (áp dụng lên các tài nguyên/namespace mục tiêu) để thực thi chính sách tùy biến ở bước Validating Admission.

</details>

---

[Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md)
