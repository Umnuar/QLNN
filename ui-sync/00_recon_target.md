# BÁO CÁO RECON TOÀN DIỆN ỨNG DỤNG ĐÍCH (QLNN - QUẢN LÝ NÔNG NGHIỆP)

> **Mã nhiệm vụ**: `P0-RECON-TARGET`  
> **Người thực hiện**: Subagent `A-recon-target` (Target App Recon Specialist)  
> **Nguyên tắc bất biến**: COPY FORM ONLY, KEEP CONTENT INTACT  
> **Thư mục ứng dụng**: `C:\Users\umnuar\Documents\Projects\QLNN`  
> **Thời điểm trinh sát**: Tháng 10/2026  
> **Mục tiêu**: Bóc tách toàn diện kiến trúc kỹ thuật, luồng điều hướng, giao diện hiện tại, miền nghiệp vụ 18 chỉ tiêu nông nghiệp, 21 cột Excel, cơ chế OCC, soft-delete, phân quyền và baseline kiểm thử trước khi tiến hành đồng bộ UI từ QLHK.

---

## 1. TỔNG QUAN CÔNG NGHỆ (TECHNOLOGY STACK)

### 1.1. Frontend: `QLNN-Client`
- **Ngôn ngữ**: TypeScript 5.2.2.
- **Framework cốt lõi**: React 18.2.0, React DOM 18.2.0.
- **Build tool & Dev Server**: Vite 5.1.6 (chạy tại cổng chuẩn `5174`).
- **CSS & Design Engine**: Tailwind CSS v4 (`tailwindcss@4.2.4`, `@tailwindcss/postcss@4.2.4`, `postcss@8.5.14`).
  - `@import "tailwindcss";` tại `src/index.css`.
  - `@custom-variant dark (&:where(.dark, .dark *));` hỗ trợ Dark mode không dùng config cũ.
  - `@theme` khai báo typography:
    - `--font-sans`: `"Be Vietnam Pro", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto...`
    - `--font-mono`: `"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco...`
- **Bộ icon hệ thống**: `lucide-react@1.14.0` (chuẩn strokeWidth=1.5).
- **Desktop Runtime**: Electron 42.1.0 (`vite-plugin-electron@0.28.6`, `vite-plugin-electron-renderer@0.14.5`, `electron-builder@24.13.3`).
  - Hỗ trợ IPC điều khiển độ thu phóng qua `window.api.app.setZoom`.
- **Thư viện nghiệp vụ & Dữ liệu**:
  - `xlsx@0.18.5`: Đọc và phân tích file bảng tính Excel (bảng đối soát 21 cột).
  - `zod@4.4.3`: Xác thực schema dữ liệu.
  - `axios@1.7.9`: Giao tiếp HTTP RESTful với backend qua proxy Vite `/api` -> `http://localhost:5001`.
  - `idb@8.0.2`: Bộ nhớ đệm offline lưu trữ cục bộ IndexedDB cho thôn, hộ và thống kê khi mất kết nối.
  - `bcryptjs@3.0.3` & Web Crypto API: Mã hóa bảo mật lưu trữ cục bộ (`secureStorage.ts`, `cryptoHelper.ts`).
- **Testing Framework**: Vitest 4.1.11, `@testing-library/react@16.3.3`, `@testing-library/jest-dom@7.0.1`, `jsdom@30.0.1`.

### 1.2. Backend: `QLNN-Backend`
- **Ngôn ngữ & Runtime**: Node.js, TypeScript 5.6.0, `tsx@4.19.0`.
- **Web Framework**: Express 4.21.0, CORS 2.8.5, Helmet 8.0.0, Express Rate Limit 8.0.0.
- **ORM & Cơ sở dữ liệu**: Prisma Client 6.0.0, PostgreSQL (với extension `pg_trgm`, `uuid-ossp`).
- **Quản lý file & Excel**: `exceljs@4.4.0`, `multer@1.4.5-lts.1`.
- **Bảo mật & Phiên làm việc**: `jsonwebtoken@9.0.2`, `bcryptjs@3.0.3`, `zod@3.23.0`.
- **Tiến trình nền**: `node-cron@4.6.0` (tự động sao lưu lúc 02:00 AM mỗi ngày).
- **Testing**: Jest 30.5.0, `ts-jest@29.4.12`, `supertest@7.2.2`.

