# HỆ THỐNG QUẢN LÝ DỮ LIỆU NÔNG NGHIỆP & NÔNG THÔN MỚI XÃ ĐĂK HÀ (QLNN)

> **Cơ quan chủ quản:** Ủy ban nhân dân Xã Đăk Hà, Huyện Đăk Hà, Tỉnh Kon Tum  
> **Phiên bản:** `v1.0.0` (Production Ready)  
> **Giấy phép:** Bản quyền thuộc UBND Xã Đăk Hà — Mọi quyền được bảo lưu (All Rights Reserved — **Không áp dụng giấy phép MIT**)  
> **Chính sách an toàn thông tin:** Xem chi tiết tại [SECURITY.md](SECURITY.md)

---

## 1. TỔNG QUAN HỆ THỐNG

**QLNN** (Quản Lý Nông Nghiệp) là phân hệ chuyên môn hóa thuộc Hệ sinh thái Số hóa Công vụ Xã Đăk Hà, phục vụ công tác thống kê, giám sát, đối soát và quản lý biến động toàn diện **18 chỉ số nông nghiệp** của các hộ dân trên địa bàn 7 thôn, làng bản:
- Thôn 1
- Thôn 2
- Thôn 3
- Thôn 4
- Thôn 5
- Làng Kon Đao Yôp
- Làng Kon Hnông Bách

Hệ thống hỗ trợ song song hai nền tảng: **Web Application** và **Desktop Application (Electron)** trên máy trạm cán bộ, hoạt động với cơ chế xác thực phân quyền chặt chẽ, hỗ trợ làm việc liên tục cả khi gián đoạn kết nối.

---

## 2. CÁC TÍNH NĂNG CHÍNH

### 2.1. Quản lý 18 Chỉ tiêu Nông nghiệp Toàn diện
- **12 Chỉ tiêu Cây trồng:** Cà phê (Hộ quản lý), Cà phê (Nhận khoán), Cao su (Hộ quản lý), Cao su (Nhận khoán), Cây ăn quả, Mắc ca, Đinh lăng, Gừng, Nghệ, Sả, Lúa nước, Cây hàng năm khác.
- **4 Chỉ tiêu Đàn Vật nuôi:** Trâu, Bò, Heo, Gia cầm (tổng số lượng con).
- **2 Chỉ tiêu Nuôi trồng Thủy sản:** Diện tích ao cá (ha), Số lượng lồng bè nuôi cá.

### 2.2. Nhập & Xuất Excel Chuẩn hóa 21 Cột (Smart-Upsert)
- Xử lý bảng tính 21 cột phẳng, tự động đối soát mã định danh hộ, số thứ tự (STT) và tên chủ hộ.
- Khớp cột thông minh, kiểm tra kiểu dữ liệu, loại bỏ dữ liệu sai lệch hoặc giá trị âm.
- Cơ chế xem trước (Preview) với 2 cột cố định bên trái (STT, Họ tên) và cuộn ngang mượt mà.
- Xuất báo cáo thống kê định dạng Excel đầy đủ định dạng số và công thức tổng hợp.

### 2.3. Khóa Lạc quan & Chống Xung đột Đồng thời (OCC 409)
- Quản lý phiên bản dữ liệu hộ dân qua trường nguyên vẹn `version: Int`.
- Phát hiện xung đột tức thời khi nhiều cán bộ cùng chỉnh sửa một hộ dân, hiển thị cảnh báo trực quan kèm nút **Tải lại dữ liệu mới nhất** mà không làm mất trạng thái form.

### 2.4. Phân quyền Đa thôn Nghiêm ngặt (Village Scoping RBAC)
- **Cán bộ Xã (Admin):** Quản lý toàn bộ 7 thôn, cấu hình danh mục, quản lý tài khoản cán bộ, sao lưu và khôi phục CSDL, xóa vĩnh viễn dữ liệu.
- **Cán bộ Thôn (Officer):** Chỉ được xem, thêm, sửa, xóa hộ dân thuộc thôn được phân công. Mọi truy cập chéo thôn đều bị chặn từ tầng Database Controller (`403 Forbidden`).

### 2.5. Thùng rác & Khôi phục Dữ liệu An toàn (Recycle Bin)
- Cơ chế xóa mềm (`is_deleted: true`, `deleted_at`) giúp bảo vệ tuyệt đối dữ liệu trước các thao tác nhầm lẫn.
- Khôi phục hộ dân đơn lẻ hoặc khôi phục hàng loạt, tự động cascade toàn bộ cây trồng, vật nuôi, thủy sản liên kết.
- Thông báo Toast hỗ trợ nút **Hoàn tác** tức thì.

