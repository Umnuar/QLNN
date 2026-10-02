# BÁO CÁO VẬN HÀNH BỀN VỮNG & PHẢN ỨNG SỰ CỐ AN NINH (SECURITY SUSTAINABILITY & INCIDENT RUNBOOK)
## Dự án: Quản Lý Nông Nghiệp & Nông Thôn Mới Xã Đăk Hà (QLNN)
**Cơ quan quản trị**: UBND Xã Đăk Hà, Huyện Đăk Hà, Tỉnh Kon Tum  
**Giai đoạn**: **BƯỚC 9 — DUY TRÌ BỀN VỮNG, QUY TRÌNH VẬN HÀNH & PHẢN ỨNG SỰ CỐ**  
**Nhánh thực hiện**: `sec/hardening` (Từ mốc `pre-security`)  
**Tiêu chuẩn đối chiếu**: OWASP ASVS v4.0.3, NIST SP 800-61 Rev. 2 (Computer Security Incident Handling Guide), SLSA v1.0, Nghị định 13/2023/NĐ-CP (*cần xác minh pháp lý*).

---

## 1. MỤC TIÊU VẬN HÀNH BỀN VỮNG (SUSTAINABILITY OBJECTIVES)

Sau khi hoàn tất quá trình kiểm toán và khắc phục triệt để 18 lỗ hổng an ninh tại các Bước 0 đến Bước 8, việc duy trì trạng thái an ninh mức cao cho hệ thống QLNN cần được thể chế hóa thành các quy trình thường nhật, kịch bản xử lý tự động và lịch trình kiểm toán định kỳ.

---

## 2. KỊCH BẢN PHẢN ỨNG SỰ CỐ AN NINH (INCIDENT RESPONSE RUNBOOK)

Theo hướng dẫn NIST SP 800-61, mọi sự cố an ninh đối với hệ thống QLNN phải tuân theo quy trình 4 pha: **Phát hiện & Phân tích → Ngăn chặn & Cách ly → Khắc phục & Xóa bỏ → Phục hồi & Rút kinh nghiệm**.

```
+---------------------------------------------------------------------------------+
| QUY TRÌNH PHẢN ỨNG SỰ CỐ AN NINH (4 PHA CHUẨN NIST SP 800-61)                   |
+---------------------------------------------------------------------------------+
|  [Pha 1] PHÁT HIỆN & PHÂN TÍCH   : Nhận diện bất thường qua logs / alerts      |
|  [Pha 2] NGĂN CHẶN & CÁCH LY     : Thu hồi token, tăng token_version, chặn IP   |
|  [Pha 3] KHẮC PHỤC & TRIỆT TIÊU  : Xoay secret, vá lỗi mã nguồn, quét mã độc    |
|  [Pha 4] PHỤC HỒI & TỔNG KẾT     : Khôi phục CSDL từ snapshot, ghi nhận bài học |
+---------------------------------------------------------------------------------+
```

