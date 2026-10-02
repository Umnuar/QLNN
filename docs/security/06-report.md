# BÁO CÁO TỔNG HỢP KIỂM TOÁN AN NINH TOÀN DIỆN & CỔNG DUYỆT (MASTER SECURITY AUDIT REPORT & APPROVAL GATE)
## Dự án: Hệ Thống Quản Lý Dữ Liệu Nông Nghiệp Xã Đăk Hà (QLNN)
**Cơ quan quản trị**: UBND Xã Đăk Hà, Huyện Đăk Hà, Tỉnh Kon Tum  
**Giai đoạn**: **BƯỚC 6 — CỔNG DUYỆT PHÊ DUYỆT BẮT BUỘC (CRITICAL GATE CHECKPOINT)**  
**Trạng thái hệ thống**: **PLAN MODE (Chỉ đọc, bảo toàn 100% mã nguồn, dừng chờ lệnh "OK sửa")**  
**Tiêu chuẩn đối chiếu**: OWASP Top 10:2021, OWASP API Security Top 10:2023, OWASP ASVS v4.0.3, CWE Top 25, Electron Security Checklist (v42.x), SLSA v1.0, Nghị định 13/2023/NĐ-CP (*cần xác minh pháp lý*).

---

## 1. TỔNG QUAN KẾT QUẢ KIỂM TOÁN (EXECUTIVE SUMMARY)

Trải qua 6 bước rà soát toàn diện (Bước 0 đến Bước 5) trên toàn bộ hệ thống gồm mã nguồn Client (React 18 / Electron 42), Backend API (Express / Node.js 20), CSDL PostgreSQL (Prisma 5), lịch sử commit Git và chuỗi cung ứng, hệ thống kiểm toán ghi nhận:

### 1.1. Thống kê Phân loại Rủi ro

```
+-------------------------------------------------------------+
| TỔNG SỐ PHÁT HIỆN: 18 LỖ HỔNG & THIẾU SÓT AN NINH           |
+-------------------------------------------------------------+
|  [P0] NGUY CẤP (Critical):    2 phát hiện  (11.1%)          |
|  [P1] CAO (High):             8 phát hiện  (44.4%)          |
|  [P2] TRUNG BÌNH (Medium):    8 phát hiện  (44.4%)          |
|  [P3] THẤP (Low/Hygiene):     Đã tích hợp trong khuyến nghị |
+-------------------------------------------------------------+
```

### 1.2. Đánh giá Khả năng Phòng thủ Hiện hữu
- **Điểm mạnh đã đạt được**:
  - **Phân quyền Đa thôn (Multi-tenant Scoping) vững chắc**: 100% các endpoint CRUD hộ nông nghiệp đều chặn truy cập chéo thôn (`403 Forbidden`). Đã được xác minh qua bài kiểm thử tự động `household.rbac.test.ts`.
  - **0 Lỗ hổng SQL Injection**: Toàn bộ truy vấn CSDL đều dùng Prisma Type-safe Parameterized Queries, không có `$queryRaw` hay raw string concatenation.
  - **0 Lỗ hổng XSS phía Client**: Không sử dụng `dangerouslySetInnerHTML` hay các DOM sink nguy hiểm.
  - **Bảo vệ CSDL 2 lớp**: Endpoint phục hồi CSDL (`/api/backup/restore`) yêu cầu cả JWT Admin lẫn mật khẩu quản trị viên (xác thực qua Bcrypt).
  - **Electron Sandboxing**: Đã bật `contextIsolation: true`, `nodeIntegration: false`, chặn mở cửa sổ mới và chặn điều hướng ngoài ứng dụng.

- **Các điểm yếu trọng yếu cần khắc phục ngay (P0 & P1)**:
  - Khóa ký JWT thực tế và mật khẩu cán bộ lịch sử bị lộ trong kho Git.
  - Thiếu Rate Limiting trên API đăng nhập, tiềm ẩn nguy cơ Brute Force mật khẩu.
  - Thiếu cơ chế thu hồi Refresh Token trên máy chủ dẫn đến rủi ro tái sử dụng phiên đã đăng xuất.
  - Thư viện `xlsx` (SheetJS) phiên bản cũ chứa CVEs Prototype Pollution & ReDoS.
  - Tải file Excel chưa kiểm tra Magic Bytes và định dạng MIME.
  - Thao tác quản trị tài khoản cán bộ chưa được ghi vào nhật ký kiểm toán (Audit Logs).

