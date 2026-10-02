import cron from "node-cron";
import { runAutoBackup } from "../controllers/backup.controller";

// Chạy tự động vào lúc 02:00 AM mỗi ngày
// 0 2 * * *
export const initBackupCron = () => {
	cron.schedule("0 2 * * *", async () => {
		console.log(
			"[Cron] Khởi chạy tác vụ tự động sao lưu dữ liệu lúc 02:00 AM...",
		);
		await runAutoBackup();
	});
	console.log("[Cron] Đã đăng ký tác vụ Auto Backup (02:00 AM hàng ngày)");
};
