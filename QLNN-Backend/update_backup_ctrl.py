import os

file_path = "src/controllers/backup.controller.ts"
with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# Add import if missing
if "AuthRequest" not in text:
    text = text.replace("from 'express';", "from 'express';\nimport { AuthRequest } from '../middlewares/auth.middleware';")

restore_func = """

export const restoreDatabase = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Không có quyền thực hiện chức năng này.' });
      return;
    }

    const { data } = req.body;
    if (!data || !data.villages || !data.users || !data.households) {
      res.status(400).json({ error: 'Dữ liệu backup không hợp lệ hoặc thiếu thông tin.' });
      return;
    }

    // Disable foreign key constraints if needed, but Prisma $transaction deletes in order is better.
    // Order of deletion (child to parent)
    // audit_logs, crop_items, livestock_items, aquaculture_items, households, users, villages

    await prisma.$transaction([
      prisma.audit_logs.deleteMany(),
      prisma.crop_items.deleteMany(),
      prisma.livestock_items.deleteMany(),
      prisma.aquaculture_items.deleteMany(),
      prisma.households.deleteMany(),
      prisma.users.deleteMany(),
      prisma.villages.deleteMany(),

      prisma.villages.createMany({ data: data.villages }),
      prisma.users.createMany({ data: data.users }),
      prisma.households.createMany({ data: data.households }),
      prisma.crop_items.createMany({ data: data.crop_items }),
      prisma.livestock_items.createMany({ data: data.livestock_items }),
      prisma.aquaculture_items.createMany({ data: data.aquaculture_items }),
      prisma.audit_logs.createMany({ data: data.audit_logs }),
    ]);

    res.status(200).json({ message: 'Phục hồi dữ liệu thành công.' });
  } catch (error: any) {
    console.error('Lỗi khi restore database:', error);
    res.status(500).json({ error: 'Không thể phục hồi dữ liệu.', details: error.message });
  }
};
"""

if "restoreDatabase" not in text:
    text += restore_func

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)
print("Done")
