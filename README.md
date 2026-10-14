# Quản Lý Nông Nghiệp & Nông Thôn Mới Xã Đăk Hà (QLNN)

Hệ thống số hóa, quản lý và đối soát 18 chỉ số nông nghiệp, cơ cấu cây trồng, đàn vật nuôi và diện tích nuôi trồng thủy sản phục vụ công tác chỉ đạo điều hành tại Xã Đăk Hà, Huyện Đăk Hà, Tỉnh Kon Tum.

![Phiên bản](https://img.shields.io/badge/Phi%C3%AAn_b%E1%BA%A3n-v1-emerald?style=flat-square)
![Nền tảng](https://img.shields.io/badge/N%E1%BB%81n_t%E1%BA%A3ng-Windows_Desktop_(Tauri_v2)-blue?style=flat-square)
![Bản quyền](https://img.shields.io/badge/B%E1%BA%A3n_quy%E1%BB%81n-UBND_X%C3%A3_%C4%90%C4%83k_H%C3%A0-red?style=flat-square)

---

## 📥 Tải Về Bộ Cài Đặt Chính Thức

Cán bộ xã và các trưởng thôn tải bộ cài đặt Windows Desktop mới nhất tại mục **Releases**:

👉 **[Tải bộ cài đặt QLNN Desktop v1 (Windows)](https://github.com/Umnuar/QLNN/releases/latest)**

*Gói cài đặt MSI / Setup Executable được đóng gói chuẩn Tauri v2, hỗ trợ tự động kiểm tra và nâng cấp phiên bản (Auto-Updater).*

---

## 🌟 Tính Năng Trọng Tâm

### 1. Giám Sát Toàn Diện 18 Chỉ Số Nông Nghiệp
- **12 Loại cây trồng**: Cà phê hộ, Cà phê nhận khoán, Cao su hộ, Cao su nhận khoán, Cây ăn quả, Cây Mắc ca, Dược liệu (Đinh lăng, Gừng, Nghệ, Sả), Lúa nước, Cây hàng năm khác.
- **4 Loại đàn vật nuôi**: Đàn trâu, đàn bò, đàn heo, đàn gia cầm.
- **2 Loại thủy sản**: Nuôi cá ao (ha), Nuôi cá lồng bè (số lồng).

### 2. Nhập / Xuất Excel Smart Upsert 21 Cột
- Tương thích biểu mẫu chuẩn của ngành nông nghiệp địa phương.
- Xem trước bảng đối soát 21 cột có cố định cột STT và Tên chủ hộ khi cuộn ngang.
- Tự động phân loại bản ghi thêm mới (`create`) hoặc cập nhật (`update`) dựa trên dữ liệu hộ dân hiện có và chống trùng lặp dữ liệu.

### 3. Phân Tích & Đối Soát Biến Động Lịch Sử (Time-Travel Analytics)
- So sánh số liệu nông nghiệp giữa 2 mốc thời gian chốt sổ bất kỳ.
- Bảng đối soát biến động cấp thôn và toàn xã kèm chênh lệch tăng/giảm trực quan.
- Modal xem chi tiết danh sách hộ gia đình có biến động theo từng nhóm chỉ tiêu kinh tế.

### 4. Bảo Mật Doanh Nghiệp & Kiểm Soát Phân Quyền
- Phân quyền nghiêm ngặt theo địa bàn (RBAC Scoping): Cán bộ thôn chỉ quản lý hộ dân thuộc thôn được phân công.
- Khóa lạc quan (OCC 409): Ngăn chặn ghi đè dữ liệu khi nhiều cán bộ cùng thao tác.
- Mã hóa dữ liệu định danh AES-256-GCM và Blind Index tra cứu bảo mật.

---

## 🏛️ Hệ Sinh Thái Số Hóa Công Vụ Xã Đăk Hà

| Hệ thống | Tên đầy đủ | Lĩnh vực phụ trách | Kho lưu trữ Showcase |
| :--- | :--- | :--- | :--- |
| **QLNN** | Quản lý Nông nghiệp | 18 chỉ số nông nghiệp, cây trồng, vật nuôi, NTM | [Umnuar/QLNN](https://github.com/Umnuar/QLNN) |
| **QLHK** | Quản lý Hộ khẩu | Dữ liệu dân cư, nhân khẩu, thôn làng | [Umnuar/QLHK](https://github.com/Umnuar/QLHK) |
| **QLCS** | Quản lý Chính sách | Chế độ người cao tuổi, an sinh xã hội | [Umnuar/QLCS](https://github.com/Umnuar/QLCS) |

---

## ⚖️ Bản Quyền & Giấy Phép Sử Dụng

Toàn bộ bản quyền hệ thống thuộc về **Ủy ban nhân dân Xã Đăk Hà, Huyện Đăk Hà, Tỉnh Kon Tum**.
Kho lưu trữ này là kênh phát hành chính thức (Distribution & Showcase) của phần mềm QLNN. Mã nguồn nội bộ được lưu trữ tại kho lưu trữ bảo mật của đơn vị. Nghiêm cấm sao chép, trích xuất hoặc phân phối lại dưới mọi hình thức khi chưa được cấp phép bằng văn bản. Chi tiết tại [LICENSE](LICENSE).
