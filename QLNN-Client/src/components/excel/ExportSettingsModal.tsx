import { DownloadCloud, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface ExportSettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	onExport: (scope: "all" | "selected") => void;
	exporting: boolean;
	isAdmin: boolean;
	selectedCount?: number;
}

export const ExportSettingsModal: React.FC<ExportSettingsModalProps> = ({
	isOpen,
	onClose,
	onExport,
	exporting,
	isAdmin,
	selectedCount = 0,
}) => {
	const [exportScope, setExportScope] = useState<"all" | "selected">("all");
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) return;

		const timer = setTimeout(() => {
			if (modalRef.current) {
				const firstButton = modalRef.current.querySelector<HTMLElement>(
					"button:not([disabled])",
				);
				firstButton?.focus();
			}
		}, 50);

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
				return;
			}

			if (e.key === "Tab") {
				if (!modalRef.current) return;
				const focusableElements =
					modalRef.current.querySelectorAll<HTMLElement>(
						'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
					);
				if (focusableElements.length === 0) return;

				const firstElement = focusableElements[0];
				const lastElement = focusableElements[focusableElements.length - 1];

				if (e.shiftKey) {
					if (document.activeElement === firstElement) {
						e.preventDefault();
						lastElement.focus();
					}
				} else {
					if (document.activeElement === lastElement) {
						e.preventDefault();
						firstElement.focus();
					}
				}
			}
		};

		const handleMouseDown = (e: MouseEvent) => {
			if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
				onClose();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		document.addEventListener("mousedown", handleMouseDown);
		return () => {
			clearTimeout(timer);
			window.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("mousedown", handleMouseDown);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
			<div
				ref={modalRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby="export-settings-title"
				className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md flex flex-col overflow-hidden"
			>
				<div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 flex items-center justify-center">
							<DownloadCloud
								className="w-5 h-5"
								strokeWidth={1.5}
								aria-hidden="true"
							/>
						</div>
						<div>
							<h2
								id="export-settings-title"
								className="text-lg font-black text-slate-900 dark:text-white"
							>
								Cài Đặt Xuất File Excel
							</h2>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								Xuất biểu mẫu 21 chỉ số nông nghiệp chuẩn Xã Đăk Hà
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label="Đóng cửa sổ"
						className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
					>
						<X className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
					</button>
				</div>

				<div className="p-5 space-y-4">
					<div className="space-y-2">
						<h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
							Phạm vi xuất
						</h3>
						<p className="text-xs text-slate-500 dark:text-slate-400">
							{isAdmin
								? "Đang xuất theo thôn đã chọn (hoặc toàn xã nếu chọn Tất cả)."
								: "Đang xuất dữ liệu của thôn hiện tại."}
						</p>
					</div>

					<div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
						<label className="flex items-start gap-3 cursor-pointer group">
							<div className="relative flex items-start">
								<input
									type="radio"
									name="exportScope"
									checked={exportScope === "all"}
									onChange={() => setExportScope("all")}
									className="peer w-5 h-5 appearance-none border-2 border-slate-300 dark:border-slate-600 rounded-full checked:border-emerald-500 checked:border-[6px] transition-all cursor-pointer"
								/>
							</div>
							<div>
								<p className="text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">
									Toàn bộ hộ trong phạm vi
								</p>
								<p className="text-xs text-slate-500 dark:text-slate-400">
									Xuất toàn bộ các hộ hiển thị theo phạm vi đang chọn.
								</p>
							</div>
						</label>
						<label
							className={`flex items-start gap-3 ${selectedCount === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer group"}`}
						>
							<div className="relative flex items-start">
								<input
									type="radio"
									name="exportScope"
									disabled={selectedCount === 0}
									checked={exportScope === "selected"}
									onChange={() => setExportScope("selected")}
									className="peer w-5 h-5 appearance-none border-2 border-slate-300 dark:border-slate-600 rounded-full checked:border-emerald-500 checked:border-[6px] transition-all disabled:cursor-not-allowed cursor-pointer"
								/>
							</div>
							<div>
								<p className="text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">
									Chỉ xuất {selectedCount} hộ đã chọn
								</p>
								<p className="text-xs text-slate-500 dark:text-slate-400">
									Chỉ xuất các hộ đã được tích chọn trong bảng.
								</p>
							</div>
						</label>
					</div>
				</div>

				<div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
					<button
						type="button"
						onClick={onClose}
						aria-label="Hủy"
						className="h-10 px-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
					>
						Hủy
					</button>
					<button
						type="button"
						onClick={() => onExport(exportScope)}
						disabled={exporting}
						aria-label="Bắt đầu xuất Excel"
						className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
					>
						{exporting ? "Đang tạo..." : "Bắt đầu Xuất"}
					</button>
				</div>
			</div>
		</div>
	);
};
