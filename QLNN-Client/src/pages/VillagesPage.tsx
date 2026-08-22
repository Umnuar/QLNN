import React from 'react';
import { Map, MapPin } from 'lucide-react';
import { useApp } from '../AppContext';

export const VillagesPage: React.FC = () => {
  const { villages } = useApp();

  const villageColorMap: Record<string, string> = {
    'Thôn 1': 'border-blue-300 dark:border-blue-800/80 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
    'Thôn 2': 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
    'Thôn 3': 'border-purple-300 dark:border-purple-800/80 bg-purple-50/50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300',
    'Thôn 4': 'border-amber-300 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
    'Thôn 5': 'border-rose-300 dark:border-rose-800/80 bg-rose-50/50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300',
    'Thôn Đăk Kđêm': 'border-indigo-300 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300',
    'Thôn Kon Bơ Bắn': 'border-teal-300 dark:border-teal-800/80 bg-teal-50/50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors duration-150">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Map className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <span>Danh Mục Các Thôn Xã Đăk Hà</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Danh mục 7 đơn vị hành chính đồng bộ trực tiếp từ CSDL tập trung Đăk Hà
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {villages.map((v) => {
          const colorClass = villageColorMap[v.name] || 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300';

          return (
            <div
              key={v.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all"
            >
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${colorClass}`}>
                <MapPin className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-black text-slate-900 dark:text-white truncate">{v.name}</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">Mã: {v.id.substring(0, 8)}...</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
