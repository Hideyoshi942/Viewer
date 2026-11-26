# Bài tập tình huống — 13. Kubernetes Audit Policy & Audit Logging

> Thiết lập --audit-policy-file và --audit-log-path trên kube-apiserver, phân biệt các mức None/Metadata/Request/RequestResponse và ẩn payload nhạy cảm của Secrets.
> **Số câu hỏi:** 4 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

You need to configure Kubernetes Audit Logging so that all access to Secrets is logged with full request and response bodies, while health check endpoints (/healthz*) are not logged at all. Which audit policy rule levels should be configured?

- **A.** level: None for nonResourceURLs ["/healthz*"] placed before level: RequestResponse for resources ["secrets"].
- **B.** level: Request for resources ["secrets"] placed after a catch-all level: None rule.
- **C.** level: Metadata for both nonResourceURLs ["/healthz*"] and resources ["secrets"].
- **D.** level: RequestResponse for ["/healthz*"] and level: None for resources ["secrets"].

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn cần cấu hình Kubernetes Audit Logging sao cho mọi truy cập vào Secrets đều được ghi log đầy đủ cả request và response body, trong khi các endpoint kiểm tra sức khỏe (/healthz*) hoàn toàn không bị ghi log. Nên cấu hình các cấp độ (level) audit policy rule nào?

**Đáp án đúng:** **A**

Kubernetes Audit Policy có 4 mức: None, Metadata, Request, RequestResponse và áp dụng quy tắc first-match-wins (khớp rule đầu tiên từ trên xuống).

- **A (Đúng):** Chính xác! Kubernetes Audit Policy đánh giá các rule theo thứ tự từ trên xuống dưới (first-match). Đặt rule None cho /healthz* ở trên giúp giảm nhiễu log, còn RequestResponse cho secrets ghi đủ cả request lẫn response body.
- **B:** Sai. Đặt rule catch-all level: None ở trên cùng sẽ khớp mọi request và khiến rule cho secrets bên dưới không bao giờ chạy.
- **C:** Sai. Metadata chỉ ghi thông tin user/timestamp/verb mà không ghi nội dung request/response body của Secrets, và vẫn ghi log /healthz*.
- **D:** Sai. Cấu hình này bị đảo ngược hoàn toàn so với yêu cầu bài toán.

</details>

### Câu 2 `hard`

After adding --audit-policy-file and --audit-log-path to /etc/kubernetes/manifests/kube-apiserver.yaml, the kube-apiserver static Pod fails to start. What is the most likely oversight?

- **A.** Audit logging is only supported by kube-apiserver when --anonymous-auth=true is explicitly enabled.
- **B.** The host paths for the audit policy file and log directory were not mounted into the kube-apiserver container via volumes and volumeMounts.
- **C.** The audit policy YAML file must be converted to JSON format before kube-apiserver can parse it.
- **D.** Kubernetes Audit Logging requires restarting the etcd static Pod before kube-apiserver can write logs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Sau khi thêm --audit-policy-file và --audit-log-path vào /etc/kubernetes/manifests/kube-apiserver.yaml, static Pod kube-apiserver không thể khởi động. Thiếu sót có khả năng cao nhất là gì?

**Đáp án đúng:** **B**

Lỗi quên khai báo volumes/volumeMounts (hostPath) khi thêm file cấu hình mới vào kube-apiserver.yaml là lỗi kinh điển nhất. Khi gặp sự cố, kiểm tra log container qua crictl ps -a và crictl logs <container-id>.

- **A:** Sai. Audit logging hoạt động độc lập với cấu hình anonymous-auth.
- **B (Đúng):** Chính xác! Vì kube-apiserver chạy trong container, mọi đường dẫn file mới thêm vào command flags (như /etc/kubernetes/audit/policy.yaml và /var/log/kubernetes/audit/) bắt buộc phải được khai báo trong volumes và volumeMounts.
- **C:** Sai. kube-apiserver đọc trực tiếp file Audit Policy định dạng YAML.
- **D:** Sai. etcd không liên quan đến tính năng audit logging của kube-apiserver.

</details>

### Câu 3 `medium`

You are writing a Kubernetes Audit Policy to log all actions on Deployments at RequestResponse level, while ensuring that the plaintext contents of Secrets are NEVER written to the audit log file. How should the rules be ordered and configured?