---

## 2. KIẾN TRÚC ĐIỀU HƯỚNG & PHÂN QUYỀN (ROUTING & NAVIGATION)

### 2.1. Cơ chế định tuyến
- Mặc dù `package.json` có khai báo `react-router-dom`, ứng dụng **KHÔNG sử dụng Browser Router hay URL-based routing** trong mã nguồn UI.
- Toàn bộ luồng hiển thị hoạt động theo cơ chế **State-driven tab routing** thông qua `AppContext.activeTab`.
- Luồng render tại `src/App.tsx`:
  1. `isInitializing === true` -> Màn hình khởi tạo (Spinner xoay, thông điệp "Đang khởi tạo phiên làm việc Quản lý Nông nghiệp...").
  2. `!user` -> `LoginView` (Đăng nhập tài khoản/mật khẩu, kiểm tra token trong `secureStorage`).
  3. Đã đăng nhập -> Render `AppLayout` bọc quanh component tương ứng với `activeTab`:
     - `activeTab === "villages"` -> `<VillagesPage />`
     - `activeTab === "households"` -> `<HouseholdsPage />`
     - `activeTab === "analytics"` -> `<AnalyticsPage />` (chứa `<AnalyticsDashboard />`)
     - `activeTab === "recycle-bin"` -> `<RecycleBinPage />`
     - `activeTab === "audit"` -> `<AuditLogView />`
     - `activeTab === "settings"` -> `<SettingsPage />`

### 2.2. Danh mục Menu Sidebar theo Phân Quyền (RBAC)
Sidebar (`src/components/Layout/Sidebar.tsx`) điều chỉnh menu động dựa trên vai trò `user.role` và trạng thái chọn thôn `selectedVillageId`:

1. **Admin (Cán bộ Xã) - Khi chưa chọn thôn cụ thể**:
   - `villages`: **Quản Lý Thôn** (icon `MapIcon`, desc: "Quản lý các thôn xã Đăk Hà")
   - `recycle-bin`: **Thùng Rác** (icon `Trash2`, desc: "Quản lý hộ dân đã xóa")
   - `audit`: **Nhật Ký Hoạt Động** (icon `History`, desc: "Lịch sử biến động dữ liệu")
   - `settings`: **Cài Đặt Hệ Thống** (icon `SettingsIcon`, desc: "Tài khoản & sao lưu CSDL")
   - *(Nếu đang xem thống kê toàn xã, thêm tab `analytics`: Thống Kê toàn xã với badge "Chính")*

2. **Admin (Cán bộ Xã) - Khi đã chọn 1 thôn (`selectedVillageId` có giá trị)**:
   - `villages`: **Quản Lý Thôn** (desc: "Quay lại danh sách thôn")
   - `analytics`: **Thống Kê** (badge: "Chính", desc: Tên thôn đã chọn)
   - `households`: **Hộ Nông Nghiệp** (desc: Tên thôn đã chọn)
   - `recycle-bin`: **Thùng Rác** (desc: "Quản lý hộ dân đã xóa")
   - `audit`: **Nhật Ký Hoạt Động** (desc: "Lịch sử biến động dữ liệu")
   - `settings`: **Cài Đặt Hệ Thống** (desc: "Tài khoản & sao lưu CSDL")

3. **Cán bộ Thôn (`role === "user"`)**:
   - Khóa chặt vào thôn được phân công (`user.village_id`).
   - 4 mục menu cố định:
     - `analytics`: **Thống Kê** (badge: "Chính", desc: "18 chỉ tiêu nông nghiệp")
     - `households`: **Hộ Nông Nghiệp** (desc: "Quản lý 18 chỉ số hộ dân")
     - `recycle-bin`: **Thùng Rác** (desc: "Quản lý hộ dân đã xóa")
     - `audit`: **Nhật Ký Hoạt Động** (desc: "Lịch sử biến động dữ liệu")