### 2.6. Thống kê & Giám sát Nông thôn mới (Analytics Dashboard)
- Biểu đồ phân bổ cơ cấu cây trồng, dược liệu, tổng đàn gia súc gia cầm.
- Bảng so sánh chỉ tiêu giữa 7 thôn, tính toán tổng hợp bằng câu truy vấn SQL Native Aggregation hiệu năng cao.
- Thiết kế giao diện trung tính, đồng bộ hoàn toàn với hệ thống QLCS và QLHK.

### 2.7. Nhật ký Biến động Dữ liệu (Audit Log)
- Ghi nhận chi tiết mọi hành vi: Khởi tạo, Cập nhật, Xóa mềm, Khôi phục, Nhập Excel.
- Giải mã trực quan sai khác dữ liệu (Visual Diff: giá trị cũ màu đỏ gạch ngang → giá trị mới màu xanh).

---

## 3. KIẾN TRÚC KỸ THUẬT

```
+-------------------------------------------------------------------------------+
|                            KIẾN TRÚC PHÂN HỆ QLNN                             |
+-------------------------------------------------------------------------------+
                                        |
          +-----------------------------+-----------------------------+
          |                                                           |
          v                                                           v
+-------------------------------+                           +-------------------------------+
|    QLNN-CLIENT (Desktop/Web)  |                           |     QLNN-BACKEND (REST API)   |
|   Port: 5174 | Electron 42    |                           |     Port: 5001 | Express TS   |
+-------------------------------+                           +-------------------------------+
| - React 18 + Vite 5           |                           | - Node.js Express TypeScript  |
| - Tailwind CSS v4             |                           | - Prisma ORM                  |
| - Lucide React Icons          |       HTTPS / JSON        | - JWT Authentication          |
| - Electron Main & Preload IPC | <=======================> | - SQLite / PostgreSQL         |
| - SafeStorage Encrypted Token |      Bearer Token Auth    | - Native SQL Aggregations     |
| - Centralized AppContext      |                           | - OCC Version Check           |
| - Standardized BaseModal      |                           | - Daily Scheduled Backup      |
+-------------------------------+                           +-------------------------------+
```

### Chi tiết Ngăn xếp Công nghệ (Tech Stack)

| Thành phần | Công nghệ chính | Ghi chú |
| :--- | :--- | :--- |
| **Backend Runtime** | Node.js (v18+) | Môi trường máy chủ |
| **Backend Framework** | Express.js, TypeScript | Kiến trúc phân tầng Controller - Service |
| **Database & ORM** | Prisma ORM, SQLite / PostgreSQL | Khóa phiên bản OCC, Soft-delete |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs | Thu hồi phiên, mã hóa mật khẩu |
| **Frontend Framework** | React 18, TypeScript | Single Page Application |
| **Build Tool** | Vite 5 | Bundle tốc độ cao, Code-splitting chunks |
| **Styling** | Tailwind CSS v4, Vanilla CSS variables | Dark/Light mode, không blur nặng máy |
| **Desktop Runtime** | Electron 42 | Ứng dụng Desktop có menu tối giản |
| **Kiểm thử tự động** | Jest, Supertest, Vitest, Testing Library | Độ phủ kiểm thử 100% các luồng trọng yếu |

---

## 4. CẤU TRÚC THƯ MỤC DỰ ÁN

```
QLNN/
├── QLNN-Backend/                 # Mã nguồn máy chủ REST API
│   ├── prisma/                   # Prisma Schema & Migrations
│   ├── src/
│   │   ├── config/               # Cấu hình Prisma, JWT, môi trường
│   │   ├── controllers/          # Xử lý logic API (Household, Analytics, Auth, Backup...)
│   │   ├── middlewares/          # Xác thực JWT, Scoping thôn, Error Handler
│   │   ├── routes/               # Định tuyến API
│   │   ├── tests/                # Bộ kiểm thử tích hợp Jest
│   │   └── index.ts              # Điểm khởi động Express server & Graceful Shutdown
│   └── package.json
│
├── QLNN-Client/                  # Mã nguồn giao diện Web & Desktop Electron
│   ├── electron/                 # Electron Main Process & Preload IPC
│   ├── src/
│   │   ├── api/                  # Axios API clients & Interceptors
│   │   ├── components/           # Components dùng chung, Modals, Tables, Layout
│   │   ├── pages/                # Các màn hình chính (Villages, Households, Analytics...)
│   │   ├── tests/                # Bộ kiểm thử component Vitest
│   │   └── App.tsx               # Cấu hình App, Tab Router & Theme Provider
│   ├── vite.config.ts            # Cấu hình Vite & Proxy
│   └── package.json
│
├── docs/                         # Tài liệu kỹ thuật, kiến trúc, kiểm toán kỹ thuật
├── ui-sync/                      # Quy chuẩn thiết kế đồng bộ giao diện
├── SECURITY.md                   # Chính sách an toàn thông tin & tiếp nhận lỗ hổng
└── README.md                     # Tài liệu hướng dẫn sử dụng & triển khai
```

