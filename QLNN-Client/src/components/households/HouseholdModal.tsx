import React, { useState, useEffect } from 'react';
import { X, Sprout, ShieldAlert, CheckCircle2, Trees, Dog, Fish, Save } from 'lucide-react';
import { HouseholdFlat } from '../../types';
import { householdApi } from '../../api/householdApi';
import { useApp } from '../../AppContext';
import { useModal } from '../../hooks/useModal';

interface HouseholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  household?: HouseholdFlat | null;
  onSuccess: (saved: HouseholdFlat) => void;
}

type TabType = 'crops' | 'livestock' | 'aquaculture';

export const HouseholdModal: React.FC<HouseholdModalProps> = ({
  isOpen,
  onClose,
  household,
  onSuccess,
}) => {
  const { user, selectedVillageId, villages } = useApp();
  const { showModal } = useModal();

  const [activeTab, setActiveTab] = useState<TabType>('crops');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [targetVillageId, setTargetVillageId] = useState<string>('');
  const [stt, setStt] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // 12 Chỉ số Cây trồng (ha)
  const [cafeHousehold, setCafeHousehold] = useState<string>('');
  const [cafeContracted, setCafeContracted] = useState<string>('');
  const [rubberHousehold, setRubberHousehold] = useState<string>('');
  const [rubberContracted, setRubberContracted] = useState<string>('');
  const [fruitTree, setFruitTree] = useState<string>('');
  const [macadamia, setMacadamia] = useState<string>('');
  const [herbDinhLang, setHerbDinhLang] = useState<string>('');
  const [herbGung, setHerbGung] = useState<string>('');
  const [herbNghe, setHerbNghe] = useState<string>('');
  const [herbSa, setHerbSa] = useState<string>('');
  const [wetRice, setWetRice] = useState<string>('');
  const [otherAnnualCrops, setOtherAnnualCrops] = useState<string>('');

  // 4 Chỉ số Vật nuôi (con)
  const [buffalo, setBuffalo] = useState<string>('');
  const [cow, setCow] = useState<string>('');
  const [pig, setPig] = useState<string>('');
  const [poultry, setPoultry] = useState<string>('');

  // 2 Chỉ số Thủy sản
  const [fishPond, setFishPond] = useState<string>(''); // ha
  const [fishCage, setFishCage] = useState<string>(''); // lồng

  // Helper format value to string
  const valToStr = (val: number | null | undefined) =>
    val !== null && val !== undefined && val > 0 ? String(val) : '';

  // Load data khi mở modal
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setActiveTab('crops');

      if (household) {
        // Mode SỬA
        setTargetVillageId(household.village_id || selectedVillageId);
        setStt(household.stt ? String(household.stt) : '');
        setFullName(household.full_name || '');
        setNotes(household.notes || '');

        setCafeHousehold(valToStr(household.cafe_household));
        setCafeContracted(valToStr(household.cafe_contracted));
        setRubberHousehold(valToStr(household.rubber_household));
        setRubberContracted(valToStr(household.rubber_contracted));
        setFruitTree(valToStr(household.fruit_tree));
        setMacadamia(valToStr(household.macadamia));
        setHerbDinhLang(valToStr(household.herb_dinh_lang));
        setHerbGung(valToStr(household.herb_gung));
        setHerbNghe(valToStr(household.herb_nghe));
        setHerbSa(valToStr(household.herb_sa));
        setWetRice(valToStr(household.wet_rice));
        setOtherAnnualCrops(valToStr(household.other_annual_crops));

        setBuffalo(valToStr(household.buffalo));
        setCow(valToStr(household.cow));
        setPig(valToStr(household.pig));
        setPoultry(valToStr(household.poultry));

        setFishPond(valToStr(household.fish_pond));
        setFishCage(valToStr(household.fish_cage));
      } else {
        // Mode THÊM MỚI
        setTargetVillageId(selectedVillageId || (villages.length > 0 ? villages[0].id : ''));
        setStt('');
        setFullName('');
        setNotes('');

        setCafeHousehold('');
        setCafeContracted('');
        setRubberHousehold('');
        setRubberContracted('');
        setFruitTree('');
        setMacadamia('');
        setHerbDinhLang('');
        setHerbGung('');
        setHerbNghe('');
        setHerbSa('');
        setWetRice('');
        setOtherAnnualCrops('');

        setBuffalo('');
        setCow('');
        setPig('');
        setPoultry('');

        setFishPond('');
        setFishCage('');
      }
    }
  }, [isOpen, household, selectedVillageId, villages]);

  if (!isOpen) return null;

  const parseNumOrNull = (val: string): number | null => {
    const trimmed = val.trim();
    if (!trimmed) return null;
    const num = parseFloat(trimmed);
    return isNaN(num) || num <= 0 ? null : num;
  };

  const parseIntOrNull = (val: string): number | null => {
    const trimmed = val.trim();
    if (!trimmed) return null;
    const num = parseInt(trimmed, 10);
    return isNaN(num) || num <= 0 ? null : num;
  };

  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      setErrorMessage('Vui lòng nhập Họ và tên chủ hộ.');
      return false;
    }

    // Kiểm tra số âm
    const checkNegative = (val: string, label: string) => {
      const n = parseFloat(val);
      if (!isNaN(n) && n < 0) {
        setErrorMessage(`Chỉ số "${label}" không được là số âm.`);
        return false;
      }
      return true;
    };

    if (!checkNegative(cafeHousehold, 'Cà phê Hộ')) return false;
    if (!checkNegative(cafeContracted, 'Cà phê Nhận khoán')) return false;
    if (!checkNegative(rubberHousehold, 'Cao su Hộ')) return false;
    if (!checkNegative(rubberContracted, 'Cao su Nhận khoán')) return false;
    if (!checkNegative(fruitTree, 'Cây ăn quả')) return false;
    if (!checkNegative(macadamia, 'Cây Mắc Ca')) return false;
    if (!checkNegative(herbDinhLang, 'Đinh lăng')) return false;
    if (!checkNegative(herbGung, 'Gừng')) return false;
    if (!checkNegative(herbNghe, 'Nghệ')) return false;
    if (!checkNegative(herbSa, 'Sả')) return false;
    if (!checkNegative(wetRice, 'Lúa nước')) return false;
    if (!checkNegative(otherAnnualCrops, 'Cây hàng năm khác')) return false;
    if (!checkNegative(buffalo, 'Trâu')) return false;
    if (!checkNegative(cow, 'Bò')) return false;
    if (!checkNegative(pig, 'Heo')) return false;
    if (!checkNegative(poultry, 'Gia cầm')) return false;
    if (!checkNegative(fishPond, 'Nuôi cá ao')) return false;
    if (!checkNegative(fishCage, 'Nuôi cá lồng bè')) return false;

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage(null);

    const payload: HouseholdFlat = {
      village_id: user?.role === 'admin' ? targetVillageId : undefined,
      stt: parseIntOrNull(stt),
      full_name: fullName.trim(),
      notes: notes.trim() || null,

      // Cây trồng
      cafe_household: parseNumOrNull(cafeHousehold),
      cafe_contracted: parseNumOrNull(cafeContracted),
      rubber_household: parseNumOrNull(rubberHousehold),
      rubber_contracted: parseNumOrNull(rubberContracted),
      fruit_tree: parseNumOrNull(fruitTree),
      macadamia: parseNumOrNull(macadamia),
      herb_dinh_lang: parseNumOrNull(herbDinhLang),
      herb_gung: parseNumOrNull(herbGung),
      herb_nghe: parseNumOrNull(herbNghe),
      herb_sa: parseNumOrNull(herbSa),
      wet_rice: parseNumOrNull(wetRice),
      other_annual_crops: parseNumOrNull(otherAnnualCrops),

      // Vật nuôi
      buffalo: parseIntOrNull(buffalo),
      cow: parseIntOrNull(cow),
      pig: parseIntOrNull(pig),
      poultry: parseIntOrNull(poultry),

      // Thủy sản
      fish_pond: parseNumOrNull(fishPond),
      fish_cage: parseIntOrNull(fishCage),
    };

    try {
      let result: HouseholdFlat;
      if (household?.id) {
        // Update
        result = await householdApi.update(household.id, payload);
      } else {
        // Create
        result = await householdApi.create(payload);
      }
      onSuccess(result);
      onClose();
    } catch (err: any) {
      console.error('Submit household error:', err);
      const serverMsg = err.response?.data?.error || 'Không thể lưu thông tin hộ. Vui lòng thử lại.';
      // Nếu lỗi trùng tên trong thôn -> Gợi ý Smart Upsert
      const existingId = err.response?.data?.existing_household_id;
      if (existingId || serverMsg.includes('đã tồn tại') || serverMsg.includes('trùng tên')) {
        showModal({
          title: 'Hộ Dân Đã Tồn Tại',
          message: `Hộ "${fullName.trim()}" đã tồn tại trong thôn này. Bạn có muốn cập nhật lại toàn bộ số liệu cây trồng/vật nuôi cho hộ này không?`,
          type: 'warning',
          confirmText: 'Đồng ý Cập Nhật',
          cancelText: 'Hủy bỏ',
          onConfirm: async () => {
            if (!existingId) {
              setErrorMessage('Không xác định được ID của hộ cũ để cập nhật.');
              return;
            }
            try {
              setLoading(true);
              const updatedResult = await householdApi.update(existingId, payload);
              onSuccess(updatedResult);
              onClose();
            } catch (updateErr: any) {
              console.error('Update duplicate household error:', updateErr);
              const updateMsg = updateErr.response?.data?.error || 'Không thể cập nhật đè lên hộ cũ.';
              setErrorMessage(updateMsg);
            } finally {
              setLoading(false);
            }
          },
        });
      } else {
        setErrorMessage(serverMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {household ? 'Chỉnh Sửa Hộ Nông Nghiệp' : 'Thêm Mới Hộ Nông Nghiệp'}
              </h3>
              <p className="text-xs text-slate-400">
                Thống kê 18 chỉ số diện tích cây trồng, vật nuôi & thủy sản
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Thông tin chung */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* STT */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">STT</label>
              <input
                type="number"
                value={stt}
                onChange={(e) => setStt(e.target.value)}
                placeholder="1, 2..."
                min="1"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Họ và tên */}
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Họ và tên chủ hộ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn An, A Thao..."
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Chọn Thôn (Chỉ hiển thị cho Admin) */}
            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">Thôn quản lý</label>
              {user?.role === 'admin' ? (
                <select
                  value={targetVillageId}
                  onChange={(e) => setTargetVillageId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {villages.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-3 py-2 bg-slate-200/70 border border-slate-300 rounded-lg text-xs font-bold text-slate-700">
                  {villages.find((v) => v.id === selectedVillageId)?.name || 'Thôn của bạn'}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Tabs 3 nhóm chỉ số */}
          <div>
            <div className="flex border-b border-slate-200 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('crops')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'crops'
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Trees className="w-4 h-4" />
                1. Cây Trồng (12 chỉ số - ha)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('livestock')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'livestock'
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Dog className="w-4 h-4" />
                2. Vật Nuôi (4 chỉ số - con)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('aquaculture')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'aquaculture'
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Fish className="w-4 h-4" />
                3. Thủy Sản (2 chỉ số)
              </button>
            </div>

            {/* TAB 1: CÂY TRỒNG */}
            {activeTab === 'crops' && (
              <div className="space-y-4 animate-in fade-in duration-100">
                {/* Cà phê & Cao su (Phân nhóm Hộ vs Khoán) */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Cà phê & Cao su (Tách riêng Hộ gia đình và Nhận khoán)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Cà phê - Hộ gia đình (ha)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={cafeHousehold}
                        onChange={(e) => setCafeHousehold(e.target.value)}
                        placeholder="0.0"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Cà phê - Nhận khoán (ha)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={cafeContracted}
                        onChange={(e) => setCafeContracted(e.target.value)}
                        placeholder="0.0"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Cao su - Hộ gia đình (ha)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={rubberHousehold}
                        onChange={(e) => setRubberHousehold(e.target.value)}
                        placeholder="0.0"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Cao su - Nhận khoán (ha)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={rubberContracted}
                        onChange={(e) => setRubberContracted(e.target.value)}
                        placeholder="0.0"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Cây ăn quả, Mắc Ca, Lúa nước, Hàng năm khác */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cây ăn quả (ha)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={fruitTree}
                      onChange={(e) => setFruitTree(e.target.value)}
                      placeholder="0.0"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cây Mắc Ca (ha)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={macadamia}
                      onChange={(e) => setMacadamia(e.target.value)}
                      placeholder="0.0"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Lúa nước (ha)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={wetRice}
                      onChange={(e) => setWetRice(e.target.value)}
                      placeholder="0.0"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cây hàng năm khác (ha)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={otherAnnualCrops}
                      onChange={(e) => setOtherAnnualCrops(e.target.value)}
                      placeholder="0.0"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Cây Dược Liệu (4 loại con) */}
                <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200">
                  <div className="text-xs font-bold text-emerald-900 mb-2.5 flex items-center gap-1.5">
                    <Trees className="w-3.5 h-3.5 text-emerald-600" />
                    Cây Dược Liệu (4 loại con theo chuẩn biểu mẫu Đăk Hà)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Đinh lăng (ha)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={herbDinhLang}
                        onChange={(e) => setHerbDinhLang(e.target.value)}
                        placeholder="0.0"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Gừng (ha)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={herbGung}
                        onChange={(e) => setHerbGung(e.target.value)}
                        placeholder="0.0"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Nghệ (ha)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={herbNghe}
                        onChange={(e) => setHerbNghe(e.target.value)}
                        placeholder="0.0"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Sả (ha)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={herbSa}
                        onChange={(e) => setHerbSa(e.target.value)}
                        placeholder="0.0"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: VẬT NUÔI */}
            {activeTab === 'livestock' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-100">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Đàn Trâu (con)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={buffalo}
                    onChange={(e) => setBuffalo(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Gia súc lớn kéo cày</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Đàn Bò (con)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={cow}
                    onChange={(e) => setCow(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Bò thịt / Bò sinh sản</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Đàn Heo (con)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={pig}
                    onChange={(e) => setPig(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Heo thịt / Heo nái</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Gia cầm (con)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={poultry}
                    onChange={(e) => setPoultry(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Gà, vịt, ngan, ngỗng</p>
                </div>
              </div>
            )}

            {/* TAB 3: THỦY SẢN */}
            {activeTab === 'aquaculture' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-100">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nuôi cá ao (ha)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={fishPond}
                    onChange={(e) => setFishPond(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Diện tích mặt nước ao hồ nuôi thả cá (ha)
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nuôi cá lồng bè (lồng)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={fishCage}
                    onChange={(e) => setFishCage(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Số lượng lồng nuôi cá trên lòng hồ thủy điện
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Ghi chú */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ghi chú thêm (Tùy chọn)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú cụ thể về hộ dân (ví dụ: hộ làm kinh tế giỏi, đăng ký hỗ trợ cây giống NTM...)"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
            >
              Hủy Bỏ
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{household ? 'Lưu Thay Đổi' : 'Thêm Hộ Dân'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
