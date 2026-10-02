import { Activity, AlertCircle, CheckCircle2, Server, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef } from "react";

interface ServerStatusModalProps {
	isOpen: boolean;
	onClose: () => void;
	latency: number | null;
	isBackendHealthy: boolean;
}

export const ServerStatusModal: React.FC<ServerStatusModalProps> = ({
	isOpen,
	onClose,
	latency,
	isBackendHealthy,
}) => {
	const modalRef = useRef<HTMLDivElement>(null);

	// Focus Trap & Keyboard Navigation (WCAG 2.1 AA)
	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				onClose();
				return;
			}

			if (e.key === "Tab") {
				if (!modalRef.current) return;
				const focusableElements = modalRef.current.querySelectorAll<
					| HTMLButtonElement
					| HTMLAnchorElement
					| HTMLInputElement
					| HTMLSelectElement
					| HTMLTextAreaElement
				>(
					'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
				);

				const focusable = Array.from(focusableElements).filter(
					(el) =>
						!el.hasAttribute("disabled") &&
						el.getAttribute("aria-hidden") !== "true",
				);

				if (focusable.length === 0) {
					e.preventDefault();
					return;
				}

				const firstElement = focusable[0];
				const lastElement = focusable[focusable.length - 1];

				if (e.shiftKey) {
					if (document.activeElement === firstElement) {
						e.preventDefault();
						lastElement?.focus();
					}
				} else {
					if (document.activeElement === lastElement) {
						e.preventDefault();
						firstElement?.focus();
					}
				}
			}
		};

		const handleMouseDown = (e: MouseEvent) => {
			if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
				onClose();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("mousedown", handleMouseDown);

		// Auto-focus on modal opening
		const timer = setTimeout(() => {
			if (modalRef.current) {
				const firstBtn = modalRef.current.querySelector<HTMLElement>("button");
				firstBtn?.focus();
			}
		}, 50);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("mousedown", handleMouseDown);
			clearTimeout(timer);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
			<div
				ref={modalRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby="server-status-title"
				className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
			>
				<div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
					<div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
						<Server
							className="w-5 h-5 text-slate-500"
							strokeWidth={1.5}
							aria-hidden="true"
						/>
						<span id="server-status-title">Trạng Thái Máy Chủ</span>
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label="Đóng hộp thoại trạng thái máy chủ"
						className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
					>
						<X className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
					</button>
				</div>

				<div className="p-6 space-y-6">
					<div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
						<div className="flex items-center gap-3">
							<div
								className={`w-10 h-10 rounded-full flex items-center justify-center ${isBackendHealthy ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400" : "bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400"}`}
							>
								{isBackendHealthy ? (
									<CheckCircle2
										className="w-5 h-5"
										strokeWidth={1.5}
										aria-hidden="true"
									/>
								) : (
									<AlertCircle
										className="w-5 h-5"
										strokeWidth={1.5}
										aria-hidden="true"
									/>
								)}
							</div>
							<div>
								<div className="font-bold text-sm text-slate-900 dark:text-slate-100">
									Kết Nối
								</div>
								<div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
									{isBackendHealthy ? "Hoạt động ổn định" : "Mất kết nối"}
								</div>
							</div>
						</div>
					</div>

					<div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
								<Activity
									className="w-5 h-5"
									strokeWidth={1.5}
									aria-hidden="true"
								/>
							</div>
							<div>
								<div className="font-bold text-sm text-slate-900 dark:text-slate-100">
									Độ Trễ (Ping)
								</div>
								<div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
									{latency !== null ? `${latency} ms` : "Đang đo..."}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
