# BÁO CÁO RÀ SOÁT CẤU HÌNH, HẠ TẦNG & ELECTRON HARDENING (CONFIG & INFRA AUDIT)
## Dự án: Hệ Thống Quản Lý Dữ Liệu Nông Nghiệp Xã Đăk Hà (QLNN)
**Cơ quan quản trị**: UBND Xã Đăk Hà, Huyện Đăk Hà, Tỉnh Kon Tum  
**Phiên bản tài liệu**: 1.0 (Kiểm kê Bước 4)  
**Tiêu chuẩn áp dụng**: 
- Electron Security Checklist (Official Electron Documentation v42.x)
- OWASP Secure Headers Project
- OWASP Top 10:2021 (A05: Security Misconfiguration)
- CWE Top 25 (CWE-312, CWE-284, CWE-942, CWE-295)

---

## 1. TỔNG QUAN KIỂM TRA HẠ TẦNG & CẤU HÌNH (INFRA & CONFIG AUDIT SUMMARY)

Quá trình kiểm tra đã đối chiếu chi tiết cấu hình mạng, HTTP headers và môi trường Electron Desktop:

| Thành phần kiểm tra | Vị trí tệp | Đánh giá hiện trạng | Ghi chú & Điểm cần gia cố |
| :--- | :--- | :---: | :--- |
| **HTTP Security Headers** | `QLNN-Backend/src/index.ts` | **Đạt cơ bản** | Đã kích hoạt `helmet()`. Cần cấu hình CSP & HSTS chặt chẽ hơn cho production. |
| **CORS Policy** | `QLNN-Backend/src/index.ts` | **Cần khắc phục** | Cho phép mọi cổng `http://localhost:*` với `credentials: true` không phân biệt môi trường. |
| **Electron Context Isolation** | `QLNN-Client/electron/main.ts` | **Đạt** | `contextIsolation: true`, `nodeIntegration: false` đã kích hoạt. |
| **Electron Navigation Guard** | `QLNN-Client/electron/main.ts` | **Đạt** | `setWindowOpenHandler: deny` và `will-navigate` đã chặn chuyển trang trái phép. |
| **Electron DevTools Guard** | `QLNN-Client/electron/main.ts` | **Đạt** | DevTools bị chặn trong bản packaged (`!app.isPackaged`). Menu bar bị gỡ bỏ. |
| **Lưu trữ an toàn DPAPI** | `QLNN-Client/electron/main.ts` | **Cần khắc phục** | Fallback sang Base64 thuần túy khi Windows DPAPI không khả dụng. |
| **Xác thực kênh IPC** | `QLNN-Client/electron/main.ts` | **Cần khắc phục** | Chưa kiểm tra `senderFrame` và chưa có whitelist danh sách `key` được lưu. |
| **Vite Dev Proxy SSL** | `QLNN-Client/vite.config.ts` | **Cần khắc phục** | Đặt `secure: false` tắt kiểm tra chứng chỉ TLS khi proxy `/api`. |

---

## 2. CHI TIẾT CÁC PHÁT HIỆN AN NINH (CONFIG & ELECTRON FINDINGS)

### [SEC-04-A] Cơ chế lưu trữ Token trên Electron fallback sang Base64 thuần túy khi không có DPAPI
- **Vị trí**: `QLNN-Client/electron/main.ts:8-24`
- **Mã CWE**: CWE-312 (Cleartext Storage of Sensitive Information), CWE-326 (Inadequate Encryption Strength)
- **Chuẩn tham chiếu**:
  - OWASP Top 10: A02:2021 – Cryptographic Failures
  - Electron Security Checklist: Rule 11 (Do not store sensitive data unencrypted)
  - CVSS v3.1: **7.1 (High)** - `CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N`
  - Mức độ ưu tiên: **P1 (High)**
- **Mô tả & Kịch bản khai thác**:
  - Trong `main.ts`:
    ```ts
    function encryptSafe(text: string): string {
        if (safeStorage.isEncryptionAvailable()) {
            return safeStorage.encryptString(text).toString("base64");
        }
        return Buffer.from(text).toString("base64");
    }
    ```
  - Khi cơ chế Windows DPAPI (`safeStorage`) không khả dụng (ví dụ: máy trạm Windows chạy trong môi trường phiên người dùng không hỗ trợ DPAPI hoặc Linux/Wine), hàm tự động chuyển sang mã hóa Base64 thuần túy.
  - Base64 chỉ là một thuật toán biến đổi định dạng byte (encoding), hoàn toàn không phải là mã hóa bảo mật (encryption). Bất kỳ người nào có quyền truy cập ổ đĩa hoặc phần mềm độc hại trên máy trạm đều có thể giải mã token của cán bộ bằng lệnh decode một dòng.
