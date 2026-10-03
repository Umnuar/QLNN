# BÁO CÁO KIỂM TOÁN NỘI DUNG BẤT BIẾN (CONTENT INVARIANT AUDIT REPORT)
**Dự án mục tiêu:** QLNN Client (`C:\Users\umnuar\Documents\Projects\QLNN\QLNN-Client`)  
**Dự án đối chiếu:** QLHK (`C:\Users\umnuar\Documents\Projects\QLHK`)  
**Kiểm toán viên:** Subagent V-content (Independent Content Invariant Auditor)  
**Thời điểm thực hiện:** 03/10/2026  
**Trạng thái kiểm toán:** HOÀN THÀNH - ĐẠT CHUẨN 100% (PASS)

---

## 1. TỔNG QUAN & NGUYÊN TẮC BẤT BIẾN (INVARIANT PRINCIPLE)

* **Nguyên tắc cốt lõi:** **Copy FORM only, keep CONTENT intact**.
  - **FORM (sao chép từ QLHK):** Design tokens (màu sắc, border, radius, shadow, spacing, typography, lucide icons), shell layout (sidebar collapsible, header, pills), pattern tương tác, animation, density.
  - **CONTENT (giữ nguyên vẹn từ QLNN):** Tên trang, nhãn tiếng Việt, dữ liệu nông nghiệp, các cột bảng, bộ lọc, chức năng, logic nghiệp vụ, API, phân quyền theo thôn.
* **Quy tắc tuân thủ:**
  1. Mọi chỉ tiêu nông nghiệp và tính năng của QLNN đều phải được bảo toàn nguyên vẹn.
  2. Tuyệt đối không sao chép thuật ngữ, bảng biểu hay logic của QLHK (hộ khẩu, nhân khẩu, tạm trú, tạm vắng, công an...) sang QLNN.
  3. Không thất thoát bất kỳ trường dữ liệu hoặc thứ tự cột nào trong đặc tả 21 cột Excel.

---

## 2. KẾT QUẢ KIỂM TOÁN CHI TIẾT THEO 4 TIÊU CHÍ P0

### 2.1. Tiêu chí 1: 18 Chỉ tiêu Nông Nghiệp Xã Đăk Hà

Kiểm tra toàn bộ 18 chỉ tiêu nông nghiệp (12 cây trồng, 4 vật nuôi, 2 thủy sản) trên 3 giao diện cốt lõi:
1. `HouseholdTable.tsx` (Bảng danh sách hộ: Tabs Cây trồng, Dược liệu, Vật nuôi, Thủy sản, 21 cột Đầy đủ & Accordion mở rộng chi tiết)
2. `HouseholdModal.tsx` (Modal Thêm/Sửa hộ nông nghiệp: 3 tabs Trồng trọt, Chăn nuôi, Thủy sản)
3. `AnalyticsDashboard.tsx` (Bảng thống kê: Hero cards, Donut charts, Progress bars, Bảng so sánh giữa các thôn)

#### Bảng đối soát chi tiết 18 chỉ tiêu:

