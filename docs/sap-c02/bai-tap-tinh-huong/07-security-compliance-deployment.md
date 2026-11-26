# Bài tập tình huống — Chủ đề 7: Enterprise Security & Multi-Region Encryption — KMS Multi-Region Keys, CloudHSM, Macie & GuardDuty

> KMS Multi-Region Keys, Cross-Account KMS Key Policies, AWS CloudHSM, Secrets Manager Multi-Region Replication và bảo vệ dữ liệu nhạy cảm.
> **Số câu hỏi:** 1 câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.

---

### Câu 1 `hard`

A payment processor must decrypt sensitive credit card PANs and execute fraud-scoring logic on Amazon EC2. Compliance strictly forbids even root/SSH administrators on the host EC2 operating system from inspecting the decrypted plaintext data in memory or calling AWS KMS to decrypt the ciphertext outside of an authorized, cryptographically verified binary image. Which TWO security mechanisms should the Solutions Architect combine to satisfy this requirement? (Choose TWO.)

*(Chọn 2 đáp án)*

- **A.** Enable AWS Nitro Enclaves on EC2 to run decryption and scoring inside an isolated enclave with no storage, shell, or external network (vsock only).
- **B.** Encrypt the EC2 EBS root volume and swap space with an AWS KMS CMK, which prevents root OS administrators from inspecting decrypted cardholder data in memory.
- **C.** Configure the KMS Key Policy with attestation conditions (kms:RecipientAttestation:ImageSha384 / PCR0) so KMS only decrypts for the verified enclave image.
- **D.** Place the EC2 instances in an isolated private subnet with no Internet Gateway, disable SSH, and attach an AWS WAF Web ACL in front of the host.
- **E.** Use AWS CloudHSM exclusively to store the keys and execute the Python fraud-scoring application directly inside the FIPS 140-2 Level 3 HSM hardware.

<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>

> **Ý nghĩa câu hỏi:** Một đơn vị xử lý thanh toán phải giải mã số thẻ tín dụng PAN nhạy cảm và thực thi logic chấm điểm gian lận trên Amazon EC2. Quy định tuân thủ nghiêm cấm ngay cả quản trị viên root/SSH trên hệ điều hành EC2 máy chủ xem dữ liệu văn bản thuần đã giải mã trong bộ nhớ hoặc gọi AWS KMS để giải mã bản mã bên ngoài một image nhị phân được ủy quyền và xác minh bằng mật mã. Solutions Architect nên kết hợp HAI cơ chế bảo mật nào để đáp ứng yêu cầu này? (Chọn HAI đáp án.)

**Đáp án đúng:** **A, C**

Cho bài toán **Confidential Computing** (ngăn cả root/admin của chính EC2 host xem dữ liệu plaintext trong bộ nhớ), bộ đôi duy nhất là **AWS Nitro Enclaves** + **KMS Key Policy với điều kiện `kms:RecipientAttestation:ImageSha384` (PCR0)**.

- **A (Đúng):** Chính xác. AWS Nitro Enclaves tạo ra một môi trường thực thi hoàn toàn tách biệt về CPU và bộ nhớ ngay trên EC2 instance, không có SSH/shell, không có ổ đĩa và chỉ giao tiếp qua kênh cục bộ vsock — ngăn chặn tuyệt đối cả root/admin trên máy chủ host đọc trộm dữ liệu giải mã trong RAM.
- **B:** Mã hóa EBS chỉ bảo vệ dữ liệu lúc nghỉ (at rest) trên ổ đĩa; một khi hệ điều hành đang chạy, root user vẫn có thể dump toàn bộ bộ nhớ RAM của tiến trình nếu không dùng Nitro Enclaves.
- **C (Đúng):** Chính xác. Tích hợp giữa AWS KMS và Nitro Enclaves cho phép đặt điều kiện chứng thực mật mã (kms:RecipientAttestation:ImageSha384 / PCR0) ngay trong KMS Key Policy; chỉ khi enclave gửi kèm tài liệu chứng thực (attestation document) khớp đúng mã hash của binary hợp lệ thì KMS mới giải mã và mã hóa kết quả riêng cho enclave đó.
- **D:** Private subnet và WAF chỉ bảo vệ lớp mạng bên ngoài, không thể ngăn quản trị viên có quyền root/SSH trên chính host EC2 đọc bộ nhớ hoặc gọi API KMS.
- **E:** AWS CloudHSM chỉ dùng để lưu khóa và thực hiện các phép toán mật mã (PKCS#11/JCE), không thể chạy ứng dụng kinh doanh tùy chỉnh như chấm điểm gian lận (fraud-scoring).

</details>

---

[Mục lục SAP-C02](../00-tong-quan-va-lo-trinh-sap-c02.md)
