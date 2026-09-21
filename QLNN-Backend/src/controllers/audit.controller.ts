import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const village_id = req.params.village_id ? String(req.params.village_id) : undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const action = req.query.action ? String(req.query.action).toUpperCase() : undefined;
    const username = (req.query.username || req.query.userId || req.query.user_id) ? String(req.query.username || req.query.userId || req.query.user_id) : undefined;
    const search = req.query.search ? String(req.query.search).trim() : undefined;

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

    if (action && action !== 'ALL') {
      where.action = action;
    }

    if (username) {
      where.OR = [
        { username: { contains: username, mode: 'insensitive' } },
        { user_id: username }
      ];
    }

    if (search) {
      const searchConditions = [
        { username: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { entity_type: { contains: search, mode: 'insensitive' } },
      ];
      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: searchConditions }
        ];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
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
        offset,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi lấy nhật ký' });
  }
};
