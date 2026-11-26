# Cẩm nang Thực chiến CKA: Control Plane, etcd, kubeadm & RBAC (Domain 1 — 25%)

Domain 1 chiếm **25% tổng điểm** bài thi CKA và chứa những câu hỏi "chắc điểm" nhất nếu bạn thuộc lòng quy trình: sao lưu/khôi phục `etcd`, nâng cấp cụm `kubeadm`, và phân quyền RBAC.

---

## 1. Kiến trúc Control Plane & Vị trí File Quan trọng trên Cụm `kubeadm`

Trên một cụm Kubernetes cài đặt bằng `kubeadm`, các thành phần Control Plane chạy dưới dạng **Static Pod** do `kubelet` quản lý trực tiếp (không cần API Server để khởi chạy ban đầu).

| Thành phần | Vị trí Manifest / Cấu hình | Vai trò chính |
| :--- | :--- | :--- |
| **`kube-apiserver`** | `/etc/kubernetes/manifests/kube-apiserver.yaml` | Cổng giao tiếp trung tâm (cổng `6443`), xác thực, phân quyền, admission control, đọc/ghi `etcd` |
| **`etcd`** | `/etc/kubernetes/manifests/etcd.yaml` | Cơ sở dữ liệu key-value lưu toàn bộ trạng thái cụm (cổng `2379` client, `2380` peer) |
| **`kube-scheduler`** | `/etc/kubernetes/manifests/kube-scheduler.yaml` | Gán Pod trạng thái `Pending` vào Node phù hợp dựa trên tài nguyên, Taints, Affinity |
| **`kube-controller-manager`** | `/etc/kubernetes/manifests/kube-controller-manager.yaml` | Vòng lặp điều khiển (Deployment, ReplicaSet, Node, EndpointSlice, ServiceAccount...) |
| **PKI Certificates** | `/etc/kubernetes/pki/` (và `/etc/kubernetes/pki/etcd/`) | Toàn bộ chứng chỉ TLS CA, client/server cert cho cụm và `etcd` |
| **Kubeconfig hệ thống** | `/etc/kubernetes/admin.conf`, `kubelet.conf`, `controller-manager.conf`, `scheduler.conf` | Thông tin kết nối API Server cho admin và các daemon |

> **Mẹo thi CKA**: Khi sửa bất kỳ file nào trong `/etc/kubernetes/manifests/`, `kubelet` sẽ tự động phát hiện thay đổi và khởi động lại Static Pod tương ứng sau vài giây — không cần chạy `kubectl apply`.

---

## 2. Sao lưu và Khôi phục `etcd` (Câu hỏi Kinh điển CKA)

### 2.1. Kiểm tra thông số `etcd` trước khi thao tác
Trước khi chạy `etcdctl`, luôn đọc `/etc/kubernetes/manifests/etcd.yaml` (hoặc `ps -ef | grep etcd`) để lấy chính xác đường dẫn chứng chỉ và endpoint:

```bash
grep -E "listen-client-urls|cert-file|key-file|trusted-ca-file|data-dir" /etc/kubernetes/manifests/etcd.yaml
```

### 2.2. Sao lưu Snapshot (`etcdctl snapshot save`)
Lưu ý bắt buộc đặt `ETCDCTL_API=3` và truyền đủ 4 cờ `--endpoints`, `--cacert`, `--cert`, `--key`:

```bash
ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  snapshot save /opt/etcd-backup.db

# Kiểm tra tính toàn vẹn của file snapshot vừa tạo
ETCDCTL_API=3 etcdctl snapshot status /opt/etcd-backup.db --write-out=table
```

### 2.3. Khôi phục Snapshot (`etcdctl snapshot restore` / `etcdutl`)
Khi khôi phục, **KHÔNG** ghi đè trực tiếp lên thư mục `/var/lib/etcd` đang chạy. Hãy restore ra một thư mục mới (ví dụ `/var/lib/etcd-restored`), sau đó trỏ Static Pod `etcd` sang thư mục mới này.