---

## 3. HỆ THỐNG GIAO DIỆN & TOKEN HIỆN TẠI (STYLING & DESIGN TOKENS)

### 3.1. Typography
- Phông chữ giao diện (Sans-serif): `"Be Vietnam Pro"`.
- Phông chữ số liệu, mã code (Monospace): `"JetBrains Mono"`.
- Áp dụng thống nhất cho toàn bộ bảng, thẻ thống kê, input, nút bấm.

### 3.2. Bảng màu chủ đạo (Color Palette)
- **Màu thương hiệu / Nông nghiệp chính**: `Emerald` (`#059669`, `#10b981`, `#064e3b`, `#022c22`).
- **Màu nền trung tính (Neutrals)**:
  - Chế độ Sáng (Light): Nền body `#f8fafc` (slate-50), thẻ card `#ffffff`, viền `slate-200` (`#e2e8f0`).
  - Chế độ Tối (Dark): Nền body `#020617` (slate-950), thẻ card `slate-900` (`#0f172a`), viền `slate-800` (`#1e293b`).
- **Màu phân loại theo lĩnh vực nông nghiệp**:
  - Cây trồng lâu năm (Cà phê, cao su): `Amber` / `Emerald`.
  - Cây dược liệu: `Teal` (`#0d9488`, `#14b8a6`).
  - Đàn vật nuôi (Trâu, bò, heo, gia cầm): `Amber` (`#d97706`, `#f59e0b`).
  - Thủy sản (Ao cá, lồng bè): `Sky` / `Blue` (`#0284c7`, `#38bdf8`).
  - Cảnh báo & Xóa bỏ (Thùng rác, Hard Delete): `Rose` (`#e11d48`, `#f43f5e`).
- **Màu phân biệt từng thôn**: Bảng mã màu riêng biệt cho 7 thôn (Thôn 1: Blue, Thôn 2: Emerald, Thôn 3: Purple, Thôn 4: Amber, Thôn 5: Rose, Thôn Đăk Kđêm: Indigo, Thôn Kon Bơ Bắn: Teal).

### 3.3. Hiệu ứng, Động lực học & Chuyển động (Animations)
- Tích hợp bộ polyfill Tailwind v4 Animation Engine tại `src/index.css`:
  - `.animate-in`: Animation enter theo đường cong cubic-bezier mượt mà.
  - `.animate-fade-in`: Opacity 0 -> 1 (200ms).
  - `.animate-slide-in`: Dịch chuyển từ dưới lên 1rem kết hợp fade in.
  - `.zoom-in-95`: Scale từ 0.95 -> 1.0 cho Modal/Popup.
  - `.slide-in-from-top`: Dùng cho `ConnectionBanner` xuất hiện khi ngắt kết nối.
  - Tự động tắt hoạt ảnh khi người dùng bật `prefers-reduced-motion: reduce`.

### 3.4. Quản lý trạng thái toàn cục trong App Shell
- **Thu phóng (Zoom Level)**: Dải zoom từ 80% đến 140% (bước nhảy 10%), phím tắt Ctrl+/Ctrl-/Ctrl0, lưu `localStorage("qlnn_zoom")`, tương thích IPC Electron.
- **Dark/Light Theme**: Tự động nhận diện theme hệ điều hành, nút chuyển đổi trên Header, lưu `localStorage("qlnn_theme")`, gán class `.dark` vào `document.documentElement`.
- **Đo Ping & Latency thời gian thực**:
  - Gửi request tuần hoàn mỗi 6 giây tới endpoint `/ping` (hoặc `/health`).
  - Làm mượt số đo độ trễ bằng thuật toán Exponential Moving Average (EMA) với hệ số `alpha = 0.3`.
  - Hiển thị pill màu xanh (Online / <200ms), màu hổ phách (Thử lại...), màu đỏ (Ngoại tuyến).
  - Tự động phát CustomEvent `"server:reconnected"` để các trang fetch lại dữ liệu ngay khi có mạng.
- **Tự động đăng xuất sau 30 phút bất hoạt**: Hook `useInactivityTimeout` bảo đảm tiêu chuẩn an ninh hệ thống công quyền.

