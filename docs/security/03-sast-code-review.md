# BÁO CÁO RÀ SOÁT MÃ TĨNH (SAST & MANUAL CODE REVIEW AUDIT)
## Dự án: Hệ Thống Quản Lý Dữ Liệu Nông Nghiệp Xã Đăk Hà (QLNN)
**Cơ quan quản trị**: UBND Xã Đăk Hà, Huyện Đăk Hà, Tỉnh Kon Tum  
**Phiên bản tài liệu**: 1.0 (Kiểm kê Bước 3)  
**Tiêu chuẩn áp dụng**: 
- OWASP Top 10:2021 (A01: Broken Access Control, A02: Cryptographic Failures, A03: Injection, A04: Insecure Design, A07: Identification & Auth Failures, A09: Security Logging & Monitoring Failures)
- OWASP ASVS v4.0.3 (V2, V3, V4, V5, V7, V8, V12, V13)
- CWE Top 25 (CWE-307, CWE-613, CWE-434, CWE-778, CWE-209, CWE-400, CWE-521)

---

## 1. TỔNG QUAN RÀ SOÁT MÃ NGUỒN (SOURCE CODE AUDIT SUMMARY)

Quá trình rà soát thủ công kết hợp phân tích tĩnh dòng mã (Line-by-line Manual SAST) đã bao phủ toàn bộ 9 route modules, 8 controllers, middleware xác thực, cấu hình mạng và các component giao diện người dùng:

| Tiêu chuẩn ASVS | Phạm vi rà soát | Đánh giá hiện trạng | Các phát hiện trọng yếu |
| :--- | :--- | :---: | :--- |
| **V2: Xác thực (Authentication)** | `auth.controller.ts`, `jwt.ts` | **Cần khắc phục** | - Thiếu Rate Limiting chống Brute Force trên `/api/auth/login`<br>- Thiếu kiểm tra độ dài & độ phức tạp mật khẩu |
| **V3: Quản lý Phiên (Session Management)** | `auth.controller.ts`, `jwt.ts` | **Cần khắc phục** | - Thiếu endpoint `logout` và cơ chế thu hồi Refresh Token trên máy chủ |
| **V4: Kiểm soát Truy cập (Access Control / IDOR)** | `household.controller.ts`, `excel.controller.ts`, `audit.controller.ts`, `backup.controller.ts` | **Tốt (Đã phòng thủ)** | - Các endpoint CRUD hộ đã kiểm tra `village_id` chéo<br>- Backup restore yêu cầu mật khẩu Admin 2 lớp |
| **V5: Xác thực Đầu vào (Input Validation)** | `excel.routes.ts`, `household.controller.ts` | **Cần khắc phục** | - Multer thiếu bộ lọc phần mở rộng `.xlsx` và MIME type<br>- Zod đã cài đặt nhưng chưa áp dụng validate schema |
| **V7: Xử lý Lỗi (Error Handling)** | `index.ts`, toàn bộ controllers | **Cần khắc phục** | - Trả trực tiếp `error.message` kỹ thuật về client trong môi trường production |
| **V8: Nhật ký Kiểm toán (Audit Logging)** | `user.controller.ts`, `household.controller.ts` | **Cần khắc phục** | - Thao tác quản trị tài khoản cán bộ (tạo, phân quyền, đổi pass, xóa) chưa được ghi log |
| **V12: Tải tệp (File Upload)** | `excel.routes.ts`, `excelParser.ts` | **Cần khắc phục** | - Nhận file buffer không qua kiểm tra Magic Bytes |
| **V13: Bảo vệ API (API Protection)** | `index.ts` | **Cần khắc phục** | - `express.json` cấu hình payload limit quá rộng (50MB toàn cục) |

---

## 2. CHI TIẾT CÁC PHÁT HIỆN AN NINH (SAST FINDINGS)

### [SEC-03-A] Thiếu Rate Limiting & Chống Brute Force trên endpoint Đăng nhập
- **Vị trí**: `QLNN-Backend/src/routes/auth.routes.ts:7` và `src/index.ts:23-55`
- **Mã CWE**: CWE-307 (Improper Restriction of Excessive Authentication Attempts)
- **Chuẩn tham chiếu**:
  - OWASP Top 10: A07:2021 – Identification and Authentication Failures
  - OWASP ASVS: V2.2.1, V2.2.2
  - CVSS v3.1: **7.5 (High)** - `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N`
  - Mức độ ưu tiên: **P1 (High)**