```bash
# Bước 1: Khôi phục dữ liệu ra thư mục mới (không cần truyền --endpoints hay cert)
ETCDCTL_API=3 etcdctl snapshot restore /opt/etcd-backup.db \
  --data-dir=/var/lib/etcd-restored

# Nếu dùng Kubernetes 1.30+ có sẵn etcdutl:
# etcdutl snapshot restore /opt/etcd-backup.db --data-dir=/var/lib/etcd-restored
```

**Bước 2**: Mở `/etc/kubernetes/manifests/etcd.yaml` bằng `vim` hoặc `nano`, tìm phần `volumes` -> `name: etcd-data` -> `hostPath.path` và đổi từ `/var/lib/etcd` thành `/var/lib/etcd-restored`:

```yaml
  volumes:
  - hostPath:
      path: /var/lib/etcd-restored
      type: DirectoryOrCreate
    name: etcd-data
```

**Bước 3**: Theo dõi `etcd` và `kube-apiserver` khởi động lại (thường mất 20–40 giây):

```bash
watch crictl ps
kubectl get pods -n kube-system
```

> **Lưu ý nếu `etcd` là External Etcd (chạy bằng `systemd` ngoài cụm)**: Khi đó bạn phải `systemctl stop etcd`, chạy `etcdctl snapshot restore --data-dir=...`, `chown -R etcd:etcd /var/lib/etcd-restored`, sửa `ExecStart` trong `/etc/systemd/system/etcd.service` rồi `systemctl daemon-reload && systemctl start etcd`.

---

## 3. Quy trình Chuẩn Nâng cấp Cụm Kubernetes bằng `kubeadm`

Trong bài thi CKA, bạn thường được yêu cầu nâng cấp từ phiên bản hiện tại (ví dụ `1.30.x`) lên phiên bản minor kế tiếp (ví dụ `1.31.x`). **Không bao giờ nhảy cóc 2 phiên bản minor** (ví dụ từ `1.29` thẳng lên `1.31`).

### 3.1. Bước 1 — Nâng cấp Control Plane Node đầu tiên

```bash
# 1. Drain node controlplane trước khi bảo trì
kubectl drain controlplane --ignore-daemonsets

# 2. SSH vào controlplane, mở khóa và nâng cấp kubeadm
ssh controlplane
sudo -i
apt-mark unhold kubeadm
apt-get update && apt-get install -y kubeadm='1.31.0-*'
apt-mark hold kubeadm

# 3. Kiểm tra kế hoạch nâng cấp và áp dụng
kubeadm version
kubeadm upgrade plan
kubeadm upgrade apply v1.31.0

# 4. Nâng cấp kubelet và kubectl
apt-mark unhold kubelet kubectl
apt-get update && apt-get install -y kubelet='1.31.0-*' kubectl='1.31.0-*'
apt-mark hold kubelet kubectl

# 5. Reload systemd và khởi động lại kubelet
systemctl daemon-reload
systemctl restart kubelet

# 6. Mở lại khả năng nhận Pod cho controlplane
exit
kubectl uncordon controlplane
```

### 3.2. Bước 2 — Nâng cấp từng Worker Node (và Control Plane phụ nếu có)

```bash
# 1. Đứng từ máy quản trị, drain worker node (thêm --delete-emptydir-data nếu có Pod dùng emptyDir)
kubectl drain node01 --ignore-daemonsets --delete-emptydir-data

# 2. SSH vào node01, nâng cấp kubeadm
ssh node01
sudo -i
apt-mark unhold kubeadm
apt-get update && apt-get install -y kubeadm='1.31.0-*'
apt-mark hold kubeadm

# 3. Chạy kubeadm upgrade node (KHÔNG dùng upgrade apply trên worker!)
kubeadm upgrade node

# 4. Nâng cấp kubelet và kubectl, restart kubelet
apt-mark unhold kubelet kubectl
apt-get update && apt-get install -y kubelet='1.31.0-*' kubectl='1.31.0-*'
apt-mark hold kubelet kubectl
systemctl daemon-reload
systemctl restart kubelet

# 5. Về lại máy quản trị và uncordon node01
exit
kubectl uncordon node01
kubectl get nodes
```

> **Cạm bẫy hay gặp**: Nếu đề bài có `apt-cache madison kubeadm` để tìm đúng phiên bản patch (ví dụ `1.31.1-1.1`), hãy chạy `apt-cache madison kubeadm | head -n 5` trước khi `apt-get install`.