| STT | Mã trường dữ liệu | Tên chỉ tiêu tiếng Việt | Đơn vị | HouseholdTable.tsx | HouseholdModal.tsx | AnalyticsDashboard.tsx | Đánh giá |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| **I** | **CÂY CÔNG NGHIỆP & ĂN QUẢ (6)** | | | | | | |
| 1 | `cafe_household` | Cà phê (Hộ gia đình) | ha | ✓ (Lines 116, 527, 740, 831, 1443, 1562) | ✓ (Lines 40, 155, 191, 244, 305, 734-753) | ✓ (Lines 122, 445) | **PASS** |
| 2 | `cafe_contracted` | Cà phê (Nhận khoán) | ha | ✓ (Lines 117, 533, 743, 834, 1446, 1565) | ✓ (Lines 41, 156, 192, 245, 306, 756-774) | ✓ (Lines 123, 448) | **PASS** |
| 3 | `rubber_household` | Cao su (Hộ gia đình) | ha | ✓ (Lines 118, 542, 746, 837, 1449, 1568) | ✓ (Lines 42, 157, 193, 246, 307, 788-806) | ✓ (Lines 125, 470) | **PASS** |
| 4 | `rubber_contracted` | Cao su (Nhận khoán) | ha | ✓ (Lines 119, 549, 749, 840, 1452, 1571) | ✓ (Lines 43, 158, 194, 247, 308, 810-828) | ✓ (Lines 126, 473) | **PASS** |
| 5 | `fruit_tree` | Cây ăn quả | ha | ✓ (Lines 120, 557, 752, 843, 1455, 1574) | ✓ (Lines 44, 159, 195, 248, 309, 838-856) | ✓ (Lines 128, 487, 753, 797) | **PASS** |
| 6 | `macadamia` | Cây Mắc ca | ha | ✓ (Lines 121, 564, 755, 846, 1458, 1577) | ✓ (Lines 45, 160, 196, 249, 310, 861-879) | ✓ (Lines 129, 499) | **PASS** |
| **II** | **LƯƠNG THỰC & HÀNG NĂM (2)** | | | | | | |
| 7 | `wet_rice` | Lúa nước | ha | ✓ (Lines 126, 572, 758, 849, 1461, 1580) | ✓ (Lines 50, 165, 201, 254, 315, 884-902) | ✓ (Lines 135, 511) | **PASS** |
| 8 | `other_annual_crops` | Cây hàng năm khác | ha | ✓ (Lines 127, 579, 761, 852, 1464, 1583) | ✓ (Lines 51, 166, 202, 255, 316, 907-925) | ✓ (Lines 136, 523) | **PASS** |
| **III**| **DƯỢC LIỆU ĐĂK HÀ (4)** | | | | | | |
| 9 | `herb_dinh_lang` | Đinh lăng | ha | ✓ (Lines 122, 599, 920, 1008, 1468, 1586)| ✓ (Lines 46, 161, 197, 250, 311, 943-962) | ✓ (Lines 130, 564) | **PASS** |
| 10 | `herb_gung` | Gừng | ha | ✓ (Lines 123, 607, 923, 1010, 1471, 1589)| ✓ (Lines 47, 162, 198, 251, 312, 965-984) | ✓ (Lines 131, 573) | **PASS** |
| 11 | `herb_nghe` | Nghệ | ha | ✓ (Lines 124, 615, 926, 1013, 1474, 1592)| ✓ (Lines 48, 163, 199, 252, 313, 988-1007)| ✓ (Lines 132, 582) | **PASS** |
| 12 | `herb_sa` | Sả | ha | ✓ (Lines 125, 624, 929, 1016, 1477, 1595)| ✓ (Lines 49, 164, 200, 253, 314, 1011-1030)| ✓ (Lines 133, 591) | **PASS** |
| **IV** | **VẬT NUÔI GIA SÚC GIA CẦM (4)**| | | | | | |
| 13 | `buffalo` | Đàn trâu | con | ✓ (Lines 136, 641, 1086, 1173, 1481, 1598)| ✓ (Lines 52, 167, 221, 256, 319, 1051-1070)| ✓ (Lines 140, 621, 653) | **PASS** |
| 14 | `cow` | Đàn bò | con | ✓ (Lines 136, 650, 1089, 1176, 1484, 1601)| ✓ (Lines 53, 168, 222, 257, 320, 1073-1093)| ✓ (Lines 141, 621, 646) | **PASS** |
| 15 | `pig` | Đàn heo | con | ✓ (Lines 136, 656, 1092, 1179, 1487, 1604)| ✓ (Lines 54, 169, 223, 258, 321, 1096-1116)| ✓ (Lines 143, 639, 764, 808) | **PASS** |
| 16 | `poultry` | Đàn gia cầm | con | ✓ (Lines 136, 662, 1095, 1182, 1490, 1607)| ✓ (Lines 55, 170, 224, 259, 322, 1119-1139)| ✓ (Lines 144, 632, 767, 811) | **PASS** |
| **V** | **THỦY SẢN (2)** | | | | | | |
| 17 | `fish_pond` | Nuôi cá ao hồ | ha | ✓ (Lines 456, 681, 1252, 1325, 1494, 1610)| ✓ (Lines 56, 171, 260, 325, 1157-1178) | ✓ (Lines 148, 407, 676, 770, 814) | **PASS** |
| 18 | `fish_cage` | Nuôi cá lồng bè | lồng | ✓ (Lines 456, 689, 1255, 1328, 1497, 1613)| ✓ (Lines 57, 172, 261, 326, 1184-1205) | ✓ (Lines 149, 410, 688, 773, 817) | **PASS** |

* **Đánh giá Tiêu chí 1:** **ĐẠT (18/18 chỉ tiêu hiện diện đầy đủ, đúng tên tiếng Việt và binding chính xác)**.

---

