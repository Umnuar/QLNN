import React from 'react';
import { Search, X, RefreshCw } from 'lucide-react';

interface HouseholdFilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  loading: boolean;
  onRefresh: () => void;
}

export const HouseholdFilterBar: React.FC<HouseholdFilterBarProps> = ({
  search,
  setSearch,
  loading,
  onRefresh,
}) => {
  return (
    <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-150">
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo họ tên chủ hộ (gõ có dấu hoặc không dấu)..."
          className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden font-medium transition-all"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          aria-label="Làm mới danh sách"
          title="Làm mới danh sách"
          className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} />
        </button>
      </div>
    </div>
  );
};
