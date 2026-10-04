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
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5001;

// Bảo mật HTTP Headers
app.use(helmet());

// Cấu hình CORS (Hỗ trợ hệ sinh thái dulieudakha.vn, Cloudflare Tunnel và Local dev)
const corsOrigins = process.env.CORS_ORIGIN
	? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
	: [
			"https://qlnn.dulieudakha.vn",
			"https://dulieudakha.vn",
			"http://localhost:5174",
			"http://localhost:5173",
		];

app.use(
	cors({
		origin: (origin, callback) => {
			const isDev = process.env.NODE_ENV !== "production";
			// Cho phép requests không có origin (Electron / Mobile / Postman) hoặc nằm trong danh sách
			if (
				!origin ||
				origin === "https://qlnn.dulieudakha.vn" ||
				origin.endsWith(".dulieudakha.vn") ||
				corsOrigins.includes(origin) ||
				(isDev && origin.startsWith("http://localhost:"))
			) {
				callback(null, true);
			} else {
				callback(new Error("Blocked by CORS"));
			}
		},
		credentials: true,
	}),
);

// Hỗ trợ upload snapshot dung lượng lớn cho khôi phục CSDL
app.use("/api/backup/restore", express.json({ limit: "50mb" }));

// Giới hạn dung lượng JSON body mặc định 2MB cho toàn bộ ứng dụng (SEC-03-F)
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
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

// Error handling middleware (SEC-03-E: Ẩn thông tin lỗi kỹ thuật nội bộ trên production)
app.use(
	(
		err: any,
		_req: express.Request,
		res: express.Response,
		_next: express.NextFunction,
	) => {
		console.error("[Error]", err);
		if (err.type === "entity.too.large" || err.status === 413) {
			res.status(413).json({
				error: "Dung lượng dữ liệu gửi lên vượt quá giới hạn cho phép.",
			});
			return;
		}
		const status = err.status || 500;
		if (process.env.NODE_ENV === "production" && status === 500) {
			res.status(500).json({
				error: "Đã xảy ra lỗi trên hệ thống. Vui lòng liên hệ quản trị viên.",
			});
			return;
		}
		res.status(status).json({
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

	// Giữ kết nối Cloudflare Tunnel luôn ấm (Keep-Alive)
	server.keepAliveTimeout = 65000;
	server.headersTimeout = 66000;

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
