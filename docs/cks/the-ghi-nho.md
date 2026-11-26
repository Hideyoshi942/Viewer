# Thẻ ghi nhớ (Flashcards) — CKS

> 24 thẻ · Đọc mặt trước, tự trả lời rồi mở đáp án.

## 1. Cô lập Mạng Cụm với NetworkPolicy & Cilium/Calico

**1. Trong NetworkPolicy, sự khác biệt giữa đặt `namespaceSelector` và `podSelector` trong CÙNG một phần tử mảng vs HAI phần tử mảng riêng biệt là gì?**

<details><summary>Xem đáp án</summary>

- **Cùng một phần tử (1 dấu `-`)**: Toán tử **AND** (chỉ khớp Pod có label đó NẰM TRONG Namespace đó).
- **Hai phần tử riêng (2 dấu `-`)**: Toán tử **OR** (khớp mọi Pod trong Namespace đó HOẶC Pod có label đó cùng Namespace hiện tại).

</details>

**2. Khi áp dụng `default-deny-egress` NetworkPolicy, tại sao cần mở thêm rule cho `kube-dns` và mở cổng nào?**

<details><summary>Xem đáp án</summary>

Vì chặn toàn bộ Egress sẽ chặn luôn truy vấn phân giải tên miền tới CoreDNS. Cần mở **Egress UDP và TCP cổng 53** tới Namespace `kube-system` (Pod label `k8s-app: kube-dns`).

</details>

## 2. Đánh giá & Khắc phục CIS Benchmark với kube-bench

**3. Lệnh chạy kiểm tra CIS Benchmark bằng `kube-bench` cho Control Plane và Worker Node? File cấu hình kubelet nằm ở đâu?**

<details><summary>Xem đáp án</summary>

- Control Plane: `kube-bench run --targets master,etcd`
- Worker Node: `kube-bench run --targets node`
- File cấu hình kubelet: `/var/lib/kubelet/config.yaml` (sau khi sửa chạy `systemctl daemon-reload && systemctl restart kubelet`).

</details>

## 3. Bảo mật Ingress TLS, Metadata API & Xác minh Binary

**4. Cách chặn Pod truy cập Cloud Metadata API (`169.254.169.254`) và cách xác minh checksum nhị phân Kubernetes?**

<details><summary>Xem đáp án</summary>

- **Chặn Metadata API**: Dùng Egress NetworkPolicy với `ipBlock: { cidr: 0.0.0.0/0, except: [169.254.169.254/32] }`.
- **Xác minh nhị phân**: `echo "<hash>  /usr/bin/kubelet" | sha512sum --check`.

</details>

## 4. Gia cố RBAC & ServiceAccount (Least Privilege)

**5. Lệnh kiểm tra xem ServiceAccount `sa-a` trong namespace `ns-a` có quyền đọc `secrets` trong namespace `ns-b` hay không?**

<details><summary>Xem đáp án</summary>

`kubectl auth can-i get secrets -n ns-b --as=system:serviceaccount:ns-a:sa-a`
(Lưu ý bắt buộc phải có tiền tố `system:serviceaccount:<sa-ns>:<sa-name>`).

</details>

**6. Làm sao ngăn Kubernetes tự động mount ServiceAccount token vào Pod? Giữa Pod spec và ServiceAccount, cài đặt nào được ưu tiên?**

<details><summary>Xem đáp án</summary>

Đặt `automountServiceAccountToken: false` trên cả **ServiceAccount** và **Pod spec**. Nếu cấu hình khác nhau, giá trị trên **Pod spec** sẽ ghi đè giá trị trên ServiceAccount.

</details>

## 5. Gia cố API Server, NodeRestriction & Nâng cấp An toàn

**7. Các cờ gia cố quan trọng nhất trên `kube-apiserver.yaml` theo chuẩn CIS Benchmark?**

<details><summary>Xem đáp án</summary>

- `--anonymous-auth=false`
- `--authorization-mode=Node,RBAC` (cấm `AlwaysAllow`)
- `--enable-admission-plugins=NodeRestriction,...`
- `--profiling=false`
- `--kubelet-certificate-authority=/etc/kubernetes/pki/ca.crt`

</details>

**8. Admission Plugin `NodeRestriction` bảo vệ cụm khỏi kịch bản tấn công nào?**

<details><summary>Xem đáp án</summary>

Ngăn một `kubelet` trên Worker Node bị xâm nhập sửa đổi đối tượng `Node` hoặc `Pod` của các Worker Node khác và ngăn tự ý gắn các nhãn bảo mật (`node-restriction.kubernetes.io/*`).

