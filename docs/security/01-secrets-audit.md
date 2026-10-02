# BÁO CÁO RÀ SOÁT BÍ MẬT & LỊCH SỬ GIT (SECRETS & REPOSITORY HYGIENE AUDIT)
## Dự án: Hệ Thống Quản Lý Dữ Liệu Nông Nghiệp Xã Đăk Hà (QLNN)
**Cơ quan quản trị**: UBND Xã Đăk Hà, Huyện Đăk Hà, Tỉnh Kon Tum  
**Phiên bản tài liệu**: 1.0 (Kiểm kê Bước 1)  
**Tiêu chuẩn áp dụng**: 
- OWASP Top 10:2021 (A05: Security Misconfiguration, A07: Identification and Authentication Failures)
- OWASP ASVS v4.0.3 (V2: Authentication, V3: Session Management)
- CWE Top 25 (CWE-798: Use of Hard-coded Credentials, CWE-312: Cleartext Storage of Sensitive Information, CWE-250: Unnecessary Privileges, CWE-1188: Insecure Default Initialization)

> [!CAUTION]
> **Tuân thủ quy tắc bảo mật P0**: Báo cáo này **tuyệt đối không in giá trị bí mật** dạng plain text (không in token, chuỗi kết nối hay mật khẩu thật). Mọi phát hiện chỉ ghi nhận vị trí `file:dòng`, commit hash và loại secret nhằm ngăn chặn rò rỉ thứ cấp.

---

## 1. TỔNG QUAN KẾT QUẢ RÀ SOÁT BƯỚC 1

| Hạng mục kiểm tra | Phạm vi thực hiện | Kết quả rà soát | Mức độ nghiêm trọng |
| :--- | :--- | :---: | :---: |
| **Kiểm tra File .env hiện hành** | Working tree Root, Backend, Client | **Không bị commit** (`.env` Backend và Client nằm ngoài Git) | An toàn hiện tại |
| **Kiểm tra File .env.example** | `QLNN-Backend/.env.example` | **PHÁT HIỆN LỖ HỔNG**: Khóa JWT thực tế bị hardcode | **P0 (Critical)** |
| **Rà soát Lịch sử Commit Git** | Toàn bộ commit history (tất cả các nhánh) | **PHÁT HIỆN LỖ HỔNG**: Danh sách tài khoản & mật khẩu tồn lưu trong Git log | **P0 (Critical)** |
| **Cấu hình .gitignore** | Root, Backend, Client | **PHÁT HIỆN THIẾU SÓT**: `QLNN-Client/.gitignore` thiếu quy tắc chặn `.env*` | **P1 (High)** |
| **Kịch bản Khởi tạo (Seed)** | `QLNN-Backend/scripts/seed-users.ts` | **PHÁT HIỆN THIẾU SÓT**: Mật khẩu admin mặc định cố định yếu | **P1 (High)** |
| **Đặc quyền Kết nối Database** | `DATABASE_URL` trong config mẫu | **PHÁT HIỆN THIẾU SÓT**: Dùng siêu người dùng `postgres` thay vì app user | **P2 (Medium)** |
| **Chứng chỉ & Khóa mã hóa** | Toàn bộ repo (`*.pem`, `*.key`, `*.pfx`) | **Không phát hiện**: Không có tệp khóa nào trong kho lưu trữ | An toàn |

---

## 2. CHI TIẾT CÁC PHÁT HIỆN AN NINH (FINDINGS)