### 2.2. Tiêu chí 2: Đặc tả 21 Cột Excel Đối Soát & Cơ Chế Nhập/Xuất

Kiểm tra `ImportPreviewModal.tsx`, `ExportSettingsModal.tsx`, `HouseholdsPage.tsx` và bộ test tự động `ExcelPreview21Cols.test.tsx`.

#### Đối soát thứ tự 21 cột ma trận:
1. `1. STT` (Số thứ tự)
2. `2. Họ và Tên Chủ Hộ`
3. `3. Cà phê (Hộ)`
4. `4. Cà phê (Nhận k)`
5. `5. Cao su (Hộ)`
6. `6. Cao su (Nhận k)`
7. `7. Cây ăn quả`
8. `8. Macca`
9. `9. Đinh lăng`
10. `10. Gừng`
11. `11. Nghệ`
12. `12. Sả`
13. `13. Lúa nước`
14. `14. Cây HN khác`
15. `15. Trâu (con)`
16. `16. Bò (con)`
17. `17. Heo (con)`
18. `18. Gia cầm (con)`
19. `19. Ao cá (ha)`
20. `20. Lồng bè`
21. `21. Ghi chú`

#### Kết quả kiểm tra:
* `ImportPreviewModal.tsx` thiết kế table chuẩn với đúng 21 thẻ `<th>` được đánh số từ 1 đến 21, mapping chính xác từ `row[0]` đến `row[20]`, không bị lệch cột dữ liệu.
* Khi dữ liệu rỗng, `colspan={21}` hiển thị chính xác.
* `ExportSettingsModal.tsx` hỗ trợ chọn phạm vi: Toàn bộ hộ trong phạm vi / Chỉ xuất {selectedCount} hộ đã chọn.
* `excelApi.ts` và `HouseholdsPage.tsx` tải file định dạng chuẩn `Thong_ke_nong_nghiep_YYYY-MM-DD.xlsx`.
* Test file `ExcelPreview21Cols.test.tsx` gồm 5 test assertions đã chạy PASS 100%.

* **Đánh giá Tiêu chí 2:** **ĐẠT (21/21 cột đúng thứ tự, đúng tiêu đề tiếng Việt, import/export hoạt động chuẩn xác)**.

---

### 2.3. Tiêu chí 3: Tính Bất Biến & Tôn Kính Tiếng Việt (Vietnamese Text Sanctity)

* **Kiểm tra rò rỉ tên miền QLHK:**
  - Tìm kiếm toàn bộ codebase đối với các thuật ngữ QLHK: `"hộ khẩu"`, `"tạm trú"`, `"tạm vắng"`, `"công an"`, `"tách hộ"`.
  - Kết quả: **0 trường hợp vi phạm**. Không có bất kỳ từ ngữ nào của QLHK bị đưa nhầm vào QLNN.
* **Kiểm tra dịch thuật & ngôn ngữ:**
  - Không có nút bấm hay nhãn tiếng Anh nào bị sót (như "Add", "Edit", "Delete", "Save", "Cancel", "Submit").
  - Mọi thuật ngữ đều sử dụng tiếng Việt hành chính chuẩn địa phương: `"Họ và tên chủ hộ"`, `"Thôn quản lý"`, `"Nhận khoán"`, `"Chuyển vào Thùng rác"`, `"Khôi phục"`, `"Xóa vĩnh viễn"`, `"UBND Xã Đăk Hà"`, v.v.
  - Sidebar hiển thị đầy đủ: `"Quản Lý Thôn"`, `"Thống Kê"`, `"Hộ Nông Nghiệp"`, `"Thùng Rác"`, `"Nhật Ký Hoạt Động"`, `"Cài Đặt Hệ Thống"`.

* **Đánh giá Tiêu chí 3:** **ĐẠT (100% tiếng Việt chuẩn, không pha tạp, không rò rỉ ngữ cảnh QLHK)**.

---

### 2.4. Tiêu chí 4: Logic Nghiệp Vụ & An Toàn Bảo Mật (Business Logic & Security)

#### 1. Kiểm soát đồng thời lạc quan (OCC - Optimistic Concurrency Control):
* Kiểu dữ liệu `version?: number | null` được khai báo trong `HouseholdFlat` (`types/index.ts`).
* `HouseholdModal.tsx`:
  - Khởi tạo và lưu trữ `currentVersion = household?.version`.
  - Gửi kèm `version` trong payload cập nhật.
  - Bắt lỗi HTTP `409 Conflict`:
    - Phân biệt 2 tình huống: Trùng tên hộ (`DUPLICATE_NAME`) thì mở dialog xác nhận ghi đè; Xung đột phiên bản (OCC) thì bật banner cảnh báo `isOccConflict = true`.
    - Cung cấp nút `Tải Lại Dữ Liệu Mới Nhất` (`handleReloadLatest`) gọi `householdApi.getHouseholdById()` để lấy bản ghi mới nhất và cập nhật lại `currentVersion`.

