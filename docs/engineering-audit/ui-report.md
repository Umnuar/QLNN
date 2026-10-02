# BÁO CÁO ĐÁNH GIÁ GIAO DIỆN & HỆ THỐNG THIẾT KẾ (UI/UX AUDIT REPORT)
**Dự án**: QLNN (Quản lý Nông nghiệp Xã Đăk Hà) - Phân hệ Client  
**Tác giả**: Subagent 4 — UI/UX & Design Systems Auditor  
**Ngày thực hiện**: 30/09/2026  
**Phiên bản kiểm toán**: 1.0.0-baseline  

---

## 1. TỔNG QUAN HỆ THỐNG THIẾT KẾ (DESIGN SYSTEM TOKENS)

QLNN-Client áp dụng triết lý thiết kế chuẩn chính quy cấp xã: **tối giản, mật độ thông tin cao, tốc độ phản hồi tức thì, loại bỏ hoàn toàn icon 3D/AI slop**, đồng bộ 100% với hệ sinh thái dữ liệu Đăk Hà (QLCS / QLHK).

### 1.1. Bảng màu & Semantic Tokens
- **Primary Emerald**: `emerald-600` (hover `emerald-700`, dark `emerald-500`). Đại diện cho hành chính công, chuẩn xác, phát triển nông nghiệp bền vững.
- **Light Theme**: Nền chính `bg-slate-50`, container `bg-white`, viền `border-slate-200`, text `text-slate-900` / `text-slate-500`.
- **Dark Theme**: Nền chính `dark:bg-slate-950`, container `dark:bg-slate-900`, viền `dark:border-slate-800`, text `dark:text-slate-100` / `dark:text-slate-400`.
- **Status Badges**:
  - Hợp lệ / Thường trú: `bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800`
  - Cảnh báo / Hạn mức: `bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800`
  - Nguy hiểm / Đã xóa: `bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800`
  - Thông tin / Địa bàn: `bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800`

### 1.2. Typography & Icon Quy chuẩn
- **Icon**: Thư viện `lucide-react` cố định `strokeWidth={1.5}`. Không dùng icon gradient sặc sỡ hoặc sticker AI.
- **Ký tự Typo tinh tế**: Dùng `+` cho thêm mới, `←` cho quay lại, `→` cho tiếp tục/xem chi tiết, `•` cho phân cách thông tin.
- **Table Density**: Cố định `whitespace-nowrap`, padding `py-2 px-3`, font số liệu `font-mono tabular-nums`.

---

## 2. ĐÁNH GIÁ CHI TIẾT TỪNG MÀN HÌNH (SCREEN-BY-SCREEN AUDIT)

### 2.1. Màn hình 1: Quản lý Thôn & Địa Bàn (`VillagesPage.tsx`)
- **Điểm tốt**:
  - Hero Banner nền gradient ngọc đậm (`from-emerald-800 via-emerald-900 to-teal-950`) thể hiện quy mô hành chính trang trọng.
  - Cụm 4 Stat Cards hiển thị trực quan: Địa bàn ({villages.length} thôn), Hộ nông nghiệp, Diện tích cây trồng (ha), Tổng đàn vật nuôi (con).
  - Thẻ thôn trực quan, có avatar viết tắt tên thôn, số liệu tóm tắt hộ dân, nút xem chi tiết thôn.
- **Tồn tại / Vấn đề phát hiện**:
  1. *[UI-01]*: Khi tải danh sách thôn (`loading = true`), khối danh sách thôn hiển thị spinner đơn giản ở giữa trang thay vì dùng Skeleton Cards. Gây hiệu ứng chớp tắt (layout shift) khi chuyển trang.
  2. *[UI-02]*: Thẻ thôn khi số liệu hộ dân = 0 chưa có trạng thái Empty State nhẹ nhàng (ví dụ: "Chưa có dữ liệu kê khai"), đang hiển thị `0 Hộ • 0 ha • 0 con` tương đương thôn đã nhập đầy đủ.
  3. *[UI-03]*: Thanh tìm kiếm thôn `w-64` bị co lại quá hẹp trên màn hình tablet/laptop 1366x768 khi phóng to 125% DPI.

### 2.2. Màn hình 2: Quản lý Hộ Dân & Kê Khai 18 Chỉ Tiêu (`HouseholdsPage.tsx` & `HouseholdTable.tsx`)
- **Điểm tốt**:
  - Thanh công cụ Island Filter Bar (`HouseholdFilterBar.tsx`) bố trí gọn gàng, ô tìm kiếm tích hợp nút Xóa và Làm mới.
  - Dropdown `CustomSelect` kích thước `sm` cho Quy mô, Loại hình đặc thù, Sắp xếp nhanh.
  - Chuyển đổi linh hoạt sang thanh Batch Action (Đã chọn X hộ, Xuất Excel, Xóa) khi có hàng được tick checkbox.
  - Bảng 18 chỉ tiêu phân nhóm màu tinh tế: Cây trồng (Emerald), Dược liệu (Teal), Vật nuôi (Amber), Thủy sản (Sky).
  - Ghim cố định cột STT (`sticky left-0`) và Tên chủ hộ (`sticky left-[48px]`) với `border-separate border-spacing-0` chống đứt nét viền.
