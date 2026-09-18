import React from 'react';
import {
  Trash2,
} from 'lucide-react';
import { HouseholdFlat } from '../../types';
import { cryptoHelper } from '../../utils/cryptoHelper';
import { TablePagination } from '../common/TablePagination';

interface HouseholdTableProps {
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
  readOnly?: boolean;
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

export const RecycleBinTable: React.FC<HouseholdTableProps> = ({
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  readOnly = false,
  households,
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
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors duration-150">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          {/* ========================================================================= */}
          {/* 6. VIEW MODE: FULL (21 CỘT ĐẦY ĐỦ MA TRẬN) */}
          {/* ========================================================================= */}
                <thead>
                <tr className="bg-slate-100/90 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-b border-slate-200/90 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider">
                  <th rowSpan={2} className="py-3 px-2 text-center w-10 border-r border-slate-200/80 dark:border-slate-800"><input type="checkbox" className="w-4 h-4 cursor-pointer accent-emerald-600 rounded" checked={households.length > 0 && selectedIds.length === households.length} onChange={() => onToggleSelectAll && onToggleSelectAll()} /></th>
                  <th rowSpan={2} className="py-3 px-3.5 border-r border-slate-200/80 dark:border-slate-800 text-center w-12 whitespace-nowrap">STT</th>
                  <th rowSpan={2} className="py-3 px-4 border-r border-slate-200/80 dark:border-slate-800 min-w-[190px] whitespace-nowrap">Họ và Tên Chủ Hộ</th>
                  <th rowSpan={2} className="py-3 px-3.5 border-r border-slate-200/80 dark:border-slate-800 min-w-[130px] whitespace-nowrap">Thôn Quản Lý</th>

                  <th colSpan={8} className="py-2.5 px-3 border-r border-slate-200/80 dark:border-slate-800 text-center bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 whitespace-nowrap">
                    1. Cây Trồng Chính (ha)
                  </th>
                  <th colSpan={4} className="py-2.5 px-3 border-r border-slate-200/80 dark:border-slate-800 text-center bg-teal-50/70 dark:bg-teal-950/40 text-teal-900 dark:text-teal-300 whitespace-nowrap">
                    2. Dược Liệu Đăk Hà (ha)
                  </th>
                  <th colSpan={4} className="py-2.5 px-3 border-r border-slate-200/80 dark:border-slate-800 text-center bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 whitespace-nowrap">
                    3. Đàn Vật Nuôi (con)
                  </th>
                  <th colSpan={2} className="py-2.5 px-3 border-r border-slate-200/80 dark:border-slate-800 text-center bg-sky-50/70 dark:bg-sky-950/40 text-sky-900 dark:text-sky-300 whitespace-nowrap">
                    4. Thủy Sản
                  </th>
                  <th rowSpan={2} className="py-3 px-3 text-center min-w-[90px] sticky right-0 z-20 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] bg-slate-100 dark:bg-slate-950 shadow-xs whitespace-nowrap">Thao Tác</th>
                </tr>

                <tr className="bg-slate-50 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-b border-slate-200/90 dark:border-slate-800 text-[11px] font-bold">
                  <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Cà phê (Hộ)</th>
                  <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Cà phê (Khoán)</th>
                  <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Cao su (Hộ)</th>
                  <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Cao su (Khoán)</th>
                  <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Ăn quả</th>
                  <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Mắc ca</th>
                  <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Lúa nước</th>
                  <th className="py-2 px-2 text-right border-r border-slate-200/80 dark:border-slate-800 whitespace-nowrap">Hàng năm</th>

                  <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Đinh lăng</th>
                  <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Gừng</th>
                  <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Nghệ</th>
                  <th className="py-2 px-2 text-right border-r border-slate-200/80 dark:border-slate-800 whitespace-nowrap">Sả</th>

                  <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Trâu</th>
                  <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Bò</th>
                  <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Heo</th>
                  <th className="py-2 px-2 text-right border-r border-slate-200/80 dark:border-slate-800 whitespace-nowrap">Gia cầm</th>

                  <th className="py-2 px-2 text-right border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">Cá ao (ha)</th>
                  <th className="py-2 px-2 text-right border-r border-slate-200/80 dark:border-slate-800 whitespace-nowrap">Cá lồng (lồng)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {households.map((hh, idx) => (
                  <tr
                    key={hh.id}
                    onDoubleClick={() => !readOnly && onEdit(hh)}
                    className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/60 transition-colors text-[13.5px]"
                  >
                    <td className="py-3 px-2 border-r border-slate-100 dark:border-slate-800/60 text-center sticky left-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)] transition-colors"><input type="checkbox" className="w-4 h-4 cursor-pointer accent-emerald-600 rounded" checked={selectedIds.includes(hh.id!)} onChange={() => onToggleSelect && onToggleSelect(hh.id!)} onClick={(e) => e.stopPropagation()} /></td>
                    <td className="py-3 px-3.5 border-r border-slate-100 dark:border-slate-800/60 text-center font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">{(page - 1) * limit + idx + 1}</td>
                    <td className="py-3 px-4 border-r border-slate-100 dark:border-slate-800/60 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">{hh.full_name}</td>
                    <td className="py-3 px-3.5 border-r border-slate-100 dark:border-slate-800/60 whitespace-nowrap"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${villageColorMap[hh.village_name || '']}`}>{hh.village_name}</span></td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200 whitespace-nowrap">{cryptoHelper.formatArea(hh.cafe_household)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200 whitespace-nowrap">{cryptoHelper.formatArea(hh.cafe_contracted)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200 whitespace-nowrap">{cryptoHelper.formatArea(hh.rubber_household)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200 whitespace-nowrap">{cryptoHelper.formatArea(hh.rubber_contracted)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200 whitespace-nowrap">{cryptoHelper.formatArea(hh.fruit_tree)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200 whitespace-nowrap">{cryptoHelper.formatArea(hh.macadamia)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200 whitespace-nowrap">{cryptoHelper.formatArea(hh.wet_rice)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-200/80 dark:border-slate-800 font-mono tabular-nums text-slate-800 dark:text-slate-200 whitespace-nowrap">{cryptoHelper.formatArea(hh.other_annual_crops)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200 bg-teal-50/20 dark:bg-teal-950/20 whitespace-nowrap">{cryptoHelper.formatArea(hh.herb_dinh_lang)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200 bg-teal-50/20 dark:bg-teal-950/20 whitespace-nowrap">{cryptoHelper.formatArea(hh.herb_gung)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200 bg-teal-50/20 dark:bg-teal-950/20 whitespace-nowrap">{cryptoHelper.formatArea(hh.herb_nghe)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-200/80 dark:border-slate-800 font-mono tabular-nums text-slate-800 dark:text-slate-200 bg-teal-50/20 dark:bg-teal-950/20 whitespace-nowrap">{cryptoHelper.formatArea(hh.herb_sa)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200 whitespace-nowrap">{hh.buffalo || '-'}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200 whitespace-nowrap">{hh.cow || '-'}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200 whitespace-nowrap">{hh.pig || '-'}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-200/80 dark:border-slate-800 font-mono tabular-nums text-slate-800 dark:text-slate-200 whitespace-nowrap">{hh.poultry || '-'}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200 whitespace-nowrap">{cryptoHelper.formatArea(hh.fish_pond)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-200/80 dark:border-slate-800 font-mono tabular-nums text-slate-800 dark:text-slate-200 whitespace-nowrap">{hh.fish_cage ? `${hh.fish_cage} lồng` : '-'}</td>
                    <td className="py-3 px-3 text-center sticky right-0 z-10 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors whitespace-nowrap"><button type="button" onClick={() => onDelete(hh)} aria-label="Xóa hộ" className="p-1.5 text-slate-400 hover:text-rose-700 cursor-pointer"><Trash2 className="w-4 h-4" strokeWidth={1.5} /></button></td>
                  </tr>
                ))}
              </tbody>
        </table>
      </div>

      <TablePagination
        itemCount={households.length}
        total={total}
        page={page}
        limit={limit}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </div>
  );
};
