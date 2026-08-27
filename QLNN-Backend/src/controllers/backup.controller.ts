import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export const exportDatabase = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      villages,
      users,
      households,
      crop_items,
      livestock_items,
      aquaculture_items,
      audit_logs
    ] = await Promise.all([
      prisma.villages.findMany(),
      prisma.users.findMany(),
      prisma.households.findMany(),
      prisma.crop_items.findMany(),
      prisma.livestock_items.findMany(),
      prisma.aquaculture_items.findMany(),
      prisma.audit_logs.findMany(),
    ]);

    const backupData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        environment: process.env.NODE_ENV || 'development'
      },
      data: {
        villages,
        users,
        households,
        crop_items,
        livestock_items,
        aquaculture_items,
        audit_logs
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Dakha_Backup_${new Date().toISOString().split('T')[0]}.json"`
    );
    res.json(backupData);
  } catch (error: any) {
    console.error('Lỗi khi export database:', error);
    res.status(500).json({ error: 'Không thể xuất dữ liệu backup.' });
  }
};

export const runAutoBackup = async (): Promise<void> => {
  try {
    console.log('[AutoBackup] Đang tiến hành sao lưu dữ liệu...');
    
    const [
      villages,
      users,
      households,
      crop_items,
      livestock_items,
      aquaculture_items,
      audit_logs
    ] = await Promise.all([
      prisma.villages.findMany(),
      prisma.users.findMany(),
      prisma.households.findMany(),
      prisma.crop_items.findMany(),
      prisma.livestock_items.findMany(),
      prisma.aquaculture_items.findMany(),
      prisma.audit_logs.findMany(),
    ]);

    const backupData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        type: 'auto'
      },
      data: {
        villages,
        users,
        households,
        crop_items,
        livestock_items,
        aquaculture_items,
        audit_logs
      }
    };

    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `auto_backup_${timestamp}.json`;
    const filepath = path.join(backupDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
    console.log(`[AutoBackup] Đã tạo bản sao lưu thành công tại: ${filename}`);

    // Cleanup cũ (giữ 7 ngày)
    const files = fs.readdirSync(backupDir);
    const now = Date.now();
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

    for (const file of files) {
      if (file.startsWith('auto_backup_')) {
        const fullPath = path.join(backupDir, file);
        const stats = fs.statSync(fullPath);
        if (now - stats.mtimeMs > SEVEN_DAYS) {
          fs.unlinkSync(fullPath);
          console.log(`[AutoBackup] Đã xoá bản sao lưu cũ: ${file}`);
        }
      }
    }
  } catch (error) {
    console.error('[AutoBackup] Lỗi nghiêm trọng khi sao lưu tự động:', error);
  }
};
