import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import {
	generateAccessToken,
	generateRefreshToken,
	verifyRefreshToken,
} from "../config/jwt";
import { prisma } from "../config/prisma";

export const login = async (req: Request, res: Response) => {
	try {
		const { username, password } = req.body;
		const user = await prisma.users.findUnique({ where: { username } });

		if (!user) {
			res.status(401).json({ error: "Tài khoản hoặc mật khẩu không đúng" });
			return;
		}

		const isValid = await bcrypt.compare(password, user.password);
		if (!isValid) {
			res.status(401).json({ error: "Tài khoản hoặc mật khẩu không đúng" });
			return;
		}

		const payload = {
			id: user.id,
			username: user.username,
			role: user.role as "admin" | "user",
			village_id: user.village_id,
		};

		const accessToken = generateAccessToken(payload);
		const refreshToken = generateRefreshToken(payload);

		res.json({
			accessToken,
			refreshToken,
			user: payload,
		});
	} catch (error: any) {
		console.error("[QLNN Auth Error]:", error);
		res.status(500).json({ error: "Lỗi đăng nhập" });
	}
};

export const refresh = async (req: Request, res: Response) => {
	try {
		const { refreshToken } = req.body;
		if (!refreshToken) {
			res.status(401).json({ error: "Thiếu Refresh Token" });
			return;
		}

		const decoded = verifyRefreshToken(refreshToken);
		const user = await prisma.users.findUnique({ where: { id: decoded.id } });

		if (!user) {
			res.status(401).json({ error: "User không tồn tại" });
			return;
		}

		const payload = {
			id: user.id,
			username: user.username,
			role: user.role as "admin" | "user",
			village_id: user.village_id,
		};

		const newAccessToken = generateAccessToken(payload);
		const newRefreshToken = generateRefreshToken(payload);

		res.json({
			accessToken: newAccessToken,
			refreshToken: newRefreshToken,
			user: payload,
		});
	} catch (error) {
		res.status(401).json({ error: "Refresh token không hợp lệ" });
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
