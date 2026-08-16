# QLNN-Backend - Project Rules

## Commands
- `npm run dev` — Chạy server phát triển (Port 5001)
- `npm run build` — Biên dịch TypeScript sang `dist/`
- `npm run prisma:generate` — Sinh Prisma Client
- `npm run prisma:push` — Đẩy schema lên CSDL Supabase
- `npm run prisma:studio` — Mở giao diện quản trị CSDL

## Architecture
- Node.js + Express + Prisma + PostgreSQL (Supabase độc lập cho QLNN)
- Port: 5001
- Thuộc Hệ sinh thái Dữ liệu Đăk Hà (`DAKHA-ECOSYSTEM.md`).
- Sử dụng SSO Auth từ QLCS-Backend (chung `JWT_SECRET`, không tạo bảng `users` riêng).

## Security & RBAC Rules (CRITICAL)
1. **No Users Table**: QLNN không tự tạo bảng users, xác thực JWT từ SSO Provider.
2. **Shared JWT Secrets**: `JWT_SECRET` và `JWT_REFRESH_SECRET` phải khớp 100% với QLCS-Backend.
3. **Village Scope**: `authorizeVillageScope` tự động lọc dữ liệu theo `req.user.village_id`.
4. **Client MUST NOT send village_id**: Backend tự trích xuất từ JWT token.
5. **Mandatory Health Check**: Bắt buộc có `GET /api/health`.

## API Conventions
- Response format: `{ data: ... }` hoặc `{ error: '...' }`
- Soft delete: `is_deleted: true, deleted_at: timestamp`
- Optimistic locking: `version` field, 409 on conflict
- Smart Upsert: Khi import Excel, tự động cập nhật số liệu nếu đã có hộ trong thôn, không tạo dòng rác.