### [SEC-01-A] Khóa ký JWT thực tế bị lộ trong tệp cấu hình mẫu và lịch sử Git
- **Vị trí**: `QLNN-Backend/.env.example:10-11` (Commit `2201b637f9bb5ae64187620b4b0b60e111eba589`)
- **Loại bí mật**: `JWT_SECRET` và `JWT_REFRESH_SECRET` (Khóa đối xứng HMAC-SHA256).
- **Mô tả**: Tệp `.env.example` lẽ ra chỉ chứa giá trị giữ chỗ (placeholder) nhưng lại lưu trữ trực tiếp chuỗi khóa ký JWT thực tế của hệ sinh thái Đăk Hà (`qlcs_jwt_secret_2025_...`). Tệp này đã được commit vào kho lưu trữ Git từ ngày 16/08/2026.
- **Kịch bản khai thác**: Bất kỳ người nào có quyền truy cập vào mã nguồn (hoặc nếu repo được public trên GitHub) đều có thể dùng khóa này để tự tạo Access Token với payload `{ role: "admin", username: "admin", village_id: null }`. Khi gửi request kèm token giả mạo này tới bất kỳ endpoint API nào của QLNN (hoặc QLCS), máy chủ sẽ xác thực chữ ký thành công và cấp toàn quyền quản trị xã.
- **Chuẩn tham chiếu**:
  - CWE: CWE-798 (Use of Hard-coded Credentials), CWE-321 (Use of Hard-coded Cryptographic Key)
  - OWASP Top 10: A07:2021 – Identification and Authentication Failures
  - OWASP ASVS: V2.10.3, V3.5.2
  - CVSS v3.1: **9.8 (Critical)** - `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H`
  - Mức độ ưu tiên: **P0 (Critical)**
- **Bằng chứng (PoC)**:
  - Commit `2201b63`: Tệp `QLNN-Backend/.env.example` chứa trực tiếp chuỗi bí mật.
  - Script xác thực `QLNN-Backend/src/config/jwt.ts` đọc trực tiếp `process.env.JWT_SECRET` mà không có cơ chế phát hiện khóa yếu/khóa mẫu.
- **Đề xuất khắc phục (Giai đoạn Bước 7)**:
  1. Thay thế giá trị trong `QLNN-Backend/.env.example` bằng chuỗi placeholder:
     ```env
     JWT_SECRET="YOUR_SUPER_STRONG_RANDOM_SECRET_MIN_32_CHARS"
     JWT_REFRESH_SECRET="YOUR_SUPER_STRONG_RANDOM_REFRESH_SECRET_MIN_32_CHARS"
     ```
  2. Bổ sung kiểm tra trong `src/config/jwt.ts`: Từ chối khởi động nếu `JWT_SECRET` trùng với giá trị placeholder hoặc chuỗi khóa cũ bị lộ.
  3. Quản trị viên tiến hành xoay (rotate) toàn bộ `JWT_SECRET` trên môi trường thực tế.

---

### [SEC-01-B] Danh sách tài khoản và mật khẩu cán bộ tồn lưu trong lịch sử Git
- **Vị trí**:
  1. `QLNN-Backend/scripts/test-login-all.ts` (Commit `627929206d74a030674d579a220c0dc488c3609d`, xóa ở `f78b72655393fe320af4ecacd8d0eb168fcf5587`).
  2. `QLNN-Client/src/components/auth/LoginView.tsx` (Commit `b2715276c1fc6bb09eb120358ec5bba25530ae9e`, xóa ở `36315c7e14a794cb1ca33dfa0092ad416ba34184`).
- **Loại bí mật**: Danh sách tên đăng nhập (`admin`, `thon1`, `thon2`, ...) và mật khẩu rõ (Cleartext passwords).
- **Mô tả**: Trong quá trình phát triển trước đây, các script kiểm thử đăng nhập nhanh và component chọn tài khoản mẫu đã được commit lên Git kèm mật khẩu thật dạng chuỗi trần. Dù sau đó các đoạn mã này đã được xóa khỏi working tree, lịch sử commit vĩnh viễn của Git vẫn lưu giữ nguyên vẹn nội dung của commit `6279292` và `b271527`.
- **Kịch bản khai thác**: Kẻ tấn công sao chép repo và chạy lệnh `git log -p QLNN-Backend/scripts/test-login-all.ts` để đọc danh sách mật khẩu, sau đó đăng nhập trái phép vào tài khoản của cán bộ và các thôn trưởng trên hệ thống đang chạy.
- **Chuẩn tham chiếu**:
  - CWE: CWE-312 (Cleartext Storage of Sensitive Information), CWE-798
  - OWASP Top 10: A07:2021 – Identification and Authentication Failures
  - CVSS v3.1: **8.6 (High)** - `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:L/A:L`
  - Mức độ ưu tiên: **P0 (Critical)**