- **Mô tả & Kịch bản khai thác**:
  - Endpoint `POST /api/auth/login` không được bọc bởi middleware giới hạn tần suất request. Mặc dù thư viện `express-rate-limit` đã có sẵn trong `package.json`, nó hoàn toàn chưa được khởi tạo.
  - Kẻ tấn công trên mạng nội bộ hoặc internet có thể sử dụng các công cụ tự động (Hydra, Burp Intruder, script curl) để thử hàng nghìn mật khẩu mỗi giây nhằm dò tìm mật khẩu của tài khoản `admin` hoặc trưởng các thôn (`thon1`, `thon2`...).
- **Đề xuất khắc phục (Giai đoạn Bước 7)**:
  - Khởi tạo rate limiter riêng cho xác thực (Ví dụ: tối đa 5 lần thử sai trong 15 phút cho 1 IP):
    ```ts
    import rateLimit from "express-rate-limit";
    export const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 10,
        message: { error: "Quá nhiều lần đăng nhập không thành công. Vui lòng thử lại sau 15 phút." },
        standardHeaders: true,
        legacyHeaders: false,
    });
    ```
  - Gắn `authLimiter` vào route `POST /login`.

---

### [SEC-03-B] Thiếu cơ chế Thu hồi Phiên & Đăng xuất an toàn trên Máy chủ (Session Revocation)
- **Vị trí**: `QLNN-Backend/src/controllers/auth.controller.ts:10-81` và `src/routes/auth.routes.ts`
- **Mã CWE**: CWE-613 (Insufficient Session Expiration)
- **Chuẩn tham chiếu**:
  - OWASP Top 10: A07:2021 – Identification and Authentication Failures
  - OWASP ASVS: V3.3.1, V3.5.3
  - CVSS v3.1: **7.1 (High)** - `CVSS:3.1/AV:N/AC:H/PR:L/UI:N/S:U/C:H/I:H/A:N`
  - Mức độ ưu tiên: **P1 (High)**
- **Mô tả & Kịch bản khai thác**:
  - Khi người dùng nhấn nút Đăng xuất trên giao diện, ứng dụng chỉ xóa token ở phía Client (`localStorage.removeItem` hoặc `secureStorage.clear()`). Backend hoàn toàn không có endpoint `POST /api/auth/logout`.
  - Các token đã cấp phát (Access Token có hạn 15 phút, Refresh Token có hạn 7 ngày) vẫn hoàn toàn hợp lệ trên máy chủ cho tới khi hết hạn. Nếu một cán bộ đăng nhập trên máy trạm chung tại UBND xã và bị kẻ gian sao chép token trước khi đăng xuất, kẻ gian vẫn có thể tiếp tục sử dụng token đó trong nhiều ngày để gửi request can thiệp dữ liệu.
- **Đề xuất khắc phục (Giai đoạn Bước 7)**:
  - Bổ sung bảng lưu trữ hoặc cột `token_version` (hoặc blacklist token / in-memory cache) cho người dùng.
  - Bổ sung endpoint `POST /api/auth/logout` để đánh dấu vô hiệu hóa token hiện hành.
  - Khi người dùng đổi mật khẩu hoặc bị vô hiệu hóa, tăng `token_version` để thu hồi toàn bộ token cũ đã cấp.

---

### [SEC-03-C] Thiếu bộ lọc định dạng tệp và kiểm tra Magic Bytes khi tải file Excel (Unrestricted Upload)
- **Vị trí**: `QLNN-Backend/src/routes/excel.routes.ts:14-17` và `src/controllers/excel.controller.ts:83-110`
- **Mã CWE**: CWE-434 (Unrestricted Upload of File with Dangerous Type)
- **Chuẩn tham chiếu**:
  - OWASP Top 10: A04:2021 – Insecure Design, A05:2021 – Security Misconfiguration
  - OWASP ASVS: V12.1.1, V12.1.2
  - CVSS v3.1: **7.5 (High)** - `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:H/A:H`
  - Mức độ ưu tiên: **P1 (High)**
- **Mô tả & Kịch bản khai thác**:
  - Middleware cấu hình Multer hiện tại:
    ```ts
    const upload = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    });
    ```
  - Multer không khai báo `fileFilter`. Kẻ tấn công có thể tải lên bất kỳ tệp nào (kể cả tệp nhị phân `.exe`, mã script `.sh`, tệp XML lồng nhau hoặc tệp rác 20MB). Tệp này được nạp thẳng vào RAM máy chủ và chuyển trực tiếp vào hàm phân tích của SheetJS (`parseDakHaExcel(req.file.buffer)`).
