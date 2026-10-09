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
import { logger, parseDbInfo } from "./utils/logger";

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5001;

// Ultra-low latency Ping — zero middleware overhead.
// Đặt TRƯỚC toàn bộ middleware (helmet, cors, logger)
// để request được phản hồi 204 ngay lập tức và không bao giờ bị nghẽn CORS.
app.all("/api/ping", (req: express.Request, res: express.Response) => {
	const origin = req.headers.origin;
	if (origin) {
		res.setHeader("Access-Control-Allow-Origin", origin);
		res.setHeader("Access-Control-Allow-Credentials", "true");
	}
	res.setHeader(
		"Cache-Control",
		"no-store, no-cache, must-revalidate, proxy-revalidate",
	);
	res.setHeader("Pragma", "no-cache");
	res.setHeader("Expires", "0");

	if (req.method === "OPTIONS") {
		res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
		res.setHeader(
			"Access-Control-Allow-Headers",
			"Content-Type, Authorization, Cache-Control, Pragma, Expires, X-Requested-With",
		);
		res.status(204).end();
		return;
	}

	res.status(204).end();
});

// Bảo mật HTTP Headers
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'none'"],
				frameAncestors: ["'none'"],
			},
		},
		frameguard: { action: "deny" },
		crossOriginResourcePolicy: { policy: "cross-origin" },
	}),
);

// SEC-04-02: Cấu hình CORS Whitelist - hỗ trợ Web, Tauri Desktop (tauri.localhost), Cloudflare Tunnel và Local dev
const envCorsOrigins = process.env.CORS_ORIGIN
	? process.env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean)
	: [];

export const isOriginAllowed = (origin: string | undefined): boolean => {
	if (!origin || origin === "null") return true; // Hỗ trợ Desktop (file://, custom protocols), mobile, cURL
	if (
		origin === "https://qlnn.dulieudakha.vn" ||
		origin.endsWith(".dulieudakha.vn") ||
		origin === "https://dulieudakha.vn" ||
		origin === "http://tauri.localhost" ||
		origin === "https://tauri.localhost" ||
		origin.startsWith("tauri://") ||
		origin.endsWith(".localhost") ||
		origin.startsWith("http://localhost:") ||
		origin.startsWith("http://127.0.0.1:") ||
		origin.startsWith("https://localhost:") ||
		origin.startsWith("https://127.0.0.1:") ||
		envCorsOrigins.includes(origin)
	) {
		return true;
	}
	return false;
};

app.use(
	cors({
		origin: (origin, callback) => {
			if (isOriginAllowed(origin)) {
				callback(null, true);
			} else {
				callback(new Error("Blocked by CORS"));
			}
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: [
			"Content-Type",
			"Authorization",
			"Cache-Control",
			"Pragma",
			"Expires",
			"X-Requested-With",
		],
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
		if (err.message === "Blocked by CORS") {
			logger.error(403, "Yêu cầu bị từ chối bởi chính sách bảo mật CORS");
			res.status(403).json({
				error: "Yêu cầu bị từ chối bởi chính sách bảo mật CORS.",
			});
			return;
		}

		const status = err.status || 500;
		logger.error(status, err.message || "Lỗi máy chủ nội bộ");
		if (err.type === "entity.too.large" || err.status === 413) {
			res.status(413).json({
				error: "Dung lượng dữ liệu gửi lên vượt quá giới hạn cho phép.",
			});
			return;
		}
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

	const server = app.listen(PORT, async () => {
		try {
			const { prisma } = await import("./config/prisma");
			await prisma.$connect();
			const dbInfo = parseDbInfo();
			logger.db(dbInfo.host, dbInfo.port, dbInfo.database);
			logger.start(PORT, true, process.env.NODE_ENV || "development");
		} catch (err: any) {
			logger.error(500, `Database connection failed: ${err.message}`);
			logger.start(PORT, false, process.env.NODE_ENV || "development");
		}
	});

	// Giữ kết nối Cloudflare Tunnel luôn ấm (Keep-Alive)
	server.keepAliveTimeout = 65000;
	server.headersTimeout = 66000;

	const gracefulShutdown = async (signal: string) => {
		server.close(async () => {
			try {
				const { prisma } = await import("./config/prisma");
				await prisma.$disconnect();
				process.exit(0);
			} catch (e: any) {
				logger.error("DB_DISCONNECT", e?.message || "Failed to disconnect Prisma");
				process.exit(1);
			}
		});
		setTimeout(() => {
			logger.error("SHUTDOWN_TIMEOUT", "Forced process exit on timeout");
			process.exit(1);
		}, 10000);
	};

	process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
	process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

export default app;
