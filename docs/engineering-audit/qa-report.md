# BÁO CÁO KIỂM THỬ TÁC VỤ THỰC TẾ & BIÊN DỮ LIỆU (QA & REAL-WORLD AUDIT REPORT)
**Dự án**: QLNN (Hệ sinh thái Dữ liệu Nông nghiệp Xã Đăk Hà)  
**Tác giả**: Subagent 5 — QA & Interaction Auditor  
**Ngày thực hiện**: 30/09/2026  
**Môi trường kiểm thử**: Windows 11 x64, Electron Desktop & Chrome Chromium 128, Node.js v20.18.0  

---

## 1. TỔNG QUAN KỊCH BẢN KIỂM THỬ (QA SCOPE & METHODOLOGY)

Đợt kiểm thử tác vụ thực tế mô phỏng trực tiếp quy trình vận hành hàng ngày của cán bộ UBND Xã và Trưởng thôn:
- Thực thi toàn trình luồng nghiệp vụ CRUD (Thêm, Sửa, Xóa mềm, Khôi phục, Xóa vĩnh viễn).
- Tương tác tìm kiếm tiếng Việt không dấu, kết hợp đa bộ lọc (Quy mô, Loại hình, Sắp xếp).
- Kiểm tra các trường hợp biên phân trang (Pagination Boundary Conditions).
- Kiểm tra dữ liệu biên của 18 chỉ tiêu nông nghiệp (Số âm, tràn số Decimal, dấu phẩy/chấm).
- Kiểm thử xung đột đồng thời (Optimistic Concurrency Control - OCC Conflict 409).
- Nhập tệp Excel 21 cột với định dạng dị biệt (dòng rỗng, tiêu đề thừa dấu cách, số thập phân `1,5` vs `1.5`).

---

## 2. KẾT QUẢ KIỂM THỬ CHI TIẾT THEO TỪNG KỊCH BẢN (TEST SCENARIOS & BUGS)

### Kịch bản 1: Luồng Nghiệp vụ CRUD & Xung đột Đồng thời (OCC)
- **Tình huống 1.1: Tạo mới hộ dân**:
  - *Thao tác*: Mở modal thêm hộ -> Nhập tên "Nguyễn Văn A" -> Điền 1.5ha Cà phê, 10 con Bò -> Lưu.
  - *Kết quả*: Thành công. Dữ liệu ghi vào bảng `households`, `crop_items`, `livestock_items`, tự động sinh `AuditLog` loại `CREATE`.
- **Tình huống 1.2: Xung đột sửa đổi đồng thời (OCC Conflict)**:
  - *Thao tác*: Hai cán bộ A và B cùng mở hộ ID 101 (đang ở `version = 3`). Cán bộ A bấm lưu trước -> `version` nhảy lên 4. Cán bộ B bấm lưu sau với payload `version = 3`.
  - *Hiện tượng thực tế*: Backend bắt được xung đột và trả về mã HTTP `409 Conflict: Dữ liệu đã bị thay đổi bởi người dùng khác`.
  - *Vấn đề phát hiện [QA-01]*: Frontend `HouseholdModal.tsx` nhận lỗi 409 nhưng chỉ hiển thị Toast báo lỗi chung chung màu đỏ `"Lỗi: Dữ liệu đã bị thay đổi...""`. Modal không tự động tải lại phiên bản mới (Fresh Fetch) hoặc cung cấp nút "Tải lại dữ liệu mới nhất", buộc người dùng phải đóng modal thủ công và mở lại, làm mất toàn bộ các số liệu họ vừa nhập.
  - *Đề xuất*: Hiển thị hộp thoại so sánh xung đột: `[ Dữ liệu trên máy bạn ]` vs `[ Dữ liệu vừa cập nhật trên máy chủ ]` kèm nút "Ghi đè với bản mới nhất" hoặc "Nạp bản mới".

### Kịch bản 2: Biên Dữ liệu 18 Chỉ Tiêu Nông Nghiệp
- **Tình huống 2.1: Nhập giá trị âm**:
  - *Thao tác*: Nhập diện tích Cà phê `-2.5` ha hoặc đàn heo `-15` con.
  - *Hiện tượng*: Frontend validation chưa chặn hoàn toàn ở sự kiện `onKeyDown` hoặc `onChange` (vẫn cho nhập ký tự dấu trừ `-`), khi bấm Lưu thì Zod Backend trả về lỗi 400.
  - *Vấn đề [QA-02]*: Cần chặn ngay tại tầng giao diện (`min="0"` và không cho gõ phím `-` trong input number).
- **Tình huống 2.2: Tràn số PostgreSQL Decimal(10,3)**:
  - *Thao tác*: Nhập diện tích `12345678.999` ha (vượt quá 7 chữ số nguyên của `Decimal(10,3)`).
  - *Hiện tượng*: Prisma Backend ném lỗi database `Numeric overflow` dẫn đến phản hồi lỗi 500 Unhandled.
  - *Vấn đề [QA-03]*: Zod schema trong `household.validation.ts` cần ràng buộc `.max(999999.999, 'Diện tích không hợp lệ')`.

