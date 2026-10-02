# ARCHITECTURE AUDIT REPORT: QUẢN LÝ NÔNG NGHIỆP (QLNN)
## Agent 1 — Architecture Auditor | Phân Hệ QLNN — Đăk Hà Ecosystem

---

## 1. Bản Đồ Kiến Trúc Tổng Thể (System Topology)

```
[ Electron Desktop App (Windows) / Web Browser ]
      │
      ├── Renderer Process (React 18 + Vite 5 + Tailwind v4)
      │     ├── AppContext (Global State, Ping EMA, Village Selection)
      │     ├── IndexedDB (idb v8: Offline Cache layer)
      │     └── Pages & Components (Flat 18 Indicators UI)
      │
      ├── Preload Script (contextIsolation: true, nodeIntegration: false)
      │     └── ContextBridge: api.store, api.dialog, api.app
      │
      └── Main Process (Electron 42)
            └── SecureStore (electron-store: Encrypted Tokens)
      │
      ▼ HTTP REST API (Port 5001 / Cloudflare Tunnel)
[ Express Backend (TypeScript + Node.js) ]
      ├── Middlewares (helmet, cors, auth.middleware [JWT + RBAC Scope])
      ├── Controllers (Household, Analytics, Excel, Audit, Backup, Village, User)
      └── ORM Layer (Prisma 6 + PostgreSQL with Supabase Pooler)
            ├── households (OCC version, soft-delete)
            ├── crop_items (12 chỉ tiêu diện tích)
            ├── livestock_items (4 chỉ tiêu số lượng)
            ├── aquaculture_items (2 chỉ tiêu diện tích/lồng)
            ├── villages (Đơn vị thôn bản)
            ├── users (Cán bộ xã / Trưởng thôn)
            └── audit_logs (Diff thay đổi)
```

---

## 2. Rà Soát Phân Tách Trách Nhiệm (Separation of Concerns)

### 2.1. Phẳng Hóa Dữ Liệu (Data Flattening vs. Relational Normalization)
- **Tầng CSDL**: Chuẩn hóa quan hệ 1-N (`households` $\rightarrow$ `crop_items`, `livestock_items`, `aquaculture_items`).
- **Tầng Client**: Sử dụng interface phẳng `HouseholdFlat` với 18 trường (`cafe_household`, `cow`, `fish_pond`...).
- **Điểm chuyển đổi (Transformation Gateway)**:
  - Backend: Hàm `serializeHousehold` trong `household.controller.ts` và `buildItemsFromPayload`.
  - Client: Types `HouseholdFlat` trong `src/types/index.ts`.
- **Đánh giá Kiến trúc**: Kiến trúc này tối ưu cho trải nghiệm người dùng cấp xã (giao diện bảng đối soát trực quan), tuy nhiên hàm `serializeHousehold` được viết lặp lại ở nhiều controller khác nhau thay vì đặt trong một Service chuyển đổi dùng chung (`HouseholdService`).

### 2.2. Kích Thước Module Quá Lớn (Oversized Modules)
- `QLNN-Backend/src/controllers/household.controller.ts`: **940 dòng code**.
  - Đảm nhiệm: Listing, GetById, Create, Update, Delete, HardDelete, Restore, BulkDelete, BulkRestore, AutoFixStt, ReorderStt, Serialize logic, Diff calculation.
  - **Mùi kiến trúc (Smell)**: Vi phạm Single Responsibility Principle (SRP). Cần tách biệt phần nghiệp vụ tính Diff (`AuditDiffService`) và phần quản lý STT (`HouseholdOrderingService`).
- `QLNN-Client/src/pages/HouseholdsPage.tsx`: **630 dòng code**.
  - Đảm nhiệm: Quản lý 14 state độc lập, logic đọc Excel file trực tiếp từ `FileReader` + `xlsx`, logic phân trang, logic bộ lọc client-side, quản lý modal xóa, quản lý timeout undo.
  - **Mùi kiến trúc**: Nên tách hook `useHouseholdFilters` và `useExcelIntegration`.

---

## 3. Các Vấn Đề Kiến Trúc Cần Khắc Phục (Architectural Findings)

### ARCH-01: Bộ Lọc Client-Side Trên Dữ Liệu Đã Bị Cắt Trang (Pagination Filter Mismatch)
- **Vị trí**: `HouseholdsPage.tsx` (dòng 217-282) vs. `household.controller.ts` (dòng 86-120).
- **Phân tích**: Backend truy vấn `findMany({ take: 20, skip: (page - 1) * 20 })`. Client nhận 20 bản ghi này rồi mới chạy `filter(scaleFilter)` và `filter(typeFilter)` và `sort(sortBy)`.
- **Hệ quả**:
  - Không thể tìm thấy dữ liệu nông nghiệp quy mô lớn (>2ha) nếu hộ đó nằm ở trang 2 trở đi.
  - Số dòng hiển thị trên bảng bị co cụm bất thường (ví dụ: trang 20 dòng chỉ hiển thị 2 dòng đáp ứng bộ lọc).
  - Tổng số trang (`totalPages`) tính theo tổng số hộ, không tính theo số hộ sau khi lọc.
- **Khuyến nghị kiến trúc**: Đẩy toàn bộ tiêu chí lọc (`scale`, `type`, `sortBy`) xuống Backend query (Push-down predicate).

### ARCH-02: Phụ Thuộc Xoay Vòng Giữa State Toàn Cục và State Trang
- **Vị trí**: `AppContext.tsx` quản lý `selectedVillageId` và `activeTab`. `HouseholdsPage.tsx` đọc `selectedVillageId` nhưng đồng thời lại có logic tự reset `selectedVillageId` trong một số kịch bản, dễ dẫn đến re-render không kiểm soát khi người dùng chuyển đổi giữa các tab.
- **Khuyến nghị kiến trúc**: Chuẩn hóa luồng dữ liệu 1 chiều (Unidirectional Data Flow): Trang con chỉ phát sự kiện yêu cầu đổi thôn lên `AppContext`, không can thiệp trực tiếp vào lifecycle nạp dữ liệu của component cha.

### ARCH-03: Trực Tiếp Thực Thi Khối Lượng Tính Toán Lớn Trên Luồng Chính (Event Loop Block)
- **Vị trí**: `backup.controller.ts` (dòng 123) sử dụng `fs.writeFileSync` đồng bộ để ghi file JSON dung lượng hàng chục megabytes.
- **Vị trí**: `analytics.controller.ts` (dòng 21-86) nạp hàng trăm nghìn bản ghi vào bộ nhớ để lặp mảng đồng bộ.
- **Khuyến nghị kiến trúc**: Chuyển các phép tính tổng hợp sang SQL native aggregates (`SUM()`, `GROUP BY`) và sử dụng stream hoặc `fs.promises.writeFile` bất đồng bộ.

---

## 4. Kết Luận
Kiến trúc tổng thể của QLNN tuân thủ tốt nguyên tắc tách biệt Client - Server và bảo mật Electron. Tuy nhiên, ranh giới xử lý dữ liệu giữa Frontend và Backend hiện tại đang bị chia cắt sai vị trí ở khâu Tìm kiếm/Lọc/Sắp xếp (xử lý ở tầng Client thay vì Database). Việc tái cấu trúc cần ưu tiên đẩy các phép lọc xuống tầng CSDL để đáp ứng kịch bản tải lớn 23k+ bản ghi.
