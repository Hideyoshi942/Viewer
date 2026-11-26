# Cheatsheet CKA: Services, CoreDNS, Gateway API & NetworkPolicy (20%)

## 1. Services & CoreDNS
```bash
kubectl expose deployment web --port=80 --target-port=8080 --type=ClusterIP
kubectl expose pod api --port=8080 --type=NodePort   # NodePort range: 30000-32767
kubectl get endpoints,endpointslices
```
- **Service FQDN**: `<svc>.<ns>.svc.cluster.local`
- **Headless Service (`clusterIP: None`) Pod FQDN**: `<pod-name>.<svc>.<ns>.svc.cluster.local`
- **Pod DNS**: `<a-b-c-d>.<ns>.pod.cluster.local`

## 2. Ingress vs Gateway API
```bash
kubectl create ingress web-ing --class=nginx --rule="app.example.com/api*=api-svc:8080"
```
- **Gateway API (`gateway.networking.k8s.io/v1`)**:
  - `GatewayClass` (Cluster-scoped) -> `Gateway` (`gatewayClassName`, `listeners`) -> `HTTPRoute` (`parentRefs`, `hostnames`, `rules.matches`, `rules.backendRefs`).
  - Kiểm tra: `kubectl get gatewayclass,gateway,httproute -A` và `kubectl describe httproute <name>`.

## 3. NetworkPolicy — Bảng Tra cứu Nhanh
| Tình huống | Cấu hình YAML |
| :--- | :--- |
| **Default Deny All Ingress** | `podSelector: {}`, `policyTypes: ["Ingress"]` (không có mục `ingress:`) |
| **Default Deny All Egress** | `podSelector: {}`, `policyTypes: ["Egress"]` (không có mục `egress:`) |
| **AND** (Namespace VÀ Pod) | `namespaceSelector` và `podSelector` **chung 1 dấu `-`** trong `from`/`to` |
| **OR** (Namespace HOẶC Pod) | `- namespaceSelector` và `- podSelector` là **2 dấu `-` tách rời** |
| **Mở DNS khi bật Egress** | Cho phép `UDP 53` và `TCP 53` tới `kube-system` (`k8s-app: kube-dns`) |
| **Chọn Namespace không cần tự gắn label** | Dùng nhãn có sẵn: `kubernetes.io/metadata.name: <ns-name>` |

---

[Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md)