- **Đề xuất khắc phục (Giai đoạn Bước 7)**:
  - Thêm `fileFilter` kiểm tra đuôi tệp `.xlsx` / `.xls` và MIME type chuẩn.
  - Kiểm tra Magic Bytes đầu tệp trước khi parse: `PK\x03\x04` (định dạng ZIP của `.xlsx`) hoặc `\xD0\xCF\x11\xE0` (định dạng OLE của `.xls`). Từ chối ngay lập tức nếu tệp không đúng cấu trúc.

---

### [SEC-03-D] Thiếu ghi nhận Nhật ký Kiểm toán (Audit Logs) cho các hành động quản trị tài khoản
- **Vị trí**: `QLNN-Backend/src/controllers/user.controller.ts:30-125`
- **Mã CWE**: CWE-778 (Insufficient Logging)
- **Chuẩn tham chiếu**:
  - OWASP Top 10: A09:2021 – Security Logging and Monitoring Failures
  - OWASP ASVS: V8.2.1, V8.2.2
  - CVSS v3.1: **6.5 (Medium)** - `CVSS:3.1/AV:N/AC:L/PR:H/UI:N/S:U/C:L/I:H/A:N`
  - Mức độ ưu tiên: **P1 (High)**
- **Mô tả & Kịch bản khai thác**:
  - Trong khi mọi thay đổi về Hộ nông nghiệp đều được ghi log tỉ mỉ vào bảng `audit_logs` (thêm, sửa, xóa, khôi phục kèm visual diff), toàn bộ các thao tác quản trị người dùng trong `user.controller.ts` (`createUser`, `updateUser`, `deleteUser`, `updatePassword`) lại **hoàn toàn không ghi nhận audit log**.
  - Nếu một tài khoản Admin bị lạm dụng để tạo tài khoản ẩn, đổi thôn quản lý cho một cán bộ, hoặc bí mật đổi mật khẩu của cán bộ khác, hệ thống không lưu lại bất kỳ bằng chứng kiểm toán nào để điều tra thanh tra sau này.
- **Đề xuất khắc phục (Giai đoạn Bước 7)**:
  - Bổ sung lệnh ghi `tx.audit_logs.create` cho tất cả các thao tác trong `user.controller.ts` với `action`: `CREATE_USER`, `UPDATE_USER`, `DELETE_USER`, `RESET_PASSWORD` (tuyệt đối không ghi mật khẩu vào trường `details`).

---

### [SEC-03-E] Lộ thông tin kiến trúc nội bộ qua thông báo lỗi `error.message` trả về client
- **Vị trí**: `QLNN-Backend/src/index.ts:100-112` và các controllers
- **Mã CWE**: CWE-209 (Generation of Error Message Containing Sensitive Information)
- **Chuẩn tham chiếu**:
  - OWASP Top 10: A05:2021 – Security Misconfiguration
  - OWASP ASVS: V7.1.1, V7.1.2
  - CVSS v3.1: **5.3 (Medium)** - `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N`
  - Mức độ ưu tiên: **P2 (Medium)**
- **Mô tả & Kịch bản khai thác**:
  - Middleware xử lý lỗi toàn cục và các khối `catch` trong controller sử dụng:
    ```ts
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
    ```
  - Khi Prisma gặp sự cố kết nối cơ sở dữ liệu, lỗi cú pháp hoặc vi phạm ràng buộc, `error.message` chứa chi tiết tên host `aws-0-ap-southeast-1.pooler.supabase.com:6543`, tên model và chi tiết truy vấn nội bộ. Kẻ tấn công có thể dựa vào các thông tin này để vẽ lại bản đồ kiến trúc hạ tầng và các bảng CSDL.
- **Đề xuất khắc phục (Giai đoạn Bước 7)**:
  - Khi `process.env.NODE_ENV === "production"`, ẩn toàn bộ chi tiết `error.message` của lỗi 500 và chỉ trả về thông báo thân thiện: `"Đã xảy ra lỗi máy chủ nội bộ. Vui lòng liên hệ quản trị viên."`.
  - Ghi chi tiết stack trace vào log máy chủ riêng biệt để lập trình viên tra cứu.

---

