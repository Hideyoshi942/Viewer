# Làm chủ Workloads & Lập lịch Pod trong CKA (Domain 2 — 15%)

Domain 2 kiểm tra khả năng điều khiển vòng đời ứng dụng (Deployment, RollingUpdate/Rollback, ConfigMap/Secret, Multi-container Pod) và cơ chế điều phối Pod lên đúng Node (Taints/Tolerations, NodeSelector, NodeAffinity, Topology Spread, Static Pods).

---

## 1. Deployment: RollingUpdate, Rollback & Scaling

### 1.1. Lệnh Imperative quản lý Deployment
```bash
# Tạo Deployment nhanh
kubectl create deployment web --image=nginx:1.25 --replicas=3 -n prod

# Cập nhật image (tạo Revision mới) kèm --record hoặc annotate change-cause
kubectl set image deployment/web nginx=nginx:1.26 -n prod
kubectl annotate deployment/web kubernetes.io/change-cause="Upgrade nginx to 1.26" -n prod

# Theo dõi tiến trình rollout và xem lịch sử revision
kubectl rollout status deployment/web -n prod
kubectl rollout history deployment/web -n prod
kubectl rollout history deployment/web --revision=2 -n prod

# Rollback về phiên bản ngay trước đó hoặc về revision cụ thể
kubectl rollout undo deployment/web -n prod
kubectl rollout undo deployment/web --to-revision=1 -n prod

# Tạm dừng và tiếp tục rollout (gom nhiều thay đổi trước khi tạo ReplicaSet mới)
kubectl rollout pause deployment/web -n prod
kubectl set resources deployment/web -c=nginx --requests=cpu=100m,memory=128Mi --limits=cpu=200m,memory=256Mi -n prod
kubectl rollout resume deployment/web -n prod
```

### 1.2. Chiến lược cập nhật (`strategy`)
- **`RollingUpdate`** (mặc định):
  - `maxSurge`: Số Pod tối đa có thể tạo **vượt quá** `replicas` mong muốn (ví dụ `25%` hoặc `1`).
  - `maxUnavailable`: Số Pod tối đa được phép **không sẵn sàng** trong lúc cập nhật (ví dụ `25%` hoặc `0` để đảm bảo zero-downtime).
- **`Recreate`**: Xóa toàn bộ Pod cũ trước khi tạo Pod mới (dùng khi ứng dụng không thể chạy song song 2 phiên bản hoặc dùng volume `RWO` gắn chặt 1 Pod).

---

## 2. Taints & Tolerations vs Node Affinity

| Cơ chế | Tác dụng | Áp dụng ở đâu? | Hành vi mặc định |
| :--- | :--- | :--- | :--- |
| **Taints & Tolerations** | **Đẩy (Repel)** Pod không mong muốn khỏi Node | Taint đặt trên **Node**; Toleration đặt trong `pod.spec` | Pod có Toleration vẫn **có thể** chạy trên Node khác không có Taint |
| **NodeSelector / NodeAffinity** | **Hút (Attract)** Pod về đúng Node có nhãn khớp | Label đặt trên **Node**; Rule đặt trong `pod.spec` | Bắt buộc hoặc ưu tiên Pod chỉ chạy trên Node khớp nhãn |

> **Kết hợp cả hai trong thực tế (Dedicated Nodes)**: Để dành riêng nhóm Node GPU chỉ cho Pod AI chạy, bạn phải vừa **đánh Taint** lên Node GPU (để đẩy Pod thường ra) vừa **gắn NodeAffinity** trên Pod AI (để hút Pod AI chỉ vào Node GPU).

### 2.1. Taints & Tolerations
```bash
# Đánh Taint lên node
kubectl taint nodes node01 dedicated=gpu:NoSchedule

# Gỡ Taint (thêm dấu '-' ở cuối)
kubectl taint nodes node01 dedicated=gpu:NoSchedule-
```

Ba hiệu ứng (`effect`) của Taint:
1. **`NoSchedule`**: Chặn lập lịch Pod mới không có Toleration khớp; giữ nguyên Pod đang chạy.
2. **`PreferNoSchedule`**: Cố gắng tránh đặt Pod mới lên Node, nhưng vẫn đặt nếu không còn Node nào khác.
3. **`NoExecute`**: Vừa chặn Pod mới, vừa **trục xuất (evict) ngay lập tức** Pod đang chạy nếu thiếu Toleration (hoặc sau `tolerationSeconds`).

```yaml
tolerations:
- key: "dedicated"
  operator: "Equal"      # Hoặc "Exists" (không cần khai báo value)
  value: "gpu"
  effect: "NoSchedule"
```

