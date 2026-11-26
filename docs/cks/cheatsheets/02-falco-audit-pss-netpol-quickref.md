# CKS Cheatsheet 2: Falco, Audit Policy, PSS/PSA & NetworkPolicy

Tổng hợp các bảng so sánh, bẫy hay gặp và mẫu cấu hình chuẩn cho 4 nhóm kiến thức xuất hiện nhiều nhất trong đề thi CKS.

## 1. Ma trận So sánh Pod Security Standards (PSS)

| Thuộc tính Pod / Container | `privileged` | `baseline` | `restricted` |
| :--- | :---: | :---: | :---: |
| `privileged: true` | Cho phép | Cấm | Cấm |
| `hostNetwork` / `hostPID` / `hostIPC` | Cho phép | Cấm | Cấm |
| `hostPath` volumes | Cho phép | Cấm | Cấm |
| `runAsNonRoot: true` | Không bắt buộc | Không bắt buộc | **Bắt buộc** |
| `allowPrivilegeEscalation: false` | Không bắt buộc | Không bắt buộc | **Bắt buộc** |
| `capabilities.drop: ["ALL"]` | Không bắt buộc | Không bắt buộc | **Bắt buộc** |
| `seccompProfile: RuntimeDefault/Localhost` | Không bắt buộc | Không bắt buộc | **Bắt buộc** |

## 2. NetworkPolicy — Bẫy AND vs OR

```yaml
# ĐÚNG (AND): Chỉ cho phép Pod có label app=web NẰM TRONG namespace env=prod
ingress:
  - from:
      - namespaceSelector:
          matchLabels:
            env: prod
        podSelector:
          matchLabels:
            app: web

# KHÁC BIỆT (OR): Cho phép MỌI Pod trong namespace env=prod HOẶC Pod app=web cùng namespace hiện tại
ingress:
  - from:
      - namespaceSelector:
          matchLabels:
            env: prod
      - podSelector:
          matchLabels:
            app: web
```

### Checklist NetworkPolicy
- Luôn kiểm tra `policyTypes: [Ingress, Egress]`. Nếu thiếu `Egress`, chính sách không ảnh hưởng chiều ra.
- Khi chặn `Egress` mặc định, **luôn mở cổng 53 UDP/TCP** nếu Pod cần phân giải tên miền qua CoreDNS.
- Để chặn AWS/GCP/Azure Metadata API: dùng `ipBlock: { cidr: 0.0.0.0/0, except: [169.254.169.254/32] }`.

## 3. Kubernetes Audit Policy — Quy tắc Đánh giá

| Audit Level | Metadata | Request Body | Response Body | Khuyến nghị dùng cho |
| :--- | :---: | :---: | :---: | :--- |
| `None` | Không | Không | Không | Event nhiễu (healthz, watch không cần thiết) |
| `Metadata` | Có | Không | Không | **Secrets**, ConfigMaps (tránh lộ mật khẩu) |
| `Request` | Có | Có | Không | Theo dõi thay đổi Pod/ServiceAccount |
| `RequestResponse` | Có | Có | Có | Tài nguyên nhạy cảm cần theo dõi đầy đủ (RoleBinding, Deployment prod) |

### 4 cờ bắt buộc trên `kube-apiserver.yaml`
```yaml
- --audit-policy-file=/etc/kubernetes/audit/policy.yaml
- --audit-log-path=/var/log/kubernetes/audit/audit.log
- --audit-log-maxage=30
- --audit-log-maxbackup=10
- --audit-log-maxsize=100
```
**Nhớ mount 2 `hostPath` volumes**: một cho file `policy.yaml` (`readOnly: true`) và một cho thư mục `/var/log/kubernetes/audit` (`readOnly: false`).

## 4. Falco — Các Macro & Field Phổ biến

| Thành phần | Ví dụ sử dụng trong `condition` / `output` |
| :--- | :--- |
| Lọc trong container | `container` hoặc `container.id != host` |
| Mở file đọc/ghi | `open_read`, `open_write`, `fd.name = /etc/passwd`, `fd.name startswith /etc/` |
| Chạy tiến trình / shell | `spawned_process`, `proc.name in (bash, sh, dash)`, `proc.pname` |
| Kết nối mạng | `outbound`, `fd.sip`, `fd.sport`, `fd.dip`, `fd.dport` |
| Ngữ cảnh Kubernetes | `%k8s.pod.name`, `%k8s.ns.name`, `%container.id`, `%container.image.repository` |
| Mức độ (`priority`) | `EMERGENCY`, `ALERT`, `CRITICAL`, `ERROR`, `WARNING`, `NOTICE`, `INFO`, `DEBUG` |

> **Exam Tip**: Khi sửa `EncryptionConfiguration`, `ImagePolicyWebhook` hay `Audit Policy` trên `kube-apiserver.yaml`, luôn kiểm tra kỹ: (1) đường dẫn `volumeMounts` bên trong container khớp 100% với giá trị cờ `--...`, (2) `volumes` ở cuối manifest khớp `name` với `volumeMounts`, và (3) `kube-apiserver` khởi động lại thành công (`kubectl get pods -n kube-system`).

---

[Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md)
