import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { parseDakHaExcel } from '../utils/excelParser';
import { buildDakHaExcel } from '../utils/excelBuilder';
import { normalizeFullName, removeAccents } from '../utils/textUtils';

/**
 * POST /api/excel/import
 * Nhập dữ liệu từ file Excel (Smart Upsert)
 */
export const importExcel = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Vui lòng tải lên file Excel (.xls, .xlsx)' });
      return;
    }

    const targetVillageId = req.user?.role === 'user' ? req.user.village_id : req.body.village_id;
    if (!targetVillageId) {
      res.status(400).json({ error: 'Vui lòng chọn Thôn cần nhập dữ liệu' });
      return;
    }

    const village = await prisma.villages.findUnique({
      where: { id: targetVillageId },
    });

    if (!village) {
      res.status(404).json({ error: 'Thôn không tồn tại trong hệ thống' });
      return;
    }

    // Parse file Excel
    const parseResult = parseDakHaExcel(req.file.buffer);
    const parsedRows = parseResult.rows;

    if (parsedRows.length === 0) {
      res.status(400).json({ error: 'Không tìm thấy dòng dữ liệu hộ nào hợp lệ trong file Excel' });
      return;
    }

    // Lấy tất cả các hộ hiện tại của thôn trong DB để đối chiếu Smart Upsert
    const existingHouseholds = await prisma.households.findMany({
      where: { village_id: targetVillageId, is_deleted: false },
    });

    const householdMapByName = new Map<string, any>();
    for (const h of existingHouseholds) {
      householdMapByName.set(normalizeFullName(h.full_name), h);
    }

    let createdCount = 0;
    let updatedCount = 0;

    await prisma.$transaction(async (tx) => {
      for (const row of parsedRows) {
        const normalizedName = normalizeFullName(row.full_name);
        const existing = householdMapByName.get(normalizedName);

        if (existing) {
          // 1. SMART UPSERT: Đã tồn tại hộ trong thôn -> Cập nhật lại số liệu
          await tx.crop_items.deleteMany({ where: { household_id: existing.id } });
          await tx.livestock_items.deleteMany({ where: { household_id: existing.id } });
          await tx.aquaculture_items.deleteMany({ where: { household_id: existing.id } });

          await tx.households.update({
            where: { id: existing.id },
            data: {
              stt: row.stt || existing.stt,
              notes: row.notes || existing.notes,
              version: { increment: 1 },
              crop_items: { create: row.crop_items },
              livestock_items: { create: row.livestock_items },
              aquaculture_items: { create: row.aquaculture_items },
            },
          });

          updatedCount++;
        } else {
          // 2. CREATE MỚI: Hộ chưa có trong thôn -> Tạo mới
          const newHh = await tx.households.create({
            data: {
              village_id: targetVillageId,
              stt: row.stt,
              full_name: row.full_name,
              name_unaccented: removeAccents(row.full_name),
              notes: row.notes || '',
              crop_items: { create: row.crop_items },
              livestock_items: { create: row.livestock_items },
              aquaculture_items: { create: row.aquaculture_items },
            },
          });

          // Cập nhật vào map để nếu trong cùng file có dòng trùng thì không tạo lại
          householdMapByName.set(normalizedName, newHh);
          createdCount++;
        }
      }

      // Ghi audit log
      await tx.audit_logs.create({
        data: {
          user_id: req.user?.id || null,
          village_id: targetVillageId,
          action: 'IMPORT_EXCEL',
          details: JSON.stringify({
            village_name: village.name,
            totalRowsParsed: parsedRows.length,
            createdCount,
            updatedCount,
          }),
        },
      });
    }, { timeout: 60000, maxWait: 15000 });

    res.json({
      status: 'ok',
      message: `Nhập dữ liệu thành công cho ${village.name}`,
      totalRowsParsed: parsedRows.length,
      createdCount,
      updatedCount,
    });
  } catch (error: any) {
    console.error('importExcel error:', error);
    res.status(500).json({ error: error.message || 'Lỗi nhập dữ liệu Excel' });
  }
};

