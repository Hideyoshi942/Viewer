# Tuần 3 – Security

## Mục tiêu

Bảo vệ API và dữ liệu mà không hard-code credential hoặc secret.

## IAM và STS

- Identity-based policy và resource-based policy.
- Explicit deny luôn thắng allow.
- Principal, action, resource và condition.
- Least privilege.
- IAM role và temporary credentials.
- STS `AssumeRole` và cross-account access.
- Permission boundary và SCP ở mức phân biệt trách nhiệm.

## Authentication và authorization

- Cognito User Pool: đăng ký, đăng nhập và token người dùng.
- Cognito Identity Pool: đổi danh tính thành temporary AWS credentials.
- JWT, bearer token, claims và authorizer.
- Application-level authorization.

## Encryption và secrets

- Encryption at rest/in transit.
- Server-side/client-side encryption.
- KMS key policy và IAM policy.
- AWS managed key và customer managed key.
- Envelope encryption, encryption context và rotation.
- Secrets Manager cho secret cần quản lý/rotation.
- Parameter Store cho configuration và secret đơn giản.
- AppConfig cho phân phối/kiểm soát thay đổi cấu hình.

## Lab chính

- Bảo vệ API bằng Cognito User Pool.
- Phân quyền user/admin bằng claims.
- Lambda đọc database/API secret từ Secrets Manager.
- Mã hóa dữ liệu bằng KMS.
- Tạo role chỉ được đọc đúng một table và một secret.
- Thử AssumeRole sang role lab thứ hai.

## Negative tests

- Dùng token hết hạn.
- Dùng token hợp lệ nhưng thiếu scope/claim.
- Thêm explicit deny vào policy.
- Bỏ `kms:Decrypt` khỏi role.
- Dùng KMS key policy không cho phép principal.
- Log nhầm secret rồi sửa bằng masking/sanitization.

## Câu hỏi tự kiểm tra

1. User Pool và Identity Pool giải quyết hai vấn đề khác nhau nào?
2. Vì sao IAM allow vẫn có thể bị từ chối?
3. Khi nào chọn Secrets Manager thay vì Parameter Store?
4. KMS key policy có vai trò gì ngoài IAM policy?
5. Cross-account access cần trust policy và permissions policy ra sao?

## Điều kiện hoàn thành

- Không có static credential/secret trong code hoặc Git.
- Authentication và authorization được kiểm tra riêng.
- Giải thích được AccessDenied bằng policy evaluation.
- Đạt ≥75% bộ câu hỏi Security.

---

[← Mục lục DVA-C03](../00-tong-quan-va-lo-trinh-dva-c03.md)