- **Đề xuất khắc phục**:
  1. Xoay toàn bộ mật khẩu tài khoản cán bộ và quản trị viên trên cơ sở dữ liệu thực tế.
  2. Trước khi phát hành hoặc đẩy repository lên máy chủ điều khiển phiên bản công khai, thực hiện quy trình thanh lọc lịch sử Git bằng công cụ `git-filter-repo` (sẽ được lên kế hoạch trong Bước 7/9).

---

### [SEC-01-C] Lỗ hổng cấu hình .gitignore bỏ sót tệp môi trường của Client
- **Vị trí**: `QLNN-Client/.gitignore:1-11` và `QLNN/.gitignore:5-6`
- **Mô tả**:
  - Tệp `QLNN-Client/.gitignore` **hoàn toàn không có dòng `.env` hay `.env*`**.
  - Tệp Root `.gitignore` chỉ khai báo `.env` (chính xác), không dùng wildcard `.env*` hay `.env.*`.
  - Hậu quả thực tế: `QLNN-Client/.env.development` và `QLNN-Client/.env.production` đã bị đưa vào theo dõi và commit trong Git (Commit `8ea8df6` và `033dc2b`).
- **Kịch bản khai thác**: Hiện tại 2 file này chỉ chứa `VITE_API_URL`. Tuy nhiên, cơ chế phòng thủ bị hổng. Khi lập trình viên bổ sung các biến môi trường nhạy cảm phía Client (như khóa API bản đồ, dịch vụ định danh, Sentry DSN, Firebase token), chúng sẽ tự động bị commit và đẩy lên Git mà không bị chặn.
- **Chuẩn tham chiếu**:
  - CWE: CWE-552 (Files or Directories Accessible to External Parties)
  - OWASP Top 10: A05:2021 – Security Misconfiguration
  - CVSS v3.1: **5.3 (Medium)** - `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N`
  - Mức độ ưu tiên: **P1 (High)**
- **Đề xuất khắc phục (Giai đoạn Bước 7)**:
  1. Bổ sung vào `.gitignore` (Root, Backend, Client):
     ```gitignore
     .env
     .env.*
     *.local
     *.pem
     *.key
     *.pfx
     *.p12
     ```
  2. Chạy `git rm --cached QLNN-Client/.env.development QLNN-Client/.env.production` để ngừng theo dõi các file môi trường.

---

### [SEC-01-D] Mật khẩu quản trị viên mặc định yếu trong kịch bản khởi tạo CSDL (Seed)
- **Vị trí**: `QLNN-Backend/scripts/seed-users.ts:13-22`
- **Mô tả**: Kịch bản `seed-users.ts` tự động tạo tài khoản `admin` với mật khẩu băm từ chuỗi cố định yếu (`admin123`).
- **Kịch bản khai thác**: Khi triển khai hệ thống mới hoặc chạy script seed trên môi trường staging/production, nếu quản trị viên quên đổi mật khẩu ngay, kẻ tấn công có thể dùng mật khẩu mặc định phổ biến này để chiếm quyền kiểm soát toàn bộ hệ thống.
- **Chuẩn tham chiếu**:
  - CWE: CWE-1188 (Insecure Default Initialization of Resource), CWE-798
  - OWASP Top 10: A07:2021 – Identification and Authentication Failures
  - CVSS v3.1: **7.5 (High)** - `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N`
  - Mức độ ưu tiên: **P1 (High)**
- **Đề xuất khắc phục (Giai đoạn Bước 7)**:
  1. Đọc mật khẩu khởi tạo từ biến môi trường `INITIAL_ADMIN_PASSWORD`.
  2. Nếu không có biến môi trường, tự động sinh mật khẩu ngẫu nhiên an toàn (16 ký tự bao gồm chữ hoa, chữ thường, số, ký tự đặc biệt qua `crypto.randomBytes`) và in ra console đúng 1 lần cho người vận hành.

