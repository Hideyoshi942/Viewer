# Bài tập tình huống — 9. Định tuyến HTTP/HTTPS — Ingress Controller & Kubernetes Gateway API

> Cấu hình Ingress (pathType Prefix/Exact, TLS termination) và chuyển đổi sang Gateway API thế hệ mới (GatewayClass, Gateway, HTTPRoute, traffic splitting).
> **Số câu hỏi:** 5 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

An administrator creates an `Ingress` resource in Kubernetes v1.31 to route HTTP traffic for `shop.example.com` to a backend Service. However, the Ingress resource has no `ADDRESS` assigned and does not route any traffic, even though an NGINX Ingress Controller is running in the cluster. Upon inspection, the cluster does not have a default `IngressClass` marked. What field is missing from the `Ingress` manifest?

- **A.** `spec.serviceAccountName: default`
- **B.** `spec.nodeName: controlplane`
- **C.** `spec.ingressClassName: nginx`
- **D.** `spec.clusterIP: None`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Quản trị viên tạo một tài nguyên `Ingress` trong Kubernetes v1.31 để định tuyến lưu lượng HTTP cho `shop.example.com` tới một backend Service. Tuy nhiên, tài nguyên Ingress không được gán `ADDRESS` và không định tuyến bất kỳ lưu lượng nào, mặc dù NGINX Ingress Controller đang chạy trong cluster. Khi kiểm tra, cluster không có `IngressClass` nào được đánh dấu mặc định. Trường nào đang bị thiếu trong `Ingress` manifest?

**Đáp án đúng:** **C**

Lỗi kinh điển khi làm câu hỏi Ingress trong đề CKA: Quên khai báo **`spec.ingressClassName`** (hoặc `--class=<name>` khi dùng lệnh `kubectl create ingress`). Luôn kiểm tra tên class trước bằng lệnh `kubectl get ingressclass`!

- **A:** Sai vì `Ingress` không sử dụng `serviceAccountName`.
- **B:** Sai vì `Ingress` không có trường `nodeName`.
- **C (Đúng):** Đúng! Nếu trong cụm không có `IngressClass` nào được đánh dấu mặc định (`ingressclass.kubernetes.io/is-default-class: "true"`), mọi tài nguyên `Ingress` bắt buộc phải khai báo rõ `spec.ingressClassName` (ví dụ `nginx`) để Ingress Controller nhận diện và xử lý.
- **D:** Sai vì `clusterIP` là trường của `Service`, không phải của `Ingress`.

</details>

### Câu 2 `medium`

In the Kubernetes Gateway API, which resource is used by application developers to define HTTP routing rules (such as hostname matching, path prefixes, and backend Service weights) and attach them to a shared `Gateway` via `parentRefs`?

- **A.** `PodDisruptionBudget`
- **B.** `Endpoints`
- **C.** `StorageClass`
- **D.** `HTTPRoute`

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong Kubernetes Gateway API, tài nguyên nào được các nhà phát triển ứng dụng sử dụng để định nghĩa các quy tắc định tuyến HTTP (như khớp hostname, path prefix và trọng số backend Service) và gắn chúng vào một `Gateway` dùng chung thông qua `parentRefs`?

**Đáp án đúng:** **D**

Ba tầng tài nguyên của **Kubernetes Gateway API** (mới bổ sung vào đề cương CKA hiện hành):
1. **`GatewayClass`**: Định nghĩa bộ điều khiển hạ tầng (Infrastructure Provider).
2. **`Gateway`**: Định nghĩa điểm lắng nghe mạng (`listeners`: port 80/443, TLS) bởi Cluster Admin.
3. **`HTTPRoute`**: Định nghĩa luật định tuyến ứng dụng (`parentRefs` trỏ vào `Gateway`, `rules.backendRefs` trỏ vào `Service`).

- **A:** Sai vì `PodDisruptionBudget` giới hạn số lượng Pod tối thiểu phải chạy khi bảo trì node.
- **B:** Sai vì `Endpoints` chỉ lưu danh sách IP:Port của các Pod thuộc một Service.
- **C:** Sai vì `StorageClass` dùng cho lưu trữ ổ đĩa.
- **D (Đúng):** Đúng! Trong kiến trúc **Gateway API**, đối tượng **`HTTPRoute`** định nghĩa các quy tắc định tuyến HTTP (hostnames, paths, headers, backendRefs) và liên kết lên `Gateway` thông qua trường `spec.parentRefs`.

</details>

### Câu 3 `medium`