### 2.1. Kịch bản 1: Nghi ngờ hoặc Phát hiện Lộ lọt JWT Secret
- **Dấu hiệu**: Secret xuất hiện trên Git commit công khai, log máy chủ bị rò rỉ, hoặc có dấu hiệu tạo token giả mạo.
- **Quy trình xử lý khẩn cấp**:
  1. *Ngăn chặn tức thời*: Sinh cặp khóa bí mật mới có độ dài tối thiểu 64 ký tự:
     ```powershell
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
  2. *Cập nhật cấu hình môi trường*: Cập nhật `JWT_SECRET` và `JWT_REFRESH_SECRET` trên máy chủ Production trong file `.env`.
  3. *Tái khởi động Backend API*: Khởi động lại dịch vụ Node.js/PM2 để áp dụng khóa mới:
     ```bash
     pm2 restart qlnn-backend
     ```
  4. *Thu hồi toàn bộ phiên làm việc cũ*: Thực hiện lệnh tăng `token_version` cho toàn bộ tài khoản trong cơ sở dữ liệu:
     ```sql
     UPDATE users SET token_version = token_version + 1;
     ```
  5. *Kết quả*: Toàn bộ token cũ đã cấp trước đó lập tức bị vô hiệu hóa; cán bộ buộc phải đăng nhập lại với mật khẩu chính chủ.

### 2.2. Kịch bản 2: Phát hiện Tài khoản Cán bộ Bị Xâm nhập / Mất Cắp Thiết bị
- **Dấu hiệu**: Tài khoản có lượt đăng nhập từ IP lạ, thao tác xóa hoặc sửa dữ liệu hàng loạt bất thường trong `audit_logs`.
- **Quy trình xử lý**:
  1. *Khóa tài khoản khẩn cấp*: Đăng nhập tài khoản Quản trị viên (`admin`), vào mục **Cài đặt Hệ thống** → **Quản lý Cán bộ**.
  2. *Đặt lại mật khẩu*: Đặt mật khẩu mới ngẫu nhiên phức tạp (tối thiểu 12 ký tự) cho cán bộ đó.
  3. *Vô hiệu hóa phiên*: Việc cập nhật mật khẩu tự động tăng `token_version` của cán bộ lên 1, cắt đứt ngay lập tức mọi phiên đang duy trì trên thiết bị bị mất.
  4. *Truy vết biến động*: Vào **Nhật ký Hoạt động** (`/audit`), lọc theo tên cán bộ để kiểm tra các hành động đã thực hiện. Nếu có hộ bị xóa nhầm, bấm **Khôi phục** từ Thùng rác (`/recycle-bin`).

### 2.3. Kịch bản 3: Tấn công Từ chối Dịch vụ (DoS) hoặc Brute Force Đăng nhập
- **Dấu hiệu**: Tải CPU máy chủ tăng đột biến, xuất hiện hàng ngàn request gửi đến `/api/auth/login`.
- **Hàng rào bảo vệ tự động kích hoạt**:
  - `express-rate-limit` tự động ngắt kết nối và trả về HTTP `429 Too Many Requests` sau 20 lần thử/15 phút/IP.
  - Bộ giới hạn JSON body `express.json({ limit: "2mb" })` tự động từ chối các request payload dung lượng lớn (HTTP 413).
- **Thao tác thủ công nếu kẻ tấn công đổi dải IP**:
  - Kiểm tra IP nguồn từ Nginx / Reverse Proxy access log.
  - Chặn IP bằng tường lửa hệ thống (UFW / Cloudflare / Windows Firewall):
    ```bash
    sudo ufw insert 1 deny from <IP_TAN_CONG> to any
    ```

### 2.4. Kịch bản 4: Dữ liệu Bị Sai lệch / Mất mát Nghiêm trọng (Thảm họa)
- **Quy trình Phục hồi CSDL từ Bản Sao lưu Khẩn cấp**:
  1. Xác định file snapshot an toàn gần nhất tại thư mục lưu trữ cục bộ hoặc dịch vụ cloud lưu trữ bản backup.
  2. Truy cập tab **Sao lưu CSDL** trong giao diện Quản trị viên.
  3. Chọn tệp bản ghi sao lưu JSON và nhập mật khẩu xác nhận của Admin.
  4. Backend thực thi quá trình kiểm tra mã băm Bcrypt mật khẩu admin và chạy giao dịch ACID `prisma.$transaction` với timeout 30 giây để khôi phục toàn vẹn dữ liệu.

---

## 3. LỊCH TRÌNH BẢO TRÌ & RÀ SOÁT AN NINH ĐỊNH KỲ (MAINTENANCE SCHEDULE)

| Tần suất | Hoạt động cụ thể | Công cụ thực hiện | Người phụ trách |
| :--- | :--- | :--- | :--- |
| **Mỗi lần Build/Commit** | Quét Type-checking, chạy Unit tests (30 Backend, 26 Client) | GitHub Actions CI (`npm ci`) | Tự động hóa |
| **Hàng tuần** | Kiểm tra cập nhật bảo mật dependency (`npm audit`) | `npm audit` / Dependabot | Kỹ sư vận hành |
| **Hàng tháng** | Rà soát `audit_logs`, kiểm tra danh sách tài khoản cán bộ 7 thôn | Màn hình `/audit` & Settings | Quản trị viên UBND Xã |
| **Hàng tháng** | Thử nghiệm phục hồi bản backup CSDL trên môi trường staging | Tab Sao lưu & Phục hồi | Cán bộ CNTT |
| **Mỗi 6 tháng** | Xoay `JWT_SECRET`, đổi mật khẩu các tài khoản quản trị | Server ENV & Script xoay khóa | Ban CNTT Xã |

---

## 4. BẢNG CHECKLIST TRIỂN KHAI PRODUCTION AN TOÀN (HARDENING CHECKLIST)

Trước khi đưa ứng dụng lên máy chủ Internet hoặc triển khai cài đặt file `.exe` cho máy trạm cán bộ, bắt buộc tích đủ các mục:

- [x] **1. Biến môi trường**: Đã cấu hình `NODE_ENV=production` trên máy chủ.
- [x] **2. Khóa JWT**: `JWT_SECRET` và `JWT_REFRESH_SECRET` là các chuỗi ngẫu nhiên độc lập dài trên 32 ký tự, không dùng chuỗi mẫu `.env.example`.
- [x] **3. CORS Origins**: `CORS_ORIGIN` chỉ chứa tên miền chính thức của xã (`https://qlnn.dulieudakha.vn`), không mở wildcard `localhost:*`.
- [x] **4. Chứng chỉ SSL/TLS**: Toàn bộ lưu lượng Web & API chạy qua HTTPS với chứng chỉ số hợp lệ. Vite proxy và client bật `secure: true`.
- [x] **5. Rate Limiting**: Endpoint đăng nhập đã kích hoạt `authLimiter` 20 req/15 phút/IP.
- [x] **6. File Upload Guard**: Đã kích hoạt bộ lọc định dạng file `.xlsx` và kiểm tra chữ ký nhị phân Magic Bytes `PK\x03\x04`.
- [x] **7. Electron Sandboxing**: Ứng dụng Desktop chạy với `sandbox: true`, `contextIsolation: true`, token lưu qua Windows DPAPI / RAM memory an toàn.
- [x] **8. Sao lưu tự động**: Dịch vụ nền Cron Job `initBackupCron()` hoạt động hàng ngày lưu trữ snapshot CSDL.
- [x] **9. Lịch sử Git sạch**: Đã cô lập các file nhạy cảm ra khỏi `.gitignore` của Client và Backend.

---

## 5. BẢO VỆ DỮ LIỆU CÁ NHÂN THEO NGHỊ ĐỊNH 13/2023/NĐ-CP
- Toàn bộ thông tin hộ nông dân (họ tên chủ hộ, diện tích canh tác, đàn vật nuôi, địa chỉ thôn làng) là dữ liệu cá nhân phục vụ công tác thống kê và quản lý nhà nước của chính quyền địa phương.
- Dữ liệu được bảo vệ bằng phân quyền đa thôn nghiêm ngặt (chỉ Trưởng thôn và Cán bộ phụ trách mới có quyền truy cập dữ liệu địa bàn của mình).
- *Lưu ý pháp lý: Các quy định chi tiết về thời hạn lưu trữ dữ liệu, chia sẻ liên ngành và thỏa thuận xử lý dữ liệu cần được xác minh định kỳ với người có chuyên môn pháp lý hoặc Sở Thông tin & Truyền thông Tỉnh.*
