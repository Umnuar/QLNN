import ExcelJS from "exceljs";

export interface ExportHouseholdData {
	stt?: number | null;
	full_name: string;
	notes?: string | null;
	crop_items?: Array<{
		crop_type: string;
		crop_subtype?: string | null;
		ownership_type?: string | null;
		area: number | any;
	}>;
	livestock_items?: Array<{
		animal_type: string;
		quantity: number;
	}>;
	aquaculture_items?: Array<{
		aquaculture_type: string;
		value: number | any;
		unit: string;
	}>;
}

export interface BuildExcelOptions {
	villageName?: string;
	reportingPeriod?: string;
	households: ExportHouseholdData[];
}

export async function buildDakHaExcel(
	options: BuildExcelOptions,
): Promise<Buffer> {
	const workbook = new ExcelJS.Workbook();
	workbook.creator = "QLNN - Hệ thống Quản Lý Nông Nghiệp Đăk Hà";
	workbook.lastModifiedBy = "QLNN System";
	workbook.created = new Date();
	workbook.modified = new Date();

	const worksheet = workbook.addWorksheet("Sheet1", {
		pageSetup: {
			orientation: "landscape",
			fitToPage: true,
			fitToWidth: 1,
			fitToHeight: 0,
		},
	});

	const villageName = options.villageName || ".............";
	const period = options.reportingPeriod || "tháng 8 năm 2026";

	// 1. Tiêu đề Đơn vị & Quốc hiệu (Rows 1-2)
	worksheet.mergeCells("A1:E1");
	worksheet.getCell("A1").value = "UBND XÃ ĐĂK HÀ";
	worksheet.getCell("A1").font = {
		name: "Times New Roman",
		size: 11,
		bold: true,
	};
	worksheet.getCell("A1").alignment = {
		horizontal: "center",
		vertical: "middle",
	};

	worksheet.mergeCells("F1:U1");
	worksheet.getCell("F1").value = "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM";
	worksheet.getCell("F1").font = {
		name: "Times New Roman",
		size: 11,
		bold: true,
	};
	worksheet.getCell("F1").alignment = {
		horizontal: "center",
		vertical: "middle",
	};

	worksheet.mergeCells("A2:E2");
	worksheet.getCell("A2").value =
		`BAN QUẢN LÝ THÔN ${villageName.toUpperCase()}`;
	worksheet.getCell("A2").font = {
		name: "Times New Roman",
		size: 11,
		bold: true,
	};
	worksheet.getCell("A2").alignment = {
		horizontal: "center",
		vertical: "middle",
	};

	worksheet.mergeCells("F2:U2");
	worksheet.getCell("F2").value = "Độc lập - Tự do - Hạnh phúc";
	worksheet.getCell("F2").font = {
		name: "Times New Roman",
		size: 11,
		bold: true,
		underline: true,
	};
	worksheet.getCell("F2").alignment = {
		horizontal: "center",
		vertical: "middle",
	};

	// 2. Tên Danh sách (Rows 4-5)
	worksheet.mergeCells("A4:U4");
	worksheet.getCell("A4").value = "DANH SÁCH";
	worksheet.getCell("A4").font = {
		name: "Times New Roman",
		size: 14,
		bold: true,
	};
	worksheet.getCell("A4").alignment = {
		horizontal: "center",
		vertical: "middle",
	};

	worksheet.mergeCells("A5:U5");
	worksheet.getCell("A5").value =
		`Thống kê diện tích cây trồng, vật nuôi, thủy sản đến thời điểm ${period} trên địa bàn thôn ${villageName}`;
	worksheet.getCell("A5").font = {
		name: "Times New Roman",
		size: 11,
		italic: true,
	};
	worksheet.getCell("A5").alignment = {
		horizontal: "center",
		vertical: "middle",
	};

	// 3. Header 3 dòng (Rows 7, 8, 9)
	// Row 7 (index 7)
	worksheet.mergeCells("A7:A9");
	worksheet.getCell("A7").value = "STT";

	worksheet.mergeCells("B7:B9");
	worksheet.getCell("B7").value = "Họ và tên";

	worksheet.mergeCells("C7:N7");
	worksheet.getCell("C7").value = "Loại cây trồng";

	worksheet.mergeCells("O7:R7");
	worksheet.getCell("O7").value = "Loại vật nuôi";

	worksheet.mergeCells("S7:T7");
	worksheet.getCell("S7").value = "Thủy sản";

	worksheet.mergeCells("U7:U9");
	worksheet.getCell("U7").value = "Ghi\nchú";

	// Row 8 (index 8)
	worksheet.mergeCells("C8:D8");
	worksheet.getCell("C8").value = "Cà phê (ha)";

	worksheet.mergeCells("E8:F8");
	worksheet.getCell("E8").value = "Cao su (ha)";

	worksheet.mergeCells("G8:G9");
	worksheet.getCell("G8").value = "Cây ăn quả (ha)";

	worksheet.mergeCells("H8:H9");
	worksheet.getCell("H8").value = "Cây Mắc Ca (ha)";

	worksheet.mergeCells("I8:L8");
	worksheet.getCell("I8").value = "Cây dược liệu (ha)";

	worksheet.mergeCells("M8:M9");
	worksheet.getCell("M8").value = "Lúa nước (ha)";

	worksheet.mergeCells("N8:N9");
	worksheet.getCell("N8").value = "Cây hàng năm khác (ha)";

	worksheet.mergeCells("O8:O9");
	worksheet.getCell("O8").value = "Trâu (con)";

	worksheet.mergeCells("P8:P9");
	worksheet.getCell("P8").value = "Bò (con)";

	worksheet.mergeCells("Q8:Q9");
	worksheet.getCell("Q8").value = "Heo (con)";

	worksheet.mergeCells("R8:R9");
	worksheet.getCell("R8").value = "Gia cầm (con)";

	worksheet.mergeCells("S8:S9");
	worksheet.getCell("S8").value = "Nuôi cá ao (ha)";

	worksheet.mergeCells("T8:T9");
	worksheet.getCell("T8").value = "Nuôi cá lồng bè (lồng)";

	// Row 9 (index 9)
	worksheet.getCell("C9").value = "Hộ gia đình";
	worksheet.getCell("D9").value = "Nhận khoán (công ty)";
	worksheet.getCell("E9").value = "Hộ gia đình";
	worksheet.getCell("F9").value = "Nhận khoán (công ty)";
	worksheet.getCell("I9").value = "Đinh \nlăng";
	worksheet.getCell("J9").value = "Gừng";
	worksheet.getCell("K9").value = "Nghệ";
	worksheet.getCell("L9").value = "Sả";

	// Định dạng Header cells (7..9, A..U)
	const headerCols = [
		"A",
		"B",
		"C",
		"D",
		"E",
		"F",
		"G",
		"H",
		"I",
		"J",
		"K",
		"L",
		"M",
		"N",
		"O",
		"P",
		"Q",
		"R",
		"S",
		"T",
		"U",
	];
	for (let r = 7; r <= 9; r++) {
		const row = worksheet.getRow(r);
		row.height = 28;
		headerCols.forEach((col) => {
			const cell = worksheet.getCell(`${col}${r}`);
			cell.font = { name: "Times New Roman", size: 10, bold: true };
			cell.alignment = {
				horizontal: "center",
				vertical: "middle",
				wrapText: true,
			};
			cell.border = {
				top: { style: "thin" },
				left: { style: "thin" },
				bottom: { style: "thin" },
				right: { style: "thin" },
			};
		});
	}

	// 4. Đổ dữ liệu các hộ (Bắt đầu từ Row 10)
	let currentRowIndex = 10;
	const households = options.households;

	for (let i = 0; i < households.length; i++) {
		const hh = households[i];
		const rowNum = currentRowIndex++;
		const row = worksheet.getRow(rowNum);
		row.height = 22;

		// Helper map items
		const getCropArea = (
			type: string,
			subtype: string | null,
			own: string | null,
		): number | string => {
			if (!hh.crop_items) return "";
			const item = hh.crop_items.find(
				(c) =>
					c.crop_type === type &&
					(subtype === null || c.crop_subtype === subtype) &&
					(own === null || c.ownership_type === own),
			);
			if (!item) return "";
			const val = Number(item.area);
			return val > 0 ? val : "";
		};

		const getLivestock = (type: string): number | string => {
			if (!hh.livestock_items) return "";
			const item = hh.livestock_items.find((l) => l.animal_type === type);
			if (!item) return "";
			return item.quantity > 0 ? item.quantity : "";
		};

		const getAqua = (type: string): number | string => {
			if (!hh.aquaculture_items) return "";
			const item = hh.aquaculture_items.find(
				(a) => a.aquaculture_type === type,
			);
			if (!item) return "";
			const val = Number(item.value);
			return val > 0 ? val : "";
		};

		row.getCell(1).value = hh.stt || i + 1; // A: STT
		row.getCell(2).value = hh.full_name; // B: Họ và tên
		row.getCell(3).value = getCropArea("Cà phê", null, "household"); // C
		row.getCell(4).value = getCropArea("Cà phê", null, "contracted"); // D
		row.getCell(5).value = getCropArea("Cao su", null, "household"); // E
		row.getCell(6).value = getCropArea("Cao su", null, "contracted"); // F
		row.getCell(7).value = getCropArea("Cây ăn quả", null, null); // G
		row.getCell(8).value = getCropArea("Cây Mắc Ca", null, null); // H
		row.getCell(9).value = getCropArea("Cây dược liệu", "Đinh lăng", null); // I
		row.getCell(10).value = getCropArea("Cây dược liệu", "Gừng", null); // J
		row.getCell(11).value = getCropArea("Cây dược liệu", "Nghệ", null); // K
		row.getCell(12).value = getCropArea("Cây dược liệu", "Sả", null); // L
		row.getCell(13).value = getCropArea("Lúa nước", null, null); // M
		row.getCell(14).value = getCropArea("Cây hàng năm khác", null, null); // N
		row.getCell(15).value = getLivestock("Trâu"); // O
		row.getCell(16).value = getLivestock("Bò"); // P
		row.getCell(17).value = getLivestock("Heo"); // Q
		row.getCell(18).value = getLivestock("Gia cầm"); // R
		row.getCell(19).value = getAqua("Nuôi cá ao"); // S
		row.getCell(20).value = getAqua("Nuôi cá lồng bè"); // T
		row.getCell(21).value = hh.notes || ""; // U

		// Format & Border
		for (let c = 1; c <= 21; c++) {
			const cell = row.getCell(c);
			cell.font = { name: "Times New Roman", size: 10 };
			cell.border = {
				top: { style: "thin" },
				left: { style: "thin" },
				bottom: { style: "thin" },
				right: { style: "thin" },
			};
			if (c === 1)
				cell.alignment = { horizontal: "center", vertical: "middle" };
			else if (c === 2)
				cell.alignment = { horizontal: "left", vertical: "middle" };
			else if (c === 21)
				cell.alignment = { horizontal: "left", vertical: "middle" };
			else cell.alignment = { horizontal: "right", vertical: "middle" };
		}
	}

	// 5. Dòng Tổng cộng (Total Row)
	const totalRowNum = currentRowIndex++;
	const totalRow = worksheet.getRow(totalRowNum);
	totalRow.height = 24;

	worksheet.mergeCells(`A${totalRowNum}:B${totalRowNum}`);
	worksheet.getCell(`A${totalRowNum}`).value = "Tổng";
	worksheet.getCell(`A${totalRowNum}`).font = {
		name: "Times New Roman",
		size: 10,
		bold: true,
	};
	worksheet.getCell(`A${totalRowNum}`).alignment = {
		horizontal: "center",
		vertical: "middle",
	};

	const startDataRow = 10;
	const endDataRow = currentRowIndex - 2;

	for (let c = 3; c <= 20; c++) {
		const colLetter = headerCols[c - 1];
		const cell = totalRow.getCell(c);
		if (endDataRow >= startDataRow) {
			cell.value = {
				formula: `SUM(${colLetter}${startDataRow}:${colLetter}${endDataRow})`,
			};
		} else {
			cell.value = 0;
		}
		cell.font = { name: "Times New Roman", size: 10, bold: true };
		cell.alignment = { horizontal: "right", vertical: "middle" };
	}

	for (let c = 1; c <= 21; c++) {
		const cell = totalRow.getCell(c);
		cell.border = {
			top: { style: "thin" },
			left: { style: "thin" },
			bottom: { style: "thin" },
			right: { style: "thin" },
		};
	}

	// 6. Footer Ngày tháng & Chữ ký Ban quản lý thôn
	const footerRow1Num = currentRowIndex + 1;
	worksheet.mergeCells(`O${footerRow1Num}:U${footerRow1Num}`);
	const dateCell = worksheet.getCell(`O${footerRow1Num}`);
	dateCell.value = "Đăk Hà, ngày…..tháng 8 năm 2026";
	dateCell.font = { name: "Times New Roman", size: 10, italic: true };
	dateCell.alignment = { horizontal: "center", vertical: "middle" };

	const footerRow2Num = footerRow1Num + 1;
	worksheet.mergeCells(`O${footerRow2Num}:U${footerRow2Num}`);
	const signCell = worksheet.getCell(`O${footerRow2Num}`);
	signCell.value = "TM. BAN QUẢN LÝ THÔN";
	signCell.font = { name: "Times New Roman", size: 10, bold: true };
	signCell.alignment = { horizontal: "center", vertical: "middle" };

	// Auto-fit column widths
	worksheet.getColumn(1).width = 6; // STT
	worksheet.getColumn(2).width = 24; // Họ tên
	for (let c = 3; c <= 20; c++) worksheet.getColumn(c).width = 11;
	worksheet.getColumn(21).width = 16; // Ghi chú

	const buffer = await workbook.xlsx.writeBuffer();
	return Buffer.from(buffer);
}
