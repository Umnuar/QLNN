# BÁO CÁO KẾT QUẢ KIỂM CHỨNG TRỰC TIẾP TRÊN TRÌNH DUYỆT (QA FINDINGS)
## Phân hệ: Quản Lý Nông Nghiệp & Nông Thôn Mới Xã Đăk Hà (QLNN)
**Môi trường thử nghiệm**: Localhost (`http://localhost:5174` - Client & `http://localhost:5001` - Backend API)  
**Trình duyệt điều khiển**: Chromium Headless (CDP Port 9222)  
**Tài khoản kiểm chứng**: `admin` (Quản trị viên toàn xã)  
**Thời gian thực thi**: 02/10/2026  
**Chi nhánh Git**: `fix/browser-qa` (Tag mốc: `pre-browser-qa`)

---

## 1. BẢNG TỔNG HỢP CÁC PHÁT HIỆN (FINDINGS MATRIX)

| ID | Loại | Tiêu đề | Mức độ | Độ tin cậy | Nhãn quyền sửa |
| :---: | :---: | :--- | :---: | :---: | :---: |
| **FINDING-01** | UI / Responsive | Sidebar không tự co giãn/ẩn trên mobile 360px ép hẹp nội dung & vỡ chữ tiêu đề Header | **P1** | Cao (≥2 lần) | **TỰ SỬA** |
| **FINDING-02** | UI / Giao diện | Truncation cắt cụt số liệu chính trên các Thẻ Stat Cards tại VillagesPage | **P2** | Cao (≥2 lần) | **TỰ SỬA** |
| **FINDING-03** | Chức năng / UX | Click vào Thẻ Thôn ở VillagesPage chỉ nhận click trên Nút Tiêu Đề thay vì toàn bộ Card | **P2** | Cao (≥2 lần) | **TỰ SỬA** |
| **FINDING-04** | UI / Giao diện | Badge Thôn đang chọn tại AuditLogView bị Truncate ở 1280px khi đặt cạnh nút Xem Toàn Xã | **P3** | Cao (≥2 lần) | **TỰ SỬA** |
| **FINDING-05** | Khả năng truy cập (A11y) | Thiếu thuộc tính `aria-label` trên các ô Checkbox chọn hộ dân trong bảng dữ liệu | **P3** | Cao (≥2 lần) | **TỰ SỬA** |
| **FINDING-06** | UI / Giao diện | Nút Đăng Nhập tại LoginView bị sát mép đáy màn hình ở độ phân giải thấp (800x600) | **P3** | Cao (≥2 lần) | **TỰ SỬA** |

---

## 2. CHI TIẾT TỪNG PHÁT HIỆN

### FINDING-01: Sidebar không tự co giãn/ẩn trên mobile 360px ép hẹp nội dung & vỡ chữ tiêu đề Header
- **Loại**: UI / Responsive
- **Mức độ**: P1
- **Độ tin cậy**: Cao (tái hiện ổn định 100%)
- **Nhãn quyền sửa**: **TỰ SỬA** (Lỗi UI responsive hiển thị, không thay đổi luồng nghiệp vụ).
- **Các bước tái hiện**:
  1. Mở trang chủ ứng dụng tại `http://localhost:5174/`.
  2. Đăng nhập tài khoản `admin`.
  3. Chuyển kích thước viewport của trình duyệt sang 360px x 640px (chuẩn mobile).
  4. Quan sát Header và Sidebar.
- **Kết quả thực tế vs Mong đợi**:
  - *Thực tế*: Sidebar giữ nguyên độ rộng cố định `w-64` (260px), chiếm hơn 70% chiều ngang màn hình 360px, khiến vùng nội dung chính chỉ còn ~90px, văn bản "Danh Sách Hộ Nông Nghiệp" bị ngắt thành từng ký tự xếp dọc. Đồng thời tiêu đề Header "QUẢN LÝ NÔNG NGHIỆP" bị vỡ thành 4 dòng chữ chồng lấn.
  - *Mong đợi*: Trên màn hình nhỏ (< 768px), Sidebar tự động ẩn (hoặc thu nhỏ dạng icon bar/drawer có nút hamburger bật mở), Header co giãn gọn gàng để vùng nội dung hiển thị rõ nét.