### [SEC-03-F] Cấu hình Body Parser cho phép payload quá lớn (50MB toàn cục)
- **Vị trí**: `QLNN-Backend/src/index.ts:52-53`
- **Mã CWE**: CWE-400 (Uncontrolled Resource Consumption)
- **Chuẩn tham chiếu**:
  - OWASP ASVS: V13.1.5
  - CVSS v3.1: **5.3 (Medium)**
  - Mức độ ưu tiên: **P2 (Medium)**
- **Mô tả & Kịch bản khai thác**:
  - `app.use(express.json({ limit: "50mb" }))` cho phép mọi request JSON gửi tối đa 50MB. Kẻ tấn công có thể gửi liên tục các payload JSON 50MB chứa các đối tượng lồng nhau sâu vào endpoint đăng nhập hoặc cập nhật hộ để làm cạn kiệt bộ nhớ V8 của tiến trình Node.js.
- **Đề xuất khắc phục (Giai đoạn Bước 7)**:
  - Đặt giới hạn `express.json({ limit: "2mb" })` cho toàn cục.
  - Chỉ áp dụng giới hạn lớn riêng biệt tại route `POST /api/backup/restore` (nơi cần tiếp nhận file backup JSON của xã).

---

### [SEC-03-G] Thiếu kiểm tra độ phức tạp và độ dài tối thiểu của Mật khẩu
- **Vị trí**: `QLNN-Backend/src/controllers/user.controller.ts:44, 86, 109`
- **Mã CWE**: CWE-521 (Weak Password Requirements)
- **Chuẩn tham chiếu**:
  - OWASP ASVS: V2.1.1, V2.1.2
  - CVSS v3.1: **5.3 (Medium)**
  - Mức độ ưu tiên: **P2 (Medium)**
- **Mô tả**:
  - Khi tạo tài khoản cán bộ hoặc đặt lại mật khẩu, mã nguồn chỉ thực hiện `bcrypt.hash(password, 10)` mà không kiểm tra độ dài tối thiểu (ví dụ: tối thiểu 8 ký tự). Người dùng có thể đặt mật khẩu chỉ gồm 1 ký tự (`1`), làm giảm khả năng chống chịu tấn công dò quét.
- **Đề xuất khắc phục (Giai đoạn Bước 7)**:
  - Bổ sung kiểm tra hợp lệ: Mật khẩu tối thiểu 8 ký tự, khuyến khích có cả chữ và số.

---

## 3. BẢNG TỔNG HỢP MA TRẬN RỦI RO BƯỚC 3

| Mã ID | Tiêu đề phát hiện | Vị trí file:dòng | Chuẩn ASVS | CWE | CVSS | Ưu tiên |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| **SEC-03-A** | Thiếu Rate Limiting trên `/api/auth/login` | `auth.routes.ts:7`, `index.ts:23` | V2.2.1 | CWE-307 | 7.5 | **P1** |
| **SEC-03-B** | Thiếu cơ chế Thu hồi Token / Logout trên Server | `auth.controller.ts:10-81` | V3.3.1 | CWE-613 | 7.1 | **P1** |
| **SEC-03-C** | Thiếu bộ lọc loại tệp & Magic Bytes khi upload Excel | `excel.routes.ts:14-17` | V12.1.1 | CWE-434 | 7.5 | **P1** |
| **SEC-03-D** | Thiếu Audit Log cho các hành động quản trị User | `user.controller.ts:30-125` | V8.2.1 | CWE-778 | 6.5 | **P1** |
| **SEC-03-E** | Lộ `error.message` kỹ thuật nội bộ ra client | `index.ts:100-112` | V7.1.1 | CWE-209 | 5.3 | **P2** |
| **SEC-03-F** | Cấu hình `express.json` limit 50MB toàn cục | `index.ts:52-53` | V13.1.5 | CWE-400 | 5.3 | **P2** |
| **SEC-03-G** | Thiếu ràng buộc độ dài & phức tạp mật khẩu | `user.controller.ts:44, 86` | V2.1.1 | CWE-521 | 5.3 | **P2** |

---

## 4. KẾT LUẬN & ĐIỀU KIỆN CHUYỂN BƯỚC

- **Trạng thái thực thi**: Hoàn thành rà soát mã tĩnh SAST toàn diện theo tiêu chuẩn OWASP ASVS v4.0.3.
- **Tính toàn vẹn mã nguồn**: Hoàn toàn không sửa đổi mã nguồn. 81 file working tree được bảo toàn 100%.
- **Bước tiếp theo**: Sau khi nhận được xác nhận từ người dùng, hệ thống sẽ tiến hành **Bước 4: Cấu hình Header, CORS & Electron Hardening**.
