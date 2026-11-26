# Bài tập tình huống — 4. Quản lý Gói & Mở rộng Kubernetes — Helm v3, Kustomize & CRD

> Cài đặt, nâng cấp, rollback release với Helm v3; quản lý cấu hình môi trường với Kustomize (base/overlays) và hiểu về CustomResourceDefinition (CRD) cùng Operator pattern.
> **Số câu hỏi:** 3 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

You need to install the `bitnami/nginx` Helm chart into the `web` namespace with release name `frontend`, setting `replicaCount=3`, and automatically creating the namespace if it does not exist. Which command should you run?

- **A.** helm install frontend bitnami/nginx -n web --create-namespace --set replicaCount=3
- **B.** helm template frontend bitnami/nginx -n web --create-namespace --set replicaCount=3
- **C.** kubectl apply -k bitnami/nginx --namespace web --set replicaCount=3
- **D.** helm apply frontend bitnami/nginx --namespace web --create-ns --replicas 3

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn cần cài đặt Helm chart `bitnami/nginx` vào namespace `web` với tên release là `frontend`, thiết lập `replicaCount=3`, và tự động tạo namespace nếu nó chưa tồn tại. Bạn nên chạy lệnh nào?

**Đáp án đúng:** **A**

Helm v3 dùng `helm install <release-name> <repo/chart> -n <namespace> --create-namespace --set <key>=<value>` để triển khai ứng dụng.

- **A (Đúng):** Đúng! `helm install <release> <chart> -n <ns> --create-namespace --set key=value` là cú pháp chuẩn của Helm v3.
- **B:** Sai vì `helm template` chỉ render YAML ra màn hình chứ không cài đặt release lên cụm.
- **C:** Sai vì `kubectl apply -k` dùng cho Kustomize, không dùng cho Helm chart.
- **D:** Sai vì Helm v3 không có lệnh `helm apply` hay cờ `--replicas`.

</details>

### Câu 2 `medium`

Which TWO commands allow you to preview or apply a Kustomize overlay located at `./overlays/prod` using `kubectl`? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** kubectl kustomize ./overlays/prod
- **B.** helm template ./overlays/prod
- **C.** kubectl apply -k ./overlays/prod
- **D.** kubectl apply -f ./overlays/prod/kustomization.yaml

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** HAI lệnh nào cho phép bạn xem trước (preview) hoặc áp dụng (apply) một Kustomize overlay nằm tại `./overlays/prod` bằng `kubectl`? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, C**

Kustomize được tích hợp sẵn trong `kubectl`: dùng `kubectl kustomize <dir>` để xem trước YAML và `kubectl apply -k <dir>` để triển khai.

- **A (Đúng):** Đúng! `kubectl kustomize <dir>` render toàn bộ YAML sau khi gộp base và overlay ra stdout để kiểm tra trước.
- **B:** Sai vì đây là lệnh của Helm, không phải Kustomize.
- **C (Đúng):** Đúng! Cờ `-k` trong `kubectl apply -k` giúp áp dụng trực tiếp thư mục Kustomize lên cụm.
- **D:** Sai vì dùng `-f` lên `kustomization.yaml` sẽ báo lỗi API không hợp lệ; phải dùng `-k` trên thư mục.

</details>

### Câu 3 `medium`

A Helm release `analytics` in namespace `data` failed during an upgrade to revision 3. Which command rolls back `analytics` to revision 2?

- **A.** helm undo analytics --to-revision=2 -n data
- **B.** helm uninstall analytics --revision=2 -n data
- **C.** helm rollback analytics 2 -n data
- **D.** kubectl rollout undo helm/analytics --to-revision=2 -n data

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một Helm release `analytics` trong namespace `data` bị lỗi trong quá trình nâng cấp lên revision 3. Lệnh nào roll back `analytics` về revision 2?

**Đáp án đúng:** **C**

Dùng `helm history <release> -n <ns>` để xem lịch sử và `helm rollback <release> <revision> -n <ns>` để khôi phục.

- **A:** Sai vì `helm` không có lệnh con `undo` (đó là cú pháp của `kubectl rollout undo`).
- **B:** Sai vì `helm uninstall` sẽ gỡ bỏ toàn bộ release.
- **C (Đúng):** Đúng! Cú pháp chuẩn của Helm v3 để rollback là `helm rollback <RELEASE> <REVISION> -n <NAMESPACE>`.
- **D:** Sai vì `kubectl` không quản lý tài nguyên loại `helm/`.

</details>

---

[Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md)
