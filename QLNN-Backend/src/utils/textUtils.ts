/**
 * Chuẩn hóa tiếng Việt: Bỏ dấu, chuyển chữ thường, loại bỏ khoảng trắng thừa.
 */
export function removeAccents(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Chuẩn hóa họ tên để đối chiếu so sánh: Chữ thường, khoảng trắng đơn.
 */
export function normalizeFullName(name: string): string {
  if (!name) return '';
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}
