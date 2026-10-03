import type React from "react";

/**
 * QUY ƯỚC CHUNG VỀ PHONG CÁCH BẢNG (Dùng chung cho toàn bộ ứng dụng QLNN)
 * Tuân thủ nghiêm ngặt 10 nguyên tắc:
 * 1. Bảng nằm trong thẻ bo góc + bóng mềm (rounded-2xl border shadow-xs)
 * 2. Header chữ hoa nhỏ, nền rất nhạt. Dòng thường nền trắng, hover xám rất nhạt, không xen kẽ, không viền dọc.
 * 3. Chiều cao dòng ~52px. Tên đậm, thông tin phụ ở dòng nhỏ xám bên dưới.
 * 4. Số căn phải, font-mono tabular-nums, dấu ngăn cách hàng nghìn kiểu Việt Nam (1.200.000), dấu phẩy thập phân (3,6).
 * 5. Đơn vị nhỏ màu xám, tách khỏi số. Ô trống hiển thị "—" xám nhạt.
 * 6. Badge thôn: viền xanh lá, nền xanh lá rất nhạt (một kiểu duy nhất).
 * 7. Thao tác: ô bấm 32px, hover sửa=xanh, xóa=đỏ, icon stroke vừa phải.
 * 8. Chữ ≥ 14px, độ tương phản chuẩn WCAG AA.
 */

export const TABLE_STYLES = {
	// Khung thẻ bao ngoài
	card: "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col transition-colors duration-150",

	// Thanh tiêu đề phía trên bảng
	cardHeader:
		"p-3.5 bg-slate-50/90 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap",

	// Vùng chứa cuộn
	scrollContainer: "overflow-x-auto custom-scrollbar",

	// Thẻ table
	table:
		"w-full min-w-[1020px] text-left border-separate border-spacing-0 whitespace-nowrap",

	// Tiêu đề cột (TH)
	th: "py-3.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-200/90 dark:border-slate-800 select-none whitespace-nowrap",
	thRight:
		"py-3.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-200/90 dark:border-slate-800 text-right select-none whitespace-nowrap",
	thCenter:
		"py-3.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-200/90 dark:border-slate-800 text-center select-none whitespace-nowrap",

	// Dòng dữ liệu (TR)
	tr: "group bg-white dark:bg-slate-900 hover:bg-slate-50/90 dark:hover:bg-slate-800/60 transition-colors duration-150 border-b border-slate-100 dark:border-slate-800/80 cursor-pointer",
	trExpanded: "bg-emerald-50/30 dark:bg-slate-800/40",

	// Ô dữ liệu (TD)
	td: "py-3 px-3 text-[14px] text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/80 align-middle whitespace-nowrap",
	tdCenter:
		"py-3 px-3 text-[14px] text-center text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800/80 align-middle whitespace-nowrap",
	tdRight:
		"py-3 px-3 text-[14px] text-right font-mono tabular-nums text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/80 align-middle whitespace-nowrap",

	// Cột cố định (Sticky)
	stickyLeftCheckbox:
		"py-3 px-2.5 text-center w-10 sticky left-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800/80 transition-colors",
	stickyLeftSTT:
		"py-3 px-2 text-center w-12 font-mono text-xs text-slate-500 dark:text-slate-400 sticky left-10 z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800/80 whitespace-nowrap transition-colors",
	stickyLeftName:
		"py-3 px-3.5 min-w-[200px] sticky left-[88px] z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800/80 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.04)] dark:shadow-[4px_0_10px_-2px_rgba(0,0,0,0.2)] whitespace-nowrap transition-colors",
	stickyRightAction:
		"py-3 px-3 text-center min-w-[96px] sticky right-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800/80 shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.04)] dark:shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.2)] whitespace-nowrap transition-colors",

	// Kiểu chữ chính và phụ
	primaryName: "text-[14px] font-bold text-slate-900 dark:text-slate-100",
	subText: "text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5",

	// Thao tác (32px)
	actionBtnEdit:
		"w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 transition-colors cursor-pointer",
	actionBtnDelete:
		"w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 transition-colors cursor-pointer",

	// Badge thôn đồng nhất cho mọi màn hình
	villageBadge:
		"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800 select-none whitespace-nowrap",

	// Ô trống
	emptyCell: "text-slate-300 dark:text-slate-600 font-normal select-none",
};

/**
 * Định dạng số theo chuẩn Việt Nam:
 * Dấu chấm (.) phân cách hàng nghìn, dấu phẩy (,) phân cách thập phân.
 */
export function formatTableNumber(
	val: number | null | undefined,
	maxFractionDigits: number = 3,
): string {
	if (val === null || val === undefined || Number.isNaN(Number(val))) {
		return "0";
	}
	return Number(val).toLocaleString("vi-VN", {
		maximumFractionDigits: maxFractionDigits,
	});
}

/**
 * Component hiển thị badge thôn chuẩn duy nhất
 */
export const VillageBadge: React.FC<{ name?: string | null }> = ({ name }) => {
	return (
		<span className={TABLE_STYLES.villageBadge}>{name || "Chưa gán"}</span>
	);
};

/**
 * Component hiển thị ô số liệu căn phải có đơn vị nhỏ màu xám
 */
export const NumberCell: React.FC<{
	value: number | null | undefined;
	unit?: string;
	maxFractionDigits?: number;
}> = ({ value, unit, maxFractionDigits = 3 }) => {
	if (
		value === null ||
		value === undefined ||
		value === 0 ||
		Number.isNaN(Number(value))
	) {
		return <span className={TABLE_STYLES.emptyCell}>—</span>;
	}

	const formatted = formatTableNumber(value, maxFractionDigits);

	return (
		<span className="inline-flex items-baseline justify-end gap-1">
			<span className="font-mono tabular-nums text-[14px] text-slate-800 dark:text-slate-200 font-medium">
				{formatted}
			</span>
			{unit && (
				<span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
					{unit}
				</span>
			)}
		</span>
	);
};