---

## 4. MIỀN DỮ LIỆU NGHIỆP VỤ CỐT LÕI (CORE DOMAIN STRUCTURE)

### 4.1. 18 Chỉ Tiêu Nông Nghiệp Chuẩn Xã Đăk Hà
Dữ liệu nông nghiệp được chuẩn hóa thành 18 trường cụ thể trên bảng `households` (hoặc quan hệ `crop_items`, `livestock_items`, `aquaculture_items`):

| Nhóm lĩnh vực | STT | Mã trường dữ liệu | Tên hiển thị chỉ tiêu | Đơn vị tính | Ghi chú nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **I. Cây công nghiệp** | 1 | `cafe_household` | Cà phê (Hộ gia đình) | ha | Diện tích tự canh tác |
| | 2 | `cafe_contracted` | Cà phê (Nhận khoán) | ha | Diện tích khoán công ty/nông trường |
| | 3 | `rubber_household` | Cao su (Hộ gia đình) | ha | Diện tích tự canh tác |
| | 4 | `rubber_contracted` | Cao su (Nhận khoán) | ha | Diện tích nhận khoán |
| **II. Cây ăn quả & hạt** | 5 | `fruit_tree` | Cây ăn quả | ha | Sầu riêng, mít, bơ, bưởi... |
| | 6 | `macadamia` | Mắc ca | ha | Cây trồng chủ lực NTM |
| **III. Cây dược liệu** | 7 | `herb_dinh_lang` | Đinh lăng | ha | Đề án dược liệu bản địa Đăk Hà |
| | 8 | `herb_gung` | Gừng | ha | Cây trồng xen canh / chuyên canh |
| | 9 | `herb_nghe` | Nghệ | ha | Cây dược liệu lấy củ |
| | 10 | `herb_sa` | Sả | ha | Cây lấy tinh dầu |
| **IV. Cây lương thực** | 11 | `wet_rice` | Lúa nước | ha | Diện tích gieo trồng 2 vụ / 1 vụ |
| | 12 | `other_annual_crops` | Cây hàng năm khác | ha | Ngô, khoai, sắn, rau màu |
| **V. Chăn nuôi** | 13 | `buffalo` | Đàn trâu | con | Gia súc lớn |
| | 14 | `cow` | Đàn bò | con | Gia súc lớn |
| | 15 | `pig` | Đàn heo (lợn) | con | Chăn nuôi gia trại / trang trại |
| | 16 | `poultry` | Gia cầm | con | Gà, vịt, ngan, ngỗng |
| **VI. Thủy sản** | 17 | `fish_pond` | Ao hồ nuôi cá | ha | Mặt nước nuôi trồng truyền thống |
| | 18 | `fish_cage` | Lồng bè nuôi cá | lồng | Nuôi cá lồng trên lòng hồ thủy điện |

### 4.2. Bảng Đối Soát 21 Cột Excel Chuẩn
Bảng tính xuất/nhập Excel được căn chỉnh cố định đúng 21 cột (index 0 đến 20) phục vụ đối soát không bao giờ được xáo trộn hay cắt bớt:
1. `1. STT`: Số thứ tự dòng.
2. `2. Họ và Tên Chủ Hộ`: Họ tên người kê khai đại diện.
3. `3. Cà phê (Hộ)`: Diện tích cà phê hộ tự làm (ha).
4. `4. Cà phê (Nhận k)`: Diện tích cà phê nhận khoán (ha).
5. `5. Cao su (Hộ)`: Diện tích cao su hộ tự làm (ha).
6. `6. Cao su (Nhận k)`: Diện tích cao su nhận khoán (ha).
7. `7. Cây ăn quả`: Diện tích cây ăn trái (ha).
8. `8. Macca`: Diện tích trồng cây mắc ca (ha).
9. `9. Đinh lăng`: Diện tích cây đinh lăng (ha).
10. `10. Gừng`: Diện tích cây gừng (ha).
11. `11. Nghệ`: Diện tích cây nghệ (ha).
12. `12. Sả`: Diện tích cây sả (ha).
13. `13. Lúa nước`: Diện tích trồng lúa (ha).
14. `14. Cây HN khác`: Diện tích cây hàng năm khác (ha).
15. `15. Trâu (con)`: Số lượng trâu (con).
16. `16. Bò (con)`: Số lượng bò (con).
17. `17. Heo (con)`: Số lượng heo (con).
18. `18. Gia cầm (con)`: Số lượng gia cầm (con).
19. `19. Ao cá (ha)`: Diện tích mặt nước ao hồ (ha).
20. `20. Lồng bè`: Số lượng lồng bè nuôi cá (lồng).
21. `21. Ghi chú`: Thông tin phụ lục hoặc phân loại hộ đặc thù.

