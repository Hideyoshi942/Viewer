# Module 3: Files API & Multimodal Processing (Vision & PDF)

Claude không chỉ xử lý văn bản thuần túy mà còn có năng lực **Multimodal (Đa phương thức)** mạnh mẽ với **Hình ảnh (Vision)** và **Tài liệu PDF native**. Đồng thời, **Files API** giúp tối ưu băng thông và kiến trúc khi cần tái sử dụng cùng một tệp lớn qua nhiều lượt gọi API.

## 1. Vision — Xử lý Hình ảnh trong Messages API

Claude hỗ trợ phân tích hình ảnh ở định dạng **JPEG, PNG, GIF và WebP**. Bạn có thể truyền ảnh vào mảng `content` của một `user` message theo 3 cách:
1. **Base64-encoded**: Truyền trực tiếp chuỗi base64 trong `source.type = "base64"`.
2. **URL công khai**: Truyền `source.type = "url"` nếu ảnh có thể truy cập qua HTTPS.
3. **Files API (`file_id`)**: Upload một lần và tham chiếu bằng `file_id`.

```python
import base64
import anthropic

client = anthropic.Anthropic()

with open("architecture-diagram.png", "rb") as f:
    image_b64 = base64.standard_b64encode(f.read()).decode("utf-8")

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": image_b64,
                    },
                },
                {
                    "type": "text",
                    "text": "Identify any single points of failure in this architecture diagram."
                }
            ],
        }
    ],
)
```

### Lưu ý kỹ thuật với Vision
- Nếu gửi ảnh quá lớn (độ phân giải vượt ngưỡng khuyến nghị), API sẽ tự động thu nhỏ (resize) trước khi xử lý, làm tăng nhẹ độ trễ mà không tăng chất lượng nhận diện. Nên resize ảnh phía client xuống cạnh dài tối đa khoảng `1568px` trước khi gửi.
- Đặt block `image` **trước** block `text` (câu hỏi) thường cho kết quả phân tích trực quan chính xác hơn.

## 2. Xử lý PDF Native (`document` block)

Thay vì phải tự viết pipeline OCR phức tạp (như `pdf2image` + Tesseract + parser bảng biểu), Messages API hỗ trợ đọc **PDF native** thông qua block `type: "document"` với `media_type: "application/pdf"`.

Điểm vượt trội của PDF native là Claude **vừa đọc được lớp text vừa "nhìn" được hình ảnh của từng trang PDF**, nhờ đó hiểu chính xác:
- Biểu đồ (charts), đồ thị (graphs), sơ đồ kỹ thuật.
- Bảng tài chính nhiều cột, hóa đơn scan hoặc chữ ký.
- Bố cục trang phức tạp (multi-column layouts).

```python
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=2048,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "document",
                    "source": {
                        "type": "base64",
                        "media_type": "application/pdf",
                        "data": pdf_base64,
                    },
                },
                {
                    "type": "text",
                    "text": "Extract the Q3 revenue chart values and summarize key risks."
                }
            ],
        }
    ],
)
```

> **Exam Tip**: Khi đề bài hỏi cách trích xuất thông tin từ file PDF chứa **cả văn bản lẫn biểu đồ/bảng biểu scan**, đáp án chuẩn là **gửi trực tiếp PDF dưới dạng `document` content block (`application/pdf`) cho Claude** thay vì chỉ trích xuất text thuần bằng thư viện như PyPDF2 (vì sẽ mất toàn bộ dữ liệu trong biểu đồ/ảnh).

## 3. Tối ưu với Files API

Nếu một tài liệu PDF hoặc hình ảnh dung lượng lớn được dùng lặp lại trong nhiều lượt hỏi đáp hoặc bởi nhiều request khác nhau, việc gửi lại chuỗi base64 mỗi lần sẽ gây lãng phí băng thông mạng và tăng độ trễ.

**Files API** giải quyết vấn đề này theo quy trình 2 bước:
1. Upload file một lần qua `client.beta.files.upload(...)` để nhận về `file_id`.
2. Tham chiếu `file_id` trong `source: {"type": "file", "file_id": "..."}` ở các lần gọi `messages.create`.

| Phương thức truyền file | Khi nào nên dùng? | Ưu điểm |
| :--- | :--- | :--- |
| **Base64 inline** | File nhỏ, dùng 1 lần duy nhất | Đơn giản, không cần quản lý lifecycle file |
| **URL** | Ảnh công khai trên CDN/S3 public | Không tốn băng thông upload từ app server |
| **Files API (`file_id`)** | File PDF/ảnh lớn tái sử dụng nhiều lần | Tiết kiệm băng thông upload, kết hợp tốt với Prompt Caching |

---

[← Bài trước](03-streaming-sse-message-batches.md) | [Mục lục CCDV-F](../00-tong-quan-va-lo-trinh-ccdv-f.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/03-files-multimodal.md) | [Bài tiếp →](05-error-handling-rate-limits-retries.md)
