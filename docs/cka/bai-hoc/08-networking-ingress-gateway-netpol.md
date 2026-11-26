# Mạng Kubernetes: Services, CoreDNS, Ingress, Gateway API & NetworkPolicy (Domain 3 — 20%)

Domain 3 chiếm **20% điểm thi** CKA. Ngoài Services, CoreDNS, Ingress và NetworkPolicy truyền thống, kỳ thi CKA hiện đại đã cập nhật trọng tâm vào **Kubernetes Gateway API** (`GatewayClass`, `Gateway`, `HTTPRoute`).

---

## 1. Bốn loại Kubernetes Services & Lệnh Imperative

| Loại Service | Phạm vi truy cập | Đặc điểm kỹ thuật |
| :--- | :--- | :--- |
| **`ClusterIP`** (Mặc định) | Chỉ nội bộ cụm | Cấp IP ảo ổn định, định tuyến qua `kube-proxy` (iptables/IPVS) tới Endpoints |
| **`NodePort`** | Bên ngoài qua `<NodeIP>:<NodePort>` | Mở cổng tĩnh trong dải **`30000–32767`** trên tất cả các Node |
| **`LoadBalancer`** | Bên ngoài qua Cloud LB | Tự động tạo NodePort + ClusterIP, tích hợp Cloud Controller Manager |
| **`ExternalName` / Headless (`clusterIP: None`)** | Nội bộ cụm | `ExternalName` trả về CNAME; **Headless** trả về thẳng IP từng Pod (dùng cho `StatefulSet`) |

```bash
# Expose nhanh một Deployment thành ClusterIP hoặc NodePort
kubectl expose deployment web --port=80 --target-port=8080 --type=ClusterIP --name=web-svc
kubectl expose pod api --port=8080 --target-port=8080 --type=NodePort --name=api-nodeport

# Kiểm tra Endpoints / EndpointSlice thực tế (rất quan trọng khi debug Service không có traffic)
kubectl get endpoints web-svc
kubectl get endpointslices -l kubernetes.io/service-name=web-svc
```

---

## 2. CoreDNS & Phân giải Tên miền trong Cụm

Mọi Pod trong cụm mặc định dùng `coredns` (Service `kube-dns` tại namespace `kube-system`, cổng **UDP/TCP 53**) để phân giải tên miền:
- **Service FQDN**: `<service-name>.<namespace>.svc.cluster.local`
  - Ví dụ Pod ở namespace `frontend` gọi Service `api` ở namespace `backend`: `http://api.backend.svc.cluster.local:8080` (hoặc ngắn gọn `http://api.backend:8080`).
- **Pod DNS Record**: `<pod-ip-với-dấu-gạch-ngang>.<namespace>.pod.cluster.local` (ví dụ `10-244-1-5.default.pod.cluster.local`).
- **StatefulSet Pod FQDN** (với Headless Service `db-hl`): `mysql-0.db-hl.prod.svc.cluster.local`.

### Lệnh kiểm tra nhanh DNS từ bên trong cụm
```bash
kubectl run tmp-dns --image=busybox:1.36 --rm -it --restart=Never -- nslookup web-svc.prod.svc.cluster.local
```

---

## 3. Ingress vs Kubernetes Gateway API

### 3.1. Ingress truyền thống
```bash
# Tạo nhanh Ingress bằng lệnh imperative
kubectl create ingress web-ing \
  --class=nginx \
  --rule="app.example.com/api*=api-svc:8080" \
  --rule="app.example.com/*=web-svc:80" \
  -n prod
```

- Lưu ý `pathType`: `Prefix` (khớp tiền tố đường dẫn), `Exact` (khớp chính xác tuyệt đối), `ImplementationSpecific`.
- TLS trong Ingress: Tham chiếu `secretName` (Secret loại `kubernetes.io/tls` nằm **cùng namespace** với Ingress).

