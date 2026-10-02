import { Router } from "express";
import rateLimit from "express-rate-limit";
import { getMe, login, logout, refresh } from "../controllers/auth.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: process.env.NODE_ENV === "test" ? 1000 : 20, // 20 requests per 15 minutes per IP (relaxed in test)
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		error: "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút.",
	},
});

router.post("/login", authLimiter, login);
router.post("/refresh", authLimiter, refresh);
router.post("/logout", authenticateToken, logout);
router.get("/me", authenticateToken, getMe);

export default router;
