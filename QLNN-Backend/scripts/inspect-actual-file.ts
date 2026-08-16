import * as XLSX from 'xlsx';

const filePath = 'C:\\Users\\umnuar\\Downloads\\Biểu mẫu thống kê câ trồng, vật nuôi, thủy sản.xls';

console.log('Reading file:', filePath);
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

console.log('Sheet Name:', sheetName);
console.log('Range of cells:', worksheet['!ref']);

// Convert to 2D array
const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('\n--- 15 DÒNG ĐẦU TIÊN CỦA FILE EXCEL NGUYÊN BẢN ---');
for (let i = 0; i < Math.min(15, rawData.length); i++) {
  console.log(`Dòng Excel ${i + 1} (Array Index ${i}):`, JSON.stringify(rawData[i]));
}

console.log('\n--- 5 DÒNG CUỐI CỦA FILE EXCEL NGUYÊN BẢN ---');
for (let i = Math.max(0, rawData.length - 5); i < rawData.length; i++) {
  console.log(`Dòng Excel ${i + 1} (Array Index ${i}):`, JSON.stringify(rawData[i]));
}
