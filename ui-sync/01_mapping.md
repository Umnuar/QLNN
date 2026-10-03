# MASTER COMPONENT & FORM MAPPING SPECIFICATION: QLHK -> QLNN
## BẢN ĐỒ ÁNH XẠ TOÀN DIỆN THÀNH PHẦN, DESIGN TOKENS & LỘ TRÌNH THỰC THI

> **Mã tài liệu**: `01_mapping.md`  
> **Phiên bản**: v1.0.0 (Giai đoạn 3 - Master Mapping)  
> **Chuyên viên thực hiện**: Subagent `A-mapper` (Whole-App Mapping Specialist)  
> **Ứng dụng tham chiếu (Reference App - Nguồn FORM)**: `C:\Users\umnuar\Documents\Projects\QLHK\QLHK-Client`  
> **Ứng dụng đích (Target App - Bảo toàn CONTENT)**: `C:\Users\umnuar\Documents\Projects\QLNN\QLNN-Client`  
> **Thời điểm hoàn thành**: Tháng 10/2026  

---

## NGUYÊN TẮC CỐT LÕI BẤT BIẾN (INVARIANT PRINCIPLES)

```
╔═══════════════════════════════════════════════════════════════════════════════════════════╗
║                      COPY FORM ONLY  •  KEEP CONTENT INTACT                               ║
╠═══════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. FORM (Sao chép hoàn toàn từ QLHK):                                                     ║
║    - Design Tokens: Bảng màu Emerald/Slate, bo góc rounded-*, bóng đổ shadow-*, khoảng     ║
║      cách p-*/m-*/gap-*, typography (Be Vietnam Pro, JetBrains Mono tabular-nums), icons. ║
║    - Layout Khung: Header cố định 64px, Sidebar co giãn w-64/w-16, viewport cuộn độc lập. ║
║    - Component Patterns: Island FilterBar, Sticky Tables, CustomSelect auto-flip,         ║
║      Drawers/Modals bo rounded-3xl, TablePagination, Timeline diff, Status Badges.        ║
║    - Interactions & Responsive: Transition-all, WCAG focus trap, mobile drawer overlay.   ║
║                                                                                           ║
║ 2. CONTENT (Bảo toàn 100% từ QLNN - Tuyệt đối không sao chép từ QLHK):                    ║
║    - 18 Chỉ tiêu nông nghiệp (12 cây trồng ha, 4 vật nuôi con, 2 thủy sản ha/lồng).       ║
║    - 21 Cột Excel đối soát Smart-Upsert xã Đăk Hà (STT, Họ tên, 18 chỉ số, Ghi chú).     ║
║    - Khóa tương tranh lạc quan OCC (Optimistic Concurrency Control) `version: Int` (409).  ║
║    - 7 Thôn bản xã Đăk Hà (Thôn 1..5, Kon Đao Yôp / Đăk Kđêm, Kon Hnông Bách / Kon Bơ Bắn).║
║    - Bộ lọc thông minh 3 cấp (Quy mô, Loại hình canh tác, Sắp xếp chỉ số nông nghiệp).    ║
║    - 5 Chế độ xem bảng (Tổng hợp, Cây trồng, Dược liệu, Vật nuôi, Thủy sản, Tất cả).      ║
║    - Toàn bộ nhãn tiếng Việt, câu thông báo lỗi, API endpoints, role permissions (Admin, ║
║      Cán bộ thôn), logic cascade restore và IndexedDB offline cache.                      ║
╚═══════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## PHẦN 1: MA TRẬN ÁNH XẠ THÀNH PHẦN CHI TIẾT (COMPONENT-BY-COMPONENT MAPPING MATRIX)

Bao phủ 100% toàn bộ 21 màn hình, modal, drawer, filter bar, table và thành phần nền tảng từ Phase 1:

| # | Thành phần / Tính năng QLNN | Mẫu FORM tương đương tại QLHK | Design Tokens & Lớp Tailwind áp dụng | Thay đổi Layout & Cấu trúc cần thực hiện | Nội dung nghiệp vụ BẢO TOÀN NGUYÊN VẸN (Invariants) | Trạng thái chuyển đổi |
|---|-----------------------------|-------------------------------|---------------------------------------|------------------------------------------|-----------------------------------------------------|:---------------------:|
| **1** | **App Shell Root** (`AppLayout.tsx`, `App.tsx`) | `AppLayout.tsx` | `h-screen w-screen overflow-hidden flex flex-col font-sans bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-150` | Thiết lập khung flexbox dọc unscrollable; Header cố định trên cùng; ConnectionBanner nằm ngay dưới Header; Body phân tách Sidebar và Viewport chính `flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6`. | Giữ nguyên toàn bộ State Machine điều phối tab (`activeTab`), theme engine (`qlnn_theme`), zoom IPC (`qlnn_zoom` 80-140%), ping EMA heartbeat, và định tuyến RBAC theo vai trò. | Sẵn sàng ánh xạ |
| **2** | **Màn hình Khởi tạo (Splash Screen)** (`App.tsx`) | `InitializingSplash` | `min-h-screen w-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center`, Spinner: `w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin` | Căn giữa tuyệt đối màn hình, spinner viền kép emerald xoay mượt mà, typography tiếng Việt rõ nét. | Nhãn: `"Đang khởi tạo phiên làm việc Quản lý Nông nghiệp..."`, logic kiểm tra token `secureStorage` và giải mã phiên làm việc ngoại tuyến. | Sẵn sàng ánh xạ |
| **3** | **Header cố định 64px** (`Header.tsx`) | `Header.tsx` | `h-16 sticky top-0 z-30 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shadow-xs select-none transition-colors` | Khóa cứng chiều cao 64px (`h-16`); chia cụm Trái (Logo Sprout + Tiêu đề + Tag xã) và cụm Phải (Zoom pill + Sun/Moon button + Scope badge + Ping button + User Avatar + Logout). | Nhãn: `"QUẢN LÝ NÔNG NGHIỆP"`, `"XÃ ĐĂK HÀ"`, `"Dữ liệu Nông Nghiệp số Xã Đăk Hà"`, tooltip zoom, nhãn vai trò `"Cán bộ Xã (Admin)"` / `"Trưởng Thôn"`, logic IPC zoom, logout. | Sẵn sàng ánh xạ |
| **4** | **Cụm Zoom Điều Khiển** (`Header.tsx`) | Zoom Controls Pill | `hidden md:flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-slate-300`, Text: `font-mono tabular-nums font-bold text-[11px]`, Nút: `p-1.5 hover:bg-slate-700 hover:text-emerald-400 rounded-lg disabled:opacity-40` | Gói gọn 3 nút `[ - ]`, `[ 100% ]`, `[ + ]` trong một pill bo `rounded-xl`; ẩn trên mobile/tablet để chống tràn header; hover hiệu ứng emerald. | Phạm vi 80% - 140%, bước nhảy 10%, hotkeys `Ctrl +`, `Ctrl -`, `Ctrl 0`, hàm IPC `window.api.app.setZoom`. | Sẵn sàng ánh xạ |
| **5** | **Đo Ping & Mạng Ngoại Tuyến** (`Header.tsx`) | Network Latency Pill | Nút pill: `flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border`. Healthy: `bg-emerald-950/60 text-emerald-300 border-emerald-800`. Offline: `bg-rose-950/60 text-rose-300 border-rose-800`. Dot: `w-2 h-2 rounded-full bg-emerald-500 animate-pulse` | Chuyển đổi trạng thái màu sắc vi mô (emerald / rose / amber spinner), nhấp vào mở `ServerStatusModal`. Hiển thị mili-giây dạng `font-mono tabular-nums`. | Thuật toán EMA (alpha = 0.3), nhãn `"Online"`, `"{latency}ms"`, `"Ngoại tuyến"`, `"Thử lại..."`, endpoint `/ping` và `/health`. | Sẵn sàng ánh xạ |
| **6** | **Sidebar Điều Hướng Co Giãn** (`Sidebar.tsx`) | `Sidebar.tsx` | `aside bg-slate-950 text-slate-300 flex flex-col shrink-0 border-r border-slate-800/80 transition-all duration-200 ease-out overflow-hidden`, Expanded: `w-64`, Collapsed: `w-16`, Active: `bg-emerald-600 text-white shadow-md shadow-emerald-950/30 rounded-2xl` | Header sidebar với nút `PanelLeftClose`/`PanelLeftOpen`; Danh sách nút bo `rounded-2xl`; Badge `"Chính"` bo `rounded-md text-[10px] font-bold`; Tooltip hover nổi `z-50 rounded-2xl shadow-2xl` khi thu gọn; Footer phiên bản `QLNN v1.0.0` kèm icon `ShieldCheck`. | **Bảo toàn tuyệt đối 4 cây menu ngữ cảnh theo vai trò & địa bàn**: Admin chưa chọn thôn (4 mục), Admin xem thống kê toàn xã (5 mục), Admin đã chọn thôn (6 mục), Cán bộ thôn (4 mục). | Sẵn sàng ánh xạ |
| **7** | **Màn hình Đăng Nhập** (`LoginView.tsx`) | `LoginView.tsx` | Container: `min-h-screen w-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6`. Card: `max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl border-t-4 border-t-emerald-600` | Nâng cấp card từ `rounded-2xl` lên `rounded-3xl shadow-2xl`; Icon Sprout lớn trong nền tròn `bg-emerald-100 dark:bg-emerald-950/60`; Cụm input chuẩn `STANDARD_INPUT_CLASSES` kèm icon `User`/`Lock` bên trái; Nút submit `h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold`. | Nhãn form: `"ĐĂNG NHẬP"`, `"QUẢN LÝ NÔNG NGHIỆP & NÔNG THÔN MỚI — XÃ ĐĂK HÀ"`, placeholder, thông báo lỗi xác thực tiếng Việt, logic auto-focus và fallback token cache. | Sẵn sàng ánh xạ |
| **8** | **Banner Cảnh Báo Mạng** (`ConnectionBanner.tsx`) | `ConnectionBanner.tsx` | Reconnected: `bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-xs animate-in slide-in-from-top duration-300`. Offline: `bg-gradient-to-r from-amber-600 via-rose-600 to-rose-700 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md` | Đặt cố định ngay dưới Header; animation trượt xuống mượt mà; nút thử lại bo `rounded-lg bg-white/20 hover:bg-white/30` kèm icon xoay tròn `RefreshCw`. | Thông báo: `"Đã khôi phục kết nối thành công — Dữ liệu đã được đồng bộ tự động thời gian thực!"`, `"Mất kết nối đến máy chủ Đăk Hà..."`, nút `"Thử kết nối ngay"`. | Sẵn sàng ánh xạ |
| **9** | **Modal Chẩn Đoán Server** (`ServerStatusModal.tsx`) | `ServerStatusModal.tsx` | Backdrop: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in`. Dialog: `w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden` | Bo góc `rounded-3xl`; Header có icon `Server` và nút đóng `X rounded-xl`; 2 thẻ hiển thị Kết nối và Độ trễ bo `rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700`; Phím Escape & WCAG focus trap. | Tiêu đề: `"Trạng Thái Máy Chủ"`, `"Kết Nối"`, `"Độ Trễ (Ping)"`, `"Hoạt động ổn định"`, `"Mất kết nối"`, giá trị mili-giây `font-mono tabular-nums`. | Sẵn sàng ánh xạ |
| **10** | **Màn hình Báo Lỗi Khẩn Cấp** (`ErrorBoundary.tsx`) | Error Fallback View | Viewport: `min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950 font-sans`. Khối Pre: `max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-700 dark:text-slate-300 shadow-xs overflow-auto` | Đồng bộ dark mode cho toàn bộ trang lỗi; icon cảnh báo `AlertTriangle` trong vòng tròn `bg-rose-100 dark:bg-rose-950/60 text-rose-600`; nút tải lại bo `rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold`. | Tiêu đề: `"Đã xảy ra sự cố hệ thống"`, hướng dẫn tải lại, khối in stack trace, hành động `window.location.reload()`. | Sẵn sàng ánh xạ |
| **11** | **Quản Lý Thôn & Địa Bàn** (`VillagesPage.tsx`) | `VillagesPage.tsx` | Hero Banner: `rounded-3xl p-6 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white shadow-xl shadow-emerald-950/20`. 4 KPI Cards: `bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm`. Thẻ Thôn: `rounded-3xl p-5 border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-xl` | Áp dụng Hero Emerald gradient banner chuẩn QLHK; 4 thẻ KPI với font số `text-2xl font-black font-mono tabular-nums`; Lưới 7 thẻ thôn chuyển sang hover zoom nhẹ `hover:scale-[1.02] active:scale-[0.98]`; Form inline sửa tên thôn có viền `border-2 border-emerald-500 rounded-2xl`. | Toàn bộ số liệu 7 thôn (Thôn 1..5, Đăk Kđêm, Kon Bơ Bắn), tên trưởng thôn phụ trách, chỉ số cây trồng (ha), vật nuôi (con), logic chuyển tab `analytics`, quyền hạn chỉ Admin mới được thêm/sửa/xóa thôn. | Sẵn sàng ánh xạ |
| **12** | **Thanh Lọc Hộ Dân (Filter Bar)** (`HouseholdFilterBar.tsx`) | Island Filter Container (`HouseholdFilterBar.tsx`) | Khung Island: `flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs`. Search Pill: `relative w-56 sm:w-80 h-8 sm:h-9 bg-slate-50 dark:bg-slate-800 border rounded-xl`. Nút Xóa Lọc: `bg-rose-50 text-rose-600 border-rose-200 rounded-xl font-bold text-xs` | Chuẩn hóa thanh công cụ thành một "đảo nổi" (Island container) bo `rounded-2xl`; Cụm search tích hợp icon `Search`, nút xóa `X`, vách ngăn dọc mỏng `w-px h-3.5` và spinner `RefreshCw`; 3 dropdown CustomSelect kích thước `size="sm"` cao `h-8 sm:h-9`; Cụm batch actions trôi sang phải `ml-auto`. | **Bảo toàn 3 tiêu chí lọc đặc thù nông nghiệp**: Quy mô (`large`: >2ha/>15 con, `medium`: 0.5-2ha, `small`: <0.5ha); Loại hình (`contracted`: Có nhận khoán, `herbs`: Trồng dược liệu, `livestock`: Chăn nuôi, `aquaculture`: Thủy sản); Thứ tự sắp xếp (Diện tích cây trồng ↓, Đàn vật nuôi ↓, Tên A-Z). Không đưa bộ lọc tuổi/nhân khẩu vào. | Sẵn sàng ánh xạ |
| **13** | **Bảng Dữ Liệu 18 Chỉ Tiêu Nông Nghiệp** (`HouseholdTable.tsx`) | `HouseholdTable.tsx` | Khung ngoài: `bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col`. Sticky Left: Checkbox `left-0`, STT `left-10`, Họ Tên `left-[88px] shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)]`. Sticky Right: Thao Tác `right-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]`. Dòng: `hover:bg-emerald-50/40 dark:hover:bg-slate-800/60` | Nâng cấp khung bảng bo `rounded-3xl`; Giữ thanh 6 tab chế độ xem phân hệ canh tác ở đầu bảng bo viền tinh tế; Ghim cố định 3 cột bên trái và 1 cột bên phải với bóng đổ phân cách mịn; Cột STT và số liệu áp dụng font `font-mono font-bold tabular-nums`; Dòng mở rộng Accordion hiển thị 4 thẻ con bo `rounded-2xl` có đường kẻ viền trái `border-l-4 border-l-emerald-500`. | **Bảo toàn tuyệt đối 18 chỉ tiêu nông nghiệp**: Cà phê hộ/khoán, Cao su hộ/khoán, Cây ăn quả, Mắc ca, Đinh lăng, Gừng, Nghệ, Sả, Lúa nước, Cây hàng năm, Trâu, Bò, Heo, Gia cầm, Cá ao, Cá lồng; 7 màu huy hiệu thôn; Double click để sửa; Đổi icon xem/ẩn ghi chú. | Sẵn sàng ánh xạ |
| **14** | **Modal / Drawer Nhập Liệu 18 Chỉ Số** (`HouseholdModal.tsx`) | `HouseholdDrawer.tsx` / `CitizenModal.tsx` | Backdrop: `fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in`. Dialog Shell: `w-full max-w-4xl h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95`. Input: `STANDARD_INPUT_CLASSES` | Nâng cấp toàn diện thành Slide-over/Modal bo lớn `rounded-3xl`; Header đen/slate cố định với 3 nút tab chuyên đề lớn có icon màu active (Emerald, Amber, Sky); Dải tổng phụ tự động tính toán nổi bật với nền `bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-3`; Footer hành động dính chặt đáy màn hình. | **Bảo toàn 18 trường nhập số liệu nông nghiệp**, tự động cộng dồn diện tích cây trồng (ha) và tổng đàn (con), **xử lý xung đột tương tranh OCC 409** (hiện banner cảnh báo amber + nút tải lại dữ liệu mới nhất), hộp thoại xác nhận ghi đè trùng tên hộ (`DUPLICATE_NAME`). | Sẵn sàng ánh xạ |
| **15** | **Bảng Đối Soát 21 Cột Excel** (`ImportPreviewModal.tsx`) | Excel Preview Table Dialog | Backdrop: `bg-slate-950/60 backdrop-blur-xs`. Dialog: `w-full max-w-6xl h-[88vh] bg-white dark:bg-slate-900 border rounded-3xl shadow-2xl flex flex-col overflow-hidden`. Header: Freeze pane STT (`left-0 w-14`) và Tên chủ hộ (`left-14 min-w-[200px] border-r-2`). Nút: `rounded-xl font-bold` | Bo góc `rounded-3xl` cho hộp thoại xem trước; Ghim cố định 2 cột đầu STT và Tên chủ hộ khi cuộn ngang duyệt 19 cột chỉ số bên phải; Cột số liệu căn giữa font `font-mono tabular-nums`; Tích hợp thanh phân trang 20/50/100 dòng bên dưới. | Bảo toàn trọn vẹn danh sách 21 cột Excel chuẩn của xã Đăk Hà; Nút `"Đổi Tệp Khác"`; Huy hiệu `"Hợp lệ: {n} hộ nông nghiệp"`; Nút commit Smart-Upsert vào CSDL. | Sẵn sàng ánh xạ |
| **16** | **Cài Đặt Xuất Excel** (`ExportSettingsModal.tsx`) | Radio Selector Dialog | Dialog: `w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4`. Radio Container: `p-3 rounded-2xl border transition-all cursor-pointer`. Radio Input: `accent-emerald-600 w-4 h-4` | Bo góc `rounded-3xl`; Tùy chọn radio được bọc trong các thẻ card bo `rounded-2xl` viền sáng khi được chọn (`border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30`); Nút xuất bo `rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold`. | Hai phạm vi xuất: Toàn bộ hộ trong phạm vi đang chọn vs Chỉ xuất N hộ đã chọn (bị mờ nếu N=0); Mô tả ngữ cảnh phân quyền thôn/xã; Nút `"Bắt đầu Xuất"`. | Sẵn sàng ánh xạ |
| **17** | **Trung Tâm Thống Kê & Phân Tích** (`AnalyticsPage.tsx`, `AnalyticsDashboard.tsx`) | `AnalyticsDashboard.tsx` | 4 Hero KPI Cards: `bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm`. Biểu đồ SVG: Đường nét tròn `strokeLinecap="round"`, màu `emerald-500` & `amber-500`. Bảng so sánh 7 thôn: `rounded-3xl overflow-hidden border` | Chuẩn hóa 4 thẻ KPI nông nghiệp cấp xã; Tối ưu 2 biểu đồ Donut SVG nội tuyến (Cà phê, Cao su) với màu sắc sắc nét từ token QLHK; 4 thanh tiến độ tỷ lệ vật nuôi dùng thanh progress `h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800`; Bảng đối soát 7 thôn có sticky header `text-[11px] font-black uppercase`. | **Bảo toàn toàn bộ hệ thống 25 chỉ số Nông thôn mới**: Diện tích cà phê hộ/khoán, cao su hộ/khoán, 4 loại dược liệu (Đinh lăng, Gừng, Nghệ, Sả), trâu, bò, heo, gia cầm, cá ao, cá lồng; Bảng so sánh 7 thôn dành cho Admin; Nút xuất file `BangSoSanhCacThon_*.xlsx`. | Sẵn sàng ánh xạ |
| **18** | **Thùng Rác Hộ Nông Nghiệp** (`RecycleBinPage.tsx`, `RecycleBinTable.tsx`) | `RecycleBinPage.tsx`, `RecycleBinTable.tsx` | Banner Tiêu đề: `rounded-3xl p-6 bg-slate-900 border border-slate-800 text-white shadow-xl`. Bảng 21 cột: Cấu trúc 2 tầng `rounded-3xl border border-slate-200/90 dark:border-slate-800`. Nút Khôi phục: `p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-xl`. Nút Xóa vĩnh viễn: `p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl` | Áp dụng cấu trúc bảng 2 tầng chuẩn QLHK; Sticky checkbox bên trái và Sticky actions bên phải; Thanh hành động hàng loạt trên banner (Khôi phục N hộ, Xóa vĩnh viễn N hộ); Cảnh báo xóa vĩnh viễn dùng modal cảnh báo màu đỏ bo `rounded-3xl`. | Bảo toàn 21 cột hộ bị xóa tạm, logic khôi phục nguyên trạng (cascade restore phục hồi cả 18 chỉ số cây trồng, vật nuôi), quyền hạn chỉ Admin mới thấy nút Xóa vĩnh viễn. | Sẵn sàng ánh xạ |
| **19** | **Cài Đặt Hệ Thống & Cán Bộ** (`SettingsPage.tsx`, `BackupRestoreTab.tsx`) | Settings Shell & Danger Zone Pattern | Navigation Tabs: `flex items-center gap-2 p-1.5 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl`. Cards: `rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 bg-white dark:bg-slate-900`. Danger Zone: `rounded-3xl border border-rose-200 dark:border-rose-900/40 overflow-hidden` | Thanh chuyển 4 tab cài đặt dạng pill bo `rounded-2xl`; Tab Tài khoản cá nhân bo `rounded-3xl`; Tab Quản lý cán bộ thôn có bảng danh sách bo góc mượt mà; Tab Sao lưu CSDL chia 2 khối: Xuất JSON (khung emerald bo `rounded-2xl`) và Phục hồi CSDL (Danger Zone viền đỏ `border-rose-200 dark:border-rose-900/40`); Modal thách thức mật khẩu Admin bo `rounded-3xl`. | 4 Tab chuẩn: Tài khoản của tôi, Quản lý cán bộ 7 thôn (Admin), Sao lưu CSDL (Admin), Thông tin đơn vị; Khóa chống Admin tự xóa tài khoản; Kiểm tra mật khẩu Admin bắt buộc trước khi phục hồi CSDL; Sự kiện `auth:expired`. | Sẵn sàng ánh xạ |
| **20** | **Nhật Ký Biến Động Nông Nghiệp** (`AuditLogView.tsx`) | Timeline Audit Pattern | Filter Pills: `px-3 py-1.5 rounded-xl text-xs font-bold transition-all border`. Timeline Card: `rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs`. Timeline Node: `w-8 h-8 rounded-full border-2 ring-4 ring-slate-100 dark:ring-slate-800` | Nâng cấp dòng thời gian kiểm toán với các node tròn nổi; 6 nút pill lọc sự kiện (Tất cả, Thêm mới [emerald], Cập nhật [blue], Xóa [rose], Khôi phục [purple], Nhập Excel [amber]); Visual diff hiển thị thẻ đối soát cũ/mới bo `rounded-xl`; Chân thẻ hiển thị cán bộ, thôn và địa chỉ IP `font-mono`. | **Bảo toàn từ điển dịch tiếng Việt cho 18 chỉ số nông nghiệp** (`FIELD_LABELS`), phân tích diff Cũ (gạch ngang đỏ) ➡️ Mới (xanh đậm), phát hiện thao tác tra cứu CCCD nhạy cảm (`REVEAL_CCCD`), hỗ trợ cả nút tải thêm và TablePagination. | Sẵn sàng ánh xạ |
| **21** | **Dropdown Tự Lật Hướng** (`CustomSelect.tsx`) | `CustomSelect.tsx` | Trigger: `rounded-xl font-medium transition-all outline-hidden border`. Size `sm`: `h-8 sm:h-9 px-2.5 text-xs`. Dropdown Menu: `absolute z-[120] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 overflow-hidden animate-in fade-in zoom-in-95 duration-150` | Áp dụng thuật toán tính khoảng cách đáy màn hình (`spaceBelow < 240px` để lật lên trên `bottom-full mb-1.5`); Tích hợp ô tìm kiếm khi danh sách > 8 options; Bo góc menu `rounded-2xl`; Hiệu ứng active emerald; Duy trì thẻ `<select className="sr-only">` ngầm. | Nhãn: `"Chọn..."`, `"Tìm kiếm..."`, `"Không tìm thấy kết quả"`, aria-label xóa, hỗ trợ phím mũi tên và Enter chọn mục. | Sẵn sàng ánh xạ |
| **22** | **Thanh Phân Trang Bảng** (`TablePagination.tsx`) | `TablePagination.tsx` | Khung ngoài: `p-4 bg-slate-50/90 dark:bg-slate-950/80 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs`. Stepper: `p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40` | Bo tròn các nút chuyển trang `rounded-xl`; Chỉ số trang nằm trong pill bo `rounded-xl font-mono font-bold`; Dropdown chọn số dòng 10/20/50/100 dùng CustomSelect `size="sm"` bo `rounded-xl`. | Nhãn: `"Hiển thị {start}-{end} trong tổng số {total} bản ghi"`, `"Số dòng:"`, `"Trang {page} / {totalPages}"`, tooltip chuyển trang. | Sẵn sàng ánh xạ |
| **23** | **Hộp Thoại Xác Nhận Toàn Cục** (`useModal.tsx`) | Global Confirmation Modal (`useModal.tsx`) | Backdrop: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs animate-in fade-in`. Dialog: `bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden` | Bo góc `rounded-3xl shadow-2xl`; Icon trạng thái (danger [rose], warning [amber], success [emerald], info [blue]) nằm trong khối bo `rounded-2xl p-3 border`; Nút xác nhận bo `rounded-xl h-10 px-5 text-xs font-bold text-white shadow-xs`. | Giữ nguyên hook `useModal()`, 4 mức độ cảnh báo, nhãn nút mặc định (`"Xác nhận"`, `"Hủy bỏ"`), hỗ trợ hiển thị spinner loading khi đang xử lý tác vụ bất đồng bộ. | Sẵn sàng ánh xạ |

---

## PHẦN 2: DANH MỤC ĐỀ XUẤT NÂNG CẤP (PROPOSALS FOR USER REVIEW)

> **LƯU Ý QUAN TRỌNG**: Các tính năng dưới đây là những điểm tham chiếu mà ứng dụng QLHK sở hữu nhưng QLNN hiện chưa có hoặc có sự khác biệt. Theo **Nguyên tắc cốt lõi P0**, các mục này **CHỈ ĐƯỢC LIỆT KÊ ĐỂ NGƯỜI DÙNG XEM XÉT VÀ PHÊ DUYỆT**, **TUYỆT ĐỐI KHÔNG TỰ Ý ĐƯA VÀO CODE** trong quá trình chuyển đổi Form.

| Mã Đề Xuất | Tính năng tham chiếu từ QLHK | Hiện trạng tương ứng tại QLNN | Khuyến nghị & Đánh giá tác động | Quyết định đề xuất |
|:----------:|:-----------------------------|:------------------------------|:---------------------------------|:------------------:|
| **PROP-01** | **Ngăn kéo điều hướng trượt trên Mobile (Mobile Drawer Overlay)** | Trên màn hình hẹp (< 768px), Sidebar QLNN vẫn nằm trong luồng DOM chính ở dạng thanh ray hẹp `w-16`, chiếm một phần diện tích bảng. QLHK dùng ngăn kéo trượt `fixed inset-y-0 left-0 z-40 w-64` kèm lớp phủ mờ `fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30 md:hidden` và tự đóng khi chọn menu. | Rất khuyến nghị áp dụng vì giúp giải phóng 100% chiều rộng màn hình mobile cho bảng 18 chỉ tiêu nông nghiệp, không làm thay đổi bất kỳ logic dữ liệu nào. | **Đề xuất phê duyệt** (Chỉ đổi lớp bọc trình bày) |
| **PROP-02** | **Hệ thống Toast thông báo hoàn tác nổi (Floating Undo Toast)** | QLHK có thanh Toast nổi ở góc dưới màn hình cho phép "HOÀN TÁC" (Undo) lệnh xóa trong 15 giây. QLNN đã có Thùng Rác chuyên dụng (`RecycleBinPage`) hỗ trợ khôi phục bất cứ lúc nào. | Không bắt buộc đưa vào ngay; Thùng Rác của QLNN đã đủ an toàn theo quy chuẩn hành chính công. Giữ nguyên Thùng Rác hiện tại. | **Tạm hoãn (Backlog)** |
| **PROP-03** | **Quản lý Nhân khẩu chi tiết theo từng Hộ (CitizenModal & CitizenTable)** | QLHK quản lý sâu từng cá nhân trong hộ khẩu (Quan hệ với chủ hộ, Ngày sinh, Giới tính, Dân tộc, Tôn giáo, Nghề nghiệp, Số CCCD). | QLNN là hệ thống Quản lý Dữ liệu Nông nghiệp & NTM, tập trung vào 18 chỉ tiêu diện tích canh tác và đàn vật nuôi của hộ gia đình. **TUYỆT ĐỐI KHÔNG ĐƯA** mô hình dữ liệu nhân khẩu cá nhân sang QLNN. | **Từ chối (Out of Scope)** |
| **PROP-04** | **Bộ lọc độ tuổi theo Popover (`AgeFilterPopover`) & Bộ chọn năm (`YearSelector`)** | QLHK có bộ lọc theo các nhóm tuổi (`0-5 tuổi`, `6-14 tuổi`, `60+ tuổi`, v.v.) và bộ tăng giảm năm thống kê. | QLNN không quản lý độ tuổi cư dân mà quản lý diện tích cây trồng và số con vật nuôi. **TUYỆT ĐỐI KHÔNG ĐƯA** bộ lọc độ tuổi vào `HouseholdFilterBar`. QLNN giữ nguyên 3 bộ lọc: Quy mô, Loại hình canh tác, và Sắp xếp chỉ số. | **Từ chối (Out of Scope)** |
| **PROP-05** | **Thống kê Cơ cấu Dân tộc & Tôn giáo** | QLHK có bảng và biểu đồ phân rã 14 dân tộc thiểu số và 4 tôn giáo trên địa bàn xã. | QLNN tập trung vào 4 phân hệ nông nghiệp: Cây trồng lâu năm & hàng năm, Cây Dược liệu bản địa Đăk Hà, Đàn Gia súc Gia cầm, và Mặt nước Thủy sản. Không đưa chỉ tiêu dân tộc/tôn giáo vào trang Thống kê QLNN. | **Từ chối (Out of Scope)** |
| **PROP-06** | **Chuyển đổi Modal Hộ Dân (`HouseholdModal.tsx`) thành Drawer trượt mép phải** | QLNN hiện dùng Modal trung tâm (`max-w-4xl`), QLHK dùng Drawer trượt từ cạnh phải màn hình (`HouseholdDrawer.tsx` `max-w-3xl h-[88vh]`). | Khuyến nghị giữ cấu trúc Modal lớn trung tâm bo `rounded-3xl` hiện tại của QLNN vì form 18 chỉ tiêu nông nghiệp cần bề ngang rộng để xếp lưới 2 cột số thập phân ha/con; chỉ đồng bộ tokens viền, bóng đổ và các thanh Header/Footer dính. | **Giữ Modal trung tâm rộng** |

---

## PHẦN 3: TÍNH NĂNG ĐẶC THÙ RIÊNG CỦA ỨNG DỤNG ĐÍCH (UNIQUE TO TARGET)

Dưới đây là đặc tả chi tiết toàn bộ các tính năng chỉ có ở QLNN và công thức kết hợp chính xác giữa **FORM từ QLHK** (tokens, classes, layout) với **CONTENT của QLNN** (số liệu nông nghiệp, ma trận 21 cột, OCC lock):

### 3.1. 18 Chỉ Tiêu Nông Nghiệp Xã Đăk Hà (Cây Trồng, Dược Liệu, Vật Nuôi, Thủy Sản)
- **Đặc thù nghiệp vụ**:
  - **12 Chỉ tiêu Cây trồng**: Cà phê hộ canh tác (ha), Cà phê nhận khoán (ha), Cao su hộ canh tác (ha), Cao su nhận khoán (ha), Cây ăn quả (ha), Cây Mắc ca (ha), Cây Lúa nước (ha), Cây hàng năm khác (ha), cùng 4 cây dược liệu đặc sản: Đinh lăng (ha), Gừng (ha), Nghệ (ha), Sả (ha).
  - **4 Chỉ tiêu Vật nuôi**: Đàn Trâu (con), Đàn Bò (con), Đàn Heo (con), Đàn Gia cầm (con).
  - **2 Chỉ tiêu Thủy sản**: Nuôi cá ao hồ (ha), Nuôi cá lồng bè (lồng).
- **Công thức áp dụng FORM từ QLHK**:
  - *Định dạng số*: 100% giá trị diện tích (ha) và số con/lồng hiển thị trên Bảng, Modal, Accordion và KPI Cards bắt buộc dùng lớp:
    ```tsx
    className="font-mono font-bold tabular-nums text-slate-800 dark:text-slate-200"
    ```
  - *Hiển thị Accordion dòng con*: Khi bấm bung dòng trên `HouseholdTable`, khối chi tiết bung ra với animation `animate-in fade-in duration-200`, chia làm 4 thẻ con bo `rounded-2xl p-4 bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80`, có đường viền trang trí trái `border-l-4 border-l-emerald-500`.
  - *Tự động cộng dồn trong Modal*: Dải tổng diện tích cây trồng và tổng đàn vật nuôi được hiển thị thời gian thực trong dải banner bo `rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 p-3 flex justify-between items-center text-xs font-bold text-emerald-800 dark:text-emerald-300`.

### 3.2. Bảng Đối Soát 21 Cột Excel Smart-Upsert (`ImportPreviewModal.tsx`, `RecycleBinTable.tsx`)
- **Đặc thù nghiệp vụ**: 21 cột chuẩn hóa của xã Đăk Hà bao gồm:
  1. STT, 2. Họ và Tên Chủ Hộ, 3. Cà phê (Hộ), 4. Cà phê (Nhận k), 5. Cao su (Hộ), 6. Cao su (Nhận k), 7. Cây ăn quả, 8. Macca, 9. Đinh lăng, 10. Gừng, 11. Nghệ, 12. Sả, 13. Lúa nước, 14. Cây HN khác, 15. Trâu (con), 16. Bò (con), 17. Heo (con), 18. Gia cầm (con), 19. Ao cá (ha), 20. Lồng bè, 21. Ghi chú.
- **Công thức áp dụng FORM từ QLHK**:
  - *Cấu trúc Header 2 tầng (Two-Tier Header)*:
    - Tầng trên (ColSpan phân nhóm): Bo viền `border-b border-r border-slate-200/90 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-950 text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 py-2.5 px-3 text-center`.
    - Tầng dưới (Tên cột con): `py-2 px-2 text-center text-[10.5px] font-bold text-slate-600 dark:text-slate-400 border-r border-slate-200/80 dark:border-slate-800 whitespace-nowrap bg-slate-50 dark:bg-slate-900`.
  - *Kỹ thuật Ghim Cột Băng Đôi (Dual Freeze Panes)*:
    - Cột 1 (STT): `sticky left-0 z-20 w-12 min-w-12 bg-slate-100 dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-800 text-center font-mono font-bold text-slate-500`.
    - Cột 2 (Họ và Tên Chủ Hộ): `sticky left-12 z-20 min-w-[200px] bg-slate-100 dark:bg-slate-950 border-r-2 border-slate-300 dark:border-slate-700 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.08)] font-bold text-slate-900 dark:text-slate-100 px-4 py-3`.
    - Dòng dữ liệu tương ứng trong `<tbody>` gán class nền động `stickyBgClass` để chống hiện tượng nhìn xuyên thấu khi cuộn ngang 19 cột chỉ số bên phải.

### 3.3. Khóa Tương Tranh Lạc Quan OCC (`version: Int`) & Banner Xung Đột 409
- **Đặc thù nghiệp vụ**: PostgreSQL Prisma schema sử dụng trường `version: Int @default(1)`. Khi cán bộ bấm lưu mà phát hiện phiên bản trên server cao hơn, API trả về HTTP 409 Conflict.
- **Công thức áp dụng FORM từ QLHK**:
  - Thay vì đóng modal và mất dữ liệu vừa nhập, một thanh cảnh báo nổi bật xuất hiện ngay đầu form cuộn:
    ```tsx
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs animate-in slide-in-from-top duration-200">
      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="font-bold text-sm tracking-tight">Cảnh báo xung đột phiên bản dữ liệu (OCC 409)</h4>
        <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
          Hộ dân này vừa được cập nhật bởi một cán bộ khác trên hệ thống. Dữ liệu hiện tại đã cũ.
        </p>
      </div>
      <button
        type="button"
        onClick={handleReloadLatest}
        disabled={isReloading}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? "animate-spin" : ""}`} />
        <span>Tải Lại Số Liệu Mới</span>
      </button>
    </div>
    ```