### 4.3. Kiểm Soát Cạnh Tranh Lạc Quan (Optimistic Concurrency Control - OCC)
- Trường `version` kiểu số nguyên `Int` (mặc định khởi tạo `1`) được lưu trữ trong bảng `households`.
- Mỗi lần cập nhật dữ liệu, backend kiểm tra `WHERE id = ? AND version = ?`.
- Nếu version truyền lên không khớp với bản ghi hiện tại trên CSDL, backend ném mã lỗi HTTP `409 Conflict`.
- Frontend bắt mã lỗi 409, kích hoạt giao diện cảnh báo xung đột (OCC banner) và cung cấp nút **"Tải Lại Dữ Liệu Mới Nhất"** (`handleReloadLatest`) để tránh ghi đè dữ liệu của cán bộ khác.

### 4.4. Cơ Chế Thùng Rác (Soft-delete & Undo)
- Khi thực hiện xóa hộ tại `HouseholdsPage`:
  - Bản ghi được đánh dấu `is_deleted = true`, cập nhật `deleted_at = NOW()`.
  - Một thanh Undo toast xuất hiện ở góc phải màn hình trong 15 giây, cho phép cán bộ hoàn tác tức thì.
- Tại `RecycleBinPage`:
  - Hiển thị danh sách các hộ trong thùng rác theo đầy đủ 21 cột ma trận.
  - Cung cấp tính năng chọn nhiều (batch selection), khôi phục (`RESTORE`) và xóa vĩnh viễn (`HARD_DELETE`, chỉ dành cho Admin).

---

## 5. BASELINE VÀ KIỂM THỬ HIỆN HÀNH (TEST & BUILD BASELINE)

Báo cáo kết quả chạy kiểm thử thực tế tại thời điểm trinh sát:

### 5.1. Frontend (`QLNN-Client`)
- **Lệnh thực thi**: `npm test` (sử dụng Vitest v4.1.11).
- **Kết quả**: **7/7 test suites ĐẠT, 26/26 tests ĐẠT 100%**, thời gian chạy ~4.15s:
  1. `SidebarNavigation.test.tsx`: 5 tests (Kiểm tra hiển thị menu phân quyền Admin, User, chọn thôn).
  2. `ExcelPreview21Cols.test.tsx`: 5 tests (Kiểm tra đủ 21 cột, không lệch cột chăn nuôi/thủy sản, colSpan 21 khi rỗng, phân trang, đổi file).
  3. `Auth.test.tsx`: 2 tests (Kiểm tra đăng nhập thành công và xử lý token).
  4. `AuditLogView.test.tsx`: 2 tests (Kiểm tra render timeline, lọc action RESTORE).
  5. `RecycleBin.test.tsx`: 2 tests (Kiểm tra danh sách đã xóa và thao tác khôi phục).
  6. `HouseholdForm.test.tsx`: 3 tests (Kiểm tra render 3 tab Trồng trọt, Chăn nuôi, Thủy sản; chuyển tab; validate dữ liệu submit).
  7. `HouseholdFilterBar.test.tsx`: 7 tests (Kiểm tra không còn mảng categories cũ, kích hoạt dropdowns quy mô, loại hình, sắp xếp).
- **Build Status**:
  - **Lệnh thực thi**: `npm run build:vite` (`tsc && vite build`).
  - **Kết quả**: **Biên dịch thành công 100% với 0 lỗi TypeScript và 0 lỗi Vite chunking** (Thời gian build ~4.24s client + 1.08s electron).