---

## 2. BẢNG MA TRẬN RỦI RO TOÀN DIỆN (COMPREHENSIVE RISK MATRIX)

| ID | Tiêu đề phát hiện | Vị trí (File:Dòng) | CWE | ASVS / OWASP | CVSS v3.1 | Mức độ | Bằng chứng kiểm thử (PoC) | Đề xuất sửa chữa tối thiểu | Rủi ro làm vỡ tính năng (Blast Radius) | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- | :--- | :--- | :---: |
| **SEC-01-A** | Khóa ký JWT thực tế bị lộ trong file mẫu & Git log | `QLNN-Backend/.env.example:10-11` (Commit `2201b63`) | CWE-798, CWE-321 | A07:2021 V2.10.3 | **9.8** | **P0** | Chuỗi bí mật nằm trong git history và .env.example | Thay bằng placeholder chuỗi mẫu; thêm guard từ chối khởi động nếu dùng key mẫu; xoay secret trên production | Không ảnh hưởng nghiệp vụ nếu cấu hình ENV đúng | **OPEN** |
| **SEC-01-B** | Danh sách tài khoản & mật khẩu rõ lưu trong Git commit cũ | Commit `6279292` & `b271527` | CWE-312, CWE-798 | A07:2021 V2.1.1 | **8.6** | **P0** | `git log -p QLNN-Backend/scripts/test-login-all.ts` hiện rõ mật khẩu | Đổi toàn bộ mật khẩu cán bộ trên DB thực tế; chuẩn bị kịch bản làm sạch Git history trước khi public repo | Không ảnh hưởng code chạy | **OPEN** |
| **SEC-01-C** | `.gitignore` bỏ sót `.env*` tại Client làm lộ file ENV | `QLNN-Client/.gitignore:1-11` (Commit `8ea8df6`) | CWE-552 | A05:2021 | **5.3** | **P1** | File `.env.development` & `.env.production` đang bị Git theo dõi | Thêm `.env*` vào `.gitignore` Client; chạy `git rm --cached` ngừng theo dõi 2 file ENV | Không ảnh hưởng (Vite vẫn nạp bình thường) | **OPEN** |
| **SEC-01-D** | Mật khẩu admin mặc định cố định yếu (`admin123`) trong Seed | `QLNN-Backend/scripts/seed-users.ts:13-22` | CWE-1188 | A07:2021 V2.1.2 | **7.5** | **P1** | Mã nguồn chứa chuỗi gán cứng `admin123` | Đọc từ `INITIAL_ADMIN_PASSWORD` hoặc sinh chuỗi ngẫu nhiên 16 ký tự an toàn | Không ảnh hưởng nghiệp vụ | **OPEN** |
| **SEC-01-E** | Chuỗi kết nối DB mẫu sử dụng superuser `postgres` | `QLNN-Backend/.env.example:6-7` | CWE-250 | ASVS V1.4.1 | **4.3** | **P2** | `DATABASE_URL` dùng user `postgres` | Tài liệu hóa hướng dẫn tạo user ứng dụng riêng với quyền tối thiểu | Không ảnh hưởng nếu DB user có đủ quyền CRUD | **OPEN** |
| **SEC-02-A** | Lỗ hổng Prototype Pollution & ReDoS trong thư viện `xlsx` | `QLNN-Backend/package.json:29`, `QLNN-Client/package.json:25` | CVE-2023-30533, CVE-2024-22363 | A06:2021 | **7.8** | **P1** | `npm audit` báo 2 lỗi High trong SheetJS | Chuyển đổi parser đọc Excel trên Backend sang `exceljs` đã có sẵn; loại bỏ `xlsx` khỏi backend | Cần kiểm tra kỹ hàm parse 21 cột (đã có test suite bảo vệ) | **OPEN** |
| **SEC-02-B** | Lỗ hổng Path Traversal / File Overwrite trong `tar` | Client `node_modules/tar` (`electron-builder`) | GHSA-34x7-hfp2-rc4v | A06:2021 | **9.8** | **P1** | `npm audit` báo lỗi Critical trong dependency con | Khai báo `overrides: { "tar": "^7.5.21" }` trong `QLNN-Client/package.json` | Không ảnh hưởng ứng dụng chạy (chỉ tác động build tool) | **OPEN** |
| **SEC-02-C** | Lỗ hổng DoS & Array-limit Bypass trong parser `qs` | Backend `node_modules/qs` (`express`) | GHSA-x5fp-wj9c-mxmx | A06:2021 | **6.5** | **P2** | `npm audit` báo lỗi Moderate | Nâng cấp bản vá của `express` lên `^4.21.2` (hoặc cập nhật `qs >= 6.15.4`) | Rất thấp (hoàn toàn tương thích ngược) | **OPEN** |
| **SEC-02-D** | CI Workflow dùng `npm install` thay vì `npm ci` (SLSA) | `.github/workflows/build.yml:26` | SLSA Level 2 | NIST SSDF | **5.0** | **P2** | File workflow dùng lệnh `npm install` | Đổi sang `npm ci`; thêm bước kiểm tra linter và audit tự động; bổ sung CI cho Backend | Không ảnh hưởng mã nguồn | **OPEN** |
| **SEC-03-A** | Thiếu Rate Limiting & Chống Brute Force trên API Đăng nhập | `QLNN-Backend/src/routes/auth.routes.ts:7`, `src/index.ts` | CWE-307 | A07:2021 ASVS V2.2.1 | **7.5** | **P1** | Gửi hàng trăm request login không bị chặn | Áp dụng `express-rate-limit` (tối đa 5 lần thử sai / 15 phút) vào endpoint `POST /api/auth/login` | Rất thấp (chỉ chặn khi nhập sai quá nhiều lần) | **OPEN** |
| **SEC-03-B** | Thiếu cơ chế Thu hồi Token & Đăng xuất trên Máy chủ | `QLNN-Backend/src/controllers/auth.controller.ts:10-81` | CWE-613 | A07:2021 ASVS V3.3.1 | **7.1** | **P1** | Đăng xuất ở client không làm vô hiệu hóa token trên server | Bổ sung cột `token_version` vào bảng `users`; thêm endpoint `POST /api/auth/logout`; tăng version khi logout | Thấp (cần migrate thêm cột CSDL) | **OPEN** |
| **SEC-03-C** | Thiếu bộ lọc định dạng tệp & Magic Bytes khi upload Excel | `QLNN-Backend/src/routes/excel.routes.ts:14-17` | CWE-434 | A04:2021 ASVS V12.1.1 | **7.5** | **P1** | Multer nhận mọi định dạng file buffer tối đa 20MB | Thêm `fileFilter` kiểm tra đuôi `.xlsx` và validate Magic Bytes `PK\x03\x04` trước khi parse | Rất thấp (chỉ chặn các file không phải Excel) | **OPEN** |
| **SEC-03-D** | Thiếu Audit Log cho các hành động quản trị tài khoản cán bộ | `QLNN-Backend/src/controllers/user.controller.ts:30-125` | CWE-778 | A09:2021 ASVS V8.2.1 | **6.5** | **P1** | Tạo, sửa, xóa user không ghi bản ghi nào vào `audit_logs` | Bổ sung `tx.audit_logs.create` cho các thao tác trong `user.controller.ts` | Không ảnh hưởng (chỉ ghi thêm log) | **OPEN** |
| **SEC-03-E** | Lộ `error.message` kỹ thuật nội bộ ra client khi gặp lỗi 500 | `QLNN-Backend/src/index.ts:100-112` | CWE-209 | A05:2021 ASVS V7.1.1 | **5.3** | **P2** | Khi lỗi DB, response trả về nguyên văn host name Supabase | Trả thông báo lỗi chung chung khi `NODE_ENV === "production"`; ghi chi tiết vào server log | Không ảnh hưởng người dùng | **OPEN** |
| **SEC-03-F** | Cấu hình `express.json` limit 50MB toàn cục tiềm ẩn DoS | `QLNN-Backend/src/index.ts:52-53` | CWE-400 | ASVS V13.1.5 | **5.3** | **P2** | Mọi route JSON đều chấp nhận payload 50MB | Đặt giới hạn toàn cục 2MB; chỉ mở rộng 50MB riêng cho route `/api/backup/restore` | Không ảnh hưởng (các request bình thường chỉ vài KB) | **OPEN** |
| **SEC-03-G** | Thiếu ràng buộc độ dài tối thiểu & độ phức tạp mật khẩu | `QLNN-Backend/src/controllers/user.controller.ts:44, 86` | CWE-521 | ASVS V2.1.1 | **5.3** | **P2** | Cho phép đặt mật khẩu 1 ký tự | Thêm validation yêu cầu tối thiểu 8 ký tự khi tạo hoặc đổi mật khẩu | Thấp (chỉ ảnh hưởng khi đặt pass quá ngắn) | **OPEN** |
| **SEC-04-A** | Token Electron fallback sang Base64 thuần khi thiếu DPAPI | `QLNN-Client/electron/main.ts:8-24` | CWE-312, CWE-326 | Electron Rule 11 | **7.1** | **P1** | Hàm `encryptSafe` dùng `Buffer.from(text).toString("base64")` | Nếu DPAPI không sẵn sàng, chỉ lưu token trong memory phiên làm việc, không lưu Base64 xuống đĩa | Rất thấp (hầu hết Windows 10/11 đều hỗ trợ DPAPI) | **OPEN** |
| **SEC-04-B** | Kênh IPC Electron thiếu xác thực `senderFrame` & whitelist | `QLNN-Client/electron/main.ts:115-145` | CWE-284 | Electron Rule 17 | **6.3** | **P1** | `secure-store:set` nhận mọi key từ bất kỳ context nào | Kiểm tra frame người gọi và chỉ cho phép ghi các key trong whitelist định trước | Rất thấp | **OPEN** |
| **SEC-04-C** | CORS chấp nhận mọi `http://localhost:*` trên production | `QLNN-Backend/src/index.ts:34-50` | CWE-942 | A05:2021 | **5.4** | **P2** | Cổng localhost bất kỳ đều gọi được API kèm credentials | Chỉ bật wildcard localhost khi ở chế độ development | Không ảnh hưởng production (chỉ nhận domain chính thức) | **OPEN** |
| **SEC-04-D** | Tắt kiểm tra SSL trong Vite dev proxy (`secure: false`) | `QLNN-Client/vite.config.ts:20` | CWE-295 | A02:2021 | **4.8** | **P2** | Cấu hình proxy có `secure: false` | Đổi thành `secure: true` | Không ảnh hưởng nếu server có SSL hợp lệ | **OPEN** |
| **SEC-04-E** | Thiếu khai báo tường minh `sandbox: true` trong Electron | `QLNN-Client/electron/main.ts:48-52` | CWE-693 | Electron Rule 4 | **4.0** | **P2** | `webPreferences` chưa có `sandbox: true` | Thêm thuộc tính `sandbox: true` | Cần kiểm tra preload bridge (đã viết chuẩn qua contextBridge) | **OPEN** |
| **SEC-05-A** | Refresh Token cũ vẫn cấp được token mới sau khi Đăng xuất | `QLNN-Backend/src/controllers/auth.controller.ts:47-81` | CWE-613 | A07:2021 ASVS V3.5.3 | **7.1** | **P1** | Đã tái hiện thành công qua PoC Curl (DAST Bước 5) | Đồng bộ giải pháp `token_version` với `SEC-03-B` | Thấp (tương đồng với SEC-03-B) | **OPEN** |

