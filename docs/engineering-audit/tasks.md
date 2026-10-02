# NHIỆM VỤ THỰC THI & PHÂN BỔ QUYỀN SỞ HỮU TỆP (TASK DAG & FILE OWNERSHIP)
**Dự án**: QLNN (Quản lý Nông nghiệp Xã Đăk Hà)  
**Tác giả**: Orchestrator Agent  
**Ngày cập nhật**: 30/09/2026  
**Trạng thái**: ĐANG THỰC THI (PHASE 5 & 6)  

---

## 1. QUY TẮC PHÒNG NGỪA XUNG ĐỘT TỆP (CONFLICT PREVENTION RULES)

1. **Nguyên tắc Độc quyền Tệp (Single File Ownership)**: Trong cùng một thời điểm, tuyệt đối không có 2 Subagent cùng chỉnh sửa một file.
2. **Tuần tự hóa trên tệp dùng chung (Serialization)**: Các task cùng tác động lên `household.controller.ts` hoặc `HouseholdsPage.tsx` bắt buộc phải chạy tuần tự theo quan hệ phụ thuộc (Dependencies).
3. **Phân tầng ưu tiên nghiêm ngặt**:
   - **Đợt 1 (Track 1 - P0)**: Bảo mật, Timeout giao dịch CSDL, Xác thực nạp DB.
   - **Đợt 2 (Track 2 - P1)**: Tối ưu hiệu năng Backend SQL, Push-down bộ lọc phân trang, Xử lý OCC 409, Graceful Shutdown.
   - **Đợt 3 (Track 3 - P2)**: Tiếp cận WCAG 2.1 AA, Biome linter, Tối ưu cuộn bảng.
   - **Đợt 4 (Track 4 - P3/P4)**: Tách Chunk Vite, Đóng gói Electron an toàn, Bổ sung Test suite.

---

## 2. BẢNG PHÂN BỔ NHIỆM VỤ THEO CHUYÊN MÔN (TASK DAG SPECIFICATION)

### ĐỢT 1: TRACK 1 — CỨU NGUY BẢO MẬT & GIAO DỊCH CSDL (P0)

#### [TASK-P0-01] Sửa lỗi Timeout Giao dịch P2028 (DB-01)
- **Chuyên viên phụ trách**: Backend Database Specialist (`backend-architect` / `sql-pro`)
- **Finding ID**: `DB-01`
- **Mức độ**: P0 (Blocker)
- **Mục tiêu**: Bổ sung cấu hình `{ maxWait: 10000, timeout: 20000 }` vào `prisma.$transaction` trong `household.controller.ts` để giải quyết dứt điểm lỗi timeout giao dịch qua Supabase connection pooler, giúp test Jest pass 100%.
- **ALLOWED FILES**:
  - `c:\Projects\QLNN\QLNN-Backend\src\controllers\household.controller.ts`
- **BLOCKED FILES**: Toàn bộ các files khác.
- **DEPENDENCIES**: Không.
- **VERIFICATION**: `cd c:\Projects\QLNN\QLNN-Backend; npx jest src/tests/household.test.ts` (PASS 100%).

#### [TASK-P0-02] Siết chặt Phân quyền Thôn RBAC Scoping (SEC-01)
- **Chuyên viên phụ trách**: Security Engineer (`security-engineer`)
- **Finding ID**: `SEC-01`
- **Mức độ**: P0 (Critical Vulnerability)
- **Mục tiêu**: Khắc phục lỗ hổng IDOR trong `household.controller.ts:462` và các API cập nhật/xóa/đọc hộ dân. Ngăn chặn cán bộ thôn truy cập hoặc thao tác hộ dân của thôn khác ngay cả khi `village_id` rỗng hoặc bị giả mạo.
- **ALLOWED FILES**:
  - `c:\Projects\QLNN\QLNN-Backend\src\controllers\household.controller.ts`
  - `c:\Projects\QLNN\QLNN-Backend\src\middlewares\auth.middleware.ts`
- **BLOCKED FILES**: Frontend files, routes.
- **DEPENDENCIES**: Chạy tuần tự ngay sau `TASK-P0-01` trên cùng file `household.controller.ts`.
- **VERIFICATION**: Viết và chạy test case kiểm tra cố tình truy cập trái phép trả về 403 Forbidden.

