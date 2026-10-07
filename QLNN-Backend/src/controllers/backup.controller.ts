import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import type { AuthRequest } from "../middlewares/auth.middleware";

export const exportDatabase = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const [
			villages,
			users,
			households,
			crop_items,
			livestock_items,
			aquaculture_items,
			audit_logs,
		] = await Promise.all([
			prisma.villages.findMany(),
			prisma.users.findMany({
				select: {
					id: true,
					username: true,
					role: true,
					village_id: true,
					created_at: true,
				},
			}),
			prisma.households.findMany(),
			prisma.crop_items.findMany(),
			prisma.livestock_items.findMany(),
			prisma.aquaculture_items.findMany(),
			prisma.audit_logs.findMany(),
		]);

		const backupData = {
			metadata: {
				exportedAt: new Date().toISOString(),
				version: "1.0",
				environment: process.env.NODE_ENV || "development",
			},
			data: {
				villages,
				users,
				households,
				crop_items,
				livestock_items,
				aquaculture_items,
				audit_logs,
			},
		};

		res.setHeader("Content-Type", "application/json");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="Dakha_Backup_${new Date().toISOString().split("T")[0]}.json"`,
		);
		res.send(JSON.stringify(backupData, null, 2));
	} catch (error: any) {
		console.error("Lỗi khi export database:", error);
		res.status(500).json({ error: "Không thể xuất dữ liệu backup." });
	}
};

export const runAutoBackup = async (): Promise<void> => {
	try {
		console.log("[AutoBackup] Đang tiến hành sao lưu dữ liệu...");

		const [
			villages,
			users,
			households,
			crop_items,
			livestock_items,
			aquaculture_items,
			audit_logs,
		] = await Promise.all([
			prisma.villages.findMany(),
			prisma.users.findMany({
				select: {
					id: true,
					username: true,
					role: true,
					village_id: true,
					created_at: true,
				},
			}),
			prisma.households.findMany(),
			prisma.crop_items.findMany(),
			prisma.livestock_items.findMany(),
			prisma.aquaculture_items.findMany(),
			prisma.audit_logs.findMany(),
		]);

		const backupData = {
			metadata: {
				exportedAt: new Date().toISOString(),
				version: "1.0",
				type: "auto",
			},
			data: {
				villages,
				users,
				households,
				crop_items,
				livestock_items,
				aquaculture_items,
				audit_logs,
			},
		};

		const backupDir = path.join(process.cwd(), "backups");
		if (!fs.existsSync(backupDir)) {
			fs.mkdirSync(backupDir, { recursive: true });
		}

		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const filename = `auto_backup_${timestamp}.json`;
		const filepath = path.join(backupDir, filename);

		fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
		console.log(`[AutoBackup] Đã tạo bản sao lưu thành công tại: ${filename}`);

		// Cleanup cũ (xoay vòng 7 ngày: BACKUP_RETENTION_DAYS = 7)
		const files = fs.readdirSync(backupDir);
		const now = Date.now();
		const BACKUP_RETENTION_DAYS = 7;
		const RETENTION_MS = BACKUP_RETENTION_DAYS * 24 * 60 * 60 * 1000;

		for (const file of files) {
			if (file.startsWith("auto_backup_")) {
				const fullPath = path.join(backupDir, file);
				const stats = fs.statSync(fullPath);
				if (now - stats.mtimeMs > RETENTION_MS) {
					fs.unlinkSync(fullPath);
					console.log(`[AutoBackup] Đã xoá bản sao lưu cũ quá 7 ngày: ${file}`);
				}
			}
		}
	} catch (error) {
		console.error("[AutoBackup] Lỗi nghiêm trọng khi sao lưu tự động:", error);
	}
};

export const restoreDatabase = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		if (req.user?.role !== "admin") {
			res
				.status(403)
				.json({ error: "Không có quyền thực hiện chức năng này." });
			return;
		}

		const { data, admin_password } = req.body;
		if (!admin_password) {
			res.status(400).json({
				error: "Vui lòng nhập mật khẩu quản trị viên để xác nhận phục hồi.",
			});
			return;
		}

		const adminUser = await prisma.users.findUnique({
			where: { id: req.user!.id },
		});

		if (
			!adminUser ||
			!(await bcrypt.compare(admin_password, adminUser.password))
		) {
			res.status(401).json({
				error:
					"Mật khẩu quản trị viên không chính xác. Thao tác phục hồi bị hủy bỏ.",
			});
			return;
		}

		if (!data || !data.villages || !data.users || !data.households) {
			res
				.status(400)
				.json({ error: "Dữ liệu backup không hợp lệ hoặc thiếu thông tin." });
			return;
		}

		// Disable foreign key constraints if needed, but Prisma $transaction deletes in order is better.
		// Order of deletion (child to parent)
		// audit_logs, crop_items, livestock_items, aquaculture_items, households, users, villages

		await prisma.$transaction(
			async (tx) => {
				await tx.audit_logs.deleteMany();
				await tx.crop_items.deleteMany();
				await tx.livestock_items.deleteMany();
				await tx.aquaculture_items.deleteMany();
				await tx.households.deleteMany();
				await tx.users.deleteMany();
				await tx.villages.deleteMany();

				if (data.villages && data.villages.length > 0) {
					await tx.villages.createMany({ data: data.villages });
				}
				if (data.users && data.users.length > 0) {
					await tx.users.createMany({ data: data.users });
				}
				if (data.households && data.households.length > 0) {
					await tx.households.createMany({ data: data.households });
				}
				if (data.crop_items && data.crop_items.length > 0) {
					await tx.crop_items.createMany({ data: data.crop_items });
				}
				if (data.livestock_items && data.livestock_items.length > 0) {
					await tx.livestock_items.createMany({ data: data.livestock_items });
				}
				if (data.aquaculture_items && data.aquaculture_items.length > 0) {
					await tx.aquaculture_items.createMany({ data: data.aquaculture_items });
				}
				if (data.audit_logs && data.audit_logs.length > 0) {
					await tx.audit_logs.createMany({ data: data.audit_logs });
				}
			},
			{ timeout: 30000, maxWait: 15000 },
		);

		res.status(200).json({ message: "Phục hồi dữ liệu thành công." });
	} catch (error: any) {
		console.error("Lỗi khi restore database:", error);
		res
			.status(500)
			.json({ error: "Không thể phục hồi dữ liệu.", details: error.message });
	}
};
