# Bài tập tình huống — 12. ImagePolicyWebhook, Dockerfile Hardening & Static Analysis

> Cấu hình ImagePolicyWebhook admission controller, tối ưu Dockerfile (multi-stage, distroless, non-root user) và phân tích tĩnh manifest YAML với Kubesec/KubeLinter.
> **Số câu hỏi:** 4 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

You configure ImagePolicyWebhook on kube-apiserver to validate container images against an external scanner. What happens when the external webhook server is unreachable if 'defaultAllow: false' is set in the AdmissionConfiguration?

- **A.** kubelet pulls the container image anyway and starts it in a paused state until the external webhook server recovers.
- **B.** kube-apiserver rejects Pod creation (fail-closed) until the webhook becomes reachable and approves the image.
- **C.** kube-apiserver falls back to checking local Trivy cache on the control plane node.
- **D.** kube-apiserver permits all images automatically (fail-open) after retryBackoff expires.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn cấu hình ImagePolicyWebhook trên kube-apiserver để xác thực các container image với một scanner bên ngoài. Điều gì xảy ra khi máy chủ webhook bên ngoài không thể truy cập được nếu 'defaultAllow: false' được thiết lập trong AdmissionConfiguration?

**Đáp án đúng:** **B**

Trong cấu hình ImagePolicyWebhook, defaultAllow: false (fail-closed) là yêu cầu bảo mật tiêu chuẩn để tránh kẻ tấn công lợi dụng việc làm sập webhook nhằm đưa image độc hại vào cụm.

- **A:** Sai. Yêu cầu bị chặn ngay tại API Server ở bước admission, Pod không bao giờ được lưu vào etcd hay gửi tới kubelet.
- **B (Đúng):** Chính xác! defaultAllow: false thiết lập cơ chế fail-closed: nếu webhook gặp sự cố hoặc timeout, API Server sẽ từ chối tạo Pod để đảm bảo an toàn.
- **C:** Sai. kube-apiserver không tích hợp sẵn cơ chế fallback sang Trivy cục bộ.
- **D:** Sai. Hành vi fail-open chỉ xảy ra khi defaultAllow: true.

</details>

### Câu 2 `medium`

Which TWO Dockerfile practices significantly reduce the container image attack surface and prevent supply chain tampering? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Include curl, sudo, and openssh-server in the final container image for easier production troubleshooting and debugging.
- **B.** Use the ':latest' tag for all base images to ensure automatic updates on every build.
- **C.** Pass database passwords using ENV instructions inside the Dockerfile.
- **D.** Specify a non-root USER instruction (such as USER 10001) before ENTRYPOINT/CMD.
- **E.** Use multi-stage builds with a minimal or distroless final base image pinned by SHA-256 digest.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** HAI thực hành Dockerfile nào giúp giảm đáng kể bề mặt tấn công (attack surface) của container image và ngăn chặn việc giả mạo chuỗi cung ứng (supply chain tampering)? (Chọn HAI đáp án.)

**Đáp án đúng:** **D, E**

Gia cố Dockerfile chuẩn CKS: multi-stage build, dùng base image tối giản (distroless/alpine) gắn digest SHA-256 cố định, chạy non-root USER và không nhúng secrets vào image.

- **A:** Sai. Cài thêm các công cụ mạng và leo thang đặc quyền làm tăng mạnh bề mặt tấn công.
- **B:** Sai. Tag :latest không bất biến, dễ gây build không nhất quán và khó kiểm soát lỗ hổng.
- **C:** Sai. Mọi câu lệnh ENV trong Dockerfile đều lưu công khai trong image history/layer metadata.
- **D (Đúng):** Chính xác! Chạy tiến trình với user không có quyền root giảm thiểu rủi ro khi kẻ tấn công thoát khỏi ứng dụng.
- **E (Đúng):** Chính xác! Multi-stage build loại bỏ compiler/build tools khỏi image cuối cùng, distroless bỏ shell/package manager, và pin theo digest (@sha256:...) chống thay thế tag.

</details>

### Câu 3 `medium`

