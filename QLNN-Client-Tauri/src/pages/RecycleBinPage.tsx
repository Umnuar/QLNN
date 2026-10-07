import { ArrowLeft, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "../AppContext";
import { householdApi } from "../api/householdApi";
import { RecycleBinTable } from "../components/households/RecycleBinTable";
import { useModal } from "../hooks/useModal";
import type { HouseholdFlat } from "../types";

export const RecycleBinPage: React.FC = () => {
	const { user, setActiveTab } = useApp();
	const { showModal } = useModal();
	const [households, setHouseholds] = useState<HouseholdFlat[]>([]);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 50,
		total: 0,
		totalPages: 1,
	});
	const paginationRef = useRef(pagination);
	paginationRef.current = pagination;

	const fetchDeleted = useCallback(
		async (page?: number, limit?: number) => {
			setLoading(true);
			try {
				const targetPage = page ?? paginationRef.current.page;
				const targetLimit = limit ?? paginationRef.current.limit;
				const res = await householdApi.getDeleted({
					page: targetPage,
					limit: targetLimit,
				});
				setHouseholds(res.data);
				setPagination(res.pagination);
			} catch (error) {
				console.error("Failed to fetch deleted households", error);
				showModal({
					title: "Lỗi",
					message: "Lỗi tải danh sách đã xóa",
					type: "danger",
				});
			} finally {
				setLoading(false);
			}
		},
		[showModal],
	);

	useEffect(() => {
		fetchDeleted();
	}, [fetchDeleted]);

	const handleRestore = async (ids: string[]) => {
		try {
			await householdApi.restore(ids);
			setSelectedIds([]);
			fetchDeleted();
		} catch (err: unknown) {
			const error = err as { response?: { data?: { error?: string } } };
			showModal({
				title: "Lỗi",
				message: error.response?.data?.error || "Lỗi khôi phục",
				type: "danger",
			});
		}
	};

	const handleHardDelete = async (ids: string[]) => {
		if (
			!window.confirm(
				"Cảnh báo: Hành động này sẽ xóa vĩnh viễn dữ liệu và không thể khôi phục! Bạn có chắc chắn?",
			)
		)
			return;
		try {
			await householdApi.hardDelete(ids);
			setSelectedIds([]);
			fetchDeleted();
		} catch (err: unknown) {
			const error = err as { response?: { data?: { error?: string } } };
			showModal({
				title: "Lỗi",
				message: error.response?.data?.error || "Lỗi xóa vĩnh viễn",
				type: "danger",
			});
		}
	};

	const handleToggleSelect = (id: string) => {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
		);
	};

	const handleToggleSelectAll = () => {
		if (selectedIds.length === households.length && households.length > 0) {
			setSelectedIds([]);
		} else {
			setSelectedIds(
				households.map((h) => h.id).filter((id): id is string => Boolean(id)),
			);
		}
	};

	return (
		<div className="space-y-6 animate-in fade-in pb-10">
			{/* Top Banner matching QLHK */}
			<div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-150">
				<div>
					<div className="flex items-center gap-2.5">
						<span className="px-3 py-1 rounded-xl text-xs font-black bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 uppercase tracking-wider">
							Thùng Rác ({pagination.total})
						</span>
						<h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
							<Trash2
								className="w-6 h-6 text-rose-600 dark:text-rose-400"
								strokeWidth={1.5}
							/>
							<span>Thùng Rác Hộ Nông Nghiệp</span>
						</h2>
					</div>
					<p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
						Quản lý các hộ dân đã xóa tạm, hỗ trợ khôi phục nguyên trạng hoặc
						xóa vĩnh viễn
					</p>
				</div>

				<div className="flex items-center gap-2.5 flex-wrap">
					<button
						type="button"
						onClick={() => setActiveTab("households")}
						className="h-10 flex items-center justify-center gap-1.5 px-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 cursor-pointer active:scale-95"
					>
						<ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
						<span>Về danh sách Hộ Nông Nghiệp</span>
					</button>

					<button
						type="button"
						onClick={() => fetchDeleted()}
						className="h-10 flex items-center justify-center gap-1.5 px-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer active:scale-95"
					>
						<RefreshCw
							className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
							strokeWidth={1.5}
						/>
						<span>Làm mới</span>
					</button>

					{selectedIds.length > 0 && (
						<>
							<button
								type="button"
								onClick={() => handleRestore(selectedIds)}
								className="h-10 flex items-center gap-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 animate-in fade-in"
							>
								<RotateCcw className="w-4 h-4" strokeWidth={1.5} />
								<span>Khôi Phục ({selectedIds.length})</span>
							</button>

							{user?.role === "admin" && (
								<button
									type="button"
									onClick={() => handleHardDelete(selectedIds)}
									className="h-10 flex items-center gap-1.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 animate-in fade-in"
								>
									<Trash2 className="w-4 h-4" strokeWidth={1.5} />
									<span>Xóa Vĩnh Viễn ({selectedIds.length})</span>
								</button>
							)}
						</>
					)}
				</div>
			</div>

			<RecycleBinTable
				households={households}
				loading={loading}
				total={pagination.total}
				page={pagination.page}
				limit={pagination.limit}
				totalPages={pagination.totalPages}
				selectedIds={selectedIds}
				onToggleSelect={handleToggleSelect}
				onToggleSelectAll={handleToggleSelectAll}
				onPageChange={(page) => fetchDeleted(page)}
				onLimitChange={(limit) => fetchDeleted(1, limit)}
				onEdit={() => {}}
				onRestore={(hh) => hh.id && handleRestore([hh.id])}
				onDelete={(hh) => hh.id && handleHardDelete([hh.id])}
				canDelete={user?.role !== "user"}
			/>
		</div>
	);
};
export default RecycleBinPage;
