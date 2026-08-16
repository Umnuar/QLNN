import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { prisma } from '../src/config/prisma';
import { parseDakHaExcel } from '../src/utils/excelParser';
import { normalizeFullName, removeAccents } from '../src/utils/textUtils';

const originalTemplatePath = 'C:\\Users\\umnuar\\Downloads\\Biểu mẫu thống kê câ trồng, vật nuôi, thủy sản.xls';
const testFixtureDir = path.join(__dirname, '../test-fixtures');
const testExcelPath = path.join(testFixtureDir, 'test_dulieu_thon1_dien_that.xlsx');
const targetVillageId = '0ad6217e-0999-47a0-acc2-e9378372b4b8'; // Thôn 1

/**
 * Tạo file Excel test thực tế dựa trên template gốc:
 * Điền 8 hộ dân thật (STT 1-8) kèm cây trồng, vật nuôi, thủy sản.
 * Các dòng từ STT 9 đến 112 giữ nguyên trống như thực tế trưởng thôn chưa điền hết.
 */
function createRealisticTestExcel() {
  if (!fs.existsSync(testFixtureDir)) {
    fs.mkdirSync(testFixtureDir, { recursive: true });
  }

  const wb = XLSX.readFile(originalTemplatePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rawData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

  // Danh sách 8 hộ nông dân thực tế xã Đăk Hà
  const sampleHouseholds = [
    { stt: 1, name: 'Nguyễn Văn An', cafeH: 1.5, rubH: 2.0, bo: 4, giaCam: 50, caAo: 0.2, note: 'Hộ làm kinh tế giỏi' },
    { stt: 2, name: 'Trần Thị Bích', cafeC: 1.2, fruit: 0.5, heo: 10, dinhLang: 0.1, note: '' },
    { stt: 3, name: 'A Thao', cafeH: 2.2, lua: 0.8, trau: 2, bo: 3, note: 'Đăng ký vay vốn NTM' },
    { stt: 4, name: 'Y Hằng', macca: 1.0, gung: 0.3, nghe: 0.2, giaCam: 80, note: '' },
    { stt: 5, name: 'Lê Văn Cường', rubC: 3.5, heo: 25, caLong: 4, note: 'Trang trại thủy sản lòng hồ' },
    { stt: 6, name: 'Phạm Thị Dung', cafeH: 0.8, otherAnnual: 0.4, bo: 5, note: '' },
    { stt: 7, name: 'A Blong', lua: 1.5, sa: 0.2, trau: 3, note: '' },
    { stt: 8, name: 'Hoàng Văn Hùng', fruit: 1.8, caAo: 0.5, giaCam: 120, note: 'Vườn sầu riêng mẫu' },
  ];

  // Điền dữ liệu vào 8 dòng đầu (dòng Excel 10-17, index 9-16)
  for (let idx = 0; idx < sampleHouseholds.length; idx++) {
    const h = sampleHouseholds[idx];
    const rIdx = 9 + idx;
    if (!rawData[rIdx]) rawData[rIdx] = [];

    rawData[rIdx][0] = h.stt;               // Col A: STT
    rawData[rIdx][1] = h.name;              // Col B: Họ và tên
    rawData[rIdx][2] = h.cafeH || null;     // Col C: Cà phê Hộ
    rawData[rIdx][3] = h.cafeC || null;     // Col D: Cà phê Khoán
    rawData[rIdx][4] = h.rubH || null;      // Col E: Cao su Hộ
    rawData[rIdx][5] = h.rubC || null;      // Col F: Cao su Khoán
    rawData[rIdx][6] = h.fruit || null;     // Col G: Cây ăn quả
    rawData[rIdx][7] = h.macca || null;     // Col H: Mắc Ca
    rawData[rIdx][8] = h.dinhLang || null;  // Col I: Đinh lăng
    rawData[rIdx][9] = h.gung || null;      // Col J: Gừng
    rawData[rIdx][10] = h.nghe || null;     // Col K: Nghệ
    rawData[rIdx][11] = h.sa || null;       // Col L: Sả
    rawData[rIdx][12] = h.lua || null;      // Col M: Lúa nước
    rawData[rIdx][13] = h.otherAnnual || null; // Col N: Hàng năm khác
    rawData[rIdx][14] = h.trau || null;     // Col O: Trâu
    rawData[rIdx][15] = h.bo || null;       // Col P: Bò
    rawData[rIdx][16] = h.heo || null;      // Col Q: Heo
    rawData[rIdx][17] = h.giaCam || null;   // Col R: Gia cầm
    rawData[rIdx][18] = h.caAo || null;     // Col S: Nuôi cá ao
    rawData[rIdx][19] = h.caLong || null;   // Col T: Nuôi cá lồng
    rawData[rIdx][20] = h.note || null;     // Col U: Ghi chú
  }

  // Tạo lại Worksheet mới từ 2D array đã cập nhật
  const newWs = XLSX.utils.aoa_to_sheet(rawData);
  newWs['!merges'] = ws['!merges']; // Giữ nguyên merges của template

  const newWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWb, newWs, 'Sheet1');
  XLSX.writeFile(newWb, testExcelPath);

  console.log(`[Khởi tạo] Đã tạo file Excel test thực tế tại: ${testExcelPath}`);
  console.log(`[Khởi tạo] Đã điền 8 hộ tên thật, 104 dòng còn lại (STT 9-112) để trống tên.`);
}

