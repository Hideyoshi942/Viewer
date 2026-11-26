# Bài tập tình huống — 8. Mạng Kubernetes — Services, kube-proxy, CoreDNS & CNI

> Phân biệt ClusterIP, NodePort, LoadBalancer, ExternalName và Headless Service; cơ chế phân giải tên miền CoreDNS (FQDN) và mô hình mạng CNI giữa các Node.
> **Số câu hỏi:** 5 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A Pod in the `frontend` namespace needs to send an HTTP request to a `ClusterIP` Service named `orders-svc` located in the `backend` namespace on port 8080. Which DNS hostname should the Pod use to reach the Service across namespaces?

- **A.** `backend.orders-svc.pod.cluster.local:8080` via pod DNS
- **B.** `orders-svc.backend.svc.cluster.local:8080`
- **C.** `localhost:8080` using cluster-wide loopback routing
- **D.** `orders-svc:8080` without specifying the target namespace

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một Pod trong namespace `frontend` cần gửi yêu cầu HTTP tới một `ClusterIP` Service tên `orders-svc` nằm trong namespace `backend` trên cổng 8080. Pod nên sử dụng DNS hostname nào để kết nối tới Service xuyên namespace?

**Đáp án đúng:** **B**

Quy tắc DNS trong Kubernetes (CoreDNS):
- Cùng Namespace: `<service-name>`
- Khác Namespace: **`<service-name>.<namespace>.svc.cluster.local`** (hoặc viết gọn `<service-name>.<namespace>`).

- **A:** Sai vì bị ngược thứ tự giữa tên Service và tên Namespace, đồng thời hậu tố của Service là `.svc.` chứ không phải `.pod.`.
- **B (Đúng):** Đúng! Khi gọi một Service nằm ở một Namespace khác, bạn phải chỉ rõ tên Namespace theo cú pháp `<service-name>.<namespace>` hoặc FQDN đầy đủ `<service-name>.<namespace>.svc.cluster.local`.
- **C:** Sai vì `localhost` chỉ trỏ vào chính Pod hiện tại.
- **D:** Sai vì nếu chỉ viết `orders-svc`, CoreDNS sẽ chỉ tìm kiếm Service đó bên trong cùng namespace `frontend` hiện tại của Pod.

</details>

### Câu 2 `medium`

You want to deploy a `StatefulSet` named `redis` with 3 replicas where each Pod gets its own persistent volume and a stable DNS name `redis-0.redis-hl.default.svc.cluster.local`. Which combination is required?

- **A.** A `NodePort` Service named `redis-hl` and a single shared `PersistentVolumeClaim` in `spec.template.spec.volumes`.
- **B.** A Headless Service (`clusterIP: None`) named `redis-hl` referenced by `spec.serviceName: redis-hl`, and `volumeClaimTemplates` in the `StatefulSet`.
- **C.** A `ClusterIP` Service named `redis-hl` with `sessionAffinity: ClientIP` and an `emptyDir` volume mounted on each Pod.
- **D.** A `Deployment` with `replicas: 3`, `spec.serviceName: redis-hl`, and `volumeClaimTemplates` for per-Pod persistent storage.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn muốn triển khai một `StatefulSet` tên `redis` với 3 replica, trong đó mỗi Pod có persistent volume riêng và một DNS name ổn định `redis-0.redis-hl.default.svc.cluster.local`. Cần có tổ hợp nào?

**Đáp án đúng:** **B**

`StatefulSet` kết hợp với Headless Service (`clusterIP: None`) tạo ra FQDN ổn định `<pod-name>.<service-name>.<ns>.svc.cluster.local` và cấp PVC riêng qua `volumeClaimTemplates`.

- **A:** Sai vì Service không phải Headless sẽ không tạo bản ghi DNS riêng cho từng Pod `redis-0`, `redis-1`, và dùng chung 1 PVC sẽ không tách biệt dữ liệu từng replica.
- **B (Đúng):** Đúng! `StatefulSet` yêu cầu `spec.serviceName` trỏ tới Headless Service (`clusterIP: None`) để cấp DNS từng Pod và `volumeClaimTemplates` để cấp PVC riêng cho mỗi replica.
- **C:** Sai vì `emptyDir` không bền vững khi Pod bị xóa và `ClusterIP` thông thường không tạo DNS riêng cho từng Pod.
- **D:** Sai vì `Deployment` không hỗ trợ `volumeClaimTemplates`.

</details>

### Câu 3 `medium`

A Pod has two containers: `app` (which specifies `requests.cpu: 200m, limits.cpu: 200m, requests.memory: 256Mi, limits.memory: 256Mi`) and `sidecar` (which has no resource requests or limits set). What Quality of Service (QoS) class will Kubernetes assign to this Pod?

