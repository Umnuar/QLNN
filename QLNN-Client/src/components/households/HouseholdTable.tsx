import React from 'react';
import {
  Edit3,
  Trash2,
  Trees,
  Dog,
  Fish,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { HouseholdFlat } from '../../types';
import { cryptoHelper } from '../../utils/cryptoHelper';

interface HouseholdTableProps {
  households: HouseholdFlat[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  onEdit: (hh: HouseholdFlat) => void;
  onDelete: (hh: HouseholdFlat) => void;
}

export const HouseholdTable: React.FC<HouseholdTableProps> = ({
  households,
  loading,
  total,
  page,
  limit,
  totalPages,
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete,
}) => {
  const villageColorMap: Record<string, string> = {
    'Thôn 1': 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800',
    'Thôn 2': 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800',
    'Thôn 3': 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800',
    'Thôn 4': 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800',
    'Thôn 5': 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800',
    'Thôn Đăk Kđêm': 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800',
    'Thôn Kon Bơ Bắn': 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/80 dark:text-teal-300 dark:border-teal-800',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors duration-200">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            {/* Top Multi-header row (Grouping categories) */}
            <tr className="bg-slate-100/90 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-b border-slate-200/90 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider">
              <th rowSpan={2} className="py-3 px-3.5 border-r border-slate-200/80 dark:border-slate-800 text-center w-12">
                STT
              </th>
              <th rowSpan={2} className="py-3 px-4 border-r border-slate-200/80 dark:border-slate-800 min-w-[190px]">
                Họ và Tên Chủ Hộ
              </th>
              <th rowSpan={2} className="py-3 px-3.5 border-r border-slate-200/80 dark:border-slate-800 min-w-[130px]">
                Thôn Quản Lý
              </th>

              {/* Nhóm Cây Trồng (12 chỉ số) */}
              <th
                colSpan={8}
                className="py-2.5 px-3 border-r border-slate-200/80 dark:border-slate-800 text-center bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300"
              >
                <div className="flex items-center justify-center gap-1.5 font-black text-xs">
                  <Trees className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>1. Cây Trồng Chính (ha)</span>
                </div>
              </th>

              {/* Nhóm Dược Liệu (4 loại) */}
              <th
                colSpan={4}
                className="py-2.5 px-3 border-r border-slate-200/80 dark:border-slate-800 text-center bg-teal-50/70 dark:bg-teal-950/40 text-teal-900 dark:text-teal-300"
              >
                <div className="flex items-center justify-center gap-1.5 font-black text-xs">
                  <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>2. Dược Liệu Đăk Hà (ha)</span>
                </div>
              </th>

              {/* Nhóm Vật Nuôi (4 loại) */}
              <th
                colSpan={4}
                className="py-2.5 px-3 border-r border-slate-200/80 dark:border-slate-800 text-center bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300"
              >
                <div className="flex items-center justify-center gap-1.5 font-black text-xs">
                  <Dog className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>3. Đàn Vật Nuôi (con)</span>
                </div>
              </th>

              {/* Nhóm Thủy Sản (2 loại) */}
              <th
                colSpan={2}
                className="py-2.5 px-3 border-r border-slate-200/80 dark:border-slate-800 text-center bg-sky-50/70 dark:bg-sky-950/40 text-sky-900 dark:text-sky-300"
              >
                <div className="flex items-center justify-center gap-1.5 font-black text-xs">
                  <Fish className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>4. Thủy Sản</span>
                </div>
              </th>

              <th rowSpan={2} className="py-3 px-3 text-center min-w-[90px] sticky right-0 bg-slate-100 dark:bg-slate-950 shadow-xs">
                Thao Tác
              </th>
            </tr>

            {/* Sub-header row (Individual 18 columns) */}
            <tr className="bg-slate-50 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-b border-slate-200/90 dark:border-slate-800 text-[11px] font-bold">
              {/* Cây chính */}
              <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Cà phê (Hộ)</th>
              <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Cà phê (Khoán)</th>
              <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Cao su (Hộ)</th>
              <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Cao su (Khoán)</th>
              <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Ăn quả</th>
              <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Mắc ca</th>
              <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Lúa nước</th>
              <th className="py-2 px-2 text-right border-r border-slate-200/80 dark:border-slate-800 whitespace-nowrap">Hàng năm</th>

              {/* Dược liệu */}
              <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Đinh lăng</th>
              <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Gừng</th>
              <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Nghệ</th>
              <th className="py-2 px-2 text-right border-r border-slate-200/80 dark:border-slate-800 whitespace-nowrap">Sả</th>

              {/* Vật nuôi */}
              <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Trâu</th>
              <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Bò</th>
              <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Heo</th>
              <th className="py-2 px-2 text-right border-r border-slate-200/80 dark:border-slate-800 whitespace-nowrap">Gia cầm</th>

              {/* Thủy sản */}
              <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Cá ao (ha)</th>
              <th className="py-2 px-2 text-right border-r border-slate-200/80 dark:border-slate-800 whitespace-nowrap">Cá lồng (lồng)</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {loading ? (
              <tr>
                <td colSpan={22} className="py-16 text-center text-slate-400 dark:text-slate-500">
                  <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-2" />
                  <span className="font-bold text-sm">Đang tải dữ liệu hộ nông nghiệp...</span>
                </td>
              </tr>
            ) : households.length === 0 ? (
              <tr>
                <td colSpan={22} className="py-16 text-center text-slate-400 dark:text-slate-500">
                  <div className="text-base font-bold text-slate-600 dark:text-slate-300">Không tìm thấy hộ nông nghiệp nào</div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Thử tìm kiếm với từ khóa khác hoặc nhập thêm hộ dân mới
                  </p>
                </td>
              </tr>
            ) : (
              households.map((hh, idx) => {
                const stt = (page - 1) * limit + idx + 1;
                const villageColor =
                  villageColorMap[hh.village_name || ''] ||
                  'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

                return (
                  <tr
                    key={hh.id}
                    className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/60 transition-colors group text-[13.5px]"
                  >
                    {/* STT */}
                    <td className="py-3 px-3.5 border-r border-slate-100 dark:border-slate-800/60 text-center font-mono font-bold text-slate-500 dark:text-slate-400">
                      {stt}
                    </td>

                    {/* Họ và Tên */}
                    <td className="py-3 px-4 border-r border-slate-100 dark:border-slate-800/60 font-bold text-[14px] text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {hh.full_name}
                      {hh.notes && (
                        <div className="text-[11px] font-normal text-slate-400 dark:text-slate-500 truncate max-w-[190px]">
                          {hh.notes}
                        </div>
                      )}
                    </td>

                    {/* Thôn Quản Lý */}
                    <td className="py-3 px-3.5 border-r border-slate-100 dark:border-slate-800/60 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${villageColor}`}>
                        {hh.village_name || 'Chưa gán'}
                      </span>
                    </td>

                    {/* Cây Trồng (12 cột) */}
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {cryptoHelper.formatArea(hh.cafe_household)}
                    </td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {cryptoHelper.formatArea(hh.cafe_contracted)}
                    </td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {cryptoHelper.formatArea(hh.rubber_household)}
                    </td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {cryptoHelper.formatArea(hh.rubber_contracted)}
                    </td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {cryptoHelper.formatArea(hh.fruit_tree)}
                    </td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {cryptoHelper.formatArea(hh.macadamia)}
                    </td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {cryptoHelper.formatArea(hh.wet_rice)}
                    </td>
                    <td className="py-3 px-2 text-right border-r border-slate-200/80 dark:border-slate-800 font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {cryptoHelper.formatArea(hh.other_annual_crops)}
                    </td>

                    {/* Dược Liệu (4 cột) */}
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200 bg-teal-50/20 dark:bg-teal-950/20">
                      {cryptoHelper.formatArea(hh.herb_dinh_lang)}
                    </td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200 bg-teal-50/20 dark:bg-teal-950/20">
                      {cryptoHelper.formatArea(hh.herb_gung)}
                    </td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200 bg-teal-50/20 dark:bg-teal-950/20">
                      {cryptoHelper.formatArea(hh.herb_nghe)}
                    </td>
                    <td className="py-3 px-2 text-right border-r border-slate-200/80 dark:border-slate-800 font-mono tabular-nums text-slate-800 dark:text-slate-200 bg-teal-50/20 dark:bg-teal-950/20">
                      {cryptoHelper.formatArea(hh.herb_sa)}
                    </td>

                    {/* Vật Nuôi (4 cột) */}
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {hh.buffalo || '-'}
                    </td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {hh.cow || '-'}
                    </td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {hh.pig || '-'}
                    </td>
                    <td className="py-3 px-2 text-right border-r border-slate-200/80 dark:border-slate-800 font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {hh.poultry || '-'}
                    </td>

                    {/* Thủy Sản (2 cột) */}
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {cryptoHelper.formatArea(hh.fish_pond)}
                    </td>
                    <td className="py-3 px-2 text-right border-r border-slate-200/80 dark:border-slate-800 font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {hh.fish_cage ? `${hh.fish_cage} lồng` : '-'}
                    </td>

                    {/* Thao Tác (Actions) */}
                    <td className="py-3 px-3 text-center sticky right-0 bg-white dark:bg-slate-900 group-hover:bg-emerald-50/70 dark:group-hover:bg-slate-800 transition-colors shadow-xs">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(hh)}
                          title="Sửa số liệu hộ này"
                          className="p-1.5 text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950 rounded-xl transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(hh)}
                          title="Xóa hộ này"
                          className="p-1.5 text-slate-400 hover:text-rose-700 dark:text-slate-400 dark:hover:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950 rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-slate-50/90 dark:bg-slate-950/80 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-slate-600 dark:text-slate-300 font-medium">
          Hiển thị <strong className="text-slate-900 dark:text-white font-bold">{households.length}</strong> /{' '}
          <strong className="text-slate-900 dark:text-white font-bold">{total}</strong> hộ nông nghiệp
        </div>

        <div className="flex items-center gap-3">
          {/* Limit selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Số dòng:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
            >
              <option value={10}>10 dòng</option>
              <option value={20}>20 dòng</option>
              <option value={50}>50 dòng</option>
              <option value={100}>100 dòng</option>
            </select>
          </div>

          {/* Page controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
              {page} / {totalPages || 1}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
