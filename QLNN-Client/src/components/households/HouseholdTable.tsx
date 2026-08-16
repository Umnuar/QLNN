import React from 'react';
import { Edit2, Trash2, Trees, Dog, Fish, ChevronLeft, ChevronRight } from 'lucide-react';
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

export const getHouseholdCropTotal = (h: HouseholdFlat): number => {
  const sum =
    (h.cafe_household || 0) +
    (h.cafe_contracted || 0) +
    (h.rubber_household || 0) +
    (h.rubber_contracted || 0) +
    (h.fruit_tree || 0) +
    (h.macadamia || 0) +
    (h.herb_dinh_lang || 0) +
    (h.herb_gung || 0) +
    (h.herb_nghe || 0) +
    (h.herb_sa || 0) +
    (h.wet_rice || 0) +
    (h.other_annual_crops || 0);
  return Math.round(sum * 1000) / 1000;
};

export const getHouseholdLivestockTotal = (h: HouseholdFlat): number => {
  return (h.buffalo || 0) + (h.cow || 0) + (h.pig || 0) + (h.poultry || 0);
};

export const getHouseholdAquaSummary = (h: HouseholdFlat): string => {
  const parts: string[] = [];
  if (h.fish_pond && h.fish_pond > 0) parts.push(`${h.fish_pond} ha`);
  if (h.fish_cage && h.fish_cage > 0) parts.push(`${h.fish_cage} lồng`);
  return parts.length > 0 ? parts.join(', ') : '-';
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Table responsive container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 w-14 text-center">STT</th>
              <th className="py-3.5 px-4">Họ và Tên Chủ Hộ</th>
              {user?.role === 'admin' && <th className="py-3.5 px-4">Thôn</th>}
              <th className="py-3.5 px-4">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Trees className="w-3.5 h-3.5" />
                  <span>Tổng Cây Trồng</span>
                </div>
              </th>
              <th className="py-3.5 px-4">
                <div className="flex items-center gap-1.5 text-amber-700">
                  <Dog className="w-3.5 h-3.5" />
                  <span>Tổng Vật Nuôi</span>
                </div>
              </th>
              <th className="py-3.5 px-4">
                <div className="flex items-center gap-1.5 text-sky-700">
                  <Fish className="w-3.5 h-3.5" />
                  <span>Thủy Sản</span>
                </div>
              </th>
              <th className="py-3.5 px-4 max-w-xs">Ghi Chú</th>
              <th className="py-3.5 px-4 w-24 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {loading ? (
              <tr>
                <td
                  colSpan={user?.role === 'admin' ? 8 : 7}
                  className="py-12 text-center text-slate-400"
                >
                  <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2" />
                  <div>Đang tải dữ liệu hộ nông nghiệp...</div>
                </td>
              </tr>
            ) : households.length === 0 ? (
              <tr>
                <td
                  colSpan={user?.role === 'admin' ? 8 : 7}
                  className="py-12 text-center text-slate-400"
                >
                  Chưa có dữ liệu hộ nông nghiệp nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              households.map((h, idx) => {
                const cropTotal = getHouseholdCropTotal(h);
                const animalTotal = getHouseholdLivestockTotal(h);
                const aquaSummary = getHouseholdAquaSummary(h);

                return (
                  <tr
                    key={h.id || idx}
                    onClick={() => onEdit(h)}
                    className="hover:bg-emerald-50/40 cursor-pointer transition-colors group"
                  >
                    {/* STT */}
                    <td className="py-3 px-4 text-center font-bold text-slate-500">
                      {h.stt || (page - 1) * limit + idx + 1}
                    </td>

                    {/* Họ và tên */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {h.full_name}
                      </span>
                    </td>

                    {/* Thôn (Admin only) */}
                    {user?.role === 'admin' && (
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {h.village_name || 'Thôn'}
                        </span>
                      </td>
                    )}

                    {/* Tổng Cây Trồng */}
                    <td className="py-3 px-4">
                      {cropTotal > 0 ? (
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {cryptoHelper.formatArea(cropTotal)}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Tổng Vật Nuôi */}
                    <td className="py-3 px-4">
                      {animalTotal > 0 ? (
                        <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {cryptoHelper.formatCount(animalTotal, 'con')}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Thủy Sản */}
                    <td className="py-3 px-4">
                      {aquaSummary !== '-' ? (
                        <span className="font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                          {aquaSummary}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Ghi chú */}
                    <td className="py-3 px-4 text-slate-500 truncate max-w-xs" title={h.notes || ''}>
                      {h.notes || '-'}
                    </td>

                    {/* Thao tác */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(h)}
                          title="Sửa thông tin hộ"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(h)}
                          title="Xóa hộ này"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

      {/* Pagination Bar */}
      <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>
            Hiển thị <b>{households.length}</b> / <b>{total}</b> hộ dân
          </span>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <span>Dòng/trang:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="px-2 py-1 bg-white border border-slate-300 rounded-md font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span>
            Trang <b>{page}</b> / <b>{totalPages || 1}</b>
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || loading}
              className="p-1.5 border border-slate-300 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || loading}
              className="p-1.5 border border-slate-300 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
