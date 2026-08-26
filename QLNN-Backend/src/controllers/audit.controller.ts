import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const village_id = req.params.village_id ? String(req.params.village_id) : undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const where: any = {};
    if (village_id && village_id !== 'all') {
      if (req.user?.role !== 'admin' && req.user?.village_id !== village_id) {
        res.status(403).json({ error: 'Không có quyền truy cập nhật ký thôn này' });
        return;
      }
      where.village_id = village_id;
    } else if (req.user?.role !== 'admin') {
      where.village_id = req.user?.village_id;
    }

    const logs = await prisma.audit_logs.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await prisma.audit_logs.count({ where });

    res.json({
      data: logs,
      pagination: {
        total,
        limit,
        offset
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi lấy nhật ký' });
  }
};
