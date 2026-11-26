# Bài tập tình huống — 2. Quản trị etcd — Sao lưu (Snapshot) & Khôi phục Cụm

> Cơ chế lưu trữ Key-Value phân tán của etcd, chứng chỉ TLS khi giao tiếp etcdctl, thực hiện snapshot save và snapshot restore sang thư mục mới kèm cập nhật Static Pod manifest.
> **Số câu hỏi:** 2 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

On a stacked-etcd `kubeadm` cluster, you need to renew all Control Plane TLS certificates that are about to expire. Which command renews all certificates and what must you do afterward?

- **A.** Run `kubectl certificate approve --all` on the control plane node and reboot all worker nodes to reload client certificates.
- **B.** Delete `/etc/kubernetes/pki/ca.crt` and `/etc/kubernetes/pki/ca.key`, then run `systemctl restart kubelet` to regenerate all certs.
- **C.** Run `etcdctl snapshot save /tmp/backup.db` followed by `kubeadm reset -f` and `kubeadm init` to issue fresh Control Plane certificates.
- **D.** Run `kubeadm certs renew all` and restart Control Plane static Pods (`kube-apiserver`, `kube-controller-manager`, `kube-scheduler`, `etcd`).

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trên một `kubeadm` cluster dùng stacked-etcd, bạn cần gia hạn toàn bộ các Control Plane TLS certificate sắp hết hạn. Lệnh nào gia hạn toàn bộ các certificate và bạn phải làm gì sau đó?

**Đáp án đúng:** **D**

Dùng `kubeadm certs check-expiration` để kiểm tra hạn và `kubeadm certs renew all` để gia hạn toàn bộ chứng chỉ Control Plane, sau đó khởi động lại các Static Pod Control Plane.

- **A:** Sai vì `kubectl certificate approve` dùng cho đối tượng CSR, không dùng để gia hạn chứng chỉ Control Plane của `kubeadm`.
- **B:** Sai vì xóa `ca.crt` sẽ phá hỏng toàn bộ chuỗi tin cậy PKI của cụm.
- **C:** Sai vì `kubeadm reset` sẽ xóa sạch cấu hình cụm trên node.
- **D (Đúng):** Đúng! `kubeadm certs renew all` gia hạn chứng chỉ trên đĩa, sau đó các Static Pod Control Plane phải được khởi động lại để nạp chứng chỉ mới từ đĩa.

</details>

### Câu 2 `medium`

On a Kubernetes cluster provisioned with `kubeadm`, an administrator has just restored an `etcd` snapshot backup into the `/var/lib/etcd-from-backup` directory on the `controlplane` node. What is the NEXT step required for the cluster to use the restored `etcd` data?

- **A.** Edit `/etc/kubernetes/manifests/etcd.yaml`, update the `volumes.hostPath.path` for the `etcd-data` volume to `/var/lib/etcd-from-backup`, and wait for `kubelet` to recreate the static Pod.
- **B.** Delete `/etc/kubernetes/pki/etcd` and restart `kube-apiserver` so new TLS certificates and cluster data directories are regenerated automatically.
- **C.** Run `kubectl rollout restart deployment/etcd -n kube-system` and wait for the ReplicaSet controller to mount `/var/lib/etcd-from-backup`.
- **D.** Re-run `kubeadm init --ignore-preflight-errors=all` on the control plane node to reinitialize the cluster state from the restored snapshot.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trên một Kubernetes cluster được khởi tạo bằng `kubeadm`, quản trị viên vừa khôi phục bản sao lưu snapshot `etcd` vào thư mục `/var/lib/etcd-from-backup` trên node `controlplane`. Bước TIẾP THEO cần thực hiện để cluster sử dụng dữ liệu `etcd` đã khôi phục là gì?

**Đáp án đúng:** **A**

Quy trình 2 bước khôi phục `etcd` trên cụm `kubeadm`:
1. `ETCDCTL_API=3 etcdctl snapshot restore <file> --data-dir=/var/lib/etcd-from-backup`
2. Sửa `hostPath.path` trong `/etc/kubernetes/manifests/etcd.yaml` trỏ tới `/var/lib/etcd-from-backup`.

- **A (Đúng):** Đúng! Trong cụm kubeadm, `etcd` chạy dưới dạng Static Pod do `kubelet` quản lý thông qua `/etc/kubernetes/manifests/etcd.yaml`. Khi thay đổi `hostPath.path` sang `/var/lib/etcd-from-backup`, `kubelet` sẽ tự động tạo lại Pod `etcd` gắn vào dữ liệu mới.
- **B:** Sai vì xóa thư mục PKI sẽ làm mất toàn bộ cặp khóa và chứng chỉ CA khiến `etcd` và `kube-apiserver` không thể giao tiếp được.
- **C:** Sai vì `etcd` là Static Pod chứ không phải là một Deployment trong `kube-system`.
- **D:** Sai vì chạy lại `kubeadm init` trên cụm đang hoạt động sẽ gây xung đột cấu hình thay vì trỏ vào thư mục snapshot vừa khôi phục.

</details>

---

[Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md)
