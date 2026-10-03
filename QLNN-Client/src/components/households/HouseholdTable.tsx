import {
	ChevronRight,
	Edit3,
	Eye,
	EyeOff,
	Fish,
	Flower2,
	Layers,
	LayoutGrid,
	Lightbulb,
	PawPrint,
	Trash2,
	Trees,
} from "lucide-react";
import React, { useState } from "react";
import { useApp } from "../../AppContext";
import type { HouseholdFlat } from "../../types";
import { TablePagination } from "../common/TablePagination";
import {
	NumberCell,
	TABLE_STYLES,
	VillageBadge,
} from "../common/tableStyles";

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
	isAllExpanded?: boolean;
	onToggleExpandAll?: () => void;
}

type ViewMode =
	| "overview"
	| "crops"
	| "herbs"
	| "livestock"
	| "aquaculture"
	| "full";

export const HouseholdTable: React.FC<HouseholdTableProps> = ({
	selectedIds = [],
	onToggleSelect,
	onToggleSelectAll,
	readOnly = false,
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
	isAllExpanded,
	onToggleExpandAll,
}) => {
	const { isOnline, isBackendHealthy } = useApp();
	const isDisconnected = !isOnline || !isBackendHealthy;
	const [viewMode, setViewMode] = useState<ViewMode>("overview");
	const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
	const [showMasked, setShowMasked] = useState<Record<string, boolean>>({});

	React.useEffect(() => {
		if (isAllExpanded !== undefined) {
			if (isAllExpanded) {
				const nextState: Record<string, boolean> = {};
				households.forEach((hh) => {
					if (hh.id) nextState[hh.id] = true;
				});
				setExpandedRows(nextState);
			} else {
				setExpandedRows({});
			}
		}
	}, [isAllExpanded, households]);

	const toggleRowExpand = (id: string) => {
		setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	const toggleMask = (id: string) => {
		setShowMasked((prev) => ({ ...prev, [id]: !prev[id] }));
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
			(hh.buffalo || 0) + (hh.cow || 0) + (hh.pig || 0) + (hh.poultry || 0);

		return { totalCrops, totalHerbs, totalAnimals };
	};

	// Loading state component
	const renderLoading = (colSpan: number, label: string) => (
		<tr>
			<td
				colSpan={colSpan}
				className="py-16 text-center text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800"
			>
				<div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-2" />
				<span className="font-bold text-sm">{label}</span>
			</td>
		</tr>
	);

	// Empty state component
	const renderEmpty = (colSpan: number) => (
		<tr>
			<td
				colSpan={colSpan}
				className="py-16 text-center text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800"
			>
				<div className="text-base font-bold text-slate-600 dark:text-slate-300">
					Không tìm thấy hộ nông nghiệp nào
				</div>
			</td>
		</tr>
	);

	// Primary name cell with optional expand toggle and masked notes
	const renderNameCell = (
		hh: HouseholdFlat,
		allowExpand = false,
		isExpanded = false,
	) => (
		<td className={TABLE_STYLES.stickyLeftName}>
			<div className="flex items-center gap-1.5">
				{allowExpand && (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							toggleRowExpand(hh.id!);
						}}
						aria-label={`Chi tiết 18 chỉ số hộ ${hh.full_name}`}
						title="Xem/thu gọn 18 chỉ số"
						className={`p-1 rounded-md transition-colors cursor-pointer ${
							isExpanded
								? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
								: "text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800"
						}`}
					>
						<ChevronRight
							className={`w-3.5 h-3.5 transition-transform duration-200 ${
								isExpanded
									? "rotate-90 text-emerald-600 dark:text-emerald-400"
									: "text-slate-400"
							}`}
							strokeWidth={1.5}
						/>
					</button>
				)}
				<span className={TABLE_STYLES.primaryName}>{hh.full_name}</span>
			</div>
			{hh.notes && (
				<div
					className={`flex items-center gap-1 mt-0.5 ${TABLE_STYLES.subText} ${
						allowExpand ? "pl-6" : ""
					}`}
				>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							toggleMask(hh.id!);
						}}
						aria-label="Bật/Tắt che thông tin"
						className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded cursor-pointer"
						title={showMasked[hh.id!] ? "Che thông tin" : "Hiện thông tin"}
					>
						{showMasked[hh.id!] ? (
							<EyeOff className="w-3 h-3" strokeWidth={1.5} />
						) : (
							<Eye className="w-3 h-3" strokeWidth={1.5} />
						)}
					</button>
					<span className="truncate max-w-[200px]">
						{showMasked[hh.id!]
							? hh.notes
							: hh.notes.replace(
									/\d{4,}/g,
									(match) => "••••" + match.slice(-3),
								)}
					</span>
				</div>
			)}
		</td>
	);

	// Action buttons cell (32px square buttons)
	const renderActionCell = (hh: HouseholdFlat) => {
		if (readOnly) return null;
		return (
			<td className={TABLE_STYLES.stickyRightAction}>
				<div className="flex items-center justify-center gap-1">
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							!isDisconnected && onEdit(hh);
						}}
						disabled={isDisconnected}
						aria-label={`Sửa số liệu hộ ${hh.full_name}`}
						title="Sửa số liệu hộ này"
						className={TABLE_STYLES.actionBtnEdit}
					>
						<Edit3 className="w-4 h-4" strokeWidth={1.5} />
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onDelete(hh);
						}}
						aria-label={`Xóa hộ ${hh.full_name}`}
						title="Xóa hộ này"
						className={TABLE_STYLES.actionBtnDelete}
					>
						<Trash2 className="w-4 h-4" strokeWidth={1.5} />
					</button>
				</div>
			</td>
		);
	};

	return (
		<div className={TABLE_STYLES.card}>
			{/* 1. Header thẻ bo góc + bóng mềm */}
			<div className={TABLE_STYLES.cardHeader}>
				<div className="flex items-center gap-2.5">
					<span className="font-bold text-[14px] text-slate-800 dark:text-slate-100">
						Danh Sách Hộ Kinh Tế Nông Nghiệp
					</span>
					<span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800">
						{total} bản ghi
					</span>
				</div>

				<div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
					<Lightbulb
						className="w-3.5 h-3.5 text-amber-500 inline shrink-0"
						strokeWidth={1.5}
					/>
					<span>Mẹo: Bấm đúp vào dòng để xem & sửa nhanh 18 chỉ số</span>
				</div>
			</div>

			{/* 2. Dải tab con pill bo góc */}
			<div className="px-3.5 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
				<div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 flex-wrap">
					{/* Tab 1: Tổng hợp */}
					<button
						type="button"
						onClick={() => setViewMode("overview")}
						className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
							viewMode === "overview"
								? "bg-emerald-600 text-white shadow-xs"
								: "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/70"
						}`}
					>
						<Layers className="w-3.5 h-3.5" strokeWidth={1.5} />
						<span>Tổng Hợp</span>
					</button>

					{/* Tab 2: Cây trồng */}
					<button
						type="button"
						onClick={() => setViewMode("crops")}
						className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
							viewMode === "crops"
								? "bg-emerald-600 text-white shadow-xs"
								: "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/70"
						}`}
					>
						<Trees className="w-3.5 h-3.5" strokeWidth={1.5} />
						<span>Cây Trồng</span>
					</button>

					{/* Tab 3: Dược liệu */}
					<button
						type="button"
						onClick={() => setViewMode("herbs")}
						className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
							viewMode === "herbs"
								? "bg-emerald-600 text-white shadow-xs"
								: "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/70"
						}`}
					>
						<Flower2 className="w-3.5 h-3.5" strokeWidth={1.5} />
						<span>Dược Liệu</span>
					</button>

					{/* Tab 4: Vật nuôi */}
					<button
						type="button"
						onClick={() => setViewMode("livestock")}
						className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
							viewMode === "livestock"
								? "bg-emerald-600 text-white shadow-xs"
								: "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/70"
						}`}
					>
						<PawPrint className="w-3.5 h-3.5" strokeWidth={1.5} />
						<span>Vật Nuôi</span>
					</button>

					{/* Tab 5: Thủy sản */}
					<button
						type="button"
						onClick={() => setViewMode("aquaculture")}
						className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
							viewMode === "aquaculture"
								? "bg-emerald-600 text-white shadow-xs"
								: "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/70"
						}`}
					>
						<Fish className="w-3.5 h-3.5" strokeWidth={1.5} />
						<span>Thủy Sản</span>
					</button>

					{/* Tab 6: Tất cả (21 cột đầy đủ) */}
					<button
						type="button"
						onClick={() => setViewMode("full")}
						className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
							viewMode === "full"
								? "bg-emerald-600 text-white shadow-xs"
								: "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/70"
						}`}
					>
						<LayoutGrid className="w-3.5 h-3.5" strokeWidth={1.5} />
						<span>Tất Cả</span>
					</button>
				</div>
			</div>

			{/* 3. Vùng chứa bảng cuộn */}
			<div className={TABLE_STYLES.scrollContainer}>
				<table className={TABLE_STYLES.table}>
					{/* ========================================================================= */}
					{/* 1. VIEW MODE: OVERVIEW (TỔNG HỢP GỌN GÀNG) */}
					{/* ========================================================================= */}
					{viewMode === "overview" && (
						<>
							<thead>
								<tr>
									<th
										className={`${TABLE_STYLES.thCenter} sticky left-0 z-20 w-10`}
									>
										<input
											type="checkbox"
											aria-label="Chọn tất cả hộ dân"
											className="w-4 h-4 cursor-pointer accent-emerald-600 rounded"
											checked={
												households.length > 0 &&
												selectedIds.length === households.length
											}
											onChange={() => onToggleSelectAll && onToggleSelectAll()}
										/>
									</th>
									<th
										className={`${TABLE_STYLES.thCenter} sticky left-10 z-20 w-12`}
									>
										STT
									</th>
									<th
										className={`${TABLE_STYLES.th} sticky left-[88px] z-20 min-w-[200px] shadow-[4px_0_10px_-2px_rgba(0,0,0,0.04)] dark:shadow-[4px_0_10px_-2px_rgba(0,0,0,0.2)]`}
									>
										<div className="flex items-center gap-1.5">
											{onToggleExpandAll && (
												<button
													type="button"
													onClick={onToggleExpandAll}
													aria-label={
														isAllExpanded ? "Thu gọn tất cả" : "Bung tất cả"
													}
													title={
														isAllExpanded
															? "Thu gọn tất cả chi tiết"
															: "Bung tất cả chi tiết"
													}
													className={`p-1 rounded-md transition-colors cursor-pointer ${
														isAllExpanded
															? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
															: "text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-800"
													}`}
												>
													<ChevronRight
														className={`w-3.5 h-3.5 transition-transform duration-200 ${
															isAllExpanded
																? "rotate-90 text-emerald-600 dark:text-emerald-400"
																: "text-slate-400"
														}`}
														strokeWidth={1.5}
													/>
												</button>
											)}
											<span>Họ và Tên Chủ Hộ</span>
										</div>
									</th>
									<th className={`${TABLE_STYLES.th} min-w-[120px]`}>
										Thôn Quản Lý
									</th>
									<th className={TABLE_STYLES.thRight}>Tổng Cây Trồng</th>
									<th className={TABLE_STYLES.thRight}>Dược Liệu</th>
									<th className={TABLE_STYLES.thRight}>Vật Nuôi</th>
									<th className={TABLE_STYLES.thRight}>Thủy Sản</th>
									{!readOnly && (
										<th
											className={`${TABLE_STYLES.thCenter} sticky right-0 z-20 min-w-[96px] shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.04)] dark:shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.2)]`}
										>
											Thao Tác
										</th>
									)}
								</tr>
							</thead>
							<tbody>
								{loading
									? renderLoading(
											readOnly ? 8 : 9,
											"Đang tải dữ liệu hộ nông nghiệp...",
										)
									: households.length === 0
										? renderEmpty(readOnly ? 8 : 9)
										: households.map((hh, idx) => {
												const stt = (page - 1) * limit + idx + 1;
												const { totalCrops, totalHerbs, totalAnimals } =
													computeHouseholdSummary(hh);
												const isExpanded = !!expandedRows[hh.id!];

												return (
													<React.Fragment key={hh.id}>
														<tr
															onDoubleClick={() => !readOnly && onEdit(hh)}
															className={`${TABLE_STYLES.tr} ${
																isExpanded ? TABLE_STYLES.trExpanded : ""
															}`}
															title="Bấm đúp để sửa số liệu hộ này"
														>
															<td className={TABLE_STYLES.stickyLeftCheckbox}>
																<input
																	type="checkbox"
																	aria-label={`Chọn hộ ${hh.full_name}`}
																	className="w-4 h-4 cursor-pointer accent-emerald-600 rounded"
																	checked={selectedIds.includes(hh.id!)}
																	onChange={() =>
																		onToggleSelect && onToggleSelect(hh.id!)
																	}
																	onClick={(e) => e.stopPropagation()}
																/>
															</td>
															<td className={TABLE_STYLES.stickyLeftSTT}>
																{stt}
															</td>
															{renderNameCell(hh, true, isExpanded)}
															<td className={TABLE_STYLES.td}>
																<VillageBadge name={hh.village_name} />
															</td>
															<td className={TABLE_STYLES.tdRight}>
																<NumberCell value={totalCrops} unit="ha" />
															</td>
															<td className={TABLE_STYLES.tdRight}>
																<NumberCell value={totalHerbs} unit="ha" />
															</td>
															<td className={TABLE_STYLES.tdRight}>
																<NumberCell
																	value={totalAnimals}
																	unit="con"
																	maxFractionDigits={0}
																/>
															</td>
															<td className={TABLE_STYLES.tdRight}>
																{!hh.fish_pond && !hh.fish_cage ? (
																	<span className={TABLE_STYLES.emptyCell}>
																		—
																	</span>
																) : (
																	<div className="flex flex-col items-end gap-0.5 justify-center">
																		{hh.fish_pond ? (
																			<NumberCell
																				value={hh.fish_pond}
																				unit="ha"
																			/>
																		) : null}
																		{hh.fish_cage ? (
																			<NumberCell
																				value={hh.fish_cage}
																				unit="lồng"
																				maxFractionDigits={0}
																			/>
																		) : null}
																	</div>
																)}
															</td>
															{renderActionCell(hh)}
														</tr>

														{/* Dòng accordion hiển thị chi tiết 18 chỉ số */}
														{isExpanded && (
															<tr className="bg-slate-50/90 dark:bg-slate-950/80 border-b border-slate-200/90 dark:border-slate-800">
																<td
																	colSpan={readOnly ? 8 : 9}
																	className="p-4 border-b border-slate-200/90 dark:border-slate-800"
																>
																	<div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-inner space-y-3">
																		<div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
																			<span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
																				<span>
																					Bảng kê chi tiết 18 chỉ số nông
																					nghiệp:
																				</span>
																				<strong className="text-emerald-600 dark:text-emerald-400">
																					{hh.full_name}
																				</strong>
																			</span>
																			<div className="flex items-center gap-2">
																				<span className="text-[11px] text-slate-400">
																					Thôn:
																				</span>
																				<VillageBadge name={hh.village_name} />
																			</div>
																		</div>
																		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs whitespace-normal">
																			{/* Cây trồng chính */}
																			<div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
																				<h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
																					<Trees
																						className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"
																						strokeWidth={1.5}
																					/>
																					<span>Cây Trồng Chính (8)</span>
																				</h4>
																				<div className="space-y-1 text-[11px]">
																					<div className="flex justify-between items-center">
																						<span className="text-slate-600 dark:text-slate-400">
																							Cà phê (Hộ):
																						</span>
																						<NumberCell
																							value={hh.cafe_household}
																							unit="ha"
																						/>
																					</div>
																					<div className="flex justify-between items-center">
																						<span className="text-slate-600 dark:text-slate-400">
																							Cà phê (Khoán):
																						</span>
																						<NumberCell
																							value={hh.cafe_contracted}
																							unit="ha"
																						/>
																					</div>
																					<div className="flex justify-between items-center">
																						<span className="text-slate-600 dark:text-slate-400">
																							Cao su (Hộ):
																						</span>
																						<NumberCell
																							value={hh.rubber_household}
																							unit="ha"
																						/>
																					</div>
																					<div className="flex justify-between items-center">
																						<span className="text-slate-600 dark:text-slate-400">
																							Cao su (Khoán):
																						</span>
																						<NumberCell
																							value={hh.rubber_contracted}
																							unit="ha"
																						/>
																					</div>
																					<div className="flex justify-between items-center">
																						<span className="text-slate-600 dark:text-slate-400">
																							Cây ăn quả:
																						</span>
																						<NumberCell
																							value={hh.fruit_tree}
																							unit="ha"
																						/>
																					</div>
																					<div className="flex justify-between items-center">
																						<span className="text-slate-600 dark:text-slate-400">
																							Mắc ca:
																						</span>
																						<NumberCell
																							value={hh.macadamia}
																							unit="ha"
																						/>
																					</div>
																					<div className="flex justify-between items-center">
																						<span className="text-slate-600 dark:text-slate-400">
																							Lúa nước:
																						</span>
																						<NumberCell
																							value={hh.wet_rice}
																							unit="ha"
																						/>
																					</div>
																					<div className="flex justify-between items-center">
																						<span className="text-slate-600 dark:text-slate-400">
																							Hàng năm khác:
																						</span>
																						<NumberCell
																							value={hh.other_annual_crops}
																							unit="ha"
																						/>
																					</div>
																				</div>
																			</div>

																			{/* Dược liệu */}
																			<div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
																				<h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
																					<Flower2
																						className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400"
																						strokeWidth={1.5}
																					/>
																					<span>Dược Liệu (4)</span>
																				</h4>
																				<div className="space-y-1 text-[11px]">
																					<div className="flex justify-between items-center">
																						<span className="text-slate-600 dark:text-slate-400">
																							Đinh lăng:
																						</span>
																						<NumberCell
																							value={hh.herb_dinh_lang}
																							unit="ha"
																						/>
																					</div>
																					<div className="flex justify-between items-center">
																						<span className="text-slate-600 dark:text-slate-400">
																							Gừng:
																						</span>
																						<NumberCell
																							value={hh.herb_gung}
																							unit="ha"
																						/>
																					</div>
																					<div className="flex justify-between items-center">
																						<span className="text-slate-600 dark:text-slate-400">
																							Nghệ:
																						</span>
																						<NumberCell
																							value={hh.herb_nghe}
																							unit="ha"
																						/>
																					</div>
																					<div className="flex justify-between items-center">
																						<span className="text-slate-600 dark:text-slate-400">
																							Sả:
																						</span>
																						<NumberCell
																							value={hh.herb_sa}
																							unit="ha"
																						/>
																					</div>
																				</div>
																			</div>

																			{/* Vật nuôi */}
																			<div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
																				<h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
																					<PawPrint
																						className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400"
																						strokeWidth={1.5}
																					/>
																					<span>Vật Nuôi (4)</span>
																				</h4>
																				<div className="space-y-1 text-[11px]">
																					<div className="flex justify-between items-center">
																						<span className="text-slate-600 dark:text-slate-400">
																							Đàn trâu:
																						</span>
																						<NumberCell
																							value={hh.buffalo}
																							unit="con"
																							maxFractionDigits={0}
																						/>
																					</div>
																					<div className="flex justify-between items-center">
																						<span className="text-slate-600 dark:text-slate-400">
																							Đàn bò:
																						</span>
																						<NumberCell
																							value={hh.cow}
																							unit="con"
																							maxFractionDigits={0}
																						/>
																					</div>
																					<div className="flex justify-between items-center">
																						<span className="text-slate-600 dark:text-slate-400">
																							Đàn heo:
																						</span>
																						<NumberCell
																							value={hh.pig}
																							unit="con"
																							maxFractionDigits={0}
																						/>
																					</div>
																					<div className="flex justify-between items-center">
																						<span className="text-slate-600 dark:text-slate-400">
																							Gia cầm:
																						</span>
																						<NumberCell
																							value={hh.poultry}
																							unit="con"
																							maxFractionDigits={0}
																						/>
																					</div>
																				</div>
																			</div>

																			{/* Thủy sản */}
																			<div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
																				<h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
																					<Fish
																						className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400"
																						strokeWidth={1.5}
																					/>
																					<span>Thủy Sản (2)</span>
																				</h4>
																				<div className="space-y-1 text-[11px]">
																					<div className="flex justify-between items-center">
																						<span className="text-slate-600 dark:text-slate-400">
																							Cá ao hồ:
																						</span>
																						<NumberCell
																							value={hh.fish_pond}
																							unit="ha"
																						/>
																					</div>
																					<div className="flex justify-between items-center">
																						<span className="text-slate-600 dark:text-slate-400">
																							Cá lồng bè:
																						</span>
																						<NumberCell
																							value={hh.fish_cage}
																							unit="lồng"
																							maxFractionDigits={0}
																						/>
																					</div>
																				</div>
																			</div>
																		</div>
																	</div>
																</td>
															</tr>
														)}
													</React.Fragment>
												);
											})}
							</tbody>
						</>
					)}

					{/* ========================================================================= */}
					{/* 2. VIEW MODE: CROPS (CÂY TRỒNG CHÍNH) */}
					{/* ========================================================================= */}
					{viewMode === "crops" && (
						<>
							<thead>
								<tr>
									<th
										className={`${TABLE_STYLES.thCenter} sticky left-0 z-20 w-10`}
									>
										<input
											type="checkbox"
											aria-label="Chọn tất cả hộ dân"
											className="w-4 h-4 cursor-pointer accent-emerald-600 rounded"
											checked={
												households.length > 0 &&
												selectedIds.length === households.length
											}
											onChange={() => onToggleSelectAll && onToggleSelectAll()}
										/>
									</th>
									<th
										className={`${TABLE_STYLES.thCenter} sticky left-10 z-20 w-12`}
									>
										STT
									</th>
									<th
										className={`${TABLE_STYLES.th} sticky left-[88px] z-20 min-w-[200px] shadow-[4px_0_10px_-2px_rgba(0,0,0,0.04)] dark:shadow-[4px_0_10px_-2px_rgba(0,0,0,0.2)]`}
									>
										Họ và Tên Chủ Hộ
									</th>
									<th className={`${TABLE_STYLES.th} min-w-[120px]`}>Thôn</th>
									<th className={TABLE_STYLES.thRight}>Cà phê (Hộ)</th>
									<th className={TABLE_STYLES.thRight}>Cà phê (Khoán)</th>
									<th className={TABLE_STYLES.thRight}>Cao su (Hộ)</th>
									<th className={TABLE_STYLES.thRight}>Cao su (Khoán)</th>
									<th className={TABLE_STYLES.thRight}>Ăn Quả</th>
									<th className={TABLE_STYLES.thRight}>Mắc Ca</th>
									<th className={TABLE_STYLES.thRight}>Lúa Nước</th>
									<th className={TABLE_STYLES.thRight}>Hàng Năm</th>
									{!readOnly && (
										<th
											className={`${TABLE_STYLES.thCenter} sticky right-0 z-20 min-w-[96px] shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.04)] dark:shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.2)]`}
										>
											Thao Tác
										</th>
									)}
								</tr>
							</thead>
							<tbody>
								{loading
									? renderLoading(
											readOnly ? 12 : 13,
											"Đang tải dữ liệu cây trồng...",
										)
									: households.length === 0
										? renderEmpty(readOnly ? 12 : 13)
										: households.map((hh, idx) => {
												const stt = (page - 1) * limit + idx + 1;
												return (
													<tr
														key={hh.id}
														onDoubleClick={() => !readOnly && onEdit(hh)}
														className={TABLE_STYLES.tr}
													>
														<td className={TABLE_STYLES.stickyLeftCheckbox}>
															<input
																type="checkbox"
																aria-label={`Chọn hộ ${hh.full_name}`}
																className="w-4 h-4 cursor-pointer accent-emerald-600 rounded"
																checked={selectedIds.includes(hh.id!)}
																onChange={() =>
																	onToggleSelect && onToggleSelect(hh.id!)
																}
																onClick={(e) => e.stopPropagation()}
															/>
														</td>
														<td className={TABLE_STYLES.stickyLeftSTT}>
															{stt}
														</td>
														{renderNameCell(hh)}
														<td className={TABLE_STYLES.td}>
															<VillageBadge name={hh.village_name} />
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell value={hh.cafe_household} unit="ha" />
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell
																value={hh.cafe_contracted}
																unit="ha"
															/>
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell
																value={hh.rubber_household}
																unit="ha"
															/>
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell
																value={hh.rubber_contracted}
																unit="ha"
															/>
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell value={hh.fruit_tree} unit="ha" />
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell value={hh.macadamia} unit="ha" />
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell value={hh.wet_rice} unit="ha" />
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell
																value={hh.other_annual_crops}
																unit="ha"
															/>
														</td>
														{renderActionCell(hh)}
													</tr>
												);
											})}
							</tbody>
						</>
					)}

					{/* ========================================================================= */}
					{/* 3. VIEW MODE: HERBS (DƯỢC LIỆU ĐĂK HÀ) */}
					{/* ========================================================================= */}
					{viewMode === "herbs" && (
						<>
							<thead>
								<tr>
									<th
										className={`${TABLE_STYLES.thCenter} sticky left-0 z-20 w-10`}
									>
										<input
											type="checkbox"
											aria-label="Chọn tất cả hộ dân"
											className="w-4 h-4 cursor-pointer accent-emerald-600 rounded"
											checked={
												households.length > 0 &&
												selectedIds.length === households.length
											}
											onChange={() => onToggleSelectAll && onToggleSelectAll()}
										/>
									</th>
									<th
										className={`${TABLE_STYLES.thCenter} sticky left-10 z-20 w-12`}
									>
										STT
									</th>
									<th
										className={`${TABLE_STYLES.th} sticky left-[88px] z-20 min-w-[200px] shadow-[4px_0_10px_-2px_rgba(0,0,0,0.04)] dark:shadow-[4px_0_10px_-2px_rgba(0,0,0,0.2)]`}
									>
										Họ và Tên Chủ Hộ
									</th>
									<th className={`${TABLE_STYLES.th} min-w-[120px]`}>Thôn</th>
									<th className={TABLE_STYLES.thRight}>Đinh Lăng</th>
									<th className={TABLE_STYLES.thRight}>Gừng</th>
									<th className={TABLE_STYLES.thRight}>Nghệ</th>
									<th className={TABLE_STYLES.thRight}>Sả</th>
									<th className={TABLE_STYLES.thRight}>Tổng Dược Liệu</th>
									{!readOnly && (
										<th
											className={`${TABLE_STYLES.thCenter} sticky right-0 z-20 min-w-[96px] shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.04)] dark:shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.2)]`}
										>
											Thao Tác
										</th>
									)}
								</tr>
							</thead>
							<tbody>
								{loading
									? renderLoading(
											readOnly ? 9 : 10,
											"Đang tải dữ liệu dược liệu...",
										)
									: households.length === 0
										? renderEmpty(readOnly ? 9 : 10)
										: households.map((hh, idx) => {
												const stt = (page - 1) * limit + idx + 1;
												const totalHerbs =
													(hh.herb_dinh_lang || 0) +
													(hh.herb_gung || 0) +
													(hh.herb_nghe || 0) +
													(hh.herb_sa || 0);

												return (
													<tr
														key={hh.id}
														onDoubleClick={() => !readOnly && onEdit(hh)}
														className={TABLE_STYLES.tr}
													>
														<td className={TABLE_STYLES.stickyLeftCheckbox}>
															<input
																type="checkbox"
																aria-label={`Chọn hộ ${hh.full_name}`}
																className="w-4 h-4 cursor-pointer accent-emerald-600 rounded"
																checked={selectedIds.includes(hh.id!)}
																onChange={() =>
																	onToggleSelect && onToggleSelect(hh.id!)
																}
																onClick={(e) => e.stopPropagation()}
															/>
														</td>
														<td className={TABLE_STYLES.stickyLeftSTT}>
															{stt}
														</td>
														{renderNameCell(hh)}
														<td className={TABLE_STYLES.td}>
															<VillageBadge name={hh.village_name} />
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell value={hh.herb_dinh_lang} unit="ha" />
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell value={hh.herb_gung} unit="ha" />
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell value={hh.herb_nghe} unit="ha" />
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell value={hh.herb_sa} unit="ha" />
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell value={totalHerbs} unit="ha" />
														</td>
														{renderActionCell(hh)}
													</tr>
												);
											})}
							</tbody>
						</>
					)}

					{/* ========================================================================= */}
					{/* 4. VIEW MODE: LIVESTOCK (ĐÀN VẬT NUÔI) */}
					{/* ========================================================================= */}
					{viewMode === "livestock" && (
						<>
							<thead>
								<tr>
									<th
										className={`${TABLE_STYLES.thCenter} sticky left-0 z-20 w-10`}
									>
										<input
											type="checkbox"
											aria-label="Chọn tất cả hộ dân"
											className="w-4 h-4 cursor-pointer accent-emerald-600 rounded"
											checked={
												households.length > 0 &&
												selectedIds.length === households.length
											}
											onChange={() => onToggleSelectAll && onToggleSelectAll()}
										/>
									</th>
									<th
										className={`${TABLE_STYLES.thCenter} sticky left-10 z-20 w-12`}
									>
										STT
									</th>
									<th
										className={`${TABLE_STYLES.th} sticky left-[88px] z-20 min-w-[200px] shadow-[4px_0_10px_-2px_rgba(0,0,0,0.04)] dark:shadow-[4px_0_10px_-2px_rgba(0,0,0,0.2)]`}
									>
										Họ và Tên Chủ Hộ
									</th>
									<th className={`${TABLE_STYLES.th} min-w-[120px]`}>Thôn</th>
									<th className={TABLE_STYLES.thRight}>Đàn Trâu</th>
									<th className={TABLE_STYLES.thRight}>Đàn Bò</th>
									<th className={TABLE_STYLES.thRight}>Đàn Heo</th>
									<th className={TABLE_STYLES.thRight}>Gia Cầm</th>
									<th className={TABLE_STYLES.thRight}>Tổng Đàn</th>
									{!readOnly && (
										<th
											className={`${TABLE_STYLES.thCenter} sticky right-0 z-20 min-w-[96px] shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.04)] dark:shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.2)]`}
										>
											Thao Tác
										</th>
									)}
								</tr>
							</thead>
							<tbody>
								{loading
									? renderLoading(
											readOnly ? 9 : 10,
											"Đang tải dữ liệu vật nuôi...",
										)
									: households.length === 0
										? renderEmpty(readOnly ? 9 : 10)
										: households.map((hh, idx) => {
												const stt = (page - 1) * limit + idx + 1;
												const totalAnimals =
													(hh.buffalo || 0) +
													(hh.cow || 0) +
													(hh.pig || 0) +
													(hh.poultry || 0);

												return (
													<tr
														key={hh.id}
														onDoubleClick={() => !readOnly && onEdit(hh)}
														className={TABLE_STYLES.tr}
													>
														<td className={TABLE_STYLES.stickyLeftCheckbox}>
															<input
																type="checkbox"
																aria-label={`Chọn hộ ${hh.full_name}`}
																className="w-4 h-4 cursor-pointer accent-emerald-600 rounded"
																checked={selectedIds.includes(hh.id!)}
																onChange={() =>
																	onToggleSelect && onToggleSelect(hh.id!)
																}
																onClick={(e) => e.stopPropagation()}
															/>
														</td>
														<td className={TABLE_STYLES.stickyLeftSTT}>
															{stt}
														</td>
														{renderNameCell(hh)}
														<td className={TABLE_STYLES.td}>
															<VillageBadge name={hh.village_name} />
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell
																value={hh.buffalo}
																unit="con"
																maxFractionDigits={0}
															/>
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell
																value={hh.cow}
																unit="con"
																maxFractionDigits={0}
															/>
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell
																value={hh.pig}
																unit="con"
																maxFractionDigits={0}
															/>
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell
																value={hh.poultry}
																unit="con"
																maxFractionDigits={0}
															/>
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell
																value={totalAnimals}
																unit="con"
																maxFractionDigits={0}
															/>
														</td>
														{renderActionCell(hh)}
													</tr>
												);
											})}
							</tbody>
						</>
					)}

					{/* ========================================================================= */}
					{/* 5. VIEW MODE: AQUACULTURE (THỦY SẢN) */}
					{/* ========================================================================= */}
					{viewMode === "aquaculture" && (
						<>
							<thead>
								<tr>
									<th
										className={`${TABLE_STYLES.thCenter} sticky left-0 z-20 w-10`}
									>
										<input
											type="checkbox"
											aria-label="Chọn tất cả hộ dân"
											className="w-4 h-4 cursor-pointer accent-emerald-600 rounded"
											checked={
												households.length > 0 &&
												selectedIds.length === households.length
											}
											onChange={() => onToggleSelectAll && onToggleSelectAll()}
										/>
									</th>
									<th
										className={`${TABLE_STYLES.thCenter} sticky left-10 z-20 w-12`}
									>
										STT
									</th>
									<th
										className={`${TABLE_STYLES.th} sticky left-[88px] z-20 min-w-[200px] shadow-[4px_0_10px_-2px_rgba(0,0,0,0.04)] dark:shadow-[4px_0_10px_-2px_rgba(0,0,0,0.2)]`}
									>
										Họ và Tên Chủ Hộ
									</th>
									<th className={`${TABLE_STYLES.th} min-w-[120px]`}>Thôn</th>
									<th className={TABLE_STYLES.thRight}>Cá Ao Hồ</th>
									<th className={TABLE_STYLES.thRight}>Cá Lồng Bè</th>
									{!readOnly && (
										<th
											className={`${TABLE_STYLES.thCenter} sticky right-0 z-20 min-w-[96px] shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.04)] dark:shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.2)]`}
										>
											Thao Tác
										</th>
									)}
								</tr>
							</thead>
							<tbody>
								{loading
									? renderLoading(
											readOnly ? 6 : 7,
											"Đang tải dữ liệu thủy sản...",
										)
									: households.length === 0
										? renderEmpty(readOnly ? 6 : 7)
										: households.map((hh, idx) => {
												const stt = (page - 1) * limit + idx + 1;
												return (
													<tr
														key={hh.id}
														onDoubleClick={() => !readOnly && onEdit(hh)}
														className={TABLE_STYLES.tr}
													>
														<td className={TABLE_STYLES.stickyLeftCheckbox}>
															<input
																type="checkbox"
																aria-label={`Chọn hộ ${hh.full_name}`}
																className="w-4 h-4 cursor-pointer accent-emerald-600 rounded"
																checked={selectedIds.includes(hh.id!)}
																onChange={() =>
																	onToggleSelect && onToggleSelect(hh.id!)
																}
																onClick={(e) => e.stopPropagation()}
															/>
														</td>
														<td className={TABLE_STYLES.stickyLeftSTT}>
															{stt}
														</td>
														{renderNameCell(hh)}
														<td className={TABLE_STYLES.td}>
															<VillageBadge name={hh.village_name} />
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell value={hh.fish_pond} unit="ha" />
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell
																value={hh.fish_cage}
																unit="lồng"
																maxFractionDigits={0}
															/>
														</td>
														{renderActionCell(hh)}
													</tr>
												);
											})}
							</tbody>
						</>
					)}

					{/* ========================================================================= */}
					{/* 6. VIEW MODE: FULL (21 CỘT MA TRẬN ĐẦY ĐỦ) */}
					{/* ========================================================================= */}
					{viewMode === "full" && (
						<>
							<thead>
								<tr>
									<th
										rowSpan={2}
										className={`${TABLE_STYLES.thCenter} sticky left-0 z-20 w-10`}
									>
										<input
											type="checkbox"
											aria-label="Chọn tất cả hộ dân"
											className="w-4 h-4 cursor-pointer accent-emerald-600 rounded"
											checked={
												households.length > 0 &&
												selectedIds.length === households.length
											}
											onChange={() => onToggleSelectAll && onToggleSelectAll()}
										/>
									</th>
									<th
										rowSpan={2}
										className={`${TABLE_STYLES.thCenter} sticky left-10 z-20 w-12`}
									>
										STT
									</th>
									<th
										rowSpan={2}
										className={`${TABLE_STYLES.th} sticky left-[88px] z-20 min-w-[200px] shadow-[4px_0_10px_-2px_rgba(0,0,0,0.04)] dark:shadow-[4px_0_10px_-2px_rgba(0,0,0,0.2)]`}
									>
										Họ và Tên Chủ Hộ
									</th>
									<th
										rowSpan={2}
										className={`${TABLE_STYLES.th} min-w-[120px]`}
									>
										Thôn Quản Lý
									</th>

									<th colSpan={8} className={TABLE_STYLES.thCenter}>
										1. Cây Trồng Chính (ha)
									</th>
									<th colSpan={4} className={TABLE_STYLES.thCenter}>
										2. Dược Liệu Đăk Hà (ha)
									</th>
									<th colSpan={4} className={TABLE_STYLES.thCenter}>
										3. Đàn Vật Nuôi (con)
									</th>
									<th colSpan={2} className={TABLE_STYLES.thCenter}>
										4. Thủy Sản
									</th>
									{!readOnly && (
										<th
											rowSpan={2}
											className={`${TABLE_STYLES.thCenter} sticky right-0 z-20 min-w-[96px] shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.04)] dark:shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.2)]`}
										>
											Thao Tác
										</th>
									)}
								</tr>

								<tr>
									{/* Cây trồng */}
									<th className={TABLE_STYLES.thRight}>Cà phê (Hộ)</th>
									<th className={TABLE_STYLES.thRight}>Cà phê (Khoán)</th>
									<th className={TABLE_STYLES.thRight}>Cao su (Hộ)</th>
									<th className={TABLE_STYLES.thRight}>Cao su (Khoán)</th>
									<th className={TABLE_STYLES.thRight}>Ăn quả</th>
									<th className={TABLE_STYLES.thRight}>Mắc ca</th>
									<th className={TABLE_STYLES.thRight}>Lúa nước</th>
									<th className={TABLE_STYLES.thRight}>Hàng năm</th>

									{/* Dược liệu */}
									<th className={TABLE_STYLES.thRight}>Đinh lăng</th>
									<th className={TABLE_STYLES.thRight}>Gừng</th>
									<th className={TABLE_STYLES.thRight}>Nghệ</th>
									<th className={TABLE_STYLES.thRight}>Sả</th>

									{/* Vật nuôi */}
									<th className={TABLE_STYLES.thRight}>Trâu</th>
									<th className={TABLE_STYLES.thRight}>Bò</th>
									<th className={TABLE_STYLES.thRight}>Heo</th>
									<th className={TABLE_STYLES.thRight}>Gia cầm</th>

									{/* Thủy sản */}
									<th className={TABLE_STYLES.thRight}>Cá ao (ha)</th>
									<th className={TABLE_STYLES.thRight}>Cá lồng (lồng)</th>
								</tr>
							</thead>
							<tbody>
								{loading
									? renderLoading(
											readOnly ? 22 : 23,
											"Đang tải dữ liệu tổng hợp 21 chỉ số...",
										)
									: households.length === 0
										? renderEmpty(readOnly ? 22 : 23)
										: households.map((hh, idx) => {
												const stt = (page - 1) * limit + idx + 1;
												return (
													<tr
														key={hh.id}
														onDoubleClick={() => !readOnly && onEdit(hh)}
														className={TABLE_STYLES.tr}
													>
														<td className={TABLE_STYLES.stickyLeftCheckbox}>
															<input
																type="checkbox"
																aria-label={`Chọn hộ ${hh.full_name}`}
																className="w-4 h-4 cursor-pointer accent-emerald-600 rounded"
																checked={selectedIds.includes(hh.id!)}
																onChange={() =>
																	onToggleSelect && onToggleSelect(hh.id!)
																}
																onClick={(e) => e.stopPropagation()}
															/>
														</td>
														<td className={TABLE_STYLES.stickyLeftSTT}>
															{stt}
														</td>
														{renderNameCell(hh)}
														<td className={TABLE_STYLES.td}>
															<VillageBadge name={hh.village_name} />
														</td>

														{/* Cây trồng */}
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell value={hh.cafe_household} unit="ha" />
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell
																value={hh.cafe_contracted}
																unit="ha"
															/>
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell
																value={hh.rubber_household}
																unit="ha"
															/>
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell
																value={hh.rubber_contracted}
																unit="ha"
															/>
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell value={hh.fruit_tree} unit="ha" />
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell value={hh.macadamia} unit="ha" />
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell value={hh.wet_rice} unit="ha" />
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell
																value={hh.other_annual_crops}
																unit="ha"
															/>
														</td>

														{/* Dược liệu */}
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell value={hh.herb_dinh_lang} unit="ha" />
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell value={hh.herb_gung} unit="ha" />
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell value={hh.herb_nghe} unit="ha" />
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell value={hh.herb_sa} unit="ha" />
														</td>

														{/* Vật nuôi */}
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell
																value={hh.buffalo}
																unit="con"
																maxFractionDigits={0}
															/>
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell
																value={hh.cow}
																unit="con"
																maxFractionDigits={0}
															/>
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell
																value={hh.pig}
																unit="con"
																maxFractionDigits={0}
															/>
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell
																value={hh.poultry}
																unit="con"
																maxFractionDigits={0}
															/>
														</td>

														{/* Thủy sản */}
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell value={hh.fish_pond} unit="ha" />
														</td>
														<td className={TABLE_STYLES.tdRight}>
															<NumberCell
																value={hh.fish_cage}
																unit="lồng"
																maxFractionDigits={0}
															/>
														</td>

														{renderActionCell(hh)}
													</tr>
												);
											})}
							</tbody>
						</>
					)}
				</table>
			</div>

			{/* 4. Phân trang chuẩn */}
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
