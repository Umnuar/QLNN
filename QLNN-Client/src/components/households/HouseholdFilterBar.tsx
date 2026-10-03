import {
	ArrowUpDown,
	ChevronDown,
	ChevronsUpDown,
	Download,
	Layers,
	RefreshCw,
	RotateCcw,
	Search,
	Sprout,
	Trash2,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { CustomSelect } from "../common/CustomSelect";

export type ScaleFilter = "all" | "large" | "medium" | "small";
export type ProductionTypeFilter =
	| "all"
	| "contracted"
	| "herbs"
	| "livestock"
	| "aquaculture";
export type SortOption =
	| "default"
	| "crops_desc"
	| "livestock_desc"
	| "name_asc"
	| "name_desc";

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
	{ value: "all", label: "Tất cả quy mô" },
	{ value: "large", label: "Lớn (> 2ha / > 15 con)" },
	{ value: "medium", label: "Vừa (0.5 - 2ha)" },
	{ value: "small", label: "Nhỏ lẻ (< 0.5ha)" },
];

export const TYPE_OPTIONS: { value: ProductionTypeFilter; label: string }[] = [
	{ value: "all", label: "Tất cả loại hình" },
	{ value: "contracted", label: "Có nhận khoán" },
	{ value: "herbs", label: "Trồng dược liệu" },
	{ value: "livestock", label: "Chăn nuôi gia súc" },
	{ value: "aquaculture", label: "Nuôi trồng thủy sản" },
];

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
	{ value: "default", label: "Mặc định (STT)" },
	{ value: "crops_desc", label: "Diện tích cây trồng ↓" },
	{ value: "livestock_desc", label: "Tổng đàn vật nuôi ↓" },
	{ value: "name_asc", label: "Tên chủ hộ A → Z" },
	{ value: "name_desc", label: "Tên chủ hộ Z → A" },
];