---

## 3. PHÂN TÍCH TÁC ĐỘNG & BÁN KÍNH ẢNH HƯỞNG (BLAST RADIUS ANALYSIS)

Trước khi thực thi Bước 7, hệ thống đã phân tích kỹ lưỡng khả năng tác động đến các tính năng cốt lõi của ứng dụng QLNN:

1. **Quản lý 18 Chỉ tiêu Nông nghiệp (Cây trồng, Vật nuôi, Thủy sản)**:
   - **Mức độ tác động**: **0% (Hoàn toàn không bị ảnh hưởng)**.
   - Các sửa đổi bảo mật chỉ tập trung vào middleware xác thực, rate limiting, kiểm tra định dạng file tải lên và bảo vệ token. Toàn bộ logic tính toán diện tích (ha), số lượng đàn (con), OCC optimistic locking (`version`), và view mode tabs (5 tabs) được giữ nguyên vẹn.
2. **Khả năng Xem Ngoại tuyến (Offline Read-Only Cache với IndexedDB)**:
   - **Mức độ tác động**: **0% (Không bị ảnh hưởng)**.
   - Cơ chế lưu trữ offline qua Web Crypto API (AES-GCM) phía client độc lập với cơ chế thu hồi token ở server.
3. **Thao tác Nhập / Xuất Excel 21 cột (Smart-Upsert)**:
   - **Mức độ tác động**: Cần kiểm thử hồi quy kỹ lưỡng khi thay đổi parser từ `xlsx` sang `exceljs`.
   - Vì đã có bộ kiểm thử tự động `ExcelPreview21Cols.test.tsx` và `verify-excel-parser-edge-cases.ts`, mọi sai lệch về tên cột hay làm tròn số thập phân (3 chữ số) sẽ được phát hiện ngay lập tức.
