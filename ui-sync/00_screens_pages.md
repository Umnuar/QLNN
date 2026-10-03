# DANH MỤC TRINH SÁT TOÀN DIỆN CÁC TRANG & MÀN HÌNH (QLNN)

> **Mã nhiệm vụ**: `00_screens_pages.md`  
> **Người thực hiện**: Subagent `A-inv-pages` (Pages Inventory Specialist)  
> **Ứng dụng tham chiếu (Reference Form)**: `C:\Users\umnuar\Documents\Projects\QLHK\QLHK-Client`  
> **Ứng dụng đích (Target Content)**: `C:\Users\umnuar\Documents\Projects\QLNN\QLNN-Client`  
> **Nguyên tắc bất biến**: COPY FORM ONLY, KEEP CONTENT INTACT  
> **Quy tắc cốt lõi**:
> 1. Giữ nguyên 100% nội dung, nhãn tiếng Việt, cột dữ liệu, bộ lọc, nút bấm, tính năng, logic nghiệp vụ và phân quyền của ứng dụng đích (QLNN).
> 2. Chỉ chuyển đổi lớp trình bày (FORM: design tokens, layout shell, visual hierarchy, spacing, typography, component patterns).
> 3. Không đưa tính năng của ứng dụng tham chiếu sang nếu QLNN không có; ghi nhận vào mục "Đề xuất (Proposals)".

---

## MỤC LỤC

