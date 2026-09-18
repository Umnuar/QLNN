import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Trees,
  PawPrint,
  Fish,
  AlertCircle,
  Flower2,
  Plus,
  Check,
} from 'lucide-react';
import { HouseholdFlat } from '../../types';
import { householdApi } from '../../api/householdApi';
import { useApp } from '../../AppContext';
import { useModal } from '../../hooks/useModal';
import { cryptoHelper } from '../../utils/cryptoHelper';
import { CustomSelect } from '../common/CustomSelect';

const inputClasses = "w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all outline-hidden bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-800/80 dark:border-slate-700/60 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-800 dark:focus:border-emerald-500 dark:focus:ring-2 dark:focus:ring-emerald-500/20";

interface HouseholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  household: HouseholdFlat | null;
  onSuccess: () => void;
}

type TabType = 'crops' | 'livestock' | 'aquaculture';

export const HouseholdModal: React.FC<HouseholdModalProps> = ({
  isOpen,
  onClose,
  household,
  onSuccess,
}) => {
  const { user, villages } = useApp();
  const { showModal } = useModal();

  const [activeTab, setActiveTab] = useState<TabType>('crops');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  const INITIAL_FORM_DATA = {
  villageId: '',
  fullName: '',
  notes: '',
  cafeHousehold: '0',
  cafeContracted: '0',
  rubberHousehold: '0',
  rubberContracted: '0',
  fruitTree: '0',
  macadamia: '0',
  herbDinhLang: '0',
  herbGung: '0',
  herbNghe: '0',
  herbSa: '0',
  wetRice: '0',
  otherAnnualCrops: '0',
  buffalo: '0',
  cow: '0',
  pig: '0',
  poultry: '0',
  fishPond: '0',
  fishCage: '0',
};

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof INITIAL_FORM_DATA) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  useEffect(() => {
    if (isOpen) {
      if (household) {
        setFormData({
          villageId: household.village_id || '',
          fullName: household.full_name || '',
          notes: household.notes || '',
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
          villageId: user?.role === 'user' && user.village_id ? user.village_id : villages[0]?.id || '',
        });
      }
      setActiveTab('crops');
      setError(null);
    }
  }, [isOpen, household, user, villages]);

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

  if (!isOpen || typeof document === 'undefined') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setError('Vui lòng nhập họ và tên chủ hộ.');
      return;
    }
    if (!formData.villageId) {
      setError('Vui lòng chọn thôn quản lý.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      village_id: formData.villageId,
      full_name: formData.fullName.trim(),
      notes: formData.notes.trim() || undefined,
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
      if (household && household.id) {
        await householdApi.update(household.id, payload);
      } else {
        await householdApi.create(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Save household error:', err);
      // Smart Duplicate Detection Handling
      if (err.response?.status === 409 && err.response?.data?.code === 'DUPLICATE_NAME') {
        const existingId = err.response?.data?.existing_household_id;
        showModal({
          title: 'Phát Hiện Trùng Tên Hộ',
          message: `Hộ "${formData.fullName.trim()}" đã tồn tại trong thôn. Bạn có muốn cập nhật đè số liệu mới này vào hồ sơ hộ đã có không?`,
          type: 'warning',
          confirmText: 'Đồng Ý Cập Nhật',
          cancelText: 'Hủy Bỏ',
          onConfirm: async () => {
            if (!existingId) {
              setError('Không tìm thấy mã hộ cần cập nhật.');
              return;
            }
            try {
              setLoading(true);
              await householdApi.update(existingId, payload);
              onSuccess();
              onClose();
            } catch (uErr: any) {
              console.error('Update duplicate error:', uErr);
              setError(uErr.response?.data?.error || 'Không thể cập nhật hộ trùng tên.');
            } finally {
              setLoading(false);
            }
          },
        });
        setLoading(false);
        return;
      }
      const msg = err.response?.data?.error || 'Có lỗi xảy ra khi lưu thông tin hộ nông nghiệp.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 !m-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs select-none animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-3xl h-[88vh] max-h-[88vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-150 animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar cố định: Icon Trồng trọt/Chăn nuôi/Thủy sản, Tiêu đề Thêm/Sửa Hộ, Tên chủ hộ, Badge Thôn, Tab switch (Trồng trọt / Chăn nuôi / Thủy sản), nút đóng X */}
        <div className="bg-slate-900 border-b border-slate-800 px-6 pt-5 pb-4 text-white shrink-0 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                  activeTab === 'crops'
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : activeTab === 'livestock'
                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                    : 'bg-sky-500/10 border border-sky-500/20 text-sky-400'
                }`}
              >
                {activeTab === 'crops' && <Trees className="w-5 h-5" strokeWidth={1.5} />}
                {activeTab === 'livestock' && <PawPrint className="w-5 h-5" strokeWidth={1.5} />}
                {activeTab === 'aquaculture' && <Fish className="w-5 h-5" strokeWidth={1.5} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-base tracking-tight text-white">
                    {household ? 'Chỉnh Sửa Số Liệu Hộ Nông Nghiệp' : 'Thêm Mới Hộ Nông Nghiệp'}
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
                  Kê khai 18 chỉ số diện tích cây trồng, đàn vật nuôi và mặt nước thủy sản
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng cửa sổ"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Tab switch (Trồng trọt / Chăn nuôi / Thủy sản) */}
          <div className="flex bg-slate-950/80 p-1.5 rounded-2xl gap-1.5 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('crops')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'crops'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Trees className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span className="truncate">1. Cây Trồng (12 Chỉ Số)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('livestock')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'livestock'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <PawPrint className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span className="truncate">2. Vật Nuôi (4 Chỉ Số)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('aquaculture')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'aquaculture'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Fish className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span className="truncate">3. Thủy Sản (2 Chỉ Số)</span>
            </button>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Body cuộn độc lập: flex-1 overflow-y-auto p-6 space-y-6 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {error && (
              <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-2xl flex items-start gap-2.5 text-rose-300 text-xs leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" strokeWidth={1.5} />
                <span>{error}</span>
              </div>
            )}

            {/* General Information Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950 p-4.5 rounded-2xl border border-slate-200/90 dark:border-slate-800">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Họ và tên chủ hộ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange('fullName')}
                  placeholder="Ví dụ: A Đôi, Y Blui, Trần Văn Nam..."
                  required
                  className={inputClasses}
                />
              </div>

              {user?.role === 'admin' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Thôn quản lý <span className="text-rose-500">*</span>
                  </label>
                  <CustomSelect
                    value={formData.villageId}
                    onChange={(val) => setFormData((prev) => ({ ...prev, villageId: String(val) }))}
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
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Thôn quản lý
                  </label>
                  <div className="h-10 px-3.5 flex items-center bg-slate-200/60 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300">
                    {villages.find((v) => v.id === formData.villageId)?.name || 'Thôn hiện tại'}
                  </div>
                </div>
              )}

              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Ghi chú thêm (nếu có)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={handleChange('notes')}
                  placeholder="Ghi chú về nhận khoán, diện tích chuyển đổi, đề án nông thôn mới..."
                  className={inputClasses}
                />
              </div>
            </div>

          {/* TAB 1: CÂY TRỒNG */}
          {activeTab === 'crops' && (
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
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Hộ gia đình
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={formData.cafeHousehold}
                          onChange={handleChange('cafeHousehold')}
                          className="w-full h-10 pl-3 pr-8 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono tabular-nums font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">
                          ha
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Nhận khoán
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={formData.cafeContracted}
                          onChange={handleChange('cafeContracted')}
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
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Hộ gia đình
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={formData.rubberHousehold}
                          onChange={handleChange('rubberHousehold')}
                          className="w-full h-10 pl-3 pr-8 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono tabular-nums font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">
                          ha
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Nhận khoán
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={formData.rubberContracted}
                          onChange={handleChange('rubberContracted')}
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
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 truncate">
                    Cây ăn quả
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={formData.fruitTree}
                      onChange={handleChange('fruitTree')}
                      className="w-full h-9 pl-3 pr-7 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-mono tabular-nums font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                      ha
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-xl">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 truncate">
                    Cây Mắc Ca
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={formData.macadamia}
                      onChange={handleChange('macadamia')}
                      className="w-full h-9 pl-3 pr-7 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-mono tabular-nums font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                      ha
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-xl">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 truncate">
                    Lúa nước
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={formData.wetRice}
                      onChange={handleChange('wetRice')}
                      className="w-full h-9 pl-3 pr-7 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-mono tabular-nums font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                      ha
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-xl">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 truncate">
                    Hàng năm khác
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={formData.otherAnnualCrops}
                      onChange={handleChange('otherAnnualCrops')}
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
                    <Flower2 className="w-4 h-4 text-teal-500" strokeWidth={1.5} />
                    <span>CÂY DƯỢC LIỆU ĐĂK HÀ (4 LOẠI CON)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Đinh lăng
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={formData.herbDinhLang}
                        onChange={handleChange('herbDinhLang')}
                        className="w-full h-8 pl-2.5 pr-7 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono tabular-nums font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                        ha
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Gừng
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={formData.herbGung}
                        onChange={handleChange('herbGung')}
                        className="w-full h-8 pl-2.5 pr-7 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono tabular-nums font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                        ha
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Nghệ
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={formData.herbNghe}
                        onChange={handleChange('herbNghe')}
                        className="w-full h-8 pl-2.5 pr-7 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono tabular-nums font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                        ha
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Sả
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={formData.herbSa}
                        onChange={handleChange('herbSa')}
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
          {activeTab === 'livestock' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Đàn Trâu</div>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={formData.buffalo}
                      onChange={handleChange('buffalo')}
                      className="w-full h-10 pl-3 pr-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-mono tabular-nums font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">
                      con
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Đàn Bò</div>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={formData.cow}
                      onChange={handleChange('cow')}
                      className="w-full h-10 pl-3 pr-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-mono tabular-nums font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">
                      con
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Đàn Heo</div>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={formData.pig}
                      onChange={handleChange('pig')}
                      className="w-full h-10 pl-3 pr-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-mono tabular-nums font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">
                      con
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Đàn Gia Cầm</div>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={formData.poultry}
                      onChange={handleChange('poultry')}
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
                  {cryptoHelper.formatCount(totalAnimalsCount, 'con')}
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: THỦY SẢN */}
          {activeTab === 'aquaculture' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-2">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Nuôi Cá Ao Hồ (Diện tích)</div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={formData.fishPond}
                      onChange={handleChange('fishPond')}
                      className="w-full h-10 pl-3 pr-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-mono tabular-nums font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-hidden"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">
                      ha
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Mặt nước thả cá truyền thống</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-2">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Nuôi Cá Lồng Bè (Số lồng)</div>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={formData.fishCage}
                      onChange={handleChange('fishCage')}
                      className="w-full h-10 pl-3 pr-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-mono tabular-nums font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-hidden"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">
                      lồng
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Lồng nuôi cá lòng hồ thủy điện</p>
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
              Hủy bỏ
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
                    <Check className="w-4 h-4" strokeWidth={1.5} />
                  ) : (
                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                  )}
                  <span>{household ? 'Cập Nhật Hồ Sơ' : 'Lưu Hộ Mới'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
