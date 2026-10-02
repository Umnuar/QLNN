# BÁO CÁO RÀ SOÁT CHUỖI CUNG ỨNG & PHỤ THUỘC (SUPPLY CHAIN SECURITY - SLSA)
## Dự án: Hệ Thống Quản Lý Dữ Liệu Nông Nghiệp Xã Đăk Hà (QLNN)
**Cơ quan quản trị**: UBND Xã Đăk Hà, Huyện Đăk Hà, Tỉnh Kon Tum  
**Phiên bản tài liệu**: 1.0 (Kiểm kê Bước 2)  
**Tiêu chuẩn áp dụng**: 
- OWASP Top 10:2021 (A06: Vulnerable and Outdated Components)
- SLSA v1.0 (Supply-chain Levels for Software Artifacts)
- NIST Secure Software Development Framework (SSDF)
- GitHub Advisory Database & National Vulnerability Database (NVD)

---

## 1. TỔNG QUAN PHÂN TÍCH PHỤ THUỘC (DEPENDENCY AUDIT SUMMARY)

Quá trình quét và phân tích được thực hiện trên cả hai hệ thống thành phần độc lập:

| Thành phần | Tổng số phụ thuộc | Lỗ hổng phát hiện (CVEs) | Phân bố mức độ | Đánh giá rủi ro chuỗi cung ứng |
| :--- | :---: | :---: | :--- | :--- |
| **QLNN-Backend** | 15 direct deps<br>15 devDeps | **11 lỗ hổng** | - 5 High<br>- 6 Moderate | Thư viện `xlsx` và `qs` tiềm ẩn nguy cơ DoS khi xử lý tệp và request. |
| **QLNN-Client** | 11 direct deps<br>23 devDeps | **25 lỗ hổng** | - 1 Critical<br>- 16 High<br>- 2 Moderate<br>- 6 Low | Lỗ hổng `tar` trong build tool `electron-builder` và `xlsx` ở client. |
| **Tính toàn vẹn Lockfile** | Root, Backend, Client | **0 script postinstall** | An toàn | Không phát hiện mã độc tự động kích hoạt khi cài đặt gói. |
| **Mức độ sẵn sàng SLSA** | GitHub Actions CI/CD | **SLSA Level 1 (Một phần)** | Cần cải tiến | CI dùng `npm install` thay vì `npm ci`, thiếu CI cho Backend. |

---

## 2. CHI TIẾT CÁC LỖ HỔNG BẢO MẬT PHỤ THUỘC (VULNERABILITY FINDINGS)

### [SEC-02-A] Lỗ hổng Prototype Pollution & ReDoS trong thư viện `xlsx` (SheetJS)
- **Vị trí**:
  - `QLNN-Backend/package.json:29` (`"xlsx": "^0.18.5"`)
  - `QLNN-Client/package.json:25` (`"xlsx": "^0.18.5"`)
- **Mã định danh CVE / Advisory**:
  - `CVE-2023-30533` (GHSA-4r6h-8v6p-xvw6): Prototype Pollution in SheetJS
  - `CVE-2024-22363` (GHSA-5pgg-2g8v-p4x9): Regular Expression Denial of Service (ReDoS) in SheetJS
- **Điểm đánh giá**: CVSS v3.1: **7.8 (High)** - `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:H`
- **Mức độ ưu tiên**: **P1 (High)**
- **Mô tả & Kịch bản khai thác**:
  - Phiên bản `0.18.5` là phiên bản cuối cùng được xuất bản lên npm registry công khai trước khi tác giả chuyển sang CDN riêng. Phiên bản này chứa 2 lỗ hổng đã được công bố rộng rãi:
    1. *Prototype Pollution*: Khi ứng dụng phân tích một tệp bảng tính `.xlsx` được chế tạo đặc biệt với các thuộc tính đối tượng độc hại, kẻ tấn công có thể chèn các thuộc tính vào `Object.prototype`, dẫn đến làm sai lệch hành vi xử lý dữ liệu của Node.js hoặc vượt qua các bước kiểm tra logic.
    2. *ReDoS*: Biểu thức chính quy trong hàm phân tích cú pháp số/chuỗi của SheetJS có độ phức tạp hàm mũ, cho phép một tệp chứa các chuỗi đặc thù làm treo luồng xử lý chính (Event Loop) của máy chủ Express, gây từ chối dịch vụ cho toàn bộ người dùng khác tại xã.
