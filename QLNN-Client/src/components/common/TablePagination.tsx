import { ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";
import { CustomSelect } from "./CustomSelect";

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
	total,
	page,
	limit,
	totalPages,
	onPageChange,
	onLimitChange,
}) => {
	const start = total === 0 ? 0 : (page - 1) * limit + 1;
	const end = Math.min(page * limit, total);

	return (
		<div className="p-4 bg-slate-50/95 dark:bg-slate-950/90 border-t border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs select-none">
			<div className="text-slate-600 dark:text-slate-300 font-medium">
				Hiển thị{" "}
				<strong className="text-slate-900 dark:text-white font-bold">
					{start}–{end}
				</strong>{" "}
				trong tổng số{" "}
				<strong className="text-slate-900 dark:text-white font-bold">
					{total}
				</strong>{" "}
				bản ghi
			</div>

			<div className="flex items-center gap-3">
				{/* Limit selector via CustomSelect */}
				<div className="flex items-center gap-2">
					<span className="text-slate-500 dark:text-slate-400 font-medium">
						Hiển thị:
					</span>
					<div className="w-28">
						<CustomSelect
							value={limit}
							onChange={(val) => onLimitChange(Number(val))}
							options={[
								{ value: 10, label: "10 dòng" },
								{ value: 20, label: "20 dòng" },
								{ value: 50, label: "50 dòng" },
								{ value: 100, label: "100 dòng" },
							]}
							size="sm"
						/>
					</div>
				</div>

				{/* Page navigation */}
				<div className="flex items-center gap-1.5">
					<button
						type="button"
						disabled={page <= 1}
						onClick={() => onPageChange(page - 1)}
						aria-label="Trang trước"
						className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95"
					>
						<ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
					</button>

					<span className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
						Trang {page} / {totalPages || 1}
					</span>

					<button
						type="button"
						disabled={page >= totalPages}
						onClick={() => onPageChange(page + 1)}
						aria-label="Trang tiếp theo"
						className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95"
					>
						<ChevronRight className="w-4 h-4" strokeWidth={1.5} />
					</button>
				</div>
			</div>
		</div>
	);
};
