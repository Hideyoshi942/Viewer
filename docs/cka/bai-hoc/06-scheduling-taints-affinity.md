# Lập lịch Pod Nâng cao — Taints/Tolerations, NodeAffinity & DaemonSet (Domain 2)

Hiểu rõ cách `kube-scheduler` quyết định đặt Pod lên Node nào là kỹ năng cốt lõi của Domain 2 (Workloads & Scheduling).

---

## 1. So sánh các Cơ chế Lập lịch (Scheduling Mechanisms)

| Cơ chế | Hướng tác động | Hành vi khi không thỏa mãn | Dùng cho |
| :--- | :--- | :--- | :--- |
| `nodeName` | Pod -> Node (gắn cứng) | Bỏ qua `kube-scheduler` | Static Pods, test nhanh |
| `nodeSelector` | Pod -> Node (label đơn giản) | Pod ở trạng thái `Pending` | Chọn `disktype=ssd` |
| **NodeAffinity** | Pod -> Node (biểu thức linh hoạt) | `required` -> Pending; `preferred` -> ưu tiên | Toán tử `In`, `NotIn`, `Exists`, `Gt` |
| **Taints & Tolerations** | Node đẩy Pod ra (xua đuổi) | Pod không có Toleration sẽ bị từ chối/evict | Dành riêng Node (GPU, Control Plane) |

> [!IMPORTANT]
> **Cạm bẫy kinh điển:** Taints & Tolerations **không đảm bảo** Pod có Toleration sẽ chạy trên Node bị Taint (nó chỉ *cho phép* Pod chạy trên Node đó, Pod vẫn có thể bị schedule sang Node khác không có Taint). Muốn **bắt buộc** Pod chỉ chạy trên Node chuyên dụng, phải kết hợp **Taint + Toleration + NodeAffinity**.

---

## 2. Taints & Tolerations

Có 3 hiệu ứng (effect) của Taint:
- `NoSchedule`: Không schedule Pod mới nếu không có Toleration tương ứng (Pod đang chạy giữ nguyên).
- `PreferNoSchedule`: Cố gắng tránh đặt Pod mới lên Node, nhưng nếu hết Node vẫn có thể đặt.
- `NoExecute`: Không schedule Pod mới VÀ **evict (đẩy ra)** các Pod đang chạy nếu không có Toleration (trừ khi có `tolerationSeconds`).

```bash
# Gắn taint lên node01
kubectl taint nodes node01 app=blue:NoSchedule

# Gỡ taint khỏi node01 (thêm dấu '-' ở cuối)
kubectl taint nodes node01 app=blue:NoSchedule-
```

```yaml
spec:
  tolerations:
  - key: "app"
    operator: "Equal"
    value: "blue"
    effect: "NoSchedule"
  containers:
  - name: nginx
    image: nginx
```

---

## 3. NodeAffinity & PodTopologySpread

```yaml
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: kubernetes.io/os
            operator: In
            values: ["linux"]
          - key: disktype
            operator: Exists
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 80
        preference:
          matchExpressions:
          - key: zone
            operator: In
            values: ["us-east-1a"]
```

---

## 4. DaemonSet — Chạy trên Mọi Node (bao gồm Control Plane)

`DaemonSet` đảm bảo mỗi Worker Node chạy đúng 1 bản sao Pod (ví dụ: log collector `fluentd`, CNI `calico-node`, `kube-proxy`). Mặc định Control Plane node có taint `node-role.kubernetes.io/control-plane:NoSchedule`. Để DaemonSet chạy được trên cả Control Plane, cần thêm `tolerations`:

```yaml
spec:
  template:
    spec:
      tolerations:
      - key: node-role.kubernetes.io/control-plane
        operator: Exists
        effect: NoSchedule
```

---

## 5. Exam Tips

- `kubectl create deployment` không hỗ trợ tạo DaemonSet trực tiếp. Mẹo nhanh: tạo YAML từ `kubectl create deploy ds-demo --image=nginx --dry-run=client -o yaml > ds.yaml`, sau đó đổi `kind: DaemonSet`, xóa `replicas:` và `strategy:`.
- Kiểm tra lý do Pod bị `Pending`: luôn chạy `kubectl describe pod <name>` và đọc phần `Events:` ở cuối.

---

[← Bài trước](05-workloads-scheduling-probes.md) | [Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/06-scheduling-taints-affinity.md) | [Bài tiếp →](07-workloads-advanced-hpa-pdb.md)
