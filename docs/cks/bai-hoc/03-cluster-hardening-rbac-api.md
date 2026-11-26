# Domain 2: Gia cố Cụm Kubernetes (15%)

Domain 2 tập trung vào việc kiểm soát quyền truy cập vào Kubernetes API, giảm thiểu đặc quyền cho người dùng và workload, gia cố `kube-apiserver` và thực hiện nâng cấp cụm an toàn.

## 1. RBAC Least Privilege — Role, ClusterRole & Kiểm toán Quyền

**RBAC (Role-Based Access Control)** quyết định chủ thể (`User`, `Group`, `ServiceAccount`) được thực hiện hành động (`verbs`) nào lên tài nguyên (`resources`) nào.

### Nguyên tắc thiết kế RBAC chuẩn CKS
- **Ưu tiên `Role` + `RoleBinding`** trong phạm vi một Namespace thay vì `ClusterRole` + `ClusterRoleBinding`.
- **Tránh sử dụng wildcard (`*`)** ở `apiGroups`, `resources`, `verbs`.
- **Cẩn trọng với các quyền leo thang đặc quyền (Privilege Escalation)**:
  - `secrets` (`get`, `list`, `watch`) → lộ token và mật khẩu toàn namespace.
  - `pods/exec`, `pods/attach`, `pods/portforward` → thực thi lệnh trực tiếp trong container.
  - `roles/bind`, `clusterroles/escalate`, `impersonate` → tự cấp quyền `cluster-admin`.
  - `serviceaccounts/token` (`create`) → tạo JWT token cho ServiceAccount khác.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader-restricted
  namespace: app-ns
rules:
  - apiGroups: [""]
    resources: ["pods"]
    resourceNames: ["web-pod-1"]
    verbs: ["get", "watch"]
```

### Lệnh kiểm tra quyền nhanh trong phòng thi

```bash
# Kiểm tra quyền của một ServiceAccount cụ thể
kubectl auth can-i list secrets --as=system:serviceaccount:app-ns:backend-sa -n app-ns

# Liệt kê tất cả quyền mà một ServiceAccount đang sở hữu
kubectl auth can-i --list --as=system:serviceaccount:app-ns:backend-sa -n app-ns

# Tìm các ClusterRoleBinding cấp quyền cluster-admin hoặc gắn với system:anonymous
kubectl get clusterrolebindings -o wide | grep -E "cluster-admin|anonymous|unauthenticated"
```

> **Exam Tip**: Khi đề thi yêu cầu thu hồi quyền thừa của một Pod/ServiceAccount, đừng vội xóa toàn bộ `ClusterRole` nếu có nhiều đối tượng dùng chung — hãy kiểm tra xem đối tượng nào đang tham chiếu nó, hoặc tạo `Role` mới hẹp hơn và sửa `RoleBinding`.

## 2. Bảo mật ServiceAccount & Bound Token

Từ Kubernetes 1.24+, ServiceAccount không tự động tạo Secret token vĩnh viễn nữa; thay vào đó, kubelet cấp **Bound ServiceAccount Token** (JWT có thời hạn, gắn với vòng đời Pod) qua `TokenRequest` API.

Tuy nhiên, mặc định Kubernetes vẫn tự động mount token vào `/var/run/secrets/kubernetes.io/serviceaccount/token` của mọi Pod! Nếu Pod không cần gọi Kubernetes API, hãy **tắt tính năng này**:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: no-api-sa
  namespace: prod
automountServiceAccountToken: false
---
apiVersion: v1
kind: Pod
metadata:
  name: isolated-app
  namespace: prod
spec:
  serviceAccountName: no-api-sa
  automountServiceAccountToken: false
  containers:
    - name: app
      image: nginx:1.27-alpine
```

> **Exam Tip**: Nếu cả `ServiceAccount` và `Pod` đều cấu hình `automountServiceAccountToken`, thiết lập ở cấp **Pod** sẽ ghi đè thiết lập ở cấp **ServiceAccount**. Luôn đặt `automountServiceAccountToken: false` ở cả hai nơi nếu đề bài yêu cầu bảo vệ chặt chẽ.

## 3. Gia cố `kube-apiserver` (API Server Hardening)

`kube-apiserver` là cổng duy nhất giao tiếp với `etcd`, nên mọi cờ khởi động trong `/etc/kubernetes/manifests/kube-apiserver.yaml` đều tối quan trọng:

| Cờ cấu hình | Giá trị khuyến nghị | Ý nghĩa bảo mật |
| :--- | :--- | :--- |
| `--anonymous-auth` | `false` | Từ chối mọi request không có thông tin xác thực (`system:anonymous`). |
| `--authorization-mode` | `Node,RBAC` | Tuyệt đối không dùng `AlwaysAllow`; luôn bật `Node` (hạn chế kubelet) + `RBAC`. |
| `--enable-admission-plugins` | `NodeRestriction,...` | Ngăn kubelet trên một worker node sửa đổi nhãn/tài nguyên của node khác. |
| `--profiling` | `false` | Tắt endpoint profiling (`/debug/pprof`) để giảm bề mặt tấn công & lộ bộ nhớ. |
| `--insecure-port` | (đã bị gỡ bỏ) | Chỉ dùng HTTPS trên cổng 6443 có TLS. |
| `--kubelet-certificate-authority` | `/etc/kubernetes/pki/ca.crt` | Xác thực chứng chỉ của kubelet khi API server kết nối ngược lại. |

### Xử lý sự cố khi sửa Static Pod Manifest bị lỗi

Khi chỉnh sửa `/etc/kubernetes/manifests/kube-apiserver.yaml`, **luôn sao lưu trước**:

```bash
cp /etc/kubernetes/manifests/kube-apiserver.yaml /root/kube-apiserver.yaml.bak
```

Nếu `kube-apiserver` không khởi động lại sau khi sửa, dùng `crictl` để xem log container:

```bash
crictl ps -a | grep kube-apiserver
crictl logs <container-id>
```

## 4. Nâng cấp Cụm An toàn (Cluster Upgrade Security)

Cập nhật phiên bản Kubernetes kịp thời giúp vá các lỗ hổng CVE nghiêm trọng (như lỗ hổng leo thang quyền trên `kube-apiserver` hay `runc`). Quy trình nâng cấp bằng `kubeadm` đảm bảo tính sẵn sàng và tuân thủ bảo mật:

1. **Sao lưu etcd** trước khi nâng cấp.
2. **Nâng cấp Control Plane trước**:
   - `apt-mark unhold kubeadm && apt-get update && apt-get install -y kubeadm=1.31.x-1.1 && apt-mark hold kubeadm`
   - `kubeadm upgrade plan` → `kubeadm upgrade apply v1.31.x`
   - `kubectl drain <cp-node> --ignore-daemonsets` → nâng cấp `kubelet`, `kubectl` → `systemctl daemon-reload && systemctl restart kubelet` → `kubectl uncordon <cp-node>`.
3. **Nâng cấp từng Worker Node**: `drain` → cài `kubeadm` → `kubeadm upgrade node` → nâng cấp `kubelet` & `kubectl` → `restart kubelet` → `uncordon`.
4. **Kiểm tra lại các cấu hình bảo mật** (Audit Policy, EncryptionConfiguration, Admission plugins) vì quá trình `kubeadm upgrade` có thể ghi đè cờ mặc định nếu không cấu hình trong `ClusterConfiguration`.

---

[← Bài trước](02-ingress-tls-binary-verify.md) | [Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/04-rbac-serviceaccount-hardening.md) | [Bài tiếp →](04-apiserver-node-restriction-upgrade.md)
