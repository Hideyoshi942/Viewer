# Bài tập tình huống — 3. Bảo mật Ingress TLS, Metadata API & Xác minh Binary

> Cấu hình Ingress với TLS Secret, chặn truy cập Cloud Metadata API (169.254.169.254) bằng NetworkPolicy và kiểm tra SHA-256/SHA-512 checksum của binary Kubernetes.
> **Số câu hỏi:** 5 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

A cluster administrator configures an Ingress resource for 'api.example.com' with TLS termination. Which Kubernetes Secret type and keys are required for the Ingress controller to serve HTTPS traffic?

- **A.** Type Opaque containing cert.pem and privkey.pem data fields.
- **B.** Type kubernetes.io/tls containing tls.crt and tls.key data fields.
- **C.** Type kubernetes.io/service-account-token containing ca.crt and token fields.
- **D.** Type kubernetes.io/dockerconfigjson containing .dockerconfigjson.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Quản trị viên cluster cấu hình một tài nguyên Ingress cho 'api.example.com' với TLS termination. Loại Kubernetes Secret nào và các key nào là bắt buộc để Ingress controller phục vụ lưu lượng HTTPS?

**Đáp án đúng:** **B**

Để cấu hình HTTPS cho Ingress, ta tạo Secret dạng TLS (kubectl create secret tls my-tls --cert=tls.crt --key=tls.key) với type kubernetes.io/tls và tham chiếu qua spec.tls[].secretName.

- **A:** Sai. Ingress spec.tls[].secretName chuẩn yêu cầu Secret type kubernetes.io/tls và tên khóa tls.crt, tls.key.
- **B (Đúng):** Chính xác! Ingress TLS yêu cầu Secret thuộc loại kubernetes.io/tls với hai khóa bắt buộc là tls.crt (chứng chỉ) và tls.key (khóa riêng tư).
- **C:** Sai. Loại Secret này dùng cho ServiceAccount token, không dùng cho chứng chỉ TLS của Ingress.
- **D:** Sai. Loại Secret này dùng để xác thực khi kéo container image từ private registry.

</details>

### Câu 2 `hard`

To prevent SSRF attacks from compromised Pods against the cloud instance metadata service (169.254.169.254), you create an egress NetworkPolicy. Which configuration allows general internet egress while explicitly blocking 169.254.169.254/32?

- **A.** Use namespaceSelector matching 169.254.169.254/32 in the egress.to field.
- **B.** Define an ingress rule with ipBlock cidr: 169.254.169.254/32 and policyTypes: [Ingress].
- **C.** Define an egress rule with ipBlock cidr: 0.0.0.0/0 and except: [169.254.169.254/32].
- **D.** Set podSelector: {matchLabels: {metadata: deny}} without any egress rules.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Để ngăn chặn các cuộc tấn công SSRF từ các Pod bị xâm nhập nhắm vào cloud instance metadata service (169.254.169.254), bạn tạo một egress NetworkPolicy. Cấu hình nào cho phép egress ra internet chung trong khi chặn tường minh 169.254.169.254/32?

**Đáp án đúng:** **C**

Bảo vệ Cloud Metadata API (169.254.169.254/32) khỏi SSRF là kịch bản phổ biến trong CKS. Ta dùng NetworkPolicy Egress với ipBlock cidr: 0.0.0.0/0 và except: [169.254.169.254/32].

- **A:** Sai. namespaceSelector chỉ dùng để lọc Namespace theo label, không hỗ trợ lọc dải địa chỉ IP CIDR.
- **B:** Sai. Truy cập tới metadata service là kết nối chiều ra từ Pod (Egress), không phải Ingress, và rule này cũng mang nghĩa cho phép thay vì chặn.
- **C (Đúng):** Chính xác! Sử dụng ipBlock với cidr: 0.0.0.0/0 kết hợp except: [169.254.169.254/32] trong egress rule sẽ cho phép kết nối ra ngoài nhưng loại trừ hoàn toàn IP Cloud Metadata.
- **D:** Sai. Cấu hình này không nhắm tới địa chỉ IP 169.254.169.254 và cũng không cho phép các lưu lượng internet hợp lệ khác.

</details>

### Câu 3 `medium`

Before installing a downloaded kubeadm binary on a new node, you want to verify its integrity against the official SHA-512 checksum file 'kubeadm.sha512'. Which command performs this verification on Linux?

- **A.** cosign verify-blob --signature kubeadm.sha512 kubeadm --insecure-ignore-tlog
- **B.** openssl x509 -in kubeadm.sha512 -text -noout -verify
- **C.** md5sum --verify kubeadm.sha512 kubeadm --ignore-missing
- **D.** echo "$(cat kubeadm.sha512)  kubeadm" | sha512sum --check

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trước khi cài đặt một binary kubeadm đã tải về trên một node mới, bạn muốn xác minh tính toàn vẹn của nó với tệp checksum SHA-512 chính thức 'kubeadm.sha512'. Lệnh nào thực hiện việc xác minh này trên Linux?

**Đáp án đúng:** **D**

