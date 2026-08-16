# Kế hoạch Triển khai Hệ thống Quản Lý Nông Nghiệp (QLNN) - Xã Đăk Hà

> **Dành cho Agent/Kỹ sư:** Kế hoạch xây dựng phân hệ Quản lý Nông nghiệp & Nông thôn mới (QLNN) đồng bộ với Hệ sinh thái Dữ liệu Đăk Hà. Các bước sử dụng cú pháp checkbox (`- [ ]`) để theo dõi tiến độ.

**Mục tiêu:** Xây dựng hoàn chỉnh phân hệ Quản Lý Nông Nghiệp (QLNN-Backend và QLNN-Client), quản lý 18 chỉ số cây trồng/vật nuôi/thủy sản theo từng hộ gia đình và từng thôn, tích hợp SSO Auth dùng chung với QLCS-Backend, hỗ trợ Import/Export Excel 21 cột chuẩn hóa 100% với biểu mẫu thực tế của xã Đăk Hà và Dashboard Nông thôn mới.

**Kiến trúc:** 
- Backend: Node.js + Express + TypeScript + Prisma + PostgreSQL (Cổng 5001).
- Frontend: Desktop App (Electron) + Web (React 18 + Vite + TailwindCSS) (Cổng 5174).
- Auth & SSO: Sử dụng chung `JWT_SECRET` với `QLCS-Backend` (Cổng 5000), không tự tạo bảng `users`.
- Database: CSDL PostgreSQL độc lập cho QLNN, quan hệ chuẩn hóa `households` $\leftrightarrow$ `crop_items`, `livestock_items`, `aquaculture_items`.

**Tech Stack:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, React 18, Vite, TailwindCSS, Electron, xlsx-js-style, Lucide React, TanStack Query.

## Ràng buộc Toàn cục (Global Constraints)
1. Bắt buộc có endpoint `GET /api/health` trả về JSON trạng thái.
2. Không tạo bảng `users` riêng; xác thực qua `JWT_SECRET="qlcs_jwt_secret_2025_a8f3b7c9d4e1f2g6h5"`.
3. Trưởng thôn (`role: 'user'`) bị khóa cứng theo `village_id`; Backend tự động lọc, cấm Client gửi `village_id`.
4. Import/Export Excel khớp 100% định dạng 21 cột của file `Biểu mẫu thống kê câ trồng, vật nuôi, thủy sản.xls`.
5. Trong Client, thư viện `xlsx` và `xlsx-js-style` phải dùng dynamic import `await import(...)` để chống lỗi màn hình trắng trong Electron.

---

### Task 1: Khởi tạo QLNN-Backend và Thiết lập Prisma Schema

**Files:**
- Create: `C:/Projects/QLNN/QLNN-Backend/package.json`
- Create: `C:/Projects/QLNN/QLNN-Backend/tsconfig.json`
- Create: `C:/Projects/QLNN/QLNN-Backend/.env`
- Create: `C:/Projects/QLNN/QLNN-Backend/.env.example`
- Create: `C:/Projects/QLNN/QLNN-Backend/prisma/schema.prisma`
- Create: `C:/Projects/QLNN/QLNN-Backend/src/config/prisma.ts`

- [ ] **Step 1: Khởi tạo `package.json` và `tsconfig.json` cho QLNN-Backend**
- [ ] **Step 2: Cấu hình `prisma/schema.prisma` với 5 model: `villages`, `households`, `crop_items`, `livestock_items`, `aquaculture_items`, `audit_logs`**
- [ ] **Step 3: Khởi tạo script seed danh mục Thôn xã Đăk Hà (`scripts/seed-villages.ts`) và chạy `npx prisma db push`**
- [ ] **Step 4: Kiểm tra kết nối Prisma Client và CSDL**

---

### Task 2: Xây dựng Auth Middleware, Health Check & Server Core

**Files:**
- Create: `C:/Projects/QLNN/QLNN-Backend/src/config/jwt.ts`
- Create: `C:/Projects/QLNN/QLNN-Backend/src/middlewares/auth.middleware.ts`
- Create: `C:/Projects/QLNN/QLNN-Backend/src/controllers/health.controller.ts`
- Create: `C:/Projects/QLNN/QLNN-Backend/src/routes/health.routes.ts`
- Create: `C:/Projects/QLNN/QLNN-Backend/src/index.ts`

- [ ] **Step 1: Viết `src/config/jwt.ts` giải mã token với `JWT_SECRET` dùng chung của hệ sinh thái**
- [ ] **Step 2: Viết `src/middlewares/auth.middleware.ts` gồm `authenticateToken` và `authorizeVillageScope`**
- [ ] **Step 3: Viết `health.controller.ts` và route `GET /api/health`**
- [ ] **Step 4: Khởi chạy Express server tại Port 5001 và test curl `GET /api/health`**

---

### Task 3: Xây dựng Household & Agricultural Data Service / Controllers

**Files:**
- Create: `C:/Projects/QLNN/QLNN-Backend/src/controllers/household.controller.ts`
- Create: `C:/Projects/QLNN/QLNN-Backend/src/routes/household.routes.ts`
- Create: `C:/Projects/QLNN/QLNN-Backend/src/routes/village.routes.ts`
- Create: `C:/Projects/QLNN/QLNN-Backend/src/controllers/village.controller.ts`