/**
 * POST /api/excel/preview
 * Xem trước kết quả parse và đối chiếu Smart Upsert (không lưu DB)
 */
export const previewExcel = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Vui lòng tải lên file Excel (.xls, .xlsx)' });
      return;
    }

    const targetVillageId = req.user?.role === 'user' ? req.user.village_id : req.body.village_id;
    if (!targetVillageId) {
      res.status(400).json({ error: 'Vui lòng chọn Thôn cần nhập dữ liệu' });
      return;
    }

    const village = await prisma.villages.findUnique({
      where: { id: targetVillageId },
    });

    if (!village) {
      res.status(404).json({ error: 'Thôn không tồn tại trong hệ thống' });
      return;
    }

    // Parse file Excel
    const parseResult = parseDakHaExcel(req.file.buffer);
    const parsedRows = parseResult.rows;

    if (parsedRows.length === 0) {
      res.status(400).json({ error: 'Không tìm thấy dòng dữ liệu hộ nào hợp lệ trong file Excel (Các dòng trống đã bị loại trừ)' });
      return;
    }

    // Lấy các hộ hiện tại của thôn để đối chiếu Smart Upsert
    const existingHouseholds = await prisma.households.findMany({
      where: { village_id: targetVillageId, is_deleted: false },
    });

    const householdMapByName = new Map<string, any>();
    for (const h of existingHouseholds) {
      householdMapByName.set(normalizeFullName(h.full_name), h);
    }

    const previewList = parsedRows.map((row) => {
      const normalizedName = normalizeFullName(row.full_name);
      const existing = householdMapByName.get(normalizedName);
      return {
        stt: row.stt,
        full_name: row.full_name,
        action: (existing ? 'update' : 'create') as 'create' | 'update',
        existingId: existing?.id || null,
        cropCount: row.crop_items.length,
        livestockCount: row.livestock_items.length,
        aquaCount: row.aquaculture_items.length,
        notes: row.notes,
      };
    });

    const createCount = previewList.filter((item) => item.action === 'create').length;
    const updateCount = previewList.filter((item) => item.action === 'update').length;

    res.json({
      status: 'ok',
      villageName: village.name,
      totalRowsParsed: parsedRows.length,
      createCount,
      updateCount,
      previewList,
    });
  } catch (error: any) {
    console.error('previewExcel error:', error);
    res.status(500).json({ error: error.message || 'Lỗi đọc trước file Excel' });
  }
};

/**
 * GET /api/excel/export
 * Xuất dữ liệu ra file Excel 21 cột
 */
export const exportExcel = async (req: AuthRequest, res: Response) => {
  try {
    const targetVillageId = req.user?.role === 'user' ? req.user.village_id : req.query.villageId;

    let villageName = 'Toàn xã Đăk Hà';
    const where: any = { is_deleted: false };

    if (targetVillageId) {
      where.village_id = String(targetVillageId);
      const village = await prisma.villages.findUnique({
        where: { id: String(targetVillageId) },
      });
      if (village) villageName = village.name;
    }

    const households = await prisma.households.findMany({
      where,
      include: {
        village: true,
        crop_items: true,
        livestock_items: true,
        aquaculture_items: true,
      },
      orderBy: [{ village_id: 'asc' }, { stt: 'asc' }, { created_at: 'asc' }],
    });

    const buffer = await buildDakHaExcel({
      villageName,
      reportingPeriod: 'thời điểm tháng 8 năm 2026',
      households,
    });

    const safeFilename = encodeURIComponent(`Bieu_mau_thong_ke_nong_nghiep_${removeAccents(villageName).replace(/\s+/g, '_')}.xlsx`);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=UTF-8''${safeFilename}`);
    res.send(buffer);
  } catch (error: any) {
    console.error('exportExcel error:', error);
    res.status(500).json({ error: error.message || 'Lỗi xuất file Excel' });
  }
};