---

### [SEC-01-E] Chuỗi kết nối Database sử dụng siêu người dùng (Vi phạm Principle of Least Privilege)
- **Vị trí**: `QLNN-Backend/.env.example:6-7` và `prisma/schema.prisma:9-10`
- **Mô tả**: Tài khoản cấu hình kết nối là `postgres` (Superuser mặc định của PostgreSQL).
- **Kịch bản khai thác**: Nếu ứng dụng gặp lỗ hổng hoặc bị tấn công qua kênh kết nối CSDL, tài khoản `postgres` có quyền can thiệp vào toàn bộ các database khác trên cùng cụm máy chủ, chỉnh sửa cấu hình hệ thống DB, cài đặt extension tùy ý và đọc dữ liệu hệ thống ngoài phạm vi ứng dụng QLNN.
- **Chuẩn tham chiếu**:
  - CWE: CWE-250 (Execution with Unnecessary Privileges)
  - OWASP ASVS: V1.4.1 (Verify that the principle of least privilege is applied)
  - CVSS v3.1: **4.3 (Medium)** - `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:L/A:N`
  - Mức độ ưu tiên: **P2 (Medium)**
- **Đề xuất khắc phục (Giai đoạn Bước 7)**:
  - Khuyến nghị tài liệu triển khai production: Tạo một role riêng biệt (`qlnn_app`) trong PostgreSQL chỉ được gán quyền `SELECT, INSERT, UPDATE, DELETE` trên các bảng thuộc schema `public` của CSDL QLNN.

---

## 3. BẢNG TỔNG HỢP MA TRẬN RỦI RO BƯỚC 1

| Mã ID | Tiêu đề phát hiện | Vị trí (File:Dòng / Commit) | Chuẩn CWE | CVSS v3.1 | Mức ưu tiên | Kế hoạch xử lý |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| **SEC-01-A** | Khóa ký JWT thực tế lộ trong `.env.example` & Git | `QLNN-Backend/.env.example:10` (Commit `2201b63`) | CWE-798, CWE-321 | 9.8 | **P0** | Xoay JWT secret, đổi giá trị mẫu trong `.env.example` |
| **SEC-01-B** | Danh sách tài khoản & mật khẩu rõ trong Git log | Commit `6279292` & `b271527` | CWE-312, CWE-798 | 8.6 | **P0** | Đổi toàn bộ mật khẩu cán bộ, chuẩn bị thanh lọc Git history |
| **SEC-01-C** | Lỗ hổng `.gitignore` bỏ sót `.env*` tại Client | `QLNN-Client/.gitignore:1` (Commit `8ea8df6`) | CWE-552 | 5.3 | **P1** | Cập nhật `.gitignore`, hủy theo dõi `.env.development/production` |
| **SEC-01-D** | Mật khẩu admin mặc định cố định trong seed script | `QLNN-Backend/scripts/seed-users.ts:13` | CWE-1188 | 7.5 | **P1** | Đổi sang sinh mật khẩu ngẫu nhiên hoặc đọc từ ENV |
| **SEC-01-E** | Cấu hình kết nối DB bằng tài khoản `postgres` | `QLNN-Backend/.env.example:6` | CWE-250 | 4.3 | **P2** | Áp dụng nguyên tắc Least Privilege cho DB service user |

---

## 4. KẾT LUẬN & ĐIỀU KIỆN CHUYỂN BƯỚC

- **Trạng thái thực thi**: Toàn bộ rà soát ở Bước 1 được thực hiện ở chế độ **chỉ đọc (Read-Only)**. Không có dòng code nào bị thay đổi.
- **Tuân thủ quy tắc**: Không in bất kỳ token hay mật khẩu thật nào ra ngoài.
- **Bước tiếp theo**: Sau khi nhận được xác nhận từ người dùng, hệ thống sẽ tiến hành **Bước 2: Rà soát Chuỗi cung ứng & Phụ thuộc (Supply Chain Security - SLSA)**.
