import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Save,
  Trees,
  Dog,
  Fish,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { HouseholdFlat } from '../../types';
import { householdApi } from '../../api/householdApi';
import { useApp } from '../../AppContext';
import { useModal } from '../../hooks/useModal';
import { cryptoHelper } from '../../utils/cryptoHelper';

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
  const [villageId, setVillageId] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // 1. Cây trồng (12 chỉ số)
  const [cafeHousehold, setCafeHousehold] = useState<string>('0');
  const [cafeContracted, setCafeContracted] = useState<string>('0');
  const [rubberHousehold, setRubberHousehold] = useState<string>('0');
  const [rubberContracted, setRubberContracted] = useState<string>('0');
  const [fruitTree, setFruitTree] = useState<string>('0');
  const [macadamia, setMacadamia] = useState<string>('0');
  const [herbDinhLang, setHerbDinhLang] = useState<string>('0');
  const [herbGung, setHerbGung] = useState<string>('0');
  const [herbNghe, setHerbNghe] = useState<string>('0');
  const [herbSa, setHerbSa] = useState<string>('0');
  const [wetRice, setWetRice] = useState<string>('0');
  const [otherAnnualCrops, setOtherAnnualCrops] = useState<string>('0');

  // 2. Vật nuôi (4 chỉ số)
  const [buffalo, setBuffalo] = useState<string>('0');
  const [cow, setCow] = useState<string>('0');
  const [pig, setPig] = useState<string>('0');
  const [poultry, setPoultry] = useState<string>('0');

  // 3. Thủy sản (2 chỉ số)
  const [fishPond, setFishPond] = useState<string>('0');
  const [fishCage, setFishCage] = useState<string>('0');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (household) {
        // Edit mode
        setFullName(household.full_name || '');
        setVillageId(household.village_id || '');
        setNotes(household.notes || '');

        setCafeHousehold(String(household.cafe_household ?? 0));
        setCafeContracted(String(household.cafe_contracted ?? 0));
        setRubberHousehold(String(household.rubber_household ?? 0));
        setRubberContracted(String(household.rubber_contracted ?? 0));
        setFruitTree(String(household.fruit_tree ?? 0));
        setMacadamia(String(household.macadamia ?? 0));
        setHerbDinhLang(String(household.herb_dinh_lang ?? 0));
        setHerbGung(String(household.herb_gung ?? 0));
        setHerbNghe(String(household.herb_nghe ?? 0));
        setHerbSa(String(household.herb_sa ?? 0));
        setWetRice(String(household.wet_rice ?? 0));
        setOtherAnnualCrops(String(household.other_annual_crops ?? 0));

        setBuffalo(String(household.buffalo ?? 0));
        setCow(String(household.cow ?? 0));
        setPig(String(household.pig ?? 0));
        setPoultry(String(household.poultry ?? 0));

        setFishPond(String(household.fish_pond ?? 0));
        setFishCage(String(household.fish_cage ?? 0));
      } else {
        // Create mode
        setFullName('');
        setVillageId(user?.role === 'user' && user.village_id ? user.village_id : villages[0]?.id || '');
        setNotes('');

        setCafeHousehold('0');
        setCafeContracted('0');
        setRubberHousehold('0');
        setRubberContracted('0');
        setFruitTree('0');
        setMacadamia('0');
        setHerbDinhLang('0');
        setHerbGung('0');
        setHerbNghe('0');
        setHerbSa('0');
        setWetRice('0');
        setOtherAnnualCrops('0');

        setBuffalo('0');
        setCow('0');
        setPig('0');
        setPoultry('0');

        setFishPond('0');
        setFishCage('0');
      }
      setActiveTab('crops');
      setError(null);
    }
  }, [isOpen, household, user, villages]);

  // Live Subtotal Calculations
  const totalCropsArea = useMemo(() => {
    return (
      (parseFloat(cafeHousehold) || 0) +
      (parseFloat(cafeContracted) || 0) +
      (parseFloat(rubberHousehold) || 0) +
      (parseFloat(rubberContracted) || 0) +
      (parseFloat(fruitTree) || 0) +
      (parseFloat(macadamia) || 0) +
      (parseFloat(herbDinhLang) || 0) +
      (parseFloat(herbGung) || 0) +
      (parseFloat(herbNghe) || 0) +
      (parseFloat(herbSa) || 0) +
      (parseFloat(wetRice) || 0) +
      (parseFloat(otherAnnualCrops) || 0)
    );
  }, [
    cafeHousehold,
    cafeContracted,
    rubberHousehold,
    rubberContracted,
    fruitTree,
    macadamia,
    herbDinhLang,
    herbGung,
    herbNghe,
    herbSa,
    wetRice,
    otherAnnualCrops,
  ]);

  const totalAnimalsCount = useMemo(() => {
    return (
      (parseInt(buffalo, 10) || 0) +
      (parseInt(cow, 10) || 0) +
      (parseInt(pig, 10) || 0) +
      (parseInt(poultry, 10) || 0)
    );
  }, [buffalo, cow, pig, poultry]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Họ và tên chủ hộ là bắt buộc.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      village_id: user?.role === 'admin' ? villageId : undefined,
      full_name: fullName.trim(),
      notes: notes.trim() || undefined,
      crops: {
        cafe_household: parseFloat(cafeHousehold) || 0,
        cafe_contracted: parseFloat(cafeContracted) || 0,
        rubber_household: parseFloat(rubberHousehold) || 0,
        rubber_contracted: parseFloat(rubberContracted) || 0,
        fruit_tree: parseFloat(fruitTree) || 0,
        macadamia: parseFloat(macadamia) || 0,
        herb_dinh_lang: parseFloat(herbDinhLang) || 0,
        herb_gung: parseFloat(herbGung) || 0,
        herb_nghe: parseFloat(herbNghe) || 0,
        herb_sa: parseFloat(herbSa) || 0,
        wet_rice: parseFloat(wetRice) || 0,
        other_annual_crops: parseFloat(otherAnnualCrops) || 0,
      },
      livestock: {
        buffalo: parseInt(buffalo, 10) || 0,
        cow: parseInt(cow, 10) || 0,
        pig: parseInt(pig, 10) || 0,
        poultry: parseInt(poultry, 10) || 0,
      },
      aquaculture: {
        fish_pond: parseFloat(fishPond) || 0,
        fish_cage: parseInt(fishCage, 10) || 0,
      },
    };

    try {
      if (household?.id) {
        await householdApi.update(household.id, payload);
      } else {
        await householdApi.create(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Submit household error:', err);
      if (err.response?.status === 409) {
        const existingId = err.response?.data?.existing_household_id;
        showModal({
          title: 'Phát Hiện Trùng Tên Hộ',
          message: `Hộ "${fullName.trim()}" đã tồn tại trong thôn. Bạn có muốn cập nhật đè số liệu mới này vào hồ sơ hộ đã có không?`,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-200">
              <Trees className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight">
                {household ? 'Chỉnh Sửa Số Liệu Hộ Nông Nghiệp' : 'Thêm Mới Hộ Nông Nghiệp'}
              </h3>
              <p className="text-xs text-emerald-200 font-medium">
                Kê khai 18 chỉ số diện tích cây trồng, đàn vật nuôi và diện tích nuôi thủy sản
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* General Information Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Họ và tên chủ hộ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: A Đôi, Y Blui, Trần Văn Nam..."
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {user?.role === 'admin' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Thôn quản lý <span className="text-rose-500">*</span>
                </label>
                <select
                  value={villageId}
                  onChange={(e) => setVillageId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                >
                  {villages.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Thôn quản lý
                </label>
                <div className="px-3.5 py-2.5 bg-slate-200/70 border border-slate-300 rounded-xl text-xs font-bold text-slate-700">
                  {villages.find((v) => v.id === villageId)?.name || 'Thôn hiện tại'}
                </div>
              </div>
            )}

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ghi chú thêm (nếu có)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú về nhận khoán, diện tích chuyển đổi, đề án..."
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
              />
            </div>
          </div>

          {/* Segmented Control Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('crops')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'crops'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Trees className="w-4 h-4" />
              <span>1. Cây Trồng (12 Chỉ Số)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('livestock')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'livestock'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Dog className="w-4 h-4" />
              <span>2. Vật Nuôi (4 Chỉ Số)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('aquaculture')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'aquaculture'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Fish className="w-4 h-4" />
              <span>3. Thủy Sản (2 Chỉ Số)</span>
            </button>
          </div>

          {/* TAB 1: CÂY TRỒNG */}
          {activeTab === 'crops' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cà phê Box */}
                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-3">
                  <div className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                    CÀ PHÊ
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Hộ gia đình
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={cafeHousehold}
                          onChange={(e) => setCafeHousehold(e.target.value)}
                          className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                          ha
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Nhận khoán
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={cafeContracted}
                          onChange={(e) => setCafeContracted(e.target.value)}
                          className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                          ha
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cao su Box */}
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    CAO SU
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Hộ gia đình
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={rubberHousehold}
                          onChange={(e) => setRubberHousehold(e.target.value)}
                          className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                          ha
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Nhận khoán
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={rubberContracted}
                          onChange={(e) => setRubberContracted(e.target.value)}
                          className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                          ha
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Cây: Ăn Quả, Mắc Ca, Lúa Nước, Cây Hàng Năm Khác */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1 truncate">
                    Cây ăn quả
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={fruitTree}
                      onChange={(e) => setFruitTree(e.target.value)}
                      className="w-full pl-2.5 pr-7 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                      ha
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1 truncate">
                    Cây Mắc Ca
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={macadamia}
                      onChange={(e) => setMacadamia(e.target.value)}
                      className="w-full pl-2.5 pr-7 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                      ha
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1 truncate">
                    Lúa nước
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={wetRice}
                      onChange={(e) => setWetRice(e.target.value)}
                      className="w-full pl-2.5 pr-7 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                      ha
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1 truncate">
                    Hàng năm khác
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={otherAnnualCrops}
                      onChange={(e) => setOtherAnnualCrops(e.target.value)}
                      className="w-full pl-2.5 pr-7 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                      ha
                    </span>
                  </div>
                </div>
              </div>

              {/* Dược liệu Đăk Hà (4 loại con) */}
              <div className="p-4 bg-emerald-900/90 text-white rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-800 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    CÂY DƯỢC LIỆU ĐĂK HÀ (4 LOẠI CON)
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-900">
                  <div className="p-2.5 bg-white/95 rounded-xl">
                    <label className="text-[11px] font-bold text-emerald-950 block mb-1">
                      Đinh lăng
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={herbDinhLang}
                        onChange={(e) => setHerbDinhLang(e.target.value)}
                        className="w-full pl-2 pr-7 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                        ha
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white/95 rounded-xl">
                    <label className="text-[11px] font-bold text-emerald-950 block mb-1">
                      Gừng
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={herbGung}
                        onChange={(e) => setHerbGung(e.target.value)}
                        className="w-full pl-2 pr-7 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                        ha
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white/95 rounded-xl">
                    <label className="text-[11px] font-bold text-emerald-950 block mb-1">
                      Nghệ
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={herbNghe}
                        onChange={(e) => setHerbNghe(e.target.value)}
                        className="w-full pl-2 pr-7 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                        ha
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white/95 rounded-xl">
                    <label className="text-[11px] font-bold text-emerald-950 block mb-1">
                      Sả
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={herbSa}
                        onChange={(e) => setHerbSa(e.target.value)}
                        className="w-full pl-2 pr-7 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                        ha
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtotal Banner */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-900">
                <span>Tổng Diện Tích Cây Trồng Kê Khai:</span>
                <span className="font-mono text-sm font-black text-emerald-700">
                  {cryptoHelper.formatArea(totalCropsArea)}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: VẬT NUÔI */}
          {activeTab === 'livestock' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="text-xs font-bold text-slate-700">Đàn Trâu</div>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={buffalo}
                      onChange={(e) => setBuffalo(e.target.value)}
                      className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-800"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                      con
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-2">
                  <div className="text-xs font-bold text-amber-900">Đàn Bò</div>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={cow}
                      onChange={(e) => setCow(e.target.value)}
                      className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-800"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                      con
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-2xl space-y-2">
                  <div className="text-xs font-bold text-rose-900">Đàn Heo</div>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={pig}
                      onChange={(e) => setPig(e.target.value)}
                      className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-800"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                      con
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-2">
                  <div className="text-xs font-bold text-amber-900">Đàn Gia Cầm</div>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={poultry}
                      onChange={(e) => setPoultry(e.target.value)}
                      className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-800"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                      con
                    </span>
                  </div>
                </div>
              </div>

              {/* Subtotal Banner */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs font-bold text-amber-900">
                <span>Tổng Đàn Vật Nuôi Kê Khai:</span>
                <span className="font-mono text-sm font-black text-amber-700">
                  {cryptoHelper.formatCount(totalAnimalsCount, 'con')}
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: THỦY SẢN */}
          {activeTab === 'aquaculture' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl space-y-2">
                  <div className="text-xs font-bold text-sky-900">Nuôi Cá Ao Hồ (Diện tích)</div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={fishPond}
                      onChange={(e) => setFishPond(e.target.value)}
                      className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-800"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                      ha
                    </span>
                  </div>
                  <p className="text-[11px] text-sky-700">Mặt nước thả cá truyền thống</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="text-xs font-bold text-slate-800">Nuôi Cá Lồng Bè (Số lồng)</div>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={fishCage}
                      onChange={(e) => setFishCage(e.target.value)}
                      className="w-full pl-3 pr-12 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-800"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                      lồng
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Lồng nuôi cá lòng hồ thủy điện</p>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-950/20 transition-all disabled:opacity-50 active:scale-98 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{household ? 'Cập Nhật Hồ Sơ' : 'Lưu Hộ Mới'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
