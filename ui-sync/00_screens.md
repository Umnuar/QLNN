# BẢN KIỂM KÊ TOÀN DIỆN MÀN HÌNH, THÀNH PHẦN & TRẠNG THÁI (QLNN)
## CONSOLIDATED SCREEN, COMPONENT & STATE INVENTORY

> **Mã định danh**: `P1-INV-CONSOLIDATE`  
> **Người thực hiện**: Orchestrator (Tổng hợp từ Subagent `A-inv-shell`, `A-inv-pages`, `A-inv-modals`)  
> **Nguyên tắc bất biến**: COPY FORM ONLY, KEEP CONTENT INTACT (Bảo toàn 100% tiếng Việt, 18 chỉ tiêu nông nghiệp, 21 cột Excel, OCC version, API, phân quyền).  
> **Thời điểm hoàn thành**: Tháng 10/2026  

---

## 1. TỔNG QUAN KIỂM KÊ & ĐỘ BAO PHỦ (100% ROUTER & COMPONENT TREE)

Đối chiếu với cây component tại `src/App.tsx`, `src/AppContext.tsx`, `src/components/`, `src/pages/`, toàn bộ 100% màn hình, modal, ngăn kéo, thanh công cụ, bảng dữ liệu và 110+ trạng thái vi mô đã được kiểm kê đầy đủ:

| Nhóm chức năng | Tệp thành phần chính | Số trạng thái kiểm kê | Rủi ro hồi quy / Điểm neo bất biến |
| :--- | :--- | :--- | :--- |
| **Nhóm 1: App Shell & Auth** | `App.tsx`<br>`AppContext.tsx`<br>`AppLayout.tsx`<br>`Header.tsx`<br>`Sidebar.tsx`<br>`LoginView.tsx`<br>`ConnectionBanner.tsx`<br>`ServerStatusModal.tsx` | **35+ trạng thái** | Token auth trong `secureStorage`, tính năng Zoom (80-140%), đo ping EMA, chuyển theme Light/Dark, 4 cây menu theo vai trò (Admin toàn xã vs Thôn). |
| **Nhóm 2: Màn Hình Nghiệp Vụ** | `VillagesPage.tsx`<br>`HouseholdsPage.tsx`<br>`AnalyticsPage.tsx`<br>`AnalyticsDashboard.tsx`<br>`RecycleBinPage.tsx`<br>`SettingsPage.tsx` | **45+ trạng thái** | 7 Thôn xã Đăk Hà, 5 chế độ xem tab, bộ lọc quy mô >2ha/>15 con, thống kê native SVG, phân quyền cán bộ thôn, khôi phục cascade. |
| **Nhóm 3: Modals, Drawers, Tables** | `HouseholdFilterBar.tsx`<br>`HouseholdTable.tsx`<br>`HouseholdModal.tsx`<br>`ImportPreviewModal.tsx`<br>`ExportSettingsModal.tsx`<br>`CustomSelect.tsx`<br>`TablePagination.tsx`<br>`AuditLogView.tsx`<br>`RecycleBinTable.tsx` | **34+ trạng thái** | **18 chỉ số nông nghiệp** (12 cây, 4 con, 2 ao/lồng), **21 cột Excel Smart-Upsert**, xung đột OCC `version: Int` (HTTP 409 Reload), Visual diff tiếng Việt. |
| **TỔNG CỘNG** | **18 Component tệp** | **114+ Trạng thái vi mô** | **Bảo toàn 100% nghiệp vụ nông nghiệp** |

---

## 2. CHI TIẾT NHÓM 1: APP SHELL, ĐIỀU HƯỚNG & XÁC THỰC