You have configured the ImagePolicyWebhook admission controller on kube-apiserver to validate container images against an external scanning webhook. During a planned outage of the external webhook server, Pods using unverified images are unexpectedly allowed to start. What caused this behavior?

- **A.** The ImagePolicyWebhook configuration file has 'defaultAllow: true' instead of 'defaultAllow: false'.
- **B.** The ImagePolicyWebhook kubeconfig uses HTTPS instead of plain HTTP.
- **C.** The NodeRestriction admission plugin overrides ImagePolicyWebhook decisions when defaultAllow is enabled.
- **D.** The allowTTL value in ImagePolicyWebhook is set to 50 seconds instead of 0.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn đã cấu hình admission controller ImagePolicyWebhook trên kube-apiserver để xác thực các container image với một scanning webhook bên ngoài. Trong thời gian máy chủ webhook bên ngoài ngừng hoạt động theo kế hoạch, các Pod sử dụng image chưa được xác minh bất ngờ được phép khởi chạy. Nguyên nhân nào gây ra hành vi này?

**Đáp án đúng:** **A**

Trong cấu hình AdmissionConfiguration của ImagePolicyWebhook, luôn thiết lập "defaultAllow": false để đảm bảo cơ chế fail-closed khi webhook backend không khả dụng.

- **A (Đúng):** Chính xác! Khi defaultAllow là true (fail-open), nếu webhook backend gặp sự cố hoặc timeout, kube-apiserver sẽ mặc định CHO PHÉP tạo Pod. Chuẩn bảo mật CKS bắt buộc đặt defaultAllow: false (fail-closed).
- **B:** Sai. ImagePolicyWebhook bắt buộc dùng HTTPS để giao tiếp an toàn với webhook server.
- **C:** Sai. NodeRestriction và ImagePolicyWebhook hoạt động độc lập trong chuỗi Validating Admission.
- **D:** Sai. allowTTL chỉ quy định thời gian cache kết quả đã được webhook chấp thuận trước đó, không làm cho image chưa từng kiểm tra được phép chạy khi webhook sập.

</details>

### Câu 4 `medium`

You are reviewing a Dockerfile for a Go microservice that currently uses 'FROM golang:latest', compiles the binary, and runs it as the default root user. Which TWO modifications best minimize the image footprint and harden the container? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Use a multi-stage build compiling the Go binary and copying only the binary into gcr.io/distroless/static-debian12:nonroot.
- **B.** Run 'chmod 777 /app' in the final stage so any non-root user can overwrite the compiled binary.
- **C.** Pin the base image to a specific version or digest and explicitly configure a non-root USER instruction.
- **D.** Install curl, netcat, and vim in the final stage to simplify production container debugging.
- **E.** Pass the database password via an ENV instruction in the Dockerfile so the app does not need Kubernetes Secrets.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn đang rà soát một Dockerfile cho microservice Go hiện đang dùng 'FROM golang:latest', biên dịch binary và chạy nó với quyền root mặc định. HAI chỉnh sửa nào giúp thu gọn tối đa kích thước image và tăng cường bảo mật cho container? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, C**

Gia cố Dockerfile tập trung vào: Multi-stage build, base image tối giản (distroless/scratch), ghim phiên bản/digest cố định, chạy USER non-root và tuyệt đối không nhúng secrets.

- **A (Đúng):** Chính xác! Multi-stage build kết hợp distroless loại bỏ hoàn toàn trình biên dịch Go, shell và các gói OS dư thừa khỏi ảnh cuối cùng, giảm tối đa bề mặt tấn công và số lượng CVE.
- **B:** Sai. Cấp quyền 777 cho phép ghi đè tệp thực thi, phá vỡ tính bất biến (immutability) của container.
- **C (Đúng):** Chính xác! Ghim phiên bản cố định/digest và chạy bằng USER non-root tuân thủ chặt chẽ chuẩn Dockerfile hardening trong CKS.
- **D:** Sai. Cài thêm công cụ mạng/shell vào ảnh production làm tăng mạnh rủi ro khi kẻ tấn công xâm nhập được vào container.
- **E:** Sai nghiêm trọng! ENV trong Dockerfile bị lưu công khai trong lịch sử layer của image (docker history / inspect).

</details>

---

[Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md)