1. [Trang 1: Quản Lý Thôn & Địa Bàn (`VillagesPage.tsx`)](#1-trang-1-quản-lý-thôn--địa-bàn-villagespagetsx)
2. [Trang 2: Danh Sách Hộ Nông Nghiệp (`HouseholdsPage.tsx`)](#2-trang-2-danh-sách-hộ-nông-nghiệp-householdspagetsx)
3. [Trang 3: Thống Kê & Phân Tích Nông Nghiệp (`AnalyticsPage.tsx` & `AnalyticsDashboard.tsx`)](#3-trang-3-thống-kê--phân-tích-nông-nghiệp-analyticspagetsx--analyticsdashboardtsx)
4. [Trang 4: Thùng Rác Dữ Liệu (`RecycleBinPage.tsx` & `RecycleBinTable.tsx`)](#4-trang-4-thùng-rác-dữ-liệu-recyclebinpagetsx--recyclebintabletsx)
5. [Trang 5: Cài Đặt Hệ Thống & Sao Lưu (`SettingsPage.tsx` & `BackupRestoreTab.tsx`)](#5-trang-5-cài-đặt-hệ-thống--sao-lưu-settingspagetsx--backuprestoretabtsx)
6. [Phụ lục A: Thành Phần Nhật Ký Hoạt Động (`AuditLogView.tsx`)](#phụ-lục-a-thành-phần-nhật-ký-hoạt-động-auditlogviewtsx)
7. [Bảng Tổng Hợp Trạng Thái & Ma Trận Xử Lý (States & Edge Cases Matrix)](#bảng-tổng-hợp-trạng-thái--ma-trận-xử-lý-states--edge-cases-matrix)
8. [Các Đề Xuất Nâng Cấp Giao Diện (Proposals)](#các-đề-xuất-nâng-cấp-giao-diện-proposals)

---

## 1. TRANG 1: QUẢN LÝ THÔN & ĐỊA BÀN (`VillagesPage.tsx`)

### 1.1. Đường dẫn file & Thành phần phụ thuộc
- **Component chính**: `src/pages/VillagesPage.tsx`
- **Dependencies**: `src/AppContext.tsx`, `src/api/villageApi.ts`, `src/api/analyticsApi.ts`, `src/api/authApi.ts`, `src/db/indexedDB.ts`, `src/hooks/useModal.tsx`, `src/utils/cryptoHelper.ts`.

### 1.2. Danh mục nhãn tiếng Việt, tiêu đề, nút bấm & huy hiệu (MUST BE PRESERVED)
- **Hero Green Banner ("Tổng Quan Nông Nghiệp & Nông Thôn Mới Toàn Xã")**:
  - Huy hiệu cấp đơn vị: `"UBND XÃ ĐĂK HÀ"`
  - Huy hiệu số thôn: `"Địa Bàn {villages.length} Thôn & Làng Bản"` (fallback: `"Địa Bàn Các Thôn & Làng Bản"`)
  - Tiêu đề chính: `"Tổng Quan Nông Nghiệp & Nông Thôn Mới Toàn Xã"`
  - Dòng tóm tắt chỉ số: `"Tổng số: {overview?.household_count ?? 0} hộ nông nghiệp • Cây trồng: {cryptoHelper.formatArea(overview?.crops?.total_crops_area ?? 0)} • Vật nuôi: {cryptoHelper.formatCount(overview?.livestock?.total_animals ?? 0, 'con')}"`
  - Nút chuyển nhanh: `"Xem Thống Kê Toàn Xã"` (icon `ArrowRight`, điều hướng tới `analytics` toàn xã)
- **4 Thẻ KPI Chỉ Số Nông Nghiệp Toàn Xã**:
  1. *Thẻ 1 - Địa Bàn*:
     - Tiêu đề nhãn: `"ĐỊA BÀN QUẢN LÝ"`
     - Giá trị số: `"{villages.length} Thôn"`
     - Chú thích phụ: `"Toàn địa bàn Xã Đăk Hà"`
     - Icon: `MapPin` (màu emerald)
  2. *Thẻ 2 - Hộ Dân*:
     - Tiêu đề nhãn: `"HỘ NÔNG NGHIỆP"`
     - Giá trị số: `"{overview?.household_count ?? 0} Hộ"`
     - Chú thích phụ: `"Đã kê khai 18 chỉ số"`
     - Icon: `Users` (màu xanh dương/blue)
  3. *Thẻ 3 - Cây Trồng*:
     - Tiêu đề nhãn: `"TỔNG DIỆN TÍCH CÂY TRỒNG"`
     - Giá trị số: `"{cryptoHelper.formatArea(overview?.crops?.total_crops_area ?? 0)}"`
     - Chú thích phụ: `"Cà phê, cao su, dược liệu..."`
     - Icon: `Trees` (màu teal)
  4. *Thẻ 4 - Vật Nuôi*:
     - Tiêu đề nhãn: `"TỔNG ĐÀN VẬT NUÔI"`
     - Giá trị số: `"{cryptoHelper.formatCount(overview?.livestock?.total_animals ?? 0, 'con')}"`
     - Chú thích phụ: `"Trâu, bò, heo, gia cầm..."`
     - Icon: `PawPrint` (màu hổ phách/amber)
- **Thanh Công Cụ Danh Sách Thôn**:
  - Tiêu đề danh mục: `"Danh Sách {villages.length} Thôn Xã Đăk Hà"` (icon `MapPin`)
  - Hướng dẫn thao tác: `"Bấm vào thẻ thôn để chuyển nhanh đến màn hình làm việc của thôn đó"`
  - Ô tìm kiếm: `placeholder="Tìm kiếm thôn..."`, nút xóa tìm kiếm `aria-label="Xóa tìm kiếm"` (icon `X`)
  - Nút thêm mới (chỉ hiện cho Admin): `"Thêm Thôn"` (icon `Plus`)
- **Panel / Form Thêm Thôn Mới** (`isAdding === true`):
  - Tiêu đề form: `"Thêm Thôn Mới Vào Xã Đăk Hà"`
  - Nhãn trường: `"Tên Thôn *"`
  - Input: `placeholder="Ví dụ: Thôn 8, Làng Mới..."`
  - Nút bấm: `"Hủy"`, `"Lưu Thôn Mới"`
- **Lưới Thẻ Thôn (7 Thôn: Thôn 1..5, Kon Đao Yôp / Đăk Kđêm, Kon Hnông Bách / Kon Bơ Bắn)**:
  - Tên thôn: `village.name`
  - Thông tin cán bộ phụ trách: `"• Trưởng thôn: {assignedOfficer?.full_name || assignedOfficer?.username || 'Chưa phân công'}"`
  - Thống kê nhanh chân thẻ: `"{householdCount} Hộ"`, diện tích/đàn: `"{cryptoHelper.formatArea(totalCropsArea)}"` hoặc `"{totalAnimals} con"`
  - Tác vụ quản trị Admin trên thẻ:
    - Nút đổi tên thôn: `title="Đổi tên thôn"`, icon `Edit3`
    - Nút xóa thôn: `title="Xóa thôn"`, icon `Trash2`
  - Trạng thái inline sửa tên thôn:
    - Nhãn: `"Đổi tên thôn"`
    - Input: `placeholder="Nhập tên thôn mới..."`
    - Nút bấm: `"Hủy"`, `"Lưu"`
  - Hộp thoại cảnh báo xóa thôn (`showModal`):
    - Tiêu đề: `"Xác nhận xóa thôn"`
    - Nội dung: `"Bạn có chắc muốn xóa \"{name}\" không?\nThao tác này chỉ thực hiện được khi không còn hộ nào thuộc thôn."`
    - Nút bấm: `"Xóa Thôn"`, `"Hủy"`
    - Thông báo thành công: `"Đã xóa thôn thành công"`, `"Cập nhật tên thôn thành công"`, `"Thêm thôn mới thành công"`
    - Thông báo lỗi: `"Không thể xóa thôn"`, `"Không thể cập nhật tên thôn"`, `"Không thể thêm thôn"`

### 1.3. Ma trận các trạng thái hiển thị (All States)
| Trạng thái | Điều kiện kích hoạt | Hành vi & Giao diện hiển thị |
| :--- | :--- | :--- |
| **Default / Loaded** | API trả về danh sách 7 thôn và số liệu tổng hợp thành công | Hiển thị trọn vẹn Hero Banner, 4 KPI cards, thanh tìm kiếm và grid 7 thẻ thôn với số hộ, diện tích, đàn gia súc và tên trưởng thôn. |
| **Loading** | `loading === true` trong quá trình cập nhật hoặc thêm mới | Vô hiệu hóa nút Lưu, hiển thị hiệu ứng mờ nhẹ `disabled:opacity-50`. Khi tải dữ liệu nền không chặn UI. |
| **Empty Search** | `searchTerm` không khớp với tên thôn nào | Lưới thẻ trống rỗng, không làm sập layout. |
| **Empty Villages** | Danh sách `villages` rỗng (0 bản ghi) | Banner hiển thị `"Địa Bàn Các Thôn & Làng Bản"`, thẻ địa bàn hiện `"0 Thôn"`. |
| **Inline Editing** | `editingId === village.id` | Thẻ thôn chuyển thành form sửa tên viền xanh emerald đậm, auto-focus input, nhận phím Enter (Lưu) và Escape (Hủy). |
| **Form Adding** | `isAdding === true` | Mở khối form nhập liệu phía trên lưới thôn, viền 2px emerald. |
| **Offline Mode** | Mất kết nối backend / API lỗi | Bắt lỗi `catch`, tự động nạp từ IndexedDB cache (`villages_overview`, `villages_breakdown`), lắng nghe sự kiện `server:reconnected` để tự refresh. |
| **RBAC Non-Admin** | Người dùng có vai trò cán bộ cơ sở (`role !== "admin"`) | Ẩn hoàn toàn nút `"Thêm Thôn"`, các nút sửa tên và xóa thôn trên thẻ. |

### 1.4. API Calls, Handlers & State Bindings
- `analyticsApi.getOverview()`: Lấy số liệu tổng hợp hộ dân, cây trồng, vật nuôi toàn xã.
- `analyticsApi.getByVillage()`: Lấy số liệu phân rã theo từng thôn để hiển thị trên thẻ thôn.
- `authApi.getUsers()`: Lấy danh sách cán bộ xã/thôn để map tên trưởng thôn phụ trách từng địa bàn.
- `villageApi.create(name)`: Tạo thôn mới (chỉ admin).
- `villageApi.update(id, name)`: Cập nhật tên thôn.
- `villageApi.delete(id)`: Xóa thôn khi không còn hộ dân.
- Bộ nhớ đệm cục bộ (IndexedDB): `getCache` / `setCache` với key `villages_overview`, `villages_breakdown`.
- Throttle thời gian: `cachedStatsTime`, `cachedUsersTime` (30 giây) tránh spam tải dữ liệu.
- Điều phối AppContext: `setSelectedVillageId(id)`, `setActiveTab("analytics")` khi click vào thẻ thôn.

---

## 2. TRANG 2: DANH SÁCH HỘ NÔNG NGHIỆP (`HouseholdsPage.tsx`)

### 2.1. Đường dẫn file & Thành phần phụ thuộc
- **Component chính**: `src/pages/HouseholdsPage.tsx`
- **Các sub-components phụ trách**:
  - `src/components/households/HouseholdFilterBar.tsx` (Thanh lọc, tìm kiếm, xuất/xóa hàng loạt)
  - `src/components/households/HouseholdTable.tsx` (Bảng dữ liệu 18 chỉ tiêu, 6 chế độ xem, sticky header & columns)
  - `src/components/households/HouseholdModal.tsx` (Drawer/Modal nhập liệu 18 chỉ tiêu, xử lý OCC conflict)
  - `src/components/excel/ImportPreviewModal.tsx` (Bảng đối soát 21 cột trước khi ghi đè/thêm mới)
  - `src/components/excel/ExportSettingsModal.tsx` (Hộp thoại chọn phạm vi xuất Excel 21 cột)
  - `src/components/common/TablePagination.tsx` (Điều hướng phân trang chuẩn)
  - `src/components/common/CustomSelect.tsx` (Dropdown đồng bộ UI)

### 2.2. Danh mục nhãn tiếng Việt, tiêu đề, nút bấm & huy hiệu (MUST BE PRESERVED)

#### A. Header & Top Banner (`HouseholdsPage.tsx`):
- Huy hiệu địa bàn: `{selectedVillageName || "Toàn xã Đăk Hà"}` (màu emerald)
- Huy hiệu cảnh báo ngoại tuyến: `"Ngoại tuyến (Offline Cache)"` (chấm vàng nhấp nháy)
- Tiêu đề trang: `"Danh Sách Hộ Nông Nghiệp"` (icon `Users`)
- Huy hiệu tổng số: `"{total} hộ"`
- Dòng mô tả: `"Quản lý 18 chỉ số kê khai nông nghiệp, diện tích cây trồng và đàn vật nuôi xã Đăk Hà"`
- Nút tác vụ đầu trang:
  - `"Đổi thôn"` (icon `ArrowLeft`, chỉ hiện khi Admin đang xem 1 thôn cụ thể)
  - `"Nhập Excel"` (icon `FileSpreadsheet`, mở bộ đọc `.xls`/`.xlsx`)
  - `"Xuất Excel"` / `"Đang xuất..."` (icon `Download`, mở `ExportSettingsModal`)
  - `"Thêm Hộ Dân"` (icon `Plus`, mở form nhập mới 18 chỉ tiêu)

#### B. Thanh lọc & Tác vụ hàng loạt (`HouseholdFilterBar.tsx`):
- Ô tìm kiếm: `placeholder="Tìm theo họ tên chủ hộ..."`, nút xóa nhanh tìm kiếm (icon `X`), nút làm mới (icon `RefreshCw`, xoay tròn khi `loading`)
- Dropdown Quy mô (Scale Filter):
  - Nhãn hiển thị: `"Tất cả quy mô"`
  - Tùy chọn 1: `"Lớn (> 2ha / > 15 con)"` (giá trị: `large`)
  - Tùy chọn 2: `"Vừa (0.5 - 2ha)"` (giá trị: `medium`)
  - Tùy chọn 3: `"Nhỏ lẻ (< 0.5ha)"` (giá trị: `small`)
- Dropdown Loại hình sản xuất (Production Type Filter):
  - Nhãn hiển thị: `"Tất cả loại hình"`
  - Tùy chọn 1: `"Có nhận khoán"` (giá trị: `contracted`)
  - Tùy chọn 2: `"Trồng dược liệu"` (giá trị: `herbs`)
  - Tùy chọn 3: `"Chăn nuôi gia súc"` (giá trị: `livestock`)
  - Tùy chọn 4: `"Nuôi trồng thủy sản"` (giá trị: `aquaculture`)
- Dropdown Sắp xếp (Sort Option):
  - Nhãn hiển thị: `"Mặc định (STT)"` (giá trị: `default`)
  - Tùy chọn 1: `"Diện tích cây trồng ↓"` (giá trị: `crops_desc`)
  - Tùy chọn 2: `"Tổng đàn vật nuôi ↓"` (giá trị: `livestock_desc`)
  - Tùy chọn 3: `"Tên chủ hộ A → Z"` (giá trị: `name_asc`)
  - Tùy chọn 4: `"Tên chủ hộ Z → A"` (giá trị: `name_desc`)
- Nút bung/thu gọn: `"Bung tất cả"` / `"Thu gọn tất cả"` (icon `ChevronsUpDown`)
- Nút reset: `"Xóa lọc"` (icon `RotateCcw`, nền hồng rose, chỉ hiện khi có filter active)
- Cụm tác vụ chọn hàng loạt (`selectedCount > 0`):
  - Huy hiệu: `"Đã chọn {selectedCount} hộ"`
  - Nút: `"Bỏ chọn"`, `"Xuất Excel"`, `"Xóa"` (icon `Trash2`, đỏ)

#### C. Bảng dữ liệu & 5+1 Tab Chế độ xem (`HouseholdTable.tsx`):
- Tab điều chuyển góc nhìn:
  - Tab 1: `"Tổng Hợp"` (icon `Layers`, 7 cột bao quát: STT, Họ Tên, Thôn, Tổng Cây ha, Dược Liệu ha, Vật Nuôi con, Thủy Sản, Thao Tác)
  - Tab 2: `"Cây Trồng"` (icon `Trees`, các cột Cà phê hộ/khoán, Cao su hộ/khoán, Ăn quả, Mắc ca, Lúa nước, Cây khác)
  - Tab 3: `"Dược Liệu"` (icon `Flower2`, các cột Đinh lăng, Gừng, Nghệ, Sả, Tổng dược liệu)
  - Tab 4: `"Vật Nuôi"` (icon `PawPrint`, các cột Trâu, Bò, Tổng trâu bò, Heo, Gia cầm, Tổng đàn)
  - Tab 5: `"Thủy Sản"` (icon `Fish`, Cá ao m2/ha, Cá lồng bè, Tổng thủy sản)
  - Tab 6: `"Tất cả"` (icon `LayoutGrid`, đầy đủ ma trận 21 cột Excel)
- Dòng gợi ý: `"Mẹo: Bấm đúp vào dòng để xem & sửa nhanh 18 chỉ số"`
- Các cột cố định (Sticky Columns):
  - `Checkbox` (trái: `left-0`)
  - `STT` (trái: `left-10`)
  - `Họ và Tên Chủ Hộ` (trái: `left-[88px]` kèm bóng đổ mờ phân tách)
  - `Thao Tác` (phải: `sticky right-0` chứa nút Sửa `Edit3` và Xóa `Trash2`)
- Accordion mở rộng dòng: Bung toàn bộ chi tiết 18 chỉ tiêu, số điện thoại, địa chỉ, ghi chú, mã định danh, người tạo.

#### D. Form Nhập/Sửa Hộ Nông Nghiệp (`HouseholdModal.tsx`):
- Tiêu đề modal: `"Thêm Mới Hộ Nông Nghiệp"` hoặc `"Cập Nhật Hộ Dân: {fullName}"`
- Cảnh báo xung đột phiên bản (OCC Conflict Warning):
  - Tiêu đề: `"Xung đột dữ liệu (Phiên bản mới hơn đã tồn tại)"`
  - Nội dung: `"Hộ dân này vừa được cập nhật bởi một phiên làm việc khác. Vui lòng kiểm tra lại để tránh ghi đè dữ liệu cũ."`
- Nhóm thông tin chung:
  - Nhãn: `"Họ và tên chủ hộ *"`, `"Thôn trực thuộc *"`, `"Số điện thoại"`, `"Địa chỉ chi tiết"`, `"Ghi chú thêm"`
- 3 Tab chỉ tiêu nông nghiệp:
  - Tab 1: `"1. Cây Trồng (12 chỉ số)"` (icon `Trees`)
  - Tab 2: `"2. Vật Nuôi (4 chỉ số)"` (icon `PawPrint`)
  - Tab 3: `"3. Thủy Sản (2 chỉ số)"` (icon `Fish`)
- Chi tiết 18 chỉ số nông nghiệp:
  1. Cà phê gia đình (ha)
  2. Cà phê nhận khoán (ha)
  3. Cao su gia đình (ha)
  4. Cao su nhận khoán (ha)
  5. Cây ăn quả (ha)
  6. Cây Mắc ca (ha)
  7. Lúa nước (ha)
  8. Cây hàng năm khác (ha)
  9. Dược liệu - Đinh lăng (ha)
  10. Dược liệu - Gừng (ha)
  11. Dược liệu - Nghệ (ha)
  12. Dược liệu - Sả (ha)
  13. Đàn Trâu (con)
  14. Đàn Bò (con)
  15. Đàn Heo (con)
  16. Đàn Gia cầm (con)
  17. Nuôi cá ao hồ (ha / m²)
  18. Nuôi cá lồng bè (lồng)
- Nút thao tác: `"Hủy Bỏ"`, `"Lưu & Hoàn Tất"` / `"Đang lưu..."`

#### E. Bảng Đối Soát 21 Cột Excel (`ImportPreviewModal.tsx`):
- Tiêu đề: `"Preview Bảng Đối Soát 21 Cột – File {file.name}"`
- Dòng thống kê: `"Tệp: {file.name} • Tổng cộng {parsedData.length} dòng dữ liệu"`
- Nút bấm: `"Đổi Tệp Khác"`, `"Đóng"`, `"Xác Nhận Nhập {parsedData.length} Hộ"` / `"Đang xử lý..."`

#### F. Cài Đặt Xuất Excel (`ExportSettingsModal.tsx`):
- Tiêu đề: `"Cài Đặt Xuất File Excel"`
- Dòng phụ: `"Xuất biểu mẫu 21 chỉ số nông nghiệp chuẩn Xã Đăk Hà"`
- Tùy chọn phạm vi (Radio):
  - `"Toàn bộ hộ trong phạm vi"`
  - `"Chỉ xuất {selectedCount} hộ đã chọn"`
- Nút bấm: `"Hủy"`, `"Bắt đầu Xuất"` / `"Đang tạo..."`

#### G. Toast Hoàn Tác Xóa Nổi (Floating Undo Toast):
- Thông báo: `"Đã xóa {undoAction.ids.length} hộ nông nghiệp."`
- Nút bấm: `"HOÀN TÁC"` (hiệu lực trong 15 giây)

### 2.3. Ma trận các trạng thái hiển thị (All States)
| Trạng thái | Điều kiện kích hoạt | Hành vi & Giao diện hiển thị |
| :--- | :--- | :--- |
| **Default / Loaded** | Dữ liệu hộ nông nghiệp tải xong từ API | Bảng hiển thị đầy đủ dòng, các cột sticky, phân trang 20/50/100, định dạng số font Mono Tabular. |
| **Loading** | `loading === true` khi tìm kiếm, đổi trang, lọc | Hiển thị vòng xoay xanh `animate-spin` với dòng chữ `"Đang tải dữ liệu hộ nông nghiệp..."`. |
| **Empty Data** | Không có bản ghi nào (`total === 0`) | Thông báo trung tâm: `"Không tìm thấy hộ nông nghiệp nào"`. |
| **Active Filters** | Có nhập ô tìm kiếm hoặc chọn lọc Quy mô/Loại hình | Nút `"Xóa lọc"` màu hồng rose xuất hiện; tự động nhảy về trang 1. |
| **Selection Mode** | Người dùng tích chọn 1 hoặc nhiều hộ | Xuất hiện thanh tác vụ nổi bên phải với badge `"Đã chọn N hộ"`, nút Bỏ chọn, Xuất Excel và Xóa đỏ. |
| **Row Expanded** | Click nút mở rộng hoặc bấm `"Bung tất cả"` | Hiển thị khối phụ chi tiết đầy đủ 18 chỉ số, thông tin liên lạc và người cập nhật của từng hộ. |
| **OCC Conflict** | Phát hiện `version` trên server cao hơn `version` hiện tại | Form modal khóa thao tác lưu đè, hiện khung cảnh báo đỏ với nút tải lại số liệu mới. |
| **Offline Mode** | Mất kết nối internet hoặc backend 500 | Tự động đọc dữ liệu từ IndexedDB, hiện badge `"Ngoại tuyến (Offline Cache)"`, vô hiệu hóa nút Thêm/Nhập. |
| **500+ Records** | Dữ liệu quy mô lớn | Phân trang tự động điều tiết DOM (mặc định 20 dòng/trang), đảm bảo không đơ giật UI. |

### 2.4. API Calls, Handlers & State Bindings
- `householdApi.getHouseholds(params)`: Lọc theo thôn, từ khóa, quy mô, loại hình, sắp xếp, trang, giới hạn.
- `householdApi.create(data)`: Tạo mới hộ với 18 chỉ số.
- `householdApi.update(id, data)`: Cập nhật thông tin và 18 chỉ số kèm kiểm soát `version`.
- `householdApi.delete(id)`: Soft-delete hộ vào Thùng rác.
- `householdApi.bulkDelete(ids)`: Xóa mềm hàng loạt.
- `householdApi.restore(ids)`: Phục hồi hộ từ Thùng rác (hoàn tác).
- `excelApi.importExcel(file, villageId)`: Nhập dữ liệu bảng tính 21 cột.
- `excelApi.exportExcel(villageId, ids)`: Xuất file bảng tính Excel 21 cột.
- Cache IndexedDB: `households_{role}_{village}_{page}_{limit}_{search}_{scale}_{type}_{sort}`.

---

## 3. TRANG 3: THỐNG KÊ & PHÂN TÍCH NÔNG NGHIỆP (`AnalyticsPage.tsx` & `AnalyticsDashboard.tsx`)

### 3.1. Đường dẫn file & Thành phần phụ thuộc
- **Component điều hướng**: `src/pages/AnalyticsPage.tsx`
- **Component giao diện chính**: `src/components/analytics/AnalyticsDashboard.tsx`
- **Dependencies**: `src/AppContext.tsx`, `src/api/analyticsApi.ts`, `src/db/indexedDB.ts`, `src/utils/cryptoHelper.ts`, `lucide-react`.

### 3.2. Danh mục nhãn tiếng Việt, tiêu đề, nút bấm & huy hiệu (MUST BE PRESERVED)

#### A. Header & Bộ Lọc Phạm Vi (`AnalyticsDashboard.tsx`):
- Huy hiệu phạm vi thống kê: `{scopeName}` (ví dụ: `"Toàn xã"` hoặc `"Thôn 1"`, màu emerald in hoa)
- Huy hiệu ngoại tuyến: `"Ngoại tuyến"` (icon `Zap` vàng)
- Tiêu đề màn hình: `"Thống Kê"` (icon `BarChart3`)
- Dòng mô tả: `"Hệ thống 25 chỉ số thống kê diện tích cây trồng, tổng đàn vật nuôi và diện tích thủy sản"`
- Nút quay lại (chỉ hiện cho Admin khi đã chọn 1 thôn): `"Quay lại danh sách thôn"` (icon `ArrowLeft`)
- Nút làm mới: `aria-label="Làm mới số liệu"` (icon `RefreshCw`, xoay khi đang tải)

#### B. 4 Thẻ Hero KPI Tổng Hợp:
1. *Thẻ 1 - Tổng số hộ*:
   - Nhãn: `"TỔNG SỐ HỘ"`
   - Giá trị: `"{cryptoHelper.formatCount(overview.household_count, 'hộ')}"`
   - Phụ đề: `"Đã kê khai trong CSDL"` (Icon `Users`, màu indigo)
2. *Thẻ 2 - Tổng cây trồng*:
   - Nhãn: `"TỔNG CÂY TRỒNG"`
   - Giá trị: `"{cryptoHelper.formatArea(crops.total_crops_area)}"`
   - Phụ đề: `"12 chỉ tiêu diện tích"` (Icon `Trees`, màu emerald)
3. *Thẻ 3 - Tổng đàn vật nuôi*:
   - Nhãn: `"TỔNG ĐÀN VẬT NUÔI"`
   - Giá trị: `"{cryptoHelper.formatCount(livestock.total_animals, 'con')}"`
   - Phụ đề: `"4 loại gia súc, gia cầm"` (Icon `PawPrint`, màu hổ phách/amber)
4. *Thẻ 4 - Thủy sản*:
   - Nhãn: `"THỦY SẢN"`
   - Giá trị: `"{cryptoHelper.formatArea(aqua.fish_pond)}"`
   - Phụ đề: `"+ {cryptoHelper.formatCount(aqua.fish_cage, 'lồng')}"` (Icon `Fish`, màu sky)

#### C. Khối 1: Cơ Cấu Cây Trồng (12 Chỉ Số):
- Tiêu đề khối: `"1. Cơ Cấu Cây Trồng (Tổng: {cryptoHelper.formatArea(crops.total_crops_area)})"` (icon `Trees`)
- Biểu đồ Donut SVG Cà phê:
  - Tiêu đề thẻ: `"Cà Phê (Tổng Diện Tích)"`
  - Huy hiệu tổng diện tích: `"{cryptoHelper.formatArea(crops.total_cafe)}"`
  - Chú giải tỷ lệ cơ cấu:
    - `"Hộ gia đình"`: `{p1}%` - `cryptoHelper.formatArea(crops.cafe_household)` (màu vàng sẫm `#d97706`)
    - `"Nhận khoán"`: `{p2}%` - `cryptoHelper.formatArea(crops.cafe_contracted)` (màu vàng cam `#f59e0b`)
- Biểu đồ Donut SVG Cao su:
  - Tiêu đề thẻ: `"Cao Su (Tổng Diện Tích)"`
  - Huy hiệu tổng diện tích: `"{cryptoHelper.formatArea(crops.total_rubber)}"`
  - Chú giải tỷ lệ cơ cấu:
    - `"Hộ gia đình"`: `{p1}%` - `cryptoHelper.formatArea(crops.rubber_household)` (màu xanh ngọc `#059669`)
    - `"Nhận khoán"`: `{p2}%` - `cryptoHelper.formatArea(crops.rubber_contracted)` (màu xanh lá `#34d399`)
- 4 Thẻ Chỉ Số Cây Trồng Khác:
  - `"Cây ăn quả"`: `{cryptoHelper.formatArea(crops.fruit_tree)}` (phụ đề: `"Sầu riêng, mít, bơ, cam..."`)
  - `"Cây Mắc Ca"`: `{cryptoHelper.formatArea(crops.macadamia)}` (phụ đề: `"Cây công nghiệp giá trị cao"`)
  - `"Lúa nước"`: `{cryptoHelper.formatArea(crops.wet_rice)}` (phụ đề: `"Lúa 2 vụ / 1 vụ"`)
  - `"Cây hàng năm khác"`: `{cryptoHelper.formatArea(crops.other_annual_crops)}` (phụ đề: `"Ngô, sắn, khoai, hoa màu"`)
- Hộp Phân Rã Dược Liệu Đăk Hà (4 Loại Con):
  - Tiêu đề: `"Cây Dược Liệu Đăk Hà (4 Loại Con)"` (icon `Flower2`)
  - Mô tả: `"Cây trồng bản địa dược liệu thuộc đề án phát triển NTM xã Đăk Hà"`
  - Huy hiệu tổng: `"Tổng diện tích dược liệu"` - `"{cryptoHelper.formatArea(crops.total_herb_area)}"`
  - 4 Ô diện tích con: `"Đinh lăng"`, `"Gừng"`, `"Nghệ"`, `"Sả"`

#### D. Khối 2: Tổng Đàn Vật Nuôi (4 Loại Con):
- Tiêu đề khối: `"2. Tổng Đàn Vật Nuôi ({cryptoHelper.formatCount(livestock.total_animals, 'con')})"` (icon `PawPrint`)
- Thống kê gia súc lớn (Trâu, Bò):
  - Nhãn: `"Tổng Đàn Trâu Bò (Gia súc lớn):"`
  - Chi tiết: `"Trâu: {livestock.buffalo} con • Bò: {livestock.cow} con"`
  - Tổng số: `"{cryptoHelper.formatCount(livestock.total_cattle, 'con')}"`
- 4 Thanh Tiến Độ (Progress Bars):
  - `"Đàn Gia Cầm (Gà, Vịt, Ngan)"`: `livestock.poultry` con (thanh màu hổ phách `bg-amber-500`)
  - `"Đàn Heo"`: `livestock.pig` con (thanh màu hồng đỏ `bg-rose-500`)
  - `"Đàn Bò"`: `livestock.cow` con (thanh màu nâu vàng `bg-amber-600`)
  - `"Đàn Trâu"`: `livestock.buffalo` con (thanh màu xám đậm `bg-slate-600`)

#### E. Khối 3: Nuôi Trồng Thủy Sản:
- Tiêu đề khối: `"3. Nuôi Trồng Thủy Sản"` (icon `Fish`)
- 2 Thẻ Chỉ Số:
  - Thẻ 1: `"Nuôi Cá Ao Hồ (Diện tích)"` - `{cryptoHelper.formatArea(aqua.fish_pond)}` (mô tả: `"Mặt nước nuôi thả cá truyền thống"`)
  - Thẻ 2: `"Nuôi Cá Lồng Bè (Số lồng)"` - `{cryptoHelper.formatCount(aqua.fish_cage, 'lồng')}` (mô tả: `"Lồng nuôi cá trên lòng hồ thủy điện"`)
- Chú thích chân trang: `"* Số liệu được cập nhật theo thời gian thực từ CSDL."`

#### F. Khối 4: Bảng So Sánh Số Liệu Các Thôn (Admin Only):
- Tiêu đề: `"4. Bảng so sánh số liệu các thôn"` (icon `Building2`)
- Mô tả: `"So sánh 25 chỉ tiêu nông thôn mới"`
- Nút xuất file: `"Xuất Excel"` (icon `Download`, xuất file `BangSoSanhCacThon_*.xlsx`)
- Tiêu đề 12 cột so sánh: `Tên Thôn`, `Số Hộ`, `Cà Phê (ha)`, `Cao Su (ha)`, `Cây Ăn Quả`, `Dược Liệu`, `Tổng Cây (ha)`, `Trâu Bò (con)`, `Heo (con)`, `Gia Cầm (con)`, `Cá Ao (ha)`, `Cá Lồng`

### 3.3. Ma trận các trạng thái hiển thị (All States)
| Trạng thái | Điều kiện kích hoạt | Hành vi & Giao diện hiển thị |
| :--- | :--- | :--- |
| **Default / Loaded** | Dữ liệu thống kê tính toán hoàn tất | Hiển thị đầy đủ 4 Hero KPI, 2 biểu đồ Donut SVG, 4 thẻ cây trồng, hộp dược liệu, tiến độ đàn gia súc, thẻ thủy sản và bảng so sánh 7 thôn. |
| **Loading** | `loading === true` và chưa có `overview` | Màn hình chờ chuyên dụng với spinner xoay: `"Đang tổng hợp 25 chỉ số Nông thôn mới... / Đồng bộ số liệu diện tích và đàn vật nuôi xã Đăk Hà"`. |
| **Empty Data** | `overview === null` sau khi tải xong | Thông báo: `"Chưa có số liệu thống kê. Vui lòng nhập dữ liệu hộ nông nghiệp."`. |
| **Zero Donut Data** | `total <= 0` trong Donut Chart | Hiển thị chữ nghiêng màu xám: `"Chưa có số liệu diện tích"`, không bị lỗi chia cho 0 (`NaN%`). |
| **Village Scoped** | Xem thống kê của 1 thôn cụ thể | Header đổi tên thôn tương ứng, bảng so sánh các thôn tự động ẩn đi; xuất hiện nút `"Quay lại danh sách thôn"`. |
| **Offline Mode** | Mất kết nối mạng | Nạp từ IndexedDB cache `analytics_overview_*` và `analytics_villageData`, hiển thị huy hiệu `"Ngoại tuyến"`. |

### 3.4. API Calls, Handlers & State Bindings
- `analyticsApi.getOverview(targetVillage)`: Lấy dữ liệu 25 chỉ số của toàn xã hoặc 1 thôn được chỉ định.
- `analyticsApi.getByVillage()`: Lấy ma trận dữ liệu phân rã của 7 thôn cho bảng so sánh.
- `analyticsApi.exportComparison()`: Tải file Excel so sánh các chỉ tiêu NTM giữa các thôn.
- IndexedDB Cache: `analytics_overview_{targetVillage}`, `analytics_villageData`.
- Phản ứng mạng: Tự động chạy lại `loadData()` khi nhận sự kiện `server:reconnected`.

---

## 4. TRANG 4: THÙNG RÁC DỮ LIỆU (`RecycleBinPage.tsx` & `RecycleBinTable.tsx`)

### 4.1. Đường dẫn file & Thành phần phụ thuộc
- **Component điều hướng**: `src/pages/RecycleBinPage.tsx`
- **Component bảng dữ liệu**: `src/components/households/RecycleBinTable.tsx`
- **Dependencies**: `src/AppContext.tsx`, `src/api/householdApi.ts`, `src/hooks/useModal.tsx`, `src/components/common/TablePagination.tsx`, `src/utils/cryptoHelper.ts`.

### 4.2. Danh mục nhãn tiếng Việt, tiêu đề, nút bấm & huy hiệu (MUST BE PRESERVED)

#### A. Header & Top Banner (`RecycleBinPage.tsx`):
- Huy hiệu số lượng: `"Thùng Rác ({pagination.total})"` (màu rose đỏ)
- Tiêu đề màn hình: `"Thùng Rác Hộ Nông Nghiệp"` (icon `Trash2` màu rose)
- Dòng mô tả: `"Quản lý các hộ dân đã xóa tạm, hỗ trợ khôi phục nguyên trạng hoặc xóa vĩnh viễn"`
- Nút điều hướng: `"Về danh sách Hộ Nông Nghiệp"` (icon `ArrowLeft`)
- Nút làm mới: `"Làm mới"` (icon `RefreshCw`, xoay khi `loading`)
- Cụm tác vụ hàng loạt khi có chọn dòng (`selectedIds.length > 0`):
  - Nút phục hồi hàng loạt: `"Khôi Phục ({selectedIds.length})"` (icon `RotateCcw`, màu emerald)
  - Nút xóa vĩnh viễn hàng loạt (Admin only): `"Xóa Vĩnh Viễn ({selectedIds.length})"` (icon `Trash2`, màu rose)

#### B. Bảng Dữ Liệu 21 Cột Thùng Rác (`RecycleBinTable.tsx`):
- Cấu trúc tiêu đề 2 tầng (Two-tier Header) bảo toàn ma trận 21 chỉ số:
  - Tầng 1: `Checkbox`, `STT`, `Họ và Tên Chủ Hộ`, `Thôn Quản Lý`, `"1. Cây Trồng Chính (ha)"` (colSpan 8), `"2. Dược Liệu Đăk Hà (ha)"` (colSpan 4), `"3. Đàn Vật Nuôi (con)"` (colSpan 4), `"4. Thủy Sản"` (colSpan 2), `Thao Tác`
  - Tầng 2: Cà phê (Hộ), Cà phê (Khoán), Cao su (Hộ), Cao su (Khoán), Ăn quả, Mắc ca, Lúa nước, Hàng năm | Đinh lăng, Gừng, Nghệ, Sả | Trâu, Bò, Heo, Gia cầm | Cá ao (ha), Cá lồng (lồng)
- Tác vụ trên từng dòng (Sticky Action Column):
  - Nút khôi phục: `title="Khôi phục hồ sơ này"`, `aria-label="Khôi phục hộ"`, icon `RotateCcw`
  - Nút xóa vĩnh viễn: `title="Xóa vĩnh viễn"`, `aria-label="Xóa hộ"`, icon `Trash2` (chỉ hiển thị khi `canDelete === true`)
- Huy hiệu màu sắc theo thôn: Giữ nguyên ánh xạ màu badge riêng cho từng thôn (`Thôn 1` đến `Thôn 5`, `Thôn Đăk Kđêm`, `Thôn Kon Bơ Bắn`).
- Thanh phân trang chân bảng: `TablePagination` với lựa chọn số dòng/trang và chuyển trang.

#### C. Hộp thoại xác nhận & cảnh báo:
- Cảnh báo xóa vĩnh viễn: `"Cảnh báo: Hành động này sẽ xóa vĩnh viễn dữ liệu và không thể khôi phục! Bạn có chắc chắn?"`
- Hộp thoại lỗi: `"Lỗi tải danh sách đã xóa"`, `"Lỗi khôi phục"`, `"Lỗi xóa vĩnh viễn"`

### 4.3. Ma trận các trạng thái hiển thị (All States)
| Trạng thái | Điều kiện kích hoạt | Hành vi & Giao diện hiển thị |
| :--- | :--- | :--- |
| **Default / Loaded** | API trả về danh sách các hộ đã bị xóa tạm | Bảng 21 cột hiển thị đầy đủ, font Mono Tabular cho các chỉ số, checkbox từng dòng và checkbox chọn tất cả. |
| **Loading** | `loading === true` trong quá trình tải hoặc thao tác | Vô hiệu hóa tương tác tạm thời, nút Làm mới xoay vòng. |
| **Empty Trash** | `pagination.total === 0` | Bảng hiển thị thông điệp rỗng sạch sẽ, không có dòng dữ liệu nào. |
| **Selection Active** | Chọn 1 hoặc nhiều hộ trong thùng rác | Cụm nút tác vụ Khôi Phục (N) và Xóa Vĩnh Viễn (N) xuất hiện trên thanh banner. |
| **RBAC Non-Admin** | Cán bộ thôn truy cập Thùng rác | Ẩn hoàn toàn nút `"Xóa Vĩnh Viễn"` (cả đơn lẻ và hàng loạt); chỉ cho phép Khôi phục lại dữ liệu. |
| **Cascade Restore** | Người dùng bấm Khôi phục | Khôi phục nguyên vẹn thông tin chủ hộ, đồng thời phục hồi toàn bộ 18 chỉ số cây trồng, vật nuôi liên đới. |

### 4.4. API Calls, Handlers & State Bindings
- `householdApi.getDeleted({ page, limit })`: Lấy danh sách hộ đã soft-delete kèm phân trang.
- `householdApi.restore(ids)`: Khôi phục 1 hoặc nhiều hộ về danh sách chính.
- `householdApi.hardDelete(ids)`: Xóa vĩnh viễn bản ghi khỏi CSDL PostgreSQL (yêu cầu xác thực quyền Admin).
- Quản lý state chọn: `selectedIds`, `handleToggleSelect`, `handleToggleSelectAll`.

---

## 5. TRANG 5: CÀI ĐẶT HỆ THỐNG & SAO LƯU (`SettingsPage.tsx` & `BackupRestoreTab.tsx`)

### 5.1. Đường dẫn file & Thành phần phụ thuộc
- **Component trang chính**: `src/pages/SettingsPage.tsx`
- **Component tab sao lưu**: `src/components/settings/BackupRestoreTab.tsx`
- **Dependencies**: `src/AppContext.tsx`, `src/api/authApi.ts`, `src/api/apiClient.ts`, `src/hooks/useModal.tsx`, `src/utils/secureStorage.ts`, `src/components/common/CustomSelect.tsx`.

### 5.2. Danh mục nhãn tiếng Việt, tiêu đề, nút bấm & huy hiệu (MUST BE PRESERVED)

#### A. Thanh 4 Tab Điều Hướng Chuẩn (`SettingsPage.tsx`):
1. Tab 1: `"Tài Khoản Của Tôi"` (icon `User`, key `profile`)
2. Tab 2: `"Quản Lý Cán Bộ Thôn"` (icon `Users`, key `users`, chỉ hiển thị cho Admin)
3. Tab 3: `"Sao Lưu CSDL"` (icon `Database`, key `backup`, chỉ hiển thị cho Admin)
4. Tab 4: `"Thông Tin Đơn Vị & Hệ Thống"` (icon `Building2`, key `system`)

#### B. TAB 1: TÀI KHOẢN CỦA TÔI
- Khối 1 - Thông tin tài khoản:
  - Avatar viết tắt: 2 chữ cái đầu in hoa của username (ví dụ: `"AD"`, `"CB"`)
  - Huy hiệu trạng thái: `"Hoạt động"` (chấm xanh lục nhấp nháy)
  - Phân loại vai trò: `"Quản trị viên Xã (Admin)"` hoặc `"Cán bộ phụ trách Thôn"`
  - Chi tiết công tác:
    - `"Vai trò hệ thống:"` -> `"Cán bộ Quản trị Xã"` hoặc `"Cán bộ Cơ sở"` (icon `Shield`)
    - `"Đơn vị công tác:"` -> `"UBND Xã Đăk Hà"` (icon `Home`)
    - `"Địa bàn quản lý:"` -> `"Toàn xã Đăk Hà"` hoặc Tên thôn phụ trách (icon `MapPin`)
  - Nút đăng xuất: `"Đăng Xuất Khỏi Hệ Thống"` (icon `LogOut`, nền hồng rose)
- Khối 2 - Đổi mật khẩu cá nhân:
  - Tiêu đề: `"Đổi Mật Khẩu Cá Nhân"` (icon `KeyRound`)
  - Mô tả: `"Bảo vệ an toàn tài khoản bằng mật khẩu có độ dài tối thiểu 6 ký tự"`
  - Nhãn trường: `"Mật Khẩu Mới *"`, `"Xác Nhận Mật Khẩu Mới *"` (có nút ẩn/hiện mật khẩu icon `Eye`/`EyeOff`)
  - Nút lưu: `"Lưu Mật Khẩu Mới"` / `"Đang cập nhật..."`

#### C. TAB 2: QUẢN LÝ CÁN BỘ THÔN (Admin Only)
- Tiêu đề danh mục: `"Danh Sách Cán Bộ Phụ Trách Thôn"`
- Mô tả: `"Phân công tài khoản cán bộ phụ trách thống kê nông nghiệp cho 7 thôn"`
- Nút thêm mới: `"Thêm Cán Bộ"` (icon `Plus`)
- Bảng danh sách cán bộ:
  - Tiêu đề cột: `Tên đăng nhập`, `Họ và tên`, `Vai trò`, `Thôn phụ trách`, `Ngày tạo`, `Thao tác`
  - Tác vụ từng dòng:
    - Nút phân công địa bàn: `title="Phân công thôn"`, icon `MapPin`
    - Nút đặt lại mật khẩu: `title="Đặt lại mật khẩu"`, icon `KeyRound`
    - Nút xóa tài khoản: `title="Xóa tài khoản"`, icon `Trash2`
- Modal Thêm Cán Bộ:
  - Tiêu đề: `"Thêm Tài Khoản Cán Bộ"`
  - Trường nhập: `"Tên đăng nhập *"`, `"Mật khẩu ban đầu *"`, `"Vai trò *"`, `"Phân công thôn phụ trách"`
  - Nút bấm: `"Hủy"`, `"Tạo Tài Khoản"`
- Modal Đặt Lại Mật Khẩu Cán Bộ:
  - Tiêu đề: `"Đặt Lại Mật Khẩu Cán Bộ: {resetPwdUser?.username}"`
  - Trường nhập: `"Mật khẩu mới *"`
  - Nút bấm: `"Hủy"`, `"Xác Nhận Đổi"`
- Modal Phân Công Công Tác:
  - Tiêu đề: `"Phân Công Công Tác: {assignUser?.username}"`
  - Trường chọn: `"Vai trò"`, `"Thôn phụ trách"`
  - Nút bấm: `"Hủy"`, `"Lưu Phân Công"`

#### D. TAB 3: SAO LƯU CSDL (`BackupRestoreTab.tsx` - Admin Only)
- Tiêu đề khối: `"Sao lưu & Khôi phục Dữ liệu"` (icon `Database`)
- Mô tả: `"Quản lý xuất bản sao lưu toàn bộ cơ sở dữ liệu hệ thống hoặc khôi phục dữ liệu từ bản lưu trữ."`
- Khối Xuất Bản Sao Lưu (Export - Màu Emerald):
  - Tiêu đề: `"Tải xuống Bản sao lưu (Export Database)"` (icon `Download`)
  - Mô tả: `"Tải về toàn bộ cơ sở dữ liệu hệ thống (JSON) gồm danh sách hộ nông nghiệp, chỉ tiêu NTM, phân quyền tài khoản và nhật ký hoạt động để lưu trữ an toàn hoặc chuyển đổi thiết bị."`
  - Nút bấm: `"Xuất Database (.json)"`
- Khối Khôi Phục Dữ Liệu (Restore - Màu Rose Cảnh Báo):
  - Tiêu đề: `"Khôi phục Dữ liệu Hệ thống (Restore Database)"` (icon `UploadCloud`)
  - Huy hiệu: `"CẢNH BÁO"` (icon `AlertTriangle`)
  - Mô tả: `"Lưu ý: Hành động này sẽ ghi đè toàn bộ dữ liệu hiện tại trên hệ thống bằng nội dung từ tệp sao lưu. Vui lòng đảm bảo bạn đã tạo bản sao lưu dự phòng trước khi tiến hành."`
  - Nút bấm: `"Nhập Database (.json)"`
- Modal Xác Thực Mật Khẩu Admin (Bảo vệ P0 chống ghi đè nhầm):
  - Tiêu đề: `"Xác Nhận Mật Khẩu Quản Trị Viên"`
  - Mô tả: `"Thao tác phục hồi CSDL sẽ ghi đè toàn bộ dữ liệu. Nhập mật khẩu tài khoản Admin để xác nhận."`
  - Trường nhập: `placeholder="Nhập mật khẩu Admin..."`
  - Nút bấm: `"Hủy"`, `"Bắt đầu Phục Hồi"` / `"Đang xử lý..."`
- Ghi chú bảo mật chân trang: `"Cơ sở dữ liệu lưu trữ tại máy chủ PostgreSQL nội bộ kết hợp đệm ngoại tuyến IndexedDB trên thiết bị."`

#### E. TAB 4: THÔNG TIN ĐƠN VỊ & HỆ THỐNG
- Khối 1 - Thông tin đơn vị quản lý:
  - Tiêu đề: `"Thông Tin Đơn Vị Quản Lý"`
  - Các trường dữ liệu: `"Tên xã / Phường"`, `"Huyện / Thị xã"`, `"Tỉnh / Thành phố"`, `"Địa chỉ trụ sở"`, `"Số điện thoại liên hệ"`, `"Hộp thư điện tử (Email)"`
  - Nút bấm: `"Lưu Thông Tin Đơn Vị"`
- Khối 2 - Thông tin bản quyền phần mềm:
  - Tiêu đề: `"Phần Mềm Quản Lý Nông Nghiệp & Nông Thôn Mới (QLNN)"`
  - Phiên bản: `"Phiên bản 1.0.0 (Bản quyền UBND Xã Đăk Hà)"`
  - Thông số công nghệ: React 18, Vite, Electron, PostgreSQL, Prisma, Tailwind v4.

### 5.3. Ma trận các trạng thái hiển thị (All States)
| Trạng thái | Điều kiện kích hoạt | Hành vi & Giao diện hiển thị |
| :--- | :--- | :--- |
| **Default / Loaded** | Mở từng tab cài đặt | Giao diện hiển thị chuẩn xác form tương ứng với phân quyền hiện tại. |
| **Role Restriction** | Cán bộ cơ sở (`role !== "admin"`) | Ẩn hoàn toàn Tab 2 ("Quản Lý Cán Bộ Thôn") và Tab 3 ("Sao Lưu CSDL"). |
| **Admin Self-Delete Guard** | Admin click xóa chính tài khoản đang đăng nhập | Bật cảnh báo: `"Không thể tự xóa tài khoản đang đăng nhập."`. |
| **Password Validation** | Nhập mật khẩu < 6 ký tự hoặc không khớp | Modal cảnh báo: `"Mật khẩu yếu"` hoặc `"Mật khẩu xác nhận không trùng khớp."`. |
| **Restore Security Challenge** | Chọn file JSON để phục hồi CSDL | Mở popup yêu cầu nhập mật khẩu Admin; chỉ giải mã và gửi request khi mật khẩu hợp lệ. |
| **Post-Restore Event** | Khôi phục dữ liệu thành công | Phát sự kiện `window.dispatchEvent("auth:expired")` yêu cầu đăng nhập lại để đảm bảo tính toàn vẹn session. |

### 5.4. API Calls, Handlers & State Bindings
- `authApi.updatePassword(id, password)`: Đổi mật khẩu cá nhân hoặc đặt lại cho cán bộ.
- `apiClient.get("/users")`: Lấy danh sách tài khoản.
- `apiClient.post("/users", ...)`: Thêm tài khoản mới.
- `apiClient.put("/users/:id", ...)`: Cập nhật quyền và phân công thôn.
- `apiClient.delete("/users/:id")`: Xóa tài khoản.
- `fetch("/api/backup/export")`: Xuất snapshot CSDL dạng file JSON.
- `fetch("/api/backup/restore")`: Gửi payload phục hồi CSDL kèm trường `admin_password`.

---

## 6. PHỤ LỤC A: THÀNH PHẦN NHẬT KÝ HOẠT ĐỘNG (`AuditLogView.tsx`)

Mặc dù không nằm trong danh sách 5 trang chính, `AuditLogView.tsx` là một màn hình quan trọng thuộc phân hệ kiểm toán dữ liệu và đã được tích hợp trong hệ thống:
- **Đường dẫn**: `src/components/audit/AuditLogView.tsx`
- **Nội dung & Tính năng cần bảo toàn**:
  - Tiêu đề: `"Nhật Ký Biến Động Nông Nghiệp"`
  - Bộ lọc sự kiện: `"Tất cả"`, `"Thêm mới"`, `"Cập nhật"`, `"Xóa"`, `"Khôi phục"`, `"Nhập Excel"`
  - Lọc theo cán bộ, thôn, khoảng thời gian.
  - Bảng đối soát so sánh giá trị cũ (gạch ngang màu đỏ) và giá trị mới (in đậm màu xanh) cho toàn bộ 18 chỉ tiêu nông nghiệp.

---

## 7. BẢNG TỔNG HỢP TRẠNG THÁI & MA TRẬN XỬ LÝ (STATES & EDGE CASES MATRIX)

```
+---------------------+-------------------+-------------------+-------------------+-------------------+-------------------+
| TRANG / MÀN HÌNH    | DEFAULT / LOADED  | LOADING STATE     | EMPTY STATE       | ERROR / OFFLINE   | EDGE CASES        |
+---------------------+-------------------+-------------------+-------------------+-------------------+-------------------+
| 1. VillagesPage     | 4 KPI cards +     | Disabled opacity  | 0 thôn (fallback  | IndexedDB cache   | Tên thôn dài;     |
|                     | 7 thẻ thôn        | trên nút bấm      | hiển thị 0)       | fallback          | Officer ẩn nút    |
+---------------------+-------------------+-------------------+-------------------+-------------------+-------------------+
| 2. HouseholdsPage   | Bảng 18 chỉ tiêu  | Spinner overlay   | "Không tìm thấy   | Offline badge;    | OCC conflict;     |
|                     | + 6 view tabs     | + loading text    | hộ nào"           | chặn nút thêm mới | >500 dòng pagin.  |
+---------------------+-------------------+-------------------+-------------------+-------------------+-------------------+
| 3. AnalyticsPage    | 4 KPI + Donut SVG | Màn hình chờ 25   | "Chưa có số liệu  | IndexedDB cache;  | Donut = 0 (NaN);  |
|                     | + Bảng so sánh    | chỉ tiêu NTM      | thống kê"         | huy hiệu Offline  | Phân quyền so sánh|
+---------------------+-------------------+-------------------+-------------------+-------------------+-------------------+
| 4. RecycleBinPage   | Bảng 21 cột       | Refresh spinner   | Bảng rỗng         | Toast thông báo   | Officer không     |
|                     | soft-deleted      |                   | sạch sẽ           | lỗi thao tác      | được hard-delete  |
+---------------------+-------------------+-------------------+-------------------+-------------------+-------------------+
| 5. SettingsPage     | 4 Tabs theo       | Nút "Đang lưu..." | Bảng cán bộ       | Chặn tự xóa;      | Thách thức mật    |
|                     | phân quyền        |                   | trống             | kiểm tra mật khẩu | khẩu Admin CSDL   |
+---------------------+-------------------+-------------------+-------------------+-------------------+-------------------+
```

---

## 8. CÁC ĐỀ XUẤT NÂNG CẤP GIAO DIỆN (PROPOSALS)

*(Theo Nguyên tắc bất biến: Chỉ sao chép FORM, giữ nguyên CONTENT. Những điểm tham chiếu QLHK có nhưng QLNN chưa có hoặc cần tối ưu được ghi nhận tại đây để xem xét phê duyệt, KHÔNG tự ý đưa vào mã nguồn nghiệp vụ)*

1. **Đề xuất 1 - Drawer Slide-Over cho Form Hộ Dân**:
   - *Hiện trạng QLNN*: Form hộ dân (`HouseholdModal.tsx`) đang dùng dạng Modal trung tâm kích thước lớn (`max-w-4xl`), dễ che khuất bảng dữ liệu nền.
   - *Tham chiếu QLHK*: Sử dụng dạng Drawer trượt từ mép phải màn hình (`HouseholdDrawer.tsx` `max-w-2xl`) với thanh hành động dính (Sticky Action Bar).
   - *Khuyến nghị*: Chuyển đổi lớp bọc ngoài thành Drawer theo pattern QLHK, giữ nguyên 100% 18 trường nhập và 3 tab nông nghiệp.

2. **Đề xuất 2 - Bộ lọc dạng đảo nổi (Island Filter Bar)**:
   - *Hiện trạng QLNN*: `HouseholdFilterBar.tsx` đã khá gọn gàng nhưng cần đồng bộ hoàn toàn bán kính bo góc `rounded-2xl` và màu nền với QLHK.
   - *Tham chiếu QLHK*: Thanh lọc dạng Island với phân cách tinh tế giữa ô tìm kiếm, dropdown CustomSelect và nút reset.

3. **Đề xuất 3 - Đồng bộ biểu đồ Donut SVG**:
   - *Hiện trạng QLNN*: Đã có component `MiniDonut` viết bằng SVG nội tuyến rất nhẹ.
   - *Tham chiếu QLHK*: Đã tối ưu về đường nét tròn `strokeLinecap="round"` và hiệu ứng số đếm ở tâm.
   - *Khuyến nghị*: Giữ nguyên công thức tính toán nông nghiệp, áp dụng các token màu sắc `emerald-500` và `amber-500` của QLHK.

4. **Đề xuất 4 - Typography & Bảng số liệu Font JetBrains Mono**:
   - *Khuyến nghị*: Đảm bảo 100% các giá trị diện tích (ha) và số lượng đàn (con) trong các bảng và thẻ sử dụng lớp `font-mono tabular-nums` để các hàng số căn thẳng tắp theo trục dọc chuẩn hành chính công.