### 2.1. `LoginView.tsx` (Màn hình Đăng Nhập)
- **DOM & Vị trí**: Căn giữa màn hình, container bo góc `rounded-3xl`, viền mỏng `border-slate-200 dark:border-slate-800`.
- **Nhãn tiếng Việt giữ nguyên 100%**:
  - Tiêu đề: `HỆ THỐNG QUẢN LÝ DỮ LIỆU NÔNG NGHIỆP`
  - Phụ đề: `ỦY BAN NHÂN DÂN XÃ ĐĂK HÀ • TỈNH KON TUM`
  - Nhãn form: `Tên đăng nhập / Mã định danh`, `Mật khẩu truy cập`
  - Nút bấm: `ĐĂNG NHẬP HỆ THỐNG`
  - Thông báo: `Sai tài khoản hoặc mật khẩu`, `Đang đăng nhập...`, `Không thể kết nối máy chủ xác thực và không tìm thấy phiên làm việc ngoại tuyến hợp lệ.`
- **Trạng thái vi mô**:
  1. *Default*: Form trống, focus vào username.
  2. *Password Masked/Unmasked*: Nút icon `Eye` / `EyeOff` bật/tắt hiển thị mật khẩu.
  3. *Submitting*: Nút đăng nhập disabled, hiện spinner xoay `animate-spin`.
  4. *Error Alert*: Banner `bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60 rounded-xl`.
  5. *Offline Session Fallback*: Đăng nhập ngoại tuyến an toàn từ token cache khi mất mạng.

### 2.2. `App.tsx` & `AppContext.tsx` (Khởi tạo & Điều phối State Tab)
- **Splash Screen**:
  - Text: `Đang khởi tạo phiên làm việc Quản lý Nông nghiệp...`
  - Spinner: `w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin`.
- **State Machine Điều hướng**:
  - `activeTab`: `'villages' | 'households' | 'analytics' | 'recycle-bin' | 'audit' | 'settings'`
  - `selectedVillageId`: ID thôn được chọn (nếu rỗng = xem toàn xã).
  - `selectedVillageName`: Tên thôn đang chọn (hiển thị trên Header & Sidebar).

### 2.3. `Header.tsx` (Thanh Đầu Trang Cố Định 64px)
- **Vị trí**: Cố định đỉnh màn hình `h-16`, nền `bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800`.
- **Thành phần & Nhãn**:
  - Logo & Tiêu đề: `QLNN • Dữ Liệu Đăk Hà`
  - Badge phạm vi: `Toàn xã Đăk Hà` (khi chưa chọn thôn) hoặc `Thôn: [Tên thôn]` (kèm nút `[← Đổi thôn]`).
  - Đo Ping mạng thời gian thực: Icon sóng mạng + chỉ số mili-giây `[Ping: X ms]` (tính theo thuật toán EMA). Khi mất mạng hiện badge màu cam: `Ngoại tuyến (Offline Cache)`.
  - Cụm điều khiển Zoom máy trạm: Nút `-`, tỷ lệ % (`80%` - `140%`), nút `+`, gọi IPC `window.api.app.setZoom`.
  - Nút chuyển Dark/Light mode: Icon `Sun` / `Moon` đổi class `.dark` trên `<html>`.
  - Profile & Đăng xuất: Tên cán bộ, vai trò (`Cán bộ Xã` hoặc `Trưởng Thôn`), nút `Đăng xuất` (icon `LogOut`).

### 2.4. `Sidebar.tsx` (Thanh Điều Hướng Co Giãn)
- **Kích thước**: Rộng `w-64` (mở rộng) và `w-16` (thu gọn), lưu trạng thái vào `localStorage`.
- **4 Cây menu ngữ cảnh (Contextual Navigation)**:
  1. *Admin - Chưa chọn thôn (`selectedVillageId = ''` & `activeTab = 'villages'`)*: 4 nút: `Quản Lý Thôn`, `Thùng Rác`, `Nhật Ký Hoạt Động`, `Cài Đặt Hệ Thống`.
  2. *Admin - Xem Thống kê toàn xã (`selectedVillageId = ''` & `activeTab = 'analytics'`)*: 5 nút: `Quản Lý Thôn`, `Thống Kê` (badge "Chính"), `Thùng Rác`, `Nhật Ký`, `Cài Đặt`.
  3. *Admin - Đã chọn 1 thôn (`selectedVillageId = 'v1'`)*: 6 nút: `Quản Lý Thôn` (quay lại), `Thống Kê` (badge "Chính" đầu tiên), `Hộ Nông Nghiệp`, `Thùng Rác`, `Nhật Ký`, `Cài Đặt`.
  4. *Trưởng thôn (`role = 'user'`)*: 5 nút: `Thống Kê` (badge "Chính"), `Hộ Nông Nghiệp`, `Thùng Rác`, `Nhật Ký`, `Cài Đặt`.