### Kịch bản 3: Phân Trang & Bộ Lọc Biên (Pagination Edge Cases)
- **Tình huống 3.1: Bộ lọc làm giảm tổng số trang khi đang ở trang xa**:
  - *Thao tác*: Dữ liệu có 100 hộ (5 trang, mỗi trang 20 hộ). Người dùng chuyển sang Trang 4. Sau đó nhập tìm kiếm từ khóa "Kon Đao" chỉ khớp 3 hộ (tổng số trang giảm xuống 1).
  - *Hiện tượng thực tế*: Biến `currentPage` trong `HouseholdsPage.tsx` vẫn giữ giá trị 4, bảng hiển thị "Không tìm thấy dữ liệu" dù thực tế có 3 bản ghi ở trang 1.
  - *Vấn đề [QA-04] (P1)*: Thiếu logic tự động điều chỉnh trang (`if (currentPage > totalPages && totalPages > 0) setCurrentPage(1)` hoặc khi bộ lọc filter/search thay đổi thì bắt buộc reset `currentPage = 1`).

### Kịch bản 4: Nhập Tệp Excel 21 Cột (Smart-Upsert Parser)
- **Tình huống 4.1: Định dạng dấu phẩy tiếng Việt (`1,5` ha)**:
  - *Thao tác*: Người dùng nhập tệp Excel tạo từ Excel tiếng Việt, cột Cà phê ghi `1,5` thay vì `1.5`.
  - *Hiện trạng*: Parser `excel.controller.ts` đã có hàm chuẩn hóa `String(val).replace(',', '.')`. Parser xử lý chính xác thành số `1.5`. (PASS).
- **Tình huống 4.2: Dòng trống cuối tệp (Trailing Empty Rows)**:
  - *Thao tác*: Tệp Excel có 50 dòng dữ liệu và 10 dòng trống ở cuối có border nhưng không có chữ.
  - *Hiện trạng*: Parser nhận diện các dòng không có Tên chủ hộ và tự động bỏ qua. (PASS).
- **Tình huống 4.3: Tên chủ hộ trùng lặp trong cùng 1 tệp Excel**:
  - *Thao tác*: Tệp Excel chứa 2 dòng cùng mang tên "A Blong" thuộc Thôn 1.
  - *Vấn đề [QA-05] (P1)*: Dòng thứ hai ghi đè dữ liệu của dòng thứ nhất trong cùng 1 lô import mà không có cảnh báo cho cán bộ biết trong bảng Preview.
  - *Đề xuất*: Trong `ImportPreviewModal.tsx`, đánh dấu badge màu cam `[Trùng tên trong tệp]` ở cột Tên chủ hộ.

### Kịch bản 5: Phòng chống Spam Thao tác (Double Submission / Button Bouncing)
- **Tình huống 5.1: Nhấn liên tiếp nút Xóa hàng loạt**:
  - *Thao tác*: Chọn 5 hộ, bấm nút "Xóa" trên Filter Bar và click đúp cực nhanh (double click < 200ms) vào nút xác nhận modal.
  - *Hiện trạng*: Gửi 2 request `POST /api/households/bulk-delete` song song. Request thứ hai trả về `404` hoặc lỗi do các hộ đã bị xóa mềm từ request thứ nhất.
  - *Vấn đề [QA-06] (P2)*: Thiếu cờ debounce hoặc vô hiệu hóa nút (`disabled={isDeleting}`) ngay lập tức ở lần click đầu tiên.

---

## 3. BẢNG PHÂN LOẠI LỖI THEO ĐỘ ƯU TIÊN (QA DEFECT MATRIX)

| Mã Bug | Mức độ | Phạm vi | Mô tả hiện tượng | Giải pháp khắc phục |
| :--- | :--- | :--- | :--- | :--- |
| **QA-04** | **P1 (High)** | HouseholdsPage | Giữ nguyên trang cao khi bộ lọc làm giảm tổng trang -> bảng rỗng | Reset `currentPage = 1` khi `search`, `scaleFilter`, `typeFilter` thay đổi |
| **QA-01** | **P1 (High)** | HouseholdModal | Lỗi OCC 409 không có cơ chế tải lại dữ liệu mới, mất dữ liệu nhập | Thêm hộp thoại Conflict Recovery với nút "Tải lại & So sánh" |
| **QA-05** | **P1 (High)** | ImportPreviewModal | Trùng tên chủ hộ trong cùng tệp Excel không có cảnh báo | Phát hiện trùng lặp client-side trong mảng preview và gắn badge vàng |
| **QA-02** | **P2 (Medium)** | HouseholdModal | Vẫn cho gõ dấu âm `-` vào ô chỉ tiêu diện tích và số con | Chặn phím `-` trong `onKeyDown` và `Math.max(0, val)` trong `onChange` |
| **QA-03** | **P2 (Medium)** | household.validation.ts | Số diện tích > 9,999,999 gây crash Decimal Postgres | Thêm `.max(999999.999)` trong Zod schema backend |
| **QA-06** | **P2 (Medium)** | HouseholdFilterBar | Double click nút Xóa lô gửi trùng 2 request | Khóa nút bằng state `isSubmitting` ngay khi click lần 1 |

---

## 4. KẾT LUẬN & ĐÁNH GIÁ CHẤT LƯỢNG VẬN HÀNH
Các kịch bản kiểm thử tác vụ thực tế đã bộc lộ các lỗi biên quan trọng (đặc biệt là lỗi reset trang QA-04 và xử lý xung đột OCC QA-01). Đây là những điểm nghẽn cốt lõi cần được đưa vào danh sách task ưu tiên sửa chữa trước khi triển khai thực địa tại UBND Xã Đăk Hà.
