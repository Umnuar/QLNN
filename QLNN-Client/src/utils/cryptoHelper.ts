/**
 * Helper định dạng số liệu diện tích, đàn vật nuôi, tiền tệ
 */
export const cryptoHelper = {
  formatCurrency(val: number | null | undefined): string {
    if (val === null || val === undefined) return '0';
    return new Intl.NumberFormat('vi-VN').format(val);
  },

  formatArea(val: number | null | undefined, withUnit: boolean = true): string {
    if (val === null || val === undefined || val === 0) return withUnit ? '0 ha' : '0';
    const formatted = Number(val).toLocaleString('vi-VN', { maximumFractionDigits: 3 });
    return withUnit ? `${formatted} ha` : formatted;
  },

  formatCount(val: number | null | undefined, unit?: string): string {
    if (val === null || val === undefined || val === 0) return unit ? `0 ${unit}` : '0';
    const formatted = Number(val).toLocaleString('vi-VN');
    return unit ? `${formatted} ${unit}` : formatted;
  },
};
