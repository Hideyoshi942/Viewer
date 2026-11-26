# Domain 6: Giám sát Runtime & Audit Logging (15%)

Ngay cả khi hệ thống đã được gia cố tốt, kẻ tấn công vẫn có thể khai thác lỗ hổng ứng dụng Zero-Day ở thời điểm chạy (runtime). Domain 6 tập trung vào **phát hiện xâm nhập thời gian thực (Falco)**, **ghi nhật ký kiểm toán API (Kubernetes Audit Logging)**, **đảm bảo container bất biến** và **điều tra sự cố (Forensics)**.

## 1. Falco — Giám sát Hành vi Runtime ở Mức Nhân

**Falco** (CNCF Graduated) sử dụng **eBPF probe** hoặc **kernel module** để theo dõi mọi system call trên Node và so khớp với các **Falco Rules** theo thời gian thực.

### Cấu trúc một Falco Rule tùy chỉnh (`/etc/falco/falco_rules.local.yaml`)

```yaml
- rule: Detect Sensitive File Read in Container
  desc: Detect any attempt to read /etc/shadow inside a container
  condition: >
    open_read and container and fd.name = /etc/shadow
  output: >
    Sensitive file opened (time=%evt.time user=%user.name
    container=%container.name pod=%k8s.pod.name ns=%k8s.ns.name
    file=%fd.name cmd=%proc.cmdline)
  priority: CRITICAL
  tags: [filesystem, mitre_credential_access]
```

### Các trường `output` và lệnh Falco hay dùng trong CKS

| Trường Falco | Ý nghĩa |
| :--- | :--- |
| `%evt.time` | Thời điểm xảy ra sự kiện |
| `%user.name` / `%user.uid` | Tên / UID người dùng thực thi |
| `%proc.name` / `%proc.cmdline` | Tên tiến trình và đầy đủ tham số dòng lệnh |
| `%container.id` / `%container.name` | ID và tên container |
| `%k8s.pod.name` / `%k8s.ns.name` | Tên Pod và Namespace Kubernetes |
| `%fd.name` | Đường dẫn tệp tin bị truy cập |

```bash
# Kiểm tra cú pháp file rule trước khi khởi động lại dịch vụ
falco -V /etc/falco/falco_rules.local.yaml

# Khởi động lại Falco (chạy dạng systemd service trên Node)
systemctl restart falco
journalctl -u falco -f

# Chạy Falco thủ công trong 30 giây và ghi log ra file
falco -M 30 -r /etc/falco/falco_rules.local.yaml > /root/falco-alerts.log
```

> **Exam Tip**: Không sửa trực tiếp `/etc/falco/falco_rules.yaml` (file mặc định dễ bị ghi đè khi nâng cấp); hãy luôn viết rule mới hoặc ghi đè (`override`) vào `/etc/falco/falco_rules.local.yaml`. Nếu đề bài yêu cầu format output theo đúng thứ tự trường (`%evt.time,%user.uid,%proc.name`), hãy kiểm tra kỹ từng ký tự ngăn cách!

## 2. Kubernetes Audit Logging

**Audit Logging** trên `kube-apiserver` ghi lại toàn bộ lịch sử ai đã gọi API gì, khi nào, từ đâu và kết quả ra sao.

### 4 cấp độ Audit Level (từ thấp đến cao)
1. `None`: Không ghi log sự kiện khớp rule.
2. `Metadata`: Ghi metadata request (user, timestamp, resource, verb) — **KHÔNG** ghi request/response body (dùng cho `Secrets` để tránh lộ dữ liệu nhạy cảm!).
3. `Request`: Ghi metadata + request body (không ghi response body).
4. `RequestResponse`: Ghi đầy đủ metadata + request body + response body (tốn dung lượng nhất).

### Mẫu Audit Policy (`/etc/kubernetes/audit/policy.yaml`)

```yaml
apiVersion: audit.k8s.io/v1
kind: Policy
omitStages:
  - "RequestReceived"
rules:
  # Chỉ ghi Metadata cho Secrets để không làm lộ nội dung bí mật trong log
  - level: Metadata
    resources:
      - group: ""
        resources: ["secrets", "configmaps"]
  # Ghi RequestResponse cho mọi thao tác trên Deployment trong namespace prod
  - level: RequestResponse
    namespaces: ["prod"]
    resources:
      - group: "apps"
        resources: ["deployments"]
  # Ghi Metadata cho mọi sự kiện còn lại
  - level: Metadata
```

### Kích hoạt Audit Log trong `/etc/kubernetes/manifests/kube-apiserver.yaml`

Thêm các cờ sau (và nhớ mount cả thư mục policy và thư mục lưu log dạng `hostPath`!):
```yaml
- --audit-policy-file=/etc/kubernetes/audit/policy.yaml
- --audit-log-path=/var/log/kubernetes/audit/audit.log
- --audit-log-maxage=30
- --audit-log-maxbackup=10
- --audit-log-maxsize=100
```

> **Exam Tip**: Audit Policy đánh giá các rule **từ trên xuống dưới và khớp ngay ở rule đầu tiên (first-match wins)**. Luôn đặt các rule cụ thể (như `secrets` với `level: Metadata`, hoặc `None` cho các endpoint ồn ào) lên **phía trên** các rule catch-all!

## 3. Đảm bảo Container Bất biến (Immutability at Runtime)

Container nên là **immutable**: không sửa đổi mã nguồn, không cài đặt gói mới trong lúc chạy.
- Bật `securityContext.readOnlyRootFilesystem: true`.
- Nếu ứng dụng cần ghi file tạm (cache, PID, logs), mount thêm volume `emptyDir` vào đúng thư mục cần ghi (ví dụ `/tmp` hoặc `/var/cache/nginx`).
- Dùng ảnh `distroless` để loại bỏ shell (`/bin/sh`), trình quản lý gói (`apt`/`apk`) và công cụ mạng (`curl`/`nc`).

## 4. Điều tra Sự cố & Cô lập Pod bị Xâm nhập (Forensics)

Khi phát hiện Pod có hành vi bất thường (ví dụ đào tiền ảo, kết nối C2, đọc `/etc/shadow`):
1. **Không xóa ngay lập tức** nếu cần giữ bằng chứng: cô lập mạng bằng `NetworkPolicy` chặn toàn bộ Ingress/Egress hoặc gỡ label khỏi Service để ngắt traffic.
2. **Thu thập bằng chứng trên Node**:
   ```bash
   crictl ps | grep <pod-name>
   crictl inspect <container-id> | grep -i pid
   ls -la /proc/<pid>/exe /proc/<pid>/fd
   ```
3. **Kiểm tra nguyên nhân gốc rễ**: Xem lại Audit Log (`jq` lọc theo `user.username` và `objectRef`) và xóa Deployment/CronJob độc hại nếu bị tái tạo tự động.

---

[← Bài trước](11-admission-dockerfile-static-analysis.md) | [Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/14-falco-runtime-immutability-forensics.md)