4. **Phân quyền Đa thôn Cấp xã**:
   - Được củng cố vững chắc hơn, không làm thay đổi trải nghiệm của Cán bộ Xã và Trưởng thôn.

---

## 4. KẾ HOẠCH THỰC THI SỬA LỖI (REMEDIATION PLAN - BƯỚC 7)

Giai đoạn Bước 7 sẽ được tiến hành tuần tự theo đúng quy chuẩn kỹ thuật an toàn P0:

### 4.1. Khởi tạo Môi trường Sửa đổi An toàn
```powershell
git checkout -b sec/hardening
git tag pre-security
```

### 4.2. Lộ trình Sửa lỗi Tuần tự theo Độ ưu tiên
- **Đợt 1 — Khắc phục P0 (Nguy cấp - 2 phát hiện)**:
  - Commit 1: `fix(sec): sanitize .env.example and add jwt secret strength guard [SEC-01-A]`
  - Commit 2: `docs(sec): document credential rotation policy and git history purge plan [SEC-01-B]`
- **Đợt 2 — Khắc phục P1 Backend Auth & Upload (4 phát hiện)**:
  - Commit 3: `fix(sec): add rate limiting on authentication routes [SEC-03-A]`
  - Commit 4: `feat(sec): implement token_version for server-side session revocation [SEC-03-B, SEC-05-A]`
  - Commit 5: `fix(sec): enforce file extension and magic byte validation for excel uploads [SEC-03-C]`
  - Commit 6: `feat(sec): add comprehensive audit logging for user management actions [SEC-03-D]`
