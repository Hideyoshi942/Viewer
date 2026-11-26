# Cô lập Lưu lượng Mạng với NetworkPolicy (Domain 3)

Mặc định trong Kubernetes, mọi Pod có thể giao tiếp tự do với mọi Pod khác trên toàn cụm. `NetworkPolicy` là tường lửa Layer 3/4 giúp cô lập lưu lượng **Ingress** (chiều vào Pod) và **Egress** (chiều ra khỏi Pod).

> [!WARNING]
> **Điều kiện tiên quyết:** CNI Plugin của cụm phải hỗ trợ NetworkPolicy (như Calico, Cilium, Weave). Plugin đơn giản như Flannel mặc định **không** thực thi NetworkPolicy.

---

## 1. Quy tắc Vàng về Logic AND vs OR trong `from` / `to`

Đây là điểm dễ mất điểm nhất trong bài thi CKA:

```yaml
# TRƯỜNG HỢP 1: CÙNG 1 PHẦN TỬ MẢNG (Không có dấu '-' trước podSelector) -> LOGIC AND
ingress:
- from:
  - namespaceSelector:
      matchLabels:
        kubernetes.io/metadata.name: frontend
    podSelector:
      matchLabels:
        role: web
# Ý nghĩa: Chỉ cho phép Pod có nhãn role=web VÀ nằm TRONG namespace frontend.

# TRƯỜNG HỢP 2: KHÁC PHẦN TỬ MẢNG (Có dấu '-' trước cả 2 selector) -> LOGIC OR
ingress:
- from:
  - namespaceSelector:
      matchLabels:
        kubernetes.io/metadata.name: frontend
  - podSelector:
      matchLabels:
        role: web
# Ý nghĩa: Cho phép TẤT CẢ Pod ở namespace frontend HOẶC Pod có role=web ở CÙNG namespace hiện tại.
```

---

## 2. Default Deny All & Mở DNS Egress

Khi áp dụng `policyTypes: [Egress]` chặn toàn bộ chiều ra, Pod sẽ **không thể phân giải tên miền Service** nếu quên mở cổng UDP/TCP 53 tới CoreDNS!

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: secure-app
spec:
  podSelector: {}   # Chọn TẤT CẢ Pod trong namespace secure-app
  policyTypes:
  - Ingress
  - Egress
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns-egress
  namespace: secure-app
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

---

## 3. Nhãn tự động `kubernetes.io/metadata.name`

Từ Kubernetes 1.21+, mọi Namespace đều tự động được gắn nhãn `kubernetes.io/metadata.name: <tên-namespace>`. Bạn không cần phải chạy `kubectl label ns ...` thủ công khi viết `namespaceSelector` theo tên Namespace.

---

## 4. Exam Tips — Kiểm thử Nhanh Sau Khi Áp dụng

```bash
# Test kết nối HTTP với timeout 2 giây để không bị treo terminal
kubectl exec -n frontend test-pod -- curl -m 2 -s http://api-svc.backend.svc.cluster.local:8080

# Hoặc dùng nc (netcat) kiểm tra port TCP
kubectl exec -n frontend test-pod -- nc -zv -w 2 db-svc.backend 5432
```

---

[← Bài trước](09-ingress-gateway-api.md) | [Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/10-network-policies.md) | [Bài tiếp →](11-storage-pv-pvc-storageclass.md)
