# DANH SÁCH CÁC LUỒNG NGƯỜI DÙNG KIỂM THỬ TRỰC TIẾP (QA TEST FLOWS)
## Dự án: Quản Lý Nông Nghiệp & Nông Thôn Mới Xã Đăk Hà (QLNN)
**Môi trường thực thi**: Localhost (`http://localhost:5174` - Client & `http://localhost:5001` - Backend API)  
**Tài khoản kiểm thử**: `admin` (Quản trị viên toàn xã)  
**Công cụ điều khiển**: Chromium Headless (Chrome DevTools Protocol - CDP port 9222)

---

## 1. TỔNG QUAN DANH MỤC 8 LUỒNG NGƯỜI DÙNG (TEST FLOWS MATRIX)

| Mã Luồng | Tên Luồng | Màn hình tương ứng | Mục tiêu kiểm thử |
| :---: | :--- | :--- | :--- |
| **FLOW-01** | Xác thực & Đăng nhập cán bộ | `LoginView.tsx` | Đăng nhập hợp lệ, báo lỗi sai mật khẩu, lưu token bảo mật |
| **FLOW-02** | Bản đồ Địa bàn & 7 Thôn Làng | `VillagesPage.tsx` | Thống kê 7 thôn, 4 thẻ KPI, chọn thôn, thêm thôn |
| **FLOW-03** | Danh sách Hộ & Thanh lọc Nâng cao | `HouseholdsPage.tsx` | Bộ lọc quy mô/loại hình/sắp xếp, 5 view mode tabs, phân trang |
| **FLOW-04** | Thêm, Sửa Hộ & Xung đột OCC | `HouseholdModal.tsx` | Form 18 chỉ tiêu, validate số liệu, kiểm soát xung đột OCC (409) |
| **FLOW-05** | Nhập / Xuất Excel 21 Cột Smart-Upsert | `ImportPreviewModal.tsx` | Bảng preview 21 cột, sticky STT & họ tên, đối soát nạp file |
| **FLOW-06** | Thùng Rác & Khôi phục Dữ liệu | `RecycleBinPage.tsx` | Danh sách xóa mềm, khôi phục cascade, xóa vĩnh viễn |
| **FLOW-07** | Nhật ký Hoạt động & Visual Diff | `AuditLogView.tsx` | Bộ lọc sự kiện (CREATE/UPDATE/DELETE/RESTORE), diff cũ ➡️ mới |
| **FLOW-08** | Cài đặt Hệ thống & Quản lý Cán bộ | `SettingsPage.tsx` | 4 tabs cài đặt, đổi mật khẩu cán bộ, sao lưu CSDL |

---

## 2. CHI TIẾT KỊCH BẢN TỪNG LUỒNG

### FLOW-01: Xác thực & Đăng nhập Cán bộ (Authentication Flow)
- **Mục đích**: Đảm bảo cán bộ đăng nhập an toàn, xử lý lỗi mượt mà và lưu trữ phiên đúng chuẩn.
- **Các bước thực hiện**:
  1. Truy cập `http://localhost:5174/`.
  2. Thử nghiệm luồng lỗi 1: Để trống Tên đăng nhập và Mật khẩu, nhấn **Đăng Nhập**.
  3. Thử nghiệm luồng lỗi 2: Nhập `admin` / mật khẩu sai `wrongpass`, nhấn **Đăng Nhập**.
  4. Thử nghiệm luồng thành công: Nhập tài khoản `admin` và mật khẩu chính xác, nhấn **Đăng Nhập**.
  5. Kiểm tra trạng thái lưu trữ token trong Storage (`accessToken`, `refreshToken`, `user`).
- **Kết quả mong đợi**:
  - Khi để trống hoặc sai: Hiển thị thông báo lỗi rõ ràng bằng tiếng Việt, nền hồng nhạt chữ đỏ (không lỗi mờ).
  - Khi đúng: Nút bấm hiển thị trạng thái loading spinner, chuyển trang vào AppLayout ngay lập tức mà không bị chớp giật hay văng trang.

---

### FLOW-02: Bản đồ Địa bàn & Quản lý 7 Thôn Làng (Villages Flow)
- **Mục đích**: Hiển thị tổng quan 7 thôn xã Đăk Hà và điều hướng chính xác vào thôn làm việc.
- **Các bước thực hiện**:
  1. Đăng nhập với quyền `admin`, kiểm tra màn hình mặc định ban đầu là tab **Quản Lý Thôn** (`activeTab === 'villages'`).
  2. Kiểm tra khối Hero Banner xanh ngọc trên cùng: Tiêu đề, huy hiệu `UBND XÃ ĐĂK HÀ`, số liệu tổng hợp (tổng hộ, tổng cây trồng ha, tổng vật nuôi con).
  3. Kiểm tra 4 Stat Cards: `ĐỊA BÀN QUẢN LÝ` (7 Thôn), `HỘ NÔNG NGHIỆP`, `TỔNG DIỆN TÍCH CÂY TRỒNG`, `TỔNG ĐÀN VẬT NUÔI`.
  4. Nhập từ khóa tìm kiếm thôn vào ô tìm kiếm: ví dụ gõ `Kon Đao` hoặc `Thôn 1`.
  5. Bấm vào 1 thẻ thôn (ví dụ: `Thôn 1`): Kiểm tra chuyển sang màn hình làm việc của thôn đó.
