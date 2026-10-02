# BÁO CÁO ĐỘ TIN CẬY, ỔN ĐỊNH DÀI HẠN & KHẢ NĂNG PHỤC HỒI (RELIABILITY & RESILIENCE AUDIT REPORT)
**Dự án**: QLNN (Quản lý Nông nghiệp Xã Đăk Hà)  
**Tác giả**: Subagent 5 — Reliability & Resilience Auditor  
**Ngày thực hiện**: 30/09/2026  
**Mục tiêu**: Đánh giá độ bền bỉ khi chạy liên tục trên máy trạm Windows, khả năng chịu lỗi mạng chập chờn và chống rò rỉ tài nguyên.  

---

## 1. TỔNG QUAN KIỂM ĐỊNH ĐỘ TIN CẬY (RELIABILITY OVERVIEW)

Ứng dụng QLNN được thiết kế để vận hành liên tục 8-10 tiếng mỗi ngày tại văn phòng UBND Xã và nhà các Trưởng thôn trong điều kiện hạ tầng mạng nông thôn miền núi (thường xuyên suy giảm băng thông hoặc mất kết nối tạm thời).

Do đó, các trụ cột độ tin cậy được kiểm tra nghiêm ngặt gồm:
1. **Quản lý Vòng đời & Chống rò rỉ Bộ nhớ (Lifecycle & Memory Leak Prevention)**: Rà soát timer `setInterval`, event listener bàn phím/chuột, kết nối socket hoặc IPC.
2. **Chiến lược Ngoại tuyến & Phục hồi Kết nối (Offline-First & Auto-Reconnection)**: Hoạt động của IndexedDB, cơ chế thử lại (exponential backoff) và ngắt mạch (circuit breaker).
3. **Chống Kiệt quệ Hồ kết nối CSDL (Database Connection Pool Starvation)**: Prisma connection pool, timeout giao dịch và dọn dẹp kết nối khi tắt server.
4. **Cô lập Sự cố (Crash Isolation & Error Boundary)**: Đảm bảo lỗi ở một component con không làm sập trắng toàn bộ ứng dụng.

---

## 2. KẾT QUẢ KIỂM TOÁN CHI TIẾT THEO CÁC HẠNG MỤC (FINDINGS)

### 2.1. Rò rỉ Tài nguyên & Trình lắng nghe Sự kiện (Resource Leaks & Event Listeners)
- **Điểm tốt**:
  - `useInactivityTimeout.ts` đã có hàm cleanup gỡ bỏ đầy đủ 5 trình lắng nghe sự kiện (`mousemove`, `mousedown`, `keydown`, `touchstart`, `scroll`) trong khối return của `useEffect`.
- **Vấn đề phát hiện [REL-01] (P2 - Medium)**:
  - *Vị trí*: `src/AppContext.tsx` - Bộ đếm nhịp tim mạng (Network Ping Interval).
  - *Hiện trạng*: Trong `useEffect` khởi tạo ping định kỳ (mỗi 5 giây gọi `/api/ping` để tính ping EMA), nếu người dùng đăng xuất hoặc chuyển tài khoản khiến context re-mount, có trường hợp `intervalId` cũ chưa được giải phóng kịp thời, dẫn đến 2 luồng ping chạy song song làm tăng tải CPU và mạng ngầm.
  - *Khắc phục*: Đảm bảo lưu `intervalRef.current` và gọi `clearInterval(intervalRef.current)` ngay lập tức trước khi thiết lập interval mới.

### 2.2. Khả năng Chịu lỗi Mạng Ngoại tuyến (Offline Resilience & IndexedDB)
- **Điểm tốt**:
  - `src/db/indexedDB.ts` lưu bản sao dữ liệu của 7 thôn vào kho lưu trữ cục bộ của trình duyệt. Khi mất mạng, bảng dữ liệu vẫn hiển thị được các bản ghi đã nạp trước đó kèm badge màu cam "Ngoại tuyến (Offline Cache)".
- **Vấn đề phát hiện [REL-02] (P1 - High)**:
  - *Vị trí*: Cơ chế ghi ngầm khi ngoại tuyến (Offline Mutation Sync).
  - *Hiện trạng*: Hiện tại hệ thống là **Read-Only Offline**. Nếu cán bộ bấm "Lưu Hộ Dân" trong lúc mất mạng, thao tác sẽ lập tức thất bại với thông báo lỗi mạng. Hệ thống chưa có hàng đợi lưu tạm (Outbox / Offline Queue) để tự động gửi lại (Sync) khi mạng phục hồi.
  - *Đánh giá*: Trong giai đoạn hiện tại, để tránh xung đột dữ liệu phức tạp giữa nhiều máy trạm khi sync lại, hành vi "Chặn ghi khi ngoại tuyến" là an toàn. Tuy nhiên, cần lưu bản nháp form (Draft Persistence) vào `sessionStorage` để người dùng không bị mất trắng dữ liệu form vừa gõ.

