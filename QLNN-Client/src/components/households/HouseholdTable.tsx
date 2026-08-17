import React from 'react';
import {
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  SearchX,
} from 'lucide-react';
import { HouseholdFlat } from '../../types';
import { useApp } from '../../AppContext';
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
  onEdit: (household: HouseholdFlat) => void;
  onDelete: (household: HouseholdFlat) => void;
}

// Function sinh màu riêng cho 7 thôn
const getVillageBadgeStyle = (villageName?: string) => {
  const name = (villageName || '').toLowerCase();
  if (name.includes('thôn 1') || name.includes('thon 1')) {
    return 'bg-blue-50 text-blue-700 border-blue-200';
  }
  if (name.includes('thôn 2') || name.includes('thon 2')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (name.includes('thôn 3') || name.includes('thon 3')) {
    return 'bg-violet-50 text-violet-700 border-violet-200';
  }
  if (name.includes('thôn 4') || name.includes('thon 4')) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  if (name.includes('long loi') || name.includes('longloi')) {
    return 'bg-teal-50 text-teal-700 border-teal-200';
  }
  if (name.includes('tu dô 1') || name.includes('tudo 1') || name.includes('tu do 1')) {
    return 'bg-rose-50 text-rose-700 border-rose-200';
  }
  if (name.includes('tu dô 2') || name.includes('tudo 2') || name.includes('tu do 2')) {
    return 'bg-purple-50 text-purple-700 border-purple-200';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

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
  const { user } = useApp();

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* Table Container */}
      <div className="overflow-x-auto min-h-[360px] relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10 animate-in fade-in duration-150">
            <div className="flex flex-col items-center gap-2">
              <div className="w-9 h-9 border-3 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
              <span className="text-xs font-bold text-slate-600">Đang tải danh sách hộ nông nghiệp...</span>
            </div>
          </div>
        )}

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/90 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <th className="py-3.5 px-4 w-12 text-center">STT</th>
              <th className="py-3.5 px-4 min-w-[180px]">Họ Và Tên Chủ Hộ</th>
              {user?.role === 'admin' && (
                <th className="py-3.5 px-4 min-w-[140px]">Thôn Quản Lý</th>
              )}
              <th className="py-3.5 px-4 min-w-[130px] text-right">Tổng Cây Trồng (ha)</th>
              <th className="py-3.5 px-4 min-w-[130px] text-right">Tổng Vật Nuôi (con)</th>
              <th className="py-3.5 px-4 min-w-[130px] text-right">Thủy Sản</th>
              <th className="py-3.5 px-4 min-w-[120px]">Ghi Chú</th>
              <th className="py-3.5 px-4 w-28 text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {households.length === 0 && !loading ? (
              <tr>
                <td colSpan={user?.role === 'admin' ? 8 : 7} className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-14 h-14 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                      <SearchX className="w-7 h-7" />
                    </div>
                    <div className="text-sm font-black text-slate-700">Không tìm thấy hộ nông nghiệp nào</div>
                    <p className="text-xs text-slate-500 mt-1">
                      Thử thay đổi từ khóa tìm kiếm hoặc bấm nút "Thêm Hộ Dân" / "Nhập Excel" để bổ sung số liệu.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              households.map((h, idx) => {
                const stt = (page - 1) * limit + idx + 1;
                const cropTotal =
                  (h.cafe_household ?? 0) +
                  (h.cafe_contracted ?? 0) +
                  (h.rubber_household ?? 0) +
                  (h.rubber_contracted ?? 0) +
                  (h.fruit_tree ?? 0) +
                  (h.macadamia ?? 0) +
                  (h.herb_dinh_lang ?? 0) +
                  (h.herb_gung ?? 0) +
                  (h.herb_nghe ?? 0) +
                  (h.herb_sa ?? 0) +
                  (h.wet_rice ?? 0) +
                  (h.other_annual_crops ?? 0);

                const animalTotal =
                  (h.buffalo ?? 0) +
                  (h.cow ?? 0) +
                  (h.pig ?? 0) +
                  (h.poultry ?? 0);

                const aquaParts: string[] = [];
                if (h.fish_pond && h.fish_pond > 0) aquaParts.push(cryptoHelper.formatArea(h.fish_pond));
                if (h.fish_cage && h.fish_cage > 0) aquaParts.push(cryptoHelper.formatCount(h.fish_cage, 'lồng'));
                const aquaSummary = aquaParts.length > 0 ? aquaParts.join(' • ') : '-';

                return (
                  <tr
                    key={h.id || idx}
                    onClick={() => onEdit(h)}
                    className="hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                  >
                    {/* STT */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-400 font-mono text-[11px]">
                      {stt}
                    </td>

                    {/* Họ và tên */}
                    <td className="py-3.5 px-4">
                      <div className="font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {h.full_name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Kê khai đầy đủ 18 chỉ số
                      </div>
                    </td>

                    {/* Thôn (Chỉ hiện cho Admin) */}
                    {user?.role === 'admin' && (
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getVillageBadgeStyle(
                            h.village_name
                          )}`}
                        >
                          {h.village_name || 'Thôn'}
                        </span>
                      </td>
                    )}

                    {/* Tổng Cây Trồng */}
                    <td className="py-3.5 px-4 text-right">
                      {cropTotal > 0 ? (
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-50/90 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block tabular-nums">
                          {cryptoHelper.formatArea(cropTotal)}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Tổng Vật Nuôi */}
                    <td className="py-3.5 px-4 text-right">
                      {animalTotal > 0 ? (
                        <span className="font-mono font-bold text-amber-800 bg-amber-50/90 px-2.5 py-1 rounded-lg border border-amber-200 inline-block tabular-nums">
                          {cryptoHelper.formatCount(animalTotal, 'con')}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Thủy Sản */}
                    <td className="py-3.5 px-4 text-right">
                      {aquaSummary !== '-' ? (
                        <span className="font-mono font-bold text-sky-800 bg-sky-50/90 px-2.5 py-1 rounded-lg border border-sky-200 inline-block tabular-nums">
                          {aquaSummary}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Ghi chú */}
                    <td className="py-3.5 px-4">
                      <span className="text-slate-500 text-[11px] line-clamp-1 italic">
                        {h.notes || '-'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(h);
                          }}
                          title="Sửa số liệu hộ này"
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all active:scale-95 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(h);
                          }}
                          title="Xóa hộ khỏi danh sách"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-95 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
      <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <span>
            Hiển thị <strong className="text-slate-800 font-mono">{households.length}</strong> / <strong className="text-slate-800 font-mono">{total}</strong> hộ nông nghiệp
          </span>

          <div className="flex items-center gap-1.5">
            <span>Dòng/trang:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Page Nav */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Trước</span>
          </button>

          <span className="px-3 py-1 text-xs font-black text-slate-700 font-mono">
            {page} / {totalPages || 1}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <span>Sau</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
