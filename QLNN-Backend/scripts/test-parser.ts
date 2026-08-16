import path from 'path';
import { parseDakHaExcel } from '../src/utils/excelParser';

const filePath = 'C:\\Users\\umnuar\\Downloads\\Biểu mẫu thống kê câ trồng, vật nuôi, thủy sản.xls';
console.log('Testing parseDakHaExcel on file:', filePath);

const result = parseDakHaExcel(filePath);
console.log('Total households parsed:', result.totalRowsParsed);
console.log('First household (index 0):', JSON.stringify(result.rows[0], null, 2));
console.log('Last household (index ' + (result.rows.length - 1) + '):', JSON.stringify(result.rows[result.rows.length - 1], null, 2));
