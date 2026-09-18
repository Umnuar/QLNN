import React from 'react';
import { Search, X, RefreshCw, ChevronsUpDown, RotateCcw } from 'lucide-react';
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
}) => {
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
    <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-150">
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
        {/* Ô tìm kiếm họ tên */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
            strokeWidth={1.5}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo họ tên chủ hộ..."
            className="w-full pl-9 pr-8 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden font-medium transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Xóa tìm kiếm"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Dropdown Quy mô */}
        <div className="w-full sm:w-44">
          <CustomSelect
            value={scaleFilter}
            onChange={(val) => setScaleFilter?.(val as ScaleFilter)}
            options={SCALE_OPTIONS}
            size="sm"
          />
        </div>

        {/* Dropdown Loại hình */}
        <div className="w-full sm:w-44">
          <CustomSelect
            value={typeFilter}
            onChange={(val) => setTypeFilter?.(val as ProductionTypeFilter)}
            options={TYPE_OPTIONS}
            size="sm"
          />
        </div>

        {/* Dropdown Sắp xếp */}
        <div className="w-full sm:w-44">
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
          className={`h-8 px-2.5 flex items-center gap-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shrink-0 ${
            isAllExpanded
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-800'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <ChevronsUpDown className="w-4 h-4 text-slate-500 dark:text-slate-400" strokeWidth={1.5} />
          <span className="hidden sm:inline">{isAllExpanded ? 'Thu gọn tất cả' : 'Bung tất cả'}</span>
        </button>

        {/* Nút Xóa nhanh bộ lọc (chỉ hiện khi có lọc active) */}
        {hasActiveFilter && (
          <button
            type="button"
            onClick={handleReset}
            aria-label="Xóa bộ lọc"
            title="Xóa bộ lọc về mặc định"
            className="h-8 px-2.5 flex items-center gap-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Xóa lọc</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 hidden sm:block" />

        {/* Nút Làm mới danh sách */}
        <button
          type="button"
          onClick={onRefresh}
          aria-label="Làm mới danh sách"
          title="Làm mới danh sách"
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default HouseholdFilterBar;
