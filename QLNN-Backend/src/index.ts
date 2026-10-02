import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { initBackupCron } from "./crons/backup.cron";
import {
	type AuthRequest,
	authenticateToken,
	authorizeVillageScope,
} from "./middlewares/auth.middleware";
import { requestLogger } from "./middlewares/logger.middleware";
import analyticsRoutes from "./routes/analytics.routes";
import auditRoutes from "./routes/audit.routes";
import authRoutes from "./routes/auth.routes";
import backupRoutes from "./routes/backup.routes";
import excelRoutes from "./routes/excel.routes";
import healthRoutes from "./routes/health.routes";
import householdRoutes from "./routes/household.routes";
import userRoutes from "./routes/user.routes";
import villageRoutes from "./routes/village.routes";
import { startDashboard } from "./utils/dashboard";

const app = express();
const PORT = process.env.PORT || 5001;

// Bảo mật HTTP Headers
app.use(helmet());

// Cấu hình CORS
const corsOrigins = process.env.CORS_ORIGIN
	? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
	: ["http://localhost:5174", "http://localhost:5173"];

app.use(
	cors({
		origin: (origin, callback) => {
			// Cho phép requests không có origin (Electron / Mobile / Postman) hoặc nằm trong danh sách
			if (
				!origin ||
				corsOrigins.includes(origin) ||
				origin.startsWith("http://localhost:")
			) {
				callback(null, true);
			} else {
				callback(new Error("Blocked by CORS"));
			}
		},
		credentials: true,
	}),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(requestLogger);

// Health Check Endpoint (Bắt buộc theo quy chuẩn hệ sinh thái Đăk Hà)
app.use("/api/health", healthRoutes);

// Lightweight Ping Endpoint for EMA Latency Monitoring (204 No Content)
app.get("/api/ping", (_req, res) => {
	res.status(204).end();
});

// Test Authenticated Route (Verify Shared SSO Auth)
app.get(
	"/api/auth-test",
	authenticateToken,
	authorizeVillageScope,
	(req: AuthRequest, res: express.Response) => {
		res.json({
			status: "ok",
			message: "Xác thực SSO thành công!",
			user: req.user,
		});
	},
);

// API Routes
app.use("/api/villages", villageRoutes);
app.use("/api/households", householdRoutes);
app.use("/api/excel", excelRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/backup", backupRoutes);

// Root route
app.get("/", (_req, expressRes) => {
	expressRes.json({
		message:
			"Hệ thống Quản Lý Nông Nghiệp & Nông Thôn Mới - Xã Đăk Hà (QLNN API)",
		health: "/api/health",
		version: "1.0.0",
	});
});

// Error handling middleware

app.use(
	(
		err: any,
		_req: express.Request,
		res: express.Response,
		_next: express.NextFunction,
	) => {
		console.error("[Error]", err);
		res.status(err.status || 500).json({
			error: err.message || "Lỗi máy chủ nội bộ",
		});
	},
);

if (process.env.NODE_ENV !== "test") {
	// Khởi chạy các tác vụ nền
	initBackupCron();

	const server = app.listen(PORT, () => {
		console.log(`[QLNN-Backend] Server running on http://localhost:${PORT}`);
		console.log(
			`[QLNN-Backend] Health check available at http://localhost:${PORT}/api/health`,
		);
		startDashboard();
	});

	const gracefulShutdown = async (signal: string) => {
		console.log(
			`[QLNN-Backend] Nhận tín hiệu ${signal}. Đang đóng server và giải phóng kết nối...`,
		);
		server.close(async () => {
			try {
				const { prisma } = await import("./config/prisma");
				await prisma.$disconnect();
				console.log(
					"[QLNN-Backend] Đã ngắt kết nối Prisma an toàn. Tắt server.",
				);
				process.exit(0);
			} catch (e) {
				console.error("[QLNN-Backend] Lỗi khi ngắt kết nối Prisma:", e);
				process.exit(1);
			}
		});
		setTimeout(() => {
			console.error(
				"[QLNN-Backend] Quá thời gian chờ shutdown, ép buộc dừng tiến trình.",
			);
			process.exit(1);
		}, 10000);
	};

	process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
	process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

export default app;
