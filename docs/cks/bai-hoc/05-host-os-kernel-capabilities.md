# Gia cố Host OS, Kernel & Linux Capabilities (Domain 3)

Một container bị xâm nhập có thể leo thang đặc quyền sang Host OS nếu Worker Node không được thu nhỏ bề mặt tấn công (OS Footprint) hoặc container được cấp quá nhiều Linux Capabilities.

---

## 1. Thu nhỏ Bề mặt Tấn công trên Host OS

Trước khi đưa Node vào cụm hoặc khi audit bảo mật Node:

```bash
# Kiểm tra các cổng TCP/UDP đang lắng nghe và tiến trình sở hữu
sudo ss -tulpn

# Liệt kê các dịch vụ systemd đang chạy và tắt dịch vụ không cần thiết (vd: apache2, telnet, rpcbind)
systemctl list-units --type=service --state=running
sudo systemctl stop apache2 && sudo systemctl disable apache2

# Xóa các gói công cụ nguy hiểm không cần thiết trên production node
sudo apt-get purge -y netcat nmap tcpdump
```

---

## 2. Tinh chỉnh Kernel Parameters với `sysctl`

Các tham số kernel giúp ngăn chặn tấn công mạng và bảo vệ bộ nhớ:

```bash
# Xem giá trị hiện tại
sysctl net.ipv4.ip_forward

# Áp dụng cấu hình bền vững trong /etc/sysctl.d/99-k8s-hardening.conf
cat <<EOF | sudo tee /etc/sysctl.d/99-k8s-hardening.conf
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
kernel.kptr_restrict = 2
EOF

sudo sysctl --system
```

---

## 3. Kiểm soát Linux Capabilities trong `securityContext`

Thay vì chạy container với `privileged: true` hoặc giữ nguyên bộ capabilities mặc định của Docker/containerd, nguyên tắc chuẩn CKS là **drop `ALL`** và chỉ `add` đúng capability tối thiểu cần thiết (ví dụ `NET_BIND_SERVICE` để bind port < 1024 như port 80/443).

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-hardened
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 10001
  containers:
  - name: nginx
    image: nginx:1.27-alpine
    securityContext:
      allowPrivilegeEscalation: false
      capabilities:
        drop:
        - ALL
        add:
        - NET_BIND_SERVICE
```

| Capability | Rủi ro bảo mật | Khuyến nghị |
| :--- | :--- | :--- |
| `SYS_ADMIN` | Gần tương đương root trên host (mount filesystem, thoát container) | **CẤM TUYỆT ĐỐI** |
| `NET_ADMIN` | Sửa bảng định tuyến, iptables, sniff traffic | Chỉ cấp cho CNI plugin |
| `NET_BIND_SERVICE` | Cho phép user thường mở port < 1024 | Chấp nhận được nếu cần bind port 80/443 |

---

## 4. Exam Tips

1. Luôn kiểm tra cả `pod.spec.securityContext` (cấp Pod) và `container.securityContext` (cấp Container). `capabilities` và `allowPrivilegeEscalation` chỉ khai báo được ở **cấp Container**.
2. Nếu đề yêu cầu container không chạy dưới quyền root (`UID 0`) nhưng vẫn bind port 80, hãy giữ `runAsNonRoot: true`, `runAsUser: 1000`, `capabilities.drop: ["ALL"]` và `capabilities.add: ["NET_BIND_SERVICE"]`.

---

[← Bài trước](04-apiserver-node-restriction-upgrade.md) | [Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/06-host-os-kernel-capabilities.md) | [Bài tiếp →](06-system-hardening-apparmor-seccomp.md)
