import ExcelJS from "exceljs";
import { removeAccents } from "./textUtils";

export interface ParsedHouseholdRow {
	stt: number | null;
	full_name: string;
	name_unaccented: string;
	notes: string;
	crop_items: Array<{
		crop_type: string;
		crop_subtype: string | null;
		ownership_type: string | null;
		area: number;
	}>;
	livestock_items: Array<{
		animal_type: string;
		quantity: number;
	}>;
	aquaculture_items: Array<{
		aquaculture_type: string;
		value: number;
		unit: string;
	}>;
}

export interface ParseExcelResult {
	villageNameFromHeader?: string;
	reportingPeriod?: string;
	rows: ParsedHouseholdRow[];
	totalRowsParsed: number;
}

function getCellValue(val: any): any {
	if (val === undefined || val === null) return "";
	if (typeof val === "object") {
		if ("result" in val && val.result !== undefined && val.result !== null) {
			return val.result;
		}
		if ("text" in val && typeof val.text === "string") {
			return val.text;
		}
		if (Array.isArray(val.richText)) {
			return val.richText.map((rt: any) => rt.text || "").join("");
		}
	}
	return val;
}

function parseNumber(val: any): number {
	const raw = getCellValue(val);
	if (raw === undefined || raw === null || raw === "") return 0;
	if (typeof raw === "number") return isNaN(raw) ? 0 : raw;
	const cleaned = String(raw).trim().replace(",", ".");
	const num = parseFloat(cleaned);
	return isNaN(num) ? 0 : num;
}

function parseIntNumber(val: any): number {
	const raw = getCellValue(val);
	if (raw === undefined || raw === null || raw === "") return 0;
	if (typeof raw === "number") return Math.floor(raw);
	const cleaned = String(raw).trim().replace(",", ".");
	const num = parseInt(cleaned, 10);
	return isNaN(num) ? 0 : num;
}

/**
 * Đọc file Excel biểu mẫu 21 cột của Đăk Hà bằng ExcelJS:
 * - Bỏ qua 9 dòng đầu (row 1 đến 9).
 * - Bắt đầu đọc từ dòng 10 (STT = 1).
 * - Dừng lại chính xác trước dòng Tổng cộng / Footer.
 * - Chỉ thêm vào danh sách items nếu giá trị > 0.
 */
