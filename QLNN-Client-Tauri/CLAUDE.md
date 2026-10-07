# QLNN-Client - Project Rules & Architecture

## Commands
- `npm run dev` — Chạy Electron Desktop App môi trường phát triển (Vite + HMR)
- `npm run build:vite` — Biên dịch TypeScript & Vite Renderer (kiểm tra lỗi tsc & bundling)
- `npm run build:win` — Đóng gói file cài đặt Windows (.exe installer)

## Architecture & Ecosystem Standards
- React 18 + Vite + TailwindCSS 4 + Electron 42 + TanStack Query
- Backend QLNN API: `http://localhost:5001/api` (Local Dev) / `https://dulieudakha.com/api` (Production)
- QLCS SSO Auth Gateway: `http://localhost:5000/api/auth` (Local Dev) / `https://dulieudakha.com/api/auth` (Production)

## Security & RBAC Rules (CRITICAL)
1. **Never send village_id manually for Village Chief**: Khi Trưởng thôn thao tác, Client KHÔNG gửi `village_id` thủ công qua request body. Backend tự động bóc tách `village_id` từ JWT token.
2. **Token & Storage Security**:
   - Tokens (`accessToken`, `refreshToken`) và dữ liệu nhạy cảm BẮT BUỘC lưu qua `electron-store` (mã hóa AES cấp OS qua IPC `secureStorage.ts`). TUYỆT ĐỐI không lưu token vào `localStorage`.
3. **Session Security**:
   - Session Timeout là **30 phút** không hoạt động -> tự động đăng xuất và xóa cache nhạy cảm (`useInactivityTimeout.ts`).
4. **Trưởng Thôn UI**:
   - Ẩn toàn bộ tính năng quản lý danh mục thôn xã và xem các thôn khác với Trưởng thôn.

## Excel Import / Export Gotchas (CRITICAL)
- `xlsx-js-style` và `xlsx` BẮT BUỘC phải dùng **Dynamic Import (`await import(...)`)** bên trong các hàm xử lý nếu có export phía Client, KHÔNG import ở top-level file để tránh kéo Node `stream` vào bundle khởi động gây crash màn hình trắng.
- `vite.config.ts` phải kích hoạt `vite-plugin-node-polyfills` cho `stream`, `buffer`, `util`.
