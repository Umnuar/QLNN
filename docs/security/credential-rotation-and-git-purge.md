# CHÍNH SÁCH XOAY THÔNG TIN XÁC THỰC & KỊCH BẢN THANH LỌC LỊCH SỬ GIT
## Dự án: Hệ Thống Quản Lý Dữ Liệu Nông Nghiệp Xã Đăk Hà (QLNN)
**Mã phát hiện**: `SEC-01-B` (CWE-312, CWE-798 | CVSS v3.1: 8.6 - P0)

---

## 1. BỐI CẢNH VÀ NGUYÊN NHÂN
Trong quá trình phát triển ban đầu, các tập tin kiểm thử cũ (`test-login-all.ts` trong commit `6279292` và `LoginView.tsx` trong commit `b271527`) đã ghi nhận danh sách tài khoản thử nghiệm của cán bộ các thôn. Dù các tập tin này đã được gỡ bỏ khỏi working tree, các chuỗi mật khẩu cũ vẫn tồn tại trong lịch sử commit của Git.

---

## 2. CHÍNH SÁCH XOAY MẬT KHẨU CÁN BỘ TRÊN CƠ SỞ DỮ LIỆU THỰC TẾ
Để triệt tiêu hoàn toàn rủi ro bị khai thác từ xa nếu kho lưu trữ bị rò rỉ:

1. **Đặt lại mật khẩu toàn bộ tài khoản**:
   - Quản trị viên hệ thống (Admin cấp Xã) sử dụng giao diện **Cài Đặt Hệ Thống -> Quản Lý Cán Bộ 7 Thôn** (`/settings`) hoặc chạy câu lệnh cập nhật trực tiếp trên CSDL để cấp lại mật khẩu ngẫu nhiên cho từng cán bộ.
   - Mật khẩu mới bắt buộc tuân thủ chuẩn tối thiểu 8 ký tự, kết hợp chữ in hoa, chữ thường, số và ký tự đặc biệt.

2. **Xoay JWT Secret trên Production**:
   - Sinh chuỗi ngẫu nhiên 64 bytes an toàn bằng lệnh:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - Cập nhật biến môi trường `JWT_SECRET` và `JWT_REFRESH_SECRET` trên máy chủ `qlnn.dulieudakha.vn`.
   - Khởi động lại dịch vụ Backend để vô hiệu hóa toàn bộ token cũ.

---

## 3. KỊCH BẢN THANH LỌC LỊCH SỬ GIT (GIT HISTORY PURGE)

> [!WARNING]
> Thao tác viết lại lịch sử Git làm thay đổi toàn bộ Commit SHA. Tuyệt đối không chạy tự động khi chưa có sự thống nhất của nhóm phát triển. Quản trị viên chỉ thực hiện theo các bước sau trước khi công khai (public) mã nguồn.

### Bước 1: Sao lưu toàn bộ Repository
```bash
git clone --mirror https://github.com/organization/QLNN.git QLNN-backup.git
```

### Bước 2: Cài đặt công cụ chuẩn `git-filter-repo`
```bash
pip install git-filter-repo
```

### Bước 3: Tạo danh sách các chuỗi bí mật cần thanh lọc (`replace-expressions.txt`)
Tạo file `replace-expressions.txt` chứa các chuỗi nhạy cảm cần thay thế bằng `***REDACTED***`:
```text
admin123===>***REDACTED***
qlcs_jwt_secret_2025_a8f3b7c9d4e1f2g6h5===>***REDACTED***
qlcs_jwt_refresh_2025_z9y8x7w6v5u4t3s2r1===>***REDACTED***
```

### Bước 4: Thực thi thanh lọc lịch sử commit
```bash
# Xóa bỏ hoàn toàn các file scratch cũ khỏi lịch sử git
git filter-repo --invert-paths --path QLNN-Backend/scripts/test-login-all.ts --force

# Thay thế các chuỗi bí mật còn sót lại trong các commit khác
git filter-repo --replace-text replace-expressions.txt --force
```

### Bước 5: Kiểm tra và đẩy lên máy chủ từ xa
```bash
# Kiểm tra lại commit log
git log -p -S "admin123"

# Đẩy lịch sử sạch lên remote (chỉ sau khi đã xác nhận sao lưu an toàn)
git push origin --force --all
git push origin --force --tags
```
