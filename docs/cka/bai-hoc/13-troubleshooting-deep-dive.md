# Sổ tay Xử lý Sự cố Toàn diện trong CKA (Domain 5 — 30% Điểm Thi)

Domain 5 là phần **chiếm trọng số cao nhất (30%)** trong kỳ thi CKA. Kỹ năng quyết định tốc độ làm bài là **chẩn đoán theo lớp (layered troubleshooting)**: xác định nhanh lỗi nằm ở Control Plane, Worker Node (`kubelet`/CRI), Networking (CNI/CoreDNS/Service), hay Application Pod.

---

## 1. Bảng Chẩn đoán Nhanh theo Triệu chứng Lỗi

| Triệu chứng khi chạy `kubectl` | Nguyên nhân phổ biến nhất trong đề CKA | Câu lệnh kiểm tra & Khắc phục |
| :--- | :--- | :--- |
| `The connection to the server ...:6443 was refused` | Static Pod `kube-apiserver` hoặc `etcd` bị lỗi cấu hình trong `/etc/kubernetes/manifests/` | `crictl ps -a`, `crictl logs <id>`, kiểm tra cờ lệnh/đường dẫn cert trong `/etc/kubernetes/manifests/kube-apiserver.yaml` |
| Pod mới tạo bị kẹt mãi ở trạng thái **`Pending`** | (1) `kube-scheduler` bị lỗi/stopped; (2) Node có Taint hoặc thiếu CPU/RAM; (3) PVC chưa `Bound` | `kubectl describe pod <name>` đọc mục `Events`, kiểm tra `kubectl get pods -n kube-system` xem `kube-scheduler` có `Running` không |
| Deployment đổi `replicas: 5` nhưng không tạo Pod | `kube-controller-manager` trong `/etc/kubernetes/manifests/` bị lỗi | Kiểm tra `/etc/kubernetes/manifests/kube-controller-manager.yaml` và log bằng `crictl logs` |
| Worker Node ở trạng thái **`NotReady`** | `kubelet` dừng, sai cấu hình `/etc/kubernetes/kubelet.conf`, hoặc `containerd` lỗi | SSH vào node: `systemctl status kubelet`, `journalctl -u kubelet -xe --no-pager` |
| Pod `ContainerCreating` mãi hoặc `coredns` `Pending` | Chưa cài plugin mạng **CNI** hoặc `/etc/cni/net.d/` thiếu file cấu hình | Kiểm tra `ls /etc/cni/net.d/`, `kubectl get pods -n kube-system` (Calico/Flannel/Cilium) |
| Pod không phân giải được tên miền (`nslookup` lỗi) | (1) Service `kube-dns` sai selector; (2) `Corefile` lỗi; (3) `NetworkPolicy` chặn UDP 53 | `kubectl get svc,ep -n kube-system kube-dns`, `kubectl logs -n kube-system -l k8s-app=kube-dns` |
| Pod liên tục **`CrashLoopBackOff`** | Sai `command`/`args`, thiếu biến môi trường/Secret, hoặc `livenessProbe` sai cổng/path | `kubectl logs <pod> --previous`, `kubectl describe pod <pod>` |

---

## 2. Quy trình Debug Control Plane bị sập (khi `kubectl` không chạy được)

Khi `kubectl get nodes` báo `connection refused` hoặc `timeout`:
1. SSH lên node `controlplane`:
   ```bash
   # Kiểm tra kubelet có đang chạy không (kubelet quản lý toàn bộ Static Pods!)
   systemctl status kubelet
   journalctl -u kubelet -n 50 --no-pager
   ```
2. Kiểm tra các container runtime trực tiếp bằng **`crictl`** (không dùng `docker` vì Kubernetes dùng `containerd`):
   ```bash
   # Liệt kê tất cả container (kể cả đã Exited/Crash)
   crictl ps -a

   # Lọc riêng kube-apiserver hoặc etcd
   crictl ps -a --name kube-apiserver
   crictl logs <container-id>
   ```
