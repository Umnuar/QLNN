import React, { useState } from 'react';
import {
  Edit3,
  Trash2,
  Trees,
  Dog,
  Fish,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  LayoutGrid,
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

type ViewMode = 'overview' | 'crops' | 'herbs' | 'livestock' | 'aquaculture' | 'full';

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
  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  const villageColorMap: Record<string, string> = {
    'Thôn 1': 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800',
    'Thôn 2': 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800',
    'Thôn 3': 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800',
    'Thôn 4': 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800',
    'Thôn 5': 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800',
    'Thôn Đăk Kđêm': 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800',
    'Thôn Kon Bơ Bắn': 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/80 dark:text-teal-300 dark:border-teal-800',
  };

  // Helper tính toán tổng hợp cho từng hộ dân
  const computeHouseholdSummary = (hh: HouseholdFlat) => {
    const totalCrops =
      (hh.cafe_household || 0) +
      (hh.cafe_contracted || 0) +
      (hh.rubber_household || 0) +
      (hh.rubber_contracted || 0) +
      (hh.fruit_tree || 0) +
      (hh.macadamia || 0) +
      (hh.herb_dinh_lang || 0) +
      (hh.herb_gung || 0) +
      (hh.herb_nghe || 0) +
      (hh.herb_sa || 0) +
      (hh.wet_rice || 0) +
      (hh.other_annual_crops || 0);

    const totalHerbs =
      (hh.herb_dinh_lang || 0) +
      (hh.herb_gung || 0) +
      (hh.herb_nghe || 0) +
      (hh.herb_sa || 0);

    const totalAnimals =
      (hh.buffalo || 0) +
      (hh.cow || 0) +
      (hh.pig || 0) +
      (hh.poultry || 0);

    return { totalCrops, totalHerbs, totalAnimals };
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors duration-200">
      {/* Top Segmented Views Bar */}
      <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-800/80 rounded-2xl border border-slate-300/60 dark:border-slate-700/60 flex-wrap">
          {/* Tab 1: Tổng hợp */}
          <button
            type="button"
            onClick={() => setViewMode('overview')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'overview'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>⚡ Tổng Hợp (7 Cột)</span>
          </button>

          {/* Tab 2: Cây trồng */}
          <button
            type="button"
            onClick={() => setViewMode('crops')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'crops'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <Trees className="w-3.5 h-3.5" />
            <span>Cây Trồng (8)</span>
          </button>

          {/* Tab 3: Dược liệu */}
          <button
            type="button"
            onClick={() => setViewMode('herbs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'herbs'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dược Liệu (4)</span>
          </button>

          {/* Tab 4: Vật nuôi */}
          <button
            type="button"
            onClick={() => setViewMode('livestock')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'livestock'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <Dog className="w-3.5 h-3.5" />
            <span>Vật Nuôi (4)</span>
          </button>

          {/* Tab 5: Thủy sản */}
          <button
            type="button"
            onClick={() => setViewMode('aquaculture')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'aquaculture'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <Fish className="w-3.5 h-3.5" />
            <span>Thủy Sản (2)</span>
          </button>

          {/* Tab 6: 21 cột đầy đủ */}
          <button
            type="button"
            onClick={() => setViewMode('full')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'full'
                ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Ma Trận 21 Cột</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2">
          💡 <span className="hidden sm:inline">Mẹo: Bấm đúp vào dòng để xem & sửa nhanh 18 chỉ số</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          {/* ========================================================================= */}
          {/* 1. VIEW MODE: OVERVIEW (7 CỘT GỌN GÀNG - KHÔNG CUỘN NGANG) */}
          {/* ========================================================================= */}
          {viewMode === 'overview' && (
            <>
              <thead>
                <tr className="bg-slate-100/90 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-b border-slate-200/90 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider">
                  <th className="py-3 px-3.5 text-center w-12 border-r border-slate-200/80 dark:border-slate-800">STT</th>
                  <th className="py-3 px-4 min-w-[200px] border-r border-slate-200/80 dark:border-slate-800">Họ và Tên Chủ Hộ</th>
                  <th className="py-3 px-3.5 min-w-[130px] border-r border-slate-200/80 dark:border-slate-800">Thôn Quản Lý</th>
                  <th className="py-3 px-3 text-right border-r border-slate-200/80 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300">
                    Tổng Cây Trồng (ha)
                  </th>
                  <th className="py-3 px-3 text-right border-r border-slate-200/80 dark:border-slate-800 bg-teal-50/50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-300">
                    Dược Liệu (ha)
                  </th>
                  <th className="py-3 px-3 text-right border-r border-slate-200/80 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300">
                    Vật Nuôi (con)
                  </th>
                  <th className="py-3 px-3 text-right border-r border-slate-200/80 dark:border-slate-800 bg-sky-50/50 dark:bg-sky-950/30 text-sky-900 dark:text-sky-300">
                    Thủy Sản
                  </th>
                  <th className="py-3 px-3 text-center min-w-[90px] sticky right-0 bg-slate-100 dark:bg-slate-950 shadow-xs">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400 dark:text-slate-500">
                      <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-2" />
                      <span className="font-bold text-sm">Đang tải dữ liệu hộ nông nghiệp...</span>
                    </td>
                  </tr>
                ) : households.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400 dark:text-slate-500">
                      <div className="text-base font-bold text-slate-600 dark:text-slate-300">Không tìm thấy hộ nông nghiệp nào</div>
                    </td>
                  </tr>
                ) : (
                  households.map((hh, idx) => {
                    const stt = (page - 1) * limit + idx + 1;
                    const { totalCrops, totalHerbs, totalAnimals } = computeHouseholdSummary(hh);
                    const villageColor =
                      villageColorMap[hh.village_name || ''] ||
                      'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

                    return (
                      <tr
                        key={hh.id}
                        onDoubleClick={() => onEdit(hh)}
                        className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/60 transition-colors group text-[13.5px] cursor-pointer"
                        title="Bấm đúp để sửa số liệu hộ này"
                      >
                        <td className="py-3.5 px-3.5 border-r border-slate-100 dark:border-slate-800/60 text-center font-mono font-bold text-slate-500 dark:text-slate-400">
                          {stt}
                        </td>
                        <td className="py-3.5 px-4 border-r border-slate-100 dark:border-slate-800/60 font-bold text-[14px] text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {hh.full_name}
                          {hh.notes && (
                            <div className="text-[11px] font-normal text-slate-400 dark:text-slate-500 truncate max-w-[200px]">
                              {hh.notes}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3.5 border-r border-slate-100 dark:border-slate-800/60 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${villageColor}`}>
                            {hh.village_name || 'Chưa gán'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums font-bold text-emerald-700 dark:text-emerald-400">
                          {cryptoHelper.formatArea(totalCrops)}
                        </td>
                        <td className="py-3.5 px-3 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums font-bold text-teal-700 dark:text-teal-400">
                          {cryptoHelper.formatArea(totalHerbs)}
                        </td>
                        <td className="py-3.5 px-3 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums font-bold text-amber-700 dark:text-amber-400">
                          {totalAnimals > 0 ? `${totalAnimals} con` : '-'}
                        </td>
                        <td className="py-3.5 px-3 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200">
                          {hh.fish_pond ? cryptoHelper.formatArea(hh.fish_pond) : hh.fish_cage ? `${hh.fish_cage} lồng` : '-'}
                        </td>
                        <td className="py-3.5 px-3 text-center sticky right-0 bg-white dark:bg-slate-900 group-hover:bg-emerald-50/70 dark:group-hover:bg-slate-800 transition-colors shadow-xs">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(hh);
                              }}
                              aria-label={`Sửa số liệu hộ ${hh.full_name}`}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950 rounded-xl transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(hh);
                              }}
                              aria-label={`Xóa hộ ${hh.full_name}`}
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
            </>
          )}

          {/* ========================================================================= */}
          {/* 2. VIEW MODE: CROPS (8 CHỈ SỐ CÂY TRỒNG CHÍNH) */}
          {/* ========================================================================= */}
          {viewMode === 'crops' && (
            <>
              <thead>
                <tr className="bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-200 border-b border-emerald-200 dark:border-emerald-800 text-[11px] font-black uppercase tracking-wider">
                  <th className="py-3 px-3.5 text-center w-12 border-r border-emerald-200 dark:border-emerald-800">STT</th>
                  <th className="py-3 px-4 min-w-[180px] border-r border-emerald-200 dark:border-emerald-800">Họ và Tên Chủ Hộ</th>
                  <th className="py-3 px-3.5 border-r border-emerald-200 dark:border-emerald-800">Thôn</th>
                  <th className="py-3 px-2 text-right border-r border-emerald-200 dark:border-emerald-800">Cà phê (Hộ)</th>
                  <th className="py-3 px-2 text-right border-r border-emerald-200 dark:border-emerald-800">Cà phê (Khoán)</th>
                  <th className="py-3 px-2 text-right border-r border-emerald-200 dark:border-emerald-800">Cao su (Hộ)</th>
                  <th className="py-3 px-2 text-right border-r border-emerald-200 dark:border-emerald-800">Cao su (Khoán)</th>
                  <th className="py-3 px-2 text-right border-r border-emerald-200 dark:border-emerald-800">Ăn Quả</th>
                  <th className="py-3 px-2 text-right border-r border-emerald-200 dark:border-emerald-800">Mắc Ca</th>
                  <th className="py-3 px-2 text-right border-r border-emerald-200 dark:border-emerald-800">Lúa Nước</th>
                  <th className="py-3 px-2 text-right border-r border-emerald-200 dark:border-emerald-800">Hàng Năm</th>
                  <th className="py-3 px-3 text-center min-w-[90px] sticky right-0 bg-emerald-100 dark:bg-emerald-950">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {households.map((hh, idx) => (
                  <tr
                    key={hh.id}
                    onDoubleClick={() => onEdit(hh)}
                    className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/60 transition-colors text-[13.5px]"
                  >
                    <td className="py-3 px-3.5 text-center font-mono text-slate-500 dark:text-slate-400">{(page - 1) * limit + idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">{hh.full_name}</td>
                    <td className="py-3 px-3.5 whitespace-nowrap"><span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${villageColorMap[hh.village_name || '']}`}>{hh.village_name}</span></td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">{cryptoHelper.formatArea(hh.cafe_household)}</td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">{cryptoHelper.formatArea(hh.cafe_contracted)}</td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">{cryptoHelper.formatArea(hh.rubber_household)}</td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">{cryptoHelper.formatArea(hh.rubber_contracted)}</td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">{cryptoHelper.formatArea(hh.fruit_tree)}</td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">{cryptoHelper.formatArea(hh.macadamia)}</td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">{cryptoHelper.formatArea(hh.wet_rice)}</td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">{cryptoHelper.formatArea(hh.other_annual_crops)}</td>
                    <td className="py-3 px-3 text-center sticky right-0 bg-white dark:bg-slate-900">
                      <button type="button" onClick={() => onEdit(hh)} aria-label="Sửa hộ" className="p-1.5 text-slate-500 hover:text-emerald-700 cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                      <button type="button" onClick={() => onDelete(hh)} aria-label="Xóa hộ" className="p-1.5 text-slate-400 hover:text-rose-700 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </>
          )}

          {/* ========================================================================= */}
          {/* 3. VIEW MODE: HERBS (4 CHỈ SỐ DƯỢC LIỆU ĐĂK HÀ) */}
          {/* ========================================================================= */}
          {viewMode === 'herbs' && (
            <>
              <thead>
                <tr className="bg-teal-100/70 dark:bg-teal-950/80 text-teal-950 dark:text-teal-200 border-b border-teal-200 dark:border-teal-800 text-[11px] font-black uppercase tracking-wider">
                  <th className="py-3 px-3.5 text-center w-12 border-r border-teal-200 dark:border-teal-800">STT</th>
                  <th className="py-3 px-4 min-w-[200px] border-r border-teal-200 dark:border-teal-800">Họ và Tên Chủ Hộ</th>
                  <th className="py-3 px-3.5 border-r border-teal-200 dark:border-teal-800">Thôn</th>
                  <th className="py-3 px-3 text-right border-r border-teal-200 dark:border-teal-800">Đinh Lăng (ha)</th>
                  <th className="py-3 px-3 text-right border-r border-teal-200 dark:border-teal-800">Gừng (ha)</th>
                  <th className="py-3 px-3 text-right border-r border-teal-200 dark:border-teal-800">Nghệ (ha)</th>
                  <th className="py-3 px-3 text-right border-r border-teal-200 dark:border-teal-800">Sả (ha)</th>
                  <th className="py-3 px-3 text-right border-r border-teal-200 dark:border-teal-800 font-bold bg-teal-200/50 dark:bg-teal-900/40">Tổng Dược Liệu (ha)</th>
                  <th className="py-3 px-3 text-center min-w-[90px] sticky right-0 bg-teal-100 dark:bg-teal-950">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {households.map((hh, idx) => {
                  const totalHerbs = (hh.herb_dinh_lang || 0) + (hh.herb_gung || 0) + (hh.herb_nghe || 0) + (hh.herb_sa || 0);
                  return (
                    <tr
                      key={hh.id}
                      onDoubleClick={() => onEdit(hh)}
                      className="hover:bg-teal-50/40 dark:hover:bg-slate-800/60 transition-colors text-[13.5px]"
                    >
                      <td className="py-3 px-3.5 text-center font-mono text-slate-500 dark:text-slate-400">{(page - 1) * limit + idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">{hh.full_name}</td>
                      <td className="py-3 px-3.5 whitespace-nowrap"><span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${villageColorMap[hh.village_name || '']}`}>{hh.village_name}</span></td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">{cryptoHelper.formatArea(hh.herb_dinh_lang)}</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">{cryptoHelper.formatArea(hh.herb_gung)}</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">{cryptoHelper.formatArea(hh.herb_nghe)}</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">{cryptoHelper.formatArea(hh.herb_sa)}</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-teal-700 dark:text-teal-400 bg-teal-50/30 dark:bg-teal-950/20">{cryptoHelper.formatArea(totalHerbs)}</td>
                      <td className="py-3 px-3 text-center sticky right-0 bg-white dark:bg-slate-900">
                        <button type="button" onClick={() => onEdit(hh)} aria-label="Sửa hộ" className="p-1.5 text-slate-500 hover:text-emerald-700 cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                        <button type="button" onClick={() => onDelete(hh)} aria-label="Xóa hộ" className="p-1.5 text-slate-400 hover:text-rose-700 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </>
          )}

          {/* ========================================================================= */}
          {/* 4. VIEW MODE: LIVESTOCK (4 CHỈ SỐ VẬT NUÔI) */}
          {/* ========================================================================= */}
          {viewMode === 'livestock' && (
            <>
              <thead>
                <tr className="bg-amber-100/70 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 border-b border-amber-200 dark:border-amber-800 text-[11px] font-black uppercase tracking-wider">
                  <th className="py-3 px-3.5 text-center w-12 border-r border-amber-200 dark:border-amber-800">STT</th>
                  <th className="py-3 px-4 min-w-[200px] border-r border-amber-200 dark:border-amber-800">Họ và Tên Chủ Hộ</th>
                  <th className="py-3 px-3.5 border-r border-amber-200 dark:border-amber-800">Thôn</th>
                  <th className="py-3 px-3 text-right border-r border-amber-200 dark:border-amber-800">Đàn Trâu (con)</th>
                  <th className="py-3 px-3 text-right border-r border-amber-200 dark:border-amber-800">Đàn Bò (con)</th>
                  <th className="py-3 px-3 text-right border-r border-amber-200 dark:border-amber-800">Đàn Heo (con)</th>
                  <th className="py-3 px-3 text-right border-r border-amber-200 dark:border-amber-800">Đàn Gia Cầm (con)</th>
                  <th className="py-3 px-3 text-right border-r border-amber-200 dark:border-amber-800 font-bold bg-amber-200/50 dark:bg-amber-900/40">Tổng Đàn (con)</th>
                  <th className="py-3 px-3 text-center min-w-[90px] sticky right-0 bg-amber-100 dark:bg-amber-950">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {households.map((hh, idx) => {
                  const totalAnimals = (hh.buffalo || 0) + (hh.cow || 0) + (hh.pig || 0) + (hh.poultry || 0);
                  return (
                    <tr
                      key={hh.id}
                      onDoubleClick={() => onEdit(hh)}
                      className="hover:bg-amber-50/40 dark:hover:bg-slate-800/60 transition-colors text-[13.5px]"
                    >
                      <td className="py-3 px-3.5 text-center font-mono text-slate-500 dark:text-slate-400">{(page - 1) * limit + idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">{hh.full_name}</td>
                      <td className="py-3 px-3.5 whitespace-nowrap"><span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${villageColorMap[hh.village_name || '']}`}>{hh.village_name}</span></td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">{hh.buffalo || '-'}</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">{hh.cow || '-'}</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">{hh.pig || '-'}</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">{hh.poultry || '-'}</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-amber-700 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-950/20">{totalAnimals || '-'}</td>
                      <td className="py-3 px-3 text-center sticky right-0 bg-white dark:bg-slate-900">
                        <button type="button" onClick={() => onEdit(hh)} aria-label="Sửa hộ" className="p-1.5 text-slate-500 hover:text-emerald-700 cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                        <button type="button" onClick={() => onDelete(hh)} aria-label="Xóa hộ" className="p-1.5 text-slate-400 hover:text-rose-700 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </>
          )}

          {/* ========================================================================= */}
          {/* 5. VIEW MODE: AQUACULTURE (2 CHỈ SỐ THỦY SẢN) */}
          {/* ========================================================================= */}
          {viewMode === 'aquaculture' && (
            <>
              <thead>
                <tr className="bg-sky-100/70 dark:bg-sky-950/80 text-sky-950 dark:text-sky-200 border-b border-sky-200 dark:border-sky-800 text-[11px] font-black uppercase tracking-wider">
                  <th className="py-3 px-3.5 text-center w-12 border-r border-sky-200 dark:border-sky-800">STT</th>
                  <th className="py-3 px-4 min-w-[220px] border-r border-sky-200 dark:border-sky-800">Họ và Tên Chủ Hộ</th>
                  <th className="py-3 px-3.5 border-r border-sky-200 dark:border-sky-800">Thôn</th>
                  <th className="py-3 px-4 text-right border-r border-sky-200 dark:border-sky-800">Cá Ao Hồ (ha)</th>
                  <th className="py-3 px-4 text-right border-r border-sky-200 dark:border-sky-800">Cá Lồng Bè (lồng)</th>
                  <th className="py-3 px-4 text-left border-r border-sky-200 dark:border-sky-800">Ghi Chú Kèm Theo</th>
                  <th className="py-3 px-3 text-center min-w-[90px] sticky right-0 bg-sky-100 dark:bg-sky-950">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {households.map((hh, idx) => (
                  <tr
                    key={hh.id}
                    onDoubleClick={() => onEdit(hh)}
                    className="hover:bg-sky-50/40 dark:hover:bg-slate-800/60 transition-colors text-[13.5px]"
                  >
                    <td className="py-3 px-3.5 text-center font-mono text-slate-500 dark:text-slate-400">{(page - 1) * limit + idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">{hh.full_name}</td>
                    <td className="py-3 px-3.5 whitespace-nowrap"><span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${villageColorMap[hh.village_name || '']}`}>{hh.village_name}</span></td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">{cryptoHelper.formatArea(hh.fish_pond)}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">{hh.fish_cage ? `${hh.fish_cage} lồng` : '-'}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs italic">{hh.notes || '-'}</td>
                    <td className="py-3 px-3 text-center sticky right-0 bg-white dark:bg-slate-900">
                      <button type="button" onClick={() => onEdit(hh)} aria-label="Sửa hộ" className="p-1.5 text-slate-500 hover:text-emerald-700 cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                      <button type="button" onClick={() => onDelete(hh)} aria-label="Xóa hộ" className="p-1.5 text-slate-400 hover:text-rose-700 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </>
          )}

          {/* ========================================================================= */}
          {/* 6. VIEW MODE: FULL (21 CỘT ĐẦY ĐỦ MA TRẬN) */}
          {/* ========================================================================= */}
          {viewMode === 'full' && (
            <>
              <thead>
                <tr className="bg-slate-100/90 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-b border-slate-200/90 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider">
                  <th rowSpan={2} className="py-3 px-3.5 border-r border-slate-200/80 dark:border-slate-800 text-center w-12">STT</th>
                  <th rowSpan={2} className="py-3 px-4 border-r border-slate-200/80 dark:border-slate-800 min-w-[190px]">Họ và Tên Chủ Hộ</th>
                  <th rowSpan={2} className="py-3 px-3.5 border-r border-slate-200/80 dark:border-slate-800 min-w-[130px]">Thôn Quản Lý</th>

                  <th colSpan={8} className="py-2.5 px-3 border-r border-slate-200/80 dark:border-slate-800 text-center bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300">
                    1. Cây Trồng Chính (ha)
                  </th>
                  <th colSpan={4} className="py-2.5 px-3 border-r border-slate-200/80 dark:border-slate-800 text-center bg-teal-50/70 dark:bg-teal-950/40 text-teal-900 dark:text-teal-300">
                    2. Dược Liệu Đăk Hà (ha)
                  </th>
                  <th colSpan={4} className="py-2.5 px-3 border-r border-slate-200/80 dark:border-slate-800 text-center bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300">
                    3. Đàn Vật Nuôi (con)
                  </th>
                  <th colSpan={2} className="py-2.5 px-3 border-r border-slate-200/80 dark:border-slate-800 text-center bg-sky-50/70 dark:bg-sky-950/40 text-sky-900 dark:text-sky-300">
                    4. Thủy Sản
                  </th>
                  <th rowSpan={2} className="py-3 px-3 text-center min-w-[90px] sticky right-0 bg-slate-100 dark:bg-slate-950 shadow-xs">
                    Thao Tác
                  </th>
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
                    onDoubleClick={() => onEdit(hh)}
                    className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/60 transition-colors text-[13.5px]"
                  >
                    <td className="py-3 px-3.5 border-r border-slate-100 dark:border-slate-800/60 text-center font-mono text-slate-500 dark:text-slate-400">{(page - 1) * limit + idx + 1}</td>
                    <td className="py-3 px-4 border-r border-slate-100 dark:border-slate-800/60 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">{hh.full_name}</td>
                    <td className="py-3 px-3.5 border-r border-slate-100 dark:border-slate-800/60 whitespace-nowrap"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${villageColorMap[hh.village_name || '']}`}>{hh.village_name}</span></td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200">{cryptoHelper.formatArea(hh.cafe_household)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200">{cryptoHelper.formatArea(hh.cafe_contracted)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200">{cryptoHelper.formatArea(hh.rubber_household)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200">{cryptoHelper.formatArea(hh.rubber_contracted)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200">{cryptoHelper.formatArea(hh.fruit_tree)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200">{cryptoHelper.formatArea(hh.macadamia)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200">{cryptoHelper.formatArea(hh.wet_rice)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-200/80 dark:border-slate-800 font-mono tabular-nums text-slate-800 dark:text-slate-200">{cryptoHelper.formatArea(hh.other_annual_crops)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200 bg-teal-50/20 dark:bg-teal-950/20">{cryptoHelper.formatArea(hh.herb_dinh_lang)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200 bg-teal-50/20 dark:bg-teal-950/20">{cryptoHelper.formatArea(hh.herb_gung)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200 bg-teal-50/20 dark:bg-teal-950/20">{cryptoHelper.formatArea(hh.herb_nghe)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-200/80 dark:border-slate-800 font-mono tabular-nums text-slate-800 dark:text-slate-200 bg-teal-50/20 dark:bg-teal-950/20">{cryptoHelper.formatArea(hh.herb_sa)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200">{hh.buffalo || '-'}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200">{hh.cow || '-'}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200">{hh.pig || '-'}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-200/80 dark:border-slate-800 font-mono tabular-nums text-slate-800 dark:text-slate-200">{hh.poultry || '-'}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-100 dark:border-slate-800/60 font-mono tabular-nums text-slate-800 dark:text-slate-200">{cryptoHelper.formatArea(hh.fish_pond)}</td>
                    <td className="py-3 px-2 text-right border-r border-slate-200/80 dark:border-slate-800 font-mono tabular-nums text-slate-800 dark:text-slate-200">{hh.fish_cage ? `${hh.fish_cage} lồng` : '-'}</td>
                    <td className="py-3 px-3 text-center sticky right-0 bg-white dark:bg-slate-900">
                      <button type="button" onClick={() => onEdit(hh)} aria-label="Sửa hộ" className="p-1.5 text-slate-500 hover:text-emerald-700 cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                      <button type="button" onClick={() => onDelete(hh)} aria-label="Xóa hộ" className="p-1.5 text-slate-400 hover:text-rose-700 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </>
          )}
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
              aria-label="Trang trước"
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
              aria-label="Trang tiếp theo"
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
