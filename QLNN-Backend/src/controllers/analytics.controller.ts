import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import ExcelJS from 'exceljs';

/**
 * Helper tính toán tổng hợp cho 1 danh sách hộ
 */
async function computeAnalyticsForScope(targetVillageId: string | null) {
  const whereHousehold: any = { is_deleted: false };
  if (targetVillageId) {
    whereHousehold.village_id = targetVillageId;
  }

  // 1. Tổng số hộ
  const householdCount = await prisma.households.count({
    where: whereHousehold,
  });

  // 2. Tổng hợp Cây trồng
  const cropsRaw = await prisma.crop_items.findMany({
    where: {
      household: whereHousehold,
    },
    select: {
      crop_type: true,
      crop_subtype: true,
      ownership_type: true,
      area: true,
    },
  });

  let cafe_household = 0;
  let cafe_contracted = 0;
  let rubber_household = 0;
  let rubber_contracted = 0;
  let fruit_tree = 0;
  let macadamia = 0;
  let herb_dinh_lang = 0;
  let herb_gung = 0;
  let herb_nghe = 0;
  let herb_sa = 0;
  let wet_rice = 0;
  let other_annual_crops = 0;

  for (const c of cropsRaw) {
    const area = Number(c.area) || 0;
    if (c.crop_type === 'Cà phê') {
      if (c.ownership_type === 'household') cafe_household += area;
      else if (c.ownership_type === 'contracted') cafe_contracted += area;
    } else if (c.crop_type === 'Cao su') {
      if (c.ownership_type === 'household') rubber_household += area;
      else if (c.ownership_type === 'contracted') rubber_contracted += area;
    } else if (c.crop_type === 'Cây ăn quả') {
      fruit_tree += area;
    } else if (c.crop_type === 'Cây Mắc Ca') {
      macadamia += area;
    } else if (c.crop_type === 'Cây dược liệu') {
      if (c.crop_subtype === 'Đinh lăng') herb_dinh_lang += area;
      else if (c.crop_subtype === 'Gừng') herb_gung += area;
      else if (c.crop_subtype === 'Nghệ') herb_nghe += area;
      else if (c.crop_subtype === 'Sả') herb_sa += area;
    } else if (c.crop_type === 'Lúa nước') {
      wet_rice += area;
    } else if (c.crop_type === 'Cây hàng năm khác') {
      other_annual_crops += area;
    }
  }

  // Làm tròn 3 chữ số thập phân cho diện tích (ha)
  const round3 = (n: number) => Math.round(n * 1000) / 1000;

  const total_herb_area = round3(herb_dinh_lang + herb_gung + herb_nghe + herb_sa);
  const total_crops_area = round3(
    cafe_household +
    cafe_contracted +
    rubber_household +
    rubber_contracted +
    fruit_tree +
    macadamia +
    total_herb_area +
    wet_rice +
    other_annual_crops
  );

  // 3. Tổng hợp Vật nuôi
  const livestockRaw = await prisma.livestock_items.findMany({
    where: {
      household: whereHousehold,
    },
    select: {
      animal_type: true,
      quantity: true,
    },
  });

  let buffalo = 0;
  let cow = 0;
  let pig = 0;
  let poultry = 0;

  for (const l of livestockRaw) {
    const qty = l.quantity || 0;
    if (l.animal_type === 'Trâu') buffalo += qty;
    else if (l.animal_type === 'Bò') cow += qty;
    else if (l.animal_type === 'Heo') pig += qty;
    else if (l.animal_type === 'Gia cầm') poultry += qty;
  }

  // 4. Tổng hợp Thủy sản
  const aquaRaw = await prisma.aquaculture_items.findMany({
    where: {
      household: whereHousehold,
    },
    select: {
      aquaculture_type: true,
      value: true,
      unit: true,
    },
  });

  let fish_pond = 0; // ha
  let fish_cage = 0; // lồng

  for (const a of aquaRaw) {
    const val = Number(a.value) || 0;
    if (a.aquaculture_type === 'Nuôi cá ao') fish_pond += val;
    else if (a.aquaculture_type === 'Nuôi cá lồng bè') fish_cage += val;
  }

  return {
    household_count: householdCount,
    crops: {
      cafe_household: round3(cafe_household),
      cafe_contracted: round3(cafe_contracted),
      total_cafe: round3(cafe_household + cafe_contracted),
      rubber_household: round3(rubber_household),
      rubber_contracted: round3(rubber_contracted),
      total_rubber: round3(rubber_household + rubber_contracted),
      fruit_tree: round3(fruit_tree),
      macadamia: round3(macadamia),
      herb_dinh_lang: round3(herb_dinh_lang),
      herb_gung: round3(herb_gung),
      herb_nghe: round3(herb_nghe),
      herb_sa: round3(herb_sa),
      total_herb_area,
      wet_rice: round3(wet_rice),
      other_annual_crops: round3(other_annual_crops),
      total_crops_area,
    },
    livestock: {
      buffalo,
      cow,
      total_cattle: buffalo + cow, // Tổng đàn gia súc lớn
      pig,
      poultry,
      total_animals: buffalo + cow + pig + poultry,
    },
    aquaculture: {
      fish_pond: round3(fish_pond),
      fish_cage: Math.round(fish_cage),
    },
  };
}