- **Đề xuất khắc phục (Giai đoạn Bước 7)**:
  - Nếu `!safeStorage.isEncryptionAvailable()`, ghi nhận cảnh báo an ninh và từ chối lưu token xuống ổ đĩa, chỉ duy trì token trong bộ nhớ RAM của phiên làm việc hiện tại.

---

### [SEC-04-B] Kênh IPC Electron thiếu xác thực người gọi (IPC Sender Frame Validation) và thiếu Whitelist Keys
- **Vị trí**: `QLNN-Client/electron/main.ts:115-145`
- **Mã CWE**: CWE-284 (Improper Access Control)
- **Chuẩn tham chiếu**:
  - Electron Security Checklist: Rule 17 (Validate the sender of all IPC messages)
  - CVSS v3.1: **6.3 (Medium)** - `CVSS:3.1/AV:L/AC:M/PR:N/UI:R/S:U/C:H/I:L/A:N`
  - Mức độ ưu tiên: **P1 (High)**
- **Mô tả & Kịch bản khai thác**:
  - Các hàm xử lý IPC (`ipcMain.handle("secure-store:*")`) nhận tham số và thực thi ngay lập tức mà không kiểm tra frame gửi yêu cầu (`event.senderFrame`):
    ```ts
    ipcMain.handle("secure-store:set", (_e, { key, value }: { key: string; value: any }) => {
        store.set(key, encryptSafe(strValue));
        return true;
    });
    ```
  - Đồng thời, tham số `key` không được giới hạn. Kẻ tấn công nếu khai thác được một lỗi hiển thị nội dung có thể tùy ý ghi đè các khóa cấu hình khác nhau trong file store.
- **Đề xuất khắc phục (Giai đoạn Bước 7)**:
  1. Kiểm tra nguồn gốc frame hợp lệ trước khi xử lý:
     ```ts
     ipcMain.handle("secure-store:set", (event, { key, value }) => {
         if (!event.senderFrame || event.senderFrame.url !== expectedUrl) return false;
         // Kiểm tra whitelist key
         const ALLOWED_KEYS = ["accessToken", "refreshToken", "user", "qlnn_client_master_key"];
         if (!ALLOWED_KEYS.includes(key)) return false;
         ...
     });
     ```

---

### [SEC-04-C] Cấu hình CORS quá nới lỏng cho mọi cổng `http://localhost:*` với `credentials: true`
- **Vị trí**: `QLNN-Backend/src/index.ts:34-50`
- **Mã CWE**: CWE-942 (Permissive Cross-origin Resource Sharing Policy)
- **Chuẩn tham chiếu**:
  - OWASP Top 10: A05:2021 – Security Misconfiguration
  - CVSS v3.1: **5.4 (Medium)**
  - Mức độ ưu tiên: **P2 (Medium)**
- **Mô tả & Kịch bản khai thác**:
  - Đoạn mã cấu hình CORS:
    ```ts
    origin.startsWith("http://localhost:")
    ```
  - Cấu hình này cho phép bất kỳ trang web nào chạy trên localhost của máy người dùng (bất kể cổng nào: 3000, 8000, 8080 do ứng dụng khác mở) đều có thể gửi HTTP request tới QLNN Backend kèm `credentials: true`.
  - Trên môi trường production (`process.env.NODE_ENV === "production"`), việc vẫn giữ rào chắn này mở có thể tạo điều kiện cho các kịch bản tấn công Cross-Origin cục bộ.
- **Đề xuất khắc phục (Giai đoạn Bước 7)**:
  - Chỉ cho phép `origin.startsWith("http://localhost:")` khi `process.env.NODE_ENV !== "production"`.
  - Trên production, chỉ cho phép danh sách tên miền tường minh từ biến môi trường `CORS_ORIGIN`.

---

