# PHẦN MỀM QUẢN LÝ NÔNG NGHIỆP & HỘ SẢN XUẤT (QLNN) - UBND XÃ ĐĂK HÀ

> **Phiên bản chính thức:** v1.5.0 (Bản phát hành Desktop ổn định)  
> **Nền tảng hỗ trợ:** Windows 10 / Windows 11 (64-bit)  
> **Đơn vị chủ quản:** Ủy ban Nhân dân Xã Đăk Hà, Huyện Tu Mơ Rông, Tỉnh Kon Tum  
> **Hạ tầng kết nối:** Mạng diện rộng an toàn qua Cloudflare Tunnel (qlnn.dulieudakha.vn)

---

## 1. GIỚI THIỆU TỔNG QUAN
- **Sứ mệnh chuyển đổi số**: Phân hệ Quản lý Nông nghiệp & Hộ sản xuất (QLNN) là giải pháp công vụ số hóa chuyên sâu của UBND Xã Đăk Hà, phục vụ chuyển đổi phương thức quản lý sản xuất nông nghiệp từ ghi chép sổ sách và các bảng tính Excel phân tán sang hệ sinh thái dữ liệu tập trung, thời gian thực.
- **Nghiệp vụ cốt lõi**: Giám sát và tổng hợp 18 chỉ tiêu phát triển nông nghiệp (cây trồng, vật nuôi, thủy sản); quản lý hiện trạng sản xuất đến từng hộ gia đình; phân tích đối soát biến động phục vụ công tác lãnh đạo, điều hành kinh tế nông thôn mới.
- **Đối tượng người dùng chính**:
  - Cán bộ Nông nghiệp - Địa chính cấp xã quản trị dữ liệu quy hoạch toàn xã, tổng hợp báo cáo kinh tế nông nghiệp theo định kỳ.
  - Trưởng thôn, Ban Quản lý 8 thôn/làng bản trực tiếp rà soát, cập nhật số liệu diện tích gieo trồng và đàn vật nuôi của các hộ dân trong thôn.
  - Lãnh đạo Đảng ủy, HĐND và UBND Xã theo dõi trực quan các chỉ số kinh tế nông nghiệp phục vụ chỉ đạo sản xuất và chỉ đạo xây dựng Nông thôn mới.

## 2. TẢI VỀ BẢN PHÁT HÀNH CHÍNH THỨC (.EXE / .MSI)
Cán bộ và các đơn vị trực thuộc tải về bộ cài đặt chính thức tại liên kết sau:

