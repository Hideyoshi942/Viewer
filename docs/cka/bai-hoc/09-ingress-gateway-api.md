# Định tuyến HTTP/HTTPS — Ingress Controller & Gateway API (Domain 3)

Trong Domain 3 (Services & Networking — 20%), bên cạnh `Ingress` truyền thống, đề thi CKA hiện đại đã đưa **Kubernetes Gateway API** vào trọng tâm đánh giá.

---

## 1. Ingress & IngressClass

`Ingress` hoạt động ở Layer 7 (HTTP/HTTPS), định tuyến lưu lượng bên ngoài vào các `ClusterIP` Service dựa trên Hostname và Path.

```bash
# Tạo Ingress nhanh bằng lệnh imperative
kubectl create ingress web-ing \
  --class=nginx \
  --rule="app.example.com/api*=api-svc:8080" \
  --rule="app.example.com/*=web-svc:80,tls=web-tls-secret"
```

| `pathType` | Đường dẫn cấu hình | Khớp với URL nào? |
| :--- | :--- | :--- |
| `Exact` | `/app` | Chỉ khớp `/app` (không khớp `/app/` hay `/app/v1`) |
| `Prefix` | `/app` | Khớp `/app`, `/app/`, `/app/v1` (không khớp `/apple`) |
| `ImplementationSpecific` | Tùy Ingress Controller | Theo quy tắc riêng của Controller (ví dụ NGINX regex) |

---

## 2. Kubernetes Gateway API (Thế hệ mới thay thế Ingress)

Gateway API tách bạch trách nhiệm theo vai trò (Role-oriented):

| Resource | Vai trò quản lý | Nhiệm vụ |
| :--- | :--- | :--- |
| **GatewayClass** | Infrastructure Provider | Định nghĩa loại controller (vd: `nginx`, `cilium`, `envoy`) |
| **Gateway** | Cluster Operator | Mở cổng lắng nghe (Listener port 80/443, TLS certificate) |
| **HTTPRoute** | Application Developer | Định nghĩa rules chuyển tiếp HTTP (hostnames, paths, weight traffic splitting) |

### Ví dụ Gateway & HTTPRoute (Canary Traffic Splitting 80/20)

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: web-gateway
  namespace: prod
spec:
  gatewayClassName: nginx
  listeners:
  - name: http
    protocol: HTTP
    port: 80
---
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: app-route
  namespace: prod
spec:
  parentRefs:
  - name: web-gateway
  hostnames:
  - "shop.example.com"
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /
    backendRefs:
    - name: app-v1-svc
      port: 80
      weight: 80
    - name: app-v2-svc
      port: 80
      weight: 20
```

---

## 3. Kiểm tra & Debug Ingress / Gateway

```bash
# Kiểm tra địa chỉ IP và rules của Ingress
kubectl get ingress -A
kubectl describe ingress web-ing

# Kiểm tra Gateway và trạng thái Accepted / Programmed
kubectl get gatewayclass,gateway,httproute -A
kubectl describe httproute app-route -n prod
```

---

## 4. Exam Tips

1. Luôn kiểm tra `kubectl get ingressclass` trước khi tạo Ingress để biết tên `ingressClassName` chính xác đang cài trong cụm.
2. Khi cấu hình TLS cho Ingress, Secret chứa `tls.crt` và `tls.key` **bắt buộc phải nằm cùng Namespace** với Ingress resource.
3. Với Gateway API, nếu `HTTPRoute` nằm khác Namespace với `Gateway`, Gateway cần khai báo `allowedRoutes.namespaces.from: All` (hoặc `Selector`), và cần có `ReferenceGrant` nếu `HTTPRoute` trỏ tới Service ở Namespace khác.

---

[← Bài trước](08-networking-ingress-gateway-netpol.md) | [Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/09-ingress-gateway-api.md) | [Bài tiếp →](10-network-policies.md)
