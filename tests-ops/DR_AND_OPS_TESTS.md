# Kịch bản Kiểm thử Vận hành & Kiến trúc (Phần 12 - 19)

Thư mục này chứa các kịch bản kiểm thử (Playbooks) dành cho hệ thống ở cấp độ Ops & DevOps, nơi không thể dùng code Jest/Vitest thông thường để chạy.

## 12. Kiểm thử CI/CD Pipeline & Triển khai Không Gián Đoạn (Blue-Green/Canary)
### Mục tiêu: Đảm bảo luồng Deploy an toàn và tự động
* Kích hoạt một bản release lỗi (cố tình gây lỗi trong quá trình khởi động hoặc không vượt qua Health Check).
* **Kỳ vọng:** Pipeline tự động Rollback về phiên bản ổn định trước đó, hệ thống (Load Balancer) không route traffic vào instance lỗi. Đảm bảo uptime 99.9%.

## 13. Configuration Management & Secrets Testing
### Mục tiêu: Đảm bảo rò rỉ mã nguồn không dẫn đến lộ thông tin nhạy cảm
* Kiểm tra các file `.env` không được push lên git, thay vào đó là sử dụng HashiCorp Vault hoặc AWS Secrets Manager.
* **Kịch bản:** Chạy lệnh rà soát git history bằng công cụ `trufflehog` hoặc `git-secrets`.
* **Kỳ vọng:** Không tìm thấy chuỗi mật khẩu Database, API Keys, hay JWT Secrets bị hardcode.

## 14. Kiểm thử Phục hồi sau thảm hoạ (Disaster Recovery)
### Mục tiêu: Khôi phục Database từ Backup
**Các bước (Mock script):**
1. Gọi API tạo bản Backup: `curl -X POST http://localhost:5001/api/backup/create -H "Authorization: Bearer <Admin_Token>"`
2. Xác nhận file `.sql` hoặc `.dump` được tạo trong thư mục backups.
3. Dừng hệ thống: `pm2 stop qlnn-backend`
4. DROP cơ sở dữ liệu: `psql -U postgres -c "DROP DATABASE qlnn;"`
5. Tái tạo cơ sở dữ liệu: `psql -U postgres -c "CREATE DATABASE qlnn;"`
6. Phục hồi: `psql -U postgres -d qlnn < backups/latest_backup.sql`
7. Khởi động lại hệ thống và kiểm tra tính toàn vẹn.

## 15. Kiểm thử Tính bất biến (Immutability & Forensics)
### Mục tiêu: Đảm bảo Audit Log là "Chỉ ghi" (Write-only)
* Chạy Script SQL trực tiếp: `DELETE FROM audit_logs WHERE id = '...';`
* **Kỳ vọng:** Database trigger hoặc cấu hình RLS (Row Level Security) từ chối lệnh `DELETE` và `UPDATE` trên bảng `audit_logs`. (Cần cấu hình bổ sung trên PostgreSQL).

## 16. Kiểm thử Hàng đợi (Background Jobs)
### Mục tiêu: Xử lý nghẽn cổ chai khi Import file Excel 1 triệu dòng
* Chạy kịch bản: Upload file `1_million_rows.xlsx`.
* **Kỳ vọng:** API phản hồi HTTP 202 (Accepted) ngay lập tức, và một Background Worker (RabbitMQ/BullMQ) xử lý ngầm, cập nhật % tiến trình qua WebSockets thay vì block Main Thread của Node.js.

## 17. Tương thích ngược API (Backward Compatibility)
### Mục tiêu: Ứng dụng Mobile cũ không bị sập khi API nâng cấp
* Đảm bảo tất cả các cập nhật Schema không xoá các trường (fields) cũ mà chỉ đánh dấu `@deprecated`. 
* Dùng `supertest` gọi vào Endpoint `/api/v1/households` đảm bảo cấu trúc trả về không đổi.

## 18. Kiểm thử FinOps (Cloud Exhaustion)
### Mục tiêu: Chống tính toán vô hạn (Infinite Loops)
* Dùng công cụ `k6` tạo 10,000 kết nối WebSocket giả mạo, hoặc gọi `/api/export` 1,000 lần.
* **Kỳ vọng:** Rate Limiter ở API Gateway / NGINX ngắt kết nối với HTTP 429 (Too Many Requests), ngăn chặn quá tải CPU/RAM của server thực.

## 19. Kiểm thử Quyền riêng tư (GDPR/PDPA)
### Mục tiêu: Che giấu PII (Masking)
* Gọi API lấy danh sách với quyền User thường: `/api/households`.
* Kiểm tra response: Số điện thoại phải trả về định dạng `090****123` thay vì số gốc. (Yêu cầu bổ sung logic masking ở `household.controller.ts`).
