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
import {
	DEFAULT_STAT_ACCENT,
	STAT_KPI_GRID_CLASS,
	STAT_PANEL_GRID_CLASS,
	STAT_SCROLL_CONTAINER_CLASS,
	StatBarRow,
	StatChartPanel,
	StatDonut,
	StatKpiCard,
} from "../common/statStyles";
import {
	TABLE_STYLES,
	VillageBadge,
	formatTableNumber,
} from "../common/tableStyles";

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

	// Tổng cộng cộng dồn toàn xã cho bảng so sánh
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
				<p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-normal">
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

	// Sắc độ xanh lá đồng nhất cho màn Nông nghiệp
	const cropDonutItems = [
		{
			label: "Cây CN",
			value: crops.total_cafe + crops.total_rubber,
			color: "#16a34a", // Xanh lá đậm
			unit: "ha",
		},
		{
			label: "Khác/Dược liệu",
			value: Math.max(
				0,
				crops.total_crops_area - (crops.total_cafe + crops.total_rubber),
			),
			color: "#4ade80", // Xanh lá nhạt
			unit: "ha",
		},
	];

	const livestockDonutItems = [
		{
			label: "Gia súc",
			value: livestock.total_cattle + livestock.pig,
			color: "#16a34a", // Xanh lá đậm
			unit: "con",
		},
		{
			label: "Gia cầm",
			value: livestock.poultry,
			color: "#4ade80", // Xanh lá nhạt
			unit: "con",
		},
	];

	return (
		<div className="space-y-6">
			{/* 1. Thẻ tiêu đề trang: chuẩn đồng nhất 3 phân hệ */}
			<div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-150">
				<div>
					<div className="flex items-center gap-2.5 flex-wrap">
						{/* Badge thôn viền xanh lá, nền xanh lá rất nhạt */}
						<VillageBadge
							name={selectedVillageName || scopeName || "Toàn xã Đăk Hà"}
						/>

						{isUsingCachedData && (
							<div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-bold shadow-xs animate-in fade-in">
								<Zap className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.5} />
								<span>Đang chạy trên dữ liệu ngoại tuyến (Offline Cache)</span>
							</div>
						)}

						<h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
							<BarChart3
								className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0"
								strokeWidth={1.5}
							/>
							<span>Thống Kê Nông Nghiệp & Nông Thôn Mới</span>
						</h2>
					</div>
					<p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-1">
						Tổng hợp quy mô 18 chỉ tiêu cây trồng, vật nuôi và mô hình thủy sản
						tại {villages.length > 0 ? `${villages.length} thôn` : "các thôn"}{" "}
						Xã Đăk Hà
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
						title="Làm mới số liệu thống kê"
						className="h-10 w-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
					>
						<RefreshCw
							strokeWidth={1.5}
							className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`}
						/>
					</button>
				</div>
			</div>

			{/* 2. Thẻ số liệu (KPI): 4 thẻ cùng chiều cao, lưới 4 cột (2 cột < 1100px, 1 cột mobile) */}
			<div className={STAT_KPI_GRID_CLASS}>
				{/* KPI 1: Tổng số Hộ */}
				<StatKpiCard
					label="TỔNG HỘ NÔNG NGHIỆP"
					value={formatTableNumber(overview.household_count, 0)}
					unit="Hộ"
					subText="Đã kê khai 18 chỉ số CSDL"
					icon={Building2}
				/>

				{/* KPI 2: Tổng Diện Tích Cây Trồng */}
				<StatKpiCard
					label="TỔNG DIỆN TÍCH CÂY TRỒNG"
					value={formatTableNumber(crops.total_crops_area, 3)}
					unit="ha"
					subText="12 chỉ tiêu diện tích canh tác"
					icon={Trees}
				/>

				{/* KPI 3: Tổng Đàn Vật Nuôi */}
				<StatKpiCard
					label="TỔNG ĐÀN VẬT NUÔI"
					value={formatTableNumber(livestock.total_animals, 0)}
					unit="con"
					subText={`Gia súc: ${formatTableNumber(livestock.total_cattle + livestock.pig, 0)} • Gia cầm: ${formatTableNumber(livestock.poultry, 0)}`}
					icon={PawPrint}
				/>

				{/* KPI 4: Thủy Sản */}
				<StatKpiCard
					label="THỦY SẢN & MẶT NƯỚC"
					value={formatTableNumber(aqua.fish_pond, 3)}
					unit="ha"
					subText={`+ ${formatTableNumber(aqua.fish_cage, 0)} lồng nuôi lồng bè`}
					icon={Fish}
				/>
			</div>

			{/* 3 & 4. Panel biểu đồ & Dòng thanh tiến độ: 2 Panel Lớn cùng chiều cao */}
			<div className={STAT_PANEL_GRID_CLASS}>
				{/* PANEL 1: CƠ CẤU CÂY TRỒNG */}
				<StatChartPanel
					title="Cơ Cấu Cây Trồng Chuẩn Xã Đăk Hà"
					description={`Phân bổ 12 chỉ tiêu cây trồng • Tổng diện tích ${formatTableNumber(crops.total_crops_area, 3)} ha`}
					icon={PieChart}
					accentColor={DEFAULT_STAT_ACCENT}
				>
					<div className="space-y-4">
						{/* Donut phân bổ Cây công nghiệp vs Khác/Dược liệu (sắc độ xanh lá) */}
						<StatDonut
							items={cropDonutItems}
							total={crops.total_crops_area}
							centerLabel="Cây CN"
						/>

						{/* Danh sách thanh tiến độ: khung riêng, bo 12px, sắc độ xanh lá */}
						<div className={STAT_SCROLL_CONTAINER_CLASS}>
							<StatBarRow
								label="Cà phê (Hộ gia đình)"
								value={crops.cafe_household}
								total={crops.total_crops_area}
								unit="ha"
								barColor="#15803d" // green-700
							/>
							<StatBarRow
								label="Cà phê (Nhận khoán)"
								value={crops.cafe_contracted}
								total={crops.total_crops_area}
								unit="ha"
								barColor="#16a34a" // green-600
							/>
							<StatBarRow
								label="Cao su (Hộ gia đình)"
								value={crops.rubber_household}
								total={crops.total_crops_area}
								unit="ha"
								barColor="#22c55e" // green-500
							/>
							<StatBarRow
								label="Cao su (Nhận khoán)"
								value={crops.rubber_contracted}
								total={crops.total_crops_area}
								unit="ha"
								barColor="#4ade80" // green-400
							/>
							<StatBarRow
								label="Cây ăn quả (Sầu riêng, mít, bơ...)"
								value={crops.fruit_tree}
								total={crops.total_crops_area}
								unit="ha"
								barColor="#86efac" // green-300
							/>
							<StatBarRow
								label="Cây Mắc ca"
								value={crops.macadamia}
								total={crops.total_crops_area}
								unit="ha"
								barColor="#10b981" // emerald-500
							/>
							<StatBarRow
								label="Dược liệu: Đinh lăng"
								value={crops.herb_dinh_lang}
								total={crops.total_crops_area}
								unit="ha"
								barColor="#059669" // emerald-600
							/>
							<StatBarRow
								label="Dược liệu: Gừng, Nghệ, Sả"
								value={crops.herb_gung + crops.herb_nghe + crops.herb_sa}
								total={crops.total_crops_area}
								unit="ha"
								barColor="#34d399" // emerald-400
							/>
							<StatBarRow
								label="Lúa nước"
								value={crops.wet_rice}
								total={crops.total_crops_area}
								unit="ha"
								barColor="#14b8a6" // teal-500
							/>
							<StatBarRow
								label="Cây hàng năm khác"
								value={crops.other_annual_crops}
								total={crops.total_crops_area}
								unit="ha"
								barColor="#64748b" // slate-500 (nhóm khác/không dùng xám trung tính)
							/>
						</div>
					</div>
				</StatChartPanel>

				{/* PANEL 2: CƠ CẤU CHĂN NUÔI & THỦY SẢN */}
				<StatChartPanel
					title="Cơ Cấu Chăn Nuôi & Thủy Sản"
					description="Phân bổ 4 chỉ tiêu vật nuôi và 2 mô hình thủy sản toàn địa bàn"
					icon={Shield}
					accentColor={DEFAULT_STAT_ACCENT}
				>
					<div className="space-y-4">
						{/* Donut phân bổ Gia súc vs Gia cầm (hai sắc độ xanh lá đậm/nhạt) */}
						<StatDonut
							items={livestockDonutItems}
							total={livestock.total_animals}
							centerLabel="Gia súc"
						/>

						{/* Danh sách thanh tiến độ: khung riêng, bo 12px, sắc độ xanh lá */}
						<div className={STAT_SCROLL_CONTAINER_CLASS}>
							<StatBarRow
								label="Đàn Gia Cầm (Gà, Vịt, Ngan)"
								value={livestock.poultry}
								total={livestock.total_animals}
								unit="con"
								barColor="#22c55e" // green-500
							/>
							<StatBarRow
								label="Đàn Heo"
								value={livestock.pig}
								total={livestock.total_animals}
								unit="con"
								barColor="#16a34a" // green-600
							/>
							<StatBarRow
								label="Đàn Bò"
								value={livestock.cow}
								total={livestock.total_animals}
								unit="con"
								barColor="#15803d" // green-700
							/>
							<StatBarRow
								label="Đàn Trâu"
								value={livestock.buffalo}
								total={livestock.total_animals}
								unit="con"
								barColor="#166534" // green-800
							/>
							<StatBarRow
								label="Nuôi Cá Ao Hồ (Mặt nước nuôi thả)"
								value={aqua.fish_pond}
								total={aqua.fish_pond > 0 ? aqua.fish_pond : 1}
								unit="ha"
								customPercent={100}
								barColor="#059669" // emerald-600
							/>
							<StatBarRow
								label="Nuôi Cá Lồng Bè (Lòng hồ thủy điện)"
								value={aqua.fish_cage}
								total={aqua.fish_cage > 0 ? aqua.fish_cage : 1}
								unit="lồng"
								customPercent={100}
								barColor="#10b981" // emerald-500
							/>
						</div>
					</div>
				</StatChartPanel>
			</div>

			{/* 7 & 8. Bảng Thống Kê So Sánh Giữa Các Thôn (Áp dụng đúng style bảng danh sách dùng chung) */}
			{villageData.length > 0 && (
				<div className={TABLE_STYLES.card}>
					{/* Thanh tiêu đề bảng: tên danh sách + số lượng/mô tả bên phải */}
					<div className={TABLE_STYLES.cardHeader}>
						<div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
							<Building2
								className="w-4 h-4 text-emerald-500"
								strokeWidth={1.5}
							/>
							<span>Bảng Thống Kê So Sánh Giữa Các Thôn</span>
						</div>
						<span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
							{villageData.length} thôn đơn vị hành chính
						</span>
					</div>

					<div className={TABLE_STYLES.scrollContainer}>
						<table className={TABLE_STYLES.table}>
							<thead>
								<tr>
									<th className={`${TABLE_STYLES.thCenter} w-12`}>STT</th>
									<th className={`${TABLE_STYLES.th} min-w-[160px]`}>
										TÊN THÔN
									</th>
									<th className={TABLE_STYLES.thRight}>SỐ HỘ</th>
									<th className={TABLE_STYLES.thRight}>
										TỔNG CÂY TRỒNG (HA)
									</th>
									<th className={TABLE_STYLES.thRight}>CÀ PHÊ (HA)</th>
									<th className={TABLE_STYLES.thRight}>CAO SU (HA)</th>
									<th className={TABLE_STYLES.thRight}>CÂY ĂN QUẢ (HA)</th>
									<th className={TABLE_STYLES.thRight}>DƯỢC LIỆU (HA)</th>
									<th className={TABLE_STYLES.thRight}>
										TỔNG VẬT NUÔI (CON)
									</th>
									<th className={TABLE_STYLES.thRight}>
										THỦY SẢN (AO / LỒNG)
									</th>
								</tr>
							</thead>
							<tbody>
								{villageData.map((row, idx) => {
									const isSelected = selectedVillageId === row.village_id;
									return (
										<tr
											key={row.village_id}
											className={`${TABLE_STYLES.tr} ${
												isSelected ? TABLE_STYLES.trSelected : ""
											}`}
										>
											<td className={TABLE_STYLES.tdCenter}>{idx + 1}</td>
											<td
												className={`${TABLE_STYLES.td} font-bold text-slate-900 dark:text-slate-100`}
											>
												{row.village_name}
											</td>
											<td className={TABLE_STYLES.tdRight}>
												<span className="tabular-nums font-bold text-slate-900 dark:text-white">
													{formatTableNumber(row.household_count, 0)}
												</span>
											</td>
											<td className={TABLE_STYLES.tdRight}>
												<span className="tabular-nums">
													{formatTableNumber(row.crops?.total_crops_area || 0, 3)}
												</span>
												<span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1">
													ha
												</span>
											</td>
											<td className={TABLE_STYLES.tdRight}>
												<span className="tabular-nums">
													{formatTableNumber(row.crops?.total_cafe || 0, 3)}
												</span>
												<span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1">
													ha
												</span>
											</td>
											<td className={TABLE_STYLES.tdRight}>
												<span className="tabular-nums">
													{formatTableNumber(row.crops?.total_rubber || 0, 3)}
												</span>
												<span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1">
													ha
												</span>
											</td>
											<td className={TABLE_STYLES.tdRight}>
												<span className="tabular-nums">
													{formatTableNumber(row.crops?.fruit_tree || 0, 3)}
												</span>
												<span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1">
													ha
												</span>
											</td>
											<td className={TABLE_STYLES.tdRight}>
												<span className="tabular-nums">
													{formatTableNumber(row.crops?.total_herb_area || 0, 3)}
												</span>
												<span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1">
													ha
												</span>
											</td>
											<td className={TABLE_STYLES.tdRight}>
												<span className="tabular-nums">
													{formatTableNumber(row.livestock?.total_animals || 0, 0)}
												</span>
												<span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1">
													con
												</span>
											</td>
											<td className={TABLE_STYLES.tdRight}>
												<div className="inline-flex items-center justify-end tabular-nums">
													<span>
														{formatTableNumber(
															row.aquaculture?.fish_pond || 0,
															1,
														)}
													</span>
													<span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-0.5">
														ha
													</span>
													<span className="text-slate-300 dark:text-slate-600 mx-1.5 font-normal">
														•
													</span>
													<span>
														{formatTableNumber(
															row.aquaculture?.fish_cage || 0,
															0,
														)}
													</span>
													<span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-0.5">
														lồng
													</span>
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
							<tfoot className="bg-slate-50/90 dark:bg-slate-950/80 font-bold text-slate-900 dark:text-white border-t-2 border-slate-200/90 dark:border-slate-800">
								<tr>
									<td
										colSpan={2}
										className="py-3.5 px-4 text-center font-bold uppercase tracking-wider text-xs text-slate-700 dark:text-slate-300"
									>
										TỔNG CỘNG TOÀN XÃ
									</td>
									<td className={TABLE_STYLES.tdRight}>
										<span className="tabular-nums font-black text-slate-900 dark:text-white">
											{formatTableNumber(villageTotals.totalHh, 0)}
										</span>
									</td>
									<td className={TABLE_STYLES.tdRight}>
										<span className="tabular-nums font-bold text-slate-900 dark:text-white">
											{formatTableNumber(villageTotals.totalCropsArea, 3)}
										</span>
										<span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1">
											ha
										</span>
									</td>
									<td className={TABLE_STYLES.tdRight}>
										<span className="tabular-nums font-bold text-slate-900 dark:text-white">
											{formatTableNumber(villageTotals.totalCafe, 3)}
										</span>
										<span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1">
											ha
										</span>
									</td>
									<td className={TABLE_STYLES.tdRight}>
										<span className="tabular-nums font-bold text-slate-900 dark:text-white">
											{formatTableNumber(villageTotals.totalRubber, 3)}
										</span>
										<span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1">
											ha
										</span>
									</td>
									<td className={TABLE_STYLES.tdRight}>
										<span className="tabular-nums font-bold text-slate-900 dark:text-white">
											{formatTableNumber(villageTotals.totalFruit, 3)}
										</span>
										<span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1">
											ha
										</span>
									</td>
									<td className={TABLE_STYLES.tdRight}>
										<span className="tabular-nums font-bold text-slate-900 dark:text-white">
											{formatTableNumber(villageTotals.totalHerb, 3)}
										</span>
										<span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1">
											ha
										</span>
									</td>
									<td className={TABLE_STYLES.tdRight}>
										<span className="tabular-nums font-bold text-slate-900 dark:text-white">
											{formatTableNumber(villageTotals.totalAnimals, 0)}
										</span>
										<span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1">
											con
										</span>
									</td>
									<td className={TABLE_STYLES.tdRight}>
										<div className="inline-flex items-center justify-end tabular-nums">
											<span className="font-bold text-slate-900 dark:text-white">
												{formatTableNumber(villageTotals.totalFishPond, 1)}
											</span>
											<span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-0.5">
												ha
											</span>
											<span className="text-slate-300 dark:text-slate-600 mx-1.5 font-normal">
												•
											</span>
											<span className="font-bold text-slate-900 dark:text-white">
												{formatTableNumber(villageTotals.totalFishCage, 0)}
											</span>
											<span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-0.5">
												lồng
											</span>
										</div>
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
