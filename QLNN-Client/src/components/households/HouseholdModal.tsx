import {
	AlertCircle,
	Check,
	Fish,
	Flower2,
	PawPrint,
	Plus,
	RefreshCw,
	Trees,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useApp } from "../../AppContext";
import { householdApi } from "../../api/householdApi";
import { useModal } from "../../hooks/useModal";
import type { HouseholdFlat } from "../../types";
import { cryptoHelper } from "../../utils/cryptoHelper";
import { CustomSelect } from "../common/CustomSelect";

const inputClasses =
	"w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all outline-hidden bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-800/80 dark:border-slate-700/60 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-800 dark:focus:border-emerald-500 dark:focus:ring-2 dark:focus:ring-emerald-500/20";

interface HouseholdModalProps {
	isOpen: boolean;
	onClose: () => void;
	household: HouseholdFlat | null;
	onSuccess: () => void;
}

type TabType = "crops" | "livestock" | "aquaculture";

const INITIAL_FORM_DATA = {
	villageId: "",
	fullName: "",
	phone: "",
	address: "",
	notes: "",
	cafeHousehold: "0",
	cafeContracted: "0",
	rubberHousehold: "0",
	rubberContracted: "0",
	fruitTree: "0",
	macadamia: "0",
	herbDinhLang: "0",
	herbGung: "0",
	herbNghe: "0",
	herbSa: "0",
	wetRice: "0",
	otherAnnualCrops: "0",
	buffalo: "0",
	cow: "0",
	pig: "0",
	poultry: "0",
	fishPond: "0",
	fishCage: "0",
};