- **Thẻ phiên bản cuối Sidebar**: `QLNN v1.0.0` kèm icon `ShieldCheck` màu Emerald.

---

## 3. CHI TIẾT NHÓM 2: CÁC TRANG CHỨC NĂNG NGHIỆP VỤ CHÍNH

### 3.1. `VillagesPage.tsx` (Màn Hình Quản Lý Địa Bàn & 7 Thôn Làng)
- **Hero Green Banner (Trên cùng)**:
  - Khối gradient: `from-emerald-800 via-emerald-900 to-teal-950 text-white rounded-3xl p-6 border border-emerald-700/50 shadow-md`.
  - Badge pill: `UBND XÃ ĐĂK HÀ` + `Địa Bàn 7 Thôn & Làng Bản`.
  - Tiêu đề: `Tổng Quan Nông Nghiệp & Nông Thôn Mới Toàn Xã`.
  - Phụ đề số liệu: `Tổng số: ${overview?.household_count} hộ nông nghiệp • Cây trồng: ${formatArea(overview?.crops?.total_crops_area)} • Vật nuôi: ${formatCount(overview?.livestock?.total_animals, 'con')}`.
  - Nút chuyển nhanh: `[ Xem Thống Kê Toàn Xã → ]`.
- **4 Thẻ KPI Nông Nghiệp**:
  - Card 1: `ĐỊA BÀN QUẢN LÝ` | `7 Thôn` | `Toàn địa bàn Xã Đăk Hà` (Icon `MapPin`).
  - Card 2: `HỘ NÔNG NGHIỆP` | `X Hộ` | `Đã kê khai 18 chỉ số` (Icon `Users`).
  - Card 3: `TỔNG DIỆN TÍCH CÂY TRỒNG` | `X ha` | `Cà phê, cao su, dược liệu...` (Icon `Sprout`).
  - Card 4: `TỔNG ĐÀN VẬT NUÔI` | `X con` | `Trâu, bò, heo, gia cầm...` (Icon `PawPrint`).
- **Danh Sách 7 Thôn Đăk Hà**:
  - Grid thẻ: Thôn 1, Thôn 2, Thôn 3, Thôn 4, Thôn 5, Kon Đao Yôp, Kon Hnông Bách.
  - Mỗi thẻ thể hiện: Tên thôn, Tên trưởng thôn phụ trách, Số lượng hộ, Nút thao tác Sửa/Đổi tên thôn.
  - Khi click vào thẻ thôn: Gọi `handleVillageClick(id)` -> Lưu `selectedVillageId` và tự động chuyển sang tab `analytics`.

### 3.2. `HouseholdsPage.tsx` (Màn Hình Quản Lý Hộ Dân & 18 Chỉ Tiêu Nông Nghiệp)
- **Header Trang**:
  - Tiêu đề: Tên thôn (`Thôn 1`, `Kon Đao Yôp`...) kèm nút `[← Đổi thôn]` (Admin).
  - Phụ đề: `Danh sách hộ sản xuất nông nghiệp và diện tích cây trồng, vật nuôi`.
  - Cụm 3 nút chức năng (bên phải):
    1. `[ Nhập Excel ]`: Nền xám trung tính `bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 rounded-2xl text-xs font-bold`, icon `FileSpreadsheet`.
    2. `[ Xuất Excel ]`: Nền xám trung tính, icon `Download`.
    3. `[ + Thêm Hộ Dân ]`: Solid emerald `bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-xs`, icon `+`.