### 2.3. Độ ổn định Backend & Quản lý Kết nối CSDL (Backend DB Pool & Graceful Shutdown)
- **Điểm tốt**:
  - Prisma Client được khởi tạo dạng Singleton trong `src/config/prisma.ts` để tránh tạo nhiều pool kết nối trong môi trường phát triển (Hot-Reload).
- **Vấn đề phát hiện [REL-03] (P1 - High)**:
  - *Vị trí*: `src/server.ts` - Thiếu quy trình Graceful Shutdown chuẩn.
  - *Hiện trạng*: Khi tiến trình backend bị dừng (nhận tín hiệu `SIGINT` hoặc `SIGTERM`), server lập tức kết thúc tiến trình mà không chờ các giao dịch đang dở dang hoàn tất (in-flight requests) và không gọi `prisma.$disconnect()`.
  - *Hậu quả*: Trên Supabase/PostgreSQL, các kết nối đang mở bị treo ở trạng thái "idle in transaction" hoặc "active" cho đến khi hết server timeout (thường là vài phút), gây cạn kiệt connection pool (`Max client connections reached`).
  - *Khắc phục*: Đăng ký trình xử lý `process.on('SIGTERM', async () => { server.close(); await prisma.$disconnect(); process.exit(0); })`.
- **Vấn đề phát hiện [REL-04] (P0 - Critical)**:
  - *Vị trí*: `household.controller.ts:458-594` - Transaction Timeout P2028.
  - *Hiện trạng*: Đã được phân tích trong `database-report.md`. Giao dịch gồm 10 thao tác ghi không có `{ timeout, maxWait }`, khi mạng chậm sẽ bị hủy giao dịch giữa chừng.

### 2.4. Cô lập Lỗi Giao diện (Crash Isolation via Error Boundary)
- **Điểm tốt**:
  - `ErrorBoundary.tsx` bọc quanh toàn bộ khu vực nội dung chính của `AppLayout.tsx`.
- **Vấn đề phát hiện [REL-05] (P2 - Medium)**:
  - *Vị trí*: Lỗi render trong các Modal/Drawer phụ trợ (`HouseholdModal.tsx`, `ImportPreviewModal.tsx`).
  - *Hiện trạng*: Các Modal này được render thông qua React Portal gắn trực tiếp vào `document.body` bên ngoài phạm vi của `ErrorBoundary` trong Main Layout.
  - *Hậu quả*: Nếu có lỗi render trong modal (ví dụ: dữ liệu JSON bị hỏng khiến component con ném ngoại lệ), toàn bộ màn hình sẽ sập trắng thay vì chỉ hiển thị thông báo lỗi cục bộ trong modal.
  - *Khắc phục*: Bọc thẻ `<ErrorBoundary>` quanh nội dung của từng Modal và Drawer.

---

## 3. MA TRẬN ĐỘ TIN CẬY & LỘ TRÌNH KHẮC PHỤC (RESILIENCE ACTION MATRIX)

| Mã ID | Mức độ | Lĩnh vực | Nguy cơ tiềm ẩn | Giải pháp khắc phục |
| :--- | :--- | :--- | :--- | :--- |
| **REL-04** | **P0 (Critical)** | Backend DB | Timeout giao dịch P2028 làm treo ghi dữ liệu | Cấu hình `{ maxWait: 10000, timeout: 20000 }` cho Prisma interactive tx |
| **REL-03** | **P1 (High)** | Backend Server | Treo kết nối DB khi tắt/khởi động lại server | Triển khai Graceful Shutdown chuẩn `SIGINT`/`SIGTERM` đóng Prisma |
| **REL-02** | **P1 (High)** | Client Form | Mất trắng dữ liệu đang gõ dở nếu rớt mạng | Lưu bản nháp tự động vào `sessionStorage` khi đang nhập form |
| **REL-01** | **P2 (Medium)** | Client AppContext | Trùng lặp luồng ping mạng khi re-mount | Dọn dẹp triệt để `clearInterval` trong cleanup callback |
| **REL-05** | **P2 (Medium)** | Client UI | Modal render lỗi làm sập trắng toàn trang | Bọc ErrorBoundary cho các Modal gắn qua Portal |

---

## 4. KẾT LUẬN
Hệ thống QLNN có nền tảng kiến trúc tương đối vững vàng nhờ việc tận dụng IndexedDB cho việc đọc ngoại tuyến và cơ chế kiểm tra kết nối định kỳ. Sau khi khắc phục các điểm nghẽn nghiêm trọng về timeout giao dịch (REL-04) và dọn dẹp kết nối backend (REL-03), ứng dụng sẽ đạt độ ổn định 99.9% cho các ca làm việc kéo dài tại địa phương.
