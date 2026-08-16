import React from 'react';
import { Map, MapPin } from 'lucide-react';
import { useApp } from '../AppContext';

export const VillagesPage: React.FC = () => {
  const { villages } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Map className="w-6 h-6 text-emerald-600" />
          Danh Mục Các Thôn Xã Đăk Hà
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Danh mục hành chính đồng bộ trực tiếp từ CSDL tập trung Đăk Hà
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {villages.map((v) => (
          <div key={v.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">{v.name}</h4>
              <p className="text-[11px] text-slate-400 font-mono">{v.id.substring(0, 8)}...</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