- **Kết quả mong đợi**:
  - Dữ liệu 7 thôn tải đủ; tìm kiếm không dấu hoạt động tức thì; click thẻ thôn chuyển ngữ cảnh `selectedVillageId` mượt mà.

---

### FLOW-03: Danh sách Hộ Nông Dân & Thanh Lọc Nâng Cao (Households Flow)
- **Mục đích**: Quản lý hồ sơ hộ nông nghiệp với mật độ thông tin cao, hỗ trợ 18 chỉ tiêu và lọc đa tiêu chí.
- **Các bước thực hiện**:
  1. Tại màn hình Hộ Nông Dân của thôn đang chọn, kiểm tra thanh tiêu đề hiển thị tên thôn kèm nút `← Đổi thôn`.
  2. Kiểm tra thanh công cụ Island: Ô tìm kiếm họ tên không dấu, dropdown **Quy mô**, dropdown **Loại hình**, dropdown **Sắp xếp**, nút **Bung/Thu gọn**, nút **Xóa lọc**.
  3. Thử nghiệm tìm kiếm họ tên: Gõ tên tiếng Việt không dấu (ví dụ: `a` hoặc `nguyen`).
  4. Thử nghiệm chọn dropdown Quy mô: Lớn (> 2ha / > 15 con), Vừa, Nhỏ.
  5. Thử nghiệm chuyển đổi 5 Tabs hiển thị (View Mode Tabs): **Tổng Hợp**, **Cây Trồng**, **Dược Liệu**, **Vật Nuôi**, **Thủy Sản**.
  6. Kiểm tra các cột cố định (Sticky Columns): Cuộn ngang sang phải kiểm tra STT và Họ Tên Chủ Hộ có giữ nguyên ở mép trái không.
  7. Kiểm tra phân trang `TablePagination`: Chuyển giữa các trang, đổi số dòng hiển thị (10, 20, 50, 100).
- **Kết quả mong đợi**:
  - Lọc và sắp xếp phản hồi dưới 100ms; chữ không bị nhảy dòng vụn vặt (`whitespace-nowrap`); phân trang hiển thị đúng tổng số bản ghi.

---

### FLOW-04: Thêm, Sửa Hộ Nông Dân & Xung Đột OCC (Household Form Flow)
- **Mục đích**: Nhập liệu 18 chỉ tiêu nông nghiệp an toàn, kiểm soát xung đột ghi đè đồng thời (OCC).
- **Các bước thực hiện**:
  1. Nhấn nút **[ + Thêm Hộ Dân ]** trên thanh công cụ: Drawer/Modal trượt mở từ cạnh phải.
  2. Kiểm tra 3 Tabs trong Form: **Cây Trồng**, **Vật Nuôi**, **Thủy Sản**.
  3. Nhập dữ liệu hợp lệ cho hộ mới: Họ tên, STT, diện tích cà phê (ha), cao su (ha), số lượng bò (con).
  4. Thử nghiệm validation: Nhập giá trị âm hoặc chuỗi ký tự vào ô số.
  5. Nhấn **Lưu Thông Tin**: Kiểm tra bản ghi xuất hiện trên bảng dữ liệu.
  6. Thử nghiệm Sửa hộ: Bấm nút Sửa trên dòng, đổi số liệu, lưu lại.
  7. Kiểm tra xử lý xung đột OCC: Mô phỏng version cũ khi lưu để kiểm tra banner cảnh báo lỗi 409 Conflict.
- **Kết quả mong đợi**:
  - Form bo góc tinh tế `rounded-3xl`, ô nhập focus hiển thị rõ ràng trên cả 2 theme; chặn số âm; hiển thị nút Tải lại dữ liệu khi gặp xung đột OCC.

---

