import React from 'react';
import { BarChart3, Sprout, ShieldCheck } from 'lucide-react';
import { useApp } from '../AppContext';

export const AnalyticsPage: React.FC = () => {
  const { user, selectedVillageName } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            Thống Kê Nông Thôn Mới & Nông Nghiệp
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tổng hợp 25 chỉ tiêu cây trồng, đàn gia súc/gia cầm và nuôi trồng thủy sản theo chuẩn NTM xã Đăk Hà
          </p>
        </div>
        <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
          Phạm vi: {selectedVillageName || (user?.role === 'admin' ? 'Toàn xã' : '')}
        </div>
      </div>

      {/* Frame placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-600" />
            Cây Trồng (ha)
          </div>
          <div className="text-2xl font-black text-slate-800">18.000 ha</div>
          <div className="text-xs text-slate-500 mt-1">Tổng diện tích các loại cây trồng</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Đàn Vật Nuôi (con)
          </div>
          <div className="text-2xl font-black text-slate-800">302 con</div>
          <div className="text-xs text-slate-500 mt-1">Tổng đàn trâu, bò, heo, gia cầm</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            Thủy Sản
          </div>
          <div className="text-2xl font-black text-slate-800">0.7 ha / 4 lồng</div>
          <div className="text-xs text-slate-500 mt-1">Nuôi cá ao & cá lồng bè lòng hồ</div>
        </div>
      </div>
    </div>
  );
};
