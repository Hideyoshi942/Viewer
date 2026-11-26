# Cheatsheet CKA: Workloads & Scheduling (15%)

## 1. Deployment Rollout & Rollback
```bash
kubectl create deployment web --image=nginx:1.25 --replicas=3
kubectl set image deployment/web nginx=nginx:1.26
kubectl rollout status deployment/web
kubectl rollout history deployment/web
kubectl rollout undo deployment/web --to-revision=1
kubectl scale deployment/web --replicas=5
```

## 2. Taints & Tolerations vs NodeAffinity
```bash
# Đánh taint và gỡ taint (thêm dấu '-' ở cuối)
kubectl taint nodes node01 gpu=true:NoSchedule
kubectl taint nodes node01 gpu=true:NoSchedule-
```
- **3 Taint Effects**: `NoSchedule` (chặn Pod mới, giữ Pod cũ), `PreferNoSchedule` (ưu tiên tránh), `NoExecute` (chặn Pod mới + **evict ngay Pod cũ** không có Toleration).
- **NodeAffinity**:
  - `requiredDuringSchedulingIgnoredDuringExecution`: Điều kiện cứng (không khớp -> `Pending`).
  - `preferredDuringSchedulingIgnoredDuringExecution`: Điều kiện mềm (có trọng số `weight`).

## 3. DaemonSet, StatefulSet, Job, CronJob
- **DaemonSet**: Chạy 1 Pod/Node. Muốn chạy trên Control Plane phải thêm Toleration `node-role.kubernetes.io/control-plane` (`operator: Exists`, `effect: NoSchedule`).
- **StatefulSet**: Bắt buộc có `serviceName` trỏ tới **Headless Service (`clusterIP: None`)**, tên Pod cố định `<name>-0`, `<name>-1`, dùng `volumeClaimTemplates`.
- **Job & CronJob**:
  ```bash
  kubectl create job my-job --image=busybox:1.36 -- sh -c "date; sleep 3"
  kubectl create cronjob my-cj --image=busybox:1.36 --schedule="*/5 * * * *" -- date
  kubectl create job test-cj --from=cronjob/my-cj
  ```
  - Job bắt buộc `restartPolicy: Never` hoặc `OnFailure`.

## 4. HPA & PodDisruptionBudget (PDB)
```bash
# Tạo HPA (yêu cầu Metrics Server + Pod có resources.requests)
kubectl autoscale deployment web --cpu-percent=60 --min=2 --max=10
```
- **PDB (`policy/v1`)**: Chỉ định `minAvailable` **hoặc** `maxUnavailable` (không dùng cả hai). Nếu `ALLOWED DISRUPTIONS = 0`, `kubectl drain` sẽ bị chặn!

## 5. Health Probes & QoS Class
- **`startupProbe`**: Chạy trước; chặn `liveness` & `readiness` cho đến khi thành công.
- **`livenessProbe`**: Thất bại -> **Restart container**.
- **`readinessProbe`**: Thất bại -> **Gỡ Pod khỏi Endpoints của Service** (không restart).
- **QoS**: `Guaranteed` (`requests == limits` cho CPU & Mem mọi container) > `Burstable` > `BestEffort`.

---

[Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md)
