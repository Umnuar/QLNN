import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Trees,
  Dog,
  Fish,
  Users,
  Sparkles,
  RefreshCw,
  Building2,
} from 'lucide-react';
import { OverviewAnalytics, VillageAnalytics } from '../../types';
import { analyticsApi } from '../../api/analyticsApi';
import { useApp } from '../../AppContext';
import { cryptoHelper } from '../../utils/cryptoHelper';

// Component Donut Chart SVG nhẹ
const MiniDonut: React.FC<{
  val1: number;
  label1: string;
  color1: string;
  val2: number;
  label2: string;
  color2: string;
  unit: string;
}> = ({ val1, label1, color1, val2, label2, color2, unit }) => {
  const total = val1 + val2;
  if (total <= 0) {
    return (
      <div className="text-center py-4 text-slate-400 text-xs italic">
        Chưa có số liệu diện tích
      </div>
    );
  }

  const p1 = Math.round((val1 / total) * 100);
  const p2 = 100 - p1;

  // SVG circle calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset1 = circumference - (p1 / 100) * circumference;

  return (
    <div className="flex items-center gap-5">
      {/* SVG Donut */}
      <div className="relative w-24 h-24 shrink-0">
        <svg className="w-full h-full -rotate-90 drop-shadow-xs" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-slate-100"
            strokeWidth="14"
            fill="transparent"
          />
          {/* Segment 2 (background of fill) */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={color2}
            strokeWidth="14"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={0}
          />
          {/* Segment 1 */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={color1}
            strokeWidth="14"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset1}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">
            Tổng
          </span>
          <span className="text-xs font-black text-slate-900 leading-tight font-mono">
            {cryptoHelper.formatArea(total, false)}
          </span>
          <span className="text-[9px] text-slate-400 leading-none">{unit}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2.5 text-xs">
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between font-bold text-slate-800">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: color1 }} />
              <span>{label1}</span>
            </div>
            <span className="font-mono text-emerald-700">{p1}%</span>
          </div>
          <div className="text-slate-500 font-bold font-mono text-[11px] pl-4 mt-0.5">
            {cryptoHelper.formatArea(val1)}
          </div>
        </div>

        <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between font-bold text-slate-800">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: color2 }} />
              <span>{label2}</span>
            </div>
            <span className="font-mono text-emerald-700">{p2}%</span>
          </div>
          <div className="text-slate-500 font-bold font-mono text-[11px] pl-4 mt-0.5">
            {cryptoHelper.formatArea(val2)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Component Progress Bar
const ProgressBar: React.FC<{
  label: string;
  value: number;
  max: number;
  colorClass: string;
  unit: string;
}> = ({ label, value, max, colorClass, unit }) => {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="space-y-1.5 p-2 rounded-xl bg-slate-50/50">
      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
        <span>{label}</span>
        <span className="font-mono text-slate-900">
          {unit === 'ha' ? cryptoHelper.formatArea(value) : cryptoHelper.formatCount(value, unit)}
        </span>
      </div>
      <div className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 shadow-xs ${colorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export const AnalyticsDashboard: React.FC = () => {
  const { user, selectedVillageId, setSelectedVillageId, villages } = useApp();

  const [loading, setLoading] = useState<boolean>(true);
  const [overview, setOverview] = useState<OverviewAnalytics | null>(null);
  const [scopeName, setScopeName] = useState<string>('Toàn xã');
  const [villageData, setVillageData] = useState<VillageAnalytics[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const targetVillage = user?.role === 'admin' ? selectedVillageId : undefined;
      const res = await analyticsApi.getOverview(targetVillage);
      setOverview(res.data);
      setScopeName(res.scope.village_name);

      if (user?.role === 'admin') {
        const vRes = await analyticsApi.getByVillage();
        setVillageData(vRes.data);
      }
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedVillageId, user?.role]);

  // Lắng nghe sự kiện kết nối lại để làm mới tự động
  useEffect(() => {
    const handleReconnected = () => {
      loadData();
    };
    window.addEventListener('server:reconnected', handleReconnected);
    return () => window.removeEventListener('server:reconnected', handleReconnected);
  }, []);

  if (loading && !overview) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
        <div className="text-sm font-bold text-slate-700">Đang tổng hợp 25 chỉ số Nông thôn mới...</div>
        <p className="text-xs text-slate-400 mt-1">Đồng bộ số liệu diện tích và đàn vật nuôi xã Đăk Hà</p>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="py-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-sm">
        Chưa có số liệu thống kê. Vui lòng nhập dữ liệu hộ nông nghiệp.
      </div>
    );
  }

  const crops = overview.crops;
  const livestock = overview.livestock;
  const aqua = overview.aquaculture;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner & Filter */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
              {scopeName}
            </span>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
              Tổng Hợp Chỉ Tiêu Nông Thôn Mới
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Hệ thống 25 chỉ số thống kê diện tích cây trồng, tổng đàn vật nuôi và diện tích thủy sản
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Admin Village Selector */}
          {user?.role === 'admin' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Phạm vi:</span>
              <select
                value={selectedVillageId}
                onChange={(e) => setSelectedVillageId(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
              >
                <option value="">-- Toàn bộ các thôn --</option>
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={loadData}
            title="Làm mới số liệu"
            className="p-2.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Hộ Nông Nghiệp */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="w-13 h-13 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Tổng số hộ
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
              {cryptoHelper.formatCount(overview.household_count, 'hộ')}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">Đã kê khai trong CSDL</div>
          </div>
        </div>

        {/* Card 2: Tổng Diện Tích Cây Trồng */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
            <Trees className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Tổng cây trồng
            </div>
            <div className="text-2xl font-black text-emerald-700 font-mono mt-0.5">
              {cryptoHelper.formatArea(crops.total_crops_area)}
            </div>
            <div className="text-[11px] text-emerald-800/80 font-bold mt-0.5">
              12 chỉ tiêu diện tích
            </div>
          </div>
        </div>

        {/* Card 3: Tổng Đàn Vật Nuôi */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
            <Dog className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Tổng đàn vật nuôi
            </div>
            <div className="text-2xl font-black text-amber-700 font-mono mt-0.5">
              {cryptoHelper.formatCount(livestock.total_animals, 'con')}
            </div>
            <div className="text-[11px] text-amber-800/80 font-bold mt-0.5">
              4 loại gia súc, gia cầm
            </div>
          </div>
        </div>

        {/* Card 4: Thủy Sản */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-sky-300 transition-all">
          <div className="w-13 h-13 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 shadow-xs">
            <Fish className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Thủy sản
            </div>
            <div className="text-2xl font-black text-sky-700 font-mono mt-0.5">
              {cryptoHelper.formatArea(aqua.fish_pond)}
            </div>
            <div className="text-[11px] text-sky-800/80 font-bold mt-0.5">
              + {cryptoHelper.formatCount(aqua.fish_cage, 'lồng')}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: CÂY TRỒNG (12 Chỉ Số) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Trees className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            1. Cơ Cấu Cây Trồng (Tổng: {cryptoHelper.formatArea(crops.total_crops_area)})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cà phê Donut Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shadow-xs" />
                <h4 className="font-bold text-sm text-slate-800">Cà Phê (Tổng Diện Tích)</h4>
              </div>
              <span className="text-xs font-black font-mono px-3 py-1 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
                {cryptoHelper.formatArea(crops.total_cafe)}
              </span>
            </div>

            <MiniDonut
              val1={crops.cafe_household}
              label1="Hộ gia đình"
              color1="#d97706"
              val2={crops.cafe_contracted}
              label2="Nhận khoán"
              color2="#f59e0b"
              unit="ha"
            />
          </div>

          {/* Cao su Donut Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-xs" />
                <h4 className="font-bold text-sm text-slate-800">Cao Su (Tổng Diện Tích)</h4>
              </div>
              <span className="text-xs font-black font-mono px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
                {cryptoHelper.formatArea(crops.total_rubber)}
              </span>
            </div>

            <MiniDonut
              val1={crops.rubber_household}
              label1="Hộ gia đình"
              color1="#059669"
              val2={crops.rubber_contracted}
              label2="Nhận khoán"
              color2="#34d399"
              unit="ha"
            />
          </div>
        </div>

        {/* 4 Cards: Cây Ăn Quả, Mắc Ca, Lúa Nước, Cây Hàng Năm Khác */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Cây ăn quả
            </div>
            <div className="text-xl font-black text-slate-900 font-mono">
              {cryptoHelper.formatArea(crops.fruit_tree)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Sầu riêng, mít, bơ, cam...</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Cây Mắc Ca
            </div>
            <div className="text-xl font-black text-slate-900 font-mono">
              {cryptoHelper.formatArea(crops.macadamia)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Cây công nghiệp giá trị cao</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Lúa nước
            </div>
            <div className="text-xl font-black text-slate-900 font-mono">
              {cryptoHelper.formatArea(crops.wet_rice)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Lúa 2 vụ / 1 vụ</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Cây hàng năm khác
            </div>
            <div className="text-xl font-black text-slate-900 font-mono">
              {cryptoHelper.formatArea(crops.other_annual_crops)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Ngô, sắn, khoai, hoa màu</p>
          </div>
        </div>

        {/* Dược Liệu Breakdown Box (Forest Theme) */}
        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white p-6 rounded-3xl shadow-lg border border-emerald-800/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-800/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-sm text-white">
                  Cây Dược Liệu Đăk Hà (4 Loại Con)
                </h4>
                <p className="text-[11px] text-emerald-300">
                  Cây trồng bản địa dược liệu thuộc đề案 phát triển NTM xã Đăk Hà
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-300 uppercase font-black tracking-wider block">
                Tổng diện tích dược liệu
              </span>
              <span className="text-2xl font-black text-emerald-200 font-mono">
                {cryptoHelper.formatArea(crops.total_herb_area)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-900/60 p-3.5 rounded-2xl border border-emerald-700/50">
              <div className="text-[11px] font-bold text-emerald-300">Đinh lăng</div>
              <div className="text-lg font-black font-mono mt-1 text-white">
                {cryptoHelper.formatArea(crops.herb_dinh_lang)}
              </div>
            </div>

            <div className="bg-emerald-900/60 p-3.5 rounded-2xl border border-emerald-700/50">
              <div className="text-[11px] font-bold text-emerald-300">Gừng</div>
              <div className="text-lg font-black font-mono mt-1 text-white">
                {cryptoHelper.formatArea(crops.herb_gung)}
              </div>
            </div>

            <div className="bg-emerald-900/60 p-3.5 rounded-2xl border border-emerald-700/50">
              <div className="text-[11px] font-bold text-emerald-300">Nghệ</div>
              <div className="text-lg font-black font-mono mt-1 text-white">
                {cryptoHelper.formatArea(crops.herb_nghe)}
              </div>
            </div>

            <div className="bg-emerald-900/60 p-3.5 rounded-2xl border border-emerald-700/50">
              <div className="text-[11px] font-bold text-emerald-300">Sả</div>
              <div className="text-lg font-black font-mono mt-1 text-white">
                {cryptoHelper.formatArea(crops.herb_sa)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2 & 3: VẬT NUÔI & THỦY SẢN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Vật nuôi (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                <Dog className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                2. Tổng Đàn Vật Nuôi ({cryptoHelper.formatCount(livestock.total_animals, 'con')})
              </h3>
            </div>
          </div>

          {/* Cattle Summary Box */}
          <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-amber-900">Tổng Đàn Trâu Bò (Gia súc lớn):</span>
              <p className="text-[11px] text-amber-800 font-medium">Trâu: {livestock.buffalo} con • Bò: {livestock.cow} con</p>
            </div>
            <span className="text-base font-black font-mono text-amber-900">
              {cryptoHelper.formatCount(livestock.total_cattle, 'con')}
            </span>
          </div>

          <div className="space-y-2 pt-1">
            <ProgressBar
              label="Đàn Gia Cầm (Gà, Vịt, Ngan)"
              value={livestock.poultry}
              max={livestock.total_animals}
              colorClass="bg-amber-500"
              unit="con"
            />
            <ProgressBar
              label="Đàn Heo"
              value={livestock.pig}
              max={livestock.total_animals}
              colorClass="bg-rose-500"
              unit="con"
            />
            <ProgressBar
              label="Đàn Bò"
              value={livestock.cow}
              max={livestock.total_animals}
              colorClass="bg-amber-700"
              unit="con"
            />
            <ProgressBar
              label="Đàn Trâu"
              value={livestock.buffalo}
              max={livestock.total_animals}
              colorClass="bg-slate-700"
              unit="con"
            />
          </div>
        </div>

        {/* Thủy sản (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                <Fish className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">3. Nuôi Trồng Thủy Sản</h3>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200">
                <div className="text-xs font-bold text-sky-900">Nuôi Cá Ao Hồ (Diện tích)</div>
                <div className="text-2xl font-black font-mono text-sky-800 mt-1">
                  {cryptoHelper.formatArea(aqua.fish_pond)}
                </div>
                <p className="text-[11px] text-sky-700 mt-1">Mặt nước nuôi thả cá truyền thống</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-xs font-bold text-slate-800">Nuôi Cá Lồng Bè (Số lồng)</div>
                <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                  {cryptoHelper.formatCount(aqua.fish_cage, 'lồng')}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Lồng nuôi cá trên lòng hồ thủy điện</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-500 italic border border-slate-200">
            * Số liệu được cập nhật theo thời gian thực từ CSDL hộ nông nghiệp xã Đăk Hà.
          </div>
        </div>
      </div>

      {/* SECTION 4: BẢNG SO SÁNH GIỮA CÁC THÔN (Chỉ hiển thị cho Admin) */}
      {user?.role === 'admin' && villageData.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden space-y-3 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  4. Bảng So Sánh Số Liệu Giữa Các Thôn (Toàn Xã Đăk Hà)
                </h3>
                <p className="text-xs text-slate-500">Đối chiếu 25 chỉ tiêu giữa các thôn quản lý</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-3">Tên Thôn</th>
                  <th className="py-3.5 px-3 text-center">Số Hộ</th>
                  <th className="py-3.5 px-3 text-right">Cà Phê (ha)</th>
                  <th className="py-3.5 px-3 text-right">Cao Su (ha)</th>
                  <th className="py-3.5 px-3 text-right">Cây Ăn Quả</th>
                  <th className="py-3.5 px-3 text-right">Dược Liệu</th>
                  <th className="py-3.5 px-3 text-right">Tổng Cây (ha)</th>
                  <th className="py-3.5 px-3 text-right">Trâu Bò (con)</th>
                  <th className="py-3.5 px-3 text-right">Heo (con)</th>
                  <th className="py-3.5 px-3 text-right">Gia Cầm (con)</th>
                  <th className="py-3.5 px-3 text-right">Cá Ao (ha)</th>
                  <th className="py-3.5 px-3 text-right">Cá Lồng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {villageData.map((v) => (
                  <tr key={v.village_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{v.village_name}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-indigo-700">{v.household_count}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">{cryptoHelper.formatArea(v.crops.total_cafe)}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">{cryptoHelper.formatArea(v.crops.total_rubber)}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">{cryptoHelper.formatArea(v.crops.fruit_tree)}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">{cryptoHelper.formatArea(v.crops.total_herb_area)}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-emerald-700">
                      {cryptoHelper.formatArea(v.crops.total_crops_area)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">{v.livestock.total_cattle}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">{v.livestock.pig}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">{v.livestock.poultry}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">{cryptoHelper.formatArea(v.aquaculture.fish_pond)}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">{v.aquaculture.fish_cage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
