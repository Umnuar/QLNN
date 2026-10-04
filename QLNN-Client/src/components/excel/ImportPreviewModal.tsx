import {
	AlertCircle,
	AlertTriangle,
	Check,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	FileDown,
	Filter,
	FolderOpen,
	RefreshCw,
	UploadCloud,
	X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CustomSelect } from "../common/CustomSelect";
import { formatVietnameseNumber } from "../common/statStyles";

export interface ImportPreviewModalProps {
	isOpen: boolean;
	onClose: () => void;
	file: File | null;
	parsedData: (string | number | undefined)[][];
	onConfirm: (file: File) => void;
	importing: boolean;
	onChangeFile?: () => void;
	onFileSelected?: (file: File, rows: (string | number | undefined)[][]) => void;
}

interface RowValidation {
	row: (string | number | undefined)[];
	index: number;
	status: "valid" | "warning" | "error";
	reason?: string;
}

export const COLUMNS_21 = [
	"1. STT",
	"2. Họ và Tên Chủ Hộ",
	"3. Cà phê (Hộ)",
	"4. Cà phê (Nhận k)",
	"5. Cao su (Hộ)",
	"6. Cao su (Nhận k)",
	"7. Cây ăn quả",
	"8. Macca",
	"9. Đinh lăng",
	"10. Gừng",
	"11. Nghệ",
	"12. Sả",
	"13. Lúa nước",
	"14. Cây HN khác",
	"15. Trâu (con)",
	"16. Bò (con)",
	"17. Heo (con)",
	"18. Gia cầm (con)",
	"19. Ao cá (ha)",
	"20. Lồng bè",
	"21. Ghi chú",
];