- [ ] **Step 1: Viết CRUD cho Hộ nông nghiệp kèm 18 chỉ số (tự động chuyển đổi giữa dạng phẳng và quan hệ relational)**
- [ ] **Step 2: Thêm bộ lọc tìm kiếm theo tên không dấu (`name_unaccented`), theo Thôn, phân trang cursor/offset**
- [ ] **Step 3: Viết API lấy danh sách Thôn (`GET /api/villages`)**
- [ ] **Step 4: Kiểm thử API thêm/sửa/xóa hộ nông nghiệp với JWT token của Admin và Trưởng thôn**

---

### Task 4: Xây dựng Module Xử lý Excel 21 Cột (Import/Export & Smart Upsert)

**Files:**
- Create: `C:/Projects/QLNN/QLNN-Backend/src/utils/excelParser.ts`
- Create: `C:/Projects/QLNN/QLNN-Backend/src/utils/excelBuilder.ts`
- Create: `C:/Projects/QLNN/QLNN-Backend/src/controllers/excel.controller.ts`
- Create: `C:/Projects/QLNN/QLNN-Backend/src/routes/excel.routes.ts`

- [ ] **Step 1: Viết `excelParser.ts` đọc file Excel mẫu, parse đúng 21 cột từ dòng 9, kiểm tra dữ liệu hợp lệ**
- [ ] **Step 2: Viết thuật toán Smart Upsert (kiểm tra tên hộ trong thôn, cập nhật nếu đã có, thêm mới nếu chưa có, hỗ trợ phân biệt theo STT)**
- [ ] **Step 3: Viết `excelBuilder.ts` xuất file Excel giữ nguyên 100% 3 dòng Header, Merge cells, dòng Tổng và Footer chữ ký Ban quản lý thôn**
- [ ] **Step 4: Kiểm thử import trực tiếp file mẫu thật `Biểu mẫu thống kê câ trồng, vật nuôi, thủy sản.xls` và xuất ngược lại**

---

### Task 5: Xây dựng Controller Thống kê & Báo cáo Nông thôn mới

**Files:**
- Create: `C:/Projects/QLNN/QLNN-Backend/src/controllers/analytics.controller.ts`
- Create: `C:/Projects/QLNN/QLNN-Backend/src/routes/analytics.routes.ts`

- [ ] **Step 1: Viết API `GET /api/analytics/overview` tổng hợp diện tích từng loại cây trồng (hộ gia đình vs nhận khoán), tổng đàn vật nuôi, diện tích thủy sản**
- [ ] **Step 2: Viết API `GET /api/analytics/by-village` so sánh chỉ tiêu giữa các thôn phục vụ chỉ tiêu NTM**
- [ ] **Step 3: Kiểm thử dữ liệu trả về với quyền Admin (toàn xã) và Trưởng thôn (chỉ thôn mình)**

---

### Task 6: Khởi tạo QLNN-Client (Electron + React 18 + Vite + TailwindCSS)

**Files:**
- Create: `C:/Projects/QLNN/QLNN-Client/package.json`
- Create: `C:/Projects/QLNN/QLNN-Client/vite.config.ts`
- Create: `C:/Projects/QLNN/QLNN-Client/tailwind.config.js`
- Create: `C:/Projects/QLNN/QLNN-Client/electron/` (main, preload, secureStorage)
- Copy nền tảng từ QLCS-Client: `src/components/Layout/`, `src/AppContext.tsx`, `src/components/ErrorBoundary.tsx`, `src/utils/`

- [ ] **Step 1: Cấu hình `package.json` với React 18, Lucide React, TailwindCSS, TanStack Query, Electron, node-polyfills**
- [ ] **Step 2: Cấu hình `vite.config.ts` với polyfill `stream`, `buffer`, `util`**
- [ ] **Step 3: Thiết lập Electron IPC và `secureStorage.ts` lưu token an toàn**
- [ ] **Step 4: Cập nhật `AppContext.tsx` trỏ tới API Backend QLNN (Port 5001) và Login SSO**

---

### Task 7: Xây dựng Bảng dữ liệu Spreadsheet 21 Cột cho QLNN-Client

**Files:**
- Create: `C:/Projects/QLNN/QLNN-Client/src/pages/Dashboard/components/MainTable.tsx`
- Create: `C:/Projects/QLNN/QLNN-Client/src/pages/Dashboard/components/HouseholdRow.tsx`
- Create: `C:/Projects/QLNN/QLNN-Client/src/pages/Dashboard/components/FilterToolbar/index.tsx`
- Create: `C:/Projects/QLNN/QLNN-Client/src/pages/Dashboard/components/Pagination.tsx`
- Create: `C:/Projects/QLNN/QLNN-Client/src/pages/Dashboard/index.tsx`