export const HouseholdModal: React.FC<HouseholdModalProps> = ({
	isOpen,
	onClose,
	household,
	onSuccess,
}) => {
	const { user, villages, selectedVillageId } = useApp();
	const { showModal } = useModal();

	const [activeTab, setActiveTab] = useState<TabType>("crops");
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) return;

		const timer = setTimeout(() => {
			if (modalRef.current) {
				const firstInput = modalRef.current.querySelector<HTMLElement>(
					"input:not([disabled]), button:not([disabled])",
				);
				firstInput?.focus();
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

	const [formData, setFormData] = useState(INITIAL_FORM_DATA);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [isOccConflict, setIsOccConflict] = useState<boolean>(false);
	const [currentVersion, setCurrentVersion] = useState<
		number | undefined | null
	>(household?.version);

	const handleChange =
		(field: keyof typeof INITIAL_FORM_DATA) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			setFormData((prev) => ({ ...prev, [field]: e.target.value }));
		};

	useEffect(() => {
		if (isOpen) {
			setIsOccConflict(false);
			setCurrentVersion(household?.version);
			if (household) {
				setFormData({
					villageId: household.village_id || "",
					fullName: household.full_name || "",
					phone: household.phone || "",
					address: household.address || "",
					notes: household.notes || "",
					cafeHousehold: String(household.cafe_household ?? 0),
					cafeContracted: String(household.cafe_contracted ?? 0),
					rubberHousehold: String(household.rubber_household ?? 0),
					rubberContracted: String(household.rubber_contracted ?? 0),
					fruitTree: String(household.fruit_tree ?? 0),
					macadamia: String(household.macadamia ?? 0),
					herbDinhLang: String(household.herb_dinh_lang ?? 0),
					herbGung: String(household.herb_gung ?? 0),
					herbNghe: String(household.herb_nghe ?? 0),
					herbSa: String(household.herb_sa ?? 0),
					wetRice: String(household.wet_rice ?? 0),
					otherAnnualCrops: String(household.other_annual_crops ?? 0),
					buffalo: String(household.buffalo ?? 0),
					cow: String(household.cow ?? 0),
					pig: String(household.pig ?? 0),
					poultry: String(household.poultry ?? 0),
					fishPond: String(household.fish_pond ?? 0),
					fishCage: String(household.fish_cage ?? 0),
				});
			} else {
				setFormData({
					...INITIAL_FORM_DATA,
					villageId:
						user?.role === "user" && user.village_id
							? user.village_id
							: selectedVillageId || villages[0]?.id || "",
				});
			}
			setActiveTab("crops");
			setError(null);
		}
	}, [isOpen, household, user, villages, selectedVillageId]);

	// Live Subtotal Calculations
	const totalCropsArea = useMemo(() => {
		return (
			(parseFloat(formData.cafeHousehold) || 0) +
			(parseFloat(formData.cafeContracted) || 0) +
			(parseFloat(formData.rubberHousehold) || 0) +
			(parseFloat(formData.rubberContracted) || 0) +
			(parseFloat(formData.fruitTree) || 0) +
			(parseFloat(formData.macadamia) || 0) +
			(parseFloat(formData.herbDinhLang) || 0) +
			(parseFloat(formData.herbGung) || 0) +
			(parseFloat(formData.herbNghe) || 0) +
			(parseFloat(formData.herbSa) || 0) +
			(parseFloat(formData.wetRice) || 0) +
			(parseFloat(formData.otherAnnualCrops) || 0)
		);
	}, [
		formData.cafeHousehold,
		formData.cafeContracted,
		formData.rubberHousehold,
		formData.rubberContracted,
		formData.fruitTree,
		formData.macadamia,
		formData.herbDinhLang,
		formData.herbGung,
		formData.herbNghe,
		formData.herbSa,
		formData.wetRice,
		formData.otherAnnualCrops,
	]);

	const totalAnimalsCount = useMemo(() => {
		return (
			(parseInt(formData.buffalo, 10) || 0) +
			(parseInt(formData.cow, 10) || 0) +
			(parseInt(formData.pig, 10) || 0) +
			(parseInt(formData.poultry, 10) || 0)
		);
	}, [formData.buffalo, formData.cow, formData.pig, formData.poultry]);

	const currentVillageName = useMemo(() => {
		return villages.find((v) => v.id === formData.villageId)?.name;
	}, [villages, formData.villageId]);

	const handleReloadLatest = async () => {
		if (!household?.id) return;
		try {
			setLoading(true);
			const latest = await householdApi.getHouseholdById(household.id);
			if (latest) {
				setFormData({
					villageId: latest.village_id || "",
					fullName: latest.full_name || "",
					phone: latest.phone || "",
					address: latest.address || "",
					notes: latest.notes || "",
					cafeHousehold: String(latest.cafe_household ?? 0),
					cafeContracted: String(latest.cafe_contracted ?? 0),
					rubberHousehold: String(latest.rubber_household ?? 0),
					rubberContracted: String(latest.rubber_contracted ?? 0),
					fruitTree: String(latest.fruit_tree ?? 0),
					macadamia: String(latest.macadamia ?? 0),
					herbDinhLang: String(latest.herb_dinh_lang ?? 0),
					herbGung: String(latest.herb_gung ?? 0),
					herbNghe: String(latest.herb_nghe ?? 0),
					herbSa: String(latest.herb_sa ?? 0),
					wetRice: String(latest.wet_rice ?? 0),
					otherAnnualCrops: String(latest.other_annual_crops ?? 0),
					buffalo: String(latest.buffalo ?? 0),
					cow: String(latest.cow ?? 0),
					pig: String(latest.pig ?? 0),
					poultry: String(latest.poultry ?? 0),
					fishPond: String(latest.fish_pond ?? 0),
					fishCage: String(latest.fish_cage ?? 0),
				});
				setCurrentVersion(latest.version);
				if (household) {
					household.version = latest.version;
				}
			}
			setIsOccConflict(false);
			setError(null);
		} catch (err: unknown) {
			const errorObj = err as { response?: { data?: { error?: string } } };
			console.error("Reload latest household error:", err);
			setError(
				errorObj.response?.data?.error || "Không thể tải lại dữ liệu mới nhất.",
			);
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen || typeof document === "undefined") return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.fullName.trim()) {
			setError("Vui lòng nhập họ và tên chủ hộ.");
			return;
		}
		if (!formData.villageId) {
			setError("Vui lòng chọn thôn quản lý.");
			return;
		}

		setLoading(true);
		setError(null);

		const payload: Record<string, unknown> = {
			...(user?.role === "admin" ? { village_id: formData.villageId } : {}),
			full_name: formData.fullName.trim(),
			phone: formData.phone.trim() || undefined,
			address: formData.address.trim() || undefined,
			notes: formData.notes.trim() || undefined,
			version: currentVersion ?? household?.version,
			crops: {
				cafe_household: parseFloat(formData.cafeHousehold) || 0,
				cafe_contracted: parseFloat(formData.cafeContracted) || 0,
				rubber_household: parseFloat(formData.rubberHousehold) || 0,
				rubber_contracted: parseFloat(formData.rubberContracted) || 0,
				fruit_tree: parseFloat(formData.fruitTree) || 0,
				macadamia: parseFloat(formData.macadamia) || 0,
				herb_dinh_lang: parseFloat(formData.herbDinhLang) || 0,
				herb_gung: parseFloat(formData.herbGung) || 0,
				herb_nghe: parseFloat(formData.herbNghe) || 0,
				herb_sa: parseFloat(formData.herbSa) || 0,
				wet_rice: parseFloat(formData.wetRice) || 0,
				other_annual_crops: parseFloat(formData.otherAnnualCrops) || 0,
			},
			livestock: {
				buffalo: parseInt(formData.buffalo, 10) || 0,
				cow: parseInt(formData.cow, 10) || 0,
				pig: parseInt(formData.pig, 10) || 0,
				poultry: parseInt(formData.poultry, 10) || 0,
			},
			aquaculture: {
				fish_pond: parseFloat(formData.fishPond) || 0,
				fish_cage: parseInt(formData.fishCage, 10) || 0,
			},
		};

		try {
			if (household?.id) {
				await householdApi.update(
					household.id,
					payload as unknown as Partial<HouseholdFlat>,
				);
			} else {
				await householdApi.create(payload as unknown as HouseholdFlat);
			}
			onSuccess();
			onClose();
		} catch (err: unknown) {
			const errorObj = err as {
				response?: {
					status?: number;
					data?: {
						error?: string;
						code?: string;
						duplicate?: boolean;
						existing_household_id?: string;
					};
				};
			};
			console.error("Save household error:", err);
			// Smart Duplicate Detection Handling
			if (
				errorObj.response?.status === 409 &&
				(errorObj.response?.data?.code === "DUPLICATE_NAME" ||
					errorObj.response?.data?.duplicate)
			) {
				const existingId = errorObj.response?.data?.existing_household_id;
				showModal({
					title: "Phát Hiện Trùng Tên Hộ",
					message: `Hộ "${formData.fullName.trim()}" đã tồn tại trong thôn. Bạn có muốn cập nhật đè số liệu mới này vào hồ sơ hộ đã có không?`,
					type: "warning",
					confirmText: "Đồng Ý Cập Nhật",
					cancelText: "Hủy Bỏ",
					onConfirm: async () => {
						if (!existingId) {
							setError("Không tìm thấy mã hộ cần cập nhật.");
							return;
						}
						try {
							setLoading(true);
							await householdApi.update(
								existingId,
								payload as unknown as Partial<HouseholdFlat>,
							);
							onSuccess();
							onClose();
						} catch (uErr: unknown) {
							const updateError = uErr as {
								response?: { data?: { error?: string } };
							};
							console.error("Update duplicate error:", uErr);
							setError(
								updateError.response?.data?.error ||
									"Không thể cập nhật hộ trùng tên.",
							);
						} finally {
							setLoading(false);
						}
					},
				});
				setLoading(false);
				return;
			}
			// Optimistic Concurrency Control (OCC 409) Handling
			if (errorObj.response?.status === 409) {
				setIsOccConflict(true);
				setError(
					errorObj.response?.data?.error ||
						"Dữ liệu đã bị thay đổi bởi người khác. Vui lòng tải lại dữ liệu mới nhất.",
				);
				setLoading(false);
				return;
			}
			const msg =
				errorObj.response?.data?.error ||
				"Có lỗi xảy ra khi lưu thông tin hộ nông nghiệp.";
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	return createPortal(
		<div className="fixed inset-0 !m-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/45 dark:bg-black/60 select-none animate-in fade-in duration-150">
			<div
				ref={modalRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby="household-modal-title"
				className="w-full max-w-3xl max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 transition-colors animate-in zoom-in-95 duration-150 relative"
			>
				{/* Top Bar cố định: Icon Trồng trọt/Chăn nuôi/Thủy sản, Tiêu đề Thêm/Sửa Hộ, Tên chủ hộ, Badge Thôn, Tab switch (Trồng trọt / Chăn nuôi / Thủy sản), nút đóng X */}
				<div className="bg-slate-900 border-b border-slate-800 px-6 pt-5 pb-4 text-white shrink-0 space-y-4">
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-3.5 min-w-0">
							<div
								className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
									activeTab === "crops"
										? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
										: activeTab === "livestock"
											? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
											: "bg-sky-500/10 border border-sky-500/20 text-sky-400"
								}`}
							>
								{activeTab === "crops" && (
									<Trees
										className="w-5 h-5"
										strokeWidth={1.5}
										aria-hidden="true"
									/>
								)}
								{activeTab === "livestock" && (
									<PawPrint
										className="w-5 h-5"
										strokeWidth={1.5}
										aria-hidden="true"
									/>
								)}
								{activeTab === "aquaculture" && (
									<Fish
										className="w-5 h-5"
										strokeWidth={1.5}
										aria-hidden="true"
									/>
								)}
							</div>
							<div className="min-w-0">
								<div className="flex items-center gap-2 flex-wrap">
									<h3
										id="household-modal-title"
										className="font-black text-base tracking-tight text-white"
									>
										{household
											? "Chỉnh Sửa Số Liệu Hộ Nông Nghiệp"
											: "Thêm Mới Hộ Nông Nghiệp"}
									</h3>
									{household?.full_name && (
										<span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold truncate max-w-[160px]">
											{household.full_name}
										</span>
									)}
									{currentVillageName && (
										<span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
											{currentVillageName}
										</span>
									)}
								</div>
								<p className="text-xs text-slate-400 font-medium truncate mt-0.5">
									Kê khai 18 chỉ số diện tích cây trồng, đàn vật nuôi và mặt
									nước thủy sản
								</p>
							</div>
						</div>
						<button
							type="button"
							onClick={onClose}
							aria-label="Đóng cửa sổ"
							className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
						>
							<X className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
						</button>
					</div>

					{/* Tab switch (Trồng trọt / Chăn nuôi / Thủy sản) */}
					<div
						role="tablist"
						aria-label="Nhóm chỉ tiêu nông nghiệp"
						className="flex bg-slate-950/80 p-1.5 rounded-2xl gap-1.5 border border-slate-800"
					>
						<button
							type="button"
							role="tab"
							aria-selected={activeTab === "crops"}
							onClick={() => setActiveTab("crops")}
							className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
								activeTab === "crops"
									? "bg-emerald-600 text-white shadow-xs"
									: "text-slate-400 hover:text-white hover:bg-slate-800/70"
							}`}
						>
							<Trees
								className="w-4 h-4 shrink-0"
								strokeWidth={1.5}
								aria-hidden="true"
							/>
							<span className="truncate">1. Cây Trồng (12 Chỉ Số)</span>
						</button>

						<button
							type="button"
							role="tab"
							aria-selected={activeTab === "livestock"}
							onClick={() => setActiveTab("livestock")}
							className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
								activeTab === "livestock"
									? "bg-amber-600 text-white shadow-xs"
									: "text-slate-400 hover:text-white hover:bg-slate-800/70"
							}`}
						>
							<PawPrint
								className="w-4 h-4 shrink-0"
								strokeWidth={1.5}
								aria-hidden="true"
							/>
							<span className="truncate">2. Vật Nuôi (4 Chỉ Số)</span>
						</button>

						<button
							type="button"
							role="tab"
							aria-selected={activeTab === "aquaculture"}
							onClick={() => setActiveTab("aquaculture")}
							className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
								activeTab === "aquaculture"
									? "bg-sky-600 text-white shadow-xs"
									: "text-slate-400 hover:text-white hover:bg-slate-800/70"
							}`}
						>
							<Fish
								className="w-4 h-4 shrink-0"
								strokeWidth={1.5}
								aria-hidden="true"
							/>
							<span className="truncate">3. Thủy Sản (2 Chỉ Số)</span>
						</button>
					</div>
				</div>

				{/* Form Container */}
				<form
					onSubmit={handleSubmit}
					className="flex-1 flex flex-col min-h-0 overflow-hidden"
				>
					{/* Body cuộn độc lập: flex-1 overflow-y-auto p-6 space-y-6 */}
					<div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
						{/* OCC Conflict Banner */}
						{isOccConflict && (
							<div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-300 text-xs">
								<div className="flex items-start gap-2.5">
									<AlertCircle
										className="w-5 h-5 shrink-0 text-amber-400 mt-0.5"
										strokeWidth={1.5}
									/>
									<div>
										<p className="font-bold text-amber-200 text-sm">
											Cảnh báo xung đột phiên bản dữ liệu (OCC 409)
										</p>
										<p className="text-amber-300/90 mt-0.5">
											{error ||
												"Hồ sơ này đã được cập nhật bởi người khác. Vui lòng tải lại dữ liệu mới nhất từ máy chủ."}
										</p>
									</div>
								</div>
								<button
									type="button"
									onClick={handleReloadLatest}
									disabled={loading}
									className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 rounded-xl font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
								>
									<RefreshCw
										className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
										strokeWidth={1.5}
									/>
									<span>Tải Lại Dữ Liệu Mới Nhất</span>
								</button>
							</div>
						)}

						{!isOccConflict && error && (
							<div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-2xl flex items-start gap-2.5 text-rose-300 text-xs leading-relaxed">
								<AlertCircle
									className="w-4 h-4 shrink-0 mt-0.5 text-rose-400"
									strokeWidth={1.5}
								/>
								<span>{error}</span>
							</div>
						)}

						{/* General Information Box */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950 p-4.5 rounded-2xl border border-slate-200/90 dark:border-slate-800">
							<div className="md:col-span-2">
								<label
									htmlFor="household-full-name"
									className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
								>
									Họ và tên chủ hộ <span className="text-rose-500">*</span>
								</label>
								<input
									id="household-full-name"
									type="text"
									value={formData.fullName}
									onChange={handleChange("fullName")}
									placeholder="Ví dụ: A Đôi, Y Blui, Trần Văn Nam..."
									required
									className={inputClasses}
								/>
							</div>

							{user?.role === "admin" ? (
								<div>
									<label
										htmlFor="household-village-id"
										className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
									>
										Thôn quản lý <span className="text-rose-500">*</span>
									</label>
									<CustomSelect
										id="household-village-id"
										value={formData.villageId}
										onChange={(val) =>
											setFormData((prev) => ({
												...prev,
												villageId: String(val),
											}))
										}
										options={villages.map((v) => ({
											value: v.id,
											label: v.name,
										}))}
										required
										size="md"
									/>
								</div>
							) : (
								<div>
									<span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
										Thôn quản lý
									</span>
									<div className="h-10 px-3.5 flex items-center bg-slate-200/60 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300">
										{villages.find((v) => v.id === formData.villageId)?.name ||
											"Thôn hiện tại"}
									</div>
								</div>
							)}

							<div>
								<label
									htmlFor="household-phone"
									className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
								>
									Số điện thoại
								</label>
								<input
									id="household-phone"
									type="text"
									value={formData.phone}
									onChange={handleChange("phone")}
									placeholder="Ví dụ: 0912..."
									className={inputClasses}
								/>
							</div>

							<div className="md:col-span-2">
								<label
									htmlFor="household-address"
									className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
								>
									Địa chỉ chi tiết
								</label>
								<input
									id="household-address"
									type="text"
									value={formData.address}
									onChange={handleChange("address")}
									placeholder="Ví dụ: Thôn 1, Xã Đăk Hà..."
									className={inputClasses}
								/>
							</div>

							<div className="md:col-span-3">
								<label
									htmlFor="household-notes"
									className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
								>
									Ghi chú thêm (nếu có)
								</label>
								<input
									id="household-notes"
									type="text"
									value={formData.notes}
									onChange={handleChange("notes")}
									placeholder="Ghi chú về nhận khoán, diện tích chuyển đổi, đề án nông thôn mới..."
									className={inputClasses}
								/>
							</div>
						</div>

						{/* TAB 1: CÂY TRỒNG */}
						{activeTab === "crops" && (
							<div className="space-y-4">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									{/* Cà phê Box */}
									<div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-3">
										<div className="font-bold text-xs text-amber-800 dark:text-amber-400 flex items-center gap-1.5 uppercase">
											<span className="w-2 h-2 rounded-full bg-amber-500" />
											CÀ PHÊ
										</div>
										<div className="grid grid-cols-2 gap-2.5">
											<div>
												<label
													htmlFor="field-cafe-household"
													className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 cursor-pointer"
												>
													Hộ gia đình
												</label>
												<div className="relative">
													<input
														id="field-cafe-household"
														type="number"
														step="0.001"
														min="0"
														value={formData.cafeHousehold}
														onChange={handleChange("cafeHousehold")}
														className="w-full h-10 pl-3 pr-8 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono tabular-nums font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
													/>
													<span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">
														ha
													</span>
												</div>
											</div>
											<div>
												<label
													htmlFor="field-cafe-contracted"
													className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 cursor-pointer"
												>
													Nhận khoán
												</label>
												<div className="relative">
													<input
														id="field-cafe-contracted"
														type="number"
														step="0.001"
														min="0"
														value={formData.cafeContracted}
														onChange={handleChange("cafeContracted")}
														className="w-full h-10 pl-3 pr-8 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono tabular-nums font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
													/>
													<span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">
														ha
													</span>
												</div>
											</div>
										</div>
									</div>

									{/* Cao su Box */}
									<div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-3">
										<div className="font-bold text-xs text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 uppercase">
											<span className="w-2 h-2 rounded-full bg-emerald-500" />
											CAO SU
										</div>
										<div className="grid grid-cols-2 gap-2.5">
											<div>
												<label
													htmlFor="field-rubber-household"
													className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 cursor-pointer"
												>
													Hộ gia đình
												</label>
												<div className="relative">
													<input
														id="field-rubber-household"
														type="number"
														step="0.001"
														min="0"
														value={formData.rubberHousehold}
														onChange={handleChange("rubberHousehold")}
														className="w-full h-10 pl-3 pr-8 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono tabular-nums font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
													/>
													<span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">
														ha
													</span>
												</div>
											</div>
											<div>
												<label
													htmlFor="field-rubber-contracted"
													className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 cursor-pointer"
												>
													Nhận khoán
												</label>
												<div className="relative">
													<input
														id="field-rubber-contracted"
														type="number"
														step="0.001"
														min="0"
														value={formData.rubberContracted}
														onChange={handleChange("rubberContracted")}
														className="w-full h-10 pl-3 pr-8 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono tabular-nums font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
													/>
													<span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">
														ha
													</span>
												</div>
											</div>
										</div>
									</div>
								</div>

								{/* 4 Cây: Ăn Quả, Mắc Ca, Lúa Nước, Cây Hàng Năm Khác */}
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
									<div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-xl">
										<label
											htmlFor="field-fruit-tree"
											className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 truncate cursor-pointer"
										>
											Cây ăn quả
										</label>
										<div className="relative">
											<input
												id="field-fruit-tree"
												type="number"
												step="0.001"
												min="0"
												value={formData.fruitTree}
												onChange={handleChange("fruitTree")}
												className="w-full h-9 pl-3 pr-7 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-mono tabular-nums font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
											/>
											<span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
												ha
											</span>
										</div>
									</div>

									<div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-xl">
										<label
											htmlFor="field-macadamia"
											className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 truncate cursor-pointer"
										>
											Cây Mắc Ca
										</label>
										<div className="relative">
											<input
												id="field-macadamia"
												type="number"
												step="0.001"
												min="0"
												value={formData.macadamia}
												onChange={handleChange("macadamia")}
												className="w-full h-9 pl-3 pr-7 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-mono tabular-nums font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
											/>
											<span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
												ha
											</span>
										</div>
									</div>

									<div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-xl">
										<label
											htmlFor="field-wet-rice"
											className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 truncate cursor-pointer"
										>
											Lúa nước
										</label>
										<div className="relative">
											<input
												id="field-wet-rice"
												type="number"
												step="0.001"
												min="0"
												value={formData.wetRice}
												onChange={handleChange("wetRice")}
												className="w-full h-9 pl-3 pr-7 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-mono tabular-nums font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
											/>
											<span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
												ha
											</span>
										</div>
									</div>

									<div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-xl">
										<label
											htmlFor="field-other-annual-crops"
											className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 truncate cursor-pointer"
										>
											Hàng năm khác
										</label>
										<div className="relative">
											<input
												id="field-other-annual-crops"
												type="number"
												step="0.001"
												min="0"
												value={formData.otherAnnualCrops}
												onChange={handleChange("otherAnnualCrops")}
												className="w-full h-9 pl-3 pr-7 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-mono tabular-nums font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
											/>
											<span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
												ha
											</span>
										</div>
									</div>
								</div>

								{/* Dược liệu Đăk Hà (4 loại con) */}
								<div className="p-4.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-3">
									<div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2">
										<div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 uppercase">
											<Flower2
												className="w-4 h-4 text-teal-500"
												strokeWidth={1.5}
											/>
											<span>CÂY DƯỢC LIỆU ĐĂK HÀ (4 LOẠI CON)</span>
										</div>
									</div>

									<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
										<div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
											<label
												htmlFor="field-herb-dinh-lang"
												className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 cursor-pointer"
											>
												Đinh lăng
											</label>
											<div className="relative">
												<input
													id="field-herb-dinh-lang"
													type="number"
													step="0.001"
													min="0"
													value={formData.herbDinhLang}
													onChange={handleChange("herbDinhLang")}
													className="w-full h-8 pl-2.5 pr-7 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono tabular-nums font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-teal-500"
												/>
												<span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
													ha
												</span>
											</div>
										</div>

										<div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
											<label
												htmlFor="field-herb-gung"
												className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 cursor-pointer"
											>
												Gừng
											</label>
											<div className="relative">
												<input
													id="field-herb-gung"
													type="number"
													step="0.001"
													min="0"
													value={formData.herbGung}
													onChange={handleChange("herbGung")}
													className="w-full h-8 pl-2.5 pr-7 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono tabular-nums font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-teal-500"
												/>
												<span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
													ha
												</span>
											</div>
										</div>

										<div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
											<label
												htmlFor="field-herb-nghe"
												className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 cursor-pointer"
											>
												Nghệ
											</label>
											<div className="relative">
												<input
													id="field-herb-nghe"
													type="number"
													step="0.001"
													min="0"
													value={formData.herbNghe}
													onChange={handleChange("herbNghe")}
													className="w-full h-8 pl-2.5 pr-7 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono tabular-nums font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-teal-500"
												/>
												<span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
													ha
												</span>
											</div>
										</div>

										<div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
											<label
												htmlFor="field-herb-sa"
												className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 cursor-pointer"
											>
												Sả
											</label>
											<div className="relative">
												<input
													id="field-herb-sa"
													type="number"
													step="0.001"
													min="0"
													value={formData.herbSa}
													onChange={handleChange("herbSa")}
													className="w-full h-8 pl-2.5 pr-7 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono tabular-nums font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-teal-500"
												/>
												<span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
													ha
												</span>
											</div>
										</div>
									</div>
								</div>

								{/* Subtotal Banner */}
								<div className="p-3.5 bg-slate-100 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
									<span>Tổng Diện Tích Cây Trồng Kê Khai:</span>
									<span className="font-mono tabular-nums text-base font-black text-emerald-600 dark:text-emerald-400">
										{cryptoHelper.formatArea(totalCropsArea)}
									</span>
								</div>
							</div>
						)}

						{/* TAB 2: VẬT NUÔI */}
						{activeTab === "livestock" && (
							<div className="space-y-4">
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
									<div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-2">
										<label
											htmlFor="field-buffalo"
											className="text-xs font-bold text-slate-700 dark:text-slate-300 block cursor-pointer"
										>
											Đàn Trâu
										</label>
										<div className="relative">
											<input
												id="field-buffalo"
												type="number"
												step="1"
												min="0"
												value={formData.buffalo}
												onChange={handleChange("buffalo")}
												className="w-full h-10 pl-3 pr-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-mono tabular-nums font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden"
											/>
											<span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">
												con
											</span>
										</div>
									</div>

									<div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-2">
										<label
											htmlFor="field-cow"
											className="text-xs font-bold text-slate-700 dark:text-slate-300 block cursor-pointer"
										>
											Đàn Bò
										</label>
										<div className="relative">
											<input
												id="field-cow"
												type="number"
												step="1"
												min="0"
												value={formData.cow}
												onChange={handleChange("cow")}
												className="w-full h-10 pl-3 pr-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-mono tabular-nums font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden"
											/>
											<span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">
												con
											</span>
										</div>
									</div>

									<div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-2">
										<label
											htmlFor="field-pig"
											className="text-xs font-bold text-slate-700 dark:text-slate-300 block cursor-pointer"
										>
											Đàn Heo
										</label>
										<div className="relative">
											<input
												id="field-pig"
												type="number"
												step="1"
												min="0"
												value={formData.pig}
												onChange={handleChange("pig")}
												className="w-full h-10 pl-3 pr-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-mono tabular-nums font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden"
											/>
											<span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">
												con
											</span>
										</div>
									</div>

									<div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-2">
										<label
											htmlFor="field-poultry"
											className="text-xs font-bold text-slate-700 dark:text-slate-300 block cursor-pointer"
										>
											Đàn Gia Cầm
										</label>
										<div className="relative">
											<input
												id="field-poultry"
												type="number"
												step="1"
												min="0"
												value={formData.poultry}
												onChange={handleChange("poultry")}
												className="w-full h-10 pl-3 pr-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-mono tabular-nums font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden"
											/>
											<span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">
												con
											</span>
										</div>
									</div>
								</div>

								{/* Subtotal Banner */}
								<div className="p-3.5 bg-slate-100 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
									<span>Tổng Đàn Vật Nuôi Kê Khai:</span>
									<span className="font-mono tabular-nums text-base font-black text-amber-600 dark:text-amber-400">
										{cryptoHelper.formatCount(totalAnimalsCount, "con")}
									</span>
								</div>
							</div>
						)}

						{/* TAB 3: THỦY SẢN */}
						{activeTab === "aquaculture" && (
							<div className="space-y-4">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-2">
										<label
											htmlFor="field-fish-pond"
											className="text-xs font-bold text-slate-800 dark:text-slate-200 block cursor-pointer"
										>
											Nuôi Cá Ao Hồ (Diện tích)
										</label>
										<div className="relative">
											<input
												id="field-fish-pond"
												type="number"
												step="0.001"
												min="0"
												value={formData.fishPond}
												onChange={handleChange("fishPond")}
												className="w-full h-10 pl-3 pr-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-mono tabular-nums font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-hidden"
											/>
											<span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">
												ha
											</span>
										</div>
										<p className="text-xs text-slate-500 dark:text-slate-400">
											Mặt nước thả cá truyền thống
										</p>
									</div>

									<div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-2">
										<label
											htmlFor="field-fish-cage"
											className="text-xs font-bold text-slate-800 dark:text-slate-200 block cursor-pointer"
										>
											Nuôi Cá Lồng Bè (Số lồng)
										</label>
										<div className="relative">
											<input
												id="field-fish-cage"
												type="number"
												step="1"
												min="0"
												value={formData.fishCage}
												onChange={handleChange("fishCage")}
												className="w-full h-10 pl-3 pr-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-mono tabular-nums font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-hidden"
											/>
											<span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">
												lồng
											</span>
										</div>
										<p className="text-xs text-slate-500 dark:text-slate-400">
											Lồng nuôi cá lòng hồ thủy điện
										</p>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Fixed Bottom Action Bar */}
					<div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between shrink-0">
						<button
							type="button"
							onClick={onClose}
							className="h-10 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-xs transition-colors cursor-pointer active:scale-95"
						>
							Hủy
						</button>
						<button
							type="submit"
							disabled={loading}
							className="h-10 flex items-center gap-1.5 px-5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-2xl text-xs shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
						>
							{loading ? (
								<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
							) : (
								<>
									{household ? (
										<Check
											className="w-4 h-4"
											strokeWidth={1.5}
											aria-hidden="true"
										/>
									) : (
										<Plus
											className="w-4 h-4"
											strokeWidth={1.5}
											aria-hidden="true"
										/>
									)}
									<span>{household ? "Cập nhật hồ sơ" : "Lưu hộ mới"}</span>
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>,
		document.body,
	);
};