- **A.** Burstable
- **B.** Guaranteed
- **C.** BestEffort
- **D.** Critical

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một Pod có hai container: `app` (chỉ định `requests.cpu: 200m, limits.cpu: 200m, requests.memory: 256Mi, limits.memory: 256Mi`) và `sidecar` (không thiết lập resource requests hay limits nào). Kubernetes sẽ gán lớp Quality of Service (QoS) nào cho Pod này?

**Đáp án đúng:** **A**

QoS class được tính ở cấp Pod: `Guaranteed` yêu cầu tất cả các container đều có `requests == limits` cho cả CPU và Memory.

- **A (Đúng):** Đúng! Để đạt `Guaranteed`, MỌI container trong Pod đều phải có `requests == limits` cho cả CPU và Memory. Vì `sidecar` không khai báo nên Pod chỉ đạt mức `Burstable`.
- **B:** Sai vì `sidecar` chưa khai báo `requests` và `limits` bằng nhau.
- **C:** Sai vì `BestEffort` chỉ áp dụng khi KHÔNG có container nào trong Pod khai báo `requests` hay `limits`.
- **D:** Sai vì Kubernetes chỉ có 3 QoS class: `Guaranteed`, `Burstable`, và `BestEffort`.

</details>

### Câu 4 `medium`

A `Service` named `web-svc` in namespace `prod` has `port: 80` and `targetPort: 8080`, but `kubectl get endpoints web-svc -n prod` returns `<none>`. What are the most likely causes?

- **A.** The `NodePort` value is outside the default `30000-32767` range, preventing EndpointSlice creation.
- **B.** The Service's `spec.selector` does not match the Pods' labels, or the matching Pods are failing their `readinessProbe`.
- **C.** CoreDNS is not running in `kube-system`, so Kubernetes cannot discover Pod IP addresses for Endpoints.
- **D.** The Service type is `ClusterIP` instead of `LoadBalancer`, which does not populate Endpoints objects.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một `Service` tên `web-svc` trong namespace `prod` có `port: 80` và `targetPort: 8080`, nhưng `kubectl get endpoints web-svc -n prod` trả về `<none>`. Những nguyên nhân nào có khả năng cao nhất?

**Đáp án đúng:** **B**

Khi `kubectl get endpoints <svc>` hiển thị `<none>`, hãy kiểm tra ngay 2 điểm: (1) `spec.selector` có khớp `metadata.labels` của Pod không; (2) Pod có `Ready` (pass `readinessProbe`) không.

- **A:** Sai vì nếu NodePort ngoài dải hợp lệ, API Server sẽ từ chối tạo Service ngay từ đầu chứ không để Endpoints là `<none>`.
- **B (Đúng):** Đúng! Endpoints chỉ được điền IP của các Pod khớp `spec.selector` VÀ đang ở trạng thái `Ready` (pass `readinessProbe`).
- **C:** Sai vì CoreDNS chỉ xử lý phân giải DNS, không ảnh hưởng đến việc EndpointSlice Controller điền IP vào Endpoints.
- **D:** Sai vì cả `ClusterIP`, `NodePort` và `LoadBalancer` đều tạo Endpoints giống nhau.

</details>

### Câu 5 `medium`

A Pod in namespace `frontend` needs to connect to a Service named `orders` in namespace `backend` on port `8080`. Which DNS name is the fully qualified domain name (FQDN) for that Service?

- **A.** orders.svc.backend.cluster.local
- **B.** backend.orders.svc.cluster.local
- **C.** orders.backend.pod.cluster.local
- **D.** orders.backend.svc.cluster.local

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một Pod trong namespace `frontend` cần kết nối tới một Service tên `orders` trong namespace `backend` trên cổng `8080`. Tên DNS nào là fully qualified domain name (FQDN) cho Service đó?

**Đáp án đúng:** **D**

FQDN của Service: `<service>.<namespace>.svc.cluster.local`. Nếu gọi cùng namespace có thể rút gọn thành `<service>`, khác namespace có thể rút gọn thành `<service>.<namespace>`.

- **A:** Sai vì từ khóa `svc` phải đứng ngay sau `<namespace>`.
- **B:** Sai vì thứ tự đúng là tên Service trước, rồi mới đến tên Namespace.
- **C:** Sai vì `.pod.cluster.local` là tên miền cho Pod IP, không phải cho Service.
- **D (Đúng):** Đúng! Cấu trúc FQDN chuẩn của Kubernetes Service là `<service-name>.<namespace>.svc.cluster.local`.

</details>

---

[Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md)