#### [TASK-P0-03] Bảo vệ Xác thực Cấp 2 cho API Khôi phục CSDL (SEC-03)
- **Chuyên viên phụ trách**: Security Engineer (`security-engineer`)
- **Finding ID**: `SEC-03`
- **Mức độ**: P0 (Destructive Data Risk)
- **Mục tiêu**: Bổ sung xác thực mật khẩu Admin trong request body của `POST /api/backup/restore` trước khi thực thi xóa và nạp lại toàn bộ dữ liệu CSDL.
- **ALLOWED FILES**:
  - `c:\Projects\QLNN\QLNN-Backend\src\controllers\backup.controller.ts`
  - `c:\Projects\QLNN\QLNN-Client\src\components\settings\BackupRestoreTab.tsx`
- **BLOCKED FILES**: CSDL schema, các controllers khác.
- **DEPENDENCIES**: Không.
- **VERIFICATION**: Gọi API không có mật khẩu trả về 401/400; có mật khẩu đúng thực thi thành công.

---

### ĐỢT 2: TRACK 2 — TỐI ƯU HIỆU NĂNG & LOGIC NGHIỆP VỤ (P1)

#### [TASK-P1-01] Tối ưu hóa Bộ nhớ Tổng hợp Thống kê bằng SQL Native (PERF-01)
- **Chuyên viên phụ trách**: Database & Analytics Specialist (`database-optimization`)
- **Finding ID**: `PERF-01`
- **Mức độ**: P1 (High)
- **Mục tiêu**: Thay thế việc kéo 250.000 bản ghi thô về Node memory trong `analytics.controller.ts` bằng các câu lệnh `prisma.crop_items.aggregate` / `groupBy` hoặc SQL `SUM()`. Giảm thời gian phản hồi từ ~1800ms xuống `< 80ms`.
- **ALLOWED FILES**:
  - `c:\Projects\QLNN\QLNN-Backend\src\controllers\analytics.controller.ts`
  - `c:\Projects\QLNN\QLNN-Backend\src\utils\dashboard.ts`
- **BLOCKED FILES**: Household controller, schema.
- **DEPENDENCIES**: Sau Track 1.
- **VERIFICATION**: `cd c:\Projects\QLNN\QLNN-Backend; npx jest` (Pass và thời gian chạy rút ngắn).

#### [TASK-P1-02] Đẩy Tham số Lọc & Sắp xếp xuống Backend (ARCH-01)
- **Chuyên viên phụ trách**: Backend API Architect (`api-architect`)
- **Finding ID**: `ARCH-01`
- **Mức độ**: P1 (High)
- **Mục tiêu**: Cập nhật `getHouseholds` trong `household.controller.ts` tiếp nhận `scaleFilter`, `typeFilter`, `sortBy` và thực hiện lọc/sắp xếp trực tiếp trên cơ sở dữ liệu qua Prisma query, thay vì chỉ lọc trên 20 dòng của trang hiện tại ở client.
- **ALLOWED FILES**:
  - `c:\Projects\QLNN\QLNN-Backend\src\controllers\household.controller.ts`
  - `c:\Projects\QLNN\QLNN-Client\src\api\householdApi.ts`
  - `c:\Projects\QLNN\QLNN-Client\src\pages\HouseholdsPage.tsx`
- **BLOCKED FILES**: `HouseholdModal.tsx`, `HouseholdTable.tsx`.
- **DEPENDENCIES**: `TASK-P0-02` hoàn tất.
- **VERIFICATION**: Chuyển trang và lọc kết quả chính xác trên toàn bộ tập dữ liệu.

#### [TASK-P1-03] Tự động Reset Trang 1 khi Bộ lọc Thay đổi (QA-04)
- **Chuyên viên phụ trách**: Frontend Stability Engineer (`frontend-developer`)
- **Finding ID**: `QA-04`
- **Mức độ**: P1 (High)
- **Mục tiêu**: Trong `HouseholdsPage.tsx`, khi `searchQuery`, `scaleFilter`, `typeFilter` hoặc `selectedVillageId` thay đổi, tự động gán `currentPage = 1` để tránh hiển thị bảng trắng khi tổng số trang giảm.
- **ALLOWED FILES**:
  - `c:\Projects\QLNN\QLNN-Client\src\pages\HouseholdsPage.tsx`
- **BLOCKED FILES**: Các pages khác.
- **DEPENDENCIES**: `TASK-P1-02`.
- **VERIFICATION**: Kiểm thử tìm kiếm khi đang ở trang 5 -> tự động nhảy về trang 1.