</details>

## 6. Gia cố Host OS, Kernel & Linux Capabilities

**9. Cách cấp quyền bind cổng 80 cho container mà KHÔNG cần chạy quyền root đầy đủ?**

<details><summary>Xem đáp án</summary>

Trong container `securityContext`: xóa toàn bộ capabilities (`capabilities.drop: ["ALL"]`), chỉ thêm lại `capabilities.add: ["NET_BIND_SERVICE"]` và đặt `allowPrivilegeEscalation: false`.

</details>

**10. Các lệnh Linux nhanh nhất để kiểm tra bề mặt tấn công (dịch vụ thừa, cổng mở, user) trên Worker Node?**

<details><summary>Xem đáp án</summary>

- Cổng mở & tiến trình: `ss -tulpn`
- Dịch vụ đang bật: `systemctl list-unit-files --type=service --state=enabled`
- Tắt & gỡ dịch vụ thừa: `systemctl stop <svc> && systemctl disable <svc> && apt-get purge -y <pkg>`.

</details>

## 7. Kiểm soát Syscall với AppArmor & Seccomp Profiles

**11. 3 bước áp dụng một AppArmor profile tùy chỉnh cho Pod trong Kubernetes 1.30+?**

<details><summary>Xem đáp án</summary>

1. Nạp profile trên **mọi Worker Node** có thể chạy Pod: `apparmor_parser -q /etc/apparmor.d/<file>`.
2. Kiểm tra tên profile thực tế đã nạp bằng `aa-status`.
3. Khai báo trong Pod `securityContext.appArmorProfile: { type: Localhost, localhostProfile: <tên-profile-trong-file> }`.

</details>

**12. Thư mục gốc trên Worker Node chứa các file JSON Seccomp Localhost profile? Cách kiểm tra Seccomp đang chạy trong Pod?**

<details><summary>Xem đáp án</summary>

- Thư mục gốc: `/var/lib/kubelet/seccomp/` (nếu `localhostProfile: profiles/audit.json` → file nằm tại `/var/lib/kubelet/seccomp/profiles/audit.json`).
- Kiểm tra: `kubectl exec <pod> -- grep Seccomp /proc/1/status` (`Seccomp: 2` = Filter mode đang bật).

</details>

## 8. Pod Security Standards (PSS/PSA) & OPA Gatekeeper

**13. 4 yêu cầu bắt buộc của Pod Security Standards (PSS) mức `restricted` trên Pod/Container?**

<details><summary>Xem đáp án</summary>

1. `runAsNonRoot: true`
2. `allowPrivilegeEscalation: false`
3. `capabilities.drop: ["ALL"]`
4. `seccompProfile.type: RuntimeDefault` hoặc `Localhost` (cùng toàn bộ ràng buộc của `baseline`).

</details>

## 9. Sandboxing Workload (gVisor/Kata) & mTLS (Istio/Cilium)

**14. So sánh nhanh `gVisor (runsc)` và `Kata Containers` khi dùng với `RuntimeClass`?**

<details><summary>Xem đáp án</summary>

- **gVisor (`runsc`)**: Chạy một **user-space kernel** chặn và mô phỏng syscalls trước khi chạm tới host kernel (nhẹ hơn, khởi động nhanh).
- **Kata Containers**: Cô lập mỗi Pod trong một **micro-VM nhẹ** có nhân Linux riêng biệt (cô lập phần cứng mạnh nhất).

</details>

**15. OPA Gatekeeper dùng cặp tài nguyên nào để thực thi chính sách tùy chỉnh? Istio dùng tài nguyên nào để ép buộc mTLS?**

<details><summary>Xem đáp án</summary>

- **OPA Gatekeeper**: `ConstraintTemplate` (chứa mã Rego + schema) và `Constraint` (áp dụng lên resource/namespace).
- **Istio mTLS**: `PeerAuthentication` với `spec.mtls.mode: STRICT`.

</details>

## 10. Quản lý Secrets & Mã hóa Dữ liệu trong etcd (Encryption at Rest)

**16. Thứ tự `providers` trong `EncryptionConfiguration` (Secrets Encryption at Rest) có ý nghĩa gì? Lệnh mã hóa lại Secrets cũ?**

<details><summary>Xem đáp án</summary>

- Provider **đầu tiên** (`aescbc` hoặc `kms`) dùng để **mã hóa khi ghi mới**; các provider sau (như `identity: {}`) chỉ dùng để **giải mã dữ liệu cũ**.
- Lệnh mã hóa lại toàn bộ Secrets cũ: `kubectl get secrets -A -o json | kubectl replace -f -`.

