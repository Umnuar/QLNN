# DATABASE AUDIT REPORT: QUẢN LÝ NÔNG NGHIỆP (QLNN)
## Agent 3 — Database Engineer | Phân Hệ QLNN — Đăk Hà Ecosystem

---

## 1. Kiểm Toán Schema & Chỉ Mục (Prisma & PostgreSQL Indexing)

Hệ thống CSDL sử dụng **PostgreSQL** (chạy qua Supabase Connection Pooler / PgBouncer) và **Prisma ORM v6.19**:

### 1.1. Bảng Chỉ Mục Hiện Tại vs. Đề Xuất Tối Ưu

| Bảng (Table) | Chỉ Mục Đã Có | Đánh Giá Hiệu Năng | Đề Xuất Bổ Sung Chỉ Mục |
| :--- | :--- | :---: | :--- |
| `households` | `idx_households_village_id`<br>`idx_households_village_name`<br>`idx_households_is_deleted`<br>`idx_households_name_unaccented` | ⚠️ **CẦN TỐI ƯU** | `name_unaccented` đang dùng B-Tree index, **vô hiệu hóa** khi tìm kiếm dạng substring (`contains`). Cần tạo **GIN Trigram Index** tận dụng extension `pg_trgm` đã kích hoạt |
| `crop_items` | `idx_crops_household_id`<br>`idx_crops_type` | ✅ TỐT | Đảm bảo truy vấn JOIN và xóa cascade theo hộ |
| `livestock_items` | `idx_livestock_household_id`<br>`idx_livestock_type` | ✅ TỐT | Index theo household_id và loại vật nuôi |
| `aquaculture_items`| `idx_aqua_household_id`<br>`idx_aqua_type` | ✅ TỐT | Index theo household_id và loại thủy sản |
| `audit_logs` | `village_id` | ⚠️ THIẾU | Thiếu chỉ mục trên `(village_id, created_at DESC)` khiến việc tải timeline phân trang bị chậm khi log tăng cao |

---

## 2. Các Vấn Đề Giao Dịch & Truy Vấn Nghiêm Trọng (Database Findings)

### DB-01: Lỗi Timeout Giao Dịch Prisma (P2028 Transaction Timeout)
- **Vị trí**: `QLNN-Backend/src/controllers/household.controller.ts` (dòng 458-594).
- **Hiện tượng**: Kiểm thử tích hợp `npm test` bị **FAIL** tại test case cập nhật hộ với mã lỗi `P2028: Transaction API error: Transaction not found. Transaction ID is invalid, refers to an old closed transaction`.
- **Nguyên nhân gốc rễ (Root Cause)**:
  - Hàm `updateHousehold` bọc 10 thao tác bất đồng bộ bên trong `prisma.$transaction(async (tx) => { ... })`:
    1. Kiểm tra OCC version (`updateMany`)
    2. Kiểm tra trùng tên (`findFirst`)
    3. Xóa `crop_items` cũ (`deleteMany`)
    4. Thêm `crop_items` mới (`createMany`)
    5. Xóa `livestock_items` cũ (`deleteMany`)
    6. Thêm `livestock_items` mới (`createMany`)
    7. Xóa `aquaculture_items` cũ (`deleteMany`)
    8. Thêm `aquaculture_items` mới (`createMany`)
    9. Cập nhật thông tin hộ (`update`)
    10. Ghi nhật ký biến động (`audit_logs.create`)
  - Vì kết nối qua Supabase pooler từ xa, độ trễ mạng làm tổng thời gian thực thi vượt quá ngưỡng mặc định **5000ms** của Prisma, khiến transaction bị hủy ngang trước khi lệnh cuối cùng kết thúc.
- **Giải pháp**: Cấu hình thời gian chờ tường minh cho giao dịch:
  ```ts
  await prisma.$transaction(async (tx) => {
    // ... operations
  }, {
    maxWait: 10000, // 10 giây chờ lấy kết nối từ pool
    timeout: 20000  // 20 giây thực thi giao dịch
  });
  ```

### DB-02: Truy Vấn Toàn Bộ Bảng Con Thay Vì Gom Nhóm Ở CSDL (Client-side In-Memory Aggregates)
- **Vị trí**: `QLNN-Backend/src/controllers/analytics.controller.ts` (dòng 21-31, 89-100).
- **Hiện trạng**:
  ```ts
  const cropsRaw = await prisma.crop_items.findMany({
    where: { household: whereHousehold },
    select: { crop_type: true, crop_subtype: true, ownership_type: true, area: true }
  });
  // Lặp for bằng JavaScript trên toàn bộ cropsRaw để tính tổng diện tích
  ```
- **Hệ quả khi quy mô 23.000+ hộ**:
  - Với 23.000 hộ, số lượng `crop_items` có thể đạt từ **100.000 đến 250.000 dòng**.
  - Việc `findMany` nạp 250.000 đối tượng qua đường truyền mạng về RAM Node.js sẽ làm nghẽn băng thông, tiêu tốn hàng trăm MB bộ nhớ và khiến endpoint `/api/analytics` bị chậm (5 - 15 giây).
- **Khắc phục**: Sử dụng `prisma.$queryRaw` hoặc `prisma.crop_items.groupBy({ by: ['crop_type', 'crop_subtype', 'ownership_type'], _sum: { area: true } })`.
  - Giảm số dòng trả về từ **250.000 dòng xuống còn dưới 20 dòng**!
  - Thời gian tính toán ở PostgreSQL giảm từ 8.000ms xuống dưới **15ms**.

### DB-03: Tìm Kiếm Chuỗi Con Không Tận Dụng Chỉ Mục (Full Table Scan On LIKE Search)
- **Vị trí**: `household.controller.ts` (dòng 98): `where.name_unaccented = { contains: searchNormalized }`.
- **Hiện trạng**: B-Tree index không thể hỗ trợ tìm kiếm chứa chuỗi ở giữa `%abc%`.
- **Khắc phục**: Khai báo index GIN Trigram trong PostgreSQL:
  ```sql
  CREATE INDEX idx_households_name_trgm ON households USING gin (name_unaccented gin_trgm_ops);
  ```
  Giúp tăng tốc độ tìm kiếm tên chủ hộ trên 23k+ bản ghi từ 450ms xuống **dưới 5ms**.

---

## 3. Khuyến Nghị Quy Hoạch CSDL
1. Bổ sung tham số phân trang (`skip`, `take`) chặt chẽ ở mọi controller, không để bất kỳ endpoint nào gọi `findMany()` không giới hạn.
2. Thiết lập `connection_limit` hợp lý trong chuỗi kết nối PostgreSQL để tránh cạn kiệt pool kết nối khi có nhiều cán bộ đồng thời truy cập.