- **Khả năng khai thác thực tế**: Trung bình đến Dễ (Endpoint `POST /api/excel/preview` và `POST /api/excel/import` tiếp nhận file từ người dùng).
- **Đề xuất khắc phục (Giai đoạn Bước 7)**:
  - *Giải pháp tối ưu*: Trong `QLNN-Backend`, dự án đã cài đặt sẵn thư viện hiện đại `exceljs` (`^4.4.0`) và đang dùng tốt để xuất bảng tính. Chúng ta có thể nghiên cứu thay thế hàm đọc `xlsx` trong `excelParser.ts` sang sử dụng streaming reader của `exceljs`. Việc này giúp loại bỏ hoàn toàn dependency `xlsx`, giải quyết dứt điểm CVE mà không cần thêm thư viện mới (tuân thủ nguyên tắc Ponytail Minimalism).

---

### [SEC-02-B] Lỗ hổng Path Traversal & Ghi đè tệp tùy ý trong `tar` (qua `electron-builder`)
- **Vị trí**: `QLNN-Client/node_modules/tar` (phụ thuộc gián tiếp qua `electron-builder@^24.13.3` $\rightarrow$ `app-builder-lib`).
- **Mã định danh CVE / Advisory**:
  - `GHSA-34x7-hfp2-rc4v`: Hardlink Path Traversal dẫn đến tạo/ghi đè file tùy ý
  - `GHSA-8qq5-rm4j-mr97`: Symlink Poisoning via Insufficient Path Sanitization
  - `GHSA-83g3-92jg-28cx`: Target Escape qua symlink chain
- **Điểm đánh giá**: CVSS v3.1: **9.8 (Critical)**
- **Mức độ ưu tiên**: **P1 (High)** *(Do chỉ xuất hiện trong build-time tool)*
- **Mô tả & Kịch bản khai thác**:
  - Gói `tar` phiên bản cũ xử lý không an toàn các liên kết cứng (hardlink) và liên kết mềm (symlink) khi giải nén kho lưu trữ. Nếu máy chủ CI hoặc máy trạm lập trình viên giải nén một archive độc hại trong quá trình đóng gói ứng dụng Electron Desktop, tệp có thể bị ghi đè ra ngoài thư mục đích.
- **Đề xuất khắc phục (Giai đoạn Bước 7)**:
  - Thêm cấu hình `overrides` trong `QLNN-Client/package.json`:
    ```json
    "overrides": {
      "tar": "^7.5.21"
    }
    ```
  - Hoặc nâng cấp `electron-builder` lên phiên bản tương thích mới nhất đã tích hợp bản vá `tar`.

---

### [SEC-02-C] Lỗ hổng DoS & Array-limit Bypass trong `qs` (qua `express`)
- **Vị trí**: `QLNN-Backend/node_modules/qs` (phụ thuộc gián tiếp qua `express@^4.21.0` $\rightarrow$ `body-parser`).
- **Mã định danh CVE / Advisory**:
  - `GHSA-x5fp-wj9c-mxmx`: Array-limit bypass via bracket-key comma parsing
  - `GHSA-4mjr-xmp4-gh2g`: Denial of Service via Attacker Controlled isBuffer
- **Điểm đánh giá**: CVSS v3.1: **6.5 (Moderate)**
- **Mức độ ưu tiên**: **P2 (Medium)**
- **Mô tả & Kịch bản khai thác**:
  - Parser phân tích query string và form body `qs` gặp lỗi khi kẻ tấn công gửi tham số mảng với hàng nghìn key lồng nhau dạng ngoặc vuông (`a[0][1][2]...`), gây cạn kiệt bộ nhớ và CPU.