- **5 Chế Độ Xem Bảng (View Mode Tabs)**:
  - Tab 1: `Tổng Hợp` (Chỉ số diện tích cây trồng chính, tổng đàn vật nuôi, ao cá).
  - Tab 2: `Cây Trồng` (Cà phê hộ, Cà phê nhận khoán, Cao su hộ, Cao su nhận khoán, Cây ăn quả, Mắc ca, Lúa nước, Cây HN khác).
  - Tab 3: `Dược Liệu` (Đinh lăng, Gừng, Nghệ, Sả).
  - Tab 4: `Vật Nuôi` (Trâu, Bò, Heo, Gia cầm).
  - Tab 5: `Thủy Sản` (Ao cá ha, Lồng bè lồng).

### 3.3. `AnalyticsPage.tsx` & `AnalyticsDashboard.tsx` (Trung Tâm Báo Cáo & Thống Kê)
- **Header & Lọc**:
  - Nút `[← Quay lại danh sách thôn]` (Admin).
  - Bộ chọn thời gian / kỳ thống kê: `Năm 2026`, `Cả năm / 6 tháng`.
  - Nút `[ Xuất Báo Cáo PDF / Excel ]`.
- **4 Thẻ Tổng Hợp Nông Nghiệp Cấp Xã**:
  - `Tổng số hộ nông nghiệp`, `Tổng diện tích gieo trồng (ha)`, `Tổng đàn gia súc gia cầm (con)`, `Nuôi trồng thủy sản (ha / lồng)`.
- **Biểu Đồ Cơ Cấu Dược Liệu & Cây Trồng (Native SVG Donut)**:
  - Tỷ lệ Đinh lăng, Gừng, Nghệ, Sả không cần cài thêm thư viện biểu đồ nặng.
- **Thanh Tiến Độ Tỷ Lệ Vật Nuôi**:
  - Thanh đo phần trăm đàn Trâu, Bò, Heo, Gia cầm.
- **Bảng Đối Soát So Sánh 7 Thôn Toàn Xã**:
  - Hiển thị so sánh chéo diện tích canh tác và sản lượng giữa 7 thôn (chỉ Admin mới thấy khi xem toàn xã).

### 3.4. `RecycleBinPage.tsx` & `RecycleBinTable.tsx` (Thùng Rác Hộ Nông Nghiệp)
- **Chức năng an toàn**:
  - Danh sách các hộ bị xóa mềm (`is_deleted = true`).
  - Cột thời gian xóa, người thực hiện xóa, lý do xóa.
  - Nút `[ Khôi Phục ]`: Phục hồi cascade hộ cùng toàn bộ cây trồng, vật nuôi, ao cá.
  - Nút `[ Xóa Vĩnh Viễn ]`: Chỉ Admin thấy, mở modal cảnh báo nguy hiểm màu đỏ yêu cầu xác nhận.

### 3.5. `SettingsPage.tsx` (Cài Đặt Hệ Thống & Quản Trị Cán Bộ)
- **4 Tab chuẩn**:
  1. *Tài Khoản Của Tôi*: Xem thông tin đăng nhập, vai trò, thôn quản lý, đổi mật khẩu cá nhân.
  2. *Quản Lý Cán Bộ 7 Thôn*: Danh sách cán bộ cấp xã và 7 trưởng thôn, thêm cán bộ mới, sửa phân công thôn, đổi mật khẩu cán bộ.
  3. *Sao Lưu & Phục Hồi CSDL*: Tải bản snapshot JSON lưu trữ an toàn, phục hồi dữ liệu kèm ô **nhập mật khẩu quản trị viên bắt buộc** (`admin_password`).
  4. *Thông Tin Đơn Vị & Hệ Thống*: UBND Xã Đăk Hà, địa chỉ, hotline, phiên bản phần mềm QLNN v1.0.0.

---

## 4. CHI TIẾT NHÓM 3: MODALS, DRAWERS, TABLES & BIỂU MẪU

