# Bài tập tình huống — 11. Quét Lỗ hổng (Trivy), SBOM, Cosign & Image Digest

> Quét CVE trong CI/CD bằng Trivy (--severity, --exit-code), xuất SBOM chuẩn SPDX/CycloneDX, ký và xác minh container image với Cosign và ghim phiên bản bằng SHA-256 digest.
> **Số câu hỏi:** 6 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `medium`

You want to scan a container image 'myapp:v2.1' using Trivy to report only CRITICAL vulnerabilities that have an available fix, and fail the CI pipeline (exit code 1) if any are found. Which command should you run?

- **A.** trivy image --severity CRITICAL --ignore-unfixed --exit-code 1 myapp:v2.1
- **B.** trivy k8s --severity HIGH --format spdx --exit-code 1 myapp:v2.1
- **C.** trivy sbom --severity CRITICAL --exit-code 0 myapp:v2.1
- **D.** trivy image --severity LOW --skip-db-update --no-progress --exit-code 1 myapp:v2.1

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn muốn quét container image 'myapp:v2.1' bằng Trivy để chỉ báo cáo các lỗ hổng CRITICAL đã có bản vá (fix), và đánh trượt CI pipeline (exit code 1) nếu phát hiện bất kỳ lỗ hổng nào. Bạn nên chạy lệnh nào?

**Đáp án đúng:** **A**

Trivy là công cụ quét CVE chuẩn trong kỳ thi CKS. Nắm vững các cờ --severity, --ignore-unfixed, --exit-code và -f json/table giúp xử lý nhanh các bài toán bảo mật image.

- **A (Đúng):** Chính xác! --severity CRITICAL lọc mức độ nghiêm trọng, --ignore-unfixed bỏ qua lỗi chưa có bản vá và --exit-code 1 trả về mã lỗi khác 0 để dừng pipeline.
- **B:** Sai. trivy k8s dùng để quét cụm Kubernetes, không phải quét một image đơn lẻ với ngưỡng CRITICAL và exit-code.
- **C:** Sai. --exit-code 0 luôn báo thành công ngay cả khi phát hiện lỗ hổng.
- **D:** Sai. Lệnh này chỉ lọc mức LOW và không đặt --exit-code 1.

</details>

### Câu 2 `medium`

Which command verifies the cryptographic signature of container image 'registry.internal/payments:1.4.0' using a Cosign public key file named 'cosign.pub'?

- **A.** bom verify --key cosign.pub registry.internal/payments:1.4.0
- **B.** cosign sign --key cosign.pub registry.internal/payments:1.4.0
- **C.** cosign verify --key cosign.pub registry.internal/payments:1.4.0
- **D.** docker trust inspect --key cosign.pub registry.internal/payments:1.4.0

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Lệnh nào xác minh chữ ký mật mã của container image 'registry.internal/payments:1.4.0' bằng tệp public key Cosign tên 'cosign.pub'?

**Đáp án đúng:** **C**

Cosign (thuộc dự án Sigstore) cho phép ký và xác minh tính xác thực của container image. Lệnh chuẩn để kiểm tra chữ ký với public key là cosign verify --key cosign.pub <image>.

- **A:** Sai. Công cụ bom dùng để tạo và đọc Software Bill of Materials (SBOM), không xác minh chữ ký Cosign.
- **B:** Sai. cosign sign dùng để ký image bằng private key (cosign.key), không phải để xác minh bằng public key.
- **C (Đúng):** Chính xác! cosign verify --key <public-key> <image> kiểm tra chữ ký số gắn với image trên registry bằng khóa công khai.
- **D:** Sai. Docker Content Trust sử dụng Notary v1, không tương thích trực tiếp với khóa Cosign theo cú pháp này.

</details>

### Câu 3 `medium`

You need to generate an SPDX JSON Software Bill of Materials (SBOM) for the image 'registry.k8s.io/kube-scheduler:v1.30.0' using the Kubernetes 'bom' CLI tool. Which command produces this output?

- **A.** bom scan --image registry.k8s.io/kube-scheduler:v1.30.0 --cve-only --output sbom.json
- **B.** kube-bench --sbom --image registry.k8s.io/kube-scheduler:v1.30.0 --format json
- **C.** kubectl create sbom --image registry.k8s.io/kube-scheduler:v1.30.0 --format spdx-json --output sbom.json
- **D.** bom generate --image registry.k8s.io/kube-scheduler:v1.30.0 --format json --output sbom.json

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Bạn cần tạo một Software Bill of Materials (SBOM) định dạng SPDX JSON cho image 'registry.k8s.io/kube-scheduler:v1.30.0' bằng công cụ CLI 'bom' của Kubernetes. Lệnh nào tạo ra đầu ra này?

**Đáp án đúng:** **D**

SBOM (Software Bill of Materials) giúp liệt kê toàn bộ thành phần phần mềm và thư viện bên trong image. Trong CKS, có thể tạo SBOM bằng bom generate hoặc trivy image --format spdx-json.

- **A:** Sai. bom là công cụ sinh SBOM, không có subcommand scan --cve-only.
- **B:** Sai. kube-bench kiểm tra tuân thủ CIS Benchmark, không tạo SBOM.
- **C:** Sai. kubectl không có subcommand create sbom.
- **D (Đúng):** Chính xác! Công cụ bom (Kubernetes SIG Release) dùng bom generate --image <image> --format json --output <file> để sinh SBOM định dạng SPDX JSON.

</details>

### Câu 4 `easy`

A CI/CD pipeline must fail the build automatically if a newly built container image contains any CRITICAL vulnerability that already has a vendor fix available. Which Trivy command meets this requirement?

