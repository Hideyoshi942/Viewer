# Thành thạo JSONPath, Custom Columns & Bí kíp `kubectl` Tốc độ Cao

Trong phòng thi CKA (120 phút, ~17 câu thực hành), nhiều câu hỏi yêu cầu xuất chính xác một trường dữ liệu (ví dụ danh sách `InternalIP` của tất cả Node, tên Pod đang chạy sắp xếp theo thời gian hoặc CPU, hoặc giải mã Secret) ra một file văn bản.

---

## 1. JSONPath (`-o jsonpath='...'`) — Các Mẫu hay thi Nhất

### 1.1. Cú pháp cơ bản
- `{.metadata.name}`: Lấy 1 trường của đối tượng đơn.
- `{.items[*].metadata.name}`: Lấy danh sách trường từ mảng `items`.
- `{range .items[*]}{.metadata.name}{"\t"}{.status.podIP}{"\n"}{end}`: Vòng lặp `range` in từng dòng có tab và xuống dòng.
- Bộ lọc điều kiện: `[?(@.type=="InternalIP")]`.

### 1.2. Tổng hợp lệnh JSONPath thực chiến CKA
```bash
# 1. Lấy danh sách InternalIP của tất cả các Node, cách nhau bởi dấu cách
kubectl get nodes -o jsonpath='{.items[*].status.addresses[?(@.type=="InternalIP")].address}'

# 2. In tên Node kèm OS Image và Kernel Version trên từng dòng
kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.nodeInfo.osImage}{"\t"}{.status.nodeInfo.kernelVersion}{"\n"}{end}'

# 3. Lấy tên tất cả Pod đang ở trạng thái Running trong namespace prod
kubectl get pods -n prod -o jsonpath='{.items[?(@.status.phase=="Running")].metadata.name}'

# 4. Giải mã nhanh một key trong Secret
kubectl get secret db-secret -n prod -o jsonpath='{.data.password}' | base64 -d

# 5. Lấy danh sách image của tất cả container trong namespace default
kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{range .spec.containers[*]}{.image}{" "}{end}{"\n"}{end}'
```

---

## 2. Custom Columns & Sắp xếp (`--sort-by`)

Khi bạn cần xuất kết quả dạng bảng gọn đẹp (ví dụ lưu vào `/opt/output.txt`), `-o custom-columns` thường dễ viết và ít lỗi cú pháp hơn JSONPath.

```bash
# In tên PV và dung lượng lưu trữ, sắp xếp theo dung lượng tăng dần
kubectl get pv --sort-by=.spec.capacity.storage -o custom-columns=NAME:.metadata.name,CAPACITY:.spec.capacity.storage

# In tên Pod, Node đang chạy và IP của Pod
kubectl get pods -A -o custom-columns=NAMESPACE:.metadata.namespace,POD:.metadata.name,NODE:.spec.nodeName,IP:.status.podIP

# Sắp xếp Event theo thời gian mới nhất ở dưới cùng
kubectl get events -A --sort-by='.metadata.creationTimestamp'

# Tìm Pod tiêu thụ CPU / Memory cao nhất (cần Metrics Server)
kubectl top pods -A --sort-by=cpu --no-headers | head -n 5
kubectl top nodes --sort-by=memory
```

---

## 3. Bí kíp `kubectl` Tiết kiệm Thời gian trong Phòng thi

### 3.1. Bộ biến môi trường & Alias chuẩn khi vừa mở terminal
```bash
export do="--dry-run=client -o yaml"
export now="--force --grace-period=0"
alias k=kubectl
complete -o default -F __start_kubectl k
```

### 3.2. Tra cứu cấu trúc YAML không cần nhớ thuộc tính (`kubectl explain`)
```bash
# Xem nhanh cấu trúc một trường bất kỳ (hoạt động offline không cần internet)
kubectl explain pod.spec.tolerations
kubectl explain networkpolicy.spec.ingress --recursive | head -n 40
kubectl explain httproute.spec.rules
```

### 3.3. Thay thế Pod khi chỉnh sửa trường bất biến (`kubectl replace --force`)
Nhiều trường trên Pod (như `spec.nodeName`, `spec.containers[*].ports`, `spec.volumes`) **không thể** sửa trực tiếp bằng `kubectl edit pod`. Quy trình chuẩn:
```bash
kubectl get pod web -o yaml > web.yaml
vim web.yaml
kubectl replace --force -f web.yaml
```

### 3.4. Chuyển Context nhanh & Kiểm tra đúng Cluster trước mỗi câu hỏi
> **Quy tắc sống còn**: Mỗi câu hỏi CKA luôn chỉ định một context riêng (ví dụ `kubectl config use-context k8s-c1-H`). Hãy luôn copy và chạy lệnh `use-context` ngay đầu mỗi câu hỏi, sau đó kiểm tra lại bằng `kubectl config current-context`.

---

[← Bài trước](13-troubleshooting-deep-dive.md) | [Mục lục CKA](../00-tong-quan-va-lo-trinh-cka.md) | [Bài tập chủ đề](../bai-tap-tinh-huong/14-troubleshooting-apps-network-cli.md)
