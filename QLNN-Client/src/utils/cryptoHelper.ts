/**
 * Helper mã hóa / hash client-side nếu cần
 */
export const cryptoHelper = {
  formatCurrency(val: number | null | undefined): string {
    if (val === null || val === undefined) return '0';
    return new Intl.NumberFormat('vi-VN').format(val);
  },

  formatArea(val: number | null | undefined): string {
    if (val === null || val === undefined || val === 0) return '-';
    return Number(val).toLocaleString('vi-VN', { maximumFractionDigits: 3 }) + ' ha';
  },

  formatCount(val: number | null | undefined, unit: string = 'con'): string {
    if (val === null || val === undefined || val === 0) return '-';
    return Number(val).toLocaleString('vi-VN') + ' ' + unit;
  },
};
