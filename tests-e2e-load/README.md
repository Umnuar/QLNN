# Kịch bản Tích hợp, Quá tải & Bảo mật (Phần 3, 4, 5, 6, 9, 10)

## 1. E2E Testing (Phần 3 - Playwright / Cypress)
Kịch bản xuyên suốt (End-to-End Workflow):
- **B1:** Mở trang `/login`, điền thông tin và bấm Đăng nhập.
- **B2:** Chuyển hướng tới `/households`. Bấm "Thêm mới".
- **B3:** Điền form 18 chỉ số (validate nhập sai, nhập thiếu). Bấm Lưu.
- **B4:** Sửa thông tin hộ vừa tạo (Tạo bản ghi Diff).
- **B5:** Xóa hộ. Chuyển sang trang Thùng rác (`/recycle-bin`).
- **B6:** Bấm Khôi phục.
- **B7:** Chuyển sang trang Nhật ký (`/audit`). Kiểm tra danh sách có hiển thị 4 action: CREATE, UPDATE, DELETE, RESTORE với dữ liệu chính xác không.

*(Kịch bản này có thể được tự động hoá thông qua Cypress `cy.visit`, `cy.get`, `cy.click`).*

## 2. Load Testing & Stress Testing (Phần 5 - k6)
Dùng K6 để bắn request giả lập quá tải:
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 500 }, // Ramping up to 500 users
    { duration: '3m', target: 500 }, // Sustained load
    { duration: '1m', target: 0 },   // Ramping down
  ],
};

export default function () {
  const res = http.get('http://localhost:5001/api/households');
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
```

## 3. Capacity & Border Cases (Phần 6)
- **SQL Injection/XSS:** Thử chèn payload `<script>` vào ô Tên hộ dân trong bài test E2E để xác nhận hệ thống mã hóa ký tự thành an toàn.
- **Max Integer:** Gửi payload `1000000000000000` qua API, bắt response code `400 Bad Request` hoặc lỗi thân thiện.

## 4. Kiểm thử Tích hợp API & Middleware (Phần 4)
- **Mục tiêu:** Đảm bảo các hệ thống trung gian và gateway hoạt động đúng đắn (API Gateway, Load Balancer).
- **Kịch bản:** Gửi request vượt giới hạn rate limit hoặc gọi API với phương thức không được phép (OPTIONS, TRACE).
- **Kỳ vọng:** Middleware chặn ngay tại viền ngoài, trả về 429 Too Many Requests hoặc 405 Method Not Allowed mà không ảnh hưởng tới backend node.

## 5. Security & Penetration Testing (Phần 9)
- **Mục tiêu:** Ngăn chặn các rủi ro bảo mật theo OWASP Top 10.
- **Kịch bản:**
  - **IDOR (Insecure Direct Object References):** Dùng tài khoản Cán bộ xã A gọi API lấy/xoá thông tin hộ dân thuộc xã B. Kỳ vọng HTTP 403 Forbidden.
  - **JWT Tampering:** Sửa đổi payload JWT Token (chỉnh sửa role thành admin) nhưng giữ nguyên signature cũ, gửi lên server. Kỳ vọng HTTP 401 Unauthorized.

## 6. Kiểm thử Caching & Hiệu năng Database (Phần 10)
- **Mục tiêu:** Xác minh tính hiệu quả của tầng Cache (Redis) và Index trên Database.
- **Kịch bản:** Thực hiện truy vấn danh sách hộ dân với bộ lọc phức tạp liên tục 100 lần.
- **Kỳ vọng:** Lần đầu mất > 200ms (Hit DB). Các lần sau mất < 20ms (Hit Redis Cache). Đảm bảo invalidate cache tự động hoạt động đúng khi có thay đổi dữ liệu.