### 3.4. Bộ Lọc Thông Minh 3 Cấp Nông Nghiệp (`HouseholdFilterBar.tsx`)
- **Đặc thù nghiệp vụ**: Lọc đồng thời theo 3 chiều:
  1. *Quy mô*: Tất cả / Lớn (>2ha / >15 con) / Vừa (0.5 - 2ha) / Nhỏ lẻ (<0.5ha).
  2. *Loại hình*: Tất cả / Có nhận khoán / Trồng dược liệu / Chăn nuôi / Thủy sản.
  3. *Sắp xếp*: Mặc định (STT) / Diện tích cây trồng ↓ / Tổng đàn vật nuôi ↓ / Tên A → Z / Tên Z → A.
- **Công thức áp dụng FORM từ QLHK**:
  - Gói trọn 3 dropdown vào `CustomSelect` kích thước `size="sm"` (`h-8 sm:h-9`) bo góc `rounded-xl`, đặt liên tiếp nhau trong Island container bo `rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs`.
  - Nút Xóa lọc xuất hiện dạng pill hồng mềm `bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 rounded-xl` khi có bất kỳ tiêu chí nào khác mặc định.

### 3.5. 5 Chế Độ Xem Bảng (Segmented View Modes)
- **Đặc thù nghiệp vụ**: Cho phép chuyển nhanh góc nhìn giữa 5 phân hệ canh tác: `overview` (Tổng Hợp), `crops` (Cây Trồng), `herbs` (Dược Liệu), `livestock` (Vật Nuôi), `aquaculture` (Thủy Sản) và `full` (Tất cả 21 cột).
- **Công thức áp dụng FORM từ QLHK**:
  - Áp dụng thanh chuyển chế độ Segmented Controls đặt ngay đầu bảng bo `rounded-2xl p-1 bg-slate-200/60 dark:bg-slate-800/60 flex items-center gap-1`:
    ```tsx
    <button
      type="button"
      onClick={() => setViewMode(mode.id)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
        viewMode === mode.id
          ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200/80 dark:border-slate-700/80"
          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
      }`}
    >
      <mode.icon className="w-3.5 h-3.5" />
      <span>{mode.label}</span>
    </button>
    ```

### 3.6. Cấu Trúc Địa Bàn 7 Thôn Xã Đăk Hà
- **Đặc thù nghiệp vụ**: 7 Thôn bản gồm Thôn 1, Thôn 2, Thôn 3, Thôn 4, Thôn 5, Kon Đao Yôp (Đăk Kđêm), Kon Hnông Bách (Kon Bơ Bắn).
- **Công thức áp dụng FORM từ QLHK**:
  - Lưới thẻ thôn trên `VillagesPage` dùng cấu trúc `rounded-3xl p-5 border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 min-h-[160px] flex flex-col justify-between group cursor-pointer transition-all`.
  - Huy hiệu màu riêng biệt cho 7 thôn trên các bảng dữ liệu tuân theo bảng màu status badges:
    - Thôn 1: `bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800`
    - Thôn 2: `bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800`
    - Thôn 3: `bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800`
    - Thôn 4: `bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800`
    - Thôn 5: `bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800`
    - Thôn Đăk Kđêm: `bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800`
    - Thôn Kon Bơ Bắn: `bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800`

### 3.7. Sao Lưu & Phục Hồi CSDL Kèm Thách Thức Mật Khẩu Admin (`BackupRestoreTab.tsx`)
- **Đặc thù nghiệp vụ**: Xuất JSON snapshot CSDL và Phục hồi CSDL toàn diện. Để ngăn chặn việc vô tình ghi đè CSDL, bắt buộc phải nhập mật khẩu Admin (`admin_password`).
- **Công thức áp dụng FORM từ QLHK**:
  - Áp dụng mẫu **Danger Zone Card Pattern** chuẩn: Header card màu hồng đỏ `bg-rose-50/50 dark:bg-rose-950/20 border-b border-rose-100 dark:border-rose-900/30`, icon `ShieldAlert` trong khối bo `rounded-2xl p-2.5 bg-rose-100 text-rose-600`.
  - Hộp thoại thách thức mật khẩu sử dụng Modal bo `rounded-3xl shadow-2xl`, ô input mật khẩu áp dụng `STANDARD_INPUT_CLASSES` kèm nút `Eye`/`EyeOff`, nút xác nhận màu đỏ `bg-rose-600 hover:bg-rose-700 rounded-xl font-bold text-white`.

---

## PHẦN 4: TRÌNH TỰ THỰC THI & THỨ TỰ PHỤ THUỘC GIAI ĐOẠN 4 (EXECUTION SEQUENCE & DEPENDENCY ORDER)

Toàn bộ quá trình chuyển đổi giao diện Giai đoạn 4 (Phase 4 Implementation) phải được chia thành **4 tầng lớp nghiêm ngặt (Layers 1 to 4)** theo nguyên tắc: Tầng dưới hoàn thành và kiểm thử sạch 100% linter/typescript mới được chuyển sang tầng trên:

```
┌────────────────────────────────────────────────────────────────────────┐
│ LAYER 4: BUSINESS PAGES & ROUTING VERIFICATION                         │
│ (VillagesPage, HouseholdsPage, AnalyticsPage, RecycleBin, Settings)    │
├────────────────────────────────────────────────────────────────────────┤
│ LAYER 3: SHARED ORGANISMS, DATA TABLES & MODALS                        │
│ (HouseholdFilterBar, HouseholdTable, HouseholdModal, ImportPreview,    │
│  ExportSettingsModal, RecycleBinTable, AuditLogView, BackupRestore)    │
├────────────────────────────────────────────────────────────────────────┤
│ LAYER 2: APP SHELL, NAVIGATION & GLOBAL FEEDBACK                       │
│ (AppLayout, Header, Sidebar, ConnectionBanner, ServerStatusModal,      │
│  LoginView, ErrorBoundary, AppContext router engine)                   │
├────────────────────────────────────────────────────────────────────────┤
│ LAYER 1: DESIGN TOKENS, TYPOGRAPHY & BASE ATOMS                        │
│ (index.html, index.css, @theme, CustomSelect, TablePagination,         │
│  useModal, STANDARD_INPUT_CLASSES, JetBrains Mono font-mono)           │
└────────────────────────────────────────────────────────────────────────┘
```

### TẦNG 1: DESIGN TOKENS, TYPOGRAPHY & CÁC THÀNH PHẦN NGUYÊN TỬ (BASE ATOMS)
- **Mục tiêu**: Thiết lập nền móng thiết kế đồng nhất, import web fonts, CSS variables, animation engine và các component cấp atom dùng chung.
- **Tệp chỉnh sửa & cài đặt**:
  1. `index.html`: Thêm link nạp web font Google Fonts `"Be Vietnam Pro"` (weights 300, 400, 500, 600, 700) và `"JetBrains Mono"` (weights 400, 500, 600).
  2. `src/index.css`: Cấu hình `@theme` Tailwind v4 với `--font-sans` và `--font-mono`; Khai báo polyfill animation `@keyframes enter` và `.animate-in`; Cấu hình thanh cuộn mượt mà `::-webkit-scrollbar` theo đúng tokens; Thiết lập `svg.lucide { stroke-width: 1.5; }`; Thiết lập selection color `selection:bg-emerald-500 selection:text-white`.
  3. `src/components/common/CustomSelect.tsx`: Áp dụng tokens `rounded-xl` (trigger) và `rounded-2xl` (menu), thuật toán auto-flip `spaceBelow < 240px`, trạng thái active emerald, size `sm/md/lg`, và hiệu ứng trượt.
  4. `src/components/common/TablePagination.tsx`: Áp dụng tokens bo `rounded-xl`, font số `font-mono font-bold tabular-nums`, CustomSelect `size="sm"` chọn limit dòng.
  5. `src/hooks/useModal.tsx`: Đồng bộ hộp thoại xác nhận toàn cục với bo góc `rounded-3xl shadow-2xl`, 4 khối icon semantic bo `rounded-2xl`, nút hành động bo `rounded-xl`.
- **Cổng nghiệm thu Tầng 1 (Gate 1)**: Kiểm tra không có lỗi build CSS, font chữ hiển thị chuẩn xác, CustomSelect đóng mở mượt mà và tự lật hướng chính xác.

### TẦNG 2: APP SHELL, ĐIỀU HƯỚNG & CÁC MÀN HÌNH NỀN TẢNG (SHELL & LAYOUT)
- **Mục tiêu**: Xây dựng bộ khung layout hoàn chỉnh unscrollable h-screen, Header cố định 64px, Sidebar co giãn w-64/w-16, và các banner kết nối.
- **Tệp chỉnh sửa & cài đặt**:
  1. `src/components/Layout/AppLayout.tsx`: Đồng bộ cấu trúc root flex flex-col h-screen w-screen overflow-hidden; phân chia Header, ConnectionBanner, Sidebar và main viewport cuộn độc lập `p-4 sm:p-6 custom-scrollbar`.
  2. `src/components/Layout/Header.tsx`: Khóa chiều cao `h-16`, màu nền `bg-slate-900 border-b border-slate-800`, cụm logo Sprout, cụm Zoom pill `hidden md:flex`, nút Sun/Moon, badge thôn, pill ping EMA mili-giây, avatar tròn và nút logout.
  3. `src/components/Layout/Sidebar.tsx`: Đồng bộ chiều rộng `w-64` và `w-16`, nút menu bo `rounded-2xl`, badge `"Chính"` bo `rounded-md`, tooltip bay nổi `rounded-2xl shadow-2xl` khi thu gọn, footer phiên bản `QLNN v1.0.0` kèm `ShieldCheck`. **Bảo toàn 100% 4 cây menu ngữ cảnh theo vai trò**.
  4. `src/components/network/ConnectionBanner.tsx`: Áp dụng animation trượt `slide-in-from-top`, thanh emerald (khôi phục mạng) và thanh gradient amber-rose (mất mạng) kèm spinner thử lại.
  5. `src/components/network/ServerStatusModal.tsx`: Đồng bộ backdrop mờ `bg-slate-950/60 backdrop-blur-xs`, bo `rounded-3xl`, 2 thẻ Kết nối và Độ trễ bo `rounded-2xl`.
  6. `src/components/auth/LoginView.tsx`: Đồng bộ thẻ card đăng nhập bo `rounded-3xl shadow-2xl border-t-4 border-t-emerald-600`, icon Sprout tròn lớn, input chuẩn `STANDARD_INPUT_CLASSES`, nút submit `h-12 rounded-xl`.
  7. `src/components/common/ErrorBoundary.tsx`: Đồng bộ dark mode, icon cảnh báo tròn `bg-rose-100 dark:bg-rose-950/60`, khối stack trace pre bo `rounded-2xl`.
- **Cổng nghiệm thu Tầng 2 (Gate 2)**: Kiểm tra co giãn Sidebar mượt mà, chuyển theme Light/Dark không giật layout, Zoom 80-140% hoạt động tốt, Header không bị tràn trên màn hình 1024px/1366px/1920px.

### TẦNG 3: BẢNG DỮ LIỆU CHÍNH, BỘ LỌC ĐẢO & MODAL NHẬP LIỆU (DATA ORGANISMS)
- **Mục tiêu**: Đồng bộ toàn bộ các sinh vật phức tạp nhất của ứng dụng: Bảng 18 chỉ tiêu, Island FilterBar, Modal nhập liệu 18 chỉ số, và bảng đối soát 21 cột Excel.
- **Tệp chỉnh sửa & cài đặt**:
  1. `src/components/households/HouseholdFilterBar.tsx`: Chuẩn hóa khung Island bo `rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs`, ô tìm kiếm tích hợp nút xóa và nút refresh spinner, 3 CustomSelect quy mô/loại hình/sắp xếp, nút bung/thu gọn, nút xóa lọc hồng rose, thanh batch actions.
  2. `src/components/households/HouseholdTable.tsx`: Khung ngoài bo `rounded-3xl shadow-sm`, thanh 6 tab chế độ xem bo `rounded-2xl`, sticky columns (Checkbox, STT, Tên chủ hộ) kèm bóng đổ nổi, dòng hover emerald, font số `font-mono tabular-nums`, Accordion dòng con 4 thẻ bo `rounded-2xl` viền trái `border-l-4 border-l-emerald-500`.
  3. `src/components/households/HouseholdModal.tsx`: Chuyển đổi thành Modal/Drawer lớn bo `rounded-3xl shadow-2xl`, fixed header đen/slate với 3 nút tab lớn, dải cộng dồn tổng diện tích cây trồng và vật nuôi bo `rounded-2xl bg-emerald-50/60`, banner xung đột OCC 409 + nút tải lại, popup phát hiện trùng tên hộ, fixed footer actions.
  4. `src/components/excel/ImportPreviewModal.tsx`: Hộp thoại bo `rounded-3xl`, bảng cuộn đối soát 21 cột ghim cố định 2 cột đầu (STT và Họ Tên), font số monospace, nút đổi file và phân trang preview.
  5. `src/components/excel/ExportSettingsModal.tsx`: Hộp thoại bo `rounded-3xl`, thẻ chọn radio bo `rounded-2xl` viền sáng, nút bắt đầu xuất `rounded-xl`.
  6. `src/components/households/RecycleBinTable.tsx`: Bảng 21 cột cấu trúc 2 tầng bo `rounded-3xl`, sticky actions khôi phục và xóa vĩnh viễn bo `rounded-xl`.
  7. `src/components/audit/AuditLogView.tsx`: 6 Nút pill lọc sự kiện bo `rounded-xl`, timeline nodes tròn nổi `ring-4`, visual diff cũ/mới bo `rounded-xl`, từ điển 18 chỉ số `FIELD_LABELS`.
  8. `src/components/settings/BackupRestoreTab.tsx`: Khối xuất JSON bo `rounded-2xl`, khối Danger Zone CSDL bo `rounded-3xl border-rose-200 dark:border-rose-900/40`, modal thách thức mật khẩu Admin bo `rounded-3xl`.
- **Cổng nghiệm thu Tầng 3 (Gate 3)**: Kiểm thử toàn bộ 18 chỉ số hiển thị chuẩn xác, cuộn ngang bảng không lệch dòng sticky, tính toán cộng dồn trong modal hoạt động tức thì, OCC 409 bắt lỗi an toàn.

### TẦNG 4: RÁP NỐI MÀN HÌNH NGHIỆP VỤ, KIỂM THỬ E2E & QUẢN TRỊ CHẤT LƯỢNG (PAGES & QA)
- **Mục tiêu**: Ráp nối toàn bộ các trang chức năng, kiểm tra định tuyến AppContext, xác minh phân quyền Admin vs Trưởng thôn, và quét sạch 100% lỗi linter.
- **Tệp chỉnh sửa & cài đặt**:
  1. `src/pages/VillagesPage.tsx`: Hero banner gradient emerald bo `rounded-3xl`, 4 thẻ KPI nông nghiệp cấp xã, lưới 7 thẻ thôn bo `rounded-3xl` kèm tương tác hover zoom, form thêm thôn và cảnh báo xóa thôn.
  2. `src/pages/HouseholdsPage.tsx`: Header trang với huy hiệu thôn, cảnh báo ngoại tuyến, nút Đổi thôn, cụm nút Nhập/Xuất Excel và Thêm Hộ Dân.
  3. `src/pages/AnalyticsPage.tsx` & `src/components/analytics/AnalyticsDashboard.tsx`: Header báo cáo, 4 thẻ Hero KPI, 2 biểu đồ Donut SVG với màu sắc sắc nét, 4 thanh tiến độ vật nuôi, bảng đối soát so sánh 7 thôn cho Admin.
  4. `src/pages/RecycleBinPage.tsx`: Banner thùng rác bo `rounded-3xl`, nút Khôi phục và Xóa vĩnh viễn hàng loạt.
  5. `src/pages/SettingsPage.tsx`: 4 Tab cài đặt bo `rounded-2xl`, tab Tài khoản của tôi, bảng phân công cán bộ 7 thôn, tab thông tin đơn vị.
  6. `src/App.tsx`: Ráp nối toàn bộ router, kiểm tra hiển thị đúng theo 4 trạng thái vai trò người dùng.
- **Cổng nghiệm thu Tầng 4 (Gate 4 & Final QA)**:
  - Chạy `npm run lint` / `biome check` -> **0 lỗi linter**.
  - Chạy `npm run build` / `tsc --noEmit` -> **0 lỗi compiler, 0 lỗi kiểu TypeScript**.
  - Kiểm tra giao diện trên cả 2 theme Light và Dark Mode.
  - Xác nhận 100% tiếng Việt, 18 chỉ tiêu nông nghiệp, 21 cột Excel, và các luồng nghiệp vụ hoạt động hoàn hảo.