/**
 * GET /api/analytics/overview
 * Tổng hợp tổng thể nông nghiệp theo Thôn hoặc Toàn xã
 */
export const getOverviewAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const targetVillageId = req.user?.role === 'user' ? req.user.village_id : (req.query.villageId ? String(req.query.villageId) : null);

    let villageName = 'Toàn xã Đăk Hà';
    if (targetVillageId) {
      const village = await prisma.villages.findUnique({ where: { id: targetVillageId } });
      if (village) villageName = village.name;
    }

    const data = await computeAnalyticsForScope(targetVillageId);

    res.json({
      status: 'ok',
      scope: {
        village_id: targetVillageId,
        village_name: villageName,
      },
      data,
    });
  } catch (error: any) {
    console.error('getOverviewAnalytics error:', error);
    res.status(500).json({ error: error.message || 'Lỗi thống kê nông nghiệp' });
  }
};

/**
 * GET /api/analytics/by-village
 * So sánh tổng hợp giữa tất cả các thôn trong xã (Dành cho Cán bộ xã / Admin)
 */
export const getAnalyticsByVillage = async (req: AuthRequest, res: Response) => {
  try {
    // Nếu là Trưởng thôn -> Chỉ trả về thôn của mình
    const villages = await prisma.villages.findMany({
      where: req.user?.role === 'user' && req.user.village_id ? { id: req.user.village_id } : undefined,
      orderBy: { name: 'asc' },
    });

    const result = await Promise.all(
      villages.map(async (v) => {
        const stats = await computeAnalyticsForScope(v.id);
        return {
          village_id: v.id,
          village_name: v.name,
          ...stats,
        };
      })
    );

    res.json({
      status: 'ok',
      data: result,
    });
  } catch (error: any) {
    console.error('getAnalyticsByVillage error:', error);
    res.status(500).json({ error: error.message || 'Lỗi thống kê theo thôn' });
  }
};


/**
 * GET /api/analytics/export-comparison
 * Xuất file Excel Bảng so sánh các thôn
 */
