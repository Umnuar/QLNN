# SECURITY AUDIT REPORT: QUẢN LÝ NÔNG NGHIỆP (QLNN)
## Agent 2 — Security Engineer | Phân Hệ QLNN — Đăk Hà Ecosystem

---

## 1. Tổng Quan Rủi Ro Bảo Mật (Security Posture)

Báo cáo kiểm toán bảo mật toàn diện theo tiêu chuẩn **OWASP Top 10 (2025)** và **ASVS (Application Security Verification Standard)**:

| Phân Loại (OWASP) | Mức Độ | Trạng Thái | Mô Tả & Vị Trí |
| :--- | :---: | :---: | :--- |
| **A01: Broken Access Control (RBAC Bypass)** | **HIGH** | ⚠️ Cần Sửa | Điều kiện kiểm tra `req.user.village_id` cho phép tài khoản `user` chưa gán thôn sửa/xóa bất kỳ hộ nào |
| **A02: Cryptographic Failures (Hardcoded Secret)** | **HIGH** | ⚠️ Cần Sửa | Khóa mã hóa `encryptionKey` bị gán cứng trong Electron `main.ts` |
| **A03: Injection (SQL & Command Injection)** | **PASS** | ✅ An toàn | Prisma ORM sử dụng Prepared Statements và Parameterized Queries 100% |
| **A04: Insecure Design (Full DB Restore Wipe)** | **MEDIUM** | ⚠️ Cần Sửa | API `/api/backup/restore` xóa toàn bộ CSDL (`deleteMany`) mà không có cơ chế snapshot dự phòng |
| **A05: Security Misconfiguration (CORS Wildcard)** | **LOW** | ⚠️ Cần Sửa | CORS cho phép mọi nguồn `http://localhost:*` |
| **A07: Identification & Auth Failures** | **PASS** | ✅ An toàn | JWT Access Token 15 phút, Refresh Token 7 ngày, bcrypt băm mật khẩu chuẩn |
| **A09: Security Logging & Monitoring Failures** | **PASS** | ✅ An toàn | Bảng `audit_logs` ghi nhận 100% thao tác INSERT/UPDATE/DELETE/IMPORT |

---

## 2. Chi Tiết Các Lỗ Hổng & Điểm Yếu Xác Nhận

### SEC-01: Nguy Cơ Vượt Rào Phân Quyền (RBAC / IDOR Authorization Bypass)
- **Vị trí**:
  - `QLNN-Backend/src/controllers/household.controller.ts` (dòng 409-416 tại `updateHousehold`, dòng 629-636 tại `deleteHousehold`, dòng 163-172 tại `getHouseholdById`, dòng 762-770 tại `restoreHousehold`).
- **Mã nguồn hiện tại**:
  ```ts
  if (
    req.user?.role === "user" &&
    req.user.village_id &&
    existing.village_id !== req.user.village_id
  ) {
    res.status(403).json({ error: "Không có quyền sửa dữ liệu thôn khác" });
    return;
  }
  ```
- **Bằng chứng phân tích (Proof of Vulnerability)**:
  - Nếu tài khoản có `role = "user"` nhưng trường `village_id` mang giá trị `null` hoặc rỗng (do cán bộ mới tạo chưa kịp phân thôn, hoặc lỗi dữ liệu), điều kiện `req.user.village_id` sẽ mang giá trị `falsy`.
  - Toàn bộ khối điều kiện `if` sẽ trả về `false`, bỏ qua việc kiểm tra quyền và **cho phép tài khoản thường này thao tác sửa, xóa, khôi phục dữ liệu của BẤT KỲ THÔN NÀO** trong xã!
- **Phương án khắc phục chuẩn (Recommended Fix)**:
  ```ts
  if (req.user?.role !== "admin") {
    if (!req.user?.village_id || existing.village_id !== req.user.village_id) {
      res.status(403).json({ error: "Không có quyền thao tác trên dữ liệu thôn này" });
      return;
    }
  }
  ```

### SEC-02: Khóa Mã Hóa Bí Mật Bị Gán Cứng Trong Mã Nguồn (Hardcoded Secret)
- **Vị trí**: `QLNN-Client/electron/main.ts` (dòng 8).
- **Mã nguồn hiện tại**:
  ```ts
  const secureStore = new Store({
    name: "qlnn-secure-tokens",
    encryptionKey: "QLNN_ENCRYPTED_STORE_KEY_SECURE_2026",
  });
  ```
- **Rủi ro**: Khóa `encryptionKey` dùng để mã hóa token đăng nhập trong `electron-store` được ghi thẳng vào mã nguồn. Khi đóng gói ứng dụng (hoặc inspect qua file JS), kẻ tấn công hoặc phần mềm độc hại trên máy trạm có thể trích xuất khóa và giải mã toàn bộ token SSO của cán bộ.
- **Phương án khắc phục**: Kết hợp machine-id hoặc Windows Credential Manager (`safeStorage.encryptString` / `safeStorage.decryptString` của Electron native API) để tận dụng DPAPI của hệ điều hành Windows thay vì khóa đối xứng gán cứng.

### SEC-03: Rủi Ro Phục Hồi CSDL Xóa Trắng Bất Khả Hồi (Destructive Restore API)
- **Vị trí**: `QLNN-Backend/src/controllers/backup.controller.ts` (dòng 170-186).
- **Mã nguồn hiện tại**:
  ```ts
  await prisma.$transaction([
    prisma.audit_logs.deleteMany(),
    prisma.crop_items.deleteMany(),
    prisma.livestock_items.deleteMany(),
    prisma.aquaculture_items.deleteMany(),
    prisma.households.deleteMany(),
    prisma.users.deleteMany(),
    prisma.villages.deleteMany(),
    // ... createMany
  ]);
  ```
- **Rủi ro**: Nếu tệp JSON backup tải lên bị hỏng, thiếu một số trường hoặc bị giả mạo, việc gọi `deleteMany()` trước khi kiểm tra toàn vẹn có thể xóa sạch CSDL sản xuất. Đồng thời bảng `users` bị xóa sạch sẽ khiến toàn bộ cán bộ mất quyền truy cập nếu payload không chứa hash hợp lệ.
- **Phương án khắc phục**:
  1. Kiểm tra tính toàn vẹn (Schema Validation qua Zod) của toàn bộ payload trước khi bắt đầu transaction.
  2. Tự động tạo một snapshot backup tức thời (`pre_restore_backup_*.json`) trước khi xóa.
  3. Tuyệt đối không xóa bảng `users` hiện tại hoặc không xóa tài khoản admin đang thực hiện request.

---

## 3. Rà Soát Chuỗi Cung Ứng & Phụ Thuộc (Dependency Security)
- Không phát hiện package độc hại nào trong `package.json`.
- Sử dụng thư viện bảo mật: `helmet` (bảo vệ HTTP headers), `cors` (giới hạn origin), `bcryptjs` (băm mật khẩu với salt rounds), `jsonwebtoken` (xác thực chữ ký số).
- **Khuyến nghị**: Loại bỏ việc chấp nhận mọi origin `http://localhost:*` trong môi trường Production; chỉ cho phép các cổng cố định (ví dụ 5174).