---

## 5. HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

### 5.1. Yêu cầu Tiên quyết (Prerequisites)
- **Node.js**: Phiên bản 18.x hoặc 20.x trở lên
- **npm**: Phiên bản 9.x hoặc 10.x trở lên
- **Hệ điều hành**: Windows 10/11, macOS hoặc Linux

### 5.2. Khởi tạo & Cài đặt Thư viện

```bash
# 1. Cài đặt dependencies cho Backend
cd QLNN-Backend
npm install

# 2. Tạo file cấu hình môi trường
cp .env.example .env

# 3. Khởi tạo cơ sở dữ liệu Prisma
npx prisma generate
npx prisma db push

# 4. Cài đặt dependencies cho Client
cd ../QLNN-Client
npm install
cp .env.example .env
```

### 5.3. Khởi chạy Môi trường Phát triển (Development)

**Khởi động Backend:**
```bash
cd QLNN-Backend
npm run dev
# Máy chủ khởi động tại: http://localhost:5001
```

**Khởi động Client (Web Dev Mode):**
```bash
cd QLNN-Client
npm run dev
# Ứng dụng mở tại: http://localhost:5174
```

**Khởi động Client (Desktop Electron Mode):**
```bash
cd QLNN-Client
npm run electron:dev
```

### 5.4. Chạy Kiểm thử Tự động (Automated Tests)

```bash
# Chạy kiểm thử Backend (Jest)
cd QLNN-Backend
npm test

# Chạy kiểm thử Frontend (Vitest)
cd QLNN-Client
npm test -- --run
```

### 5.5. Đóng gói Ứng dụng (Production Build)

```bash
# Build Backend
cd QLNN-Backend
npm run build

# Build Frontend Web
cd QLNN-Client
npm run build:vite

# Đóng gói bộ cài đặt Desktop Windows (.exe)
npm run build:win
```

---

## 6. QUY ĐỊNH BẢO MẬT & BÁO CÁO LỖ HỔNG

Hệ thống tuân thủ nghiêm ngặt quy trình tiếp nhận và xử lý sự cố an toàn thông tin:
- Xem chi tiết tại tệp tin [SECURITY.md](SECURITY.md).
- Không công khai lỗi hay kịch bản khai thác lên các diễn đàn công cộng.
- Mọi phát hiện an ninh xin gửi trực tiếp về email phụ trách: `admin@dulieudakha.vn`.

---

## 7. BẢN QUYỀN & ĐIỀU KHOẢN PHÁP LÝ (PROPRIETARY NOTICE)

> ### ⚠️ THÔNG BÁO BẢN QUYỀN ĐỘC QUYỀN (NO MIT LICENSE)
> 
> **Toàn bộ mã nguồn, cấu trúc dữ liệu, tài liệu kỹ thuật và thiết kế giao diện của dự án này thuộc quyền sở hữu trí tuệ của:**  
> **ỦY BAN NHÂN DÂN XÃ ĐĂK HÀ, HUYỆN ĐĂK HÀ, TỈNH KON TUM**  
> 
> **Mọi quyền được bảo lưu (All Rights Reserved).**  
> 
> - **KHÔNG ÁP DỤNG** Giấy phép Mã nguồn Mở MIT (No MIT License), Apache, GPL hoặc bất kỳ giấy phép mở tự do nào khác.
> - **NGHIÊM CẤM** mọi hành vi sao chép, trích xuất, phân phối lại, xuất bản, thương mại hóa hoặc chuyển giao mã nguồn dưới bất kỳ hình thức nào khi chưa có sự chấp thuận bằng văn bản chính thức của UBND Xã Đăk Hà.
> - Dự án được phát triển và lưu trữ phục vụ độc quyền công tác quản lý điều hành nông nghiệp và số hóa nông thôn mới của địa phương.
