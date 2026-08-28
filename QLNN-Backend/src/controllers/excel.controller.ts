import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { parseDakHaExcel, ParsedHouseholdRow } from '../utils/excelParser';
import { buildDakHaExcel } from '../utils/excelBuilder';
import { normalizeFullName, removeAccents } from '../utils/textUtils';

export interface AnalyzedRow {
  row: ParsedHouseholdRow;
  action: 'create' | 'update';
  existingHousehold: any | null;
}

export interface SmartUpsertAnalysis {
  analyzedRows: AnalyzedRow[];
  createCount: number;
  updateCount: number;
  totalCount: number;
}

/**
 * HÀM DÙNG CHUNG DUY NHẤT: Phân tích danh sách dòng Excel để xác định Create vs Update
 * Dùng chung 100% cho cả Preview (/api/excel/preview) và Import thật (/api/excel/import)
 * Đảm bảo:
 * 1. Cùng quy tắc chuẩn hóa tên (normalizeFullName)
 * 2. Cùng cơ chế phát hiện trùng lặp nội bộ trong cùng 1 file Excel (intra-file duplicate)
 * 3. Kết quả preview và import thật luôn khớp nhau tuyệt đối
 */
export function analyzeParsedRowsForUpsert(
  parsedRows: ParsedHouseholdRow[],
  existingHouseholds: any[]
): SmartUpsertAnalysis {
  const householdMapByName = new Map<string, any>();
  for (const h of existingHouseholds) {
    householdMapByName.set(normalizeFullName(h.full_name), h);
  }

  let createCount = 0;
  let updateCount = 0;
  const analyzedRows: AnalyzedRow[] = [];

  for (const row of parsedRows) {
    const normalizedName = normalizeFullName(row.full_name);
    const existing = householdMapByName.get(normalizedName);

    if (existing) {
      updateCount++;
      analyzedRows.push({
        row,
        action: 'update',
        existingHousehold: existing,
      });
    } else {
      createCount++;
      // Đánh dấu hộ này đã xuất hiện trong batch để nếu có dòng trùng bên dưới trong cùng file, nó sẽ trở thành update
      const placeholderNewHh = {
        id: null,
        full_name: row.full_name,
        stt: row.stt,
        notes: row.notes,
      };
      householdMapByName.set(normalizedName, placeholderNewHh);
      analyzedRows.push({
        row,
        action: 'create',
        existingHousehold: null,
      });
    }
  }

  return {
    analyzedRows,
    createCount,
    updateCount,
    totalCount: parsedRows.length,
  };
}

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

    // DÙNG HÀM PHÂN TÍCH CHUNG
    const analysis = analyzeParsedRowsForUpsert(parsedRows, existingHouseholds);

    await prisma.$transaction(
      async (tx) => {
        const createdIdMap = new Map<string, string>();

        for (const item of analysis.analyzedRows) {
          const { row, action, existingHousehold } = item;
          const normalizedName = normalizeFullName(row.full_name);

          if (action === 'update') {
            const targetId = existingHousehold?.id || createdIdMap.get(normalizedName);
            if (targetId) {
              await tx.crop_items.deleteMany({ where: { household_id: targetId } });
              await tx.livestock_items.deleteMany({ where: { household_id: targetId } });
              await tx.aquaculture_items.deleteMany({ where: { household_id: targetId } });

              await tx.households.update({
                where: { id: targetId },
                data: {
                  stt: row.stt || undefined,
                  notes: row.notes || undefined,
                  version: { increment: 1 },
                  crop_items: { create: row.crop_items },
                  livestock_items: { create: row.livestock_items },
                  aquaculture_items: { create: row.aquaculture_items },
                },
              });
            }
          } else {
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
            createdIdMap.set(normalizedName, newHh.id);
          }
        }

        // Ghi audit log
        await tx.audit_logs.create({
          data: {
            user_id: req.user?.id || null,
            username: req.user?.username || 'System',
            village_id: targetVillageId,
            action: 'IMPORT_EXCEL',
            entity_type: 'households',
            details: JSON.stringify({
              village_name: village.name,
              totalRowsParsed: analysis.totalCount,
              createdCount: analysis.createCount,
              updatedCount: analysis.updateCount,
            }),
          },
        });
      },
      { timeout: 60000, maxWait: 15000 }
    );

    res.json({
      status: 'ok',
      message: `Nhập dữ liệu thành công cho ${village.name}`,
      totalRowsParsed: analysis.totalCount,
      createdCount: analysis.createCount,
      updatedCount: analysis.updateCount,
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
      res.status(400).json({
        error:
          'Không tìm thấy dòng dữ liệu hộ nào hợp lệ trong file Excel (Các dòng trống tên đã bị loại trừ)',
      });
      return;
    }

    // Lấy các hộ hiện tại của thôn để đối chiếu Smart Upsert
    const existingHouseholds = await prisma.households.findMany({
      where: { village_id: targetVillageId, is_deleted: false },
    });

    // DÙNG HÀM PHÂN TÍCH CHUNG
    const analysis = analyzeParsedRowsForUpsert(parsedRows, existingHouseholds);

    const previewList = analysis.analyzedRows.map(({ row, action, existingHousehold }) => ({
      stt: row.stt,
      full_name: row.full_name,
      action,
      existingId: existingHousehold?.id || null,
      cropCount: row.crop_items.length,
      livestockCount: row.livestock_items.length,
      aquaCount: row.aquaculture_items.length,
      notes: row.notes,
    }));

    res.json({
      status: 'ok',
      villageName: village.name,
      totalRowsParsed: analysis.totalCount,
      createCount: analysis.createCount,
      updateCount: analysis.updateCount,
      previewList,
    });
  } catch (error: any) {
    console.error('previewExcel error:', error);
    res.status(500).json({ error: error.message || 'Lỗi đọc trước file Excel' });
  }
};

/**
 * GET /api/excel/export
 * Xuất file Excel 21 cột
 */
export const exportExcel = async (req: AuthRequest, res: Response) => {
  try {
    const { villageId, selectedIds } = req.body;
    const targetVillageId = req.user?.role === 'user' ? req.user.village_id : villageId ? String(villageId) : undefined;

    const where: any = { is_deleted: false };
    if (targetVillageId) {
      where.village_id = targetVillageId;
    }
    
    if (selectedIds && Array.isArray(selectedIds) && selectedIds.length > 0) {
      where.id = { in: selectedIds };
    }

    let villageName = 'Toàn xã Đăk Hà';
    if (targetVillageId) {
      const village = await prisma.villages.findUnique({ where: { id: targetVillageId } });
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

    const buffer = await buildDakHaExcel({ households, villageName });

    const filename = encodeURIComponent(`Bieu_mau_thong_ke_${villageName.replace(/\s+/g, '_')}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error: any) {
    console.error('exportExcel error:', error);
    res.status(500).json({ error: error.message || 'Lỗi xuất file Excel' });
  }
};
