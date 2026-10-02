# CHÍNH SÁCH BẢO MẬT & BÁO CÁO LỖ HỔNG (SECURITY POLICY)
## Hệ Thống Quản Lý Dữ Liệu Nông Nghiệp & Nông Thôn Mới Xã Đăk Hà (QLNN)
**Cơ quan chủ quản**: UBND Xã Đăk Hà, Huyện Đăk Hà, Tỉnh Kon Tum  
**Phiên bản áp dụng**: v1.0.0 trở lên

---

Ban chỉ đạo Chuyển đổi số Xã Đăk Hà và đội ngũ phát triển hệ sinh thái số hóa công vụ cam kết bảo vệ toàn vẹn dữ liệu nông nghiệp, nông dân và thông tin công vụ của địa phương. Chúng tôi hoan nghênh và trân trọng mọi đóng góp phát hiện lỗ hổng an ninh thông tin theo quy trình tiết lộ có trách nhiệm (Responsible Disclosure).

---

## 1. CÁC PHIÊN BẢN ĐƯỢC HỖ TRỢ BẢO MẬT (SUPPORTED VERSIONS)

Chỉ các phiên bản chính thức sau đây được hỗ trợ cập nhật vá lỗi bảo mật liên tục:

| Phiên bản | Tình trạng hỗ trợ | Ghi chú |
| :---: | :---: | :--- |
| **v1.0.x (Hiện tại)** | :white_check_mark: Được hỗ trợ đầy đủ | Nhánh chính `main` & `sec/hardening` |
| **< v1.0.0 (Bản thử nghiệm)** | :x: Ngừng hỗ trợ | Yêu cầu nâng cấp lên bản mới nhất |

---

## 2. QUY TRÌNH BÁO CÁO LỖ HỔNG CÓ TRÁCH NHIỆM (REPORTING A VULNERABILITY)

Nếu bạn phát hiện một vấn đề hoặc lỗ hổng an ninh tiềm ẩn trong ứng dụng QLNN (Web, Desktop Electron hoặc Backend API), vui lòng thực hiện theo các bước sau:

### 2.1. Kênh tiếp nhận an toàn
- **KHÔNG** công khai lỗ hổng trên GitHub Issues, Pull Requests hoặc mạng xã hội trước khi lỗi được vá.
- **Gửi báo cáo trực tiếp đến**:
  - **Email Quản trị An ninh**: `admin@dulieudakha.vn` (hoặc `bancntt.dakha@gmail.com`)
  - **Tiêu đề email**: `[SECURITY VULNERABILITY] - Báo cáo lỗ hổng QLNN - <Mức độ dự kiến P0/P1/P2>`

### 2.2. Thông tin cần cung cấp trong báo cáo
Để giúp đội ngũ kỹ thuật nhanh chóng tái hiện và khắc phục, vui lòng cung cấp:
1. **Mô tả chi tiết lỗ hổng**: Thuộc loại lỗ hổng nào (CWE, OWASP Top 10:2021).
2. **Vị trí ảnh hưởng**: Endpoint API, component giao diện, hoặc kênh giao tiếp IPC Electron.
3. **Kịch bản khai thác tối thiểu (Minimal PoC)**: Các bước tái hiện chi tiết (kèm request mẫu hoặc script thử nghiệm trên môi trường Localhost).
4. **Đánh giá mức độ ảnh hưởng**: Rủi ro đối với tính bảo mật (Confidentiality), toàn vẹn (Integrity) hoặc sẵn sàng (Availability) của dữ liệu cấp xã.
5. **Gợi ý phương án khắc phục** (nếu có).

---

## 3. CAM KẾT VÀ THỜI GIAN PHẢN HỒI (SLA)

Đội ngũ kỹ thuật cam kết xử lý báo cáo bảo mật theo các mốc thời gian:

- **Xác nhận tiếp nhận (Triage)**: Trong vòng **24 giờ** kể từ khi nhận được email.
- **Xác minh & Phân loại mức độ**: Trong vòng **48 giờ**.
- **Kế hoạch vá lỗi**:
  - **Mức P0 (Nguy cấp)**: Phát hành bản vá trong vòng **24 - 72 giờ**.
  - **Mức P1 (Cao)**: Phát hành bản vá trong vòng **5 ngày làm việc**.
  - **Mức P2/P3 (Trung bình / Thấp)**: Khắc phục trong bản phát hành định kỳ kế tiếp.
- **Thông báo phối hợp**: Chúng tôi sẽ thông báo cho người phát hiện ngay khi bản vá được kiểm thử thành công và sẵn sàng triển khai.

---

## 4. PHẠM VI ÁP DỤNG & CÁC HÀNH VI BỊ NGHIÊM CẤM

### 4.1. Trong phạm vi được phép kiểm thử (In-Scope)
- Mã nguồn Backend API (`QLNN-Backend`) và cấu hình cơ sở dữ liệu trên môi trường kiểm thử cục bộ (`localhost:5001`).
- Mã nguồn Client Web & Desktop Electron (`QLNN-Client`) trên môi trường kiểm thử cục bộ (`localhost:5174`).
- Cơ chế xác thực JWT, thu hồi phiên làm việc qua `token_version`, phân quyền đa thôn RBAC và kiểm tra tính toàn vẹn tải file.

### 4.2. Ngoài phạm vi & Nghiêm cấm tuyệt đối (Out-of-Scope & Prohibited)
- **Tuyệt đối không tấn công vào máy chủ Production thực tế** (`qlnn.dulieudakha.vn`) hoặc cơ sở hạ tầng đám mây trực tiếp.
- Không thực hiện các cuộc tấn công từ chối dịch vụ (DoS / DDoS) làm gián đoạn công vụ của UBND Xã.
- Không thử nghiệm brute force tài khoản thực tế của cán bộ xã.
- Không truy cập, sửa đổi, hủy hoại hoặc sao chép dữ liệu thực tế của công dân và hộ nông dân xã Đăk Hà.
- Không sử dụng kỹ thuật lừa đảo xã hội (Social Engineering, Phishing) nhắm vào cán bộ xã.

---

## 5. BẢO VỆ DỮ LIỆU CÁ NHÂN & CÔNG DÂN
Toàn bộ dữ liệu quản lý trong hệ thống được xử lý theo các quy định bảo vệ dữ liệu cá nhân của pháp luật Việt Nam (bao gồm Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân — *cần xác minh chi tiết với người có chuyên môn pháp lý khi triển khai thực tế*). Mọi hành vi làm lộ lọt dữ liệu hộ nông dân và công dân sẽ bị xử lý theo quy định hiện hành.
