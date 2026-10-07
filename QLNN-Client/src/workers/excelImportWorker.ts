import * as XLSX from "xlsx";

export interface ParsedCropItem {
	crop_type: string;
	crop_subtype: string | null;
	ownership_type: string | null;
	area: number;
}

export interface ParsedLivestockItem {
	animal_type: string;
	quantity: number;
}

export interface ParsedAquacultureItem {
	aquaculture_type: string;
	value: number;
	unit: string;
}

export interface ParsedHouseholdRow {
	stt: number | null;
	full_name: string;
	notes: string;
	crop_items: ParsedCropItem[];
	livestock_items: ParsedLivestockItem[];
	aquaculture_items: ParsedAquacultureItem[];
}

export interface AnalyzedRow {
	row: ParsedHouseholdRow;
	action: "create" | "update";
	existingHousehold: any | null;
}

export interface SmartUpsertAnalysis {
	analyzedRows: AnalyzedRow[];
	createCount: number;
	updateCount: number;
	totalCount: number;
}

/**
 * Chuẩn hóa họ tên để đối chiếu so sánh: Chữ thường, khoảng trắng đơn.
 */
export function normalizeFullName(name: string): string {
	if (!name) return "";
	return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function parseNumber(val: any): number {
	if (val === undefined || val === null || val === "") return 0;
	if (typeof val === "number") return Number.isNaN(val) ? 0 : val;
	const cleaned = String(val).trim().replace(",", ".");
	const num = parseFloat(cleaned);
	return Number.isNaN(num) ? 0 : num;
}

function parseIntNumber(val: any): number {
	if (val === undefined || val === null || val === "") return 0;
	if (typeof val === "number") return Math.floor(val);
	const cleaned = String(val).trim().replace(",", ".");
	const num = parseInt(cleaned, 10);
	return Number.isNaN(num) ? 0 : num;
}

export function parseRowToHousehold(
	row: (string | number | undefined)[],
	fallbackStt: number,
): ParsedHouseholdRow | null {
	const col0 = String(row[0] ?? "").trim();
	const col1 = String(row[1] ?? "").trim();

	const lower0 = col0.toLowerCase();
	const lower1 = col1.toLowerCase();

	if (
		lower0.startsWith("tổng") ||
		lower1.startsWith("tổng") ||
		lower0.includes("đăk hà") ||
		lower0.includes("ban quản lý") ||
		lower1.startsWith("họ và tên")
	) {
		return null;
	}

	if (!col1) return null;

	const stt = parseIntNumber(col0) || fallbackStt;
	const full_name = col1;
	const notes = String(row[20] ?? "").trim();

	// 1. Cây trồng
	const crop_items: ParsedCropItem[] = [];

	const cafeH = parseNumber(row[2]);
	if (cafeH > 0) {
		crop_items.push({ crop_type: "Cà phê", crop_subtype: null, ownership_type: "household", area: cafeH });
	}

	const cafeC = parseNumber(row[3]);
	if (cafeC > 0) {
		crop_items.push({ crop_type: "Cà phê", crop_subtype: null, ownership_type: "contracted", area: cafeC });
	}

	const rubH = parseNumber(row[4]);
	if (rubH > 0) {
		crop_items.push({ crop_type: "Cao su", crop_subtype: null, ownership_type: "household", area: rubH });
	}

	const rubC = parseNumber(row[5]);
	if (rubC > 0) {
		crop_items.push({ crop_type: "Cao su", crop_subtype: null, ownership_type: "contracted", area: rubC });
	}

	const fruit = parseNumber(row[6]);
	if (fruit > 0) {
		crop_items.push({ crop_type: "Cây ăn quả", crop_subtype: null, ownership_type: null, area: fruit });
	}

	const macca = parseNumber(row[7]);
	if (macca > 0) {
		crop_items.push({ crop_type: "Cây Mắc Ca", crop_subtype: null, ownership_type: null, area: macca });
	}

	const dinhLang = parseNumber(row[8]);
	if (dinhLang > 0) {
		crop_items.push({ crop_type: "Cây dược liệu", crop_subtype: "Đinh lăng", ownership_type: null, area: dinhLang });
	}

	const gung = parseNumber(row[9]);
	if (gung > 0) {
		crop_items.push({ crop_type: "Cây dược liệu", crop_subtype: "Gừng", ownership_type: null, area: gung });
	}

	const nghe = parseNumber(row[10]);
	if (nghe > 0) {
		crop_items.push({ crop_type: "Cây dược liệu", crop_subtype: "Nghệ", ownership_type: null, area: nghe });
	}

	const sa = parseNumber(row[11]);
	if (sa > 0) {
		crop_items.push({ crop_type: "Cây dược liệu", crop_subtype: "Sả", ownership_type: null, area: sa });
	}

	const luaNuoc = parseNumber(row[12]);
	if (luaNuoc > 0) {
		crop_items.push({ crop_type: "Lúa nước", crop_subtype: null, ownership_type: null, area: luaNuoc });
	}

	const cayHnKhac = parseNumber(row[13]);
	if (cayHnKhac > 0) {
		crop_items.push({ crop_type: "Cây hàng năm khác", crop_subtype: null, ownership_type: null, area: cayHnKhac });
	}

	// 2. Vật nuôi
	const livestock_items: ParsedLivestockItem[] = [];

	const trau = parseIntNumber(row[14]);
	if (trau > 0) livestock_items.push({ animal_type: "Trâu", quantity: trau });

	const bo = parseIntNumber(row[15]);
	if (bo > 0) livestock_items.push({ animal_type: "Bò", quantity: bo });

	const heo = parseIntNumber(row[16]);
	if (heo > 0) livestock_items.push({ animal_type: "Heo", quantity: heo });

	const giaCam = parseIntNumber(row[17]);
	if (giaCam > 0) livestock_items.push({ animal_type: "Gia cầm", quantity: giaCam });

	// 3. Thủy sản
	const aquaculture_items: ParsedAquacultureItem[] = [];

	const caAo = parseNumber(row[18]);
	if (caAo > 0) {
		aquaculture_items.push({ aquaculture_type: "Nuôi cá ao", value: caAo, unit: "ha" });
	}

	const caLong = parseIntNumber(row[19]);
	if (caLong > 0) {
		aquaculture_items.push({ aquaculture_type: "Nuôi cá lồng bè", value: caLong, unit: "lồng" });
	}

	return {
		stt,
		full_name,
		notes,
		crop_items,
		livestock_items,
		aquaculture_items,
	};
}

/**
 * Phân tích danh sách dòng Excel để xác định Create vs Update đối chiếu hộ hiện có
 */
export function analyzeParsedRowsForUpsert(
	parsedRows: ParsedHouseholdRow[],
	existingHouseholds: any[] = [],
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
				action: "update",
				existingHousehold: existing,
			});
		} else {
			createCount++;
			const placeholder = {
				id: null,
				full_name: row.full_name,
				stt: row.stt,
				notes: row.notes,
			};
			householdMapByName.set(normalizedName, placeholder);
			analyzedRows.push({
				row,
				action: "create",
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

// ================= Worker Event Listener =================
self.onmessage = (event: MessageEvent) => {
	try {
		const { arrayBuffer, rawRows, existingHouseholds } = event.data;
		let rows: (string | number | undefined)[][] = [];

		if (arrayBuffer) {
			const wb = XLSX.read(arrayBuffer, { type: "array" });
			if (!wb.SheetNames || wb.SheetNames.length === 0) {
				self.postMessage({
					type: "error",
					error: "Tệp không chứa bảng tính (sheet) nào hợp lệ.",
				});
				return;
			}
			const ws = wb.Sheets[wb.SheetNames[0]];
			const rawData = XLSX.utils.sheet_to_json<(string | number | undefined)[]>(
				ws,
				{ header: 1 },
			);

			// Chuẩn hóa lấy dữ liệu từ dòng 10 trở đi (index 9) theo mẫu 21 cột Đăk Hà
			let parsed = rawData
				.slice(9)
				.filter(
					(row) =>
						row &&
						row[1] !== undefined &&
						row[1] !== null &&
						String(row[1]).trim() !== "",
				);

			// Fallback nếu người dùng nạp file phẳng không có 9 dòng tiêu đề
			if (parsed.length === 0 && rawData.length > 1) {
				parsed = rawData
					.slice(1)
					.filter(
						(row) =>
							row &&
							row[1] !== undefined &&
							row[1] !== null &&
							String(row[1]).trim() !== "",
					);
			}

			rows = parsed;
		} else if (rawRows) {
			rows = rawRows;
		}

		if (!rows || rows.length === 0) {
			self.postMessage({
				type: "error",
				error: "Không tìm thấy dòng dữ liệu hộ dân hợp lệ trong tệp (cột Họ và tên chủ hộ phải có giá trị).",
			});
			return;
		}

		const parsedHouseholdRows: ParsedHouseholdRow[] = [];
		for (let i = 0; i < rows.length; i++) {
			const parsed = parseRowToHousehold(rows[i], i + 1);
			if (parsed) {
				parsedHouseholdRows.push(parsed);
			}
		}

		const analysis = analyzeParsedRowsForUpsert(
			parsedHouseholdRows,
			existingHouseholds || [],
		);

		self.postMessage({
			type: "done",
			rawRows: rows,
			parsedRows: parsedHouseholdRows,
			analyzedRows: analysis.analyzedRows,
			createCount: analysis.createCount,
			updateCount: analysis.updateCount,
			totalCount: analysis.totalCount,
		});
	} catch (err: any) {
		self.postMessage({
			type: "error",
			error: err.message || "Lỗi khi xử lý file trong Web Worker",
		});
	}
};
