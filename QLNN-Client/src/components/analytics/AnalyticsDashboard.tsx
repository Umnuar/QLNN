import {
	ArrowLeft,
	BarChart3,
	Building2,
	Download,
	Fish,
	PawPrint,
	PieChart,
	RefreshCw,
	Shield,
	Trees,
	Zap,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { useApp } from "../../AppContext";
import { analyticsApi } from "../../api/analyticsApi";
import { getCache, setCache } from "../../db/indexedDB";
import type { OverviewAnalytics, VillageAnalytics } from "../../types";
import { cryptoHelper } from "../../utils/cryptoHelper";

// Component Donut Chart SVG nhẹ (Vibe tối giản QLHK)
const MiniDonut: React.FC<{
	val1: number;
	label1: string;
	color1: string;
	val2: number;
	label2: string;
	color2: string;
	unit: string;
}> = ({ val1, label1, color1, val2, label2, color2, unit }) => {
	const total = val1 + val2;
	if (total <= 0) {
		return (
			<div className="text-center py-4 text-slate-400 dark:text-slate-500 text-xs italic">
				Chưa có số liệu thống kê
			</div>
		);
	}

	const p1 = Math.round((val1 / total) * 100);
	const p2 = 100 - p1;

	const radius = 38;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset1 = circumference - (p1 / 100) * circumference;

	return (
		<div className="flex items-center gap-5">
			<div className="relative w-24 h-24 shrink-0">
				<svg
					className="w-full h-full -rotate-90"
					viewBox="0 0 100 100"
					role="img"
					aria-label={`Biểu đồ tỷ lệ ${label1} và ${label2}`}
				>
					<title>{`Biểu đồ tỷ lệ ${label1} và ${label2}`}</title>
					<circle
						cx="50"
						cy="50"
						r={radius}
						fill="transparent"
						stroke="currentColor"
						strokeWidth="14"
						className="text-slate-200 dark:text-slate-800"
					/>
					<circle
						cx="50"
						cy="50"
						r={radius}
						fill="transparent"
						stroke={color1}
						strokeWidth="14"
						strokeDasharray={circumference}
						strokeDashoffset={strokeDashoffset1}
						strokeLinecap="round"
					/>
				</svg>
				<div className="absolute inset-0 flex flex-col items-center justify-center text-center">
					<span className="text-xs font-mono font-black text-slate-800 dark:text-slate-100">
						{p1}%
					</span>
					<span className="text-[9px] text-slate-400 font-bold uppercase truncate max-w-[50px]">
						{label1}
					</span>
				</div>
			</div>

			<div className="flex-1 space-y-2">
				<div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800">
					<div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 text-xs">
						<div className="flex items-center gap-2 min-w-0">
							<div
								className="w-2.5 h-2.5 rounded-full shrink-0"
								style={{ backgroundColor: color1 }}
							/>
							<span className="truncate">{label1}</span>
						</div>
						<span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs shrink-0 ml-1">
							{p1}%
						</span>
					</div>
					<div className="text-slate-600 dark:text-slate-400 font-bold font-mono text-xs pl-4.5 mt-0.5 tabular-nums">
						{unit === "ha"
							? cryptoHelper.formatArea(val1)
							: cryptoHelper.formatCount(val1, unit)}
					</div>
				</div>

				<div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800">
					<div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 text-xs">
						<div className="flex items-center gap-2 min-w-0">
							<div
								className="w-2.5 h-2.5 rounded-full shrink-0"
								style={{ backgroundColor: color2 }}
							/>
							<span className="truncate">{label2}</span>
						</div>
						<span className="font-mono text-amber-600 dark:text-amber-400 font-bold text-xs shrink-0 ml-1">
							{p2}%
						</span>
					</div>
					<div className="text-slate-600 dark:text-slate-400 font-bold font-mono text-xs pl-4.5 mt-0.5 tabular-nums">
						{unit === "ha"
							? cryptoHelper.formatArea(val2)
							: cryptoHelper.formatCount(val2, unit)}
					</div>
				</div>
			</div>
		</div>
	);
};

// Component Progress Bar tối giản (Vibe QLHK Ảnh 2)
const ProgressBar: React.FC<{
	label: string;
	value: number;
	total: number;
	colorClass: string;
	unit: string;
}> = ({ label, value, total, colorClass, unit }) => {
	const percent = total > 0 ? Math.round((value / total) * 1000) / 10 : 0;
	return (
		<div className="space-y-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
			<div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
				<span className="flex items-center gap-1.5 min-w-0">
					<span className="truncate">{label}</span>
					<span className="text-[10px] text-slate-400 font-mono shrink-0">
						({percent}%)
					</span>
				</span>
				<span className="font-mono tabular-nums text-sm text-slate-900 dark:text-slate-100 font-bold shrink-0 ml-2">
					{unit === "ha"
						? cryptoHelper.formatArea(value)
						: cryptoHelper.formatCount(value, unit)}
				</span>
			</div>
			<div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
				<div
					className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
					style={{ width: `${Math.min(100, percent)}%` }}
				/>
			</div>
		</div>
	);
};

export const AnalyticsDashboard: React.FC = () => {
	const {
		user,
		selectedVillageId,
		setSelectedVillageId,
		selectedVillageName,
		setActiveTab,
		villages,
	} = useApp();

	const [loading, setLoading] = useState<boolean>(true);
	const [overview, setOverview] = useState<OverviewAnalytics | null>(null);
	const [scopeName, setScopeName] = useState<string>("Toàn xã");
	const [villageData, setVillageData] = useState<VillageAnalytics[]>([]);
	const [isUsingCachedData, setIsUsingCachedData] = useState(false);

	const loadData = useCallback(async () => {
		setLoading(true);
		try {
			const targetVillage =
				user?.role === "admin" ? selectedVillageId : undefined;
			const cacheKeyOverview = `analytics_overview_${targetVillage}`;
			const cacheKeyVillage = "analytics_villageData";

			try {
				const res = await analyticsApi.getOverview(targetVillage);
				setOverview(res.data);
				setScopeName(res.scope.village_name);
				await setCache(cacheKeyOverview, res);
				setIsUsingCachedData(false);

				// Nạp danh sách số liệu so sánh theo thôn
				const vRes = await analyticsApi.getByVillage();
				if (vRes?.data) {
					setVillageData(vRes.data);
					await setCache(cacheKeyVillage, vRes.data);
				}
			} catch (err: unknown) {
				const error = err as {
					message?: string;
					response?: { status?: number };
				};
				if (
					error.message === "Network Error" ||
					(error.response && (error.response.status ?? 0) >= 500)
				) {
					const cachedRes = await getCache<{
						data: OverviewAnalytics;
						scope: { village_name: string };
					}>(cacheKeyOverview);
					if (cachedRes) {
						setOverview(cachedRes.data);
						setScopeName(cachedRes.scope.village_name);
						setIsUsingCachedData(true);
					}
					const cachedV = await getCache<VillageAnalytics[]>(cacheKeyVillage);
					if (cachedV) setVillageData(cachedV);
				} else {
					throw err;
				}
			}
		} catch (err) {
			console.error("Fetch analytics error:", err);
		} finally {
			setLoading(false);
		}
	}, [user?.role, selectedVillageId]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	// Lắng nghe sự kiện kết nối lại để làm mới tự động
	useEffect(() => {
		const handleReconnected = () => {
			loadData();
		};
		window.addEventListener("server:reconnected", handleReconnected);
		return () =>
			window.removeEventListener("server:reconnected", handleReconnected);
	}, [loadData]);

	// Tổng cộng cộng dồn toàn xã cho bảng so sánh (Ảnh 3)
	const villageTotals = useMemo(() => {
		let totalHh = 0;
		let totalCropsArea = 0;
		let totalCafe = 0;
		let totalRubber = 0;
		let totalFruit = 0;
		let totalHerb = 0;
		let totalAnimals = 0;
		let totalFishPond = 0;
		let totalFishCage = 0;

		villageData.forEach((r) => {
			totalHh += r.household_count || 0;
			totalCropsArea += r.crops?.total_crops_area || 0;
			totalCafe += r.crops?.total_cafe || 0;
			totalRubber += r.crops?.total_rubber || 0;
			totalFruit += r.crops?.fruit_tree || 0;
			totalHerb += r.crops?.total_herb_area || 0;
			totalAnimals += r.livestock?.total_animals || 0;
			totalFishPond += r.aquaculture?.fish_pond || 0;
			totalFishCage += r.aquaculture?.fish_cage || 0;
		});

		return {
			totalHh,
			totalCropsArea,
			totalCafe,
			totalRubber,
			totalFruit,
			totalHerb,
			totalAnimals,
			totalFishPond,
			totalFishCage,
		};
	}, [villageData]);

	// Hàm xuất báo cáo thống kê Excel chuẩn QLHK
	const handleExportStatsExcel = () => {
		try {
			const titleRow = [
				"UBND XÃ ĐĂK HÀ - BẢNG THỐNG KÊ SO SÁNH NÔNG NGHIỆP CÁC THÔN",
			];
			const emptyRow: unknown[] = [];
			const headers = [
				"STT",
				"Tên Thôn",
				"Số Hộ",
				"Tổng Cây Trồng (ha)",
				"Cà Phê (ha)",
				"Cao Su (ha)",
				"Cây Ăn Quả (ha)",
				"Dược Liệu (ha)",
				"Tổng Vật Nuôi (con)",
				"Cá Ao (ha)",
				"Cá Lồng (lồng)",
			];

			const dataRows = villageData.map((row, idx) => [
				idx + 1,
				row.village_name,
				row.household_count,
				row.crops?.total_crops_area || 0,
				row.crops?.total_cafe || 0,
				row.crops?.total_rubber || 0,
				row.crops?.fruit_tree || 0,
				row.crops?.total_herb_area || 0,
				row.livestock?.total_animals || 0,
				row.aquaculture?.fish_pond || 0,
				row.aquaculture?.fish_cage || 0,
			]);

			const totalRow = [
				"",
				"TỔNG CỘNG TOÀN XÃ",
				villageTotals.totalHh,
				villageTotals.totalCropsArea,
				villageTotals.totalCafe,
				villageTotals.totalRubber,
				villageTotals.totalFruit,
				villageTotals.totalHerb,
				villageTotals.totalAnimals,
				villageTotals.totalFishPond,
				villageTotals.totalFishCage,
			];

			const aoaData = [titleRow, emptyRow, headers, ...dataRows, totalRow];
			const ws = XLSX.utils.aoa_to_sheet(aoaData);

			ws["!cols"] = [
				{ wch: 6 },
				{ wch: 25 },
				{ wch: 12 },
				{ wch: 20 },
				{ wch: 14 },
				{ wch: 14 },
				{ wch: 16 },
				{ wch: 16 },
				{ wch: 20 },
				{ wch: 14 },
				{ wch: 14 },
			];

			ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }];

			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, "SoSanhCacThon");
			const filename = `BaoCao_ThongKe_NongNghiep_DakHa_${new Date().toISOString().slice(0, 10)}.xlsx`;
			XLSX.writeFile(wb, filename);
		} catch (err) {
			console.error("Export error, calling backend API:", err);
			// Fallback gọi API Backend
			analyticsApi
				.exportComparison()
				.then((blob) => {
					const url = window.URL.createObjectURL(blob);
					const a = document.createElement("a");
					a.href = url;
					a.download = `BangSoSanhCacThon_${new Date().toISOString().split("T")[0]}.xlsx`;
					document.body.appendChild(a);
					a.click();
					window.URL.revokeObjectURL(url);
					document.body.removeChild(a);
				})
				.catch((e) => {
					console.error("Backend export error:", e);
					alert("Không thể xuất file Excel thống kê.");
				});
		}
	};

	if (loading && !overview) {
		return (
			<div className="py-24 text-center text-slate-400 dark:text-slate-500">
				<div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
				<div className="text-base font-bold text-slate-700 dark:text-slate-200">
					Đang tổng hợp 18 chỉ số nông nghiệp Đăk Hà...
				</div>
				<p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
					Đồng bộ số liệu diện tích và đàn vật nuôi từ CSDL
				</p>
			</div>
		);
	}

	if (!overview) {
		return (
			<div className="py-16 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-sm">
				Chưa có số liệu thống kê. Vui lòng nhập dữ liệu hộ nông nghiệp.
			</div>
		);
	}

	const crops = overview.crops;
	const livestock = overview.livestock;
	const aqua = overview.aquaculture;

	return (
		<div className="space-y-6">
			{/* Top Banner & Filter (Vibe tối giản QLHK Ảnh 2) */}
			<div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-150">
				<div>
					<div className="flex items-center gap-2.5 flex-wrap">
						<span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
							{selectedVillageName || scopeName || "Toàn xã Đăk Hà"}
						</span>

						{isUsingCachedData && (
							<div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-bold shadow-xs animate-in fade-in">
								<Zap className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.5} />
								<span>Đang chạy trên dữ liệu ngoại tuyến (Offline Cache)</span>
							</div>
						)}

						<h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
							<BarChart3
								className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
								strokeWidth={1.5}
							/>
							<span>Thống Kê Nông Nghiệp & Nông Thôn Mới</span>
						</h2>
					</div>
					<p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
						Tổng hợp quy mô 18 chỉ tiêu cây trồng, vật nuôi và mô hình thủy sản
						tại {villages.length > 0 ? `${villages.length} thôn` : "các thôn"} Xã Đăk Hà
					</p>
				</div>

				<div className="flex items-center gap-3">
					{user?.role === "admin" &&
						(selectedVillageId || scopeName !== "Toàn xã") && (
							<button
								type="button"
								onClick={() => {
									setSelectedVillageId("");
									setActiveTab("villages");
								}}
								className="h-10 flex items-center justify-center gap-1.5 px-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all active:scale-[0.99] cursor-pointer border border-slate-200 dark:border-slate-700"
							>
								<ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
								<span>Quay lại danh sách thôn</span>
							</button>
						)}

					<button
						type="button"
						onClick={handleExportStatsExcel}
						className="h-10 flex items-center gap-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all active:scale-[0.99] shadow-xs cursor-pointer"
					>
						<Download className="w-4 h-4" strokeWidth={1.5} />
						<span>Xuất Báo Cáo Excel</span>
					</button>

					<button
						type="button"
						onClick={loadData}
						aria-label="Làm mới số liệu"
						className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer"
					>
						<RefreshCw
							strokeWidth={1.5}
							className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`}
						/>
					</button>
				</div>
			</div>

			{/* 4 Thẻ KPI Tóm Tắt (Layout chuẩn Ảnh 1: text trái, icon outline phải) */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* KPI 1: Tổng số Hộ */}
				<div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between">
					<div>
						<div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
							TỔNG HỘ NÔNG NGHIỆP
						</div>
						<div className="text-2xl font-black font-mono mt-1 text-slate-900 dark:text-white">
							{overview.household_count.toLocaleString("vi-VN")} Hộ
						</div>
						<div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
							Đã kê khai 18 chỉ số CSDL
						</div>
					</div>
					<Building2
						className="w-6 h-6 text-slate-400 dark:text-slate-500 shrink-0"
						strokeWidth={1.5}
					/>
				</div>

				{/* KPI 2: Tổng Diện Tích Cây Trồng */}
				<div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between">
					<div>
						<div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
							TỔNG DIỆN TÍCH CÂY TRỒNG
						</div>
						<div className="text-2xl font-black font-mono mt-1 text-teal-600 dark:text-teal-400">
							{cryptoHelper.formatArea(crops.total_crops_area)}
						</div>
						<div className="text-[11px] text-teal-700 dark:text-teal-300 font-semibold mt-0.5">
							12 chỉ tiêu diện tích canh tác
						</div>
					</div>
					<Trees
						className="w-6 h-6 text-slate-400 dark:text-slate-500 shrink-0"
						strokeWidth={1.5}
					/>
				</div>

				{/* KPI 3: Tổng Đàn Vật Nuôi */}
				<div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between">
					<div>
						<div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
							TỔNG ĐÀN VẬT NUÔI
						</div>
						<div className="text-2xl font-black font-mono mt-1 text-amber-600 dark:text-amber-400">
							{cryptoHelper.formatCount(livestock.total_animals, "con")}
						</div>
						<div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
							Gia súc: {livestock.total_cattle + livestock.pig} • Gia cầm:{" "}
							{livestock.poultry}
						</div>
					</div>
					<PawPrint
						className="w-6 h-6 text-slate-400 dark:text-slate-500 shrink-0"
						strokeWidth={1.5}
					/>
				</div>

				{/* KPI 4: Thủy Sản */}
				<div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between">
					<div>
						<div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
							THỦY SẢN & MẶT NƯỚC
						</div>
						<div className="text-2xl font-black font-mono mt-1 text-purple-600 dark:text-purple-400">
							{cryptoHelper.formatArea(aqua.fish_pond)}
						</div>
						<div className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold mt-0.5">
							+ {cryptoHelper.formatCount(aqua.fish_cage, "lồng")} nuôi lồng bè
						</div>
					</div>
					<Fish
						className="w-6 h-6 text-slate-400 dark:text-slate-500 shrink-0"
						strokeWidth={1.5}
					/>
				</div>
			</div>

			{/* Hàng 2: Biểu Đồ & Cơ Cấu 2 Panel Lớn (Vibe tối giản QLHK Ảnh 2) */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* PANEL 1: CÂY TRỒNG (12 Chỉ Số) */}
				<div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
							<PieChart
								className="w-4 h-4 text-emerald-500"
								strokeWidth={1.5}
							/>
							<span>Cơ Cấu Cây Trồng Chuẩn Xã Đăk Hà</span>
						</div>
						<span className="text-xs font-mono text-slate-400">
							12 Cây trồng • {cryptoHelper.formatArea(crops.total_crops_area)}
						</span>
					</div>

					{/* MiniDonut phân bổ Cây công nghiệp vs Cây khác */}
					<MiniDonut
						val1={crops.total_cafe + crops.total_rubber}
						label1="Cây CN"
						color1="#10b981"
						val2={Math.max(
							0,
							crops.total_crops_area - (crops.total_cafe + crops.total_rubber),
						)}
						label2="Khác/Dược liệu"
						color2="#f59e0b"
						unit="ha"
					/>

					{/* Danh sách thanh tiến độ mỏng tối giản */}
					<div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
						<ProgressBar
							label="Cà phê (Hộ gia đình)"
							value={crops.cafe_household}
							total={crops.total_crops_area}
							colorClass="bg-emerald-500"
							unit="ha"
						/>
						<ProgressBar
							label="Cà phê (Nhận khoán)"
							value={crops.cafe_contracted}
							total={crops.total_crops_area}
							colorClass="bg-amber-500"
							unit="ha"
						/>
						<ProgressBar
							label="Cao su (Hộ gia đình)"
							value={crops.rubber_household}
							total={crops.total_crops_area}
							colorClass="bg-teal-500"
							unit="ha"
						/>
						<ProgressBar
							label="Cao su (Nhận khoán)"
							value={crops.rubber_contracted}
							total={crops.total_crops_area}
							colorClass="bg-teal-400"
							unit="ha"
						/>
						<ProgressBar
							label="Cây ăn quả (Sầu riêng, mít, bơ...)"
							value={crops.fruit_tree}
							total={crops.total_crops_area}
							colorClass="bg-teal-600"
							unit="ha"
						/>
						<ProgressBar
							label="Cây Mắc ca"
							value={crops.macadamia}
							total={crops.total_crops_area}
							colorClass="bg-sky-500"
							unit="ha"
						/>
						<ProgressBar
							label="Dược liệu: Đinh lăng"
							value={crops.herb_dinh_lang}
							total={crops.total_crops_area}
							colorClass="bg-purple-500"
							unit="ha"
						/>
						<ProgressBar
							label="Dược liệu: Gừng, Nghệ, Sả"
							value={crops.herb_gung + crops.herb_nghe + crops.herb_sa}
							total={crops.total_crops_area}
							colorClass="bg-violet-500"
							unit="ha"
						/>
						<ProgressBar
							label="Lúa nước"
							value={crops.wet_rice}
							total={crops.total_crops_area}
							colorClass="bg-blue-500"
							unit="ha"
						/>
						<ProgressBar
							label="Cây hàng năm khác"
							value={crops.other_annual_crops}
							total={crops.total_crops_area}
							colorClass="bg-slate-500"
							unit="ha"
						/>
					</div>
				</div>

				{/* PANEL 2: VẬT NUÔI & THỦY SẢN (6 Chỉ Số) */}
				<div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
							<Shield className="w-4 h-4 text-blue-500" strokeWidth={1.5} />
							<span>Cơ Cấu Chăn Nuôi & Thủy Sản</span>
						</div>
						<span className="text-xs font-mono text-slate-400">
							4 Vật nuôi • 2 Thủy sản
						</span>
					</div>

					{/* MiniDonut phân bổ Gia súc vs Gia cầm */}
					<MiniDonut
						val1={livestock.total_cattle + livestock.pig}
						label1="Gia súc"
						color1="#3b82f6"
						val2={livestock.poultry}
						label2="Gia cầm"
						color2="#ec4899"
						unit="con"
					/>

					{/* Danh sách thanh tiến độ mỏng tối giản */}
					<div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
						<ProgressBar
							label="Đàn Gia Cầm (Gà, Vịt, Ngan)"
							value={livestock.poultry}
							total={livestock.total_animals}
							colorClass="bg-pink-500"
							unit="con"
						/>
						<ProgressBar
							label="Đàn Heo"
							value={livestock.pig}
							total={livestock.total_animals}
							colorClass="bg-rose-500"
							unit="con"
						/>
						<ProgressBar
							label="Đàn Bò"
							value={livestock.cow}
							total={livestock.total_animals}
							colorClass="bg-blue-600"
							unit="con"
						/>
						<ProgressBar
							label="Đàn Trâu"
							value={livestock.buffalo}
							total={livestock.total_animals}
							colorClass="bg-slate-600"
							unit="con"
						/>
						<ProgressBar
							label="Nuôi Cá Ao Hồ (Mặt nước nuôi thả)"
							value={aqua.fish_pond}
							total={aqua.fish_pond > 0 ? aqua.fish_pond : 1}
							colorClass="bg-sky-500"
							unit="ha"
						/>
						<ProgressBar
							label="Nuôi Cá Lồng Bè (Lòng hồ thủy điện)"
							value={aqua.fish_cage}
							total={aqua.fish_cage > 0 ? aqua.fish_cage : 1}
							colorClass="bg-indigo-500"
							unit="lồng"
						/>
					</div>
				</div>
			</div>

			{/* Hàng 3: Bảng Thống Kê So Sánh Giữa Các Thôn (Layout chuẩn QLHK Ảnh 3) */}
			{villageData.length > 0 && (
				<div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
					<div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
						<div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
							<Building2
								className="w-4 h-4 text-emerald-500"
								strokeWidth={1.5}
							/>
							<span>BẢNG THỐNG KÊ SO SÁNH GIỮA CÁC THÔN</span>
						</div>
						<span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold">
							{villageData.length} thôn đơn vị hành chính
						</span>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full text-left border-collapse text-xs">
							<thead>
								<tr className="bg-slate-100/90 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-b border-slate-200/90 dark:border-slate-800 font-black uppercase tracking-wider text-[11px]">
									<th className="py-3 px-3.5 text-center w-12 border-r border-slate-200/80 dark:border-slate-800">
										STT
									</th>
									<th className="py-3 px-4 border-r border-slate-200/80 dark:border-slate-800 min-w-[180px]">
										TÊN THÔN
									</th>
									<th className="py-3 px-3 text-right border-r border-slate-200/80 dark:border-slate-800 font-bold">
										SỐ HỘ
									</th>
									<th className="py-3 px-3 text-right border-r border-slate-200/80 dark:border-slate-800 font-bold text-emerald-600 dark:text-emerald-400">
										TỔNG CÂY TRỒNG (HA)
									</th>
									<th className="py-3 px-3 text-right border-r border-slate-200/80 dark:border-slate-800">
										CÀ PHÊ (HA)
									</th>
									<th className="py-3 px-3 text-right border-r border-slate-200/80 dark:border-slate-800">
										CAO SU (HA)
									</th>
									<th className="py-3 px-3 text-right border-r border-slate-200/80 dark:border-slate-800">
										CÂY ĂN QUẢ
									</th>
									<th className="py-3 px-3 text-right border-r border-slate-200/80 dark:border-slate-800">
										DƯỢC LIỆU
									</th>
									<th className="py-3 px-3 text-right border-r border-slate-200/80 dark:border-slate-800 font-bold text-amber-600 dark:text-amber-400">
										TỔNG VẬT NUÔI (CON)
									</th>
									<th className="py-3 px-3 text-right">THỦY SẢN (AO/LỒNG)</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
								{villageData.map((row, idx) => (
									<tr
										key={row.village_id}
										className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-[13px] ${
											selectedVillageId === row.village_id
												? "bg-emerald-500/10 dark:bg-emerald-950/40 font-bold"
												: ""
										}`}
									>
										<td className="py-3 px-3.5 text-center font-mono text-slate-500 border-r border-slate-100 dark:border-slate-800/60">
											{idx + 1}
										</td>
										<td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 border-r border-slate-100 dark:border-slate-800/60">
											{row.village_name}
										</td>
										<td className="py-3 px-3 text-right font-mono font-bold tabular-nums border-r border-slate-100 dark:border-slate-800/60">
											{row.household_count.toLocaleString("vi-VN")}
										</td>
										<td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400 border-r border-slate-100 dark:border-slate-800/60">
											{cryptoHelper.formatArea(
												row.crops?.total_crops_area || 0,
											)}
										</td>
										<td className="py-3 px-3 text-right font-mono tabular-nums border-r border-slate-100 dark:border-slate-800/60">
											{cryptoHelper.formatArea(row.crops?.total_cafe || 0)}
										</td>
										<td className="py-3 px-3 text-right font-mono tabular-nums border-r border-slate-100 dark:border-slate-800/60">
											{cryptoHelper.formatArea(row.crops?.total_rubber || 0)}
										</td>
										<td className="py-3 px-3 text-right font-mono tabular-nums border-r border-slate-100 dark:border-slate-800/60">
											{cryptoHelper.formatArea(row.crops?.fruit_tree || 0)}
										</td>
										<td className="py-3 px-3 text-right font-mono tabular-nums border-r border-slate-100 dark:border-slate-800/60">
											{cryptoHelper.formatArea(
												row.crops?.total_herb_area || 0,
											)}
										</td>
										<td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-amber-600 dark:text-amber-400 border-r border-slate-100 dark:border-slate-800/60">
											{cryptoHelper.formatCount(
												row.livestock?.total_animals || 0,
												"con",
											)}
										</td>
										<td className="py-3 px-3 text-right font-mono tabular-nums">
											<span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
												{cryptoHelper.formatArea(
													row.aquaculture?.fish_pond || 0,
												)}{" "}
												/ {row.aquaculture?.fish_cage || 0} lồng
											</span>
										</td>
									</tr>
								))}
							</tbody>
							<tfoot className="bg-slate-100/80 dark:bg-slate-800/80 font-black text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
								<tr className="text-[13px]">
									<td
										colSpan={2}
										className="py-3.5 px-4 text-center font-black uppercase tracking-wider"
									>
										TỔNG CỘNG TOÀN XÃ
									</td>
									<td className="py-3.5 px-3 text-right font-mono font-black tabular-nums border-r border-slate-200 dark:border-slate-700">
										{villageTotals.totalHh.toLocaleString("vi-VN")}
									</td>
									<td className="py-3.5 px-3 text-right font-mono font-black tabular-nums text-emerald-600 dark:text-emerald-400 border-r border-slate-200 dark:border-slate-700">
										{cryptoHelper.formatArea(villageTotals.totalCropsArea)}
									</td>
									<td className="py-3.5 px-3 text-right font-mono font-black tabular-nums border-r border-slate-200 dark:border-slate-700">
										{cryptoHelper.formatArea(villageTotals.totalCafe)}
									</td>
									<td className="py-3.5 px-3 text-right font-mono font-black tabular-nums border-r border-slate-200 dark:border-slate-700">
										{cryptoHelper.formatArea(villageTotals.totalRubber)}
									</td>
									<td className="py-3.5 px-3 text-right font-mono font-black tabular-nums border-r border-slate-200 dark:border-slate-700">
										{cryptoHelper.formatArea(villageTotals.totalFruit)}
									</td>
									<td className="py-3.5 px-3 text-right font-mono font-black tabular-nums border-r border-slate-200 dark:border-slate-700">
										{cryptoHelper.formatArea(villageTotals.totalHerb)}
									</td>
									<td className="py-3.5 px-3 text-right font-mono font-black tabular-nums text-amber-600 dark:text-amber-400 border-r border-slate-200 dark:border-slate-700">
										{cryptoHelper.formatCount(
											villageTotals.totalAnimals,
											"con",
										)}
									</td>
									<td className="py-3.5 px-3 text-right font-mono font-black tabular-nums">
										<span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
											{cryptoHelper.formatArea(villageTotals.totalFishPond)} /{" "}
											{villageTotals.totalFishCage} lồng
										</span>
									</td>
								</tr>
							</tfoot>
						</table>
					</div>
				</div>
			)}
		</div>
	);
};
