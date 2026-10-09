import cron from "node-cron";
import { runAutoBackup } from "../controllers/backup.controller";
import { logger } from "../utils/logger";

// Chạy tự động vào lúc 02:00 AM mỗi ngày
// 0 2 * * *
export const initBackupCron = () => {
	cron.schedule("0 2 * * *", async () => {
		logger.cron("AutoBackup", "Started");
		await runAutoBackup();
	});
	logger.cron("AutoBackup", "Scheduled (02:00 AM daily)");
};
