import sys
import re

with open('src/controllers/village.controller.ts', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """export const deleteVillage = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Chỉ Admin mới có quyền' });
      return;
    }
    const id = String(req.params.id);
    const force = req.query.force === 'true';
    
    // Check if it has households or users
    const householdsCount = await prisma.households.count({ where: { village_id: id } });
    if (householdsCount > 0 && !force) {
      res.status(400).json({ 
        error: `Thôn này đang chứa ${householdsCount} hộ dân. Bạn có chắc chắn muốn xóa toàn bộ dữ liệu (cây trồng, vật nuôi...) của thôn này không?`,
        requireForce: true
      });
      return;
    }

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
};"""

content = re.sub(r'export const deleteVillage = async \(req: AuthRequest, res: Response\) => \{.*?^};' , replacement, content, flags=re.DOTALL | re.MULTILINE)

with open('src/controllers/village.controller.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated village.controller.ts")