export const exportAnalyticsExcel = async (req: AuthRequest, res: Response) => {
  try {
    const villages = await prisma.villages.findMany({
      orderBy: { name: 'asc' },
    });

    const result = await Promise.all(
      villages.map(async (v) => {
        const stats = await computeAnalyticsForScope(v.id);
        return {
          village_name: v.name,
          ...stats,
        };
      })
    );

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'QLNN - Đăk Hà';
    const worksheet = workbook.addWorksheet('So Sanh Thon', {
      views: [{ showGridLines: false, state: 'frozen', xSplit: 1, ySplit: 5 }]
    });

    // 1. Tiêu đề
    worksheet.mergeCells('A1:L1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'BẢNG TỔNG HỢP SỐ LIỆU CÁC THÔN - XÃ ĐĂK HÀ';
    titleCell.font = { name: 'Times New Roman', size: 14, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('A2:L2');
    const subtitle = worksheet.getCell('A2');
    subtitle.value = `Thời gian xuất: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}`;
    subtitle.font = { name: 'Times New Roman', size: 11, italic: true };
    subtitle.alignment = { horizontal: 'center', vertical: 'middle' };
    
    worksheet.getRow(3).height = 15; // Spacer

    // 2. Super Headers
    worksheet.mergeCells('A4:A5');
    worksheet.getCell('A4').value = 'Tên Thôn';
    worksheet.mergeCells('B4:B5');
    worksheet.getCell('B4').value = 'Số Hộ';
    
    worksheet.mergeCells('C4:G4');
    worksheet.getCell('C4').value = 'CÂY TRỒNG (ha)';
    worksheet.getCell('C4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAD3' } }; // Light Green

    worksheet.mergeCells('H4:J4');
    worksheet.getCell('H4').value = 'VẬT NUÔI (con)';
    worksheet.getCell('H4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE5CD' } }; // Light Orange

    worksheet.mergeCells('K4:L4');
    worksheet.getCell('K4').value = 'THỦY SẢN';
    worksheet.getCell('K4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC9DAF8' } }; // Light Blue

    // 3. Sub Headers
    const subHeaders = [
      '', '', 'Cà Phê', 'Cao Su', 'Cây Ăn Quả', 'Dược Liệu', 'Tổng Cây',
      'Trâu Bò', 'Heo', 'Gia Cầm', 'Cá Ao (ha)', 'Cá Lồng (lồng)'
    ];
    subHeaders.forEach((h, i) => {
      if (h) worksheet.getCell(5, i + 1).value = h;
    });

    // Style headers
    for (let row = 4; row <= 5; row++) {
      worksheet.getRow(row).eachCell((cell) => {
        cell.font = { name: 'Times New Roman', size: 11, bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });
    }

    // 4. Data
    let startRow = 6;
    result.forEach((v) => {
      const row = worksheet.addRow([
        v.village_name,
        v.household_count,
        v.crops.total_cafe,
        v.crops.total_rubber,
        v.crops.fruit_tree,
        v.crops.total_herb_area,
        v.crops.total_crops_area,
        v.livestock.total_cattle,
        v.livestock.pig,
        v.livestock.poultry,
        v.aquaculture.fish_pond,
        v.aquaculture.fish_cage
      ]);
      row.eachCell((cell) => {
        cell.font = { name: 'Times New Roman', size: 11 };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });
      // Number formats
      row.getCell(2).numFmt = '#,##0'; // So Ho
      for(let i=3; i<=7; i++) row.getCell(i).numFmt = '#,##0.00'; // Cay trong
      for(let i=8; i<=10; i++) row.getCell(i).numFmt = '#,##0'; // Vat nuoi
      row.getCell(11).numFmt = '#,##0.00'; // Ca Ao
      row.getCell(12).numFmt = '#,##0'; // Ca long
    });

    const endRow = startRow + result.length - 1;

    // 5. Total Row
    const totalRow = worksheet.addRow([]);
    totalRow.getCell(1).value = 'TỔNG CỘNG';
    
    const cols = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    cols.forEach((col, index) => {
      const cell = totalRow.getCell(index + 2);
      cell.value = { formula: `SUM(${col}${startRow}:${col}${endRow})` };
    });

    totalRow.eachCell((cell) => {
      cell.font = { name: 'Times New Roman', size: 11, bold: true, color: { argb: 'FFB22222' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });
    
    totalRow.getCell(2).numFmt = '#,##0';
    for(let i=3; i<=7; i++) totalRow.getCell(i).numFmt = '#,##0.00';
    for(let i=8; i<=10; i++) totalRow.getCell(i).numFmt = '#,##0';
    totalRow.getCell(11).numFmt = '#,##0.00';
    totalRow.getCell(12).numFmt = '#,##0';

    // Widths
    worksheet.columns = [
      { width: 25 }, { width: 10 },
      { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 15 },
      { width: 12 }, { width: 12 }, { width: 12 },
      { width: 12 }, { width: 12 }
    ];

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="BangSoSanhCacThon_${new Date().toISOString().split('T')[0]}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    console.error('exportAnalyticsExcel error:', error);
    res.status(500).json({ error: error.message || 'Lỗi xuất Excel' });
  }
};
