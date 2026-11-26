# Thẻ ghi nhớ (Flashcards) — CKA

> 30 thẻ · Đọc mặt trước, tự trả lời rồi mở đáp án.

## 1. Kiến trúc Control Plane, Static Pods & Nâng cấp cụm với kubeadm

**1. Where are Control Plane Static Pod manifests and PKI certificates located on a `kubeadm` cluster?**

<details><summary>Xem đáp án</summary>

- **Static Pod Manifests**: `/etc/kubernetes/manifests/` (`kube-apiserver.yaml`, `etcd.yaml`, `kube-scheduler.yaml`, `kube-controller-manager.yaml`).
- **PKI Certificates**: `/etc/kubernetes/pki/` (của etcd tại `/etc/kubernetes/pki/etcd/`).

</details>

**2. What is the difference between `kubeadm upgrade apply` and `kubeadm upgrade node` during a cluster upgrade?**

<details><summary>Xem đáp án</summary>

- **`kubeadm upgrade apply v1.x.y`**: Chỉ chạy trên **Control Plane node đầu tiên** để nâng cấp Control Plane manifests và cấu hình cụm.
- **`kubeadm upgrade node`**: Chạy trên các **Worker nodes** và các **Control Plane nodes phụ**.

</details>

## 2. Quản trị etcd — Sao lưu (Snapshot) & Khôi phục Cụm

**3. What are the exact commands to save and restore an `etcd` snapshot in the CKA exam?**

<details><summary>Xem đáp án</summary>

- **Save**: `ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key snapshot save /opt/backup.db`
- **Restore**: `ETCDCTL_API=3 etcdctl snapshot restore /opt/backup.db --data-dir=/var/lib/etcd-restored` (rồi sửa `hostPath` trong `/etc/kubernetes/manifests/etcd.yaml`).

</details>

## 3. Bảo mật Cụm — RBAC, ServiceAccount, CSR & Kubeconfig

**4. How do you create a `Role` + `RoleBinding` imperatively and verify permissions with `kubectl auth can-i`?**

<details><summary>Xem đáp án</summary>

- `kubectl create role dev-role --verb=get,list,watch --resource=pods -n dev`
- `kubectl create rolebinding dev-rb --role=dev-role --serviceaccount=dev:app-sa -n dev`
- Kiểm tra: `kubectl auth can-i get pods --as=system:serviceaccount:dev:app-sa -n dev`

</details>

**5. What are the key commands to approve a Kubernetes `CertificateSigningRequest` (CSR) and extract the signed certificate?**

<details><summary>Xem đáp án</summary>

- Phê duyệt: `kubectl certificate approve <csr-name>`
- Trích xuất cert: `kubectl get csr <csr-name> -o jsonpath='{.status.certificate}' | base64 -d > user.crt`

</details>

## 4. Quản lý Gói & Mở rộng Kubernetes — Helm v3, Kustomize & CRD

**6. How do you install, upgrade, rollback, and list Helm v3 releases, and how do you apply a Kustomize overlay?**

<details><summary>Xem đáp án</summary>

- **Helm**: `helm install <rel> <chart> -n <ns> --set k=v`, `helm upgrade`, `helm rollback <rel> <rev>`, `helm list -A`
- **Kustomize**: `kubectl kustomize <dir>` (xem trước) và `kubectl apply -k <dir>` (áp dụng).

</details>

## 5. Deployments, Rolling Updates, ConfigMap, Secret & Health Probes

**7. What is the difference between `livenessProbe`, `readinessProbe`, and `startupProbe` when they fail?**

<details><summary>Xem đáp án</summary>

- **`startupProbe`**: Tạm khóa `liveness` và `readiness` trong lúc app khởi động chậm; thất bại quá ngưỡng sẽ restart container.
- **`livenessProbe`**: Thất bại -> `kubelet` **restart container**.
- **`readinessProbe`**: Thất bại -> Gỡ IP Pod khỏi **Endpoints của Service** (không restart).

</details>

## 6. Lập lịch Pod Nâng cao — Taints/Tolerations, NodeAffinity & DaemonSet

**8. Difference between Taint effects: `NoSchedule`, `PreferNoSchedule`, and `NoExecute`?**

<details><summary>Xem đáp án</summary>

- **`NoSchedule`**: Chặn lập lịch Pod mới (nếu thiếu Toleration), giữ nguyên Pod đang chạy.
- **`PreferNoSchedule`**: Ưu tiên tránh đặt Pod mới lên node nhưng không bắt buộc cứng.
- **`NoExecute`**: Vừa chặn Pod mới, vừa **trục xuất (evict) ngay lập tức** các Pod đang chạy không có Toleration.

</details>

**9. How do you make a `DaemonSet` Pod run on Control Plane nodes as well?**

<details><summary>Xem đáp án</summary>

Thêm `tolerations` vào `spec.template.spec` để bỏ qua taint mặc định của Control Plane:
- `key: node-role.kubernetes.io/control-plane`
- `operator: Exists`
- `effect: NoSchedule`