Xác minh tính toàn vẹn nhị phân (Binary Verification) trước khi cài đặt là yêu cầu thuộc Domain 1 CKS. Sử dụng sha256sum hoặc sha512sum -c để kiểm tra khớp checksum.

- **A:** Sai. File .sha512 chứa checksum dạng hex, không phải chữ ký mật mã của Cosign.
- **B:** Sai. Lệnh openssl x509 dùng để đọc chứng chỉ X.509, không dùng để kiểm tra SHA-512 checksum.
- **C:** Sai. md5sum dùng thuật toán MD5 (không tương thích SHA-512) và không có cờ --verify như vậy.
- **D (Đúng):** Chính xác! Lệnh sha512sum --check đối chiếu mã băm SHA-512 trong file kubeadm.sha512 với file nhị phân kubeadm (cách nhau hai dấu cách) và trả về 'kubeadm: OK' nếu toàn vẹn.

</details>

### Câu 4 `medium`

Before installing a new kubelet binary on a production node, your security policy requires verifying its integrity against the official release hash. Which command correctly verifies the SHA-512 checksum of /tmp/kubelet against a known hash?

- **A.** chmod 600 /tmp/kubelet && ls -la --checksum --sha512 /tmp/kubelet
- **B.** kubectl verify binary /tmp/kubelet --checksum-sha512
- **C.** openssl x509 -in /tmp/kubelet -text -noout -sha512
- **D.** echo "<official-sha512-hash>  /tmp/kubelet" | sha512sum --check

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Trước khi cài đặt một binary kubelet mới trên production node, chính sách bảo mật yêu cầu xác minh tính toàn vẹn của nó với mã hash phát hành chính thức. Lệnh nào xác minh chính xác checksum SHA-512 của /tmp/kubelet với một mã hash đã biết?

**Đáp án đúng:** **D**

Xác minh checksum SHA-512/SHA-256 bằng công cụ sha512sum hoặc sha256sum là bước bắt buộc trong Domain 1 để phát hiện tệp nhị phân bị giả mạo trước khi cài đặt lên cụm.

- **A:** Sai. Lệnh chmod chỉ thay đổi quyền truy cập file trên hệ thống tệp, không kiểm tra tính toàn vẹn nội dung nhị phân.
- **B:** Sai. kubectl không có subcommand 'verify binary'.
- **C:** Sai. Lệnh openssl x509 dùng để đọc chứng chỉ TLS X.509, không dùng để kiểm tra mã băm của file nhị phân ELF.
- **D (Đúng):** Chính xác! Lệnh sha512sum --check đối chiếu trực tiếp mã băm SHA-512 chính thức với file /tmp/kubelet và trả về 'OK' nếu toàn vẹn.

</details>

### Câu 5 `medium`

You need to secure a public-facing web application exposed via an NGINX Ingress Controller and protect worker nodes hosted on AWS from SSRF attacks targeting the EC2 Instance Metadata Service. Which TWO actions should you take? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Expose the backend Service directly as type NodePort on port 80 without TLS termination.
- **B.** Set hostNetwork: true on the web application Pods so they bypass the cluster CNI plugin.
- **C.** Apply an Egress NetworkPolicy using ipBlock with cidr: 0.0.0.0/0 and except: [169.254.169.254/32] to block Pods from reaching the cloud metadata endpoint.
- **D.** Store the TLS private key inside a ConfigMap mounted to the NGINX Ingress Controller Pod.
- **E.** Create a kubernetes.io/tls Secret containing the server certificate and private key, and reference it in the Ingress spec.tls section.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn cần bảo mật một ứng dụng web công khai được expose qua NGINX Ingress Controller và bảo vệ các worker node đặt trên AWS khỏi các cuộc tấn công SSRF nhắm vào EC2 Instance Metadata Service. Bạn nên thực hiện HAI hành động nào? (Chọn HAI đáp án.)

**Đáp án đúng:** **C, E**

Bảo mật điểm vào Ingress cần TLS Secret (spec.tls), đồng thời trên môi trường Cloud cần dùng Egress NetworkPolicy chặn dải 169.254.169.254/32 để ngăn rò rỉ thông tin xác thực qua Metadata API.

- **A:** Sai. Mở NodePort không mã hóa TLS làm lộ dữ liệu truyền tải và mở rộng bề mặt tấn công trên mọi Node.
- **B:** Sai. Bật hostNetwork: true khiến Pod dùng chung mạng với Host, phá vỡ cô lập NetworkPolicy và làm tăng rủi ro truy cập Metadata API.
- **C (Đúng):** Chính xác! Sử dụng ipBlock với ngoại lệ (except) 169.254.169.254/32 ngăn chặn hiệu quả Pod bị khai thác SSRF truy cập vào dịch vụ Metadata của cloud để đánh cắp IAM role credentials.
- **D:** Sai. Khóa riêng tư (private key) phải được lưu trong Secret loại kubernetes.io/tls, tuyệt đối không lưu trong ConfigMap.
- **E (Đúng):** Chính xác! Khai báo Secret loại kubernetes.io/tls trong spec.tls giúp mã hóa toàn bộ lưu lượng HTTPS giữa client và Ingress Controller.

</details>

---

[Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md)
