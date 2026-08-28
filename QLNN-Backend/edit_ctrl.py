import re

with open("src/controllers/excel.controller.ts", "r", encoding="utf-8") as f:
    content = f.read()

old_code = """export const exportExcel = async (req: AuthRequest, res: Response) => {
  try {
    const { villageId, excludeEmpty } = req.query;
    const targetVillageId = req.user?.role === 'user' ? req.user.village_id : villageId ? String(villageId) : undefined;
    const isExcludeEmpty = excludeEmpty === 'true';

    const where: any = { is_deleted: false };
    if (targetVillageId) {
      where.village_id = targetVillageId;
    }
    
    if (isExcludeEmpty) {
      where.OR = [
        { crop_items: { some: {} } },
        { livestock_items: { some: {} } },
        { aquaculture_items: { some: {} } }
      ];
    }"""

new_code = """export const exportExcel = async (req: AuthRequest, res: Response) => {
  try {
    const { villageId, selectedIds } = req.body;
    const targetVillageId = req.user?.role === 'user' ? req.user.village_id : villageId ? String(villageId) : undefined;

    const where: any = { is_deleted: false };
    if (targetVillageId) {
      where.village_id = targetVillageId;
    }
    
    if (selectedIds && Array.isArray(selectedIds) && selectedIds.length > 0) {
      where.id = { in: selectedIds };
    }"""

content = content.replace(old_code, new_code)

with open("src/controllers/excel.controller.ts", "w", encoding="utf-8") as f:
    f.write(content)
