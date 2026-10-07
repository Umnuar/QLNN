/**
 * Helper định dạng số liệu diện tích, đàn vật nuôi, tiền tệ theo chuẩn Việt Nam (vi-VN).
 * Tách biệt hoàn toàn khỏi logic mã hóa bảo mật để đảm bảo nguyên lý Single Responsibility (SRP).
 */

/**
 * Định dạng số thông thường với dấu phân cách phần nghìn
 */
export function formatNumber(
	val: number | null | undefined,
	maxFractionDigits: number = 3,
): string {
	if (val === null || val === undefined || Number.isNaN(Number(val)))
		return "0";
	return Number(val).toLocaleString("vi-VN", {
		maximumFractionDigits: maxFractionDigits,
	});
}

/**
 * Định dạng tiền tệ theo chuẩn vi-VN (VNĐ)
 */
export function formatCurrency(val: number | null | undefined): string {
	if (val === null || val === undefined || Number.isNaN(Number(val)))
		return "0";
	return new Intl.NumberFormat("vi-VN").format(Number(val));
}

/**
 * Định dạng diện tích cây trồng / ao hồ (ha) với tối đa 3 chữ số thập phân
 */
export function formatArea(
	val: number | null | undefined,
	withUnit: boolean = true,
): string {
	if (
		val === null ||
		val === undefined ||
		val === 0 ||
		Number.isNaN(Number(val))
	) {
		return withUnit ? "0 ha" : "0";
	}
	const formatted = Number(val).toLocaleString("vi-VN", {
		maximumFractionDigits: 3,
	});
	return withUnit ? `${formatted} ha` : formatted;
}

/**
 * Định dạng số lượng vật nuôi / lồng bè thủy sản kèm đơn vị tính
 */
export function formatCount(
	val: number | null | undefined,
	unit?: string,
): string {
	if (
		val === null ||
		val === undefined ||
		val === 0 ||
		Number.isNaN(Number(val))
	) {
		return unit ? `0 ${unit}` : "0";
	}
	const formatted = Number(val).toLocaleString("vi-VN");
	return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Gom nhóm các hàm formatters thành một namespace object tiện ích
 */
export const numberFormatters = {
	formatNumber,
	formatCurrency,
	formatArea,
	formatCount,
};