- **Bằng chứng**: Ảnh chụp màn hình `docs/qa/evidence-responsive-360px.png`.
- **Vị trí trong code**: `src/components/Layout/Sidebar.tsx:180` và `src/components/Layout/Header.tsx:48`.

---

### FINDING-02: Truncation cắt cụt số liệu chính trên các Thẻ Stat Cards tại VillagesPage
- **Loại**: UI / Giao diện
- **Mức độ**: P2
- **Độ tin cậy**: Cao (tái hiện ổn định 100%)
- **Nhãn quyền sửa**: **TỰ SỬA** (Lỗi hiển thị UI, text truncation).
- **Các bước tái hiện**:
  1. Đăng nhập tài khoản `admin`.
  2. Tại màn hình Quản Lý Thôn, quan sát 4 thẻ KPI thống kê tổng hợp (Thẻ 1, 2, 3, 4) ở viewport tiêu chuẩn 1280px x 800px.
- **Kết quả thực tế vs Mong đợi**:
  - *Thực tế*: Số liệu diện tích cây trồng bị cắt thành `1.200.0...`, số lượng vật nuôi bị cắt thành `400.550...`, và phụ đề bị cắt `Toàn địa bàn Xã Đăk ...` do class `truncate` trên `text-2xl font-black`.
  - *Mong đợi*: Số liệu hành chính phục vụ báo cáo cấp xã phải hiển thị trọn vẹn số (`1.200.034,3 ha`, `400.550 con`).
- **Bằng chứng**: Ảnh chụp màn hình `docs/qa/evidence-flow-01-success.png` và `docs/qa/evidence-flow-02-villages.png`.
- **Vị trí trong code**: `src/pages/VillagesPage.tsx:340-395`.

---

### FINDING-03: Click vào Thẻ Thôn ở VillagesPage chỉ nhận click trên Nút Tiêu Đề thay vì toàn bộ Card
- **Loại**: Chức năng & UX
- **Mức độ**: P2
- **Độ tin cậy**: Cao (tái hiện ổn định 100%)
- **Nhãn quyền sửa**: **TỰ SỬA** (Cải thiện trải nghiệm thao tác người dùng, không đổi API hay schema).
- **Các bước tái hiện**:
  1. Vào trang Quản Lý Thôn (`VillagesPage`).
  2. Di chuột và click vào khoảng trống giữa thẻ thôn hoặc vùng số liệu hộ / diện tích ở nửa dưới thẻ.
- **Kết quả thực tế vs Mong đợi**:
  - *Thực tế*: Không có phản ứng chuyển trang. Sự kiện `onClick={() => handleVillageClick(village.id)}` chỉ được gán trên thẻ `<button>` chứa icon MapPin và thẻ `<h4>` tiêu đề.
  - *Mong đợi*: Theo đúng hướng dẫn "Bấm vào thẻ thôn để chuyển nhanh đến màn hình làm việc của thôn đó", người dùng bấm vào bất kỳ vị trí nào trên thẻ thôn (ngoại trừ cụm nút Sửa/Xóa tên thôn) đều lập tức chuyển vào thôn đó.
- **Bằng chứng**: Bằng chứng thao tác DOM trong `scratch/qa_runner_flows_02_03_04.cjs` và `src/pages/VillagesPage.tsx:582-625`.
- **Vị trí trong code**: `src/pages/VillagesPage.tsx:576-620`.

---

### FINDING-04: Badge Thôn đang chọn tại AuditLogView bị Truncate ở 1280px khi đặt cạnh nút Xem Toàn Xã
- **Loại**: UI / Giao diện
- **Mức độ**: P3
- **Độ tin cậy**: Cao (tái hiện ổn định 100%)
- **Nhãn quyền sửa**: **TỰ SỬA** (Tinh chỉnh CSS hiển thị badge).
- **Các bước tái hiện**:
  1. Chọn Thôn 1.
  2. Bấm vào mục "Nhật Ký Hoạt Động" trên Sidebar ở viewport 1280px x 800px.
  3. Quan sát thanh công cụ tìm kiếm và bộ lọc thôn.
- **Kết quả thực tế vs Mong đợi**:
  - *Thực tế*: Dòng chữ trên badge bị cắt cụt thành `Đang xem biến động dữ li...` do giới hạn chiều rộng cứng khi đứng cạnh nút `[ Xem Toàn Xã ]`.
  - *Mong đợi*: Nhãn ngữ cảnh hiển thị đầy đủ: `Đang xem biến động dữ liệu: Thôn 1`.
