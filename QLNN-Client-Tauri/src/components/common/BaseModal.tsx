import { X } from "lucide-react";
import type React from "react";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface BaseModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	description?: string;
	icon?: React.ComponentType<{
		className?: string;
		strokeWidth?: number | string;
	}>;
	iconClassName?: string;
	size?: ModalSize;
	headerExtra?: React.ReactNode;
	children: React.ReactNode;
	footer?: React.ReactNode;
	className?: string;
	initialFocusRef?: React.RefObject<HTMLElement>;
}

const SIZE_CLASSES: Record<ModalSize, string> = {
	sm: "max-w-[420px]",
	md: "max-w-[640px]",
	lg: "max-w-[880px]",
	xl: "max-w-[min(1200px,92vw)]",
};

/**
 * Component BaseModal dùng chung cho toàn hệ thống:
 * 1. Lớp phủ đặc, không dùng backdrop-blur, phủ đều toàn bộ viewport (sidebar + header).
 *    Light: rgba(15, 23, 42, 0.45) | Dark: rgba(0, 0, 0, 0.60)
 * 2. Cấu trúc chuẩn 3 phần: Tiêu đề (icon + tên + mô tả + nút đóng), Thân cuộn, Chân cố định.
 * 3. Hỗ trợ kích thước: sm (~420px), md (~640px), lg (~880px), xl (min(1200px, 92vw)), cao tối đa 85vh.
 * 4. Truy cập chuẩn: role="dialog", aria-modal="true", Focus Trap, phím Esc đóng, trả focus khi unmount, vùng bấm >= 44px.
 */
export const BaseModal: React.FC<BaseModalProps> = ({
	isOpen,
	onClose,
	title,
	description,
	icon: Icon,
	iconClassName = "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400",
	size = "md",
	headerExtra,
	children,
	footer,
	className = "",
	initialFocusRef,
}) => {
	const modalRef = useRef<HTMLDivElement>(null);
	const previousActiveElementRef = useRef<HTMLElement | null>(null);
	const titleId = useId();
	const descId = useId();

	useEffect(() => {
		if (!isOpen) return;

		// Lưu phần tử đang active trước khi mở modal để trả focus khi đóng
		previousActiveElementRef.current = document.activeElement as HTMLElement | null;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				onClose();
				return;
			}

			// Focus trap
			if (e.key === "Tab" && modalRef.current) {
				const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
					'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
				);
				const focusable = Array.from(focusableElements).filter(
					(el) =>
						!el.hasAttribute("disabled") &&
						el.getAttribute("aria-hidden") !== "true" &&
						el.offsetParent !== null,
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

		window.addEventListener("keydown", handleKeyDown);
		document.addEventListener("mousedown", handleMouseDown);

		// Auto focus element đầu tiên hoặc initialFocusRef
		const timer = setTimeout(() => {
			if (initialFocusRef?.current) {
				initialFocusRef.current.focus();
			} else if (modalRef.current) {
				const focusable = modalRef.current.querySelector<HTMLElement>(
					'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
				);
				focusable?.focus();
			}
		}, 50);

		return () => {
			clearTimeout(timer);
			window.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("mousedown", handleMouseDown);
			// Trả focus về phần tử kích hoạt modal
			if (previousActiveElementRef.current) {
				previousActiveElementRef.current.focus?.();
			}
		};
	}, [isOpen, onClose, initialFocusRef]);

	if (!isOpen) return null;

	const modalContent = (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/45 dark:bg-black/60 animate-in fade-in duration-150"
			aria-hidden="false"
		>
			<div
				ref={modalRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				aria-describedby={description ? descId : undefined}
				className={`w-full ${SIZE_CLASSES[size]} max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 transition-colors animate-in zoom-in-95 duration-150 relative ${className}`}
			>
				{/* 1. Tiêu đề cố định */}
				<div className="px-5 py-4 sm:px-6 sm:py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-white dark:bg-slate-900">
					<div className="flex items-center gap-3 min-w-0">
						{Icon && (
							<div
								className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${iconClassName}`}
							>
								<Icon className="w-5 h-5" strokeWidth={1.5} />
							</div>
						)}
						<div className="min-w-0">
							<h2
								id={titleId}
								className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate"
							>
								{title}
							</h2>
							{description && (
								<p
									id={descId}
									className="text-xs text-slate-500 dark:text-slate-400 font-normal truncate mt-0.5"
								>
									{description}
								</p>
							)}
						</div>
					</div>

					<div className="flex items-center gap-2 shrink-0">
						{headerExtra}
						<button
							type="button"
							onClick={onClose}
							className="w-11 h-11 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
							aria-label="Đóng"
						>
							<X className="w-5 h-5" strokeWidth={1.5} />
						</button>
					</div>
				</div>

				{/* 2. Thân cuộn bên trong */}
				<div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 custom-scrollbar">
					{children}
				</div>

				{/* 3. Chân cố định nếu có */}
				{footer && (
					<div className="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 shrink-0">
						{footer}
					</div>
				)}
			</div>
		</div>
	);

	return createPortal(modalContent, document.body);
};