- **A.** trivy sbom --exit-code 1 myapp:1.0
- **B.** trivy image --severity CRITICAL --ignore-unfixed --exit-code 1 myapp:1.0
- **C.** trivy config --severity CRITICAL myapp:1.0
- **D.** trivy image --severity LOW,MEDIUM --exit-code 0 --ignore-unfixed myapp:1.0

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một pipeline CI/CD phải tự động đánh trượt bản build nếu một container image mới tạo chứa bất kỳ lỗ hổng CRITICAL nào đã có bản vá từ nhà cung cấp. Lệnh Trivy nào đáp ứng yêu cầu này?

**Đáp án đúng:** **B**

Kết hợp --severity CRITICAL, --ignore-unfixed và --exit-code 1 là mẫu lệnh Trivy chuẩn để chặn các image chứa lỗ hổng nghiêm trọng có bản vá ngay trong CI/CD.

- **A:** Sai. 'trivy sbom' dùng để quét một tệp SBOM có sẵn chứ không quét trực tiếp image.
- **B (Đúng):** Chính xác! --severity CRITICAL lọc mức nghiêm trọng nhất, --ignore-unfixed bỏ qua các CVE chưa có bản vá từ nhà cung cấp, và --exit-code 1 trả về mã lỗi để pipeline tự động dừng build.
- **C:** Sai. 'trivy config' dùng để quét cấu hình sai trong file IaC (Dockerfile, YAML, Terraform), không dùng để quét CVE của container image.
- **D:** Sai. Lệnh này chỉ quét LOW/MEDIUM và luôn trả về exit code 0 nên pipeline không bao giờ fail.

</details>

### Câu 5 `medium`

Why is referencing a container image by its immutable SHA-256 digest (e.g., registry.io/app@sha256:9f86d0...) significantly more secure than using a mutable tag such as ':latest' or ':1.2'?

- **A.** Images pulled by SHA-256 digest skip TLS certificate verification with the container registry.
- **B.** Using a SHA-256 digest automatically enables Seccomp RuntimeDefault and AppArmor on the Pod.
- **C.** Digest guarantees exact image content; a compromised registry cannot silently overwrite a digest with malicious layers like a mutable tag.
- **D.** Images referenced by SHA-256 digest cannot contain any OS packages, package managers, or interactive shells inside their image layers.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Tại sao việc tham chiếu một container image bằng SHA-256 digest bất biến (ví dụ: registry.io/app@sha256:9f86d0...) lại an toàn hơn đáng kể so với việc sử dụng một tag có thể thay đổi như ':latest' hoặc ':1.2'?

**Đáp án đúng:** **C**

Ghim container image theo digest (@sha256:...) kết hợp với ký số Cosign là lớp phòng thủ cốt lõi chống tấn công chuỗi cung ứng (tag mutation / image tampering).

- **A:** Sai. Việc xác thực TLS với registry vẫn diễn ra bình thường và cần được giữ nguyên.
- **B:** Sai. Image digest liên quan đến tính toàn vẹn chuỗi cung ứng, không tự động cấu hình Seccomp.
- **C (Đúng):** Chính xác! Image tag (như :latest hay :1.2) có thể bị ghi đè bất cứ lúc nào trên registry. Ngược lại, digest SHA-256 gắn chặt với nội dung nhị phân của image, đảm bảo tính bất biến và chống tấn công tráo đổi image.
- **D:** Sai. Digest chỉ xác nhận tính toàn vẹn của image, không quyết định bên trong image có chứa shell hay không (đó là vai trò của distroless/scratch).

</details>

### Câu 6 `medium`

Your security team needs to generate a standardized Software Bill of Materials (SBOM) in SPDX JSON format for a production image and verify its cryptographic signature created by Cosign before deployment. Which pair of commands accomplishes both tasks?

- **A.** kube-bench --sbom <image> -o sbom.json AND openssl verify -CAfile cosign.pub <image>
- **B.** docker inspect --format spdx <image> AND sha512sum --check cosign.pub <image>
- **C.** kubesec scan <image> --format spdx-json -o sbom.json AND kubectl verify --key cosign.pub <image>
- **D.** trivy image --format spdx-json -o sbom.json <image> AND cosign verify --key cosign.pub <image>

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Nhóm bảo mật của bạn cần tạo một Software Bill of Materials (SBOM) chuẩn hóa ở định dạng SPDX JSON cho một production image và xác minh chữ ký mật mã của nó được tạo bởi Cosign trước khi triển khai. Cặp lệnh nào thực hiện cả hai tác vụ này?

**Đáp án đúng:** **D**

Trong chuỗi cung ứng hiện đại (CKS Domain 5), SBOM (SPDX/CycloneDX tạo bởi Trivy/Syft/bom) giúp kiểm kê thành phần phần mềm, còn Cosign verify xác thực nguồn gốc và tính toàn vẹn của container image.

- **A:** Sai. kube-bench kiểm tra CIS Benchmark cho cụm, không liên quan đến SBOM hay xác minh chữ ký OCI image.
- **B:** Sai. docker inspect không tạo tệp SBOM chuẩn SPDX/CycloneDX và sha512sum không xác minh chữ ký số Cosign.
- **C:** Sai. kubesec chỉ quét YAML manifest của Kubernetes, không tạo SBOM từ image, và kubectl không có lệnh verify.
- **D (Đúng):** Chính xác! Trivy hỗ trợ xuất SBOM chuẩn SPDX JSON (--format spdx-json) hoặc CycloneDX, và Cosign verify --key cosign.pub kiểm chứng chữ ký số của container image bằng khóa công khai.

</details>

---

[Mục lục CKS](../00-tong-quan-va-lo-trinh-cks.md)
