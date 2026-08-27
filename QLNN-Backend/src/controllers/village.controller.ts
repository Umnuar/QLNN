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

    await prisma.$transaction([
      prisma.users.updateMany({
        where: { village_id: id },
        data: { village_id: null }
      }),
      prisma.households.deleteMany({
        where: { village_id: id }
      }),
      prisma.villages.delete({
        where: { id }
      })
    ]);

    res.json({ status: 'ok', message: 'Xóa thôn thành công' });
  } catch (error: any) {
    console.error('deleteVillage error:', error);
    res.status(500).json({ error: error.message || 'Lỗi xóa thôn' });
  }
};
