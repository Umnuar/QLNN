import {
	Building2,
	CheckCircle2,
	Database,
	Edit3,
	Eye,
	EyeOff,
	Home,
	Info,
	KeyRound,
	LogOut,
	MapPin,
	Plus,
	RefreshCw,
	Shield,
	Trash2,
	User as UserIcon,
	Users,
	X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useApp } from "../AppContext";
import { apiClient } from "../api/apiClient";
import { authApi } from "../api/authApi";
import { CustomSelect } from "../components/common/CustomSelect";
import { BackupRestoreTab } from "../components/settings/BackupRestoreTab";
import { useModal } from "../hooks/useModal";
import type { User } from "../types";

type SettingsTab = "profile" | "users" | "backup" | "system";

export const SettingsPage: React.FC = () => {
	const { villages, user, logout } = useApp();
	const { showModal } = useModal();
	const isAdmin = user?.role === "admin";

	const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

	// --- TAB 1: PROFILE & ĐỔI MẬT KHẨU CÁ NHÂN ---
	const [newPasswordOwn, setNewPasswordOwn] = useState("");
	const [confirmPasswordOwn, setConfirmPasswordOwn] = useState("");
	const [showPasswordOwn, setShowPasswordOwn] = useState(false);
	const [loadingOwnPassword, setLoadingOwnPassword] = useState(false);

	// --- TAB 2: QUẢN LÝ CÁN BỘ THÔN ---
	const [usersList, setUsersList] = useState<User[]>([]);
	const [loadingUsers, setLoadingUsers] = useState(false);

	// Modal thêm cán bộ
	const [isAddUserOpen, setIsAddUserOpen] = useState(false);
	const [newUsername, setNewUsername] = useState("");
	const [newUserPassword, setNewUserPassword] = useState("");
	const [newUserVillageId, setNewUserVillageId] = useState("");
	const [newUserRole, setNewUserRole] = useState<"admin" | "user">("user");

	// Modal đổi mật khẩu cán bộ
	const [resetPwdUser, setResetPwdUser] = useState<User | null>(null);
	const [resetPwdValue, setResetPwdValue] = useState("");
	const [showResetPwd, setShowResetPwd] = useState(false);
	const [loadingResetPwd, setLoadingResetPwd] = useState(false);

	// Modal phân công thôn
	const [assignUser, setAssignUser] = useState<User | null>(null);
	const [assignVillageId, setAssignVillageId] = useState("");
	const [assignRole, setAssignRole] = useState<"admin" | "user">("user");
	const [loadingAssign, setLoadingAssign] = useState(false);

	// --- TAB 4: THÔNG TIN ĐƠN VỊ & HỆ THỐNG ---
	const [communeName, setCommuneName] = useState("Ủy ban nhân dân Xã Đăk Hà");
	const [districtName, setDistrictName] = useState("Huyện Đăk Hà");
	const [provinceName, setProvinceName] = useState("Tỉnh Kon Tum");
	const [communeAddress, setCommuneAddress] = useState(
		"Trung tâm Xã Đăk Hà, Huyện Đăk Hà, Tỉnh Kon Tum",
	);
	const [communePhone, setCommunePhone] = useState("0260.3822.123");
	const [communeEmail, setCommuneEmail] = useState(
		"ubnd.xadakha@kontum.gov.vn",
	);
	const [savedCommune, setSavedCommune] = useState(false);

	const fetchUsers = useCallback(async () => {
		setLoadingUsers(true);
		try {
			const res = await apiClient.get("/users");
			setUsersList(Array.isArray(res.data) ? res.data : res.data?.data || []);
		} catch (error) {
			console.error("Error fetching users", error);
		} finally {
			setLoadingUsers(false);
		}
	}, []);

	useEffect(() => {
		if (activeTab === "users" && isAdmin) {
			fetchUsers();
		}
	}, [activeTab, isAdmin, fetchUsers]);

	// Đổi mật khẩu cá nhân
	const handleChangeOwnPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newPasswordOwn) {
			showModal({
				title: "Cảnh báo",
				message: "Vui lòng nhập mật khẩu mới.",
				type: "warning",
			});
			return;
		}
		if (newPasswordOwn.length < 6) {
			showModal({
				title: "Mật khẩu yếu",
				message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
				type: "warning",
			});
			return;
		}
		if (newPasswordOwn !== confirmPasswordOwn) {
			showModal({
				title: "Không khớp",
				message: "Mật khẩu xác nhận không trùng khớp.",
				type: "warning",
			});
			return;
		}
		if (!user?.id) return;

		setLoadingOwnPassword(true);
		try {
			await authApi.updatePassword(user.id, newPasswordOwn);
			setNewPasswordOwn("");
			setConfirmPasswordOwn("");
			showModal({
				title: "Thành công",
				message: "Đổi mật khẩu cá nhân thành công!",
				type: "success",
			});
		} catch (err: any) {
			showModal({
				title: "Lỗi",
				message:
					err.response?.data?.error ||
					"Không thể đổi mật khẩu cá nhân. Vui lòng thử lại.",
				type: "danger",
			});
		} finally {
			setLoadingOwnPassword(false);
		}
	};

	// Tạo tài khoản cán bộ mới
	const handleCreateUser = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newUsername.trim() || !newUserPassword.trim()) {
			showModal({
				title: "Thiếu thông tin",
				message: "Vui lòng nhập tên đăng nhập và mật khẩu.",
				type: "warning",
			});
			return;
		}
		if (newUserPassword.trim().length < 6) {
			showModal({
				title: "Mật khẩu yếu",
				message: "Mật khẩu phải có ít nhất 6 ký tự.",
				type: "warning",
			});
			return;
		}
		try {
			await apiClient.post("/users", {
				username: newUsername.trim(),
				password: newUserPassword.trim(),
				role: newUserRole,
				village_id: newUserRole === "user" ? newUserVillageId || null : null,
			});
			setIsAddUserOpen(false);
			setNewUsername("");
			setNewUserPassword("");
			setNewUserVillageId("");
			setNewUserRole("user");
			fetchUsers();
			showModal({
				title: "Thành công",
				message: "Tạo tài khoản cán bộ thành công.",
				type: "success",
			});
		} catch (err: any) {
			showModal({
				title: "Lỗi",
				message: err.response?.data?.error || "Không thể tạo tài khoản",
				type: "danger",
			});
		}
	};

	// Đặt lại mật khẩu cán bộ
	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!resetPwdUser || !resetPwdValue.trim()) return;
		if (resetPwdValue.trim().length < 6) {
			showModal({
				title: "Mật khẩu yếu",
				message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
				type: "warning",
			});
			return;
		}
		setLoadingResetPwd(true);
		try {
			await authApi.updatePassword(resetPwdUser.id, resetPwdValue.trim());
			setResetPwdUser(null);
			setResetPwdValue("");
			showModal({
				title: "Thành công",
				message: `Đã đặt lại mật khẩu cho cán bộ "${resetPwdUser.username}".`,
				type: "success",
			});
		} catch (err: any) {
			showModal({
				title: "Lỗi",
				message:
					err.response?.data?.error || "Không thể đặt lại mật khẩu cán bộ",
				type: "danger",
			});
		} finally {
			setLoadingResetPwd(false);
		}
	};

	// Phân công thôn cán bộ
	const handleAssignVillage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!assignUser) return;
		setLoadingAssign(true);
		try {
			await apiClient.put(`/users/${assignUser.id}`, {
				role: assignRole,
				village_id: assignRole === "user" ? assignVillageId || null : null,
			});
			const updatedUsername = assignUser.username;
			setAssignUser(null);
			fetchUsers();
			showModal({
				title: "Thành công",
				message: `Đã cập nhật phân công công tác cho cán bộ "${updatedUsername}".`,
				type: "success",
			});
		} catch (err: any) {
			showModal({
				title: "Lỗi",
				message: err.response?.data?.error || "Không thể cập nhật phân công",
				type: "danger",
			});
		} finally {
			setLoadingAssign(false);
		}
	};

	// Xóa tài khoản cán bộ
	const handleDeleteUser = (u: User) => {
		if (u.id === user?.id) {
			showModal({
				title: "Cảnh báo",
				message: "Không thể tự xóa tài khoản đang đăng nhập.",
				type: "warning",
			});
			return;
		}
		showModal({
			title: "Xác nhận xóa tài khoản",
			message: `Bạn có chắc muốn xóa tài khoản cán bộ "${u.username}" không?\nThao tác này không thể hoàn tác.`,
			type: "danger",
			confirmText: "Xóa Tài Khoản",
			cancelText: "Hủy",
			onConfirm: async () => {
				try {
					await apiClient.delete(`/users/${u.id}`);
					fetchUsers();
					showModal({
						title: "Thành công",
						message: "Đã xóa tài khoản cán bộ thành công.",
						type: "success",
					});
				} catch (err: any) {
					showModal({
						title: "Lỗi",
						message: err.response?.data?.error || "Không thể xóa tài khoản",
						type: "danger",
					});
				}
			},
		});
	};

	// Lưu thông tin đơn vị
	const handleSaveCommune = (e: React.FormEvent) => {
		e.preventDefault();
		setSavedCommune(true);
		setTimeout(() => setSavedCommune(false), 3000);
		showModal({
			title: "Đã lưu thông tin",
			message: "Thông tin UBND Xã Đăk Hà đã được cập nhật thành công.",
			type: "success",
		});
	};

	const currentVillageName =
		user?.role === "admin"
			? "Toàn xã Đăk Hà"
			: villages.find((v) => v.id === user?.village_id)?.name ||
				"Chưa phân công";

	return (
		<div className="space-y-6 max-w-5xl mx-auto pb-12 select-none animate-in fade-in">
			{/* 4 Tabs Điều Hướng Chuẩn QLCS */}
			<div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
				<button
					type="button"
					onClick={() => setActiveTab("profile")}
					className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
						activeTab === "profile"
							? "bg-emerald-600 text-white shadow-xs"
							: "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
					}`}
				>
					<UserIcon className="w-4 h-4" strokeWidth={1.5} />
					<span>Tài Khoản Của Tôi</span>
				</button>

				{isAdmin && (
					<button
						type="button"
						onClick={() => setActiveTab("users")}
						className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
							activeTab === "users"
								? "bg-emerald-600 text-white shadow-xs"
								: "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
						}`}
					>
						<Users className="w-4 h-4" strokeWidth={1.5} />
						<span>Quản Lý Cán Bộ Thôn</span>
					</button>
				)}

				{isAdmin && (
					<button
						type="button"
						onClick={() => setActiveTab("backup")}
						className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
							activeTab === "backup"
								? "bg-emerald-600 text-white shadow-xs"
								: "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
						}`}
					>
						<Database className="w-4 h-4" strokeWidth={1.5} />
						<span>Sao Lưu CSDL</span>
					</button>
				)}

				<button
					type="button"
					onClick={() => setActiveTab("system")}
					className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
						activeTab === "system"
							? "bg-emerald-600 text-white shadow-xs"
							: "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
					}`}
				>
					<Building2 className="w-4 h-4" strokeWidth={1.5} />
					<span>Thông Tin Đơn Vị & Hệ Thống</span>
				</button>
			</div>

			{/* TAB 1: TÀI KHOẢN CỦA TÔI */}
			{activeTab === "profile" && (
				<div className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Card 1: Thông tin tài khoản */}
						<div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
							<div>
								<div className="flex items-center gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
									<div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-2xl flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shrink-0 shadow-inner">
										{(user?.username || "CB").slice(0, 2).toUpperCase()}
									</div>
									<div className="min-w-0">
										<div className="flex items-center gap-2">
											<h3 className="text-lg font-black text-slate-900 dark:text-white truncate">
												{user?.username}
											</h3>
											<span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
												<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
												<span>Hoạt động</span>
											</span>
										</div>
										<p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
											{user?.role === "admin"
												? "Quản trị viên Xã (Admin)"
												: "Cán bộ phụ trách Thôn"}
										</p>
									</div>
								</div>

								<div className="mt-5 space-y-3.5 text-xs">
									<div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
										<span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
											<Shield className="w-3.5 h-3.5 text-slate-400" />
											<span>Vai trò hệ thống:</span>
										</span>
										<span className="font-bold text-slate-900 dark:text-white">
											{user?.role === "admin"
												? "Cán bộ Quản trị Xã"
												: "Cán bộ Cơ sở"}
										</span>
									</div>

									<div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
										<span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
											<Home className="w-3.5 h-3.5 text-slate-400" />
											<span>Đơn vị công tác:</span>
										</span>
										<span className="font-bold text-slate-900 dark:text-white">
											UBND Xã Đăk Hà
										</span>
									</div>

									<div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
										<span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
											<MapPin className="w-3.5 h-3.5 text-slate-400" />
											<span>Địa bàn quản lý:</span>
										</span>
										<span className="font-bold text-emerald-600 dark:text-emerald-400">
											{currentVillageName}
										</span>
									</div>
								</div>
							</div>

							<div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
								<button
									type="button"
									onClick={() => logout()}
									className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
								>
									<LogOut className="w-4 h-4" strokeWidth={1.5} />
									<span>Đăng Xuất Khỏi Hệ Thống</span>
								</button>
							</div>
						</div>

						{/* Card 2: Đổi mật khẩu cá nhân */}
						<form
							onSubmit={handleChangeOwnPassword}
							className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5"
						>
							<div>
								<div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
									<div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
										<KeyRound className="w-5 h-5" strokeWidth={1.5} />
									</div>
									<div>
										<h3 className="text-sm font-black text-slate-900 dark:text-white">
											Đổi Mật Khẩu Cá Nhân
										</h3>
										<p className="text-xs text-slate-500 dark:text-slate-400">
											Bảo vệ an toàn tài khoản bằng mật khẩu có độ dài tối thiểu
											6 ký tự
										</p>
									</div>
								</div>

								<div className="mt-5 space-y-4">
									<div>
										<label
											htmlFor="own-new-password"
											className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
										>
											Mật Khẩu Mới *
										</label>
										<div className="relative">
											<input
												id="own-new-password"
												type={showPasswordOwn ? "text" : "password"}
												value={newPasswordOwn}
												onChange={(e) => setNewPasswordOwn(e.target.value)}
												placeholder="Nhập mật khẩu mới..."
												className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition-all"
											/>
											<button
												type="button"
												onClick={() => setShowPasswordOwn(!showPasswordOwn)}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
												aria-label="Toggle password visibility"
											>
												{showPasswordOwn ? (
													<EyeOff
														className="w-4 h-4"
														strokeWidth={1.5}
														aria-hidden="true"
													/>
												) : (
													<Eye
														className="w-4 h-4"
														strokeWidth={1.5}
														aria-hidden="true"
													/>
												)}
											</button>
										</div>
									</div>

									<div>
										<label
											htmlFor="own-confirm-password"
											className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
										>
											Xác Nhận Mật Khẩu Mới *
										</label>
										<input
											id="own-confirm-password"
											type={showPasswordOwn ? "text" : "password"}
											value={confirmPasswordOwn}
											onChange={(e) => setConfirmPasswordOwn(e.target.value)}
											placeholder="Nhập lại mật khẩu mới..."
											className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition-all"
										/>
									</div>
								</div>
							</div>

							<div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
								<button
									type="submit"
									disabled={loadingOwnPassword || !newPasswordOwn}
									className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
								>
									<KeyRound className="w-4 h-4" strokeWidth={1.5} />
									<span>
										{loadingOwnPassword
											? "Đang cập nhật..."
											: "Cập Nhật Mật Khẩu"}
									</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* TAB 2: QUẢN LÝ CÁN BỘ THÔN (ADMIN) */}
			{activeTab === "users" && isAdmin && (
				<div className="space-y-6">
					<div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
						<div>
							<h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
								<Users className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />
								<span>Danh Sách Tài Khoản Cán Bộ ({usersList.length})</span>
							</h3>
							<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
								Quản trị tài khoản đăng nhập, phân công địa bàn quản lý thôn và
								đặt lại mật khẩu cán bộ
							</p>
						</div>

						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={fetchUsers}
								className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
								title="Làm mới danh sách"
								aria-label="Làm mới danh sách"
							>
								<RefreshCw
									className={`w-4 h-4 ${loadingUsers ? "animate-spin text-emerald-600" : ""}`}
									strokeWidth={1.5}
								/>
							</button>
							<button
								type="button"
								onClick={() => setIsAddUserOpen(true)}
								className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
							>
								<Plus className="w-4 h-4" strokeWidth={1.5} />
								<span>Thêm Cán Bộ</span>
							</button>
						</div>
					</div>

					{/* Form thêm cán bộ */}
					{isAddUserOpen && (
						<form
							onSubmit={handleCreateUser}
							className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-emerald-500 shadow-xl space-y-4 animate-in fade-in"
						>
							<div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
								<h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
									<Plus
										className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
										strokeWidth={1.5}
									/>
									<span>Thêm Tài Khoản Cán Bộ Mới</span>
								</h4>
								<button
									type="button"
									onClick={() => setIsAddUserOpen(false)}
									className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
									aria-label="Đóng form"
								>
									<X className="w-4 h-4" strokeWidth={1.5} />
								</button>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label
										htmlFor="create-user-username"
										className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
									>
										Tên Đăng Nhập *
									</label>
									<input
										id="create-user-username"
										type="text"
										required
										value={newUsername}
										onChange={(e) => setNewUsername(e.target.value)}
										placeholder="canbothon1"
										className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
									/>
								</div>
								<div>
									<label
										htmlFor="create-user-password"
										className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
									>
										Mật Khẩu Khởi Tạo *
									</label>
									<input
										id="create-user-password"
										type="password"
										required
										value={newUserPassword}
										onChange={(e) => setNewUserPassword(e.target.value)}
										placeholder="Ít nhất 6 ký tự"
										className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
									/>
								</div>
								<div>
									<CustomSelect
										label="Vai trò"
										value={newUserRole}
										onChange={(val) => setNewUserRole(val as any)}
										options={[
											{ value: "user", label: "Cán bộ Thôn (User)" },
											{ value: "admin", label: "Quản trị viên Xã (Admin)" },
										]}
									/>
								</div>
								{newUserRole === "user" && (
									<div>
										<CustomSelect
											label="Phân công Thôn"
											value={newUserVillageId}
											onChange={(val) => setNewUserVillageId(String(val))}
											options={villages.map((v) => ({
												value: v.id,
												label: v.name,
											}))}
											placeholder="-- Chọn thôn phụ trách --"
										/>
									</div>
								)}
							</div>

							<div className="flex justify-end gap-2 pt-2">
								<button
									type="button"
									onClick={() => setIsAddUserOpen(false)}
									className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold cursor-pointer active:scale-95"
								>
									Hủy
								</button>
								<button
									type="submit"
									className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
								>
									<Plus className="w-4 h-4" strokeWidth={1.5} />
									<span>Tạo Tài Khoản</span>
								</button>
							</div>
						</form>
					)}

					{/* Modal đặt lại mật khẩu cán bộ */}
					{resetPwdUser && (
						<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 dark:bg-black/60 animate-in fade-in duration-150">
							<form
								onSubmit={handleResetPassword}
								className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-4 max-w-md w-full animate-in zoom-in-95 duration-150"
							>
								<div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
									<h4 className="text-sm font-bold text-slate-900 dark:text-white">
										Đặt lại mật khẩu cho:{" "}
										<strong className="text-emerald-600">
											{resetPwdUser.username}
										</strong>
									</h4>
									<button
										type="button"
										onClick={() => setResetPwdUser(null)}
										className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
										aria-label="Đóng"
									>
										<X className="w-4 h-4" strokeWidth={1.5} />
									</button>
								</div>
								<div>
									<label
										htmlFor="reset-user-password"
										className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
									>
										Mật khẩu mới (ít nhất 6 ký tự)
									</label>
									<div className="relative">
										<input
											id="reset-user-password"
											type={showResetPwd ? "text" : "password"}
											required
											value={resetPwdValue}
											onChange={(e) => setResetPwdValue(e.target.value)}
											placeholder="Nhập mật khẩu mới..."
											className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
										/>
										<button
											type="button"
											onClick={() => setShowResetPwd(!showResetPwd)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
										>
											{showResetPwd ? (
												<EyeOff
													className="w-4 h-4"
													strokeWidth={1.5}
													aria-hidden="true"
												/>
											) : (
												<Eye
													className="w-4 h-4"
													strokeWidth={1.5}
													aria-hidden="true"
												/>
											)}
										</button>
									</div>
								</div>
								<div className="flex justify-end gap-2 pt-2">
									<button
										type="button"
										onClick={() => setResetPwdUser(null)}
										className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold cursor-pointer active:scale-95"
									>
										Hủy
									</button>
									<button
										type="submit"
										disabled={loadingResetPwd}
										className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
									>
										{loadingResetPwd ? "Đang lưu..." : "Lưu mật khẩu"}
									</button>
								</div>
							</form>
						</div>
					)}

					{/* Modal phân công thôn cán bộ */}
					{assignUser && (
						<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 dark:bg-black/60 animate-in fade-in duration-150">
							<form
								onSubmit={handleAssignVillage}
								className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-4 max-w-md w-full animate-in zoom-in-95 duration-150"
							>
								<div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
									<h4 className="text-sm font-bold text-slate-900 dark:text-white">
										Phân công thôn cho:{" "}
										<strong className="text-emerald-600">
											{assignUser.username}
										</strong>
									</h4>
									<button
										type="button"
										onClick={() => setAssignUser(null)}
										className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
										aria-label="Đóng"
									>
										<X className="w-4 h-4" strokeWidth={1.5} />
									</button>
								</div>
								<div className="space-y-3">
									<div>
										<CustomSelect
											label="Vai trò"
											value={assignRole}
											onChange={(val) => setAssignRole(val as any)}
											options={[
												{ value: "user", label: "Cán bộ Thôn (User)" },
												{ value: "admin", label: "Quản trị viên Xã (Admin)" },
											]}
										/>
									</div>
									{assignRole === "user" && (
										<div>
											<CustomSelect
												label="Thôn Phụ Trách"
												value={assignVillageId}
												onChange={(val) => setAssignVillageId(String(val))}
												options={villages.map((v) => ({
													value: v.id,
													label: v.name,
												}))}
												placeholder="-- Chọn thôn --"
											/>
										</div>
									)}
								</div>
								<div className="flex justify-end gap-2 pt-2">
									<button
										type="button"
										onClick={() => setAssignUser(null)}
										className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold cursor-pointer active:scale-95"
									>
										Hủy
									</button>
									<button
										type="submit"
										disabled={loadingAssign}
										className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
									>
										{loadingAssign ? "Đang lưu..." : "Lưu phân công"}
									</button>
								</div>
							</form>
						</div>
					)}

					{/* Bảng danh sách cán bộ chuẩn Chromium */}
					<div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full text-xs text-left border-separate border-spacing-0 whitespace-nowrap">
								<thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
									<tr>
										<th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
											Tài Khoản
										</th>
										<th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
											Vai Trò
										</th>
										<th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
											Địa Bàn Phụ Trách
										</th>
										<th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
											Trạng Thái
										</th>
										<th className="px-4 py-3 text-right border-b border-slate-200 dark:border-slate-800">
											Hành Động
										</th>
									</tr>
								</thead>
								<tbody className="font-medium">
									{usersList.map((u) => {
										const villageName =
											villages.find((v) => v.id === u.village_id)?.name ||
											(u.role === "admin"
												? "Toàn xã Đăk Hà"
												: "Chưa phân công");
										return (
											<tr
												key={u.id}
												className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
											>
												<td className="px-4 py-3 font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800">
													<div className="flex items-center gap-2">
														<div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-700">
															{u.username.slice(0, 2).toUpperCase()}
														</div>
														<span>{u.username}</span>
													</div>
												</td>
												<td className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
													<span
														className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
															u.role === "admin"
																? "bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60"
																: "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
														}`}
													>
														{u.role === "admin" ? "Admin Xã" : "Cán bộ thôn"}
													</span>
												</td>
												<td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800">
													{villageName}
												</td>
												<td className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
													<div className="flex items-center gap-1.5">
														<span
															className={`w-2 h-2 rounded-full ${u.is_online ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`}
														></span>
														<span className="text-[11px] text-slate-500 dark:text-slate-400">
															{u.is_online ? "Hoạt động" : "Ngoại tuyến"}
														</span>
													</div>
												</td>
												<td className="px-4 py-3 text-right border-b border-slate-100 dark:border-slate-800">
													<div className="flex items-center justify-end gap-1.5">
														<button
															type="button"
															onClick={() => {
																setAssignUser(u);
																setAssignRole(u.role as any);
																setAssignVillageId(u.village_id || "");
															}}
															className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
															title="Phân công thôn"
															aria-label={`Phân công thôn cho ${u.username}`}
														>
															<Edit3
																className="w-3.5 h-3.5"
																strokeWidth={1.5}
															/>
														</button>
														<button
															type="button"
															onClick={() => {
																setResetPwdUser(u);
																setResetPwdValue("");
															}}
															className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
															title="Đổi mật khẩu cán bộ"
															aria-label={`Đổi mật khẩu cho ${u.username}`}
														>
															<KeyRound
																className="w-3.5 h-3.5"
																strokeWidth={1.5}
															/>
														</button>
														<button
															type="button"
															onClick={() => handleDeleteUser(u)}
															disabled={u.id === user?.id}
															className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
															title="Xóa tài khoản"
															aria-label={`Xóa tài khoản ${u.username}`}
														>
															<Trash2
																className="w-3.5 h-3.5"
																strokeWidth={1.5}
															/>
														</button>
													</div>
												</td>
											</tr>
										);
									})}
									{usersList.length === 0 && (
										<tr>
											<td
												colSpan={5}
												className="px-4 py-8 text-center text-slate-400"
											>
												Chưa có tài khoản cán bộ nào
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			)}

			{/* TAB 3: SAO LƯU CSDL (ADMIN) */}
			{activeTab === "backup" && isAdmin && (
				<div className="space-y-6">
					<BackupRestoreTab />
				</div>
			)}

			{/* TAB 4: THÔNG TIN ĐƠN VỊ & HỆ THỐNG */}
			{activeTab === "system" && (
				<div className="space-y-6">
					{/* Card 1: Thông Tin Đơn Vị Hành Chính */}
					<form
						onSubmit={handleSaveCommune}
						className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
					>
						<div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shrink-0">
									<Building2 className="w-5 h-5" strokeWidth={1.5} />
								</div>
								<div>
									<h3 className="font-black text-slate-900 dark:text-white text-base">
										Thông Tin Đơn Vị Hành Chính
									</h3>
									<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
										Xuất hiện trên tiêu đề báo cáo, biểu mẫu Excel và thống kê
										chính thức
									</p>
								</div>
							</div>
							{savedCommune && (
								<span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
									<CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
									<span>Đã lưu thành công</span>
								</span>
							)}
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="commune-name"
									className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
								>
									Tên Đơn Vị Cấp Xã *
								</label>
								<input
									id="commune-name"
									type="text"
									required
									value={communeName}
									onChange={(e) => setCommuneName(e.target.value)}
									className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
								/>
							</div>

							<div>
								<label
									htmlFor="commune-district"
									className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
								>
									Huyện Quản Lý *
								</label>
								<input
									id="commune-district"
									type="text"
									required
									value={districtName}
									onChange={(e) => setDistrictName(e.target.value)}
									className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
								/>
							</div>

							<div>
								<label
									htmlFor="commune-province"
									className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
								>
									Tỉnh / Thành Phố *
								</label>
								<input
									id="commune-province"
									type="text"
									required
									value={provinceName}
									onChange={(e) => setProvinceName(e.target.value)}
									className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
								/>
							</div>

							<div>
								<label
									htmlFor="commune-phone"
									className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
								>
									Điện Thoại Trực Ban
								</label>
								<input
									id="commune-phone"
									type="text"
									value={communePhone}
									onChange={(e) => setCommunePhone(e.target.value)}
									className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
								/>
							</div>

							<div>
								<label
									htmlFor="commune-address"
									className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
								>
									Trụ Sở Làm Việc
								</label>
								<input
									id="commune-address"
									type="text"
									value={communeAddress}
									onChange={(e) => setCommuneAddress(e.target.value)}
									className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
								/>
							</div>

							<div>
								<label
									htmlFor="commune-email"
									className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
								>
									Hòm Thư Điện Tử (Email)
								</label>
								<input
									id="commune-email"
									type="email"
									value={communeEmail}
									onChange={(e) => setCommuneEmail(e.target.value)}
									className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
								/>
							</div>
						</div>

						{isAdmin && (
							<div className="pt-3 flex justify-end">
								<button
									type="submit"
									className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
								>
									Lưu Thay Đổi
								</button>
							</div>
						)}
					</form>

					{/* Card 2: Thông Tin Phần Mềm QLNN */}
					<div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
						<div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
							<div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shrink-0">
								<Info className="w-5 h-5" strokeWidth={1.5} />
							</div>
							<div>
								<h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
									Thông Tin Phần Mềm QLNN Xã Đăk Hà
								</h3>
								<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
									Chuẩn hóa giao diện & kiến trúc vận hành theo quy chuẩn Doanh
									nghiệp QLCS
								</p>
							</div>
						</div>

						<div className="space-y-2.5 text-xs">
							<div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
								<span className="text-slate-500 dark:text-slate-400">
									Tên hệ thống:
								</span>
								<span className="font-bold text-slate-900 dark:text-white">
									Hệ Thống Quản Lý Nông Nghiệp & Nông Thôn Mới Xã Đăk Hà
								</span>
							</div>
							<div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
								<span className="text-slate-500 dark:text-slate-400">
									Mã phần mềm:
								</span>
								<span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
									QLNN-DAKHA
								</span>
							</div>
							<div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
								<span className="text-slate-500 dark:text-slate-400">
									Phiên bản phát hành:
								</span>
								<span className="font-mono font-bold text-slate-800 dark:text-slate-200">
									v2.5.0 (Enterprise QLCS Edition)
								</span>
							</div>
							<div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
								<span className="text-slate-500 dark:text-slate-400">
									Đơn vị triển khai:
								</span>
								<span className="font-bold text-slate-900 dark:text-white">
									Ủy Ban Nhân Dân Xã Đăk Hà, Tỉnh Kon Tum
								</span>
							</div>
							<div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
								<span className="text-slate-500 dark:text-slate-400">
									Công nghệ nền tảng:
								</span>
								<span className="font-mono text-slate-600 dark:text-slate-300">
									Vite 5 • React 18 • Tailwind CSS • Electron
								</span>
							</div>
							<div className="flex items-center justify-between py-1.5">
								<span className="text-slate-500 dark:text-slate-400">
									Bản quyền & Vận hành:
								</span>
								<span className="font-medium text-slate-600 dark:text-slate-400">
									© 2026 UBND Xã Đăk Hà. Toàn quyền bảo lưu.
								</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default SettingsPage;