- [ ] **Step 1: Viết bảng hiển thị 21 cột dạng Spreadsheet responsive, gộp nhóm header (Cây trồng, Cây dược liệu, Vật nuôi, Thủy sản), cố định cột STT và Họ tên**
- [ ] **Step 2: Tích hợp FilterToolbar (Tìm kiếm tên không dấu, Lọc theo thôn cho Admin, Lọc loại cây/vật nuôi có diện tích/số lượng > 0)**
- [ ] **Step 3: Tích hợp Pagination và auto-fetch qua TanStack Query**

---

### Task 8: Xây dựng Form Thêm/Sửa & Modal Chi tiết Hộ nông nghiệp

**Files:**
- Create: `C:/Projects/QLNN/QLNN-Client/src/pages/Dashboard/modals/AddHouseholdModal.tsx`
- Create: `C:/Projects/QLNN/QLNN-Client/src/pages/Dashboard/modals/EditHouseholdModal.tsx`
- Create: `C:/Projects/QLNN/QLNN-Client/src/pages/Dashboard/modals/HouseholdDetailModal.tsx`
- Create: `C:/Projects/QLNN/QLNN-Client/src/pages/Dashboard/modals/DeleteConfirmModal.tsx`

- [ ] **Step 1: Viết `AddHouseholdModal.tsx` và `EditHouseholdModal.tsx` chia 3 tabs rõ ràng: (1) Cây trồng & Dược liệu, (2) Vật nuôi, (3) Thủy sản**
- [ ] **Step 2: Thêm validate dữ liệu (số thực $\ge 0$ cho ha, số nguyên $\ge 0$ cho con/lồng, họ tên bắt buộc)**
- [ ] **Step 3: Viết `HouseholdDetailModal.tsx` hiển thị thẻ tóm tắt tổng diện tích đất canh tác, quy mô đàn và ao nuôi**
- [ ] **Step 4: Kiểm thử thêm, sửa, xóa hộ nông nghiệp trên giao diện**

---

### Task 9: Xây dựng Giao diện Import / Export Excel Chuẩn hóa

**Files:**
- Create: `C:/Projects/QLNN/QLNN-Client/src/pages/Dashboard/modals/ImportModal.tsx`
- Create: `C:/Projects/QLNN/QLNN-Client/src/pages/Dashboard/modals/ExportModal.tsx`
- Create: `C:/Projects/QLNN/QLNN-Client/src/utils/excelClient.ts`

- [ ] **Step 1: Viết `excelClient.ts` sử dụng dynamic import `xlsx-js-style`**
- [ ] **Step 2: Viết `ImportModal.tsx` hỗ trợ kéo thả file Excel, hiển thị bảng Preview Diff (Thêm mới bao nhiêu hộ, Cập nhật bao nhiêu hộ, Cảnh báo trùng)**
- [ ] **Step 3: Viết `ExportModal.tsx` cho phép tải về biểu mẫu trống hoặc xuất toàn bộ dữ liệu thôn/xã ra file Excel chuẩn 100% mẫu gốc**

---

### Task 10: Xây dựng Dashboard Thống kê Nông thôn mới (NTM Analytics)

**Files:**
- Create: `C:/Projects/QLNN/QLNN-Client/src/pages/Dashboard/components/NTMDashboard.tsx`
- Create: `C:/Projects/QLNN/QLNN-Client/src/pages/Dashboard/components/StatsCards.tsx`

- [ ] **Step 1: Xây dựng thẻ StatsCards tóm tắt: Tổng số hộ nông nghiệp, Tổng diện tích Cà phê (Hộ vs Công ty), Cao su, Dược liệu, Tổng đàn Bò/Heo/Gia cầm, Diện tích cá ao/lồng**
- [ ] **Step 2: Xây dựng biểu đồ cơ cấu cây trồng và so sánh giữa các thôn**
- [ ] **Step 3: Tích hợp chế độ chuyển đổi giữa xem Dạng bảng (Spreadsheet) và Dạng Thống kê (Dashboard)**

---

### Task 11: Kiểm thử Tự động & API (Automated / API Tests)
1. **Health Check:** `curl http://localhost:5001/api/health` $\to$ Trả về `{"status": "ok", "app": "qlnn-backend", ...}`.
2. **RBAC Token Scoping:**
   - Request với token `thon1` $\to$ chỉ lấy được dữ liệu của Thôn 1.
   - Request với token `admin` $\to$ xem được toàn bộ danh sách các thôn.
3. **Database Integrity & Smart Upsert (Xác thực với dữ liệu thực tế):**
   - File Excel gốc gồm **124 dòng toàn sheet**: 9 dòng header (dòng 1-9 / index 0-8), **chính xác 112 dòng dữ liệu hộ dân (STT 1 đến 112, index 9-120)**, 1 dòng Tổng (index 121), và 2 dòng Footer chữ ký (index 122-123).
   - Chạy script import file Excel mẫu thật $\to$ import chính xác **112 hộ dân** của thôn.
   - Chạy lại import lần 2 $\to$ 112 hộ được cập nhật (Smart Upsert), tổng số dòng trong DB vẫn giữ nguyên là 112 (không bị nhân đôi lên 224).
4. **Build & Package:** Kiểm tra `npm run build:vite` và đóng gói Electron (`npm run build:win`)