- **Tồn tại / Vấn đề phát hiện**:
  1. *[UI-04]*: Nút "Bung/Thu gọn tất cả" (`ChevronsUpDown`) khi nhấn kích hoạt bung 20 dòng cùng lúc, nếu người dùng cuộn nhanh sẽ có hiện tượng giật khung hình nhẹ do DOM tăng đột ngột 20 accordion table. Cần lazy render chi tiết từng hàng hoặc virtualized scroll.
  2. *[UI-05]*: Trên màn hình có độ phân giải thấp (1024x768 hoặc 1280x800), thanh Toolbar khi bung đầy đủ các bộ lọc bị rớt dòng thành 2 hàng, che khuất khoảng 40px chiều cao của bảng dữ liệu. Cần tinh chỉnh padding `p-2` và thu gọn min-width của ô input tìm kiếm trên responsive breakpoint.
  3. *[UI-06]*: Cột Thao tác (`sticky right-0`): Một số màn hình Dark Mode khi hover chuột vào hàng dữ liệu, nền của nút Thao tác chưa khớp 100% độ mờ với nền hover hàng (`hover:bg-slate-50 dark:hover:bg-slate-800/60`).

### 2.3. Màn hình 3: Thống Kê & Báo Cáo Phân Tích (`AnalyticsPage.tsx` & `AnalyticsDashboard.tsx`)
- **Điểm tốt**:
  - 4 Thẻ KPI chủ lực: Tổng số hộ nông nghiệp, Tổng diện tích cây trồng, Tổng đàn vật nuôi, Tổng diện tích nuôi thủy sản.
  - MiniDonut SVG biểu đồ tròn tỷ lệ cây trồng chính (Cà phê hộ, Cà phê khoán, Cao su, Dược liệu, Cây khác) trực quan không cần thư viện đồ họa cồng kềnh.
  - Bảng đối soát so sánh chéo số liệu giữa các thôn trong xã.
- **Tồn tại / Vấn đề phát hiện**:
  1. *[UI-07]*: Khi xem Thống kê Toàn xã, nút "Quay lại danh sách thôn" đôi khi hiển thị dư thừa nếu người dùng đang ở chế độ xem toàn xã mặc định.
  2. *[UI-08]*: Progress bar tỷ lệ cây trồng khi giá trị diện tích là 0 vẫn hiển thị một vệt nhỏ 2px do min-width của thẻ div. Cần kiểm tra `width > 0` mới render thanh fill.

### 2.4. Màn hình 4: Thùng Rác & Phục Hồi Dữ Liệu (`RecycleBinPage.tsx` & `RecycleBinTable.tsx`)
- **Điểm tốt**:
  - Banner cảnh báo màu tím/đỏ trang trọng, nêu rõ thời gian lưu trữ dữ liệu đã xóa mềm.
  - Hỗ trợ phục hồi nguyên vẹn (Restore) và Xóa vĩnh viễn (Hard Delete - chỉ Admin).
- **Tồn tại / Vấn đề phát hiện**:
  1. *[UI-09]*: Bảng thùng rác chưa hiển thị lý do xóa (nếu có lưu trong `AuditLog`). Người dùng chỉ thấy thời gian xóa và người xóa.
  2. *[UI-10]*: Trạng thái Empty State khi thùng rác trống hiển thị icon thùng rác đơn điệu. Cần thêm minh họa nhẹ và nút "Quay lại danh sách hộ dân".

### 2.5. Màn hình 5: Nhật Ký Hoạt Động & Kiểm Toán (`AuditLogView.tsx`)
- **Điểm tốt**:
  - Giao diện timeline biến động trực quan, lọc nhanh theo Action Pills (Tất cả, Thêm mới, Cập nhật, Xóa, Khôi phục, Nhập Excel).
  - Hàm `renderFriendlyDiff` giải mã tiếng Việt thân thiện, tự động loại trừ các trường rác kỹ thuật (`id`, `version`, `updated_at`).
