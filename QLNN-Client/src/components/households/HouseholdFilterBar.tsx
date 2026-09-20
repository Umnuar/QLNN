import React from 'react';
import { Search, X, RefreshCw, ChevronsUpDown, RotateCcw, Download, Trash2 } from 'lucide-react';
import { CustomSelect } from '../common/CustomSelect';

export type ScaleFilter = 'all' | 'large' | 'medium' | 'small';
export type ProductionTypeFilter = 'all' | 'contracted' | 'herbs' | 'livestock' | 'aquaculture';
export type SortOption = 'default' | 'crops_desc' | 'livestock_desc' | 'name_asc' | 'name_desc';

export interface HouseholdFilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  loading: boolean;
  onRefresh: () => void;
  scaleFilter?: ScaleFilter;
  setScaleFilter?: (val: ScaleFilter) => void;
  typeFilter?: ProductionTypeFilter;
  setTypeFilter?: (val: ProductionTypeFilter) => void;
  sortBy?: SortOption;
  setSortBy?: (val: SortOption) => void;
  isAllExpanded?: boolean;
  onToggleExpandAll?: () => void;
  onResetFilters?: () => void;
  selectedCount?: number;
  onDeselectAll?: () => void;
  onExportSelected?: () => void;
  onDeleteSelected?: () => void;
}

export const SCALE_OPTIONS: { value: ScaleFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả quy mô' },
  { value: 'large', label: 'Lớn (> 2ha / > 15 con)' },
  { value: 'medium', label: 'Vừa (0.5 - 2ha)' },
  { value: 'small', label: 'Nhỏ lẻ (< 0.5ha)' },
];

export const TYPE_OPTIONS: { value: ProductionTypeFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả loại hình' },
  { value: 'contracted', label: 'Có nhận khoán' },
  { value: 'herbs', label: 'Trồng dược liệu' },
  { value: 'livestock', label: 'Chăn nuôi gia súc' },
  { value: 'aquaculture', label: 'Nuôi trồng thủy sản' },
];

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default', label: 'Mặc định (STT)' },
  { value: 'crops_desc', label: 'Diện tích cây trồng ↓' },
  { value: 'livestock_desc', label: 'Tổng đàn vật nuôi ↓' },
  { value: 'name_asc', label: 'Tên chủ hộ A → Z' },
  { value: 'name_desc', label: 'Tên chủ hộ Z → A' },
];

export const HouseholdFilterBar: React.FC<HouseholdFilterBarProps> = ({
  search,
  setSearch,
  loading,
  onRefresh,
  scaleFilter = 'all',
  setScaleFilter,
  typeFilter = 'all',
  setTypeFilter,
  sortBy = 'default',
  setSortBy,
  isAllExpanded = false,
  onToggleExpandAll,
  onResetFilters,
  selectedCount = 0,
  onDeselectAll,
  onExportSelected,
  onDeleteSelected,
}) => {
  const isSelectionActive = Boolean(selectedCount && selectedCount > 0);
  const hasActiveFilter = Boolean(
    search.trim() !== '' ||
    scaleFilter !== 'all' ||
    typeFilter !== 'all' ||
    sortBy !== 'default'
  );

  const handleReset = () => {
    setSearch('');
    setScaleFilter?.('all');
    setTypeFilter?.('all');
    setSortBy?.('default');
    onResetFilters?.();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-150">
      {/* 1. Ô tìm kiếm tích hợp */}
      <div className="relative w-56 sm:w-80 shrink-0">
        <Search
          className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
          strokeWidth={1.5}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo họ tên chủ hộ..."
          className="w-full h-8 sm:h-9 pl-8.5 pr-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden font-medium transition-all"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
          {search && (
            <>
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Xóa tìm kiếm"
                className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
              <div className="w-px h-3.5 bg-slate-200 dark:bg-slate-700 mx-1" />
            </>
          )}
          <button
            type="button"
            onClick={onRefresh}
            aria-label="Làm mới danh sách"
            title="Làm mới danh sách"
            className="p-0.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                loading ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''
              }`}
              strokeWidth={1.5}
            />
          </button>
        </div>
      </div>

      {/* Trạng thái khi có hộ được chọn: chuyển thành thanh hành động */}
      {isSelectionActive ? (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800">
            Đã chọn {selectedCount} hộ
          </span>
          <button
            type="button"
            onClick={onDeselectAll}
            className="h-8 px-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-all"
          >
            Bỏ chọn
          </button>
          <button
            type="button"
            onClick={onExportSelected}
            className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Xuất Excel</span>
          </button>
          <button
            type="button"
            onClick={onDeleteSelected}
            className="h-8 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Xóa</span>
          </button>
        </div>
      ) : (
        <>
          {/* Dropdown Quy mô */}
          <div className="w-36 shrink-0">
            <CustomSelect
              value={scaleFilter}
              onChange={(val) => setScaleFilter?.(val as ScaleFilter)}
              options={SCALE_OPTIONS}
              size="sm"
            />
          </div>

          {/* Dropdown Loại hình */}
          <div className="w-40 shrink-0">
            <CustomSelect
              value={typeFilter}
              onChange={(val) => setTypeFilter?.(val as ProductionTypeFilter)}
              options={TYPE_OPTIONS}
              size="sm"
            />
          </div>

          {/* Dropdown Sắp xếp */}
          <div className="w-36 shrink-0">
            <CustomSelect
              value={sortBy}
              onChange={(val) => setSortBy?.(val as SortOption)}
              options={SORT_OPTIONS}
              size="sm"
            />
          </div>

          {/* Nút Bung/Thu gọn tất cả chi tiết */}
          <button
            type="button"
            onClick={onToggleExpandAll}
            aria-label={isAllExpanded ? 'Thu gọn tất cả chi tiết' : 'Bung tất cả chi tiết'}
            title={isAllExpanded ? 'Thu gọn tất cả chi tiết' : 'Bung tất cả chi tiết'}
            className={`h-8 px-2.5 flex items-center gap-1.5 rounded-xl text-xs font-bold border shrink-0 transition-all cursor-pointer ${
              isAllExpanded
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-800'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" strokeWidth={1.5} />
            <span className="hidden sm:inline">{isAllExpanded ? 'Thu gọn tất cả' : 'Bung tất cả'}</span>
          </button>

          {/* Nút Xóa nhanh bộ lọc (chỉ hiện khi có lọc active) */}
          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleReset}
              aria-label="Xóa bộ lọc"
              title="Xóa bộ lọc về mặc định"
              className="h-8 px-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Xóa lọc</span>
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default HouseholdFilterBar;