### 5.2. Backend (`QLNN-Backend`)
- **Lệnh thực thi**: `npm test` (sử dụng Jest v30.5.0 `--runInBand`).
- **Kết quả**: **5/5 test suites ĐẠT, 30/30 tests ĐẠT 100%**, thời gian chạy ~52.3s:
  1. `tests/integration/household.test.ts`: ĐẠT (Kiểm tra CRUD hộ dân, lọc quy mô, tính tổng chỉ tiêu).
  2. `src/tests/household.rbac.test.ts`: ĐẠT (Kiểm tra phân quyền thôn, ngăn chặn cán bộ thôn truy cập dữ liệu thôn khác).
  3. `tests/integration/audit.test.ts`: ĐẠT (Kiểm tra ghi vết nhật ký tự động khi thêm, sửa, xóa, khôi phục).
  4. `tests/integration/auth.test.ts`: ĐẠT (Kiểm tra cấp phát JWT, xác thực mật khẩu bcrypt).
  5. `tests/integration/village.test.ts`: ĐẠT (Kiểm tra danh mục thôn, ràng buộc xóa thôn khi còn hộ dân).

---

## 6. DANH MỤC THÀNH PHẦN GIAO DIỆN & APP SHELL (COMPONENT INVENTORY)

Toàn bộ ứng dụng bao gồm các khối thành phần sau:

### 6.1. Khung App Shell & Điều Khiển
1. `AppLayout.tsx`: Bố cục bao ngoài (`h-screen w-screen overflow-hidden flex flex-col`), tích hợp `Header`, `ConnectionBanner`, `Sidebar` và khu vực làm việc chính `<main>`.
2. `Header.tsx`:
   - Logo thương hiệu Nông nghiệp Đăk Hà (`Sprout`).
   - Cụm điều khiển Zoom (Thu nhỏ, % hiển thị, Phóng to).
   - Nút chuyển Dark/Light mode (`Sun` / `Moon`).
   - Huy hiệu địa bàn thôn đang chọn (`MapPin`).
   - Nút pill hiển thị trạng thái kết nối & Ping EMA thời gian thực (`Wifi` / `WifiOff` / `Activity`).
   - Thông tin cán bộ đăng nhập, chức vụ và nút Đăng xuất (`LogOut`).
3. `Sidebar.tsx`:
   - Thanh điều hướng co giãn (`w-16` sang `w-64`), có nút thu gọn/mở rộng.
   - Thẻ danh mục theo quyền Admin/User.
   - Tooltip bay (`floating popover`) khi ở chế độ thu gọn.
   - Thẻ hiển thị phiên bản `QLNN v1.0.0` tại chân Sidebar.
4. `ConnectionBanner.tsx`: Thanh thông báo trượt từ đỉnh màn hình khi mất kết nối mạng hoặc server, có nút "Thử kết nối ngay".
5. `ServerStatusModal.tsx`: Hộp thoại chẩn đoán mạng, hiển thị chi tiết trạng thái kết nối và ping ms.

### 6.2. Màn Hình & Thành Phần Nghiệp Vụ
1. `LoginView.tsx`: Form đăng nhập toàn màn hình, icon người dùng, mật khẩu ẩn/hiện, khung thương hiệu "QUẢN LÝ NÔNG NGHIỆP & NÔNG THÔN MỚI — XÃ ĐĂK HÀ", hộp thông báo lỗi thân thiện.
2. `VillagesPage.tsx`:
   - Banner màu xanh ngọc đậm (Hero banner).
   - 4 thẻ thống kê tổng quan (Địa bàn quản lý, Hộ nông nghiệp, Tổng diện tích cây trồng, Tổng đàn vật nuôi).
   - Thanh tìm kiếm thôn và nút "Thêm Thôn" (dành cho Admin).
   - Lưới các thẻ thôn (`Village Cards`) hiển thị tên thôn, cán bộ phụ trách, số hộ, diện tích cây/đàn vật nuôi, nút đổi tên và xóa thôn.
