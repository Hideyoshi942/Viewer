# CKS Cheatsheet 1: Lệnh CLI, Đường dẫn & Manifest Cốt lõi

Tài liệu tra cứu siêu tốc cho phòng thi thực hành CKS (120 phút — 16 câu hỏi thực chiến).

## 1. Đường dẫn File Cấu hình Phải Nhớ

| Thành phần | Đường dẫn mặc định trên Node |
| :--- | :--- |
| Static Pod Manifests (Control Plane) | `/etc/kubernetes/manifests/` (`kube-apiserver.yaml`, `etcd.yaml`,...) |
| Kubelet Config | `/var/lib/kubelet/config.yaml` |
| Kubelet Systemd Service | `/usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf` |
| PKI & Certificates | `/etc/kubernetes/pki/` |
| Seccomp Localhost Profiles | `/var/lib/kubelet/seccomp/` |
| AppArmor Profiles | `/etc/apparmor.d/` |
| Falco Custom Rules | `/etc/falco/falco_rules.local.yaml` |
| Containerd Socket (cho `crictl`) | `/run/containerd/containerd.sock` |

## 2. Lệnh Kiểm tra & Bảo mật Nhanh theo Domain

### Domain 1 — Cluster Setup
```bash
# CIS Benchmark
kube-bench run --targets master,etcd
kube-bench run --targets node --check 4.2.1

# Xác minh checksum binary
sha512sum /usr/bin/kubelet
echo "<hash>  /usr/bin/kubelet" | sha512sum --check

# Tạo TLS Secret cho Ingress
kubectl create secret tls my-tls --cert=tls.crt --key=tls.key -n prod
```

### Domain 2 — Cluster Hardening (RBAC & API Server)
```bash
# Kiểm tra quyền ServiceAccount
kubectl auth can-i --list --as=system:serviceaccount:<ns>:<sa> -n <ns>
kubectl auth can-i get secrets --as=system:serviceaccount:<ns>:<sa> -n <ns>

# Backup trước khi sửa kube-apiserver
cp /etc/kubernetes/manifests/kube-apiserver.yaml /root/kube-apiserver.yaml.bak

# Debug kube-apiserver bị crash sau khi sửa manifest
crictl ps -a | grep kube-apiserver
crictl logs <container-id>
```

### Domain 3 — System Hardening (Host OS, AppArmor, Seccomp)
```bash
# Xem các cổng đang mở & tiến trình
ss -tulpn
systemctl list-unit-files --type=service --state=enabled

# AppArmor: nạp profile và kiểm tra trạng thái
apparmor_parser -q /etc/apparmor.d/<profile-file>
aa-status | grep <profile-name>

# Kiểm tra Seccomp trên Pod (2 = Filter mode đang bật)
kubectl exec <pod> -- grep Seccomp /proc/1/status
```

### Domain 4 — Microservice Security (Secrets Encryption & PSS)
```bash
# Tạo khóa 32-byte base64 cho EncryptionConfiguration
head -c 32 /dev/urandom | base64

# Mã hóa lại toàn bộ Secrets hiện có sau khi bật Encryption at Rest
kubectl get secrets -A -o json | kubectl replace -f -

# Gắn nhãn Pod Security Admission (PSS Restricted) cho Namespace
kubectl label ns prod \
  pod-security.kubernetes.io/enforce=restricted \
  pod-security.kubernetes.io/warn=restricted
```

### Domain 5 — Supply Chain (Trivy, SBOM, Cosign, Kubesec)
```bash
# Quét CVE mức HIGH, CRITICAL với Trivy
trivy image --severity HIGH,CRITICAL <image:tag>

# Tạo SBOM chuẩn SPDX / CycloneDX
trivy image --format spdx-json --output sbom.spdx.json <image:tag>
trivy image --format cyclonedx --output sbom.cdx.json <image:tag>

# Xác minh chữ ký ảnh với Cosign
cosign verify --key cosign.pub <image@sha256:digest>

# Phân tích tĩnh YAML manifest
kubesec scan pod.yaml
```

### Domain 6 — Runtime Security (Falco & Forensics)
```bash
# Validate và reload Falco rules
falco -V /etc/falco/falco_rules.local.yaml
systemctl restart falco && journalctl -u falco -f

# Chạy Falco 30 giây ghi log ra file
falco -M 30 -r /etc/falco/falco_rules.local.yaml > /root/falco.log

# Truy vết container PID trên Worker Node
crictl inspect <container-id> | grep -i '"pid"'
```

> **Exam Tip**: Thiết lập alias ngay đầu giờ thi để tiết kiệm thời gian: `alias k=kubectl; export do="--dry-run=client -o yaml"`. Luôn kiểm tra lại `kubectl get nodes` sau mỗi lần sửa `kube-apiserver.yaml` hoặc `kubelet/config.yaml`.

---

[Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md)
