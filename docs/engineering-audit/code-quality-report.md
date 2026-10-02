# CODE QUALITY & CLEAN CODE AUDIT REPORT: QUẢN LÝ NÔNG NGHIỆP (QLNN)
## Agent 1 — Clean Code / Refactor Auditor | Phân Hệ QLNN — Đăk Hà Ecosystem

---

## 1. Kết Quả Đo Đạc Tĩnh (Static Code Analysis Metrics)

Được đo lường trực tiếp qua bộ công cụ **Biome v2.5.14** và **TypeScript v5.2.2**:

| Chỉ Số Kiểm Tra | Số Lượng Lỗi / Cảnh Báo | Đánh Giá Mức Độ |
| :--- | :---: | :--- |
| **Biome Errors** | **80 lỗi** | Cần xử lý triệt để trước khi xuất xưởng |
| **Biome Warnings** | **118 cảnh báo** | Chủ yếu là `any` và index key |
| **TypeScript Type Errors** | **0 lỗi (`tsc --noEmit` exit 0)** | Hệ thống type hiện tại đạt chuẩn biên dịch |
| **Dead Code / Mồ côi** | **3 vị trí quan trọng** | State thừa không bao giờ render |
| **Shadowing Global Variables** | **1 vị trí** | Import `Map` từ Lucide đè `Map` của JS engine |

---

## 2. Chi Tiết Các Lỗi Chất Lượng Mã Nguồn Cụ Thể

### CODE-01: Shadowing Global Namespace Trong Điều Hướng
- **Vị trí**: `QLNN-Client/src/components/Layout/Sidebar.tsx` (dòng 5).
- **Vấn đề**:
  ```tsx
  import { Database, History, Map, PanelLeftClose, PanelLeftOpen } from "lucide-react";
  ```
  Biến `Map` được import từ thư viện icon đã che khuất (shadow) cấu trúc dữ liệu toàn cục `Map` chuẩn của JavaScript. Dù trình biên dịch vẫn chạy được, nhưng dễ gây nhầm lẫn nghiêm trọng cho các nhà phát triển và công cụ phân tích tĩnh khi muốn sử dụng `new Map()`.
- **Khắc phục**: Đổi tên import thành `import { Map as MapIcon } from "lucide-react"`.

### CODE-02: State Mồ Côi & Timer Rác (Dead State & Unused Timer)
- **Vị trí**: `QLNN-Client/src/pages/HouseholdsPage.tsx` (dòng 90-99).
- **Vấn đề**:
  ```tsx
  const [undoAction, setUndoAction] = useState<{ ids: string[] } | null>(null);

  useEffect(() => {
    if (undoAction) {
      const timer = setTimeout(() => {
        setUndoAction(null);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [undoAction]);
  ```
  State `undoAction` và `useEffect` khởi tạo timer 15 giây tồn tại trong component nhưng **hoàn toàn không được hiển thị (render) hay kích hoạt bởi bất kỳ nút bấm nào** trong toàn bộ file! Đây là tàn dư code thừa từ tính năng Undo cũ đã bị loại bỏ.
- **Khắc phục**: Gỡ bỏ hoàn toàn state và effect này.

### CODE-03: Thẻ Button Không Khai Báo Thuộc Tính `type` (Accidental Form Submission)
- **Vị trí**: Xuất hiện tại 28 vị trí trên các component:
  - `ErrorBoundary.tsx` (dòng 48)
  - `ExportSettingsModal.tsx` (dòng 43)
  - `LoginView.tsx` (nút submit và nút toggle mật khẩu)
  - `HouseholdTable.tsx` (các nút hành động trên từng dòng)
- **Hệ quả**: Trong HTML chuẩn, thẻ `<button>` không có `type` sẽ mặc định mang giá trị `type="submit"`. Khi đặt bên trong thẻ `<form>`, việc bấm các nút phụ (như đóng modal, mở menu) sẽ vô tình kích hoạt sự kiện submit form và tải lại trang.
- **Khắc phục**: Bổ sung rõ ràng `type="button"` cho tất cả các nút tương tác thông thường, chỉ giữ `type="submit"` cho nút gửi dữ liệu form.

### CODE-04: Form Labels Thiếu Liên Kết Với Input (`htmlFor` / `id`)
- **Vị trí**:
  - `LoginView.tsx` (dòng 93, dòng 113)
  - `ExportSettingsModal.tsx` (dòng 53)
  - `HouseholdModal.tsx` (các ô nhập 18 chỉ tiêu)
- **Vấn đề**: Thẻ `<label>` không có thuộc tính `htmlFor` trỏ tới `id` của thẻ `<input>` tương ứng.
- **Hệ quả**: Giảm trải nghiệm người dùng (người dùng bấm vào nhãn chữ thì con trỏ không tự động nhảy vào ô nhập liệu) và vi phạm chuẩn tiếp cận WCAG.
- **Khắc phục**: Bổ sung cặp `id` trên input và `htmlFor` trên label.

### CODE-05: Lạm Dụng Ép Kiểu `any` (Unsafe Type Casts)
- **Vị trí**:
  - `QLNN-Client/src/vite-env.d.ts` (dòng 6-7): `get: (key: string) => Promise<any>; set: (key: string, value: any) => Promise<boolean>;`
  - `QLNN-Client/src/utils/cryptoHelper.ts`: Sử dụng `any` trong các hàm format số liệu.
  - `QLNN-Backend/src/controllers/household.controller.ts`: Ép kiểu `(oldData as any)[key]` khi tính diff.
- **Khắc phục**: Thay thế bằng kiểu dữ liệu an toàn `unknown` hoặc `Record<string, number | string | null>`.

### CODE-06: Sử Dụng Hàm Kiểm Tra `isNaN` Toàn Cục Không An Toàn
- **Vị trí**: `formatters.ts` (dòng 50), `AuditLogView.tsx`, `excelParser.ts`.
- **Vấn đề**: `isNaN(val)` tự động ép kiểu chuỗi (type coercion), ví dụ `isNaN(" ")` trả về `false` (vì chuỗi khoảng trắng bị ép thành 0).
- **Khắc phục**: Sử dụng chuẩn an toàn `Number.isNaN(...)`.

---

## 3. Đánh Giá Độ Trùng Lặp Logic (DRY Violations)

1. **Bộ Hàm Định Dạng Số & Tiền Tệ**:
   - Tồn tại đồng thời ở cả `src/utils/cryptoHelper.ts` (`formatNumber`, `formatArea`, `formatCount`) và `src/utils/formatters.ts` (`formatAreaHa`, `formatQuantity`).
   - Cần quy về 1 nguồn chân lý duy nhất (Single Source of Truth) tại `formatters.ts`.
2. **Thuật Toán Chuẩn Hóa Tiếng Việt Bỏ Dấu**:
   - Được viết ở cả Backend (`QLNN-Backend/src/utils/textUtils.ts`) và Frontend (`HouseholdFilterBar.tsx` / `HouseholdTable.tsx`). Cần duy trì tính đồng nhất tuyệt đối của bảng mã thay thế ký tự đặc biệt (`đ`, `Đ`, `ư`, `ơ`...).