3. `HouseholdsPage.tsx`:
   - Thanh tiêu đề trang hiển thị thôn quản lý, badge offline cache nếu mất mạng, tổng số hộ.
   - Cụm nút tác vụ: Đổi thôn, Nhập Excel, Xuất Excel, Thêm Hộ Dân.
   - `HouseholdFilterBar.tsx`:
     - Ô tìm kiếm họ tên chủ hộ kèm nút xóa & làm mới.
     - Dropdown `CustomSelect` lọc Quy mô (Tất cả, Lớn >2ha/>15 con, Vừa 0.5-2ha, Nhỏ <0.5ha).
     - Dropdown `CustomSelect` lọc Loại hình sản xuất (Có nhận khoán, Trồng dược liệu, Chăn nuôi gia súc, Nuôi trồng thủy sản).
     - Dropdown `CustomSelect` Sắp xếp (STT, Diện tích cây trồng giảm dần, Đàn vật nuôi giảm dần, Tên A-Z, Tên Z-A).
     - Nút Bung/Thu gọn tất cả chi tiết 18 chỉ số.
     - Cụm thao tác chọn nhiều hộ: Bỏ chọn, Xuất Excel hộ đã chọn, Xóa hộ đã chọn.
   - `HouseholdTable.tsx`:
     - 6 Chế độ xem chuyển đổi linh hoạt: Tổng Hợp (`overview`), Cây Trồng (`crops`), Dược Liệu (`herbs`), Vật Nuôi (`livestock`), Thủy Sản (`aquaculture`), Tất cả 21 cột (`full`).
     - Tích hợp Accordion mở rộng dòng xem chi tiết 18 chỉ số nông nghiệp ngay tại bảng.
     - Tính năng che/hiện thông tin ghi chú nhạy cảm (`Eye` / `EyeOff`).
     - Cột cố định STT, checkbox bên trái và cột Thao tác bên phải.
   - `HouseholdModal.tsx`:
     - Form popup thêm/sửa hộ nông nghiệp với 3 tab: Cây Trồng (12 chỉ số), Vật Nuôi (4 chỉ số), Thủy Sản (2 chỉ số).
     - Tính năng phát hiện trùng tên chủ hộ thông minh (Smart Duplicate Detection).
     - Xử lý xung đột phiên bản dữ liệu (OCC 409) kèm nút nạp lại bản ghi mới nhất.
     - Tính toán tổng diện tích và tổng đàn vật nuôi thời gian thực ngay khi nhập liệu.
   - `ImportPreviewModal.tsx`: Hộp thoại xem trước bảng đối soát 21 cột trước khi ghi vào CSDL, có nút đổi file, báo cáo dòng hợp lệ, phân trang xem trước.
   - `ExportSettingsModal.tsx`: Hộp thoại tùy chọn phạm vi xuất Excel (Toàn bộ thôn / Toàn xã hoặc chỉ các hộ được chọn).
4. `AnalyticsPage.tsx` & `AnalyticsDashboard.tsx`:
   - 4 Thẻ KPI đỉnh cao (Hộ nông nghiệp, Tổng cây trồng, Tổng vật nuôi, Thủy sản).
   - Biểu đồ Donut SVG nhẹ cho cơ cấu Cà phê và Cao su (Tỷ lệ Hộ gia đình vs Nhận khoán).
   - Thẻ thống kê Cây ăn quả, Mắc ca, Lúa nước, Cây hàng năm khác.
   - Khung chi tiết Đề án Dược Liệu Đăk Hà (Đinh lăng, Gừng, Nghệ, Sả).
   - Khung tổng đàn trâu bò và các thanh tiến trình (`ProgressBar`) cho gia cầm, heo, bò, trâu.
   - Khung nuôi trồng thủy sản (Ao cá và Lồng bè).
   - Bảng ma trận so sánh số liệu giữa các thôn (chỉ dành cho Admin) kèm nút xuất file so sánh.