#### [TASK-P1-04] Hộp thoại Xử lý Xung đột Đồng thời OCC 409 (QA-01)
- **Chuyên viên phụ trách**: Frontend UI/UX Specialist (`frontend-developer`)
- **Finding ID**: `QA-01`
- **Mức độ**: P1 (High)
- **Mục tiêu**: Bắt lỗi HTTP 409 trong `HouseholdModal.tsx`, hiển thị giao diện đối chiếu dữ liệu xung đột và nút "Nạp bản mới nhất từ máy chủ", không làm mất trắng dữ liệu cán bộ vừa nhập.
- **ALLOWED FILES**:
  - `c:\Projects\QLNN\QLNN-Client\src\components\households\HouseholdModal.tsx`
- **BLOCKED FILES**: `HouseholdTable.tsx`, `HouseholdFilterBar.tsx`.
- **DEPENDENCIES**: Không.
- **VERIFICATION**: Mô phỏng lỗi 409 và xác nhận modal hiển thị thông báo khôi phục.

#### [TASK-P1-05] Triển khai Graceful Shutdown Đóng Kết Nối Prisma (REL-03)
- **Chuyên viên phụ trách**: Backend Core Engineer (`backend-architect`)
- **Finding ID**: `REL-03`
- **Mức độ**: P1 (High)
- **Mục tiêu**: Đăng ký sự kiện `SIGINT` và `SIGTERM` trong `src/index.ts` để đóng HTTP server và ngắt kết nối `prisma.$disconnect()` an toàn khi restart server.
- **ALLOWED FILES**:
  - `c:\Projects\QLNN\QLNN-Backend\src\index.ts`
- **BLOCKED FILES**: Controllers.
- **DEPENDENCIES**: Không.
- **VERIFICATION**: Khởi động server và gửi `SIGTERM`, kiểm tra log thoát an toàn.

---

### ĐỢT 3: TRACK 3 — TIẾP CẬN WCAG, BIOME LINTER & CHUẨN HÓA MÃ NGUỒN (P2)

#### [TASK-P2-01] Sửa Lỗi Biome Linter & Chuẩn hóa Type Button (CODE-01)
- **Chuyên viên phụ trách**: Code Quality Specialist (`clean-code`)
- **Finding ID**: `CODE-01`, `A11Y-08`
- **Mức độ**: P2 (Medium)
- **Mục tiêu**: Thêm `type="button"` cho 28 button, sửa liên kết label-input, loại trừ biến không sử dụng, gán `aria-hidden="true"` cho SVG icon. Chạy `biome check --write` để đạt 0 lỗi linter.
- **ALLOWED FILES**:
  - `c:\Projects\QLNN\QLNN-Client\src\components\**\*.tsx`
  - `c:\Projects\QLNN\QLNN-Client\src\pages\**\*.tsx`
- **BLOCKED FILES**: Backend files.
- **DEPENDENCIES**: Sau khi `TASK-P1-03` và `TASK-P1-04` hoàn tất để tránh conflict format.
- **VERIFICATION**: `npx @biomejs/biome check src` trả về 0 lỗi.

#### [TASK-P2-02] Focus Trap & Hỗ trợ Tiếp cận Bàn phím (A11Y-01, A11Y-04, A11Y-05)
- **Chuyên viên phụ trách**: Accessibility Specialist (`accessibility-tester`)
- **Finding ID**: `A11Y-01`, `A11Y-04`, `A11Y-05`
- **Mức độ**: P2 (Medium)
- **Mục tiêu**: Tích hợp hook Focus Trap trong `HouseholdModal.tsx` và `ImportPreviewModal.tsx`, thêm `htmlFor` và `id` cho các input 18 chỉ tiêu, bổ sung `aria-label` cho tất cả các nút chỉ có icon.
- **ALLOWED FILES**:
  - `c:\Projects\QLNN\QLNN-Client\src\components\households\HouseholdModal.tsx`
  - `c:\Projects\QLNN\QLNN-Client\src\components\excel\ImportPreviewModal.tsx`
  - `c:\Projects\QLNN\QLNN-Client\src\components\households\HouseholdFilterBar.tsx`
- **BLOCKED FILES**: Backend files.
- **DEPENDENCIES**: `TASK-P2-01`.
- **VERIFICATION**: Kiểm thử nhấn phím Tab tuần hoàn trong modal và kiểm tra linter a11y.

---

### ĐỢT 4: TRACK 4 — TÁCH BUNDLE VITE, BẢO MẬT ELECTRON & BỔ SUNG TEST (P3/P4)

#### [TASK-P3-01] Tách Chunk Vite & Tối ưu Bundle JS (BUILD-01)
- **Chuyên viên phụ trách**: Release & DevOps Specialist (`deployment-engineer`)
- **Finding ID**: `BUILD-01`
- **Mức độ**: P3 (Low / Polish)
- **Mục tiêu**: Cấu hình `manualChunks` trong `vite.config.ts` để phân tách vendor chunk (`vendor-react`, `vendor-excel`, `vendor-icons`), giảm kích thước file index chính từ 873 kB xuống dưới 300 kB.
- **ALLOWED FILES**:
  - `c:\Projects\QLNN\QLNN-Client\vite.config.ts`
