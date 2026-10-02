# ELECTRON SECURITY AUDIT REPORT: QUẢN LÝ NÔNG NGHIỆP (QLNN)
## Agent 2 — Security & Electron Security Engineer | Phân Hệ QLNN — Đăk Hà Ecosystem

---

## 1. Bảng Đánh Giá Tiêu Chuẩn Bảo Mật Electron (Electron Security Checklist)

Được đối chiếu trực tiếp với tài liệu bảo mật chính thức của Electron (Electron Security Best Practices):

| Tiêu Chuẩn Bảo Mật | Thiết Lập Hiện Tại | Đánh Giá | Ghi Chú & Khuyến Nghị |
| :--- | :---: | :---: | :--- |
| **1. contextIsolation** | `true` | ✅ PASS | Đã bật, ngăn cách hoàn toàn luồng bộ nhớ Renderer và Preload |
| **2. nodeIntegration** | `false` | ✅ PASS | Đã tắt, Renderer không thể gọi `require()` hay native Node.js APIs |
| **3. Sandbox** | Mặc định | ⚠️ CẦN RÀ | Khuyến nghị bật tường minh `sandbox: true` trong `webPreferences` |
| **4. Content Security Policy (CSP)** | **THIẾU** | ❌ **FAIL** | Chưa cấu hình thẻ `<meta http-equiv="Content-Security-Policy">` |
| **5. Navigation Restriction (`will-navigate`)** | **THIẾU** | ❌ **FAIL** | Chưa chặn sự kiện người dùng kéo thả URL hoặc chuyển hướng cửa sổ |
| **6. Window Creation (`setWindowOpenHandler`)** | **THIẾU** | ❌ **FAIL** | Chưa chặn việc mở cửa sổ mới qua `window.open()` |
| **7. Context Bridge Exposure** | `api` object | ✅ PASS | Chỉ expose các hàm định nghĩa trước, không expose `ipcRenderer` thô |
| **8. IPC Input Validation** | Thô sơ | ⚠️ CẦN SỬA | Các handler `app:set-zoom`, `secure-store:set` thiếu kiểm tra kiểu |
| **9. DevTools in Production** | Có điều kiện | ✅ PASS | Chỉ mở DevTools khi nhấn F12 nếu được cấu hình |
| **10. Safe Storage / Credentials** | Gán cứng key | ❌ **FAIL** | Sử dụng key đối xứng thay vì DPAPI OS (`safeStorage`) |

---

## 2. Chi Tiết Các Điểm Yếu Electron Cụ Thể

### ELEC-01: Thiếu Content Security Policy (CSP)
- **Vị trí**: `QLNN-Client/index.html` và `QLNN-Client/electron/main.ts`.
- **Rủi ro**: Không có CSP, nếu ứng dụng gặp lỗ hổng XSS (ví dụ qua tên chủ hộ hoặc ghi chú trong tệp Excel độc hại), mã script độc hại có thể kết nối ra các máy chủ bên ngoài (exfiltration), tải các tệp script lạ hoặc nạp inline styles nguy hiểm.
- **Khắc phục**:
  Thêm CSP nghiêm ngặt vào thẻ `<head>` của `index.html`:
  ```html
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:5001 https://qlnn.dulieudakha.vn; img-src 'self' data:; font-src 'self' data:;">
  ```

### ELEC-02: Thiếu Rào Chắn Điều Hướng Cửa Sổ (Navigation & New Window Guard)
- **Vị trí**: `QLNN-Client/electron/main.ts` (trong hàm `createWindow`).
- **Rủi ro**: Nếu người dùng bấm vào một liên kết độc hại hoặc kéo thả một tệp URL vào cửa sổ ứng dụng, Electron sẽ điều hướng toàn bộ ứng dụng sang trang web lạ đó. Nếu không có bộ lọc `setWindowOpenHandler`, thẻ `<a target="_blank">` có thể mở các cửa sổ phụ không kiểm soát.
- **Khắc phục**:
  Bổ sung vào `createWindow()`:
  ```ts
  // Chặn toàn bộ điều hướng ngoài ý muốn
  win.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== VITE_DEV_SERVER_URL && parsedUrl.protocol !== 'file:') {
      event.preventDefault();
    }
  });

  // Chặn mở cửa sổ mới tùy tiện
  win.webContents.setWindowOpenHandler(({ url }) => {
    // Chỉ mở qua trình duyệt mặc định bên ngoài nếu an toàn, hoặc chặn hoàn toàn
    return { action: 'deny' };
  });
  ```

### ELEC-03: Thiếu Xác Thực Tham Số Đầu Vào IPC (Unvalidated IPC Inputs)
- **Vị trí**: `QLNN-Client/electron/main.ts` (dòng 127-132).
- **Mã nguồn hiện tại**:
  ```ts
  ipcMain.handle("app:set-zoom", (_e, level: number) => {
    if (win && win.webContents) {
      win.webContents.setZoomFactor(level / 100);
    }
  });
  ```
- **Rủi ro**: Tham số `level` từ Renderer không được kiểm tra `typeof level === 'number'`, không kiểm tra `isFinite(level)` và không giới hạn khoảng hợp lệ (80% đến 140%). Nếu Renderer truyền `0`, `-100`, hoặc `NaN`, giao diện Electron có thể bị treo hoặc phóng to vô hạn làm biến dạng layout máy trạm.
- **Khắc phục**:
  ```ts
  ipcMain.handle("app:set-zoom", (_e, level: number) => {
    if (win && win.webContents && typeof level === "number" && !Number.isNaN(level)) {
      const safeLevel = Math.max(80, Math.min(140, level));
      win.webContents.setZoomFactor(safeLevel / 100);
    }
  });
  ```