- **A.** Place a rule for resources: ["secrets"] with level: Metadata ABOVE any broader Request or RequestResponse rules.
- **B.** Place a catch-all rule with level: RequestResponse at the top, followed by a rule for secrets with level: Metadata at the bottom.
- **C.** Set level: Request for secrets because Request only logs metadata.
- **D.** Set omitStages: ["ResponseComplete"] so Secret contents are excluded from logs.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn đang viết một Kubernetes Audit Policy để ghi log tất cả các hành động trên Deployments ở mức RequestResponse, đồng thời đảm bảo nội dung plaintext của Secrets KHÔNG BAO GIỜ bị ghi vào tệp audit log. Các quy tắc (rules) nên được sắp xếp và cấu hình như thế nào?

**Đáp án đúng:** **A**

Kubernetes Audit Policy đánh giá theo thứ tự từ trên xuống (first-match wins). Luôn đặt rule bảo vệ Secrets với level: Metadata (không ghi body) lên trước các rule tổng quát.

- **A (Đúng):** Chính xác! Audit Policy áp dụng quy tắc first-match wins (khớp luật đầu tiên từ trên xuống). Đặt luật cho 'secrets' với level: Metadata ở phía trên đảm bảo chỉ ghi lại ai đã truy cập Secret mà không ghi nội dung request/response body.
- **B:** Sai. Do cơ chế first-match wins, nếu luật catch-all RequestResponse nằm trên cùng, mọi yêu cầu Secrets sẽ khớp ngay lập tức và bị ghi cả nội dung nhạy cảm ra log.
- **C:** Sai. Cấp độ Request ghi cả request body, do đó khi tạo hoặc cập nhật Secret sẽ làm lộ toàn bộ dữ liệu bí mật trong audit log.
- **D:** Sai. Bỏ qua stage ResponseComplete sẽ làm mất hoàn toàn log hoàn tất của mọi API call, không phải cách bảo vệ Secrets.

</details>

### Câu 4 `hard`

After adding --audit-policy-file=/etc/kubernetes/audit/policy.yaml and --audit-log-path=/var/log/kubernetes/audit/audit.log to /etc/kubernetes/manifests/kube-apiserver.yaml, kube-apiserver fails to start. Inspecting container logs with 'crictl logs' shows 'open /etc/kubernetes/audit/policy.yaml: no such file or directory', even though the file exists on the host. What is missing?

- **A.** The audit policy file must be converted from YAML to JSON format before kube-apiserver can read it.
- **B.** You forgot to run 'systemctl restart kube-apiserver' on the control plane node after editing the manifest.
- **C.** Audit logging requires enabling the ImagePolicyWebhook admission plugin first in kube-apiserver.yaml.
- **D.** hostPath volumes and corresponding volumeMounts for /etc/kubernetes/audit and /var/log/kubernetes/audit were not added to kube-apiserver.yaml.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Sau khi thêm --audit-policy-file=/etc/kubernetes/audit/policy.yaml và --audit-log-path=/var/log/kubernetes/audit/audit.log vào /etc/kubernetes/manifests/kube-apiserver.yaml, kube-apiserver không thể khởi động. Kiểm tra log container bằng 'crictl logs' hiển thị 'open /etc/kubernetes/audit/policy.yaml: no such file or directory', mặc dù tệp này tồn tại trên host. Điều gì đang bị thiếu?

**Đáp án đúng:** **D**

Lỗi quên khai báo volumes/volumeMounts khi thêm cờ --audit-policy-file, --audit-log-path, --encryption-provider-config hay --admission-control-config-file vào kube-apiserver.yaml là lỗi phổ biến nhất trong phòng thi CKS.

- **A:** Sai. kube-apiserver đọc trực tiếp file Audit Policy định dạng YAML.
- **B:** Sai. kube-apiserver trên cụm kubeadm chạy dạng Static Pod do kubelet quản lý, không phải dịch vụ systemd.
- **C:** Sai. Audit Logging hoàn toàn độc lập với ImagePolicyWebhook.
- **D (Đúng):** Chính xác! kube-apiserver chạy bên trong container nên không tự thấy tệp trên máy chủ Host. Bắt buộc phải khai báo cả volumes (hostPath) và volumeMounts cho cả file policy và thư mục ghi audit log.

</details>

---

[Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md)