- **BLOCKED FILES**: Source code components.
- **DEPENDENCIES**: Không.
- **VERIFICATION**: `npm run build:vite` tạo các chunk riêng biệt `< 500 kB`.

#### [TASK-P3-02] Bảo mật Khóa Electron bằng Windows DPAPI (SEC-02)
- **Chuyên viên phụ trách**: Electron Security Specialist (`security-engineer`)
- **Finding ID**: `SEC-02`
- **Mức độ**: P0/P3 (Security Hardening)
- **Mục tiêu**: Thay thế chuỗi khóa cứng `encryptionKey` trong `electron/main.ts` bằng `safeStorage.encryptString` và `safeStorage.decryptString` của Electron.
- **ALLOWED FILES**:
  - `c:\Projects\QLNN\QLNN-Client\electron\main.ts`
- **BLOCKED FILES**: Renderer code.
- **DEPENDENCIES**: Không.
- **VERIFICATION**: `npm run build:electron` thành công và ghi/đọc dữ liệu an toàn.

#### [TASK-P3-03] Bổ sung Test Suites Kiểm thử Tự động (TG-01, TG-02, TG-05)
- **Chuyên viên phụ trách**: Test Automation Specialist (`test-engineer`)
- **Finding ID**: `TG-01`, `TG-02`, `TG-05`
- **Mức độ**: P3 (Quality Gate)
- **Mục tiêu**: Bổ sung `src/tests/household.rbac.test.ts` (Backend) và `src/tests/components/HouseholdModal.test.tsx` (Client).
- **ALLOWED FILES**:
  - `c:\Projects\QLNN\QLNN-Backend\src\tests\household.rbac.test.ts`
  - `c:\Projects\QLNN\QLNN-Client\src\tests\components\HouseholdModal.test.tsx`
- **BLOCKED FILES**: Production code.
- **DEPENDENCIES**: Sau khi logic code đã ổn định.
- **VERIFICATION**: Chạy `npm test` trên cả Client và Backend đạt 100% PASS.

---

## 3. BIỂU ĐỒ TIẾN ĐỘ THỰC THI (IMPLEMENTATION PROGRESS TRACKER)

```
[x] ĐỢT 1: TRACK 1 (P0: Timeout P2028 + RBAC Scoping + Backup 2FA)
    [x] TASK-P0-01: Fix Transaction Timeout P2028 (DB-01) - PASS
    [x] TASK-P0-02: Fix RBAC Scoping IDOR (SEC-01) - PASS
    [x] TASK-P0-03: Fix Backup Restore Auth (SEC-03) - PASS

[x] ĐỢT 2: TRACK 2 (P1: SQL Aggregate + Pushdown Filter + OCC Conflict + Graceful Shutdown)
    [x] TASK-P1-01: Fix Analytics In-Memory Bottleneck (PERF-01) - PASS
    [x] TASK-P1-02: Pushdown Filter & Sort (ARCH-01) - PASS
    [x] TASK-P1-03: Auto Reset Page 1 (QA-04) - PASS
    [x] TASK-P1-04: OCC 409 Conflict Modal (QA-01) - PASS
    [x] TASK-P1-05: Graceful Shutdown (REL-03) - PASS

[x] ĐỢT 3: TRACK 3 (P2: Biome Clean + WCAG A11y Focus Trap)
    [x] TASK-P2-01: Biome 80 Linter Errors (CODE-01) - PASS
    [x] TASK-P2-02: A11y Focus Trap & Form Labels (A11Y-01, A11Y-04) - PASS

[x] ĐỢT 4: TRACK 4 (P3/P4: Vite Chunks + Electron DPAPI + Automated Tests)
    [x] TASK-P3-01: Vite Manual Chunks (BUILD-01) - PASS
    [x] TASK-P3-02: Electron DPAPI SafeStorage (SEC-02) - PASS
    [x] TASK-P3-03: Automated Test Suites (TG-01, TG-05) - PASS

[x] ĐỢT 5: INDEPENDENT REVIEW & FINAL VERIFY (Phase 8 -> 12)
    [x] Review độc lập toàn bộ Git Diff (Agent 7) - APPROVE
    [x] Đóng gói & Nghiệm thu toàn diện - ALL 20/20 GATES PASSED
```
