# BEHAVIOR BASELINE: QUẢN LÝ NÔNG NGHIỆP (QLNN) — ĐĂK HÀ

Tài liệu xác lập ranh giới hành vi chuẩn (Behavior Baseline), phân định rõ giữa **Hành Vi Có Chủ Đích (Intended Behavior)**, **Lỗi Thực Tế Đã Xác Nhận (Confirmed Bugs)**, và **Vùng Hành Vi Chưa Rõ Ràng (Unclear Behavior)** nhằm bảo toàn 100% tính đúng đắn khi thực hiện tái cấu trúc và sửa lỗi.

---

## 1. Bản Đồ Miền Nghiệp Vụ (Domain Model)

### 1.1. Bộ Chỉ Số Nông Nghiệp 18 Tiêu Chí Chuẩn Cấp Xã
Hệ thống quản lý dữ liệu sản xuất nông nghiệp của các hộ gia đình/trang trại trên địa bàn xã Đăk Hà:

1. **Cây trồng chính (ha - Decimal 10,3)**:
   - `cafe_household`: Cà phê diện tích hộ tự canh tác
   - `cafe_contracted`: Cà phê diện tích nhận khoán liên kết
   - `rubber_household`: Cao su diện tích hộ tự canh tác
   - `rubber_contracted`: Cao su diện tích nhận khoán liên kết
   - `fruit_tree`: Cây ăn quả (sầu riêng, bơ, mít...)
   - `macadamia`: Cây Mắc ca
   - `wet_rice`: Lúa nước 2 vụ
   - `other_annual_crops`: Cây hàng năm khác (ngô, sắn, rau màu)
2. **Cây dược liệu (ha - Decimal 10,3)**:
   - `herb_dinh_lang`: Đinh lăng
   - `herb_gung`: Gừng
   - `herb_nghe`: Nghệ
   - `herb_sa`: Sả
3. **Chăn nuôi gia súc, gia cầm (con - Int)**:
   - `buffalo`: Đàn trâu
   - `cow`: Đàn bò
   - `pig`: Đàn heo
   - `poultry`: Tổng đàn gia cầm (gà, vịt, ngan)
4. **Nuôi trồng thủy sản**:
   - `fish_pond`: Diện tích nuôi cá ao (ha - Decimal 10,3)
   - `fish_cage`: Số lượng lồng bè nuôi cá lòng hồ (lồng - Int)

---

## 2. Ma Trận Phân Quyền (RBAC & Scoping)

| Chủ Thể (Role) | Phạm Vi Truy Cập (Data Scope) | Thao Tác Được Phép | Thao Tác Bị Chặn |
| :--- | :--- | :--- | :--- |
| **Cán bộ UBND Xã** (`admin`, `village_id = null`) | Toàn bộ các thôn trong xã | Xem thống kê toàn xã, CRUD hộ dân mọi thôn, Smart-Upsert Excel, Hard-delete vĩnh viễn trong thùng rác, Quản lý tài khoản cán bộ, Sao lưu/Phục hồi CSDL | Không bị giới hạn thôn |
| **Trưởng Thôn** (`user`, `village_id = 'xxx'`) | Chỉ duy nhất địa bàn thôn mình phụ trách | Xem thống kê thôn, CRUD hộ trong thôn, Nhập/Xuất Excel trong thôn, Khôi phục hộ của thôn | Xem/sửa dữ liệu thôn khác (Backend chặn qua `authorizeVillageScope`), Xóa vĩnh viễn trong thùng rác, Đổi thôn phụ trách, Phục hồi CSDL |

---

## 3. Bản Đồ Màn Hình & Luồng Tương Tác (Screens & Data Flows)

```
[Màn 1: VillagesPage] (Địa bàn quản lý)
       │ (Bấm chọn thôn)
       ▼
[Màn 2: HouseholdsPage] ─── (Bấm sửa/thêm) ───► [Drawer: HouseholdModal]
       │
       ├─── (Tích chọn hộ) ───► [Action Cluster dồn phải: Xuất / Xóa lô]
       ├─── (Nhập Excel)   ───► [Modal: ImportPreviewModal 21 cột]
       └─── (Xuất Excel)   ───► [Modal: ExportSettingsModal]
       ▼
[Màn 3: AnalyticsPage] (Báo cáo & Biểu đồ cơ cấu 18 chỉ tiêu)
       ▼
[Màn 4: RecycleBinPage] (Khôi phục mềm / Xóa cứng Admin)
       ▼
[Màn 5: AuditLogView] (Timeline biến động giá trị cũ -> mới)
       ▼
[Màn 6: SettingsPage] (Hồ sơ, Tài khoản cán bộ, Sao lưu CSDL)
```

---

## 4. Phân Định Hành Vi Hệ Thống