3. Kiểm tra lại các lỗi kinh điển trong `/etc/kubernetes/manifests/`:
   - **`kube-apiserver.yaml`**: Sai chính tả cờ `--etcd-servers=https://127.0.0.1:2379`, sai đường dẫn `--etcd-cafile` / `--client-ca-file`, hoặc sai `--service-cluster-ip-range`.
   - **`kube-controller-manager.yaml`**: Sai đường dẫn `--cluster-signing-cert-file` hoặc `--kubeconfig`.
   - **`kube-scheduler.yaml`**: Sai cổng hoặc sai đường dẫn `--kubeconfig=/etc/kubernetes/scheduler.conf`.
   - **`etcd.yaml`**: Sai `hostPath.path` hoặc sai `--listen-client-urls`.

> **Mẹo thi CKA**: Nếu `crictl ps -a` không thấy container mới nào được tạo sau khi sửa YAML, hãy kiểm tra `journalctl -u kubelet -n 30` — rất có thể file YAML bị **lỗi cú pháp indentation** khiến `kubelet` không parse được!

---

## 3. Quy trình Debug Worker Node `NotReady`

1. Từ Control Plane:
   ```bash
   kubectl get nodes -o wide
   kubectl describe node node01 | grep -A 15 Conditions
   ```
   - Chú ý các điều kiện: `MemoryPressure`, `DiskPressure`, `PIDPressure`, `NetworkUnavailable`, `Ready`.
2. SSH vào `node01`:
   ```bash
   # Kiểm tra kubelet và containerd
   systemctl status containerd kubelet
   journalctl -u kubelet -n 50 --no-pager
   ```
3. Các nguyên nhân thường gặp nhất trên Worker Node:
   - **`kubelet` bị `inactive (dead)` hoặc `disabled`**: Chạy `systemctl enable --now kubelet`.
   - **Sai cổng API Server hoặc sai đường dẫn CA trong `/etc/kubernetes/kubelet.conf`**: Ví dụ `server: https://controlplane:6443` bị sửa thành cổng `6444` hoặc `ca.crt` sai đường dẫn. Sửa lại rồi `systemctl restart kubelet`.
   - **Lỗi `staticPodPath` hoặc `cgroupDriver` trong `/var/lib/kubelet/config.yaml`**: Đối chiếu với cấu hình `containerd` (`/etc/containerd/config.toml` -> `SystemdCgroup = true`).
   - **Hết dung lượng ổ đĩa (`DiskPressure`)**: Kiểm tra `df -h`, dọn image rác bằng `crictl rmi --prune`.

---

## 4. Quy trình Debug Service, Endpoints & CoreDNS

Khi Pod A không gọi được Pod B qua Service `my-svc`:
1. **Kiểm tra Service có Endpoints không**:
   ```bash
   kubectl get svc my-svc -o wide
   kubectl get endpoints my-svc
   ```
   - Nếu `ENDPOINTS` hiển thị `<none>`: `spec.selector` của Service **không khớp** với `metadata.labels` của Pod, hoặc các Pod đang **không pass `readinessProbe`**.
2. **Kiểm tra `port` vs `targetPort`**:
   - `port` là cổng của Service; `targetPort` phải khớp với `containerPort` mà ứng dụng thực sự lắng nghe trong Pod.
3. **Kiểm tra CoreDNS & `kube-proxy`**:
   ```bash
   kubectl get pods -n kube-system -l k8s-app=kube-dns
   kubectl get pods -n kube-system -l k8s-app=kube-proxy
   kubectl get cm coredns -n kube-system -o yaml
   ```
   - Nếu có `NetworkPolicy` trong namespace, kiểm tra xem có policy nào vô tình chặn traffic Ingress tới Pod đích hoặc chặn Egress UDP/TCP 53 tới `kube-dns` không.

---

## 5. Debug Application Pod nâng cao (`logs`, `exec`, `kubectl debug`)

```bash
# Xem log của lần crash trước đó
kubectl logs my-pod -c app --previous

# Chạy container debug tạm thời (ephemeral container) gắn vào Pod distroless không có shell
kubectl debug -it my-pod --image=busybox:1.36 --target=app

# Tạo bản sao Pod để debug nếu Pod gốc đang CrashLoopBackOff liên tục
kubectl debug my-pod -it --copy-to=my-pod-debug --container=app -- sh
```

---

[← Bài trước](12-storageclass-csi-expansion.md) | [Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/13-troubleshooting-controlplane-nodes.md) | [Bài tiếp →](14-jsonpath-kubectl-tips.md)
