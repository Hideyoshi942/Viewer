# Bài tập tình huống — 7. Workloads Nâng cao — StatefulSet, Jobs/CronJobs, HPA & PodDisruptionBudget

> Triển khai ứng dụng có trạng thái với StatefulSet (Headless Service & volumeClaimTemplates), tác vụ định kỳ Job/CronJob, tự động co giãn HPA và bảo vệ tính sẵn sàng với PDB.
> **Số câu hỏi:** 4 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

Which TWO conditions are required for a `HorizontalPodAutoscaler` (HPA) configured with CPU utilization target `60%` to autoscale a `Deployment`? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** The containers in the Deployment's Pod template must specify `resources.requests.cpu`.
- **B.** A `PodDisruptionBudget` with `minAvailable: 1` must exist in the same namespace as the Deployment.
- **C.** The Deployment must use `strategy.type: Recreate` instead of `RollingUpdate`.
- **D.** The Metrics Server must be installed and running in the cluster.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** HAI điều kiện nào là bắt buộc để một `HorizontalPodAutoscaler` (HPA) được cấu hình với mục tiêu sử dụng CPU `60%` có thể tự động co giãn (autoscale) một `Deployment`? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, D**

HPA dựa vào Metrics Server để đọc mức CPU thực tế và chia cho `resources.requests.cpu` để tính `% utilization`.

- **A (Đúng):** Đúng! HPA tính phần trăm sử dụng CPU dựa trên `requests.cpu` (nếu thiếu `requests`, HPA sẽ báo `<unknown>` và không scale).
- **B:** Sai vì PDB không liên quan đến điều kiện hoạt động của HPA.
- **C:** Sai vì chiến lược cập nhật không ảnh hưởng đến HPA.
- **D (Đúng):** Đúng! HPA lấy số liệu CPU/Memory hiện tại của Pod thông qua Metrics API (`metrics-server`).

</details>

### Câu 2 `easy`

Which `Job` specification field limits the total number of failed Pod retries before the `Job` is marked as Failed?

- **A.** parallelism
- **B.** ttlSecondsAfterFinished
- **C.** completions
- **D.** backoffLimit

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trường nào trong đặc tả của `Job` giới hạn tổng số lần thử lại Pod bị lỗi trước khi `Job` bị đánh dấu là Failed?

**Đáp án đúng:** **D**

Trong `batch/v1 Job`: `completions` là số lần thành công cần đạt, `parallelism` là số Pod chạy đồng thời, `backoffLimit` là số lần retry tối đa khi thất bại.

- **A:** Sai vì `parallelism` quy định số Pod chạy song song cùng lúc.
- **B:** Sai vì `ttlSecondsAfterFinished` quy định thời gian tự động dọn dẹp Job sau khi chạy xong.
- **C:** Sai vì `completions` quy định tổng số Pod cần hoàn thành thành công.
- **D (Đúng):** Đúng! `spec.backoffLimit` (mặc định là 6) quy định số lần thử lại tối đa trước khi Job chuyển sang trạng thái Failed.

</details>

### Câu 3 `medium`

You need to create a `CronJob` named `db-backup` in namespace `ops` that runs every 15 minutes using image `busybox:1.36` and executes `echo backup`. Also, if the previous Job is still running when the next schedule triggers, the new run must be skipped. Which `concurrencyPolicy` should be set?

- **A.** Allow
- **B.** Never
- **C.** Replace
- **D.** Forbid

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn cần tạo một `CronJob` tên `db-backup` trong namespace `ops` chạy mỗi 15 phút sử dụng image `busybox:1.36` và thực thi `echo backup`. Ngoài ra, nếu Job trước đó vẫn đang chạy khi lịch trình tiếp theo kích hoạt, lượt chạy mới phải bị bỏ qua. Cần thiết lập `concurrencyPolicy` nào?

**Đáp án đúng:** **D**

Ba giá trị `concurrencyPolicy` của `CronJob`: `Allow` (cho phép chạy song song), `Forbid` (bỏ qua lượt mới nếu lượt cũ chưa xong), `Replace` (hủy lượt cũ, chạy lượt mới).

- **A:** Sai vì `Allow` (mặc định) cho phép nhiều Job chạy chồng lấn cùng lúc.
- **B:** Sai vì `Never` là giá trị của `restartPolicy`, không phải `concurrencyPolicy`.
- **C:** Sai vì `Replace` sẽ hủy Job cũ đang chạy để khởi chạy Job mới.
- **D (Đúng):** Đúng! `concurrencyPolicy: Forbid` không cho phép chạy đồng thời; nếu Job trước chưa hoàn thành thì lượt chạy mới sẽ bị bỏ qua.

</details>

### Câu 4 `medium`

A Pod `gpu-job` needs to run ONLY on nodes labeled `gpu=true` AND must tolerate the taint `dedicated=gpu:NoSchedule`. You add the toleration to `gpu-job` without any `nodeAffinity` or `nodeSelector`. What might happen?

- **A.** The Pod will fail with `CreateContainerConfigError` because `nodeAffinity` is required.
- **B.** The Pod may still be scheduled onto non-GPU nodes that do not have the taint.
- **C.** The Pod will automatically be restricted to nodes with `dedicated=gpu`.
- **D.** The `kube-scheduler` will reject the Pod in `Pending` status until a `nodeSelector` is added.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một Pod `gpu-job` cần chạy CHỈ trên các node có label `gpu=true` VÀ phải chịu được (tolerate) taint `dedicated=gpu:NoSchedule`. Bạn thêm toleration vào `gpu-job` mà không có `nodeAffinity` hay `nodeSelector` nào. Điều gì có thể xảy ra?

**Đáp án đúng:** **B**

Nguyên tắc vàng về lập lịch: Taints/Tolerations **đẩy** Pod khác ra khỏi node đặc biệt; NodeSelector/NodeAffinity **hút** Pod về đúng node đó. Muốn dành riêng (dedicated), phải dùng kết hợp cả hai.

- **A:** Sai vì thiếu `nodeAffinity` không gây lỗi tạo container.
- **B (Đúng):** Đúng! Toleration chỉ cho phép Pod "chịu được" Taint trên node GPU, nhưng KHÔNG bắt buộc Pod phải chạy trên node GPU — nó vẫn có thể rơi vào các node thường khác nếu thiếu `nodeSelector` hoặc `nodeAffinity`.
- **C:** Sai — đây là hiểu nhầm phổ biến nhất về Taints/Tolerations. Toleration KHÔNG phải là Affinity.
- **D:** Sai vì nếu còn các node thường không có Taint, Scheduler vẫn lập lịch Pod lên đó bình thường.

</details>

---

[Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md)
