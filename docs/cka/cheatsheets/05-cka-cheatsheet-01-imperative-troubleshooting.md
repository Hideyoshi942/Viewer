# Cheatsheet CKA: Lệnh Imperative, JSONPath & Chẩn đoán Sự cố (30%)

## 1. Cấu hình Tăng tốc Shell ngay khi vào phòng thi
```bash
export do="--dry-run=client -o yaml"
export now="--force --grace-period=0"
alias k=kubectl
complete -o default -F __start_kubectl k
```

## 2. Bộ lệnh JSONPath & Custom Columns hay thi nhất
```bash
# Lấy InternalIP của mọi Node
kubectl get nodes -o jsonpath='{.items[*].status.addresses[?(@.type=="InternalIP")].address}'

# In tên Node + OS Image + Kernel Version
kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.nodeInfo.osImage}{"\n"}{end}'

# Giải mã Secret
kubectl get secret db-sec -o jsonpath='{.data.password}' | base64 -d

# Sắp xếp PV theo dung lượng & Pod theo CPU
kubectl get pv --sort-by=.spec.capacity.storage
kubectl top pods -A --sort-by=cpu --no-headers | head -n 5
```

## 3. Chẩn đoán Node bị `NotReady`
1. `kubectl get nodes -o wide` và `kubectl describe node <node-name>` (xem `Conditions`).
2. SSH vào node lỗi:
   ```bash
   systemctl status containerd kubelet
   journalctl -u kubelet -n 50 --no-pager
   ```
3. Lỗi kinh điển:
   - `kubelet` stopped/disabled -> `systemctl enable --now kubelet`
   - Sai cổng `6443` hoặc đường dẫn CA trong `/etc/kubernetes/kubelet.conf`
   - Sai `cgroupDriver` giữa `/var/lib/kubelet/config.yaml` và `/etc/containerd/config.toml`

## 4. Chẩn đoán Control Plane Static Pods (`kubectl` bị `connection refused`)
- Manifest Control Plane tại **`/etc/kubernetes/manifests/`**.
- Dùng **`crictl`** khi `kube-apiserver` sập:
  ```bash
  crictl ps -a
  crictl logs <container-id>
  ```
- Kiểm tra `kubelet` parse YAML có bị lỗi indentation không: `journalctl -u kubelet -n 30`.

## 5. Debug Application Pod, Service & CoreDNS
```bash
# Log lần crash trước đó của Pod CrashLoopBackOff
kubectl logs <pod> -c <container> --previous

# Gắn container debug vào Pod distroless
kubectl debug -it <pod> --image=busybox:1.36 --target=<container>

# Kiểm tra Service có Endpoints không
kubectl get svc,ep <svc-name>

# Test nhanh DNS từ trong cụm
kubectl run tmp --image=busybox:1.36 --rm -it --restart=Never -- nslookup <svc>.<ns>.svc.cluster.local
```

---

[Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md)