export async function parseDakHaExcel(
	bufferOrPath: Buffer | string,
): Promise<ParseExcelResult> {
	const workbook = new ExcelJS.Workbook();
	if (typeof bufferOrPath === "string") {
		await workbook.xlsx.readFile(bufferOrPath);
	} else {
		await workbook.xlsx.load(bufferOrPath);
	}

	const worksheet = workbook.worksheets[0];
	if (!worksheet) {
		return { rows: [], totalRowsParsed: 0 };
	}

	let villageNameFromHeader = "";
	let reportingPeriod = "";

	// Đọc thôn và kỳ báo cáo từ header (dòng 2 và dòng 5)
	const row2Cell1 = getCellValue(worksheet.getRow(2).getCell(1).value);
	if (row2Cell1) {
		const vMatch = String(row2Cell1).match(/THÔN\s*([^.]+)/i);
		if (vMatch) villageNameFromHeader = vMatch[1].trim();
	}

	const row5Cell1 = getCellValue(worksheet.getRow(5).getCell(1).value);
	if (row5Cell1) {
		const pMatch = String(row5Cell1).match(/thời điểm\s*([^\n\r]+)/i);
		if (pMatch) reportingPeriod = pMatch[1].trim();
	}

	const rows: ParsedHouseholdRow[] = [];
	const rowCount = worksheet.rowCount;

	for (let rowNumber = 10; rowNumber <= rowCount; rowNumber++) {
		const row = worksheet.getRow(rowNumber);
		if (!row) continue;

		const col0 = String(getCellValue(row.getCell(1).value)).trim(); // Col A
		const col1 = String(getCellValue(row.getCell(2).value)).trim(); // Col B

		// Điều kiện dừng: Khi gặp dòng "Tổng", "Tổng cộng", hoặc Footer ngày tháng/chữ ký
		const normalizedCol0 = col0.toLowerCase();
		const normalizedCol1 = col1.toLowerCase();
		const col14 = String(getCellValue(row.getCell(15).value)).toLowerCase();

		if (
			normalizedCol0.startsWith("tổng") ||
			normalizedCol1.startsWith("tổng") ||
			normalizedCol0.includes("đăk hà") ||
			normalizedCol0.includes("ban quản lý") ||
			col14.includes("đăk hà") ||
			col14.includes("ban quản lý")
		) {
			break;
		}

		// BỎ QUA DÒNG TRỐNG TÊN: Một dòng CHỈ hợp lệ khi Cột B (Họ và tên) có dữ liệu thật.
		if (!col1) {
			continue;
		}

		const stt = parseIntNumber(col0) || rows.length + 1;
		const full_name = col1;
		const name_unaccented = removeAccents(full_name);
		const notes = String(getCellValue(row.getCell(21).value)).trim();

		// 1. CÂY TRỒNG (12 cột)
		const crop_items: ParsedHouseholdRow["crop_items"] = [];

		// Col C (cell 3): Cà phê (ha) - Hộ gia đình
		const cafeH = parseNumber(row.getCell(3).value);
		if (cafeH > 0) {
			crop_items.push({
				crop_type: "Cà phê",
				crop_subtype: null,
				ownership_type: "household",
				area: cafeH,
			});
		}

		// Col D (cell 4): Cà phê (ha) - Nhận khoán
		const cafeC = parseNumber(row.getCell(4).value);
		if (cafeC > 0) {
			crop_items.push({
				crop_type: "Cà phê",
				crop_subtype: null,
				ownership_type: "contracted",
				area: cafeC,
			});
		}

		// Col E (cell 5): Cao su (ha) - Hộ gia đình
		const rubH = parseNumber(row.getCell(5).value);
		if (rubH > 0) {
			crop_items.push({
				crop_type: "Cao su",
				crop_subtype: null,
				ownership_type: "household",
				area: rubH,
			});
		}

		// Col F (cell 6): Cao su (ha) - Nhận khoán
		const rubC = parseNumber(row.getCell(6).value);
		if (rubC > 0) {
			crop_items.push({
				crop_type: "Cao su",
				crop_subtype: null,
				ownership_type: "contracted",
				area: rubC,
			});
		}

		// Col G (cell 7): Cây ăn quả (ha)
		const fruit = parseNumber(row.getCell(7).value);
		if (fruit > 0) {
			crop_items.push({
				crop_type: "Cây ăn quả",
				crop_subtype: null,
				ownership_type: null,
				area: fruit,
			});
		}

		// Col H (cell 8): Cây Mắc Ca (ha)
		const macca = parseNumber(row.getCell(8).value);
		if (macca > 0) {
			crop_items.push({
				crop_type: "Cây Mắc Ca",
				crop_subtype: null,
				ownership_type: null,
				area: macca,
			});
		}

		// 4 Cột Dược liệu (Cells 9-12)
		// Col I (cell 9): Đinh lăng
		const dinhLang = parseNumber(row.getCell(9).value);
		if (dinhLang > 0) {
			crop_items.push({
				crop_type: "Cây dược liệu",
				crop_subtype: "Đinh lăng",
				ownership_type: null,
				area: dinhLang,
			});
		}

		// Col J (cell 10): Gừng
		const gung = parseNumber(row.getCell(10).value);
		if (gung > 0) {
			crop_items.push({
				crop_type: "Cây dược liệu",
				crop_subtype: "Gừng",
				ownership_type: null,
				area: gung,
			});
		}

		// Col K (cell 11): Nghệ
		const nghe = parseNumber(row.getCell(11).value);
		if (nghe > 0) {
			crop_items.push({
				crop_type: "Cây dược liệu",
				crop_subtype: "Nghệ",
				ownership_type: null,
				area: nghe,
			});
		}

		// Col L (cell 12): Sả
		const sa = parseNumber(row.getCell(12).value);
		if (sa > 0) {
			crop_items.push({
				crop_type: "Cây dược liệu",
				crop_subtype: "Sả",
				ownership_type: null,
				area: sa,
			});
		}

		// Col M (cell 13): Lúa nước (ha)
		const lua = parseNumber(row.getCell(13).value);
		if (lua > 0) {
			crop_items.push({
				crop_type: "Lúa nước",
				crop_subtype: null,
				ownership_type: null,
				area: lua,
			});
		}

		// Col N (cell 14): Cây hàng năm khác (ha)
		const otherAnnual = parseNumber(row.getCell(14).value);
		if (otherAnnual > 0) {
			crop_items.push({
				crop_type: "Cây hàng năm khác",
				crop_subtype: null,
				ownership_type: null,
				area: otherAnnual,
			});
		}

		// 2. VẬT NUÔI (4 cột: cells 15-18)
		const livestock_items: ParsedHouseholdRow["livestock_items"] = [];

		// Col O (cell 15): Trâu (con)
		const trau = parseIntNumber(row.getCell(15).value);
		if (trau > 0) {
			livestock_items.push({ animal_type: "Trâu", quantity: trau });
		}

		// Col P (cell 16): Bò (con)
		const bo = parseIntNumber(row.getCell(16).value);
		if (bo > 0) {
			livestock_items.push({ animal_type: "Bò", quantity: bo });
		}

		// Col Q (cell 17): Heo (con)
		const heo = parseIntNumber(row.getCell(17).value);
		if (heo > 0) {
			livestock_items.push({ animal_type: "Heo", quantity: heo });
		}

		// Col R (cell 18): Gia cầm (con)
		const giaCam = parseIntNumber(row.getCell(18).value);
		if (giaCam > 0) {
			livestock_items.push({ animal_type: "Gia cầm", quantity: giaCam });
		}

		// 3. THỦY SẢN (2 cột: cells 19-20)
		const aquaculture_items: ParsedHouseholdRow["aquaculture_items"] = [];

		// Col S (cell 19): Nuôi cá ao (ha)
		const caAo = parseNumber(row.getCell(19).value);
		if (caAo > 0) {
			aquaculture_items.push({
				aquaculture_type: "Nuôi cá ao",
				value: caAo,
				unit: "ha",
			});
		}

		// Col T (cell 20): Nuôi cá lồng bè (lồng)
		const caLong = parseIntNumber(row.getCell(20).value);
		if (caLong > 0) {
			aquaculture_items.push({
				aquaculture_type: "Nuôi cá lồng bè",
				value: caLong,
				unit: "lồng",
			});
		}

		rows.push({
			stt,
			full_name,
			name_unaccented,
			notes,
			crop_items,
			livestock_items,
			aquaculture_items,
		});
	}

	return {
		villageNameFromHeader,
		reportingPeriod,
		rows,
		totalRowsParsed: rows.length,
	};
}