| Loại tệp | Tên tệp phát hành | Dung lượng | Tải trực tiếp |
| :--- | :--- | :---: | :---: |
| **Bộ cài đặt tiêu chuẩn (Installer)** | `QLNN-Setup-v1.5.0.exe` | ~12 MB | [Tải về (.exe)](https://github.com/Umnuar/QLNN/releases/latest/download/QLNN-Setup-v1.5.0.exe) |
| **Gói triển khai hệ thống (MSI Package)** | `QLNN_1.5.0_x64_en-US.msi` | ~15 MB | [Tải về (.msi)](https://github.com/Umnuar/QLNN/releases/latest/download/QLNN_1.5.0_x64_en-US.msi) |

> [!NOTE]
> Tất cả các bản dựng đều được kiểm tra tính toàn vẹn và tích hợp cơ chế tự động nâng cấp phiên bản (Auto-Updater). Cán bộ có thể xem toàn bộ lịch sử các bản vá tại [GitHub Releases](https://github.com/Umnuar/QLNN/releases).

## 3. YÊU CẦU HỆ THỐNG MÁY TRẠM
Để đảm bảo phần mềm hoạt động mượt mà, máy tính cán bộ cần đáp ứng các tiêu chuẩn sau:
- **Hệ điều hành**: Microsoft Windows 10 (Build 19041 trở lên) hoặc Windows 11 (64-bit).
- **Phần cứng tối thiểu**:
  - Bộ vi xử lý (CPU): Intel Core i3 thế hệ 6 / AMD Ryzen 3 trở lên.
  - Dung lượng RAM: Tối thiểu 4GB (Khuyến nghị 8GB để xử lý bảng tính lớn).
  - Dung lượng ổ cứng: Trống tối thiểu 500MB (Khuyến nghị sử dụng ổ cứng SSD).
- **Màn hình hiển thị**: Độ phân giải tối ưu chuẩn 1920x1080 (FullHD Single-Viewport) hoặc tối thiểu 1366x768.
- **Kết nối mạng**: Cần có kết nối Internet để đồng bộ dữ liệu thời gian thực về máy chủ xã (Hệ thống có cơ chế Offline Cache tự động bảo toàn dữ liệu khi đường truyền gián đoạn).

## 4. HƯỚNG DẪN CÀI ĐẶT & NÂNG CẤP
- **Bước 1**: Tải tệp tin `QLNN-Setup-v1.5.0.exe` từ bảng tải về ở Mục 2.
- **Bước 2**: Nhấp đúp chuột vào tệp tin vừa tải về để tiến hành cài đặt tự động. Trình cài đặt được thiết kế chạy trực tiếp trong không gian người dùng, không yêu cầu cấp quyền Administrator phức tạp.
- **Lưu ý Windows SmartScreen**: Đối với lần khởi động đầu tiên, do phần mềm lưu hành nội bộ chính quyền số, Windows có thể hiển thị thông báo bảo vệ màu xanh:
  1. Nhấp chuột vào dòng chữ **"More info"** (hoặc *Thông tin khác*).
  2. Chọn nút **"Run anyway"** (hoặc *Vẫn chạy*) để tiếp tục khởi chạy ứng dụng.
- **Cơ chế cập nhật tự động (Auto-Update)**: Mỗi khi mở ứng dụng, phần mềm tự động kiểm tra phiên bản mới nhất từ máy chủ phát hành qua kênh mã hóa an toàn HTTPS. Khi có bản cập nhật mới, hệ thống tự động tải về ngầm và hiển thị thông báo, cán bộ chỉ cần nhấn 1 cú nhấp chuột để hoàn tất nâng cấp mà không bị mất dữ liệu đang làm việc.

## 5. CÁC TÍNH NĂNG NGHIỆP VỤ NỔI BẬT
1. **Giám sát toàn diện 18 chỉ tiêu nông nghiệp**: Quản lý chi tiết diện tích 12 loại cây trồng (cà phê, cao su, sâm Ngọc Linh và các loại dược liệu, mắc ca, cây ăn quả, lúa nước, hoa màu...), quy mô đàn 4 loại vật nuôi (trâu, bò, heo, gia cầm) và 2 mô hình thủy sản (ao hồ, lồng bè).
2. **Quản lý dữ liệu sản xuất theo từng hộ gia đình**: Lưu trữ hồ sơ nông nghiệp gắn liền với chủ hộ và địa bàn thôn, giúp nắm bắt chính xác quy mô canh tác, năng lực sản xuất của từng hộ để triển khai các chính sách hỗ trợ phát triển kinh tế kịp thời.
3. **Nhập xuất bảng tính Excel 21 cột tiêu chuẩn**: Cho phép tiếp nhận tệp bảng tính biểu mẫu thống kê nông nghiệp từ các thôn; cung cấp màn hình xem trước đối soát dữ liệu với tính năng cố định 2 cột đầu (số thứ tự, tên chủ hộ) để kiểm tra tính hợp lệ trước khi lưu vào cơ sở dữ liệu.
4. **Khóa lạc quan (OCC) chống ghi đè dữ liệu**: Tích hợp cơ chế phát hiện xung đột dữ liệu đồng thời qua trường phiên bản `version`, cảnh báo ngay lập tức nếu có người khác đang chỉnh sửa cùng bản ghi, bảo vệ tuyệt đối tính nhất quán của số liệu.
5. **Phân quyền truy cập theo địa bàn thôn**: Giới hạn thẩm quyền thao tác dữ liệu: Trưởng thôn chỉ được phép xem và cập nhật số liệu của hộ nông nghiệp trong thôn mình; Cán bộ Xã quản trị toàn diện dữ liệu toàn xã và phân bổ tài khoản.
6. **Báo cáo phục vụ đánh giá tiêu chí Nông thôn mới**: Tự động tổng hợp số liệu diện tích gieo trồng, sản lượng ước tính và tổng đàn gia súc gia cầm, cung cấp báo cáo nhanh phục vụ hoàn thiện Tiêu chí số 10 (Thu nhập) và Tiêu chí số 13 (Tổ chức sản xuất và phát triển kinh tế nông thôn).

## 6. HƯỚNG DẪN ĐĂNG NHẬP & KẾT NỐI HỆ THỐNG
- **Khởi động ứng dụng**: Nhấp đúp vào biểu tượng lối tắt **"QLNN - UBND Xã Đăk Hà"** trên màn hình Desktop hoặc tìm kiếm trong menu Start của Windows.
- **Máy chủ kết nối**: Ứng dụng đã được tích hợp sẵn cấu hình định tuyến an toàn về trung tâm dữ liệu `qlnn.dulieudakha.vn` qua hệ thống mạng diện rộng Cloudflare Tunnel, cán bộ không cần thiết lập IP hay cổng kết nối thủ công.
- **Tài khoản truy cập**: Cán bộ sử dụng tên đăng nhập và mật khẩu chính thức do Tổ Quản trị Công nghệ thông tin / Văn phòng UBND Xã Đăk Hà cấp phát theo vị trí công tác.

## 7. AN TOÀN THÔNG TIN & BẢN QUYỀN SỞ HỮU
- **Bản quyền phần mềm**: Toàn bộ bản quyền phần mềm, cấu trúc dữ liệu và tài liệu kỹ thuật thuộc quyền sở hữu độc quyền của **Ủy ban Nhân dân Xã Đăk Hà, Huyện Tu Mơ Rông, Tỉnh Kon Tum**. Nghiêm cấm mọi hành vi sao chép, trích xuất mã nguồn, chỉnh sửa, phân phối lại hoặc can thiệp thương mại khi chưa có văn bản chấp thuận chính thức từ UBND Xã.
- **An toàn thông tin dữ liệu sản xuất**:
  - Dữ liệu sản xuất của các hộ gia đình được mã hóa và lưu trữ an toàn trên hệ thống máy chủ cơ sở dữ liệu nội bộ.
  - Phân tách phạm vi truy cập dữ liệu đa người thuê (Multi-tenant) triệt để giữa các thôn, ngăn chặn việc truy xuất dữ liệu trái thẩm quyền.
  - Lưu vết nhật ký thay đổi số liệu (Audit Log) theo thời gian thực để phục vụ công tác hậu kiểm, tra soát.

## 8. ĐẦU MỐI HỖ TRỢ KỸ THUẬT & LIÊN HỆ
- **Đơn vị phụ trách**: Tổ Công nghệ số cộng đồng & Bộ phận Thống kê - Văn phòng UBND Xã Đăk Hà.
- **Thường trực hỗ trợ kỹ thuật**: `baotruongminh201@gmail.com`
- **Báo cáo sự cố hoặc đề xuất tính năng**: Tạo yêu cầu tại mục [Issues trên GitHub Repository chính thức](https://github.com/Umnuar/QLNN/issues).
