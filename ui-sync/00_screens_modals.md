# DANH MỤC TOÀN DIỆN MODALS, DRAWERS, FILTERBARS & DATA TABLES (QLNN)

> **Mã nhiệm vụ**: `P0-INVENTORY-MODALS`  
> **Người thực hiện**: Subagent `A-inv-modals` (Modals & Data Inventory Specialist)  
> **Nguyên tắc bất biến**: COPY FORM ONLY, KEEP CONTENT INTACT  
> - **FORM (sao chép từ QLHK)**: Design tokens (màu sắc, bề mặt, viền, bo góc, bóng đổ, khoảng cách, font chữ, kích cỡ chữ, icons), layout khung, interaction patterns, animations, density, responsive rules.  
> - **CONTENT (giữ nguyên từ QLNN)**: Tên màn hình, nhãn tiếng Việt, dữ liệu, 18 chỉ tiêu nông nghiệp, 21 cột Excel, bộ lọc, nút bấm, tính năng, logic, APIs, trạng thái, phân quyền.  
> **File xuất**: `C:\Users\umnuar\Documents\Projects\QLNN\ui-sync\00_screens_modals.md`  
> **Thời điểm lập danh mục**: Tháng 10/2026  

---

## MỤC LỤC DANH MỤC THÀNH PHẦN