### 4.1. `HouseholdFilterBar.tsx` (Thanh Công Cụ Tìm Kiếm & Lọc Nâng Cao)
- **Khung Island Container**: `bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs`.
- **Các thành phần cụ thể**:
  1. Ô tìm kiếm thông minh: Hỗ trợ tiếng Việt không dấu (tìm `nguyen van a` ra `Nguyễn Văn A`), icon `Search` ở trái, nút xóa `X` + vách ngăn + nút làm mới `RefreshCw` (`title="Làm mới danh sách"`).
  2. Dropdown Quy mô (CustomSelect sm): `Tất cả quy mô`, `Lớn (> 2ha / > 15 con)`, `Vừa (0.5 - 2ha)`, `Nhỏ lẻ (< 0.5ha)`.
  3. Dropdown Loại hình (CustomSelect sm): `Tất cả loại hình`, `Có nhận khoán`, `Trồng dược liệu`, `Chăn nuôi gia súc`, `Nuôi trồng thủy sản`.
  4. Dropdown Sắp xếp (CustomSelect sm): `Mặc định (STT)`, `Diện tích cây trồng ↓`, `Tổng đàn vật nuôi ↓`, `Tên chủ hộ A → Z`, `Tên chủ hộ Z → A`.
  5. Nút `Bung/Thu gọn tất cả chi tiết`: Icon `ChevronsUpDown`.
  6. Nút `Xóa lọc`: Icon `RotateCcw`, hiển thị khi có bộ lọc đang kích hoạt.
  7. Thanh hành động hàng loạt (Khi có hộ được chọn `selectedCount > 0`):
     - Badge: `Đã chọn ${selectedCount} hộ`.
     - Nút `Bỏ chọn`, Nút `Xuất Excel`, Nút `Xóa Lô`.

### 4.2. `HouseholdTable.tsx` (Bảng Dữ Liệu 18 Chỉ Tiêu Nông Nghiệp)
- **Cấu hình Table**: `w-full text-left border-separate border-spacing-0 text-xs whitespace-nowrap min-w-[1200px]`.
- **Sticky Columns cố định bên trái**:
  - Cột 1 (Checkbox): `sticky left-0 z-20 w-10 min-w-10 bg-white dark:bg-slate-900`.
  - Cột 2 (STT): `sticky left-10 z-20 w-12 min-w-12 bg-white dark:bg-slate-900 font-mono text-slate-500`.
  - Cột 3 (Tên Chủ Hộ): `sticky left-[88px] z-20 min-w-[180px] bg-white dark:bg-slate-900 font-bold border-r-2 border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]`.
- **Cột Trạng Thái Khóa Lạc Quan (OCC)**:
  - Hiển thị badge nhỏ: `v${household.version}`.
- **Accordion Mở Rộng Dòng (Row Expansion)**:
  - Nhấn vào dòng để bung xem chi tiết toàn bộ 18 chỉ tiêu nông nghiệp của hộ đó (chia theo 4 khối: Cây trồng lâu năm & hàng năm, Dược liệu, Vật nuôi, Thủy sản).

### 4.3. `HouseholdModal.tsx` (Modal / Ngăn Kéo Nhập Liệu 18 Chỉ Tiêu)
- **Cấu trúc**: Modal (sẽ chuyển đổi sang Slide-over Drawer theo pattern QLHK).
- **Banner Xung Đột Đồng Thời (OCC Conflict Alert 409)**:
  - Khi lưu dữ liệu nếu bị 409 Conflict, modal giữ nguyên và hiện banner: `Dữ liệu hộ này vừa được cập nhật bởi một cán bộ khác trên hệ thống.` kèm nút `[ 🔄 Tải Lại Dữ Liệu Mới Nhất ]`.
- **18 Trường Nhập Liệu Bắt Buộc Bảo Toàn**:
  1. `Cà phê (Hộ canh tác)` (ha)
  2. `Cà phê (Nhận khoán)` (ha)
  3. `Cao su (Hộ canh tác)` (ha)
  4. `Cao su (Nhận khoán)` (ha)
  5. `Cây ăn quả` (ha)
  6. `Mắc ca` (ha)
  7. `Đinh lăng` (ha)
  8. `Gừng` (ha)
  9. `Nghệ` (ha)
  10. `Sả` (ha)
  11. `Lúa nước` (ha)
  12. `Cây hàng năm khác` (ha)
  13. `Trâu` (con)
  14. `Bò` (con)
  15. `Heo` (con)
  16. `Gia cầm` (con)
  17. `Ao cá` (ha)
  18. `Lồng bè` (lồng)
  + Thông tin chung: Họ và tên chủ hộ, Số CCCD, Địa chỉ/Thôn, Ghi chú.

