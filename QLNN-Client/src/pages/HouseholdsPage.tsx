import {
	ArrowLeft,
	Download,
	FileSpreadsheet,
	Plus,
	Users,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "../AppContext";
import { excelApi } from "../api/excelApi";
import { householdApi } from "../api/householdApi";
import { ExportSettingsModal } from "../components/excel/ExportSettingsModal";
import { ImportPreviewModal } from "../components/excel/ImportPreviewModal";
import {
	HouseholdFilterBar,
	type ProductionTypeFilter,
	type ScaleFilter,
	type SortOption,
} from "../components/households/HouseholdFilterBar";
import { HouseholdModal } from "../components/households/HouseholdModal";
import { HouseholdTable } from "../components/households/HouseholdTable";
import { getCache, setCache } from "../db/indexedDB";
import { useDebounce } from "../hooks/useDebounce";
import { useModal } from "../hooks/useModal";
import type { HouseholdFlat } from "../types";

export const HouseholdsPage: React.FC = () => {
	const {
		user,
		selectedVillageId,
		setSelectedVillageId,
		selectedVillageName,
		setActiveTab,
		isOnline,
		isBackendHealthy,
	} = useApp();
	const isDisconnected = !isOnline || !isBackendHealthy;
	const { showModal } = useModal();

	const [households, setHouseholds] = useState<HouseholdFlat[]>([]);
	const [loading, setLoading] = useState(false);
	const [total, setTotal] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const page = currentPage;
	const setPage = setCurrentPage;
	const [limit, setLimit] = useState(20);
	const [totalPages, setTotalPages] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const search = searchQuery;
	const setSearch = setSearchQuery;
	const debouncedSearch = useDebounce(searchQuery, 300);
	const [scaleFilter, setScaleFilter] = useState<ScaleFilter>("all");
	const [typeFilter, setTypeFilter] = useState<ProductionTypeFilter>("all");
	const [sortBy, setSortBy] = useState<SortOption>("default");
	const [isAllExpanded, setIsAllExpanded] = useState(false);

	const handleToggleExpandAll = () => {
		setIsAllExpanded((prev) => !prev);
	};

	const handleResetFilters = () => {
		setSearchQuery("");
		setScaleFilter("all");
		setTypeFilter("all");
		setSortBy("default");
		setCurrentPage(1);
	};

	const [undoAction, setUndoAction] = useState<{ ids: string[] } | null>(null);

	useEffect(() => {
		if (undoAction) {
			const timer = setTimeout(() => {
				setUndoAction(null);
			}, 15000);
			return () => clearTimeout(timer);
		}
	}, [undoAction]);

	// Excel logic
	const fileInputRef = React.useRef<HTMLInputElement>(null);
	const [importFile, setImportFile] = useState<File | null>(null);
	const [importData, setImportData] = useState<
		(string | number | undefined)[][]
	>([]);
	const [isImportModalOpen, setIsImportModalOpen] = useState(false);
	const [isExportModalOpen, setIsExportModalOpen] = useState(false);
	const [importing, setImporting] = useState(false);
	const [exporting, setExporting] = useState(false);

	const handleFileParse = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const lowerName = file.name.toLowerCase();
		if (
			!lowerName.endsWith(".xls") &&
			!lowerName.endsWith(".xlsx") &&
			!lowerName.endsWith(".csv")
		) {
			showModal({
				title: "Lỗi",
				message: "Chỉ chấp nhận file định dạng .xlsx, .xls hoặc .csv",
				type: "danger",
			});
			return;
		}

		setImportFile(file);
		setImportData([]);
		setIsImportModalOpen(true);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const handleImportConfirm = async (file: File) => {
		setImporting(true);
		try {
			const targetVillage =
				user?.role === "admin" ? selectedVillageId : undefined;
			const res = await excelApi.importExcel(file, targetVillage);
			showModal({
				title: "Thành công",
				message: `Đã xử lý ${res.totalRowsParsed} hộ:\n• Thêm: ${res.createdCount}\n• Cập nhật: ${res.updatedCount}`,
				type: "info",
				onConfirm: () => {
					setIsImportModalOpen(false);
					setImportFile(null);
					setImportData([]);
					fetchHouseholds();
				},
			});
		} catch (err: unknown) {
			const error = err as { response?: { data?: { error?: string } } };
			showModal({
				title: "Lỗi",
				message: error.response?.data?.error || "Lỗi nhập dữ liệu",
				type: "danger",
			});
		} finally {
			setImporting(false);
		}
	};

	const handleExportConfirm = async (exportScope: "all" | "selected") => {
		setExporting(true);
		try {
			const targetVillage =
				user?.role === "admin" ? selectedVillageId : undefined;
			const selectedIds =
				exportScope === "selected" ? selectedHouseholdIds : undefined;
			const blob = await excelApi.exportExcel(targetVillage, selectedIds);
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `Thong_ke_nong_nghiep_${new Date().toISOString().slice(0, 10)}.xlsx`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
			setIsExportModalOpen(false);
		} catch (_err) {
			showModal({ title: "Lỗi", message: "Lỗi xuất dữ liệu", type: "danger" });
		} finally {
			setExporting(false);
		}
	};

	// Modals state
	const [modalOpen, setModalOpen] = useState(false);
	const [editingHousehold, setEditingHousehold] =
		useState<HouseholdFlat | null>(null);

	const [isUsingCachedData, setIsUsingCachedData] = useState(false);

	const [selectedHouseholdIds, setSelectedHouseholdIds] = useState<string[]>(
		[],
	);

	const filteredAndSortedHouseholds = useMemo(() => {
		// Dữ liệu đã được lọc theo Quy mô, Loại hình và Sắp xếp chuẩn xác từ API backend
		return households;
	}, [households]);

	const onToggleSelect = (id: string) => {
		setSelectedHouseholdIds((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
		);
	};

	const onToggleSelectAll = () => {
		if (
			filteredAndSortedHouseholds.length > 0 &&
			selectedHouseholdIds.length === filteredAndSortedHouseholds.length
		) {
			setSelectedHouseholdIds([]);
		} else {
			setSelectedHouseholdIds(
				filteredAndSortedHouseholds.map((hh) => hh.id as string),
			);
		}
	};

	const fetchHouseholds = useCallback(async () => {
		setLoading(true);
		const targetVillage =
			user?.role === "admin" ? selectedVillageId || undefined : undefined;
		const effectiveVillage =
			user?.role === "admin"
				? selectedVillageId || "all"
				: user?.village_id || "chief_village";
		const cacheKey = `households_${user?.role}_${effectiveVillage}_${currentPage}_${limit}_${debouncedSearch.trim()}_${scaleFilter}_${typeFilter}_${sortBy}`;
		try {
			const res = await householdApi.getHouseholds({
				villageId: targetVillage,
				search: debouncedSearch.trim() || undefined,
				page: currentPage,
				limit,
				scaleFilter: scaleFilter !== "all" ? scaleFilter : undefined,
				typeFilter: typeFilter !== "all" ? typeFilter : undefined,
				sortBy: sortBy !== "default" ? sortBy : undefined,
			});
			setHouseholds(res.data);
			setTotal(res.pagination.total);
			setTotalPages(res.pagination.totalPages);
			setIsUsingCachedData(false);
			await setCache(cacheKey, res);
		} catch (err: unknown) {
			const error = err as { message?: string; response?: { status?: number } };
			if (
				error.message === "Network Error" ||
				(error.response && (error.response.status ?? 0) >= 500)
			) {
				const cached = await getCache<{
					data: HouseholdFlat[];
					pagination: { total: number; totalPages: number };
				}>(cacheKey);
				if (cached) {
					setHouseholds(cached.data);
					setTotal(cached.pagination.total);
					setTotalPages(cached.pagination.totalPages);
					setIsUsingCachedData(true);
				}
			}
			console.error("Fetch households error:", err);
		} finally {
			setLoading(false);
		}
	}, [
		selectedVillageId,
		debouncedSearch,
		currentPage,
		limit,
		user?.role,
		user?.village_id,
		scaleFilter,
		typeFilter,
		sortBy,
	]);

	useEffect(() => {
		fetchHouseholds();
	}, [fetchHouseholds]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Reset page on filter changes
	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery, scaleFilter, typeFilter, sortBy, selectedVillageId]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Clear selections on pagination/filter changes
	useEffect(() => {
		setSelectedHouseholdIds([]);
	}, [
		currentPage,
		limit,
		debouncedSearch,
		selectedVillageId,
		scaleFilter,
		typeFilter,
		sortBy,
	]);

	// Lắng nghe sự kiện kết nối lại máy chủ để tự động đồng bộ lại danh sách
	useEffect(() => {
		const handleReconnected = () => {
			fetchHouseholds();
		};
		window.addEventListener("server:reconnected", handleReconnected);
		return () =>
			window.removeEventListener("server:reconnected", handleReconnected);
	}, [fetchHouseholds]);

	const handleAdd = () => {
		setEditingHousehold(null);
		setModalOpen(true);
	};

	const handleEdit = (hh: HouseholdFlat) => {
		setEditingHousehold(hh);
		setModalOpen(true);
	};

	const handleDelete = (hh: HouseholdFlat) => {
		showModal({
			title: "Chuyển vào Thùng Rác",
			message: `Bạn có chắc chắn muốn xóa hộ "${hh.full_name}" thuộc ${hh.village_name || "thôn"} không?\nHộ sẽ được chuyển vào Thùng rác và có thể khôi phục lại bất kỳ lúc nào.`,
			type: "danger",
			confirmText: "Xác Nhận Xóa",
			cancelText: "Hủy Bỏ",
			onConfirm: async () => {
				try {
					if (hh.id) {
						await householdApi.delete(hh.id);
						setUndoAction({ ids: [hh.id] });
						fetchHouseholds();
					}
				} catch (err) {
					console.error("Delete error:", err);
					showModal({
						title: "Lỗi",
						message: "Không thể xóa hộ dân. Vui lòng thử lại sau.",
						type: "danger",
					});
				}
			},
		});
	};

	const handleBatchDelete = () => {
		if (selectedHouseholdIds.length === 0) return;
		showModal({
			title: "Chuyển vào Thùng Rác hàng loạt",
			message: `Bạn có chắc chắn muốn xóa ${selectedHouseholdIds.length} hộ đã chọn?\nCác hộ sẽ được chuyển vào Thùng rác và có thể khôi phục lại.`,
			type: "danger",
			confirmText: "Xác Nhận Xóa",
			cancelText: "Hủy",
			onConfirm: async () => {
				try {
					const deletedIds = [...selectedHouseholdIds];
					await householdApi.bulkDelete(selectedHouseholdIds);
					setSelectedHouseholdIds([]);
					setUndoAction({ ids: deletedIds });
					fetchHouseholds();
				} catch (_err) {
					showModal({
						title: "Lỗi",
						message: "Không thể xóa hàng loạt.",
						type: "danger",
					});
				}
			},
		});
	};

	return (
		<div className="space-y-5 animate-in fade-in duration-150">
			{/* Top Banner & Main Actions */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors duration-150">
				<div>
					<div className="flex items-center gap-2.5 flex-wrap">
						<span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
							{selectedVillageName || "Toàn xã Đăk Hà"}
						</span>

						{isUsingCachedData && (
							<div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-bold shadow-xs animate-in fade-in">
								<span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block mr-1.5" />
								<span>Ngoại tuyến (Offline Cache)</span>
							</div>
						)}

						<h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
							<Users
								className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
								strokeWidth={1.5}
							/>
							<span>Danh Sách Hộ Nông Nghiệp</span>
							<span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs tabular-nums font-bold border border-emerald-200 dark:border-emerald-800">
								{total} hộ
							</span>
						</h2>
					</div>
					<p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
						Quản lý 18 chỉ số kê khai nông nghiệp, diện tích cây trồng và đàn
						vật nuôi xã Đăk Hà
					</p>
				</div>

				<div className="flex items-center gap-2.5 flex-wrap">
					{user?.role === "admin" && selectedVillageId && (
						<button
							type="button"
							onClick={() => {
								setSelectedVillageId("");
								setActiveTab("villages");
							}}
							className="h-10 flex items-center justify-center gap-1.5 px-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all active:scale-[0.99] cursor-pointer border border-slate-200 dark:border-slate-700"
						>
							<ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
							<span>Đổi thôn</span>
						</button>
					)}

					<input
						type="file"
						ref={fileInputRef}
						hidden
						accept=".xls,.xlsx"
						onChange={handleFileParse}
					/>
					<button
						type="button"
						onClick={() => {
							setImportFile(null);
							setImportData([]);
							setIsImportModalOpen(true);
						}}
						disabled={isDisconnected}
						className="h-10 flex items-center gap-1.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all disabled:opacity-50 active:scale-[0.99] cursor-pointer border border-slate-200 dark:border-slate-700 shadow-xs"
					>
						<FileSpreadsheet
							className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
							strokeWidth={1.5}
						/>
						<span>Nhập Excel</span>
					</button>

					<button
						type="button"
						onClick={() => setIsExportModalOpen(true)}
						disabled={exporting}
						className="h-10 flex items-center gap-1.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all disabled:opacity-50 active:scale-[0.99] cursor-pointer border border-slate-200 dark:border-slate-700 shadow-xs"
					>
						<Download
							className="w-4 h-4 text-blue-600 dark:text-blue-400"
							strokeWidth={1.5}
						/>
						<span>{exporting ? "Đang xuất..." : "Xuất Excel"}</span>
					</button>

					<button
						type="button"
						onClick={handleAdd}
						disabled={isDisconnected}
						className="h-10 flex items-center gap-1.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
					>
						<Plus className="w-4 h-4" strokeWidth={1.5} />
						<span>Thêm Hộ Dân</span>
					</button>
				</div>
			</div>

			<HouseholdFilterBar
				search={search}
				setSearch={setSearch}
				loading={loading}
				onRefresh={fetchHouseholds}
				scaleFilter={scaleFilter}
				setScaleFilter={setScaleFilter}
				typeFilter={typeFilter}
				setTypeFilter={setTypeFilter}
				sortBy={sortBy}
				setSortBy={setSortBy}
				isAllExpanded={isAllExpanded}
				onToggleExpandAll={handleToggleExpandAll}
				onResetFilters={handleResetFilters}
				selectedCount={selectedHouseholdIds.length}
				onDeselectAll={() => setSelectedHouseholdIds([])}
				onExportSelected={() => handleExportConfirm("selected")}
				onDeleteSelected={handleBatchDelete}
			/>

			{/* Main Table */}
			<HouseholdTable
				selectedIds={selectedHouseholdIds}
				onToggleSelect={onToggleSelect}
				onToggleSelectAll={onToggleSelectAll}
				households={filteredAndSortedHouseholds}
				loading={loading}
				total={total}
				page={page}
				limit={limit}
				totalPages={totalPages}
				onPageChange={(p) => setPage(p)}
				onLimitChange={(l) => {
					setLimit(l);
					setPage(1);
				}}
				onEdit={handleEdit}
				onDelete={handleDelete}
				isAllExpanded={isAllExpanded}
				onToggleExpandAll={handleToggleExpandAll}
			/>

			{/* Modal Thêm / Sửa */}
			<HouseholdModal
				isOpen={modalOpen}
				household={editingHousehold}
				onClose={() => setModalOpen(false)}
				onSuccess={fetchHouseholds}
			/>

			<ImportPreviewModal
				isOpen={isImportModalOpen}
				onClose={() => {
					setIsImportModalOpen(false);
					setImportFile(null);
					setImportData([]);
				}}
				file={importFile}
				villageId={
					user?.role === "admin" ? selectedVillageId : user?.village_id
				}
				parsedData={importData}
				onConfirm={handleImportConfirm}
				importing={importing}
				onChangeFile={() => {
					setImportFile(null);
					setImportData([]);
				}}
				onFileSelected={(file, rows) => {
					setImportFile(file);
					setImportData(rows);
				}}
			/>

			<ExportSettingsModal
				isOpen={isExportModalOpen}
				onClose={() => setIsExportModalOpen(false)}
				onExport={handleExportConfirm}
				selectedCount={selectedHouseholdIds.length}
				exporting={exporting}
				isAdmin={user?.role === "admin"}
			/>

			{undoAction && (
				<div className="fixed bottom-6 right-6 z-50 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5">
					<span className="text-sm font-medium">
						Đã xóa {undoAction.ids.length} hộ nông nghiệp.
					</span>
					<button
						type="button"
						aria-label="Hoàn tác xóa hộ nông nghiệp"
						onClick={async () => {
							try {
								await householdApi.restore(undoAction.ids);
								setUndoAction(null);
								fetchHouseholds();
							} catch (_e) {
								showModal({
									title: "Lỗi",
									message: "Lỗi hoàn tác dữ liệu",
									type: "danger",
								});
							}
						}}
						className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors uppercase text-xs tracking-wider cursor-pointer"
					>
						Hoàn tác
					</button>
				</div>
			)}
		</div>
	);
};