### 3.2. Kubernetes Gateway API (Trọng tâm mới trong CKA)
Gateway API thay thế Ingress bằng mô hình phân tách vai trò rõ ràng gồm 3 tài nguyên:
1. **`GatewayClass`** (Cluster-scoped — Hạ tầng/Platform): Khai báo controller nào xử lý (ví dụ `controllerName: example.net/gateway-controller`).
2. **`Gateway`** (Namespace-scoped — Cluster Operator): Khai báo cổng lắng nghe (`listeners`: HTTP 80, HTTPS 443, TLS secret) và `gatewayClassName`.
3. **`HTTPRoute`** (Namespace-scoped — App Developer): Định nghĩa luật định tuyến (`hostnames`, `rules`, `matches`, `backendRefs`) và gắn vào Gateway qua `parentRefs`.

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: prod-gateway
  namespace: prod
spec:
  gatewayClassName: nginx-gateway
  listeners:
  - name: http
    protocol: HTTP
    port: 80
    allowedRoutes:
      namespaces:
        from: Same    # Hoặc All, Selector
---
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: api-route
  namespace: prod
spec:
  parentRefs:
  - name: prod-gateway
    namespace: prod
  hostnames:
  - "api.example.com"
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /v1
    backendRefs:
    - name: api-v1-svc
      port: 8080
      weight: 90
    - name: api-v2-svc
      port: 8080
      weight: 10
```

> **Kiểm tra nhanh Gateway API**: `kubectl get gatewayclass,gateway,httproute -A` và `kubectl describe httproute api-route -n prod` để xem trạng thái `Accepted` / `ResolvedRefs`.

---

## 4. Thiết kế `NetworkPolicy` Chuẩn Xác (Ingress & Egress)

### 4.1. Nguyên tắc vàng
- Mặc định khi chưa có NetworkPolicy nào chọn Pod: **Allow All** (mọi kết nối vào/ra đều được phép).
- Ngay khi có **ít nhất 1 NetworkPolicy** chọn Pod qua `podSelector` và khai báo `policyTypes: ["Ingress"]` (hoặc `["Egress"]`), mọi kết nối theo hướng đó mà **không được cho phép rõ ràng** sẽ bị **CHẶN (Default Deny)**.
- Nhiều NetworkPolicy áp dụng lên cùng 1 Pod sẽ được **cộng gộp (Union / OR)**.

### 4.2. Cạm bẫy kinh điển: `AND` vs `OR` trong `from` / `to`
- **Cùng 1 phần tử danh sách (chung 1 dấu `-`)** = Phép **AND**:
  ```yaml
  from:
  - namespaceSelector:
      matchLabels:
        env: prod
    podSelector:
      matchLabels:
        role: web
  # Chỉ cho phép Pod có label role=web VÀ nằm trong namespace có label env=prod
  ```
- **Hai phần tử danh sách tách rời (hai dấu `-`)** = Phép **OR**:
  ```yaml
  from:
  - namespaceSelector:
      matchLabels:
        env: prod
  - podSelector:
      matchLabels:
        role: web
  # Cho phép MỌI Pod trong namespace env=prod HOẶC Pod role=web trong cùng namespace hiện tại
  ```

### 4.3. Mẫu Default Deny All & Cho phép Egress DNS
```yaml
# 1. Default Deny toàn bộ Ingress & Egress trong namespace prod
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: prod
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
---
# 2. Mở Egress DNS (UDP/TCP 53) để Pod phân giải được tên miền
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns-egress
  namespace: prod
spec:
  podSelector: {}
  policyTypes:
  - Egress
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: kube-system
      podSelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - protocol: UDP
      port: 53
    - protocol: TCP
      port: 53
```

> **Mẹo thi CKA**: Từ Kubernetes 1.21+, mọi Namespace đều tự động có sẵn label `kubernetes.io/metadata.name: <namespace-name>` — bạn có thể dùng trực tiếp trong `namespaceSelector` mà không cần tự gán nhãn thủ công!

---

[← Bài trước](07-workloads-advanced-hpa-pdb.md) | [Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/08-services-coredns.md) | [Bài tiếp →](09-ingress-gateway-api.md)