#### 2. Phân quyền và phạm vi dữ liệu theo Thôn (RBAC by `village_id`):
* `AppContext.tsx`:
  - Quản lý phiên với `user.role` (`admin` | `user`) và `user.village_id`.
  - Với Trưởng thôn (`role: "user"`): `selectedVillageId` tự động gán cố định theo `user.village_id`.
* `Sidebar.tsx`:
  - Ẩn menu "Quản Lý Thôn" và "Cài Đặt Hệ Thống" đối với Trưởng thôn.
* `HouseholdModal.tsx`:
  - Admin được chọn thôn trong dropdown; Trưởng thôn bị khóa cố định thôn quản lý (`village_id` của bản thân) và UI hiển thị dạng readonly badge.
* `HouseholdsPage.tsx` & `AnalyticsDashboard.tsx`:
  - Trưởng thôn chỉ truy vấn dữ liệu thuộc địa bàn thôn mình quản lý; Admin có thể lọc theo từng thôn hoặc xem "Toàn xã Đăk Hà".

#### 3. Xóa tạm thời (Soft-Delete), Khôi phục (Restore) & Xóa vĩnh viễn (Hard-Delete):
* Trường `is_deleted?: boolean | null` và `deleted_at?: string | null` được định nghĩa trong schema.
* Trong `HouseholdsPage.tsx`:
  - Khi xóa hộ dân đơn lẻ hoặc xóa hàng loạt: gọi `householdApi.delete()` / `householdApi.bulkDelete()` (chuyển vào thùng rác).
  - Hiển thị toast thông báo hoàn tác trong 15 giây kèm nút `Hoàn tác` gọi `householdApi.restore()`.
* Trong `RecycleBinPage.tsx` & `RecycleBinTable.tsx`:
  - Hiển thị danh sách hộ đã xóa tạm kèm đầy đủ 21 cột.
  - Hỗ trợ chọn nhiều hộ để `Khôi Phục` hoặc `Xóa Vĩnh Viễn`.
  - Nút `Xóa Vĩnh Viễn` (`hardDelete`) bị khóa đối với tài khoản Trưởng thôn (`canDelete = user?.role !== "user"`), chỉ cho phép Admin thực hiện sau khi xác nhận cảnh báo.

* **Đánh giá Tiêu chí 4:** **ĐẠT (OCC, RBAC thôn, Soft-delete/Restore/Hard-delete hoạt động hoàn hảo)**.

---

## 3. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG (VITEST RUN REPORT)

Toàn bộ test suite phía client đã được thực thi và vượt qua:
* **Tổng số test suite:** 7/7 files PASS
* **Tổng số test case:** 26/26 tests PASS (100%)
* **Thời gian thực thi:** 4.12s
* **Danh sách test file:**
  1. `src/tests/components/SidebarNavigation.test.tsx` (5 tests) - PASS
  2. `src/tests/components/ExcelPreview21Cols.test.tsx` (5 tests) - PASS
  3. `src/tests/components/Auth.test.tsx` (2 tests) - PASS
  4. `src/tests/components/HouseholdForm.test.tsx` (3 tests) - PASS
  5. `src/tests/components/RecycleBin.test.tsx` (2 tests) - PASS
  6. `src/tests/components/AuditLogView.test.tsx` (2 tests) - PASS
  7. `src/tests/components/HouseholdFilterBar.test.tsx` (7 tests) - PASS

---

## 4. KẾT LUẬN & ĐÁNH GIÁ CUỐI CÙNG

* **Tồn tại/Sai lệch phát hiện:** **KHÔNG CÓ (0 lỗi, 0 sai lệch)**.
* **Kết luận kiểm toán:** Ứng dụng `QLNN-Client` tuân thủ **100% nguyên tắc CONTENT INVARIANT**. Toàn bộ dữ liệu, chỉ số, logic nghiệp vụ, phân quyền theo thôn và nội dung tiếng Việt của QLNN được bảo tồn nguyên vẹn trên nền tảng giao diện chuẩn hóa sao chép từ QLHK.