### 2.2. Node Affinity
```yaml
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
      - matchExpressions:
        - key: disktype
          operator: In    # In, NotIn, Exists, DoesNotExist, Gt, Lt
          values:
          - ssd
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 80
      preference:
        matchExpressions:
        - key: topology.kubernetes.io/zone
          operator: In
          values:
          - us-east-1a
```

---

## 3. Manual Scheduling (`nodeName`) & Static Pods

### 3.1. Chỉ định Node trực tiếp (`spec.nodeName`)
Nếu `kube-scheduler` đang bị tắt hoặc đề bài yêu cầu đặt Pod thẳng lên `node02` bỏ qua Scheduler:
- Đặt trường `spec.nodeName: node02` trong manifest Pod.
- Lưu ý: Không thể `kubectl edit` trường `nodeName` của một Pod đang tồn tại (`Pending`) — bạn phải xuất YAML, thêm `nodeName`, rồi `kubectl replace --force -f pod.yaml`.

### 3.2. Static Pods
- Được quản lý **trực tiếp bởi `kubelet`** trên một Node cụ thể, không cần `kube-apiserver` hay `kube-scheduler`.
- Đường dẫn thư mục chứa manifest nằm ở tham số `staticPodPath` trong `/var/lib/kubelet/config.yaml` (mặc định là **`/etc/kubernetes/manifests`**).
- Khi nhìn từ Control Plane qua `kubectl get pods`, Static Pod xuất hiện dưới dạng **Mirror Pod** (chỉ đọc) với tên `<pod-name>-<node-name>`. Không thể xóa Static Pod bằng `kubectl delete pod` — phải xóa file YAML trong `staticPodPath` trên chính Node đó.

---

## 4. ConfigMap, Secret & Resource Requests/Limits

```bash
# Tạo ConfigMap từ literal hoặc file
kubectl create configmap app-config --from-literal=ENV=prod --from-file=app.properties

# Tạo Secret kiểu generic và kiểu docker-registry
kubectl create secret generic db-secret --from-literal=PASS=S3cr3t!
kubectl create secret tls web-tls --cert=tls.crt --key=tls.key
```

### Thứ tự ưu tiên QoS Class (Quality of Service)
1. **`Guaranteed`**: Mọi container trong Pod đều khai báo `requests == limits` cho cả `cpu` và `memory` (ưu tiên giữ lại cao nhất khi Node thiếu RAM).
2. **`Burstable`**: Có ít nhất 1 container khai báo `requests` hoặc `limits` nhưng không đạt chuẩn `Guaranteed`.
3. **`BestEffort`**: Không container nào khai báo `requests` hay `limits` (bị `kubelet` kill đầu tiên khi Node cạn bộ nhớ — `OOMKilled`).

---

## 5. Ba loại Health Probes (`startupProbe`, `livenessProbe`, `readinessProbe`)

| Loại Probe | Mục đích | Hành động khi thất bại |
| :--- | :--- | :--- |
| **`startupProbe`** | Bảo vệ ứng dụng khởi động chậm (Java/Spring, DB) | Chặn `livenessProbe` và `readinessProbe` chưa cho chạy; nếu quá `failureThreshold * periodSeconds` thì restart container |
| **`livenessProbe`** | Phát hiện container bị treo (deadlock) | `kubelet` **khởi động lại (restart) container** |
| **`readinessProbe`** | Kiểm tra ứng dụng sẵn sàng nhận traffic chưa | Gỡ IP Pod khỏi **Endpoints / EndpointSlice của Service** (KHÔNG restart container) |

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 15
  periodSeconds: 10
  failureThreshold: 3
readinessProbe:
  tcpSocket:
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## 6. Multi-Container Pod Patterns (Init, Sidecar, Adapter, Ambassador)

- **`initContainers`**: Chạy tuần tự **trước** khi các app container khởi động; mỗi `initContainer` phải thoát với mã `0` (`Completed`) thì container tiếp theo mới chạy.
- **Native Sidecar (`initContainers` với `restartPolicy: Always` từ K8s 1.29+)**: Chạy song song cùng app container trong suốt vòng đời Pod nhưng khởi động trước app container và tắt sau cùng.
- **Shared Volume (`emptyDir`)**: Hai container trong cùng Pod chia sẻ file log/dữ liệu bằng cách cùng mount một `emptyDir` volume.

---

[← Bài trước](04-helm-kustomize.md) | [Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/05-deployments-config-probes.md) | [Bài tiếp →](06-scheduling-taints-affinity.md)
