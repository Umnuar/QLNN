import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

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