- **Bằng chứng**: Ảnh chụp màn hình `docs/qa/evidence-flow-07-audit-log.png`.
- **Vị trí trong code**: `src/components/audit/AuditLogView.tsx:125-140`.

---

### FINDING-05: Thiếu thuộc tính `aria-label` trên các ô Checkbox chọn hộ dân trong bảng dữ liệu
- **Loại**: Khả năng truy cập (A11y)
- **Mức độ**: P3
- **Độ tin cậy**: Cao (tái hiện ổn định 100%)
- **Nhãn quyền sửa**: **TỰ SỬA** (Bổ sung thuộc tính trợ năng A11y).
- **Các bước tái hiện**:
  1. Mở trang Hộ Nông Nghiệp (`HouseholdsPage`) hoặc Thùng Rác (`RecycleBinPage`).
  2. Kiểm tra phần tử các ô checkbox ở cột 1 của từng dòng trong DOM.
- **Kết quả thực tế vs Mong đợi**:
  - *Thực tế*: Thẻ `<input type="checkbox" ... />` không có `aria-label` hay nhãn liên kết, bị cảnh báo accessibility khi sử dụng công nghệ hỗ trợ.
  - *Mong đợi*: Mỗi ô checkbox có thuộc tính `aria-label={`Chọn hộ ${household.full_name}`}` và checkbox chọn tất cả có `aria-label="Chọn tất cả hộ dân"`.
- **Bằng chứng**: Báo cáo kiểm tra A11y tự động trong `scratch/qa_runner_responsive_security.cjs`.
- **Vị trí trong code**: `src/components/households/HouseholdTable.tsx:288` và `src/components/households/RecycleBinTable.tsx`.

---

### FINDING-06: Nút Đăng Nhập tại LoginView bị sát mép đáy màn hình ở độ phân giải thấp (800x600)
- **Loại**: UI / Giao diện
- **Mức độ**: P3
- **Độ tin cậy**: Cao (tái hiện ổn định 100%)
- **Nhãn quyền sửa**: **TỰ SỬA** (Tối ưu padding và khoảng cách form đăng nhập).
- **Các bước tái hiện**:
  1. Mở trang đăng nhập tại viewport 800px x 600px.
  2. Quan sát khoảng cách từ nút Đăng Nhập đến chân màn hình.
- **Kết quả thực tế vs Mong đợi**:
  - *Thực tế*: Nút Đăng Nhập và dòng chữ bản quyền bảo mật bị ép sát xuống mép đáy của viewport do padding card `p-8` và `space-y-6`.
  - *Mong đợi*: Khung đăng nhập căn giữa hài hòa với khoảng đệm thoải mái ở cả trên và dưới.
- **Bằng chứng**: Ảnh chụp màn hình `docs/qa/evidence-flow-01-login.png`.
- **Vị trí trong code**: `src/components/auth/LoginView.tsx:85`.

---

## 3. CÁC HẠNG MỤC ĐẠT CHUẨN (VERIFIED CLEAN)
- **Bảo mật thụ động**: Không có token, mật khẩu thô hoặc key nhạy cảm bị lưu trữ mất an toàn trong LocalStorage/SessionStorage/Cookie. `token_version` được theo dõi chính xác. Không có lỗ hổng XSS thụ động.
- **Console & Mạng**: 0 cảnh báo React (0 key warning, 0 setState after unmount), 0 unhandled exception.
- **Tính năng nghiệp vụ cốt lõi**:
  - 18 chỉ tiêu nông nghiệp phân loại chính xác theo 4 nhóm.
  - Kiểm soát xung đột đồng thời OCC 409 hiển thị banner cảnh báo và nút nạp dữ liệu mới nhất.
  - Thùng rác xóa mềm và khôi phục cascade hoạt động hoàn hảo.
  - Bảng preview đối soát 21 cột Excel ghim cố định 2 cột STT & Họ tên khi cuộn ngang.
  - Nhật ký hoạt động hiển thị visual diff tiếng Việt trực quan (cũ ➡️ mới).
  - Cụm điều khiển Zoom và chuyển đổi Dark/Light mode phản hồi tức thì.