</details>

## 7. Workloads Nâng cao — StatefulSet, Jobs/CronJobs, HPA & PodDisruptionBudget

**10. What are the 3 mandatory/distinctive components of a `StatefulSet` compared to a `Deployment`?**

<details><summary>Xem đáp án</summary>

1. Tham chiếu tới **Headless Service (`clusterIP: None`)** qua `spec.serviceName`.
2. Tên Pod cố định theo thứ tự (`web-0`, `web-1`).
3. Dùng `volumeClaimTemplates` để cấp PVC riêng cho từng Pod (PVC không bị xóa khi scale down).

</details>

**11. How does a `PodDisruptionBudget` (PDB) affect `kubectl drain`, and which two fields are mutually exclusive in PDB spec?**

<details><summary>Xem đáp án</summary>

- Nếu `ALLOWED DISRUPTIONS = 0` (ví dụ `replicas: 2` và `minAvailable: 2`), `kubectl drain` sẽ bị **chặn**.
- Chỉ được chọn **1 trong 2**: `minAvailable` hoặc `maxUnavailable`.

</details>

**12. What are the prerequisites for a `HorizontalPodAutoscaler` (HPA) to scale a Deployment based on CPU utilization?**

<details><summary>Xem đáp án</summary>

1. Cụm phải cài đặt **Metrics Server** đang chạy.
2. Container trong Pod bắt buộc phải khai báo **`resources.requests.cpu`**.
- Lệnh tạo nhanh: `kubectl autoscale deployment <name> --cpu-percent=60 --min=2 --max=10`.

</details>

## 8. Mạng Kubernetes — Services, kube-proxy, CoreDNS & CNI

**13. What is the full DNS name (FQDN) of a Kubernetes Service across namespaces, and what port must be allowed in Egress NetworkPolicies for DNS?**

<details><summary>Xem đáp án</summary>

- **FQDN**: `<service-name>.<namespace>.svc.cluster.local`
- **Cổng DNS bắt buộc mở khi bật Egress NetworkPolicy**: **UDP 53 và TCP 53**.

</details>

**14. What is the DNS FQDN of Pod `mysql-0` managed by a StatefulSet with Headless Service `db-hl` in namespace `prod`?**

<details><summary>Xem đáp án</summary>

`mysql-0.db-hl.prod.svc.cluster.local`

</details>

## 9. Định tuyến HTTP/HTTPS — Ingress Controller & Kubernetes Gateway API

**15. What are the 3 core resources in Kubernetes Gateway API and their responsibilities?**

<details><summary>Xem đáp án</summary>

1. **`GatewayClass`** (Cluster-scoped): Định nghĩa controller xử lý.
2. **`Gateway`** (Namespace-scoped): Khai báo cổng lắng nghe (`listeners`) và TLS.
3. **`HTTPRoute`** (Namespace-scoped): Luật định tuyến (`hostnames`, `rules`, `backendRefs`) gắn vào Gateway qua `parentRefs`.

</details>

**16. What is the default `NodePort` port range in Kubernetes, and how do you create an `Ingress` imperatively?**

<details><summary>Xem đáp án</summary>

- Dải cổng `NodePort`: **`30000–32767`**.
- Tạo Ingress nhanh: `kubectl create ingress <name> --class=nginx --rule="host/path*=svc:port"`

</details>

## 10. Cô lập Lưu lượng Mạng với NetworkPolicy (Ingress & Egress)

**17. In a `NetworkPolicy`, what is the difference between placing `namespaceSelector` and `podSelector` in the same list item vs separate list items?**

<details><summary>Xem đáp án</summary>

- **Chung 1 dấu gạch ngang `-` (Cùng 1 object)**: Phép toán **AND** (phải khớp cả Namespace VÀ nhãn Pod).
- **Hai dấu gạch ngang `-` tách rời**: Phép toán **OR** (khớp Namespace HOẶC khớp nhãn Pod).

</details>

**18. How do you select a specific Namespace in a `NetworkPolicy` without manually adding a custom label to it?**

<details><summary>Xem đáp án</summary>

Sử dụng nhãn tự động có sẵn từ Kubernetes 1.21+:
`namespaceSelector:
  matchLabels:
    kubernetes.io/metadata.name: <namespace-name>`

</details>

## 11. Lưu trữ — Volumes, PersistentVolume (PV) & PersistentVolumeClaim (PVC)

**19. What happens to a `PersistentVolume` with `ReclaimPolicy: Retain` when its PVC is deleted, and how do you make it `Available` again?**

<details><summary>Xem đáp án</summary>

- PV chuyển sang trạng thái **`Released`** (dữ liệu vẫn còn nguyên nhưng chưa thể gắn cho PVC mới).
- Để chuyển PV về lại **`Available`**, chạy `kubectl edit pv <name>` và xóa toàn bộ khối **`spec.claimRef`** (hoặc `kubectl patch pv <name> --type json -p='[{"op":"remove","path":"/spec/claimRef"}]'`).