- **Đề xuất khắc phục (Giai đoạn Bước 7)**:
  - Cập nhật phiên bản patch của `express` lên `^4.21.2` (hoặc chạy `npm update qs` trong nhánh phụ thuộc để nhận `qs >= 6.15.4`), không gây breaking change.

---

### [SEC-02-D] Quy trình CI/CD sử dụng `npm install` thay vì `npm ci` (Vi phạm SLSA Build Determinism)
- **Vị trí**: `.github/workflows/build.yml:26`
- **Mô tả**:
  - Bước cài đặt phụ thuộc trong CI đang dùng: `run: npm install`.
  - Lệnh `npm install` trong môi trường tự động hóa có thể tự động nâng cấp các gói con theo dải semver (`^` hoặc `~`), khiến mã nguồn đóng gói không phản ánh chính xác 100% nội dung đã được kiểm thử tại máy trạm và làm biến đổi `package-lock.json`.
  - Thiếu quy trình quét an ninh tự động (`npm audit --audit-level=high`) trước khi build.
  - Hoàn toàn chưa có kịch bản CI/CD cho `QLNN-Backend`.
- **Đánh giá mức độ SLSA**:
  - **SLSA Level 1**: Đạt một phần (Có kịch bản build qua GitHub Actions nhưng chưa đầy đủ thành phần backend).
  - **SLSA Level 2**: Chưa đạt (Thiếu tính tất định hermetic build và chữ ký xác thực provenance).
- **Mức độ ưu tiên**: **P2 (Medium)**
- **Đề xuất khắc phục (Giai đoạn Bước 7/9)**:
  1. Đổi `npm install` $\rightarrow$ `npm ci` trong `.github/workflows/build.yml`.
  2. Bổ sung bước kiểm tra linter & audit: `npx @biomejs/biome check src` và `npm audit --audit-level=high`.
  3. Bổ sung workflow kiểm thử tự động cho `QLNN-Backend` (chạy `npm test` với PostgreSQL service container).

---

## 3. BẢNG TỔNG HỢP MA TRẬN RỦI RO BƯỚC 2

| Mã ID | Gói phụ thuộc | Vị trí | Lỗ hổng / CVE | CVSS | Ưu tiên | Khả năng khai thác | Phương án đề xuất |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **SEC-02-A** | `xlsx` | Backend & Client | Prototype Pollution & ReDoS | 7.8 | **P1** | Trung bình | Thay thế parser sang `exceljs` trên Backend |
| **SEC-02-B** | `tar` | Client (`electron-builder`) | Path Traversal / Symlink Poisoning | 9.8 | **P1** | Thấp (Build-time) | Override phiên bản `tar` lên `>=7.5.21` |
| **SEC-02-C** | `qs` | Backend (`express`) | Array Limit Bypass / DoS | 6.5 | **P2** | Thấp | Cập nhật `express` patch lên `>=4.21.2` |
| **SEC-02-D** | CI Workflow | `.github/workflows/build.yml` | Non-deterministic Build (`npm install`) | 5.0 | **P2** | N/A (Quy trình) | Đổi sang `npm ci`, bổ sung Backend CI |

---

## 4. KẾT LUẬN & ĐIỀU KIỆN CHUYỂN BƯỚC

- **Trạng thái thực thi**: Hoàn thành phân tích chuỗi cung ứng ở chế độ **Read-Only**. Tuyệt đối không chạy `npm audit fix` hay cài thêm thư viện nào.
- **Tiêu chuẩn đạt được**: Lập danh mục đầy đủ các CVEs, phân tích tác động thực tế trong ngữ cảnh ứng dụng QLNN và đề xuất giải pháp hạn chế tối đa breaking changes.
- **Bước tiếp theo**: Sau khi nhận được xác nhận từ người dùng, hệ thống sẽ tiến hành **Bước 3: Rà soát mã tĩnh SAST & Đọc tay theo OWASP ASVS v4.0.3**.
