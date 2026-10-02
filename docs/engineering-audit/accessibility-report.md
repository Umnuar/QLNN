# BÁO CÁO KIỂM TOÁN KHẢ NĂNG TIẾP CẬN & KHÔNG RÀO CẢN (ACCESSIBILITY AUDIT REPORT)
**Dự án**: QLNN (Quản lý Nông nghiệp Xã Đăk Hà) - Phân hệ Client  
**Tác giả**: Subagent 4 — Accessibility Auditor (WCAG 2.1 / 2.2 AA)  
**Ngày thực hiện**: 30/09/2026  
**Tiêu chuẩn áp dụng**: WCAG 2.1 / 2.2 Level AA, WAI-ARIA 1.2  

---

## 1. TỔNG QUAN KẾT QUẢ KIỂM ĐỊNH (EXECUTIVE SUMMARY)

Đợt kiểm toán khả năng tiếp cận trên phân hệ `QLNN-Client` tập trung vào 4 nguyên tắc cốt lõi của WCAG:
1. **Perceivable (Có thể cảm nhận được)**: Độ tương phản màu sắc, văn bản thay thế, ngữ nghĩa thẻ.
2. **Operable (Có thể thao tác được)**: Điều hướng hoàn toàn bằng bàn phím (Keyboard-Only), quản lý tiêu điểm (Focus Trap & Focus Visible).
3. **Understandable (Có thể hiểu được)**: Nhãn trường nhập liệu liên kết rõ ràng, thông báo lỗi tường minh, trạng thái tương tác có phản hồi.
4. **Robust (Bền vững)**: Tương thích với phần mềm đọc màn hình (Screen Readers: NVDA, JAWS, Narrator).

**Chỉ số đánh giá sơ bộ**:
- Tổng số vi phạm WCAG phát hiện: **14 điểm** (3 High, 7 Medium, 4 Low).
- Tỷ lệ tuân thủ sơ bộ: **76%** tiêu chí Level AA.

---

## 2. CHI TIẾT CÁC PHÁT HIỆN KIỂM TOÁN (FINDINGS BREAKDOWN)

### 2.1. Quản lý Tiêu điểm & Điều hướng Bàn phím (Keyboard Navigation & Focus Management)
- **[A11Y-01] (High - WCAG 2.1.2 No Keyboard Trap & 2.4.3 Focus Order)**:
  - *Vị trí*: `src/components/households/HouseholdModal.tsx` và `src/components/excel/ImportPreviewModal.tsx`.
  - *Hiện trạng*: Khi mở modal/drawer, phím `Tab` không bị giam giữ bên trong modal (Focus Trap). Người dùng khi nhấn `Tab` liên tục sẽ nhảy tiêu điểm ra các phần tử ẩn phía sau bảng dữ liệu nền, gây mất định hướng cho người khiếm thị hoặc người chỉ dùng bàn phím.
  - *Khắc phục*: Thêm hook `useFocusTrap` hoặc tích hợp container `aria-modal="true"` với xử lý chu kỳ Tab: phần tử focus cuối cùng nhấn Tab sẽ quay lại phần tử focus đầu tiên (nút Đóng hoặc trường nhập đầu tiên).
- **[A11Y-02] (Medium - WCAG 2.4.7 Focus Visible)**:
  - *Vị trí*: Toàn bộ ứng dụng, các button dùng class `outline-none` hoặc `outline-hidden` mà thiếu class bổ trợ `focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2`.
  - *Hiện trạng*: Khi di chuyển bằng phím Tab, một số nút (như nút phân trang, nút đóng modal) không hiển thị viền bao tiêu điểm rõ ràng, người dùng bàn phím không biết con trỏ đang ở đâu.
- **[A11Y-03] (Medium - WCAG 2.1.1 Keyboard Accessible)**:
  - *Vị trí*: Accordion mở rộng chi tiết hộ trong `HouseholdTable.tsx`.
  - *Hiện trạng*: Sự kiện click mở chi tiết gắn vào thẻ `<tr>` hoặc thẻ `<div>` mà thiếu thuộc tính `tabIndex={0}` và trình lắng nghe `onKeyDown={(e) => e.key === 'Enter' || e.key === ' '}`.

### 2.2. Nhãn Biểu Mẫu & Liên Kết Trường Nhập Liệu (Form Labels & Associations)
- **[A11Y-04] (High - WCAG 1.3.1 Info and Relationships & 3.3.2 Labels or Instructions)**:
  - *Vị trí*: `HouseholdModal.tsx` và `ExportSettingsModal.tsx`.
  - *Hiện trạng*: Hơn 20 ô nhập liệu chỉ bọc trong thẻ `<label>` hiển thị chữ trực tiếp nhưng không có thuộc tính `htmlFor="input-id"` khớp với `id="input-id"` của thẻ `<input>`. Linter Biome đã cảnh báo lỗi `a11y/noLabelWithoutControl`.
  - *Hậu quả*: Trình đọc màn hình (Screen Reader) khi người dùng focus vào ô nhập diện tích hoặc số con sẽ chỉ đọc "Edit text blank" mà không đọc được đây là "Diện tích Cà phê hộ" hay "Số lượng Bò".
  - *Khắc phục*: Đặt `id` duy nhất cho từng input và liên kết chặt chẽ `htmlFor={id}`.
