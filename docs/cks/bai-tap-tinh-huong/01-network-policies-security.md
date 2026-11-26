# Bài tập tình huống — 1. Cô lập Mạng Cụm với NetworkPolicy & Cilium/Calico

> Thiết kế Default Deny Ingress/Egress, mở DNS egress (UDP/TCP 53), cô lập lưu lượng giữa các namespace và bảo vệ control plane/metadata.
> **Số câu hỏi:** 2 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A security engineer applies a default-deny-egress NetworkPolicy to the 'payments' namespace. Immediately afterward, Pods in the 'payments' namespace fail to resolve internal Service names such as 'db-svc.database.svc.cluster.local'. Which egress rule must be added to restore DNS resolution while keeping other egress blocked?

- **A.** Allow egress to namespaceSelector matching kubernetes.io/metadata.name: kube-system and podSelector k8s-app: kube-dns on UDP and TCP port 53.
- **B.** Allow egress to ipBlock 169.254.169.254/32 on TCP and UDP port 53 for cluster DNS lookups.
- **C.** Allow ingress from kube-system on UDP and TCP port 53 to all Pods in the payments namespace.
- **D.** Remove Egress from policyTypes in the payments NetworkPolicy so Kubernetes automatically permits all CoreDNS DNS resolution traffic across namespaces.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một kỹ sư bảo mật áp dụng một NetworkPolicy chặn mặc định egress (default-deny-egress) cho namespace 'payments'. Ngay sau đó, các Pod trong namespace 'payments' không thể phân giải được các tên Service nội bộ như 'db-svc.database.svc.cluster.local'. Cần thêm quy tắc egress nào để khôi phục việc phân giải DNS trong khi vẫn giữ các lưu lượng egress khác bị chặn?

**Đáp án đúng:** **A**

Khi áp dụng NetworkPolicy có policyTypes chứa Egress với default-deny, mọi kết nối ra ngoài kể cả phân giải tên miền tới CoreDNS đều bị chặn. Bắt buộc phải thêm luật egress cho phép UDP/TCP port 53 tới CoreDNS trong namespace kube-system.

- **A (Đúng):** Chính xác! CoreDNS (kube-dns) chạy trong namespace kube-system và lắng nghe trên cả UDP/53 (truy vấn chuẩn) lẫn TCP/53 (phản hồi lớn). Kết hợp namespaceSelector và podSelector trong cùng một phần tử mảng (AND) giúp mở đúng lưu lượng DNS.
- **B:** Sai. 169.254.169.254 là địa chỉ Cloud Metadata Service, không phải CoreDNS và thậm chí cần được chặn để tránh tấn công SSRF.
- **C:** Sai. Truy vấn DNS xuất phát từ Pod đi ra CoreDNS là lưu lượng chiều ra (Egress), không phải Ingress.
- **D:** Sai. Xóa Egress khỏi policyTypes sẽ vô hiệu hóa hoàn toàn chính sách chặn chiều ra, vi phạm yêu cầu giữ nguyên default-deny-egress.

</details>

### Câu 2 `hard`

A NetworkPolicy in the 'backend' namespace is intended to allow traffic ONLY from Pods labeled 'role: frontend' inside the 'web' namespace. However, during testing, Pods with 'role: frontend' in the 'backend' namespace and ALL Pods in the 'web' namespace can still reach the backend. What is the most likely misconfiguration in the NetworkPolicy YAML?

- **A.** The NetworkPolicy is missing 'policyTypes: [Egress]' alongside the Ingress policy type.
- **B.** The namespaceSelector and podSelector were placed as separate list items (with '-') under 'from', creating OR instead of AND.
- **C.** The 'web' namespace does not have a ResourceQuota or LimitRange configured for network policies.
- **D.** The spec.podSelector field was set to matchLabels instead of matchExpressions in the ingress rule of the NetworkPolicy manifest.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một NetworkPolicy trong namespace 'backend' được dự định CHỈ cho phép lưu lượng từ các Pod có label 'role: frontend' bên trong namespace 'web'. Tuy nhiên, khi kiểm thử, các Pod có 'role: frontend' trong namespace 'backend' và TẤT CẢ các Pod trong namespace 'web' vẫn có thể kết nối tới backend. Lỗi cấu hình sai có khả năng cao nhất trong tệp YAML của NetworkPolicy là gì?

**Đáp án đúng:** **B**

Đây là bẫy kinh điển trong kỳ thi CKS: đặt namespaceSelector và podSelector trong cùng một phần tử mảng (chỉ một dấu '-') sẽ tạo phép AND; tách thành 2 phần tử có dấu '-' riêng biệt sẽ tạo phép OR.

- **A:** Sai. Đây là vấn đề kiểm soát chiều vào (Ingress), không liên quan đến thiếu Egress trong policyTypes.
- **B (Đúng):** Chính xác! Trong NetworkPolicy, hai phần tử mảng riêng biệt (mỗi mục có dấu '-') dưới 'from' được đánh giá theo phép toán OR: hoặc mọi Pod trong namespace 'web', hoặc Pod có nhãn 'role: frontend' trong cùng namespace 'backend'.
- **C:** Sai. ResourceQuota quản lý hạn mức tài nguyên CPU/RAM, không ảnh hưởng tới lọc lưu lượng của NetworkPolicy.
- **D:** Sai. Cả matchLabels và matchExpressions đều hợp lệ; nguyên nhân mở rộng phạm vi ngoài ý muốn là do cú pháp danh sách YAML tạo phép toán OR.

</details>

---

[Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md)
