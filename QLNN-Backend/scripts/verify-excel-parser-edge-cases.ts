import * as XLSX from 'xlsx';
import { parseDakHaExcel } from '../src/utils/excelParser';

async function runExcelParserChallenges() {
  console.log('====================================================');
  console.log('CHALLENGER 2: EXCEL PARSER EDGE CASES EMPIRICAL TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${detail || 'Assertion failed'}`);
      failed++;
    }
  }

  // Create an in-memory workbook with various edge cases
  const headerRows = [
    ['UBND XÃ ĐĂK HÀ', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['THÔN 1', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['BIỂU MẪU THỐNG KÊ NÔNG NGHIỆP', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['thời điểm 31/12/2025', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['STT', 'Họ và tên', 'Cà phê Hộ', 'Cà phê Khoán', 'Cao su Hộ', 'Cao su Khoán', 'Cây ăn quả', 'Mắc ca', 'Đinh lăng', 'Gừng', 'Nghệ', 'Sả', 'Lúa', 'Hàng năm khác', 'Trâu', 'Bò', 'Heo', 'Gia cầm', 'Cá ao', 'Cá lồng', 'Ghi chú'],
    ['', '', '(ha)', '(ha)', '(ha)', '(ha)', '(ha)', '(ha)', '(ha)', '(ha)', '(ha)', '(ha)', '(ha)', '(ha)', '(con)', '(con)', '(con)', '(con)', '(ha)', '(lồng)', ''],
    ['(1)', '(2)', '(3)', '(4)', '(5)', '(6)', '(7)', '(8)', '(9)', '(10)', '(11)', '(12)', '(13)', '(14)', '(15)', '(16)', '(17)', '(18)', '(19)', '(20)', '(21)'],
    ['A', 'B', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19']
  ];

  const dataRows = [
    // Row 10 (Index 9): Normal household with Vietnamese decimal comma
    ['1', 'A Thui', '1,5', '0,75', '0', '0', '0.5', '0', '0', '0', '0', '0', '1,2', '0', '2', '5', '10', '50', '0,3', '2', 'Hộ chính'],
    
    // Row 11 (Index 10): Ghost row - STT exists but name is blank -> MUST BE SKIPPED
    ['2', '', '2.0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', 'Ghost row'],
    
    // Row 12 (Index 11): Ghost row - STT exists, name is whitespace only -> MUST BE SKIPPED
    ['3', '   ', '1.0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', 'Whitespace ghost'],
    
    // Row 13 (Index 12): Dirty non-numeric values ('N/A', '-', null)
    ['4', 'Y Blang', 'abc', '1,8', '-', 'N/A', '', '0', '0,25', '0', '0', '0', '0', '0', 'invalid', '4.7', '0', '100', '0', '0', 'Dirty data test'],
    
    // Row 14 (Index 13): Zero items household
    ['5', 'A Đeo', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', 'Hộ không làm nông nghiệp'],
    
    // Row 15 (Index 14): Footer - Summary row -> TERMINATE
    ['Tổng cộng', '', '3,3', '2,55', '0', '0', '0.5', '0', '0.25', '0', '0', '0', '1.2', '0', '2', '9', '10', '150', '0.3', '2', ''],
    
    // Row 16 (Index 15): Post-footer signature row (must not be parsed!)
    ['Đăk Hà, ngày 30 tháng 12 năm 2025', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['Ban quản lý thôn', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['Trưởng thôn 1', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
  ];

  const fullSheetData = [...headerRows, ...dataRows];

  // Convert to Excel workbook buffer
  const ws = XLSX.utils.aoa_to_sheet(fullSheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ThongKeThon1');
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  // Run parser
  const result = parseDakHaExcel(buffer);

  // 1. Header Metadata extraction
  assert(result.villageNameFromHeader === '1', 'Extracts village name from header (Thôn 1)', `Got '${result.villageNameFromHeader}'`);
  assert(result.reportingPeriod === '31/12/2025', 'Extracts reporting period from header (31/12/2025)', `Got '${result.reportingPeriod}'`);

  // 2. Exact row count (Filtered ghost rows and terminated at footer)
  // Expected valid rows: Row 10 (A Thui), Row 13 (Y Blang), Row 14 (A Đeo) -> Total 3 rows!
  assert(result.totalRowsParsed === 3, 'Exactly 3 valid households parsed (ghost rows and footers excluded)', `Got ${result.totalRowsParsed}`);

  // 3. Row 1 (A Thui): Vietnamese comma parsing
  const r1 = result.rows[0];
  assert(r1.full_name === 'A Thui', 'Row 1 full_name is A Thui');
  assert(r1.name_unaccented === 'a thui', 'Row 1 name_unaccented matches lowercase unaccented');
  
  const cafeH = r1.crop_items.find(c => c.crop_type === 'Cà phê' && c.ownership_type === 'household');
  assert(cafeH?.area === 1.5, 'Parsed "1,5" as float 1.5 for Cà phê hộ');
  
  const cafeC = r1.crop_items.find(c => c.crop_type === 'Cà phê' && c.ownership_type === 'contracted');
  assert(cafeC?.area === 0.75, 'Parsed "0,75" as float 0.75 for Cà phê khoán');
  
  const lua = r1.crop_items.find(c => c.crop_type === 'Lúa nước');
  assert(lua?.area === 1.2, 'Parsed "1,2" as float 1.2 for Lúa nước');

  const bo = r1.livestock_items.find(l => l.animal_type === 'Bò');
  assert(bo?.quantity === 5, 'Parsed 5 cows');

  const caLong = r1.aquaculture_items.find(a => a.aquaculture_type === 'Nuôi cá lồng bè');
  assert(caLong?.value === 2 && caLong.unit === 'lồng', 'Parsed 2 fish cages with unit "lồng"');

  // 4. Dirty value resilience on Row 2 (Y Blang)
  const r2 = result.rows[1];
  assert(r2.full_name === 'Y Blang', 'Row 2 full_name is Y Blang');
  
  // Col 2 was 'abc' -> should produce 0 (not in items)
  const invalidCafe = r2.crop_items.find(c => c.crop_type === 'Cà phê' && c.ownership_type === 'household');
  assert(invalidCafe === undefined, 'Invalid string "abc" yields 0 area and is omitted from crop_items');
  
  // Col 3 was '1,8' -> valid 1.8
  const validCafeC = r2.crop_items.find(c => c.crop_type === 'Cà phê' && c.ownership_type === 'contracted');
  assert(validCafeC?.area === 1.8, 'Parsed "1,8" as 1.8 alongside dirty fields');

  // Col 14 was 'invalid' for trâu -> omitted
  const invalidTrau = r2.livestock_items.find(l => l.animal_type === 'Trâu');
  assert(invalidTrau === undefined, 'Invalid text "invalid" for Trâu safely ignored');

  // Col 15 was '4.7' float for bò (integer) -> floor to 4
  const boParsed = r2.livestock_items.find(l => l.animal_type === 'Bò');
  assert(boParsed?.quantity === 4, 'Parsed "4.7" as integer 4 for Bò (Math.floor)');

  // 5. Zero-items household (A Đeo)
  const r3 = result.rows[2];
  assert(r3.full_name === 'A Đeo', 'Row 3 full_name is A Đeo');
  assert(r3.crop_items.length === 0, 'Zero-area crops produce empty crop_items array');
  assert(r3.livestock_items.length === 0, 'Zero-quantity livestock produce empty livestock_items array');
  assert(r3.aquaculture_items.length === 0, 'Zero-value aquaculture produce empty aquaculture_items array');

  // 6. Footer check: Ensure "Tổng cộng" and subsequent rows were never added
  const hasSummaryRow = result.rows.some(r => r.full_name.toLowerCase().includes('tổng cộng'));
  assert(!hasSummaryRow, 'Summary footer "Tổng cộng" was not parsed as a household');

  const hasSignatureRow = result.rows.some(r => r.full_name.toLowerCase().includes('đăk hà') || r.full_name.toLowerCase().includes('ban quản lý'));
  assert(!hasSignatureRow, 'Signature footer rows were not parsed as households');

  console.log(`\nResults: ${passed} Passed, ${failed} Failed\n`);
  if (failed > 0) process.exit(1);
}

runExcelParserChallenges().catch((err) => {
  console.error('Fatal error running Excel parser challenges:', err);
  process.exit(1);
});