### 4.4. `ImportPreviewModal.tsx` (Bảng Đối Soát 21 Cột Excel Smart-Upsert)
- **Tiêu đề**: `Preview Bảng Đối Soát 21 Cột – File ${file.name}`.
- **Nút đổi tệp**: `[ 🔄 Đổi Tệp Khác ]`.
- **Danh sách 21 cột đánh số phẳng chuẩn hóa**:
  `1. STT`, `2. Họ và Tên Chủ Hộ`, `3. Cà phê (Hộ)`, `4. Cà phê (Nhận k)`, `5. Cao su (Hộ)`, `6. Cao su (Nhận k)`, `7. Cây ăn quả`, `8. Macca`, `9. Đinh lăng`, `10. Gừng`, `11. Nghệ`, `12. Sả`, `13. Lúa nước`, `14. Cây HN khác`, `15. Trâu (con)`, `16. Bò (con)`, `17. Heo (con)`, `18. Gia cầm (con)`, `19. Ao cá (ha)`, `20. Lồng bè`, `21. Ghi chú`.
- **Ghim cố định 2 cột đầu**: Cột 1 (STT) và Cột 2 (Họ và Tên Chủ Hộ) ghim cố định bên trái khi cuộn ngang sang 19 cột chỉ số bên phải.
- **Nút xác nhận**: `Xác Nhận Nhập (${parsedData.length} Hợp Lệ)`.

### 4.5. `AuditLogView.tsx` (Nhật Ký Hoạt Động & Biến Động Dữ Liệu)
- **Bộ lọc sự kiện**: `Tất Cả`, `Thêm Mới` (emerald), `Cập Nhật` (blue), `Xóa` (rose), `Khôi Phục` (purple), `Nhập Excel` (amber).
- **Visual Diff trực quan tiếng Việt**:
  - So sánh giá trị Cũ (gạch ngang màu đỏ) ➡️ Mới (màu xanh lá in đậm).
  - Tự động bỏ qua các trường kỹ thuật (`id`, `version`, `updated_at`, `password_hash`).

---

## 5. DANH SÁCH "PROPOSALS" & "UNIQUE TO TARGET"

### 5.1. Danh Sách Proposals (Tính năng của QLHK chưa đưa vào QLNN)
1. **Bộ lọc tuổi theo Popover (AgeFilterPopover)**: QLHK có lọc theo độ tuổi nhân khẩu (`0-5 tuổi`, `60+ tuổi`). QLNN quản lý hộ sản xuất nông nghiệp nên **không đưa vào**, giữ nguyên bộ lọc Quy mô & Loại hình sản xuất hiện tại.
2. **Cơ cấu Dân tộc & Tôn giáo**: QLHK có thống kê 14 dân tộc thiểu số và 4 tôn giáo. QLNN chỉ cần tập trung vào cơ cấu Cây trồng, Dược liệu, Vật nuôi, Thủy sản.
3. **Thanh Drawer cho màn hình Mobile**: Đề xuất nâng cấp Sidebar trên mobile thành Drawer trượt có backdrop mờ theo chuẩn QLHK.

### 5.2. Danh Sách Unique to Target (Đặc thù QLNN giữ nguyên 100%)
1. **18 Chỉ tiêu nông nghiệp** (ha / con / lồng).
2. **Bảng đối soát 21 cột Excel Smart-Upsert**.
3. **5 Chế độ xem phân hệ canh tác trên bảng**: Tổng Hợp, Cây Trồng, Dược Liệu, Vật Nuôi, Thủy Sản.
4. **Khóa lạc quan OCC `version: Int`** với banner giải quyết xung đột 409 ngay trong form.
5. **Bộ lọc thông minh 3 cấp**: Quy mô canh tác, Loại hình đặc thù (có nhận khoán, dược liệu, vật nuôi, thủy sản), Sắp xếp nhanh.