1. [HouseholdFilterBar.tsx](#1-householdfilterbartsx) — Thanh lọc đảo & Tác vụ hàng loạt hộ nông nghiệp
2. [HouseholdTable.tsx](#2-householdtabletsx) — Bảng dữ liệu chính với 5 View Modes & 18 Chỉ số
3. [HouseholdModal.tsx](#3-householdmodaltsx) — Modal thêm/sửa hộ, tab 18 chỉ số & xử lý OCC 409
4. [ImportPreviewModal.tsx](#4-importpreviewmodaltsx) — Modal đối soát Smart-Upsert 21 cột Excel
5. [ExportSettingsModal.tsx](#5-exportsettingsmodaltsx) — Modal cài đặt phạm vi xuất Excel
6. [CustomSelect.tsx](#6-customselecttsx) — Thành phần Dropdown chọn lọc độc lập OS & Auto-flip
7. [TablePagination.tsx](#7-tablepaginationtsx) — Thanh phân trang bảng chuẩn
8. [AuditLogView.tsx](#8-auditlogviewtsx) — Màn hình & Dòng thời gian kiểm soát biến động dữ liệu
9. [Thành phần bổ trợ phát hiện](#9-thành-phần-bổ-trợ-phát-hiện-bổ-sung) (RecycleBinTable, ServerStatusModal, useModal)
10. [Ma trận bảo toàn nội dung vs Đề xuất đồng bộ Form](#10-ma-trận-bảo-toàn-nội-dung-vs-đề-xuất-đồng-bộ-form)

---

## 1. HouseholdFilterBar.tsx

### 1.1. Thông tin chung
- **Đường dẫn tệp**: `C:\Users\umnuar\Documents\Projects\QLNN\QLNN-Client\src\components\households\HouseholdFilterBar.tsx`
- **Vai trò**: Khung đảo lọc dữ liệu (Island filter container) đặt trên đầu danh sách hộ nông nghiệp. Cho phép tìm kiếm tức thì, lọc theo quy mô canh tác, loại hình sản xuất, thứ tự sắp xếp, bung/thu gọn toàn bộ chi tiết, xóa nhanh bộ lọc và thực thi các tác vụ hàng loạt trên các hộ được chọn.

### 1.2. Nhãn tiếng Việt, Placeholder & Giá trị (BẮT BUỘC BẢO TOÀN)
- **Ô tìm kiếm**:
  - Placeholder: `"Tìm theo họ tên chủ hộ..."`
  - `aria-label`: `"Tìm theo họ tên chủ hộ"`
  - Nút xóa tìm kiếm (`aria-label`): `"Xóa tìm kiếm"`
  - Nút làm mới danh sách (`aria-label` / `title`): `"Làm mới danh sách"`
- **Bộ lọc Quy mô canh tác (`SCALE_OPTIONS`)**:
  - Placeholder: `"Tất cả quy mô"`
  - `"all"`: `"Tất cả quy mô"`
  - `"large"`: `"Lớn (> 2ha / > 15 con)"`
  - `"medium"`: `"Vừa (0.5 - 2ha)"`
  - `"small"`: `"Nhỏ lẻ (< 0.5ha)"`
- **Bộ lọc Loại hình sản xuất (`TYPE_OPTIONS`)**:
  - Placeholder: `"Tất cả loại hình"`
  - `"all"`: `"Tất cả loại hình"`
  - `"contracted"`: `"Có nhận khoán"`
  - `"herbs"`: `"Trồng dược liệu"`
  - `"livestock"`: `"Chăn nuôi gia súc"`
  - `"aquaculture"`: `"Nuôi trồng thủy sản"`
- **Bộ lọc Thứ tự sắp xếp (`SORT_OPTIONS`)**:
  - Placeholder: `"Mặc định (STT)"`
  - `"default"`: `"Mặc định (STT)"`
  - `"crops_desc"`: `"Diện tích cây trồng ↓"`
  - `"livestock_desc"`: `"Tổng đàn vật nuôi ↓"`
  - `"name_asc"`: `"Tên chủ hộ A → Z"`
  - `"name_desc"`: `"Tên chủ hộ Z → A"`
- **Nút Bung / Thu gọn tất cả chi tiết**:
  - Khi chưa bung: `"Bung tất cả"` (`aria-label` / `title`: `"Bung tất cả chi tiết"`)
  - Khi đã bung: `"Thu gọn tất cả"` (`aria-label` / `title`: `"Thu gọn tất cả chi tiết"`)
- **Nút Xóa bộ lọc**:
  - Nhãn hiển thị: `"Xóa lọc"`
  - `aria-label`: `"Xóa bộ lọc"`
  - `title`: `"Xóa bộ lọc về mặc định"`
- **Cụm tác vụ hàng loạt (Batch Actions)**:
  - Huy hiệu số lượng: `"Đã chọn {selectedCount} hộ"`
  - Nút bỏ chọn: `"Bỏ chọn"` (`aria-label`: `"Bỏ chọn tất cả hộ"`)
  - Nút xuất Excel: `"Xuất Excel"` (`aria-label`: `"Xuất dữ liệu các hộ đã chọn"`)
  - Nút xóa: `"Xóa"` (`aria-label`: `"Xóa các hộ đã chọn"`)

### 1.3. Các trạng thái giao diện (States)
1. **Default State**:
   - `search === ""`, `scaleFilter === "all"`, `typeFilter === "all"`, `sortBy === "default"`.
   - `selectedCount === 0`: Cụm tác vụ hàng loạt ẩn hoàn toàn.
   - Nút `"Xóa lọc"` ẩn (do `hasActiveFilter === false`).
2. **Filtering State (`hasActiveFilter === true`)**:
   - Khi có bất kỳ tiêu chí nào khác mặc định: Nút `"Xóa lọc"` (màu rose nhẹ, icon `RotateCcw`) xuất hiện ngay sau nút bung chi tiết.
   - Khi `search !== ""`: Nút xóa nhanh `X` xuất hiện trong ô input kèm đường phân cách dọc mỏng.
3. **Loading State (`loading === true`)**:
   - Icon `RefreshCw` quay liên tục (`animate-spin text-emerald-600 dark:text-emerald-400`).
4. **Batch Selection Active State (`selectedCount > 0`)**:
   - Kích hoạt cụm `ml-auto flex items-center gap-2`:
     - Badge emerald: `"Đã chọn {selectedCount} hộ"`
     - Nút `"Bỏ chọn"` (trắng / xám viền mỏng)
     - Nút `"Xuất Excel"` (nền emerald-600, icon `Download`)
     - Nút `"Xóa"` (nền rose-600, icon `Trash2`)
5. **Expanded All State (`isAllExpanded === true`)**:
   - Nút Bung/Thu gọn đổi style sang nền `bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 border-emerald-300/80`.
6. **Responsive / Mobile Edge Cases**:
   - Container dạng `flex flex-wrap items-center gap-2`.
   - Thu nhỏ màn hình: Ẩn bớt text chữ trên nút Bung/Thu gọn, giữ lại icon `ChevronsUpDown`.
   - Cụm tác vụ dồn xuống dòng tiếp theo nếu tràn chiều ngang.

### 1.4. Props & Data Model
```typescript
export type ScaleFilter = "all" | "large" | "medium" | "small";
export type ProductionTypeFilter = "all" | "contracted" | "herbs" | "livestock" | "aquaculture";
export type SortOption = "default" | "crops_desc" | "livestock_desc" | "name_asc" | "name_desc";

export interface HouseholdFilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  loading: boolean;
  onRefresh: () => void;
  scaleFilter?: ScaleFilter;
  setScaleFilter?: (val: ScaleFilter) => void;
  typeFilter?: ProductionTypeFilter;
  setTypeFilter?: (val: ProductionTypeFilter) => void;
  sortBy?: SortOption;
  setSortBy?: (val: SortOption) => void;
  isAllExpanded?: boolean;
  onToggleExpandAll?: () => void;
  onResetFilters?: () => void;
  selectedCount?: number;
  onDeselectAll?: () => void;
  onExportSelected?: () => void;
  onDeleteSelected?: () => void;
}
```

---

## 2. HouseholdTable.tsx

### 2.1. Thông tin chung
- **Đường dẫn tệp**: `C:\Users\umnuar\Documents\Projects\QLNN\QLNN-Client\src\components\households\HouseholdTable.tsx`
- **Vai trò**: Bảng dữ liệu trung tâm của toàn bộ ứng dụng QLNN. Trình bày danh sách hộ nông nghiệp, tích hợp 5 View Modes theo chuyên đề + 1 View Mode toàn bộ 21 chỉ số, dòng mở rộng chi tiết (accordion) cho từng hộ, cột cố định (sticky) STT và Tên chủ hộ, che/hiện ghi chú nhạy cảm, double-click để sửa nhanh, và thanh phân trang.

### 2.2. Nhãn tiếng Việt, Phân đoạn hiển thị & 18 Chỉ số Nông nghiệp (BẮT BUỘC BẢO TOÀN)

#### A. Thanh chuyển chế độ xem (Segmented Views Bar):
1. **Tổng Hợp** (`overview`): Icon `Layers` — 7 cột cô đọng, không cuộn ngang.
2. **Cây Trồng** (`crops`): Icon `Trees` — 8 chỉ số cây trồng chính.
3. **Dược Liệu** (`herbs`): Icon `Flower2` — 4 chỉ số dược liệu đặc sản Đăk Hà.
4. **Vật Nuôi** (`livestock`): Icon `PawPrint` — 4 chỉ số gia súc gia cầm.
5. **Thủy Sản** (`aquaculture`): Icon `Fish` — 2 chỉ số mặt nước & lồng bè.
6. **Tất cả** (`full`): Icon `LayoutGrid` — Ma trận 2 tầng đầy đủ 21 cột.
- **Dòng nhắc mẹo (Tip)**: `"Mẹo: Bấm đúp vào dòng để xem & sửa nhanh 18 chỉ số"` (Icon `Lightbulb`).

#### B. Tiêu đề các cột dữ liệu theo từng View Mode:
- **Mode 1: Tổng Hợp (`overview`)**:
  - `[ ]` (Checkbox chọn tất cả / từng hộ)
  - `STT` (Cố định cột trái `left-10`)
  - `Họ và Tên Chủ Hộ` (Cố định cột trái `left-[88px]`, bóng đổ nổi `shadow-[4px_0_10px_-2px_rgba(0,0,0,0.06)]`)
  - `Thôn Quản Lý` (Huy hiệu màu theo thôn)
  - `Tổng Cây Trồng (ha)` (Định dạng diện tích số thập phân)
  - `Dược Liệu (ha)` (Định dạng diện tích số thập phân)
  - `Vật Nuôi (con)` (Tổng số con gia súc/gia cầm)
  - `Thủy Sản` (Diện tích ao hồ hoặc số lồng bè)
  - `Thao Tác` (Cố định phải `sticky right-0`, nút Sửa `Edit3`, nút Xóa `Trash2`)
- **Mode 2: Cây Trồng (`crops`)**:
  - Cột chung: Checkbox, STT, Họ và Tên Chủ Hộ, Thôn, Thao Tác.
  - 8 cột chỉ số: `Cà phê (Hộ)`, `Cà phê (Khoán)`, `Cao su (Hộ)`, `Cao su (Khoán)`, `Ăn Quả`, `Mắc Ca`, `Lúa Nước`, `Hàng Năm`.
- **Mode 3: Dược Liệu (`herbs`)**:
  - Cột chung: Checkbox, STT, Họ và Tên Chủ Hộ, Thôn, Thao Tác.
  - 4 chỉ số con: `Đinh Lăng (ha)`, `Gừng (ha)`, `Nghệ (ha)`, `Sả (ha)`.
  - Cột tổng: `Tổng Dược Liệu (ha)`.
- **Mode 4: Vật Nuôi (`livestock`)**:
  - Cột chung: Checkbox, STT, Họ và Tên Chủ Hộ, Thôn, Thao Tác.
  - 4 chỉ số đàn: `Đàn Trâu (con)`, `Đàn Bò (con)`, `Đàn Heo (con)`, `Đàn Gia Cầm (con)`.
  - Cột tổng: `Tổng Đàn (con)`.
- **Mode 5: Thủy Sản (`aquaculture`)**:
  - Cột chung: Checkbox, STT, Họ và Tên Chủ Hộ, Thôn, Thao Tác.
  - 2 chỉ số: `Cá Ao Hồ (ha)`, `Cá Lồng Bè (lồng)`.
- **Mode 6: Tất cả (`full`) - Header 2 tầng 21 cột**:
  - Nhóm 1: `1. Cây Trồng Chính (ha)` (8 cột con: Cà phê (Hộ), Cà phê (Khoán), Cao su (Hộ), Cao su (Khoán), Ăn quả, Mắc ca, Lúa nước, Hàng năm).
  - Nhóm 2: `2. Dược Liệu Đăk Hà (ha)` (4 cột con: Đinh lăng, Gừng, Nghệ, Sả).
  - Nhóm 3: `3. Đàn Vật Nuôi (con)` (4 cột con: Trâu, Bò, Heo, Gia cầm).
  - Nhóm 4: `4. Thủy Sản` (2 cột con: Cá ao (ha), Cá lồng (lồng)).

#### C. Bảng kê Accordion dòng con (18 Chỉ số chi tiết khi bấm mở rộng):
- Tiêu đề khung: `"Bảng kê chi tiết 18 chỉ số nông nghiệp: {full_name}"` • `"Thôn: {village_name}"`
- 4 thẻ phân nhóm:
  1. `Cây Trồng Chính (8)`: Cà phê (Hộ), Cà phê (Khoán), Cao su (Hộ), Cao su (Khoán), Cây ăn quả, Mắc ca, Lúa nước, Hàng năm khác.
  2. `Dược Liệu (4)`: Đinh lăng, Gừng, Nghệ, Sả.
  3. `Vật Nuôi (4)`: Đàn trâu, Đàn bò, Đàn heo, Gia cầm.
  4. `Thủy Sản (2)`: Cá ao hồ, Cá lồng bè.

#### D. Huy hiệu địa bàn 7 Thôn:
- `"Thôn 1"` (Blue), `"Thôn 2"` (Emerald), `"Thôn 3"` (Purple), `"Thôn 4"` (Amber), `"Thôn 5"` (Rose), `"Thôn Đăk Kđêm"` (Indigo), `"Thôn Kon Bơ Bắn"` (Teal).
- Trường hợp chưa có thôn: `"Chưa gán"` (Slate).

### 2.3. Các trạng thái giao diện (States)
1. **Default State**:
   - Dòng xen kẽ hover sáng: `hover:bg-emerald-50/40 dark:hover:bg-slate-800/60`.
   - Double click gọi trực tiếp `onEdit(hh)`.
2. **Loading State (`loading === true`)**:
   - Spinner emerald quay kèm thông báo theo từng view:
     - Overview: `"Đang tải dữ liệu hộ nông nghiệp..."`
     - Crops: `"Đang tải dữ liệu cây trồng..."`
     - Herbs: `"Đang tải dữ liệu dược liệu..."`
     - Livestock: `"Đang tải dữ liệu vật nuôi..."`
     - Aquaculture: `"Đang tải dữ liệu thủy sản..."`
     - Full: `"Đang tải dữ liệu tổng hợp 21 chỉ số..."`
3. **Empty State (`households.length === 0`)**:
   - Thông điệp chuẩn: `"Không tìm thấy hộ nông nghiệp nào"`.
4. **Row Expanded State (`expandedRows[hh.id] === true`)**:
   - Biểu tượng đổi sang `ChevronDown` màu emerald.
   - Dòng con bung ra hiển thị toàn bộ 4 khối với 18 chỉ số.
5. **Masked Notes State**:
   - Nút `Eye` / `EyeOff` cho phép che các chuỗi số nhạy cảm trong ghi chú (`••••123`).
6. **Disconnected State (`!isOnline || !isBackendHealthy`)**:
   - Nút sửa bị vô hiệu hóa để bảo vệ tính nhất quán dữ liệu khi mất kết nối.
7. **Read-Only State (`readOnly === true`)**:
   - Ẩn hoàn toàn cột `"Thao Tác"`.

### 2.4. Props & Data Model
```typescript
interface HouseholdTableProps {
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
  readOnly?: boolean;
  households: HouseholdFlat[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  onEdit: (hh: HouseholdFlat) => void;
  onDelete: (hh: HouseholdFlat) => void;
  isAllExpanded?: boolean;
  onToggleExpandAll?: () => void;
}
```

---

## 3. HouseholdModal.tsx

### 3.1. Thông tin chung
- **Đường dẫn tệp**: `C:\Users\umnuar\Documents\Projects\QLNN\QLNN-Client\src\components\households\HouseholdModal.tsx`
- **Vai trò**: Cửa sổ hộp thoại toàn phần (Render qua `createPortal` vào `document.body`) dùng để thêm mới hoặc chỉnh sửa hồ sơ hộ nông nghiệp và kê khai toàn diện 18 chỉ số diện tích, đàn vật nuôi và mặt nước nuôi trồng.
- **Tính năng đặc thù**:
  - Chuyển 3 Tab nhập liệu: Cây Trồng (12 chỉ số), Vật Nuôi (4 chỉ số), Thủy Sản (2 chỉ số).
  - Tự động cộng tổng diện tích cây trồng và tổng đàn vật nuôi thời gian thực (Live subtotal calculations).
  - Tự động phát hiện trùng tên hộ (`DUPLICATE_NAME`) và đề xuất ghi đè hồ sơ.
  - Kiểm soát tương tranh lạc quan **OCC 409 (Optimistic Concurrency Control)** kèm dải cảnh báo và nút tải lại dữ liệu mới nhất.
  - Bẫy tiêu điểm (Focus Trap) chuẩn WCAG 2.1 AA, phím Escape đóng hộp thoại.

### 3.2. Nhãn tiếng Việt & Cấu trúc trường (BẮT BUỘC BẢO TOÀN)

#### A. Tiêu đề & Thanh đầu trang (Fixed Header):
- Tiêu đề modal: `"Thêm Mới Hộ Nông Nghiệp"` (khi tạo mới) / `"Chỉnh Sửa Số Liệu Hộ Nông Nghiệp"` (khi chỉnh sửa).
- Huy hiệu tên chủ hộ: `{household.full_name}`.
- Huy hiệu thôn: `{currentVillageName}`.
- Mô tả phụ: `"Kê khai 18 chỉ số diện tích cây trồng, đàn vật nuôi và mặt nước thủy sản"`.
- 3 Tab chuyển đổi:
  1. `1. Cây Trồng (12 Chỉ Số)` (Icon `Trees`, màu active: Emerald)
  2. `2. Vật Nuôi (4 Chỉ Số)` (Icon `PawPrint`, màu active: Amber)
  3. `3. Thủy Sản (2 Chỉ Số)` (Icon `Fish`, màu active: Sky)

#### B. Khối Thông tin chung:
- `"Họ và tên chủ hộ *"` (placeholder: `"Ví dụ: A Đôi, Y Blui, Trần Văn Nam..."`)
- `"Thôn quản lý *"` (Admin: CustomSelect; Cán bộ thôn: hiển thị tên thôn cố định)
- `"Số điện thoại"` (placeholder: `"Ví dụ: 0912..."`)
- `"Địa chỉ chi tiết"` (placeholder: `"Ví dụ: Thôn 1, Xã Đăk Hà..."`)
- `"Ghi chú thêm (nếu có)"` (placeholder: `"Ghi chú về nhận khoán, diện tích chuyển đổi, đề án nông thôn mới..."`)

#### C. Tab 1: Cây Trồng (12 chỉ số):
- **CÀ PHÊ** (đơn vị: ha, bước: 0.001):
  - `"Hộ gia đình"` (`cafeHousehold`)
  - `"Nhận khoán"` (`cafeContracted`)
- **CAO SU** (đơn vị: ha, bước: 0.001):
  - `"Hộ gia đình"` (`rubberHousehold`)
  - `"Nhận khoán"` (`rubberContracted`)
- **4 CÂY ĐƠN LẺ** (đơn vị: ha, bước: 0.001):
  - `"Cây ăn quả"` (`fruitTree`)
  - `"Cây Mắc Ca"` (`macadamia`)
  - `"Lúa nước"` (`wetRice`)
  - `"Hàng năm khác"` (`otherAnnualCrops`)
- **CÂY DƯỢC LIỆU ĐĂK HÀ (4 LOẠI CON)** (đơn vị: ha, bước: 0.001):
  - `"Đinh lăng"` (`herbDinhLang`)
  - `"Gừng"` (`herbGung`)
  - `"Nghệ"` (`herbNghe`)
  - `"Sả"` (`herbSa`)
- **Dải tổng phụ cây trồng**:
  - `"Tổng Diện Tích Cây Trồng Kê Khai:"` `[Diện tích tự động cộng] ha`

#### D. Tab 2: Vật Nuôi (4 chỉ số):
- 4 loại vật nuôi (đơn vị: con, bước: 1):
  - `"Đàn Trâu"` (`buffalo`)
  - `"Đàn Bò"` (`cow`)
  - `"Đàn Heo"` (`pig`)
  - `"Đàn Gia Cầm"` (`poultry`)
- **Dải tổng phụ đàn vật nuôi**:
  - `"Tổng Đàn Vật Nuôi Kê Khai:"` `[Tổng số con tự động cộng] con`

#### E. Tab 3: Thủy Sản (2 chỉ số):
- `"Nuôi Cá Ao Hồ (Diện tích)"` (đơn vị: ha, bước: 0.001, ghi chú: `"Mặt nước thả cá truyền thống"`)
- `"Nuôi Cá Lồng Bè (Số lồng)"` (đơn vị: lồng, bước: 1, ghi chú: `"Lồng nuôi cá lòng hồ thủy điện"`)

#### F. Cảnh báo OCC & Trùng tên:
- **Dải cảnh báo OCC 409**:
  - Tiêu đề: `"Cảnh báo xung đột phiên bản dữ liệu (OCC 409)"`
  - Mô tả: `"Dữ liệu đã bị thay đổi bởi người khác. Vui lòng tải lại dữ liệu mới nhất."` (hoặc thông điệp từ server).
  - Nút tải lại: `"Tải Lại Dữ Liệu Mới Nhất"` (Icon `RefreshCw`, xoay khi loading).
- **Hộp thoại phát hiện trùng tên**:
  - Tiêu đề: `"Phát Hiện Trùng Tên Hộ"`
  - Nội dung: `"Hộ \"{fullName}\" đã tồn tại trong thôn. Bạn có muốn cập nhật đè số liệu mới này vào hồ sơ hộ đã có không?"`
  - Nút xác nhận: `"Đồng Ý Cập Nhật"`
  - Nút hủy: `"Hủy Bỏ"`

#### G. Thanh chân trang (Fixed Footer Actions):
- Nút `"Hủy bỏ"`
- Nút xác nhận:
  - Khi thêm mới: `"Lưu Hộ Mới"` (Icon `Plus`)
  - Khi cập nhật: `"Cập Nhật Hồ Sơ"` (Icon `Check`)

### 3.3. Các trạng thái giao diện (States)
1. **Default State**:
   - Thêm mới: Form trống với các giá trị mặc định là `"0"` hoặc `""`, thôn gán theo ngữ cảnh cán bộ.
   - Chỉnh sửa: Form nạp đầy đủ các chỉ số hiện có của hộ, `currentVersion` lưu version của hộ.
2. **Submitting / Loading State (`loading === true`)**:
   - Vô hiệu hóa nút Submit, nút hiển thị spinner xoay trắng.
3. **Validation Error State (`error !== null`)**:
   - Banner màu đỏ (`bg-rose-950/40 border-rose-800/60 text-rose-300`) xuất hiện đầu form cuộn: `"Vui lòng nhập họ và tên chủ hộ."` hoặc `"Vui lòng chọn thôn quản lý."`.
4. **OCC Conflict State (`isOccConflict === true`)**:
   - Banner amber nổi bật: Cho phép người dùng bấm `"Tải Lại Dữ Liệu Mới Nhất"` để nạp dữ liệu mới nhất từ backend mà không cần thoát modal làm mất công việc.
5. **Keyboard & Focus State**:
   - Tự động focus vào input đầu tiên sau 50ms mở modal.
   - Phím `Tab` và `Shift+Tab` bị khóa vòng tròn bên trong modal.
   - Phím `Escape` đóng modal.

### 3.4. Props & Data Model
```typescript
interface HouseholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  household: HouseholdFlat | null;
  onSuccess: () => void;
}
```

---

## 4. ImportPreviewModal.tsx

### 4.1. Thông tin chung
- **Đường dẫn tệp**: `C:\Users\umnuar\Documents\Projects\QLNN\QLNN-Client\src\components\excel\ImportPreviewModal.tsx`
- **Vai trò**: Cửa sổ xem trước đối soát dữ liệu 21 cột chuẩn xã Đăk Hà từ tệp Excel tải lên trước khi commit Smart-Upsert vào cơ sở dữ liệu.
- **Tính năng đặc thù**:
  - Bảng cuộn 21 cột có STT và Tên chủ hộ cố định mép trái (Sticky freeze pane).
  - Huy hiệu tóm tắt số lượng dòng dữ liệu hợp lệ.
  - Nút đổi tệp khác nhanh (`onChangeFile`).
  - Phân trang nội bộ bảng preview (20, 50, 100 dòng/trang).

### 4.2. Nhãn tiếng Việt & 21 Cột Đối Soát (BẮT BUỘC BẢO TOÀN)
- **Header**:
  - Tiêu đề: `"Preview Bảng Đối Soát 21 Cột – File {file.name}"`
  - Mô tả: `"Tệp: {file.name} • Tổng cộng {parsedData.length} dòng dữ liệu"`
  - Nút đổi tệp: `"Đổi Tệp Khác"` (Icon `RefreshCw`)
  - Nút đóng: `aria-label="Đóng preview"`
- **Dải trạng thái**:
  - Huy hiệu: `"Hợp lệ: {parsedData.length} hộ nông nghiệp"` (Icon `CheckCircle2`)
- **21 Cột dữ liệu bảng tính**:
  1. `1. STT` (Cố định trái `left-0`, w-14)
  2. `2. Họ và Tên Chủ Hộ` (Cố định trái `left-14`, min-w-[200px], đường kẻ ngăn cách nổi `border-r-2`)
  3. `3. Cà phê (Hộ)`
  4. `4. Cà phê (Nhận k)`
  5. `5. Cao su (Hộ)`
  6. `6. Cao su (Nhận k)`
  7. `7. Cây ăn quả`
  8. `8. Macca`
  9. `9. Đinh lăng`
  10. `10. Gừng`
  11. `11. Nghệ`
  12. `12. Sả`
  13. `13. Lúa nước`
  14. `14. Cây HN khác`
  15. `15. Trâu (con)`
  16. `16. Bò (con)`
  17. `17. Heo (con)`
  18. `18. Gia cầm (con)`
  19. `19. Ao cá (ha)`
  20. `20. Lồng bè`
  21. `21. Ghi chú`
- **Thanh phân trang & Nút hành động**:
  - Nhãn hiển thị: `"Hiển thị [ 20 / 50 / 100 ] / {parsedData.length} bản ghi"`
  - Nút trang: `"Trước"`, `"Sau"` kèm chỉ báo `importPage / maxPage`.
  - Nút hủy: `"Hủy Bỏ"`
  - Nút xác nhận:
    - Khi bình thường: `"Xác Nhận Nhập ({parsedData.length} Hợp Lệ)"`
    - Khi đang import: `"Đang xử lý..."`

### 4.3. Các trạng thái giao diện (States)
1. **Default Preview State**: Hiển thị bảng đối soát 21 cột, trang 1 (mặc định 20 dòng).
2. **Importing State (`importing === true`)**: Nút xác nhận chuyển `"Đang xử lý..."`, vô hiệu hóa cả 2 nút.
3. **Empty Data State (`parsedData.length === 0`)**: Hiển thị dòng đơn colSpan=21: `"Không tìm thấy dữ liệu hợp lệ trong file"`, nút xác nhận bị disable.
4. **Paging State**: Chuyển đổi linh hoạt giữa các trang với `importLimit` 20/50/100.

### 4.4. Props & Data Model
```typescript
interface ImportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  parsedData: (string | number | undefined)[][];
  onConfirm: (file: File) => void;
  importing: boolean;
  onChangeFile?: () => void;
}
```

---

## 5. ExportSettingsModal.tsx

### 5.1. Thông tin chung
- **Đường dẫn tệp**: `C:\Users\umnuar\Documents\Projects\QLNN\QLNN-Client\src\components\excel\ExportSettingsModal.tsx`
- **Vai trò**: Modal chọn phạm vi khi xuất dữ liệu ra file Excel theo biểu mẫu 21 chỉ số chuẩn của UBND Xã Đăk Hà.

### 5.2. Nhãn tiếng Việt & Tùy chọn (BẮT BUỘC BẢO TOÀN)
- **Header**:
  - Tiêu đề: `"Cài Đặt Xuất File Excel"` (Icon `DownloadCloud`)
  - Mô tả: `"Xuất biểu mẫu 21 chỉ số nông nghiệp chuẩn Xã Đăk Hà"`
  - Nút đóng: `aria-label="Đóng cửa sổ"`
- **Khối Phạm vi xuất**:
  - Tiêu đề nhóm: `"Phạm vi xuất"`
  - Mô tả ngữ cảnh:
    - Admin: `"Đang xuất theo thôn đã chọn (hoặc toàn xã nếu chọn Tất cả)."`
    - Cán bộ thôn: `"Đang xuất dữ liệu của thôn hiện tại."`
- **2 Lựa chọn Radio**:
  1. `exportScope === "all"`:
     - Tên lựa chọn: `"Toàn bộ hộ trong phạm vi"`
     - Mô tả: `"Xuất toàn bộ các hộ hiển thị theo phạm vi đang chọn."`
  2. `exportScope === "selected"`:
     - Tên lựa chọn: `"Chỉ xuất {selectedCount} hộ đã chọn"`
     - Mô tả: `"Chỉ xuất các hộ đã được tích chọn trong bảng."`
     - Bị vô hiệu hóa và mờ đi nếu `selectedCount === 0`.
- **Chân trang**:
  - Nút hủy: `"Hủy"`
  - Nút thực thi: `"Bắt đầu Xuất"` (khi đang tạo: `"Đang tạo..."`, `disabled={exporting}`)

### 5.3. Các trạng thái giao diện (States)
1. **Default State**: Chọn sẵn `"all"`.
2. **Has Selection State (`selectedCount > 0`)**: Cả 2 radio đều khả dụng cho người dùng chọn.
3. **No Selection State (`selectedCount === 0`)**: Radio `"selected"` bị disabled, mờ opacity-50, không thể click.
4. **Exporting State (`exporting === true`)**: Nút xuất đổi thành `"Đang tạo..."` và disabled.

### 5.4. Props & Data Model
```typescript
interface ExportSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (scope: "all" | "selected") => void;
  exporting: boolean;
  isAdmin: boolean;
  selectedCount?: number;
}
```

---

## 6. CustomSelect.tsx

### 6.1. Thông tin chung
- **Đường dẫn tệp**: `C:\Users\umnuar\Documents\Projects\QLNN\QLNN-Client\src\components\common\CustomSelect.tsx`
- **Vai trò**: Thành phần Select Dropdown tùy biến độc lập hoàn toàn với hệ điều hành, giải quyết triệt để lỗi hiển thị của thẻ `<select>` gốc trên Windows/macOS.
- **Tính năng đặc thù**:
  - **Tự động lật hướng (Auto-flip)**: Khi khoảng cách tới đáy màn hình (`spaceBelow`) < 240px, menu tự động bật ngược lên phía trên (`openUpward ? "bottom-full mb-1.5" : "top-full mt-1.5"`).
  - **Tự động kích hoạt tìm kiếm**: Tự bật ô tìm kiếm nếu `searchable` prop được truyền hoặc khi danh sách options > 8 mục.
  - **Đầy đủ phím điều hướng WCAG**: Phím `ArrowDown`, `ArrowUp` để duyệt mục, `Enter` để chọn, `Escape` để đóng.
  - **Tích hợp thẻ select native ẩn**: Duy trì 1 thẻ `<select className="sr-only">` đồng bộ ngầm phía sau phục vụ screen readers và kiểm thử tự động.

### 6.2. Nhãn tiếng Việt & Placeholder (BẮT BUỘC BẢO TOÀN)
- Placeholder mặc định: `"Chọn..."`
- Placeholder ô tìm kiếm: `"Tìm kiếm..."`
- Khi không có kết quả tìm kiếm: `"Không tìm thấy kết quả"`
- Aria-label nút xóa chọn: `"Xóa lựa chọn"`
- Aria-label nút xóa từ khóa tìm kiếm: `"Xóa tìm kiếm"`

### 6.3. Các kích thước & Trạng thái
- **Kích thước (`size`)**:
  - `sm`: Min-height 32px, text-xs, áp dụng trên thanh FilterBar và Pagination.
  - `md`: Min-height 42px, text-sm, áp dụng trong các Form Modal.
  - `lg`: Min-height 48px, text-base.
- **Trạng thái**:
  - Default: Border slate-300, background slate-50.
  - Active / Value Selected: Border emerald-500/80, background emerald-50/50, text emerald-800.
  - Open: Border emerald-500, ring-2 emerald-500/20, icon `ChevronDown` xoay 180 độ.
  - Clearable: Hiển thị icon `X` khi có giá trị và không bị disable.
  - Error: Border rose-500 kèm thông báo lỗi màu đỏ phía dưới.
  - Disabled: Opacity-60, con trỏ not-allowed.

### 6.4. Props & Data Model
```typescript
export interface SelectOption<T = string | number> {
  value: T;
  label: string;
  subLabel?: string;
  badge?: string;
  disabled?: boolean;
}

export interface CustomSelectProps<T = string | number> {
  value: T;
  onChange: (value: T) => void;
  options: (SelectOption<T> | T)[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  isActive?: boolean;
  className?: string;
  containerClassName?: string;
  dropdownClassName?: string;
  id?: string;
  name?: string;
}
```

---

## 7. TablePagination.tsx

### 7.1. Thông tin chung
- **Đường dẫn tệp**: `C:\Users\umnuar\Documents\Projects\QLNN\QLNN-Client\src\components\common\TablePagination.tsx`
- **Vai trò**: Thanh điều khiển phân trang dưới đáy bảng dữ liệu (HouseholdTable, RecycleBinTable, AuditLogView).

### 7.2. Nhãn tiếng Việt (BẮT BUỘC BẢO TOÀN)
- Thông tin phạm vi: `"Hiển thị {start}-{end} trong tổng số {total} bản ghi"`
- Nhãn chọn số dòng: `"Hiển thị:"`
- Các tùy chọn số dòng/trang:
  - `"10 dòng"` (value: 10)
  - `"20 dòng"` (value: 20)
  - `"50 dòng"` (value: 50)
  - `"100 dòng"` (value: 100)
- Chỉ báo trang: `"Trang {page} / {totalPages || 1}"`
- Nút lùi: `aria-label="Trang trước"` (Icon `ChevronLeft`)
- Nút tiến: `aria-label="Trang tiếp theo"` (Icon `ChevronRight`)

### 7.3. Các trạng thái giao diện (States)
1. **Trang đầu tiên (`page <= 1`)**: Nút `"Trang trước"` bị vô hiệu hóa (`disabled`, `opacity-40`).
2. **Trang cuối cùng (`page >= totalPages`)**: Nút `"Trang tiếp theo"` bị vô hiệu hóa (`disabled`, `opacity-40`).
3. **Bảng rỗng (`total === 0`)**: Hiển thị `"Hiển thị 0-0 trong tổng số 0 bản ghi"`, tổng trang là `1`.

### 7.4. Props & Data Model
```typescript
interface TablePaginationProps {
  itemCount: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
}
```

---

## 8. AuditLogView.tsx

### 8.1. Thông tin chung
- **Đường dẫn tệp**: `C:\Users\umnuar\Documents\Projects\QLNN\QLNN-Client\src\components\audit\AuditLogView.tsx`
- **Vai trò**: Màn hình trung tâm kiểm soát an ninh dữ liệu và giám sát dòng thời gian (Timeline) toàn bộ biến động nông nghiệp, thao tác nghiệp vụ, nhập xuất Excel, xóa và khôi phục của toàn xã.
- **Tính năng đặc thù**:
  - Dải nút lọc sự kiện nhanh (Filter Pills): Tất cả, Thêm mới, Cập nhật, Xóa, Khôi phục, Nhập Excel.
  - Lọc theo Thôn (nút chuyển nhanh "Xem Toàn Xã" cho Admin), lọc theo Cán bộ thực hiện, tìm kiếm từ khóa.
  - Trình phân tích & dịch JSON Diff thân thiện tiếng Việt (`renderFriendlyDiff`): Nhận diện 18 chỉ số nông nghiệp, biến động số liệu trước/sau dạng `Cũ → Mới`, phát hiện thao tác tra cứu CCCD nhạy cảm (`REVEAL_CCCD`).
  - Hỗ trợ cả 2 chế độ điều hướng: Nút `"Tải Thêm Dữ Liệu"` (Infinite scroll style) và Thanh phân trang số chuẩn `TablePagination`.

### 8.2. Nhãn tiếng Việt & Bản đồ Thuật ngữ (BẮT BUỘC BẢO TOÀN)

#### A. Banner Tiêu đề:
- Huy hiệu: `"HỆ THỐNG KIỂM SOÁT"`
- Tiêu đề chính: `"Nhật Ký Hoạt Động & Biến Động Dữ Liệu"` (Icon `History`)
- Mô tả: `"Ghi vết tự động toàn bộ biến động nông nghiệp, nhập xuất dữ liệu và thao tác nghiệp vụ tại Xã Đăk Hà"`
- Nút: `"Làm Mới"` (Icon `RefreshCw`)

#### B. Nút lọc sự kiện (Action Filter Pills):
- `"ALL"`: `"Tất Cả"` (Icon `Activity`)
- `"CREATE"`: `"Thêm Mới"` (Icon `Plus`, màu Emerald)
- `"UPDATE"`: `"Cập Nhật"` (Icon `RefreshCw`, màu Blue)
- `"DELETE"`: `"Xóa"` / `"Xóa Vĩnh Viễn"` (Icon `Trash2`, màu Rose)
- `"RESTORE"`: `"Khôi Phục"` (Icon `RotateCcw`, màu Purple)
- `"IMPORT"`: `"Nhập Excel"` (Icon `FileSpreadsheet`, màu Amber)

#### C. Bản đồ dịch tên trường 18 chỉ số & thuộc tính (`FIELD_LABELS`):
- `cafe_household`: `"Cà phê (Hộ gia đình) (ha)"`
- `cafe_contracted`: `"Cà phê (Liên kết) (ha)"`
- `rubber_household`: `"Cao su (Hộ gia đình) (ha)"`
- `rubber_contracted`: `"Cao su (Liên kết) (ha)"`
- `fruit_tree`: `"Cây ăn quả (ha)"`
- `macadamia`: `"Mắc ca (ha)"`
- `wet_rice`: `"Lúa nước (ha)"`
- `other_annual_crops`: `"Cây hàng năm khác (ha)"`
- `herb_dinh_lang`: `"Đinh lăng (ha)"`
- `herb_gung`: `"Gừng (ha)"`
- `herb_nghe`: `"Nghệ (ha)"`
- `herb_sa`: `"Sả (ha)"`
- `buffalo`: `"Trâu (con)"`
- `cow`: `"Bò (con)"`
- `pig`: `"Heo / Lợn (con)"`
- `poultry`: `"Gia cầm (con)"`
- `fish_pond`: `"Ao hồ thủy sản (ha)"`
- `fish_cage`: `"Lồng bè nuôi cá (lồng)"`
- Thuộc tính hộ: `full_name` ("Họ và tên / Chủ hộ"), `phone` ("Số điện thoại"), `address` ("Địa chỉ"), `notes` ("Ghi chú"), `village_name` ("Thôn").

#### D. Trình diễn Visual Diff theo loại thao tác:
- **UPDATE**:
  - Tiêu đề khối: `"Thay đổi thông tin:"`
  - Thẻ đối chiếu: `{Tên trường}: [Giá trị cũ gạch ngang đỏ] → [Giá trị mới in đậm xanh]`
  - Trường hợp đặc biệt tra cứu CCCD: `"Tra cứu & hiển thị số Căn cước công dân (Yêu cầu quyền hạn & đã ghi vết kiểm soát)"` (Icon `Shield`)
  - Khi không có thay đổi trường: `"Thông tin đã được đồng bộ lại."`
- **CREATE**:
  - Tiêu đề khối: `"Dữ liệu khởi tạo:"`
  - Thẻ hiển thị: Chủ hộ / Đại diện, Thôn, Địa chỉ, Số điện thoại, Mã định danh.
- **IMPORT / IMPORT_EXCEL**:
  - Tiêu đề: `"Tệp Excel: {file_name}"`
  - Số liệu: `"Thêm mới: {inserted} bản ghi"`, `"Cập nhật: {updated} bản ghi"`.
- **DELETE / HARD_DELETE**:
  - Tiêu đề: `"Đã xóa vĩnh viễn khỏi hệ thống:"` hoặc `"Đã chuyển vào Thùng rác:"`
  - Thông tin: Danh sách hộ, Chủ hộ, Lý do xóa.
- **RESTORE**:
  - Tiêu đề: `"Khôi phục bản ghi: {name}"`, Các hộ, Ghi chú.

#### E. Chân thẻ sự kiện Timeline:
- Người thực hiện: Icon `UserIcon`, tên cán bộ hoặc `"Hệ thống"`.
- Thôn: Icon `MapPin`, tên thôn.
- Địa chỉ IP: `"IP: {ip_address}"`.

### 8.3. Các trạng thái giao diện (States)
1. **Initial / Loading State**: Spinner quay kèm `"Đang tải nhật ký kiểm soát..."`.
2. **Empty State**: `"Không tìm thấy sự kiện biến động nào phù hợp với bộ lọc."`.
3. **Error State**: Khung đỏ kèm thông điệp lỗi và nút gạch chân `"Thử lại"`.
4. **Load More State**: Nút `"Tải Thêm Dữ Liệu"` (Icon `ArrowDownCircle`) xuất hiện khi còn trang tiếp theo.
5. **Pagination State**: Tích hợp `TablePagination` dưới chân khối timeline.

### 8.4. Props & Data Model
```typescript
export interface AuditLogViewProps {
  villageId?: string;
  householdId?: string;
  showFilters?: boolean;
  className?: string;
}
```

---

## 9. THÀNH PHẦN BỔ TRỢ PHÁT HIỆN BỔ SUNG

### 9.1. RecycleBinTable.tsx (Bảng Thùng rác Hộ nông nghiệp)
- **Đường dẫn**: `C:\Users\umnuar\Documents\Projects\QLNN\QLNN-Client\src\components\households\RecycleBinTable.tsx`
- **Vai trò**: Bảng quản lý các hộ nông nghiệp đã bị xóa tạm (soft-delete).
- **Cấu trúc cột**: Toàn bộ 21 cột giống hệt chế độ `full` của `HouseholdTable`, nhưng cột `"Thao Tác"` thay đổi thành 2 hành động:
  - Nút Khôi phục (`onRestore`): Icon `RotateCcw`, nhãn `"Khôi phục hộ"`, title `"Khôi phục hồ sơ này"`.
  - Nút Xóa vĩnh viễn (`onDelete`): Icon `Trash2`, nhãn `"Xóa hộ"`, title `"Xóa vĩnh viễn"`.

### 9.2. ServerStatusModal.tsx (Hộp thoại chẩn đoán máy chủ & độ trễ)
- **Đường dẫn**: `C:\Users\umnuar\Documents\Projects\QLNN\QLNN-Client\src\components\network\ServerStatusModal.tsx`
- **Vai trò**: Modal kiểm tra tình trạng kết nối mạng LAN / Internet tới máy chủ QLNN.
- **Nhãn tiếng Việt**:
  - Tiêu đề: `"Trạng Thái Máy Chủ"` (Icon `Server`)
  - Khối 1: `"Kết Nối"` — Trạng thái: `"Hoạt động ổn định"` (Xanh) / `"Mất kết nối"` (Đỏ)
  - Khối 2: `"Độ Trễ (Ping)"` — Giá trị: `"{latency} ms"` hoặc `"Đang đo..."`
  - Đóng: `aria-label="Đóng hộp thoại trạng thái máy chủ"`

### 9.3. useModal & ModalProvider (Hộp thoại xác nhận toàn cục)
- **Đường dẫn**: `C:\Users\umnuar\Documents\Projects\QLNN\QLNN-Client\src\hooks\useModal.tsx`
- **Vai trò**: Hộp thoại xác nhận đa năng (`info`, `warning`, `danger`, `success`) phục vụ các cảnh báo xóa hộ, cập nhật trùng tên, v.v.
- **Nhãn mặc định**:
  - Nút xác nhận: `confirmText` (mặc định: `"Xác nhận"`)
  - Nút hủy: `cancelText` (mặc định: `"Hủy bỏ"`)

---

## 10. MA TRẬN BẢO TOÀN NỘI DUNG VS ĐỀ XUẤT ĐỒNG BỘ FORM

| Tên thành phần | NỘI DUNG (GIỮ NGUYÊN 100% TỪ QLNN) | FORM HIỆN TẠI (QLNN) | FORM CHUẨN QLHK ĐỒNG BỘ | ĐỀ XUẤT / PROPOSALS CHO REVIEW |
| :--- | :--- | :--- | :--- | :--- |
| **HouseholdFilterBar** | 3 dropdowns (Quy mô, Loại hình, Sắp xếp); ô tìm kiếm chủ hộ; nút Bung/Thu gọn; nút Xóa lọc; cụm tác vụ hàng loạt (Đã chọn, Bỏ chọn, Xuất Excel, Xóa). | Đảo lọc bo góc `rounded-2xl`, viền `slate-200/80`, khoảng cách padding `p-2.5 sm:p-3`. | Đảo lọc QLHK chuẩn tokens `rounded-2xl`, viền mỏng `slate-200/80`, surface layer sạch. | QLHK có `YearSelector` & `AgeFilterPopover` (đặc thù nhân khẩu/độ tuổi). QLNN **KHÔNG** đưa 2 bộ lọc này vào vì nông nghiệp chỉ quản lý 18 chỉ số. Giữ nguyên 3 bộ lọc nông nghiệp. |
| **HouseholdTable** | 5 View modes (Tổng Hợp, Cây Trồng, Dược Liệu, Vật Nuôi, Thủy Sản) + 1 mode Full 21 cột; bảng kê 18 chỉ số Accordion; che/hiện ghi chú; STT & Tên chủ hộ sticky; màu 7 thôn. | Bảng bo `rounded-3xl`, segmented button với nền `slate-200/60`, sticky cell bóng mờ. | Giữ nguyên form bảng bo lớn `rounded-3xl`, đồng bộ độ tương phản màu viền bảng `border-slate-200/80`, hiệu ứng hover row emerald `hover:bg-emerald-50/40`. | Đồng bộ font chữ số liệu `font-mono tabular-nums` chuẩn JetBrains Mono từ QLHK để thẳng hàng các số đo diện tích và số con. |
| **HouseholdModal** | 3 Tabs (Cây Trồng 12 chỉ số, Vật Nuôi 4 chỉ số, Thủy Sản 2 chỉ số); tính tổng tự động; banner OCC 409 & Reload; modal trùng tên. | Modal `max-w-3xl`, bo `rounded-3xl`, header đen `bg-slate-900`, 3 nút tab lớn ở top. | Đồng bộ form overlay `bg-slate-950/60 backdrop-blur-xs`, bo góc `rounded-3xl`, viền `border-slate-800`, bẫy tiêu điểm WCAG và animation `zoom-in-95`. | Form modal QLNN đã có cấu trúc header slate-900 rất hiện đại; đồng bộ các input `inputClasses` theo đúng design tokens của QLHK. |
| **ImportPreviewModal** | Bảng đối soát 21 cột; huy hiệu Hợp lệ; nút Đổi Tệp Khác; phân trang preview 20/50/100. | Modal `max-w-6xl`, freeze pane STT & Tên chủ hộ, footer chứa CustomSelect limit. | Đồng bộ tokens `rounded-3xl`, backdrop blur, viền bảng và thanh điều hướng phân trang. | Giữ nguyên toàn bộ 21 cột nghiệp vụ của xã Đăk Hà (QLHK là 12 cột nhân khẩu). |
| **ExportSettingsModal** | 2 tùy chọn radio: Toàn bộ hộ trong phạm vi / Chỉ xuất {n} hộ đã chọn; text ngữ cảnh thôn/xã. | Modal `max-w-md`, radio buttons bo tròn `appearance-none border-2 checked:border-[6px]`. | Đồng bộ tokens modal `rounded-3xl`, radio selector theo tương tác chuẩn QLHK. | Không thêm tùy chọn xuất nhân khẩu của QLHK vào QLNN. |
| **CustomSelect** | Placeholder "Chọn...", "Tìm kiếm...", "Không tìm thấy kết quả", badge, subLabel. | Auto-flip khi spaceBelow < 240px, auto show search khi > 8 options, select native ẩn. | Đã tương đồng form của QLHK, đồng bộ thêm độ trượt mượt mà (transition timing). | Đảm bảo kích thước `size="sm"` khớp với chiều cao input `h-8 sm:h-9` trên FilterBar. |
| **TablePagination** | "Hiển thị x-y trong tổng số z bản ghi", 10/20/50/100 dòng, Trang a/b, Trước/Sau. | Khung `bg-slate-50/95`, CustomSelect chọn limit, nút icon Chevron. | Đồng bộ tokens phân trang `rounded-xl`, bo góc và viền chuẩn QLHK. | Đồng nhất giữa các màn hình (Hộ dân, Thùng rác, Nhật ký). |
| **AuditLogView** | 6 Filter pills; timeline nodes; bộ dịch JSON Diff 18 chỉ số (Cũ → Mới); tra cứu CCCD; lọc Thôn/Cán bộ. | Timeline đường kẻ dọc `border-l-2`, thẻ bo `rounded-2xl`, node icon tròn nổi. | Đồng bộ timeline node ring `ring-4`, màu badge action, typography phân cấp. | Giữ nguyên 100% bộ từ điển dịch `FIELD_LABELS` cho 18 chỉ tiêu nông nghiệp Đăk Hà. |
| **RecycleBinTable** | Ma trận 21 cột hộ đã xóa; nút Khôi phục (RotateCcw) & Xóa vĩnh viễn (Trash2). | Bảng 21 cột, header 2 tầng, checkbox chọn hàng loạt. | Đồng bộ design tokens tương tự HouseholdTable. | Giữ nguyên để phục vụ khôi phục dữ liệu nông nghiệp đã xóa. |
| **ServerStatusModal** | Trạng thái Kết nối (Hoạt động ổn định / Mất kết nối), Độ trễ ping (ms). | Modal nhỏ `max-w-sm`, bo `rounded-3xl`, 2 thẻ card trạng thái. | Đồng bộ backdrop blur và bo góc chuẩn QLHK. | Giữ nguyên phục vụ môi trường mạng nội bộ UBND xã. |
