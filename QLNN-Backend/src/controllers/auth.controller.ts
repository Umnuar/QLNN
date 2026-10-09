import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import {
	generateAccessToken,
	generateRefreshToken,
	verifyRefreshToken,
} from "../config/jwt";
import { prisma } from "../config/prisma";
import { getClientIp, logger } from "../utils/logger";

export const login = async (req: Request, res: Response) => {
	try {
		const { username, password } = req.body;
		const clientIp = getClientIp(req);
		const user = await prisma.users.findUnique({ where: { username } });

		if (!user) {
			logger.auth(username || "unknown", "unknown", "LOGIN_FAILED", clientIp);
			res.status(401).json({ error: "Tài khoản hoặc mật khẩu không đúng" });
			return;
		}

		const isValid = await bcrypt.compare(password, user.password);
		if (!isValid) {
			logger.auth(user.username, user.role, "LOGIN_FAILED", clientIp);
			res.status(401).json({ error: "Tài khoản hoặc mật khẩu không đúng" });
			return;
		}

		const payload = {
			id: user.id,
			username: user.username,
			role: user.role as "admin" | "user",
			village_id: user.village_id,
			token_version: user.token_version,
		};

		const accessToken = generateAccessToken(payload);
		const refreshToken = generateRefreshToken(payload);

		logger.auth(user.username, user.role, "LOGIN_SUCCESS", clientIp);

		res.json({
			accessToken,
			refreshToken,
			user: payload,
		});
	} catch (error: any) {
		logger.error("AUTH_LOGIN_ERROR", error?.message || "Lỗi đăng nhập");
		res.status(500).json({ error: "Lỗi đăng nhập" });
	}
};

export const refresh = async (req: Request, res: Response) => {
	const clientIp = getClientIp(req);
	try {
		const { refreshToken } = req.body;
		if (!refreshToken) {
			logger.auth("unknown", "unknown", "REFRESH_FAILED", clientIp);
			res.status(401).json({ error: "Thiếu Refresh Token" });
			return;
		}

		const decoded = verifyRefreshToken(refreshToken);
		const user = await prisma.users.findUnique({ where: { id: decoded.id } });

		if (!user) {
			logger.auth("unknown", "unknown", "REFRESH_FAILED", clientIp);
			res.status(401).json({ error: "User không tồn tại" });
			return;
		}

		// Kiểm tra token_version để ngăn chặn Refresh Token Replay sau khi logout hoặc đổi mật khẩu
		if (
			decoded.token_version !== undefined &&
			user.token_version !== decoded.token_version
		) {
			logger.auth(user.username, user.role, "REFRESH_REVOKED", clientIp);
			res.status(401).json({
				error: "Phiên làm việc đã bị thu hồi hoặc hết hạn. Vui lòng đăng nhập lại.",
			});
			return;
		}

		const payload = {
			id: user.id,
			username: user.username,
			role: user.role as "admin" | "user",
			village_id: user.village_id,
			token_version: user.token_version,
		};

		const newAccessToken = generateAccessToken(payload);
		const newRefreshToken = generateRefreshToken(payload);

		logger.auth(user.username, user.role, "TOKEN_REFRESH", clientIp);

		res.json({
			accessToken: newAccessToken,
			refreshToken: newRefreshToken,
			user: payload,
		});
	} catch (error) {
		logger.auth("unknown", "unknown", "REFRESH_FAILED", clientIp);
		res.status(401).json({ error: "Refresh token không hợp lệ" });
	}
};

export const logout = async (req: any, res: Response) => {
	const clientIp = getClientIp(req);
	try {
		if (!req.user?.id) {
			logger.auth("unknown", "unknown", "LOGOUT_UNAUTHORIZED", clientIp);
			res.status(401).json({ error: "Chưa xác thực" });
			return;
		}

		await prisma.users.update({
			where: { id: req.user.id },
			data: { token_version: { increment: 1 } },
		});

		logger.auth(
			req.user.username || "unknown",
			req.user.role || "unknown",
			"LOGOUT",
			clientIp,
		);

		res.json({
			success: true,
			message: "Đăng xuất thành công, phiên làm việc đã được thu hồi.",
		});
	} catch (error: any) {
		logger.error("AUTH_LOGOUT_ERROR", error?.message || "Lỗi khi đăng xuất");
		res.status(500).json({ error: "Lỗi khi đăng xuất" });
	}
};

export const getMe = async (req: any, res: Response) => {
	try {
		if (!req.user) {
			res.status(401).json({ error: "Chưa xác thực" });
			return;
		}
		const user = await prisma.users.findUnique({ where: { id: req.user.id } });
		if (!user) {
			res.status(404).json({ error: "User không tồn tại" });
			return;
		}
		res.json({
			id: user.id,
			username: user.username,
			role: user.role,
			village_id: user.village_id,
		});
	} catch (error) {
		res.status(500).json({ error: "Lỗi hệ thống" });
	}
};