### 4.1. Hành Vi Có Chủ Đích (Intended Behavior — BẮT BUỘC BẢO TỒN)
1. **Khóa Lạc Quan (Optimistic Concurrency Control - OCC)**:
   - Mỗi hộ có trường `version: Int`. Khi gửi request cập nhật, client gửi `version`. Nếu DB có `version` khác $\rightarrow$ HTTP 409 Conflict `"Dữ liệu đã bị thay đổi bởi người khác"`.
2. **Xóa Mềm (Soft-delete & Recycle Bin)**:
   - Xóa hộ không xóa vĩnh viễn khỏi DB mà đặt `is_deleted = true`, `deleted_at = now()`.
   - Khôi phục hộ từ thùng rác khôi phục nguyên vẹn cả hộ và các bảng con (`crop_items`, `livestock_items`, `aquaculture_items`).
3. **Biểu Mẫu Nhập Excel Smart-Upsert 21 Cột**:
   - Tự động bỏ qua 9 dòng tiêu đề hành chính cấp xã, đọc từ dòng STT 1 (index 9).
   - Tự động so sánh họ tên chủ hộ với DB (sau khi chuẩn hóa không dấu): nếu trùng khớp $\rightarrow$ cập nhật (tăng version), nếu chưa có $\rightarrow$ tạo mới.
4. **Bộ Đệm Ngoại Tuyến (Offline-First Cache)**:
   - Dữ liệu hộ và danh sách thôn lưu vào IndexedDB. Khi mất mạng (`Network Error` hoặc HTTP >= 500), tự động chuyển sang đọc từ cache và bật cờ cảnh báo ngoại tuyến màu cam.
5. **Giám Sát Độ Trễ Ping EMA**:
   - Định kỳ gọi `/api/ping` (HTTP 204) và làm mượt bằng công thức EMA $\alpha = 0.3$.
6. **Điều Khiển Zoom Desktop & DevTools**:
   - Phím tắt `Ctrl +`, `Ctrl -`, `Ctrl 0` và gọi IPC `app:set-zoom`. Phím `F12` và `Ctrl+Shift+I` bật DevTools Electron.

### 4.2. Lỗi Thực Tế Đã Xác Nhận (Confirmed Bugs — CẦN KHẮC PHỤC)
1. **Lọc Quy Mô, Loại Hình & Sắp Xếp Bị Bó Hẹp Trong 1 Trang (Pagination-Scope Leak)**:
   - **Vị trí**: `QLNN-Client/src/pages/HouseholdsPage.tsx` (dòng 217-282) và `QLNN-Backend/src/controllers/household.controller.ts` (dòng 86-120).
   - **Thực tế**: Backend chỉ lọc theo `villageId` và `search`. Các bộ lọc `scaleFilter` (>2ha), `typeFilter` (dược liệu, thủy sản) và `sortBy` bị chạy client-side trên mảng 20 hộ của trang hiện tại, khiến dữ liệu của 23.000 hộ ở các trang khác không bao giờ được lọc ra.
2. **N+1 Aggregation & OOM Trong Báo Cáo Thống Kê**:
   - **Vị trí**: `QLNN-Backend/src/controllers/analytics.controller.ts` (dòng 21-31).
   - **Thực tế**: Kéo toàn bộ hàng trăm nghìn bản ghi `crop_items`, `livestock_items` từ DB về RAM Node.js rồi lặp vòng `for` để tính tổng, gây nghẽn mạng và nguy cơ sập RAM khi dữ liệu đạt 23k+.
3. **Lỗi Timeout Giao Dịch Prisma (P2028 Transaction Timeout)**:
   - **Vị trí**: `QLNN-Backend/src/controllers/household.controller.ts` (dòng 455-594).
   - **Thực tế**: Giao dịch tương tác `prisma.$transaction` chứa 10 truy vấn tuần tự nhưng không cấu hình timeout (mặc định 5s), dẫn đến đứt gãy giao dịch trên kết nối mạng từ xa.
4. **Hardcoded Encryption Key Trong Electron Main Process**:
   - **Vị trí**: `QLNN-Client/electron/main.ts` (dòng 8).
   - **Thực tế**: `encryptionKey: "QLNN_ENCRYPTED_STORE_KEY_SECURE_2026"` bị lộ trực tiếp trong mã nguồn build ra renderer/desktop.

### 4.3. Vùng Hành Vi Chưa Rõ Ràng (Unclear Behavior — CẦN GIỮ NGUYÊN HOẶC HỎI Ý KIẾN)
1. **Hành vi trùng tên chủ hộ trong cùng một thôn**: Hiện tại hệ thống coi 2 chủ hộ cùng tên trong cùng thôn là 1 hộ duy nhất khi Smart-Upsert. Nếu thôn có 2 người trùng cả họ lẫn tên nhưng khác năm sinh/CCCD, hệ thống sẽ ghi đè. Cần giữ nguyên thuật toán hiện tại để không phá vỡ dữ liệu đã nhập.