async function runImportTest(runNumber: number) {
  console.log(`\n======================================================`);
  console.log(`▶ BẮT ĐẦU IMPORT LẦN ${runNumber}`);
  console.log(`======================================================`);

  const fileBuffer = fs.readFileSync(testExcelPath);
  const parseResult = parseDakHaExcel(fileBuffer);
  const parsedRows = parseResult.rows;

  console.log(`[excelParser] Tổng số dòng hộ hợp lệ đọc được: ${parsedRows.length}`);
  console.log(`[excelParser] Danh sách các hộ đọc được từ file:`);
  parsedRows.forEach((r, i) => {
    console.log(`  ${i + 1}. STT: ${r.stt} | Họ tên: "${r.full_name}" | Cây trồng: ${r.crop_items.length} loại | Vật nuôi: ${r.livestock_items.length} loại | Thủy sản: ${r.aquaculture_items.length} loại`);
  });

  // Lấy các hộ hiện có trong DB
  const existingHouseholds = await prisma.households.findMany({
    where: { village_id: targetVillageId, is_deleted: false },
  });
  console.log(`[Database] Số hộ hiện có trong DB trước khi import: ${existingHouseholds.length}`);

  const householdMapByName = new Map<string, any>();
  for (const h of existingHouseholds) {
    householdMapByName.set(normalizeFullName(h.full_name), h);
  }

  let createdCount = 0;
  let updatedCount = 0;

  await prisma.$transaction(
    async (tx) => {
      for (const row of parsedRows) {
        const normalizedName = normalizeFullName(row.full_name);
        const existing = householdMapByName.get(normalizedName);

        if (existing) {
          // SMART UPSERT
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
          // CREATE MỚI
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
          householdMapByName.set(normalizedName, newHh);
          createdCount++;
        }
      }
    },
    { timeout: 60000, maxWait: 15000 }
  );

  const totalInDbAfter = await prisma.households.count({
    where: { village_id: targetVillageId, is_deleted: false },
  });

  console.log(`[Kết quả Lần ${runNumber}] Tạo mới (createdCount): ${createdCount}`);
  console.log(`[Kết quả Lần ${runNumber}] Cập nhật Smart Upsert (updatedCount): ${updatedCount}`);
  console.log(`[Database] Tổng số hộ trong CSDL sau Lần ${runNumber}: ${totalInDbAfter}`);

  return { totalParsed: parsedRows.length, createdCount, updatedCount, totalInDbAfter };
}

async function main() {
  console.log('🚀 KIỂM THỬ XỬ LÝ DÒNG TRỐNG & SMART UPSERT (CHỐNG HỘ MA)...');

  // Bước 1: Tạo file test dựa trên biểu mẫu thật, điền 8 hộ thật
  createRealisticTestExcel();

  // Bước 2: Xóa sạch dữ liệu cũ của Thôn 1
  console.log('\n[Dọn dẹp] Xóa dữ liệu test cũ của Thôn 1...');
  await prisma.crop_items.deleteMany({ where: { household: { village_id: targetVillageId } } });
  await prisma.livestock_items.deleteMany({ where: { household: { village_id: targetVillageId } } });
  await prisma.aquaculture_items.deleteMany({ where: { household: { village_id: targetVillageId } } });
  await prisma.households.deleteMany({ where: { village_id: targetVillageId } });
  console.log('  ✅ Đã làm sạch dữ liệu Thôn 1.');

  // LẦN 1: Import lần đầu
  const result1 = await runImportTest(1);

  if (result1.totalParsed !== 8 || result1.createdCount !== 8 || result1.totalInDbAfter !== 8) {
    throw new Error(`❌ THẤT BẠI LẦN 1: Kỳ vọng đọc đúng 8 hộ thật và tạo 8 bản ghi trong DB (bỏ qua 104 dòng trống). Thực tế: parsed=${result1.totalParsed}, created=${result1.createdCount}, totalInDb=${result1.totalInDbAfter}`);
  }
  console.log('  🎉 XÁC NHẬN LẦN 1: Đã nạp chính xác ĐÚNG 8 HỘ THẬT vào CSDL! Không có hộ ma nào được tạo!');

  // LẦN 2: Import lại lần 2 để kiểm tra Smart Upsert
  const result2 = await runImportTest(2);

  if (result2.createdCount !== 0 || result2.updatedCount !== 8 || result2.totalInDbAfter !== 8) {
    throw new Error(`❌ THẤT BẠI LẦN 2: Smart Upsert thất bại! Kỳ vọng: created=0, updated=8, totalInDb=8. Thực tế: created=${result2.createdCount}, updated=${result2.updatedCount}, totalInDb=${result2.totalInDbAfter}`);
  }
  console.log('  🎉 XÁC NHẬN LẦN 2: Smart Upsert hoạt động hoàn hảo! 8 hộ cập nhật, 0 hộ tạo mới, tổng số bản ghi trong CSDL vẫn là 8!');

  console.log('\n======================================================');
  console.log('✅ TEST CHỐNG HỘ MA & SMART UPSERT ĐÃ PASS 100%!');
  console.log('======================================================\n');
}

main()
  .catch((err) => {
    console.error('Lỗi kiểm thử:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
