# Bài tập tình huống — 10. Quản lý Secrets & Mã hóa Dữ liệu trong etcd (Encryption at Rest)

> Cấu hình EncryptionConfiguration trên kube-apiserver (aescbc, secretbox, kms), đặt identity: {} ở cuối và thực hiện re-encrypt toàn bộ Secrets hiện có trong etcd.
> **Số câu hỏi:** 2 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

You configure EncryptionConfiguration for etcd using aescbc as the first provider and identity as the second provider. After restarting kube-apiserver, you want existing Secrets created prior to this change to be encrypted in etcd. Which command accomplishes this?

- **A.** kubectl rollout restart deployment -n kube-system
- **B.** kubectl get secrets --all-namespaces -o json | kubectl apply -f - --force-conflicts
- **C.** kubectl get secrets --all-namespaces -o json | kubectl replace -f -
- **D.** kubeadm alpha certs renew all --config=/etc/kubernetes/enc.yaml

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn cấu hình EncryptionConfiguration cho etcd sử dụng aescbc làm provider đầu tiên và identity làm provider thứ hai. Sau khi khởi động lại kube-apiserver, bạn muốn các Secret hiện có được tạo trước thay đổi này cũng được mã hóa trong etcd. Lệnh nào thực hiện việc này?

**Đáp án đúng:** **C**

Sau khi cấu hình --encryption-provider-config trên kube-apiserver, các Secret cũ vẫn ở dạng plaintext (identity) cho đến khi được cập nhật lại bằng lệnh kubectl get secrets -A -o json | kubectl replace -f -.

- **A:** Sai. Khởi động lại Deployment không làm dữ liệu Secret cũ trong etcd được ghi lại.
- **B:** Sai. etcdctl không có cờ --encrypt-all; việc mã hóa được thực hiện bởi kube-apiserver trước khi ghi xuống etcd.
- **C (Đúng):** Chính xác! EncryptionConfiguration chỉ mã hóa dữ liệu mới ghi vào etcd. Lệnh get + replace ghi lại toàn bộ Secret hiện có qua kube-apiserver để kích hoạt mã hóa bằng provider đầu tiên (aescbc).
- **D:** Sai. Lệnh này chỉ gia hạn chứng chỉ TLS của cụm, không liên quan đến mã hóa Secrets trong etcd.

</details>

### Câu 2 `hard`

You configured EncryptionConfiguration on kube-apiserver with 'aescbc' listed first and 'identity: {}' listed second, and restarted kube-apiserver successfully. However, when you inspect a Secret that was created yesterday directly in etcd using etcdctl, it is still stored in plaintext. Why, and how do you fix it?

- **A.** You must restart the etcd static Pod on all control plane nodes for existing Secret keys to be encrypted automatically.
- **B.** Encryption only applies to new writes; re-encrypt existing Secrets with 'kubectl get secrets --all-namespaces -o json | kubectl replace -f -'.
- **C.** You must move 'identity: {}' above 'aescbc' so kube-apiserver can decrypt old Secrets on startup.
- **D.** aescbc does not encrypt Kubernetes Secrets; you must switch to the secretbox provider.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn đã cấu hình EncryptionConfiguration trên kube-apiserver với 'aescbc' được liệt kê đầu tiên và 'identity: {}' ở vị trí thứ hai, sau đó khởi động lại kube-apiserver thành công. Tuy nhiên, khi bạn kiểm tra trực tiếp một Secret được tạo từ hôm qua trong etcd bằng etcdctl, nó vẫn được lưu dưới dạng plaintext. Tại sao và bạn khắc phục điều này như thế nào?

**Đáp án đúng:** **B**

Sau khi cấu hình EncryptionConfiguration (đặt provider mã hóa như aescbc/kms lên trên identity: {}) và khởi động lại kube-apiserver, bắt buộc phải chạy 'kubectl get secrets -A -o json | kubectl replace -f -' để mã hóa toàn bộ Secrets đã tồn tại trước đó.

- **A:** Sai. Việc mã hóa diễn ra tại kube-apiserver trước khi ghi xuống etcd; khởi động lại etcd không làm thay đổi dữ liệu cũ.
- **B (Đúng):** Chính xác! Việc bật EncryptionConfiguration không tự động mã hóa lại dữ liệu cũ trong etcd. Phải đọc và ghi lại (replace) toàn bộ Secrets hiện có để kube-apiserver mã hóa chúng bằng provider đầu tiên (aescbc).
- **C:** Sai nghiêm trọng! Provider đầu tiên luôn được dùng để mã hóa khi ghi. Đặt identity lên đầu sẽ khiến mọi Secret mới đều được lưu ở dạng bản rõ (plaintext)!
- **D:** Sai. aescbc là một trong những provider mã hóa Secrets hợp lệ và phổ biến nhất trong Kubernetes.

</details>

---

[Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md)