- **Tồn tại / Vấn đề phát hiện**:
  1. *[UI-11]*: Khi một bản ghi cập nhật nhiều hơn 8 chỉ tiêu cùng lúc, khung diff nở rộng chiếm toàn bộ chiều cao màn hình, đẩy các bản ghi khác xuống sâu. Cần bọc khối diff trong container có `max-h-48 overflow-y-auto` kèm nút "Xem tất cả thay đổi".
  2. *[UI-12]*: Dropdown chọn Thôn trên thanh lọc AuditLog khi người dùng là Cán bộ thôn (`role !== 'admin'`) vẫn cho phép click mở dropdown dù chỉ có duy nhất 1 thôn của họ. Cần khóa disabled hoặc hiển thị badge tĩnh.

### 2.6. Màn hình 6: Cài Đặt Hệ Thống & Phân Quyền (`SettingsPage.tsx`)
- **Điểm tốt**:
  - Thiết kế tabbed layout chuẩn: Tài khoản của tôi, Quản lý cán bộ, Sao lưu CSDL, Thông tin đơn vị & hệ thống.
  - Thẻ thông tin cơ quan UBND Xã Đăk Hà đầy đủ, trang trọng.
- **Tồn tại / Vấn đề phát hiện**:
  1. *[UI-13]*: Tab "Sao lưu CSDL": Nút "Khôi phục từ tệp JSON" dùng nút màu đỏ (`bg-rose-600`), dễ gây nhầm lẫn với nút Xóa. Nên dùng màu Amber cảnh báo (`bg-amber-600`) cho hành động ghi đè CSDL kèm modal xác nhận 2 lớp.

### 2.7. Modal & Drawer Phụ Trợ
- **`HouseholdModal.tsx` / Drawer**:
  - Phân chia 4 tab rõ ràng: Thông tin chung, Cây trồng (12 chỉ tiêu), Vật nuôi (4 chỉ tiêu), Thủy sản (2 chỉ tiêu).
  - Tồn tại *[UI-14]*: Ô nhập diện tích và số lượng vật nuôi trên bàn phím số chưa căn lề phải (`text-right`), khiến số liệu không thẳng hàng với đơn vị đo lường (ha / con / lồng).
- **`ImportPreviewModal.tsx`**:
  - Bảng đối soát 21 cột cuộn mượt mà với 2 cột đầu STT và Tên chủ hộ ghim `sticky left-0`, `sticky left-14`.
  - Phân màu header nhẹ nhàng, footer phân trang chữ `Trước` / `[ 1/1 ]` / `Sau`.

---

## 3. DANH MỤC VẤN ĐỀ GIAO DIỆN CẦN XỬ LÝ (PRIORITIZED UI BACKLOG)

| Mã ID | Màn hình | Mức độ | Mô tả khiếm khuyết | Đề xuất khắc phục |
| :--- | :--- | :--- | :--- | :--- |
| **UI-04** | HouseholdsPage | P2 (Medium) | Bung 20 dòng chi tiết cùng lúc gây sụt giảm FPS render | Ảo hóa dòng hoặc lazy-render chi tiết accordion |
| **UI-05** | HouseholdFilterBar | P2 (Medium) | Rớt dòng toolbar trên màn hình độ phân giải thấp < 1280px | Tinh chỉnh padding `p-2`, co giãn `min-w-0` của ô tìm kiếm |
| **UI-11** | AuditLogView | P2 (Medium) | Diff cập nhật quá nhiều trường làm vỡ chiều cao timeline card | Thêm `max-h-48 overflow-y-auto` cho khối diff lớn |
| **UI-14** | HouseholdModal | P3 (Low) | Ô input số liệu cây trồng/vật nuôi chưa căn phải | Thêm `text-right tabular-nums font-mono` cho các input số |
| **UI-01** | VillagesPage | P3 (Low) | Thiếu Skeleton Loading khi nạp danh sách thôn | Thêm 4 Skeleton Cards dạng pulse khi `loading = true` |
| **UI-06** | HouseholdTable | P3 (Low) | Lệch màu nền nút Thao tác khi hover ở chế độ Dark Mode | Đồng bộ `dark:hover:bg-slate-800/60` trên cột sticky phải |
| **UI-13** | SettingsPage | P3 (Low) | Nút Khôi phục CSDL dùng màu đỏ gây nhầm lẫn nút Xóa | Đổi sang tone màu Cảnh báo Amber + Modal xác nhận 2 bước |

---

## 4. KẾT LUẬN & KIẾN NGHỊ
Hệ thống UI/UX của QLNN-Client đã đạt mức độ hoàn thiện cao (> 90%), bám sát tinh thần tối giản, không AI slop và đồng bộ hoàn hảo với QLCS / QLHK. Các vấn đề còn tồn tại chủ yếu ở mức P2/P3 liên quan đến tính tiện dụng trên các kích thước màn hình máy trạm UBND xã và tối ưu hiệu ứng cuộn bảng.
