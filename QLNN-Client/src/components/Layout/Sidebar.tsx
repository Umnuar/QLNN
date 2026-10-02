import {
	BarChart3,
	Database,
	History,
	type LucideProps,
	Map as MapIcon,
	PanelLeftClose,
	PanelLeftOpen,
	Settings as SettingsIcon,
	ShieldCheck,
	Sprout,
	Trash2,
} from "lucide-react";
import type React from "react";
import { useApp } from "../../AppContext";

interface NavItem {
	id: string;
	label: string;
	icon: React.ComponentType<LucideProps>;
	desc: string;
	badge?: string;
}

export const Sidebar: React.FC = () => {
	const {
		activeTab,
		setActiveTab,
		user,
		isSidebarCollapsed,
		toggleSidebar,
		selectedVillageId,
		setSelectedVillageId,
		selectedVillageName,
	} = useApp();

	let navItems: NavItem[] = [];

	if (user?.role === "admin") {
		if (!selectedVillageId) {
			if (activeTab === "analytics") {
				navItems = [
					{
						id: "villages",
						label: "Quản Lý Thôn",
						icon: MapIcon,
						desc: "Quản lý các thôn xã Đăk Hà",
					},
					{
						id: "analytics",
						label: "Thống Kê",
						icon: BarChart3,
						desc: "Toàn xã Đăk Hà",
						badge: "Chính",
					},
					{
						id: "recycle-bin",
						label: "Thùng Rác",
						icon: Trash2,
						desc: "Quản lý hộ dân đã xóa",
					},
					{
						id: "audit",
						label: "Nhật Ký Hoạt Động",
						icon: History,
						desc: "Lịch sử biến động dữ liệu",
					},
					{
						id: "settings",
						label: "Cài Đặt Hệ Thống",
						icon: SettingsIcon,
						desc: "Tài khoản & sao lưu CSDL",
					},
				];
			} else {
				navItems = [
					{
						id: "villages",
						label: "Quản Lý Thôn",
						icon: MapIcon,
						desc: "Quản lý các thôn xã Đăk Hà",
					},
					{
						id: "recycle-bin",
						label: "Thùng Rác",
						icon: Trash2,
						desc: "Quản lý hộ dân đã xóa",
					},
					{
						id: "audit",
						label: "Nhật Ký Hoạt Động",
						icon: History,
						desc: "Lịch sử biến động dữ liệu",
					},
					{
						id: "settings",
						label: "Cài Đặt Hệ Thống",
						icon: SettingsIcon,
						desc: "Tài khoản & sao lưu CSDL",
					},
				];
			}
		} else {
			const villageScopeDesc = selectedVillageName || "Thôn đã chọn";
			navItems = [
				{
					id: "villages",
					label: "Quản Lý Thôn",
					icon: MapIcon,
					desc: "Quay lại danh sách thôn",
				},
				{
					id: "analytics",
					label: "Thống Kê",
					icon: BarChart3,
					desc: villageScopeDesc,
					badge: "Chính",
				},
				{
					id: "households",
					label: "Hộ Nông Nghiệp",
					icon: Sprout,
					desc: villageScopeDesc,
				},
				{
					id: "recycle-bin",
					label: "Thùng Rác",
					icon: Trash2,
					desc: "Quản lý hộ dân đã xóa",
				},
				{
					id: "audit",
					label: "Nhật Ký Hoạt Động",
					icon: History,
					desc: "Lịch sử biến động dữ liệu",
				},
				{
					id: "settings",
					label: "Cài Đặt Hệ Thống",
					icon: SettingsIcon,
					desc: "Tài khoản & sao lưu CSDL",
				},
			];
		}
	} else {
		navItems = [
			{
				id: "analytics",
				label: "Thống Kê",
				icon: BarChart3,
				desc: "18 chỉ tiêu nông nghiệp",
				badge: "Chính",
			},
			{
				id: "households",
				label: "Hộ Nông Nghiệp",
				icon: Sprout,
				desc: "Quản lý 18 chỉ số hộ dân",
			},
			{
				id: "recycle-bin",
				label: "Thùng Rác",
				icon: Trash2,
				desc: "Quản lý hộ dân đã xóa",
			},
			{
				id: "audit",
				label: "Nhật Ký Hoạt Động",
				icon: History,
				desc: "Lịch sử biến động dữ liệu",
			},
		];
	}

	return (
		<aside
			className={`bg-slate-950 text-slate-300 flex flex-col shrink-0 border-r border-slate-800/80 select-none transition-[width] duration-200 ease-out overflow-hidden ${
				isSidebarCollapsed ? "w-16" : "w-16 md:w-64"
			}`}
		>
			<div className="p-3 flex items-center justify-between border-b border-slate-900 min-h-[56px] overflow-hidden">
				{!isSidebarCollapsed ? (
					<>
						<div className="hidden md:flex text-xs font-black text-slate-400 uppercase tracking-widest px-2 items-center gap-2 whitespace-nowrap overflow-hidden">
							<Database
								className="w-4 h-4 text-emerald-400 shrink-0"
								strokeWidth={1.5}
							/>
							<span>DANH MỤC</span>
						</div>
						<button
							type="button"
							onClick={toggleSidebar}
							className="hidden md:flex p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-xl transition-all cursor-pointer shrink-0"
							aria-label="Thu gọn thanh bên"
							title="Thu gọn thanh bên"
						>
							<PanelLeftClose className="w-4 h-4" strokeWidth={1.5} />
						</button>
						<button
							type="button"
							onClick={toggleSidebar}
							className="md:hidden w-full flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
							aria-label="Mở rộng hoặc thu gọn thanh bên"
							title="Mở rộng hoặc thu gọn thanh bên"
						>
							<Database className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
						</button>
					</>
				) : (
					<button
						type="button"
						onClick={toggleSidebar}
						className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
						aria-label="Mở rộng thanh bên"
						title="Mở rộng thanh bên"
					>
						<PanelLeftOpen className="w-4 h-4" strokeWidth={1.5} />
					</button>
				)}
			</div>

			<div className="p-2.5 flex-1 overflow-y-auto overflow-x-hidden">
				<nav className="flex flex-col gap-2">
					{navItems.map((item) => {
						const Icon = item.icon;
						const isActive = activeTab === item.id;

						return (
							<div
								key={item.id}
								className="relative group flex justify-center w-full"
							>
								<button
									type="button"
									onClick={() => {
										if (item.id === "villages") {
											setSelectedVillageId("");
											setActiveTab("villages");
										} else {
											setActiveTab(item.id);
										}
									}}
									className={`flex items-center gap-3 rounded-2xl transition-all duration-150 relative cursor-pointer overflow-hidden ${
										isSidebarCollapsed
											? "w-12 h-12 justify-center shrink-0 mx-auto"
											: "w-12 h-12 md:w-full md:h-auto justify-center md:justify-start py-2.5 px-3 min-h-[48px]"
									} ${
										isActive
											? "bg-emerald-600 text-white shadow-md shadow-emerald-950/30"
											: "text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50"
									}`}
								>
									<Icon
										className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : ""}`}
										strokeWidth={1.5}
									/>

									<div
										className={`overflow-hidden whitespace-nowrap transition-all duration-200 ease-out text-left ${
											isSidebarCollapsed
												? "max-w-0 opacity-0 pointer-events-none hidden"
												: "hidden md:flex max-w-[180px] opacity-100 flex-1 flex-col justify-center"
										}`}
									>
										<div className="flex items-center justify-between">
											<span className="text-[13.5px] tracking-tight font-bold">
												{item.label}
											</span>
											{item.badge && (
												<span
													className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ml-1.5 ${
														isActive
															? "bg-emerald-800/90 text-emerald-100"
															: "bg-slate-800 text-slate-300"
													}`}
												>
													{item.badge}
												</span>
											)}
										</div>
										<div
											className={`text-xs truncate mt-0.5 ${
												isActive
													? "text-emerald-100/90"
													: "text-slate-500 group-hover:text-slate-400"
											}`}
										>
											{item.desc}
										</div>
									</div>
								</button>

								{isSidebarCollapsed && (
									<div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-2xl border border-slate-700/90 whitespace-nowrap pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
										<div className="flex items-center gap-1.5">
											<span className="text-sm">{item.label}</span>
										</div>
										<div className="text-xs text-slate-400 font-medium mt-0.5">
											{item.desc}
										</div>
									</div>
								)}
							</div>
						);
					})}
				</nav>
			</div>

			{/* Bottom Version Card matching QLHK */}
			<div className="p-3.5 border-t border-slate-900 bg-slate-950 text-xs text-slate-400 overflow-hidden">
				{!isSidebarCollapsed ? (
					<>
						<div className="hidden md:block space-y-1 whitespace-nowrap overflow-hidden">
							<div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
								<ShieldCheck
									className="w-4 h-4 text-emerald-400 shrink-0"
									strokeWidth={1.5}
								/>
								<span>QLNN v1.0.0</span>
							</div>
						</div>
						<div className="md:hidden flex justify-center">
							<ShieldCheck
								className="w-4 h-4 text-emerald-400"
								strokeWidth={1.5}
							/>
						</div>
					</>
				) : (
					<div className="flex justify-center">
						<ShieldCheck
							className="w-4 h-4 text-emerald-400"
							strokeWidth={1.5}
						/>
					</div>
				)}
			</div>
		</aside>
	);
};
export default Sidebar;