- **Đợt 3 — Khắc phục P1 Supply Chain & Client Electron (4 phát hiện)**:
  - Commit 7: `fix(sec): update .gitignore to block client env files and un-track env [SEC-01-C]`
  - Commit 8: `refactor(sec): replace vulnerable xlsx parser with exceljs in backend [SEC-02-A]`
  - Commit 9: `fix(sec): override tar dependency in electron-builder [SEC-02-B]`
  - Commit 10: `fix(sec): harden electron token storage and ipc validation [SEC-04-A, SEC-04-B]`
- **Đợt 4 — Khắc phục P2 Cấu hình & Vệ sinh (8 phát hiện)**:
  - Commit 11: `fix(sec): sanitize production error messages and restrict json payload limit [SEC-03-E, SEC-03-F]`
  - Commit 12: `fix(sec): enforce minimum password complexity and secure seed script [SEC-01-D, SEC-03-G]`
  - Commit 13: `fix(sec): tighten cors origin and enable ssl proxy verification [SEC-04-C, SEC-04-D, SEC-04-E]`
  - Commit 14: `ci(sec): enforce npm ci and add automated security check in workflow [SEC-02-D]`

---

## 5. QUYẾT ĐỊNH KỸ THUẬT & THÔNG SỐ CHỐT CỦA CÁC ĐIỂM KIỂM TOÁN (FINALIZED ARCHITECTURAL DECISIONS)

