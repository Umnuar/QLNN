const fs = require('fs');
const path = require('path');
const file = path.join('C:', 'Projects', 'QLNN', 'QLNN-Backend', 'src', 'controllers', 'analytics.controller.ts');
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import ExcelJS')) {
  content = content.replace(
    /import \{ AuthRequest \} from '\.\.\/middlewares\/auth\.middleware';/,
    "import { AuthRequest } from '../middlewares/auth.middleware';\nimport ExcelJS from 'exceljs';"
  );
}

const exportFunc = 

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
      views: [{ showGridLines: false }]
    });

    // 1. Tiêu đề
    worksheet.mergeCells('A1:L1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'BẢNG TỔNG HỢP SỐ LIỆU CÁC THÔN - XÃ ĐĂK HÀ';
    titleCell.font = { name: 'Times New Roman', size: 14, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('A2:L2');
    const subtitle = worksheet.getCell('A2');
    subtitle.value = \Thời gian xuất: \ \\;
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
    const headerRow = worksheet.getRow(5);
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
        v.householdCount,
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
      cell.value = { formula: \SUM(\\:\\)\ };
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
    res.setHeader('Content-Disposition', \ttachment; filename="BangSoSanhCacThon_\.xlsx"\);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    console.error('exportAnalyticsExcel error:', error);
    res.status(500).json({ error: error.message || 'Lỗi xuất Excel' });
  }
};
;

content = content + exportFunc;
fs.writeFileSync(file, content);
console.log('analytics.controller.ts updated with ExcelJS logic.');