---

## 4. Phân quyền RBAC (Role, ClusterRole, RoleBinding, ClusterRoleBinding)

### 4.1. So sánh phạm vi Namespace vs Cluster-wide

| Tài nguyên | Phạm vi | Dùng khi nào? |
| :--- | :--- | :--- |
| **`Role` + `RoleBinding`** | Chỉ trong **1 Namespace** | Cấp quyền đọc/tạo Pod, Deployment, Secret trong namespace `dev` hoặc `prod` |
| **`ClusterRole` + `ClusterRoleBinding`** | **Toàn cụm (Cluster-wide)** | Cấp quyền thao tác tài nguyên cấp cụm (`nodes`, `pv`, `namespaces`) hoặc đọc Pod trên mọi namespace |
| **`ClusterRole` + `RoleBinding`** | Mẫu quyền dùng chung, áp dụng vào **1 Namespace** | Tạo 1 `ClusterRole` chuẩn (ví dụ `view`), dùng `RoleBinding` để gán riêng cho namespace `team-a` |

### 4.2. Lệnh Imperative tạo nhanh RBAC & Kiểm tra với `auth can-i`

```bash
# Tạo ServiceAccount
kubectl create serviceaccount app-sa -n dev

# Tạo Role với nhiều resource và verb
kubectl create role dev-role \
  --verb=get,list,watch,create,delete \
  --resource=pods,deployments.apps,services \
  -n dev

# Gắn Role cho ServiceAccount
kubectl create rolebinding dev-rb \
  --role=dev-role \
  --serviceaccount=dev:app-sa \
  -n dev

# Tạo ClusterRole cho tài nguyên cấp cụm (ví dụ nodes, persistentvolumes)
kubectl create clusterrole node-viewer \
  --verb=get,list,watch \
  --resource=nodes,persistentvolumes

# Gắn ClusterRole cho User "john" và Group "ops"
kubectl create clusterrolebinding john-node-viewer \
  --clusterrole=node-viewer \
  --user=john \
  --group=ops

# Kiểm tra quyền thực tế (Imperative verification)
kubectl auth can-i create deployments --as=system:serviceaccount:dev:app-sa -n dev
kubectl auth can-i list nodes --as=john
kubectl auth can-i delete pods --as=system:serviceaccount:dev:app-sa -n prod
```

### 4.3. Lưu ý `resourceNames` và `nonResourceURLs` trong YAML
Lệnh `kubectl create role` không hỗ trợ `--resource-name` khi cần giới hạn đúng 1 Secret hoặc Pod cụ thể — khi đó bạn dùng `--dry-run=client -o yaml > role.yaml` rồi thêm `resourceNames`:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: read-only-db-secret
  namespace: prod
rules:
- apiGroups: [""]
  resources: ["secrets"]
  resourceNames: ["db-credentials"]
  verbs: ["get"]
```

---

## 5. Quản lý Highly Available (HA) Control Plane

- Trong cụm HA (`kubeadm`), có nhiều Control Plane node cùng chạy `kube-apiserver` phía sau một **Load Balancer** (ví dụ HAProxy/Keepalived hoặc Cloud NLB) tại địa chỉ `--control-plane-endpoint`.
- **`etcd` topology**:
  - **Stacked etcd**: Mỗi Control Plane node chạy 1 Static Pod `etcd` (phổ biến nhất, ít máy chủ hơn).
  - **External etcd**: Cụm `etcd` chạy trên các máy chủ riêng biệt ngoài Kubernetes (tăng độ cách ly, yêu cầu tối thiểu 3 node `etcd` để đảm bảo **quorum** $\lfloor N/2 \rfloor + 1$).
- **Quy tắc Quorum của `etcd`**: Cụm 3 node chịu được tối đa **1 node lỗi**; cụm 5 node chịu được tối đa **2 node lỗi**. Không nên dùng số node chẵn (ví dụ 4 node cũng chỉ chịu được 1 node lỗi như 3 node).

---

[Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/01-core-architecture-kubeadm.md) | [Bài tiếp →](02-etcd-backup-restore.md)
