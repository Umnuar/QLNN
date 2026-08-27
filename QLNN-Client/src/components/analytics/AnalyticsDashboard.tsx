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
  ArrowLeft,
  Download,
} from 'lucide-react';

import { OverviewAnalytics, VillageAnalytics } from '../../types';
import { analyticsApi } from '../../api/analyticsApi';
import { useApp } from '../../AppContext';
import { getCache, setCache } from '../../db/indexedDB';
import { cryptoHelper } from '../../utils/cryptoHelper';
import { secureStorage } from '../../utils/secureStorage';

// Component Donut Chart SVG nhẹ
const MiniDonut: React.FC<{
  val1: number;
  label1: string;
  color1: string;
  val2: number;
  label2: string;
  color2: string;
  unit: string;
}> = ({ val1, label1, color1, val2, label2, color2 }) => {
  const total = val1 + val2;
  if (total <= 0) {
    return (
      <div className="text-center py-4 text-slate-400 dark:text-slate-500 text-xs italic">
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
      <div className="relative w-24 h-24 shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="14"
            className="text-slate-200 dark:text-slate-800"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={color1}
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset1}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-mono font-black text-slate-800 dark:text-slate-100">{p1}%</span>
          <span className="text-[9px] text-slate-400 font-bold uppercase">Hộ GD</span>
        </div>
      </div>

      <div className="flex-1 space-y-2">
        <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color1 }} />
              <span>{label1}</span>
            </div>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs">{p1}%</span>
          </div>
          <div className="text-slate-600 dark:text-slate-400 font-bold font-mono text-xs pl-4.5 mt-0.5 tabular-nums">
            {cryptoHelper.formatArea(val1)}
          </div>
        </div>

        <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color2 }} />
              <span>{label2}</span>
            </div>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs">{p2}%</span>
          </div>
          <div className="text-slate-600 dark:text-slate-400 font-bold font-mono text-xs pl-4.5 mt-0.5 tabular-nums">
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
    <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
      <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
        <span>{label}</span>
        <span className="font-mono tabular-nums text-sm text-slate-900 dark:text-slate-100 font-bold">
          {unit === 'ha' ? cryptoHelper.formatArea(value) : cryptoHelper.formatCount(value, unit)}
        </span>
      </div>
      <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export const AnalyticsDashboard: React.FC = () => {
  const { user, selectedVillageId, setActiveTab } = useApp();

  const [loading, setLoading] = useState<boolean>(true);
  const [overview, setOverview] = useState<OverviewAnalytics | null>(null);
  const [scopeName, setScopeName] = useState<string>('Toàn xã');
  const [villageData, setVillageData] = useState<VillageAnalytics[]>([]);
  const [isUsingCachedData, setIsUsingCachedData] = useState(false);
  
  

    const loadData = async () => {
    setLoading(true);
    try {
      const targetVillage = user?.role === 'admin' ? selectedVillageId : undefined;
      const cacheKeyOverview = `analytics_overview_${targetVillage}`;
      const cacheKeyVillage = `analytics_villageData`;
      
      try {
        const res = await analyticsApi.getOverview(targetVillage);
        setOverview(res.data);
        setScopeName(res.scope.village_name);
        await setCache(cacheKeyOverview, res);
        setIsUsingCachedData(false);
        
        if (user?.role === 'admin') {
          const vRes = await analyticsApi.getByVillage();
          setVillageData(vRes.data);
          await setCache(cacheKeyVillage, vRes.data);
        }
      } catch (err: any) {
        if (err.message === 'Network Error' || (err.response && err.response.status >= 500)) {
          const cachedRes = await getCache<any>(cacheKeyOverview);
          if (cachedRes) {
            setOverview(cachedRes.data);
            setScopeName(cachedRes.scope.village_name);
            setIsUsingCachedData(true);
          }
          if (user?.role === 'admin') {
            const cachedV = await getCache<VillageAnalytics[]>(cacheKeyVillage);
            if (cachedV) setVillageData(cachedV);
          }
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error('Fetch analytics error:', err);
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
      <div className="py-24 text-center text-slate-400 dark:text-slate-500">
        <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
        <div className="text-base font-bold text-slate-700 dark:text-slate-200">Đang tổng hợp 25 chỉ số Nông thôn mới...</div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Đồng bộ số liệu diện tích và đàn vật nuôi xã Đăk Hà</p>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="py-16 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-sm">
        Chưa có số liệu thống kê. Vui lòng nhập dữ liệu hộ nông nghiệp.
      </div>
    );
  }


  
  const handleExportComparisonExcel = async () => {
    try {
      const token = await secureStorage.getItem('accessToken');
      if (!token) {
        alert('Phiên đăng nhập đã hết hạn.');
        return;
      }

      const response = await fetch('http://localhost:5001/api/analytics/export-comparison', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Lỗi khi xuất dữ liệu Excel');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BangSoSanhCacThon_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert('Không thể tải file Excel. Vui lòng kiểm tra kết nối.');
    }
  };

  const crops = overview.crops;

  const livestock = overview.livestock;
  const aqua = overview.aquaculture;

  return (
    <div className="space-y-6">
      {/* Top Banner & Filter */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-150">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
              {scopeName}
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                {isUsingCachedData && <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full border border-amber-200">⚡ Ngoại tuyến</span>}
              <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <span>Thống Kê</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Hệ thống 25 chỉ số thống kê diện tích cây trồng, tổng đàn vật nuôi và diện tích thủy sản
          </p>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'admin' && (
            <button
              type="button"
              onClick={() => setActiveTab('villages')}
              className="h-10 flex items-center gap-1.5 px-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all active:scale-[0.99] cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Quay lại danh sách thôn</span>
            </button>
          )}

          <button
            type="button"
            onClick={loadData}
            aria-label="Làm mới số liệu"
            className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Hộ Nông Nghiệp */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/60 dark:border-indigo-800/60">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Tổng số hộ
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
              {cryptoHelper.formatCount(overview.household_count, 'hộ')}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Đã kê khai trong CSDL</div>
          </div>
        </div>

        {/* Card 2: Tổng Diện Tích Cây Trồng */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800/60">
            <Trees className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Tổng cây trồng
            </div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums mt-0.5">
              {cryptoHelper.formatArea(crops.total_crops_area)}
            </div>
            <div className="text-xs text-emerald-700 dark:text-emerald-300 font-bold mt-0.5">
              12 chỉ tiêu diện tích
            </div>
          </div>
        </div>

        {/* Card 3: Tổng Đàn Vật Nuôi */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-800/60">
            <Dog className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Tổng đàn vật nuôi
            </div>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono tabular-nums mt-0.5">
              {cryptoHelper.formatCount(livestock.total_animals, 'con')}
            </div>
            <div className="text-xs text-amber-700 dark:text-amber-300 font-bold mt-0.5">
              4 loại gia súc, gia cầm
            </div>
          </div>
        </div>

        {/* Card 4: Thủy Sản */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-200/60 dark:border-sky-800/60">
            <Fish className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Thủy sản
            </div>
            <div className="text-3xl font-black text-sky-600 dark:text-sky-400 font-mono tabular-nums mt-0.5">
              {cryptoHelper.formatArea(aqua.fish_pond)}
            </div>
            <div className="text-xs text-sky-700 dark:text-sky-300 font-bold mt-0.5">
              + {cryptoHelper.formatCount(aqua.fish_cage, 'lồng')}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: CÂY TRỒNG (12 Chỉ Số) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Trees className="w-4.5 h-4.5" />
          </div>
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
            1. Cơ Cấu Cây Trồng (Tổng: {cryptoHelper.formatArea(crops.total_crops_area)})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cà phê Donut Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Cà Phê (Tổng Diện Tích)</h4>
              </div>
              <span className="text-sm font-black font-mono tabular-nums px-3 py-1 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-xl border border-amber-200 dark:border-amber-800">
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
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Cao Su (Tổng Diện Tích)</h4>
              </div>
              <span className="text-sm font-black font-mono tabular-nums px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800">
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
          <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors duration-150">
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Cây ăn quả
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
              {cryptoHelper.formatArea(crops.fruit_tree)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sầu riêng, mít, bơ, cam...</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors duration-150">
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Cây Mắc Ca
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
              {cryptoHelper.formatArea(crops.macadamia)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cây công nghiệp giá trị cao</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors duration-150">
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Lúa nước
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
              {cryptoHelper.formatArea(crops.wet_rice)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lúa 2 vụ / 1 vụ</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors duration-150">
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Cây hàng năm khác
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
              {cryptoHelper.formatArea(crops.other_annual_crops)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ngô, sắn, khoai, hoa màu</p>
          </div>
        </div>

        {/* Dược Liệu Breakdown Box */}
        <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-base text-slate-900 dark:text-white">
                  Cây Dược Liệu Đăk Hà (4 Loại Con)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cây trồng bản địa dược liệu thuộc đề án phát triển NTM xã Đăk Hà
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-teal-700 dark:text-teal-400 uppercase font-bold tracking-wider block">
                Tổng diện tích dược liệu
              </span>
              <span className="text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400 font-mono tabular-nums">
                {cryptoHelper.formatArea(crops.total_herb_area)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Đinh lăng</div>
              <div className="text-xl font-black font-mono tabular-nums mt-1 text-slate-900 dark:text-white">
                {cryptoHelper.formatArea(crops.herb_dinh_lang)}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Gừng</div>
              <div className="text-xl font-black font-mono tabular-nums mt-1 text-slate-900 dark:text-white">
                {cryptoHelper.formatArea(crops.herb_gung)}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Nghệ</div>
              <div className="text-xl font-black font-mono tabular-nums mt-1 text-slate-900 dark:text-white">
                {cryptoHelper.formatArea(crops.herb_nghe)}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Sả</div>
              <div className="text-xl font-black font-mono tabular-nums mt-1 text-slate-900 dark:text-white">
                {cryptoHelper.formatArea(crops.herb_sa)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2 & 3: VẬT NUÔI & THỦY SẢN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Vật nuôi (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                <Dog className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                2. Tổng Đàn Vật Nuôi ({cryptoHelper.formatCount(livestock.total_animals, 'con')})
              </h3>
            </div>
          </div>

          {/* Cattle Summary Box */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Tổng Đàn Trâu Bò (Gia súc lớn):</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Trâu: {livestock.buffalo} con • Bò: {livestock.cow} con</p>
            </div>
            <span className="text-lg font-black font-mono tabular-nums text-amber-700 dark:text-amber-400">
              {cryptoHelper.formatCount(livestock.total_cattle, 'con')}
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
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
              colorClass="bg-amber-600"
              unit="con"
            />
            <ProgressBar
              label="Đàn Trâu"
              value={livestock.buffalo}
              max={livestock.total_animals}
              colorClass="bg-slate-600"
              unit="con"
            />
          </div>
        </div>

        {/* Thủy sản (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between transition-colors duration-150">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                <Fish className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">3. Nuôi Trồng Thủy Sản</h3>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/90 dark:border-slate-800">
                <div className="text-xs font-bold text-sky-700 dark:text-sky-400">Nuôi Cá Ao Hồ (Diện tích)</div>
                <div className="text-2xl font-black font-mono tabular-nums text-sky-700 dark:text-sky-400 mt-1">
                  {cryptoHelper.formatArea(aqua.fish_pond)}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Mặt nước nuôi thả cá truyền thống</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/90 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Nuôi Cá Lồng Bè (Số lồng)</div>
                <div className="text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white mt-1">
                  {cryptoHelper.formatCount(aqua.fish_cage, 'lồng')}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lồng nuôi cá trên lòng hồ thủy điện</p>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl text-xs text-slate-500 dark:text-slate-400 italic border border-slate-200/90 dark:border-slate-800">
            * Số liệu được cập nhật theo thời gian thực từ CSDL.
          </div>
        </div>
      </div>

      {/* SECTION 4: BẢNG SO SÁNH GIỮA CÁC THÔN (Admin) */}
      {user?.role === 'admin' && !selectedVillageId && villageData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden space-y-3 p-5 transition-colors duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center">
                <Building2 className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  4. Bảng so sánh số liệu các thôn
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">So sánh 25 chỉ tiêu nông thôn mới</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleExportComparisonExcel}
              className="px-3 py-1.5 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors border border-emerald-200 dark:border-emerald-800 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Excel</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-black uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-3">Tên Thôn</th>
                  <th className="py-3 px-3 text-center">Số Hộ</th>
                  <th className="py-3 px-3 text-right">Cà Phê (ha)</th>
                  <th className="py-3 px-3 text-right">Cao Su (ha)</th>
                  <th className="py-3 px-3 text-right">Cây Ăn Quả</th>
                  <th className="py-3 px-3 text-right">Dược Liệu</th>
                  <th className="py-3 px-3 text-right">Tổng Cây (ha)</th>
                  <th className="py-3 px-3 text-right">Trâu Bò (con)</th>
                  <th className="py-3 px-3 text-right">Heo (con)</th>
                  <th className="py-3 px-3 text-right">Gia Cầm (con)</th>
                  <th className="py-3 px-3 text-right">Cá Ao (ha)</th>
                  <th className="py-3 px-3 text-right">Cá Lồng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-semibold text-slate-700 dark:text-slate-300 text-xs">
                {villageData.map((v) => (
                  <tr key={v.village_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100 text-[13.5px]">{v.village_name}</td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums font-bold text-indigo-600 dark:text-indigo-400 text-sm">{v.household_count}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">{cryptoHelper.formatArea(v.crops.total_cafe)}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">{cryptoHelper.formatArea(v.crops.total_rubber)}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">{cryptoHelper.formatArea(v.crops.fruit_tree)}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">{cryptoHelper.formatArea(v.crops.total_herb_area)}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400 text-sm">
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