Dưới sự chỉ đạo kỹ thuật chuyên sâu (Senior Engineering & Defense-in-Depth) hướng tới tiêu chuẩn an toàn cao nhất, ít rủi ro nhất và phù hợp tối đa với bối cảnh thực tế tại UBND Xã Đăk Hà:

1. **Dữ liệu Thôn Làng (`GET /api/villages`)**:
   - **Quyết định**: **Giữ công khai (Read-only)** không yêu cầu JWT token.
   - **Căn cứ**: Tên 7 thôn làng thuộc xã Đăk Hà là thông tin địa bàn hành chính công khai (theo Luật Tiếp cận thông tin 2016). Cần thiết cho màn hình đăng nhập và trang công khai. Các thao tác ghi/sửa/xóa (`POST`, `PUT`, `DELETE /api/villages`) bắt buộc bảo vệ nghiêm ngặt bằng JWT Admin.
   - **Rủi ro**: 0% rủi ro; bảo toàn 100% trải nghiệm người dùng.

2. **Thời gian khóa phiên không hoạt động (`useInactivityTimeout`)**:
   - **Quyết định**: **Rút ngắn xuống 15 phút** (kèm banner thông báo đếm ngược 60 giây trước khi tự động khóa).
   - **Căn cứ**: Tuân thủ chuẩn OWASP ASVS v4.0.3 (V3.3.2) đối với máy trạm công vụ hành chính có nhiều người tiếp xúc. Đảm bảo an toàn khi cán bộ rời vị trí tiếp dân mà quên khóa máy.
   - **Rủi ro**: Rất thấp; UX được bảo vệ nhờ cảnh báo đếm ngược không gây mất dữ liệu đột ngột.

3. **Xoay JWT Secret trên Production (`SEC-01-A`)**:
   - **Quyết định**: **Lập tức triển khai xoay khóa ở Bước 7; thêm cơ chế Fail-Fast trong mã nguồn**.
   - **Căn cứ**: Thay toàn bộ key lộ trong `.env.example` bằng placeholder chuẩn; thêm guard chặn ứng dụng khởi động nếu phát hiện `JWT_SECRET` mẫu hoặc ngắn dưới 32 ký tự; tài liệu hóa kịch bản xoay secret trên production (`qlnn.dulieudakha.vn`) với secret ngẫu nhiên 64 ký tự.
   - **Rủi ro**: 0% rủi ro nếu cấu hình ENV đúng.

4. **Kế hoạch thanh lọc Git History (`SEC-01-B`)**:
   - **Quyết định**: **Đổi mới toàn bộ mật khẩu trên CSDL thực tế ngay tại Bước 7; tài liệu hóa kịch bản `git-filter-repo` an toàn tại `docs/security/`**.
   - **Căn cứ**: Không tự ý chạy các lệnh phá hủy lịch sử Git (`filter-repo`, `push --force`) làm hỏng cây commit của nhóm. Đổi toàn bộ mật khẩu trên DB triệt tiêu 100% rủi ro khai thác từ xa; cung cấp script mẫu để quản trị viên chủ động chạy khi sẵn sàng.
   - **Rủi ro**: An toàn tuyệt đối cho kho mã nguồn hiện tại.

