import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TablePaginationProps {
  itemCount: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  itemCount,
  total,
  page,
  limit,
  totalPages,
  onPageChange,
  onLimitChange,
}) => {
  return (
    <div className="p-4 bg-slate-50/90 dark:bg-slate-950/80 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      <div className="text-slate-600 dark:text-slate-300 font-medium">
        Hiển thị <strong className="text-slate-900 dark:text-white font-bold">{itemCount}</strong> /{' '}
        <strong className="text-slate-900 dark:text-white font-bold">{total}</strong> bản ghi
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

        {/* Page navigation */}
        <div className="flex items-center gap-1.5">
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
  );
};