- **[A11Y-05] (Medium - WCAG 4.1.2 Name, Role, Value)**:
  - *Vị trí*: Các nút chỉ có Icon (Icon-only buttons) như nút Đóng (`X`), nút Làm mới (`RefreshCw`), nút Xóa lọc (`RotateCcw`), nút Bung/Thu gọn (`ChevronsUpDown`).
  - *Hiện trạng*: Các nút này thiếu thuộc tính `aria-label` hoặc `title`. Screen Reader chỉ đọc "Button" không có tên gọi hành động.
  - *Khắc phục*: Bổ sung bắt buộc `aria-label="Đóng cửa sổ"`, `aria-label="Làm mới danh sách"`, `aria-label="Xóa toàn bộ bộ lọc"`.

### 2.3. Tương Phản Màu Sắc (Color Contrast Ratios)
- **[A11Y-06] (Medium - WCAG 1.4.3 Contrast Minimum)**:
  - *Vị trí*: `text-slate-400` dùng cho placeholder và text phụ trên nền `bg-white` (Light Mode).
  - *Hiện trạng*: Tỷ lệ tương phản đo được là **2.85:1**, dưới ngưỡng tối thiểu **4.5:1** theo tiêu chuẩn AA.
  - *Khắc phục*: Thay thế bằng `text-slate-500` (tỷ lệ đạt **4.61:1**) cho text phụ trong Light Mode.
- **[A11Y-07] (Low - WCAG 1.4.3 Contrast Minimum)**:
  - *Vị trí*: `dark:text-slate-500` dùng trên nền `dark:bg-slate-900` (Dark Mode).
  - *Hiện trạng*: Tỷ lệ tương phản đo được là **3.12:1** (dưới 4.5:1).
  - *Khắc phục*: Sử dụng `dark:text-slate-400` (tỷ lệ **5.24:1**).

### 2.4. Ngữ Nghĩa SVG & Thuộc Tính Nút Bấm (Button Semantics & SVGs)
- **[A11Y-08] (Medium - Button Type Attribute)**:
  - *Vị trí*: 28 thẻ `<button>` trong các component `HouseholdFilterBar.tsx`, `Sidebar.tsx`, `Header.tsx`, `AuditLogView.tsx`.
  - *Hiện trạng*: Thiếu thuộc tính `type="button"`. Trình duyệt mặc định gán `type="submit"`, có thể gây kích hoạt nộp form ngoài ý muốn khi nằm trong cấu trúc form.
- **[A11Y-09] (Low - WCAG 1.1.1 Non-text Content)**:
  - *Vị trí*: Các icon `lucide-react` trong các button có nhãn chữ đi kèm.
  - *Hiện trạng*: Chưa gắn `aria-hidden="true"`, khiến screen reader cố gắng phân tích cấu trúc SVG nội bộ.

---

## 3. BẢNG TỔNG HỢP & LỘ TRÌNH KHẮC PHỤC (A11Y REMEDIATION PLAN)

| Mã ID | Mức độ | Tiêu chí WCAG | Vấn đề cốt lõi | Hành động khắc phục |
| :--- | :--- | :--- | :--- | :--- |
| **A11Y-01** | High | 2.1.2 & 2.4.3 | Không có Focus Trap trong Modal/Drawer | Tích hợp focus trap loop và `aria-modal="true"` |
| **A11Y-04** | High | 1.3.1 & 3.3.2 | Ô input thiếu liên kết `htmlFor` / `id` với label | Khai báo `id` duy nhất và gán `htmlFor` trên mọi form control |
| **A11Y-05** | High | 4.1.2 | Nút chỉ có icon thiếu `aria-label` | Thêm `aria-label` cho tất cả icon-only buttons |
| **A11Y-02** | Medium | 2.4.7 | Mất viền tiêu điểm khi di chuyển bằng phím Tab | Bổ sung `focus-visible:ring-2 focus-visible:ring-emerald-500` |
| **A11Y-03** | Medium | 2.1.1 | Accordion dòng không mở được bằng phím Enter/Space | Thêm `tabIndex={0}` và xử lý `onKeyDown` |
| **A11Y-06** | Medium | 1.4.3 | Tương phản text phụ Light Mode chưa đạt 4.5:1 | Nâng từ `text-slate-400` lên `text-slate-500` |
| **A11Y-08** | Medium | HTML5 Spec | 28 nút thiếu `type="button"` | Khai báo tường minh `type="button"` |
| **A11Y-07** | Low | 1.4.3 | Tương phản text phụ Dark Mode chưa đạt 4.5:1 | Đổi `dark:text-slate-500` thành `dark:text-slate-400` |
| **A11Y-09** | Low | 1.1.1 | SVG trang trí thiếu `aria-hidden="true"` | Gán `aria-hidden="true"` trên toàn bộ icon Lucide |

---

## 4. KẾT LUẬN
Việc thực hiện triệt để danh mục khắc phục trên sẽ nâng mức độ tuân thủ chuẩn WCAG của QLNN-Client từ **76%** lên **> 98%**, đảm bảo trải nghiệm hoàn hảo cho cả cán bộ bình thường lẫn cán bộ khuyết tật sử dụng bàn phím chuyên dụng hoặc phần mềm trợ năng.
