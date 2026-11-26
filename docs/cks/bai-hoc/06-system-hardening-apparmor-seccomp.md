# Domain 3: Gia cố Hệ điều hành Host (15%)

Container dùng chung nhân Linux (Linux Kernel) với máy chủ Node. Nếu một tiến trình trong container thoát ra ngoài (container escape), lớp phòng thủ tiếp theo chính là **Host OS Hardening**: thu nhỏ bề mặt tấn công OS, kiểm soát quyền người dùng/nhóm, và hạn chế hành vi ở mức nhân bằng **AppArmor** và **Seccomp**.

## 1. Giảm Bề mặt Tấn công trên Host OS (Minimize Host OS Footprint)

Một Worker Node chuẩn bảo mật chỉ nên chạy tối thiểu các tiến trình cần thiết (`kubelet`, `containerd`, `sshd`).

```bash
# 1. Kiểm tra các cổng TCP/UDP đang lắng nghe và tiến trình tương ứng
ss -tulpn
# hoặc
netstat -tulpn

# 2. Dừng và vô hiệu hóa các dịch vụ không cần thiết (ví dụ: apache2, nginx, rpcbind)
systemctl stop apache2
systemctl disable apache2
apt-get purge -y apache2

# 3. Kiểm tra user có shell đăng nhập hoặc quyền sudo thừa
grep -vE "nologin|false" /etc/passwd
cat /etc/sudoers /etc/sudoers.d/*

# 4. Hạn chế module kernel không cần thiết (ví dụ: sctp, dccp)
echo "blacklist sctp" > /etc/modprobe.d/blacklist-sctp.conf
```

> **Exam Tip**: Khi đề thi yêu cầu kiểm tra một Node xem có dịch vụ không mong muốn hoặc tiến trình lạ đang chạy không, hãy dùng `ss -tulpn` kết hợp `ps auxf` và `systemctl list-unit-files --type=service --state=enabled` để phát hiện nhanh.

## 2. AppArmor — Kiểm soát Truy cập Bắt buộc (MAC)

**AppArmor** là module bảo mật nhân Linux (LSM) giới hạn khả năng của từng chương trình dựa trên đường dẫn tệp (file path), quyền đọc/ghi/thực thi và capability.

### Quy trình triển khai AppArmor cho Pod trên CKS

1. **Kiểm tra AppArmor đang hoạt động và các profile đã nạp trên Node**:
   ```bash
   systemctl status apparmor
   aa-status
   ```
2. **Nạp (Load) profile vào nhân ở chế độ `enforce`** (phải nạp trên **mọi Worker Node** nơi Pod có thể được lập lịch!):
   ```bash
   apparmor_parser -q /etc/apparmor.d/k8s-deny-write
   aa-status | grep k8s-deny-write
   ```
3. **Áp dụng profile vào Pod** (từ Kubernetes **1.30+**, trường `securityContext.appArmorProfile` đã lên **GA**, thay thế cho annotation cũ `container.apparmor.security.beta.kubernetes.io/<name>`):

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: apparmor-pod
spec:
  securityContext:
    appArmorProfile:
      type: Localhost
      localhostProfile: k8s-deny-write
  containers:
    - name: app
      image: busybox:1.36
      command: ["sh", "-c", "sleep 3600"]
```

Ví dụ một AppArmor profile chặn ghi file:

```text
#include <tunables/global>

profile k8s-deny-write flags=(attach_disconnected) {
  #include <abstractions/base>

  file,
  # Chặn mọi thao tác ghi (w) trên toàn bộ filesystem
  deny /** w,
}
```

> **Exam Tip**: Tên profile trong YAML (`localhostProfile: k8s-deny-write`) phải trùng khớp chính xác với **tên profile khai báo bên trong file** (`profile k8s-deny-write`), KHÔNG nhất thiết trùng với tên file trên đĩa! Nếu quên nạp profile trên Worker Node bằng `apparmor_parser`, Pod sẽ bị treo ở trạng thái `Blocked` hoặc `CreateContainerError`.

## 3. Seccomp — Lọc System Calls (Syscalls)

**Seccomp (Secure Computing Mode)** lọc các lời gọi hệ thống (`syscall`) mà tiến trình container được phép gửi tới Linux Kernel (Linux có hơn 300 syscalls; container thông thường chỉ cần một phần nhỏ).

### Các chế độ `seccompProfile.type` trong Kubernetes

| Type | Mô tả | Khi nào dùng |
| :--- | :--- | :--- |
| `Unconfined` | Không lọc syscall (mặc định nếu không cấu hình) | Không khuyến nghị trên production |
| `RuntimeDefault` | Dùng profile mặc định của Container Runtime (`containerd` chặn ~44 syscalls nguy hiểm như `reboot`, `mount`, `keyctl`) | Chuẩn tối thiểu cho mọi workload (bắt buộc bởi PSS Restricted) |
| `Localhost` | Dùng file JSON custom đặt tại `/var/lib/kubelet/seccomp/<localhostProfile>` trên Worker Node | Khi cần kiểm soát chi tiết (chặn `mkdir`, ghi audit log `SCMP_ACT_LOG`,...) |

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: seccomp-audit-pod
spec:
  securityContext:
    seccompProfile:
      type: Localhost
      localhostProfile: profiles/audit.json
  containers:
    - name: app
      image: hashicorp/http-echo:1.0
      args: ["-text=hello-cks"]
      securityContext:
        allowPrivilegeEscalation: false
```

### Kiểm tra Seccomp hoạt động trên container

```bash
# Kiểm tra trường Seccomp trong /proc/<pid>/status (0=disabled, 1=strict, 2=filter)
kubectl exec seccomp-audit-pod -- grep Seccomp /proc/1/status
# Kết quả mong đợi: Seccomp: 2
```

### Bật Seccomp mặc định toàn cụm trên kubelet
Trong `/var/lib/kubelet/config.yaml`, thêm `seccompDefault: true` (hoặc cờ `--seccomp-default` cho kubelet). Khi đó mọi Pod không khai báo `seccompProfile` sẽ tự động áp dụng `RuntimeDefault`.

## 4. Linux Capabilities & Kernel Hardening

Thay vì chạy container với quyền `root` toàn phần, hãy **xóa toàn bộ capabilities (`drop: ["ALL"]`)** và chỉ cấp lại đúng capability cần thiết (ví dụ `NET_BIND_SERVICE` để bind cổng < 1024):

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities:
    drop:
      - ALL
    add:
      - NET_BIND_SERVICE
```

Ngoài ra, tránh sử dụng các thiết lập chia sẻ namespace của Host như `hostNetwork: true`, `hostPID: true`, `hostIPC: true`, `privileged: true` vì chúng phá vỡ ranh giới cô lập giữa container và Node.

---

[← Bài trước](05-host-os-kernel-capabilities.md) | [Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/07-apparmor-seccomp-profiles.md) | [Bài tiếp →](07-microservice-pod-security-sandboxing.md)