5. `RecycleBinPage.tsx` & `RecycleBinTable.tsx`:
   - Quản lý các hộ đã bị xóa tạm.
   - Bảng 21 cột đầy đủ, hỗ trợ chọn nhiều để Khôi phục hoặc Xóa vĩnh viễn (Admin).
6. `AuditLogView.tsx`:
   - Giao diện Timeline ghi vết lịch sử hoạt động.
   - Bộ lọc theo hành động (`CREATE`, `UPDATE`, `DELETE`, `RESTORE`, `IMPORT`), theo thôn, theo cán bộ thực hiện và ô tìm kiếm tự do.
   - Bộ dịch Diff thông minh: hiển thị chi tiết thuộc tính cũ gạch ngang sang thuộc tính mới màu xanh nổi bật, biến động thành viên và nhật ký import file.
7. `SettingsPage.tsx`:
   - 4 Tab thiết lập:
     - `profile`: Thông tin cá nhân, vai trò, đơn vị, địa bàn quản lý và form đổi mật khẩu cá nhân.
     - `users`: Quản lý danh sách cán bộ, tạo tài khoản mới, phân công thôn phụ trách, đặt lại mật khẩu cán bộ.
     - `backup`: `BackupRestoreTab.tsx` hỗ trợ xuất file JSON sao lưu CSDL toàn xã và khôi phục CSDL từ file với lớp bảo mật xác nhận mật khẩu Admin cấp 2.
     - `system`: Cấu hình thông tin cơ quan UBND Xã Đăk Hà.
8. Shared Primitives:
   - `CustomSelect.tsx`: Dropdown tùy chỉnh cao cấp, hỗ trợ tìm kiếm, xóa lựa chọn, hiển thị icon, badge, phím mũi tên điều hướng, tuân thủ tiêu chuẩn tiếp cận WCAG.
   - `TablePagination.tsx`: Thanh phân trang chuẩn hóa, chọn số dòng hiển thị (10, 20, 50, 100).
   - `ErrorBoundary.tsx`: Bắt lỗi React runtime và cung cấp màn hình khôi phục an toàn.
   - `useModal.tsx`: Quản lý Modal thông báo/xác nhận (`danger`, `warning`, `info`, `success`) dạng Promise/Hook sạch sẽ.

---

## 7. ĐÁNH GIÁ CHUẨN BỊ CHO GIAI ĐOẠN ĐỒNG BỘ GIAO DIỆN (UI SYNC READINESS)

1. **Khả năng tương thích Token từ QLHK**:
   - Cả 2 ứng dụng đều dùng React, Tailwind CSS v4, font `Be Vietnam Pro` & `JetBrains Mono`, Lucide Icons và có cấu trúc AppLayout, Header, Sidebar tương đồng.
   - QLNN đã có sẵn hệ thống dark mode, animation polyfill, CustomSelect và modal context, rất thuận lợi để tiếp nhận design tokens từ QLHK.
2. **Nguyên tắc Invariant cần tuân thủ nghiêm ngặt**:
   - **Tuyệt đối không mang nhân khẩu (citizens), CCCD, sổ hộ khẩu từ QLHK sang QLNN**.
   - **Giữ nguyên 100% 18 chỉ tiêu nông nghiệp**: Cà phê (Hộ/Khoán), Cao su (Hộ/Khoán), Cây ăn quả, Mắc ca, 4 loại Dược liệu (Đinh lăng, Gừng, Nghệ, Sả), Lúa nước, Cây hàng năm khác, Trâu, Bò, Heo, Gia cầm, Ao cá, Lồng bè.
   - **Giữ nguyên định dạng 21 cột Excel**, cơ chế Smart Duplicate Detection, Optimistic Concurrency Control (OCC 409), Soft-delete và RBAC thôn.
3. **Các điểm chú ý trong quá trình Sync**:
   - Thay thế các class CSS cứng (hardcoded colors) bằng token thống nhất theo ngôn ngữ thiết kế của QLHK.
   - Tối ưu hóa độ đậm nhạt, padding, border-radius của các Card, Table header, Button và Modal để đạt được sự đồng nhất cao cấp về mặt thị giác mà không làm thay đổi bất kỳ hành vi nghiệp vụ nào.
