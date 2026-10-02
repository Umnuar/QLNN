import bcrypt from "bcryptjs";
import type { Response } from "express";
import { prisma } from "../config/prisma";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { isUserOnline } from "../services/userActivity.service";

export const getUsers = async (req: AuthRequest, res: Response) => {
	try {
		if (req.user?.role !== "admin") {
			res.status(403).json({ error: "Chỉ Admin mới có quyền" });
			return;
		}
		const users = await prisma.users.findMany({
			select: {
				id: true,
				username: true,
				role: true,
				village_id: true,
				created_at: true,
			},
			orderBy: { created_at: "desc" },
		});
		const result = users.map((u) => ({ ...u, is_online: isUserOnline(u.id) }));
		res.json(result);
	} catch (error) {
		res.status(500).json({ error: "Lỗi lấy danh sách user" });
	}
};

export const createUser = async (req: AuthRequest, res: Response) => {
	try {
		if (req.user?.role !== "admin") {
			res.status(403).json({ error: "Chỉ Admin mới có quyền" });
			return;
		}
		const { username, password, role, village_id } = req.body;

		if (!password || typeof password !== "string" || password.length < 8) {
			res.status(400).json({ error: "Mật khẩu phải có độ dài tối thiểu 8 ký tự." });
			return;
		}

		const existing = await prisma.users.findUnique({ where: { username } });
		if (existing) {
			res.status(400).json({ error: "Tên đăng nhập đã tồn tại" });
			return;
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = await prisma.users.create({
			data: {
				username,
				password: hashedPassword,
				role: role || "user",
				village_id: village_id || null,
			},
		});

		await prisma.audit_logs.create({
			data: {
				user_id: req.user?.id || null,
				username: req.user?.username || "Admin",
				village_id: village_id || null,
				action: "CREATE_USER",
				entity_type: "users",
				entity_id: newUser.id,
				details: {
					username: newUser.username,
					role: newUser.role,
					village_id: newUser.village_id,
				},
			},
		});

		res.json({ id: newUser.id, username: newUser.username });
	} catch (error) {
		res.status(500).json({ error: "Lỗi tạo user" });
	}
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
	try {
		if (req.user?.role !== "admin") {
			res.status(403).json({ error: "Chỉ Admin mới có quyền" });
			return;
		}
		const id = String(req.params.id);
		if (id === req.user.id) {
			res.status(400).json({ error: "Không thể tự xóa chính mình" });
			return;
		}
		const targetUser = await prisma.users.findUnique({ where: { id } });
		if (!targetUser) {
			res.status(404).json({ error: "Không tìm thấy user" });
			return;
		}

		await prisma.users.delete({ where: { id } });

		await prisma.audit_logs.create({
			data: {
				user_id: req.user?.id || null,
				username: req.user?.username || "Admin",
				village_id: targetUser.village_id,
				action: "DELETE_USER",
				entity_type: "users",
				entity_id: id,
				details: {
					username: targetUser.username,
					role: targetUser.role,
				},
			},
		});

		res.json({ success: true });
	} catch (error) {
		res.status(500).json({ error: "Lỗi xóa user" });
	}
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
	try {
		if (req.user?.role !== "admin") {
			res.status(403).json({ error: "Chỉ Admin mới có quyền" });
			return;
		}
		const id = String(req.params.id);
		const { password } = req.body;
		if (!password || typeof password !== "string" || password.length < 8) {
			res.status(400).json({ error: "Mật khẩu phải có độ dài tối thiểu 8 ký tự." });
			return;
		}
		const hashedPassword = await bcrypt.hash(password, 10);
		await prisma.users.update({
			where: { id },
			data: { password: hashedPassword, token_version: { increment: 1 } },
		});

		await prisma.audit_logs.create({
			data: {
				user_id: req.user?.id || null,
				username: req.user?.username || "Admin",
				village_id: null,
				action: "RESET_PASSWORD",
				entity_type: "users",
				entity_id: id,
				details: {
					message: "Quản trị viên đặt lại mật khẩu cho cán bộ",
				},
			},
		});

		res.json({ success: true });
	} catch (error) {
		res.status(500).json({ error: "Lỗi đổi mật khẩu" });
	}
};

export const updateUser = async (req: AuthRequest, res: Response) => {
	try {
		if (req.user?.role !== "admin") {
			res.status(403).json({ error: "Chỉ Admin mới có quyền" });
			return;
		}
		const id = String(req.params.id);
		const { role, village_id, password } = req.body;
		const data: any = {};
		if (role !== undefined) data.role = role;
		if (village_id !== undefined) data.village_id = village_id || null;
		if (password !== undefined && password !== null && password !== "") {
			if (typeof password !== "string" || password.trim().length < 8) {
				res.status(400).json({ error: "Mật khẩu mới phải có độ dài tối thiểu 8 ký tự." });
				return;
			}
			data.password = await bcrypt.hash(password.trim(), 10);
			data.token_version = { increment: 1 };
		}
		const updated = await prisma.users.update({
			where: { id },
			data,
			select: {
				id: true,
				username: true,
				role: true,
				village_id: true,
				created_at: true,
			},
		});

		await prisma.audit_logs.create({
			data: {
				user_id: req.user?.id || null,
				username: req.user?.username || "Admin",
				village_id: updated.village_id || null,
				action: "UPDATE_USER",
				entity_type: "users",
				entity_id: updated.id,
				details: {
					username: updated.username,
					role: updated.role,
					village_id: updated.village_id,
					password_changed: Boolean(
						password && typeof password === "string" && password.trim() !== "",
					),
				},
			},
		});

		res.json(updated);
	} catch (error) {
		res.status(500).json({ error: "Lỗi cập nhật thông tin cán bộ" });
	}
};
