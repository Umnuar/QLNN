import * as XLSX from "xlsx";
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

function parseNumber(val: any): number {
	if (val === undefined || val === null || val === "") return 0;
	if (typeof val === "number") return isNaN(val) ? 0 : val;
	const cleaned = String(val).trim().replace(",", ".");
	const num = parseFloat(cleaned);
	return isNaN(num) ? 0 : num;
}

function parseIntNumber(val: any): number {
	if (val === undefined || val === null || val === "") return 0;
	if (typeof val === "number") return Math.floor(val);
	const cleaned = String(val).trim().replace(",", ".");
	const num = parseInt(cleaned, 10);
	return isNaN(num) ? 0 : num;
}

/**
 * Đọc file Excel biểu mẫu 21 cột của Đăk Hà:
 * - Bỏ qua 9 dòng đầu (index 0 đến 8).
 * - Bắt đầu đọc từ dòng 10 (index 9, STT = 1).
 * - Dừng lại chính xác trước dòng Tổng cộng / Footer.
 * - Chỉ thêm vào danh sách items nếu giá trị > 0.
 */
export function parseDakHaExcel(
	bufferOrPath: Buffer | string,
): ParseExcelResult {
	const workbook =
		typeof bufferOrPath === "string"
			? XLSX.readFile(bufferOrPath)
			: XLSX.read(bufferOrPath, { type: "buffer" });

	const sheetName = workbook.SheetNames[0];
	const worksheet = workbook.Sheets[sheetName];
	const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

	let villageNameFromHeader = "";
	let reportingPeriod = "";

	// Đọc thôn và kỳ báo cáo từ header (nếu có)
	if (rawData[1] && rawData[1][0]) {
		const vMatch = String(rawData[1][0]).match(/THÔN\s*([^.]+)/i);
		if (vMatch) villageNameFromHeader = vMatch[1].trim();
	}
	if (rawData[4] && rawData[4][0]) {
		const pMatch = String(rawData[4][0]).match(/thời điểm\s*([^\n\r]+)/i);
		if (pMatch) reportingPeriod = pMatch[1].trim();
	}

	const rows: ParsedHouseholdRow[] = [];

	// Bắt đầu từ dòng 10 (index 9 trong mảng 0-indexed)
	for (let i = 9; i < rawData.length; i++) {
		const r = rawData[i];
		if (!r || r.length === 0) continue;

		const col0 = r[0] !== undefined && r[0] !== null ? String(r[0]).trim() : "";
		const col1 = r[1] !== undefined && r[1] !== null ? String(r[1]).trim() : "";

		// Điều kiện dừng: Khi gặp dòng "Tổng", "Tổng cộng", hoặc Footer ngày tháng/chữ ký
		const normalizedCol0 = col0.toLowerCase();
		const normalizedCol1 = col1.toLowerCase();
		if (
			normalizedCol0.startsWith("tổng") ||
			normalizedCol1.startsWith("tổng") ||
			normalizedCol0.includes("đăk hà") ||
			normalizedCol0.includes("ban quản lý") ||
			(r[14] && String(r[14]).toLowerCase().includes("đăk hà")) ||
			(r[14] && String(r[14]).toLowerCase().includes("ban quản lý"))
		) {
			break;
		}

		// BỎ QUA DÒNG TRỐNG TÊN: Một dòng CHỈ hợp lệ khi Cột B (Họ và tên) có dữ liệu thật.
		// Nếu Cột B trống (dù Cột A có STT in sẵn trong template), bắt buộc bỏ qua, không tạo "hộ ma".
		if (!col1) {
			continue;
		}

		const stt = parseIntNumber(col0) || rows.length + 1;
		const full_name = col1;
		const name_unaccented = removeAccents(full_name);
		const notes =
			r[20] !== undefined && r[20] !== null ? String(r[20]).trim() : "";

		// 1. CÂY TRỒNG (12 cột)
		const crop_items: ParsedHouseholdRow["crop_items"] = [];

		// Col 2: Cà phê (ha) - Hộ gia đình
		const cafeH = parseNumber(r[2]);
		if (cafeH > 0) {
			crop_items.push({
				crop_type: "Cà phê",
				crop_subtype: null,
				ownership_type: "household",
				area: cafeH,
			});
		}

		// Col 3: Cà phê (ha) - Nhận khoán
		const cafeC = parseNumber(r[3]);
		if (cafeC > 0) {
			crop_items.push({
				crop_type: "Cà phê",
				crop_subtype: null,
				ownership_type: "contracted",
				area: cafeC,
			});
		}

		// Col 4: Cao su (ha) - Hộ gia đình
		const rubH = parseNumber(r[4]);
		if (rubH > 0) {
			crop_items.push({
				crop_type: "Cao su",
				crop_subtype: null,
				ownership_type: "household",
				area: rubH,
			});
		}

		// Col 5: Cao su (ha) - Nhận khoán
		const rubC = parseNumber(r[5]);
		if (rubC > 0) {
			crop_items.push({
				crop_type: "Cao su",
				crop_subtype: null,
				ownership_type: "contracted",
				area: rubC,
			});
		}

		// Col 6: Cây ăn quả (ha)
		const fruit = parseNumber(r[6]);
		if (fruit > 0) {
			crop_items.push({
				crop_type: "Cây ăn quả",
				crop_subtype: null,
				ownership_type: null,
				area: fruit,
			});
		}

		// Col 7: Cây Mắc Ca (ha)
		const macca = parseNumber(r[7]);
		if (macca > 0) {
			crop_items.push({
				crop_type: "Cây Mắc Ca",
				crop_subtype: null,
				ownership_type: null,
				area: macca,
			});
		}

		// 4 Cột Dược liệu (Chỉ lưu nếu > 0)
		// Col 8: Đinh lăng
		const dinhLang = parseNumber(r[8]);
		if (dinhLang > 0) {
			crop_items.push({
				crop_type: "Cây dược liệu",
				crop_subtype: "Đinh lăng",
				ownership_type: null,
				area: dinhLang,
			});
		}

		// Col 9: Gừng
		const gung = parseNumber(r[9]);
		if (gung > 0) {
			crop_items.push({
				crop_type: "Cây dược liệu",
				crop_subtype: "Gừng",
				ownership_type: null,
				area: gung,
			});
		}

		// Col 10: Nghệ
		const nghe = parseNumber(r[10]);
		if (nghe > 0) {
			crop_items.push({
				crop_type: "Cây dược liệu",
				crop_subtype: "Nghệ",
				ownership_type: null,
				area: nghe,
			});
		}

		// Col 11: Sả
		const sa = parseNumber(r[11]);
		if (sa > 0) {
			crop_items.push({
				crop_type: "Cây dược liệu",
				crop_subtype: "Sả",
				ownership_type: null,
				area: sa,
			});
		}

		// Col 12: Lúa nước (ha)
		const lua = parseNumber(r[12]);
		if (lua > 0) {
			crop_items.push({
				crop_type: "Lúa nước",
				crop_subtype: null,
				ownership_type: null,
				area: lua,
			});
		}

		// Col 13: Cây hàng năm khác (ha)
		const otherAnnual = parseNumber(r[13]);
		if (otherAnnual > 0) {
			crop_items.push({
				crop_type: "Cây hàng năm khác",
				crop_subtype: null,
				ownership_type: null,
				area: otherAnnual,
			});
		}

		// 2. VẬT NUÔI (4 cột)
		const livestock_items: ParsedHouseholdRow["livestock_items"] = [];

		// Col 14: Trâu (con)
		const trau = parseIntNumber(r[14]);
		if (trau > 0) {
			livestock_items.push({ animal_type: "Trâu", quantity: trau });
		}

		// Col 15: Bò (con)
		const bo = parseIntNumber(r[15]);
		if (bo > 0) {
			livestock_items.push({ animal_type: "Bò", quantity: bo });
		}

		// Col 16: Heo (con)
		const heo = parseIntNumber(r[16]);
		if (heo > 0) {
			livestock_items.push({ animal_type: "Heo", quantity: heo });
		}

		// Col 17: Gia cầm (con)
		const giaCam = parseIntNumber(r[17]);
		if (giaCam > 0) {
			livestock_items.push({ animal_type: "Gia cầm", quantity: giaCam });
		}

		// 3. THỦY SẢN (2 cột)
		const aquaculture_items: ParsedHouseholdRow["aquaculture_items"] = [];

		// Col 18: Nuôi cá ao (ha)
		const caAo = parseNumber(r[18]);
		if (caAo > 0) {
			aquaculture_items.push({
				aquaculture_type: "Nuôi cá ao",
				value: caAo,
				unit: "ha",
			});
		}

		// Col 19: Nuôi cá lồng bè (lồng)
		const caLong = parseIntNumber(r[19]);
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
