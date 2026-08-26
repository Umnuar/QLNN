import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getVillages = async (_req: Request, res: Response) => {
  try {
    const villages = await prisma.villages.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ data: villages });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi lấy danh sách thôn' });
  }
};

export const createVillage = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Chỉ Admin mới có quyền' });
      return;
    }
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Tên thôn không được bỏ trống' });
      return;
    }
    const newVillage = await prisma.villages.create({ data: { name } });
    res.json({ data: newVillage });
  } catch (error: any) {
    res.status(500).json({ error: 'Lỗi tạo thôn mới' });
  }
};

export const updateVillage = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Chỉ Admin mới có quyền' });
      return;
    }
    const id = String(req.params.id);
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Tên thôn không được bỏ trống' });
      return;
    }
    const updated = await prisma.villages.update({
      where: { id },
      data: { name }
    });
    res.json({ data: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'Lỗi cập nhật thôn' });
  }
};

export const deleteVillage = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Chỉ Admin mới có quyền' });
      return;
    }
    const id = String(req.params.id);
    
    // Check if it has households or users
    const householdsCount = await prisma.households.count({ where: { village_id: id } });
    if (householdsCount > 0) {
      res.status(400).json({ error: 'Không thể xóa vì thôn này đang chứa dữ liệu hộ dân' });
      return;
    }

    const usersCount = await prisma.users.count({ where: { village_id: id } });
    if (usersCount > 0) {
      res.status(400).json({ error: 'Không thể xóa vì đang có tài khoản quản lý thôn này' });
      return;
    }

    await prisma.villages.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Lỗi xóa thôn' });
  }
};