### FLOW-05: Nhập / Xuất Excel 21 Cột Smart-Upsert (Excel Operations Flow)
- **Mục đích**: Đối soát biểu mẫu 21 cột của Đăk Hà, nhập thông minh (tự động phân biệt thêm mới vs cập nhật).
- **Các bước thực hiện**:
  1. Nhấn nút **[ Xuất Excel ]**: Kiểm tra tệp Excel được tải xuống trình duyệt với định dạng 21 cột chuẩn.
  2. Nhấn nút **[ Nhập Excel ]**: Chọn tệp Excel mẫu của thôn.
  3. Kiểm tra mở Modal **Preview Bảng Đối Soát 21 Cột**.
  4. Kiểm tra Header Modal: Badge trạng thái tệp, số dòng hợp lệ, nút `[ 🔄 Đổi Tệp Khác ]`, nút đóng.
  5. Kiểm tra bảng xem trước: Cuộn ngang 21 cột, STT và Họ tên ghim sticky cố định ở mép trái.
  6. Nhấn nút **[ Xác Nhận Nhập ]**: Đảm bảo dữ liệu được import thành công và bảng danh sách cập nhật.
- **Kết quả mong đợi**:
  - Không có cảnh báo lỗi console; bảng 21 cột phân màu trực quan theo 4 nhóm cây trồng/dược liệu/vật nuôi/thủy sản.

---

### FLOW-06: Thùng Rác & Khôi Phục Dữ Liệu (Recycle Bin Flow)
- **Mục đích**: Đảm bảo an toàn dữ liệu, chống mất mát dữ liệu do thao tác nhầm.
- **Các bước thực hiện**:
  1. Tại màn hình Hộ Nông Dân, chọn 1 hộ và bấm nút **Xóa (chuyển vào Thùng rác)**.
  2. Chuyển sang tab **Thùng Rác** (`activeTab === 'recycle-bin'`).
  3. Kiểm tra hộ vừa xóa xuất hiện trong danh sách kèm thời gian và người xóa.
  4. Bấm nút **[ Khôi Phục ]**: Xác nhận hộ biến mất khỏi Thùng rác và quay trở lại danh sách hoạt động.
  5. Thử nghiệm nút **[ Xóa Vĩnh Viễn ]** (Chỉ Admin): Kiểm tra hộp thoại xác nhận màu đỏ cảnh báo.
- **Kết quả mong đợi**:
  - Khôi phục nguyên vẹn cả hộ và toàn bộ thửa đất/vật nuôi con (`Cascade Restore`).

---

### FLOW-07: Nhật Ký Hoạt Động & Visual Diff (Audit Log Flow)
- **Mục đích**: Kiểm toán minh bạch toàn bộ biến động dữ liệu cấp xã.
- **Các bước thực hiện**:
  1. Chuyển sang tab **Nhật Ký** (`activeTab === 'audit'`).
  2. Kiểm tra Timeline biến động: Thời gian, IP máy trạm, người thực hiện.
  3. Kiểm tra Visual Diff tiếng Việt: So sánh giá trị cũ (gạch đỏ) ➡️ mới (in đậm xanh lá).
  4. Thử nghiệm thanh lọc sự kiện nhanh: Bấm các pill `Tất Cả`, `Thêm Mới`, `Cập Nhật`, `Xóa`, `Khôi Phục`, `Nhập Excel`.
  5. Thử nghiệm lọc theo Thôn hoặc tìm kiếm từ khóa.
- **Kết quả mong đợi**:
  - Không lộ các trường kỹ thuật nội bộ (`id`, `password_hash`, `token_version`).

---

### FLOW-08: Cài Đặt Hệ Thống & Quản Lý Cán Bộ (Settings Flow)
- **Mục đích**: Cấu hình tài khoản, phân quyền 7 thôn và kiểm soát sao lưu CSDL.
- **Các bước thực hiện**:
  1. Chuyển sang tab **Cài Đặt** (`activeTab === 'settings'`).
  2. Tab 1: **Tài Khoản Của Tôi**: Kiểm tra thông tin cá nhân và form đổi mật khẩu.
  3. Tab 2: **Quản Lý Cán Bộ 7 Thôn**: Bảng danh sách cán bộ, nút Thêm cán bộ mới, modal Sửa phân công thôn.
  4. Tab 3: **Sao Lưu CSDL**: Bấm nút **[ Tạo Bản Sao Lưu Snapshot ]**, kiểm tra tải tệp JSON. Thử nghiệm form phục hồi CSDL (yêu cầu mật khẩu admin).
  5. Tab 4: **Thông Tin Đơn Vị**: Thông tin UBND Xã Đăk Hà, hotline, bản quyền.
  6. Kiểm tra cụm nút Header: Nút điều khiển Zoom (+ / - / Reset), nút chuyển theme Dark / Light, nút Đăng xuất an toàn.
- **Kết quả mong đợi**:
  - Mọi thao tác quản lý cán bộ ghi audit log đầy đủ; chuyển đổi theme mượt mà không lỗi màu.