export const HouseholdFilterBar: React.FC<HouseholdFilterBarProps> = ({
	search,
	setSearch,
	loading,
	onRefresh,
	scaleFilter = "all",
	setScaleFilter,
	typeFilter = "all",
	setTypeFilter,
	sortBy = "default",
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
	const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
	const actionDropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				actionDropdownRef.current &&
				!actionDropdownRef.current.contains(event.target as Node)
			) {
				setIsActionDropdownOpen(false);
			}
		};
		if (isActionDropdownOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isActionDropdownOpen]);

	const activeFilterCount =
		(search.trim() !== "" ? 1 : 0) +
		(scaleFilter !== "all" ? 1 : 0) +
		(typeFilter !== "all" ? 1 : 0) +
		(sortBy !== "default" ? 1 : 0);
	const hasActiveFilter = activeFilterCount > 0;

	const handleReset = () => {
		setSearch("");
		setScaleFilter?.("all");
		setTypeFilter?.("all");
		setSortBy?.("default");
		onResetFilters?.();
	};

	return (
		<div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-150">
			{/* 1. Ô tìm kiếm tích hợp */}
			<div className="relative w-56 sm:w-80 shrink-0">
				<Search
					className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
						search.trim() !== ""
							? "text-emerald-600 dark:text-emerald-400"
							: "text-slate-400 dark:text-slate-500"
					}`}
					strokeWidth={1.5}
					aria-hidden="true"
				/>
				<input
					id="household-search-input"
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Tìm theo họ tên chủ hộ..."
					aria-label="Tìm theo họ tên chủ hộ"
					className={`w-full h-8 sm:h-9 pl-8.5 pr-14 rounded-xl text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden transition-all ${
						search.trim() !== ""
							? "bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-500/80 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 font-bold focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
							: "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-medium focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
					}`}
				/>
				<div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
					{search && (
						<>
							<button
								type="button"
								onClick={() => setSearch("")}
								aria-label="Xóa tìm kiếm"
								className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
							>
								<X
									className="w-3.5 h-3.5"
									strokeWidth={1.5}
									aria-hidden="true"
								/>
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
								loading
									? "animate-spin text-emerald-600 dark:text-emerald-400"
									: ""
							}`}
							strokeWidth={1.5}
							aria-hidden="true"
						/>
					</button>
				</div>
			</div>

			{/* 2. Dropdown Quy mô */}
			<div className="w-44 shrink-0">
				<CustomSelect
					variant="filter"
					defaultValue="all"
					value={scaleFilter}
					onChange={(val) => setScaleFilter?.(val as ScaleFilter)}
					options={SCALE_OPTIONS}
					placeholder="Tất cả quy mô"
					size="sm"
					icon={<Layers className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />}
					clearable={true}
					onClear={() => setScaleFilter?.("all")}
				/>
			</div>

			{/* 3. Dropdown Loại hình */}
			<div className="w-44 shrink-0">
				<CustomSelect
					variant="filter"
					defaultValue="all"
					value={typeFilter}
					onChange={(val) => setTypeFilter?.(val as ProductionTypeFilter)}
					options={TYPE_OPTIONS}
					placeholder="Tất cả loại hình"
					size="sm"
					icon={<Sprout className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />}
					clearable={true}
					onClear={() => setTypeFilter?.("all")}
				/>
			</div>

			{/* 4. Dropdown Sắp xếp */}
			<div className="w-42 shrink-0">
				<CustomSelect
					variant="filter"
					defaultValue="default"
					value={sortBy}
					onChange={(val) => setSortBy?.(val as SortOption)}
					options={SORT_OPTIONS}
					placeholder="Mặc định (STT)"
					size="sm"
					icon={
						<ArrowUpDown className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
					}
					clearable={true}
					onClear={() => setSortBy?.("default")}
				/>
			</div>

			{/* 5. Nút Bung/Thu gọn tất cả chi tiết */}
			<button
				type="button"
				onClick={onToggleExpandAll}
				aria-label={
					isAllExpanded ? "Thu gọn tất cả chi tiết" : "Bung tất cả chi tiết"
				}
				title={
					isAllExpanded ? "Thu gọn tất cả chi tiết" : "Bung tất cả chi tiết"
				}
				className={`h-8 px-2.5 flex items-center gap-1.5 rounded-xl text-xs border shrink-0 transition-all cursor-pointer ${
					isAllExpanded
						? "bg-emerald-50/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-500/80 dark:border-emerald-700 font-bold shadow-xs"
						: "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium"
				}`}
			>
				{isAllExpanded && (
					<span
						className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0"
						aria-hidden="true"
						title="Đang bật bung chi tiết"
					/>
				)}
				<ChevronsUpDown
					className={`w-3.5 h-3.5 transition-colors ${
						isAllExpanded
							? "text-emerald-600 dark:text-emerald-400"
							: "text-slate-400 dark:text-slate-500"
					}`}
					strokeWidth={1.5}
					aria-hidden="true"
				/>
				<span className="hidden sm:inline">
					{isAllExpanded ? "Thu gọn tất cả" : "Bung tất cả"}
				</span>
			</button>

			{/* 6. Nút Xóa nhanh bộ lọc (chỉ hiện khi có lọc active) */}
			{hasActiveFilter && (
				<button
					type="button"
					onClick={handleReset}
					aria-label={
						activeFilterCount > 1 ? "Xóa tất cả bộ lọc" : "Xóa bộ lọc"
					}
					title="Xóa bộ lọc về mặc định"
					className="h-8 px-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0 transition-all hover:bg-rose-100 dark:hover:bg-rose-900/50"
				>
					<RotateCcw
						className="w-3.5 h-3.5"
						strokeWidth={1.5}
						aria-hidden="true"
					/>
					<span>{activeFilterCount > 1 ? "Xóa tất cả bộ lọc" : "Xóa lọc"}</span>
					{activeFilterCount > 1 && (
						<span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
							{activeFilterCount}
						</span>
					)}
				</button>
			)}

			{/* 7. Cụm tác vụ hàng loạt khi có dòng được chọn: dồn sang mép phải (ml-auto) */}
			{isSelectionActive && (
				<div className="ml-auto flex items-center gap-2 shrink-0 animate-in fade-in">
					{/* Nút trung tính "Thao tác (N)" dạng dropdown */}
					<div className="relative" ref={actionDropdownRef}>
						<button
							type="button"
							onClick={() => setIsActionDropdownOpen((prev) => !prev)}
							className="h-8 sm:h-9 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer select-none transition-all"
							aria-expanded={isActionDropdownOpen}
							aria-haspopup="menu"
						>
							<span>Thao tác ({selectedCount})</span>
							<ChevronDown
								className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
									isActionDropdownOpen ? "rotate-180" : ""
								}`}
							/>
						</button>

						{isActionDropdownOpen && (
							<div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
								{onExportSelected && (
									<button
										type="button"
										onClick={() => {
											setIsActionDropdownOpen(false);
											onExportSelected();
										}}
										className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
									>
										<Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
										<span>Xuất Excel ({selectedCount} hộ)</span>
									</button>
								)}
								{onDeselectAll && (
									<button
										type="button"
										onClick={() => {
											setIsActionDropdownOpen(false);
											onDeselectAll();
										}}
										className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 rounded-xl flex items-center gap-2 cursor-pointer transition-colors border-t border-slate-100 dark:border-slate-800"
									>
										<X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
										<span>Bỏ chọn tất cả</span>
									</button>
								)}
							</div>
						)}
					</div>

					{/* Nút đỏ xóa các hộ đã chọn */}
					{onDeleteSelected && (
						<button
							type="button"
							onClick={onDeleteSelected}
							className="h-8 sm:h-9 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
							title={`Xóa ${selectedCount} hộ đã chọn`}
							aria-label={`Xóa ${selectedCount} hộ đã chọn`}
						>
							<Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
							<span>{selectedCount}</span>
						</button>
					)}
				</div>
			)}
		</div>
	);
};

export default HouseholdFilterBar;
