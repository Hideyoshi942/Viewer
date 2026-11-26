# Workloads Chuyên sâu: DaemonSet, StatefulSet, Job/CronJob, HPA & PDB (Domain 2)

Bên cạnh `Deployment`, bài thi CKA thường xuyên kiểm tra khả năng triển khai và xử lý sự cố với **DaemonSet**, **StatefulSet**, **Job/CronJob**, **HorizontalPodAutoscaler (HPA)** và **PodDisruptionBudget (PDB)**.

---

## 1. DaemonSet — Mỗi Node 1 Bản sao

- **Đặc điểm**: Tự động chạy đúng 1 Pod trên mỗi Node phù hợp (khi thêm Node mới, DaemonSet tự tạo Pod trên Node đó).
- **Chạy trên Control Plane**: Control Plane mặc định có taint `node-role.kubernetes.io/control-plane:NoSchedule`. Để DaemonSet chạy được cả trên Control Plane, thêm Toleration vào `spec.template.spec.tolerations`:

```yaml
tolerations:
- key: node-role.kubernetes.io/control-plane
  operator: Exists
  effect: NoSchedule
```

- **Chiến lược cập nhật (`updateStrategy`)**:
  - `RollingUpdate` (mặc định): Cập nhật lần lượt từng Node.
  - `OnDelete`: Chỉ tạo Pod mới khi bạn xóa thủ công Pod cũ trên Node.

---

## 2. StatefulSet — Ứng dụng Có trạng thái (Stateful)

Khác với Deployment tạo Pod ngẫu nhiên, **StatefulSet** đảm bảo:
1. **Định danh mạng ổn định (Sticky Identity)**: Tên Pod có chỉ số thứ tự `<sts-name>-0`, `<sts-name>-1`, `<sts-name>-2`.
2. **Thứ tự khởi tạo & xóa tuần tự (`OrderedReady`)**: Tạo từ `0 -> 1 -> 2` (Pod sau chỉ tạo khi Pod trước đã `Ready`), xóa ngược từ `2 -> 1 -> 0`.
3. **Lưu trữ bền vững riêng biệt (`volumeClaimTemplates`)**: Mỗi Pod có một PVC riêng (`data-mysql-0`, `data-mysql-1`) và PVC **KHÔNG bị tự động xóa** khi scale down hoặc xóa StatefulSet.
4. **Bắt buộc có Headless Service (`clusterIP: None`)** khai báo qua `spec.serviceName` để tạo DNS riêng cho từng Pod: `<pod-name>.<headless-svc>.<namespace>.svc.cluster.local`.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: db-headless
spec:
  clusterIP: None
  selector:
    app: mysql
  ports:
  - port: 3306
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  serviceName: "db-headless"
  replicas: 3
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        ports:
        - containerPort: 3306
        volumeMounts:
        - name: data
          mountPath: /var/lib/mysql
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: standard
      resources:
        requests:
          storage: 5Gi
```

---

## 3. Job & CronJob — Tác vụ Chạy một lần & Định kỳ

### 3.1. Job (`batch/v1`)
```bash
# Tạo nhanh Job bằng lệnh imperative
kubectl create job report-gen --image=busybox:1.36 -- sh -c "echo generating && sleep 5"
```
Các tham số quan trọng của `Job.spec`:
- **`completions`**: Tổng số Pod phải hoàn thành thành công (`Completed`).
- **`parallelism`**: Số Pod được phép chạy song song cùng lúc.
- **`backoffLimit`**: Số lần thử lại tối đa khi Pod thất bại (mặc định `6`).
- **`activeDeadlineSeconds`**: Thời gian tối đa cho phép toàn bộ Job chạy (quá hạn sẽ bị dừng với lý do `DeadlineExceeded`).
- **`ttlSecondsAfterFinished`**: Tự động xóa Job và Pod sau khi hoàn thành `N` giây.
- **Lưu ý bắt buộc**: `restartPolicy` trong Job Pod chỉ được phép là `Never` hoặc `OnFailure` (không được để `Always`).

### 3.2. CronJob (`batch/v1`)
```bash
# Tạo CronJob chạy mỗi 5 phút
kubectl create cronjob cleanup --image=busybox:1.36 --schedule="*/5 * * * *" -- rm -rf /tmp/*
# Chạy thử ngay lập tức một Job từ CronJob có sẵn để kiểm tra
kubectl create job manual-cleanup --from=cronjob/cleanup
```
- **`concurrencyPolicy`**: `Allow` (mặc định, cho phép chạy chồng lấn), `Forbid` (bỏ qua lượt mới nếu lượt cũ chưa xong), `Replace` (hủy lượt cũ, chạy lượt mới).
- **`successfulJobsHistoryLimit`** (mặc định `3`) & **`failedJobsHistoryLimit`** (mặc định `1`).

---

## 4. HorizontalPodAutoscaler (HPA)

HPA tự động tăng/giảm số `replicas` của Deployment/StatefulSet dựa trên mức sử dụng CPU/Memory (yêu cầu **Metrics Server** đang chạy và Pod **phải khai báo `resources.requests`**).

```bash
# Tạo nhanh HPA cho deployment web: giữ CPU trung bình 60%, min 2, max 10
kubectl autoscale deployment web --cpu-percent=60 --min=2 --max=10 -n prod
kubectl get hpa -n prod
```

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-hpa
  namespace: prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 60
```

---

## 5. PodDisruptionBudget (PDB) — Bảo vệ Ứng dụng khi `kubectl drain`

PDB giới hạn số Pod bị gián đoạn cùng lúc trong các **voluntary disruptions** (như `kubectl drain`, nâng cấp node). Lưu ý: PDB **chỉ bảo vệ** khỏi voluntary disruption, không ngăn được lỗi phần cứng hay `OOMKilled`.

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: web-pdb
  namespace: prod
spec:
  minAvailable: 2        # Hoặc dùng maxUnavailable: 1 (chỉ chọn 1 trong 2!)
  selector:
    matchLabels:
      app: web
```

> **Cạm bẫy thi CKA**: Nếu Deployment có `replicas: 2` mà PDB đặt `minAvailable: 2` (tức `ALLOWED DISRUPTIONS = 0`), lệnh `kubectl drain node01` sẽ bị **treo/chặn** không thể trục xuất Pod đó trừ khi bạn sửa PDB hoặc scale Deployment lên!

---

[← Bài trước](06-scheduling-taints-affinity.md) | [Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/07-statefulset-hpa-pdb.md) | [Bài tiếp →](08-networking-ingress-gateway-netpol.md)