In Kubernetes Gateway API, which resource binds routing rules (`matches` and `backendRefs` for specific hostnames/paths) to a `Gateway` via `parentRefs`?

- **A.** IngressClass
- **B.** EndpointSlice
- **C.** HTTPRoute
- **D.** GatewayClass

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong Kubernetes Gateway API, tài nguyên nào gắn kết các quy tắc định tuyến (`matches` và `backendRefs` cho các hostname/path cụ thể) vào một `Gateway` thông qua `parentRefs`?

**Đáp án đúng:** **C**

Mô hình 3 lớp của Gateway API: `GatewayClass` (controller hạ tầng) -> `Gateway` (cổng lắng nghe/TLS) -> `HTTPRoute` (luật định tuyến gắn qua `parentRefs`).

- **A:** Sai vì `IngressClass` thuộc API `Ingress` truyền thống, không phải Gateway API.
- **B:** Sai vì `EndpointSlice` lưu danh sách IP backend của Service.
- **C (Đúng):** Đúng! `HTTPRoute` (thuộc `gateway.networking.k8s.io/v1`) định nghĩa luật định tuyến HTTP/HTTPS và gắn vào `Gateway` qua trường `spec.parentRefs`.
- **D:** Sai vì `GatewayClass` là tài nguyên cấp cụm khai báo controller triển khai Gateway.

</details>

### Câu 4 `medium`

In Kubernetes Gateway API, how do you split HTTP traffic so that `90%` goes to `svc-v1` and `10%` goes to `svc-v2`?

- **A.** Set `sessionAffinity: Weighted` and `weight` annotations on a standard Kubernetes `ClusterIP` Service.
- **B.** Configure `weight: 90` and `weight: 10` directly on the `Gateway` resource's `spec.listeners` section.
- **C.** Specify both services under `rules[].backendRefs` in the `HTTPRoute` with `weight: 90` and `weight: 10`.
- **D.** Create two `GatewayClass` objects with `parametersRef` weights of `90` and `10` pointing to each backend Service.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trong Kubernetes Gateway API, làm thế nào để bạn chia lưu lượng HTTP sao cho `90%` đi tới `svc-v1` và `10%` đi tới `svc-v2`?

**Đáp án đúng:** **C**

Một ưu điểm lớn của Gateway API (`HTTPRoute`) so với `Ingress` truyền thống là hỗ trợ sẵn traffic splitting qua `backendRefs[].weight` mà không cần annotation riêng của từng controller.

- **A:** Sai vì Kubernetes `Service` không hỗ trợ `sessionAffinity: Weighted`.
- **B:** Sai vì `Gateway.spec.listeners` chỉ định nghĩa cổng, giao thức và TLS, không chứa luật chia tải backend.
- **C (Đúng):** Đúng! `HTTPRoute` hỗ trợ chia tải theo trọng số trực tiếp trong mảng `backendRefs` thông qua trường `weight`.
- **D:** Sai vì `GatewayClass` chỉ định nghĩa controller triển khai Gateway.

</details>

### Câu 5 `medium`

Which TWO statements about Kubernetes `Ingress` are true? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** An Ingress resource requires an Ingress Controller (such as ingress-nginx) running in the cluster to actually route traffic.
- **B.** The TLS Secret referenced in `spec.tls[].secretName` must reside in the same namespace as the `Ingress` resource.
- **C.** Ingress is a cluster-scoped resource that can route traffic to Services across all namespaces simultaneously.
- **D.** An Ingress automatically exposes arbitrary UDP and raw TCP ports without extra controller configuration.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** HAI phát biểu nào về Kubernetes `Ingress` là đúng? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, B**

Trong Kubernetes, `Ingress` là tài nguyên namespace-scoped cần Ingress Controller thực thi, và mọi `Service` / TLS `Secret` được tham chiếu đều phải nằm cùng namespace.

- **A (Đúng):** Đúng! Tạo đối tượng `Ingress` đơn lẻ sẽ không có tác dụng nếu trong cụm không có Ingress Controller đang lắng nghe.
- **B (Đúng):** Đúng! `Ingress` chỉ tham chiếu được tới `Service` và TLS `Secret` nằm trong cùng namespace với nó.
- **C:** Sai vì `Ingress` là tài nguyên namespace-scoped (chỉ `IngressClass` là cluster-scoped).
- **D:** Sai vì `Ingress` API chuẩn chỉ thiết kế cho HTTP/HTTPS (Layer 7).

</details>

---

[Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md)
