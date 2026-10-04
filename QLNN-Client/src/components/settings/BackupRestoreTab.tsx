import {
	AlertTriangle,
	Database,
	Download,
	KeyRound,
	Lock,
	RefreshCw,
	ShieldCheck,
	UploadCloud,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { API_BASE_URL } from "../../api/apiClient";
import { useModal } from "../../hooks/useModal";
import { secureStorage } from "../../utils/secureStorage";

export const BackupRestoreTab: React.FC = () => {
	const { showModal } = useModal();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const passwordInputRef = useRef<HTMLInputElement>(null);
	const modalRef = useRef<HTMLDivElement>(null);
	const [pendingFile, setPendingFile] = useState<File | null>(null);
	const [password, setPassword] = useState("");
	const [passwordModalOpen, setPasswordModalOpen] = useState(false);
	const [isExporting, setIsExporting] = useState(false);
	const [isRestoring, setIsRestoring] = useState(false);
	const [restoreError, setRestoreError] = useState("");

	useEffect(() => {
		if (passwordModalOpen) {
			const timer = setTimeout(() => {
				passwordInputRef.current?.focus();
			}, 50);

			const handleKeyDown = (e: KeyboardEvent) => {
				if (e.key === "Escape" && !isRestoring) {
					setPasswordModalOpen(false);
					setPendingFile(null);
					setPassword("");
				}
			};

			const handleMouseDown = (e: MouseEvent) => {
				if (
					modalRef.current &&
					!modalRef.current.contains(e.target as Node) &&
					!isRestoring
				) {
					setPasswordModalOpen(false);
					setPendingFile(null);
					setPassword("");
				}
			};

			window.addEventListener("keydown", handleKeyDown);
			document.addEventListener("mousedown", handleMouseDown);

			return () => {
				clearTimeout(timer);
				window.removeEventListener("keydown", handleKeyDown);
				document.removeEventListener("mousedown", handleMouseDown);
			};
		}
	}, [passwordModalOpen, isRestoring]);

	const handleExport = async () => {
		try {
			setIsExporting(true);
			const token = await secureStorage.getItem("accessToken");
			if (!token) {
				showModal({
					title: "Thông báo",
					message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
					type: "danger",
				});
				return;
			}

			const response = await fetch(`${API_BASE_URL}/backup/export`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error("Lỗi khi xuất dữ liệu");
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `Dakha_Backup_${new Date().toISOString().split("T")[0]}.json`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (err) {
			console.error(err);
			showModal({
				title: "Lỗi",
				message:
					"Không thể tải bản sao lưu. Vui lòng kiểm tra quyền Admin hoặc kết nối máy chủ.",
				type: "danger",
			});
		} finally {
			setIsExporting(false);
		}
	};

	const handleRestoreClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setPendingFile(file);
		setPassword("");
		setRestoreError("");
		setPasswordModalOpen(true);

		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const executeRestore = async () => {
		if (!pendingFile) return;
		if (!password.trim()) {
			setRestoreError("Vui lòng nhập mật khẩu quản trị viên để xác nhận.");
			return;
		}

		try {
			setIsRestoring(true);
			setRestoreError("");
			const text = await pendingFile.text();
			const parsedJSON = JSON.parse(text);

			const token = await secureStorage.getItem("accessToken");
			if (!token) {
				setPasswordModalOpen(false);
				showModal({
					title: "Thông báo",
					message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
					type: "danger",
				});
				return;
			}

			const payload = {
				data: parsedJSON.data || parsedJSON,
				admin_password: password.trim(),
			};

			const response = await fetch(`${API_BASE_URL}/backup/restore`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errData = await response.json();
				throw new Error(errData.error || "Lỗi khi khôi phục dữ liệu");
			}

			setPasswordModalOpen(false);
			setPendingFile(null);
			setPassword("");

			showModal({
				title: "Thành công",
				message: "Phục hồi dữ liệu thành công. Vui lòng đăng nhập lại.",
				type: "info",
				onConfirm: () => {
					window.dispatchEvent(new CustomEvent("auth:expired"));
				},
			});
		} catch (err: unknown) {
			console.error(err);
			setRestoreError(
				err instanceof Error ? err.message : "Lỗi khi khôi phục dữ liệu.",
			);
		} finally {
			setIsRestoring(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs max-w-3xl space-y-6">
				{/* Header Title */}
				<div className="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
					<div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200/60 dark:border-sky-800/60">
						<Database className="w-5 h-5" strokeWidth={1.5} />
					</div>
					<div>
						<h3 className="font-bold text-base text-slate-900 dark:text-white">
							Sao Lưu & Phục Hồi Dữ Liệu
						</h3>
						<p className="text-xs text-slate-500 dark:text-slate-400">
							Xuất tệp dự phòng và khôi phục cơ sở dữ liệu khi cần
						</p>
					</div>
				</div>

				{/* Action 1: Xuất sao lưu */}
				<div className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div>
						<h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
							Xuất Bản Sao Lưu (Export Backup)
						</h4>
						<p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md leading-relaxed">
							Tạo tệp dự phòng định dạng JSON chứa toàn bộ dữ liệu nông nghiệp,
							nông thôn mới và cấu hình hệ thống.
						</p>
					</div>
					<button
						type="button"
						onClick={handleExport}
						disabled={isExporting}
						className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0 disabled:opacity-50"
					>
						{isExporting ? (
							<RefreshCw className="w-4 h-4 animate-spin" />
						) : (
							<Download className="w-4 h-4" strokeWidth={1.5} />
						)}
						<span>{isExporting ? "Đang xuất..." : "Tải Bản Sao Lưu"}</span>
					</button>
				</div>

				{/* Action 2: Phục hồi sao lưu */}
				<div className="p-5 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div>
						<div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
							<AlertTriangle className="w-4 h-4" strokeWidth={1.5} />
							<span>Phục Hồi Dữ Liệu (Restore Database)</span>
						</div>
						<p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-md leading-relaxed">
							Chọn tệp sao lưu (.json) từ máy tính để ghi đè phục hồi lại hệ
							thống dữ liệu nông nghiệp.
						</p>
					</div>
					<div>
						<input
							type="file"
							ref={fileInputRef}
							onChange={handleFileChange}
							accept=".json"
							className="hidden"
						/>
						<button
							type="button"
							onClick={handleRestoreClick}
							disabled={isRestoring}
							className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 disabled:opacity-50"
						>
							{isRestoring ? (
								<RefreshCw className="w-4 h-4 animate-spin" />
							) : (
								<UploadCloud className="w-4 h-4" strokeWidth={1.5} />
							)}
							<span>Chọn Tệp Khôi Phục</span>
						</button>
					</div>
				</div>

				{/* System Storage Note */}
				<div className="pt-2 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
					<ShieldCheck
						className="w-4 h-4 text-emerald-500 shrink-0"
						strokeWidth={1.5}
					/>
					<span>
						Tệp sao lưu được mã hóa và bảo mật an toàn theo tiêu chuẩn CSDL quốc
						gia.
					</span>
				</div>
			</div>

			{/* Modal Xác Thực Cấp 2 Khi Khôi Phục CSDL */}
			{passwordModalOpen &&
				createPortal(
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 dark:bg-black/60 animate-in fade-in duration-150">
						<div
							ref={modalRef}
							role="dialog"
							aria-modal="true"
							aria-labelledby="backup-restore-title"
							className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-150"
						>
							<div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center">
										<KeyRound
											className="w-5 h-5"
											strokeWidth={1.5}
											aria-hidden="true"
										/>
									</div>
									<div>
										<h4
											id="backup-restore-title"
											className="font-bold text-sm text-slate-900 dark:text-white"
										>
											Xác Nhận Khôi Phục CSDL
										</h4>
										<p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
											Yêu cầu xác thực bảo mật 2 lớp
										</p>
									</div>
								</div>
								<button
									type="button"
									onClick={() => {
										if (!isRestoring) {
											setPasswordModalOpen(false);
											setPendingFile(null);
											setPassword("");
										}
									}}
									className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
									aria-label="Đóng"
								>
									<X className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
								</button>
							</div>

							<div className="space-y-3">
								<div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
									<strong>Cảnh báo ghi đè:</strong> Toàn bộ dữ liệu hiện có sẽ
									bị thay thế bằng nội dung tệp{" "}
									<code className="font-mono font-bold">
										{pendingFile?.name}
									</code>
									.
								</div>

								<div className="space-y-1.5">
									<label
										htmlFor="admin-password-input"
										className="block text-xs font-bold text-slate-700 dark:text-slate-300"
									>
										Mật khẩu tài khoản Quản trị viên:
									</label>
									<div className="relative">
										<div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
											<Lock
												className="w-4 h-4"
												strokeWidth={1.5}
												aria-hidden="true"
											/>
										</div>
										<input
											id="admin-password-input"
											ref={passwordInputRef}
											type="password"
											placeholder="Nhập mật khẩu của bạn để xác nhận..."
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter" && !isRestoring) {
													executeRestore();
												}
											}}
											className="w-full h-10 pl-10 pr-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-hidden font-medium transition-all"
										/>
									</div>
									{restoreError && (
										<p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1">
											{restoreError}
										</p>
									)}
								</div>
							</div>

							<div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
								<button
									type="button"
									disabled={isRestoring}
									onClick={() => {
										setPasswordModalOpen(false);
										setPendingFile(null);
										setPassword("");
									}}
									className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
								>
									Hủy Bỏ
								</button>
								<button
									type="button"
									disabled={isRestoring || !password.trim()}
									onClick={executeRestore}
									className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
								>
									{isRestoring ? (
										<span>Đang khôi phục CSDL...</span>
									) : (
										<>
											<UploadCloud
												className="w-4 h-4"
												strokeWidth={1.5}
												aria-hidden="true"
											/>
											<span>Xác Nhận Khôi Phục</span>
										</>
									)}
								</button>
							</div>
						</div>
					</div>,
					document.body,
				)}
		</div>
	);
};