export const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
	isOpen,
	onClose,
	file: initialFile,
	parsedData: initialParsedData,
	onConfirm,
	importing,
	onChangeFile,
	onFileSelected,
}) => {
	const [activeStep, setActiveStep] = useState<"file" | "preview">(
		initialFile ? "preview" : "file",
	);
	const [currentFile, setCurrentFile] = useState<File | null>(initialFile);
	const [dataRows, setDataRows] = useState<(string | number | undefined)[][]>(
		initialParsedData,
	);
	const [isDragging, setIsDragging] = useState(false);
	const [fileError, setFileError] = useState<string | null>(null);
	const [isReading, setIsReading] = useState(false);
	const [onlyShowIssues, setOnlyShowIssues] = useState(false);

	const [importPage, setImportPage] = useState(1);
	const [importLimit, setImportLimit] = useState(20);

	const modalRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const titleId = useId();

	// Đồng bộ khi prop file / parsedData thay đổi từ ngoài
	useEffect(() => {
		if (initialFile) {
			setCurrentFile(initialFile);
			setDataRows(initialParsedData);
			setActiveStep("preview");
		} else {
			setCurrentFile(null);
			setDataRows([]);
			setActiveStep("file");
		}
	}, [initialFile, initialParsedData]);

	// Xử lý đọc file Excel / CSV
	const processFile = useCallback(
		async (selectedFile: File) => {
			setFileError(null);
			const fileName = selectedFile.name.toLowerCase();
			const isExcel =
				fileName.endsWith(".xlsx") ||
				fileName.endsWith(".xls") ||
				fileName.endsWith(".csv");

			if (!isExcel) {
				setFileError("Chỉ chấp nhận tệp định dạng .xlsx, .xls hoặc .csv");
				return;
			}

			if (selectedFile.size === 0) {
				setFileError("Tệp tin rỗng, vui lòng chọn tệp có dữ liệu.");
				return;
			}

			if (selectedFile.size > 10 * 1024 * 1024) {
				setFileError(
					"Dung lượng tệp vượt quá giới hạn 10 MB. Vui lòng chọn tệp nhỏ hơn.",
				);
				return;
			}

			try {
				setIsReading(true);
				const XLSX = await import("xlsx");
				const arrayBuffer = await selectedFile.arrayBuffer();
				const wb = XLSX.read(arrayBuffer, { type: "array" });

				if (!wb.SheetNames || wb.SheetNames.length === 0) {
					setFileError("Tệp không chứa bảng tính (sheet) nào hợp lệ.");
					setIsReading(false);
					return;
				}

				const ws = wb.Sheets[wb.SheetNames[0]];
				const rawData = XLSX.utils.sheet_to_json<
					(string | number | undefined)[]
				>(ws, { header: 1 });

				// Chuẩn hóa lấy dữ liệu từ dòng 10 trở đi (index 9) theo mẫu 21 cột Đăk Hà
				let parsed = rawData
					.slice(9)
					.filter(
						(row) =>
							row &&
							row[1] !== undefined &&
							row[1] !== null &&
							String(row[1]).trim() !== "",
					);

				// Fallback nếu người dùng nạp file không có 9 dòng tiêu đề mà có header ở dòng đầu
				if (parsed.length === 0 && rawData.length > 1) {
					parsed = rawData
						.slice(1)
						.filter(
							(row) =>
								row &&
								row[1] !== undefined &&
								row[1] !== null &&
								String(row[1]).trim() !== "",
						);
				}

				if (parsed.length === 0) {
					setFileError(
						"Không tìm thấy dòng dữ liệu hộ dân hợp lệ trong tệp (cột Họ và tên chủ hộ phải có giá trị).",
					);
					setIsReading(false);
					return;
				}

				setCurrentFile(selectedFile);
				setDataRows(parsed);
				setImportPage(1);
				setActiveStep("preview");

				if (onFileSelected) {
					onFileSelected(selectedFile, parsed);
				}
			} catch (err) {
				console.error("Lỗi khi đọc file Excel:", err);
				setFileError("Không thể đọc tệp dữ liệu. Vui lòng kiểm tra lại định dạng tệp.");
			} finally {
				setIsReading(false);
			}
		},
		[onFileSelected],
	);

	// Tải biểu mẫu chuẩn 21 cột
	const handleDownloadTemplate = useCallback(async () => {
		try {
			const XLSX = await import("xlsx");
			const templateHeaders = [
				"STT",
				"Họ và Tên Chủ Hộ",
				"Cà phê (Hộ)",
				"Cà phê (Nhận k)",
				"Cao su (Hộ)",
				"Cao su (Nhận k)",
				"Cây ăn quả",
				"Macca",
				"Đinh lăng",
				"Gừng",
				"Nghệ",
				"Sả",
				"Lúa nước",
				"Cây HN khác",
				"Trâu (con)",
				"Bò (con)",
				"Heo (con)",
				"Gia cầm (con)",
				"Ao cá (ha)",
				"Lồng bè",
				"Ghi chú",
			];

			const rows = [
				["UBND XÃ ĐĂK HÀ"],
				["BIỂU MẪU THỐNG KÊ 18 CHỈ TIÊU NÔNG NGHIỆP & NÔNG THÔN MỚI"],
				[],
				[],
				[],
				[],
				[],
				[],
				[],
				templateHeaders,
				[
					1,
					"A Đảo",
					1.5,
					0.5,
					2.0,
					0,
					0.8,
					1.2,
					0.3,
					0.2,
					0.1,
					0.4,
					1.0,
					0.6,
					5,
					10,
					20,
					150,
					0.75,
					2,
					"Hộ mẫu đạt chuẩn NTM",
				],
			];

			const ws = XLSX.utils.aoa_to_sheet(rows);
			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, "Nong_Nghiep");
			XLSX.writeFile(wb, "Bieu_mau_nhap_lieu_nong_nghiep_Dak_Ha.xlsx");
		} catch (err) {
			console.error("Lỗi tạo mẫu excel:", err);
		}
	}, []);

	// Kéo thả tệp
	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			const droppedFile = e.dataTransfer.files[0];
			processFile(droppedFile);
		}
	};

	// Chuyển sang bước chọn lại tệp khác
	const handleSwitchToFileStep = () => {
		if (onChangeFile) {
			onChangeFile();
		}
		setActiveStep("file");
		setFileError(null);
	};

	// Đánh giá dữ liệu từng dòng (Validation & Status Chips)
	const validatedRows: RowValidation[] = useMemo(() => {
		return dataRows.map((row, idx) => {
			const fullName = row[1];
			if (!fullName || String(fullName).trim() === "") {
				return {
					row,
					index: idx,
					status: "error",
					reason: "Thiếu họ và tên chủ hộ",
				};
			}

			// Kiểm tra chỉ tiêu âm
			const hasNegative = row.slice(2, 20).some((val) => {
				const num = Number(val);
				return !Number.isNaN(num) && num < 0;
			});
			if (hasNegative) {
				return {
					row,
					index: idx,
					status: "error",
					reason: "Có chỉ tiêu số lượng diện tích/vật nuôi mang giá trị âm",
				};
			}

			// Kiểm tra cảnh báo: tất cả 18 chỉ tiêu đều bằng 0 hoặc rỗng
			const allZero = row.slice(2, 20).every((val) => {
				const num = Number(val);
				return Number.isNaN(num) || num === 0 || val === "" || val === undefined;
			});
			if (allZero) {
				return {
					row,
					index: idx,
					status: "warning",
					reason: "Hộ chưa kê khai chỉ số cây trồng, vật nuôi hay thủy sản",
				};
			}

			return {
				row,
				index: idx,
				status: "valid",
			};
		});
	}, [dataRows]);

	const validCount = useMemo(
		() => validatedRows.filter((r) => r.status === "valid").length,
		[validatedRows],
	);
	const warningCount = useMemo(
		() => validatedRows.filter((r) => r.status === "warning").length,
		[validatedRows],
	);
	const errorCount = useMemo(
		() => validatedRows.filter((r) => r.status === "error").length,
		[validatedRows],
	);

	// Dữ liệu hiển thị lọc và phân trang
	const filteredRows = useMemo(() => {
		if (!onlyShowIssues) return validatedRows;
		return validatedRows.filter((r) => r.status === "warning" || r.status === "error");
	}, [validatedRows, onlyShowIssues]);

	const maxPage = Math.ceil(filteredRows.length / importLimit) || 1;
	const displayRows = useMemo(() => {
		const start = (importPage - 1) * importLimit;
		return filteredRows.slice(start, start + importLimit);
	}, [filteredRows, importPage, importLimit]);

	// Keyboard Navigation & Focus Trap (WCAG 2.1 AA)
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
				const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
					'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
				);
				const focusable = Array.from(focusableElements).filter(
					(el) =>
						!el.hasAttribute("disabled") &&
						el.getAttribute("aria-hidden") !== "true" &&
						el.offsetParent !== null,
				);

				if (focusable.length === 0) return;

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
				if (activeStep === "file") {
					onClose();
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		document.addEventListener("mousedown", handleMouseDown);
		return () => {
			clearTimeout(timer);
			window.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("mousedown", handleMouseDown);
		};
	}, [isOpen, onClose, activeStep]);

	if (!isOpen) return null;

	const formatCell = (val: unknown) => {
		if (val === undefined || val === null || val === "") return "—";
		const num = Number(val);
		if (!Number.isNaN(num)) {
			if (num === 0) return "—";
			return formatVietnameseNumber(num);
		}
		return String(val);
	};

	return createPortal(
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[rgba(15,23,42,0.45)] dark:bg-[rgba(0,0,0,0.6)] animate-in fade-in duration-150 select-none"
			aria-hidden="false"
			onClick={(e) => {
				if (e.target === e.currentTarget && activeStep === "file") {
					onClose();
				}
			}}
		>
			<div
				ref={modalRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				onClick={(e) => e.stopPropagation()}
				className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 transition-[max-width,width] duration-150 motion-reduce:transition-none select-text ${
					activeStep === "preview"
						? "max-w-[1240px] w-[92vw]"
						: "max-w-[670px] w-full"
				}`}
			>
				{/* 1. Tiêu đề cố định */}
				<div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
					<div className="flex items-center gap-3 min-w-0">
						<div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
							<UploadCloud className="w-5 h-5" strokeWidth={1.5} />
						</div>
						<div className="min-w-0">
							<h2
								id={titleId}
								className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate"
							>
								{activeStep === "file"
									? "Nhập dữ liệu Excel — Hộ nông nghiệp"
									: "Xem trước dữ liệu"}
							</h2>
							<p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
								{activeStep === "file"
									? "Chọn tệp Excel để bắt đầu đối soát dữ liệu"
									: currentFile
										? `Tệp: ${currentFile.name} • ${formatVietnameseNumber(dataRows.length)} dòng dữ liệu`
										: `Tổng cộng ${formatVietnameseNumber(dataRows.length)} dòng dữ liệu`}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2 shrink-0 ml-3">
						{activeStep === "preview" && (
							<button
								type="button"
								onClick={handleSwitchToFileStep}
								className="min-h-[44px] px-3.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
								title="Quay lại bước chọn tệp khác"
							>
								<RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
								<span>Đổi tệp khác</span>
							</button>
						)}
						<button
							type="button"
							onClick={onClose}
							aria-label="Đóng modal"
							title="Đóng (Escape)"
							className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
						>
							<X className="w-5 h-5" strokeWidth={1.5} />
						</button>
					</div>
				</div>

				{/* 2. Thanh bước thống nhất (Stepper) */}
				<div className="px-6 py-2.5 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 sm:gap-6 text-xs shrink-0 select-none">
					{[
						{ num: 1, label: "Chọn tệp" },
						{ num: 2, label: "Xem trước" },
					].map((st, idx, arr) => {
						const currentStepNum = activeStep === "preview" ? 2 : 1;
						const isCompleted = currentStepNum > st.num;
						const isActive = currentStepNum === st.num;
						return (
							<div key={st.num} className="flex items-center gap-2 sm:gap-4">
								<button
									type="button"
									onClick={() => {
										if (st.num === 1 && activeStep === "preview") {
											setActiveStep("file");
										}
									}}
									disabled={st.num === 2 && (!currentFile || dataRows.length === 0)}
									className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
										isActive
											? "bg-emerald-600 text-white shadow-xs"
											: isCompleted
												? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-pointer"
												: "text-slate-700 dark:text-slate-200 bg-slate-200/90 dark:bg-slate-800 font-semibold cursor-not-allowed"
									}`}
								>
									{isCompleted ? (
										<Check className="w-3.5 h-3.5" strokeWidth={2.5} />
									) : (
										<span className="w-4 text-center">{st.num}</span>
									)}
									<span>{st.label}</span>
								</button>
								{idx < arr.length - 1 && (
									<ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
								)}
							</div>
						);
					})}
				</div>

				{/* 3. Nội dung thân modal */}
				<div className="flex-1 overflow-y-auto flex flex-col custom-scrollbar">
					{/* BƯỚC 1: CHỌN TỆP EXCEL */}
					{activeStep === "file" && (
						<div className="p-6 sm:p-10 flex flex-col items-center justify-center flex-1 space-y-4">
							<input
								ref={fileInputRef}
								type="file"
								accept=".xlsx,.xls,.csv"
								className="hidden"
								onChange={(e) => {
									if (e.target.files && e.target.files.length > 0) {
										processFile(e.target.files[0]);
										e.target.value = "";
									}
								}}
							/>

							{fileError && (
								<div className="w-full max-w-xl p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
									<AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
									<span>{fileError}</span>
								</div>
							)}

							<div
								onDragOver={handleDragOver}
								onDragLeave={handleDragLeave}
								onDrop={handleDrop}
								onClick={() => fileInputRef.current?.click()}
								className={`w-full max-w-xl p-8 sm:p-10 border-2 border-dashed rounded-3xl transition-all cursor-pointer text-center flex flex-col items-center justify-center space-y-4 ${
									isDragging
										? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20"
										: "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-slate-800/40"
								}`}
							>
								<div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1">
									{isReading ? (
										<div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
									) : (
										<UploadCloud className="w-7 h-7" strokeWidth={1.5} />
									)}
								</div>

								<div>
									<h3 className="text-base font-bold text-slate-900 dark:text-white">
										{isReading
											? "Đang đọc dữ liệu tệp Excel..."
											: "Kéo thả tệp Excel vào đây hoặc bấm để chọn"}
									</h3>
									<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
										{isReading ? (
											"Vui lòng đợi trong giây lát"
										) : (
											<>
												Định dạng hỗ trợ:{" "}
												<strong className="text-emerald-600 dark:text-emerald-400">
													.xlsx, .xls, .csv
												</strong>{" "}
												(tối đa 10 MB)
											</>
										)}
									</p>
								</div>

								<div
									className="flex items-center gap-3 pt-2"
									onClick={(e) => e.stopPropagation()}
								>
									<button
										type="button"
										onClick={() => fileInputRef.current?.click()}
										className="min-h-[44px] px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
									>
										<FolderOpen className="w-4 h-4" strokeWidth={1.5} />
										<span>Chọn tệp Excel</span>
									</button>

									<button
										type="button"
										onClick={handleDownloadTemplate}
										className="min-h-[44px] px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
									>
										<FileDown
											className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
											strokeWidth={1.5}
										/>
										<span>Tải biểu mẫu chuẩn (.xlsx)</span>
									</button>
								</div>
							</div>
						</div>
					)}

					{/* BƯỚC 2: XEM TRƯỚC DỮ LIỆU BẢNG 21 CỘT */}
					{activeStep === "preview" && (
						<div className="flex-1 flex flex-col min-h-0 p-4 sm:p-6">
							{/* Dải trạng thái kiểm tra dữ liệu */}
							<div className="pb-3 flex items-center justify-between gap-3 flex-wrap shrink-0">
								<div className="flex items-center gap-2 flex-wrap">
									{/* Chip Hợp lệ */}
									<div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-2xs">
										<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
										<span>Hợp lệ: {validCount}</span>
									</div>

									{/* Chip Cảnh báo nếu > 0 */}
									{warningCount > 0 && (
										<div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold shadow-2xs">
											<AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
											<span>Cảnh báo: {warningCount}</span>
										</div>
									)}

									{/* Chip Lỗi nếu > 0 */}
									{errorCount > 0 && (
										<div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold shadow-2xs">
											<AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
											<span>Lỗi: {errorCount}</span>
										</div>
									)}
								</div>

								{/* Nút lọc chỉ dòng sự cố */}
								{(warningCount > 0 || errorCount > 0) && (
									<button
										type="button"
										onClick={() => {
											setOnlyShowIssues((prev) => !prev);
											setImportPage(1);
										}}
										className={`h-7 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
											onlyShowIssues
												? "bg-amber-500 text-white border-amber-600"
												: "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
										}`}
									>
										<Filter className="w-3 h-3" />
										<span>{onlyShowIssues ? "Hiện tất cả" : "Chỉ lỗi/cảnh báo"}</span>
									</button>
								)}
							</div>
							<div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
								<table className="w-full min-w-[2100px] text-left border-collapse text-xs whitespace-nowrap">
									<thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider sticky top-0 z-30">
										<tr>
											<th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-center sticky left-0 z-30 bg-slate-100 dark:bg-slate-950 w-14">
												<span className="text-slate-400 font-normal">1.</span> STT
											</th>
											<th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 sticky left-14 z-30 bg-slate-100 dark:bg-slate-950 min-w-[200px] border-r-2 border-slate-300 dark:border-slate-700 shadow-xs">
												<span className="text-slate-400 font-normal">2.</span> Họ và
												Tên Chủ Hộ
											</th>
											<th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-right">
												<span className="text-slate-400 font-normal">3.</span> Cà phê
												(Hộ)
											</th>
											<th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-right">
												<span className="text-slate-400 font-normal">4.</span> Cà phê
												(Nhận k)
											</th>
											<th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-right">
												<span className="text-slate-400 font-normal">5.</span> Cao su
												(Hộ)
											</th>
											<th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-right">
												<span className="text-slate-400 font-normal">6.</span> Cao su
												(Nhận k)
											</th>
											<th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-right">
												<span className="text-slate-400 font-normal">7.</span> Cây ăn
												quả
											</th>
											<th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-right">
												<span className="text-slate-400 font-normal">8.</span> Macca
											</th>
											<th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-right">
												<span className="text-slate-400 font-normal">9.</span> Đinh
												lăng
											</th>
											<th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-right">
												<span className="text-slate-400 font-normal">10.</span> Gừng
											</th>
											<th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-right">
												<span className="text-slate-400 font-normal">11.</span> Nghệ
											</th>
											<th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-right">
												<span className="text-slate-400 font-normal">12.</span> Sả
											</th>
											<th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-right">
												<span className="text-slate-400 font-normal">13.</span> Lúa
												nước
											</th>
											<th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-right">
												<span className="text-slate-400 font-normal">14.</span> Cây
												HN khác
											</th>
											<th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-right">
												<span className="text-slate-400 font-normal">15.</span> Trâu
												(con)
											</th>
											<th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-right">
												<span className="text-slate-400 font-normal">16.</span> Bò
												(con)
											</th>
											<th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-right">
												<span className="text-slate-400 font-normal">17.</span> Heo
												(con)
											</th>
											<th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-right">
												<span className="text-slate-400 font-normal">18.</span> Gia
												cầm (con)
											</th>
											<th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-right">
												<span className="text-slate-400 font-normal">19.</span> Ao cá
												(ha)
											</th>
											<th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-right">
												<span className="text-slate-400 font-normal">20.</span> Lồng
												bè
											</th>
											<th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800">
												<span className="text-slate-400 font-normal">21.</span> Ghi
												chú
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
										{displayRows.map(({ row, index, status, reason }) => (
											<tr
												key={`preview-row-${row[0] ?? ""}-${row[1] ?? ""}-${index}`}
												className={`transition-colors ${
													status === "error"
														? "bg-rose-50/60 dark:bg-rose-950/30 hover:bg-rose-50 dark:hover:bg-rose-950/50"
														: status === "warning"
															? "bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/40"
															: "hover:bg-slate-50 dark:hover:bg-slate-800/60"
												}`}
											>
												<td
													className="py-2 px-3 text-center sticky left-0 z-20 bg-white dark:bg-slate-900 w-14 font-mono text-slate-500"
													title={reason}
												>
													<div className="flex items-center justify-center gap-1">
														{status === "error" && (
															<AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
														)}
														{status === "warning" && (
															<AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
														)}
														<span>{row[0] || index + 1}</span>
													</div>
												</td>
												<td
													className="py-2 px-3 sticky left-14 z-20 bg-white dark:bg-slate-900 min-w-[200px] font-bold text-slate-800 dark:text-slate-200 border-r-2 border-slate-300 dark:border-slate-700 shadow-xs"
													title={reason}
												>
													<div className="flex items-center justify-between gap-1">
														<span>{row[1]}</span>
														{reason && (
															<span className="text-[10px] font-normal text-amber-600 dark:text-amber-400 italic">
																{reason}
															</span>
														)}
													</div>
												</td>
												<td className="py-2 px-3 text-right tabular-nums">
													{formatCell(row[2])}
												</td>
												<td className="py-2 px-3 text-right tabular-nums">
													{formatCell(row[3])}
												</td>
												<td className="py-2 px-3 text-right tabular-nums">
													{formatCell(row[4])}
												</td>
												<td className="py-2 px-3 text-right tabular-nums">
													{formatCell(row[5])}
												</td>
												<td className="py-2 px-3 text-right tabular-nums">
													{formatCell(row[6])}
												</td>
												<td className="py-2 px-3 text-right tabular-nums">
													{formatCell(row[7])}
												</td>
												<td className="py-2 px-3 text-right tabular-nums">
													{formatCell(row[8])}
												</td>
												<td className="py-2 px-3 text-right tabular-nums">
													{formatCell(row[9])}
												</td>
												<td className="py-2 px-3 text-right tabular-nums">
													{formatCell(row[10])}
												</td>
												<td className="py-2 px-3 text-right tabular-nums">
													{formatCell(row[11])}
												</td>
												<td className="py-2 px-3 text-right tabular-nums">
													{formatCell(row[12])}
												</td>
												<td className="py-2 px-3 text-right tabular-nums">
													{formatCell(row[13])}
												</td>
												<td className="py-2 px-3 text-right tabular-nums">
													{formatCell(row[14])}
												</td>
												<td className="py-2 px-3 text-right tabular-nums">
													{formatCell(row[15])}
												</td>
												<td className="py-2 px-3 text-right tabular-nums">
													{formatCell(row[16])}
												</td>
												<td className="py-2 px-3 text-right tabular-nums">
													{formatCell(row[17])}
												</td>
												<td className="py-2 px-3 text-right tabular-nums">
													{formatCell(row[18])}
												</td>
												<td className="py-2 px-3 text-right tabular-nums">
													{formatCell(row[19])}
												</td>
												<td className="py-2 px-3 text-slate-500">
													{row[20] || "—"}
												</td>
											</tr>
										))}
										{displayRows.length === 0 && (
											<tr>
												<td
													colSpan={21}
													className="py-8 text-center text-slate-500"
												>
													Không tìm thấy dữ liệu hợp lệ trong file
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</div>

				{/* 4. Chân modal cố định (chỉ hiển thị khi activeStep === 'preview') */}
				{activeStep === "preview" && (
					<div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 shrink-0 flex items-center justify-between gap-4 text-xs whitespace-nowrap">
						{/* Trái: Hiển thị [20 v] / N bản ghi */}
						<div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 shrink-0">
							<span>Hiển thị</span>
							<CustomSelect
								size="sm"
								value={importLimit}
								onChange={(val) => {
									setImportLimit(Number(val));
									setImportPage(1);
								}}
								options={[
									{ value: 20, label: "20" },
									{ value: 50, label: "50" },
									{ value: 100, label: "100" },
								]}
								className="w-20"
							/>
							<span>/ {filteredRows.length} bản ghi</span>
						</div>

						{/* Giữa: Phân trang Trước / Sau */}
						<div className="flex items-center gap-1.5 shrink-0">
							<button
								type="button"
								disabled={importPage === 1}
								onClick={() => setImportPage((p) => Math.max(1, p - 1))}
								aria-label="Trang trước"
								className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95 text-xs font-bold flex items-center gap-1"
							>
								<ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
								<span>Trước</span>
							</button>
							<span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 tabular-nums">
								{importPage} / {maxPage}
							</span>
							<button
								type="button"
								disabled={importPage >= maxPage}
								onClick={() => setImportPage((p) => p + 1)}
								aria-label="Trang sau"
								className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95 text-xs font-bold flex items-center gap-1"
							>
								<span>Sau</span>
								<ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
							</button>
						</div>

						{/* Phải: Nút Hủy và Nút Xác nhận nhập */}
						<div className="flex items-center gap-2.5 shrink-0">
							<button
								type="button"
								onClick={onClose}
								aria-label="Hủy"
								className="h-10 px-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
							>
								Hủy
							</button>
							<button
								type="button"
								onClick={() => currentFile && onConfirm(currentFile)}
								disabled={importing || validCount === 0 || !currentFile}
								title={
									validCount === 0
										? "Không có dòng dữ liệu hợp lệ để nhập vào hệ thống"
										: undefined
								}
								className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
							>
								{importing ? (
									<>
										<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
										<span>Đang xử lý...</span>
									</>
								) : (
									<span>Xác nhận nhập ({validCount} hợp lệ)</span>
								)}
							</button>
						</div>
					</div>
				)}
			</div>
		</div>,
		document.body,
	);
};