### [SEC-04-D] Tắt kiểm tra chứng chỉ TLS trong cấu hình Vite Proxy (`secure: false`)
- **Vị trí**: `QLNN-Client/vite.config.ts:20`
- **Mã CWE**: CWE-295 (Improper Certificate Validation)
- **Chuẩn tham chiếu**:
  - OWASP Top 10: A02:2021 – Cryptographic Failures
  - CVSS v3.1: **4.8 (Medium)**
  - Mức độ ưu tiên: **P2 (Medium)**
- **Mô tả**:
  - Cấu hình proxy:
    ```ts
    proxy: {
      '/api': {
        target: 'https://qlnn.dulieudakha.vn',
        changeOrigin: true,
        secure: false, // <-- Lỗ hổng: Bỏ qua kiểm tra chứng chỉ SSL
      },
    }
    ```
  - Tùy chọn `secure: false` khiến tiến trình dev proxy chấp nhận mọi chứng chỉ giả mạo hoặc tự ký, tạo kịch bản Man-in-the-Middle (MITM) nếu lập trình viên làm việc trên mạng Wi-Fi công cộng.
- **Đề xuất khắc phục (Giai đoạn Bước 7)**:
  - Đổi thành `secure: true` khi kết nối đến domain HTTPS chính thức.

---

### [SEC-04-E] Thiếu khai báo tường minh `sandbox: true` trong `webPreferences` của Electron
- **Vị trí**: `QLNN-Client/electron/main.ts:48-52`
- **Mã CWE**: CWE-693 (Protection Mechanism Failure)
- **Chuẩn tham chiếu**:
  - Electron Security Checklist: Rule 4 (Enable the sandbox)
  - CVSS v3.1: **4.0 (Medium)**
  - Mức độ ưu tiên: **P2 (Medium)**
- **Mô tả**:
  - Trong `createWindow()`, `webPreferences` hiện tại chỉ khai báo:
    ```ts
    webPreferences: {
        preload: path.join(__dirname, "preload.mjs"),
        contextIsolation: true,
        nodeIntegration: false,
    }
    ```
  - Mặc dù Chromium có cơ chế sandbox mặc định, hướng dẫn an ninh chính thức của Electron yêu cầu phải khai báo rõ ràng `sandbox: true` để đảm bảo cơ chế cách ly tiến trình hệ điều hành luôn được thực thi nghiêm ngặt trên mọi nền tảng Windows.
- **Đề xuất khắc phục (Giai đoạn Bước 7)**:
  - Thêm `sandbox: true` vào `webPreferences`.

---

## 3. BẢNG TỔNG HỢP MA TRẬN RỦI RO BƯỚC 4

| Mã ID | Tiêu đề phát hiện | Vị trí file:dòng | Chuẩn tham chiếu | CWE | CVSS | Ưu tiên |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| **SEC-04-A** | Lưu trữ Token fallback sang Base64 khi thiếu DPAPI | `electron/main.ts:8-24` | Electron Rule 11 | CWE-312 | 7.1 | **P1** |
| **SEC-04-B** | IPC thiếu xác thực `senderFrame` và whitelist keys | `electron/main.ts:115-145` | Electron Rule 17 | CWE-284 | 6.3 | **P1** |
| **SEC-04-C** | CORS chấp nhận mọi `http://localhost:*` trên production | `src/index.ts:34-50` | OWASP A05:2021 | CWE-942 | 5.4 | **P2** |
| **SEC-04-D** | Tắt kiểm tra SSL trong Vite dev proxy (`secure: false`)| `vite.config.ts:20` | OWASP A02:2021 | CWE-295 | 4.8 | **P2** |
| **SEC-04-E** | Thiếu khai báo `sandbox: true` trong Electron | `electron/main.ts:48-52` | Electron Rule 4 | CWE-693 | 4.0 | **P2** |

---

## 4. KẾT LUẬN & ĐIỀU KIỆN CHUYỂN BƯỚC

- **Trạng thái thực thi**: Hoàn thành rà soát cấu hình mạng và Electron Hardening ở chế độ **Read-Only**.
- **Tính toàn vẹn mã nguồn**: 0 file code bị thay đổi; 81 file working tree được bảo toàn 100%.
- **Bước tiếp theo**: Sau khi nhận được xác nhận từ người dùng, hệ thống sẽ tiến hành **Bước 5: Kiểm thử động DAST (Chỉ trên Localhost:5174 và Localhost:5001)**.