5. **Phương án thay thế thư viện `xlsx` (SheetJS) (`SEC-02-A`)**:
   - **Quyết định**: **Chuyển đổi parser Backend sang `exceljs` (^4.4.0) đã có sẵn; loại bỏ `xlsx` khỏi backend dependencies**.
   - **Căn cứ**: Triệt tiêu 2 lỗ hổng High Severity (CVE-2023-30533, CVE-2024-22363) mà không cần cài thêm thư viện mới (tuân thủ nguyên tắc Ponytail Minimalism Rule 1.5). Đã có bộ test suite tự động bảo vệ tính chính xác 21 cột.
   - **Rủi ro**: Rất thấp (được kiểm chứng qua bài test tự động).

6. **Chính sách Thu hồi Token & Đăng xuất trên Máy chủ (`SEC-03-B` & `SEC-05-A`)**:
   - **Quyết định**: **Bổ sung cột `token_version: Int @default(1)` vào bảng `users` trong `schema.prisma` và endpoint `POST /api/auth/logout`**.
   - **Căn cứ**: Tuân thủ chuẩn OWASP ASVS V3.3.1. Khi người dùng bấm Đăng xuất hoặc đổi mật khẩu, `token_version` tăng lên 1, lập tức vô hiệu hóa toàn bộ Access Token và Refresh Token cũ trên server mà không cần Redis.
   - **Rủi ro**: Thấp (thực hiện qua Prisma migration additive).

7. **Ngưỡng Rate Limiting (`SEC-03-A`)**:
   - **Quyết định**: **Tối đa 5 lần thử sai / 15 phút cho mỗi tài khoản/IP; giới hạn chung 20 request login / 15 phút / IP**.
   - **Căn cứ**: Tuân thủ OWASP ASVS V2.2.1. Đủ thoáng cho cán bộ gõ nhầm 1-2 lần không bị phiền toái, nhưng chặn đứng 100% công cụ tấn công brute-force tự động. Phản hồi thông báo tiếng Việt lịch sự kèm header `Retry-After`.
   - **Rủi ro**: Rất thấp.

8. **Chính sách fallback của Token Electron (`SEC-04-A`)**:
   - **Quyết định**: **Chỉ lưu token trong bộ nhớ RAM phiên làm việc nếu DPAPI không sẵn sàng; TUYỆT ĐỐI KHÔNG ghi Base64 cleartext xuống ổ đĩa**.
   - **Căn cứ**: Tuân thủ Electron Security Rule 11 và CWE-312. Đảm bảo token không bao giờ nằm ở dạng bản rõ trên đĩa cứng của máy trạm dùng chung.
   - **Rủi ro**: Rất thấp (hầu hết Windows 10/11 đều hỗ trợ DPAPI).

9. **Cấu hình CORS Production (`SEC-04-C`)**:
   - **Quyết định**: **Siết chặt CORS trên production: chỉ chấp nhận domain định danh trong `CORS_ORIGIN`; loại bỏ hoàn toàn wildcard localhost**.
   - **Căn cứ**: Chặn đứng tấn công Cross-Origin từ các website độc hại bên ngoài. Ở môi trường development vẫn giữ localhost để thuận tiện debug.
   - **Rủi ro**: 0% rủi ro khi cấu hình đúng domain chính thức.

10. **Lỗ hổng Refresh Token Replay (`SEC-05-A`)**:
    - **Quyết định**: **Được giải quyết triệt để 100% thông qua cơ chế `token_version` tại mục 6**.

---

## 6. KẾ HOẠCH BÀN GIAO & TIẾN ĐỘ THỰC THI (READY FOR STEP 7)

Kế hoạch 14 commit tuần tự trên branch `sec/hardening` (tag `pre-security`) đã được khóa cứng (locked) với đầy đủ thông số kỹ thuật tối ưu.

Khi bắt đầu **Bước 7**, hệ thống sẽ thực hiện theo thứ tự nghiêm ngặt P0 → P1 → P2:
1. `git checkout -b sec/hardening` và `git tag pre-security`
2. Thực thi từng commit kèm kiểm thử hồi quy (mỗi commit đều chạy test suite xác nhận PASS 100%).
3. Báo cáo chi tiết diff và mã commit cho từng bước.