</details>

**20. What are the 4 Kubernetes PersistentVolume Access Modes?**

<details><summary>Xem đáp án</summary>

- **`ReadWriteOnce` (`RWO`)**: Đọc/ghi bởi 1 Node.
- **`ReadOnlyMany` (`ROX`)**: Chỉ-đọc bởi nhiều Node.
- **`ReadWriteMany` (`RWX`)**: Đọc/ghi bởi nhiều Node.
- **`ReadWriteOncePod` (`RWOP`)**: Đọc/ghi bởi duy nhất 1 Pod trong toàn cụm.

</details>

**21. What 4 fields must match or be satisfied for a `PVC` to bind to a static `PV`?**

<details><summary>Xem đáp án</summary>

1. `storageClassName` khớp nhau.
2. `accessModes` của PV bao hàm PVC.
3. `capacity.storage` của PV >= `requests.storage` của PVC.
4. `volumeMode` (`Filesystem` hoặc `Block`) khớp nhau.

</details>

**22. What is the difference between `emptyDir` and `hostPath` volumes?**

<details><summary>Xem đáp án</summary>

- **`emptyDir`**: Tạo mới khi Pod được gán lên Node, chia sẻ giữa các container trong Pod và **bị xóa khi Pod bị xóa**.
- **`hostPath`**: Mount trực tiếp file/thư mục từ filesystem của Node vào Pod (dữ liệu vẫn còn trên Node nếu Pod bị xóa).

</details>

## 12. StorageClass, Dynamic Provisioning, CSI & Volume Expansion

**23. What is the difference between `volumeBindingMode: Immediate` and `WaitForFirstConsumer` in a `StorageClass`?**

<details><summary>Xem đáp án</summary>

- **`Immediate`**: Cấp phát PV ngay khi tạo PVC (có thể gây lỗi khác Availability Zone với Pod).
- **`WaitForFirstConsumer`**: Đợi đến khi Pod sử dụng PVC được lập lịch lên Node cụ thể rồi mới tạo PV đúng Zone/Node đó.

</details>

**24. What are the 3 steps to expand a PVC's storage capacity dynamically?**

<details><summary>Xem đáp án</summary>

1. Đảm bảo `StorageClass` có `allowVolumeExpansion: true`.
2. Tăng `spec.resources.requests.storage` trên PVC (`kubectl patch pvc` hoặc `kubectl edit pvc`).
3. Nếu PVC ở trạng thái `FileSystemResizePending`, restart Pod để hoàn tất mở rộng filesystem.

</details>

## 13. Xử lý Sự cố Control Plane, Worker Nodes & kubelet

**25. When `kube-apiserver` is down and `kubectl` fails with `connection refused`, which CLI tool do you use to inspect containers and logs on the node?**

<details><summary>Xem đáp án</summary>

Sử dụng **`crictl`**:
- `crictl ps -a` (xem các container kể cả đã Exited)
- `crictl logs <container-id>` (đọc log lỗi khởi động).

</details>

**26. Where are kubelet configuration, kubeconfig, and CNI config files located on a Kubernetes node?**

<details><summary>Xem đáp án</summary>

- **kubelet config**: `/var/lib/kubelet/config.yaml`
- **kubelet kubeconfig**: `/etc/kubernetes/kubelet.conf`
- **CNI config**: `/etc/cni/net.d/`
- **Static Pod manifests**: `/etc/kubernetes/manifests/`

</details>

## 14. Debug Ứng dụng, Mạng & Kỹ năng kubectl/JSONPath Thực chiến

**27. How do you view logs of the previous crashed instance of a Pod in `CrashLoopBackOff`, and how do you find the Pod using the most CPU?**

<details><summary>Xem đáp án</summary>

- Xem log lần sập trước: **`kubectl logs <pod-name> --previous`**
- Tìm Pod tốn CPU nhất: **`kubectl top pods -n <namespace> --sort-by=cpu`**

</details>

**28. How do you extract all Node `InternalIP` addresses using `kubectl` JSONPath?**

<details><summary>Xem đáp án</summary>

`kubectl get nodes -o jsonpath='{.items[*].status.addresses[?(@.type=="InternalIP")].address}'`

</details>

**29. What does it mean if `kubectl get endpoints <svc-name>` shows `<none>`?**

<details><summary>Xem đáp án</summary>

Service không có Pod backend nào sẵn sàng: thường do **`spec.selector` của Service không khớp với `labels` của Pod**, hoặc các Pod đang **thất bại `readinessProbe`**.

</details>

**30. How do you attach an ephemeral debug container to a running distroless Pod that has no shell?**

<details><summary>Xem đáp án</summary>

`kubectl debug -it <pod-name> --image=busybox:1.36 --target=<container-name>`

</details>

---

[Mục lục CKA](00-tong-quan-va-lo-trinh-cka.md)