</details>

## 11. Quét Lỗ hổng (Trivy), SBOM, Cosign & Image Digest

**17. Lệnh `trivy` để quét lỗ hổng `HIGH,CRITICAL` và làm fail CI/CD (exit code 1) nếu có CVE đã có bản vá?**

<details><summary>Xem đáp án</summary>

`trivy image --severity HIGH,CRITICAL --ignore-unfixed --exit-code 1 <image:tag>`

</details>

**18. Lệnh tạo SBOM chuẩn SPDX JSON bằng Trivy và lệnh xác minh chữ ký số image bằng Cosign?**

<details><summary>Xem đáp án</summary>

- Tạo SBOM: `trivy image --format spdx-json --output sbom.json <image>`
- Xác minh chữ ký: `cosign verify --key cosign.pub <image@sha256:digest>`

</details>

## 12. ImagePolicyWebhook, Dockerfile Hardening & Static Analysis

**19. 3 cấu hình bắt buộc để kích hoạt `ImagePolicyWebhook` trên `kube-apiserver` và giá trị an toàn của `defaultAllow`?**

<details><summary>Xem đáp án</summary>

1. `--enable-admission-plugins=...,ImagePolicyWebhook`
2. `--admission-control-config-file=/path/to/admission_config.json`
3. Mount `hostPath` cho thư mục chứa config & kubeconfig.
- Luôn đặt `"defaultAllow": false` (fail-closed) để chặn image khi webhook bị lỗi.

</details>

**20. 4 thực hành cốt lõi khi gia cố Dockerfile và các công cụ phân tích tĩnh (Static Analysis) YAML/Dockerfile?**

<details><summary>Xem đáp án</summary>

- **Dockerfile**: Multi-stage build, base image `distroless`/`scratch`, ghim digest `@sha256:...`, chạy `USER` non-root, không lưu secrets trong `ENV`/`ARG`.
- **Static Analysis**: `kubesec`, `kube-linter`, `trivy config`, `hadolint`.

</details>

## 13. Kubernetes Audit Policy & Audit Logging

**21. 4 cấp độ (levels) trong Kubernetes Audit Policy và cấp độ nào BẮT BUỘC dùng cho `Secrets`?**

<details><summary>Xem đáp án</summary>

1. `None` (không ghi)
2. `Metadata` (chỉ ghi ai/làm gì/khi nào — **bắt buộc cho `Secrets`** để không lộ body)
3. `Request` (metadata + request body)
4. `RequestResponse` (đầy đủ cả response body).
*Lưu ý: Đánh giá theo quy tắc **first-match wins** từ trên xuống.*

</details>

**22. 4 cờ cấu hình Audit Logging trên `kube-apiserver.yaml` và lưu ý quan trọng nhất tránh crash API Server?**

<details><summary>Xem đáp án</summary>

- `--audit-policy-file`, `--audit-log-path`, `--audit-log-maxage`, `--audit-log-maxbackup`, `--audit-log-maxsize`.
- **Lưu ý sống còn**: Phải khai báo `volumes` (`hostPath`) và `volumeMounts` cho cả file policy (`readOnly: true`) lẫn thư mục lưu log (`readOnly: false`).

</details>

## 14. Giám sát Runtime với Falco, Container Immutability & Forensics

**23. File đặt Falco custom rules, lệnh kiểm tra cú pháp rule, và các trường output quan trọng cho Kubernetes?**

<details><summary>Xem đáp án</summary>

- File: `/etc/falco/falco_rules.local.yaml`
- Kiểm tra cú pháp: `falco -V /etc/falco/falco_rules.local.yaml`
- Trường phổ biến: `%evt.time`, `%user.uid`, `%proc.name`, `%fd.name`, `%container.id`, `%k8s.pod.name`, `%k8s.ns.name`.

</details>

**24. Làm sao duy trì Container Immutability (`readOnlyRootFilesystem: true`) khi ứng dụng cần ghi file tạm (ví dụ `/tmp`, `/var/cache`)?**

<details><summary>Xem đáp án</summary>

Giữ nguyên `securityContext.readOnlyRootFilesystem: true` và mount thêm các volume `emptyDir` vào đúng đường dẫn cần ghi tạm (tuyệt đối không dùng `hostPath` hay tắt `readOnlyRootFilesystem`).

</details>

---

[Mục lục CKS](00-tong-quan-va-lo-trinh-cks.md)
